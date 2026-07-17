// ═══════════════════════════════════════════════════════════
//  XP MANAGER — bolaning rivojlanish tizimi (Coin dan ALOHIDA).
//  • Coin → ota-ona mukofoti uchun (bilim_coins_, mavjud).
//  • XP → faqat rivojlanish: Level / Rank / Achievement ochadi.
//  Yangi kalit: bilim_xp_<uid> (additive, coin/permission tegilmaydi).
// ═══════════════════════════════════════════════════════════
import { db } from "../../firebase.js";

// ── 20 levelli progressiya (kümülativ XP bo'sag'alari) ──
//  L1=0, L2=300, L3=700, keyin har qadam +100 ga oshib boradi.
export const LEVEL_THRESHOLDS = (() => {
  const arr = [0];
  let step = 300;
  for (let i = 1; i < 20; i++) { arr.push(arr[i - 1] + step); step += 100; }
  return arr; // 20 ta: [0,300,700,1200,1800,2500,...]
})();

// ── Unvonlar (level oralig'i bo'yicha) ──
export const RANKS = [
  { max: 3,  uz: "Yangi boshlovchi", ru: "Новичок",   en: "Beginner",  kk: "Жаңадан бастаушы", ky: "Жаңы баштоочу", tg: "Навомӯз",   qr: "Jańadan baslawshı", color: "#94a3b8" },
  { max: 6,  uz: "O'rganuvchi",      ru: "Ученик",     en: "Learner",   kk: "Үйренуші",         ky: "Үйрөнүүчү",     tg: "Омӯзанда",  qr: "Úyreniwshi",        color: "#22c55e" },
  { max: 9,  uz: "Bilimdon",         ru: "Знаток",     en: "Skilled",   kk: "Білгір",           ky: "Билерман",      tg: "Донанда",   qr: "Bilgir",             color: "#3b82f6" },
  { max: 13, uz: "Usta",            ru: "Мастер",     en: "Master",    kk: "Шебер",            ky: "Уста",           tg: "Уста",      qr: "Usta",               color: "#8b5cf6" },
  { max: 17, uz: "Ekspert",          ru: "Эксперт",    en: "Expert",    kk: "Сарапшы",          ky: "Эксперт",       tg: "Коршинос",  qr: "Ekspert",            color: "#f59e0b" },
  { max: 20, uz: "Afsona",           ru: "Легенда",    en: "Legend",    kk: "Аңыз",             ky: "Легенда",       tg: "Афсона",    qr: "Legenda",            color: "#06b6d4" },
];

/** XP dan level + progress hisoblash. */
export const levelFor = (xp) => {
  const x = Math.max(0, Number(xp) || 0);
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) if (x >= LEVEL_THRESHOLDS[i]) level = i + 1;
  const curBase = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextBase = LEVEL_THRESHOLDS[level] ?? (curBase + 2000); // 20-leveldan keyin
  const inLevel = x - curBase;
  const span = Math.max(1, nextBase - curBase);
  const pct = level >= 20 ? 100 : Math.min(100, Math.round(inLevel / span * 100));
  return { level, xp: x, inLevel, toNext: Math.max(0, nextBase - x), nextBase, pct, max: level >= 20 };
};

export const rankFor = (level) => RANKS.find(r => level <= r.max) || RANKS[RANKS.length - 1];

// ── XP jamg'arma o'qish/qo'shish (bilim_xp_<uid>) ──
export const readXp = async (uid) => {
  try { const v = await db.g("bilim_xp_" + uid); return Number(v) || 0; }
  catch (e) { return 0; }
};
export const addXp = async (uid, gained) => {
  const cur = await readXp(uid);
  const next = cur + Math.max(0, Math.round(gained || 0));
  try { await db.s("bilim_xp_" + uid, next); } catch (e) {}
  return next;
};

/** Level oshganini aniqlash (natija ekranida "Level up" ko'rsatish uchun). */
export const didLevelUp = (beforeXp, afterXp) => levelFor(afterXp).level > levelFor(beforeXp).level;
