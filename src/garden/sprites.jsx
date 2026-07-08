// ═══════════════════════════════════════════════════════════
//  GARDEN SPRITES — Baraka Bog'i illyustratsiyalari (DS 7)
//  Uslub: yumshoq 2D vektor, 2 tonli shading, kontur ≤2px.
//  Barcha ranglar gardenTokens.ART dan. React.memo + umumiy
//  <defs> (SVG reuse) — minimal DOM va rerender.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { ART } from "./gardenTokens.js";

/** Umumiy gradientlar — hujjatga BIR marta qo'yiladi. */
export const GardenDefs = memo(function GardenDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <radialGradient id="gdSun" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor={ART.sunHi} />
          <stop offset="45%" stopColor={ART.sun} />
          <stop offset="100%" stopColor={ART.sunLo} />
        </radialGradient>
        <linearGradient id="gdLeaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ART.leafHi} />
          <stop offset="100%" stopColor={ART.leaf} />
        </linearGradient>
        <linearGradient id="gdLeafDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ART.leaf} />
          <stop offset="100%" stopColor={ART.leafLo} />
        </linearGradient>
        <linearGradient id="gdTrunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={ART.trunkHi} />
          <stop offset="50%" stopColor={ART.trunk} />
          <stop offset="100%" stopColor={ART.trunkLo} />
        </linearGradient>
        <radialGradient id="gdDirt" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor={ART.soilHi} />
          <stop offset="60%" stopColor={ART.soil} />
          <stop offset="100%" stopColor={ART.soilLo} />
        </radialGradient>
        <radialGradient id="gdDirtLocked" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor={ART.lockSoil} />
          <stop offset="100%" stopColor={ART.lockSoilLo} />
        </radialGradient>
        <radialGradient id="gdCoin" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={ART.coinHi} />
          <stop offset="55%" stopColor={ART.coin} />
          <stop offset="100%" stopColor={ART.coinLo} />
        </radialGradient>
        <linearGradient id="gdCan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ART.waterHi} />
          <stop offset="100%" stopColor={ART.water} />
        </linearGradient>
        <linearGradient id="gdMeadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ART.grassHi} />
          <stop offset="55%" stopColor={ART.grass} />
          <stop offset="100%" stopColor={ART.grassLo} />
        </linearGradient>
        <radialGradient id="gdGem" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={ART.bloomHi} />
          <stop offset="55%" stopColor={ART.bloom} />
          <stop offset="100%" stopColor={ART.bloomLo} />
        </radialGradient>
      </defs>
    </svg>
  );
});

// ── Quyosh ──────────────────────────────────────────────────
export const SunSprite = memo(function SunSprite({ size = 58 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {Array.from({ length: 12 }).map((_, i) => (
        <polygon key={i} points="26.5,14 33.5,14 30,2" transform={"rotate(" + i * 30 + " 30 30)"} fill={ART.sunRay} opacity="0.95" />
      ))}
      <circle cx="30" cy="30" r="15" fill="url(#gdSun)" stroke={ART.sunHi} strokeWidth="1.5" />
      <ellipse cx="25" cy="24" rx="5" ry="3.5" fill={ART.sunHi} opacity="0.85" />
    </svg>
  );
});

// ── Oy (tungi osmon uchun) ──────────────────────────────────
export const MoonSprite = memo(function MoonSprite({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="16" fill={ART.sunHi} />
      <circle cx="30" cy="20" r="14" fill={ART.nightTop} opacity="0.92" />
      <circle cx="18" cy="28" r="2.2" fill={ART.sun} opacity="0.5" />
      <circle cx="23" cy="34" r="1.4" fill={ART.sun} opacity="0.4" />
    </svg>
  );
});

// ── Bulut ───────────────────────────────────────────────────
export const Cloud = memo(function Cloud({ w = 90, o = 1 }) {
  return (
    <svg width={w} height={w * 0.52} viewBox="0 0 100 52" style={{ display: "block" }}>
      <g opacity={o}>
        <path d="M14 44 Q 6 44 6 37 Q 6 30 14 29 Q 15 18 27 17 Q 31 6 45 7 Q 58 3 65 13 Q 78 11 82 21 Q 94 22 94 33 Q 94 43 84 44 Z" fill={ART.cloudLo} />
        <path d="M14 42 Q 6 42 6 35 Q 6 28 14 27 Q 15 16 27 15 Q 31 4 45 5 Q 58 1 65 11 Q 78 9 82 19 Q 94 20 94 31 Q 94 41 84 42 Z" fill={ART.cloud} />
        <path d="M20 27 Q 22 17 33 16 Q 38 8 49 9 Q 60 6 66 15" fill="none" stroke={ART.cloudHi} strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      </g>
    </svg>
  );
});

// ── Qush ("V" siluet, DS 7) ─────────────────────────────────
export const Bird = memo(function Bird({ size = 22 }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 22 11">
      <path d="M1 8 Q 6 1 11 7 Q 16 1 21 8" fill="none" stroke={ART.bird} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
});

// ── Panjara ─────────────────────────────────────────────────
export const Fence = memo(function Fence({ w = 130, flip = false }) {
  return (
    <svg width={w} height={w * 0.38} viewBox="0 0 130 50" style={{ display: "block", transform: flip ? "scaleX(-1)" : "none" }}>
      {[8, 34, 60, 86, 112].map((x, i) => (
        <g key={i}>
          <path d={"M" + x + " 12 L" + (x + 12) + " 12 L" + (x + 12) + " 46 L" + x + " 46 Z M" + x + " 12 L" + (x + 6) + " 4 L" + (x + 12) + " 12"} fill={ART.fence} />
          <path d={"M" + x + " 12 L" + (x + 6) + " 4 L" + (x + 12) + " 12 Z"} fill={ART.fenceLo} />
        </g>
      ))}
      <rect x="0" y="20" width="130" height="6" rx="3" fill={ART.fence} />
      <rect x="0" y="34" width="130" height="6" rx="3" fill={ART.fenceLo} />
      <path d="M0 26 Q 20 14 42 24 T 86 22 T 130 26" stroke={ART.leafLo} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="19" r="3.4" fill={ART.leafHi} /><circle cx="72" cy="20" r="3" fill={ART.leafHi} /><circle cx="108" cy="21" r="3.2" fill={ART.leafHi} />
    </svg>
  );
});

// ── Buta ────────────────────────────────────────────────────
export const Bush = memo(function Bush({ w = 70 }) {
  return (
    <svg width={w} height={w * 0.9} viewBox="0 0 70 63">
      <ellipse cx="35" cy="40" rx="32" ry="23" fill="url(#gdLeafDark)" />
      <ellipse cx="22" cy="30" rx="18" ry="15" fill="url(#gdLeaf)" />
      <ellipse cx="46" cy="27" rx="16" ry="14" fill="url(#gdLeaf)" />
      <ellipse cx="16" cy="24" rx="4.5" ry="3" fill={ART.leafGlint} opacity="0.8" />
    </svg>
  );
});

// ── Old plan dekor barglari ─────────────────────────────────
export const ForegroundLeaves = memo(function ForegroundLeaves() {
  return (
    <svg viewBox="0 0 480 70" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 56, pointerEvents: "none" }}>
      <path d="M-5 70 Q 15 18 42 44 Q 60 10 84 48 L 84 70 Z" fill={ART.leafLo} />
      <path d="M30 70 Q 55 26 78 52 Q 96 20 118 56 L 118 70 Z" fill={ART.leaf} />
      <path d="M355 70 Q 375 22 400 48 Q 420 12 445 50 L 445 70 Z" fill={ART.leafLo} />
      <path d="M395 70 Q 420 30 442 54 Q 458 24 485 58 L 485 70 Z" fill={ART.leaf} />
      <ellipse cx="215" cy="66" rx="14" ry="6" fill={ART.grassHi} />
      <circle cx="205" cy="60" r="2.4" fill={ART.sunRay} /><circle cx="215" cy="57" r="2.4" fill={ART.sunRay} /><circle cx="225" cy="60" r="2.4" fill={ART.sunRay} />
    </svg>
  );
});

// ── Tanga ───────────────────────────────────────────────────
export const CoinSVG = memo(function CoinSVG({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill={ART.coinRim} />
      <circle cx="30" cy="28.5" r="27" fill="url(#gdCoin)" stroke={ART.coinHi} strokeWidth="2.5" />
      <circle cx="30" cy="28.5" r="19" fill="none" stroke={ART.coinLo} strokeWidth="2.5" opacity="0.7" />
      <path d="M30 16 l3.6 8 8.8.7 -6.7 5.8 2 8.6 -7.7-4.6 -7.7 4.6 2-8.6 -6.7-5.8 8.8-.7 Z" fill={ART.coinLo} />
      <ellipse cx="21" cy="17" rx="7" ry="4" fill={ART.sunHi} opacity="0.75" transform="rotate(-28 21 17)" />
    </svg>
  );
});

// ── Kristall ────────────────────────────────────────────────
export const GemSVG = memo(function GemSVG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M6 3 h12 l4 6 -10 12 L2 9 Z" fill="url(#gdGem)" stroke={ART.bloomLo} strokeWidth="0.8" />
      <path d="M6 3 l3 6 L2 9 Z M18 3 l-3 6 L22 9 Z M9 9 h6 l-3 12 Z" fill={ART.bloomHi} opacity="0.55" />
    </svg>
  );
});

// ── Sug'orish idishi ────────────────────────────────────────
export const CanSVG = memo(function CanSVG({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        {/* Sky-blue glossy metallic gradient for watering can body */}
        <linearGradient id="canBodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="30%" stopColor="#0ea5e9" />
          <stop offset="70%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        {/* Gold premium gradient for accents */}
        <linearGradient id="canGoldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        {/* Soft highlight reflection */}
        <linearGradient id="canGlint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="32" cy="54" rx="20" ry="4" fill="#000" opacity="0.15" />

      {/* Main Golden Back-Handle */}
      <path d="M42 22 C 54 22, 54 44, 40 44" stroke="url(#canGoldGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M42 22 C 54 22, 54 44, 40 44" stroke="#eab308" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* Spout (Sug'orish naychasi) - elegant curved */}
      <path d="M22 38 Q 6 36 6 22" stroke="url(#canBodyGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M22 38 Q 6 36 6 22" stroke="#e0f2fe" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />

      {/* Golden Sprinkle Head */}
      <path d="M3 24 L 9 20 L 7 16 L 1 20 Z" fill="url(#canGoldGrad)" stroke="#ca8a04" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Dynamic Water Sprays / Droplets coming out */}
      <circle cx="-1" cy="15" r="1.5" fill="#38bdf8" opacity="0.8" />
      <circle cx="2" cy="11" r="1.2" fill="#7dd3fc" opacity="0.9" />
      <circle cx="-3" cy="22" r="1.8" fill="#0ea5e9" opacity="0.75" />

      {/* Main Body Cylindrical Shape with rounded bottom */}
      <path d="M20 26 C 20 22, 44 22, 44 26 L 42 48 C 42 52, 22 52, 22 48 Z" fill="url(#canBodyGrad)" stroke="#0284c7" strokeWidth="1.5" />
      
      {/* Glossy Reflection Highlight */}
      <path d="M22 27 C 22 24, 42 24, 42 27 L 41 33 C 41 31, 23 31, 23 33 Z" fill="url(#canGlint)" />

      {/* Golden Star Emblem on the side (Symbolizing "Baraka" / Blessing) */}
      <path d="M32 30 L 33.8 33.6 L 37.8 34.2 L 34.9 37 L 35.6 41 L 32 39.1 L 28.4 41 L 29.1 37 L 26.2 34.2 L 30.2 33.6 Z" fill="url(#canGoldGrad)" stroke="#eab308" strokeWidth="0.8" />
      {/* Star sparkle core */}
      <circle cx="32" cy="35.5" r="1.5" fill="#fff" />

      {/* Top Handle (Sleek curve) */}
      <path d="M25 23 C 25 12, 39 12, 39 23" stroke="url(#canGoldGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* Magic Sparkle Stars around the can */}
      <path d="M12 12 L 13 14 L 15 15 L 13 16 L 12 18 L 11 16 L 9 15 L 11 14 Z" fill="#fef08a" opacity="0.9" transform="scale(0.8)" />
      <path d="M52 14 L 53 16 L 55 17 L 53 18 L 52 20 L 51 18 L 49 17 L 51 16 Z" fill="#fef08a" opacity="0.8" transform="scale(0.7) translate(10, 10)" />
    </svg>
  );
});

// ── Qulf ────────────────────────────────────────────────────
export const LockSVG = memo(function LockSVG({ size = 30, tone }) {
  const c = tone || ART.cloud;
  return (
    <svg width={size} height={size} viewBox="0 0 30 30">
      <rect x="6" y="13" width="18" height="13" rx="3.5" fill={c} />
      <path d="M10 13 v-3 a5 5 0 0 1 10 0 v3" stroke={c} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="15" cy="19" r="2" fill={ART.lockSoilLo} />
      <rect x="14" y="19" width="2" height="4" rx="1" fill={ART.lockSoilLo} />
    </svg>
  );
});

// ── Raketa (tezlashtirish) ──────────────────────────────────
export const RocketSVG = memo(function RocketSVG({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        {/* Sleek fiery body gradient */}
        <linearGradient id="rocketBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>
        {/* Vibrant orange golden fin gradient */}
        <linearGradient id="rocketFins" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        {/* Cockpit window sky reflection */}
        <linearGradient id="rocketWindow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        {/* Dynamic engine thruster flame gradient */}
        <linearGradient id="rocketFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fiery engine jet flame plume */}
      <path d="M22 44 Q32 63 32 63 Q32 63 42 44 Q32 49 22 44 Z" fill="url(#rocketFlame)" />
      <path d="M26 44 Q32 55 32 55 Q32 55 38 44 Q32 47 26 44 Z" fill="#fff" opacity="0.9" />

      {/* Aerodynamic side stabilizers (fins) */}
      <path d="M20 34 L8 45 C8 45 10 32 16 28 Z" fill="url(#rocketFins)" stroke="#9a3412" strokeWidth="1" />
      <path d="M44 34 L56 45 C56 45 54 32 48 28 Z" fill="url(#rocketFins)" stroke="#9a3412" strokeWidth="1" />

      {/* Main Rocket fuselage (body) */}
      <path d="M32 4 C32 4 45 18 43 41 L21 41 C19 18 32 4 32 4 Z" fill="url(#rocketBody)" stroke="#9f1239" strokeWidth="1" />

      {/* Sleek metallic nose cone */}
      <path d="M32 4 C32 4 38 12 38 17 L26 17 C26 12 32 4 32 4 Z" fill="url(#rocketFins)" stroke="#c2410c" strokeWidth="0.8" />

      {/* Engine exhaust ring */}
      <rect x="25" y="41" width="14" height="4" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="1" />

      {/* Futuristic cockpit glass porthole */}
      <circle cx="32" cy="25" r="7.5" fill="url(#rocketWindow)" stroke="#fef08a" strokeWidth="1.5" />
      {/* Glossy window highlight */}
      <path d="M28.5 22.5 A 5 5 0 0 1 35.5 22.5" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.8" />

      {/* Sparkles, glints, and energetic speed particles */}
      <circle cx="14" cy="16" r="1.5" fill="#fef08a" opacity="0.85" />
      <circle cx="50" cy="18" r="1.2" fill="#fff" opacity="0.9" />
      <circle cx="16" cy="52" r="1.5" fill="#f97316" opacity="0.7" />
      <circle cx="48" cy="54" r="1.8" fill="#fde047" opacity="0.75" />
    </svg>
  );
});

// ── Sovg'a qutisi ───────────────────────────────────────────
export const GiftSVG = memo(function GiftSVG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="3" y="10" width="18" height="11" rx="2" fill={ART.bloomLo} />
      <rect x="3" y="7" width="18" height="5" rx="1.5" fill={ART.bloom} />
      <rect x="10.5" y="7" width="3" height="14" fill={ART.coinHi} />
      <path d="M12 7 C 9 7 7 5 8 3.5 C 9 2 11.5 3.5 12 6.5 C 12.5 3.5 15 2 16 3.5 C 17 5 15 7 12 7 Z" fill={ART.sun} />
    </svg>
  );
});

// ── Urug' ───────────────────────────────────────────────────
export const SeedSVG = memo(function SeedSVG({ size = 32 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 40 32">
      <ellipse cx="20" cy="21" rx="12" ry="9.5" fill={ART.trunkLo} />
      <ellipse cx="20" cy="19" rx="10.5" ry="8.5" fill={ART.trunk} />
      <ellipse cx="16" cy="15" rx="3.6" ry="2.6" fill={ART.trunkHi} opacity="0.9" />
      <path d="M20 12 Q17 6 20 1 Q23 6 20 12Z" fill="url(#gdLeaf)" />
    </svg>
  );
});

// ── Belkurak (ekish animatsiyasi) ───────────────────────────
export const ShovelSVG = memo(function ShovelSVG({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30">
      <path d="M18 3 l9 9 -3.4 3.4 -9-9 Z" fill={ART.trunkHi} />
      <rect x="19.6" y="1.2" width="7" height="3.4" rx="1.7" fill={ART.trunk} transform="rotate(45 23 3)" />
      <path d="M4 26 Q 2 20 7 15 L 14.6 7.4 L 22.6 15.4 L 15 23 Q 10 28 4 26 Z" fill={ART.lockSoil} />
      <path d="M6 24 Q 5 20 8.5 16.5" stroke={ART.cloud} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
});

// ── Suv tomchisi ────────────────────────────────────────────
export const DropSVG = memo(function DropSVG({ size = 18 }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 18 24">
      <path d="M9 1 Q 16 12 16 16.5 A 7 7 0 0 1 2 16.5 Q 2 12 9 1 Z" fill={ART.water} />
      <ellipse cx="6.4" cy="15" rx="1.9" ry="3" fill={ART.waterHi} opacity="0.85" transform="rotate(-18 6.4 15)" />
    </svg>
  );
});

// ── Energiya (chaqmoq) ──────────────────────────────────────
export const BoltSVG = memo(function BoltSVG({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path d="M9 1 L3 9 h4 l-1 6 L12 7 H8 l1-6z" fill={ART.sun} stroke={ART.sunLo} strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
});

// ── Barg (level-up "konfetti" va nishonlar uchun) ──────────
export const LeafSVG = memo(function LeafSVG({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path d="M2 14 Q 2 4 14 2 Q 13 13 5 13 Q 3.6 13 2 14 Z" fill="url(#gdLeaf)" />
      <path d="M3.5 12.5 Q 7 9 12 4" stroke={ART.leafLo} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
});

// ── Gul (yutuq ikonkasi) ────────────────────────────────────
export const BloomSVG = memo(function BloomSVG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx="10" cy="6" rx="3" ry="4.2" fill={ART.bloom} transform={"rotate(" + a + " 10 10)"} />
      ))}
      <circle cx="10" cy="10" r="2.6" fill={ART.petalCore} />
    </svg>
  );
});

// ── Xarita (uchastkalar yutug'i) ────────────────────────────
export const MapSVG = memo(function MapSVG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <path d="M2 4 L7 2 L13 4 L18 2 V16 L13 18 L7 16 L2 18 Z" fill={ART.fence} stroke={ART.fenceLo} strokeWidth="1" strokeLinejoin="round" />
      <path d="M7 2 V16 M13 4 V18" stroke={ART.fenceLo} strokeWidth="1" />
      <circle cx="10" cy="9" r="2.2" fill={ART.fruit} />
      <path d="M10 11.2 L10 13.4" stroke={ART.fruit} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
});

// ── Daraxt shox-barg bo'lagi ────────────────────────────────
export const Lobe = memo(function Lobe({ cx, cy, rx, ry }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy + 2.6} rx={rx} ry={ry} fill={ART.leafLo} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#gdLeaf)" stroke={ART.leaf} strokeWidth="1.3" />
      <ellipse cx={cx - rx * 0.34} cy={cy - ry * 0.42} rx={rx * 0.3} ry={ry * 0.24} fill={ART.leafGlint} opacity="0.8" />
    </g>
  );
});

// ── O'simlik bosqichlari (0..6) ─────────────────────────────
export const PlantSVG = memo(function PlantSVG({ stage, size = 120, animated = true }) {
  const style = animated
    ? { animation: "gdSway 5s ease-in-out infinite", transformOrigin: "50% 100%", display: "block" }
    : { display: "block" };
  const leaf = "url(#gdLeaf)", leafD = "url(#gdLeafDark)", trunk = "url(#gdTrunk)";
  const s = [
    // 0: urug'
    <svg key="s0" style={style} width={size * 0.6} height={size * 0.42} viewBox="0 0 60 42">
      <ellipse cx="30" cy="30" rx="13" ry="10" fill={ART.trunkLo} />
      <ellipse cx="30" cy="27" rx="11" ry="9" fill={ART.trunk} />
      <ellipse cx="26" cy="23" rx="4" ry="3" fill={ART.trunkHi} opacity="0.9" />
      <path d="M30 20 Q27 12 30 6 Q33 12 30 20Z" fill={leaf} />
    </svg>,
    // 1: nihol
    <svg key="s1" style={style} width={size * 0.85} height={size * 0.8} viewBox="0 0 85 80">
      <path d="M42 78 Q 41 58 42 44" stroke={ART.leaf} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M42 50 C 20 46 12 28 18 20 C 34 18 44 32 42 50 Z" fill={leaf} />
      <path d="M42 50 C 30 42 26 32 26 26" stroke={ART.leafLo} strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M42 46 C 62 40 72 24 66 15 C 50 13 40 28 42 46 Z" fill={leafD} />
      <path d="M42 46 C 52 38 58 28 60 22" stroke={ART.leafLo} strokeWidth="2" fill="none" opacity="0.6" />
      <ellipse cx="24" cy="26" rx="4" ry="2.6" fill={ART.leafGlint} opacity="0.85" transform="rotate(-30 24 26)" />
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
      {[[28, 34], [44, 20], [62, 16], [74, 32], [64, 48], [36, 50], [50, 10]].map(([x, y], i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx={x} cy={y - 3.2} rx="2.6" ry="3.6" fill={i % 2 ? ART.bloomHi : ART.bloom} transform={"rotate(" + a + " " + x + " " + y + ")"} />)}
          <circle cx={x} cy={y} r="2" fill={ART.petalCore} />
        </g>
      ))}
    </svg>,
    // 5: mevali
    <svg key="s5" style={style} width={size} height={size * 1.18} viewBox="0 0 100 118">
      <path d="M45 116 L45 60 Q 40 50 30 46 L34 42 Q44 48 47 54 Q48 44 44 34 L50 32 Q53 44 52 54 Q56 47 66 43 L69 48 Q58 52 55 60 L55 116 Z" fill={trunk} />
      <Lobe cx={31} cy={41} rx={22} ry={15} />
      <Lobe cx={69} cy={41} rx={20} ry={14} />
      <Lobe cx={50} cy={22} rx={23} ry={16} />
      {[[30, 36], [48, 22], [66, 20], [74, 36], [62, 50], [38, 52], [50, 10]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5.4" fill={i % 2 ? ART.fruitAlt : ART.fruit} />
          <ellipse cx={x - 1.8} cy={y - 1.8} rx="1.8" ry="1.2" fill={ART.fruitHi} opacity="0.85" />
          <path d={"M" + x + " " + (y - 5) + " q1 -3 3 -4"} stroke={ART.fruitStem} strokeWidth="1.4" fill="none" />
        </g>
      ))}
    </svg>,
    // 6: baraka daraxti (oltin)
    <svg key="s6" style={style} width={size} height={size * 1.26} viewBox="0 0 100 126">
      <path d="M44 124 L44 64 Q 38 52 27 48 L31 43 Q43 50 46 57 Q47 46 43 35 L50 33 Q53 46 52 57 Q57 49 68 45 L71 50 Q59 55 56 64 L56 124 Z" fill={trunk} />
      <Lobe cx={29} cy={43} rx={24} ry={17} />
      <Lobe cx={71} cy={43} rx={22} ry={16} />
      <Lobe cx={50} cy={19} rx={25} ry={17} />
      {[[28, 38], [46, 22], [64, 18], [75, 34], [65, 52], [34, 54], [50, 8]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5.6" fill="url(#gdCoin)" stroke={ART.coinLo} strokeWidth="1" />
          <path d={"M" + x + " " + (y - 2.6) + " l1 2 2.2.2 -1.7 1.5 .5 2.2 -2-1.2 -2 1.2 .5-2.2 -1.7-1.5 2.2-.2 Z"} fill={ART.coinLo} />
        </g>
      ))}
      <ellipse cx="26" cy="24" rx="6" ry="4" fill={ART.sunHi} opacity="0.85" />
    </svg>,
  ];
  return s[Math.min(Math.max(stage, 0), s.length - 1)];
});

// ── Yer uchastkasi (dirt oval) ──────────────────────────────
export const PlotOval = memo(function PlotOval({ w, locked, cost, children, onClick, selected }) {
  return (
    <div onClick={onClick} style={{ position: "relative", width: w, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
      <svg viewBox="0 0 120 62" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "120 / 62", filter: selected ? "drop-shadow(0 0 8px " + ART.sunHi + ")" : "none" }}>
        <ellipse cx="60" cy="31" rx="59" ry="30" fill={locked ? ART.lockSoil : ART.grassLo} />
        <ellipse cx="60" cy="31" rx="54" ry="26.5" fill={locked ? "url(#gdDirtLocked)" : "url(#gdDirt)"} />
        <ellipse cx="60" cy="33" rx="47" ry="21" fill={locked ? ART.lockSoilLo : ART.soilLo} />
        {!locked && <>
          <circle cx="44" cy="40" r="1.6" fill={ART.soilDot} /><circle cx="70" cy="43" r="1.3" fill={ART.soilDot} />
          <circle cx="58" cy="46" r="1.1" fill={ART.soilDot} /><circle cx="80" cy="36" r="1.4" fill={ART.soilDot} />
          <path d="M18 18 q2 -6 5 -7 q-1 6 -5 7 Z M23 16 q4 -4 7 -3 q-3 5 -7 3 Z" fill={ART.grassHi} />
          <path d="M96 50 q2 -6 5 -7 q-1 6 -5 7 Z M101 48 q4 -4 7 -3 q-3 5 -7 3 Z" fill={ART.grassHi} />
        </>}
      </svg>
      {children}
      {locked && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
          <LockSVG size={24} />
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <CoinSVG size={13} />
            <span style={{ fontSize: 11, fontWeight: 800, color: ART.cloud, textShadow: "0 1px 3px " + ART.trunkLo }}>{cost?.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
});
