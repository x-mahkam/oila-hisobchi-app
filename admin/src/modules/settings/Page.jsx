import { useEffect, useState } from "react";
import { call } from "../../lib/firebase.js";
import { Badge, Skeleton, Switch, useToast } from "../../shared/ui.jsx";

// Feature flag ta'riflari. live=true — ilovaga allaqachon ulangan;
// live=false — flag saqlanadi, ilova keyingi versiyada o'qiydi.
const FLAG_DEFS = [
  { key: "bilim", label: "🎓 Bilim Bozori (o'yinlar)", live: true },
  { key: "garden", label: "🌳 Baraka Bog'i", live: false },
  { key: "ai", label: "🤖 AI maslahatchi", live: false },
  { key: "wedding", label: "💍 To'y kalkulyatori", live: false },
  { key: "kidsGames", label: "🧒 Bolalar o'yinlari", live: false },
];

export default function SettingsPage() {
  const toast = useToast();
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [maintOn, setMaintOn] = useState(false);
  const [maintMsg, setMaintMsg] = useState("");
  const [minVersion, setMinVersion] = useState("");
  const [forceUpdate, setForceUpdate] = useState(false);
  const [flags, setFlags] = useState({});
  const [testers, setTesters] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const d = await call("adminConfig", { op: "get" });
      setCfg(d);
      setMaintOn(d.maintenance?.on === true);
      setMaintMsg(d.maintenance?.message || "");
      setMinVersion(d.minVersion || "");
      setForceUpdate(d.forceUpdate === true);
      const f = {};
      for (const def of FLAG_DEFS) f[def.key] = (d.flags?.[def.key] !== false);
      setFlags(f);
      setTesters(Array.isArray(d.testers) ? d.testers.join(", ") : "");
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const save = async () => {
    setSaving(true);
    try {
      await call("adminConfig", {
        op: "set",
        patch: {
          maintenance: { on: maintOn, message: maintMsg },
          minVersion, forceUpdate,
          flags,
          testers: testers.split(",").map((x) => x.trim()).filter(Boolean),
        },
      });
      toast("Sozlamalar saqlandi — ilovalar bir necha soniyada oladi (jonli)", "ok");
      load();
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setSaving(false); }
  };

  if (loading && !cfg) {
    return <div>{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={90} style={{ marginBottom: 12 }} />)}</div>;
  }

  return (
    <div>
      <div className="toolbar">
        <button className="btn ghost sm" onClick={load}>↻ Yangilash</button>
        <span style={{ flex: 1 }} />
        <button className="btn green sm" disabled={saving} onClick={save}>
          {saving ? "Saqlanmoqda…" : "💾 Saqlash"}
        </button>
      </div>

      {/* ── Maintenance ── */}
      <div className="panel">
        <h2>🛠️ Texnik tanaffus (Maintenance Mode)</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <Switch checked={maintOn} onChange={setMaintOn} />
          <span>{maintOn ? "YOQILGAN — foydalanuvchilar ilovaga kira olmaydi!" : "O'chiq — ilova normal ishlayapti"}</span>
          {maintOn && <Badge tone="warn">DIQQAT</Badge>}
        </div>
        <textarea className="textarea" placeholder="Foydalanuvchiga ko'rinadigan xabar (ixtiyoriy)…"
          value={maintMsg} onChange={(e) => setMaintMsg(e.target.value)} style={{ width: "100%" }} />
        <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
          Yoqilganda ilova ochiq turgan foydalanuvchilarda ham bir necha soniyada "Texnik ishlar" ekrani chiqadi (jonli).
        </div>
      </div>

      {/* ── Majburiy yangilash ── */}
      <div className="panel" style={{ marginTop: 18 }}>
        <h2>⬆️ Majburiy yangilash</h2>
        <div className="toolbar" style={{ marginBottom: 6 }}>
          <input className="input" style={{ width: 170 }} placeholder="Minimal versiya (1.2.0)"
            value={minVersion} onChange={(e) => setMinVersion(e.target.value)} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Switch checked={forceUpdate} onChange={setForceUpdate} />
            <span>Majburiy (eski versiya ishlamay qoladi)</span>
          </div>
        </div>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>
          Ilova versiyasi minimal versiyadan past bo'lsa va "Majburiy" yoqiq bo'lsa — foydalanuvchi
          Play Market'dan yangilamaguncha ilovadan foydalana olmaydi. Hozirgi ilova versiyasi: 1.0.0.
        </div>
      </div>

      {/* ── Feature Flags ── */}
      <div className="panel" style={{ marginTop: 18 }}>
        <h2>🚦 Feature Flags — funksiyalarni kod yozmasdan yoqish/o'chirish</h2>
        {FLAG_DEFS.map((def) => (
          <div key={def.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
            <Switch checked={flags[def.key] !== false}
              onChange={(v) => setFlags((p) => ({ ...p, [def.key]: v }))} />
            <span style={{ flex: 1 }}>{def.label}</span>
            {def.live
              ? <Badge tone="on">ilovaga ulangan</Badge>
              : <Badge tone="off">keyingi ilova versiyasida</Badge>}
          </div>
        ))}
        <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 8 }}>
          O'chirilgan funksiya foydalanuvchi ilovasida yashiriladi. "Ilovaga ulangan" belgisi bor
          flaglar hozirdanoq jonli ishlaydi; qolganlari ilovaning keyingi yangilanishida kuchga kiradi.
        </div>
      </div>

      {/* ── Sinovchilar ── */}
      <div className="panel" style={{ marginTop: 18 }}>
        <h2>🧪 Sinovchilar (test rejimi)</h2>
        <input className="input" style={{ width: "100%" }}
          placeholder="Foydalanuvchi ID'lari, vergul bilan (masalan: zw3vVzJD..., abc123...)"
          value={testers} onChange={(e) => setTesters(e.target.value)} />
        <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 8 }}>
          Bog' o'yinidagi CHEAT tugmasi va test-reklama FAQAT shu ro'yxatdagi foydalanuvchilarga
          ko'rinadi. O'z ilova hisobingiz ID'sini "Foydalanuvchilar" bo'limidan (UID ustuni) nusxalang.
          Bo'sh qoldirilsa — hech kimga ko'rinmaydi.
        </div>
      </div>
    </div>
  );
}
