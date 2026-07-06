// ═══════════════════════════════════════════════════════════
//  LEARNING PROFILE — farzand o'quv profili (Sprint: Learning Platform)
//  Avatar · Level · XP · Coin · oxirgi o'yin · eng yaxshi/qiyin fan ·
//  haftalik progress · AI bahosi. Barchasi MAVJUD bilim_* dan hosila.
// ═══════════════════════════════════════════════════════════
import { memo, useMemo } from "react";
import { AppCard, SectionHeader, StatCard, Badge, UIAvatar, LinearProgress } from "../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM } from "../utils/tokens.js";
import { fullName } from "../utils/formatters.js";
import { levelFor, rankFor } from "./engine/xp.js";
import { analyzeLearning, weeklyReport } from "./engine/analytics.js";
import { medalSvg } from "./registry.jsx";

// Level frame rangi (rank rangidan)
const frameGrad = (color) => "linear-gradient(135deg," + color + "," + color + "cc)";

const LearningProfile = memo(function LearningProfile({ th, lg, user, coins = 0, xp = 0, streak = 0, sessions = [] }) {
  const uz = lg === "uz";
  const name = fullName(user);
  const lv = useMemo(() => levelFor(xp), [xp]);
  const rankObj = useMemo(() => rankFor(lv.level), [lv.level]);
  const rank = { color: rankObj.color, label: rankObj[lg] || rankObj.uz };
  const analysis = useMemo(() => analyzeLearning(sessions, lg, name, 30), [sessions, lg, name]);
  const week = useMemo(() => weeklyReport(sessions, lg, name), [sessions, lg, name]);
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
            <span>{lv.max ? (uz ? "Maksimal daraja" : "Max level") : lv.toNext + " XP → LVL " + (lv.level + 1)}</span>
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
        <StatCard th={th} value={streak} label={uz ? "Streak" : "Streak"} tone={th.rd} />
      </div>

      {/* ── Fan kesimi: eng yaxshi / eng qiyin ── */}
      <SectionHeader th={th}>{uz ? "Fanlar" : lg === "ru" ? "Предметы" : "Subjects"}</SectionHeader>
      <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
        <AppCard th={th} style={{ flex: 1, background: th.gr + ALPHA.faint, border: "1px solid " + th.gr + ALPHA.med }}>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{uz ? "Eng yaxshi fan" : lg === "ru" ? "Лучший" : "Best subject"}</div>
          <div style={{ ...TYPE.subtitle, color: th.gr, marginTop: 2 }}>{analysis.best ? analysis.best.name : "—"}</div>
          {analysis.best && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginTop: 1 }}>{analysis.best.pct}%</div>}
        </AppCard>
        <AppCard th={th} style={{ flex: 1, background: th.am + ALPHA.faint, border: "1px solid " + th.am + ALPHA.med }}>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{uz ? "Eng qiyin fan" : lg === "ru" ? "Сложный" : "Hardest"}</div>
          <div style={{ ...TYPE.subtitle, color: th.am, marginTop: 2 }}>{analysis.weak ? analysis.weak.name : "—"}</div>
          {analysis.weak && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t3, marginTop: 1 }}>{analysis.weak.pct}%</div>}
        </AppCard>
      </div>

      {/* ── Oxirgi o'yin ── */}
      {last && (
        <>
          <SectionHeader th={th}>{uz ? "Oxirgi o'yin" : lg === "ru" ? "Последняя игра" : "Last game"}</SectionHeader>
          <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
            <div style={{ width: COMP.touchMin, height: COMP.touchMin, borderRadius: RADIUS.m, background: th.ac + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{medalSvg(th.ac, 24)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...TYPE.subtitle, color: th.t1 }}>{subjName((last.gameId || "").split("/")[0])} · {last.correct}/{last.total}</div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>{last.pct}% · +{last.coins} coin · +{last.xp || 0} XP</div>
            </div>
            {last.pct >= 90 && <Badge th={th} tone={th.gr}>{uz ? "Zo'r" : "Great"}</Badge>}
          </AppCard>
        </>
      )}

      {/* ── Haftalik progress ── */}
      <SectionHeader th={th}>{uz ? "Haftalik progress" : lg === "ru" ? "Прогресс за неделю" : "Weekly progress"}</SectionHeader>
      <AppCard th={th}>
        <div style={{ display: "flex", gap: SPACE.s2 }}>
          <StatCard th={th} value={week.games} label={uz ? "O'yin" : "Games"} tone={th.ac} />
          <StatCard th={th} value={week.coins} label="Coin" tone={PREMIUM.gold} />
          <StatCard th={th} value={week.xp} label="XP" tone={th.gr} />
        </div>
      </AppCard>

      {/* ── AI bahosi ── */}
      <SectionHeader th={th}>{uz ? "AI bahosi" : lg === "ru" ? "Оценка AI" : "AI assessment"}</SectionHeader>
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
