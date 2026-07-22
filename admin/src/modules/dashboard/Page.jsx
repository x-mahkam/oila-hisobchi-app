import { useMemo, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useQuery } from "../../lib/useQuery.js";
import { StatTile, DataTable, Skeleton, Badge } from "../../shared/ui.jsx";

function fmtDate(s) {
  if (!s) return "—";
  try { return new Date(s).toLocaleString("uz"); } catch { return String(s); }
}
function fmtT(ms) {
  if (!ms) return "—";
  try { return new Date(Number(ms)).toLocaleString("uz"); } catch { return String(ms); }
}

const ACTION_LABELS = {
  "premium.grant": ["⭐ Premium berildi", "on"],
  "premium.revoke": ["Premium olib qo'yildi", "warn"],
  "i18n.save": ["🌐 Tarjima saqlandi", "on"],
};

const RANGES = [
  { id: 7, label: "7 kun" },
  { id: 30, label: "30 kun" },
  { id: 90, label: "90 kun" },
];

export default function DashboardPage() {
  const { data: d, loading, error, reload } = useQuery("adminDashboard");
  const [range, setRange] = useState(30);

  const series = useMemo(() => {
    if (!d?.regSeries) return [];
    return d.regSeries.slice(-range).map((p) => ({ ...p, label: p.day.slice(5) }));
  }, [d, range]);

  const totalInRange = useMemo(() => series.reduce((s, p) => s + p.count, 0), [series]);

  return (
    <div>
      <div className="toolbar">
        <button className="btn ghost sm" onClick={() => reload()}>↻ Yangilash</button>
        {d && <span style={{ color: "var(--muted)", fontSize: 12 }}>Yangilandi: {fmtT(d.generatedAt)}</span>}
      </div>

      {error && <div className="error">{error}</div>}

      {loading && !d ? (
        <div className="stat-grid">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} h={92} />)}
        </div>
      ) : d ? (
        <>
          {/* ── Asosiy raqamlar ── */}
          <div className="stat-grid">
            <StatTile label="Jami foydalanuvchi" value={d.totalUsers} icon="👥" />
            <StatTile label="Jami oila" value={d.totalFamilies} icon="🏠" />
            <StatTile label="Premium oila" value={d.premiumFamilies} icon="⭐" highlight />
            <StatTile label="Bolalar" value={d.kids} icon="🧒" />
            <StatTile label="DAU (kunlik)" value={d.dau} icon="📅" />
            <StatTile label="WAU (haftalik)" value={d.wau} icon="🗓️" />
            <StatTile label="MAU (oylik)" value={d.mau} icon="📈" />
            <StatTile
              label="Platforma (30 kun)"
              icon="📱"
              value={Object.entries(d.platforms || {}).map(([k, v]) => `${k}: ${v}`).join(" · ") || "—"}
            />
          </div>

          {/* ── Ro'yxatdan o'tish grafigi ── */}
          <div className="panel" style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <h2 style={{ margin: 0, flex: 1 }}>Yangi ro'yxatdan o'tishlar ({totalInRange} ta / {range} kun)</h2>
              {RANGES.map((r) => (
                <button key={r.id}
                  className={"btn sm " + (range === r.id ? "" : "ghost")}
                  onClick={() => setRange(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <AreaChart data={series} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }}
                    tickLine={false} axisLine={{ stroke: "var(--line)" }} minTickGap={28} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 11 }}
                    tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, color: "var(--text)", fontSize: 12 }}
                    labelStyle={{ color: "var(--muted)" }}
                    formatter={(v) => [v + " ta", "Ro'yxatdan o'tish"]}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} fill="url(#regGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, marginTop: 18 }}>
            {/* ── Activity feed ── */}
            <div className="panel">
              <h2>So'nggi admin amallari</h2>
              {(!d.activity || d.activity.length === 0) ? (
                <div className="empty">Hozircha amal yo'q — premium berish yoki tarjima saqlash shu yerda ko'rinadi</div>
              ) : (
                <div>
                  {d.activity.map((a, i) => {
                    const [label, tone] = ACTION_LABELS[a.action] || [a.action, "off"];
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
                        <Badge tone={tone}>{label}</Badge>
                        <span className="mono" style={{ color: "var(--muted)", fontSize: 11, flex: 1 }}>
                          {a.detail?.oilaId || a.detail?.lang || ""}
                        </span>
                        <span style={{ color: "var(--muted)", fontSize: 11 }}>{fmtT(a.t)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Tillar taqsimoti ── */}
            <div className="panel">
              <h2>Faol foydalanuvchi tillari (30 kun)</h2>
              {Object.keys(d.langs || {}).length === 0 ? (
                <div className="empty">Ma'lumot hali yig'ilmoqda — ilova yangi versiyasi ochilganda paydo bo'ladi</div>
              ) : (
                Object.entries(d.langs).sort((a, b) => b[1] - a[1]).map(([lang, n]) => {
                  const pct = d.mau ? Math.round((n / d.mau) * 100) : 0;
                  return (
                    <div key={lang} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span>{lang.toUpperCase()}</span>
                        <span style={{ color: "var(--muted)" }}>{n} ta · {pct}%</span>
                      </div>
                      <div style={{ height: 8, background: "var(--panel-2)", borderRadius: 6 }}>
                        <div style={{ height: "100%", width: pct + "%", background: "var(--accent)", borderRadius: 6 }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Oxirgi ro'yxatdan o'tganlar ── */}
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
