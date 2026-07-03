// ═══════════════════════════════════════════════════════════
//  GLOBAL BOLALAR REYTINGI (Liderbord)
//  Barcha oilalardagi bolalar bitta umumiy doskada.
//  Ma'lumot: "kids_board" hujjati — { [kidId]: entry } xaritasi.
//  entry = { ism, oilaId, total, tW: {haftaKey: ball}, tM: {oyKey: ball},
//            taskCount, taskEarn, upd }
// ═══════════════════════════════════════════════════════════
import { db } from "../firebase.js";

const BOARD_KEY = "kids_board";

// ISO hafta kaliti: "2026-W27"
export const weekKey = (d = new Date()) => {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const y = dt.getUTCFullYear();
  const w = Math.ceil((((dt - Date.UTC(y, 0, 1)) / 86400000) + 1) / 7);
  return `${y}-W${String(w).padStart(2, "0")}`;
};

// Oy kaliti: "2026-07"
export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// Doskani o'qish → massiv [{id, ...entry}]
export async function fetchKidsBoard() {
  try {
    const raw = (await db.g(BOARD_KEY)) || {};
    if (typeof raw !== "object" || Array.isArray(raw)) return [];
    return Object.entries(raw).map(([id, e]) => ({ id, ...(e || {}) }));
  } catch (e) {
    console.error("kidsBoard fetch:", e);
    return [];
  }
}

// Ball qo'shish/yangilash (o'qi → birlashtir → yoz)
// deltaPts — reyting balli; deltaTask — bajarilgan vazifalar soni;
// deltaEarn — vazifadan topilgan so'm (ma'lumot uchun)
export async function publishKidScore({ kidId, ism, oilaId, deltaPts = 0, deltaTask = 0, deltaEarn = 0 }) {
  if (!kidId) return;
  try {
    const raw = (await db.g(BOARD_KEY)) || {};
    const board = (typeof raw === "object" && !Array.isArray(raw)) ? raw : {};
    const cur = board[kidId] || { total: 0, tW: {}, tM: {}, taskCount: 0, taskEarn: 0 };
    const wk = weekKey(), mk = monthKey();
    const next = {
      ...cur,
      ism: ism || cur.ism || "?",
      oilaId: oilaId || cur.oilaId || "",
      total: (Number(cur.total) || 0) + deltaPts,
      tW: { ...(cur.tW || {}), [wk]: (Number(cur.tW?.[wk]) || 0) + deltaPts },
      tM: { ...(cur.tM || {}), [mk]: (Number(cur.tM?.[mk]) || 0) + deltaPts },
      taskCount: (Number(cur.taskCount) || 0) + deltaTask,
      taskEarn: (Number(cur.taskEarn) || 0) + deltaEarn,
      upd: Date.now(),
    };
    // Eski hafta/oy kalitlarini tozalash (hujjat o'smasin)
    const trim = (obj, keep) => Object.fromEntries(Object.entries(obj || {}).sort((a, b) => b[0].localeCompare(a[0])).slice(0, keep));
    next.tW = trim(next.tW, 8);
    next.tM = trim(next.tM, 6);
    board[kidId] = next;
    await db.s(BOARD_KEY, board);
  } catch (e) {
    console.error("kidsBoard publish:", e);
  }
}
