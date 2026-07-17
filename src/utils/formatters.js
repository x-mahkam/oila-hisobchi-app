// ═══════════════════════════════════════════════════════════
//  FORMATTERS — yordamchi funksiyalar
// ═══════════════════════════════════════════════════════════

/** Bugungi sana: YYYY-MM-DD */
export const td = () => new Date().toISOString().slice(0, 10);

/** Hozirgi vaqt: HH:MM */
export const nt = () => new Date().toTimeString().slice(0, 5);

/** To'liq ism: kattalar bilan bir xil tartib — FAMILYA oldinda, keyin ism.
 *  Familya bo'lsa "Familya Ism"; bo'lmasa (kattalar bitta maydonga yozgan) — o'z ismi. */
export const fullName = (p) => p ? ((p.familya ? (p.familya + " " + (p.ism || "")) : (p.ism || "")).trim()) : "";

/** Joriy oy: YYYY-MM */
export const tm = () => new Date().toISOString().slice(0, 7);

/** Summani formatlash: 1234567 → "1 234 567 so'm" */
export const f = (n, showUnit = false) => {
  const num = Math.abs(Math.round(Number(n) || 0));
  const formatted = String(num).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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

/** Telefon raqamini normallashtirish */
export const normTel = t => {
  const d = (t || "").replace(/[^0-9]/g, "");
  return d.length > 9 ? d.slice(-9) : d;
};

/** Summani o'zbekcha so'z bilan yozish */
export const sonSoz = n => {
  n = Math.round(Math.abs(Number(n) || 0));
  if (n === 0) return "nol";
  const bir = ["","bir","ikki","uch","to'rt","besh","olti","yetti","sakkiz","to'qqiz"];
  const on  = ["","o'n","yigirma","o'ttiz","qirq","ellik","oltmish","yetmish","sakson","to'qson"];
  const uch = x => {
    let s = "", yuz = Math.floor(x/100), qol = x%100, o = Math.floor(qol/10), b = qol%10;
    if (yuz) s += (yuz>1?bir[yuz]+" ":"") + "yuz ";
    if (o)   s += on[o] + " ";
    if (b)   s += bir[b] + " ";
    return s.trim();
  };
  let res = "";
  const mlrd = Math.floor(n/1e9), mln = Math.floor((n%1e9)/1e6);
  const ming = Math.floor((n%1e6)/1000), qoldiq = n%1000;
  if (mlrd)   res += uch(mlrd) + " milliard ";
  if (mln)    res += uch(mln)  + " million ";
  if (ming)   res += uch(ming) + " ming ";
  if (qoldiq) res += uch(qoldiq) + " ";
  return res.trim();
};

/** Summani formatlash (valyuta bilan) */
export const fmtN = (n, val, sh) => {
  const v = Math.abs(Number(n) || 0);
  const c = val.id === "uzs" ? v : v / val.k;
  const spc = x => {
    const s = Math.round(Math.abs(x)).toString();
    let r = "";
    for (let i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) r += " ";
      r += s[i];
    }
    return (x < 0 ? "-" : "") + r;
  };
  if (sh) {
    if (val.id === "uzs") {
      if (v >= 1e9) return (v/1e9).toFixed(v%1e9===0?0:1).replace(/(\.\d*?)0+$/,"$1").replace(/\.$/,"") + " mlrd so'm";
      if (v >= 1e6) return (v/1e6).toFixed(v%1e6===0?0:2).replace(/(\.\d*?)0+$/,"$1").replace(/\.$/,"") + " mln so'm";
      return spc(v) + " so'm";
    }
    if (c >= 1e6) return (c/1e6).toFixed(1) + "M " + val.b;
    if (c >= 1e3) return Math.round(c/1e3) + "K " + val.b;
    return Math.round(c) + " " + val.b;
  }
  if (val.id === "uzs") return spc(v) + " so'm";
  return Math.round(c) + " " + val.b;
};

// Ilova valyutasi doim so'm (UZS) — faqat "so'm" so'zi tilga tarjima qilinadi, valyuta o'zi emas.
const MATH_CURRENCY_WORD = { uz: "so'm", ru: "сум", en: "UZS", kk: "сум", ky: "сум", tg: "сум", qr: "sum" };
const MATH_THOUSAND_WORD = { uz: "ming", ru: "тыс.", en: "thousand", kk: "мың", ky: "миң", tg: "ҳазор", qr: "mıń" };

/** Matematika o'yinlari uchun qisqa pul formati (tilga qarab) */
export const formatMathCurrency = (value, lang = "uz") => {
  const val = Number(value) || 0;
  const isMultipleOf1000 = val % 1000 === 0 && val >= 1000;
  const currency = MATH_CURRENCY_WORD[lang] || MATH_CURRENCY_WORD.uz;

  if (isMultipleOf1000) {
    const thousand = MATH_THOUSAND_WORD[lang] || MATH_THOUSAND_WORD.uz;
    return `${val / 1000} ${thousand} ${currency}`;
  }
  return `${val.toLocaleString("ru-RU")} ${currency}`;
};

/** Matn ichidagi "X so'm" yoki "X 000 so'm" ni tilga moslab o'zgartiradi */
export const translateMathString = (str, lang = "uz") => {
  if (typeof str !== "string") return str;
  return str.replace(/(\d[\d\s]*)\s*so'm/gi, (match, p1) => {
    const num = parseInt(p1.replace(/\s+/g, ""), 10);
    if (!isNaN(num)) {
      return formatMathCurrency(num, lang);
    }
    return match;
  });
};


