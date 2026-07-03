import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { KatIco, DarIco, Av, SL, SC } from "../components/common/index.jsx";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { KATS, KN, DARS, DN, RELATIONS } from "../utils/constants.js";
import { tm } from "../utils/formatters.js";

export default function ReportsPage({
  user, azolar, qarzlar, maq,
  th, t, f, lg, scr, isPremium, isAdmin,
  bX, bD, jX, jD, bdj, canSeeReport, xar, dar,
  hisFil, setHisFil,
  exportLoading, exportExcel, exportPDF,
  adv, advL, aiAdv,
  adminStats, adminLoad, loadAdminStats,
}) {
  // PDF hisobot doirasi: o'zimning / oilamning
  const [pdfScope, setPdfScope] = useState(canSeeReport ? "family" : "mine");
  const STY = useMemo(() => makeS(th), [th]);

  // ── Admin panel ──────────────────────────────────────────
  if (scr === "admin" && isAdmin) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ fontSize: 22 }}>🛠️</span>
          <div style={{ fontSize: 18, fontWeight: 800, color: th.t1 }}>{lg === "uz" ? "Admin Panel" : "Admin Panel"}</div>
          <span style={{ fontSize: 9, background: "#f43f5e", color: "#fff", borderRadius: 8, padding: "2px 7px", fontWeight: 800 }}>MAXFIY</span>
        </div>
        {adminLoad ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: th.t2 }}>{lg === "uz" ? "Yuklanmoqda..." : "Loading..."}</div>
        ) : adminStats && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 14 }}>
              <div style={{ ...STY.cd, margin: 0, textAlign: "center", background: "linear-gradient(135deg," + th.ac + "15," + th.ac2 + "08)", border: "1px solid " + th.ac + "33" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: th.ac }}>{adminStats.totalUsers}</div>
                <div style={{ fontSize: 11, color: th.t2, fontWeight: 600, marginTop: 2 }}>{lg === "uz" ? "Jami foydalanuvchi" : "Total users"}</div>
              </div>
              <div style={{ ...STY.cd, margin: 0, textAlign: "center", background: "linear-gradient(135deg," + th.gr + "15," + th.gr + "08)", border: "1px solid " + th.gr + "33" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: th.gr }}>{adminStats.totalOilas}</div>
                <div style={{ fontSize: 11, color: th.t2, fontWeight: 600, marginTop: 2 }}>{lg === "uz" ? "Jami oila" : "Total families"}</div>
              </div>
            </div>
            <div style={{ ...STY.cd, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: th.t1, marginBottom: 12 }}>📈 {lg === "uz" ? "Yangi qo'shilganlar" : "New signups"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: th.ac }}>{adminStats.todayU}</div><div style={{ fontSize: 10, color: th.t2 }}>{lg === "uz" ? "Bugun" : "Today"}</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: th.am }}>{adminStats.weekU}</div><div style={{ fontSize: 10, color: th.t2 }}>{lg === "uz" ? "7 kun" : "7 days"}</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: th.gr }}>{adminStats.monthU}</div><div style={{ fontSize: 10, color: th.t2 }}>{lg === "uz" ? "30 kun" : "30 days"}</div></div>
              </div>
            </div>
            <div style={{ ...STY.cd, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: th.t1, marginBottom: 12 }}>💰 {lg === "uz" ? "Moliyaviy faollik" : "Financial activity"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Jami daromad" : "Total income"}</span><span style={{ fontSize: 14, fontWeight: 700, color: th.gr }}>{f(adminStats.totD, true)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Jami xarajat" : "Total expenses"}</span><span style={{ fontSize: 14, fontWeight: 700, color: th.rd }}>{f(adminStats.totX, true)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid " + th.bor, paddingTop: 9 }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Yozuvlar soni" : "Records"}</span><span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{adminStats.xCount + adminStats.dCount} (X:{adminStats.xCount} / D:{adminStats.dCount})</span></div>
              </div>
            </div>
            <div style={{ ...STY.cd, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: th.t1, marginBottom: 12 }}>📊 {lg === "uz" ? "Boshqa" : "Other"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Premium oilalar" : "Premium families"}</span><span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>⭐ {adminStats.premOilas}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "O'rtacha a'zo/oila" : "Avg members/family"}</span><span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{adminStats.avgPerOila}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Jami yozuvlar (DB)" : "Total DB docs"}</span><span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{adminStats.docCount}</span></div>
              </div>
            </div>
            <div style={{ ...STY.cd, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>💬 {lg === "uz" ? "Foydalanuvchi fikrlari" : "User feedback"} ({adminStats.fbCount || 0})</div>
                {adminStats.avgRating > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>⭐ {adminStats.avgRating}</div>}
              </div>
              {(!adminStats.feedbacks || adminStats.feedbacks.length === 0) ? (
                <div style={{ fontSize: 12, color: th.t2, textAlign: "center", padding: "16px 0" }}>{lg === "uz" ? "Hali fikr yo'q" : "No feedback yet"}</div>
              ) : (
                <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
                  {adminStats.feedbacks.map((fb, i) => (
                    <div key={i} style={{ background: th.bg, borderRadius: 11, padding: "11px 13px", marginBottom: 8, border: "1px solid " + th.bor }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: th.t1 }}>{fb.ism || (lg === "uz" ? "Anonim" : "Anonymous")}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {fb.rating > 0 && <span style={{ fontSize: 11, color: "#f59e0b" }}>{"⭐".repeat(fb.rating)}</span>}
                          <span style={{ fontSize: 9, background: (fb.type === "kamchilik" ? th.rd : fb.type === "maqtov" ? th.gr : th.ac) + "22", color: fb.type === "kamchilik" ? th.rd : fb.type === "maqtov" ? th.gr : th.ac, borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>{fb.type === "kamchilik" ? (lg === "uz" ? "Kamchilik" : "Bug") : fb.type === "maqtov" ? (lg === "uz" ? "Maqtov" : "Praise") : (lg === "uz" ? "Taklif" : "Idea")}</span>
                        </div>
                      </div>
                      {fb.text && <div style={{ fontSize: 12, color: th.t2, lineHeight: 1.5 }}>{fb.text}</div>}
                      <div style={{ fontSize: 9, color: th.t2, marginTop: 5, opacity: .7 }}>{(fb.sana || "").slice(0, 10)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <button onClick={loadAdminStats} style={{ ...STY.bt(), display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{Ico.repeat("#fff")}{lg === "uz" ? "Yangilash" : "Refresh"}</button>
      </div>
    );
  }

  // ── AI maslahat ──────────────────────────────────────────
  if (scr === "maslahat") {
    return (
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: th.t1 }}>{t.aa}</div>
        {advL ? (
          <div style={{ textAlign: "center", padding: "64px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>{Ico.brain(th.ac)}<div style={{ color: th.t2 }}>{t.an}</div></div>
        ) : adv && (
          <div style={{ ...STY.cd, lineHeight: 1.85, fontSize: 14, color: th.t1, whiteSpace: "pre-wrap" }}>{adv}</div>
        )}
        {!advL && <button onClick={aiAdv} style={{ ...STY.bt(), marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{Ico.repeat(th.ac)}{t.na}</button>}
      </div>
    );
  }

  // ── Asosiy hisobot sahifasi ──────────────────────────────
  const effFil = canSeeReport ? hisFil : user?.id;
  const fX = effFil === "all" ? bX : bX.filter(x => x.uid === effFil);
  const fD = effFil === "all" ? bD : bD.filter(d => d.uid === effFil);
  const fjX = fX.reduce((s, x) => s + Number(x.summa || 0), 0);
  const fjD = fD.reduce((s, d) => s + Number(d.summa || 0), 0);
  const fb = fjD - fjX;

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: th.t1 }}>{tm()} {t.mr}</div>

      {!canSeeReport && azolar.length > 1 && (
        <div style={{ background: th.ac + "11", borderRadius: 12, padding: "11px 14px", marginBottom: 14, fontSize: 12, color: th.t2, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔒</span>{lg === "uz" ? "Siz faqat o'z hisobotingizni ko'rasiz. Umumiy oila hisoboti uchun oila boshidan ruxsat so'rang." : "You see only your own report. Ask the head for full access."}
        </div>
      )}

      {/* ── YANGI: Vizual chart bloki ── */}
      <ReportVisualBlock
        th={th} lg={lg} f={f}
        bX={bX} bD={bD} fjX={fjX} fjD={fjD}
        KATS={KATS} KN={KN}
        xar={xar} dar={dar} user={user} azolar={azolar} canSeeReport={canSeeReport}
      />

      {/* Moliyaviy sog'liq skor */}
      {(() => {
       try {
        // Xavfsiz manbalar: prop kelmasa ham sahifa qulamaydi
        const sXar = Array.isArray(xar) ? xar : [];
        const sDar = Array.isArray(dar) ? dar : [];
        const sMaq = Array.isArray(maq) ? maq : [];
        const sQarz = Array.isArray(qarzlar) ? qarzlar : [];
        const sBdj = Number(bdj) || 0;
        // Joriy oy bo'sh bo'lsa — oxirgi 30 kun, u ham bo'sh bo'lsa — butun davr
        let hX = Number(jX) || 0, hD = Number(jD) || 0, hSrc = Array.isArray(bX) ? bX : [], hFb = false;
        if (hX === 0 && hD === 0) {
          const cut = new Date(Date.now() - 30 * 86400000);
          const cs = `${cut.getFullYear()}-${String(cut.getMonth()+1).padStart(2,"0")}-${String(cut.getDate()).padStart(2,"0")}`;
          hSrc = sXar.filter(x => x.sana && x.sana >= cs);
          hX = hSrc.reduce((s, x) => s + Number(x.summa || 0), 0);
          hD = sDar.filter(d => d.sana && d.sana >= cs).reduce((s, d) => s + Number(d.summa || 0), 0);
          hFb = true;
        }
        if (hX === 0 && hD === 0 && (sXar.length > 0 || sDar.length > 0)) {
          hSrc = sXar;
          hX = sXar.reduce((s, x) => s + Number(x.summa || 0), 0);
          hD = sDar.reduce((s, d) => s + Number(d.summa || 0), 0);
          hFb = true;
        }
        let score = 50;
        const checks = [];
        if (hD >= hX) { score += 20; checks.push({ ok: true, t: lg === "uz" ? "Daromad xarajatdan ko'p" : "Income exceeds expenses" }); }
        else { score -= 15; checks.push({ ok: false, t: lg === "uz" ? "Xarajat daromaddan ko'p" : "Expenses exceed income" }); }
        if (sBdj > 0 && hX <= sBdj) { score += 15; checks.push({ ok: true, t: lg === "uz" ? "Budjetdan chiqmagansiz" : "Within budget" }); }
        else if (sBdj > 0) { score -= 15; checks.push({ ok: false, t: lg === "uz" ? "Budjetdan oshib ketdingiz" : "Over budget" }); }
        const savePct = hD > 0 ? (hD - hX) / hD * 100 : 0;
        if (savePct >= 20) { score += 15; checks.push({ ok: true, t: lg === "uz" ? "Yaxshi jamg'arma (20%+)" : "Good savings (20%+)" }); }
        else if (savePct > 0) { score += 5; checks.push({ ok: true, t: lg === "uz" ? "Ozgina jamg'arma bor" : "Some savings" }); }
        else { checks.push({ ok: false, t: lg === "uz" ? "Jamg'arma yo'q" : "No savings" }); }
        const topKat = KATS.map((k, i) => ({ nom: KN[lg][i], sum: hSrc.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).sort((a, b) => b.sum - a.sum)[0];
        if (topKat && hX > 0 && topKat.sum / hX > 0.5) { score -= 5; checks.push({ ok: false, t: topKat.nom + " " + (lg === "uz" ? "xarajati yuqori" : "spending high") }); }
        if (sMaq.length > 0) { score += 5; checks.push({ ok: true, t: lg === "uz" ? "Moliyaviy maqsadingiz bor" : "You have goals" }); }
        const activeDebt = sQarz.filter(q => !q.paid && q.tur === "olgan").reduce((s, q) => s + Number(q.summa || 0), 0);
        if (activeDebt > 0 && hD > 0 && activeDebt > hD) { score -= 10; checks.push({ ok: false, t: lg === "uz" ? "Qarzingiz daromaddan ko'p" : "Debt exceeds income" }); }
        score = Math.max(0, Math.min(100, Math.round(score)));
        const sColor = score >= 75 ? th.gr : score >= 50 ? th.am : th.rd;
        const sLabel = score >= 75 ? (lg === "uz" ? "Zo'r!" : "Excellent!") : score >= 50 ? (lg === "uz" ? "Yaxshi" : "Good") : (lg === "uz" ? "Yaxshilash kerak" : "Needs work");
        if (hX === 0 && hD === 0) return (
          <div style={{ ...STY.cd, marginBottom: 14, textAlign: "center", padding: "18px" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{"\ud83e\ude7a"}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Moliyaviy sog'liq" : "Financial health"}</div>
            <div style={{ fontSize: 11, color: th.t2, marginTop: 4 }}>{lg === "uz" ? "Hisoblash uchun xarajat va daromad kiriting" : "Add expenses and income to calculate"}</div>
          </div>
        );
        return (
          <div style={{ ...STY.cd, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke={th.bor} strokeWidth="8" /><circle cx="40" cy="40" r="34" fill="none" stroke={sColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 * (1 - score / 100)} transform="rotate(-90 40 40)" /></svg>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 22, fontWeight: 800, color: sColor }}>{score}</span><span style={{ fontSize: 9, color: th.t2 }}>/100</span></div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: th.t2, fontWeight: 600, marginBottom: 2 }}>{lg === "uz" ? "Moliyaviy sog'liq" : "Financial health"}{hFb ? (lg === "uz" ? " (oxirgi 30 kun)" : " (last 30d)") : ""}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: sColor }}>{sLabel}</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid " + th.bor, paddingTop: 12 }}>
              {checks.slice(0, 5).map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, fontSize: 12, color: th.t1 }}>
                  <span style={{ color: c.ok ? th.gr : th.am, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{c.ok ? "✓" : "⚠"}</span>{c.t}
                </div>
              ))}
            </div>
          </div>
        );
       } catch (e) { console.error("health widget:", e); return null; }
      })()}

      {hisFil === "all" && canSeeReport && azolar.length > 1 && (() => {
        const memStats = azolar.map(a => {
          const ax = bX.filter(x => x.uid === a.id).reduce((s, x) => s + Number(x.summa || 0), 0);
          const ad = bD.filter(d => d.uid === a.id).reduce((s, d) => s + Number(d.summa || 0), 0);
          const cnt = bX.filter(x => x.uid === a.id).length + bD.filter(d => d.uid === a.id).length;
          return { ...a, ax, ad, bal: ad - ax, cnt };
        });
        const topSaver = [...memStats].sort((p, q) => q.bal - p.bal)[0];
        const lowSpender = [...memStats].filter(m => m.ax > 0).sort((p, q) => p.ax - q.ax)[0];
        const mostActive = [...memStats].sort((p, q) => q.cnt - p.cnt)[0];
        const awards = [];
        if (topSaver && topSaver.bal > 0) awards.push({ emoji: "🏆", color: "#f59e0b", titleUz: "Eng ko'p tejagan", titleEn: "Top saver", who: topSaver, val: "+" + f(topSaver.bal, true) });
        if (lowSpender && mostActive && lowSpender.id !== (topSaver && topSaver.id)) awards.push({ emoji: "💎", color: "#10b981", titleUz: "Eng kam xarajat", titleEn: "Lowest spender", who: lowSpender, val: f(lowSpender.ax, true) });
        if (mostActive && mostActive.cnt > 0) awards.push({ emoji: "⚡", color: "#6366f1", titleUz: "Eng faol a'zo", titleEn: "Most active", who: mostActive, val: mostActive.cnt + (lg === "uz" ? " yozuv" : " records") });
        if (awards.length === 0) return null;
        return (
          <div style={{ ...STY.cd, background: "linear-gradient(135deg,#f59e0b0d,#ec489908)", border: "1.5px solid #f59e0b33", marginBottom: 14, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 18 }}>🏅</span><div style={{ fontSize: 14, fontWeight: 800, color: "#f59e0b" }}>{lg === "uz" ? "Oilaviy reyting" : "Family ranking"}</div></div>
            <div style={{ fontSize: 11, color: th.t2, marginBottom: 14 }}>{tm()} · {lg === "uz" ? "Bu oy yutuqlari" : "This month's achievements"}</div>
            {awards.map((aw, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: th.sur, borderRadius: 13, padding: "11px 14px", marginBottom: 9, border: "1px solid " + aw.color + "33" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: aw.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{aw.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: aw.color, fontWeight: 700, marginBottom: 2 }}>{lg === "uz" ? aw.titleUz : aw.titleEn}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: th.t1, display: "flex", alignItems: "center", gap: 6 }}><Av src={aw.who.photo} name={aw.who.ism} size={20} ac={aw.color} />{aw.who.ism}{aw.who.id === user.id && <span style={{ fontSize: 9, color: aw.color }}>({t.me})</span>}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: aw.color, flexShrink: 0, textAlign: "right" }}>{aw.val}</div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: th.t2, textAlign: "center", marginTop: 6, fontStyle: "italic" }}>{lg === "uz" ? "💪 Oilaviy tejamkorlikni rag'batlantiring!" : "💪 Encourage family savings!"}</div>
          </div>
        );
      })()}

      {/* Hisobot doirasi: O'zimning / Oilamning */}
      <div style={{ marginTop: 6, marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: th.t2, fontWeight: 700, marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>{lg === "uz" ? "Hisobotni yuklab olish" : "Download report"}</div>
        {canSeeReport && azolar.length > 1 && (
          <div style={{ display: "flex", background: th.surH, borderRadius: 12, padding: 3, gap: 3, border: "1.5px solid " + th.bor, marginBottom: 10 }}>
            {[["mine", (lg === "uz" ? "O'zimning" : "Mine")], ["family", (lg === "uz" ? "Oilamning" : "Family")]].map(([key, label]) => (
              <button key={key} onClick={() => setPdfScope(key)} style={{
                flex: 1, padding: "9px 0", border: "none", borderRadius: 9, cursor: "pointer",
                fontWeight: 700, fontSize: 13, transition: "all .2s",
                background: pdfScope === key ? "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")" : (th.dark ? "#374151" : "transparent"),
                color: pdfScope === key ? "#fff" : (th.dark ? "#D1D5DB" : th.t2),
              }}>{key === "mine" ? "\ud83d\udc64 " : "\ud83d\udc65 "}{label}</button>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={exportExcel} disabled={exportLoading} style={{ ...STY.bt("#10b981", "#059669"), marginBottom: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: exportLoading ? .6 : 1, position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white" opacity=".2" /><path d="M5 6l2.5 3L5 12M9 12h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {exportLoading ? "..." : "Excel"}{!isPremium && <span style={{ position: "absolute", top: -6, right: -6, fontSize: 8, background: "#f59e0b", color: "#fff", borderRadius: 8, padding: "1px 5px", fontWeight: 800 }}>PRO</span>}
        </button>
        <button onClick={() => exportPDF(pdfScope)} style={{ ...STY.bt("#ef4444", "#dc2626"), marginBottom: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white" opacity=".2" /><path d="M5 4h5l3 3v7H5V4z" stroke="white" strokeWidth="1.3" strokeLinejoin="round" /><line x1="7" y1="10" x2="11" y2="10" stroke="white" strokeWidth="1.2" strokeLinecap="round" /></svg>
          PDF{!isPremium && <span style={{ position: "absolute", top: -6, right: -6, fontSize: 8, background: "#f59e0b", color: "#fff", borderRadius: 8, padding: "1px 5px", fontWeight: 800 }}>PRO</span>}
        </button>
      </div>
      <button onClick={aiAdv} style={{ ...STY.bt(), marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{Ico.brain(th.ac)}{t.aa}</button>
    </div>
  );
}


// ── ISO hafta helperlari: hafta DOIM Dushanbadan boshlanadi ──
function getISOWeekR(d) {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const jan1 = new Date(date.getFullYear(), 0, 1);
  return Math.round(((date - jan1) / 86400000 - 3 + (jan1.getDay() + 6) % 7) / 7) + 1;
}
function getMondayR(year, week) {
  const jan4 = new Date(year, 0, 4);
  const jd = jan4.getDay() || 7; // 1=Du ... 7=Ya
  const m = new Date(jan4);
  m.setDate(jan4.getDate() - (jd - 1) + (week - 1) * 7);
  return m;
}
// Mahalliy sana (toISOString UTC+5 da 1 kun orqaga surib yuboradi)
function fmtLocalR(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
const HAFTA_KUN = ["Du","Se","Ch","Pa","Ju","Sh","Ya"]; // Dushanba → Yakshanba
const DAR_EMOJI = { oylik:"💼", qoshimcha:"⚡", biznes:"🏢", sovga:"🎁", boshqa:"💰" };
const SLIDE_H = 232; // barcha slaydlar bir xil balandlik
const OY_QISQA = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
const fmtRangeUz = (s) => { const d = new Date(s); return d.getDate() + " " + OY_QISQA[d.getMonth()] + " " + d.getFullYear(); };
const DATE_COLORS = ["#10b981","#f59e0b","#3b82f6","#a855f7","#ec4899","#06b6d4"];

// ═══════════════════════════════════════════════════════════════
// ReportVisualBlock — 4 slide swipeable chart
// ═══════════════════════════════════════════════════════════════
function ReportVisualBlock({ th, lg, f, bX, bD, fjX, fjD, KATS, KN, xar, dar, user, azolar, canSeeReport }) {
  const KAT_EMOJI = {
    oziq:"🛒", transport:"🚗", kiyim:"👕", sog:"💊",
    kommunal:"🏠", konil:"🎬", talim:"📚", hadya:"🎁", qarz:"💸", boshqa:"💳"
  };

  // ── Davr tanlash state ─────────────────────────────────
  const [type,     setType]    = useState("xarajat"); // xarajat | daromad
  const [typeMenu, setTypeMenu] = useState(false);     // tur tanlash dropdown
  const [customRange, setCustomRange] = useState(null); // {from, to} — maxsus davr
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rFrom, setRFrom] = useState("");
  const [rTo,   setRTo]   = useState("");
  const [scope,    setScope]   = useState("mine");   // mine | family
  const [period,   setPeriod]  = useState("oy");     // hafta | oy | yil
  const [slideIdx, setSlideIdx] = useState(0);       // 0=donut+dates, 1=donut+cats, 2=line, 3=oila a'zolari

  // Joriy sana
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth(); // 0-based
  const thisWeek = getISOWeekR(now);

  // Davr variantlari
  const periodOptions = {
    hafta: Array.from({ length: Math.min(thisWeek, 8) }, (_, i) => {
      const w = thisWeek - (Math.min(thisWeek, 8) - 1 - i);
      const mo = getMondayR(thisYear, w);
      const su = new Date(mo.getTime() + 6 * 86400000);
      const sub = `${mo.getDate()}.${String(mo.getMonth()+1).padStart(2,"0")} – ${su.getDate()}.${String(su.getMonth()+1).padStart(2,"0")}`;
      if (w === thisWeek) return { key: `${thisYear}-W${w}`, label: "Bu hafta", sub };
      if (w === thisWeek - 1) return { key: `${thisYear}-W${w}`, label: "O'tgan hafta", sub };
      return { key: `${thisYear}-W${w}`, label: `${w}-hafta`, sub };
    }),
    oy: Array.from({ length: thisMonth + 1 }, (_, i) => {
      const months_uz = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
      const m = i;
      return { key: `${thisYear}-${String(m+1).padStart(2,"0")}`, label: months_uz[m], sub: String(thisYear) };
    }),
    yil: [
      { key: `${thisYear-2}`, label: String(thisYear-2), sub: "" },
      { key: `${thisYear-1}`, label: "O'tgan yil", sub: String(thisYear-1) },
      { key: `${thisYear}`,   label: "Bu yil",     sub: String(thisYear) },
    ],
  };

  const opts = periodOptions[period];
  const [selIdx, setSelIdx] = useState(opts.length - 1);
  const selectedOpt = opts[Math.min(selIdx, opts.length - 1)];
  const scrollRef = useRef(null);

  // Period o'zgarganda oxirgi variantni tanlash
  useEffect(() => {
    const newOpts = periodOptions[period];
    setSelIdx(newOpts.length - 1);
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
      }
    }, 50);
  }, [period]);

  // ── Scope filtri: O'zimning = faqat o'z yozuvlari ─────────
  // To'liq tarix: xar/dar (bX/bD faqat joriy oy — o'tgan davrlar uchun yetmaydi)
  const allXr = (xar && xar.length ? xar : bX) || [];
  const allDr = (dar && dar.length ? dar : bD) || [];
  const srcX = useMemo(() => (scope === "mine" || !canSeeReport)
    ? allXr.filter(x => x.uid === user?.id || !x.uid) : allXr
  , [allXr, scope, canSeeReport, user]);
  const srcD = useMemo(() => (scope === "mine" || !canSeeReport)
    ? allDr.filter(d => d.uid === user?.id || !d.uid) : allDr
  , [allDr, scope, canSeeReport, user]);

  // ── Ma'lumotlarni tanlangan davrga filtrlash ─────────────
  const filteredX = useMemo(() => {
    return srcX.filter(x => {
      if (!x.sana) return false;
      if (customRange) return x.sana >= customRange.from && x.sana <= customRange.to;
      const key = selectedOpt.key;
      if (period === "oy")    return x.sana.startsWith(key);
      if (period === "yil")   return x.sana.startsWith(key.substring(0, 4));
      if (period === "hafta") {
        const d = new Date(x.sana);
        const w = getISOWeekR(d);
        const y = d.getFullYear();
        return `${y}-W${w}` === key;
      }
      return false;
    });
  }, [srcX, selectedOpt, period, customRange]);

  const filteredD = useMemo(() => {
    return srcD.filter(d => {
      if (!d.sana) return false;
      if (customRange) return d.sana >= customRange.from && d.sana <= customRange.to;
      const key = selectedOpt.key;
      if (period === "oy")    return d.sana.startsWith(key);
      if (period === "yil")   return d.sana.startsWith(key.substring(0, 4));
      if (period === "hafta") {
        const dt = new Date(d.sana);
        const w = getISOWeekR(dt);
        const y = dt.getFullYear();
        return `${y}-W${w}` === key;
      }
      return false;
    });
  }, [srcD, selectedOpt, period, customRange]);

  // Tanlangan tur (xarajat/daromad) bo'yicha joriy ma'lumot
  const curr = type === "xarajat" ? filteredX : filteredD;
  const totalX = curr.reduce((s, x) => s + Number(x.summa || 0), 0);

  // Kategoriyalar (xarajat) yoki daromad turlari
  const catData = useMemo(() => {
    if (type === "xarajat") {
      const base = KATS.map((k, i) => {
        const sum = filteredX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0);
        return { id: k.id, name: KN[lg][i], color: k.c, icon: KAT_EMOJI[k.id] || "💳", sum };
      });
      // Qarz berish xarajatlari — yorqin rang bilan (qoraytirilmaydi)
      const qzX = filteredX.filter(x => x.kategoriya === "qarz").reduce((s, x) => s + Number(x.summa || 0), 0);
      if (qzX > 0) base.push({ id: "qarz", name: lg === "uz" ? "Qarz berildi" : "Loan given", color: "#F97316", icon: "🤝", sum: qzX });
      // Maqsadga (jamg'armaga) qo'shilgan pul — alohida segment
      const mqX = filteredX.filter(x => x.kategoriya === "maqsad").reduce((s, x) => s + Number(x.summa || 0), 0);
      if (mqX > 0) base.push({ id: "maqsad", name: lg === "uz" ? "Jamg'arma (maqsad)" : "Goal savings", color: "#EAB308", icon: "🎯", sum: mqX });
      // Ro'yxatda yo'q har qanday kategoriya ham chetda qolmasin — donut DOIM 100%
      const knownX = new Set([...KATS.map(k => k.id), "qarz", "maqsad"]);
      const otherX = filteredX.filter(x => !knownX.has(x.kategoriya)).reduce((s, x) => s + Number(x.summa || 0), 0);
      if (otherX > 0) base.push({ id: "__other", name: lg === "uz" ? "Boshqa yozuvlar" : "Other records", color: "#94A3B8", icon: "📦", sum: otherX });
      return base.filter(c => c.sum > 0).sort((a, b) => b.sum - a.sum);
    }
    const base = DARS.map((d, i) => {
      const sum = filteredD.filter(x => x.tur === d.id).reduce((s, x) => s + Number(x.summa || 0), 0);
      return { id: d.id, name: DN[lg]?.[i] || d.id, color: d.c, icon: DAR_EMOJI[d.id] || "💰", sum };
    });
    // Qarz olish daromadlari — yorqin rang bilan
    const qzD = filteredD.filter(x => x.tur === "qarz").reduce((s, x) => s + Number(x.summa || 0), 0);
    if (qzD > 0) base.push({ id: "qarz", name: lg === "uz" ? "Qarz olindi" : "Loan received", color: "#14B8A6", icon: "🤝", sum: qzD });
    // Ro'yxatda yo'q har qanday daromad turi ham chetda qolmasin
    const knownD = new Set([...DARS.map(d => d.id), "qarz"]);
    const otherD = filteredD.filter(x => !knownD.has(x.tur)).reduce((s, x) => s + Number(x.summa || 0), 0);
    if (otherD > 0) base.push({ id: "__other", name: lg === "uz" ? "Boshqa yozuvlar" : "Other records", color: "#94A3B8", icon: "📦", sum: otherD });
    return base.filter(c => c.sum > 0).sort((a, b) => b.sum - a.sum);
  }, [filteredX, filteredD, type, lg]);

  // Donut uchun: 6 tadan ko'p bo'lsa, qolganlari "Boshqalar"ga jamlanadi —
  // shunda donut va yon ro'yxat DOIM 100% ga mos keladi
  const donutCats = useMemo(() => {
    if (catData.length <= 6) return catData;
    const top = catData.slice(0, 5);
    const rest = catData.slice(5).reduce((sm, c) => sm + c.sum, 0);
    return [...top, { id: "__rest", name: lg === "uz" ? "Boshqalar" : "Others", color: "#94A3B8", icon: "📦", sum: rest }];
  }, [catData, lg]);

  // Sanalar bo'yicha xarajatlar (slide 1 uchun)
  const dateData = useMemo(() => {
    const map = {};
    curr.forEach(x => {
      if (!x.sana) return;
      map[x.sana] = (map[x.sana] || 0) + Number(x.summa || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([sana, sum], i) => ({ sana, id: sana, sum, color: DATE_COLORS[i % DATE_COLORS.length] }));
  }, [curr]);

  // Line chart ma'lumotlari (slide 3 uchun)
  const lineData = useMemo(() => {
    if (period === "oy") {
      // Oyning har kuni
      const key = selectedOpt.key;
      const [y, m] = key.split("-").map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = String(i + 1).padStart(2, "0");
        const sana = `${y}-${String(m).padStart(2,"0")}-${day}`;
        const sum = curr.filter(x => x.sana === sana).reduce((s, x) => s + Number(x.summa||0), 0);
        return { label: `${m}/${i+1}`, sum, sana };
      });
    }
    if (period === "hafta") {
      // ISO hafta: Dushanbadan boshlanib, Yakshanbada tugaydi
      const key = selectedOpt.key;
      const [y, wPart] = key.split("-W");
      const monday = getMondayR(parseInt(y), parseInt(wPart));
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday.getTime() + i * 86400000);
        const sana = fmtLocalR(d);
        const sum = curr.filter(x => x.sana === sana).reduce((s, x) => s + Number(x.summa||0), 0);
        return { label: `${HAFTA_KUN[i]} ${d.getDate()}`, sum, sana };
      });
    }
    if (period === "yil") {
      const y = parseInt(selectedOpt.key.slice(0,4));
      const months_uz = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
      return Array.from({ length: 12 }, (_, i) => {
        const prefix = `${y}-${String(i+1).padStart(2,"0")}`;
        const sum = curr.filter(x => x.sana?.startsWith(prefix)).reduce((s, x) => s + Number(x.summa||0), 0);
        return { label: months_uz[i], sum };
      });
    }
    return [];
  }, [curr, period, selectedOpt]);

  const lineMax = Math.max(...lineData.map(d => d.sum), 1);
  const lineAvg = lineData.length ? Math.round(lineData.reduce((s, d) => s + d.sum, 0) / lineData.filter(d=>d.sum>0).length || 0) : 0;

  // ── 4-slayd: oila a'zolari xarajat ulushi ─────────────────
  const MEM_COLORS = ["#22C55E","#3B82F6","#A855F7","#F97316","#F5B731","#EC4899","#06B6D4"];
  const members = useMemo(() => {
    if (scope !== "family" || !canSeeReport || !(azolar || []).length) return [];
    return azolar.map((a, i) => ({
      id: a.id, ism: a.ism || "?", color: MEM_COLORS[i % MEM_COLORS.length],
      sum: curr.filter(x => x.uid === a.id || (!x.uid && a.id === user?.id))
        .reduce((s, x) => s + Number(x.summa || 0), 0),
    })).filter(m => m.sum > 0).sort((a, b) => b.sum - a.sum);
  }, [azolar, curr, scope, canSeeReport, user]);
  const memTotal = members.reduce((s, m) => s + m.sum, 0);
  const [hovMem, setHovMem] = useState(null);

  // ── Swipe ────────────────────────────────────────────────
  const maxSlide = customRange ? 1 : ((scope === "family" && canSeeReport) ? 3 : 2);
  const touchStart = useRef(null);
  const onTouchStart = e => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (dx < -40) setSlideIdx(s => Math.min(s + 1, maxSlide));
    if (dx >  40) setSlideIdx(s => Math.max(s - 1, 0));
    touchStart.current = null;
  };

  // ── Donut SVG ────────────────────────────────────────────
  const DonutEl = ({ size = 140, highlightIdx, data = catData, total = totalX }) => {
    const cx = size/2, cy = size/2, R = size*0.36, ri = size*0.24, gap = 0.025;
    if (!data.length || total === 0) return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke={th.bor} strokeWidth={R-ri} opacity={0.3}/>
        <circle cx={cx} cy={cy} r={ri-3} fill={th.bg}/>
        <text x={cx} y={cy-6} textAnchor="middle" fill={th.t3} fontSize={9} fontWeight={600}>MA'LUMOT</text>
        <text x={cx} y={cy+8} textAnchor="middle" fill={th.t3} fontSize={9} fontWeight={600}>YO'Q</text>
      </svg>
    );
    let cursor = -Math.PI/2;
    const segs = data.map((cat, i) => {
      const angle = (cat.sum / total) * 2 * Math.PI - gap;
      const sa = cursor + gap/2, ea = cursor + gap/2 + angle;
      cursor += angle + gap;
      const large = angle > Math.PI ? 1 : 0;
      const d = [
        `M ${cx+R*Math.cos(sa)} ${cy+R*Math.sin(sa)}`,
        `A ${R} ${R} 0 ${large} 1 ${cx+R*Math.cos(ea)} ${cy+R*Math.sin(ea)}`,
        `L ${cx+ri*Math.cos(ea)} ${cy+ri*Math.sin(ea)}`,
        `A ${ri} ${ri} 0 ${large} 0 ${cx+ri*Math.cos(sa)} ${cy+ri*Math.sin(sa)}`,
        "Z"
      ].join(" ");
      const midA = sa + angle/2;
      return { ...cat, d, midA, i };
    });
    return (
      <svg width={size} height={size} style={{overflow:"visible"}}>
        <circle cx={cx} cy={cy} r={(R+ri)/2} fill="none" stroke={th.bor} strokeWidth={R-ri} opacity={0.25}/>
        {segs.map((seg, i) => (
          <path key={seg.id} d={seg.d} fill={seg.color}
            opacity={highlightIdx===null||highlightIdx===undefined ? 0.9 : highlightIdx===i ? 1 : 0.3}
            style={{
              transform: highlightIdx===i ? `translate(${Math.cos(seg.midA)*5}px,${Math.sin(seg.midA)*5}px)` : "none",
              transition:"all .18s ease",
              filter: highlightIdx===i ? `drop-shadow(0 0 6px ${seg.color}88)` : "none",
            }}
          />
        ))}
        <circle cx={cx} cy={cy} r={ri-3} fill={th.bg}/>
      </svg>
    );
  };

  const fmtN = n => n >= 1000000 ? (n/1000000).toFixed(1)+" mln" : n >= 1000 ? Math.round(n/1000)+"K" : String(n);
  const [hovCat, setHovCat] = useState(null);

  return (
    <div style={{ marginBottom: 18 }}>

      {/* ── Sarlavha: tur (dropdown) + kalendar ── */}
      <div style={{ position:"relative", display:"flex", alignItems:"center", marginBottom:12 }}>
        {customRange
          ? <button onClick={() => { setCustomRange(null); setSlideIdx(0); }} style={{ width:38, height:38, borderRadius:11, background:th.surH, border:"1px solid "+th.bor, color:th.t1, cursor:"pointer", fontSize:16, fontWeight:800, flexShrink:0 }}>{"\u2190"}</button>
          : <div style={{ width:38, flexShrink:0 }}/>}
        <div style={{ flex:1, display:"flex", justifyContent:"center" }}>
          <button onClick={() => setTypeMenu(v => !v)} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:"none", cursor:"pointer", fontSize:16, fontWeight:800, color:th.t1, padding:"8px 10px" }}>
            {type==="xarajat" ? (lg==="uz"?"Xarajatlar":"Expenses") : (lg==="uz"?"Daromadlar":"Income")}
            <span style={{ fontSize:10, color:th.t2, transform: typeMenu ? "rotate(180deg)" : "none", transition:"transform .2s", display:"inline-block" }}>{"\u25BC"}</span>
          </button>
        </div>
        <button onClick={() => { setRFrom(customRange ? customRange.from : fmtLocalR(new Date(now.getFullYear(), now.getMonth(), 1))); setRTo(customRange ? customRange.to : fmtLocalR(now)); setShowRangePicker(true); }} style={{ width:38, height:38, borderRadius:11, background:th.surH, border:"1px solid "+th.bor, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3.5" width="14" height="12" rx="2.5" stroke={th.t1} strokeWidth="1.4"/><path d="M2 7.5h14M6 2v3M12 2v3" stroke={th.t1} strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>
        {typeMenu && (
          <div style={{ position:"absolute", top:44, left:"50%", transform:"translateX(-50%)", background:th.sur, border:"1px solid "+th.bor, borderRadius:14, padding:6, zIndex:60, boxShadow:"0 12px 32px rgba(0,0,0,.4)", minWidth:190 }}>
            {[["xarajat","💸 "+(lg==="uz"?"Xarajatlar":"Expenses")], ["daromad","💰 "+(lg==="uz"?"Daromadlar":"Income")]].map(([key, label]) => (
              <button key={key} onClick={() => { setType(key); setTypeMenu(false); setSlideIdx(0); setHovCat(null); setHovMem(null); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"11px 14px", background: type===key ? th.ac+"22" : "transparent", border:"none", borderRadius:10, cursor:"pointer", fontSize:14, fontWeight:700, color: type===key ? th.ac : th.t1 }}>{label}{type===key ? " \u2713" : ""}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── Scope toggle ── */}
      <div style={{ display:"flex", background:th.surH, borderRadius:12, padding:3, marginBottom:12, gap:3 }}>
        {[["mine", lg==="uz"?"O'zimning":"Mine"], ["family", lg==="uz"?"Oilamning":"Family"]].map(([key, label]) => (
          <button key={key} onClick={() => { setScope(key); setSlideIdx(0); }} style={{
            flex:1, padding:"9px 0", border:"none", borderRadius:9, cursor:"pointer",
            fontWeight:700, fontSize:13, transition:"all .2s",
            background: scope===key ? "linear-gradient(135deg,"+th.ac+","+th.ac2+")" : (th.dark ? "#374151" : "transparent"),
            color: scope===key ? "#fff" : (th.dark ? "#D1D5DB" : th.t3),
            boxShadow: scope===key ? "0 3px 10px "+th.ac+"44" : "none",
          }}>{label}</button>
        ))}
      </div>

      {/* ── Davr (Hafta/Oy/Yil) — maxsus davr tanlanganda yashirinadi ── */}
      {!customRange && (
      <div style={{ display:"flex", gap:6, marginBottom:12 }}>
        {[["hafta", lg==="uz"?"Hafta":"Week"], ["oy", lg==="uz"?"Oy":"Month"], ["yil", lg==="uz"?"Yil":"Year"]].map(([key, label]) => (
          <button key={key} onClick={() => setPeriod(key)} style={{
            flex:1, padding:"9px 0", borderRadius:10, border:"none", cursor:"pointer",
            fontWeight:700, fontSize:13, transition:"all .2s",
            background: period===key ? th.ac : (th.dark ? "#374151" : th.sur),
            color: period===key ? (th.ac==="#f5b731"||th.ac==="#f59e0b"?"#111":"#fff") : (th.dark ? "#D1D5DB" : th.t3),
            boxShadow: period===key ? "0 3px 10px "+th.ac+"33" : "none",
          }}>{label}</button>
        ))}
      </div>
      )}

      {/* ── Davr variantlari (scroll) ── */}
      {!customRange && (
      <div ref={scrollRef} style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:10, marginBottom:4, scrollbarWidth:"none" }}>
        <style>{`.scrollhide::-webkit-scrollbar{display:none}`}</style>
        {opts.map((opt, i) => (
          <button key={opt.key} onClick={() => setSelIdx(i)} style={{
            flexShrink:0, padding:"7px 14px", borderRadius:20, border:"none", cursor:"pointer",
            fontWeight: selIdx===i ? 800 : 500, fontSize:13, transition:"all .2s",
            background: selIdx===i ? "transparent" : "transparent",
            color: selIdx===i ? th.t1 : th.t2,
            borderBottom: selIdx===i ? "2px solid "+th.ac : "2px solid transparent",
            borderRadius: 0,
          }}>
            {opt.label}
            {opt.sub && <span style={{ display:"block", fontSize:10, color:th.t3, fontWeight:400 }}>{opt.sub}</span>}
          </button>
        ))}
      </div>
      )}

      {/* ── Tanlangan davr ko'rsatkichi ── */}
      {customRange && (
        <button onClick={() => { setRFrom(customRange.from); setRTo(customRange.to); setShowRangePicker(true); }} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", background:"transparent", border:"none", cursor:"pointer", padding:"2px 0 12px", fontSize:14, fontWeight:800, color:th.t1 }}>
          {fmtRangeUz(customRange.from)}<span style={{ fontSize:9, color:th.t2 }}>{"\u25BC"}</span>
          <span style={{ color:th.t2, fontWeight:400 }}>~</span>
          {fmtRangeUz(customRange.to)}<span style={{ fontSize:9, color:th.t2 }}>{"\u25BC"}</span>
        </button>
      )}

      {/* ── Slide'lar (swipeable) ── */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ background:th.sur, borderRadius:20, border:"1px solid "+th.bor, overflow:"hidden", marginBottom:12 }}
      >
        {/* Slide 0: Donut + sanalar */}
        {slideIdx === 0 && (
          <div style={{ height:SLIDE_H, padding:"0 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flexShrink:0, position:"relative", width:140, height:140 }}>
              <DonutEl size={140} highlightIdx={null} data={dateData} total={dateData.reduce((sm, d) => sm + d.sum, 0)}/>
              <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <div style={{ fontSize:11, fontWeight:900, color:th.t1, textAlign:"center", lineHeight:1.2 }}>
                  {totalX > 0 ? "+" + fmtN(totalX) : lg==="uz"?"Ma'lumot\nyoq":"No data"}
                </div>
              </div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              {dateData.length === 0
                ? <div style={{ fontSize:12, color:th.t3, lineHeight:1.6 }}>{lg==="uz"?(type==="xarajat"?"Bu davrda xarajat yo'q":"Bu davrda daromad yo'q"):"No data this period"}</div>
                : dateData.slice(0,5).map((d, i) => {
                    const col = d.color || th.ac;
                    return (
                      <div key={d.sana} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <div style={{ width:18, height:18, borderRadius:"50%", background:col+"22", border:"2px solid "+col, flexShrink:0 }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, color:th.t2 }}>
                            {(() => {
                              const dt = new Date(d.sana);
                              const months = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
                              return `${months[dt.getMonth()]} ${dt.getDate()}`;
                            })()}
                          </div>
                        </div>
                        <div style={{ fontSize:12, fontWeight:700, color:th.t1, textAlign:"right" }}>
                          {d.sum.toLocaleString("uz-UZ")}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* Slide 1: Donut + kategoriya % */}
        {slideIdx === 1 && (
          <div style={{ height:SLIDE_H, padding:"0 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flexShrink:0, position:"relative", width:140, height:140 }}>
              <DonutEl size={140} highlightIdx={hovCat} data={donutCats} total={totalX}/>
              <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                {hovCat !== null && donutCats[hovCat]
                  ? <>
                      <div style={{ fontSize:18 }}>{donutCats[hovCat].icon}</div>
                      <div style={{ fontSize:11, fontWeight:900, color:donutCats[hovCat].color }}>
                        {totalX>0?Math.round(donutCats[hovCat].sum/totalX*100):0}%
                      </div>
                    </>
                  : <div style={{ fontSize:11, fontWeight:900, color:th.t1, textAlign:"center", lineHeight:1.2 }}>
                      {totalX > 0 ? "+" + fmtN(totalX) : "—"}
                    </div>
                }
              </div>
            </div>
            <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:7 }}>
              {catData.length === 0
                ? <div style={{ fontSize:12, color:th.t3 }}>{lg==="uz"?(type==="xarajat"?"Bu davrda xarajat yo'q":"Bu davrda daromad yo'q"):"No data"}</div>
                : donutCats.map((cat, i) => (
                    <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer" }}
                      onMouseEnter={() => setHovCat(i)} onMouseLeave={() => setHovCat(null)}
                      onTouchStart={() => setHovCat(i)} onTouchEnd={() => setHovCat(null)}>
                      <div style={{ width:14, height:14, borderRadius:"50%", background:cat.color+"22", border:"2px solid "+cat.color, flexShrink:0 }}/>
                      <span style={{ flex:1, fontSize:12, color:th.t1, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cat.name}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:cat.color, flexShrink:0 }}>
                        {totalX>0?(cat.sum/totalX*100).toFixed(2):0}%
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* Slide 2: Line chart */}
        {slideIdx === 2 && !customRange && (
          <div style={{ height:SLIDE_H, padding:"14px 16px 6px", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", gap:18, marginBottom:6 }}>
              <div style={{ fontSize:12, color:th.t2 }}>{lg==="uz"?"Jami:":"Total:"} <b style={{ color:th.t1 }}>{totalX.toLocaleString("uz-UZ")}</b></div>
              <div style={{ fontSize:12, color:th.t2 }}>{lg==="uz"?"O'rtacha:":"Avg:"} <b style={{ color:th.t1 }}>{lineAvg.toLocaleString("uz-UZ")}</b></div>
            </div>
            <div style={{ flex:1, display:"flex", alignItems:"center", overflow:"hidden" }}>
              <div style={{ width:"100%" }}>
                <LineChartSVG data={lineData} lineMax={lineMax} th={th} f={f}/>
              </div>
            </div>
          </div>
        )}

        {/* Slide 3: Oila a'zolari ulushi — faqat "Oilamning" tanlanganda */}
        {slideIdx === 3 && !customRange && scope === "family" && canSeeReport && (
          <div style={{ height:SLIDE_H, padding:"0 16px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flexShrink:0, position:"relative", width:140, height:140 }}>
              <DonutEl size={140} highlightIdx={hovMem} data={members} total={memTotal}/>
              <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                {hovMem !== null && members[hovMem]
                  ? <>
                      <div style={{ fontSize:10, fontWeight:800, color:members[hovMem].color, maxWidth:60, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{members[hovMem].ism?.split(" ")[0]}</div>
                      <div style={{ fontSize:12, fontWeight:900, color:members[hovMem].color }}>{memTotal>0?(members[hovMem].sum/memTotal*100).toFixed(1):0}%</div>
                    </>
                  : <>
                      <div style={{ fontSize:10, fontWeight:700, color:th.t2 }}>{lg==="uz"?"Oila jami":"Family total"}</div>
                      <div style={{ fontSize:12, fontWeight:900, color:th.t1 }}>{memTotal>0?fmtN(memTotal):"\u2014"}</div>
                    </>
                }
              </div>
            </div>
            <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:8 }}>
              {members.length === 0
                ? <div style={{ fontSize:12, color:th.t2 }}>{lg==="uz"?"Bu davrda ma'lumot yo'q":"No data this period"}</div>
                : members.slice(0,6).map((m, i) => (
                    <div key={m.id} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}
                      onMouseEnter={() => setHovMem(i)} onMouseLeave={() => setHovMem(null)}
                      onTouchStart={() => setHovMem(i)} onTouchEnd={() => setHovMem(null)}>
                      <div style={{ width:15, height:15, borderRadius:"50%", background:m.color+"22", border:"2px solid "+m.color, flexShrink:0 }}/>
                      <span style={{ flex:1, fontSize:12, color:th.t1, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.ism}</span>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:12, fontWeight:800, color:m.color }}>{memTotal>0?(m.sum/memTotal*100).toFixed(1):0}%</div>
                        <div style={{ fontSize:9, color:th.t2 }}>{m.sum.toLocaleString("uz-UZ")}</div>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* Slide dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:8, padding:"10px 0 14px" }}>
          {Array.from({ length: maxSlide + 1 }, (_, i) => (
            <div key={i} onClick={() => setSlideIdx(i)} style={{
              width: slideIdx===i ? 20 : 7, height:7, borderRadius:4,
              background: slideIdx===i ? th.ac : th.t3+"44",
              transition:"all .3s", cursor:"pointer",
            }}/>
          ))}
        </div>
      </div>

      {/* ── Davr tanlash modali ── */}
      {showRangePicker && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.65)", zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={() => setShowRangePicker(false)}>
          <div style={{ background:th.sur, borderRadius:22, padding:"24px 20px", width:"100%", maxWidth:380, border:"1px solid "+th.bor }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:16, fontWeight:800, color:th.t1, marginBottom:18, textAlign:"center" }}>{lg==="uz"?"Davrni tanlang":"Select period"}</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 4px", borderBottom:"1px solid "+th.bor }}>
              <span style={{ fontSize:13, fontWeight:700, color:th.t1 }}>{lg==="uz"?"Boshlanish sanasi":"Start date"}</span>
              <input type="date" value={rFrom} onChange={e => setRFrom(e.target.value)} style={{ background:th.surH, border:"1px solid "+th.bor, borderRadius:9, padding:"8px 10px", color:th.t1, fontSize:13, fontWeight:600, colorScheme: th.dark ? "dark" : "light" }}/>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 4px", marginBottom:20 }}>
              <span style={{ fontSize:13, fontWeight:700, color:th.t1 }}>{lg==="uz"?"Tugash sanasi":"End date"}</span>
              <input type="date" value={rTo} onChange={e => setRTo(e.target.value)} style={{ background:th.surH, border:"1px solid "+th.bor, borderRadius:9, padding:"8px 10px", color:th.t1, fontSize:13, fontWeight:600, colorScheme: th.dark ? "dark" : "light" }}/>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowRangePicker(false)} style={{ flex:1, background:th.surH, border:"1px solid "+th.bor, borderRadius:12, padding:"12px 0", color:th.t1, cursor:"pointer", fontWeight:700, fontSize:14 }}>{lg==="uz"?"Bekor qilish":"Cancel"}</button>
              <button onClick={() => {
                if (!rFrom || !rTo) return;
                const a2 = rFrom <= rTo ? rFrom : rTo;
                const b2 = rFrom <= rTo ? rTo : rFrom;
                setCustomRange({ from: a2, to: b2 });
                setShowRangePicker(false); setSlideIdx(0); setHovCat(null); setHovMem(null);
              }} style={{ flex:1, background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")", border:"none", borderRadius:12, padding:"12px 0", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:14 }}>{lg==="uz"?"Tasdiqlash":"Confirm"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Kategoriya breakdown ro'yxati ── */}
      {catData.length > 0 && (
        <div style={{ background:th.sur, borderRadius:20, border:"1px solid "+th.bor, padding:"16px 14px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:th.t2, marginBottom:14, textTransform:"uppercase", letterSpacing:0.8 }}>
            {type==="xarajat" ? (lg==="uz"?"Kategoriyalar":"Categories") : (lg==="uz"?"Daromad turlari":"Income types")}
          </div>
          {catData.map((cat, i) => {
            const pct = totalX>0 ? cat.sum/totalX*100 : 0;
            return (
              <div key={cat.id} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:cat.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                    {cat.icon}
                  </div>
                  <span style={{ flex:1, fontSize:14, fontWeight:600, color:th.t1 }}>{cat.name}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:th.t2, marginRight:8 }}>{pct.toFixed(2)}%</span>
                  <span style={{ fontSize:14, fontWeight:800, color:th.t1 }}>{cat.sum.toLocaleString("uz-UZ")}</span>
                </div>
                <div style={{ height:5, background:th.bor, borderRadius:3, overflow:"hidden", marginLeft:46 }}>
                  <div style={{
                    height:"100%", width:pct+"%",
                    background:"linear-gradient(90deg,"+cat.color+"66,"+cat.color+")",
                    borderRadius:3, transition:"width "+(0.5+i*0.06)+"s cubic-bezier(0.34,1.56,0.64,1)",
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Line chart SVG ─────────────────────────────────────────────
function LineChartSVG({ data, lineMax, th, f }) {
  // O'q yozuvlari uchun DOIM ochiq rang (dark temada #D1D5DB)
  const AXIS = th.dark ? "#D1D5DB" : (th.t3 || "#64748b");
  const W = 320, H = 160, padL = 10, padR = 10, padT = 16, padB = 28;
  const iW = W - padL - padR;
  const iH = H - padT - padB;
  if (!data.length) return null;
  const pts = data.map((d, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * iW,
    y: padT + iH - (d.sum / lineMax) * iH,
    ...d
  }));
  const pathD = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  // show tick labels — first, middle, last, and max point
  const maxPt = pts.reduce((mx, p) => p.sum > mx.sum ? p : mx, pts[0]);
  const labelIdxs = new Set([0, Math.floor(pts.length/2), pts.length-1, pts.indexOf(maxPt)]);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
      {/* Y grid lines */}
      {[0,0.5,1].map((pct, i) => {
        const y = padT + iH * (1 - pct);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W-padR} y2={y} stroke={th.bor} strokeWidth={0.8} strokeDasharray={i>0?"4,4":""}/>
            {i > 0 && <text x={padL} y={y-3} fontSize={9} fill={AXIS} fontWeight={600}>{f(lineMax * pct, true)}</text>}
          </g>
        );
      })}
      {/* Area fill */}
      <path
        d={pathD + ` L ${pts[pts.length-1].x} ${padT+iH} L ${pts[0].x} ${padT+iH} Z`}
        fill={"url(#lineGrad)"}
        opacity={0.15}
      />
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={th.ac} stopOpacity={0.8}/>
          <stop offset="100%" stopColor={th.ac} stopOpacity={0}/>
        </linearGradient>
      </defs>
      {/* Line */}
      <path d={pathD} fill="none" stroke={th.ac} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Dots + labels */}
      {pts.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r={pt.sum > 0 ? 4 : 2.5} fill={pt.sum > 0 ? th.ac : AXIS} opacity={0.9}/>
          {labelIdxs.has(i) && (
            <text x={pt.x} y={H-4} fontSize={9} fill={AXIS} fontWeight={600} textAnchor="middle">{pt.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}
