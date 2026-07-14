// ═══════════════════════════════════════════════════════════
//  AVATAR
//  Qayerda: hero kartalar, ro'yxat qatorlari, oila a'zolari.
//  Qachon: shaxsni vizual identifikatsiya qilish.
//  Qachon EMAS: dekorativ maqsadda, kategoriya ikonkasi o'rnida.
//  Tokenlar: RADIUS.full, TYPE (initsial o'lchami nisbiy), PREMIUM.grad, ALPHA.
//  O'lchamlar (DS 5.10): 34 ro'yxat / 44 qator / 64 hero / 78 profil.
//  Dark mode: initsial foni th.ac dan, halqalar bir xil.
//  A11y: img alt=name; initsial variantda role="img" + aria-label.
//  Animation: yo'q (statik identifikator).
//  Eslatma: legacy Av (common) sahifa migratsiyasida shu bilan almashadi.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { RADIUS, ALPHA, PREMIUM, SPACE } from "../../utils/tokens.js";

const RING = { premium: PREMIUM.grad, kid: "linear-gradient(135deg,#f59e0b,#ec4899)" };

/**
 * variant: undefined | "premium" (oltin halqa) | "kid" (issiq halqa)
 */
export const UIAvatar = memo(function UIAvatar({ th, src, name, size = 44, variant, style }) {
  const ini = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const core = src
    ? <img src={src} alt={name} style={{ width: size, height: size, borderRadius: RADIUS.full, objectFit: "cover", display: "block", border: variant ? "none" : "2px solid " + th.ac + ALPHA.strong, boxSizing: "border-box" }} />
    : <div role="img" aria-label={name} style={{ width: size, height: size, borderRadius: RADIUS.full, background: "linear-gradient(135deg," + th.ac + "," + th.ac + "88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * .36), fontWeight: 800, color: "#fff" }}>{ini}</div>;
  if (!variant) return <div style={{ flexShrink: 0, ...style }}>{core}</div>;
  return (
    <div style={{ flexShrink: 0, padding: Math.max(2, Math.round(size * .04)), borderRadius: RADIUS.full, background: RING[variant] || RING.premium, ...style }}>
      <div style={{ padding: 2, borderRadius: RADIUS.full, background: th.sur }}>{core}</div>
    </div>
  );
});

/** Oila a'zolari steki — bir-birining ustiga chiqib turadigan avatarlar + "+N". */
export const FamilyAvatar = memo(function FamilyAvatar({ th, members = [], size = 34, max = 4, style }) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;
  const overlap = Math.round(size * .3);
  return (
    <div style={{ display: "flex", alignItems: "center", ...style }}>
      {shown.map((m, i) => (
        <div key={m.id || i} style={{ marginLeft: i === 0 ? 0 : -overlap, borderRadius: RADIUS.full, border: "2px solid " + th.sur, zIndex: shown.length - i, position: "relative" }}>
          <UIAvatar th={th} src={m.photo} name={m.ism || m.name} size={size} />
        </div>
      ))}
      {rest > 0 && (
        <div style={{ marginLeft: -overlap, width: size, height: size, borderRadius: RADIUS.full, background: th.surH, border: "2px solid " + th.sur, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * .34), fontWeight: 700, color: th.t2, position: "relative", zIndex: 0, boxSizing: "content-box" }}>
          +{rest}
        </div>
      )}
    </div>
  );
});

/** KidAvatar — UIAvatar'ning kid varianti uchun qisqartma. */
export const KidAvatar = memo(function KidAvatar(props) {
  return <UIAvatar {...props} variant="kid" />;
});

/** PremiumAvatar — oltin halqali qisqartma. */
export const PremiumAvatar = memo(function PremiumAvatar(props) {
  return <UIAvatar {...props} variant="premium" />;
});
