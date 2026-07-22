import { useQuery } from "../../lib/useQuery.js";
import { StatTile, DataTable, Skeleton } from "../../shared/ui.jsx";

function fmtT(ms) {
  if (!ms) return "—";
  try { return new Date(Number(ms)).toLocaleDateString("uz"); } catch { return String(ms); }
}

export default function AnalyticsPage() {
  const { data: d, loading, error, reload } = useQuery("adminAnalytics");

  return (
    <div>
      <div className="toolbar">
        <button className="btn ghost sm" onClick={() => reload()}>↻ Yangilash</button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && !d ? (
        <div className="stat-grid">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={92} />)}</div>
      ) : d ? (
        <>
          {/* ── Retention ── */}
          <div className="stat-grid">
            <StatTile label="7 kunlik retention" icon="🔁" highlight
              value={d.retention.d7.pct == null ? "—" : d.retention.d7.pct + "%"} />
            <StatTile label="7 kun: faol / jami" icon="👥"
              value={`${d.retention.d7.retained} / ${d.retention.d7.eligible}`} />
            <StatTile label="30 kunlik retention" icon="📈"
              value={d.retention.d30.pct == null ? "—" : d.retention.d30.pct + "%"} />
            <StatTile label="30 kun: faol / jami" icon="👥"
              value={`${d.retention.d30.retained} / ${d.retention.d30.eligible}`} />
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12, margin: "8px 2px 0" }}>
            Retention — ro'yxatdan o'tganiga 7/30 kundan oshgan foydalanuvchilarning qanchasi so'nggi
            7/30 kunda ilovani ochgani. Faollik ma'lumoti ilovaning yangi versiyasidan yig'iladi —
            dastlab ko'rsatkichlar past ko'rinishi tabiiy.
          </div>

          {/* ── Feature usage ── */}
          <div className="panel" style={{ marginTop: 18 }}>
            <h2>Funksiyalardan foydalanish (nechta oila)</h2>
            {(() => {
              const max = Math.max(1, ...d.features.map((f) => f.families));
              return d.features.map((f) => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>{f.label}</span>
                    <span style={{ color: "var(--muted)" }}>{f.families} oila</span>
                  </div>
                  <div style={{ height: 10, background: "var(--panel-2)", borderRadius: 6 }}>
                    <div style={{ height: "100%", width: Math.round((f.families / max) * 100) + "%", background: "var(--accent)", borderRadius: 6 }} />
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* ── Top ro'yxatlar ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, marginTop: 18 }}>
            <div className="panel">
              <h2>🏆 Eng faol foydalanuvchilar (tranzaksiya)</h2>
              <DataTable
                keyFn={(r) => r.uid}
                empty="Ma'lumot yo'q"
                columns={[
                  { key: "ism", title: "Ism" },
                  { key: "rol", title: "Rol" },
                  { key: "tx", title: "Tranzaksiya", render: (r) => <b>{r.tx}</b> },
                  { key: "la", title: "Oxirgi faollik", render: (r) => fmtT(r.lastActive) },
                ]}
                rows={d.topUsers}
              />
            </div>
            <div className="panel">
              <h2>🏆 Eng faol oilalar (tranzaksiya)</h2>
              <DataTable
                keyFn={(r) => r.oilaId}
                empty="Ma'lumot yo'q"
                columns={[
                  { key: "nomi", title: "Oila", render: (r) => r.nomi || "—" },
                  { key: "oilaId", title: "ID", render: (r) => <span className="mono" style={{ fontSize: 11 }}>{r.oilaId}</span> },
                  { key: "tx", title: "Tranzaksiya", render: (r) => <b>{r.tx}</b> },
                ]}
                rows={d.topFamilies}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
