// ─────────────────────────────────────────────────────────────
//  SMART BUDGET AI — i18n (uz / ru / en)
//  Sprint 3B. Barcha AI matnlari shu yerda; %d/%s almashtiriladi.
//  Goals moduliga tegmaslik uchun alohida namespace.
// ─────────────────────────────────────────────────────────────

const DICT = {
  // Card sarlavhalari
  cardHealth:    { uz: "Byudjet salomatligi",   ru: "Здоровье бюджета",     en: "Budget health" },
  cardForecast:  { uz: "Oylik prognoz",         ru: "Прогноз на месяц",     en: "Monthly forecast" },
  cardTrend:     { uz: "Xarajat tendensiyasi",  ru: "Тренд расходов",       en: "Expense trend" },
  cardSavings:   { uz: "Jamg'arma murabbiysi",  ru: "Коуч по накоплениям",  en: "Savings coach" },
  cardRisk:      { uz: "Xavf tahlili",          ru: "Анализ рисков",        en: "Risk analysis" },
  cardSummary:   { uz: "Oylik xulosa",          ru: "Итоги месяца",         en: "Monthly summary" },
  aiInsight:     { uz: "AI maslahati",          ru: "Совет ИИ",             en: "AI insight" },
  aiSummary:     { uz: "AI xulosa",             ru: "AI-итог",              en: "AI summary" },

  // Health darajalari
  lvlExcellent:  { uz: "Juda yaxshi",  ru: "Отлично",        en: "Excellent" },
  lvlAttention:  { uz: "E'tibor kerak", ru: "Нужно внимание", en: "Needs attention" },
  lvlRisk:       { uz: "Xavf mavjud",   ru: "Есть риск",      en: "At risk" },
  lvlCritical:   { uz: "Kritik",        ru: "Критично",       en: "Critical" },

  // Health omillari
  facSavings:    { uz: "Jamg'arma",  ru: "Накопления", en: "Savings" },
  facBudget:     { uz: "Byudjet",    ru: "Бюджет",     en: "Budget" },
  facDebt:       { uz: "Qarzlar",    ru: "Долги",      en: "Debts" },
  facGoals:      { uz: "Maqsadlar",  ru: "Цели",       en: "Goals" },
  facGood:       { uz: "yaxshi",     ru: "хорошо",     en: "good" },
  facMid:        { uz: "o'rtacha",   ru: "средне",     en: "fair" },
  facBad:        { uz: "zaif",       ru: "слабо",      en: "weak" },

  // Forecast
  fcSpend:       { uz: "Agar shu tezlikda davom etsangiz, oy oxirida %s xarajat qilasiz.",
                   ru: "Если продолжите в том же темпе, к концу месяца потратите %s.",
                   en: "At this pace, you'll spend %s by month end." },
  fcOver:        { uz: "Shu sur'atda byudjet limiti %d kun oldin tugaydi.",
                   ru: "При таком темпе лимит бюджета закончится на %d дн. раньше.",
                   en: "At this rate your budget runs out %d days early." },
  fcOk:          { uz: "Joriy sur'atda oyni byudjet ichida yakunlaysiz.",
                   ru: "При текущем темпе вы уложитесь в бюджет.",
                   en: "At the current pace you'll stay within budget." },
  fcNoData:      { uz: "Prognoz uchun ma'lumot hali yetarli emas.",
                   ru: "Пока недостаточно данных для прогноза.",
                   en: "Not enough data for a forecast yet." },
  fcNoBudget:    { uz: "Byudjet limitini belgilasangiz aniqroq prognoz beraman.",
                   ru: "Задайте лимит бюджета для точного прогноза.",
                   en: "Set a budget limit for a sharper forecast." },

  // Savings coach
  scSaved:       { uz: "Bu oy %s tejadingiz.",       ru: "В этом месяце вы сэкономили %s.", en: "You saved %s this month." },
  scFund:        { uz: "Shu tarzda davom etsangiz, %d oyda Favqulodda fond yaratasiz.",
                   ru: "В таком темпе за %d мес. создадите резервный фонд.",
                   en: "Keep it up and you'll build an emergency fund in %d months." },
  scNeg:         { uz: "Bu oy xarajat daromaddan %s ko'p — jamg'arma manfiy.",
                   ru: "Расходы превысили доход на %s — накоплений нет.",
                   en: "Spending exceeded income by %s — savings are negative." },
  scFundReady:   { uz: "Favqulodda fond tayyor — ajoyib!",   ru: "Резервный фонд готов — отлично!", en: "Emergency fund is ready — great!" },
  scNoIncome:    { uz: "Daromad kiritilsa jamg'arma tahlilini beraman.",
                   ru: "Добавьте доход для анализа накоплений.",
                   en: "Add income to analyze your savings." },

  // Trend
  trUp:          { uz: "oshdi",   ru: "рост",    en: "up" },
  trDown:        { uz: "kamaydi", ru: "спад",    en: "down" },
  trFlat:        { uz: "barqaror", ru: "стабильно", en: "flat" },
  trVs:          { uz: "o'tgan oyga nisbatan", ru: "к прошлому месяцу", en: "vs last month" },
  trNone:        { uz: "Tendensiya uchun ma'lumot yetarli emas.", ru: "Недостаточно данных для тренда.", en: "Not enough data for trends." },

  // Risk
  riskCatUp:     { uz: "%s xarajatlari ketma-ket %d oy oshmoqda.",
                   ru: "Расходы «%s» растут %d мес. подряд.",
                   en: "%s spending has risen %d months in a row." },
  riskDebt:      { uz: "To'lanmagan qarzlar yuki yuqori (%s).",
                   ru: "Высокая долговая нагрузка (%s).",
                   en: "Outstanding debt load is high (%s)." },
  riskGoalIdle:  { uz: "%d kundan beri maqsadlarga pul qo'shilmayapti.",
                   ru: "Цели без пополнений уже %d дн.",
                   en: "No funds added to goals for %d days." },
  riskWedding:   { uz: "To'y jamg'armasi sustlashdi — oyiga %s kerak.",
                   ru: "Накопления на свадьбу замедлились — нужно %s в месяц.",
                   en: "Wedding savings stalled — %s/month needed." },
  riskOverBudget:{ uz: "Bu oy byudjetdan oshib ketdingiz.",
                   ru: "В этом месяце вы превысили бюджет.",
                   en: "You've gone over budget this month." },
  riskNone:      { uz: "Hozircha jiddiy xavf yo'q — barakalla!",
                   ru: "Серьёзных рисков нет — молодец!",
                   en: "No serious risks right now — well done!" },

  // Quick insight
  qiTransport:   { uz: "Transport xarajatlarini biroz kamaytirib, oyiga ~%s tejashingiz mumkin.",
                   ru: "Сократив транспорт, можно экономить ~%s в месяц.",
                   en: "Trimming transport could save ~%s per month." },
  qiDineOut:     { uz: "Restoran xarajatlari o'sdi — uyda ovqatlanib %s tejang.",
                   ru: "Расходы на кафе выросли — готовьте дома и экономьте %s.",
                   en: "Dining out is up — cook at home and save %s." },
  qiOnPace:      { uz: "Byudjetingiz nazoratda — shu ohangda davom eting.",
                   ru: "Бюджет под контролем — так держать.",
                   en: "Your budget is on track — keep it up." },
  qiSaveStreak:  { uz: "Bu oy tejamkorlik yaxshi ketmoqda — %s jamg'ardingiz.",
                   ru: "Экономия идёт отлично — накоплено %s.",
                   en: "Great saving momentum — %s put aside." },
  qiTopCat:      { uz: "Eng katta xarajat: %s. Shu yerdan tejash oson.",
                   ru: "Крупнейшая статья: %s. Здесь легче сэкономить.",
                   en: "Biggest expense: %s. Easiest place to cut." },

  // Wedding / family integratsiya
  wedNeed:       { uz: "To'y uchun oyiga yana %s ajratsangiz rejaga yetasiz.",
                   ru: "Откладывайте ещё %s в месяц — и успеете к свадьбе.",
                   en: "Set aside %s more per month to stay on the wedding plan." },
  wedReady:      { uz: "To'y jamg'armasi rejaga mos — zo'r!",
                   ru: "Накопления на свадьбу по плану — отлично!",
                   en: "Wedding savings are on plan — great!" },
  famProgress:   { uz: "Oila maqsadlarining %d%% reja bo'yicha ketmoqda.",
                   ru: "%d%% семейных целей идут по плану.",
                   en: "%d%% of family goals are on track." },
  famNone:       { uz: "Hali oilaviy maqsad yo'q.", ru: "Семейных целей пока нет.", en: "No family goals yet." },

  // Reports AI summary
  sumTrend:      { uz: "O'tgan oyga nisbatan %s xarajatlari %d%% %s.",
                   ru: "Расходы «%s» %s на %d%% к прошлому месяцу.",
                   en: "%s spending is %s %d%% vs last month." },
  sumNormal:     { uz: "%s xarajatlari me'yorda.", ru: "Расходы «%s» в норме.", en: "%s spending is normal." },
  sumSavingsOk:  { uz: "Jamg'arma yaxshi ketmoqda.", ru: "Накопления идут хорошо.", en: "Savings are going well." },
  sumSavingsBad: { uz: "Bu oy jamg'arma sekinlashdi.", ru: "В этом месяце накопления замедлились.", en: "Savings slowed this month." },
  sumBudgetOk:   { uz: "Byudjet nazoratda.", ru: "Бюджет под контролем.", en: "Budget is under control." },
  sumBudgetBad:  { uz: "Byudjetdan oshish xavfi bor.", ru: "Есть риск превышения бюджета.", en: "Risk of exceeding budget." },

  // Umumiy
  ofBudget:      { uz: "byudjetdan", ru: "от бюджета", en: "of budget" },
  projected:     { uz: "Prognoz",   ru: "Прогноз",    en: "Projected" },
  limit:         { uz: "Limit",     ru: "Лимит",      en: "Limit" },
  thisMonth:     { uz: "Bu oy",     ru: "Этот месяц", en: "This month" },
  showLess:      { uz: "Yig'ish",   ru: "Свернуть",   en: "Show less" },
  showMore:      { uz: "Batafsil",  ru: "Подробнее",  en: "Details" },
};

export function T(key, lg = "uz", ...args) {
  const entry = DICT[key];
  if (!entry) return key;
  let s = entry[lg] || entry.uz || entry.en || key;
  let i = 0;
  s = s.replace(/%[ds]/g, () => (i < args.length ? String(args[i++]) : ""));
  return s;
}
