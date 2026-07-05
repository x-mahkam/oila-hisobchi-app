// ═══════════════════════════════════════════════════════════
//  CARDS
//  Qayerda: barcha sahifalarning asosiy qurilish bloki.
//  Qachon: mazmunan bog'liq kontentni guruhlash.
//  Qachon EMAS: bitta qator matn uchun (ListItem), sahifa
//              sarlavhasi uchun (Header), 3+ ichma-ich karta TAQIQ.
//  Tokenlar: RADIUS.m/l, SPACE, SHADOW, ALPHA, TYPE, PREMIUM.
//  Dark mode: th.sur/bor/surH orqali; soyalar dark'da bor bilan
//             almashadi (SHADOW.e0 + border naqshi).
//  A11y: onClick berilsa <button>, berilmasa <div> — yolg'on
//        affordance yo'q; bosiladigan kartada chevron majburiy emas
//        lekin tavsiya etiladi.
//  Animation: bosiladigan karta .ui-press; boshqasi statik.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { RADIUS, SPACE, SHADOW, ALPHA, TYPE, PREMIUM, OPACITY } from "../../utils/tokens.js";
import { Badge } from "./Badge.jsx";
import { injectUiCss } from "./motion.js";

/** Bazaviy karta. onClick berilsa bosiladigan bo'ladi. */
export const AppCard = memo(function AppCard({ th, children, onClick, pad = SPACE.s4, style }) {
  injectUiCss();
  const s = { background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: pad, marginBottom: SPACE.s3, boxSizing: "border-box", ...style };
  if (onClick) return <button className="ui-press" onClick={onClick} style={{ ...s, width: "100%", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "block" }}>{children}</button>;
  return <div style={s}>{children}</div>;
});

/** Statistika katagi (raqam+label). Qatorda 3-4 tasi yonma-yon. */
export const StatCard = memo(function StatCard({ th, icon, value, label, tone, style }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s2 + "px", textAlign: "center", boxSizing: "border-box", ...style }}>
      {icon && <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s1 + 2 }}>{icon}</div>}
      <div style={{ ...TYPE.heading, color: tone || th.t1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ ...TYPE.tiny, color: th.t2, marginTop: SPACE.s1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
});

/** Ma'lumot urg'usi (indigo soft). Bir ekranda ≤2. */
export const InfoCard = memo(function InfoCard({ th, icon, title, children, style }) {
  return (
    <div style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px", marginBottom: SPACE.s3, display: "flex", gap: SPACE.s3, alignItems: "flex-start", ...style }}>
      {icon && <span style={{ flexShrink: 0, marginTop: 2 }}>{icon}</span>}
      <div style={{ minWidth: 0 }}>
        {title && <div style={{ ...TYPE.caption, fontWeight: 700, color: th.ac, marginBottom: SPACE.s1 - 1 }}>{title}</div>}
        <div style={{ ...TYPE.caption, color: th.t2, lineHeight: 1.5 }}>{children}</div>
      </div>
    </div>
  );
});

/** Ogohlantirish. tone="danger" kritik holat uchun. */
export const WarningCard = memo(function WarningCard({ th, icon, title, children, tone, style }) {
  const c = tone === "danger" ? th.rd : th.am;
  return (
    <div style={{ background: c + ALPHA.faint, border: "1.5px solid " + c + ALPHA.strong, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px", marginBottom: SPACE.s3, display: "flex", gap: SPACE.s3, alignItems: "flex-start", ...style }}>
      {icon && <span style={{ flexShrink: 0, marginTop: 2 }}>{icon}</span>}
      <div style={{ minWidth: 0 }}>
        {title && <div style={{ ...TYPE.caption, fontWeight: 700, color: c, marginBottom: SPACE.s1 - 1 }}>{title}</div>}
        <div style={{ ...TYPE.caption, color: th.t2, lineHeight: 1.5 }}>{children}</div>
      </div>
    </div>
  );
});

/** Premium taklif kartasi. Faqat monetizatsiya kontekstida. */
export const PremiumCard = memo(function PremiumCard({ th, active, title, sub, features = [], onClick, cta, style }) {
  injectUiCss();
  const gold = PREMIUM.gold;
  return (
    <button className="ui-press" onClick={onClick}
      style={{ width: "100%", background: active ? gold + ALPHA.faint : th.ac + ALPHA.faint, border: "1.5px solid " + (active ? gold + ALPHA.strong : th.ac + ALPHA.med), borderRadius: RADIUS.m, padding: SPACE.s4, marginBottom: SPACE.s3, cursor: "pointer", textAlign: "left", fontFamily: "inherit", boxSizing: "border-box", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: (!active && features.length) ? SPACE.s3 : 0 }}>
        <div style={{ width: SPACE.s8 + SPACE.s2 + 2, height: SPACE.s8 + SPACE.s2 + 2, borderRadius: RADIUS.s + 3, background: active ? PREMIUM.grad : "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 2.5h8L16.5 7 9 15.5 1.5 7 5 2.5z" fill="#fff" opacity=".25" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/><path d="M1.5 7h15M6.5 7L9 15.5 11.5 7" stroke="#fff" strokeWidth="1.1"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...TYPE.subtitle, fontWeight: 800, color: active ? gold : th.ac }}>{title}</div>
          {sub && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontSize: TYPE.tiny.fontSize + 1, color: th.t2, marginTop: 2 }}>{sub}</div>}
        </div>
        {cta}
      </div>
      {!active && features.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2 }}>
          {features.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.s1, background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + (SPACE.s2 + 2) + "px" }}>
              <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontSize: TYPE.tiny.fontSize + 1, fontWeight: 600, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f}</span>
              <Badge th={th} type="pro" />
            </div>
          ))}
        </div>
      )}
    </button>
  );
});

/** Kontent yo'q holati kartasi (EmptyState uchun konteyner). */
export const EmptyCard = memo(function EmptyCard({ th, children, style }) {
  return (
    <div style={{ background: th.sur, border: "1px dashed " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s8 + "px " + SPACE.s4 + "px", marginBottom: SPACE.s3, textAlign: "center", ...style }}>
      {children}
    </div>
  );
});

/**
 * GlassCard — EHTIYOTKORLIK bilan: blur WebView'da qimmat.
 * Faqat rasm/gradient USTIDA ishlatiladi (Garden overlay, hero ichi).
 * Oddiy fonda AppCard ishlating. Past qurilmalar uchun solid fallback bor.
 */
export const GlassCard = memo(function GlassCard({ th, children, pad = SPACE.s4, style }) {
  return (
    <div style={{ background: th.dark ? "rgba(17,24,39," + OPACITY.hint + ")" : "rgba(255,255,255," + OPACITY.hint + ")", backdropFilter: "blur(" + SPACE.s4 + "px)", WebkitBackdropFilter: "blur(" + SPACE.s4 + "px)", border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: pad, boxSizing: "border-box", ...style }}>
      {children}
    </div>
  );
});
