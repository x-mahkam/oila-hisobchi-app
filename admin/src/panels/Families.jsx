import { useEffect, useState } from "react";
import { call } from "../firebase.js";

function fmtExp(ms) {
  if (!ms) return "—";
  try { return new Date(Number(ms)).toLocaleDateString("uz"); } catch { return String(ms); }
}

export default function Families() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = async (s) => {
    setLoading(true);
    setErr("");
    try {
      const res = await call("adminListFamilies", { search: s ?? search });
      setRows(res.families || []);
      setTotal(res.total || 0);
    } catch (e) {
      setErr(e.message || "Xato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(""); }, []); // eslint-disable-line

  const togglePremium = async (row) => {
    const enable = !row.premium;
    const msg = enable
      ? `"${row.nomi || row.oilaId}" oilasiga premium berilsinmi? (1 yil)`
      : `"${row.nomi || row.oilaId}" oilasidan premium olib qo'yilsinmi?`;
    if (!window.confirm(msg)) return;
    setBusyId(row.oilaId);
    try {
      await call("adminSetPremium", { oilaId: row.oilaId, enable, days: 365 });
      await load();
    } catch (e) {
      alert("Xato: " + (e.message || ""));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <div className="toolbar">
        <input
          className="grow"
          placeholder="Oila nomi yoki ID bo'yicha qidirish…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button className="btn small" onClick={() => load()}>Qidirish</button>
        <button className="btn ghost small" onClick={() => { setSearch(""); load(""); }}>Tozalash</button>
      </div>

      {err && <div className="error">{err}</div>}

      <div className="panel">
        <h2>Oilalar {total ? `(${total})` : ""}</h2>
        {loading ? (
          <div className="loading">Yuklanmoqda…</div>
        ) : rows.length === 0 ? (
          <div className="loading">Oila topilmadi</div>
        ) : (
          <table>
            <thead>
              <tr><th>Nomi</th><th>Oila ID</th><th>A'zolar</th><th>Premium</th><th>Muddat</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.oilaId}>
                  <td>{r.nomi || "—"}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{r.oilaId}</td>
                  <td>{r.members}</td>
                  <td>
                    <span className={"badge " + (r.premium ? "on" : "off")}>
                      {r.premium ? "Premium" : "Bepul"}
                    </span>
                  </td>
                  <td>{r.premium ? fmtExp(r.premiumExpiresAt) : "—"}</td>
                  <td>
                    <button
                      className={"btn small " + (r.premium ? "red" : "green")}
                      disabled={busyId === r.oilaId}
                      onClick={() => togglePremium(r)}
                    >
                      {busyId === r.oilaId ? "…" : r.premium ? "Olib qo'yish" : "Premium berish"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
