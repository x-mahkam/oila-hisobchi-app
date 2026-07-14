import { useMemo, memo } from "react";
import { MoneyInput } from "../components/common/index.jsx";
import {
  PageHeader, SectionHeader, AppCard, StatCard, Badge, EmptyState,
  PrimaryButton, GhostButton, DangerButton, IconButton, UIAvatar, Switch,
} from "../components/ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, SHADOW } from "../utils/tokens.js";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";

// ── Debts-lokal outline SVG ikonkalar (emoji o'rniga, DS 6) ──
const QIco = {
  coinIn: (c, s=20) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="9" r="5.5" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M8 6.5v5M6.3 7.8c0-.7.7-1.1 1.7-1.1s1.7.4 1.7 1c0 1.6-3.4 1.3-3.4 2.9 0 .6.7 1 1.7 1s1.7-.4 1.7-1.1" stroke={c} strokeWidth="1" strokeLinecap="round"/><path d="M11 1.5l2.5 2.5M13.5 1.5v2.5h-2.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  coinOut: (c, s=20) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="9" r="5.5" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M8 6.5v5M6.3 7.8c0-.7.7-1.1 1.7-1.1s1.7.4 1.7 1c0 1.6-3.4 1.3-3.4 2.9 0 .6.7 1 1.7 1s1.7-.4 1.7-1.1" stroke={c} strokeWidth="1" strokeLinecap="round"/><path d="M13.5 4L11 1.5M11 4V1.5h2.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  person: (c, s=18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke={c} strokeWidth="1.3"/><path d="M2.5 14c.5-3 2.7-4.5 5.5-4.5s5 1.5 5.5 4.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  check: (c, s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bell: (c, s=13) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  doc: (c, s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 1.5h5.5L13 5v9.5H4V1.5z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M9.5 1.5V5H13M6 8.5h5M6 11h3.5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  family: (c, s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2.2" stroke={c} strokeWidth="1.2"/><circle cx="11" cy="5.8" r="1.7" stroke={c} strokeWidth="1.2"/><path d="M1.5 13.5c0-2.4 1.8-4 4-4s4 1.6 4 4M9.5 13.5c.2-1.9 1.3-3 2.8-3 1.4 0 2.4 1 2.7 3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
};

// Qarz status badge'lari — kit Badge orqali
const DebtBadges = memo(function DebtBadges({ q, th, lg }) {
  return (
    <>
      {q.payStatus === "pending" && <Badge th={th} type="warning">{lg === "uz" ? "Qaytarish kutilmoqda" : "Return pending"}</Badge>}
      {q.linked && q.linkStatus === "pending" && !q.payStatus && <Badge th={th} type="warning">{lg === "uz" ? "Kutilmoqda" : "Pending"}</Badge>}
      {q.linked && q.linkStatus === "accepted" && !q.payStatus && <Badge th={th} type="success" icon={QIco.check(th.gr, 10)}>{lg === "uz" ? "Tasdiqlangan" : "Confirmed"}</Badge>}
      {q.linked && q.linkStatus === "rejected" && <Badge th={th} type="danger">{lg === "uz" ? "Rad etilgan" : "Rejected"}</Badge>}
    </>
  );
});

// ═══ Faol qarz kartasi — React.memo (4-band) ═══
const DebtCard = memo(function DebtCard({ q, th, f, lg, user, markQarzPaid, sendQarzReminder, setPartialQarz, setPartialSum, generateTilxat, delQarz }) {
  const isLent = q.tur === "bergan";
  const color = isLent ? th.gr : th.rd;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = q.qaytSana && q.qaytSana < today;
  return (
    <AppCard th={th} style={{ padding: (SPACE.s3 + 1) + "px " + (SPACE.s4 - 1) + "px", border: "1px solid " + (overdue ? th.rd + ALPHA.strong : th.bor) }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: SPACE.s2 + 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, minWidth: 0 }}>
          <div style={{ width: SPACE.s8 + SPACE.s2 + 2, height: SPACE.s8 + SPACE.s2 + 2, borderRadius: RADIUS.s + 2, background: color + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{isLent ? QIco.coinIn(color) : QIco.coinOut(color)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...TYPE.subtitle, color: th.t1, display: "flex", alignItems: "center", gap: SPACE.s1 + 2, flexWrap: "wrap" }}>
              {q.kim}
              <DebtBadges q={q} th={th} lg={lg} />
            </div>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 2 }}>{q.sana}{q.qaytSana ? " → " + q.qaytSana : ""}</div>
            {q.izoh && <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 1, fontStyle: "italic" }}>{q.izoh}</div>}
            {overdue && <div style={{ marginTop: SPACE.s1 }}><Badge th={th} type="danger">{lg === "uz" ? "Muddati o'tgan!" : "Overdue!"}</Badge></div>}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ ...TYPE.heading, fontSize: TYPE.heading.fontSize - 1, color, fontVariantNumeric: "tabular-nums" }}>{f(q.summa, true)}</div>
          {q.paidPart > 0
            ? <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontSize: TYPE.tiny.fontSize - 1, color: th.gr, marginTop: 2, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{lg === "uz" ? "To'langan: " : "Paid: "}{f(q.paidPart, true)}</div>
            : <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 2 }}>{isLent ? (lg === "uz" ? "ular qarzli" : "they owe") : (lg === "uz" ? "men qarzman" : "I owe")}</div>}
        </div>
      </div>

      {/* Qisman to'lovlar vaqt chizig'i (repayment timeline) */}
      {((q.timeline && q.timeline.length > 0) || q.paidPart > 0) && (
        <div style={{ marginTop: SPACE.s2, marginBottom: SPACE.s3, paddingTop: SPACE.s3, borderTop: "1px dashed " + th.bor }}>
          <div style={{ ...TYPE.tiny, fontWeight: 700, color: th.t2, marginBottom: SPACE.s2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {lg === "uz" ? "⏳ To'lovlar tarixi" : "⏳ Repayment Timeline"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, position: "relative", paddingLeft: 14 }}>
            {/* Timeline vertical line */}
            <div style={{ position: "absolute", left: 3, top: 4, bottom: 4, width: 1.5, background: th.gr + ALPHA.strong }} />
            
            {q.timeline && q.timeline.map((p, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                <div style={{ position: "absolute", left: -14, top: 5, width: 7, height: 7, borderRadius: "50%", background: th.gr, boxShadow: "0 0 4px " + th.gr }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 600, color: th.t1, fontSize: TYPE.tiny.fontSize + 1 }}>
                    {p.ism}
                  </span>
                  <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, fontSize: 10 }}>
                    {p.sana}
                  </span>
                </div>
                <span style={{ ...TYPE.caption, fontWeight: 700, color: th.gr, fontVariantNumeric: "tabular-nums" }}>
                  +{f(p.summa, true)}
                </span>
              </div>
            ))}
            {/* Fallback virtual item if there is paidPart but timeline is empty (legacy data) */}
            {(!q.timeline || q.timeline.length === 0) && q.paidPart > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                <div style={{ position: "absolute", left: -14, top: 5, width: 7, height: 7, borderRadius: "50%", background: th.gr, boxShadow: "0 0 4px " + th.gr }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 600, color: th.t1, fontSize: TYPE.tiny.fontSize + 1 }}>
                    {lg === "uz" ? "Qisman to'lov" : "Partial repayment"}
                  </span>
                  <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, fontSize: 10 }}>
                    {q.sana}
                  </span>
                </div>
                <span style={{ ...TYPE.caption, fontWeight: 700, color: th.gr, fontVariantNumeric: "tabular-nums" }}>
                  +{f(q.paidPart, true)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: SPACE.s2 }}>
        {q.payStatus === "pending"
          ? <div style={{ flex: 1, background: th.am + ALPHA.soft, border: "1px solid " + th.am + ALPHA.med, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px 0", color: th.am, fontWeight: 700, fontSize: TYPE.caption.fontSize, textAlign: "center" }}>{q.payBy === user.id ? (lg === "uz" ? "Tasdiq kutilmoqda..." : "Awaiting confirmation...") : (lg === "uz" ? "Qaytarish so'rovi keldi" : "Return requested")}</div>
          : <button className="ui-press" onClick={() => markQarzPaid(q.id)} style={{ flex: 1, background: color + ALPHA.tint, border: "1px solid " + color + ALPHA.strong, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px 0", color, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, fontFamily: "inherit" }}>{isLent ? (lg === "uz" ? "Qaytarib oldim" : "Got it back") : (lg === "uz" ? "Qaytardim" : "Paid back")}</button>}
        {q.payStatus !== "pending" && isLent && (
          <button className="ui-press" onClick={() => sendQarzReminder(q)} style={{ background: (overdue ? th.rd : th.am) + ALPHA.soft, border: "1px solid " + (overdue ? th.rd : th.am) + ALPHA.strong, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px " + (SPACE.s2 + 3) + "px", color: overdue ? th.rd : th.am, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, flexShrink: 0, display: "flex", alignItems: "center", gap: SPACE.s1, fontFamily: "inherit" }}>
            {QIco.bell(overdue ? th.rd : th.am)}{lg === "uz" ? "Eslatish" : "Remind"}
          </button>
        )}
        {q.payStatus !== "pending" && (
          <button className="ui-press" onClick={() => { setPartialQarz(q); setPartialSum(""); }} style={{ background: th.ac + ALPHA.soft, border: "1px solid " + th.ac + ALPHA.med, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px " + SPACE.s3 + "px", color: th.ac, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, flexShrink: 0, fontFamily: "inherit" }}>{lg === "uz" ? "Qisman" : "Partial"}</button>
        )}
        {q.linked && q.linkStatus === "accepted" && q.payStatus !== "pending" && (
          <button className="ui-press" onClick={() => generateTilxat(q)} title={lg === "uz" ? "Tilxat (PDF)" : "Receipt (PDF)"} style={{ background: th.ac2 + ALPHA.soft, border: "1px solid " + th.ac2 + ALPHA.strong, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px " + (SPACE.s2 + 3) + "px", color: th.ac2, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, flexShrink: 0, display: "flex", alignItems: "center", gap: SPACE.s1, fontFamily: "inherit" }}>
            {QIco.doc(th.ac2)}{lg === "uz" ? "Tilxat" : "Receipt"}
          </button>
        )}
        {!(q.linked && q.linkStatus === "accepted") && (
          <button className="ui-press" onClick={() => delQarz(q.id)} aria-label="O'chirish" style={{ width: SPACE.s8 + SPACE.s1 + 2, background: th.rd + ALPHA.soft, border: "1px solid " + th.rd + ALPHA.med, borderRadius: RADIUS.s - 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ico.trash(th.rd)}</button>
        )}
      </div>
    </AppCard>
  );
});

// ═══ Qaytarilgan qarz qatori — React.memo, Paid = yashil Badge ═══
const PaidDebtRow = memo(function PaidDebtRow({ q, th, f, lg, delQarz }) {
  const isLent = q.tur === "bergan";
  const dc = isLent ? th.gr : th.rd;
  return (
    <AppCard th={th} style={{ padding: (SPACE.s2 + 3) + "px " + (SPACE.s4 - 1) + "px", marginBottom: SPACE.s2, borderLeft: "3px solid " + dc + ALPHA.strong, opacity: 0.92 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, minWidth: 0 }}>
          <div style={{ width: SPACE.s8 + 2, height: SPACE.s8 + 2, borderRadius: RADIUS.s - 1, background: dc + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{isLent ? QIco.coinIn(dc, 17) : QIco.coinOut(dc, 17)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 600, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.kim}</div>
            <div style={{ marginTop: 2, display: "flex", alignItems: "center", gap: SPACE.s1 + 1 }}>
              <Badge th={th} type="success" icon={QIco.check(th.gr, 10)} style={{ fontSize: TYPE.tiny.fontSize }}>{isLent ? (lg === "uz" ? "Qaytarib oldim" : "Got back") : (lg === "uz" ? "Qaytardim" : "Paid back")}</Badge>
              <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{q.paidSana}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, flexShrink: 0 }}>
          <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 800, color: dc, fontVariantNumeric: "tabular-nums" }}>{isLent ? "+" : "−"}{f(q.summa, true)}</span>
          <button className="ui-press" onClick={() => delQarz(q.id)} aria-label="O'chirish" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}>{Ico.trash(th.t2)}</button>
        </div>
      </div>
    </AppCard>
  );
});

// ═══ Oila a'zosi qarzi kartasi — React.memo ═══
const MemberDebtCard = memo(function MemberDebtCard({ q, th, f, lg, owner, ownerName }) {
  const isLent = q.tur === "bergan";
  const color = isLent ? th.gr : th.rd;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = q.qaytSana && q.qaytSana < today;
  return (
    <AppCard th={th} style={{ padding: SPACE.s3 + "px " + (SPACE.s3 + 2) + "px", marginBottom: SPACE.s2 + 1, borderLeft: "3px solid " + th.ac }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s2, paddingBottom: SPACE.s2, borderBottom: "1px solid " + th.bor }}>
        <UIAvatar th={th} src={owner?.photo} name={owner?.ism || q.kim} size={SPACE.s6 + 2} />
        <span style={{ ...TYPE.caption, fontWeight: 700, color: th.ac }}>{ownerName}</span>
        <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{lg === "uz" ? "ning qarzi" : "'s debt"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, minWidth: 0 }}>
          <div style={{ width: SPACE.s8 + SPACE.s1 + 2, height: SPACE.s8 + SPACE.s1 + 2, borderRadius: RADIUS.s + 1, background: color + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{isLent ? QIco.coinIn(color, 18) : QIco.coinOut(color, 18)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...TYPE.body, fontWeight: 700, color: th.t1 }}>{q.kim}</div>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 2 }}>{q.sana}{q.qaytSana ? " → " + q.qaytSana : ""}</div>
            {q.izoh && <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, fontStyle: "italic" }}>{q.izoh}</div>}
            {overdue && <div style={{ marginTop: SPACE.s1 }}><Badge th={th} type="danger">{lg === "uz" ? "Muddati o'tgan" : "Overdue"}</Badge></div>}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ ...TYPE.subtitle, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{f(q.summa, true)}</div>
          <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 2 }}>{isLent ? (lg === "uz" ? "ular qarzli" : "they owe") : (lg === "uz" ? "qarzdor" : "owes")}</div>
        </div>
      </div>
    </AppCard>
  );
});

export default function DebtsPage({
  user, azolar, qarzlar, qarzReqs, isBosh,
  th, t, f, lg,
  showAddQarz, setShowAddQarz,
  qarzTur, setQarzTur, qarzKim, setQarzKim,
  qarzSum, setQarzSum, qarzIzoh, setQarzIzoh,
  qarzSana, setQarzSana, qarzQaytSana, setQarzQaytSana,
  qarzTel, setQarzTel, qarzLinked, setQarzLinked,
  partialQarz, setPartialQarz, partialSum, setPartialSum,
  addQarz, sendQarzRequest, acceptQarzReq, rejectQarzReq,
  markQarzPaid, delQarz, sendQarzReminder,
  acceptPayReq, rejectPayReq, refreshQarzReqs,
  generateTilxat,
}) {
  const STY = useMemo(() => makeS(th), [th]);
  const gN2 = uid => azolar.find(a => a.id === uid)?.ism || "?";

  const myQ = qarzlar.filter(q => !q.uid || q.uid === user.id);
  const memberQ = isBosh ? qarzlar.filter(q => q.uid && q.uid !== user.id) : [];
  const active = myQ.filter(q => !q.paid);
  const done = myQ.filter(q => q.paid);
  const memberActive = memberQ.filter(q => !q.paid);
  const olganSum = active.filter(q => q.tur === "bergan").reduce((s, q) => s + Number(q.summa || 0), 0);
  const berganSum = active.filter(q => q.tur === "olgan").reduce((s, q) => s + Number(q.summa || 0), 0);

  return (
    <div>
      <PageHeader th={th} title={lg === "uz" ? "Qarzlar" : "Debts"} style={{ marginBottom: SPACE.s4 }}
        right={
          <div style={{ display: "flex", gap: SPACE.s2 }}>
            <IconButton th={th} label={lg === "uz" ? "Yangilash" : "Refresh"} icon={Ico.repeat(th.t2)} onClick={refreshQarzReqs} style={{ background: th.surH, border: "1px solid " + th.bor }} />
            <IconButton th={th} label={lg === "uz" ? "Qo'shish" : "Add"} icon={showAddQarz ? <span style={{ ...TYPE.subtitle, color: "#fff" }}>×</span> : Ico.add("#fff")} onClick={() => setShowAddQarz(v => !v)} style={{ background: th.ac, boxShadow: SHADOW.e1(th.ac) }} />
          </div>
        } />

      {showAddQarz && (
        <AppCard th={th} style={{ border: "1.5px solid " + th.ac + ALPHA.strong }}>
          <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.ac, marginBottom: SPACE.s3 }}>{lg === "uz" ? "Yangi qarz" : "New debt"}</div>
          <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
            <button className="ui-press" onClick={() => setQarzTur("olgan")} style={{ ...STY.tb(qarzTur === "olgan"), flex: 1, fontFamily: "inherit" }}>{lg === "uz" ? "Oldim" : "I borrowed"}</button>
            <button className="ui-press" onClick={() => setQarzTur("bergan")} style={{ ...STY.tb(qarzTur === "bergan"), flex: 1, fontFamily: "inherit" }}>{lg === "uz" ? "Berdim" : "I lent"}</button>
          </div>
          <div style={{ background: (qarzTur === "olgan" ? th.rd : th.gr) + ALPHA.soft, borderRadius: RADIUS.s + 1, padding: (SPACE.s2 + 1) + "px " + (SPACE.s3 + 1) + "px", marginBottom: SPACE.s3, ...TYPE.caption, color: qarzTur === "olgan" ? th.rd : th.gr, fontWeight: 600 }}>
            {qarzTur === "olgan" ? (lg === "uz" ? "Kimdir menga pul berdi — men qarzdorman" : "Someone lent me money — I owe") : (lg === "uz" ? "Men birovga pul berdim — ular qarzdor" : "I lent money — they owe me")}
          </div>
          <label style={STY.lb}>{lg === "uz" ? "Ism (kim?)" : "Person name"}</label>
          <input style={STY.ip} value={qarzKim} onChange={e => setQarzKim(e.target.value)} placeholder={lg === "uz" ? "Masalan: Akbar aka" : "e.g. John"} />
          <label style={STY.lb}>{lg === "uz" ? "Summa (so'm)" : "Amount"}</label>
          <MoneyInput style={{ ...STY.ip, ...TYPE.title, fontSize: TYPE.title.fontSize + 2, textAlign: "center" }} value={qarzSum} onChange={setQarzSum} placeholder="0" th={th} />
          <label style={STY.lb}>{lg === "uz" ? "Sana" : "Date"}</label>
          <input type="date" style={STY.ip} value={qarzSana} onChange={e => setQarzSana(e.target.value)} />
          <label style={STY.lb}>{lg === "uz" ? "Qaytarish sanasi" : "Return date"}</label>
          <input type="date" style={STY.ip} value={qarzQaytSana} onChange={e => setQarzQaytSana(e.target.value)} />
          <label style={STY.lb}>{lg === "uz" ? "Izoh (ixtiyoriy)" : "Note (optional)"}</label>
          <input style={STY.ip} value={qarzIzoh} onChange={e => setQarzIzoh(e.target.value)} placeholder="..." />
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, marginBottom: qarzLinked ? SPACE.s3 : SPACE.s3 + 2, background: th.surH, border: "1px solid " + th.bor, borderRadius: RADIUS.s + 3, padding: SPACE.s3 + "px " + (SPACE.s3 + 2) + "px" }}>
            <Switch th={th} checked={!!qarzLinked} onChange={() => setQarzLinked(v => !v)} label={lg === "uz" ? "Telefon orqali bog'lash" : "Link by phone"} />
            <div style={{ flex: 1 }}>
              <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, color: th.t1, fontWeight: 600 }}>{lg === "uz" ? "Telefon orqali bog'lash" : "Link by phone"}</div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 1 }}>{lg === "uz" ? "Tasdiqlash so'rovi yuboriladi" : "Sends confirmation"}</div>
            </div>
          </div>
          {qarzLinked && (
            <>
              <label style={STY.lb}>{lg === "uz" ? "Qarzdor telefon raqami" : "Person's phone"}</label>
              <input style={STY.ip} type="tel" value={qarzTel} onChange={e => setQarzTel(e.target.value)} placeholder="+998 90 123 45 67" />
              <div style={{ background: th.ac + ALPHA.soft, borderRadius: RADIUS.s + 1, padding: (SPACE.s2 + 1) + "px " + (SPACE.s3 + 1) + "px", marginBottom: SPACE.s3, ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2 }}>{lg === "uz" ? "Bu raqam bilan ro'yxatdan o'tgan foydalanuvchiga so'rov boradi." : "A request is sent to the registered user."}</div>
            </>
          )}
          <PrimaryButton th={th} onClick={qarzLinked ? sendQarzRequest : addQarz}>{qarzLinked ? (lg === "uz" ? "So'rov yuborish" : "Send request") : (lg === "uz" ? "Saqlash" : "Save")}</PrimaryButton>
        </AppCard>
      )}

      {qarzReqs.length > 0 && (
        <AppCard th={th} style={{ border: "1.5px solid " + th.am + ALPHA.strong, background: th.am + ALPHA.faint }}>
          <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.am, marginBottom: SPACE.s3, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>
            {QIco.bell(th.am, 16)}{lg === "uz" ? "Yangi qarz so'rovlari" : "New requests"} ({qarzReqs.length})
          </div>
          {qarzReqs.map(req => {
            const isPay = req.type === "payment";
            const theyLent = req.tur === "bergan";
            return (
              <div key={req.id} style={{ background: th.sur, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + (SPACE.s4 - 1) + "px", marginBottom: SPACE.s2 + 2, border: "1px solid " + (isPay ? th.gr + ALPHA.strong : th.bor) }}>
                <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, marginBottom: SPACE.s2 + 2 }}>
                  <div style={{ width: SPACE.s8 + SPACE.s2 + 2, height: SPACE.s8 + SPACE.s2 + 2, borderRadius: RADIUS.s + 2, background: (isPay ? th.gr : th.ac) + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{isPay ? QIco.check(th.gr) : QIco.person(th.ac)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ ...TYPE.body, fontWeight: 700, color: th.t1 }}>{req.fromIsm}</div><div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2 }}>{req.fromTel}</div></div>
                  <div style={{ ...TYPE.subtitle, fontWeight: 800, color: isPay ? th.gr : (theyLent ? th.rd : th.gr), fontVariantNumeric: "tabular-nums" }}>{f(isPay ? (req.paySum || req.summa) : req.summa, true)}</div>
                </div>
                <div style={{ background: th.bg, borderRadius: RADIUS.s, padding: SPACE.s2 + "px " + SPACE.s3 + "px", marginBottom: SPACE.s2 + 2, ...TYPE.caption, color: th.t1 }}>
                  {isPay
                    ? <span style={{ fontWeight: 600, color: th.gr }}>{lg === "uz"
                        ? req.fromIsm + (req.partial ? " qarzning " + f(req.paySum || 0, true) + " qismini qaytardim deyapti. Tasdiqlaysizmi?" : " qarzni qaytardim deyapti. Tasdiqlaysizmi?")
                        : req.fromIsm + " says the debt is returned. Confirm?"}</span>
                    : (theyLent ? (lg === "uz" ? req.fromIsm + " sizga " + f(req.summa, true) + " qarz berdi" : "They lent you money") : (lg === "uz" ? "Siz " + req.fromIsm + " dan " + f(req.summa, true) + " oldingiz" : "You borrowed"))}
                  {!isPay && req.qaytSana && <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: 3 }}>{lg === "uz" ? "Qaytarish" : "Return"}: {req.qaytSana}</div>}
                </div>
                <div style={{ display: "flex", gap: SPACE.s2 }}>
                  <PrimaryButton th={th} onClick={() => isPay ? acceptPayReq(req) : acceptQarzReq(req)} style={{ flex: 1, background: th.gr, boxShadow: SHADOW.e0, padding: (SPACE.s2 + 2) + "px 0", fontSize: TYPE.caption.fontSize + 1, marginBottom: 0 }}>{lg === "uz" ? (isPay ? "Qaytarildi, tasdiqlash" : "Tasdiqlash") : (isPay ? "Confirm return" : "Accept")}</PrimaryButton>
                  <DangerButton th={th} onClick={() => isPay ? rejectPayReq(req) : rejectQarzReq(req)} style={{ flex: 1, padding: (SPACE.s2 + 2) + "px 0", fontSize: TYPE.caption.fontSize + 1, marginBottom: 0 }}>{lg === "uz" ? "Rad etish" : "Reject"}</DangerButton>
                </div>
              </div>
            );
          })}
        </AppCard>
      )}

      {/* Xulosa: menga qaytariladi / men qaytaraman */}
      <div style={{ display: "flex", gap: SPACE.s2 + 2, marginBottom: SPACE.s4 }}>
        <StatCard th={th} icon={QIco.coinIn(th.gr, 18)} value={f(olganSum, true)} label={lg === "uz" ? "Menga qaytariladi" : "They owe me"} tone={th.gr}
          style={{ border: "1px solid " + th.gr + ALPHA.strong }} />
        <StatCard th={th} icon={QIco.coinOut(th.rd, 18)} value={f(berganSum, true)} label={lg === "uz" ? "Men qaytaraman" : "I owe"} tone={th.rd}
          style={{ border: "1px solid " + th.rd + ALPHA.strong }} />
      </div>

      {active.length > 0 && (
        <div>
          <SectionHeader th={th}>{isBosh && memberActive.length > 0 ? (lg === "uz" ? "Mening qarzlarim" : "My debts") : (lg === "uz" ? "Faol qarzlar" : "Active debts")} ({active.length})</SectionHeader>
          {active.map(q => (
            <DebtCard key={q.id + "_" + (q.uid || "o")} q={q} th={th} f={f} lg={lg} user={user}
              markQarzPaid={markQarzPaid} sendQarzReminder={sendQarzReminder}
              setPartialQarz={setPartialQarz} setPartialSum={setPartialSum}
              generateTilxat={generateTilxat} delQarz={delQarz} />
          ))}
        </div>
      )}

      {isBosh && memberActive.length > 0 && (
        <div style={{ marginTop: active.length > 0 ? SPACE.s4 + 2 : 0 }}>
          <SectionHeader th={th}><span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.s1 + 1 }}>{QIco.family(th.t2)}{lg === "uz" ? "Oila a'zolari qarzlari" : "Members' debts"} ({memberActive.length})</span></SectionHeader>
          {memberActive.map(q => (
            <MemberDebtCard key={q.id + "_" + (q.uid || "o")} q={q} th={th} f={f} lg={lg}
              owner={azolar.find(a => a.id === q.uid)} ownerName={gN2(q.uid)} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <SectionHeader th={th}>{lg === "uz" ? "Qaytarilganlar" : "Returned"} ({done.length})</SectionHeader>
          {done.slice(0, 8).map(q => (
            <PaidDebtRow key={q.id + "_" + (q.uid || "o")} q={q} th={th} f={f} lg={lg} delQarz={delQarz} />
          ))}
        </div>
      )}

      {qarzlar.length === 0 && !showAddQarz && qarzReqs.length === 0 && (
        <EmptyState th={th} preset="debt"
          title={lg === "uz" ? "Hali qarz yo'q" : "No debts yet"}
          message={lg === "uz" ? "Qarz olgan yoki berganingizni yozib boring — hech narsa unutilmaydi" : "Track money you lend or borrow — never forget"}
          actionText={lg === "uz" ? "Qarz qo'shish" : "Add debt"} onAction={() => setShowAddQarz(true)} />
      )}
    </div>
  );
}
