import { useState } from "react";
import { call } from "../../lib/firebase.js";
import { useQuery } from "../../lib/useQuery.js";
import { DataTable, Badge, Drawer, useToast } from "../../shared/ui.jsx";

function fmtT(ms) {
  if (!ms) return "—";
  try { return new Date(Number(ms)).toLocaleString("uz"); } catch { return String(ms); }
}

const STATUS = {
  new: ["Yangi", "warn"],
  answered: ["Javob berilgan", "on"],
  closed: ["Yopilgan", "off"],
};

const FILTERS = [
  { id: "", label: "Barchasi" },
  { id: "new", label: "🆕 Yangi" },
  { id: "answered", label: "✅ Javob berilgan" },
  { id: "closed", label: "📁 Yopilgan" },
];

export default function SupportPage() {
  const toast = useToast();
  const [filter, setFilter] = useState("");
  const { data, loading, error, reload } = useQuery("adminSupport", { op: "list", status: "" });

  const [sel, setSel] = useState(null); // ochiq murojaat
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);

  const pick = (f) => { setFilter(f); reload({ op: "list", status: f }); };

  const sendReply = async () => {
    const text = replyText.trim();
    if (!text || !sel) return;
    setBusy(true);
    try {
      await call("adminSupport", { op: "reply", id: sel.id, text });
      toast("Javob yuborildi — foydalanuvchiga bildirishnoma + push boradi", "ok");
      setSel((s) => s && ({
        ...s, status: "answered",
        messages: [...s.messages, { from: "admin", text, t: Date.now() }],
      }));
      setReplyText("");
      reload({ op: "list", status: filter });
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setBusy(false); }
  };

  const setStatus = async (status) => {
    if (!sel) return;
    setBusy(true);
    try {
      await call("adminSupport", { op: "setStatus", id: sel.id, status });
      setSel((s) => s && ({ ...s, status }));
      reload({ op: "list", status: filter });
      toast("Holat: " + (STATUS[status]?.[0] || status), "ok");
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setBusy(false); }
  };

  const rows = data?.tickets || [];

  return (
    <div>
      <div className="toolbar">
        {FILTERS.map((f) => (
          <button key={f.id} className={"btn sm " + (filter === f.id ? "" : "ghost")} onClick={() => pick(f.id)}>
            {f.label}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        {data?.newCount > 0 && <Badge tone="warn">{data.newCount} ta yangi</Badge>}
        <button className="btn ghost sm" onClick={() => reload({ op: "list", status: filter })}>↻</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="panel">
        <h2>Murojaatlar {rows.length ? `(${rows.length})` : ""}</h2>
        {loading && rows.length === 0 ? (
          <div className="loading">Yuklanmoqda…</div>
        ) : (
          <DataTable
            keyFn={(r) => r.id}
            empty="Murojaat yo'q — foydalanuvchilar ilovadagi Yordam oynasidan yozadi"
            columns={[
              { key: "t", title: "Sana", render: (r) => fmtT(r.t) },
              {
                key: "kim", title: "Kim",
                render: (r) => (
                  <button className="btn ghost sm" style={{ border: "none", padding: "2px 4px", fontWeight: 600 }}
                    onClick={() => { setSel(r); setReplyText(""); }}>
                    {r.ism || r.email || "(nomsiz)"}
                  </button>
                ),
              },
              {
                key: "text", title: "Murojaat",
                render: (r) => <span style={{ color: "var(--muted)" }}>{r.text.slice(0, 60)}{r.text.length > 60 ? "…" : ""}</span>,
              },
              { key: "lg", title: "Til", render: (r) => (r.lg || "—").toUpperCase() },
              {
                key: "status", title: "Holat",
                render: (r) => {
                  const [lb, tone] = STATUS[r.status] || [r.status, "off"];
                  return <Badge tone={tone}>{lb}</Badge>;
                },
              },
            ]}
            rows={rows}
          />
        )}
      </div>

      {/* ── Suhbat drawer ── */}
      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? (sel.ism || sel.email || "Murojaat") : ""}>
        {sel && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
              {sel.email && <div>📧 {sel.email}</div>}
              {sel.tel && <div>📞 {sel.tel}</div>}
              <div>🕐 {fmtT(sel.t)} · Til: {(sel.lg || "—").toUpperCase()}</div>
              {sel.oilaId && <div className="mono" style={{ fontSize: 11 }}>Oila: {sel.oilaId}</div>}
            </div>

            {/* Suhbat */}
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
              {sel.messages.map((m, i) => (
                <div key={i} style={{
                  marginBottom: 8, padding: "8px 12px", borderRadius: 10, fontSize: 13,
                  background: m.from === "admin" ? "var(--accent)" : "var(--panel-2)",
                  color: m.from === "admin" ? "#fff" : "var(--text)",
                  marginLeft: m.from === "admin" ? 24 : 0,
                  marginRight: m.from === "admin" ? 0 : 24,
                }}>
                  <div>{m.text}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{fmtT(m.t)}</div>
                </div>
              ))}
            </div>

            {/* Javob yozish */}
            <textarea className="textarea" rows={3} placeholder="Javob yozing…"
              value={replyText} onChange={(e) => setReplyText(e.target.value)} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn green sm" style={{ flex: 1 }} disabled={busy || !replyText.trim()} onClick={sendReply}>
                {busy ? "…" : "💬 Javob yuborish"}
              </button>
              {sel.status !== "closed"
                ? <button className="btn ghost sm" disabled={busy} onClick={() => setStatus("closed")}>📁 Yopish</button>
                : <button className="btn ghost sm" disabled={busy} onClick={() => setStatus("new")}>Qayta ochish</button>}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 8 }}>
              Javob foydalanuvchiga ilova ichida bildirishnoma va push bo'lib boradi.
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
