// ═══════════════════════════════════════════════════════════
//  INPUTS
//  Qayerda: barcha formalar, qidiruv, sozlamalar toggle'lari.
//  Qachon EMAS: bir martalik tanlov (chip/segment), sana (native).
//  Tokenlar: RADIUS.m, COMP.inputPad/touchMin, TYPE, SPACE, ALPHA, MOTION.
//  Dark mode: surH fon, focus'da th.ac border — ikkala rejimda kontrast OK.
//  A11y: label input USTIDA (placeholder label emas), xato matni
//        borderdan tashqari matn bilan; Switch role="switch"+aria-checked;
//        barcha kontrollar ≥44px.
//  Animation: focus border MOTION.trFast; Switch dastasi trFast("left").
//  Eslatma: AmountInput legacy MoneyInput format logikasini takrorlaydi
//  (raqam + ming ajratgich) — MoneyInput sahifalarda ishlashda davom etadi.
// ═══════════════════════════════════════════════════════════
import { memo, useState } from "react";
import { RADIUS, COMP, TYPE, SPACE, ALPHA, MOTION, SHADOW, Z } from "../../utils/tokens.js";
import { injectUiCss } from "./motion.js";

const lbS = th => ({ ...TYPE.tiny, color: th.t2, display: "block", marginBottom: SPACE.s1 });
const ipS = (th, focus, error) => ({
  width: "100%", background: th.surH, color: th.t1, outline: "none", boxSizing: "border-box",
  border: "1.5px solid " + (error ? th.rd : focus ? th.ac : th.bor), borderRadius: RADIUS.m,
  padding: COMP.inputPad, fontSize: TYPE.subtitle.fontSize, fontFamily: "inherit",
  transition: MOTION.trFast("border-color"),
});

/** Matn inputi. error — xato matni (string). */
export const TextInput = memo(function TextInput({ th, label, value, onChange, placeholder, type = "text", inputMode, error, autoFocus, style }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: SPACE.s3, ...style }}>
      {label && <label style={lbS(th)}>{label}</label>}
      <input type={type} inputMode={inputMode} value={value} placeholder={placeholder} autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={ipS(th, f, error)} />
      {error && <div style={{ ...TYPE.caption, color: th.rd, marginTop: SPACE.s1 }}>{error}</div>}
    </div>
  );
});

/** Pul inputi: faqat raqam, ming ajratgich, katta markaziy matn. suffix — valyuta. */
export const AmountInput = memo(function AmountInput({ th, label, value, onChange, placeholder, suffix, error, autoFocus, style }) {
  const [f, setF] = useState(false);
  const disp = value ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "";
  return (
    <div style={{ marginBottom: SPACE.s3, ...style }}>
      {label && <label style={lbS(th)}>{label}</label>}
      <div style={{ position: "relative" }}>
        <input inputMode="numeric" value={disp} placeholder={placeholder} autoFocus={autoFocus}
          onChange={e => onChange(e.target.value.replace(/\D/g, ""))} onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{ ...ipS(th, f, error), fontSize: TYPE.title.fontSize + 2, fontWeight: 800, textAlign: "center", fontVariantNumeric: "tabular-nums" }} />
        {suffix && <span style={{ position: "absolute", right: SPACE.s4, top: "50%", transform: "translateY(-50%)", ...TYPE.caption, color: th.t2, pointerEvents: "none" }}>{suffix}</span>}
      </div>
      {error && <div style={{ ...TYPE.caption, color: th.rd, marginTop: SPACE.s1 }}>{error}</div>}
    </div>
  );
});

/** Qidiruv inputi — ichida lupa, o'ngda tozalash. */
export const SearchInput = memo(function SearchInput({ th, value, onChange, placeholder, style }) {
  injectUiCss();
  const [f, setF] = useState(false);
  return (
    <div style={{ position: "relative", marginBottom: SPACE.s3, ...style }}>
      <span style={{ position: "absolute", left: SPACE.s4 - 2, top: "50%", transform: "translateY(-50%)", display: "flex", pointerEvents: "none" }}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="5" stroke={th.t3} strokeWidth="1.6"/><line x1="11.5" y1="11.5" x2="15.5" y2="15.5" stroke={th.t3} strokeWidth="1.8" strokeLinecap="round"/></svg>
      </span>
      <input value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ ...ipS(th, f), paddingLeft: SPACE.s8 + SPACE.s1 }} />
      {value && (
        <button className="ui-press" onClick={() => onChange("")} aria-label="Tozalash"
          style={{ position: "absolute", right: SPACE.s2, top: "50%", transform: "translateY(-50%)", width: SPACE.s6 + SPACE.s1, height: SPACE.s6 + SPACE.s1, border: "none", borderRadius: RADIUS.full, background: th.bor, color: th.t2, cursor: "pointer", fontSize: TYPE.caption.fontSize, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      )}
    </div>
  );
});

/** Ko'p qatorli matn. */
export const TextArea = memo(function TextArea({ th, label, value, onChange, placeholder, rows = 4, error, style }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom: SPACE.s3, ...style }}>
      {label && <label style={lbS(th)}>{label}</label>}
      <textarea value={value} placeholder={placeholder} rows={rows}
        onChange={e => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ ...ipS(th, f, error), resize: "vertical", minHeight: SPACE.s16 + SPACE.s6, lineHeight: 1.5 }} />
      {error && <div style={{ ...TYPE.caption, color: th.rd, marginTop: SPACE.s1 }}>{error}</div>}
    </div>
  );
});

/** Dropdown: options [{id, label, icon?}]. Ochilganda pastga ro'yxat. */
export const Dropdown = memo(function Dropdown({ th, label, value, options = [], onChange, placeholder, style }) {
  injectUiCss();
  const [open, setOpen] = useState(false);
  const cur = options.find(o => o.id === value);
  return (
    <div style={{ marginBottom: SPACE.s3, position: "relative", ...style }}>
      {label && <label style={lbS(th)}>{label}</label>}
      <button className="ui-press" onClick={() => setOpen(v => !v)}
        style={{ ...ipS(th, open), display: "flex", alignItems: "center", gap: SPACE.s2, cursor: "pointer", textAlign: "left" }}>
        {cur?.icon}
        <span style={{ flex: 1, color: cur ? th.t1 : th.t3 }}>{cur?.label || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: MOTION.trFast("transform") }}><path d="M4 6l4 4 4-4" stroke={th.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <div className="ui-fadeUp" style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: SPACE.s1, background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, boxShadow: SHADOW.e2, zIndex: Z.dropdown, maxHeight: SPACE.s16 * 4, overflowY: "auto" }}>
          {options.map((o, i) => (
            <button key={o.id} className="ui-press" onClick={() => { onChange(o.id); setOpen(false); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: SPACE.s2, padding: SPACE.s3 + "px " + SPACE.s4 + "px", background: o.id === value ? th.ac + ALPHA.faint : "transparent", border: "none", borderBottom: i < options.length - 1 ? "1px solid " + th.bor : "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", minHeight: COMP.touchMin }}>
              {o.icon}
              <span style={{ flex: 1, ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: o.id === value ? th.ac : th.t1 }}>{o.label}</span>
              {o.id === value && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={th.ac} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

/** Toggle switch. */
export const Switch = memo(function Switch({ th, checked, onChange, label }) {
  const W = COMP.touchMin + SPACE.s1 + 2, H = SPACE.s6 + SPACE.s1, D = H - SPACE.s2;
  return (
    <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      style={{ width: W, height: H, borderRadius: RADIUS.pill, border: "none", background: checked ? th.gr : th.bor, cursor: "pointer", position: "relative", transition: MOTION.tr("background"), flexShrink: 0, padding: 0 }}>
      <span style={{ position: "absolute", top: SPACE.s1, left: checked ? W - D - SPACE.s1 : SPACE.s1, width: D, height: D, borderRadius: RADIUS.full, background: "#fff", transition: MOTION.trFast("left") }} />
    </button>
  );
});
