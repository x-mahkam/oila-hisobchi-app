import { useState, useEffect, useCallback, useRef } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, PREMIUM, PALETTE } from "../../utils/tokens.js";
import { addCoins, logGameSession, bestForGame, readCoins, saveLevelProgress } from "../engine/persist.js";
import { addXp, readXp, levelFor, didLevelUp } from "../engine/xp.js";
import { rewardOf, tierFor, medalSvg } from "../registry.jsx";
import { playSound } from "../engine/sound.js";
import { Star, Zap, Flame, Award } from "lucide-react";

// Color maps for the 4 Simon buttons
const BUTTONS = [
  { id: 0, color: "#22c55e", name: { uz: "Yashil", ru: "Зеленый", en: "Green" }, sound: "correct" },
  { id: 1, color: "#ef4444", name: { uz: "Qizil", ru: "Красный", en: "Red" }, sound: "wrong" }, // We will use playSound.tick or pitch shifts
  { id: 2, color: "#3b82f6", name: { uz: "Moviy", ru: "Синий", en: "Blue" }, sound: "tick" },
  { id: 3, color: "#eab308", name: { uz: "Sariq", ru: "Желтый", en: "Желтый" }, sound: "victory" }
];

export default function SimonSequenceGame({ user, lg = "uz", dark, gameId = "memory/simon", name = "", level, onBack, onNextLevel }) {
  const th = dark ? PALETTE.dark : PALETTE.light;
  const uz = lg === "uz";
  const ru = lg === "ru";
  const en = lg === "en";

  const L = (uzVal, ruVal, enVal) => {
    if (ru) return ruVal || uzVal;
    if (en) return enVal || uzVal;
    return uzVal;
  };

  const startLength = level ? (level.startLength || 3) : 3;
  const targetLength = level ? (level.targetLength || 7) : 7;

  // Game Phase
  const [phase, setPhase] = useState("intro"); // intro | play | result
  
  // Game state
  const [sequence, setSequence] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [activePad, setActivePad] = useState(null);
  const [score, setScore] = useState(0); // number of successful steps matched
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Rewards and stats
  const [totalCoins, setTotalCoins] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [record, setRecord] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [saved, setSaved] = useState(false);
  const savingRef = useRef(false);

  // Load current coins
  useEffect(() => {
    if (user?.id) {
      readCoins(user.id).then(setTotalCoins);
    }
  }, [user?.id]);

  // Generate complete sequence for this level up to target length
  const generateSequence = (len) => {
    const seq = [];
    for (let i = 0; i < len; i++) {
      seq.push(Math.floor(Math.random() * 4));
    }
    return seq;
  };

  // Sound play helper for Simon pads
  const playPadSound = (id) => {
    try {
      if (id === 0) playSound.tick();
      else if (id === 1) playSound.tick(); // pitch variants or standard ticks
      else if (id === 2) playSound.tick();
      else playSound.tick();
    } catch (e) {
      console.log("Audio failed", e);
    }
  };

  // Playback the sequence to the user
  const playSequence = useCallback(async (fullSeq, currentLen) => {
    setIsPlaybackActive(true);
    const subSeq = fullSeq.slice(0, currentLen);
    
    for (let i = 0; i < subSeq.length; i++) {
      const padId = subSeq[i];
      // Delay before lighting up
      await new Promise(r => setTimeout(r, 400));
      setActivePad(padId);
      playPadSound(padId);
      // Light duration
      await new Promise(r => setTimeout(r, 500));
      setActivePad(null);
    }
    
    // Add brief extra gap before giving control to player
    await new Promise(r => setTimeout(r, 200));
    setIsPlaybackActive(false);
    setPlayerIndex(0);
  }, []);

  // Initialize and start game
  const handleStartGame = () => {
    const seq = generateSequence(targetLength);
    setSequence(seq);
    setCurrentRound(startLength);
    setPlayerIndex(0);
    setScore(0);
    setStartTime(Date.now());
    setSaved(false);
    savingRef.current = false;
    setPhase("play");

    // Start playback for first round after short entry delay
    setTimeout(() => {
      playSequence(seq, startLength);
    }, 800);
  };

  // Handle player pad clicks
  const handlePadClick = (padId) => {
    if (isPlaybackActive || phase !== "play") return;

    // Visual & audio feedback on click
    setActivePad(padId);
    playPadSound(padId);
    setTimeout(() => setActivePad(null), 250);

    const expectedPad = sequence[playerIndex];

    if (padId === expectedPad) {
      // Correct click
      const nextPlayerIdx = playerIndex + 1;
      setScore(prev => prev + 1);

      if (nextPlayerIdx >= currentRound) {
        // Round Completed!
        if (currentRound >= targetLength) {
          // Game Completed (Won!)
          const totalTime = Math.round((Date.now() - startTime) / 1000);
          setElapsed(totalTime);
          setTimeout(() => {
            playSound.victory();
            setPhase("result");
          }, 800);
        } else {
          // Next Round: advance sequence length
          const nextRoundLen = currentRound + 1;
          setCurrentRound(nextRoundLen);
          setTimeout(() => {
            playSound.correct();
            playSequence(sequence, nextRoundLen);
          }, 1000);
        }
      } else {
        // Keep waiting for remaining sequence clicks
        setPlayerIndex(nextPlayerIdx);
      }
    } else {
      // Made a mistake - game over immediately
      playSound.wrong();
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      setElapsed(totalTime);
      setTimeout(() => {
        setPhase("result");
      }, 600);
    }
  };

  // Save rewards and session data
  useEffect(() => {
    if (phase !== "result" || savingRef.current || !user?.id) return;
    savingRef.current = true;

    (async () => {
      const prevBest = await bestForGame(user.id, gameId);
      const beforeXp = await readXp(user.id);

      // Stars calculation:
      // 3 stars: complete target sequence successfully (score >= targetLength)
      // 2 stars: complete at least 60% of the target sequence
      // 1 star: complete at least 30% of the sequence
      // 0 stars: less
      const pct = targetLength > 0 ? (score / targetLength) * 100 : 0;
      const stars = score >= targetLength ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;

      if (stars > 0) {
        playSound.victory();
      } else {
        playSound.wrong();
      }

      // Base reward unit for memory: coin=1.2, xp=2 per correct step matched
      let bonusCoins = 0;
      let bonusXp = 0;
      if (stars === 3) {
        bonusCoins = 4;
        bonusXp = 8;
      } else if (stars === 2) {
        bonusCoins = 2;
        bonusXp = 4;
      }

      const coinReward = Math.round(score * 1.2) + bonusCoins;
      const xpReward = Math.round(score * 2.0) + bonusXp;

      // Update coins and XP
      const updatedCoins = await addCoins(user.id, coinReward);
      setTotalCoins(updatedCoins);
      const afterXp = await addXp(user.id, xpReward);
      const isRec = coinReward > prevBest;
      const lvlUp = didLevelUp(beforeXp, afterXp);

      await logGameSession(user.id, {
        gameId,
        subject: "memory",
        correct: score,
        total: targetLength,
        pct: Math.round(pct),
        seconds: elapsed,
        maxCombo: score,
        coins: coinReward,
        xp: xpReward,
        difficulty: level ? "level-" + level.id : "easy",
        newRecord: isRec,
      });

      if (level && stars > 0) {
        await saveLevelProgress(user.id, "memory", level.id, stars);
      }

      setEarnedCoins(coinReward);
      setEarnedXp(xpReward);
      setRecord(isRec);
      setLeveledUp(lvlUp);
      setNewLevel(levelFor(afterXp).level);
      setSaved(true);
    })();
  }, [phase, user?.id, score, elapsed, gameId, level, targetLength]);

  const maxStars = score >= targetLength ? 3 : (score / targetLength * 100) >= 60 ? 2 : (score / targetLength * 100) >= 30 ? 1 : 0;

  return (
    <div style={{ padding: SPACE.s3, minHeight: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      
      {/* ── INTRO PHASE ── */}
      {phase === "intro" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <PageHeader th={th} title={L("Ketma-ketlikni takrorlash", "Повтори последовательность", "Simon Sequence")} onBack={onBack} />

            <div style={{ textAlign: "center", margin: "24px 0" }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: RADIUS.l,
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: SPACE.s3,
                boxShadow: SHADOW.e1("#06b6d4")
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <h2 style={{ ...TYPE.heading, color: th.t1, fontSize: 24, fontWeight: 900, marginBottom: SPACE.s2 }}>
                {L("Chiroqlar ketma-ketligini eslab qoling", "Запоминайте вспышки света", "Remember the Flash Sequence")}
              </h2>
              <p style={{ ...TYPE.caption, color: th.t2, fontSize: 15, lineHeight: 1.5, maxWidth: 320, margin: "0 auto" }}>
                {L(
                  "Rang-barang tugmalarning yonish ketma-ketligini diqqat bilan tomosha qiling, ularni xuddi shu tartibda takrorlang va xotirangizni sinang!",
                  "Следите за вспышками разноцветных кнопок и повторяйте их в точности шаг за шагом!",
                  "Watch the sequence of colorful button flashes carefully, repeat them in the exact order, and test your memory boundaries!"
                )}
              </p>
            </div>

            <AppCard th={th} style={{ background: th.ac2 + ALPHA.faint, border: "1px solid " + th.ac2 + ALPHA.med, marginBottom: SPACE.s3 }}>
              <div style={{ display: "flex", gap: SPACE.s3, alignItems: "center" }}>
                <Zap size={28} color={th.ac2} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ ...TYPE.subtitle, color: th.ac2, fontWeight: 800, margin: 0, fontSize: 14 }}>
                    {L("Dinamik ravishda o'sadi", "Увеличивающаяся длина", "Grows dynamically")}
                  </h4>
                  <p style={{ ...TYPE.caption, color: th.t2, margin: "2px 0 0 0", fontSize: 13, lineHeight: 1.4 }}>
                    {L(`Har bir muvaffaqiyatli bosqichdan so'ng, ketma-ketlik yana 1 taga uzayadi. Maqsad: kamida ${targetLength} ta chiroqni topish.`, `После каждого верного шага длина увеличивается на 1. Цель: повторить минимум ${targetLength} вспышек.`, `After each successful round, the pattern length grows by 1. Target: match at least ${targetLength} steps.`)}
                  </p>
                </div>
              </div>
            </AppCard>
          </div>

          <PrimaryButton th={th} onClick={handleStartGame} style={{ marginTop: SPACE.s3 }}>
            {L("O'yinni boshlash", "Начать игру", "Start Game")}
          </PrimaryButton>
        </div>
      )}

      {/* ── PLAY PHASE ── */}
      {phase === "play" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <PageHeader th={th} title={`${L("Bosqich", "Раунд", "Round")}: ${currentRound - startLength + 1}`} onBack={() => setPhase("intro")} />

            {/* Play HUD */}
            <div style={{ display: "flex", justifyContent: "space-between", ...TYPE.tiny, color: th.t2, marginBottom: 8 }}>
              <span>{isPlaybackActive ? L("Kuzating...", "Наблюдайте...", "Watch carefully...") : L("Sizning navbatingiz!", "Ваш ход!", "Your turn!")}</span>
              <span style={{ fontWeight: 700, color: th.ac2 }}>{score} / {targetLength}</span>
            </div>
            
            {/* Progress bar */}
            <div style={{ height: 6, width: "100%", background: th.bor, borderRadius: RADIUS.pill, marginBottom: 32, overflow: "hidden" }}>
              <div style={{
                width: `${(score / targetLength) * 100}%`,
                height: "100%",
                background: "#06b6d4",
                borderRadius: RADIUS.pill,
                transition: "width 0.3s"
              }} />
            </div>

            {/* Simon Pads Circle/Grid Layout */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: SPACE.s4,
              maxWidth: 300,
              margin: "0 auto",
              padding: SPACE.s2,
              boxSizing: "border-box"
            }}>
              {BUTTONS.map((btn) => {
                const isActive = activePad === btn.id;
                
                return (
                  <button
                    key={btn.id}
                    onClick={() => handlePadClick(btn.id)}
                    disabled={isPlaybackActive}
                    style={{
                      aspectRatio: "1/1",
                      background: btn.color,
                      opacity: isActive ? 1.0 : 0.35,
                      border: isActive ? "5px solid #fff" : "3px solid transparent",
                      borderRadius: btn.id === 0 ? "40% 12% 12% 12%" : btn.id === 1 ? "12% 40% 12% 12%" : btn.id === 2 ? "12% 12% 12% 40%" : "12% 12% 40% 12%",
                      cursor: isPlaybackActive ? "default" : "pointer",
                      boxShadow: isActive ? `0 0 24px ${btn.color}` : "none",
                      transition: "opacity 0.15s, border-color 0.15s, box-shadow 0.15s",
                      outline: "none"
                    }}
                    className={!isPlaybackActive ? "ui-press" : ""}
                  />
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <p style={{ ...TYPE.tiny, color: th.t3, textTransform: "none", letterSpacing: 0 }}>
              {isPlaybackActive
                ? L("Ranglar ketma-ket yona boshlaydi, ularning ketma-ketligini eslab qoling.", "Кнопки будут загораться по очереди. Запомните порядок.", "Observe the light pattern carefully. Memorize the exact order.")
                : L("Rangli tugmalarni xuddi o'sha tartibda bosing!", "Нажимайте на кнопки в том же порядке!", "Press the colorful pads in the exact same sequence!")
              }
            </p>
          </div>
        </div>
      )}

      {/* ── RESULT PHASE ── */}
      {phase === "result" && (() => {
        const finalStars = maxStars;

        return (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <div style={{ textAlign: "center", marginBottom: SPACE.s4 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: SPACE.s3 }}>
                {[1, 2, 3].map(s => (
                  <Star key={s} size={32} fill={finalStars >= s ? PREMIUM.gold : "transparent"} stroke={finalStars >= s ? PREMIUM.gold : "rgba(255,255,255,0.4)"} />
                ))}
              </div>
              <h2 style={{ ...TYPE.display, fontSize: 24, color: th.t1, margin: 0 }}>
                {finalStars >= 2 
                  ? L("Fantastik xotira! 🚀", "Фантастическая память! 🚀", "Fantastic Memory! 🚀") 
                  : L("Yaxshi harakat! 👍", "Хорошая попытка! 👍", "Good Effort! 👍")}
              </h2>
              <p style={{ ...TYPE.subtitle, color: th.t2, margin: "6px 0 0 0" }}>
                {L(`Siz ${score} ta tugmani to'g'ri takrorladingiz!`, `Вы правильно повторили ${score} кнопок!`, `You successfully matched ${score} flashes!`)}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
              <StatCard th={th} value={score} label={L("Topilgan", "Повторено", "Matched")} tone={th.ac2} />
              <StatCard th={th} value={`${elapsed}s`} label={L("Sarflandi", "Время", "Time")} tone={th.gr} />
              <StatCard th={th} value={`${Math.round((score / targetLength) * 100)}%`} label={L("To'g'rilik", "Точность", "Accuracy")} tone={th.ac} />
              <StatCard th={th} value={finalStars === 3 ? "Excellent" : finalStars === 2 ? "Great" : "Good"} label="Rating" tone={th.am} />
            </div>

            {/* Earned Coins */}
            <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, marginBottom: SPACE.s2 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: PREMIUM.gold + "1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7.5" stroke={PREMIUM.gold} strokeWidth="1.5" fill={PREMIUM.gold} fillOpacity=".2" />
                  <path d="M10 7v6M8 10h4" stroke={PREMIUM.gold} strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{L("Topilgan coin", "Полученные монеты", "Earned Coins")}</div>
                <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>+{earnedCoins}</div>
              </div>
              {record && <Badge th={th} tone={PREMIUM.gold}>REKORD</Badge>}
            </AppCard>

            {/* Earned XP */}
            <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: th.ac2 + ALPHA.faint, border: "1px solid " + th.ac2 + ALPHA.med, marginBottom: SPACE.s3 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.8 6 6.2.7-4.6 4.3 1.2 6.3L12 17.8 6.4 20.3l1.2-6.3L3 9.7 9.2 9 12 3z" stroke={th.ac2} strokeWidth="1.5" strokeLinejoin="round" fill={th.ac2} fillOpacity="0.2"/></svg>
              <div style={{ flex: 1 }}>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>Tajriba (XP)</div>
                <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>+{earnedXp}</div>
              </div>
              {leveledUp && <Badge th={th} tone={th.ac2}>YANGI LEVEL!</Badge>}
            </AppCard>

            {/* Action buttons */}
            {level && onNextLevel && finalStars >= 1 && (
              <PrimaryButton th={th} onClick={onNextLevel} style={{ background: th.gr, marginBottom: SPACE.s2 }}>
                {L("Keyingi bosqich", "Следующий уровень", "Next Level")}
              </PrimaryButton>
            )}

            <PrimaryButton th={th} onClick={handleStartGame}>
              {L("Qayta o'ynash", "Играть еще раз", "Play Again")}
            </PrimaryButton>
            
            <button className="ui-press" onClick={onBack}
              style={{
                width: "100%",
                marginTop: SPACE.s2,
                background: "transparent",
                border: "none",
                color: th.t2,
                padding: SPACE.s3,
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                fontSize: 15
              }}>
              {L("Ortga qaytish", "Назад", "Back")}
            </button>
          </div>
        );
      })()}

    </div>
  );
}
