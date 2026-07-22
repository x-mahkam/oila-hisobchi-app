import { useEffect, useMemo, useRef, useState } from "react";
import { call } from "../../lib/firebase.js";
import { Badge, Skeleton, useToast } from "../../shared/ui.jsx";

// Namespace nomlari — foydalanuvchiga tushunarli yorliqlar
const NS_LABELS = {
  translation: "Asosiy ilova",
  goals: "Maqsadlar (Smart Goals)",
  budgetai: "Budget AI",
  garden: "Baraka Bog'i",
  wedding: "To'y kalkulyatori",
  bilimbozor: "Bilim Bozori",
};

export default function I18nPage() {
  const toast = useToast();

  // Meta: tillar, namespace'lar, versiyalar
  const [meta, setMeta] = useState(null);
  const [metaErr, setMetaErr] = useState("");

  const [lang, setLang] = useState("uz");
  const [ns, setNs] = useState("translation");

  // Bundle holati
  const [bundle, setBundle] = useState(null); // { version, data }
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Yangi kalit / yangi til formalari
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [newLangCode, setNewLangCode] = useState("");
  const [newLangName, setNewLangName] = useState("");
  const fileRef = useRef(null);

  const loadMeta = async () => {
    try {
      setMeta(await call("adminI18n", { op: "meta" }));
      setMetaErr("");
    } catch (e) { setMetaErr(e.message); }
  };

  const loadBundle = async (l, n) => {
    setLoading(true);
    setChanges({});
    try {
      setBundle(await call("adminI18n", { op: "get", lang: l, ns: n }));
    } catch (e) {
      toast("Xato: " + e.message, "err");
      setBundle(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadMeta(); loadBundle("uz", "translation"); }, []); // eslint-disable-line

  const pick = (l, n) => { setLang(l); setNs(n); loadBundle(l, n); };

  const entries = bundle?.data || {};
  const changedKeys = Object.keys(changes);

  const keys = useMemo(() => {
    const all = [...new Set([...Object.keys(entries), ...changedKeys])].sort();
    const s = search.trim().toLowerCase();
    if (!s) return all;
    return all.filter((k) => {
      const v = String(changes[k] ?? entries[k] ?? "");
      return k.toLowerCase().includes(s) || v.toLowerCase().includes(s);
    });
  }, [entries, changes, search]); // eslint-disable-line

  const save = async () => {
    if (!changedKeys.length) return;
    setSaving(true);
    try {
      const res = await call("adminI18n", { op: "save", lang, ns, entries: changes });
      toast(`Nashr qilindi: v${res.version} (${changedKeys.length} kalit). Ilova keyingi ochilishda oladi.`, "ok");
      setBundle((b) => ({ ...b, version: res.version, data: { ...(b?.data || {}), ...changes } }));
      setChanges({});
      loadMeta();
    } catch (e) { toast("Xato: " + e.message, "err"); }
    finally { setSaving(false); }
  };

  const addKey = () => {
    const k = newKey.trim();
    if (!k) return;
    setChanges((p) => ({ ...p, [k]: newVal }));
    setNewKey(""); setNewVal("");
  };

  const addLanguage = async () => {
    if (!newLangCode.trim()) return toast("Til kodi kiriting (masalan: kk)", "err");
    try {
      await call("adminI18n", { op: "addLanguage", code: newLangCode, name: newLangName || newLangCode.toUpperCase() });
      toast("Til qo'shildi: " + newLangCode, "ok");
      setNewLangCode(""); setNewLangName("");
      loadMeta();
    } catch (e) { toast("Xato: " + e.message, "err"); }
  };

  // ── JSON eksport / import ──
  const exportJson = () => {
    const merged = { ...entries, ...changes };
    const blob = new Blob([JSON.stringify(merged, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${lang}${ns === "translation" ? "" : "." + ns}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file) => {
    try {
      const text = await file.text();
      const obj = JSON.parse(text);
      if (typeof obj !== "object" || Array.isArray(obj)) throw new Error("JSON obyekt emas");
      const flat = {};
      let n = 0;
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string" || typeof v === "number") { flat[k] = String(v); n++; }
      }
      if (!n) throw new Error("Faylda matn kalitlari topilmadi");
      setChanges((p) => ({ ...p, ...flat }));
      toast(n + " ta kalit yuklandi — endi \"Nashr qilish\" bosing", "ok");
    } catch (e) { toast("Import xatosi: " + e.message, "err"); }
  };

  const langs = meta?.languages || [
    { code: "uz", name: "UZ", enabled: true },
    { code: "ru", name: "RU", enabled: true },
    { code: "en", name: "EN", enabled: true },
  ];
  const namespaces = meta?.namespaces || Object.keys(NS_LABELS);
  const curVersion = bundle?.version ?? 0;

  return (
    <div>
      {metaErr && <div className="error">{metaErr}</div>}

      {/* ── Til va bo'lim tanlash ── */}
      <div className="toolbar">
        <select className="select" style={{ width: 130 }} value={lang} onChange={(e) => pick(e.target.value, ns)}>
          {langs.map((l) => (
            <option key={l.code} value={l.code}>
              {(l.name || l.code.toUpperCase()) + (l.enabled === false ? " (o'chiq)" : "")}
            </option>
          ))}
        </select>
        <select className="select" style={{ width: 210 }} value={ns} onChange={(e) => pick(lang, e.target.value)}>
          {namespaces.map((n) => <option key={n} value={n}>{NS_LABELS[n] || n}</option>)}
        </select>
        <Badge tone="on">v{curVersion}</Badge>
        <input className="input grow" placeholder="Kalit yoki matn bo'yicha qidirish…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn ghost sm" onClick={() => loadBundle(lang, ns)}>↻</button>
      </div>

      {/* ── Amallar paneli ── */}
      <div className="toolbar" style={{ marginTop: -6 }}>
        <button className="btn ghost sm" onClick={exportJson}>⬇ JSON eksport</button>
        <button className="btn ghost sm" onClick={() => fileRef.current && fileRef.current.click()}>⬆ JSON import</button>
        <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) importJson(f); e.target.value = ""; }} />
        <span style={{ flex: 1 }} />
        <span style={{ color: "var(--muted)", fontSize: 12 }}>
          {changedKeys.length ? changedKeys.length + " ta o'zgarish nashr kutmoqda" : "O'zgarish yo'q"}
        </span>
        <button className="btn green sm" disabled={saving || !changedKeys.length} onClick={save}>
          {saving ? "Nashr qilinmoqda…" : "🚀 Nashr qilish"}
        </button>
      </div>

      {/* ── Yangi til qo'shish ── */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <h2>🌍 Yangi til qo'shish</h2>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <input className="input" style={{ width: 110 }} placeholder="Kod (kk)" maxLength={5}
            value={newLangCode} onChange={(e) => setNewLangCode(e.target.value.toLowerCase())} />
          <input className="input grow" placeholder="Nomi (Qazaqsha)"
            value={newLangName} onChange={(e) => setNewLangName(e.target.value)} />
          <button className="btn sm" onClick={addLanguage}>+ Qo'shish</button>
        </div>
        <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 8 }}>
          Qo'shilgach shu tilni tanlab, JSON import bilan tarjimalarni yuklang va "Nashr qilish" bosing.
        </div>
      </div>

      {/* ── Tahrirlagich ── */}
      <div className="panel">
        <h2>
          {(NS_LABELS[ns] || ns) + " — " + lang.toUpperCase() + " (" + keys.length + (search ? " topildi)" : " kalit)")}
        </h2>

        <div className="tr-row" style={{ marginBottom: 14 }}>
          <input className="input" placeholder="yangi_kalit"
            value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <div style={{ display: "flex", gap: 8 }}>
            <textarea className="textarea" placeholder="Qiymat (matn)" value={newVal}
              onChange={(e) => setNewVal(e.target.value)} />
            <button className="btn sm" onClick={addKey}>+ Qo'shish</button>
          </div>
        </div>

        {loading ? (
          <div>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={38} style={{ marginBottom: 8 }} />)}</div>
        ) : keys.length === 0 ? (
          <div className="empty">
            Bu bo'limda hali kalit yo'q. JSON import qiling yoki yuqorida yangi kalit qo'shing.
            <br /><span style={{ fontSize: 12 }}>Maslahat: mavjud tildan JSON eksport qilib, tarjima qilib, shu yerga import qilish eng tez yo'l.</span>
          </div>
        ) : (
          keys.map((k) => {
            const changed = Object.prototype.hasOwnProperty.call(changes, k);
            const val = changed ? changes[k] : (entries[k] !== undefined ? entries[k] : "");
            return (
              <div className="tr-row" key={k}>
                <div className="key">{k}{changed && <span style={{ color: "var(--warn)" }}> ●</span>}</div>
                <textarea className={"textarea" + (changed ? " changed" : "")} value={String(val)}
                  onChange={(e) => setChanges((p) => ({ ...p, [k]: e.target.value }))} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
