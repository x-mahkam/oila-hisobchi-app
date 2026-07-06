// ═══════════════════════════════════════════════════════════
//  SMART GOALS — UI (Component Kit + tokens asosida)
//  Barcha o'lcham/rang tokenlardan. th birinchi prop. memo.
//  Firebase/App state'ga bog'liq emas — faqat (goal, meta, lg, f).
// ═══════════════════════════════════════════════════════════
import { memo, useSyncExternalStore, useMemo } from "react";
import { SPACE, RADIUS, TYPE, ALPHA, MOTION } from "../utils/tokens.js";
import { AppCard } from "../components/ui/index.js";
import { T } from "./i18n.js";
import { computeSmart, buildTimeline, aiTips, STATUS } from "./smartEngine.js";
import { previewSchedule } from "./notifications.js";
import { allMeta, subscribe, getMeta } from "./smartStore.js";

// ── React subscription: SMART meta o'zgarsa qayta render ──────
export function useSmartMeta() {
  return useSyncExternalStore(subscribe, allMeta, allMeta);
}
export function useGoalMeta(id) {
  useSmartMeta();
  return getMeta(id);
}

// ── Status → rang (th tokenlaridan) ─────────────────────────
export function statusColor(status, th) {
  switch (status) {
    case STATUS.DONE:
    case STATUS.AHEAD:
    case STATUS.ON_TRACK: return th.gr;
    case STATUS.SLIGHTLY: return th.am;
    case STATUS.SERIOUS:
    case STATUS.OVERDUE:  return th.rd;
    default: return th.ac;
  }
}
const toneColor = (tone, th) => tone === "danger" ? th.rd : tone === "warn" ? th.am : tone === "ok" ? th.gr : th.ac;

const fmtDate = (v, lg) => {
  const d = new Date(v);
  if (isNaN(d)) return "";
  const loc = lg === "ru" ? "ru-RU" : lg === "en" ? "en-US" : "uz-UZ";
  return d.toLocaleDateString(loc, { day: "numeric", month: "short", year: "2-digit" });
};

// ═══ Progress Ring — token-driven SVG, markazda foiz + health rang ═══
export const ProgressRing = memo(function ProgressRing({ th, value = 0, status, size = SPACE.s16 + SPACE.s6, stroke = SPACE.s2, sub }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const c = statusColor(status, th);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={th.bor} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - v / 100)} style={{ transition: MOTION.trSlow("stroke-dashoffset") }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ ...TYPE.title, fontSize: Math.round(size * 0.24), color: th.t1, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{Math.round(v)}%</span>
        {sub != null && <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: c, marginTop: SPACE.s1, fontWeight: 800 }}>{sub}</span>}
      </div>
    </div>
  );
});

// ═══ Health Card ═══
export const HealthCard = memo(function HealthCard({ th, smart, lg }) {
  const c = statusColor(smart.status, th);
  const label = T(smart.status, lg);
  const dot = smart.status === STATUS.SERIOUS || smart.status === STATUS.OVERDUE ? "🔴"
    : smart.status === STATUS.SLIGHTLY ? "🟡" : "🟢";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: c + ALPHA.faint, border: "1px solid " + c + ALPHA.med, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
      <ProgressRing th={th} value={smart.progress} status={smart.status} size={SPACE.s16} stroke={SPACE.s1 + 2} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{T("health", lg)}</div>
        <div style={{ ...TYPE.subtitle, fontWeight: 800, color: c, display: "flex", alignItems: "center", gap: SPACE.s1 + 1 }}>
          <span style={{ fontSize: TYPE.caption.fontSize }}>{dot}</span>{label}
        </div>
        <div style={{ ...TYPE.caption, color: th.t2, marginTop: SPACE.s1, fontVariantNumeric: "tabular-nums" }}>
          {T("health", lg)}: <b style={{ color: c }}>{smart.healthScore}</b>/100
        </div>
      </div>
    </div>
  );
});

// ═══ Prediction Card ═══
export const PredictionCard = memo(function PredictionCard({ th, smart, lg }) {
  const pr = smart.prediction;
  let line, c = th.ac;
  if (!pr.hasPace) { line = T("noPace", lg); c = th.t2; }
  else if (pr.complete) { line = T("aiDone", lg); c = th.gr; }
  else if (pr.diffDays == null) { line = T("finishDate", lg) + ": " + fmtDate(pr.finishDate, lg); }
  else if (pr.diffDays > 2) { line = T("finishEarly", lg, pr.diffDays); c = th.gr; }
  else if (pr.diffDays < -2) { line = T("finishLate", lg, Math.abs(pr.diffDays)); c = th.rd; }
  else { line = T("finishOnTime", lg); c = th.gr; }

  return (
    <div style={{ background: c + ALPHA.faint, border: "1px solid " + c + ALPHA.med, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 1, ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 + 1 }}>
        <Spark c={c} />{T("prediction", lg)}
      </div>
      <div style={{ ...TYPE.caption, color: th.t2, marginBottom: 2 }}>{T("atCurrentPace", lg)}…</div>
      <div style={{ ...TYPE.subtitle, fontWeight: 700, color: c, lineHeight: 1.35 }}>{line}</div>
      {pr.hasPace && !pr.complete && pr.finishDate && (
        <div style={{ ...TYPE.caption, color: th.t2, marginTop: SPACE.s1, fontVariantNumeric: "tabular-nums" }}>
          {T("finishDate", lg)}: <b style={{ color: th.t1 }}>{fmtDate(pr.finishDate, lg)}</b>
        </div>
      )}
    </div>
  );
});

// ═══ Countdown + Per-period ═══
export const CountdownCard = memo(function CountdownCard({ th, smart, lg, f }) {
  if (!smart.hasDeadline) return null;
  const cells = [
    { n: smart.daysLeft, l: T("day", lg) },
    { n: smart.weeksLeft, l: T("week", lg) },
    { n: smart.monthsLeft, l: T("month", lg) },
  ];
  const plan = [
    { l: T("perDay", lg), v: smart.perDay },
    { l: T("perWeek", lg), v: smart.perWeek },
    { l: T("perMonth", lg), v: smart.perMonth },
  ];
  const overdue = smart.overdue;
  const accent = overdue ? th.rd : th.ac;
  return (
    <div style={{ background: th.surH, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
      <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s2 }}>{T("countdown", lg)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: SPACE.s2, marginBottom: smart.complete ? 0 : SPACE.s3 }}>
        {cells.map((c, i) => (
          <div key={i} style={{ textAlign: "center", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.s, padding: SPACE.s2 + "px 0" }}>
            <div style={{ ...TYPE.heading, color: accent, fontVariantNumeric: "tabular-nums" }}>{overdue && i === 0 ? "0" : c.n}</div>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>{c.l}</div>
          </div>
        ))}
      </div>
      {!smart.complete && (
        <>
          <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s2 }}>{T("perPeriod", lg)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s1 + 2 }}>
            {plan.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", ...TYPE.caption }}>
                <span style={{ color: th.t2 }}>{p.l}</span>
                <span style={{ color: th.t1, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{f(p.v, true)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

// ═══ Timeline ═══
const TL_ICON = {
  created: (c) => <circle cx="5" cy="5" r="3.4" fill="none" stroke={c} strokeWidth="1.6" />,
  added:   (c) => <path d="M5 1.6v6.8M1.6 5h6.8" stroke={c} strokeWidth="1.8" strokeLinecap="round" />,
  edited:  (c) => <path d="M2 8L7 3l1.4 1.4L3.4 9.4 1.6 9.4 2 8z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill="none" />,
  deadline:(c) => <><rect x="1.5" y="2.4" width="7" height="6" rx="1.4" stroke={c} strokeWidth="1.2" fill="none" /><path d="M1.5 4.4h7" stroke={c} strokeWidth="1.2" /></>,
  done:    (c) => <path d="M2 5.2l2 2 4-4.4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
};

export const Timeline = memo(function Timeline({ th, goal, meta, lg, f }) {
  const items = useMemo(() => buildTimeline(goal, meta, lg), [goal, meta, lg]);
  if (!items.length) return null;
  return (
    <div style={{ background: th.surH, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
      <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s3 }}>{T("timeline", lg)}</div>
      <div style={{ position: "relative" }}>
        {items.map((it, i) => {
          const color = it.type === "done" ? th.gr : it.type === "added" ? th.ac : it.type === "deadline" ? th.am : th.t2;
          const last = i === items.length - 1;
          return (
            <div key={i} style={{ display: "flex", gap: SPACE.s3, position: "relative", paddingBottom: last ? 0 : SPACE.s3 }}>
              {!last && <span style={{ position: "absolute", left: SPACE.s3 - 1, top: SPACE.s4, bottom: 0, width: 2, background: th.bor }} />}
              <span style={{ position: "relative", zIndex: 1, width: SPACE.s6, height: SPACE.s6, borderRadius: RADIUS.full, background: color + ALPHA.tint, border: "1px solid " + color + ALPHA.strong, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 10 10">{TL_ICON[it.type]?.(color)}</svg>
              </span>
              <div style={{ minWidth: 0, flex: 1, paddingTop: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: SPACE.s2, alignItems: "baseline" }}>
                  <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{it.label}</span>
                  {it.amount != null && <span style={{ ...TYPE.caption, fontWeight: 800, color: th.ac, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>+{f(it.amount, true)}</span>}
                </div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>
                  {fmtDate(it.at, lg)}{it.who ? " · " + it.who : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ═══ AI Card ═══
export const AICard = memo(function AICard({ th, smart, goal, lg, f }) {
  const tips = useMemo(() => aiTips(smart, goal, lg, f), [smart, goal, lg, f]);
  if (!tips.length) return null;
  return (
    <div style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 1, ...TYPE.tiny, color: th.ac, marginBottom: SPACE.s2, fontWeight: 700 }}>
        <Spark c={th.ac} />{T("aiTips", lg)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
        {tips.map((tip, i) => {
          const c = toneColor(tip.tone, th);
          return (
            <div key={i} style={{ display: "flex", gap: SPACE.s2, alignItems: "flex-start" }}>
              <span style={{ width: SPACE.s2 - 2, height: SPACE.s2 - 2, borderRadius: RADIUS.full, background: c, marginTop: SPACE.s1 + 1, flexShrink: 0 }} />
              <span style={{ ...TYPE.caption, color: th.t1, lineHeight: 1.45 }}>{tip.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ═══ Notification preview (architecture) ═══
export const NotificationPreview = memo(function NotificationPreview({ th, goal, lg }) {
  const items = useMemo(() => previewSchedule(goal, new Date(), lg), [goal, lg]);
  if (!items.length) return null;
  return (
    <div style={{ background: th.surH, border: "1px dashed " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px" }}>
      <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s2, display: "flex", alignItems: "center", gap: SPACE.s1 + 1 }}>
        <Bell c={th.t2} />{T("notifs", lg)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s1 + 2 }}>
        {items.map((n, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: SPACE.s2, ...TYPE.caption }}>
            <span style={{ color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
            <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.s - SPACE.s1, padding: "2px " + SPACE.s2 + "px", flexShrink: 0 }}>{n.when}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ═══ Orkestrator: bitta maqsad ichidagi to'liq SMART panel ═══
export const SmartGoalDetail = memo(function SmartGoalDetail({ th, goal, lg, f, onAddDeadline }) {
  const meta = useGoalMeta(goal.id);
  const smart = useMemo(() => computeSmart(goal, meta, new Date()), [goal, meta]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3, marginTop: SPACE.s3, paddingTop: SPACE.s3, borderTop: "1px solid " + th.bor }} className="ui-fadeUp">
      {!smart.hasDeadline && !smart.complete ? (
        <button className="ui-press" onClick={onAddDeadline}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s2, background: th.am + ALPHA.faint, border: "1px solid " + th.am + ALPHA.strong, borderRadius: RADIUS.m, padding: SPACE.s3 + "px", color: th.am, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", ...TYPE.caption }}>
          <Bell c={th.am} />{T("setDeadlineCta", lg)}
        </button>
      ) : (
        <HealthCard th={th} smart={smart} lg={lg} />
      )}
      {smart.hasDeadline && !smart.complete && <PredictionCard th={th} smart={smart} lg={lg} />}
      {smart.hasDeadline && !smart.complete && <CountdownCard th={th} smart={smart} lg={lg} f={f} />}
      <AICard th={th} smart={smart} goal={goal} lg={lg} f={f} />
      <Timeline th={th} goal={goal} meta={meta} lg={lg} f={f} />
      {!smart.complete && <NotificationPreview th={th} goal={goal} lg={lg} />}
    </div>
  );
});

// ── kichik ikonkalar ──
function Spark({ c }) {
  return <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.2 3.4L11.6 5 8.6 6.9 9.4 10.4 7 8.4 4.6 10.4 5.4 6.9 2.4 5l3.4-.6L7 1z" fill={c} opacity=".9" /></svg>;
}
function Bell({ c }) {
  return <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1.5a3.5 3.5 0 00-3.5 3.5v2L2 9.5h10L10.5 7V5A3.5 3.5 0 007 1.5zM5.5 11a1.5 1.5 0 003 0" stroke={c} strokeWidth="1.2" strokeLinejoin="round" fill="none" /></svg>;
}
