import { memo, useMemo, useState, useEffect, useRef } from "react";
import { KatIco, DarIco, MoneyInput } from "../components/common/index.jsx";
import {
  SectionHeader, AppCard, StatCard, ListItem, EmptyState, Skeleton,
  PrimaryButton, GhostButton, DangerButton, Badge, CounterBadge,
  LinearProgress, ChartCard, UIAvatar,
} from "../components/ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, SHADOW, MOTION, OPACITY, COMP } from "../utils/tokens.js";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { KATS, KN, DARS, DN, QUICK_ADD } from "../utils/constants.js";
import { tm } from "../utils/formatters.js";
import { db } from "../firebase.js";
import KidsGames from "../components/KidsGames.jsx";
import KidHome from "./KidHome.jsx";
// ── Sprint 3B: Smart Budget AI (decoupled qatlam — biznes logikaga tegmaydi) ──
import { computeBudgetAI } from "../ai/budgetEngine.js";
import { SmartBudgetSection, QuickInsight } from "../ai/BudgetComponents.jsx";
import { computeSmart } from "../goals/smartEngine.js";
import { getMeta } from "../goals/smartStore.js";

// Kartalar ketma-ket paydo bo'lish qadami (ms) — DS'da stagger tokeni yo'q,
// mavjud UX saqlanadi; kelajakda MOTION'ga ko'chirilishi mumkin.
const STAGGER = 40;

// ── Dashboard-lokal outline SVG ikonkalar (emoji o'rniga, DS 6-qoida) ──
const DIco = {
  target: c => <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.2" opacity=".4"/><circle cx="8" cy="8" r="3.8" stroke={c} strokeWidth="1.2" opacity=".7"/><circle cx="8" cy="8" r="1.4" fill={c}/></svg>,
  cash: c => <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4" width="13" height="9" rx="1.8" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><circle cx="8" cy="8.5" r="2" stroke={c} strokeWidth="1.1"/><path d="M4 6.5v4M12 6.5v4" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  clip: c => <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><rect x="3" y="2.5" width="10" height="12" rx="2" fill={c} opacity=".1" stroke={c} strokeWidth="1.2"/><path d="M6 1.5h4v2H6z" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/><path d="M5.5 7h5M5.5 9.5h5M5.5 12h3" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  inbox: c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 9.5V12a2 2 0 002 2h8a2 2 0 002-2V9.5M2 9.5L4 3.5h8l2 6M2 9.5h3.5c0 1.2 1.1 2 2.5 2s2.5-.8 2.5-2H14" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  bolt: c => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 1.5L3 9h4l-1 5.5L12 7H8l1-5.5z" fill={c} opacity=".2" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  chevD: (c, open) => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: MOTION.trFast("transform"), flexShrink: 0 }}><path d="M4 6l4 4 4-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ── Balans count-up animatsiyasi (reduced-motion hurmat qilinadi) ──
function useCountUp(value, dur = 450) {
  const [v, setV] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value;
    prev.current = value;
    if (from === to) return;
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    const t0 = performance.now();
    let raf;
    const step = now => {
      const pgs = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - pgs, 3);
      setV(Math.round(from + (to - from) * e));
      if (pgs < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, dur]);
  return v;
}

// ── Skeleton yuklanish holati — kit primitivlaridan ──
const DashSkeleton = memo(function DashSkeleton({ th }) {
  return (
    <div>
      <Skeleton th={th} h={SPACE.s16 * 3 + SPACE.s2} r={RADIUS.l} style={{ marginBottom: SPACE.s3 }} />
      <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
        {[0, 1, 2, 3].map(i => <Skeleton key={i} th={th} h={SPACE.s16 + SPACE.s2} r={RADIUS.m} style={{ flex: 1 }} />)}
      </div>
      {[0, 1, 2].map(i => <Skeleton key={i} th={th} h={SPACE.s16 + SPACE.s3} r={RADIUS.m} style={{ marginBottom: SPACE.s3 }} />)}
    </div>
  );
});

// ── HERO: salomlashish + oila balansi + oy daromad/xarajat + o'zgarish ──
// Bespoke gradient karta (DS 2.8: har sahifada 1 gradient — shu).
const Hero = memo(function Hero({ th, lg, t, f, ism, bal, jD, jX, myBal, famScope, delta, bugunX }) {
  const shown = useCountUp(bal);
  const neg = bal < 0;
  const h = new Date().getHours();
  const greet = h < 6 ? (lg === "uz" ? "Xayrli tun" : "Good night") : h < 12 ? (lg === "uz" ? "Xayrli tong" : "Good morning") : h < 18 ? (lg === "uz" ? "Xayrli kun" : "Good afternoon") : (lg === "uz" ? "Xayrli kech" : "Good evening");
  const dUp = delta > 0, dZero = delta === 0;
  const heroBg = neg
    ? "linear-gradient(135deg," + th.rd + "," + th.rd + ")"
    : "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")";
  const chip = { background: "rgba(255,255,255,0.13)", borderRadius: RADIUS.s + 3, padding: (SPACE.s2 + 2) + "px " + SPACE.s3 + "px", flex: 1 };
  const microW = { ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.75)" };
  return (
    <div className="anim-fadeUp" style={{ background: heroBg, borderRadius: RADIUS.l, padding: SPACE.s4 + SPACE.s1, marginBottom: SPACE.s3, position: "relative", overflow: "hidden", boxShadow: SHADOW.e1(neg ? th.rd : th.ac) }}>
      <div style={{ position: "absolute", top: -SPACE.s8, right: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -SPACE.s12, left: -SPACE.s6, width: SPACE.s16 + SPACE.s6, height: SPACE.s16 + SPACE.s6, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        {/* 1. Salomlashish */}
        <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>{greet}</div>
        <div style={{ ...TYPE.title, fontSize: TYPE.title.fontSize + 1, color: "#fff", marginBottom: SPACE.s4 }}>{ism || ""}</div>
        {/* 2. Umumiy (oila) balansi */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s1 }}>
          <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: "rgba(255,255,255,0.72)" }}>{famScope ? (lg === "uz" ? "Oila balansi (bu oy)" : "Family balance (this month)") : (lg === "uz" ? "Mening balansim (bu oy)" : "My balance (this month)")}</div>
          {bugunX > 0 && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.18)", borderRadius: RADIUS.s - 1, padding: "3px " + (SPACE.s2 + 1) + "px" }}>{lg === "uz" ? "Bugun" : "Today"}: -{f(bugunX, true)}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: SPACE.s2, flexWrap: "wrap", marginBottom: neg ? SPACE.s2 : SPACE.s4 }}>
          <div style={{ ...TYPE.display, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{shown < 0 ? "-" : ""}{f(Math.abs(shown), true)}</div>
          {/* 5. Balans o'zgarishi (o'tgan oyga nisbatan) */}
          {!dZero && (
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 800, color: "#fff", background: dUp ? "rgba(34,197,94,0.35)" : "rgba(0,0,0,0.22)", borderRadius: RADIUS.s - 1, padding: "3px " + (SPACE.s2 + 1) + "px", display: "flex", alignItems: "center", gap: 3 }}>
              {dUp ? "\u2191" : "\u2193"} {f(Math.abs(delta), true)} <span style={{ fontWeight: 500, opacity: OPACITY.pressed }}>{lg === "uz" ? "o'tgan oyga nisb." : "vs last month"}</span>
            </div>
          )}
        </div>
        {neg && (
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", marginBottom: SPACE.s3, ...TYPE.caption, fontWeight: 600, color: "#fff" }}>
            {lg === "uz" ? "Balans manfiy! Avval daromad kiriting." : "Negative balance! Add income first."}
          </div>
        )}
        {/* 3-4. Shu oy daromad / xarajat */}
        <div style={{ display: "flex", gap: SPACE.s2 + 2 }}>
          <div style={chip}>
            <div style={{ ...microW, marginBottom: 3, display: "flex", alignItems: "center", gap: SPACE.s1 }}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: RADIUS.full, background: th.gr }} />{t.inc}</div>
            <div style={{ ...TYPE.subtitle, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>+{f(jD, true)}</div>
          </div>
          <div style={chip}>
            <div style={{ ...microW, marginBottom: 3, display: "flex", alignItems: "center", gap: SPACE.s1 }}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: RADIUS.full, background: th.rd }} />{t.exp}</div>
            <div style={{ ...TYPE.subtitle, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>-{f(jX, true)}</div>
          </div>
        </div>
        {famScope && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.62)", marginTop: SPACE.s2 }}>{lg === "uz" ? "Mening balansim" : "My balance"}: {myBal < 0 ? "-" : ""}{f(Math.abs(myBal), true)}</div>}
      </div>
    </div>
  );
});

// ── Mini-karta (qarz / maqsad / vazifa) — kit primitivlari + tokenlardan yig'ilgan ──
const MiniCard = memo(function MiniCard({ th, icon, iconTone, badge, border, bg, dashed, title, sub, onClick, delay }) {
  const c = iconTone || th.ac;
  return (
    <button className="anim-fadeUp ui-press" onClick={onClick}
      style={{ animationDelay: (delay || 0) + "ms", width: "100%", marginBottom: SPACE.s3, cursor: "pointer", textAlign: "left", fontFamily: "inherit", background: bg || th.sur, border: (dashed ? "1px dashed " : "1px solid ") + (border || th.bor), borderRadius: RADIUS.m, padding: SPACE.s4, display: "flex", alignItems: "center", gap: SPACE.s3, minHeight: COMP.touchMin }}>
      <div style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.s + 3, background: c + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
        {icon}
        <CounterBadge th={th} count={badge} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TYPE.body, fontWeight: 700, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {sub}
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M6 4l4 4-4 4" stroke={th.ac} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
});

// ── Faollik grafigi — ChartCard ichida, streak Badge bilan ──
const ActivityGraph = memo(function ActivityGraph({ th, lg, days30, streak, mx30, f, delay }) {
  const H = [SPACE.s1, SPACE.s2 + 2, SPACE.s4 + 2, SPACE.s6 + 2]; // bar balandliklari (token arifmetikasi)
  return (
    <div className="anim-fadeUp" style={{ animationDelay: (delay || 0) + "ms" }}>
      <ChartCard th={th} title={lg === "uz" ? "Xarajat faolligi" : "Spending activity"}
        right={streak > 1 && <Badge th={th} type="warning" icon={DIco.bolt(th.am)}>{streak} {lg === "uz" ? "kun" : "days"}</Badge>}>
        {/* Y o'qi: maksimal qiymat ko'rsatkichi */}
        <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: 3, textAlign: "right" }}>{lg === "uz" ? "maks" : "max"}: {f(mx30, true)}</div>
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: SPACE.s6 + SPACE.s1, borderBottom: "1px solid " + th.bor, paddingBottom: 2 }}>
          {days30.map((v, i) => {
            const lvl = v === 0 ? 0 : v < mx30 * 0.34 ? 1 : v < mx30 * 0.67 ? 2 : 3;
            return <div key={i} style={{ flex: 1, height: H[lvl], borderRadius: 2, background: lvl === 0 ? th.bor : lvl === 1 ? th.ac + ALPHA.strong : th.ac, opacity: lvl === 2 ? OPACITY.hint : 1, outline: i === 29 ? "1.5px solid " + th.ac2 : "none" }} />;
          })}
        </div>
        {/* X o'qi: sana yorliqlari */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: SPACE.s1 }}>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{lg === "uz" ? "30 kun oldin" : "30 days ago"}</span>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.ac2, fontWeight: 700 }}>{lg === "uz" ? "Bugun" : "Today"}</span>
        </div>
      </ChartCard>
    </div>
  );
});

// ── Tranzaksiya qatori adapteri: item → kit ListItem (delete saqlanadi) ──
const Tx = memo(function Tx({ item, th, gN, gP, f, user, onDelete, divider }) {
  const isX = !!item.kategoriya;
  const ki = isX ? KATS.findIndex(k => k.id === item.kategoriya) : -1;
  const di = !isX ? DARS.findIndex(d => d.id === item.tur) : -1;
  const cl = isX ? (KATS[ki]?.c || th.t2) : (DARS[di]?.c || th.t2);
  return (
    <ListItem th={th} divider={divider} iconTone={cl}
      icon={isX ? <KatIco id={item.kategoriya} c={cl} s={20} /> : <DarIco id={item.tur} c={cl} s={20} />}
      title={<span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 + 1 }}>{item.izoh}{item.repeat && Ico.repeat(th.ac)}</span>}
      sub={<span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 + 2 }}><UIAvatar th={th} src={gP(item.uid)} name={gN(item.uid)} size={14} />{gN(item.uid)} · {item.sana}</span>}
      right={
        <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, flexShrink: 0 }}>
          <span style={{ ...TYPE.caption, fontWeight: 700, color: isX ? th.rd : th.gr, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{isX ? "-" : "+"}{f(item.summa, true)}</span>
          {isX && item.uid === user?.id && onDelete && (
            <button className="ui-press" onClick={() => onDelete(item)} aria-label="O'chirish" style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, display: "flex", padding: 2 }}>{Ico.trash(th.t2)}</button>
          )}
        </span>
      } />
  );
});

export default function DashboardPage({
  user, oila, azolar, xar, dar, maq, qarzlar, vazifalar,
  kidBalances, notifs, qarzReqs, xReqs, rates, stars, gardenData,
  setXar, setDar, setMaq, setKidBalances,
  dark, lg, val, scr, setScr, isPremium, isKid, isBosh, hasKids, isAdmin,
  th, t, f, ok$, buzz, addStar, fireConfetti,
  gN, gP, bX, bD, jX, jD, myX, myD, myBal, bal, bdj, pct, bRng, canSeeReport,
  srch, srchR, showS,
  delX, acceptXReq, rejectXReq,
  vazifaDone, vazifaApprove,
  fetchRates, rateL,
  setShowGift, setShowBilim, setShowAddVazifa, setPTab,
}) {
  const STY = useMemo(() => makeS(th), [th]);
  const [quickItem, setQuickItem] = useState(null);
  const [showGames, setShowGames] = useState(false);
  // Bola: sovg'a tarixi va sarflar daftari (bo'lib ko'rsatish uchun)
  const [kidGifts, setKidGifts] = useState([]);
  const [kidLedger, setKidLedger] = useState([]);
  useEffect(() => {
    if (!isKid || !user?.id) return;
    db.g("kidgift_" + user.id).then(h => { if (Array.isArray(h)) setKidGifts(h); }).catch(() => {});
    db.g("kidledger_" + user.id).then(h => { if (Array.isArray(h)) setKidLedger(h); }).catch(() => {});
  }, [isKid, user?.id]);
  const [showRates, setShowRates] = useState(false);
  const bugun = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  const [quickSum, setQuickSum] = useState("");

  // ═══ PERFORMANCE: og'ir hisoblar faqat ma'lumot o'zgarganda qayta hisoblanadi ═══
  const bugunX = useMemo(() => xar.filter(x => (x.uid === user?.id || !x.uid) && x.sana === bugun).reduce((sm, x) => sm + Number(x.summa || 0), 0), [xar, user?.id, bugun]);

  // 5. Balans o'zgarishi: o'tgan oy balansi bilan solishtirish (mavjud ma'lumotdan)
  // Ruxsat: oila balansini faqat bosh va u ruxsat bergan a'zolar ko'radi.
  // Boshqalarga hero shaxsiy rejimda ishlaydi.
  const heroBal = canSeeReport ? bal : myBal;
  const heroD = canSeeReport ? jD : myD;
  const heroX = canSeeReport ? jX : myX;
  const delta = useMemo(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    const pm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const mine = x => x.uid === user?.id || !x.uid;
    const pD = dar.filter(x => x.sana?.startsWith(pm) && (canSeeReport || mine(x))).reduce((sm, x) => sm + Number(x.summa || 0), 0);
    const pX = xar.filter(x => x.sana?.startsWith(pm) && (canSeeReport || mine(x))).reduce((sm, x) => sm + Number(x.summa || 0), 0);
    return heroBal - (pD - pX);
  }, [xar, dar, heroBal, canSeeReport, user?.id]);

  // 7. Oxirgi tranzaksiyalar (o'zimniki)
  const recentTx = useMemo(() => [
    ...xar.filter(x => x.uid === user?.id).slice(0, 12).map(x => ({ ...x, tp: "x" })),
    ...dar.filter(d => d.uid === user?.id).slice(0, 8).map(d => ({ ...d, tp: "d" })),
  ].sort((a, b) => b.id - a.id).slice(0, 6), [xar, dar, user?.id]);

  // 11. Oiladagi oxirgi faoliyat (boshqa a'zolar) — mavjud ma'lumotdan
  const famTx = useMemo(() => [
    ...xar.filter(x => x.uid && x.uid !== user?.id).slice(0, 10).map(x => ({ ...x, tp: "x" })),
    ...dar.filter(d => d.uid && d.uid !== user?.id).slice(0, 10).map(d => ({ ...d, tp: "d" })),
  ].sort((a, b) => b.id - a.id).slice(0, 4), [xar, dar, user?.id]);

  // 8. Grafik ma'lumoti (30 kun) — ilgari HAR renderda O(30n) hisoblanardi
  const actv = useMemo(() => {
    const days30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - 29 + i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      return xar.filter(x => (x.uid === user?.id || !x.uid) && x.sana === key).reduce((sm, x) => sm + Number(x.summa || 0), 0);
    });
    const mx30 = Math.max(...days30, 1);
    let streak = 0; for (let i = days30.length - 1; i >= 0 && days30[i] > 0; i--) streak++;
    return { days30, mx30, streak };
  }, [xar, user?.id]);

  // 9-10. Maqsad va qarz agregatlari
  const dbt = useMemo(() => {
    const myQ = qarzlar.filter(q => (!q.uid || q.uid === user?.id) && !q.paid);
    return {
      n: myQ.length,
      menga: myQ.filter(q => q.tur === "bergan").reduce((sm, q) => sm + Number(q.summa || 0), 0),
      mendan: myQ.filter(q => q.tur === "olgan").reduce((sm, q) => sm + Number(q.summa || 0), 0),
      overdue: myQ.some(q => q.qaytSana && q.qaytSana < bugun),
    };
  }, [qarzlar, user?.id, bugun]);

  const gls = useMemo(() => {
    const waitG = maq.filter(m => m.status === "waiting_parent" && m.uid && m.uid !== user?.id);
    const activeM = maq.filter(m => !m.paid && m.status !== "completed" && Number(m.maqsad) > 0);
    const top = activeM.length ? [...activeM].sort((p, q) => (Number(q.jamg || 0) / Number(q.maqsad)) - (Number(p.jamg || 0) / Number(p.maqsad)))[0] : null;
    return { waitG, activeM, top, mp: top ? Math.min(100, Math.round(Number(top.jamg || 0) / Number(top.maqsad) * 100)) : 0 };
  }, [maq, user?.id]);

  const vaz = useMemo(() => ({
    pending: vazifalar.filter(v => v.status === "done").length,
    active: vazifalar.filter(v => v.status === "pending").length,
  }), [vazifalar]);

  // ═══ Sprint 3B: SMART BUDGET AI ═══════════════════════════════
  // To'y smetalari — mavjud "toy_<oilaId>" kalitidan O'QILADI (sxema o'zgarmaydi).
  const [weddings, setWeddings] = useState([]);
  useEffect(() => {
    if (isKid || !user?.oilaId) return;
    db.g("toy_" + user.oilaId).then(v => { if (v && Array.isArray(v.saved)) setWeddings(v.saved); }).catch(() => {});
  }, [isKid, user?.oilaId]);

  // Kategoriya ranglari + nomlari (KATS/KN) — tilга mos
  const aiCats = useMemo(() => KATS.map((k, i) => ({ id: k.id, name: (KN[lg] || KN.uz)[i], color: k.c })), [lg]);
  // Doira: oila (canSeeReport) yoki shaxsiy — Hero bilan bir xil mantiq
  const aiMine = canSeeReport ? null : (x => x.uid === user?.id || !x.uid);

  const budgetAI = useMemo(() => {
    if (isKid || !oila) return null;
    return computeBudgetAI({
      xar, dar, qarzlar, maq, cats: aiCats, budgetLimit: bdj, mine: aiMine, weddings,
      sharedGoals: maq.filter(m => m.shared), computeSmart, getMeta, now: new Date(),
    });
  }, [xar, dar, qarzlar, maq, aiCats, bdj, canSeeReport, user?.id, weddings, isKid, oila]);

  const quickAdd = async () => {
    if (!quickItem || !quickSum || Number(quickSum) <= 0) return ok$(t.ea, "err");
    const { td, nt } = await import("../utils/formatters.js");
    const item = { id: Date.now(), kategoriya: quickItem.kat, summa: Number(quickSum), izoh: quickItem[lg] || quickItem.uz, sana: td(), vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    const na = [{ ...item, uid: user.id }, ...xar];
    setXar(na);
    const bt = na.filter(x => x.sana && x.sana.indexOf(tm()) === 0).reduce((s, x) => s + Number(x.summa || 0), 0);
    if (bt > bdj) { ok$(t.be, "err"); }
    else if (bt > bdj * .9) { ok$(t.bw, "warn"); }
    else { ok$(t.xa); addStar(1, lg === "uz" ? "Xarajat kiritildi" : "Expense added"); }
    setQuickItem(null); setQuickSum("");
  };

  // ── Qidiruv natijalari ──────────────────────────────────
  if (showS) {
    return (
      <div>
        <SectionHeader th={th}>{t.res + " (" + srchR.length + ")"}</SectionHeader>
        {srch?.trim() && srchR.length === 0 && (
          <EmptyState th={th} preset="report" title={t.nf2} />
        )}
        {srchR.length > 0 && (
          <AppCard th={th} pad={0}>
            {srchR.map((item, i) => (
              <Tx key={(item.kategoriya ? "x" : "d") + item.id} item={item} th={th} gN={gN} gP={gP} f={f} user={user} onDelete={delX} divider={i < srchR.length - 1} />
            ))}
          </AppCard>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* So'rovlar */}
      {xReqs.length > 0 && (
        <AppCard th={th} style={{ border: "1.5px solid " + th.am + ALPHA.strong, background: th.am + ALPHA.faint, marginBottom: SPACE.s3 + 2 }}>
          <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.am, marginBottom: SPACE.s3, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>
            {DIco.inbox(th.am)}{lg === "uz" ? "So'rovlar" : "Requests"} ({xReqs.length})
          </div>
          {xReqs.map(req => {
            const isInc = req.kind === "income";
            const cl = isInc ? (DARS.find(d => d.id === (req.tur || "sovga"))?.c || th.gr) : (KATS.find(k => k.id === req.kategoriya)?.c || th.t2);
            return (
              <div key={req.id} style={{ background: th.sur, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + (SPACE.s3 + 2) + "px", marginBottom: SPACE.s3 - 2, border: "1px solid " + (isInc ? th.gr + ALPHA.strong : th.bor) }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s2 }}>
                  <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, color: th.t1, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>
                    {isInc ? <DarIco id={req.tur || "sovga"} c={cl} s={16} /> : <KatIco id={req.kategoriya} c={cl} s={16} />}
                    <b>{req.fromIsm}</b> {isInc ? (lg === "uz" ? "sizga pul berdi" : "gave you money") : (lg === "uz" ? "sizning nomingizdan" : "for you")}
                  </div>
                  <div style={{ ...TYPE.subtitle, fontWeight: 800, color: isInc ? th.gr : th.rd, fontVariantNumeric: "tabular-nums" }}>{isInc ? "+" : "-"}{f(req.summa, true)}</div>
                </div>
                <div style={{ background: th.bg, borderRadius: RADIUS.s - 1, padding: (SPACE.s2 - 1) + "px " + (SPACE.s3 - 1) + "px", marginBottom: SPACE.s3 - 2, ...TYPE.caption, color: th.t2 }}>
                  {isInc ? (DN[lg][DARS.findIndex(d => d.id === (req.tur || "sovga"))] || req.izoh) : KN[lg][KATS.findIndex(k => k.id === req.kategoriya)]} · {req.izoh} · {req.sana}
                </div>
                <div style={{ display: "flex", gap: SPACE.s2 }}>
                  <PrimaryButton th={th} onClick={() => acceptXReq(req)} style={{ flex: 1, background: th.gr, boxShadow: SHADOW.e0, padding: (SPACE.s2 + 1) + "px 0", fontSize: TYPE.caption.fontSize + 1, marginBottom: 0 }}>{isInc ? (lg === "uz" ? "Daromadga qo'shish" : "Add to income") : (lg === "uz" ? "Tasdiqlash" : "Accept")}</PrimaryButton>
                  <DangerButton th={th} onClick={() => rejectXReq(req)} style={{ flex: 1, padding: (SPACE.s2 + 1) + "px 0", fontSize: TYPE.caption.fontSize + 1, marginBottom: 0 }}>{lg === "uz" ? "Rad etish" : "Reject"}</DangerButton>
                </div>
              </div>
            );
          })}
        </AppCard>
      )}

      {/* ===== BOLA BOSH SAHIFASI (gamification zonasi — o'yin uslubi saqlanadi) ===== */}
      {isKid && (
        <>
          <KidHome
            user={user} lg={lg} th={th} f={f} buzz={buzz} addStar={addStar}
            vazifalar={vazifalar} kidBalances={kidBalances} stars={stars} gardenData={gardenData}
            kidGifts={kidGifts} kidLedger={kidLedger} bugun={bugun}
            vazifaDone={vazifaDone} setShowGames={setShowGames} setShowGift={setShowGift}
            setShowBilim={setShowBilim} setScr={setScr} setPTab={setPTab}
          />
          {showGames && <KidsGames user={user} lg={lg} addStar={addStar} onClose={() => setShowGames(false)} />}
        </>
      )}
      {/* ===== KATTALAR BOSH SAHIFASI (yangi oqim: 1-11) ===== */}
      {!isKid && !oila && <DashSkeleton th={th} />}
      {!isKid && oila && (
        <div>
          {/* 1-5. Hero: salomlashish, oila balansi, daromad, xarajat, o'zgarish */}
          <Hero th={th} lg={lg} t={t} f={f} ism={user?.ism} bal={heroBal} jD={heroD} jX={heroX} myBal={myBal} famScope={canSeeReport} delta={delta} bugunX={bugunX} />

          {/* 10. AI Quick Insight — har safar bitta foydali maslahat */}
          {budgetAI && <QuickInsight th={th} lg={lg} f={f} insight={budgetAI.insight} />}

          {/* Byudjet — oy xarajati kontekstini davom ettiradi (LinearProgress budget rejimi) */}
          <div className="anim-fadeUp" style={{ animationDelay: STAGGER + "ms" }}>
            <AppCard th={th}>
              <div style={{ ...STY.row, marginBottom: SPACE.s2 }}><span style={{ ...TYPE.caption, color: th.t2 }}>{t.bud}</span><span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, fontVariantNumeric: "tabular-nums" }}>{f(bdj, true)}</span></div>
              <LinearProgress th={th} value={pct} budget height={SPACE.s3} />
              <div style={{ ...STY.row, marginTop: SPACE.s2 - 1 }}><span style={{ ...TYPE.caption, color: bRng, fontWeight: 700 }}>{pct}% {t.sp}</span><span style={{ ...TYPE.caption, color: bdj - jX >= 0 ? th.gr : th.rd, fontVariantNumeric: "tabular-nums" }}>{f(Math.abs(bdj - jX), true)} {bdj - jX >= 0 ? t.lf : t.ex}</span></div>
            </AppCard>
          </div>

          {/* 6. Tezkor amallar — bir qo'l uchun kattaroq target */}
          <SectionHeader th={th} right={null}><span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{DIco.bolt(th.am)}{lg === "uz" ? "Tez qo'shish" : "Quick add"}</span></SectionHeader>
          <div style={{ display: "flex", gap: SPACE.s2, overflowX: "auto", paddingBottom: SPACE.s1, marginBottom: quickItem ? SPACE.s2 : SPACE.s3 }}>
            {QUICK_ADD.map((q, i) => (
              <button key={i} className="ui-press" onClick={() => { buzz(10); setQuickItem(q); setQuickSum(""); }} style={{ flexShrink: 0, background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: SPACE.s1, minWidth: SPACE.s16 + SPACE.s3, minHeight: COMP.touchMin, fontFamily: "inherit" }}>
                <span style={{ fontSize: 26 }}>{q.emoji}</span>
                <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2 }}>{q[lg] || q.uz}</span>
              </button>
            ))}
          </div>

          {quickItem && (
            <div className="anim-scaleIn">
              <AppCard th={th} style={{ border: "1.5px solid " + th.ac + ALPHA.strong }}>
                <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s2 + 2 }}>
                  <span style={{ fontSize: 22 }}>{quickItem.emoji}</span>
                  <span style={{ ...TYPE.body, fontWeight: 700, color: th.t1 }}>{quickItem[lg] || quickItem.uz}</span>
                </div>
                <MoneyInput style={{ ...STY.ip, ...TYPE.title, textAlign: "center" }} value={quickSum} onChange={setQuickSum} placeholder="0" th={th} autoFocus />
                <div style={{ display: "flex", gap: SPACE.s2 }}>
                  <GhostButton th={th} onClick={() => setQuickItem(null)} style={{ flex: 1 }}>{lg === "uz" ? "Bekor" : "Cancel"}</GhostButton>
                  <PrimaryButton th={th} onClick={quickAdd} style={{ flex: 2, marginBottom: 0 }}>{lg === "uz" ? "Saqlash" : "Save"}</PrimaryButton>
                </div>
              </AppCard>
            </div>
          )}

          {/* 7. Oxirgi tranzaksiyalar */}
          <SectionHeader th={th} right={recentTx.length > 0 && <button className="ui-press" onClick={() => setScr("hisobot")} style={{ background: "none", border: "none", ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.ac, cursor: "pointer", padding: SPACE.s1 + "px 2px", fontWeight: 700, fontFamily: "inherit" }}>{lg === "uz" ? "Hammasi" : "See all"} ›</button>}>{lg === "uz" ? "Oxirgi operatsiyalar" : "Recent transactions"}</SectionHeader>
          {recentTx.length === 0 ? (
            <EmptyState th={th} preset="transaction"
              title={lg === "uz" ? "Hali xarajat kiritilmagan" : "No transactions yet"}
              message={lg === "uz" ? "Yuqoridagi tez qo'shish tugmalaridan foydalaning yoki pastdagi + tugmasini bosing" : "Use quick add buttons above or tap + below"}
              actionText={lg === "uz" ? "Xarajat qo'shish" : "Add expense"} onAction={() => setScr("qoshish")} />
          ) : (
            <AppCard th={th} pad={0}>
              {recentTx.map((item, i) => <Tx key={item.tp + item.id} item={item} th={th} gN={gN} gP={gP} f={f} user={user} onDelete={delX} divider={i < recentTx.length - 1} />)}
            </AppCard>
          )}

          {/* 8. Grafik — o'qlari bilan */}
          <ActivityGraph th={th} lg={lg} days30={actv.days30} streak={actv.streak} mx30={actv.mx30} f={f} delay={STAGGER * 2} />

          {/* Sprint 3B: AI moliyaviy tahlil — Health / Forecast / Trend / Savings / Risk */}
          {budgetAI && (
            <>
              <SectionHeader th={th}><span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{DIco.bolt(th.ac)}{lg === "uz" ? "AI moliyaviy tahlil" : lg === "ru" ? "AI-анализ финансов" : "AI financial analysis"}</span></SectionHeader>
              <SmartBudgetSection th={th} lg={lg} f={f} ai={budgetAI} />
            </>
          )}

          {/* 9. Maqsad progresslari */}
          {(gls.waitG.length > 0 || gls.top || maq.length === 0 || dbt.n > 0 || hasKids) && (
            <SectionHeader th={th}>{lg === "uz" ? "Maqsad va majburiyatlar" : "Goals & commitments"}</SectionHeader>
          )}
          {gls.waitG.length > 0 && (
            <MiniCard th={th} delay={STAGGER * 3} onClick={() => { buzz(8); setScr("maqsad"); }}
              icon={DIco.target(th.am)} iconTone={th.am} border={th.am + ALPHA.strong} bg={th.am + ALPHA.faint}
              title={<span style={{ color: th.am }}>{gN(gls.waitG[0].uid)} {lg === "uz" ? "orzusi uchun pul yig'ib bo'ldi!" : "saved up for a dream!"}{gls.waitG.length > 1 ? " (+" + (gls.waitG.length - 1) + ")" : ""}</span>}
              sub={<div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{"\u201C"}{gls.waitG[0].ism}{"\u201D"} {"\u2014"} {lg === "uz" ? "olib berish kutilmoqda" : "waiting to fulfill"}</div>} />
          )}
          {gls.top && (
            <MiniCard th={th} delay={STAGGER * 3} onClick={() => { buzz(8); setScr("maqsad"); }}
              icon={DIco.target(th.ac)}
              title={<span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{gls.top.ism}{gls.activeM.length > 1 ? " +" + (gls.activeM.length - 1) : ""}</span><span style={{ ...TYPE.caption, fontWeight: 800, color: th.ac, flexShrink: 0, marginLeft: SPACE.s2 }}>{gls.mp}%</span></span>}
              sub={<div><div style={{ marginTop: SPACE.s1 + 1 }}><LinearProgress th={th} value={gls.mp} height={SPACE.s2 - 1} /></div><div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: SPACE.s1, fontVariantNumeric: "tabular-nums" }}>{f(Number(gls.top.jamg || 0), true)} / {f(Number(gls.top.maqsad), true)}</div></div>} />
          )}
          {maq.length === 0 && (
            <MiniCard th={th} delay={STAGGER * 3} dashed border={th.ac + ALPHA.strong} bg={th.ac + ALPHA.faint} onClick={() => { buzz(8); setScr("maqsad"); }}
              icon={DIco.target(th.ac)}
              title={lg === "uz" ? "Maqsad qo'ying" : "Set a goal"}
              sub={<div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Uy, mashina, sayohat uchun jamg'aring" : "Save for your dreams"}</div>} />
          )}

          {/* 10. Qarz eslatmalari */}
          {dbt.n > 0 && (
            <MiniCard th={th} delay={STAGGER * 4} onClick={() => { buzz(8); setScr("qarz"); }}
              icon={DIco.cash(dbt.overdue ? th.rd : th.ac)} iconTone={dbt.overdue ? th.rd : th.ac} border={dbt.overdue ? th.rd + ALPHA.strong : undefined} bg={dbt.overdue ? th.rd + ALPHA.faint : undefined}
              title={<span>{lg === "uz" ? "Qarzlar" : "Debts"} ({dbt.n}){dbt.overdue && <span style={{ marginLeft: SPACE.s1 + 2, ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.rd, fontWeight: 800 }}>{lg === "uz" ? "Muddati o'tgan!" : "Overdue!"}</span>}</span>}
              sub={<div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, marginTop: 3, display: "flex", gap: SPACE.s3, flexWrap: "wrap" }}>{dbt.menga > 0 && <span style={{ color: th.gr, fontWeight: 700 }}>{lg === "uz" ? "Menga qaytariladi" : "They owe"}: +{f(dbt.menga, true)}</span>}{dbt.mendan > 0 && <span style={{ color: th.rd, fontWeight: 700 }}>{lg === "uz" ? "Men qaytaraman" : "I owe"}: -{f(dbt.mendan, true)}</span>}</div>} />
          )}

          {/* Farzand vazifalari (oila klasteri) */}
          {hasKids && (
            <MiniCard th={th} delay={STAGGER * 5} onClick={() => { buzz(8); setScr("vazifa"); }}
              icon={DIco.clip(th.am)} iconTone={th.am} badge={vaz.pending} border={vaz.pending > 0 ? th.am + ALPHA.strong : undefined} bg={vaz.pending > 0 ? th.am + ALPHA.faint : undefined}
              title={lg === "uz" ? "Farzandga vazifa" : "Kids' tasks"}
              sub={<div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: vaz.pending > 0 ? th.am : th.t2, marginTop: 2, fontWeight: vaz.pending > 0 ? 700 : 400 }}>{vaz.pending > 0 ? vaz.pending + (lg === "uz" ? " ta tasdiqlash kutilmoqda" : " awaiting approval") : vaz.active > 0 ? vaz.active + (lg === "uz" ? " ta faol vazifa" : " active tasks") : (lg === "uz" ? "Topshiriq bering, mukofot belgilang" : "Assign tasks with rewards")}</div>} />
          )}

          {/* 11. Oiladagi oxirgi faoliyat */}
          {canSeeReport && famTx.length > 0 && (
            <div>
              <SectionHeader th={th}>{lg === "uz" ? "Oiladagi oxirgi faoliyat" : "Family activity"}</SectionHeader>
              <AppCard th={th} pad={0}>
                {famTx.map((item, i) => <Tx key={"fam" + item.tp + item.id} item={item} th={th} gN={gN} gP={gP} f={f} user={user} onDelete={delX} divider={i < famTx.length - 1} />)}
              </AppCard>
            </div>
          )}

          {/* Valyuta kurslari — passiv ma'lumot, eng pastda */}
          <div style={{ height: SPACE.s3 }} />
          <div className="anim-fadeUp" style={{ animationDelay: STAGGER * 6 + "ms" }}>
            <AppCard th={th} pad={SPACE.s3}>
              <div className="ui-press" onClick={() => { setShowRates(v => !v); if (!showRates && rates.length === 0) fetchRates(); }} style={{ display: "flex", alignItems: "center", gap: SPACE.s2, cursor: "pointer", minHeight: SPACE.s8, padding: "0 " + SPACE.s1 + "px" }}>
                {Ico.bank(th.ac)}
                <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.t1, flexShrink: 0 }}>{t.rates}</span>
                <span style={{ flex: 1, ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {(() => {
                    const usd = rates.find(r => r.code === "USD");
                    const rub = rates.find(r => r.code === "RUB");
                    if (!usd && !rub) return lg === "uz" ? "ko'rish" : "view";
                    return (usd ? "USD " + Number(usd.rate).toLocaleString("uz-UZ", { maximumFractionDigits: 0 }) : "") + (usd && rub ? " \u00b7 " : "") + (rub ? "RUB " + Number(rub.rate).toLocaleString("uz-UZ", { maximumFractionDigits: 2 }) : "");
                  })()}
                </span>
                {DIco.chevD(th.t2, showRates)}
              </div>
              {showRates && (
                <div style={{ marginTop: SPACE.s3 }}>
                  {rateL && <div style={{ textAlign: "center", padding: SPACE.s2 + "px 0", color: th.t2, ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1 }}>{t.ldd}</div>}
                  {!rateL && rates.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2 }}>
                      {rates.map(r => (
                        <div key={r.code} style={{ background: th.surH, borderRadius: RADIUS.s + 2, padding: (SPACE.s2 + 1) + "px " + (SPACE.s3 - 1) + "px", border: "1px solid " + th.bor, display: "flex", alignItems: "center", gap: SPACE.s2 }}>
                          <div style={{ flex: 1, minWidth: 0 }}><div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, fontWeight: 700, color: th.t1 }}>{r.code}</div></div>
                          <div style={{ ...TYPE.caption, fontWeight: 800, color: th.ac, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{Number(r.rate).toLocaleString("uz-UZ", { maximumFractionDigits: 0 })}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <GhostButton th={th} onClick={fetchRates} style={{ marginTop: SPACE.s2 + 2, padding: (SPACE.s2 - 1) + "px 0", fontSize: TYPE.caption.fontSize - 1 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 + 1 }}>{Ico.repeat(th.t2)}{lg === "uz" ? "Yangilash" : "Refresh"}</span>
                  </GhostButton>
                </div>
              )}
            </AppCard>
          </div>
        </div>
      )}
    </div>
  );
}
