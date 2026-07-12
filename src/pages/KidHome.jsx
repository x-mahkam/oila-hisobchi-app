// ═══════════════════════════════════════════════════════════
//  KID HOME / PROFILE — FLAGSHIP (Sprint 4A)
//  Bolalar uchun gamification tajribasi. Ilhom: Duolingo Kids,
//  Khan Kids, Pokemon Quest — lekin fintech Design System buzilmaydi.
//
//  QOIDALAR: Firebase/permission/business-logic/state O'ZGARMAYDI.
//  Barcha ko'rsatkichlar MAVJUD ma'lumotdan (faqat o'qish):
//   • vazifalar, stars, kidBalances, kidGifts, kidLedger, gardenData (props)
//   • bilim_coins_/bilim_xp_/bilim_stats_/bilim_streak_ + bilim_games_
//     (BilimHub bilan bir xil o'qish naqshi — yozuv yo'q, sxema o'zgarmaydi)
//  Emoji yo'q — outline SVG. Gradient faqat Hero'da. Faqat DS tokenlari.
// ═══════════════════════════════════════════════════════════
import { memo, useMemo, useCallback, useState, useEffect } from "react";
import { db } from "../firebase.js";
import { useApp } from "../context/AppContext.jsx";
import { AppCard, SectionHeader, PrimaryButton, Badge, UIAvatar, LinearProgress, EmptyState } from "../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM } from "../utils/tokens.js";
import { fullName } from "../utils/formatters.js";
import { levelFor, rankFor } from "../bilim/engine/xp.js";
import { readSessions, calculateDailyStreak } from "../bilim/engine/persist.js";
import { analyzeLearning } from "../bilim/engine/analytics.js";
import { gameById } from "../bilim/registry.jsx";

// ── Outline SVG ikonkalar (emoji o'rniga) ──
const KI = {
  coin: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".15"/><circle cx="10" cy="10" r="4.5" stroke={c} strokeWidth="1.2"/><path d="M10 7.5v5M8 10h4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  bolt: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M9 1.5L3.5 9H8l-1 5.5L12.5 7H8l1-5.5z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill={c} fillOpacity=".2"/></svg>,
  check: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".15"/><path d="M6.5 10l2.2 2.2L13.5 7.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  task: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="14" rx="2" stroke={c} strokeWidth="1.4" fill={c} fillOpacity=".12"/><path d="M7 8l1.5 1.5L11.5 6.5M7 13h6" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  game: (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2.5" y="6" width="15" height="9" rx="3.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".12"/><path d="M6 9v3M4.5 10.5h3" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="9.5" r="1" fill={c}/><circle cx="15" cy="11.5" r="1" fill={c}/></svg>,
  leaf: (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M16 4C9 4 5.5 7 5.5 12c0 1 .2 2 .5 3 5.5 0 10-3 10-11z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill={c} fillOpacity=".15"/><path d="M6 15C8.5 11 11.5 8.5 14.5 6.8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  medal: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="12.5" r="5" stroke={c} strokeWidth="1.4" fill={c} fillOpacity=".15"/><path d="M10 10.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L7 12.8l2-.3 1-2z" stroke={c} strokeWidth="1" strokeLinejoin="round"/><path d="M7 3l1.5 4M13 3l-1.5 4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  gift: (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="9" rx="1.5" stroke={c} strokeWidth="1.4" fill={c} fillOpacity=".12"/><path d="M2.5 6h15v2.5h-15zM10 6v11M10 6C10 4 8.5 3 7.5 3.5 6.5 4 7 6 10 6zm0 0c0-2 1.5-3 2.5-2.5 1 .5.5 2.5-2.5 2.5z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  lock: (c, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="6.5" rx="1.8" stroke={c} strokeWidth="1.3" fill={c} fillOpacity=".12"/><path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  chev: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  fire: (c, s = 15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5c1 2.5-1.5 3.5-1.5 6A2.5 2.5 0 008 12a3 3 0 003-3c0-1-.5-2-1-2.5.3 1-.5 1.5-1 1.5.5-2-1-4-1-6.5z" stroke={c} strokeWidth="1.2" strokeLinejoin="round" fill={c} fillOpacity=".2"/></svg>,
  cake: (c, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2.5 13.5h11v-4a2 2 0 00-2-2h-7a2 2 0 00-2 2v4z" stroke={c} strokeWidth="1.2" fill={c} fillOpacity=".12" strokeLinejoin="round"/><path d="M2.5 10.5c1 .8 2 .8 3 0s2-.8 3 0 2 .8 3 0M8 4.5V6.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="3" r=".9" fill={c}/></svg>,
  book: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M9 4.5C7.5 3 5.5 2.5 2.5 2.5v11c3 0 5 .5 6.5 2 1.5-1.5 3.5-2 6.5-2v-11c-3 0-5 .5-6.5 2z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 4.5v11" stroke={c} strokeWidth="1.2"/></svg>,
  heart: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M9 15.5C4 12 2 9.5 2 6.8 2 4.7 3.6 3.2 5.6 3.2c1.3 0 2.6.7 3.4 2 .8-1.3 2.1-2 3.4-2 2 0 3.6 1.5 3.6 3.6 0 2.7-2 5.2-7 8.7z" fill={c} opacity=".15" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  clock: (c, s = 13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth="1.2" fill={c} fillOpacity=".08"/><path d="M8 5v3.2l2 1.3" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  store: (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M3.5 8.5V16a1 1 0 001 1h11a1 1 0 001-1V8.5" stroke={c} strokeWidth="1.4" fill={c} fillOpacity=".1" strokeLinejoin="round"/><path d="M2.5 4.5h15l-.8 3.2a2 2 0 01-2 1.5 2 2 0 01-2-1.6 2 2 0 01-2 1.6 2 2 0 01-2-1.6 2 2 0 01-2 1.6 2 2 0 01-2-1.5L2.5 4.5z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 17v-3.5h4V17" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  tag: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10.5 2.5H4a1.5 1.5 0 00-1.5 1.5v6.5a1.5 1.5 0 00.44 1.06l6 6a1.5 1.5 0 002.12 0l5.5-5.5a1.5 1.5 0 000-2.12l-6-6A1.5 1.5 0 0010.5 2.5z" stroke={c} strokeWidth="1.4" fill={c} fillOpacity=".1" strokeLinejoin="round"/><circle cx="6.8" cy="6.8" r="1.2" fill={c}/></svg>,
};

// mavjud kategoriya ikonlari (fanlar uchun) — registry BIco'ni takrorlamay, sodda o'rovchi
const isMineTask = (v, user) =>
  v.assignedTo === user.id ||
  (v.assignedLogin && user.login && v.assignedLogin === user.login) ||
  (v.assignedName && user.ism && v.assignedName.trim().toLowerCase() === user.ism.trim().toLowerCase());

const ago = (dateStr, bugun, uz) => {
  if (!dateStr) return "";
  if (dateStr === bugun) return uz ? "Bugun" : "Today";
  const d0 = new Date(bugun + "T00:00:00").getTime();
  const d1 = new Date(dateStr + "T00:00:00").getTime();
  const diff = Math.round((d0 - d1) / 86400000);
  if (diff === 1) return uz ? "Kecha" : "Yesterday";
  if (diff > 1) return diff + (uz ? " kun oldin" : "d ago");
  return dateStr;
};

// ── Missiya qatori ──
const Mission = memo(function Mission({ th, icon, label, cur, goal, done, onClick }) {
  const pct = goal > 0 ? Math.min(100, Math.round(cur / goal * 100)) : (done ? 100 : 0);
  const ok = done || (goal > 0 && cur >= goal);
  return (
    <button className="ui-press" onClick={onClick} disabled={!onClick}
      style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: onClick ? "pointer" : "default", background: "transparent", border: "none", padding: SPACE.s2 + "px 0", display: "flex", alignItems: "center", gap: SPACE.s3 }}>
      <span style={{ width: SPACE.s8 + 2, height: SPACE.s8 + 2, borderRadius: RADIUS.s + 2, background: (ok ? th.gr : th.ac) + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {ok ? KI.check(th.gr, 18) : icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: SPACE.s2 }}>
          <span style={{ ...TYPE.caption, fontWeight: 700, color: ok ? th.gr : th.t1 }}>{label}</span>
          <span style={{ ...TYPE.tiny, letterSpacing: 0, color: th.t2, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{goal > 0 ? Math.min(cur, goal) + "/" + goal : ""}</span>
        </span>
        <LinearProgress th={th} value={pct} tone={ok ? th.gr : th.ac} style={{ marginTop: SPACE.s1 }} />
      </span>
    </button>
  );
});

// ── Fan kartasi ──
const SkillCard = memo(function SkillCard({ th, name, pct, games, coin, onClick }) {
  return (
    <button className="ui-press" onClick={onClick}
      style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.s2 }}>
        <span style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        <span style={{ ...TYPE.caption, fontWeight: 800, color: th.ac, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{pct}%</span>
      </span>
      <LinearProgress th={th} value={pct} tone={th.ac} />
      <span style={{ display: "flex", alignItems: "center", gap: SPACE.s2, ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>
        <span>{games} {"o'yin"}</span>
        {coin > 0 && <span style={{ color: PREMIUM.gold, fontWeight: 700 }}>· {coin} coin</span>}
      </span>
    </button>
  );
});

// ── Redesigned MedalCard (collectible) ──
const MedalCard = memo(function MedalCard({ th, unlocked, title, sub, cur, goal, isNew, onClick }) {
  const pct = goal > 0 ? Math.min(100, Math.round(cur / goal * 100)) : 0;
  
  return (
    <button 
      className="ui-press" 
      onClick={onClick} 
      disabled={!unlocked}
      style={{
        background: "transparent",
        border: "none",
        outline: "none",
        cursor: unlocked ? "pointer" : "default",
        padding: 0,
        margin: 0,
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        width: "100%",
        position: "relative"
      }}
    >
      {/* Medal circular badge */}
      <div 
        style={{
          width: 64,
          height: 64,
          borderRadius: RADIUS.full,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: unlocked 
            ? "linear-gradient(135deg, " + PREMIUM.gold + ", #f59e0b)" 
            : th.surH,
          boxShadow: unlocked 
            ? "0 4px 12px " + PREMIUM.gold + "50, inset 0 -2px 0 rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.3)" 
            : "none",
          border: unlocked 
            ? "2px solid #fff" 
            : "2px dashed " + th.bor,
          transition: "all 0.3s ease",
          marginBottom: SPACE.s2
        }}
      >
        {/* If locked, show progress concentric ring */}
        {!unlocked && goal > 0 && (
          <svg 
            width={64} 
            height={64} 
            viewBox="0 0 64 64" 
            style={{ 
              position: "absolute", 
              top: -2, 
              left: -2, 
              transform: "rotate(-90deg)",
              pointerEvents: "none"
            }}
          >
            <circle 
              cx={32} 
              cy={32} 
              r={29} 
              fill="none" 
              stroke={th.bor} 
              strokeWidth="2" 
            />
            <circle 
              cx={32} 
              cy={32} 
              r={29} 
              fill="none" 
              stroke={th.ac} 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 29} 
              strokeDashoffset={2 * Math.PI * 29 * (1 - pct / 100)} 
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
        )}

        {/* Medal icon or Lock icon */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: unlocked ? "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" : "none"
        }}>
          {unlocked ? KI.medal("#fff", 30) : KI.lock(th.t3, 20)}
        </div>

        {/* Claim / New badge indicator */}
        {isNew && unlocked && (
          <div style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 16,
            height: 16,
            borderRadius: RADIUS.full,
            background: th.rd,
            border: "2px solid #fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }} />
        )}
      </div>

      {/* Text Info */}
      <div style={{ 
        ...TYPE.caption, 
        fontWeight: 700, 
        color: unlocked ? th.t1 : th.t3, 
        maxWidth: 85,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        lineHeight: "1.2"
      }}>
        {title}
      </div>
      
      {/* Subtext or Progress number */}
      <div style={{ 
        fontSize: 10, 
        color: th.t3, 
        marginTop: 2,
        maxWidth: 85,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }}>
        {unlocked ? sub : `${cur}/${goal}`}
      </div>
    </button>
  );
});

// ── Oxirgi o'yin qatori ──
const GameRow = memo(function GameRow({ th, name, icon, pct, coin, when, onClick }) {
  const tone = pct >= 80 ? th.gr : pct >= 50 ? th.am : th.rd;
  return (
    <button className="ui-press" onClick={onClick}
      style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3, marginBottom: SPACE.s2, display: "flex", alignItems: "center", gap: SPACE.s3, boxSizing: "border-box" }}>
      <span style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.s + 2, background: th.ac + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon(th.ac, 24)}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", ...TYPE.body, fontWeight: 700, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        <span style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginTop: 1 }}>
          <span style={{ ...TYPE.tiny, letterSpacing: 0, fontWeight: 800, color: tone, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
          {coin > 0 && <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: PREMIUM.gold, fontWeight: 700 }}>+{coin} coin</span>}
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>· {when}</span>
        </span>
      </span>
    </button>
  );
});

// ── Do'kon mukofot kartasi (coin → mukofot almashinuvi) ──
const RewardCard = memo(function RewardCard({ th, f, name, reward, targetCoins, coins, done, uz, onClick }) {
  const pct = targetCoins > 0 ? Math.min(100, Math.round(coins / targetCoins * 100)) : (done ? 100 : 0);
  const ready = done || (targetCoins > 0 && coins >= targetCoins);
  const remain = Math.max(0, targetCoins - coins);
  return (
    <button className="ui-press" onClick={onClick}
      style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: ready ? PREMIUM.gold + ALPHA.faint : th.sur, border: (ready ? "1.5px solid " + PREMIUM.gold + ALPHA.strong : "1px solid " + th.bor), borderRadius: RADIUS.m, padding: SPACE.s3, marginBottom: SPACE.s2, display: "flex", alignItems: "center", gap: SPACE.s3, boxSizing: "border-box" }}>
      <span style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.s + 2, background: (ready ? PREMIUM.gold : th.ac) + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ready ? KI.gift(PREMIUM.gold, 24) : KI.tag(th.ac, 22)}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.s2 }}>
          <span style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
          <span style={{ ...TYPE.caption, fontWeight: 800, color: PREMIUM.gold, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{f(reward, true)}</span>
        </span>
        <LinearProgress th={th} value={pct} tone={ready ? th.gr : th.ac} style={{ marginTop: SPACE.s1 }} />
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.s2, marginTop: SPACE.s1, ...TYPE.tiny, textTransform: "none", letterSpacing: 0 }}>
          <span style={{ color: ready ? th.gr : th.t2, fontWeight: 700 }}>{ready ? (uz ? "Tayyor! Ota-onang to'laydi" : "Ready! Your parent pays") : (uz ? "Yana " + remain + " coin" : remain + " coins to go")}</span>
          <span style={{ color: th.t3, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{Math.min(coins, targetCoins)}/{targetCoins}</span>
        </span>
      </span>
    </button>
  );
});

export default function KidHome({
  user, lg, th, f, buzz, addStar, fireConfetti,
  vazifalar = [], kidBalances = {}, stars = 0, gardenData = {},
  kidGifts = [], kidLedger = [], bugun,
  vazifaDone, setShowGames, setShowGift, setShowBilim, setScr, setPTab,
  setShowAddVazifa,
}) {
  const { setBilimInitialView } = useApp();
  const uz = lg === "uz";
  const name = fullName(user);
  const money = kidBalances[user.id] || 0;

  // ── Bilim ma'lumoti — MAVJUD kollektsiyalardan, faqat o'qish (BilimHub naqshi) ──
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [offers, setOffers] = useState([]);
  
  const isToday = useCallback((sanaStr) => {
    if (!sanaStr) return false;
    if (sanaStr === bugun) return true;
    const utcToday = new Date().toISOString().slice(0, 10);
    if (sanaStr === utcToday) return true;
    return false;
  }, [bugun]);

  const bstreak = useMemo(() => calculateDailyStreak(sessions), [sessions]);

  useEffect(() => {
    if (!user?.id) return;
    db.g("bilim_coins_" + user.id).then(v => { if (v != null) setCoins(Number(v) || 0); }).catch(() => {});
    db.g("bilim_xp_" + user.id).then(v => { if (v != null) setXp(Number(v) || 0); }).catch(() => {});
    readSessions(user.id).then(setSessions).catch(() => {});
    if (user.oilaId) db.g("bilim_offer_" + user.oilaId).then(v => { if (Array.isArray(v)) setOffers(v); }).catch(() => {});
  }, [user?.id, user?.oilaId]);

  const lv = useMemo(() => levelFor(xp), [xp]);
  const rankObj = useMemo(() => rankFor(lv.level), [lv.level]);
  const rankColor = rankObj.color;
  const rankLabel = rankObj[lg] || rankObj.uz;

  const age = user?.birthYear ? Math.max(0, new Date().getFullYear() - Number(user.birthYear)) : null;
  const greet = (() => { const h = new Date().getHours(); return h < 12 ? (uz ? "Xayrli tong" : "Good morning") : h < 18 ? (uz ? "Xayrli kun" : "Good afternoon") : (uz ? "Xayrli kech" : "Good evening"); })();
  const wateredToday = gardenData && isToday(gardenData.watered);
  const wateredCountToday = useMemo(() => {
    if (!gardenData || !gardenData.wateredBy || !user?.id) return 0;
    return gardenData.wateredBy.filter(w => w.uid === user.id && isToday(w.sana ? w.sana.slice(0, 10) : "")).length;
  }, [gardenData, isToday, user?.id]);

  // ── Vazifa hosilalari ──
  const tasks = useMemo(() => {
    const myV = (vazifalar || []).filter(v => isMineTask(v, user));
    const doneAll = myV.filter(v => v.status === "approved");
    const active = myV.filter(v => v.status === "pending" || v.status === "done");
    const doneToday = myV.filter(v => {
      const completedToday = v.status === "done" && isToday(v.doneSana);
      const paidToday = v.status === "approved" && (isToday(v.paidSana) || isToday(v.doneSana));
      return completedToday || paidToday;
    }).length;
    return { myV, doneAll, active, doneToday };
  }, [vazifalar, user, isToday]);

  // ── Bugungi Bilim faoliyati ──
  const todayLearn = useMemo(() => {
    const t = (sessions || []).filter(s => isToday(s.date));
    return { games: t.length, coins: t.reduce((a, s) => a + (Number(s.coins) || 0), 0), xp: t.reduce((a, s) => a + (Number(s.xp) || 0), 0) };
  }, [sessions, isToday]);

  // ── Fanlar (analitika) ──
  const analysis = useMemo(() => analyzeLearning(sessions, lg, name, 30), [sessions, lg, name]);

  // ── Oxirgi o'yinlar (newest-first) ──
  const recent = useMemo(() => (sessions || []).slice(0, 3), [sessions]);

  // ── Missiyalar ──
  const missions = useMemo(() => {
    const list = [
      { id: "task",   icon: KI.task(th.ac), label: uz ? "Vazifa bajar" : "Do a task",     cur: tasks.doneToday,   goal: 1, onClick: () => { buzz(6); setScr("vazifa"); } },
      { id: "game",   icon: KI.game(th.ac), label: uz ? "O'yin o'yna" : "Play a game",     cur: todayLearn.games,  goal: 1, onClick: () => { buzz(6); setScr("bilim"); } },
      { id: "coin",   icon: KI.coin(th.ac), label: uz ? "20 coin yig'" : "Earn 20 coins",  cur: todayLearn.coins,  goal: 20, onClick: () => { buzz(6); setScr("bilim"); } },
      { id: "garden", icon: KI.leaf(th.gr), label: uz ? "Bog' sug'or" : "Water the garden", cur: wateredCountToday, goal: 2, onClick: () => { buzz(6); if (setPTab) setPTab("garden"); setScr("profil"); } },
    ];
    const done = list.filter(m => m.done || (m.goal > 0 && m.cur >= m.goal)).length;
    return { list, done, total: list.length };
  }, [th, uz, tasks.doneToday, todayLearn.games, todayLearn.coins, wateredCountToday, buzz, setScr, setShowGames, setShowBilim, setPTab]);

  // ── Yutuqlar (task + garden + bilim aralash) ──
  const medals = useMemo(() => {
    const list = [
      { id: "first",  title: uz ? "Ilk qadam" : "First step",  sub: uz ? "1 vazifa" : "1 task",     cur: tasks.doneAll.length, goal: 1 },
      { id: "worker", title: uz ? "Mehnatkash" : "Worker",      sub: uz ? "5 vazifa" : "5 tasks",    cur: tasks.doneAll.length, goal: 5 },
      { id: "coin",   title: uz ? "Boyvachcha" : "Collector",   sub: uz ? "50 coin" : "50 coins",    cur: coins,                goal: 50 },
      { id: "player", title: uz ? "O'yinboz" : "Gamer",         sub: uz ? "10 o'yin" : "10 games",   cur: sessions.length,      goal: 10 },
      { id: "garden", title: uz ? "Bog'bon" : "Gardener",       sub: uz ? "Bog' 3-daraja" : "Lvl 3", cur: gardenData.level || 0, goal: 3 },
      { id: "streak", title: uz ? "Doimiy" : "Consistent",      sub: uz ? "3 kun" : "3d streak",     cur: bstreak,              goal: 3 },
    ].map(m => ({ ...m, unlocked: m.cur >= m.goal }));
    const newIdx = list.findIndex(m => m.unlocked && m.cur === m.goal);
    return list.map((m, i) => ({ ...m, isNew: i === newIdx }));
  }, [uz, tasks.doneAll.length, coins, sessions.length, gardenData.level, bstreak]);
  const unlockedCount = medals.filter(m => m.unlocked).length;

  // ── Savdolashish takliflari (bilim_offer, faqat shu bola, pending va ota-onadan kelgan) ──
  const pendingOffersCount = useMemo(() => {
    return (offers || []).filter(o => o.kidId === user?.id && o.status === "pending" && o.fromRole === "parent").length;
  }, [offers, user?.id]);

  // ── Ota-ona maqtovi (placeholder — kelajakda AI) ──
  const praise = useMemo(() => {
    const active = tasks.doneToday > 0 || todayLearn.games > 0;
    if (active) return uz ? "Bugun juda yaxshi ishlading! Shunday davom et." : "Great work today! Keep it up.";
    return uz ? "Bugun bitta vazifa yoki o'yin bilan boshla — sen uddalaysan!" : "Start with one task or game today — you've got this!";
  }, [tasks.doneToday, todayLearn.games, uz]);

  // ── Barqaror handlerlar ──
  const openGames = useCallback(() => { buzz(10); setShowGames(true); }, [buzz, setShowGames]);
  const openBilim = useCallback((v = "cats") => {
    buzz(10);
    const viewName = typeof v === "string" ? v : "cats";
    setBilimInitialView(viewName);
    setScr("bilim");
  }, [buzz, setScr, setBilimInitialView]);

  const ring = COMP.touchMin + SPACE.s16;
  const R = (ring - 6) / 2;
  const CIRC = 2 * Math.PI * R;

  return (
    <div>
      {/* ═══ 1. HERO ═══ */}
      <div className="ui-fadeUp" style={{ background: "linear-gradient(135deg," + rankColor + " 0%," + th.ac2 + " 55%," + PREMIUM.gold + " 135%)", borderRadius: RADIUS.l, padding: (SPACE.s4 + SPACE.s1) + "px " + SPACE.s4 + "px", marginBottom: SPACE.s3, position: "relative", overflow: "hidden", boxShadow: SHADOW.e1(rankColor) }}>
        <div style={{ position: "absolute", top: -SPACE.s12, right: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -SPACE.s16, left: -SPACE.s6, width: SPACE.s16 + SPACE.s12, height: SPACE.s16 + SPACE.s12, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s4, position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, gap: 4 }}>
            <div style={{ position: "relative", width: ring, height: ring, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={ring} height={ring} viewBox={"0 0 " + ring + " " + ring} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
                <circle cx={ring / 2} cy={ring / 2} r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
                <circle cx={ring / 2} cy={ring / 2} r={R} fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - lv.pct / 100)} style={{ transition: "stroke-dashoffset .6s ease" }} />
              </svg>
              <UIAvatar th={th} src={user.photo} name={name} size={COMP.touchMin + SPACE.s6} />
              <span style={{ position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)", background: "#fff", color: rankColor, ...TYPE.tiny, fontWeight: 800, letterSpacing: 0, borderRadius: RADIUS.pill, padding: "2px 9px", boxShadow: SHADOW.e1(rankColor) }}>
                LVL {lv.level}
              </span>
            </div>
            <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.9)", fontWeight: 700, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
              {lv.inLevel}/{lv.max ? lv.inLevel : (lv.inLevel + lv.toNext)} XP
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.85)" }}>{greet}</div>
            <div style={{ ...TYPE.heading, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginTop: SPACE.s1, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, background: "rgba(255,255,255,0.2)", borderRadius: RADIUS.pill, padding: "2px 8px", ...TYPE.tiny, letterSpacing: 0, fontWeight: 700, color: "#fff" }}>{rankLabel}</span>
              {age != null && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, background: "rgba(255,255,255,0.14)", borderRadius: RADIUS.pill, padding: "2px 8px", ...TYPE.tiny, letterSpacing: 0, color: "#fff" }}>{KI.cake("#fff", 12)}{age} {uz ? "yosh" : "y.o."}</span>}
            </div>
            <div style={{ display: "flex", gap: SPACE.s2, marginTop: SPACE.s2, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, background: "rgba(255,255,255,0.18)", borderRadius: RADIUS.pill, padding: "3px 9px" }}>{KI.coin("#fff", 15)}<span style={{ ...TYPE.caption, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{coins}</span></span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, background: "rgba(255,255,255,0.18)", borderRadius: RADIUS.pill, padding: "3px 9px" }}>{KI.bolt("#fff", 14)}<span style={{ ...TYPE.caption, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{xp} XP</span></span>
              {bstreak > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, background: "rgba(255,255,255,0.18)", borderRadius: RADIUS.pill, padding: "3px 9px" }}>{KI.fire("#fff", 14)}<span style={{ ...TYPE.caption, fontWeight: 800, color: "#fff" }}>{bstreak}</span></span>}
            </div>
          </div>
        </div>
        <div style={{ marginTop: SPACE.s3, background: "rgba(255,255,255,0.14)", borderRadius: RADIUS.m, padding: SPACE.s3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.s2 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.85)" }}>{uz ? "Mening cho'ntak pulim" : "My pocket money"}</div>
            <div style={{ ...TYPE.title, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{f(money, true)}</div>
          </div>
          <span style={{ width: SPACE.s8 + SPACE.s2, height: SPACE.s8 + SPACE.s2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{KI.coin("#fff", 20)}</span>
        </div>
      </div>

      {/* ═══ 2. BUGUNGI MISSIYA ═══ */}
      <SectionHeader th={th} right={<Badge th={th} type={missions.done >= missions.total ? "success" : undefined}>{missions.done}/{missions.total}</Badge>}>{uz ? "Bugungi missiya" : "Today's mission"}</SectionHeader>
      <AppCard th={th} style={{ marginBottom: SPACE.s3 }}>
        <LinearProgress th={th} value={Math.round(missions.done / missions.total * 100)} tone={th.gr} height={SPACE.s2 + 2} style={{ marginBottom: SPACE.s2 }} />
        {missions.list.map(m => <Mission key={m.id} th={th} icon={m.icon} label={m.label} cur={m.cur} goal={m.goal} done={m.done} onClick={m.onClick} />)}
      </AppCard>

      {/* ═══ 3. BILIM BOZORI ═══ */}
      <SectionHeader th={th} right={<span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{KI.coin(PREMIUM.gold, 15)}<span style={{ ...TYPE.caption, fontWeight: 800, color: PREMIUM.gold, fontVariantNumeric: "tabular-nums" }}>{coins}</span></span>}>{uz ? "Bilim Bozori" : "Knowledge Market"}</SectionHeader>

      {/* Oltin do'kon banneri */}
      <button 
        className="ui-press" 
        onClick={() => openBilim("market")}
        style={{
          width: "100%",
          textAlign: "left",
          fontFamily: "inherit",
          cursor: "pointer",
          background: "linear-gradient(135deg, " + PREMIUM.gold + ALPHA.tint + ", " + th.sur + ")",
          border: "1.5px solid " + PREMIUM.gold + ALPHA.strong,
          borderRadius: RADIUS.m,
          padding: SPACE.s4,
          marginBottom: SPACE.s3,
          display: "flex",
          alignItems: "center",
          gap: SPACE.s4,
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ 
          width: COMP.touchMin + SPACE.s2, 
          height: COMP.touchMin + SPACE.s2, 
          borderRadius: RADIUS.full, 
          background: PREMIUM.gold + ALPHA.tint, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          flexShrink: 0 
        }}>
          {KI.gift(PREMIUM.gold, 26)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ ...TYPE.title, fontSize: TYPE.title.fontSize - 1, color: th.t1, fontWeight: 800 }}>
            {uz ? "Do'kon" : "Shop"}
          </div>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 4, lineHeight: "1.3" }}>
            {uz ? "Yig'ilgan coinlaringizni o'yinchoqlar, kitoblar yoki mukofot pullariga almashtiring!" : "Exchange your earned coins for toys, books, or reward money!"}
          </div>
          {pendingOffersCount > 0 && (
            <div style={{ ...TYPE.tiny, color: th.ac, fontWeight: 800, marginTop: 6, display: "flex", alignItems: "center", gap: 4, background: th.ac + "18", padding: "4px 8px", borderRadius: 8 }}>
              🔔 {uz ? `Ota-onangizdan ${pendingOffersCount} ta yangi taklif bor!` : `You have ${pendingOffersCount} new offer(s) from parents!`}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          {KI.chev(PREMIUM.gold, 20)}
        </div>
      </button>

      {/* ═══ 4. KUNLIK SERIYA (streak) — faqat 0 bo'lganda ═══ */}
      {bstreak === 0 && (
        <>
          <SectionHeader th={th}>{uz ? "Kunlik seriya" : "Daily streak"}</SectionHeader>
          <EmptyState th={th} icon={KI.fire(th.t3, 40)} title={uz ? "Seriya hali boshlanmagan" : "No streak yet"} message={uz ? "Bugun bitta o'yin o'yna — seriyang boshlanadi!" : "Play a game today to start your streak!"} actionText={uz ? "O'ynash" : "Play"} onAction={openGames} style={{ marginBottom: SPACE.s3 }} />
        </>
      )}

      {/* ═══ 5. O'RGANILAYOTGAN FANLAR ═══ */}
      <SectionHeader th={th} right={analysis.bySubject.length > 0 ? <button className="ui-press" onClick={openBilim} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 2, ...TYPE.caption, fontWeight: 700, color: th.ac }}>{uz ? "Barchasi" : "All"}{KI.chev(th.ac, 14)}</button> : null}>{uz ? "O'rganilayotgan fanlar" : "Subjects"}</SectionHeader>
      {analysis.bySubject.length === 0 ? (
        <EmptyState th={th} icon={KI.book(th.t3, 40)} title={uz ? "Hali fan boshlanmagan" : "No subjects yet"} message={uz ? "Bilim Bozorida birinchi darsni boshla." : "Start your first lesson in the Knowledge Market."} actionText={uz ? "Bilim Bozori" : "Knowledge Market"} onAction={openBilim} style={{ marginBottom: SPACE.s3 }} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          {analysis.bySubject.slice(0, 6).map(s => <SkillCard key={s.cat} th={th} name={s.name} pct={s.pct} games={s.games} coin={s.avgCoin} onClick={openBilim} />)}
        </div>
      )}

      {/* ═══ 6. SO'NGGI YUTUQLAR ═══ */}
      <SectionHeader th={th} right={<Badge th={th} type="premium" icon={null}>{unlockedCount}/{medals.length}</Badge>}>{uz ? "So'nggi yutuqlar" : "Achievements"}</SectionHeader>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: SPACE.s4 + "px " + SPACE.s2 + "px", 
        background: th.sur, 
        border: "1px solid " + th.bor, 
        borderRadius: RADIUS.m, 
        padding: SPACE.s4, 
        marginBottom: SPACE.s3 
      }}>
        {medals.map(m => (
          <MedalCard
            key={m.id} th={th} unlocked={m.unlocked} title={m.title} sub={m.sub} cur={m.cur} goal={m.goal} isNew={m.isNew}
            onClick={() => {
              if (m.unlocked) {
                buzz(25);
                if (typeof fireConfetti === "function") fireConfetti();
                addStar(1, uz ? `Yutuq: ${m.title}` : `Achievement: ${m.title}`);
              }
            }}
          />
        ))}
      </div>

      {/* ═══ 7. OTA-ONA MAQTOVI ═══ */}
      <div style={{ background: th.gr + ALPHA.faint, border: "1px solid " + th.gr + ALPHA.med, borderRadius: RADIUS.m, padding: SPACE.s4, marginBottom: SPACE.s3, display: "flex", gap: SPACE.s3, alignItems: "flex-start" }}>
        <span style={{ width: SPACE.s8 + SPACE.s2, height: SPACE.s8 + SPACE.s2, borderRadius: RADIUS.full, background: th.gr + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{KI.heart(th.gr, 20)}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...TYPE.caption, fontWeight: 700, color: th.gr }}>{uz ? "Ota-onangdan" : "From your parents"}</div>
          <div style={{ ...TYPE.body, color: th.t1, marginTop: 2 }}>{praise}</div>
        </div>
      </div>

      {/* ═══ 8. OXIRGI O'YNALGAN O'YINLAR ═══ */}
      {recent.length > 0 && (
        <>
          <SectionHeader th={th}>{uz ? "Oxirgi o'yinlar" : "Recent games"}</SectionHeader>
          {recent.map(s => {
            const g = gameById(s.gameId);
            const nm = g ? (g.name[lg] || g.name.uz) : s.gameId;
            const ic = g ? g.icon : KI.game;
            return <GameRow key={s.id || s.ts} th={th} name={nm} icon={ic} pct={Number(s.pct) || 0} coin={Number(s.coins) || 0} when={ago(s.date, bugun, uz)} onClick={openBilim} />;
          })}
        </>
      )}
    </div>
  );
}
