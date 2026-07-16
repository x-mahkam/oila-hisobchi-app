// ═══════════════════════════════════════════════════════════
//  QARZ POCHTA QUTISI (xavfsiz, hujjat-boshiga)
//  Eski model: qreq_<tel> — bitta blob, HAMMA o'qiy/yoza olardi,
//  qabul qiluvchi esa yuboruvchi OILASINING qarz_/x_/d_ hujjatlarini
//  to'g'ridan-to'g'ri o'zgartirardi. Bu Firestore Rules bilan sig'maydi.
//
//  Yangi model:
//  • Har xabar alohida hujjat:  qi_<tel>_<id>  (c: "qreq_<tel>" kanali)
//  • Yuboruvchi faqat YARATADI, qabul qiluvchi faqat O'ZINIKINI o'qiydi
//    va iste'mol qiladi (v=null). Rules shu chegarani majburlaydi.
//  • Javoblar (link_status / pay_result) ham xabar sifatida qaytadi —
//    HAR OILA FAQAT O'Z hujjatlarini yozadi. Yuboruvchi ilovasi keyingi
//    yuklanishda javobni o'qib, O'Z qarz_/x_/d_ yozuvlarini o'zi bajaradi.
//    (Kuzatiladigan xatti-harakat o'zgarmaydi: real-time yo'q edi,
//    ikkinchi tomon baribir keyingi ochilishda ko'rardi.)
// ═══════════════════════════════════════════════════════════
import { db } from "../firebase.js";
import { td, nt } from "./formatters.js";
import i18n from "../i18n/index.js";

const chan = (tel) => "qreq_" + tel;
const key  = (tel, id) => "qi_" + tel + "_" + id;

export const qmail = {
  // Xabar yuborish (faqat yaratish — begona pochtani o'qimaymiz)
  async send(toTel, item) {
    await db.s(key(toTel, item.id), item, { c: chan(toTel) });
  },

  // Xabarni iste'mol qilish (o'z pochtamizdan)
  async consume(tel, id) {
    try { await db.s(key(tel, id), null, { c: chan(tel) }); } catch {}
  },

  // O'z pochtamizni o'qish: yangi qi_ hujjatlar
  // (eski qreq_ blob o'qish olib tashlandi — yangi Rules uni baribir rad etadi)
  async list(tel) {
    if (!tel) return [];
    const items = await db.q(chan(tel));
    return items;
  },

  // ── JAVOBLARNI QO'LLASH (yuboruvchi tomonda) ──
  // Qarama-qarshi tomon endi bizning hujjatlarimizga yoza olmaydi;
  // uning qarori shu yerda, O'ZIMIZNING sessiyamizda qo'llanadi.
  // Mantiq eski kross-yozuvlar bilan AYNAN bir xil.
  async applyResponses(u, items, { setQarzlar, setXar, setDar }, lg = "uz") {
    const responses = items.filter(i => i && (i.type === "link_status" || i.type === "pay_result"));
    if (!responses.length) return items;

    let list = (await db.g("qarz_" + u.oilaId)) || [];
    const xAdds = [], dAdds = [];

    for (const r of responses) {
      const mine = q => q.id === r.debtId && (!q.uid || q.uid === u.id);

      if (r.type === "link_status") {
        const q0 = list.find(mine);
        list = list.map(q => mine(q) ? { ...q, linkStatus: r.status } : q);
        if (r.status === "accepted" && q0) {
          if (q0.tur === "bergan") {
            const izoh = i18n.t("loan_given_confirmed_izoh", { name: r.byIsm || q0.kim, defaultValue: `Qarz berildi (tasdiqlangan): ${r.byIsm || q0.kim}` });
            xAdds.push({ id: Date.now() + Math.random(), kategoriya: "qarz", summa: Number(q0.summa), izoh, sana: q0.sana || td(), vaqt: nt(), uid: u.id, repeat: false, fromQarz: q0.id });
          } else {
            const izoh = i18n.t("loan_received_confirmed_izoh", { name: r.byIsm || q0.kim, defaultValue: `Qarz olindi (tasdiqlangan): ${r.byIsm || q0.kim}` });
            dAdds.push({ id: Date.now() + Math.random(), tur: "qarz", summa: Number(q0.summa), izoh, sana: q0.sana || td(), vaqt: nt(), uid: u.id, fromQarz: q0.id });
          }
        }
      }

      if (r.type === "pay_result") {
        const q0 = list.find(mine);
        const paySum = Number(r.paySum || 0);
        if (r.status === "rejected") {
          list = list.map(q => mine(q) ? { ...q, payStatus: null, payBy: null } : q);
        } else if (q0) {
          list = list.map(q => mine(q)
            ? (r.closeIt
                ? { ...q, paid: true, paidSana: td(), payStatus: "confirmed" }
                : { ...q, summa: Number(q.summa) - paySum, paidPart: (q.paidPart || 0) + paySum, asl: q.asl || Number(q.summa) + (q.paidPart || 0), payStatus: null, payBy: null })
            : q);
          if (paySum > 0) {
            if (q0.tur === "bergan") {
              const keyName = r.closeIt ? "debt_returned_full_izoh" : "debt_returned_partial_izoh";
              const defaultVal = r.closeIt ? `Qarz qaytdi: ${q0.kim}` : `Qarz qisman qaytdi: ${q0.kim}`;
              const izoh = i18n.t(keyName, { name: q0.kim, defaultValue: defaultVal });
              dAdds.push({ id: Date.now() + Math.random(), tur: "qarz", summa: paySum, izoh, sana: td(), vaqt: nt(), uid: u.id, fromQarz: q0.id });
            } else {
              const keyName = r.closeIt ? "debt_repaid_full_izoh" : "debt_repaid_partial_izoh";
              const defaultVal = r.closeIt ? `Qarz qaytarildi: ${q0.kim}` : `Qarz qisman qaytarildi: ${q0.kim}`;
              const izoh = i18n.t(keyName, { name: q0.kim, defaultValue: defaultVal });
              xAdds.push({ id: Date.now() + Math.random(), kategoriya: "qarz", summa: paySum, izoh, sana: td(), vaqt: nt(), uid: u.id, repeat: false, fromQarz: q0.id });
            }
          }
        }
      }
    }

    // O'Z hujjatlarimizga yozamiz
    await db.s("qarz_" + u.oilaId, list);
    setQarzlar && setQarzlar(list);
    if (xAdds.length) {
      const xk = "x_" + u.oilaId + "_" + u.id;
      const cur = (await db.g(xk)) || [];
      await db.s(xk, [...xAdds, ...cur]);
      setXar && setXar(x => [...xAdds, ...x]);
    }
    if (dAdds.length) {
      const dk = "d_" + u.oilaId + "_" + u.id;
      const cur = (await db.g(dk)) || [];
      await db.s(dk, [...dAdds, ...cur]);
      setDar && setDar(d => [...dAdds, ...d]);
    }

    // Iste'mol qilingan javoblarni o'chirish
    for (const r of responses) await qmail.consume(u.tel, r.id);

    // Ko'rsatish uchun faqat haqiqiy so'rovlar qoladi
    return items.filter(i => i && i.type !== "link_status" && i.type !== "pay_result");
  },

  // Yuklash + javoblarni qo'llash — bitta qulay kirish nuqtasi
  async load(u, setters, lg) {
    const items = await qmail.list(u.tel || "");
    return qmail.applyResponses(u, items, setters || {}, lg);
  },
};
