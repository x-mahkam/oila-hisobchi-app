// ═══════════════════════════════════════════════════════════
//  GLOBAL BOLALAR REYTINGI (Liderbord) — XAVFSIZ MODEL
//  Eski: bitta "kids_board" blob — istalgan foydalanuvchi BUTUN doskani
//  qayta yozib, boshqalar ballarini o'chira olardi (+ poyga holati).
//  Yangi: har bola uchun alohida hujjat kb_<kidId> (c:"kb" kanali).
//  Rules: faqat o'sha bolaning OILASI yoza oladi; o'qish — "kb" kanali
//  bo'yicha so'rov orqali (autentifikatsiyalangan foydalanuvchilarga).
//  Poyga ham hal: endi bitta bolaga faqat o'z oilasi yozadi.
// ═══════════════════════════════════════════════════════════
import { db } from "../firebase.js";

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
    const rows = await db.q("kb");
    const out = rows.map(r => ({ ...r, id: (r._id || "").replace(/^kb_/, "") || r.id }));
    // Eski yagona blob (migratsiya davri): faqat o'qiladi, ustunlik yangi hujjatlarda
    try {
      const legacy = (await db.g("kids_board")) || {};
      if (legacy && typeof legacy === "object" && !Array.isArray(legacy)) {
        const have = new Set(out.map(e => e.id));
        Object.entries(legacy).forEach(([id, e]) => { if (!have.has(id) && e) out.push({ id, ...e }); });
      }
    } catch {}
    return out;
  } catch (e) {
    console.error("kidsBoard fetch:", e);
    return [];
  }
}

// Ball qo'shish/yangilash — FAQAT o'z bolamiz hujjatiga (kb_<kidId>)
export async function publishKidScore({ kidId, ism, oilaId, deltaPts = 0, deltaTask = 0, deltaEarn = 0 }) {
  if (!kidId) return;
  try {
    const cur = (await db.g("kb_" + kidId)) || { total: 0, tW: {}, tM: {}, taskCount: 0, taskEarn: 0 };
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
    await db.s("kb_" + kidId, next, { c: "kb" });
  } catch (e) {
    console.error("kidsBoard publish:", e);
  }
}
