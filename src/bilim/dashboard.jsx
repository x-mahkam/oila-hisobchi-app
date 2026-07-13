// ═══════════════════════════════════════════════════════════
//  BILIM BOZORI — DASHBOARD (Sprint: UX/UI professional darajaga)
//  Bilim Bozori endi ASOSIY modul: katta Hero + Continue + Fanlar
//  grid + Haftalik progress + AI tavsiya + Baraka Bog'i havolasi.
//  MUHIM: bu fayl SOF prezentatsion — Firebase/coin/XP/permission
//  YO'Q, faqat props. Ma'lumot BilimHub'da o'qiladi (bilim_* dan).
//  Tokenlar: FAQAT utils/tokens.js dan (yangi hex/radius/shadow yo'q).
//  Emoji yo'q — outline SVG (registry BIco + lokal DI).
// ═══════════════════════════════════════════════════════════
import { memo, useState, useMemo, useCallback } from "react";
import { AppCard, StatCard, SectionHeader, PrimaryButton, Badge, UIAvatar, LinearProgress } from "../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM } from "../utils/tokens.js";
import { CATEGORIES, GAMES, DIFF, catById, gameById, gamesOf, isAvailable, availableCount, gameCount } from "./registry.jsx";
import { analyzeLearning } from "./engine/analytics.js";

// ── Lokal outline SVG'lar (emoji o'rniga) ──
const DI = {
  book:  (c, s = 26) => <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><path d="M16 8C13.5 5.5 9.5 5 5 5v20c4.5 0 8.5.5 11 3 2.5-2.5 6.5-3 11-3V5c-4.5 0-8.5.5-11 3z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" fill={c} fillOpacity=".14"/><path d="M16 8v20" stroke={c} strokeWidth="1.8"/></svg>,
  coin:  (c, s = 16) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".15"/><circle cx="10" cy="10" r="4.5" stroke={c} strokeWidth="1.2"/><path d="M10 7.5v5M8 10h4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  bolt:  (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M9 1.5L3.5 9H8l-1 5.5L12.5 7H8l1-5.5z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" fill={c} fillOpacity=".2"/></svg>,
  clock: (c, s = 16) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".12"/><path d="M10 6v4l2.5 2" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  game:  (c, s = 16) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2.5" y="6" width="15" height="9" rx="3.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".12"/><path d="M6 9v3M4.5 10.5h3" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="9.5" r="1" fill={c}/><circle cx="15" cy="11.5" r="1" fill={c}/></svg>,
  fire:  (c, s = 15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5c1 2.5-1.5 3.5-1.5 6A2.5 2.5 0 008 12a3 3 0 003-3c0-1-.5-2-1-2.5.3 1-.5 1.5-1 1.5.5-2-1-4-1-6.5z" stroke={c} strokeWidth="1.2" strokeLinejoin="round" fill={c} fillOpacity=".2"/></svg>,
  chev:  (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  leaf:  (c, s = 26) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M16 4C9 4 5.5 7 5.5 12c0 1 .2 2 .5 3 5.5 0 10-3 10-11z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill={c} fillOpacity=".15"/><path d="M6 15C8.5 11 11.5 8.5 14.5 6.8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  ai:    (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2a5 5 0 00-3 9c.6.5 1 1 1 2h4c0-1 .4-1.5 1-2a5 5 0 00-3-9z" stroke={c} strokeWidth="1.4" fill={c} fillOpacity=".15"/><path d="M8 16h4M8.5 18h3" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  play:  (c, s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M5 3l7 5-7 5V3z" fill={c}/></svg>,
};

// Subject gradient — FAQAT th tokenlaridan (hardcoded hex yo'q)
const grad = (g, th) => "linear-gradient(135deg," + (th[g.grad[0]] || th.ac) + "," + (th[g.grad[1]] || th.ac2) + ")";
const diffColor = (tone, th) => ({ gr: th.gr, am: th.am, rd: th.rd }[tone] || th.ac);
const minLabel = (lg) => (lg === "uz" ? "daq" : lg === "ru" ? "мин" : "min");

// ─────────────────────────────────────────────────────────────
//  STAT DERIVATION — sof funksiya (bilim_games_ sessiyalaridan).
//  Yozuv yo'q, sxema o'zgarmaydi — faqat o'qilgan massivni yig'adi.
// ─────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);
const sumWindow = (list) => list.reduce((a, s) => ({
  minutes: a.minutes + (Number(s.seconds) || 0),
  games: a.games + 1,
  coins: a.coins + (Number(s.coins) || 0),
  xp: a.xp + (Number(s.xp) || 0),
}), { minutes: 0, games: 0, coins: 0, xp: 0 });
const finalize = (acc) => ({ ...acc, minutes: Math.round(acc.minutes / 60) });

/** Bugun / hafta / oy kesimida o'quv statistikasi + oxirgi sessiya. */
export function deriveLearningStats(sessions = []) {
  const list = Array.isArray(sessions) ? sessions : [];
  const now = Date.now();
  const day = todayStr();
  const wk = now - 7 * 86400000;
  const mo = now - 30 * 86400000;
  const today = finalize(sumWindow(list.filter(s => s.date === day)));
  const week = finalize(sumWindow(list.filter(s => (s.ts || 0) >= wk)));
  const month = finalize(sumWindow(list.filter(s => (s.ts || 0) >= mo)));
  return { today, week, month, total: list.length, last: list[0] || null };
}

// ─────────────────────────────────────────────────────────────
//  1) HERO — Bilim Bozori asosiy karta
// ─────────────────────────────────────────────────────────────
export const BilimHero = memo(function BilimHero({
  th, lg, name, photo, level, rankLabel, rankColor,
  coins, xp, xpPct, xpToNext, maxLevel, todayMin, todayGames, streak,
  onProfile,
}) {
  const uz = lg === "uz";
  const subtitle = uz ? "Farzandingiz o'ynab bilim oladi"
    : lg === "ru" ? "Ребёнок учится играя" : "Your child learns by playing";
  const chip = (icon, label, value) => (
    <div style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,0.16)", borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s1 + "px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>{icon}</div>
      <div style={{ ...TYPE.subtitle, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{value}</div>
      <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.82)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
  return (
    <div className="ui-fadeUp" style={{ borderRadius: RADIUS.l, overflow: "hidden", marginBottom: SPACE.s3, background: "linear-gradient(135deg," + rankColor + "," + th.ac2 + ")", boxShadow: SHADOW.e1(th.ac), position: "relative" }}>
      <div style={{ position: "absolute", top: -SPACE.s12, right: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
      <div style={{ padding: SPACE.s4, position: "relative" }}>
        {/* Sarlavha + avatar (avatar → profil) */}
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
          <span style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.m, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{DI.book("#fff", 26)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TYPE.title, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uz ? "Bilim Bozori" : lg === "ru" ? "Рынок знаний" : "Knowledge Market"}</div>
            <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</div>
          </div>
          <button className="ui-press" onClick={onProfile} aria-label={uz ? "Profil" : "Profile"}
            style={{ position: "relative", flexShrink: 0, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
            <span style={{ padding: 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.3)", display: "inline-flex" }}>
              <UIAvatar th={th} src={photo} name={name} size={COMP.touchMin} />
            </span>
            <span style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", background: "#fff", color: rankColor, ...TYPE.tiny, fontWeight: 800, letterSpacing: 0, borderRadius: RADIUS.pill, padding: "1px 7px" }}>LVL {level}</span>
          </button>
        </div>

        {/* XP progress + rank */}
        <div style={{ marginTop: SPACE.s3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: SPACE.s1 }}>
            <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 700, color: "#fff" }}>{rankLabel}</span>
            <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.85)", fontVariantNumeric: "tabular-nums" }}>{maxLevel ? (uz ? "Maksimal daraja" : "Max level") : (xpToNext + " XP → LVL " + (level + 1))}</span>
          </div>
          <div style={{ height: SPACE.s2 - 2, borderRadius: RADIUS.pill, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
            <div style={{ width: Math.min(100, xpPct) + "%", height: "100%", background: "#fff", borderRadius: RADIUS.pill }} />
          </div>
        </div>

        {/* Ko'rsatkichlar: Coin · XP · Bugungi vaqt · Bugungi o'yin */}
        <div style={{ display: "flex", gap: SPACE.s2, marginTop: SPACE.s3 }}>
          {chip(DI.coin("#fff", 15), "Coin", coins)}
          {chip(DI.bolt("#fff", 15), "XP", xp)}
          {chip(DI.clock("#fff", 15), uz ? "Bugun " + minLabel(lg) : minLabel(lg), todayMin)}
          {chip(DI.game("#fff", 16), uz ? "O'yin" : lg === "ru" ? "Игры" : "Games", todayGames)}
        </div>

        {streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1, marginTop: SPACE.s3, ...TYPE.caption, fontWeight: 700, color: "#fff" }}>
            {DI.fire("#fff", 15)}<span>{streak} {uz ? "kun ketma-ket o'qish" : lg === "ru" ? "дней подряд" : "day streak"}</span>
          </div>
        )}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
//  2) CONTINUE LEARNING — oxirgi (yoki tavsiya etilgan) o'yin
// ─────────────────────────────────────────────────────────────
export const ContinueCard = memo(function ContinueCard({ th, lg, cat, game, pct, isNew, onOpen }) {
  const uz = lg === "uz";
  const catObj = cat || (game ? catById(game.category) : null);
  const icon = (catObj && catObj.icon) ? catObj.icon : DI.book;
  const gradKeys = catObj || { grad: ["ac", "ac2"] };
  const title = game ? (game.name[lg] || game.name.uz) : (uz ? "Boshlash" : "Start");
  const catName = catObj ? (catObj.name[lg] || catObj.name.uz) : "";
  return (
    <>
      <SectionHeader th={th}>{uz ? "Davom ettirish" : lg === "ru" ? "Продолжить" : "Continue learning"}</SectionHeader>
      <button className="ui-press" onClick={() => onOpen && onOpen(game)}
        style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3, marginBottom: SPACE.s3, display: "flex", gap: SPACE.s3, alignItems: "center", boxSizing: "border-box" }}>
        <span style={{ width: COMP.touchMin + SPACE.s2, height: COMP.touchMin + SPACE.s2, borderRadius: RADIUS.m, background: grad(gradKeys, th), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon("#fff", 26)}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: SPACE.s2 }}>
            <span style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
            {isNew && <Badge th={th} tone={th.gr}>{uz ? "Tavsiya" : lg === "ru" ? "Совет" : "Suggested"}</Badge>}
          </span>
          <span style={{ display: "block", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>
            {isNew ? (uz ? "Tavsiya etilgan birinchi dars" : lg === "ru" ? "Первый урок" : "First recommended lesson") : catName}
          </span>
          {!isNew && (
            <span style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginTop: SPACE.s1 + 2 }}>
              <LinearProgress th={th} value={pct} tone={th.ac} style={{ flex: 1 }} />
              <span style={{ ...TYPE.tiny, letterSpacing: 0, fontWeight: 800, color: th.ac, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{pct}%</span>
            </span>
          )}
        </span>
        {DI.chev(th.t3, 16)}
      </button>
    </>
  );
});

// ─────────────────────────────────────────────────────────────
//  3) FANLAR — subject grid (icon · progress · o'yin soni · daraja)
// ─────────────────────────────────────────────────────────────
const SubjectCard = memo(function SubjectCard({ th, lg, row, onOpen }) {
  const { cat, avail, total, progress, diff } = row;
  const d = DIFF[diff] || DIFF.easy;
  const soon = avail === 0;
  return (
    <button className="ui-press" onClick={() => onOpen(cat)}
      style={{ textAlign: "left", fontFamily: "inherit", cursor: "pointer", border: "none", padding: 0, borderRadius: RADIUS.m, overflow: "hidden", background: grad(cat, th), boxShadow: SHADOW.e1(th[cat.grad[0]] || th.ac), position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: SPACE.s16 + SPACE.s16 - SPACE.s4, boxSizing: "border-box" }}>
      <div style={{ position: "absolute", top: -SPACE.s8, right: -SPACE.s8, width: SPACE.s16, height: SPACE.s16, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ padding: SPACE.s3 + "px " + SPACE.s3 + "px 0", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.m, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>{cat.icon("#fff", 26)}</span>
        {!soon && <span style={{ background: "rgba(255,255,255,0.9)", borderRadius: RADIUS.pill, padding: "2px 8px", ...TYPE.tiny, letterSpacing: 0, fontWeight: 800, color: diffColor(d.tone, th) }}>{d[lg] || d.uz}</span>}
      </div>
      <div style={{ padding: "0 " + SPACE.s3 + "px " + SPACE.s3 + "px", position: "relative" }}>
        <div style={{ ...TYPE.subtitle, fontWeight: 800, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name[lg] || cat.name.uz}</div>
        <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.88)" }}>
          {soon ? (lg === "uz" ? "Tez orada" : lg === "ru" ? "Скоро" : "Soon")
            : avail + (lg === "uz" ? " ta o'yin" : lg === "ru" ? " игр" : " games") + (total > avail ? " · +" + (total - avail) : "")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1, marginTop: SPACE.s2 }}>
          <div style={{ flex: 1, height: SPACE.s1 + 1, borderRadius: RADIUS.pill, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
            <div style={{ width: Math.min(100, progress) + "%", height: "100%", background: "#fff", borderRadius: RADIUS.pill }} />
          </div>
          <span style={{ ...TYPE.tiny, letterSpacing: 0, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{progress}%</span>
        </div>
      </div>
    </button>
  );
});

export const SubjectGrid = memo(function SubjectGrid({ th, lg, rows, onOpen }) {
  const uz = lg === "uz";
  return (
    <>
      <SectionHeader th={th}>{uz ? "Fanlar" : lg === "ru" ? "Предметы" : "Subjects"}</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
        {rows.map(r => <SubjectCard key={r.cat.id} th={th} lg={lg} row={r} onOpen={onOpen} />)}
      </div>
    </>
  );
});

// ─────────────────────────────────────────────────────────────
//  4) HAFTALIK PROGRESS — Bugun / Bu hafta / Shu oy (segment)
// ─────────────────────────────────────────────────────────────
export const WeeklyProgress = memo(function WeeklyProgress({ th, lg, stats }) {
  const uz = lg === "uz";
  const [period, setPeriod] = useState("week");
  const segs = useMemo(() => ([
    { id: "today", label: uz ? "Bugun" : lg === "ru" ? "Сегодня" : "Today" },
    { id: "week", label: uz ? "Bu hafta" : lg === "ru" ? "Неделя" : "Week" },
    { id: "month", label: uz ? "Shu oy" : lg === "ru" ? "Месяц" : "Month" },
  ]), [uz, lg]);
  const cur = stats[period] || { minutes: 0, games: 0, coins: 0, xp: 0 };
  const onSeg = useCallback((id) => setPeriod(id), []);
  return (
    <>
      <SectionHeader th={th}>{uz ? "Progress" : lg === "ru" ? "Прогресс" : "Progress"}</SectionHeader>
      <AppCard th={th}>
        <div style={{ display: "flex", gap: SPACE.s1, background: th.surH, borderRadius: RADIUS.s, padding: SPACE.s1, marginBottom: SPACE.s3 }}>
          {segs.map(s => {
            const on = s.id === period;
            return (
              <button key={s.id} className="ui-press" onClick={() => onSeg(s.id)}
                style={{ flex: 1, border: "none", cursor: "pointer", fontFamily: "inherit", borderRadius: RADIUS.s - 4, padding: COMP.tabPadY + "px 0", background: on ? th.sur : "transparent", color: on ? th.t1 : th.t2, boxShadow: on ? SHADOW.e1(th.ac) : SHADOW.e0, ...TYPE.caption, fontWeight: on ? 800 : 600 }}>
                {s.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: SPACE.s2 }}>
          <StatCard th={th} icon={DI.clock(th.ac, 18)} value={cur.minutes} label={uz ? "Daqiqa" : lg === "ru" ? "Минут" : "Minutes"} tone={th.ac} />
          <StatCard th={th} icon={DI.game(th.gr, 18)} value={cur.games} label={uz ? "O'yin" : lg === "ru" ? "Игры" : "Games"} tone={th.gr} />
          <StatCard th={th} icon={DI.coin(PREMIUM.gold, 18)} value={cur.coins} label="Coin" tone={PREMIUM.gold} />
          <StatCard th={th} icon={DI.bolt(th.ac2, 18)} value={cur.xp} label="XP" tone={th.ac2} />
        </div>
      </AppCard>
    </>
  );
});

// ─────────────────────────────────────────────────────────────
//  5) AI TAVSIYA — hozircha qoidaviy (keyin AI tizimiga ulanadi)
// ─────────────────────────────────────────────────────────────
export const AiTip = memo(function AiTip({ th, lg, tip, weakTip }) {
  const uz = lg === "uz";
  return (
    <>
      <SectionHeader th={th}>{uz ? "Foydali tavsiyalar" : lg === "ru" ? "Полезные советы" : "Useful suggestions"}</SectionHeader>
      <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med, display: "flex", gap: SPACE.s3, alignItems: "flex-start" }}>
        <span style={{ width: SPACE.s8, height: SPACE.s8, borderRadius: RADIUS.s, background: th.ac + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{DI.ai(th.ac, 20)}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...TYPE.tiny, letterSpacing: 1, color: th.ac, fontWeight: 800, marginBottom: 2 }}>{uz ? "FOYDALI TAVSIYA" : "USEFUL TIP"}</div>
          <div style={{ ...TYPE.caption, color: th.t1, fontWeight: 600, lineHeight: 1.5 }}>{tip}</div>
          {weakTip && <div style={{ ...TYPE.caption, color: th.t2, marginTop: 2, lineHeight: 1.5 }}>{weakTip}</div>}
        </div>
      </AppCard>
    </>
  );
});

// ─────────────────────────────────────────────────────────────
//  7) BILIM BOZORI (MARKET) — Do'kon/mukofotlar havolasi
// ─────────────────────────────────────────────────────────────
export const MarketLink = memo(function MarketLink({ th, lg, onOpen }) {
  const uz = lg === "uz";
  return (
    <button className="ui-press" onClick={onOpen}
      style={{ width: "100%", background: "linear-gradient(135deg," + PREMIUM.gold + ALPHA.tint + "," + th.sur + ")", border: "1px solid " + PREMIUM.gold + ALPHA.med, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s4, cursor: "pointer", display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s3, fontFamily: "inherit", boxSizing: "border-box" }}>
      <span style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.m, background: PREMIUM.gold + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
          <path d="M3.5 8.5V16a1 1 0 001 1h11a1 1 0 001-1V8.5" stroke={PREMIUM.gold} strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M2.5 4.5h15l-.8 3.2a2 2 0 01-3.9.1 2 2 0 01-3.9 0 2 2 0 01-3.9 0 2 2 0 01-3.9-.1L2.5 4.5z" stroke={PREMIUM.gold} strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </span>
      <span style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
        <span style={{ display: "block", ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: th.t1 }}>{uz ? "Bilim Bozori (Mukofotlar)" : lg === "ru" ? "Магазин наград" : "Reward Shop"}</span>
        <span style={{ display: "block", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, marginTop: 1, fontWeight: 700, color: PREMIUM.gold }}>{uz ? "Coinlarni ajoyib mukofotlarga almashtiring!" : lg === "ru" ? "Обменяйте монеты на награды!" : "Exchange your coins for awesome rewards!"}</span>
      </span>
      {DI.chev(PREMIUM.gold, 16)}
    </button>
  );
});

// ─────────────────────────────────────────────────────────────
//  BILIM DASHBOARD — bola bosh ekrani (kompozitsiya + hosila)
//  Firebase yo'q: ma'lumot BilimHub'da o'qiladi va props sifatida
//  keladi. Hosila (stats/fanlar/continue) — SOF, useMemo bilan.
// ─────────────────────────────────────────────────────────────
const DIFF_ORDER = { easy: 0, medium: 1, hard: 2 };

export const BilimDashboard = memo(function BilimDashboard({
  th, lg, name, photo, coins = 0, xp = 0, streak = 0, sessions = [], learnedWords = 0,
  level, rankLabel, rankColor, xpPct, xpToNext, maxLevel,
  openGame, openCat, onProfile, onBack, onMarket,
}) {
  const stats = useMemo(() => deriveLearningStats(sessions), [sessions]);
  const analysis = useMemo(() => analyzeLearning(sessions, lg, name, 3650), [sessions, lg, name]);

  const subjectRows = useMemo(() => {
    const m = {}; analysis.bySubject.forEach(s => { m[s.cat] = s; });
    return CATEGORIES.map(c => {
      const avail = availableCount(c.id), total = gameCount(c.id);
      const s = m[c.id];
      let progress = s ? s.pct : 0;
      if (c.id === "english" && !s) progress = Math.min(100, Math.round(learnedWords / 60 * 100));
      const gs = gamesOf(c.id);
      const availGs = gs.filter(isAvailable);
      const pool = availGs.length ? availGs : gs;
      const diff = pool.length ? pool.map(g => g.difficulty).sort((a, b) => DIFF_ORDER[a] - DIFF_ORDER[b])[0] : "easy";
      return { cat: c, avail, total, progress, diff };
    });
  }, [analysis, learnedWords]);

  const last = stats.last;
  const lastGame = last ? gameById(last.gameId) : null;
  const contGame = useMemo(() => lastGame || GAMES.find(isAvailable) || null, [lastGame]);
  const contCat = contGame ? catById(contGame.category) : null;

  return (
    <>
      <BilimHero th={th} lg={lg} name={name} photo={photo}
        level={level} rankLabel={rankLabel} rankColor={rankColor}
        coins={coins} xp={xp} xpPct={xpPct} xpToNext={xpToNext} maxLevel={maxLevel}
        todayMin={stats.today.minutes} todayGames={stats.today.games} streak={streak}
        onProfile={onProfile} />

      <MarketLink th={th} lg={lg} onOpen={onMarket} />

      <ContinueCard th={th} lg={lg} cat={contCat} game={contGame} pct={last ? last.pct : 0} isNew={!lastGame} onOpen={openGame} />

      <SubjectGrid th={th} lg={lg} rows={subjectRows} onOpen={openCat} />

      <WeeklyProgress th={th} lg={lg} stats={stats} />

      <AiTip th={th} lg={lg} tip={analysis.tip} weakTip={analysis.weakTip} />
    </>
  );
});
