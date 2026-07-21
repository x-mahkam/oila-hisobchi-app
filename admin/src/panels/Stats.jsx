import { useEffect, useState } from "react";
import { call } from "../firebase.js";

function fmtDate(s) {
  if (!s) return "—";
  try { return new Date(s).toLocaleString("uz"); } catch { return String(s); }
}

export default function Stats({ initial, onReload }) {
  const [data, setData] = useState(initial || null);
  const [loading, setLoading] = useState(!initial);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      setData(await call("adminStats"));
    } catch (e) {
      setErr(e.message || "Xato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (!initial) load(); }, []); // eslint-disable-line

  if (loading) return <div className="loading">Statistika yuklanmoqda…</div>;
  if (err) return <div className="error">{err} <button className="btn ghost small" onClick={load}>Qayta</button></div>;
  if (!data) return null;

  const cards = [
    { k: "Jami foydalanuvchi", v: data.totalUsers },
    { k: "Kattalar", v: data.adults },
    { k: "Bolalar", v: data.kids },
    { k: "Jami oila", v: data.totalFamilies },
    { k: "Premium oila", v: data.premiumFamilies, hi: true },
    { k: "Jami a'zolik", v: data.totalMembers },
  ];

  return (
    <div>
      <div className="toolbar">
        <button className="btn ghost small" onClick={load}>↻ Yangilash</button>
      </div>
      <div className="cards">
        {cards.map((c) => (
          <div className="card" key={c.k}>
            <div className="k">{c.k}</div>
            <div className="v">{c.hi ? <small>{c.v}</small> : c.v}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>Oxirgi ro'yxatdan o'tganlar</h2>
        {(!data.recent || data.recent.length === 0) ? (
          <div className="loading">Ma'lumot yo'q</div>
        ) : (
          <table>
            <thead>
              <tr><th>Ism</th><th>Email</th><th>Rol</th><th>Oila</th><th>Sana</th></tr>
            </thead>
            <tbody>
              {data.recent.map((u, i) => (
                <tr key={i}>
                  <td>{u.ism || "—"}</td>
                  <td>{u.email || "—"}</td>
                  <td>{u.rol || "—"}</td>
                  <td>{u.oilaId || "—"}</td>
                  <td>{fmtDate(u.registeredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
