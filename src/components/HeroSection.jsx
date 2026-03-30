import React from "react";

function HeroSection({ scrollToBuilder }) {
  return (
    <section style={{ display: "flex", gap: 40, alignItems: "center", margin: "48px 0" }}>
      <div style={{ flex: 1 }}>
        <p style={{ display: "inline-block", padding: "8px 14px", borderRadius: 999, background: "#ececff", color: "#4f46e5", fontSize: 14, fontWeight: "bold", marginBottom: 20 }}>
          Jednoduchý tvůrce životopisů
        </p>
        <h1 style={{ fontSize: 36, margin: "0 0 20px 0" }}>
          Vytvořte si profesionální životopis během pár minut
        </h1>
        <p style={{ fontSize: 16, color: "#555", marginBottom: 32, maxWidth: 480 }}>
          Whispy CV vám pomůže vytvořit čistý, moderní životopis bez stresu, zmatku nebo nevzhledných šablon.
        </p>
        <button onClick={scrollToBuilder} style={{ padding: "12px 22px", borderRadius: 10, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: "bold", marginRight: 12 }}>
          Vytvořit životopis
        </button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ padding: "12px 22px", borderRadius: 10, border: "1px solid #d1d5db", background: "#fff", color: "#111", cursor: "pointer", fontSize: 16, fontWeight: "bold" }}>
          Zobrazit ukázku
        </button>
      </div>
      {/* Example preview will be rendered by parent */}
      <div style={{ flex: 1 }}>
        {/* Placeholder for preview, parent should render CvPreview here if needed */}
      </div>
    </section>
  );
}

export default HeroSection;
