// ═══════════════════════════════════════════════════════════
//  PERSIST — Coin Manager + Result Logger.
//  • Coin: MAVJUD "bilim_coins_<uid>" jamg'armasiga qo'shiladi
//    (yangi coin tizimi YO'Q — BilimBozor bilan bir xil kalit).
//  • Sessiya natijasi: "bilim_games_<uid>" ga qo'shiladi (additive log,
//    parent report uchun). Coin/permission tizimiga tegmaydi.
// ═══════════════════════════════════════════════════════════
import { db } from "../../firebase.js";

/** Joriy umumiy coinni o'qish (bilim_coins_<uid>). */
export const readCoins = async (uid) => {
  try { const v = await db.g("bilim_coins_" + uid); return Number(v) || 0; }
  catch (e) { return 0; }
};

/** Lifetime coinni o'qish (bilim_coins_lifetime_<uid>). */
export const readLifetimeCoins = async (uid) => {
  try { const v = await db.g("bilim_coins_lifetime_" + uid); return Number(v) || 0; }
  catch (e) { return 0; }
};

/** Topilgan coinni MAVJUD jamg'armaga qo'shib, yangi jamini qaytaradi. */
export const addCoins = async (uid, earned) => {
  const cur = await readCoins(uid);
  const earnedClean = Math.max(0, Math.round(earned || 0));
  const next = cur + earnedClean;
  try { await db.s("bilim_coins_" + uid, next); } catch (e) {}

  // Update lifetime coins
  const curLife = await readLifetimeCoins(uid);
  const nextLife = curLife + earnedClean;
  try { await db.s("bilim_coins_lifetime_" + uid, nextLife); } catch (e) {}

  return next;
};

/** Bugungi sana YYYY-MM-DD. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

export const calculateDailyStreak = (sessions) => {
  if (!Array.isArray(sessions) || sessions.length === 0) return 0;
  const dates = Array.from(new Set(sessions.filter(s => s && s.date).map(s => s.date))).sort().reverse();
  if (dates.length === 0) return 0;

  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterdayStr = `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,"0")}-${String(y.getDate()).padStart(2,"0")}`;

  const latestDate = dates[0];
  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  const parseDateStr = (str) => {
    const parts = str.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  };

  let current = parseDateStr(latestDate);

  for (let i = 1; i < dates.length; i++) {
    const prevDate = parseDateStr(dates[i]);
    const diffTime = Math.abs(current - prevDate);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      current = prevDate;
    } else if (diffDays > 1) {
      break;
    }
  }
  return streak;
};

/**
 * Sessiya natijasini log qilish (parent report uchun).
 * record: { gameId, correct, total, pct, seconds, maxCombo, coins, difficulty, newRecord }
 */
export const logGameSession = async (uid, record) => {
  try {
    const cur = (await db.g("bilim_games_" + uid)) || [];
    const item = { id: Date.now(), date: today(), ts: Date.now(), ...record };
    const next = [item, ...(Array.isArray(cur) ? cur : [])].slice(0, 100);
    await db.s("bilim_games_" + uid, next);
    
    // Save streak
    const streak = calculateDailyStreak(next);
    await db.s("bilim_streak_" + uid, streak);
    
    return item;
  } catch (e) { return null; }
};

/** Shu o'yin bo'yicha eng yaxshi coin natijasi (rekord tekshirish uchun). */
export const bestForGame = async (uid, gameId) => {
  try {
    const cur = (await db.g("bilim_games_" + uid)) || [];
    return (Array.isArray(cur) ? cur : []).filter(r => r.gameId === gameId).reduce((mx, r) => Math.max(mx, Number(r.coins) || 0), 0);
  } catch (e) { return 0; }
};

/** Parent report uchun: barcha sessiyalar (yangi birinchi). */
export const readSessions = async (uid) => {
  try { const v = await db.g("bilim_games_" + uid); return Array.isArray(v) ? v : []; }
  catch (e) { return []; }
};

/** Level progress o'qish (bilim_levels_<uid>). */
export const readLevelProgress = async (uid) => {
  try {
    const v = await db.g("bilim_levels_" + uid);
    return v || {};
  } catch (e) {
    return {};
  }
};

/** Level progress saqlash. */
export const saveLevelProgress = async (uid, gameId, levelId, stars) => {
  try {
    const cur = await readLevelProgress(uid);
    if (!cur[gameId]) cur[gameId] = {};
    const prevStars = cur[gameId][levelId]?.stars || 0;
    if (stars > prevStars) {
      cur[gameId][levelId] = { stars, ts: Date.now() };
      await db.s("bilim_levels_" + uid, cur);
    }
    return cur;
  } catch (e) {
    return {};
  }
};

/**
 * Kunlik takror o'ynash mukofot koeffitsiyenti (farmga qarshi).
 * 1-o'yin: 100%, 2-chi: 60%, 3-chi: 30%, 4+ : 10%.
 * Matematika o'yinlarida shu qoida ichki yozilgan edi — endi umumiy helper:
 * mantiq/xotira/moliyaviy o'yinlar ham cheksiz "sog'ilmasin".
 */
export const dailyCoinMultiplier = async (uid, gameId) => {
  try {
    const sessions = await readSessions(uid);
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const n = sessions.filter(s => s && s.date === today && s.gameId === gameId).length;
    if (n === 0) return 1.0;
    if (n === 1) return 0.6;
    if (n === 2) return 0.3;
    return 0.1;
  } catch (e) { return 1.0; }
};

/** Coin sarflash — yetarli bo'lmasa false qaytaradi, lifetime hisoblagichga TEGMAYDI. */
export const spendCoins = async (uid, amount) => {
  try {
    const cur = await readCoins(uid);
    const cost = Math.max(0, Math.round(amount || 0));
    if (cur < cost) return false;
    const next = cur - cost;
    await db.s("bilim_coins_" + uid, next);
    return next;
  } catch (e) { return false; }
};

