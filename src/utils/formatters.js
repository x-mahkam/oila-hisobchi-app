// ═══════════════════════════════════════════════════════════
//  FORMATTERS — yordamchi funksiyalar
// ═══════════════════════════════════════════════════════════

/** Bugungi sana: YYYY-MM-DD */
export const td = () => new Date().toISOString().slice(0, 10);

/** Hozirgi vaqt: HH:MM */
export const nt = () => new Date().toTimeString().slice(0, 5);

/** Joriy oy: YYYY-MM */
export const tm = () => new Date().toISOString().slice(0, 7);

/** Summani formatlash: 1234567 → "1 234 567 so'm" */
export const f = (n, showUnit = false) => {
  const num = Math.abs(Math.round(Number(n) || 0));
  const formatted = num.toLocaleString("uz-UZ");
  return showUnit ? formatted + " so'm" : formatted;
};

/** Parolni hash qilish (sodda) */
export const hp = async (pw) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};

/** Random ID */
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

/** Kunlar farqi */
export const daysDiff = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};

/** Foiz hisoblash */
export const pct = (part, total) => total > 0 ? Math.round((part / total) * 100) : 0;
