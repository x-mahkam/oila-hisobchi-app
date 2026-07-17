// ═══════════════════════════════════════════════════════════
//  MULTIPLICATION GAME WITH MATH ROADMAP & MONEY CONTEXT
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE, MOTION } from "../../utils/tokens.js";
import { useGameEngine } from "../engine/useGameEngine.js";
import { multiplyPriceGenerator } from "./generators/multiplyPrice.js";
import { translateMathString } from "../../utils/formatters.js";
import { addCoins, logGameSession, bestForGame, readSessions, readCoins, readLevelProgress, saveLevelProgress } from "../engine/persist.js";
import { addXp, readXp, levelFor, didLevelUp } from "../engine/xp.js";
import { DIFF, rewardOf, tierFor, medalSvg } from "../registry.jsx";
import { starsFor } from "./levels/mathLevels.js";
import { playSound, isSoundEnabled, setSoundEnabled } from "../engine/sound.js";

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

.bg-pulse{animation:bgPulse .5s ease}
.bg-shake{animation:bgShake .4s ease}
.bg-fly{animation:bgFly 1s ease forwards}
.bg-pop{animation:bgPop .25s ease}
`;
  document.head.appendChild(st);
};

const coinIco = (color, s = 14) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="8"/>
    <path d="M12 8v8M14.5 10H11a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3H9.5"/>
  </svg>
);

const soundIco = (on, color, s = 14) => (
  on ? (
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

export default function MultiplicationGame({ user, lg = "uz", dark, gameId = "math/multiply", name, onBack, level, onNextLevel }) {
  const { t } = useApp();
  const th = dark ? PALETTE.dark : PALETTE.light;
  const kidName = name || (user && (user.ism || "")) || "";

  const [userLevels, setUserLevels] = useState({});
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled());
  const [totalCoins, setTotalCoins] = useState(0);

  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [showHintOverlay, setShowHintOverlay] = useState(false);

  const activeLevel = level;

  const [lvlQuestionCount] = useState(level ? level.questionCount : 10);
  const [lvlStartDifficulty] = useState(level ? level.difficulty : "medium");

  const eng = useGameEngine({
    questionCount: lvlQuestionCount,
    generator: multiplyPriceGenerator,
    startDifficulty: lvlStartDifficulty,
    name: kidName,
    lg,
    rewards: rewardOf("math"),
  });

  const [count, setCount] = useState(3);
  const [picked, setPicked] = useState(null);
  const [feed, setFeed] = useState(null);
  const [flies, setFlies] = useState([]);
  const [saved, setSaved] = useState(false);
  const [record, setRecord] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const savingRef = useRef(false);

  const [prevDiff, setPrevDiff] = useState(eng.difficulty);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => { injectCss(); }, []);

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
      savingRef.current = false;
      setSaved(false);
      setTimeout(() => {
        eng.start();
      }, 100);
    }
  }, [level]);

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

  useEffect(() => {
    if (eng.phase !== "countdown") return;
    setCount(3);
    let n = 3;
    const interval = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(interval);
        eng.beginPlay();
      } else {
        setCount(n);
        playSound.tick();
      }
    }, 1000);
    playSound.tick();
    return () => clearInterval(interval);
  }, [eng.phase]);

  useEffect(() => {
    if (eng.phase === "play") {
      setPicked(null);
      setFeed(null);
    }
  }, [eng.qIndex, eng.phase]);

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
      if (timesPlayedToday === 1) multiplier = 0.6;
      else if (timesPlayedToday === 2) multiplier = 0.3;
      else if (timesPlayedToday >= 3) multiplier = 0.1;
      
      const finalCoins = Math.max(1, Math.round(eng.result.coins * multiplier));
      eng.result.coins = finalCoins; 
      
      const updatedCoins = await addCoins(user.id, finalCoins);
      setTotalCoins(updatedCoins);
      const afterXp = await addXp(user.id, eng.result.xp || 0);
      const isRec = finalCoins > prevBest;
      const lvlUp = didLevelUp(beforeXp, afterXp);

      let stars = 0;
      if (activeLevel) {
        stars = starsFor(eng.result.pct, activeLevel.passPct);
      }

      if (stars > 0) {
        playSound.victory();
        const nextLevels = await saveLevelProgress(user.id, "math", activeLevel.id, stars);
        setUserLevels(nextLevels["math"] || {});
      } else {
        playSound.wrong();
      }

      await logGameSession(user.id, {
        gameId, subject: "math", correct: eng.result.correct, total: eng.result.total, pct: eng.result.pct,
        seconds: eng.result.seconds, maxCombo: eng.result.maxCombo, coins: finalCoins,
        xp: eng.result.xp || 0, difficulty: eng.result.difficulty, newRecord: isRec,
        levelId: activeLevel?.id || 1, starsEarned: stars,
      });

      setRecord(isRec);
      setLeveledUp(lvlUp);
      setNewLevel(levelFor(afterXp).level);
      setSaved(true);
    })();
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
    setTimeout(() => {
      eng.start();
    }, 100);
  };

  const getLocalizedPrompt = () => {
    if (!eng.question) return "";
    const prompt = eng.question.prompt;
    let resolved = prompt;
    if (typeof prompt === "object") {
      resolved = prompt[lg] || prompt.uz;
    }
    return translateMathString(resolved, lg);
  };

  // ═══ INTRO ═══
  if (eng.phase === "intro") {
    return (
      <div style={{ textAlign: "center", padding: SPACE.s6 + "px " + SPACE.s4 }}>
        <PageHeader th={th} title={t("gam_mul_title")} onBack={onBack} />
        <AppCard th={th} style={{ marginTop: SPACE.s4 }}>
          <div style={{ ...TYPE.subtitle, color: th.t1, marginBottom: SPACE.s2 }}>
            {t("gam_mul_gameTitle")}
          </div>
          <p style={{ ...TYPE.caption, color: th.t2, marginBottom: SPACE.s4 }}>
            {t("gam_mul_intro")}
          </p>
          <PrimaryButton th={th} onClick={() => eng.start()}>
            {t("bd_startLabel")}
          </PrimaryButton>
        </AppCard>
      </div>
    );
  }

  // ═══ COUNTDOWN ═══
  if (eng.phase === "countdown") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="bg-pulse" style={{ fontSize: 90, fontWeight: 900, color: th.ac, textShadow: SHADOW.e3 }}>{count}</div>
        <div style={{ ...TYPE.subtitle, color: th.t2, marginTop: SPACE.s2 }}>{t("gam_mul_getReady")}</div>
      </div>
    );
  }

  // ═══ RESULT ═══
  if (eng.phase === "result") {
    const r = eng.result;
    if (!r) return null;
    const pct = r.pct;
    const isWin = activeLevel ? pct >= activeLevel.passPct : pct >= 50;

    return (
      <div className="bg-pop" style={{ paddingBottom: SPACE.s8 }}>
        <PageHeader th={th} title={t("gam_result")} onBack={onBack} />

        {/* Header illustration with playful star or cross depending on outcome */}
        <div style={{ textAlign: "center", margin: `${SPACE.s6}px 0` }}>
          <div style={{ display: "inline-flex", padding: SPACE.s3, borderRadius: RADIUS.full, background: isWin ? th.gr + ALPHA.faint : th.rd + ALPHA.faint, marginBottom: SPACE.s3, border: `2px solid ${isWin ? th.gr : th.rd}` }}>
            {isWin ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={th.gr} strokeWidth="1.8">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={th.rd} strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
          </div>
          <h2 style={{ ...TYPE.heading, color: th.t1, fontSize: 26, margin: 0 }}>
            {isWin ? t("gam_mul_greatJob") : t("gam_mul_tryAgain")}
          </h2>
          <p style={{ ...TYPE.caption, color: th.t2, margin: "6px 0 0" }}>
            {isWin ? t("gam_mul_unlockedNext") : t("gam_mul_needPct", { pct: activeLevel?.passPct })}
          </p>
        </div>

        {/* Primary Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3, marginBottom: SPACE.s4 }}>
          <StatCard th={th} value={`${r.correct}/${r.total}`} label={t("gam_mul_accuracy")} tone={th.ac} />
          <StatCard th={th} value={`${r.pct}%`} label={t("gam_mul_percentage")} tone={isWin ? th.gr : th.rd} />
          <StatCard th={th} value={`${r.seconds}s`} label={t("gam_mul_timeSpent")} tone={th.t2} />
          <StatCard th={th} value={`+${r.coins}`} label={t("gam_coinsEarned")} tone={PREMIUM.gold} />
        </div>

        {/* XP Card */}
        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: th.ac2 + ALPHA.faint, border: "1px solid " + th.ac2 + ALPHA.med, marginBottom: SPACE.s3 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.8 6 6.2.7-4.6 4.3 1.2 6.3L12 17.8 6.4 20.3l1.2-6.3L3 9.7 9.2 9 12 3z" stroke={th.ac2} strokeWidth="1.5" strokeLinejoin="round" fill={th.ac2} fillOpacity="0.2"/></svg>
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{t("gam_experienceXp")}</div>
            <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>+{r.xp || 0}</div>
          </div>
          {leveledUp && newLevel && <Badge th={th} type="premium" icon={null}>LEVEL {newLevel}</Badge>}
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

        {activeLevel && onNextLevel && isWin && (
          <PrimaryButton th={th} onClick={onNextLevel} style={{ marginTop: SPACE.s2, background: th.gr }}>
            {t("gam_nextLevel")}
          </PrimaryButton>
        )}
        {activeLevel && (
          <PrimaryButton th={th} onClick={() => startLevel(activeLevel)} style={{ marginTop: SPACE.s2 }}>
            {t("gam_playAgain")}
          </PrimaryButton>
        )}
        <button className="ui-press" onClick={onBack} style={{ width: "100%", marginTop: SPACE.s2, background: "transparent", border: "none", color: th.t2, padding: SPACE.s3, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{t("gam_backToMap")}</button>
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
            {t("gam_difficultyIncreased")}
          </span>
        </div>
      )}

      {/* Yuqori progress: Level questions */}
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, padding: SPACE.s2 + "px 0 " + SPACE.s4 }}>
        <button className="ui-press" onClick={onBack} aria-label="back" style={{ background: "transparent", border: "none", cursor: "pointer", padding: SPACE.s1, flexShrink: 0 }}>
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
        <div style={{ fontSize: 28, fontWeight: 800, color: th.t1, fontVariantNumeric: "tabular-nums", letterSpacing: 1, lineHeight: 1.4 }}>
          {getLocalizedPrompt()}
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
                {t("gam_quickTip")}
              </div>
              <p style={{ fontSize: 14, margin: 0, opacity: 0.95, lineHeight: 1.4 }}>
                {t("gam_mul_hint")}
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
