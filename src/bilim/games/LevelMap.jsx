// ═══════════════════════════════════════════════════════════
//  LEVEL MAP — Vertical Roadmap of 15 Math Levels
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from "react";
import { PageHeader, PrimaryButton, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, PREMIUM, PALETTE, MOTION } from "../../utils/tokens.js";
import { MATH_LEVELS } from "./levels/mathLevels.js";
import { readLevelProgress } from "../engine/persist.js";
import { DIFF, catById } from "../registry.jsx";
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

export default function LevelMap({ user, lg = "uz", dark, onSelectLevel, onBack }) {
  const th = dark ? PALETTE.dark : PALETTE.light;
  const uz = lg === "uz";
  const ru = lg === "ru";
  const en = lg === "en";

  const L = (uzVal, ruVal, enVal) => {
    if (ru) return ruVal || uzVal;
    if (en) return enVal || uzVal;
    return uzVal;
  };

  const [userLevels, setUserLevels] = useState({});
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    if (user?.id) {
      readLevelProgress(user.id).then(res => {
        setUserLevels(res["math"] || {});
      });
    }
  }, [user?.id]);

  const levels = MATH_LEVELS;

  // Find the highest unlocked level to guide the kid
  const highestUnlockedLvlId = useMemo(() => {
    return levels.reduce((max, lvl) => {
      const isUnlocked = lvl.id === 1 || (userLevels[lvl.id - 1] && userLevels[lvl.id - 1].stars >= 1);
      return isUnlocked ? Math.max(max, lvl.id) : max;
    }, 1);
  }, [userLevels, levels]);

  const getGameName = (gameId) => {
    if (gameId === "math/addition") return L("Qo'shish", "Сложение", "Addition");
    if (gameId === "math/subtraction") return L("Ayirish", "Вычитание", "Subtraction");
    if (gameId === "math/multiply") return L("Ko'paytirish", "Умножение", "Multiplication");
    return L("Matematika", "Математика", "Math");
  };

  return (
    <div style={{ paddingBottom: SPACE.s8 }}>
      <PageHeader th={th} title={L("Matematika Yo'li", "Карта Математики", "Math Roadmap")} onBack={onBack} />

      {/* Level Path Way Card with kid design & math-themed background */}
      <div className="math-grid" style={{
        position: "relative",
        margin: `${SPACE.s4}px 0`,
        padding: `${SPACE.s6}px 0 ${SPACE.s8}px 0`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: dark ? "linear-gradient(180deg, #111029 0%, #1c1a40 50%, #0e0d21 100%)" : "linear-gradient(180deg, #eef7ff 0%, #edfbf2 50%, #fff6ed 100%)",
        border: `3px dashed ${th.ac}33`,
        borderRadius: RADIUS.xl,
        boxShadow: dark ? "inset 0 0 40px rgba(99,102,241,0.25)" : `inset 0 0 24px ${th.ac}0d`,
        overflow: "hidden"
      }}>
        {/* Colorful glow orbs for beautiful depth and vibrancy */}
        <div style={{ position: "absolute", top: "5%", left: "-10%", width: 150, height: 150, background: "rgba(59, 130, 246, 0.22)", filter: "blur(40px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "25%", right: "-10%", width: 160, height: 160, background: "rgba(34, 197, 94, 0.22)", filter: "blur(45px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "45%", left: "-10%", width: 150, height: 150, background: "rgba(244, 63, 94, 0.22)", filter: "blur(40px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "65%", right: "-10%", width: 170, height: 170, background: "rgba(168, 85, 247, 0.22)", filter: "blur(50px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "85%", left: "-5%", width: 160, height: 160, background: "rgba(234, 179, 8, 0.22)", filter: "blur(45px)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Floating animated math symbols with vivid colors and subtle shadows */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div className="float-symbol-1" style={{ position: "absolute", top: "4%", left: "8%", fontSize: "34px", fontWeight: 900, color: "#3b82f6", textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>+</div>
          <div className="float-symbol-2" style={{ position: "absolute", top: "12%", right: "12%", fontSize: "38px", fontWeight: 900, color: "#10b981", textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>=</div>
          <div className="float-symbol-3" style={{ position: "absolute", top: "20%", left: "14%", fontSize: "32px", fontWeight: 900, color: "#f59e0b", textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>-</div>
          <div className="float-symbol-4" style={{ position: "absolute", top: "28%", right: "8%", fontSize: "42px", fontWeight: 900, color: "#ec4899", textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>×</div>
          <div className="float-symbol-1" style={{ position: "absolute", top: "38%", left: "6%", fontSize: "36px", fontWeight: 900, color: "#8b5cf6", textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>÷</div>
          <div className="float-symbol-2" style={{ position: "absolute", top: "48%", right: "14%", fontSize: "40px", fontWeight: 900, color: "#ef4444", textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>?</div>
        </div>

        {/* Map canvas container with custom serpentine path */}
        <div style={{ position: "relative", width: 300, height: levels.length * 110, zIndex: 1 }}>
          {/* SVG serpentine connecting curve */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <defs>
              <linearGradient id="mathTrackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="30%" stopColor="#10b981" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
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
                for (let i = 0; i < levels.length - 1; i++) {
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
                for (let i = 0; i < levels.length - 1; i++) {
                  const x1 = getXVal(i);
                  const y1 = getYVal(i);
                  const x2 = getXVal(i + 1);
                  const y2 = getYVal(i + 1);
                  d += ` C ${x1} ${y1 + 55}, ${x2} ${y2 - 55}, ${x2} ${y2}`;
                }
                return d;
              })()}
              fill="none"
              stroke="url(#mathTrackGradient)"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>

          {/* Render absolute level nodes along the curve */}
          {levels.map((lvl, index) => {
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
                      {L("O'YNA", "ИГРАТЬ", "PLAY")}
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
                {uz ? `${selectedLevel.id}-bosqich` : lg === "ru" ? `Уровень ${selectedLevel.id}` : `Level ${selectedLevel.id}`}
              </h3>
              <p style={{ ...TYPE.caption, color: th.t2, margin: "2px 0 0" }}>
                {L("Turi", "Тип", "Type")}: <span style={{ fontWeight: 700, color: th.ac }}>{getGameName(selectedLevel.game)}</span>
              </p>
            </div>
            <button className="ui-press" onClick={() => setSelectedLevel(null)} style={{ border: "none", background: "none", fontSize: 24, fontWeight: "bold", color: th.t3, cursor: "pointer" }}>×</button>
          </div>

          <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
            <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>{selectedLevel.questionCount}</div>
              <div style={{ ...TYPE.tiny, color: th.t2 }}>{uz ? "Savollar" : lg === "ru" ? "Вопросы" : "Questions"}</div>
            </div>
            <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>{selectedLevel.passPct}%</div>
              <div style={{ ...TYPE.tiny, color: th.t2 }}>{uz ? "O'tish chegarasi" : lg === "ru" ? "Порог прохождения" : "Pass limit"}</div>
            </div>
            <div style={{ flex: 1, background: th.bor + ALPHA.faint, padding: SPACE.s3, borderRadius: RADIUS.m, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>
                {userLevels[selectedLevel.id]?.stars || 0}/3
              </div>
              <div style={{ ...TYPE.tiny, color: th.t2 }}>{uz ? "Yulduzlar" : lg === "ru" ? "Звезды" : "Stars"}</div>
            </div>
          </div>

          <PrimaryButton th={th} onClick={() => onSelectLevel(selectedLevel)}>
            {uz ? "Bosqichni boshlash" : lg === "ru" ? "Начать уровень" : "Start Level"}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
