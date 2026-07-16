// ═══════════════════════════════════════════════════════════
//  TO'Y KALKULYATORI — o'zbek to'yi smetasi
//  • Marosimlar zanjiri (fotiha → nikoh → kelin salom...)
//  • Mehmon kalkulyatori: to'yxona/osh narxi mehmon soniga jonli bog'liq
//  • Har modda: Reja / Fakt (kelishilgan) / Zaklad (to'langan)
//  • Jamg'arish rejasi: sana + jamg'arma → oyiga kerakli summa
//  • Maqsadlar tizimiga bir tugmada ulanadi, smeta matnini nusxalash
//  Ma'lumot: Firebase "toy_<oilaId>" kaliti
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { db } from "../firebase.js";
import { AppCard, PrimaryButton, Badge, TextInput } from "./ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, CHART } from "../utils/tokens.js";

// ── Saqlangan to'y hisobi statuslari (token rangli, emoji yo'q) ──
const WSTATUS = [
  { id: "reja",    tone: "ac" },
  { id: "jarayon", tone: "am" },
  { id: "yakun",   tone: "gr" },
];

// ── Goals sahifasidagi outline ikonkalar bilan bir uslub (emoji o'rniga) ──
const WIco = {
  save: (c, s = 15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3.5 2.5h7l2.5 2.5v8a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-10a.5.5 0 01.5-.5z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 2.5v3h5v-3M5.5 13v-3.5h5V13" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  cal:  (c, s = 12) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke={c} strokeWidth="1.3"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  trash:(c, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 4.5h10M6 4.5V3h4v1.5M4.5 4.5l.6 8a1 1 0 001 .9h3.8a1 1 0 001-.9l.6-8" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  rings:(c, s = 16) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="7.5" cy="12" r="5" stroke={c} strokeWidth="1.6"/><circle cx="12.5" cy="12" r="5" stroke={c} strokeWidth="1.6"/><path d="M7.5 7V4.5M5.5 5.5L7.5 3l2 2.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus: (c, s = 15) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 3.5v9M3.5 8h9" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  open: (c, s = 13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 3.5l4.5 4.5L6 12.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ── Marosimlar ──
const EVENTS = [
  { id: "fotiha",     e: "🤝", sides: ["qiz", "ogil"] },
  { id: "qizbazmi",   e: "💃", sides: ["qiz"] },
  { id: "nikoh",      e: "💍", sides: ["qiz", "ogil"] },
  { id: "kelinsalom", e: "🌅", sides: ["ogil"] },
  { id: "charlar",    e: "🍲", sides: ["ogil"] },
];

// ── Umumiy (bir martalik) xarajat moddalari ──
const CATS = [
  { id: "sarpo",      e: "👗" },
  { id: "taqinchoq",  e: "💎" },
  { id: "mebel",      e: "🛋️", side: "qiz" },
  { id: "fotovideo",  e: "📸" },
  { id: "sanatkor",   e: "🎤" },
  { id: "transport",  e: "🚗" },
  { id: "taklifnoma", e: "💌" },
  { id: "boshqa",     e: "📦" },
];

// ── Shablonlar: [1 kishi to'yxona, 1 kishi osh, {kategoriya: reja}] ──
const TEMPLATES = {
  ixcham: {
    e: "🌿",
    perG: 120000, oshG: 45000, guests: { fotiha: 40, qizbazmi: 50, nikoh: 120, kelinsalom: 40, charlar: 80 },
    cats: { sarpo: 15000000, taqinchoq: 10000000, mebel: 25000000, fotovideo: 6000000, sanatkor: 8000000, transport: 3000000, taklifnoma: 2000000, boshqa: 3000000 },
  },
  orta: {
    e: "⭐",
    perG: 200000, oshG: 65000, guests: { fotiha: 60, qizbazmi: 80, nikoh: 200, kelinsalom: 60, charlar: 150 },
    cats: { sarpo: 30000000, taqinchoq: 25000000, mebel: 50000000, fotovideo: 12000000, sanatkor: 20000000, transport: 6000000, taklifnoma: 4000000, boshqa: 6000000 },
  },
  katta: {
    e: "👑",
    perG: 350000, oshG: 90000, guests: { fotiha: 100, qizbazmi: 120, nikoh: 350, kelinsalom: 100, charlar: 250 },
    cats: { sarpo: 60000000, taqinchoq: 60000000, mebel: 100000000, fotovideo: 25000000, sanatkor: 60000000, transport: 12000000, taklifnoma: 8000000, boshqa: 12000000 },
  },
};

const fmt = n => (Math.round(Number(n) || 0)).toLocaleString("en-US").replace(/,/g, " ");
const num = s => Number(String(s).replace(/[^\d]/g, "")) || 0;

// Modda prognozi: fakt kelishilgan bo'lsa — fakt, aks holda reja
const fc = it => (Number(it?.fact) || 0) > 0 ? Number(it.fact) : (Number(it?.plan) || 0);

// ── Ming ajratgichli raqam kiritish ──
const NumIn = ({ value, onChange, th, placeholder, suffix }) => (
  <div style={{ position: "relative" }}>
    <input inputMode="numeric" value={value ? fmt(value) : ""} placeholder={placeholder || "0"}
      onChange={e => onChange(num(e.target.value))}
      style={{ width: "100%", boxSizing: "border-box", background: th.bg, border: "1.5px solid " + th.bor, borderRadius: 12, padding: "11px 12px", paddingRight: suffix ? 52 : 12, color: th.t1, fontSize: 15, fontWeight: 700, outline: "none", fontFamily: "inherit" }} />
    {suffix && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: th.t2, fontWeight: 700 }}>{suffix}</span>}
  </div>
);

export default function WeddingCalc({ user, th, onClose, addMq, ok$ }) {
  const { t } = useTranslation("wedding");
  const oilaId = user?.oilaId;

  const [data, setData]   = useState(null);   // null = yuklanmoqda
  const [step, setStep]   = useState(null);   // wizard: side | events | tpl
  const [wSide, setWSide] = useState("ogil");
  const [wEv, setWEv]     = useState([]);
  const [edit, setEdit]   = useState(null);   // {type:"cat"|"event", id}
  const [saved, setSaved] = useState(false);
  const saveT = useRef(null);

  // ── Saqlangan to'y hisoblari ("My Weddings") ──
  const [wName, setWName]     = useState("");
  const [wStatus, setWStatus] = useState("reja");
  const [screen, setScreen]   = useState("list");   // list | wizard | calc
  const [editingId, setEditingId] = useState(null); // qaysi saqlangan hisob tahrirlanmoqda (null = yangi)
  const savedRef = useRef([]);                 // draft qayta qurilsa ham yo'qolmaydigan durable ro'yxat
  const savedList = (data && Array.isArray(data.saved)) ? data.saved : savedRef.current;

  // ── Yuklash: har doim ro'yxat (bosh ekran) bilan ochiladi ──
  useEffect(() => {
    if (!oilaId) return;
    db.g("toy_" + oilaId).then(v => {
      if (v && Array.isArray(v.saved)) savedRef.current = v.saved;
      setData((v && v.events) ? v : false);   // tugallanmagan draft bo'lsa saqlanadi
      setScreen("list");
    }).catch(() => { setData(false); setScreen("list"); });
  }, [oilaId]);

  // ── Avtosaqlash (0.8s debounce) ──
  const patch = (fn) => setData(prev => {
    const next = fn(structuredClone(prev));
    clearTimeout(saveT.current);
    saveT.current = setTimeout(async () => {
      try { await db.s("toy_" + oilaId, { ...next, upd: Date.now() }); setSaved(true); setTimeout(() => setSaved(false), 1500); } catch {}
    }, 800);
    return next;
  });

  // ── Wizard yakuni: shablon asosida smeta yaratish ──
  const buildFromTemplate = async (tplId) => {
    const T = TEMPLATES[tplId];
    const events = {};
    EVENTS.forEach(ev => {
      const on = wEv.includes(ev.id);
      events[ev.id] = {
        on,
        guests: T.guests[ev.id] || 50,
        perG: ev.id === "charlar" ? 0 : T.perG,          // charlar odatda uyda/oshxonada
        oshG: (ev.id === "nikoh" || ev.id === "charlar" || ev.id === "fotiha") ? T.oshG : 0,
        fact: 0, dep: 0,
      };
    });
    const cats = {};
    CATS.forEach(c => {
      const relevant = !c.side || c.side === wSide;
      cats[c.id] = { plan: relevant ? (T.cats[c.id] || 0) : 0, fact: 0, dep: 0 };
    });
    const d = { side: wSide, tpl: tplId, events, cats, date: "", savedSum: 0, saved: savedRef.current, upd: Date.now() };
    setData(d); setStep(null); setScreen("calc");
    try { await db.s("toy_" + oilaId, d); } catch {}
  };

  // ── Hisob-kitoblar ──
  const calc = useMemo(() => {
    if (!data || !data.events) return null;
    let evPlan = 0, evFc = 0, dep = 0;
    Object.entries(data.events).forEach(([id, ev]) => {
      if (!ev.on) return;
      const p = (Number(ev.guests) || 0) * ((Number(ev.perG) || 0) + (Number(ev.oshG) || 0));
      evPlan += p;
      evFc += (Number(ev.fact) || 0) > 0 ? Number(ev.fact) : p;
      dep += Number(ev.dep) || 0;
    });
    let catPlan = 0, catFc = 0;
    Object.values(data.cats || {}).forEach(c => { catPlan += Number(c.plan) || 0; catFc += fc(c); dep += Number(c.dep) || 0; });
    const plan = evPlan + catPlan, forecast = evFc + catFc;
    // Jamg'arish rejasi
    let months = 0, perMonth = 0;
    if (data.date) {
      const ms = new Date(data.date) - Date.now();
      months = Math.max(1, Math.ceil(ms / (30 * 86400000)));
      perMonth = Math.max(0, (forecast - (Number(data.savedSum) || 0)) / months);
    }
    return { plan, forecast, dep, remain: Math.max(0, forecast - dep), months, perMonth };
  }, [data]);

  // ── Maqsad yaratish ──
  const makeGoal = async () => {
    if (!addMq || !calc) return;
    await addMq({
      ism: t("w001") + (data.date ? " · " + data.date : ""),
      maqsad: calc.forecast,
      rang: "#ec4899",
      shared: true,
    });
  };

  // ── Hisobni "My Weddings" ro'yxatiga saqlash (cheksiz, eskisi o'chmaydi) ──
  const saveWedding = async () => {
    if (!data || !calc) return;
    // To'liq snapshot — keyin qayta ochish uchun (marosim/xarajat maydonlari bilan)
    const snapshot = { side: data.side, tpl: data.tpl, events: structuredClone(data.events), cats: structuredClone(data.cats), date: data.date || "", savedSum: data.savedSum || 0 };
    const isEdit = editingId && savedList.some(w => w.id === editingId);
    let list;
    if (isEdit) {
      // Mavjud hisobni yangilash (dublikat yaratmaydi)
      list = savedList.map(w => w.id === editingId
        ? { ...w, name: wName.trim() || w.name, date: data.date || "", total: calc.forecast, status: wStatus, side: data.side, tpl: data.tpl, snapshot, updatedAt: new Date().toISOString() }
        : w);
    } else {
      // Yangi hisob qo'shish (cheksiz, eskisi o'chmaydi)
      list = [{
        id: Date.now(),
        name: wName.trim() || (t("w002") + (savedList.length ? " " + (savedList.length + 1) : "")),
        date: data.date || "",
        total: calc.forecast,       // jami xarajat (prognoz)
        status: wStatus,            // reja | jarayon | yakun
        side: data.side, tpl: data.tpl,
        createdAt: new Date().toISOString(),
        snapshot,
      }, ...savedList];
    }
    savedRef.current = list;
    // Draftni tozalab ro'yxatga qaytamiz
    setData(false); setStep(null); setEdit(null);
    setEditingId(null); setWName(""); setWStatus("reja"); setScreen("list");
    try { await db.s("toy_" + oilaId, { saved: list, upd: Date.now() }); } catch {}
    ok$ && ok$(isEdit ? t("w003") : t("w004"));
  };

  const delWedding = async (id) => {
    const list = savedList.filter(w => w.id !== id);
    savedRef.current = list;
    const base = (data && data.events) ? structuredClone(data) : {};
    if (data && data.events) setData({ ...base, saved: list });
    try { await db.s("toy_" + oilaId, { ...base, saved: list, upd: Date.now() }); } catch {}
    if (editingId === id) setEditingId(null);
    ok$ && ok$(t("w005"));
  };

  // ── Saqlangan to'yni qayta ochish (to'liq ma'lumot bilan) ──
  const openWedding = async (w) => {
    if (!w || !w.snapshot) return;
    const next = { ...structuredClone(w.snapshot), saved: savedRef.current, upd: Date.now() };
    setData(next); setStep(null); setEdit(null);
    setEditingId(w.id); setWName(w.name || ""); setWStatus(w.status || "reja");
    setScreen("calc");
    try { await db.s("toy_" + oilaId, next); } catch {}
  };

  // ── Yangi to'y hisoblashni boshlash (saqlanganlar saqlanib qoladi) ──
  const startNew = () => {
    setData(false); setStep("side"); setWEv([]); setEdit(null);
    setEditingId(null); setWName(""); setWStatus("reja");
    setScreen("wizard");
    db.s("toy_" + oilaId, { saved: savedRef.current, upd: Date.now() }).catch(() => {});
  };

  // ── PDF smeta (chop etish oynasi — "Save as PDF") ──
  const printSmeta = () => {
    if (!data || !calc) return;
    const rows1 = EVENTS.filter(ev => data.events[ev.id]?.on).map(ev => {
      const e = data.events[ev.id];
      const p = (e.guests || 0) * ((e.perG || 0) + (e.oshG || 0));
      return `<tr><td>${ev.e} ${t("event_" + ev.id)}</td><td style="text-align:center">${e.guests}</td><td class="r">${fmt((e.perG||0)+(e.oshG||0))}</td><td class="r"><b>${fmt(fc({ plan: p, fact: e.fact }))}</b></td><td class="r">${fmt(e.dep||0)}</td></tr>`;
    }).join("");
    const rows2 = CATS.filter(c => fc(data.cats[c.id]||{}) > 0).map(c => {
      const it = data.cats[c.id];
      return `<tr><td>${c.e} ${t("cat_" + c.id)}</td><td class="r">${fmt(it.plan||0)}</td><td class="r"><b>${fmt(fc(it))}</b></td><td class="r">${fmt(it.dep||0)}</td></tr>`;
    }).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${t("w006")}</title>
      <style>
        body{font-family:'Segoe UI',Arial,sans-serif;color:#1f2430;padding:26px;max-width:720px;margin:0 auto}
        h1{font-size:21px;margin:0 0 2px;color:#be185d} .sub{font-size:12px;color:#6b7280;margin-bottom:18px}
        h2{font-size:14px;margin:20px 0 8px;color:#374151}
        table{width:100%;border-collapse:collapse;font-size:12.5px}
        th,td{border:1px solid #e5e7eb;padding:7px 9px;text-align:left} th{background:#fdf2f8;font-size:11px}
        .r{text-align:right} .tot{margin-top:18px;border-top:2px solid #be185d;padding-top:10px;font-size:13.5px;line-height:2}
        .tot b{float:right}
      </style></head><body>
      <h1>💒 ${t("w007")}</h1>
      <div class="sub">${t(data.side === "qiz" ? "w043" : "w041")}${data.date ? " · " + t("w073") + ": " + data.date : ""} · ${new Date().toLocaleDateString("ru-RU")}</div>
      <h2>🎪 ${t("w008")}</h2>
      <table><tr><th>${t("w009")}</th><th>${t("w010")}</th><th class="r">${t("w011")}</th><th class="r">${t("w012")}</th><th class="r">${t("w013")}</th></tr>${rows1}</table>
      <h2>🧾 ${t("w014")}</h2>
      <table><tr><th>${t("w015")}</th><th class="r">${t("w016")}</th><th class="r">${t("w012")}</th><th class="r">${t("w013")}</th></tr>${rows2}</table>
      <div class="tot">
        ${t("w075")}: <b>${fmt(calc.forecast)} ${t("w017")}</b><br/>
        ${t("w077")}: <b>${fmt(calc.dep)} ${t("w017")}</b><br/>
        ${t("w079")}: <b>${fmt(calc.remain)} ${t("w017")}</b>
        ${data.date && calc.months > 0 ? `<br/>${t("w018")}: <b>${fmt(calc.perMonth)} ${t("w019")} × ${calc.months} ${t("w020")}</b>` : ""}
      </div>
      <div style="margin-top:22px;font-size:10px;color:#9ca3af">Oila Hisobchi · ${t("w021")}</div>
      </body></html>`;
    try {
      const fr = document.createElement("iframe");
      fr.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden";
      document.body.appendChild(fr);
      fr.srcdoc = html;
      fr.onload = () => {
        try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch {}
        setTimeout(() => document.body.removeChild(fr), 4000);
      };
    } catch { ok$ && ok$(t("w022"), "err"); }
  };

  // ── Smetani nusxalash ──
  const copySmeta = async () => {
    if (!data || !calc) return;
    const lines = [t("w023"), ""];
    EVENTS.forEach(ev => {
      const e = data.events[ev.id];
      if (!e?.on) return;
      const p = (e.guests || 0) * ((e.perG || 0) + (e.oshG || 0));
      lines.push(`${ev.e} ${t("event_" + ev.id)} — ${e.guests} ${t("w024")}: ${fmt(fc({ plan: p, fact: e.fact }))} ${t("w017")}${e.dep ? ` (${t("w025")}: ${fmt(e.dep)})` : ""}`);
    });
    lines.push("");
    CATS.forEach(c => {
      const it = data.cats[c.id];
      if (!it || fc(it) === 0) return;
      lines.push(`${c.e} ${t("cat_" + c.id)}: ${fmt(fc(it))} ${t("w017")}${it.dep ? ` (${t("w025")}: ${fmt(it.dep)})` : ""}`);
    });
    lines.push("", `${t("w076")}: ${fmt(calc.forecast)} ${t("w017")}`, `${t("w078")}: ${fmt(calc.dep)}`, `${t("w080")}: ${fmt(calc.remain)}`);
    try { await navigator.clipboard.writeText(lines.join("\n")); ok$ && ok$(t("w026")); } catch { ok$ && ok$(t("w027"), "err"); }
  };

  const P = { pink: "#ec4899", vio: "#a855f7" };
  const card = { background: th.sur, border: "1px solid " + th.bor, borderRadius: 18, padding: "14px 14px", marginBottom: 12 };
  const btnP = { border: "none", cursor: "pointer", fontFamily: "inherit", borderRadius: 14, fontWeight: 800 };

  // ══════════ RENDER ══════════
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, maxWidth: 480, margin: "0 auto", background: th.bg, overflowY: "auto", fontFamily: "inherit" }}>
      <style>{`@keyframes wcPop{0%{transform:translateY(10px);opacity:0}100%{transform:translateY(0);opacity:1}}`}</style>

      {/* ── Sarlavha ── */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 8px", position: "sticky", top: 0, background: th.bg + "ee", backdropFilter: "blur(8px)", zIndex: 5 }}>
        <button onClick={() => { if (screen === "list") onClose(); else { setScreen("list"); setStep(null); } }} style={{ ...btnP, width: 40, height: 40, borderRadius: 12, background: th.sur, border: "1px solid " + th.bor, color: th.t1, fontSize: 17 }}>←</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: th.t1 }}>💒 {t("w028")}</div>
          {saved && <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>✓ {t("w029")}</div>}
        </div>
        <div style={{ width: 40 }} />
      </div>

      {data === null && <div style={{ textAlign: "center", padding: "60px 0", color: th.t2 }}>{t("w030")}</div>}

      {/* ══ BOSH EKRAN: Mening to'ylarim ro'yxati (maqsadlar sahifasidek) ══ */}
      {screen === "list" && data !== null && (
        <div style={{ padding: "6px 16px 50px", animation: "wcPop .25s ease" }}>
          {/* Yangi to'y hisoblash */}
          <PrimaryButton th={th} onClick={startNew} style={{ marginBottom: SPACE.s3 }}>{WIco.plus("#fff", 16)}{t("w031")}</PrimaryButton>

          {/* Tugallanmagan hisob (davom etish) */}
          {data && data.events && (
            <AppCard th={th} onClick={() => setScreen("calc")} style={{ border: "1.5px dashed " + CHART[3] + ALPHA.strong, marginBottom: SPACE.s3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
                <div style={{ width: SPACE.s8 + SPACE.s2, height: SPACE.s8 + SPACE.s2, borderRadius: RADIUS.s + 2, background: CHART[3] + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{WIco.rings(CHART[3], 20)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...TYPE.subtitle, color: th.t1 }}>{t("w032")}</div>
                  <div style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: CHART[3], fontWeight: 700, marginTop: SPACE.s1, display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{WIco.open(CHART[3])}{t("w033")}</div>
                </div>
              </div>
            </AppCard>
          )}

          {savedList.length > 0 ? (
            <>
              <div style={{ ...TYPE.tiny, fontWeight: 700, letterSpacing: 1.5, color: th.t2, margin: SPACE.s2 + "px " + SPACE.s1 + "px " + SPACE.s2 + "px" }}>{t("w034")} · {savedList.length}</div>
              {savedList.map(w => {
                const st = WSTATUS.find(s => s.id === w.status) || WSTATUS[0];
                const tone = th[st.tone];
                return (
                  <AppCard th={th} key={w.id} pad={SPACE.s3} style={{ marginBottom: SPACE.s2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
                      <div onClick={() => w.snapshot && openWedding(w)} role={w.snapshot ? "button" : undefined} className={w.snapshot ? "ui-press" : undefined}
                        style={{ display: "flex", alignItems: "center", gap: SPACE.s3, flex: 1, minWidth: 0, cursor: w.snapshot ? "pointer" : "default" }}>
                        <div style={{ width: SPACE.s8 + SPACE.s2, height: SPACE.s8 + SPACE.s2, borderRadius: RADIUS.s + 2, background: CHART[3] + ALPHA.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{WIco.rings(CHART[3], 20)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ ...TYPE.subtitle, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2, marginTop: SPACE.s1 - 1, flexWrap: "wrap" }}>
                            {w.date && <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, color: th.t2, display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{WIco.cal(th.t2)}{w.date}</span>}
                            <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, fontWeight: 700, color: th.t1, fontVariantNumeric: "tabular-nums" }}>{fmt(w.total)} {t("w017")}</span>
                          </div>
                          {w.snapshot && <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: CHART[3], fontWeight: 700, marginTop: SPACE.s1, display: "inline-flex", alignItems: "center", gap: SPACE.s1 }}>{WIco.open(CHART[3])}{t("w035")}</div>}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: SPACE.s2, flexShrink: 0 }}>
                        <Badge th={th} type="status" tone={tone}>{t("status_" + st.id)}</Badge>
                        <button type="button" className="ui-press" onClick={() => delWedding(w.id)} aria-label={t("w036")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: SPACE.s1 - 2 }}>{WIco.trash(th.t2)}</button>
                      </div>
                    </div>
                  </AppCard>
                );
              })}
            </>
          ) : (!data || !data.events) && (
            <div style={{ textAlign: "center", padding: SPACE.s12 + "px " + SPACE.s6 + "px" }}>
              <div style={{ display: "inline-flex", marginBottom: SPACE.s3 }}>{WIco.rings(th.t3, 40)}</div>
              <div style={{ ...TYPE.subtitle, color: th.t1, marginBottom: SPACE.s1 }}>{t("w037")}</div>
              <div style={{ ...TYPE.caption, color: th.t2 }}>{t("w038")}</div>
            </div>
          )}
        </div>
      )}

      {/* ══ WIZARD ══ */}
      {screen === "wizard" && step === "side" && (
        <div style={{ padding: "14px 16px", animation: "wcPop .25s ease" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: th.t1, textAlign: "center", marginBottom: 4 }}>{t("w039")}</div>
          <div style={{ fontSize: 12, color: th.t2, textAlign: "center", marginBottom: 18 }}>{t("w040")}</div>
          {[
            { id: "ogil", e: "🤵", t: t("w041"), d: t("w042") },
            { id: "qiz",  e: "👰", t: t("w043"),   d: t("w044") },
          ].map(s => (
            <button key={s.id} onClick={() => { setWSide(s.id); setWEv(EVENTS.filter(e => e.sides.includes(s.id)).map(e => e.id)); setStep("events"); }}
              style={{ ...btnP, width: "100%", textAlign: "left", background: th.sur, border: "1.5px solid " + th.bor, padding: "18px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 34 }}>{s.e}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: th.t1 }}>{s.t}</span>
                <span style={{ display: "block", fontSize: 11.5, color: th.t2, marginTop: 3 }}>{s.d}</span>
              </span>
              <span style={{ color: th.t2 }}>›</span>
            </button>
          ))}
        </div>
      )}

      {screen === "wizard" && step === "events" && (
        <div style={{ padding: "14px 16px", animation: "wcPop .25s ease" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: th.t1, textAlign: "center", marginBottom: 4 }}>{t("w045")}</div>
          <div style={{ fontSize: 12, color: th.t2, textAlign: "center", marginBottom: 18 }}>{t("w046")}</div>
          {EVENTS.map(ev => {
            const on = wEv.includes(ev.id);
            return (
              <button key={ev.id} onClick={() => setWEv(v => on ? v.filter(x => x !== ev.id) : [...v, ev.id])}
                style={{ ...btnP, width: "100%", textAlign: "left", background: on ? P.pink + "14" : th.sur, border: "1.5px solid " + (on ? P.pink : th.bor), padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{ev.e}</span>
                <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: th.t1 }}>{t("event_" + ev.id)}</span>
                <span style={{ width: 24, height: 24, borderRadius: 8, border: "2px solid " + (on ? P.pink : th.bor), background: on ? P.pink : "transparent", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>{on ? "✓" : ""}</span>
              </button>
            );
          })}
          <button disabled={!wEv.length} onClick={() => setStep("tpl")} style={{ ...btnP, width: "100%", padding: 15, marginTop: 8, background: wEv.length ? `linear-gradient(135deg,${P.pink},${P.vio})` : th.bor, color: "#fff", fontSize: 15 }}>{t("w047")} →</button>
        </div>
      )}

      {screen === "wizard" && step === "tpl" && (
        <div style={{ padding: "14px 16px", animation: "wcPop .25s ease" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: th.t1, textAlign: "center", marginBottom: 4 }}>{t("w048")}</div>
          <div style={{ fontSize: 12, color: th.t2, textAlign: "center", marginBottom: 18 }}>{t("w049")}</div>
          {Object.entries(TEMPLATES).map(([id, T]) => (
            <button key={id} onClick={() => buildFromTemplate(id)}
              style={{ ...btnP, width: "100%", textAlign: "left", background: th.sur, border: "1.5px solid " + th.bor, padding: "16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 30 }}>{T.e}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: th.t1 }}>{t("tpl_" + id)}</span>
                <span style={{ display: "block", fontSize: 11.5, color: th.t2, marginTop: 2 }}>{t("tpl_" + id + "_desc")}</span>
                <span style={{ display: "block", fontSize: 11.5, color: P.pink, fontWeight: 800, marginTop: 4 }}>{t("w050")}: {fmt(T.perG)} / {t("w051")}</span>
              </span>
              <span style={{ color: th.t2 }}>›</span>
            </button>
          ))}
        </div>
      )}

      {/* ══ ASOSIY SMETA ══ */}
      {screen === "calc" && data && data.events && calc && (
        <div style={{ padding: "6px 16px 50px", animation: "wcPop .25s ease" }}>

          {/* Umumiy xulosalar */}
          <div style={{ background: `linear-gradient(135deg,${P.pink},${P.vio})`, borderRadius: 20, padding: "16px", marginBottom: 14, color: "#fff" }}>
            <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 700 }}>{t("w052")}</div>
            <div style={{ fontSize: 26, fontWeight: 800, margin: "3px 0 10px" }}>{fmt(calc.forecast)} <span style={{ fontSize: 13 }}>{t("w017")}</span></div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                [t("w016"), calc.plan],
                [t("w053"), calc.dep],
                [t("w054"), calc.remain],
              ].map(([t2, v], i) => (
                <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.16)", borderRadius: 12, padding: "7px 8px" }}>
                  <div style={{ fontSize: 9.5, opacity: 0.9 }}>{t2}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 1 }}>{fmt(v)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Hisobni saqlash (ro'yxatga qo'shiladi / yangilanadi) ── */}
          <AppCard th={th} style={{ border: "1.5px solid " + CHART[3] + ALPHA.strong, marginBottom: SPACE.s3 }}>
            <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1, display: "flex", alignItems: "center", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
              {WIco.save(CHART[3], 16)}{editingId ? t("w055") : t("w056")}
            </div>
            <TextInput th={th} value={wName} onChange={setWName} placeholder={t("w057")} style={{ marginBottom: SPACE.s3 }} />
            <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
              {WSTATUS.map(s => {
                const on = wStatus === s.id; const c = th[s.tone];
                return (
                  <button key={s.id} type="button" className="ui-press" onClick={() => setWStatus(s.id)}
                    style={{ flex: 1, background: on ? c + ALPHA.tint : "transparent", border: "1.5px solid " + (on ? c : th.bor), borderRadius: RADIUS.pill, padding: SPACE.s2 + "px 0", color: on ? c : th.t2, fontWeight: 700, fontSize: TYPE.caption.fontSize, cursor: "pointer", fontFamily: "inherit" }}>
                    {t("status_" + s.id)}
                  </button>
                );
              })}
            </div>
            <PrimaryButton th={th} onClick={saveWedding} style={{ marginBottom: 0 }}>{WIco.save("#fff", 15)}{editingId ? t("w058") : t("w059")}</PrimaryButton>
          </AppCard>

          {/* Jamg'arish rejasi */}
          <div style={{ ...card, border: "1.5px solid " + P.pink + "44" }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: th.t1, marginBottom: 10 }}>📅 {t("w060")}</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, color: th.t2, fontWeight: 700, marginBottom: 4 }}>{t("w074")}</div>
                <input type="date" value={data.date || ""} onChange={e => patch(d => { d.date = e.target.value; return d; })}
                  style={{ width: "100%", boxSizing: "border-box", background: th.bg, border: "1.5px solid " + th.bor, borderRadius: 12, padding: "10px 10px", color: th.t1, fontSize: 13.5, fontWeight: 700, outline: "none", fontFamily: "inherit", colorScheme: th.bg === "#0f172a" || th.t1 === "#fff" ? "dark" : "light" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, color: th.t2, fontWeight: 700, marginBottom: 4 }}>{t("w061")}</div>
                <NumIn th={th} value={data.savedSum} onChange={v => patch(d => { d.savedSum = v; return d; })} suffix={t("w017")} />
              </div>
            </div>
            {data.date && calc.months > 0 && (
              <div style={{ background: P.pink + "12", borderRadius: 12, padding: "10px 12px", fontSize: 12.5, color: th.t1, lineHeight: 1.6 }}>
                {t("w_savingsReminder", { months: calc.months, amount: fmt(calc.perMonth) })}
              </div>
            )}
            <button onClick={makeGoal} style={{ ...btnP, width: "100%", marginTop: 10, padding: 13, background: `linear-gradient(135deg,${P.pink},${P.vio})`, color: "#fff", fontSize: 13.5 }}>🎯 {t("w062")}</button>
          </div>

          {/* ── Marosimlar (mehmon kalkulyatori) ── */}
          <div style={{ fontSize: 14, fontWeight: 800, color: th.t1, margin: "16px 2px 10px" }}>🎪 {t("w063")}</div>
          {EVENTS.map(ev => {
            const e = data.events[ev.id];
            if (!e) return null;
            const evPlan = (e.guests || 0) * ((e.perG || 0) + (e.oshG || 0));
            return (
              <div key={ev.id} style={{ ...card, opacity: e.on ? 1 : 0.55 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{ev.e}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: th.t1 }}>{t("event_" + ev.id)}</div>
                    {e.on && <div style={{ fontSize: 11, color: th.t2, marginTop: 1 }}>{t("w012")}: <b style={{ color: P.pink }}>{fmt((e.fact || 0) > 0 ? e.fact : evPlan)}</b>{(e.dep || 0) > 0 && <> · {t("w025")}: {fmt(e.dep)}</>}</div>}
                  </div>
                  {/* Yoqish/o'chirish */}
                  <button onClick={() => patch(d => { d.events[ev.id].on = !d.events[ev.id].on; return d; })}
                    style={{ ...btnP, width: 44, height: 26, borderRadius: 20, background: e.on ? P.pink : th.bor, position: "relative", transition: "background .2s" }}>
                    <span style={{ position: "absolute", top: 3, left: e.on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                  </button>
                </div>
                {e.on && (
                  <>
                    {/* Mehmonlar slayderi */}
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, color: th.t2, marginBottom: 4 }}>
                        <span>👥 {t("w064")}</span><b style={{ color: th.t1, fontSize: 13 }}>{e.guests}</b>
                      </div>
                      <input type="range" min="10" max="600" step="10" value={e.guests}
                        onChange={ev2 => patch(d => { d.events[ev.id].guests = Number(ev2.target.value); return d; })}
                        style={{ width: "100%", accentColor: P.pink }} />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 3 }}>🏛 {t("w065")}</div>
                        <NumIn th={th} value={e.perG} onChange={v => patch(d => { d.events[ev.id].perG = v; return d; })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 3 }}>🍚 {t("w066")}</div>
                        <NumIn th={th} value={e.oshG} onChange={v => patch(d => { d.events[ev.id].oshG = v; return d; })} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 3 }}>{t("w067")}</div>
                        <NumIn th={th} value={e.fact} onChange={v => patch(d => { d.events[ev.id].fact = v; return d; })} placeholder={fmt(evPlan)} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 3 }}>💵 {t("w053")}</div>
                        <NumIn th={th} value={e.dep} onChange={v => patch(d => { d.events[ev.id].dep = v; return d; })} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* ── Umumiy xarajatlar (Reja/Fakt/Zaklad) ── */}
          <div style={{ fontSize: 14, fontWeight: 800, color: th.t1, margin: "16px 2px 10px" }}>🧾 {t("w014")}</div>
          {CATS.map(c => {
            const it = data.cats[c.id] || { plan: 0, fact: 0, dep: 0 };
            const open = edit === c.id;
            return (
              <div key={c.id} style={{ ...card, padding: open ? "14px" : "12px 14px" }}>
                <div onClick={() => setEdit(open ? null : c.id)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <span style={{ fontSize: 20 }}>{c.e}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: th.t1 }}>{t("cat_" + c.id)}</div>
                    <div style={{ fontSize: 10.5, color: th.t2, marginTop: 1 }}>
                      {t("w016")}: {fmt(it.plan)}{(it.fact || 0) > 0 && <> · <b style={{ color: P.pink }}>{t("w068")}: {fmt(it.fact)}</b></>}{(it.dep || 0) > 0 && <> · {t("w025")}: {fmt(it.dep)}</>}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: th.t2, transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
                </div>
                {open && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {[["plan", t("w016")], ["fact", t("w068")], ["dep", t("w013")]].map(([k, t2]) => (
                      <div key={k} style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 3 }}>{t2}</div>
                        <NumIn th={th} value={it[k]} onChange={v => patch(d => { if (!d.cats[c.id]) d.cats[c.id] = { plan: 0, fact: 0, dep: 0 }; d.cats[c.id][k] = v; return d; })} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Pastki amallar ── */}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={printSmeta} style={{ ...btnP, flex: 1.4, padding: 14, background: `linear-gradient(135deg,${P.pink},${P.vio})`, color: "#fff", fontSize: 13 }}>🖨️ {t("w069")}</button>
            <button onClick={copySmeta} style={{ ...btnP, flex: 1.2, padding: 14, background: th.sur, border: "1.5px solid " + th.bor, color: th.t1, fontSize: 13 }}>📋 {t("w070")}</button>
            <button onClick={() => { if (confirm(t("w071"))) { setData(false); setStep("side"); setWEv([]); setEditingId(null); setWName(""); setWStatus("reja"); setScreen("wizard"); db.s("toy_" + oilaId, { saved: savedRef.current, upd: Date.now() }).catch(() => {}); } }}
              style={{ ...btnP, flex: 0.8, padding: 14, background: "transparent", border: "1.5px solid " + th.bor, color: th.t2, fontSize: 13 }}>🔄</button>
          </div>
          <div style={{ fontSize: 10.5, color: th.t2, textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
            {t("w072")}
          </div>
        </div>
      )}
    </div>
  );
}
