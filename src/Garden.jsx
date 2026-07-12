import { useState, useEffect, useRef, useMemo, memo } from "react";
import { db } from "./firebase.js";
import { useApp } from "./context/AppContext.jsx";
import { RADIUS, SPACE, TYPE, SHADOW, MOTION, OPACITY, COMP, Z } from "./utils/tokens.js";
import { injectUiCss } from "./components/ui/motion.js";
import { gardenTheme, skyMode, SKY_GRAD, ART } from "./garden/gardenTokens.js";
import {
  PLOTS, STAGES, WATER_COOLDOWN, HARVEST_COINS, SUN_CYCLE, SPEEDUP_COST, SUN_ENERGY, SUN_POS,
} from "./garden/constants.js";
import {
  GardenDefs, SunSprite, CoinSVG, GemSVG, LockSVG, GiftSVG, SeedSVG,
  DropSVG, BoltSVG, LeafSVG, RocketSVG, BloomSVG, MapSVG, PlantSVG,
} from "./garden/sprites.jsx";
import { GardenScene } from "./garden/GardenScene.jsx";
import {
  GSection, GCard, GProgress, LevelGauge, StatPill, TodayRow, GChip,
  AchievementCard, RewardRow, TipCard,
} from "./garden/cards.jsx";
import { BottomSheet } from "./components/ui/index.js";

// ═══════════════════════════════════════════════════════════
//  BARAKA BOG'I — Flagship redesign (Design System v1.0, 7-bo'lim)
//  Biznes logika, Firebase kalitlari va qiymatlar O'ZGARMAGAN.
//  Layout: Hero → Overview (Daraja/XP/Tanga) → Bugungi jarayon
//  → Asosiy bog' sahnasi → O'simliklar → Mukofotlar → Yutuqlar
//  → Tarix → Maslahatlar.
// ═══════════════════════════════════════════════════════════

// ── Keyframes: faqat transform/opacity; reduced-motion hurmati ──
let gdCssInjected = false;
function injectGardenCss() {
  if (gdCssInjected || typeof document === "undefined") return;
  gdCssInjected = true;
  const s = document.createElement("style");
  s.id = "gd-css";
  s.textContent = `
@keyframes gdSway{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}
@keyframes gdDrift{0%,100%{transform:translateX(0)}50%{transform:translateX(26px)}}
@keyframes gdCoinFly{0%{transform:translateY(0) scale(.6);opacity:1}100%{transform:translateY(-90px) scale(1.15);opacity:0}}
@keyframes gdSunPulse{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.1) rotate(6deg)}}
@keyframes gdSunGlow{0%,100%{filter:drop-shadow(0 0 5px ${ART.sunRay}aa)}50%{filter:drop-shadow(0 0 14px ${ART.sunRay})}}
@keyframes gdGrowPop{0%{transform:translateX(-50%) scale(.7)}60%{transform:translateX(-50%) scale(1.15)}100%{transform:translateX(-50%) scale(1)}}
@keyframes gdDrop{0%{transform:translateY(-10px) scale(.8);opacity:0}30%{opacity:1}100%{transform:translateY(46px) scale(.5);opacity:0}}
@keyframes gdRipple{0%{transform:scale(.4);opacity:.9}100%{transform:scale(1.4);opacity:0}}
@keyframes gdShimmer{0%,100%{opacity:.65}50%{opacity:1}}
@keyframes gdMsg{0%{transform:translate(-50%,-16px);opacity:0}12%,88%{transform:translate(-50%,0);opacity:1}100%{transform:translate(-50%,-16px);opacity:0}}
@keyframes gdDig{0%,100%{transform:translate(-50%,-50%) translateY(0) rotate(-8deg)}50%{transform:translate(-50%,-50%) translateY(-9px) rotate(10deg)}}
@keyframes gdBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes gdNote{0%{opacity:0;transform:translateY(6px)}10%,80%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}
@keyframes gdRay{0%,100%{opacity:.35}50%{opacity:.6}}
@keyframes gdBird{0%{transform:translateX(-30px);opacity:0}6%{opacity:.9}50%{opacity:.9}94%{opacity:.9}100%{transform:translateX(110vw);opacity:0}}
@keyframes gdTwinkle{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes gdLeafBurst{0%{transform:translateY(0) scale(.6) rotate(0);opacity:1}100%{transform:translateY(-58px) scale(1) rotate(140deg);opacity:0}}
@keyframes gdHudPop{0%{transform:scale(1)}35%{transform:scale(1.18)}100%{transform:scale(1)}}
.gd-root{position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100vh;height:100dvh;overflow:hidden}
.gd-scene-full{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;overflow:hidden}
.gd-sky-full{position:relative;flex:1 1 auto;min-height:90px;z-index:10}
.gd-meadow-full{position:relative;flex:0 0 auto;height:56%;min-height:250px;max-height:520px;z-index:11}
@media (prefers-reduced-motion:reduce){
  [style*="gdSway"],[style*="gdDrift"],[style*="gdSunPulse"],[style*="gdSunGlow"],
  [style*="gdShimmer"],[style*="gdBounce"],[style*="gdRay"],[style*="gdBird"],
  [style*="gdTwinkle"],[style*="gdCoinFly"],[style*="gdDrop"],[style*="gdRipple"],[style*="gdHudPop"],
  [style*="gdGrowPop"],[style*="gdDig"],[style*="gdLeafBurst"]{animation:none!important}
  [style*="gdMsg"],[style*="gdNote"]{animation-duration:1ms!important}
}`;
  document.head.appendChild(s);
}

// ── Toast ikonkalari (emoji o'rniga sprite kalitlari) ───────
const MSG_ICONS = {
  leaf: <LeafSVG size={16} />, drop: <DropSVG size={12} />, gift: <GiftSVG size={16} />,
  coin: <CoinSVG size={16} />, sun: <SunSprite size={18} />, rocket: <RocketSVG size={16} />,
  seed: <SeedSVG size={18} />, bloom: <BloomSVG size={16} />,
};

// ── Bog' bezash ashyolari (Tirik va Premium asboblar tanga/quyosh/yulduz evaziga) ────────
const DECORATION_ITEMS = [
  { id: "lola", type: "flower", name: "Sehrli Lola", nameRu: "Чудесный Тюльпан", cost: 20, currency: "coin", color: "#ef4444", emoji: "🌷", desc: "Tepranguvchi sehrli qizil lola", descRu: "Колышущийся волшебный тюльпан" },
  { id: "atorgul", type: "flower", name: "Nafis Atorgul", nameRu: "Изящная Роза", cost: 40, currency: "coin", color: "#ec4899", emoji: "🌹", desc: "Yog'du taratuvchi nafis atorgul", descRu: "Изящная роза со свечением" },
  { id: "moychechak", type: "flower", name: "Moychechak", nameRu: "Ромашка", cost: 30, currency: "coin", color: "#f59e0b", emoji: "🌼", desc: "Sokin tebranuvchi baxtli moychechak", descRu: "Счастливая колышущаяся ромашка" },
  { id: "archa", type: "tree", name: "Kichik Archa", nameRu: "Мини-Ель", cost: 80, currency: "coin", color: "#10b981", emoji: "🌲", desc: "Yulduzchalar va o'yinchoqlar bilan bezatilgan archa", descRu: "Вечнозеленая ель со звездами" },
  { id: "uycha", type: "house", name: "Kichik uycha", nameRu: "Уютный домик", cost: 150, currency: "coin", color: "#8b5cf6", emoji: "🏡", desc: "Mo'risidan shirin tutun chiqadigan shinam uycha", descRu: "Уютный домик с дымком" },
  { id: "favvora", type: "fountain", name: "Oltin Favvora", nameRu: "Золотой фонтан", cost: 250, currency: "coin", color: "#3b82f6", emoji: "⛲", desc: "Suv sachratib turuvchi oltin favvora", descRu: "Красивый фонтан с брызгами" },
  { id: "kamalak_guli", type: "magic", name: "Kamalak Guli", nameRu: "Радужный Цветок", cost: 400, currency: "coin", color: "#ec4899", emoji: "✨", desc: "Rangi jilolanuvchi sehrli kamalak guli", descRu: "Легендарный переливающийся цветок" },

  // SUN-BASED DECORATIONS
  { id: "qush_qo'riqchi", type: "companion", name: "Qo'riqchi Qushcha", nameRu: "Птичка-хранитель", cost: 100, currency: "sun", color: "#38bdf8", emoji: "🐦", desc: "Zararkunandalardan daraxtlarni himoya qiladi", descRu: "Защищает деревья от вредителей" },
  { id: "olcha_daraxti", type: "tree", name: "Olcha Daraxti", nameRu: "Цветущая Вишня", cost: 150, currency: "sun", color: "#f43f5e", emoji: "🌸🌳", desc: "Gilos gullari taratuvchi bahoriy olcha daraxti", descRu: "Сакура с красивыми опадающими лепестками" },
  { id: "favvora_sehrli", type: "fountain", name: "Sehrli Favvora", nameRu: "Магический Фонтан", cost: 350, currency: "sun", color: "#3b82f6", emoji: "⛲✨", desc: "Rang-barang nur sachratuvchi sehrli favvora", descRu: "Магический фонтан со сказочной подсветкой" },
  { id: "skameyka", type: "decor", name: "Dam Olish Skameykasi", nameRu: "Уютная Скамья", cost: 80, currency: "sun", color: "#b45309", emoji: "🪑", desc: "Sokin dam olish va suhbatlashish uchun joy", descRu: "Деревянная скамья для отдыха на природе" },
  { id: "tosh", type: "decor", name: "Baxt Toshi", nameRu: "Камень Счастья", cost: 40, currency: "sun", color: "#64748b", emoji: "🪨", desc: "Zen bog'i uchun qadimiy muvozanat toshi", descRu: "Камень гармонии для дзен-сада" },

  // PRESTIGE STARS DECORATIONS
  { id: "mushuk_qo'riqchi", type: "companion", name: "Qo'riqchi Mushukcha", nameRu: "Котенок-хранитель", cost: 2, currency: "star", color: "#f97316", emoji: "🐱", desc: "Zararkunandalarni avtomatik haydab turadi", descRu: "Автоматически прогоняет вредителей" },
  { id: "oltin_qasr", type: "magic", name: "Oltin Qasr", nameRu: "Золотой Замок", cost: 5, currency: "star", color: "#fbbf24", emoji: "🏰", desc: "Dabdabali oltin qasr, barcha bezaklardan ustun", descRu: "Роскошный золотой замок вечного величия" },
];

// ── Mono outline ikonka (mukofotlar ro'yxati uchun) ─────────
const mono = (paths, c) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
);
const MonoIco = {
  minus: c => mono(<><circle cx="9" cy="9" r="7" /><path d="M6 9h6" /></>, c),
  plus: c => mono(<><circle cx="9" cy="9" r="7" /><path d="M6 9h6M9 6v6" /></>, c),
  qr: c => mono(<><rect x="2.5" y="2.5" width="5" height="5" rx="1" /><rect x="10.5" y="2.5" width="5" height="5" rx="1" /><rect x="2.5" y="10.5" width="5" height="5" rx="1" /><path d="M10.5 10.5h2v2h-2zM13.5 13.5h2v2h-2z" /></>, c),
  target: c => mono(<><circle cx="9" cy="9" r="7" /><circle cx="9" cy="9" r="3.4" /><circle cx="9" cy="9" r="0.6" /></>, c),
  check: c => mono(<><circle cx="9" cy="9" r="7" /><path d="M5.8 9.2l2.2 2.2 4.2-4.6" /></>, c),
  card: c => mono(<><rect x="2" y="4.5" width="14" height="9.5" rx="2" /><path d="M2 8h14" /></>, c),
  users: c => mono(<><circle cx="6.4" cy="6.6" r="2.6" /><path d="M1.8 15c.5-3 2.4-4.4 4.6-4.4s4.1 1.4 4.6 4.4" /><circle cx="12.8" cy="6.2" r="2" /><path d="M12.2 10.6c2 .2 3.4 1.5 3.9 4" /></>, c),
  calendar: c => mono(<><rect x="2.5" y="3.5" width="13" height="12" rx="2" /><path d="M2.5 7.5h13M6 2v3M12 2v3" /></>, c),
};

const fTime = s => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return h + ":" + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
};

// ── Nisbiy vaqt (tarix uchun) ───────────────────────────────
const ago = (t, lg) => {
  const d = Date.now() - t;
  const m = Math.floor(d / 60000);
  if (m < 1) return lg === "uz" ? "hozirgina" : "только что";
  if (m < 60) return m + (lg === "uz" ? " daqiqa oldin" : " мин назад");
  const h = Math.floor(m / 60);
  if (h < 24) return h + (lg === "uz" ? " soat oldin" : " ч назад");
  const days = Math.floor(h / 24);
  return days + (lg === "uz" ? " kun oldin" : " дн назад");
};

// ── Modal (bog' uslubida, RADIUS.l, E3) ─────────────────────
const GModal = memo(function GModal({ gt, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: gt.sceneScrim, zIndex: Z.dialog, display: "flex", alignItems: "center", justifyContent: "center", padding: SPACE.s4 + SPACE.s1 }} onClick={onClose}>
      <div className="ui-dialogIn" style={{ background: gt.sur, borderRadius: RADIUS.l, padding: SPACE.s6 + "px " + (SPACE.s4 + SPACE.s1) + "px", width: "100%", maxWidth: 330, textAlign: "center", boxShadow: SHADOW.e3, border: "1px solid " + gt.bor }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
});

// ════════════════════════════════════════════════════════════
export default function Garden({ user, lg = "uz", onBack, dark, addCoin, stars }) {
  const { maq, setGardenData } = useApp() || { maq: [], setGardenData: null };
  const oilaId = user?.oilaId;
  const L = (uz, ru = uz) => (lg === "ru" ? ru : uz);
  const gt = gardenTheme(dark);
  injectUiCss();
  injectGardenCss();

  // ── Holat (o'zgarmagan va yangi dekoratsiyalar) ──
  const [coins, setCoins]           = useState(0);
  const [energy, setEnergy]         = useState(0);
  const [crystals, setCrystals]     = useState(0);
  const [plots, setPlots]           = useState(PLOTS.map(p => ({ ...p, stage: -1, waterCount: 0, lastWateredAt: 0, lastSunAt: 0, harvestReady: false, plantType: "normal" })));
  const [selected, setSelected]     = useState(0);
  const [waterTimer, setWaterTimer] = useState(0);
  const [waterReady, setWaterReady] = useState(true);
  const [showUnlock, setShowUnlock] = useState(null);
  const [showPlant, setShowPlant]   = useState(null);
  const [digAnim, setDigAnim]       = useState(null);
  const [flyCoins, setFlyCoins]     = useState([]);
  const [waterAnim, setWaterAnim]   = useState(false);
  const [growAnim, setGrowAnim]     = useState(null);
  const [dailyDone, setDailyDone]   = useState(false);
  const [msg, setMsg]               = useState(null);
  const [sunNote, setSunNote]       = useState(null);
  const [showMenu, setShowMenu]     = useState(false);
  
  // Yangi Iqtisodiy Quyosh tizimi holatlari (DS 8 + 9)
  const [waterDrops, setWaterDrops] = useState(20);
  const [goldenSeeds, setGoldenSeeds] = useState(0);
  const [rainbowSeeds, setRainbowSeeds] = useState(0);
  const [familySuns, setFamilySuns] = useState(0);
  const [familyBonusClaimed, setFamilyBonusClaimed] = useState(false);
  const [barakaStarsCount, setBarakaStarsCount] = useState(0);
  const [lastAiAdviceAt, setLastAiAdviceAt] = useState(0);
  const [wateredBy, setWateredBy] = useState([]);

  // ── OMBORE & BOZOR (Warehouse & Bazaar System) ──
  const [warehouse, setWarehouse] = useState({ normal: 0, golden: 0, rainbow: 0 });
  const [showBazaarModal, setShowBazaarModal] = useState(false);
  const [bazaarPrices, setBazaarPrices] = useState({
    normal: 200,
    golden: 500,
    rainbow: 1500,
    trends: { normal: "up", golden: "down", rainbow: "up" },
    pct: { normal: 10, golden: -15, rainbow: 25 },
    history: {
      normal: [180, 150, 160, 190, 200],
      golden: [600, 580, 520, 480, 500],
      rainbow: [1200, 1300, 1100, 1400, 1500]
    }
  });

  // ── ZARARKUNANDALAR & QO'RIQCHILAR & MAYSA (Pests, Guardians & Lawn Blades) ──
  const [pests, setPests] = useState([]);
  const [grassBlades, setGrassBlades] = useState([]);
  const [selectedGoalForTree, setSelectedGoalForTree] = useState(null);

  // Omad g'ildiragi (Lucky Spin) holati
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);

  // Ob-havo (Rain Control) tizimi
  const [rainActive, setRainActive] = useState(false);

  // AI maslahatchisi o'tish oynasi
  const [showAiAdvisorModal, setShowAiAdvisorModal] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Prestij tizimi oynasi (Quyosh -> Baraka yulduzlari)
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);

  // Suv tomchisi xarid qilish oynasi
  const [showBuyDropsModal, setShowBuyDropsModal] = useState(false);
  
  // Yangi dekoratsiyalar va joylashtirish tizimi holati
  const [decorations, setDecorations] = useState([]);
  const [purchasedDecorations, setPurchasedDecorations] = useState([]);
  const [placedDecorations, setPlacedDecorations] = useState([]);
  const [placingItem, setPlacingItem] = useState(null);
  const [tempCoord, setTempCoord] = useState(null);
  const [selectedPlacedInstance, setSelectedPlacedInstance] = useState(null);
  const [decorTab, setDecorTab] = useState("shop");
  const [showDecorModal, setShowDecorModal] = useState(false);
  const [showFertilizerModal, setShowFertilizerModal] = useState(null);
  const [showConfirmUseDropModal, setShowConfirmUseDropModal] = useState(null);

  // Reklama ko'rish (Ad) simulyatori holati
  const [showAdModal, setShowAdModal] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adQuoteIndex, setAdQuoteIndex] = useState(0);

  const sunNoteRef = useRef(null);
  const [now, setNow]               = useState(Date.now());

  const timerRef = useRef(null);
  const msgRef   = useRef(null);
  const lastWateredRef = useRef(0);

  const showMsg = (text, icon = "leaf", dur = 3000) => {
    setMsg({ text, icon, dur });
    clearTimeout(msgRef.current);
    msgRef.current = setTimeout(() => setMsg(null), dur);
  };

  const spawnCoin = (amount, x = 50, y = 50, icon = "coin") => {
    const id = Date.now() + Math.random();
    setFlyCoins(prev => [...prev, { id, amount, x, y, icon }]);
    setTimeout(() => setFlyCoins(prev => prev.filter(c => c.id !== id)), 1400);
  };

  // ── Firebase yuklash ──
  useEffect(() => { if (oilaId) loadAll(); }, [oilaId]);

  const loadAll = async () => {
    try {
      const [g, c, e, cr, daily] = await Promise.all([
        db.g("baraka_garden_" + oilaId),
        db.g("baraka_coins_" + oilaId),
        db.g("baraka_energy_" + oilaId),
        db.g("baraka_crystals_" + oilaId),
        db.g("baraka_daily_" + oilaId),
      ]);
      if (g?.plots) {
        const fixed = g.plots.map(p => (p.stage >= 0 && !p.lastSunAt) ? { ...p, lastSunAt: Date.now() } : p);
        setPlots(fixed);
        if (fixed.some((p, i) => p.lastSunAt !== g.plots[i].lastSunAt)) {
          db.s("baraka_garden_" + oilaId, { plots: fixed, lastWatered: g.lastWatered ?? null, updatedAt: Date.now() }).catch(() => {});
        }
      }
      if (g?.decorations) setDecorations(g.decorations);
      if (g?.purchasedDecorations) setPurchasedDecorations(g.purchasedDecorations);
      
      // Joylashtirilgan dekoratsiyalar yuklanadi va eski massiv backward-compatible qilinadi
      if (g?.placedDecorations) {
        setPlacedDecorations(g.placedDecorations);
      } else if (g?.decorations && g.decorations.length > 0) {
        // Eski massiv bo'lsa maysazorda chiroyli qilib joylab chiqamiz
        const converted = g.decorations.map((id, index) => {
          const defaults = {
            lola: { x: 18 + index * 12, y: 55 },
            atorgul: { x: 82 - index * 10, y: 62 },
            moychechak: { x: 48 + (index - 1) * 15, y: 48 },
            uycha: { x: 38, y: 15 },
          };
          const def = defaults[id] || { x: 20 + index * 14, y: 50 };
          return {
            instanceId: `${id}_default_${index}_${Math.random().toString(36).substr(2, 4)}`,
            itemId: id,
            ...def
          };
        });
        setPlacedDecorations(converted);
      } else {
        setPlacedDecorations([]);
      }
      
      // Yangi iqtisodiy ma'lumotlar yuklanadi
      if (g?.waterDrops !== undefined) setWaterDrops(g.waterDrops);
      if (g?.goldenSeeds !== undefined) setGoldenSeeds(g.goldenSeeds);
      if (g?.rainbowSeeds !== undefined) setRainbowSeeds(g.rainbowSeeds);
      if (g?.familySuns !== undefined) setFamilySuns(g.familySuns);
      if (g?.familyBonusClaimed !== undefined) setFamilyBonusClaimed(g.familyBonusClaimed);
      if (g?.barakaStarsCount !== undefined) setBarakaStarsCount(g.barakaStarsCount);
      if (g?.lastAiAdviceAt !== undefined) setLastAiAdviceAt(g.lastAiAdviceAt);
      if (g?.wateredBy !== undefined) setWateredBy(g.wateredBy || []);

      if (g?.warehouse !== undefined) setWarehouse(g.warehouse);
      if (g?.pests !== undefined) setPests(g.pests);
      if (g?.grassBlades !== undefined) setGrassBlades(g.grassBlades);
      
      if (c != null) setCoins(c);
      if (e != null) setEnergy(e);
      if (cr != null) setCrystals(cr);
      if (g?.lastWatered) {
        lastWateredRef.current = g.lastWatered;
        const elapsed = Math.floor((Date.now() - g.lastWatered) / 1000);
        const rem = WATER_COOLDOWN - elapsed;
        if (rem > 0) { setWaterTimer(rem); setWaterReady(false); }
        else setWaterReady(true);
      }
      const today = new Date().toISOString().slice(0, 10);
      if (daily?.date === today) setDailyDone(true);
    } catch (e) { console.error("Garden load:", e); }
  };

  const saveGarden = async (newPlots, newCoins, newEnergy, newCrystals, lastWatered, newDecorations, newPurchased, newPlaced, extraFields = {}) => {
    if (!oilaId) return;
    if (lastWatered !== undefined) lastWateredRef.current = lastWatered;
    try {
      const payload = {
        plots: newPlots,
        lastWatered: lastWateredRef.current || null,
        updatedAt: Date.now(),
        wateredBy: extraFields.wateredBy !== undefined ? extraFields.wateredBy : wateredBy,
        waterDrops: extraFields.waterDrops !== undefined ? extraFields.waterDrops : waterDrops,
        goldenSeeds: extraFields.goldenSeeds !== undefined ? extraFields.goldenSeeds : goldenSeeds,
        rainbowSeeds: extraFields.rainbowSeeds !== undefined ? extraFields.rainbowSeeds : rainbowSeeds,
        familySuns: extraFields.familySuns !== undefined ? extraFields.familySuns : familySuns,
        familyBonusClaimed: extraFields.familyBonusClaimed !== undefined ? extraFields.familyBonusClaimed : familyBonusClaimed,
        barakaStarsCount: extraFields.barakaStarsCount !== undefined ? extraFields.barakaStarsCount : barakaStarsCount,
        lastAiAdviceAt: extraFields.lastAiAdviceAt !== undefined ? extraFields.lastAiAdviceAt : lastAiAdviceAt,
        warehouse: extraFields.warehouse !== undefined ? extraFields.warehouse : warehouse,
        pests: extraFields.pests !== undefined ? extraFields.pests : pests,
        grassBlades: extraFields.grassBlades !== undefined ? extraFields.grassBlades : grassBlades,
      };
      payload.decorations = newDecorations !== undefined ? newDecorations : decorations;
      payload.purchasedDecorations = newPurchased !== undefined ? newPurchased : purchasedDecorations;
      payload.placedDecorations = newPlaced !== undefined ? newPlaced : placedDecorations;

      await db.s("baraka_garden_" + oilaId, payload);
      if (setGardenData) setGardenData(payload);
      if (newCoins    !== undefined) await db.s("baraka_coins_" + oilaId, newCoins);
      if (newEnergy   !== undefined) await db.s("baraka_energy_" + oilaId, newEnergy);
      if (newCrystals !== undefined) await db.s("baraka_crystals_" + oilaId, newCrystals);
    } catch (e) { console.error("Garden save:", e); }
  };

  // ── Sekundlik taymer (o'zgarmagan) ──
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setNow(Date.now());
      setWaterTimer(prev => {
        if (prev <= 1) { setWaterReady(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // ── ZARARKUNANDALAR SIMULYATSIYASI ──
  useEffect(() => {
    if (!oilaId) return;
    const interval = setInterval(() => {
      const growingPlots = plots.filter(p => p.stage >= 0 && !p.harvestReady);
      if (growingPlots.length === 0) return;

      const hasCat = purchasedDecorations.includes("mushuk_qo'riqchi");
      const hasBird = purchasedDecorations.includes("qush_qo'riqchi");

      if (hasCat || hasBird) {
        if (pests.length > 0) {
          setPests([]);
          showMsg(
            hasCat 
              ? L("Mushukchangiz hasharotlarni haydab yubordi! 🐱✨", "Ваш котенок прогнал вредителей! 🐱✨")
              : L("Qushchangiz zararkunandani tutib oldi! 🐦✨", "Ваша птичка поймала вредителя! 🐦✨"),
            "leaf"
          );
          saveGarden(plots, undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
            pests: []
          });
        }
        return;
      }

      if (Math.random() < 0.25 && pests.length < 3) {
        const randomPlot = growingPlots[Math.floor(Math.random() * growingPlots.length)];
        if (!pests.some(p => p.plotId === randomPlot.id)) {
          const newPest = {
            id: Date.now() + Math.random(),
            plotId: randomPlot.id,
            offsetX: Math.floor(Math.random() * 30) - 15,
            offsetY: Math.floor(Math.random() * 15) - 20,
          };
          const nextPests = [...pests, newPest];
          setPests(nextPests);
          showMsg(L("⚠️ Diqqat! Bog'da hasharotlar paydo bo'ldi! Uni bosing!", "⚠️ Внимание! В саду появились вредители! Нажмите на них!"), "seed");
          saveGarden(plots, undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
            pests: nextPests
          });
        }
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [plots, pests, purchasedDecorations, oilaId]);

  const handleSquashPest = async (pestId) => {
    const nextPests = pests.filter(p => p.id !== pestId);
    setPests(nextPests);
    
    const nextEnergy = energy + 10;
    const nextCoins = coins + 5;
    setEnergy(nextEnergy);
    setCoins(nextCoins);
    
    spawnCoin(5, 50, 40, "coin");
    showMsg(L("Zararkunanda yo'q qilindi! +10 ☀️, +5 🪙", "Вредитель уничтожен! +10 ☀️, +5 🪙"), "leaf");
    
    await saveGarden(plots, nextCoins, nextEnergy, undefined, undefined, undefined, undefined, undefined, {
      pests: nextPests
    });
  };

  // ── DINAMIK BOZOR NARXLARI GENERATORI ──
  const generateDynamicPrices = () => {
    const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const normPrice = r(120, 320);
    const goldPrice = r(350, 750);
    const rainPrice = r(1000, 2200);

    setBazaarPrices(prev => {
      const normDiff = Math.round(((normPrice - prev.normal) / prev.normal) * 100);
      const goldDiff = Math.round(((goldPrice - prev.golden) / prev.golden) * 100);
      const rainDiff = Math.round(((rainPrice - prev.rainbow) / prev.rainbow) * 100);

      return {
        normal: normPrice,
        golden: goldPrice,
        rainbow: rainPrice,
        trends: {
          normal: normDiff >= 0 ? "up" : "down",
          golden: goldDiff >= 0 ? "up" : "down",
          rainbow: rainDiff >= 0 ? "up" : "down",
        },
        pct: {
          normal: normDiff,
          golden: goldDiff,
          rainbow: rainDiff,
        },
        history: {
          normal: [...prev.history.normal.slice(-4), normPrice],
          golden: [...prev.history.golden.slice(-4), goldPrice],
          rainbow: [...prev.history.rainbow.slice(-4), rainPrice],
        }
      };
    });
  };

  useEffect(() => {
    generateDynamicPrices();
  }, []);

  const handleSellCrop = async (type, amount = 1) => {
    const available = warehouse[type] || 0;
    if (available < amount) {
      showMsg(L("Sotish uchun hosil yetarli emas!", "Недостаточно урожая для продажи!"), "seed");
      return;
    }

    const pricePerUnit = bazaarPrices[type];
    const earned = pricePerUnit * amount;
    const nextCoins = coins + earned;
    setCoins(nextCoins);

    const nextWarehouse = {
      ...warehouse,
      [type]: available - amount
    };
    setWarehouse(nextWarehouse);

    if (addCoin) {
      await addCoin(earned, L("Hosil sotildi: " + type, "Продан урожай: " + type)).catch(() => {});
    }

    spawnCoin(earned, 50, 50, "coin");
    showMsg(L(`+${earned} Tanga olindi! Hosil sotildi 🎉`, `Получено +${earned} монет! Урожай продан 🎉`), "coin");

    await saveGarden(plots, nextCoins, undefined, undefined, undefined, undefined, undefined, undefined, {
      warehouse: nextWarehouse
    });
  };

  // ── FAOL MAQSADLAR & ORZU DARAXTI ──
  const myActiveGoals = useMemo(() => {
    if (!maq) return [];
    return maq.filter(g => g.uid === user?.id && (g.status === "active" || g.status === "waiting_parent"));
  }, [maq, user]);

  const activeGoal = useMemo(() => {
    return myActiveGoals[0] || null;
  }, [myActiveGoals]);

  const activeGoalProgress = useMemo(() => {
    if (!activeGoal) return 0;
    const p = Math.round((activeGoal.jamg / activeGoal.maqsad) * 100);
    return Math.min(100, Math.max(0, p));
  }, [activeGoal]);

  // ── Bog' bezash do'koni logikasi (Tanga/Quyosh/Yulduz asosida va Joylashtirish bilan) ──
  const handleBuyDecoration = async (item) => {
    const isSun = item.currency === "sun";
    const isStar = item.currency === "star";

    if (isStar) {
      if (barakaStarsCount < item.cost) {
        showMsg(L(`Yetarli Baraka yulduzingiz yo'q! ${item.cost} ⭐ kerak`, `Недостаточно звезд Бараки! Нужно ${item.cost} ⭐`), "gift");
        return;
      }
      const nextStars = barakaStarsCount - item.cost;
      setBarakaStarsCount(nextStars);
      const nextPurchased = [...purchasedDecorations, item.id];
      setPurchasedDecorations(nextPurchased);
      await saveGarden(plots, undefined, undefined, undefined, undefined, decorations, nextPurchased, placedDecorations, {
        barakaStarsCount: nextStars
      });
      showMsg(L(`${item.name} muvaffaqiyatli xarid qilindi!`, `${item.nameRu} успешно куплен!`), "bloom");
    } else if (isSun) {
      if (energy < item.cost) {
        showMsg(L(`Yetarli quyoshingiz yo'q! ${item.cost} ta kerak`, `Недостаточно солнца! Нужно ${item.cost}`), "sun");
        return;
      }
      const nextEnergy = energy - item.cost;
      setEnergy(nextEnergy);
      const nextPurchased = [...purchasedDecorations, item.id];
      setPurchasedDecorations(nextPurchased);
      await saveGarden(plots, undefined, nextEnergy, undefined, undefined, decorations, nextPurchased, placedDecorations);
      showMsg(L(`${item.name} muvaffaqiyatli xarid qilindi!`, `${item.nameRu} успешно куплен!`), "bloom");
    } else {
      if (coins < item.cost) {
        showMsg(L("Yetarli tangangiz yo'q! " + item.cost + " ta kerak", "Недостаточно монет! Нужно " + item.cost), "coin");
        setShowAdModal(true);
        return;
      }
      const nextCoins = coins - item.cost;
      setCoins(nextCoins);
      const nextPurchased = [...purchasedDecorations, item.id];
      setPurchasedDecorations(nextPurchased);

      if (addCoin) {
        await addCoin(-item.cost, L(item.name + " sotib olindi", "Куплено " + item.nameRu)).catch(() => {});
      }

      await saveGarden(plots, nextCoins, undefined, undefined, undefined, decorations, nextPurchased, placedDecorations);
      showMsg(L(item.name + " muvaffaqiyatli sotib olindi!", item.nameRu + " успешно куплен!"), "bloom");
    }
  };

  const handleMeadowTap = (x, y) => {
    setTempCoord({ x, y });
  };

  const confirmPlacement = async () => {
    if (!placingItem || !tempCoord) return;
    const instanceId = `${placingItem.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newPlacedInstance = {
      instanceId,
      itemId: placingItem.id,
      x: tempCoord.x,
      y: tempCoord.y
    };

    const nextPlaced = [...placedDecorations, newPlacedInstance];
    // Inventorydan bitta dona olib tashlash
    const index = purchasedDecorations.indexOf(placingItem.id);
    let nextPurchased = [...purchasedDecorations];
    if (index !== -1) {
      nextPurchased.splice(index, 1);
    }

    setPlacedDecorations(nextPlaced);
    setPurchasedDecorations(nextPurchased);
    setPlacingItem(null);
    setTempCoord(null);

    await saveGarden(plots, undefined, undefined, undefined, undefined, decorations, nextPurchased, nextPlaced);
    showMsg(L(`${placingItem.name} maysazorga joylandi!`, `${placingItem.nameRu} успешно установлен!`), "bloom");
  };

  const cancelPlacement = () => {
    if (placingItem) {
      const nextPurchased = [...purchasedDecorations, placingItem.id];
      setPurchasedDecorations(nextPurchased);
    }
    setPlacingItem(null);
    setTempCoord(null);
  };

  const handlePlacedDecorClick = (instance) => {
    setSelectedPlacedInstance(instance);
  };

  // ── O'simlik o'sishini tezlashtirish (50 quyosh = 3h, 100 quyosh = darhol pishadi) ──
  const handleGrowSpeedup = async (plotId, amount) => {
    if (energy < amount) {
      showMsg(L(`Yetarli quyosh yo'q! ${amount} ta kerak`, `Недостаточно солнца! Нужно ${amount}`), "sun");
      setShowFertilizerModal(null);
      return;
    }
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.stage < 0 || plot.harvestReady) {
      setShowFertilizerModal(null);
      return;
    }

    let nextStage = plot.stage;
    let harvestReady = false;

    if (amount === 50) {
      nextStage = Math.min(STAGES.length - 1, plot.stage + 1);
      if (nextStage === STAGES.length - 1) harvestReady = true;
    } else if (amount === 100) {
      nextStage = STAGES.length - 1;
      harvestReady = true;
    }

    const nextEnergy = energy - amount;
    const nextPlots = plots.map(p => p.id === plotId
      ? { ...p, stage: nextStage, waterCount: 0, harvestReady }
      : p);

    setPlots(nextPlots);
    setEnergy(nextEnergy);
    setShowFertilizerModal(null);
    setGrowAnim(plotId);
    setTimeout(() => setGrowAnim(null), 2000);

    spawnCoin(-amount, 50, 50, "sun");
    showMsg(amount === 100 
      ? L("Daraxtingiz zudlik bilan pishdi!", "Ваше дерево мгновенно созрело!")
      : L("Daraxtingiz keyingi bosqichga o'tdi!", "Растение выросло на 1 стадию!"), "bloom");
    await saveGarden(nextPlots, undefined, nextEnergy, undefined);
  };

  // Birlashtirilgan eski o'g'it sepgich (eski versiyalar uchun qisqacha qo'llab-quvvatlash)
  const handleApplyFertilizer = (plotId) => {
    handleGrowSpeedup(plotId, 50);
  };

  // ── Sug'orish (Fast watering with water drops allowed!) ──
  const handleWater = async (plotId, bypassCooldownConfirm = false) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.stage < 0) { showMsg(L("Avval urug' eking", "Сначала посейте семя"), "seed"); return; }

    const usesDrop = !waterReady;
    if (usesDrop && !bypassCooldownConfirm) {
      setShowConfirmUseDropModal(plotId);
      return;
    }

    if (usesDrop && waterDrops <= 0) {
      showMsg(L("Tezkor sug'orish uchun tomchilar yetarli emas!", "Недостаточно капель для быстрого полива!"), "drop");
      setShowBuyDropsModal(true);
      return;
    }

    // Calculate animation duration dynamically based on number of targets to water
    // Initial delay/fade-in = 500ms, each target = 3700ms, flight back/fade-out = 1600ms
    const targets = plots.filter(p => p.stage >= 0 && !p.harvestReady);
    const targetsCount = targets.length > 0 ? targets.length : 1;
    const animDuration = 2100 + targetsCount * 3700;

    setWaterAnim(true);
    setTimeout(() => setWaterAnim(false), animDuration);

    const nowT = Date.now();
    const newWaterCount = (plot.waterCount || 0) + 1;
    const stage = plot.stage;
    const needed = STAGES[stage]?.waterNeeded || 3;
    let newStage = stage;
    let harvestReady = plot.harvestReady || false;
    let resetWater = false;

    if (newWaterCount >= needed && stage < STAGES.length - 1) {
      newStage = stage + 1;
      resetWater = true;
      setGrowAnim(plotId);
      setTimeout(() => setGrowAnim(null), 2000);
      if (newStage === STAGES.length - 1) harvestReady = true;
      showMsg(L(STAGES[newStage].name + " bosqichiga yetdi!", "Стадия: " + STAGES[newStage].nameRu + "!"), "leaf");
    } else {
      showMsg(usesDrop 
        ? L("Tezkor sug'orildi! +5 Energiya", "Полито мгновенно каплей! +5 Энергии")
        : L("Bog' sug'orildi! +5 Energiya", "Полито! +5 Энергии"), "drop");
    }

    const newEnergy = energy + 5;
    setEnergy(newEnergy);
    
    // Oilaviy challenge taraqqiyoti oshadi
    const newFamilySuns = familySuns + 5;
    setFamilySuns(newFamilySuns);

    // Bola sug'organi haqidagi ma'lumotni saqlash (bosh sahifadagi 0/2 missiyasi uchun)
    const newRecord = { uid: user?.id, ism: user?.ism || "Bola", sana: new Date().toISOString() };
    const newWateredBy = [newRecord, ...wateredBy].slice(0, 50);
    setWateredBy(newWateredBy);

    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, waterCount: resetWater ? 0 : newWaterCount, stage: newStage, lastWateredAt: nowT, harvestReady }
      : p);
    setPlots(newPlots);

    let nextDrops = waterDrops;
    if (usesDrop) {
      nextDrops = waterDrops - 1;
      setWaterDrops(nextDrops);
    } else {
      setWaterReady(false);
      setWaterTimer(WATER_COOLDOWN);
    }

    spawnCoin(5, 78, 72, "bolt");
    await saveGarden(newPlots, undefined, newEnergy, undefined, usesDrop ? undefined : nowT, undefined, undefined, undefined, {
      waterDrops: nextDrops,
      familySuns: newFamilySuns,
      wateredBy: newWateredBy
    });
  };

  // ── Hosil yig'ish (Oltin va Kamalak daraxtlariga qarab ko'paytirilgan mukofot) ──
  const handleHarvest = async (plotId) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.harvestReady) return;
    
    const isGolden = plot.plantType === "golden";
    const isRainbow = plot.plantType === "rainbow";
    
    let multiplier = 1;
    if (isGolden) multiplier = 2;
    if (isRainbow) multiplier = 5;

    const earned = HARVEST_COINS[Math.min(plot.stage, HARVEST_COINS.length - 1)] * multiplier;
    const crystalBonus = isRainbow ? 5 : (isGolden ? 2 : 1);
    
    const newCoins = coins + earned;
    const newCrystals = crystals + crystalBonus;
    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, stage: 0, waterCount: 0, harvestReady: false, lastSunAt: Date.now(), plantType: plot.plantType || "normal" }
      : p);
      
    setCoins(newCoins);
    setCrystals(newCrystals);
    setPlots(newPlots);
    spawnCoin(earned, 50, 50, "coin");
    
    showMsg(isRainbow
      ? L(`Kamalak Hosili! +${earned} tanga, +${crystalBonus} kristal`, `Радужный Урожай! +${earned} монет, +${crystalBonus} кристаллов`)
      : isGolden
        ? L(`Oltin Hosil! +${earned} tanga, +${crystalBonus} kristal`, `Золотой Урожай! +${earned} монет, +${crystalBonus} кристалла`)
        : L(`Hosil yig'ildi! +${earned} tanga, +${crystalBonus} kristal`, `Урожай собран! +${earned} монет, +${crystalBonus} кристалл`), "gift");
        
    await saveGarden(newPlots, newCoins, undefined, newCrystals);
  };

  // ── Uchastka ochish ──
  const handleUnlock = async (plotId) => {
    const plot = PLOTS.find(p => p.id === plotId);
    if (!plot) return;
    if (coins < plot.unlockCost) {
      showMsg(L("Yetarli tanga yo'q! " + plot.unlockCost + " kerak", "Мало монет! Нужно " + plot.unlockCost), "coin");
      setShowUnlock(null);
      return;
    }
    const newCoins = coins - plot.unlockCost;
    const newPlots = plots.map(p => p.id === plotId ? { ...p, stage: -1, unlocked: true, plantType: "normal" } : p);
    setCoins(newCoins);
    setPlots(newPlots);
    setShowUnlock(null);
    showMsg(L("Yangi maysazor ochildi!", "Новая лужайка открыта!"), "bloom");
    await saveGarden(newPlots, newCoins, undefined, undefined);
  };

  // ── Ekish (Sopol, Oltin yoki Kamalak urug'iga qarab) ──
  const handlePlant = async (plotId, plantType = "normal") => {
    if (plantType === "normal") {
      if (coins < 100) {
        showMsg(L("Urug' sotib olish uchun 100 tanga yetarli emas!", "Недостаточно 100 монет для покупки семени!"), "coin");
        setShowAdModal(true);
        return;
      }
      const nextCoins = coins - 100;
      setCoins(nextCoins);
      if (addCoin) {
        await addCoin(-100, L("Urug' ekildi", "Посеяно семя")).catch(() => {});
      }
      setShowPlant(null);
      for (let step = 1; step <= 4; step++) {
        setDigAnim({ plotId, step });
        await new Promise(r => setTimeout(r, 380));
      }
      setDigAnim(null);
      const newPlots = plots.map(p => p.id === plotId
        ? { ...p, stage: 0, waterCount: 0, harvestReady: false, lastSunAt: Date.now(), plantType: "normal" }
        : p);
      setPlots(newPlots);
      setSelected(plotId);
      showMsg(L("Standart urug' ekildi!", "Обычное семя успешно посажено!"), "seed");
      await saveGarden(newPlots, nextCoins, undefined, undefined);
    } else if (plantType === "golden") {
      if (energy < 200 && goldenSeeds <= 0) {
        showMsg(L("Oltin urug' uchun 200 Quyosh yoki 1 dona zaxira kerak!", "Для Золотого семени нужно 200 Солнца или 1 шт. в запасе!"), "sun");
        return;
      }
      let nextEnergy = energy;
      let nextSeeds = goldenSeeds;
      if (goldenSeeds > 0) {
        nextSeeds = goldenSeeds - 1;
        setGoldenSeeds(nextSeeds);
      } else {
        nextEnergy = energy - 200;
        setEnergy(nextEnergy);
      }
      setShowPlant(null);
      for (let step = 1; step <= 4; step++) {
        setDigAnim({ plotId, step });
        await new Promise(r => setTimeout(r, 380));
      }
      setDigAnim(null);
      const newPlots = plots.map(p => p.id === plotId
        ? { ...p, stage: 0, waterCount: 0, harvestReady: false, lastSunAt: Date.now(), plantType: "golden" }
        : p);
      setPlots(newPlots);
      setSelected(plotId);
      showMsg(L("Oltin Daraxt ekildi! 2 barobar serhosil!", "Посажено Золотое Дерево! Дает в 2 раза больше урожая!"), "seed");
      await saveGarden(newPlots, undefined, nextEnergy, undefined, undefined, undefined, undefined, undefined, {
        goldenSeeds: nextSeeds
      });
    } else if (plantType === "rainbow") {
      if (rainbowSeeds <= 0) {
        showMsg(L("Sizda Kamalak Urug'i yo'q! Uni Baraka Yulduzlari do'konidan sotib oling", "У вас нет Радужного семени! Купите в лавке звезд"), "gift");
        return;
      }
      const nextSeeds = rainbowSeeds - 1;
      setRainbowSeeds(nextSeeds);
      setShowPlant(null);
      for (let step = 1; step <= 4; step++) {
        setDigAnim({ plotId, step });
        await new Promise(r => setTimeout(r, 380));
      }
      setDigAnim(null);
      const newPlots = plots.map(p => p.id === plotId
        ? { ...p, stage: 0, waterCount: 0, harvestReady: false, lastSunAt: Date.now(), plantType: "rainbow" }
        : p);
      setPlots(newPlots);
      setSelected(plotId);
      showMsg(L("Afsonaviy Kamalak Daraxti ekildi! 5 barobar mukofotlar!", "Радужное Дерево посажено! Дает в 5 раз больше наград!"), "seed");
      await saveGarden(newPlots, undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
        rainbowSeeds: nextSeeds
      });
    }
  };

  // ── Kunlik sovg'a ──
  const handleDailyGift = async () => {
    if (dailyDone) { showMsg(L("Bugungi sovg'a olingan, ertaga keling!", "Бонус уже получен"), "gift"); return; }
    const today = new Date().toISOString().slice(0, 10);
    const bonus = 50;
    const newCoins = coins + bonus;
    const newEnergy = energy + 20;
    setCoins(newCoins);
    setEnergy(newEnergy);
    setDailyDone(true);
    spawnCoin(bonus, 20, 40);
    showMsg(L("Kunlik sovg'a! +" + bonus + " tanga, +20 energiya", "Бонус! +" + bonus + " монет"), "gift");
    await Promise.all([
      db.s("baraka_daily_" + oilaId, { date: today, coins: bonus }),
      saveGarden(plots, newCoins, newEnergy, undefined),
    ]);
  };

  // ── Quyosh yig'ish (Oltin / Kamalakka qarab ko'paytirilgan) ──
  const collectSun = async (plotId) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.stage < 0) return;
    if (Date.now() - (plot.lastSunAt || 0) < SUN_CYCLE) return;

    const isGolden = plot.plantType === "golden";
    const isRainbow = plot.plantType === "rainbow";
    const multiplier = isRainbow ? 4 : (isGolden ? 2 : 1);
    const rewardEnergy = SUN_ENERGY * multiplier;

    const newEnergy = energy + rewardEnergy;
    const newPlots = plots.map(p => p.id === plotId ? { ...p, lastSunAt: Date.now() } : p);
    setEnergy(newEnergy);
    setPlots(newPlots);

    // Oila challenge quyoshlari ham qo'shiladi
    const newFamilySuns = familySuns + rewardEnergy;
    setFamilySuns(newFamilySuns);

    const pos = SUN_POS[plotId] || SUN_POS[0];
    spawnCoin(rewardEnergy, pos.x, 30, "sun");
    showMsg(L(`+${rewardEnergy} Baraka Quyoshi terildi!`, `+${rewardEnergy} Солнца Бараки собрано!`), "sun");
    await saveGarden(newPlots, undefined, newEnergy, undefined, undefined, undefined, undefined, undefined, {
      familySuns: newFamilySuns
    });
  };

  // ── Tezlashtirish ──
  const handleSpeedUp = async () => {
    if (waterReady) return;
    if (coins < SPEEDUP_COST) {
      setShowAdModal(true);
      return;
    }
    const newCoins = coins - SPEEDUP_COST;
    const newLW = Math.max(0, (lastWateredRef.current || Date.now()) - 30 * 60 * 1000);
    const remaining = Math.max(0, WATER_COOLDOWN - Math.floor((Date.now() - newLW) / 1000));
    setCoins(newCoins);
    setWaterTimer(remaining);
    if (remaining <= 0) setWaterReady(true);
    spawnCoin(-SPEEDUP_COST, 50, 78, "coin");
    showMsg(L("30 daqiqa tejaldi!", "−30 минут!"), "rocket");
    await saveGarden(plots, newCoins, undefined, undefined, newLW);
  };

  // ── Tezkor Suv Tomchilarini Quyosh evaziga sotib olish ──
  const handleBuyWaterDrops = async (cost, amount) => {
    if (energy < cost) {
      showMsg(L(`Tomchi xarid qilishga yetarli quyosh yo'q! ${cost} kerak`, `Недостаточно солнца! Нужно ${cost}`), "sun");
      return;
    }
    const nextEnergy = energy - cost;
    const nextDrops = waterDrops + amount;
    setEnergy(nextEnergy);
    setWaterDrops(nextDrops);
    setShowBuyDropsModal(false);
    spawnCoin(amount, 50, 45, "drop");
    showMsg(L(`+${amount} ta suv tomchisi sotib olindi!`, `Куплено +${amount} капель воды!`), "drop");
    await saveGarden(plots, undefined, nextEnergy, undefined, undefined, undefined, undefined, undefined, {
      waterDrops: nextDrops
    });
  };

  // ── Yomg'ir ob-havo chaqirish (Barcha o'simliklarni sug'orib o'stiradi) ──
  const handleTriggerRain = async () => {
    if (rainActive) return;
    if (energy < 300) {
      showMsg(L("Baraka yomg'irini chaqirish uchun 300 Quyosh kerak!", "Для вызова Благодатного дождя нужно 300 Солнца!"), "sun");
      return;
    }
    const nextEnergy = energy - 300;
    setEnergy(nextEnergy);
    setRainActive(true);
    showMsg(L("🌧️ Baraka yomg'iri yog'moqda! Barcha o'simliklar sug'orilmoqda...", "🌧️ Идет Благодатный дождь! Все растения поливаются автоматически..."), "drop");

    const nowT = Date.now();
    const nextPlots = plots.map(plot => {
      if (plot.stage >= 0 && !plot.harvestReady) {
        const newWaterCount = (plot.waterCount || 0) + 1;
        const stage = plot.stage;
        const needed = STAGES[stage]?.waterNeeded || 3;
        let newStage = stage;
        let harvestReady = plot.harvestReady || false;
        if (newWaterCount >= needed && stage < STAGES.length - 1) {
          newStage = stage + 1;
          if (newStage === STAGES.length - 1) harvestReady = true;
        }
        return {
          ...plot,
          waterCount: newStage !== stage ? 0 : newWaterCount,
          stage: newStage,
          lastWateredAt: nowT,
          harvestReady
        };
      }
      return plot;
    });

    setPlots(nextPlots);

    // Rain overlay stops after 6 seconds
    setTimeout(() => {
      setRainActive(false);
      showMsg(L("🌤️ Baraka yomg'iri tindi! Bog'ingiz yashnab ketdi", "🌤️ Благодатный дождь закончился! Сад зазеленел"), "leaf");
    }, 6000);

    await saveGarden(nextPlots, undefined, nextEnergy, undefined, nowT);
  };

  // ── Omad G'ildiragi (Lucky Spin) ──
  const PRIZES = [
    { label: "300 Tanga", labelRu: "300 Монет", labelShort: "300", labelShortRu: "300", value: "coins_300", color: "#f59e0b", icon: "🪙" },
    { label: "3 Kristall", labelRu: "3 Кристалла", labelShort: "3 Kristall", labelShortRu: "3 Крист.", value: "crystals_3", color: "#3b82f6", icon: "💎" },
    { label: "Oltin Urug'", labelRu: "Золотое семя", labelShort: "Oltin", labelShortRu: "Золото", value: "golden_seed", color: "#10b981", icon: "🌱" },
    { label: "150 Quyosh", labelRu: "150 Солнца", labelShort: "150 ☀️", labelShortRu: "150 ☀️", value: "suns_150", color: "#ec4899", icon: "☀️" },
    { label: "1000 Tanga", labelRu: "1000 Монет", labelShort: "1000", labelShortRu: "1000", value: "coins_1000", color: "#f59e0b", icon: "💰" },
    { label: "Sirli Sandiq", labelRu: "Тайный сундук", labelShort: "Sandiq", labelShortRu: "Сундук", value: "mystery_box", color: "#8b5cf6", icon: "🎁" },
  ];

  const handleSpin = async () => {
    if (isSpinning) return;
    if (energy < 500) {
      showMsg(L("Aylantirish uchun 500 Quyosh kerak!", "Для прокрутки нужно 500 Солнца!"), "sun");
      return;
    }
    
    setIsSpinning(true);
    setSpinResult(null);
    const nextEnergy = energy - 500;
    setEnergy(nextEnergy);
    
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[prizeIndex];
    
    // Smooth wheel spin transition
    const degrees = 1800 + (360 - (prizeIndex * 60));
    setSpinAngle(degrees);
    
    setTimeout(async () => {
      setIsSpinning(false);
      setSpinResult(prize);
      
      let nextCoins = coins;
      let nextCrystals = crystals;
      let nextEnergyFinal = nextEnergy;
      let nextSeeds = goldenSeeds;
      let nextPurchased = [...purchasedDecorations];
      
      if (prize.value === "coins_300") {
        nextCoins += 300;
        setCoins(nextCoins);
        spawnCoin(300, 50, 45, "coin");
      } else if (prize.value === "coins_1000") {
        nextCoins += 1000;
        setCoins(nextCoins);
        spawnCoin(1000, 50, 45, "coin");
      } else if (prize.value === "crystals_3") {
        nextCrystals += 3;
        setCrystals(nextCrystals);
        spawnCoin(3, 50, 45, "gem");
      } else if (prize.value === "golden_seed") {
        nextSeeds += 1;
        setGoldenSeeds(nextSeeds);
        spawnCoin(1, 50, 45, "seed");
      } else if (prize.value === "suns_150") {
        nextEnergyFinal += 150;
        setEnergy(nextEnergyFinal);
        spawnCoin(150, 50, 45, "sun");
      } else if (prize.value === "mystery_box") {
        const decors = ["favvora", "archa", "uycha", "kamalak_guli"];
        const wonDecor = decors[Math.floor(Math.random() * decors.length)];
        nextPurchased.push(wonDecor);
        setPurchasedDecorations(nextPurchased);
      }
      
      showMsg(L(`Siz yutdingiz: ${L(prize.label, prize.labelRu)}!`, `Вы выиграли: ${L(prize.label, prize.labelRu)}!`), "gift");
      await saveGarden(plots, nextCoins, nextEnergyFinal, nextCrystals, undefined, undefined, nextPurchased, undefined, {
        goldenSeeds: nextSeeds
      });
    }, 4500);
  };

  // ── AI maslahati generatori (1-maslahat bepul, keyingisi 20 Quyosh) ──
  const handleGetAiAdvice = async () => {
    const isFree = Date.now() - lastAiAdviceAt > 24 * 60 * 60 * 1000;
    const cost = isFree ? 0 : 20;
    
    if (energy < cost) {
      showMsg(L(`Maslahat uchun yetarli quyosh yo'q! 20 ta kerak`, `Недостаточно солнца! Нужно 20`), "sun");
      return;
    }
    
    setLoadingAdvice(true);
    setAiAdvice("");
    
    const nextEnergy = energy - cost;
    if (cost > 0) {
      setEnergy(nextEnergy);
    }
    const nextLastAdvice = Date.now();
    setLastAiAdviceAt(nextLastAdvice);
    
    const tipsUz = [
      "Baraka bog'ingiz go'zal! Oilaviy byudjetda kiyim-kechak xarajatlarini 10% kamaytirib, uni orzuingizdagi maqsadga yo'naltiring.",
      "Katta intizom! O'tgan oyda oziq-ovqat xarajatlarini nazorat qildingiz. Har kuni kichik summalarni tejasangiz, bolalaringiz kelajagi serob bo'ladi.",
      "Qarzlar miqdorini kamaytirish uchun ajoyib imkoniyat! Haftalik daromaddan 15% ni qarzni tezroq yopishga yo'naltiring, bu baraka olib keladi.",
      "Oila a'zolaringiz bilan hamkorlikda 1000 Quyosh to'plashga yaqin qoldingiz! Ushbu hamkorlik sizga bepul +500 Coin taqdim etadi."
    ];
    const tipsRu = [
      "Ваш сад Бараки прекрасен! Сократите семейные расходы на одежду на 10% на этой неделе и направьте их на цель вашей мечты.",
      "Прекрасная дисциплина! Вы отлично контролировали расходы на продукты. Ежедневная экономия небольших сумм обеспечит будущее детей.",
      "Отличный шанс уменьшить долги! Направляйте 15% еженедельного дохода на досрочное погашение обязательств для привлечения достатка.",
      "Вы близки к сбору 1000 Солнц всей семьей! Это принесет вам дополнительный бонус +500 монет."
    ];
    
    const adviceText = L(
      tipsUz[Math.floor(Math.random() * tipsUz.length)],
      tipsRu[Math.floor(Math.random() * tipsRu.length)]
    );
    
    setTimeout(async () => {
      setAiAdvice(adviceText);
      setLoadingAdvice(false);
      showMsg(L("AI moliyaviy maslahati tayyor!", "Финансовый совет от ИИ готов!"), "bloom");
      await saveGarden(plots, undefined, cost > 0 ? nextEnergy : undefined, undefined, undefined, undefined, undefined, undefined, {
        lastAiAdviceAt: nextLastAdvice
      });
    }, 1500);
  };

  // ── Oilaviy challenge mukofotini yechib olish (+500 Coin bonus!) ──
  const handleClaimFamilyBonus = async () => {
    if (familySuns < 1000) return;
    if (familyBonusClaimed) {
      showMsg(L("Bonus allaqachon olingan!", "Бонус уже получен!"), "gift");
      return;
    }
    
    const nextCoins = coins + 500;
    setCoins(nextCoins);
    setFamilyBonusClaimed(true);
    
    if (addCoin) {
      await addCoin(500, L("Oilaviy 1000 Quyosh Bonusi!", "Семейный бонус 1000 Солнца!")).catch(() => {});
    }
    
    spawnCoin(500, 50, 45, "coin");
    showMsg(L("Oila bilan g'alaba! +500 Tanga olindi!", "Семейный успех! Получено +500 монет!"), "gift");
    
    await saveGarden(plots, nextCoins, undefined, undefined, undefined, undefined, undefined, undefined, {
      familyBonusClaimed: true
    });
  };

  // ── Prestij: 1000 Quyosh -> 1 Baraka Yulduzi ⭐ ──
  const handleConvertSunsToBaraka = async () => {
    if (energy < 1000) {
      showMsg(L("Kamida 1000 Quyosh bo'lishi lozim!", "Требуется минимум 1000 Солнца!"), "sun");
      return;
    }
    const nextEnergy = energy - 1000;
    const nextStars = barakaStarsCount + 1;
    setEnergy(nextEnergy);
    setBarakaStarsCount(nextStars);
    setShowPrestigeModal(false);
    
    spawnCoin(1, 50, 50, "gift");
    showMsg(L("Tabriklaymiz! 1 ta Baraka yulduzi ⭐ olindi!", "Поздравляем! Получена 1 звезда Бараки ⭐!"), "bloom");
    
    await saveGarden(plots, undefined, nextEnergy, undefined, undefined, undefined, undefined, undefined, {
      barakaStarsCount: nextStars
    });
  };

  // ── Uchastka bosilganda (Super o'g'it bilan takomillashtirilgan) ──
  const onPlotTap = (plot) => {
    const isUnlocked = plot.id === 0 || plot.unlocked || plot.stage >= 0;
    if (!isUnlocked) { setShowUnlock(plot.id); return; }
    if (plot.stage < 0) { setShowPlant(plot.id); return; }
    setSelected(plot.id);
    if (plot.harvestReady) {
      handleHarvest(plot.id);
    } else if (plot.stage < STAGES.length - 1) {
      // O'sayotgan o'simlik bo'lsa o'g'it sepish taklifi modalini ochamiz
      setShowFertilizerModal(plot.id);
    }
  };

  const onSunTap = (plotId, ready) => {
    if (ready) { collectSun(plotId); return; }
    setSunNote(plotId);
    clearTimeout(sunNoteRef.current);
    sunNoteRef.current = setTimeout(() => setSunNote(null), 3000);
  };

  const selPlot  = plots.find(p => p.id === selected) || plots[0];
  const selStage = selPlot?.stage ?? -1;
  const mode = useMemo(() => skyMode(new Date(now)), [Math.floor(now / 600000)]);

  // ── Hosila ko'rsatkichlar (faqat display; logika emas) ──
  const planted = plots.filter(p => p.stage >= 0);
  const anyPlanted = planted.length > 0;
  const maxStage = anyPlanted ? Math.max(...planted.map(p => p.stage)) : -1;
  const bestPlot = anyPlanted ? planted.find(p => p.stage === maxStage) : null;
  const levelProgress = !bestPlot ? 0
    : maxStage >= STAGES.length - 1 ? 100
    : Math.min(100, ((bestPlot.waterCount || 0) / (STAGES[maxStage].waterNeeded || 1)) * 100);
  const unlockedCount = plots.filter(p => p.id === 0 || p.unlocked || p.stage >= 0).length;
  const sunsReady = planted.filter(p => now - (p.lastSunAt || 0) >= SUN_CYCLE).length;

  const achievements = useMemo(() => ([
    { icon: <SeedSVG size={22} />,  title: L("Ilk urug'", "Первое семя"),        desc: L("Birinchi Baraka urug'ini eking", "Посейте первое семя"),              reward: L("Quyosh sikli ochiladi", "Открывается цикл солнца"), ok: anyPlanted },
    { icon: <LeafSVG size={20} />,  title: L("Yosh bog'bon", "Юный садовник"),    desc: L("Daraxtni yosh daraxt bosqichiga yetkazing", "Вырастите деревце"),      reward: "+" + HARVEST_COINS[2] + " " + L("tanga hosili", "монет урожая"), ok: maxStage >= 2 },
    { icon: <BloomSVG size={20} />, title: L("Gulchi", "Цветовод"),               desc: L("Daraxtingiz gullasin", "Дерево должно зацвести"),                      reward: "+" + HARVEST_COINS[4] + " " + L("tanga hosili", "монет урожая"), ok: maxStage >= 4 },
    { icon: <PlantSVG stage={6} size={26} animated={false} />, title: L("Baraka ustasi", "Мастер Бараки"), desc: L("Baraka daraxtiga erishing", "Достигните Дерева Бараки"), reward: "+" + HARVEST_COINS[6] + " " + L("tanga, +1 kristal", "монет, +1 кристалл"), ok: maxStage >= 6 },
    { icon: <MapSVG size={20} />,   title: L("Kengaytiruvchi", "Расширитель"),    desc: L("Ikkinchi uchastkani oching", "Откройте второй участок"),               reward: L("Qo'shimcha quyosh manbai", "Доп. источник солнца"), ok: unlockedCount >= 2 },
    { icon: <MapSVG size={20} />,   title: L("Yer egasi", "Землевладелец"),       desc: L("Barcha 5 uchastkani oching", "Откройте все 5 участков"),               reward: L("5 barobar daromad oqimi", "5× поток дохода"), ok: unlockedCount >= 5 },
    { icon: <GemSVG size={18} />,   title: L("Kristall to'plovchi", "Собиратель"), desc: L("5 ta kristal to'plang", "Соберите 5 кристаллов"),                     reward: L("Har hosil +1 kristal", "Каждый урожай +1 кристалл"), ok: crystals >= 5 },
    { icon: <CoinSVG size={18} />,  title: L("Xazinabon", "Казначей"),            desc: L("1 000 tanga to'plang", "Накопите 1 000 монет"),                        reward: L("Yangi uchastkaga yo'l", "Путь к новому участку"), ok: coins >= 1000 },
  ]), [anyPlanted, maxStage, unlockedCount, crystals, coins, lg]);

  const history = useMemo(() => {
    const ev = [];
    plots.forEach(p => {
      if (p.lastWateredAt > 0) ev.push({ t: p.lastWateredAt, icon: <DropSVG size={12} />, label: L("Uchastka " + (p.id + 1) + " sug'orildi", "Участок " + (p.id + 1) + " полит") });
    });
    if (dailyDone) ev.push({ t: now, today: true, icon: <GiftSVG size={16} />, label: L("Kunlik sovg'a olindi", "Ежедневный бонус получен") });
    return ev.sort((a, b) => b.t - a.t).slice(0, 6);
  }, [plots, dailyDone, lg]);

  const rewards = [
    { icon: MonoIco.minus(gt.acc),    label: L("Xarajat qo'shish", "Добавить расход"),        amount: 5,  kind: "coin" },
    { icon: MonoIco.plus(gt.acc),     label: L("Daromad qo'shish", "Добавить доход"),          amount: 10, kind: "coin" },
    { icon: MonoIco.qr(gt.acc),       label: L("QR kod skanerlash", "Сканировать QR"),         amount: 10, kind: "coin" },
    { icon: MonoIco.target(gt.acc),   label: L("Maqsad yaratish", "Создать цель"),             amount: 20, kind: "coin" },
    { icon: MonoIco.check(gt.acc),    label: L("Maqsadga erishish", "Достичь цели"),           amount: 50, kind: "coin" },
    { icon: MonoIco.card(gt.acc),     label: L("Qarzni yopish", "Закрыть долг"),               amount: 30, kind: "coin" },
    { icon: MonoIco.users(gt.acc),    label: L("Oila a'zosi qo'shish", "Добавить участника"),  amount: 15, kind: "coin" },
    { icon: MonoIco.calendar(gt.acc), label: L("7 kun ketma-ket", "7 дней подряд"),            amount: 25, kind: "coin" },
    { icon: <GiftSVG size={17} />,    label: L("Kunlik sovg'a", "Ежедневный бонус"),           amount: 50, kind: "coin" },
    { icon: <SunSprite size={19} />,  label: L("Quyosh yig'ish (3 soatda pishadi)", "Собрать солнце (зреет 3 часа)"), amount: SUN_ENERGY, kind: "bolt" },
    { icon: <RocketSVG size={17} />,  label: L("Tezlatish (−30 daqiqa)", "Ускорить (−30 минут)"), amount: SPEEDUP_COST, kind: "coin", negative: true },
  ];

  const unlockPlot = showUnlock !== null ? PLOTS.find(p => p.id === showUnlock) : null;
  const canAffordUnlock = unlockPlot ? coins >= unlockPlot.unlockCost : false;

  // ════════════════════════ RENDER ═══════════════════════════
  // Immersive rejim: sahna butun ekranni egallaydi, panel — BottomSheet'da.
  const thSheet = { sur: gt.sur, bor: gt.bor, t1: gt.ink1 };
  const menuBadge = !dailyDone || sunsReady > 0;
  const glassBtn = {
    width: COMP.touchMin, height: COMP.touchMin, flexShrink: 0, borderRadius: RADIUS.full,
    border: "1.5px solid " + gt.glassBorder, background: gt.skyScrim, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent",
  };

  return (
    <div className="gd-root" style={{ zIndex: Z.nav, background: SKY_GRAD[mode], fontFamily: "inherit", userSelect: "none" }}>
      <GardenDefs />

      {/* ── SAHNA: ekranning ~88% ── */}
      <GardenScene
        full
        gt={gt} mode={mode} L={L}
        plots={plots} selected={selected} coins={coins}
        now={now} fTime={fTime}
        waterReady={waterReady} waterTimer={waterTimer}
        digAnim={digAnim} growAnim={growAnim} waterAnim={waterAnim}
        sunNote={sunNote} flyRewards={flyCoins} sunCycle={SUN_CYCLE}
        onPlotTap={onPlotTap} onSunTap={onSunTap}
        onSpeedUp={handleSpeedUp}
        decorations={decorations}
        placedDecorations={placedDecorations}
        placingItem={placingItem}
        tempCoord={tempCoord}
        onMeadowTap={handleMeadowTap}
        onPlacedDecorClick={handlePlacedDecorClick}
        isPlacing={!!placingItem}
        rainActive={rainActive}
        onAction={() => {
          if (selStage < 0) { setShowPlant(selected); return; }
          if (selPlot?.harvestReady) { handleHarvest(selected); return; }
          handleWater(selected);
        }} />

      {/* ── HUD: yuqori panel (orqaga · sarlavha · menyu) ── */}
      <div style={{ position: "absolute", top: "env(safe-area-inset-top)", left: 0, right: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3 + "px " + SPACE.s4 + "px 0" }}>
        <button className="ui-press" onClick={onBack} aria-label={L("Orqaga", "Назад")} style={glassBtn}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke={gt.onSky} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ ...TYPE.heading, color: gt.onSky, textShadow: "0 2px 10px " + gt.skyScrim, letterSpacing: 0.3 }}>
          {L("Baraka Bog'i", "Сад Бараки")}
        </div>
        <div style={{ display: "flex", gap: SPACE.s2, alignItems: "center" }}>
          {/* Bezash (Decorate) Button using Stars */}
          <button className="ui-press" onClick={() => setShowDecorModal(true)} aria-label={L("Bezash", "Декор")} style={glassBtn}>
            <span style={{ fontSize: 16 }}>🎪</span>
          </button>
          
          <button className="ui-press" onClick={() => setShowMenu(true)} aria-label={L("Menyu", "Меню")} style={{ ...glassBtn, position: "relative" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={gt.onSky} strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 14.5V9M9 14.5V3.5M15 14.5V6.5" />
            </svg>
            {menuBadge && <span style={{ position: "absolute", top: SPACE.s1, right: SPACE.s1, width: SPACE.s2 + 1, height: SPACE.s2 + 1, borderRadius: RADIUS.full, background: gt.gold, border: "1.5px solid " + gt.onSky }} />}
          </button>
        </div>
      </div>

      {/* ── FLOAT: o'ng tomondagi yangi doiraviy tugmalar (Omad g'ildiragi, Yomg'ir, AI Maslahatchi, Prestij) ── */}
      <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top) + 80px)", right: SPACE.s4, zIndex: 40, display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
        {/* Omad G'ildiragi (Lucky Spin) */}
        <button className="ui-press" onClick={() => setShowSpinModal(true)} 
          style={{ ...glassBtn, width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.22))", border: "1.5px solid #fbbf24", boxShadow: "0 0 12px rgba(245, 158, 11, 0.55)", cursor: "pointer" }} 
          title={L("Omad G'ildiragi", "Колесо Удачи")}>
          <span style={{ fontSize: 22, animation: "gdBounce 2s ease-in-out infinite" }}>🎡</span>
        </button>

        {/* Baraka yomg'iri (Rain Control) */}
        <button className="ui-press" onClick={handleTriggerRain} 
          style={{ ...glassBtn, width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(3, 105, 161, 0.22))", border: "1.5px solid #38bdf8", boxShadow: "0 0 12px rgba(56, 189, 248, 0.55)", cursor: "pointer" }} 
          title={L("Baraka yomg'iri (300 ☀️)", "Дождь Бараки (300 ☀️)")}>
          <span style={{ fontSize: 22, animation: "gdBounce 2.4s ease-in-out infinite 0.2s" }}>🌧️</span>
        </button>

        {/* AI Maslahatchi */}
        <button className="ui-press" onClick={() => { setShowAiAdvisorModal(true); handleGetAiAdvice(); }} 
          style={{ ...glassBtn, width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(168, 85, 247, 0.22), rgba(109, 33, 168, 0.22))", border: "1.5px solid #c084fc", boxShadow: "0 0 12px rgba(168, 85, 247, 0.55)", cursor: "pointer" }} 
          title={L("AI Maslahatchi", "ИИ Советник")}>
          <span style={{ fontSize: 22, animation: "gdBounce 2.8s ease-in-out infinite 0.4s" }}>🔮</span>
        </button>

        {/* Baraka Prestij */}
        <button className="ui-press" onClick={() => setShowPrestigeModal(true)} 
          style={{ ...glassBtn, width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(234, 179, 8, 0.22), rgba(202, 138, 4, 0.22))", border: "1.5px solid #facc15", boxShadow: "0 0 12px rgba(234, 179, 8, 0.65)", cursor: "pointer" }} 
          title={L("Baraka Prestij (Yulduzlar)", "Престиж Бараки (Звезды)")}>
          <span style={{ fontSize: 22, animation: "gdBounce 2.2s ease-in-out infinite 0.6s" }}>👑</span>
        </button>
      </div>

      {/* ── HUD: resurslar (yig'ilgan quyosh energiyasi, tomchilar, yulduzlar va kristallar) ── */}
      <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top) + " + (SPACE.s16 - SPACE.s2) + "px)", left: SPACE.s4, zIndex: 40, display: "flex", flexDirection: "column", gap: SPACE.s2 - 2 }}>
        <div key={"e" + energy} style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2, background: gt.skyScrim, border: "1px solid " + gt.glassBorder, borderRadius: RADIUS.pill, padding: (SPACE.s1 - 1) + "px " + (SPACE.s2 + 2) + "px " + (SPACE.s1 - 1) + "px " + SPACE.s1 + "px", animation: "gdHudPop " + MOTION.slow + " " + MOTION.spring }}>
          <SunSprite size={20} />
          <span style={{ ...TYPE.caption, fontWeight: 800, color: gt.onSky, fontVariantNumeric: "tabular-nums" }}>{energy.toLocaleString()}</span>
        </div>
        <button className="ui-press" onClick={() => setShowBuyDropsModal(true)} style={{ outline: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: SPACE.s1 + 2, background: gt.skyScrim, border: "1px solid " + gt.glassBorder, borderRadius: RADIUS.pill, padding: (SPACE.s1 - 1) + "px " + (SPACE.s2 + 2) + "px", animation: "gdHudPop " + MOTION.slow + " " + MOTION.spring }}>
          <span style={{ fontSize: 13 }}>💧</span>
          <span style={{ ...TYPE.caption, fontWeight: 800, color: gt.onSky, fontVariantNumeric: "tabular-nums" }}>{waterDrops.toLocaleString()}</span>
        </button>
        <div key={"s" + barakaStarsCount} style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2, background: gt.skyScrim, border: "1px solid " + gt.glassBorder, borderRadius: RADIUS.pill, padding: (SPACE.s1 - 1) + "px " + (SPACE.s2 + 2) + "px", animation: "gdHudPop " + MOTION.slow + " " + MOTION.spring }}>
          <span style={{ fontSize: 13 }}>⭐</span>
          <span style={{ ...TYPE.caption, fontWeight: 800, color: gt.onSky, fontVariantNumeric: "tabular-nums" }}>{barakaStarsCount.toLocaleString()}</span>
        </div>
        <div key={"c" + crystals} style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2, background: gt.skyScrim, border: "1px solid " + gt.glassBorder, borderRadius: RADIUS.pill, padding: (SPACE.s1 - 1) + "px " + (SPACE.s2 + 2) + "px", animation: "gdHudPop " + MOTION.slow + " " + MOTION.spring }}>
          <GemSVG size={15} />
          <span style={{ ...TYPE.caption, fontWeight: 800, color: gt.onSky, fontVariantNumeric: "tabular-nums" }}>{crystals.toLocaleString()}</span>
        </div>
      </div>

      {/* ── HUD: bo'sh bog' yo'naltiruvchisi ── */}
      {!anyPlanted && !showPlant && digAnim === null && (
        <button className="ui-press" onClick={() => setShowPlant(selected)}
          style={{ position: "absolute", left: "50%", top: "34%", transform: "translateX(-50%)", zIndex: 40, background: gt.sceneScrim, border: "1.5px solid " + gt.glassBorder, borderRadius: RADIUS.pill, padding: SPACE.s2 + "px " + (SPACE.s4 + SPACE.s1) + "px", cursor: "pointer", display: "flex", alignItems: "center", gap: SPACE.s2, fontFamily: "inherit", animation: "gdBounce 2.2s ease-in-out infinite" }}>
          <SeedSVG size={22} />
          <span style={{ ...TYPE.subtitle, fontWeight: 700, color: gt.onSky }}>{L("Birinchi urug'ni eking", "Посейте первое семя")}</span>
        </button>
      )}

      {/* ── MENYU: BottomSheet (sahna ochiq qoladi) ── */}
      <BottomSheet th={thSheet} open={showMenu} onClose={() => setShowMenu(false)} maxH="86dvh">

        {/* Profil va daraja */}
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s4 }}>
          <div style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.full, background: gt.accGrad, display: "flex", alignItems: "center", justifyContent: "center", ...TYPE.heading, color: gt.sur, flexShrink: 0 }}>
            {(user?.ism || "B").slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TYPE.subtitle, fontWeight: 800, color: gt.ink1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.ism || L("Bog'bon", "Садовник")}</div>
            <div style={{ ...TYPE.caption, color: gt.ink2 }}>{L("Baraka bog'boni", "Садовник Бараки")}</div>
          </div>
          <GChip gt={gt} tone="leaf">{L("Daraja", "Уровень")} {anyPlanted ? maxStage : 0}</GChip>
        </div>
        <GCard gt={gt} style={{ paddingTop: SPACE.s4 + SPACE.s1 }}>
          <LevelGauge gt={gt} L={L}
            level={anyPlanted ? maxStage : 0}
            progress={levelProgress}
            stageName={anyPlanted ? L(STAGES[maxStage].name, STAGES[maxStage].nameRu) : L("Hali boshlanmagan", "Ещё не начат")} />
          <div style={{ marginTop: SPACE.s4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s1 + 2 }}>
              <span style={{ ...TYPE.tiny, color: gt.ink2, display: "flex", alignItems: "center", gap: SPACE.s1 }}><BoltSVG size={12} />{L("Baraka energiyasi", "Энергия Бараки")}</span>
              <span style={{ ...TYPE.caption, fontWeight: 800, color: gt.ink1, fontVariantNumeric: "tabular-nums" }}>{energy.toLocaleString()} XP</span>
            </div>
            <GProgress value={Math.min(100, energy)} gold height={SPACE.s2} />
          </div>
        </GCard>

        {/* Boyliklar */}
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatPill gt={gt} kind="coin" value={coins} label={L("Tanga", "Монеты")} />
          <StatPill gt={gt} kind="bolt" value={energy} label={L("Energiya", "Энергия")} />
          <StatPill gt={gt} kind="gem" value={crystals} label={L("Kristall", "Кристаллы")} />
        </div>

        {/* Oilaviy hamkorlik challenge banneri */}
        <div style={{ margin: `${SPACE.s4}px 0` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ ...TYPE.caption, fontWeight: 800, color: gt.ink1, display: "flex", alignItems: "center", gap: 6 }}>
              <span>👨‍👩‍👧‍👦</span> {L("Oilaviy Challenge", "Семейный Челлендж")}
            </span>
            <span style={{ ...TYPE.tiny, fontWeight: 700, color: familySuns >= 1000 ? "#16a34a" : gt.ink3, fontVariantNumeric: "tabular-nums" }}>
              {familySuns} / 1000 ☀️
            </span>
          </div>
          <GCard gt={gt} style={{ padding: SPACE.s3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
              <div style={{ flex: 1 }}>
                <p style={{ ...TYPE.caption, color: gt.ink2, margin: "0 0 6px 0", lineHeight: 1.4, fontSize: 11 }}>
                  {L("Oila bilan birgalikda 1000 Quyosh yig'ing va qo'shimcha +500 Tanga bonusga ega bo'ling!", "Соберите всей семьей 1000 Солнца и получите супер-бонус +500 монет!")}
                </p>
                <GProgress value={Math.min(100, (familySuns / 1000) * 100)} gold height={8} />
              </div>
              <button className="ui-press" onClick={handleClaimFamilyBonus} disabled={familySuns < 1000 || familyBonusClaimed}
                style={{ padding: "8px 12px", borderRadius: RADIUS.m, border: "none", background: (familySuns >= 1000 && !familyBonusClaimed) ? gt.goldGrad : gt.surH, color: (familySuns >= 1000 && !familyBonusClaimed) ? gt.sur : gt.ink3, ...TYPE.tiny, fontWeight: 800, cursor: (familySuns >= 1000 && !familyBonusClaimed) ? "pointer" : "not-allowed", minWidth: 70, flexShrink: 0 }}>
                {familyBonusClaimed ? L("Olingan", "Получен") : L("Yechish", "Забрать")}
              </button>
            </div>
          </GCard>
        </div>

        {/* Kunlik sovg'a va bugungi jarayon */}
        <GSection gt={gt}>{L("Bugungi jarayon", "Прогресс дня")}</GSection>
        <GCard gt={gt} pad={SPACE.s2 + "px " + SPACE.s4 + "px"}>
          <TodayRow gt={gt} icon={<GiftSVG size={20} />}
            title={L("Kunlik sovg'a", "Ежедневный бонус")}
            sub={dailyDone ? L("Bugun olindi", "Получен сегодня") : L("+50 tanga, +20 energiya", "+50 монет, +20 энергии")}
            done={dailyDone}
            right={dailyDone
              ? <GChip gt={gt} tone="leaf">{L("Olindi", "Получен")}</GChip>
              : <GChip gt={gt} tone="gold">{L("Olish", "Забрать")}</GChip>}
            onClick={dailyDone ? undefined : handleDailyGift} />
          <TodayRow gt={gt} icon={<DropSVG size={15} />}
            title={L("Sug'orish", "Полив")}
            sub={waterReady ? L("Bog' suvga tayyor", "Сад готов к поливу") : L("Keyingi sug'orishgacha", "До следующего полива")}
            done={waterReady}
            right={waterReady
              ? <GChip gt={gt} tone="water">{L("Tayyor", "Готово")}</GChip>
              : <span style={{ ...TYPE.caption, fontWeight: 800, color: gt.ink2, fontVariantNumeric: "tabular-nums" }}>{fTime(waterTimer)}</span>} />
          <TodayRow gt={gt} icon={<SunSprite size={22} />}
            title={L("Pishgan quyoshlar", "Созревшие солнца")}
            sub={sunsReady > 0 ? L("Bog'dan terib oling", "Соберите в саду") : L("Har o'simlik 3 soatda pishiradi", "Каждое растение зреет 3 часа")}
            done={sunsReady > 0}
            right={<GChip gt={gt} tone={sunsReady > 0 ? "gold" : "soil"}>{planted.length === 0 ? "—" : sunsReady + " / " + planted.length}</GChip>}
            last />
        </GCard>

        {/* Yutuqlar */}
        <GSection gt={gt} right={<span style={{ ...TYPE.caption, fontWeight: 700, color: gt.acc, fontVariantNumeric: "tabular-nums" }}>{achievements.filter(a => a.ok).length}/{achievements.length}</span>}>
          {L("Yutuqlar", "Достижения")}
        </GSection>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2 + 2, marginBottom: SPACE.s3 }}>
          {achievements.map((a, i) => (
            <AchievementCard key={i} gt={gt} L={L} icon={a.icon} title={a.title} desc={a.desc} reward={a.reward} unlocked={a.ok} />
          ))}
        </div>

        {/* Tarix */}
        <GSection gt={gt}>{L("So'nggi faoliyat", "Последняя активность")}</GSection>
        <GCard gt={gt} pad={SPACE.s2 + "px " + SPACE.s4 + "px"}>
          {history.length === 0 && (
            <div style={{ ...TYPE.caption, color: gt.ink3, textAlign: "center", padding: SPACE.s4 + "px 0" }}>
              {L("Bog'da hali faoliyat yo'q — sug'orishdan boshlang", "Активности пока нет — начните с полива")}
            </div>
          )}
          {history.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, padding: (SPACE.s2 + 1) + "px 0", borderBottom: i === history.length - 1 ? "none" : "1px solid " + gt.bor }}>
              <div style={{ width: SPACE.s8, height: SPACE.s8, borderRadius: RADIUS.s, background: gt.surH, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{h.icon}</div>
              <span style={{ flex: 1, ...TYPE.body, color: gt.ink1 }}>{h.label}</span>
              <span style={{ ...TYPE.caption, color: gt.ink3 }}>{h.today ? L("Bugun", "Сегодня") : ago(h.t, lg)}</span>
            </div>
          ))}
        </GCard>

        {/* Qo'llanma (mukofotlar va maslahatlar) */}
        <GSection gt={gt}>{L("Tanga topish yo'llari", "Как получить монеты")}</GSection>
        <GCard gt={gt} pad={SPACE.s1 + "px " + SPACE.s4 + "px"}>
          {rewards.map((r, i) => (
            <RewardRow key={i} gt={gt} icon={r.icon} label={r.label} amount={r.amount} kind={r.kind} negative={r.negative} last={i === rewards.length - 1} />
          ))}
        </GCard>

        <GSection gt={gt}>{L("Maslahatlar", "Советы")}</GSection>
        <TipCard gt={gt} title={L("Kunlik ritual", "Ежедневный ритуал")}>
          {L("Har kuni bir marta sug'oring — daraxt bir necha suvdan keyin yangi bosqichga o'tadi. Taymerni 100 tanga evaziga 30 daqiqaga tezlatish mumkin.", "Поливайте раз в день — дерево растёт после нескольких поливов. Таймер можно ускорить за 100 монет.")}
        </TipCard>
        <TipCard gt={gt} title={L("Quyoshlarni boy bermang", "Не упускайте солнца")}>
          {L("Har bir ekilgan o'simlik 3 soatda bitta quyosh chiqaradi — pishganda bosib +15 energiya oling.", "Каждое растение даёт солнце раз в 3 часа — собирайте по +15 энергии.")}
        </TipCard>
        <TipCard gt={gt} title={L("Oila bilan tezroq", "Быстрее всей семьёй")}>
          {L("Xarajat va daromadlarni yozib boring — har bir moliyaviy amal bog'ga tanga olib keladi.", "Записывайте расходы и доходы — каждое действие приносит монеты саду.")}
        </TipCard>
      </BottomSheet>

      {/* ── Toast ── */}
      {msg && (
        <div style={{ position: "fixed", top: "calc(" + SPACE.s16 + "px + env(safe-area-inset-top))", left: "50%", transform: "translateX(-50%)", background: gt.sceneScrim, color: gt.onSky, borderRadius: RADIUS.pill, padding: (SPACE.s2 + 1) + "px " + (SPACE.s4 + SPACE.s1) + "px", ...TYPE.body, fontWeight: 700, zIndex: Z.toast, whiteSpace: "nowrap", animation: "gdMsg " + (msg.dur || 3000) / 1000 + "s ease forwards", boxShadow: SHADOW.e2, display: "flex", alignItems: "center", gap: SPACE.s2 }}>
          {MSG_ICONS[msg.icon] || MSG_ICONS.leaf} {msg.text}
        </div>
      )}

      {/* ── Placement Mode HUD overlay ── */}
      {placingItem && (
        <div style={{ position: "absolute", bottom: "4%", left: "5%", right: "5%", zIndex: 48, background: "rgba(15, 23, 42, 0.92)", backdropFilter: "blur(10px)", borderRadius: RADIUS.l, padding: SPACE.s4, border: "1.5px solid #22c55e", display: "flex", flexDirection: "column", gap: SPACE.s3, alignItems: "center", boxShadow: "0 10px 30px -5px rgba(0,0,0,0.5)", animation: "gdHudPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards" }}>
          <div style={{ ...TYPE.body, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>{placingItem.emoji}</span>
            {L(`${placingItem.name} joylashuvi`, `Размещение: ${placingItem.nameRu}`)}
          </div>
          <p style={{ ...TYPE.caption, color: "#94a3b8", textAlign: "center", maxWidth: 280, margin: 0, lineHeight: 1.5 }}>
            {L("Maysazorning istalgan joyiga bosing, so'ng tasdiqlang", "Нажмите на любое место лужайки, затем подтвердите")}
          </p>
          <div style={{ display: "flex", gap: SPACE.s3, width: "100%" }}>
            <button className="ui-press" onClick={cancelPlacement}
              style={{ flex: 1, padding: SPACE.s2 + 2, borderRadius: RADIUS.m, border: "1px solid #ef4444", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", ...TYPE.caption, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {L("Bekor qilish", "Отмена")}
            </button>
            <button className="ui-press" onClick={confirmPlacement} disabled={!tempCoord}
              style={{ flex: 1.4, padding: SPACE.s2 + 2, borderRadius: RADIUS.m, border: "none", background: tempCoord ? "linear-gradient(135deg, #22c55e, #15803d)" : "#334155", color: "#fff", ...TYPE.caption, fontWeight: 800, cursor: tempCoord ? "pointer" : "not-allowed", opacity: tempCoord ? 1 : 0.5, fontFamily: "inherit" }}>
              {L("✓ Joylash", "✓ Установить")}
            </button>
          </div>
        </div>
      )}

      {/* ── Movable Item Action Selector (Tapped on placed item) ── */}
      {selectedPlacedInstance && (
        <GModal gt={gt} onClose={() => setSelectedPlacedInstance(null)}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>
            <span style={{ fontSize: 48 }}>
              {DECORATION_ITEMS.find(item => item.id === selectedPlacedInstance.itemId)?.emoji || "📦"}
            </span>
          </div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 }}>
            {L(DECORATION_ITEMS.find(item => item.id === selectedPlacedInstance.itemId)?.name || "Bezak", DECORATION_ITEMS.find(item => item.id === selectedPlacedInstance.itemId)?.nameRu || "Украшение")}
          </div>
          <p style={{ ...TYPE.caption, color: gt.ink3, marginBottom: SPACE.s4, textAlign: "center" }}>
            {L("Ushbu bezak ustida qanday amal bajarmoqchisiz?", "Что вы хотите сделать с этим украшением?")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
            <button className="ui-press" onClick={() => {
              const item = DECORATION_ITEMS.find(i => i.id === selectedPlacedInstance.itemId);
              const nextPlaced = placedDecorations.filter(d => d.instanceId !== selectedPlacedInstance.instanceId);
              setPlacedDecorations(nextPlaced);
              setPlacingItem(item);
              setTempCoord({ x: selectedPlacedInstance.x, y: selectedPlacedInstance.y });
              setSelectedPlacedInstance(null);
            }}
              style={{ padding: SPACE.s3, borderRadius: RADIUS.m, border: "none", background: gt.goldGrad, color: gt.sur, ...TYPE.caption, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
              <span style={{ fontSize: 20 }}>🪄 🪴</span> {L("Joyini o'zgartirish", "Переместить")}
            </button>
            
            <button className="ui-press" onClick={async () => {
              const nextPlaced = placedDecorations.filter(d => d.instanceId !== selectedPlacedInstance.instanceId);
              const nextPurchased = [...purchasedDecorations, selectedPlacedInstance.itemId];
              setPlacedDecorations(nextPlaced);
              setPurchasedDecorations(nextPurchased);
              setSelectedPlacedInstance(null);
              await saveGarden(plots, undefined, undefined, undefined, undefined, decorations, nextPurchased, nextPlaced);
              showMsg(L("Bezak xaltachaga olindi!", "Украшение убрано в инвентарь!"), "leaf");
            }}
              style={{ padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.caption, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
              <span style={{ fontSize: 20 }}>🎒 📥</span> {L("Xaltachaga solish", "Убрать в инвентарь")}
            </button>
            
            <button className="ui-press" onClick={() => setSelectedPlacedInstance(null)}
              style={{ padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink3, ...TYPE.caption, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {L("Yopish", "Закрыть")}
            </button>
          </div>
        </GModal>
      )}

      {/* ── Tezkor o'stirish (Fertilizer) modali (Feature #1) ── */}
      {showFertilizerModal !== null && (
        <GModal gt={gt} onClose={() => setShowFertilizerModal(null)}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>
            <span style={{ fontSize: 44 }}>☀️✨</span>
          </div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 }}>
            {L("O'simlikni tez o'stirish", "Ускорение роста")}
          </div>
          <p style={{ ...TYPE.caption, color: gt.ink2, lineHeight: 1.6, marginBottom: SPACE.s4, textAlign: "center" }}>
            {L("Quyosh sarflab o'simlik pishishini tezlashtiring. Tezlik kuchi sizning qo'lingizda!", "Потратьте солнца для ускорения роста. Сила роста в ваших руках!")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
            {/* Option A: 50 Suns = Keyingi bosqich (3 soat tezlashadi) */}
            <button className="ui-press" onClick={() => handleGrowSpeedup(showFertilizerModal, 50)} disabled={energy < 50}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3, border: "1px solid " + gt.bor, borderRadius: RADIUS.m, background: energy >= 50 ? gt.sur : gt.surH, width: "100%", cursor: energy >= 50 ? "pointer" : "not-allowed", opacity: energy >= 50 ? 1 : 0.6 }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ ...TYPE.body, fontWeight: 750, color: gt.ink1 }}>⚡ {L("Tez O'stirish", "Быстрый рост")}</span>
                <p style={{ ...TYPE.caption, color: gt.ink3, margin: "2px 0 0", fontSize: 11 }}>{L("3 soatlik o'sishga teng", "Эквивалент 3 часам роста")}</p>
              </div>
              <span style={{ background: gt.goldGrad, color: gt.sur, padding: "4px 10px", borderRadius: RADIUS.pill, ...TYPE.caption, fontWeight: 800 }}>50 ☀️</span>
            </button>

            {/* Option B: 100 Suns = Darhol pishadi! */}
            <button className="ui-press" onClick={() => handleGrowSpeedup(showFertilizerModal, 100)} disabled={energy < 100}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3, border: "1px solid #10b981", borderRadius: RADIUS.m, background: energy >= 100 ? "rgba(16, 185, 129, 0.04)" : gt.surH, width: "100%", cursor: energy >= 100 ? "pointer" : "not-allowed", opacity: energy >= 100 ? 1 : 0.6 }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ ...TYPE.body, fontWeight: 750, color: "#059669" }}>🔥 {L("Zudlik bilan pishirish", "Мгновенное созревание")}</span>
                <p style={{ ...TYPE.caption, color: gt.ink3, margin: "2px 0 0", fontSize: 11 }}>{L("Hosil darhol tayyor bo'ladi", "Урожай готов моментально")}</p>
              </div>
              <span style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: gt.sur, padding: "4px 10px", borderRadius: RADIUS.pill, ...TYPE.caption, fontWeight: 800 }}>100 ☀️</span>
            </button>
          </div>

          <button className="ui-press" onClick={() => setShowFertilizerModal(null)}
            style={{ width: "100%", padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {L("Bekor qilish", "Отмена")}
          </button>
        </GModal>
      )}

      {/* ── Cooldown Bypass Confirmation Modal ── */}
      {showConfirmUseDropModal !== null && (
        <GModal gt={gt} onClose={() => setShowConfirmUseDropModal(null)}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2, position: "relative" }}>
            <span style={{ fontSize: 52, animation: "gdBounce 2s ease-in-out infinite" }}>💧⏱️</span>
          </div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 }}>
            {L("Sug'orish taymeri", "Таймер полива")}
          </div>
          <p style={{ ...TYPE.caption, color: gt.ink2, lineHeight: 1.6, marginBottom: SPACE.s4, textAlign: "center" }}>
            {L("Bepul sug'orish taymeri hali tugamadi.", "Таймер бесплатного полива еще не истек.")}
            <br />
            {L("Navbatdagi bepul sug'orishgacha: ", "До следующего бесплатного полива: ")} 
            <strong style={{ color: gt.acc, fontVariantNumeric: "tabular-nums" }}>{fTime(waterTimer)}</strong>
          </p>
          
          <div style={{ background: gt.surH, borderRadius: RADIUS.m, padding: SPACE.s3, border: "1px solid " + gt.bor, marginBottom: SPACE.s4, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ ...TYPE.caption, fontWeight: 700, color: gt.ink1 }}>{L("Sizdagi tomchilar:", "Ваши капли:")}</span>
              <span style={{ ...TYPE.subtitle, fontWeight: 800, color: "#38bdf8", display: "flex", alignItems: "center", gap: 4 }}>
                💧 {waterDrops}
              </span>
            </div>
            <p style={{ ...TYPE.caption, color: gt.ink3, margin: 0, fontSize: 11, lineHeight: 1.4 }}>
              {L("1 ta suv tomchisini ishlatib, taymerni chetlab o'tishni va o'simlikni hoziroq sug'orishni xohlaysizmi?", "Хотите потратить 1 каплю, чтобы обойти таймер и полить растение прямо сейчас?")}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
            <button className="ui-press" onClick={() => {
              const pid = showConfirmUseDropModal;
              setShowConfirmUseDropModal(null);
              handleWater(pid, true);
            }} disabled={waterDrops <= 0}
              style={{ padding: SPACE.s3, borderRadius: RADIUS.m, border: "none", background: waterDrops > 0 ? "linear-gradient(135deg, #38bdf8, #0ea5e9)" : "#334155", color: "#fff", ...TYPE.caption, fontWeight: 800, cursor: waterDrops > 0 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
              <span>💧</span> {L("Ha, 1 tomchi ishlatish", "Да, использовать 1 каплю")}
            </button>
            
            {waterDrops <= 0 && (
              <button className="ui-press" onClick={() => {
                setShowConfirmUseDropModal(null);
                setShowBuyDropsModal(true);
              }}
                style={{ padding: SPACE.s3, borderRadius: RADIUS.m, border: "1.5px solid #38bdf8", background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", ...TYPE.caption, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
                🛒 {L("Suv tomchilarini sotib olish", "Купить капли воды")}
              </button>
            )}

            <button className="ui-press" onClick={() => setShowConfirmUseDropModal(null)}
              style={{ padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.caption, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {L("Kutish", "Подождать")}
            </button>
          </div>
        </GModal>
      )}

      {/* ── Play Market Homiylik Reklamasi Simulyatori modali ── */}
      {showAdModal && (
        <GModal gt={gt} onClose={() => { if (!isWatchingAd) setShowAdModal(false); }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>
            <span style={{ fontSize: 44 }}>📱🎁</span>
          </div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 }}>
            📲 {L("Play Market Reklamasi", "Реклама Play Market")}
          </div>
          
          {!isWatchingAd ? (
            <>
              <p style={{ ...TYPE.caption, color: gt.ink2, lineHeight: 1.6, marginBottom: SPACE.s4, textAlign: "center" }}>
                {L("Tanganiz yetmadi! 5 soniyalik homiy reklamasini ko'rib, zudlik bilan +100 Tanga olishni xohlaysizmi?", "Недостаточно монет! Хотите посмотреть 5-секундный спонсорский ролик и получить +100 монет?")}
              </p>
              <div style={{ display: "flex", gap: SPACE.s2 + 2 }}>
                <button className="ui-press" onClick={() => setShowAdModal(false)}
                  style={{ flex: 1, padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {L("Yo'q", "Нет")}
                </button>
                <button className="ui-press" onClick={() => {
                  setIsWatchingAd(true);
                  setAdProgress(0);
                  setAdQuoteIndex(Math.floor(Math.random() * 3));
                  const interval = setInterval(() => {
                    setAdProgress(prev => {
                      if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(async () => {
                          const nextCoins = coins + 100;
                          setCoins(nextCoins);
                          setIsWatchingAd(false);
                          setShowAdModal(false);
                          spawnCoin(100, 50, 45);
                          showMsg(L("+100 tanga qo'shildi!", "+100 монет начислено!"), "gift");
                          await saveGarden(plots, nextCoins, undefined, undefined);
                        }, 500);
                        return 100;
                      }
                      return prev + 20;
                    });
                  }, 1000);
                }}
                  style={{ flex: 1.3, padding: SPACE.s3, borderRadius: RADIUS.m, border: "none", background: gt.goldGrad, color: gt.sur, ...TYPE.subtitle, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  {L("Ko'rish", "Смотреть")}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "10px 0" }}>
              <div style={{ ...TYPE.body, fontWeight: 700, color: gt.ink1, marginBottom: SPACE.s2 }}>
                {L("Homiylik reklamasi yuklanmoqda...", "Спонсорский ролик проигрывается...")}
              </div>
              <div style={{ width: "100%", height: 12, background: gt.surH, borderRadius: RADIUS.pill, overflow: "hidden", marginBottom: SPACE.s4 }}>
                <div style={{ height: "100%", width: `${adProgress}%`, background: "linear-gradient(90deg, #10b981, #059669)", transition: "width 1s linear" }} />
              </div>
              <p style={{ ...TYPE.caption, color: gt.ink3, textAlign: "center", italic: true, minHeight: 40 }}>
                {adQuoteIndex === 0 ? L("Farzandlarga moliyaviy bilimlarni o'rgatish kelajak muvaffaqiyati garovidir.", "Финансовая грамотность детей — залог их будущего успеха.") :
                 adQuoteIndex === 1 ? L("Homiylar ilovamiz bepul va xavfsiz qolishiga yordam berishadi. Rahmat!", "Спонсоры помогают приложению оставаться бесплатным и безопасным.") :
                 L("Tezroq o'sishi uchun o'simliklarni har kuni sug'orib turing.", "Регулярно поливайте сад Бараки, чтобы деревья росли быстрее.")}
              </p>
            </div>
          )}
        </GModal>
      )}

      {/* ── Uchastka ochish modali ── */}
      {showUnlock !== null && (
        <GModal gt={gt} onClose={() => setShowUnlock(null)}>
          <div style={{ width: SPACE.s16, height: SPACE.s16, margin: "0 auto " + SPACE.s3 + "px", borderRadius: RADIUS.full, background: gt.surH, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LockSVG size={32} tone={gt.ink3} />
          </div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 + 2 }}>{L("Yangi uchastka", "Новый участок")}</div>
          <div style={{ ...TYPE.caption, color: gt.ink2, marginBottom: SPACE.s1 }}>{L("Ochish narxi:", "Стоимость:")}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s2, marginBottom: SPACE.s1 + 2 }}>
            <CoinSVG size={28} />
            <span style={{ ...TYPE.hero, color: gt.gold, fontVariantNumeric: "tabular-nums" }}>{unlockPlot?.unlockCost.toLocaleString()}</span>
          </div>
          <div style={{ ...TYPE.caption, color: gt.ink3, marginBottom: SPACE.s4 + SPACE.s1 }}>{L("Sizda: " + coins.toLocaleString() + " tanga", "У вас: " + coins.toLocaleString())}</div>
          <div style={{ display: "flex", gap: SPACE.s2 + 2 }}>
            <button className="ui-press" onClick={() => setShowUnlock(null)}
              style={{ flex: 1, padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {L("Bekor", "Отмена")}
            </button>
            <button className="ui-press" onClick={() => handleUnlock(showUnlock)} disabled={!canAffordUnlock}
              style={{ flex: 1.3, padding: SPACE.s3, borderRadius: RADIUS.m, border: "none", background: canAffordUnlock ? gt.goldGrad : gt.surH, color: canAffordUnlock ? gt.sur : gt.ink3, ...TYPE.subtitle, fontWeight: 800, cursor: canAffordUnlock ? "pointer" : "not-allowed", boxShadow: canAffordUnlock ? SHADOW.e1(ART.sunLo) : "none", fontFamily: "inherit", opacity: canAffordUnlock ? 1 : OPACITY.disabled + 0.2 }}>
              {L("Ochish", "Открыть")}
            </button>
          </div>
        </GModal>
      )}

      {/* ── Ekish modali (Sopol, Oltin yoki Kamalak urug'lari) ── */}
      {showPlant !== null && (
        <GModal gt={gt} onClose={() => setShowPlant(null)}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}><SeedSVG size={48} /></div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 + 2 }}>{L("Ekish uchun urug'ni tanlang", "Выбор семени для посева")}</div>
          <p style={{ ...TYPE.caption, color: gt.ink3, marginBottom: SPACE.s3, textAlign: "center" }}>
            {L("Maysazorga qanday daraxt ekmoqchisiz?", "Какое дерево вы хотите посадить на лужайке?")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, maxHeight: 270, overflowY: "auto", paddingRight: 4, marginBottom: SPACE.s4 }}>
            {/* 1. Standart Urug' */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3, border: "1px solid " + gt.bor, borderRadius: RADIUS.m, background: gt.sur }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ ...TYPE.body, fontWeight: 800, color: gt.ink1 }}>🌱 {L("Oddiy Pomidor", "Обычный Помидор")}</span>
                <p style={{ ...TYPE.caption, color: gt.ink3, margin: "2px 0 0", fontSize: 11 }}>{L("Hosil: 1x Tanga va XP", "Урожай: 1x Монеты и Опыт")}</p>
              </div>
              <button className="ui-press" onClick={() => handlePlant(showPlant, "normal")}
                style={{ padding: "6px 12px", borderRadius: RADIUS.pill, border: "none", background: coins >= 100 ? gt.goldGrad : gt.surH, color: coins >= 100 ? gt.sur : gt.ink3, ...TYPE.caption, fontWeight: 800, cursor: "pointer" }}>
                100 🪙
              </button>
            </div>

            {/* 2. Oltin Urug' */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3, border: "1px solid #eab308", borderRadius: RADIUS.m, background: "rgba(234, 179, 8, 0.04)" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ ...TYPE.body, fontWeight: 800, color: "#ca8a04" }}>⭐ {L("Oltin Daraxt", "Золотое Дерево")}</span>
                <p style={{ ...TYPE.caption, color: gt.ink3, margin: "2px 0 0", fontSize: 11 }}>{L("Hosil: 2x Tanga va Kristallar!", "Урожай: 2x Больше монет и кристаллов!")}</p>
                {goldenSeeds > 0 && <p style={{ ...TYPE.caption, color: "#16a34a", fontWeight: 700, margin: "2px 0 0", fontSize: 10 }}>{L(`Sizda bor: ${goldenSeeds} dona bepul`, `У вас есть: ${goldenSeeds} шт. бесплатно`)}</p>}
              </div>
              <button className="ui-press" onClick={() => handlePlant(showPlant, "golden")}
                style={{ padding: "6px 12px", borderRadius: RADIUS.pill, border: "none", background: (energy >= 200 || goldenSeeds > 0) ? "linear-gradient(135deg, #fbbf24, #d97706)" : gt.surH, color: (energy >= 200 || goldenSeeds > 0) ? gt.sur : gt.ink3, ...TYPE.caption, fontWeight: 800, cursor: "pointer" }}>
                {goldenSeeds > 0 ? L("Ekish", "Посеять") : "200 ☀️"}
              </button>
            </div>

            {/* 3. Kamalak Urug'i */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3, border: "1px solid #a855f7", borderRadius: RADIUS.m, background: "rgba(168, 85, 247, 0.04)" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ ...TYPE.body, fontWeight: 800, color: "#9333ea" }}>🌈 {L("Kamalak Daraxti", "Радужное Дерево")}</span>
                <p style={{ ...TYPE.caption, color: gt.ink3, margin: "2px 0 0", fontSize: 11 }}>{L("Hosil: 5x afsonaviy o'lja!", "Урожай: 5x легендарных наград!")}</p>
                <p style={{ ...TYPE.caption, color: rainbowSeeds > 0 ? "#16a34a" : "#dc2626", fontWeight: 700, margin: "2px 0 0", fontSize: 10 }}>
                  {rainbowSeeds > 0 
                    ? L(`Zaxirada bor: ${rainbowSeeds} dona`, `В запасе: ${rainbowSeeds} шт.`) 
                    : L("Yulduzlar do'konidan olinadi", "Покупается в лавке звезд")}
                </p>
              </div>
              <button className="ui-press" onClick={() => handlePlant(showPlant, "rainbow")} disabled={rainbowSeeds <= 0}
                style={{ padding: "6px 12px", borderRadius: RADIUS.pill, border: "none", background: rainbowSeeds > 0 ? "linear-gradient(135deg, #a855f7, #7e22ce)" : gt.surH, color: rainbowSeeds > 0 ? gt.sur : gt.ink3, ...TYPE.caption, fontWeight: 800, cursor: rainbowSeeds > 0 ? "pointer" : "not-allowed" }}>
                {rainbowSeeds > 0 ? L("Ekish", "Посеять") : "0 🌈"}
              </button>
            </div>
          </div>

          <button className="ui-press" onClick={() => setShowPlant(null)}
            style={{ width: "100%", padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {L("Orqaga", "Назад")}
          </button>
        </GModal>
      )}

      {/* ── Bezash (Decorations) do'koni modali (Tabbed Shop & Inventory) ── */}
      {showDecorModal && (
        <GModal gt={gt} onClose={() => setShowDecorModal(false)}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s1 }}>
            <span style={{ fontSize: 38 }}>🎪✨</span>
          </div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s3 }}>
            {L("Baraka Bog'i bezaklari", "Украшения Сада Бараки")}
          </div>

          {/* Tab Selection */}
          <div style={{ display: "flex", background: gt.surH, borderRadius: RADIUS.pill, padding: 3, marginBottom: SPACE.s4 }}>
            <button className="ui-press" onClick={() => setDecorTab("shop")}
              style={{ flex: 1, padding: (SPACE.s2) + "px", border: "none", background: decorTab === "shop" ? gt.sur : "transparent", color: decorTab === "shop" ? gt.ink1 : gt.ink3, borderRadius: RADIUS.pill, ...TYPE.caption, fontWeight: 750, cursor: "pointer", fontFamily: "inherit" }}>
              🎪 {L("Do'kon", "Магазин")}
            </button>
            <button className="ui-press" onClick={() => setDecorTab("inventory")}
              style={{ flex: 1, padding: (SPACE.s2) + "px", border: "none", background: decorTab === "inventory" ? gt.sur : "transparent", color: decorTab === "inventory" ? gt.ink1 : gt.ink3, borderRadius: RADIUS.pill, ...TYPE.caption, fontWeight: 750, cursor: "pointer", fontFamily: "inherit" }}>
              🎒 {L("Xaltacham", "Мой инвентарь")}
            </button>
          </div>
          
          {/* Tanga / Inventory Counts header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s3, padding: "0 4px" }}>
            <div style={{ ...TYPE.caption, color: gt.ink3 }}>
              {decorTab === "shop" ? L("Sizdagi tangalar:", "Ваши монеты:") : L("Sotib olingan bezaklar:", "Купленные украшения:")}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1, background: gt.surH, borderRadius: RADIUS.pill, padding: "4px 10px" }}>
              <CoinSVG size={16} />
              <span style={{ ...TYPE.caption, fontWeight: 800, color: gt.gold }}>
                {coins.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: SPACE.s2, marginBottom: SPACE.s4, paddingRight: 4 }}>
            {decorTab === "shop" ? (
              DECORATION_ITEMS.map((item) => {
                const canAfford = coins >= item.cost;
                const ownedCount = purchasedDecorations.filter(id => id === item.id).length + placedDecorations.filter(d => d.itemId === item.id).length;
                
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3, background: gt.sur, border: "1px solid " + gt.bor, borderRadius: RADIUS.m }}>
                    <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, flex: 1, marginRight: SPACE.s2 }}>
                      <div style={{ width: 40, height: 40, borderRadius: RADIUS.s, background: item.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                        {item.emoji}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ ...TYPE.body, fontWeight: 700, color: gt.ink1 }}>{L(item.name, item.nameRu)}</div>
                        <div style={{ ...TYPE.caption, color: gt.ink3, fontSize: 11, marginTop: 1 }}>{L(item.desc, item.descRu)}</div>
                        {ownedCount > 0 && (
                          <div style={{ ...TYPE.caption, color: gt.gold, fontSize: 10, fontWeight: 700, marginTop: 2 }}>
                            {L(`Sizda bor: ${ownedCount} ta`, `У вас есть: ${ownedCount} шт.`)}
                          </div>
                        )}
                      </div>
                    </div>

                    <button className="ui-press" onClick={() => handleBuyDecoration(item)} disabled={!canAfford}
                      style={{ padding: (SPACE.s2) + "px " + SPACE.s3 + "px", borderRadius: RADIUS.pill, border: "none", background: canAfford ? gt.goldGrad : gt.surH, color: canAfford ? gt.sur : gt.ink3, ...TYPE.caption, fontWeight: 800, cursor: canAfford ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: canAfford ? 1 : 0.6, flexShrink: 0, minWidth: 64 }}>
                      {item.cost} 🪙
                    </button>
                  </div>
                );
              })
            ) : (
              purchasedDecorations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: gt.ink3, ...TYPE.caption }}>
                  🎒 {L("Xaltachangiz hozircha bo'sh. Do'kondan chiroyli narsalar sotib oling!", "В инвентаре пока пусто. Купите украшения в магазине!")}
                </div>
              ) : (
                // Group inventory items by type to avoid duplicating same line
                Object.entries(
                  purchasedDecorations.reduce((acc, id) => {
                    acc[id] = (acc[id] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([id, count]) => {
                  const item = DECORATION_ITEMS.find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3, background: gt.sur, border: "1px solid " + gt.bor, borderRadius: RADIUS.m }}>
                      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 }}>
                        <div style={{ width: 40, height: 40, borderRadius: RADIUS.s, background: item.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                          {item.emoji}
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ ...TYPE.body, fontWeight: 700, color: gt.ink1 }}>{L(item.name, item.nameRu)}</div>
                          <div style={{ ...TYPE.caption, color: gt.ink3, fontWeight: 600 }}>
                            {L(`Zaxirada: ${count} ta`, `В запасе: ${count} шт.`)}
                          </div>
                        </div>
                      </div>

                      <button className="ui-press" onClick={() => {
                        setShowDecorModal(false);
                        setPlacingItem(item);
                        setTempCoord({ x: 50, y: 50 }); // Start placement mode in center of screen
                      }}
                        style={{ padding: SPACE.s2 + "px " + SPACE.s4 + "px", borderRadius: RADIUS.pill, border: "none", background: gt.accGrad, color: gt.sur, ...TYPE.caption, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                        {L("Joylashtirish", "Установить")}
                      </button>
                    </div>
                  );
                })
              )
            )}
          </div>

          <button className="ui-press" onClick={() => setShowDecorModal(false)}
            style={{ width: "100%", padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {L("Yopish", "Закрыть")}
          </button>
        </GModal>
      )}

      {/* ── 1. Omad G'ildiragi (Lucky Spin) Modali ── */}
      {showSpinModal && (
        <GModal gt={gt} onClose={() => { if (!isSpinning) setShowSpinModal(false); }}>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 }}>🎡 {L("Omad G'ildiragi", "Колесо Удачи")}</div>
          <p style={{ ...TYPE.caption, color: gt.ink3, marginBottom: SPACE.s4, textAlign: "center" }}>
            {L("Har safar aylantirish 500 Quyosh. Ajoyib mukofotlarni qo'lga kiriting!", "Прокрутка стоит 500 Солнца. Испытайте вашу удачу!")}
          </p>

          {/* Wheel visual container */}
          <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto " + SPACE.s4 + "px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{
              transform: `rotate(${spinAngle}deg)`,
              transition: isSpinning ? "transform 4.5s cubic-bezier(0.1, 0.8, 0.1, 1)" : "none",
              filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
            }}>
              <defs>
                {/* Beautiful gradients for slices */}
                <linearGradient id="slice0" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#ca8a04" /></linearGradient>
                <linearGradient id="slice1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" /></linearGradient>
                <linearGradient id="slice2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#047857" /></linearGradient>
                <linearGradient id="slice3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#be185d" /></linearGradient>
                <linearGradient id="slice4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#be123c" /></linearGradient>
                <linearGradient id="slice5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#6d28d9" /></linearGradient>
                {/* Golden rim gradient */}
                <linearGradient id="wheelRim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
              </defs>

              {/* Wheel outer gold border and inner plate */}
              <circle cx="100" cy="100" r="98" fill="url(#wheelRim)" />
              <circle cx="100" cy="100" r="91" fill="#1e293b" />

              {/* Render the slices */}
              {PRIZES.map((prize, i) => (
                <g key={i} transform={`rotate(${i * 60}, 100, 100)`}>
                  {/* Slice shape (from -30 to +30 degrees) */}
                  <path d="M 100 100 L 55 22.06 A 90 90 0 0 1 145 22.06 Z" fill={`url(#slice${i})`} stroke="#1e293b" strokeWidth="2.5" />
                  {/* Icon and label */}
                  <g transform="translate(100, 48)">
                    <text textAnchor="middle" fontSize="22" dy="-5" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                      {prize.icon}
                    </text>
                    <text textAnchor="middle" fontSize="8" fontWeight="900" fill="#ffffff" dy="16" letterSpacing="0.4" style={{ fontFamily: "inherit" }}>
                      {L(prize.labelShort, prize.labelShortRu || prize.labelShort)}
                    </text>
                  </g>
                </g>
              ))}

              {/* Blinking light bulbs on rim */}
              {Array.from({ length: 12 }).map((_, idx) => {
                const angleRad = (idx * 30 * Math.PI) / 180;
                const bx = 100 + 94.5 * Math.sin(angleRad);
                const by = 100 - 94.5 * Math.cos(angleRad);
                return (
                  <circle key={idx} cx={bx} cy={by} r="2.8" fill="#ffffff" stroke="#ca8a04" strokeWidth="0.5" style={{
                    animation: `gdTwinkle ${0.5 + (idx % 2) * 0.4}s ease-in-out infinite`,
                    filter: "drop-shadow(0 0 2px #fff)"
                  }} />
                );
              })}

              {/* Core golden hub */}
              <circle cx="100" cy="100" r="18" fill="url(#wheelRim)" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="12" fill="#1e293b" />
              <circle cx="100" cy="100" r="4" fill="#ffffff" />
            </svg>
            
            {/* Center Pin Indicator (Golden frame needle at the top center) */}
            <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "20px solid #ef4444", zIndex: 52, filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.4))" }} />
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "14px solid #facc15", zIndex: 53 }} />
          </div>

          {/* Results screen */}
          {spinResult && (
            <div style={{ background: gt.surH, borderRadius: RADIUS.m, padding: SPACE.s3, marginBottom: SPACE.s4 }}>
              <div style={{ ...TYPE.caption, color: gt.ink3 }}>{L("Tabriklaymiz! Siz yutdingiz:", "Поздравляем! Вы выиграли:")}</div>
              <div style={{ ...TYPE.body, fontWeight: 800, color: gt.ink1, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ fontSize: 20 }}>{spinResult.icon}</span> {L(spinResult.label, spinResult.labelRu)}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: SPACE.s2 }}>
            {!isSpinning && (
              <button className="ui-press" onClick={() => setShowSpinModal(false)}
                style={{ flex: 1, padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer" }}>
                {L("Yopish", "Закрыть")}
              </button>
            )}
            <button className="ui-press" onClick={handleSpin} disabled={isSpinning || energy < 500}
              style={{ flex: 1.5, padding: SPACE.s3, borderRadius: RADIUS.m, border: "none", background: energy >= 500 ? "linear-gradient(135deg, #fbbf24, #d97706)" : gt.surH, color: energy >= 500 ? gt.sur : gt.ink3, ...TYPE.subtitle, fontWeight: 800, cursor: isSpinning ? "not-allowed" : "pointer" }}>
              {isSpinning ? L("Aylanmoqda...", "Крутится...") : "500 ☀️ " + L("Spin", "Крутить")}
            </button>
          </div>
        </GModal>
      )}

      {/* ── 2. AI Moliyaviy Maslahatchi Modali ── */}
      {showAiAdvisorModal && (
        <GModal gt={gt} onClose={() => setShowAiAdvisorModal(false)}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>
            <span style={{ fontSize: 44 }}>🔮✨</span>
          </div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 }}>🔮 {L("AI Moliyaviy Maslahatchi", "ИИ Финансовый Советник")}</div>
          <p style={{ ...TYPE.caption, color: gt.ink3, marginBottom: SPACE.s4, textAlign: "center" }}>
            {L("Har kuni 1-maslahat bepul! Keyingi maslahat 20 Quyosh.", "Каждый день 1-й совет бесплатно! Далее по 20 Солнца.")}
          </p>

          <div style={{ background: gt.surH, borderRadius: RADIUS.m, padding: SPACE.s4, minHeight: 110, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: SPACE.s4 }}>
            {loadingAdvice ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <span className="ui-spin" style={{ fontSize: 32 }}>🌀</span>
                <span style={{ ...TYPE.caption, color: gt.ink3 }}>{L("Miyangiz tahlil qilinmoqda...", "Анализ бюджета...")}</span>
              </div>
            ) : (
              <p style={{ ...TYPE.body, color: gt.ink1, margin: 0, textAlign: "left", lineHeight: 1.6, fontStyle: "italic" }}>
                {aiAdvice || L("Tugmani bosib bepul maslahat oling!", "Нажмите кнопку, чтобы получить финансовый совет!")}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: SPACE.s2 }}>
            <button className="ui-press" onClick={() => setShowAiAdvisorModal(false)}
              style={{ flex: 1, padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer" }}>
              {L("Yopish", "Закрыть")}
            </button>
            <button className="ui-press" onClick={handleGetAiAdvice} disabled={loadingAdvice || (energy < 20 && Date.now() - lastAiAdviceAt <= 24 * 60 * 60 * 1000)}
              style={{ flex: 1.5, padding: SPACE.s3, borderRadius: RADIUS.m, border: "none", background: "linear-gradient(135deg, #a855f7, #6b21a8)", color: "#fff", ...TYPE.subtitle, fontWeight: 800, cursor: "pointer" }}>
              {Date.now() - lastAiAdviceAt > 24 * 60 * 60 * 1000 ? L("Bepul maslahat", "Бесплатно") : "20 ☀️ " + L("Maslahat", "Получить")}
            </button>
          </div>
        </GModal>
      )}

      {/* ── 3. Prestij va Konvertatsiya (Quyosh -> Baraka yulduzlari) Modali ── */}
      {showPrestigeModal && (
        <GModal gt={gt} onClose={() => setShowPrestigeModal(false)}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}><span style={{ fontSize: 48 }}>👑⭐</span></div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 }}>👑 {L("Baraka Prestij Do'koni", "Лавка Престижа Бараки")}</div>
          <p style={{ ...TYPE.caption, color: gt.ink3, marginBottom: SPACE.s4, textAlign: "center" }}>
            {L("1000 Quyoshni 1 ta yulduzga ⭐ almashtiring va afsonaviy bezaklarni qo'lga kiriting!", "Обменяйте 1000 Солнца на 1 звезду ⭐ для покупки легендарных построек!")}
          </p>

          <div style={{ background: gt.surH, borderRadius: RADIUS.m, padding: SPACE.s3, marginBottom: SPACE.s4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ ...TYPE.body, fontWeight: 800, color: gt.ink1 }}>{L("Kamalak Urug'i", "Радужное семя")}</div>
              <p style={{ ...TYPE.caption, color: gt.ink3, margin: "2px 0 0", fontSize: 11 }}>{L("Ekish uchun 1 ta kamalak urug'i", "1 семя радужного дерева")}</p>
              {rainbowSeeds > 0 && <p style={{ ...TYPE.caption, color: "#16a34a", fontWeight: 700, margin: "2px 0 0", fontSize: 10 }}>{L(`Sizda bor: ${rainbowSeeds} ta`, `У вас есть: ${rainbowSeeds} шт.`)}</p>}
            </div>
            <button className="ui-press" onClick={async () => {
              if (barakaStarsCount < 1) {
                showMsg(L("Sizga kamida 1 yulduz kerak!", "Нужна минимум 1 звезда!"), "gift");
                return;
              }
              const nextStars = barakaStarsCount - 1;
              const nextSeeds = rainbowSeeds + 1;
              setBarakaStarsCount(nextStars);
              setRainbowSeeds(nextSeeds);
              spawnCoin(1, 50, 45, "seed");
              showMsg(L("Kamalak urug'i xarid qilindi!", "Радужное семя куплено!"), "bloom");
              await saveGarden(plots, undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
                barakaStarsCount: nextStars,
                rainbowSeeds: nextSeeds
              });
            }} disabled={barakaStarsCount < 1}
              style={{ padding: "6px 12px", borderRadius: RADIUS.pill, border: "none", background: barakaStarsCount >= 1 ? "linear-gradient(135deg, #a855f7, #7e22ce)" : gt.surH, color: barakaStarsCount >= 1 ? gt.sur : gt.ink3, ...TYPE.caption, fontWeight: 800, cursor: barakaStarsCount >= 1 ? "pointer" : "not-allowed" }}>
              1 ⭐
            </button>
          </div>

          <div style={{ display: "flex", gap: SPACE.s2 }}>
            <button className="ui-press" onClick={() => setShowPrestigeModal(false)}
              style={{ flex: 1, padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer" }}>
              {L("Orqaga", "Назад")}
            </button>
            <button className="ui-press" onClick={handleConvertSunsToBaraka} disabled={energy < 1000}
              style={{ flex: 1.5, padding: SPACE.s3, borderRadius: RADIUS.m, border: "none", background: energy >= 1000 ? gt.goldGrad : gt.surH, color: energy >= 1000 ? gt.sur : gt.ink3, ...TYPE.subtitle, fontWeight: 800, cursor: "pointer" }}>
              {L("1000 ☀️ -> 1 ⭐", "1000 ☀️ -> 1 ⭐")}
            </button>
          </div>
        </GModal>
      )}

      {/* ── 4. Suv tomchisi xarid qilish modali (Feature #2) ── */}
      {showBuyDropsModal && (
        <GModal gt={gt} onClose={() => setShowBuyDropsModal(false)}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}><span style={{ fontSize: 44 }}>🌧️💧</span></div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s1 }}>🌧️ {L("Tezkor sug'orish dori-darmoni", "Быстрый полив каплями")}</div>
          <p style={{ ...TYPE.caption, color: gt.ink3, marginBottom: SPACE.s4, textAlign: "center" }}>
            {L("Suv tomchisi (Energiya) evaziga 2 soatlik sug'orish taymerini zudlik bilan chetlab o'ting!", "Покупайте капли воды, чтобы мгновенно поливать без ожидания!")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
            {/* Package A: 100 Suns = 20 drops */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3, border: "1px solid " + gt.bor, borderRadius: RADIUS.m, background: gt.sur }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ ...TYPE.body, fontWeight: 800, color: gt.ink1 }}>💧 {L("Kichik Paket", "Малый пакет")}</span>
                <p style={{ ...TYPE.caption, color: gt.ink3, margin: "2px 0 0", fontSize: 11 }}>{L("+20 tezkor suv tomchilari", "+20 быстрых капель воды")}</p>
              </div>
              <button className="ui-press" onClick={() => handleBuyWaterDrops(100, 20)}
                style={{ padding: "6px 12px", borderRadius: RADIUS.pill, border: "none", background: energy >= 100 ? gt.goldGrad : gt.surH, color: energy >= 100 ? gt.sur : gt.ink3, ...TYPE.caption, fontWeight: 800, cursor: "pointer" }}>
                100 ☀️
              </button>
            </div>

            {/* Package B: 300 Suns = 100 drops */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: SPACE.s3, border: "1px solid #10b981", borderRadius: RADIUS.m, background: "rgba(16, 185, 129, 0.04)" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ ...TYPE.body, fontWeight: 800, color: "#059669" }}>🌊 {L("Megapaket", "Мегапакет")}</span>
                <p style={{ ...TYPE.caption, color: gt.ink3, margin: "2px 0 0", fontSize: 11 }}>{L("+100 tezkor suv tomchilari", "+100 быстрых капель воды")}</p>
              </div>
              <button className="ui-press" onClick={() => handleBuyWaterDrops(300, 100)}
                style={{ padding: "6px 12px", borderRadius: RADIUS.pill, border: "none", background: energy >= 300 ? "linear-gradient(135deg, #10b981, #059669)" : gt.surH, color: energy >= 300 ? gt.sur : gt.ink3, ...TYPE.caption, fontWeight: 800, cursor: "pointer" }}>
                300 ☀️
              </button>
            </div>
          </div>

          <button className="ui-press" onClick={() => setShowBuyDropsModal(false)}
            style={{ width: "100%", padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {L("Orqaga", "Назад")}
          </button>
        </GModal>
      )}
    </div>
  );
}
