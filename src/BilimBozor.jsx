import { useState, useEffect, useRef } from "react";
import { db } from "./firebase.js";
import { td, nt, f } from "./utils/formatters.js";

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

export default function BilimBozor({ user, lg="uz", onBack, dark, oila, azolar, embedded=false, gameTitle }) {
  const isKid  = user?.rol === "kid";
  const isBosh = user?.rol === "bosh" || user?.rol === "azo";
  const oilaId = user?.oilaId;
  const L = (uz, ru=uz) => lg==="ru" ? ru : uz;

  const [tab, setTab]               = useState(embedded ? "oyin" : (isKid ? "oyin" : "bozor"));
  const [vazifalar, setVazifalar]   = useState([]);
  const [showAddV, setShowAddV]     = useState(false);
  const [vCoins, setVCoins]         = useState("");
  const [vPul, setVPul]             = useState("");
  const [vDesc, setVDesc]           = useState("");
  const [vKidId, setVKidId]         = useState("");

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
  const [loading, setLoading]       = useState(true);

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
    loadAll();
  }, [oilaId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [v, bc, ws, st] = await Promise.all([
        db.g("bilim_vazifa_" + oilaId),
        db.g("bilim_coins_" + user?.id),
        db.g("bilim_stats_" + user?.id),
        db.g("bilim_streak_" + user?.id),
      ]);
      if (v)        setVazifalar(v);
      if (bc!=null) setBilimCoins(bc);
      if (ws)       setWordStats(ws);
      if (st!=null) setStreak(st);
      // Default kid tanlash
      const kids = (azolar||[]).filter(a => a.rol==="kid");
      if (kids.length > 0) setVKidId(kids[0].id);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

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
    const active = vazifalar.filter(v => v.uid===user.id && !v.done);
    if (active.length===0) return;
    for (const v of active) {
      if (currentCoins >= v.targetCoins) {
        const upd = vazifalar.map(vz =>
          vz.id===v.id ? {...vz, done:true, doneSana:new Date().toISOString().slice(0,10)} : vz
        );
        setVazifalar(upd);
        await db.s("bilim_vazifa_" + oilaId, upd);
        showMsg(L("🎉 Vazifa bajarildi! Ota-ona tasdiqlaydi.", "🎉 Задание выполнено!"));
      }
    }
  };

  // ── Vazifa qo'shish (ota-ona balansidan kamayadi) ──
  const addVazifa = async () => {
    if (!vCoins || !vPul || Number(vCoins)<=0 || Number(vPul)<=0)
      return showMsg(L("❌ Maydonlarni to'ldiring","❌ Заполните поля"), "err");
    if (!vKidId)
      return showMsg(L("❌ Bola tanlang","❌ Выберите ребёнка"), "err");

    // Ota/ona balansini tekshirish (dar - xar)
    // Bu funksiya App.jsx dan props sifatida kelib tushishi kerak bo'lsa ham,
    // biz Firebase dan o'qiymiz
    const reward = Number(vPul);

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

  // ── Vazifani to'lash — bola balansiga, ota/ona balansidan ──
  const payVazifa = async (v) => {
    try {
      // Bolaning bilim coin balansini noldan boshlash (to'landi)
      const kidBilim = (await db.g("bilim_coins_" + v.uid)) || 0;
      // Bolaning cho'ntak pulini oshirish
      const kidPul = (await db.g("kid_bal_" + v.uid)) || 0;
      await db.s("kid_bal_" + v.uid, kidPul + v.reward);

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
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:dark?"#0f172a":"#f0f9ff"}}>
      <div style={{fontSize:14,color:dark?"#94a3b8":"#64748b"}}>⏳ Yuklanmoqda...</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:dark?"#0f172a":"#f0f9ff",display:"flex",flexDirection:"column",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
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
      <div style={{background:"linear-gradient(135deg,#1e40af,#3b82f6)",padding:"14px 18px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={onBack} style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:17,fontWeight:900,color:"#fff"}}>{embedded ? (gameTitle || L("So'z o'rgan","Учи слова")) : L("Bilim Bozori","Рынок знаний")}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",marginTop:2,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            {BIco.coin("#fff", 14)} {bilimCoins} {L("Bilim Coin","монет")}
            {streak>1 && <span style={{marginLeft:8,display:"inline-flex",alignItems:"center",gap:2}}>{BIco.fire("#ef4444", 12)} {streak}</span>}
          </div>
        </div>
        <div style={{width:38}}/>
      </div>

      {/* Tabs (embedded va ota-onalar rejimida yashiriladi — platforma navigatsiyasi tashqarida, ota-ona faqat bozorda) */}
      {!embedded && !isBosh && <div style={{display:"flex",background:dark?"#1e293b":"#fff",borderBottom:`2px solid ${dark?"#334155":"#e2e8f0"}`}}>
        {[
          {id:"oyin",   label:<span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.game(tab==="oyin"?"#3b82f6":dark?"#94a3b8":"#64748b",14)} {L("O'yin","Игра")}</span>},
          {id:"bozor",  label:<span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.store(tab==="bozor"?"#3b82f6":dark?"#94a3b8":"#64748b",14)} {L("Bozor","Рынок")}</span>},
          {id:"natija", label:<span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.chart(tab==="natija"?"#3b82f6":dark?"#94a3b8":"#64748b",14)} {L("Natija","Итоги")}</span>},
        ].map((t, idx) => {
          const ids = ["oyin", "bozor", "natija"];
          const currentId = ids[idx];
          return (
            <button key={currentId} onClick={()=>setTab(currentId)}
              style={{flex:1,padding:"12px 4px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:tab===currentId?800:500,color:tab===currentId?"#3b82f6":dark?"#94a3b8":"#64748b",borderBottom:tab===currentId?"3px solid #3b82f6":"3px solid transparent"}}>
              {t.label}
            </button>
          );
        })}
      </div>}

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
              <div style={{background:dark?"#1e293b":"#fff",borderRadius:20,height:7,overflow:"hidden"}}>
                <div style={{width:`${Math.min(100,(bilimCoins/myVazifaActive.targetCoins)*100)}%`,height:"100%",background:"linear-gradient(90deg,#f59e0b,#d97706)",borderRadius:20,transition:"width .4s"}}/>
              </div>
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
        <div style={{flex:1,padding:"16px",overflow:"auto"}}>
          {isBosh && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontSize:15,fontWeight:800,color:dark?"#f1f5f9":"#1e293b",display:"flex",alignItems:"center",gap:6}}>{BIco.store("#3b82f6", 16)} {L("Bozor do'koni","Рынок")}</span>
              <button onClick={()=>setTab("natija")}
                style={{display:"flex",alignItems:"center",gap:6,background:dark?"#1e293b":"#fff",border:`1.5px solid ${dark?"#334155":"#cbd5e1"}`,borderRadius:12,padding:"6px 12px",fontSize:12,fontWeight:700,color:"#3b82f6",cursor:"pointer"}}>
                {BIco.chart("#3b82f6", 14)} {L("Natijalar","Результаты")}
              </button>
            </div>
          )}

          <div style={{background:"linear-gradient(135deg,#1e40af15,#3b82f608)",border:"2px solid #3b82f633",borderRadius:16,padding:"12px 16px",marginBottom:14,fontSize:13,color:dark?"#93c5fd":"#1e40af",lineHeight:1.7,display:"flex",alignItems:"flex-start",gap:8}}>
            <span>{BIco.info("#3b82f6", 16)}</span>
            <span>
              {L(
                "Ota-ona 'Bilim Vazifasi' qo'shadi. Masalan: '200 Bilim Coin yig' = 50 000 so'm'. Bola coin yig'sa pul avtomatik tushadi!",
                "Родитель добавляет задание. Например: '200 монет = 50 000 сум'. Ребёнок копит — получает деньги!"
              )}
            </span>
          </div>

          {/* Ota-ona: bola tanlash + vazifa qo'shish */}
          {isBosh && (
            <>
              {kids.length>1 && (
                <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                  {kids.map(k => (
                    <button key={k.id} onClick={()=>setVKidId(k.id)}
                      style={{padding:"8px 16px",borderRadius:20,border:`2px solid ${vKidId===k.id?"#3b82f6":dark?"#334155":"#e2e8f0"}`,background:vKidId===k.id?"#3b82f622":"none",color:vKidId===k.id?"#3b82f6":dark?"#94a3b8":"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>{BIco.user(vKidId===k.id?"#fff":"#3b82f6", 12)} {k.ism}</span>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={()=>setShowAddV(true)}
                style={{width:"100%",padding:"15px",borderRadius:16,border:"2px dashed #3b82f6",background:"none",cursor:"pointer",fontSize:15,fontWeight:700,color:"#3b82f6",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:6}}>{BIco.plus("#3b82f6", 16)} {L("Yangi bilim vazifasi","Новое задание")}</span>
              </button>
            </>
          )}

          {/* Vazifalar */}
          {(isBosh ? vazifalar : vazifalar.filter(v=>v.uid===user?.id)).length===0 ? (
            <div style={{textAlign:"center",padding:"40px 20px",color:dark?"#64748b":"#94a3b8"}}>
              <div style={{marginBottom:10,display:"flex",justifyContent:"center"}}>{BIco.empty(dark?"#475569":"#cbd5e1", 48)}</div>
              <div style={{fontSize:14}}>{L("Hozircha vazifa yo'q","Заданий нет")}</div>
              {isKid && <div style={{fontSize:12,marginTop:8}}>{L("Ota-onangizdan vazifa so'rang","Попросите родителя добавить задание")}</div>}
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(isBosh ? vazifalar : vazifalar.filter(v=>v.uid===user?.id)).map(v => {
                const kidCoins = v.uid===user?.id ? bilimCoins : null;
                const progress = kidCoins!==null ? Math.min(100,(kidCoins/v.targetCoins)*100) : null;
                return (
                  <div key={v.id} style={{background:dark?"#1e293b":"#fff",border:`2px solid ${v.paid?"#22c55e":v.done?"#f59e0b":dark?"#334155":"#e2e8f0"}`,borderRadius:18,padding:"16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div style={{flex:1,fontSize:14,fontWeight:700,color:dark?"#f1f5f9":"#1e293b",paddingRight:8,display:"flex",alignItems:"center",gap:6}}>
                        {BIco.book("#3b82f6", 14)} {v.desc}
                      </div>
                      <div style={{flexShrink:0,fontSize:11,fontWeight:700,borderRadius:10,padding:"3px 8px",background:v.paid?"#22c55e22":v.done?"#f59e0b22":"transparent",color:v.paid?"#22c55e":v.done?"#f59e0b":"transparent",border:`1px solid ${v.paid?"#22c55e":v.done?"#f59e0b":"transparent"}`,display:"inline-flex",alignItems:"center",gap:4}}>
                        {v.paid ? <><span style={{display:"inline-flex"}}>{BIco.check("#22c55e", 10)}</span> {L("To'landi","Выплачено")}</> : v.done ? <><span style={{display:"inline-flex"}}>{BIco.fire("#f59e0b", 10)}</span> {L("Kutilmoqda","Ожидает")}</> : ""}
                      </div>
                    </div>
                    {isBosh && <div style={{fontSize:12,color:dark?"#94a3b8":"#64748b",marginBottom:6,display:"flex",alignItems:"center",gap:4}}>{BIco.user(dark?"#94a3b8":"#64748b", 12)} {v.kidName}</div>}
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:progress!==null&&!v.done?10:0}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#f59e0b",display:"inline-flex",alignItems:"center",gap:4}}>{BIco.coin("#f59e0b", 14)} {v.targetCoins} Coin</span>
                      <span style={{color:dark?"#475569":"#94a3b8"}}>→</span>
                      <span style={{fontSize:13,fontWeight:700,color:"#22c55e",display:"inline-flex",alignItems:"center",gap:4}}>{BIco.coin("#22c55e", 14)} {v.reward.toLocaleString()} so'm</span>
                    </div>
                    {progress!==null && !v.done && (
                      <>
                        <div style={{background:dark?"#0f172a":"#f1f5f9",borderRadius:20,height:7,overflow:"hidden",marginBottom:4}}>
                          <div style={{width:`${progress}%`,height:"100%",background:"#3b82f6",borderRadius:20,transition:"width .4s"}}/>
                        </div>
                        <div style={{fontSize:11,color:dark?"#64748b":"#94a3b8",display:"flex",alignItems:"center",gap:4}}>{bilimCoins}/{v.targetCoins} {BIco.coin(dark?"#64748b":"#94a3b8", 10)}</div>
                      </>
                    )}
                    {isBosh && v.done && !v.paid && (
                      <button onClick={()=>payVazifa(v)}
                        style={{marginTop:10,width:"100%",padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#22c55e,#15803d)",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        {BIco.coin("#fff", 14)} {L(`${v.reward.toLocaleString()} so'm to'lash`,`Выплатить ${v.reward.toLocaleString()} сум`)}
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
      {tab==="natija" && (
        <div style={{flex:1,padding:"16px",overflow:"auto"}}>
          {isBosh && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontSize:15,fontWeight:800,color:dark?"#f1f5f9":"#1e293b",display:"flex",alignItems:"center",gap:6}}>{BIco.chart("#3b82f6", 16)} {L("Bola natijalari","Результаты ребёнка")}</span>
              <button onClick={()=>setTab("bozor")}
                style={{display:"flex",alignItems:"center",gap:6,background:dark?"#1e293b":"#fff",border:`1.5px solid ${dark?"#334155":"#cbd5e1"}`,borderRadius:12,padding:"6px 12px",fontSize:12,fontWeight:700,color:"#3b82f6",cursor:"pointer"}}>
                {BIco.store("#3b82f6", 14)} {L("Bozorga qaytish","Назад в маркет")}
              </button>
            </div>
          )}

          {/* Umumiy */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {label:"Bilim Coin", val:bilimCoins, ico:BIco.coin("#f59e0b", 28), color:"#f59e0b"},
              {label:L("O'rganilgan","Изучено"), val:Object.keys(wordStats).length, ico:BIco.book("#3b82f6", 28), color:"#3b82f6"},
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

          {/* Daraja progressi */}
          <div style={{background:dark?"#1e293b":"#fff",border:`1px solid ${dark?"#334155":"#e2e8f0"}`,borderRadius:18,padding:"16px",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:dark?"#f1f5f9":"#1e293b",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
              {BIco.chart("#3b82f6", 16)} {L("Daraja progressi","Прогресс по уровням")}
            </div>
            {LEVELS.map(lvl => {
              const allW = WORDS[lvl.id]||[];
              const seen = allW.filter(w=>(wordStats[w.en]||0)>0).length;
              const mastered = allW.filter(w=>(wordStats[w.en]||0)>=3).length;
              return (
                <div key={lvl.id} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:700,color:dark?"#f1f5f9":"#1e293b",display:"inline-flex",alignItems:"center",gap:4}}>{lvl.id===1 ? BIco.leaf(lvl.color, 14) : lvl.id===2 ? BIco.star(lvl.color, 14) : BIco.trophy(lvl.color, 14)} {lvl.name}</span>
                    <span style={{fontSize:11,color:dark?"#64748b":"#94a3b8"}}>{seen}/{allW.length} ko'rildi · {mastered} o'rganildi</span>
                  </div>
                  <div style={{background:dark?"#0f172a":"#f1f5f9",borderRadius:20,height:8,overflow:"hidden",position:"relative"}}>
                    <div style={{width:`${(seen/allW.length)*100}%`,height:"100%",background:lvl.color+"88",borderRadius:20}}/>
                    <div style={{position:"absolute",top:0,left:0,width:`${(mastered/allW.length)*100}%`,height:"100%",background:lvl.color,borderRadius:20}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Eskirish tushuntirish */}
          <div style={{background:dark?"#1e293b":"#fff",border:`1px solid ${dark?"#334155":"#e2e8f0"}`,borderRadius:16,padding:"14px"}}>
            <div style={{fontSize:13,fontWeight:800,color:dark?"#f1f5f9":"#1e293b",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
              {BIco.info("#3b82f6", 16)} {L("Coin tizimi qanday ishlaydi?","Как работает система монет?")}
            </div>
            {[
              {ico:BIco.star("#22c55e", 18), label:L("Yangi so'z (birinchi marta)","Новое слово"), coins:"to'liq coin", color:"#22c55e"},
              {ico:BIco.fire("#f59e0b", 18), label:L("1 marta ko'rilgan","Видел 1 раз"),           coins:"60% coin",   color:"#f59e0b"},
              {ico:BIco.fire("#f97316", 18), label:L("2 marta ko'rilgan","Видел 2 раза"),          coins:"30% coin",   color:"#f97316"},
              {ico:BIco.fire("#ef4444", 18), label:L("3+ marta ko'rilgan","Видел 3+ раз"),         coins:"10% coin",   color:"#ef4444"},
            ].map((r,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<3?`1px solid ${dark?"#334155":"#f3f4f6"}`:"none"}}>
                <span style={{display:"inline-flex"}}>{r.ico}</span>
                <span style={{flex:1,fontSize:13,color:dark?"#cbd5e1":"#444"}}>{r.label}</span>
                <span style={{fontSize:13,fontWeight:800,color:r.color,background:r.color+"22",borderRadius:10,padding:"2px 10px"}}>{r.coins}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ VAZIFA QO'SHISH MODAL ══════════════════════ */}
      {showAddV && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowAddV(false)}>
          <div style={{background:dark?"#1e293b":"#fff",borderRadius:"28px 28px 0 0",padding:"24px 22px 40px",width:"100%"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:17,fontWeight:800,color:dark?"#f1f5f9":"#111",marginBottom:6,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              {BIco.plus("#3b82f6", 16)} {L("Bilim Vazifasi","Добавить задание")}
            </div>
            {kids.length>1 && (
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:dark?"#94a3b8":"#64748b",marginBottom:6,display:"flex",alignItems:"center",gap:4}}>{BIco.user(dark?"#94a3b8":"#64748b", 12)} {L("Bola tanlang","Выберите ребёнка")}</div>
                <div style={{display:"flex",gap:8}}>
                  {kids.map(k => (
                    <button key={k.id} onClick={()=>setVKidId(k.id)}
                      style={{padding:"8px 14px",borderRadius:20,border:`2px solid ${vKidId===k.id?"#3b82f6":dark?"#334155":"#e2e8f0"}`,background:vKidId===k.id?"#3b82f622":"none",color:vKidId===k.id?"#3b82f6":dark?"#94a3b8":"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                      {k.ism}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {[
              {label:L("Necha Bilim Coin yig'sin?","Сколько монет набрать?"), val:vCoins, set:setVCoins, type:"number", ph:"200"},
              {label:L("Mukofot (so'm)","Вознаграждение (сум)"), val:vPul, set:setVPul, type:"number", ph:"50000"},
              {label:L("Izoh (ixtiyoriy)","Описание (необязательно)"), val:vDesc, set:setVDesc, type:"text", ph:L("200 coin yig'","Набери 200 монет")},
            ].map((f,i) => (
              <div key={i} style={{marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:dark?"#94a3b8":"#64748b",marginBottom:4}}>{f.label}</div>
                <input value={f.val} onChange={e=>f.set(e.target.value)} type={f.type} placeholder={f.ph}
                  style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${dark?"#334155":"#e2e8f0"}`,background:dark?"#0f172a":"#f8fafc",color:dark?"#f1f5f9":"#1e293b",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            {vCoins && vPul && (
              <div style={{background:"#f0fdf4",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#15803d",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                {BIco.target("#15803d", 14)} {L(`Bola ${vCoins} yig'sa → ${Number(vPul).toLocaleString()} so'm oladi`,`Ребёнок наберёт ${vCoins} → получит ${Number(vPul).toLocaleString()} сум`)}
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowAddV(false)} style={{flex:1,padding:"13px",borderRadius:14,border:"none",background:dark?"#334155":"#f1f5f9",color:dark?"#94a3b8":"#666",fontWeight:700,cursor:"pointer"}}>
                {L("Bekor","Отмена")}
              </button>
              <button onClick={addVazifa} style={{flex:1,padding:"13px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#1e40af,#3b82f6)",color:"#fff",fontWeight:800,cursor:"pointer"}}>
                ✅ {L("Qo'shish","Добавить")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
