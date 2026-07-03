// ═══════════════════════════════════════════════════════════
//  LIDERBORD — ilovadagi barcha bolalar reytingi
//  Tablar: Haftalik / Oylik / Butun davr (4-rasmdagi uslub)
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { fetchKidsBoard, weekKey, monthKey } from "../utils/kidsBoard.js";

const AV_GRADS = [
  "linear-gradient(135deg,#f97316,#ef4444)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#ec4899,#d946ef)",
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#f59e0b,#f97316)",
  "linear-gradient(135deg,#06b6d4,#3b82f6)",
];

const MEDALS = ["🥇", "🥈", "🥉"];

export default function KidsLeaderboard({ th, lg, user }) {
  const [tab, setTab] = useState("week"); // week | month | all
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let live = true;
    fetchKidsBoard().then(list => { if (live) setRows(list); });
    return () => { live = false; };
  }, []);

  const wk = weekKey(), mk = monthKey();
  const ptsOf = e => tab === "week" ? (Number(e.tW?.[wk]) || 0) : tab === "month" ? (Number(e.tM?.[mk]) || 0) : (Number(e.total) || 0);
  const sorted = (rows || []).map(e => ({ ...e, pts: ptsOf(e) })).filter(e => e.pts > 0 || e.id === user?.id).sort((a, b) => b.pts - a.pts).slice(0, 20);
  const myIdx = sorted.findIndex(e => e.id === user?.id);

  const TABS = [
    { id: "week",  lb: lg === "uz" ? "Haftalik" : "Weekly" },
    { id: "month", lb: lg === "uz" ? "Oylik" : "Monthly" },
    { id: "all",   lb: lg === "uz" ? "Butun davr" : "All time" },
  ];

  return (
    <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 20, padding: "16px 14px", marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: th.t1, textAlign: "center", marginBottom: 12 }}>
        🏆 {lg === "uz" ? "Liderbord" : "Leaderboard"}
      </div>

      {/* Tablar */}
      <div style={{ display: "flex", background: th.surH || th.bg, borderRadius: 14, padding: 4, marginBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 11, padding: "9px 0", fontSize: 12.5, fontWeight: 800, transition: "all .2s",
              background: tab === t.id ? "linear-gradient(135deg,#8b5cf6,#6366f1)" : "transparent",
              color: tab === t.id ? "#fff" : th.t2 }}>
            {t.lb}
          </button>
        ))}
      </div>

      {rows === null && (
        <div style={{ textAlign: "center", padding: "26px 0", color: th.t2, fontSize: 13 }}>{lg === "uz" ? "Yuklanmoqda..." : "Loading..."}</div>
      )}

      {rows !== null && sorted.length === 0 && (
        <div style={{ textAlign: "center", padding: "26px 0", color: th.t2 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🌱</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Hali natijalar yo'q" : "No results yet"}</div>
          <div style={{ fontSize: 11.5, marginTop: 4 }}>{lg === "uz" ? "Vazifa bajarib va o'yin o'ynab ball to'plang!" : "Do tasks and play games to earn points!"}</div>
        </div>
      )}

      {rows !== null && sorted.map((e, i) => {
        const isMe = e.id === user?.id;
        const initials = (e.ism || "?").trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
        return (
          <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 16, marginBottom: 8,
            background: isMe ? "linear-gradient(135deg,#8b5cf618,#6366f10d)" : (th.surH || "transparent"),
            border: "1px solid " + (isMe ? "#8b5cf655" : th.bor) }}>
            {/* Avatar + o'rin belgisi */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: AV_GRADS[i % AV_GRADS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", border: "2px solid " + th.bor }}>
                {initials}
              </div>
              <div style={{ position: "absolute", top: -5, right: -7, minWidth: 20, height: 20, borderRadius: "50%", background: th.sur, border: "1.5px solid " + (i < 3 ? "#f59e0b" : th.bor), display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? 11 : 10, fontWeight: 800, color: th.t1, padding: "0 2px" }}>
                {i < 3 ? MEDALS[i] : i + 1}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: th.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.ism}{isMe ? (lg === "uz" ? " (siz)" : " (you)") : ""}
              </div>
              <div style={{ fontSize: 10.5, color: th.t2, marginTop: 1 }}>
                🏆 {e.taskCount || 0} {lg === "uz" ? "vazifa" : "tasks"} · 🎯 {(Number(e.taskEarn) || 0).toLocaleString()} {lg === "uz" ? "so'm topgan" : "earned"}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="15" height="15" viewBox="0 0 24 24"><path d="M6 3 h12 l4 6 -10 12 L2 9 Z" fill="#8b5cf6" /><path d="M6 3 l3 6 L2 9 Z M18 3 l-3 6 L22 9 Z M9 9 h6 l-3 12 Z" fill="#c4b5fd" opacity="0.6" /></svg>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#8b5cf6", lineHeight: 1 }}>{e.pts}</div>
                <div style={{ fontSize: 8.5, color: th.t2 }}>{lg === "uz" ? "ball" : "pts"}</div>
              </div>
            </div>
          </div>
        );
      })}

      {rows !== null && myIdx === -1 && user && (
        <div style={{ textAlign: "center", fontSize: 11, color: th.t2, marginTop: 6 }}>
          {lg === "uz" ? "Ball to'plab ro'yxatga qo'shiling! 🚀" : "Earn points to join! 🚀"}
        </div>
      )}
    </div>
  );
}
