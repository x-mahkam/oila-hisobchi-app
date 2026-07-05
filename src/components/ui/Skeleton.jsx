// ═══════════════════════════════════════════════════════════
//  SKELETON
//  Qayerda: sahifa/ma'lumot birinchi yuklanishida (Firebase kutish).
//  Qachon: kontent tuzilishi ma'lum bo'lganda — skeleton uni takrorlaydi.
//  Qachon EMAS: tugma ichida (LoadingButton), 300ms dan qisqa kutishda
//              (miltillash yomon), noma'lum tuzilishda.
//  Tokenlar: RADIUS.m/s/full, SPACE, th.surH/bor.
//  Dark mode: shimmer surH↔bor orasida — ikkala rejimda ko'rinadi.
//  A11y: aria-hidden (dekorativ); reduced-motion'da shimmer o'chadi
//        (statik blok qoladi).
//  Animation: .ui-shimmer 1.2s linear cheksiz.
// ═══════════════════════════════════════════════════════════
import { memo } from "react";
import { RADIUS, SPACE } from "../../utils/tokens.js";
import { injectUiCss } from "./motion.js";

/** Bazaviy shimmer blok. */
export const Skeleton = memo(function Skeleton({ th, w = "100%", h = SPACE.s4, r = RADIUS.s, style }) {
  injectUiCss();
  return <div aria-hidden="true" className="ui-shimmer" style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg," + th.surH + " 25%," + th.bor + " 50%," + th.surH + " 75%)", ...style }} />;
});

/** Karta skeleti: sarlavha + 2 qator. */
export const CardSkeleton = memo(function CardSkeleton({ th }) {
  return (
    <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s4, marginBottom: SPACE.s3 }}>
      <Skeleton th={th} w="40%" h={SPACE.s3 + 2} style={{ marginBottom: SPACE.s3 }} />
      <Skeleton th={th} h={SPACE.s3} style={{ marginBottom: SPACE.s2 }} />
      <Skeleton th={th} w="70%" h={SPACE.s3} />
    </div>
  );
});

/** Ro'yxat skeleti: n ta qator (avatar-doira + 2 chiziq). */
export const ListSkeleton = memo(function ListSkeleton({ th, rows = 4 }) {
  return (
    <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: "0 " + SPACE.s4 + "px", marginBottom: SPACE.s3 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, padding: SPACE.s3 + "px 0", borderBottom: i < rows - 1 ? "1px solid " + th.bor : "none" }}>
          <Skeleton th={th} w={SPACE.s8 + SPACE.s1} h={SPACE.s8 + SPACE.s1} r={RADIUS.full} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton th={th} w="55%" h={SPACE.s3} style={{ marginBottom: SPACE.s1 + 2 }} />
            <Skeleton th={th} w="35%" h={SPACE.s2 + 2} />
          </div>
          <Skeleton th={th} w={SPACE.s12} h={SPACE.s3} />
        </div>
      ))}
    </div>
  );
});

/** Grafik skeleti: sarlavha + katta blok + legend chiziqlari. */
export const ChartSkeleton = memo(function ChartSkeleton({ th, h = SPACE.s16 * 3 }) {
  return (
    <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s4, marginBottom: SPACE.s3 }}>
      <Skeleton th={th} w="45%" h={SPACE.s3 + 2} style={{ marginBottom: SPACE.s4 }} />
      <Skeleton th={th} h={h} r={RADIUS.s} style={{ marginBottom: SPACE.s3 }} />
      <div style={{ display: "flex", gap: SPACE.s3 }}>
        <Skeleton th={th} w="30%" h={SPACE.s2 + 2} />
        <Skeleton th={th} w="30%" h={SPACE.s2 + 2} />
      </div>
    </div>
  );
});

/** Profil skeleti: hero + statlar + ro'yxat. */
export const ProfileSkeleton = memo(function ProfileSkeleton({ th }) {
  return (
    <div>
      <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m + SPACE.s1, padding: SPACE.s6 + "px " + SPACE.s4 + "px", marginBottom: SPACE.s4, display: "flex", alignItems: "center", gap: SPACE.s3 }}>
        <Skeleton th={th} w={SPACE.s16} h={SPACE.s16} r={RADIUS.full} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Skeleton th={th} w="50%" h={SPACE.s4} style={{ marginBottom: SPACE.s2 }} />
          <Skeleton th={th} w="70%" h={SPACE.s3} />
        </div>
      </div>
      <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
        {[0, 1, 2, 3].map(i => <Skeleton key={i} th={th} h={SPACE.s16 + SPACE.s2} r={RADIUS.m} style={{ flex: 1 }} />)}
      </div>
      <ListSkeleton th={th} rows={3} />
    </div>
  );
});

/** Bog' skeleti: osmon-blok + daraxt doirasi + progress. */
export const GardenSkeleton = memo(function GardenSkeleton({ th }) {
  return (
    <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s4, marginBottom: SPACE.s3 }}>
      <Skeleton th={th} h={SPACE.s16 * 2.5} r={RADIUS.m} style={{ marginBottom: SPACE.s3 }} />
      <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s3 }}>
        <Skeleton th={th} w={SPACE.s16 + SPACE.s8} h={SPACE.s16 + SPACE.s8} r={RADIUS.full} />
      </div>
      <Skeleton th={th} h={SPACE.s2 + 2} r={RADIUS.pill} />
    </div>
  );
});
