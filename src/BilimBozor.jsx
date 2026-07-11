import { useState, useEffect, useRef } from "react";
import { db } from "./firebase.js";
import { td, nt, f } from "./utils/formatters.js";
import { PALETTE } from "./utils/tokens.js";
import { PageHeader } from "./components/ui/index.js";
import { notifyFamily } from "./utils/notify.jsx";
import { CATEGORIES, gameById } from "./bilim/registry.jsx";
import { analyzeLearning, weeklyReport } from "./bilim/engine/analytics.js";
import { useApp } from "./context/AppContext.jsx";

// ── Outline SVG ikonkalar (emoji o'rniga) ──
const BIco = {
  coin: (c, s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" style={{display:"inline-block",verticalAlign:"middle"}}><circle cx="8" cy="8" r="6.2" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><circle cx="8" cy="8" r="3.2" stroke={c} strokeWidth="1.1"/><path d="M8 3v10M6 4.5h4" stroke={c} strokeWidth="1" strokeLinecap="round"/></svg>,
  book: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  fire: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  check: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><polyline points="20 6 9 17 4 12"/></svg>,
  cross: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  game: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/></svg>,
  store: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  chart: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  trophy: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a6 6 0 0 1 6 6v3.5c0 1.66-1.34 3-3 3H9a3 3 0 0 1-3-3V8a6 6 0 0 1 6-6z"/></svg>,
  star: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  target: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  leaf: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58-1 8-1.7 2.5-4.5 4.7-7 10z"/><path d="M9 22v-4"/></svg>,
  plus: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  info: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  user: (c, s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  empty: (c, s=48) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
};

// ═══════════════════════════════════════════════════════════
//  BILIM BOZORI v2 — So'z o'rganish + Eskirish tizimi
// ═══════════════════════════════════════════════════════════

// ── SO'ZLAR BAZASI (har darajada 50 ta) ────────────────────
const WORDS = {
  1: [
    {en:"apple",uz:"olma"},{en:"book",uz:"kitob"},{en:"cat",uz:"mushuk"},
    {en:"dog",uz:"it"},{en:"house",uz:"uy"},{en:"water",uz:"suv"},
    {en:"food",uz:"ovqat"},{en:"sun",uz:"quyosh"},{en:"moon",uz:"oy"},
    {en:"star",uz:"yulduz"},{en:"tree",uz:"daraxt"},{en:"flower",uz:"gul"},
    {en:"mother",uz:"ona"},{en:"father",uz:"ota"},{en:"child",uz:"bola"},
    {en:"school",uz:"maktab"},{en:"friend",uz:"do'st"},{en:"happy",uz:"xursand"},
    {en:"big",uz:"katta"},{en:"small",uz:"kichik"},{en:"red",uz:"qizil"},
    {en:"blue",uz:"ko'k"},{en:"green",uz:"yashil"},{en:"white",uz:"oq"},
    {en:"black",uz:"qora"},{en:"one",uz:"bir"},{en:"two",uz:"ikki"},
    {en:"three",uz:"uch"},{en:"four",uz:"to'rt"},{en:"five",uz:"besh"},
    {en:"eat",uz:"yemoq"},{en:"drink",uz:"ichmoq"},{en:"sleep",uz:"uxlamoq"},
    {en:"run",uz:"yugurmoq"},{en:"walk",uz:"yurmoq"},{en:"read",uz:"o'qimoq"},
    {en:"write",uz:"yozmoq"},{en:"play",uz:"o'ynamoq"},{en:"love",uz:"sevmoq"},
    {en:"good",uz:"yaxshi"},{en:"bad",uz:"yomon"},{en:"hot",uz:"issiq"},
    {en:"cold",uz:"sovuq"},{en:"day",uz:"kun"},{en:"night",uz:"tun"},
    {en:"hand",uz:"qo'l"},{en:"eye",uz:"ko'z"},{en:"ear",uz:"quloq"},
    {en:"nose",uz:"burun"},{en:"mouth",uz:"og'iz"},
  ],
  2: [
    {en:"money",uz:"pul"},{en:"family",uz:"oila"},{en:"health",uz:"salomatlik"},
    {en:"work",uz:"ish"},{en:"travel",uz:"sayohat"},{en:"dream",uz:"orzu"},
    {en:"success",uz:"muvaffaqiyat"},{en:"future",uz:"kelajak"},{en:"study",uz:"o'qish"},
    {en:"beautiful",uz:"chiroyli"},{en:"important",uz:"muhim"},{en:"together",uz:"birga"},
    {en:"always",uz:"doim"},{en:"never",uz:"hech qachon"},{en:"morning",uz:"ertalab"},
    {en:"evening",uz:"kechqurun"},{en:"market",uz:"bozor"},{en:"savings",uz:"jamg'arma"},
    {en:"budget",uz:"budjet"},{en:"goal",uz:"maqsad"},{en:"teacher",uz:"o'qituvchi"},
    {en:"student",uz:"o'quvchi"},{en:"hospital",uz:"kasalxona"},{en:"doctor",uz:"shifokor"},
    {en:"street",uz:"ko'cha"},{en:"city",uz:"shahar"},{en:"village",uz:"qishloq"},
    {en:"mountain",uz:"tog'"},{en:"river",uz:"daryo"},{en:"sky",uz:"osmon"},
    {en:"rain",uz:"yomg'ir"},{en:"snow",uz:"qor"},{en:"wind",uz:"shamol"},
    {en:"summer",uz:"yoz"},{en:"winter",uz:"qish"},{en:"spring",uz:"bahor"},
    {en:"autumn",uz:"kuz"},{en:"bread",uz:"non"},{en:"milk",uz:"sut"},
    {en:"egg",uz:"tuxum"},{en:"meat",uz:"go'sht"},{en:"vegetable",uz:"sabzavot"},
    {en:"fruit",uz:"meva"},{en:"chair",uz:"stul"},{en:"table",uz:"stol"},
    {en:"window",uz:"deraza"},{en:"door",uz:"eshik"},{en:"floor",uz:"pol"},
    {en:"wall",uz:"devor"},{en:"roof",uz:"tom"},
  ],
  3: [
    {en:"achievement",uz:"yutuq"},{en:"responsibility",uz:"mas'uliyat"},
    {en:"opportunity",uz:"imkoniyat"},{en:"environment",uz:"muhit"},
    {en:"investment",uz:"investitsiya"},{en:"management",uz:"boshqaruv"},
    {en:"education",uz:"ta'lim"},{en:"experience",uz:"tajriba"},
    {en:"knowledge",uz:"bilim"},{en:"patience",uz:"sabr"},
    {en:"confidence",uz:"ishonch"},{en:"discipline",uz:"intizom"},
    {en:"creativity",uz:"ijodkorlik"},{en:"prosperity",uz:"farovonlik"},
    {en:"gratitude",uz:"minnatdorlik"},{en:"perseverance",uz:"qat'iyat"},
    {en:"dedication",uz:"fidoyilik"},{en:"inspiration",uz:"ilhom"},
    {en:"determination",uz:"qat'iyatlilik"},{en:"excellence",uz:"mukammallik"},
    {en:"entrepreneur",uz:"tadbirkor"},{en:"innovation",uz:"innovatsiya"},
    {en:"collaboration",uz:"hamkorlik"},{en:"communication",uz:"muloqot"},
    {en:"leadership",uz:"yetakchilik"},{en:"strategy",uz:"strategiya"},
    {en:"motivation",uz:"motivatsiya"},{en:"productivity",uz:"samaradorlik"},
    {en:"responsibility",uz:"javobgarlik"},{en:"sustainability",uz:"barqarorlik"},
    {en:"transparency",uz:"shaffoflik"},{en:"integrity",uz:"halollik"},
    {en:"resilience",uz:"chidamlilik"},{en:"empathy",uz:"hamdardlik"},
    {en:"curiosity",uz:"qiziquvchanlik"},{en:"flexibility",uz:"moslashuvchanlik"},
    {en:"accountability",uz:"hisobdorlik"},{en:"mindfulness",uz:"hushyorlik"},
    {en:"ambition",uz:"ambitsiya"},{en:"courage",uz:"jasorat"},
    {en:"wisdom",uz:"donolik"},{en:"generosity",uz:"saxiylik"},
    {en:"humility",uz:"kamtarlik"},{en:"loyalty",uz:"sadoqat"},
    {en:"sincerity",uz:"samimiylik"},{en:"compassion",uz:"rahmdillik"},
    {en:"diligence",uz:"mehnatsevarlik"},{en:"punctuality",uz:"o'z vaqtilik"},
    {en:"adaptability",uz:"moslashuvchanlik"},{en:"professionalism",uz:"professionallik"},
  ],
};

const LEVELS = [
  { id:1, name:"Boshlang'ich", color:"#22c55e", baseCoins:5,  wordsPerSession:10 },
  { id:2, name:"O'rta",        color:"#f59e0b", baseCoins:10, wordsPerSession:10 },
  { id:3, name:"Yuqori",       color:"#8b5cf6", baseCoins:15, wordsPerSession:10 },
];

// Eskirish koeffitsienti: necha marta ko'rilgan → coin multiplier
const getMultiplier = (seenCount) => {
  if (seenCount === 0) return 1.0;   // yangi so'z — to'liq
  if (seenCount === 1) return 0.6;   // 1 marta ko'rilgan — 60%
  if (seenCount === 2) return 0.3;   // 2 marta — 30%
  return 0.1;                         // 3+ marta — 10% (minimum)
};

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const formatInputSum = (val) => {
  if (val === null || val === undefined) return "";
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const getAutoDesc = (coins, pul, isKidRole, lang) => {
  if (!coins || !pul) return "";
  const cleanPul = Number(String(pul).replace(/\D/g, ""));
  const formattedPul = formatInputSum(cleanPul);
  if (lang === "ru") {
    if (isKidRole) {
      return `Выдадите мне ${formattedPul} сум в качестве вознаграждения за ${coins} Bilim Coin?`;
    } else {
      return `Собери ${coins} Bilim Coin и получи вознаграждение в размере ${formattedPul} сум`;
    }
  } else {
    if (isKidRole) {
      return `Shu ${coins} Bilim Coin uchun menga ${formattedPul} so'm mukofot puli berasizmi?`;
    } else {
      return `${coins} Bilim Coin yig' va ${formattedPul} so'm mukofot ol`;
    }
  }
};

export default function BilimBozor({ user, lg="uz", onBack, dark, oila, azolar, embedded=false, gameTitle }) {
  const { xar, setXar, dar, setDar, setKidBalances } = useApp();
  const lastAutoDescRef = useRef("");
  const isKid  = user?.rol === "kid";
  const isBosh = user?.rol === "bosh" || user?.rol === "azo";
  const oilaId = user?.oilaId;
  const L = (uz, ru=uz) => lg==="ru" ? ru : uz;
  const th = dark ? PALETTE.dark : PALETTE.light;

  const [tab, setTab]               = useState(embedded ? "oyin" : "bozor");
  const [vazifalar, setVazifalar]   = useState([]);
  const [showAddV, setShowAddV]     = useState(false);
  const [vCoins, setVCoins]         = useState("");
  const [vPul, setVPul]             = useState("");
  const [vDesc, setVDesc]           = useState("");
  const [vKidId, setVKidId]         = useState("");
  const [vParentId, setVParentId]   = useState("all");

  // O'yin
  const [level, setLevel]           = useState(1);
  const [bilimCoins, setBilimCoins] = useState(0);
  // wordStats: { [word_en]: seenCount }
  const [wordStats, setWordStats]   = useState({});
  const [sessionWords, setSessionWords] = useState([]);
  const [curIdx, setCurIdx]         = useState(0);
  const [choices, setChoices]       = useState([]);
  const [selected, setSelected]     = useState(null);
  const [isCorrect, setIsCorrect]   = useState(null);
  const [sessionScore, setSessionScore] = useState({ right:0, wrong:0, earned:0 });
  const [showResult, setShowResult] = useState(false);
  const [flyCoins, setFlyCoins]     = useState([]);
  const [streak, setStreak]         = useState(0);
  const [loading, setLoading]       = useState(false);
  const [editingRewardVId, setEditingRewardVId] = useState(null);
  const [editRewardValue, setEditRewardValue]   = useState("");
  const [sessions, setSessions]     = useState([]);
  const [kidsCoins, setKidsCoins]   = useState({});

  const msgRef = useRef(null);
  const [msg, setMsg] = useState(null);

  const showMsg = (text, type="ok") => {
    setMsg({text, type});
    clearTimeout(msgRef.current);
    msgRef.current = setTimeout(() => setMsg(null), 2800);
  };

  const spawnCoin = (amount) => {
    const id = Date.now() + Math.random();
    setFlyCoins(p => [...p, {id, amount}]);
    setTimeout(() => setFlyCoins(p => p.filter(c => c.id !== id)), 1200);
  };

  // ── Yuklash ──
  useEffect(() => {
    if (!oilaId) return;

    // --- INSTANT CACHE LOADING ---
    const vC = db.gCache("bilim_vazifa_" + oilaId);
    const bcC = db.gCache("bilim_coins_" + user?.id);
    const wsC = db.gCache("bilim_stats_" + user?.id);
    const stC = db.gCache("bilim_streak_" + user?.id);
    const sessC = db.gCache("bilim_games_" + user?.id);

    if (vC) setVazifalar(vC);
    if (bcC != null) setBilimCoins(bcC);
    if (wsC) setWordStats(wsC);
    if (stC != null) setStreak(stC);
    if (sessC) setSessions(sessC);

    const kids = (azolar || []).filter(a => a.rol === "kid");
    if (kids.length > 0) setVKidId(kids[0].id);

    loadAll();
  }, [oilaId, user?.id]);

  const loadAll = async () => {
    try {
      const [v, bc, ws, st, sess] = await Promise.all([
        db.g("bilim_vazifa_" + oilaId),
        db.g("bilim_coins_" + user?.id),
        db.g("bilim_stats_" + user?.id),
        db.g("bilim_streak_" + user?.id),
        db.g("bilim_games_" + user?.id),
      ]);
      if (v)        setVazifalar(v);
      if (bc!=null) setBilimCoins(bc);
      if (ws)       setWordStats(ws);
      if (st!=null) setStreak(st);
      if (sess)     setSessions(Array.isArray(sess) ? sess : []);
      const kids = (azolar||[]).filter(a => a.rol==="kid");
      if (kids.length > 0) {
        setVKidId(kids[0].id);
        const coinsPromises = kids.map(async (k) => {
          const c = await db.g("bilim_coins_" + k.id);
          return { id: k.id, coins: c || 0 };
        });
        const coinsResults = await Promise.all(coinsPromises);
        const coinsMap = {};
        coinsResults.forEach(r => {
          coinsMap[r.id] = r.coins;
        });
        setKidsCoins(coinsMap);
      }
    } catch(e) { console.error(e); }
  };

  // Auto-generate description (izoh)
  useEffect(() => {
    const currentAuto = getAutoDesc(vCoins, vPul, isKid, lg);
    const isCurrentlyEmptyOrAuto = !vDesc || 
      vDesc === lastAutoDescRef.current ||
      vDesc === "200 coin yig'ish" ||
      vDesc === "Набрать 200 монет";

    if (isCurrentlyEmptyOrAuto) {
      setVDesc(currentAuto);
      lastAutoDescRef.current = currentAuto;
    }
  }, [vCoins, vPul, lg, isKid]);

  // ── Sessiya boshlash ──
  const startSession = (lvl) => {
    const allWords = WORDS[lvl] || WORDS[1];
    // Yangi so'zlarni birinchi, ko'rilganlarni keyin tartiblash
    const sorted = [...allWords].sort((a,b) => {
      const sa = wordStats[a.en] || 0;
      const sb = wordStats[b.en] || 0;
      return sa - sb; // kam ko'rilgan birinchi
    });
    const session = sorted.slice(0, 10); // eng kam ko'rilgan 10 ta
    setLevel(lvl);
    setSessionWords(session);
    setCurIdx(0);
    setSelected(null);
    setIsCorrect(null);
    setSessionScore({right:0, wrong:0, earned:0});
    setShowResult(false);
    buildChoices(session, 0, allWords);
  };

  const buildChoices = (session, idx, allWords) => {
    const word = session[idx];
    if (!word) return;
    const wrong = shuffle(allWords.filter(w => w.en !== word.en)).slice(0,3).map(w => w.uz);
    setChoices(shuffle([word.uz, ...wrong]));
    setSelected(null);
    setIsCorrect(null);
  };

  const handleChoice = async (choice) => {
    if (selected !== null) return;
    const word = sessionWords[curIdx];
    const right = choice === word.uz;
    setSelected(choice);
    setIsCorrect(right);

    // Coin hisoblash (eskirish tizimi)
    const lvl = LEVELS.find(l => l.id === level);
    const seen = wordStats[word.en] || 0;
    const mult = getMultiplier(seen);
    const earned = right ? Math.max(1, Math.round((lvl?.baseCoins||5) * mult)) : 0;

    if (right) {
      // wordStats yangilash
      const newStats = {...wordStats, [word.en]: seen + 1};
      setWordStats(newStats);
      const newCoins = bilimCoins + earned;
      setBilimCoins(newCoins);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setSessionScore(prev => ({
        right: prev.right+1,
        wrong: prev.wrong,
        earned: prev.earned + earned
      }));
      spawnCoin(earned);

      await Promise.all([
        db.s("bilim_stats_" + user.id, newStats),
        db.s("bilim_coins_" + user.id, newCoins),
        db.s("bilim_streak_" + user.id, newStreak),
      ]);
      checkVazifalar(newCoins);
    } else {
      setStreak(0);
      setSessionScore(prev => ({...prev, wrong: prev.wrong+1}));
      await db.s("bilim_streak_" + user.id, 0);
    }

    setTimeout(() => {
      const next = curIdx + 1;
      if (next >= sessionWords.length) {
        setShowResult(true);
      } else {
        setCurIdx(next);
        buildChoices(sessionWords, next, WORDS[level]||WORDS[1]);
      }
    }, 900);
  };

  const checkVazifalar = async (currentCoins) => {
    // Child manually confirms task completion when coins target is reached via the "Topshirish" button.
  };

  const confirmCollected = async (v) => {
    try {
      const upd = vazifalar.map(vz =>
        vz.id === v.id ? { ...vz, done: true, doneSana: new Date().toISOString().slice(0, 10) } : vz
      );
      setVazifalar(upd);
      await db.s("bilim_vazifa_" + oilaId, upd);
      showMsg(L("🎉 Vazifa bajarildi deb belgilandi! Ota-ona tasdiqlaydi va to'laydi.", "🎉 Задание выполнено! Ожидает выплаты родителя."));

      // Notify parents
      try {
        const adults = (azolar || []).filter(a => a.rol === "bosh" || a.rol === "azo");
        for (const p of adults) {
          await notifyFamily(
            p.id,
            "bilim_done",
            L("Bilim coinlari yig'ildi!", "Монеты знаний собраны!"),
            L(
              `${v.kidName} bilim vazifasi coinlarini yig'di: "${v.desc}". To'lovni tasdiqlang!`,
              `${v.kidName} собрал монеты задания: "${v.desc}". Подтвердите выплату!`
            )
          );
        }
      } catch (e2) {
        console.error("Failed to notify parent about task done:", e2);
      }
    } catch (e) {
      showMsg(L("❌ Xato yuz berdi", "❌ Ошибка"), "err");
    }
  };

  // ── Vazifa qo'shish ──
  const addVazifa = async () => {
    const cleanPulStr = String(vPul).replace(/\D/g, "");
    if (!vCoins || !vPul || Number(vCoins) <= 0 || Number(cleanPulStr) <= 0)
      return showMsg(L("❌ Maydonlarni to'ldiring","❌ Заполните поля"), "err");
    if (!vKidId)
      return showMsg(L("❌ Bola tanlang","❌ Выберите ребёнка"), "err");

    const reward = Number(cleanPulStr);

    const kid = (azolar||[]).find(a => a.id===vKidId);
    const v = {
      id: Date.now(),
      uid: vKidId,
      kidName: kid?.ism || "Bola",
      targetCoins: Number(vCoins),
      reward,
      desc: vDesc || L(`${vCoins} ta Bilim Coin yig'`, `Набери ${vCoins} монет`),
      done: false,
      paid: false,
      createdBy: user.id,
      createdAt: new Date().toISOString().slice(0,10),
    };
    const upd = [v, ...vazifalar];
    setVazifalar(upd);
    await db.s("bilim_vazifa_" + oilaId, upd);
    setShowAddV(false);
    setVCoins(""); setVPul(""); setVDesc("");
    showMsg(L("✅ Vazifa qo'shildi!", "✅ Задание добавлено!"));
  };

  // ── Bola taklif yuborishi ──
  const addProposal = async () => {
    const cleanPulStr = String(vPul).replace(/\D/g, "");
    if (!vCoins || !vPul || Number(vCoins) <= 0 || Number(cleanPulStr) <= 0)
      return showMsg(L("❌ Maydonlarni to'ldiring", "❌ Заполните поля"), "err");

    const reward = Number(cleanPulStr);
    const targetParentId = vParentId || "all";
    const targetParentName = targetParentId === "all" ? L("Ota-ona", "Родители") : ((azolar || []).find(a => a.id === targetParentId)?.ism || L("Ota-ona", "Родители"));

    const v = {
      id: Date.now(),
      uid: user.id,
      kidName: user.ism || "Bola",
      targetCoins: Number(vCoins),
      reward,
      desc: vDesc || L(`${vCoins} ta Bilim Coin yig'ish`, `Набрать ${vCoins} монет`),
      done: false,
      paid: false,
      proposed: true,
      proposedBy: user.id,
      proposedTo: targetParentId,
      proposedToName: targetParentName,
      createdBy: user.id,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const upd = [v, ...vazifalar];
    setVazifalar(upd);
    await db.s("bilim_vazifa_" + oilaId, upd);
    
    // Notify parents
    try {
      const adults = (azolar || []).filter(a => a.rol === "bosh" || a.rol === "azo");
      const uidsToNotify = targetParentId === "all" ? adults.map(a => a.id) : [targetParentId];
      for (const uid of uidsToNotify) {
        await notifyFamily(
          uid,
          "bilim_proposal",
          L("Yangi bilim vazifasi taklifi", "Новое предложение задания"),
          L(
            `${v.kidName} yangi bilim vazifasi taklif qildi: ${v.desc} (${v.reward.toLocaleString()} so'm)`,
            `${v.kidName} предложил новое задание: ${v.desc} (${v.reward.toLocaleString()} сум)`
          ),
          { proposalId: v.id }
        );
      }
    } catch (e) {
      console.error("Failed to send proposal notifications:", e);
    }

    setShowAddV(false);
    setVCoins(""); setVPul(""); setVDesc(""); setVParentId("all");
    showMsg(L("✅ Taklif ota-onangizga yuborildi!", "✅ Предложение отправлено родителям!"));
  };

  // ── Ota-ona taklifni tasdiqlashi ──
  const approveProposal = async (v) => {
    try {
      let finalReward = v.reward;
      const cleanEditReward = Number(String(editRewardValue).replace(/\D/g, ""));
      if (editingRewardVId === v.id && cleanEditReward > 0) {
        finalReward = cleanEditReward;
        setEditingRewardVId(null);
      }
      const upd = vazifalar.map(vz =>
        vz.id === v.id ? { ...vz, proposed: false, reward: finalReward, approvedBy: user.id, approvedAt: new Date().toISOString().slice(0, 10) } : vz
      );
      setVazifalar(upd);
      await db.s("bilim_vazifa_" + oilaId, upd);
      showMsg(L("✅ Taklif tasdiqlandi!", "✅ Предложение одобрено!"));

      // Notify the kid
      await notifyFamily(
        v.uid,
        "bilim_approved",
        L("Bilim vazifasi tasdiqlandi!", "Задание утверждено!"),
        L(
          `Ota-onangiz taklifingizni tasdiqladi: ${v.desc} (${finalReward.toLocaleString()} so'm)`,
          `Родители утвердили ваше предложение: ${v.desc} (${finalReward.toLocaleString()} сум)`
        )
      );
    } catch (e) {
      showMsg(L("❌ Xato yuz berdi", "❌ Ошибка"), "err");
    }
  };

  // ── Ota-ona taklifni rad etishi ──
  const rejectProposal = async (v) => {
    try {
      const upd = vazifalar.filter(vz => vz.id !== v.id);
      setVazifalar(upd);
      await db.s("bilim_vazifa_" + oilaId, upd);
      showMsg(L("❌ Taklif rad etildi", "❌ Предложение отклонено"));
    } catch (e) {
      showMsg(L("❌ Xato yuz berdi", "❌ Ошибка"), "err");
    }
  };

  // ── Vazifani to'lash — bola balansiga, ota/ona balansidan ──
  const payVazifa = async (v) => {
    try {
      // Ota/ona balansini tekshirish
      const myDar = dar.filter(d => d.uid === user.id || !d.uid).reduce((s, d) => s + Number(d.summa || 0), 0);
      const myXar = xar.filter(x => x.uid === user.id || !x.uid).reduce((s, x) => s + Number(x.summa || 0), 0);
      const myBal = myDar - myXar;

      if (myBal < v.reward) {
        return showMsg(
          L(
            `❌ Balansingizda yetarli mablag' yo'q! Kerak: ${v.reward.toLocaleString()} so'm`,
            `❌ Недостаточно средств на вашем балансе! Нужно: ${v.reward.toLocaleString()} сум`
          ),
          "err"
        );
      }

      // Bolaning bilim coin balansini noldan boshlash (to'landi)
      const kidBilim = (await db.g("bilim_coins_" + v.uid)) || 0;
      // Bolaning cho'ntak pulini oshirish
      const kb = (await db.g("kidbal_" + oilaId)) || {};
      kb[v.uid] = (kb[v.uid] || 0) + v.reward;
      await db.s("kidbal_" + oilaId, kb);
      if (typeof setKidBalances === "function") {
        setKidBalances(kb);
      }

      // Bolaning coin balansini yangilash (kamaytirish)
      const nextCoins = Math.max(0, kidBilim - v.targetCoins);
      await db.s("bilim_coins_" + v.uid, nextCoins);
      setKidsCoins(prev => ({ ...prev, [v.uid]: nextCoins }));

      // Ota/ona xarajatlariga qo'shish
      const xItem = {
        id: Date.now(),
        kategoriya: "boshqa",
        summa: v.reward,
        izoh: L(`Bilim bozor: ${v.desc}`, `Маркет знаний: ${v.desc}`),
        sana: new Date().toISOString().slice(0, 10),
        vaqt: new Date().toTimeString().slice(0, 5),
        uid: user.id,
        repeat: false
      };
      const xk = "x_" + oilaId + "_" + user.id;
      const currentXData = (await db.g(xk)) || [];
      await db.s(xk, [xItem, ...currentXData]);
      setXar(prev => [xItem, ...prev]);

      const upd = vazifalar.map(vz =>
        vz.id===v.id ? {...vz, paid:true, paidSana:new Date().toISOString().slice(0,10)} : vz
      );
      setVazifalar(upd);
      await db.s("bilim_vazifa_" + oilaId, upd);
      showMsg(L(`💰 ${v.reward.toLocaleString()} so'm to'landi!`, `💰 Выплачено ${v.reward.toLocaleString()} сум!`));
    } catch(e) {
      showMsg(L("❌ Xato yuz berdi", "❌ Ошибка"), "err");
    }
  };

  const curWord = sessionWords[curIdx];
  const curLvl = LEVELS.find(l => l.id===level);
  const myVazifaActive = vazifalar.find(v => v.uid===user?.id && !v.done && !v.paid);
  const kids = (azolar||[]).filter(a => a.rol==="kid");

  // So'z uchun olish mumkin bo'lgan coinni hisoblash
  const getWordCoin = (word, lvlId) => {
    const lvl = LEVELS.find(l => l.id===lvlId);
    const seen = wordStats[word?.en] || 0;
    return Math.max(1, Math.round((lvl?.baseCoins||5) * getMultiplier(seen)));
  };

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:th.bg}}>
      <div style={{fontSize:14,color:th.t2}}>⏳ Yuklanmoqda...</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:th.bg,display:"flex",flexDirection:"column",fontFamily:"'Segoe UI',system-ui,sans-serif",color:th.t1}}>
      <style>{`
        @keyframes coinUp{0%{transform:translateY(0) scale(0.7);opacity:1}100%{transform:translateY(-70px) scale(1.2);opacity:0}}
        @keyframes slideUp{0%{transform:translateY(16px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes correct{0%{transform:scale(1)}50%{transform:scale(1.06)}100%{transform:scale(1)}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
        @keyframes msgIn{0%{opacity:0;transform:translateY(-12px)}15%,85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-12px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
      `}</style>

      {/* Xabar */}
      {msg && (
        <div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",background:msg.type==="err"?"#ef4444":"#22c55e",color:"#fff",borderRadius:20,padding:"10px 22px",fontSize:14,fontWeight:700,zIndex:999,animation:"msgIn 2.8s ease forwards",whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center"}}>
          {msg.text}
        </div>
      )}

      {/* Coin animatsiya */}
      {flyCoins.map(c => (
        <div key={c.id} style={{position:"fixed",top:"40%",left:"50%",transform:"translateX(-50%)",fontSize:18,fontWeight:900,color:"#f59e0b",zIndex:998,animation:"coinUp 1.2s ease forwards",pointerEvents:"none",display:"inline-flex",alignItems:"center",gap:4}}>
          +{c.amount} {BIco.coin("#f59e0b", 18)}
        </div>
      ))}

      {/* Header */}
      <div style={{ padding: "14px 16px 0" }}>
        <PageHeader 
          th={th} 
          title={embedded ? (gameTitle || L("So'z o'rgan", "Учи слова")) : L("Bilim Bozori", "Рынок знаний")} 
          onBack={onBack} 
          right={!embedded && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: th.am + "18", border: "1px solid " + th.am + "44", padding: "6px 12px", borderRadius: 12 }}>
              {BIco.coin(th.am, 16)}
              <span style={{ fontSize: 13, fontWeight: 800, color: th.t1 }}>
                {bilimCoins} {L("Coin", "монет")}
              </span>
            </div>
          )}
        />
      </div>

      {/* Tabs */}
      {!embedded && (
        <div style={{ padding: "0 16px", marginTop: 8 }}>
          <div style={{ display: "flex", background: th.sur, border: `1px solid ${th.bor}`, borderRadius: 16, padding: 4, marginBottom: 16 }}>
            {[
              { id: "bozor", label: L("Bozor do'koni", "Магазин") },
              { id: "natija", label: L("Natijalar", "Результаты") }
            ].map(t => {
              const isSel = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "none",
                    borderRadius: 12,
                    background: isSel ? th.ac : "transparent",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: isSel ? 800 : 500,
                    color: isSel ? "#fff" : th.t2,
                    transition: "all 0.2s"
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ O'YIN ══════════════════════════════════════ */}
      {tab==="oyin" && (
        <div style={{flex:1,padding:"16px",overflow:"auto"}}>

          {/* Aktiv vazifa banner */}
          {myVazifaActive && (
            <div style={{background:"linear-gradient(135deg,#f59e0b15,#f59e0b08)",border:"2px solid #f59e0b55",borderRadius:16,padding:"12px 16px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <span style={{display:"inline-flex"}}>{BIco.target("#f59e0b", 22)}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:dark?"#fbbf24":"#92400e"}}>{myVazifaActive.desc}</div>
                  <div style={{fontSize:12,color:dark?"#94a3b8":"#666",display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                    {bilimCoins}/{myVazifaActive.targetCoins} {BIco.coin("#f59e0b", 12)} → {BIco.coin("#22c55e", 12)} {myVazifaActive.reward.toLocaleString()} so'm
                  </div>
                </div>
              </div>
              <div style={{background:dark?"#1e293b":"#fff",borderRadius:20,height:7,overflow:"hidden",marginBottom: bilimCoins >= myVazifaActive.targetCoins ? 10 : 0}}>
                <div style={{width:`${Math.min(100,(bilimCoins/myVazifaActive.targetCoins)*100)}%`,height:"100%",background:"linear-gradient(90deg,#f59e0b,#d97706)",borderRadius:20,transition:"width .4s"}}/>
              </div>
              {bilimCoins >= myVazifaActive.targetCoins && (
                <button
                  onClick={() => confirmCollected(myVazifaActive)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 12,
                    border: "none",
                    background: `linear-gradient(135deg, ${th.gr}, #047857)`,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                    transition: "all 0.2s"
                  }}
                >
                  🎉 {L("Vazifa bajarildi! Topshirish", "Задание выполнено! Отправить")}
                </button>
              )}
            </div>
          )}

          {/* Daraja tanlash */}
          {sessionWords.length===0 && !showResult && (
            <div style={{animation:"slideUp .35s ease"}}>
              <div style={{fontSize:15,fontWeight:800,color:dark?"#f1f5f9":"#1e293b",marginBottom:14,textAlign:"center"}}>
                {L("Daraja tanlang:","Выберите уровень:")}
              </div>
              {LEVELS.map(lvl => {
                const allW = WORDS[lvl.id]||[];
                const newCount  = allW.filter(w=>(wordStats[w.en]||0)===0).length;
                const seenCount = allW.filter(w=>(wordStats[w.en]||0)>0).length;
                return (
                  <button key={lvl.id} onClick={()=>startSession(lvl.id)}
                    style={{width:"100%",background:dark?"#1e293b":"#fff",border:`2px solid ${lvl.color}`,borderRadius:18,padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:12,textAlign:"left"}}>
                    <div style={{width:50,height:50,borderRadius:14,background:lvl.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {lvl.id===1 ? BIco.leaf(lvl.color, 24) : lvl.id===2 ? BIco.star(lvl.color, 24) : BIco.trophy(lvl.color, 24)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:800,color:dark?"#f1f5f9":"#1e293b"}}>{lvl.name}</div>
                      <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:"#22c55e",fontWeight:700,display:"inline-flex",alignItems:"center",gap:3}}>{BIco.star("#22c55e", 12)} {newCount} yangi +{lvl.baseCoins} {BIco.coin("#22c55e", 11)}</span>
                        <span style={{fontSize:11,color:"#f59e0b",fontWeight:700,display:"inline-flex",alignItems:"center",gap:3}}>{BIco.fire("#f59e0b", 12)} {seenCount} takror +{Math.round(lvl.baseCoins*0.6)} {BIco.coin("#f59e0b", 11)}</span>
                      </div>
                      {/* Progress */}
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                        <div style={{flex:1,height:5,background:dark?"#334155":"#e2e8f0",borderRadius:10,overflow:"hidden"}}>
                          <div style={{width:`${(seenCount/allW.length)*100}%`,height:"100%",background:lvl.color,borderRadius:10}}/>
                        </div>
                        <span style={{fontSize:10,color:dark?"#64748b":"#94a3b8"}}>{seenCount}/{allW.length}</span>
                      </div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={lvl.color} strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </button>
                );
              })}
            </div>
          )}

          {/* O'yin jarayoni */}
          {sessionWords.length>0 && !showResult && curWord && (
            <div style={{animation:"slideUp .3s ease"}}>
              {/* Progress bar */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{flex:1,height:8,background:dark?"#334155":"#e2e8f0",borderRadius:20,overflow:"hidden"}}>
                  <div style={{width:`${(curIdx/sessionWords.length)*100}%`,height:"100%",background:curLvl?.color||"#3b82f6",borderRadius:20,transition:"width .4s"}}/>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:dark?"#94a3b8":"#64748b"}}>{curIdx+1}/{sessionWords.length}</span>
              </div>

              {/* Coin indicator — bu so'z uchun */}
              {(() => {
                const seen = wordStats[curWord.en]||0;
                const mult = getMultiplier(seen);
                const coinAmt = getWordCoin(curWord, level);
                return (
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                    <div style={{background:seen===0?"#22c55e22":seen===1?"#f59e0b22":"#ef444422",border:`1.5px solid ${seen===0?"#22c55e":seen===1?"#f59e0b":"#ef4444"}`,borderRadius:20,padding:"4px 14px",display:"inline-flex",alignItems:"center",gap:6,fontSize:13,fontWeight:700,color:seen===0?"#15803d":seen===1?"#92400e":"#991b1b"}}>
                      {seen===0 && <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.star("#22c55e",12)} {L("Yangi so'z","Новое слово")}</span>}
                      {seen===1 && <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.fire("#f59e0b",12)} {L("1 marta ko'rilgan","Видел 1 раз")}</span>}
                      {seen>1 && <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.fire("#ef4444",12)} {L("Ko'p ko'rilgan","Повторение")}</span>}
                      <span style={{color:seen===0?"#22c55e":seen===1?"#f59e0b":"#ef4444",display:"inline-flex",alignItems:"center",gap:2}}>+{coinAmt} {BIco.coin(seen===0?"#22c55e":seen===1?"#f59e0b":"#ef4444", 12)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* So'z kartasi */}
              <div style={{background:`linear-gradient(135deg,${curLvl?.color}22,${curLvl?.color}0a)`,border:`2px solid ${curLvl?.color}44`,borderRadius:24,padding:"30px 20px",textAlign:"center",marginBottom:18}}>
                <div style={{fontSize:11,fontWeight:700,color:dark?"#94a3b8":"#64748b",letterSpacing:2,marginBottom:8}}>ENGLISH</div>
                <div style={{fontSize:38,fontWeight:900,color:dark?"#f1f5f9":"#1e293b",letterSpacing:1}}>{curWord.en}</div>
                {streak>2 && <div style={{marginTop:8,fontSize:13,color:"#f59e0b",fontWeight:700,animation:"pulse 1s ease-in-out infinite",display:"inline-flex",alignItems:"center",gap:4}}>{BIco.fire("#f59e0b",14)} {streak} ketma-ket!</div>}
              </div>

              {/* Variantlar */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {choices.map((ch, i) => {
                  const isSel = selected===ch;
                  const isRight = ch===curWord.uz;
                  let bg = dark?"#1e293b":"#fff";
                  let border = dark?"#334155":"#e2e8f0";
                  let anim = "";
                  if (isSel && isCorrect===true)  {bg="#dcfce7"; border="#22c55e"; anim="correct .4s ease";}
                  if (isSel && isCorrect===false) {bg="#fee2e2"; border="#ef4444"; anim="shake .4s ease";}
                  if (!isSel && selected!==null && isRight) {bg="#dcfce7"; border="#22c55e";}
                  return (
                    <button key={i} onClick={()=>handleChoice(ch)}
                      style={{background:bg,border:`2px solid ${border}`,borderRadius:16,padding:"15px 18px",cursor:selected===null?"pointer":"default",fontSize:16,fontWeight:700,color:dark?"#f1f5f9":"#1e293b",textAlign:"left",animation:anim,display:"flex",alignItems:"center",gap:10,transition:"border .2s,background .2s"}}>
                      <span style={{width:28,height:28,borderRadius:"50%",background:dark?"#334155":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0}}>
                        {["A","B","C","D"][i]}
                      </span>
                      <span style={{flex:1}}>{ch}</span>
                      {isSel && isCorrect===true  && <span>{BIco.check("#22c55e", 16)}</span>}
                      {isSel && isCorrect===false && <span>{BIco.cross("#ef4444", 16)}</span>}
                      {!isSel && selected!==null && isRight && <span>{BIco.check("#22c55e", 16)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Natija */}
          {showResult && (
            <div style={{textAlign:"center",animation:"slideUp .4s ease"}}>
              <div style={{height:60,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}>
                {sessionScore.right>=8 ? BIco.trophy("#8b5cf6", 48) : sessionScore.right>=5 ? BIco.star("#f59e0b", 48) : BIco.fire("#ef4444", 48)}
              </div>
              <div style={{fontSize:22,fontWeight:900,color:dark?"#f1f5f9":"#1e293b",marginBottom:6}}>
                {L("Sessiya tugadi!","Сессия завершена!")}
              </div>
              <div style={{fontSize:15,color:dark?"#94a3b8":"#64748b",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.check("#22c55e", 14)} {sessionScore.right} {L("to'g'ri","верно")}</span>
                <span>/</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.cross("#ef4444", 14)} {sessionScore.wrong} {L("xato","ошибка")}</span>
              </div>
              <div style={{background:`linear-gradient(135deg,${curLvl?.color}22,${curLvl?.color}0a)`,border:`2px solid ${curLvl?.color}44`,borderRadius:20,padding:"18px",marginBottom:20}}>
                <div style={{fontSize:13,color:dark?"#94a3b8":"#64748b"}}>{L("Bu sessiyada:","Заработано:")}</div>
                <div style={{fontSize:30,fontWeight:900,color:"#f59e0b",margin:"6px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>+{sessionScore.earned} {BIco.coin("#f59e0b", 24)}</div>
                <div style={{fontSize:13,color:dark?"#64748b":"#94a3b8",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{L("Jami:","Всего:")} {bilimCoins} {BIco.coin("#64748b", 12)}</div>
                {sessionScore.right>0 && (
                  <div style={{fontSize:12,color:dark?"#64748b":"#94a3b8",marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    {BIco.info("#3b82f6", 12)} {L("Yangi so'zlar ko'proq coin beradi","Новые слова дают больше монет")}
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setSessionWords([])} style={{flex:1,padding:"14px",borderRadius:16,border:"none",background:dark?"#334155":"#f1f5f9",color:dark?"#94a3b8":"#64748b",fontWeight:700,fontSize:15,cursor:"pointer"}}>
                  {L("Orqaga","Назад")}
                </button>
                <button onClick={()=>startSession(level)} style={{flex:1,padding:"14px",borderRadius:16,border:"none",background:`linear-gradient(135deg,${curLvl?.color},${curLvl?.color}cc)`,color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  {BIco.fire("#fff", 14)} {L("Yana o'ynash","Ещё раз")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ BOZOR ══════════════════════════════════════ */}
      {tab==="bozor" && (
        <div style={{flex:1,padding:"0 16px 16px",overflow:"auto"}}>
          <div style={{
            background: th.ac + "0d",
            border: `1.5px solid ${th.ac}33`,
            borderRadius: 16,
            padding: "12px 16px",
            marginBottom: 14,
            fontSize: 13,
            color: th.t2,
            lineHeight: 1.6,
            display: "flex",
            alignItems: "flex-start",
            gap: 8
          }}>
            <span style={{ display: "inline-flex", marginTop: 2 }}>{BIco.info(th.ac, 16)}</span>
            <span>
              {isKid ? L(
                "Ota-onangiz siz uchun 'Bilim Vazifasi' qo'shadi. Masalan: '200 Bilim Coin yig' = 50 000 so'm'. Coin yig'sangiz, pulingiz cho'ntak puli hisobiga avtomatik tushadi!",
                "Родители добавляют задания. Например: 'Собери 200 монет = 50 000 сум'. Копите монеты — деньги автоматически зачислятся на карманные расходы!"
              ) : L(
                "Ota-ona 'Bilim Vazifasi' qo'shadi. Masalan: '200 Bilim Coin yig' = 50 000 so'm'. Bola coin yig'sa, mukofot puli avtomatik tarzda bolaning cho'ntak puli balansiga tushadi!",
                "Родитель добавляет задание. Например: 'Собери 200 монет = 50 000 сум'. Когда ребёнок накопит монеты, вознаграждение автоматически зачислится на его баланс!"
              )}
            </span>
          </div>

          {/* Bola: Ota-onaga taklif yuborish tugmasi */}
          {isKid && (
            <button onClick={() => { setShowAddV(true); setVParentId("all"); }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 16,
                border: `2px dashed ${th.ac}`,
                background: th.ac + "0a",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700,
                color: th.ac,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s"
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {BIco.plus(th.ac, 16)} {L("Yangi taklif yuborish", "Предложить задание")}
              </span>
            </button>
          )}

          {/* Ota-ona: bola tanlash + vazifa qo'shish */}
          {isBosh && (
            <>
              {kids.length>1 && (
                <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                  {kids.map(k => (
                    <button key={k.id} onClick={()=>setVKidId(k.id)}
                      style={{padding:"8px 16px",borderRadius:20,border:`2px solid ${vKidId===k.id?th.ac:th.bor}`,background:vKidId===k.id?th.ac+"22":"transparent",color:vKidId===k.id?th.ac:th.t2,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.user(vKidId===k.id?th.ac:th.t2, 12)} {k.ism}</span>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={()=>setShowAddV(true)}
                style={{width:"100%",padding:"15px",borderRadius:16,border:`2px dashed ${th.ac}`,background:"transparent",cursor:"pointer",fontSize:15,fontWeight:700,color:th.ac,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:6}}>{BIco.plus(th.ac, 16)} {L("Yangi bilim vazifasi","Новое задание")}</span>
              </button>
            </>
          )}

          {/* Vazifalar */}
          {(isBosh ? vazifalar : vazifalar.filter(v=>v.uid===user?.id)).length===0 ? (
            <div style={{textAlign:"center",padding:"40px 20px",color:th.t3}}>
              <div style={{marginBottom:10,display:"flex",justifyContent:"center"}}>{BIco.empty(th.bor, 48)}</div>
              <div style={{fontSize:14}}>{L("Hozircha vazifa yo'q","Заданий нет")}</div>
              {isKid && <div style={{fontSize:12,marginTop:8}}>{L("Ota-onangizdan vazifa so'rang yoki taklif jo'nating","Попросите родителя добавить задание или отправьте предложение")}</div>}
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(isBosh ? vazifalar : vazifalar.filter(v=>v.uid===user?.id)).map(v => {
                const kidCoins = v.uid===user?.id ? bilimCoins : (kidsCoins[v.uid] ?? null);
                const progress = kidCoins!==null ? Math.min(100,(kidCoins/v.targetCoins)*100) : null;
                const isProposal = v.proposed;
                
                return (
                  <div key={v.id} style={{
                    background: th.sur,
                    border: `1px solid ${v.paid ? th.gr : v.done ? th.am : isProposal ? th.am + "88" : th.bor}`,
                    borderRadius: 16,
                    padding: "16px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: th.t1, paddingRight: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        {BIco.book(th.ac, 14)} {v.desc}
                      </div>
                      <div style={{
                        flexShrink: 0,
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 10,
                        padding: "3px 8px",
                        background: v.paid ? th.gr + "18" : v.done ? th.am + "18" : isProposal ? th.am + "18" : "transparent",
                        color: v.paid ? th.gr : v.done ? th.am : isProposal ? th.am : "transparent",
                        border: `1px solid ${v.paid ? th.gr : v.done ? th.am : isProposal ? th.am : "transparent"}`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4
                      }}>
                        {v.paid ? (
                          <><span style={{ display: "inline-flex" }}>{BIco.check(th.gr, 10)}</span> {L("To'landi", "Выплачено")}</>
                        ) : v.done ? (
                          <><span style={{ display: "inline-flex" }}>{BIco.fire(th.am, 10)}</span> {L("Kutilmoqda", "Ожидает")}</>
                        ) : isProposal ? (
                          <><span style={{ display: "inline-flex" }}>{BIco.star(th.am, 10)}</span> {L("Taklif yuborildi", "Предложено")}</>
                        ) : ""}
                      </div>
                    </div>

                    {/* Meta info */}
                    {isBosh && (
                      <div style={{ fontSize: 12, color: th.t2, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        {BIco.user(th.t2, 12)} <span style={{ fontWeight: 600 }}>{v.kidName}</span>
                      </div>
                    )}
                    {isProposal && v.proposedToName && (
                      <div style={{ fontSize: 12, color: th.t2, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        {BIco.user(th.t2, 12)} {L("Kimga: ", "Кому: ")} <span style={{ fontWeight: 600 }}>{v.proposedToName}</span>
                      </div>
                    )}

                    {isBosh && isProposal ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: th.am, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {BIco.coin(th.am, 14)} {v.targetCoins} Coin
                        </span>
                        <span style={{ color: th.t3 }}>→</span>
                        {editingRewardVId === v.id ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={editRewardValue}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                setEditRewardValue(formatInputSum(raw));
                              }}
                              placeholder={v.reward.toString()}
                              style={{
                                width: 100,
                                padding: "4px 8px",
                                borderRadius: 10,
                                border: `2px solid ${th.ac}`,
                                background: dark ? "#1e293b" : "#fff",
                                color: th.t1,
                                fontWeight: "bold",
                                fontSize: 13,
                              }}
                            />
                            <span style={{ fontSize: 12, color: th.t2 }}>so'm</span>
                            <button
                              onClick={() => {
                                const cleanReward = Number(String(editRewardValue).replace(/\D/g, ""));
                                if (cleanReward > 0) {
                                  v.reward = cleanReward;
                                }
                                setEditingRewardVId(null);
                              }}
                              style={{
                                padding: "4px 8px",
                                background: th.gr,
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontSize: 11,
                                fontWeight: "bold"
                              }}
                            >
                              {L("Saqlash", "Сохранить")}
                            </button>
                            <button
                              onClick={() => setEditingRewardVId(null)}
                              style={{
                                padding: "4px 8px",
                                background: th.bor,
                                color: th.t1,
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontSize: 11,
                                fontWeight: "bold"
                              }}
                            >
                              {L("Bekor", "Отмена")}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: th.gr, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              {BIco.coin(th.gr, 14)} {v.reward.toLocaleString()} so'm
                            </span>
                            <button
                              onClick={() => {
                                setEditingRewardVId(v.id);
                                setEditRewardValue(v.reward.toString());
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: th.ac,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                padding: "2px 6px",
                                borderRadius: 6,
                                border: `1px solid ${th.ac}33`,
                              }}
                            >
                              {L("O'zgartirish", "Изменить")}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: progress !== null && !v.done && !isProposal ? 10 : 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: th.am, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {BIco.coin(th.am, 14)} {v.targetCoins} Coin
                        </span>
                        <span style={{ color: th.t3 }}>→</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: th.gr, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {BIco.coin(th.gr, 14)} {v.reward.toLocaleString()} so'm
                        </span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {progress !== null && !v.done && !isProposal && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ background: th.bor, borderRadius: 20, height: 7, overflow: "hidden", marginBottom: 4 }}>
                          <div style={{ width: `${progress}%`, height: "100%", background: th.ac, borderRadius: 20, transition: "width .4s" }} />
                        </div>
                        <div style={{ fontSize: 11, color: th.t2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {kidCoins}/{v.targetCoins} {BIco.coin(th.t2, 10)}
                          </span>
                          {kidCoins >= v.targetCoins && isKid && (
                            <button
                              onClick={() => confirmCollected(v)}
                              style={{
                                padding: "4px 10px",
                                borderRadius: 8,
                                border: "none",
                                background: th.gr,
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 11,
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              {L("Topshirish", "Сдать")}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Parent buttons for proposals */}
                    {isBosh && isProposal && (
                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button onClick={() => rejectProposal(v)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: 12,
                            border: `1px solid ${th.rd}`,
                            background: "transparent",
                            color: th.rd,
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {L("Rad etish", "Отклонить")}
                        </button>
                        <button onClick={() => approveProposal(v)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: 12,
                            border: "none",
                            background: `linear-gradient(135deg, ${th.gr}, #047857)`,
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 13,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {L("Tasdiqlash", "Одобрить")}
                        </button>
                      </div>
                    )}

                    {/* Parent button to pay finished tasks */}
                    {isBosh && v.done && !v.paid && (
                      <button onClick={() => payVazifa(v)}
                        style={{
                          marginTop: 10,
                          width: "100%",
                          padding: "12px",
                          borderRadius: 12,
                          border: "none",
                          background: `linear-gradient(135deg, ${th.gr}, #047857)`,
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 14,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          transition: "all 0.2s"
                        }}
                      >
                        {BIco.coin("#fff", 14)} {L(`${v.reward.toLocaleString()} so'm to'lash`, `Выплатить ${v.reward.toLocaleString()} сум`)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════ NATIJA ══════════════════════════════════════ */}
      {tab==="natija" && (() => {
        const kidName = user?.ism || "Bola";
        const analysis = analyzeLearning(sessions, lg, kidName, 30);
        const weekReport = weeklyReport(sessions, lg, kidName);

        // Dynamic Purchase Statistics for Parent
        const getPurchaseStats = (vList) => {
          const paidTasks = vList.filter(v => v.paid && v.paidSana);
          const now = new Date();
          
          const getWeekNumber = (d) => {
            const onejan = new Date(d.getFullYear(), 0, 1);
            return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
          };
          
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();
          const currentWeek = getWeekNumber(now);
          
          let weekCoins = 0, weekMoney = 0;
          let monthCoins = 0, monthMoney = 0;
          let yearCoins = 0, yearMoney = 0;
          
          const kidYearStats = {};
          
          paidTasks.forEach(v => {
            const pDate = new Date(v.paidSana);
            if (isNaN(pDate.getTime())) return;
            
            const pYear = pDate.getFullYear();
            const pMonth = pDate.getMonth();
            const pWeek = getWeekNumber(pDate);
            
            const coins = Number(v.targetCoins || 0);
            const money = Number(v.reward || 0);
            
            if (pYear === currentYear) {
              yearCoins += coins;
              yearMoney += money;
              
              const kId = v.uid || "unknown";
              if (!kidYearStats[kId]) {
                kidYearStats[kId] = { kidName: v.kidName || "Bola", coins: 0, money: 0 };
              }
              kidYearStats[kId].coins += coins;
              kidYearStats[kId].money += money;
              
              if (pMonth === currentMonth) {
                monthCoins += coins;
                monthMoney += money;
              }
              
              if (pWeek === currentWeek) {
                weekCoins += coins;
                weekMoney += money;
              }
            }
          });
          
          return {
            week: { coins: weekCoins, money: weekMoney },
            month: { coins: monthCoins, money: monthMoney },
            year: { coins: yearCoins, money: yearMoney },
            kids: Object.values(kidYearStats)
          };
        };

        const purchaseStats = getPurchaseStats(vazifalar);

        return (
          <div style={{flex:1,padding:"16px",overflow:"auto"}}>
            {isBosh && (
              <>
                <div style={{display:"space-between", justifyContent:"space-between",alignItems:"center",marginBottom:14, display:"flex"}}>
                  <span style={{fontSize:15,fontWeight:800,color:dark?"#f1f5f9":"#1e293b",display:"flex",alignItems:"center",gap:6}}>{BIco.chart("#3b82f6", 16)} {L("Bola-ona natijalari","Результаты")}</span>
                  <button onClick={()=>setTab("bozor")}
                    style={{display:"flex",alignItems:"center",gap:6,background:dark?"#1e293b":"#fff",border:`1.5px solid ${dark?"#334155":"#cbd5e1"}`,borderRadius:12,padding:"6px 12px",fontSize:12,fontWeight:700,color:"#3b82f6",cursor:"pointer"}}>
                    {BIco.store("#3b82f6", 14)} {L("Bozorga qaytish","Назад в маркет")}
                  </button>
                </div>

                {/* Coin purchase stats card for parents */}
                <div style={{background: dark ? "#1e293b" : "#fff", border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`, borderRadius: 18, padding: "16px", marginBottom: 16}}>
                  <div style={{fontSize: 14, fontWeight: 800, color: th.t1, marginBottom: 12, display: "flex", alignItems: "center", gap: 6}}>
                    {BIco.store(th.ac, 16)} {L("Coin xarid qilish statistikasi", "Статистика покупки монет")}
                  </div>
                  
                  {/* Hafta, Oy, Yil grid */}
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14}}>
                    {[
                      { label: L("Shu haftada", "На этой неделе"), coins: purchaseStats.week.coins, money: purchaseStats.week.money },
                      { label: L("Shu oyda", "В этом месяце"), coins: purchaseStats.month.coins, money: purchaseStats.month.money },
                      { label: L("Shu yilda", "В этом году"), coins: purchaseStats.year.coins, money: purchaseStats.year.money }
                    ].map((item, idx) => (
                      <div key={idx} style={{textAlign: "center", background: th.bg, borderRadius: 12, padding: "10px", border: `1px solid ${th.bor}`}}>
                        <div style={{fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 4}}>{item.label}</div>
                        <div style={{fontSize: 12, fontWeight: 800, color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", gap: 2}}>
                          {item.coins} {BIco.coin("#f59e0b", 10)}
                        </div>
                        <div style={{fontSize: 11, fontWeight: 700, color: th.gr, marginTop: 2}}>
                          {item.money.toLocaleString()} so'm
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Kids year summary text */}
                  <div style={{borderTop: `1px solid ${th.bor}`, paddingTop: 12}}>
                    {purchaseStats.kids.length === 0 ? (
                      <div style={{fontSize: 12, color: th.t3, textAlign: "center"}}>
                        {L("Hozircha xarid qilingan coinlar yo'q.", "Пока нет купленных монет.")}
                      </div>
                    ) : (
                      <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                        {purchaseStats.kids.map((kStat, idx) => (
                          <div key={idx} style={{fontSize: 12, color: th.t2, lineHeight: "1.4", background: th.bg, padding: "8px 12px", borderRadius: 10}}>
                            🏆 {L(
                              `Bu yil farzandingiz ${kStat.kidName}dan jami ${kStat.coins} ta bilim coinni ${kStat.money.toLocaleString()} so'mga sotib oldingiz.`,
                              `В этом году вы купили у ребенка ${kStat.kidName} в общей сложности ${kStat.coins} монет знаний за ${kStat.money.toLocaleString()} сум.`
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Umumiy */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[
                {label:"Bilim Coin", val:bilimCoins, ico:BIco.coin("#f59e0b", 28), color:"#f59e0b"},
                {label:L("O'ynalgan o'yinlar","Игр сыграно"), val:sessions.length, ico:BIco.book("#3b82f6", 28), color:"#3b82f6"},
                {label:L("Ketma-ket","Серия"), val:streak, ico:BIco.fire("#ef4444", 28), color:"#ef4444"},
                {label:L("Bajarilgan","Выполнено"), val:vazifalar.filter(v=>v.uid===user?.id&&v.paid).length, ico:BIco.check("#22c55e", 28), color:"#22c55e"},
              ].map((s,i) => (
                <div key={i} style={{background:dark?"#1e293b":"#fff",border:`1px solid ${dark?"#334155":"#e2e8f0"}`,borderRadius:16,padding:"16px",textAlign:"center"}}>
                  <div style={{height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>{s.ico}</div>
                  <div style={{fontSize:22,fontWeight:900,color:s.color,margin:"4px 0"}}>{s.val}</div>
                  <div style={{fontSize:11,color:dark?"#64748b":"#94a3b8"}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* AI study tip/recommendation */}
            <div style={{background: th.ac + "15", border: `1px solid ${th.ac}33`, borderRadius: 18, padding: "16px", marginBottom: 16}}>
              <div style={{display: "flex", gap: 10, alignItems: "flex-start"}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
                  <path d="M12 2a6 6 0 0 0-6 6c0 1.9.83 3.6 2.16 4.77C9.37 13.9 10 15 10 16h4c0-1 .63-2.1 1.84-3.23C17.17 11.6 18 9.9 18 8a6 6 0 0 0-6-6z" stroke={th.ac} strokeWidth="1.8" fill={th.ac} fillOpacity="0.12"/>
                  <path d="M10 20h4M9 22h6" stroke={th.ac} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <div>
                  <div style={{fontSize: 14, fontWeight: 700, color: th.t1}}>{analysis.tip}</div>
                  {analysis.weakTip && <div style={{fontSize: 12, color: th.t2, marginTop: 4}}>{analysis.weakTip}</div>}
                </div>
              </div>
            </div>

            {/* Haftalik progress */}
            <div style={{background:dark?"#1e293b":"#fff",border:`1px solid ${dark?"#334155":"#e2e8f0"}`,borderRadius:18,padding:"16px",marginBottom:16}}>
              <div style={{fontSize:14,fontWeight:800,color:th.t1,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
                {BIco.chart(th.ac, 16)} {L("Haftalik natijalar", "Недельные результаты")}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div style={{textAlign:"center",background:th.bg,borderRadius:12,padding:"10px"}}>
                  <div style={{fontSize:16,fontWeight:900,color:th.ac}}>{weekReport.games}</div>
                  <div style={{fontSize:10,color:th.t2}}>{L("O'yin", "Игры")}</div>
                </div>
                <div style={{textAlign:"center",background:th.bg,borderRadius:12,padding:"10px"}}>
                  <div style={{fontSize:16,fontWeight:900,color:"#f59e0b"}}>{weekReport.coins}</div>
                  <div style={{fontSize:10,color:th.t2}}>Coin</div>
                </div>
                <div style={{textAlign:"center",background:th.bg,borderRadius:12,padding:"10px"}}>
                  <div style={{fontSize:16,fontWeight:900,color:"#10b981"}}>{weekReport.xp || 0}</div>
                  <div style={{fontSize:10,color:th.t2}}>XP</div>
                </div>
              </div>
            </div>

            {/* Oxirgi o'yinlar tarixi */}
            <div style={{background:dark?"#1e293b":"#fff",border:`1px solid ${dark?"#334155":"#e2e8f0"}`,borderRadius:18,padding:"16px"}}>
              <div style={{fontSize:14,fontWeight:800,color:th.t1,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
                {BIco.game(th.ac, 16)} {L("O'yinlar tarixi", "История игр")}
              </div>
              
              {sessions.length === 0 ? (
                <div style={{textAlign:"center",padding:"24px 10px",color:th.t3}}>
                  {BIco.empty(th.t3, 32)}
                  <div style={{fontSize:12,marginTop:8}}>{L("Hozircha o'yinlar o'ynalmagan", "Игр пока не сыграно")}</div>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {sessions.slice(0, 10).map((s, idx) => {
                    const g = gameById(s.gameId);
                    const gameName = g ? (g.name[lg] || g.name.uz) : s.gameId;
                    const dateStr = s.date || (s.ts ? new Date(s.ts).toLocaleDateString() : "");
                    
                    return (
                      <div key={idx} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:th.bg,borderRadius:14,border:`1px solid ${th.bor}`}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:th.t1}}>{gameName}</div>
                          <div style={{fontSize:10,color:th.t3,marginTop:2}}>{dateStr}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:12,fontWeight:800,color:th.gr}}>{s.pct}% {L("to'g'ri", "правильно")}</div>
                          <div style={{fontSize:10,fontWeight:700,color:"#f59e0b",marginTop:2,display:"flex",alignItems:"center",gap:3,justifyContent:"flex-end"}}>
                            +{s.coins} {BIco.coin("#f59e0b", 12)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ══════════ VAZIFA QO'SHISH MODAL ══════════════════════ */}
      {showAddV && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowAddV(false)}>
          <div style={{background:th.sur,borderRadius:"24px 24px 0 0",padding:"24px 22px 40px",width:"100%"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:17,fontWeight:800,color:th.t1,marginBottom:6,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              {BIco.plus(th.ac, 16)} {isKid ? L("Taklif yuborish", "Предложить задание") : L("Bilim Vazifasi qo'shish", "Добавить задание")}
            </div>

            {/* Target parent selection chip row if user is kid */}
            {isKid && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: th.t2, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  {BIco.user(th.t2, 12)} {L("Kimga yuborilsin?", "Кому отправить предложение?")}
                </div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                  <button onClick={() => setVParentId("all")}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 20,
                      border: `1.5px solid ${vParentId === "all" ? th.ac : th.bor}`,
                      background: vParentId === "all" ? th.ac + "18" : "transparent",
                      color: vParentId === "all" ? th.ac : th.t2,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {L("Ota-ona", "Родители")}
                  </button>
                  {(azolar || []).filter(a => a.rol === "bosh" || a.rol === "azo").map(a => (
                    <button key={a.id} onClick={() => setVParentId(a.id)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 20,
                        border: `1.5px solid ${vParentId === a.id ? th.ac : th.bor}`,
                        background: vParentId === a.id ? th.ac + "18" : "transparent",
                        color: vParentId === a.id ? th.ac : th.t2,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {a.ism}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isBosh && kids.length>1 && (
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:th.t2,marginBottom:6,display:"flex",alignItems:"center",gap:4}}>{BIco.user(th.t2, 12)} {L("Bola tanlang","Выберите ребёнка")}</div>
                <div style={{display:"flex",gap:8}}>
                  {kids.map(k => (
                    <button key={k.id} onClick={()=>setVKidId(k.id)}
                      style={{padding:"8px 14px",borderRadius:20,border:`2px solid ${vKidId===k.id?th.ac:th.bor}`,background:vKidId===k.id?th.ac+"18":"transparent",color:vKidId===k.id?th.ac:th.t2,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                      {k.ism}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:th.t2,marginBottom:4}}>{L("Necha Bilim Coin yig'ilsin?","Сколько монет набрать?")}</div>
              <input 
                value={vCoins} 
                onChange={e => setVCoins(e.target.value.replace(/\D/g, ""))} 
                type="text" 
                inputMode="numeric"
                placeholder="200"
                style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${th.bor}`,background:th.bg,color:th.t1,fontSize:15,outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:th.t2,marginBottom:4}}>{L("Mukofot miqdori (so'm)","Вознаграждение (сум)")}</div>
              <input 
                value={vPul} 
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setVPul(formatInputSum(raw));
                }} 
                type="text" 
                inputMode="numeric"
                placeholder="50 000"
                style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${th.bor}`,background:th.bg,color:th.t1,fontSize:15,outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:th.t2,marginBottom:4}}>{L("Izoh (ixtiyoriy)","Описание (необязательно)")}</div>
              <input 
                value={vDesc} 
                onChange={e => setVDesc(e.target.value)} 
                type="text" 
                placeholder={L("200 coin yig'ish","Набрать 200 монет")}
                style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${th.bor}`,background:th.bg,color:th.t1,fontSize:15,outline:"none",boxSizing:"border-box"}}
              />
            </div>
            {vCoins && vPul && (
              <div style={{background:th.gr+"18",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:13,color:th.gr,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                {BIco.target(th.gr, 14)} {L(`Bola ${vCoins} coin yig'ganda → ${vPul} so'm oladi`,`Когда наберет ${vCoins} монет → получит ${vPul} сум`)}
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowAddV(false)} style={{flex:1,padding:"13px",borderRadius:14,border:"none",background:th.bor,color:th.t2,fontWeight:700,cursor:"pointer"}}>
                {L("Bekor qilish","Отмена")}
              </button>
              <button onClick={isKid ? addProposal : addVazifa} style={{flex:1,padding:"13px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${th.ac},${th.ac2})`,color:"#fff",fontWeight:800,cursor:"pointer"}}>
                {isKid ? L("Taklif jo'natish","Предложить") : L("Vazifa qo'shish","Добавить")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
