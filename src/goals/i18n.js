// ═══════════════════════════════════════════════════════════
//  SMART GOALS — i18n (uz / ru / en)
//  Yagona matn manbasi. Ilova lg = "uz" | "ru" | "en".
//  Boshqa modullar konvensiyasiga mos: uz asosiy, qolgani fallback.
//  Bu qatlam butunlay decoupled — hech qanday App/Firebase state'ga
//  bog'liq emas.
// ═══════════════════════════════════════════════════════════

const DICT = {
  // ── Sarlavhalar ──
  smart:        { uz: "Smart tahlil",        ru: "Smart-анализ",       en: "Smart insights" },
  health:       { uz: "Maqsad salomatligi",  ru: "Здоровье цели",      en: "Goal health" },
  prediction:   { uz: "Bashorat",            ru: "Прогноз",            en: "Prediction" },
  countdown:    { uz: "Qolgan vaqt",         ru: "Осталось времени",   en: "Time left" },
  perPeriod:    { uz: "Yig'ish rejasi",      ru: "План накоплений",    en: "Savings plan" },
  timeline:     { uz: "Tarix",               ru: "История",            en: "Timeline" },
  aiTips:       { uz: "AI tavsiyalar",       ru: "AI-советы",          en: "AI tips" },
  notifs:       { uz: "Bildirishnomalar",    ru: "Уведомления",        en: "Notifications" },

  // ── Health statuslari ──
  onTrack:      { uz: "Rejada",              ru: "По плану",           en: "On track" },
  slightly:     { uz: "Biroz ortda",         ru: "Немного позади",     en: "Slightly behind" },
  serious:      { uz: "Jiddiy ortda",        ru: "Сильно позади",      en: "Far behind" },
  ahead:        { uz: "Rejadan oldinda",     ru: "Впереди плана",      en: "Ahead of plan" },
  done:         { uz: "Bajarildi",           ru: "Выполнено",          en: "Done" },
  overdue:      { uz: "Muddat o'tdi",        ru: "Срок истёк",         en: "Overdue" },

  // ── Countdown birliklari ──
  day:          { uz: "kun",                 ru: "дн.",                en: "days" },
  week:         { uz: "hafta",               ru: "нед.",               en: "weeks" },
  month:        { uz: "oy",                  ru: "мес.",               en: "months" },
  daysShort:    { uz: "kun qoldi",           ru: "осталось дней",      en: "days left" },
  perDay:       { uz: "kuniga",              ru: "в день",             en: "per day" },
  perWeek:      { uz: "haftasiga",           ru: "в неделю",           en: "per week" },
  perMonth:     { uz: "oyiga",               ru: "в месяц",            en: "per month" },

  // ── Prediction matnlari ──
  atCurrentPace:{ uz: "Hozirgi tezlikda davom etsangiz",
                  ru: "Если продолжите в текущем темпе",
                  en: "At your current pace" },
  finishEarly:  { uz: "Maqsadga %d kun oldin erishasiz",
                  ru: "Достигнете цели на %d дн. раньше",
                  en: "You'll reach the goal %d days early" },
  finishLate:   { uz: "Maqsadga %d kun kech erishasiz",
                  ru: "Достигнете цели на %d дн. позже",
                  en: "You'll reach the goal %d days late" },
  finishOnTime: { uz: "Aynan muddatida yakunlaysiz",
                  ru: "Завершите точно в срок",
                  en: "You'll finish right on time" },
  noPace:       { uz: "Sur'at hali aniqlanmadi — birinchi hissangizni qo'shing",
                  ru: "Темп ещё не определён — сделайте первый вклад",
                  en: "No pace yet — add your first contribution" },
  finishDate:   { uz: "Taxminiy sana",       ru: "Ожидаемая дата",     en: "Est. date" },

  // ── AI tavsiyalar ──
  aiNoContrib:  { uz: "Siz oxirgi %d kun ichida maqsadga mablag' qo'shmadingiz",
                  ru: "Вы не пополняли цель последние %d дн.",
                  en: "You haven't added funds in %d days" },
  aiAddMonthly: { uz: "Oyiga yana %s qo'shsangiz rejangizga yetasiz",
                  ru: "Добавляйте ещё %s в месяц, чтобы успеть",
                  en: "Add %s more per month to stay on plan" },
  aiBehindDays: { uz: "Maqsaddan %d kun ortda qolyapsiz",
                  ru: "Вы отстаёте от цели на %d дн.",
                  en: "You're %d days behind schedule" },
  aiAheadDays:  { uz: "Zo'r! Rejadan oldindasiz — shu sur'atda %d kun oldin yakunlaysiz",
                  ru: "Отлично! Вы впереди — закончите на %d дн. раньше",
                  en: "Great! You're ahead — finishing %d days early" },
  aiSetDeadline:{ uz: "Muddat belgilang — aniq reja va bashorat ochiladi",
                  ru: "Укажите срок — откроются план и прогноз",
                  en: "Set a deadline to unlock plan & prediction" },
  aiDone:       { uz: "Tabriklaymiz! Maqsad bajarildi 🎉",
                  ru: "Поздравляем! Цель достигнута 🎉",
                  en: "Congrats! Goal completed 🎉" },
  aiOverdue:    { uz: "Muddat o'tib ketdi — yangi muddat belgilang",
                  ru: "Срок прошёл — установите новый",
                  en: "Deadline passed — set a new one" },
  aiKeepGoing:  { uz: "Reja ideal ketyapti — shu ritmni saqlang",
                  ru: "Всё идёт по плану — держите ритм",
                  en: "Perfectly on plan — keep the rhythm" },

  // ── Timeline hodisalari ──
  evCreated:    { uz: "Maqsad yaratildi",    ru: "Цель создана",       en: "Goal created" },
  evAdded:      { uz: "Pul qo'shildi",       ru: "Пополнение",         en: "Funds added" },
  evEdited:     { uz: "Maqsad tahrirlandi",  ru: "Цель изменена",      en: "Goal edited" },
  evDone:       { uz: "Maqsad bajarildi",    ru: "Цель достигнута",    en: "Goal completed" },
  evDeadline:   { uz: "Muddat belgilandi",   ru: "Установлен срок",    en: "Deadline set" },

  // ── Notification matnlari (architecture preview) ──
  ntSaveToday:  { uz: "Bugun maqsadga pul qo'shing",
                  ru: "Пополните цель сегодня",
                  en: "Add money to your goal today" },
  ntBehind:     { uz: "Rejadan ortda qolyapsiz",
                  ru: "Вы отстаёте от плана",
                  en: "You're falling behind schedule" },
  ntDeadline30: { uz: "Maqsadga 30 kun qoldi",
                  ru: "До цели 30 дней",
                  en: "30 days left to your goal" },
  ntDeadline7:  { uz: "Maqsadga 7 kun qoldi",
                  ru: "До цели 7 дней",
                  en: "7 days left to your goal" },
  ntDone:       { uz: "Tabriklaymiz! Maqsadga yetdingiz 🎉",
                  ru: "Поздравляем! Цель достигнута 🎉",
                  en: "Congratulations! Goal reached 🎉" },

  // ── Form ──
  deadline:     { uz: "Erishish sanasi",     ru: "Дата достижения",    en: "Target date" },
  deadlineReq:  { uz: "Sana majburiy",       ru: "Дата обязательна",   en: "Date is required" },
  deadlineHint: { uz: "Qachon erishmoqchisiz?", ru: "Когда хотите достичь?", en: "When do you want it?" },
  goalImage:    { uz: "Maqsad rasmi",        ru: "Изображение цели",   en: "Goal image" },
  imageHint:    { uz: "Ixtiyoriy — rasm havolasi (URL)", ru: "Опционально — ссылка на фото", en: "Optional — image link (URL)" },
  imageUrl:     { uz: "Rasm havolasi (URL)", ru: "Ссылка на изображение", en: "Image URL" },

  // ── Umumiy ──
  expand:       { uz: "Smart tahlilni ochish", ru: "Открыть анализ",   en: "Open insights" },
  collapse:     { uz: "Yopish",              ru: "Свернуть",           en: "Collapse" },
  addDeadline:  { uz: "Muddat qo'shing",     ru: "Добавить срок",      en: "Add deadline" },
  setDeadlineCta:{uz: "Bashorat uchun muddat belgilang",
                  ru: "Укажите срок для прогноза",
                  en: "Set a deadline for predictions" },
  target:       { uz: "Maqsad",              ru: "Цель",               en: "Target" },
  saved:        { uz: "Yig'ilgan",           ru: "Накоплено",          en: "Saved" },
  remaining:    { uz: "Qoldi",               ru: "Осталось",           en: "Remaining" },
  pace:         { uz: "Sur'at",              ru: "Темп",               en: "Pace" },
  scheduled:    { uz: "keyin",               ru: "потом",              en: "scheduled" },
  willFire:     { uz: "Yuboriladi",          ru: "Отправится",         en: "Will fire" },
  planned:      { uz: "Rejalashtirilgan",    ru: "Запланировано",      en: "Scheduled" },
};

/** T(key, lg, ...args) — %d / %s pozitsion almashtirish bilan. */
export function T(key, lg = "uz", ...args) {
  const entry = DICT[key];
  if (!entry) return key;
  let s = entry[lg] || entry.uz || entry.en || key;
  let i = 0;
  s = s.replace(/%[ds]/g, () => (i < args.length ? String(args[i++]) : ""));
  return s;
}

export default DICT;
