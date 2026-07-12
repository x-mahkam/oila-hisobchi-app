// ═══════════════════════════════════════════════════════════
//  BOLALAR O'YINLARI — bilim beruvchi o'yinlar markazi
//  (5-rasmdagi uslub: gradient kartalar, to'liq ekran)
//  Ishlaydigan: Matematik Ninja, So'z Ustasi (ingliz tili)
//  Ball: yaxshi natija liderbordga ham qo'shiladi (kuniga 1 marta/o'yin)
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { db } from "../firebase.js";

const WORDS = [
  ["olma","apple"],["kitob","book"],["maktab","school"],["quyosh","sun"],["oy","moon"],
  ["suv","water"],["non","bread"],["mushuk","cat"],["it","dog"],["qush","bird"],
  ["daraxt","tree"],["gul","flower"],["uy","house"],["eshik","door"],["deraza","window"],
  ["stol","table"],["stul","chair"],["qalam","pencil"],["ruchka","pen"],["daftar","notebook"],
  ["ota","father"],["ona","mother"],["aka","brother"],["opa","sister"],["do'st","friend"],
  ["qizil","red"],["ko'k","blue"],["yashil","green"],["sariq","yellow"],["oq","white"],
  ["qora","black"],["katta","big"],["kichik","small"],["tez","fast"],["sekin","slow"],
  ["baxtli","happy"],["yugurmoq","run"],["o'qimoq","read"],["yozmoq","write"],["o'ynamoq","play"],
];

const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = rnd(i + 1); [x[i], x[j]] = [x[j], x[i]]; } return x; };

// Matematika savoli yaratish
const makeMathQ = (lvl) => {
  const ops = lvl === 1 ? ["+","−"] : lvl === 2 ? ["+","−","×"] : ["+","−","×","÷"];
  const op = ops[rnd(ops.length)];
  let a, b, ans;
  const M = lvl === 1 ? 20 : lvl === 2 ? 50 : 100;
  if (op === "+") { a = 2 + rnd(M); b = 2 + rnd(M); ans = a + b; }
  else if (op === "−") { a = 5 + rnd(M); b = 1 + rnd(a - 1); ans = a - b; }
  else if (op === "×") { a = 2 + rnd(lvl === 2 ? 9 : 12); b = 2 + rnd(lvl === 2 ? 9 : 12); ans = a * b; }
  else { b = 2 + rnd(9); ans = 2 + rnd(10); a = b * ans; }
  const opts = new Set([ans]);
  while (opts.size < 4) opts.add(Math.max(0, ans + (rnd(2) ? 1 : -1) * (1 + rnd(Math.max(3, Math.floor(ans * 0.3))))));
  return { q: `${a} ${op} ${b} = ?`, ans, opts: shuffle([...opts]) };
};

// So'z savoli yaratish
const makeWordQ = (used) => {
  let idx; do { idx = rnd(WORDS.length); } while (used.has(idx) && used.size < WORDS.length);
  used.add(idx);
  const [uz, en] = WORDS[idx];
  const opts = new Set([en]);
  while (opts.size < 4) opts.add(WORDS[rnd(WORDS.length)][1]);
  return { q: uz, ans: en, opts: shuffle([...opts]) };
};

const TOTAL_Q = 10;

export default function KidsGames({ user, lg = "uz", onClose, addStar }) {
  const L = (uz, ru = uz) => (lg === "ru" ? ru : uz);
  const [view, setView] = useState("hub");     // hub | math-lvl | play | result
  const [game, setGame] = useState(null);      // math | word
  const [lvl, setLvl] = useState(1);
  const [qNum, setQNum] = useState(0);
  const [q, setQ] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState({});
  const usedRef = useRef(new Set());

  useEffect(() => {
    if (!user?.id) return;
    db.g("kidgame_" + user.id).then(v => { if (v && typeof v === "object") setBest(v); }).catch(() => {});
  }, [user?.id]);

  const nextQ = (g, l, used) => setQ(g === "math" ? makeMathQ(l) : makeWordQ(used));

  const startGame = (g, l = 1) => {
    usedRef.current = new Set();
    setGame(g); setLvl(l); setQNum(1); setScore(0); setPicked(null);
    nextQ(g, l, usedRef.current);
    setView("play");
  };

  const pick = (opt) => {
    if (picked !== null) return;
    setPicked(opt);
    const ok = opt === q.ans;
    const ns = ok ? score + 1 : score;
    if (ok) setScore(ns);
    setTimeout(() => {
      if (qNum >= TOTAL_Q) finish(ns);
      else { setQNum(n => n + 1); setPicked(null); nextQ(game, lvl, usedRef.current); }
    }, 650);
  };

  const finish = async (finalScore) => {
    setScore(finalScore);
    setView("result");
    const key = game === "math" ? `math${lvl}` : "word";
    const today = new Date().toISOString().slice(0, 10);
    const nb = { ...best };
    if (finalScore > (nb[key] || 0)) nb[key] = finalScore;

    setBest(nb);
    try { await db.s("kidgame_" + user.id, nb); } catch {}
    if (finalScore === TOTAL_Q && addStar) { try { addStar(1, L("O'yinda 10/10 natija!", "10/10 в игре!")); } catch {} }
  };

  const GAMES = [
    { id: "math", t: "Matematik Ninja", d: L("Qo'shish, ayirish, ko'paytirish — tezkor hisob!", "Быстрый счёт!"), e: "🥷", g: "linear-gradient(135deg,#7c3aed,#a855f7)", art: "➕✖️", on: () => setView("math-lvl") },
    { id: "word", t: "So'z Ustasi", d: L("O'zbekcha so'zning inglizcha tarjimasini top", "Найди перевод слова"), e: "🇬🇧", g: "linear-gradient(135deg,#ea580c,#f59e0b)", art: "🔤", on: () => startGame("word") },
    { id: "geo",  t: "Geografiya", d: L("Davlatlar va bayroqlar", "Страны и флаги"), e: "🌍", g: "linear-gradient(135deg,#0e7490,#06b6d4)", art: "🗺️", soon: true },
    { id: "sci",  t: "Tabiat fanlari", d: L("Fizika, kimyo, biologiya savollari", "Наука"), e: "🔬", g: "linear-gradient(135deg,#15803d,#22c55e)", art: "🧪", soon: true },
  ];

  const btn = { border: "none", cursor: "pointer", fontFamily: "inherit" };
  const bestOf = key => best[key] || 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, maxWidth: 480, margin: "0 auto", background: "#0d0d12", overflowY: "auto", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @keyframes kgPop{0%{transform:scale(.92);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes kgShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
      `}</style>

      {/* ── Sarlavha ── */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 16px 8px", position: "sticky", top: 0, background: "#0d0d12ee", backdropFilter: "blur(8px)", zIndex: 5 }}>
        <button onClick={() => view === "hub" ? onClose() : setView("hub")} style={{ ...btn, width: 40, height: 40, borderRadius: 12, background: "#1c1c26", color: "#fff", fontSize: 18 }}>←</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>{L("O'YINLAR", "ИГРЫ")}</div>
        <div style={{ width: 40 }} />
      </div>

      {/* ══ HUB ══ */}
      {view === "hub" && (
        <div style={{ padding: "8px 16px 40px" }}>
          <div style={{ fontSize: 12.5, color: "#8b8b9e", marginBottom: 16, textAlign: "center" }}>
            {L("O'ynab bilim ol! Yaxshi natija liderbordga ball qo'shadi 🏆", "Играй и учись! Очки идут в лидерборд 🏆")}
          </div>
          {GAMES.map(g => (
            <div key={g.id} onClick={() => !g.soon && g.on()} style={{ background: g.g, borderRadius: 22, padding: "18px 18px", marginBottom: 14, cursor: g.soon ? "default" : "pointer", position: "relative", overflow: "hidden", opacity: g.soon ? 0.65 : 1, animation: "kgPop .3s ease" }}>
              <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%) rotate(-8deg)", fontSize: 58, opacity: 0.9 }}>{g.art}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 5 }}>{g.e} {g.t}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.88)", maxWidth: "72%", lineHeight: 1.5 }}>{g.d}</div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                {g.soon
                  ? <span style={{ fontSize: 10.5, fontWeight: 800, background: "rgba(0,0,0,.3)", color: "#fff", borderRadius: 10, padding: "4px 10px" }}>{L("Tez kunda", "Скоро")}</span>
                  : <>
                      <span style={{ fontSize: 11, fontWeight: 800, background: "rgba(255,255,255,.22)", color: "#fff", borderRadius: 10, padding: "4px 12px" }}>▶ {L("O'ynash", "Играть")}</span>
                      {(g.id === "math" ? Math.max(bestOf("math1"), bestOf("math2"), bestOf("math3")) : bestOf("word")) > 0 &&
                        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.85)", fontWeight: 700 }}>🏅 {L("Rekord", "Рекорд")}: {g.id === "math" ? Math.max(bestOf("math1"), bestOf("math2"), bestOf("math3")) : bestOf("word")}/{TOTAL_Q}</span>}
                    </>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ MATEMATIKA: daraja tanlash ══ */}
      {view === "math-lvl" && (
        <div style={{ padding: "20px 16px", animation: "kgPop .25s ease" }}>
          <div style={{ textAlign: "center", fontSize: 44, marginBottom: 8 }}>🥷</div>
          <div style={{ textAlign: "center", fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 18 }}>{L("Darajani tanla", "Выбери уровень")}</div>
          {[
            { l: 1, t: L("Oson", "Легко"), d: "+ − (20 gacha)", c: "#22c55e" },
            { l: 2, t: L("O'rta", "Средне"), d: "+ − × (50 gacha)", c: "#f59e0b" },
            { l: 3, t: L("Qiyin", "Сложно"), d: "+ − × ÷ (100 gacha)", c: "#ef4444" },
          ].map(x => (
            <button key={x.l} onClick={() => startGame("math", x.l)} style={{ ...btn, width: "100%", background: "#1c1c26", border: "1.5px solid " + x.c + "55", borderRadius: 18, padding: "16px", marginBottom: 12, textAlign: "left", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: x.c + "22", color: x.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 800 }}>{x.l}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: "#fff" }}>{x.t}</span>
                <span style={{ display: "block", fontSize: 11.5, color: "#8b8b9e", marginTop: 2 }}>{x.d}</span>
              </span>
              {bestOf("math" + x.l) > 0 && <span style={{ fontSize: 11, color: x.c, fontWeight: 800 }}>🏅 {bestOf("math" + x.l)}/{TOTAL_Q}</span>}
            </button>
          ))}
        </div>
      )}

      {/* ══ O'YIN ══ */}
      {view === "play" && q && (
        <div style={{ padding: "12px 16px 40px" }}>
          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 6, background: "#1c1c26", overflow: "hidden" }}>
              <div style={{ width: `${(qNum / TOTAL_Q) * 100}%`, height: "100%", background: "linear-gradient(90deg,#8b5cf6,#a855f7)", transition: "width .3s" }} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: "#8b8b9e" }}>{qNum}/{TOTAL_Q}</span>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: "#22c55e" }}>✓ {score}</span>
          </div>
          {/* Savol */}
          <div key={qNum} style={{ background: "#1c1c26", borderRadius: 22, padding: "34px 20px", textAlign: "center", marginBottom: 20, animation: "kgPop .25s ease" }}>
            <div style={{ fontSize: 11, color: "#8b8b9e", fontWeight: 700, marginBottom: 10 }}>
              {game === "math" ? L("Hisobla", "Посчитай") : L("Inglizchasi qanday?", "Как по-английски?")}
            </div>
            <div style={{ fontSize: game === "math" ? 32 : 30, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>{q.q}</div>
          </div>
          {/* Variantlar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {q.opts.map((o, i) => {
              const isAns = o === q.ans, isPick = picked === o;
              const bg = picked === null ? "#1c1c26" : isAns ? "#14532d" : isPick ? "#7f1d1d" : "#1c1c26";
              const bd = picked === null ? "#2c2c3a" : isAns ? "#22c55e" : isPick ? "#ef4444" : "#2c2c3a";
              return (
                <button key={i} onClick={() => pick(o)} style={{ ...btn, background: bg, border: "1.5px solid " + bd, borderRadius: 16, padding: "18px 8px", fontSize: 18, fontWeight: 800, color: "#fff", transition: "all .2s", animation: picked !== null && isPick && !isAns ? "kgShake .3s ease" : "none" }}>
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ NATIJA ══ */}
      {view === "result" && (
        <div style={{ padding: "30px 20px", textAlign: "center", animation: "kgPop .3s ease" }}>
          <div style={{ fontSize: 62, marginBottom: 10 }}>{score >= 8 ? "🏆" : score >= 5 ? "👏" : "💪"}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            {score >= 8 ? L("Ajoyib natija!", "Отлично!") : score >= 5 ? L("Yaxshi!", "Хорошо!") : L("Yana urinib ko'r!", "Попробуй ещё!")}
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#8b5cf6", marginBottom: 4 }}>{score}<span style={{ fontSize: 20, color: "#8b8b9e" }}>/{TOTAL_Q}</span></div>
          {score >= 5 && <div style={{ fontSize: 12.5, color: "#22c55e", fontWeight: 700, marginBottom: 4 }}>+{score >= 8 ? 5 : 2} {L("liderbord balli (kuniga 1 marta)", "очков лидерборда")}</div>}
          {score === TOTAL_Q && <div style={{ fontSize: 12.5, color: "#f59e0b", fontWeight: 700 }}>⭐ +1 {L("yulduz — mukammal natija uchun!", "звезда за идеал!")}</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
            <button onClick={() => setView("hub")} style={{ ...btn, flex: 1, background: "#1c1c26", borderRadius: 16, padding: 15, color: "#8b8b9e", fontWeight: 800, fontSize: 14 }}>{L("O'yinlar", "Игры")}</button>
            <button onClick={() => game === "math" ? startGame("math", lvl) : startGame("word")} style={{ ...btn, flex: 1.4, background: "linear-gradient(135deg,#8b5cf6,#6366f1)", borderRadius: 16, padding: 15, color: "#fff", fontWeight: 800, fontSize: 14 }}>🔄 {L("Yana o'ynash", "Ещё раз")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
