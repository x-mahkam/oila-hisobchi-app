// ═══════════════════════════════════════════════════════════
//  DIVISION GAME WITH DYNAMIC LEVEL MAP & AUDIO SYNTHESIS
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE, MOTION } from "../../utils/tokens.js";
import { useGameEngine } from "../engine/useGameEngine.js";
import { divisionGenerator } from "./generators/division.js";
import { addCoins, logGameSession, bestForGame, readSessions, readCoins, readLevelProgress, saveLevelProgress } from "../engine/persist.js";
import { addXp, readXp, levelFor, didLevelUp } from "../engine/xp.js";
import { DIFF, rewardOf, tierFor, medalSvg } from "../registry.jsx";
import { GAME_LEVELS } from "./levels.js";
import { playSound, isSoundEnabled, setSoundEnabled } from "../engine/sound.js";

// Inject required animations for shake, pulse, pop, fly, float and glows
const CSS_ID = "bilim-game-css";
const injectCss = () => {
  if (typeof document === "undefined" || document.getElementById(CSS_ID)) return;
  const st = document.createElement("style");
  st.id = CSS_ID;
  st.textContent = `
@keyframes bgPulse{0%{transform:scale(1)}40%{transform:scale(1.06)}100%{transform:scale(1)}}
@keyframes bgShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes bgFly{0%{opacity:0;transform:translateY(0) scale(.8)}20%{opacity:1}100%{opacity:0;transform:translateY(-70px) scale(1.2)}}
@keyframes bgPop{0%{opacity:0;transform:scale(.9)}100%{opacity:1;transform:scale(1)}}
@keyframes floatSymbol1{0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-15px) rotate(15deg)}}
@keyframes floatSymbol2{0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(15px) rotate(-15deg)}}
@keyframes activeNodePulse{0%{transform:scale(0.9);opacity:1}100%{transform:scale(1.5);opacity:0}}
@keyframes bounceArrow{0%,100%{transform:translate(-50%, 0)}50%{transform:translate(-50%, -8px)}}
@keyframes floatNode{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

.bg-pulse{animation:bgPulse .5s ease}
.bg-shake{animation:bgShake .4s ease}
.bg-fly{animation:bgFly 1s ease forwards}
.bg-pop{animation:bgPop .25s ease}
.float-symbol-1{animation:floatSymbol1 5s ease-in-out infinite}
.float-symbol-2{animation:floatSymbol2 6s ease-in-out infinite}
.float-symbol-3{animation:floatSymbol1 7s ease-in-out infinite}
.float-symbol-4{animation:floatSymbol2 5.5s ease-in-out infinite}
.active-node-pulse{animation:activeNodePulse 2s infinite ease-out}
.next-up-arrow{animation:bounceArrow 1.2s infinite ease-in-out}
.node-float{animation:floatNode 4s ease-in-out infinite}
.math-grid{
  background-size: 28px 28px;
  background-image: radial-gradient(circle, rgba(99, 102, 241, 0.16) 1.5px, transparent 1.5px);
}
.node-hover{
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.25s, box-shadow 0.25s !important;
}
.node-hover:hover{
  transform: scale(1.18) translateY(-5px) !important;
  filter: brightness(1.1);
  box-shadow: 0 10px 24px rgba(99,102,241,0.4) !important;
}
@media (prefers-reduced-motion:reduce){.bg-pulse,.bg-shake,.bg-fly,.bg-pop,.float-symbol-1,.float-symbol-2,.float-symbol-3,.float-symbol-4,.active-node-pulse,.next-up-arrow,.node-float{animation-duration:1ms}}
`;
  document.head.appendChild(st);
};

const coinIco = (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".2"/><path d="M10 7v6M8 10h4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;

// Star SVG helper
const starIco = (filled, s = 14) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? PREMIUM.gold : "none"} stroke={filled ? PREMIUM.gold : "#9ca3af"} strokeWidth="1.5" style={{ margin: "0 1px" }}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// Lock icon SVG helper
const lockIco = (color, s = 14) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Audio toggle button icon
const soundIco = (enabled, color, s = 18) => (
  enabled ? (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  ) : (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  )
);

const OptButton = memo(function OptButton({ th, value, state, onPick, disabled }) {
  const bg = state === "correct" ? th.gr : state === "wrong" ? th.rd : th.sur;
  const bd = state === "correct" ? th.gr : state === "wrong" ? th.rd : th.bor;
  const col = state === "correct" || state === "wrong" ? "#fff" : th.t1;
  const cls = state === "correct" ? "bg-pulse" : state === "wrong" ? "bg-shake" : "";
  return (
    <button className={"ui-press " + cls} onClick={() => onPick(value)} disabled={disabled}
      style={{ background: bg, border: "2px solid " + bd, borderRadius: RADIUS.m, padding: SPACE.s4 + "px", cursor: disabled ? "default" : "pointer", fontFamily: "inherit", opacity: state === "muted" ? 0.5 : 1, transition: "background " + MOTION.fast + ", border-color " + MOTION.fast, boxShadow: SHADOW.e0 }}>
      <span style={{ fontSize: 26, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</span>
    </button>
  );
});

export default function DivisionGame({ user, lg = "uz", dark, gameId = "math/division", name, onBack }) {
  const { t } = useApp();
  const th = dark ? PALETTE.dark : PALETTE.light;
  const kidName = name || (user && (user.ism || "")) || "";

  // Level Map & Sound Settings States
  const [userLevels, setUserLevels] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled());
  const [totalCoins, setTotalCoins] = useState(0);

  // Dynamic config for engine based on level
  const [lvlQuestionCount, setLvlQuestionCount] = useState(5);
  const [lvlStartDifficulty, setLvlStartDifficulty] = useState("easy");

  const eng = useGameEngine({
    questionCount: lvlQuestionCount,
    generator: divisionGenerator,
    startDifficulty: lvlStartDifficulty,
    name: kidName,
    lg,
    rewards: rewardOf("math"),
  });

  const [count, setCount] = useState(3);           // countdown 3-2-1
  const [picked, setPicked] = useState(null);      // tanlangan variant (feedback)
  const [feed, setFeed] = useState(null);          // "correct" | "wrong"
  const [flies, setFlies] = useState([]);          // uchuvchi coinlar
  const [saved, setSaved] = useState(false);
  const [record, setRecord] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const savingRef = useRef(false);

  // Celebration states
  const [prevDiff, setPrevDiff] = useState(eng.difficulty);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => { injectCss(); }, []);

  // Fetch Level progress & coins on mount
  useEffect(() => {
    if (user?.id) {
      readLevelProgress(user.id).then(res => {
        setUserLevels(res[gameId] || {});
      });
      readCoins(user.id).then(setTotalCoins);
    }
  }, [user?.id, gameId]);

  // Monitor difficulty increase
  useEffect(() => {
    if (eng.phase === "play" && eng.difficulty !== prevDiff) {
      const order = { easy: 1, medium: 2, hard: 3 };
      if (order[eng.difficulty] > order[prevDiff]) {
        setShowCelebration(true);
        playSound.upgrade();
        const timer = setTimeout(() => setShowCelebration(false), 1500);
        return () => clearTimeout(timer);
      }
      setPrevDiff(eng.difficulty);
    }
  }, [eng.difficulty, prevDiff, eng.phase]);

  useEffect(() => {
    if (eng.phase === "play") {
      setPrevDiff(eng.difficulty);
    }
  }, [eng.phase]);

  // Countdown loop
  useEffect(() => {
    if (eng.phase !== "countdown") return;
    setCount(3);
    let n = 3;
    const iv = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(iv);
        eng.beginPlay();
      } else setCount(n);
    }, 800);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eng.phase]);

  // Reset feedback on new question
  useEffect(() => {
    setPicked(null);
    setFeed(null);
  }, [eng.qIndex, eng.question]);

  // Handle game end & save progress
  useEffect(() => {
    if (eng.phase !== "result" || !eng.result || savingRef.current || !user?.id) return;
    savingRef.current = true;
    (async () => {
      const prevBest = await bestForGame(user.id, gameId);
      const beforeXp = await readXp(user.id);
      
      const sessions = await readSessions(user.id);
      const todayStr = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      })();
      const timesPlayedToday = sessions.filter(s => s && s.date === todayStr && s.gameId === gameId).length;
      
      let multiplier = 1.0;
      if (timesPlayedToday === 1) multiplier = 0.6;       // 2nd play: 60%
      else if (timesPlayedToday === 2) multiplier = 0.3;  // 3rd play: 30%
      else if (timesPlayedToday >= 3) multiplier = 0.1;   // 4th+ play: 10%
      
      const finalCoins = Math.max(1, Math.round(eng.result.coins * multiplier));
      eng.result.coins = finalCoins; 
      
      let isNewHigh = false;
      if (eng.result.stars > 0) {
        if (!prevBest || eng.result.stars > prevBest.stars) {
          isNewHigh = true;
        }
      }
      setRecord(isNewHigh);

      // Save level stars to progress map
      if (selectedLevel) {
        const curProgress = userLevels[selectedLevel.id] || { stars: 0 };
        if (eng.result.stars > curProgress.stars) {
          const updated = {
            ...userLevels,
            [selectedLevel.id]: {
              stars: eng.result.stars,
              date: new Date().toISOString(),
              score: eng.result.score
            }
          };
          await saveLevelProgress(user.id, gameId, updated);
          setUserLevels(updated);
        }
      }

      await logGameSession(user.id, gameId, {
        coins: eng.result.coins,
        xp: eng.result.xp,
        score: eng.result.score,
        correct: eng.result.correct,
        total: eng.result.total,
        stars: eng.result.stars,
        difficulty: eng.difficulty,
        levelId: selectedLevel?.id || 1,
      });

      if (eng.result.coins > 0) {
        await addCoins(user.id, eng.result.coins);
      }
      if (eng.result.xp > 0) {
        await addXp(user.id, eng.result.xp);
        const afterXp = beforeXp + eng.result.xp;
        const oldLvl = levelFor(beforeXp);
        const newLvl = levelFor(afterXp);
        if (newLvl > oldLvl) {
          setLeveledUp(true);
          setNewLevel(newLvl);
          playSound.levelUp();
        }
      }

      setSaved(true);
      if (eng.result.stars >= 1) playSound.win();
      else playSound.lose();
    })();
  }, [eng.phase, eng.result, user?.id, gameId, selectedLevel, userLevels]);

  const handlePick = (val) => {
    if (picked !== null) return;
    setPicked(val);
    const isCorrect = eng.submitAnswer(val);
    setFeed(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      playSound.correct();
      // Flying coin effects
      const arr = [];
      for (let i = 0; i < 4; i++) {
        arr.push({ id: Math.random(), left: 40 + Math.random() * 20 });
      }
      setFlies(arr);
      setTimeout(() => setFlies([]), 1000);
    } else {
      playSound.wrong();
    }
  };

  const toggleSound = () => {
    const nv = !soundEnabled;
    setSoundEnabled(nv);
    setSoundEnabledState(nv);
  };

  // Levels list from configuration
  const levels = GAME_LEVELS[gameId] || [];
  
  // Find highest unlocked level
  let highestUnlockedLvlId = 1;
  levels.forEach(lvl => {
    if (lvl.id === 1) return;
    const prevLvl = levels.find(l => l.id === lvl.id - 1);
    const prevProgress = userLevels[prevLvl?.id];
    if (prevProgress && prevProgress.stars >= 1) {
      highestUnlockedLvlId = lvl.id;
    }
  });

  const startSelectedLevel = (lvl) => {
    setSelectedLevel(lvl);
    setLvlQuestionCount(lvl.questionCount);
    setLvlStartDifficulty(lvl.difficulty);
    setSaved(false);
    setRecord(false);
    setLeveledUp(false);
    savingRef.current = false;
    eng.start(lvl.questionCount, lvl.difficulty, lvl.passThreshold);
  };

  // Render Map phase
  if (eng.phase === "intro") {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: `${SPACE.s4}px ${SPACE.s4}px ${SPACE.s12}px ${SPACE.s4}px`, minHeight: "100vh" }}>
        {/* Top Navbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACE.s5 }}>
          <button className="ui-press" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: th.t2, fontSize: 16, fontWeight: 700, cursor: "pointer", padding: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            {t("gam_div_back")}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
            {/* Audio Toggle */}
            <button className="ui-press" onClick={toggleSound} style={{ background: th.sur, border: `2.5px solid ${th.bor}`, width: 42, height: 42, borderRadius: RADIUS.m, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {soundIco(soundEnabled, th.t2, 20)}
            </button>

            {/* Kid's coins bag */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: th.sur, border: `2.5px solid ${th.bor}`, padding: "6px 14px", borderRadius: RADIUS.full, boxShadow: SHADOW.e0 }}>
              {coinIco(PREMIUM.gold, 22)}
              <span style={{ fontSize: 18, fontWeight: 900, color: PREMIUM.gold, fontVariantNumeric: "tabular-nums" }}>{totalCoins}</span>
            </div>
          </div>
        </div>

        {/* Level Path Way Card wrapper with kids design & math-themed background */}
        <div className="math-grid" style={{
          position: "relative",
          margin: `${SPACE.s6}px 0`,
          padding: `${SPACE.s6}px 0 ${SPACE.s8}px 0`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: dark ? "linear-gradient(180deg, #111029 0%, #1c1a40 50%, #0e0d21 100%)" : "linear-gradient(180deg, #eef7ff 0%, #edfbf2 50%, #fff6ed 100%)",
          border: `3px dashed ${th.ac}33`,
          borderRadius: RADIUS.xl,
          boxShadow: dark ? "inset 0 0 40px rgba(99,102,241,0.25)" : `inset 0 0 24px ${th.ac}0d`,
          overflow: "hidden"
        }}>
          {/* Colorful glow orbs for beautiful depth and vibrancy */}
          <div style={{ position: "absolute", top: "5%", left: "-10%", width: 150, height: 150, background: "rgba(59, 130, 246, 0.22)", filter: "blur(40px)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "25%", right: "-10%", width: 160, height: 160, background: "rgba(34, 197, 94, 0.22)", filter: "blur(45px)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "45%", left: "-10%", width: 150, height: 150, background: "rgba(244, 63, 94, 0.22)", filter: "blur(40px)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "65%", right: "-10%", width: 170, height: 170, background: "rgba(168, 85, 247, 0.22)", filter: "blur(50px)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "85%", left: "-5%", width: 160, height: 160, background: "rgba(234, 179, 8, 0.22)", filter: "blur(45px)", borderRadius: "50%", pointerEvents: "none" }} />

          {/* Floating animated division symbols with vivid colors and subtle shadows */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            <div className="float-symbol-1" style={{ position: "absolute", top: "4%", left: "8%", fontSize: "34px", fontWeight: 900, color: "#06b6d4", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(6,182,212,0.3))" }}>÷</div>
            <div className="float-symbol-2" style={{ position: "absolute", top: "12%", right: "12%", fontSize: "38px", fontWeight: 900, color: "#10b981", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(16,185,129,0.3))" }}>=</div>
            <div className="float-symbol-3" style={{ position: "absolute", top: "20%", left: "14%", fontSize: "32px", fontWeight: 900, color: "#f59e0b", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(245,158,11,0.3))" }}>5</div>
            <div className="float-symbol-4" style={{ position: "absolute", top: "28%", right: "8%", fontSize: "42px", fontWeight: 900, color: "#ec4899", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(236,72,153,0.3))" }}>÷</div>
            <div className="float-symbol-1" style={{ position: "absolute", top: "38%", left: "6%", fontSize: "36px", fontWeight: 900, color: "#8b5cf6", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(139,92,246,0.3))" }}>3</div>
            <div className="float-symbol-2" style={{ position: "absolute", top: "48%", right: "14%", fontSize: "40px", fontWeight: 900, color: "#ef4444", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(239,68,68,0.3))" }}>?</div>
            <div className="float-symbol-3" style={{ position: "absolute", top: "58%", left: "10%", fontSize: "40px", fontWeight: 900, color: "#06b6d4", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(6,182,212,0.3))" }}>2</div>
            <div className="float-symbol-4" style={{ position: "absolute", top: "68%", right: "10%", fontSize: "34px", fontWeight: 900, color: "#f59e0b", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(245,158,11,0.3))" }}>÷</div>
            <div className="float-symbol-1" style={{ position: "absolute", top: "78%", left: "12%", fontSize: "38px", fontWeight: 900, color: "#10b981", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(16,185,129,0.3))" }}>4</div>
            <div className="float-symbol-2" style={{ position: "absolute", top: "88%", right: "12%", fontSize: "38px", fontWeight: 900, color: "#3b82f6", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(59,130,246,0.3))" }}>=</div>
            <div className="float-symbol-3" style={{ position: "absolute", top: "95%", left: "15%", fontSize: "36px", fontWeight: 900, color: "#ec4899", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(236,72,153,0.3))" }}>10</div>
          </div>

          {/* Map canvas container with custom serpentine path */}
          <div style={{ position: "relative", width: 300, height: levels.length * 110, zIndex: 1 }}>
            {/* SVG serpentine connecting curve */}
            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              <defs>
                <linearGradient id="divisionTrackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="30%" stopColor="#10b981" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              
              {/* Thick shadow path below */}
              <path
                d={(() => {
                  const getXVal = (i) => {
                    const xOffsets = [150, 75, 225, 150];
                    return xOffsets[i % 4];
                  };
                  const getYVal = (i) => i * 110 + 55;
                  let d = `M ${getXVal(0)} ${getYVal(0)}`;
                  for (let i = 0; i < levels.length - 1; i++) {
                    const x1 = getXVal(i);
                    const y1 = getYVal(i);
                    const x2 = getXVal(i + 1);
                    const y2 = getYVal(i + 1);
                    d += ` C ${x1} ${y1 + 55}, ${x2} ${y2 - 55}, ${x2} ${y2}`;
                  }
                  return d;
                })()}
                fill="none"
                stroke="rgba(0,0,0,0.12)"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Main colorful pathway */}
              <path
                d={(() => {
                  const getXVal = (i) => {
                    const xOffsets = [150, 75, 225, 150];
                    return xOffsets[i % 4];
                  };
                  const getYVal = (i) => i * 110 + 55;
                  let d = `M ${getXVal(0)} ${getYVal(0)}`;
                  for (let i = 0; i < levels.length - 1; i++) {
                    const x1 = getXVal(i);
                    const y1 = getYVal(i);
                    const x2 = getXVal(i + 1);
                    const y2 = getYVal(i + 1);
                    d += ` C ${x1} ${y1 + 55}, ${x2} ${y2 - 55}, ${x2} ${y2}`;
                  }
                  return d;
                })()}
                fill="none"
                stroke="url(#divisionTrackGradient)"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Internal dotted trail */}
              <path
                d={(() => {
                  const getXVal = (i) => {
                    const xOffsets = [150, 75, 225, 150];
                    return xOffsets[i % 4];
                  };
                  const getYVal = (i) => i * 110 + 55;
                  let d = `M ${getXVal(0)} ${getYVal(0)}`;
                  for (let i = 0; i < levels.length - 1; i++) {
                    const x1 = getXVal(i);
                    const y1 = getYVal(i);
                    const x2 = getXVal(i + 1);
                    const y2 = getYVal(i + 1);
                    d += ` C ${x1} ${y1 + 55}, ${x2} ${y2 - 55}, ${x2} ${y2}`;
                  }
                  return d;
                })()}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeDasharray="6 8"
                strokeLinecap="round"
                opacity="0.9"
              />
            </svg>

            {/* Render absolute level nodes along the curve */}
            {levels.map((lvl, index) => {
              const progress = userLevels[lvl.id];
              const isCompleted = progress && progress.stars >= 1;
              const isUnlocked = lvl.id === 1 || (userLevels[lvl.id - 1] && userLevels[lvl.id - 1].stars >= 1);
              const starsCount = progress ? progress.stars : 0;
              
              const getXVal = (i) => {
                const xOffsets = [150, 75, 225, 150];
                return xOffsets[i % 4];
              };
              const getYVal = (i) => i * 110 + 55;

              const posX = getXVal(index);
              const posY = getYVal(index);

              const isActive = selectedLevel?.id === lvl.id;
              const isNextUp = lvl.id === highestUnlockedLvlId;
              const nodeColor = isUnlocked ? (isCompleted ? th.gr : th.ac) : "#cbd5e1";

              return (
                <div key={lvl.id} className={isUnlocked ? "node-float" : ""} style={{
                  position: "absolute",
                  left: posX - 32,
                  top: posY - 32,
                  width: 64,
                  height: 64,
                  zIndex: 2
                }}>
                  
                  {/* Expanding glow ring behind Next Up level */}
                  {isUnlocked && isNextUp && (
                    <div className="active-node-pulse" style={{
                      position: "absolute",
                      top: -4,
                      left: -4,
                      width: 72,
                      height: 72,
                      borderRadius: RADIUS.full,
                      border: `4px solid ${th.ac}`,
                      pointerEvents: "none"
                    }} />
                  )}

                  {/* Cute Bouncy "O'YNA!" Play flag above Next Up level */}
                  {isUnlocked && isNextUp && (
                    <div className="next-up-arrow" style={{
                      position: "absolute",
                      top: -28,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      pointerEvents: "none",
                      zIndex: 10
                    }}>
                      <div style={{
                        background: PREMIUM.gold,
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 900,
                        padding: "2px 8px",
                        borderRadius: RADIUS.s,
                        boxShadow: "0 4px 8px rgba(234,179,8,0.4)",
                        whiteSpace: "nowrap",
                        border: "1px solid rgba(255,255,255,0.3)"
                      }}>
                        {t("gam_playBadge")}
                      </div>
                      <div style={{
                        width: 0,
                        height: 0,
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: `5px solid ${PREMIUM.gold}`
                      }} />
                    </div>
                  )}

                  <button className="ui-press bg-pop node-hover"
                    onClick={() => isUnlocked && setSelectedLevel(lvl)}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: RADIUS.full,
                      background: isActive ? th.ac2 : (isUnlocked ? th.sur : th.bor),
                      border: `4px solid ${isActive ? th.ac : nodeColor}`,
                      boxShadow: isActive 
                        ? `0 0 20px ${th.ac}` 
                        : (isUnlocked 
                          ? `0 6px 16px ${nodeColor}66, inset 0 -4px 0 rgba(0,0,0,0.1)` 
                          : "0 4px 8px rgba(0,0,0,0.05)"),
                      cursor: isUnlocked ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      padding: 0
                    }}
                  >
                    {isUnlocked ? (
                      <span style={{ fontSize: 22, fontWeight: 900, color: isActive ? "#fff" : th.t1, textShadow: isActive ? "0 1px 3px rgba(0,0,0,0.15)" : "none" }}>{lvl.id}</span>
                    ) : (
                      lockIco(th.t3, 20)
                    )}

                    {/* Star icons aligned beautifully under bubble */}
                    {isUnlocked && (
                      <div style={{ position: "absolute", bottom: -12, display: "flex", justifyContent: "center", width: "100%", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}>
                        {starIco(starsCount >= 1, 12)}
                        {starIco(starsCount >= 2, 12)}
                        {starIco(starsCount >= 3, 12)}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected level bottom popup details sheet */}
        {selectedLevel && (
          <div className="bg-pop" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: th.sur, borderTop: "2px solid " + th.bor, borderTopLeftRadius: RADIUS.l, borderTopRightRadius: RADIUS.l, padding: SPACE.s4, boxShadow: "0 -4px 20px rgba(0,0,0,0.15)", zIndex: 100 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACE.s3 }}>
              <div>
                <h3 style={{ ...TYPE.title, color: th.t1, margin: 0 }}>
                  {t("gam_levelN", { n: selectedLevel.id })}
                </h3>
                <p style={{ ...TYPE.caption, color: th.t2, margin: "2px 0 0" }}>
                  {t("gam_difficulty")}: <span style={{ fontWeight: 700, color: selectedLevel.difficulty === "easy" ? th.gr : selectedLevel.difficulty === "medium" ? th.am : th.rd }}>{DIFF[selectedLevel.difficulty]?.[lg] || DIFF[selectedLevel.difficulty]?.uz}</span>
                </p>
              </div>
              <button className="ui-press" onClick={() => setSelectedLevel(null)} style={{ border: "none", background: "none", fontSize: 24, fontWeight: "bold", color: th.t3, cursor: "pointer" }}>×</button>
            </div>

            <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
              <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>{selectedLevel.questionCount}</div>
                <div style={{ ...TYPE.tiny, color: th.t2 }}>{t("gam_questions")}</div>
              </div>
              <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>{selectedLevel.passThreshold}%</div>
                <div style={{ ...TYPE.tiny, color: th.t2 }}>{t("gam_passLimit")}</div>
              </div>
              <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>
                  {userLevels[selectedLevel.id]?.stars || 0}/3
                </div>
                <div style={{ ...TYPE.tiny, color: th.t2 }}>{t("gam_stars")}</div>
              </div>
            </div>

            <PrimaryButton text={t("bd_startLabel")} onClick={() => startSelectedLevel(selectedLevel)} />
          </div>
        )}
      </div>
    );
  }

  // Render Countdown state
  if (eng.phase === "countdown") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", background: th.bg }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: th.t2, marginBottom: SPACE.s6, textTransform: "uppercase", letterSpacing: 1.5 }}>
          {t("gam_div_areYouReady")}
        </div>
        <div style={{ width: 140, height: 140, borderRadius: "50%", background: th.ac2, display: "flex", alignItems: "center", justifyContent: "center", border: `6px solid ${th.ac}`, boxShadow: `0 10px 30px ${th.ac}33` }}>
          <span className="bg-pulse" style={{ fontSize: 72, fontWeight: 900, color: th.ac }}>{count}</span>
        </div>
      </div>
    );
  }

  // Render Playing state
  if (eng.phase === "play" && eng.question) {
    const q = eng.question;
    const isAnswered = picked !== null;

    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: SPACE.s4 }}>
        {/* Play Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACE.s4 }}>
          <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t2 }}>
            {t("gam_div_question")} {eng.qIndex + 1} / {eng.totalQuestions}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge text={`${eng.difficulty.toUpperCase()}`} theme={eng.difficulty === "easy" ? "success" : eng.difficulty === "medium" ? "warning" : "danger"} />
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: th.sur, border: `1.5px solid ${th.bor}`, padding: "3px 10px", borderRadius: RADIUS.full }}>
              {coinIco(PREMIUM.gold, 14)}
              <span style={{ fontSize: 13, fontWeight: 800, color: PREMIUM.gold, fontVariantNumeric: "tabular-nums" }}>{eng.score}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        <div style={{ height: 10, background: th.bor, borderRadius: RADIUS.full, marginBottom: SPACE.s8, overflow: "hidden" }}>
          <div style={{ width: `${((eng.qIndex) / eng.totalQuestions) * 100}%`, height: "100%", background: th.ac, borderRadius: RADIUS.full, transition: "width " + MOTION.normal }} />
        </div>

        {/* Question Board Card */}
        <AppCard style={{ padding: `${SPACE.s4}px ${SPACE.s3}px`, textAlign: "center", marginBottom: SPACE.s4, background: th.sur, border: `2.5px solid ${isAnswered ? (feed === "correct" ? th.gr : th.rd) : th.bor}`, position: "relative" }}>
          {/* Flying coin particles for positive actions */}
          {flies.map(fl => (
            <div key={fl.id} className="bg-fly" style={{ position: "absolute", bottom: "30%", left: `${fl.left}%`, zIndex: 5 }}>
              {coinIco(PREMIUM.gold, 24)}
            </div>
          ))}

          {/* Upgrade celebration layer */}
          {showCelebration && (
            <div className="bg-pop" style={{ position: "absolute", inset: 0, background: "rgba(16,185,129,0.92)", borderRadius: RADIUS.m, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
              <div style={{ fontSize: 44, marginBottom: 4 }}>🚀</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
                {t("gam_div_levelUpBanner")}
              </div>
            </div>
          )}

          <div style={{ fontSize: 15, color: th.t3, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: SPACE.s1 }}>
            {t("gam_div_solveEquation")}
          </div>
          
          {/* Math Equation Formula Displays */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ fontSize: 44, fontWeight: 900, color: th.t1, fontVariantNumeric: "tabular-nums" }}>{q.prompt}</span>
          </div>
        </AppCard>

        {/* Options grid (2x2 layout) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s4, marginBottom: SPACE.s8 }}>
          {q.options.map(opt => {
            let state = "idle";
            if (isAnswered) {
              if (opt === q.answer) state = "correct";
              else if (picked === opt) state = "wrong";
              else state = "muted";
            }
            return (
              <OptButton key={opt} th={th} value={opt} state={state} onPick={handlePick} disabled={isAnswered} />
            );
          })}
        </div>

        {/* Action triggers */}
        <div style={{ textAlign: "center" }}>
          {isAnswered && (
            <PrimaryButton 
              text={eng.qIndex + 1 < eng.totalQuestions ? t("gam_div_nextQuestion") : t("gam_div_viewResults")} 
              onClick={eng.nextQuestion} 
              theme="primary"
            />
          )}
        </div>
      </div>
    );
  }

  // Render Result / Congratulations summary sheet
  if (eng.phase === "result" && eng.result) {
    const res = eng.result;
    const passed = res.stars >= 1;

    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: `${SPACE.s6}px ${SPACE.s4}px ${SPACE.s12}px ${SPACE.s4}px`, textAlign: "center" }}>
        
        {/* Level Up alert popup layer */}
        {leveledUp && (
          <div className="bg-pop" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", padding: `${SPACE.s4}px ${SPACE.s5}px`, borderRadius: RADIUS.l, color: "#fff", marginBottom: SPACE.s6, border: "2px solid rgba(255,255,255,0.2)", boxShadow: SHADOW.e4, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 48 }}>👑</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                {t("gam_div_newLevelTitle")}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                {t("gam_div_congratsLevel", { level: newLevel })}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", margin: `${SPACE.s6}px 0` }}>
          {medalSvg(passed ? (res.stars === 3 ? "gold" : res.stars === 2 ? "silver" : "bronze") : "none", 140)}
        </div>

        <h2 style={{ ...TYPE.display, fontSize: 34, color: passed ? th.gr : th.rd, margin: "0 0 4px" }}>
          {passed ? t("gam_div_excellentJob") : t("gam_div_tryOnceMore")}
        </h2>
        <p style={{ ...TYPE.body, color: th.t2, margin: `0 0 ${SPACE.s6}px` }}>
          {passed ? t("gam_div_levelCompleted") : t("gam_div_neededPct", { pct: selectedLevel?.passThreshold })}
        </p>

        {/* Stars Display Block */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: SPACE.s8, background: th.sur, border: `2px solid ${th.bor}`, padding: "12px 24px", borderRadius: RADIUS.xl, width: "fit-content", margin: "0 auto " + SPACE.s8 + "px" }}>
          {starIco(res.stars >= 1, 38)}
          {starIco(res.stars >= 2, 38)}
          {starIco(res.stars >= 3, 38)}
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s4, marginBottom: SPACE.s8 }}>
          <StatCard label={t("gam_div_correctSolutions")} val={`${res.correct} / ${res.total}`} sub={t("gam_div_solvedQuestions")} theme="success" />
          <StatCard label={t("gam_div_coinsRewarded")} val={`+${res.coins}`} icon={coinIco(PREMIUM.gold, 18)} sub={t("gam_div_awarded")} theme="warning" />
          <StatCard label={t("gam_div_xpGained")} val={`+${res.xp}`} sub={t("gam_div_experiencePoints")} theme="accent" />
          <StatCard label={t("gam_div_accuracy")} val={`${Math.round((res.correct/res.total)*100)}%`} sub={t("gam_div_totalScore")} theme={passed ? "success" : "danger"} />
        </div>

        {/* Play actions triggers */}
        <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
          {passed ? (
            <PrimaryButton 
              text={t("gam_div_nextLevelBtn")} 
              onClick={() => {
                const nextLvl = levels.find(l => l.id === (selectedLevel?.id || 0) + 1);
                if (nextLvl) {
                  startSelectedLevel(nextLvl);
                } else {
                  setSelectedLevel(null);
                  eng.backToIntro();
                }
              }} 
            />
          ) : (
            <PrimaryButton text={t("gam_div_retry")} onClick={() => startSelectedLevel(selectedLevel)} />
          )}

          <button className="ui-press" onClick={() => { setSelectedLevel(null); eng.backToIntro(); }}
            style={{ width: "100%", background: "none", border: `2.5px solid ${th.bor}`, borderRadius: RADIUS.l, padding: "14px", color: th.t2, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all " + MOTION.fast }}>
            {t("gam_backToMap")}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
