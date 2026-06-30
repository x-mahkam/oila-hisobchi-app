import { MoneyInput } from "../common/index.jsx";

export default function PartialQarzModal({ q, partialSum, setPartialSum, th, S, lg, f, t, onConfirm, onClose }) {
  const isLent = q.tur === "bergan";
  const dc = isLent ? th.gr : th.rd;
  const pay = Number(partialSum) || 0;
  const remain = q.summa - pay;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: th.sur, borderRadius: 24, padding: "26px 24px", width: "100%", maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ width: 60, height: 60, borderRadius: 17, background: dc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 12px" }}>{isLent ? "💰" : "💸"}</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: th.t1, marginBottom: 4 }}>{lg === "uz" ? "Qisman qaytarish" : "Partial payment"}</div>
          <div style={{ fontSize: 13, color: th.t2 }}>{q.kim} · {lg === "uz" ? "Jami" : "Total"}: {f(q.summa, true)}</div>
        </div>
        <label style={S.lb}>{lg === "uz" ? "Qaytarilgan summa" : "Returned amount"}</label>
        <MoneyInput autoFocus style={{ ...S.ip, fontSize: 22, fontWeight: 800, textAlign: "center" }} value={partialSum} onChange={setPartialSum} placeholder="0" th={th} />
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {[25, 50, 75].map(pct => (
            <button key={pct} onClick={() => setPartialSum(String(Math.round(q.summa * pct / 100)))} style={{ flex: 1, background: th.bg, border: "1px solid " + th.bor, borderRadius: 9, padding: "7px 0", color: th.t2, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{pct}%</button>
          ))}
          <button onClick={() => setPartialSum(String(q.summa))} style={{ flex: 1, background: th.ac + "15", border: "1px solid " + th.ac + "33", borderRadius: 9, padding: "7px 0", color: th.ac, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{lg === "uz" ? "Hammasi" : "All"}</button>
        </div>
        {pay > 0 && (
          <div style={{ background: th.bg, borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Qaytarilmoqda" : "Paying"}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: dc }}>{f(pay, true)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Qoladi" : "Remaining"}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: remain <= 0 ? th.gr : th.t1 }}>{remain <= 0 ? (lg === "uz" ? "To'liq yopiladi ✓" : "Fully closed ✓") : f(remain, true)}</span>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1.5px solid " + th.bor, borderRadius: 14, padding: "13px", color: th.t2, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{t.cn}</button>
          <button onClick={onConfirm} style={{ flex: 2, background: "linear-gradient(135deg," + dc + "," + dc + "cc)", border: "none", borderRadius: 14, padding: "13px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{lg === "uz" ? "Tasdiqlash" : "Confirm"}</button>
        </div>
      </div>
    </div>
  );
}
