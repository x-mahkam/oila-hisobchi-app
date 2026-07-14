// ═══════════════════════════════════════════════════════════
//  ADDITION GAME WITH DYNAMIC LEVEL MAP & AUDIO SYNTHESIS
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE, MOTION } from "../../utils/tokens.js";
import { useGameEngine } from "../engine/useGameEngine.js";
import { additionGenerator } from "./generators/addition.js";
import { translateMathString } from "../../utils/formatters.js";
import { addCoins, logGameSession, bestForGame, readSessions, readCoins, readLevelProgress, saveLevelProgress } from "../engine/persist.js";
import { addXp, readXp, levelFor, didLevelUp } from "../engine/xp.js";
import { DIFF, rewardOf, tierFor, medalSvg } from "../registry.jsx";
import { starsFor } from "./levels/mathLevels.js";
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

const OptButton = memo(function OptButton({ th, value, state, onPick, disabled, lg = "uz" }) {
  const bg = state === "correct" ? th.gr : state === "wrong" ? th.rd : th.sur;
  const bd = state === "correct" ? th.gr : state === "wrong" ? th.rd : th.bor;
  const col = state === "correct" || state === "wrong" ? "#fff" : th.t1;
  const cls = state === "correct" ? "bg-pulse" : state === "wrong" ? "bg-shake" : "";
  const displayVal = translateMathString(value, lg);
  return (
    <button className={"ui-press " + cls} onClick={() => onPick(value)} disabled={disabled}
      style={{ 
        background: bg, 
        border: "2px solid " + bd, 
        borderRadius: RADIUS.m, 
        padding: SPACE.s4 + "px", 
        cursor: disabled ? "default" : "pointer", 
        fontFamily: "inherit", 
        opacity: state === "muted" ? 0.5 : 1, 
        transition: "background " + MOTION.fast + ", border-color " + MOTION.fast, 
        boxShadow: SHADOW.e0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "72px"
      }}>
      <span style={{ 
        fontSize: typeof displayVal === "string" && displayVal.length > 10 ? 15 : (typeof displayVal === "string" && displayVal.length > 7 ? 18 : 24), 
        fontWeight: 800, 
        color: col, 
        fontVariantNumeric: "tabular-nums", 
        lineHeight: 1.2,
        wordBreak: "break-word"
      }}>{displayVal}</span>
    </button>
  );
});

export default function AdditionGame({ user, lg = "uz", dark, gameId = "math/addition", name, onBack, level }) {
  const th = dark ? PALETTE.dark : PALETTE.light;
  const uz = lg === "uz";
  const kidName = name || (user && (user.ism || "")) || "";

  // Level Map & Sound Settings States
  const [userLevels, setUserLevels] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled());
  const [totalCoins, setTotalCoins] = useState(0);

  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [showHintOverlay, setShowHintOverlay] = useState(false);

  const activeLevel = level || selectedLevel;

  // Dynamic config for engine based on level
  const [lvlQuestionCount, setLvlQuestionCount] = useState(level ? level.questionCount : 5);
  const [lvlStartDifficulty, setLvlStartDifficulty] = useState(level ? level.difficulty : "easy");

  const eng = useGameEngine({
    questionCount: lvlQuestionCount,
    generator: additionGenerator,
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
        setUserLevels(res["math"] || {});
      });
      readCoins(user.id).then(setTotalCoins);
    }
  }, [user?.id]);

  useEffect(() => {
    if (level) {
      startLevel(level);
    }
  }, [level]);

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
      
      const updatedCoins = await addCoins(user.id, finalCoins);
      setTotalCoins(updatedCoins);
      const afterXp = await addXp(user.id, eng.result.xp || 0);
      const isRec = finalCoins > prevBest;
      const lvlUp = didLevelUp(beforeXp, afterXp);

      // Determine level stars
      let stars = 0;
      if (activeLevel) {
        stars = starsFor(eng.result.pct, activeLevel.passPct);
      }

      // Play victory sound
      if (stars > 0) {
        playSound.victory();
        // Save level progress to DB
        const nextLevels = await saveLevelProgress(user.id, "math", activeLevel.id, stars);
        setUserLevels(nextLevels["math"] || {});
      } else {
        playSound.wrong();
      }

      await logGameSession(user.id, {
        gameId, subject: "math", correct: eng.result.correct, total: eng.result.total, pct: eng.result.pct,
        seconds: eng.result.seconds, maxCombo: eng.result.maxCombo, coins: finalCoins,
        xp: eng.result.xp || 0, difficulty: eng.result.difficulty, newRecord: isRec,
        levelId: selectedLevel?.id || 1, starsEarned: stars,
      });

      setRecord(isRec);
      setLeveledUp(lvlUp);
      setNewLevel(levelFor(afterXp).level);
      setSaved(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eng.phase, eng.result]);

  const spawnFly = useCallback((amount) => {
    const id = Date.now() + Math.random();
    setFlies(p => [...p, { id, amount }]);
    setTimeout(() => setFlies(p => p.filter(f => f.id !== id)), 1000);
  }, []);

  const onPick = useCallback((value) => {
    if (picked != null) return;
    setPicked(value);
    eng.answer(value, (correct, gained) => {
      setFeed(correct ? "correct" : "wrong");
      if (correct) {
        playSound.correct();
        setConsecutiveErrors(0);
        setShowHintOverlay(false);
        if (gained > 0) spawnFly(gained);
      } else {
        playSound.wrong();
        setConsecutiveErrors(prev => {
          const next = prev + 1;
          if (next >= 2) {
            setShowHintOverlay(true);
          }
          return next;
        });
      }
    });
  }, [picked, eng, spawnFly]);

  const optState = (opt) => {
    if (picked == null || !eng.question) return null;
    if (opt === eng.question.answer) return "correct";
    if (opt === picked) return "wrong";
    return "muted";
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    setSoundEnabledState(nextVal);
  };

  const startLevel = (lvl) => {
    savingRef.current = false;
    setSaved(false);
    setLvlQuestionCount(lvl.questionCount);
    setLvlStartDifficulty(lvl.difficulty);
    // Start engine using timeout to allow state synchronization
    setTimeout(() => {
      eng.start();
    }, 100);
  };

  const levels = GAME_LEVELS[gameId] || GAME_LEVELS["math/addition"];

  // ═══ INTRO / MAP ═══
  if (eng.phase === "intro") {
    // Find the current active/highest unlocked level to play next
    const highestUnlockedLvlId = levels.reduce((max, lvl) => {
      const isUnlocked = lvl.id === 1 || (userLevels[lvl.id - 1] && userLevels[lvl.id - 1].stars >= 1);
      return isUnlocked ? Math.max(max, lvl.id) : max;
    }, 1);

    return (
      <div style={{ paddingBottom: SPACE.s8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <PageHeader th={th} title={uz ? "Qo'shish xaritasi" : lg === "ru" ? "Карта сложения" : "Addition Map"} onBack={onBack} />
          <button className="ui-press" onClick={toggleSound}
            style={{ border: "none", background: "rgba(255,255,255,0.06)", borderRadius: RADIUS.full, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {soundIco(soundEnabled, th.t2, 20)}
          </button>
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

          {/* Floating animated math symbols with vivid colors and subtle shadows */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            <div className="float-symbol-1" style={{ position: "absolute", top: "4%", left: "8%", fontSize: "34px", fontWeight: 900, color: "#3b82f6", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(59,130,246,0.3))" }}>+</div>
            <div className="float-symbol-2" style={{ position: "absolute", top: "12%", right: "12%", fontSize: "38px", fontWeight: 900, color: "#10b981", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(16,185,129,0.3))" }}>=</div>
            <div className="float-symbol-3" style={{ position: "absolute", top: "20%", left: "14%", fontSize: "32px", fontWeight: 900, color: "#f59e0b", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(245,158,11,0.3))" }}>1</div>
            <div className="float-symbol-4" style={{ position: "absolute", top: "28%", right: "8%", fontSize: "42px", fontWeight: 900, color: "#ec4899", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(236,72,153,0.3))" }}>+</div>
            <div className="float-symbol-1" style={{ position: "absolute", top: "38%", left: "6%", fontSize: "36px", fontWeight: 900, color: "#8b5cf6", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(139,92,246,0.3))" }}>3</div>
            <div className="float-symbol-2" style={{ position: "absolute", top: "48%", right: "14%", fontSize: "40px", fontWeight: 900, color: "#ef4444", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(239,68,68,0.3))" }}>?</div>
            <div className="float-symbol-3" style={{ position: "absolute", top: "58%", left: "10%", fontSize: "40px", fontWeight: 900, color: "#06b6d4", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(6,182,212,0.3))" }}>5</div>
            <div className="float-symbol-4" style={{ position: "absolute", top: "68%", right: "10%", fontSize: "34px", fontWeight: 900, color: "#f59e0b", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(245,158,11,0.3))" }}>+</div>
            <div className="float-symbol-1" style={{ position: "absolute", top: "78%", left: "12%", fontSize: "38px", fontWeight: 900, color: "#10b981", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(16,185,129,0.3))" }}>8</div>
            <div className="float-symbol-2" style={{ position: "absolute", top: "88%", right: "12%", fontSize: "38px", fontWeight: 900, color: "#3b82f6", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(59,130,246,0.3))" }}>=</div>
            <div className="float-symbol-3" style={{ position: "absolute", top: "95%", left: "15%", fontSize: "36px", fontWeight: 900, color: "#ec4899", textShadow: "0 2px 4px rgba(0,0,0,0.15)", filter: "drop-shadow(0 2px 4px rgba(236,72,153,0.3))" }}>9</div>
          </div>

          {/* Map canvas container with custom serpentine path */}
          <div style={{ position: "relative", width: 300, height: levels.length * 110, zIndex: 1 }}>
            {/* SVG serpentine connecting curve */}
            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              <defs>
                <linearGradient id="additionTrackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="30%" stopColor="#10b981" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
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
                stroke="url(#additionTrackGradient)"
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
                        {uz ? "O'YNA" : lg === "ru" ? "ИГРАТЬ" : "PLAY"}
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
                  {uz ? `${selectedLevel.id}-bosqich` : lg === "ru" ? `Уровень ${selectedLevel.id}` : `Level ${selectedLevel.id}`}
                </h3>
                <p style={{ ...TYPE.caption, color: th.t2, margin: "2px 0 0" }}>
                  {uz ? "Qiyinchilik" : "Difficulty"}: <span style={{ fontWeight: 700, color: selectedLevel.difficulty === "easy" ? th.gr : selectedLevel.difficulty === "medium" ? th.am : th.rd }}>{DIFF[selectedLevel.difficulty]?.[lg] || DIFF[selectedLevel.difficulty]?.uz}</span>
                </p>
              </div>
              <button className="ui-press" onClick={() => setSelectedLevel(null)} style={{ border: "none", background: "none", fontSize: 24, fontWeight: "bold", color: th.t3, cursor: "pointer" }}>×</button>
            </div>

            <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
              <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>{selectedLevel.questionCount}</div>
                <div style={{ ...TYPE.tiny, color: th.t2 }}>{uz ? "Savollar" : "Questions"}</div>
              </div>
              <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>{selectedLevel.passThreshold}%</div>
                <div style={{ ...TYPE.tiny, color: th.t2 }}>{uz ? "O'tish chegarasi" : "Pass limit"}</div>
              </div>
              <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>
                  {userLevels[selectedLevel.id]?.stars || 0}/3
                </div>
                <div style={{ ...TYPE.tiny, color: th.t2 }}>{uz ? "Yulduzlar" : "Stars"}</div>
              </div>
            </div>

            <PrimaryButton th={th} onClick={() => startLevel(selectedLevel)}>
              {uz ? "Bosqichni boshlash" : lg === "ru" ? "Начать уровень" : "Start Level"}
            </PrimaryButton>
          </div>
        )}
      </div>
    );
  }

  // ═══ COUNTDOWN ═══
  if (eng.phase === "countdown") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div key={count} className="bg-pop" style={{ width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW.e2 }}>
          <span style={{ fontSize: 72, fontWeight: 800, color: "#fff" }}>{count}</span>
        </div>
        <div style={{ ...TYPE.subtitle, color: th.t2, marginTop: SPACE.s6 }}>{uz ? "Tayyor bo'l!" : lg === "ru" ? "Приготовься!" : "Get ready!"}</div>
      </div>
    );
  }

  // ═══ RESULT ═══
  if (eng.phase === "result" && eng.result) {
    const r = eng.result;
    const mm = Math.floor(r.seconds / 60), ss = r.seconds % 60;
    
    // Check level passing stars
    let finalStars = 0;
    if (selectedLevel) {
      if (r.pct >= selectedLevel.passThreshold) {
        if (r.pct === 100) finalStars = 3;
        else if (r.pct >= 80) finalStars = 2;
        else finalStars = 1;
      }
    }

    return (
      <div style={{ paddingBottom: SPACE.s8 }}>
        <PageHeader th={th} title={uz ? "Natija" : lg === "ru" ? "Результат" : "Result"} onBack={() => { eng.setPhase("intro"); setSelectedLevel(null); }} />
        
        {/* Level Passed Banner / Stars Celebration */}
        <div style={{ background: "linear-gradient(135deg," + (finalStars > 0 ? th.gr : th.rd) + "," + th.ac2 + ")", borderRadius: RADIUS.l, padding: SPACE.s6 + "px " + SPACE.s4, textAlign: "center", marginBottom: SPACE.s3, boxShadow: SHADOW.e1(th.ac) }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: SPACE.s2 }}>
            {starIco(finalStars >= 1, 28)}
            {starIco(finalStars >= 2, 28)}
            {starIco(finalStars >= 3, 28)}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
            {finalStars > 0 ? (uz ? "Bosqichdan o'tdingiz!" : lg === "ru" ? "Уровень пройден!" : "Level Passed!") : (uz ? "Qayta urinib ko'ring!" : lg === "ru" ? "Попробуйте ещё раз!" : "Try Again!")}
          </div>
          <div style={{ ...TYPE.subtitle, color: "#fff", marginTop: SPACE.s1, opacity: 0.9 }}>{r.correct}/{r.total} {uz ? "to'g'ri" : lg === "ru" ? "верно" : "correct"} ({r.pct}%)</div>
          {record && <div style={{ marginTop: SPACE.s2 }}><Badge th={th} type="premium" icon={null}>{uz ? "YANGI REKORD" : lg === "ru" ? "РЕКОРД" : "NEW RECORD"}</Badge></div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatCard th={th} value={r.correct} label={uz ? "To'g'ri" : lg === "ru" ? "Верно" : "Correct"} tone={th.gr} />
          <StatCard th={th} value={r.wrong} label={uz ? "Xato" : lg === "ru" ? "Ошибки" : "Wrong"} tone={th.rd} />
          <StatCard th={th} value={(mm ? mm + "m " : "") + ss + "s"} label={uz ? "Vaqt" : lg === "ru" ? "Время" : "Time"} tone={th.ac} />
          <StatCard th={th} value={"x" + r.maxCombo} label="Combo" tone={th.am} />
        </div>

        {/* Topilgan Coin Card */}
        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, marginBottom: SPACE.s2 }}>
          {coinIco(PREMIUM.gold, 28)}
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{uz ? "Topilgan coin" : lg === "ru" ? "Монеты" : "Coins earned"}</div>
            <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>+{r.coins}</div>
          </div>
          {r.perfect && <Badge th={th} tone={PREMIUM.gold}>Perfect +{r.perfectBonus}</Badge>}
        </AppCard>

        {/* Dynamic Tier Progress Card */}
        {(() => {
          const { cur, next } = tierFor(totalCoins);
          let tierPct = 100;
          let progressText = "";
          if (next) {
            const base = cur ? cur.need : 0;
            const diff = next.need - base;
            tierPct = Math.min(100, Math.max(0, ((totalCoins - base) / diff) * 100));
            progressText = uz 
              ? `${next.need - totalCoins} coin keyingi darajaga (${next[lg] || next.uz})`
              : lg === "ru"
              ? `До следующего уровня (${next[lg] || next.uz}) осталось ${next.need - totalCoins} монет`
              : `${next.need - totalCoins} coins to next level (${next[lg] || next.uz})`;
          } else {
            progressText = uz ? "Siz afsonaviy darajadasiz!" : lg === "ru" ? "Вы на легендарном уровне!" : "You are at the Legend level!";
          }
          const tierName = cur ? cur[lg] || cur.uz : (uz ? "Boshlang'ich" : lg === "ru" ? "Новичок" : "Novice");
          const tierColor = cur ? cur.color : th.ac;
          return (
            <AppCard th={th} style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, background: th.sur, border: "1px solid " + th.bor, marginBottom: SPACE.s2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
                {medalSvg(tierColor, 28)}
                <div style={{ flex: 1 }}>
                  <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>
                    {uz ? "Sizning darajangiz" : lg === "ru" ? "Ваш уровень" : "Your Tier"}
                  </div>
                  <div style={{ ...TYPE.title, color: tierColor, fontSize: 18, fontWeight: 800 }}>
                    {tierName} ({totalCoins} {uz ? "coin" : "coins"})
                  </div>
                </div>
              </div>
              <div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: 4 }}>
                  {progressText}
                </div>
                <div style={{ height: 6, borderRadius: RADIUS.pill, background: th.bor, overflow: "hidden" }}>
                  <div style={{ width: tierPct + "%", height: "100%", background: tierColor, borderRadius: RADIUS.pill }} />
                </div>
              </div>
            </AppCard>
          );
        })()}

        {/* XP Card */}
        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: th.ac2 + ALPHA.faint, border: "1px solid " + th.ac2 + ALPHA.med, marginBottom: SPACE.s3 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.8 6 6.2.7-4.6 4.3 1.2 6.3L12 17.8 6.4 20.3l1.2-6.3L3 9.7 9.2 9 12 3z" stroke={th.ac2} strokeWidth="1.5" strokeLinejoin="round" fill={th.ac2} fillOpacity="0.2"/></svg>
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{uz ? "Tajriba (XP)" : lg === "ru" ? "Опыт (XP)" : "Experience (XP)"}</div>
            <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>+{r.xp || 0}</div>
          </div>
          {leveledUp && newLevel && <Badge th={th} type="premium" icon={null}>{uz ? "LEVEL " : "LEVEL "}{newLevel}</Badge>}
        </AppCard>

        {/* AI verdict */}
        <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med, marginBottom: SPACE.s4 }}>
          <div style={{ display: "flex", gap: SPACE.s2, alignItems: "flex-start" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10 2a5 5 0 00-3 9c.6.5 1 1 1 2h4c0-1 .4-1.5 1-2a5 5 0 00-3-9z" stroke={th.ac} strokeWidth="1.4" fill={th.ac} fillOpacity="0.15"/><path d="M8 16h4M8.5 18h3" stroke={th.ac} strokeWidth="1.4" strokeLinecap="round"/></svg>
            <div>
              <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{r.ai.verdict}</div>
              <div style={{ ...TYPE.caption, color: th.t2, marginTop: 2 }}>{r.ai.tip}</div>
            </div>
          </div>
        </AppCard>

        {activeLevel && (
          <PrimaryButton th={th} onClick={() => startLevel(activeLevel)} style={{ marginTop: SPACE.s2 }}>
            {uz ? "Qayta o'ynash" : lg === "ru" ? "Ещё раз" : "Play again"}
          </PrimaryButton>
        )}
        <button className="ui-press" onClick={() => { if (level) onBack(); else { eng.setPhase("intro"); setSelectedLevel(null); } }} style={{ width: "100%", marginTop: SPACE.s2, background: "transparent", border: "none", color: th.t2, padding: SPACE.s3, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{uz ? "Xaritaga qaytish" : lg === "ru" ? "Назад к карте" : "Back to Map"}</button>
      </div>
    );
  }

  // ═══ PLAY ═══
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column" }}>
      
      {/* Celebration Toast */}
      {showCelebration && (
        <div className="bg-pulse" style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 100,
          background: "linear-gradient(135deg," + th.gr + "," + th.ac + ")",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: RADIUS.pill,
          boxShadow: SHADOW.e3,
          display: "flex",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none"
        }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M9 1.5L3.5 9H8l-1 5.5L12.5 7H8l1-5.5z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" fill="#fff" fillOpacity=".2"/></svg>
          <span style={{ fontSize: 15, fontWeight: 800 }}>
            {uz ? "Qiyinroq darajaga o'tdingiz!" : lg === "ru" ? "Уровень повышен!" : "Difficulty increased!"}
          </span>
        </div>
      )}

      {/* Yuqori progress: Level questions */}
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, padding: SPACE.s2 + "px 0 " + SPACE.s4 }}>
        <button className="ui-press" onClick={() => { if (level) onBack(); else { eng.setPhase("intro"); setSelectedLevel(null); } }} aria-label="back" style={{ background: "transparent", border: "none", cursor: "pointer", padding: SPACE.s1, flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M13 5l-6 6 6 6" stroke={th.t2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ flex: 1, display: "flex", gap: 3 }}>
          {Array.from({ length: eng.questionCount }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 7, borderRadius: RADIUS.full, background: i < eng.qIndex ? th.gr : i === eng.qIndex ? th.ac : th.bor, transition: "background " + MOTION.fast }} />
          ))}
        </div>
        <Badge th={th} tone={{ gr: th.gr, am: th.am, rd: th.rd }[DIFF[eng.difficulty]?.tone || "gr"]}>
          {DIFF[eng.difficulty]?.[lg] || DIFF[eng.difficulty]?.uz}
        </Badge>
      </div>

      {/* Coin + combo status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACE.s4 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, ...TYPE.subtitle, color: PREMIUM.gold, fontWeight: 800 }}>{coinIco(PREMIUM.gold, 18)}{eng.score.coins}</span>
        {eng.score.combo >= 2 && <Badge th={th} type="warning">Combo x{eng.score.combo}</Badge>}
      </div>

      {/* Question Card */}
      <div style={{ position: "relative", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.l, padding: SPACE.s5 + "px " + SPACE.s4, textAlign: "center", marginBottom: SPACE.s4, boxShadow: SHADOW.e1(th.ac) }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: th.t1, fontVariantNumeric: "tabular-nums", letterSpacing: 0.5, wordBreak: "break-word" }}>
          {eng.question ? translateMathString(eng.question.prompt, lg) : ""}
        </div>
        {/* Floating flying coins */}
        {flies.map(fl => (
          <span key={fl.id} className="bg-fly" style={{ position: "absolute", top: SPACE.s3, left: "50%", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 3, ...TYPE.subtitle, fontWeight: 800, color: PREMIUM.gold, pointerEvents: "none" }}>
            {coinIco(PREMIUM.gold, 18)}+{fl.amount}
          </span>
        ))}
      </div>

      {/* Adaptive Hint Overlay */}
      {showHintOverlay && (
        <div className="bg-pop" style={{
          position: "fixed",
          bottom: 120,
          left: 16,
          right: 16,
          background: "linear-gradient(135deg, " + th.ac + ", " + th.ac2 + ")",
          border: "2px solid " + PREMIUM.gold,
          borderRadius: RADIUS.l,
          padding: SPACE.s4,
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          color: "#fff",
          zIndex: 90
        }}>
          <div style={{ display: "flex", gap: SPACE.s3, alignItems: "flex-start" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: RADIUS.full, padding: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
                {uz ? "Kichik yordam!" : lg === "ru" ? "Подсказка!" : "Quick Tip!"}
              </div>
              <p style={{ fontSize: 14, margin: 0, opacity: 0.95, lineHeight: 1.4 }}>
                {lg === "uz" ? "Yordam: Narxlarni osongina qo'shish uchun avval mingliklarni qo'shib oling, keyin so'm birligini biriktiring! (Masalan: 3 ming so'm + 4 ming so'm = 7 ming so'm)" : lg === "ru" ? "Подсказка: чтобы легко складывать цены, просто сложите тысячи! (Пример: 3 тыс. руб. + 4 тыс. руб. = 7 тыс. руб.)" : lg === "kk" ? "Кеңес: бағаларды оңай қосу үшін алдымен мыңдықтарды қосыңыз! (Мысалы: 3 мың тг. + 4 мың тг. = 7 мың тг.)" : "Tip: To add prices easily, just add the thousands! (Example: $3k + $4k = $7k)"}
              </p>
            </div>
            <button className="ui-press" onClick={() => { setShowHintOverlay(false); setConsecutiveErrors(0); }} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", fontWeight: "bold" }}>×</button>
          </div>
        </div>
      )}

      {/* Choices grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3 }}>
        {eng.question && eng.question.options.map((opt, i) => (
          <OptButton key={i} th={th} value={opt} state={optState(opt)} onPick={onPick} disabled={picked != null} lg={lg} />
        ))}
      </div>
    </div>
  );
}
