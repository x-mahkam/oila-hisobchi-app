// ═══════════════════════════════════════════════════════════
//  LEARNING PROFILE — farzand o'quv profili (Sprint: Learning Platform)
//  Avatar · Level · XP · Coin · oxirgi o'yin · eng yaxshi/qiyin fan ·
//  haftalik progress · AI bahosi. Barchasi MAVJUD bilim_* dan hosila.
// ═══════════════════════════════════════════════════════════
import { memo, useMemo, useState, useEffect } from "react";
import { AppCard, SectionHeader, StatCard, Badge, UIAvatar, LinearProgress } from "../components/ui/index.js";
import { useApp } from "../context/AppContext.jsx";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM } from "../utils/tokens.js";
import { fullName } from "../utils/formatters.js";
import { levelFor, rankFor } from "./engine/xp.js";
import { analyzeLearning, weeklyReport } from "./engine/analytics.js";
import { computeAchievements } from "./engine/achievements.jsx";
import { medalSvg } from "./registry.jsx";
import { db } from "../firebase.js";

// Level frame rangi (rank rangidan)
const frameGrad = (color) => "linear-gradient(135deg," + color + "," + color + "cc)";

const LearningProfile = memo(function LearningProfile({ th, lg, user, coins = 0, xp = 0, streak = 0, sessions = [] }) {
  const { t } = useApp();
  const name = fullName(user);
  const lv = useMemo(() => levelFor(xp), [xp]);
  const rankObj = useMemo(() => rankFor(lv.level), [lv.level]);
  const rank = { color: rankObj.color, label: rankObj[lg] || rankObj.uz };
  const analysis = useMemo(() => analyzeLearning(sessions, lg, name, 30), [sessions, lg, name]);
  const week = useMemo(() => weeklyReport(sessions, lg, name), [sessions, lg, name]);

  const [behavior, setBehavior] = useState({
    tasksApproved: 0,
    goalsCompleted: 0,
    tradesAccepted: 0,
    gardenLevel: 0,
    lifetimeCoins: 0,
  });

  useEffect(() => {
    if (!user?.oilaId) return;

    // Load tasksApproved
    db.g("vazifa_" + user.oilaId).then(v => {
      if (Array.isArray(v)) {
        const isMineTask = (tk) =>
          tk.assignedTo === user.id ||
          (tk.assignedLogin && user.login && tk.assignedLogin === user.login) ||
          (tk.assignedName && user.ism && tk.assignedName.trim().toLowerCase() === user.ism.trim().toLowerCase());
        
        const tasksCount = v.filter(tk => isMineTask(tk) && tk.status === "approved").length;
        setBehavior(b => ({ ...b, tasksApproved: tasksCount }));
      }
    }).catch(() => {});

    // Load goalsCompleted
    db.g("maq_" + user.oilaId).then(gList => {
      if (Array.isArray(gList)) {
        const goalsCount = gList.filter(m => 
          m.uid === user.id && 
          (m.completedAt || m.status === "completed" || (m.jamg >= m.maqsad && m.maqsad > 0))
        ).length;
        setBehavior(b => ({ ...b, goalsCompleted: goalsCount }));
      }
    }).catch(() => {});

    // Load tradesAccepted
    db.g("bilim_offer_" + user.oilaId).then(oList => {
      if (Array.isArray(oList)) {
        const tradesCount = oList.filter(o => o.kidId === user.id && o.status === "accepted").length;
        setBehavior(b => ({ ...b, tradesAccepted: tradesCount }));
      }
    }).catch(() => {});

    // Load gardenLevel
    db.g("garden_" + user.oilaId).then(g => {
      if (g) {
        setBehavior(b => ({ ...b, gardenLevel: g.level || 0 }));
      }
    }).catch(() => {});

    // Load lifetimeCoins
    db.g("bilim_coins_lifetime_" + user.id).then(v => {
      setBehavior(b => ({ ...b, lifetimeCoins: Number(v) || 0 }));
    }).catch(() => {});
  }, [user?.id, user?.oilaId]);

  const achievements = useMemo(() => {
    return computeAchievements({ coins, xp, streak }, sessions, lg, behavior);
  }, [coins, xp, streak, sessions, lg, behavior]);

  const unlocked = useMemo(() => achievements.filter(a => a.unlocked), [achievements]);
  const last = sessions && sessions.length ? sessions[0] : null;

  const subjName = (catId) => {
    const s = analysis.bySubject.find(x => x.cat === catId);
    return s ? s.name : "—";
  };

  return (
    <div>
      {/* ── Hero: avatar + level frame + rank ── */}
      <div style={{ background: frameGrad(rank.color), borderRadius: RADIUS.l, padding: SPACE.s6 + "px " + SPACE.s4, textAlign: "center", marginBottom: SPACE.s3, boxShadow: SHADOW.e1(rank.color), position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -SPACE.s12, right: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ position: "relative", display: "inline-block", marginBottom: SPACE.s2 }}>
          <div style={{ padding: 4, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.35)", display: "inline-flex" }}>
            <UIAvatar th={th} src={user?.photo} name={name} size={SPACE.s16 + SPACE.s2} />
          </div>
          <span style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", background: "#fff", color: rank.color, ...TYPE.tiny, fontWeight: 800, letterSpacing: 0, borderRadius: RADIUS.pill, padding: "2px 10px", boxShadow: SHADOW.e1(rank.color) }}>
            LVL {lv.level}
          </span>
        </div>
        <div style={{ ...TYPE.heading, fontWeight: 800, color: "#fff" }}>{name}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: SPACE.s1, background: "rgba(255,255,255,0.22)", borderRadius: RADIUS.pill, padding: "3px 12px" }}>
          {medalSvg("#fff", 14)}<span style={{ ...TYPE.caption, fontWeight: 700, color: "#fff" }}>{rank.label}</span>
        </div>
        {/* XP progress */}
        <div style={{ marginTop: SPACE.s3, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>
            <span>{lv.inLevel} / {lv.max ? "MAX" : (lv.nextBase - lv.curBase >= 0 ? (lv.inLevel + lv.toNext) : "")} XP</span>
            <span>{lv.max ? t("lp_maxLevel") : lv.toNext + " XP → LVL " + (lv.level + 1)}</span>
          </div>
          <div style={{ height: 8, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
            <div style={{ width: lv.pct + "%", height: "100%", background: "#fff", borderRadius: RADIUS.full }} />
          </div>
        </div>
      </div>

      {/* ── Coin · XP · Streak ── */}
      <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
        <StatCard th={th} value={coins} label="Coin" tone={PREMIUM.gold} />
        <StatCard th={th} value={xp} label="XP" tone={th.ac} />
        <StatCard th={th} value={streak} label={t("lp_streak")} tone={th.rd} />
      </div>

      {/* ── Fan kesimi: eng yaxshi / eng qiyin ── */}
      <SectionHeader th={th}>{t("lp_subjects")}</SectionHeader>
      <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
        <AppCard th={th} style={{ flex: 1, background: th.gr + ALPHA.faint, border: "1px solid " + th.gr + ALPHA.med }}>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{t("lp_bestSubject")}</div>
          <div style={{ ...TYPE.subtitle, color: th.gr, marginTop: 2 }}>{analysis.best ? analysis.best.name : "—"}</div>
          {analysis.best && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginTop: 1 }}>{analysis.best.pct}%</div>}
        </AppCard>
        <AppCard th={th} style={{ flex: 1, background: th.am + ALPHA.faint, border: "1px solid " + th.am + ALPHA.med }}>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{t("lp_hardestSubject")}</div>
          <div style={{ ...TYPE.subtitle, color: th.am, marginTop: 2 }}>{analysis.weak ? analysis.weak.name : "—"}</div>
          {analysis.weak && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginTop: 1 }}>{analysis.weak.pct}%</div>}
        </AppCard>
      </div>

      {/* ── Oxirgi o'yin ── */}
      {last && (
        <>
          <SectionHeader th={th}>{t("lp_lastGame")}</SectionHeader>
          <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
            <div style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.m, background: th.ac + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{medalSvg(th.ac, 24)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...TYPE.subtitle, color: th.t1 }}>{subjName((last.gameId || "").split("/")[0])} · {last.correct}/{last.total}</div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>{last.pct}% · +{last.coins} coin · +{last.xp || 0} XP</div>
            </div>
            {last.pct >= 90 && <Badge th={th} tone={th.gr}>{t("lp_great")}</Badge>}
          </AppCard>
        </>
      )}

      {/* ── Haftalik progress ── */}
      <SectionHeader th={th}>{t("lp_weeklyProgress")}</SectionHeader>
      <AppCard th={th}>
        <div style={{ display: "flex", gap: SPACE.s2 }}>
          <StatCard th={th} value={week.games} label={t("lp_games")} tone={th.ac} />
          <StatCard th={th} value={week.coins} label="Coin" tone={PREMIUM.gold} />
          <StatCard th={th} value={week.xp} label="XP" tone={th.gr} />
        </div>
      </AppCard>

      {/* ── Yutuqlar ── */}
      <SectionHeader th={th} right={<Badge th={th} type="premium" icon={null}>{unlocked.length}/{achievements.length}</Badge>}>{t("lp_achievements")}</SectionHeader>
      <div style={{ display: "flex", gap: SPACE.s2, overflowX: "auto", paddingBottom: SPACE.s2, marginBottom: SPACE.s3, WebkitOverflowScrolling: "touch" }}>
        {achievements.map(a => (
          <div key={a.id} style={{ flexShrink: 0, width: SPACE.s16 + SPACE.s6, textAlign: "center", background: a.unlocked ? a.color + ALPHA.faint : th.sur, border: a.unlocked ? "1.5px solid " + a.color + ALPHA.strong : "1px dashed " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s2, opacity: a.unlocked ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 2, filter: a.unlocked ? "none" : "grayscale(1)" }}>{a.icon(a.unlocked ? a.color : th.t3, 26)}</div>
            <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: a.unlocked ? th.t1 : th.t3, lineHeight: 1.2 }}>{a.title}</div>
            {!a.unlocked && <div style={{ ...TYPE.tiny, letterSpacing: 0, color: th.t3, marginTop: 1 }}>{a.cur}/{a.goal}</div>}
          </div>
        ))}
      </div>

      {/* ── AI bahosi ── */}
      <SectionHeader th={th}>{t("lp_usefulAssessment")}</SectionHeader>
      <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med }}>
        <div style={{ display: "flex", gap: SPACE.s2, alignItems: "flex-start" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10 2a5 5 0 00-3 9c.6.5 1 1 1 2h4c0-1 .4-1.5 1-2a5 5 0 00-3-9z" stroke={th.ac} strokeWidth="1.4" fill={th.ac} fillOpacity="0.15"/><path d="M8 16h4M8.5 18h3" stroke={th.ac} strokeWidth="1.4" strokeLinecap="round"/></svg>
          <div>
            <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{analysis.tip}</div>
            {analysis.weakTip && <div style={{ ...TYPE.caption, color: th.t2, marginTop: 2 }}>{analysis.weakTip}</div>}
          </div>
        </div>
      </AppCard>
    </div>
  );
});

export default LearningProfile;
