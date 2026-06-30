import { db } from "../../firebase.js";
import { td, nt } from "../../utils/formatters.js";

export default function InviteQarzModal({ inviteQarz: iq, th, lg, user, qarzTur, qarzKim, qarzSum, qarzlar, setQarzlar, ok$, t, f, onClose }) {
  const link = (window.location.origin + "/?ref=") + (user?.id || "");
  const msg = (lg === "uz" ? "Salom! Men sizga Oila Hisobchi ilovasida qarz yozmoqchiman. Ilovani o'rnating: " : "Hi! Join me on Oila Hisobchi app: ") + link;

  const saveSimple = async () => {
    const item = { id: Date.now(), uid: user.id, tur: qarzTur, kim: qarzKim.trim(), summa: Number(qarzSum), izoh: "", sana: td(), paid: false, paidSana: "" };
    const upd = [item, ...qarzlar];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    onClose();
    ok$(t.xa);
  };

  const shareVia = (platform) => {
    if (platform === "telegram") {
      window.open("https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent(msg), "_blank");
    } else {
      if (navigator.share) { navigator.share({ text: msg, url: link }).catch(() => {}); }
      else { try { navigator.clipboard.writeText(msg); ok$(lg === "uz" ? "Nusxalandi!" : "Copied!"); } catch {} }
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: th.sur, borderRadius: 24, padding: "26px 24px", width: "100%", maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ width: 60, height: 60, borderRadius: 17, background: th.am + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 12px" }}>📲</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: th.t1, marginBottom: 6 }}>{lg === "uz" ? "Bu raqam ilovada yo'q" : "Number not in app"}</div>
          <div style={{ fontSize: 13, color: th.t2, lineHeight: 1.5 }}>{lg === "uz" ? iq.tel + " raqami ilovada yo'q. Taklif yuboring!" : "This number isn't in the app yet. Invite them!"}</div>
        </div>
        <button onClick={() => shareVia("telegram")} style={{ width: "100%", background: "#2196F3", border: "none", borderRadius: 14, padding: "13px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, marginBottom: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          📩 {lg === "uz" ? "Telegram orqali taklif" : "Invite via Telegram"}
        </button>
        <button onClick={() => shareVia("other")} style={{ width: "100%", background: th.surH, border: "1px solid " + th.bor, borderRadius: 14, padding: "13px", color: th.t1, cursor: "pointer", fontWeight: 700, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          🔗 {lg === "uz" ? "Boshqa ilova orqali" : "Share via other app"}
        </button>
        <div style={{ height: 1, background: th.bor, marginBottom: 14 }} />
        <button onClick={saveSimple} style={{ width: "100%", background: "transparent", border: "1.5px solid " + th.bor, borderRadius: 14, padding: "13px", color: th.t2, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
          {lg === "uz" ? "Oddiy qarz sifatida saqlash" : "Save as simple debt"}
        </button>
      </div>
    </div>
  );
}
