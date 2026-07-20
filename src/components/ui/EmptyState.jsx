// ═══════════════════════════════════════════════════════════
//  EMPTY STATE
//  Qayerda: ro'yxat/hisobot bo'sh bo'lganda, internet yo'qligida.
//  Qachon: ma'lumot 0 ta va bu NORMAL holat bo'lganda.
//  Qachon EMAS: yuklanish paytida (Skeleton), xato paytida
//              agar qayta urinish mumkin bo'lsa (preset "offline" bor).
//  Ohang: aybsiz, harakatga yo'naltiruvchi (DS 5.13).
//  Tokenlar: SPACE, TYPE, RADIUS; ikonka t3 rangda (fintech zonasi
//            — illyustratsiya YO'Q, bu qoida faqat bog'da yumshaydi).
//  Dark mode: th orqali.
//  A11y: matn kontrasti t2 (AA), action tugma ≥44px.
//  Animation: .ui-fadeUp konteynerga.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { SPACE, TYPE } from "../../utils/tokens.js";
import { EmptyCard } from "./Card.jsx";
import { SecondaryButton } from "./Button.jsx";
import { injectUiCss } from "./motion.js";

const I = (path, extra) => {
  const IconComp = c => <svg width="56" height="56" viewBox="0 0 56 56" fill="none">{path(c)}{extra ? extra(c) : null}</svg>;
  IconComp.displayName = "EmptyIcon";
  return IconComp;
};

/** Preset ikonkalar — 56px, t3 rang, 1.5px outline. */
export const EMPTY_ICONS = {
  transaction: I(c => <><rect x="12" y="8" width="32" height="40" rx="5" stroke={c} strokeWidth="2"/><path d="M20 20h16M20 28h16M20 36h9" stroke={c} strokeWidth="2" strokeLinecap="round"/></>),
  goal: I(c => <><circle cx="28" cy="28" r="20" stroke={c} strokeWidth="2" opacity=".4"/><circle cx="28" cy="28" r="12" stroke={c} strokeWidth="2" opacity=".7"/><circle cx="28" cy="28" r="4" fill={c}/></>),
  debt: I(c => <><rect x="8" y="16" width="40" height="26" rx="5" stroke={c} strokeWidth="2"/><path d="M8 25h40" stroke={c} strokeWidth="2"/><circle cx="38" cy="34" r="3" fill={c} opacity=".7"/></>),
  report: I(c => <><rect x="10" y="30" width="8" height="16" rx="2" fill={c} opacity=".4"/><rect x="24" y="20" width="8" height="26" rx="2" fill={c} opacity=".6"/><rect x="38" y="12" width="8" height="34" rx="2" fill={c} opacity=".8"/></>),
  offline: I(c => <><path d="M8 24c11-11 29-11 40 0M14 31c8-8 20-8 28 0M21 38c4.5-4.5 9.5-4.5 14 0" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="28" cy="45" r="2.5" fill={c}/><path d="M10 10l36 36" stroke={c} strokeWidth="2" strokeLinecap="round"/></>),
};

/**
 * preset: "transaction"|"goal"|"debt"|"report"|"offline" yoki icon prop.
 * action + actionText — harakatga chaqiriq (ixtiyoriy).
 */
export const EmptyState = memo(function EmptyState({ th, preset, icon, title, message, actionText, onAction, style }) {
  injectUiCss();
  const ico = icon || (preset && EMPTY_ICONS[preset] && EMPTY_ICONS[preset](th.t3));
  return (
    <EmptyCard th={th} style={style}>
      <div className="ui-fadeUp">
        {ico && <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s3 }}>{ico}</div>}
        <div style={{ ...TYPE.heading, fontSize: TYPE.heading.fontSize - 1, color: th.t1, marginBottom: SPACE.s1 + 2 }}>{title}</div>
        {message && <div style={{ ...TYPE.caption, color: th.t2, lineHeight: 1.5, marginBottom: onAction ? SPACE.s4 : 0, maxWidth: SPACE.s16 * 4 + SPACE.s8, margin: "0 auto" + (onAction ? " " + SPACE.s4 + "px" : "") }}>{message}</div>}
        {onAction && <SecondaryButton th={th} onClick={onAction} style={{ width: "auto", padding: SPACE.s2 + 2 + "px " + SPACE.s6 + "px", margin: "0 auto" }}>{actionText}</SecondaryButton>}
      </div>
    </EmptyCard>
  );
});
