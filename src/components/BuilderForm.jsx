import React, { useState, useRef, useCallback } from "react";

// ─── Inject field focus/placeholder styles once ───────────────────────────────
const FIELD_CSS = `
  .wcv-field {
    width: 100%;
    padding: 9px 11px;
    border-radius: 7px;
    border: 1.5px solid #e5e7eb;
    background: #fafafa;
    color: #111827;
    font-size: 13px;
    line-height: 1.7;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
    font-family: inherit;
  }
  .wcv-field::placeholder {
    color: #c4c9d4;
  }
  .wcv-field:hover {
    border-color: #d1d5db;
  }
  .wcv-field:focus {
    border-color: #6b7280;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(107,114,128,0.10);
  }
  textarea.wcv-field {
    resize: vertical;
    min-height: 68px;
  }
  input[type="file"].wcv-file {
    width: 100%;
    font-size: 12.5px;
    color: #6b7280;
    padding: 7px 0;
    cursor: pointer;
  }
`;

if (typeof document !== "undefined" && !document.getElementById("wcv-field-styles")) {
  const tag = document.createElement("style");
  tag.id = "wcv-field-styles";
  tag.textContent = FIELD_CSS;
  document.head.appendChild(tag);
}

// ─── Preset data ──────────────────────────────────────────────────────────────
const PRESETS = {
  student: {
    label: "🎓 Student",
    data: {
      name:       "Tereza Horáková",
      email:      "tereza.horakova@email.cz",
      phone:      "+420 731 456 789",
      city:       "Brno",
      profile:    "Studentka **3. ročníku ekonomie** na Masarykově univerzitě. Hledám brigádu nebo stáž, kde mohu získat první pracovní zkušenosti a uplatnit znalosti z oboru.",
      experience: "Brigáda, Café Central, Brno (2023–dosud)\n- Obsluha zákazníků a správa pokladny\n- Příprava nápojů a péče o čistotu provozu\n\nDobrovolnice, Červený kříž Brno (2022)\n- Organizace charitativních sbírek\n- Komunikace s veřejností a koordinace dobrovolníků",
      education:  "Masarykova univerzita, Ekonomicko-správní fakulta\n**Bakalářský program:** Ekonomie a finance (2022–dosud)\n\nGymnázium Brno, Křenová\nMaturita s vyznamenáním (2022)",
      skills:     "Microsoft Office\nExcel\nKomunikace\nPráce v týmu\nOrganizace",
      languages:  "Angličtina (B2)\nNěmčina (A1)",
      courses:    "Google Digitální garáž — Základy digitálního marketingu (2023)",
      links:      "linkedin.com/in/tereza-horakova",
    },
  },
  junior: {
    label: "💻 Junior developer",
    data: {
      name:       "Marek Procházka",
      email:      "marek.prochazka@gmail.com",
      phone:      "+420 604 321 987",
      city:       "Praha",
      profile:    "**Junior frontend developer** se zaměřením na React a moderní JavaScript. Absolvoval jsem intenzivní bootcamp a hledám první pracovní příležitost v přátelském týmu, kde mohu dále růst.",
      experience: "Freelance, webový vývojář (2023–dosud)\n- Tvorba responzivních webů pro malé firmy (React, Tailwind CSS)\n- Dodání **5 projektů** v termínu s pozitivním hodnocením klientů\n\nStáž, Webstudio s.r.o., Praha (3 měsíce, 2023)\n- Vývoj UI komponent v Reactu\n- Code review a práce v Agile/Scrum týmu",
      education:  "Coding Bootcamp Praha\n**Full Stack JavaScript** (2022–2023)\n\nVysoká škola ekonomická, Praha\nBakalář: Informační management (2019–2022)",
      skills:     "React\nJavaScript (ES6+)\nHTML & CSS\nGit\nREST API\nTypeScript (základy)",
      languages:  "Angličtina (C1)\nNěmčina (A2)",
      courses:    "The Odin Project — Full Stack JavaScript\nUdemy: React – kompletní průvodce (2023)",
      links:      "github.com/marekprochazka\nlinkedin.com/in/marek-prochazka-dev",
    },
  },
  administrativa: {
    label: "📋 Administrativa",
    data: {
      name:       "Jana Kovářová",
      email:      "jana.kovarova@seznam.cz",
      phone:      "+420 777 654 321",
      city:       "Olomouc",
      profile:    "Zkušená **administrativní pracovnice** s 6 lety praxe v korporátním prostředí. Specializuji se na správu dokumentace, koordinaci schůzek a komunikaci s klienty. Hledám stabilní pozici v příjemném kolektivu.",
      experience: "Asistentka ředitele, Technip CZ a.s., Olomouc (2020–dosud)\n- Správa kalendáře a korespondence vedení\n- Organizace služebních cest a konferencí\n- Příprava reportů a interních prezentací\n\nAdministrativní pracovnice, MěÚ Olomouc (2018–2020)\n- Vedení spisové agendy a správa databází\n- Komunikace s občany a vyřizování podání",
      education:  "Obchodní akademie Olomouc\n**Maturita** — obor: Ekonomika a podnikání (2018)",
      skills:     "Microsoft Office 365\nSAP\nSpráva dokumentů\nOrganizace a plánování\nKomunikace\nDetail orientovaná",
      languages:  "Angličtina (B1)\nRuština (pasivní znalost)",
      courses:    "Kurz: Projektové řízení pro asistenty (2022)\nCertifikát: MS Excel pro pokročilé (2021)",
      links:      "linkedin.com/in/jana-kovarova",
    },
  },
};

// ─── Per-field example text inserted by the "Ukázka" button ──────────────────
const FIELD_EXAMPLES = {
  profile:    "Zkušený **projektový manažer** s 5 lety praxe v IT sektoru. Specializuji se na agilní metodiky a vedení týmů. Hledám příležitost, kde mohu přispět k růstu firmy.",
  experience: "Projektový manažer, Firma s.r.o., Praha (2021–dosud)\n- Vedení týmu 8 vývojářů na agile projektech\n- Zavedení procesů, které zkrátily dobu dodání o 30 %\n\nJunior PM, StartupXY, Brno (2019–2021)\n- Koordinace sprintů a komunikace se zákazníky",
  education:  "Česká zemědělská univerzita, Praha\n**Ing.** — Systémové inženýrství a informatika (2015–2020)\n\nGymnázium Jana Nerudy, Praha\nMaturita s vyznamenáním (2015)",
  skills:     "Projektové řízení\nAgile / Scrum\nMS Project\nKomunikace a prezentace\nAnglický jazyk (C1)",
  languages:  "Angličtina (C1 — aktivně)\nNěmčina (B1 — pasivně)",
  courses:    "PMI: Project Management Professional (PMP) — 2022\nCoursera: Agile with Atlassian Jira — 2021",
  links:      "linkedin.com/in/vas-profil\ngithub.com/vas-profil",
};

// ─── Preset selector ──────────────────────────────────────────────────────────
function PresetSelector({ onPreset }) {
  const [active, setActive] = useState(null);

  const handleSelect = (key) => {
    setActive(key);
    onPreset(PRESETS[key].data);
  };

  return (
    <div style={{
      marginBottom: 24,
      padding: "14px",
      borderRadius: 10,
      border: "1.5px solid #e5e7eb",
      background: "#f8f9fa",
    }}>
      <p style={{
        fontSize: 10.5, fontWeight: 700, color: "#9ca3af",
        letterSpacing: 0.8, textTransform: "uppercase", margin: "0 0 9px 0",
      }}>
        Rychlé předvyplnění
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(PRESETS).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSelect(key)}
            style={{
              padding: "5px 12px",
              borderRadius: 7,
              border: `1.5px solid ${active === key ? "#111827" : "#d1d5db"}`,
              background: active === key ? "#111827" : "#fff",
              color: active === key ? "#fff" : "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.14s ease",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
        {active && (
          <button
            type="button"
            onClick={() => { setActive(null); onPreset(null); }}
            style={{
              padding: "5px 12px",
              borderRadius: 7,
              border: "1.5px solid #e5e7eb",
              background: "transparent",
              color: "#9ca3af",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Vymazat
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Shared pill-button style ─────────────────────────────────────────────────
function PillBtn({ label, active, isExample, onMouseDown }) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      style={{
        padding: "3px 9px",
        borderRadius: 6,
        border: `1px solid ${active ? "#6b7280" : isExample ? "#bbf7d0" : "#e5e7eb"}`,
        background: active
          ? "#f1f5f9"
          : isExample
          ? "#f0fdf4"
          : "#fff",
        color: isExample ? "#15803d" : "#374151",
        fontSize: 11,
        fontWeight: isExample ? 700 : 500,
        lineHeight: 1.5,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background 0.1s, border-color 0.1s",
        whiteSpace: "nowrap",
        letterSpacing: 0.1,
      }}
    >
      {label}
    </button>
  );
}

// ─── Formatting toolbar ───────────────────────────────────────────────────────
function FormattingToolbar({ textareaRef, name, value, onChange, fieldName }) {
  const [active, setActive] = useState(null);

  // Fires a synthetic React-compatible change event on the textarea
  const fireChange = useCallback((el, newValue) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, "value"
    ).set;
    nativeInputValueSetter.call(el, newValue);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    onChange({ target: { name, value: newValue } });
  }, [name, onChange]);

  const applyFormat = useCallback((actionId) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const text  = el.value;
    let newValue = text;
    let newStart = start;
    let newEnd   = end;

    if (actionId === "bold") {
      if (start === end) {
        const insert = "**zvýrazněný text**";
        newValue = text.slice(0, start) + insert + text.slice(end);
        newStart = start + 2;
        newEnd   = start + insert.length - 2;
      } else {
        const sel = text.slice(start, end);
        if (sel.startsWith("**") && sel.endsWith("**") && sel.length > 4) {
          const inner = sel.slice(2, -2);
          newValue = text.slice(0, start) + inner + text.slice(end);
          newStart = start;
          newEnd   = start + inner.length;
        } else {
          newValue = text.slice(0, start) + "**" + sel + "**" + text.slice(end);
          newStart = start + 2;
          newEnd   = end + 2;
        }
      }
    }

    if (actionId === "bullet") {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const lineEnd   = text.indexOf("\n", end);
      const block     = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      const lined = block
        .split("\n")
        .map(line => `- ${line.replace(/^[-•–▸]\s*/, "")}`)
        .join("\n");
      newValue = text.slice(0, lineStart) + lined + (lineEnd === -1 ? "" : text.slice(lineEnd));
      newStart = lineStart;
      newEnd   = lineStart + lined.length;
    }

    if (actionId === "paragraph") {
      const lineEnd  = text.indexOf("\n", end);
      const insertAt = lineEnd === -1 ? text.length : lineEnd;
      newValue = text.slice(0, insertAt) + "\n\n" + text.slice(insertAt);
      newStart = newEnd = insertAt + 2;
    }

    if (actionId === "example") {
      const example = FIELD_EXAMPLES[fieldName];
      if (!example) return;
      // Append after existing content (with separator if non-empty), or just set
      const trimmed = text.trim();
      newValue = trimmed ? trimmed + "\n\n" + example : example;
      newStart = newEnd = newValue.length;
    }

    fireChange(el, newValue);

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newStart, newEnd);
    });

    setActive(actionId);
    setTimeout(() => setActive(null), 200);
  }, [textareaRef, fireChange, fieldName]);

  const actions = [
    { id: "bold",      label: "Zvýraznit" },
    { id: "bullet",    label: "Odrážka"   },
    { id: "paragraph", label: "Odstavec"  },
    ...(FIELD_EXAMPLES[fieldName] ? [{ id: "example", label: "Ukázka ✦", isExample: true }] : []),
  ];

  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
      {actions.map(({ id, label, isExample }) => (
        <PillBtn
          key={id}
          label={label}
          active={active === id}
          isExample={!!isExample}
          onMouseDown={(e) => {
            e.preventDefault(); // keep textarea focus + selection intact
            applyFormat(id);
          }}
        />
      ))}
    </div>
  );
}

// ─── Helper hint line under a field label ─────────────────────────────────────
function FieldHint({ children }) {
  return (
    <p style={{
      margin: "2px 0 6px",
      fontSize: 11,
      color: "#b0b7c3",
      lineHeight: 1.4,
      fontWeight: 400,
    }}>
      {children}
    </p>
  );
}

// ─── Rich textarea — label + hint + toolbar + textarea ────────────────────────
function RichField({
  id, name, label, hint, value, onChange,
  placeholder, rows = 3,
  showToolbar = false,
}) {
  const taRef = useRef(null);

  return (
    <div style={{ marginBottom: 20 }}>
      <label
        htmlFor={id}
        style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 0, color: "#111827", letterSpacing: "-0.1px" }}
      >
        {label}
      </label>

      {hint && <FieldHint>{hint}</FieldHint>}

      {showToolbar && (
        <FormattingToolbar
          textareaRef={taRef}
          name={name}
          value={value}
          onChange={onChange}
          fieldName={name}
        />
      )}

      <textarea
        ref={taRef}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="wcv-field"
      />
    </div>
  );
}

function PlainField({ id, name, label, hint, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        htmlFor={id}
        style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 0, color: "#111827", letterSpacing: "-0.1px" }}
      >
        {label}
      </label>
      {hint && <FieldHint>{hint}</FieldHint>}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="wcv-field"
      />
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────
function BuilderForm({ form, handleChange, onPhotoChange, onPreset }) {
  return (
    <form style={{ width: "100%", minWidth: 0 }}>
      <PresetSelector onPreset={onPreset} />

      {/* Photo */}
      <div style={{ marginBottom: 20 }}>
        <label
          htmlFor="photo"
          style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 0, color: "#111827", letterSpacing: "-0.1px" }}
        >
          Fotografie
        </label>
        <FieldHint>Nepovinné — čtvercová fotka vypadá nejlépe</FieldHint>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          onChange={onPhotoChange}
          className="wcv-file"
          style={{ width: "100%", fontSize: 13 }}
        />
      </div>

      <PlainField
        id="name" name="name" label="Jméno a příjmení"
        hint="Jak má být vaše jméno uvedeno v životopisu"
        value={form.name} onChange={handleChange}
        placeholder="Např. Jan Novák"
      />
      <PlainField
        id="email" name="email" label="E-mail" type="email"
        hint="Pracovní nebo osobní — ten, kde vás zaměstnavatel zastihne"
        value={form.email} onChange={handleChange}
        placeholder="Např. jan.novak@email.cz"
      />
      <PlainField
        id="phone" name="phone" label="Telefon"
        hint="Číslo, na které vám mohou zavolat"
        value={form.phone || ""} onChange={handleChange}
        placeholder="Např. +420 123 456 789"
      />
      <PlainField
        id="city" name="city" label="Město"
        hint="Kde bydlíte nebo jste ochotni pracovat"
        value={form.city || ""} onChange={handleChange}
        placeholder="Např. Praha"
      />

      <RichField
        id="profile" name="profile" label="Profil"
        hint="Kdo jste, co děláte a co hledáte — 2–3 věty"
        value={form.profile} onChange={handleChange} showToolbar
        placeholder="Napište krátký profesní souhrn…"
        rows={3}
      />

      <RichField
        id="experience" name="experience" label="Praxe"
        hint="Pozice, firma a období — každou roli oddělt prázdným řádkem"
        value={form.experience} onChange={handleChange} showToolbar
        placeholder={"Název pozice, Firma (2022–dosud)\n- Co jste dělali"}
        rows={5}
      />

      <RichField
        id="education" name="education" label="Vzdělání"
        hint="Škola, obor a rok ukončení — nejnovější nejdřív"
        value={form.education} onChange={handleChange} showToolbar
        placeholder={"Název školy\nObor, titul (2018–2022)"}
        rows={4}
      />

      <RichField
        id="skills" name="skills" label="Dovednosti"
        hint="Každá dovednost na nový řádek nebo oddělená čárkou"
        value={form.skills} onChange={handleChange} showToolbar
        placeholder={"Excel\nKomunikace\nPráce v týmu"}
        rows={3}
      />

      <RichField
        id="languages" name="languages" label="Jazyky"
        hint="Jazyk a úroveň — např. Angličtina (B2)"
        value={form.languages || ""} onChange={handleChange} showToolbar
        placeholder={"Angličtina (B2)\nNěmčina (A1)"}
        rows={2}
      />

      <RichField
        id="courses" name="courses" label="Kurzy a certifikáty"
        hint="Relevantní kurzy nebo certifikáty — název a rok"
        value={form.courses || ""} onChange={handleChange} showToolbar
        placeholder={"Název kurzu (2023)\nCertifikát: Excel pro pokročilé"}
        rows={2}
      />

      <RichField
        id="links" name="links" label="Odkazy"
        hint="LinkedIn, GitHub, portfolio — každý odkaz na nový řádek"
        value={form.links || ""} onChange={handleChange} showToolbar
        placeholder={"linkedin.com/in/vas-profil\ngithub.com/vas-profil"}
        rows={2}
      />
    </form>
  );
}

export default BuilderForm;
