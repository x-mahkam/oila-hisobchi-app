import { useState } from "react";
import { KatIco, DarIco, MoneyInput, Av } from "../common/index.jsx";
import { KATS, KN, DARS, DN } from "../../utils/constants.js";
import { Ico } from "../../utils/icons.jsx";
import { td } from "../../utils/formatters.js";

export default function AddTransactionModal({
  th, STY, lg, t, f, ok$, buzz,
  user, oila, azolar, xar, dar,
  addX, addD,
  addModalTab, setAddModalTab,
  addStep, setAddStep,
  addKat, setAddKat,
  isPremium, setShowPremModal,
  prefill, onVoice, onScan,
  onClose,
}) {
  const tab = addModalTab;
  const setTab = setAddModalTab;
  const step = addStep;
  const setStep = setAddStep;
  const kat = addKat;
  const setKat = setAddKat;
  const isKid = user?.rol === "kid";

  const [fS, setFS] = useState(prefill?.summa ? String(prefill.summa) : "");
  const [fIz, setFIz] = useState(prefill?.izoh || "");
  const [fSn, setFSn] = useState(prefill?.sana || td());
  const [fRp, setFRp] = useState(false);
  const [xForMember, setXForMember] = useState("");

  const [fDS, setFDS] = useState("");
  const [fDI, setFDI] = useState("");

  // MUHIM: tugma bosilgandan onClose() chaqirilgunga qadar (addX/addD'ning
  // Firestore yozuvi tugaguncha) bir necha yuz millisoniya o'tishi mumkin —
  // shu oraliqda tez ikki marta bosilsa (sekin tarmoqda ehtimoli yuqori),
  // xarajat/daromad IKKI MARTA qo'shilib, tanga ham ikki marta berilardi.
  const [submitting, setSubmitting] = useState(false);

  const saveX = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await addX({ kategoriya: kat, summa: fS, izoh: fIz, sana: fSn, repeat: fRp, forMember: xForMember || null });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };
  const saveD = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await addD({ tur: kat, summa: fDS, izoh: fDI, sana: td() });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", flexDirection: "column", background: th.bg, animation: "slideUpFull .3s cubic-bezier(.32,1.4,.64,1)" }}>
      <style>{`@keyframes slideUpFull{0%{transform:translateY(100%)}100%{transform:translateY(0)}}`}</style>
      {/* Header */}
      <div style={{ background: th.sur, borderBottom: "1px solid " + th.bor, padding: "14px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => { if (step === "form") { setStep("kat"); } else { onClose(); } }} style={{ background: "none", border: "none", fontSize: 15, color: th.t2, cursor: "pointer", fontWeight: 600, padding: "4px 0" }}>
          {step === "form" ? "← " + t("at_back") : t("at_cancel")}
        </button>
        <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>
          {step === "kat" ? t("at_whatToAdd") : kat ? (tab === "xarajat" ? t("at_expense") : t("at_income")) : ""}
        </div>
        <div style={{ width: 50 }} />
      </div>
      {/* Tabs */}
      {step === "kat" && !isKid && (
        <div style={{ background: th.sur, padding: "10px 16px 12px", flexShrink: 0, borderBottom: "1px solid " + th.bor }}>
          <div style={{ display: "flex", background: th.bg, borderRadius: 14, padding: 3, gap: 3 }}>
            <button onClick={() => { setTab("xarajat"); setKat(null); }} style={{ flex: 1, padding: "11px", borderRadius: 11, border: "none", background: tab === "xarajat" ? th.rd : "transparent", color: tab === "xarajat" ? "#fff" : th.t2, fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              {t("at_expense")}
            </button>
            <button onClick={() => { setTab("daromad"); setKat(null); }} style={{ flex: 1, padding: "11px", borderRadius: 11, border: "none", background: tab === "daromad" ? th.gr : "transparent", color: tab === "daromad" ? "#fff" : th.t2, fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="17" x2="7" y2="7"/><polyline points="7 17 7 7 17 7"/></svg>
              {t("at_income")}
            </button>
          </div>
        </div>
      )}
      {step === "kat" && isKid && (
        <div style={{ background: th.sur, padding: "10px 16px 12px", flexShrink: 0, borderBottom: "1px solid " + th.bor }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: th.gr, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="17" x2="7" y2="7"/><polyline points="7 17 7 7 17 7"/></svg>
            {t("at_addIncome")}
          </div>
        </div>
      )}
      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", background: th.bg }}>
        {/* KATEGORIYA TANLASH (xarajat) */}
        {/* ── Ovoz va Chek skaneri ── */}
        {step === "kat" && tab === "xarajat" && !isKid && (onVoice || onScan) && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {onVoice && <button onClick={() => { onClose(); onVoice(); }} style={{ flex: 1, background: "linear-gradient(135deg,#8b5cf620,#6366f115)", border: "1.5px solid #8b5cf655", borderRadius: 13, padding: "11px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, color: "#a78bfa", fontWeight: 700, fontSize: 12.5 }}>{Ico.mic("#a78bfa")} {t("at_byVoice")}</button>}
            {onScan && <button onClick={() => { onClose(); onScan(); }} style={{ flex: 1, background: "linear-gradient(135deg,#10b98120,#05966915)", border: "1.5px solid #10b98155", borderRadius: 13, padding: "11px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, color: "#34d399", fontWeight: 700, fontSize: 12.5 }}>{Ico.camera("#34d399")} {t("at_scanReceipt")}</button>}
          </div>
        )}
        {step === "kat" && tab === "xarajat" && !isKid && (
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: th.t2, marginBottom: 10, letterSpacing: 0.5 }}>{t("at_selectCategory")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {KATS.map((k, i) => (
                <button key={k.id} onClick={() => { setKat(k.id); setStep("form"); }} style={{ background: th.sur, border: "1.5px solid " + th.bor, borderRadius: 16, padding: "12px 6px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all .15s" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: k.c + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <KatIco id={k.id} c={k.c} s={22} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: th.t1, textAlign: "center", lineHeight: 1.2 }}>{KN[lg][i]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* DAROMAD KATEGORIYA */}
        {step === "kat" && tab === "daromad" && (
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: th.t2, marginBottom: 10, letterSpacing: 0.5 }}>{t("at_selectIncomeType")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {DARS.map((d, i) => (
                <button key={d.id} onClick={() => { setKat(d.id); setStep("form"); }} style={{ background: th.sur, border: "1.5px solid " + th.bor, borderRadius: 16, padding: "12px 6px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: d.c + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DarIco id={d.id} c={d.c} s={22} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: th.t1, textAlign: "center", lineHeight: 1.2 }}>{DN[lg][i]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* XARAJAT FORM */}
        {step === "form" && tab === "xarajat" && (
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: th.sur, borderRadius: 16, padding: "12px 16px", marginBottom: 16, border: "1.5px solid " + (KATS.find(k => k.id === kat)?.c || th.ac) + "44" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: (KATS.find(k => k.id === kat)?.c || th.ac) + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <KatIco id={kat} c={KATS.find(k => k.id === kat)?.c || th.ac} s={22} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{KN[lg][KATS.findIndex(k => k.id === kat)]}</div>
                <div style={{ fontSize: 11, color: th.t2 }}>{t("at_expenseCategory")}</div>
              </div>
            </div>
            <label style={STY.lb}>{t("at_amountLabel")}</label>
            <MoneyInput style={{ ...STY.ip, fontSize: 28, fontWeight: 800, textAlign: "center" }} value={fS} onChange={setFS} placeholder="0" autoFocus th={th} />
            <label style={STY.lb}>{t("at_noteOptional")}</label>
            <input style={STY.ip} value={fIz} onChange={e => setFIz(e.target.value)} placeholder={t("at_whatForPlaceholder")} />
            <label style={STY.lb}>{t("at_dateLabel")}</label>
            <input type="date" style={STY.ip} value={fSn} onChange={e => setFSn(e.target.value)} />
            {azolar.length > 1 && (
              <>
                <label style={STY.lb}>{t("at_forWhomLabel")}</label>
                <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
                  <button onClick={() => setXForMember("")} style={{ flexShrink: 0, background: !xForMember ? th.ac + "18" : th.surH, border: "1.5px solid " + (!xForMember ? th.ac : th.bor), borderRadius: 11, padding: "9px 13px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: !xForMember ? th.ac : th.t2, fontSize: 12, fontWeight: 600 }}>
                    <Av src={user?.photo} name={user?.ism} size={22} ac={th.ac} />{t("at_meLabel")}
                  </button>
                  {azolar.filter(a => a.id !== user.id).map(a => (
                    <button key={a.id} onClick={() => setXForMember(a.id)} style={{ flexShrink: 0, background: xForMember === a.id ? th.ac + "18" : th.surH, border: "1.5px solid " + (xForMember === a.id ? th.ac : th.bor), borderRadius: 11, padding: "9px 13px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: xForMember === a.id ? th.ac : th.t2, fontSize: 12, fontWeight: 600 }}>
                      <Av src={a.photo} name={a.ism} size={22} ac={th.ac} />{a.ism.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, background: th.sur, border: "1px solid " + th.bor, borderRadius: 13, padding: "12px 14px" }}>
              <input type="checkbox" id="rep2" checked={fRp} onChange={e => setFRp(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer", accentColor: th.ac }} />
              <label htmlFor="rep2" style={{ fontSize: 13, color: th.t1, cursor: "pointer" }}>{t("at_recurringMonthly")}</label>
            </div>
            <button onClick={saveX} disabled={submitting} style={{ ...STY.bt(th.rd, "#dc2626"), marginBottom: 8, opacity: submitting ? 0.6 : 1 }}>
              {Ico.check("#fff")}{t("at_saveExpense")}
            </button>
          </div>
        )}
        {/* DAROMAD FORM */}
        {step === "form" && tab === "daromad" && (
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: th.sur, borderRadius: 16, padding: "12px 16px", marginBottom: 16, border: "1.5px solid " + (DARS.find(d => d.id === kat)?.c || th.gr) + "44" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: (DARS.find(d => d.id === kat)?.c || th.gr) + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DarIco id={kat} c={DARS.find(d => d.id === kat)?.c || th.gr} s={22} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{DN[lg][DARS.findIndex(d => d.id === kat)]}</div>
                <div style={{ fontSize: 11, color: th.t2 }}>{t("at_incomeType")}</div>
              </div>
            </div>
            <label style={STY.lb}>{t("at_amountLabel")}</label>
            <MoneyInput style={{ ...STY.ip, fontSize: 28, fontWeight: 800, textAlign: "center" }} value={fDS} onChange={setFDS} placeholder="0" autoFocus th={th} />
            <label style={STY.lb}>{t("at_noteOptional")}</label>
            <input style={STY.ip} value={fDI} onChange={e => setFDI(e.target.value)} placeholder={t("at_egMaySalary")} />
            <button onClick={saveD} disabled={submitting} style={{ ...STY.bt(), marginBottom: 8, opacity: submitting ? 0.6 : 1 }}>
              {Ico.check("#fff")}{t("at_saveIncome")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
