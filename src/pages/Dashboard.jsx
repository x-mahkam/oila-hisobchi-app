import { memo, useMemo, useState, useEffect, useRef } from "react";
import { KatIco, DarIco, MoneyInput } from "../components/common/index.jsx";
import {
  SectionHeader, AppCard, StatCard, ListItem, EmptyState, Skeleton,
  PrimaryButton, GhostButton, DangerButton, Badge, CounterBadge,
  LinearProgress, ChartCard, UIAvatar, WarningCard, BottomSheet,
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

// ── 7 tilni to'liq qo'llab-quvvatlaydigan tarjima yordamchisi ──
// L(lg, uz, ru, en, kk, ky, tg, qr) — qaysi til tanlangan bo'lsa O'SHA qaytadi.
const L = (lg, uzVal, ruVal, enVal, kkVal, kyVal, tgVal, qrVal) => {
  const map = { uz: uzVal, ru: ruVal, en: enVal, kk: kkVal, ky: kyVal, tg: tgVal, qr: qrVal };
  return map[lg] !== undefined ? map[lg] : uzVal;
};

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
  const greet = h < 6 ? L(lg, "Xayrli tun", "Доброй ночи", "Good night", "Қайырлы түн", "Кайырлуу түн", "Шаби хуш", "Qayırlı túnіngiz bolsın")
    : h < 12 ? L(lg, "Xayrli tong", "Доброе утро", "Good morning", "Қайырлы таң", "Кайырлуу таң", "Субҳ ба хайр", "Qayırlı tań")
    : h < 18 ? L(lg, "Xayrli kun", "Добрый день", "Good afternoon", "Қайырлы күн", "Кайырлуу күн", "Рӯзи хуш", "Qayırlı kún")
    : L(lg, "Xayrli kech", "Добрый вечер", "Good evening", "Қайырлы кеш", "Кайырлуу кеч", "Шоми хуш", "Qayırlı keshiŋiz bolsın");
  const dUp = delta > 0, dZero = delta === 0;
  const heroBg = neg
    ? "linear-gradient(135deg," + th.rd + "," + th.rd + ")"
    : "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")";
  const chip = { background: "rgba(255,255,255,0.13)", borderRadius: RADIUS.m, padding: SPACE.s3 + "px", flex: 1 };
  const microW = { ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.75)" };
  return (
    <div className="anim-fadeUp" style={{ background: heroBg, borderRadius: RADIUS.l, padding: SPACE.s4 + "px", marginBottom: SPACE.s3, position: "relative", overflow: "hidden", boxShadow: SHADOW.e1(neg ? th.rd : th.ac) }}>
      <div style={{ position: "absolute", top: -SPACE.s8, right: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -SPACE.s12, left: -SPACE.s6, width: SPACE.s16 + SPACE.s6, height: SPACE.s16 + SPACE.s6, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        {/* 1. Salomlashish */}
        <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.85)", marginBottom: SPACE.s1 }}>{greet}</div>
        <div style={{ ...TYPE.title, color: "#fff", marginBottom: SPACE.s4 }}>{ism || ""}</div>
        {/* 2. Umumiy (oila) balansi */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s1 }}>
          <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.72)" }}>{famScope ? L(lg, "Oila balansi (bu oy)", "Баланс семьи (этот месяц)", "Family balance (this month)", "Отбасы балансы (бұл ай)", "Үй-бүлө балансы (бул ай)", "Тавозуни оила (ин моҳ)", "Oila balansı (bul ay)") : L(lg, "Mening balansim (bu oy)", "Мой баланс (этот месяц)", "My balance (this month)", "Менің балансым (бұл ай)", "Менин балансым (бул ай)", "Тавозуни ман (ин моҳ)", "Meniń balansım (bul ay)")}</div>
          {bugunX > 0 && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.18)", borderRadius: RADIUS.s, padding: SPACE.s1 + "px " + SPACE.s2 + "px" }}>{L(lg, "Bugun", "Сегодня", "Today", "Бүгін", "Бүгүн", "Имрӯз", "Búgin")}: -{f(bugunX, true)}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: SPACE.s2, flexWrap: "wrap", marginBottom: neg ? SPACE.s2 : SPACE.s4 }}>
          <div style={{ ...TYPE.display, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{shown < 0 ? "-" : ""}{f(Math.abs(shown), true)}</div>
          {/* 5. Balans o'zgarishi (o'tgan oyga nisbatan) */}
          {!dZero && (
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 800, color: "#fff", background: dUp ? "rgba(34,197,94,0.35)" : "rgba(0,0,0,0.22)", borderRadius: RADIUS.s, padding: SPACE.s1 + "px " + SPACE.s2 + "px", display: "flex", alignItems: "center", gap: SPACE.s1 }}>
              {dUp ? "\u2191" : "\u2193"} {f(Math.abs(delta), true)} <span style={{ fontWeight: 500, opacity: OPACITY.pressed }}>{L(lg, "o'tgan oyga nisb.", "\u043f\u043e \u0441\u0440\u0430\u0432\u043d. \u0441 \u043f\u0440\u043e\u0448\u043b\u044b\u043c \u043c\u0435\u0441.", "vs last month", "\u04e9\u0442\u043a\u0435\u043d \u0430\u0439\u0493\u0430 \u049b\u0430\u0442\u044b\u0441\u0442\u044b", "\u04e9\u0442\u043a\u04e9\u043d \u0430\u0439\u0433\u0430 \u0441\u0430\u043b\u044b\u0448\u0442\u044b\u0440\u043c\u0430\u043b\u0443\u0443", "\u043d\u0438\u0441\u0431\u0430\u0442 \u0431\u0430 \u043c\u043e\u04b3\u0438 \u0433\u0443\u0437\u0430\u0448\u0442\u0430", "\u00f3tken ayg\u0430 sal\u0131st\u0131r\u01f5anda")}</span>
            </div>
          )}
        </div>
        {neg && (
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", marginBottom: SPACE.s3, ...TYPE.caption, fontWeight: 600, color: "#fff" }}>
            {L(lg, "Balans manfiy! Avval daromad kiriting.", "Баланс отрицательный! Сначала добавьте доход.", "Negative balance! Add income first.", "Баланс теріс! Алдымен кіріс енгізіңіз.", "Баланс терс! Адегенде киреше киргизиңиз.", "Тавозун манфӣ аст! Аввал даромад ворид кунед.", "Balans mánis! Áwelі kirim kiritiń.")}
          </div>
        )}
        {/* 3-4. Shu oy daromad / xarajat */}
        <div style={{ display: "flex", gap: SPACE.s2 }}>
          <div style={chip}>
            <div style={{ ...microW, marginBottom: SPACE.s1, display: "flex", alignItems: "center", gap: SPACE.s1 }}><span style={{ display: "inline-block", width: SPACE.s2, height: SPACE.s2, borderRadius: RADIUS.full, background: th.gr }} />{t.inc}</div>
            <div style={{ ...TYPE.subtitle, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>+{f(jD, true)}</div>
          </div>
          <div style={chip}>
            <div style={{ ...microW, marginBottom: SPACE.s1, display: "flex", alignItems: "center", gap: SPACE.s1 }}><span style={{ display: "inline-block", width: SPACE.s2, height: SPACE.s2, borderRadius: RADIUS.full, background: th.rd }} />{t.exp}</div>
            <div style={{ ...TYPE.subtitle, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>-{f(jX, true)}</div>
          </div>
        </div>
        {famScope && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.62)", marginTop: SPACE.s2 }}>{L(lg, "Mening balansim", "Мой баланс", "My balance", "Менің балансым", "Менин балансым", "Тавозуни ман", "Meniń balansım")}: {myBal < 0 ? "-" : ""}{f(Math.abs(myBal), true)}</div>}
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
  const H = [SPACE.s1, SPACE.s2, SPACE.s4, SPACE.s6]; // bar balandliklari (exact token values)
  return (
    <div className="anim-fadeUp" style={{ animationDelay: (delay || 0) + "ms" }}>
      <ChartCard th={th} title={L(lg, "Xarajat faolligi", "Активность расходов", "Spending activity", "Шығыс белсенділігі", "Чыгым активдүүлүгү", "Фаъолияти хароҷот", "Shıǵın belsendiligi")}
        right={streak > 1 && <Badge th={th} type="warning" icon={DIco.bolt(th.am)}>{streak} {L(lg, "kun", "дн.", "days", "күн", "күн", "рӯз", "kún")}</Badge>}>
        {/* Y o'qi: maksimal qiymat ko'rsatkichi */}
        <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s1, textAlign: "right" }}>{L(lg, "maks", "макс", "max", "макс", "макс", "макс", "maks")}: {f(mx30, true)}</div>
        <div style={{ display: "flex", gap: SPACE.s1, alignItems: "flex-end", height: SPACE.s8, borderBottom: "1px solid " + th.bor, paddingBottom: SPACE.s1 }}>
          {days30.map((v, i) => {
            const lvl = v === 0 ? 0 : v < mx30 * 0.34 ? 1 : v < mx30 * 0.67 ? 2 : 3;
            return <div key={i} style={{ flex: 1, height: H[lvl], borderRadius: RADIUS.s, background: lvl === 0 ? th.bor : lvl === 1 ? th.ac + ALPHA.strong : th.ac, opacity: lvl === 2 ? OPACITY.hint : 1, outline: i === days30.length - 1 ? "1px solid " + th.ac2 : "none" }} />;
          })}
        </div>
        {/* X o'qi: sana yorliqlari */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: SPACE.s2 }}>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{L(lg, "30 kun oldin", "30 дней назад", "30 days ago", "30 күн бұрын", "30 күн мурун", "30 рӯз пеш", "30 kún burın")}</span>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.ac2, fontWeight: 700 }}>{L(lg, "Bugun", "Сегодня", "Today", "Бүгін", "Бүгүн", "Имрӯз", "Búgin")}</span>
        </div>
      </ChartCard>
    </div>
  );
});

// ── Tranzaksiya qatori adapteri: item → kit ListItem (delete saqlanadi) ──
const Tx = memo(function Tx({ item, th, gN, gP, f, user, onDelete, onEdit, divider }) {
  const isX = !!item.kategoriya;
  const ki = isX ? KATS.findIndex(k => k.id === item.kategoriya) : -1;
  const di = !isX ? DARS.findIndex(d => d.id === item.tur) : -1;
  const cl = isX ? (KATS[ki]?.c || th.t2) : (DARS[di]?.c || th.t2);

  let iconId = item.kategoriya;
  if (isX) {
    const iz = String(item.izoh || "").toLowerCase();
    if (iz.includes("kofe") || iz.includes("coffee")) iconId = "kofe";
    else if (iz.includes("bozor") || iz.includes("grocer") || iz.includes("продукты") || iz.includes("market")) iconId = "bozor";
    else if (iz.includes("ovqat") || iz.includes("food") || iz.includes("еда")) iconId = "ovqat";
    else if (iz.includes("taxi") || iz.includes("taksi") || iz.includes("transport")) iconId = "taxi";
    else if (iz.includes("benzin") || iz.includes("fuel") || iz.includes("газ")) iconId = "benzin";
    else if (iz.includes("dorixona") || iz.includes("pharmacy") || iz.includes("аптека") || iz.includes("dori")) iconId = "dorixona";
  }

  const canEdit = item.uid === user?.id;

  return (
    <ListItem th={th} divider={divider} iconTone={cl}
      onClick={canEdit && onEdit ? () => onEdit(item) : null}
      icon={isX ? <KatIco id={iconId} c={cl} s={20} /> : <DarIco id={item.tur} c={cl} s={20} />}
      title={<span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 + 1 }}>{item.izoh}{item.repeat && Ico.repeat(th.ac)}</span>}
      sub={<span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 + 2 }}><UIAvatar th={th} src={gP(item.uid)} name={gN(item.uid)} size={14} />{gN(item.uid)} · {item.sana}</span>}
      right={
        <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, flexShrink: 0 }}>
          <span style={{ ...TYPE.caption, fontWeight: 700, color: isX ? th.rd : th.gr, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{isX ? "-" : "+"}{f(item.summa, true)}</span>
          {canEdit && onEdit && (
            <span style={{ color: th.ac, fontSize: 13, marginLeft: 6, opacity: 0.8, cursor: "pointer" }}>✎</span>
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
  delX, acceptXReq, rejectXReq, delTx, editTx,
  vazifaDone, vazifaApprove,
  fetchRates, rateL,
  setShowGift, setShowBilim, setShowAddVazifa, setPTab,
}) {
  const STY = useMemo(() => makeS(th), [th]);
  const [quickItem, setQuickItem] = useState(null);
  const [showGames, setShowGames] = useState(false);

  // Sana bo'yicha filtrlar (Date filtering)
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  // Tahrirlash va o'chirish holatlari (Transaction edit & delete)
  const [editingItem, setEditingItem] = useState(null);
  const [editSum, setEditSum] = useState("");
  const [editIzoh, setEditIzoh] = useState("");
  const [editSana, setEditSana] = useState("");
  const [editKat, setEditKat] = useState(""); // Kategoriya yoki Daromad turi
  const [showDelConfirm, setShowDelConfirm] = useState(false);

  const handleStartEdit = (item) => {
    buzz(8);
    setEditingItem(item);
    setEditSum(String(item.summa || ""));
    setEditIzoh(item.izoh || "");
    setEditSana(item.sana || "");
    setEditKat(item.kategoriya || item.tur || "");
    setShowDelConfirm(false);
  };
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
  const recentTx = useMemo(() => {
    let list = [
      ...xar.filter(x => x.uid === user?.id).map(x => ({ ...x, tp: "x" })),
      ...dar.filter(d => d.uid === user?.id).map(d => ({ ...d, tp: "d" })),
    ].sort((a, b) => b.id - a.id);

    if (filterStart) {
      list = list.filter(item => item.sana >= filterStart);
    }
    if (filterEnd) {
      list = list.filter(item => item.sana <= filterEnd);
    }

    if (!filterStart && !filterEnd) {
      return list.slice(0, 6);
    }
    return list;
  }, [xar, dar, user?.id, filterStart, filterEnd]);

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
    else { ok$(t.xa); addStar(1, L(lg, "Xarajat kiritildi", "Расход добавлен", "Expense added", "Шығыс енгізілді", "Чыгым киргизилди", "Хароҷот ворид шуд", "Shıǵın kiritildi")); }
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
              <Tx key={(item.kategoriya ? "x" : "d") + item.id} item={item} th={th} gN={gN} gP={gP} f={f} user={user} onDelete={delX} onEdit={handleStartEdit} divider={i < srchR.length - 1} />
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
            {DIco.inbox(th.am)}{L(lg, "So'rovlar", "Запросы", "Requests", "Сұраулар", "Суроолор", "Дархостҳо", "Sorawlar")} ({xReqs.length})
          </div>
          {xReqs.map(req => {
            const isInc = req.kind === "income";
            const cl = isInc ? (DARS.find(d => d.id === (req.tur || "sovga"))?.c || th.gr) : (KATS.find(k => k.id === req.kategoriya)?.c || th.t2);
            return (
              <div key={req.id} style={{ background: th.sur, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + (SPACE.s3 + 2) + "px", marginBottom: SPACE.s3 - 2, border: "1px solid " + (isInc ? th.gr + ALPHA.strong : th.bor) }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s2 }}>
                  <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, color: th.t1, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>
                    {isInc ? <DarIco id={req.tur || "sovga"} c={cl} s={16} /> : <KatIco id={req.kategoriya} c={cl} s={16} />}
                    <b>{req.fromIsm}</b> {isInc ? L(lg, "sizga pul berdi", "дал вам деньги", "gave you money", "сізге ақша берді", "сизге акча берди", "ба шумо пул дод", "sizge aqsha berdi") : L(lg, "sizning nomingizdan", "от вашего имени", "for you", "сіздің атыңыздан", "сиздин атыңыздан", "аз номи шумо", "sizdiń atıńızdan")}
                  </div>
                  <div style={{ ...TYPE.subtitle, fontWeight: 800, color: isInc ? th.gr : th.rd, fontVariantNumeric: "tabular-nums" }}>{isInc ? "+" : "-"}{f(req.summa, true)}</div>
                </div>
                <div style={{ background: th.bg, borderRadius: RADIUS.s - 1, padding: (SPACE.s2 - 1) + "px " + (SPACE.s3 - 1) + "px", marginBottom: SPACE.s3 - 2, ...TYPE.caption, color: th.t2 }}>
                  {isInc ? (DN[lg][DARS.findIndex(d => d.id === (req.tur || "sovga"))] || req.izoh) : KN[lg][KATS.findIndex(k => k.id === req.kategoriya)]} · {req.izoh} · {req.sana}
                </div>
                <div style={{ display: "flex", gap: SPACE.s2 }}>
                  <PrimaryButton th={th} onClick={() => acceptXReq(req)} style={{ flex: 1, background: th.gr, boxShadow: SHADOW.e0, padding: (SPACE.s2 + 1) + "px 0", fontSize: TYPE.caption.fontSize + 1, marginBottom: 0 }}>{isInc ? L(lg, "Daromadga qo'shish", "Добавить в доход", "Add to income", "Кіріске қосу", "Кирешеге кошуу", "Илова ба даромад", "Kirimge qosıw") : L(lg, "Tasdiqlash", "Подтвердить", "Accept", "Растау", "Тастыктоо", "Тасдиқ кардан", "Tastıyıqlaw")}</PrimaryButton>
                  <DangerButton th={th} onClick={() => rejectXReq(req)} style={{ flex: 1, padding: (SPACE.s2 + 1) + "px 0", fontSize: TYPE.caption.fontSize + 1, marginBottom: 0 }}>{L(lg, "Rad etish", "Отклонить", "Reject", "Бас тарту", "Четке кагуу", "Рад кардан", "Biykar etiw")}</DangerButton>
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
            user={user} lg={lg} th={th} f={f} buzz={buzz} addStar={addStar} fireConfetti={fireConfetti}
            vazifalar={vazifalar} kidBalances={kidBalances} stars={stars} gardenData={gardenData}
            kidGifts={kidGifts} kidLedger={kidLedger} bugun={bugun}
            vazifaDone={vazifaDone} setShowGames={setShowGames} setShowGift={setShowGift}
            setShowBilim={setShowBilim} setScr={setScr} setPTab={setPTab}
            setShowAddVazifa={setShowAddVazifa}
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

          {/* In-App Alerts for parent */}
          {pct >= 80 && (
            <WarningCard 
              th={th} 
              tone="danger" 
              title={L(lg, "⚠️ BYUDJET LIMITI OSHDI!", "⚠️ ПРЕВЫШЕН ЛИМИТ БЮДЖЕТА!", "⚠️ BUDGET LIMIT EXCEEDED!", "⚠️ БЮДЖЕТ ЛИМИТІ АСЫП КЕТТІ!", "⚠️ БЮДЖЕТ ЛИМИТИ АШТЫ!", "⚠️ ҲУДУДИ БУҶА ГУЗАШТ!", "⚠️ BJUDJET LIMITI ASIP KETTI!")}
              icon={<span style={{ fontSize: 20 }}>🚨</span>}
              style={{ marginBottom: SPACE.s3, animation: "pulse 2s infinite" }}
            >
              {L(lg,
                `Diqqat, oylik byudjet limitining ${pct}% qismi sarflandi! Iltimos, xarajatlarni kamaytiring.`,
                `Внимание, потрачено ${pct}% месячного бюджета! Пожалуйста, сократите расходы.`,
                `Warning: ${pct}% of the monthly budget has been spent! Please reduce expenses.`,
                `Назар аударыңыз, айлық бюджеттің ${pct}% бөлігі жұмсалды! Шығынды азайтыңыз.`,
                `Көңүл буруңуз, айлык бюджеттин ${pct}% бөлүгү коротулду! Чыгымдарды азайтыңыз.`,
                `Диққат, ${pct}% буҷаи моҳона сарф шуд! Хароҷотро кам кунед.`,
                `Itibar beriń, ayliq bjudjettiń ${pct}% bólegi shig'ındaldı! Shig'ınlardi azaytiń.`)}
            </WarningCard>
          )}

          {vaz.pending > 0 && (
            <WarningCard
              th={th}
              tone="warning"
              title={L(lg, "🔔 TASDIQLANMAGAN VAZIFALAR", "🔔 НЕПОДТВЕРЖДЁННЫЕ ЗАДАНИЯ", "🔔 UNAPPROVED TASKS", "🔔 РАСТАЛМАҒАН ТАПСЫРМАЛАР", "🔔 ТАСТЫКТАЛБАГАН ТАПШЫРМАЛАР", "🔔 ВАЗИФАҲОИ ТАСДИҚНАШУДА", "🔔 TASTIYIQLANBAǴAN WAZIYPALAR")}
              icon={<span style={{ fontSize: 20 }}>👶</span>}
              onClick={() => { buzz(8); setScr("vazifa"); }}
              style={{ cursor: "pointer", marginBottom: SPACE.s3 }}
            >
              {L(lg,
                `Farzandingiz tomonidan bajarilgan ${vaz.pending} ta vazifa tasdiqlash uchun kutilmoqda. Tasdiqlash uchun bosing!`,
                `${vaz.pending} задан(ий), выполненных вашим ребёнком, ожидают подтверждения. Нажмите, чтобы подтвердить!`,
                `There are ${vaz.pending} completed tasks waiting for your approval. Tap to approve!`,
                `Балаңыз орындаған ${vaz.pending} тапсырма растауды күтуде. Растау үшін басыңыз!`,
                `Балаңыз аткарган ${vaz.pending} тапшырма тастыктоону күтүүдө. Тастыктоо үчүн басыңыз!`,
                `${vaz.pending} вазифаи иҷрокардаи фарзандатон интизори тасдиқ аст. Барои тасдиқ зер кунед!`,
                `Balańız orınlaǵan ${vaz.pending} wazıypa tastıyıqlawdı kútip tur. Tastıyıqlaw ushın basıń!`)}
            </WarningCard>
          )}

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

          {/* Farzandlar Tarbiyasi & Faolligi — Yuqori ta'sirli va chiroyli banner/vidjet */}
          {hasKids && (
            <div className="anim-fadeUp" style={{ animationDelay: (STAGGER + 15) + "ms", marginTop: SPACE.s3 }}>
              <SectionHeader th={th} right={
                <button className="ui-press" onClick={() => { buzz(8); setScr("vazifa"); }} style={{ background: "none", border: "none", ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.ac, cursor: "pointer", padding: "4px 2px", fontWeight: 700, fontFamily: "inherit" }}>
                  {L(lg, "Boshqarish", "Управление", "Manage", "Басқару", "Башкаруу", "Идоракунӣ", "Basqarıw")} ›
                </button>
              }>
                <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>
                  👶 {L(lg, "Farzandlar tarbiyasi & Vazifalar", "Воспитание детей & Задания", "Kids' development & Tasks", "Балаларды тәрбиелеу & Тапсырмалар", "Балдарды тарбиялоо & Тапшырмалар", "Тарбияи фарзандон & Вазифаҳо", "Balalardı tárbiyalaw & Wazıypalar")}
                </span>
              </SectionHeader>
              
              <AppCard th={th} asDiv style={{ background: `linear-gradient(135deg, ${th.am}10, ${th.ac}08)`, border: `1.5px dashed ${vaz.pending > 0 ? th.am : th.bor}`, cursor: "pointer" }} onClick={() => { buzz(8); setScr("vazifa"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACE.s2 }}>
                  <div>
                    <h4 style={{ ...TYPE.body, fontWeight: 800, color: th.t1, display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                      {L(lg, "Vazifalar & Rag'bat", "Задания & Мотивация", "Chores & Motivation", "Тапсырмалар & Ынталандыру", "Тапшырмалар & Түрткү", "Вазифаҳо & Ҳавасмандкунӣ", "Wazıypalar & Ruwxlandırıw")}
                      {vaz.pending > 0 && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: th.rd, display: "inline-block", boxShadow: "0 0 8px " + th.rd, animation: "pulse 1.5s infinite" }} />
                      )}
                    </h4>
                    <p style={{ ...TYPE.caption, color: th.t2, marginTop: 4, marginBottom: 0, fontSize: 12 }}>
                      {L(lg, "Bolajonlarga foydali vazifalar yuklang, bajarganda yulduzcha va pullar bering!", "Давайте детям полезные задания, награждайте звёздочками и деньгами!", "Assign useful chores, award stars & real pocket money!", "Балаларға пайдалы тапсырмалар беріңіз, орындағанда жұлдызша мен ақша беріңіз!", "Балдарга пайдалуу тапшырмаларды бериңиз, аткарганда жылдызча жана акча бериңиз!", "Ба фарзандон вазифаҳои муфид супоред, ҳангоми иҷро ситора ва пул диҳед!", "Balalarǵa paydalı wazıypalar beriń, orınlaǵanda júlдızsha hám aqsha beriń!")}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: RADIUS.m, background: th.am + ALPHA.tint, color: th.am, flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                </div>

                <div style={{ display: "flex", gap: SPACE.s2, marginTop: SPACE.s3, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 120, background: th.sur, border: `1.5px solid ${vaz.pending > 0 ? th.am : th.bor}`, borderRadius: RADIUS.s, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ ...TYPE.tiny, color: th.t2 }}>{L(lg, "Tasdiqlash kutilmoqda", "Ожидает подтверждения", "Awaiting approval", "Растауды күтуде", "Тастыктоону күтүүдө", "Интизори тасдиқ", "Tastıyıqlawdı kútip tur")}</span>
                    <span style={{ ...TYPE.title, fontSize: 20, color: vaz.pending > 0 ? th.am : th.t1, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                      {vaz.pending}
                      {vaz.pending > 0 && <span style={{ fontSize: 10, background: th.am + "20", color: th.am, padding: "2px 6px", borderRadius: 10, fontWeight: 700, textTransform: "uppercase" }}>NEW</span>}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 120, background: th.sur, border: `1px solid ${th.bor}`, borderRadius: RADIUS.s, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ ...TYPE.tiny, color: th.t2 }}>{L(lg, "Faol vazifalar", "Активные задания", "Active tasks", "Белсенді тапсырмалар", "Активдүү тапшырмалар", "Вазифаҳои фаъол", "Aktiv wazıypalar")}</span>
                    <span style={{ ...TYPE.title, fontSize: 20, color: th.t1, fontWeight: 800 }}>{vaz.active}</span>
                  </div>
                </div>

                {azolar && azolar.filter(a => a.rol === "kid").length > 0 && (
                  <div style={{ display: "flex", gap: SPACE.s2, marginTop: SPACE.s2, flexWrap: "wrap", borderTop: "1px solid " + th.bor, paddingTop: SPACE.s2 }}>
                    {azolar.filter(a => a.rol === "kid").map(k => (
                      <div key={k.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: th.sur, borderRadius: RADIUS.s, padding: "4px 8px", border: "1px solid " + th.bor }}>
                        <UIAvatar th={th} name={k.ism} size={14} />
                        <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1, fontSize: 11 }}>{k.ism}:</span>
                        <span style={{ ...TYPE.caption, fontWeight: 800, color: th.gr, fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{f(kidBalances[k.id] || 0, true)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ width: "100%", display: "flex", gap: SPACE.s2, marginTop: SPACE.s2 + 4 }}>
                  <button className="ui-press" onClick={(e) => { e.stopPropagation(); buzz(8); setShowAddVazifa(true); }} style={{ width: "100%", background: th.ac, border: "none", color: "#fff", padding: "12px 14px", borderRadius: RADIUS.s, cursor: "pointer", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
                    {Ico.add("#fff")}
                    <span>{L(lg, "Yangi vazifa berish", "Дать новое задание", "Assign new task", "Жаңа тапсырма беру", "Жаңы тапшырма берүү", "Супоридани вазифаи нав", "Jańa wazıypa beriw")}</span>
                  </button>
                </div>
              </AppCard>
            </div>
          )}

          {/* 6. Tezkor amallar — bir qo'l uchun kattaroq target */}
          <SectionHeader th={th} right={null}><span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{DIco.bolt(th.am)}{L(lg, "Tez qo'shish", "Быстрое добавление", "Quick add", "Жылдам қосу", "Тез кошуу", "Иловаи тез", "Tez qosıw")}</span></SectionHeader>
          <div style={{ display: "flex", gap: SPACE.s2, overflowX: "auto", paddingBottom: SPACE.s1, marginBottom: quickItem ? SPACE.s2 : SPACE.s3 }}>
            {QUICK_ADD.map((q, i) => {
              const cl = KATS.find(k => k.id === q.kat)?.c || th.ac;
              return (
                <button key={i} className="ui-press" onClick={() => { buzz(10); setQuickItem(q); setQuickSum(""); }} style={{ flexShrink: 0, background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4 + "px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: SPACE.s2, minWidth: SPACE.s16 + SPACE.s3, minHeight: COMP.touchMin, fontFamily: "inherit" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: RADIUS.s, background: cl + ALPHA.tint }}>
                    <KatIco id={q.id || q.kat} c={cl} s={22} />
                  </div>
                  <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2 }}>{q[lg] || q.uz}</span>
                </button>
              );
            })}
          </div>

          {quickItem && (
            <div className="anim-scaleIn">
              <AppCard th={th} style={{ border: "1.5px solid " + th.ac + ALPHA.strong }}>
                <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s2 + 2 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: RADIUS.s - 2, background: (KATS.find(k => k.id === quickItem.kat)?.c || th.ac) + ALPHA.tint }}>
                    <KatIco id={quickItem.id || quickItem.kat} c={KATS.find(k => k.id === quickItem.kat)?.c || th.ac} s={18} />
                  </div>
                  <span style={{ ...TYPE.body, fontWeight: 700, color: th.t1 }}>{quickItem[lg] || quickItem.uz}</span>
                </div>
                <MoneyInput style={{ ...STY.ip, ...TYPE.title, textAlign: "center" }} value={quickSum} onChange={setQuickSum} placeholder="0" th={th} autoFocus />
                <div style={{ display: "flex", gap: SPACE.s2 }}>
                  <GhostButton th={th} onClick={() => setQuickItem(null)} style={{ flex: 1 }}>{L(lg, "Bekor", "Отмена", "Cancel", "Бас тарту", "Жокко чыгаруу", "Бекор кардан", "Biykar etiw")}</GhostButton>
                  <PrimaryButton th={th} onClick={quickAdd} style={{ flex: 2, marginBottom: 0 }}>{L(lg, "Saqlash", "Сохранить", "Save", "Сақтау", "Сактоо", "Захира кардан", "Saqlaw")}</PrimaryButton>
                </div>
              </AppCard>
            </div>
          )}

          {/* 7. Oxirgi tranzaksiyalar */}
          <SectionHeader th={th} right={recentTx.length > 0 && <button className="ui-press" onClick={() => setScr("hisobot")} style={{ background: "none", border: "none", ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.ac, cursor: "pointer", padding: SPACE.s1 + "px 2px", fontWeight: 700, fontFamily: "inherit" }}>{L(lg, "Hammasi", "Все", "See all", "Барлығы", "Баары", "Ҳама", "Barlıǵı")} ›</button>}>{L(lg, "Oxirgi operatsiyalar", "Последние операции", "Recent transactions", "Соңғы операциялар", "Акыркы операциялар", "Амалиётҳои охирин", "Aqırǵı operatsiyalar")}</SectionHeader>
          
          {/* Sana tanlash filtri (Date picker filter) */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", background: th.sur, padding: "10px 14px", borderRadius: RADIUS.m, border: "1px solid " + th.bor }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ ...TYPE.tiny, color: th.t2, display: "block", marginBottom: 3, fontSize: 10, fontWeight: 700 }}>{L(lg, "DAN", "ОТ", "FROM", "БАСТАП", "БАШТАП", "АЗ", "BASLAP")}</span>
              <input
                type="date"
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: th.bg,
                  border: "1px solid " + th.bor,
                  color: th.t1,
                  fontSize: 12,
                  outline: "none",
                  boxSizing: "border-box"
                }}
                value={filterStart}
                onChange={e => { buzz(5); setFilterStart(e.target.value); }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ ...TYPE.tiny, color: th.t2, display: "block", marginBottom: 3, fontSize: 10, fontWeight: 700 }}>{L(lg, "GACHA", "ДО", "TO", "ДЕЙІН", "ЧЕЙИН", "ТО", "SHEKEM")}</span>
              <input
                type="date"
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: th.bg,
                  border: "1px solid " + th.bor,
                  color: th.t1,
                  fontSize: 12,
                  outline: "none",
                  boxSizing: "border-box"
                }}
                value={filterEnd}
                onChange={e => { buzz(5); setFilterEnd(e.target.value); }}
              />
            </div>
            {(filterStart || filterEnd) && (
              <button
                className="ui-press"
                onClick={() => { buzz(8); setFilterStart(""); setFilterEnd(""); }}
                style={{
                  background: th.sur,
                  border: "1.5px solid " + th.bor,
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                  color: th.rd,
                  fontWeight: 800,
                  fontSize: 11,
                  alignSelf: "flex-end",
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "inherit"
                }}
              >
                {L(lg, "Tozalash", "Очистить", "Clear", "Тазалау", "Тазалоо", "Пок кардан", "Tazalaw")}
              </button>
            )}
          </div>

          {recentTx.length === 0 ? (
            <EmptyState th={th} preset="transaction"
              title={L(lg, "Amallar topilmadi", "Операции не найдены", "No transactions found", "Амалдар табылмады", "Операциялар табылган жок", "Амалиёт ёфт нашуд", "Ámeller tabılmadı")}
              message={L(lg, "Tanlangan sana bo'yicha yoki umumiy amallar yo'q", "Нет операций за выбранный период", "No transactions found for the selected period", "Таңдалған күн бойынша амал жоқ", "Тандалган күн боюнча операция жок", "Барои санаи интихобшуда амалиёт нест", "Tańlanǵan kún boyınsha ámel joq")}
              actionText={L(lg, "Xarajat qo'shish", "Добавить расход", "Add expense", "Шығыс қосу", "Чыгым кошуу", "Иловаи хароҷот", "Shıǵın qosıw")} onAction={() => setScr("qoshish")} />
          ) : (
            <AppCard th={th} pad={0}>
              {recentTx.map((item, i) => <Tx key={item.tp + item.id} item={item} th={th} gN={gN} gP={gP} f={f} user={user} onDelete={delX} onEdit={handleStartEdit} divider={i < recentTx.length - 1} />)}
            </AppCard>
          )}

          {/* 8. Grafik — o'qlari bilan */}
          <ActivityGraph th={th} lg={lg} days30={actv.days30} streak={actv.streak} mx30={actv.mx30} f={f} delay={STAGGER * 2} />

          {/* Sprint 3B: AI moliyaviy tahlil — Health / Forecast / Trend / Savings / Risk */}
          {budgetAI && (
            <>
              <SectionHeader th={th}><span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{DIco.bolt(th.ac)}{L(lg, "Foydali moliyaviy tahlil", "Полезный анализ финансов", "Useful financial analysis", "Пайдалы қаржылық талдау", "Пайдалуу каржылык талдоо", "Таҳлили муфиди молиявӣ", "Paydalı qarjılıq talqılaw")}</span></SectionHeader>
              <SmartBudgetSection th={th} lg={lg} f={f} ai={budgetAI} />
            </>
          )}

          {/* 9. Maqsad progresslari */}
          {(gls.waitG.length > 0 || gls.top || maq.length === 0 || dbt.n > 0 || hasKids) && (
            <SectionHeader th={th}>{L(lg, "Maqsad va majburiyatlar", "Цели и обязательства", "Goals & commitments", "Мақсаттар мен міндеттемелер", "Максаттар жана милдеттенмелер", "Ҳадафҳо ва ӯҳдадориҳо", "Maqsetler hám mindetlemeler")}</SectionHeader>
          )}
          {gls.waitG.length > 0 && (
            <MiniCard th={th} delay={STAGGER * 3} onClick={() => { buzz(8); setScr("maqsad"); }}
              icon={DIco.target(th.am)} iconTone={th.am} border={th.am + ALPHA.strong} bg={th.am + ALPHA.faint}
              title={<span style={{ color: th.am }}>{gN(gls.waitG[0].uid)} {L(lg, "orzusi uchun pul yig'ib bo'ldi!", "\u043D\u0430\u043A\u043E\u043F\u0438\u043B(\u0430) \u043D\u0430 \u043C\u0435\u0447\u0442\u0443!", "saved up for a dream!", "\u0430\u0440\u043C\u0430\u043D\u044B \u04AF\u0448\u0456\u043D \u0430\u049B\u0448\u0430 \u0436\u0438\u043D\u0430\u043F \u0431\u043E\u043B\u0434\u044B!", "\u043A\u044B\u044F\u043B\u044B \u04AF\u0447\u04AF\u043D \u0430\u043A\u0447\u0430 \u0447\u043E\u0433\u0443\u043B\u0442\u0442\u0443!", "\u0431\u0430\u0440\u043E\u0438 \u043E\u0440\u0437\u0443 \u043F\u0443\u043B \u04B7\u0430\u043C\u044A \u043A\u0430\u0440\u0434!", "arman\u0131 ush\u0131n pul j\u0131ynap bold\u0131!")}{gls.waitG.length > 1 ? " (+" + (gls.waitG.length - 1) + ")" : ""}</span>}
              sub={<div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{"\u201C"}{gls.waitG[0].ism}{"\u201D"} {"\u2014"} {L(lg, "olib berish kutilmoqda", "\u043E\u0436\u0438\u0434\u0430\u0435\u0442 \u0432\u0440\u0443\u0447\u0435\u043D\u0438\u044F", "waiting to fulfill", "\u0431\u0435\u0440\u0443\u0434\u0456 \u043A\u04AF\u0442\u0443\u0434\u0435", "\u0431\u0435\u0440\u04AF\u04AF\u043D\u04AF \u043A\u04AF\u0442\u04AF\u04AF\u0434\u04E9", "\u0438\u043D\u0442\u0438\u0437\u043E\u0440\u0438 \u0442\u0430\u04B3\u0432\u0438\u043B \u0430\u0441\u0442", "beriwdi k\u00FAtip tur")}</div>} />
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
              title={L(lg, "Maqsad qo'ying", "Поставьте цель", "Set a goal", "Мақсат қойыңыз", "Максат коюңуз", "Ҳадаф гузоред", "Maqset qoyıń")}
              sub={<div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 2 }}>{L(lg, "Uy, mashina, sayohat uchun jamg'aring", "Копите на дом, машину, путешествие", "Save for your dreams", "Үй, көлік, саяхат үшін жинаңыз", "Үй, машина, саякат үчүн чогултуңуз", "Барои хона, мошин, сафар пасандоз кунед", "Úy, mashina, sayaxat ushın jıynań")}</div>} />
          )}

          {/* 10. Qarz eslatmalari */}
          {dbt.n > 0 && (
            <MiniCard th={th} delay={STAGGER * 4} onClick={() => { buzz(8); setScr("qarz"); }}
              icon={DIco.cash(dbt.overdue ? th.rd : th.ac)} iconTone={dbt.overdue ? th.rd : th.ac} border={dbt.overdue ? th.rd + ALPHA.strong : undefined} bg={dbt.overdue ? th.rd + ALPHA.faint : undefined}
              title={<span>{L(lg, "Qarzlar", "Долги", "Debts", "Қарыздар", "Карыздар", "Қарзҳо", "Qarızlar")} ({dbt.n}){dbt.overdue && <span style={{ marginLeft: SPACE.s1 + 2, ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.rd, fontWeight: 800 }}>{L(lg, "Muddati o'tgan!", "Просрочено!", "Overdue!", "Мерзімі өтіп кетті!", "Мөөнөтү өтүп кетти!", "Мӯҳлат гузашт!", "Múddeti ótip ketti!")}</span>}</span>}
              sub={<div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, marginTop: 3, display: "flex", gap: SPACE.s3, flexWrap: "wrap" }}>{dbt.menga > 0 && <span style={{ color: th.gr, fontWeight: 700 }}>{L(lg, "Menga qaytariladi", "Мне вернут", "They owe", "Маған қайтарылады", "Мага кайтарылат", "Ба ман бармегардонанд", "Maǵan qaytarıladı")}: +{f(dbt.menga, true)}</span>}{dbt.mendan > 0 && <span style={{ color: th.rd, fontWeight: 700 }}>{L(lg, "Men qaytaraman", "Я верну", "I owe", "Мен қайтарамын", "Мен кайтарамын", "Ман бармегардонам", "Men qaytaraman")}: -{f(dbt.mendan, true)}</span>}</div>} />
          )}



          {/* 11. Oiladagi oxirgi faoliyat */}
          {canSeeReport && famTx.length > 0 && (
            <div>
              <SectionHeader th={th}>{L(lg, "Oiladagi oxirgi faoliyat", "Последняя активность семьи", "Family activity", "Отбасыдағы соңғы белсенділік", "Үй-бүлөдөгү акыркы активдүүлүк", "Фаъолияти охирини оила", "Oiladaǵı aqırǵı belsendilik")}</SectionHeader>
              <AppCard th={th} pad={0}>
                {famTx.map((item, i) => <Tx key={"fam" + item.tp + item.id} item={item} th={th} gN={gN} gP={gP} f={f} user={user} onDelete={delX} onEdit={handleStartEdit} divider={i < famTx.length - 1} />)}
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
                    if (!usd && !rub) return L(lg, "ko'rish", "смотреть", "view", "көру", "көрүү", "дидан", "kóriw");
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
                    <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 + 1 }}>{Ico.repeat(th.t2)}{L(lg, "Yangilash", "Обновить", "Refresh", "Жаңарту", "Жаңыртуу", "Навсозӣ", "Jańalaw")}</span>
                  </GhostButton>
                </div>
              )}
            </AppCard>
          </div>
        </div>
      )}

      {/* ═══════════════ TAHRIRLASH / O'CHIRISH — BottomSheet ═══════════════ */}
      <BottomSheet
        th={th}
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={L(lg, "Tahrirlash va o'chirish", "Редактировать и удалить", "Edit & Delete", "Өңдеу және жою", "Түзөтүү жана өчүрүү", "Таҳрир ва ҳазф", "Redaktorlaw hám óshiriw")}
      >
        {editingItem && (
          <div style={{ padding: "0 16px 24px" }}>
            {showDelConfirm ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ ...TYPE.body, fontWeight: 700, color: th.rd, marginBottom: 16 }}>
                  {L(lg, "Ushbu amalni o'chirishni tasdiqlaysizmi?", "Вы уверены, что хотите удалить эту операцию?", "Are you sure you want to delete this transaction?", "Бұл амалды жоюды растайсыз ба?", "Бул операцияны өчүрүүнү ырастайсызбы?", "Шумо мутмаин ҳастед, ки ин амалиётро ҳазф кунед?", "Bul ámeldi óshiriwdi tastıyıqlaysız ba?")}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <GhostButton th={th} onClick={() => setShowDelConfirm(false)} style={{ flex: 1 }}>
                    {L(lg, "Yo'q, bekor qilish", "Нет, отменить", "No, cancel", "Жоқ, бас тарту", "Жок, жокко чыгаруу", "Не, бекор кардан", "Yaq, biykar etiw")}
                  </GhostButton>
                  <DangerButton th={th} onClick={async () => {
                    await delTx(editingItem);
                    setEditingItem(null);
                  }} style={{ flex: 1 }}>
                    {L(lg, "Ha, o'chirish", "Да, удалить", "Yes, delete", "Иә, жою", "Ооба, өчүрүү", "Ҳа, ҳазф кардан", "Áwa, óshiriw")}
                  </DangerButton>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: th.sur, borderRadius: 16, padding: "12px 16px", marginBottom: 16 }}>
                  {editingItem.kategoriya ? (
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: (KATS.find(k => k.id === editKat)?.c || th.ac) + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <KatIco id={editKat} c={KATS.find(k => k.id === editKat)?.c || th.ac} s={22} />
                    </div>
                  ) : (
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: (DARS.find(d => d.id === editKat)?.c || th.gr) + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DarIco id={editKat} c={DARS.find(d => d.id === editKat)?.c || th.gr} s={22} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>
                      {editingItem.kategoriya 
                        ? (KN[lg] || KN.uz)[KATS.findIndex(k => k.id === editKat)]
                        : (DN[lg] || DN.uz)[DARS.findIndex(d => d.id === editKat)]
                      }
                    </div>
                    <div style={{ fontSize: 11, color: th.t2 }}>
                      {editingItem.kategoriya
                        ? L(lg, "Xarajat kategoriyasi", "Категория расхода", "Expense category", "Шығыс санаты", "Чыгым категориясы", "Категорияи хароҷот", "Shıǵın kategoriyası")
                        : L(lg, "Daromad turi", "Тип дохода", "Income type", "Кіріс түрі", "Киреше түрү", "Навъи даромад", "Kirim túri")}
                    </div>
                  </div>
                </div>

                <label style={STY.lb}>{L(lg, "Summa (so'm)", "Сумма (сум)", "Amount", "Сома", "Сумма", "Маблағ", "Sоmma")}</label>
                <MoneyInput style={{ ...STY.ip, fontSize: 24, fontWeight: 800, textAlign: "center" }} value={editSum} onChange={setEditSum} placeholder="0" th={th} />

                <label style={STY.lb}>{L(lg, "Izoh", "Примечание", "Note", "Ескерту", "Эскертүү", "Шарҳ", "Eskertiw")}</label>
                <input style={STY.ip} value={editIzoh} onChange={e => setEditIzoh(e.target.value)} placeholder={L(lg, "Nima uchun?", "За что?", "What for?", "Не үшін?", "Эмне үчүн?", "Барои чӣ?", "Ne ushın?")} />

                <label style={STY.lb}>{L(lg, "Sana", "Дата", "Date", "Күні", "Күнү", "Сана", "Sáne")}</label>
                <input type="date" style={STY.ip} value={editSana} onChange={e => setEditSana(e.target.value)} />

                <div style={{ marginTop: 12, marginBottom: 16 }}>
                  <label style={{ ...STY.lb, marginBottom: 6, display: "block" }}>
                    {editingItem.kategoriya
                      ? L(lg, "Kategoriyani o'zgartirish", "Изменить категорию", "Change category", "Санатты өзгерту", "Категорияны өзгөртүү", "Тағйири категория", "Kategoriyanı ózgertiw")
                      : L(lg, "Daromad turini o'zgartirish", "Изменить тип дохода", "Change income type", "Кіріс түрін өзгерту", "Киреше түрүн өзгөртүү", "Тағйири навъи даромад", "Kirim túrin ózgertiw")}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, maxHeight: 150, overflowY: "auto", padding: 2 }}>
                    {editingItem.kategoriya ? (
                      KATS.map((k, i) => (
                        <button key={k.id} onClick={() => setEditKat(k.id)} style={{ background: editKat === k.id ? k.c + "22" : th.sur, border: editKat === k.id ? "1.5px solid " + k.c : "1.5px solid " + th.bor, borderRadius: 12, padding: "8px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <KatIco id={k.id} c={k.c} s={16} />
                          <span style={{ fontSize: 9, fontWeight: 600, color: th.t1, textAlign: "center" }}>{(KN[lg] || KN.uz)[i]}</span>
                        </button>
                      ))
                    ) : (
                      DARS.map((d, i) => (
                        <button key={d.id} onClick={() => setEditKat(d.id)} style={{ background: editKat === d.id ? d.c + "22" : th.sur, border: editKat === d.id ? "1.5px solid " + d.c : "1.5px solid " + th.bor, borderRadius: 12, padding: "8px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <DarIco id={d.id} c={d.c} s={16} />
                          <span style={{ fontSize: 9, fontWeight: 600, color: th.t1, textAlign: "center" }}>{(DN[lg] || DN.uz)[i]}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <DangerButton th={th} onClick={() => setShowDelConfirm(true)} style={{ flex: 1, margin: 0, padding: "10px" }}>
                    {L(lg, "O'chirish", "Удалить", "Delete", "Жою", "Өчүрүү", "Ҳазф кардан", "Óshiriw")}
                  </DangerButton>
                  <PrimaryButton th={th} onClick={async () => {
                    if (!editSum || Number(editSum) <= 0) {
                      return ok$(L(lg, "Summa kiriting", "Введите сумму", "Enter amount", "Соманы енгізіңіз", "Сумманы киргизиңиз", "Маблағро ворид кунед", "Summanı kiritiń"), "err");
                    }
                    const updateData = {
                      summa: Number(editSum),
                      izoh: editIzoh,
                      sana: editSana,
                    };
                    if (editingItem.kategoriya) {
                      updateData.kategoriya = editKat;
                    } else {
                      updateData.tur = editKat;
                    }
                    await editTx(editingItem, updateData);
                    setEditingItem(null);
                  }} style={{ flex: 2, margin: 0, padding: "10px" }}>
                    {L(lg, "Saqlash", "Сохранить", "Save", "Сақтау", "Сактоо", "Захира кардан", "Saqlaw")}
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
