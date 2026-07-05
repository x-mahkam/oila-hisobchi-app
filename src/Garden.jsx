import { useState, useEffect, useRef, useMemo, memo } from "react";
import { db } from "./firebase.js";
import { RADIUS, SPACE, TYPE, SHADOW, MOTION, OPACITY, COMP, Z } from "./utils/tokens.js";
import { injectUiCss } from "./components/ui/motion.js";
import { gardenTheme, skyMode, SKY_GRAD, ART } from "./garden/gardenTokens.js";
import {
  PLOTS, STAGES, WATER_COOLDOWN, HARVEST_COINS, SUN_CYCLE, SPEEDUP_COST, SUN_ENERGY, SUN_POS,
} from "./garden/constants.js";
import {
  GardenDefs, SunSprite, Cloud, CoinSVG, GemSVG, LockSVG, GiftSVG, SeedSVG,
  DropSVG, BoltSVG, LeafSVG, RocketSVG, BloomSVG, MapSVG, PlantSVG,
} from "./garden/sprites.jsx";
import { GardenScene } from "./garden/GardenScene.jsx";
import {
  GSection, GCard, GProgress, LevelGauge, StatPill, TodayRow, GChip,
  PlantCard, AchievementCard, RewardRow, TipCard, GardenEmpty,
} from "./garden/cards.jsx";

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
@media (prefers-reduced-motion:reduce){
  [style*="gdSway"],[style*="gdDrift"],[style*="gdSunPulse"],[style*="gdSunGlow"],
  [style*="gdShimmer"],[style*="gdBounce"],[style*="gdRay"],[style*="gdBird"],
  [style*="gdTwinkle"],[style*="gdCoinFly"],[style*="gdDrop"],[style*="gdRipple"],
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
export default function Garden({ user, lg = "uz", onBack, dark, addCoin }) {
  const oilaId = user?.oilaId;
  const L = (uz, ru = uz) => (lg === "ru" ? ru : uz);
  const gt = gardenTheme(dark);
  injectUiCss();
  injectGardenCss();

  // ── Holat (o'zgarmagan) ──
  const [coins, setCoins]           = useState(0);
  const [energy, setEnergy]         = useState(0);
  const [crystals, setCrystals]     = useState(0);
  const [plots, setPlots]           = useState(PLOTS.map(p => ({ ...p, stage: -1, waterCount: 0, lastWateredAt: 0, lastSunAt: 0, harvestReady: false })));
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

  // ── Firebase yuklash (o'zgarmagan) ──
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

  const saveGarden = async (newPlots, newCoins, newEnergy, newCrystals, lastWatered) => {
    if (!oilaId) return;
    if (lastWatered !== undefined) lastWateredRef.current = lastWatered;
    try {
      await db.s("baraka_garden_" + oilaId, { plots: newPlots, lastWatered: lastWateredRef.current || null, updatedAt: Date.now() });
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

  // ── Sug'orish (logika o'zgarmagan, matnlar emoji-siz) ──
  const handleWater = async (plotId) => {
    if (!waterReady) return;
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.stage < 0) { showMsg(L("Avval urug' eking", "Сначала посейте семя"), "seed"); return; }

    setWaterAnim(true);
    setTimeout(() => setWaterAnim(false), 1200);

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
      showMsg(L("Bog' sug'orildi! +5 Energiya", "Полито! +5 Энергии"), "drop");
    }

    const newEnergy = energy + 5;
    setEnergy(newEnergy);
    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, waterCount: resetWater ? 0 : newWaterCount, stage: newStage, lastWateredAt: nowT, harvestReady }
      : p);
    setPlots(newPlots);
    setWaterReady(false);
    setWaterTimer(WATER_COOLDOWN);
    spawnCoin(5, 78, 72, "bolt");
    await saveGarden(newPlots, undefined, newEnergy, undefined, nowT);
  };

  // ── Hosil yig'ish (o'zgarmagan) ──
  const handleHarvest = async (plotId) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.harvestReady) return;
    const earned = HARVEST_COINS[Math.min(plot.stage, HARVEST_COINS.length - 1)];
    const newCoins = coins + earned;
    const newCrystals = crystals + 1;
    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, stage: 0, waterCount: 0, harvestReady: false, lastSunAt: Date.now() }
      : p);
    setCoins(newCoins);
    setCrystals(newCrystals);
    setPlots(newPlots);
    spawnCoin(earned, 50, 50);
    showMsg(L("Hosil yig'ildi! +" + earned + " tanga, +1 kristal", "Урожай! +" + earned + " монет, +1 кристалл"), "gift");
    await saveGarden(newPlots, newCoins, undefined, newCrystals);
  };

  // ── Uchastka ochish (o'zgarmagan) ──
  const handleUnlock = async (plotId) => {
    const plot = PLOTS.find(p => p.id === plotId);
    if (!plot) return;
    if (coins < plot.unlockCost) {
      showMsg(L("Yetarli tanga yo'q! " + plot.unlockCost + " kerak", "Мало монет! Нужно " + plot.unlockCost), "coin");
      setShowUnlock(null);
      return;
    }
    const newCoins = coins - plot.unlockCost;
    const newPlots = plots.map(p => p.id === plotId ? { ...p, stage: -1, unlocked: true } : p);
    setCoins(newCoins);
    setPlots(newPlots);
    setShowUnlock(null);
    showMsg(L("Yangi uchastka ochildi!", "Новый участок открыт!"), "bloom");
    await saveGarden(newPlots, newCoins, undefined, undefined);
  };

  // ── Ekish (o'zgarmagan) ──
  const handlePlant = async (plotId) => {
    setShowPlant(null);
    for (let step = 1; step <= 4; step++) {
      setDigAnim({ plotId, step });
      await new Promise(r => setTimeout(r, 380));
    }
    setDigAnim(null);
    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, stage: 0, waterCount: 0, harvestReady: false, lastSunAt: Date.now() }
      : p);
    setPlots(newPlots);
    setSelected(plotId);
    showMsg(L("Urug' ekildi! Sug'orishni boshlang", "Семя посажено!"), "seed");
    await saveGarden(newPlots, undefined, undefined, undefined);
  };

  // ── Kunlik sovg'a (o'zgarmagan) ──
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

  // ── Quyosh yig'ish (o'zgarmagan) ──
  const collectSun = async (plotId) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.stage < 0) return;
    if (Date.now() - (plot.lastSunAt || 0) < SUN_CYCLE) return;
    const newEnergy = energy + SUN_ENERGY;
    const newPlots = plots.map(p => p.id === plotId ? { ...p, lastSunAt: Date.now() } : p);
    setEnergy(newEnergy);
    setPlots(newPlots);
    const pos = SUN_POS[plotId] || SUN_POS[0];
    spawnCoin(SUN_ENERGY, pos.x, 30, "sun");
    showMsg(L("+" + SUN_ENERGY + " Baraka Energiya!", "+" + SUN_ENERGY + " Энергии!"), "sun");
    await saveGarden(newPlots, undefined, newEnergy, undefined);
  };

  // ── Tezlashtirish (o'zgarmagan) ──
  const handleSpeedUp = async () => {
    if (waterReady) return;
    if (coins < SPEEDUP_COST) { showMsg(L(SPEEDUP_COST + " tanga kerak", "Нужно " + SPEEDUP_COST + " монет"), "coin"); return; }
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

  // ── Uchastka bosilganda (o'zgarmagan) ──
  const onPlotTap = (plot) => {
    const isUnlocked = plot.id === 0 || plot.unlocked || plot.stage >= 0;
    if (!isUnlocked) { setShowUnlock(plot.id); return; }
    if (plot.stage < 0) { setShowPlant(plot.id); return; }
    setSelected(plot.id);
    if (plot.harvestReady) handleHarvest(plot.id);
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
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: Z.nav, background: gt.bg, overflowY: "auto", WebkitOverflowScrolling: "touch", fontFamily: "inherit" }}>
      <GardenDefs />
      <div style={{ maxWidth: COMP.pageMax, margin: "0 auto", padding: "0 " + (SPACE.s4 + SPACE.s1) + "px calc(" + SPACE.s8 + "px + env(safe-area-inset-bottom))" }}>

        {/* ── HERO: osmon sarlavhasi ── */}
        <div className="ui-fadeUp" style={{ position: "relative", margin: "0 -" + (SPACE.s4 + SPACE.s1) + "px", padding: "calc(" + SPACE.s3 + "px + env(safe-area-inset-top)) " + (SPACE.s4 + SPACE.s1) + "px " + SPACE.s6 + "px", background: SKY_GRAD[mode], borderRadius: "0 0 " + RADIUS.l + "px " + RADIUS.l + "px", overflow: "hidden", marginBottom: SPACE.s4 }}>
          <div style={{ position: "absolute", right: "8%", top: "16%", animation: "gdDrift 80s ease-in-out infinite", pointerEvents: "none" }}><Cloud w={84} o={0.9} /></div>
          <div style={{ position: "absolute", right: "36%", top: "58%", animation: "gdDrift 60s ease-in-out infinite reverse", pointerEvents: "none" }}><Cloud w={48} o={0.7} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, position: "relative" }}>
            <button className="ui-press" onClick={onBack} aria-label={L("Orqaga", "Назад")}
              style={{ width: COMP.touchMin - SPACE.s1, height: COMP.touchMin - SPACE.s1, flexShrink: 0, borderRadius: RADIUS.full, border: "1.5px solid " + gt.glassBorder, background: gt.skyScrim, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke={gt.onSky} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...TYPE.title, color: gt.onSky, textShadow: "0 2px 10px " + gt.skyScrim }}>{L("Baraka Bog'i", "Сад Бараки")}</div>
              <div style={{ ...TYPE.caption, color: gt.onSky, opacity: OPACITY.hint + 0.15, marginTop: 1 }}>
                {mode === "night" ? L("Bog' tinch uyquda", "Сад мирно спит")
                  : mode === "evening" ? L("Oqshom bog'i", "Вечерний сад")
                  : L("Oilangiz bilan birga o'stiring", "Растите вместе с семьёй")}
              </div>
            </div>
            <button className="ui-press" onClick={handleDailyGift} aria-label={L("Kunlik sovg'a", "Ежедневный бонус")}
              style={{ width: COMP.touchMin, height: COMP.touchMin, flexShrink: 0, borderRadius: RADIUS.full, border: "none", background: gt.skyScrim, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: dailyDone ? OPACITY.disabled + 0.15 : 1, animation: dailyDone ? "none" : "gdBounce 1.6s ease-in-out infinite" }}>
              <GiftSVG size={24} />
            </button>
          </div>
        </div>

        {/* ── OVERVIEW: Daraja (yarim doira) + XP + boyliklar ── */}
        <GCard gt={gt} style={{ paddingTop: SPACE.s6 }}>
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

        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatPill gt={gt} kind="coin" value={coins} label={L("Tanga", "Монеты")} />
          <StatPill gt={gt} kind="bolt" value={energy} label={L("Energiya", "Энергия")} />
          <StatPill gt={gt} kind="gem" value={crystals} label={L("Kristall", "Кристаллы")} />
        </div>

        {/* ── BUGUNGI JARAYON ── */}
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

        {/* ── ASOSIY BOG' ── */}
        <GSection gt={gt}>{L("Bog'ingiz", "Ваш сад")}</GSection>
        <div className="ui-fadeUp" style={{ marginBottom: SPACE.s3 }}>
          <GardenScene
            gt={gt} mode={mode} L={L}
            plots={plots} selected={selected} coins={coins}
            now={now} fTime={fTime}
            waterReady={waterReady} waterTimer={waterTimer}
            digAnim={digAnim} growAnim={growAnim} waterAnim={waterAnim}
            sunNote={sunNote} flyRewards={flyCoins} sunCycle={SUN_CYCLE}
            onPlotTap={onPlotTap} onSunTap={onSunTap}
            onSpeedUp={handleSpeedUp}
            onAction={() => {
              if (selStage < 0) { setShowPlant(selected); return; }
              if (selPlot?.harvestReady) { handleHarvest(selected); return; }
              handleWater(selected);
            }} />
        </div>

        {/* ── O'SIMLIKLAR ── */}
        <GSection gt={gt}>{L("O'simliklar", "Растения")}</GSection>
        {!anyPlanted && <GardenEmpty gt={gt} L={L} onPlant={() => setShowPlant(0)} />}
        {plots.map(plot => (
          <PlantCard key={plot.id} gt={gt} L={L} plot={plot}
            cost={PLOTS.find(p => p.id === plot.id)?.unlockCost}
            selected={selected === plot.id && plot.stage >= 0}
            onClick={() => onPlotTap(plot)} />
        ))}

        {/* ── MUKOFOTLAR ── */}
        <GSection gt={gt}>{L("Tanga topish yo'llari", "Как получить монеты")}</GSection>
        <GCard gt={gt} pad={SPACE.s1 + "px " + SPACE.s4 + "px"}>
          {rewards.map((r, i) => (
            <RewardRow key={i} gt={gt} icon={r.icon} label={r.label} amount={r.amount} kind={r.kind} negative={r.negative} last={i === rewards.length - 1} />
          ))}
        </GCard>

        {/* ── YUTUQLAR ── */}
        <GSection gt={gt} right={<span style={{ ...TYPE.caption, fontWeight: 700, color: gt.acc, fontVariantNumeric: "tabular-nums" }}>{achievements.filter(a => a.ok).length}/{achievements.length}</span>}>
          {L("Yutuqlar", "Достижения")}
        </GSection>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2 + 2, marginBottom: SPACE.s3 }}>
          {achievements.map((a, i) => (
            <AchievementCard key={i} gt={gt} L={L} icon={a.icon} title={a.title} desc={a.desc} reward={a.reward} unlocked={a.ok} />
          ))}
        </div>

        {/* ── TARIX ── */}
        <GSection gt={gt}>{L("So'nggi faoliyat", "Последняя активность")}</GSection>
        <GCard gt={gt} pad={SPACE.s2 + "px " + SPACE.s4 + "px"}>
          {history.length === 0 && (
            <div style={{ ...TYPE.caption, color: gt.ink3, textAlign: "center", padding: SPACE.s4 + "px 0" }}>
              {L("Bog'da hali faoliyat yo'q — sug'orishdan boshlang", "Активности пока нет — начните с полива")}
            </div>
          )}
          {history.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, padding: (SPACE.s2 + 1) + "px 0", borderBottom: i === history.length - 1 ? "none" : "1px solid " + gt.bor }}>
              <div style={{ width: 32, height: 32, borderRadius: RADIUS.s, background: gt.surH, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{h.icon}</div>
              <span style={{ flex: 1, ...TYPE.body, color: gt.ink1 }}>{h.label}</span>
              <span style={{ ...TYPE.caption, color: gt.ink3 }}>{h.today ? L("Bugun", "Сегодня") : ago(h.t, lg)}</span>
            </div>
          ))}
        </GCard>

        {/* ── MASLAHATLAR ── */}
        <GSection gt={gt}>{L("Maslahatlar", "Советы")}</GSection>
        <TipCard gt={gt} title={L("Kunlik ritual", "Ежедневный ритуал")}>
          {L("Har kuni bir marta sug'oring — daraxt 3 ta suvdan keyin yangi bosqichga o'tadi. Taymerni 100 tanga evaziga 30 daqiqaga tezlatish mumkin.", "Поливайте раз в день — дерево растёт после нескольких поливов. Таймер можно ускорить за 100 монет.")}
        </TipCard>
        <TipCard gt={gt} title={L("Quyoshlarni boy bermang", "Не упускайте солнца")}>
          {L("Har bir ekilgan o'simlik 3 soatda bitta quyosh chiqaradi — pishganda bosib +15 energiya oling.", "Каждое растение даёт солнце раз в 3 часа — собирайте по +15 энергии.")}
        </TipCard>
        <TipCard gt={gt} title={L("Oila bilan tezroq", "Быстрее всей семьёй")}>
          {L("Xarajat va daromadlarni yozib boring — har bir moliyaviy amal bog'ga tanga olib keladi.", "Записывайте расходы и доходы — каждое действие приносит монеты саду.")}
        </TipCard>

      </div>

      {/* ── Toast ── */}
      {msg && (
        <div style={{ position: "fixed", top: "calc(" + SPACE.s16 + "px + env(safe-area-inset-top))", left: "50%", background: gt.sceneScrim, color: gt.onSky, borderRadius: RADIUS.pill, padding: (SPACE.s2 + 1) + "px " + (SPACE.s4 + SPACE.s1) + "px", ...TYPE.body, fontWeight: 700, zIndex: Z.toast, whiteSpace: "nowrap", animation: "gdMsg " + (msg.dur || 3000) / 1000 + "s ease forwards", boxShadow: SHADOW.e2, display: "flex", alignItems: "center", gap: SPACE.s2 }}>
          {MSG_ICONS[msg.icon] || MSG_ICONS.leaf} {msg.text}
        </div>
      )}

      {/* ── Uchastka ochish modali ── */}
      {showUnlock !== null && (
        <GModal gt={gt} onClose={() => setShowUnlock(null)}>
          <div style={{ width: 64, height: 64, margin: "0 auto " + SPACE.s3 + "px", borderRadius: RADIUS.full, background: gt.surH, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

      {/* ── Ekish modali ── */}
      {showPlant !== null && (
        <GModal gt={gt} onClose={() => setShowPlant(null)}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}><SeedSVG size={52} /></div>
          <div style={{ ...TYPE.heading, color: gt.ink1, marginBottom: SPACE.s2 }}>{L("Baraka urug'ini ekish", "Посеять семя Бараки")}</div>
          <div style={{ ...TYPE.caption, color: gt.ink2, lineHeight: 1.7, marginBottom: SPACE.s4 + SPACE.s1 }}>
            {L("Urug' ekib, muntazam sug'oring. Har bir moliyaviy amal daraxtingizni o'stiradi. Baraka daraxti bo'lganda katta mukofot!", "Посейте семя и регулярно поливайте. Каждое финансовое действие растит ваше дерево!")}
          </div>
          <div style={{ display: "flex", gap: SPACE.s2 + 2 }}>
            <button className="ui-press" onClick={() => setShowPlant(null)}
              style={{ flex: 1, padding: SPACE.s3, borderRadius: RADIUS.m, border: "1px solid " + gt.bor, background: "transparent", color: gt.ink2, ...TYPE.subtitle, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {L("Bekor", "Отмена")}
            </button>
            <button className="ui-press" onClick={() => handlePlant(showPlant)}
              style={{ flex: 1.3, padding: SPACE.s3, borderRadius: RADIUS.m, border: "none", background: gt.accGrad, color: gt.sur, ...TYPE.subtitle, fontWeight: 800, cursor: "pointer", boxShadow: SHADOW.e1(ART.leafLo), fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s2 }}>
              <SeedSVG size={20} />
              {L("Ekish", "Посеять")}
            </button>
          </div>
        </GModal>
      )}
    </div>
  );
}
