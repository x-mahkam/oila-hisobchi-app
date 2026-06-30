export default function QarzDonePrompt({ q, th, S, lg, f, onAddDaromad, onAddXarajat, onClose }) {
  const isLent = q.tur === "bergan";
  const dc = isLent ? th.gr : th.rd;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: th.sur, borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: dc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 14px" }}>{isLent ? "💰" : "💸"}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: th.t1, marginBottom: 8 }}>
            {isLent ? (lg === "uz" ? "Qarz qaytarib olindi" : "Debt received") : (lg === "uz" ? "Qarz qaytarildi" : "Debt paid")}
          </div>
          <div style={{ fontSize: 14, color: th.t2, lineHeight: 1.5 }}>
            {isLent
              ? (lg === "uz" ? "Qaytarib olgan " + f(q.summa, true) + " pulni daromadlarga qo'shaylikmi?" : "Add " + f(q.summa, true) + " to income?")
              : (lg === "uz" ? "Qaytargan " + f(q.summa, true) + " pulni xarajatlarga qo'shaylikmi?" : "Add " + f(q.summa, true) + " to expenses?")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1.5px solid " + th.bor, borderRadius: 14, padding: "13px", color: th.t2, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{lg === "uz" ? "Yo'q" : "No"}</button>
          <button onClick={() => isLent ? onAddDaromad(q) : onAddXarajat(q)} style={{ flex: 2, background: "linear-gradient(135deg," + dc + "," + dc + "cc)", border: "none", borderRadius: 14, padding: "13px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{lg === "uz" ? "Ha, qo'shilsin" : "Yes, add"}</button>
        </div>
      </div>
    </div>
  );
}
