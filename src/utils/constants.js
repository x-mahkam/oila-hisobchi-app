// ═══════════════════════════════════════════════════════════
//  CONSTANTS — barcha konstantalar shu yerda
// ═══════════════════════════════════════════════════════════

import { PALETTE, PREMIUM, CHART, GARDEN } from "./tokens.js";

// Theme obyekti endi tokens.js'dan quriladi.
// Bazaviy kalitlar (bg, sur, ac, ...) qiymatlari o'zgarmagan — vizual 0 farq.
// Yangi additiv kalitlar: gold, goldGrad, chart, garden.
export const MK = d => ({
  ...(d ? PALETTE.dark : PALETTE.light),
  gold: PREMIUM.gold,
  goldGrad: PREMIUM.grad,
  chart: CHART,
  garden: GARDEN,
});

export const KATS = [
  {id:"oziq",     c:"#10b981"},
  {id:"transport",c:"#3b82f6"},
  {id:"kiyim",    c:"#8b5cf6"},
  {id:"sog",      c:"#ef4444"},
  {id:"kommunal", c:"#f59e0b"},
  {id:"konil",    c:"#ec4899"},
  {id:"talim",    c:"#06b6d4"},
  {id:"hadya",    c:"#f43f5e"},
  {id:"boshqa",   c:"#94A3B8"},
];

export const KN = {
  uz: ["Oziq-ovqat","Transport","Kiyim","Sog'liq","Kommunal","Ko'ngil ochar","Ta'lim","Hadya","Boshqa"],
  ru: ["Продукты","Транспорт","Одежда","Здоровье","Коммунальные","Развлечения","Образование","Подарок","Другое"],
  en: ["Food","Transport","Clothing","Health","Utilities","Entertainment","Education","Gift","Other"],
  kk: ["Азық-түлік","Көлік","Киім","Денсаулық","Коммуналдық","Ойын-сауық","Білім","Сыйлық","Басқа"],
  ky: ["Азық-түлүк","Транспорт","Кийим","Ден соолук","Коммуналдык","Көңүл ачуу","Билим","Белек","Башка"],
  tg: ["Хӯрокворӣ","Нақлиёт","Либос","Тандурустӣ","Коммуналӣ","Дилхушӣ","Таҳсилот","Туҳфа","Дигар"],
  qr: ["Aziq-awqat","Transport","Kiyim","Densawliq","Kommunal","Kewil-ashar","Bilim","Sawg'a","Basqa"],
};

export const DARS = [
  {id:"oylik",    c:"#10b981"},
  {id:"qoshimcha",c:"#f59e0b"},
  {id:"biznes",   c:"#3b82f6"},
  {id:"sovga",    c:"#8b5cf6"},
  {id:"boshqa",   c:"#94A3B8"},
];

export const DN = {
  uz: ["Oylik maosh","Qo'shimcha","Biznes","Sovg'a","Boshqa"],
  ru: ["Зарплата","Доп.доход","Бизнес","Подарок","Другое"],
  en: ["Salary","Additional","Business","Gift","Other"],
  kk: ["Жалақы","Қосымша табыс","Бизнес","Сыйлық","Басқа"],
  ky: ["Айлык акы","Кошумча киреше","Бизнес","Белек","Башка"],
  tg: ["Маош","Даромади иловагӣ","Бизнес","Туҳфа","Дигар"],
  qr: ["Ayliq miynet","Qosimsha tabil","Biznes","Sawg'a","Basqa"],
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
  {id:"ovqat",    emoji:"🍔",kat:"oziq",    uz:"Ovqat",    ru:"Еда",        en:"Food", kk:"Тамақ", ky:"Тамак", tg:"Хӯрок", qr:"Awqat"},
  {id:"taxi",     emoji:"🚕",kat:"transport",uz:"Transport",ru:"Транспорт",  en:"Transport", kk:"Көлік", ky:"Транспорт", tg:"Нақлиёт", qr:"Transport"},
  {id:"kofe",     emoji:"☕",kat:"oziq",    uz:"Kofe",     ru:"Кофе",       en:"Coffee", kk:"Кофе", ky:"Кофе", tg:"Кофе", qr:"Kofe"},
  {id:"bozor",    emoji:"🛒",kat:"oziq",    uz:"Bozor",    ru:"Продукты",   en:"Groceries", kk:"Азық-түлік", ky:"Азык-түлүк", tg:"Бозор", qr:"Bozor"},
  {id:"benzin",   emoji:"⛽",kat:"transport",uz:"Benzin",   ru:"Бензин",     en:"Fuel", kk:"Жанармай", ky:"Бензин", tg:"Бензин", qr:"Benzin"},
  {id:"dorixona", emoji:"💊",kat:"sog",     uz:"Dorixona", ru:"Аптека",     en:"Pharmacy", kk:"Дәріхана", ky:"Дарыкана", tg:"Дорухона", qr:"Da'rixana"},
];

export const VAZIFA_PRESETS = [
  {emoji:"🧹",uz:"Xonani yig'ishtirish",ru:"Убрать комнату",    en:"Clean room", kk:"Бөлмені жинау", ky:"Бөлмөнү жыйноо", tg:"Рӯбучини хона", qr:"Xonani jiyishtiriw", reward:20000},
  {emoji:"📚",uz:"Kitob o'qish",         ru:"Читать книгу",      en:"Read a book", kk:"Кітап оқу", ky:"Китеп окуу", tg:"Китобхонӣ", qr:"Kitap oqiwi", reward:15000},
  {emoji:"🛏️",uz:"To'shakni yig'ish",   ru:"Заправить кровать", en:"Make the bed", kk:"Төсекті жинау", ky:"Төшөктү жыйноо", tg:"Ҷамъ кардани бистар", qr:"To'sekti jiyishtiriw", reward:5000},
  {emoji:"🍽️",uz:"Idishlarni yuvish",   ru:"Помыть посуду",     en:"Wash dishes", kk:"Ыдыс жуу", ky:"Идиш жуу", tg:"Шустани косаву табақ", qr:"Idislardi juwiw", reward:10000},
  {emoji:"🦷",uz:"Tish yuvish",          ru:"Почистить зубы",    en:"Brush teeth", kk:"Тіс тазалау", ky:"Тишти тазалоо", tg:"Шустани дандон", qr:"Tislerdi juwiw", reward:3000},
  {emoji:"🕌",uz:"Namoz o'qish",         ru:"Совершить намаз",   en:"Pray", kk:"Намаз оқу", ky:"Намаз окуу", tg:"Намоз хондан", qr:"Namaz oqiw", reward:10000},
  {emoji:"🎓",uz:"Dars tayyorlash",      ru:"Сделать уроки",     en:"Do homework", kk:"Үй тапсырмасын орындау", ky:"Үй тапшырмасын аткаруу", tg:"Иҷрои вазифаи хонагӣ", qr:"Sabaq tayarlaw", reward:25000},
  {emoji:"🏃",uz:"Mashq qilish",         ru:"Зарядка",           en:"Exercise", kk:"Шынығу жасау", ky:"Дене тарбия жасаоо", tg:"Варзиш кардан", qr:"Shinig'iw jasaw", reward:8000},
  {emoji:"🌱",uz:"Gullarni sug'orish",   ru:"Полить цветы",      en:"Water plants", kk:"Гүлдерді суару", ky:"Гүлдөрдү сугаруу", tg:"Обёрии гулҳо", qr:"Gu'llerdi sug'ariw", reward:5000},
  {emoji:"🐕",uz:"Hayvonga qarash",      ru:"Покормить питомца", en:"Feed pet", kk:"Үй жануарына қарау", ky:"Үй жаныбарын багуу", tg:"Хӯрондани ҳайвони хонагӣ", qr:"Haywang'a qaraw", reward:7000},
  {emoji:"🗑️",uz:"Axlatni chiqarish",   ru:"Вынести мусор",     en:"Take out trash", kk:"Қоқыс шығару", ky:"Таштандыны чыгаруу", tg:"Партовро партофтан", qr:"Axlatti shig'ariw", reward:5000},
  {emoji:"📖",uz:"Ingliz tili so'z yodlash",ru:"Учить англ. слова",en:"Learn English words", kk:"Ағылшын сөздерін жаттау", ky:"Англис сөздөрүн жаттоо", tg:"Ёд гирифтани калимаҳои англисӣ", qr:"Anglis tili so'zlerin yadlaw", reward:20000},
];

export const GOAL_PRESETS = [
  {emoji:"🏠",uz:"Uy xarid qilish",    ru:"Покупка дома",     en:"Buy a house", kk:"Үй сатып алу", ky:"Үй сатып алуу", tg:"Харидани хона", qr:"Uy satip aliw", rang:"#10b981"},
  {emoji:"🚗",uz:"Mashina xarid qilish",ru:"Покупка машины",  en:"Buy a car", kk:"Көлік сатып алу", ky:"Унаа сатып алуу", tg:"Харидани мошин", qr:"Mashina satip aliw", rang:"#3b82f6"},
  {emoji:"✈️",uz:"Sayohat",            ru:"Путешествие",       en:"Travel", kk:"Саяхат", ky:"Саякат", tg:"Саёҳат", qr:"Sayohat", rang:"#f59e0b"},
  {emoji:"🕋",uz:"Umra ziyorati",       ru:"Умра",             en:"Umrah", kk:"Ұмра сапары", ky:"Умра зыяраты", tg:"Зиёрати Умра", qr:"Umra ziyorati", rang:"#8b5cf6"},
  {emoji:"🕌",uz:"Haj amallari",        ru:"Хадж",             en:"Hajj", kk:"Қажылық сапары", ky:"Ажылык", tg:"Ҳаҷ", qr:"Haj amallari", rang:"#06b6d4"},
  {emoji:"💍",uz:"To'y marosimi",       ru:"Свадьба",          en:"Wedding", kk:"Үйлену тойы", ky:"Үйлөнүү тою", tg:"Тӯй", qr:"Toy saltanati", rang:"#ec4899"},
  {emoji:"📱",uz:"Telefon / Texnika",   ru:"Телефон",          en:"Phone / Gadget", kk:"Телефон / Техника", ky:"Телефон / Техника", tg:"Телефон / Техника", qr:"Telefon / Texnika", rang:"#6366f1"},
  {emoji:"🎓",uz:"Ta'lim / O'qish",    ru:"Образование",       en:"Education", kk:"Білім алу / Оқу", ky:"Билим алуу / Окуу", tg:"Таҳсилот / Хониш", qr:"Bilim / Oqiwi", rang:"#ef4444"},
  {emoji:"🏥",uz:"Favqulodda jamg'arma",ru:"Резерв",           en:"Emergency", kk:"Төтенше жағдай қоры", ky:"Күтүлбөгөн чыгымдар", tg:"Фонди фавқулодда", qr:"Qawipli jag'day qori", rang:"#14b8a6"},
  {emoji:"💼",uz:"Biznes boshlash",     ru:"Бизнес",           en:"Business", kk:"Бизнес бастау", ky:"Бизнес баштоо", tg:"Оғози бизнес", qr:"Biznes baslaw", rang:"#f97316"},
  {emoji:"💻",uz:"Kompyuter / Noutbuk", ru:"Компьютер",       en:"Computer", kk:"Компьютер / Ноутбук", ky:"Компьютер / Ноутбук", tg:"Компютер / Ноутбук", qr:"Kompyuter / Noutbuk", rang:"#0ea5e9"},
  {emoji:"🛠️",uz:"Uy ta'miri",         ru:"Ремонт",           en:"Home repair", kk:"Үй жөндеу", ky:"Үй ремонттоо", tg:"Таъмири хона", qr:"Uy t'amiri", rang:"#84cc16"},
  {emoji:"💎",uz:"Tilla taqinchoq",     ru:"Украшения",       en:"Jewelry", kk:"Алтын бұйымдар", ky:"Алтын жасалгалар", tg:"Ҷавоҳироти тиллоӣ", qr:"Tilla taqinshaq", rang:"#eab308"},
  {emoji:"🐑",uz:"Qurbonlik",           ru:"Курбан",           en:"Qurbani", kk:"Құрбандық шалу", ky:"Курмандык", tg:"Қурбонӣ", qr:"Qurbanlik", rang:"#a855f7"},
  {emoji:"🏍️",uz:"Mototsikl",          ru:"Мотоцикл",       en:"Motorcycle", kk:"Мотоцикл", ky:"Мотоцикл", tg:"Мотосикл", qr:"Mototsikl", rang:"#f43f5e"},
  {emoji:"🎉",uz:"Bayram / Marosim",    ru:"Праздник",         en:"Celebration", kk:"Мереке / Шара", ky:"Майрам / Салтанат", tg:"Ҷашнвора", qr:"Bayram / Saltanat", rang:"#22c55e"},
];

export const KID_GOAL_PRESETS = [
  {emoji:"🚲",uz:"Velosiped",               ru:"Велосипед",             en:"Bicycle", kk:"Велосипед", ky:"Велосипед", tg:"Дучарха", qr:"Velosiped", rang:"#10b981"},
  {emoji:"📱",uz:"Telefon",                 ru:"Телефон",               en:"Phone", kk:"Телефон", ky:"Телефон", tg:"Телефон", qr:"Telefon", rang:"#6366f1"},
  {emoji:"🎮",uz:"O'yin pristavka",         ru:"Игровая приставка",     en:"Game console", kk:"Ойын приставкасы", ky:"Оюн приставкасы", tg:"Приставкаи бозӣ", qr:"Oyin pristavkasi", rang:"#8b5cf6"},
  {emoji:"🧸",uz:"O'yinchoq",              ru:"Игрушка",               en:"Toy", kk:"Ойыншық", ky:"Оюнчук", tg:"Бозича", qr:"Oyinshaq", rang:"#ec4899"},
  {emoji:"⚽",uz:"Futbol to'pi",           ru:"Мяч",                   en:"Football", kk:"Футбол добы", ky:"Футбол тобу", tg:"Тӯби футбол", qr:"Futbol topi", rang:"#f59e0b"},
  {emoji:"📚",uz:"Kitoblar",               ru:"Книги",                 en:"Books", kk:"Кітаптар", ky:"Китептер", tg:"Китобҳо", qr:"Kitaplar", rang:"#ef4444"},
  {emoji:"🎨",uz:"Rasm chizish to'plami", ru:"Набор для рисования",   en:"Art set", kk:"Сурет салу жиынтығы", ky:"Сүрөт тартуу топтому", tg:"Маҷмӯаи расмкашӣ", qr:"Su'vret siziw toplami", rang:"#06b6d4"},
  {emoji:"🛴",uz:"Samokat",               ru:"Самокат",               en:"Scooter", kk:"Самокат", ky:"Самокат", tg:"Самокат", qr:"Samokat", rang:"#14b8a6"},
  {emoji:"🎧",uz:"Naushnik",              ru:"Наушники",              en:"Headphones", kk:"Құлаққап", ky:"Наушник", tg:"Гӯшмонак", qr:"Naushnik", rang:"#a855f7"},
  {emoji:"👟",uz:"Krossovka",             ru:"Кроссовки",             en:"Sneakers", kk:"Кроссовка", ky:"Кроссовка", tg:"Кроссовка", qr:"Krossovka", rang:"#f97316"},
  {emoji:"🎂",uz:"Tug'ilgan kun",         ru:"День рождения",         en:"Birthday", kk:"Туған күн", ky:"Туулган күн", tg:"Рӯзи таваллуд", qr:"Tuwilg'an ku'n", rang:"#ec4899"},
  {emoji:"💰",uz:"Jamg'arma",             ru:"Накопления",            en:"Savings", kk:"Жинақ", ky:"Топтом", tg:"Пасандоз", qr:"Jamg'arma", rang:"#10b981"},
  {emoji:"⌚",uz:"Aqlli soat",            ru:"Смарт-часы",       en:"Smart watch", kk:"Ақылды сағат", ky:"Акылдуу саат", tg:"Соати ҳушманд", qr:"Aqılı saat", rang:"#0ea5e9"},
  {emoji:"🛹",uz:"Skeytbord",            ru:"Скейтборд",        en:"Skateboard", kk:"Скейтборд", ky:"Скейтборд", tg:"Скейтборд", qr:"Skeytbord", rang:"#84cc16"},
  {emoji:"🎸",uz:"Gitara",               ru:"Гитара",            en:"Guitar", kk:"Гитара", ky:"Гитара", tg:"Гитара", qr:"Gitara", rang:"#f43f5e"},
  {emoji:"🐹",uz:"Uy hayvoni",           ru:"Питомец",          en:"Pet", kk:"Үй жануары", ky:"Үй жаныбары", tg:"Ҳайвони хонагӣ", qr:"Haywan", rang:"#eab308"},
];

export const ONB_SLIDES = [
  {
    id: "intro", color: "ac",
    title: {
      uz: "Oila Hisobchi", ru: "Oila Hisobchi", en: "Oila Hisobchi",
      kk: "Отбасылық Бюджет", ky: "Үй-бүлөлүк Бюджет", tg: "Бюдҷети Оилавӣ", qr: "Oila Hisobchisi"
    },
    desc: {
      uz: "Oilangizning moliyaviy hamrohi. Sodda. Ishonchli. Sizniki.",
      ru: "Финансовый помощник вашей семьи. Просто. Надёжно. Ваше.",
      en: "Your family's financial companion. Simple. Trusted. Yours.",
      kk: "Отбасыңыздың қаржылық серігі. Қарапайым. Сенімді. Сіздікі.",
      ky: "Үй-бүлөңүздүн каржылык шериги. Жөнөкөй. Ишеничтүү. Сиздики.",
      tg: "Ҳамроҳи молиявии оилаи шумо. Оддӣ. Боэътимод. Аз они шумо.",
      qr: "Shan'aran'izdin' qarjiliq joldasi. A'piwayi. Senimli. Sizin'iki."
    }
  },
  {
    id: "budget", color: "gr",
    title: {
      uz: "Oilaviy byudjet", ru: "Семейный бюджет", en: "Family budget",
      kk: "Отбасылық бюджет", ky: "Үй-бүлөлүк бюджет", tg: "Бюдҷети оилавӣ", qr: "Oilaliq budjet"
    },
    desc: {
      uz: "Daromad, xarajat va qarzlar — butun oila uchun bir joyda.",
      ru: "Доходы, расходы и долги — всё в одном месте для всей семьи.",
      en: "Income, expenses and debts — all in one place for the family.",
      kk: "Кіріс, шығыс және қарыздар — бүкіл отбасы үшін бір жерде.",
      ky: "Киреше, чыгым жана карыздар — бүткүл үй-бүлө үчүн бир жерде.",
      tg: "Даромад, хароҷот ва қарзҳо — ҳама дар як ҷо барои тамоми оила.",
      qr: "Kirim, shig'is ha'm qarizlar — barlik oila ushin bir jerde."
    }
  },
  {
    id: "garden", color: "garden",
    title: {
      uz: "Baraka Bog'i", ru: "Сад Барака", en: "Baraka Garden",
      kk: "Береке бағы", ky: "Береке багы", tg: "Боғи Барака", qr: "Bereket bag'i"
    },
    desc: {
      uz: "Tejamkorlik daraxtingizni oila bilan birga o'stiring.",
      ru: "Растите дерево бережливости всей семьёй.",
      en: "Grow your savings tree together as a family.",
      kk: "Үнемдеу ағашыңызды отбасыңызбен бірге өсіріңіз.",
      ky: "Үнөмдөө дарагыңызды үй-бүлөңүз менен бирге өстүрүңүз.",
      tg: "Дарахти пасандози худро ҳамроҳи оила парвариш кунед.",
      qr: "U'nemlew treg'in'izdi oilan'iz benen birge o'sirin'."
    }
  },
  {
    id: "farzand", color: "ac",
    title: {
      uz: "Farzandlar uchun Bilim Bozori", ru: "Базар знаний для детей", en: "Knowledge Market for kids",
      kk: "Балаларға арналған білім базары", ky: "Балдар үчүн билим базары", tg: "Бозори дониш барои кӯдакон", qr: "Perzentler ushin bilim bazari"
    },
    desc: {
      uz: "Farzandingiz vazifa bajarib, o'ynab pul ishlaydi va moliyani boshqarishni o'rganadi.",
      ru: "Ваш ребёнок выполняет задания, играет и учится управлять деньгами.",
      en: "Your child completes tasks, plays and learns to manage money.",
      kk: "Балаңыз тапсырмаларды орындап, ойнап ақша табады және қаржыны басқаруды үйренеді.",
      ky: "Балаңыз тапшырмаларды аткарып, ойноп акча табат жана каржыны башкарууну үйрөнөт.",
      tg: "Фарзанди шумо вазифаҳоро иҷро карда, бозӣ мекунад, пул кор мекунад ва идоракунии молияро меомӯзад.",
      qr: "Perzentin'iz tapsirma orinlap, oynap pul tabadi ha'm qarjini basqariwdi u'yrenedi."
    }
  },
  {
    id: "premium", color: "gold",
    title: {
      uz: "Premium bilan cheksiz", ru: "Безгранично с Premium", en: "Unlimited with Premium",
      kk: "Premium-мен шексіз", ky: "Premium менен чексиз", tg: "Беҳдуд бо Premium", qr: "Premium benen sheksiz"
    },
    desc: {
      uz: "Cheksiz maqsad, PDF/Excel eksport va foydali tavsiyalar.",
      ru: "Безлимитные цели, экспорт PDF/Excel и полезные советы.",
      en: "Unlimited goals, PDF/Excel export and useful insights.",
      kk: "Шексіз мақсаттар, PDF/Excel экспорты және пайдалы кеңестер.",
      ky: "Чексиз максаттар, PDF/Excel экспорту жана пайдалуу кеңештер.",
      tg: "Ҳадафҳои бемаҳдуд, содироти PDF/Excel ва маслиҳатҳои муфид.",
      qr: "Sheksiz maqset, PDF/Excel eksport ha'm paydali ma'sla'hatler."
    }
  },
];

export const RELATIONS = [
  {id:"ota",     emoji:"👨", uz:"Ota",          ru:"Отец",           en:"Father", kk:"Әке", ky:"Ата", tg:"Падар", qr:"A'ke"},
  {id:"ona",     emoji:"👩", uz:"Ona",          ru:"Мать",           en:"Mother", kk:"Ана", ky:"Эне", tg:"Модар", qr:"Ana"},
  {id:"turmush", emoji:"💑", uz:"Turmush o'rtoq",ru:"Супруг(а)",     en:"Spouse", kk:"Жұбайы", ky:"Жубайы", tg:"Ҳамсар", qr:"Zayip/Ku'yeu'"},
  {id:"farzand", emoji:"👦", uz:"Farzand (Katta farzand)", ru:"Ребёнок (Старший ребёнок)", en:"Child (Older child)", kk:"Бала (Үлкен бала)", ky:"Бала (Улуу бала)", tg:"Фарзанд (Фарзанди калонӣ)", qr:"Perzent (U'lken bala)"},
  {id:"aka",     emoji:"👨", uz:"Aka",           ru:"Старший брат",  en:"Older brother", kk:"Аға", ky:"Ага", tg:"Бародар (калонӣ)", qr:"A'ke/Aga"},
  {id:"uka",     emoji:"👦", uz:"Uka",           ru:"Младший брат",  en:"Younger brother", kk:"Іні", ky:"Ини", tg:"Бародар (хурдӣ)", qr:"Ini"},
  {id:"opa",     emoji:"👩", uz:"Opa",           ru:"Старшая сестра",en:"Older sister", kk:"Әпке", ky:"Эже", tg:"Апа", qr:"Opa/A'pke"},
  {id:"singil",  emoji:"👧", uz:"Singil",        ru:"Младшая сестра",en:"Younger sister", kk:"Қарындас/Сіңлі", ky:"Сиңди", tg:"Хоҳар", qr:"Sin'il"},
  {id:"boshqa",  emoji:"👤", uz:"Boshqa",        ru:"Другое",        en:"Other", kk:"Басқа", ky:"Башка", tg:"Дигар", qr:"Basqa"},
];

// XAVFSIZLIK: admin endi ILOVA ICHIDA yo'q. Admin statistikasi alohida,
// mustaqil admin-sayt orqali ko'riladi (faqat Firestore Rules'dagi admin
// UID'ga ruxsat). Oddiy foydalanuvchi ilovasida admin mantiqi saqlanmaydi.
// (Eski ADMIN_TEL olib tashlandi — telefon soxtalashtirilishi mumkin edi.)

export const FAQS = {
  uz:[
    {q:"Oila kodi nima va a'zolarni qanday ulayman?", a:"Oila kodi — oilangizni birlashtiradigan maxsus koddir. Uni 'Profil > Shaxsiy ma'lumotlar' bo'limidan olasiz. Oilangizning boshqa a'zolari ilovadan ro'yxatdan o'tib, 'Mavjud oilaga qo'shilish' tugmasi orqali ushbu kodni kiritsalar, barcha ma'lumotlar avtomatik sinxronlashadi."},
    {q:"Bola akkaunti qanday yaratiladi?", a:"Ota-onalar 'Profil' sahifasida 'Yangi bola qo'shish' tugmasi orqali farzandlari uchun alohida bola profillarini yaratishlari mumkin. Farzandingiz o'z qurilmasidan bola rejimi orqali tizimga kirib, vazifalarni bajarishi, bilim o'yinlarini o'ynashi va o'z orzulari uchun pul jamg'arishi mumkin."},
    {q:"Ovozli kiritish va cheklarni skanerlash qanday ishlaydi?", a:"Xarajat yoki daromad kiritish oynasida mikrofonga bosib ovoz orqali (masalan: 'Bugun tushlikka 45000 so'm sarfladim') yoki chek rasmini skanerlash orqali tranzaksiyalarni bir lahzada qo'shishingiz mumkin. AI matnni avtomatik tushunadi va kerakli kategoriya bilan tranzaksiyani yaratadi."},
    {q:"Oylik budjet va kategoriya limitlari nima?", a:"Oila boshlig'i umumiy oylik budjetni hamda oziq-ovqat, transport kabi har bir kategoriya uchun alohida oylik limitlarni belgilashi mumkin. Limitlar 90% ga yetganda yoki oshib ketganda ilova ogohlantirish yuboradi."},
    {q:"Vazifalar, rag'batlar va sovg'alar qanday ishlaydi?", a:"Ota-onalar 'Vazifalar' bo'limida bolalarga foydali yumushlar (masalan: 'Kitob o'qish', 'Xonani yig'ishtirish') berib, evaziga pul mukofoti belgilashlari mumkin. Bola vazifani bajarib rasm yuklaydi, ota-ona tasdiqlagach, pul bolaning hamyoniga o'tadi. Shuningdek, bola ota-onadan sovg'a so'rashi ham mumkin."},
    {q:"Mening orzularim (Maqsadlar) nima va pul qanday yig'iladi?", a:"Bola o'zi uchun orzu-maqsadlar yaratib (masalan: 'Yangi velosiped'), unga kerakli summani belgilaydi. O'z hamyonidan unga pul o'tkazib boradi. Maqsad to'liq yig'ilgach, ota-ona tasdiqlaydi va maqsadga erishiladi."},
    {q:"Bilim Hubi va moliya o'yinlari qanday foyda beradi?", a:"Bolalar 'Bilim Bozori' yoki 'Bilim Hubi' bo'limida moliyaviy savodxonlik, matematika, rejalashtirish bo'yicha qiziqarli o'yinlarni o'ynab, tangalar hamda ballar ishlab oladilar. Bu ularga yoshligidan pulni to'g'ri boshqarishni o'rgatadi."},
    {q:"PIN kod va xavfsizlik sozlamalari qayerda?", a:"Ilovani begonalar ochmasligi uchun 'Profil > Ilova sozlamalari > Xavfsizlik' bo'limida 4 raqamli PIN-kod yoki barmoq izi orqali kirishni faollashtirishingiz mumkin."},
  ],
  ru:[
    {q:"Что такое код семьи и как подключить близких?", a:"Код семьи — это уникальный идентификатор вашей группы. Найти его можно в разделе 'Профиль > Личные данные'. Другие члены семьи могут войти в приложение, нажать 'Присоединиться к семье' и ввести этот код для синхронизации всех данных."},
    {q:"Как создать детский аккаунт?", a:"Родители могут создать профиль для ребёнка в меню 'Профиль' -> 'Добавить ребёнка'. После этого ребёнок сможет войти в систему со своего устройства под детским профилем, выполнять задания, играть в игры и копить на мечты."},
    {q:"Как работает голосовой ввод и сканирование чеков?", a:"В окне добавления транзакции нажмите на иконку микрофона для голосового ввода (например: 'Потратил 25000 сум на такси') или отсканируйте чек через камеру. AI автоматически распознает сумму, детали и категорию."},
    {q:"Зачем нужны месячный бюджет и лимиты категорий?", a:"Глава семьи может установить общий бюджет на месяц и отдельные лимиты по категориям (продукты, развлечения и т.д.). При приближении к лимиту (95% или превышении) система отправит уведомление."},
    {q:"Как работают задания, награды и подарки?", a:"Родители могут поручить детям полезные дела (например: 'Уборка', 'Чтение книги') и назначить денежную награду. Ребёнок отправляет фотоотчёт, родитель подтверждает, и деньги зачисляются на баланс ребёнка. Также дети могут просить подарки."},
    {q:"Что такое раздел 'Мои мечты' (Цели) и как копить?", a:"Ребёнок может создать цель (например: 'Новый велосипед') и указать нужную сумму. Он может переводить сбережения из своего кошелька на эту цель. При накоплении 100% родитель подтверждает покупку."},
    {q:"Какую пользу приносят Игры и Маркет знаний?", a:"В разделе 'Маркет знаний' дети играют в развивающие финансовые игры, изучают математику, планирование бюджета и зарабатывают монеты и звёзды. Это развивает у них правильное отношение к деньгам."},
    {q:"Как настроить PIN-код и безопасность?", a:"Чтобы защитить приложение, перейдите в 'Профиль > Настройки приложения > Безопасность' и установите 4-значный PIN-код или включите вход по отпечатку пальца."},
  ],
  en:[
    {q:"What is the family code and how to connect members?", a:"The family code is a unique code that binds your family account together. You can find it under 'Profile > Personal info'. Other family members can sign up, select 'Join existing family', and enter this code to sync all data instantly."},
    {q:"How do I create a kid account?", a:"Parents can create kid accounts via the 'Add kid profile' button in the 'Profile' section. Children can then log in using their device under the kid mode, complete tasks, play financial games, and save up for their dreams."},
    {q:"How do voice input and receipt scanning work?", a:"In the add transaction sheet, tap the microphone to speak (e.g., 'Spent 5 dollars on coffee') or scan your shopping receipt with the camera. The AI automatically understands the text and categorizes the transaction."},
    {q:"What are monthly budgets and category limits?", a:"The family head can set a total monthly budget and individual limits for categories like groceries, utilities, etc. The app sends alerts when limits reach 90% or are exceeded."},
    {q:"How do tasks, rewards, and gifts work?", a:"Parents can assign chores or educational tasks (e.g., 'Read a book', 'Clean bedroom') with monetary rewards. Kids submit photo proof, and once the parent approves, the reward is added to the kid's wallet. Kids can also request gifts."},
    {q:"What are 'My dreams' (Goals) and how to save?", a:"Kids can create custom target goals (e.g., 'New bicycle') and set the target price. They can transfer money from their wallet into their goals. Once fully saved, parents confirm the purchase."},
    {q:"What are the Learning Hub and financial games?", a:"Under the 'Learning Hub' or 'Knowledge Market', kids can play educational games focused on finance, math, and budget planning to earn coins and stars. This teaches money management from an early age."},
    {q:"Where can I set the PIN code and security?", a:"To secure your application, go to 'Profile > App Settings > Security' to activate a 4-digit PIN access lock or fingerprint biometric authentication."},
  ],
  kk:[
    {q:"Отбасы коды дегеніміз не және мүшелерді қалай қосамын?", a:"Отбасы коды — бұл отбасыңызды біріктіретін арнайы код. Оны 'Профиль > Жеке мәліметтер' бөлімінен алуға болады. Басқа мүшелер тіркеліп, 'Отбасына қосылу' түймесі арқылы осы кодты енгізсе, барлық деректер автоматты түрде синхрондалады."},
    {q:"Бала аккаунты қалай жасалады?", a:"Ата-аналар 'Профиль' бетінде 'Жаңа бала қосу' түймесі арқылы балаларына жеке профильдер жасай алады. Бала өз құрылғысынан бала режимімен кіріп, тапсырмаларды орындап, білім ойындарын ойнай алады және мақсаттарына ақша жинай алады."},
    {q:"Дауыспен енгізу және чектерді сканерлеу қалай жұмыс істейді?", a:"Транзакция қосу терезесінде микрофон белгішесін басып дауыспен (мысалы: 'Бүгін түскі асқа 5000 теңге жұмсадым') немесе чек суретін сканерлеу арқылы транзакцияларды жылдам қосуға болады. Жасанды интеллект мәтінді автоматты түрде түсініп, қажетті санатпен транзакцияны жасайды."},
    {q:"Айлық бюджет және санат лимиттері дегеніміз не?", a:"Отағасы жалпы айлық бюджетті және әр санатқа (мысалы, азық-түлік, көлік) бөлек айлық лимиттерді белгілей алады. Лимит 90%-ға жеткенде немесе асқанда қосымша ескерту жібереді."},
    {q:"Тапсырмалар, сыйақылар мен сыйлықтар қалай жұмыс істейді?", a:"Ата-аналар 'Тапсырмалар' бөлімінде балаларға пайдалы жұмыстар тапсырып (мысалы: 'Кітап оқу', 'Бөлмені жинау'), оған ақшалай сыйақы тағайындай алады. Бала тапсырманы орындап сурет жүктейді, ата-ана мақұлдаған соң ақша баланың әмиянына түседі. Сондай-ақ, бала ата-анасынан сыйлық сұрай алады."},
    {q:"Менің мақсаттарым не және ақша қалай жиналады?", a:"Бала өзіне мақсаттар құрып (мысалы: 'Жаңа велосипед'), оған қажетті соманы белгілейді. Өз әмиянынан осы мақсатқа ақша аударып отырады. Мақсат толық жиналғаннан кейін ата-ана мақұлдап, мақсат орындалады."},
    {q:"Білім хабы мен қаржы ойындарының қандай пайдасы бар?", a:"Балалар 'Білім базары' немесе 'Білім хабы' бөлімінде қаржылық сауаттылық, математика, жоспарлау бойынша қызықты ойындар ойнап, тиындар мен ұпайлар жинайды. Бұл оларға жастайынан ақшаны дұрыс басқаруды үйретеді."},
    {q:"PIN код пен қауіпсіздік параметрлері қайда орналасқан?", a:"Қосымшаны басқалар ашпауы үшін 'Профиль > Қосымша параметрлері > Қауіпсіздік' бөлімінде 4 таңбалы PIN-кодты немесе саусақ ізі арқылы кіруді белсендіруге болады."},
  ],
  ky:[
    {q:"Үй-бүлө коду деген эмне жана мүчөлөрдү кантип кошом?", a:"Үй-бүлө коду — бул үй-бүлөңүздү бириктирген атайын код. Аны 'Профиль > Жеке маалыматтар' бөлүмүнөн табасыз. Башка үй-бүлө мүчөлөрү тиркемеге катталып, 'Үй-бүлөгө кошулуу' баскычы арқылуу ушул кодду киргизсе, бардык маалыматтар автоматтык түрдө синхрондолот."},
    {q:"Баланын аккаунту кантип түзүлөт?", a:"Ата-энелер 'Профиль' баракчасындагы 'Жаңы бала кошуу' баскычы арқылуу балдарына жеке профилдерди түзө алышат. Бала өз түзмөгүнөн бала режими менен кирип, тапсырмаларды аткарып, финансылык оюндарды ойноп, максаттарына акча топтой алат."},
    {q:"Үн менен киргизүү жана чектерди сканерлөө кантип иштейт?", a:"Транзакция кошуу терезесинде микрофонду басып үн менен (мисалы: 'Бүгүн таксиге 200 сом короттум') же чекти сканерлөө аркылуу транзакцияларды тез эле кошсоңуз болот. Жасалма интеллект текстти автоматтык түрдө түшүнүп, керектүү категория менен транзакцияны түзөт."},
    {q:"Айлык бюджет жана категория чектөөлөрү эмне?", a:"Үй-бүлө башчысы жалпы айлык бюджетти жана ар бир категория үчүн (мисалы, азык-түлүк, транспорт) өзүнчө айлык чектөөлөрдү белгилей алат. Чектөө 90%га жеткенде же ашканда тиркеме эскертүү жөнөтөт."},
    {q:"Тапшырмалар, сыйлыктар жана белектер кантип иштейт?", a:"Ата-энелер 'Тапшырмалар' бөлүмүндө балдарга пайдалуу иштерди тапшырып (мисалы: 'Китеп окуу', 'Бөлмөнү жыйноо') акчалай сыйлык белгилей алышат. Бала тапшырманы аткарып сүрөт жүктөйт, ата-эне ырастагандан кийин акча баланын капчыгына которулат."},
    {q:"Менин максаттарым эмне жана акча кантип чогултулат?", a:"Бала өзүнө максаттарды түзүп (мисалы: 'Жаңы велосипед') керектүү сумманы белгилейт. Өз капчыгынан ага акча которуп турат. Максат толук чогултулгандан кийин ата-эне сатып алууну ырастайт."},
    {q:"Билим хабы жана каржы оюндары кандай пайда берет?", a:"Балдар 'Билим базары' же 'Билим хабы' бөлүмүндө финансылык сабаттуулук, математика, пландаштыруу боюнча кызыктуу оюндарды ойноп, тыйын жана упайларды иштеп табышат. Бул аларга кичинекейинен акчаны туура башкарууну үйрөтөт."},
    {q:"PIN код жана коопсуздук жөндөөлөрү кайда?", a:"Тиркемени башкалар ачпашы үчүн 'Профиль > Тиркеме жөндөөлөрү > Коопсуздук' бөлүмүнөн 4 орундуу PIN-кодду же манжа изи менен кирүүнү иштете аласыз."},
  ],
  tg:[
    {q:"Коди оила чист ва ман чӣ тавр аъзоёнро пайваст кунам?", a:"Коди оила — коди махсусест, ки оилаи шуморо муттаҳид мекунад. Шумо онро аз бахши 'Профил > Маълумоти шахсӣ' мегиред. Дигар аъзоёни оила аз барнома сабти ном шуда, тавассути тугмаи 'Ҳамроҳ шудан ба оилаи мавҷуда' ин кодро ворид мекунанд ва ҳамаи маълумотҳо автоматӣ ҳамоҳанг мешаванд."},
    {q:"Профили кӯдак чӣ тавр сохта мешавад?", a:"Волидон метавонанд дар саҳифаи 'Профил' тавассути тугмаи 'Иловаи кӯдаки нав' барои фарзандони худ профили алоҳида созанд. Фарзанди шумо метавонад аз дастгоҳи худ тавассути режими кӯдакона вориди система шуда, вазифаҳоро иҷро кунад, бозиҳои омӯзишӣ кунад ва барои орзуҳояш пул ҷамъ кунад."},
    {q:"Воридкунии овозӣ ва сканеркунии чекҳо чӣ гуна кор мекунанд?", a:"Дар равзанаи иловаи транзаксия тугмаи микрофонро пахш карда бо овоз (масалан: 'Имрӯз барои хӯроки нисфирӯзӣ 50 сомонӣ сарф кардам') ё тавассути сканер кардани акси чек транзаксияҳоро илова кунед. AI матнро автоматӣ мефаҳмад ва бо категорияи лозима транзаксия месозад."},
    {q:"Бюдҷети моҳона ва лимитҳои категорияҳо чист?", a:"Сарвари оила метавонад бюджетти умумии моҳона ва лимитҳои алоҳида барои ҳар як категория (масалан, хӯрокворӣ, нақлиёт) муайян кунад. Вақте ки лимит ба 90% мерасад ё мегузарад, барнома огоҳӣ мефиристад."},
    {q:"Вазифаҳо, мукофотҳо ва туҳфаҳо чӣ гуна кор мекунанд?", a:"Волидон метавонанд дар бахши 'Вазифаҳо' ба кӯдакон корҳои муфид (масалан: 'Китобхонӣ', 'Рӯбучини хона') супорида, мукофоти пулӣ муайян кунанд. Кӯдак вазифаро иҷро карда, акс мефиристад ва пас аз тасдиқи волидон пул ба ҳамёни кӯдак мегузарад. Кӯдак инчунин метавонад туҳфа дархост кунад."},
    {q:"Ҳадафҳои ман чист ва пул чӣ тавр ҷамъ карда мешается?", a:"Кӯдак барои худ ҳадафҳо сохта (масалан: 'Дучархаи нав') ва маблағи лозимаро муайян мекунад. Ӯ аз ҳамёни худ ба ин ҳадаф пул мегузаронад. Пас аз пурра ҷамъ шудани маблағ, волидон онро тасдиқ мекунанд."},
    {q:"Бозиҳои молиявӣ ва маркази дониш чӣ фоида доранд?", a:"Кӯдакон дар бахши 'Бозори дониш' бозиҳои ҷолиби молиявӣ, математика ва банақшагириро бозӣ карда, тангаҳо ва холҳо ба даст меоранд. Ин ба онҳо аз хурдсолӣ идоракунии дурусти пулро меомӯзонад."},
    {q:"PIN код ва танзимоти амният дар куҷоянд?", a:"Барои он ки дигарон барномаро кушода натавонанд, шумо метавонед дар бахши 'Профил > Танзимоти барнома > Амният' коди PIN-и 4-рақама ё вуруд бо изи ангуштро фаъол созед."},
  ],
  qr:[
    {q:"Oila kodi neme ha'm ag'zalardi qalay qosaman?", a:"Oila kodi — oilan'izdi birlestiretug'in arnawli kod. Oni 'Profil > Shaxsey mag'lu'matlar' bo'liminen alasiz. Oilan'izdin' basqa ag'zalari ilovadan dizimnen o'tip, 'Bar oilag'a qosiliv' tu'ymesi arqali usib kodti kirgizse, barlik mag'lu'matlar avtomatli sinxronlanadi."},
    {q:"Perzent akkaunti qalay jaratiladi?", a:"Ata-analar 'Profil' betinde 'Jan'a bala qosiw' tu'ymesi arqali perzentleri ushin bo'lek bala profillerin jaratadi. Perzentin'iz o'z apparatinan bala rejimi arqali dizimge kirip, tapsirmalardi orinlawi, bilim oyinlarin oynawi ha'm o'z maqsetleri ushin pul jiynawi mu'mkin."},
    {q:"Ovozli kirgiziw ha'm cheklardi skanerlew qalay isleydi?", a:"Xarij yaki kirim kirgiziw betinde mikrofong'a basip ovoz arqali (masalan: 'Bug'in tu'slikke 45000 swm sarpladim') yaki chek su'vretin skanerlew arqali tranzaksiyalardi tez qosivg'a boladi. AI tekstti avtomatli tu'sinip kerekli kategoriya menen tranzaksiyani jaratadi."},
    {q:"Ayliq budjet ha'm kategoriya limitleri neme?", a:"Oila baslig'i u'mivmiy ayliq budjetti ha'm oziq-awqat, transport siyaqli ha'r bir kategoriya ushin bo'lek ayliq limitlerdi belgilewi mu'mkin. Limitler 90% g'a jetkende yaki asip ketkende ilova eskertiw jiberedi."},
    {q:"Tapsirmalar, siyliqlar qalay isleydi?", a:"Ata-analar 'Tapsirmalar' bo'liminde balag'a paydali tapsirmalar (masalan: 'Kitap oqiw', 'Xonani jiyishtiriw') berip, evazine pul siylig'in belgilewi mu'mkin. Bala tapsirma orinlap su'vret ju'kleydi, ata-ana tastiyqlag'ach pul balanin' hamyonig'a o'tedi."},
    {q:"Menin' maqsetlerim neme ha'm pul qalay jiynaladi?", a:"Bala o'zi ushin maqsetler jaratip (masalan: 'Jan'a velosiped') og'ar kerekli summani belgileyi. O'z hamyoninan og'ar pul o'tkerip baradi. Maqset to'liq jiynalg'ach, ata-ana tastiyqlaydi ha'm maqsetke erisiledi."},
    {q:"Bilim bozori ha'm finans oyinlari qanday payda beredi?", a:"Balalar 'Bilim bozori' yaki 'Bilim bo'liminde' qarjiliq sawatliqliq, matematika, jobalastiriw boyinsha qiziqli oyinlardi oynap, tang'alar ha'm ballar islep aladi. Bul olarg'a jaslig'inan puldi duris basqariwdi u'yretedi."},
    {q:"PIN kod ha'm qa'wipsizlik sozlamalari qayerde?", a:"Ilovani basqalar ashpawi ushin 'Profil > Ilova sozlamalari > Qa'wipsizlik' bo'liminde 4 sanli PIN-kod yaki barmoq izi arqali kiriwdi belsendire alasiz."},
  ],
};

export const TL = {
  uz:{app:"Oila Hisobchi",hi:"Salom",home:"Bosh",chart:"Grafik",goal:"Maqsad",rep:"Hisobot",
    inc:"Daromad",exp:"Xarajat",bal:"Balans",bud:"Budjet",me:"Men",hd:"Bosh",mb2:"A'zo",
    prf:"Profil",up:"Rasm yuklash",rp:"Rasmni o'chirish",ep:"Tahrirlash",un:"Ismni yangilash",
    fc2:"Oila kodi",fcd:"Oila a'zolaringizga yuboring",bll:"Budjet",mb:"Oylik budjet (so'm)",
    cl:"Kategoriya limitleri",fam:"Oila",sa:"Saqlandi",ua:"Yangilandi",lo:"Chiqish",
    sp:"sarflandi",lf:"qoldi",ex:"oshdi!",le:"limiti oshdi!",bw:"Budjetning 90% sarflandi!",
    be:"Budjet oshib ketdi!",xa:"Xarajat qo'shildi",da:"Daromad qo'shildi",ma:"Maqsad qo'shildi",
    od:"Faqat o'z yozuvingizni o'chira olasiz",fa:"Barcha maydonlarni to'ldiring",
    ea:"Summa kiriting",ec:"To'g'ri raqam kiriting",ee:"Bu email allaqachon ro'yxatda",
    ue:"Foydalanuvchi topilmadi",we:"Parol noto'g'ri",ffe:"Bunday oila kodi topilmadi",
    fc3:"Oila yaratildi!",jf2:"Oilaga qo'shildingiz!",wc:"Xush kelibsiz",sch:"Qidirish...",
    res:"Natijalar",nf2:"Topilmadi",nr:"Hali yozuv yo'q",l7:"So'nggi 7 kun",l6:"Oylik xarajatlar",
    bc:"Bu oy kategoriyalar",hm:"Kunlik faollik (30 kun)",st:"Oylik ko'rsatkichlar",
    ad:"O'rtacha kunlik",ir:"Daromad/Xarajat",bs:"Budjet tejalgan",rc:"Yozuvlar soni",
    rates:"Valyuta kurslari",rSub:"Markaziy bank kursi",ldd:"Yuklanmoqda...",all:"Hammasi",
    ed:"Xarajat taqsimoti",isr:"Daromad manbalari",bm:"A'zolar bo'yicha",
    aa:"Foydali moliyaviy maslahat",an:"Tahlil...",na:"Yangi maslahat",sv:"Saqlash",am:"Qo'shish",
    ach:"Maqsadga erishdingiz!",rem:"Qolgan",tp:"Pul qo'shish",mr:"oylik hisoboti",cn:"Bekor",
    shaxsiy:"Shaxsiy ma'lumotlar",ilovaS:"Ilova sozlamalari",xav:"Xavfsizlik",
    qol:"Qo'llab-quvvatlash",ver:"Ilova versiyasi",til:"Interfeys tili",mavzu:"Ilova mavzusi",
    kunduzi:"Kunduzgi",tungi:"Tungi",pin:"PIN kodni o'zgartirish",barmoq:"Barmoq izi bilan kirish",
    tgBot:"Rasmiy Telegram bot",faq:"Ko'p so'raladigan savollar",qoshimcha:"QO'SHIMCHA"},
  ru:{app:"Семейный Бюджет",hi:"Привет",home:"Главная",chart:"Графики",goal:"Цели",rep:"Отчёт",
    inc:"Доход",exp:"Расход",bal:"Баланс",bud:"Бюджет",me:"Я",hd:"Глава",mb2:"Участник",
    prf:"Профиль",up:"Загрузить фото",rp:"Удалить фото",ep:"Редактировать",un:"Обновить имя",
    fc2:"Код семьи",fcd:"Отправьте код членам семьи",bll:"Бюджет",mb:"Месячный бюджет (сум)",
    cl:"Лимиты категорий",fam:"Семья",sa:"Сохранено",ua:"Обновлено",lo:"Выйти",
    sp:"потрачено",lf:"осталось",ex:"превышен!",le:"лимит превышен!",
    bw:"Использовано 90% бюджета!",be:"Бюджет превышен!",xa:"Расход добавлен",da:"Доход добавлен",
    ma:"Цель добавлена",od:"Можно удалять только свои записи",fa:"Заполните все поля",
    ea:"Введите сумму",ec:"Введите корректное число",ee:"Email уже зарегистрирован",
    ue:"Пользователь не найден",we:"Неверный пароль",ffe:"Код семьи не найден",
    fc3:"Семья создана!",jf2:"Вы присоединились!",wc:"Добро пожаловать",sch:"Поиск...",
    res:"Результаты",nf2:"Не найдено",nr:"Записей пока нет",l7:"Последние 7 дней",
    l6:"Месячные расходы",bc:"Категории за месяц",hm:"Активность за 30 дней",
    st:"Показатели месяца",ad:"Средний дневной",ir:"Доход/Расход",bs:"Экономия бюджета",
    rc:"Записей за месяц",rates:"Курсы валют",rSub:"Курс ЦБ",ldd:"Загрузка...",all:"Все",
    ed:"Распределение расходов",isr:"Источники дохода",bm:"По участникам",
    aa:"Полезный финансовый совет",an:"Анализируется...",na:"Новый совет",sv:"Сохранить",am:"Добавить",
    ach:"Цель достигнута!",rem:"Осталось",tp:"Пополнение",mr:"отчёт за",cn:"Отмена",
    shaxsiy:"Личные данные",ilovaS:"Настройки",xav:"Безопасность",qol:"Поддержка",
    ver:"Версия",til:"Язык",mavzu:"Тема",kunduzi:"Светлый",tungi:"Тёмный",
    pin:"Изменить PIN",barmoq:"Отпечаток",tgBot:"Telegram бот",faq:"FAQ",qoshimcha:"ДОПОЛНИТЕЛЬНО"},
  en:{app:"Family Budget",hi:"Hello",home:"Home",chart:"Charts",goal:"Goals",rep:"Report",
    inc:"Income",exp:"Expense",bal:"Balance",bud:"Budget",me:"Me",hd:"Head",mb2:"Member",
    prf:"Profile",up:"Upload photo",rp:"Remove photo",ep:"Edit",un:"Update name",
    fc2:"Family code",fcd:"Share with family",bll:"Budget",mb:"Monthly budget (UZS)",
    cl:"Category limits",fam:"Family",sa:"Saved",ua:"Updated",lo:"Sign out",
    sp:"spent",lf:"left",ex:"exceeded!",le:"limit exceeded!",
    bw:"90% of budget used!",be:"Budget exceeded!",xa:"Expense added",da:"Income added",
    ma:"Goal added",od:"You can only delete your own records",fa:"Fill all fields",
    ea:"Enter amount",ec:"Enter valid number",ee:"Email already registered",
    ue:"User not found",we:"Wrong password",ffe:"Family code not found",
    fc3:"Family created!",jf2:"Joined family!",wc:"Welcome",sch:"Search...",
    res:"Results",nf2:"Not found",nr:"No records yet",l7:"Last 7 days",l6:"Monthly expenses",
    bc:"This month",hm:"Activity 30 days",st:"Monthly stats",ad:"Avg daily",ir:"Income/Expense",
    bs:"Budget saved",rc:"Records",rates:"Exchange rates",rSub:"Central Bank",ldd:"Loading...",
    all:"All",ed:"Expense breakdown",isr:"Income sources",bm:"By members",
    aa:"Useful Financial advice",an:"Analyzing...",na:"New advice",sv:"Save",am:"Add",
    ach:"Goal achieved!",rem:"Remaining",tp:"Add funds",mr:"monthly report",cn:"Cancel",
    shaxsiy:"Personal info",ilovaS:"App settings",xav:"Security",qol:"Support",
    ver:"Version",til:"Language",mavzu:"Theme",kunduzi:"Light",tungi:"Dark",
    pin:"Change PIN",barmoq:"Fingerprint",tgBot:"Telegram Bot",faq:"FAQ",qoshimcha:"ADDITIONAL"},
  kk:{app:"Отбасылық бюджет",hi:"Сәлем",home:"Басты бет",chart:"Графиктер",goal:"Мақсаттар",rep:"Есеп",
    inc:"Кіріс",exp:"Шығыс",bal:"Баланс",bud:"Бюджет",me:"Мен",hd:"Басшы",mb2:"Мүше",
    prf:"Профиль",up:"Суретті жүктеу",rp:"Суретті жою",ep:"Өңдеу",un:"Атты жаңарту",
    fc2:"Отбасы коды",fcd:"Кодты отбасы мүшелеріне жіберіңіз",bll:"Бюджет",mb:"Айлық бюджет (теңге/сум)",
    cl:"Санат лимиттері",fam:"Отбасы",sa:"Сақталды",ua:"Жаңартылды",lo:"Шығу",
    sp:"жұмсалды",lf:"қалды",ex:"асып кетті!",le:"лимит асып кетті!",bw:"Бюджеттің 90%-ы жұмсалды!",
    be:"Бюджет асып кетті!",xa:"Шығыс қосылды",da:"Кіріс қосылды",ma:"Мақсат қосылды",
    od:"Тек өз жазбаларыңызды өшіре аласыз",fa:"Барлық өрістерді толтырыңыз",
    ea:"Соманы енгізіңіз",ec:"Дұрыс санды енгізіңіз",ee:"Бұл email тіркеліп қойған",
    ue:"Пайдаланушы табылмады",we:"Құпия сөз қате",ffe:"Мұндай отбасы коды табылмады",
    fc3:"Отбасы құрылды!",jf2:"Отбасына қосылдыңыз!",wc:"Қош келдіңіз",sch:"Іздеу...",
    res:"Нәтижелер",nf2:"Табылмады",nr:"Әлі жазбалар жоқ",l7:"Соңғы 7 күн",l6:"Айлық шығыстар",
    bc:"Осы айдағы санаттар",hm:"Күнделікті белсенділік (30 күн)",st:"Айлық көрсеткіштер",
    ad:"Орташа күнделікті",ir:"Кіріс/Шығыс",bs:"Бюджетті үнемдеу",rc:"Жазылымдар саны",
    rates:"Валюта бағамдары",rSub:"Орталық банк бағамы",ldd:"Жүктелуде...",all:"Барлығы",
    ed:"Шығыстарды бөлу",isr:"Кіріс көздері",bm:"Мүшелер бойынша",
    aa:"Пайдалы қаржылық кеңес",an:"Талдау...",na:"Жаңа кеңес",sv:"Сақтау",am:"Қосу",
    ach:"Мақсатқа жеттіңіз!",rem:"Қалғаны",tp:"Ақша қосу",mr:"айлық есебі",cn:"Бас тарту",
    shaxsiy:"Жеке мәліметтер",ilovaS:"Қосымша параметрлері",xav:"Қауіпсіздік",
    qol:"Қолдау",ver:"Қосымша нұсқасы",til:"Интерфейс тілі",mavzu:"Қосымша тақырыбы",
    kunduzi:"Күндізгі",tungi:"Түнгі",pin:"PIN кодты өзгерту",barmoq:"Саусақ ізімен кіру",
    tgBot:"Ресми Telegram бот",faq:"Жиі қойылатын сұрақтар",qoshimcha:"ҚОСЫМША"},
  ky:{app:"Үй-бүлөлүк бюджет",hi:"Салам",home:"Башкы бет",chart:"Графиктер",goal:"Максаттар",rep:"Отчёт",
    inc:"Киреше",exp:"Чыгым",bal:"Баланс",bud:"Бюджет",me:"Мен",hd:"Башчы",mb2:"Мүчө",
    prf:"Профиль",up:"Сүрөт жүктөө",rp:"Сүрөттү өчүрүү",ep:"Түзөтүү",un:"Атын жаңыртуу",
    fc2:"Үй-бүлө коду",fcd:"Кодду үй-бүлө мүчөлөрүнө жөнөтүңүз",bll:"Бюджет",mb:"Айлык бюджет (сом)",
    cl:"Категория лимиттери",fam:"Үй-бүлө",sa:"Сакталды",ua:"Жаңартылды",lo:"Чыгуу",
    sp:"коротулду",lf:"калды",ex:"ашып кетти!",le:"лимит ашып кетти!",bw:"Бюджеттин 90% коротулду!",
    be:"Бюджет ашып кетти!",xa:"Чыгым кошулду",da:"Киреше кошулду",ma:"Максат кошулду",
    od:"Өзүңүздүн гана жазууларыңызды өчүрө аласыз",fa:"Бардык талааларды толтуруңуз",
    ea:"Сумманы киргизиңиз",ec:"Туура санды киргизиңиз",ee:"Бул email катталган",
    ue:"Колдонуучу табылган жок",we:"Купия сөз туура эмес",ffe:"Үй-бүлө коду табылган жок",
    fc3:"Үй-бүлө түзүлдү!",jf2:"Үй-бүлөгө кошулдуңуз!",wc:"Кош келиңиз",sch:"Издөө...",
    res:"Жыйынтыктар",nf2:"Табылган жок",nr:"Азырынча жазуу жок",l7:"Акыркы 7 күн",l6:"Айлык чыгымдар",
    bc:"Ушул айдагы категориялар",hm:"Күнүмдүк активдүүлүк (30 күн)",st:"Айлык көрсөткүчтөр",
    ad:"Орточо күнүмдүк",ir:"Киреше/Чыгым",bs:"Бюджетти үнөмдөө",rc:"Жазуулардын саны",
    rates:"Валюта курстары",rSub:"Борбордук банк курсу",ldd:"Жүктөлүүдө...",all:"Баары",
    ed:"Чыгымдарды бөлүштүрүү",isr:"Киреше булактары",bm:"Мүчөлөр боюнча",
    aa:"Пайдалуу финансылык кеңеш",an:"Талдоо...",na:"Жаңы кеңеш",sv:"Сактоо",am:"Кошуу",
    ach:"Максатка жеттіңіз!",rem:"Калганы",tp:"Акча кошуу",mr:"айлык отчёту",cn:"Жокко чыгаруу",
    shaxsiy:"Жеке маалыматтар",ilovaS:"Тиркеме жөндөөлөрү",xav:"Коопсуздук",
    qol:"Колдоо",ver:"Тиркеме версиясы",til:"Забони интерфейс",mavzu:"Тиркеме темасы",
    kunduzi:"Күндүзгү",tungi:"Түнкү",pin:"PIN кодду өзгөртүү",barmoq:"Манжа изи менен кирүү",
    tgBot:"Расмий Telegram бот",faq:"Көп берилүүчү суроолор",qoshimcha:"КОШУМЧА"},
  tg:{app:"Бюдҷети оилавӣ",hi:"Салом",home:"Саҳифаи асосӣ",chart:"Графикҳо",goal:"Ҳадафҳо",rep:"Ҳисобот",
    inc:"Даромад",exp:"Хароҷот",bal:"Балланс",bud:"Бюдҷет",me:"Ман",hd:"Роҳбар",mb2:"Узв",
    prf:"Профил",up:"Боркунии акс",rp:"Ҳазфи акс",ep:"Таҳрир",un:"Навсозии ном",
    fc2:"Коди оила",fcd:"Кодро ба узви оила фиристед",bll:"Бюдҷет",mb:"Бюдҷети моҳона (сомонӣ)",
    cl:"Лимитҳои категория",fam:"Оила",sa:"Захира шуд",ua:"Навсозӣ шуд",lo:"Хуроҷ",
    sp:"сарф шуд",lf:"монд",ex:"гузашт!",le:"лимит гузашт!",bw:"90%-и бюджет сарф шуд!",
    be:"Бюдҷет гузашт!",xa:"Хароҷот илова шуд",da:"Даромад илова шуд",ma:"Ҳадаф илова шуд",
    od:"Шумо танҳо сабтҳои худро ҳазф карда метавонед",fa:"Ҳамаи майдонҳоро пур кунед",
    ea:"Суммаро ворид кунед",ec:"Рақами дурустро ворид кунед",ee:"Ин email аллакай сабт шудааст",
    ue:"Корбар ёфт нашуд",we:"Рамз нодуруст аст",ffe:"Коди оила ёфт нашуд",
    fc3:"Оила сохта шуд!",jf2:"Шумо ба оила ҳамроҳ шудед!",wc:"Хуш омадед",sch:"Ҷустуҷӯ...",
    res:"Натиҷаҳо",nf2:"Ёфт нашуд",nr:"Ҳанӯз сабт нест",l7:"7 рӯзи охир",l6:"Хароҷоти моҳона",
    bc:"Категорияҳои ин моҳ",hm:"Фаъолияти рӯзона (30 рӯз)",st:"Нишондиҳандаҳои моҳона",
    ad:"Миёнаи рӯзона",ir:"Даромад/Хароҷот",bs:"Сарфаи бюджет",rc:"Шумораи сабтҳо",
    rates:"Қурби асъор",rSub:"Қурби бонки марказӣ",ldd:"Дар ҳоли боркунӣ...",all:"Ҳама",
    ed:"Тақсимоти хароҷот",isr:"Манбаъҳои даромад",bm:"Аз рӯи узвҳо",
    aa:"Машварати молиявии муфид",an:"Таҳлил...",na:"Машварати нав",sv:"Захира кардан",am:"Илова кардан",
    ach:"Ба ҳадаф расидед!",rem:"Мондааст",tp:"Иловаи маблағ",mr:"ҳисоботи моҳона",cn:"Бекор кардан",
    shaxsiy:"Маълумоти шахсӣ",ilovaS:"Танзимоти барнома",xav:"Амният",
    qol:"Дастгирӣ",ver:"Версияи барнома",til:"Забони интерфейс",mavzu:"Мавзӯи барнома",
    kunduzi:"Рӯзона",tungi:"Шабона",pin:"Иваз кардани PIN коди",barmoq:"Вуруд бо изи ангушт",
    tgBot:"Боти расмии Telegram",faq:"Саволҳои зуд-зуд додашаванда",qoshimcha:"ИЛОВАГӢ"},
  qr:{app:"Oila Hisobchisi",hi:"Salom",home:"Bas bet",chart:"Grafik",goal:"Maqset",rep:"Esabat",
    inc:"Kirim",exp:"Shig'is",bal:"Balans",bud:"Budjet",me:"Men",hd:"Basliq",mb2:"Ag'za",
    prf:"Profil",up:"Su'vret ju'klesh",rp:"Su'vretti o'shiriw",ep:"Redaktorlaw",un:"Atg'a o'zgeris",
    fc2:"Oila kodi",fcd:"Oila ag'zalarin'izg'a jiberin'",bll:"Budjet",mb:"Ayliq budjet (swm)",
    cl:"Kategoriya limitleri",fam:"Oila",sa:"Saqlandi",ua:"Jan'arildi",lo:"Shig'iw",
    sp:"shig'in boldi",lf:"qaldi",ex:"asti!",le:"limiti asti!",bw:"Budjettin' 90% sarplandi!",
    be:"Budjet asip ketti!",xa:"Shig'is qosildi",da:"Kirim qosildi",ma:"Maqset qosildi",
    od:"Tek o'zin'izdin' jazg'anin'izdi o'shire alasiz",fa:"Barlik maydanlardi toldirin'",
    ea:"Summa kiritin'",ec:"Tug'ri san kiritin'",ee:"Bul email dizimde bar",
    ue:"Paydalaniwshi tabilmadi",we:"Parol qa'te",ffe:"Bunday oila kodi tabilmadi",
    fc3:"Oila jaratildi!",jf2:"Oilag'a qosildin'iz!",wc:"Xush keldin'iz",sch:"Izlew...",
    res:"Na'tiyjeler",nf2:"Tabilmadi",nr:"Hali jazba joq",l7:"Song'i 7 ku'n",l6:"Ayliq shig'islar",
    bc:"Bul aydag'i kategoriyalar",hm:"Ku'nlik belsendilik (30 ku'n)",st:"Ayliq ko'rsetkishler",
    ad:"Ortasha ku'nlik",ir:"Kirim/Shig'is",bs:"Budjet u'nemlendi",rc:"Jazbalar sani",
    rates:"Valyuta kurslari",rSub:"Orayliq bank kursi",ldd:"Ju'klenbekte...",all:"Barlig'i",
    ed:"Shig'is taqsimati",isr:"Kirim derekleri",bm:"Ag'zalar boyinsha",
    aa:"Paydali qarjiliq ma'sla'hat",an:"Talqilaw...",na:"Jan'a ma'sla'hat",sv:"Saqlaw",am:"Qosiw",
    ach:"Maqsetke eristin'iz!",rem:"Qalg'an",tp:"Pul qosiw",mr:"ayliq esabati",cn:"Biykar etiw",
    shaxsiy:"Shaxsey mag'lu'matlar",ilovaS:"Ilova sozlamalari",xav:"Qa'wipsizlik",
    qol:"Qollap-quvvatlaw",ver:"Ilova versiyasi",til:"Interfeys tili",mavzu:"Ilova mavzusi",
    kunduzi:"Ku'ndizgi",tungi:"Tu'ngi",pin:"PIN kodti o'zgeris",barmoq:"Barmoq izi menen kiriw",
    tgBot:"Rasmiy Telegram bot",faq:"Ko'p soralatug'in sorawlar",qoshimcha:"QOS'IMCHA"},
};
