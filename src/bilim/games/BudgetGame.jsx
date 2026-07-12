// ═══════════════════════════════════════════════════════════
//  BUDGET ALLOCATION GAME: Haftalik byudjet (Moliyaviy Savodxonlik)
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE, MOTION } from "../../utils/tokens.js";
import { addCoins, logGameSession, bestForGame, readCoins } from "../engine/persist.js";
import { addXp, readXp, levelFor, didLevelUp } from "../engine/xp.js";
import { DIFF, rewardOf, tierFor, medalSvg } from "../registry.jsx";
import { playSound } from "../engine/sound.js";

const coinIco = (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".2"/><path d="M10 7v6M8 10h4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;

export default function BudgetGame({ user, lg = "uz", dark, gameId = "finance/budget", name, onBack }) {
  const th = dark ? PALETTE.dark : PALETTE.light;
  const uz = lg === "uz";
  const ru = lg === "ru";
  const en = lg === "en";

  const L = (uzVal, ruVal, enVal) => {
    if (ru) return ruVal || uzVal;
    if (en) return enVal || uzVal;
    return uzVal;
  };

  const TOTAL_BUDGET = 20000;
  const STEP = 1000;

  // Budget Categories Config
  const initialCategories = [
    {
      id: "food",
      name: { uz: "Oziq-ovqat", ru: "Еда", en: "Food" },
      icon: "🍎",
      min: 5000,
      target: 8000,
      allocated: 0,
      desc: { 
        uz: "Busiz yashab bo'lmaydi. Sog'lom va mazali taomlar uchun.",
        ru: "Без этого не прожить. Для здоровой и вкусной еды.",
        en: "Cannot live without it. For healthy and delicious food."
      }
    },
    {
      id: "school",
      name: { uz: "Maktab", ru: "Школа", en: "School" },
      icon: "📚",
      min: 3000,
      target: 5000,
      allocated: 0,
      desc: {
        uz: "Darslik, daftar va ruchkalar uchun zarur xarajat.",
        ru: "Книги, тетради и ручки. Необходимые расходы.",
        en: "Textbooks, notebooks and pens. Required expenses."
      }
    },
    {
      id: "savings",
      name: { uz: "Jamg'arma", ru: "Копилка", en: "Savings" },
      icon: "🏦",
      min: 2000,
      target: 4000,
      allocated: 0,
      desc: {
        uz: "Kelajakdagi orzularingiz yoki kutilmagan kunlar uchun.",
        ru: "Для будущих целей и непредвиденных ситуаций.",
        en: "For future goals or unexpected situations."
      }
    },
    {
      id: "fun",
      name: { uz: "O'yin-kulgi", ru: "Развлечения", en: "Entertainment" },
      icon: "🎈",
      min: 0,
      target: 3000,
      allocated: 0,
      desc: {
        uz: "O'yinchoqlar, shirinliklar yoki kino uchun (xohish).",
        ru: "Игрушки, сладости или кино (желания).",
        en: "Toys, candies or movies (wants)."
      }
    }
  ];

  // Game states
  const [phase, setPhase] = useState("intro"); // intro | play | result
  const [categories, setCategories] = useState(initialCategories);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // Persistence/results states
  const [totalCoins, setTotalCoins] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [record, setRecord] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [saved, setSaved] = useState(false);
  const savingRef = useRef(false);

  // Load user coins on mount
  useEffect(() => {
    if (user?.id) {
      readCoins(user.id).then(setTotalCoins);
    }
  }, [user?.id]);

  // Timer loop during play
  useEffect(() => {
    if (phase === "play") {
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds(p => p + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startNewGame = () => {
    // Reset categories with 0 allocated
    setCategories(initialCategories.map(c => ({ ...c, allocated: 0 })));
    setTotalSpent(0);
    setIsSuccess(false);
    setFeedbackMsg("");
    setSaved(false);
    savingRef.current = false;
    setPhase("play");
  };

  const handleAdjust = (id, direction) => {
    setCategories(prev => {
      const nextCats = prev.map(c => {
        if (c.id === id) {
          const nextVal = direction === "+" ? c.allocated + STEP : c.allocated - STEP;
          if (nextVal < 0) return c;
          // check if we have enough total budget left
          const diff = nextVal - c.allocated;
          if (totalSpent + diff > TOTAL_BUDGET) return c;
          return { ...c, allocated: nextVal };
        }
        return c;
      });
      // Recalculate total spent
      const total = nextCats.reduce((sum, c) => sum + c.allocated, 0);
      setTotalSpent(total);
      return nextCats;
    });
  };

  const handleVerifyBudget = () => {
    // Check constraints
    if (totalSpent < TOTAL_BUDGET) {
      playSound.wrong();
      setFeedbackMsg(L(
        `Sizda hali ${TOTAL_BUDGET - totalSpent} so'm pul qoldi! Pulning hammasini taqsimlashingiz kerak.`,
        `У вас осталось еще ${TOTAL_BUDGET - totalSpent} сум! Распределите весь бюджет.`,
        `You still have ${TOTAL_BUDGET - totalSpent} UZS left! Allocate the entire budget.`
      ));
      return;
    }

    const food = categories.find(c => c.id === "food");
    const school = categories.find(c => c.id === "school");
    const savings = categories.find(c => c.id === "savings");

    if (food.allocated < food.min) {
      playSound.wrong();
      setFeedbackMsg(L(
        "Oziq-ovqat uchun juda kam ajratildi! Sog'lom ovqatlanish hayot uchun eng muhim ehtiyojdir.",
        "Выделили слишком мало на еду! Здоровое питание — это важнейшая потребность для жизни.",
        "Allocated too little for food! Healthy nutrition is the most essential need for life."
      ));
      return;
    }

    if (school.allocated < school.min) {
      playSound.wrong();
      setFeedbackMsg(L(
        "Maktab qurollariga yetarli ajratilmadi! Kitob va darsliklar bilim olish uchun juda muhim.",
        "Недостаточно на школу! Книги и учебники очень важны для получения знаний.",
        "Not enough for school! Books and school supplies are very important for education."
      ));
      return;
    }

    if (savings.allocated < savings.min) {
      playSound.wrong();
      setFeedbackMsg(L(
        "Jamg'armaga yetarli pul solinmadi! Kelajakdagi orzularingiz uchun pul yig'ishni odat qiling.",
        "Мало денег в копилке! Сделайте привычкой откладывать на будущие цели.",
        "Not enough in savings! Make it a habit to save money for your future goals."
      ));
      return;
    }

    // Success!
    setIsSuccess(true);
    setFeedbackMsg(L(
      "Ajoyib! Siz o'z byudjetingizni ideal darajada taqsimladingiz. Hamma muhim ehtiyojlar qoplandi!",
      "Отлично! Вы идеально распределили свой бюджет. Все важные потребности покрыты!",
      "Fantastic! You perfectly allocated your budget. All important needs are fully covered!"
    ));
    playSound.victory();
    setPhase("result");
  };

  // Save progress on success
  useEffect(() => {
    if (phase !== "result" || !isSuccess || savingRef.current || !user?.id) return;
    savingRef.current = true;

    (async () => {
      const prevBest = await bestForGame(user.id, gameId);
      const beforeXp = await readXp(user.id);

      // standard rewards for finance budget: maxCoin=15, flat 15 coins on success, 25 XP
      const coinsReward = 15;
      const xpReward = 25;

      const updatedCoins = await addCoins(user.id, coinsReward);
      setTotalCoins(updatedCoins);
      const afterXp = await addXp(user.id, xpReward);
      const isRec = coinsReward > prevBest;
      const lvlUp = didLevelUp(beforeXp, afterXp);

      await logGameSession(user.id, {
        gameId,
        subject: "finance",
        correct: 1, // binary success
        total: 1,
        pct: 100,
        seconds,
        maxCombo: 1,
        coins: coinsReward,
        xp: xpReward,
        difficulty: "medium",
        newRecord: isRec,
      });

      setEarnedCoins(coinsReward);
      setEarnedXp(xpReward);
      setRecord(isRec);
      setLeveledUp(lvlUp);
      setNewLevel(levelFor(afterXp).level);
      setSaved(true);
    })();
  }, [phase, isSuccess, user?.id, seconds, gameId]);

  const leftAmount = TOTAL_BUDGET - totalSpent;

  return (
    <div style={{ padding: SPACE.s3, minHeight: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      
      {/* ── INTRO PHASE ── */}
      {phase === "intro" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <PageHeader th={th} title={L("Haftalik Byudjet", "Еженедельный Бюджет", "Weekly Budget")} onBack={onBack} />
            
            <div style={{ textAlign: "center", margin: "24px 0" }}>
              <div style={{ width: 80, height: 80, borderRadius: RADIUS.l, background: th.am + ALPHA.soft, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: SPACE.s3 }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={th.am} strokeWidth="1.8">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ ...TYPE.heading, color: th.t1, fontSize: 24, fontWeight: 900, marginBottom: SPACE.s2 }}>
                {L("Pulni to'g'ri taqsimlash", "Учись планировать бюджет", "Budget Planning")}
              </h2>
              <p style={{ ...TYPE.caption, color: th.t2, fontSize: 15, lineHeight: 1.5, maxWidth: 320, margin: "0 auto" }}>
                {L(
                  "Sizga 20 000 so'm haftalik pul beriladi. Siz uni barcha zaruriy va qo'shimcha toifalarga muvozanatli taqsimlashingiz kerak!",
                  "Вам дается 20 000 сум на неделю. Распределите их правильно между важными покупками и развлечениями!",
                  "You are given 20,000 UZS for a week. Balance this budget across critical needs and minor wants!"
                )}
              </p>
            </div>

            <AppCard th={th} style={{ background: th.sur, border: "1px solid " + th.bor, marginBottom: SPACE.s3 }}>
              <h4 style={{ ...TYPE.subtitle, color: th.t1, fontWeight: 800, margin: "0 0 8px 0" }}>
                {L("O'yin qoidalari:", "Правила игры:", "Game Rules:")}
              </h4>
              <ul style={{ ...TYPE.caption, color: th.t2, paddingLeft: 20, margin: 0, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 6 }}>
                <li>{L("Barcha 20 000 so'm pul oxirigacha taqsimlanishi shart (Qolgan pul 0 bo'lsin).", "Все 20 000 сум должны быть распределены до конца.", "All 20,000 UZS must be fully allocated.")}</li>
                <li>{L("Oziq-ovqat (kamida 5 000 so'm) va Maktab (kamida 3 000 so'm) birinchi o'rinda bo'lishi kerak.", "Еда (минимум 5 000) и Школа (минимум 3 000) — в первую очередь.", "Food (min 5,000) and School (min 3,000) are top priorities.")}</li>
                <li>{L("Kelajak uchun Jamg'arma (kamida 2 000 so'm) solishni unutmang!", "Не забудьте положить в Копилку минимум 2 000 сум!", "Don't forget to save at least 2,000 UZS in Savings!")}</li>
              </ul>
            </AppCard>
          </div>

          <PrimaryButton th={th} onClick={startNewGame} style={{ marginTop: SPACE.s3 }}>
            {L("Rejalashtirishni boshlash", "Начать планирование", "Start Planning")}
          </PrimaryButton>
        </div>
      )}

      {/* ── PLAY PHASE ── */}
      {phase === "play" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <PageHeader th={th} title={L("Byudjet tuzish", "Составление бюджета", "Create Budget")} onBack={() => setPhase("intro")} />
            
            {/* Top Indicator Bar: Budget Left */}
            <div style={{ 
              background: leftAmount === 0 ? th.gr + ALPHA.faint : leftAmount > 0 ? th.ac + ALPHA.faint : th.rd + ALPHA.faint, 
              border: "1px solid " + (leftAmount === 0 ? th.gr : leftAmount > 0 ? th.ac : th.rd),
              borderRadius: RADIUS.m, 
              padding: "16px", 
              textAlign: "center", 
              marginBottom: 20,
              boxSizing: "border-box"
            }}>
              <div style={{ ...TYPE.tiny, textTransform: "none", color: th.t2 }}>
                {L("Taolangan / Jami", "Распределено / Всего", "Allocated / Total")}
              </div>
              <div style={{ ...TYPE.title, fontSize: 24, fontWeight: 900, color: leftAmount === 0 ? th.gr : th.t1, margin: "4px 0" }}>
                {totalSpent.toLocaleString()} / {TOTAL_BUDGET.toLocaleString()} so'm
              </div>
              <div style={{ ...TYPE.caption, fontWeight: 700, color: leftAmount === 0 ? th.gr : th.ac }}>
                {leftAmount === 0 
                  ? L("Byudjet tayyor! 🎉", "Бюджет готов! 🎉", "Budget ready! 🎉") 
                  : L(`Qolgan pul: ${leftAmount.toLocaleString()} so'm`, `Осталось: ${leftAmount.toLocaleString()} сум`, `Money remaining: ${leftAmount.toLocaleString()} UZS`)}
              </div>
            </div>

            {/* Live Feedback Notification */}
            {feedbackMsg && (
              <div style={{ marginBottom: 16 }}>
                <Badge th={th} tone={th.rd} style={{ display: "block", textAlign: "left", padding: "10px 14px", lineHeight: 1.4 }}>
                  ⚠️ {feedbackMsg}
                </Badge>
              </div>
            )}

            {/* Steppers for Categories */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {categories.map(c => {
                const pct = Math.min(100, Math.round((c.allocated / c.target) * 100));
                const hasMetMin = c.allocated >= c.min;
                
                return (
                  <AppCard key={c.id} th={th} style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 22 }}>{c.icon}</span>
                        <div>
                          <span style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1 }}>{c.name[lg] || c.name.uz}</span>
                          {c.min > 0 && <span style={{ ...TYPE.tiny, background: th.bor, padding: "2px 6px", borderRadius: RADIUS.pill, marginLeft: 6, color: th.t2 }}>Min: {c.min.toLocaleString()}</span>}
                        </div>
                      </div>
                      
                      {/* Stepper controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button className="ui-press" onClick={() => handleAdjust(c.id, "-")} disabled={c.allocated <= 0}
                          style={{
                            width: 36, height: 36, borderRadius: RADIUS.s, background: th.bor, border: "none", 
                            color: th.t1, fontSize: 18, fontWeight: 800, cursor: c.allocated <= 0 ? "default" : "pointer"
                          }}>-</button>
                        
                        <span style={{ ...TYPE.subtitle, fontSize: 15, fontWeight: 800, minWidth: 60, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                          {c.allocated.toLocaleString()}
                        </span>
                        
                        <button className="ui-press" onClick={() => handleAdjust(c.id, "+")} disabled={leftAmount <= 0}
                          style={{
                            width: 36, height: 36, borderRadius: RADIUS.s, background: leftAmount <= 0 ? th.bor : th.ac, border: "none", 
                            color: leftAmount <= 0 ? th.t3 : "#fff", fontSize: 18, fontWeight: 800, cursor: leftAmount <= 0 ? "default" : "pointer"
                          }}>+</button>
                      </div>
                    </div>

                    {/* Progress relative to standard recommendation */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", ...TYPE.tiny, color: th.t3, marginBottom: 4 }}>
                        <span>{L("Tavsiya:", "Рекомендуется:", "Recommended:")} {c.target.toLocaleString()}</span>
                        <span style={{ fontWeight: 700, color: hasMetMin ? th.gr : th.rd }}>
                          {hasMetMin ? L("Yetarli", "Достаточно", "Sufficient") : L("Kam", "Мало", "Too low")}
                        </span>
                      </div>
                      <div style={{ height: 6, width: "100%", background: th.bor, borderRadius: RADIUS.pill, overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", background: hasMetMin ? th.gr : th.am, borderRadius: RADIUS.pill, transition: "width 0.25s" }} />
                      </div>
                    </div>
                  </AppCard>
                );
              })}
            </div>
          </div>

          <PrimaryButton th={th} onClick={handleVerifyBudget} style={{ marginTop: 24 }}>
            🎯 {L("Byudjetni tasdiqlash", "Проверить бюджет", "Verify Budget")}
          </PrimaryButton>
        </div>
      )}

      {/* ── RESULT PHASE ── */}
      {phase === "result" && isSuccess && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
          <div style={{ textAlign: "center", marginBottom: SPACE.s4 }}>
            <div style={{ display: "inline-flex", justifyContent: "center", transform: "scale(1.2)", marginBottom: SPACE.s2 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={PREMIUM.gold} strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" stroke={PREMIUM.gold} fill={PREMIUM.gold} fillOpacity="0.1" />
                <path d="M8 12.5l3 3 5-6" stroke={PREMIUM.gold} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <h2 style={{ ...TYPE.display, fontSize: 24, color: th.t1, margin: 0 }}>
              {L("Muvaffaqiyatli byudjet! 🏆", "Бюджет спланирован! 🏆", "Successful Budget! 🏆")}
            </h2>
            <p style={{ ...TYPE.caption, color: th.t2, fontSize: 14, margin: "8px 0 0 0", lineHeight: 1.4, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
              {feedbackMsg}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
            <StatCard th={th} value="100%" label={L("Samaradorlik", "Эффективность", "Efficiency")} tone={th.gr} />
            <StatCard th={th} value="4 / 4" label={L("Toifalar", "Категории", "Categories")} tone={th.ac} />
            <StatCard th={th} value={`${seconds}s`} label={L("Vaqt", "Время", "Time")} tone={th.ac2} />
            <StatCard th={th} value="Min" label={L("Munosib", "В норме", "Min met")} tone={th.gr} />
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
