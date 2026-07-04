// ═══════════════════════════════════════════════════════════
//  CONSTANTS — barcha konstantalar shu yerda
// ═══════════════════════════════════════════════════════════

export const MK = d => d
  ? { bg:"#090e1c", sur:"#111827", surH:"#192035", bor:"#2b3852", ac:"#6366f1", ac2:"#818cf8", gr:"#10b981", rd:"#ef4444", am:"#f59e0b", t1:"#FFFFFF", t2:"#B9C3D4", t3:"#9CA3AF", dark:true }
  : { bg:"#eef2ff", sur:"#ffffff", surH:"#f5f7ff", bor:"#e2e8f0", ac:"#6366f1", ac2:"#4f46e5", gr:"#059669", rd:"#dc2626", am:"#d97706", t1:"#0f172a", t2:"#64748b", t3:"#94a3b8", dark:false };

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
  {emoji:"💻",uz:"Kompyuter / Noutbuk", ru:"Компьютер",       en:"Computer",     rang:"#0ea5e9"},
  {emoji:"🛠️",uz:"Uy ta'miri",         ru:"Ремонт",           en:"Home repair",  rang:"#84cc16"},
  {emoji:"💎",uz:"Tilla taqinchoq",     ru:"Украшения",       en:"Jewelry",      rang:"#eab308"},
  {emoji:"🐑",uz:"Qurbonlik",           ru:"Курбан",           en:"Qurbani",      rang:"#a855f7"},
  {emoji:"🏍️",uz:"Mototsikl",          ru:"Мотоцикл",       en:"Motorcycle",   rang:"#f43f5e"},
  {emoji:"🎉",uz:"Bayram / Marosim",    ru:"Праздник",         en:"Celebration",  rang:"#22c55e"},
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
  {emoji:"⌚",uz:"Aqlli soat",            ru:"Смарт-часы",       en:"Smart watch",  rang:"#0ea5e9"},
  {emoji:"🛹",uz:"Skeytbord",            ru:"Скейтборд",        en:"Skateboard",   rang:"#84cc16"},
  {emoji:"🎸",uz:"Gitara",               ru:"Гитара",            en:"Guitar",       rang:"#f43f5e"},
  {emoji:"🐹",uz:"Uy hayvoni",           ru:"Питомец",          en:"Pet",          rang:"#eab308"},
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

export const RELATIONS = [
  {id:"ota",     emoji:"👨", uz:"Ota",          ru:"Отец",           en:"Father"},
  {id:"ona",     emoji:"👩", uz:"Ona",          ru:"Мать",           en:"Mother"},
  {id:"turmush", emoji:"💑", uz:"Turmush o'rtoq",ru:"Супруг(а)",     en:"Spouse"},
  {id:"farzand", emoji:"👦", uz:"Farzand",       ru:"Ребёнок",       en:"Child"},
  {id:"aka",     emoji:"👨", uz:"Aka",           ru:"Старший брат",  en:"Older brother"},
  {id:"uka",     emoji:"👦", uz:"Uka",           ru:"Младший брат",  en:"Younger brother"},
  {id:"opa",     emoji:"👩", uz:"Opa",           ru:"Старшая сестра",en:"Older sister"},
  {id:"singil",  emoji:"👧", uz:"Singil",        ru:"Младшая сестра",en:"Younger sister"},
  {id:"boshqa",  emoji:"👤", uz:"Boshqa",        ru:"Другое",        en:"Other"},
];

export const ADMIN_TEL = "937414866";
// XAVFSIZLIK: admin Firebase Auth UID'lari. Rules ham, klient ham SHUNI tekshiradi.
// (Telefon raqami emas — u soxtalashtirilishi mumkin. UID Firebase Auth'dan keladi.)
// Admin sifatida kirgan hisobingiz UID'sini shu ro'yxatga qo'shing:
export const ADMIN_UIDS = [
  // "SIZNING_ADMIN_FIREBASE_UID"
];

export const FAQS = {
  uz:[
    {q:"Oila kodi nima?",    a:"Oilangizga boshqa a'zolarni qo'shish uchun ishlatiladigan maxsus kod. Profil > Shaxsiy ma'lumotlar bo'limida topasiz."},
    {q:"Valyuta kurslari qayerdan?", a:"O'zbekiston Markaziy Banki rasmiy saytidan olinadi."},
    {q:"AI maslahat qanday ishlaydi?", a:"AI oylik daromad va xarajatlaringizni tahlil qilib, moliyaviy maslahat beradi."},
    {q:"PIN kod nima uchun?", a:"Ilovaga kirish xavfsizligini ta'minlash uchun 4 raqamli PIN kod o'rnatishingiz mumkin."},
  ],
  ru:[
    {q:"Что такое код семьи?", a:"Уникальный код для добавления членов семьи."},
    {q:"Откуда берутся курсы?", a:"Данные Центрального банка Узбекистана."},
    {q:"Как работает AI совет?", a:"AI анализирует доходы и расходы и даёт рекомендации."},
    {q:"Зачем PIN код?", a:"Для безопасного входа в приложение."},
  ],
  en:[
    {q:"What is the family code?", a:"A code to add family members. Find it in Profile > Personal info."},
    {q:"Where do exchange rates come from?", a:"From the Central Bank of Uzbekistan."},
    {q:"How does AI advice work?", a:"AI analyzes your income/expenses and gives tips."},
    {q:"What is the PIN code for?", a:"To secure access to the app."},
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
    aa:"AI Moliyaviy maslahat",an:"Tahlil...",na:"Yangi maslahat",sv:"Saqlash",am:"Qo'shish",
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
    aa:"AI Финансовый совет",an:"Анализируется...",na:"Новый совет",sv:"Сохранить",am:"Добавить",
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
    aa:"AI Financial advice",an:"Analyzing...",na:"New advice",sv:"Save",am:"Add",
    ach:"Goal achieved!",rem:"Remaining",tp:"Add funds",mr:"monthly report",cn:"Cancel",
    shaxsiy:"Personal info",ilovaS:"App settings",xav:"Security",qol:"Support",
    ver:"Version",til:"Language",mavzu:"Theme",kunduzi:"Light",tungi:"Dark",
    pin:"Change PIN",barmoq:"Fingerprint",tgBot:"Telegram Bot",faq:"FAQ",qoshimcha:"ADDITIONAL"},
};
