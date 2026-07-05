// ═══════════════════════════════════════════════════════════
//  DESIGN TOKENS — yagona haqiqat manbasi (Design System v1.0)
//  Bu fayldan tashqarida radius/shadow/spacing/motion/z-index
//  uchun raqamli literal yozish TAQIQLANADI.
// ═══════════════════════════════════════════════════════════

// ── Rang palitrasi (Light / Dark) ───────────────────────────
// DIQQAT: qiymatlar mavjud MK() bilan bit-to-bit bir xil —
// migratsiya vizual o'zgarishsiz bo'lishi uchun.
export const PALETTE = {
  light: {
    bg: "#eef2ff", sur: "#ffffff", surH: "#f5f7ff", bor: "#e2e8f0",
    ac: "#6366f1", ac2: "#4f46e5",
    gr: "#059669", rd: "#dc2626", am: "#d97706",
    t1: "#0f172a", t2: "#64748b", t3: "#94a3b8",
    dark: false,
  },
  dark: {
    bg: "#090e1c", sur: "#111827", surH: "#192035", bor: "#2b3852",
    ac: "#6366f1", ac2: "#818cf8",
    gr: "#10b981", rd: "#ef4444", am: "#f59e0b",
    t1: "#FFFFFF", t2: "#B9C3D4", t3: "#9CA3AF",
    dark: true,
  },
};

// ── Alpha suffikslari (hex rang + shaffoflik) ───────────────
// Ishlatilishi: th.ac + ALPHA.soft  →  "#6366f114"
export const ALPHA = {
  faint:  "0d",  // 5%  — juda yengil fon (aksent karta)
  soft:   "14",  // 8%  — ikonka konteyner foni (standart)
  tint:   "18",  // 9%  — tanlangan chip/tab foni (legacy, soft bilan teng huquqli)
  med:    "26",  // 15% — yengil border
  strong: "44",  // 27% — aksent border, tugma soyasi
};

// ── Spacing — 8-point grid ──────────────────────────────────
export const SPACE = { s1: 4, s2: 8, s3: 12, s4: 16, s6: 24, s8: 32, s12: 48, s16: 64 };

// ── Radius — faqat 4 daraja ─────────────────────────────────
export const RADIUS = {
  s: 10,      // kichik tugma, chip ichi, badge
  m: 16,      // STANDART: karta, input, tugma, ro'yxat
  l: 24,      // bottom sheet, hero karta
  pill: 999,  // chip/badge (to'liq yumaloq pill)
  full: "50%",// avatar, dot, FAB
};

// ── Elevation / Shadow — faqat 4 daraja ─────────────────────
export const SHADOW = {
  e0: "none",                                   // tekis: border yetarli
  e1: c => "0 4px 14px " + c + ALPHA.strong,    // ko'tarilgan: rangli soya (tugma, FAB)
  e2: "0 12px 32px rgba(15,23,42,.18)",         // suzuvchi: dropdown, toast
  e3: "0 24px 60px rgba(15,23,42,.30)",         // modal, dialog
};

// ── Typography ──────────────────────────────────────────────
export const FONT = "'Inter',system-ui,sans-serif";
export const TYPE = {
  display:  { fontSize: 34, fontWeight: 800, lineHeight: 1.1 },
  hero:     { fontSize: 28, fontWeight: 800, lineHeight: 1.15 },
  title:    { fontSize: 20, fontWeight: 800, lineHeight: 1.2 },
  heading:  { fontSize: 17, fontWeight: 700, lineHeight: 1.3 },
  subtitle: { fontSize: 15, fontWeight: 600, lineHeight: 1.4 },
  body:     { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
  caption:  { fontSize: 12, fontWeight: 500, lineHeight: 1.4 },
  tiny:     { fontSize: 10, fontWeight: 600, lineHeight: 1.3, textTransform: "uppercase", letterSpacing: 1.4 },
};

// ── Motion ──────────────────────────────────────────────────
export const MOTION = {
  fast: "120ms", base: "240ms", slow: "400ms",
  easeOut: "cubic-bezier(.16,1,.3,1)",
  inOut:   "cubic-bezier(.65,0,.35,1)",
  spring:  "cubic-bezier(.34,1.56,.64,1)",
};
// Tayyor transition qatorlari: MOTION.tr("transform") → "transform 240ms cubic-bezier(...)"
MOTION.tr     = (prop = "all") => prop + " " + MOTION.base + " " + MOTION.easeOut;
MOTION.trFast = (prop = "all") => prop + " " + MOTION.fast + " " + MOTION.easeOut;
MOTION.trSlow = (prop = "all") => prop + " " + MOTION.slow + " " + MOTION.easeOut;

// ── Z-Index shkala ──────────────────────────────────────────
export const Z = {
  raised:   2,    // karta ichidagi ustma-ust element
  sticky:   20,   // yopishqoq sarlavha
  nav:      100,  // bottom navigation
  fab:      110,  // FAB (nav ustida)
  dropdown: 500,
  overlay:  998,  // modal orqa qoraytmasi
  sheet:    999,  // bottom sheet
  dialog:   1000,
  toast:    1100,
  top:      2000, // eng ustki (splash, PIN qulf)
};

// ── Opacity holatlari ───────────────────────────────────────
export const OPACITY = { disabled: 0.45, pressed: 0.85, hint: 0.7 };

// ── Chart palitra (tartib qat'iy — kategoriya rangi doimiy) ─
export const CHART = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6", "#f97316", "#64748b"];

// ── Garden ranglar (FAQAT Baraka Bog'i konteyneri ichida) ───
export const GARDEN = {
  skyDay:     "linear-gradient(180deg,#87CEEB,#B8E3F5)",
  skyEvening: "linear-gradient(180deg,#F9A86A,#B78CDB)",
  grass: "#7CC576", leafDeep: "#4C9A45",
  soil: "#8B6647", trunk: "#6D4C33",
  water: "#5BB8E8", sun: "#FFD75E", bloom: "#F78FB3",
};

// ── Premium (oltin) tizim ───────────────────────────────────
export const PREMIUM = {
  gold: "#f59e0b",
  deep: "#d97706",
  grad: "linear-gradient(135deg,#fbbf24,#f59e0b)",
  soft: "#f59e0b" + ALPHA.soft,
};

// ── Komponent tokenlari ─────────────────────────────────────
// Kontrol balandliklarini aynan saqlaydi (UI o'lchami o'zgarmasin).
// Primitiv shkala layout uchun; ichki padding — komponent qarori.
export const COMP = {
  btnPadY: 14,            // Primary tugma → ~50px balandlik
  inputPad: "13px 16px",  // Input → ~50px balandlik
  tabPadY: 9,             // Segment/tab → ~40px
  chipPad: "6px 14px",
  touchMin: 44,           // minimal touch target
  pageMax: 430,           // mobil konteyner
};
