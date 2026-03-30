import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import express from "express";
import cors from "cors";
import Stripe from "stripe";

// ─── Load server/.env explicitly ──────────────────────────────────────────────
// Works correctly no matter which directory you run `node` from.
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, ".env") });

// ─── Startup diagnostics — never print secret values ──────────────────────────
const PORT = process.env.PORT || 4242;
console.log("──────────────────────────────────────────");
console.log(`🚀  Whispy CV server starting on port ${PORT}`);
console.log(`    STRIPE_SECRET_KEY set : ${!!process.env.STRIPE_SECRET_KEY}`);
console.log(`    STRIPE_PRICE_ID set   : ${!!process.env.STRIPE_PRICE_ID}`);
console.log("──────────────────────────────────────────");

// ─── Stripe guard + initialisation ───────────────────────────────────────────
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY — add it to server/.env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// ─── Raw body needed for webhook signature verification ───────────────────────
app.use("/api/webhook", express.raw({ type: "application/json" }));

// ─── JSON + CORS for all other routes ────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
}));

// ─── POST /api/create-checkout-session ───────────────────────────────────────
app.post("/api/create-checkout-session", async (req, res) => {
  const priceId    = process.env.STRIPE_PRICE_ID;
  const successUrl = process.env.STRIPE_SUCCESS_URL;
  const cancelUrl  = process.env.STRIPE_CANCEL_URL;

  if (!priceId || !successUrl || !cancelUrl) {
    console.error("❌  Missing env vars:", {
      STRIPE_PRICE_ID:    !!priceId,
      STRIPE_SUCCESS_URL: !!successUrl,
      STRIPE_CANCEL_URL:  !!cancelUrl,
    });
    return res.status(500).json({
      error:   "Stripe checkout session creation failed",
      details: "Server misconfiguration — check STRIPE_PRICE_ID, STRIPE_SUCCESS_URL and STRIPE_CANCEL_URL in server/.env",
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // {CHECKOUT_SESSION_ID} is a Stripe template literal — do not change it
      success_url: successUrl,
      cancel_url:  cancelUrl,
    });

    console.log(`🛒  Checkout session created: ${session.id}`);
    res.json({ url: session.url });
  } catch (error) {
    console.error("❌  Stripe checkout error:", error.message);
    res.status(500).json({
      error:   "Stripe checkout session creation failed",
      details: error.message,
    });
  }
});

// ─── GET /api/verify-session ──────────────────────────────────────────────────
//
// Called by the frontend after Stripe redirects back.
// Confirms payment server-side — never trust the URL param alone.
app.get("/api/verify-session", async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ paid: false, error: "Chybí session_id." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid    = session.payment_status === "paid";
    console.log(`🔍  Verify session ${session_id}: payment_status=${session.payment_status}`);
    res.json({ paid });
  } catch (err) {
    console.error("❌  Stripe verify error:", err.message);
    res.status(400).json({ paid: false, error: err.message });
  }
});

// ─── POST /api/webhook ────────────────────────────────────────────────────────
//
// Optional — useful for server-side actions (receipts, DB) after payment.
// To test locally: stripe listen --forward-to localhost:4242/api/webhook
app.post("/api/webhook", (req, res) => {
  const sig            = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    // Webhook secret not configured — skip in dev, log a reminder
    console.warn("⚠️   STRIPE_WEBHOOK_SECRET not set — skipping signature verification.");
    return res.json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌  Webhook signature error:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log(`✅  Payment confirmed via webhook — session ${session.id}`);
    // TODO: send email receipt, mark order in DB, etc.
  }

  res.json({ received: true });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Listening on http://localhost:${PORT}`);
});
