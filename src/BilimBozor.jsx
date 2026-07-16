import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { db } from "./firebase.js";
import { td, nt, f } from "./utils/formatters.js";
import { PALETTE } from "./utils/tokens.js";
import { PageHeader } from "./components/ui/index.js";
import { notifyFamily } from "./utils/notify.jsx";
import { CATEGORIES, gameById } from "./bilim/registry.jsx";
import { analyzeLearning, weeklyReport } from "./bilim/engine/analytics.js";
import { useApp } from "./context/AppContext.jsx";
import { logGameSession } from "./bilim/engine/persist.js";

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
// ── WORD_EMOJIS XARITASI (visual rasm o'rniga bolalarbop emojilar) ────────────────────
export const WORD_EMOJIS = {
  // Level 1
  apple: "🍎", book: "📖", cat: "🐱", dog: "🐶", house: "🏠", water: "💧",
  food: "🍲", sun: "☀️", moon: "🌙", star: "⭐", tree: "🌳", flower: "🌸",
  mother: "👩", father: "👨", child: "👶", school: "🏫", friend: "🤝", happy: "😊",
  big: "🐘", small: "🐭", red: "🔴", blue: "🔵", green: "🟢", white: "⚪",
  black: "⚫", one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣", five: "5️⃣",
  eat: "🍽️", drink: "🥤", sleep: "😴", run: "🏃", walk: "🚶", read: "📚",
  write: "✍️", play: "🎮", love: "❤️", good: "👍", bad: "👎", hot: "🔥",
  cold: "❄️", day: "☀️", night: "🌃", hand: "✋", eye: "👁️", ear: "👂",
  nose: "👃", mouth: "👄",

  // Level 2
  money: "💵", family: "👨‍👩‍👧‍👦", health: "🏥", work: "💼", travel: "✈️", dream: "💭",
  success: "🏆", future: "🚀", study: "📖", beautiful: "✨", important: "⚠️", together: "🤝",
  always: "♾️", never: "🚫", morning: "🌅", evening: "🌇", market: "🛒", savings: "🏦",
  budget: "📊", goal: "🎯", teacher: "👩‍🏫", student: "🧑‍🎓", hospital: "🏥", doctor: "🩺",
  street: "🛣️", city: "🏙️", village: "🏡", mountain: "🏔️", river: "🏞️", sky: "🌌",
  rain: "🌧️", snow: "❄️", wind: "💨", summer: "☀️", winter: "❄️", spring: "🌱",
  autumn: "🍂", bread: "🍞", milk: "🥛", egg: "🥚", meat: "🥩", vegetable: "🥕",
  fruit: "🍎", chair: "🪑", table: "🪵", window: "🪟", door: "🚪", floor: "🪵",
  wall: "🧱", roof: "🏠",

  // Level 3
  achievement: "🏆", responsibility: "⚖️", opportunity: "🔑", environment: "🌍", investment: "📈",
  management: "👔", education: "🎓", experience: "🧠", knowledge: "📚", patience: "⏳",
  confidence: "💪", discipline: "📅", creativity: "🎨", prosperity: "🌾", gratitude: "🙏",
  perseverance: "🏔️", dedication: "❤️", inspiration: "💡", determination: "✊", excellence: "⭐",
  entrepreneur: "💼", innovation: "💡", collaboration: "🤝", communication: "💬", leadership: "👑",
  strategy: "🗺️", motivation: "🔥", productivity: "⚡", sustainability: "♻️", transparency: "🔍",
  integrity: "🤝", resilience: "🌱", empathy: "🫶", curiosity: "🧐", flexibility: "🤸",
  accountability: "📝", mindfulness: "🧘", ambition: "🎯", courage: "🦁", wisdom: "🦉",
  generosity: "🎁", humility: "🙇", loyalty: "🐕", sincerity: "🤍", compassion: "💖",
  diligence: "🐝", punctuality: "⏰", adaptability: "🦎", professionalism: "🎓"
};

// ── SO'ZLAR BAZASI (har darajada 50 ta) ────────────────────
export const WORDS = {
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

export const LEVELS = [
  { id:1, name:"Boshlang'ich", color:"#22c55e", baseCoins:3,  wordsPerSession:10 },
  { id:2, name:"O'rta",        color:"#f59e0b", baseCoins:5,  wordsPerSession:10 },
  { id:3, name:"Yuqori",       color:"#8b5cf6", baseCoins:7,  wordsPerSession:10 },
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

const getAutoDesc = (coins, pul, isKidRole, t) => {
  if (!coins || !pul) return "";
  const cleanPul = Number(String(pul).replace(/\D/g, ""));
  const formattedPul = formatInputSum(cleanPul);
  return t(isKidRole ? "b_autoDescKid" : "b_autoDescParent", { coins, pul: formattedPul });
};

export default function BilimBozor({ user, lg="uz", onBack, dark, oila, azolar, embedded=false, gameTitle, initialLevel }) {
  const { xar, setXar, dar, setDar, setKidBalances, vazifalar, setVazifalar } = useApp();
  const lastAutoDescRef = useRef("");
  const isKid  = user?.rol === "kid";
  const isBosh = user?.rol === "bosh" || user?.rol === "azo";
  const oilaId = user?.oilaId;
  const { t } = useTranslation("bilimbozor");
  const th = dark ? PALETTE.dark : PALETTE.light;

  const [tab, setTab]               = useState(embedded ? "oyin" : "bozor");
  const [offers, setOffers]         = useState([]);
  const [showAddV, setShowAddV]     = useState(false);
  const [vCoins, setVCoins]         = useState("");
  const [vPul, setVPul]             = useState("");
  const [vDesc, setVDesc]           = useState("");
  const [vKidId, setVKidId]         = useState("");
  const [vParentId, setVParentId]   = useState("all");

  // O'yin
  const [level, setLevel]           = useState(() => initialLevel || 1);
  const [bilimCoins, setBilimCoins] = useState(0);
  // wordStats: { [word_en]: seenCount }
  const [wordStats, setWordStats]   = useState({});
  const [sessionWords, setSessionWords] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(() => !!initialLevel);
  const [curIdx, setCurIdx]         = useState(0);
  const [choices, setChoices]       = useState([]);
  const [selected, setSelected]     = useState(null);
  const [isCorrect, setIsCorrect]   = useState(null);
  const [sessionScore, setSessionScore] = useState({ right:0, wrong:0, earned:0 });
  const [showResult, setShowResult] = useState(false);
  const [flyCoins, setFlyCoins]     = useState([]);
  const [streak, setStreak]         = useState(0);
  const [loading, setLoading]       = useState(false);
  
  const [counteringOfferId, setCounteringOfferId] = useState(null);
  const [counterCoins, setCounterCoins]           = useState("");
  const [counterPul, setCounterPul]               = useState("");

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
    const vC = db.gCache("bilim_offer_" + oilaId);
    const bcC = db.gCache("bilim_coins_" + user?.id);
    const wsC = db.gCache("bilim_stats_" + user?.id);
    const stC = db.gCache("bilim_correct_streak_" + user?.id);
    const sessC = db.gCache("bilim_games_" + user?.id);

    if (vC) setOffers(vC);
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
        db.g("bilim_offer_" + oilaId),
        db.g("bilim_coins_" + user?.id),
        db.g("bilim_stats_" + user?.id),
        db.g("bilim_correct_streak_" + user?.id),
        db.g("bilim_games_" + user?.id),
      ]);
      if (v)        setOffers(v);
      if (bc!=null) setBilimCoins(bc);
      const wsObj = ws || {};
      if (ws)       setWordStats(wsObj);
      if (st!=null) setStreak(st);
      if (sess)     setSessions(Array.isArray(sess) ? sess : []);
      
      if (initialLevel && (initialLevel === 1 || initialLevel === 2 || initialLevel === 3)) {
        const allWords = WORDS[initialLevel] || WORDS[1];
        const sorted = [...allWords].sort((a,b) => {
          const sa = wsObj[a.en] || 0;
          const sb = wsObj[b.en] || 0;
          return sa - sb; // kam ko'rilgan birinchi
        });
        const session = sorted.slice(0, 10);
        setLevel(initialLevel);
        setSessionWords(session);
        setCurIdx(0);
        setSelected(null);
        setIsCorrect(null);
        setSessionScore({right:0, wrong:0, earned:0});
        setShowResult(false);
        
        const word = session[0];
        if (word) {
          const wrong = shuffle(allWords.filter(w => w.en !== word.en)).slice(0,3).map(w => w.uz);
          setChoices(shuffle([word.uz, ...wrong]));
        }
        setIsInitialLoading(false);
      }

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
    const currentAuto = getAutoDesc(vCoins, vPul, isKid, t);
    const isCurrentlyEmptyOrAuto = !vDesc ||
      vDesc === lastAutoDescRef.current ||
      vDesc === t("b075");

    if (isCurrentlyEmptyOrAuto) {
      setVDesc(currentAuto);
      lastAutoDescRef.current = currentAuto;
    }
  }, [vCoins, vPul, isKid, t]);

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
        db.s("bilim_correct_streak_" + user.id, newStreak),
      ]);
    } else {
      setStreak(0);
      setSessionScore(prev => ({...prev, wrong: prev.wrong+1}));
      await db.s("bilim_correct_streak_" + user.id, 0);
    }

    setTimeout(() => {
      const next = curIdx + 1;
      if (next >= sessionWords.length) {
        setShowResult(true);
        // Log daily activity session and automatically update daily study streak
        const finalRight = right ? sessionScore.right + 1 : sessionScore.right;
        const finalEarned = right ? sessionScore.earned + earned : sessionScore.earned;
        const finalTotal = sessionWords.length;
        const finalPct = Math.round((finalRight / finalTotal) * 100);
        logGameSession(user.id, {
          gameId: "vocab",
          correct: finalRight,
          total: finalTotal,
          pct: finalPct,
          seconds: 60,
          maxCombo: finalRight,
          coins: finalEarned,
          difficulty: level,
          newRecord: false
        }).catch(e => console.error(e));
      } else {
        setCurIdx(next);
        buildChoices(sessionWords, next, WORDS[level]||WORDS[1]);
      }
    }, 900);
  };

  // ── Yangi taklif qo'shish (addOffer) ──
  const addOffer = async () => {
    const coinsNum = Number(vCoins);
    const amountNum = Number(vPul.replace(/\D/g, ""));
    if (!coinsNum || !amountNum) {
      showMsg(t("b001"), "err");
      return;
    }

    const targetKidId = isKid ? user.id : vKidId;
    if (!targetKidId) {
      showMsg(t("b002"), "err");
      return;
    }
    const targetKidName = isKid ? (user.ism || t("b_kidFallback")) : ((azolar || []).find(k => k.id === vKidId)?.ism || t("b_kidFallback"));

    const newOffer = {
      id: Date.now(),
      kidId: targetKidId,
      kidName: targetKidName,
      fromRole: isKid ? "kid" : "parent",
      coins: coinsNum,
      amount: amountNum,
      status: "pending",
      counterOf: null,
      note: vDesc.trim() || "",
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    const updatedOffers = [newOffer, ...offers];
    setOffers(updatedOffers);
    await db.s("bilim_offer_" + oilaId, updatedOffers);

    // Notify recipient
    try {
      const adults = (azolar || []).filter(a => a.rol === "bosh" || a.rol === "azo");
      const uidsToNotify = isKid ? (vParentId === "all" ? adults.map(a => a.id) : [vParentId]) : [targetKidId];
      for (const uid of uidsToNotify) {
        await notifyFamily(
          uid,
          "bilim_offer",
          t("b003"),
          isKid
            ? t("b_notifyKidOffer", { kidName: targetKidName, coins: coinsNum, amount: amountNum.toLocaleString() })
            : t("b_notifyParentOffer", { coins: coinsNum, amount: amountNum.toLocaleString() }),
          { offerId: newOffer.id }
        );
      }
    } catch (e) {
      console.error("Failed to send notification:", e);
    }

    setShowAddV(false);
    setVCoins("");
    setVPul("");
    setVDesc("");
    showMsg(t("b004"));
  };

  // ── Taklifni qabul qilish (acceptOffer) ──
  const acceptOffer = async (off) => {
    try {
      // 1. Bolaning joriy coin balansini tekshirish
      const currentCoins = (await db.g("bilim_coins_" + off.kidId)) || 0;
      if (currentCoins < off.coins) {
        const errMsg = isKid 
          ? t("b005")
          : t("b_notEnoughKidCoins", { coins: currentCoins });
        showMsg(errMsg, "err");
        return;
      }

      // 2. Bolaning coin balansini kamaytirish
      const newCoins = currentCoins - off.coins;
      await db.s("bilim_coins_" + off.kidId, newCoins);
      if (isKid) {
        setBilimCoins(newCoins);
      }
      setKidsCoins(prev => ({ ...prev, [off.kidId]: newCoins }));

      // 3. Bolaning cho'ntak puliga so'mni qo'shish
      const kb = (await db.g("kidbal_" + oilaId)) || {};
      kb[off.kidId] = (kb[off.kidId] || 0) + off.amount;
      await db.s("kidbal_" + oilaId, kb);
      if (typeof setKidBalances === "function") {
        setKidBalances(kb);
      }

      // 4. Ota-onadan xarajat yozish (oilaviy byudjet uchun)
      const xItem = {
        id: Date.now(),
        kategoriya: "boshqa",
        summa: off.amount,
        izoh: t("b_expenseNote", { coins: off.coins }),
        sana: new Date().toISOString().slice(0, 10),
        vaqt: new Date().toTimeString().slice(0, 5),
        uid: user.id,
        repeat: false
      };
      const adultId = isBosh ? user.id : ((azolar || []).find(a => a.rol === "bosh" || a.rol === "azo")?.id || user.id);
      const xk = "x_" + oilaId + "_" + adultId;
      const currentXData = (await db.g(xk)) || [];
      await db.s(xk, [xItem, ...currentXData]);
      if (typeof setXar === "function") {
        setXar(prev => [xItem, ...prev]);
      }

      // 5. Taklif statusini "accepted" deb belgilash
      const updated = offers.map(o => {
        if (o.id === off.id) {
          return {
            ...o,
            status: "accepted",
            respondedAt: new Date().toISOString(),
            respondedBy: user.id
          };
        }
        return o;
      });
      setOffers(updated);
      await db.s("bilim_offer_" + oilaId, updated);

      showMsg(t("b006"));

      // Notify recipient
      try {
        const notifyTarget = isKid ? adultId : off.kidId;
        await notifyFamily(
          notifyTarget,
          "bilim_offer_accepted",
          t("b007"),
          t("b_notifyAccepted", { coins: off.coins, amount: off.amount.toLocaleString() })
        );
      } catch (e2) {
        console.error("Failed to notify acceptance:", e2);
      }
    } catch (e) {
      showMsg(t("b008"), "err");
    }
  };

  // ── Taklifni rad etish (rejectOffer) ──
  const rejectOffer = async (off) => {
    try {
      const updated = offers.map(o => {
        if (o.id === off.id) {
          return {
            ...o,
            status: "rejected",
            respondedAt: new Date().toISOString(),
            respondedBy: user.id
          };
        }
        return o;
      });
      setOffers(updated);
      await db.s("bilim_offer_" + oilaId, updated);
      showMsg(t("b009"));

      // Notify recipient
      try {
        const recipient = off.createdBy;
        await notifyFamily(
          recipient,
          "bilim_offer_rejected",
          t("b010"),
          t("b_notifyRejected", { coins: off.coins, amount: off.amount.toLocaleString() })
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      showMsg(t("b008"), "err");
    }
  };

  // ── Qarshi taklif yuborish (submitCounterOffer) ──
  const submitCounterOffer = async (off) => {
    try {
      const coinsNum = Number(counterCoins);
      const amountNum = Number(counterPul.replace(/\D/g, ""));
      if (!coinsNum || !amountNum) {
        showMsg(t("b001"), "err");
        return;
      }

      const counterOffer = {
        id: Date.now(),
        kidId: off.kidId,
        kidName: off.kidName,
        fromRole: isKid ? "kid" : "parent",
        coins: coinsNum,
        amount: amountNum,
        status: "pending",
        counterOf: off.id,
        note: t("b_counterNote"),
        createdAt: new Date().toISOString(),
        createdBy: user.id
      };

      const updated = offers.map(o => {
        if (o.id === off.id) {
          return {
            ...o,
            status: "countered",
            respondedAt: new Date().toISOString(),
            respondedBy: user.id
          };
        }
        return o;
      });

      const finalOffers = [counterOffer, ...updated];
      setOffers(finalOffers);
      await db.s("bilim_offer_" + oilaId, finalOffers);

      setCounteringOfferId(null);
      setCounterCoins("");
      setCounterPul("");
      showMsg(t("b011"));

      // Notify recipient
      try {
        const recipient = off.createdBy;
        await notifyFamily(
          recipient,
          "bilim_offer_countered",
          t("b012"),
          t("b_notifyCountered", { coins: coinsNum, amount: amountNum.toLocaleString() })
        );
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      showMsg(t("b008"), "err");
    }
  };

  const curWord = sessionWords[curIdx];
  const curLvl = LEVELS.find(l => l.id===level);
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
          title={embedded ? (gameTitle || t("b013")) : t("b014")} 
          onBack={onBack} 
          right={!embedded && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: th.am + "18", border: "1px solid " + th.am + "44", padding: "6px 12px", borderRadius: 12 }}>
              {BIco.coin(th.am, 16)}
              <span style={{ fontSize: 13, fontWeight: 800, color: th.t1 }}>
                {bilimCoins} {t("b015")}
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
              { id: "bozor", label: t("b016") },
              { id: "natija", label: t("b017") }
            ].map(tabItem => {
              const isSel = tab === tabItem.id;
              return (
                <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
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
                  {tabItem.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ O'YIN ══════════════════════════════════════ */}
      {tab==="oyin" && (
        <div style={{flex:1,padding:"16px",overflow:"auto"}}>

          {/* Daraja tanlash */}
          {isInitialLoading && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div className="skeleton" style={{ height: 180, borderRadius: 24, marginBottom: 20 }} />
              <div className="skeleton" style={{ height: 50, borderRadius: 16, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 50, borderRadius: 16 }} />
            </div>
          )}

          {sessionWords.length===0 && !showResult && !isInitialLoading && (
            <div style={{animation:"slideUp .35s ease"}}>
              <div style={{fontSize:15,fontWeight:800,color:dark?"#f1f5f9":"#1e293b",marginBottom:14,textAlign:"center"}}>
                {t("b018")}
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
                      <div style={{fontSize:15,fontWeight:800,color:dark?"#f1f5f9":"#1e293b"}}>{t("level_" + lvl.id)}</div>
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
                      {seen===0 && <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.star("#22c55e",12)} {t("b019")}</span>}
                      {seen===1 && <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.fire("#f59e0b",12)} {t("b020")}</span>}
                      {seen>1 && <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.fire("#ef4444",12)} {t("b021")}</span>}
                      <span style={{color:seen===0?"#22c55e":seen===1?"#f59e0b":"#ef4444",display:"inline-flex",alignItems:"center",gap:2}}>+{coinAmt} {BIco.coin(seen===0?"#22c55e":seen===1?"#f59e0b":"#ef4444", 12)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* So'z kartasi */}
              <div style={{background:`linear-gradient(135deg,${curLvl?.color}22,${curLvl?.color}0a)`,border:`2px solid ${curLvl?.color}44`,borderRadius:24,padding:"24px 20px",textAlign:"center",marginBottom:18}}>
                <div style={{fontSize:64,marginBottom:12,filter:"drop-shadow(0 4px 6px rgba(0,0,0,0.12))", animation: "bounce 2s infinite ease-in-out"}}>{WORD_EMOJIS[curWord.en.toLowerCase()] || "📝"}</div>
                <div style={{fontSize:11,fontWeight:700,color:dark?"#94a3b8":"#64748b",letterSpacing:2,marginBottom:4}}>ENGLISH</div>
                <div style={{fontSize:34,fontWeight:900,color:dark?"#f1f5f9":"#1e293b",letterSpacing:1}}>{curWord.en}</div>
                {streak>2 && <div style={{marginTop:8,fontSize:13,color:"#f59e0b",fontWeight:700,animation:"pulse 1s ease-in-out infinite",display:"inline-flex",alignItems:"center",gap:4}}>{BIco.fire("#f59e0b",14)} {streak} {t("b022")}</div>}
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
                {t("b023")}
              </div>
              <div style={{fontSize:15,color:dark?"#94a3b8":"#64748b",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.check("#22c55e", 14)} {sessionScore.right} {t("b_correctSession")}</span>
                <span>/</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.cross("#ef4444", 14)} {sessionScore.wrong} {t("b024")}</span>
              </div>
              <div style={{background:`linear-gradient(135deg,${curLvl?.color}22,${curLvl?.color}0a)`,border:`2px solid ${curLvl?.color}44`,borderRadius:20,padding:"18px",marginBottom:20}}>
                <div style={{fontSize:13,color:dark?"#94a3b8":"#64748b"}}>{t("b025")}</div>
                <div style={{fontSize:30,fontWeight:900,color:"#f59e0b",margin:"6px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>+{sessionScore.earned} {BIco.coin("#f59e0b", 24)}</div>
                <div style={{fontSize:13,color:dark?"#64748b":"#94a3b8",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{t("b026")} {bilimCoins} {BIco.coin("#64748b", 12)}</div>
                {sessionScore.right>0 && (
                  <div style={{fontSize:12,color:dark?"#64748b":"#94a3b8",marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    {BIco.info("#3b82f6", 12)} {t("b027")}
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setSessionWords([])} style={{flex:1,padding:"14px",borderRadius:16,border:"none",background:dark?"#334155":"#f1f5f9",color:dark?"#94a3b8":"#64748b",fontWeight:700,fontSize:15,cursor:"pointer"}}>
                  {t("b028")}
                </button>
                <button onClick={()=>startSession(level)} style={{flex:1,padding:"14px",borderRadius:16,border:"none",background:`linear-gradient(135deg,${curLvl?.color},${curLvl?.color}cc)`,color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  {BIco.fire("#fff", 14)} {t("b029")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ BOZOR ══════════════════════════════════════ */}
      {tab==="bozor" && (
        <div style={{flex:1,padding:"0 16px 16px",overflow:"auto"}}>
          {/* Bozor Intro Header */}
          <div style={{
            background: th.ac + "0d",
            border: `1.5px solid ${th.ac}33`,
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: th.t2,
            lineHeight: 1.6,
            display: "flex",
            alignItems: "flex-start",
            gap: 10
          }}>
            <span style={{ display: "inline-flex", marginTop: 2 }}>{BIco.info(th.ac, 18)}</span>
            <div>
              <strong style={{ display: "block", color: th.t1, marginBottom: 4, fontSize: 14 }}>
                {t("b030")}
              </strong>
              <span>
                {isKid ? t("b031") : t("b032")}
              </span>
            </div>
          </div>

          {/* Coin Status Indicator */}
          <div style={{
            background: th.sur,
            border: `1.5px solid ${th.bor}`,
            borderRadius: 16,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {BIco.user(th.ac, 18)}
              <span style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>
                {isKid ? t("b033") : t("b034")}
              </span>
            </div>
            {isKid ? (
              <span style={{ fontSize: 16, fontWeight: 800, color: th.am, display: "inline-flex", alignItems: "center", gap: 4 }}>
                {BIco.coin(th.am, 16)} {bilimCoins}
              </span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                {kids.map(k => (
                  <span key={k.id} style={{ fontSize: 13, color: th.t2 }}>
                    {k.ism}: <strong style={{ color: th.am }}>{kidsCoins[k.id] ?? 0} {BIco.coin(th.am, 12)}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* New Offer Button */}
          <button onClick={() => { setShowAddV(true); if (kids.length > 0 && !vKidId) setVKidId(kids[0].id); }}
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
            {BIco.plus(th.ac, 18)} {isKid ? t("b_sendOfferKid") : t("b_sendOfferParent")}
          </button>

          {/* Filter offers for parent / kid */}
          {(() => {
            const visibleOffers = isKid 
              ? offers.filter(o => o.kidId === user.id)
              : offers;

            if (visibleOffers.length === 0) {
              return (
                <div style={{textAlign:"center",padding:"40px 20px",color:th.t3}}>
                  <div style={{marginBottom:10,display:"flex",justifyContent:"center"}}>{BIco.empty(th.bor, 48)}</div>
                  <div style={{fontSize:14, fontWeight: 600}}>{t("b035")}</div>
                  <div style={{fontSize:12,marginTop:6, color: th.t2}}>{t("b036")}</div>
                </div>
              );
            }

            return (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {visibleOffers.map(off => {
                  const isIncoming = (isKid && off.fromRole === "parent") || (isBosh && off.fromRole === "kid");
                  const isPending = off.status === "pending";
                  const dateStr = off.createdAt ? new Date(off.createdAt).toLocaleDateString() : "";
                  
                  // For styling status badges
                  let statusColor = th.t2;
                  let statusBg = th.bg;
                  let statusLabel = off.status;

                  if (off.status === "pending") {
                    statusColor = "#f59e0b";
                    statusBg = "#f59e0b12";
                    statusLabel = t("b037");
                  } else if (off.status === "accepted") {
                    statusColor = "#10b981";
                    statusBg = "#10b98112";
                    statusLabel = t("b038");
                  } else if (off.status === "rejected") {
                    statusColor = "#ef4444";
                    statusBg = "#ef444412";
                    statusLabel = t("b039");
                  } else if (off.status === "countered") {
                    statusColor = "#3b82f6";
                    statusBg = "#3b82f612";
                    statusLabel = t("b_counterStatus");
                  }

                  return (
                    <div key={off.id} style={{
                      background: th.sur,
                      border: `1.5px solid ${isPending ? th.ac + "44" : th.bor}`,
                      borderRadius: 16,
                      padding: "16px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10
                    }}>
                      {/* Top Row: Sender & Status Badge */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {BIco.user(th.t2, 14)}
                          <span style={{ fontSize: 12, color: th.t2, fontWeight: 600 }}>
                            {isKid 
                              ? (off.fromRole === "parent" ? t("b040") : t("b041"))
                              : (off.fromRole === "kid" ? t("b_offerFromKid", { kidName: off.kidName }) : t("b_offerToKid", { kidName: off.kidName }))
                            }
                          </span>
                        </div>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 8,
                          padding: "3px 8px",
                          background: statusBg,
                          color: statusColor,
                          border: `1.5px solid ${statusColor}44`
                        }}>
                          {statusLabel}
                        </span>
                      </div>

                      {/* Middle Row: Trade Details */}
                      <div style={{
                        background: th.bg,
                        borderRadius: 12,
                        padding: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-around",
                        border: `1px solid ${th.bor}`
                      }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: th.t2, marginBottom: 4 }}>{t("b042")}</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: th.am, display: "flex", alignItems: "center", gap: 4 }}>
                            {BIco.coin(th.am, 16)} {off.coins} Coin
                          </div>
                        </div>
                        <span style={{ fontSize: 18, color: th.t3 }}>➔</span>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: th.t2, marginBottom: 4 }}>{t("b043")}</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: th.gr }}>
                            {off.amount.toLocaleString()} {t("b_currency")}
                          </div>
                        </div>
                      </div>

                      {/* Display optional description note */}
                      {off.note && (
                        <div style={{ fontSize: 12, color: th.t2, background: th.bg, padding: "8px 12px", borderRadius: 8, fontStyle: "italic" }}>
                          {off.note}
                        </div>
                      )}

                      {/* Date details */}
                      <div style={{ fontSize: 10, color: th.t3, display: "flex", justifyContent: "space-between" }}>
                        <span>ID: {off.id}</span>
                        <span>{dateStr}</span>
                      </div>

                      {/* Action buttons if pending and incoming */}
                      {isPending && isIncoming && (
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <button onClick={() => rejectOffer(off)}
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: 12,
                              border: `1.5px solid ${th.rd}44`,
                              background: "transparent",
                              color: th.rd,
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            {t("b044")}
                          </button>
                          
                          <button onClick={() => {
                            setCounteringOfferId(off.id);
                            setCounterCoins(off.coins.toString());
                            setCounterPul(off.amount.toString());
                          }}
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: 12,
                              border: `1.5px solid ${th.ac}44`,
                              background: "transparent",
                              color: th.ac,
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            {t("b045")}
                          </button>

                          <button onClick={() => acceptOffer(off)}
                            style={{
                              flex: 1.5,
                              padding: "10px",
                              borderRadius: 12,
                              border: "none",
                              background: `linear-gradient(135deg, ${th.gr}, #059669)`,
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: 13,
                              cursor: "pointer",
                              transition: "all 0.2s",
                              boxShadow: "0 2px 6px rgba(16,185,129,0.2)"
                            }}
                          >
                            {t("b046")}
                          </button>
                        </div>
                      )}

                      {/* Waiting message for pending outgoing offers */}
                      {isPending && !isIncoming && (
                        <div style={{
                          textAlign: "center",
                          fontSize: 12,
                          color: th.t2,
                          background: th.bg,
                          padding: "8px",
                          borderRadius: 10,
                          border: `1px solid ${th.bor}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6
                        }}>
                          <span style={{ display: "inline-flex", animation: "pulse 1.5s infinite" }}>{BIco.star(th.ac, 12)}</span>
                          {t("b047")}
                        </div>
                      )}

                      {/* Interactive Counter-Offer inline fields */}
                      {counteringOfferId === off.id && (
                        <div style={{
                          marginTop: 8,
                          padding: "12px",
                          background: th.bg,
                          border: `1.5px solid ${th.ac}44`,
                          borderRadius: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          animation: "slideDown 0.2s ease"
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: th.t1 }}>
                            {t("b048")}
                          </div>
                          
                          <div style={{ display: "flex", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: 10, color: th.t2, display: "block", marginBottom: 4 }}>{t("b049")}</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={counterCoins}
                                onChange={e => setCounterCoins(e.target.value.replace(/\D/g, ""))}
                                style={{
                                  width: "100%",
                                  padding: "8px 10px",
                                  borderRadius: 8,
                                  border: `1px solid ${th.bor}`,
                                  background: th.sur,
                                  color: th.t1,
                                  fontSize: 13,
                                  outline: "none",
                                  boxSizing: "border-box"
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: 10, color: th.t2, display: "block", marginBottom: 4 }}>{t("b050")}</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={counterPul}
                                onChange={e => {
                                  const raw = e.target.value.replace(/\D/g, "");
                                  setCounterPul(formatInputSum(raw));
                                }}
                                style={{
                                  width: "100%",
                                  padding: "8px 10px",
                                  borderRadius: 8,
                                  border: `1px solid ${th.bor}`,
                                  background: th.sur,
                                  color: th.t1,
                                  fontSize: 13,
                                  outline: "none",
                                  boxSizing: "border-box"
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                            <button onClick={() => setCounteringOfferId(null)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "none",
                                background: th.bor,
                                color: th.t2,
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: "pointer"
                              }}
                            >
                              {t("b051")}
                            </button>
                            <button onClick={() => submitCounterOffer(off)}
                              style={{
                                padding: "6px 16px",
                                borderRadius: 8,
                                border: "none",
                                background: th.ac,
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: 12,
                                cursor: "pointer"
                              }}
                            >
                              {t("b052")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════ NATIJA ══════════════════════════════════════ */}
      {tab==="natija" && (() => {
        const kidName = user?.ism || t("b_kidFallback");
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
                kidYearStats[kId] = { kidName: v.kidName || t("b_kidFallback"), coins: 0, money: 0 };
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
                <div style={{display:"flex", justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <span style={{fontSize:15,fontWeight:800,color:dark?"#f1f5f9":"#1e293b",display:"flex",alignItems:"center",gap:6}}>{BIco.chart("#3b82f6", 16)} {t("b053")}</span>
                  <button onClick={()=>setTab("bozor")}
                    style={{display:"flex",alignItems:"center",gap:6,background:dark?"#1e293b":"#fff",border:`1.5px solid ${dark?"#334155":"#cbd5e1"}`,borderRadius:12,padding:"6px 12px",fontSize:12,fontWeight:700,color:"#3b82f6",cursor:"pointer"}}>
                    {BIco.store("#3b82f6", 14)} {t("b054")}
                  </button>
                </div>

                {/* Coin purchase stats card for parents */}
                <div style={{background: dark ? "#1e293b" : "#fff", border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`, borderRadius: 18, padding: "16px", marginBottom: 16}}>
                  <div style={{fontSize: 14, fontWeight: 800, color: th.t1, marginBottom: 12, display: "flex", alignItems: "center", gap: 6}}>
                    {BIco.store(th.ac, 16)} {t("b055")}
                  </div>
                  
                  {/* Hafta, Oy, Yil grid */}
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14}}>
                    {[
                      { label: t("b056"), coins: purchaseStats.week.coins, money: purchaseStats.week.money },
                      { label: t("b057"), coins: purchaseStats.month.coins, money: purchaseStats.month.money },
                      { label: t("b058"), coins: purchaseStats.year.coins, money: purchaseStats.year.money }
                    ].map((item, idx) => (
                      <div key={idx} style={{textAlign: "center", background: th.bg, borderRadius: 12, padding: "10px", border: `1px solid ${th.bor}`}}>
                        <div style={{fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 4}}>{item.label}</div>
                        <div style={{fontSize: 12, fontWeight: 800, color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", gap: 2}}>
                          {item.coins} {BIco.coin("#f59e0b", 10)}
                        </div>
                        <div style={{fontSize: 11, fontWeight: 700, color: th.gr, marginTop: 2}}>
                          {item.money.toLocaleString()} {t("b_currency")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Kids year summary text */}
                  <div style={{borderTop: `1px solid ${th.bor}`, paddingTop: 12}}>
                    {purchaseStats.kids.length === 0 ? (
                      <div style={{fontSize: 12, color: th.t3, textAlign: "center"}}>
                        {t("b059")}
                      </div>
                    ) : (
                      <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                        {purchaseStats.kids.map((kStat, idx) => (
                          <div key={idx} style={{fontSize: 12, color: th.t2, lineHeight: "1.4", background: th.bg, padding: "8px 12px", borderRadius: 10}}>
                            🏆 {t("b_yearSummary", { kidName: kStat.kidName, coins: kStat.coins, money: kStat.money.toLocaleString() })}
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
                {label:t("b_bilimCoinLabel"), val:bilimCoins, ico:BIco.coin("#f59e0b", 28), color:"#f59e0b"},
                {label:t("b060"), val:sessions.length, ico:BIco.book("#3b82f6", 28), color:"#3b82f6"},
                {label:t("b061"), val:streak, ico:BIco.fire("#ef4444", 28), color:"#ef4444"},
                {label:t("b062"), val:vazifalar.filter(v=>v.uid===user?.id&&v.paid).length, ico:BIco.check("#22c55e", 28), color:"#22c55e"},
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
                {BIco.chart(th.ac, 16)} {t("b063")}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div style={{textAlign:"center",background:th.bg,borderRadius:12,padding:"10px"}}>
                  <div style={{fontSize:16,fontWeight:900,color:th.ac}}>{weekReport.games}</div>
                  <div style={{fontSize:10,color:th.t2}}>{t("b064")}</div>
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
                {BIco.game(th.ac, 16)} {t("b065")}
              </div>
              
              {sessions.length === 0 ? (
                <div style={{textAlign:"center",padding:"24px 10px",color:th.t3}}>
                  {BIco.empty(th.t3, 32)}
                  <div style={{fontSize:12,marginTop:8}}>{t("b066")}</div>
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
                          <div style={{fontSize:12,fontWeight:800,color:th.gr}}>{s.pct}% {t("b_correctPct")}</div>
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
              {BIco.plus(th.ac, 16)} {isKid ? t("b067") : t("b068")}
            </div>

            {/* Target parent selection chip row if user is kid */}
            {isKid && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: th.t2, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  {BIco.user(th.t2, 12)} {t("b069")}
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
                    {t("b070")}
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
                <div style={{fontSize:12,fontWeight:700,color:th.t2,marginBottom:6,display:"flex",alignItems:"center",gap:4}}>{BIco.user(th.t2, 12)} {t("b071")}</div>
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
              <div style={{fontSize:12,fontWeight:700,color:th.t2,marginBottom:4}}>{t("b072")}</div>
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
              <div style={{fontSize:12,fontWeight:700,color:th.t2,marginBottom:4}}>{t("b073")}</div>
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
              <div style={{fontSize:12,fontWeight:700,color:th.t2,marginBottom:4}}>{t("b074")}</div>
              <input 
                value={vDesc} 
                onChange={e => setVDesc(e.target.value)} 
                type="text" 
                placeholder={t("b075")}
                style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${th.bor}`,background:th.bg,color:th.t1,fontSize:15,outline:"none",boxSizing:"border-box"}}
              />
            </div>
            {vCoins && vPul && (
              <div style={{background:th.gr+"18",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:13,color:th.gr,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                {BIco.target(th.gr, 14)} {t("b_previewReward", { coins: vCoins, amount: vPul })}
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowAddV(false)} style={{flex:1,padding:"13px",borderRadius:14,border:"none",background:th.bor,color:th.t2,fontWeight:700,cursor:"pointer"}}>
                {t("b051")}
              </button>
              <button onClick={addOffer} style={{flex:1,padding:"13px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${th.ac},${th.ac2})`,color:"#fff",fontWeight:800,cursor:"pointer"}}>
                {isKid ? t("b_sendKid") : t("b_sendParent")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
