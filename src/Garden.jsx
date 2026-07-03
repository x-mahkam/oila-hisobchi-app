import { useState, useEffect, useRef } from "react";
import { db } from "./firebase.js";

// ═══════════════════════════════════════════════════════════
//  BARAKA BOG'I — "Lucky Garden" uslubidagi to'liq dizayn
//  Ekranga 100% moslashadi (skrollsiz), barcha grafika SVG
// ═══════════════════════════════════════════════════════════

const PLOTS = [
  { id: 0, unlockCost: 0 },
  { id: 1, unlockCost: 500 },
  { id: 2, unlockCost: 1500 },
  { id: 3, unlockCost: 5000 },
  { id: 4, unlockCost: 10000 },
];

const STAGES = [
  { id: 0, name: "Urug'",          nameRu: "Семя",          emoji: "🌰", waterNeeded: 3  },
  { id: 1, name: "Nihol",           nameRu: "Росток",        emoji: "🌱", waterNeeded: 5  },
  { id: 2, name: "Yosh daraxt",     nameRu: "Деревце",       emoji: "🌿", waterNeeded: 8  },
  { id: 3, name: "Katta daraxt",    nameRu: "Дерево",        emoji: "🌲", waterNeeded: 12 },
  { id: 4, name: "Gullagan daraxt", nameRu: "Цветущее",      emoji: "🌸", waterNeeded: 15 },
  { id: 5, name: "Mevali daraxt",   nameRu: "Плодоносящее",  emoji: "🍎", waterNeeded: 20 },
  { id: 6, name: "Baraka daraxti",  nameRu: "Дерево Бараки", emoji: "🌳", waterNeeded: 999},
];

const WATER_COOLDOWN = 2 * 60 * 60;        // 2 soat
const HARVEST_COINS  = [0, 10, 25, 50, 100, 200, 500];
const SUN_CYCLE      = 3 * 60 * 60 * 1000; // har o'simlik quyoshi 3 soatda pishadi
const SPEEDUP_COST   = 100;                // 100 Coin = -30 daqiqa
const SUN_ENERGY     = 15;                 // bitta quyosh = +15 energiya

// Quyoshlarning osmondagi joylashuvi (har uchastka uchun)
const SUN_POS = [
  { x: 50, y: 30 },
  { x: 23, y: 66 },
  { x: 77, y: 62 },
  { x: 13, y: 26 },
  { x: 87, y: 24 },
];

// ────────────────────────────────────────────────────────────
//  UMUMIY SVG GRADIENTLAR (bir marta hujjatga qo'yiladi)
// ────────────────────────────────────────────────────────────
const SvgDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
    <defs>
      <radialGradient id="bgSunOrb" cx="42%" cy="38%" r="65%">
        <stop offset="0%"  stopColor="#fff7c4" />
        <stop offset="45%" stopColor="#ffd44d" />
        <stop offset="100%" stopColor="#f59e0b" />
      </radialGradient>
      <linearGradient id="bgLeaf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#7ede54" />
        <stop offset="100%" stopColor="#3fae3c" />
      </linearGradient>
      <linearGradient id="bgLeafDark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#4cbf46" />
        <stop offset="100%" stopColor="#2c8f33" />
      </linearGradient>
      <linearGradient id="bgTrunk" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="#a2683b" />
        <stop offset="50%" stopColor="#8a5327" />
        <stop offset="100%" stopColor="#6e3f1c" />
      </linearGradient>
      <radialGradient id="bgDirt" cx="50%" cy="42%" r="70%">
        <stop offset="0%"  stopColor="#9c6b3f" />
        <stop offset="60%" stopColor="#845430" />
        <stop offset="100%" stopColor="#6d4224" />
      </radialGradient>
      <radialGradient id="bgDirtLocked" cx="50%" cy="42%" r="70%">
        <stop offset="0%"  stopColor="#bcaea6" />
        <stop offset="100%" stopColor="#a3928a" />
      </radialGradient>
      <radialGradient id="bgCoin" cx="38%" cy="32%" r="75%">
        <stop offset="0%"  stopColor="#ffe08a" />
        <stop offset="55%" stopColor="#fcbf3e" />
        <stop offset="100%" stopColor="#ef9411" />
      </radialGradient>
      <linearGradient id="bgCan" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#bfeef0" />
        <stop offset="100%" stopColor="#5fb9c9" />
      </linearGradient>
      <linearGradient id="bgMeadow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#6fd15a" />
        <stop offset="55%" stopColor="#4dbb47" />
        <stop offset="100%" stopColor="#2f9e3d" />
      </linearGradient>
      <radialGradient id="bgGem" cx="35%" cy="30%" r="80%">
        <stop offset="0%"  stopColor="#ffd6f2" />
        <stop offset="55%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#db2777" />
      </radialGradient>
    </defs>
  </svg>
);

// ── Quyosh spraytisi ──
const SunSprite = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <g>
      {Array.from({ length: 12 }).map((_, i) => (
        <polygon key={i} points="26.5,14 33.5,14 30,2" transform={`rotate(${i * 30} 30 30)`} fill="#ffe14d" opacity="0.95" />
      ))}
      <circle cx="30" cy="30" r="15" fill="url(#bgSunOrb)" stroke="#fff3b0" strokeWidth="1.5" />
      <ellipse cx="25" cy="24" rx="5" ry="3.5" fill="#fffbe0" opacity="0.85" />
    </g>
  </svg>
);

// ── Bulut ──
const Cloud = ({ w = 90, o = 1 }) => (
  <svg width={w} height={w * 0.52} viewBox="0 0 100 52" style={{ display: "block" }}>
    <g opacity={o}>
      {/* Pastki soya qatlami */}
      <path d="M14 44 Q 6 44 6 37 Q 6 30 14 29 Q 15 18 27 17 Q 31 6 45 7 Q 58 3 65 13 Q 78 11 82 21 Q 94 22 94 33 Q 94 43 84 44 Z" fill="#cfe6fb" />
      {/* Asosiy oq tanа — tekis tagli, dumaloq puflar */}
      <path d="M14 42 Q 6 42 6 35 Q 6 28 14 27 Q 15 16 27 15 Q 31 4 45 5 Q 58 1 65 11 Q 78 9 82 19 Q 94 20 94 31 Q 94 41 84 42 Z" fill="#ffffff" />
      {/* Yumshoq ichki hajm */}
      <path d="M20 27 Q 22 17 33 16 Q 38 8 49 9 Q 60 6 66 15" fill="none" stroke="#f2f8ff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
    </g>
  </svg>
);

// ── Panjara (fence) segmenti ──
const Fence = ({ w = 130, flip = false }) => (
  <svg width={w} height={w * 0.38} viewBox="0 0 130 50" style={{ display: "block", transform: flip ? "scaleX(-1)" : "none" }}>
    {[8, 34, 60, 86, 112].map((x, i) => (
      <g key={i}>
        <path d={`M${x} 12 L${x + 12} 12 L${x + 12} 46 L${x} 46 Z M${x} 12 L${x + 6} 4 L${x + 12} 12`} fill="#f2e3c4" />
        <path d={`M${x} 12 L${x + 6} 4 L${x + 12} 12 Z`} fill="#e8d3a8" />
      </g>
    ))}
    <rect x="0" y="20" width="130" height="6" rx="3" fill="#eeddba" />
    <rect x="0" y="34" width="130" height="6" rx="3" fill="#e6d2a9" />
    <path d="M0 26 Q 20 14 42 24 T 86 22 T 130 26" stroke="#3fae3c" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="30" cy="19" r="3.4" fill="#57c94e" /><circle cx="72" cy="20" r="3" fill="#57c94e" /><circle cx="108" cy="21" r="3.2" fill="#57c94e" />
  </svg>
);

// ── Buta / daraxt (chekka bezaklar) ──
const Bush = ({ w = 70 }) => (
  <svg width={w} height={w * 0.9} viewBox="0 0 70 63">
    <ellipse cx="35" cy="40" rx="32" ry="23" fill="url(#bgLeafDark)" />
    <ellipse cx="22" cy="30" rx="18" ry="15" fill="url(#bgLeaf)" />
    <ellipse cx="46" cy="27" rx="16" ry="14" fill="url(#bgLeaf)" />
    <ellipse cx="16" cy="24" rx="4.5" ry="3" fill="#d6ffca" opacity="0.8" />
  </svg>
);

// ── Pastki dekor barglar (old plan) ──
const ForegroundLeaves = () => (
  <svg viewBox="0 0 480 70" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 64, pointerEvents: "none" }}>
    <path d="M-5 70 Q 15 18 42 44 Q 60 10 84 48 L 84 70 Z" fill="#2f9e3d" />
    <path d="M30 70 Q 55 26 78 52 Q 96 20 118 56 L 118 70 Z" fill="#43b944" />
    <path d="M355 70 Q 375 22 400 48 Q 420 12 445 50 L 445 70 Z" fill="#2f9e3d" />
    <path d="M395 70 Q 420 30 442 54 Q 458 24 485 58 L 485 70 Z" fill="#43b944" />
    <path d="M120 70 Q 150 46 180 62 L 180 70 Z" fill="#d9c9a3" />
    <path d="M290 70 Q 320 44 352 62 L 352 70 Z" fill="#d9c9a3" />
    <ellipse cx="215" cy="66" rx="14" ry="6" fill="#57c94e" />
    <circle cx="205" cy="60" r="2.4" fill="#ffe680" /><circle cx="215" cy="57" r="2.4" fill="#ffe680" /><circle cx="225" cy="60" r="2.4" fill="#ffe680" />
  </svg>
);

// ── Oltin tanga ──
const CoinSVG = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="28" fill="#c47a12" />
    <circle cx="30" cy="28.5" r="27" fill="url(#bgCoin)" stroke="#ffe9ad" strokeWidth="2.5" />
    <circle cx="30" cy="28.5" r="19" fill="none" stroke="#e28f13" strokeWidth="2.5" opacity="0.7" />
    <path d="M30 16 l3.6 8 8.8.7 -6.7 5.8 2 8.6 -7.7-4.6 -7.7 4.6 2-8.6 -6.7-5.8 8.8-.7 Z" fill="#e28f13" />
    <ellipse cx="21" cy="17" rx="7" ry="4" fill="#fff3cf" opacity="0.75" transform="rotate(-28 21 17)" />
  </svg>
);

// ── Kristall (gem) ──
const GemSVG = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 3 h12 l4 6 -10 12 L2 9 Z" fill="url(#bgGem)" stroke="#be185d" strokeWidth="0.8" />
    <path d="M6 3 l3 6 L2 9 Z M18 3 l-3 6 L22 9 Z M9 9 h6 l-3 12 Z" fill="#fbcfe8" opacity="0.55" />
  </svg>
);

// ── Sug'orish idishi (choynak) ──
const CanSVG = ({ size = 46 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <ellipse cx="33" cy="50" rx="17" ry="5" fill="rgba(0,0,0,0.25)" />
    <path d="M20 26 Q 33 18 46 26 L 44 48 Q 33 53 22 48 Z" fill="url(#bgCan)" stroke="#3e93a6" strokeWidth="1.5" />
    <path d="M24 26 Q 33 21 42 26" stroke="#eafcff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M30 15 Q 33 8 40 12 Q 45 15 44 22" stroke="#3e93a6" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    <path d="M21 32 Q 8 30 7 20" stroke="#5fb9c9" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="7" cy="18" r="5" fill="#5fb9c9" stroke="#3e93a6" strokeWidth="1.2" />
    <circle cx="5.5" cy="16" r="1" fill="#eafcff" /><circle cx="8.5" cy="15.5" r="1" fill="#eafcff" /><circle cx="7" cy="19" r="1" fill="#eafcff" />
    <circle cx="27" cy="34" r="2.6" fill="#8a5327" /><circle cx="34" cy="37" r="2.2" fill="#8a5327" /><circle cx="31" cy="42" r="1.9" fill="#8a5327" />
    <ellipse cx="26" cy="30" rx="4" ry="6" fill="#ffffff" opacity="0.35" transform="rotate(-15 26 30)" />
  </svg>
);

// ── Qulf ──
const LockSVG = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <rect x="6" y="13" width="18" height="13" rx="3.5" fill="#f7f2ee" />
    <path d="M10 13 v-3 a5 5 0 0 1 10 0 v3" stroke="#f7f2ee" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <circle cx="15" cy="19" r="2" fill="#b3a49b" />
    <rect x="14" y="19" width="2" height="4" rx="1" fill="#b3a49b" />
  </svg>
);

// ── Raketa (tezlashtirish) ──
const RocketSVG = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 34 34">
    <path d="M13 26 Q 11 30 8 31 Q 9 27 10 25 Z" fill="#f59e0b" />
    <path d="M14 25 Q 13 31 15 33 Q 17 30 16.5 26 Z" fill="#ef4444" />
    <path d="M17 3 Q 24 8 24 17 L 24 24 L 10 24 L 10 17 Q 10 8 17 3 Z" fill="#f8fafc" stroke="#d3dbe4" strokeWidth="0.8" />
    <path d="M10 18 L 5 24 L 10 24 Z" fill="#ef4444" />
    <path d="M24 18 L 29 24 L 24 24 Z" fill="#ef4444" />
    <circle cx="17" cy="14" r="3.6" fill="#7dd3fc" stroke="#38bdf8" strokeWidth="1.2" />
    <path d="M17 3 Q 21 6 22.5 10 L 11.5 10 Q 13 6 17 3 Z" fill="#ef4444" />
  </svg>
);

// ── Sovg'a qutisi ──
const GiftSVG = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect x="3" y="10" width="18" height="11" rx="2" fill="#f43f5e" />
    <rect x="3" y="7" width="18" height="5" rx="1.5" fill="#fb7185" />
    <rect x="10.5" y="7" width="3" height="14" fill="#ffe08a" />
    <path d="M12 7 C 9 7 7 5 8 3.5 C 9 2 11.5 3.5 12 6.5 C 12.5 3.5 15 2 16 3.5 C 17 5 15 7 12 7 Z" fill="#ffd257" />
  </svg>
);

// ────────────────────────────────────────────────────────────
//  O'SIMLIK BOSQICHLARI (yangilangan, gradientli SVG)
// ────────────────────────────────────────────────────────────
// ── Daraxt shox-barg bo'lagi: alohida ajralib turadigan barg to'plami ──
const Lobe = ({ cx, cy, rx, ry }) => (
  <g>
    <ellipse cx={cx} cy={cy + 2.6} rx={rx} ry={ry} fill="#2b8a31" />
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#bgLeaf)" stroke="#2f9e3d" strokeWidth="1.3" />
    <ellipse cx={cx - rx * 0.34} cy={cy - ry * 0.42} rx={rx * 0.3} ry={ry * 0.24} fill="#d9ffce" opacity="0.8" />
  </g>
);

const PlantSVG = ({ stage, size = 120, animated = true }) => {
  const style = animated ? { animation: "sway 4s ease-in-out infinite", transformOrigin: "50% 100%", display: "block" } : { display: "block" };
  const leaf = "url(#bgLeaf)", leafD = "url(#bgLeafDark)", trunk = "url(#bgTrunk)";
  const s = [
    // 0: urug'
    <svg key="s0" style={style} width={size * 0.6} height={size * 0.42} viewBox="0 0 60 42">
      <ellipse cx="30" cy="30" rx="13" ry="10" fill="#4a2c10" />
      <ellipse cx="30" cy="27" rx="11" ry="9" fill="#6b4423" />
      <ellipse cx="26" cy="23" rx="4" ry="3" fill="#8a5f38" opacity="0.9" />
      <path d="M30 20 Q27 12 30 6 Q33 12 30 20Z" fill={leaf} />
    </svg>,
    // 1: nihol (skrindagi kabi ikki bargli)
    <svg key="s1" style={style} width={size * 0.85} height={size * 0.8} viewBox="0 0 85 80">
      <path d="M42 78 Q 41 58 42 44" stroke="#2f9e3d" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M42 50 C 20 46 12 28 18 20 C 34 18 44 32 42 50 Z" fill={leaf} />
      <path d="M42 50 C 30 42 26 32 26 26" stroke="#2c8f33" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M42 46 C 62 40 72 24 66 15 C 50 13 40 28 42 46 Z" fill={leafD} />
      <path d="M42 46 C 52 38 58 28 60 22" stroke="#1f7a2b" strokeWidth="2" fill="none" opacity="0.6" />
      <ellipse cx="24" cy="26" rx="4" ry="2.6" fill="#d6ffca" opacity="0.85" transform="rotate(-30 24 26)" />
    </svg>,
    // 2: yosh daraxt
    <svg key="s2" style={style} width={size} height={size} viewBox="0 0 100 100">
      <path d="M47 98 L47 52 Q47 46 53 46 L53 98 Z" fill={trunk} />
      <Lobe cx={50} cy={40} rx={27} ry={16} />
      <Lobe cx={50} cy={22} rx={18} ry={13} />
    </svg>,
    // 3: katta daraxt
    <svg key="s3" style={style} width={size} height={size * 1.18} viewBox="0 0 100 118">
      <path d="M45 116 L45 60 Q 40 50 30 46 L34 42 Q44 48 47 54 Q48 44 44 34 L50 32 Q53 44 52 54 Q56 47 66 43 L69 48 Q58 52 55 60 L55 116 Z" fill={trunk} />
      <Lobe cx={31} cy={41} rx={22} ry={15} />
      <Lobe cx={69} cy={41} rx={20} ry={14} />
      <Lobe cx={50} cy={22} rx={23} ry={16} />
    </svg>,
    // 4: gullagan
    <svg key="s4" style={style} width={size} height={size * 1.18} viewBox="0 0 100 118">
      <path d="M45 116 L45 60 Q 40 50 30 46 L34 42 Q44 48 47 54 Q48 44 44 34 L50 32 Q53 44 52 54 Q56 47 66 43 L69 48 Q58 52 55 60 L55 116 Z" fill={trunk} />
      <Lobe cx={31} cy={41} rx={22} ry={15} />
      <Lobe cx={69} cy={41} rx={20} ry={14} />
      <Lobe cx={50} cy={22} rx={23} ry={16} />
      {[[28,34],[44,20],[62,16],[74,32],[64,48],[36,50],[50,10]].map(([x,y],i)=>(
        <g key={i}>
          {[0,72,144,216,288].map(a=><ellipse key={a} cx={x} cy={y-3.2} rx="2.6" ry="3.6" fill={i%2?"#fbcfe8":"#f9a8d4"} transform={`rotate(${a} ${x} ${y})`} />)}
          <circle cx={x} cy={y} r="2" fill="#fde047" />
        </g>
      ))}
    </svg>,
    // 5: mevali
    <svg key="s5" style={style} width={size} height={size * 1.18} viewBox="0 0 100 118">
      <path d="M45 116 L45 60 Q 40 50 30 46 L34 42 Q44 48 47 54 Q48 44 44 34 L50 32 Q53 44 52 54 Q56 47 66 43 L69 48 Q58 52 55 60 L55 116 Z" fill={trunk} />
      <Lobe cx={31} cy={41} rx={22} ry={15} />
      <Lobe cx={69} cy={41} rx={20} ry={14} />
      <Lobe cx={50} cy={22} rx={23} ry={16} />
      {[[30,36],[48,22],[66,20],[74,36],[62,50],[38,52],[50,10]].map(([x,y],i)=>(
        <g key={i}>
          <circle cx={x} cy={y} r="5.4" fill={i%2?"#f97316":"#ef4444"} />
          <ellipse cx={x-1.8} cy={y-1.8} rx="1.8" ry="1.2" fill="#ffd7c2" opacity="0.85" />
          <path d={`M${x} ${y-5} q1 -3 3 -4`} stroke="#166534" strokeWidth="1.4" fill="none" />
        </g>
      ))}
    </svg>,
    // 6: baraka daraxti (oltin)
    <svg key="s6" style={style} width={size} height={size * 1.26} viewBox="0 0 100 126">
      <path d="M44 124 L44 64 Q 38 52 27 48 L31 43 Q43 50 46 57 Q47 46 43 35 L50 33 Q53 46 52 57 Q57 49 68 45 L71 50 Q59 55 56 64 L56 124 Z" fill={trunk} />
      <Lobe cx={29} cy={43} rx={24} ry={17} />
      <Lobe cx={71} cy={43} rx={22} ry={16} />
      <Lobe cx={50} cy={19} rx={25} ry={17} />
      {[[28,38],[46,22],[64,18],[75,34],[65,52],[34,54],[50,8]].map(([x,y],i)=>(
        <g key={i}>
          <circle cx={x} cy={y} r="5.6" fill="url(#bgCoin)" stroke="#e28f13" strokeWidth="1" />
          <path d={`M${x} ${y-2.6} l1 2 2.2.2 -1.7 1.5 .5 2.2 -2-1.2 -2 1.2 .5-2.2 -1.7-1.5 2.2-.2 Z`} fill="#e28f13" />
        </g>
      ))}
      <ellipse cx="26" cy="24" rx="6" ry="4" fill="#fff7c4" opacity="0.85" />
    </svg>,
  ];
  return s[Math.min(Math.max(stage, 0), s.length - 1)];
};

// ── Yer uchastkasi (dirt oval) ──
const PlotOval = ({ w, locked, cost, children, onClick, selected }) => (
  <div onClick={onClick} style={{ position: "relative", width: w, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
    <svg viewBox="0 0 120 62" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "120 / 62", filter: selected ? "drop-shadow(0 0 8px rgba(255,244,170,0.9))" : "none" }}>
      <ellipse cx="60" cy="31" rx="59" ry="30" fill={locked ? "#8fbf6a" : "#7fc25f"} />
      <ellipse cx="60" cy="31" rx="54" ry="26.5" fill={locked ? "url(#bgDirtLocked)" : "url(#bgDirt)"} />
      <ellipse cx="60" cy="29" rx="54" ry="26.5" fill="rgba(0,0,0,0.14)" style={{ mixBlendMode: "multiply" }} />
      <ellipse cx="60" cy="33" rx="47" ry="21" fill={locked ? "#b3a49b" : "#845430"} />
      {!locked && <>
        <circle cx="44" cy="40" r="1.6" fill="#5c3a1e" /><circle cx="70" cy="43" r="1.3" fill="#5c3a1e" />
        <circle cx="58" cy="46" r="1.1" fill="#5c3a1e" /><circle cx="80" cy="36" r="1.4" fill="#5c3a1e" />
        <path d="M18 18 q2 -6 5 -7 q-1 6 -5 7 Z M23 16 q4 -4 7 -3 q-3 5 -7 3 Z" fill="#57c94e" />
        <path d="M96 50 q2 -6 5 -7 q-1 6 -5 7 Z M101 48 q4 -4 7 -3 q-3 5 -7 3 Z" fill="#57c94e" />
      </>}
    </svg>
    {locked && (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
        <LockSVG size={26} />
        <div style={{ width: "38%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.75)" }} />
        <div style={{ fontSize: 10, fontWeight: 800, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}>{cost?.toLocaleString()} 🪙</div>
      </div>
    )}
    {children}
  </div>
);

// ────────────────────────────────────────────────────────────
//  ASOSIY KOMPONENT
// ────────────────────────────────────────────────────────────
export default function Garden({ user, lg = "uz", onBack, dark, addCoin }) {
  const oilaId = user?.oilaId;
  const L = (uz, ru = uz) => lg === "ru" ? ru : uz;

  const [coins, setCoins]           = useState(0);
  const [energy, setEnergy]         = useState(0);
  const [crystals, setCrystals]     = useState(0);
  const [plots, setPlots]           = useState(PLOTS.map(p => ({ ...p, stage: -1, waterCount: 0, lastWateredAt: 0, lastSunAt: 0, harvestReady: false })));
  const [selected, setSelected]     = useState(0);
  const [waterTimer, setWaterTimer] = useState(0);
  const [waterReady, setWaterReady] = useState(true);
  const [showInfo, setShowInfo]     = useState(false);
  const [showUnlock, setShowUnlock] = useState(null);
  const [showPlant, setShowPlant]   = useState(null);
  const [digAnim, setDigAnim]       = useState(null);
  const [flyCoins, setFlyCoins]     = useState([]);
  const [waterAnim, setWaterAnim]   = useState(false);
  const [growAnim, setGrowAnim]     = useState(null);
  const [dailyDone, setDailyDone]   = useState(false);
  const [msg, setMsg]               = useState(null);
  const [sunNote, setSunNote]       = useState(null); // pishmagan quyoshga bosilganda
  const sunNoteRef = useRef(null);
  const [now, setNow]               = useState(Date.now());

  const timerRef = useRef(null);
  const msgRef   = useRef(null);
  const lastWateredRef = useRef(0); // sug'orish vaqti — barcha qurilmalarda sinxron

  const showMsg = (text, icon = "🌿", dur = 3000) => {
    setMsg({ text, icon, dur });
    clearTimeout(msgRef.current);
    msgRef.current = setTimeout(() => setMsg(null), dur);
  };

  const spawnCoin = (amount, x = 50, y = 50, icon = "🪙") => {
    const id = Date.now() + Math.random();
    setFlyCoins(prev => [...prev, { id, amount, x, y, icon }]);
    setTimeout(() => setFlyCoins(prev => prev.filter(c => c.id !== id)), 1400);
  };

  // ── Firebase yuklash ──
  useEffect(() => { if (oilaId) loadAll(); }, [oilaId]);

  const loadAll = async () => {
    try {
      const [g, c, e, cr, daily] = await Promise.all([
        db.g("baraka_garden_" + oilaId),
        db.g("baraka_coins_" + oilaId),
        db.g("baraka_energy_" + oilaId),
        db.g("baraka_crystals_" + oilaId),
        db.g("baraka_daily_" + oilaId),
      ]);
      if (g?.plots) {
        // Ekilgan, lekin quyosh sikli boshlanmagan uchastkalarni tuzatish
        const fixed = g.plots.map(p => (p.stage >= 0 && !p.lastSunAt) ? { ...p, lastSunAt: Date.now() } : p);
        setPlots(fixed);
        if (fixed.some((p, i) => p.lastSunAt !== g.plots[i].lastSunAt)) {
          db.s("baraka_garden_" + oilaId, { plots: fixed, lastWatered: g.lastWatered ?? null, updatedAt: Date.now() }).catch(() => {});
        }
      }
      if (c != null) setCoins(c);
      if (e != null) setEnergy(e);
      if (cr != null) setCrystals(cr);
      if (g?.lastWatered) {
        lastWateredRef.current = g.lastWatered;
        const elapsed = Math.floor((Date.now() - g.lastWatered) / 1000);
        const rem = WATER_COOLDOWN - elapsed;
        if (rem > 0) { setWaterTimer(rem); setWaterReady(false); }
        else setWaterReady(true);
      }
      const today = new Date().toISOString().slice(0, 10);
      if (daily?.date === today) setDailyDone(true);
    } catch (e) { console.error("Garden load:", e); }
  };

  // lastWatered: undefined = joriy qiymatni saqlab qolish (hech qachon o'chirmaydi)
  const saveGarden = async (newPlots, newCoins, newEnergy, newCrystals, lastWatered) => {
    if (!oilaId) return;
    if (lastWatered !== undefined) lastWateredRef.current = lastWatered;
    try {
      await db.s("baraka_garden_" + oilaId, { plots: newPlots, lastWatered: lastWateredRef.current || null, updatedAt: Date.now() });
      if (newCoins    !== undefined) await db.s("baraka_coins_" + oilaId, newCoins);
      if (newEnergy   !== undefined) await db.s("baraka_energy_" + oilaId, newEnergy);
      if (newCrystals !== undefined) await db.s("baraka_crystals_" + oilaId, newCrystals);
    } catch (e) { console.error("Garden save:", e); }
  };

  // ── Sekundlik taymer ──
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setNow(Date.now());
      setWaterTimer(prev => {
        if (prev <= 1) { setWaterReady(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const fTime = s => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // ── Sug'orish ──
  const handleWater = async (plotId) => {
    if (!waterReady) return;
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.stage < 0) { showMsg(L("Avval urug' eking 🌰", "Сначала посейте семя 🌰"), "💧"); return; }

    setWaterAnim(true);
    setTimeout(() => setWaterAnim(false), 1200);

    const nowT = Date.now();
    const newWaterCount = (plot.waterCount || 0) + 1;
    const stage = plot.stage;
    const needed = STAGES[stage]?.waterNeeded || 3;
    let newStage = stage;
    let harvestReady = plot.harvestReady || false;
    let resetWater = false;

    if (newWaterCount >= needed && stage < STAGES.length - 1) {
      newStage = stage + 1;
      resetWater = true;
      setGrowAnim(plotId);
      setTimeout(() => setGrowAnim(null), 2000);
      if (newStage === STAGES.length - 1) harvestReady = true;
      showMsg(L(`🌱 ${STAGES[newStage].name} bosqichiga yetdi!`, `🌱 Стадия: ${STAGES[newStage].nameRu}!`), "🌱");
    } else {
      showMsg(L("💧 Bog' sug'orildi! +5 Energiya", "💧 Полито! +5 Энергии"), "💧");
    }

    const newEnergy = energy + 5;
    setEnergy(newEnergy);
    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, waterCount: resetWater ? 0 : newWaterCount, stage: newStage, lastWateredAt: nowT, harvestReady }
      : p);
    setPlots(newPlots);
    setWaterReady(false);
    setWaterTimer(WATER_COOLDOWN);
    spawnCoin(5, 78, 72, "⚡");
    await saveGarden(newPlots, undefined, newEnergy, undefined, nowT);
  };

  // ── Hosil yig'ish ──
  const handleHarvest = async (plotId) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.harvestReady) return;
    const earned = HARVEST_COINS[Math.min(plot.stage, HARVEST_COINS.length - 1)];
    const newCoins = coins + earned;
    const newCrystals = crystals + 1;
    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, stage: 0, waterCount: 0, harvestReady: false, lastSunAt: Date.now() }
      : p);
    setCoins(newCoins);
    setCrystals(newCrystals);
    setPlots(newPlots);
    spawnCoin(earned, 50, 50);
    showMsg(L(`🎉 Hosil yig'ildi! +${earned} Coin, +1 kristal`, `🎉 Урожай! +${earned} монет, +1💎`), "🎉");
    await saveGarden(newPlots, newCoins, undefined, newCrystals);
  };

  // ── Uchastka ochish ──
  const handleUnlock = async (plotId) => {
    const plot = PLOTS.find(p => p.id === plotId);
    if (!plot) return;
    if (coins < plot.unlockCost) {
      showMsg(L(`❌ Yetarli tanga yo'q! ${plot.unlockCost} kerak`, `❌ Мало монет! Нужно ${plot.unlockCost}`), "🪙");
      setShowUnlock(null);
      return;
    }
    const newCoins = coins - plot.unlockCost;
    const newPlots = plots.map(p => p.id === plotId ? { ...p, stage: -1, unlocked: true } : p);
    setCoins(newCoins);
    setPlots(newPlots);
    setShowUnlock(null);
    showMsg(L("🎊 Yangi uchastka ochildi!", "🎊 Новый участок открыт!"), "🎊");
    await saveGarden(newPlots, newCoins, undefined, undefined);
  };

  // ── Ekish ──
  const handlePlant = async (plotId) => {
    setShowPlant(null);
    for (let step = 1; step <= 4; step++) {
      setDigAnim({ plotId, step });
      await new Promise(r => setTimeout(r, 380));
    }
    setDigAnim(null);
    const newPlots = plots.map(p => p.id === plotId
      ? { ...p, stage: 0, waterCount: 0, harvestReady: false, lastSunAt: Date.now() }
      : p);
    setPlots(newPlots);
    setSelected(plotId);
    showMsg(L("🌰 Urug' ekildi! Sug'orishni boshlang", "🌰 Семя посажено!"), "🌰");
    await saveGarden(newPlots, undefined, undefined, undefined);
  };

  // ── Kunlik sovg'a ──
  const handleDailyGift = async () => {
    if (dailyDone) { showMsg(L("Bugungi sovg'a olingan, ertaga keling! 🌙", "Бонус уже получен 🌙"), "🎁"); return; }
    const today = new Date().toISOString().slice(0, 10);
    const bonus = 50;
    const newCoins = coins + bonus;
    const newEnergy = energy + 20;
    setCoins(newCoins);
    setEnergy(newEnergy);
    setDailyDone(true);
    spawnCoin(bonus, 20, 40);
    showMsg(L(`🎁 Kunlik sovg'a! +${bonus} Coin, +20⚡`, `🎁 Бонус! +${bonus} монет`), "🎁");
    await Promise.all([
      db.s("baraka_daily_" + oilaId, { date: today, coins: bonus }),
      saveGarden(plots, newCoins, newEnergy, undefined),
    ]);
  };

  // ── Pishgan quyoshni yig'ish (har uchastka 3 soatda bitta) ──
  const collectSun = async (plotId) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.stage < 0) return;
    if (Date.now() - (plot.lastSunAt || 0) < SUN_CYCLE) return; // hali pishmagan
    const newEnergy = energy + SUN_ENERGY;
    const newPlots = plots.map(p => p.id === plotId ? { ...p, lastSunAt: Date.now() } : p);
    setEnergy(newEnergy);
    setPlots(newPlots);
    const pos = SUN_POS[plotId] || SUN_POS[0];
    spawnCoin(SUN_ENERGY, pos.x, 30, "☀️");
    showMsg(L(`☀️ +${SUN_ENERGY} Baraka Energiya!`, `☀️ +${SUN_ENERGY} Энергии!`), "☀️");
    await saveGarden(newPlots, undefined, newEnergy, undefined);
  };

  // ── Tezlashtirish: 100 Coin = −30 daqiqa (barcha qurilmalarga saqlanadi) ──
  const handleSpeedUp = async () => {
    if (waterReady) return;
    if (coins < SPEEDUP_COST) { showMsg(L(`❌ ${SPEEDUP_COST} Coin kerak`, `❌ Нужно ${SPEEDUP_COST} монет`), "🪙"); return; }
    const newCoins = coins - SPEEDUP_COST;
    // lastWatered ni 30 daqiqa orqaga suramiz — qolgan vaqt hamma qurilmada birdek kamayadi
    const newLW = Math.max(0, (lastWateredRef.current || Date.now()) - 30 * 60 * 1000);
    const remaining = Math.max(0, WATER_COOLDOWN - Math.floor((Date.now() - newLW) / 1000));
    setCoins(newCoins);
    setWaterTimer(remaining);
    if (remaining <= 0) setWaterReady(true);
    spawnCoin(-SPEEDUP_COST, 50, 78, "🪙");
    showMsg(L("🚀 30 daqiqa tejaldi!", "🚀 −30 минут!"), "🚀");
    await saveGarden(plots, newCoins, undefined, undefined, newLW);
  };

  // ── Uchastka bosilganda ──
  const onPlotTap = (plot) => {
    const isUnlocked = plot.id === 0 || plot.unlocked || plot.stage >= 0;
    if (!isUnlocked) { setShowUnlock(plot.id); return; }
    if (plot.stage < 0) { setShowPlant(plot.id); return; }
    setSelected(plot.id);
    if (plot.harvestReady) handleHarvest(plot.id);
  };

  const selPlot  = plots.find(p => p.id === selected) || plots[0];
  const selStage = selPlot?.stage ?? -1;

  // ── Uchastkalar joylashuvi (rasmda bo'lgani kabi) ──
  const PLOT_POS = [
    { left: "50%", top: "11%", w: "min(46%, 190px)", z: 5 },  // asosiy — markazda
    { left: "26%", top: "41%", w: "min(40%, 165px)", z: 6 },  // pastki chap
    { left: "75%", top: "41%", w: "min(40%, 165px)", z: 6 },  // pastki o'ng
    { left: "35%", top: "64%", w: "min(30%, 122px)", z: 7 },  // eng past chap
    { left: "65%", top: "64%", w: "min(30%, 122px)", z: 7 },  // eng past o'ng
  ];

  const plotScale = [1, 0.8, 0.8, 0.62, 0.62];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, maxWidth: 480, margin: "0 auto", height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI',system-ui,sans-serif", background: "linear-gradient(180deg,#3d9bf0 0%,#55acf7 34%,#7cc4fb 58%,#a9dcff 74%)", userSelect: "none" }}>
      <SvgDefs />

      <style>{`
        @keyframes sway{0%,100%{transform:rotate(-1.6deg)}50%{transform:rotate(1.6deg)}}
        @keyframes cloudDrift{0%,100%{transform:translateX(0)}50%{transform:translateX(20px)}}
        @keyframes coinFly{0%{transform:translateY(0) scale(.5);opacity:1}100%{transform:translateY(-90px) scale(1.2);opacity:0}}
        @keyframes sunPulse{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.12) rotate(7deg)}}
        @keyframes sunGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(255,225,77,.8))}50%{filter:drop-shadow(0 0 16px rgba(255,225,77,1))}}
        @keyframes growPop{0%{transform:scale(.7)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes waterDrop{0%{transform:translate(-50%,-14px) scale(.8);opacity:0}30%{opacity:1}100%{transform:translate(-50%,38px) scale(.4);opacity:0}}
        @keyframes shimmer{0%,100%{opacity:.65}50%{opacity:1}}
        @keyframes msgSlide{0%{transform:translate(-50%,-20px);opacity:0}12%,88%{transform:translate(-50%,0);opacity:1}100%{transform:translate(-50%,-20px);opacity:0}}
        @keyframes digBounce{0%,100%{transform:translate(-50%,-50%) translateY(0) rotate(-8deg)}50%{transform:translate(-50%,-50%) translateY(-9px) rotate(10deg)}}
        @keyframes giftBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes noteFade{0%{opacity:0;transform:translateY(6px)}10%,80%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}
        @keyframes rayShift{0%,100%{opacity:.35}50%{opacity:.6}}
      `}</style>

      {/* ── Yorug'lik nurlari (chap yuqoridan) ── */}
      <div style={{ position: "absolute", top: -70, left: -110, width: 340, height: 460, background: "linear-gradient(115deg,rgba(255,255,255,.4),rgba(255,255,255,0) 62%)", transform: "rotate(8deg)", pointerEvents: "none", animation: "rayShift 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: -50, left: 10, width: 130, height: 400, background: "linear-gradient(115deg,rgba(255,255,255,.28),rgba(255,255,255,0) 70%)", transform: "rotate(16deg)", pointerEvents: "none" }} />

      {/* ── Motivatsion xabar ── */}
      {msg && (
        <div style={{ position: "absolute", top: 64, left: "50%", background: "rgba(15,40,70,.78)", color: "#fff", borderRadius: 24, padding: "9px 20px", fontSize: 13.5, fontWeight: 700, zIndex: 90, whiteSpace: "nowrap", animation: `msgSlide ${(msg.dur || 3000) / 1000}s ease forwards`, backdropFilter: "blur(8px)", boxShadow: "0 6px 18px rgba(0,0,0,.25)" }}>
          {msg.icon} {msg.text}
        </div>
      )}

      {/* ── Uchuvchi mukofotlar ── */}
      {flyCoins.map(c => (
        <div key={c.id} style={{ position: "absolute", left: c.x + "%", top: c.y + "%", zIndex: 89, animation: "coinFly 1.4s ease forwards", pointerEvents: "none", fontSize: 17, fontWeight: 800, color: "#ffe14d", textShadow: "0 2px 8px rgba(0,0,0,.45)" }}>
          +{c.amount}{c.icon}
        </div>
      ))}

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 0", position: "relative", zIndex: 20, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 42, height: 42, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={handleDailyGift} style={{ width: 42, height: 42, borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: dailyDone ? 0.55 : 1, animation: dailyDone ? "none" : "giftBounce 1.6s ease-in-out infinite" }} title={L("Kunlik sovg'a", "Ежедневный бонус")}>
            <GiftSVG size={26} />
          </button>
          <button onClick={() => setShowInfo(true)} style={{ width: 42, height: 42, borderRadius: "50%", background: "transparent", border: "2.6px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20, lineHeight: 1, transform: "scale(.82)" }}>?</button>
        </div>
      </div>

      {/* ── Sarlavha ── */}
      <div style={{ textAlign: "center", fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: 0.3, textShadow: "0 2px 10px rgba(30,90,160,.35)", zIndex: 20, flexShrink: 0, marginTop: -2 }}>
        {L("Baraka bog'i", "Сад Бараки")}
      </div>

      {/* ── Hisoblagich quvurlari: ichi to'lib boradi ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 8, zIndex: 20, flexShrink: 0 }}>
        {[
          { icon: <GemSVG size={15} />, val: crystals, fill: Math.min(100, crystals * 10), fillBg: "linear-gradient(90deg,#f472b6,#db2777)", key: "gem" },
          { icon: <SunSprite size={18} />, val: energy, fill: Math.min(100, energy), fillBg: "linear-gradient(90deg,#ffe14d,#f59e0b)", key: "sun" },
        ].map(c => (
          <div key={c.key} style={{ width: "min(56%, 220px)", height: 30, background: "linear-gradient(180deg,#2e6d74,#265d64)", borderRadius: 20, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 3px 10px rgba(20,60,90,.28), inset 0 1px 0 rgba(255,255,255,.12)", position: "relative", overflow: "hidden", paddingLeft: 3 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${c.fill}%`, background: c.fillBg, opacity: 0.38, borderRadius: 20, transition: "width .6s ease" }} />
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>{c.icon}</div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", position: "relative" }}>{c.val.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* ── O'sish jarayoni chipi ── */}
      {selStage >= 0 && selStage < STAGES.length - 1 && (
        <div style={{ alignSelf: "center", marginTop: 8, background: "rgba(15,50,85,.42)", backdropFilter: "blur(6px)", borderRadius: 20, padding: "5px 14px", display: "flex", alignItems: "center", gap: 8, zIndex: 20, flexShrink: 0 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#eaf6ff" }}>
            {STAGES[selStage].emoji} {L(STAGES[selStage].name, STAGES[selStage].nameRu)}
          </span>
          <div style={{ width: 64, height: 7, borderRadius: 6, background: "rgba(255,255,255,.25)", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, ((selPlot?.waterCount || 0) / STAGES[selStage].waterNeeded) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#ffe14d,#f59e0b)", transition: "width .5s" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#ffe9a8" }}>💧{selPlot?.waterCount || 0}/{STAGES[selStage].waterNeeded}</span>
        </div>
      )}

      {/* ── Osmon: bulutlar + quyoshlar ── */}
      <div style={{ position: "relative", flex: "1 1 auto", minHeight: 60, zIndex: 10 }}>
        <div style={{ position: "absolute", left: "14%", top: "28%", animation: "cloudDrift 12s ease-in-out infinite" }}><Cloud w={70} o={0.9} /></div>
        <div style={{ position: "absolute", right: "8%", top: "8%", animation: "cloudDrift 16s ease-in-out infinite reverse" }}><Cloud w={100} /></div>
        <div style={{ position: "absolute", right: "34%", top: "48%", animation: "cloudDrift 20s ease-in-out infinite" }}><Cloud w={52} o={0.85} /></div>

        {plots.filter(p => p.stage >= 0).map(p => {
          const pos = SUN_POS[p.id] || SUN_POS[0];
          const rem = Math.max(0, Math.ceil((SUN_CYCLE - (now - (p.lastSunAt || 0))) / 1000));
          const ready = rem <= 0;
          return (
            <div key={p.id} onClick={() => { if (ready) { collectSun(p.id); } else { setSunNote(p.id); clearTimeout(sunNoteRef.current); sunNoteRef.current = setTimeout(() => setSunNote(null), 3000); } }} style={{ position: "absolute", left: pos.x + "%", top: pos.y + "%", transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, WebkitTapHighlightColor: "transparent" }}>
              {!ready && sunNote !== p.id && (
                <div style={{ background: "rgba(90,130,175,.72)", borderRadius: 14, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: "#fff", backdropFilter: "blur(4px)" }}>{fTime(rem)}</div>
              )}
              {sunNote === p.id && (
                <div style={{ maxWidth: 150, textAlign: "center", fontSize: 12, fontWeight: 800, color: "#fff", lineHeight: 1.35, textShadow: "0 1px 3px rgba(20,60,110,.85), 0 0 10px rgba(20,60,110,.6)", animation: "noteFade 3s ease forwards", pointerEvents: "none" }}>
                  {L("Vaqt hali tugamadi, iltimos sabr qiling", "Время ещё не вышло, подождите")}
                </div>
              )}
              <div style={{ animation: ready ? "sunPulse 2s ease-in-out infinite, sunGlow 2s ease-in-out infinite" : "none", opacity: ready ? 1 : 0.88, transform: ready ? "none" : "scale(.86)" }}>
                <SunSprite size={52} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── YAYLOV (meadow) ── */}
      <div style={{ position: "relative", flexShrink: 0, height: "min(54dvh, 470px)", zIndex: 11 }}>
        {/* Orqa tepaliklar */}
        <svg viewBox="0 0 480 80" preserveAspectRatio="none" style={{ position: "absolute", top: -46, left: 0, width: "100%", height: 60 }}>
          <path d="M0 80 Q 90 6 230 34 Q 260 40 300 28 Q 390 4 480 42 L480 80 Z" fill="#5ec453" />
          <ellipse cx="415" cy="34" rx="14" ry="9" fill="#3fae3c" />
          <ellipse cx="368" cy="44" rx="9" ry="6" fill="#3fae3c" />
        </svg>
        {/* Asosiy maydon */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#66cc55 0%,#4dbb47 45%,#37a83f 100%)" }} />

        {/* Panjaralar */}
        <div style={{ position: "absolute", top: -8, left: "4%" }}><Fence w={150} /></div>
        <div style={{ position: "absolute", top: "24%", right: "-2%" }}><Fence w={120} flip /></div>

        {/* Chekka butalar */}
        <div style={{ position: "absolute", top: -20, left: -22 }}><Bush w={82} /></div>
        <div style={{ position: "absolute", top: "38%", left: -30 }}><Bush w={64} /></div>

        {/* ── Uchastkalar ── */}
        {plots.map(plot => {
          const pos = PLOT_POS[plot.id];
          const pl  = PLOTS.find(p => p.id === plot.id);
          const isUnlocked = plot.id === 0 || plot.unlocked || plot.stage >= 0;
          const isDigging  = digAnim?.plotId === plot.id;
          return (
            <div key={plot.id} style={{ position: "absolute", left: pos.left, top: pos.top, transform: "translateX(-50%)", width: pos.w, zIndex: pos.z }}>
              <PlotOval w="100%" locked={!isUnlocked} cost={pl?.unlockCost} selected={selected === plot.id && isUnlocked && plot.stage >= 0} onClick={() => onPlotTap(plot)}>
                {/* O'simlik — oval ustida turadi */}
                {isUnlocked && plot.stage >= 0 && !isDigging && (
                  <div style={{ position: "absolute", left: "50%", bottom: "42%", transform: "translateX(-50%)", animation: growAnim === plot.id ? "growPop .8s ease" : "none", pointerEvents: "none" }}>
                    <PlantSVG stage={plot.stage} size={110 * plotScale[plot.id]} animated={plot.stage >= 1} />
                  </div>
                )}
                {/* Kavlash animatsiyasi */}
                {isDigging && (
                  <div style={{ position: "absolute", left: "50%", top: "50%", fontSize: 30, animation: "digBounce .38s ease infinite", pointerEvents: "none" }}>⛏️</div>
                )}
                {/* Suv tomchisi */}
                {waterAnim && selected === plot.id && (
                  <div style={{ position: "absolute", left: "50%", top: "-30%", fontSize: 26, animation: "waterDrop 1.2s ease forwards", pointerEvents: "none" }}>💧</div>
                )}
                {/* Hosil belgisi */}
                {plot.harvestReady && (
                  <div style={{ position: "absolute", right: "6%", top: "-24%", animation: "shimmer 1.6s ease-in-out infinite, giftBounce 1.6s ease-in-out infinite", pointerEvents: "none" }}>
                    <GiftSVG size={30} />
                  </div>
                )}
              </PlotOval>
            </div>
          );
        })}

        {/* ── Pastki boshqaruv: tanga (chap) va choynak (o'ng) ── */}
        <div style={{ position: "absolute", left: 16, bottom: "max(14px, env(safe-area-inset-bottom))", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <CoinSVG size={62} />
          <div style={{ background: "rgba(20,70,60,.66)", borderRadius: 14, padding: "2px 16px", fontSize: 13.5, fontWeight: 800, color: "#eafff2", backdropFilter: "blur(4px)" }}>{coins.toLocaleString()}</div>
        </div>

        {/* ── Markaziy tezlashtirish (100 Coin = −30 daqiqa) ── */}
        {!waterReady && selStage >= 0 && !selPlot?.harvestReady && (
          <div onClick={handleSpeedUp} style={{ position: "absolute", left: "50%", bottom: "max(16px, env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
            <div style={{ animation: "giftBounce 1.8s ease-in-out infinite" }}><RocketSVG size={38} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <CoinSVG size={18} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,.35)" }}>− {SPEEDUP_COST}</span>
            </div>
            <div style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b)", borderRadius: 16, padding: "5px 16px", fontSize: 13, fontWeight: 800, color: "#fff", boxShadow: "0 3px 10px rgba(217,119,6,.4)" }}>
              {L("Tezlatish", "Ускорить")}
            </div>
          </div>
        )}

        <div style={{ position: "absolute", right: 16, bottom: "max(14px, env(safe-area-inset-bottom))", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <button onClick={() => {
              if (selStage < 0) { setShowPlant(selected); return; }
              if (selPlot?.harvestReady) { handleHarvest(selected); return; }
              handleWater(selected);
            }}
            style={{ width: 74, height: 74, borderRadius: "50%", border: "3px solid rgba(255,255,255,.55)", cursor: "pointer", background: waterReady || selStage < 0 || selPlot?.harvestReady ? "radial-gradient(circle at 38% 32%, #2f8a63, #14532d)" : "radial-gradient(circle at 38% 32%, #57707f, #33424d)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(10,60,40,.4)", position: "relative", WebkitTapHighlightColor: "transparent" }}>
            {selStage < 0
              ? <span style={{ fontSize: 32, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }}>🌰</span>
              : selPlot?.harvestReady
                ? <GiftSVG size={36} />
                : <CanSVG size={50} />}
            {waterReady && selStage >= 0 && !selPlot?.harvestReady && (
              <div style={{ position: "absolute", top: 2, right: 2, width: 15, height: 15, borderRadius: "50%", background: "#4ade80", border: "2.5px solid #fff" }} />
            )}
          </button>
          <div style={{ background: "rgba(20,50,80,.55)", borderRadius: 12, padding: "2px 12px", fontSize: 11.5, fontWeight: 800, color: waterReady || selStage < 0 ? "#c9ffe0" : "#ffd9a8", backdropFilter: "blur(4px)" }}>
            {selStage < 0 ? L("Ekish", "Посеять")
              : selPlot?.harvestReady ? L("Hosil!", "Урожай!")
              : waterReady ? L("Sug'orish", "Полить")
              : fTime(waterTimer)}
          </div>
        </div>

        <ForegroundLeaves />
      </div>

      {/* ══ MODALLAR ══════════════════════════════════════════ */}

      {showUnlock !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,25,45,.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(3px)" }} onClick={() => setShowUnlock(null)}>
          <div style={{ background: "linear-gradient(180deg,#fdfaf3,#f3ead6)", borderRadius: 28, padding: "26px 22px", width: "100%", maxWidth: 330, textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,.35)", border: "3px solid #e2cfa4" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 66, height: 66, margin: "0 auto 12px", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #c9bcb2, #a3928a)", display: "flex", alignItems: "center", justifyContent: "center" }}><LockSVG size={34} /></div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#3d2c14", marginBottom: 6 }}>{L("Yangi uchastka", "Новый участок")}</div>
            <div style={{ fontSize: 13.5, color: "#7a6a4f", marginBottom: 4 }}>{L("Ochish narxi:", "Стоимость:")}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
              <CoinSVG size={30} />
              <span style={{ fontSize: 24, fontWeight: 900, color: "#d97706" }}>{PLOTS.find(p => p.id === showUnlock)?.unlockCost.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "#9a8a6c", marginBottom: 18 }}>{L(`Sizda: ${coins.toLocaleString()} Coin`, `У вас: ${coins.toLocaleString()}`)}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowUnlock(null)} style={{ flex: 1, padding: 13, borderRadius: 16, border: "none", background: "#e8dcc2", color: "#7a6a4f", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>{L("Bekor", "Отмена")}</button>
              <button onClick={() => handleUnlock(showUnlock)} disabled={coins < (PLOTS.find(p => p.id === showUnlock)?.unlockCost || 0)}
                style={{ flex: 1.3, padding: 13, borderRadius: 16, border: "none", background: coins >= (PLOTS.find(p => p.id === showUnlock)?.unlockCost || 0) ? "linear-gradient(180deg,#fbbf24,#d97706)" : "#d9d2c2", color: "#fff", fontWeight: 900, cursor: coins >= (PLOTS.find(p => p.id === showUnlock)?.unlockCost || 0) ? "pointer" : "not-allowed", fontSize: 14, boxShadow: "0 4px 12px rgba(217,119,6,.35)" }}>
                🔓 {L("Ochish", "Открыть")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPlant !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,25,45,.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(3px)" }} onClick={() => setShowPlant(null)}>
          <div style={{ background: "linear-gradient(180deg,#f4fdf1,#e2f5d9)", borderRadius: 28, padding: "26px 22px", width: "100%", maxWidth: 330, textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,.35)", border: "3px solid #bfe3a8" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 50, marginBottom: 8 }}>🌰</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#1d3a14", marginBottom: 8 }}>{L("Baraka urug'ini ekish", "Посеять семя Бараки")}</div>
            <div style={{ fontSize: 13, color: "#4d6b42", lineHeight: 1.7, marginBottom: 20 }}>
              {L("Urug' ekib, muntazam sug'oring. Har bir moliyaviy amal daraxtingizni o'stiradi. Baraka daraxti bo'lganda katta mukofot!", "Посейте семя и регулярно поливайте. Каждое финансовое действие растит ваше дерево!")}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowPlant(null)} style={{ flex: 1, padding: 13, borderRadius: 16, border: "none", background: "#d7e8cc", color: "#4d6b42", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>{L("Bekor", "Отмена")}</button>
              <button onClick={() => handlePlant(showPlant)} style={{ flex: 1.3, padding: 13, borderRadius: 16, border: "none", background: "linear-gradient(180deg,#4ade80,#15803d)", color: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 12px rgba(21,128,61,.35)" }}>🌰 {L("Ekish", "Посеять")}</button>
            </div>
          </div>
        </div>
      )}

      {showInfo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,25,45,.7)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(3px)" }} onClick={() => setShowInfo(false)}>
          <div style={{ background: dark ? "#152238" : "#fff", borderRadius: "28px 28px 0 0", padding: "22px 20px calc(30px + env(safe-area-inset-bottom))", width: "100%", maxWidth: 480, maxHeight: "80dvh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 42, height: 4.5, borderRadius: 3, background: dark ? "#33455e" : "#e5e7eb", margin: "0 auto 16px" }} />
            <div style={{ fontSize: 17, fontWeight: 900, color: dark ? "#fff" : "#111", textAlign: "center", marginBottom: 16 }}>🌿 {L("Baraka Bog'i haqida", "О Саде Бараки")}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b", marginBottom: 10 }}>🪙 {L("Baraka Coin qanday olinadi?", "Как получить монеты?")}</div>
            {[
              ["💸", L("Xarajat qo'shish",   "Добавить расход"),      "+5🪙"],
              ["💰", L("Daromad qo'shish",   "Добавить доход"),       "+10🪙"],
              ["📷", L("QR kod skanerlash",  "Сканировать QR"),       "+10🪙"],
              ["🎯", L("Maqsad yaratish",    "Создать цель"),         "+20🪙"],
              ["✅", L("Maqsadga erishish",  "Достичь цели"),         "+50🪙"],
              ["💳", L("Qarzni yopish",      "Закрыть долг"),         "+30🪙"],
              ["👨‍👩‍👧", L("Oila a'zosi qo'shish", "Добавить участника"), "+15🪙"],
              ["📅", L("7 kun ketma-ket",    "7 дней подряд"),        "+25🪙"],
              ["🎁", L("Kunlik sovg'a",      "Ежедневный бонус"),     "+50🪙"],
              ["☀️", L("Quyosh yig'ish (3 soatda pishadi)", "Собрать солнце (зреет 3 часа)"), "+15⚡"],
              ["🚀", L("Tezlatish (−30 daqiqa)", "Ускорить (−30 минут)"), "−100🪙"],
            ].map(([ico, txt, val], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 10 ? `1px solid ${dark ? "#243652" : "#f3f4f6"}` : "none" }}>
                <span style={{ fontSize: 19, width: 28, textAlign: "center" }}>{ico}</span>
                <span style={{ flex: 1, fontSize: 13, color: dark ? "#cbd5e1" : "#444" }}>{txt}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b", background: dark ? "#3a2a08" : "#fef3c7", borderRadius: 10, padding: "3px 10px" }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: 14, background: dark ? "#0e1a2e" : "#f0fdf4", borderRadius: 16, fontSize: 13, color: dark ? "#86efac" : "#15803d", lineHeight: 1.8 }}>
              <b>{L("Uchastkalar ochilishi:", "Открытие участков:")}</b><br />
              {PLOTS.slice(1).map(p => <span key={p.id}>🔒 {p.unlockCost.toLocaleString()}🪙<br /></span>)}
              <br /><b>{L("O'sish bosqichlari:", "Стадии роста:")}</b><br />
              {STAGES.map(s => `${s.emoji} ${L(s.name, s.nameRu)}`).join(" → ")}
              <br /><br /><b>💡 {L("Maslahat:", "Совет:")}</b> {L("Har bir ekilgan o'simlik 3 soatda bitta quyosh chiqaradi — pishganda bosib yig'ing. Sug'orish taymerini 100 Coin evaziga 30 daqiqaga tezlatish mumkin!", "Каждое растение даёт солнце раз в 3 часа. Таймер полива можно ускорить на 30 минут за 100 монет!")}
            </div>
            <button onClick={() => setShowInfo(false)} style={{ width: "100%", marginTop: 16, padding: 15, background: "linear-gradient(180deg,#4ade80,#15803d)", border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
