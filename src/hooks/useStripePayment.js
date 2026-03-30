import { useState, useEffect, useCallback } from "react";

// Base URL for API calls.
// In dev: leave VITE_API_BASE_URL empty — Vite proxy forwards /api → localhost:4242
// In prod: set VITE_API_BASE_URL=https://api.whispycv.cz (no trailing slash)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// sessionStorage key — only stores true/false, no payment data
const PAID_KEY = "whispy_cv_paid";

export function useStripePayment() {
  // isPaid starts as FALSE every time — only becomes true after server verification
  // in this session. sessionStorage is only used to survive the Stripe redirect,
  // not to grant permanent paid access across fresh page loads.
  const [isPaid,       setIsPaid]       = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState(null);
  const [wasCancelled, setWasCancelled] = useState(false);

  // Keep sessionStorage in sync whenever isPaid changes
  useEffect(() => {
    if (isPaid) sessionStorage.setItem(PAID_KEY, "true");
  }, [isPaid]);

  // ── On mount: handle Stripe redirect-back ─────────────────────────────────
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const payment   = params.get("payment");
    const sessionId = params.get("session_id");

    // No redirect params — check if we already verified this session
    // (handles the case where the page is refreshed after a successful payment
    //  within the same browser session, e.g. user hits F5 after being redirected back)
    if (!payment) {
      if (sessionStorage.getItem(PAID_KEY) === "true") {
        setIsPaid(true);
      }
      return;
    }

    // Clean URL immediately — prevents re-trigger on hard refresh
    window.history.replaceState({}, "", window.location.pathname);

    if (payment === "cancelled") {
      setWasCancelled(true);
      return;
    }

    if (payment === "success" && sessionId) {
      setIsLoading(true);
      fetch(`${API_BASE}/api/verify-session?session_id=${sessionId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.paid) {
            setIsPaid(true);
          } else {
            console.error("[Stripe] verify-session returned paid=false:", data);
            setError("Platbu se nepodařilo ověřit. Zkuste to prosím znovu.");
          }
        })
        .catch((err) => {
          console.error("[Stripe] verify-session fetch failed:", err);
          setError("Chyba při ověřování platby. Zkuste to prosím znovu.");
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  // ── Initiate payment: POST /api/create-checkout-session ───────────────────
  const initiatePayment = useCallback(async () => {
    setError(null);
    setWasCancelled(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.details || data.error || `Server error ${res.status}`;
        console.error("[Stripe] create-checkout-session error:", data);
        throw new Error(message);
      }

      const { url } = data;

      if (!url) {
        console.error("[Stripe] Response missing url:", data);
        throw new Error("Neplatná odpověď serveru — chybí URL.");
      }

      // Hand off to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error("[Stripe] initiatePayment failed:", err);
      setError(err.message || "Platbu se nepodařilo spustit. Zkuste to znovu.");
      setIsLoading(false);
    }
  }, []);

  const clearStatus = useCallback(() => {
    setError(null);
    setWasCancelled(false);
  }, []);

  return { isPaid, isLoading, error, wasCancelled, initiatePayment, clearStatus };
}
