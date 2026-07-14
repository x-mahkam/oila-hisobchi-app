import React from "react";

export default function AskTelModal({ th, lg, newT, setNewT, saveTel, onClose }) {
  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, background: "rgba(0,0,0,0.62)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: th.sur, borderRadius: 22, padding: "26px 22px", maxWidth: 380, width: "100%", border: "1px solid " + th.bor, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ fontSize: 34, textAlign: "center", marginBottom: 10 }}>📱</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: th.t1, textAlign: "center", marginBottom: 8 }}>{lg === "uz" ? "Telefon raqamingizni kiriting" : "Enter your phone number"}</div>
        <div style={{ fontSize: 12.5, color: th.t2, textAlign: "center", lineHeight: 1.5, marginBottom: 16 }}>{lg === "uz" ? "Qarz taklifi olish va oiladoshlar sizni raqam orqali topishi uchun kerak. Keyinroq Profil bo'limida ham qo'shishingiz mumkin." : "Needed for debt requests and so family can find you by number. You can also add it later in Profile."}</div>
        <input style={{ width: "100%", background: th.surH, border: "1.5px solid " + th.bor, borderRadius: 13, padding: "12px 14px", color: th.t1, fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 12 }} value={newT} onChange={e => setNewT(e.target.value)} placeholder="+998 90 123 45 67" inputMode="tel" autoFocus />
        <button onClick={() => saveTel(newT)} style={{ width: "100%", background: th.ac, border: "none", borderRadius: 13, padding: "13px 0", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>{lg === "uz" ? "Saqlash" : "Save"}</button>
        <button onClick={onClose} style={{ width: "100%", background: "transparent", border: "none", padding: "8px 0", color: th.t2, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>{lg === "uz" ? "Keyinroq" : "Later"}</button>
      </div>
    </div>
  );
}
