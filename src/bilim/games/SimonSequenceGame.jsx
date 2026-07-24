import { useState, useEffect, useCallback, useRef } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, PREMIUM, PALETTE } from "../../utils/tokens.js";
import { addCoins, logGameSession, bestForGame, readCoins, saveLevelProgress, dailyCoinMultiplier } from "../engine/persist.js";
import { addXp, readXp, levelFor, didLevelUp } from "../engine/xp.js";
import { rewardOf, tierFor, medalSvg } from "../registry.jsx";
import { playSound } from "../engine/sound.js";
import { Star, Zap, Flame, Award } from "lucide-react";

// Color maps for the 4 Simon buttons
const BUTTONS = [
  { id: 0, color: "#22c55e", name: { uz: "Yashil", ru: "Зеленый", en: "Green", kk: "Жасыл", ky: "Жашыл", tg: "Сабз", qr: "Jasıl" }, sound: "correct" },
  { id: 1, color: "#ef4444", name: { uz: "Qizil", ru: "Красный", en: "Red", kk: "Қызыл", ky: "Кызыл", tg: "Сурх", qr: "Qızıl" }, sound: "wrong" },
  { id: 2, color: "#3b82f6", name: { uz: "Moviy", ru: "Синий", en: "Blue", kk: "Көк", ky: "Көк", tg: "Кӯҳна", qr: "Ko'k" }, sound: "tick" },
  { id: 3, color: "#eab308", name: { uz: "Sariq", ru: "Желтый", en: "Yellow", kk: "Сары", ky: "Сары", tg: "Зард", qr: "Sarı" }, sound: "victory" }
];

const T = {
  title: {
    uz: "Ketma-ketlikni takrorlash",
    ru: "Повтори последовательность",
    en: "Simon Sequence",
    kk: "Өрнекті қайтала",
    ky: "Катарды кайтала",
    tg: "Такрори пайдарпайӣ",
    qr: "Ketpe-ketlikti ta'kirlew"
  },
  rememberFlash: {
    uz: "Chiroqlar ketma-ketligini eslab qoling",
    ru: "Запоминайте вспышки света",
    en: "Remember the Flash Sequence",
    kk: "Жарықтар кезегін есіңізде сақтаңыз",
    ky: "Жарыктардын катарын эстеп калыңыз",
    tg: "Пайдарпайии дурахшҳоро ба ёд гиред",
    qr: "Chiraqlar ketpe-ketligin eslep qalin'iz"
  },
  introDesc: {
    uz: "Rang-barang tugmalarning yonish ketma-ketligini diqqat bilan tomosha qiling, ularni xuddi shu tartibda takrorlang va xotirangizni sinang!",
    ru: "Следите за вспышками разноцветных кнопок и повторяйте их в точности шаг за шагом!",
    en: "Watch the sequence of colorful button flashes carefully, repeat them in the exact order, and test your memory boundaries!",
    kk: "Түрлі-түсті түймелердің жану кезегін мұқият бақылаңыз, оларды дәл солай қайталаңыз және жадыңызды тексеріңіз!",
    ky: "Түркүн түстүү баскычтардын жануу катарын кунт коюп байкаңыз, аларды так ушундай тартипте кайталап, эс тутумуңузду сынап көрүңүз!",
    tg: "Дурахши тугмаҳои рангорангро бодиққат назорат кунед, онҳоро дар ҳамон тартиб такрор кунед ва хотираи худро санҷед!",
    qr: "Tu'rli-tu'sli tu'ymelerdin' janiw ketpe-ketligin diqqat penen baqlan'iz, olardi tap sonday ta'rtipte ta'kirlep, yadın'izdi sinap ko'rin'iz!"
  },
  growsTitle: {
    uz: "Dinamik ravishda o'sadi",
    ru: "Увеличивающаяся длина",
    en: "Grows dynamically",
    kk: "Динамикалық өсу",
    ky: "Динамикалык өсүш",
    tg: "Рушди динамикӣ",
    qr: "Dinamikalıq o'siw"
  },
  growsDesc: (targetLength) => ({
    uz: `Har bir muvaffaqiyatli bosqichdan so'ng, ketma-ketlik yana 1 taga uzayadi. Maqsad: kamida ${targetLength} ta chiroqni topish.`,
    ru: `После каждого верного шага длина увеличивается на 1. Цель: повторить минимум ${targetLength} вспышек.`,
    en: `After each successful round, the pattern length grows by 1. Target: match at least ${targetLength} steps.`,
    kk: `Әрбір сәтті қадамнан кейін кезектілік тағы 1-ге ұзарады. Мақсат: кемінде ${targetLength} жарықты табу.`,
    ky: `Ар бир ийгиликтүү кадамдан кийин катар дагы 1ге узарат. Максат: кеминде ${targetLength} жарыкты табу.`,
    tg: `Пас аз ҳар як марҳилаи муваффақ, пайдарпайӣ боз 1 адад зиёд мешавад. Мақсад: ҳадди аққал ${targetLength} дурахшро ёфтан.`,
    qr: `Ha'r bir tabisli qademnen keyin, ketpe-ketlik ja'ne 1 ge uzayadi. Maqset: keminde ${targetLength} chiraqti tabiw.`
  }),
  startGame: {
    uz: "O'yinni boshlash",
    ru: "Начать игру",
    en: "Start Game",
    kk: "Ойынды бастау",
    ky: "Оюнду баштоо",
    tg: "Оғози бозӣ",
    qr: "Oyindi baslaw"
  },
  roundLabel: {
    uz: "Bosqich",
    ru: "Раунд",
    en: "Round",
    kk: "Раунд",
    ky: "Раунд",
    tg: "Марҳила",
    qr: "Basqish"
  },
  watch: {
    uz: "Kuzating...",
    ru: "Наблюдайте...",
    en: "Watch carefully...",
    kk: "Бақылаңыз...",
    ky: "Байкаңыз...",
    tg: "Назорат кунед...",
    qr: "Baqlan'iz..."
  },
  yourTurn: {
    uz: "Sizning navbatingiz!",
    ru: "Ваш ход!",
    en: "Your turn!",
    kk: "Сіздің кезегіңіз!",
    ky: "Сиздин кезегиңиз!",
    tg: "Навбати шумо!",
    qr: "Sizdin' na'wbetin'iz!"
  },
  observeTip: {
    uz: "Ranglar ketma-ket yona boshlaydi, ularning ketma-ketligini eslab qoling.",
    ru: "Кнопки будут загораться по очереди. Запомните порядок.",
    en: "Observe the light pattern carefully. Memorize the exact order.",
    kk: "Түстер кезекпен жанады, олардың ретін есіңізде сақтаңыз.",
    ky: "Түстөр кезек менен жана баштайт, алардын катарын эстеп калыңыз.",
    tg: "Рангҳо пайдарпай медурахшанд, пайдарпайии онҳоро ба ёд гиред.",
    qr: "Ren'ler ketpe-ket jana baslaydi, olardin' ketpe-ketligin eslep qalin'iz."
  },
  pressTip: {
    uz: "Rangli tugmalarni xuddi o'sha tartibda bosing!",
    ru: "Нажимайте на кнопки in том же порядке!",
    en: "Press the colorful pads in the exact same sequence!",
    kk: "Түрлі-түсті түймелерді дәл солай басыңыз!",
    ky: "Түркүн түстүү баскычтарды дал ошол тартипте басыңыз!",
    tg: "Тугмаҳои рангаро дар ҳамон тартиб пахш кунед!",
    qr: "Ren'li tu'ymelerdi tap sonday ta'rtipte basin'iz!"
  },
  fantastic: {
    uz: "Fantastik xotira! 🚀",
    ru: "Фантастическая память! 🚀",
    en: "Fantastic Memory! 🚀",
    kk: "Ғажайып жад! 🚀",
    ky: "Укмуштуудай эс тутум! 🚀",
    tg: "Хотираи аҷиб! 🚀",
    qr: "Fantastikalıq yad! 🚀"
  },
  goodEffort: {
    uz: "Yaxshi harakat! 👍",
    ru: "Хорошая попытка! 👍",
    en: "Good Effort! 👍",
    kk: "Жақсы әрекет! 👍",
    ky: "Жакшы аракет! 👍",
    tg: "Кӯшиши хуб! 👍",
    qr: "Yaqshi ha'reket! 👍"
  },
  matchedCount: (score) => ({
    uz: `Siz ${score} ta tugmani to'g'ri takrorladingiz!`,
    ru: `Вы правильно повторили ${score} кнопок!`,
    en: `You successfully matched ${score} flashes!`,
    kk: `Сіз ${score} түймені дұрыс қайталадыңыз!`,
    ky: `Сиз ${score} баскычты туура кайталадыңыз!`,
    tg: `Шумо ${score} тугмаро дуруст такрор кардед!`,
    qr: `Siz ${score} tu'ymeni duris ta'kirledin'iz!`
  }),
  matchedLabel: {
    uz: "Topilgan",
    ru: "Повторено",
    en: "Matched",
    kk: "Қайталанған",
    ky: "Кайталанган",
    tg: "Такроршуда",
    qr: "Tabilg'an"
  },
  elapsedLabel: {
    uz: "Sarflandi",
    ru: "Время",
    en: "Time",
    kk: "Уақыт",
    ky: "Убакыт",
    tg: "Вақт",
    qr: "Sarplandi"
  },
  accuracyLabel: {
    uz: "To'g'rilik",
    ru: "Точность",
    en: "Accuracy",
    kk: "Дәлдік",
    ky: "Тактык",
    tg: "Дақиқӣ",
    qr: "Durisliq"
  },
  earnedCoinsLabel: {
    uz: "Topilgan coin",
    ru: "Полученные монеты",
    en: "Earned Coins",
    kk: "Табылған монеталар",
    ky: "Табылган монеталар",
    tg: "Тангаҳои ёфтшуда",
    qr: "Tabilg'an coin"
  },
  nextLevel: {
    uz: "Keyingi bosqich",
    ru: "Следующий уровень",
    en: "Next Level",
    kk: "Келесі деңгей",
    ky: "Кийинки деңгээл",
    tg: "Марҳилаи навбатӣ",
    qr: "Keyingi basqish"
  },
  playAgain: {
    uz: "Qayta o'ynash",
    ru: "Играть еще раз",
    en: "Play Again",
    kk: "Қайта ойнау",
    ky: "Кайра ойноо",
    tg: "Бозии дубора",
    qr: "Qayta oynaw"
  },
  back: {
    uz: "Ortga qaytish",
    ru: "Назад",
    en: "Back",
    kk: "Артқа",
    ky: "Артка",
    tg: "Қафо",
    qr: "Izg'a"
  }
};

export default function SimonSequenceGame({ user, lg = "uz", dark, gameId = "memory/simon", name = "", level, onBack, onNextLevel }) {
  const th = dark ? PALETTE.dark : PALETTE.light;
  const l = lg || "uz";

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
      else if (id === 1) playSound.tick();
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

      // Kunlik takror o'ynashda mukofot kamayadi (farmga qarshi, math kabi)
      const mult = await dailyCoinMultiplier(user.id, gameId);
      const coinReward = Math.max(1, Math.round((Math.round(score * 1.2) + bonusCoins) * mult));
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
            <PageHeader th={th} title={T.title[l] || T.title.uz} onBack={onBack} />

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
                {T.rememberFlash[l] || T.rememberFlash.uz}
              </h2>
              <p style={{ ...TYPE.caption, color: th.t2, fontSize: 15, lineHeight: 1.5, maxWidth: 320, margin: "0 auto" }}>
                {T.introDesc[l] || T.introDesc.uz}
              </p>
            </div>

            <AppCard th={th} style={{ background: th.ac2 + ALPHA.faint, border: "1px solid " + th.ac2 + ALPHA.med, marginBottom: SPACE.s3 }}>
              <div style={{ display: "flex", gap: SPACE.s3, alignItems: "center" }}>
                <Zap size={28} color={th.ac2} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ ...TYPE.subtitle, color: th.ac2, fontWeight: 800, margin: 0, fontSize: 14 }}>
                    {T.growsTitle[l] || T.growsTitle.uz}
                  </h4>
                  <p style={{ ...TYPE.caption, color: th.t2, margin: "2px 0 0 0", fontSize: 13, lineHeight: 1.4 }}>
                    {(T.growsDesc(targetLength)[l] || T.growsDesc(targetLength).uz)}
                  </p>
                </div>
              </div>
            </AppCard>
          </div>

          <PrimaryButton th={th} onClick={handleStartGame} style={{ marginTop: SPACE.s3 }}>
            {T.startGame[l] || T.startGame.uz}
          </PrimaryButton>
        </div>
      )}

      {/* ── PLAY PHASE ── */}
      {phase === "play" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <PageHeader th={th} title={`${T.roundLabel[l] || T.roundLabel.uz}: ${currentRound - startLength + 1}`} onBack={() => setPhase("intro")} />

            {/* Play HUD */}
            <div style={{ display: "flex", justifyContent: "space-between", ...TYPE.tiny, color: th.t2, marginBottom: 8 }}>
              <span>{isPlaybackActive ? (T.watch[l] || T.watch.uz) : (T.yourTurn[l] || T.yourTurn.uz)}</span>
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
                ? (T.observeTip[l] || T.observeTip.uz)
                : (T.pressTip[l] || T.pressTip.uz)
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
                  ? (T.fantastic[l] || T.fantastic.uz) 
                  : (T.goodEffort[l] || T.goodEffort.uz)}
              </h2>
              <p style={{ ...TYPE.subtitle, color: th.t2, margin: "6px 0 0 0" }}>
                {(T.matchedCount(score)[l] || T.matchedCount(score).uz)}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
              <StatCard th={th} value={score} label={T.matchedLabel[l] || T.matchedLabel.uz} tone={th.ac2} />
              <StatCard th={th} value={`${elapsed}s`} label={T.elapsedLabel[l] || T.elapsedLabel.uz} tone={th.gr} />
              <StatCard th={th} value={`${Math.round((score / targetLength) * 100)}%`} label={T.accuracyLabel[l] || T.accuracyLabel.uz} tone={th.ac} />
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
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{T.earnedCoinsLabel[l] || T.earnedCoinsLabel.uz}</div>
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
                {T.nextLevel[l] || T.nextLevel.uz}
              </PrimaryButton>
            )}

            <PrimaryButton th={th} onClick={handleStartGame}>
              {T.playAgain[l] || T.playAgain.uz}
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
              {T.back[l] || T.back.uz}
            </button>
          </div>
        );
      })()}

    </div>
  );
}
