import React from "react";

function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 48px",
        borderBottom: "1px solid #e5e5e5",
        background: "#fff",
      }}
    >
      <h2 style={{ margin: 0, fontWeight: 700, fontSize: 28, letterSpacing: -1 }}>Whispy CV</h2>
      <button
        style={{
          padding: "10px 18px",
          borderRadius: 10,
          border: "none",
          background: "#111",
          color: "#fff",
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        Začít zdarma
      </button>
    </header>
  );
}

export default Header;
