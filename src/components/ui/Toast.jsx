// ═══════════════════════════════════════════════════════════
//  TOAST / SNACKBAR
//  Qayerda: qisqa operatsiya natijasi ("Saqlandi", "Xato").
//  Qachon: foydalanuvchi harakatidan keyingi 1-qatorli javob.
//  Qachon EMAS: harakat talab qiladigan xabar (Dialog), uzun matn.
//  Tokenlar: Z.toast, RADIUS.m, SHADOW.e2, TYPE, SPACE.
//  Turlar: type "ok"|"success" → gr, "err"|"error" → rd,
//          "warn" → am, "info" → ac. (Legacy ok$/Tst tiplariga mos.)
//  Dark mode: to'yingan fon + oq matn — ikkala rejimda bir xil kontrast.
//  A11y: role="status" aria-live="polite" — ekran o'quvchi eshitadi.
//  Animation: .ui-toastIn (yuqoridan, 240ms).
//  Integratsiya: App.jsx dagi ok$ mexanizmi saqlanadi — bu komponent
//  Tst o'rniga sahifa migratsiyasida ulanadi.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { Z, RADIUS, SHADOW, TYPE, SPACE, COMP } from "../../utils/tokens.js";
import { injectUiCss } from "./motion.js";

const icons = {
  ok: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  err: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>,
  warn: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L1.5 13.5h13L8 2z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 6.5v3.2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11.8" r=".8" fill="#fff"/></svg>,
  info: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#fff" strokeWidth="1.5"/><path d="M8 7.5v3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="5" r=".8" fill="#fff"/></svg>,
};

export const UIToast = memo(function UIToast({ th, msg, type = "ok" }) {
  injectUiCss();
  if (!msg) return null;
  const t = type === "error" ? "err" : type === "success" ? "ok" : type;
  const bg = t === "err" ? th.rd : t === "warn" ? th.am : t === "info" ? th.ac : th.gr;
  return (
    <div className="ui-toastIn" role="status" aria-live="polite"
      style={{ position: "fixed", top: SPACE.s4 + SPACE.s1, left: "50%", transform: "translateX(-50%)", zIndex: Z.toast, background: bg, color: "#fff", borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s6 + "px", ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, fontWeight: 700, maxWidth: COMP.pageMax - SPACE.s16 - SPACE.s6, textAlign: "center", boxShadow: SHADOW.e2, pointerEvents: "none", display: "flex", alignItems: "center", gap: SPACE.s2 }}>
      <span style={{ flexShrink: 0, display: "flex" }}>{icons[t]}</span>{msg}
    </div>
  );
});
