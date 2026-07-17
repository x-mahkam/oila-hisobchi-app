import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE } from "../../utils/tokens.js";
import { addCoins, logGameSession } from "../engine/persist.js";
import { addXp } from "../engine/xp.js";
import { playSound } from "../engine/sound.js";
import { moneyWords } from "./data/moneyWords.js";
import { 
  Coins, 
  PiggyBank, 
  CreditCard, 
  ClipboardList, 
  Tag, 
  Percent, 
  Briefcase, 
  Wallet, 
  Landmark, 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sprout, 
  Gem, 
  Handshake, 
  Receipt, 
  DollarSign,
  Volume2,
  Trophy,
  Star,
  XCircle,
  CheckCircle2,
  Frown
} from "lucide-react";

// Inject required animations for shake, pulse, pop and fly
const injectCss = () => {
  if (typeof document === "undefined" || document.getElementById("words-game-css")) return;
  const st = document.createElement("style");
  st.id = "words-game-css";
  st.textContent = `
@keyframes bgPulse{0%{transform:scale(1)}40%{transform:scale(1.06)}100%{transform:scale(1)}}
@keyframes bgShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes bgPop{0%{opacity:0;transform:scale(.9)}100%{opacity:1;transform:scale(1)}}
.bg-pulse{animation:bgPulse .5s ease}
.bg-shake{animation:bgShake .4s ease}
.bg-pop{animation:bgPop .25s ease}
`;
  document.head.appendChild(st);
};

const iconMap = {
  coin: Coins,
  save: PiggyBank,
  spend: CreditCard,
  budget: ClipboardList,
  price: Tag,
  discount: Percent,
  earn: Briefcase,
  wallet: Wallet,
  bank: Landmark,
  cash: Banknote,
  change: Coins,
  income: TrendingUp,
  expense: TrendingDown,
  debt: AlertTriangle,
  invest: Sprout,
  rich: Gem,
  poor: Frown,
  borrow: Handshake,
  receipt: Receipt,
  money: DollarSign,
};

export default function MoneyWordsGame({ user, lg = "uz", dark, gameId = "english/money-words", name = "", onBack }) {
  const { t } = useApp();
  useEffect(() => {
    injectCss();
  }, []);

  const th = dark ? PALETTE.dark : PALETTE.light;

  const [phase, setPhase] = useState("intro"); // intro | countdown | play | result
  const [count, setCount] = useState(3);
  const [qIndex, setQIndex] = useState(0);
  const [sessionWords, setSessionWords] = useState([]);
  const [curChoices, setCurChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Sound play helper
  const playSnd = (type) => {
    if (playSound[type]) {
      playSound[type]();
    }
  };

  // Generate speech
  const speakWord = (word) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  // Start new game session
  const startGame = () => {
    setScore({ correct: 0, wrong: 0 });
    setStreak(0);
    setMaxStreak(0);
    setQIndex(0);
    setSelected(null);
    setIsCorrect(null);

    // Shuffle and pick 10 words
    const shuffled = [...moneyWords].sort(() => Math.random() - 0.5).slice(0, 10);
    setSessionWords(shuffled);
    setPhase("countdown");
    setCount(3);
  };

  // Countdown effect
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count > 0) {
      const t = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setStartTime(Date.now());
      setPhase("play");
      generateQuestion(0, sessionWords);
    }
  }, [phase, count, sessionWords]);

  // Generate question options
  const generateQuestion = (idx, wordsList) => {
    const cur = wordsList[idx];
    if (!cur) return;

    // Get 3 random other words
    const others = moneyWords.filter(w => w.en !== cur.en);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [cur, ...shuffledOthers].sort(() => Math.random() - 0.5);

    setCurChoices(options);
    setSelected(null);
    setIsCorrect(null);
  };

  // Speech synthesis auto trigger on new question
  useEffect(() => {
    if (phase === "play" && sessionWords[qIndex]) {
      speakWord(sessionWords[qIndex].en);
    }
  }, [phase, qIndex, sessionWords]);

  // Handle choice selection
  const handleChoice = (opt) => {
    if (selected !== null) return;
    const cur = sessionWords[qIndex];
    const correct = opt.en === cur.en;

    setSelected(opt);
    setIsCorrect(correct);

    if (correct) {
      playSnd("correct");
      setScore(s => ({ ...s, correct: s.correct + 1 }));
      setStreak(st => {
        const next = st + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      playSnd("wrong");
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
      setStreak(0);
    }

    setTimeout(() => {
      const nextIdx = qIndex + 1;
      if (nextIdx >= sessionWords.length) {
        // Complete Game
        const finalSecs = Math.round((Date.now() - startTime) / 1000);
        setDuration(finalSecs);
        finishGame(score.correct + (correct ? 1 : 0), finalSecs);
      } else {
        setQIndex(nextIdx);
        generateQuestion(nextIdx, sessionWords);
      }
    }, 1200);
  };

  // Complete game & persistence
  const finishGame = async (finalCorrect, finalSecs) => {
    setPhase("result");
    playSnd("victory");

    // standard reward: easy category (english) is 1.5 coin, 2.5 xp per correct answer
    // lets give 1.2 coin per correct answer for english words
    const coinsEarned = Math.round(finalCorrect * 1.2);
    const xpEarned = Math.round(finalCorrect * 2.5);

    if (user?.id) {
      try {
        await addCoins(user.id, coinsEarned);
        await addXp(user.id, xpEarned);
        await logGameSession(user.id, {
          gameId,
          correct: finalCorrect,
          total: 10,
          seconds: finalSecs,
          coins: coinsEarned,
          xp: xpEarned,
          difficulty: "easy"
        });
      } catch (err) {
        console.error("Failed to save game session:", err);
      }
    }
  };

  // Renders
  if (phase === "intro") {
    return (
      <div>
        <PageHeader th={th} title={t("gam_mw_title")} onBack={onBack} />
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
            <Coins size={40} color="#fff" />
          </div>

          <div>
            <h2 style={{ ...TYPE.heading, color: th.t1 }}>{t("gam_mw_heading")}</h2>
            <p style={{ ...TYPE.caption, color: th.t2, marginTop: SPACE.s2, lineHeight: 1.4 }}>
              {t("gam_mw_intro")}
            </p>
          </div>

          <AppCard th={th} style={{ textAlign: "left", background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med }}>
            <div style={{ display: "flex", gap: SPACE.s3 }}>
              <Volume2 size={24} color={th.ac} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ ...TYPE.subtitle, fontSize: 14, color: th.t1, fontWeight: 700 }}>
                  {t("gam_mw_audioGuided")}
                </div>
                <div style={{ ...TYPE.caption, fontSize: 12, color: th.t2, marginTop: 2 }}>
                  {t("gam_mw_audioDesc")}
                </div>
              </div>
            </div>
          </AppCard>

          <PrimaryButton th={th} onClick={startGame} style={{ marginTop: SPACE.s2 }}>
            {t("gam_mw_startGame")}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div key={count} className="bg-pop" style={{
          width: 100,
          height: 100,
          borderRadius: RADIUS.full,
          background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: SHADOW.e2
        }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: "#fff" }}>{count}</span>
        </div>
        <div style={{ ...TYPE.subtitle, color: th.t2, marginTop: SPACE.s6 }}>
          {t("gam_getReady")}
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const finalStars = score.correct >= 9 ? 3 : score.correct >= 7 ? 2 : score.correct >= 5 ? 1 : 0;
    const coinsEarned = Math.round(score.correct * 1.2);
    const xpEarned = Math.round(score.correct * 2.5);
    const mm = Math.floor(duration / 60), ss = duration % 60;

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
            {finalStars > 0 ? t("gam_mul_greatJob") : t("gam_mul_tryAgain")}
          </div>
          <div style={{ ...TYPE.subtitle, color: "#fff", marginTop: SPACE.s1, opacity: 0.9 }}>
            {score.correct}/10 {t("gam_correctSuffix")}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatCard th={th} value={score.correct} label={t("gam_correct")} tone={th.gr} />
          <StatCard th={th} value={score.wrong} label={t("gam_wrong")} tone={th.rd} />
          <StatCard th={th} value={(mm ? mm + "m " : "") + ss + "s"} label={t("gam_time")} tone={th.ac} />
          <StatCard th={th} value={"x" + maxStreak} label="Combo" tone={th.am} />
        </div>

        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, marginBottom: SPACE.s2 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: PREMIUM.gold + "1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Coins size={24} color={PREMIUM.gold} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", color: th.t2 }}>{t("gam_sav_coinsReceived")}</div>
            <div style={{ ...TYPE.title, color: th.t1 }}>+{coinsEarned}</div>
          </div>
        </AppCard>

        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: th.ac2 + ALPHA.faint, border: "1px solid " + th.ac2 + ALPHA.med, marginBottom: SPACE.s4 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: th.ac2 + "1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={24} color={th.ac2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", color: th.t2 }}>{t("gam_experienceXp")}</div>
            <div style={{ ...TYPE.title, color: th.t1 }}>+{xpEarned}</div>
          </div>
        </AppCard>

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

  // Active question details
  const curWord = sessionWords[qIndex];
  const CurrentIcon = curWord ? (iconMap[curWord.en] || Coins) : Coins;

  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
      {/* Top progress bar */}
      <div style={{ display: "flex", alignItems: "center", justifySpace: "space-between", gap: SPACE.s3 }}>
        <div style={{ flex: 1, height: 8, background: th.bor, borderRadius: RADIUS.pill, overflow: "hidden" }}>
          <div style={{ width: `${(qIndex / sessionWords.length) * 100}%`, height: "100%", background: th.ac, borderRadius: RADIUS.pill, transition: "width .3s ease" }} />
        </div>
        <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t2, fontVariantNumeric: "tabular-nums" }}>
          {qIndex + 1}/{sessionWords.length}
        </span>
      </div>

      {/* Main card */}
      <div className="bg-pop" style={{
        background: "linear-gradient(135deg," + th.sur + "," + th.bg + ")",
        border: "1px solid " + th.bor,
        borderRadius: RADIUS.l,
        padding: SPACE.s6,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: SPACE.s3,
        boxShadow: SHADOW.e1(th.bor)
      }}>
        {/* Lucide icon representation */}
        <div style={{
          width: 84,
          height: 84,
          borderRadius: RADIUS.m,
          background: th.ac + "1F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: th.ac,
          boxShadow: `0 4px 12px ${th.ac}1A`
        }}>
          <CurrentIcon size={44} />
        </div>

        {/* Translation text */}
        <div>
          <span style={{ ...TYPE.caption, color: th.t3, textTransform: "uppercase", tracking: 1.5, fontSize: 11 }}>
            {t("gam_mw_translation")}
          </span>
          <div style={{ ...TYPE.heading, fontSize: 26, color: th.t1, fontWeight: 800, marginTop: 4 }}>
            {curWord[lg] || curWord.uz}
          </div>
        </div>

        {/* Speak voice audio button */}
        <button onClick={() => speakWord(curWord.en)} className="ui-press" style={{
          background: th.ac + "15",
          border: "1px solid " + th.ac + "33",
          borderRadius: RADIUS.pill,
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: SPACE.s2,
          color: th.ac,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          marginTop: SPACE.s2
        }}>
          <Volume2 size={16} />
          {t("gam_mw_listenPronunciation")}
        </button>
      </div>

      {/* Grid of options (4 buttons) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3, marginTop: SPACE.s2 }}>
        {curChoices.map((opt, i) => {
          const isSel = selected?.en === opt.en;
          const isRightOpt = opt.en === curWord.en;
          
          let bg = th.sur;
          let border = "1px solid " + th.bor;
          let color = th.t1;

          if (selected !== null) {
            if (isRightOpt) {
              bg = th.gr + "1F";
              border = "1.5px solid " + th.gr;
              color = th.gr;
            } else if (isSel) {
              bg = th.rd + "1F";
              border = "1.5px solid " + th.rd;
              color = th.rd;
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleChoice(opt)}
              disabled={selected !== null}
              className="ui-press"
              style={{
                background: bg,
                border: border,
                borderRadius: RADIUS.m,
                padding: SPACE.s4,
                color: color,
                fontFamily: "inherit",
                fontSize: 15,
                fontWeight: 700,
                cursor: selected === null ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: SPACE.s1,
                minHeight: 70,
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: 16 }}>{opt.en}</span>
              {selected !== null && isRightOpt && <CheckCircle2 size={14} color={th.gr} style={{ marginTop: 2 }} />}
              {selected !== null && isSel && !isRightOpt && <XCircle size={14} color={th.rd} style={{ marginTop: 2 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
