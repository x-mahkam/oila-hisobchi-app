import { useState, useEffect, useRef } from "react";
import { SPACE, RADIUS, SHADOW, TYPE, ALPHA } from "../utils/tokens.js";

export default function ProductTour({ th, lg, steps, onFinish }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [rect, setRect] = useState(null);
  const resizeRef = useRef(null);

  const step = steps[currentIdx];
  const lang = lg || "uz";

  const getTranslation = (obj) => {
    if (!obj) return "";
    return obj[lang] || obj.uz || obj.en || "";
  };

  const calculateRect = () => {
    if (!step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      const r = el.getBoundingClientRect();
      // If the element is hidden or off-screen, try scrolling it into view
      if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > window.innerHeight) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Recalculate after scroll finishes
        setTimeout(() => {
          const updatedR = el.getBoundingClientRect();
          setRect({
            top: updatedR.top,
            left: updatedR.left,
            width: updatedR.width,
            height: updatedR.height,
            bottom: updatedR.bottom,
            right: updatedR.right,
          });
        }, 300);
      } else {
        setRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
          bottom: r.bottom,
          right: r.right,
        });
      }
    } else {
      setRect(null);
    }
  };

  // Recalculate on mount, step change, resize, scroll
  useEffect(() => {
    calculateRect();
    const handleUpdate = () => {
      calculateRect();
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [currentIdx, step?.targetId]);

  if (!step || !rect) return null;

  const handleNext = () => {
    if (currentIdx < steps.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  // Determine tooltip placement: below target, above target, or centered
  const padding = 6;
  const targetTop = rect.top - padding;
  const targetLeft = rect.left - padding;
  const targetWidth = rect.width + padding * 2;
  const targetHeight = rect.height + padding * 2;

  const tooltipWidth = 300;
  const tooltipHeight = 180; // approximate maximum height

  let tooltipTop = targetTop + targetHeight + 12;
  let isBelow = true;

  if (tooltipTop + tooltipHeight > window.innerHeight) {
    tooltipTop = targetTop - tooltipHeight - 12;
    isBelow = false;
    if (tooltipTop < 10) {
      // If neither fits nicely, place it floating in the middle of the screen
      tooltipTop = window.innerHeight / 2 - tooltipHeight / 2;
    }
  }

  let tooltipLeft = targetLeft + targetWidth / 2 - tooltipWidth / 2;
  tooltipLeft = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, tooltipLeft));

  const tNext = { uz: "Keyingi", ru: "Далее", en: "Next", kk: "Келесі", ky: "Кийинки", tg: "Баъдӣ", qr: "Keyingi" }[lang] || "Next";
  const tPrev = { uz: "Orqaga", ru: "Назад", en: "Back", kk: "Артқа", ky: "Артка", tg: "Аввал", qr: "Orqaga" }[lang] || "Back";
  const tFinish = { uz: "Tushundim!", ru: "Понятно!", en: "Got it!", kk: "Түсіндім!", ky: "Түшүндүм!", tg: "Фаҳмидам!", qr: "Tushundim!" }[lang] || "Got it!";
  const tSkip = { uz: "O'tkazib yuborish", ru: "Пропустить", en: "Skip", kk: "Өткізіп жіберу", ky: "Өткөрүп жиберүү", tg: "Гузаштан", qr: "O'tkazib yuborish" }[lang] || "Skip";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        pointerEvents: "auto",
        fontFamily: "inherit",
      }}
    >
      {/* Dark overlay with spotlight mask using box-shadow */}
      <div
        style={{
          position: "fixed",
          top: targetTop,
          left: targetLeft,
          width: targetWidth,
          height: targetHeight,
          borderRadius: RADIUS.m,
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.75)`,
          border: `2px solid ${th.ac}`,
          zIndex: 1101,
          transition: "all 0.25s ease",
          pointerEvents: "none",
        }}
      />

      {/* Tooltip box */}
      <div
        style={{
          position: "fixed",
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipWidth,
          background: th.sur,
          borderRadius: RADIUS.m,
          padding: "16px",
          border: `1px solid ${th.bor}`,
          boxShadow: SHADOW.e3,
          zIndex: 1102,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          transition: "all 0.25s ease",
        }}
      >
        {/* Title */}
        <div style={{ ...TYPE.title, color: th.t1, fontSize: 15, fontWeight: 700 }}>
          {getTranslation(step.title)}
        </div>

        {/* Description */}
        <div style={{ ...TYPE.body, color: th.t2, fontSize: 13, lineHeight: 1.5 }}>
          {getTranslation(step.desc)}
        </div>

        {/* Footer controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: i === currentIdx ? th.ac : th.bor,
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {currentIdx > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  background: "none",
                  border: "none",
                  color: th.t2,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 10px",
                }}
              >
                {tPrev}
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                background: th.ac,
                border: "none",
                borderRadius: RADIUS.s,
                color: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 12px",
              }}
            >
              {currentIdx === steps.length - 1 ? tFinish : tNext}
            </button>
          </div>
        </div>

        {/* Skip option */}
        {currentIdx < steps.length - 1 && (
          <button
            onClick={onFinish}
            style={{
              background: "none",
              border: "none",
              color: th.ac,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              padding: 0,
              textAlign: "left",
              textDecoration: "underline",
              width: "fit-content",
            }}
          >
            {tSkip}
          </button>
        )}
      </div>
    </div>
  );
}
