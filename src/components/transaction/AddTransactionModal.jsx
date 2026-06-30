import { useState } from "react";
import { KatIco, DarIco, MoneyInput, Av } from "../common/index.jsx";
import { KATS, KN, DARS, DN } from "../../utils/constants.js";
import { Ico } from "../../utils/icons.jsx";
import { td } from "../../utils/formatters.js";

export default function AddTransactionModal({
  th, S, lg, f, ok$, buzz,
  user, oila, azolar, xar, dar,
  addX, addD,
  addModalTab, setAddModalTab,
  addStep, setAddStep,
  addKat, setAddKat,
  isPremium, setShowPremModal,
  onClose,
}) {
  const tab = addModalTab;
  const setTab = setAddModalTab;
  const step = addStep;
  const setStep = setAddStep;
  const kat = addKat;
  const setKat = setAddKat;
  const isKid = user?.rol === "kid";

  const [fS, setFS] = useState("");
  const [fIz, setFIz] = useState("");
  const [fSn, setFSn] = useState(td());
  const [fRp, setFRp] = useState(false);
  const [xForMember, setXForMember] = useState("");

  const [fDS, setFDS] = useState("");
  const [fDI, setFDI] = useState("");

  const saveX = async () => {
    await addX({ kategoriya: kat, summa: fS, izoh: fIz, sana: fSn, repeat: fRp, forMember: xForMember || null });
    onClose();
  };
  const saveD = async () => {
    await addD({ tur: kat, summa: fDS, izoh: fDI, sana: td() });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", flexDirection: "column", background: th.bg, animation: "slideUpFull .3s cubic-bezier(.32,1.4,.64,1)" }}>
      <style>{`@keyframes slideUpFull{0%{transform:translateY(100%)}100%{transform:translateY(0)}}`}</style>
      {/* Header */}
      <div style={{ background: th.sur, borderBottom: "1px solid " + th.bor, padding: "14px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => { if (step === "form") { setStep("kat"); } else { onClose(); } }} style={{ background: "none", border: "none", fontSize: 15, color: th.t2, cursor: "pointer", fontWeight: 600, padding: "4px 0" }}>
          {step === "form" ? "← " + (lg === "uz" ? "Orqaga" : "Back") : (lg === "uz" ? "Bekor" : "Cancel")}
        </button>
        <div style={{ fontSize: 16, fontWeight: 800, color: th.t1 }}>
          {step === "kat" ? (lg === "uz" ? "Nima qo'shamiz?" : "What to add?") : kat ? (tab === "xarajat" ? (lg === "uz" ? "Xarajat" : "Expense") : (lg === "uz" ? "Daromad" : "Income")) : ""}
        </div>
        <div style={{ width: 50 }} />
      </div>
      {/* Tabs */}
      {step === "kat" && !isKid && (
        <div style={{ background: th.sur, padding: "10px 16px 12px", flexShrink: 0, borderBottom: "1px solid " + th.bor }}>
          <div style={{ display: "flex", background: th.bg, borderRadius: 14, padding: 3, gap: 3 }}>
            <button onClick={() => { setTab("xarajat"); setKat(null); }} style={{ flex: 1, padding: "11px", borderRadius: 11, border: "none", background: tab === "xarajat" ? th.rd : "transparent", color: tab === "xarajat" ? "#fff" : th.t2, fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all .2s" }}>
              {lg === "uz" ? "💸 Xarajat" : "💸 Expense"}
            </button>
            <button onClick={() => { setTab("daromad"); setKat(null); }} style={{ flex: 1, padding: "11px", borderRadius: 11, border: "none", background: tab === "daromad" ? th.gr : "transparent", color: tab === "daromad" ? "#fff" : th.t2, fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all .2s" }}>
              {lg === "uz" ? "💰 Daromad" : "💰 Income"}
            </button>
          </div>
        </div>
      )}
      {step === "kat" && isKid && (
        <div style={{ background: th.sur, padding: "10px 16px 12px", flexShrink: 0, borderBottom: "1px solid " + th.bor }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: th.gr, textAlign: "center" }}>💰 {lg === "uz" ? "Daromad qo'shish" : "Add income"}</div>
        </div>
      )}
      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", background: th.bg }}>
        {/* KATEGORIYA TANLASH (xarajat) */}
        {step === "kat" && tab === "xarajat" && !isKid && (
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: th.t2, marginBottom: 10, letterSpacing: 0.5 }}>{lg === "uz" ? "KATEGORIYA TANLANG" : "SELECT CATEGORY"}</div>
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
            <div style={{ fontSize: 12, fontWeight: 700, color: th.t2, marginBottom: 10, letterSpacing: 0.5 }}>{lg === "uz" ? "DAROMAD TURINI TANLANG" : "SELECT INCOME TYPE"}</div>
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
                <div style={{ fontSize: 11, color: th.t2 }}>{lg === "uz" ? "Xarajat kategoriyasi" : "Expense category"}</div>
              </div>
            </div>
            <label style={S.lb}>{lg === "uz" ? "Summa (so'm)" : "Amount"}</label>
            <MoneyInput style={{ ...S.ip, fontSize: 28, fontWeight: 800, textAlign: "center" }} value={fS} onChange={setFS} placeholder="0" autoFocus th={th} />
            <label style={S.lb}>{lg === "uz" ? "Izoh (ixtiyoriy)" : "Note (optional)"}</label>
            <input style={S.ip} value={fIz} onChange={e => setFIz(e.target.value)} placeholder={lg === "uz" ? "Nima uchun?" : "What for?"} />
            <label style={S.lb}>{lg === "uz" ? "Sana" : "Date"}</label>
            <input type="date" style={S.ip} value={fSn} onChange={e => setFSn(e.target.value)} />
            {azolar.length > 1 && (
              <>
                <label style={S.lb}>{lg === "uz" ? "Kim uchun?" : "For whom?"}</label>
                <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
                  <button onClick={() => setXForMember("")} style={{ flexShrink: 0, background: !xForMember ? th.ac + "18" : th.surH, border: "1.5px solid " + (!xForMember ? th.ac : th.bor), borderRadius: 11, padding: "9px 13px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: !xForMember ? th.ac : th.t2, fontSize: 12, fontWeight: 600 }}>
                    <Av src={user?.photo} name={user?.ism} size={22} ac={th.ac} />{lg === "uz" ? "O'zim" : "Me"}
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
              <label htmlFor="rep2" style={{ fontSize: 13, color: th.t1, cursor: "pointer" }}>{lg === "uz" ? "Takroriy (oy sayin)" : "Recurring (monthly)"}</label>
            </div>
            <button onClick={saveX} style={{ ...S.bt(th.rd, "#dc2626"), marginBottom: 8 }}>
              {Ico.check("#fff")}{lg === "uz" ? " Xarajatni saqlash" : " Save expense"}
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
                <div style={{ fontSize: 11, color: th.t2 }}>{lg === "uz" ? "Daromad turi" : "Income type"}</div>
              </div>
            </div>
            <label style={S.lb}>{lg === "uz" ? "Summa (so'm)" : "Amount"}</label>
            <MoneyInput style={{ ...S.ip, fontSize: 28, fontWeight: 800, textAlign: "center" }} value={fDS} onChange={setFDS} placeholder="0" autoFocus th={th} />
            <label style={S.lb}>{lg === "uz" ? "Izoh (ixtiyoriy)" : "Note (optional)"}</label>
            <input style={S.ip} value={fDI} onChange={e => setFDI(e.target.value)} placeholder={lg === "uz" ? "Masalan: may oyligi" : "e.g. May salary"} />
            <button onClick={saveD} style={{ ...S.bt(), marginBottom: 8 }}>
              {Ico.check("#fff")}{lg === "uz" ? " Daromadni saqlash" : " Save income"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
