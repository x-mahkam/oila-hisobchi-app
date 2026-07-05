// ═══════════════════════════════════════════════════════════
//  CHART CONTAINERS
//  Qayerda: Reports, Charts, Dashboard grafiklari atrofida.
//  Qachon: har grafik ChartCard ichida — yagona ramka, sarlavha, legend.
//  Qachon EMAS: bu komponentlar GRAFIK CHIZMAYDI (recharts/canvas
//              chizadi) — faqat konteyner/legend/tooltip qatlami.
//  Tokenlar: CHART palitra (tartib qat'iy!), RADIUS, SPACE, TYPE, SHADOW.e2.
//  Qoida (DS 2.7): ≤6 segment, qolgani "Boshqa"; legend rang-nuqta +
//        nom + qiymat; kategoriya rangi CHART[i] tartibidan.
//  Dark mode: grid chiziqlar th.bor, tooltip th.sur+e2.
//  A11y: legend matni — grafik rangining matnli dublikati (rang
//        yagona signal emas); tooltip pointer-events yo'q.
//  Animation: konteyner .ui-fadeUp; grafik animatsiyasi chizuvchi
//        kutubxona zimmasida (faqat birinchi renderda, DS 5.12).
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { CHART, RADIUS, SPACE, TYPE, SHADOW } from "../../utils/tokens.js";
import { injectUiCss } from "./motion.js";

/** i-kategoriya rangi — doim CHART palitradan, aylanadi. */
export const chartColor = i => CHART[i % CHART.length];

/** Grafik kartasi: sarlavha + right slot + grafik (children). */
export const ChartCard = memo(function ChartCard({ th, title, right, children, style }) {
  injectUiCss();
  return (
    <div className="ui-fadeUp" style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s4, marginBottom: SPACE.s3, ...style }}>
      {(title || right) && <ChartHeader th={th} title={title} right={right} />}
      {children}
    </div>
  );
});

/** Grafik sarlavhasi (ChartCard ichida avtomatik, alohida ham ishlatiladi). */
export const ChartHeader = memo(function ChartHeader({ th, title, sub, right, style }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: SPACE.s2, marginBottom: SPACE.s3, ...style }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ ...TYPE.heading, fontSize: TYPE.heading.fontSize - 3, color: th.t1 }}>{title}</div>
        {sub && <div style={{ ...TYPE.caption, color: th.t2, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
});

/**
 * Legend: items [{label, value, color?, pct?}].
 * color berilmasa CHART[i] avtomatik.
 */
export const ChartLegend = memo(function ChartLegend({ th, items = [], style }) {
  return (
    <div style={{ marginTop: SPACE.s3, ...style }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", gap: SPACE.s2, padding: (SPACE.s1 + 2) + "px 0", borderBottom: i < items.length - 1 ? "1px solid " + th.bor : "none" }}>
          <span style={{ width: SPACE.s2 + 2, height: SPACE.s2 + 2, borderRadius: RADIUS.full, background: it.color || chartColor(i), flexShrink: 0 }} />
          <span style={{ flex: 1, ...TYPE.caption, fontWeight: 600, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
          {it.pct !== undefined && <span style={{ ...TYPE.caption, color: th.t2, fontVariantNumeric: "tabular-nums" }}>{it.pct}%</span>}
          <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, fontVariantNumeric: "tabular-nums" }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
});

/** Tooltip kartasi — recharts custom tooltip yoki canvas overlay uchun. */
export const ChartTooltip = memo(function ChartTooltip({ th, title, rows = [], style }) {
  return (
    <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.s, boxShadow: SHADOW.e2, padding: SPACE.s2 + "px " + SPACE.s3 + "px", pointerEvents: "none", ...style }}>
      {title && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s1 }}>{title}</div>}
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>
          {r.color && <span style={{ width: SPACE.s2, height: SPACE.s2, borderRadius: RADIUS.full, background: r.color }} />}
          <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, fontVariantNumeric: "tabular-nums" }}>{r.text}</span>
        </div>
      ))}
    </div>
  );
});
