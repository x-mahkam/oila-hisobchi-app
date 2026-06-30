export default function MaqsadConfirmModal({ info, th, lg, f, STY, onBought, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: th.sur, borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: th.t1, marginBottom: 8 }}>
            {lg === "uz" ? "Maqsadga yetdingiz!" : "Goal reached!"}
          </div>
          <div style={{ fontSize: 13, color: th.t2, lineHeight: 1.6 }}>
            "{info.maqsadIsm}" — {f(info.summa, true)}<br />
            {lg === "uz" ? "Xarid qildingizmi?" : "Did you buy it?"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onCancel(info)} style={{ flex: 1, background: "transparent", border: "1.5px solid " + th.bor, borderRadius: 14, padding: "13px", color: th.t2, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            {lg === "uz" ? "Yo'q, voz kechdim" : "No, cancel"}
          </button>
          <button onClick={() => onBought(info)} style={{ flex: 2, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 14, padding: "13px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            ✅ {lg === "uz" ? "Ha, xarid qildim!" : "Yes, I bought it!"}
          </button>
        </div>
      </div>
    </div>
  );
}
