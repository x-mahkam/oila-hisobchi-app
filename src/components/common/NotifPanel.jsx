export default function NotifPanel({ notifs, th, lg, isKid, onClose, onMarkRead, onMarkAll, onClear, onConfirmParent, onConfirmKid }) {
  const icons = { qarz: "💸", budjet: "⚠️", xarajat: "💰", yangilik: "🎉", maqsad_confirm: "🎯", maqsad_kid_confirm: "🎁", vazifa: "🏆" };
  const colors = { qarz: th.ac, budjet: th.am, xarajat: th.rd, yangilik: th.gr, maqsad_confirm: "#f59e0b", maqsad_kid_confirm: "#22c55e", vazifa: "#8b5cf6" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 998, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ background: th.bg, width: "100%", maxWidth: 430, height: "100%", overflowY: "auto", boxShadow: "-4px 0 24px rgba(0,0,0,.3)" }} onClick={e => e.stopPropagation()}>
        <div style={{ position: "sticky", top: 0, background: th.sur, borderBottom: "1px solid " + th.bor, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: th.t1 }}>{lg === "uz" ? "Bildirishnomalar" : lg === "ru" ? "Уведомления" : "Notifications"}</div>
          <button onClick={onClose} style={{ background: th.surH, border: "none", borderRadius: "50%", width: 34, height: 34, color: th.t1, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        {notifs.length > 0 && (
          <div style={{ display: "flex", gap: 8, padding: "12px 18px", borderBottom: "1px solid " + th.bor }}>
            <button onClick={onMarkAll} style={{ flex: 1, background: th.surH, border: "1px solid " + th.bor, borderRadius: 10, padding: "8px 0", color: th.t2, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{lg === "uz" ? "Hammasini o'qilgan" : "Mark all read"}</button>
            <button onClick={onClear} style={{ flex: 1, background: th.rd + "11", border: "1px solid " + th.rd + "33", borderRadius: 10, padding: "8px 0", color: th.rd, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{lg === "uz" ? "Tozalash" : "Clear"}</button>
          </div>
        )}
        <div style={{ padding: "12px 18px 40px" }}>
          {notifs.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: th.t2 }}>
              <div style={{ fontSize: 46, marginBottom: 10, opacity: .5 }}>🔔</div>
              <div style={{ fontSize: 15 }}>{lg === "uz" ? "Bildirishnomalar yo'q" : "No notifications"}</div>
            </div>
          )}
          {notifs.map(n => {
            const c = colors[n.type] || th.ac;
            const needParentAction = n.type === "maqsad_confirm" && n.status === "pending" && !isKid;
            const needKidAction = n.type === "maqsad_kid_confirm" && n.status === "pending" && isKid;
            return (
              <div key={n.id} onClick={() => onMarkRead(n.id)} style={{ background: n.read ? th.sur : c + "0d", border: "1px solid " + (n.read ? th.bor : c + "33"), borderRadius: 14, padding: "13px 15px", marginBottom: 10, cursor: "pointer", display: "flex", gap: 12, flexDirection: "column" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: c + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icons[n.type] || "🔔"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{n.title}</span>
                      {!n.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 12, color: th.t2, marginTop: 3, lineHeight: 1.5 }}>{n.text || n.body}</div>
                    <div style={{ fontSize: 10, color: th.t2, marginTop: 5, opacity: .7 }}>{new Date(n.sana).toLocaleString("uz-UZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
                {needParentAction && (
                  <button onClick={e => { e.stopPropagation(); onConfirmParent(n); }} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22c55e,#15803d)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                    🛍️ {lg === "uz" ? "Ha, sotib berdim!" : "Yes, I bought it!"}
                  </button>
                )}
                {needKidAction && (
                  <button onClick={e => { e.stopPropagation(); onConfirmKid(n); }} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                    🎉 {lg === "uz" ? "Ha, oldim! Orzuim amalga oshdi!" : "Yes! My dream came true!"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
