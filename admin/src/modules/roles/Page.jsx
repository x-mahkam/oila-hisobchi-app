import { useState } from "react";
import { call } from "../../lib/firebase.js";
import { useQuery } from "../../lib/useQuery.js";
import { ROLES } from "../../lib/rbac.js";
import { DataTable, Badge, ConfirmDialog, useToast } from "../../shared/ui.jsx";

function fmtT(ms) {
  if (!ms) return "—";
  try { return new Date(Number(ms)).toLocaleDateString("uz"); } catch { return String(ms); }
}

const ROLE_BADGE = {
  super_admin: "warn",
  admin: "on",
  moderator: "off",
  support: "off",
};

export default function RolesPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useQuery("adminRoles", { op: "list" });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null); // {uid, email}

  const addAdmin = async () => {
    if (!email.trim()) return toast("Email kiriting", "err");
    setBusy(true);
    try {
      await call("adminRoles", { op: "set", email: email.trim(), role });
      toast(`Rol berildi: ${email.trim()} → ${ROLES[role]?.label || role}`, "ok");
      setEmail("");
      reload({ op: "list" });
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setBusy(false); }
  };

  const removeAdmin = async () => {
    if (!removing) return;
    setBusy(true);
    try {
      await call("adminRoles", { op: "remove", uid: removing.uid });
      toast("Rol olib tashlandi", "ok");
      setRemoving(null);
      reload({ op: "list" });
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setBusy(false); }
  };

  const grantableRoles = Object.keys(ROLES).filter((r) => r !== "super_admin");

  return (
    <div>
      {error && <div className="error">{error}</div>}

      {/* ── Yangi admin qo'shish ── */}
      <div className="panel">
        <h2>➕ Admin qo'shish</h2>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <input className="input grow" type="email" placeholder="Foydalanuvchi emaili (ilovada ro'yxatdan o'tgan)"
            value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAdmin()} />
          <select className="select" style={{ width: 150 }} value={role} onChange={(e) => setRole(e.target.value)}>
            {grantableRoles.map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
          </select>
          <button className="btn sm green" disabled={busy} onClick={addAdmin}>{busy ? "…" : "Berish"}</button>
        </div>
        <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 8 }}>
          Super Admin faqat serverdagi ADMIN_UIDS (GitHub secret) orqali beriladi — bosh kalit.
          Bu yerda berilgan rollar darhol kuchga kiradi; server har amalda rolni qayta tekshiradi.
        </div>
      </div>

      {/* ── Ruxsatlar jadvali (ma'lumot uchun) ── */}
      <div className="panel" style={{ marginTop: 18 }}>
        <h2>Rollar va ruxsatlari</h2>
        {Object.entries(ROLES).map(([key, def]) => (
          <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
            <Badge tone={ROLE_BADGE[key] || "off"}>{def.label}</Badge>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>
              {def.permissions.includes("*") ? "Hamma narsa (cheklovsiz)" : def.permissions.join(" · ")}
            </span>
          </div>
        ))}
      </div>

      {/* ── Mavjud adminlar ── */}
      <div className="panel" style={{ marginTop: 18 }}>
        <h2>Adminlar ro'yxati</h2>
        {loading && !data ? (
          <div className="loading">Yuklanmoqda…</div>
        ) : (
          <DataTable
            keyFn={(r) => r.uid}
            empty="Admin yo'q"
            columns={[
              { key: "email", title: "Email", render: (r) => r.email || <span className="mono" style={{ fontSize: 11 }}>{r.uid}</span> },
              {
                key: "role", title: "Rol",
                render: (r) => <Badge tone={ROLE_BADGE[r.role] || "off"}>{ROLES[r.role]?.label || r.role}</Badge>,
              },
              { key: "t", title: "Berilgan", render: (r) => r.fixed ? "server (env)" : fmtT(r.t) },
              {
                key: "act", title: "",
                render: (r) => r.fixed
                  ? <span style={{ color: "var(--muted)", fontSize: 11 }}>o'zgarmas</span>
                  : <button className="btn red sm" onClick={() => setRemoving(r)}>Olib tashlash</button>,
              },
            ]}
            rows={data?.admins || []}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!removing}
        danger
        title="Rolni olib tashlash"
        text={`"${removing?.email || removing?.uid}" admin huquqidan mahrum qilinsinmi? U admin panelga kira olmaydi.`}
        confirmLabel="Ha, olib tashla"
        busy={busy}
        onConfirm={removeAdmin}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}
