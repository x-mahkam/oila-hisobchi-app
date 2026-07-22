import { useState } from "react";
import { call } from "../../lib/firebase.js";
import { useQuery } from "../../lib/useQuery.js";
import { StatTile, DataTable, Badge, ConfirmDialog, Skeleton, useToast } from "../../shared/ui.jsx";
import { downloadCsv, stamp } from "../../lib/csv.js";

function fmtT(ms) {
  if (!ms) return "—";
  try { return new Date(Number(ms)).toLocaleDateString("uz"); } catch { return String(ms); }
}

const GRANT_DAYS = [
  { id: 7, label: "1 hafta" },
  { id: 30, label: "1 oy" },
  { id: 90, label: "3 oy" },
  { id: 365, label: "1 yil" },
  { id: 36500, label: "Umrbod" },
];

export default function PremiumPage() {
  const { data: d, loading, error, reload } = useQuery("adminPremiumOverview");
  const promoQ = useQuery("adminPromo", { op: "list" });
  const toast = useToast();

  // Manual premium berish formasi
  const [grantOila, setGrantOila] = useState("");
  const [grantDays, setGrantDays] = useState(365);
  const [grantBusy, setGrantBusy] = useState(false);

  // Promo yaratish formasi
  const [pCode, setPCode] = useState("");
  const [pDays, setPDays] = useState(30);
  const [pMax, setPMax] = useState(10);
  const [pNote, setPNote] = useState("");
  const [pBusy, setPBusy] = useState(false);

  const [confirm, setConfirm] = useState(null); // {type:"revoke"|"promoDel", ...}
  const [busy, setBusy] = useState(false);

  const grant = async () => {
    const oilaId = grantOila.trim();
    if (!oilaId) return toast("Oila ID kiriting", "err");
    setGrantBusy(true);
    try {
      await call("adminSetPremium", { oilaId, enable: true, days: grantDays });
      toast(`Premium berildi: ${oilaId} (${grantDays} kun)`, "ok");
      setGrantOila("");
      reload();
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setGrantBusy(false); }
  };

  const createPromo = async () => {
    setPBusy(true);
    try {
      const res = await call("adminPromo", { op: "create", code: pCode, days: pDays, maxUses: pMax, note: pNote });
      toast("Promo kod yaratildi: " + res.code, "ok");
      setPCode(""); setPNote("");
      promoQ.reload({ op: "list" });
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setPBusy(false); }
  };

  const togglePromo = async (code) => {
    try {
      await call("adminPromo", { op: "toggle", code });
      promoQ.reload({ op: "list" });
    } catch (e) { toast("Xato: " + e.message, "err"); }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.type === "revoke") {
        await call("adminSetPremium", { oilaId: confirm.oilaId, enable: false });
        toast("Premium olib qo'yildi", "ok");
        reload();
      } else if (confirm.type === "promoDel") {
        await call("adminPromo", { op: "delete", code: confirm.code });
        toast("Promo kod o'chirildi", "ok");
        promoQ.reload({ op: "list" });
      }
      setConfirm(null);
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="toolbar">
        <button className="btn ghost sm" onClick={() => { reload(); promoQ.reload({ op: "list" }); }}>↻ Yangilash</button>
        <button className="btn ghost sm" disabled={!d?.families?.length}
          onClick={() => downloadCsv("premium-oilalar-" + stamp(), [
            { key: "nomi", title: "Oila nomi" },
            { key: "oilaId", title: "Oila ID" },
            { key: "members", title: "A'zolar" },
            { key: "product", title: "Mahsulot" },
            { key: "expiresAt", title: "Tugash sanasi", value: (r) => r.expiresAt ? new Date(Number(r.expiresAt)).toISOString().slice(0, 10) : "" },
            { key: "daysLeft", title: "Qolgan kun" },
          ], d.families)}>
          ⬇ CSV
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && !d ? (
        <div className="stat-grid">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={92} />)}</div>
      ) : d ? (
        <>
          <div className="stat-grid">
            <StatTile label="Premium oilalar" value={d.total} icon="⭐" highlight />
            <StatTile label="7 kunda tugaydi" value={d.expiringIn7} icon="⏳" />
            <StatTile label="30 kunda tugaydi" value={d.expiringIn30} icon="📅" />
            <StatTile label="Promo (faol / ishlatilgan)" value={`${d.promoActive} / ${d.promoUses}`} icon="🎟️" />
          </div>

          {/* ── Manual premium berish ── */}
          <div className="panel" style={{ marginTop: 18 }}>
            <h2>Qo'lda premium berish</h2>
            <div className="toolbar" style={{ marginBottom: 0 }}>
              <input className="input grow" placeholder="Oila ID (masalan o1a2b3c4...)"
                value={grantOila} onChange={(e) => setGrantOila(e.target.value)} />
              <select className="select" style={{ width: 130 }} value={grantDays}
                onChange={(e) => setGrantDays(Number(e.target.value))}>
                {GRANT_DAYS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
              <button className="btn sm green" disabled={grantBusy} onClick={grant}>
                {grantBusy ? "…" : "⭐ Berish"}
              </button>
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 8 }}>
              Oila ID'ni "Oilalar" bo'limidan nusxalash mumkin. Amal audit logga yoziladi.
            </div>
          </div>

          {/* ── Premium oilalar jadvali ── */}
          <div className="panel" style={{ marginTop: 18 }}>
            <h2>Premium oilalar ({d.total})</h2>
            <DataTable
              keyFn={(r) => r.oilaId}
              empty="Hozircha premium oila yo'q"
              columns={[
                { key: "nomi", title: "Oila", render: (r) => r.nomi || "—" },
                { key: "oilaId", title: "ID", render: (r) => <span className="mono">{r.oilaId}</span> },
                { key: "members", title: "A'zolar" },
                { key: "product", title: "Mahsulot", render: (r) => <span className="mono" style={{ fontSize: 11 }}>{r.product}</span> },
                { key: "expiresAt", title: "Tugaydi", render: (r) => fmtT(r.expiresAt) },
                {
                  key: "daysLeft", title: "Qoldi",
                  render: (r) => r.daysLeft == null ? "—" : (
                    <Badge tone={r.daysLeft <= 7 ? "warn" : "on"}>
                      {r.daysLeft > 36000 ? "Umrbod" : r.daysLeft + " kun"}
                    </Badge>
                  ),
                },
                {
                  key: "act", title: "",
                  render: (r) => (
                    <button className="btn red sm" onClick={() => setConfirm({ type: "revoke", oilaId: r.oilaId, nomi: r.nomi })}>
                      Olib qo'yish
                    </button>
                  ),
                },
              ]}
              rows={d.families}
            />
          </div>
        </>
      ) : null}

      {/* ── Promo kodlar ── */}
      <div className="panel" style={{ marginTop: 18 }}>
        <h2>🎟️ Promo kodlar</h2>
        <div className="toolbar">
          <input className="input" style={{ width: 160 }} placeholder="Kod (bo'sh = avto)"
            value={pCode} onChange={(e) => setPCode(e.target.value.toUpperCase())} />
          <select className="select" style={{ width: 120 }} value={pDays} onChange={(e) => setPDays(Number(e.target.value))}>
            {GRANT_DAYS.filter((g) => g.id <= 365).map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
          <input className="input" style={{ width: 110 }} type="number" min="1" placeholder="Limit"
            value={pMax} onChange={(e) => setPMax(Number(e.target.value) || 1)} title="Necha marta ishlatilishi mumkin" />
          <input className="input grow" placeholder="Izoh (ixtiyoriy)"
            value={pNote} onChange={(e) => setPNote(e.target.value)} />
          <button className="btn sm" disabled={pBusy} onClick={createPromo}>{pBusy ? "…" : "+ Yaratish"}</button>
        </div>
        <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 12 }}>
          Foydalanuvchi kodni ilovada kiritganda oilasiga belgilangan kunga premium beriladi
          (har oila bitta koddan bir marta). Limit — kod jami necha oila tomonidan ishlatilishi mumkinligi.
        </div>
        <DataTable
          keyFn={(r) => r.code}
          empty="Promo kod hali yaratilmagan"
          columns={[
            { key: "code", title: "Kod", render: (r) => <span className="mono" style={{ fontWeight: 700 }}>{r.code}</span> },
            { key: "days", title: "Muddat", render: (r) => r.days + " kun" },
            { key: "used", title: "Ishlatilgan", render: (r) => `${r.usedCount} / ${r.maxUses}` },
            { key: "createdAt", title: "Yaratilgan", render: (r) => fmtT(r.createdAt) },
            { key: "note", title: "Izoh", render: (r) => r.note || "—" },
            {
              key: "active", title: "Holat",
              render: (r) => <Badge tone={r.active ? "on" : "warn"}>{r.active ? "Faol" : "O'chiq"}</Badge>,
            },
            {
              key: "act", title: "",
              render: (r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn ghost sm" onClick={() => togglePromo(r.code)}>
                    {r.active ? "O'chirish" : "Yoqish"}
                  </button>
                  <button className="btn red sm" onClick={() => setConfirm({ type: "promoDel", code: r.code })}>🗑</button>
                </div>
              ),
            },
          ]}
          rows={promoQ.data?.promos || []}
        />
      </div>

      <ConfirmDialog
        open={!!confirm}
        danger
        title={confirm?.type === "revoke" ? "Premiumni olib qo'yish" : "Promo kodni o'chirish"}
        text={
          confirm?.type === "revoke"
            ? `"${confirm.nomi || confirm.oilaId}" oilasidan premium olib qo'yilsinmi?`
            : `"${confirm?.code}" promo kodi o'chirilsinmi? (Ishlatgan oilalarning premiumi bekor bo'lmaydi)`
        }
        confirmLabel="Ha"
        busy={busy}
        onConfirm={runConfirm}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
