// ═══════════════════════════════════════════════════════════
//  BILIM HUB — Learning Platform qobig'i (Sprint: arxitektura)
//  Ekranlar: kategoriyalar → o'yinlar → o'yin tafsiloti → launch.
//  Progress/coin/achievement/parent-preview — MAVJUD bilim_* dan
//  (Firebase/coin/permission O'ZGARMAYDI, faqat o'qish).
//  Real o'yin: english/words → mavjud BilimBozor komponenti.
//  Yangi o'yin qo'shish = registry.jsx ga bitta yozuv.
// ═══════════════════════════════════════════════════════════
import { memo, useMemo, useState, useEffect, useCallback } from "react";
import { db } from "../firebase.js";
import { useApp } from "../context/AppContext.jsx";
import { PageHeader, SectionHeader, AppCard, StatCard, Badge, EmptyState, PrimaryButton, LinearProgress, UIAvatar } from "../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE } from "../utils/tokens.js";
import { fullName } from "../utils/formatters.js";
import { CATEGORIES, catById, gamesOf, isAvailable, DIFF } from "./registry.jsx";
import { readSessions, calculateDailyStreak } from "./engine/persist.js";
import { levelFor, rankFor, readXp } from "./engine/xp.js";
import { analyzeLearning, weeklyReport } from "./engine/analytics.js";
import LearningProfile from "./LearningProfile.jsx";
import { BilimDashboard } from "./dashboard.jsx";
import BilimBozor, { WORDS, LEVELS } from "../BilimBozor.jsx";
import AdditionGame from "./games/AdditionGame.jsx";
import SubtractionGame from "./games/SubtractionGame.jsx";
import MultiplicationGame from "./games/MultiplicationGame.jsx";
import DivisionGame from "./games/DivisionGame.jsx";
import LevelMap from "./games/LevelMap.jsx";
import { LOGIC_LEVELS } from "./games/levels/logicLevels.js";
import { MEMORY_LEVELS } from "./games/levels/memoryLevels.js";
import { MATH_LEVELS } from "./games/levels/mathLevels.js";
import SortGame from "./games/SortGame.jsx";
import BudgetGame from "./games/BudgetGame.jsx";
import PriceQuizGame from "./games/PriceQuizGame.jsx";
import MoneyWordsGame from "./games/MoneyWordsGame.jsx";
import DecisionGame from "./games/DecisionGame.jsx";
import SavingsSequenceGame from "./games/SavingsSequenceGame.jsx";
import BankSimGame from "./games/BankSimGame.jsx";
import BozorGame from "./games/BozorGame.jsx";
import PriceMemoryGame from "./games/PriceMemoryGame.jsx";
import PatternGame from "./games/PatternGame.jsx";
import OddOneOutGame from "./games/OddOneOutGame.jsx";
import SimonSequenceGame from "./games/SimonSequenceGame.jsx";

const diffColor = (tone, th) => ({ gr: th.gr, am: th.am, rd: th.rd }[tone] || th.ac);
const grad = (g, th) => "linear-gradient(135deg," + (th[g.grad[0]] || th.ac) + "," + (th[g.grad[1]] || th.ac2) + ")";

// ── O'yin kartasi ──
const GameCard = memo(function GameCard({ th, lg, t, game, onOpen }) {
  const avail = isAvailable(game);
  const d = DIFF[game.difficulty] || DIFF.easy;
  const dc = diffColor(d.tone, th);
  return (
    <button className="ui-press" onClick={() => onOpen(game)}
      style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3, marginBottom: SPACE.s2, display: "flex", gap: SPACE.s3, alignItems: "center", opacity: avail ? 1 : 0.72, boxSizing: "border-box" }}>
      <span style={{ width: COMP.touchMin + SPACE.s2, height: COMP.touchMin + SPACE.s2, borderRadius: RADIUS.m, background: th.ac + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, filter: avail ? "none" : "grayscale(1)" }}>{game.icon(th.ac, 26)}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>
          <span style={{ ...TYPE.subtitle, fontSize: TYPE.subtitle.fontSize - 1, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{game.name[lg] || game.name.uz}</span>
          {game.premium && <Badge th={th} type="pro" />}
        </span>
        <span style={{ display: "block", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{game.desc[lg] || game.desc.uz}</span>
        <span style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginTop: SPACE.s1 + 1 }}>
          <span style={{ ...TYPE.tiny, letterSpacing: 0, fontWeight: 700, color: dc }}>{d[lg] || d.uz}</span>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>· {game.minutes} {t("bd_minutesShort")}</span>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: PREMIUM.gold, fontWeight: 700 }}>· {game.maxCoin} coin</span>
        </span>
      </span>
      {!avail && <span style={{ flexShrink: 0 }}><Badge th={th} tone={th.t3}>{t("bd_soon")}</Badge></span>}
    </button>
  );
});

export default function BilimHub({ user, lg = "uz", dark, oila, azolar = [], onBack, initialView }) {
  const { setBilimInitialView, t } = useApp();
  const isKid = user?.rol === "kid";
  const [view, setView] = useState(() => (typeof initialView === "string" ? initialView : "cats"));      // cats | games | detail | play | parent | market

  useEffect(() => {
    if (typeof initialView === "string") {
      setView(initialView);
    }
  }, [initialView]);

  useEffect(() => {
    return () => {
      setBilimInitialView("cats");
    };
  }, [setBilimInitialView]);
  const [cat, setCat] = useState(null);
  const [game, setGame] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [selectedEnglishLevel, setSelectedEnglishLevel] = useState(null);

  // ── Mavjud bilim_* dan o'qish (yozuv yo'q, sxema o'zgarmaydi) ──
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [stats, setStats] = useState({});
  const [streak, setStreak] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [parentData, setParentData] = useState([]); // ota-ona uchun bolalar bo'yicha

  useEffect(() => {
    if (!user?.id) return;
    if (isKid) {
      db.g("bilim_coins_" + user.id).then(v => { if (v != null) setCoins(v); }).catch(() => {});
      db.g("bilim_xp_" + user.id).then(v => { if (v != null) setXp(Number(v) || 0); }).catch(() => {});
      db.g("bilim_stats_" + user.id).then(v => { if (v && typeof v === "object") setStats(v); }).catch(() => {});
      readSessions(user.id).then(sess => {
        setSessions(sess);
        const st = calculateDailyStreak(sess);
        setStreak(st);
      }).catch(() => {});
    } else {
      // Ota-ona: har bolaning natijasini o'qib preview tayyorlash
      const kids = (azolar || []).filter(a => a.rol === "kid");
      Promise.all(kids.map(async k => {
        const [c, xpv, s] = await Promise.all([
          db.g("bilim_coins_" + k.id).catch(() => 0),
          db.g("bilim_xp_" + k.id).catch(() => 0),
          db.g("bilim_stats_" + k.id).catch(() => ({})),
        ]);
        const learned = s && typeof s === "object" ? Object.keys(s).length : 0;
        const ksessions = await readSessions(k.id);
        const kstreak = calculateDailyStreak(ksessions);
        return { id: k.id, name: fullName(k), photo: k.photo, coins: c || 0, xp: Number(xpv) || 0, learned, streak: kstreak, sessions: ksessions };
      })).then(setParentData).catch(() => {});
    }
  }, [user?.id, isKid, azolar]);

  // Ingliz progress = o'rganilgan so'z / taxminiy jami (60 so'z bazaviy)
  const learnedWords = useMemo(() => (stats && typeof stats === "object" ? Object.keys(stats).length : 0), [stats]);
  const progressOf = useCallback((catId) => {
    if (catId === "english") return Math.min(100, Math.round(learnedWords / 60 * 100));
    return 0; // boshqa kategoriyalar hali o'yinsiz
  }, [learnedWords]);

  const openCat = useCallback((c) => { setCat(c); setView("games"); }, []);
  const openGame = useCallback((g) => {
    if (g && (g.category === "math" || g.id?.startsWith("math/"))) {
      setCat(catById("math") || { id: "math", name: { uz: "Matematika", ru: "Математика", en: "Math", kk: "Математика", ky: "Математика", tg: "Математика", qr: "Matematika" } });
      setView("games");
    } else {
      setGame(g);
      setView("detail");
    }
  }, []);
  const openProfile = useCallback(() => setView("profile"), []);
  const back = useCallback(() => {
    if (view === "play-level") { setView("games"); }
    else if (view === "play") { setView("detail"); }
    else if (view === "detail") { setView("games"); }
    else if (view === "games" || view === "parent") { setView("cats"); setCat(null); }
    else {
      setBilimInitialView("cats");
      onBack && onBack();
    }
  }, [view, onBack, setBilimInitialView]);

  const startGame = useCallback(() => {
    if (game && isAvailable(game)) setView("play");
  }, [game]);

  const handleNextLevel = useCallback((subject, currentLevelId) => {
    let list = [];
    if (subject === "math") list = MATH_LEVELS;
    else if (subject === "logic") list = LOGIC_LEVELS;
    else if (subject === "memory") list = MEMORY_LEVELS;

    const nextLvl = list.find(l => l.id === currentLevelId + 1);
    if (nextLvl) {
      setActiveLevel(nextLvl);
    } else {
      setView("games"); // go back to map if no more levels
    }
  }, []);

  // ═══ PLAY — real o'yin (hozircha english/words → BilimBozor) ═══
  if (view === "play-level" && activeLevel) {
    if (activeLevel.game === "math/addition") {
      return <AdditionGame user={user} lg={lg} dark={dark} gameId={activeLevel.game} name={fullName(user)} level={activeLevel} onBack={() => setView("games")} onNextLevel={() => handleNextLevel("math", activeLevel.id)} />;
    }
    if (activeLevel.game === "math/subtraction") {
      return <SubtractionGame user={user} lg={lg} dark={dark} gameId={activeLevel.game} name={fullName(user)} level={activeLevel} onBack={() => setView("games")} onNextLevel={() => handleNextLevel("math", activeLevel.id)} />;
    }
    if (activeLevel.game === "math/multiply") {
      return <MultiplicationGame user={user} lg={lg} dark={dark} gameId={activeLevel.game} name={fullName(user)} level={activeLevel} onBack={() => setView("games")} onNextLevel={() => handleNextLevel("math", activeLevel.id)} />;
    }
    if (activeLevel.game === "logic/pattern") {
      return <SavingsSequenceGame user={user} lg={lg} dark={dark} gameId={activeLevel.game} name={fullName(user)} level={activeLevel} onBack={() => setView("games")} onNextLevel={() => handleNextLevel("logic", activeLevel.id)} />;
    }
    if (activeLevel.game === "logic/pattern-shapes") {
      return <PatternGame user={user} lg={lg} dark={dark} gameId={activeLevel.game} name={fullName(user)} level={activeLevel} onBack={() => setView("games")} onNextLevel={() => handleNextLevel("logic", activeLevel.id)} />;
    }
    if (activeLevel.game === "logic/odd-one-out") {
      return <OddOneOutGame user={user} lg={lg} dark={dark} gameId={activeLevel.game} name={fullName(user)} level={activeLevel} onBack={() => setView("games")} onNextLevel={() => handleNextLevel("logic", activeLevel.id)} />;
    }
    if (activeLevel.game === "logic/decision") {
      return <DecisionGame user={user} lg={lg} dark={dark} gameId={activeLevel.game} name={fullName(user)} level={activeLevel} onBack={() => setView("games")} onNextLevel={() => handleNextLevel("logic", activeLevel.id)} />;
    }
    if (activeLevel.game === "memory/pairs") {
      return <PriceMemoryGame user={user} lg={lg} dark={dark} gameId={activeLevel.game} name={fullName(user)} level={activeLevel} onBack={() => setView("games")} onNextLevel={() => handleNextLevel("memory", activeLevel.id)} />;
    }
    if (activeLevel.game === "memory/simon") {
      return <SimonSequenceGame user={user} lg={lg} dark={dark} gameId={activeLevel.game} name={fullName(user)} level={activeLevel} onBack={() => setView("games")} onNextLevel={() => handleNextLevel("memory", activeLevel.id)} />;
    }
  }

  if (view === "play" && game && game.load === "english/words") {
    return <BilimBozor user={user} lg={lg} dark={dark} oila={oila} azolar={azolar} embedded gameTitle={game.name[lg] || game.name.uz} initialLevel={selectedEnglishLevel} onBack={() => { setView("detail"); setSelectedEnglishLevel(null); }} />;
  }
  if (view === "play" && game && game.load === "math/addition") {
    return <AdditionGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "math/subtraction") {
    return <SubtractionGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "math/multiply") {
    return <MultiplicationGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "math/division") {
    return <DivisionGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "finance/needs-wants") {
    return <SortGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "finance/budget") {
    return <BudgetGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && (game.load === "finance/price-compare" || game.load === "finance/discount")) {
    return <PriceQuizGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "english/money-words") {
    return <MoneyWordsGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "logic/decision") {
    return <DecisionGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "logic/pattern") {
    return <SavingsSequenceGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "logic/pattern-shapes") {
    return <PatternGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "logic/odd-one-out") {
    return <OddOneOutGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "finance/bank-sim") {
    return <BankSimGame dark={dark} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "finance/bozor") {
    return <BozorGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "memory/pairs") {
    return <PriceMemoryGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "memory/simon") {
    return <SimonSequenceGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }

  // ═══ LEARNING PROFILE (bola) ═══
  if (view === "profile") {
    return (
      <div>
        <PageHeader th={th_(dark)} title={t("bh_myProfile")} onBack={() => setView("cats")} />
        <LearningProfile th={th_(dark)} lg={lg} user={user} coins={coins} xp={xp} streak={streak} sessions={sessions} />
      </div>
    );
  }

  // ═══ MUKOFOT / SAVDO — ota-ona coin→mukofot qo'yadi (BilimBozor "Bozor" tabi) ═══
  if (view === "market") {
    return <BilimBozor user={user} lg={lg} dark={dark} oila={oila} azolar={azolar} onBack={() => { setView(isKid ? "cats" : "parent"); setBilimInitialView("cats"); }} />;
  }

  // ═══ PARENT PREVIEW — o'yin ko'rinmaydi, faqat natija ═══
  if (view === "parent" || (!isKid && view === "cats")) {
    const pth = th_(dark);
    return (
      <div>
        <PageHeader th={pth} title={t("bh_learningMonitor")} onBack={onBack} />
        <button onClick={() => setView("market")} style={{ width: "100%", background: "linear-gradient(135deg," + pth.ac + "," + pth.ac2 + ")", border: "none", borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16, color: "#fff", fontWeight: 800, fontSize: 15 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3.5 8.5V16a1 1 0 001 1h11a1 1 0 001-1V8.5" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/><path d="M2.5 4.5h15l-.8 3.2a2 2 0 01-3.9.1 2 2 0 01-3.9 0 2 2 0 01-3.9 0 2 2 0 01-3.9-.1L2.5 4.5z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          {t("bh_setReward")}
        </button>
        <ParentPreview th={pth} lg={lg} t={t} data={parentData} />
      </div>
    );
  }

  const th = th_(dark);

  // ═══ O'YIN TAFSILOTI ═══
  if (view === "detail" && game) {
    const d = DIFF[game.difficulty] || DIFF.easy;
    const dc = diffColor(d.tone, th);
    const avail = isAvailable(game);
    return (
      <div>
        <PageHeader th={th} title={game.name[lg] || game.name.uz} onBack={back} />
        <div style={{
          background: grad(catById(game.category) || CATEGORIES[0], th),
          borderRadius: RADIUS.m,
          padding: "18px 16px",
          marginBottom: SPACE.s3,
          textAlign: "center",
          boxShadow: SHADOW.e1(th.ac),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "110px",
          boxSizing: "border-box"
        }}>
          <div style={{ width: 42, height: 42, borderRadius: RADIUS.m - 4, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, flexShrink: 0 }}>{game.icon("#fff", 24)}</div>
          <h2 style={{ ...TYPE.heading, fontSize: 18, fontWeight: 800, color: "#fff", margin: 0, padding: 0, lineHeight: 1.2 }}>{game.name[lg] || game.name.uz}</h2>
          <p style={{ ...TYPE.caption, fontSize: 12.5, color: "rgba(255,255,255,0.85)", margin: "4px 0 0 0", padding: 0, maxWidth: "280px", lineHeight: "1.3" }}>{game.desc[lg] || game.desc.uz}</p>
        </div>
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatCard th={th} value={d[lg] || d.uz} label={t("bh_difficulty")} tone={dc} />
          <StatCard th={th} value={game.minutes + " " + t("bd_minutesShort")} label={t("bh_time")} tone={th.ac} />
          <StatCard th={th} value={game.maxCoin} label="Max coin" tone={PREMIUM.gold} />
        </div>
        {game.premium && (
          <AppCard th={th} style={{ background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, display: "flex", alignItems: "center", gap: SPACE.s2 }}>
            <Badge th={th} type="pro" />
            <span style={{ ...TYPE.caption, color: th.t2 }}>{t("bh_premiumGame")}</span>
          </AppCard>
        )}
        {avail ? (
          game.id === "english/words" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3, marginTop: SPACE.s2 }}>
              <div style={{ ...TYPE.subtitle, fontSize: 14, fontWeight: 800, color: th.t2, marginBottom: 2, textAlign: "center" }}>
                {t("bh_selectLevelStart")}
              </div>
              {LEVELS.map(lvl => {
                const allW = WORDS[lvl.id] || [];
                const statsObj = stats || {};
                const newCount = allW.filter(w => (statsObj[w.en] || 0) === 0).length;
                const seenCount = allW.filter(w => (statsObj[w.en] || 0) > 0).length;
                const pct = Math.min(100, Math.round((seenCount / allW.length) * 100));

                const lvlDiffKey = lvl.id === 1 ? "easy" : lvl.id === 2 ? "medium" : "hard";
                const lvlName = DIFF[lvlDiffKey][lg] || DIFF[lvlDiffKey].uz;
                const diffLabel = DIFF[lvlDiffKey][lg] || DIFF[lvlDiffKey].uz;

                return (
                  <button
                    key={lvl.id}
                    className="ui-press"
                    onClick={() => {
                      setSelectedEnglishLevel(lvl.id);
                      setView("play");
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      fontFamily: "inherit",
                      cursor: "pointer",
                      background: th.sur,
                      border: "2.5px solid " + lvl.color + "44",
                      borderRadius: RADIUS.m,
                      padding: SPACE.s3,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      boxSizing: "border-box"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: lvl.color }} />
                        {lvlName}
                      </span>
                      <span style={{ ...TYPE.tiny, fontWeight: 700, padding: "2px 8px", borderRadius: RADIUS.pill, background: lvl.color + "1a", color: lvl.color }}>
                        {diffLabel} · +{lvl.baseCoins} coin
                      </span>
                    </div>

                    <div style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", ...TYPE.tiny, color: th.t2, marginBottom: 4 }}>
                        <span>{t("bh_learnedWordsLabel")} <b>{seenCount}/{allW.length}</b></span>
                        {newCount > 0 && <span style={{ color: th.gr }}>+{newCount} {t("bh_newWordsSuffix")}</span>}
                      </div>
                      <div style={{ height: 6, borderRadius: RADIUS.full, background: th.bor, overflow: "hidden", width: "100%" }}>
                        <div style={{ width: pct + "%", height: "100%", background: lvl.color, borderRadius: RADIUS.full, transition: "width .3s" }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <PrimaryButton th={th} onClick={startGame}>{t("bd_startLabel")}</PrimaryButton>
          )
        ) : (
          <AppCard th={th} style={{ textAlign: "center", padding: SPACE.s6 + "px " + SPACE.s4 }}>
            <div style={{ ...TYPE.subtitle, color: th.t1, marginBottom: SPACE.s1 }}>{t("bh_comingSoonTitle")}</div>
            <div style={{ ...TYPE.caption, color: th.t2 }}>{t("bh_comingSoonDesc")}</div>
          </AppCard>
        )}
      </div>
    );
  }

  // ═══ O'YINLAR RO'YXATI (kategoriya ichida) ═══
  if (view === "games" && cat) {
    if (cat.id === "math") {
      return (
        <LevelMap
          user={user}
          lg={lg}
          dark={dark}
          subject="math"
          onSelectLevel={(lvl) => {
            setActiveLevel(lvl);
            setView("play-level");
          }}
          onBack={back}
        />
      );
    }
    if (cat.id === "logic") {
      return (
        <LevelMap
          user={user}
          lg={lg}
          dark={dark}
          subject="logic"
          levels={LOGIC_LEVELS}
          title={t("bh_logicRoadmap")}
          onSelectLevel={(lvl) => {
            setActiveLevel(lvl);
            setView("play-level");
          }}
          onBack={back}
        />
      );
    }
    if (cat.id === "memory") {
      return (
        <LevelMap
          user={user}
          lg={lg}
          dark={dark}
          subject="memory"
          levels={MEMORY_LEVELS}
          title={t("bh_memoryRoadmap")}
          onSelectLevel={(lvl) => {
            setActiveLevel(lvl);
            setView("play-level");
          }}
          onBack={back}
        />
      );
    }
    const list = gamesOf(cat.id);
    const prog = progressOf(cat.id);
    return (
      <div>
        <PageHeader th={th} title={cat.name[lg] || cat.name.uz} onBack={back} />
        <AppCard th={th} style={{ background: grad(cat, th), border: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
            <span style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.m, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cat.icon("#fff", 26)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ ...TYPE.subtitle, fontWeight: 800, color: "#fff" }}>{cat.name[lg] || cat.name.uz}</div>
              <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginTop: SPACE.s1 }}>
                <div style={{ flex: 1, height: 6, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
                  <div style={{ width: prog + "%", height: "100%", background: "#fff" }} />
                </div>
                <span style={{ ...TYPE.tiny, letterSpacing: 0, fontWeight: 800, color: "#fff" }}>{prog}%</span>
              </div>
            </div>
          </div>
        </AppCard>
        <SectionHeader th={th}>{t("bh_gamesSectionTitle")}</SectionHeader>
        {list.length === 0
          ? <EmptyState th={th} title={t("bh_noGamesYet")} message={t("bh_gamesComingSoonDesc")} />
          : list.map(g => <GameCard key={g.id} th={th} lg={lg} t={t} game={g} onOpen={openGame} />)}
      </div>
    );
  }

  // ═══ BILIM BOZORI DASHBOARD (bola bosh ekrani) ═══
  //  Yangi struktura: Hero → Continue → Fanlar → Progress → AI → Bog'.
  //  Level/Rank — xp.js (BilimHub'da), qolgan hosila — BilimDashboard ichida.
  const lv = levelFor(xp);
  const rankObj = rankFor(lv.level);
  const rankLabel = rankObj[lg] || rankObj.uz;
  return (
    <div>
      <PageHeader th={th} title={t("bd_bilimBozoriTitle")} onBack={onBack} />
      <BilimDashboard
        th={th} lg={lg} t={t} name={fullName(user)} photo={user?.photo}
        coins={coins} xp={xp} streak={streak} sessions={sessions} learnedWords={learnedWords}
        level={lv.level} rankLabel={rankLabel} rankColor={rankObj.color}
        xpPct={lv.pct} xpToNext={lv.toNext} maxLevel={lv.max}
        openGame={openGame} openCat={openCat} onProfile={openProfile} onBack={onBack}
        onMarket={() => setView("market")}
      />
    </div>
  );
}

// ── Ota-ona preview (o'yin ko'rinmaydi) ──
const ParentPreview = memo(function ParentPreview({ th, lg, t, data }) {
  if (!data || data.length === 0) {
    return <EmptyState th={th} title={t("bh_noData")} message={t("bh_noDataDesc")} />;
  }
  return (
    <>
      {data.map(k => {
        const lv = levelFor(k.xp || 0);
        const rankObj = rankFor(lv.level);
        const analysis = analyzeLearning(k.sessions || [], lg, k.name, 30);
        const week = weeklyReport(k.sessions || [], lg, k.name);
        const D = { easy: DIFF.easy[lg] || DIFF.easy.uz, medium: DIFF.medium[lg] || DIFF.medium.uz, hard: DIFF.hard[lg] || DIFF.hard.uz };
        return (
          <AppCard key={k.id} th={th}>
            {/* Sarlavha: avatar + level + rank */}
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s3 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <UIAvatar th={th} src={k.photo} name={k.name} size={COMP.touchMin} />
                <span style={{ position: "absolute", bottom: -3, right: -3, background: rankObj.color, color: "#fff", ...TYPE.tiny, fontWeight: 800, letterSpacing: 0, borderRadius: RADIUS.pill, padding: "0px 5px", border: "1.5px solid " + th.sur }}>{lv.level}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...TYPE.subtitle, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.name}</div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: rankObj.color, marginTop: 1, fontWeight: 700 }}>{rankObj[lg] || rankObj.uz}</div>
              </div>
            </div>
            {/* Coin · XP · Streak */}
            <div style={{ display: "flex", gap: SPACE.s2 }}>
              <StatCard th={th} value={k.coins} label="Coin" tone={PREMIUM.gold} />
              <StatCard th={th} value={k.xp || 0} label="XP" tone={th.ac} />
              <StatCard th={th} value={k.streak || 0} label="Streak" tone={th.rd} />
            </div>

            {/* Oxirgi o'yin natijasi (o'yinning o'zi ko'rinmaydi) */}
            {k.sessions && k.sessions.length > 0 && (() => {
              const last = k.sessions[0];
              const subj = analysis.bySubject.find(x => x.cat === (last.gameId || "").split("/")[0]);
              const mm = Math.floor((last.seconds || 0) / 60), ssx = (last.seconds || 0) % 60;
              return (
                <div style={{ marginTop: SPACE.s3, background: th.gr + ALPHA.faint, borderRadius: RADIUS.s, padding: SPACE.s3, border: "1px solid " + th.gr + ALPHA.med }}>
                  <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: 2 }}>{t("bh_lastGame")}</div>
                  <div style={{ ...TYPE.caption, color: th.t1, fontWeight: 700 }}>{subj ? subj.name : (last.gameId || "")} — {last.correct}/{last.total} · {last.pct}%</div>
                  <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 2 }}>{(mm ? mm + "m " : "") + ssx + "s"} · +{last.coins} coin · +{last.xp || 0} XP · {D[last.difficulty] || last.difficulty}</div>
                </div>
              );
            })()}

            {/* 30 kunlik fan kesimi */}
            {analysis.bySubject.length > 0 && (
              <div style={{ marginTop: SPACE.s3 }}>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s1 }}>{t("bh_last30Days")}</div>
                {analysis.bySubject.slice(0, 4).map(sub => (
                  <div key={sub.cat} style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s1 }}>
                    <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t1, width: SPACE.s16, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.name}</span>
                    <LinearProgress th={th} value={sub.pct} tone={sub.pct >= 80 ? th.gr : sub.pct >= 60 ? th.am : th.rd} style={{ flex: 1 }} />
                    <span style={{ ...TYPE.tiny, letterSpacing: 0, fontWeight: 700, color: th.t2, width: SPACE.s8, textAlign: "right", flexShrink: 0 }}>{sub.pct}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Haftalik hisobot */}
            <div style={{ marginTop: SPACE.s3, display: "flex", gap: SPACE.s2 }}>
              <div style={{ flex: 1, background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.s, padding: SPACE.s2, textAlign: "center" }}>
                <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1 }}>{week.games}</div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>{t("bh_gamesPerWeek")}</div>
              </div>
              <div style={{ flex: 1, background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.s, padding: SPACE.s2, textAlign: "center" }}>
                <div style={{ ...TYPE.subtitle, fontWeight: 800, color: PREMIUM.gold }}>+{week.coins}</div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>Coin/wk</div>
              </div>
              <div style={{ flex: 1, background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.s, padding: SPACE.s2, textAlign: "center" }}>
                <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.ac }}>+{week.xp}</div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>XP/wk</div>
              </div>
            </div>

            {/* AI xulosasi */}
            <div style={{ marginTop: SPACE.s3, background: th.ac + ALPHA.faint, borderRadius: RADIUS.s, padding: SPACE.s3, display: "flex", gap: SPACE.s2, alignItems: "flex-start" }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10 2a5 5 0 00-3 9c.6.5 1 1 1 2h4c0-1 .4-1.5 1-2a5 5 0 00-3-9z" stroke={th.ac} strokeWidth="1.4" fill={th.ac} fillOpacity="0.15"/><path d="M8 16h4M8.5 18h3" stroke={th.ac} strokeWidth="1.4" strokeLinecap="round"/></svg>
              <span style={{ ...TYPE.caption, color: th.t1 }}><b style={{ color: th.ac }}>AI: </b>{analysis.tip}{analysis.weakTip ? " " + analysis.weakTip : ""}</span>
            </div>
          </AppCard>
        );
      })}
    </>
  );
});

// th ni dark bo'yicha olish (BilimBozor bilan bir xil manba)
function th_(dark) { return dark ? PALETTE.dark : PALETTE.light; }
