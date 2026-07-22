import { useMemo, useState } from "react";
import { call } from "../../lib/firebase.js";
import { useQuery } from "../../lib/useQuery.js";
import { Skeleton, useToast } from "../../shared/ui.jsx";

export default function I18nPage() {
  const [lang, setLang] = useState("uz");
  const { data, setData, loading, error, reload } = useQuery("adminGetTranslations", { lang: "uz" });
  const toast = useToast();

  const [changes, setChanges] = useState({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const languages = data?.languages?.length ? data.languages : ["uz", "en", "ru"];
  const entries = data?.entries || {};

  const pickLang = (l) => {
    setLang(l);
    setChanges({});
    reload({ lang: l });
  };

  const addKey = () => {
    const k = newKey.trim();
    if (!k) return;
    setData({ ...data, entries: { [k]: entries[k] ?? "", ...entries } });
    setChanges((p) => ({ ...p, [k]: newVal }));
    setNewKey(""); setNewVal("");
  };

  const changedKeys = Object.keys(changes);

  const save = async () => {
    if (!changedKeys.length) return;
    setSaving(true);
    try {
      const res = await call("adminSaveTranslations", { lang, entries: changes });
      toast(`Saqlandi: ${res.savedKeys} ta kalit (${lang}). Ilova keyingi ochilishda yangilanadi.`, "ok");
      setData({ ...data, entries: { ...entries, ...changes } });
      setChanges({});
    } catch (e) {
      toast("Saqlashda xato: " + (e.message || ""), "err");
    } finally {
      setSaving(false);
    }
  };

  const keys = useMemo(() => {
    const all = Object.keys(entries).sort();
    const s = search.trim().toLowerCase();
    if (!s) return all;
    return all.filter((k) => {
      const v = String(changes[k] ?? entries[k] ?? "");
      return k.toLowerCase().includes(s) || v.toLowerCase().includes(s);
    });
  }, [entries, changes, search]);

  return (
    <div>
      <div className="toolbar">
        <select className="select" style={{ width: 90 }} value={lang} onChange={(e) => pickLang(e.target.value)}>
          {languages.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
        </select>
        <input className="input grow" placeholder="Kalit yoki matn bo'yicha qidirish…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn ghost sm" onClick={() => reload({ lang })}>↻ Qayta yuklash</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="panel">
        <h2>Tarjimalar — {lang.toUpperCase()} ({keys.length}{search ? " topildi" : " kalit"})</h2>

        {/* Yangi kalit qo'shish */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr auto", gap: 8, marginBottom: 16 }}>
          <input className="input" placeholder="yangi_kalit" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <input className="input" placeholder="Qiymat (matn)" value={newVal} onChange={(e) => setNewVal(e.target.value)} />
          <button className="btn sm" onClick={addKey}>+ Qo'shish</button>
        </div>

        {loading && !keys.length ? (
          <div>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={36} style={{ marginBottom: 8 }} />)}</div>
        ) : keys.length === 0 ? (
          <div className="empty">Kalit topilmadi</div>
        ) : (
          keys.map((k) => {
            const changed = Object.prototype.hasOwnProperty.call(changes, k);
            const val = changed ? changes[k] : (entries[k] ?? "");
            return (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 8, marginBottom: 8, alignItems: "start" }}>
                <div className="mono" style={{ color: "var(--muted)", paddingTop: 9, wordBreak: "break-all" }}>{k}</div>
                <textarea
                  className="input"
                  style={changed ? { borderColor: "var(--warn)", minHeight: 38 } : { minHeight: 38 }}
                  value={String(val)}
                  onChange={(e) => setChanges((p) => ({ ...p, [k]: e.target.value }))}
                />
              </div>
            );
          })
        )}

        <div style={{ position: "sticky", bottom: 0, background: "var(--panel)", borderTop: "1px solid var(--line)",
          padding: "12px 0 0", marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ color: "var(--muted)", fontSize: 12, flex: 1 }}>
            {changedKeys.length > 0 ? `${changedKeys.length} ta o'zgartirilgan kalit saqlanmagan` : "O'zgarish yo'q"}
          </div>
          <button className="btn green sm" disabled={saving || !changedKeys.length} onClick={save}>
            {saving ? "Saqlanmoqda…" : "💾 Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
