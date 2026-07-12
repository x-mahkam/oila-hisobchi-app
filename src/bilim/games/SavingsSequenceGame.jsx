import { useState, useEffect, useCallback, useRef } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE } from "../../utils/tokens.js";
import { useGameEngine } from "../engine/useGameEngine.js";
import { savingsSequenceGenerator } from "./generators/savingsSequence.js";
import { addCoins, logGameSession } from "../engine/persist.js";
import { addXp } from "../engine/xp.js";
import { playSound } from "../engine/sound.js";
import { TrendingUp, PiggyBank, Target, HelpCircle, Flame, Star, Trophy, ArrowRight } from "lucide-react";

// Inject required animations
const injectCss = () => {
  if (typeof document === "undefined" || document.getElementById("sequence-game-css")) return;
  const st = document.createElement("style");
  st.id = "sequence-game-css";
  st.textContent = `
@keyframes pulseGlow {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}
.pulse-glow {
  animation: pulseGlow 2s infinite;
}
`;
  document.head.appendChild(st);
};

export default function SavingsSequenceGame({ user, lg = "uz", dark, gameId = "logic/pattern", name = "", onBack }) {
  useEffect(() => {
    injectCss();
  }, []);

  const uz = lg === "uz";
  const th = dark ? PALETTE.dark : PALETTE.light;

  const [difficulty, setDifficulty] = useState("easy");
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [streak, setStreak] = useState(0);

  // Initialize Game Engine
  const eng = useGameEngine({
    questionCount: 10,
    generator: savingsSequenceGenerator,
    startDifficulty: difficulty,
    name: "Jamg'arma ketma-ketligi",
    lg,
    rewards: { coin: 1.5, xp: 2.5 }
  });

  const handleStart = (selectedDiff) => {
    setDifficulty(selectedDiff);
    eng.start();
  };

  // Sound & persist on finish
  useEffect(() => {
    if (eng.phase === "play" && eng.question) {
      setSelectedOpt(null);
      setIsCorrectFeedback(null);
    }
  }, [eng.phase, eng.qIndex, eng.question]);

  useEffect(() => {
    if (eng.phase === "countdown") {
      const timer = setTimeout(() => {
        eng.beginPlay();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [eng.phase]);

  // Handle choice submission
  const handleAnswerSelect = (option) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(option);
    
    const correct = option === eng.question.answer;
    setIsCorrectFeedback(correct);

    if (correct) {
      playSound.correct();
      setStreak(s => s + 1);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
    } else {
      playSound.wrong();
      setStreak(0);
    }

    eng.answer(option);
  };

  // Save session to persistent store when results phase is reached
  const hasSavedRef = useRef(false);
  useEffect(() => {
    if (eng.phase === "result" && eng.result && !hasSavedRef.current) {
      hasSavedRef.current = true;
      playSound.victory();

      const r = eng.result;
      if (user?.id) {
        addCoins(user.id, r.coins);
        addXp(user.id, r.xp);
        logGameSession(user.id, {
          gameId,
          correct: r.correct,
          total: r.total,
          seconds: r.seconds,
          coins: r.coins,
          xp: r.xp,
          difficulty: difficulty
        });
      }
    } else if (eng.phase !== "result") {
      hasSavedRef.current = false;
    }
  }, [eng.phase, eng.result, user, gameId, difficulty]);

  if (eng.phase === "intro") {
    return (
      <div>
        <PageHeader th={th} title={uz ? "Jamg'arma ketma-ketligi" : lg === "ru" ? "Последовательность накоплений" : "Savings Sequence"} onBack={onBack} />
        
        <div style={{ padding: SPACE.s4, textAlign: "center", display: "flex", flexDirection: "column", gap: SPACE.s4 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: RADIUS.l,
            background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            boxShadow: SHADOW.e1(th.ac)
          }}>
            <TrendingUp size={40} color="#fff" />
          </div>

          <div>
            <h2 style={{ ...TYPE.heading, color: th.t1 }}>
              {uz ? "Jamg'arma qonuniyatini top" : lg === "ru" ? "Найди закономерность" : "Find the Savings Pattern"}
            </h2>
            <p style={{ ...TYPE.caption, color: th.t2, marginTop: SPACE.s2, lineHeight: 1.4 }}>
              {uz 
                ? "Jamg'armalar o'sishi ketma-ketligini tahlil qil va keyingi qadamda qancha pul yig'ilishi kerakligini aniqla!" 
                : lg === "ru"
                ? "Проанализируй последовательность сбережений и определи, сколько денег нужно накопить на следующем шаге!"
                : "Analyze the savings sequence and determine how much money should be accumulated next!"}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, marginTop: SPACE.s1 }}>
            <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t3, alignSelf: "flex-start" }}>
              {uz ? "Qiyinchilik darajasini tanlang:" : lg === "ru" ? "Выберите сложность:" : "Select Difficulty:"}
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: SPACE.s2 }}>
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => handleStart(d)}
                  className="ui-press"
                  style={{
                    background: difficulty === d ? th.ac + "1F" : th.sur,
                    border: difficulty === d ? "2px solid " + th.ac : "1px solid " + th.bor,
                    borderRadius: RADIUS.m,
                    padding: SPACE.s3,
                    color: difficulty === d ? th.ac : th.t2,
                    fontFamily: "inherit",
                    fontWeight: 700,
                    textTransform: "capitalize",
                    cursor: "pointer"
                  }}
                >
                  {d === "easy" ? (uz ? "Oson" : "Легко") : d === "medium" ? (uz ? "O'rtacha" : "Средне") : (uz ? "Qiyin" : "Сложно")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (eng.phase === "countdown") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: RADIUS.full,
          background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: SHADOW.e2
        }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#fff" }}>{uz ? "TAYYOR" : "ГОТОВ"}</span>
        </div>
      </div>
    );
  }

  if (eng.phase === "result" && eng.result) {
    const r = eng.result;
    const finalStars = r.correct >= 9 ? 3 : r.correct >= 7 ? 2 : r.correct >= 5 ? 1 : 0;
    const mm = Math.floor(r.seconds / 60), ss = r.seconds % 60;

    return (
      <div style={{ paddingBottom: SPACE.s8 }}>
        <PageHeader th={th} title={uz ? "Natija" : "Результат"} onBack={() => eng.setPhase("intro")} />
        
        <div style={{
          background: "linear-gradient(135deg," + (finalStars > 0 ? th.gr : th.rd) + "," + th.ac2 + ")",
          borderRadius: RADIUS.l,
          padding: SPACE.s6 + "px " + SPACE.s4,
          textAlign: "center",
          marginBottom: SPACE.s4,
          boxShadow: SHADOW.e1(th.ac)
        }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: SPACE.s2 }}>
            {[1, 2, 3].map(s => (
              <Star key={s} size={32} fill={finalStars >= s ? PREMIUM.gold : "transparent"} stroke={finalStars >= s ? PREMIUM.gold : "rgba(255,255,255,0.4)"} />
            ))}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
            {finalStars > 0 ? (uz ? "Ajoyib!" : "Отлично!") : (uz ? "Yana urinib ko'ring!" : "Попробуйте ещё раз!")}
          </div>
          <div style={{ ...TYPE.subtitle, color: "#fff", marginTop: SPACE.s1, opacity: 0.9 }}>
            {r.correct}/{r.total} {uz ? "to'g'ri" : "верно"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatCard th={th} value={r.correct} label={uz ? "To'g'ri" : "Верно"} tone={th.gr} />
          <StatCard th={th} value={r.wrong} label={uz ? "Xato" : "Ошибки"} tone={th.rd} />
          <StatCard th={th} value={(mm ? mm + "m " : "") + ss + "s"} label={uz ? "Vaqt" : "Время"} tone={th.ac} />
          <StatCard th={th} value={"x" + r.maxCombo} label="Combo" tone={th.am} />
        </div>

        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, marginBottom: SPACE.s2 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: PREMIUM.gold + "1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PiggyBank size={24} color={PREMIUM.gold} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", color: th.t2 }}>{uz ? "Topilgan coinlar" : "Получено монет"}</div>
            <div style={{ ...TYPE.title, color: th.t1 }}>+{r.coins}</div>
          </div>
        </AppCard>

        <PrimaryButton th={th} onClick={() => handleStart(difficulty)} style={{ marginTop: SPACE.s2 }}>
          {uz ? "Qayta o'ynash" : "Играть снова"}
        </PrimaryButton>
        <button className="ui-press" onClick={onBack} style={{
          width: "100%",
          marginTop: SPACE.s2,
          background: "transparent",
          border: "none",
          color: th.t2,
          padding: SPACE.s3,
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 600
        }}>
          {uz ? "Orqaga" : "Назад"}
        </button>
      </div>
    );
  }

  // Active question metadata rendering
  const question = eng.question;
  const meta = question?.meta || {};
  const values = meta.values || [];
  const missingIdx = meta.missingIdx ?? -1;

  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
      {/* Top statistics */}
      <div style={{ display: "flex", justifySpace: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1, marginRight: SPACE.s3 }}>
          <div style={{ display: "flex", justifySpace: "space-between", marginBottom: 4 }}>
            <span style={{ ...TYPE.caption, color: th.t2, fontWeight: 700 }}>
              {uz ? `Savol ${eng.qIndex + 1}/10` : `Вопрос ${eng.qIndex + 1}/10`}
            </span>
            <span style={{ ...TYPE.caption, color: th.ac, fontWeight: 700 }}>
              {difficulty.toUpperCase()}
            </span>
          </div>
          <div style={{ height: 6, background: th.bor, borderRadius: RADIUS.pill, overflow: "hidden" }}>
            <div style={{ width: `${eng.progress}%`, height: "100%", background: th.ac, borderRadius: RADIUS.pill, transition: "width .2s" }} />
          </div>
        </div>
        {streak > 2 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: th.am + "1F", padding: "4px 10px", borderRadius: RADIUS.pill }}>
            <Flame size={16} color={th.am} />
            <span style={{ fontSize: 13, fontWeight: 800, color: th.am }}>x{streak}</span>
          </div>
        )}
      </div>

      {/* Visual Sequence cards qatorda */}
      <div style={{
        background: th.sur,
        border: "1px solid " + th.bor,
        borderRadius: RADIUS.l,
        padding: SPACE.s5,
        display: "flex",
        flexDirection: "column",
        gap: SPACE.s4,
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, flexWrap: "wrap", justifyContent: "center" }}>
          {values.map((v, i) => {
            const isMissing = i === missingIdx;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: SPACE.s2 }}>
                <div className={isMissing ? "pulse-glow" : ""} style={{
                  background: isMissing ? th.ac + "1F" : th.bg,
                  border: isMissing ? "2.5px dashed " + th.ac : "1.5px solid " + th.bor,
                  borderRadius: RADIUS.m,
                  padding: "14px 18px",
                  textAlign: "center",
                  minWidth: 100,
                  boxShadow: isMissing ? `0 0 12px ${th.ac}33` : "none",
                  transition: "all 0.3s"
                }}>
                  <div style={{ ...TYPE.tiny, textTransform: "uppercase", color: th.t3 }}>
                    {uz ? `${i + 1}-hafta` : `${i + 1}-неделя`}
                  </div>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: isMissing ? th.ac : th.t1,
                    marginTop: 4
                  }}>
                    {isMissing ? "?" : v.toLocaleString()}
                  </div>
                </div>
                {i < values.length - 1 && (
                  <ArrowRight size={18} color={th.t3} />
                )}
              </div>
            );
          })}
        </div>

        {/* Goal Card */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: SPACE.s2,
          background: PREMIUM.gold + "15",
          border: "1.5px solid " + PREMIUM.gold + "44",
          borderRadius: RADIUS.m,
          padding: "8px 16px",
          marginTop: SPACE.s1
        }}>
          <Target size={18} color={PREMIUM.gold} />
          <span style={{ fontSize: 13, fontWeight: 800, color: PREMIUM.gold }}>
            {uz ? `Maqsad: ${meta.goal?.toLocaleString()} so'm` : `Цель: ${meta.goal?.toLocaleString()} сум`}
          </span>
        </div>
      </div>

      {/* Choice Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3, marginTop: SPACE.s2 }}>
        {question?.options?.map((opt, idx) => {
          const isSel = selectedOpt === opt;
          const isRightOpt = opt === question.answer;

          let bg = th.sur;
          let border = "1.5px solid " + th.bor;
          let color = th.t1;

          if (selectedOpt !== null) {
            if (isRightOpt) {
              bg = th.gr + "1A";
              border = "2px solid " + th.gr;
              color = th.gr;
            } else if (isSel) {
              bg = th.rd + "1A";
              border = "2px solid " + th.rd;
              color = th.rd;
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(opt)}
              disabled={selectedOpt !== null}
              className="ui-press"
              style={{
                background: bg,
                border: border,
                borderRadius: RADIUS.m,
                padding: SPACE.s4,
                color: color,
                fontFamily: "inherit",
                fontSize: 16,
                fontWeight: 800,
                cursor: selectedOpt === null ? "pointer" : "default",
                minHeight: 64,
                transition: "all 0.15s"
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
