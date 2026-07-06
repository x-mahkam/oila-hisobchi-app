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
import { PageHeader, SectionHeader, AppCard, StatCard, Badge, EmptyState, PrimaryButton, LinearProgress, UIAvatar } from "../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE } from "../utils/tokens.js";
import { fullName } from "../utils/formatters.js";
import {
  CATEGORIES, GAMES, catById, gamesOf, gameById, isAvailable,
  availableCount, gameCount, DIFF, TIERS, tierFor, medalSvg,
} from "./registry.jsx";
import { readSessions } from "./engine/persist.js";
import { levelFor, rankFor, readXp } from "./engine/xp.js";
import { computeAchievements } from "./engine/achievements.jsx";
import { analyzeLearning, weeklyReport } from "./engine/analytics.js";
import LearningProfile from "./LearningProfile.jsx";
import BilimBozor from "../BilimBozor.jsx";
import AdditionGame from "./games/AdditionGame.jsx";

const diffColor = (tone, th) => ({ gr: th.gr, am: th.am, rd: th.rd }[tone] || th.ac);
const grad = (g, th) => "linear-gradient(135deg," + (th[g.grad[0]] || th.ac) + "," + (th[g.grad[1]] || th.ac2) + ")";

// ── Kategoriya kartasi ──
const CatCard = memo(function CatCard({ th, lg, cat, coins, progress, onOpen }) {
  const avail = availableCount(cat.id), total = gameCount(cat.id);
  const { cur } = tierFor(coins);
  return (
    <button className="ui-press" onClick={() => onOpen(cat)}
      style={{ textAlign: "left", fontFamily: "inherit", cursor: "pointer", border: "none", padding: 0, borderRadius: RADIUS.l, overflow: "hidden", background: grad(cat, th), boxShadow: SHADOW.e1(th[cat.grad[0]] || th.ac), position: "relative", minHeight: SPACE.s16 * 2 + SPACE.s4, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ position: "absolute", top: -SPACE.s8, right: -SPACE.s8, width: SPACE.s16 + SPACE.s8, height: SPACE.s16 + SPACE.s8, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ padding: SPACE.s3 + "px " + SPACE.s3 + "px 0", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.m, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>{cat.icon("#fff", 26)}</span>
        {cur && <span style={{ background: "rgba(255,255,255,0.9)", borderRadius: RADIUS.pill, padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 3 }}>{medalSvg(cur.color, 13)}<span style={{ ...TYPE.tiny, letterSpacing: 0, fontWeight: 800, color: cur.color }}>{cur[lg] || cur.uz}</span></span>}
      </div>
      <div style={{ padding: "0 " + SPACE.s3 + "px " + SPACE.s3 + "px", position: "relative" }}>
        <div style={{ ...TYPE.subtitle, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{cat.name[lg] || cat.name.uz}</div>
        <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.88)" }}>
          {avail > 0 ? (avail + (lg === "uz" ? " ta o'yin" : lg === "ru" ? " игр" : " games")) : (lg === "uz" ? "Tez orada" : lg === "ru" ? "Скоро" : "Soon")}
          {total > avail ? " · +" + (total - avail) : ""}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1, marginTop: SPACE.s2 }}>
          <div style={{ flex: 1, height: 5, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
            <div style={{ width: Math.min(100, progress) + "%", height: "100%", background: "#fff", borderRadius: RADIUS.full }} />
          </div>
          <span style={{ ...TYPE.tiny, letterSpacing: 0, fontWeight: 800, color: "#fff" }}>{progress}%</span>
        </div>
      </div>
    </button>
  );
});

// ── O'yin kartasi ──
const GameCard = memo(function GameCard({ th, lg, game, onOpen }) {
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
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>· {game.minutes} {lg === "uz" ? "daq" : "min"}</span>
          <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: PREMIUM.gold, fontWeight: 700 }}>· {game.maxCoin} coin</span>
        </span>
      </span>
      {!avail && <span style={{ flexShrink: 0 }}><Badge th={th} tone={th.t3}>{lg === "uz" ? "Tez orada" : lg === "ru" ? "Скоро" : "Soon"}</Badge></span>}
    </button>
  );
});

export default function BilimHub({ user, lg = "uz", dark, oila, azolar = [], onBack }) {
  const uz = lg === "uz";
  const isKid = user?.rol === "kid";
  const [view, setView] = useState("cats");      // cats | games | detail | play | parent
  const [cat, setCat] = useState(null);
  const [game, setGame] = useState(null);

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
      db.g("bilim_streak_" + user.id).then(v => { if (v != null) setStreak(v); }).catch(() => {});
      readSessions(user.id).then(setSessions).catch(() => {});
    } else {
      // Ota-ona: har bolaning natijasini o'qib preview tayyorlash
      const kids = (azolar || []).filter(a => a.rol === "kid");
      Promise.all(kids.map(async k => {
        const [c, xpv, s, st] = await Promise.all([
          db.g("bilim_coins_" + k.id).catch(() => 0),
          db.g("bilim_xp_" + k.id).catch(() => 0),
          db.g("bilim_stats_" + k.id).catch(() => ({})),
          db.g("bilim_streak_" + k.id).catch(() => 0),
        ]);
        const learned = s && typeof s === "object" ? Object.keys(s).length : 0;
        const ksessions = await readSessions(k.id);
        return { id: k.id, name: fullName(k), photo: k.photo, coins: c || 0, xp: Number(xpv) || 0, learned, streak: st || 0, sessions: ksessions };
      })).then(setParentData).catch(() => {});
    }
  }, [user?.id, isKid, azolar]);

  // Ingliz progress = o'rganilgan so'z / taxminiy jami (60 so'z bazaviy)
  const learnedWords = useMemo(() => (stats && typeof stats === "object" ? Object.keys(stats).length : 0), [stats]);
  const progressOf = useCallback((catId) => {
    if (catId === "english") return Math.min(100, Math.round(learnedWords / 60 * 100));
    return 0; // boshqa kategoriyalar hali o'yinsiz
  }, [learnedWords]);
  const coinsOf = useCallback((catId) => (catId === "english" ? coins : 0), [coins]);

  const openCat = useCallback((c) => { setCat(c); setView("games"); }, []);
  const openGame = useCallback((g) => { setGame(g); setView("detail"); }, []);
  const back = useCallback(() => {
    if (view === "play") { setView("detail"); }
    else if (view === "detail") { setView("games"); }
    else if (view === "games" || view === "parent") { setView("cats"); setCat(null); }
    else onBack && onBack();
  }, [view, onBack]);

  const startGame = useCallback(() => {
    if (game && isAvailable(game)) setView("play");
  }, [game]);

  // ═══ PLAY — real o'yin (hozircha english/words → BilimBozor) ═══
  if (view === "play" && game && game.load === "english/words") {
    return <BilimBozor user={user} lg={lg} dark={dark} oila={oila} azolar={azolar} embedded gameTitle={game.name[lg] || game.name.uz} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "math/addition") {
    return <AdditionGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
  }

  // ═══ LEARNING PROFILE (bola) ═══
  if (view === "profile") {
    return (
      <div>
        <PageHeader th={th_(dark)} title={uz ? "Mening profilim" : lg === "ru" ? "Мой профиль" : "My profile"} onBack={() => setView("cats")} />
        <LearningProfile th={th_(dark)} lg={lg} user={user} coins={coins} xp={xp} streak={streak} sessions={sessions} />
      </div>
    );
  }

  // ═══ PARENT PREVIEW — o'yin ko'rinmaydi, faqat natija ═══
  if (view === "parent" || (!isKid && view === "cats")) {
    return (
      <div>
        <PageHeader th={th_(dark)} title={uz ? "Bilim Bozori — monitoring" : lg === "ru" ? "Мониторинг" : "Learning monitor"} onBack={onBack} />
        <ParentPreview th={th_(dark)} lg={lg} data={parentData} />
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
        <div style={{ background: grad(catById(game.category) || CATEGORIES[0], th), borderRadius: RADIUS.l, padding: SPACE.s6 + "px " + SPACE.s4, marginBottom: SPACE.s3, textAlign: "center", boxShadow: SHADOW.e1(th.ac) }}>
          <div style={{ width: SPACE.s16 + SPACE.s4, height: SPACE.s16 + SPACE.s4, borderRadius: RADIUS.l, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto " + SPACE.s3 }}>{game.icon("#fff", 44)}</div>
          <div style={{ ...TYPE.heading, fontWeight: 800, color: "#fff" }}>{game.name[lg] || game.name.uz}</div>
          <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.9)", marginTop: SPACE.s1 }}>{game.desc[lg] || game.desc.uz}</div>
        </div>
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatCard th={th} value={d[lg] || d.uz} label={uz ? "Daraja" : lg === "ru" ? "Сложность" : "Difficulty"} tone={dc} />
          <StatCard th={th} value={game.minutes + (uz ? " daq" : "m")} label={uz ? "Vaqt" : lg === "ru" ? "Время" : "Time"} tone={th.ac} />
          <StatCard th={th} value={game.maxCoin} label={uz ? "Max coin" : "Max coin"} tone={PREMIUM.gold} />
        </div>
        {game.premium && (
          <AppCard th={th} style={{ background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, display: "flex", alignItems: "center", gap: SPACE.s2 }}>
            <Badge th={th} type="pro" />
            <span style={{ ...TYPE.caption, color: th.t2 }}>{uz ? "Premium o'yin — obuna kerak" : lg === "ru" ? "Премиум-игра" : "Premium game"}</span>
          </AppCard>
        )}
        {avail ? (
          <PrimaryButton th={th} onClick={startGame}>{uz ? "Boshlash" : lg === "ru" ? "Начать" : "Start"}</PrimaryButton>
        ) : (
          <AppCard th={th} style={{ textAlign: "center", padding: SPACE.s6 + "px " + SPACE.s4 }}>
            <div style={{ ...TYPE.subtitle, color: th.t1, marginBottom: SPACE.s1 }}>{uz ? "Tez orada" : lg === "ru" ? "Скоро" : "Coming soon"}</div>
            <div style={{ ...TYPE.caption, color: th.t2 }}>{uz ? "Bu o'yin keyingi yangilanishda qo'shiladi." : lg === "ru" ? "Игра появится в следующем обновлении." : "This game arrives in a future update."}</div>
          </AppCard>
        )}
      </div>
    );
  }

  // ═══ O'YINLAR RO'YXATI (kategoriya ichida) ═══
  if (view === "games" && cat) {
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
        <SectionHeader th={th}>{uz ? "O'yinlar" : lg === "ru" ? "Игры" : "Games"}</SectionHeader>
        {list.length === 0
          ? <EmptyState th={th} title={uz ? "Hali o'yin yo'q" : "No games yet"} message={uz ? "Tez orada qo'shiladi." : "Coming soon."} />
          : list.map(g => <GameCard key={g.id} th={th} lg={lg} game={g} onOpen={openGame} />)}
      </div>
    );
  }

  // ═══ KATEGORIYALAR (bola bosh ekrani) ═══
  const lv = levelFor(xp);
  const rankObj = rankFor(lv.level);
  const rankLabel = rankObj[lg] || rankObj.uz;
  const achievements = computeAchievements({ coins, xp, streak }, sessions, lg);
  const unlocked = achievements.filter(a => a.unlocked);
  return (
    <div>
      <PageHeader th={th} title={uz ? "Bilim Bozori" : lg === "ru" ? "Рынок знаний" : "Knowledge Market"} onBack={onBack} />

      {/* Learning header: Level + XP + Coin (bosilsa profil) */}
      <button className="ui-press" onClick={() => setView("profile")} style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", border: "none", padding: 0, marginBottom: SPACE.s3, borderRadius: RADIUS.l, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg," + rankObj.color + "," + th.ac2 + ")", padding: SPACE.s4, boxShadow: SHADOW.e1(th.ac) }}>
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ padding: 3, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.3)", display: "inline-flex" }}>
                <UIAvatar th={th} src={user?.photo} name={fullName(user)} size={COMP.touchMin + SPACE.s2} />
              </div>
              <span style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", background: "#fff", color: rankObj.color, ...TYPE.tiny, fontWeight: 800, letterSpacing: 0, borderRadius: RADIUS.pill, padding: "1px 8px" }}>LVL {lv.level}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...TYPE.subtitle, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName(user)}</div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.9)" }}>{rankLabel}</div>
              <div style={{ marginTop: SPACE.s1 }}>
                <div style={{ height: 6, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
                  <div style={{ width: lv.pct + "%", height: "100%", background: "#fff" }} />
                </div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{lv.max ? (uz ? "Maksimal daraja" : "Max level") : (lv.toNext + " XP → LVL " + (lv.level + 1))}</div>
              </div>
            </div>
          </div>
          {/* Coin + XP + streak chiplari */}
          <div style={{ display: "flex", gap: SPACE.s2, marginTop: SPACE.s3 }}>
            <span style={{ flex: 1, background: "rgba(255,255,255,0.16)", borderRadius: RADIUS.s + 2, padding: SPACE.s2 + "px " + SPACE.s3, textAlign: "center" }}>
              <span style={{ display: "block", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.85)" }}>Coin</span>
              <span style={{ display: "block", ...TYPE.subtitle, fontWeight: 800, color: "#fff" }}>{coins}</span>
            </span>
            <span style={{ flex: 1, background: "rgba(255,255,255,0.16)", borderRadius: RADIUS.s + 2, padding: SPACE.s2 + "px " + SPACE.s3, textAlign: "center" }}>
              <span style={{ display: "block", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.85)" }}>XP</span>
              <span style={{ display: "block", ...TYPE.subtitle, fontWeight: 800, color: "#fff" }}>{xp}</span>
            </span>
            <span style={{ flex: 1, background: "rgba(255,255,255,0.16)", borderRadius: RADIUS.s + 2, padding: SPACE.s2 + "px " + SPACE.s3, textAlign: "center" }}>
              <span style={{ display: "block", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.85)" }}>{uz ? "Streak" : "Streak"}</span>
              <span style={{ display: "block", ...TYPE.subtitle, fontWeight: 800, color: "#fff" }}>{streak}</span>
            </span>
          </div>
        </div>
      </button>

      {/* Yutuqlar (umumiy, SVG badge) */}
      <SectionHeader th={th} right={<Badge th={th} type="premium" icon={null}>{unlocked.length}/{achievements.length}</Badge>}>{uz ? "Yutuqlar" : lg === "ru" ? "Достижения" : "Achievements"}</SectionHeader>
      <div style={{ display: "flex", gap: SPACE.s2, overflowX: "auto", paddingBottom: SPACE.s2, marginBottom: SPACE.s3, WebkitOverflowScrolling: "touch" }}>
        {achievements.map(a => (
          <div key={a.id} style={{ flexShrink: 0, width: SPACE.s16 + SPACE.s6, textAlign: "center", background: a.unlocked ? a.color + ALPHA.faint : th.sur, border: a.unlocked ? "1.5px solid " + a.color + ALPHA.strong : "1px dashed " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s2, opacity: a.unlocked ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 2, filter: a.unlocked ? "none" : "grayscale(1)" }}>{a.icon(a.unlocked ? a.color : th.t3, 26)}</div>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: a.unlocked ? th.t1 : th.t3, lineHeight: 1.2 }}>{a.title}</div>
            {!a.unlocked && <div style={{ ...TYPE.tiny, letterSpacing: 0, color: th.t3, marginTop: 1 }}>{a.cur}/{a.goal}</div>}
          </div>
        ))}
      </div>

      <SectionHeader th={th}>{uz ? "Kategoriyalar" : lg === "ru" ? "Категории" : "Categories"}</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2 }}>
        {CATEGORIES.map(c => (
          <CatCard key={c.id} th={th} lg={lg} cat={c} coins={coinsOf(c.id)} progress={progressOf(c.id)} onOpen={openCat} />
        ))}
      </div>
    </div>
  );
}

// ── Ota-ona preview (o'yin ko'rinmaydi) ──
const ParentPreview = memo(function ParentPreview({ th, lg, data }) {
  const uz = lg === "uz";
  if (!data || data.length === 0) {
    return <EmptyState th={th} title={uz ? "Ma'lumot yo'q" : lg === "ru" ? "Нет данных" : "No data"} message={uz ? "Bola o'ynagach natijalar shu yerda ko'rinadi." : "Kid results will appear here."} />;
  }
  return (
    <>
      {data.map(k => {
        const lv = levelFor(k.xp || 0);
        const rankObj = rankFor(lv.level);
        const analysis = analyzeLearning(k.sessions || [], lg, k.name, 30);
        const week = weeklyReport(k.sessions || [], lg, k.name);
        const D = { easy: uz ? "Oson" : "Easy", medium: uz ? "O'rta" : "Medium", hard: uz ? "Qiyin" : "Hard" };
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
              <StatCard th={th} value={k.streak || 0} label={uz ? "Streak" : "Streak"} tone={th.rd} />
            </div>

            {/* Oxirgi o'yin natijasi (o'yinning o'zi ko'rinmaydi) */}
            {k.sessions && k.sessions.length > 0 && (() => {
              const last = k.sessions[0];
              const subj = analysis.bySubject.find(x => x.cat === (last.gameId || "").split("/")[0]);
              const mm = Math.floor((last.seconds || 0) / 60), ssx = (last.seconds || 0) % 60;
              return (
                <div style={{ marginTop: SPACE.s3, background: th.gr + ALPHA.faint, borderRadius: RADIUS.s, padding: SPACE.s3, border: "1px solid " + th.gr + ALPHA.med }}>
                  <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: 2 }}>{uz ? "Oxirgi o'yin" : lg === "ru" ? "Последняя игра" : "Last game"}</div>
                  <div style={{ ...TYPE.caption, color: th.t1, fontWeight: 700 }}>{subj ? subj.name : (last.gameId || "")} — {last.correct}/{last.total} · {last.pct}%</div>
                  <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 2 }}>{(mm ? mm + "m " : "") + ssx + "s"} · +{last.coins} coin · +{last.xp || 0} XP · {D[last.difficulty] || last.difficulty}</div>
                </div>
              );
            })()}

            {/* 30 kunlik fan kesimi */}
            {analysis.bySubject.length > 0 && (
              <div style={{ marginTop: SPACE.s3 }}>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: SPACE.s1 }}>{uz ? "Oxirgi 30 kun (fan bo'yicha)" : lg === "ru" ? "30 дней" : "Last 30 days"}</div>
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
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3 }}>{uz ? "Haftalik o'yin" : "Games/wk"}</div>
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
              <span style={{ ...TYPE.caption, color: th.t1 }}><b style={{ color: th.ac }}>{uz ? "AI: " : "AI: "}</b>{analysis.tip}{analysis.weakTip ? " " + analysis.weakTip : ""}</span>
            </div>
          </AppCard>
        );
      })}
    </>
  );
});

// th ni dark bo'yicha olish (BilimBozor bilan bir xil manba)
function th_(dark) { return dark ? PALETTE.dark : PALETTE.light; }
