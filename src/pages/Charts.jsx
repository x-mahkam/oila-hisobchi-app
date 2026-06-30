import { useMemo } from "react";
import { Heat } from "../components/common/index.jsx";
import { makeS } from "../utils/styles.js";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ChartsPage({
  // Data
  xar, dar,
  // State
  dark, lg,
  ctab, setCtab,
  lineD, barD, pieD, jX, bdj, jD, bX, bD,
  f, t,
  ...props
}) {
  const th = props.th;
  const S = useMemo(() => makeS(th), [th]);

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: th.t1 }}>{t.chart}</div>
      <div style={{ display: "flex", gap: 5, marginBottom: 16, background: th.bg, borderRadius: 13, padding: 4 }}>
        {[{ id: "line", l: lg === "uz" ? "Trend" : "Trend" }, { id: "bar", l: lg === "uz" ? "Oylik" : "Monthly" }, { id: "pie", l: lg === "uz" ? "Taqsimot" : "Distribution" }].map(tb => (
          <button key={tb.id} onClick={() => setCtab(tb.id)} style={{ flex: 1, background: ctab === tb.id ? th.sur : "transparent", border: ctab === tb.id ? "1px solid " + th.bor : "1px solid transparent", borderRadius: 10, padding: "8px 2px", color: ctab === tb.id ? th.ac : th.t2, cursor: "pointer", fontWeight: 700, fontSize: 11 }}>{tb.l}</button>
        ))}
      </div>

      {ctab === "line" && (
        <div style={S.cd}>
          <div style={{ fontSize: 12, fontWeight: 600, color: th.t2, marginBottom: 12 }}>{t.l7}</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineD} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={th.bor} />
              <XAxis dataKey="k" tick={{ fontSize: 10, fill: th.t2 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: th.t2 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 12, color: th.t1, fontSize: 12 }} formatter={v => [v + "K", ""]} />
              <Line type="monotone" dataKey="x" stroke={th.rd} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="d" stroke={th.gr} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: th.rd, fontWeight: 600 }}>-- {t.exp}</span>
            <span style={{ fontSize: 11, color: th.gr, fontWeight: 600 }}>-- {t.inc}</span>
          </div>
        </div>
      )}

      {ctab === "bar" && (
        <div style={S.cd}>
          <div style={{ fontSize: 12, fontWeight: 600, color: th.t2, marginBottom: 12 }}>{t.l6}</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barD} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={th.bor} />
              <XAxis dataKey="o" tick={{ fontSize: 10, fill: th.t2 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: th.t2 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 12, color: th.t1, fontSize: 12 }} formatter={v => [v + "K", ""]} />
              <Bar dataKey="v" fill={th.ac} radius={[7, 7, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {ctab === "pie" && (
        <div style={S.cd}>
          <div style={{ fontSize: 12, fontWeight: 600, color: th.t2, marginBottom: 12 }}>{t.bc}</div>
          {pieD.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: th.t2 }}>--</div>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieD} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {pieD.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 12, color: th.t1, fontSize: 12 }} formatter={v => [f(v), ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
                {pieD.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, background: th.bg, borderRadius: 10, padding: "7px 10px" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: th.t1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: th.t2 }}>{jX > 0 ? Math.round(d.value / jX * 100) : 0}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ ...S.cd, marginTop: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: th.t2, marginBottom: 12 }}>{t.hm}</div>
        <Heat xar={xar} ac={th.ac} />
      </div>

      <div style={S.cd}>
        <div style={{ fontSize: 12, fontWeight: 600, color: th.t2, marginBottom: 10 }}>{t.st}</div>
        {[
          { l: t.ad, v: f(Math.round(jX / Math.max(1, new Date().getDate())), true) },
          { l: t.ir, v: jX > 0 ? (jD / jX).toFixed(2) + "x" : "--" },
          { l: t.bs, v: f(Math.max(0, bdj - jX), true) },
          { l: t.rc, v: (bX.length + bD.length) + " ta" },
        ].map(item => (
          <div key={item.l} style={{ ...S.row, padding: "8px 0", borderBottom: "1px solid " + th.bor }}>
            <span style={{ fontSize: 12, color: th.t2 }}>{item.l}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: th.ac }}>{item.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
