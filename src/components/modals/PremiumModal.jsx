export default function PremiumModal({ th, STY, lg, onActivate, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: th.sur, borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 430 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💎</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: th.t1, marginBottom: 4 }}>{lg === "uz" ? "Premium versiya" : "Premium Version"}</div>
          <div style={{ fontSize: 13, color: th.t2 }}>{lg === "uz" ? "Barcha funksiyalarni oching!" : "Unlock all features!"}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: lg === "uz" ? "Bepul" : "Free", items: lg === "uz" ? ["3 ta maqsad", "2 oila a'zo", "Asosiy hisobot"] : ["3 goals", "2 members", "Basic report"] },
            { label: "Premium", items: lg === "uz" ? ["♾️ Cheksiz maqsad", "👨‍👩‍👧 Cheksiz a'zo", "📄 PDF/Excel", "🎤 Ovoz kiritish", "📷 QR skaner"] : ["♾️ Unlimited goals", "👨‍👩‍👧 Unlimited members", "📄 PDF/Excel", "🎤 Voice input", "📷 QR scanner"] },
          ].map((plan, pi) => (
            <div key={pi} style={{ background: pi === 1 ? "linear-gradient(135deg," + th.ac + "22," + th.ac2 + "11)" : th.surH, border: "1.5px solid " + (pi === 1 ? th.ac : th.bor), borderRadius: 16, padding: "14px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: pi === 1 ? th.ac : th.t2, marginBottom: 10, textAlign: "center" }}>{plan.label}</div>
              {plan.items.map((item, ii) => (
                <div key={ii} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 12, color: th.t1 }}>
                  <span style={{ color: pi === 1 ? th.ac : th.gr, fontSize: 14 }}>✓</span>{item}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", borderRadius: 16, padding: "14px 20px", marginBottom: 10, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.8)", marginBottom: 4 }}>{lg === "uz" ? "Premium narxi" : "Price"}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>15 000 – 25 000 {lg === "uz" ? "so'm / oy" : "UZS / month"}</div>
        </div>
        <button onClick={onActivate} style={{ ...STY.bt(), marginBottom: 8, fontSize: 16 }}>💎 {lg === "uz" ? "Premium faollashtirish (Demo)" : "Activate Premium (Demo)"}</button>
        <button onClick={onClose} style={{ width: "100%", background: "transparent", border: "1px solid " + th.bor, borderRadius: 14, padding: "12px", color: th.t2, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>{lg === "uz" ? "Keyinroq" : "Later"}</button>
      </div>
    </div>
  );
}
