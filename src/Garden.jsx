import { useState, useEffect, useRef } from "react";
import { db } from "./firebase.js";
import { td, nt, f } from "./utils/formatters.js";

// ═══════════════════════════════════════════════════════════
//  BARAKA BOG'I — To'liq Gamification Moduli
// ═══════════════════════════════════════════════════════════

const PLOTS = [
  { id: 0, unlockCost: 0 },
  { id: 1, unlockCost: 500 },
  { id: 2, unlockCost: 1500 },
  { id: 3, unlockCost: 5000 },
  { id: 4, unlockCost: 10000 },
];

const STAGES = [
  { id: 0, name: "Urug'",         nameRu: "Семя",          emoji: "🌰", waterNeeded: 3  },
  { id: 1, name: "Nihol",          nameRu: "Росток",        emoji: "🌱", waterNeeded: 5  },
  { id: 2, name: "Yosh daraxt",    nameRu: "Деревце",       emoji: "🌿", waterNeeded: 8  },
  { id: 3, name: "Katta daraxt",   nameRu: "Дерево",        emoji: "🌲", waterNeeded: 12 },
  { id: 4, name: "Gullagan daraxt",nameRu: "Цветущее",      emoji: "🌸", waterNeeded: 15 },
  { id: 5, name: "Mevali daraxt",  nameRu: "Плодоносящее",  emoji: "🍎", waterNeeded: 20 },
  { id: 6, name: "Baraka daraxti", nameRu: "Дерево Бараки", emoji: "🌳", waterNeeded: 999},
];

const WATER_COOLDOWN = 2 * 60 * 60; // 2 soat
const HARVEST_COINS  = [0, 10, 25, 50, 100, 200, 500];
const SUN_INTERVAL   = 30 * 60 * 1000; // 30 daqiqa

// ── SVG O'SIMLIKLAR ─────────────────────────────────────────
const PlantSVG = ({ stage, size = 140, animated = true }) => {
  const style = animated ? { animation: "sway 4s ease-in-out infinite", transformOrigin: "bottom center", display: "block" } : {};
  const s = [
    // 0: urug'
    <svg style={style} width={size} height={size*0.7} viewBox="0 0 100 70">
      <ellipse cx="50" cy="55" rx="28" ry="14" fill="#6b3f1a" opacity="0.6"/>
      <ellipse cx="50" cy="50" rx="18" ry="11" fill="#4a2c08"/>
      <ellipse cx="50" cy="44" rx="13" ry="10" fill="#3d2000"/>
      <path d="M50 36 Q46 26 50 18 Q54 26 50 36Z" fill="#22c55e" opacity="0.9"/>
    </svg>,
    // 1: nihol
    <svg style={style} width={size} height={size*0.9} viewBox="0 0 100 90">
      <ellipse cx="50" cy="78" rx="26" ry="12" fill="#5c3a1e" opacity="0.5"/>
      <rect x="47" y="42" width="6" height="38" rx="3" fill="#7c4f2a"/>
      <ellipse cx="50" cy="34" rx="20" ry="16" fill="#16a34a"/>
      <ellipse cx="50" cy="26" rx="13" ry="11" fill="#22c55e"/>
      <ellipse cx="36" cy="40" rx="10" ry="8" fill="#15803d" transform="rotate(-20,36,40)"/>
      <ellipse cx="64" cy="40" rx="10" ry="8" fill="#15803d" transform="rotate(20,64,40)"/>
    </svg>,
    // 2: yosh daraxt
    <svg style={style} width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="88" rx="28" ry="12" fill="#5c3a1e" opacity="0.5"/>
      <rect x="46" y="48" width="8" height="42" rx="4" fill="#8B5E3C"/>
      <ellipse cx="50" cy="36" rx="28" ry="22" fill="#15803d"/>
      <ellipse cx="50" cy="25" rx="20" ry="16" fill="#16a34a"/>
      <ellipse cx="50" cy="16" rx="13" ry="11" fill="#22c55e"/>
      <ellipse cx="32" cy="42" rx="14" ry="11" fill="#14532d"/>
      <ellipse cx="68" cy="42" rx="14" ry="11" fill="#14532d"/>
    </svg>,
    // 3: katta daraxt
    <svg style={style} width={size} height={size*1.2} viewBox="0 0 100 120">
      <ellipse cx="50" cy="108" rx="32" ry="13" fill="#5c3a1e" opacity="0.5"/>
      <rect x="45" y="56" width="10" height="54" rx="5" fill="#92400e"/>
      <ellipse cx="50" cy="42" rx="36" ry="28" fill="#14532d"/>
      <ellipse cx="50" cy="30" rx="27" ry="21" fill="#15803d"/>
      <ellipse cx="50" cy="20" rx="18" ry="14" fill="#16a34a"/>
      <ellipse cx="50" cy="12" rx="11" ry="9" fill="#22c55e"/>
      <ellipse cx="28" cy="50" rx="16" ry="12" fill="#166534"/>
      <ellipse cx="72" cy="50" rx="16" ry="12" fill="#166534"/>
      <ellipse cx="30" cy="66" rx="12" ry="9" fill="#15803d"/>
      <ellipse cx="70" cy="66" rx="12" ry="9" fill="#15803d"/>
    </svg>,
    // 4: gullagan daraxt
    <svg style={style} width={size} height={size*1.2} viewBox="0 0 100 120">
      <ellipse cx="50" cy="108" rx="32" ry="13" fill="#5c3a1e" opacity="0.5"/>
      <rect x="45" y="56" width="10" height="54" rx="5" fill="#92400e"/>
      <ellipse cx="50" cy="42" rx="36" ry="28" fill="#14532d"/>
      <ellipse cx="50" cy="30" rx="27" ry="21" fill="#15803d"/>
      <ellipse cx="50" cy="20" rx="18" ry="14" fill="#16a34a"/>
      <circle cx="30" cy="35" r="5" fill="#f9a8d4"/>
      <circle cx="45" cy="22" r="4" fill="#fbcfe8"/>
      <circle cx="60" cy="18" r="5" fill="#f9a8d4"/>
      <circle cx="70" cy="30" r="4" fill="#fce7f3"/>
      <circle cx="65" cy="45" r="5" fill="#f9a8d4"/>
      <circle cx="35" cy="48" r="4" fill="#fbcfe8"/>
      <circle cx="50" cy="12" r="4" fill="#f9a8d4"/>
      <ellipse cx="28" cy="50" rx="16" ry="12" fill="#166534"/>
      <ellipse cx="72" cy="50" rx="16" ry="12" fill="#166534"/>
    </svg>,
    // 5: mevali daraxt
    <svg style={style} width={size} height={size*1.2} viewBox="0 0 100 120">
      <ellipse cx="50" cy="108" rx="32" ry="13" fill="#5c3a1e" opacity="0.5"/>
      <rect x="45" y="56" width="10" height="54" rx="5" fill="#92400e"/>
      <ellipse cx="50" cy="42" rx="36" ry="28" fill="#14532d"/>
      <ellipse cx="50" cy="30" rx="27" ry="21" fill="#15803d"/>
      <ellipse cx="50" cy="20" rx="18" ry="14" fill="#16a34a"/>
      <circle cx="30" cy="38" r="7" fill="#ef4444"/>
      <circle cx="48" cy="24" r="6" fill="#f97316"/>
      <circle cx="65" cy="22" r="7" fill="#ef4444"/>
      <circle cx="72" cy="38" r="6" fill="#f97316"/>
      <circle cx="62" cy="50" r="7" fill="#ef4444"/>
      <circle cx="38" cy="52" r="6" fill="#f97316"/>
      <circle cx="50" cy="14" r="5" fill="#ef4444"/>
      <ellipse cx="28" cy="55" rx="16" ry="12" fill="#166534"/>
      <ellipse cx="72" cy="55" rx="16" ry="12" fill="#166534"/>
    </svg>,
    // 6: baraka daraxti (golden)
    <svg style={style} width={size} height={size*1.3} viewBox="0 0 100 130">
      <ellipse cx="50" cy="118" rx="36" ry="14" fill="#5c3a1e" opacity="0.5"/>
      <rect x="44" y="60" width="12" height="60" rx="6" fill="#92400e"/>
      <ellipse cx="50" cy="46" rx="40" ry="32" fill="#14532d"/>
      <ellipse cx="50" cy="32" rx="30" ry="24" fill="#15803d"/>
      <ellipse cx="50" cy="20" rx="20" ry="16" fill="#16a34a"/>
      <ellipse cx="50" cy="10" rx="12" ry="10" fill="#22c55e"/>
      <circle cx="28" cy="40" r="7" fill="#fbbf24"/>
      <circle cx="45" cy="24" r="6" fill="#f59e0b"/>
      <circle cx="62" cy="22" r="7" fill="#fbbf24"/>
      <circle cx="72" cy="36" r="6" fill="#f59e0b"/>
      <circle cx="66" cy="52" r="7" fill="#fbbf24"/>
      <circle cx="34" cy="54" r="6" fill="#f59e0b"/>
      <circle cx="50" cy="12" r="5" fill="#fbbf24"/>
      <ellipse cx="26" cy="55" rx="18" ry="13" fill="#166534"/>
      <ellipse cx="74" cy="55" rx="18" ry="13" fill="#166534"/>
      <ellipse cx="22" cy="70" rx="14" ry="11" fill="#15803d"/>
      <ellipse cx="78" cy="70" rx="14" ry="11" fill="#15803d"/>
    </svg>,
  ];
  return s[Math.min(stage, s.length - 1)];
};

// ── ASOSIY KOMPONENT ────────────────────────────────────────
export default function Garden({ user, lg = "uz", onBack, dark, addCoin }) {
  const oilaId = user?.oilaId;
  const L = (uz, ru = uz) => lg === "ru" ? ru : uz;

  // ── State ──
  const [coins, setCoins]         = useState(0);
  const [energy, setEnergy]       = useState(0);  // quyosh energiyasi
  const [crystals, setCrystals]   = useState(0);  // noyob kristallar
  const [plots, setPlots]         = useState(PLOTS.map(p => ({ ...p, stage: -1, waterCount: 0, lastWateredAt: 0, lastSunAt: 0, harvestReady: false })));
  const [waterTimer, setWaterTimer] = useState(0);
  const [waterReady, setWaterReady] = useState(true);
  const [suns, setSuns]           = useState([]);
  const [showInfo, setShowInfo]   = useState(false);
  const [showUnlock, setShowUnlock] = useState(null); // plot id
  const [showPlant, setShowPlant] = useState(null);   // plot id uchun ekish modal
  const [digAnim, setDigAnim]     = useState(null);   // { plotId, step }
  const [flyCoins, setFlyCoins]   = useState([]);     // animatsiya uchun
  const [waterAnim, setWaterAnim] = useState(false);
  const [growAnim, setGrowAnim]   = useState(null);   // plotId
  const [dailyDone, setDailyDone] = useState(false);
  const [msg, setMsg]             = useState(null);   // motivatsion xabar
  const [now, setNow]             = useState(Date.now());

  const timerRef = useRef(null);
  const msgRef   = useRef(null);

  // ── Xabar ko'rsatish ──
  const showMsg = (text, icon = "🌿") => {
    setMsg({ text, icon });
    clearTimeout(msgRef.current);
    msgRef.current = setTimeout(() => setMsg(null), 3000);
  };

  // ── Tanga animatsiyasi ──
  const spawnCoin = (amount, x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setFlyCoins(prev => [...prev, { id, amount, x, y }]);
    setTimeout(() => setFlyCoins(prev => prev.filter(c => c.id !== id)), 1400);
  };

  // ── Firebase yuklash ──
  useEffect(() => {
    if (!oilaId) return;
    loadAll();
  }, [oilaId]);

  const loadAll = async () => {
    try {
      const [g, c, e, cr, daily] = await Promise.all([
        db.g("baraka_garden_" + oilaId),
        db.g("baraka_coins_" + oilaId),
        db.g("baraka_energy_" + oilaId),
        db.g("baraka_crystals_" + oilaId),
        db.g("baraka_daily_" + oilaId),
      ]);
      if (g?.plots) setPlots(g.plots);
      if (c != null) setCoins(c);
      if (e != null) setEnergy(e);
      if (cr != null) setCrystals(cr);

      // Suv taymerini tiklash
      if (g?.lastWatered) {
        const elapsed = Math.floor((Date.now() - g.lastWatered) / 1000);
        const rem = WATER_COOLDOWN - elapsed;
        if (rem > 0) { setWaterTimer(rem); setWaterReady(false); }
        else { setWaterReady(true); }
      }

      // Kunlik sovg'a tekshirish
      const today = new Date().toISOString().slice(0, 10);
      if (daily?.date === today) setDailyDone(true);

    } catch (e) { console.error("Garden load:", e); }
  };

  const saveGarden = async (newPlots, newCoins, newEnergy, newCrystals, lastWatered) => {
    if (!oilaId) return;
    try {
      await db.s("baraka_garden_" + oilaId, { plots: newPlots, lastWatered: lastWatered ?? null, updatedAt: Date.now() });
      if (newCoins  !== undefined) await db.s("baraka_coins_" + oilaId, newCoins);
      if (newEnergy !== undefined) await db.s("baraka_energy_" + oilaId, newEnergy);
      if (newCrystals !== undefined) await db.s("baraka_crystals_" + oilaId, newCrystals);
    } catch (e) { console.error("Garden save:", e); }
  };

  // ── Taymer ──
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

  // ── Quyosh hosil bo'lish (har daqiqa tekshir) ──
  useEffect(() => {
    const iv = setInterval(() => {
      setPlots(prev => {
        let changed = false;
        const next = prev.map(p => {
          if (p.stage < 2) return p; // yosh daraxtdan boshlab quyosh beradi
          const lastSun = p.lastSunAt || 0;
          if (Date.now() - lastSun >= SUN_INTERVAL) {
            changed = true;
            const sunId = Date.now() + Math.random();
            setSuns(s => [...s.slice(-9), { id: sunId, at: Date.now() }]);
            return { ...p, lastSunAt: Date.now() };
          }
          return p;
        });
        if (changed) {
          saveGarden(next, undefined, undefined, undefined, null);
          showMsg(L("☀️ Baraka energiyasi to'planmoqda!", "☀️ Энергия накапливается!"));
        }
        return changed ? next : prev;
      });
    }, 60 * 1000);
    return () => clearInterval(iv);
  }, [oilaId]);

  // ── Vaqtni formatlash ──
  const fTime = s => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  // ── Sug'orish ──
  const handleWater = async (plotId) => {
    if (!waterReady) return;
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.stage < 0) return;

    setWaterAnim(true);
    setTimeout(() => setWaterAnim(false), 1200);

    const now = Date.now();
    const newWaterCount = (plot.waterCount || 0) + 1;
    const stage = plot.stage;
    const needed = STAGES[stage]?.waterNeeded || 3;
    let newStage = stage;
    let harvestReady = plot.harvestReady || false;

    if (newWaterCount >= needed && stage < STAGES.length - 1) {
      newStage = stage + 1;
      setGrowAnim(plotId);
      setTimeout(() => setGrowAnim(null), 2000);
      if (newStage === STAGES.length - 1) harvestReady = true;
      showMsg(L(`🌱 ${STAGES[newStage].name} bosqichiga yetdi!`, `🌱 Достигло стадии ${STAGES[newStage].nameRu}!`));
    } else {
      showMsg(L("💧 Bog' sug'orildi! +Energiya", "💧 Полито! +Энергия"));
    }

    // Energiya +5
    const newEnergy = energy + 5;
    setEnergy(newEnergy);

    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, waterCount: newWaterCount, stage: newStage, lastWateredAt: now, harvestReady }
      : p
    );
    setPlots(newPlots);
    setWaterReady(false);
    setWaterTimer(WATER_COOLDOWN);
    spawnCoin(5, 50, 60);
    await saveGarden(newPlots, undefined, newEnergy, undefined, now);
  };

  // ── Hosil yig'ish ──
  const handleHarvest = async (plotId) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.harvestReady) return;

    const earned = HARVEST_COINS[Math.min(plot.stage, HARVEST_COINS.length - 1)];
    const newCoins = coins + earned;
    const newCrystals = crystals + 1;
    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, stage: 0, waterCount: 0, harvestReady: false, lastSunAt: 0 }
      : p
    );

    setCoins(newCoins);
    setCrystals(newCrystals);
    setPlots(newPlots);
    spawnCoin(earned, 50, 40);
    showMsg(L(`🎉 Hosil yig'ildi! +${earned} Baraka Coin, +1💎`, `🎉 Урожай собран! +${earned} монет, +1💎`));
    await saveGarden(newPlots, newCoins, undefined, newCrystals, null);
  };

  // ── Uchastka ochish ──
  const handleUnlock = async (plotId) => {
    const plot = PLOTS.find(p => p.id === plotId);
    if (!plot) return;
    if (coins < plot.unlockCost) {
      showMsg(L(`❌ Yetarli tanga yo'q! ${plot.unlockCost} kerak`, `❌ Недостаточно монет! Нужно ${plot.unlockCost}`));
      setShowUnlock(null);
      return;
    }
    const newCoins = coins - plot.unlockCost;
    const newPlots = plots.map(p => p.id === plotId ? { ...p, stage: -1, unlocked: true } : p);
    setCoins(newCoins);
    setPlots(newPlots);
    setShowUnlock(null);
    showMsg(L("🎊 Yangi uchastka ochildi!", "🎊 Новый участок открыт!"));
    await saveGarden(newPlots, newCoins, undefined, undefined, null);
  };

  // ── Ekish ──
  const handlePlant = async (plotId) => {
    setShowPlant(null);
    // Animatsiya: kavlash
    for (let step = 1; step <= 5; step++) {
      await new Promise(r => setTimeout(r, 400));
      setDigAnim({ plotId, step });
    }
    await new Promise(r => setTimeout(r, 400));
    setDigAnim(null);

    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, stage: 0, waterCount: 0, harvestReady: false, lastSunAt: 0 }
      : p
    );
    setPlots(newPlots);
    showMsg(L("🌰 Urug' ekildi! Sug'orishni boshlang", "🌰 Семя посажено! Начинайте поливать"));
    await saveGarden(newPlots, undefined, undefined, undefined, null);
  };

  // ── Kunlik sovg'a ──
  const handleDailyGift = async () => {
    if (dailyDone) return;
    const today = new Date().toISOString().slice(0, 10);
    const bonus = 50;
    const newCoins = coins + bonus;
    const newEnergy = energy + 20;
    setCoins(newCoins);
    setEnergy(newEnergy);
    setDailyDone(true);
    spawnCoin(bonus, 50, 30);
    showMsg(L(`🎁 Kunlik sovg'a! +${bonus} Baraka Coin`, `🎁 Ежедневный бонус! +${bonus} монет`));
    await Promise.all([
      db.s("baraka_daily_" + oilaId, { date: today, coins: bonus }),
      saveGarden(plots, newCoins, newEnergy, undefined, null),
    ]);
  };

  // ── Quyosh yig'ish ──
  const collectSuns = async () => {
    if (suns.length === 0) return;
    const earned = suns.length * 15;
    const newEnergy = energy + earned;
    setEnergy(newEnergy);
    setSuns([]);
    spawnCoin(earned, 70, 20);
    showMsg(L(`☀️ +${earned} Baraka Energiya yig'ildi!`, `☀️ +${earned} Энергии собрано!`));
    await saveGarden(plots, undefined, newEnergy, undefined, null);
  };

  // ── Tezlashtirish (energiya sarflash) ──
  const handleSpeedUp = async () => {
    if (energy < 100) { showMsg(L("❌ Energiya yetarli emas (100 kerak)", "❌ Нужно 100 энергии")); return; }
    const newEnergy = energy - 100;
    setEnergy(newEnergy);
    setWaterTimer(prev => Math.max(0, prev - 30 * 60));
    showMsg(L("🚀 30 daqiqa tejaldi!", "🚀 Сэкономлено 30 минут!"));
    await saveGarden(plots, undefined, newEnergy, undefined, null);
  };

  const mainPlot = plots[0];
  const mainStage = mainPlot?.stage ?? -1;
  const currentStage = STAGES[Math.min(Math.max(mainStage, 0), STAGES.length - 1)];

  return (
    <div style={{ height:"100dvh", background:"linear-gradient(180deg,#1ea2f0 0%,#4dc4ff 22%,#8fe0ff 40%,#bff2c8 58%,#5fd66a 74%,#2fae4a 100%)", position:"relative", display:"flex", flexDirection:"column", fontFamily:"'Segoe UI',system-ui,sans-serif", overflow:"hidden" }}>

      {/* ── CSS ── */}
      <style>{`
        @keyframes sway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}
        @keyframes cloudDrift{0%,100%{transform:translateX(0)}50%{transform:translateX(16px)}}
        @keyframes coinFly{0%{transform:translateY(0) scale(0.5);opacity:1}100%{transform:translateY(-90px) scale(1.2);opacity:0}}
        @keyframes sunPulse{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.15) rotate(8deg)}}
        @keyframes growPop{0%{transform:scale(0.7)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes waterDrop{0%{transform:translateY(-10px) scale(0.8);opacity:0}30%{opacity:1}100%{transform:translateY(40px) scale(0.4);opacity:0}}
        @keyframes shimmer{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes msgSlide{0%{transform:translateY(-20px);opacity:0}15%,85%{transform:translateY(0);opacity:1}100%{transform:translateY(-20px);opacity:0}}
        @keyframes digBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes birdFly{0%{transform:translateX(-20px)}100%{transform:translateX(120vw)}}
        @keyframes leafFall{0%{transform:rotate(0deg) translateY(0)}100%{transform:rotate(360deg) translateY(60px);opacity:0}}
        @keyframes glowPulse{0%,100%{filter:drop-shadow(0 0 10px rgba(255,255,255,0.5))}50%{filter:drop-shadow(0 0 20px rgba(255,255,255,0.85))}}
      `}</style>

      {/* ── Fon tepaliklari ── */}
      <svg style={{ position:"absolute", bottom:"36%", left:0, width:"100%", height:120, zIndex:1, opacity:0.55, pointerEvents:"none" }} viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0,80 Q80,20 180,55 Q280,90 400,40 L400,100 L0,100 Z" fill="#3fc95a" />
      </svg>
      <svg style={{ position:"absolute", bottom:"30%", left:0, width:"100%", height:100, zIndex:2, opacity:0.7, pointerEvents:"none" }} viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0,60 Q100,100 220,50 Q320,15 400,60 L400,100 L0,100 Z" fill="#2fae4a" />
      </svg>

      {/* ── Motivatsion xabar ── */}
      {msg && (
        <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.75)", color: "#fff", borderRadius: 24, padding: "10px 22px", fontSize: 14, fontWeight: 700, zIndex: 999, whiteSpace: "nowrap", animation: "msgSlide 3s ease forwards", backdropFilter: "blur(8px)" }}>
          {msg.icon} {msg.text}
        </div>
      )}

      {/* ── Uçuvchi tangalar ── */}
      {flyCoins.map(c => (
        <div key={c.id} style={{ position: "fixed", left: c.x + "%", top: c.y + "%", zIndex: 998, animation: "coinFly 1.4s ease forwards", pointerEvents: "none", fontSize: 18, fontWeight: 800, color: "#fbbf24", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          +{c.amount}🪙
        </div>
      ))}

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 6px", position: "relative", zIndex: 20 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ textAlign: "center", background: "linear-gradient(135deg,rgba(255,255,255,0.35),rgba(255,255,255,0.1))", borderRadius: 30, padding: "6px 18px", backdropFilter: "blur(6px)", border: "1.5px solid rgba(255,255,255,0.5)" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.35)", letterSpacing: 0.5, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ animation:"glowPulse 2.5s ease-in-out infinite", display:"inline-block" }}>🌿</span> {L("Baraka Bog'i", "Сад Бараки")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleDailyGift} style={{ width: 40, height: 40, borderRadius: "50%", background: dailyDone ? "rgba(255,255,255,0.15)" : "rgba(251,191,36,0.85)", border: "none", cursor: dailyDone ? "default" : "pointer", fontSize: 18, backdropFilter: "blur(4px)" }} title={L("Kunlik sovg'a", "Ежедневный бонус")}>
            🎁
          </button>
          <button onClick={() => setShowInfo(true)} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", fontSize: 17, color: "#fff", fontWeight: 800, backdropFilter: "blur(4px)" }}>
            ?
          </button>
        </div>
      </div>

      {/* ── Counter'lar ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "4px 18px 0", zIndex: 20, position: "relative", flexWrap: "wrap" }}>
        {[
          { ico: "🪙", val: coins,    label: L("Baraka Coin", "Монет"),    color: "#fff7e0", bg: "linear-gradient(135deg,#ffcf4d,#f59e0b)", border: "#fff3b0" },
          { ico: "⚡", val: energy,   label: L("Energiya",    "Энергия"),  color: "#f5f0ff", bg: "linear-gradient(135deg,#c084fc,#7c3aed)", border: "#e9d5ff", onClick: suns.length > 0 ? collectSuns : null, badge: suns.length > 0 ? suns.length : null },
          { ico: "💎", val: crystals, label: L("Kristal",     "Кристаллов"),color: "#f0feff", bg: "linear-gradient(135deg,#67e8f9,#0891b2)", border: "#cffafe" },
        ].map((c, i) => (
          <div key={i} onClick={c.onClick} style={{ background: c.bg, borderRadius: 30, padding: "7px 16px", display: "flex", alignItems: "center", gap: 6, cursor: c.onClick ? "pointer" : "default", boxShadow: "0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)", border: `1.5px solid ${c.border}`, position: "relative" }}>
            <span style={{ fontSize: 17, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}>{c.ico}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: c.color, lineHeight: 1, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>{c.val.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", lineHeight: 1, marginTop:2 }}>{c.label}</div>
            </div>
            {c.badge && <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", fontSize: 9, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border:"1.5px solid #fff" }}>{c.badge}</div>}
          </div>
        ))}
      </div>

      {/* ── Osmon: bulutlar, qushlar, quyosh ── */}
      <div style={{ position: "relative", height: 90, overflow: "visible", zIndex: 5, flexShrink: 0 }}>
        {/* Quyosh */}
        <div style={{ position: "absolute", right: "12%", top: 8, fontSize: 36, animation: "sunPulse 3s ease-in-out infinite", filter: "drop-shadow(0 0 12px #fde68a)" }}>☀️</div>
        {/* Bulutlar */}
        {[{ l: "5%", t: 10, s: 42, d: "9s" }, { l: "45%", t: 4, s: 30, d: "13s", rev: true }, { l: "68%", t: 22, s: 24, d: "16s" }].map((c, i) => (
          <div key={i} style={{ position: "absolute", left: c.l, top: c.t, fontSize: c.s, opacity: 0.85, animation: `cloudDrift ${c.d} ease-in-out infinite ${c.rev ? "reverse" : ""}`, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.1))" }}>☁️</div>
        ))}
        {/* Qush */}
        <div style={{ position: "absolute", top: 15, animation: "birdFly 18s linear infinite", fontSize: 16 }}>🐦</div>
        {/* Yig'ish mumkin bo'lsa quyosh */}
        {suns.length > 0 && (
          <div onClick={collectSuns} style={{ position: "absolute", top: 8, left: "40%", animation: "sunPulse 2s ease-in-out infinite", cursor: "pointer", zIndex: 10 }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 20, filter: "drop-shadow(0 0 8px #fde68a)" }}>☀️</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#fde68a" }}>×{suns.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── O'simlik maydoni ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", overflowY: "auto", overflowX: "hidden" }}>

        {/* Asosiy o'simlik */}
        <div style={{ position: "relative", marginBottom: -8, zIndex: 10 }}>
          {waterAnim && (
            <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", fontSize: 28, zIndex: 20, animation: "waterDrop 1.2s ease forwards" }}>💧</div>
          )}
          <div style={{ animation: growAnim === 0 ? "growPop 0.8s ease" : "none" }}>
            {mainStage >= 0
              ? <PlantSVG stage={mainStage} size={Math.min(160, window.innerHeight * 0.22)} />
              : <div style={{ width: 120, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: 0.5 }}>🌰</div>
            }
          </div>
          {/* Hosil tayyor belgisi */}
          {mainPlot?.harvestReady && (
            <div onClick={() => handleHarvest(0)} style={{ position: "absolute", top: 0, right: -20, background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,158,11,0.6)", animation: "shimmer 2s ease-in-out infinite" }}>🎁</div>
          )}
        </div>

        {/* ── Yashil zamin ── */}
        <div style={{ background: "linear-gradient(180deg,#4ade80 0%,#22c55e 35%,#15803d 100%)", width: "100%", borderRadius: "40px 40px 0 0", padding: "16px 14px 24px", position: "relative", zIndex: 9, flexShrink: 0, boxShadow: "0 -8px 24px rgba(0,0,0,0.15)" }}>

          {/* Daraxt bosqichi nomi */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              {mainStage >= 0 ? `${currentStage.emoji} ${L(currentStage.name, currentStage.nameRu)}` : L("🌰 Urug' ekish kerak", "🌰 Нужно посеять")}
            </div>
            {/* Progress bar */}
            {mainStage >= 0 && mainStage < STAGES.length - 1 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 30, height: 12, overflow: "hidden", margin: "0 20px", border: "1.5px solid rgba(255,255,255,0.3)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)" }}>
                  <div style={{ width: `${Math.min(100, ((mainPlot?.waterCount || 0) / STAGES[mainStage].waterNeeded) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#38bdf8,#0ea5e9)", borderRadius: 30, transition: "width .5s", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), 0 0 10px rgba(56,189,248,0.6)" }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.4)", marginTop: 6, background: "rgba(0,0,0,0.2)", borderRadius: 20, display: "inline-block", padding: "3px 12px" }}>
                  💧 {mainPlot?.waterCount || 0}/{STAGES[mainStage]?.waterNeeded} → {L(STAGES[mainStage + 1]?.name, STAGES[mainStage + 1]?.nameRu)}
                </div>
              </div>
            )}
          </div>

          {/* ── Qo'shni uchastkalar ── */}
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 18, gap: 10 }}>
            {plots.slice(1).map(plot => {
              const pl = PLOTS.find(p => p.id === plot.id);
              const isUnlocked = plot.unlocked || plot.stage >= 0;
              const isDigging = digAnim?.plotId === plot.id;
              return (
                <div key={plot.id} onClick={() => { if (!isUnlocked) setShowUnlock(plot.id); else if (plot.stage < 0) setShowPlant(plot.id); else if (plot.harvestReady) handleHarvest(plot.id); }}
                  style={{ flex: 1, aspectRatio: "1", borderRadius: "50%", background: isUnlocked ? "radial-gradient(circle at 35% 30%,#8b5e2f,#6b3f1a 70%)" : "radial-gradient(circle at 35% 30%,#a97c4f,#6b4423 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `4px solid ${isUnlocked ? "#4ade80" : "#9a6a3a"}`, cursor: "pointer", transition: "all .2s", boxShadow: `inset 0 4px 10px rgba(0,0,0,0.4), 0 4px 10px rgba(0,0,0,0.25), 0 0 0 3px ${isUnlocked ? "rgba(74,222,128,0.25)" : "rgba(0,0,0,0.1)"}` }}>
                  {isDigging
                    ? <span style={{ fontSize: 26, animation: "digBounce 0.4s ease infinite" }}>⛏️</span>
                    : isUnlocked
                      ? plot.stage >= 0
                        ? plot.harvestReady
                          ? <span style={{ fontSize: 24, animation: "shimmer 1.5s ease infinite" }}>🎁</span>
                          : <div style={{ transform: "scale(0.4)", marginTop: -20 }}><PlantSVG stage={plot.stage} size={100} animated={false} /></div>
                        : <span style={{ fontSize: 24, opacity: 0.6 }}>🌰</span>
                      : <>
                          <span style={{ fontSize: 20 }}>🔒</span>
                          <span style={{ fontSize: 10, color: "#fde68a", fontWeight: 700, marginTop: 2 }}>{pl?.unlockCost.toLocaleString()}🪙</span>
                        </>
                  }
                </div>
              );
            })}
          </div>

          {/* ── Pastki boshqaruv ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Tanga (chap) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(145deg,#fbbf24,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(245,158,11,0.6)", border: "3px solid #fde68a" }}>
                <span style={{ fontSize: 26 }}>🪙</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24" }}>{coins.toLocaleString()}</span>
            </div>

            {/* Markaziy tugmalar */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {mainStage < 0
                ? <button onClick={() => setShowPlant(0)} style={{ width: "100%", padding: "14px", borderRadius: 16, border: "none", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 14px rgba(245,158,11,0.5)" }}>
                    🌰 {L("Urug' ekish", "Посеять семя")}
                  </button>
                : mainPlot?.harvestReady
                  ? <button onClick={() => handleHarvest(0)} style={{ width: "100%", padding: "14px", borderRadius: 16, border: "none", background: "linear-gradient(135deg,#22c55e,#15803d)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 14px rgba(34,197,94,0.5)", animation: "shimmer 2s ease-in-out infinite" }}>
                      🎁 {L("Hosil yig'ish", "Собрать урожай")} +{HARVEST_COINS[Math.min(mainStage, HARVEST_COINS.length-1)]}🪙
                    </button>
                  : <button onClick={() => handleWater(0)} disabled={!waterReady} style={{ width: "100%", padding: "14px", borderRadius: 16, border: "none", background: waterReady ? "linear-gradient(135deg,#0ea5e9,#0284c7)" : "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: waterReady ? "pointer" : "not-allowed", boxShadow: waterReady ? "0 4px 14px rgba(14,165,233,0.5)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      {waterReady ? <>💧 {L("Sug'orish", "Полить")}</> : <>⏳ {fTime(waterTimer)}</>}
                    </button>
              }
              {!waterReady && energy >= 100 && (
                <button onClick={handleSpeedUp} style={{ background: "rgba(0,0,0,0.3)", border: "none", borderRadius: 12, padding: "7px 14px", color: "#a78bfa", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  ⚡ {L("Tezlashtirish -100", "Ускорить -100")}
                </button>
              )}
            </div>

            {/* Suv idishi (o'ng) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: waterReady ? "linear-gradient(145deg,#0ea5e9,#0369a1)" : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: waterReady ? "0 4px 14px rgba(14,165,233,0.6)" : "none", border: `3px solid ${waterReady ? "#38bdf8" : "rgba(255,255,255,0.3)"}`, position: "relative" }}>
                <span style={{ fontSize: 26 }}>🫗</span>
                {waterReady && <div style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff" }} />}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: waterReady ? "#7dd3fc" : "rgba(255,255,255,0.5)" }}>
                {waterReady ? L("Tayyor!", "Готово!") : fTime(waterTimer)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MODALLAR ══════════════════════════════════════════ */}

      {/* Uchastka ochish modali */}
      {showUnlock !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowUnlock(null)}>
          <div style={{ background: dark ? "#1e293b" : "#fff", borderRadius: 28, padding: "28px 24px", width: "100%", maxWidth: 340, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: dark ? "#fff" : "#111", marginBottom: 8 }}>
              {L("Yangi uchastka", "Новый участок")}
            </div>
            <div style={{ fontSize: 14, color: dark ? "#94a3b8" : "#666", marginBottom: 20 }}>
              {L("Bu uchastkani ochish uchun kerak:", "Для открытия нужно:")}
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b", margin: "8px 0" }}>
                🪙 {PLOTS.find(p => p.id === showUnlock)?.unlockCost.toLocaleString()} Baraka Coin
              </div>
              <div style={{ fontSize: 13, color: dark ? "#64748b" : "#999" }}>
                {L(`Sizda: ${coins.toLocaleString()} Coin`, `У вас: ${coins.toLocaleString()} монет`)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowUnlock(null)} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: dark ? "#334155" : "#f1f5f9", color: dark ? "#94a3b8" : "#666", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                {L("Bekor", "Отмена")}
              </button>
              <button onClick={() => handleUnlock(showUnlock)} disabled={coins < (PLOTS.find(p => p.id === showUnlock)?.unlockCost || 0)} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: coins >= (PLOTS.find(p => p.id === showUnlock)?.unlockCost || 0) ? "linear-gradient(135deg,#f59e0b,#d97706)" : "#e5e7eb", color: "#fff", fontWeight: 800, cursor: coins >= (PLOTS.find(p => p.id === showUnlock)?.unlockCost || 0) ? "pointer" : "not-allowed", fontSize: 14 }}>
                🔓 {L("Ochish", "Открыть")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ekish modali */}
      {showPlant !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowPlant(null)}>
          <div style={{ background: dark ? "#1e293b" : "#fff", borderRadius: 28, padding: "28px 24px", width: "100%", maxWidth: 340, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>🌰</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: dark ? "#fff" : "#111", marginBottom: 8 }}>
              {L("Baraka urug'ini ekish", "Посеять семя Бараки")}
            </div>
            <div style={{ fontSize: 13, color: dark ? "#94a3b8" : "#666", lineHeight: 1.7, marginBottom: 20 }}>
              {L("Urug' ekib, muntazam sug'oring. Har bir moliyaviy amal daraxtingizni o'stiradi. Baraka daraxti bo'lganda katta mukofot!", "Посейте семя и регулярно поливайте. Каждое финансовое действие растит ваше дерево!")}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowPlant(null)} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: dark ? "#334155" : "#f1f5f9", color: dark ? "#94a3b8" : "#666", fontWeight: 700, cursor: "pointer" }}>
                {L("Bekor", "Отмена")}
              </button>
              <button onClick={() => handlePlant(showPlant)} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#22c55e,#15803d)", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                🌰 {L("Ekish", "Посеять")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ma'lumot modali */}
      {showInfo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowInfo(false)}>
          <div style={{ background: dark ? "#1e293b" : "#fff", borderRadius: "28px 28px 0 0", padding: "24px 22px 40px", width: "100%", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 900, color: dark ? "#fff" : "#111", textAlign: "center", marginBottom: 18 }}>
              🌿 {L("Baraka Bog'i haqida", "О Саде Бараки")}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b", marginBottom: 10 }}>🪙 {L("Baraka Coin qanday olinadi?", "Как получить монеты?")}</div>
            {[
              ["💸", L("Xarajat qo'shish", "Добавить расход"),   "+5🪙"],
              ["💰", L("Daromad qo'shish","Добавить доход"),     "+10🪙"],
              ["📷", L("QR kod skanerlash","Сканировать QR"),    "+10🪙"],
              ["🎯", L("Maqsad yaratish",  "Создать цель"),      "+20🪙"],
              ["✅", L("Maqsadga erishish","Достичь цели"),      "+50🪙"],
              ["💳", L("Qarzni yopish",    "Закрыть долг"),      "+30🪙"],
              ["👨‍👩‍👧", L("Oila a'zosi qo'shish","Добавить участника"),"+15🪙"],
              ["📅", L("7 kun ketma-ket",  "7 дней подряд"),     "+25🪙"],
              ["🎁", L("Kunlik sovg'a",    "Ежедневный бонус"),  "+50🪙"],
              ["☀️", L("Quyosh yig'ish",   "Собрать солнце"),    "+15⚡"],
            ].map(([ico, txt, val], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 9 ? `1px solid ${dark?"#334155":"#f3f4f6"}` : "none" }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{ico}</span>
                <span style={{ flex: 1, fontSize: 13, color: dark ? "#cbd5e1" : "#444" }}>{txt}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b", background: dark ? "#451a03" : "#fef3c7", borderRadius: 10, padding: "3px 10px" }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: "14px", background: dark ? "#0f172a" : "#f0fdf4", borderRadius: 16, fontSize: 13, color: dark ? "#86efac" : "#15803d", lineHeight: 1.8 }}>
              <b>{L("Uchastkalar ochilishi:", "Открытие участков:")}</b><br />
              {PLOTS.slice(1).map(p => <span key={p.id}>🔒 {p.unlockCost.toLocaleString()}🪙<br/></span>)}
              <br/><b>{L("O'sish bosqichlari:", "Стадии роста:")}</b><br />
              {STAGES.map(s => `${s.emoji} ${L(s.name, s.nameRu)}`).join(" → ")}
            </div>
            <button onClick={() => setShowInfo(false)} style={{ width: "100%", marginTop: 16, padding: "15px", background: "linear-gradient(135deg,#22c55e,#15803d)", border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
