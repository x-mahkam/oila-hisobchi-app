import { useState } from "react";
import { call } from "../../lib/firebase.js";
import { useQuery } from "../../lib/useQuery.js";
import { DataTable, Badge, Drawer, ConfirmDialog, Skeleton, useToast } from "../../shared/ui.jsx";
import { downloadCsv, stamp } from "../../lib/csv.js";

function fmtT(ms) {
  if (!ms) return "—";
  try { return new Date(Number(ms)).toLocaleString("uz"); } catch { return String(ms); }
}
function fmtDate(s) {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("uz"); } catch { return String(s); }
}
function rolLabel(rol) {
  return rol === "bosh" ? "Oila boshlig'i" : rol === "kid" ? "Bola" : "A'zo";
}

const ROL_OPTIONS = [
  { id: "", label: "Barcha rollar" },
  { id: "bosh", label: "Oila boshlig'i" },
  { id: "azo", label: "A'zo" },
  { id: "kid", label: "Bola" },
];
const STATUS_OPTIONS = [
  { id: "", label: "Barcha holatlar" },
  { id: "active", label: "Faol" },
  { id: "blocked", label: "Bloklangan" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [rol, setRol] = useState("");
  const [status, setStatus] = useState("");
  const { data, loading, error, reload } = useQuery("adminListUsers", { search: "", rol: "", status: "" });
  const toast = useToast();

  const [sel, setSel] = useState(null);      // drawer'dagi foydalanuvchi
  const [confirm, setConfirm] = useState(null); // {type: "block"|"unblock"|"delete", user}
  const [busy, setBusy] = useState(false);

  const params = () => ({ search, rol, status });
  const doSearch = () => reload(params());

  const runAction = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.type === "delete") {
        await call("adminDeleteUser", { uid: confirm.user.uid });
        toast("Hisob o'chirildi", "ok");
      } else {
        const blocked = confirm.type === "block";
        const res = await call("adminSetUserBlocked", { uid: confirm.user.uid, blocked });
        toast(
          blocked
            ? (res.authDisabled ? "Bloklandi (kirish ham o'chirildi)" : "Bloklandi (flag)")
            : "Blokdan chiqarildi",
          "ok"
        );
      }
      setConfirm(null);
      setSel(null);
      reload(params());
    } catch (e) {
      toast("Xato: " + (e.message || ""), "err");
    } finally {
      setBusy(false);
    }
  };

  const rows = data?.users || [];

  return (
    <div>
      <div className="toolbar">
        <input className="input grow" placeholder="Ism, email, telefon, UID yoki oila ID…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()} />
        <select className="select" style={{ width: 150 }} value={rol}
          onChange={(e) => { setRol(e.target.value); reload({ search, rol: e.target.value, status }); }}>
          {ROL_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <select className="select" style={{ width: 140 }} value={status}
          onChange={(e) => { setStatus(e.target.value); reload({ search, rol, status: e.target.value }); }}>
          {STATUS_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <button className="btn sm" onClick={doSearch}>Qidirish</button>
        <button className="btn ghost sm" disabled={!rows.length}
          onClick={() => downloadCsv("foydalanuvchilar-" + stamp(), [
            { key: "ism", title: "Ism" },
            { key: "familya", title: "Familiya" },
            { key: "email", title: "Email" },
            { key: "tel", title: "Telefon" },
            { key: "rol", title: "Rol" },
            { key: "oilaId", title: "Oila ID" },
            { key: "registeredAt", title: "Ro'yxatdan o'tgan" },
            { key: "lastActiveAt", title: "Oxirgi faollik", value: (r) => r.lastActiveAt ? new Date(r.lastActiveAt).toISOString() : "" },
            { key: "platform", title: "Platforma" },
            { key: "lg", title: "Til" },
            { key: "blocked", title: "Bloklangan", value: (r) => r.blocked ? "ha" : "yo'q" },
            { key: "uid", title: "UID" },
          ], rows)}>
          ⬇ CSV
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="panel">
        <h2>
          Foydalanuvchilar
          {data ? ` (${data.matched} topildi / ${data.total} jami)` : ""}
        </h2>
        {loading && rows.length === 0 ? (
          <div>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={40} style={{ marginBottom: 8 }} />)}</div>
        ) : (
          <DataTable
            keyFn={(r) => r.uid}
            empty="Foydalanuvchi topilmadi"
            columns={[
              {
                key: "ism", title: "Ism",
                render: (r) => (
                  <button className="btn ghost sm" style={{ border: "none", padding: "2px 4px", fontWeight: 600 }}
                    onClick={() => setSel(r)}>
                    {r.ism || "(ismsiz)"} {r.familya || ""}
                  </button>
                ),
              },
              { key: "id", title: "Email / Login", render: (r) => r.email || r.login || <span className="mono">{r.uid.slice(0, 10)}…</span> },
              { key: "rol", title: "Rol", render: (r) => rolLabel(r.rol) },
              { key: "oilaId", title: "Oila", render: (r) => <span className="mono">{r.oilaId || "—"}</span> },
              { key: "lastActiveAt", title: "Oxirgi faollik", render: (r) => fmtT(r.lastActiveAt) },
              { key: "platform", title: "Platforma", render: (r) => r.platform || "—" },
              {
                key: "st", title: "Holat",
                render: (r) => <Badge on={!r.blocked} tone={r.blocked ? "warn" : "on"}>{r.blocked ? "Bloklangan" : "Faol"}</Badge>,
              },
            ]}
            rows={rows}
          />
        )}
      </div>

      {/* ── Tafsilot drawer ── */}
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? (sel.ism || "Foydalanuvchi") : ""}>
        {sel && (
          <div>
            <Info label="UID" mono value={sel.uid} />
            <Info label="Email" value={sel.email || "—"} />
            {sel.login ? <Info label="Login (bola)" mono value={sel.login} /> : null}
            <Info label="Telefon" value={sel.tel || "—"} />
            <Info label="Rol" value={rolLabel(sel.rol)} />
            <Info label="Oila ID" mono value={sel.oilaId || "—"} />
            <Info label="Ro'yxatdan o'tgan" value={fmtDate(sel.registeredAt)} />
            <Info label="Kirish usuli" value={sel.loginMethod || "email/parol"} />
            <Info label="Oxirgi faollik" value={fmtT(sel.lastActiveAt)} />
            <Info label="Platforma / Til" value={`${sel.platform || "—"} / ${(sel.lg || "—").toUpperCase()}`} />
            <Info label="Holat" value={sel.blocked ? "🚫 Bloklangan" : "✅ Faol"} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              {sel.blocked ? (
                <button className="btn green" onClick={() => setConfirm({ type: "unblock", user: sel })}>
                  Blokdan chiqarish
                </button>
              ) : (
                <button className="btn" style={{ background: "var(--warn)" }}
                  onClick={() => setConfirm({ type: "block", user: sel })}>
                  🚫 Bloklash
                </button>
              )}
              <button className="btn red" onClick={() => setConfirm({ type: "delete", user: sel })}>
                🗑️ Hisobni o'chirish
              </button>
              {sel.rol === "kid" && (
                <div className="notice" style={{ fontSize: 12 }}>
                  Bola profili: bloklash faqat belgi qo'yadi (bola alohida auth hisobisiz kiradi).
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!confirm}
        danger={confirm?.type !== "unblock"}
        title={
          confirm?.type === "delete" ? "Hisobni o'chirish"
            : confirm?.type === "block" ? "Bloklash" : "Blokdan chiqarish"
        }
        text={
          confirm
            ? confirm.type === "delete"
              ? `"${confirm.user.ism || confirm.user.uid}" hisobini BUTUNLAY o'chirasizmi? Kirish hisobi va profil o'chadi (oila moliyaviy tarixi qoladi). Bu amalni qaytarib bo'lmaydi!`
              : confirm.type === "block"
                ? `"${confirm.user.ism || confirm.user.uid}" bloklansinmi? U ilovaga kira olmaydi.`
                : `"${confirm.user.ism || confirm.user.uid}" blokdan chiqarilsinmi?`
            : ""
        }
        confirmLabel={confirm?.type === "delete" ? "Ha, o'chirish" : confirm?.type === "block" ? "Ha, bloklash" : "Ha"}
        busy={busy}
        onConfirm={runAction}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}

function Info({ label, value, mono }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>{label}</div>
      <div className={mono ? "mono" : ""} style={{ fontSize: 13, wordBreak: "break-all" }}>{value}</div>
    </div>
  );
}
