import { useMemo, useState } from "react";
import { KatIco, DarIco, MoneyInput, Av, Spark, Heat, SL, TxRow } from "../components/common/index.jsx";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { KATS, KN, DARS, DN, QUICK_ADD } from "../utils/constants.js";
import { tm } from "../utils/formatters.js";
import { db } from "../firebase.js";

export default function DashboardPage({
  user, oila, azolar, xar, dar, maq, qarzlar, vazifalar,
  kidBalances, notifs, qarzReqs, xReqs, rates, stars,
  setXar, setDar, setMaq, setKidBalances,
  dark, lg, val, scr, setScr, isPremium, isKid, isBosh, hasKids, isAdmin,
  th, t, f, ok$, buzz, addStar, fireConfetti,
  gN, gP, bX, bD, jX, jD, myX, myD, myBal, bal, bdj, pct, bRng,
  srch, srchR, showS,
  delX, acceptXReq, rejectXReq,
  vazifaDone, vazifaApprove,
  fetchRates, rateL,
  setShowGift, setShowBilim, setShowAddVazifa,
}) {
  const STY = useMemo(() => makeS(th), [th]);
  const [quickItem, setQuickItem] = useState(null);
  const [quickSum, setQuickSum] = useState("");

  const quickAdd = async () => {
    if (!quickItem || !quickSum || Number(quickSum) <= 0) return ok$(t.ea, "err");
    const { td, nt } = await import("../utils/formatters.js");
    const item = { id: Date.now(), kategoriya: quickItem.kat, summa: Number(quickSum), izoh: quickItem[lg] || quickItem.uz, sana: td(), vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    const na = [{ ...item, uid: user.id }, ...xar];
    setXar(na);
    const bt = na.filter(x => x.sana && x.sana.indexOf(tm()) === 0).reduce((s, x) => s + Number(x.summa || 0), 0);
    if (bt > bdj) { ok$(t.be, "err"); }
    else if (bt > bdj * .9) { ok$(t.bw, "warn"); }
    else { ok$(t.xa); addStar(1, lg === "uz" ? "Xarajat kiritildi" : "Expense added"); }
    setQuickItem(null); setQuickSum("");
  };

  // ── Qidiruv natijalari ──────────────────────────────────
  if (showS) {
    return (
      <div>
        <SL ch={t.res + " (" + srchR.length + ")"} th={th} />
        {srch?.trim() && srchR.length === 0 && (
          <div style={{ ...STY.cd, textAlign: "center", color: th.t2, padding: 28 }}>{t.nf2}</div>
        )}
        {srchR.map(item => (
          <TxRow key={(item.kategoriya ? "x" : "d") + item.id} item={item} th={th} STY={STY} KATS={KATS} KN={KN} DARS={DARS} DN={DN} lg={lg} gN={gN} gP={gP} f={f} user={user} onDelete={delX} Ico={Ico} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* So'rovlar */}
      {xReqs.length > 0 && (
        <div style={{ ...STY.cd, border: "1.5px solid " + th.am + "55", marginBottom: 14, background: th.am + "0a" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.am, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>📥</span>{lg === "uz" ? "So'rovlar" : "Requests"} ({xReqs.length})
          </div>
          {xReqs.map(req => {
            const isInc = req.kind === "income";
            return (
              <div key={req.id} style={{ background: th.sur, borderRadius: 13, padding: "12px 14px", marginBottom: 10, border: "1px solid " + (isInc ? th.gr + "44" : th.bor) }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: th.t1, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{isInc ? "💰" : "📤"}</span><b>{req.fromIsm}</b> {isInc ? (lg === "uz" ? "sizga pul berdi" : "gave you money") : (lg === "uz" ? "sizning nomingizdan" : "for you")}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: isInc ? th.gr : th.rd }}>{isInc ? "+" : "-"}{f(req.summa, true)}</div>
                </div>
                <div style={{ background: th.bg, borderRadius: 9, padding: "7px 11px", marginBottom: 10, fontSize: 12, color: th.t2 }}>
                  {isInc ? (DN[lg][DARS.findIndex(d => d.id === (req.tur || "sovga"))] || req.izoh) : KN[lg][KATS.findIndex(k => k.id === req.kategoriya)]} · {req.izoh} · {req.sana}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => acceptXReq(req)} style={{ flex: 1, background: th.gr, border: "none", borderRadius: 10, padding: "9px 0", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{isInc ? (lg === "uz" ? "Daromadga qo'shish" : "Add to income") : (lg === "uz" ? "Tasdiqlash" : "Accept")}</button>
                  <button onClick={() => rejectXReq(req)} style={{ flex: 1, background: "transparent", border: "1.5px solid " + th.rd + "55", borderRadius: 10, padding: "9px 0", color: th.rd, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{lg === "uz" ? "Rad etish" : "Reject"}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== BOLA BOSH SAHIFASI ===== */}
      {isKid && (
        <div>
          <div className="anim-fadeUp" style={{ background: "linear-gradient(135deg,#f59e0b 0%,#ec4899 55%,#8b5cf6 100%)", borderRadius: 24, padding: "24px 22px", marginBottom: 16, position: "relative", overflow: "hidden", boxShadow: "0 12px 40px #ec489940" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
            <div style={{ position: "absolute", bottom: -40, left: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", marginBottom: 2 }}>
                {(() => { const h = new Date().getHours(); return h < 12 ? (lg === "uz" ? "Xayrli tong" : "Good morning") : h < 18 ? (lg === "uz" ? "Xayrli kun" : "Good afternoon") : (lg === "uz" ? "Xayrli kech" : "Good evening"); })()}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 16 }}>{user?.ism} 👋</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{lg === "uz" ? "Mening cho'ntak pulim" : "My pocket money"}</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: "#fff" }}>{f(kidBalances[user.id] || 0, true)}</div>
            </div>
          </div>

          <button onClick={() => { buzz(10); setShowGift(true); }} style={{ width: "100%", background: "linear-gradient(135deg,#10b98115,#05966908)", border: "1.5px solid #10b98144", borderRadius: 16, padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎁</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Sovg'a puli kiritish" : "Add gift money"}</div>
              <div style={{ fontSize: 11, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Buvi, bobo yoki qarindosh bergan pul" : "Money from relatives"}</div>
            </div>
            <span style={{ fontSize: 18, color: th.gr }}>+</span>
          </button>

          <button onClick={() => { buzz(10); setShowBilim(true); }} style={{ width: "100%", background: "linear-gradient(135deg,#1e40af15,#3b82f608)", border: "1.5px solid #3b82f644", borderRadius: 16, padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#1e40af,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📚</div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Bilim Bozori" : "Knowledge Market"}</div>
              <div style={{ fontSize: 11, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Ingliz so'z o'rgan, Bilim Coin yig'" : "Learn words, earn coins"}</div>
            </div>
            <span style={{ fontSize: 18, color: "#3b82f6" }}>›</span>
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 18 }}>
            {(() => {
              const myV = vazifalar.filter(v => v.assignedTo === user.id);
              const done = myV.filter(v => v.status === "approved").length;
              const pend = myV.filter(v => v.status === "pending" || v.status === "done").length;
              const ball = done * 10;
              return [
                { ic: "🏆", l: lg === "uz" ? "Bajarildi" : "Done", v: done, c: "#10b981" },
                { ic: "⏳", l: lg === "uz" ? "Vazifa" : "To do", v: pend, c: "#f59e0b" },
                { ic: "⭐", l: lg === "uz" ? "Ball" : "Points", v: ball, c: "#8b5cf6" },
              ].map((s, i) => (
                <div key={i} className="anim-fadeUp" style={{ background: "linear-gradient(135deg," + s.c + "0d," + th.sur + ")", borderRadius: 15, padding: "14px 8px", textAlign: "center", border: "1px solid " + s.c + "22", animationDelay: (i * 0.08) + "s" }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{s.ic}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: th.t2, fontWeight: 600 }}>{s.l}</div>
                </div>
              ));
            })()}
          </div>

          <SL ch={lg === "uz" ? "Bajarish kerak" : "To do"} th={th} />
          {(() => {
            const active = vazifalar.filter(v => v.assignedTo === user.id && (v.status === "pending" || v.status === "done"));
            if (active.length === 0) {
              return (
                <div style={{ textAlign: "center", padding: "30px 20px", color: th.t2 }}>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>🎉</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Barakalla! Hamma vazifa bajarilgan" : "All done!"}</div>
                </div>
              );
            }
            return active.slice(0, 4).map(v => (
              <div key={v.id} className="anim-fadeUp" style={{ background: th.sur, borderRadius: 16, padding: "14px", marginBottom: 10, border: "1px solid " + th.bor, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: th.ac + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{v.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{v.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: th.gr }}>+{f(v.reward, true)}</div>
                </div>
                {v.status === "pending"
                  ? <button onClick={() => vazifaDone(v.id)} style={{ background: th.ac, border: "none", borderRadius: 11, padding: "10px 16px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>✓ {lg === "uz" ? "Bajardim" : "Done"}</button>
                  : <span style={{ fontSize: 11, color: th.am, fontWeight: 600 }}>⏳</span>}
              </div>
            ));
          })()}
        </div>
      )}

      {/* ===== KATTALAR BOSH SAHIFASI ===== */}
      {!isKid && (
        <div>
          <div className="anim-fadeUp" style={{ background: "linear-gradient(135deg," + th.ac + " 0%," + th.ac2 + " 60%,#a78bfa 100%)", borderRadius: 24, padding: "20px 22px", marginBottom: 16, position: "relative", overflow: "hidden", boxShadow: "0 12px 40px " + th.ac + "40" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, left: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>
                {(() => { const h = new Date().getHours(); return h < 6 ? (lg === "uz" ? "Xayrli tun" : "Good night") : h < 12 ? (lg === "uz" ? "Xayrli tong" : "Good morning") : h < 18 ? (lg === "uz" ? "Xayrli kun" : "Good afternoon") : (lg === "uz" ? "Xayrli kech" : "Good evening"); })()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 14 }}>{user?.ism || ""} 👋</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>{lg === "uz" ? "Mening balansim (bu oy)" : "My balance"}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 14, letterSpacing: "-0.5px" }}>{myBal < 0 ? "-" : ""}{f(Math.abs(myBal), true)}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.13)", borderRadius: 13, padding: "10px 13px" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#86efac" }} />{t.inc}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>+{f(myD, true)}</div>
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.13)", borderRadius: 13, padding: "10px 13px" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#fca5a5" }} />{t.exp}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>-{f(myX, true)}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: th.t2, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>⚡ {lg === "uz" ? "Tez qo'shish" : "Quick add"}</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {QUICK_ADD.map((q, i) => (
                <button key={i} onClick={() => { buzz(10); setQuickItem(q); setQuickSum(""); }} style={{ flexShrink: 0, background: th.sur, border: "1px solid " + th.bor, borderRadius: 14, padding: "10px 14px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 68 }}>
                  <span style={{ fontSize: 24 }}>{q.emoji}</span>
                  <span style={{ fontSize: 10, color: th.t2, fontWeight: 600 }}>{q[lg] || q.uz}</span>
                </button>
              ))}
            </div>
          </div>

          {quickItem && (
            <div style={{ ...STY.cd, marginBottom: 14, border: "1.5px solid " + th.ac + "55" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{quickItem.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{quickItem[lg] || quickItem.uz}</span>
              </div>
              <MoneyInput style={{ ...STY.ip, fontSize: 20, fontWeight: 800, textAlign: "center" }} value={quickSum} onChange={setQuickSum} placeholder="0" th={th} autoFocus />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setQuickItem(null)} style={{ flex: 1, background: "transparent", border: "1.5px solid " + th.bor, borderRadius: 12, padding: "11px", color: th.t2, cursor: "pointer", fontWeight: 700 }}>{lg === "uz" ? "Bekor" : "Cancel"}</button>
                <button onClick={quickAdd} style={{ flex: 2, background: th.ac, border: "none", borderRadius: 12, padding: "11px", color: "#fff", cursor: "pointer", fontWeight: 700 }}>{lg === "uz" ? "Saqlash" : "Save"}</button>
              </div>
            </div>
          )}

          <div style={{ ...STY.cd, marginBottom: 14 }}>
            <div style={{ ...STY.row, marginBottom: 8 }}><span style={{ color: th.t2, fontSize: 12 }}>{t.bud}</span><span style={{ fontWeight: 700, fontSize: 12, color: th.t1 }}>{f(bdj, true)}</span></div>
            <div style={{ background: th.bg, borderRadius: 10, height: 12, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg," + bRng + "88," + bRng + ")", borderRadius: 10, transition: "width .6s" }} /></div>
            <div style={{ ...STY.row, marginTop: 7 }}><span style={{ color: bRng, fontSize: 11, fontWeight: 700 }}>{pct}% {t.sp}</span><span style={{ color: bdj - jX >= 0 ? th.gr : th.rd, fontSize: 11 }}>{f(Math.abs(bdj - jX), true)} {bdj - jX >= 0 ? t.lf : t.ex}</span></div>
          </div>

          <div style={{ ...STY.cd, marginBottom: 14 }}>
            <div style={{ ...STY.row, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: th.t1, display: "flex", alignItems: "center", gap: 6 }}>{Ico.bank(th.ac)}{t.rates}</div>
                <div style={{ fontSize: 10, color: th.t2, marginTop: 2 }}>
                  {t.rSub}
                  {(() => { try { const rt = localStorage.getItem("oilaV7RatesT"); if (rt) { const d = new Date(rt); const today = new Date().toDateString() === d.toDateString(); return " · " + (today ? (lg === "uz" ? "bugun" : "today") : d.toLocaleDateString("uz-UZ")) + " " + d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }); } } catch (e) {} return ""; })()}
                </div>
              </div>
              <button onClick={fetchRates} style={{ background: "none", border: "1px solid " + th.bor, borderRadius: 9, padding: "4px 10px", cursor: "pointer", fontSize: 11, color: th.t2, display: "flex", alignItems: "center", gap: 4 }}>{Ico.repeat(th.t2)}{lg === "uz" ? "Yangilash" : "Refresh"}</button>
            </div>
            {rateL && <div style={{ textAlign: "center", padding: "12px 0", color: th.t2, fontSize: 13 }}>{t.ldd}</div>}
            {!rateL && rates.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {rates.map(r => {
                  const flags = { USD: "🇺🇸", EUR: "🇪🇺", RUB: "🇷🇺", GBP: "🇬🇧", CNY: "🇨🇳", KZT: "🇰🇿" };
                  return (
                    <div key={r.code} style={{ background: th.surH, borderRadius: 12, padding: "10px 12px", border: "1px solid " + th.bor, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{flags[r.code] || "💱"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: th.t1 }}>{r.code}</div>
                        <div style={{ fontSize: 9, color: th.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: th.ac }}>{Number(r.rate).toLocaleString("uz-UZ", { maximumFractionDigits: 0 })}</div>
                        <div style={{ fontSize: 9, color: th.t2 }}>so'm</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {bX.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <SL ch={t.exp + " (" + tm() + ")"} th={th} />
              {KATS.map((k, i) => {
                const tx = bX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0);
                if (!tx) return null;
                const lim = oila?.katLimits?.[k.id];
                const ov = lim && tx > lim;
                const sp = Array.from({ length: 7 }, (_, si) => { const d = new Date(); d.setDate(d.getDate() - 6 + si); return xar.filter(x => x.kategoriya === k.id && x.sana === d.toISOString().slice(0, 10)).reduce((s, x) => s + Number(x.summa || 0), 0); });
                return (
                  <div key={k.id} style={{ ...STY.cd, padding: "10px 13px", display: "flex", alignItems: "center", gap: 10, marginBottom: 7, borderColor: ov ? th.rd + "44" : th.bor }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: k.c + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><KatIco id={k.id} c={k.c} s={20} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...STY.row, marginBottom: 3 }}><span style={{ fontSize: 12, fontWeight: 600, color: th.t1 }}>{KN[lg][i]}</span><span style={{ fontWeight: 700, color: ov ? th.rd : k.c, fontSize: 12 }}>{f(tx, true)}</span></div>
                      <div style={{ background: th.bg, borderRadius: 4, height: 5 }}><div style={{ width: Math.min(100, (tx / jX) * 100) + "%", height: "100%", background: k.c, borderRadius: 4 }} /></div>
                      {lim && <div style={{ fontSize: 9, color: ov ? th.rd : th.t2, marginTop: 2 }}>Limit: {f(lim, true)}{ov ? " ⚠" : ""}</div>}
                    </div>
                    <Spark data={sp} color={k.c} />
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ ...STY.cd, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: th.t2, marginBottom: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>{Ico.fire(th.rd)}{t.hm}</div>
            <Heat xar={xar} ac={th.ac} />
          </div>

          {maq.length === 0 && (
            <button onClick={() => { buzz(8); setScr("maqsad"); }} style={{ ...STY.cd, width: "100%", marginBottom: 14, cursor: "pointer", textAlign: "left", border: "1px dashed " + th.ac + "55", background: th.ac + "08", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: th.ac + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎯</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Maqsad qo'ying" : "Set a goal"}</div><div style={{ fontSize: 11, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Uy, mashina, sayohat uchun jamg'aring" : "Save for your dreams"}</div></div>
              <span style={{ fontSize: 18, color: th.ac }}>›</span>
            </button>
          )}

          {hasKids && (() => {
            const pendingVaz = vazifalar.filter(v => v.status === "done");
            const activeVaz = vazifalar.filter(v => v.status === "pending");
            if (pendingVaz.length === 0 && activeVaz.length === 0) {
              return (
                <button onClick={() => { buzz(8); setShowAddVazifa(true); }} style={{ ...STY.cd, width: "100%", marginBottom: 14, cursor: "pointer", textAlign: "left", border: "1px dashed #f59e0b55", background: "#f59e0b08", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "#f59e0b18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📋</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Farzandga vazifa bering" : "Assign task to child"}</div><div style={{ fontSize: 11, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Bolalar uchun topshiriqlar yarating" : "Create tasks for kids"}</div></div>
                  <span style={{ fontSize: 18, color: "#f59e0b" }}>›</span>
                </button>
              );
            }
            return (
              <div style={{ ...STY.cd, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: th.t1, display: "flex", alignItems: "center", gap: 6 }}>
                    📋 {lg === "uz" ? "Farzand vazifalari" : "Child tasks"}
                    {pendingVaz.length > 0 && <span style={{ background: "#f59e0b", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 800, padding: "1px 7px" }}>{pendingVaz.length}</span>}
                  </div>
                  <button onClick={() => { buzz(8); setShowAddVazifa(true); }} style={{ background: th.ac + "18", border: "none", borderRadius: 8, padding: "5px 10px", color: th.ac, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ {lg === "uz" ? "Yangi" : "New"}</button>
                </div>
                {pendingVaz.length > 0 && (
                  <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b33", borderRadius: 10, padding: "8px 12px", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: "#92400e", fontWeight: 700, marginBottom: 6 }}>⏳ {lg === "uz" ? "Tasdiqlash kutilmoqda" : "Awaiting approval"} ({pendingVaz.length})</div>
                    {pendingVaz.slice(0, 2).map(v => (
                      <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{v.emoji || "📋"}</span>
                        <span style={{ flex: 1, fontSize: 12, color: th.t1, fontWeight: 600 }}>{v.title}</span>
                        <button onClick={() => vazifaApprove(v.id)} style={{ background: "#22c55e", border: "none", borderRadius: 8, padding: "4px 10px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✓ OK</button>
                      </div>
                    ))}
                  </div>
                )}
                {activeVaz.length > 0 && <div style={{ fontSize: 12, color: th.t2 }}>{activeVaz.length} {lg === "uz" ? "ta faol vazifa" : "active tasks"}</div>}
              </div>
            );
          })()}

          <SL ch={lg === "uz" ? "Oxirgi operatsiyalar" : "Recent transactions"} th={th} />
          {xar.filter(x => x.uid === user?.id).length === 0 && dar.filter(d => d.uid === user?.id).length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: th.t2, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: th.ac + "11", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 14 }}>💳</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: th.t1, marginBottom: 6 }}>{lg === "uz" ? "Hali xarajat kiritilmagan" : "No transactions yet"}</div>
              <div style={{ fontSize: 13, color: th.t2, marginBottom: 18, maxWidth: 240 }}>{lg === "uz" ? "Yuqoridagi tez qo'shish tugmalaridan foydalaning yoki pastdagi + tugmasini bosing" : "Use quick add buttons above or tap + below"}</div>
              <button onClick={() => setScr("qoshish")} style={{ ...STY.bt(), width: "auto", padding: "12px 28px", marginBottom: 0, display: "flex", alignItems: "center", gap: 8 }}>{Ico.add("#fff")}{lg === "uz" ? "Xarajat qo'shish" : "Add expense"}</button>
            </div>
          ) : (
            [...xar.filter(x => x.uid === user?.id).slice(0, 8).map(x => ({ ...x, tp: "x" })), ...dar.filter(d => d.uid === user?.id).slice(0, 5).map(d => ({ ...d, tp: "d" }))]
              .sort((a, b) => b.id - a.id).slice(0, 12)
              .map(item => <TxRow key={item.tp + item.id} item={item} th={th} STY={STY} KATS={KATS} KN={KN} DARS={DARS} DN={DN} lg={lg} gN={gN} gP={gP} f={f} user={user} onDelete={delX} Ico={Ico} />)
          )}
        </div>
      )}
    </div>
  );
}
