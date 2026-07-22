import { createContext, useCallback, useContext, useState } from "react";

// ═══ UI-kit (Faza 0): StatTile, DataTable, Badge, Drawer, Toast,
//     Skeleton, EmptyState, Switch, ConfirmDialog ═══

// ── StatTile ──
export function StatTile({ label, value, icon, highlight }) {
  return (
    <div className={"stat" + (highlight ? " hl" : "")}>
      {icon && <div className="ic">{icon}</div>}
      <div className="k">{label}</div>
      <div className="v">{value ?? "—"}</div>
    </div>
  );
}

// ── Badge ──
export function Badge({ on, children, tone }) {
  const cls = tone || (on ? "on" : "off");
  return <span className={"badge " + cls}>{children}</span>;
}

// ── DataTable: columns = [{key, title, render?}] ──
export function DataTable({ columns, rows, keyFn, empty = "Ma'lumot yo'q" }) {
  if (!rows || rows.length === 0) return <div className="empty">{empty}</div>;
  return (
    <table className="tbl">
      <thead>
        <tr>{columns.map((c) => <th key={c.key}>{c.title}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={keyFn ? keyFn(r) : i}>
            {columns.map((c) => (
              <td key={c.key}>{c.render ? c.render(r) : r[c.key] ?? "—"}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Drawer (o'ng panel) ──
export function Drawer({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </>
  );
}

// ── Skeleton ──
export function Skeleton({ h = 16, w = "100%", style }) {
  return <div className="skel" style={{ height: h, width: w, ...style }} />;
}

// ── EmptyState ──
export function EmptyState({ icon = "📭", text = "Hech narsa topilmadi" }) {
  return (
    <div className="empty">
      <div style={{ fontSize: 34, marginBottom: 8 }}>{icon}</div>
      {text}
    </div>
  );
}

// ── Switch ──
export function Switch({ checked, onChange, disabled }) {
  return (
    <label className="switch" style={disabled ? { opacity: 0.5 } : undefined}>
      <input type="checkbox" checked={!!checked} disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)} />
      <span className="track" />
    </label>
  );
}

// ── ConfirmDialog (Drawer asosida engil tasdiqlash) ──
export function ConfirmDialog({ open, title, text, confirmLabel = "Ha", danger, onConfirm, onClose, busy }) {
  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" style={{ width: "min(360px, 92vw)" }}>
        <h3>{title}</h3>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>{text}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button className={"btn " + (danger ? "red" : "green")} disabled={busy} onClick={onConfirm}>
            {busy ? "…" : confirmLabel}
          </button>
          <button className="btn ghost" onClick={onClose}>Bekor qilish</button>
        </div>
      </div>
    </>
  );
}

// ── Toast tizimi ──
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((text, tone = "") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={"toast " + t.tone}>{t.text}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
