import React, { useRef, useEffect, useState } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const ACCENT_MID  = "#64748b";   // section title labels
const SIDEBAR_BG  = "#f8fafc";   // sidebar — barely-there cool tint
const TEXT_PRI    = "#111827";   // name, job titles — near-black for maximum contrast
const TEXT_SEC    = "#374151";   // body text — dark enough to read comfortably
const TEXT_MUTED  = "#6b7280";   // company, dates, secondary info
const BULLET_CLR  = "#d1d5db";   // bullets — light, non-distracting

// ─── Page geometry ────────────────────────────────────────────────────────────
const PAGE_WIDTH      = 560;                                  // wider canvas → more realistic A4 proportions
const PAGE_HEIGHT     = Math.round(PAGE_WIDTH * (297 / 210)); // ~793 px
const SIDEBAR_W_PCT   = 0.34;                                 // 34 % sidebar — wide enough for email addresses
const SIDEBAR_W       = Math.round(PAGE_WIDTH * SIDEBAR_W_PCT);
const MAIN_W          = PAGE_WIDTH - SIDEBAR_W;
const HEADER_H        = 96;      // tall enough to seat a 72 px photo comfortably
const PAD_V           = 20;      // vertical padding top/bottom of body columns
const PAD_BOTTOM      = 18;      // extra safe-zone at page bottom (deducted from budget)
const PAD_SIDEBAR_H   = 16;      // horizontal padding in sidebar
const PAD_MAIN_H      = 22;      // horizontal padding in main column
const MIN_CONTENT_H   = 24;
const INTER_SECTION_GAP = 18;    // gap between sections — premium but not airy

// ─── Placeholder style ────────────────────────────────────────────────────────
const ph = { color: TEXT_MUTED, fontStyle: "italic" };

// ─── Inline markdown parser ───────────────────────────────────────────────────
// Converts **text** → <strong>, *text* → <em>.
// Returns an array of React nodes safe for inline rendering.
function parseInline(text) {
  if (!text) return null;
  // Split on **...** (bold) and *...* (italic), keeping delimiters
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 700, color: TEXT_PRI }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} style={{ fontStyle: "italic" }}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// ─── Rich text paragraph renderer ────────────────────────────────────────────
// Renders a block of text where each line is either:
//   - A bullet line starting with "-" or "•"  → rendered as a bullet item
//   - A plain/inline-markdown line             → rendered as a paragraph
// Empty lines are preserved as spacing between paragraphs.
function RichTextBlock({ text, fontSize = 11, color = TEXT_SEC }) {
  if (!text) return null;
  const lines = text.split("\n");
  const nodes = [];
  let bulletGroup = [];

  const flushBullets = () => {
    if (bulletGroup.length === 0) return;
    nodes.push(
      <div key={`b-${nodes.length}`} style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 4 }}>
        {bulletGroup.map((b, bi) => (
          <div key={bi} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            <span style={{
              marginTop: 5, width: 3, height: 3,
              borderRadius: "50%", background: BULLET_CLR, flexShrink: 0,
            }} />
            <span style={{ fontSize, color, lineHeight: 1.7, letterSpacing: 0.05 }}>
              {parseInline(b)}
            </span>
          </div>
        ))}
      </div>
    );
    bulletGroup = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (/^[-•–▸]\s*/.test(trimmed)) {
      bulletGroup.push(trimmed.replace(/^[-•–▸]\s*/, ""));
    } else {
      flushBullets();
      if (trimmed === "") {
        // blank line = small gap between paragraphs
        nodes.push(<div key={`sp-${i}`} style={{ height: 4 }} />);
      } else {
        nodes.push(
          <div key={`p-${i}`} style={{
            fontSize, color, lineHeight: 1.75,
            letterSpacing: 0.05, marginBottom: 3,
          }}>
            {parseInline(trimmed)}
          </div>
        );
      }
    }
  });
  flushBullets();
  return <div>{nodes}</div>;
}

// ─── Section title ────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div style={{
      fontWeight: 700,
      fontSize: 7.5,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: ACCENT_MID,
      paddingBottom: 5,
      marginBottom: 10,
      marginTop: 18,          // was 28 — reduced to avoid excessive empty air
    }}>
      {children}
    </div>
  );
}

// ─── Continuation label (replaces full title on overflow pages) ───────────────

function ContinuationLabel({ children }) {
  return (
    <div style={{
      fontSize: 8.5,
      fontWeight: 500,
      letterSpacing: 0.6,
      color: TEXT_MUTED,
      fontStyle: "italic",
      paddingBottom: 6,
      marginBottom: 10,
    }}>
      {children} <span style={{ letterSpacing: 0 }}>↓</span>
    </div>
  );
}

// ─── Plain text block (profile, fallback) ─────────────────────────────────────

function FieldText({ value, placeholder }) {
  if (value) return <RichTextBlock text={value} />;
  return <div style={{ ...ph, fontSize: 11, lineHeight: 1.6 }}>{placeholder}</div>;
}

// ─── Skills — bullet list ─────────────────────────────────────────────────────

function SkillsList({ text }) {
  if (!text) return null;
  // Accept comma-separated or newline-separated input; strip leading bullet markers
  const raw = text.includes("\n") ? text.split("\n") : text.split(",");
  const items = raw
    .map(s => s.trim().replace(/^[-•–▸]\s*/, ""))
    .filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((skill, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
          <span style={{
            marginTop: 5,
            width: 4, height: 4,
            borderRadius: "50%",
            background: BULLET_CLR,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: TEXT_PRI, lineHeight: 1.6, letterSpacing: 0 }}>
            {parseInline(skill)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Languages — two-tone pill list ──────────────────────────────────────────

function LanguageList({ text }) {
  if (!text) return null;
  const items = text.split("\n").map(s => s.trim()).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((lang, i) => {
        const match = lang.match(/^(.*?)\s*(\([^)]+\))\s*$/);
        const name  = match ? match[1].trim() : lang;
        const level = match ? match[2] : null;
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 11, color: TEXT_PRI, letterSpacing: 0 }}>{name}</span>
            {level && (
              <span style={{
                fontSize: 10, color: TEXT_MUTED, fontWeight: 400, letterSpacing: 0.2,
              }}>
                {level.replace(/[()]/g, "")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Links — stacked label + url ─────────────────────────────────────────────

function LinksList({ text }) {
  if (!text) return null;
  const items = text.split("\n").map(s => s.trim()).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((link, i) => {
        let label = "Web";
        if (/linkedin/i.test(link))   label = "LinkedIn";
        else if (/github/i.test(link)) label = "GitHub";
        else if (/twitter|x\.com/i.test(link)) label = "Twitter / X";
        else if (/behance/i.test(link))  label = "Behance";
        else if (/dribbble/i.test(link)) label = "Dribbble";
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Label row */}
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              color: TEXT_MUTED,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}>
              {label}
            </span>
            {/* URL — wraps on any character so long URLs never overflow */}
            <span style={{
              fontSize: 10.5,
              color: TEXT_SEC,
              lineHeight: 1.5,
              wordBreak: "break-all",
              overflowWrap: "anywhere",
              letterSpacing: 0,
            }}>
              {link}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Courses — bullet list ────────────────────────────────────────────────────

function CoursesList({ text }) {
  if (!text) return null;
  const items = text.split("\n").map(s => s.trim()).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((course, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <span style={{
            marginTop: 3.5,
            fontSize: 10, color: BULLET_CLR,
            fontWeight: 700, flexShrink: 0, lineHeight: 1,
          }}>▸</span>
          <span style={{ fontSize: 11, color: TEXT_SEC, lineHeight: 1.55, letterSpacing: 0.05 }}>
            {course}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Contact — icon rows ──────────────────────────────────────────────────────

function ContactBlock({ form }) {
  const rows = [
    { label: "E-mail", value: form.email },
    { label: "Tel.",   value: form.phone },
    { label: "Město",  value: form.city  },
  ].filter(r => r.value);
  if (rows.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {rows.map(({ label, value }) => (
        // Stacked layout: label on top, value below.
        // Gives the full sidebar width to the value — no label competing on the same line.
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{
            fontSize: 7.5,
            color: TEXT_MUTED,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            lineHeight: 1,
          }}>
            {label}
          </span>
          {/* whiteSpace: nowrap + ellipsis → value always on one line, never mid-word broken */}
          <span style={{
            fontSize: 10,
            color: TEXT_PRI,
            lineHeight: 1.45,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            letterSpacing: 0,
          }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Experience / Education — structured blocks ───────────────────────────────
//
// Input text uses "\n\n" between jobs and "\n" within a job:
//   Line 1 : Job title — Company, City (dates)   ← bold
//   Line 2+: description / bullet lines           ← muted body text
//
// We render each "\n\n"-separated block as a mini card with a title + body.

// ── Experience title parser ────────────────────────────────────────────────────
//
// Handles these real-world formats found in the presets:
//
//   "Brigáda v kavárně Café Central, Brno (2023–dosud)"
//   "Freelance webový vývojář (2023–dosud)"
//   "Asistentka ředitele, Technip CZ a.s., Olomouc (2020–dosud)"
//   "Stáž, Webstudio s.r.o., Praha (3 měsíce, 2023)"
//
// Returns { role, company, dates }
//   role    — bold, dark
//   company — muted line 1 (company + location, everything before the date)
//   dates   — muted line 2 (the parenthesised block, stripped of parens)
//
function parseJobTitle(titleLine) {
  // 1. Extract trailing (…) date block — greedy match of the LAST (…)
  const dateMatch = titleLine.match(/\(([^)]+)\)\s*$/);
  const dates     = dateMatch ? dateMatch[1] : null;
  const withoutDates = dates
    ? titleLine.slice(0, dateMatch.index).trim().replace(/,\s*$/, "")
    : titleLine.trim();

  // 2. Split remainder at the FIRST comma → role vs company+location
  //    If no comma exists the whole string is the role.
  const firstComma = withoutDates.indexOf(",");
  if (firstComma === -1) {
    return { role: withoutDates, company: null, dates };
  }

  const role    = withoutDates.slice(0, firstComma).trim();
  const company = withoutDates.slice(firstComma + 1).trim();
  return { role, company, dates };
}

// ── Body line → bullet ────────────────────────────────────────────────────────
//
// Each non-title line in an experience block becomes exactly ONE bullet.
// Leading bullet markers (-  •  –  ▸) are stripped; trailing period/comma removed.
// This preserves sentences like "Správa dokumentace a reportů" as a single item
// instead of splitting them on commas.
//
function bodyLineToBullets(line) {
  const cleaned = line
    .replace(/^[-–•▸]\s*/, "")   // strip leading marker
    .replace(/[.,]\s*$/, "")      // strip trailing punctuation
    .trim();
  return cleaned ? [cleaned] : [];
}

function ExperienceBlock({ text }) {
  if (!text) return null;

  const jobs = text.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {jobs.map((job, ji) => {
        const lines = job.split("\n").map(l => l.trim()).filter(Boolean);
        const { role, company, dates } = parseJobTitle(lines[0] || "");

        // Expand all body lines into individual bullet strings
        const bullets = lines.slice(1).flatMap(bodyLineToBullets);

        return (
          <div key={ji} style={{ paddingLeft: 0 }}>
            {/* Job title */}
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: TEXT_PRI,
              lineHeight: 1.35,
            }}>
              {parseInline(role)}
            </div>

            {/* Company / location */}
            {company && (
              <div style={{
                fontSize: 10.5,
                color: TEXT_MUTED,
                lineHeight: 1.5,
                marginTop: 2,
              }}>
                {parseInline(company)}
              </div>
            )}

            {/* Dates */}
            {dates && (
              <div style={{
                fontSize: 10,
                color: TEXT_MUTED,
                lineHeight: 1.5,
                marginTop: 1,
                fontStyle: "italic",
              }}>
                {dates}
              </div>
            )}

            {/* Bullet responsibilities */}
            {bullets.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                {bullets.map((b, bi) => (
                  <div key={bi} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{
                      marginTop: 5.5,
                      width: 3, height: 3,
                      borderRadius: "50%",
                      background: BULLET_CLR,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 11,
                      color: TEXT_SEC,
                      lineHeight: 1.7,
                      letterSpacing: 0,
                    }}>
                      {parseInline(b)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Education uses the same structured approach
function EducationBlock({ text }) {
  if (!text) return null;
  const entries = text.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {entries.map((entry, ei) => {
        const lines = entry.split("\n").map(l => l.trim()).filter(Boolean);
        const institution = lines[0] || "";
        const details     = lines.slice(1);

        return (
          <div key={ei} style={{ paddingLeft: 0 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: TEXT_PRI,
              lineHeight: 1.35,
              letterSpacing: 0,
            }}>
              {parseInline(institution)}
            </div>
            {details.map((d, di) => (
              <div key={di} style={{
                fontSize: 10.5,
                color: di === 0 ? TEXT_SEC : TEXT_MUTED,
                lineHeight: 1.65,
                marginTop: 3,
                letterSpacing: 0,
                fontWeight: 400,
              }}>
                {parseInline(d)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
// Plain white background, name on white, no colored box.

function CvHeader({ form, photoUrl }) {
  return (
    <div style={{
      background: "#ffffff",
      padding: "20px 22px 16px 22px",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      flexShrink: 0,
      minHeight: HEADER_H,
      boxSizing: "border-box",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name */}
        <div style={{
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: "-0.5px",
          lineHeight: 1.15,
          marginBottom: 6,
          color: TEXT_PRI,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {form.name || (
            <span style={{ color: "#c8d3de", fontStyle: "italic", fontWeight: 400, fontSize: 14 }}>
              Jméno a příjmení
            </span>
          )}
        </div>

        {/* Thin separator under name */}
        <div style={{ width: 28, height: 2, background: "#334155", borderRadius: 2, marginBottom: 8 }} />

        {/* Contact — single line, ellipsis if too long, never wraps */}
        <div style={{
          fontSize: 9.5,
          color: TEXT_MUTED,
          lineHeight: 1.5,
          letterSpacing: 0.15,
          fontWeight: 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {[form.email, form.phone, form.city].filter(Boolean).join("   ·   ") || (
            <span style={{ color: "#d1d9e0", fontStyle: "italic" }}>
              E-mail · Telefon · Město
            </span>
          )}
        </div>
      </div>

      {/* Photo — clean, no border, no shadow, top-aligned with name */}
      {photoUrl && (
        <img
          src={photoUrl}
          alt="Fotografie"
          style={{
            width: 72, height: 72,
            objectFit: "cover",
            borderRadius: 3,          // barely-there corner softening — stays corporate
            flexShrink: 0,
            display: "block",
            alignSelf: "flex-start",  // pins to same top edge as the name
          }}
        />
      )}
    </div>
  );
}

// ─── Free-version watermark tile grid ────────────────────────────────────────
// Builds an array of { top, left } positions covering the full page in a grid,
// then renders each as a rotated, low-opacity text node.  The overlap between
// tiles guarantees that every crop / screenshot region contains at least one
// readable watermark — it cannot be cleanly removed with a simple crop.
const WM_TEXT    = "WHISPY CV FREE VERSION";
const WM_COLS    = 3;   // horizontal slots across PAGE_WIDTH
const WM_ROWS    = 5;   // vertical slots down PAGE_HEIGHT
function WatermarkGrid() {
  const tiles = [];
  for (let r = 0; r < WM_ROWS; r++) {
    for (let c = 0; c < WM_COLS; c++) {
      // Offset every other row by half a column width for a brick-pattern feel
      const xOffset = r % 2 === 0 ? 0 : (PAGE_WIDTH / WM_COLS) * 0.5;
      const top  = (r / WM_ROWS) * PAGE_HEIGHT + PAGE_HEIGHT / WM_ROWS / 2;
      const left = (c / WM_COLS) * PAGE_WIDTH  + PAGE_WIDTH  / WM_COLS  / 2 + xOffset;
      tiles.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: "absolute",
            top,
            left,
            transform: "translate(-50%, -50%) rotate(-25deg)",
            fontSize: 17,
            fontWeight: 800,
            fontFamily: "'Arial', sans-serif",
            color: "rgba(0,0,0,0.13)",
            letterSpacing: 2,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {WM_TEXT}
        </div>
      );
    }
  }
  return <>{tiles}</>;
}

// ─── Page shell ───────────────────────────────────────────────────────────────

function PageShell({ children, isPaid }) {
  return (
    <div
      className="cv-page"
      style={{
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        background: "#ffffff",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        marginBottom: 24,
        fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
        display: "flex",
        flexDirection: "column",
        // Subtle blur for free version — nearly invisible to reading eye
        // but introduces a tiny quality loss that makes screenshots look
        // slightly soft / non-professional compared to the paid clean export.
        filter: isPaid ? "none" : "blur(0.35px)",
      }}>
      {children}

      {/* ── Free-version watermark overlay — every page ─────────────────── */}
      {!isPaid && (
        <>
          {/* 1. Full-page tiled grid — anti-screenshot, can't be cropped away */}
          <div style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            userSelect: "none",
            overflow: "hidden",
          }}>
            <WatermarkGrid />
          </div>

          {/* 2. Horizontal band through the middle */}
          <div style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            height: 24,
            background: "rgba(0,0,0,0.055)",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            pointerEvents: "none",
            userSelect: "none",
          }}>
            <span style={{
              whiteSpace: "nowrap",
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "'Arial', sans-serif",
              color: "rgba(0,0,0,0.30)",
              letterSpacing: 2.5,
              textTransform: "uppercase",
              paddingLeft: 10,
            }}>
              {"FREE VERSION \u2022 WHISPY CV \u2022 FREE VERSION \u2022 WHISPY CV \u2022 FREE VERSION \u2022 WHISPY CV \u2022 FREE VERSION \u2022 WHISPY CV \u2022 FREE VERSION \u2022 WHISPY CV \u2022 "}
            </span>
          </div>

          {/* 3. Footer attribution — ASCII only, no diacritics */}
          <div style={{
            position: "absolute",
            bottom: 6,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 7.5,
            fontFamily: "'Arial', sans-serif",
            color: "rgba(0,0,0,0.45)",
            letterSpacing: 0.4,
            pointerEvents: "none",
            userSelect: "none",
            borderTop: "0.5px solid rgba(0,0,0,0.15)",
            paddingTop: 3,
          }}>
            Created with Whispy CV &bull; Download clean PDF at whispy.cz
          </div>
        </>
      )}
    </div>
  );
}

// ─── Body columns ─────────────────────────────────────────────────────────────

function BodyColumns({ sidebarSections, mainSections }) {
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{
        width: SIDEBAR_W,
        background: SIDEBAR_BG,
        padding: `${PAD_V}px ${PAD_SIDEBAR_H}px`,
        boxSizing: "border-box",
        borderRight: "1px solid #edf0f2",
      }}>
        {sidebarSections.map((sec, idx) => (
          <div key={sec.id + "-" + idx} style={{ marginTop: idx === 0 ? 0 : 6 }}>
            {sec.isCont
              ? <ContinuationLabel>{sec.title}</ContinuationLabel>
              : <SectionTitle>{sec.title}</SectionTitle>
            }
            {sec.content}
          </div>
        ))}
      </div>
      <div style={{
        width: MAIN_W, flex: 1,
        padding: `${PAD_V}px ${PAD_MAIN_H}px`,
        boxSizing: "border-box",
        background: "#ffffff",
      }}>
        {mainSections.map((sec, idx) => (
          <div key={sec.id + "-" + idx} style={{ marginTop: idx === 0 ? 0 : 6 }}>
            {sec.isCont
              ? <ContinuationLabel>{sec.title}</ContinuationLabel>
              : <SectionTitle>{sec.title}</SectionTitle>
            }
            {sec.content}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pagination helpers ───────────────────────────────────────────────────────

function splitTextToFit(probeEl, text, maxPx) {
  if (!text) return { fits: "", overflow: "" };

  probeEl.style.whiteSpace = "pre-wrap";
  probeEl.style.fontSize   = "12px";
  probeEl.style.lineHeight = "1.65";
  probeEl.textContent = text;
  if (probeEl.getBoundingClientRect().height <= maxPx) {
    return { fits: text, overflow: "" };
  }

  let lo = 0, hi = text.length;
  while (lo < hi - 1) {
    const mid = Math.floor((lo + hi) / 2);
    probeEl.textContent = text.slice(0, mid);
    if (probeEl.getBoundingClientRect().height <= maxPx) lo = mid;
    else hi = mid;
  }

  let breakAt = lo;
  const spaceIdx = text.lastIndexOf(" ", lo);
  const newlineIdx = text.lastIndexOf("\n", lo);
  const naturalBreak = Math.max(spaceIdx, newlineIdx);
  if (naturalBreak > lo * 0.6) breakAt = naturalBreak + 1;

  return {
    fits:     text.slice(0, breakAt).trimEnd(),
    overflow: text.slice(breakAt).trimStart(),
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

function CvPreview({ form, isPaid = false, photoUrl }) {
  const measureRef  = useRef(null);
  const probeRef    = useRef(null);
  const [pageGroups, setPageGroups] = useState(null);

  // ── Section source definitions ────────────────────────────────────────────
  const buildSidebarSections = () => [
    {
      kind: "jsx",
      id: "s-kontakt", title: "Kontakt",
      empty: !form.email && !form.phone && !form.city,
      content: <ContactBlock form={form} />,
    },
    {
      kind: "text",
      id: "s-dovednosti", title: "Dovednosti",
      text: form.skills
        ? form.skills.split(",").map(s => s.trim()).filter(Boolean).join("\n")
        : "",
    },
    {
      kind: "text",
      id: "s-jazyky", title: "Jazyky",
      text: form.languages || "",
    },
    {
      kind: "jsx",
      id: "s-kurzy", title: "Kurzy a certifikáty",
      empty: !form.courses,
      content: <CoursesList text={form.courses || ""} />,
    },
    {
      kind: "jsx",
      id: "s-odkazy", title: "Odkazy",
      empty: !form.links,
      content: <LinksList text={form.links} />,
    },
  ];

  const buildMainSections = () => [
    {
      kind: "text",
      id: "m-profil", title: "Profil",
      text: form.profile || "",
    },
    {
      kind: "text",
      id: "m-praxe", title: "Praxe",
      text: form.experience || "",
    },
    {
      kind: "text",
      id: "m-vzdelani", title: "Vzdělání",
      text: form.education || "",
    },
  ];

  // ── Content resolvers — maps a section to its rendered JSX ───────────────
  // These must match the hidden measurement container exactly.
  const resolveContent = (sec) => {
    if (sec.kind === "jsx") return sec.content;
    // kind === "text": render with section-aware component
    switch (sec.id) {
      case "s-dovednosti":
        return <SkillsList    text={sec.text} />;
      case "s-jazyky":
        return <LanguageList  text={sec.text} />;
      case "m-praxe":
        return <ExperienceBlock text={sec.text} />;
      case "m-vzdelani":
        return <EducationBlock  text={sec.text} />;
      default:
        return <FieldText value={sec.text} placeholder="" />;
    }
  };

  // When a text section is split across pages, the overflow chunk gets a
  // "-cont" suffix on the id — resolve it back to the base section id.
  const resolveContentById = (id, text) => {
    const baseId = id.replace(/-cont$/, "");
    const fakeSec = { kind: "text", id: baseId, text };
    return resolveContent(fakeSec);
  };

  // ── Pagination engine ──────────────────────────────────────────────────────
  useEffect(() => {
    const container = measureRef.current;
    const probe     = probeRef.current;
    if (!container || !probe) return;

    const firstPageBodyH = PAGE_HEIGHT - HEADER_H - PAD_V * 2 - PAD_BOTTOM;
    const nextPageBodyH  = PAGE_HEIGHT             - PAD_V * 2 - PAD_BOTTOM;

    const blockH = (sid) => {
      const node = container.querySelector(`[data-sid="${sid}"]`);
      return node ? Math.ceil(node.getBoundingClientRect().height) : 0;
    };

    const titleH = (sid) => {
      const node = container.querySelector(`[data-sid="${sid}"] [data-title]`);
      return node ? Math.ceil(node.getBoundingClientRect().height) : 32;
    };

    const probeH = (text, width) => {
      probe.style.width      = `${width}px`;
      probe.style.whiteSpace = "pre-wrap";
      probe.style.fontSize   = "12px";
      probe.style.lineHeight = "1.65";
      probe.textContent      = text;
      return Math.ceil(probe.getBoundingClientRect().height);
    };

    const paginate = (rawSections, contentWidth) => {
      const pages = [[]];
      let budget  = firstPageBodyH;

      const newPage = () => {
        pages.push([]);
        budget = nextPageBodyH;
      };

      const gap = (page) => page.length > 0 ? INTER_SECTION_GAP : 0;

      for (const sec of rawSections) {

        if (sec.kind === "text") {
          if (!sec.text) continue;

          const fullBlockH = blockH(sec.id);
          const tH         = titleH(sec.id);
          const g          = gap(pages[pages.length - 1]);

          if (fullBlockH + g <= budget) {
            pages[pages.length - 1].push({
              id: sec.id, title: sec.title,
              isCont: false,
              content: resolveContent(sec),
            });
            budget -= fullBlockH + g;
            continue;
          }

          // Split across pages
          let remaining  = sec.text;
          let firstChunk = true;

          while (remaining) {
            const g2 = gap(pages[pages.length - 1]);
            if (budget - g2 < tH + MIN_CONTENT_H) newPage();

            const g3            = gap(pages[pages.length - 1]);
            const contentBudget = budget - g3 - tH;
            const remH          = probeH(remaining, contentWidth);

            if (remH <= contentBudget) {
              const chunkId = sec.id + (firstChunk ? "" : "-cont");
              pages[pages.length - 1].push({
                id: chunkId, title: sec.title,
                isCont: !firstChunk,
                content: resolveContentById(chunkId, remaining),
              });
              budget -= g3 + tH + remH;
              break;
            }

            const { fits, overflow } = splitTextToFit(probe, remaining, contentBudget);

            if (!fits) {
              newPage();
              continue;
            }

            const fitsH   = probeH(fits, contentWidth);
            const chunkId = sec.id + (firstChunk ? "" : "-cont");
            pages[pages.length - 1].push({
              id: chunkId, title: sec.title,
              isCont: !firstChunk,
              content: resolveContentById(chunkId, fits),
            });
            budget    -= g3 + tH + fitsH;
            remaining  = overflow;
            firstChunk = false;
            newPage();
          }

        } else if (sec.kind === "jsx") {
          if (sec.empty) continue;

          const h = blockH(sec.id);
          const g = gap(pages[pages.length - 1]);

          if (h + g > budget && pages[pages.length - 1].length > 0) newPage();

          const g2 = gap(pages[pages.length - 1]);
          pages[pages.length - 1].push({
            id: sec.id, title: sec.title,
            isCont: false,
            content: sec.content,
          });
          budget -= h + g2;
        }
      }

      while (pages.length > 1 && pages[pages.length - 1].length === 0) pages.pop();
      return pages;
    };

    const rawSidebar = buildSidebarSections();
    const rawMain    = buildMainSections();

    const sPages = paginate(rawSidebar, SIDEBAR_W - PAD_SIDEBAR_H * 2);
    const mPages = paginate(rawMain,    MAIN_W    - PAD_MAIN_H    * 2);

    const total = Math.max(sPages.length, mPages.length);
    while (sPages.length < total) sPages.push([]);
    while (mPages.length < total) mPages.push([]);

    let last = sPages.length - 1;
    while (last > 0 && sPages[last].length === 0 && mPages[last].length === 0) {
      sPages.pop(); mPages.pop(); last--;
    }

    setPageGroups(
      Array.from({ length: sPages.length }, (_, i) => ({
        sidebar: sPages[i],
        main:    mPages[i],
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, photoUrl]);

  const rawSidebar = buildSidebarSections();
  const rawMain    = buildMainSections();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* ── Hidden measurement container ── */}
      <div style={{ position: "relative", width: PAGE_WIDTH, height: 0, overflow: "visible", pointerEvents: "none" }}>
        <div
          ref={measureRef}
          style={{ position: "absolute", top: 0, left: 0, width: PAGE_WIDTH, visibility: "hidden", zIndex: -1 }}
        >
          {/* Sidebar sections */}
          <div style={{ width: SIDEBAR_W, padding: `0 ${PAD_SIDEBAR_H}px`, boxSizing: "border-box" }}>
            {rawSidebar.map(sec => (
              <div key={sec.id} data-sid={sec.id}>
                <div data-title style={{
                  fontWeight: 700, fontSize: 7.5, letterSpacing: 2,
                  textTransform: "uppercase",
                  paddingBottom: 5, marginBottom: 10,
                }}>
                  {sec.title}
                </div>
                {resolveContent(sec)}
              </div>
            ))}
          </div>
          {/* Main sections */}
          <div style={{ width: MAIN_W, padding: `0 ${PAD_MAIN_H}px`, boxSizing: "border-box" }}>
            {rawMain.map(sec => (
              <div key={sec.id} data-sid={sec.id}>
                <div data-title style={{
                  fontWeight: 700, fontSize: 7.5, letterSpacing: 2,
                  textTransform: "uppercase",
                  paddingBottom: 5, marginBottom: 10,
                }}>
                  {sec.title}
                </div>
                {resolveContent(sec)}
              </div>
            ))}
          </div>
        </div>

        {/* Probe for binary-search text splitting */}
        <div
          ref={probeRef}
          style={{
            position: "absolute", top: 0, left: 0,
            visibility: "hidden", zIndex: -1,
            fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
            fontSize: "12px", lineHeight: "1.65",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}
        />
      </div>

      {/* ── Paginated A4 pages ── */}
      {(!pageGroups
        ? [{
            sidebar: rawSidebar
              .filter(s => s.kind === "text" ? !!s.text : !s.empty)
              .map(s => ({ ...s, content: resolveContent(s) })),
            main: rawMain
              .filter(s => !!s.text)
              .map(s => ({ ...s, content: resolveContent(s) })),
          }]
        : pageGroups
      ).map((pg, i, arr) => (
        <PageShell key={i} isPaid={isPaid}>
          {i === 0 && <CvHeader form={form} photoUrl={photoUrl} />}
          <BodyColumns sidebarSections={pg.sidebar} mainSections={pg.main} />
        </PageShell>
      ))}
    </div>
  );
}

export default CvPreview;
