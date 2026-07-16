// ═══════════════════════════════════════════════════════════
//  PARENTING INTELLIGENCE — yoshga mos vazifa tavsiyalari
//  MUHIM: tashqi AI'ga TO'G'RIDAN-TO'G'RI ULANMAYDI. Tavsiya faqat
//  ISHLANGAN LOKAL MA'LUMOTLAR asosida shakllanadi:
//   • bola yoshi (birthYear — Sprint 3 maydoni);
//   • vazifa tarixi (faol vazifalar chiqarib tashlanadi,
//     2+ marta bajarilganlar "o'zlashtirilgan" deb oxiriga suriladi);
//   • ota-onaning avvalgi mukofot odati (median → taklif summa);
//   • kunlik rotatsiya (har kuni yangi to'plam ko'rinadi).
//  Internet/AI ishlamasa ham 100% ishlaydi (offline baza).
//  `e` — DATA emoji (bazaga preset'lardagidek yoziladi, UI'da SVG).
// ═══════════════════════════════════════════════════════════
import { taskMatchesKid } from "./permissions.js";

// ── Yosh guruhlari va offline tavsiyalar bazasi ──────────────
export const AGE_GROUPS = [
  {
    id: "g57", min: 5, max: 7, baseReward: 2000,
    uz: "5–7 yosh: o'yin orqali o'rganish", en: "Age 5–7: learning through play",
    items: [
      { id: "oyinchoq", presetId: "oyinchoq", e: "🧸", uz: "O'yinchoqlarni yig'ish",            en: "Tidy toys",                ruz: "Uy yig'ishtirish",        ren: "Tidying up" },
      { id: "orin",     presetId: "orin",     e: "🛏️", uz: "O'rinni o'zi yig'ish",              en: "Make the bed",             ruz: "Mustaqillik boshlanishi", ren: "First independence" },
      { id: "harf",     presetId: null,       e: "🔤", uz: "Harflarni o'rganish (10 daqiqa)",   en: "Learn letters (10 min)",   ruz: "Harflar",                 ren: "Letters" },
      { id: "rasm",     presetId: "rasm",     e: "🎨", uz: "Rasm chizish",                      en: "Drawing",                  ruz: "O'yin orqali o'rganish",  ren: "Play-learning" },
      { id: "gul",      presetId: "gul",      e: "🌱", uz: "Gullarni sug'orish",                en: "Water plants",             ruz: "Uy yumushi",              ren: "Home chore" },
      { id: "sanash",   presetId: null,       e: "🎲", uz: "O'yin orqali sanashni o'rganish",   en: "Counting through play",    ruz: "O'yin orqali o'rganish",  ren: "Play-learning" },
    ],
  },
  {
    id: "g810", min: 8, max: 10, baseReward: 5000,
    uz: "8–10 yosh: kitob, sport, mustaqillik", en: "Age 8–10: books, sport, independence",
    items: [
      { id: "kitob",  presetId: "kitob",  e: "📚", uz: "Kitob o'qish (20 daqiqa)",          en: "Read a book (20 min)",       ruz: "Kitob",         ren: "Reading" },
      { id: "sport",  presetId: "sport",  e: "🚴", uz: "Sport bilan shug'ullanish",         en: "Do some exercise",           ruz: "Sport",         ren: "Sport" },
      { id: "sumka",  presetId: null,     e: "🎒", uz: "Maktab sumkasini o'zi tayyorlash",  en: "Pack own school bag",        ruz: "Mustaqillik",   ren: "Independence" },
      { id: "idish",  presetId: "idish",  e: "🍽️", uz: "Idish yuvish",                      en: "Wash the dishes",            ruz: "Uy yumushi",    ren: "Home chore" },
      { id: "soz",    presetId: "soz",    e: "🧠", uz: "5 ta yangi so'z yodlash",           en: "Learn 5 new words",          ruz: "Bilim",         ren: "Learning" },
      { id: "xona",   presetId: "xona",   e: "🧹", uz: "Xonasini o'zi yig'ishtirish",       en: "Clean own room",             ruz: "Mustaqillik",   ren: "Independence" },
    ],
  },
  {
    id: "g1114", min: 11, max: 14, baseReward: 8000,
    uz: "11–14 yosh: mas'uliyat va vaqt", en: "Age 11–14: responsibility & time",
    items: [
      { id: "reja",   presetId: null,    e: "🗓️", uz: "Haftalik uy ishlari rejasini tuzish", en: "Plan weekly chores",        ruz: "Mas'uliyat",          ren: "Responsibility" },
      { id: "jadval", presetId: null,    e: "⏰", uz: "Dars jadvalini o'zi boshqarish",      en: "Manage own study schedule", ruz: "Vaqtni boshqarish",   ren: "Time management" },
      { id: "dokon",  presetId: "dokon", e: "🛒", uz: "Do'kondan xarid qilib kelish",        en: "Do a grocery run",          ruz: "Mas'uliyat",          ren: "Responsibility" },
      { id: "axlat",  presetId: "axlat", e: "🚮", uz: "Axlatni chiqarish",                   en: "Take out the trash",        ruz: "Uy yumushi",          ren: "Home chore" },
      { id: "uka",    presetId: null,    e: "🤝", uz: "Uka-singlisiga dars tayyorlashda yordam", en: "Help sibling with homework", ruz: "Mas'uliyat",     ren: "Responsibility" },
      { id: "kir",    presetId: "kir",   e: "🧺", uz: "Kir yuvishga yordam berish",          en: "Help with laundry",         ruz: "Uy yumushi",          ren: "Home chore" },
    ],
  },
  {
    id: "g15", min: 15, max: 120, baseReward: 12000,
    uz: "15+ yosh: oila, byudjet, reja", en: "Age 15+: family, budget, planning",
    items: [
      { id: "ovqat",  presetId: "ovqat", e: "🍳", uz: "Oilaga ovqat tayyorlash",              en: "Cook a family meal",         ruz: "Oilaga yordam",     ren: "Helping family" },
      { id: "byudjet",presetId: null,    e: "💰", uz: "Haftalik xarajatlarini yozib borish",  en: "Track weekly spending",      ruz: "Byudjet",           ren: "Budget" },
      { id: "oyreja", presetId: null,    e: "🗓️", uz: "Oylik shaxsiy reja tuzish",            en: "Make a monthly plan",        ruz: "Rejalashtirish",    ren: "Planning" },
      { id: "buvi",   presetId: "buvi",  e: "🤲", uz: "Kattalarga yordam berish",             en: "Help the elders",            ruz: "Oilaga yordam",     ren: "Helping family" },
      { id: "tejash", presetId: null,    e: "🎯", uz: "Tejash maqsadini qo'yish",             en: "Set a savings goal",         ruz: "Byudjet",           ren: "Budget" },
      { id: "xarid",  presetId: null,    e: "📝", uz: "Oila xaridlar ro'yxatini tuzish",      en: "Make the family shopping list", ruz: "Rejalashtirish", ren: "Planning" },
    ],
  },
];

/** Bola yoshi — birthYear'dan (Sprint 3). Yo'q bo'lsa null. */
export const getKidAge = (kid) => {
  const by = Number(kid?.birthYear);
  if (!by || by < 1900) return null;
  const age = new Date().getFullYear() - by;
  return age >= 0 && age <= 120 ? age : null;
};

/** Yoshga mos guruh; yosh noma'lum bo'lsa 8–10 (eng universal) qaytadi. */
export const ageGroupOf = (age) => {
  if (age == null) return AGE_GROUPS[1];
  if (age < AGE_GROUPS[0].min) return AGE_GROUPS[0];
  return AGE_GROUPS.find(g => age >= g.min && age <= g.max) || AGE_GROUPS[AGE_GROUPS.length - 1];
};

const nm = x => (x || "").trim().toLowerCase();
const median = arr => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

/**
 * Yoshga mos, tarix bilan boyitilgan tavsiyalar.
 * @returns { age, group, items: [{ id, presetId, e, title, reason, reward }] }
 */
export const recommendTasks = ({ kid, vazifalar = [], lg = "uz", count = 4, now = new Date() }) => {
  const uz = lg === "uz";
  const age = getKidAge(kid);
  const group = ageGroupOf(age);

  // ── Ishlangan ma'lumotlar: shu bolaning vazifa tarixi ──
  const hist = kid ? vazifalar.filter(v => taskMatchesKid(v, kid)) : [];
  const activeTitles = new Set(hist.filter(v => v.status === "pending" || v.status === "done").map(v => nm(v.title)));
  const doneCount = {};
  hist.filter(v => v.status === "approved").forEach(v => { const k = nm(v.title); doneCount[k] = (doneCount[k] || 0) + 1; });

  // Ota-onaning mukofot odati → taklif summa (1000 ga yaxlitlangan)
  const histMed = median(hist.map(v => Number(v.reward) || 0).filter(Boolean));
  const reward = histMed ? Math.max(1000, Math.round(histMed / 1000) * 1000) : group.baseReward;

  // ── Saralash: faol → chiqadi; o'zlashtirilgan (2+ marta) → oxirga ──
  const pool = group.items
    .map(it => ({ ...it, title: uz ? it.uz : it.en, reason: uz ? it.ruz : it.ren, mastered: (doneCount[nm(uz ? it.uz : it.en)] || 0) >= 2 }))
    .filter(it => !activeTitles.has(nm(it.title)));

  const fresh = pool.filter(it => !it.mastered);
  const mastered = pool.filter(it => it.mastered);

  // Kunlik rotatsiya — har kuni boshqa boshlanish nuqtasi
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const rot = (arr) => arr.length ? arr.map((_, i) => arr[(i + dayOfYear) % arr.length]) : arr;

  const items = [...rot(fresh), ...mastered].slice(0, count).map(it => ({
    id: it.id, presetId: it.presetId, e: it.e, title: it.title,
    reason: it.mastered ? (uz ? "Takrorlash" : "Repeat") : it.reason,
    reward,
  }));

  return { age, group, items };
};
