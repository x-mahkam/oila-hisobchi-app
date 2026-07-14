// ═══════════════════════════════════════════════════════════
//  HEADERS
//  Qayerda: har sahifa tepasi (PageHeader), seksiya boshlari
//           (SectionHeader), karta ichki sarlavhalari (SubHeader).
//  Qachon EMAS: PageHeader sahifada 1 tadan ortiq bo'lmaydi;
//              SectionHeader karta ICHIDA ishlatilmaydi (SubHeader bor).
//  Tokenlar: TYPE.title/tiny/heading, SPACE, RADIUS.s, ALPHA.
//  Dark mode: th orqali.
//  A11y: back tugma 44px touch zona, aria-label bilan.
//  Animation: back tugma .ui-press.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { TYPE, SPACE, RADIUS, ALPHA, COMP } from "../../utils/tokens.js";
import { injectUiCss } from "./motion.js";

const backIco = c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;

/** Sahifa sarlavhasi. onBack berilsa orqaga tugma chiqadi. right — ixtiyoriy harakat sloti. */
export const PageHeader = memo(function PageHeader({ th, title, onBack, right, style }) {
  injectUiCss();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s4 + SPACE.s1, ...style }}>
      {onBack && (
        <button className="ui-press" onClick={onBack} aria-label="Orqaga"
          style={{ width: COMP.touchMin - SPACE.s2, height: COMP.touchMin - SPACE.s2, flexShrink: 0, border: "1px solid " + th.bor, borderRadius: RADIUS.s, background: th.sur, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {backIco(th.t1)}
        </button>
      )}
      <div style={{ ...TYPE.title, color: th.t1, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
      {right}
    </div>
  );
});

/** Seksiya labeli (uppercase tiny). right — masalan "Hammasi" havolasi. */
export const SectionHeader = memo(function SectionHeader({ th, children, right, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: SPACE.s4 + "px 0 " + SPACE.s2 + "px", paddingLeft: SPACE.s1, ...style }}>
      <div style={{ ...TYPE.tiny, fontWeight: 700, letterSpacing: 1.5, color: th.t2 }}>{children}</div>
      {right}
    </div>
  );
});

/** Karta ichidagi sarlavha. */
export const SubHeader = memo(function SubHeader({ th, children, right, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s3, ...style }}>
      <div style={{ ...TYPE.heading, fontSize: TYPE.heading.fontSize - 3, color: th.t1 }}>{children}</div>
      {right}
    </div>
  );
});

/** Vizual ajratgich. label ixtiyoriy ("yoki" kabi). */
export const SectionDivider = memo(function SectionDivider({ th, label, style }) {
  if (!label) return <div style={{ height: 1, background: th.bor, margin: SPACE.s4 + "px 0", ...style }} />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, margin: SPACE.s4 + "px 0", ...style }}>
      <div style={{ flex: 1, height: 1, background: th.bor }} />
      <span style={{ ...TYPE.tiny, color: th.t3 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: th.bor }} />
    </div>
  );
});
