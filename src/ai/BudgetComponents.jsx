// ─────────────────────────────────────────────────────────────
//  SMART BUDGET AI — UI komponentlari (Sprint 3B)
//  Barchasi Component Kit + tokens ustida. React.memo, useMemo.
//  Dark mode / reduced-motion / large-font — tokenlar orqali meros.
// ─────────────────────────────────────────────────────────────
import { memo, useState, useRef, useEffect } from "react";
import { SPACE, TYPE, RADIUS, ALPHA, CHART } from "../utils/tokens.js";
import { AppCard, StatCard, CircularProgress } from "../components/ui/index.js";
import { T } from "./i18n.js";

// ── Daraja rangi (DS: faqat th/CHART) ────────────────────────
export function levelColor(level, th) {
  return level === "excellent" ? th.gr
    : level === "attention" ? th.am
    : level === "risk" ? CHART[6]           // orange
    : th.rd;                                 // critical
}
const dirColor = (dir, th) => dir === "up" ? th.rd : dir === "down" ? th.gr : th.t3;

// ── Kichik lokal ikonkalar (outline, DS 6-qoida) ─────────────
const AIco = {
  arrowUp: c => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 13V4M4 7.5L8 3.5l4 4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrowDn: c => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v9M4 8.5L8 12.5l4-4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  flat: c => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  spark: c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.6 4.9 4.9 1.6-4.9 1.6L8 14.5l-1.6-4.9L1.5 8l4.9-1.6L8 1.5z" fill={c} opacity=".18" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  shield: c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l5 2v4c0 3.2-2.1 5.3-5 6.5-2.9-1.2-5-3.3-5-6.5v-4l5-2z" fill={c} opacity=".14" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  pig: c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 8.5c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4c0 1-.4 1.6-.4 1.6l.9 1.4h-1.6l-.6-.9c-.7.3-1.5.4-2.3.4-.5 0-1 0-1.4-.2l-.5.7H8l.1-1.1C4.4 11.1 2.5 10 2.5 8.5z" fill={c} opacity=".14" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/><circle cx="9.5" cy="7.5" r=".7" fill={c}/></svg>,
  chart: c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13h12M4 11V6M8 11V3M12 11V8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  chevD: (c, open) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}><path d="M4 6l4 4 4-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ══════════════════════════════════════════════════════════════
//  1) BUDGET HEALTH CARD
// ══════════════════════════════════════════════════════════════
export const BudgetHealthCard = memo(function BudgetHealthCard({ th, lg, health }) {
  if (!health) return null;
  const c = levelColor(health.level, th);
  const lvlKey = "lvl" + health.level.charAt(0).toUpperCase() + health.level.slice(1);
  return (
    <AppCard th={th}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
        <CircularProgress th={th} value={health.score} size={SPACE.s16 + SPACE.s4} stroke={SPACE.s1 + 2} tone={c} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...TYPE.caption, color: th.t2, textTransform: "uppercase", letterSpacing: ".04em" }}>{T("cardHealth", lg)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, margin: `${SPACE.s1}px 0 ${SPACE.s2}px` }}>
            <span style={{ width: 10, height: 10, borderRadius: RADIUS.full, background: c, flexShrink: 0 }} />
            <span style={{ ...TYPE.subtitle, color: th.t1, fontWeight: 800 }}>{T(lvlKey, lg)}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: SPACE.s1 + 2 }}>
            {health.factors.map(fac => {
              const fc = fac.state === "good" ? th.gr : fac.state === "mid" ? th.am : th.rd;
              return (
                <span key={fac.key} style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: fc, background: fc + ALPHA.faint, border: "1px solid " + fc + ALPHA.tint, borderRadius: RADIUS.pill, padding: `2px ${SPACE.s2}px` }}>
                  {T(fac.key, lg)}: {T("fac" + fac.state.charAt(0).toUpperCase() + fac.state.slice(1), lg)}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </AppCard>
  );
});

// ══════════════════════════════════════════════════════════════
//  2) FORECAST CARD
// ══════════════════════════════════════════════════════════════
export const ForecastCard = memo(function ForecastCard({ th, lg, f, forecast }) {
  if (!forecast) return null;
  let line, tone = th.t2;
  if (!forecast.hasData) line = T("fcNoData", lg);
  else {
    line = T("fcSpend", lg, f(forecast.projected, true));
    if (forecast.overBudget) { line += " " + T("fcOver", lg, forecast.daysEarly); tone = th.rd; }
    else if (forecast.hasBudget) { line += " " + T("fcOk", lg); tone = th.gr; }
    else line += " " + T("fcNoBudget", lg);
  }
  return (
    <AppCard th={th}>
      <CardHead th={th} icon={AIco.chart(th.ac)} title={T("cardForecast", lg)} />
      <div style={{ ...TYPE.body, color: th.t1, lineHeight: 1.5 }}>{line}</div>
      {forecast.hasData && (
        <div style={{ display: "flex", gap: SPACE.s2, marginTop: SPACE.s3 }}>
          <StatCard th={th} value={f(forecast.projected)} label={T("projected", lg)} tone={tone} />
          {forecast.hasBudget && <StatCard th={th} value={f(forecast.dailyRate)} label={T("thisMonth", lg) + "/" + T("perDay", lg)} />}
        </div>
      )}
    </AppCard>
  );
});

// ══════════════════════════════════════════════════════════════
//  3) EXPENSE TREND CARD
// ══════════════════════════════════════════════════════════════
export const TrendCard = memo(function TrendCard({ th, lg, f, trends }) {
  const [open, setOpen] = useState(false);
  if (!trends || !trends.length) return (
    <AppCard th={th}><CardHead th={th} icon={AIco.chart(th.ac)} title={T("cardTrend", lg)} /><div style={{ ...TYPE.caption, color: th.t2 }}>{T("trNone", lg)}</div></AppCard>
  );
  const shown = open ? trends : trends.slice(0, 4);
  return (
    <AppCard th={th}>
      <CardHead th={th} icon={AIco.chart(th.ac)} title={T("cardTrend", lg)} right={<span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>{T("trVs", lg)}</span>} />
      <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s1 }}>
        {shown.map(tr => {
          const dc = dirColor(tr.dir, th);
          const ic = tr.dir === "up" ? AIco.arrowUp(dc) : tr.dir === "down" ? AIco.arrowDn(dc) : AIco.flat(dc);
          return (
            <div key={tr.id} style={{ display: "flex", alignItems: "center", gap: SPACE.s2, padding: `${SPACE.s2}px 0`, borderBottom: "1px solid " + th.bor }}>
              <span style={{ width: 8, height: 8, borderRadius: RADIUS.full, background: tr.color, flexShrink: 0 }} />
              <span style={{ ...TYPE.body, color: th.t1, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tr.name}</span>
              <span style={{ ...TYPE.caption, color: th.t2, fontVariantNumeric: "tabular-nums" }}>{f(tr.cur)}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: dc, ...TYPE.caption, fontWeight: 700, minWidth: 52, justifyContent: "flex-end" }}>
                {ic}{tr.pct > 0 ? "+" : ""}{tr.pct}%
              </span>
            </div>
          );
        })}
      </div>
      {trends.length > 4 && (
        <button className="ui-press" onClick={() => setOpen(o => !o)} style={ghostBtn(th)}>
          {T(open ? "showLess" : "showMore", lg)} {AIco.chevD(th.ac, open)}
        </button>
      )}
    </AppCard>
  );
});

// ══════════════════════════════════════════════════════════════
//  4) SAVINGS COACH CARD
// ══════════════════════════════════════════════════════════════
export const SavingsCoachCard = memo(function SavingsCoachCard({ th, lg, f, savings, wedding, family }) {
  if (!savings) return null;
  const lines = [];
  if (!savings.hasData) lines.push({ t: T("scNoIncome", lg), tone: th.t2 });
  else if (savings.positive) {
    lines.push({ t: T("scSaved", lg, f(savings.saved, true)), tone: th.gr });
    if (savings.monthsToFund) lines.push({ t: T("scFund", lg, savings.monthsToFund), tone: th.t1 });
  } else lines.push({ t: T("scNeg", lg, f(Math.abs(savings.saved), true)), tone: th.rd });

  if (wedding && wedding.top) {
    lines.push(wedding.top.onPlan
      ? { t: T("wedReady", lg), tone: th.gr }
      : { t: T("wedNeed", lg, f(wedding.top.perMonth, true)), tone: th.t1 });
  }
  if (family && family.has) lines.push({ t: T("famProgress", lg, family.pct), tone: th.t1 });

  return (
    <AppCard th={th}>
      <CardHead th={th} icon={AIco.pig(th.gr)} title={T("cardSavings", lg)} />
      <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: SPACE.s2, alignItems: "flex-start" }}>
            <span style={{ width: 6, height: 6, borderRadius: RADIUS.full, background: l.tone, marginTop: 7, flexShrink: 0 }} />
            <span style={{ ...TYPE.body, color: th.t1, lineHeight: 1.45 }}>{l.t}</span>
          </div>
        ))}
      </div>
    </AppCard>
  );
});

// ══════════════════════════════════════════════════════════════
//  5) RISK ANALYSIS CARD
// ══════════════════════════════════════════════════════════════
export const RiskCard = memo(function RiskCard({ th, lg, f, risks }) {
  const list = risks || [];
  return (
    <AppCard th={th}>
      <CardHead th={th} icon={AIco.shield(list.length ? th.am : th.gr)} title={T("cardRisk", lg)} />
      {!list.length ? (
        <div style={{ ...TYPE.body, color: th.gr }}>{T("riskNone", lg)}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
          {list.map(r => {
            const rc = r.severity === "danger" ? th.rd : th.am;
            const args = (r.args || []).map((a, i) => (r.fmtArg0 && i === 0 ? f(a, true) : a));
            return (
              <div key={r.id} style={{ display: "flex", gap: SPACE.s2, alignItems: "flex-start", background: rc + ALPHA.faint, border: "1px solid " + rc + ALPHA.tint, borderRadius: RADIUS.s, padding: `${SPACE.s2}px ${SPACE.s3}px` }}>
                <span style={{ width: 7, height: 7, borderRadius: RADIUS.full, background: rc, marginTop: 6, flexShrink: 0 }} />
                <span style={{ ...TYPE.caption, color: th.t1, lineHeight: 1.4 }}>{T(r.key, lg, ...args)}</span>
              </div>
            );
          })}
        </div>
      )}
    </AppCard>
  );
});

// ══════════════════════════════════════════════════════════════
//  6) MONTHLY SUMMARY CARD (daromad / xarajat / jamg'arma)
// ══════════════════════════════════════════════════════════════
export const MonthlySummaryCard = memo(function MonthlySummaryCard({ th, lg, f, ai }) {
  if (!ai) return null;
  const saved = ai.income - ai.expense;
  return (
    <AppCard th={th}>
      <CardHead th={th} icon={AIco.spark(th.ac)} title={T("cardSummary", lg)} />
      <div style={{ display: "flex", gap: SPACE.s2 }}>
        <StatCard th={th} value={f(ai.income)} label={T("income", lg)} tone={th.gr} />
        <StatCard th={th} value={f(ai.expense)} label={T("expense", lg)} tone={th.rd} />
        <StatCard th={th} value={f(saved)} label={T("facSavings", lg)} tone={saved >= 0 ? th.ac : th.rd} />
      </div>
    </AppCard>
  );
});

// ══════════════════════════════════════════════════════════════
//  10) QUICK INSIGHT (Hero pastida — ingichka banner)
// ══════════════════════════════════════════════════════════════
export const QuickInsight = memo(function QuickInsight({ th, lg, f, insight, style }) {
  if (!insight) return null;
  const args = (insight.args || []).map((a, i) => (insight.fmtArg0 && i === 0 ? f(a, true) : a));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.tint, borderRadius: RADIUS.m, padding: `${SPACE.s2 + 2}px ${SPACE.s3}px`, marginBottom: SPACE.s3, ...style }}>
      <span style={{ flexShrink: 0 }}>{AIco.spark(th.ac)}</span>
      <span style={{ ...TYPE.caption, color: th.t1, lineHeight: 1.4 }}>
        <b style={{ color: th.ac }}>{T("aiInsight", lg)}: </b>{T(insight.key, lg, ...args)}
      </span>
    </div>
  );
});

// ══════════════════════════════════════════════════════════════
//  7) REPORTS — AI SUMMARY bo'limi
// ══════════════════════════════════════════════════════════════
export const ReportsAISummary = memo(function ReportsAISummary({ th, lg, f, summary, trends }) {
  const items = summary || [];
  return (
    <AppCard th={th}>
      <CardHead th={th} icon={AIco.spark(th.ac)} title={T("aiSummary", lg)} />
      {!items.length ? (
        <div style={{ ...TYPE.caption, color: th.t2 }}>{T("trNone", lg)}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
          {items.map((it, i) => {
            const tone = it.tone === "warn" ? th.am : th.gr;
            const args = (it.args || []).map(a => (a === "up" ? T("trUp", lg) : a === "down" ? T("trDown", lg) : a === "flat" ? T("trFlat", lg) : a));
            return (
              <div key={i} style={{ display: "flex", gap: SPACE.s2, alignItems: "flex-start" }}>
                <span style={{ width: 6, height: 6, borderRadius: RADIUS.full, background: tone, marginTop: 7, flexShrink: 0 }} />
                <span style={{ ...TYPE.body, color: th.t1, lineHeight: 1.45 }}>{T(it.key, lg, ...args)}</span>
              </div>
            );
          })}
        </div>
      )}
      {trends && trends.length > 0 && (
        <div style={{ marginTop: SPACE.s3, paddingTop: SPACE.s3, borderTop: "1px solid " + th.bor, display: "flex", flexDirection: "column", gap: SPACE.s1 }}>
          {trends.slice(0, 3).map(tr => {
            const dc = dirColor(tr.dir, th);
            return (
              <div key={tr.id} style={{ display: "flex", alignItems: "center", gap: SPACE.s2 }}>
                <span style={{ width: 7, height: 7, borderRadius: RADIUS.full, background: tr.color, flexShrink: 0 }} />
                <span style={{ ...TYPE.caption, color: th.t2, flex: 1 }}>{tr.name}</span>
                <span style={{ ...TYPE.caption, color: dc, fontWeight: 700 }}>{tr.pct > 0 ? "+" : ""}{tr.pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </AppCard>
  );
});

// ── CSS Hider for scrollbars ──────────────────────────────────
let aiCssInjected = false;
function injectAiCss() {
  if (aiCssInjected || typeof document === "undefined") return;
  aiCssInjected = true;
  const s = document.createElement("style");
  s.id = "ai-css";
  s.textContent = `
    .hide-scrollbar::-webkit-scrollbar { display: none !important; }
    .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
  `;
  document.head.appendChild(s);
}

// ══════════════════════════════════════════════════════════════
//  ORCHESTRATOR — Dashboard'ga bitta joydan barcha AI kartalar
// ══════════════════════════════════════════════════════════════
export const SmartBudgetSection = memo(function SmartBudgetSection({ th, lg, f, ai }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    injectAiCss();
  }, []);

  const cards = ai ? [
    { key: "health", comp: <BudgetHealthCard th={th} lg={lg} health={ai.health} /> },
    { key: "forecast", comp: <ForecastCard th={th} lg={lg} f={f} forecast={ai.forecast} /> },
    { key: "trends", comp: <TrendCard th={th} lg={lg} f={f} trends={ai.trends} /> },
    { key: "savings", comp: <SavingsCoachCard th={th} lg={lg} f={f} savings={ai.savings} wedding={ai.wedding} family={ai.family} /> },
    { key: "risks", comp: <RiskCard th={th} lg={lg} f={f} risks={ai.risks} /> }
  ] : [];

  useEffect(() => {
    if (!ai) return;
    const timer = setTimeout(() => {
      const nextIdx = (activeIdx + 1) % cards.length;
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          containerRef.current.scrollTo({ left: nextIdx * width, behavior: "smooth" });
          setActiveIdx(nextIdx);
        }
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeIdx, cards.length, ai]);

  const handleScroll = () => {
    if (!containerRef.current || !ai) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    if (index >= 0 && index < cards.length) {
      setActiveIdx(index);
    }
  };

  if (!ai) return null;

  return (
    <div className="anim-fadeUp">
      {/* Swipeable Horizontal Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          gap: SPACE.s3,
          padding: `2px 2px ${SPACE.s3}px 2px`,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="hide-scrollbar"
      >
        {cards.map((card) => (
          <div 
            key={card.key}
            style={{
              flex: "0 0 100%",
              width: "100%",
              scrollSnapAlign: "center",
            }}
          >
            {card.comp}
          </div>
        ))}
      </div>

      {/* Slide dots indicator */}
      <div style={{ display: "flex", justifyContent: "center", gap: SPACE.s2, marginTop: -SPACE.s1, marginBottom: SPACE.s4 }}>
        {cards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (containerRef.current) {
                const width = containerRef.current.clientWidth;
                containerRef.current.scrollTo({ left: idx * width, behavior: "smooth" });
                setActiveIdx(idx);
              }
            }}
            style={{
              width: activeIdx === idx ? 16 : 6,
              height: 6,
              borderRadius: RADIUS.full,
              background: activeIdx === idx ? th.ac : th.bor,
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

// ── Ichki: karta sarlavhasi ──────────────────────────────────
function CardHead({ th, icon, title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ ...TYPE.subtitle, color: th.t1, fontWeight: 700, flex: 1 }}>{title}</span>
      {right}
    </div>
  );
}
function ghostBtn(th) {
  return { display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1, width: "100%", marginTop: SPACE.s2, padding: SPACE.s2 + "px", background: "transparent", border: "none", color: th.ac, ...TYPE.caption, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
}
