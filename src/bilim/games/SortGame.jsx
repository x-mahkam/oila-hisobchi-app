// ═══════════════════════════════════════════════════════════
//  SORT GAME: NEED OR WANT? (Moliyaviy Savodxonlik)
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE, MOTION } from "../../utils/tokens.js";
import { needsWantsData } from "./data/needsWants.js";
import { addCoins, logGameSession, bestForGame, readCoins } from "../engine/persist.js";
import { addXp, readXp, levelFor, didLevelUp } from "../engine/xp.js";
import { DIFF, rewardOf, tierFor, medalSvg } from "../registry.jsx";
import { playSound } from "../engine/sound.js";

// Helper icons
const coinIco = (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".2"/><path d="M10 7v6M8 10h4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;

export default function SortGame({ user, lg = "uz", dark, gameId = "finance/needs-wants", name, onBack }) {
  const th = dark ? PALETTE.dark : PALETTE.light;
  const uz = lg === "uz";
  const ru = lg === "ru";
  const en = lg === "en";

  const L = (uzVal, ruVal, enVal) => {
    if (ru) return ruVal || uzVal;
    if (en) return enVal || uzVal;
    return uzVal;
  };

  // Game states
  const [phase, setPhase] = useState("intro"); // intro | play | result
  const [items, setItems] = useState([]);
  const [curIdx, setCurIdx] = useState(0);
  const [selected, setSelected] = useState(null); // 'need' | 'want'
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [score, setScore] = useState({ correct: 0, wrong: 0, combo: 0, maxCombo: 0 });
  
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Persistence/results states
  const [totalCoins, setTotalCoins] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [record, setRecord] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [saved, setSaved] = useState(false);
  const savingRef = useRef(false);

  // Initialize and load coins
  useEffect(() => {
    if (user?.id) {
      readCoins(user.id).then(setTotalCoins);
    }
  }, [user?.id]);

  // Shuffles array and takes 10 items
  const startNewGame = () => {
    const shuffled = [...needsWantsData].sort(() => 0.5 - Math.random()).slice(0, 10);
    setItems(shuffled);
    setCurIdx(0);
    setSelected(null);
    setFeedback(null);
    setScore({ correct: 0, wrong: 0, combo: 0, maxCombo: 0 });
    setStartTime(Date.now());
    setSaved(false);
    savingRef.current = false;
    setPhase("play");
  };

  // Handle classification choice
  const handleChoice = (choice) => {
    if (selected !== null) return; // prevent multi clicks
    
    setSelected(choice);
    const currentItem = items[curIdx];
    const isCorrect = currentItem.correct === choice;
    
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      playSound.correct();
      setScore(prev => {
        const nextCombo = prev.combo + 1;
        return {
          correct: prev.correct + 1,
          wrong: prev.wrong,
          combo: nextCombo,
          maxCombo: Math.max(prev.maxCombo, nextCombo)
        };
      });
    } else {
      playSound.wrong();
      setScore(prev => ({
        ...prev,
        wrong: prev.wrong + 1,
        combo: 0
      }));
    }

    // Move to next after a brief delay
    setTimeout(() => {
      if (curIdx < items.length - 1) {
        setCurIdx(prev => prev + 1);
        setSelected(null);
        setFeedback(null);
      } else {
        // Game finished
        const totalTime = Math.round((Date.now() - startTime) / 1000);
        setElapsed(totalTime);
        setPhase("result");
      }
    }, 900);
  };

  // Handle completion saving
  useEffect(() => {
    if (phase !== "result" || savingRef.current || !user?.id) return;
    savingRef.current = true;

    (async () => {
      const prevBest = await bestForGame(user.id, gameId);
      const beforeXp = await readXp(user.id);

      // standard rewards for finance subject: coin=2.2, xp=4 per correct answer
      const baseCoinReward = Math.round(score.correct * 2.2);
      const baseXpReward = Math.round(score.correct * 4);

      // Save to database
      const updatedCoins = await addCoins(user.id, baseCoinReward);
      setTotalCoins(updatedCoins);
      const afterXp = await addXp(user.id, baseXpReward);
      const isRec = baseCoinReward > prevBest;
      const lvlUp = didLevelUp(beforeXp, afterXp);

      if (score.correct >= 5) {
        playSound.victory();
      } else {
        playSound.wrong();
      }

      await logGameSession(user.id, {
        gameId,
        subject: "finance",
        correct: score.correct,
        total: items.length,
        pct: Math.round((score.correct / items.length) * 100),
        seconds: elapsed,
        maxCombo: score.maxCombo,
        coins: baseCoinReward,
        xp: baseXpReward,
        difficulty: "easy",
        newRecord: isRec,
      });

      setEarnedCoins(baseCoinReward);
      setEarnedXp(baseXpReward);
      setRecord(isRec);
      setLeveledUp(lvlUp);
      setNewLevel(levelFor(afterXp).level);
      setSaved(true);
    })();
  }, [phase, user?.id, score.correct, items.length, elapsed, gameId]);

  // Render components based on phase
  return (
    <div style={{ padding: SPACE.s3, minHeight: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      
      {/* ── INTRO PHASE ── */}
      {phase === "intro" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <PageHeader th={th} title={L("Kerak yoki Xohish?", "Потребность или Желание?", "Need or Want?")} onBack={onBack} />
            
            <div style={{ textAlign: "center", margin: "24px 0" }}>
              <div style={{ width: 80, height: 80, borderRadius: RADIUS.l, background: th.ac + ALPHA.soft, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: SPACE.s3 }}>
                <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
                  <path d="M10 16a6 6 0 1012 0 6 6 0 00-12 0z" stroke={th.ac} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={th.ac} fillOpacity="0.14" />
                  <path d="M16 8V6M16 26v-2M12 11a4 4 0 018 0c0 2-4 2-4 4v1" stroke={th.ac} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ ...TYPE.heading, color: th.t1, fontSize: 24, fontWeight: 900, marginBottom: SPACE.s2 }}>
                {L("Kerakli narsalarni saralash", "Различай нужды и желания", "Sort Needs & Wants")}
              </h2>
              <p style={{ ...TYPE.caption, color: th.t2, fontSize: 15, lineHeight: 1.5, maxWidth: 320, margin: "0 auto" }}>
                {L(
                  "Hayotimiz uchun eng muhim bo'lgan 'Kerak' toifasini oddiy 'Xohishlar'dan ajratishni o'rganamiz!",
                  "Давай научимся отличать действительно важные для жизни вещи от простых 'Хочу'!",
                  "Learn to distinguish what is truly essential to live from things that are just simple desires!"
                )}
              </p>
            </div>

            <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "1px solid " + th.gr + ALPHA.med, marginBottom: SPACE.s3 }}>
              <div style={{ display: "flex", gap: SPACE.s3 }}>
                <span style={{ fontSize: 24 }}>🥦</span>
                <div>
                  <h4 style={{ ...TYPE.subtitle, color: th.gr, fontWeight: 800, margin: 0 }}>
                    {L("Kerak (Need)", "Нужно (Потребность)", "Need")}
                  </h4>
                  <p style={{ ...TYPE.caption, color: th.t2, margin: "2px 0 0 0", fontSize: 13, lineHeight: 1.4 }}>
                    {L(
                      "Busiz yashay olmaymiz: non, suv, dori, kiyim, sog'lom taom.",
                      "Без этого мы не сможем прожить: хлеб, вода, лекарства, тепло.",
                      "Essential for survival: food, water, medicine, housing."
                    )}
                  </p>
                </div>
              </div>
            </AppCard>

            <AppCard th={th} style={{ background: th.am + ALPHA.faint, border: "1px solid " + th.am + ALPHA.med, marginBottom: SPACE.s3 }}>
              <div style={{ display: "flex", gap: SPACE.s3 }}>
                <span style={{ fontSize: 24 }}>🎮</span>
                <div>
                  <h4 style={{ ...TYPE.subtitle, color: th.am, fontWeight: 800, margin: 0 }}>
                    {L("Xohish (Want)", "Хочу (Желание)", "Want")}
                  </h4>
                  <p style={{ ...TYPE.caption, color: th.t2, margin: "2px 0 0 0", fontSize: 13, lineHeight: 1.4 }}>
                    {L(
                      "Hayotni qiziq qiladi, lekin shart emas: o'yinchoqlar, konfet, o'yin konsoli.",
                      "Делает жизнь веселее, но не обязательно: сладости, игры, приставки.",
                      "Makes life fun but not strictly necessary: toys, candies, gadgets."
                    )}
                  </p>
                </div>
              </div>
            </AppCard>
          </div>

          <PrimaryButton th={th} onClick={startNewGame} style={{ marginTop: SPACE.s3 }}>
            {L("O'yinni boshlash", "Начать игру", "Start Game")}
          </PrimaryButton>
        </div>
      )}

      {/* ── PLAY PHASE ── */}
      {phase === "play" && items.length > 0 && (() => {
        const currentItem = items[curIdx];
        const isSelected = selected !== null;
        
        let cardBg = th.sur;
        let cardBdr = th.bor;
        
        if (isSelected) {
          if (feedback === "correct") {
            cardBg = th.gr + ALPHA.faint;
            cardBdr = th.gr;
          } else {
            cardBg = th.rd + ALPHA.faint;
            cardBdr = th.rd;
          }
        }

        return (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <PageHeader th={th} title={`${curIdx + 1} / ${items.length}`} onBack={() => setPhase("intro")} />
              
              {/* Progress Bar */}
              <div style={{ height: 6, width: "100%", background: th.bor, borderRadius: RADIUS.pill, marginBottom: 24, overflow: "hidden" }}>
                <div style={{ width: `${((curIdx + 1) / items.length) * 100}%`, height: "100%", background: th.ac, borderRadius: RADIUS.pill, transition: "width 0.3s" }} />
              </div>

              {/* Central item card */}
              <div className={feedback === "correct" ? "bg-pulse" : feedback === "wrong" ? "bg-shake" : ""}
                style={{
                  background: cardBg,
                  border: "2px solid " + cardBdr,
                  borderRadius: RADIUS.l,
                  padding: "40px 20px",
                  textAlign: "center",
                  boxShadow: SHADOW.e1(cardBdr),
                  marginBottom: 32,
                  transition: "background 0.25s, border-color 0.25s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}>
                <div style={{ fontSize: 72, marginBottom: SPACE.s3 }}>{currentItem.icon}</div>
                <h3 style={{ ...TYPE.heading, color: th.t1, fontSize: 26, fontWeight: 900, margin: 0 }}>
                  {currentItem.title[lg] || currentItem.title.uz}
                </h3>
                
                {/* Feedback text */}
                {isSelected && (
                  <div style={{ marginTop: 16 }}>
                    <Badge th={th} tone={feedback === "correct" ? th.gr : th.rd}>
                      {feedback === "correct" 
                        ? L("To'g'ri topdingiz! 🎉", "Правильно! 🎉", "Correct! 🎉") 
                        : L("Xato! Bu boshqa guruhga tegishli", "Неверно! Это другая категория", "Wrong! That's in the other category")}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: SPACE.s3, marginBottom: SPACE.s2 }}>
              <button className="ui-press" onClick={() => handleChoice("need")} disabled={isSelected}
                style={{
                  flex: 1,
                  background: isSelected && selected === "need" && feedback === "wrong" ? th.rd : th.gr,
                  border: "none",
                  borderRadius: RADIUS.m,
                  padding: "16px",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontWeight: 800,
                  fontSize: 18,
                  cursor: isSelected ? "default" : "pointer",
                  opacity: isSelected && selected !== "need" ? 0.4 : 1,
                  boxShadow: SHADOW.e1(th.gr)
                }}>
                🥦 {L("Kerak", "Нужно", "Need")}
              </button>
              
              <button className="ui-press" onClick={() => handleChoice("want")} disabled={isSelected}
                style={{
                  flex: 1,
                  background: isSelected && selected === "want" && feedback === "wrong" ? th.rd : th.am,
                  border: "none",
                  borderRadius: RADIUS.m,
                  padding: "16px",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontWeight: 800,
                  fontSize: 18,
                  cursor: isSelected ? "default" : "pointer",
                  opacity: isSelected && selected !== "want" ? 0.4 : 1,
                  boxShadow: SHADOW.e1(th.am)
                }}>
                🎮 {L("Xohish", "Хочу", "Want")}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── RESULT PHASE ── */}
      {phase === "result" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
          <div style={{ textAlign: "center", marginBottom: SPACE.s4 }}>
            <div style={{ display: "inline-flex", justifyContent: "center", transform: "scale(1.2)", marginBottom: SPACE.s2 }}>
              {score.correct >= 8 ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={PREMIUM.gold} strokeWidth="1.5">
                  <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4a1 1 0 01-1-1v-2.34c0-.37.2-.7.53-.86L10 11.23M20 11.23l6.47 2.57c.33.16.53.49.53.86V17a1 1 0 01-1 1h-5c-.55 0-1-.45-1-1v-2.34" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="6" y="2" width="12" height="12" rx="3"/>
                </svg>
              ) : (
                medalSvg(th.ac, 48)
              )}
            </div>
            <h2 style={{ ...TYPE.display, fontSize: 24, color: th.t1, margin: 0 }}>
              {score.correct >= 7 
                ? L("Ajoyib natija! 🎉", "Отличный результат! 🎉", "Great Job! 🎉") 
                : L("Yana urinib ko'r! 💪", "Попробуй еще раз! 💪", "Try Again! 💪")}
            </h2>
            <p style={{ ...TYPE.subtitle, color: th.t2, margin: "6px 0 0 0" }}>
              {score.correct} / {items.length} {L("to'g'ri", "верно", "correct")} ({Math.round(score.correct / items.length * 100)}%)
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
            <StatCard th={th} value={score.correct} label={L("To'g'ri", "Верно", "Correct")} tone={th.gr} />
            <StatCard th={th} value={score.wrong} label={L("Xato", "Xato", "Wrong")} tone={th.rd} />
            <StatCard th={th} value={`${elapsed}s`} label={L("Vaqt", "Время", "Time")} tone={th.ac} />
            <StatCard th={th} value={`x${score.maxCombo}`} label="Combo" tone={th.am} />
          </div>

          {/* Earned Coins */}
          <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, marginBottom: SPACE.s2 }}>
            {coinIco(PREMIUM.gold, 28)}
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

          {/* Dynamic Tier Progress Card */}
          {(() => {
            const { cur, next } = tierFor(totalCoins);
            let tierPct = 100;
            let progressText = "";
            if (next) {
              const base = cur ? cur.need : 0;
              const diff = next.need - base;
              tierPct = Math.min(100, Math.max(0, ((totalCoins - base) / diff) * 100));
              progressText = L(
                `${next.need - totalCoins} coin keyingi darajaga (${next[lg] || next.uz})`,
                `До следующего уровня (${next[lg] || next.uz}) осталось ${next.need - totalCoins} монет`,
                `${next.need - totalCoins} coins to next level (${next[lg] || next.uz})`
              );
            } else {
              progressText = L("Siz afsonaviy darajadasiz!", "Вы на легендарном уровне!", "You are at the Legend level!");
            }
            const tierName = cur ? cur[lg] || cur.uz : L("Boshlang'ich", "Новичок", "Novice");
            const tierColor = cur ? cur.color : th.ac;
            return (
              <AppCard th={th} style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, background: th.sur, border: "1px solid " + th.bor, marginBottom: SPACE.s3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
                  {medalSvg(tierColor, 28)}
                  <div style={{ flex: 1 }}>
                    <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>
                      {L("Sizning darajangiz", "Ваш уровень", "Your Tier")}
                    </div>
                    <div style={{ ...TYPE.title, color: tierColor, fontSize: 18, fontWeight: 800 }}>
                      {tierName} ({totalCoins} {L("coin", "монет", "coins")})
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

          {/* Action buttons */}
          <PrimaryButton th={th} onClick={startNewGame}>
            {L("Qayta o'ynash", "Играть еще раз", "Play Again")}
          </PrimaryButton>
          
          <button className="ui-press" onClick={() => setPhase("intro")}
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
            {L("Ortga qaytish", "Назад в меню", "Back")}
          </button>
        </div>
      )}

    </div>
  );
}
