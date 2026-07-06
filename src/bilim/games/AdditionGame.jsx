// ═══════════════════════════════════════════════════════════
//  ADDITION GAME (Sprint: birinchi mini-o'yin, TEMPLATE)
//  Barcha kelajakdagi quiz-o'yinlar SHU tuzilishdan nusxa oladi:
//   • useGameEngine (dvigatel) + generator (savol) → mustaqil modullar
//   • countdown → savol → 4 variant → natija
//   • coin MAVJUD "bilim_coins_" ga qo'shiladi; sessiya "bilim_games_" ga
//  Dizayn: katta kartalar/tugmalar/raqamlar, minimal matn (Duolingo/Khan/Photomath).
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE, MOTION } from "../../utils/tokens.js";
import { useGameEngine } from "../engine/useGameEngine.js";
import { additionGenerator } from "./generators/addition.js";
import { addCoins, logGameSession, bestForGame } from "../engine/persist.js";
import { DIFF } from "../registry.jsx";

// Bir marta inject qilinadigan keyframe'lar (pulse / shake / fly)
const CSS_ID = "bilim-game-css";
const injectCss = () => {
  if (typeof document === "undefined" || document.getElementById(CSS_ID)) return;
  const st = document.createElement("style");
  st.id = CSS_ID;
  st.textContent = `
@keyframes bgPulse{0%{transform:scale(1)}40%{transform:scale(1.06)}100%{transform:scale(1)}}
@keyframes bgShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes bgFly{0%{opacity:0;transform:translateY(0) scale(.8)}20%{opacity:1}100%{opacity:0;transform:translateY(-70px) scale(1.2)}}
@keyframes bgPop{0%{opacity:0;transform:scale(.9)}100%{opacity:1;transform:scale(1)}}
.bg-pulse{animation:bgPulse .5s ease}
.bg-shake{animation:bgShake .4s ease}
.bg-fly{animation:bgFly 1s ease forwards}
.bg-pop{animation:bgPop .25s ease}
@media (prefers-reduced-motion:reduce){.bg-pulse,.bg-shake,.bg-fly,.bg-pop{animation-duration:1ms}}
`;
  document.head.appendChild(st);
};

const coinIco = (c, s = 20) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".2"/><path d="M10 7v6M8 10h4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;

// ── Variant tugmasi (memo) ──
const OptButton = memo(function OptButton({ th, value, state, onPick, disabled }) {
  // state: null | "correct" | "wrong" | "muted"
  const bg = state === "correct" ? th.gr : state === "wrong" ? th.rd : th.sur;
  const bd = state === "correct" ? th.gr : state === "wrong" ? th.rd : th.bor;
  const col = state === "correct" || state === "wrong" ? "#fff" : th.t1;
  const cls = state === "correct" ? "bg-pulse" : state === "wrong" ? "bg-shake" : "";
  return (
    <button className={"ui-press " + cls} onClick={() => onPick(value)} disabled={disabled}
      style={{ background: bg, border: "2px solid " + bd, borderRadius: RADIUS.l, padding: SPACE.s6 + "px", cursor: disabled ? "default" : "pointer", fontFamily: "inherit", opacity: state === "muted" ? 0.5 : 1, transition: "background " + MOTION.fast + ", border-color " + MOTION.fast, boxShadow: SHADOW.e0 }}>
      <span style={{ fontSize: 34, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</span>
    </button>
  );
});

export default function AdditionGame({ user, lg = "uz", dark, gameId = "math/addition", name, onBack }) {
  const th = dark ? PALETTE.dark : PALETTE.light;
  const uz = lg === "uz";
  const kidName = name || (user && (user.ism || "")) || "";

  useEffect(() => { injectCss(); }, []);

  const eng = useGameEngine({
    questionCount: 10,
    generator: additionGenerator,
    startDifficulty: "easy",
    name: kidName,
    lg,
  });

  const [count, setCount] = useState(3);           // countdown 3-2-1
  const [picked, setPicked] = useState(null);      // tanlangan variant (feedback)
  const [feed, setFeed] = useState(null);          // "correct" | "wrong"
  const [flies, setFlies] = useState([]);          // uchuvchi coinlar
  const [saved, setSaved] = useState(false);
  const [record, setRecord] = useState(false);
  const savingRef = useRef(false);

  // Countdown
  useEffect(() => {
    if (eng.phase !== "countdown") return;
    setCount(3);
    let n = 3;
    const iv = setInterval(() => {
      n -= 1;
      if (n <= 0) { clearInterval(iv); eng.beginPlay(); }
      else setCount(n);
    }, 800);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eng.phase]);

  // Har yangi savolда feedback tozalanadi
  useEffect(() => { setPicked(null); setFeed(null); }, [eng.qIndex, eng.question]);

  // Natija saqlash (bir marta)
  useEffect(() => {
    if (eng.phase !== "result" || !eng.result || savingRef.current || !user?.id) return;
    savingRef.current = true;
    (async () => {
      const prevBest = await bestForGame(user.id, gameId);
      await addCoins(user.id, eng.result.coins);
      const isRec = eng.result.coins > prevBest;
      await logGameSession(user.id, {
        gameId, correct: eng.result.correct, total: eng.result.total, pct: eng.result.pct,
        seconds: eng.result.seconds, maxCombo: eng.result.maxCombo, coins: eng.result.coins,
        difficulty: eng.result.difficulty, newRecord: isRec,
      });
      setRecord(isRec); setSaved(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eng.phase, eng.result]);

  const spawnFly = useCallback((amount) => {
    const id = Date.now() + Math.random();
    setFlies(p => [...p, { id, amount }]);
    setTimeout(() => setFlies(p => p.filter(f => f.id !== id)), 1000);
  }, []);

  const onPick = useCallback((value) => {
    if (picked != null) return;
    setPicked(value);
    eng.answer(value, (correct, gained) => {
      setFeed(correct ? "correct" : "wrong");
      if (correct && gained > 0) spawnFly(gained);
    });
  }, [picked, eng, spawnFly]);

  const optState = (opt) => {
    if (picked == null || !eng.question) return null;
    if (opt === eng.question.answer) return "correct";
    if (opt === picked) return "wrong";
    return "muted";
  };

  const diffMeta = DIFF[eng.difficulty] || DIFF.easy;
  const diffColor = ({ gr: th.gr, am: th.am, rd: th.rd }[diffMeta.tone]) || th.ac;

  // ═══ INTRO ═══
  if (eng.phase === "intro") {
    return (
      <div>
        <PageHeader th={th} title={uz ? "Qo'shish" : lg === "ru" ? "Сложение" : "Addition"} onBack={onBack} />
        <div style={{ background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", borderRadius: RADIUS.l, padding: SPACE.s8 + "px " + SPACE.s4, textAlign: "center", marginBottom: SPACE.s4, boxShadow: SHADOW.e1(th.ac) }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>7 + 5</div>
          <div style={{ ...TYPE.subtitle, color: "rgba(255,255,255,.9)", marginTop: SPACE.s2 }}>{uz ? "Qo'shishni o'rgan, coin yig'!" : lg === "ru" ? "Учись складывать!" : "Learn addition, earn coins!"}</div>
        </div>
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
          <StatCard th={th} value="10" label={uz ? "Savol" : lg === "ru" ? "Вопросов" : "Questions"} tone={th.ac} />
          <StatCard th={th} value={uz ? "Moslashuvchi" : "Adaptive"} label={uz ? "Daraja" : "Level"} tone={th.am} />
          <StatCard th={th} value="10+" label="Coin" tone={PREMIUM.gold} />
        </div>
        <PrimaryButton th={th} onClick={eng.start}>{uz ? "Boshlash" : lg === "ru" ? "Начать" : "Start"}</PrimaryButton>
      </div>
    );
  }

  // ═══ COUNTDOWN ═══
  if (eng.phase === "countdown") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div key={count} className="bg-pop" style={{ width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW.e2 }}>
          <span style={{ fontSize: 72, fontWeight: 800, color: "#fff" }}>{count}</span>
        </div>
        <div style={{ ...TYPE.subtitle, color: th.t2, marginTop: SPACE.s6 }}>{uz ? "Tayyor bo'l!" : lg === "ru" ? "Приготовься!" : "Get ready!"}</div>
      </div>
    );
  }

  // ═══ RESULT ═══
  if (eng.phase === "result" && eng.result) {
    const r = eng.result;
    const mm = Math.floor(r.seconds / 60), ss = r.seconds % 60;
    return (
      <div>
        <PageHeader th={th} title={uz ? "Natija" : lg === "ru" ? "Результат" : "Result"} onBack={onBack} />
        <div style={{ background: "linear-gradient(135deg," + (r.pct >= 70 ? th.gr : th.am) + "," + th.ac2 + ")", borderRadius: RADIUS.l, padding: SPACE.s8 + "px " + SPACE.s4, textAlign: "center", marginBottom: SPACE.s3, boxShadow: SHADOW.e1(th.ac) }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#fff" }}>{r.pct}%</div>
          <div style={{ ...TYPE.subtitle, color: "#fff", marginTop: SPACE.s1 }}>{r.correct}/{r.total} {uz ? "to'g'ri" : lg === "ru" ? "верно" : "correct"}</div>
          {record && <div style={{ marginTop: SPACE.s2 }}><Badge th={th} type="premium" icon={null}>{uz ? "YANGI REKORD" : lg === "ru" ? "РЕКОРД" : "NEW RECORD"}</Badge></div>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatCard th={th} value={r.correct} label={uz ? "To'g'ri" : lg === "ru" ? "Верно" : "Correct"} tone={th.gr} />
          <StatCard th={th} value={r.wrong} label={uz ? "Xato" : lg === "ru" ? "Ошибки" : "Wrong"} tone={th.rd} />
          <StatCard th={th} value={(mm ? mm + "m " : "") + ss + "s"} label={uz ? "Vaqt" : lg === "ru" ? "Время" : "Time"} tone={th.ac} />
          <StatCard th={th} value={"x" + r.maxCombo} label="Combo" tone={th.am} />
        </div>
        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med }}>
          {coinIco(PREMIUM.gold, 28)}
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{uz ? "Topilgan coin" : lg === "ru" ? "Монеты" : "Coins earned"}</div>
            <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>+{r.coins}</div>
          </div>
          {r.perfect && <Badge th={th} tone={PREMIUM.gold}>Perfect +{r.perfectBonus}</Badge>}
        </AppCard>
        {/* AI tahlil */}
        <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med }}>
          <div style={{ display: "flex", gap: SPACE.s2, alignItems: "flex-start" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10 2a5 5 0 00-3 9c.6.5 1 1 1 2h4c0-1 .4-1.5 1-2a5 5 0 00-3-9z" stroke={th.ac} strokeWidth="1.4" fill={th.ac} fillOpacity="0.15"/><path d="M8 16h4M8.5 18h3" stroke={th.ac} strokeWidth="1.4" strokeLinecap="round"/></svg>
            <div>
              <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{r.ai.verdict}</div>
              <div style={{ ...TYPE.caption, color: th.t2, marginTop: 2 }}>{r.ai.tip}</div>
            </div>
          </div>
        </AppCard>
        <PrimaryButton th={th} onClick={eng.start} style={{ marginTop: SPACE.s2 }}>{uz ? "Yana o'ynash" : lg === "ru" ? "Ещё раз" : "Play again"}</PrimaryButton>
        <button className="ui-press" onClick={onBack} style={{ width: "100%", marginTop: SPACE.s2, background: "transparent", border: "none", color: th.t2, padding: SPACE.s3, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{uz ? "Chiqish" : lg === "ru" ? "Выход" : "Exit"}</button>
      </div>
    );
  }

  // ═══ PLAY ═══
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column" }}>
      {/* Yuqori progress: 10 ta savol */}
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, padding: SPACE.s2 + "px 0 " + SPACE.s4 }}>
        <button className="ui-press" onClick={onBack} aria-label="back" style={{ background: "transparent", border: "none", cursor: "pointer", padding: SPACE.s1, flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M13 5l-6 6 6 6" stroke={th.t2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ flex: 1, display: "flex", gap: 3 }}>
          {Array.from({ length: eng.questionCount }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 7, borderRadius: RADIUS.full, background: i < eng.qIndex ? th.gr : i === eng.qIndex ? th.ac : th.bor, transition: "background " + MOTION.fast }} />
          ))}
        </div>
        <Badge th={th} tone={diffColor}>{diffMeta[lg] || diffMeta.uz}</Badge>
      </div>

      {/* Coin + combo satri */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACE.s4 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1, ...TYPE.subtitle, color: PREMIUM.gold, fontWeight: 800 }}>{coinIco(PREMIUM.gold, 18)}{eng.score.coins}</span>
        {eng.score.combo >= 2 && <Badge th={th} type="warning">Combo x{eng.score.combo}</Badge>}
      </div>

      {/* Savol kartasi — katta raqamlar */}
      <div style={{ position: "relative", background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.l, padding: SPACE.s8 + "px " + SPACE.s4, textAlign: "center", marginBottom: SPACE.s6, boxShadow: SHADOW.e1(th.ac) }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: th.t1, fontVariantNumeric: "tabular-nums", letterSpacing: 1 }}>{eng.question ? eng.question.prompt : ""}</div>
        {/* Uchuvchi coinlar */}
        {flies.map(fl => (
          <span key={fl.id} className="bg-fly" style={{ position: "absolute", top: SPACE.s6, left: "50%", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 3, ...TYPE.subtitle, fontWeight: 800, color: PREMIUM.gold, pointerEvents: "none" }}>
            {coinIco(PREMIUM.gold, 18)}+{fl.amount}
          </span>
        ))}
      </div>

      {/* 4 ta katta variant */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3 }}>
        {eng.question && eng.question.options.map((opt, i) => (
          <OptButton key={i} th={th} value={opt} state={optState(opt)} onPick={onPick} disabled={picked != null} />
        ))}
      </div>
    </div>
  );
}
