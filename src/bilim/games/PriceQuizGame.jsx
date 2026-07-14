// ═══════════════════════════════════════════════════════════
//  PRICE QUIZ GAME — Reusable Quiz Engine for Price Decision Games
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE, MOTION } from "../../utils/tokens.js";
import { useGameEngine } from "../engine/useGameEngine.js";
import { priceCompareGenerator } from "./generators/priceCompare.js";
import { discountGenerator } from "./generators/discount.js";
import { addCoins, logGameSession, bestForGame, readSessions, readCoins, readLevelProgress, saveLevelProgress } from "../engine/persist.js";
import { addXp, readXp, levelFor, didLevelUp } from "../engine/xp.js";
import { DIFF, rewardOf, tierFor, medalSvg } from "../registry.jsx";
import { GAME_LEVELS } from "./levels.js";
import { playSound, isSoundEnabled, setSoundEnabled } from "../engine/sound.js";

const CSS_ID = "bilim-price-game-css";
const injectCss = () => {
  if (typeof document === "undefined" || document.getElementById(CSS_ID)) return;
  const st = document.createElement("style");
  st.id = CSS_ID;
  st.textContent = `
@keyframes bgPulse{0%{transform:scale(1)}40%{transform:scale(1.06)}100%{transform:scale(1)}}
@keyframes bgShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes bgFly{0%{opacity:0;transform:translateY(0) scale(.8)}20%{opacity:1}100%{opacity:0;transform:translateY(-70px) scale(1.2)}}
@keyframes bgPop{0%{opacity:0;transform:scale(.9)}100%{opacity:1;transform:scale(1)}}
@keyframes floatNode{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

.bg-pulse{animation:bgPulse .5s ease}
.bg-shake{animation:bgShake .4s ease}
.bg-fly{animation:bgFly 1s ease forwards}
.bg-pop{animation:bgPop .25s ease}
.node-float{animation:floatNode 4s ease-in-out infinite}
.option-button-hover{
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s !important;
}
.option-button-hover:hover{
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(99,102,241,0.2) !important;
}
`;
  document.head.appendChild(st);
};

const coinIco = (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".2"/><path d="M10 7v6M8 10h4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
const starIco = (filled, s = 14) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? PREMIUM.gold : "none"} stroke={filled ? PREMIUM.gold : "#9ca3af"} strokeWidth="1.5" style={{ margin: "0 1px" }}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const lockIco = (color, s = 14) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const OptButton = memo(function OptButton({ th, value, label, state, onPick, disabled }) {
  const bg = state === "correct" ? th.gr : state === "wrong" ? th.rd : th.sur;
  const bd = state === "correct" ? th.gr : state === "wrong" ? th.rd : th.bor;
  const col = state === "correct" || state === "wrong" ? "#fff" : th.t1;
  const cls = state === "correct" ? "bg-pulse" : state === "wrong" ? "bg-shake" : "option-button-hover";
  return (
    <button className={"ui-press " + cls} onClick={() => onPick(value)} disabled={disabled}
      style={{ 
        background: bg, 
        border: "2px solid " + bd, 
        borderRadius: RADIUS.m, 
        padding: "16px", 
        cursor: disabled ? "default" : "pointer", 
        fontFamily: "inherit", 
        opacity: state === "muted" ? 0.5 : 1, 
        transition: "background 0.2s, border-color 0.2s", 
        boxShadow: SHADOW.e0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}>
      <span style={{ fontSize: 16, fontWeight: 800, color: col, lineHeight: 1.3 }}>{label}</span>
    </button>
  );
});

export default function PriceQuizGame({ user, lg = "uz", dark, gameId = "finance/price-compare", name, onBack }) {
  const th = dark ? PALETTE.dark : PALETTE.light;
  const uz = lg === "uz";
  const ru = lg === "ru";
  const en = lg === "en";
  const kidName = name || (user && (user.ism || "")) || "";

  const L = (uzVal, ruVal, enVal) => {
    if (ru) return ruVal || uzVal;
    if (en) return enVal || uzVal;
    return uzVal;
  };

  const isPriceCompare = gameId === "finance/price-compare";
  const generator = isPriceCompare ? priceCompareGenerator : discountGenerator;

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
    generator,
    startDifficulty: lvlStartDifficulty,
    name: kidName,
    lg,
    rewards: rewardOf("finance"), // finance is rewardOf => coin=2.2, xp=4
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
      if (selectedLevel) {
        if (eng.result.pct >= selectedLevel.passThreshold) {
          if (eng.result.pct === 100) stars = 3;
          else if (eng.result.pct >= 80) stars = 2;
          else stars = 1;
        }
      }

      // Play victory sound
      if (stars > 0) {
        playSound.victory();
        // Save level progress to DB
        const nextLevels = await saveLevelProgress(user.id, gameId, selectedLevel.id, stars);
        setUserLevels(nextLevels[gameId] || {});
      } else {
        playSound.wrong();
      }

      await logGameSession(user.id, {
        gameId, subject: "finance", correct: eng.result.correct, total: eng.result.total, pct: eng.result.pct,
        seconds: eng.result.seconds, maxCombo: eng.result.maxCombo, coins: finalCoins,
        xp: eng.result.xp || 0, difficulty: eng.result.difficulty, newRecord: isRec,
        levelId: selectedLevel?.id || 1, starsEarned: stars,
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
        if (gained > 0) spawnFly(gained);
      } else {
        playSound.wrong();
      }
    });
  }, [picked, eng, spawnFly]);

  const optState = (opt) => {
    if (picked == null || !eng.question) return null;
    if (opt.id === eng.question.answer) return "correct";
    if (opt.id === picked) return "wrong";
    return "muted";
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabledState(nextVal);
    setSoundEnabled(nextVal);
  };

  const startLevel = (lvl) => {
    savingRef.current = false;
    setSaved(false);
    setLvlQuestionCount(lvl.questionCount);
    setLvlStartDifficulty(lvl.difficulty);
    setTimeout(() => {
      setSelectedLevel(lvl);
      eng.start();
    }, 50);
  };

  // ═══ INTRO / MAP VIEW ═══
  if (eng.phase === "intro" && !selectedLevel) {
    const levels = GAME_LEVELS[gameId] || [];
    return (
      <div style={{ padding: SPACE.s3 }}>
        <PageHeader th={th} title={isPriceCompare ? L("Narxni Solishtir", "Сравнение цен", "Compare Prices") : L("Chegirma haqiqiymi?", "Реальная скидка?", "Real Discount?")} onBack={onBack} />
        
        {/* Intro Banner */}
        <div style={{ textAlign: "center", margin: "16px 0 24px" }}>
          <div style={{ width: 70, height: 70, borderRadius: RADIUS.l, background: th.ac + ALPHA.soft, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: SPACE.s2 }}>
            {isPriceCompare ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={th.ac} strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={th.ac} strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
              </svg>
            )}
          </div>
          <p style={{ ...TYPE.caption, color: th.t2, fontSize: 14, maxWidth: 300, margin: "0 auto", lineHeight: 1.4 }}>
            {isPriceCompare 
              ? L("Berilgan takliflarni solishtiring va eng foydali (arzonroq) variantni tanlang!", "Сравнивайте предложения и выбирайте самый выгодный (дешевый) вариант!", "Compare offers and select the most beneficial (cheaper) option!")
              : L("Chegirmadan keyingi yakuniy narxni hisoblang va moliyaviy bilimlaringizni oshiring!", "Рассчитайте цену после скидки и улучшите свои финансовые знания!", "Calculate the discounted price and boost your financial literacy!")}
          </p>
        </div>

        {/* Level Map Grid */}
        <h3 style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1, marginBottom: 12 }}>{L("Bosqichlar", "Уровни", "Levels")}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: SPACE.s3 }}>
          {levels.map((lvl, idx) => {
            const progress = userLevels[lvl.id] || {};
            const stars = progress.stars || 0;
            const isUnlocked = idx === 0 || (userLevels[levels[idx - 1]?.id]?.stars || 0) > 0;
            
            return (
              <button key={lvl.id} className={isUnlocked ? "ui-press node-float" : ""} onClick={() => isUnlocked && startLevel(lvl)} disabled={!isUnlocked}
                style={{ 
                  aspectRatio: "1/1",
                  background: isUnlocked ? (stars > 0 ? th.gr + ALPHA.faint : th.sur) : th.bor, 
                  border: "2px solid " + (isUnlocked ? (stars > 0 ? th.gr : th.ac) : th.bor),
                  borderRadius: RADIUS.l,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isUnlocked ? "pointer" : "default",
                  boxShadow: isUnlocked ? SHADOW.e1(th.ac) : "none"
                }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: isUnlocked ? th.t1 : th.t3 }}>{L("Bosqich", "Уровень", "Level")} {lvl.id}</span>
                {isUnlocked ? (
                  <div style={{ display: "flex", marginTop: 4 }}>
                    {starIco(stars >= 1, 12)}
                    {starIco(stars >= 2, 12)}
                    {starIco(stars >= 3, 12)}
                  </div>
                ) : (
                  <div style={{ marginTop: 4 }}>{lockIco(th.t3, 14)}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══ COUNTDOWN PHASE ═══
  if (eng.phase === "countdown") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: th.ac, animation: "bgPulse 0.8s infinite ease-in-out" }}>{count}</div>
        <div style={{ ...TYPE.subtitle, color: th.t2, marginTop: 12 }}>{L("Tayyormisiz?", "Готовы?", "Are you ready?")}</div>
      </div>
    );
  }

  // ═══ RESULT PHASE ═══
  if (eng.phase === "result" && eng.result) {
    const r = eng.result;
    const finalStars = selectedLevel ? (r.pct >= selectedLevel.passThreshold ? (r.pct === 100 ? 3 : r.pct >= 80 ? 2 : 1) : 0) : 0;
    const mm = Math.floor(r.seconds / 60);
    const ss = r.seconds % 60;

    return (
      <div style={{ padding: SPACE.s3 }}>
        <div style={{ textAlign: "center", marginBottom: SPACE.s4 }}>
          <div style={{ display: "inline-flex", gap: 2, justifyContent: "center", marginBottom: SPACE.s2 }}>
            {selectedLevel && (
              <>
                {starIco(finalStars >= 1, 36)}
                {starIco(finalStars >= 2, 36)}
                {starIco(finalStars >= 3, 36)}
              </>
            )}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: th.t1 }}>
            {finalStars > 0 ? L("Bosqichdan o'tdingiz!", "Уровень пройден!", "Level Passed!") : L("Qayta urinib ko'ring!", "Попробуйте ещё раз!", "Try Again!")}
          </div>
          <div style={{ ...TYPE.subtitle, color: th.t2, marginTop: 4 }}>{r.correct}/{r.total} {L("to'g'ri", "верно", "correct")} ({r.pct}%)</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatCard th={th} value={r.correct} label={L("To'g'ri", "Верно", "Correct")} tone={th.gr} />
          <StatCard th={th} value={r.wrong} label={L("Xato", "Ошибки", "Wrong")} tone={th.rd} />
          <StatCard th={th} value={(mm ? mm + "m " : "") + ss + "s"} label={L("Vaqt", "Время", "Time")} tone={th.ac} />
          <StatCard th={th} value={"x" + r.maxCombo} label="Combo" tone={th.am} />
        </div>

        {/* Earned Coins */}
        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, marginBottom: SPACE.s2 }}>
          {coinIco(PREMIUM.gold, 28)}
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{L("Topilgan coin", "Монеты", "Coins earned")}</div>
            <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>+{r.coins}</div>
          </div>
          {record && <Badge th={th} tone={PREMIUM.gold}>REKORD</Badge>}
        </AppCard>

        {/* XP Card */}
        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: th.ac2 + ALPHA.faint, border: "1px solid " + th.ac2 + ALPHA.med, marginBottom: SPACE.s3 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.8 6 6.2.7-4.6 4.3 1.2 6.3L12 17.8 6.4 20.3l1.2-6.3L3 9.7 9.2 9 12 3z" stroke={th.ac2} strokeWidth="1.5" strokeLinejoin="round" fill={th.ac2} fillOpacity="0.2"/></svg>
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>Tajriba (XP)</div>
            <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>+{r.xp || 0}</div>
          </div>
          {leveledUp && <Badge th={th} tone={th.ac2}>YANGI LEVEL!</Badge>}
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

        {selectedLevel && (
          <PrimaryButton th={th} onClick={() => startLevel(selectedLevel)} style={{ marginTop: SPACE.s2 }}>
            {L("Qayta o'ynash", "Ещё раз", "Play again")}
          </PrimaryButton>
        )}
        <button className="ui-press" onClick={() => { eng.setPhase("intro"); setSelectedLevel(null); }} style={{ width: "100%", marginTop: SPACE.s2, background: "transparent", border: "none", color: th.t2, padding: SPACE.s3, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{L("Ortga qaytish", "Назад", "Back")}</button>
      </div>
    );
  }

  // ═══ PLAY PHASE ═══
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", padding: SPACE.s3 }}>
      {/* Celebration Level-Up Toast */}
      {showCelebration && (
        <div className="bg-pulse" style={{
          position: "fixed", top: "20%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 100,
          background: "linear-gradient(135deg," + th.gr + "," + th.ac + ")", color: "#fff",
          padding: "12px 24px", borderRadius: RADIUS.pill, boxShadow: SHADOW.e3,
          display: "flex", alignItems: "center", gap: 8, pointerEvents: "none"
        }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M9 1.5L3.5 9H8l-1 5.5L12.5 7H8l1-5.5z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" fill="#fff" fillOpacity=".2"/></svg>
          <span style={{ fontSize: 15, fontWeight: 800 }}>
            {L("Qiyinroq darajaga o'tdingiz!", "Уровень повышен!", "Difficulty increased!")}
          </span>
        </div>
      )}

      {/* Header & Progress Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, padding: "8px 0 16px" }}>
        <button className="ui-press" onClick={() => { eng.setPhase("intro"); setSelectedLevel(null); }} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
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

      {/* Coin & Combo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, ...TYPE.subtitle, color: PREMIUM.gold, fontWeight: 800 }}>{coinIco(PREMIUM.gold, 18)}{eng.score.coins}</span>
        {eng.score.combo >= 2 && <Badge th={th} type="warning">Combo x{eng.score.combo}</Badge>}
      </div>

      {/* Question Card */}
      <div style={{ position: "relative", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.l, padding: "24px 16px", textAlign: "center", marginBottom: 24, boxShadow: SHADOW.e1(th.ac) }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: th.t1, whiteSpace: "pre-wrap", lineHeight: 1.5, fontFamily: "inherit" }}>
          {eng.question ? (typeof eng.question.prompt === "object" ? eng.question.prompt[lg] || eng.question.prompt.uz : eng.question.prompt) : ""}
        </div>
        {/* Flying coins */}
        {flies.map(fl => (
          <span key={fl.id} className="bg-fly" style={{ position: "absolute", top: SPACE.s3, left: "50%", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 3, ...TYPE.subtitle, fontWeight: 800, color: PREMIUM.gold, pointerEvents: "none" }}>
            {coinIco(PREMIUM.gold, 18)}+{fl.amount}
          </span>
        ))}
      </div>

      {/* Choices grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: SPACE.s3 }}>
        {eng.question && eng.question.options.map((opt, i) => (
          <OptButton key={i} th={th} value={opt.id} label={opt.text[lg] || opt.text.uz} state={optState(opt)} onPick={onPick} disabled={picked != null} />
        ))}
      </div>
    </div>
  );
}
