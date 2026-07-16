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

// Tayyor vazifalar to'plami — 4 ustunli grid uchun
// (e — DATA emoji: bazaga avvalgidek yoziladi, UI'da ko'rsatilmaydi)
const VAZIFA_PRESETS = [
  { id: "kitob",    e: "📚", uz: "Kitob o'qish",           en: "Reading" },
  { id: "xona",     e: "🧹", uz: "Xonani yig'ishtirish",   en: "Clean room" },
  { id: "idish",    e: "🍽️", uz: "Idish yuvish",     en: "Wash dishes" },
  { id: "dokon",    e: "🛒", uz: "Do'kondan xarid",        en: "Grocery run" },
  { id: "gul",      e: "🌱", uz: "Gullarni sug'orish",     en: "Water plants" },
  { id: "axlat",    e: "🚮", uz: "Axlatni chiqarish",      en: "Take out trash" },
  { id: "orin",     e: "🛏️", uz: "O'rinni yig'ish",  en: "Make the bed" },
  { id: "darslik",  e: "📝", uz: "Uy vazifasini bajarish", en: "Do homework" },
  { id: "kir",      e: "🧺", uz: "Kir yuvishga yordam",    en: "Laundry help" },
  { id: "ovqat",    e: "🍳", uz: "Ovqatga yordam",         en: "Help cooking" },
  { id: "sport",    e: "🚴", uz: "Sport qilish",           en: "Exercise" },
  { id: "musiqa",   e: "🎹", uz: "Musiqa mashqi",          en: "Music practice" },
  { id: "oyinchoq", e: "🧸", uz: "O'yinchoqlarni yig'ish", en: "Tidy toys" },
  { id: "hayvon",   e: "🐕", uz: "Hayvonga qarash",        en: "Pet care" },
  { id: "deraza",   e: "🪟", uz: "Deraza artish",          en: "Clean windows" },
  { id: "soz",      e: "🧠", uz: "Yangi so'z yodlash",     en: "Learn new words" },
  { id: "buvi",     e: "🤲", uz: "Kattalarga yordam",      en: "Help elders" },
  { id: "rasm",     e: "🎨", uz: "Rasm chizish",           en: "Drawing" },
  { id: "sayr",     e: "🏃", uz: "Toza havoda sayr",       en: "Outdoor walk" },
  { id: "boshqa",   e: "✨",     uz: "Boshqa",                 en: "Other" },
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
    case "approved": return { c: th.gr, type: "success", label: lg === "uz" ? "Tasdiqlandi" : "Approved",       prog: 100 };
    case "done":     return { c: th.am, type: "warning", label: lg === "uz" ? "Tekshirilmoqda" : "Pending review", prog: 66 };
    case "rejected": return { c: th.rd, type: "danger",  label: lg === "uz" ? "Rad etildi" : "Rejected",        prog: 0 };
    case "expired":  return { c: th.t3, type: "status",  tone: th.t3, label: lg === "uz" ? "Muddati o'tgan" : "Expired", prog: 0 };
    case "proposed": return { c: th.ac2 || th.ac, type: "info", label: lg === "uz" ? "Taklif qilindi" : "Proposed", prog: 15 };
    default:         return { c: th.ac, type: "info",    label: lg === "uz" ? "Bajarilmagan" : "To do",         prog: 8 };
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
          {v.sana && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{TIco.cal(th.t3)}{lg === "uz" ? "Berilgan" : "Assigned"}: {v.sana}</span>}
          {v.deadline && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, color: dlPast ? th.rd : th.am, fontWeight: 700 }}>{TIco.clock(dlPast ? th.rd : th.am)}{lg === "uz" ? "Muddat" : "Due"}: {v.deadline}{dlPast ? (lg === "uz" ? " (o'tgan)" : " (passed)") : ""}</span>}
          {v.createdByName && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{Ico.user(th.t3)}{lg === "uz" ? "Berdi" : "By"}: {v.createdByName}</span>}
          {v.doneSana && <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{TIco.clock(th.t3)}{lg === "uz" ? "Bajarildi" : "Done"}: {v.doneSana}</span>}
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
            {lg === "uz" ? "Farzand taklif qilgan mukofotni kelishish:" : "Negotiate child's proposed reward:"}
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
            <span style={{ ...TYPE.caption, color: th.t2 }}>{lg === "uz" ? "so'm" : "UZS"}</span>
          </div>
          <div style={{ display: "flex", gap: SPACE.s2 }}>
            <PrimaryButton th={th} onClick={() => onAcceptProposed && onAcceptProposed(v.id, customReward)} style={{ flex: 1, padding: "8px", background: th.gr }}>
              {Ico.check("#fff")}{lg === "uz" ? "Tasdiqlash" : "Approve"}
            </PrimaryButton>
            <DangerButton th={th} onClick={onAskDelete} style={{ flex: 1, padding: "8px" }}>
              {Ico.trash(th.rd)}{lg === "uz" ? "Rad etish" : "Reject"}
            </DangerButton>
          </div>
        </div>
      )}

      {/* Action buttons — kit tugmalar */}
      <div style={{ display: "flex", gap: SPACE.s2, marginTop: SPACE.s3 }}>
        {isKid && st === "proposed" && (
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2, padding: (SPACE.s2 + 2) + "px", ...TYPE.caption, fontWeight: 600, color: th.ac }}>
              {TIco.clock(th.ac)}{lg === "uz" ? "Taklif yuborildi. Ota-ona tasdiqlashi kutilmoqda" : "Proposal sent. Awaiting parent approval"}
            </div>
            {canDelete && (
              <DangerButton th={th} onClick={onAskDelete} style={{ padding: "8px 12px", fontSize: TYPE.caption.fontSize, width: "auto", alignSelf: "flex-start", marginTop: 4 }}>
                {Ico.trash(th.rd)}{lg === "uz" ? "Taklifni o'chirish" : "Cancel proposal"}
              </DangerButton>
            )}
          </div>
        )}
        {isKid && st === "pending" && (
          <PrimaryButton th={th} onClick={onDone} style={{ padding: (SPACE.s2 + 2) + "px" }}>
            {Ico.check("#fff")}{lg === "uz" ? "Bajardim" : "Done"}
          </PrimaryButton>
        )}
        {isKid && st === "done" && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 + 2, padding: (SPACE.s2 + 2) + "px", ...TYPE.caption, fontWeight: 600, color: th.am }}>
            {TIco.clock(th.am)}{lg === "uz" ? "Ota-ona tasdig'i kutilmoqda" : "Awaiting approval"}
          </div>
        )}
        {isKid && st === "approved" && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 + 2, padding: (SPACE.s2 + 2) + "px", ...TYPE.caption, fontWeight: 700, color: th.gr }}>
            {TIco.party(th.gr)}{lg === "uz" ? "Mukofot olindi!" : "Reward received!"}
          </div>
        )}
        {!isKid && st === "done" && (
          <>
            <PrimaryButton th={th} onClick={onApprove} style={{ flex: 2, width: "auto", padding: (SPACE.s2 + 2) + "px", background: th.gr, boxShadow: SHADOW.e1(th.gr) }}>
              {Ico.check("#fff")}{lg === "uz" ? "Tasdiqlash" : "Approve"}
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
            {Ico.trash(th.rd)}{lg === "uz" ? "O'chirish" : "Delete"}
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
          {TIco.trophy(th.am, 11)}{done} {lg === "uz" ? "vazifa" : "tasks"} · {TIco.target(th.t3, 11)}{lg === "uz" ? "vazifadan" : "from tasks"}: <b style={{ color: th.gr }}>{f(taskEarn, true)}</b>
        </div>
        <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 2, color: th.t2, marginTop: 1, display: "flex", alignItems: "center", gap: SPACE.s1 }}>
          {TIco.coin(th.t3, 10)}{lg === "uz" ? "Cho'ntakda" : "Pocket"}: {f(bal, true)}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ ...TYPE.heading, fontSize: TYPE.heading.fontSize - 1, color: CHART[5], fontVariantNumeric: "tabular-nums" }}>{done * 10}</div>
        <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontSize: TYPE.tiny.fontSize - 1, color: th.t2 }}>{lg === "uz" ? "ball" : "pts"}</div>
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
      <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 700, color: active ? th.ac : th.t2, textAlign: "center", lineHeight: 1.25 }}>{lg === "uz" ? p.uz : p.en}</span>
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
    else setVTitle(lg === "uz" ? p.uz : p.en);
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
        title={lg === "uz" ? "Farzand vazifalari" : "Kids' tasks"}
        right={<IconButton th={th} label={lg === "uz" ? "Yangilash" : "Refresh"} icon={Ico.repeat(th.ac)} onClick={doReload} disabled={vSyncing} />} />

      {/* ── Vazifa qo'shish — kit BottomSheet ── */}
      {/* Vazifa qo'shish yagona formada — App.jsx global modal (emoji→nom + muddat). Ikkilik oldini olish uchun bu BottomSheet o'chirilgan. */}
      <BottomSheet th={th} open={false} onClose={closeAdd} title={lg === "uz" ? "Yangi vazifa berish" : "Add new task"}>
        {/* Kim uchun */}
        <SectionHeader th={th} style={{ marginTop: 0 }}>{lg === "uz" ? "Kim uchun?" : "For whom?"}</SectionHeader>
        {kids.length === 0
          ? <WarningCard th={th} icon={Ico.users(th.am)} title={lg === "uz" ? "Bola akkaunti yo'q" : "No kid account"}>
              {lg === "uz" ? "Avval bola akkaunti yarating (Profil \u2192 Bola akkaunti qo'shish)" : "Create a kid account first"}
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
                {recs.age != null ? (recs.age + (lg === "uz" ? " yosh" : " y.o.")) : (lg === "uz" ? "Yosh kiritilmagan" : "No birth year")}
              </Badge>}>
              {lg === "uz" ? "Yoshga mos tavsiyalar" : "Age-based suggestions"}
            </SectionHeader>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, margin: "-" + SPACE.s1 + "px 0 " + SPACE.s2 + "px", paddingLeft: SPACE.s1 }}>
              {lg === "uz" ? recs.group.uz : recs.group.en}
              {recs.age == null && (lg === "uz" ? " \u00b7 aniq tavsiya uchun Profil \u2192 Bola akkauntida tug'ilgan yilini kiriting" : " \u00b7 add birth year in the kid profile for precise tips")}
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
        <SectionHeader th={th}>{lg === "uz" ? "Vazifani tanlang" : "Choose a task"}</SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: SPACE.s2, marginBottom: SPACE.s3 + 2 }}>
          {VAZIFA_PRESETS.map(p => (
            <PresetCell key={p.id} th={th} lg={lg} p={p} active={selPreset === p.id} onPick={() => pickPreset(p)} />
          ))}
        </div>

        {/* "Boshqa" tanlansa — nom yoziladi; aks holda nom avtomatik */}
        {selPreset === "boshqa" && (
          <TextInput th={th} label={lg === "uz" ? "Vazifa nomi" : "Task title"} value={vTitle} onChange={setVTitle}
            placeholder={lg === "uz" ? "Masalan: Velosipedni tozalash" : "e.g. Clean the bike"} autoFocus />
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
            <AmountInput th={th} label={lg === "uz" ? "Mukofot (so'm)" : "Reward (UZS)"} value={vReward} onChange={setVReward}
              placeholder="0" suffix={lg === "uz" ? "so'm" : "UZS"} style={{ marginBottom: SPACE.s2 + 2 }} />
            <div style={{ display: "flex", gap: SPACE.s2 - 1, marginBottom: SPACE.s4 + 2 }}>
              {[5000, 10000, 20000, 50000].map(sm => {
                const on = String(vReward) === String(sm);
                return (
                  <button key={sm} className="ui-press" onClick={() => setVReward(String(sm))} style={{ flex: 1, background: on ? th.ac + ALPHA.tint : th.surH, border: "1.5px solid " + (on ? th.ac : th.bor), borderRadius: RADIUS.s, padding: SPACE.s2 + "px 0", cursor: "pointer", ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, fontWeight: 700, color: on ? th.ac : th.t2, fontFamily: "inherit" }}>{f(sm, true)}</button>
                );
              })}
            </div>
            {/* Muddat (ixtiyoriy) — kechiksa mukofot berilmaydi */}
            <label style={{ ...TYPE.caption, fontWeight: 700, color: th.t2, display: "block", marginBottom: SPACE.s2 }}>{lg === "uz" ? "Muddat (ixtiyoriy)" : "Deadline (optional)"}</label>
            <div style={{ display: "flex", gap: SPACE.s2 - 1, marginBottom: SPACE.s2, flexWrap: "wrap" }}>
              {[{ n: 0, uz: "Bugun", en: "Today" }, { n: 1, uz: "Ertaga", en: "Tomorrow" }, { n: 3, uz: "3 kun", en: "3 days" }, { n: 7, uz: "1 hafta", en: "1 week" }].map(opt => {
                const ds = addDaysStr(opt.n); const on = vDeadline === ds;
                return (
                  <button key={opt.n} type="button" className="ui-press" onClick={() => setVDeadline(on ? "" : ds)} style={{ flex: "1 0 auto", background: on ? th.ac + ALPHA.tint : th.surH, border: "1.5px solid " + (on ? th.ac : th.bor), borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", cursor: "pointer", ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, fontWeight: 700, color: on ? th.ac : th.t2, fontFamily: "inherit" }}>{lg === "uz" ? opt.uz : opt.en}</button>
                );
              })}
              <button type="button" className="ui-press" onClick={() => setVDeadline("")} style={{ flex: "1 0 auto", background: !vDeadline ? th.ac + ALPHA.tint : th.surH, border: "1.5px solid " + (!vDeadline ? th.ac : th.bor), borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", cursor: "pointer", ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, fontWeight: 700, color: !vDeadline ? th.ac : th.t2, fontFamily: "inherit" }}>{lg === "uz" ? "Muddatsiz" : "None"}</button>
            </div>
            <input type="date" min={TODAY_STR()} value={vDeadline || ""} onChange={e => setVDeadline(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", background: th.bg, border: "1px solid " + th.bor, borderRadius: RADIUS.s, padding: SPACE.s3 + "px", color: th.t1, fontFamily: "inherit", fontSize: TYPE.body.fontSize, marginBottom: SPACE.s2, colorScheme: th.dark ? "dark" : "light" }} />
            {vDeadline && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s4 }}>{lg === "uz" ? "Muddatida bajarilmasa, mukofot berilmaydi." : "No reward if not completed by the deadline."}</div>}
            <PrimaryButton th={th} onClick={addVazifa}>
              {TIco.target("#fff", 16)}{lg === "uz" ? "Vazifa berish" : "Assign task"}
            </PrimaryButton>
          </>
        )}
      </BottomSheet>

      {/* ── Bola balansi (hero, tokenlashgan gradient) ── */}
      {isKid && (
        <div className="anim-fadeUp" style={{ background: "linear-gradient(135deg," + PREMIUM.gold + " 0%," + CHART[3] + " 60%," + CHART[5] + " 100%)", borderRadius: RADIUS.l, padding: SPACE.s6 + "px " + (SPACE.s6 - 2) + "px", marginBottom: SPACE.s4 + 2, position: "relative", overflow: "hidden", boxShadow: SHADOW.e1(CHART[3]) }}>
          <div style={{ position: "absolute", top: -SPACE.s8, right: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, color: "rgba(255,255,255,0.9)", marginBottom: SPACE.s1 }}>{lg === "uz" ? "Mening cho'ntak pulim" : "My pocket money"}</div>
            <div style={{ ...TYPE.hero, fontSize: TYPE.hero.fontSize + 4, color: "#fff", marginBottom: SPACE.s1 + 2, fontVariantNumeric: "tabular-nums" }}>{f(kidBalances[user.id] || 0, true)}</div>
            <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: SPACE.s1 + 2, flexWrap: "wrap" }}>
              {TIco.trophy("#fff", 12)}{myStats.count} {lg === "uz" ? "ta vazifa bajarildi" : "tasks done"} · {TIco.target("#fff", 12)}{lg === "uz" ? "vazifadan" : "from tasks"}: {f(myStats.earn, true)}
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
              <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.am }}>{lg === "uz" ? "Eski bola akkauntlarini tozalash" : "Clean duplicate kid accounts"}</div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Dublikatlar o'chiriladi, pullar haqiqiy akkauntga jamlanadi" : "Removes duplicates, merges balances"}</div>
            </div>
          </div>
        </AppCard>
      )}

      {/* ── Katta a'zolar: vazifa qo'shish yoki farzand uchun taklif qilish ── */}
      {(canAssignTask(user) || isKid) && (
        <PrimaryButton th={th} onClick={openAdd} style={{ marginBottom: SPACE.s4 }}>
          {Ico.add("#fff")}{isKid ? (lg === "uz" ? "Vazifa taklif qilish" : "Propose a task") : (lg === "uz" ? "Yangi vazifa berish" : "New task")}
        </PrimaryButton>
      )}

      {/* ── Bolalar reytingi (AppCard + TaskRow) ── */}
      {kids.length > 0 && (
        <AppCard th={th} style={{ marginBottom: SPACE.s4, background: CHART[5] + ALPHA.faint, border: "1px solid " + CHART[5] + ALPHA.med }}>
          <SubHeader th={th}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 + 2 }}>{TIco.trophy(th.am, 14)}{lg === "uz" ? "Bolalar reytingi" : "Kids leaderboard"}</span>
          </SubHeader>
          {leaderboard.map((k, i) => (
            <TaskRow key={k.id} th={th} lg={lg} rank={i + 1} name={k.name} done={k.done} taskEarn={k.taskEarn} bal={k.bal} last={i === leaderboard.length - 1} />
          ))}
        </AppCard>
      )}

      {/* ── Vazifalar ro'yxati ── */}
      <SectionHeader th={th}>{lg === "uz" ? "Vazifalar" : "Tasks"}</SectionHeader>
      {isKid && myTasks.length === 0 && vazifalar.length > 0 ? (
        <EmptyState th={th} icon={TIco.searchBig(th.t3)}
          title={lg === "uz" ? "Vazifalar bor, lekin sizga biriktirilmagan" : "Tasks exist but not assigned to you"}
          message={
            <span>
              {lg === "uz" ? "Ro'yxatdagi vazifalar kimga berilgan:" : "Assigned to:"}
              {vazifalar.slice(0, 3).map(v => (
                <span key={v.id} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 + 2, marginTop: SPACE.s1 }}>
                  {taskIco(v.emoji, th.t3, 13)}{v.title} {"\u2192"} <b style={{ color: th.am }}>{v.assignedName || v.assignedTo}</b>
                </span>
              ))}
              <span style={{ display: "block", marginTop: SPACE.s2 + 2, fontSize: TYPE.caption.fontSize - 1 }}>
                {lg === "uz" ? "Sizning hisobingiz:" : "Your account:"} <b style={{ color: th.ac }}>{user.ism}</b> ({user.login || user.id})
              </span>
            </span>
          } />
      ) : myTasks.length === 0 ? (
        <EmptyState th={th} icon={isKid ? TIco.taskBig(th.t3) : undefined} preset={isKid ? undefined : "goal"}
          title={isKid ? (lg === "uz" ? "Hali vazifa yo'q" : "No tasks yet") : (lg === "uz" ? "Hali vazifa bermadingiz" : "No tasks created")}
          message={isKid ? (lg === "uz" ? "Ota-onangiz tez orada vazifa beradi, yoki o'zingiz vazifa taklif qilishingiz mumkin." : "Your parent will add tasks soon, or you can propose a task yourself.") : (lg === "uz" ? "Bolalaringizga vazifa berib, ularni rag'batlantiring" : "Add tasks to motivate your kids")}
          actionText={isKid ? (lg === "uz" ? "Vazifa taklif qilish" : "Propose a task") : (lg === "uz" ? "Vazifa berish" : "Add task")}
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
        title={lg === "uz" ? "Vazifani o'chirish" : "Delete task"}
        message={lg === "uz" ? "Bu vazifa butunlay o'chiriladi. Davom etasizmi?" : "This task will be permanently deleted. Continue?"}
        confirmText={lg === "uz" ? "O'chirish" : "Delete"}
        cancelText={lg === "uz" ? "Bekor qilish" : "Cancel"} />
    </div>
  );
}
