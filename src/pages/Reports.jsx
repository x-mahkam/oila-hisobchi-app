import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { KatIco, DarIco, Av, SL, SC } from "../components/common/index.jsx";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { KATS, KN, DARS, DN, RELATIONS } from "../utils/constants.js";
import { tm } from "../utils/formatters.js";

export default function ReportsPage({
  user, azolar, qarzlar, maq,
  th, t, f, lg, scr, isPremium, isAdmin,
  bX, bD, jX, jD, bdj, canSeeReport,
  hisFil, setHisFil,
  exportLoading, exportExcel, exportPDF,
  adv, advL, aiAdv,
  adminStats, adminLoad, loadAdminStats,
}) {
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
        bX={fX} bD={fD} fjX={fjX} fjD={fjD}
        KATS={KATS} KN={KN}
      />

      {/* Oila boshi paneli */}
      {canSeeReport && azolar.length > 1 && (() => {
        const totX = bX.reduce((s, x) => s + Number(x.summa || 0), 0);
        const totD = bD.reduce((s, d) => s + Number(d.summa || 0), 0);
        const memData = azolar.map(a => {
          const ax = bX.filter(x => x.uid === a.id).reduce((s, x) => s + Number(x.summa || 0), 0);
          const ad = bD.filter(d => d.uid === a.id).reduce((s, d) => s + Number(d.summa || 0), 0);
          const rel = RELATIONS.find(r => r.id === a.rel);
          return { ...a, ax, ad, relEmoji: rel ? rel.emoji : "👤", pctX: totX > 0 ? Math.round(ax / totX * 100) : 0, pctD: totD > 0 ? Math.round(ad / totD * 100) : 0 };
        }).sort((p, q) => q.ax - p.ax);
        return (
          <div style={{ ...STY.cd, background: "linear-gradient(135deg," + th.ac + "12," + th.ac2 + "06)", border: "1.5px solid " + th.ac + "33", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>👑</span>
              <div style={{ fontSize: 14, fontWeight: 800, color: th.ac }}>{lg === "uz" ? "Oila boshi paneli" : "Head of family panel"}</div>
            </div>
            <div style={{ fontSize: 11, color: th.t2, marginBottom: 14 }}>{lg === "uz" ? "Oilaning umumiy moliyaviy ko'rinishi" : "Family financial overview"}</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, background: th.gr + "12", borderRadius: 12, padding: "11px 13px", textAlign: "center" }}><div style={{ fontSize: 9, color: th.gr, fontWeight: 700, marginBottom: 3 }}>{lg === "uz" ? "UMUMIY DAROMAD" : "TOTAL INCOME"}</div><div style={{ fontSize: 15, fontWeight: 800, color: th.gr }}>{f(totD, true)}</div></div>
              <div style={{ flex: 1, background: th.rd + "12", borderRadius: 12, padding: "11px 13px", textAlign: "center" }}><div style={{ fontSize: 9, color: th.rd, fontWeight: 700, marginBottom: 3 }}>{lg === "uz" ? "UMUMIY XARAJAT" : "TOTAL EXPENSE"}</div><div style={{ fontSize: 15, fontWeight: 800, color: th.rd }}>{f(totX, true)}</div></div>
            </div>
            <div style={{ fontSize: 11, color: th.t2, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{lg === "uz" ? "Kim qancha sarflaydi" : "Who spends how much"}</div>
            {memData.map(m => (
              <div key={m.id} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 16 }}>{m.relEmoji}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: th.t1 }}>{m.ism}{m.id === user.id && <span style={{ color: th.ac, fontSize: 10 }}> ({t.me})</span>}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: th.rd }}>-{f(m.ax, true)}</span>
                  <span style={{ fontSize: 10, color: th.t2, minWidth: 32, textAlign: "right" }}>{m.pctX}%</span>
                </div>
                <div style={{ height: 7, background: th.bg, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: m.pctX + "%", background: "linear-gradient(90deg," + th.rd + "," + th.am + ")", borderRadius: 4, transition: "width .5s" }} /></div>
                {m.ad > 0 && <div style={{ fontSize: 10, color: th.gr, marginTop: 3 }}>{lg === "uz" ? "Daromad hissasi" : "Income share"}: +{f(m.ad, true)} ({m.pctD}%)</div>}
              </div>
            ))}
            <div style={{ marginTop: 8, padding: "11px 13px", background: th.bg, borderRadius: 11, fontSize: 11, color: th.t2, lineHeight: 1.5 }}>
              {(() => { const top = memData[0]; if (top && top.ax > 0) return lg === "uz" ? "💡 Eng ko'p xarajat: " + top.ism + " (" + top.pctX + "%)." : "Top spender: " + top.ism + " (" + top.pctX + "%)"; return lg === "uz" ? "Hali xarajatlar kam." : "Few expenses yet."; })()}
            </div>
          </div>
        );
      })()}

      {/* Moliyaviy sog'liq skor */}
      {(() => {
        let score = 50;
        const checks = [];
        if (jD >= jX) { score += 20; checks.push({ ok: true, t: lg === "uz" ? "Daromad xarajatdan ko'p" : "Income exceeds expenses" }); }
        else { score -= 15; checks.push({ ok: false, t: lg === "uz" ? "Xarajat daromaddan ko'p" : "Expenses exceed income" }); }
        if (jX <= bdj) { score += 15; checks.push({ ok: true, t: lg === "uz" ? "Budjetdan chiqmagansiz" : "Within budget" }); }
        else { score -= 15; checks.push({ ok: false, t: lg === "uz" ? "Budjetdan oshib ketdingiz" : "Over budget" }); }
        const savePct = jD > 0 ? (jD - jX) / jD * 100 : 0;
        if (savePct >= 20) { score += 15; checks.push({ ok: true, t: lg === "uz" ? "Yaxshi jamg'arma (20%+)" : "Good savings (20%+)" }); }
        else if (savePct > 0) { score += 5; checks.push({ ok: true, t: lg === "uz" ? "Ozgina jamg'arma bor" : "Some savings" }); }
        else { checks.push({ ok: false, t: lg === "uz" ? "Jamg'arma yo'q" : "No savings" }); }
        const topKat = KATS.map((k, i) => ({ nom: KN[lg][i], sum: bX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).sort((a, b) => b.sum - a.sum)[0];
        if (topKat && jX > 0 && topKat.sum / jX > 0.5) { score -= 5; checks.push({ ok: false, t: topKat.nom + " " + (lg === "uz" ? "xarajati yuqori" : "spending high") }); }
        if (maq.length > 0) { score += 5; checks.push({ ok: true, t: lg === "uz" ? "Moliyaviy maqsadingiz bor" : "You have goals" }); }
        const activeDebt = qarzlar.filter(q => !q.paid && q.tur === "olgan").reduce((s, q) => s + q.summa, 0);
        if (activeDebt > 0 && jD > 0 && activeDebt > jD) { score -= 10; checks.push({ ok: false, t: lg === "uz" ? "Qarzingiz daromaddan ko'p" : "Debt exceeds income" }); }
        score = Math.max(0, Math.min(100, Math.round(score)));
        const sColor = score >= 75 ? th.gr : score >= 50 ? th.am : th.rd;
        const sLabel = score >= 75 ? (lg === "uz" ? "Zo'r!" : "Excellent!") : score >= 50 ? (lg === "uz" ? "Yaxshi" : "Good") : (lg === "uz" ? "Yaxshilash kerak" : "Needs work");
        if (jX === 0 && jD === 0) return null;
        return (
          <div style={{ ...STY.cd, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke={th.bor} strokeWidth="8" /><circle cx="40" cy="40" r="34" fill="none" stroke={sColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 * (1 - score / 100)} transform="rotate(-90 40 40)" /></svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 22, fontWeight: 800, color: sColor }}>{score}</span><span style={{ fontSize: 9, color: th.t2 }}>/100</span></div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: th.t2, fontWeight: 600, marginBottom: 2 }}>{lg === "uz" ? "Moliyaviy sog'liq" : "Financial health"}</div>
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
      })()}

      {canSeeReport && azolar.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          {[{ id: "all", ism: t.all }, ...azolar].map(a => (
            <button key={a.id} onClick={() => setHisFil(a.id)} style={STY.ch(hisFil === a.id, th.ac)}>{a.ism}</button>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 14 }}>
        <SC label={t.inc} value={f(fjD, true)} color={th.gr} th={th} />
        <SC label={t.exp} value={f(fjX, true)} color={th.rd} th={th} />
        <SC label={t.bud} value={f(bdj, true)} color={th.ac} th={th} />
        <SC label={t.bal} value={(fb < 0 ? "-" : "") + f(Math.abs(fb), true)} color={fb >= 0 ? th.gr : th.rd} th={th} />
      </div>

      {fjX > 0 && (
        <div>
          <SL ch={t.ed} th={th} />
          {KATS.map((k, i) => {
            const tx = fX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0);
            if (!tx) return null;
            return (
              <div key={k.id} style={{ ...STY.cd, padding: "9px 12px", display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: k.c + "18", display: "flex", alignItems: "center", justifyContent: "center" }}><KatIco id={k.id} c={k.c} s={17} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...STY.row, marginBottom: 3 }}><span style={{ fontSize: 12, fontWeight: 600, color: th.t1 }}>{KN[lg][i]}</span><span style={{ fontSize: 12, fontWeight: 700, color: k.c }}>{f(tx, true)}</span></div>
                  <div style={{ background: th.bg, borderRadius: 4, height: 6 }}><div style={{ width: fjX > 0 ? Math.min(100, (tx / fjX) * 100) + "%" : "0%", height: "100%", background: k.c, borderRadius: 4 }} /></div>
                  <div style={{ fontSize: 9, color: th.t2, marginTop: 2 }}>{fjX > 0 ? Math.round((tx / fjX) * 100) : 0}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {fjD > 0 && (
        <div>
          <SL ch={t.isr} th={th} />
          {DARS.map((d, i) => {
            const tx = fD.filter(x => x.tur === d.id).reduce((s, x) => s + Number(x.summa || 0), 0);
            if (!tx) return null;
            return (
              <div key={d.id} style={{ ...STY.cd, padding: "9px 12px", ...STY.row, marginBottom: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: d.c + "18", display: "flex", alignItems: "center", justifyContent: "center" }}><DarIco id={d.id} c={d.c} s={17} /></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: th.t1 }}>{DN[lg][i]}</span>
                </div>
                <span style={{ fontWeight: 700, color: th.gr, fontSize: 13 }}>+{f(tx, true)}</span>
              </div>
            );
          })}
        </div>
      )}

      {hisFil === "all" && canSeeReport && azolar.length > 1 && (
        <div>
          <SL ch={t.bm} th={th} />
          {azolar.map(a => {
            const ax = bX.filter(x => x.uid === a.id).reduce((s, x) => s + Number(x.summa || 0), 0);
            const ad = bD.filter(d => d.uid === a.id).reduce((s, d) => s + Number(d.summa || 0), 0);
            return (
              <div key={a.id} style={{ ...STY.cd, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ ...STY.row, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Av src={a.photo} name={a.ism} size={32} ac={th.ac} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: th.t1 }}>{a.ism}{a.id === user.id && <span style={{ color: th.ac, fontSize: 10 }}> ({t.me})</span>}</span>
                  </div>
                  <span style={{ fontSize: 10, color: th.t2 }}>{a.rol === "bosh" ? t.hd : t.mb2}</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 12, color: th.gr, fontWeight: 600 }}>+{f(ad, true)}</span>
                  <span style={{ fontSize: 12, color: th.rd, fontWeight: 600 }}>-{f(ax, true)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ad - ax >= 0 ? th.gr : th.rd }}>{ad - ax < 0 ? "-" : ""}{f(Math.abs(ad - ax), true)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
        <button onClick={exportExcel} disabled={exportLoading} style={{ ...STY.bt("#10b981", "#059669"), marginBottom: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: exportLoading ? .6 : 1, position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white" opacity=".2" /><path d="M5 6l2.5 3L5 12M9 12h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {exportLoading ? "..." : "Excel"}{!isPremium && <span style={{ position: "absolute", top: -6, right: -6, fontSize: 8, background: "#f59e0b", color: "#fff", borderRadius: 8, padding: "1px 5px", fontWeight: 800 }}>PRO</span>}
        </button>
        <button onClick={exportPDF} style={{ ...STY.bt("#ef4444", "#dc2626"), marginBottom: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white" opacity=".2" /><path d="M5 4h5l3 3v7H5V4z" stroke="white" strokeWidth="1.3" strokeLinejoin="round" /><line x1="7" y1="10" x2="11" y2="10" stroke="white" strokeWidth="1.2" strokeLinecap="round" /></svg>
          PDF{!isPremium && <span style={{ position: "absolute", top: -6, right: -6, fontSize: 8, background: "#f59e0b", color: "#fff", borderRadius: 8, padding: "1px 5px", fontWeight: 800 }}>PRO</span>}
        </button>
      </div>
      <button onClick={aiAdv} style={{ ...STY.bt(), marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{Ico.brain(th.ac)}{t.aa}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ReportVisualBlock — hisobot vizual qismi (donut + progress)
// ─────────────────────────────────────────────────────────────
function ReportVisualBlock({ th, lg, f, bX, bD, fjX, fjD, KATS, KN }) {
  const KAT_EMOJI = { oziq:"🛒", transport:"🚗", kiyim:"👕", sog:"💊", kommunal:"🏠", konil:"🎬", talim:"📚", hadya:"🎁", boshqa:"💸" };
  const [chartTab, setChartTab] = useState("xarajat"); // xarajat | daromad
  const [activeIdx, setActiveIdx] = useState(null);
  const [barsReady, setBarsReady] = useState(false);

  useEffect(() => {
    setBarsReady(false);
    const t = setTimeout(() => setBarsReady(true), 80);
    return () => clearTimeout(t);
  }, [chartTab]);

  // Xarajat kategoriyalari
  const catData = KATS.map((k, i) => {
    const sum = bX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0);
    return { id: k.id, name: KN[lg][i], color: k.c, icon: KAT_EMOJI[k.id] || "💰", sum };
  }).filter(c => c.sum > 0).sort((a, b) => b.sum - a.sum);

  const total = chartTab === "xarajat" ? fjX : fjD;
  const displayData = catData.slice(0, 6);
  const savingsRate = fjD > 0 ? Math.max(0, Math.round((fjD - fjX) / fjD * 100)) : 0;

  if (total === 0 && fjX === 0 && fjD === 0) return null;

  return (
    <div style={{ marginBottom: 18 }}>

      {/* Tab: xarajat / daromad */}
      <div style={{ display: "flex", background: th.surH, borderRadius: 12, padding: 3, marginBottom: 14, gap: 3 }}>
        {[["xarajat", lg === "uz" ? "Xarajat" : "Expenses"], ["daromad", lg === "uz" ? "Daromad" : "Income"]].map(([key, label]) => (
          <button key={key} onClick={() => setChartTab(key)} style={{
            flex: 1, padding: "9px 0", border: "none", borderRadius: 9, cursor: "pointer",
            fontWeight: 700, fontSize: 13, transition: "all .2s",
            background: chartTab === key
              ? key === "xarajat"
                ? "linear-gradient(135deg," + th.rd + "cc," + th.rd + "88)"
                : "linear-gradient(135deg," + th.gr + "cc," + th.gr + "88)"
              : "transparent",
            color: chartTab === key ? "#fff" : th.t2,
            boxShadow: chartTab === key ? "0 3px 10px " + (key === "xarajat" ? th.rd : th.gr) + "44" : "none",
          }}>{label}</button>
        ))}
      </div>

      {/* Donut chart + markaziy raqam */}
      <div style={{ background: th.sur, borderRadius: 20, border: "1px solid " + th.bor, padding: "20px 16px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          {/* SVG Donut */}
          <div style={{ flexShrink: 0, position: "relative", width: 130, height: 130 }}>
            <DonutSVG
              data={displayData}
              total={total}
              activeIdx={activeIdx}
              setActiveIdx={setActiveIdx}
              th={th}
              isExpense={chartTab === "xarajat"}
            />
            {/* Center */}
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              {activeIdx !== null && displayData[activeIdx] ? (
                <>
                  <div style={{ fontSize: 16 }}>{displayData[activeIdx].icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: displayData[activeIdx].color, marginTop: 2 }}>
                    {total > 0 ? Math.round(displayData[activeIdx].sum / total * 100) : 0}%
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 9, color: th.t3, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>
                    {chartTab === "xarajat" ? (lg === "uz" ? "xarajat" : "spent") : (lg === "uz" ? "daromad" : "income")}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: chartTab === "xarajat" ? th.rd : th.gr, letterSpacing: -0.5, lineHeight: 1.1 }}>
                    {f(total, true)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {displayData.slice(0, 5).map((cat, i) => (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                onTouchStart={() => setActiveIdx(i)}
                onTouchEnd={() => setActiveIdx(null)}
                style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", opacity: activeIdx === null || activeIdx === i ? 1 : 0.45, transition: "opacity .2s" }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }}/>
                <span style={{ fontSize: 11, color: th.t1, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: cat.color, flexShrink: 0 }}>
                  {total > 0 ? Math.round(cat.sum / total * 100) : 0}%
                </span>
              </div>
            ))}
            {/* Tejamkorlik ko'rsatkichi */}
            {fjD > 0 && (
              <div style={{ marginTop: 4, paddingTop: 6, borderTop: "1px solid " + th.bor, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: th.ac, flexShrink: 0 }}/>
                <span style={{ fontSize: 10, color: th.t2, flex: 1 }}>{lg === "uz" ? "Tejamkorlik" : "Savings"}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: savingsRate > 20 ? th.gr : savingsRate > 0 ? th.am : th.rd }}>
                  {savingsRate}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Daromad / Xarajat balans bar */}
        {fjD > 0 && fjX > 0 && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid " + th.bor }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 10, color: th.gr, fontWeight: 700 }}>↑ {f(fjD, true)}</span>
              <span style={{ fontSize: 10, color: th.t3 }}>{lg === "uz" ? "balans" : "balance"}</span>
              <span style={{ fontSize: 10, color: th.rd, fontWeight: 700 }}>↓ {f(fjX, true)}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: th.bor, overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: fjD > 0 ? Math.min(100, fjX / fjD * 100) + "%" : "0%",
                background: "linear-gradient(90deg," + th.rd + "88," + th.rd + ")",
                borderRadius: 4, transition: "width .8s cubic-bezier(0.34,1.56,0.64,1)",
              }}/>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: fjD > 0 ? Math.min(100, (fjD - fjX) / fjD * 100) + "%" : "0%",
                background: "linear-gradient(90deg," + th.gr + "88," + th.gr + ")",
                borderRadius: 4, marginLeft: fjD > 0 ? Math.min(100, fjX / fjD * 100) + "%" : "0%",
                transition: "all .8s cubic-bezier(0.34,1.56,0.64,1)",
              }}/>
            </div>
          </div>
        )}
      </div>

      {/* Kategoriya progress barlari */}
      {displayData.length > 0 && chartTab === "xarajat" && (
        <div style={{ background: th.sur, borderRadius: 20, border: "1px solid " + th.bor, padding: "16px 14px", marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: th.t2, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.8 }}>
            {lg === "uz" ? "Kategoriya taqsimoti" : "Category breakdown"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {displayData.map((cat, i) => {
              const pct = total > 0 ? cat.sum / total * 100 : 0;
              return (
                <div key={cat.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: cat.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{cat.icon}</div>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: th.t1 }}>{cat.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: th.t1 }}>{f(cat.sum, true)}</span>
                    <span style={{ fontSize: 11, color: cat.color, fontWeight: 700, minWidth: 36, textAlign: "right" }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 5, background: th.bor, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: barsReady ? pct + "%" : "0%",
                      background: "linear-gradient(90deg," + cat.color + "66," + cat.color + ")",
                      borderRadius: 3,
                      transition: "width " + (0.5 + i * 0.06) + "s cubic-bezier(0.34,1.56,0.64,1)",
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Donut SVG component ────────────────────────────────────────
function DonutSVG({ data, total, activeIdx, setActiveIdx, th, isExpense }) {
  const size = 130;
  const cx = size / 2;
  const cy = size / 2;
  const R = 52;
  const ri = 34;
  const gap = 0.025;

  if (!data.length || total === 0) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={(R + ri) / 2} fill="none" stroke={th.bor} strokeWidth={R - ri}/>
      </svg>
    );
  }

  let cursor = -Math.PI / 2;
  const segments = data.map((cat, i) => {
    const angle = (cat.sum / total) * (2 * Math.PI) - gap;
    const sa = cursor + gap / 2;
    const ea = cursor + gap / 2 + angle;
    cursor += angle + gap;
    const large = angle > Math.PI ? 1 : 0;
    const d = [
      `M ${cx + R * Math.cos(sa)} ${cy + R * Math.sin(sa)}`,
      `A ${R} ${R} 0 ${large} 1 ${cx + R * Math.cos(ea)} ${cy + R * Math.sin(ea)}`,
      `L ${cx + ri * Math.cos(ea)} ${cy + ri * Math.sin(ea)}`,
      `A ${ri} ${ri} 0 ${large} 0 ${cx + ri * Math.cos(sa)} ${cy + ri * Math.sin(sa)}`,
      "Z",
    ].join(" ");
    const midA = sa + angle / 2;
    return { ...cat, d, midA };
  });

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <circle cx={cx} cy={cy} r={(R + ri) / 2} fill="none" stroke={th.bor} strokeWidth={R - ri} opacity={0.3}/>
      {segments.map((seg, i) => (
        <path
          key={seg.id}
          d={seg.d}
          fill={seg.color}
          opacity={activeIdx === null ? 0.9 : activeIdx === i ? 1 : 0.25}
          style={{
            cursor: "pointer",
            transform: activeIdx === i ? `translate(${Math.cos(seg.midA) * 5}px, ${Math.sin(seg.midA) * 5}px)` : "none",
            transition: "all 0.18s ease",
            filter: activeIdx === i ? `drop-shadow(0 0 6px ${seg.color}88)` : "none",
          }}
          onMouseEnter={() => setActiveIdx(i)}
          onMouseLeave={() => setActiveIdx(null)}
          onTouchStart={(e) => { e.preventDefault(); setActiveIdx(i); }}
          onTouchEnd={() => setActiveIdx(null)}
        />
      ))}
      <circle cx={cx} cy={cy} r={ri - 3} fill={th.sur}/>
    </svg>
  );
}
