import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE } from "../../utils/tokens.js";
import { addCoins, logGameSession, saveLevelProgress, dailyCoinMultiplier } from "../engine/persist.js";
import { addXp } from "../engine/xp.js";
import { playSound } from "../engine/sound.js";
import { starsFor } from "./levels/logicLevels.js";
import { decisionScenarios } from "./data/decisionScenarios.js";
import { 
  Compass, 
  HelpCircle, 
  ArrowRight, 
  Coins, 
  Trophy, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Play, 
  Bookmark,
  Star
} from "lucide-react";

// Stsenariy matnlari hozircha faqat uz/ru tillarida. Boshqa tillar uchun eng
// yaqin tushunarli tilga qaytamiz: kirill yozuvli kk/ky/tg -> ru, qolganlar -> uz.
const scenarioText = (obj, lg) => {
  if (!obj) return "";
  if (obj[lg]) return obj[lg];
  if (lg === "kk" || lg === "ky" || lg === "tg") return obj.ru || obj.uz || "";
  return obj.uz || obj.ru || "";
};

export default function DecisionGame({ user, lg = "uz", dark, gameId = "logic/decision", name = "", level, onBack, onNextLevel }) {
  const { t } = useApp();
  const th = dark ? PALETTE.dark : PALETTE.light;

  const [phase, setPhase] = useState("intro"); // intro | play | feedback | result
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chosenOption, setChosenOption] = useState(null);
  const [runningTotals, setRunningTotals] = useState({ coins: 0, xp: 0 });
  const [history, setHistory] = useState([]); // tracks choices made
  const startTimeRef = useRef(0); // haqiqiy o'yin vaqti (ilgari 120s qotirilgan edi)

  // Start the game by picking scenarios based on level/difficulty
  const startGame = () => {
    let scenarios = [...decisionScenarios];
    if (level) {
      scenarios = scenarios.filter(s => s.difficulty === level.difficulty);
    }
    const count = level ? level.questionCount : 5;
    // MUHIM: har stsenariyning A/B variantlarini ARALASHTIRAMIZ. Ma'lumotda
    // to'g'ri (ijobiy) variant DOIM birinchi turardi — bola "A ni bos" degan
    // hiylani o'rganib olardi. To'g'rilik pozitsiyaga emas, opt.effect.coins ga
    // bog'liq, shuning uchun bu xavfsiz. Asl ma'lumotni buzmaslik uchun nusxa.
    const shuffled = scenarios
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map(s => ({ ...s, options: [...s.options].sort(() => Math.random() - 0.5) }));
    setSelectedScenarios(shuffled);
    setCurrentIndex(0);
    setChosenOption(null);
    setRunningTotals({ coins: 0, xp: 0 });
    setHistory([]);
    startTimeRef.current = Date.now();
    setPhase("play");
  };

  // Handle choosing an option
  const handleSelectOption = (opt) => {
    if (chosenOption !== null) return;
    setChosenOption(opt);

    const isPositive = opt.effect.coins >= 0;
    if (isPositive) {
      playSound.correct();
    } else {
      playSound.wrong();
    }

    // Accumulate scores (don't allow running totals to go below zero for coins if possible, though negative outcomes are allowed)
    setRunningTotals(prev => ({
      coins: prev.coins + opt.effect.coins,
      xp: prev.xp + opt.effect.xp
    }));

    setHistory(prev => [...prev, {
      scenarioId: selectedScenarios[currentIndex].id,
      opt,
      isPositive
    }]);

    setPhase("feedback");
  };

  // Move to next scenario or show results
  const handleNext = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= selectedScenarios.length) {
      finishGame();
    } else {
      setCurrentIndex(nextIdx);
      setChosenOption(null);
      setPhase("play");
    }
  };

  // Finish and save results
  const finishGame = () => {
    setPhase("result");

    const finalCoins = Math.max(0, runningTotals.coins);
    const finalXp = Math.max(0, runningTotals.xp);
    const correctCount = history.filter(h => h.isPositive).length;
    const totalCount = selectedScenarios.length || 5;

    const pct = Math.round((correctCount / totalCount) * 100);
    const stars = level ? starsFor(pct, level.passPct) : (correctCount === totalCount ? 3 : correctCount >= totalCount - 1 ? 2 : correctCount >= totalCount - 2 ? 1 : 0);

    if (stars > 0) {
      playSound.victory();
    } else {
      playSound.wrong();
    }

    if (user?.id) {
      (async () => {
        // Kunlik takror o'ynashda mukofot kamayadi (farmga qarshi, math kabi)
        const mult = await dailyCoinMultiplier(user.id, gameId);
        const dayCoins = Math.max(finalCoins > 0 ? 1 : 0, Math.round(finalCoins * mult));
        await addCoins(user.id, dayCoins);
        await addXp(user.id, finalXp);
        await logGameSession(user.id, {
          gameId,
          correct: correctCount,
          total: totalCount,
          pct,
          seconds: Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)),
          coins: dayCoins,
          xp: finalXp,
          difficulty: level ? level.difficulty : "hard"
        });

        if (level && stars > 0) {
          await saveLevelProgress(user.id, "logic", level.id, stars);
        }
      })();
    }
  };

  const currentScenario = selectedScenarios[currentIndex];

  if (phase === "intro") {
    return (
      <div>
        <PageHeader th={th} title={t("gam_dec_title")} onBack={onBack} />
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
            <Compass size={40} color="#fff" />
          </div>

          <div>
            <h2 style={{ ...TYPE.heading, color: th.t1 }}>
              {t("gam_dec_subtitle")}
            </h2>
            <p style={{ ...TYPE.caption, color: th.t2, marginTop: SPACE.s2, lineHeight: 1.4 }}>
              {t("gam_dec_intro")}
            </p>
          </div>

          <PrimaryButton th={th} onClick={startGame} style={{ marginTop: SPACE.s2 }}>
            {t("bd_startLabel")}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const finalCoins = Math.max(0, runningTotals.coins);
    const finalXp = Math.max(0, runningTotals.xp);
    const correctCount = history.filter(h => h.isPositive).length;
    const totalCount = selectedScenarios.length || 5;
    const pct = Math.round((correctCount / totalCount) * 100);
    const finalStars = level ? starsFor(pct, level.passPct) : (correctCount === totalCount ? 3 : correctCount >= totalCount - 1 ? 2 : correctCount >= totalCount - 2 ? 1 : 0);

    return (
      <div style={{ paddingBottom: SPACE.s8 }}>
        <PageHeader th={th} title={t("gam_result")} onBack={onBack} />
        
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
            {finalStars > 1 ? t("gam_dec_perfectFinancier") : t("gam_dec_goodAttempt")}
          </div>
          <div style={{ ...TYPE.subtitle, color: "#fff", marginTop: SPACE.s1, opacity: 0.9 }}>
            {t("gam_dec_summaryLine", { total: totalCount, correct: correctCount })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatCard th={th} value={`${correctCount}/${totalCount}`} label={t("gam_dec_wiseDecisions")} tone={th.gr} />
          <StatCard th={th} value={`${totalCount - correctCount}/${totalCount}`} label={t("gam_dec_unwiseDecisions")} tone={th.rd} />
        </div>

        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, marginBottom: SPACE.s2 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: PREMIUM.gold + "1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Coins size={24} color={PREMIUM.gold} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", color: th.t2 }}>{t("gam_dec_totalCoinsEarned")}</div>
            <div style={{ ...TYPE.title, color: th.t1 }}>+{finalCoins}</div>
          </div>
        </AppCard>

        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: th.ac2 + ALPHA.faint, border: "1px solid " + th.ac2 + ALPHA.med, marginBottom: SPACE.s4 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: th.ac2 + "1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={24} color={th.ac2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", color: th.t2 }}>{t("gam_dec_xpAccumulated")}</div>
            <div style={{ ...TYPE.title, color: th.t1 }}>+{finalXp}</div>
          </div>
        </AppCard>

        {level && onNextLevel && finalStars >= 1 && (
          <PrimaryButton th={th} onClick={onNextLevel} style={{ marginTop: SPACE.s2, background: th.gr }}>
            {t("gam_nextLevel")}
          </PrimaryButton>
        )}
        <PrimaryButton th={th} onClick={startGame} style={{ marginTop: SPACE.s2 }}>
          {t("gam_playAgain")}
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
          {t("gam_div_back")}
        </button>
      </div>
    );
  }

  // Active question layout
  const totalCount = selectedScenarios.length || 5;

  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
      {/* Step progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...TYPE.caption, color: th.t2, fontWeight: 700 }}>
          {t("gam_dec_situationOf", { n: currentIndex + 1, total: totalCount })}
        </span>
        <div style={{ width: 120, height: 6, background: th.bor, borderRadius: RADIUS.pill, overflow: "hidden" }}>
          <div style={{ width: `${((currentIndex + 1) / totalCount) * 100}%`, height: "100%", background: th.ac, borderRadius: RADIUS.pill, transition: "width .3s" }} />
        </div>
      </div>

      {/* Scenario display card */}
      <AppCard th={th} style={{
        background: th.sur,
        border: "1px solid " + th.bor,
        borderRadius: RADIUS.l,
        padding: SPACE.s5,
        display: "flex",
        flexDirection: "column",
        gap: SPACE.s3
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s1 }}>
          <Bookmark size={18} color={th.ac} />
          <span style={{ fontSize: 13, fontWeight: 800, color: th.ac, textTransform: "uppercase", letterSpacing: 1 }}>
            {scenarioText(currentScenario.title, lg)}
          </span>
        </div>
        <p style={{ ...TYPE.body, fontSize: 15, color: th.t1, lineHeight: 1.6, fontWeight: 500 }}>
          {scenarioText(currentScenario.text, lg)}
        </p>
      </AppCard>

      {/* Active Options list */}
      {phase === "play" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3, marginTop: SPACE.s2 }}>
          {currentScenario.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              className="ui-press"
              style={{
                background: th.sur,
                border: "1px solid " + th.bor,
                borderRadius: RADIUS.m,
                padding: SPACE.s4,
                textAlign: "left",
                color: th.t1,
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: SPACE.s3,
                transition: "all 0.2s"
              }}
            >
              <span style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: th.ac + "1F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
                color: th.ac,
                flexShrink: 0
              }}>
                {idx === 0 ? "A" : "B"}
              </span>
              <span style={{ flex: 1 }}>{scenarioText(opt.text, lg)}</span>
            </button>
          ))}
        </div>
      ) : (
        /* Feedback Card after choosing */
        <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3, marginTop: SPACE.s2 }}>
          {/* Chosen status badge */}
          <AppCard th={th} style={{
            background: chosenOption.effect.coins >= 0 ? th.gr + "0D" : th.rd + "0D",
            border: "1.5px solid " + (chosenOption.effect.coins >= 0 ? th.gr + "44" : th.rd + "44"),
            borderRadius: RADIUS.m,
            padding: SPACE.s4,
            display: "flex",
            flexDirection: "column",
            gap: SPACE.s2
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 }}>
              {chosenOption.effect.coins >= 0 ? (
                <CheckCircle size={20} color={th.gr} />
              ) : (
                <AlertCircle size={20} color={th.rd} />
              )}
              <span style={{
                fontSize: 15,
                fontWeight: 800,
                color: chosenOption.effect.coins >= 0 ? th.gr : th.rd
              }}>
                {chosenOption.effect.coins >= 0 ? t("gam_dec_wiseChoice") : t("gam_dec_unwiseChoice")}
              </span>
            </div>

            <p style={{ ...TYPE.caption, fontSize: 13, color: th.t1, lineHeight: 1.5, marginTop: 4 }}>
              {scenarioText(chosenOption.feedback, lg)}
            </p>

            <div style={{ display: "flex", gap: SPACE.s3, marginTop: SPACE.s1 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: chosenOption.effect.coins >= 0 ? th.gr : th.rd, display: "flex", alignItems: "center", gap: 4 }}>
                <Coins size={14} />
                {chosenOption.effect.coins >= 0 ? "+" : ""}{chosenOption.effect.coins} coin
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: th.ac2, display: "flex", alignItems: "center", gap: 4 }}>
                <Trophy size={14} />
                +{chosenOption.effect.xp} XP
              </span>
            </div>
          </AppCard>

          <PrimaryButton th={th} onClick={handleNext} style={{ marginTop: SPACE.s2 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {t("gam_dec_nextScenario")}
              <ArrowRight size={18} />
            </span>
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
