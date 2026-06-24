import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./firebase.js";

// ─── SVG O'SIMLIKLAR ───────────────────────────────────────────────────────
const PlantSVG = ({ level, size = 160 }) => {
  const plants = [
    // 0: urug'
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="72" rx="22" ry="12" fill="#5c3a1e"/>
      <ellipse cx="50" cy="68" rx="15" ry="9" fill="#7a5c3a"/>
      <circle cx="50" cy="58" r="12" fill="#4a3000"/>
      <path d="M50 48 Q44 38 48 30 Q52 38 50 48Z" fill="#22c55e"/>
    </svg>,
    // 1: ko'chat
    <svg width={size} height={size} viewBox="0 0 100 120">
      <ellipse cx="50" cy="100" rx="24" ry="12" fill="#5c3a1e"/>
      <rect x="47" y="55" width="6" height="48" fill="#6b4c2a" rx="3"/>
      <ellipse cx="50" cy="45" rx="18" ry="16" fill="#16a34a"/>
      <ellipse cx="50" cy="38" rx="12" ry="11" fill="#22c55e"/>
    </svg>,
    // 2: kichik daraxt
    <svg width={size} height={size} viewBox="0 0 100 130">
      <ellipse cx="50" cy="110" rx="26" ry="13" fill="#5c3a1e"/>
      <rect x="46" y="55" width="8" height="58" fill="#8B5E3C" rx="4"/>
      <ellipse cx="50" cy="44" rx="26" ry="22" fill="#15803d"/>
      <ellipse cx="50" cy="34" rx="18" ry="16" fill="#16a34a"/>
      <ellipse cx="50" cy="25" rx="11" ry="10" fill="#22c55e"/>
    </svg>,
    // 3: o'rta daraxt
    <svg width={size} height={size} viewBox="0 0 110 150">
      <ellipse cx="55" cy="128" rx="30" ry="14" fill="#5c3a1e"/>
      <rect x="50" y="62" width="10" height="68" fill="#92400e" rx="5"/>
      <ellipse cx="55" cy="50" rx="34" ry="28" fill="#166534"/>
      <ellipse cx="55" cy="38" rx="25" ry="21" fill="#15803d"/>
      <ellipse cx="55" cy="27" rx="16" ry="14" fill="#16a34a"/>
      <ellipse cx="40" cy="55" rx="14" ry="11" fill="#15803d"/>
      <ellipse cx="70" cy="55" rx="14" ry="11" fill="#15803d"/>
    </svg>,
    // 4: katta daraxt
    <svg width={size} height={size} viewBox="0 0 120 160">
      <ellipse cx="60" cy="140" rx="35" ry="16" fill="#5c3a1e"/>
      <rect x="55" y="68" width="12" height="74" fill="#92400e" rx="6"/>
      <ellipse cx="60" cy="54" rx="42" ry="34" fill="#14532d"/>
      <ellipse cx="60" cy="40" rx="32" ry="26" fill="#166534"/>
      <ellipse cx="60" cy="28" rx="20" ry="18" fill="#15803d"/>
      <ellipse cx="60" cy="18" rx="12" ry="10" fill="#22c55e"/>
      <ellipse cx="35" cy="60" rx="16" ry="13" fill="#166534"/>
      <ellipse cx="85" cy="60" rx="16" ry="13" fill="#166534"/>
      <ellipse cx="40" cy="78" rx="12" ry="10" fill="#15803d"/>
      <ellipse cx="80" cy="78" rx="12" ry="10" fill="#15803d"/>
    </svg>,
  ];
  return plants[Math.min(level, plants.length - 1)];
};

// ─── QO'SHNI DOIRA (qulfli yoki kavlash uchun) ────────────────────────────
const PlotCircle = ({ state, onDig, plantLevel }) => {
  // state: "locked" | "digging" | "planted"
  if (state === "locked") return (
    <div style={{ width: 110, height: 65, borderRadius: "50%", background: "#a0785a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "3px solid #7a5038", boxShadow: "inset 0 3px 8px rgba(0,0,0,0.3)" }}>
      <span style={{ fontSize: 22 }}>🔒</span>
    </div>
  );
  if (state === "digging") return (
    <div onClick={onDig} style={{ width: 110, height: 65, borderRadius: "50%", background: "#8B5E3C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "3px solid #5c3a1e", cursor: "pointer", boxShadow: "inset 0 3px 8px rgba(0,0,0,0.4)", animation: "digShake 0.3s ease" }}>
      <span style={{ fontSize: 26 }}>⛏️</span>
      <span style={{ fontSize: 10, color: "#fde68a", fontWeight: 700, marginTop: 2 }}>Bosing!</span>
    </div>
  );
  if (state === "planted") return (
    <div style={{ width: 110, height: 65, borderRadius: "50%", background: "#5c3a1e", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #3d2007", position: "relative" }}>
      <div style={{ transform: "scale(0.45)", marginTop: -20 }}>
        <PlantSVG level={plantLevel || 0} size={100} />
      </div>
    </div>
  );
  return null;
};

// ─── ASOSIY KOMPONENT ──────────────────────────────────────────────────────
export default function Garden({ user, lg = "uz", onBack, dark }) {
  const oilaId = user?.oilaId;

  // ── State ──
  const [coins, setCoins] = useState(0);
  const [plots, setPlots] = useState([
    { id: 0, state: "planted", level: 0, wateredAt: null, sunTimer: null },
    { id: 1, state: "locked", level: 0, wateredAt: null, sunTimer: null },
    { id: 2, state: "locked", level: 0, wateredAt: null, sunTimer: null },
  ]);
  const [suns, setSuns] = useState([]); // yuqorida to'plangan quyoshlar
  const [waterTimer, setWaterTimer] = useState(0); // soniyada
  const [waterReady, setWaterReady] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [digStep, setDigStep] = useState(0); // 0=yo'q, 1-3=kavlash, 4=urug', 5=ko'mish, 6=tayyor
  const [digPlotId, setDigPlotId] = useState(null);
  const [showCoinAnim, setShowCoinAnim] = useState(false);
  const [sunDrops, setSunDrops] = useState([]); // tushayotgan quyoshlar animatsiyasi
  const [now, setNow] = useState(Date.now());

  const timerRef = useRef(null);
  const WATER_COOLDOWN = 2 * 60 * 60; // 2 soat soniyada
  const MAX_LEVEL = 4;

  // L - lokalizatsiya
  const L = (uz, ru = uz, en = uz) => lg === "uz" ? uz : lg === "ru" ? ru : en;

  // ── Firebase yuklash ──
  useEffect(() => {
    if (!oilaId) return;
    loadData();
  }, [oilaId]);

  const loadData = async () => {
    try {
      const g = await db.g("garden2_" + oilaId);
      const c = await db.g("coins_" + oilaId);
      if (g) {
        setPlots(g.plots || plots);
        setSuns(g.suns || []);
        // Suv taymerini hisoblash
        if (g.lastWatered) {
          const elapsed = Math.floor((Date.now() - g.lastWatered) / 1000);
          const remaining = WATER_COOLDOWN - elapsed;
          if (remaining > 0) {
            setWaterTimer(remaining);
            setWaterReady(false);
          } else {
            setWaterReady(true);
            setWaterTimer(0);
          }
        }
      }
      if (c != null) setCoins(c);
    } catch (e) { console.error("Garden load:", e); }
  };

  const saveData = async (newPlots, newSuns, newCoins, lastWatered) => {
    try {
      await db.s("garden2_" + oilaId, { plots: newPlots, suns: newSuns, lastWatered: lastWatered || null, updatedBy: user?.id, updatedAt: Date.now() });
      await db.s("coins_" + oilaId, newCoins);
    } catch (e) { console.error("Garden save:", e); }
  };

  // ── Taymer (har soniya) ──
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

  // ── Quyosh hosil bo'lish taymer (har 30 daqiqa) ──
  useEffect(() => {
    const sunInterval = setInterval(() => {
      setPlots(prev => {
        let changed = false;
        const updated = prev.map(p => {
          if (p.state !== "planted" || p.level < 1) return p;
          // Har o'sgan o'simlik quyosh beradi
          const lastSun = p.lastSunAt || 0;
          const sunCooldown = 30 * 60 * 1000; // 30 daqiqa
          if (Date.now() - lastSun >= sunCooldown) {
            changed = true;
            // Quyosh animatsiyasi
            const sunId = Date.now() + Math.random();
            setSunDrops(d => [...d, { id: sunId, x: 30 + Math.random() * 40 }]);
            setTimeout(() => setSunDrops(d => d.filter(s => s.id !== sunId)), 2000);
            setSuns(s => [...s, { id: sunId, at: Date.now() }]);
            return { ...p, lastSunAt: Date.now() };
          }
          return p;
        });
        return updated;
      });
    }, 60 * 1000); // har daqiqa tekshir
    return () => clearInterval(sunInterval);
  }, []);

  // ── Vaqtni formatlash ──
  const fTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ── Sug'orish ──
  const handleWater = async (plotId) => {
    if (!waterReady) return;
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.state !== "planted") return;

    const now = Date.now();
    const newPlots = plots.map(p => {
      if (p.id !== plotId) return p;
      const newWaterCount = (p.waterCount || 0) + 1;
      // Har 3 marta sug'OriShda level oshadi
      const newLevel = Math.min(Math.floor(newWaterCount / 3), MAX_LEVEL);
      // Level oshsa keyingi doirani ochish
      let unlockNext = false;
      if (newLevel > p.level && newLevel >= MAX_LEVEL) unlockNext = true;
      return { ...p, wateredAt: now, waterCount: newWaterCount, level: newLevel, _unlockNext: unlockNext };
    });

    // Keyingi doirani ochish
    let finalPlots = newPlots.map((p, i) => {
      if (newPlots[i - 1]?._unlockNext && p.state === "locked") {
        return { ...p, state: "digging" };
      }
      return { ...p, _unlockNext: undefined };
    });

    setPlots(finalPlots);
    setWaterReady(false);
    setWaterTimer(WATER_COOLDOWN);

    // Animatsiya
    const sunId = Date.now();
    setSunDrops(d => [...d, { id: sunId, x: 40 + Math.random() * 20 }]);
    setTimeout(() => setSunDrops(d => d.filter(s => s.id !== sunId)), 2000);

    await saveData(finalPlots, suns, coins, now);
  };

  // ── Kavlash (ekish jarayoni) ──
  const handleDig = async (plotId) => {
    if (digPlotId !== null && digPlotId !== plotId) return;
    setDigPlotId(plotId);
    const step = digStep + 1;
    setDigStep(step);

    if (step >= 5) {
      // Ekish tugadi
      setTimeout(async () => {
        const newPlots = plots.map(p =>
          p.id === plotId ? { ...p, state: "planted", level: 0, waterCount: 0 } : p
        );
        setPlots(newPlots);
        setDigStep(0);
        setDigPlotId(null);
        await saveData(newPlots, suns, coins, null);
      }, 600);
    }
  };

  // ── Tangani sarflash (tezlashtirish) ──
  const handleSpeedUp = async (plotId) => {
    if (coins < 100) return;
    const newCoins = coins - 100;
    setCoins(newCoins);
    // Suv taymerini 30 daqiqaga qisqartirish
    setWaterTimer(prev => Math.max(0, prev - 30 * 60));
    setShowCoinAnim(true);
    setTimeout(() => setShowCoinAnim(false), 1000);
    await saveData(plots, suns, newCoins, null);
  };

  // ── Quyoshni yig'ish ──
  const collectSuns = async () => {
    if (suns.length === 0) return;
    const earned = suns.length * 10;
    const newCoins = coins + earned;
    setCoins(newCoins);
    setSuns([]);
    setShowCoinAnim(true);
    setTimeout(() => setShowCoinAnim(false), 1200);
    await saveData(plots, [], newCoins, null);
  };

  // ── Quyosh taymer (har quyosh uchun) ──
  const nextSunIn = () => {
    const planted = plots.filter(p => p.state === "planted" && p.level >= 1);
    if (planted.length === 0) return null;
    const lastSunAt = Math.max(...planted.map(p => p.lastSunAt || 0));
    const sunCooldown = 30 * 60 * 1000;
    const remaining = Math.max(0, Math.floor((lastSunAt + sunCooldown - Date.now()) / 1000));
    return remaining;
  };

  const sunTimer = nextSunIn();
  const mainPlot = plots[0];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1565c0 0%, #1976d2 30%, #42a5f5 55%, #66bb6a 65%, #2e7d32 100%)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* ── CSS animatsiyalar ── */}
      <style>{`
        @keyframes cloudDrift { 0%,100%{transform:translateX(0)} 50%{transform:translateX(14px)} }
        @keyframes plantSway { 0%,100%{transform:rotate(-1.5deg)} 50%{transform:rotate(1.5deg)} }
        @keyframes sunFloat { 0%{transform:translateY(0) scale(1)} 50%{transform:translateY(-8px) scale(1.1)} 100%{transform:translateY(0) scale(1)} }
        @keyframes sunDrop { 0%{transform:translateY(40px) scale(0.5);opacity:0} 30%{opacity:1;transform:translateY(0) scale(1.2)} 100%{transform:translateY(-60px) scale(0.8);opacity:0} }
        @keyframes coinPop { 0%{transform:scale(0.5);opacity:0} 50%{transform:scale(1.3)} 100%{transform:scale(1);opacity:1} }
        @keyframes digShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        @keyframes lockOpen { 0%{transform:scale(1) rotate(0)} 50%{transform:scale(1.3) rotate(-15deg)} 100%{transform:scale(1) rotate(0)} }
        @keyframes waterDrop { 0%{transform:scale(0.8);opacity:0.8} 100%{transform:scale(2);opacity:0} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 6px", position: "relative", zIndex: 20 }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{L("Oila bog'i", "Семейный сад", "Family Garden")}</div>
        <button onClick={() => setShowInfo(true)} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", fontSize: 18, color: "#fff", fontWeight: 800 }}>?</button>
      </div>

      {/* ── Yuqori counter'lar ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "4px 18px", zIndex: 20, position: "relative" }}>
        {/* Tangalar */}
        <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 30, padding: "5px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18 }}>🪙</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#fbbf24" }}>{coins}</span>
        </div>
        {/* Quyoshlar */}
        {suns.length > 0 && (
          <div onClick={collectSuns} style={{ background: "rgba(0,0,0,0.35)", borderRadius: 30, padding: "5px 14px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", animation: "sunFloat 2s ease-in-out infinite" }}>
            <span style={{ fontSize: 18 }}>☀️</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#fde68a" }}>×{suns.length}</span>
            <span style={{ fontSize: 11, color: "#fde68a" }}>+{suns.length * 10}🪙</span>
          </div>
        )}
      </div>

      {/* ── Bulutlar ── */}
      <div style={{ position: "relative", height: 70, overflow: "visible", zIndex: 5, flexShrink: 0 }}>
        {[{ l: "8%", t: 8, s: 38, d: "8s" }, { l: "52%", t: 2, s: 28, d: "11s", rev: true }, { l: "75%", t: 18, s: 22, d: "14s" }].map((c, i) => (
          <div key={i} style={{ position: "absolute", left: c.l, top: c.t, fontSize: c.s, opacity: 0.85, animation: `cloudDrift ${c.d} ease-in-out infinite ${c.rev ? "reverse" : ""}`, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}>☁️</div>
        ))}
      </div>

      {/* ── Quyosh tushish animatsiyasi ── */}
      {sunDrops.map(s => (
        <div key={s.id} style={{ position: "absolute", left: s.x + "%", top: "35%", fontSize: 28, zIndex: 30, animation: "sunDrop 1.8s ease-out forwards", pointerEvents: "none" }}>☀️</div>
      ))}

      {/* ── Asosiy o'simlik (markazda) ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 0, position: "relative", zIndex: 10 }}>
        <div style={{ animation: "plantSway 5s ease-in-out infinite", transformOrigin: "bottom center", marginBottom: -10 }}>
          <PlantSVG level={mainPlot?.level || 0} size={160} />
        </div>

        {/* ── Yashil zamin qismi ── */}
        <div style={{ background: "linear-gradient(180deg, #2d7a2d 0%, #1a5c1a 100%)", width: "100%", borderRadius: "36px 36px 0 0", padding: "20px 18px 30px", position: "relative" }}>

          {/* O'simlik darajasi */}
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>
              {[L("Urug'", "Семя"), L("Ko'chat", "Росток"), L("Daracha", "Деревце"), L("Daraxt", "Дерево"), L("Ulkan daraxt", "Великое дерево")][Math.min(mainPlot?.level || 0, 4)]}
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 6 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: i === (mainPlot?.level || 0) ? 22 : 8, height: 8, borderRadius: 4, background: i <= (mainPlot?.level || 0) ? "#fbbf24" : "rgba(255,255,255,0.3)", transition: "all .3s" }} />
              ))}
            </div>
          </div>

          {/* ── Qo'shni doiralar ── */}
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginBottom: 16 }}>
            {plots.slice(1).map(plot => (
              <PlotCircle key={plot.id} state={plot.state} plantLevel={plot.level}
                onDig={() => handleDig(plot.id)}
              />
            ))}
          </div>

          {/* ── Kavlash holati ── */}
          {digPlotId !== null && (
            <div style={{ textAlign: "center", marginBottom: 10, color: "#fde68a", fontSize: 14, fontWeight: 700 }}>
              {digStep < 3 ? `⛏️ ${L("Kavlanmoqda", "Копаем")}... (${digStep}/3)` :
                digStep === 3 ? `🌰 ${L("Urug' tashlanmoqda", "Бросаем семя")}...` :
                  `⛏️ ${L("Ko'milmoqda", "Закапываем")}...`}
            </div>
          )}

          {/* ── Pastki tugmalar qatori ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>

            {/* Tanga (chap) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(145deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(245,158,11,0.5)", border: "3px solid #fbbf24", animation: showCoinAnim ? "coinPop 0.6s ease" : "none" }}>
                <span style={{ fontSize: 24 }}>🪙</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>{coins}</span>
            </div>

            {/* Sug'orish + tezlashtirish (markaz) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
              <button onClick={() => handleWater(0)} disabled={!waterReady}
                style={{ width: "100%", padding: "13px 0", borderRadius: 16, border: "none", background: waterReady ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: waterReady ? "pointer" : "not-allowed", boxShadow: waterReady ? "0 4px 15px rgba(14,165,233,0.5)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {waterReady ? <>💧 {L("Sug'orish", "Полить", "Water")}</> : <>⏳ {fTime(waterTimer)}</>}
              </button>
              {!waterReady && coins >= 100 && (
                <button onClick={() => handleSpeedUp(0)}
                  style={{ background: "rgba(0,0,0,0.3)", border: "none", borderRadius: 10, padding: "6px 14px", color: "#fbbf24", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  🚀 {L("Tezlashtirish", "Ускорить")} <span style={{ color: "#fff" }}>-100🪙</span>
                </button>
              )}
              {sunTimer !== null && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
                  ☀️ {L("Keyingi quyosh", "Следующее солнце")}: {fTime(sunTimer)}
                </div>
              )}
            </div>

            {/* Suv idishi (o'ng) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div onClick={() => !waterReady && null} style={{ width: 54, height: 54, borderRadius: "50%", background: waterReady ? "linear-gradient(145deg, #0ea5e9, #0284c7)" : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: waterReady ? "0 4px 12px rgba(14,165,233,0.5)" : "none", border: "3px solid " + (waterReady ? "#38bdf8" : "rgba(255,255,255,0.3)"), position: "relative" }}>
                <span style={{ fontSize: 24 }}>🫗</span>
                {waterReady && <div style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff" }} />}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: waterReady ? "#7dd3fc" : "rgba(255,255,255,0.5)" }}>
                {waterReady ? L("Tayyor", "Готово") : fTime(waterTimer)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ma'lumot modali ── */}
      {showInfo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowInfo(false)}>
          <div style={{ background: "#fff", borderRadius: "28px 28px 0 0", padding: "24px 22px 36px", width: "100%", maxWidth: 480, margin: "0 auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#111", textAlign: "center", marginBottom: 16 }}>
              🪙 {L("Tanga qanday olinadi?", "Как получить монеты?")}
            </div>
            {[
              { ico: "💸", txt: L("Xarajat kiritish", "Добавить расход"), val: "1🪙" },
              { ico: "💰", txt: L("Daromad kiritish", "Добавить доход"), val: "1🪙" },
              { ico: "📷", txt: L("QR kod skanerlash", "Сканировать QR"), val: "2🪙" },
              { ico: "✅", txt: L("Bola vazifasini bajarish", "Выполнить задание"), val: "3🪙" },
              { ico: "🎯", txt: L("Maqsadga yetish", "Достичь цели"), val: "10🪙" },
              { ico: "☀️", txt: L("Quyosh yig'ish (o'sgan daraxtdan)", "Собирать солнце"), val: "10🪙" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < 5 ? "1px solid #f3f4f6" : "none" }}>
                <span style={{ fontSize: 22, width: 30, textAlign: "center" }}>{item.ico}</span>
                <span style={{ flex: 1, fontSize: 14, color: "#444" }}>{item.txt}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#f59e0b", background: "#fef3c7", borderRadius: 10, padding: "3px 10px" }}>{item.val}</span>
              </div>
            ))}
            <div style={{ margin: "14px 0 0", padding: "12px 14px", background: "#eff6ff", borderRadius: 14, fontSize: 13, color: "#1d4ed8", lineHeight: 1.7 }}>
              💧 {L("Suv idishi 2 soatda to'ladi. Har 3 marta sug'OriShda o'simlik o'sadi. O'sgan daraxt ☀️ quyosh hosil qiladi — uni yig'ing!", "Лейка наполняется за 2 часа. Каждые 3 полива — растение растёт. Взрослое дерево производит ☀️ — собирайте их!")}
            </div>
            <button onClick={() => setShowInfo(false)} style={{ width: "100%", marginTop: 14, padding: "15px", background: "#22c55e", border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
