import React, { useRef, useState, useEffect } from "react";
import BuilderForm from "./components/BuilderForm";
import CvPreview from "./components/CvPreview";
import cvSample from "./data/cvSample";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useStripePayment } from "./hooks/useStripePayment";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const ACCENT   = "#111827";
const ACCENT2  = "#1e293b";   // slightly softer dark for secondary uses
const GRAY_BG  = "#f8f9fa";
const GRAY_BG2 = "#f1f3f5";
const BORDER   = "#e5e7eb";
const TEAL     = "#0ea5e9";   // accent highlight (unused by default — available for future use)

// ─── Shared UI primitives ──────────────────────────────────────────────────────
function Pill({ children, variant = "default" }) {
  // variant: "default" | "dark" | "success"
  const styles = {
    default: { bg: "#f1f3f5", border: `1px solid ${BORDER}`, color: "#4b5563" },
    dark:    { bg: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", color: "rgba(255,255,255,0.65)" },
    success: { bg: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" },
  };
  const s = styles[variant] || styles.default;
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 13px",
      borderRadius: 999,
      background: s.bg,
      border: s.border,
      color: s.color,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
}

function SectionHeading({ children, light = false, center = false }) {
  return (
    <h2 style={{
      fontSize: "clamp(26px, 4vw, 38px)",
      fontWeight: 800,
      color: light ? "#fff" : ACCENT,
      letterSpacing: "-0.6px",
      lineHeight: 1.15,
      margin: "12px 0 0",
      textAlign: center ? "center" : "left",
    }}>
      {children}
    </h2>
  );
}

function SectionSub({ children, light = false, center = false }) {
  return (
    <p style={{
      fontSize: 17,
      color: light ? "rgba(255,255,255,0.55)" : "#6b7280",
      lineHeight: 1.7,
      marginTop: 14,
      textAlign: center ? "center" : "left",
    }}>
      {children}
    </p>
  );
}

function SectionWrap({ children, bg = "#fff", style = {} }) {
  return (
    <section style={{ background: bg, padding: "80px 24px", ...style }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {children}
      </div>
    </section>
  );
}

// ─── 1. Hero ──────────────────────────────────────────────────────────────────
function HeroSection({ scrollToBuilder }) {
  const [hovered, setHovered] = useState(false);
  return (
    <section style={{ background: "#fff", padding: "0 24px", overflow: "hidden", borderBottom: `1px solid ${BORDER}` }}>
      <div
        className="hero-two-col"
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "flex",
          alignItems: "flex-end",
          gap: 64,
          paddingTop: 72,
        }}
      >
        {/* ── Left column ── */}
        <div style={{ flex: "1 1 480px", paddingBottom: 80, minWidth: 0 }}>
          <Pill variant="default">Zdarma · Bez registrace · Export do PDF</Pill>

          <h1 style={{
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 900,
            color: ACCENT,
            letterSpacing: "-1.4px",
            lineHeight: 1.07,
            margin: "20px 0 0",
          }}>
            Profesionální<br />životopis za&nbsp;
            <span style={{ color: "#9ca3af" }}>2 minuty</span>
          </h1>

          <p style={{
            fontSize: "clamp(15px, 1.7vw, 17px)",
            color: "#6b7280",
            lineHeight: 1.75,
            margin: "20px 0 0",
            maxWidth: 420,
          }}>
            Moderní, přehledný životopis bez složitého formátování.
            Vyplňte pár polí — hotový PDF stáhnete jedním kliknutím.
          </p>

          <div className="hero-cta-group" style={{ marginTop: 36, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
            <button
              onClick={scrollToBuilder}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                padding: "14px 32px",
                borderRadius: 10,
                border: "none",
                background: ACCENT,
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "-0.2px",
                cursor: "pointer",
                boxShadow: hovered
                  ? "0 8px 32px rgba(17,24,39,0.28)"
                  : "0 3px 12px rgba(17,24,39,0.14)",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
                transition: "all 0.16s ease",
              }}
            >
              Vytvořit životopis →
            </button>
            <p style={{ fontSize: 12, color: "#9ca3af", letterSpacing: 0.2, margin: 0 }}>
              Bez registrace&nbsp;·&nbsp;Hotovo za 2 minuty
            </p>
          </div>

          {/* Trust signals row */}
          <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
            {["🔒 Žádná registrace", "📭 Data zůstávají v prohlížeči", "⚡ Živý náhled"].map(t => (
              <span key={t} style={{ fontSize: 12.5, color: "#9ca3af", fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* ── Right column — preview mockup, hidden on mobile ── */}
        <div
          className="hero-preview-col"
          style={{ flex: "0 0 auto", alignSelf: "flex-end", position: "relative" }}
        >
          {/* Fade-out gradient so the preview "flows" into the page */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 50%, #fff 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }} />
          {/* Subtle frame */}
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "12px 12px 0 0",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 20px 60px rgba(0,0,0,0.10)",
            zIndex: 3,
            pointerEvents: "none",
          }} />
          <div style={{
            transform: "scale(0.58)",
            transformOrigin: "bottom center",
            marginBottom: `calc(${Math.round(500 * (297 / 210) * 0.58)}px - ${Math.round(500 * (297 / 210))}px)`,
            position: "relative",
            zIndex: 1,
          }}>
            <CvPreview form={cvSample} isPaid={true} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. Social proof bar ──────────────────────────────────────────────────────
function ProofBar() {
  const items = [
    "🔒 Žádná registrace",
    "📭 Neukládáme data",
    "🇨🇿 Plně v češtině",
    "⚡ Funguje v prohlížeči",
    "💳 Platba jen za čistý PDF",
  ];
  return (
    <div style={{
      background: GRAY_BG,
      borderBottom: `1px solid ${BORDER}`,
      padding: "13px 24px",
    }}>
      <div style={{
        maxWidth: 1080,
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "6px 32px",
      }}>
        {items.map(t => (
          <span key={t} style={{ fontSize: 12.5, fontWeight: 500, color: "#9ca3af", whiteSpace: "nowrap" }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Benefits ─────────────────────────────────────────────────────────────
const BENEFITS = [
  { icon: "⚡", title: "Živý náhled", desc: "Každá změna se okamžitě promítne do profesionálního náhledu." },
  { icon: "🎨", title: "Profesionální design", desc: "Šablona vypadá jako placené Canva nebo Novoresume." },
  { icon: "📄", title: "Export do PDF", desc: "Stáhněte životopis jedním kliknutím — přesně jak ho vidíte." },
  { icon: "🔒", title: "Bez registrace", desc: "Žádné e-maily, žádné heslo. Prostě otevřete a vyplníte." },
  { icon: "🌍", title: "Plně v češtině", desc: "Celý nástroj přeložen a optimalizován pro český trh práce." },
  { icon: "💸", title: "Zdarma nebo 49 Kč", desc: "Zdarma s vodoznakem, nebo za 49 Kč čistý PDF bez značek." },
];

function BenefitsSection() {
  const [hovered, setHovered] = useState(null);
  return (
    <SectionWrap bg="#fff">
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <Pill>Proč Whispy CV?</Pill>
        <SectionHeading center>Vše, co potřebujete k&nbsp;úspěšné přihlášce</SectionHeading>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SectionSub center>Žádné kompromisy. Žádná složitost. Jen výsledek, na který budete pyšní.</SectionSub>
        </div>
      </div>

      <div
        className="benefits-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
      >
        {BENEFITS.map((b, i) => (
          <div
            key={b.title}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: "18px 16px",
              borderRadius: 12,
              border: `1.5px solid ${hovered === i ? "#d1d5db" : BORDER}`,
              background: hovered === i ? GRAY_BG : "#fff",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              transition: "all 0.15s ease",
              cursor: "default",
            }}
          >
            <div style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: 9,
              background: GRAY_BG2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              border: `1px solid ${BORDER}`,
            }}>
              {b.icon}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: ACCENT, margin: "0 0 4px" }}>{b.title}</p>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55, margin: 0 }}>{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrap>
  );
}

// ─── 4. How it works ─────────────────────────────────────────────────────────
const STEPS = [
  { num: "1", icon: "✏️", title: "Vyplňte své údaje", desc: "Přehledný formulář zvládnete za pár minut. Žádná registrace.", tag: "Žádná registrace" },
  { num: "2", icon: "👁️", title: "Sledujte okamžitý náhled", desc: "Každá změna se ihned promítne do profesionálního náhledu životopisu.", tag: "Živý náhled" },
  { num: "3", icon: "📥", title: "Stáhněte hotový PDF", desc: "Jedním kliknutím. Zdarma s vodoznakem, nebo za 49 Kč bez.", tag: "Export do PDF" },
];

function HowItWorksSection() {
  const [hovered, setHovered] = useState(null);
  return (
    <SectionWrap bg={GRAY_BG}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <Pill>Jak to funguje</Pill>
        <SectionHeading center>Tři kroky k hotovému životopisu</SectionHeading>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SectionSub center>
            Nepotřebujete žádný účet, žádné platební údaje ani grafický software.
          </SectionSub>
        </div>
      </div>

      <div
        className="steps-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, position: "relative" }}
      >
        <div
          className="steps-connector"
          style={{ position: "absolute", top: 30, left: "calc(16.66% + 16px)", right: "calc(16.66% + 16px)", height: 1, background: BORDER, zIndex: 0 }}
        />
        {STEPS.map((s, i) => (
          <div
            key={s.num}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              textAlign: "center", padding: "0 28px", position: "relative", zIndex: 1, cursor: "default",
            }}
          >
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: hovered === i ? ACCENT : "#fff",
              border: hovered === i ? `2px solid ${ACCENT}` : `2px solid ${BORDER}`,
              boxShadow: hovered === i ? "0 6px 20px rgba(0,0,0,0.16)" : "0 2px 8px rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 22, transition: "all 0.18s ease", position: "relative", zIndex: 2,
            }}>
              <span style={{ fontSize: 22, filter: hovered === i ? "brightness(10)" : "none", transition: "filter 0.18s ease" }}>
                {s.icon}
              </span>
            </div>
            <span style={{
              display: "inline-block", padding: "3px 10px", borderRadius: 999,
              background: hovered === i ? "#e5e7eb" : "#e9ecef",
              color: hovered === i ? ACCENT : "#6b7280",
              fontSize: 10, fontWeight: 700, letterSpacing: 0.6, marginBottom: 12,
              textTransform: "uppercase", transition: "all 0.18s ease",
            }}>
              {s.tag}
            </span>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: ACCENT, margin: "0 0 10px", letterSpacing: "-0.3px" }}>
              {s.title}
            </h3>
            <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.65, margin: 0, maxWidth: 240 }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 52, paddingTop: 36, borderTop: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 13.5, color: "#9ca3af", margin: 0 }}>
          ⏱&nbsp;Průměrná doba vyplnění:&nbsp;
          <strong style={{ color: ACCENT }}>méně než 3 minuty</strong>
        </p>
      </div>
    </SectionWrap>
  );
}

// ─── 5. Pricing / Free vs Premium ────────────────────────────────────────────
function PricingSection({ scrollToBuilder }) {
  const [hovered, setHovered] = useState(false);

  const freeFeatures = [
    "Plný přístup k editoru",
    "Živý náhled v reálném čase",
    "PDF export (s vodoznakem)",
    "Všechny sekce životopisu",
  ];
  const paidFeatures = [
    "Vše ze zdarma verze",
    "PDF bez jakéhokoliv vodoznaku",
    "Čistý, profesionální výstup",
    "Připraveno k okamžitému odeslání",
  ];

  return (
    <SectionWrap bg="#fff" style={{ padding: "88px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <Pill>Ceník</Pill>
        <SectionHeading center>Jednoduché ceny. Bez překvapení.</SectionHeading>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SectionSub center>Vyzkoušejte zdarma. Zaplaťte jen pokud jste spokojeni.</SectionSub>
        </div>
      </div>

      <div
        className="pricing-two-col"
        style={{ display: "flex", gap: 16, maxWidth: 680, margin: "0 auto", alignItems: "stretch" }}
      >
        {/* Free card */}
        <div style={{
          flex: 1, padding: "28px 24px", borderRadius: 14,
          border: `1.5px solid ${BORDER}`, background: GRAY_BG,
          display: "flex", flexDirection: "column",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.8, textTransform: "uppercase", margin: "0 0 10px" }}>Zdarma</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: ACCENT, letterSpacing: "-1px", margin: "0 0 2px" }}>0 Kč</p>
          <p style={{ fontSize: 12.5, color: "#9ca3af", margin: "0 0 24px" }}>Bez platební karty</p>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
            {freeFeatures.map(f => (
              <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <span style={{ color: "#d1d5db", fontSize: 14, marginTop: 1, flexShrink: 0 }}>—</span>
                <span style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={scrollToBuilder}
            style={{
              padding: "11px 0", borderRadius: 8, border: `1.5px solid ${BORDER}`,
              background: "#fff", color: ACCENT, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              transition: "border-color 0.15s, background 0.15s",
              fontFamily: "inherit",
            }}
          >
            Začít zdarma
          </button>
        </div>

        {/* Premium card — lighter charcoal instead of pure black */}
        <div style={{
          flex: 1, padding: "28px 24px", borderRadius: 14,
          border: `2px solid #1e293b`,
          background: "#1e293b",
          display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
        }}>
          {/* Recommended badge */}
          <div style={{
            position: "absolute", top: 14, right: 14,
            padding: "3px 9px", borderRadius: 999,
            background: "rgba(255,255,255,0.12)",
            fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 0.6,
          }}>
            DOPORUČENO
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: 0.8, textTransform: "uppercase", margin: "0 0 10px" }}>Premium</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-1px", margin: "0 0 2px" }}>49 Kč</p>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.38)", margin: "0 0 24px" }}>Jednorázová platba</p>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
            {paidFeatures.map(f => (
              <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <span style={{ color: "#86efac", fontSize: 13, marginTop: 1, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={scrollToBuilder}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              padding: "11px 0", borderRadius: 8, border: "none",
              background: hovered ? "#f0f0f0" : "#fff",
              color: ACCENT, fontSize: 13.5, fontWeight: 800, cursor: "pointer",
              transition: "background 0.15s",
              fontFamily: "inherit",
            }}
          >
            Stáhnout bez vodoznaku →
          </button>
        </div>
      </div>
    </SectionWrap>
  );
}

// ─── 6. FAQ ───────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: "Je Whispy CV opravdu zdarma?", a: "Ano — editor, náhled a PDF export jsou zdarma. Za 49 Kč odstraníte vodoznak a dostanete čistý, profesionální PDF." },
  { q: "Musím se registrovat?", a: "Ne. Žádný účet, žádný e-mail. Otevřete stránku, vyplňte formulář a stáhněte PDF." },
  { q: "Jak probíhá platba?", a: "Platba probíhá přes Stripe — zabezpečenou platební bránu. Přijímáme karty Visa, Mastercard a další. Žádné předplatné." },
  { q: "Ukládáte moje osobní údaje?", a: "Ne. Vaše data zůstávají v prohlížeči. Neposíláme je na žádný server ani je neukládáme." },
  { q: "Bude životopis vypadat profesionálně?", a: "Ano. Šablona je navržena tak, aby vypadala jako placené nástroje (Canva, Novoresume, Zety) a prošla HR screeningem." },
  { q: "Mohu si životopis upravovat opakovaně?", a: "Ano. Váš formulář se ukládá lokálně v prohlížeči — při návratu na stránku najdete vše, jak jste zanechali." },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <SectionWrap bg={GRAY_BG}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <Pill>FAQ</Pill>
        <SectionHeading center>Časté otázky</SectionHeading>
      </div>
      <div
        className="faq-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, maxWidth: 800, margin: "0 auto" }}
      >
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              padding: "18px 20px", borderRadius: 12,
              border: `1.5px solid ${open === i ? "#9ca3af" : BORDER}`,
              background: open === i ? "#fff" : GRAY_BG,
              cursor: "pointer", transition: "all 0.16s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: ACCENT, margin: 0, lineHeight: 1.4 }}>{item.q}</p>
              <span style={{
                color: "#9ca3af", fontSize: 18, flexShrink: 0, marginTop: -1,
                transition: "transform 0.16s", transform: open === i ? "rotate(45deg)" : "none",
                display: "inline-block",
              }}>+</span>
            </div>
            {open === i && (
              <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.65, margin: "12px 0 0" }}>
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionWrap>
  );
}
// ─── localStorage helpers ─────────────────────────────────────────────────────
const FORM_KEY  = "whispy_cv_form";
const PHOTO_KEY = "whispy_cv_photo";

const EMPTY_FORM = {
  name: "", email: "", phone: "", city: "",
  profile: "", experience: "", education: "",
  skills: "", languages: "", courses: "", links: "",
};

function loadForm() {
  try {
    const raw = localStorage.getItem(FORM_KEY);
    if (!raw) return EMPTY_FORM;
    // Merge with EMPTY_FORM so new fields added later always exist
    return { ...EMPTY_FORM, ...JSON.parse(raw) };
  } catch {
    return EMPTY_FORM;
  }
}

function saveForm(form) {
  try { localStorage.setItem(FORM_KEY, JSON.stringify(form)); } catch { /* quota exceeded — ignore */ }
}

function loadPhoto() {
  try { return localStorage.getItem(PHOTO_KEY) || ""; } catch { return ""; }
}

function savePhoto(dataUrl) {
  try {
    if (dataUrl) localStorage.setItem(PHOTO_KEY, dataUrl);
    else         localStorage.removeItem(PHOTO_KEY);
  } catch {
    // Photo too large for localStorage quota — silently drop it.
    // The form and paid state are unaffected.
    localStorage.removeItem(PHOTO_KEY);
  }
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const builderRef = useRef(null);
  const cvRef      = useRef(null);

  // Restore form and photo from localStorage on first render
  const [form, setForm] = useState(loadForm);
  const [photoUrl, setPhotoUrl] = useState(loadPhoto);

  // ── Stripe payment state ──────────────────────────────────────────────────
  const {
    isPaid,
    isLoading: stripeLoading,
    error:     stripeError,
    wasCancelled,
    initiatePayment,
    clearStatus,
  } = useStripePayment();

  // Persist form to localStorage on every change
  const handleChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    saveForm(next);
  };

  // Apply a preset — replaces all fields; passing null clears back to empty
  const handlePreset = (data) => {
    const next = data ? { ...EMPTY_FORM, ...data } : EMPTY_FORM;
    setForm(next);
    saveForm(next);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoUrl(ev.target.result);
        savePhoto(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoUrl("");
      savePhoto("");
    }
  };

  const scrollToBuilder = () =>
    builderRef.current?.scrollIntoView({ behavior: "smooth" });

  // ── PDF export ─────────────────────────────────────────────────────────────
  // Captures each rendered .cv-page element individually so the output
  // matches the live preview exactly.
  const captureCvToPdf = async (withWatermark = false) => {
    const cvElement = cvRef.current;
    if (!cvElement) return null;

    const pages = Array.from(cvElement.querySelectorAll(".cv-page"));
    if (pages.length === 0) return null;

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // A4 dimensions in mm
    const PW = 210;
    const PH = 297;

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      if (i > 0) pdf.addPage();

      // ── CV content (rasterised page image) ──────────────────────────────
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, PW, PH);

      if (withWatermark) {
        // ── 1. Tiled diagonal grid — matches preview WatermarkGrid ─────────
        // 3 columns × 5 rows, brick-offset on even rows, same as React preview.
        const WM_COLS = 3;
        const WM_ROWS = 5;
        const colW = PW / WM_COLS;
        const rowH = PH / WM_ROWS;

        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.10 }));
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);

        for (let r = 0; r < WM_ROWS; r++) {
          for (let c = 0; c < WM_COLS; c++) {
            const xOff = r % 2 === 0 ? 0 : colW * 0.5;
            const cx = c * colW + colW / 2 + xOff;
            const cy = r * rowH + rowH / 2;
            pdf.text("WHISPY CV FREE VERSION", cx, cy, {
              align: "center",
              angle: 25,   // counter-clockwise in jsPDF = visually -25 deg
            });
          }
        }
        pdf.restoreGraphicsState();

        // ── 2. Horizontal band through the page centre ────────────────────
        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.05 }));
        pdf.setFillColor(0, 0, 0);
        pdf.rect(0, PH / 2 - 6.5, PW, 13, "F");
        pdf.restoreGraphicsState();

        // Band label
        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.22 }));
        pdf.setFontSize(6.5);
        pdf.setTextColor(0, 0, 0);
        pdf.text(
          "FREE VERSION  *  WHISPY CV  *  FREE VERSION  *  WHISPY CV  *  FREE VERSION  *  WHISPY CV  *  FREE VERSION",
          PW / 2, PH / 2 + 2.2,
          { align: "center" }
        );
        pdf.restoreGraphicsState();

        // ── 3. Footer strip — ASCII only, no diacritics ───────────────────
        pdf.setDrawColor(210, 210, 210);
        pdf.setLineWidth(0.2);
        pdf.line(12, PH - 8.5, PW - 12, PH - 8.5);

        pdf.setFontSize(6.5);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          "Created with Whispy CV  *  Download clean PDF at whispy.cz",
          PW / 2,
          PH - 4.5,
          { align: "center" }
        );
      }
    }

    return pdf;
  };

  // Free download — always adds watermark, no payment needed
  const handleDownloadFree = async () => {
    const pdf = await captureCvToPdf(true);
    pdf?.save("zivotopis.pdf");
  };

  // Paid download — only available after Stripe confirms payment
  const handleDownloadPaid = async () => {
    if (!isPaid) return;
    const pdf = await captureCvToPdf(false);
    pdf?.save("zivotopis.pdf");
  };

  // ── Auto-download after successful Stripe return ───────────────────────────
  // Fires once when isPaid first becomes true in this session.
  // sessionStorage flag prevents re-triggering on refresh.
  const AUTO_DL_KEY = "whispy_cv_auto_download_done";
  useEffect(() => {
    if (!isPaid) return;
    if (sessionStorage.getItem(AUTO_DL_KEY)) return;

    // Mark as done before the async work — prevents double-trigger
    sessionStorage.setItem(AUTO_DL_KEY, "true");

    // Small delay so the CV preview has time to fully render
    const timer = setTimeout(async () => {
      const pdf = await captureCvToPdf(false);
      pdf?.save("zivotopis.pdf");
    }, 800);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid]);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: ACCENT, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sticky Nav ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 200,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 32px",
        height: 58,
        borderBottom: `1px solid ${BORDER}`,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", color: ACCENT }}>
          Whispy CV
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className="nav-cta-text"
            style={{ fontSize: 12.5, color: "#9ca3af" }}
          >
            Zdarma · Bez registrace
          </span>
          <button
            onClick={scrollToBuilder}
            className="wcv-btn-primary"
            style={{
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: ACCENT, color: "#fff", cursor: "pointer",
              fontSize: 13, fontWeight: 700, letterSpacing: "-0.1px",
            }}
          >
            Vytvořit životopis →
          </button>
        </div>
      </header>

      {/* ── Sections ── */}
      <HeroSection scrollToBuilder={scrollToBuilder} />
      <ProofBar />
      <BenefitsSection />
      <HowItWorksSection />

      {/* ── Builder ── */}
      <section
        ref={builderRef}
        style={{ background: GRAY_BG, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "80px 24px" }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Pill>Tvůrce životopisu</Pill>
            <SectionHeading center>Vytvořte svůj životopis</SectionHeading>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SectionSub center>
                Vyplňte pole vlevo — náhled vpravo se aktualizuje živě.
              </SectionSub>
            </div>
          </div>

          {/* Builder card */}
          <div
            className="builder-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(300px, 340px) 1fr",
              gap: 0,
              background: "#fff",
              borderRadius: 16,
              border: `1.5px solid ${BORDER}`,
              boxShadow: "0 2px 24px rgba(0,0,0,0.05)",
              /* Do NOT set overflow:hidden here — it breaks position:sticky on the
                 preview column and clips the scrollable preview area.
                 Corner clipping is handled per-column via borderRadius instead. */
              overflow: "visible",
            }}
          >
            {/* ── Form column ── */}
            <div
              className="builder-form-col"
              style={{
                padding: "32px 28px",
                borderRight: `1px solid ${BORDER}`,
                overflowY: "auto",
                maxHeight: "calc(100vh - 100px)",
                background: "#fff",
                /* clip the top-left/bottom-left corners of the card */
                borderRadius: "14px 0 0 14px",
              }}
            >
              <BuilderForm
                form={form}
                handleChange={handleChange}
                onPhotoChange={handlePhotoChange}
                onPreset={handlePreset}
              />
            </div>

            {/* ── Preview column ── */}
            <div
              className="builder-preview-col"
              style={{
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: GRAY_BG,
                /* sticky so the preview tracks the user while they fill the form */
                position: "sticky",
                top: 58,           /* matches nav height */
                alignSelf: "flex-start",
                /* fixed viewport height → inner content scrolls naturally */
                maxHeight: "calc(100vh - 58px)",
                overflowY: "auto",
                overflowX: "hidden",
                /* clip the top-right/bottom-right corners of the card */
                borderRadius: "0 14px 14px 0",
              }}
            >
              {/* CV preview — ref used by html2canvas; must NOT have overflow:hidden */}
              <div
                ref={cvRef}
                style={{
                  /* let the CV render at its natural 560 px width;
                     the column scroll handles any overflow */
                  width: "100%",
                  /* subtle decorative shadow on the column wrapper, not on cvRef itself */
                  filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.09))",
                }}
              >
                <CvPreview form={form} isPaid={isPaid} photoUrl={photoUrl} />
              </div>

              {/* ── Download buttons ── */}
              <div style={{
                marginTop: 20,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}>
                {/* Status messages */}
                {wasCancelled && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 8,
                    background: "#fffbeb", border: "1px solid #fcd34d",
                    fontSize: 13, color: "#92400e",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span>Platba byla zrušena. Můžete to zkusit znovu.</span>
                    <button onClick={clearStatus} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>×</button>
                  </div>
                )}
                {stripeError && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 8,
                    background: "#fef2f2", border: "1px solid #fca5a5",
                    fontSize: 13, color: "#991b1b",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span>{stripeError}</span>
                    <button onClick={clearStatus} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>×</button>
                  </div>
                )}
                {isPaid && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 8,
                    background: "#f0fdf4", border: "1px solid #86efac",
                    fontSize: 13, color: "#166534", fontWeight: 600,
                  }}>
                    ✅ Platba proběhla úspěšně — stáhněte váš životopis níže.
                  </div>
                )}

                {/* Free download */}
                <button
                  type="button"
                  onClick={handleDownloadFree}
                  className="wcv-btn-ghost"
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    borderRadius: 8,
                    border: `1.5px solid ${BORDER}`,
                    background: "#fff",
                    color: "#374151",
                    fontWeight: 600,
                    fontSize: 13.5,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Stáhnout zdarma (s vodoznakem)
                </button>

                {/* Paid download */}
                {isPaid ? (
                  <button
                    type="button"
                    onClick={handleDownloadPaid}
                    className="wcv-btn-primary"
                    style={{
                      width: "100%",
                      padding: "12px 0",
                      borderRadius: 8,
                      border: "none",
                      background: "#16a34a",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 13.5,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    📥 Stáhnout PDF bez vodoznaku
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={initiatePayment}
                    disabled={stripeLoading}
                    className="wcv-btn-primary"
                    style={{
                      width: "100%",
                      padding: "12px 0",
                      borderRadius: 8,
                      border: "none",
                      background: stripeLoading ? "#9ca3af" : ACCENT,
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 13.5,
                      cursor: stripeLoading ? "not-allowed" : "pointer",
                      transition: "background 0.15s, opacity 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    {stripeLoading ? "Přesměrování na platbu…" : "Stáhnout bez vodoznaku – 49 Kč →"}
                  </button>
                )}

                <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", margin: "4px 0 0", lineHeight: 1.5 }}>
                  Jednorázová platba&nbsp;·&nbsp;Žádné předplatné&nbsp;·&nbsp;Zabezpečeno přes Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection scrollToBuilder={scrollToBuilder} />
      <FaqSection />

      {/* ── Footer ── */}
      <footer style={{
        background: GRAY_BG,
        padding: "44px 24px",
        borderTop: `1px solid ${BORDER}`,
      }}>
        <div style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px 32px",
        }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: ACCENT, margin: "0 0 3px" }}>Whispy CV</p>
            <p style={{ fontSize: 12.5, color: "#9ca3af" }}>
              © {new Date().getFullYear()} — Vytvořeno s ♥ v Česku
            </p>
          </div>
          <div
            className="footer-links"
            style={{ display: "flex", gap: 24, flexWrap: "wrap" }}
          >
            {["Zdarma", "49 Kč bez vodoznaku", "Bez registrace", "Připraveno pro HR"].map(t => (
              <span key={t} style={{ fontSize: 12.5, color: "#9ca3af" }}>{t}</span>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Sticky mobile CTA bar ── */}
      <div
        className="mobile-cta-bar"
        style={{
          display: "none",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 300,
          padding: "10px 14px",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: `1px solid ${BORDER}`,
          boxShadow: "0 -2px 16px rgba(0,0,0,0.06)",
          gap: 8,
        }}
      >
        <button
          onClick={handleDownloadFree}
          style={{
            flex: 1,
            padding: "12px 0",
            borderRadius: 8,
            border: `1.5px solid ${BORDER}`,
            background: "#fff",
            color: ACCENT,
            fontWeight: 700,
            fontSize: 13.5,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          PDF zdarma
        </button>
        <button
          onClick={isPaid ? handleDownloadPaid : initiatePayment}
          disabled={stripeLoading}
          className="wcv-btn-primary"
          style={{
            flex: 2,
            padding: "12px 0",
            borderRadius: 8,
            border: "none",
            background: isPaid ? "#16a34a" : ACCENT,
            color: "#fff",
            fontWeight: 800,
            fontSize: 13.5,
            cursor: stripeLoading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {isPaid ? "📥 Stáhnout čistý PDF" : "Bez vodoznaku – 49 Kč →"}
        </button>
      </div>
    </div>
  );
}

export default App;