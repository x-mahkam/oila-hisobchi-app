// ═══════════════════════════════════════════════════════════
//  BILIM BOZORI — GAME REGISTRY (Sprint: platforma arxitekturasi)
//  Yangi o'yin qo'shish = shu faylga BITTA yozuv qo'shish.
//  Firebase/coin/permission O'ZGARMAYDI — bu faqat metama'lumot.
//  Har o'yin: { id: "<category>/<game>", ... , load: () => Component }
//  `load` bo'lsa — "tez orada" (soon) holatida ko'rinadi.
// ═══════════════════════════════════════════════════════════

// ── Kichik outline SVG'lar (emoji o'rniga) ──
const S = (paths, extra) => (c, s = 26) => (
  <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
    {paths.map((d, i) => <path key={i} d={d} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={c} fillOpacity={i === 0 ? 0.14 : 0} />)}
    {extra}
  </svg>
);
export const BIco = {
  finance: S(["M10 16a6 6 0 1012 0 6 6 0 00-12 0z", "M16 8V6M16 26v-2M12 11a4 4 0 018 0c0 2-4 2-4 4v1"]),
  math:    S(["M6 6h20v20H6z", "M11 11h10M11 16h10M11 21h6"]),
  english: S(["M16 5c-5 0-9 3-9 8s4 8 9 8 9-3 9-8-4-8-9-8z", "M16 5v16M7 13h18"]),
  logic:   S(["M16 4l10 6v12l-10 6-10-6V10z", "M16 4v12M16 16l10-6M16 16l-10-6"]),
  memory:  S(["M8 6h16a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z", "M11 12h4M11 16h10M11 20h7"]),
  other:   S(["M16 5a11 11 0 100 22 11 11 0 000-22z", "M16 11v6M16 21h.01"]),
  // o'yin ikonkalari
  plus:    S(["M9 9h14v14H9z", "M16 12v8M12 16h8"]),
  minus:   S(["M9 9h14v14H9z", "M12 16h8"]),
  multiply: S(["M9 9h14v14H9z", "M13 13l6 6M19 13l-6 6"]),
  divide:   S(["M9 9h14v14H9z", "M12 16h8", "M16 12h.01M16 20h.01"]),
  palette: S(["M16 6C10 6 6 10 6 15c0 4 3 6 6 6 2 0 2-1 2-2 0-2 2-2 3-2 4 0 6-2 6-5 0-4-4-6-7-6z", "M11 13h.01M20 13h.01M14 19h.01"]),
  animal:  S(["M10 12c-2-4 2-6 3-3M22 12c2-4-2-6-3-3M8 18c0-5 4-8 8-8s8 3 8 8-4 6-8 6-8-1-8-6z", "M13 16h.01M19 16h.01"]),
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
  { id: "finance",   name: { uz: "Moliyaviy savodxonlik", ru: "Финансовая грамотность", en: "Financial Literacy" }, icon: BIco.finance, grad: ["am", "ac"] },
  { id: "math",      name: { uz: "Matematika", ru: "Математика", en: "Math" },     icon: BIco.math,    grad: ["ac", "ac2"] },
  { id: "english",   name: { uz: "Ingliz tili", ru: "Английский", en: "English" }, icon: BIco.english, grad: ["gr", "ac"] },
  { id: "logic",     name: { uz: "Mantiq", ru: "Логика", en: "Logic" },            icon: BIco.logic,   grad: ["am", "rd"] },
  { id: "memory",    name: { uz: "Xotira", ru: "Память", en: "Memory" },           icon: BIco.memory,  grad: ["ac2", "gr"] },
];

// ── SUBJECT REWARDS: har fan bo'yicha coin/XP birligi (bitta to'g'ri javob uchun) ──
//  Coin — MAVJUD umumiy bilim_coins_ hisobiga; XP — yangi bilim_xp_ hisobiga.
//  Barcha o'yin BITTA umumiy Coin va BITTA umumiy XP ga qo'shiladi.
export const SUBJECT_REWARDS = {
  finance:   { coin: 2.2, xp: 4 },
  math:      { coin: 2, xp: 3.5 },
  english:   { coin: 1.5, xp: 2.5 },
  logic:     { coin: 1.8, xp: 3 },
  memory:    { coin: 1.2, xp: 2 },
  _default:  { coin: 1.5, xp: 2.5 },
};
export const rewardOf = (catId) => SUBJECT_REWARDS[catId] || SUBJECT_REWARDS._default;
export const catById = (id) => CATEGORIES.find(c => c.id === id);

// ═══ O'YINLAR REGISTRY ══════════════════════════════════════
//  Har o'yin: id="<category>/<slug>", metadata + (ixtiyoriy) load.
//  `load` bo'lsa — "available"; bo'lmasa — "soon".
export const GAMES = [
  // ── Finance (Moliyaviy savodxonlik) ──
  {
    id: "finance/needs-wants",
    category: "finance",
    name: { uz: "Kerak yoki Xohish?", ru: "Потребность или Желание?", en: "Need or Want?" },
    desc: { uz: "Har narsani to'g'ri toifaga ajrat", ru: "Раздели вещи на правильные категории", en: "Sort items into the correct category" },
    icon: BIco.finance, difficulty: "easy", minutes: 5, maxCoin: 10, premium: false, load: "finance/needs-wants"
  },
  {
    id: "finance/budget",
    category: "finance",
    name: { uz: "Haftalik byudjet", ru: "Еженедельный бюджет", en: "Weekly budget" },
    desc: { uz: "Pulni toifalarga to'g'ri taqsimla", ru: "Правильно распредели деньги по категориям", en: "Allocate money across categories" },
    icon: BIco.finance, difficulty: "medium", minutes: 8, maxCoin: 15, premium: false, load: "finance/budget"
  },
  {
    id: "finance/price-compare",
    category: "finance",
    name: { uz: "Arzonini top", ru: "Найди дешевле", en: "Compare Prices" },
    desc: { uz: "Mahsulotlarning birlik narxini solishtirib, eng arzonini top", ru: "Сравни цену за единицу и найди самое выгодное", en: "Compare unit prices to find the best deal" },
    icon: BIco.finance, difficulty: "medium", minutes: 7, maxCoin: 12, premium: false, load: "finance/price-compare"
  },
  {
    id: "finance/bank-sim",
    category: "finance",
    name: { uz: "Bank Simulyatori", ru: "Симулятор Банка", en: "Bank Simulator" },
    desc: { uz: "Kredit va omonat tushunchalarini o'rganing", ru: "Изучите кредиты и депозиты", en: "Learn credit and deposit concepts" },
    icon: BIco.finance, difficulty: "medium", minutes: 10, maxCoin: 20, premium: false, load: "finance/bank-sim"
  },
  {
    id: "english/words",
    category: "english",
    name: { uz: "So'z o'rgan", ru: "Учи слова", en: "Learn words" },
    desc: { uz: "Rasm bo'yicha inglizcha so'zni top", ru: "Найди слово по картинке", en: "Match the word to the picture" },
    icon: BIco.english, difficulty: "easy", minutes: 10, maxCoin: 15, premium: false,
    load: "english/words",
  },
  {
    id: "english/money-words",
    category: "english",
    name: { uz: "Pul lug'ati", ru: "Словарь денег", en: "Money Words" },
    desc: { uz: "Pulga oid inglizcha so'zlarni o'rgan", ru: "Английские слова о деньгах", en: "Learn money-related vocabulary" },
    icon: BIco.english, difficulty: "easy", minutes: 8, maxCoin: 12, premium: false,
    load: "english/money-words"
  },
  // ── Reja qilingan o'yinlar (metadata tayyor; komponent keyin) ──
  { id: "math/addition",    category: "math",  name: { uz: "Qo'shish", ru: "Сложение", en: "Addition" },     desc: { uz: "Sonlarni qo'shishni mashq qil", ru: "Практика сложения", en: "Practice adding numbers" }, icon: BIco.plus,   difficulty: "easy",   minutes: 5,  maxCoin: 10, premium: false, load: "math/addition" },
  { id: "math/subtraction", category: "math",  name: { uz: "Ayirish", ru: "Вычитание", en: "Subtraction" },   desc: { uz: "Ayirishni o'rgan", ru: "Учись вычитать", en: "Learn subtraction" },                     icon: BIco.minus,  difficulty: "easy",   minutes: 5,  maxCoin: 10, premium: false, load: "math/subtraction" },
  { id: "math/multiply",    category: "math",  name: { uz: "Ko'paytirish", ru: "Умножение", en: "Multiply" }, desc: { uz: "Ko'paytirish jadvali", ru: "Таблица умножения", en: "Times tables" },                   icon: BIco.multiply,difficulty: "medium", minutes: 10, maxCoin: 15, premium: false, load: "math/multiply" },
  { id: "math/division",    category: "math",  name: { uz: "Bo'lish", ru: "Деление", en: "Division" },        desc: { uz: "Bo'lishni o'rganing", ru: "Учитесь делению", en: "Learn division" },                    icon: BIco.divide,  difficulty: "medium", minutes: 10, maxCoin: 15, premium: false, load: "math/division" },
  { id: "english/colors",   category: "english", name: { uz: "Ranglar", ru: "Цвета", en: "Colors" },          desc: { uz: "Inglizcha ranglarni o'rgan", ru: "Уchi tsvetlar", en: "Learn colors in English" },       icon: BIco.palette,difficulty: "easy",   minutes: 5,  maxCoin: 10, premium: false },
  { id: "english/animals",  category: "english", name: { uz: "Hayvonlar", ru: "Животные", en: "Animals" },    desc: { uz: "Hayvon nomlarini o'rgan", ru: "Названия животных", en: "Learn animal names" },           icon: BIco.animal, difficulty: "easy",   minutes: 5,  maxCoin: 10, premium: false },
  {
    id: "logic/pattern",
    category: "logic",
    name: { uz: "Jamg'arma ketma-ketligi", ru: "Последовательность накоплений", en: "Savings Sequence" },
    desc: { uz: "Jamg'arma o'sish qonuniyatlarini top", ru: "Найди закономерность роста сбережений", en: "Find pattern of savings growth" },
    icon: BIco.finance, difficulty: "medium", minutes: 7, maxCoin: 12, premium: false, load: "logic/pattern"
  },
  {
    id: "logic/pattern-shapes",
    category: "logic",
    name: { uz: "Naqsh davomi", ru: "Продолжи узор", en: "Pattern Continuation" },
    desc: { uz: "Shakllar va piktogrammalar takrorlanishi qonuniyatini top", ru: "Найди закономерность повторения фигур", en: "Find the pattern of shapes and icons repetition" },
    icon: BIco.logic, difficulty: "medium", minutes: 5, maxCoin: 12, premium: false, load: "logic/pattern-shapes"
  },
  {
    id: "logic/odd-one-out",
    category: "logic",
    name: { uz: "Toq narsani top", ru: "Найди лишнее", en: "Odd One Out" },
    desc: { uz: "Guruhdagi toq yoki noto'g'ri xususiyatga ega narsani top", ru: "Найди лишний или отличающийся предмет в группе", en: "Find the odd or different item in the group" },
    icon: BIco.logic, difficulty: "medium", minutes: 6, maxCoin: 12, premium: false, load: "logic/odd-one-out"
  },
  {
    id: "logic/decision",
    category: "logic",
    name: { uz: "Qaror qabul qilish", ru: "Принятие решений", en: "Decision Making" },
    desc: { uz: "To'g'ri va aqlli moliyaviy qarorlar qabul qilishni o'rgan", ru: "Учись принимать правильные финансовые решения", en: "Learn to make smart financial decisions" },
    icon: BIco.logic, difficulty: "medium", minutes: 8, maxCoin: 15, premium: false, load: "logic/decision"
  },
  {
    id: "memory/pairs",
    category: "memory",
    name: { uz: "Narx xotirasi", ru: "Память цен", en: "Price memory" },
    desc: { uz: "Mahsulot va narxini juftlashtir", ru: "Сопоставь товар и цену", en: "Match products to their prices" },
    icon: BIco.memory, difficulty: "easy", minutes: 6, maxCoin: 12,
    premium: false, load: "memory/pairs"
  },
  {
    id: "memory/simon",
    category: "memory",
    name: { uz: "Ketma-ketlikni takrorlash", ru: "Повтори последовательность", en: "Simon Sequence" },
    desc: { uz: "Yonib-o'chadigan ranglar ketma-ketligini takrorla va xotirani rivojlantir", ru: "Повторяй вспышки цвета и тренируй память", en: "Repeat the sequence of light flashes to train your memory" },
    icon: BIco.memory, difficulty: "medium", minutes: 5, maxCoin: 15, premium: false, load: "memory/simon"
  }
];

export const gamesOf = (catId) => GAMES.filter(g => g.category === catId);
export const gameById = (id) => GAMES.find(g => g.id === id);
export const isAvailable = (g) => !!(g && g.load);
export const availableCount = (catId) => gamesOf(catId).filter(isAvailable).length;
export const gameCount = (catId) => gamesOf(catId).length;
