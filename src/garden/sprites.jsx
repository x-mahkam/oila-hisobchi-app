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
        <linearGradient id="gdLeafAnor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="gdLeafDarkAnor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id="gdLeafWalnut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="gdLeafDarkWalnut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#311042" />
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
export const Lobe = memo(function Lobe({ cx, cy, rx, ry, fill = "url(#gdLeaf)", fillLo = ART.leafLo }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy + 2.6} rx={rx} ry={ry} fill={fillLo} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} stroke={ART.leaf} strokeWidth="1.3" />
      <ellipse cx={cx - rx * 0.34} cy={cy - ry * 0.42} rx={rx * 0.3} ry={ry * 0.24} fill={ART.leafGlint} opacity="0.8" />
    </g>
  );
});

// ── O'simlik bosqichlari (0..6) ─────────────────────────────
export const PlantSVG = memo(function PlantSVG({ stage, size = 120, animated = true, plantType = "normal" }) {
  const style = animated
    ? { animation: "gdSway 5s ease-in-out infinite", transformOrigin: "50% 100%", display: "block" }
    : { display: "block" };

  // Handle Tulip plant types separately because they are flowers, not trees
  if (plantType === "tulip") {
    const tStages = [
      // Stage 0: Bulb
      <svg key="t0" style={style} width={size * 0.7} height={size * 0.5} viewBox="0 0 60 50">
        <ellipse cx="30" cy="38" rx="18" ry="6" fill="#5c4033" opacity="0.6" />
        <ellipse cx="30" cy="35" rx="14" ry="4" fill="#4a2e1b" opacity="0.8" />
        <path d="M26 35 C24 25, 30 18, 30 18 C30 18, 36 25, 34 35 Z" fill="#b45309" />
        <path d="M28 35 C27 28, 30 22, 30 22 C30 22, 33 28, 32 35 Z" fill="#d97706" />
        <path d="M29 20 C31 16, 33 16, 34 14" stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>,
      // Stage 1: Sprout
      <svg key="t1" style={style} width={size * 0.8} height={size * 0.8} viewBox="0 0 80 80">
        <ellipse cx="40" cy="74" rx="18" ry="4" fill="#4a2e1b" opacity="0.5" />
        <path d="M40 74 Q 38 48 40 32" stroke="#22c55e" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M40 50 C 25 45, 18 30, 24 22 C 34 25, 38 38, 40 50 Z" fill="#4ade80" />
        <path d="M40 45 C 55 40, 62 25, 56 18 C 46 20, 42 34, 40 45 Z" fill="#15803d" />
      </svg>,
      // Stage 2: Growth with small bud
      <svg key="t2" style={style} width={size * 0.9} height={size * 0.9} viewBox="0 0 90 90">
        <ellipse cx="45" cy="84" rx="20" ry="5" fill="#4a2e1b" opacity="0.4" />
        <path d="M45 84 Q 43 50 45 28" stroke="#16a34a" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M45 60 C 20 54, 15 36, 22 24 C 32 28, 40 44, 45 60 Z" fill="#22c55e" />
        <path d="M45 52 C 70 46, 75 28, 68 18 C 58 22, 50 38, 45 52 Z" fill="#15803d" />
        <ellipse cx="45" cy="22" rx="6" ry="10" fill="#f43f5e" />
        <path d="M43 22 Q 45 12 47 22" fill="#e11d48" />
        <path d="M45 28 L 45 22" stroke="#15803d" strokeWidth="4" />
      </svg>,
      // Stage 3: Tall green stem with large bud
      <svg key="t3" style={style} width={size} height={size} viewBox="0 0 100 100">
        <ellipse cx="50" cy="94" rx="24" ry="5" fill="#4a2e1b" opacity="0.4" />
        <path d="M50 94 Q 48 52 50 24" stroke="#16a34a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M50 64 C 18 58, 12 36, 20 22 C 32 28, 44 48, 50 64 Z" fill="#22c55e" />
        <path d="M50 54 C 82 48, 88 28, 80 16 C 68 22, 56 40, 50 54 Z" fill="#15803d" />
        <path d="M44 24 Q 50 4 56 24 Z" fill="#f43f5e" />
        <path d="M46 24 C44 14, 50 8, 50 8 C50 8, 56 14, 54 24 Z" fill="#f59e0b" />
        <path d="M48 24 Q 50 10 52 24" fill="#fbbf24" />
      </svg>,
      // Stage 4: Blooming Tulip
      <svg key="t4" style={style} width={size * 1.1} height={size * 1.1} viewBox="0 0 100 100">
        <ellipse cx="50" cy="94" rx="24" ry="5" fill="#4a2e1b" opacity="0.4" />
        <path d="M50 94 Q 48 56 50 30" stroke="#16a34a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M50 68 C 18 60, 12 38, 20 24 C 32 30, 44 52, 50 68 Z" fill="#22c55e" />
        <path d="M50 58 C 82 52, 88 32, 80 20 C 68 26, 56 44, 50 58 Z" fill="#15803d" />
        <g transform="translate(0, 4)">
          <path d="M36 28 C 30 14, 44 4, 48 24 Z" fill="#be123c" />
          <path d="M64 28 C 70 14, 56 4, 52 24 Z" fill="#be123c" />
          <path d="M38 28 C 34 16, 50 8, 50 28 Z" fill="#fbbf24" />
          <path d="M62 28 C 66 16, 50 8, 50 28 Z" fill="#fbbf24" />
          <path d="M42 28 C 40 18, 60 18, 58 28 Z" fill="#e11d48" />
        </g>
      </svg>,
      // Stage 5: Fully Opened Tulip
      <svg key="t5" style={style} width={size * 1.2} height={size * 1.2} viewBox="0 0 100 100">
        <ellipse cx="50" cy="94" rx="26" ry="5" fill="#4a2e1b" opacity="0.4" />
        <path d="M50 94 Q 48 58 50 34" stroke="#16a34a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M50 70 C 18 62, 10 38, 18 24 C 32 30, 44 54, 50 70 Z" fill="#22c55e" />
        <path d="M50 60 C 82 54, 90 32, 82 18 C 68 24, 56 44, 50 60 Z" fill="#15803d" />
        <g transform="translate(0, 10)">
          <circle cx="50" cy="22" r="5" fill="#eab308" />
          <path d="M34 26 Q 20 6, 45 18 Z" fill="#e11d48" />
          <path d="M66 26 Q 80 6, 55 18 Z" fill="#e11d48" />
          <path d="M38 28 C 30 10, 50 4, 50 24 Z" fill="#f43f5e" />
          <path d="M62 28 C 70 10, 50 4, 50 24 Z" fill="#f43f5e" />
          <path d="M44 28 C 40 14, 60 14, 56 28 Z" fill="#fbbf24" />
        </g>
      </svg>,
      // Stage 6: Cosmic Glowing Tulip
      <svg key="t6" style={style} width={size * 1.25} height={size * 1.25} viewBox="0 0 100 100">
        <ellipse cx="50" cy="94" rx="28" ry="6" fill="#4a2e1b" opacity="0.4" />
        <path d="M50 94 Q 48 58 50 34" stroke="#7e22ce" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M50 70 C 18 62, 10 38, 18 24 C 32 30, 44 54, 50 70 Z" fill="#a855f7" />
        <path d="M50 60 C 82 54, 90 32, 82 18 C 68 24, 56 44, 50 60 Z" fill="#6b21a8" />
        <g transform="translate(0, 10)" filter="drop-shadow(0 0 6px #c084fc)">
          <circle cx="50" cy="22" r="6" fill="#fff" />
          <path d="M34 26 Q 20 6, 45 18 Z" fill="#ec4899" />
          <path d="M66 26 Q 80 6, 55 18 Z" fill="#ec4899" />
          <path d="M38 28 C 30 10, 50 4, 50 24 Z" fill="#f472b6" />
          <path d="M62 28 C 70 10, 50 4, 50 24 Z" fill="#f472b6" />
          <path d="M44 28 C 40 14, 60 14, 56 28 Z" fill="#c084fc" />
        </g>
        <g opacity="0.9">
          <path d="M15 25 L17 27 L15 29 L13 27 Z" fill="#c084fc" />
          <path d="M85 22 L87 24 L85 26 L83 24 Z" fill="#f472b6" />
          <path d="M50 45 L52 47 L50 49 L48 47 Z" fill="#fff" />
        </g>
      </svg>
    ];
    return tStages[Math.min(Math.max(stage, 0), tStages.length - 1)];
  }

  // Trees: Normal (Apple), Golden (Pomegranate), Rainbow (Walnut)
  let leafFill = "url(#gdLeaf)";
  let leafDarkFill = "url(#gdLeafDark)";
  let leafLoColor = ART.leafLo;
  let trunkFill = "url(#gdTrunk)";
  let fruitFill = ART.fruit;
  let fruitAltFill = ART.fruitAlt;
  let fruitHiFill = ART.fruitHi;

  if (plantType === "golden") {
    // Pomegranate (Anor): Reddish-golden foliage, pink/red fruits
    leafFill = "url(#gdLeafAnor)";
    leafDarkFill = "url(#gdLeafDarkAnor)";
    leafLoColor = "#7f1d1d";
    fruitFill = "#be123c";
    fruitAltFill = "#fda4af";
    fruitHiFill = "#ffe4e6";
  } else if (plantType === "rainbow") {
    // Walnut (Yong'oq): Purplish foliage, golden walnuts
    leafFill = "url(#gdLeafWalnut)";
    leafDarkFill = "url(#gdLeafDarkWalnut)";
    leafLoColor = "#3b0764";
    fruitFill = "#eab308";
    fruitAltFill = "#fbbf24";
    fruitHiFill = "#fef08a";
  }

  const s = [
    // 0: urug' - A seed in the ground with a tiny little green sprout popping up!
    <svg key="s0" style={style} width={size * 0.7} height={size * 0.5} viewBox="0 0 60 50">
      <ellipse cx="30" cy="38" rx="20" ry="8" fill="#5c4033" opacity="0.6" />
      <ellipse cx="30" cy="35" rx="16" ry="6" fill="#4a2e1b" opacity="0.8" />
      <ellipse cx="27" cy="33" rx="10" ry="7" fill={ART.trunkLo} transform="rotate(-15 27 33)" />
      <ellipse cx="27" cy="31" rx="8" ry="6" fill={ART.trunk} transform="rotate(-15 27 31)" />
      <path d="M29 27 C28 18, 33 12, 36 8 C38 14, 34 22, 31 27 Z" fill={ART.leafGlint} />
      <path d="M26 29 C21 24, 20 18, 22 13 C26 15, 27 22, 27 29 Z" fill={ART.leaf} opacity="0.9" />
    </svg>,
    // 1: nihol - A robust sprout, slightly taller, with 2 beautiful shiny green leaves and a delicate main stem.
    <svg key="s1" style={style} width={size * 0.9} height={size * 0.85} viewBox="0 0 85 80">
      <ellipse cx="42" cy="74" rx="22" ry="6" fill="#4a2e1b" opacity="0.5" />
      <path d="M42 74 Q 40 50 42 36" stroke={ART.leaf} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M41 74 Q 39 50 41 36" stroke={ART.leafGlint} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M42 45 C 18 41 10 23 16 15 C 32 13 42 27 42 45 Z" fill={leafFill} />
      <path d="M42 45 C 30 37 26 27 26 21" stroke={leafLoColor} strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M42 41 C 64 35 74 19 68 10 C 52 8 41 23 42 41 Z" fill={leafDarkFill} />
      <path d="M42 41 C 52 33 58 23 60 17" stroke={leafLoColor} strokeWidth="2.5" fill="none" opacity="0.7" />
      <ellipse cx="22" cy="21" rx="5" ry="3" fill="#fff" opacity="0.3" transform="rotate(-30 22 21)" />
    </svg>,
    // 2: yosh daraxt - Beautiful sapling with curved branches and multiple layered leafy lobes
    <svg key="s2" style={style} width={size * 1.05} height={size * 1.05} viewBox="0 0 100 100">
      <ellipse cx="50" cy="94" rx="24" ry="6" fill="#4a2e1b" opacity="0.4" />
      <path d="M46 95 L46 54 Q 44 48 38 45 L41 40 Q48 44 50 50 Q52 44 58 40 L61 45 Q55 48 53 54 L53 95 Z" fill={trunkFill} />
      <Lobe cx={34} cy={45} rx={16} ry={11} fill={leafFill} fillLo={leafLoColor} />
      <Lobe cx={66} cy={45} rx={15} ry={10} fill={leafFill} fillLo={leafLoColor} />
      <Lobe cx={50} cy={28} rx={20} ry={14} fill={leafFill} fillLo={leafLoColor} />
    </svg>,
    // 3: katta daraxt - Majestic mature tree, thicker branched wooden trunk with full, gorgeous layered canopy of 5 lush lobes
    <svg key="s3" style={style} width={size * 1.25} height={size * 1.3} viewBox="0 0 100 118">
      <ellipse cx="50" cy="112" rx="32" ry="6" fill="#4a2e1b" opacity="0.4" />
      <path d="M42 114 L42 66 Q 32 54 22 50 L27 44 Q38 50 42 56 Q45 44 38 32 L44 30 Q50 42 49 52 Q53 45 64 41 L67 47 Q56 51 53 60 L53 114 Z" fill={trunkFill} />
      <g opacity="0.9">
        <Lobe cx={30} cy={52} rx={20} ry={14} fill={leafFill} fillLo={leafLoColor} />
        <Lobe cx={70} cy={52} rx={18} ry={13} fill={leafFill} fillLo={leafLoColor} />
      </g>
      <Lobe cx={25} cy={38} rx={22} ry={15} fill={leafFill} fillLo={leafLoColor} />
      <Lobe cx={75} cy={38} rx={20} ry={14} fill={leafFill} fillLo={leafLoColor} />
      <Lobe cx={50} cy={22} rx={26} ry={18} fill={leafFill} fillLo={leafLoColor} />
    </svg>,
    // 4: gullagan - Lush mature tree beautifully covered with pink/red blooming flowers
    <svg key="s4" style={style} width={size * 1.25} height={size * 1.3} viewBox="0 0 100 118">
      <ellipse cx="50" cy="112" rx="32" ry="6" fill="#4a2e1b" opacity="0.4" />
      <path d="M42 114 L42 66 Q 32 54 22 50 L27 44 Q38 50 42 56 Q45 44 38 32 L44 30 Q50 42 49 52 Q53 45 64 41 L67 47 Q56 51 53 60 L53 114 Z" fill={trunkFill} />
      <g opacity="0.9">
        <Lobe cx={30} cy={52} rx={20} ry={14} fill={leafFill} fillLo={leafLoColor} />
        <Lobe cx={70} cy={52} rx={18} ry={13} fill={leafFill} fillLo={leafLoColor} />
      </g>
      <Lobe cx={25} cy={38} rx={22} ry={15} fill={leafFill} fillLo={leafLoColor} />
      <Lobe cx={75} cy={38} rx={20} ry={14} fill={leafFill} fillLo={leafLoColor} />
      <Lobe cx={50} cy={22} rx={26} ry={18} fill={leafFill} fillLo={leafLoColor} />
      {[[24, 32], [42, 20], [62, 16], [76, 28], [66, 46], [32, 48], [50, 10], [48, 30], [28, 54], [72, 50]].map(([x, y], i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map(a => (
            <ellipse key={a} cx={x} cy={y - 3.4} rx="3" ry="4.2" fill={i % 2 ? ART.bloomHi : ART.bloom} transform={"rotate(" + a + " " + x + " " + y + ")"} />
          ))}
          <circle cx={x} cy={y} r="2.2" fill={ART.petalCore} />
        </g>
      ))}
    </svg>,
    // 5: mevali - Lush mature tree laden with shiny, glossy ripe fruits
    <svg key="s5" style={style} width={size * 1.25} height={size * 1.3} viewBox="0 0 100 118">
      <ellipse cx="50" cy="112" rx="32" ry="6" fill="#4a2e1b" opacity="0.4" />
      <path d="M42 114 L42 66 Q 32 54 22 50 L27 44 Q38 50 42 56 Q45 44 38 32 L44 30 Q50 42 49 52 Q53 45 64 41 L67 47 Q56 51 53 60 L53 114 Z" fill={trunkFill} />
      <g opacity="0.9">
        <Lobe cx={30} cy={52} rx={20} ry={14} fill={leafFill} fillLo={leafLoColor} />
        <Lobe cx={70} cy={52} rx={18} ry={13} fill={leafFill} fillLo={leafLoColor} />
      </g>
      <Lobe cx={25} cy={38} rx={22} ry={15} fill={leafFill} fillLo={leafLoColor} />
      <Lobe cx={75} cy={38} rx={20} ry={14} fill={leafFill} fillLo={leafLoColor} />
      <Lobe cx={50} cy={22} rx={26} ry={18} fill={leafFill} fillLo={leafLoColor} />
      {[[26, 34], [46, 22], [66, 18], [76, 32], [64, 48], [36, 50], [50, 10], [48, 34], [30, 54], [70, 50]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5.8" fill={i % 2 ? fruitAltFill : fruitFill} />
          <ellipse cx={x - 2} cy={y - 2} rx="2" ry="1.4" fill={fruitHiFill} opacity="0.9" />
          <path d={"M" + x + " " + (y - 5.4) + " q1 -3 3.5 -4.5"} stroke={ART.fruitStem} strokeWidth="1.6" fill="none" />
        </g>
      ))}
    </svg>,
    // 6: baraka daraxti (oltin yaltiroq) - Breathtaking legendary golden tree with glittering coins and gold sparkles
    <svg key="s6" style={style} width={size * 1.3} height={size * 1.35} viewBox="0 0 100 126">
      <ellipse cx="50" cy="120" rx="34" ry="6" fill="#4a2e1b" opacity="0.4" />
      <path d="M41 122 L41 70 Q 31 56 21 52 L26 46 Q37 52 41 58 Q44 46 37 34 L43 32 Q49 44 48 54 Q52 46 63 42 L66 48 Q55 52 52 61 L52 122 Z" fill={trunkFill} />
      <g opacity="0.9">
        <Lobe cx={30} cy={54} rx={20} ry={14} fill={leafFill} fillLo={leafLoColor} />
        <Lobe cx={70} cy={54} rx={18} ry={13} fill={leafFill} fillLo={leafLoColor} />
      </g>
      <Lobe cx={25} cy={38} rx={22} ry={15} fill={leafFill} fillLo={leafLoColor} />
      <Lobe cx={75} cy={38} rx={20} ry={14} fill={leafFill} fillLo={leafLoColor} />
      <Lobe cx={50} cy={22} rx={26} ry={18} fill={leafFill} fillLo={leafLoColor} />
      {[[24, 36], [44, 20], [64, 18], [76, 32], [64, 50], [34, 52], [50, 8], [46, 32], [28, 54], [70, 48]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6.2" fill="url(#gdCoin)" stroke={ART.coinLo} strokeWidth="1.2" />
          <path d={"M" + x + " " + (y - 2.8) + " l1 2.2 2.4.2 -1.8 1.6 .5 2.4 -2.1-1.3 -2.1 1.3 .5-2.4 -1.8-1.6 2.4-.2 Z"} fill={ART.coinLo} />
        </g>
      ))}
      <g opacity="0.9">
        <path d="M15 25 L17 27 L15 29 L13 27 Z" fill="#ffd700" />
        <path d="M85 22 L87 24 L85 26 L83 24 Z" fill="#ffd700" />
        <path d="M50 45 L52 47 L50 49 L48 47 Z" fill="#ffd700" />
      </g>
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
