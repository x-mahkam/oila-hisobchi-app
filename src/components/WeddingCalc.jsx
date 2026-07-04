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
import { db } from "../firebase.js";

// ── Marosimlar ──
const EVENTS = [
  { id: "fotiha",     e: "🤝", uz: "Fotiha to'yi",  ru: "Фотиха",       sides: ["qiz", "ogil"] },
  { id: "qizbazmi",   e: "💃", uz: "Qiz bazmi",     ru: "Девичник",     sides: ["qiz"] },
  { id: "nikoh",      e: "💍", uz: "Nikoh to'yi",   ru: "Свадьба",      sides: ["qiz", "ogil"] },
  { id: "kelinsalom", e: "🌅", uz: "Kelin salom",   ru: "Келин салом",  sides: ["ogil"] },
  { id: "charlar",    e: "🍲", uz: "Charlar (osh)", ru: "Чарлар",       sides: ["ogil"] },
];

// ── Umumiy (bir martalik) xarajat moddalari ──
const CATS = [
  { id: "sarpo",      e: "👗", uz: "Sarpo va kiyimlar",   ru: "Сарпо и одежда" },
  { id: "taqinchoq",  e: "💎", uz: "Taqinchoqlar",        ru: "Украшения" },
  { id: "mebel",      e: "🛋️", uz: "Mebel-jihoz",         ru: "Мебель",        side: "qiz" },
  { id: "fotovideo",  e: "📸", uz: "Foto-video",          ru: "Фото-видео" },
  { id: "sanatkor",   e: "🎤", uz: "San'atkorlar",        ru: "Артисты" },
  { id: "transport",  e: "🚗", uz: "Transport (kortej)",  ru: "Транспорт" },
  { id: "taklifnoma", e: "💌", uz: "Taklifnoma va bezak", ru: "Приглашения и декор" },
  { id: "boshqa",     e: "📦", uz: "Boshqa xarajatlar",   ru: "Прочее" },
];

// ── Shablonlar: [1 kishi to'yxona, 1 kishi osh, {kategoriya: reja}] ──
const TEMPLATES = {
  ixcham: {
    uz: "Ixcham to'y", ru: "Скромная", e: "🌿", d: "Kichik davra, asosiy narsalar",
    perG: 120000, oshG: 45000, guests: { fotiha: 40, qizbazmi: 50, nikoh: 120, kelinsalom: 40, charlar: 80 },
    cats: { sarpo: 15000000, taqinchoq: 10000000, mebel: 25000000, fotovideo: 6000000, sanatkor: 8000000, transport: 3000000, taklifnoma: 2000000, boshqa: 3000000 },
  },
  orta: {
    uz: "O'rtacha to'y", ru: "Средняя", e: "⭐", d: "Eng ko'p tanlanadigan daraja",
    perG: 200000, oshG: 65000, guests: { fotiha: 60, qizbazmi: 80, nikoh: 200, kelinsalom: 60, charlar: 150 },
    cats: { sarpo: 30000000, taqinchoq: 25000000, mebel: 50000000, fotovideo: 12000000, sanatkor: 20000000, transport: 6000000, taklifnoma: 4000000, boshqa: 6000000 },
  },
  katta: {
    uz: "Katta to'y", ru: "Большая", e: "👑", d: "Keng davra, premium xizmatlar",
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

export default function WeddingCalc({ user, lg = "uz", th, onClose, addMq, ok$ }) {
  const L = (uz, ru = uz) => (lg === "ru" ? ru : uz);
  const oilaId = user?.oilaId;

  const [data, setData]   = useState(null);   // null = yuklanmoqda
  const [step, setStep]   = useState(null);   // wizard: side | events | tpl
  const [wSide, setWSide] = useState("ogil");
  const [wEv, setWEv]     = useState([]);
  const [edit, setEdit]   = useState(null);   // {type:"cat"|"event", id}
  const [saved, setSaved] = useState(false);
  const saveT = useRef(null);

  // ── Yuklash ──
  useEffect(() => {
    if (!oilaId) return;
    db.g("toy_" + oilaId).then(v => {
      if (v && v.events) setData(v);
      else { setData(false); setStep("side"); }
    }).catch(() => { setData(false); setStep("side"); });
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
    const d = { side: wSide, tpl: tplId, events, cats, date: "", savedSum: 0, upd: Date.now() };
    setData(d); setStep(null);
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
      ism: L("💒 To'y", "💒 Свадьба") + (data.date ? " · " + data.date : ""),
      maqsad: calc.forecast,
      rang: "#ec4899",
      shared: true,
    });
  };

  // ── PDF smeta (chop etish oynasi — "Save as PDF") ──
  const printSmeta = () => {
    if (!data || !calc) return;
    const rows1 = EVENTS.filter(ev => data.events[ev.id]?.on).map(ev => {
      const e = data.events[ev.id];
      const p = (e.guests || 0) * ((e.perG || 0) + (e.oshG || 0));
      return `<tr><td>${ev.e} ${L(ev.uz, ev.ru)}</td><td style="text-align:center">${e.guests}</td><td class="r">${fmt((e.perG||0)+(e.oshG||0))}</td><td class="r"><b>${fmt(fc({ plan: p, fact: e.fact }))}</b></td><td class="r">${fmt(e.dep||0)}</td></tr>`;
    }).join("");
    const rows2 = CATS.filter(c => fc(data.cats[c.id]||{}) > 0).map(c => {
      const it = data.cats[c.id];
      return `<tr><td>${c.e} ${L(c.uz, c.ru)}</td><td class="r">${fmt(it.plan||0)}</td><td class="r"><b>${fmt(fc(it))}</b></td><td class="r">${fmt(it.dep||0)}</td></tr>`;
    }).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${L("To'y smetasi","Смета свадьбы")}</title>
      <style>
        body{font-family:'Segoe UI',Arial,sans-serif;color:#1f2430;padding:26px;max-width:720px;margin:0 auto}
        h1{font-size:21px;margin:0 0 2px;color:#be185d} .sub{font-size:12px;color:#6b7280;margin-bottom:18px}
        h2{font-size:14px;margin:20px 0 8px;color:#374151}
        table{width:100%;border-collapse:collapse;font-size:12.5px}
        th,td{border:1px solid #e5e7eb;padding:7px 9px;text-align:left} th{background:#fdf2f8;font-size:11px}
        .r{text-align:right} .tot{margin-top:18px;border-top:2px solid #be185d;padding-top:10px;font-size:13.5px;line-height:2}
        .tot b{float:right}
      </style></head><body>
      <h1>💒 ${L("TO'Y SMETASI", "СМЕТА СВАДЬБЫ")}</h1>
      <div class="sub">${L(data.side === "qiz" ? "Qiz tomoni" : "O'g'il tomoni", data.side === "qiz" ? "Сторона невесты" : "Сторона жениха")}${data.date ? " · " + L("To'y sanasi", "Дата") + ": " + data.date : ""} · ${new Date().toLocaleDateString("ru-RU")}</div>
      <h2>🎪 ${L("Marosimlar", "Мероприятия")}</h2>
      <table><tr><th>${L("Marosim","Мероприятие")}</th><th>${L("Mehmon","Гостей")}</th><th class="r">${L("1 kishi","На чел.")}</th><th class="r">${L("Prognoz","Прогноз")}</th><th class="r">${L("Zaklad","Задаток")}</th></tr>${rows1}</table>
      <h2>🧾 ${L("Umumiy xarajatlar", "Общие расходы")}</h2>
      <table><tr><th>${L("Modda","Статья")}</th><th class="r">${L("Reja","План")}</th><th class="r">${L("Prognoz","Прогноз")}</th><th class="r">${L("Zaklad","Задаток")}</th></tr>${rows2}</table>
      <div class="tot">
        ${L("JAMI PROGNOZ","ИТОГО ПРОГНОЗ")}: <b>${fmt(calc.forecast)} ${L("so'm","сум")}</b><br/>
        ${L("To'langan zaklad","Оплачено (задаток)")}: <b>${fmt(calc.dep)} ${L("so'm","сум")}</b><br/>
        ${L("To'lanishi qolgan","Осталось оплатить")}: <b>${fmt(calc.remain)} ${L("so'm","сум")}</b>
        ${data.date && calc.months > 0 ? `<br/>${L("Jamg'arish","Накопления")}: <b>${fmt(calc.perMonth)} ${L("so'm/oy","сум/мес")} × ${calc.months} ${L("oy","мес")}</b>` : ""}
      </div>
      <div style="margin-top:22px;font-size:10px;color:#9ca3af">Oila Hisobchi · ${L("to'y kalkulyatori","свадебный калькулятор")}</div>
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
    } catch { ok$ && ok$(L("Chop etib bo'lmadi", "Не удалось"), "err"); }
  };

  // ── Smetani nusxalash ──
  const copySmeta = async () => {
    if (!data || !calc) return;
    const lines = [L("💒 TO'Y SMETASI", "💒 СМЕТА СВАДЬБЫ"), ""];
    EVENTS.forEach(ev => {
      const e = data.events[ev.id];
      if (!e?.on) return;
      const p = (e.guests || 0) * ((e.perG || 0) + (e.oshG || 0));
      lines.push(`${ev.e} ${L(ev.uz, ev.ru)} — ${e.guests} ${L("mehmon", "гостей")}: ${fmt(fc({ plan: p, fact: e.fact }))} ${L("so'm", "сум")}${e.dep ? ` (${L("zaklad", "задаток")}: ${fmt(e.dep)})` : ""}`);
    });
    lines.push("");
    CATS.forEach(c => {
      const it = data.cats[c.id];
      if (!it || fc(it) === 0) return;
      lines.push(`${c.e} ${L(c.uz, c.ru)}: ${fmt(fc(it))} ${L("so'm", "сум")}${it.dep ? ` (${L("zaklad", "задаток")}: ${fmt(it.dep)})` : ""}`);
    });
    lines.push("", `${L("JAMI PROGNOZ", "ИТОГО")}: ${fmt(calc.forecast)} ${L("so'm", "сум")}`, `${L("To'langan zaklad", "Оплачено")}: ${fmt(calc.dep)}`, `${L("To'lanishi qolgan", "Осталось")}: ${fmt(calc.remain)}`);
    try { await navigator.clipboard.writeText(lines.join("\n")); ok$ && ok$(L("📋 Smeta nusxalandi!", "📋 Смета скопирована!")); } catch { ok$ && ok$(L("Nusxalab bo'lmadi", "Не удалось"), "err"); }
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
        <button onClick={onClose} style={{ ...btnP, width: 40, height: 40, borderRadius: 12, background: th.sur, border: "1px solid " + th.bor, color: th.t1, fontSize: 17 }}>←</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: th.t1 }}>💒 {L("To'y kalkulyatori", "Свадебный калькулятор")}</div>
          {saved && <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>✓ {L("saqlandi", "сохранено")}</div>}
        </div>
        <div style={{ width: 40 }} />
      </div>

      {data === null && <div style={{ textAlign: "center", padding: "60px 0", color: th.t2 }}>{L("Yuklanmoqda...", "Загрузка...")}</div>}

      {/* ══ WIZARD ══ */}
      {step === "side" && (
        <div style={{ padding: "14px 16px", animation: "wcPop .25s ease" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: th.t1, textAlign: "center", marginBottom: 4 }}>{L("Siz qaysi tomonsiz?", "Какая вы сторона?")}</div>
          <div style={{ fontSize: 12, color: th.t2, textAlign: "center", marginBottom: 18 }}>{L("Marosim va xarajatlar shunga qarab tavsiya qilinadi", "От этого зависят рекомендации")}</div>
          {[
            { id: "ogil", e: "🤵", t: L("O'g'il tomoni", "Сторона жениха"), d: L("Nikoh to'yi, kelin salom, charlar", "Свадьба, келин салом, чарлар") },
            { id: "qiz",  e: "👰", t: L("Qiz tomoni", "Сторона невесты"),   d: L("Fotiha, qiz bazmi, sarpo-mebel", "Фотиха, девичник, приданое") },
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

      {step === "events" && (
        <div style={{ padding: "14px 16px", animation: "wcPop .25s ease" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: th.t1, textAlign: "center", marginBottom: 4 }}>{L("Qaysi marosimlar bo'ladi?", "Какие мероприятия?")}</div>
          <div style={{ fontSize: 12, color: th.t2, textAlign: "center", marginBottom: 18 }}>{L("Keyin ham o'zgartirish mumkin", "Можно изменить позже")}</div>
          {EVENTS.map(ev => {
            const on = wEv.includes(ev.id);
            return (
              <button key={ev.id} onClick={() => setWEv(v => on ? v.filter(x => x !== ev.id) : [...v, ev.id])}
                style={{ ...btnP, width: "100%", textAlign: "left", background: on ? P.pink + "14" : th.sur, border: "1.5px solid " + (on ? P.pink : th.bor), padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{ev.e}</span>
                <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: th.t1 }}>{L(ev.uz, ev.ru)}</span>
                <span style={{ width: 24, height: 24, borderRadius: 8, border: "2px solid " + (on ? P.pink : th.bor), background: on ? P.pink : "transparent", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>{on ? "✓" : ""}</span>
              </button>
            );
          })}
          <button disabled={!wEv.length} onClick={() => setStep("tpl")} style={{ ...btnP, width: "100%", padding: 15, marginTop: 8, background: wEv.length ? `linear-gradient(135deg,${P.pink},${P.vio})` : th.bor, color: "#fff", fontSize: 15 }}>{L("Davom etish", "Продолжить")} →</button>
        </div>
      )}

      {step === "tpl" && (
        <div style={{ padding: "14px 16px", animation: "wcPop .25s ease" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: th.t1, textAlign: "center", marginBottom: 4 }}>{L("To'y darajasini tanlang", "Выберите уровень")}</div>
          <div style={{ fontSize: 12, color: th.t2, textAlign: "center", marginBottom: 18 }}>{L("O'rtacha bozor narxlari bilan to'ldiriladi — hammasini o'zingiz tahrirlaysiz", "Заполнится средними ценами — всё редактируется")}</div>
          {Object.entries(TEMPLATES).map(([id, T]) => (
            <button key={id} onClick={() => buildFromTemplate(id)}
              style={{ ...btnP, width: "100%", textAlign: "left", background: th.sur, border: "1.5px solid " + th.bor, padding: "16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 30 }}>{T.e}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: th.t1 }}>{L(T.uz, T.ru)}</span>
                <span style={{ display: "block", fontSize: 11.5, color: th.t2, marginTop: 2 }}>{T.d}</span>
                <span style={{ display: "block", fontSize: 11.5, color: P.pink, fontWeight: 800, marginTop: 4 }}>{L("To'yxona", "Зал")}: {fmt(T.perG)} / {L("kishi", "чел")}</span>
              </span>
              <span style={{ color: th.t2 }}>›</span>
            </button>
          ))}
        </div>
      )}

      {/* ══ ASOSIY SMETA ══ */}
      {data && data.events && !step && calc && (
        <div style={{ padding: "6px 16px 50px", animation: "wcPop .25s ease" }}>

          {/* Umumiy xulosalar */}
          <div style={{ background: `linear-gradient(135deg,${P.pink},${P.vio})`, borderRadius: 20, padding: "16px", marginBottom: 14, color: "#fff" }}>
            <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 700 }}>{L("JAMI PROGNOZ (fakt ustuvor)", "ИТОГО ПРОГНОЗ")}</div>
            <div style={{ fontSize: 26, fontWeight: 800, margin: "3px 0 10px" }}>{fmt(calc.forecast)} <span style={{ fontSize: 13 }}>{L("so'm", "сум")}</span></div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                [L("Reja", "План"), calc.plan],
                [L("Zaklad to'landi", "Задаток"), calc.dep],
                [L("Qolgan", "Осталось"), calc.remain],
              ].map(([t2, v], i) => (
                <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.16)", borderRadius: 12, padding: "7px 8px" }}>
                  <div style={{ fontSize: 9.5, opacity: 0.9 }}>{t2}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 1 }}>{fmt(v)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Jamg'arish rejasi */}
          <div style={{ ...card, border: "1.5px solid " + P.pink + "44" }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: th.t1, marginBottom: 10 }}>📅 {L("Jamg'arish rejasi", "План накоплений")}</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, color: th.t2, fontWeight: 700, marginBottom: 4 }}>{L("To'y sanasi", "Дата свадьбы")}</div>
                <input type="date" value={data.date || ""} onChange={e => patch(d => { d.date = e.target.value; return d; })}
                  style={{ width: "100%", boxSizing: "border-box", background: th.bg, border: "1.5px solid " + th.bor, borderRadius: 12, padding: "10px 10px", color: th.t1, fontSize: 13.5, fontWeight: 700, outline: "none", fontFamily: "inherit", colorScheme: th.bg === "#0f172a" || th.t1 === "#fff" ? "dark" : "light" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, color: th.t2, fontWeight: 700, marginBottom: 4 }}>{L("Hozirgi jamg'arma", "Накоплено")}</div>
                <NumIn th={th} value={data.savedSum} onChange={v => patch(d => { d.savedSum = v; return d; })} suffix={L("so'm", "сум")} />
              </div>
            </div>
            {data.date && calc.months > 0 && (
              <div style={{ background: P.pink + "12", borderRadius: 12, padding: "10px 12px", fontSize: 12.5, color: th.t1, lineHeight: 1.6 }}>
                {L("To'ygacha", "До свадьбы")} <b>{calc.months} {L("oy", "мес")}</b> {L("qoldi. Oyiga", "Нужно в месяц")}: <b style={{ color: P.pink }}>{fmt(calc.perMonth)} {L("so'm", "сум")}</b> {L("yig'ish kerak.", "")}
              </div>
            )}
            <button onClick={makeGoal} style={{ ...btnP, width: "100%", marginTop: 10, padding: 13, background: `linear-gradient(135deg,${P.pink},${P.vio})`, color: "#fff", fontSize: 13.5 }}>🎯 {L("Maqsad sifatida saqlash", "Сохранить как цель")}</button>
          </div>

          {/* ── Marosimlar (mehmon kalkulyatori) ── */}
          <div style={{ fontSize: 14, fontWeight: 800, color: th.t1, margin: "16px 2px 10px" }}>🎪 {L("Marosimlar — mehmon kalkulyatori", "Мероприятия")}</div>
          {EVENTS.map(ev => {
            const e = data.events[ev.id];
            if (!e) return null;
            const evPlan = (e.guests || 0) * ((e.perG || 0) + (e.oshG || 0));
            return (
              <div key={ev.id} style={{ ...card, opacity: e.on ? 1 : 0.55 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{ev.e}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: th.t1 }}>{L(ev.uz, ev.ru)}</div>
                    {e.on && <div style={{ fontSize: 11, color: th.t2, marginTop: 1 }}>{L("Prognoz", "Прогноз")}: <b style={{ color: P.pink }}>{fmt((e.fact || 0) > 0 ? e.fact : evPlan)}</b>{(e.dep || 0) > 0 && <> · {L("zaklad", "задаток")}: {fmt(e.dep)}</>}</div>}
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
                        <span>👥 {L("Mehmonlar", "Гостей")}</span><b style={{ color: th.t1, fontSize: 13 }}>{e.guests}</b>
                      </div>
                      <input type="range" min="10" max="600" step="10" value={e.guests}
                        onChange={ev2 => patch(d => { d.events[ev.id].guests = Number(ev2.target.value); return d; })}
                        style={{ width: "100%", accentColor: P.pink }} />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 3 }}>🏛 {L("To'yxona / 1 kishi", "Зал / чел")}</div>
                        <NumIn th={th} value={e.perG} onChange={v => patch(d => { d.events[ev.id].perG = v; return d; })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 3 }}>🍚 {L("Osh / 1 kishi", "Плов / чел")}</div>
                        <NumIn th={th} value={e.oshG} onChange={v => patch(d => { d.events[ev.id].oshG = v; return d; })} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 3 }}>{L("Fakt (kelishilgan)", "Факт")}</div>
                        <NumIn th={th} value={e.fact} onChange={v => patch(d => { d.events[ev.id].fact = v; return d; })} placeholder={fmt(evPlan)} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: th.t2, fontWeight: 700, marginBottom: 3 }}>💵 {L("Zaklad to'landi", "Задаток")}</div>
                        <NumIn th={th} value={e.dep} onChange={v => patch(d => { d.events[ev.id].dep = v; return d; })} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* ── Umumiy xarajatlar (Reja/Fakt/Zaklad) ── */}
          <div style={{ fontSize: 14, fontWeight: 800, color: th.t1, margin: "16px 2px 10px" }}>🧾 {L("Umumiy xarajatlar", "Общие расходы")}</div>
          {CATS.map(c => {
            const it = data.cats[c.id] || { plan: 0, fact: 0, dep: 0 };
            const open = edit === c.id;
            return (
              <div key={c.id} style={{ ...card, padding: open ? "14px" : "12px 14px" }}>
                <div onClick={() => setEdit(open ? null : c.id)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <span style={{ fontSize: 20 }}>{c.e}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: th.t1 }}>{L(c.uz, c.ru)}</div>
                    <div style={{ fontSize: 10.5, color: th.t2, marginTop: 1 }}>
                      {L("Reja", "План")}: {fmt(it.plan)}{(it.fact || 0) > 0 && <> · <b style={{ color: P.pink }}>{L("Fakt", "Факт")}: {fmt(it.fact)}</b></>}{(it.dep || 0) > 0 && <> · {L("zaklad", "задаток")}: {fmt(it.dep)}</>}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: th.t2, transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
                </div>
                {open && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {[["plan", L("Reja", "План")], ["fact", L("Fakt", "Факт")], ["dep", L("Zaklad", "Задаток")]].map(([k, t2]) => (
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
            <button onClick={printSmeta} style={{ ...btnP, flex: 1.4, padding: 14, background: `linear-gradient(135deg,${P.pink},${P.vio})`, color: "#fff", fontSize: 13 }}>🖨️ {L("PDF smeta", "PDF смета")}</button>
            <button onClick={copySmeta} style={{ ...btnP, flex: 1.2, padding: 14, background: th.sur, border: "1.5px solid " + th.bor, color: th.t1, fontSize: 13 }}>📋 {L("Nusxalash", "Копировать")}</button>
            <button onClick={() => { if (confirm(L("Smeta o'chirilib, qaytadan boshlansinmi?", "Начать заново?"))) { setData(false); setStep("side"); setWEv([]); db.s("toy_" + oilaId, null).catch(() => {}); } }}
              style={{ ...btnP, flex: 0.8, padding: 14, background: "transparent", border: "1.5px solid " + th.bor, color: th.t2, fontSize: 13 }}>🔄</button>
          </div>
          <div style={{ fontSize: 10.5, color: th.t2, textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
            {L("Fakt — kelishilgan yakuniy narx (kiritilsa prognozda reja o'rniga olinadi). Zaklad — oldindan berilgan pul.", "Факт — итоговая цена, задаток — предоплата.")}
          </div>
        </div>
      )}
    </div>
  );
}
