import { useEffect, useMemo, useState } from "react";
import { call } from "../firebase.js";

export default function Translations() {
  const [languages, setLanguages] = useState(["uz", "en", "ru"]);
  const [lang, setLang] = useState("uz");
  const [entries, setEntries] = useState({}); // baza (server) qiymatlari
  const [changes, setChanges] = useState({}); // faqat o'zgartirilganlar
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Yangi kalit qo'shish
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const load = async (l) => {
    setLoading(true);
    setErr("");
    setMsg("");
    setChanges({});
    try {
      const res = await call("adminGetTranslations", { lang: l ?? lang });
      setEntries(res.entries || {});
      if (Array.isArray(res.languages) && res.languages.length) setLanguages(res.languages);
    } catch (e) {
      setErr(e.message || "Xato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load("uz"); }, []); // eslint-disable-line

  const onPickLang = (l) => { setLang(l); load(l); };

  const setChange = (key, val) => {
    setChanges((prev) => ({ ...prev, [key]: val }));
  };

  const addKey = () => {
    const k = newKey.trim();
    if (!k) return;
    setEntries((prev) => ({ [k]: prev[k] ?? "", ...prev }));
    setChanges((prev) => ({ ...prev, [k]: newVal }));
    setNewKey("");
    setNewVal("");
  };

  const changedKeys = Object.keys(changes);

  const save = async () => {
    if (changedKeys.length === 0) return;
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      const res = await call("adminSaveTranslations", { lang, entries: changes });
      setMsg(`Saqlandi: ${res.savedKeys} ta kalit (${lang}). Ilova keyingi ochilishda yangilanadi.`);
      // Bazani yangilaymiz, changes tozalanadi
      setEntries((prev) => ({ ...prev, ...changes }));
      setChanges({});
    } catch (e) {
      setErr(e.message || "Saqlashda xato");
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
        <select value={lang} onChange={(e) => onPickLang(e.target.value)}>
          {languages.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
        </select>
        <input
          className="grow"
          placeholder="Kalit yoki matn bo'yicha qidirish…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn ghost small" onClick={() => load()}>↻ Qayta yuklash</button>
      </div>

      {err && <div className="error">{err}</div>}
      {msg && <div className="notice">{msg}</div>}

      <div className="panel">
        <h2>Tarjimalar — {lang.toUpperCase()} ({keys.length}{search ? " topildi" : " kalit"})</h2>

        {/* Yangi kalit qo'shish */}
        <div className="tr-row" style={{ marginBottom: 16 }}>
          <input
            style={{ padding: "9px 11px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--panel2)", color: "var(--text)" }}
            placeholder="yangi_kalit"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <textarea placeholder="Qiymat (matn)" value={newVal} onChange={(e) => setNewVal(e.target.value)} />
            <button className="btn small" onClick={addKey}>+ Qo'shish</button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Yuklanmoqda…</div>
        ) : keys.length === 0 ? (
          <div className="loading">Kalit topilmadi</div>
        ) : (
          keys.map((k) => {
            const changed = Object.prototype.hasOwnProperty.call(changes, k);
            const val = changed ? changes[k] : (entries[k] ?? "");
            return (
              <div className="tr-row" key={k}>
                <div className="key">{k}</div>
                <textarea
                  className={changed ? "changed" : ""}
                  value={String(val)}
                  onChange={(e) => setChange(k, e.target.value)}
                />
              </div>
            );
          })
        )}

        <div className="save-bar">
          <div className="info">
            {changedKeys.length > 0
              ? `${changedKeys.length} ta o'zgartirilgan kalit saqlanmagan`
              : "O'zgarish yo'q"}
          </div>
          <button className="btn green small" disabled={saving || changedKeys.length === 0} onClick={save}>
            {saving ? "Saqlanmoqda…" : "💾 Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
