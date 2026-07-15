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

// 7 tilni to'liq qo'llab-quvvatlaydigan tarjima helper
const L = (lg, uzVal, ruVal, enVal, kkVal, kyVal, tgVal, qrVal) => {
  const map = { uz: uzVal, ru: ruVal, en: enVal, kk: kkVal, ky: kyVal, tg: tgVal, qr: qrVal };
  return map[lg] !== undefined ? map[lg] : uzVal;
};

// ── Yosh guruhlari va offline tavsiyalar bazasi ──────────────
export const AGE_GROUPS = [
  {
    id: "g57", min: 5, max: 7, baseReward: 2000,
    uz: "5–7 yosh: o'yin orqali o'rganish", ru: "5–7 лет: обучение через игру", en: "Age 5–7: learning through play",
    kk: "5–7 жас: ойын арқылы үйрену", ky: "5–7 жаш: оюн аркылуу үйрөнүү", tg: "5–7 сола: омӯзиш тавассути бозӣ", qr: "5–7 jas: oyın arqalı úyreniw",
    items: [
      { id: "oyinchoq", presetId: "oyinchoq", e: "🧸",
        uz: "O'yinchoqlarni yig'ish", ru: "Уборка игрушек", en: "Tidy toys", kk: "Ойыншықтарды жинау", ky: "Оюнчуктарды жыйноо", tg: "Ҷамъ кардани бозичаҳо", qr: "Oyınshıqlardı jıynaw",
        ruz: "Uy yig'ishtirish", rru: "Уборка дома", ren: "Tidying up", rkk: "Үй жинау", rky: "Үй жыйноо", rtg: "Тозакунии хона", rqr: "Úy jıynaw" },
      { id: "orin",     presetId: "orin",     e: "🛏️",
        uz: "O'rinni o'zi yig'ish", ru: "Заправлять постель самому", en: "Make the bed", kk: "Төсекті өзі жинау", ky: "Керебетти өзү жыйноо", tg: "Мураттаб кардани кати худ", qr: "Tósekti óziniń jıynawı",
        ruz: "Mustaqillik boshlanishi", rru: "Начало самостоятельности", ren: "First independence", rkk: "Дербестіктің басталуы", rky: "Көз карандысыздыктын башталышы", rtg: "Оғози мустақилият", rqr: "Ǵárezsizliktiń baslanıwı" },
      { id: "harf",     presetId: null,       e: "🔤",
        uz: "Harflarni o'rganish (10 daqiqa)", ru: "Учить буквы (10 минут)", en: "Learn letters (10 min)", kk: "Әріптерді үйрену (10 минут)", ky: "Тамгаларды үйрөнүү (10 мүнөт)", tg: "Омӯхтани ҳарфҳо (10 дақиқа)", qr: "Áriplerdi úyreniw (10 minut)",
        ruz: "Harflar", rru: "Буквы", ren: "Letters", rkk: "Әріптер", rky: "Тамгалар", rtg: "Ҳарфҳо", rqr: "Áripler" },
      { id: "rasm",     presetId: "rasm",     e: "🎨",
        uz: "Rasm chizish", ru: "Рисование", en: "Drawing", kk: "Сурет салу", ky: "Сүрөт тартуу", tg: "Расмкашӣ", qr: "Suwret siziw",
        ruz: "O'yin orqali o'rganish", rru: "Обучение через игру", ren: "Play-learning", rkk: "Ойын арқылы үйрену", rky: "Оюн аркылуу үйрөнүү", rtg: "Омӯзиш тавассути бозӣ", rqr: "Oyın arqalı úyreniw" },
      { id: "gul",      presetId: "gul",      e: "🌱",
        uz: "Gullarni sug'orish", ru: "Полив цветов", en: "Water plants", kk: "Гүлдерді суару", ky: "Гүлдөрдү сугаруу", tg: "Обдиҳии гулҳо", qr: "Gúllerdi suwlaw",
        ruz: "Uy yumushi", rru: "Домашняя работа", ren: "Home chore", rkk: "Үй жұмысы", rky: "Үй жумушу", rtg: "Кори хонагӣ", rqr: "Úy isi" },
      { id: "sanash",   presetId: null,       e: "🎲",
        uz: "O'yin orqali sanashni o'rganish", ru: "Учиться считать через игру", en: "Counting through play", kk: "Ойын арқылы санауды үйрену", ky: "Оюн аркылуу саноону үйрөнүү", tg: "Омӯхтани ҳисоб тавассути бозӣ", qr: "Oyın arqalı sanawdı úyreniw",
        ruz: "O'yin orqali o'rganish", rru: "Обучение через игру", ren: "Play-learning", rkk: "Ойын арқылы үйрену", rky: "Оюн аркылуу үйрөнүү", rtg: "Омӯзиш тавассути бозӣ", rqr: "Oyın arqalı úyreniw" },
    ],
  },
  {
    id: "g810", min: 8, max: 10, baseReward: 5000,
    uz: "8–10 yosh: kitob, sport, mustaqillik", ru: "8–10 лет: книги, спорт, самостоятельность", en: "Age 8–10: books, sport, independence",
    kk: "8–10 жас: кітап, спорт, дербестік", ky: "8–10 жаш: китеп, спорт, көз карандысыздык", tg: "8–10 сола: китоб, варзиш, мустақилият", qr: "8–10 jas: kitap, sport, ǵárezsizlik",
    items: [
      { id: "kitob",  presetId: "kitob",  e: "📚",
        uz: "Kitob o'qish (20 daqiqa)", ru: "Чтение книги (20 минут)", en: "Read a book (20 min)", kk: "Кітап оқу (20 минут)", ky: "Китеп окуу (20 мүнөт)", tg: "Хондани китоб (20 дақиқа)", qr: "Kitap oqıw (20 minut)",
        ruz: "Kitob", rru: "Чтение", ren: "Reading", rkk: "Оқу", rky: "Окуу", rtg: "Хониш", rqr: "Oqıw" },
      { id: "sport",  presetId: "sport",  e: "🚴",
        uz: "Sport bilan shug'ullanish", ru: "Заниматься спортом", en: "Do some exercise", kk: "Спортпен айналысу", ky: "Спорт менен алектенүү", tg: "Машғул шудан бо варзиш", qr: "Sport penen shuǵıllanıw",
        ruz: "Sport", rru: "Спорт", ren: "Sport", rkk: "Спорт", rky: "Спорт", rtg: "Варзиш", rqr: "Sport" },
      { id: "sumka",  presetId: null,     e: "🎒",
        uz: "Maktab sumkasini o'zi tayyorlash", ru: "Самому собирать школьный портфель", en: "Pack own school bag", kk: "Мектеп сумкасын өзі дайындау", ky: "Мектеп баштыгын өзү даярдоо", tg: "Омода кардани сумкаи мактабӣ", qr: "Mektep sumkasın óziniń tayarlawı",
        ruz: "Mustaqillik", rru: "Самостоятельность", ren: "Independence", rkk: "Дербестік", rky: "Көз карандысыздык", rtg: "Мустақилият", rqr: "Ǵárezsizlik" },
      { id: "idish",  presetId: "idish",  e: "🍽️",
        uz: "Idish yuvish", ru: "Мытьё посуды", en: "Wash the dishes", kk: "Ыдыс жуу", ky: "Идиш жуу", tg: "Шустани зарфҳо", qr: "Idıs juwıw",
        ruz: "Uy yumushi", rru: "Домашняя работа", ren: "Home chore", rkk: "Үй жұмысы", rky: "Үй жумушу", rtg: "Кори хонагӣ", rqr: "Úy isi" },
      { id: "soz",    presetId: "soz",    e: "🧠",
        uz: "5 ta yangi so'z yodlash", ru: "Выучить 5 новых слов", en: "Learn 5 new words", kk: "5 жаңа сөз жаттау", ky: "5 жаңы сөз үйрөнүү", tg: "Азёд кардани 5 калимаи нав", qr: "5 jańa sóz jattaw",
        ruz: "Bilim", rru: "Знания", ren: "Learning", rkk: "Білім", rky: "Билим", rtg: "Дониш", rqr: "Bilim" },
      { id: "xona",   presetId: "xona",   e: "🧹",
        uz: "Xonasini o'zi yig'ishtirish", ru: "Убирать свою комнату самому", en: "Clean own room", kk: "Өз бөлмесін өзі жинау", ky: "Өз бөлмөсүн өзү тазалоо", tg: "Тоза кардани хонаи худ", qr: "Óz bólmesin óziniń jıynawı",
        ruz: "Mustaqillik", rru: "Самостоятельность", ren: "Independence", rkk: "Дербестік", rky: "Көз карандысыздык", rtg: "Мустақилият", rqr: "Ǵárezsizlik" },
    ],
  },
  {
    id: "g1114", min: 11, max: 14, baseReward: 8000,
    uz: "11–14 yosh: mas'uliyat va vaqt", ru: "11–14 лет: ответственность и время", en: "Age 11–14: responsibility & time",
    kk: "11–14 жас: жауапкершілік және уақыт", ky: "11–14 жаш: жоопкерчилик жана убакыт", tg: "11–14 сола: масъулият ва вақт", qr: "11–14 jas: juwapkershilik hám waqıt",
    items: [
      { id: "reja",   presetId: null,    e: "🗓️",
        uz: "Haftalik uy ishlari rejasini tuzish", ru: "Составлять недельный план дел", en: "Plan weekly chores", kk: "Апталық үй ісі жоспарын құру", ky: "Жумалык үй иштери планын түзүү", tg: "Тартиб додани нақшаи ҳафтагии корҳои хонагӣ", qr: "Aptalıq úy isleri rejesin dúziw",
        ruz: "Mas'uliyat", rru: "Ответственность", ren: "Responsibility", rkk: "Жауапкершілік", rky: "Жоопкерчилик", rtg: "Масъулият", rqr: "Juwapkershilik" },
      { id: "jadval", presetId: null,    e: "⏰",
        uz: "Dars jadvalini o'zi boshqarish", ru: "Самому управлять расписанием учёбы", en: "Manage own study schedule", kk: "Сабақ кестесін өзі басқару", ky: "Сабак жадвалын өзү башкаруу", tg: "Идора кардани ҷадвали дарсҳо", qr: "Sabaq kestesin óziniń basqarıwı",
        ruz: "Vaqtni boshqarish", rru: "Управление временем", ren: "Time management", rkk: "Уақытты басқару", rky: "Убакытты башкаруу", rtg: "Идораи вақт", rqr: "Waqıttı basqarıw" },
      { id: "dokon",  presetId: "dokon", e: "🛒",
        uz: "Do'kondan xarid qilib kelish", ru: "Сходить за покупками в магазин", en: "Do a grocery run", kk: "Дүкеннен сатып алып келу", ky: "Дүкөндөн сатып алып келүү", tg: "Харид аз мағоза", qr: "Dúkennen satıp alıp keliw",
        ruz: "Mas'uliyat", rru: "Ответственность", ren: "Responsibility", rkk: "Жауапкершілік", rky: "Жоопкерчилик", rtg: "Масъулият", rqr: "Juwapkershilik" },
      { id: "axlat",  presetId: "axlat", e: "🚮",
        uz: "Axlatni chiqarish", ru: "Вынос мусора", en: "Take out the trash", kk: "Қоқысты шығару", ky: "Таштанды чыгаруу", tg: "Бароварии партов", qr: "Qoqıstı shıǵarıw",
        ruz: "Uy yumushi", rru: "Домашняя работа", ren: "Home chore", rkk: "Үй жұмысы", rky: "Үй жумушу", rtg: "Кори хонагӣ", rqr: "Úy isi" },
      { id: "uka",    presetId: null,    e: "🤝",
        uz: "Uka-singlisiga dars tayyorlashda yordam", ru: "Помочь брату/сестре с уроками", en: "Help sibling with homework", kk: "Іні-қарындасына сабақ дайындауда көмек", ky: "Ини-сиңдисине сабак даярдоодо жардам", tg: "Кӯмак ба хоҳар/бародар дар омодагӣ ба дарс", qr: "Bawırı-sіńlisine sabaq tayarlawda járdem",
        ruz: "Mas'uliyat", rru: "Ответственность", ren: "Responsibility", rkk: "Жауапкершілік", rky: "Жоопкерчилик", rtg: "Масъулият", rqr: "Juwapkershilik" },
      { id: "kir",    presetId: "kir",   e: "🧺",
        uz: "Kir yuvishga yordam berish", ru: "Помочь со стиркой", en: "Help with laundry", kk: "Кір жууға көмектесу", ky: "Кир жуууга жардам берүү", tg: "Кӯмак дар шустушӯй", qr: "Kir juwıwǵa járdem beriw",
        ruz: "Uy yumushi", rru: "Домашняя работа", ren: "Home chore", rkk: "Үй жұмысы", rky: "Үй жумушу", rtg: "Кори хонагӣ", rqr: "Úy isi" },
    ],
  },
  {
    id: "g15", min: 15, max: 120, baseReward: 12000,
    uz: "15+ yosh: oila, byudjet, reja", ru: "15+ лет: семья, бюджет, планирование", en: "Age 15+: family, budget, planning",
    kk: "15+ жас: отбасы, бюджет, жоспарлау", ky: "15+ жаш: үй-бүлө, бюджет, пландоо", tg: "15+ сола: оила, буҷет, нақшагирӣ", qr: "15+ jas: shańaraq, byudjet, rejelestiriw",
    items: [
      { id: "ovqat",  presetId: "ovqat", e: "🍳",
        uz: "Oilaga ovqat tayyorlash", ru: "Приготовить еду для семьи", en: "Cook a family meal", kk: "Отбасына тамақ дайындау", ky: "Үй-бүлөгө тамак жасоо", tg: "Пухтани хӯрок барои оила", qr: "Shańaraq ushın tamaq tayarlaw",
        ruz: "Oilaga yordam", rru: "Помощь семье", ren: "Helping family", rkk: "Отбасыға көмек", rky: "Үй-бүлөгө жардам", rtg: "Кӯмак ба оила", rqr: "Shańaraqqa járdem" },
      { id: "byudjet",presetId: null,    e: "💰",
        uz: "Haftalik xarajatlarini yozib borish", ru: "Записывать недельные расходы", en: "Track weekly spending", kk: "Апталық шығындарды жазып бару", ky: "Жумалык чыгымдарды жазып туруу", tg: "Қайд кардани хароҷоти ҳафтагӣ", qr: "Aptalıq shıǵınlardı jazıp barıw",
        ruz: "Byudjet", rru: "Бюджет", ren: "Budget", rkk: "Бюджет", rky: "Бюджет", rtg: "Буҷет", rqr: "Byudjet" },
      { id: "oyreja", presetId: null,    e: "🗓️",
        uz: "Oylik shaxsiy reja tuzish", ru: "Составлять личный план на месяц", en: "Make a monthly plan", kk: "Айлық жеке жоспар құру", ky: "Айлык жеке план түзүү", tg: "Тартиб додани нақшаи шахсии моҳона", qr: "Aylıq jеke reje dúziw",
        ruz: "Rejalashtirish", rru: "Планирование", ren: "Planning", rkk: "Жоспарлау", rky: "Пландоо", rtg: "Нақшагирӣ", rqr: "Rejelestiriw" },
      { id: "buvi",   presetId: "buvi",  e: "🤲",
        uz: "Kattalarga yordam berish", ru: "Помочь старшим", en: "Help the elders", kk: "Үлкендерге көмек беру", ky: "Улууларга жардам берүү", tg: "Кӯмак ба калонсолон", qr: "Úlkenlerge járdem beriw",
        ruz: "Oilaga yordam", rru: "Помощь семье", ren: "Helping family", rkk: "Отбасыға көмек", rky: "Үй-бүлөгө жардам", rtg: "Кӯмак ба оила", rqr: "Shańaraqqa járdem" },
      { id: "tejash", presetId: null,    e: "🎯",
        uz: "Tejash maqsadini qo'yish", ru: "Поставить цель накопления", en: "Set a savings goal", kk: "Жинақ мақсатын қою", ky: "Топтоо максатын коюу", tg: "Гузоштани ҳадафи пасандоз", qr: "Jınaq maqsetin qoyıw",
        ruz: "Byudjet", rru: "Бюджет", ren: "Budget", rkk: "Бюджет", rky: "Бюджет", rtg: "Буҷет", rqr: "Byudjet" },
      { id: "xarid",  presetId: null,    e: "📝",
        uz: "Oila xaridlar ro'yxatini tuzish", ru: "Составить список покупок семьи", en: "Make the family shopping list", kk: "Отбасы сатып алулар тізімін құру", ky: "Үй-бүлөнүн сатып алуулар тизмесин түзүү", tg: "Тартиб додани рӯйхати хариди оила", qr: "Shańaraq satıp alıwlar dizimin dúziw",
        ruz: "Rejalashtirish", rru: "Планирование", ren: "Planning", rkk: "Жоспарлау", rky: "Пландоо", rtg: "Нақшагирӣ", rqr: "Rejelestiriw" },
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

// Element ichidan berilgan tilga mos sarlavha/sababni oladi (uz — zaxira)
const titleOf = (it, lg) => L(lg, it.uz, it.ru, it.en, it.kk, it.ky, it.tg, it.qr);
const reasonOf = (it, lg) => L(lg, it.ruz, it.rru, it.ren, it.rkk, it.rky, it.rtg, it.rqr);

/**
 * Yoshga mos, tarix bilan boyitilgan tavsiyalar.
 * @returns { age, group, items: [{ id, presetId, e, title, reason, reward }] }
 */
export const recommendTasks = ({ kid, vazifalar = [], lg = "uz", count = 4, now = new Date() }) => {
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
    .map(it => ({ ...it, title: titleOf(it, lg), reason: reasonOf(it, lg), mastered: (doneCount[nm(titleOf(it, lg))] || 0) >= 2 }))
    .filter(it => !activeTitles.has(nm(it.title)));

  const fresh = pool.filter(it => !it.mastered);
  const mastered = pool.filter(it => it.mastered);

  // Kunlik rotatsiya — har kuni boshqa boshlanish nuqtasi
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const rot = (arr) => arr.length ? arr.map((_, i) => arr[(i + dayOfYear) % arr.length]) : arr;

  const items = [...rot(fresh), ...mastered].slice(0, count).map(it => ({
    id: it.id, presetId: it.presetId, e: it.e, title: it.title,
    reason: it.mastered ? L(lg, "Takrorlash", "Повтор", "Repeat", "Қайталау", "Кайталоо", "Такрор", "Qaytalaw") : it.reason,
    reward,
  }));

  return { age, group, items };
};
