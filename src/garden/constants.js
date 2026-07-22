// ═══════════════════════════════════════════════════════════
//  GARDEN GAME CONSTANTS — biznes qiymatlar O'ZGARMAGAN
//  (Garden.jsx dan ko'chirildi; faqat UI-emoji maydoni olib
//  tashlandi — DS 6: emoji taqiq, vizual PlantSVG orqali)
// ═══════════════════════════════════════════════════════════

export const PLOTS = [
  { id: 0, unlockCost: 0 },
  { id: 1, unlockCost: 500 },
  { id: 2, unlockCost: 1500 },
  { id: 3, unlockCost: 5000 },
  { id: 4, unlockCost: 10000 },
];

export const STAGES = [
  { id: 0, name: "Urug'",           nameRu: "Семя",           waterNeeded: 3 },
  { id: 1, name: "Nihol",           nameRu: "Росток",         waterNeeded: 5 },
  { id: 2, name: "Yosh daraxt",     nameRu: "Деревце",        waterNeeded: 8 },
  { id: 3, name: "Katta daraxt",    nameRu: "Дерево",         waterNeeded: 12 },
  { id: 4, name: "Gullagan daraxt", nameRu: "Цветущее",       waterNeeded: 15 },
  { id: 5, name: "Mevali daraxt",   nameRu: "Плодоносящее",   waterNeeded: 20 },
  { id: 6, name: "Baraka daraxti",  nameRu: "Дерево Бараки",  waterNeeded: 999 },
];

export const WATER_COOLDOWN = 2 * 60 * 60;        // 2 soat
export const HARVEST_COINS  = [0, 10, 25, 50, 100, 200, 500];
export const SUN_CYCLE      = 3 * 60 * 60 * 1000; // quyosh 3 soatda pishadi
export const SPEEDUP_COST   = 100;                // 100 Coin = −30 daqiqa
export const SUN_ENERGY     = 15;                 // bitta quyosh = +15 energiya

// Quyoshlarning osmondagi joylashuvi (har uchastka uchun, %)
// DIQQAT: quyosh koordinatalari HUD'lardan uzoqda bo'lishi shart —
// chapda valyuta chiplari (~28% gacha), o'ngda tugmalar (~82% dan).
export const SUN_POS = [
  { x: 50, y: 26 },
  { x: 33, y: 66 },
  { x: 67, y: 62 },
  { x: 36, y: 34 },
  { x: 64, y: 32 },
];

// Uchastkalarning yaylovdagi joylashuvi (sahna layout ma'lumoti)
export const PLOT_POS = [
  { left: "50%", top: "11%", w: "min(46%, 190px)", z: 5 },
  { left: "26%", top: "41%", w: "min(40%, 165px)", z: 6 },
  { left: "75%", top: "41%", w: "min(40%, 165px)", z: 6 },
  { left: "35%", top: "64%", w: "min(30%, 122px)", z: 7 },
  { left: "65%", top: "64%", w: "min(30%, 122px)", z: 7 },
];

export const PLOT_SCALE = [1, 0.8, 0.8, 0.62, 0.62];
