import { useState, useEffect, useRef } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, PREMIUM, PALETTE } from "../../utils/tokens.js";
import { useGameEngine } from "../engine/useGameEngine.js";
import { patternShapesGenerator, PATTERN_SHAPES_META } from "./generators/patternShapes.js";
import { addCoins, logGameSession, saveLevelProgress } from "../engine/persist.js";
import { addXp } from "../engine/xp.js";
import { playSound } from "../engine/sound.js";
import { starsFor } from "./levels/logicLevels.js";
import { Flame, Star, ArrowRight } from "lucide-react";

// Inline beautiful SVG outline icons for shapes
export const PatternShapeIcon = ({ shapeId, color, size = 32, style = {} }) => {
  const s = size;
  const fillOpacity = 0.15;
  
  switch (shapeId) {
    case "coin":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <circle cx="12" cy="12" r="10" fill={color} fillOpacity={fillOpacity} />
          <path d="M12 8v8M9 12h6" />
        </svg>
      );
    case "note":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <rect x="2" y="5" width="20" height="14" rx="2" fill={color} fillOpacity={fillOpacity} />
          <line x1="6" y1="12" x2="18" y2="12" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "card":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <rect x="2" y="5" width="20" height="14" rx="2" fill={color} fillOpacity={fillOpacity} />
          <line x1="2" y1="10" x2="22" y2="10" />
          <rect x="6" y="14" width="3" height="1" />
        </svg>
      );
    case "piggy":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <path d="M19 5c-1.5 0-2.8.9-3.4 2.2C14.8 6.3 13.5 5.5 12 5.5s-2.8.8-3.6 2.2C7.8 6.4 6.5 5.5 5 5.5 2.2 5.5 0 7.8 0 10.5c0 4.5 4.5 9.5 12 11.5 7.5-2 12-7 12-11.5C24 7.8 21.8 5.5 19 5.5z" fill={color} fillOpacity={fillOpacity} />
          <circle cx="9" cy="11" r="1.5" fill={color} />
          <path d="M16 11.5c.5-.5.5-1.5 0-2" />
        </svg>
      );
    case "star":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
    case "heart":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
    case "shield":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
    case "gem":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <polygon points="6 3 18 3 22 9 12 21 2 9 6 3" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

export default function PatternGame({ user, lg = "uz", dark, gameId = "logic/pattern-shapes", level, onBack, onNextLevel }) {
  const uz = lg === "uz";
  const th = dark ? PALETTE.dark : PALETTE.light;

  const [difficulty, setDifficulty] = useState("easy");
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState(null);
  const [streak, setStreak] = useState(0);

  // Initialize Game Engine
  const eng = useGameEngine({
    questionCount: level ? level.questionCount : 8,
    generator: patternShapesGenerator,
    startDifficulty: level ? level.difficulty : difficulty,
    name: "Naqsh davomi",
    lg,
    rewards: { coin: 1.8, xp: 3 }
  });

  const handleStart = (selectedDiff) => {
    setDifficulty(selectedDiff);
    eng.start();
  };

  useEffect(() => {
    if (level) {
      setDifficulty(level.difficulty);
    }
  }, [level]);

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
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [eng.phase]);

  const handleAnswerSelect = (option) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(option);

    const correct = option === eng.question.answer;
    setIsCorrectFeedback(correct);

    if (correct) {
      playSound.correct();
      setStreak(s => s + 1);
    } else {
      playSound.wrong();
      setStreak(0);
    }

    eng.answer(option);
  };

  const hasSavedRef = useRef(false);
  useEffect(() => {
    if (eng.phase === "result" && eng.result && !hasSavedRef.current) {
      hasSavedRef.current = true;

      const r = eng.result;
      const pct = Math.round((r.correct / r.total) * 100);
      const stars = level ? starsFor(pct, level.passPct) : (r.correct >= 7 ? 3 : r.correct >= 5 ? 2 : r.correct >= 3 ? 1 : 0);

      if (stars > 0) {
        playSound.victory();
      } else {
        playSound.wrong();
      }

      if (user?.id) {
        addCoins(user.id, r.coins);
        addXp(user.id, r.xp);
        logGameSession(user.id, {
          gameId,
          correct: r.correct,
          total: r.total,
          pct,
          seconds: r.seconds,
          coins: r.coins,
          xp: r.xp,
          difficulty: difficulty
        });

        if (level && stars > 0) {
          saveLevelProgress(user.id, "logic", level.id, stars);
        }
      }
    } else if (eng.phase !== "result") {
      hasSavedRef.current = false;
    }
  }, [eng.phase, eng.result, user, gameId, difficulty, level]);

  if (eng.phase === "intro") {
    return (
      <div>
        <PageHeader th={th} title={uz ? "Naqsh davomi" : lg === "ru" ? "Продолжи узор" : "Pattern Continuation"} onBack={onBack} />
        
        <div style={{ padding: SPACE.s4, textAlign: "center", display: "flex", flexDirection: "column", gap: SPACE.s4 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: RADIUS.l,
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            boxShadow: SHADOW.e1("#a855f7")
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <div>
            <h2 style={{ ...TYPE.heading, color: th.t1 }}>
              {uz ? "Vizual naqshlar qonuniyatini top" : lg === "ru" ? "Найди закономерность фигур" : "Find the Pattern of Shapes"}
            </h2>
            <p style={{ ...TYPE.caption, color: th.t2, marginTop: SPACE.s2, lineHeight: 1.4 }}>
              {uz 
                ? "Ekranda ko'rsatilgan shakllar qatorini diqqat bilan o'rgan. Bo'sh qatorda qaysi shakl turishini mantiqan aniqla va to'g'ri javobni tanla!" 
                : lg === "ru"
                ? "Внимательно изучи ряд фигур на экране. Логически определи, какая фигура должна быть на пустом месте, и выбери правильный ответ!"
                : "Carefully study the sequence of shapes on the screen. Logically determine which shape belongs in the missing spot and select the correct answer!"}
            </p>
          </div>

          {level ? (
            <PrimaryButton th={th} onClick={() => handleStart(level.difficulty)} style={{ marginTop: SPACE.s4 }}>
              {uz ? "Boshlash" : "Начать"}
            </PrimaryButton>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, marginTop: SPACE.s1 }}>
              <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t3, alignSelf: "flex-start" }}>
                {uz ? "Qiyinchilik darajasini tanlang:" : "Выберите сложность:"}
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: SPACE.s2 }}>
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleStart(d)}
                    className="ui-press"
                    style={{
                      background: difficulty === d ? "#a855f722" : th.sur,
                      border: difficulty === d ? "2px solid #a855f7" : "1px solid " + th.bor,
                      borderRadius: RADIUS.m,
                      padding: SPACE.s3,
                      color: difficulty === d ? "#a855f7" : th.t2,
                      fontFamily: "inherit",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {d === "easy" ? (uz ? "Oson" : "Легко") : d === "medium" ? (uz ? "O'rtacha" : "Средне") : (uz ? "Qiyin" : "Сложно")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (eng.phase === "countdown") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 120,
          height: 120,
          borderRadius: RADIUS.full,
          background: "linear-gradient(135deg, #a855f7, #6366f1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: SHADOW.e2
        }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>{uz ? "TAYYOR" : "ГОТОВ"}</span>
        </div>
      </div>
    );
  }

  if (eng.phase === "result" && eng.result) {
    const r = eng.result;
    const pct = Math.round((r.correct / r.total) * 100);
    const finalStars = level ? starsFor(pct, level.passPct) : (r.correct >= 7 ? 3 : r.correct >= 5 ? 2 : r.correct >= 3 ? 1 : 0);
    const mm = Math.floor(r.seconds / 60), ss = r.seconds % 60;

    return (
      <div style={{ paddingBottom: SPACE.s8 }}>
        <PageHeader th={th} title={uz ? "Natija" : "Результат"} onBack={level ? onBack : () => eng.setPhase("intro")} />
        
        <div style={{
          background: "linear-gradient(135deg, #a855f7, #6366f1)",
          borderRadius: RADIUS.l,
          padding: SPACE.s6 + "px " + SPACE.s4,
          textAlign: "center",
          marginBottom: SPACE.s4,
          boxShadow: SHADOW.e1("#a855f7")
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PREMIUM.gold} strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M9 12h6" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", color: th.t2 }}>{uz ? "Topilgan coinlar" : "Получено монет"}</div>
            <div style={{ ...TYPE.title, color: th.t1 }}>+{r.coins}</div>
          </div>
        </AppCard>

        {level && onNextLevel && finalStars >= 1 && (
          <PrimaryButton th={th} onClick={onNextLevel} style={{ marginTop: SPACE.s2, background: th.gr }}>
            {uz ? "Keyingi bosqich" : "Следующий уровень"}
          </PrimaryButton>
        )}
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

  const question = eng.question;
  const meta = question?.meta || {};
  const values = meta.values || [];
  const missingIdx = meta.missingIdx ?? -1;

  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", gap: SPACE.s4 }}>
      {/* HUD Stats */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1, marginRight: SPACE.s3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ ...TYPE.caption, color: th.t2, fontWeight: 700 }}>
              {uz ? `Savol ${eng.qIndex + 1}/${level ? level.questionCount : 8}` : `Вопрос ${eng.qIndex + 1}/${level ? level.questionCount : 8}`}
            </span>
            <span style={{ ...TYPE.caption, color: "#a855f7", fontWeight: 700 }}>
              {difficulty.toUpperCase()}
            </span>
          </div>
          <div style={{ height: 6, background: th.bor, borderRadius: RADIUS.pill, overflow: "hidden" }}>
            <div style={{ width: `${eng.progress}%`, height: "100%", background: "#a855f7", borderRadius: RADIUS.pill, transition: "width .2s" }} />
          </div>
        </div>
        {streak > 2 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: th.am + "1F", padding: "4px 10px", borderRadius: RADIUS.pill }}>
            <Flame size={16} color={th.am} />
            <span style={{ fontSize: 13, fontWeight: 800, color: th.am }}>x{streak}</span>
          </div>
        )}
      </div>

      {/* Main Pattern Track */}
      <div style={{
        background: th.sur,
        border: "1.5px solid " + th.bor,
        borderRadius: RADIUS.l,
        padding: "32px 16px",
        display: "flex",
        flexDirection: "column",
        gap: SPACE.s4,
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {values.map((v, i) => {
            const isMissing = i === missingIdx;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  background: isMissing ? "#a855f714" : th.bg,
                  border: isMissing ? "2.5px dashed #a855f7" : "1.5px solid " + th.bor,
                  borderRadius: RADIUS.l,
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isMissing ? "0 0 12px #a855f733" : SHADOW.e1(th.bor),
                  transition: "all 0.2s"
                }}>
                  {isMissing ? (
                    <span style={{ fontSize: 24, fontWeight: 900, color: "#a855f7" }}>?</span>
                  ) : (
                    <PatternShapeIcon shapeId={v} color={th.t1} size={30} />
                  )}
                </div>
                {i < values.length - 1 && (
                  <ArrowRight size={16} color={th.t3} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Options Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3, marginTop: "auto" }}>
        {question?.options?.map((opt, idx) => {
          const isSel = selectedOpt === opt;
          const isRightOpt = opt === question.answer;

          let bg = th.sur;
          let border = "1.5px solid " + th.bor;
          let color = th.t1;

          if (selectedOpt !== null) {
            if (isRightOpt) {
              bg = th.gr + "1A";
              border = "2.5px solid " + th.gr;
              color = th.gr;
            } else if (isSel) {
              bg = th.rd + "1A";
              border = "2.5px solid " + th.rd;
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
                borderRadius: RADIUS.l,
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: selectedOpt === null ? "pointer" : "default",
                transition: "all 0.15s"
              }}
            >
              <PatternShapeIcon shapeId={opt} color={color} size={34} />
              <span style={{ fontSize: 13, fontWeight: 700, color: color }}>
                {PATTERN_SHAPES_META[opt]?.[lg] || PATTERN_SHAPES_META[opt]?.uz || opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
