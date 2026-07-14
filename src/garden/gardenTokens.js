// ═══════════════════════════════════════════════════════════
//  GARDEN ZONE TOKENS — Baraka Bog'i palitrasi (DS 2.5 + 7-bo'lim)
//  tokens.js dagi GARDEN.* asosida kengaytirilgan token to'plami.
//  QOIDA: bu ranglar bog' konteyneridan tashqariga chiqmaydi.
//  HEX faqat shu faylda — komponentlarda inline HEX TAQIQ.
// ═══════════════════════════════════════════════════════════
import { GARDEN } from "../utils/tokens.js";

// ── Illyustratsiya palitrasi (soft 2-ton shading, DS 7) ─────
export const ART = {
  // Osmon (GARDEN.skyDay/skyEvening bilan bir manba)
  skyTop: "#87CEEB", skyBottom: "#B8E3F5",
  eveTop: "#F9A86A", eveBottom: "#B78CDB",
  nightTop: "#22335C", nightBottom: "#41548A",

  // Yashillik: asos + soya + yorug' (2.5 Grass/LeafDeep dan kengaytirilgan)
  grass: GARDEN.grass,        // #7CC576
  grassHi: "#96D785",
  grassLo: "#57AC52",
  leaf: GARDEN.leafDeep,      // #4C9A45
  leafHi: "#8FD06F",
  leafLo: "#37803A",
  leafGlint: "#D9FFCE",

  // Tuproq va tana
  soil: GARDEN.soil,          // #8B6647
  soilHi: "#A57C55",
  soilLo: "#6E4E33",
  soilDot: "#5C3A1E",
  trunk: GARDEN.trunk,        // #6D4C33
  trunkHi: "#8A6440",
  trunkLo: "#54381F",

  // Qulflangan uchastka (neytral kul-qum)
  lockSoil: "#B4A79B",
  lockSoilLo: "#9C8D82",

  // Suv
  water: GARDEN.water,        // #5BB8E8
  waterHi: "#BFEEF0",
  waterLo: "#3E93A6",

  // Quyosh / oltin
  sun: GARDEN.sun,            // #FFD75E
  sunHi: "#FFF7C4",
  sunRay: "#FFE14D",
  sunLo: "#F0A81C",
  coin: "#FCBF3E",
  coinHi: "#FFE08A",
  coinLo: "#E28F13",
  coinRim: "#C47A12",

  // Gul / kristal
  bloom: GARDEN.bloom,        // #F78FB3
  bloomHi: "#FBCFE8",
  bloomLo: "#DB2777",
  petalCore: "#FDE047",

  // Meva
  fruit: "#EF4444",
  fruitAlt: "#F97316",
  fruitHi: "#FFD7C2",
  fruitStem: "#166534",

  // Bulut, panjara, qush
  cloud: "#FFFFFF",
  cloudLo: "#D8ECFA",
  cloudHi: "#F2F8FF",
  fence: "#F2E3C4",
  fenceLo: "#E6D2A9",
  bird: "#3D5C74",
};

// ── Bog' zonasi UI palitrasi (kunduz / tun rejimi) ──────────
const LIGHT = {
  dark: false,
  bg: "#F1F8EC",            // sahifa foni — yengil o't tusi
  sur: "#FFFFFF",
  surH: "#EDF6E7",
  bor: "#DBEAD2",
  ink1: "#20351F",          // sarlavha (chuqur o'rmon)
  ink2: "#5C7560",          // ikkilamchi matn
  ink3: "#93A896",          // uchlamchi
  acc: "#3F8C3B",           // bog' harakati (leafDeep dan bir ton to'q — kontrast)
  accGrad: "linear-gradient(135deg,#7CC576,#3F8C3B)",
  gold: "#D98E10",
  goldGrad: "linear-gradient(135deg,#FFD75E,#E8A21A)",
  waterGrad: "linear-gradient(135deg,#8FD4F2,#3E93C6)",
  onSky: "#FFFFFF",
  skyScrim: "rgba(21,58,84,.42)",
  sceneScrim: "rgba(16,49,30,.55)",
  glow: "rgba(255,215,94,.55)",
  glassBorder: "rgba(255,255,255,.65)",
  ray1: "rgba(255,255,255,.4)",
  ray0: "rgba(255,255,255,0)",
};

const DARK = {
  dark: true,
  bg: "#0D1912",            // tungi o'rmon
  sur: "#14251B",
  surH: "#1B3125",
  bor: "#2B4A37",
  ink1: "#EFF9EE",
  ink2: "#A8C3AC",
  ink3: "#7C9781",
  acc: "#7CC576",
  accGrad: "linear-gradient(135deg,#7CC576,#4C9A45)",
  gold: "#FFD75E",
  goldGrad: "linear-gradient(135deg,#FFD75E,#E8A21A)",
  waterGrad: "linear-gradient(135deg,#5BB8E8,#2E86C4)",
  onSky: "#FFFFFF",
  skyScrim: "rgba(10,26,44,.5)",
  sceneScrim: "rgba(6,20,12,.6)",
  glow: "rgba(255,215,94,.4)",
  glassBorder: "rgba(255,255,255,.4)",
  ray1: "rgba(255,255,255,.18)",
  ray0: "rgba(255,255,255,0)",
};

/** Bog' UI mavzusi: dark prop bo'yicha. */
export const gardenTheme = dark => (dark ? DARK : LIGHT);

/** Osmon rejimi qurilma vaqti bo'yicha (DS 7: 18:00 dan keyin kechki). */
export function skyMode(date = new Date()) {
  const h = date.getHours();
  if (h >= 21 || h < 5) return "night";
  if (h >= 18) return "evening";
  return "day";
}

export const SKY_GRAD = {
  day:     "linear-gradient(180deg," + ART.skyTop + "," + ART.skyBottom + ")",
  evening: "linear-gradient(180deg," + ART.eveTop + "," + ART.eveBottom + ")",
  night:   "linear-gradient(180deg," + ART.nightTop + "," + ART.nightBottom + ")",
};
