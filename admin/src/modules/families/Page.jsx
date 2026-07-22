import { useState } from "react";
import { call } from "../../lib/firebase.js";
import { useQuery } from "../../lib/useQuery.js";
import { DataTable, Badge, ConfirmDialog, Skeleton, useToast } from "../../shared/ui.jsx";

function fmtExp(ms) {
  if (!ms) return "—";
  try { return new Date(Number(ms)).toLocaleDateString("uz"); } catch { return String(ms); }
}

export default function FamiliesPage() {
  const [search, setSearch] = useState("");
  const { data, loading, error, reload } = useQuery("adminListFamilies", { search: "" });
  const toast = useToast();

  const [confirm, setConfirm] = useState(null); // {row, enable}
  const [busy, setBusy] = useState(false);

  const doSearch = () => reload({ search });

  const togglePremium = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await call("adminSetPremium", { oilaId: confirm.row.oilaId, enable: confirm.enable, days: 365 });
      toast(confirm.enable ? "Premium berildi ⭐" : "Premium olib qo'yildi", "ok");
      setConfirm(null);
      reload({ search });
    } catch (e) {
      toast("Xato: " + (e.message || ""), "err");
    } finally {
      setBusy(false);
    }
  };

  const rows = data?.families || [];

  return (
    <div>
      <div className="toolbar">
        <input
          className="input grow"
          placeholder="Oila nomi yoki ID bo'yicha qidirish…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
        />
        <button className="btn sm" onClick={doSearch}>Qidirish</button>
        <button className="btn ghost sm" onClick={() => { setSearch(""); reload({ search: "" }); }}>Tozalash</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="panel">
        <h2>Oilalar {data?.total ? `(${data.total})` : ""}</h2>
        {loading && rows.length === 0 ? (
          <div>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={40} style={{ marginBottom: 8 }} />)}</div>
        ) : (
          <DataTable
            keyFn={(r) => r.oilaId}
            empty="Oila topilmadi"
            columns={[
              { key: "nomi", title: "Nomi" },
              { key: "oilaId", title: "Oila ID", render: (r) => <span className="mono">{r.oilaId}</span> },
              { key: "members", title: "A'zolar" },
              { key: "premium", title: "Premium", render: (r) => <Badge on={r.premium}>{r.premium ? "Premium" : "Bepul"}</Badge> },
              { key: "exp", title: "Muddat", render: (r) => (r.premium ? fmtExp(r.premiumExpiresAt) : "—") },
              {
                key: "act", title: "",
                render: (r) => (
                  <button
                    className={"btn sm " + (r.premium ? "red" : "green")}
                    onClick={() => setConfirm({ row: r, enable: !r.premium })}
                  >
                    {r.premium ? "Olib qo'yish" : "Premium berish"}
                  </button>
                ),
              },
            ]}
            rows={rows}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        danger={confirm && !confirm.enable}
        title={confirm?.enable ? "Premium berish" : "Premiumni olib qo'yish"}
        text={confirm ? `"${confirm.row.nomi || confirm.row.oilaId}" oilasi uchun tasdiqlaysizmi?` : ""}
        confirmLabel={confirm?.enable ? "Berish (1 yil)" : "Olib qo'yish"}
        busy={busy}
        onConfirm={togglePremium}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
