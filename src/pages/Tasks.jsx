// ═══════════════════════════════════════════════════════════
//  TASKS — Design System v1.0 migratsiyasi
//  Qoida: biznes logika, Firebase, props, hooklar — o'zgarmagan.
//  UI qatlami: kit komponentlar + tokens.js (hex/radius/shadow/
//  font literal YO'Q, emoji UI'da YO'Q — data emojilari saqlanadi).
// ═══════════════════════════════════════════════════════════
import { useMemo, useState, useEffect, useCallback, memo } from "react";
import {
  PageHeader, SectionHeader, SubHeader, AppCard, WarningCard, Badge, EmptyState,
  PrimaryButton, GhostButton, DangerButton, IconButton,
  LinearProgress, KidAvatar, ConfirmDialog, BottomSheet,
  TextInput, AmountInput,
} from "../components/ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, SHADOW, CHART, PREMIUM } from "../utils/tokens.js";
import { Ico } from "../utils/icons.jsx";
import { f } from "../utils/formatters.js";
import { db } from "../firebase.js";
import { recommendTasks, getKidAge } from "../utils/parenting.js";
import { canAssignTask, canDeleteTask } from "../utils/permissions.js";

// ── 7 tilni to'liq qo'llab-quvvatlaydigan tarjima helper (modul darajasida,
//    chunki bu faylda bir nechta alohida komponent funksiyalari `lg`ni
//    o'z prop'i sifatida oladi) ──
const L = (lg, uzVal, ruVal, enVal, kkVal, kyVal, tgVal, qrVal) => {
  const map = { uz: uzVal, ru: ruVal, en: enVal, kk: kkVal, ky: kyVal, tg: tgVal, qr: qrVal };
  return map[lg] !== undefined ? map[lg] : uzVal;
};

// Tayyor vazifalar to'plami — 4 ustunli grid uchun
// (e — DATA emoji: bazaga avvalgidek yoziladi, UI'da ko'rsatilmaydi)
const VAZIFA_PRESETS = [
  { id: "kitob",    e: "📚", uz: "Kitob o'qish",           ru: "Чтение книги",           en: "Reading",        kk: "Кітап оқу",              ky: "Китеп окуу",              tg: "Хондани китоб",            qr: "Kitap oqıw" },
  { id: "xona",     e: "🧹", uz: "Xonani yig'ishtirish",   ru: "Уборка комнаты",         en: "Clean room",     kk: "Бөлмені жинау",           ky: "Бөлмөнү тазалоо",          tg: "Тозакунии хона",           qr: "Bólmeni jıynaw" },
  { id: "idish",    e: "🍽️", uz: "Idish yuvish",          ru: "Мытьё посуды",           en: "Wash dishes",    kk: "Ыдыс жуу",                ky: "Идиш жуу",                 tg: "Шустани зарфҳо",           qr: "Idıs juwıw" },
  { id: "dokon",    e: "🛒", uz: "Do'kondan xarid",        ru: "Поход в магазин",        en: "Grocery run",    kk: "Дүкеннен сатып алу",      ky: "Дүкөндөн сатып алуу",      tg: "Харид аз мағоза",          qr: "Dúkennen satıp alıw" },
  { id: "gul",      e: "🌱", uz: "Gullarni sug'orish",     ru: "Полив цветов",           en: "Water plants",   kk: "Гүлдерді суару",          ky: "Гүлдөрдү сугаруу",         tg: "Обдиҳии гулҳо",            qr: "Gúllerdi suwlaw" },
  { id: "axlat",    e: "🚮", uz: "Axlatni chiqarish",      ru: "Вынос мусора",           en: "Take out trash", kk: "Қоқысты шығару",          ky: "Таштанды чыгаруу",         tg: "Бароварии партов",         qr: "Qoqıstı shıǵarıw" },
  { id: "orin",     e: "🛏️", uz: "O'rinni yig'ish",       ru: "Заправка кровати",       en: "Make the bed",   kk: "Төсекті жинау",           ky: "Керебетти жыйноо",         tg: "Мураттаб кардани кат",     qr: "Tósekti jıynaw" },
  { id: "darslik",  e: "📝", uz: "Uy vazifasini bajarish", ru: "Выполнение домашки",     en: "Do homework",    kk: "Үй тапсырмасын орындау",  ky: "Үй тапшырмасын аткаруу",   tg: "Иҷрои вазифаи хонагӣ",     qr: "Úy tapsırmasın orınlaw" },
  { id: "kir",      e: "🧺", uz: "Kir yuvishga yordam",    ru: "Помощь со стиркой",      en: "Laundry help",   kk: "Кір жууға көмек",         ky: "Кир жуууга жардам",        tg: "Кӯмак дар шустушӯй",       qr: "Kir juwıwǵa járdem" },
  { id: "ovqat",    e: "🍳", uz: "Ovqatga yordam",         ru: "Помощь в готовке",       en: "Help cooking",   kk: "Тамақ пісіруге көмек",    ky: "Тамак жасоого жардам",     tg: "Кӯмак дар пухтупаз",       qr: "Tamaq islewge járdem" },
  { id: "sport",    e: "🚴", uz: "Sport qilish",           ru: "Занятие спортом",        en: "Exercise",       kk: "Спортпен шұғылдану",      ky: "Спорт менен алектенүү",    tg: "Машғул шудан бо варзиш",   qr: "Sport penen shuǵıllanıw" },
  { id: "musiqa",   e: "🎹", uz: "Musiqa mashqi",          ru: "Музыкальная практика",   en: "Music practice", kk: "Музыка жаттығуы",         ky: "Музыка көнүгүүсү",         tg: "Машқи мусиқӣ",             qr: "Muzıka jattıǵıwı" },
  { id: "oyinchoq", e: "🧸", uz: "O'yinchoqlarni yig'ish", ru: "Уборка игрушек",         en: "Tidy toys",      kk: "Ойыншықтарды жинау",      ky: "Оюнчуктарды жыйноо",       tg: "Ҷамъ кардани бозичаҳо",    qr: "Oyınshıqlardı jıynaw" },
  { id: "hayvon",   e: "🐕", uz: "Hayvonga qarash",        ru: "Уход за питомцем",       en: "Pet care",       kk: "Үй жануарына қарау",      ky: "Үй жаныбарына кароо",      tg: "Нигоҳубини ҳайвони хонагӣ", qr: "Úy haywanına qaraw" },
  { id: "deraza",   e: "🪟", uz: "Deraza artish",          ru: "Мытьё окон",             en: "Clean windows",  kk: "Терезе жуу",              ky: "Терезе жуу",               tg: "Тоза кардани тиреза",      qr: "Terezeni sürtiw" },
  { id: "soz",      e: "🧠", uz: "Yangi so'z yodlash",     ru: "Учить новые слова",      en: "Learn new words", kk: "Жаңа сөз жаттау",        ky: "Жаңы сөз үйрөнүү",         tg: "Азёд кардани калимаҳои нав", qr: "Jańa sóz jattaw" },
  { id: "buvi",     e: "🤲", uz: "Kattalarga yordam",      ru: "Помощь старшим",         en: "Help elders",    kk: "Үлкендерге көмек",        ky: "Улууларга жардам",         tg: "Кӯмак ба калонсолон",      qr: "Úlkenlerge járdem" },
  { id: "rasm",     e: "🎨", uz: "Rasm chizish",           ru: "Рисование",              en: "Drawing",        kk: "Сурет салу",              ky: "Сүрөт тартуу",             tg: "Расмкашӣ",                 qr: "Suwret siziw" },
  { id: "sayr",     e: "🏃", uz: "Toza havoda sayr",       ru: "Прогулка на воздухе",    en: "Outdoor walk",   kk: "Таза ауада серуендеу",    ky: "Таза абада сейилдөө",      tg: "Сайр дар ҳавои тоза",      qr: "Taza hawada sayr" },
  { id: "boshqa",   e: "✨", uz: "Boshqa",                 ru: "Другое",                 en: "Other",          kk: "Басқа",                   ky: "Башка",                    tg: "Дигар",                    qr: "Basqa" },
];

// ── Tasks-lokal outline SVG ikonkalar (emoji o'rniga, DS 6) ──
const TIco = {
  kitob:    (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 4.5C8.5 3.2 6.3 2.8 3 3v12c3.3-.2 5.5.2 7 1.5 1.5-1.3 3.7-1.7 7-1.5V3c-3.3-.2-5.5.2-7 1.5z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M10 4.5v12" stroke={c} strokeWidth="1.3"/></svg>,
  xona:     (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M12.5 2l-3 8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M9.8 9.5c-2.6-.4-4.6 1-5.3 4l-1 3.5c3.5.6 8.5 1 9.8-3l.8-2.7-4.3-1.8z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M6.5 13.5l-.8 3.3M9.5 14l-.6 3.2" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  idish:    (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="11" cy="10" r="6.5" stroke={c} strokeWidth="1.4"/><circle cx="11" cy="10" r="3" stroke={c} strokeWidth="1.2" opacity=".6"/><path d="M2.5 3v5M2.5 8v9M1 3v3c0 1 .7 2 1.5 2S4 7 4 6V3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  dokon:    (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M2 3h2.2l1.9 9.5h9.4l1.7-7H5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7.3" cy="16.2" r="1.4" stroke={c} strokeWidth="1.3"/><circle cx="14.2" cy="16.2" r="1.4" stroke={c} strokeWidth="1.3"/></svg>,
  gul:      (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 17v-6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M10 11C10 7 7.5 5 3.5 5c0 4 2.5 6 6.5 6zM10 9c0-3 2-4.7 5.5-4.7 0 3.5-2 4.7-5.5 4.7z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 17h10" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  axlat:    (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M4 5.5h12M8 5.5V3.5h4v2M5.3 5.5l.9 11h7.6l.9-11" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.3 8.5v5M11.7 8.5v5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  orin:     (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M2 15.5V9c0-1.1.9-2 2-2h9.5c2.5 0 4.5 1.8 4.5 4.5v4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M2 13h16M2 16.5V13M18 16.5V13" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><circle cx="6" cy="10" r="1.6" fill={c} opacity=".35"/></svg>,
  darslik:  (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3.5" y="2.5" width="11" height="15" rx="1.8" stroke={c} strokeWidth="1.4"/><path d="M6.5 6.5h5M6.5 9.5h5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M11 15.5l5.5-5.5c.6-.6 1.5.3.9.9L12 16.4l-1.8.4.8-1.3z" fill={c} opacity=".2" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  kir:      (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M3.5 8h13l-1.2 8.5h-10.6L3.5 8z" fill={c} opacity=".1" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 8c0-2.3 1.8-4 4-4s4 1.7 4 4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M6.5 11.5c1 .8 2.3 1.2 3.5 1.2s2.5-.4 3.5-1.2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  ovqat:    (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="9" cy="11.5" r="5.5" stroke={c} strokeWidth="1.4"/><path d="M13.8 8.2L18 4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="11.5" r="2.2" stroke={c} strokeWidth="1.1" opacity=".55"/></svg>,
  sport:    (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="4.6" cy="13.5" r="3" stroke={c} strokeWidth="1.3"/><circle cx="15.4" cy="13.5" r="3" stroke={c} strokeWidth="1.3"/><path d="M4.6 13.5L8 7h5.5M10 13.5L8 7M12.5 4.5h2.5l.7 2" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  musiqa:   (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M7.5 15.5V4.5L16 3v10.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5.3" cy="15.5" r="2.2" stroke={c} strokeWidth="1.3"/><circle cx="13.8" cy="13.5" r="2.2" stroke={c} strokeWidth="1.3"/></svg>,
  oyinchoq: (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="11.5" r="5" fill={c} opacity=".1" stroke={c} strokeWidth="1.4"/><circle cx="5" cy="6" r="2.3" stroke={c} strokeWidth="1.3"/><circle cx="15" cy="6" r="2.3" stroke={c} strokeWidth="1.3"/><circle cx="8.2" cy="11" r=".9" fill={c}/><circle cx="11.8" cy="11" r=".9" fill={c}/><path d="M8.7 13.7c.8.6 1.8.6 2.6 0" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  hayvon:   (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 10.5c-2.6 0-4.5 1.9-4.5 4 0 1.4 1 2.3 2.3 2.3 1 0 1.5-.5 2.2-.5s1.2.5 2.2.5c1.3 0 2.3-.9 2.3-2.3 0-2.1-1.9-4-4.5-4z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3"/><ellipse cx="5" cy="8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/><ellipse cx="15" cy="8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/><ellipse cx="8" cy="4.8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/><ellipse cx="12" cy="4.8" rx="1.4" ry="1.9" stroke={c} strokeWidth="1.2"/></svg>,
  deraza:   (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3.5" y="3" width="13" height="14" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M10 3v14M3.5 10h13" stroke={c} strokeWidth="1.2"/><path d="M5.5 6.5l2-2" stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity=".6"/></svg>,
  soz:      (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2.5a5.5 5.5 0 00-3 10.1c.7.5 1.2 1.2 1.2 2.1h3.6c0-.9.5-1.6 1.2-2.1a5.5 5.5 0 00-3-10.1z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4"/><path d="M8 16.8h4M8.6 18.5h2.8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M8.3 7.5L10 5.8l1.7 1.7" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/></svg>,
  buvi:     (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 16.5s-5.5-3.3-5.5-7A3 3 0 0110 7.4a3 3 0 015.5 2.1c0 3.7-5.5 7-5.5 7z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M2 12.5c1.5 2.5 4 4.5 8 6 4-1.5 6.5-3.5 8-6" stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity=".5"/></svg>,
  rasm:     (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2.5c-4.4 0-8 3.2-8 7.3 0 4 3.6 7.2 8 7.2 1 0 1.7-.7 1.7-1.6 0-.5-.2-.8-.4-1.1-.3-.4-.4-.7-.4-1.1 0-.9.7-1.6 1.7-1.6h1.9c2 0 3.5-1.5 3.5-3.4 0-3.2-3.6-5.7-8-5.7z" stroke={c} strokeWidth="1.4"/><circle cx="6" cy="8" r="1" fill={c}/><circle cx="10" cy="6" r="1" fill={c}/><circle cx="14" cy="8" r="1" fill={c}/></svg>,
  sayr:     (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="11" cy="3.8" r="1.7" stroke={c} strokeWidth="1.3"/><path d="M8 18l2-4.5-2-2 1.2-4 3 1.5 2.8 1.2M9.2 7.5L6 9v3M10 13.5l3 1 1 3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  boshqa:   (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2.5l1.7 4.6 4.8.4-3.7 3.1 1.2 4.7L10 12.7l-4 2.6 1.2-4.7-3.7-3.1 4.8-.4L10 2.5z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  // yordamchi ikonkalar
  task:     (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="15" rx="2" stroke={c} strokeWidth="1.4"/><path d="M7.5 3.5V2h5v1.5" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 8.5l1.5 1.5L12 6.8M7 13.5h6" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trophy:   (c, s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M5 2h6v4a3 3 0 01-6 0V2z" fill={c} opacity=".15" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 3H2.5c0 2 1 3.5 2.5 3.5M11 3h2.5c0 2-1 3.5-2.5 3.5M8 9v2.5M5.5 13.5h5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  target:   (c, s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.2" opacity=".4"/><circle cx="8" cy="8" r="3.8" stroke={c} strokeWidth="1.2" opacity=".7"/><circle cx="8" cy="8" r="1.4" fill={c}/></svg>,
  coin:     (c, s=12) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth="1.3"/><path d="M8 4.8v6.4M10 6.2c-.4-.7-1.2-1-2-1-1.1 0-2 .6-2 1.4C6 8.6 10 8 10 9.6c0 .8-.9 1.4-2 1.4-.8 0-1.6-.3-2-1" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  clock:    (c, s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth="1.3"/><path d="M8 4.5V8l2.5 1.8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  cal:      (c, s=12) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke={c} strokeWidth="1.3"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  undo:     (c, s=15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 3.5L3 6.5l3 3" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6.5h6.5a3.5 3.5 0 010 7H6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  broom:    (c, s=20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M12.5 2l-3 8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M9.8 9.5c-2.6-.4-4.6 1-5.3 4l-1 3.5c3.5.6 8.5 1 9.8-3l.8-2.7-4.3-1.8z" fill={c} opacity=".12" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  party:    (c, s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><path d="M5.3 8.2l1.9 1.9 3.5-4" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  searchBig: c => <svg width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="24" cy="24" r="14" stroke={c} strokeWidth="2"/><line x1="35" y1="35" x2="46" y2="46" stroke={c} strokeWidth="2.4" strokeLinecap="round"/><path d="M18 24a6 6 0 016-6" stroke={c} strokeWidth="1.6" strokeLinecap="round" opacity=".5"/></svg>,
  taskBig:  c => <svg width="56" height="56" viewBox="0 0 56 56" fill="none"><rect x="14" y="9" width="28" height="40" rx="5" stroke={c} strokeWidth="2"/><path d="M22 10V6h12v4" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/><path d="M21 24l4 4 9-10M21 38h14" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// Data emoji → preset id (kartadagi ikonkani SVG'da chizish uchun)
const EMOJI2ID = {
  "📚": "kitob",
  "📖": "kitob",
  "🧹": "xona",
  "🛏️": "orin",
  "🍽️": "idish",
  "🛒": "dokon",
  "🌱": "gul",
  "🚮": "axlat",
  "🗑️": "axlat",
  "📝": "darslik",
  "🎓": "darslik",
  "🧺": "kir",
  "🍳": "ovqat",
  "🚴": "sport",
  "🏃": "sayr",
  "⚽": "sport",
  "🎹": "musiqa",
  "🧸": "oyinchoq",
  "🐕": "hayvon",
  "🪟": "deraza",
  "🧠": "soz",
  "🦷": "soz",
  "🤲": "buvi",
  "🎨": "rasm",
  "✨": "boshqa",
  "🕌": "boshqa"
};
const taskIco = (emoji, c, s) => (TIco[EMOJI2ID[emoji]] || TIco.task)(c, s);

// ── Status meta: rang + badge turi + matn (kit Badge orqali) ──
const statusMeta = (st, th, lg) => {
  switch (st) {
    case "approved": return { c: th.gr, type: "success", label: L(lg, "Tasdiqlandi", "Подтверждено", "Approved", "Расталды", "Ырасталды", "Тасдиқ шуд", "Tastıyıqlandı"), prog: 100 };
    case "done":     return { c: th.am, type: "warning", label: L(lg, "Tekshirilmoqda", "На проверке", "Pending review", "Тексерілуде", "Текшерилүүдө", "Дар ҳоли тафтиш", "Tekseriliwde"), prog: 66 };
    case "rejected": return { c: th.rd, type: "danger",  label: L(lg, "Rad etildi", "Отклонено", "Rejected", "Қабылданбады", "Четке кагылды", "Рад карда шуд", "Biykar etildi"), prog: 0 };
    case "expired":  return { c: th.t3, type: "status",  tone: th.t3, label: L(lg, "Muddati o'tgan", "Срок истёк", "Expired", "Мерзімі өтті", "Мөөнөтү өттү", "Мӯҳлат гузашт", "Múddeti ótti"), prog: 0 };
    case "proposed": return { c: th.ac2 || th.ac, type: "info", label: L(lg, "Taklif qilindi", "Предложено", "Proposed", "Ұсынылды", "Сунушталды", "Пешниҳод шуд", "Usınıldı"), prog: 15 };
    default:         return { c: th.ac, type: "info",    label: L(lg, "Bajarilmagan", "Не выполнено", "To do", "Орындалмаған", "Аткарылган жок", "Иҷро нашуда", "Orınlanbaǵan"), prog: 8 };
  }
};

// ── Bugungi sana (mahalliy; UTC siljishisiz) ──
const TODAY_STR = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const addDaysStr = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
// Muddatni hisobga olgan ko'rinish holati: muddati o'tib, hali tasdiqlanmagan bo'lsa → "expired"
const effStatus = (v) => {
  if (v.status === "approved" || v.status === "rejected" || v.status === "expired") return v.status;
  if (v.deadline && TODAY_STR() > v.deadline) return "expired";
  return v.status;
};

// ═══ RewardChip — mukofot (kit Badge, React.memo) ═══
const RewardChip = memo(function RewardChip({ th, amount }) {
  return <Badge th={th} type="success" icon={TIco.coin(th.gr, 11)}>+{f(amount, true)}</Badge>;
});

// ═══ StatusBadge — holat (kit Badge, React.memo) ═══
const StatusBadge = memo(function StatusBadge({ th, lg, status }) {
  const m = statusMeta(status, th, lg);
  return <Badge th={th} type={m.type} tone={m.tone}>{m.label}</Badge>;
});

// ═══ TaskCard — bitta vazifa kartasi (AppCard ichida, React.memo) ═══
// Tuzilishi: Icon → Title → (kid) → Reward → Sana → Progress → Status → Actions
const TaskCard = memo(function TaskCard({ th, lg, v, kidName, isKid, canDelete, onDone, onApprove, onReject, onAcceptProposed, onAskDelete }) {
  const formatWithSpaces = (val) => {
    const s = String(val).replace(/\D/g, "");
    if (!s) return "";
    let r = "";
    for (let i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) r += " ";
      r += s[i];
    }
    return r;
  };

  const st = effStatus(v);
  const m = statusMeta(st, th, lg);
  const dlPast = v.deadline && TODAY_STR() > v.deadline && st !== "approved";
  const [customReward, setCustomReward] = useState(formatWithSpaces(v.reward || ""));

  useEffect(() => {
    setCustomReward(formatWithSpaces(v.reward || ""));
  }, [v.id, v.reward]);

  return (
    <AppCard th={th} style={{ position: "relative", overflow: "hidden", paddingLeft: SPACE.s4 + SPACE.s1 }}>
      {/* chap status chizig'i */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: SPACE.s1, background: m.c }} />
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
        {/* Icon — SVG outline (data emoji'dan mapping) */}
        <div style={{ width: SPACE.s12 - 2, height: SPACE.s12 - 2, borderRadius: RADIUS.s + 3, background: m.c + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {taskIco(v.emoji, m.c, 24)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <div style={{ ...TYPE.subtitle, color: th.t1, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</div>
          {/* Description (bo'lsa) */}
          {v.desc && <div style={{ ...TYPE.caption, color: th.t2, marginBottom: 2 }}>{v.desc}</div>}
          {/* Reward + kim uchun + Status badge */}
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, flexWrap: "wrap" }}>
            {st !== "proposed" || isKid ? (
              <RewardChip th={th} amount={v.reward} />
            ) : null}
            {!isKid && kidName && (
              <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>
                {Ico.user(th.t2)}{kidName}
              </span>
            )}
            <StatusBadge th={th} lg={lg} status={st} />
          </div>
        </div>
      </div>
      {/* Sana / muddat qatori */}
      {(v.sana || v.doneSana || v.deadline) && (
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, marginTop: SPACE.s2 + 2, ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, flexWrap: "wrap" }}>
          {v.sana && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{TIco.cal(th.t3)}{L(lg, "Berilgan", "Назначено", "Assigned", "Тапсырылды", "Тапшырылды", "Супориш дода шуд", "Tapsırıldı")}: {v.sana}</span>}
          {v.deadline && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, color: dlPast ? th.rd : th.am, fontWeight: 700 }}>{TIco.clock(dlPast ? th.rd : th.am)}{L(lg, "Muddat", "Срок", "Due", "Мерзім", "Мөөнөт", "Мӯҳлат", "Múddet")}: {v.deadline}{dlPast ? L(lg, " (o'tgan)", " (истёк)", " (passed)", " (өтті)", " (өттү)", " (гузашт)", " (ótti)") : ""}</span>}
          {v.createdByName && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{Ico.user(th.t3)}{L(lg, "Berdi", "Назначил(а)", "By", "Берді", "Берди", "Дод", "Berdi")}: {v.createdByName}</span>}
          {v.doneSana && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{TIco.clock(th.t3)}{L(lg, "Bajarildi", "Выполнено", "Done", "Орындалды", "Аткарылды", "Иҷро шуд", "Orınlandı")}: {v.doneSana}</span>}
        </div>
      )}
      {/* Progress — kit LinearProgress (holatga bog'liq) */}
      <div style={{ marginTop: SPACE.s2 + 2 }}>
        <LinearProgress th={th} value={m.prog} tone={m.c} height={SPACE.s2 - 2} />
      </div>

      {/* Parent Negotiation for Proposed Tasks */}
      {!isKid && st === "proposed" && (
        <div style={{ marginTop: SPACE.s3, background: th.surH, borderRadius: RADIUS.s, padding: SPACE.s3, border: "1px dashed " + th.bor }}>
          <div style={{ ...TYPE.caption, color: th.t1, fontWeight: 700, marginBottom: SPACE.s2 }}>
            {L(lg,
              "Farzand taklif qilgan mukofotni kelishish:",
              "Согласуйте предложенную ребёнком награду:",
              "Negotiate child's proposed reward:",
              "Баланың ұсынған сыйлығын келісу:",
              "Баланын сунуш кылган сыйлыгын макулдашуу:",
              "Мукофоти пешниҳодкардаи фарзандро мувофиқа кунед:",
              "Balanıń usınǵan sıylıǵın kelisiw:"
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
            <input
              type="text"
              inputMode="numeric"
              value={customReward}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, "");
                setCustomReward(formatWithSpaces(raw));
              }}
              style={{
                background: th.bg,
                border: "1px solid " + th.bor,
                borderRadius: RADIUS.s - 2,
                padding: "8px 12px",
                color: th.t1,
                fontSize: 15,
                fontWeight: 700,
                width: "100%",
                maxWidth: 150,
                outline: "none"
              }}
            />
            <span style={{ ...TYPE.caption, color: th.t2 }}>{L(lg, "so'm", "сум", "UZS", "сом", "сом", "сум", "sóm")}</span>
          </div>
          <div style={{ display: "flex", gap: SPACE.s2 }}>
            <PrimaryButton th={th} onClick={() => onAcceptProposed && onAcceptProposed(v.id, customReward)} style={{ flex: 1, padding: "8px", background: th.gr }}>
              {Ico.check("#fff")}{L(lg, "Tasdiqlash", "Подтвердить", "Approve", "Растау", "Ырастоо", "Тасдиқ кардан", "Tastıyıqlaw")}
            </PrimaryButton>
            <DangerButton th={th} onClick={onAskDelete} style={{ flex: 1, padding: "8px" }}>
              {Ico.trash(th.rd)}{L(lg, "Rad etish", "Отклонить", "Reject", "Қабылдамау", "Четке кагуу", "Рад кардан", "Biykar etiw")}
            </DangerButton>
          </div>
        </div>
      )}

      {/* Action buttons — kit tugmalar */}
      <div style={{ display: "flex", gap: SPACE.s2, marginTop: SPACE.s3 }}>
        {isKid && st === "proposed" && (
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2, padding: (SPACE.s2 + 2) + "px", ...TYPE.caption, fontWeight: 600, color: th.ac }}>
              {TIco.clock(th.ac)}{L(lg,
                "Taklif yuborildi. Ota-ona tasdiqlashi kutilmoqda",
                "Предложение отправлено. Ожидается подтверждение родителя",
                "Proposal sent. Awaiting parent approval",
                "Ұсыныс жіберілді. Ата-ана растауын күтуде",
                "Сунуш жөнөтүлдү. Ата-эненин ырастоосу күтүлүүдө",
                "Пешниҳод фиристода шуд. Тасдиқи волидайн интизор аст",
                "Usınıs jiberildi. Ata-ana tastıyıqlawın kútpekte"
              )}
            </div>
            {canDelete && (
              <DangerButton th={th} onClick={onAskDelete} style={{ padding: "8px 12px", fontSize: TYPE.caption.fontSize, width: "auto", alignSelf: "flex-start", marginTop: 4 }}>
                {Ico.trash(th.rd)}{L(lg, "Taklifni o'chirish", "Отменить предложение", "Cancel proposal", "Ұсынысты жою", "Сунушту жоюу", "Бекор кардани пешниҳод", "Usınıstı biykar etiw")}
              </DangerButton>
            )}
          </div>
        )}
        {isKid && st === "pending" && (
          <PrimaryButton th={th} onClick={onDone} style={{ padding: (SPACE.s2 + 2) + "px" }}>
            {Ico.check("#fff")}{L(lg, "Bajardim", "Выполнил(а)", "Done", "Орындадым", "Аткардым", "Иҷро кардам", "Orınladım")}
          </PrimaryButton>
        )}
        {isKid && st === "done" && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 + 2, padding: (SPACE.s2 + 2) + "px", ...TYPE.caption, fontWeight: 600, color: th.am }}>
            {TIco.clock(th.am)}{L(lg, "Ota-ona tasdig'i kutilmoqda", "Ожидается подтверждение родителя", "Awaiting approval", "Ата-ана растауын күтуде", "Ата-эненин ырастоосу күтүлүүдө", "Тасдиқи волидайн интизор аст", "Ata-ana tastıyıqlawın kútpekte")}
          </div>
        )}
        {isKid && st === "approved" && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 + 2, padding: (SPACE.s2 + 2) + "px", ...TYPE.caption, fontWeight: 700, color: th.gr }}>
            {TIco.party(th.gr)}{L(lg, "Mukofot olindi!", "Награда получена!", "Reward received!", "Сыйлық алынды!", "Сыйлык алынды!", "Мукофот гирифта шуд!", "Sıylıq alındı!")}
          </div>
        )}
        {!isKid && st === "done" && (
          <>
            <PrimaryButton th={th} onClick={onApprove} style={{ flex: 2, width: "auto", padding: (SPACE.s2 + 2) + "px", background: th.gr, boxShadow: SHADOW.e1(th.gr) }}>
              {Ico.check("#fff")}{L(lg, "Tasdiqlash", "Подтвердить", "Approve", "Растау", "Ырастоо", "Тасдиқ кардан", "Tastıyıqlaw")}
            </PrimaryButton>
            {onReject && (
              <GhostButton th={th} onClick={onReject} style={{ flex: 1, width: "auto", padding: (SPACE.s2 + 2) + "px", color: th.am, border: "1px solid " + th.am + ALPHA.strong, background: th.am + ALPHA.soft }}>
                {TIco.undo(th.am)}
              </GhostButton>
            )}
          </>
        )}
        {!isKid && canDelete && st !== "done" && st !== "proposed" && (
          <DangerButton th={th} onClick={onAskDelete} style={{ padding: (SPACE.s2 + 1) + "px", fontSize: TYPE.caption.fontSize }}>
            {Ico.trash(th.rd)}{L(lg, "O'chirish", "Удалить", "Delete", "Жою", "Жоюу", "Нест кардан", "Óshiriw")}
          </DangerButton>
        )}
      </div>
    </AppCard>
  );
});

// ═══ TaskRow — reyting qatori (KidAvatar + tokens, React.memo) ═══
const TaskRow = memo(function TaskRow({ th, lg, rank, name, done, taskEarn, bal, last }) {
  const rankC = rank === 1 ? PREMIUM.gold : rank === 2 ? th.t3 : rank === 3 ? th.am : th.t2;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 - 1, padding: (SPACE.s2 + 1) + "px 0", borderBottom: last ? "none" : "1px solid " + th.bor }}>
      <div style={{ width: SPACE.s6 + 2, height: SPACE.s6 + 2, borderRadius: RADIUS.full, background: rankC + ALPHA.soft, color: rankC, display: "flex", alignItems: "center", justifyContent: "center", ...TYPE.caption, fontWeight: 800, flexShrink: 0 }}>{rank}</div>
      <KidAvatar th={th} name={name} size={SPACE.s8 + 2} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: th.t1 }}>{name}</div>
        <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, display: "flex", alignItems: "center", gap: SPACE.s1, flexWrap: "wrap" }}>
          {TIco.trophy(th.am, 11)}{done} {L(lg, "vazifa", "заданий", "tasks", "тапсырма", "тапшырма", "супориш", "tapsırma")} · {TIco.target(th.t3, 11)}{L(lg, "vazifadan", "с заданий", "from tasks", "тапсырмадан", "тапшырмадан", "аз супоришҳо", "tapsırmadan")}: <b style={{ color: th.gr }}>{f(taskEarn, true)}</b>
        </div>
        <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 2, color: th.t2, marginTop: 1, display: "flex", alignItems: "center", gap: SPACE.s1 }}>
          {TIco.coin(th.t3, 10)}{L(lg, "Cho'ntakda", "В кошельке", "Pocket", "Қалтада", "Чөнтөктө", "Дар ҷайб", "Qaltada")}: {f(bal, true)}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ ...TYPE.heading, fontSize: TYPE.heading.fontSize - 1, color: CHART[5], fontVariantNumeric: "tabular-nums" }}>{done * 10}</div>
        <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontSize: TYPE.tiny.fontSize - 1, color: th.t2 }}>{L(lg, "ball", "балл", "pts", "балл", "балл", "балл", "ball")}</div>
      </div>
    </div>
  );
});

// ═══ PresetCell — vazifa tanlash katagi (grid, React.memo) ═══
const PresetCell = memo(function PresetCell({ th, lg, p, active, onPick }) {
  return (
    <button className="ui-press" onClick={onPick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: SPACE.s1 + 1,
      background: active ? th.ac + ALPHA.tint : th.surH,
      border: "2px solid " + (active ? th.ac : th.bor),
      borderRadius: RADIUS.s + 3, padding: (SPACE.s2 + 2) + "px " + SPACE.s1 + "px " + SPACE.s2 + "px",
      cursor: "pointer", minHeight: SPACE.s16 + SPACE.s2 + 2, fontFamily: "inherit",
    }}>
      <span style={{ display: "flex" }}>{(TIco[p.id] || TIco.task)(active ? th.ac : th.t2, 24)}</span>
      <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 700, color: active ? th.ac : th.t2, textAlign: "center", lineHeight: 1.25 }}>{p[lg] || p.uz}</span>
    </button>
  );
});

export default function TasksPage({
  user, azolar, vazifalar, kidBalances,
  setVazifalar, setKidBalances,
  lg, isKid, th, t,
  buzz, setScr,
  showAddVazifa, setShowAddVazifa,
  vTitle, setVTitle, vReward, setVReward, vAssignee, setVAssignee, vEmoji, setVEmoji,
  vDeadline, setVDeadline,
  addVazifa,
  vazifaDone, vazifaApprove, vazifaReject, vazifaAcceptProposed, delVazifa,
  cleanupKidDuplicates, isBosh,
}) {
  // Dublikat bola yozuvlaridan (qayta yaratilgan akkauntlar) eng yangisi olinadi
  const kids = useMemo(() => {
    const raw = azolar.filter(a => a.rol === "kid");
    const seen = {};
    [...raw].sort((a, b) => String(b.id).localeCompare(String(a.id))).forEach(k => {
      const key = (k.login || k.ism || "").trim().toLowerCase();
      if (!seen[key]) seen[key] = k;
    });
    return Object.values(seen);
  }, [azolar]);
  const [selPreset, setSelPreset] = useState(null);
  const [vSyncing, setVSyncing] = useState(false);
  const [delId, setDelId] = useState(null); // UI holati: o'chirish tasdig'i (ConfirmDialog)
  // Sahifa ochilganda vazifalar va cho'ntak balanslari bazadan qayta yuklanadi
  const reloadVazifa = async () => {
    if (!user?.oilaId) return;
    setVSyncing(true);
    try {
      let v = await db.g("vazifa_" + user.oilaId);
      let kb = await db.g("kidbal_" + user.oilaId);
      // Bola: ota-onaning oilaId'si farq qilsa (eski migratsiya) — o'sha kalitdan ham o'qiladi
      if (isKid && user.parentId) {
        try {
          const pu = await db.g("user_" + user.parentId);
          if (pu?.oilaId && pu.oilaId !== user.oilaId) {
            const v2 = await db.g("vazifa_" + pu.oilaId);
            if (Array.isArray(v2)) v = [...v2, ...((Array.isArray(v) ? v : []).filter(x => !v2.find(y => y.id === x.id)))];
            const kb2 = await db.g("kidbal_" + pu.oilaId);
            if (kb2 && typeof kb2 === "object") kb = { ...(kb || {}), ...kb2 };
          }
        } catch (e3) {}
      }
      if (Array.isArray(v)) setVazifalar(v);
      if (kb && typeof kb === "object") setKidBalances(kb);
    } catch (e) { console.error("vazifa sync:", e); }
    setVSyncing(false);
  };
  useEffect(() => { reloadVazifa(); }, [user?.oilaId]); // eslint-disable-line
  useEffect(() => { if (showAddVazifa) { setSelPreset(null); if (kids.length === 1) setVAssignee(kids[0].id); } }, [showAddVazifa]); // eslint-disable-line

  // ── Hisoblashlar (useMemo) ──
  const matchesKid = (v, k) => v.assignedTo === k.id
    || (v.assignedLogin && k.login && v.assignedLogin === k.login)
    || (v.assignedName && k.ism && v.assignedName.trim().toLowerCase() === k.ism.trim().toLowerCase());
  const myTasks = useMemo(
    () => isKid ? vazifalar.filter(v => matchesKid(v, user)) : vazifalar,
    [vazifalar, isKid, user]
  );
  const myStats = useMemo(() => {
    if (!isKid) return null;
    const myDone = vazifalar.filter(v => matchesKid(v, user) && v.status === "approved");
    return { count: myDone.length, earn: myDone.reduce((sm, v) => sm + Number(v.reward || 0), 0) };
  }, [vazifalar, isKid, user]);
  const leaderboard = useMemo(() => kids.map(k => {
    const doneList = vazifalar.filter(v => matchesKid(v, k) && v.status === "approved");
    const nmb = x => (x || "").trim().toLowerCase();
    const balIds = azolar.filter(a => a.rol === "kid" && ((a.login && k.login && a.login === k.login) || (a.ism && k.ism && nmb(a.ism) === nmb(k.ism)))).map(a => a.id);
    return {
      id: k.id, name: k.ism,
      done: doneList.length,
      taskEarn: doneList.reduce((sm, v) => sm + Number(v.reward || 0), 0),
      bal: (balIds.length ? balIds : [k.id]).reduce((sm, id) => sm + (kidBalances[id] || 0), 0),
    };
  }), [kids, vazifalar, azolar, kidBalances]);
  const kidById = useMemo(() => {
    const m = {}; azolar.forEach(a => { m[a.id] = a; }); return m;
  }, [azolar]);

  // ── Handlerlar (useCallback — memo bolalarga uzatiladi) ──
  const goBack   = useCallback(() => { buzz(8); setScr("bosh"); }, [buzz, setScr]);
  const doReload = useCallback(() => { buzz(6); reloadVazifa(); }, [buzz, user?.oilaId, isKid]); // eslint-disable-line
  const openAdd  = useCallback(() => { buzz(10); setShowAddVazifa(true); }, [buzz, setShowAddVazifa]);
  const closeAdd = useCallback(() => { setShowAddVazifa(false); setSelPreset(null); }, [setShowAddVazifa]);
  const askDelete = useCallback(id => setDelId(id), []);
  const confirmDelete = useCallback(() => { if (delId != null) delVazifa(delId); setDelId(null); }, [delId, delVazifa]);
  const doCleanup = useCallback(() => { buzz(10); cleanupKidDuplicates && cleanupKidDuplicates(); }, [buzz, cleanupKidDuplicates]);
  const pickPreset = useCallback(p => {
    setSelPreset(p.id); setVEmoji(p.e);
    if (p.id === "boshqa") setVTitle("");
    else setVTitle(p[lg] || p.uz);
  }, [lg, setVEmoji, setVTitle]);

  const hasDup = !isKid && isBosh && azolar.filter(a => a.rol === "kid").length > kids.length;

  // ── YOSHGA MOS TAVSIYALAR — offline intellekt (ishlangan ma'lumotlar:
  //    bola yoshi + vazifa tarixi + mukofot odati). Tashqi AI ulanmagan. ──
  const selKid = vAssignee ? kidById[vAssignee] : null;
  const recs = useMemo(
    () => (showAddVazifa && selKid) ? recommendTasks({ kid: selKid, vazifalar, lg }) : null,
    [showAddVazifa, selKid, vazifalar, lg]
  );
  const pickRec = useCallback(r => {
    buzz(8);
    setSelPreset(r.presetId || "tavsiya");
    setVEmoji(r.e);
    setVTitle(r.title);
    setVReward(prev => prev ? prev : String(r.reward));
  }, [buzz, setVEmoji, setVTitle, setVReward]);

  return (
    <div>
      {/* ── Sarlavha: kit PageHeader (orqaga + yangilash) ── */}
      <PageHeader th={th} onBack={goBack}
        title={L(lg, "Farzand vazifalari", "Задания детей", "Kids' tasks", "Балалар тапсырмалары", "Балдардын тапшырмалары", "Супоришҳои фарзандон", "Balalar tapsırmaları")}
        right={<IconButton th={th} label={L(lg, "Yangilash", "Обновить", "Refresh", "Жаңарту", "Жаңылоо", "Навсозӣ", "Jańalaw")} icon={Ico.repeat(th.ac)} onClick={doReload} disabled={vSyncing} />} />

      {/* ── Vazifa qo'shish — kit BottomSheet ── */}
      {/* Vazifa qo'shish yagona formada — App.jsx global modal (emoji→nom + muddat). Ikkilik oldini olish uchun bu BottomSheet o'chirilgan. */}
      <BottomSheet th={th} open={false} onClose={closeAdd} title={L(lg, "Yangi vazifa berish", "Новое задание", "Add new task", "Жаңа тапсырма беру", "Жаңы тапшырма берүү", "Супориши нав додан", "Jańa tapsırma beriw")}>
        {/* Kim uchun */}
        <SectionHeader th={th} style={{ marginTop: 0 }}>{L(lg, "Kim uchun?", "Для кого?", "For whom?", "Кім үшін?", "Ким үчүн?", "Барои кӣ?", "Kim ushın?")}</SectionHeader>
        {kids.length === 0
          ? <WarningCard th={th} icon={Ico.users(th.am)} title={L(lg, "Bola akkaunti yo'q", "Нет детского аккаунта", "No kid account", "Бала аккаунты жоқ", "Бала аккаунту жок", "Ҳисоби фарзанд нест", "Bala akkauntı joq")}>
              {L(lg,
                "Avval bola akkaunti yarating (Profil \u2192 Bola akkaunti qo'shish)",
                "Сначала создайте детский аккаунт (Профиль \u2192 Добавить детский аккаунт)",
                "Create a kid account first",
                "Алдымен бала аккаунтын жасаңыз (Профиль \u2192 Бала аккаунтын қосу)",
                "Адегенде бала аккаунтун түзүңүз (Профиль \u2192 Бала аккаунтун кошуу)",
                "Аввал ҳисоби фарзандро эҷод кунед (Профил \u2192 Илова кардани ҳисоби фарзанд)",
                "Aldın bala akkauntın jaratıń (Profil \u2192 Bala akkauntın qosıw)"
              )}
            </WarningCard>
          : <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 + 2, overflowX: "auto", paddingBottom: SPACE.s1 }}>
              {kids.map(k => {
                const on = vAssignee === k.id;
                return (
                  <button key={k.id} className="ui-press" onClick={() => setVAssignee(k.id)} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: SPACE.s2, background: on ? th.ac + ALPHA.tint : th.surH, border: "2px solid " + (on ? th.ac : th.bor), borderRadius: RADIUS.m - 2, padding: SPACE.s2 + "px " + SPACE.s3 + "px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                    <KidAvatar th={th} name={k.ism} size={SPACE.s6 + SPACE.s1} />
                    <span>
                      <span style={{ display: "block", ...TYPE.caption, fontWeight: 700, color: on ? th.ac : th.t2 }}>{k.ism}</span>
                      {k.login && <span style={{ display: "block", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontSize: TYPE.tiny.fontSize - 1, fontWeight: 400, color: th.t3 }}>{k.login}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
        }

        {/* ── Yoshga mos tavsiyalar (offline intellekt) ── */}
        {recs && (
          <>
            <SectionHeader th={th}
              right={<Badge th={th} type={recs.age != null ? "info" : "warning"}>
                {recs.age != null ? (recs.age + L(lg, " yosh", " лет", " y.o.", " жас", " жаш", " сола", " jas")) : L(lg, "Yosh kiritilmagan", "Возраст не указан", "No birth year", "Жасы көрсетілмеген", "Жашы көрсөтүлгөн эмес", "Сол ворид карда нашуд", "Jası kirsetilmegen")}
              </Badge>}>
              {L(lg, "Yoshga mos tavsiyalar", "Рекомендации по возрасту", "Age-based suggestions", "Жасқа сай ұсыныстар", "Жашка ылайык сунуштар", "Тавсияҳои мутобиқи син", "Jasqa sáykes usınıslar")}
            </SectionHeader>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, margin: "-" + SPACE.s1 + "px 0 " + SPACE.s2 + "px", paddingLeft: SPACE.s1 }}>
              {recs.group[lg] || recs.group.uz}
              {recs.age == null && L(lg,
                " \u00b7 aniq tavsiya uchun Profil \u2192 Bola akkauntida tug'ilgan yilini kiriting",
                " \u00b7 для точных советов укажите год рождения в профиле ребёнка",
                " \u00b7 add birth year in the kid profile for precise tips",
                " \u00b7 нақты кеңес үшін бала профилінде туған жылын көрсетіңіз",
                " \u00b7 так сунуш үчүн бала профилинде туулган жылын көрсөтүңүз",
                " \u00b7 барои тавсияи дақиқ соли таваллудро дар профили фарзанд ворид кунед",
                " \u00b7 anıq maslahat ushın bala profilinde tuwılǵan jılın kirsetiń"
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 + 2 }}>
              {recs.items.map(r => (
                <button key={r.id} className="ui-press" onClick={() => pickRec(r)}
                  style={{ textAlign: "left", background: th.ac + ALPHA.faint, border: "1.5px solid " + th.ac + ALPHA.med, borderRadius: RADIUS.s + 2, padding: (SPACE.s2 + 2) + "px " + SPACE.s3 + "px", cursor: "pointer", fontFamily: "inherit", minWidth: 0 }}>
                  <span style={{ display: "block", ...TYPE.caption, fontWeight: 700, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.s1, marginTop: 2 }}>
                    <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.ac, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason}</span>
                    <span style={{ ...TYPE.tiny, letterSpacing: 0, color: th.t3, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>~{f(r.reward, true)}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Vazifa tanlash — 4 ustunli grid, SVG ikonkalar */}
        <SectionHeader th={th}>{L(lg, "Vazifani tanlang", "Выберите задание", "Choose a task", "Тапсырманы таңдаңыз", "Тапшырманы тандаңыз", "Супоришро интихоб кунед", "Tapsırmanı saylań")}</SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: SPACE.s2, marginBottom: SPACE.s3 + 2 }}>
          {VAZIFA_PRESETS.map(p => (
            <PresetCell key={p.id} th={th} lg={lg} p={p} active={selPreset === p.id} onPick={() => pickPreset(p)} />
          ))}
        </div>

        {/* "Boshqa" tanlansa — nom yoziladi; aks holda nom avtomatik */}
        {selPreset === "boshqa" && (
          <TextInput th={th} label={L(lg, "Vazifa nomi", "Название задания", "Task title", "Тапсырма атауы", "Тапшырманын аты", "Номи супориш", "Tapsırma atı")} value={vTitle} onChange={setVTitle}
            placeholder={L(lg, "Masalan: Velosipedni tozalash", "Например: Помыть велосипед", "e.g. Clean the bike", "Мысалы: Велосипедті тазалау", "Мисалы: Велосипедди тазалоо", "Масалан: Тоза кардани дучарха", "Máselen: Velosipedti tazalaw")} autoFocus />
        )}
        {selPreset && selPreset !== "boshqa" && (
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med, borderRadius: RADIUS.s + 2, padding: (SPACE.s2 + 2) + "px " + (SPACE.s3 + 2) + "px", marginBottom: SPACE.s3 + 2 }}>
            <span style={{ display: "flex", flexShrink: 0 }}>{(TIco[selPreset] || TIco.task)(th.ac, 18)}</span>
            <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.t1, flex: 1 }}>{vTitle}</span>
            <span style={{ display: "flex", flexShrink: 0 }}>{Ico.check(th.gr)}</span>
          </div>
        )}

        {/* Mukofot summasi */}
        {selPreset && (
          <>
            <AmountInput th={th} label={L(lg, "Mukofot (so'm)", "Награда (сум)", "Reward (UZS)", "Сыйлық (сум)", "Сыйлык (сум)", "Мукофот (сум)", "Sıylıq (sóm)")} value={vReward} onChange={setVReward}
              placeholder="0" suffix={L(lg, "so'm", "сум", "UZS", "сом", "сом", "сум", "sóm")} style={{ marginBottom: SPACE.s2 + 2 }} />
            <div style={{ display: "flex", gap: SPACE.s2 - 1, marginBottom: SPACE.s4 + 2 }}>
              {[5000, 10000, 20000, 50000].map(sm => {
                const on = String(vReward) === String(sm);
                return (
                  <button key={sm} className="ui-press" onClick={() => setVReward(String(sm))} style={{ flex: 1, background: on ? th.ac + ALPHA.tint : th.surH, border: "1.5px solid " + (on ? th.ac : th.bor), borderRadius: RADIUS.s, padding: SPACE.s2 + "px 0", cursor: "pointer", ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, fontWeight: 700, color: on ? th.ac : th.t2, fontFamily: "inherit" }}>{f(sm, true)}</button>
                );
              })}
            </div>
            {/* Muddat (ixtiyoriy) — kechiksa mukofot berilmaydi */}
            <label style={{ ...TYPE.caption, fontWeight: 700, color: th.t2, display: "block", marginBottom: SPACE.s2 }}>{L(lg, "Muddat (ixtiyoriy)", "Срок (необязательно)", "Deadline (optional)", "Мерзім (міндетті емес)", "Мөөнөт (милдеттүү эмес)", "Мӯҳлат (ихтиёрӣ)", "Múddet (mındetli emes)")}</label>
            <div style={{ display: "flex", gap: SPACE.s2 - 1, marginBottom: SPACE.s2, flexWrap: "wrap" }}>
              {[
                { n: 0, uz: "Bugun", ru: "Сегодня", en: "Today", kk: "Бүгін", ky: "Бүгүн", tg: "Имрӯз", qr: "Búgin" },
                { n: 1, uz: "Ertaga", ru: "Завтра", en: "Tomorrow", kk: "Ертең", ky: "Эртең", tg: "Фардо", qr: "Erteń" },
                { n: 3, uz: "3 kun", ru: "3 дня", en: "3 days", kk: "3 күн", ky: "3 күн", tg: "3 рӯз", qr: "3 kún" },
                { n: 7, uz: "1 hafta", ru: "1 неделя", en: "1 week", kk: "1 апта", ky: "1 жума", tg: "1 ҳафта", qr: "1 apta" },
              ].map(opt => {
                const ds = addDaysStr(opt.n); const on = vDeadline === ds;
                return (
                  <button key={opt.n} type="button" className="ui-press" onClick={() => setVDeadline(on ? "" : ds)} style={{ flex: "1 0 auto", background: on ? th.ac + ALPHA.tint : th.surH, border: "1.5px solid " + (on ? th.ac : th.bor), borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", cursor: "pointer", ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, fontWeight: 700, color: on ? th.ac : th.t2, fontFamily: "inherit" }}>{L(lg, opt.uz, opt.ru, opt.en, opt.kk, opt.ky, opt.tg, opt.qr)}</button>
                );
              })}
              <button type="button" className="ui-press" onClick={() => setVDeadline("")} style={{ flex: "1 0 auto", background: !vDeadline ? th.ac + ALPHA.tint : th.surH, border: "1.5px solid " + (!vDeadline ? th.ac : th.bor), borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", cursor: "pointer", ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, fontWeight: 700, color: !vDeadline ? th.ac : th.t2, fontFamily: "inherit" }}>{L(lg, "Muddatsiz", "Без срока", "None", "Мерзімсіз", "Мөөнөтсүз", "Бе мӯҳлат", "Múddetsiz")}</button>
            </div>
            <input type="date" min={TODAY_STR()} value={vDeadline || ""} onChange={e => setVDeadline(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", background: th.bg, border: "1px solid " + th.bor, borderRadius: RADIUS.s, padding: SPACE.s3 + "px", color: th.t1, fontFamily: "inherit", fontSize: TYPE.body.fontSize, marginBottom: SPACE.s2, colorScheme: th.dark ? "dark" : "light" }} />
            {vDeadline && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s4 }}>{L(lg,
              "Muddatida bajarilmasa, mukofot berilmaydi.",
              "Если не выполнено в срок, награда не выдаётся.",
              "No reward if not completed by the deadline.",
              "Мерзімінде орындалмаса, сыйлық берілмейді.",
              "Мөөнөтүндө аткарылбаса, сыйлык берилбейт.",
              "Агар дар мӯҳлат иҷро нашавад, мукофот дода намешавад.",
              "Múddetinde orınlanbasa, sıylıq berilmeydi."
            )}</div>}
            <PrimaryButton th={th} onClick={addVazifa}>
              {TIco.target("#fff", 16)}{L(lg, "Vazifa berish", "Назначить задание", "Assign task", "Тапсырма беру", "Тапшырма берүү", "Супориш додан", "Tapsırma beriw")}
            </PrimaryButton>
          </>
        )}
      </BottomSheet>

      {/* ── Bola balansi (hero, tokenlashgan gradient) ── */}
      {isKid && (
        <div className="anim-fadeUp" style={{ background: "linear-gradient(135deg," + PREMIUM.gold + " 0%," + CHART[3] + " 60%," + CHART[5] + " 100%)", borderRadius: RADIUS.l, padding: SPACE.s6 + "px " + (SPACE.s6 - 2) + "px", marginBottom: SPACE.s4 + 2, position: "relative", overflow: "hidden", boxShadow: SHADOW.e1(CHART[3]) }}>
          <div style={{ position: "absolute", top: -SPACE.s8, right: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, color: "rgba(255,255,255,0.9)", marginBottom: SPACE.s1 }}>{L(lg, "Mening cho'ntak pulim", "Мои карманные деньги", "My pocket money", "Менің қалта ақшам", "Менин чөнтөк акчам", "Пули ҷайбии ман", "Meniń qalta aqsham")}</div>
            <div style={{ ...TYPE.hero, fontSize: TYPE.hero.fontSize + 4, color: "#fff", marginBottom: SPACE.s1 + 2, fontVariantNumeric: "tabular-nums" }}>{f(kidBalances[user.id] || 0, true)}</div>
            <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: SPACE.s1 + 2, flexWrap: "wrap" }}>
              {TIco.trophy("#fff", 12)}{myStats.count} {L(lg, "ta vazifa bajarildi", "заданий выполнено", "tasks done", "тапсырма орындалды", "тапшырма аткарылды", "супориш иҷро шуд", "tapsırma orınlandı")} · {TIco.target("#fff", 12)}{L(lg, "vazifadan", "с заданий", "from tasks", "тапсырмадан", "тапшырмадан", "аз супоришҳо", "tapsırmadan")}: {f(myStats.earn, true)}
            </div>
          </div>
        </div>
      )}

      {/* ── Dublikat bola akkauntlarini tozalash (oila boshi) ── */}
      {hasDup && (
        <AppCard th={th} onClick={doCleanup} pad={SPACE.s3} style={{ background: th.am + ALPHA.faint, border: "1.5px solid " + th.am + ALPHA.strong }}>
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
            <div style={{ width: SPACE.s8 + SPACE.s1, height: SPACE.s8 + SPACE.s1, borderRadius: RADIUS.s, background: th.am + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{TIco.broom(th.am, 20)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.am }}>{L(lg, "Eski bola akkauntlarini tozalash", "Очистить дублирующие детские аккаунты", "Clean duplicate kid accounts", "Ескі бала аккаунттарын тазалау", "Эски бала аккаунттарын тазалоо", "Тоза кардани ҳисобҳои такрории фарзанд", "Eski bala akkauntların tazalaw")}</div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 2 }}>{L(lg,
                "Dublikatlar o'chiriladi, pullar haqiqiy akkauntga jamlanadi",
                "Дубликаты удаляются, деньги объединяются в основном аккаунте",
                "Removes duplicates, merges balances",
                "Дубликаттар өшіріледі, қаражат негізгі аккаунтқа біріктіріледі",
                "Дубликаттар өчүрүлөт, каражат негизги аккаунтка бириктирилет",
                "Такрорҳо нест мешаванд, маблағҳо ба ҳисоби асосӣ муттаҳид мешаванд",
                "Dublikatlar óshiriledi, aqsha aslı akkauntqa birlestiriledi"
              )}</div>
            </div>
          </div>
        </AppCard>
      )}

      {/* ── Katta a'zolar: vazifa qo'shish yoki farzand uchun taklif qilish ── */}
      {(canAssignTask(user) || isKid) && (
        <PrimaryButton th={th} onClick={openAdd} style={{ marginBottom: SPACE.s4 }}>
          {Ico.add("#fff")}{isKid
            ? L(lg, "Vazifa taklif qilish", "Предложить задание", "Propose a task", "Тапсырма ұсыну", "Тапшырма сунуштоо", "Пешниҳоди супориш", "Tapsırma usınıw")
            : L(lg, "Yangi vazifa berish", "Новое задание", "New task", "Жаңа тапсырма беру", "Жаңы тапшырма берүү", "Супориши нав", "Jańa tapsırma beriw")}
        </PrimaryButton>
      )}

      {/* ── Bolalar reytingi (AppCard + TaskRow) ── */}
      {kids.length > 0 && (
        <AppCard th={th} style={{ marginBottom: SPACE.s4, background: CHART[5] + ALPHA.faint, border: "1px solid " + CHART[5] + ALPHA.med }}>
          <SubHeader th={th}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 + 2 }}>{TIco.trophy(th.am, 14)}{L(lg, "Bolalar reytingi", "Рейтинг детей", "Kids leaderboard", "Балалар рейтингі", "Балдардын рейтинги", "Рейтинги фарзандон", "Balalar reytingi")}</span>
          </SubHeader>
          {leaderboard.map((k, i) => (
            <TaskRow key={k.id} th={th} lg={lg} rank={i + 1} name={k.name} done={k.done} taskEarn={k.taskEarn} bal={k.bal} last={i === leaderboard.length - 1} />
          ))}
        </AppCard>
      )}

      {/* ── Vazifalar ro'yxati ── */}
      <SectionHeader th={th}>{L(lg, "Vazifalar", "\u0417\u0430\u0434\u0430\u043d\u0438\u044f", "Tasks", "\u0422\u0430\u043f\u0441\u044b\u0440\u043c\u0430\u043b\u0430\u0440", "\u0422\u0430\u043f\u0448\u044b\u0440\u043c\u0430\u043b\u0430\u0440", "\u0421\u0443\u043f\u043e\u0440\u0438\u0448\u04b3\u043e", "Taps\u0131rmalar")}</SectionHeader>
      {isKid && myTasks.length === 0 && vazifalar.length > 0 ? (
        <EmptyState th={th} icon={TIco.searchBig(th.t3)}
          title={L(lg, "Vazifalar bor, lekin sizga biriktirilmagan", "\u0417\u0430\u0434\u0430\u043d\u0438\u044f \u0435\u0441\u0442\u044c, \u043d\u043e \u043d\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u044b \u0432\u0430\u043c", "Tasks exist but not assigned to you", "\u0422\u0430\u043f\u0441\u044b\u0440\u043c\u0430\u043b\u0430\u0440 \u0431\u0430\u0440, \u0431\u0456\u0440\u0430\u049b \u0441\u0456\u0437\u0433\u0435 \u0442\u0430\u0493\u0430\u0439\u044b\u043d\u0434\u0430\u043b\u043c\u0430\u0493\u0430\u043d", "\u0422\u0430\u043f\u0448\u044b\u0440\u043c\u0430\u043b\u0430\u0440 \u0431\u0430\u0440, \u0431\u0438\u0440\u043e\u043a \u0441\u0438\u0437\u0433\u0435 \u0434\u0430\u0439\u044b\u043d\u0434\u0430\u043b\u0433\u0430\u043d \u044d\u043c\u0435\u0441", "\u0421\u0443\u043f\u043e\u0440\u0438\u0448\u04b3\u043e \u043c\u0430\u0432\u04b7\u0443\u0434\u0430\u043d\u0434, \u0430\u043c\u043c\u043e \u0431\u0430 \u0448\u0443\u043c\u043e \u0432\u043e\u0433\u0443\u0437\u043e\u0440 \u043d\u0430\u0448\u0443\u0434\u0430\u0430\u043d\u0434", "Taps\u0131rmalar bar, biraq sizge taps\u0131r\u0131lma\u01f5an")}
          message={
            <span>
              {L(lg, "Ro'yxatdagi vazifalar kimga berilgan:", "\u041a\u043e\u043c\u0443 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u044b \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0432 \u0441\u043f\u0438\u0441\u043a\u0435:", "Assigned to:", "\u0422\u0456\u0437\u0456\u043c\u0434\u0435\u0433\u0456 \u0442\u0430\u043f\u0441\u044b\u0440\u043c\u0430\u043b\u0430\u0440 \u043a\u0456\u043c\u0433\u0435 \u0431\u0435\u0440\u0456\u043b\u0433\u0435\u043d:", "\u0422\u0438\u0437\u043c\u0435\u0434\u0435\u0433\u0438 \u0442\u0430\u043f\u0448\u044b\u0440\u043c\u0430\u043b\u0430\u0440 \u043a\u0438\u043c\u0433\u0435 \u0431\u0435\u0440\u0438\u043b\u0433\u0435\u043d:", "\u0421\u0443\u043f\u043e\u0440\u0438\u0448\u04b3\u043e\u0438 \u0440\u04ef\u0439\u0445\u0430\u0442 \u0431\u0430 \u043a\u04e3 \u0434\u043e\u0434\u0430 \u0448\u0443\u0434\u0430\u0430\u043d\u0434:", "Dizimdegi taps\u0131rmalar kimge berilgen:")}
              {vazifalar.slice(0, 3).map(v => (
                <span key={v.id} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 + 2, marginTop: SPACE.s1 }}>
                  {taskIco(v.emoji, th.t3, 13)}{v.title} {"\u2192"} <b style={{ color: th.am }}>{v.assignedName || v.assignedTo}</b>
                </span>
              ))}
              <span style={{ display: "block", marginTop: SPACE.s2 + 2, fontSize: TYPE.caption.fontSize - 1 }}>
                {L(lg, "Sizning hisobingiz:", "\u0412\u0430\u0448 \u0430\u043a\u043a\u0430\u0443\u043d\u0442:", "Your account:", "\u0421\u0456\u0437\u0434\u0456\u04a3 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u044b\u04a3\u044b\u0437:", "\u0421\u0438\u0437\u0434\u0438\u043d \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0443\u04a3\u0443\u0437:", "\u04b2\u0438\u0441\u043e\u0431\u0438 \u0448\u0443\u043c\u043e:", "Sizdi\u0144 akkaunt\u0131\u0144\u0131z:")} <b style={{ color: th.ac }}>{user.ism}</b> ({user.login || user.id})
              </span>
            </span>
          } />
      ) : myTasks.length === 0 ? (
        <EmptyState th={th} icon={isKid ? TIco.taskBig(th.t3) : undefined} preset={isKid ? undefined : "goal"}
          title={isKid
            ? L(lg, "Hali vazifa yo'q", "\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0437\u0430\u0434\u0430\u043d\u0438\u0439", "No tasks yet", "\u04d8\u0437\u0456\u0440\u0433\u0435 \u0442\u0430\u043f\u0441\u044b\u0440\u043c\u0430 \u0436\u043e\u049b", "\u0410\u0437\u044b\u0440\u044b\u043d\u0447\u0430 \u0442\u0430\u043f\u0448\u044b\u0440\u043c\u0430 \u0436\u043e\u043a", "\u04b2\u0430\u043d\u04ef\u0437 \u0441\u0443\u043f\u043e\u0440\u0438\u0448 \u043d\u0435\u0441\u0442", "\u00c1li taps\u0131rma joq")
            : L(lg, "Hali vazifa bermadingiz", "\u0412\u044b \u0435\u0449\u0451 \u043d\u0435 \u0441\u043e\u0437\u0434\u0430\u043b\u0438 \u0437\u0430\u0434\u0430\u043d\u0438\u0439", "No tasks created", "\u0421\u0456\u0437 \u04d9\u043b\u0456 \u0442\u0430\u043f\u0441\u044b\u0440\u043c\u0430 \u0431\u0435\u0440\u043c\u0435\u0434\u0456\u04a3\u0456\u0437", "\u0421\u0438\u0437 \u0434\u0430\u0433\u044b \u0442\u0430\u043f\u0448\u044b\u0440\u043c\u0430 \u0431\u0435\u0440\u0433\u0435\u043d \u0436\u043e\u043a\u0441\u0443\u0437", "\u0428\u0443\u043c\u043e \u04b3\u0430\u043d\u04ef\u0437 \u0441\u0443\u043f\u043e\u0440\u0438\u0448 \u043d\u0430\u0434\u043e\u0434\u0430\u0435\u0434", "S\u0456z \u00e1li taps\u0131rma bermedi\u0144")}
          message={isKid
            ? L(lg, "Ota-onangiz tez orada vazifa beradi, yoki o'zingiz vazifa taklif qilishingiz mumkin.", "\u0420\u043e\u0434\u0438\u0442\u0435\u043b\u0438 \u0441\u043a\u043e\u0440\u043e \u0434\u0430\u0434\u0443\u0442 \u0437\u0430\u0434\u0430\u043d\u0438\u0435, \u0438\u043b\u0438 \u0432\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0438\u0442\u044c \u0435\u0433\u043e \u0441\u0430\u043c\u0438.", "Your parent will add tasks soon, or you can propose a task yourself.", "\u0410\u0442\u0430-\u0430\u043d\u0430\u04a3\u044b\u0437 \u0436\u0430\u049b\u044b\u043d\u0434\u0430 \u0442\u0430\u043f\u0441\u044b\u0440\u043c\u0430 \u0431\u0435\u0440\u0435\u0434\u0456, \u043d\u0435\u043c\u0435\u0441\u0435 \u04e9\u0437\u0456\u04a3\u0456\u0437 \u04b1\u0441\u044b\u043d\u0430 \u0430\u043b\u0430\u0441\u044b\u0437.", "\u0410\u0442\u0430-\u044d\u043d\u0435\u04a3\u0438\u0437 \u0436\u0430\u043a\u044b\u043d\u0434\u0430 \u0442\u0430\u043f\u0448\u044b\u0440\u043c\u0430 \u0431\u0435\u0440\u0435\u0442, \u0436\u0435 \u04e9\u0437\u04af\u04a3\u04af\u0437 \u0441\u0443\u043d\u0443\u0448\u0442\u0430\u0439 \u0430\u043b\u0430\u0441\u044b\u0437.", "\u0412\u043e\u043b\u0438\u0434\u0430\u0439\u043d\u0430\u0442\u043e\u043d \u0431\u0430 \u0437\u0443\u0434\u04e3 \u0441\u0443\u043f\u043e\u0440\u0438\u0448 \u043c\u0435\u0434\u0438\u04b3\u0430\u043d\u0434, \u0451 \u0448\u0443\u043c\u043e \u0445\u0443\u0434\u0430\u0442\u043e\u043d \u043f\u0435\u0448\u043d\u0438\u04b3\u043e\u0434 \u043a\u0430\u0440\u0434\u0430 \u043c\u0435\u0442\u0430\u0432\u043e\u043d\u0435\u0434.", "Ata-ana\u0144\u0131z jaq\u0131nda taps\u0131rma beredi, yamasa \u00f3zi\u0144 us\u0131n\u0131w q\u0131l\u0131w\u0131\u0144\u0131z m\u00famkin.")
            : L(lg, "Bolalaringizga vazifa berib, ularni rag'batlantiring", "\u0414\u0430\u0432\u0430\u0439\u0442\u0435 \u0434\u0435\u0442\u044f\u043c \u0437\u0430\u0434\u0430\u043d\u0438\u044f \u0438 \u043c\u043e\u0442\u0438\u0432\u0438\u0440\u0443\u0439\u0442\u0435 \u0438\u0445", "Add tasks to motivate your kids", "\u0411\u0430\u043b\u0430\u043b\u0430\u0440\u044b\u04a3\u044b\u0437\u0493\u0430 \u0442\u0430\u043f\u0441\u044b\u0440\u043c\u0430 \u0431\u0435\u0440\u0456\u043f, \u044b\u043d\u0442\u0430\u043b\u0430\u043d\u0434\u044b\u0440\u044b\u04a3\u044b\u0437", "\u0411\u0430\u043b\u0434\u0430\u0440\u044b\u04a3\u044b\u0437\u0433\u0430 \u0442\u0430\u043f\u0448\u044b\u0440\u043c\u0430 \u0431\u0435\u0440\u0438\u043f, \u0448\u044b\u043a\u0442\u0430\u043d\u0434\u044b\u0440\u044b\u04a3\u044b\u0437", "\u0411\u0430 \u0444\u0430\u0440\u0437\u0430\u043d\u0434\u043e\u043d\u0430\u0442\u043e\u043d \u0441\u0443\u043f\u043e\u0440\u0438\u0448 \u0434\u0438\u04b3\u0435\u0434 \u0432\u0430 \u043e\u043d\u04b3\u043e\u0440\u043e \u04b3\u0430\u0432\u0430\u0441\u043c\u0430\u043d\u0434 \u043a\u0443\u043d\u0435\u0434", "Balalar\u0131\u0144\u0131z\u01f5a taps\u0131rma berip, ruwxland\u0131r\u0131\u0144")}
          actionText={isKid
            ? L(lg, "Vazifa taklif qilish", "\u041f\u0440\u0435\u0434\u043b\u043e\u0436\u0438\u0442\u044c \u0437\u0430\u0434\u0430\u043d\u0438\u0435", "Propose a task", "\u0422\u0430\u043f\u0441\u044b\u0440\u043c\u0430 \u04b1\u0441\u044b\u043d\u0443", "\u0422\u0430\u043f\u0448\u044b\u0440\u043c\u0430 \u0441\u0443\u043d\u0443\u0448\u0442\u043e\u043e", "\u041f\u0435\u0448\u043d\u0438\u04b3\u043e\u0434\u0438 \u0441\u0443\u043f\u043e\u0440\u0438\u0448", "Taps\u0131rma us\u0131n\u0131w")
            : L(lg, "Vazifa berish", "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u0434\u0430\u043d\u0438\u0435", "Add task", "\u0422\u0430\u043f\u0441\u044b\u0440\u043c\u0430 \u0431\u0435\u0440\u0443", "\u0422\u0430\u043f\u0448\u044b\u0440\u043c\u0430 \u0431\u0435\u0440\u04af\u04af", "\u0418\u043b\u043e\u0432\u0430 \u043a\u0430\u0440\u0434\u0430\u043d\u0438 \u0441\u0443\u043f\u043e\u0440\u0438\u0448", "Taps\u0131rma qos\u0131w")}
          onAction={openAdd} />
      ) : (
        myTasks.map(v => (
          <TaskCard key={v.id} th={th} lg={lg} v={v}
            kidName={kidById[v.assignedTo]?.ism}
            isKid={isKid}
            canDelete={canDeleteTask(user, v)}
            onDone={() => vazifaDone(v.id)}
            onApprove={() => vazifaApprove(v.id)}
            onReject={vazifaReject ? () => vazifaReject(v.id) : null}
            onAcceptProposed={vazifaAcceptProposed}
            onAskDelete={() => askDelete(v.id)} />
        ))
      )}

      {/* ── O'chirish tasdig'i — kit ConfirmDialog ── */}
      <ConfirmDialog th={th} open={delId != null} onClose={() => setDelId(null)} onConfirm={confirmDelete}
        title={L(lg, "Vazifani o'chirish", "Удалить задание", "Delete task", "Тапсырманы жою", "Тапшырманы жоюу", "Нест кардани супориш", "Tapsırmanı óshiriw")}
        message={L(lg, "Bu vazifa butunlay o'chiriladi. Davom etasizmi?", "Это задание будет удалено навсегда. Продолжить?", "This task will be permanently deleted. Continue?", "Бұл тапсырма мүлдем жойылады. Жалғастырасыз ба?", "Бул тапшырма биротоло өчүрүлөт. Улантасызбы?", "Ин супориш пурра нест карда мешавад. Идома медиҳед?", "Bul tapsırma pútkilley óshiriledi. Dawam etesiz be?")}
        confirmText={L(lg, "O'chirish", "Удалить", "Delete", "Жою", "Жоюу", "Нест кардан", "Óshiriw")}
        cancelText={L(lg, "Bekor qilish", "Отмена", "Cancel", "Бас тарту", "Жокко чыгаруу", "Бекор кардан", "Biykar etiw")} />
    </div>
  );
}
