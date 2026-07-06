// ═══════════════════════════════════════════════════════════
//  BILIM BOZORI — GAME REGISTRY (Sprint: platforma arxitekturasi)
//  Yangi o'yin qo'shish = shu faylga BITTA yozuv qo'shish.
//  Firebase/coin/permission O'ZGARMAYDI — bu faqat metama'lumot.
//  Har o'yin: { id: "<category>/<game>", ... , load: () => Component }
//  `load` bo'lmasa — "tez orada" (soon) holatida ko'rinadi.
// ═══════════════════════════════════════════════════════════

// ── Kichik outline SVG'lar (emoji o'rniga) ──
const S = (paths, extra) => (c, s = 26) => (
  <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
    {paths.map((d, i) => <path key={i} d={d} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={c} fillOpacity={i === 0 ? 0.14 : 0} />)}
    {extra}
  </svg>
);
export const BIco = {
  math:    S(["M6 6h20v20H6z", "M11 11h10M11 16h10M11 21h6"]),
  english: S(["M16 5c-5 0-9 3-9 8s4 8 9 8 9-3 9-8-4-8-9-8z", "M16 5v16M7 13h18"]),
  logic:   S(["M16 4l10 6v12l-10 6-10-6V10z", "M16 4v12M16 16l10-6M16 16l-10-6"]),
  memory:  S(["M8 6h16a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z", "M11 12h4M11 16h10M11 20h7"]),
  nature:  S(["M24 6c-9 0-14 4-14 11 0 1.5.3 3 .8 4.3C18 21 25 16 25 6z", "M11 21C14.5 15 19 11.5 24 8.5"]),
  tech:    S(["M6 9h20v14H6z", "M11 15l3 3-3 3M17 21h4M13 4v5M19 4v5"]),
  book:    S(["M16 8C13.5 5.5 9.5 5 5 5v20c4.5 0 8.5.5 11 3 2.5-2.5 6.5-3 11-3V5c-4.5 0-8.5.5-11 3z", "M16 8v20"]),
  other:   S(["M16 5a11 11 0 100 22 11 11 0 000-22z", "M16 11v6M16 21h.01"]),
  // o'yin ikonkalari
  plus:    S(["M9 9h14v14H9z", "M16 12v8M12 16h8"]),
  minus:   S(["M9 9h14v14H9z", "M12 16h8"]),
  palette: S(["M16 6C10 6 6 10 6 15c0 4 3 6 6 6 2 0 2-1 2-2 0-2 2-2 3-2 4 0 6-2 6-5 0-4-4-6-7-6z", "M11 13h.01M20 13h.01M14 19h.01"]),
  animal:  S(["M10 12c-2-4 2-6 3-3M22 12c2-4-2-6-3-3M8 18c0-5 4-8 8-8s8 3 8 8-4 6-8 6-8-1-8-6z", "M13 16h.01M19 16h.01"]),
  science: S(["M13 4h6M14 4v7l-6 12a2 2 0 002 3h12a2 2 0 002-3l-6-12V4", "M11 19h10"]),
  geo:     S(["M16 4a12 12 0 100 24 12 12 0 000-24z", "M4 16h24M16 4c4 4 4 20 0 24M16 4c-4 4-4 20 0 24"]),
  code:    S(["M6 8h20v16H6z", "M12 14l-3 3 3 3M20 14l3 3-3 3M17 13l-2 8"]),
};

// ── Difficulty meta (rang FAQAT tokenlardan — th orqali) ──
export const DIFF = {
  easy:   { key: "easy",   uz: "Oson",     ru: "Легко",    en: "Easy",   tone: "gr" },
  medium: { key: "medium", uz: "O'rta",    ru: "Средне",   en: "Medium", tone: "am" },
  hard:   { key: "hard",   uz: "Qiyin",    ru: "Сложно",   en: "Hard",   tone: "rd" },
};

// ── Achievement darajalari (SVG, emoji emas) ──
export const TIERS = [
  { id: "bronze", uz: "Bronza",  ru: "Бронза",   en: "Bronze",  need: 50,   color: "#cd7f32" },
  { id: "silver", uz: "Kumush",  ru: "Серебро",  en: "Silver",  need: 150,  color: "#9ca3af" },
  { id: "gold",   uz: "Oltin",   ru: "Золото",   en: "Gold",    need: 300,  color: "#f59e0b" },
  { id: "master", uz: "Master",  ru: "Мастер",   en: "Master",  need: 600,  color: "#8b5cf6" },
  { id: "legend", uz: "Afsona",  ru: "Легенда",  en: "Legend",  need: 1200, color: "#06b6d4" },
];
export const tierFor = (coins) => {
  let cur = null, next = TIERS[0];
  for (let i = 0; i < TIERS.length; i++) {
    if (coins >= TIERS[i].need) { cur = TIERS[i]; next = TIERS[i + 1] || null; }
  }
  return { cur, next };
};
// Medal SVG (daraja rangi bilan)
export const medalSvg = (color, s = 22) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="15" r="6" stroke={color} strokeWidth="1.6" fill={color} fillOpacity="0.18" />
    <path d="M12 12.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4L12 12.5z" stroke={color} strokeWidth="1" strokeLinejoin="round" fill={color} fillOpacity="0.4" />
    <path d="M8 3l2 5M16 3l-2 5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// ═══ KATEGORIYALAR ═══════════════════════════════════════════
//  gradient: [tokenKey1, tokenKey2] — th[key] orqali olinadi (hardcoded yo'q)
export const CATEGORIES = [
  { id: "math",      name: { uz: "Matematika", ru: "Математика", en: "Math" },     icon: BIco.math,    grad: ["ac", "ac2"] },
  { id: "english",   name: { uz: "Ingliz tili", ru: "Английский", en: "English" }, icon: BIco.english, grad: ["gr", "ac"] },
  { id: "logic",     name: { uz: "Mantiq", ru: "Логика", en: "Logic" },            icon: BIco.logic,   grad: ["am", "rd"] },
  { id: "memory",    name: { uz: "Xotira", ru: "Память", en: "Memory" },           icon: BIco.memory,  grad: ["ac2", "gr"] },
  { id: "science",   name: { uz: "Fan", ru: "Наука", en: "Science" },              icon: BIco.science, grad: ["gr", "am"] },
  { id: "geography", name: { uz: "Geografiya", ru: "География", en: "Geography" }, icon: BIco.geo,     grad: ["ac", "gr"] },
  { id: "book",      name: { uz: "Kitob", ru: "Книга", en: "Book" },               icon: BIco.book,    grad: ["am", "ac"] },
  { id: "coding",    name: { uz: "Dasturlash", ru: "Программирование", en: "Coding" }, icon: BIco.code, grad: ["ac", "rd"] },
];

// ── SUBJECT REWARDS: har fan bo'yicha coin/XP birligi (bitta to'g'ri javob uchun) ──
//  Coin — MAVJUD umumiy bilim_coins_ hisobiga; XP — yangi bilim_xp_ hisobiga.
//  Barcha o'yin BITTA umumiy Coin va BITTA umumiy XP ga qo'shiladi.
export const SUBJECT_REWARDS = {
  math:      { coin: 2, xp: 3.5 },
  english:   { coin: 1.5, xp: 2.5 },
  logic:     { coin: 1.8, xp: 3 },
  memory:    { coin: 1.2, xp: 2 },
  science:   { coin: 1.8, xp: 3 },
  geography: { coin: 1.6, xp: 2.6 },
  book:      { coin: 1.4, xp: 2.4 },
  coding:    { coin: 2, xp: 4 },
  _default:  { coin: 1.5, xp: 2.5 },
};
export const rewardOf = (catId) => SUBJECT_REWARDS[catId] || SUBJECT_REWARDS._default;
export const catById = (id) => CATEGORIES.find(c => c.id === id);

// ═══ O'YINLAR REGISTRY ══════════════════════════════════════
//  Har o'yin: id="<category>/<slug>", metadata + (ixtiyoriy) load.
//  `load` bo'lsa — "available"; bo'lmasa — "soon".
//  Hozircha faqat ingliz so'z o'yini real; qolganlari keyingi sprintlarda.
export const GAMES = [
  // ── English ──
  {
    id: "english/words",
    category: "english",
    name: { uz: "So'z o'rgan", ru: "Учи слова", en: "Learn words" },
    desc: { uz: "Rasm bo'yicha inglizcha so'zni top", ru: "Найди слово по картинке", en: "Match the word to the picture" },
    icon: BIco.english, difficulty: "easy", minutes: 10, maxCoin: 15, premium: false,
    load: "english/words",   // Hub bu id ni mavjud BilimBozor o'yiniga ulaydi
  },
  // ── Reja qilingan o'yinlar (metadata tayyor; komponent keyin) ──
  { id: "math/addition",    category: "math",  name: { uz: "Qo'shish", ru: "Сложение", en: "Addition" },     desc: { uz: "Sonlarni qo'shishni mashq qil", ru: "Практика сложения", en: "Practice adding numbers" }, icon: BIco.plus,   difficulty: "easy",   minutes: 5,  maxCoin: 10, premium: false, load: "math/addition" },
  { id: "math/subtraction", category: "math",  name: { uz: "Ayirish", ru: "Вычитание", en: "Subtraction" },   desc: { uz: "Ayirishni o'rgan", ru: "Учись вычитать", en: "Learn subtraction" },                     icon: BIco.minus,  difficulty: "easy",   minutes: 5,  maxCoin: 10, premium: false },
  { id: "math/multiply",    category: "math",  name: { uz: "Ko'paytirish", ru: "Умножение", en: "Multiply" }, desc: { uz: "Ko'paytirish jadvali", ru: "Таблица умножения", en: "Times tables" },                   icon: BIco.math,   difficulty: "medium", minutes: 10, maxCoin: 15, premium: false },
  { id: "english/colors",   category: "english", name: { uz: "Ranglar", ru: "Цвета", en: "Colors" },          desc: { uz: "Inglizcha ranglarni o'rgan", ru: "Учи цвета", en: "Learn colors in English" },          icon: BIco.palette,difficulty: "easy",   minutes: 5,  maxCoin: 10, premium: false },
  { id: "english/animals",  category: "english", name: { uz: "Hayvonlar", ru: "Животные", en: "Animals" },    desc: { uz: "Hayvon nomlarini o'rgan", ru: "Названия животных", en: "Learn animal names" },           icon: BIco.animal, difficulty: "easy",   minutes: 5,  maxCoin: 10, premium: false },
  { id: "logic/pattern",    category: "logic", name: { uz: "Naqsh", ru: "Узор", en: "Patterns" },             desc: { uz: "Keyingi shaklni top", ru: "Найди следующую фигуру", en: "Find the next shape" },        icon: BIco.logic,  difficulty: "medium", minutes: 10, maxCoin: 15, premium: false },
  { id: "memory/pairs",     category: "memory",name: { uz: "Juftliklar", ru: "Пары", en: "Pairs" },           desc: { uz: "Bir xil kartalarni top", ru: "Найди одинаковые карты", en: "Match the cards" },          icon: BIco.memory, difficulty: "easy",   minutes: 5,  maxCoin: 10, premium: false },
  { id: "science/biology",   category: "science",name: { uz: "Biologiya", ru: "Биология", en: "Biology" },      desc: { uz: "Tabiat va tirik olam", ru: "Природа и жизнь", en: "Nature and life" },                   icon: BIco.nature, difficulty: "medium", minutes: 10, maxCoin: 15, premium: true },
  { id: "coding/scratch",     category: "coding",  name: { uz: "Scratch asoslari", ru: "Основы Scratch", en: "Scratch basics" }, desc: { uz: "Blokli dasturlashga kirish", ru: "Введение в блочное программирование", en: "Intro to block coding" }, icon: BIco.tech, difficulty: "hard", minutes: 15, maxCoin: 25, premium: true },
  { id: "geography/capitals", category: "geography", name: { uz: "Poytaxtlar", ru: "Столицы", en: "Capitals" }, desc: { uz: "Davlat poytaxtlarini top", ru: "Найди столицы", en: "Find capitals" }, icon: BIco.geo, difficulty: "medium", minutes: 10, maxCoin: 15, premium: false },
  { id: "book/reading",     category: "book",  name: { uz: "Ertak o'qish", ru: "Чтение сказок", en: "Story reading" }, desc: { uz: "Qisqa ertaklarni o'qi", ru: "Читай короткие сказки", en: "Read short stories" }, icon: BIco.book, difficulty: "easy", minutes: 10, maxCoin: 15, premium: false },
];

export const gamesOf = (catId) => GAMES.filter(g => g.category === catId);
export const gameById = (id) => GAMES.find(g => g.id === id);
export const isAvailable = (g) => !!(g && g.load);
export const availableCount = (catId) => gamesOf(catId).filter(isAvailable).length;
export const gameCount = (catId) => gamesOf(catId).length;
