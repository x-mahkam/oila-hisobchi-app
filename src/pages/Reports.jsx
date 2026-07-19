import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { KatIco, DarIco } from "../components/common/index.jsx";
import {
  PageHeader, SectionHeader, SubHeader, AppCard, InfoCard, Badge,
  PrimaryButton, GhostButton, PremiumButton, LinearProgress, Dialog, UIAvatar,
} from "../components/ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, SHADOW, Z, CHART, OPACITY, MOTION } from "../utils/tokens.js";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { KATS, KN, DARS, DN, RELATIONS } from "../utils/constants.js";
import { tm, td } from "../utils/formatters.js";
import { db } from "../firebase.js";
// ── Sprint 3B: Smart Budget AI (Reports integratsiyasi) ──
import { computeBudgetAI } from "../ai/budgetEngine.js";
import { ReportsAISummary, MonthlySummaryCard } from "../ai/BudgetComponents.jsx";
import { computeSmart } from "../goals/smartEngine.js";
import { getMeta } from "../goals/smartStore.js";

// ── Reports-lokal outline SVG ikonkalar (emoji o'rniga, DS 6-qoida) ──
const RIco = {
  hand: (c, s=18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4" width="13" height="9" rx="1.8" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><circle cx="8" cy="8.5" r="2" stroke={c} strokeWidth="1.1"/></svg>,
  target: (c, s=18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.2" opacity=".4"/><circle cx="8" cy="8" r="3.8" stroke={c} strokeWidth="1.2" opacity=".7"/><circle cx="8" cy="8" r="1.4" fill={c}/></svg>,
  box: (c, s=18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2.5 5L8 2l5.5 3v6L8 14l-5.5-3V5z" fill={c} opacity=".1" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M2.5 5L8 8l5.5-3M8 8v6" stroke={c} strokeWidth="1.1"/></svg>,
  trophy: (c, s=20) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M5 2h6v4a3 3 0 01-6 0V2z" fill={c} opacity=".15" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 3H2.5c0 2 1 3.5 2.5 3.5M11 3h2.5c0 2-1 3.5-2.5 3.5M8 9v2.5M5.5 13.5h5M8 11.5v2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  gem: (c, s=20) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M5 2.5h8L16.5 7 9 15.5 1.5 7 5 2.5z" fill={c} opacity=".15" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M1.5 7h15M6.5 7L9 15.5 11.5 7" stroke={c} strokeWidth="1.1"/></svg>,
  bolt: (c, s=20) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M9 1.5L3 9h4l-1 5.5L12 7H8l1-5.5z" fill={c} opacity=".2" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  medal: (c, s=18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="10" r="4" fill={c} opacity=".15" stroke={c} strokeWidth="1.2"/><path d="M5.5 6.8L3.5 1.5h3L8 4.5l1.5-3h3l-2 5.3" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  lock: (c, s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke={c} strokeWidth="1.2"/><circle cx="8" cy="10.5" r="1" fill={c}/></svg>,
  check: (c, s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  warn: (c, s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2L1.5 13.5h13L8 2z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6.5v3.2" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.8" r=".8" fill={c}/></svg>,
  chevD: (c, sz=10, open=false) => <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: MOTION.trFast("transform"), display: "inline-block" }}><path d="M4 6l4 4 4-4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  coin: (c, s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M8 4.5v7M6 6.2c0-.9.9-1.4 2-1.4s2 .5 2 1.3c0 2-4 1.6-4 3.6 0 .8.9 1.3 2 1.3s2-.5 2-1.4" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  cal: (c, s=18) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><rect x="2" y="3.5" width="14" height="12" rx="2.5" stroke={c} strokeWidth="1.4"/><path d="M2 7.5h14M6 2v3M12 2v3" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
};

export default function ReportsPage({
  user, azolar, qarzlar, maq,
  th, t, f, lg, scr, isPremium, isAdmin,
  bX, bD, jX, jD, bdj, canSeeReport, xar, dar,
  hisFil, setHisFil,
  exportLoading, exportExcel, exportPDF,
  adv, advL, advErr, aiAdv, setScr,
  adminStats, adminLoad, loadAdminStats,
}) {
  // PDF hisobot doirasi: o'zimning / oilamning
  const [pdfScope, setPdfScope] = useState(canSeeReport ? "family" : "mine");
  // Hisobot davri: joriy oy (standart) yoki maxsus sana oralig'i
  const [rangeMode, setRangeMode] = useState("month");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const exportRange = rangeMode === "custom" && (rangeFrom || rangeTo) ? { from: rangeFrom || null, to: rangeTo || null } : null;
  const STY = useMemo(() => makeS(th), [th]);

  // ═══ Sprint 3B: SMART BUDGET AI — Reports uchun trend/summary ═══
  const [weddings, setWeddings] = useState([]);
  useEffect(() => {
    if (!user?.oilaId) return;
    db.g("toy_" + user.oilaId).then(v => { if (v && Array.isArray(v.saved)) setWeddings(v.saved); }).catch(() => {});
  }, [user?.oilaId]);
  const aiCats = useMemo(() => KATS.map((k, i) => ({ id: k.id, name: (KN[lg] || KN.uz)[i], color: k.c })), [lg]);
  const aiMine = canSeeReport ? null : (x => x.uid === user?.id || !x.uid);
  const reportAI = useMemo(() => computeBudgetAI({
    xar: xar || [], dar: dar || [], qarzlar: qarzlar || [], maq: maq || [], cats: aiCats,
    budgetLimit: bdj, mine: aiMine, weddings, sharedGoals: (maq || []).filter(m => m.shared),
    computeSmart, getMeta, now: new Date(),
  }), [xar, dar, qarzlar, maq, aiCats, bdj, canSeeReport, user?.id, weddings]);

  // (Admin panel olib tashlandi — alohida admin-sayt orqali.)

  // ── AI maslahat ──────────────────────────────────────────
  if (scr === "maslahat") {
    return (
      <div>
        <PageHeader th={th} title={t.aa} onBack={setScr ? () => setScr("hisobot") : undefined} />
        {advL ? (
          /* 1) LOADING — tahlil tayyorlanmoqda */
          <div style={{ textAlign: "center", padding: SPACE.s16 + "px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: SPACE.s3 }}>{Ico.brain(th.ac)}<div style={{ ...TYPE.body, color: th.t2 }}>{t.an}</div></div>
        ) : advErr ? (
          /* 2) ERROR — tushunarli xabar + Retry */
          <>
            <InfoCard th={th} icon={RIco.warn(th.rd, 18)}>{advErr}</InfoCard>
            <PrimaryButton th={th} onClick={aiAdv} style={{ marginTop: SPACE.s2 + 2 }}>{Ico.repeat("#fff")}{t("rp_retry")}</PrimaryButton>
          </>
        ) : adv ? (
          /* 3) NATIJA */
          <AppCard th={th} style={{ lineHeight: 1.85, ...TYPE.body, color: th.t1, whiteSpace: "pre-wrap" }}>{adv}</AppCard>
        ) : (
          /* 4) Bo'sh holat (sahifaga to'g'ridan-to'g'ri kelinsa) */
          <InfoCard th={th} icon={Ico.brain(th.ac)}>{t("rp_startAnalysisHint")}</InfoCard>
        )}
        {!advL && !advErr && <PrimaryButton th={th} onClick={aiAdv} style={{ marginTop: SPACE.s2 + 2 }}>{Ico.repeat("#fff")}{t.na}</PrimaryButton>}
      </div>
    );
  }

  // ── Asosiy hisobot sahifasi ──────────────────────────────
  const effFil = canSeeReport ? hisFil : user?.id;
  const fX = effFil === "all" ? bX : bX.filter(x => x.uid === effFil);
  const fD = effFil === "all" ? bD : bD.filter(d => d.uid === effFil);
  const fjX = fX.reduce((s, x) => s + Number(x.summa || 0), 0);
  const fjD = fD.reduce((s, d) => s + Number(d.summa || 0), 0);
  const fb = fjD - fjX;

  return (
    <div>
      <PageHeader th={th} title={tm() + " " + t.mr} />

      {!canSeeReport && azolar.length > 1 && (
        <InfoCard th={th} icon={RIco.lock(th.ac)}>{t("rp_onlyOwnReport")}</InfoCard>
      )}

      {/* ── YANGI: Vizual chart bloki ── */}
      <ReportVisualBlock
        th={th} lg={lg} t={t} f={f}
        bX={bX} bD={bD} fjX={fjX} fjD={fjD}
        KATS={KATS} KN={KN}
        xar={xar} dar={dar} user={user} azolar={azolar} canSeeReport={canSeeReport}
      />

      {/* Sprint 3B: AI Summary — trend tahlili + oylik xulosa */}
      <SectionHeader th={th}>{t("rp_usefulAnalysis")}</SectionHeader>
      <MonthlySummaryCard th={th} lg={lg} f={f} ai={reportAI} />
      <ReportsAISummary th={th} lg={lg} f={f} summary={reportAI.summary} trends={reportAI.trends} />

      {/* Moliyaviy sog'liq skor */}
      {(() => {
       try {
        // Xavfsiz manbalar: prop kelmasa ham sahifa qulamaydi
        const sXar = Array.isArray(xar) ? xar : [];
        const sDar = Array.isArray(dar) ? dar : [];
        const sMaq = Array.isArray(maq) ? maq : [];
        const sQarz = Array.isArray(qarzlar) ? qarzlar : [];
        const sBdj = Number(bdj) || 0;
        // Joriy oy bo'sh bo'lsa — oxirgi 30 kun, u ham bo'sh bo'lsa — butun davr
        let hX = Number(jX) || 0, hD = Number(jD) || 0, hSrc = Array.isArray(bX) ? bX : [], hFb = false;
        if (hX === 0 && hD === 0) {
          const cut = new Date(Date.now() - 30 * 86400000);
          const cs = `${cut.getFullYear()}-${String(cut.getMonth()+1).padStart(2,"0")}-${String(cut.getDate()).padStart(2,"0")}`;
          hSrc = sXar.filter(x => x.sana && x.sana >= cs);
          hX = hSrc.reduce((s, x) => s + Number(x.summa || 0), 0);
          hD = sDar.filter(d => d.sana && d.sana >= cs).reduce((s, d) => s + Number(d.summa || 0), 0);
          hFb = true;
        }
        if (hX === 0 && hD === 0 && (sXar.length > 0 || sDar.length > 0)) {
          hSrc = sXar;
          hX = sXar.reduce((s, x) => s + Number(x.summa || 0), 0);
          hD = sDar.reduce((s, d) => s + Number(d.summa || 0), 0);
          hFb = true;
        }
        let score = 40; // Base score
        const checks = [];

        // 1. Income vs Expense (Max 25 pts)
        if (hD > hX) {
          const ratio = hX > 0 ? hD / hX : 2;
          const pts = ratio >= 1.5 ? 25 : Math.round(15 + (ratio - 1) * 20);
          score += pts;
          checks.push({ ok: true, t: t("rp_incomeExceeds", { pts }) });
        } else {
          const lossRatio = hD > 0 ? (hX - hD) / hD : 1;
          const penalty = Math.min(25, Math.round(10 + lossRatio * 15));
          score -= penalty;
          checks.push({ ok: false, t: t("rp_expenseExceeds", { penalty }) });
        }

        // 2. Budget Control (Max 20 pts)
        if (sBdj > 0) {
          if (hX <= sBdj) {
            const usagePct = hX / sBdj;
            const pts = Math.max(5, Math.round((1 - usagePct) * 20));
            score += pts;
            checks.push({ ok: true, t: t("rp_withinBudget", { pts }) });
          } else {
            const overPct = (hX - sBdj) / sBdj;
            const penalty = Math.min(20, Math.round(10 + overPct * 20));
            score -= penalty;
            checks.push({ ok: false, t: t("rp_overBudget", { penalty }) });
          }
        }

        // 3. Savings Rate (Max 20 pts)
        const savePct = hD > 0 ? ((hD - hX) / hD) * 100 : 0;
        if (savePct >= 30) {
          score += 20;
          checks.push({ ok: true, t: t("rp_outstandingSavings") });
        } else if (savePct >= 10) {
          const pts = Math.round(10 + (savePct - 10) * 0.5);
          score += pts;
          checks.push({ ok: true, t: t("rp_goodSavings", { pct: Math.round(savePct), pts }) });
        } else if (savePct > 0) {
          score += 5;
          checks.push({ ok: true, t: t("rp_someSavings") });
        } else {
          checks.push({ ok: false, t: t("rp_noSavings") });
        }

        // 4. Category Diversification (Max 15 pts)
        if (hX > 0) {
          const catSums = KATS.map((k, i) => ({
            id: k.id,
            nom: KN[lg][i],
            sum: hSrc.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0)
          })).sort((a, b) => b.sum - a.sum);
          const topKat = catSums[0];
          const topRatio = topKat ? topKat.sum / hX : 0;
          if (topRatio < 0.4) {
            score += 15;
            checks.push({ ok: true, t: t("rp_balancedExpenses") });
          } else if (topRatio <= 0.6) {
            score += 5;
            checks.push({ ok: true, t: t("rp_catShareHigh", { cat: topKat.nom }) });
          } else if (topKat) {
            score -= 5;
            checks.push({ ok: false, t: t("rp_catTooHigh", { cat: topKat.nom }) });
          }
        }

        // 5. Goals / Dreams (Max 10 pts)
        if (sMaq.length > 0) {
          score += 10;
          checks.push({ ok: true, t: t("rp_hasGoals") });
        } else {
          checks.push({ ok: false, t: t("rp_noGoals") });
        }

        // 6. Active Debt Burden (Penalty up to 10 pts)
        const activeDebt = sQarz.filter(q => !q.paid && q.tur === "olgan").reduce((s, q) => s + Number(q.summa || 0), 0);
        if (activeDebt > 0 && hD > 0) {
          if (activeDebt > hD * 2) {
            score -= 10;
            checks.push({ ok: false, t: t("rp_debtTooHigh") });
          } else if (activeDebt > hD) {
            score -= 5;
            checks.push({ ok: false, t: t("rp_debtExceedsIncome") });
          }
        }

        score = Math.max(0, Math.min(100, Math.round(score)));
        const sColor = score >= 80 ? th.gr : score >= 55 ? th.am : th.rd;
        const sLabel = score >= 80 ? t("rp_excellent") : score >= 55 ? t("rp_good") : t("rp_needsWork");
        if (hX === 0 && hD === 0) return (
          <AppCard th={th} style={{ textAlign: "center", padding: SPACE.s4 + 2 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s1 + 2 }}>{Ico.brain(th.t3)}</div>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.t1 }}>{t("rp_financialHealth")}</div>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: SPACE.s1 }}>{t("rp_addDataHint")}</div>
          </AppCard>
        );
        return (
          <AppCard th={th}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s4, marginBottom: SPACE.s3 + 2 }}>
              <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke={th.bor} strokeWidth="8" /><circle cx="40" cy="40" r="34" fill="none" stroke={sColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 * (1 - score / 100)} transform="rotate(-90 40 40)" /></svg>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={{ ...TYPE.title, fontSize: TYPE.title.fontSize + 2, color: sColor, fontVariantNumeric: "tabular-nums" }}>{score}</span><span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontSize: TYPE.tiny.fontSize - 1, color: th.t2 }}>/100</span></div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, fontWeight: 600, marginBottom: 2 }}>{t("rp_financialHealth")}{hFb ? t("rp_last30d") : ""}</div>
                <div style={{ ...TYPE.heading, fontSize: TYPE.heading.fontSize + 1, color: sColor }}>{sLabel}</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid " + th.bor, paddingTop: SPACE.s3 }}>
              {checks.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s2 - 1, ...TYPE.caption, color: th.t1 }}>
                  <span style={{ flexShrink: 0, display: "flex" }}>{c.ok ? RIco.check(th.gr) : RIco.warn(th.am)}</span>{c.t}
                </div>
              ))}
            </div>
          </AppCard>
        );
       } catch (e) { console.error("health widget:", e); return null; }
      })()}

      {hisFil === "all" && canSeeReport && azolar.length > 1 && (() => {
        const memStats = azolar.map(a => {
          const ax = bX.filter(x => x.uid === a.id).reduce((s, x) => s + Number(x.summa || 0), 0);
          const ad = bD.filter(d => d.uid === a.id).reduce((s, d) => s + Number(d.summa || 0), 0);
          const cnt = bX.filter(x => x.uid === a.id).length + bD.filter(d => d.uid === a.id).length;
          return { ...a, ax, ad, bal: ad - ax, cnt };
        });
        const topSaver = [...memStats].sort((p, q) => q.bal - p.bal)[0];
        const lowSpender = [...memStats].filter(m => m.ax > 0).sort((p, q) => p.ax - q.ax)[0];
        const mostActive = [...memStats].sort((p, q) => q.cnt - p.cnt)[0];
        const awards = [];
        if (topSaver && topSaver.bal > 0) awards.push({ ico: RIco.trophy, color: th.am, titleKey: "rp_topSaver", who: topSaver, val: "+" + f(topSaver.bal, true) });
        if (lowSpender && mostActive && lowSpender.id !== (topSaver && topSaver.id)) awards.push({ ico: RIco.gem, color: th.gr, titleKey: "rp_lowestSpender", who: lowSpender, val: f(lowSpender.ax, true) });
        if (mostActive && mostActive.cnt > 0) awards.push({ ico: RIco.bolt, color: th.ac, titleKey: "rp_mostActive", who: mostActive, val: mostActive.cnt + t("rp_recordsWord") });
        if (awards.length === 0) return null;
        return (
          <AppCard th={th} style={{ background: th.am + ALPHA.faint, border: "1.5px solid " + th.am + ALPHA.med, marginTop: SPACE.s2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s1 }}>{RIco.medal(th.am)}<div style={{ ...TYPE.body, fontWeight: 800, color: th.am }}>{t("rp_familyRanking")}</div></div>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginBottom: SPACE.s3 + 2 }}>{tm()} · {t("rp_monthAchievements")}</div>
            {awards.map((aw, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: th.sur, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + (SPACE.s3 + 2) + "px", marginBottom: SPACE.s2 + 1, border: "1px solid " + aw.color + ALPHA.med }}>
                <div style={{ width: SPACE.s8 + SPACE.s2 + 2, height: SPACE.s8 + SPACE.s2 + 2, borderRadius: RADIUS.s + 2, background: aw.color + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{aw.ico(aw.color)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: aw.color, fontWeight: 700, marginBottom: 2 }}>{t(aw.titleKey)}</div>
                  <div style={{ ...TYPE.body, fontWeight: 700, color: th.t1, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}><UIAvatar th={th} src={aw.who.photo} name={aw.who.ism} size={20} />{aw.who.ism}{aw.who.id === user.id && <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontSize: TYPE.tiny.fontSize - 1, color: aw.color }}>({t.me})</span>}</div>
                </div>
                <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 800, color: aw.color, flexShrink: 0, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{aw.val}</div>
              </div>
            ))}
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, textAlign: "center", marginTop: SPACE.s1 + 2, fontStyle: "italic" }}>{t("rp_encourageSavings")}</div>
          </AppCard>
        );
      })()}

      {/* Hisobot doirasi: O'zimning / Oilamning */}
      <div style={{ marginTop: SPACE.s1 + 2, marginBottom: SPACE.s2 + 2 }}>
        <SectionHeader th={th} style={{ margin: "0 0 " + (SPACE.s2 - 1) + "px" }}>{t("rp_downloadReport")}</SectionHeader>
        {canSeeReport && azolar.length > 1 && (
          <div style={{ display: "flex", background: th.surH, borderRadius: RADIUS.s + 2, padding: 3, gap: 3, border: "1.5px solid " + th.bor, marginBottom: SPACE.s2 + 2 }}>
            {[["mine", t("rp_mineLabel")], ["family", t("rp_familyLabel")]].map(([key, label]) => (
              <button key={key} className="ui-press" onClick={() => setPdfScope(key)} style={{
                flex: 1, padding: (SPACE.s2 + 1) + "px 0", border: "none", borderRadius: RADIUS.s - 1, cursor: "pointer", fontFamily: "inherit",
                fontWeight: 700, fontSize: TYPE.caption.fontSize + 1, transition: MOTION.tr("background"),
                background: pdfScope === key ? th.ac : "transparent",
                color: pdfScope === key ? "#fff" : th.t2,
              }}>{label}</button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", background: th.surH, borderRadius: RADIUS.s + 2, padding: 3, gap: 3, border: "1.5px solid " + th.bor, marginBottom: SPACE.s2 + 2 }}>
          {[["month", t("rp_thisMonth")], ["custom", t("rp_customRange")]].map(([key, label]) => (
            <button key={key} className="ui-press" onClick={() => setRangeMode(key)} style={{
              flex: 1, padding: (SPACE.s2 + 1) + "px 0", border: "none", borderRadius: RADIUS.s - 1, cursor: "pointer", fontFamily: "inherit",
              fontWeight: 700, fontSize: TYPE.caption.fontSize + 1, transition: MOTION.tr("background"),
              background: rangeMode === key ? th.ac : "transparent",
              color: rangeMode === key ? "#fff" : th.t2,
            }}>{label}</button>
          ))}
        </div>
        {rangeMode === "custom" && (
          <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s2 + 2 }}>
            <div style={{ flex: 1 }}>
              <label style={STY.lb}>{t("rp_fromDate")}</label>
              <input type="date" style={STY.ip} value={rangeFrom} max={rangeTo || td()} onChange={(e) => setRangeFrom(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={STY.lb}>{t("rp_toDate")}</label>
              <input type="date" style={STY.ip} value={rangeTo} min={rangeFrom} max={td()} onChange={(e) => setRangeTo(e.target.value)} />
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2 + 2 }}>
        <button className="ui-press" onClick={() => exportExcel(exportRange)} disabled={exportLoading} style={{ ...STY.bt(th.gr, th.gr), marginBottom: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 + 2, opacity: exportLoading ? OPACITY.disabled : 1, position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white" opacity=".2" /><path d="M5 6l2.5 3L5 12M9 12h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {exportLoading ? "..." : "Excel"}{!isPremium && <Badge th={th} type="pro" style={{ position: "absolute", top: -SPACE.s1 - 2, right: -SPACE.s1 - 2 }} />}
        </button>
        <button className="ui-press" onClick={() => exportPDF(pdfScope, exportRange)} style={{ ...STY.bt(th.rd, th.rd), marginBottom: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 + 2 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white" opacity=".2" /><path d="M5 4h5l3 3v7H5V4z" stroke="white" strokeWidth="1.3" strokeLinejoin="round" /><line x1="7" y1="10" x2="11" y2="10" stroke="white" strokeWidth="1.2" strokeLinecap="round" /></svg>
          PDF{!isPremium && <Badge th={th} type="pro" style={{ position: "absolute", top: -SPACE.s1 - 2, right: -SPACE.s1 - 2 }} />}
        </button>
      </div>
      {isPremium
        ? <PrimaryButton th={th} onClick={aiAdv} style={{ marginTop: SPACE.s2 }}>{Ico.brain("#fff")}{t.aa}</PrimaryButton>
        : <PremiumButton th={th} onClick={aiAdv} style={{ marginTop: SPACE.s2 }}>{Ico.brain("#fff")}{t.aa}<Badge th={th} type="pro" icon={null} /></PremiumButton>}
    </div>
  );
}


// ── ISO hafta helperlari: hafta DOIM Dushanbadan boshlanadi ──
function getISOWeekR(d) {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const jan1 = new Date(date.getFullYear(), 0, 1);
  return Math.round(((date - jan1) / 86400000 - 3 + (jan1.getDay() + 6) % 7) / 7) + 1;
}
function getMondayR(year, week) {
  const jan4 = new Date(year, 0, 4);
  const jd = jan4.getDay() || 7; // 1=Du ... 7=Ya
  const m = new Date(jan4);
  m.setDate(jan4.getDate() - (jd - 1) + (week - 1) * 7);
  return m;
}
// Mahalliy sana (toISOString UTC+5 da 1 kun orqaga surib yuboradi)
function fmtLocalR(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
const WEEKDAYS_SHORT = {
  uz: ["Du","Se","Ch","Pa","Ju","Sh","Ya"],
  en: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  ru: ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
  kk: ["Дс","Сс","Ср","Бс","Жм","Сб","Жс"],
  ky: ["Дүй","Шейш","Шар","Бейш","Жума","Ишм","Жек"],
  tg: ["Дш","Сш","Чш","Пш","Ҷм","Шн","Як"],
  qr: ["Dú","Se","Sá","Pú","Jm","Sn","Ya"],
}; // Dushanba → Yakshanba
const SLIDE_H = 232; // barcha slaydlar bir xil balandlik
const MONTHS_SHORT = {
  uz: ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"],
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  ru: ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"],
  kk: ["Қаң","Ақп","Нау","Сәу","Мам","Мау","Шіл","Там","Қыр","Қаз","Қар","Жел"],
  ky: ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"],
  tg: ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"],
  qr: ["Qań","Aqp","Naw","Sáw","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"],
};
const MONTHS_FULL = {
  uz: ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  ru: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
  kk: ["Қаңтар","Ақпан","Наурыз","Сәуір","Мамыр","Маусым","Шілде","Тамыз","Қыркүйек","Қазан","Қараша","Желтоқсан"],
  ky: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
  tg: ["Январ","Феврал","Март","Апрел","Май","Июн","Июл","Август","Сентябр","Октябр","Ноябр","Декабр"],
  qr: ["Qańtar","Aqpan","Nawrız","Sáwir","Mayıs","Iyun","Iyul","Avgust","Sentyabr","Oktyabr","Noyabr","Dekabr"],
};
const fmtRangeUz = (s, lg = "uz") => { const d = new Date(s); return d.getDate() + " " + (MONTHS_SHORT[lg] || MONTHS_SHORT.uz)[d.getMonth()] + " " + d.getFullYear(); };
const DATE_COLORS = CHART; // DS 2.7: yagona tartibli chart palitra

// ═══════════════════════════════════════════════════════════════
// ReportVisualBlock — 4 slide swipeable chart
// ═══════════════════════════════════════════════════════════════
function ReportVisualBlock({ th, lg, t, f, bX, bD, fjX, fjD, KATS, KN, xar, dar, user, azolar, canSeeReport }) {
  // Kategoriya ikonkasi: mavjud KatIco/DarIco (professional outline), maxsus idlar uchun RIco
  const catIco = (id, c, sz=18) => {
    if (id === "qarz") return RIco.hand(c, sz);
    if (id === "maqsad") return RIco.target(c, sz);
    if (id === "__other" || id === "__rest") return RIco.box(c, sz);
    return <KatIco id={id} c={c} s={sz} />;
  };
  const darIco = (id, c, sz=18) => {
    if (id === "qarz") return RIco.hand(c, sz);
    if (id === "__other" || id === "__rest") return RIco.box(c, sz);
    return <DarIco id={id} c={c} s={sz} />;
  };

  // ── Davr tanlash state ─────────────────────────────────
  const [type,     setType]    = useState("xarajat"); // xarajat | daromad
  const [typeMenu, setTypeMenu] = useState(false);     // tur tanlash dropdown
  const [customRange, setCustomRange] = useState(null); // {from, to} — maxsus davr
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rFrom, setRFrom] = useState("");
  const [rTo,   setRTo]   = useState("");
  const [scope,    setScope]   = useState("mine");   // mine | family
  const [period,   setPeriod]  = useState("oy");     // hafta | oy | yil
  const [slideIdx, setSlideIdx] = useState(0);       // 0=donut+dates, 1=donut+cats, 2=line, 3=oila a'zolari

  // Joriy sana
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth(); // 0-based
  const thisWeek = getISOWeekR(now);

  // Davr variantlari
  const periodOptions = {
    hafta: Array.from({ length: Math.min(thisWeek, 8) }, (_, i) => {
      const w = thisWeek - (Math.min(thisWeek, 8) - 1 - i);
      const mo = getMondayR(thisYear, w);
      const su = new Date(mo.getTime() + 6 * 86400000);
      const sub = `${mo.getDate()}.${String(mo.getMonth()+1).padStart(2,"0")} – ${su.getDate()}.${String(su.getMonth()+1).padStart(2,"0")}`;
      if (w === thisWeek) return { key: `${thisYear}-W${w}`, label: t("rp_thisWeek"), sub };
      if (w === thisWeek - 1) return { key: `${thisYear}-W${w}`, label: t("rp_lastWeek"), sub };
      return { key: `${thisYear}-W${w}`, label: t("rp_weekNum", { w }), sub };
    }),
    oy: Array.from({ length: thisMonth + 1 }, (_, i) => {
      const m = i;
      return { key: `${thisYear}-${String(m+1).padStart(2,"0")}`, label: (MONTHS_FULL[lg] || MONTHS_FULL.uz)[m], sub: String(thisYear) };
    }),
    yil: [
      { key: `${thisYear-2}`, label: String(thisYear-2), sub: "" },
      { key: `${thisYear-1}`, label: t("rp_lastYear"), sub: String(thisYear-1) },
      { key: `${thisYear}`,   label: t("rp_thisYear"), sub: String(thisYear) },
    ],
  };

  const opts = periodOptions[period];
  const [selIdx, setSelIdx] = useState(opts.length - 1);
  const selectedOpt = opts[Math.min(selIdx, opts.length - 1)];
  const scrollRef = useRef(null);

  // Period o'zgarganda oxirgi variantni tanlash
  useEffect(() => {
    const newOpts = periodOptions[period];
    setSelIdx(newOpts.length - 1);
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
      }
    }, 50);
  }, [period]);

  // ── Scope filtri: O'zimning = faqat o'z yozuvlari ─────────
  // To'liq tarix: xar/dar (bX/bD faqat joriy oy — o'tgan davrlar uchun yetmaydi)
  const allXr = (xar && xar.length ? xar : bX) || [];
  const allDr = (dar && dar.length ? dar : bD) || [];
  const srcX = useMemo(() => (scope === "mine" || !canSeeReport)
    ? allXr.filter(x => x.uid === user?.id || !x.uid) : allXr
  , [allXr, scope, canSeeReport, user]);
  const srcD = useMemo(() => (scope === "mine" || !canSeeReport)
    ? allDr.filter(d => d.uid === user?.id || !d.uid) : allDr
  , [allDr, scope, canSeeReport, user]);

  // ── Ma'lumotlarni tanlangan davrga filtrlash ─────────────
  const filteredX = useMemo(() => {
    return srcX.filter(x => {
      if (!x.sana) return false;
      if (customRange) return x.sana >= customRange.from && x.sana <= customRange.to;
      const key = selectedOpt.key;
      if (period === "oy")    return x.sana.startsWith(key);
      if (period === "yil")   return x.sana.startsWith(key.substring(0, 4));
      if (period === "hafta") {
        const d = new Date(x.sana);
        const w = getISOWeekR(d);
        const y = d.getFullYear();
        return `${y}-W${w}` === key;
      }
      return false;
    });
  }, [srcX, selectedOpt, period, customRange]);

  const filteredD = useMemo(() => {
    return srcD.filter(d => {
      if (!d.sana) return false;
      if (customRange) return d.sana >= customRange.from && d.sana <= customRange.to;
      const key = selectedOpt.key;
      if (period === "oy")    return d.sana.startsWith(key);
      if (period === "yil")   return d.sana.startsWith(key.substring(0, 4));
      if (period === "hafta") {
        const dt = new Date(d.sana);
        const w = getISOWeekR(dt);
        const y = dt.getFullYear();
        return `${y}-W${w}` === key;
      }
      return false;
    });
  }, [srcD, selectedOpt, period, customRange]);

  // Tanlangan tur (xarajat/daromad) bo'yicha joriy ma'lumot
  const curr = type === "xarajat" ? filteredX : filteredD;
  const totalX = curr.reduce((s, x) => s + Number(x.summa || 0), 0);

  // Kategoriyalar (xarajat) yoki daromad turlari
  const catData = useMemo(() => {
    if (type === "xarajat") {
      const base = KATS.map((k, i) => {
        const sum = filteredX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0);
        return { id: k.id, name: KN[lg][i], color: k.c, sum };
      });
      // Qarz berish xarajatlari — yorqin rang bilan (qoraytirilmaydi)
      const qzX = filteredX.filter(x => x.kategoriya === "qarz").reduce((s, x) => s + Number(x.summa || 0), 0);
      if (qzX > 0) base.push({ id: "qarz", name: t("rp_loanGiven"), color: CHART[6], sum: qzX });
      // Maqsadga (jamg'armaga) qo'shilgan pul — alohida segment
      const mqX = filteredX.filter(x => x.kategoriya === "maqsad").reduce((s, x) => s + Number(x.summa || 0), 0);
      if (mqX > 0) base.push({ id: "maqsad", name: t("rp_goalSavingsCat"), color: CHART[2], sum: mqX });
      // Ro'yxatda yo'q har qanday kategoriya ham chetda qolmasin — donut DOIM 100%
      const knownX = new Set([...KATS.map(k => k.id), "qarz", "maqsad"]);
      const otherX = filteredX.filter(x => !knownX.has(x.kategoriya)).reduce((s, x) => s + Number(x.summa || 0), 0);
      if (otherX > 0) base.push({ id: "__other", name: t("rp_otherRecords"), color: CHART[7], sum: otherX });
      return base.filter(c => c.sum > 0).sort((a, b) => b.sum - a.sum);
    }
    const base = DARS.map((d, i) => {
      const sum = filteredD.filter(x => x.tur === d.id).reduce((s, x) => s + Number(x.summa || 0), 0);
      return { id: d.id, name: DN[lg]?.[i] || d.id, color: d.c, sum };
    });
    // Qarz olish daromadlari — yorqin rang bilan
    const qzD = filteredD.filter(x => x.tur === "qarz").reduce((s, x) => s + Number(x.summa || 0), 0);
    if (qzD > 0) base.push({ id: "qarz", name: t("rp_loanReceived"), color: CHART[4], sum: qzD });
    // Ro'yxatda yo'q har qanday daromad turi ham chetda qolmasin
    const knownD = new Set([...DARS.map(d => d.id), "qarz"]);
    const otherD = filteredD.filter(x => !knownD.has(x.tur)).reduce((s, x) => s + Number(x.summa || 0), 0);
    if (otherD > 0) base.push({ id: "__other", name: t("rp_otherRecords"), color: CHART[7], sum: otherD });
    return base.filter(c => c.sum > 0).sort((a, b) => b.sum - a.sum);
  }, [filteredX, filteredD, type, lg]);

  // Donut uchun: 6 tadan ko'p bo'lsa, qolganlari "Boshqalar"ga jamlanadi —
  // shunda donut va yon ro'yxat DOIM 100% ga mos keladi
  const donutCats = useMemo(() => {
    if (catData.length <= 6) return catData;
    const top = catData.slice(0, 5);
    const rest = catData.slice(5).reduce((sm, c) => sm + c.sum, 0);
    return [...top, { id: "__rest", name: t("rp_others"), color: CHART[7], sum: rest }];
  }, [catData, lg]);

  // Sanalar bo'yicha xarajatlar (slide 1 uchun)
  const dateData = useMemo(() => {
    const map = {};
    curr.forEach(x => {
      if (!x.sana) return;
      map[x.sana] = (map[x.sana] || 0) + Number(x.summa || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([sana, sum], i) => ({ sana, id: sana, sum, color: DATE_COLORS[i % DATE_COLORS.length] }));
  }, [curr]);

  // Line chart ma'lumotlari (slide 3 uchun)
  const lineData = useMemo(() => {
    if (period === "oy") {
      // Oyning har kuni
      const key = selectedOpt.key;
      const [y, m] = key.split("-").map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = String(i + 1).padStart(2, "0");
        const sana = `${y}-${String(m).padStart(2,"0")}-${day}`;
        const sum = curr.filter(x => x.sana === sana).reduce((s, x) => s + Number(x.summa||0), 0);
        return { label: `${m}/${i+1}`, sum, sana };
      });
    }
    if (period === "hafta") {
      // ISO hafta: Dushanbadan boshlanib, Yakshanbada tugaydi
      const key = selectedOpt.key;
      const [y, wPart] = key.split("-W");
      const monday = getMondayR(parseInt(y), parseInt(wPart));
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday.getTime() + i * 86400000);
        const sana = fmtLocalR(d);
        const sum = curr.filter(x => x.sana === sana).reduce((s, x) => s + Number(x.summa||0), 0);
        return { label: `${(WEEKDAYS_SHORT[lg] || WEEKDAYS_SHORT.uz)[i]} ${d.getDate()}`, sum, sana };
      });
    }
    if (period === "yil") {
      const y = parseInt(selectedOpt.key.slice(0,4));
      const monShort = MONTHS_SHORT[lg] || MONTHS_SHORT.uz;
      return Array.from({ length: 12 }, (_, i) => {
        const prefix = `${y}-${String(i+1).padStart(2,"0")}`;
        const sum = curr.filter(x => x.sana?.startsWith(prefix)).reduce((s, x) => s + Number(x.summa||0), 0);
        return { label: monShort[i], sum };
      });
    }
    return [];
  }, [curr, period, selectedOpt]);

  const lineMax = Math.max(...lineData.map(d => d.sum), 1);
  const lineAvg = lineData.length ? Math.round(lineData.reduce((s, d) => s + d.sum, 0) / lineData.filter(d=>d.sum>0).length || 0) : 0;

  // ── 4-slayd: oila a'zolari xarajat ulushi ─────────────────
  const MEM_COLORS = CHART; // DS 2.7 palitra
  const members = useMemo(() => {
    if (scope !== "family" || !canSeeReport || !(azolar || []).length) return [];
    return azolar.map((a, i) => ({
      id: a.id, ism: a.ism || "?", color: MEM_COLORS[i % MEM_COLORS.length],
      sum: curr.filter(x => x.uid === a.id || (!x.uid && a.id === user?.id))
        .reduce((s, x) => s + Number(x.summa || 0), 0),
    })).filter(m => m.sum > 0).sort((a, b) => b.sum - a.sum);
  }, [azolar, curr, scope, canSeeReport, user]);
  const memTotal = members.reduce((s, m) => s + m.sum, 0);
  const [hovMem, setHovMem] = useState(null);

  // ── Swipe ────────────────────────────────────────────────
  const maxSlide = customRange ? 1 : ((scope === "family" && canSeeReport) ? 3 : 2);

  // Har 5 soniyada slaydlar avtomatik ravishda chapga surilib turadi (0 -> 1 -> 2 -> 3 -> 0)
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx(current => {
        if (current >= maxSlide) return 0;
        return current + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [maxSlide]);

  const touchStart = useRef(null);
  const onTouchStart = e => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (dx < -40) setSlideIdx(s => Math.min(s + 1, maxSlide));
    if (dx >  40) setSlideIdx(s => Math.max(s - 1, 0));
    touchStart.current = null;
  };

  // ── Donut SVG ────────────────────────────────────────────
  const DonutEl = ({ size = 140, highlightIdx, data = catData, total = totalX }) => {
    const cx = size/2, cy = size/2, R = size*0.36, ri = size*0.24, gap = 0.025;
    if (!data.length || total === 0) {
      const [noDataL1, noDataL2] = t("rp_noDataShort").toUpperCase().split("\n");
      return (
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke={th.bor} strokeWidth={R-ri} opacity={0.3}/>
          <circle cx={cx} cy={cy} r={ri-3} fill={th.bg}/>
          <text x={cx} y={cy-6} textAnchor="middle" fill={th.t3} fontSize={9} fontWeight={600}>{noDataL1}</text>
          <text x={cx} y={cy+8} textAnchor="middle" fill={th.t3} fontSize={9} fontWeight={600}>{noDataL2}</text>
        </svg>
      );
    }
    let cursor = -Math.PI/2;
    const segs = data.map((cat, i) => {
      const angle = (cat.sum / total) * 2 * Math.PI - gap;
      const sa = cursor + gap/2, ea = cursor + gap/2 + angle;
      cursor += angle + gap;
      const large = angle > Math.PI ? 1 : 0;
      const d = [
        `M ${cx+R*Math.cos(sa)} ${cy+R*Math.sin(sa)}`,
        `A ${R} ${R} 0 ${large} 1 ${cx+R*Math.cos(ea)} ${cy+R*Math.sin(ea)}`,
        `L ${cx+ri*Math.cos(ea)} ${cy+ri*Math.sin(ea)}`,
        `A ${ri} ${ri} 0 ${large} 0 ${cx+ri*Math.cos(sa)} ${cy+ri*Math.sin(sa)}`,
        "Z"
      ].join(" ");
      const midA = sa + angle/2;
      return { ...cat, d, midA, i };
    });
    return (
      <svg width={size} height={size} style={{overflow:"visible"}}>
        <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke={th.bor} strokeWidth={R-ri} opacity={0.25}/>
        {segs.map((seg, i) => (
          <path key={seg.id} d={seg.d} fill={seg.color}
            opacity={highlightIdx===null||highlightIdx===undefined ? 0.9 : highlightIdx===i ? 1 : 0.3}
            style={{
              transform: highlightIdx===i ? `translate(${Math.cos(seg.midA)*5}px,${Math.sin(seg.midA)*5}px)` : "none",
              transition:"all .18s ease",
              filter: highlightIdx===i ? `drop-shadow(0 0 6px ${seg.color}88)` : "none",
            }}
          />
        ))}
        <circle cx={cx} cy={cy} r={ri-3} fill={th.bg}/>
      </svg>
    );
  };

  const fmtN = n => n >= 1000000 ? (n/1000000).toFixed(1)+" mln" : n >= 1000 ? Math.round(n/1000)+"K" : String(n);
  const [hovCat, setHovCat] = useState(null);

  return (
    <div style={{ marginBottom: 18 }}>

      {/* ── Sarlavha / Orqaga qaytish (agar customRange bo'lsa) ── */}
      {customRange && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <button className="ui-press" onClick={() => { setCustomRange(null); setSlideIdx(0); }} aria-label="Orqaga" style={{ width: 36, height: 36, borderRadius: RADIUS.s, background: th.surH, border: "1.5px solid " + th.bor, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke={th.t1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{ ...TYPE.body, fontWeight: 700, marginLeft: 10, color: th.t1 }}>{t("rp_backToDefault")}</span>
        </div>
      )}

      {/* ── YANGI: Filtirlar bloki (Xarajat/Daromad, O'zim/Oila va Hafta/Oy/Yil) ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        
        {/* Row 1: [Xarajat / Daromad] va [O'zim / Oila] */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          
          {/* Xarajat / Daromad Toggle */}
          <div style={{ display: "flex", background: th.surH, borderRadius: RADIUS.s, padding: 2, border: "1.5px solid " + th.bor, flex: 1.2 }}>
            {[["xarajat", t("rp_expenseToggle")], ["daromad", t("rp_incomeToggle")]].map(([key, label]) => {
              const active = type === key;
              return (
                <button key={key} className="ui-press" onClick={() => { setType(key); setSlideIdx(0); setHovCat(null); setHovMem(null); }} style={{
                  flex: 1, padding: "7px 10px", border: "none", borderRadius: RADIUS.s - 2, cursor: "pointer", fontFamily: "inherit",
                  fontWeight: active ? 800 : 600, fontSize: 12.5, transition: "all 0.15s ease-in-out",
                  background: active ? th.ac : "transparent",
                  color: active ? "#fff" : th.t2,
                }}>{label}</button>
              );
            })}
          </div>

          {/* O'zim / Oila Toggle (Faqat ruxsat bo'lsa) */}
          {canSeeReport && azolar.length > 1 ? (
            <div style={{ display: "flex", background: th.surH, borderRadius: RADIUS.s, padding: 2, border: "1.5px solid " + th.bor, flex: 1 }}>
              {[["mine", t("rp_mineShort")], ["family", t("rp_familyShort")]].map(([key, label]) => {
                const active = scope === key;
                return (
                  <button key={key} className="ui-press" onClick={() => { setScope(key); setSlideIdx(0); }} style={{
                    flex: 1, padding: "7px 10px", border: "none", borderRadius: RADIUS.s - 2, cursor: "pointer", fontFamily: "inherit",
                    fontWeight: active ? 800 : 600, fontSize: 12.5, transition: "all 0.15s ease-in-out",
                    background: active ? th.ac : "transparent",
                    color: active ? "#fff" : th.t2,
                  }}>{label}</button>
                );
              })}
            </div>
          ) : null}

        </div>

        {/* Row 2: [Hafta / Oy / Yil] va Kalendar */}
        {!customRange && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            
            {/* Hafta / Oy / Yil Toggle */}
            <div style={{ display: "flex", background: th.surH, borderRadius: RADIUS.s, padding: 2, border: "1.5px solid " + th.bor, flex: 1 }}>
              {[["hafta", t("rp_week")], ["oy", t("rp_month")], ["yil", t("rp_year")]].map(([key, label]) => {
                const active = period === key;
                return (
                  <button key={key} className="ui-press" onClick={() => setPeriod(key)} style={{
                    flex: 1, padding: "7px 10px", border: "none", borderRadius: RADIUS.s - 2, cursor: "pointer", fontFamily: "inherit",
                    fontWeight: active ? 800 : 600, fontSize: 12.5, transition: "all 0.15s ease-in-out",
                    background: active ? th.ac : "transparent",
                    color: active ? "#fff" : th.t2,
                  }}>{label}</button>
                );
              })}
            </div>

            {/* Kalendar tugmasi */}
            <button className="ui-press" onClick={() => { setRFrom(customRange ? customRange.from : fmtLocalR(new Date(now.getFullYear(), now.getMonth(), 1))); setRTo(customRange ? customRange.to : fmtLocalR(now)); setShowRangePicker(true); }} aria-label={t("rp_pickRange")} style={{ width: 38, height: 38, borderRadius: RADIUS.s, background: th.surH, border: "1.5px solid " + th.bor, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {RIco.cal(th.t1, 18)}
            </button>

          </div>
        )}

      </div>

      {/* ── Davr variantlari (scroll - Compact & Airy) ── */}
      {!customRange && (
      <div ref={scrollRef} className="scrollhide" style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:4, marginBottom:8, scrollbarWidth:"none", borderBottom: "1px solid " + th.bor + "44" }}>
        <style>{`.scrollhide::-webkit-scrollbar{display:none}`}</style>
        {opts.map((opt, i) => (
          <button key={opt.key} className="ui-press" onClick={() => setSelIdx(i)} style={{
            flexShrink: 0, padding: "3px 8px", border: "none", cursor: "pointer", fontFamily: "inherit",
            fontWeight: selIdx===i ? 700 : 400, fontSize: 11, transition: "color 0.15s",
            background: "transparent",
            color: selIdx===i ? th.ac : th.t3,
            borderBottom: selIdx===i ? "2px solid " + th.ac : "2px solid transparent",
            borderRadius: 0,
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {opt.label}
              {opt.sub && <span style={{ ...TYPE.tiny, fontSize: 8.5, textTransform: "none", letterSpacing: 0, color: selIdx===i ? th.ac + "bb" : th.t3, fontWeight: 400 }}>({opt.sub})</span>}
            </span>
          </button>
        ))}
      </div>
      )}

      {/* ── Tanlangan davr ko'rsatkichi (Custom Range) ── */}
      {customRange && (
        <button className="ui-press" onClick={() => { setRFrom(customRange.from); setRTo(customRange.to); setShowRangePicker(true); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s2, width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "2px 0 " + SPACE.s3 + "px", ...TYPE.body, fontSize: 13, fontWeight: 800, color: th.t1, fontFamily: "inherit" }}>
          {fmtRangeUz(customRange.from, lg)}{RIco.chevD(th.t2, 9)}
          <span style={{ color: th.t2, fontWeight: 400 }}>~</span>
          {fmtRangeUz(customRange.to, lg)}{RIco.chevD(th.t2, 9)}
        </button>
      )}

      {/* ── Slide'lar (swipeable) ── */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ background: th.sur, borderRadius: RADIUS.m, border: "1px solid " + th.bor, overflow: "hidden", marginBottom: SPACE.s3, boxShadow: SHADOW.e1 }}
      >
        {/* Slide 0: Donut + sanalar */}
        {slideIdx === 0 && (
          <div style={{ height:SLIDE_H, padding:"0 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flexShrink:0, position:"relative", width:140, height:140 }}>
              <DonutEl size={140} highlightIdx={null} data={dateData} total={dateData.reduce((sm, d) => sm + d.sum, 0)}/>
              <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <div style={{ fontSize: TYPE.caption.fontSize - 1, fontWeight:900, color:th.t1, textAlign:"center", lineHeight:1.2 }}>
                  {totalX > 0 ? "+" + fmtN(totalX) : t("rp_noDataShort")}
                </div>
              </div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              {dateData.length === 0
                ? <div style={{ fontSize: TYPE.caption.fontSize, color:th.t3, lineHeight:1.6 }}>{type==="xarajat"?t("rp_noExpenseData"):t("rp_noIncomeData")}</div>
                : dateData.slice(0,5).map((d) => {
                    const col = d.color || th.ac;
                    return (
                      <div key={d.sana} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <div style={{ width:12, height:12, borderRadius:"50%", background:col, flexShrink:0 }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize: TYPE.caption.fontSize, color:th.t2, fontWeight:600 }}>
                            {(() => {
                              const dt = new Date(d.sana);
                              const months = MONTHS_SHORT[lg] || MONTHS_SHORT.uz;
                              return `${months[dt.getMonth()]} ${dt.getDate()}`;
                            })()}
                          </div>
                        </div>
                        <div style={{ fontSize: TYPE.caption.fontSize, fontWeight:700, color:th.t1, textAlign:"right" }}>
                          {d.sum.toLocaleString("uz-UZ")}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* Slide 1: Donut + kategoriya % */}
        {slideIdx === 1 && (
          <div style={{ height:SLIDE_H, padding:"0 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flexShrink:0, position:"relative", width:140, height:140 }}>
              <DonutEl size={140} highlightIdx={hovCat} data={donutCats} total={totalX}/>
              <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                {hovCat !== null && donutCats[hovCat]
                  ? <>
                      <div style={{ display: "flex" }}>{type === "xarajat" ? catIco(donutCats[hovCat].id, donutCats[hovCat].color) : darIco(donutCats[hovCat].id, donutCats[hovCat].color)}</div>
                      <div style={{ fontSize: TYPE.caption.fontSize - 1, fontWeight:900, color:donutCats[hovCat].color }}>
                        {totalX>0?Math.round(donutCats[hovCat].sum/totalX*100):0}%
                      </div>
                    </>
                  : <div style={{ fontSize: TYPE.caption.fontSize - 1, fontWeight:900, color:th.t1, textAlign:"center", lineHeight:1.2 }}>
                      {totalX > 0 ? "+" + fmtN(totalX) : "—"}
                    </div>
                }
              </div>
            </div>
            <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:7 }}>
              {catData.length === 0
                ? <div style={{ fontSize: TYPE.caption.fontSize, color:th.t3 }}>{type==="xarajat"?t("rp_noExpenseData"):t("rp_noIncomeData")}</div>
                : donutCats.map((cat, i) => (
                    <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer" }}
                      onMouseEnter={() => setHovCat(i)} onMouseLeave={() => setHovCat(null)}
                      onTouchStart={() => setHovCat(i)} onTouchEnd={() => setHovCat(null)}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:cat.color, flexShrink:0 }}/>
                      <span style={{ flex:1, fontSize: TYPE.caption.fontSize, color:th.t1, fontWeight:600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</span>
                      <span style={{ fontSize: TYPE.caption.fontSize, fontWeight:700, color:cat.color, flexShrink:0 }}>
                        {totalX>0?(cat.sum/totalX*100).toFixed(1):0}%
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* Slide 2: Line chart */}
        {slideIdx === 2 && !customRange && (
          <div style={{ height:SLIDE_H, padding:"14px 16px 6px", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", gap:18, marginBottom:6 }}>
              <div style={{ fontSize: TYPE.caption.fontSize, color:th.t2 }}>{t("rp_total")} <b style={{ color:th.t1 }}>{totalX.toLocaleString("uz-UZ")}</b></div>
              <div style={{ fontSize: TYPE.caption.fontSize, color:th.t2 }}>{t("rp_average")} <b style={{ color:th.t1 }}>{lineAvg.toLocaleString("uz-UZ")}</b></div>
            </div>
            <div style={{ flex:1, display:"flex", alignItems:"center", overflow:"hidden" }}>
              <div style={{ width:"100%" }}>
                <LineChartSVG data={lineData} lineMax={lineMax} th={th} f={f}/>
              </div>
            </div>
          </div>
        )}

        {/* Slide 3: Oila a'zolari ulushi — faqat "Oilamning" tanlanganda */}
        {slideIdx === 3 && !customRange && scope === "family" && canSeeReport && (
          <div style={{ height:SLIDE_H, padding:"0 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flexShrink:0, position:"relative", width:140, height:140 }}>
              <DonutEl size={140} highlightIdx={hovMem} data={members} total={memTotal}/>
              <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                {hovMem !== null && members[hovMem]
                  ? <>
                      <div style={{ fontSize: TYPE.tiny.fontSize, fontWeight:800, color:members[hovMem].color, maxWidth:60, overflow:"hidden", textOverflow:"ellipsis", whiteSpace: "nowrap" }}>{members[hovMem].ism?.split(" ")[0]}</div>
                      <div style={{ fontSize: TYPE.caption.fontSize, fontWeight:900, color:members[hovMem].color }}>{memTotal>0?(members[hovMem].sum/memTotal*100).toFixed(1):0}%</div>
                    </>
                  : <>
                      <div style={{ fontSize: TYPE.tiny.fontSize, fontWeight:700, color:th.t2 }}>{t("rp_familyTotalSlide")}</div>
                      <div style={{ fontSize: TYPE.caption.fontSize, fontWeight:900, color:th.t1 }}>{memTotal>0?fmtN(memTotal):"\u2014"}</div>
                    </>
                }
              </div>
            </div>
            <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:6 }}>
              {members.length === 0
                ? <div style={{ fontSize: TYPE.caption.fontSize, color:th.t2 }}>{t("rp_noDataThisPeriod")}</div>
                : members.slice(0,6).map((m, i) => (
                    <div key={m.id} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}
                      onMouseEnter={() => setHovMem(i)} onMouseLeave={() => setHovMem(null)}
                      onTouchStart={() => setHovMem(i)} onTouchEnd={() => setHovMem(null)}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:m.color, flexShrink:0 }}/>
                      <span style={{ flex:1, fontSize: TYPE.caption.fontSize, color:th.t1, fontWeight:600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.ism}</span>
                      <div style={{ textAlign:"right", flexShrink:0, display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ fontSize: TYPE.caption.fontSize, fontWeight:800, color:m.color }}>{memTotal>0?(m.sum/memTotal*100).toFixed(1):0}%</span>
                        <span style={{ fontSize: TYPE.tiny.fontSize, color:th.t2 }}>({m.sum.toLocaleString("uz-UZ")})</span>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* Slide Indicator with Swipe Hint & Apple Style Pills */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0 12px 0", borderTop: "1px solid " + th.bor + "22", background: th.surH + "22" }}>
          {/* Subtle Dynamic Caption describing the active slide */}
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0.2, fontSize: 10.5, color: th.t2, fontWeight: 700, transition: "all 0.2s" }}>
            {slideIdx === 0 && t("rp_slideDaily")}
            {slideIdx === 1 && t("rp_slideCategory")}
            {slideIdx === 2 && t("rp_slideTrend")}
            {slideIdx === 3 && t("rp_slideFamily")}
          </div>

          {/* Swipe indicator dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            {Array.from({ length: maxSlide + 1 }, (_, i) => (
              <div key={i} onClick={() => setSlideIdx(i)} style={{
                width: slideIdx === i ? 18 : 6,
                height: 6,
                borderRadius: RADIUS.pill,
                background: slideIdx === i ? th.ac : th.t3 + ALPHA.strong,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
              }}/>
            ))}
          </div>

          {/* Micro Swipe Invitation */}
          <div style={{ ...TYPE.tiny, textTransform: "none", fontSize: 9, color: th.t3, fontStyle: "italic", opacity: 0.8, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5 }}><path d="M4 10L1 6l3-4M8 2l3 4-3 4" stroke={th.t3} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {t("rp_swipeHint")}
          </div>
        </div>
      </div>

      {/* ── Davr tanlash modali ── */}
      {showRangePicker && (
        <Dialog th={th} open onClose={() => setShowRangePicker(false)} title={t("rp_selectPeriod")}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3 + "px " + SPACE.s1 + "px", borderBottom: "1px solid " + th.bor }}>
            <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.t1 }}>{t("rp_startDate")}</span>
            <input type="date" value={rFrom} onChange={e => setRFrom(e.target.value)} style={{ background: th.surH, border: "1px solid " + th.bor, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px " + (SPACE.s2 + 2) + "px", color: th.t1, fontSize: TYPE.caption.fontSize + 1, fontWeight: 600, fontFamily: "inherit", colorScheme: th.dark ? "dark" : "light" }}/>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3 + "px " + SPACE.s1 + "px", marginBottom: SPACE.s4 + SPACE.s1 }}>
            <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.t1 }}>{t("rp_endDate")}</span>
            <input type="date" value={rTo} onChange={e => setRTo(e.target.value)} style={{ background: th.surH, border: "1px solid " + th.bor, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px " + (SPACE.s2 + 2) + "px", color: th.t1, fontSize: TYPE.caption.fontSize + 1, fontWeight: 600, fontFamily: "inherit", colorScheme: th.dark ? "dark" : "light" }}/>
          </div>
          <div style={{ display: "flex", gap: SPACE.s2 + 2 }}>
            <GhostButton th={th} onClick={() => setShowRangePicker(false)} style={{ flex: 1 }}>{t("rp_cancel")}</GhostButton>
            <PrimaryButton th={th} onClick={() => {
              if (!rFrom || !rTo) return;
              const a2 = rFrom <= rTo ? rFrom : rTo;
              const b2 = rFrom <= rTo ? rTo : rFrom;
              setCustomRange({ from: a2, to: b2 });
              setShowRangePicker(false); setSlideIdx(0); setHovCat(null); setHovMem(null);
            }} style={{ flex: 1, marginBottom: 0 }}>{t("rp_confirm")}</PrimaryButton>
          </div>
        </Dialog>
      )}

      {/* ── Kategoriya breakdown ro'yxati ── */}
      {catData.length > 0 && (
        <AppCard th={th} style={{ padding: SPACE.s4 + "px " + (SPACE.s3 + 2) + "px", marginBottom: 0 }}>
          <div style={{ ...TYPE.tiny, fontWeight: 700, letterSpacing: 1.5, color: th.t2, marginBottom: SPACE.s3 + 2 }}>
            {type==="xarajat" ? t("rp_categories") : t("rp_incomeTypes")}
          </div>
          {catData.map((cat, i) => {
            const pct = totalX>0 ? cat.sum/totalX*100 : 0;
            return (
              <div key={cat.id} style={{ marginBottom: SPACE.s4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, marginBottom: SPACE.s1 + 2 }}>
                  <div style={{ width: SPACE.s8 + SPACE.s1, height: SPACE.s8 + SPACE.s1, borderRadius: RADIUS.s, background: cat.color + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {type === "xarajat" ? catIco(cat.id, cat.color) : darIco(cat.id, cat.color)}
                  </div>
                  <span style={{ flex: 1, ...TYPE.body, fontWeight: 600, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</span>
                  <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.t2, marginRight: SPACE.s2, fontVariantNumeric: "tabular-nums" }}>{pct.toFixed(2)}%</span>
                  <span style={{ ...TYPE.body, fontWeight: 800, color: th.t1, fontVariantNumeric: "tabular-nums" }}>{cat.sum.toLocaleString("uz-UZ")}</span>
                </div>
                <div style={{ marginLeft: SPACE.s12 - 2 }}>
                  <LinearProgress th={th} value={Math.min(100, pct)} tone={cat.color} height={SPACE.s1 + 1} />
                </div>
              </div>
            );
          })}
        </AppCard>
      )}
    </div>
  );
}

// ── Line chart SVG ─────────────────────────────────────────────
function LineChartSVG({ data, lineMax, th, f }) {
  // O'q yozuvlari uchun token rang (dark temada t2 ochiqroq)
  const AXIS = th.dark ? th.t2 : th.t3; // token: o'q yozuvlari
  const W = 320, H = 160, padL = 10, padR = 10, padT = 16, padB = 28;
  const iW = W - padL - padR;
  const iH = H - padT - padB;
  if (!data.length) return null;
  const pts = data.map((d, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * iW,
    y: padT + iH - (d.sum / lineMax) * iH,
    ...d
  }));
  const pathD = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  // show tick labels — first, middle, last, and max point
  const maxPt = pts.reduce((mx, p) => p.sum > mx.sum ? p : mx, pts[0]);
  const labelIdxs = new Set([0, Math.floor(pts.length/2), pts.length-1, pts.indexOf(maxPt)]);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
      {/* Y grid lines */}
      {[0,0.5,1].map((pct, i) => {
        const y = padT + iH * (1 - pct);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W-padR} y2={y} stroke={th.bor} strokeWidth={0.8} strokeDasharray={i>0?"4,4":""}/>
            {i > 0 && <text x={padL} y={y-3} fontSize={9} fill={AXIS} fontWeight={600}>{f(lineMax * pct, true)}</text>}
          </g>
        );
      })}
      {/* Area fill */}
      <path
        d={pathD + ` L ${pts[pts.length-1].x} ${padT+iH} L ${pts[0].x} ${padT+iH} Z`}
        fill={"url(#lineGrad)"}
        opacity={0.15}
      />
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={th.ac} stopOpacity={0.8}/>
          <stop offset="100%" stopColor={th.ac} stopOpacity={0}/>
        </linearGradient>
      </defs>
      {/* Line */}
      <path d={pathD} fill="none" stroke={th.ac} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Dots + labels */}
      {pts.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r={pt.sum > 0 ? 4 : 2.5} fill={pt.sum > 0 ? th.ac : AXIS} opacity={0.9}/>
          {labelIdxs.has(i) && (
            <text x={pt.x} y={H-4} fontSize={9} fill={AXIS} fontWeight={600} textAnchor="middle">{pt.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}
