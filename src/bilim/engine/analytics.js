// ═══════════════════════════════════════════════════════════
//  AI ANALYZER — bolaning UMUMIY rivojlanishini tahlil qiladi.
//  Bitta o'yin emas — barcha sessiyalar (bilim_games_) bo'yicha.
//  Offline/qoidaviy. Fan bo'yicha % + tavsiya + haftalik hisobot.
// ═══════════════════════════════════════════════════════════
import { CATEGORIES, catById } from "../registry.jsx";
import i18n from "../../i18n/index.js";

const daysAgo = (n) => Date.now() - n * 86400000;
const subjOf = (gameId) => (gameId || "").split("/")[0];

/**
 * Oxirgi `days` kun bo'yicha fan kesimida tahlil.
 * @returns { bySubject: [{cat, name, pct, games, avgCoin}], best, weak, tip }
 */
export function analyzeLearning(sessions = [], lg = "uz", name = "", days = 30) {
  const since = daysAgo(days);
  const recent = sessions.filter(s => (s.ts || 0) >= since);
  const who = name || i18n.t("an_defaultChildName");

  // Fan bo'yicha guruhlash
  const map = {};
  for (const s of recent) {
    const cat = subjOf(s.gameId);
    if (!map[cat]) map[cat] = { cat, pctSum: 0, games: 0, coin: 0 };
    map[cat].pctSum += Number(s.pct) || 0;
    map[cat].games += 1;
    map[cat].coin += Number(s.coins) || 0;
  }
  const bySubject = Object.values(map).map(m => {
    const c = catById(m.cat);
    const avgPct = m.pctSum / m.games;
    const mastery = Math.min(100, Math.max(5, Math.round((Math.min(6, m.games) * 16.6) * (avgPct / 100))));
    return { 
      cat: m.cat, 
      name: c ? (c.name[lg] || c.name.uz) : m.cat, 
      pct: mastery, 
      games: m.games, 
      avgCoin: Math.round(m.coin / m.games) 
    };
  }).sort((a, b) => b.pct - a.pct);

  const best = bySubject[0] || null;
  const weak = bySubject.length > 1 ? bySubject[bySubject.length - 1] : null;

  // Tavsiya matni
  let tip;
  if (bySubject.length === 0) tip = i18n.t("an_noGamesYet");
  else if (best && best.pct >= 85) tip = i18n.t("an_excelling", { who, subject: lg === "uz" ? best.name.toLowerCase() : best.name });
  else tip = i18n.t("an_keepPracticing");

  let weakTip = null;
  if (weak && weak.pct < 70) weakTip = i18n.t("an_reviewSubject", { subject: weak.name });

  return { bySubject, best, weak, tip, weakTip, totalGames: recent.length };
}

/**
 * Haftalik hisobot (oxirgi 7 kun).
 * @returns { games, coins, xp, best, weak, tip }
 */
export function weeklyReport(sessions = [], lg = "uz", name = "") {
  const since = daysAgo(7);
  const week = sessions.filter(s => (s.ts || 0) >= since);
  const games = week.length;
  const coins = week.reduce((a, s) => a + (Number(s.coins) || 0), 0);
  const xp = week.reduce((a, s) => a + (Number(s.xp) || 0), 0);
  const a = analyzeLearning(sessions, lg, name, 7);
  return { games, coins, xp, best: a.best, weak: a.weak, tip: a.tip, weakTip: a.weakTip };
}
