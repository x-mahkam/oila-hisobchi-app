import React from "react";

export default function VerifyTilxatModal({ verifyTilxat, th, lg, STY, f, onClose }) {
  if (!verifyTilxat) return null;
  const v = verifyTilxat;
  return (
    <div style={{ ...STY.pg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ background: th.sur, borderRadius: 24, padding: "30px 24px", maxWidth: 420, width: "100%", border: "1px solid " + th.bor, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, margin: "0 auto 14px", boxShadow: "0 12px 36px #10b98155", color: "#fff" }}>{"\u2713"}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: th.t1 }}>{lg === "uz" ? "Hujjat tasdiqlandi" : lg === "ru" ? "Документ подтверждён" : "Document verified"}</div>
          <div style={{ fontSize: 12, color: th.gr, fontWeight: 600, marginTop: 4 }}>{"\ud83d\udd12"} {lg === "uz" ? "Oila Hisobchi rasmiy tilxati" : "Official Oila Hisobchi receipt"}</div>
        </div>
        <div style={{ background: th.bg, borderRadius: 16, padding: "18px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Hujjat raqami" : "Document №"}</span><span style={{ fontSize: 12, fontWeight: 700, color: th.ac, fontFamily: "monospace" }}>{v.n}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Qarzdor" : "Debtor"}</span><span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{v.q}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Kreditor" : "Creditor"}</span><span style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{v.k}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Summa" : "Amount"}</span><span style={{ fontSize: 15, fontWeight: 800, color: th.gr }}>{f(Number(v.s), true)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Berilgan sana" : "Date"}</span><span style={{ fontSize: 13, fontWeight: 600, color: th.t1 }}>{v.d}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Qaytarish" : "Return by"}</span><span style={{ fontSize: 13, fontWeight: 600, color: th.t1 }}>{v.r}</span></div>
        </div>
        <div style={{ fontSize: 11, color: th.t2, textAlign: "center", lineHeight: 1.6, marginBottom: 18, background: th.ac + "0d", borderRadius: 10, padding: "10px 12px" }}>{lg === "uz" ? "Bu hujjat 'Oila Hisobchi' ilovasida har ikki tomon tomonidan elektron tasdiqlangan. Ma'lumotlar QR kod orqali tekshirildi." : "Confirmed by both parties in the app. Verified via QR."}</div>
        <button onClick={onClose} style={{ ...STY.bt(), marginBottom: 0 }}>{lg === "uz" ? "Ilovaga o'tish" : lg === "ru" ? "Открыть приложение" : "Open app"}</button>
      </div>
    </div>
  );
}
