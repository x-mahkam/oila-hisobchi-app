// ═══════════════════════════════════════════════════════════
//  AI ANALYZER — bolaning UMUMIY rivojlanishini tahlil qiladi.
//  Bitta o'yin emas — barcha sessiyalar (bilim_games_) bo'yicha.
//  Offline/qoidaviy. Fan bo'yicha % + tavsiya + haftalik hisobot.
// ═══════════════════════════════════════════════════════════
import { CATEGORIES, catById } from "../registry.jsx";

const daysAgo = (n) => Date.now() - n * 86400000;
const subjOf = (gameId) => (gameId || "").split("/")[0];

/**
 * Oxirgi `days` kun bo'yicha fan kesimida tahlil.
 * @returns { bySubject: [{cat, name, pct, games, avgCoin}], best, weak, tip }
 */
export function analyzeLearning(sessions = [], lg = "uz", name = "", days = 30) {
  const uz = lg === "uz", ru = lg === "ru";
  const since = daysAgo(days);
  const recent = sessions.filter(s => (s.ts || 0) >= since);
  const who = name || (uz ? "Bola" : ru ? "Ребёнок" : "The child");

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
    return { cat: m.cat, name: c ? (c.name[lg] || c.name.uz) : m.cat, pct: Math.round(m.pctSum / m.games), games: m.games, avgCoin: Math.round(m.coin / m.games) };
  }).sort((a, b) => b.pct - a.pct);

  const best = bySubject[0] || null;
  const weak = bySubject.length > 1 ? bySubject[bySubject.length - 1] : null;

  // Tavsiya matni
  let tip;
  if (bySubject.length === 0) tip = uz ? "Hali o'yin o'ynalmagan — birga boshlang." : ru ? "Игр пока нет — начните вместе." : "No games yet — start together.";
  else if (best && best.pct >= 85) tip = uz ? who + " " + best.name.toLowerCase() + "ni juda yaxshi o'zlashtirmoqda." : ru ? who + " отлично осваивает: " + best.name : who + " is excelling at " + best.name + ".";
  else tip = uz ? "Kunlik 5-10 daqiqa mashqni davom ettiring." : ru ? "Продолжайте 5-10 минут в день." : "Keep up 5-10 minutes daily practice.";

  let weakTip = null;
  if (weak && weak.pct < 70) weakTip = uz ? weak.name + " mavzusini takrorlash tavsiya qilinadi." : ru ? "Повторите тему: " + weak.name : "Review " + weak.name + ".";

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
