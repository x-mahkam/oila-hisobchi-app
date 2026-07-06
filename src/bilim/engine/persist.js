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

/** Topilgan coinni MAVJUD jamg'armaga qo'shib, yangi jamini qaytaradi. */
export const addCoins = async (uid, earned) => {
  const cur = await readCoins(uid);
  const next = cur + Math.max(0, Math.round(earned || 0));
  try { await db.s("bilim_coins_" + uid, next); } catch (e) {}
  return next;
};

/** Bugungi sana YYYY-MM-DD. */
const today = () => new Date().toISOString().slice(0, 10);

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
