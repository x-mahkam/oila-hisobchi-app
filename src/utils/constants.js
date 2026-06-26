// ═══════════════════════════════════════════════════════════
//  CONSTANTS — barcha konstantalar shu yerda
// ═══════════════════════════════════════════════════════════

export const MK = d => d
  ? { bg:"#090e1c", sur:"#111827", surH:"#192035", bor:"#1e293b", ac:"#6366f1", ac2:"#818cf8", gr:"#10b981", rd:"#ef4444", am:"#f59e0b", t1:"#f1f5f9", t2:"#94a3b8", dark:true }
  : { bg:"#eef2ff", sur:"#ffffff", surH:"#f5f7ff", bor:"#e2e8f0", ac:"#6366f1", ac2:"#4f46e5", gr:"#059669", rd:"#dc2626", am:"#d97706", t1:"#0f172a", t2:"#64748b", dark:false };

export const KATS = [
  {id:"oziq",     c:"#10b981"},
  {id:"transport",c:"#3b82f6"},
  {id:"kiyim",    c:"#8b5cf6"},
  {id:"sog",      c:"#ef4444"},
  {id:"kommunal", c:"#f59e0b"},
  {id:"konil",    c:"#ec4899"},
  {id:"talim",    c:"#06b6d4"},
  {id:"hadya",    c:"#f43f5e"},
  {id:"boshqa",   c:"#64748b"},
];

export const KN = {
  uz: ["Oziq-ovqat","Transport","Kiyim","Sog'liq","Kommunal","Ko'ngil ochar","Ta'lim","Hadya","Boshqa"],
  ru: ["Продукты","Транспорт","Одежда","Здоровье","Коммунальные","Развлечения","Образование","Подарок","Другое"],
  en: ["Food","Transport","Clothing","Health","Utilities","Entertainment","Education","Gift","Other"],
};

export const DARS = [
  {id:"oylik",    c:"#10b981"},
  {id:"qoshimcha",c:"#f59e0b"},
  {id:"biznes",   c:"#3b82f6"},
  {id:"sovga",    c:"#8b5cf6"},
  {id:"boshqa",   c:"#64748b"},
];

export const DN = {
  uz: ["Oylik maosh","Qo'shimcha","Biznes","Sovg'a","Boshqa"],
  ru: ["Зарплата","Доп.доход","Бизнес","Подарок","Другое"],
  en: ["Salary","Additional","Business","Gift","Other"],
};

export const VALS = [
  {id:"uzs",b:"so'm",k:1},
  {id:"usd",b:"$",k:12800},
  {id:"rub",b:"₽",k:140},
  {id:"eur",b:"€",k:13900},
  {id:"kzt",b:"₸",k:26},
  {id:"kgs",b:"сом",k:145},
  {id:"tjs",b:"сомони",k:1180},
  {id:"try",b:"₺",k:380},
  {id:"gbp",b:"£",k:16200},
  {id:"aed",b:"د.إ",k:3485},
];

export const COUNTRIES = [
  {code:"uz",dial:"+998",flag:"🇺🇿",uz:"O'zbekiston",ru:"Узбекистан",en:"Uzbekistan",val:"uzs"},
  {code:"ru",dial:"+7",flag:"🇷🇺",uz:"Rossiya",ru:"Россия",en:"Russia",val:"rub"},
  {code:"kz",dial:"+7",flag:"🇰🇿",uz:"Qozog'iston",ru:"Казахстан",en:"Kazakhstan",val:"kzt"},
  {code:"kg",dial:"+996",flag:"🇰🇬",uz:"Qirg'iziston",ru:"Кыргызстан",en:"Kyrgyzstan",val:"kgs"},
  {code:"tj",dial:"+992",flag:"🇹🇯",uz:"Tojikiston",ru:"Таджикистан",en:"Tajikistan",val:"tjs"},
  {code:"tr",dial:"+90",flag:"🇹🇷",uz:"Turkiya",ru:"Турция",en:"Turkey",val:"try"},
  {code:"us",dial:"+1",flag:"🇺🇸",uz:"AQSH",ru:"США",en:"USA",val:"usd"},
  {code:"ae",dial:"+971",flag:"🇦🇪",uz:"BAA (Dubay)",ru:"ОАЭ",en:"UAE",val:"aed"},
  {code:"gb",dial:"+44",flag:"🇬🇧",uz:"Buyuk Britaniya",ru:"Великобритания",en:"UK",val:"gbp"},
  {code:"eu",dial:"+",flag:"🇪🇺",uz:"Yevropa",ru:"Европа",en:"Europe",val:"eur"},
];

export const QUICK_ADD = [
  {emoji:"🍔",kat:"oziq",    uz:"Ovqat",    ru:"Еда",        en:"Food"},
  {emoji:"🚕",kat:"transport",uz:"Transport",ru:"Транспорт",  en:"Transport"},
  {emoji:"☕",kat:"oziq",    uz:"Kofe",     ru:"Кофе",       en:"Coffee"},
  {emoji:"🛒",kat:"oziq",    uz:"Bozor",    ru:"Продукты",   en:"Groceries"},
  {emoji:"⛽",kat:"transport",uz:"Benzin",   ru:"Бензин",     en:"Fuel"},
  {emoji:"💊",kat:"sog",     uz:"Dorixona", ru:"Аптека",     en:"Pharmacy"},
];

export const VAZIFA_PRESETS = [
  {emoji:"🧹",uz:"Xonani yig'ishtirish",ru:"Убрать комнату",    en:"Clean room",          reward:20000},
  {emoji:"📚",uz:"Kitob o'qish",         ru:"Читать книгу",      en:"Read a book",         reward:15000},
  {emoji:"🛏️",uz:"To'shakni yig'ish",   ru:"Заправить кровать", en:"Make the bed",        reward:5000},
  {emoji:"🍽️",uz:"Idishlarni yuvish",   ru:"Помыть посуду",     en:"Wash dishes",         reward:10000},
  {emoji:"🦷",uz:"Tish yuvish",          ru:"Почистить зубы",    en:"Brush teeth",         reward:3000},
  {emoji:"🕌",uz:"Namoz o'qish",         ru:"Совершить намаз",   en:"Pray",                reward:10000},
  {emoji:"🎓",uz:"Dars tayyorlash",      ru:"Сделать уроки",     en:"Do homework",         reward:25000},
  {emoji:"🏃",uz:"Mashq qilish",         ru:"Зарядка",           en:"Exercise",            reward:8000},
  {emoji:"🌱",uz:"Gullarni sug'orish",   ru:"Полить цветы",      en:"Water plants",        reward:5000},
  {emoji:"🐕",uz:"Hayvonga qarash",      ru:"Покормить питомца", en:"Feed pet",            reward:7000},
  {emoji:"🗑️",uz:"Axlatni chiqarish",   ru:"Вынести мусор",     en:"Take out trash",      reward:5000},
  {emoji:"📖",uz:"Ingliz tili so'z yodlash",ru:"Учить англ. слова",en:"Learn English words",reward:20000},
];

export const GOAL_PRESETS = [
  {emoji:"🏠",uz:"Uy xarid qilish",    ru:"Покупка дома",     en:"Buy a house",    rang:"#10b981"},
  {emoji:"🚗",uz:"Mashina xarid qilish",ru:"Покупка машины",  en:"Buy a car",      rang:"#3b82f6"},
  {emoji:"✈️",uz:"Sayohat",            ru:"Путешествие",       en:"Travel",         rang:"#f59e0b"},
  {emoji:"🕋",uz:"Umra ziyorati",       ru:"Умра",             en:"Umrah",          rang:"#8b5cf6"},
  {emoji:"🕌",uz:"Haj amallari",        ru:"Хадж",             en:"Hajj",           rang:"#06b6d4"},
  {emoji:"💍",uz:"To'y marosimi",       ru:"Свадьба",          en:"Wedding",        rang:"#ec4899"},
  {emoji:"📱",uz:"Telefon / Texnika",   ru:"Телефон",          en:"Phone / Gadget", rang:"#6366f1"},
  {emoji:"🎓",uz:"Ta'lim / O'qish",    ru:"Образование",       en:"Education",      rang:"#ef4444"},
  {emoji:"🏥",uz:"Favqulodda jamg'arma",ru:"Резерв",           en:"Emergency",      rang:"#14b8a6"},
  {emoji:"💼",uz:"Biznes boshlash",     ru:"Бизнес",           en:"Business",       rang:"#f97316"},
];

export const KID_GOAL_PRESETS = [
  {emoji:"🚲",uz:"Velosiped",               ru:"Велосипед",             en:"Bicycle",     rang:"#10b981"},
  {emoji:"📱",uz:"Telefon",                 ru:"Телефон",               en:"Phone",       rang:"#6366f1"},
  {emoji:"🎮",uz:"O'yin pristavka",         ru:"Игровая приставка",     en:"Game console",rang:"#8b5cf6"},
  {emoji:"🧸",uz:"O'yinchoq",              ru:"Игрушка",               en:"Toy",         rang:"#ec4899"},
  {emoji:"⚽",uz:"Futbol to'pi",           ru:"Мяч",                   en:"Football",    rang:"#f59e0b"},
  {emoji:"📚",uz:"Kitoblar",               ru:"Книги",                 en:"Books",       rang:"#ef4444"},
  {emoji:"🎨",uz:"Rasm chizish to'plami", ru:"Набор для рисования",   en:"Art set",     rang:"#06b6d4"},
  {emoji:"🛴",uz:"Samokat",               ru:"Самокат",               en:"Scooter",     rang:"#14b8a6"},
  {emoji:"🎧",uz:"Naushnik",              ru:"Наушники",              en:"Headphones",  rang:"#a855f7"},
  {emoji:"👟",uz:"Krossovka",             ru:"Кроссовки",             en:"Sneakers",    rang:"#f97316"},
  {emoji:"🎂",uz:"Tug'ilgan kun",         ru:"День рождения",         en:"Birthday",    rang:"#ec4899"},
  {emoji:"💰",uz:"Jamg'arma",             ru:"Накопления",            en:"Savings",     rang:"#10b981"},
];

export const ONB_SLIDES = [
  {emoji:"👨‍👩‍👧‍👦",titleUz:"Oilaviy byudjet",titleRu:"Семейный бюджет",titleEn:"Family budget",
   descUz:"Butun oila daromad va xarajatlarini bir joyda kuzating.",
   descRu:"Отслеживайте доходы и расходы всей семьи.",
   descEn:"Track your whole family's income and expenses in one place.",color:"#6366f1"},
  {emoji:"🎯",titleUz:"Maqsadlarga erishing",titleRu:"Достигайте целей",titleEn:"Reach your goals",
   descUz:"Uy, mashina, sayohat yoki umra uchun jamg'aring.",
   descRu:"Копите на дом, машину или путешествие.",
   descEn:"Save for a house, car, travel or Umrah.",color:"#10b981"},
  {emoji:"🤝",titleUz:"Qarzlarni boshqaring",titleRu:"Управляйте долгами",titleEn:"Manage debts",
   descUz:"Kimga qancha qarzingiz borligini unutmang.",
   descRu:"Не забывайте о долгах. Подтверждение обеих сторон.",
   descEn:"Never forget who owes what. Two-way confirmation.",color:"#f59e0b"},
  {emoji:"🎁",titleUz:"Do'stlarni taklif qiling",titleRu:"Приглашайте друзей",titleEn:"Invite friends",
   descUz:"3 ta do'stingizni taklif qiling va 1 oy Premium bepul oling!",
   descRu:"Пригласите 3 друзей и получите 1 месяц Premium бесплатно!",
   descEn:"Invite 3 friends and get 1 month Premium free!",color:"#ec4899"},
];
