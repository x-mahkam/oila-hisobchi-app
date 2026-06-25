import { useState, useEffect, useRef } from "react";
import { db } from "./firebase.js";

// ═══════════════════════════════════════════════════════════
//  BILIM BOZORI — Ingliz tili o'rganish + Bilim Coin tizimi
// ═══════════════════════════════════════════════════════════

// ── So'zlar bazasi (darajalarga bo'lingan) ─────────────────
const WORDS = {
  1: [ // Boshlang'ich — A1
    { en: "apple",   uz: "olma",      ru: "яблоко"   },
    { en: "book",    uz: "kitob",     ru: "книга"     },
    { en: "cat",     uz: "mushuk",    ru: "кошка"     },
    { en: "dog",     uz: "it",        ru: "собака"    },
    { en: "house",   uz: "uy",        ru: "дом"       },
    { en: "water",   uz: "suv",       ru: "вода"      },
    { en: "food",    uz: "ovqat",     ru: "еда"       },
    { en: "sun",     uz: "quyosh",    ru: "солнце"    },
    { en: "moon",    uz: "oy",        ru: "луна"      },
    { en: "star",    uz: "yulduz",    ru: "звезда"    },
    { en: "tree",    uz: "daraxt",    ru: "дерево"    },
    { en: "flower",  uz: "gul",       ru: "цветок"    },
    { en: "mother",  uz: "ona",       ru: "мама"      },
    { en: "father",  uz: "ota",       ru: "папа"      },
    { en: "child",   uz: "bola",      ru: "ребёнок"   },
    { en: "school",  uz: "maktab",    ru: "школа"     },
    { en: "friend",  uz: "do'st",     ru: "друг"      },
    { en: "happy",   uz: "xursand",   ru: "счастливый"},
    { en: "big",     uz: "katta",     ru: "большой"   },
    { en: "small",   uz: "kichik",    ru: "маленький" },
  ],
  2: [ // O'rta — A2
    { en: "money",    uz: "pul",         ru: "деньги"     },
    { en: "family",   uz: "oila",        ru: "семья"      },
    { en: "health",   uz: "salomatlik",  ru: "здоровье"   },
    { en: "work",     uz: "ish",         ru: "работа"     },
    { en: "travel",   uz: "sayohat",     ru: "путешествие"},
    { en: "dream",    uz: "orzu",        ru: "мечта"      },
    { en: "success",  uz: "muvaffaqiyat",ru: "успех"      },
    { en: "future",   uz: "kelajak",     ru: "будущее"    },
    { en: "study",    uz: "o'qish",      ru: "учёба"      },
    { en: "beautiful",uz: "chiroyli",    ru: "красивый"   },
    { en: "important",uz: "muhim",       ru: "важный"     },
    { en: "together", uz: "birga",       ru: "вместе"     },
    { en: "always",   uz: "doim",        ru: "всегда"     },
    { en: "never",    uz: "hech qachon", ru: "никогда"    },
    { en: "morning",  uz: "ertalab",     ru: "утром"      },
    { en: "evening",  uz: "kechqurun",   ru: "вечером"    },
    { en: "market",   uz: "bozor",       ru: "рынок"      },
    { en: "savings",  uz: "jamg'arma",   ru: "сбережения" },
    { en: "budget",   uz: "budjet",      ru: "бюджет"     },
    { en: "goal",     uz: "maqsad",      ru: "цель"       },
  ],
  3: [ // Yuqori — B1
    { en: "achievement", uz: "yutuq",        ru: "достижение"  },
    { en: "responsibility",uz:"mas'uliyat",  ru: "ответственность"},
    { en: "opportunity", uz: "imkoniyat",    ru: "возможность"  },
    { en: "environment", uz: "muhit",        ru: "окружающая среда"},
    { en: "investment",  uz: "investitsiya", ru: "инвестиция"   },
    { en: "management",  uz: "boshqaruv",    ru: "управление"   },
    { en: "education",   uz: "ta'lim",       ru: "образование"  },
    { en: "experience",  uz: "tajriba",      ru: "опыт"         },
    { en: "knowledge",   uz: "bilim",        ru: "знание"       },
    { en: "patience",    uz: "sabr",         ru: "терпение"     },
    { en: "confidence",  uz: "ishonch",      ru: "уверенность"  },
    { en: "discipline",  uz: "intizom",      ru: "дисциплина"   },
    { en: "creativity",  uz: "ijodkorlik",   ru: "творчество"   },
    { en: "prosperity",  uz: "farovonlik",   ru: "процветание"  },
    { en: "gratitude",   uz: "minnatdorlik", ru: "благодарность"},
    { en: "perseverance",uz: "qat'iyat",     ru: "настойчивость"},
    { en: "dedication",  uz: "fidoyilik",    ru: "преданность"  },
    { en: "inspiration", uz: "ilhom",        ru: "вдохновение"  },
    { en: "determination",uz:"qat'iyatlilik",ru: "решимость"    },
    { en: "excellence",  uz: "mukammallik",  ru: "совершенство" },
  ],
};

const LEVELS = [
  { id: 1, name: "Boshlang'ich", nameRu: "Начальный", emoji: "🌱", color: "#22c55e", coinsPerWord: 2,  wordsNeeded: 10 },
  { id: 2, name: "O'rta",       nameRu: "Средний",    emoji: "🌟", color: "#f59e0b", coinsPerWord: 5,  wordsNeeded: 15 },
  { id: 3, name: "Yuqori",      nameRu: "Продвинутый",emoji: "🏆", color: "#8b5cf6", coinsPerWord: 10, wordsNeeded: 20 },
];

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

// ── ASOSIY KOMPONENT ──────────────────────────────────────
export default function BilimBozor({ user, lg = "uz", onBack, dark, oila, azolar }) {
  const isKid  = user?.rol === "kid";
  const isBosh = user?.rol === "bosh";
  const oilaId = user?.oilaId;
  const L = (uz, ru = uz) => lg === "ru" ? ru : uz;

  // ── Tabs: "bozor" | "oyin" | "statistika" ──
  const [tab, setTab] = useState(isKid ? "oyin" : "bozor");

  // ── Bozor (ota-ona) ──
  const [vazifalar, setVazifalar] = useState([]);
  const [showAddV, setShowAddV]   = useState(false);
  const [vCoins, setVCoins]       = useState("");
  const [vPul, setVPul]           = useState("");
  const [vDesc, setVDesc]         = useState("");

  // ── O'yin (bola) ──
  const [level, setLevel]         = useState(1);
  const [bilimCoins, setBilimCoins] = useState(0);
  const [learnedWords, setLearnedWords] = useState([]);
  const [sessionWords, setSessionWords] = useState([]);
  const [curIdx, setCurIdx]       = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [choices, setChoices]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [correct, setCorrect]     = useState(null);
  const [sessionScore, setSessionScore] = useState({ right: 0, wrong: 0 });
  const [showResult, setShowResult] = useState(false);
  const [flyAnim, setFlyAnim]     = useState(false);
  const [streak, setStreak]       = useState(0);

  const msgRef = useRef(null);
  const [msg, setMsg] = useState(null);

  const showMsg = (text, type = "ok") => {
    setMsg({ text, type });
    clearTimeout(msgRef.current);
    msgRef.current = setTimeout(() => setMsg(null), 2500);
  };

  // ── Yuklash ──
  useEffect(() => {
    if (!oilaId) return;
    loadAll();
  }, [oilaId]);

  const loadAll = async () => {
    try {
      const [v, bc, lw, st] = await Promise.all([
        db.g("bilim_vazifa_" + oilaId),
        db.g("bilim_coins_" + (user?.id)),
        db.g("bilim_learned_" + (user?.id)),
        db.g("bilim_streak_" + (user?.id)),
      ]);
      if (v)  setVazifalar(v);
      if (bc != null) setBilimCoins(bc);
      if (lw) setLearnedWords(lw);
      if (st) setStreak(st);
    } catch(e) { console.error("BilimBozor load:", e); }
  };

  // ── O'yin sessiyasini boshlash ──
  const startSession = (lvl) => {
    setLevel(lvl);
    const allWords = WORDS[lvl] || WORDS[1];
    const unlearnedWords = allWords.filter(w => !learnedWords.includes(w.en));
    const pool = unlearnedWords.length >= 5 ? unlearnedWords : allWords;
    const session = shuffle(pool).slice(0, 10);
    setSessionWords(session);
    setCurIdx(0);
    setShowAnswer(false);
    setSelected(null);
    setCorrect(null);
    setSessionScore({ right: 0, wrong: 0 });
    setShowResult(false);
    makeChoices(session, 0, allWords);
  };

  const makeChoices = (session, idx, allWords) => {
    const word = session[idx];
    if (!word) return;
    const wrong = shuffle(allWords.filter(w => w.en !== word.en)).slice(0, 3).map(w => w.uz);
    const all = shuffle([word.uz, ...wrong]);
    setChoices(all);
    setShowAnswer(false);
    setSelected(null);
    setCorrect(null);
  };

  const handleChoice = async (choice) => {
    if (selected !== null) return;
    const word = sessionWords[curIdx];
    const isRight = choice === word.uz;
    setSelected(choice);
    setCorrect(isRight);

    if (isRight) {
      setFlyAnim(true);
      setTimeout(() => setFlyAnim(false), 1000);
      const newScore = { ...sessionScore, right: sessionScore.right + 1 };
      setSessionScore(newScore);

      // So'zni o'rganilgan deb belgilash
      const newLearned = learnedWords.includes(word.en) ? learnedWords : [...learnedWords, word.en];
      setLearnedWords(newLearned);

      // Coin berish
      const coinLevel = LEVELS.find(l => l.id === level);
      const earned = coinLevel?.coinsPerWord || 2;
      const newCoins = bilimCoins + earned;
      setBilimCoins(newCoins);

      // Streak
      const newStreak = streak + 1;
      setStreak(newStreak);

      await Promise.all([
        db.s("bilim_coins_" + user.id, newCoins),
        db.s("bilim_learned_" + user.id, newLearned),
        db.s("bilim_streak_" + user.id, newStreak),
      ]);

      // Vazifalarni tekshirish
      checkVazifalar(newCoins);

    } else {
      setSessionScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setStreak(0);
      await db.s("bilim_streak_" + user.id, 0);
    }

    // Keyingi so'zga o'tish
    setTimeout(() => {
      const nextIdx = curIdx + 1;
      if (nextIdx >= sessionWords.length) {
        setShowResult(true);
      } else {
        setCurIdx(nextIdx);
        makeChoices(sessionWords, nextIdx, WORDS[level] || WORDS[1]);
      }
    }, 1000);
  };

  // ── Vazifalarni avtomatik tekshirish ──
  const checkVazifalar = async (currentCoins) => {
    const active = vazifalar.filter(v => v.uid === user.id && !v.done);
    for (const v of active) {
      if (currentCoins >= v.targetCoins) {
        const upd = vazifalar.map(vz => vz.id === v.id ? { ...vz, done: true, doneSana: new Date().toISOString().slice(0,10) } : vz);
        setVazifalar(upd);
        await db.s("bilim_vazifa_" + oilaId, upd);
        showMsg(L(`🎉 Vazifa bajarildi! Ota-ona tasdiqlaydi.`, `🎉 Задание выполнено! Ожидайте подтверждения.`));
      }
    }
  };

  // ── Vazifa qo'shish (ota-ona) ──
  const addVazifa = async () => {
    if (!vCoins || !vPul || Number(vCoins) <= 0 || Number(vPul) <= 0) {
      showMsg(L("❌ Barcha maydonlarni to'ldiring", "❌ Заполните все поля"), "err");
      return;
    }
    // Ota-ona bolani tanlaydi
    const kids = azolar.filter(a => a.rol === "kid");
    if (kids.length === 0) { showMsg(L("❌ Bola akkaunti yo'q", "❌ Нет аккаунта ребёнка"), "err"); return; }

    const v = {
      id: Date.now(),
      uid: kids[0].id, // birinchi bola (keyinroq tanlov qilish mumkin)
      kidName: kids[0].ism,
      targetCoins: Number(vCoins),
      reward: Number(vPul),
      desc: vDesc || L(`${vCoins} ta Bilim Coin yig'`, `Набери ${vCoins} Bilim Coin`),
      done: false,
      paid: false,
      createdAt: new Date().toISOString().slice(0,10),
    };
    const upd = [v, ...vazifalar];
    setVazifalar(upd);
    await db.s("bilim_vazifa_" + oilaId, upd);
    setShowAddV(false);
    setVCoins(""); setVPul(""); setVDesc("");
    showMsg(L("✅ Vazifa qo'shildi!", "✅ Задание добавлено!"));
  };

  // ── Vazifani tasdiqlash va to'lash (ota-ona) ──
  const payVazifa = async (v) => {
    const upd = vazifalar.map(vz => vz.id === v.id ? { ...vz, paid: true, paidSana: new Date().toISOString().slice(0,10) } : vz);
    setVazifalar(upd);
    await db.s("bilim_vazifa_" + oilaId, upd);
    // Bolaning balansiga pul qo'shish
    try {
      const kidBal = (await db.g("kid_bal_" + v.uid)) || 0;
      await db.s("kid_bal_" + v.uid, kidBal + v.reward);
    } catch(e) {}
    showMsg(L(`💰 ${v.reward.toLocaleString()} so'm to'landi!`, `💰 Выплачено ${v.reward.toLocaleString()} сум!`));
  };

  const curWord = sessionWords[curIdx];
  const curLevel = LEVELS.find(l => l.id === level);
  const myVazifalar = vazifalar.filter(v => v.uid === user?.id);
  const allVazifalar = vazifalar;

  // ── O'RTA QISM — BOLANING COIN PROGRESS ──────────────────
  const myVazifaActive = myVazifalar.find(v => !v.done && !v.paid);

  return (
    <div style={{ minHeight: "100vh", background: dark ? "#0f172a" : "#f0f9ff", display: "flex", flexDirection: "column" }}>

      {/* ── CSS ── */}
      <style>{`
        @keyframes coinPop{0%{transform:scale(0.5) translateY(0);opacity:1}100%{transform:scale(1.5) translateY(-50px);opacity:0}}
        @keyframes slideUp{0%{transform:translateY(20px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes correct{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
        @keyframes msgIn{0%{transform:translateY(-16px);opacity:0}15%,85%{transform:translateY(0);opacity:1}100%{transform:translateY(-16px);opacity:0}}
      `}</style>

      {/* ── Xabar ── */}
      {msg && (
        <div style={{ position: "fixed", top: 64, left: "50%", transform: "translateX(-50%)", background: msg.type === "err" ? "#ef4444" : "#22c55e", color: "#fff", borderRadius: 20, padding: "10px 22px", fontSize: 14, fontWeight: 700, zIndex: 999, whiteSpace: "nowrap", animation: "msgIn 2.5s ease forwards" }}>
          {msg.text}
        </div>
      )}

      {/* ── Coin animatsiya ── */}
      {flyAnim && (
        <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)", fontSize: 24, fontWeight: 900, color: "#f59e0b", zIndex: 998, animation: "coinPop 1s ease forwards", pointerEvents: "none" }}>
          +{curLevel?.coinsPerWord}🪙
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg,#1e40af,#3b82f6)", padding: "14px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></svg>
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>📚 {L("Bilim Bozori", "Рынок знаний")}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
            🪙 {bilimCoins} {L("Bilim Coin", "Монет знаний")}
            {streak > 1 && <span style={{ marginLeft: 8 }}>🔥{streak}</span>}
          </div>
        </div>
        <div style={{ width: 38 }} />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", background: dark ? "#1e293b" : "#fff", borderBottom: `2px solid ${dark?"#334155":"#e2e8f0"}` }}>
        {[
          { id: "oyin",       label: L("🎮 O'yin",    "🎮 Игра"),     show: true },
          { id: "bozor",      label: L("🛒 Bozor",    "🛒 Рынок"),    show: true },
          { id: "statistika", label: L("📊 Natija",   "📊 Итоги"),    show: true },
        ].filter(t => t.show).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "12px 4px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 800 : 500, color: tab === t.id ? "#3b82f6" : dark ? "#94a3b8" : "#64748b", borderBottom: tab === t.id ? "3px solid #3b82f6" : "3px solid transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ O'YIN QISMI ════════════════════════════════ */}
      {tab === "oyin" && (
        <div style={{ flex: 1, padding: "16px", overflow: "auto" }}>

          {/* Aktiv vazifa banner */}
          {myVazifaActive && (
            <div style={{ background: "linear-gradient(135deg,#f59e0b22,#f59e0b11)", border: "2px solid #f59e0b", borderRadius: 16, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>🎯</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: dark ? "#fbbf24" : "#92400e" }}>{myVazifaActive.desc}</div>
                <div style={{ fontSize: 12, color: dark ? "#94a3b8" : "#666", marginTop: 2 }}>
                  {bilimCoins}/{myVazifaActive.targetCoins} 🪙 → 💰 {myVazifaActive.reward.toLocaleString()} so'm
                </div>
                <div style={{ background: dark?"#1e293b":"#fff", borderRadius: 20, height: 6, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (bilimCoins/myVazifaActive.targetCoins)*100)}%`, height: "100%", background: "#f59e0b", borderRadius: 20, transition: "width .4s" }} />
                </div>
              </div>
            </div>
          )}

          {/* Level tanlash */}
          {sessionWords.length === 0 && !showResult && (
            <div style={{ animation: "slideUp .4s ease" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: dark?"#f1f5f9":"#1e293b", marginBottom: 12, textAlign: "center" }}>
                {L("Daraja tanlang:", "Выберите уровень:")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {LEVELS.map(lvl => {
                  const learned = learnedWords.filter(w => (WORDS[lvl.id]||[]).some(wd => wd.en === w)).length;
                  const total = (WORDS[lvl.id]||[]).length;
                  return (
                    <button key={lvl.id} onClick={() => startSession(lvl.id)}
                      style={{ background: dark ? "#1e293b" : "#fff", border: `2px solid ${lvl.color}`, borderRadius: 18, padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "transform .15s", textAlign: "left" }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: lvl.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                        {lvl.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: dark ? "#f1f5f9" : "#1e293b" }}>{L(lvl.name, lvl.nameRu)}</div>
                        <div style={{ fontSize: 12, color: dark ? "#94a3b8" : "#64748b", marginTop: 2 }}>
                          {L(`Har so'z uchun +${lvl.coinsPerWord}🪙`, `За слово +${lvl.coinsPerWord}🪙`)}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                          <div style={{ flex: 1, height: 5, background: dark?"#334155":"#e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                            <div style={{ width: `${(learned/total)*100}%`, height: "100%", background: lvl.color, borderRadius: 10 }} />
                          </div>
                          <span style={{ fontSize: 11, color: dark?"#64748b":"#94a3b8" }}>{learned}/{total}</span>
                        </div>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={lvl.color} strokeWidth="2.5" strokeLinecap="round"/></svg>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* O'yin jarayoni */}
          {sessionWords.length > 0 && !showResult && curWord && (
            <div style={{ animation: "slideUp .3s ease" }}>
              {/* Progress */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 8, background: dark?"#334155":"#e2e8f0", borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ width: `${((curIdx)/sessionWords.length)*100}%`, height: "100%", background: curLevel?.color || "#3b82f6", borderRadius: 20, transition: "width .4s" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: dark?"#94a3b8":"#64748b" }}>{curIdx+1}/{sessionWords.length}</span>
              </div>

              {/* So'z kartasi */}
              <div style={{ background: `linear-gradient(135deg,${curLevel?.color}22,${curLevel?.color}11)`, border: `2px solid ${curLevel?.color}44`, borderRadius: 24, padding: "32px 20px", textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: dark?"#94a3b8":"#64748b", letterSpacing: 2, marginBottom: 8 }}>ENGLISH</div>
                <div style={{ fontSize: 40, fontWeight: 900, color: dark?"#f1f5f9":"#1e293b", letterSpacing: 1 }}>{curWord.en}</div>
                {streak > 2 && (
                  <div style={{ marginTop: 8, fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>🔥 {streak} ketma-ket!</div>
                )}
              </div>

              {/* Javob variantlari */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {choices.map((ch, i) => {
                  const isSelected = selected === ch;
                  const isRight = ch === curWord.uz;
                  let bg = dark ? "#1e293b" : "#fff";
                  let border = dark ? "#334155" : "#e2e8f0";
                  let anim = "";
                  if (isSelected && correct === true)  { bg = "#dcfce7"; border = "#22c55e"; anim = "correct .4s ease"; }
                  if (isSelected && correct === false) { bg = "#fee2e2"; border = "#ef4444"; anim = "shake .4s ease"; }
                  if (!isSelected && selected !== null && isRight) { bg = "#dcfce7"; border = "#22c55e"; }

                  return (
                    <button key={i} onClick={() => handleChoice(ch)}
                      style={{ background: bg, border: `2px solid ${border}`, borderRadius: 16, padding: "16px 20px", cursor: selected === null ? "pointer" : "default", fontSize: 16, fontWeight: 700, color: dark?"#f1f5f9":"#1e293b", textAlign: "left", transition: "all .2s", animation: anim, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 28, height: 28, borderRadius: "50%", background: dark?"#334155":"#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                        {["A","B","C","D"][i]}
                      </span>
                      {ch}
                      {isSelected && correct === true && <span style={{ marginLeft: "auto" }}>✅</span>}
                      {isSelected && correct === false && <span style={{ marginLeft: "auto" }}>❌</span>}
                      {!isSelected && selected !== null && isRight && <span style={{ marginLeft: "auto" }}>✅</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Natija ekrani */}
          {showResult && (
            <div style={{ textAlign: "center", animation: "slideUp .4s ease" }}>
              <div style={{ fontSize: 64, marginBottom: 8 }}>
                {sessionScore.right >= 8 ? "🏆" : sessionScore.right >= 5 ? "⭐" : "💪"}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: dark?"#f1f5f9":"#1e293b", marginBottom: 6 }}>
                {L("Sessiya tugadi!", "Сессия завершена!")}
              </div>
              <div style={{ fontSize: 15, color: dark?"#94a3b8":"#64748b", marginBottom: 20 }}>
                ✅ {sessionScore.right} / ❌ {sessionScore.wrong}
              </div>
              <div style={{ background: `linear-gradient(135deg,${curLevel?.color}22,${curLevel?.color}11)`, border: `2px solid ${curLevel?.color}44`, borderRadius: 20, padding: "16px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: dark?"#94a3b8":"#64748b" }}>{L("Bu sessiyada odingiz:", "Заработано:")}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#f59e0b", margin: "4px 0" }}>
                  +{sessionScore.right * (curLevel?.coinsPerWord || 2)} 🪙
                </div>
                <div style={{ fontSize: 13, color: dark?"#64748b":"#94a3b8" }}>
                  {L("Jami:", "Всего:")} {bilimCoins} {L("Bilim Coin", "монет")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setSessionWords([])} style={{ flex: 1, padding: "14px", borderRadius: 16, border: "none", background: dark?"#334155":"#f1f5f9", color: dark?"#94a3b8":"#64748b", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  {L("Bosh sahifa", "Главная")}
                </button>
                <button onClick={() => startSession(level)} style={{ flex: 1, padding: "14px", borderRadius: 16, border: "none", background: `linear-gradient(135deg,${curLevel?.color},${curLevel?.color}cc)`, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                  🔄 {L("Yana o'ynash", "Играть снова")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════ BOZOR QISMI ════════════════════════════════ */}
      {tab === "bozor" && (
        <div style={{ flex: 1, padding: "16px", overflow: "auto" }}>

          {/* Tushuntirish */}
          <div style={{ background: "linear-gradient(135deg,#1e40af22,#3b82f611)", border: "2px solid #3b82f644", borderRadius: 16, padding: "14px 16px", marginBottom: 16, fontSize: 13, color: dark?"#93c5fd":"#1e40af", lineHeight: 1.7 }}>
            💡 {L(
              "Ota-ona 'Bilim Vazifasi' qo'shadi — masalan '200 Bilim Coin = 50,000 so'm'. Bola o'yin o'ynab coin yig'sa, pul avtomatik hisobga tushadi!",
              "Родитель добавляет задание — например '200 монет = 50 000 сум'. Ребёнок играет, копит монеты и получает деньги!"
            )}
          </div>

          {/* Ota-ona: vazifa qo'shish */}
          {isBosh && (
            <button onClick={() => setShowAddV(true)}
              style={{ width: "100%", padding: "15px", borderRadius: 16, border: "2px dashed #3b82f6", background: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#3b82f6", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              ➕ {L("Yangi bilim vazifasi", "Новое задание")}
            </button>
          )}

          {/* Vazifalar ro'yxati */}
          {(isBosh ? allVazifalar : myVazifalar).length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: dark?"#64748b":"#94a3b8" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
              <div style={{ fontSize: 14 }}>{L("Hozircha vazifa yo'q", "Заданий пока нет")}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(isBosh ? allVazifalar : myVazifalar).map(v => {
                const isDone = v.done;
                const isPaid = v.paid;
                const progress = Math.min(100, (bilimCoins / v.targetCoins) * 100);
                return (
                  <div key={v.id} style={{ background: dark?"#1e293b":"#fff", border: `2px solid ${isPaid?"#22c55e":isDone?"#f59e0b":dark?"#334155":"#e2e8f0"}`, borderRadius: 18, padding: "16px", position: "relative", overflow: "hidden" }}>
                    {isPaid && <div style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>✅ To'landi</div>}
                    {isDone && !isPaid && <div style={{ position: "absolute", top: 8, right: 8, background: "#f59e0b", color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>⏳ Tasdiqlash</div>}

                    <div style={{ fontSize: 14, fontWeight: 700, color: dark?"#f1f5f9":"#1e293b", marginBottom: 6, paddingRight: 80 }}>
                      📚 {v.desc}
                    </div>
                    {isBosh && <div style={{ fontSize: 12, color: dark?"#94a3b8":"#64748b", marginBottom: 6 }}>👤 {v.kidName}</div>}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>🪙 {v.targetCoins} Coin</span>
                      <span style={{ fontSize: 13, color: dark?"#64748b":"#94a3b8" }}>→</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>💰 {v.reward.toLocaleString()} so'm</span>
                    </div>

                    {!isKid && !isDone && (
                      <div>
                        <div style={{ background: dark?"#0f172a":"#f1f5f9", borderRadius: 20, height: 6, overflow: "hidden" }}>
                          <div style={{ width: `${progress}%`, height: "100%", background: "#3b82f6", borderRadius: 20, transition: "width .4s" }} />
                        </div>
                        <div style={{ fontSize: 11, color: dark?"#64748b":"#94a3b8", marginTop: 4 }}>
                          {bilimCoins}/{v.targetCoins} 🪙
                        </div>
                      </div>
                    )}

                    {isBosh && isDone && !isPaid && (
                      <button onClick={() => payVazifa(v)}
                        style={{ marginTop: 10, width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22c55e,#15803d)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                        💰 {L(`${v.reward.toLocaleString()} so'm to'lash`, `Выплатить ${v.reward.toLocaleString()} сум`)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════ STATISTIKA ══════════════════════════════════ */}
      {tab === "statistika" && (
        <div style={{ flex: 1, padding: "16px", overflow: "auto" }}>
          {/* Umumiy */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: L("Bilim Coin","Монет"),       val: bilimCoins,           ico: "🪙", color: "#f59e0b" },
              { label: L("O'rganilgan","Изучено"),    val: learnedWords.length,  ico: "📚", color: "#3b82f6" },
              { label: L("Ketma-ket","Серия"),        val: streak,               ico: "🔥", color: "#ef4444" },
              { label: L("Bajarilgan","Выполнено"),   val: vazifalar.filter(v=>v.uid===user?.id&&v.paid).length, ico: "✅", color: "#22c55e" },
            ].map((s,i) => (
              <div key={i} style={{ background: dark?"#1e293b":"#fff", border: `1px solid ${dark?"#334155":"#e2e8f0"}`, borderRadius: 16, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 28 }}>{s.ico}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, margin: "4px 0" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: dark?"#64748b":"#94a3b8" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Daraja progressi */}
          <div style={{ background: dark?"#1e293b":"#fff", border: `1px solid ${dark?"#334155":"#e2e8f0"}`, borderRadius: 18, padding: "16px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: dark?"#f1f5f9":"#1e293b", marginBottom: 14 }}>
              📊 {L("Daraja progressi", "Прогресс по уровням")}
            </div>
            {LEVELS.map(lvl => {
              const learned = learnedWords.filter(w => (WORDS[lvl.id]||[]).some(wd => wd.en === w)).length;
              const total = (WORDS[lvl.id]||[]).length;
              return (
                <div key={lvl.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: dark?"#f1f5f9":"#1e293b" }}>{lvl.emoji} {L(lvl.name, lvl.nameRu)}</span>
                    <span style={{ fontSize: 12, color: dark?"#64748b":"#94a3b8" }}>{learned}/{total}</span>
                  </div>
                  <div style={{ background: dark?"#0f172a":"#f1f5f9", borderRadius: 20, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${(learned/total)*100}%`, height: "100%", background: lvl.color, borderRadius: 20, transition: "width .5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════ VAZIFA QO'SHISH MODAL ═══════════════════════ */}
      {showAddV && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowAddV(false)}>
          <div style={{ background: dark?"#1e293b":"#fff", borderRadius: "28px 28px 0 0", padding: "24px 22px 40px", width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: dark?"#f1f5f9":"#111", marginBottom: 18, textAlign: "center" }}>
              ➕ {L("Bilim Vazifasi qo'shish", "Добавить задание")}
            </div>
            {[
              { label: L("Necha Bilim Coin yig'sin?","Сколько монет набрать?"), val: vCoins, set: setVCoins, type: "number", placeholder: "200" },
              { label: L("Mukofot miqdori (so'm)","Вознаграждение (сум)"),     val: vPul,   set: setVPul,   type: "number", placeholder: "50000" },
              { label: L("Izoh (ixtiyoriy)","Описание (необязательно)"),        val: vDesc,  set: setVDesc,  type: "text",   placeholder: L("Masalan: 200 coin yig'","Например: набери 200 монет") },
            ].map((f,i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: dark?"#94a3b8":"#64748b", marginBottom: 4 }}>{f.label}</div>
                <input value={f.val} onChange={e => f.set(e.target.value)} type={f.type} placeholder={f.placeholder}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${dark?"#334155":"#e2e8f0"}`, background: dark?"#0f172a":"#f8fafc", color: dark?"#f1f5f9":"#1e293b", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            {vCoins && vPul && (
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#15803d", fontWeight: 600 }}>
                🎯 Bola {vCoins} Bilim Coin yig'sa → 💰 {Number(vPul).toLocaleString()} so'm oladi
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAddV(false)} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: dark?"#334155":"#f1f5f9", color: dark?"#94a3b8":"#666", fontWeight: 700, cursor: "pointer" }}>
                {L("Bekor", "Отмена")}
              </button>
              <button onClick={addVazifa} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#1e40af,#3b82f6)", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                ✅ {L("Qo'shish", "Добавить")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
