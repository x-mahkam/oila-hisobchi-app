// ═══════════════════════════════════════════════════════════
//  PROGRESS
//  Qayerda: budjet limitlari, maqsadlar, bog' darajasi, yuklanish.
//  Qachon: miqdoriy jarayonni ko'rsatish. Har progress yonida
//          ANIQ RAQAM bo'lishi shart (DS 5.11) — faqat chiziq taqiq.
//  Qachon EMAS: noaniq kutish uchun (spinner/skeleton ishlating).
//  Tokenlar: RADIUS.pill/full, SPACE, TYPE, GARDEN, MOTION.
//  Semantika: >80% → am, >100% → rd (auto, budjet rejimida).
//  Dark mode: trek th.bor.
//  A11y: role="progressbar" + aria-valuenow.
//  Animation: to'ldiruv kengligi MOTION.trSlow bilan silliq o'zgaradi.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { RADIUS, SPACE, TYPE, GARDEN, MOTION } from "../../utils/tokens.js";

const clamp = v => Math.max(0, Math.min(100, v));

/** Chiziqli progress. budget=true da rang avtomatik (yashil→amber→qizil). */
export const LinearProgress = memo(function LinearProgress({ th, value = 0, tone, budget, height = SPACE.s2, style }) {
  const v = clamp(value);
  const c = budget ? (value > 100 ? th.rd : value > 80 ? th.am : th.gr) : (tone || th.ac);
  return (
    <div role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}
      style={{ width: "100%", height, borderRadius: RADIUS.pill, background: th.bor, overflow: "hidden", ...style }}>
      <div style={{ width: v + "%", height: "100%", borderRadius: RADIUS.pill, background: c, transition: MOTION.trSlow("width") }} />
    </div>
  );
});

/** Doiraviy progress — markazda foiz/label. */
export const CircularProgress = memo(function CircularProgress({ th, value = 0, size = SPACE.s16, stroke = SPACE.s1, tone, label, style }) {
  const v = clamp(value);
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const c = tone || th.ac;
  return (
    <div role="progressbar" aria-valuenow={Math.round(v)} style={{ position: "relative", width: size, height: size, flexShrink: 0, ...style }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={th.bor} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - v / 100)} style={{ transition: MOTION.trSlow("stroke-dashoffset") }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ ...TYPE.heading, fontSize: Math.round(size * .26), color: th.t1, fontVariantNumeric: "tabular-nums" }}>{Math.round(v)}%</span>
        {label && <span style={{ ...TYPE.tiny, color: th.t2 }}>{label}</span>}
      </div>
    </div>
  );
});

/** Maqsad progressi: doira + nom + qolgan summa (raqam majburiy — DS 5.11). */
export const GoalProgress = memo(function GoalProgress({ th, value = 0, name, detail, tone, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, ...style }}>
      <CircularProgress th={th} value={value} size={SPACE.s12} stroke={SPACE.s1} tone={tone} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TYPE.subtitle, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        {detail && <div style={{ ...TYPE.caption, color: th.t2, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{detail}</div>}
      </div>
    </div>
  );
});

/** Bog' darajasi progressi — FAQAT Baraka Bog'i konteynerida (GARDEN ranglar). */
export const GardenProgress = memo(function GardenProgress({ th, value = 0, height = SPACE.s2 + 2, style }) {
  const v = clamp(value);
  return (
    <div role="progressbar" aria-valuenow={Math.round(v)}
      style={{ width: "100%", height, borderRadius: RADIUS.pill, background: GARDEN.soil + "44", overflow: "hidden", ...style }}>
      <div style={{ width: v + "%", height: "100%", borderRadius: RADIUS.pill, background: "linear-gradient(90deg," + GARDEN.leafDeep + "," + GARDEN.grass + ")", transition: MOTION.trSlow("width") }} />
    </div>
  );
});
