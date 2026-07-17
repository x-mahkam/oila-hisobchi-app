// ═══════════════════════════════════════════════════════════
//  LEVEL MAP — Vertical Roadmap of Levels (Math, Logic, Memory)
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageHeader, PrimaryButton, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, PREMIUM, PALETTE, MOTION } from "../../utils/tokens.js";
import { MATH_LEVELS } from "./levels/mathLevels.js";
import { readLevelProgress } from "../engine/persist.js";
import { DIFF, catById, gameById } from "../registry.jsx";
import { playSound } from "../engine/sound.js";

const starIco = (filled, s = 14) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? PREMIUM.gold : "none"} stroke={filled ? PREMIUM.gold : "#9ca3af"} strokeWidth="1.5" style={{ margin: "0 1px" }}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const lockIco = (color, s = 14) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function LevelMap({ user, lg = "uz", dark, levels, subject = "math", title, onSelectLevel, onBack }) {
  const { t } = useApp();
  const th = dark ? PALETTE.dark : PALETTE.light;

  const [userLevels, setUserLevels] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    if (typeof document !== "undefined" && !document.getElementById("level-map-dynamic-css")) {
      const styleEl = document.createElement("style");
      styleEl.id = "level-map-dynamic-css";
      styleEl.textContent = `
        @keyframes floatY1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes floatY2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(-4deg); }
        }
        @keyframes floatY3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes floatY4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-3deg); }
        }
        .levelmap-float-1 { animation: floatY1 4s ease-in-out infinite; }
        .levelmap-float-2 { animation: floatY2 4.5s ease-in-out infinite; }
        .levelmap-float-3 { animation: floatY3 3.8s ease-in-out infinite; }
        .levelmap-float-4 { animation: floatY4 4.2s ease-in-out infinite; }

        .math-grid {
          background-size: 28px 28px;
          background-image: radial-gradient(circle, rgba(99, 102, 241, 0.16) 1.5px, transparent 1.5px);
        }
        .logic-grid {
          background-size: 32px 32px;
          background-image: linear-gradient(to right, rgba(139, 92, 246, 0.12) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(139, 92, 246, 0.12) 1px, transparent 1px);
        }
        .memory-grid {
          background-size: 40px 40px;
          background-image: radial-gradient(circle, rgba(234, 179, 8, 0.15) 2px, transparent 2px),
                            radial-gradient(circle, rgba(234, 179, 8, 0.08) 1.2px, transparent 1.2px);
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      readLevelProgress(user.id).then(res => {
        setUserLevels(res[subject] || {});
      });
    }
  }, [user?.id, subject]);

  const activeLevels = levels || MATH_LEVELS;

  // Find the highest unlocked level to guide the kid
  const highestUnlockedLvlId = useMemo(() => {
    return activeLevels.reduce((max, lvl) => {
      const isUnlocked = lvl.id === 1 || (userLevels[lvl.id - 1] && userLevels[lvl.id - 1].stars >= 1);
      return isUnlocked ? Math.max(max, lvl.id) : max;
    }, 1);
  }, [userLevels, activeLevels]);

  const getGameName = (gameId) => {
    return gameById(gameId)?.name[lg] || gameId;
  };

  const bgGradient = useMemo(() => {
    if (subject === "logic") {
      return dark
        ? "linear-gradient(180deg, #1e112c 0%, #291140 50%, #111e29 100%)"
        : "linear-gradient(180deg, #f5f3ff 0%, #fae8ff 50%, #f0fdf4 100%)";
    }
    if (subject === "memory") {
      return dark
        ? "linear-gradient(180deg, #251605 0%, #381a04 50%, #1e1112 100%)"
        : "linear-gradient(180deg, #fffbeb 0%, #fef3c7 50%, #fff1f2 100%)";
    }
    return dark
      ? "linear-gradient(180deg, #111029 0%, #1c1a40 50%, #0e0d21 100%)"
      : "linear-gradient(180deg, #eef7ff 0%, #edfbf2 50%, #fff6ed 100%)";
  }, [subject, dark]);

  const gridClass = useMemo(() => {
    if (subject === "logic") return "logic-grid";
    if (subject === "memory") return "memory-grid";
    return "math-grid";
  }, [subject]);

  const curveGradients = useMemo(() => {
    if (subject === "logic") {
      return ["#8b5cf6", "#d946ef", "#06b6d4", "#10b981"];
    }
    if (subject === "memory") {
      return ["#eab308", "#f97316", "#f43f5e", "#ec4899"];
    }
    return ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
  }, [subject]);

  const floaters = useMemo(() => {
    if (subject === "logic") {
      return [
        { char: "🧩", top: "4%", left: "8%", size: "28px", anim: "1" },
        { char: "💡", top: "12%", right: "12%", size: "28px", anim: "2" },
        { char: "🔍", top: "20%", left: "14%", size: "28px", anim: "3" },
        { char: "🎯", top: "28%", right: "8%", size: "28px", anim: "4" },
        { char: "⭐", top: "38%", left: "6%", size: "28px", anim: "1" },
        { char: "💭", top: "48%", right: "14%", size: "28px", anim: "2" },
        { char: "🧩", top: "58%", left: "10%", size: "28px", anim: "3" },
        { char: "💡", top: "68%", right: "10%", size: "28px", anim: "4" },
        { char: "🔍", top: "78%", left: "12%", size: "28px", anim: "1" },
        { char: "🎯", top: "88%", right: "12%", size: "28px", anim: "2" },
      ];
    }
    if (subject === "memory") {
      return [
        { char: "🃏", top: "4%", left: "8%", size: "28px", anim: "1" },
        { char: "💎", top: "12%", right: "12%", size: "28px", anim: "2" },
        { char: "🔑", top: "20%", left: "14%", size: "28px", anim: "3" },
        { char: "🍎", top: "28%", right: "8%", size: "28px", anim: "4" },
        { char: "🎁", top: "38%", left: "6%", size: "28px", anim: "1" },
        { char: "🐱", top: "48%", right: "14%", size: "28px", anim: "2" },
        { char: "🃏", top: "58%", left: "10%", size: "28px", anim: "3" },
        { char: "💎", top: "68%", right: "10%", size: "28px", anim: "4" },
        { char: "🔑", top: "78%", left: "12%", size: "28px", anim: "1" },
        { char: "🍎", top: "88%", right: "12%", size: "28px", anim: "2" },
      ];
    }
    return [
      { char: "+", top: "4%", left: "8%", size: "34px", color: "#3b82f6", weight: 900, anim: "1" },
      { char: "=", top: "12%", right: "12%", size: "38px", color: "#10b981", weight: 900, anim: "2" },
      { char: "-", top: "20%", left: "14%", size: "32px", color: "#f59e0b", weight: 900, anim: "3" },
      { char: "×", top: "28%", right: "8%", size: "42px", color: "#ec4899", weight: 900, anim: "4" },
      { char: "÷", top: "38%", left: "6%", size: "36px", color: "#8b5cf6", weight: 900, anim: "1" },
      { char: "?", top: "48%", right: "14%", size: "40px", color: "#ef4444", weight: 900, anim: "2" },
      { char: "+", top: "58%", left: "10%", size: "34px", color: "#10b981", weight: 900, anim: "3" },
      { char: "-", top: "68%", right: "10%", size: "38px", color: "#3b82f6", weight: 900, anim: "4" },
      { char: "×", top: "78%", left: "12%", size: "32px", color: "#ef4444", weight: 900, anim: "1" },
      { char: "?", top: "88%", right: "12%", size: "40px", color: "#8b5cf6", weight: 900, anim: "2" },
    ];
  }, [subject]);

  return (
    <div style={{ paddingBottom: SPACE.s8 }}>
      <PageHeader th={th} title={title || t("gam_lm_mathRoadmap")} onBack={onBack} />

      {/* Level Path Way Card with dynamic kid design & subject-themed background */}
      <div className={gridClass} style={{
        position: "relative",
        margin: `${SPACE.s4}px 0`,
        padding: `${SPACE.s6}px 0 ${SPACE.s8}px 0`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: bgGradient,
        border: `3px dashed ${th.ac}33`,
        borderRadius: RADIUS.xl,
        boxShadow: dark ? "inset 0 0 40px rgba(99,102,241,0.25)" : `inset 0 0 24px ${th.ac}0d`,
        overflow: "hidden"
      }}>
        {/* Colorful glow orbs for beautiful depth and vibrancy */}
        <div style={{ position: "absolute", top: "5%", left: "-10%", width: 150, height: 150, background: curveGradients[0] + "38", filter: "blur(40px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "25%", right: "-10%", width: 160, height: 160, background: curveGradients[1] + "38", filter: "blur(45px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "45%", left: "-10%", width: 150, height: 150, background: curveGradients[2] + "38", filter: "blur(40px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "65%", right: "-10%", width: 170, height: 170, background: curveGradients[3] + "38", filter: "blur(50px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "85%", left: "-5%", width: 160, height: 160, background: curveGradients[0] + "38", filter: "blur(45px)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Floating animated theme symbols with vivid colors and subtle shadows */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          {floaters.map((fl, idx) => (
            <div
              key={idx}
              className={`levelmap-float-${fl.anim}`}
              style={{
                position: "absolute",
                top: fl.top,
                left: fl.left,
                right: fl.right,
                fontSize: fl.size,
                fontWeight: fl.weight || "normal",
                color: fl.color || "inherit",
                textShadow: "0 2px 4px rgba(0,0,0,0.15)",
                userSelect: "none"
              }}
            >
              {fl.char}
            </div>
          ))}
        </div>

        {/* Map canvas container with custom serpentine path */}
        <div style={{ position: "relative", width: 300, height: activeLevels.length * 110, zIndex: 1 }}>
          {/* SVG serpentine connecting curve */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <defs>
              <linearGradient id="subjectTrackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={curveGradients[0]} />
                <stop offset="33%" stopColor={curveGradients[1]} />
                <stop offset="66%" stopColor={curveGradients[2]} />
                <stop offset="100%" stopColor={curveGradients[3]} />
              </linearGradient>
            </defs>
            
            <path
              d={(() => {
                const getXVal = (i) => {
                  const xOffsets = [150, 75, 225, 150];
                  return xOffsets[i % 4];
                };
                const getYVal = (i) => i * 110 + 55;
                let d = `M ${getXVal(0)} ${getYVal(0)}`;
                for (let i = 0; i < activeLevels.length - 1; i++) {
                  const x1 = getXVal(i);
                  const y1 = getYVal(i);
                  const x2 = getXVal(i + 1);
                  const y2 = getYVal(i + 1);
                  d += ` C ${x1} ${y1 + 55}, ${x2} ${y2 - 55}, ${x2} ${y2}`;
                }
                return d;
              })()}
              fill="none"
              stroke="rgba(0,0,0,0.12)"
              strokeWidth="16"
              strokeLinecap="round"
            />

            <path
              d={(() => {
                const getXVal = (i) => {
                  const xOffsets = [150, 75, 225, 150];
                  return xOffsets[i % 4];
                };
                const getYVal = (i) => i * 110 + 55;
                let d = `M ${getXVal(0)} ${getYVal(0)}`;
                for (let i = 0; i < activeLevels.length - 1; i++) {
                  const x1 = getXVal(i);
                  const y1 = getYVal(i);
                  const x2 = getXVal(i + 1);
                  const y2 = getYVal(i + 1);
                  d += ` C ${x1} ${y1 + 55}, ${x2} ${y2 - 55}, ${x2} ${y2}`;
                }
                return d;
              })()}
              fill="none"
              stroke="url(#subjectTrackGradient)"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>

          {/* Render absolute level nodes along the curve */}
          {activeLevels.map((lvl, index) => {
            const progress = userLevels[lvl.id];
            const isCompleted = progress && progress.stars >= 1;
            const isUnlocked = lvl.id === 1 || (userLevels[lvl.id - 1] && userLevels[lvl.id - 1].stars >= 1);
            const starsCount = progress ? progress.stars : 0;
            
            const getXVal = (i) => {
              const xOffsets = [150, 75, 225, 150];
              return xOffsets[i % 4];
            };
            const getYVal = (i) => i * 110 + 55;

            const posX = getXVal(index);
            const posY = getYVal(index);

            const isActive = selectedLevel?.id === lvl.id;
            const isNextUp = lvl.id === highestUnlockedLvlId;
            const nodeColor = isUnlocked ? (isCompleted ? th.gr : th.ac) : "#cbd5e1";

            return (
              <div key={lvl.id} className={isUnlocked ? "node-float" : ""} style={{
                position: "absolute",
                left: posX - 32,
                top: posY - 32,
                width: 64,
                height: 64,
                zIndex: 2
              }}>
                
                {/* Expanding glow ring behind Next Up level */}
                {isUnlocked && isNextUp && (
                  <div className="active-node-pulse" style={{
                    position: "absolute",
                    top: -4,
                    left: -4,
                    width: 72,
                    height: 72,
                    borderRadius: RADIUS.full,
                    border: `4px solid ${th.ac}`,
                    pointerEvents: "none"
                  }} />
                )}

                {/* Cute Bouncy Play flag */}
                {isUnlocked && isNextUp && (
                  <div className="next-up-arrow" style={{
                    position: "absolute",
                    top: -28,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    pointerEvents: "none",
                    zIndex: 10
                  }}>
                    <div style={{
                      background: PREMIUM.gold,
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 900,
                      padding: "2px 8px",
                      borderRadius: RADIUS.s,
                      boxShadow: "0 4px 8px rgba(234,179,8,0.4)",
                      whiteSpace: "nowrap",
                      border: "1px solid rgba(255,255,255,0.3)"
                    }}>
                      {t("gam_playBadge")}
                    </div>
                    <div style={{
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: `5px solid ${PREMIUM.gold}`
                    }} />
                  </div>
                )}

                <button className="ui-press bg-pop node-hover"
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedLevel(lvl);
                    } else {
                      playSound.wrong();
                    }
                  }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: RADIUS.full,
                    background: isActive ? th.ac2 : (isUnlocked ? th.sur : th.bor),
                    border: `4px solid ${isActive ? th.ac : nodeColor}`,
                    boxShadow: isActive 
                      ? `0 0 20px ${th.ac}` 
                      : (isUnlocked 
                        ? `0 6px 16px ${nodeColor}66, inset 0 -4px 0 rgba(0,0,0,0.1)` 
                        : "0 4px 8px rgba(0,0,0,0.05)"),
                    cursor: isUnlocked ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    padding: 0
                  }}
                >
                  {isUnlocked ? (
                    <span style={{ fontSize: 22, fontWeight: 900, color: isActive ? "#fff" : th.t1 }}>{lvl.id}</span>
                  ) : (
                    lockIco(th.t3, 20)
                  )}

                  {/* Star icons aligned beautifully under bubble */}
                  {isUnlocked && (
                    <div style={{ position: "absolute", bottom: -12, display: "flex", justifyContent: "center", width: "100%", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}>
                      {starIco(starsCount >= 1, 12)}
                      {starIco(starsCount >= 2, 12)}
                      {starIco(starsCount >= 3, 12)}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected level bottom popup details sheet */}
      {selectedLevel && (
        <div className="bg-pop" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: th.sur, borderTop: "2px solid " + th.bor, borderTopLeftRadius: RADIUS.l, borderTopRightRadius: RADIUS.l, padding: SPACE.s4, boxShadow: "0 -4px 20px rgba(0,0,0,0.15)", zIndex: 100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACE.s3 }}>
            <div>
              <h3 style={{ ...TYPE.title, color: th.t1, margin: 0 }}>
                {t("gam_levelN", { n: selectedLevel.id })}
              </h3>
              <p style={{ ...TYPE.caption, color: th.t2, margin: "2px 0 0" }}>
                {t("gam_lm_type")}: <span style={{ fontWeight: 700, color: th.ac }}>{getGameName(selectedLevel.game)}</span>
              </p>
            </div>
            <button className="ui-press" onClick={() => setSelectedLevel(null)} style={{ border: "none", background: "none", fontSize: 24, fontWeight: "bold", color: th.t3, cursor: "pointer" }}>×</button>
          </div>

          <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
            {subject === "memory" ? (
              <>
                <div style={{ flex: 2, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>{selectedLevel.pairCount}</div>
                  <div style={{ ...TYPE.tiny, color: th.t2 }}>{t("gam_lm_pairs")}</div>
                </div>
                <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>
                    {userLevels[selectedLevel.id]?.stars || 0}/3
                  </div>
                  <div style={{ ...TYPE.tiny, color: th.t2 }}>{t("gam_stars")}</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>{selectedLevel.questionCount}</div>
                  <div style={{ ...TYPE.tiny, color: th.t2 }}>{t("gam_questions")}</div>
                </div>
                <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>{selectedLevel.passPct}%</div>
                  <div style={{ ...TYPE.tiny, color: th.t2 }}>{t("gam_lm_passShort")}</div>
                </div>
                <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>
                    {userLevels[selectedLevel.id]?.stars || 0}/3
                  </div>
                  <div style={{ ...TYPE.tiny, color: th.t2 }}>{t("gam_stars")}</div>
                </div>
              </>
            )}
          </div>

          <PrimaryButton th={th} onClick={() => onSelectLevel(selectedLevel)}>
            {t("gam_startLevel")}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
