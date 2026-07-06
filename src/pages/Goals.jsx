import { useMemo, useState, memo } from "react";
import { MoneyInput } from "../components/common/index.jsx";
import {
  PageHeader, SectionHeader, AppCard, Badge, EmptyState,
  PrimaryButton, GhostButton, IconButton, LinearProgress, UIAvatar,
} from "../components/ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, SHADOW, CHART, OPACITY } from "../utils/tokens.js";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { GOAL_PRESETS, KID_GOAL_PRESETS } from "../utils/constants.js";
import WeddingCalc from "../components/WeddingCalc.jsx";

// ── Goals-lokal outline SVG ikonkalar (emoji o'rniga, DS 6) ──
const GIco = {
  rings: (c, s=22) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="7.5" cy="12" r="5" stroke={c} strokeWidth="1.6"/><circle cx="12.5" cy="12" r="5" stroke={c} strokeWidth="1.6"/><path d="M7.5 7V4.5M5.5 5.5L7.5 3l2 2.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  target: (c, s=16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.2" opacity=".4"/><circle cx="8" cy="8" r="3.8" stroke={c} strokeWidth="1.2" opacity=".7"/><circle cx="8" cy="8" r="1.4" fill={c}/></svg>,
  family: (c, s=15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2.2" stroke={c} strokeWidth="1.2"/><circle cx="11" cy="5.8" r="1.7" stroke={c} strokeWidth="1.2"/><path d="M1.5 13.5c0-2.4 1.8-4 4-4s4 1.6 4 4M9.5 13.5c.2-1.9 1.3-3 2.8-3 1.4 0 2.4 1 2.7 3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  cal: (c, s=12) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke={c} strokeWidth="1.3"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  bulb: (c, s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5a4.5 4.5 0 00-2.5 8.2c.6.5 1 1 1 1.8h3c0-.8.4-1.3 1-1.8A4.5 4.5 0 008 1.5z" fill={c} opacity=".15" stroke={c} strokeWidth="1.2"/><path d="M6.5 13.5h3M7 15h2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  trophy: (c, s=12) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M5 2h6v4a3 3 0 01-6 0V2z" fill={c} opacity=".15" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 3H2.5c0 2 1 3.5 2.5 3.5M11 3h2.5c0 2-1 3.5-2.5 3.5M8 9v2.5M5.5 13.5h5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  gift: (c, s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="8" rx="1.5" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M1.5 4.5h13V7h-13zM8 4.5V14M8 4.5C8 3 6.8 2 6 2.5 5.2 3 5.5 4.5 8 4.5zm0 0C8 3 9.2 2 10 2.5c.8.5.5 2-2 2z" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  clock: (c, s=12) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth="1.3"/><path d="M8 4.5V8l2.5 1.8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  check: (c, s=13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x: (c, s=12) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
};

// ═══ Bitta maqsad kartasi — React.memo (4-band talabi) ═══
const GoalCard = memo(function GoalCard({ m, th, t, f, lg, isKid, user, gN, gP, setEditMq, setEditMqN, setEditMqS, delMq, setTupId, setTupS, parentBoughtMaqsad, parentLaterMaqsad, kidAcceptMaqsad, kidRejectMaqsad }) {
  const p = Math.round(m.jamg / m.maqsad * 100);
  const waiting = m.status === "waiting_parent";
  const confirmed = m.status === "parent_confirmed";

  // ── Oilaviy maqsad: a'zolar hissasini yig'ish (uid bo'yicha) ──
  const isFamilyGoal = m.shared === true || m.type === "family";
  const contribList = Array.isArray(m.contribs) ? m.contribs : [];
  const nameOf = (c) => {
    const n = (typeof gN === "function") ? gN(c.uid) : "";
    return (n && n !== "?") ? n : (c.ism || (lg === "uz" ? "A'zo" : "Member"));
  };
  const members = Object.values(contribList.reduce((acc, c) => {
    const k = c.uid || "?";
    if (!acc[k]) acc[k] = { uid: c.uid, ism: c.ism || "", total: 0 };
    acc[k].total += Number(c.summa) || 0;
    if (c.ism) acc[k].ism = c.ism;
    return acc;
  }, {})).sort((a, b) => b.total - a.total);
  return (
    <AppCard th={th} style={{ border: waiting ? "1.5px solid " + th.am + ALPHA.strong : confirmed ? "1.5px solid " + th.gr + ALPHA.strong : undefined }}>
      {/* icon + title + amount + edit/del */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: SPACE.s2 + 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 + 2, minWidth: 0 }}>
          <div style={{ width: SPACE.s8 + SPACE.s2, height: SPACE.s8 + SPACE.s2, borderRadius: RADIUS.s + 2, background: m.rang + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{GIco.target(m.rang, 20)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...TYPE.subtitle, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.ism}</div>
            <div style={{ ...TYPE.caption, color: th.t2, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{f(m.jamg, true)} / {f(m.maqsad, true)}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: SPACE.s1 + 3, alignItems: "center", flexShrink: 0 }}>
          <span style={{ ...TYPE.heading, fontSize: TYPE.heading.fontSize + 1, color: m.rang, fontVariantNumeric: "tabular-nums" }}>{p}%</span>
          <button className="ui-press" onClick={() => { setEditMq(m.id); setEditMqN(m.ism); setEditMqS(String(m.maqsad)); }} aria-label="Tahrirlash" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}>{Ico.edit(th.t2)}</button>
          <button className="ui-press" onClick={() => delMq(m.id)} aria-label="O'chirish" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}>{Ico.trash(th.t2)}</button>
        </div>
      </div>
      {/* progress — kit, maqsad rangida */}
      <div style={{ marginBottom: SPACE.s2 + 2 }}>
        <LinearProgress th={th} value={p} tone={m.rang} height={SPACE.s3} />
      </div>
      {m.createdAt && <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginBottom: SPACE.s1, display: "flex", alignItems: "center", gap: SPACE.s1 }}>{GIco.cal(th.t2)}{lg === "uz" ? "Boshlangan" : "Started"}: {m.createdAt}</div>}
      {p < 100 && (() => {
        const remain = m.maqsad - m.jamg;
        const perMonth = Math.ceil(m.maqsad / 12);
        const monthsLeft = Math.ceil(remain / perMonth);
        return (
          <div style={{ background: m.rang + ALPHA.faint, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px " + (SPACE.s2 + 3) + "px", marginBottom: SPACE.s2 + 2, ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, display: "flex", alignItems: "center", gap: SPACE.s1 + 2 }}>
            <span style={{ flexShrink: 0, display: "flex" }}>{GIco.bulb(m.rang)}</span>
            <span>{lg === "uz" ? "Har oy " + f(perMonth, true) + " ajratsangiz, ~" + monthsLeft + " oyda yig'asiz" : "Save " + f(perMonth, true) + "/mo to reach in ~" + monthsLeft + " months"}</span>
          </div>
        );
      })()}
      {/* ── Oilaviy maqsad: a'zolar hissasi + oxirgi hissa ── */}
      {isFamilyGoal && members.length > 0 && (
        <div style={{ marginBottom: SPACE.s2 + 2 }}>
          {m.lastContrib && (
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, background: m.rang + ALPHA.faint, borderRadius: RADIUS.s - 1, padding: SPACE.s2 + "px " + (SPACE.s2 + 3) + "px", marginBottom: SPACE.s2 + 1 }}>
              <span style={{ flexShrink: 0, display: "flex" }}>{GIco.family(m.rang, 15)}</span>
              <span style={{ flex: 1, minWidth: 0, ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lg === "uz" ? "Oxirgi hissa" : "Last contribution"}: <b style={{ color: th.t1 }}>{nameOf(m.lastContrib)}</b></span>
              <span style={{ ...TYPE.caption, fontWeight: 800, color: m.rang, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>+{f(m.lastContrib.summa, true)}</span>
            </div>
          )}
          <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s2, display: "flex", alignItems: "center", gap: SPACE.s1 + 1 }}>{GIco.family(th.t2, 12)}{lg === "uz" ? "A'zolar hissasi" : "Member contributions"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2 }}>
            {members.map(mem => {
              const share = m.jamg > 0 ? Math.round(mem.total / m.jamg * 100) : 0;
              return (
                <div key={mem.uid} style={{ display: "flex", alignItems: "center", gap: SPACE.s2 }}>
                  <UIAvatar th={th} src={(typeof gP === "function") ? gP(mem.uid) : null} name={nameOf(mem)} size={SPACE.s6 + SPACE.s1} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: SPACE.s2 }}>
                      <span style={{ ...TYPE.caption, color: th.t1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nameOf(mem)}</span>
                      <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{f(mem.total, true)} · {share}%</span>
                    </div>
                    <div style={{ marginTop: SPACE.s1 - 1 }}>
                      <LinearProgress th={th} value={share} tone={m.rang} height={SPACE.s1 + 2} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {p >= 100 ? (
        <div style={{ textAlign: "center" }} className="ui-fadeUp">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>
            <Badge th={th} type="status" tone={m.rang} icon={GIco.trophy(m.rang)}>{t.ach}</Badge>
          </div>
          {(m.createdAt || m.completedAt) && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: SPACE.s1 + 2, flexWrap: "wrap", marginBottom: SPACE.s1 + 2 }}>
              {m.createdAt && <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, background: th.bg, borderRadius: RADIUS.s - 2, padding: "3px " + SPACE.s2 + "px", display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{GIco.cal(th.t2)}{m.createdAt}</span>}
              {m.createdAt && m.completedAt && <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2 }}>—</span>}
              {m.completedAt && <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: m.rang, fontWeight: 700, background: m.rang + ALPHA.soft, borderRadius: RADIUS.s - 2, padding: "3px " + SPACE.s2 + "px", display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{GIco.trophy(m.rang)}{m.completedAt?.slice(0, 10)}</span>}
            </div>
          )}
          {/* ── BOLA: pul yig'ildi, ota olib berishini kutmoqda ── */}
          {waiting && isKid && m.uid === user.id && (
            <div style={{ background: th.am + ALPHA.faint, border: "1px solid " + th.am + ALPHA.strong, borderRadius: RADIUS.s + 1, padding: (SPACE.s2 + 2) + "px " + SPACE.s3 + "px", marginTop: SPACE.s2, ...TYPE.caption, color: th.am, fontWeight: 600, lineHeight: 1.5, textAlign: "left" }}>
              <span style={{ display: "inline-flex", marginRight: SPACE.s1 }}>{GIco.clock(th.am)}</span>{lg === "uz" ? "Oila boshingizga xabar yuborildi — orzuingizni amalga oshirishi kutilmoqda" : "Family head notified — waiting to fulfill"}
              {m.parentLater && <div style={{ marginTop: SPACE.s1 + 1, color: th.t2, fontWeight: 400 }}>{lg === "uz" ? "Ota-onangiz keyinroq olib berishini aytdi" : "Parent will buy it later"}</div>}
            </div>
          )}
          {/* ── OTA-ONA: pul yig'ildi, olib berish kerak ── */}
          {waiting && !isKid && m.uid !== user.id && (
            <div style={{ background: th.am + ALPHA.faint, border: "1px solid " + th.am + ALPHA.strong, borderRadius: RADIUS.s + 1, padding: (SPACE.s2 + 3) + "px " + SPACE.s3 + "px", marginTop: SPACE.s2, textAlign: "left" }}>
              <div style={{ ...TYPE.caption, color: th.am, fontWeight: 700, marginBottom: SPACE.s2 + 1, lineHeight: 1.5 }}>{(typeof gN === "function" ? gN(m.uid) : "") + " "}{lg === "uz" ? "bu orzu uchun pul yig'ib bo'ldi! Olib bering." : "saved up for this dream!"}</div>
              <div style={{ display: "flex", gap: SPACE.s2 }}>
                <PrimaryButton th={th} onClick={() => parentBoughtMaqsad && parentBoughtMaqsad(m)} style={{ flex: 2, background: th.gr, boxShadow: SHADOW.e0, padding: (SPACE.s2 + 2) + "px 0", fontSize: TYPE.caption.fontSize, marginBottom: 0 }}>{GIco.gift("#fff")}{lg === "uz" ? "Olib berdim" : "Bought it"}</PrimaryButton>
                {!m.parentLater && <GhostButton th={th} onClick={() => parentLaterMaqsad && parentLaterMaqsad(m)} style={{ flex: 2, background: th.surH, padding: (SPACE.s2 + 2) + "px 0", fontSize: TYPE.caption.fontSize, color: th.t1 }}>{GIco.clock(th.t2)}{lg === "uz" ? "Keyinroq" : "Later"}</GhostButton>}
              </div>
              {m.parentLater && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: SPACE.s2 - 1 }}>{lg === "uz" ? "\"Keyinroq\" deb belgilangan — farzandingiz kutmoqda" : "Marked as later"}</div>}
            </div>
          )}
          {/* ── BOLA: ota "olib berdim" dedi — tasdiqlash yoki rad etish ── */}
          {confirmed && isKid && m.uid === user.id && (
            <div style={{ background: th.gr + ALPHA.faint, border: "1px solid " + th.gr + ALPHA.strong, borderRadius: RADIUS.s + 1, padding: (SPACE.s2 + 3) + "px " + SPACE.s3 + "px", marginTop: SPACE.s2, textAlign: "left" }}>
              <div style={{ ...TYPE.caption, color: th.gr, fontWeight: 700, marginBottom: SPACE.s2 + 1, lineHeight: 1.5 }}>{GIco.gift(th.gr)} {lg === "uz" ? "Ota-onangiz orzuingni amalga oshirdim dedi. Rostdan oldingizmi?" : "Parent says it's bought. Did you receive it?"}</div>
              <div style={{ display: "flex", gap: SPACE.s2 }}>
                <PrimaryButton th={th} onClick={() => kidAcceptMaqsad && kidAcceptMaqsad(m)} style={{ flex: 2, background: th.gr, boxShadow: SHADOW.e0, padding: (SPACE.s2 + 2) + "px 0", fontSize: TYPE.caption.fontSize, marginBottom: 0 }}>{GIco.check("#fff")}{lg === "uz" ? "Ha, oldim!" : "Yes, got it!"}</PrimaryButton>
                <GhostButton th={th} onClick={() => kidRejectMaqsad && kidRejectMaqsad(m)} style={{ flex: 2, background: th.rd + ALPHA.soft, border: "1px solid " + th.rd + ALPHA.strong, color: th.rd, padding: (SPACE.s2 + 2) + "px 0", fontSize: TYPE.caption.fontSize }}>{GIco.x(th.rd)}{lg === "uz" ? "Hali olganim yo'q" : "Not yet"}</GhostButton>
              </div>
            </div>
          )}
          {/* ── OTA-ONA: bola tasdig'i kutilmoqda ── */}
          {confirmed && !isKid && m.uid !== user.id && (
            <div style={{ ...TYPE.caption, color: th.gr, fontWeight: 600, marginTop: SPACE.s1 + 2, display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 }}>{GIco.clock(th.gr)}{lg === "uz" ? "Farzandingiz tasdig'i kutilmoqda" : "Waiting for child confirmation"}</div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, fontVariantNumeric: "tabular-nums" }}>{t.rem}: {f(m.maqsad - m.jamg, true)}</span>
          <button className="ui-press" onClick={() => { setTupId(m.id); setTupS(""); }} style={{ background: m.rang + ALPHA.tint, border: "1px solid " + m.rang + ALPHA.strong, borderRadius: RADIUS.s - 1, padding: (SPACE.s1 + 1) + "px " + SPACE.s3 + "px", color: m.rang, cursor: "pointer", fontWeight: 700, fontSize: TYPE.caption.fontSize, fontFamily: "inherit" }}>{t.am}</button>
        </div>
      )}
    </AppCard>
  );
});

export default function GoalsPage({
  user, maq, isKid, gN, gP,
  th, t, f, lg,
  addM, setAddM, maqTab, setMaqTab,
  canSeeReport, isBosh,
  tupId, setTupId, tupS, setTupS,
  editMq, setEditMq, editMqN, setEditMqN, editMqS, setEditMqS,
  addMq, tupMq, delMq, saveEditMq,
  parentBoughtMaqsad, parentLaterMaqsad, kidAcceptMaqsad, kidRejectMaqsad,
  ok$,
}) {
  const STY = useMemo(() => makeS(th), [th]);
  const [showToy, setShowToy] = useState(false);

  return (
    <div>
      {showToy && <WeddingCalc user={user} lg={lg} th={th} addMq={addMq} ok$={ok$} onClose={() => setShowToy(false)} />}

      {/* ── To'y kalkulyatori kirish kartasi (ekranning yagona gradienti, CHART palitradan) ── */}
      {!isKid && (
        <button className="ui-press" onClick={() => setShowToy(true)} style={{ width: "100%", background: "linear-gradient(135deg," + CHART[3] + "," + CHART[5] + ")", border: "none", borderRadius: RADIUS.m, padding: SPACE.s4, cursor: "pointer", display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s3 + 2, position: "relative", overflow: "hidden", boxShadow: SHADOW.e1(CHART[3]), fontFamily: "inherit" }}>
          <div style={{ width: SPACE.s8 + SPACE.s3, height: SPACE.s8 + SPACE.s3, borderRadius: RADIUS.s + 3, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{GIco.rings("#fff")}</div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ ...TYPE.subtitle, fontWeight: 800, color: "#fff" }}>{lg === "uz" ? "To'y kalkulyatori" : "Свадебный калькулятор"}</div>
            <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: "rgba(255,255,255,.88)", marginTop: 2 }}>{lg === "uz" ? "Marosimlar smetasi, mehmon kalkulyatori, jamg'arish rejasi" : "Смета, гости, план накоплений"}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}

      <PageHeader th={th} title={isKid ? (lg === "uz" ? "Orzularim" : "My dreams") : t.goal} style={{ marginBottom: SPACE.s3 }}
        right={maqTab === "mine" && <IconButton th={th} label={lg === "uz" ? "Maqsad qo'shish" : "Add goal"} icon={Ico.add(th.ac)} onClick={() => setAddM(v => !v)} />} />

      {!isKid && canSeeReport && (
        <div style={{ display: "flex", background: th.surH, borderRadius: RADIUS.s + 2, padding: 3, marginBottom: SPACE.s3 + 2, gap: 3 }}>
          {[["mine", GIco.target, lg === "uz" ? "O'zimning" : "My goals"], ["oila", GIco.family, lg === "uz" ? "Oilamning" : "Family goals"]].map(([key, ico, label]) => (
            <button key={key} className="ui-press" onClick={() => setMaqTab(key)} style={{ flex: 1, padding: (SPACE.s2 + 1) + "px 0", borderRadius: RADIUS.s - 1, border: "none", background: maqTab === key ? th.ac : "transparent", color: maqTab === key ? "#fff" : th.t2, fontWeight: 700, fontSize: TYPE.caption.fontSize + 1, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.s1 + 1 }}>
              {ico(maqTab === key ? "#fff" : th.t2)}{label}
            </button>
          ))}
        </div>
      )}

      {addM && (
        <GoalForm th={th} STY={STY} lg={lg} isKid={isKid} f={f} t={t} addMq={addMq} setAddM={setAddM} />
      )}

      {tupId && (
        <AppCard th={th} style={{ border: "1.5px solid " + th.ac + ALPHA.strong }}>
          <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, marginBottom: SPACE.s2 + 2, color: th.t1 }}>{t.tp}</div>
          <MoneyInput autoFocus style={STY.ip} value={tupS} onChange={setTupS} placeholder="..." th={th} />
          <div style={{ display: "flex", gap: SPACE.s2 }}>
            <PrimaryButton th={th} onClick={tupMq} style={{ flex: 1, marginBottom: 0 }}>{t.am}</PrimaryButton>
            <GhostButton th={th} onClick={() => setTupId(null)} style={{ flex: 1 }}>{t.cn}</GhostButton>
          </div>
        </AppCard>
      )}

      {editMq && (
        <AppCard th={th} style={{ border: "1.5px solid " + th.am + ALPHA.strong }}>
          <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, marginBottom: SPACE.s2 + 2, color: th.am }}>{lg === "uz" ? "Maqsadni tahrirlash" : "Edit goal"}</div>
          <label style={STY.lb}>{lg === "uz" ? "Maqsad nomi" : "Goal name"}</label>
          <input style={STY.ip} value={editMqN} onChange={e => setEditMqN(e.target.value)} placeholder="..." />
          <label style={STY.lb}>{lg === "uz" ? "Summa (so'm)" : "Amount"}</label>
          <MoneyInput style={STY.ip} value={editMqS} onChange={setEditMqS} placeholder="..." th={th} />
          <div style={{ display: "flex", gap: SPACE.s2 }}>
            <PrimaryButton th={th} onClick={saveEditMq} style={{ flex: 1, marginBottom: 0 }}>{Ico.check("#fff")}{t.sv}</PrimaryButton>
            <GhostButton th={th} onClick={() => setEditMq(null)} style={{ flex: 1 }}>{t.cn}</GhostButton>
          </div>
        </AppCard>
      )}

      {(() => {
        // Ko'rinish huquqlari:
        // - Bola: faqat O'ZINING orzulari + oila bilan ulashilgan (shared) maqsadlar
        // - Katta "Mening": o'ziniki (uid'siz eski yozuvlar ham o'ziniki)
        // - Katta "Oila": boshqalarning ULASHILGAN maqsadlari + bolalar orzulari
        const filteredMaq = isKid
          ? maq.filter(m => m.uid === user.id || m.shared === true)
          : maqTab === "mine" ? maq.filter(m => m.uid === user.id || !m.uid)
          : maq.filter(m => m.uid && m.uid !== user.id && (m.shared === true || String(m.uid).startsWith("kid")));

        if (filteredMaq.length === 0 && !addM) {
          return (
            <EmptyState th={th} preset="goal"
              title={maqTab === "oila" ? (lg === "uz" ? "Oila a'zolari hali maqsad qo'shmagan" : "No family goals yet") : (lg === "uz" ? "Maqsad qo'ying" : "Add a goal")}
              message={maqTab === "oila" ? undefined : (lg === "uz" ? "Uy, mashina, sayohat uchun jamg'aring" : "Save for your dreams")}
              actionText={maqTab !== "oila" ? (lg === "uz" ? "Maqsad qo'shish" : "Add goal") : undefined}
              onAction={maqTab !== "oila" ? () => setAddM(true) : undefined} />
          );
        }

        return filteredMaq.map(m => (
          <GoalCard key={m.id} m={m} th={th} t={t} f={f} lg={lg} isKid={isKid} user={user} gN={gN} gP={gP}
            setEditMq={setEditMq} setEditMqN={setEditMqN} setEditMqS={setEditMqS} delMq={delMq}
            setTupId={setTupId} setTupS={setTupS}
            parentBoughtMaqsad={parentBoughtMaqsad} parentLaterMaqsad={parentLaterMaqsad}
            kidAcceptMaqsad={kidAcceptMaqsad} kidRejectMaqsad={kidRejectMaqsad} />
        ));
      })()}
    </div>
  );
}

// ── Separate, self-contained "new goal" form (has its own state) ──
function GoalForm({ th, STY, lg, isKid, f, t, addMq, setAddM }) {
  const [mN, setMN] = useState("");
  const [mS, setMS] = useState("");
  const [mR, setMR] = useState(th.gr);
  const [mShared, setMShared] = useState(false);

  const submit = async () => {
    await addMq({ ism: mN, maqsad: mS, rang: mR, shared: isKid ? true : mShared });
    setMN(""); setMS(""); setMR(th.gr); setMShared(false); setAddM(false);
  };

  return (
    <AppCard th={th} style={{ border: "1.5px solid " + th.ac + ALPHA.strong }}>
      <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.ac, marginBottom: SPACE.s3 }}>{lg === "uz" ? "Yangi maqsad" : "New goal"}</div>
      <label style={STY.lb}>{lg === "uz" ? "Tayyor maqsadlar" : "Quick presets"}</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
        {(isKid ? KID_GOAL_PRESETS : GOAL_PRESETS).map((pr, i) => {
          const active = mN === (pr[lg] || pr.uz);
          return (
            <button key={i} className="ui-press" onClick={() => { setMN(pr[lg] || pr.uz); setMR(pr.rang); }} style={{ background: active ? pr.rang + ALPHA.tint : th.bg, border: "2px solid " + (active ? pr.rang : th.bor), borderRadius: RADIUS.s + 3, padding: (SPACE.s2 + 2) + "px " + SPACE.s1 + "px " + SPACE.s2 + "px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: SPACE.s1 + 1, minHeight: SPACE.s16 + SPACE.s2, fontFamily: "inherit" }}>
              <span style={{ fontSize: 24, lineHeight: 1 }}>{pr.emoji}</span>
              <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontSize: TYPE.tiny.fontSize - 0.5, color: active ? pr.rang : th.t2, fontWeight: 700, textAlign: "center", lineHeight: 1.25 }}>{pr[lg] || pr.uz}</span>
            </button>
          );
        })}
      </div>
      <label style={STY.lb}>{lg === "uz" ? "Maqsad nomi" : "Goal name"}</label>
      <input style={STY.ip} value={mN} onChange={e => setMN(e.target.value)} placeholder={lg === "uz" ? "Yoki o'zingiz yozing..." : "Or write your own..."} />
      <label style={STY.lb}>{lg === "uz" ? "Summa (so'm)" : "Amount"}</label>
      <MoneyInput style={STY.ip} value={mS} onChange={setMS} placeholder="5 000 000" th={th} />
      {!isKid && (
        <div style={{ marginBottom: SPACE.s3 }}>
          <label style={STY.lb}>{lg === "uz" ? "Maqsad turi" : "Goal type"}</label>
          <div style={{ display: "flex", gap: SPACE.s2 }}>
            {[
              { key: false, ico: GIco.target, uz: "Shaxsiy", ru: "Личная",   suz: "Faqat siz ko'rasiz",       sru: "Видите только вы" },
              { key: true,  ico: GIco.family, uz: "Oilaviy", ru: "Семейная", suz: "Oila birga hissa qo'shadi", sru: "Копит вся семья" },
            ].map(opt => {
              const on = mShared === opt.key;
              return (
                <button key={String(opt.key)} type="button" className="ui-press" onClick={() => setMShared(opt.key)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: SPACE.s1 + 1, background: on ? th.ac + ALPHA.soft : th.bg, border: "1.5px solid " + (on ? th.ac : th.bor), borderRadius: RADIUS.s + 3, padding: SPACE.s3 + "px " + SPACE.s2 + "px", cursor: "pointer", fontFamily: "inherit" }}>
                  <span style={{ display: "flex" }}>{opt.ico(on ? th.ac : th.t2, 20)}</span>
                  <span style={{ ...TYPE.caption, fontWeight: 800, color: on ? th.ac : th.t1 }}>{lg === "uz" ? opt.uz : opt.ru}</span>
                  <span style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, fontWeight: 500, textAlign: "center", lineHeight: 1.3 }}>{lg === "uz" ? opt.suz : opt.sru}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {mS && Number(mS) > 0 && (
        <div style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med, borderRadius: RADIUS.s + 3, padding: SPACE.s3 + "px " + (SPACE.s3 + 3) + "px", marginBottom: SPACE.s3 }}>
          <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.ac, fontWeight: 700, marginBottom: SPACE.s2, display: "flex", alignItems: "center", gap: SPACE.s1 + 1 }}>{GIco.bulb(th.ac)}{lg === "uz" ? "Avtomatik hisob" : "Auto calculation"}</div>
          {[{ m: 6, l: lg === "uz" ? "6 oyda" : "6 months" }, { m: 12, l: lg === "uz" ? "12 oyda" : "12 months" }, { m: 24, l: lg === "uz" ? "24 oyda" : "24 months" }].map(opt => {
            const perMonth = Math.ceil(Number(mS) / opt.m);
            return (
              <div key={opt.m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s1 + 2, ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1 }}>
                <span style={{ color: th.t2 }}>{opt.l}:</span>
                <span style={{ color: th.t1, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{f(perMonth, true)}/{lg === "uz" ? "oy" : "mo"}</span>
              </div>
            );
          })}
          <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, marginTop: SPACE.s2, paddingTop: SPACE.s2, borderTop: "1px solid " + th.bor }}>{lg === "uz" ? "Har oy ajratsangiz, shu muddatda yig'asiz" : "Save monthly to reach your goal"}</div>
        </div>
      )}
      <label style={STY.lb}>{lg === "uz" ? "Rang" : "Color"}</label>
      <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
        {[th.gr, th.ac, th.am, CHART[5], th.rd, CHART[4]].map(r => (
          <button key={r} className="ui-press" onClick={() => setMR(r)} aria-label={r} style={{ width: SPACE.s8, height: SPACE.s8, borderRadius: RADIUS.full, background: r, border: mR === r ? "3px solid " + th.t1 : "3px solid transparent", cursor: "pointer", flexShrink: 0 }} />
        ))}
      </div>
      <PrimaryButton th={th} onClick={submit}>{t.sv}</PrimaryButton>
    </AppCard>
  );
}
