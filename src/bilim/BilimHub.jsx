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
  const [stats, setStats] = useState({});
  const [streak, setStreak] = useState(0);
  const [parentData, setParentData] = useState([]); // ota-ona uchun bolalar bo'yicha

  useEffect(() => {
    if (!user?.id) return;
    if (isKid) {
      db.g("bilim_coins_" + user.id).then(v => { if (v != null) setCoins(v); }).catch(() => {});
      db.g("bilim_stats_" + user.id).then(v => { if (v && typeof v === "object") setStats(v); }).catch(() => {});
      db.g("bilim_streak_" + user.id).then(v => { if (v != null) setStreak(v); }).catch(() => {});
    } else {
      // Ota-ona: har bolaning natijasini o'qib preview tayyorlash
      const kids = (azolar || []).filter(a => a.rol === "kid");
      Promise.all(kids.map(async k => {
        const [c, s, st] = await Promise.all([
          db.g("bilim_coins_" + k.id).catch(() => 0),
          db.g("bilim_stats_" + k.id).catch(() => ({})),
          db.g("bilim_streak_" + k.id).catch(() => 0),
        ]);
        const learned = s && typeof s === "object" ? Object.keys(s).length : 0;
        const sessions = await readSessions(k.id);
        return { id: k.id, name: fullName(k), photo: k.photo, coins: c || 0, learned, streak: st || 0, sessions };
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
    return <BilimBozor user={user} lg={lg} dark={dark} oila={oila} azolar={azolar} onBack={() => setView("detail")} />;
  }
  if (view === "play" && game && game.load === "math/addition") {
    return <AdditionGame user={user} lg={lg} dark={dark} gameId={game.id} name={fullName(user)} onBack={() => setView("detail")} />;
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
  const { cur, next } = tierFor(coins);
  return (
    <div>
      <PageHeader th={th} title={uz ? "Bilim Bozori" : lg === "ru" ? "Рынок знаний" : "Knowledge Market"} onBack={onBack} />

      {/* Coin + achievement bosh paneli */}
      <AppCard th={th} style={{ background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", border: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
          <div style={{ width: COMP.touchMin + SPACE.s2, height: COMP.touchMin + SPACE.s2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {cur ? medalSvg("#fff", 28) : <span style={{ ...TYPE.title, color: "#fff" }}>{coins}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.85)" }}>{uz ? "Bilim Coin" : "Coins"}</div>
            <div style={{ ...TYPE.heading, fontWeight: 800, color: "#fff" }}>{coins} {cur ? "· " + (cur[lg] || cur.uz) : ""}</div>
            {next && (
              <div style={{ marginTop: SPACE.s1 }}>
                <div style={{ height: 5, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
                  <div style={{ width: Math.min(100, Math.round(coins / next.need * 100)) + "%", height: "100%", background: "#fff" }} />
                </div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{next.need - coins} coin → {next[lg] || next.uz}</div>
              </div>
            )}
          </div>
          {streak > 0 && <Badge th={th} type="warning">{streak} {uz ? "kun" : "d"}</Badge>}
        </div>
      </AppCard>

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
        const { cur } = tierFor(k.coins);
        const estMin = Math.round(k.learned * 0.5); // taxminiy: har so'z ~30s
        const tip = k.learned === 0
          ? (uz ? "Hali boshlamagan — birga boshlab bering" : "Not started — start together")
          : k.streak >= 3
            ? (uz ? "Zo'r sur'at! Rag'batlantiring" : "Great streak! Encourage them")
            : (uz ? "Kunlik odat shakllantiring" : "Build a daily habit");
        return (
          <AppCard key={k.id} th={th}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s3 }}>
              <UIAvatar th={th} src={k.photo} name={k.name} size={COMP.touchMin} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...TYPE.subtitle, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.name}</div>
                <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>{uz ? "So'z o'rgan (Ingliz tili)" : lg === "ru" ? "Учит слова" : "Learning words"}</div>
              </div>
              {cur && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>{medalSvg(cur.color, 18)}</span>}
            </div>
            <div style={{ display: "flex", gap: SPACE.s2 }}>
              <StatCard th={th} value={k.coins} label={uz ? "Coin" : "Coins"} tone={PREMIUM.gold} />
              <StatCard th={th} value={k.learned} label={uz ? "Natija (so'z)" : lg === "ru" ? "Слова" : "Words"} tone={th.gr} />
              <StatCard th={th} value={"~" + estMin + (uz ? " daq" : "m")} label={uz ? "Vaqt" : lg === "ru" ? "Время" : "Time"} tone={th.ac} />
            </div>
            {k.sessions && k.sessions.length > 0 && (() => {
              const last = k.sessions[0];
              const D = { easy: uz ? "Oson" : "Easy", medium: uz ? "O'rta" : "Medium", hard: uz ? "Qiyin" : "Hard" };
              const mm = Math.floor((last.seconds || 0) / 60), ssx = (last.seconds || 0) % 60;
              return (
                <div style={{ marginTop: SPACE.s3, background: th.gr + ALPHA.faint, borderRadius: RADIUS.s, padding: SPACE.s3, border: "1px solid " + th.gr + ALPHA.med }}>
                  <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: 2 }}>{uz ? "Bugungi o'yin" : lg === "ru" ? "Игра сегодня" : "Today's game"}</div>
                  <div style={{ ...TYPE.caption, color: th.t1, fontWeight: 700 }}>{uz ? "Qo'shish" : "Addition"} — {last.correct}/{last.total} · {last.pct}%</div>
                  <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 2 }}>{(mm ? mm + "m " : "") + ssx + "s"} · {last.coins} coin · {D[last.difficulty] || last.difficulty}</div>
                </div>
              );
            })()}
            <div style={{ marginTop: SPACE.s3, background: th.ac + ALPHA.faint, borderRadius: RADIUS.s, padding: SPACE.s3, display: "flex", gap: SPACE.s2, alignItems: "flex-start" }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10 2a5 5 0 00-3 9c.6.5 1 1 1 2h4c0-1 .4-1.5 1-2a5 5 0 00-3-9z" stroke={th.ac} strokeWidth="1.4" fill={th.ac} fillOpacity="0.15"/><path d="M8 16h4M8.5 18h3" stroke={th.ac} strokeWidth="1.4" strokeLinecap="round"/></svg>
              <span style={{ ...TYPE.caption, color: th.t1 }}><b style={{ color: th.ac }}>{uz ? "AI tavsiyasi: " : "AI: "}</b>{tip}</span>
            </div>
          </AppCard>
        );
      })}
    </>
  );
});

// th ni dark bo'yicha olish (BilimBozor bilan bir xil manba)
function th_(dark) { return dark ? PALETTE.dark : PALETTE.light; }
