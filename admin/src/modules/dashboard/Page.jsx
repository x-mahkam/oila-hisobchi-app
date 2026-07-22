import { useEffect } from "react";
import { useQuery } from "../../lib/useQuery.js";
import { StatTile, DataTable, Skeleton } from "../../shared/ui.jsx";

function fmtDate(s) {
  if (!s) return "—";
  try { return new Date(s).toLocaleString("uz"); } catch { return String(s); }
}

export default function DashboardPage({ initialStats }) {
  const { data, setData, loading, error, reload } = useQuery("adminStats", undefined, { enabled: !initialStats });

  // App darajasida allaqachon olingan statistika bo'lsa — qayta so'ramaymiz
  useEffect(() => { if (initialStats) setData(initialStats); }, [initialStats, setData]);

  const d = data;

  return (
    <div>
      <div className="toolbar">
        <button className="btn ghost sm" onClick={() => reload()}>↻ Yangilash</button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && !d ? (
        <div className="stat-grid">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={92} />)}
        </div>
      ) : d ? (
        <>
          <div className="stat-grid">
            <StatTile label="Jami foydalanuvchi" value={d.totalUsers} icon="👥" />
            <StatTile label="Kattalar" value={d.adults} icon="🧑" />
            <StatTile label="Bolalar" value={d.kids} icon="🧒" />
            <StatTile label="Jami oila" value={d.totalFamilies} icon="🏠" />
            <StatTile label="Premium oila" value={d.premiumFamilies} icon="⭐" highlight />
            <StatTile label="Jami a'zolik" value={d.totalMembers} icon="🔗" />
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <h2>Oxirgi ro'yxatdan o'tganlar</h2>
            <DataTable
              columns={[
                { key: "ism", title: "Ism" },
                { key: "email", title: "Email" },
                { key: "rol", title: "Rol" },
                { key: "oilaId", title: "Oila", render: (r) => <span className="mono">{r.oilaId || "—"}</span> },
                { key: "registeredAt", title: "Sana", render: (r) => fmtDate(r.registeredAt) },
              ]}
              rows={d.recent}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
