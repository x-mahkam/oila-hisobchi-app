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

const pick = (obj, lg) => obj[lg] || obj.uz;

const REPEAT_LABEL = { uz: "Takrorlash", en: "Repeat", ru: "Повтор", kk: "Қайталау", ky: "Кайталоо", tg: "Такрор", qr: "Qaytalaw" };

// ── Yosh guruhlari va offline tavsiyalar bazasi ──────────────
export const AGE_GROUPS = [
  {
    id: "g57", min: 5, max: 7, baseReward: 2000,
    label: { uz: "5–7 yosh: o'yin orqali o'rganish", en: "Age 5–7: learning through play", ru: "5–7 лет: обучение через игру", kk: "5–7 жас: ойын арқылы үйрену", ky: "5–7 жаш: оюн аркылуу үйрөнүү", tg: "5–7 сола: омӯзиш тавассути бозӣ", qr: "5–7 jas: oyın arqalı úyreniw" },
    items: [
      { id: "oyinchoq", presetId: "oyinchoq", e: "🧸",
        title: { uz: "O'yinchoqlarni yig'ish", en: "Tidy toys", ru: "Убрать игрушки", kk: "Ойыншықтарды жинау", ky: "Оюнчуктарды жыйноо", tg: "Ҷамъ кардани бозичаҳо", qr: "Oyınshıqlardı jıynaw" },
        reason: { uz: "Uy yig'ishtirish", en: "Tidying up", ru: "Уборка дома", kk: "Үй жинау", ky: "Үй жыйноо", tg: "Тозакории хона", qr: "Úy tazalaw" } },
      { id: "orin", presetId: "orin", e: "🛏️",
        title: { uz: "O'rinni o'zi yig'ish", en: "Make the bed", ru: "Самостоятельно застилать кровать", kk: "Төсекті өзі жинау", ky: "Керебетти өзү жыйноо", tg: "Худ ҷо кардани кат", qr: "Kárwatti óziniń jıynawı" },
        reason: { uz: "Mustaqillik boshlanishi", en: "First independence", ru: "Начало самостоятельности", kk: "Дербестіктің басталуы", ky: "Өз алдынчалыктын башталышы", tg: "Оғози мустақилият", qr: "Ǵárezsizliktiń baslanıwı" } },
      { id: "harf", presetId: null, e: "🔤",
        title: { uz: "Harflarni o'rganish (10 daqiqa)", en: "Learn letters (10 min)", ru: "Изучение букв (10 минут)", kk: "Әріптерді үйрену (10 минут)", ky: "Тамгаларды үйрөнүү (10 мүнөт)", tg: "Омӯзиши ҳарфҳо (10 дақиқа)", qr: "Áriplerdi úyreniw (10 minut)" },
        reason: { uz: "Harflar", en: "Letters", ru: "Буквы", kk: "Әріптер", ky: "Тамгалар", tg: "Ҳарфҳо", qr: "Ápipler" } },
      { id: "rasm", presetId: "rasm", e: "🎨",
        title: { uz: "Rasm chizish", en: "Drawing", ru: "Рисование", kk: "Сурет салу", ky: "Сүрөт тартуу", tg: "Расмкашӣ", qr: "Súwret salıw" },
        reason: { uz: "O'yin orqali o'rganish", en: "Play-learning", ru: "Обучение через игру", kk: "Ойын арқылы үйрену", ky: "Оюн аркылуу үйрөнүү", tg: "Омӯзиш тавассути бозӣ", qr: "Oyın arqalı úyreniw" } },
      { id: "gul", presetId: "gul", e: "🌱",
        title: { uz: "Gullarni sug'orish", en: "Water plants", ru: "Поливать цветы", kk: "Гүлдерді суару", ky: "Гүлдөрдү сугаруу", tg: "Обёрӣ кардани гулҳо", qr: "Gúllerdi suwǵarıw" },
        reason: { uz: "Uy yumushi", en: "Home chore", ru: "Домашние дела", kk: "Үй жұмысы", ky: "Үй жумушу", tg: "Кори хона", qr: "Úy isi" } },
      { id: "sanash", presetId: null, e: "🎲",
        title: { uz: "O'yin orqali sanashni o'rganish", en: "Counting through play", ru: "Учиться считать через игру", kk: "Ойын арқылы санауды үйрену", ky: "Оюн аркылуу саноону үйрөнүү", tg: "Омӯзиши ҳисоб тавассути бозӣ", qr: "Oyın arqalı sanawdı úyreniw" },
        reason: { uz: "O'yin orqali o'rganish", en: "Play-learning", ru: "Обучение через игру", kk: "Ойын арқылы үйрену", ky: "Оюн аркылуу үйрөнүү", tg: "Омӯзиш тавассути бозӣ", qr: "Oyın arqalı úyreniw" } },
    ],
  },
  {
    id: "g810", min: 8, max: 10, baseReward: 5000,
    label: { uz: "8–10 yosh: kitob, sport, mustaqillik", en: "Age 8–10: books, sport, independence", ru: "8–10 лет: книги, спорт, самостоятельность", kk: "8–10 жас: кітап, спорт, дербестік", ky: "8–10 жаш: китеп, спорт, өз алдынчалык", tg: "8–10 сола: китоб, варзиш, мустақилият", qr: "8–10 jas: kitap, sport, ǵárezsizlik" },
    items: [
      { id: "kitob", presetId: "kitob", e: "📚",
        title: { uz: "Kitob o'qish (20 daqiqa)", en: "Read a book (20 min)", ru: "Чтение книги (20 минут)", kk: "Кітап оқу (20 минут)", ky: "Китеп окуу (20 мүнөт)", tg: "Хондани китоб (20 дақиқа)", qr: "Kitap oqıw (20 minut)" },
        reason: { uz: "Kitob", en: "Reading", ru: "Книга", kk: "Кітап", ky: "Китеп", tg: "Китоб", qr: "Kitap" } },
      { id: "sport", presetId: "sport", e: "🚴",
        title: { uz: "Sport bilan shug'ullanish", en: "Do some exercise", ru: "Заниматься спортом", kk: "Спортпен шұғылдану", ky: "Спорт менен алектенүү", tg: "Бо варзиш машғул шудан", qr: "Sport penen shuǵıllanıw" },
        reason: { uz: "Sport", en: "Sport", ru: "Спорт", kk: "Спорт", ky: "Спорт", tg: "Варзиш", qr: "Sport" } },
      { id: "sumka", presetId: null, e: "🎒",
        title: { uz: "Maktab sumkasini o'zi tayyorlash", en: "Pack own school bag", ru: "Самостоятельно собирать школьный портфель", kk: "Мектеп сумкасын өзі дайындау", ky: "Мектеп сумкасын өзү даярдоо", tg: "Худ омода кардани сумкаи мактабӣ", qr: "Mektep sumkasın óziniń tayarlawı" },
        reason: { uz: "Mustaqillik", en: "Independence", ru: "Самостоятельность", kk: "Дербестік", ky: "Өз алдынчалык", tg: "Мустақилият", qr: "Ǵárezsizlik" } },
      { id: "idish", presetId: "idish", e: "🍽️",
        title: { uz: "Idish yuvish", en: "Wash the dishes", ru: "Мыть посуду", kk: "Ыдыс жуу", ky: "Идиш жуу", tg: "Шустани зарфҳо", qr: "Idıs-tabaq juwıw" },
        reason: { uz: "Uy yumushi", en: "Home chore", ru: "Домашние дела", kk: "Үй жұмысы", ky: "Үй жумушу", tg: "Кори хона", qr: "Úy isi" } },
      { id: "soz", presetId: "soz", e: "🧠",
        title: { uz: "5 ta yangi so'z yodlash", en: "Learn 5 new words", ru: "Выучить 5 новых слов", kk: "5 жаңа сөз жаттау", ky: "5 жаңы сөз жаттоо", tg: "Азёд кардани 5 калимаи нав", qr: "5 jańa sóz jattaw" },
        reason: { uz: "Bilim", en: "Learning", ru: "Знания", kk: "Білім", ky: "Билим", tg: "Дониш", qr: "Bilim" } },
      { id: "xona", presetId: "xona", e: "🧹",
        title: { uz: "Xonasini o'zi yig'ishtirish", en: "Clean own room", ru: "Самостоятельно убирать комнату", kk: "Бөлмесін өзі жинау", ky: "Бөлмөсүн өзү тазалоо", tg: "Худ тоза кардани ҳуҷра", qr: "Bólmesin óziniń tazalawı" },
        reason: { uz: "Mustaqillik", en: "Independence", ru: "Самостоятельность", kk: "Дербестік", ky: "Өз алдынчалык", tg: "Мустақилият", qr: "Ǵárezsizlik" } },
    ],
  },
  {
    id: "g1114", min: 11, max: 14, baseReward: 8000,
    label: { uz: "11–14 yosh: mas'uliyat va vaqt", en: "Age 11–14: responsibility & time", ru: "11–14 лет: ответственность и время", kk: "11–14 жас: жауапкершілік және уақыт", ky: "11–14 жаш: жоопкерчилик жана убакыт", tg: "11–14 сола: масъулият ва вақт", qr: "11–14 jas: juwapkershilik hám waqıt" },
    items: [
      { id: "reja", presetId: null, e: "🗓️",
        title: { uz: "Haftalik uy ishlari rejasini tuzish", en: "Plan weekly chores", ru: "Составить недельный план домашних дел", kk: "Апталық үй жұмыстары жоспарын құру", ky: "Жумалык үй иштери планын түзүү", tg: "Тартиб додани нақшаи ҳафтагии корҳои хона", qr: "Aptalıq úy isleri jobasın dúziw" },
        reason: { uz: "Mas'uliyat", en: "Responsibility", ru: "Ответственность", kk: "Жауапкершілік", ky: "Жоопкерчилик", tg: "Масъулият", qr: "Juwapkershilik" } },
      { id: "jadval", presetId: null, e: "⏰",
        title: { uz: "Dars jadvalini o'zi boshqarish", en: "Manage own study schedule", ru: "Самостоятельно управлять расписанием уроков", kk: "Сабақ кестесін өзі басқару", ky: "Сабак кестесин өзү башкаруу", tg: "Худ идора кардани ҷадвали дарсҳо", qr: "Sabaq kestesin óziniń basqarıwı" },
        reason: { uz: "Vaqtni boshqarish", en: "Time management", ru: "Управление временем", kk: "Уақытты басқару", ky: "Убакытты башкаруу", tg: "Идоракунии вақт", qr: "Waqıttı basqarıw" } },
      { id: "dokon", presetId: "dokon", e: "🛒",
        title: { uz: "Do'kondan xarid qilib kelish", en: "Do a grocery run", ru: "Сходить за покупками в магазин", kk: "Дүкеннен сауда жасап келу", ky: "Дүкөндөн азык-түлүк алып келүү", tg: "Харид кардан аз мағоза", qr: "Dúkennen alıp shıǵıw" },
        reason: { uz: "Mas'uliyat", en: "Responsibility", ru: "Ответственность", kk: "Жауапкершілік", ky: "Жоопкерчилик", tg: "Масъулият", qr: "Juwapkershilik" } },
      { id: "axlat", presetId: "axlat", e: "🚮",
        title: { uz: "Axlatni chiqarish", en: "Take out the trash", ru: "Выносить мусор", kk: "Қоқысты шығару", ky: "Таштанды чыгаруу", tg: "Бароварда партофтани ахлот", qr: "Qоqıstı shıǵarıw" },
        reason: { uz: "Uy yumushi", en: "Home chore", ru: "Домашние дела", kk: "Үй жұмысы", ky: "Үй жумушу", tg: "Кори хона", qr: "Úy isi" } },
      { id: "uka", presetId: null, e: "🤝",
        title: { uz: "Uka-singlisiga dars tayyorlashda yordam", en: "Help sibling with homework", ru: "Помочь брату/сестре с домашним заданием", kk: "Іні-сіңлісіне сабақ дайындауға көмек", ky: "Ини-сиңдисине сабак даярдоого жардам", tg: "Кӯмак ба хоҳар/бародар дар тайёр кардани дарс", qr: "Ininiń/sińlisiniń sabaǵın tayarlawǵa járdem" },
        reason: { uz: "Mas'uliyat", en: "Responsibility", ru: "Ответственность", kk: "Жауапкершілік", ky: "Жоопкерчилик", tg: "Масъулият", qr: "Juwapkershilik" } },
      { id: "kir", presetId: "kir", e: "🧺",
        title: { uz: "Kir yuvishga yordam berish", en: "Help with laundry", ru: "Помогать со стиркой", kk: "Кір жууға көмектесу", ky: "Кир жууга жардам берүү", tg: "Кӯмак дар шустани либос", qr: "Kir juwıwǵa járdem beriw" },
        reason: { uz: "Uy yumushi", en: "Home chore", ru: "Домашние дела", kk: "Үй жұмысы", ky: "Үй жумушу", tg: "Кори хона", qr: "Úy isi" } },
    ],
  },
  {
    id: "g15", min: 15, max: 120, baseReward: 12000,
    label: { uz: "15+ yosh: oila, byudjet, reja", en: "Age 15+: family, budget, planning", ru: "15+ лет: семья, бюджет, планирование", kk: "15+ жас: отбасы, бюджет, жоспарлау", ky: "15+ жаш: үй-бүлө, бюджет, пландоо", tg: "15+ сола: оила, буҷет, нақшакашӣ", qr: "15+ jas: shańaraq, býudjet, jobalastırıw" },
    items: [
      { id: "ovqat", presetId: "ovqat", e: "🍳",
        title: { uz: "Oilaga ovqat tayyorlash", en: "Cook a family meal", ru: "Приготовить еду для семьи", kk: "Отбасына тамақ дайындау", ky: "Үй-бүлөгө тамак даярдоо", tg: "Тайёр кардани хӯрок барои оила", qr: "Shańaraqqa tamaq tayarlaw" },
        reason: { uz: "Oilaga yordam", en: "Helping family", ru: "Помощь семье", kk: "Отбасына көмек", ky: "Үй-бүлөгө жардам", tg: "Кӯмак ба оила", qr: "Shańaraqqa járdem" } },
      { id: "byudjet", presetId: null, e: "💰",
        title: { uz: "Haftalik xarajatlarini yozib borish", en: "Track weekly spending", ru: "Вести учёт недельных расходов", kk: "Апталық шығындарды жазып отыру", ky: "Жумалык чыгымдарды жазып туруу", tg: "Навиштани харҷҳои ҳафтагӣ", qr: "Aptalıq shıǵınlardı jazıp barıw" },
        reason: { uz: "Byudjet", en: "Budget", ru: "Бюджет", kk: "Бюджет", ky: "Бюджет", tg: "Буҷет", qr: "Býudjet" } },
      { id: "oyreja", presetId: null, e: "🗓️",
        title: { uz: "Oylik shaxsiy reja tuzish", en: "Make a monthly plan", ru: "Составить личный план на месяц", kk: "Айлық жеке жоспар құру", ky: "Айлык жеке план түзүү", tg: "Тартиб додани нақшаи шахсии моҳона", qr: "Aylıq sheksiy joba dúziw" },
        reason: { uz: "Rejalashtirish", en: "Planning", ru: "Планирование", kk: "Жоспарлау", ky: "Пландоо", tg: "Нақшакашӣ", qr: "Jobalastırıw" } },
      { id: "buvi", presetId: "buvi", e: "🤲",
        title: { uz: "Kattalarga yordam berish", en: "Help the elders", ru: "Помогать старшим", kk: "Үлкендерге көмектесу", ky: "Улууларга жардам берүү", tg: "Кӯмак ба калонсолон", qr: "Úlkenlerge járdem beriw" },
        reason: { uz: "Oilaga yordam", en: "Helping family", ru: "Помощь семье", kk: "Отбасына көмек", ky: "Үй-бүлөгө жардам", tg: "Кӯмак ба оила", qr: "Shańaraqqa járdem" } },
      { id: "tejash", presetId: null, e: "🎯",
        title: { uz: "Tejash maqsadini qo'yish", en: "Set a savings goal", ru: "Поставить цель накопления", kk: "Жинақ мақсатын қою", ky: "Топтоо максатын коюу", tg: "Гузоштани ҳадафи пасандоз", qr: "Jámgeriw maqsetin qoyıw" },
        reason: { uz: "Byudjet", en: "Budget", ru: "Бюджет", kk: "Бюджет", ky: "Бюджет", tg: "Буҷет", qr: "Býudjet" } },
      { id: "xarid", presetId: null, e: "📝",
        title: { uz: "Oila xaridlar ro'yxatini tuzish", en: "Make the family shopping list", ru: "Составить список покупок для семьи", kk: "Отбасы сатып алу тізімін құру", ky: "Үй-бүлөнүн сатып алуу тизмесин түзүү", tg: "Тартиб додани рӯйхати харидҳои оила", qr: "Shańaraq satıp alıw dizimin dúziw" },
        reason: { uz: "Rejalashtirish", en: "Planning", ru: "Планирование", kk: "Жоспарлау", ky: "Пландоо", tg: "Нақшакашӣ", qr: "Jobalastırıw" } },
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
 * @returns { age, group: { uz, en, ru, kk, ky, tg, qr }, items: [{ id, presetId, e, title, reason, reward }] }
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
    .map(it => ({ ...it, title: pick(it.title, lg), mastered: (doneCount[nm(pick(it.title, lg))] || 0) >= 2 }))
    .filter(it => !activeTitles.has(nm(it.title)));

  const fresh = pool.filter(it => !it.mastered);
  const mastered = pool.filter(it => it.mastered);

  // Kunlik rotatsiya — har kuni boshqa boshlanish nuqtasi
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const rot = (arr) => arr.length ? arr.map((_, i) => arr[(i + dayOfYear) % arr.length]) : arr;

  const items = [...rot(fresh), ...mastered].slice(0, count).map(it => ({
    id: it.id, presetId: it.presetId, e: it.e, title: it.title,
    reason: it.mastered ? pick(REPEAT_LABEL, lg) : pick(it.reason, lg),
    reward,
  }));

  return { age, group: pick(group.label, lg), items };
};
