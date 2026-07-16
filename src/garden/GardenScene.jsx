// ═══════════════════════════════════════════════════════════
//  GARDEN SCENE — sahifaning yuragi: tirik, interaktiv bog'
//  Osmon (kun/kech/tun) · bulut drifti · qushlar · 5 uchastka ·
//  pishuvchi quyoshlar · sug'orish/hosil/ekish boshqaruvi.
//  Faqat SVG + CSS (transform/opacity) — 60fps WebView.
// ═══════════════════════════════════════════════════════════
import { memo, useState, useEffect } from "react";
import { RADIUS, SPACE, TYPE, SHADOW } from "../utils/tokens.js";
import { ART, SKY_GRAD } from "./gardenTokens.js";
import { SUN_POS, PLOT_POS, PLOT_SCALE, PLOTS, SPEEDUP_COST } from "./constants.js";
import {
  SunSprite, MoonSprite, Cloud, Bird, Fence, Bush, ForegroundLeaves,
  CoinSVG, CanSVG, GiftSVG, SeedSVG, ShovelSVG, DropSVG, RocketSVG,
  PlantSVG, PlotOval, BoltSVG,
} from "./sprites.jsx";

// ── Tungi yulduzlar (dekorativ, arzon) ──────────────────────
const NightStars = memo(function NightStars() {
  const pts = [[12, 14], [30, 8], [52, 18], [70, 10], [86, 20], [22, 30], [62, 32], [90, 38]];
  return (
    <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "55%", pointerEvents: "none" }}>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 ? 0.5 : 0.8} fill={ART.sunHi}
          style={{ animation: "gdTwinkle " + (2.4 + i * 0.4) + "s ease-in-out infinite" }} />
      ))}
    </svg>
  );
});

// ── Uchuvchi mukofot (+N tanga/energiya/quyosh) ─────────────
const FLY_ICONS = { coin: s => <CoinSVG size={s} />, bolt: s => <BoltSVG size={s} />, sun: s => <SunSprite size={s} /> };
const FlyReward = memo(function FlyReward({ item }) {
  const Ico = FLY_ICONS[item.icon] || FLY_ICONS.coin;
  return (
    <div style={{ position: "absolute", left: item.x + "%", top: item.y + "%", zIndex: 89, animation: "gdCoinFly 1.4s ease forwards", pointerEvents: "none", display: "flex", alignItems: "center", gap: SPACE.s1 }}>
      <span style={{ ...TYPE.subtitle, fontWeight: 800, color: ART.sunRay, textShadow: "0 2px 8px " + ART.trunkLo }}>{item.amount > 0 ? "+" + item.amount : item.amount}</span>
      {Ico(16)}
    </div>
  );
});

// ── Sug'orish animatsiyasi: tomchilar + halqa to'lqin ───────
const WaterFX = memo(function WaterFX() {
  return (
    <div style={{ position: "absolute", left: "50%", top: "-36%", transform: "translateX(-50%)", pointerEvents: "none" }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ position: "absolute", left: (i - 1.5) * 14, animation: "gdDrop .6s ease-in " + i * 0.12 + "s both" }}>
          <DropSVG size={12} />
        </div>
      ))}
      <div style={{ position: "absolute", left: -22, top: 52, width: 44, height: 16, border: "2px solid " + ART.waterHi, borderRadius: RADIUS.full, opacity: 0, animation: "gdRipple .5s ease-out .55s both" }} />
    </div>
  );
});

// ── Dekoratsiyalar SVGlari (Premium, Tirik va Animatsiyali) ─────────────────
const LolaSVG = () => (
  <div style={{ animation: "gdSway 3.2s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="26" height="34" viewBox="0 0 24 32" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="lolaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff8787" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="10" r="16" fill="url(#lolaGlow)" style={{ animation: "gdShimmer 2s infinite ease-in-out" }} />
      <path d="M12 12v16" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 22 Q 6 20 8 16" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 24 Q 18 22 16 18" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12 C 7 4, 17 4, 17 12 C 17 14, 7 14, 7 12 Z" fill="#ef4444" />
      <path d="M10 12 C 10 6, 14 6, 14 12 Z" fill="#f87171" />
      <circle cx="6" cy="6" r="1" fill="#fff" style={{ animation: "gdShimmer 1.8s infinite" }} />
      <circle cx="18" cy="8" r="0.8" fill="#fbbf24" style={{ animation: "gdShimmer 2.2s infinite" }} />
    </svg>
  </div>
);

const AtorgulSVG = () => (
  <div style={{ animation: "gdSway 3.6s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="28" height="36" viewBox="0 0 26 34" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="roseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fda4af" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="13" cy="11" r="18" fill="url(#roseGlow)" style={{ animation: "gdShimmer 2.5s infinite ease-in-out" }} />
      <path d="M13 14v16" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13 20 Q 8 19 9 15" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="13" cy="11" r="7" fill="#db2777" />
      <circle cx="13" cy="11" r="5" fill="#f43f5e" />
      <path d="M11 9 Q 13 6 15 9" fill="none" stroke="#fecdd3" strokeWidth="1.5" />
      <circle cx="13" cy="3" r="1" fill="#fff" style={{ animation: "gdShimmer 1.5s infinite" }} />
    </svg>
  </div>
);

const MoychechakSVG = () => (
  <div style={{ animation: "gdSway 4s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="30" height="34" viewBox="0 0 28 32" style={{ overflow: "visible" }}>
      <path d="M14 14v16" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="14" cy="5" rx="3" ry="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
      <ellipse cx="14" cy="17" rx="3" ry="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
      <ellipse cx="8" cy="11" rx="5" ry="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
      <ellipse cx="20" cy="11" rx="5" ry="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
      <circle cx="14" cy="11" r="4.5" fill="#eab308" />
    </svg>
  </div>
);

const ArchaSVG = () => (
  <div style={{ animation: "gdSway 4.4s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="36" height="48" viewBox="0 0 36 48" style={{ overflow: "visible" }}>
      <rect x="15" y="32" width="6" height="12" rx="1.5" fill="#78350f" />
      <polygon points="4,34 32,34 18,18" fill="#065f46" />
      <polygon points="6,24 30,24 18,10" fill="#047857" />
      <polygon points="9,14 27,14 18,2" fill="#059669" />
      <polygon points="18,1 19,3 21,3 19,4 20,6 18,5 16,6 17,4 15,3 17,3" fill="#fbbf24" style={{ animation: "gdShimmer 1.2s infinite" }} />
      <circle cx="13" cy="28" r="2.2" fill="#ef4444" style={{ animation: "gdShimmer 2s infinite" }} />
      <circle cx="23" cy="27" r="2" fill="#3b82f6" style={{ animation: "gdShimmer 2.5s infinite" }} />
    </svg>
  </div>
);

const CottageSVG = () => (
  <div style={{ animation: "gdSway 5.5s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="60" height="56" viewBox="0 0 60 56" style={{ overflow: "visible", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))" }}>
      <rect x="8" y="20" width="44" height="30" rx="4" fill="#fffaf0" stroke="#f5d0a9" strokeWidth="1.5" />
      <polygon points="4,20 30,2 56,20" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="24" y="32" width="12" height="18" rx="2" fill="#78350f" />
      <circle cx="33" cy="41" r="1" fill="#f59e0b" />
      <rect x="14" y="26" width="8" height="8" rx="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" style={{ animation: "gdShimmer 5s infinite ease-in-out" }} />
      <rect x="38" y="26" width="8" height="8" rx="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" style={{ animation: "gdShimmer 4s infinite ease-in-out" }} />
    </svg>
  </div>
);

const FavvoraSVG = () => (
  <div style={{ animation: "gdBounce 3s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="60" height="54" viewBox="0 0 60 54" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="fountainGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="24" r="22" fill="url(#fountainGlow)" style={{ animation: "gdShimmer 3s infinite" }} />
      <path d="M10 42 C 10 32, 50 32, 50 42 L 44 48 L 16 48 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
      <rect x="26" y="26" width="8" height="18" fill="#64748b" rx="1" />
      <path d="M18 26 C 18 20, 42 20, 42 26 L 36 30 L 24 30 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <g stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M30 14 Q 20 4 16 22" style={{ strokeDasharray: "10,5", animation: "gdSway 1s linear infinite" }} />
        <path d="M30 14 Q 40 4 44 22" style={{ strokeDasharray: "10,5", animation: "gdSway 1.2s linear infinite reverse" }} />
      </g>
      <circle cx="28" cy="18" r="1.2" fill="#fff" style={{ animation: "gdShimmer 1.1s infinite" }} />
      <circle cx="32" cy="16" r="1" fill="#fff" style={{ animation: "gdShimmer 1.4s infinite .2s" }} />
    </svg>
  </div>
);

const KamalakGuliSVG = () => (
  <div style={{ animation: "gdSway 2.8s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="28" height="34" viewBox="0 0 28 32" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4545" />
          <stop offset="25%" stopColor="#ffa500" />
          <stop offset="50%" stopColor="#ffff00" />
          <stop offset="75%" stopColor="#00ff00" />
          <stop offset="100%" stopColor="#00ffff" />
        </linearGradient>
      </defs>
      <path d="M14 14v16" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="14" cy="11" r="10" fill="url(#rainbowGrad)" opacity="0.85" />
      <circle cx="14" cy="11" r="5" fill="#ffffff" style={{ animation: "gdShimmer 2s infinite" }} />
      <circle cx="6" cy="4" r="1.5" fill="#f43f5e" style={{ animation: "gdShimmer 1.4s infinite" }} />
      <circle cx="22" cy="4" r="1.5" fill="#3b82f6" style={{ animation: "gdShimmer 1.8s infinite" }} />
    </svg>
  </div>
);

// ── Olcha Daraxti SVG (with falling sakura petal particles) ──
const OlchaDaraxtiSVG = () => (
  <div style={{ animation: "gdSway 4.8s ease-in-out infinite", transformOrigin: "bottom center", position: "relative" }}>
    <svg width="44" height="54" viewBox="0 0 44 54" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="sakuraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="24" fill="url(#sakuraGlow)" />
      <path d="M22 34 L22 48" stroke="#5c4033" strokeWidth="4" strokeLinecap="round" />
      <path d="M22 38 Q14 34 16 28" fill="none" stroke="#5c4033" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 36 Q30 32 28 26" fill="none" stroke="#5c4033" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="22" r="11" fill="#f472b6" />
      <circle cx="28" cy="22" r="11" fill="#f472b6" />
      <circle cx="22" cy="14" r="13" fill="#f43f5e" />
      <circle cx="18" cy="18" r="9" fill="#fbcfe8" />
      <circle cx="26" cy="18" r="9" fill="#fbcfe8" />
      <circle cx="14" cy="12" r="1.2" fill="#fff" style={{ animation: "gdShimmer 1.8s infinite" }} />
      <circle cx="30" cy="14" r="1" fill="#fff" style={{ animation: "gdShimmer 2.2s infinite 0.4s" }} />
    </svg>
  </div>
);

// ── Sehrli Favvora SVG (with pulsing neon elements) ──
const FavvoraSehrliSVG = () => (
  <div style={{ animation: "gdBounce 3.2s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="60" height="54" viewBox="0 0 60 54" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="magicFountGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="24" r="24" fill="url(#magicFountGlow)" style={{ animation: "gdShimmer 2.8s infinite" }} />
      <path d="M8 44 C 8 32, 52 32, 52 44 L 46 50 L 14 50 Z" fill="#475569" stroke="#334155" strokeWidth="1.5" />
      <rect x="25" y="24" width="10" height="20" fill="#64748b" rx="2" stroke="#475569" strokeWidth="1" />
      <path d="M16 26 C 16 18, 44 18, 44 26 L 38 31 L 22 31 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <g stroke="#a855f7" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M30 12 Q 18 2 12 24" style={{ strokeDasharray: "8,4", animation: "gdSway 0.8s linear infinite" }} />
        <path d="M30 12 Q 42 2 48 24" style={{ strokeDasharray: "8,4", animation: "gdSway 1s linear infinite reverse" }} />
        <path d="M30 12 L 30 2" stroke="#6366f1" strokeWidth="2.2" style={{ strokeDasharray: "6,4", animation: "gdSway 0.6s linear infinite" }} />
      </g>
      <circle cx="20" cy="10" r="1.5" fill="#fff" style={{ animation: "gdShimmer 1s infinite" }} />
      <circle cx="40" cy="8" r="2" fill="#fbbf24" style={{ animation: "gdShimmer 1.5s infinite 0.3s" }} />
    </svg>
  </div>
);

// ── Dam Olish Skameykasi SVG (Isometric wooden style) ──
const SkameykaSVG = () => (
  <div style={{ animation: "gdSway 6.5s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="48" height="36" viewBox="0 0 48 36" style={{ overflow: "visible" }}>
      <rect x="8" y="20" width="3" height="14" rx="1" fill="#1e293b" />
      <rect x="37" y="20" width="3" height="14" rx="1" fill="#1e293b" />
      <rect x="14" y="24" width="3.5" height="10" rx="1" fill="#334155" />
      <rect x="30.5" y="24" width="3.5" height="10" rx="1" fill="#334155" />
      <rect x="6" y="6" width="36" height="4" rx="1" fill="#b45309" stroke="#78350f" strokeWidth="1" />
      <rect x="6" y="11" width="36" height="4" rx="1" fill="#d97706" stroke="#78350f" strokeWidth="1" />
      <rect x="8" y="2" width="2.5" height="20" rx="0.5" fill="#1e293b" />
      <rect x="37" y="2" width="2.5" height="20" rx="0.5" fill="#1e293b" />
      <rect x="4" y="18" width="40" height="5" rx="1.5" fill="#92400e" stroke="#78350f" strokeWidth="1" />
    </svg>
  </div>
);

// ── Baxt Toshi (Zen stacked balancing stones) ──
const ToshSVG = () => (
  <div style={{ animation: "gdSway 7.5s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="34" height="36" viewBox="0 0 34 36" style={{ overflow: "visible" }}>
      <ellipse cx="17" cy="28" rx="16" ry="7" fill="#64748b" stroke="#475569" strokeWidth="1.2" />
      <ellipse cx="12" cy="26" rx="4" ry="2" fill="#22c55e" opacity="0.8" />
      <ellipse cx="17" cy="20" rx="12" ry="5.5" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" />
      <ellipse cx="17" cy="12" rx="8" ry="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
      <circle cx="17" cy="5" r="1.5" fill="#fbbf24" style={{ animation: "gdShimmer 1.5s infinite" }} />
    </svg>
  </div>
);

// ── Oltin Qasr SVG (The supreme palace) ──
const OltinQasrSVG = () => (
  <div style={{ animation: "gdBounce 4s ease-in-out infinite", transformOrigin: "bottom center" }}>
    <svg width="68" height="64" viewBox="0 0 68 64" style={{ overflow: "visible", filter: "drop-shadow(0 6px 15px rgba(234,179,8,0.3))" }}>
      <defs>
        <radialGradient id="castleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="34" cy="30" r="28" fill="url(#castleGlow)" />
      
      <rect x="16" y="28" width="36" height="26" rx="2" fill="#fbbf24" stroke="#ca8a04" strokeWidth="1.5" />
      <rect x="18" y="24" width="6" height="6" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />
      <rect x="31" y="24" width="6" height="6" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />
      <rect x="44" y="24" width="6" height="6" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />
      
      <rect x="28" y="12" width="12" height="24" fill="#fbbf24" stroke="#ca8a04" strokeWidth="1.5" />
      <polygon points="26,12 34,-2 42,12" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
      <circle cx="34" cy="18" r="2" fill="#fef08a" />

      <rect x="10" y="20" width="8" height="34" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1.2" />
      <polygon points="8,20 14,8 20,20" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />

      <rect x="50" y="20" width="8" height="34" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1.2" />
      <polygon points="48,20 54,8 60,20" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />

      <path d="M30 54 L30 42 C30 38, 38 38, 38 42 L38 54 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />

      <circle cx="34" cy="-4" r="1.5" fill="#fff" style={{ animation: "gdShimmer 1s infinite" }} />
      <circle cx="14" cy="6" r="1.2" fill="#fbbf24" style={{ animation: "gdShimmer 1.4s infinite 0.2s" }} />
      <circle cx="54" cy="6" r="1.2" fill="#fbbf24" style={{ animation: "gdShimmer 1.8s infinite 0.4s" }} />
    </svg>
  </div>
);

const DecorSprite = ({ id }) => {
  switch (id) {
    case "lola": return <LolaSVG />;
    case "atorgul": return <AtorgulSVG />;
    case "moychechak": return <MoychechakSVG />;
    case "archa": return <ArchaSVG />;
    case "uycha": return <CottageSVG />;
    case "favvora": return <FavvoraSVG />;
    case "kamalak_guli": return <KamalakGuliSVG />;
    case "olcha_daraxti": return <OlchaDaraxtiSVG />;
    case "favvora_sehrli": return <FavvoraSehrliSVG />;
    case "skameyka": return <SkameykaSVG />;
    case "tosh": return <ToshSVG />;
    case "oltin_qasr": return <OltinQasrSVG />;
    default: return null;
  }
};

const GoalTree = memo(function GoalTree({ goal, progress, onClick }) {
  if (!goal) return null;
  const stage = progress <= 25 ? 1 : progress <= 50 ? 2 : progress <= 75 ? 3 : progress <= 99 ? 4 : 5;
  return (
    <div onClick={onClick} style={{
      position: "absolute",
      left: "14%",
      top: "46%",
      transform: "translate(-50%, -100%)",
      zIndex: 14 + 5,
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      WebkitTapHighlightColor: "transparent",
      animation: "gdSway 5s ease-in-out infinite",
      transformOrigin: "bottom center"
    }}>
      <div style={{
        background: stage === 5 ? "linear-gradient(135deg, #fbbf24, #d97706)" : "rgba(15, 23, 42, 0.88)",
        color: "#ffffff",
        borderRadius: "12px",
        padding: "3px 8px",
        fontSize: "10px",
        fontWeight: "800",
        whiteSpace: "nowrap",
        marginBottom: "6px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        border: stage === 5 ? "1.5px solid #fff" : "1px solid rgba(255,255,255,0.15)",
        display: "flex",
        alignItems: "center",
        gap: "4px"
      }}>
        <span>🎯</span>
        <span>{goal.ism}</span>
        <span style={{ color: stage === 5 ? "#fff" : "#38bdf8" }}>{progress}%</span>
      </div>
      <svg width="64" height="74" viewBox="0 0 64 74" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="dreamGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={stage === 5 ? "#fbbf24" : "#38bdf8"} stopOpacity="0.45" />
            <stop offset="100%" stopColor={stage === 5 ? "#d97706" : "#0284c7"} stopOpacity="0" />
          </radialGradient>
        </defs>
        {stage >= 4 && (
          <circle cx="32" cy="30" r="32" fill="url(#dreamGlow)" style={{ animation: "gdShimmer 3s infinite ease-in-out" }} />
        )}
        {stage === 1 && (
          <g>
            <path d="M32 74 L32 50" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 58 Q22 52 24 46" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 52 Q42 46 38 40" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="46" r="2.5" fill="#a7f3d0" />
            <circle cx="38" cy="40" r="3" fill="#4ade80" />
          </g>
        )}
        {stage === 2 && (
          <g>
            <path d="M32 74 L32 44" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M32 56 Q20 48 24 40" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 48 Q44 42 40 34" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="40" r="7" fill="#22c55e" />
            <circle cx="24" cy="40" r="5" fill="#4ade80" />
            <circle cx="40" cy="34" r="6" fill="#10b981" />
          </g>
        )}
        {stage === 3 && (
          <g>
            <path d="M32 74 L32 38" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M32 54 Q18 44 20 34" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 46 Q46 38 42 28" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="32" cy="32" r="13" fill="#15803d" />
            <circle cx="22" cy="30" r="10" fill="#16a34a" />
            <circle cx="42" cy="26" r="11" fill="#22c55e" />
            <circle cx="32" cy="22" r="9" fill="#4ade80" />
          </g>
        )}
        {stage === 4 && (
          <g>
            <path d="M32 74 L32 32" stroke="#5c4033" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M32 50 Q14 40 18 28" fill="none" stroke="#5c4033" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 42 Q50 32 44 22" fill="none" stroke="#5c4033" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="24" r="18" fill="#ec4899" />
            <circle cx="18" cy="24" r="13" fill="#f472b6" />
            <circle cx="44" cy="20" r="14" fill="#a855f7" />
            <circle cx="32" cy="14" r="13" fill="#cbd5e1" />
            <circle cx="26" cy="18" r="2.5" fill="#fff" style={{ animation: "gdShimmer 1.5s infinite" }} />
            <circle cx="38" cy="14" r="2" fill="#fbbf24" style={{ animation: "gdShimmer 2s infinite 0.3s" }} />
          </g>
        )}
        {stage === 5 && (
          <g>
            <path d="M32 74 L32 30" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
            <path d="M32 48 Q12 36 16 22" fill="none" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M32 40 Q52 28 46 16" fill="none" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="32" cy="22" r="19" fill="#ca8a04" />
            <circle cx="16" cy="22" r="14" fill="#fbbf24" />
            <circle cx="46" cy="16" r="15" fill="#f59e0b" />
            <circle cx="32" cy="12" r="14" fill="#fef08a" />
            <path d="M16 12 L17 14 L19 14 L17 15 L18 17 L16 16 L14 17 L15 15 L13 14 L15 14" fill="#fff" style={{ animation: "gdShimmer 1.2s infinite" }} />
            <path d="M46 8 L47 10 L49 10 L47 11 L48 13 L46 12 L44 13 L45 11 L43 10 L45 10" fill="#fff" style={{ animation: "gdShimmer 1.8s infinite 0.4s" }} />
            <circle cx="32" cy="20" r="3" fill="#fff" style={{ animation: "gdShimmer 1s infinite" }} />
          </g>
        )}
      </svg>
    </div>
  );
});

export const GardenScene = memo(function GardenScene({
  gt, mode, t, plots, selected, coins, now, fTime,
  waterReady, waterTimer, digAnim, growAnim, waterAnim, sunNote,
  flyRewards, sunCycle,
  onPlotTap, onSunTap, onAction, onSpeedUp,
  full = false,
  decorations = [],
  placedDecorations = [],
  placingItem = null,
  tempCoord = null,
  onMeadowTap = null,
  onPlacedDecorClick = null,
  isPlacing = false,
  rainActive = false,
  guardians = { cat: false, bird: false },
  activeGoal = null,
  activeGoalProgress = 0,
  pests = [],
  onSquashPest = null,
  grassBlades = [],
  onGoalClick = null,
}) {
  const selPlot = plots.find(p => p.id === selected) || plots[0];
  const selStage = selPlot?.stage ?? -1;
  const showSpeedUp = !waterReady && selStage >= 0 && !selPlot?.harvestReady;
  const actionReady = waterReady || selStage < 0 || selPlot?.harvestReady;

  // ── Flying Watering Can local state ──
  const [flyingCan, setFlyingCan] = useState(null);

  useEffect(() => {
    if (waterAnim) {
      // Find growing trees that need water (excluding harvested and non-planted) sorted by ID
      let targets = plots.filter(p => p.stage >= 0 && !p.harvestReady)
                         .sort((a, b) => a.id - b.id);
      if (targets.length === 0) {
        // Fallback to selected plot if unlocked
        const sel = plots.find(p => p.id === selected);
        if (sel && (sel.id === 0 || sel.unlocked || sel.stage >= 0)) {
          targets = [sel];
        } else {
          targets = [plots[0]];
        }
      }

      let isCurrent = true;

      const runSequence = async () => {
        // Start near the action button at the bottom-right
        if (!isCurrent) return;
        setFlyingCan({ x: 88, y: 80, tilt: 0, opacity: 0, pouring: false, activePlotId: null });
        
        await new Promise(r => setTimeout(r, 100));
        if (!isCurrent) return;
        setFlyingCan(prev => prev ? { ...prev, opacity: 1 } : null);
        await new Promise(r => setTimeout(r, 400));

        // Coordinate positions for each plot ID
        const PLOT_COORDS = {
          0: { x: 50, y: 11 },
          1: { x: 26, y: 41 },
          2: { x: 75, y: 41 },
          3: { x: 35, y: 64 },
          4: { x: 65, y: 64 }
        };

        for (let i = 0; i < targets.length; i++) {
          if (!isCurrent) return;
          const t = targets[i];
          const c = PLOT_COORDS[t.id] || { x: 50, y: 50 };
          const destX = c.x + 8; // offset to look like pouring on center
          const destY = c.y - 12; // above the tree stage

          // 1. Fly to target
          setFlyingCan(prev => prev ? {
            ...prev,
            x: destX,
            y: destY,
            tilt: 0,
            pouring: false,
            activePlotId: null
          } : null);
          await new Promise(r => setTimeout(r, 1200));

          if (!isCurrent) return;
          // 2. Tilt to pour
          setFlyingCan(prev => prev ? {
            ...prev,
            tilt: -25,
            pouring: false,
            activePlotId: null
          } : null);
          await new Promise(r => setTimeout(r, 300));

          if (!isCurrent) return;
          // 3. Pour water
          setFlyingCan(prev => prev ? {
            ...prev,
            pouring: true,
            activePlotId: t.id
          } : null);
          await new Promise(r => setTimeout(r, 1800));

          if (!isCurrent) return;
          // 4. Stand straight
          setFlyingCan(prev => prev ? {
            ...prev,
            tilt: 0,
            pouring: false,
            activePlotId: null
          } : null);
          await new Promise(r => setTimeout(r, 400));
        }

        if (!isCurrent) return;
        // 5. Fly back home
        setFlyingCan(prev => prev ? {
          ...prev,
          x: 88,
          y: 80,
          tilt: 0,
          pouring: false,
          activePlotId: null
        } : null);
        await new Promise(r => setTimeout(r, 1200));

        if (!isCurrent) return;
        // 6. Fade out
        setFlyingCan(prev => prev ? { ...prev, opacity: 0 } : null);
        await new Promise(r => setTimeout(r, 400));

        if (!isCurrent) return;
        setFlyingCan(null);
      };

      runSequence();
      return () => {
        isCurrent = false;
      };
    } else {
      setFlyingCan(null);
    }
  }, [waterAnim, plots, selected]);

  return (
    <div className={full ? "gd-scene-full" : undefined} style={full
      ? { background: SKY_GRAD[mode], userSelect: "none" }
      : { position: "relative", borderRadius: RADIUS.l, overflow: "hidden", background: SKY_GRAD[mode], boxShadow: SHADOW.e2, userSelect: "none", border: "1px solid " + gt.bor }}>
      
      {/* ── Custom keyframes for rain and sakura petals ── */}
      <style>{`
        @keyframes gdRainFall {
          0% { transform: translateY(-80px) translateX(0); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(100vh) translateX(45px); opacity: 0; }
        }
        @keyframes gdStormCloudLeft {
          0% { transform: translateX(-240px) translateY(-15px); opacity: 0; }
          100% { transform: translateX(0) translateY(0); opacity: 0.96; }
        }
        @keyframes gdStormCloudRight {
          0% { transform: translateX(240px) translateY(-15px); opacity: 0; }
          100% { transform: translateX(0) translateY(0); opacity: 0.96; }
        }
        @keyframes gdPetalDrift {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
          100% { transform: translate(25px, 48px) rotate(240deg); opacity: 0; }
        }
        @keyframes gdCanBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-6deg); }
        }
      `}</style>

      {/* ── Ambient Darken during rain ── */}
      {rainActive && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 23, 42, 0.32)",
          mixBlendMode: "multiply",
          zIndex: 9,
          pointerEvents: "none",
          transition: "background 1s ease-in-out"
        }} />
      )}

      {/* ── Immersive Storm Clouds ── */}
      {rainActive && (
        <div style={{ position: "absolute", inset: 0, zIndex: 15, pointerEvents: "none" }}>
          <div style={{
            position: "absolute",
            left: "-5%",
            top: "calc(env(safe-area-inset-top) + 2%)",
            animation: "gdStormCloudLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.45))"
          }}>
            <svg width="190" height="95" viewBox="0 0 100 50" fill="#2d3748">
              <path d="M10 40 A 15 15 0 0 1 22 15 A 22 22 0 0 1 65 12 A 18 18 0 0 1 90 32 A 12 12 0 0 1 85 45 Z" />
              <path d="M15 42 A 12 12 0 0 1 25 22 A 18 18 0 0 1 60 20 A 14 14 0 0 1 80 36 Z" fill="#1a202c" />
            </svg>
          </div>
          <div style={{
            position: "absolute",
            right: "-5%",
            top: "calc(env(safe-area-inset-top) + 6%)",
            animation: "gdStormCloudRight 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.45))"
          }}>
            <svg width="170" height="85" viewBox="0 0 100 50" fill="#4a5568">
              <path d="M10 40 A 15 15 0 0 1 22 15 A 22 22 0 0 1 65 12 A 18 18 0 0 1 90 32 A 12 12 0 0 1 85 45 Z" />
              <path d="M20 44 A 10 10 0 0 1 28 26 A 15 15 0 0 1 58 24 A 12 12 0 0 1 75 38 Z" fill="#2d3748" />
            </svg>
          </div>
        </div>
      )}

      {/* ── Screen-wide Rain Drops ── */}
      {rainActive && (
        <div style={{ position: "absolute", inset: 0, zIndex: 14, pointerEvents: "none", overflow: "hidden" }}>
          {Array.from({ length: 32 }).map((_, i) => {
            const left = (i * 3.1) + (Math.random() * 2);
            const delay = Math.random() * 1.5;
            const duration = 0.5 + Math.random() * 0.35;
            const height = 25 + Math.random() * 22;
            return (
              <div key={i} style={{
                position: "absolute",
                width: "1.4px",
                height: `${height}px`,
                background: "linear-gradient(to bottom, rgba(186, 230, 253, 0), rgba(56, 189, 248, 0.9))",
                left: `${left}%`,
                top: "-60px",
                animation: `gdRainFall ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
                transform: "rotate(10deg)",
              }} />
            );
          })}
        </div>
      )}

      {/* ── Yorug'lik nuri ── */}
      {mode === "day" && (
        <div style={{ position: "absolute", top: "-14%", left: "-24%", width: "70%", height: "90%", background: "linear-gradient(115deg," + gt.ray1 + "," + gt.ray0 + " 62%)", transform: "rotate(8deg)", pointerEvents: "none", animation: "gdRay 6s ease-in-out infinite" }} />
      )}
      {mode === "night" && <NightStars />}

      {/* ── Dekorativ quyosh/oy ── */}
      <div style={{ position: "absolute", left: "6%", top: full ? "calc(4% + env(safe-area-inset-top))" : "4%", pointerEvents: "none", animation: mode === "night" ? "none" : "gdSunGlow 4s ease-in-out infinite" }}>
        {mode === "night" ? (
          <MoonSprite size={44} />
        ) : decorations?.includes("quyosh") ? (
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SunSprite size={58} />
            <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "2px dashed " + ART.sunRay, animation: "gdSway 6s linear infinite" }} />
          </div>
        ) : (
          <SunSprite size={50} />
        )}
      </div>

      {/* ── Osmon: bulutlar, qushlar, pishuvchi quyoshlar ── */}
      <div className={full ? "gd-sky-full" : undefined} style={full
        ? undefined
        : { position: "relative", height: "clamp(150px, 32vw, 200px)", zIndex: 10 }}>
        <div style={{ position: "absolute", left: "16%", top: "30%", animation: "gdDrift 70s ease-in-out infinite" }}><Cloud w={70} o={0.9} /></div>
        <div style={{ position: "absolute", right: "8%", top: "8%", animation: "gdDrift 90s ease-in-out infinite reverse" }}><Cloud w={100} /></div>
        <div style={{ position: "absolute", right: "34%", top: "52%", animation: "gdDrift 60s ease-in-out infinite" }}><Cloud w={52} o={0.85} /></div>
        <div style={{ position: "absolute", top: "22%", left: 0, animation: "gdBird 34s linear infinite", opacity: 0 }}><Bird size={20} /></div>
        <div style={{ position: "absolute", top: "40%", left: 0, animation: "gdBird 46s linear 12s infinite", opacity: 0 }}><Bird size={14} /></div>

        {plots.filter(p => p.stage >= 0).map(p => {
          const pos = SUN_POS[p.id] || SUN_POS[0];
          const rem = Math.max(0, Math.ceil((sunCycle - (now - (p.lastSunAt || 0))) / 1000));
          const ready = rem <= 0;
          return (
            <div key={p.id} onClick={() => onSunTap(p.id, ready)}
              style={{ position: "absolute", left: pos.x + "%", top: pos.y + "%", transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, WebkitTapHighlightColor: "transparent" }}>
              {!ready && sunNote !== p.id && (
                <div style={{ background: gt.skyScrim, borderRadius: RADIUS.pill, padding: SPACE.s1 - 1 + "px " + (SPACE.s2 + 2) + "px", ...TYPE.caption, fontWeight: 700, color: gt.onSky, fontVariantNumeric: "tabular-nums" }}>{fTime(rem)}</div>
              )}
              {sunNote === p.id && (
                <div style={{ maxWidth: 150, textAlign: "center", ...TYPE.caption, fontWeight: 800, color: gt.onSky, lineHeight: 1.35, textShadow: "0 1px 3px " + ART.trunkLo, animation: "gdNote 3s ease forwards", pointerEvents: "none" }}>
                  {t("g199")}
                </div>
              )}
              <div style={{ animation: ready ? "gdSunPulse 2s ease-in-out infinite, gdSunGlow 2s ease-in-out infinite" : "none", opacity: ready ? 1 : 0.88, transform: ready ? "none" : "scale(.86)" }}>
                <SunSprite size={48} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Yaylov ── */}
      <div className={full ? "gd-meadow-full" : undefined} style={full
        ? undefined
        : { position: "relative", height: "clamp(300px, 68vw, 420px)", zIndex: 11 }}>
        <svg viewBox="0 0 480 80" preserveAspectRatio="none" style={{ position: "absolute", top: -46, left: 0, width: "100%", height: 60 }}>
          <path d="M0 80 Q 90 6 230 34 Q 260 40 300 28 Q 390 4 480 42 L480 80 Z" fill={ART.grassHi} />
          <ellipse cx="415" cy="34" rx="14" ry="9" fill={ART.leafLo} />
          <ellipse cx="368" cy="44" rx="9" ry="6" fill={ART.leafLo} />
        </svg>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg," + ART.grassHi + " 0%," + ART.grass + " 45%," + ART.grassLo + " 100%)" }} />

        <div style={{ position: "absolute", top: -8, left: "4%" }}><Fence w={150} /></div>
        <div style={{ position: "absolute", top: "24%", right: "-2%" }}><Fence w={120} flip /></div>
        <div style={{ position: "absolute", top: -20, left: -22 }}><Bush w={82} /></div>
        <div style={{ position: "absolute", top: "38%", left: -30 }}><Bush w={64} /></div>

        {/* Dynamic Placed Decorations */}
        {placedDecorations && placedDecorations.map((p) => (
          <div key={p.instanceId} onClick={(e) => { e.stopPropagation(); if (onPlacedDecorClick) onPlacedDecorClick(p); }}
            style={{ position: "absolute", left: p.x + "%", top: p.y + "%", transform: "translate(-50%, -50%)", zIndex: Math.round(p.y) + 12, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
            <DecorSprite id={p.itemId} />
          </div>
        ))}

        {/* Dynamic growing grass and flower blades from rain */}
        {grassBlades && grassBlades.map(g => (
          <div key={g.id} style={{
            position: "absolute",
            left: g.x + "%",
            top: g.y + "%",
            transform: "translate(-50%, -100%)",
            fontSize: g.size,
            zIndex: Math.round(g.y) + 1,
            pointerEvents: "none",
            animation: "gdSway 4s ease-in-out infinite",
            transformOrigin: "bottom center"
          }}>
            {g.type === "grass" ? "🌱" : g.type === "flower_daisy" ? "🌼" : "🌷"}
          </div>
        ))}

        {/* Orzu Daraxti (Financial Goal Tree) */}
        {activeGoal && (
          <GoalTree goal={activeGoal} progress={activeGoalProgress} onClick={onGoalClick} />
        )}

        {/* Cat Guardian */}
        {guardians && guardians.cat && (
          <div style={{
            position: "absolute",
            left: "24%",
            top: "22%",
            transform: "translate(-50%, -50%)",
            fontSize: 28,
            zIndex: 15,
            animation: "gdBounce 3s ease-in-out infinite",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            cursor: "pointer"
          }} title={t("dec_mushuk_qoriqchi_name")}>
            🐱
          </div>
        )}

        {/* Bird Guardian */}
        {guardians && guardians.bird && (
          <div style={{
            position: "absolute",
            right: "22%",
            top: "24%",
            transform: "translate(-50%, -50%) scaleX(-1)",
            fontSize: 26,
            zIndex: 15,
            animation: "gdCanBounce 2.5s ease-in-out infinite",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            cursor: "pointer"
          }} title={t("dec_qush_qoriqchi_name")}>
            🐦
          </div>
        )}

        {/* Visual Pests (shira, hasharotlar) */}
        {pests && pests.map(pest => {
          const plotPos = PLOT_POS[pest.plotId] || { left: "50%", top: "50%" };
          return (
            <div key={pest.id} onClick={(e) => { e.stopPropagation(); if (onSquashPest) onSquashPest(pest.id); }}
              style={{
                position: "absolute",
                left: `calc(${plotPos.left} + ${pest.offsetX}px)`,
                top: `calc(${plotPos.top} - 15px + ${pest.offsetY}px)`,
                transform: "translate(-50%, -50%)",
                zIndex: plotPos.z + 15,
                fontSize: 20,
                cursor: "pointer",
                animation: "gdBounce 0.8s ease-in-out infinite",
                WebkitTapHighlightColor: "transparent",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
              }} title={t("g200")}>
              🐛
            </div>
          );
        })}

        {/* Placement Mode Preview */}
        {isPlacing && tempCoord && placingItem && (
          <div style={{ position: "absolute", left: tempCoord.x + "%", top: tempCoord.y + "%", transform: "translate(-50%, -50%) scale(1.05)", zIndex: Math.round(tempCoord.y) + 18, pointerEvents: "none", opacity: 0.88 }}>
            <div style={{ position: "absolute", left: "50%", bottom: -12, width: 40, height: 12, borderRadius: "50%", background: "rgba(34, 197, 94, 0.25)", border: "2px dashed #22c55e", transform: "translateX(-50%)", animation: "gdShimmer 1s infinite" }} />
            <DecorSprite id={placingItem.id} />
          </div>
        )}

        {/* Interactive Placement Click Capturer */}
        {isPlacing && onMeadowTap && (
          <div onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
            onMeadowTap(Math.max(4, Math.min(96, x)), Math.max(12, Math.min(84, y)));
          }}
          style={{ position: "absolute", inset: 0, zIndex: 45, cursor: "crosshair", background: "rgba(34,197,94,0.06)", border: "2.5px dashed #22c55e", borderRadius: RADIUS.l }} />
        )}

        {plots.map(plot => {
          const pos = PLOT_POS[plot.id];
          const pl = PLOTS.find(p => p.id === plot.id);
          const isUnlocked = plot.id === 0 || plot.unlocked || plot.stage >= 0;
          const isDigging = digAnim?.plotId === plot.id;
          return (
            <div key={plot.id} style={{ position: "absolute", left: pos.left, top: pos.top, transform: "translateX(-50%)", width: pos.w, zIndex: pos.z }}>
              <PlotOval w="100%" locked={!isUnlocked} cost={pl?.unlockCost}
                selected={selected === plot.id && isUnlocked && plot.stage >= 0}
                onClick={() => onPlotTap(plot)}>
                {isUnlocked && plot.stage >= 0 && !isDigging && (
                  <div style={{ position: "absolute", left: "50%", bottom: "42%", transform: "translateX(-50%)", animation: growAnim === plot.id ? "gdGrowPop .8s ease" : "none", pointerEvents: "none" }}>
                    <PlantSVG stage={plot.stage} size={110 * PLOT_SCALE[plot.id]} animated={plot.stage >= 1} />
                  </div>
                )}
                {growAnim === plot.id && (
                  <div style={{ position: "absolute", left: "50%", bottom: "60%", pointerEvents: "none" }}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{ position: "absolute", left: (i - 2.5) * 13, animation: "gdLeafBurst .9s ease-out " + i * 0.06 + "s both" }}>
                        <svg width="12" height="12" viewBox="0 0 16 16"><path d="M2 14 Q 2 4 14 2 Q 13 13 5 13 Q 3.6 13 2 14 Z" fill={i % 2 ? ART.leafHi : ART.grass} /></svg>
                      </div>
                    ))}
                  </div>
                )}
                {isDigging && (
                  <div style={{ position: "absolute", left: "50%", top: "50%", animation: "gdDig .38s ease infinite", pointerEvents: "none" }}>
                    <ShovelSVG size={30} />
                  </div>
                )}
                {(flyingCan?.pouring && flyingCan?.activePlotId === plot.id) && <WaterFX />}
                {plot.harvestReady && (
                  <div style={{ position: "absolute", right: "6%", top: "-24%", animation: "gdShimmer 1.6s ease-in-out infinite, gdBounce 1.6s ease-in-out infinite", pointerEvents: "none" }}>
                    <GiftSVG size={30} />
                  </div>
                )}
              </PlotOval>
            </div>
          );
        })}

        {/* ── Tanga hisoblagichi (chap past) ── */}
        <div style={{ position: "absolute", left: SPACE.s4, bottom: full ? "max(" + SPACE.s4 + "px, env(safe-area-inset-bottom))" : SPACE.s4, zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: SPACE.s1 }}>
          <CoinSVG size={54} />
          <div style={{ background: gt.sceneScrim, borderRadius: RADIUS.pill, padding: (SPACE.s1 - 2) + "px " + SPACE.s4 + "px", ...TYPE.caption, fontWeight: 800, color: gt.onSky, fontVariantNumeric: "tabular-nums" }}>{coins.toLocaleString()}</div>
        </div>

        {/* ── Tezlashtirish (markaz past) ── */}
        {showSpeedUp && (
          <button onClick={onSpeedUp} className="ui-press" style={{ position: "absolute", left: "50%", bottom: full ? "max(" + SPACE.s4 + "px, env(safe-area-inset-bottom))" : SPACE.s4, transform: "translateX(-50%)", zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: SPACE.s1, cursor: "pointer", background: "transparent", border: "none", fontFamily: "inherit", WebkitTapHighlightColor: "transparent", padding: 0 }}>
            <div style={{ animation: "gdBounce 1.8s ease-in-out infinite" }}><RocketSVG size={34} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s1 }}>
              <CoinSVG size={16} />
              <span style={{ ...TYPE.body, fontWeight: 800, color: gt.onSky, textShadow: "0 1px 4px " + ART.trunkLo }}>−{SPEEDUP_COST}</span>
            </div>
            <div style={{ background: gt.goldGrad, borderRadius: RADIUS.pill, padding: (SPACE.s1 + 1) + "px " + SPACE.s4 + "px", ...TYPE.caption, fontWeight: 800, color: gt.onSky, boxShadow: SHADOW.e1(ART.sunLo) }}>
              {t("g201")}
            </div>
          </button>
        )}

        {/* ── Asosiy harakat (o'ng past): ekish / sug'orish / hosil ── */}
        <div style={{ position: "absolute", right: SPACE.s4, bottom: full ? "max(" + SPACE.s4 + "px, env(safe-area-inset-bottom))" : SPACE.s4, zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: SPACE.s1 }}>
          <button onClick={onAction} className="ui-press-fab ui-press" aria-label={t("g202")}
            style={{ 
              width: 72, 
              height: 72, 
              borderRadius: RADIUS.full, 
              border: "3px solid " + (waterReady && selStage >= 0 && !selPlot?.harvestReady ? "#7dd3fc" : gt.glassBorder), 
              cursor: "pointer", 
              background: waterReady && selStage >= 0 && !selPlot?.harvestReady 
                ? "linear-gradient(135deg, #38bdf8, #0284c7)" 
                : actionReady 
                  ? gt.accGrad 
                  : "linear-gradient(135deg," + gt.ink3 + "," + gt.ink2 + ")", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              boxShadow: waterReady && selStage >= 0 && !selPlot?.harvestReady
                ? "0 0 20px rgba(56, 189, 248, 0.75)"
                : SHADOW.e1(actionReady ? ART.leafLo : gt.ink3), 
              position: "relative", 
              WebkitTapHighlightColor: "transparent" 
            }}>
            {selStage < 0
              ? <SeedSVG size={40} />
              : selPlot?.harvestReady
                ? <GiftSVG size={36} />
                : (
                  <div style={{ 
                    animation: waterReady ? "gdCanBounce 2s ease-in-out infinite" : "none",
                    opacity: (waterAnim || flyingCan) ? 0 : 1,
                    transition: "opacity 0.3s ease-in-out",
                    pointerEvents: (waterAnim || flyingCan) ? "none" : "auto"
                  }}>
                    <CanSVG size={48} />
                  </div>
                )}
            {waterReady && selStage >= 0 && !selPlot?.harvestReady && (
              <div style={{ position: "absolute", top: 2, right: 2, width: 14, height: 14, borderRadius: RADIUS.full, background: ART.leafHi, border: "2.5px solid " + gt.sur }} />
            )}
          </button>
          <div style={{ background: gt.sceneScrim, borderRadius: RADIUS.pill, padding: (SPACE.s1 - 2) + "px " + SPACE.s3 + "px", ...TYPE.caption, fontWeight: 800, color: actionReady ? ART.leafGlint : ART.coinHi, fontVariantNumeric: "tabular-nums" }}>
            {selStage < 0 ? t("g153")
              : selPlot?.harvestReady ? t("g203")
              : waterReady ? t("g204")
              : fTime(waterTimer)}
          </div>
        </div>

        {/* Animated Flying Watering Can overlay */}
        {flyingCan && (
          <div style={{
            position: "absolute",
            left: flyingCan.x + "%",
            top: flyingCan.y + "%",
            transform: "translate(-50%, -50%) rotate(" + flyingCan.tilt + "deg)",
            zIndex: 99,
            pointerEvents: "none",
            opacity: flyingCan.opacity,
            transition: "left 0.8s cubic-bezier(0.16, 1, 0.3, 1), top 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s ease-out, opacity 0.3s ease-out"
          }}>
            <CanSVG size={60} />
          </div>
        )}

        <ForegroundLeaves />
      </div>

      {/* ── Uchuvchi mukofotlar ── */}
      {flyRewards.map(c => <FlyReward key={c.id} item={c} />)}
    </div>
  );
});
