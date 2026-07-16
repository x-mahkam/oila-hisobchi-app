import { useCallback, useState } from "react";
import { db } from "../firebase.js";
import { qmail } from "../utils/qmail.js";
import { td, nt, f, normTel, fmtN } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";
import i18n from "../i18n/index.js";

export function useDebts() {
  const {
    user, oila, azolar, qarzlar, setQarzlar,
    xar, setXar, dar, setDar,
    qarzReqs, setQarzReqs, notifs, setNotifs,
    ok$, buzz, val,
  } = useApp();

  const [showAddQarz, setShowAddQarz] = useState(false);
  const [qarzTur, setQarzTur] = useState("olgan");
  const [qarzKim, setQarzKim] = useState("");
  const [qarzSum, setQarzSum] = useState("");
  const [qarzIzoh, setQarzIzoh] = useState("");
  const [qarzSana, setQarzSana] = useState(td());
  const [qarzQaytSana, setQarzQaytSana] = useState("");
  const [qarzTel, setQarzTel] = useState("");
  const [qarzLinked, setQarzLinked] = useState(false);
  const [qarzDonePrompt, setQarzDonePrompt] = useState(null);
  const [partialQarz, setPartialQarz] = useState(null);
  const [partialSum, setPartialSum] = useState("");
  const [inviteQarz, setInviteQarz] = useState(null);

  // Bazadan yangi qarz ro'yxati (eskirgan lokal holat bilan ustidan yozib yubormaslik uchun)
  const freshQarz = async () => (await db.g("qarz_" + user.oilaId)) || [];

  // Joriy foydalanuvchi balansi (uid'siz eski yozuvlar ham o'ziniki hisoblanadi)
  const getMyBal = () => {
    const d = dar.filter(i => i.uid === user.id || !i.uid).reduce((s, i) => s + Number(i.summa || 0), 0);
    const x = xar.filter(i => i.uid === user.id || !i.uid).reduce((s, i) => s + Number(i.summa || 0), 0);
    return d - x;
  };

  const resetQarzForm = () => {
    setQarzKim(""); setQarzSum(""); setQarzIzoh("");
    setQarzSana(td()); setQarzQaytSana(""); setQarzTur("olgan");
    setQarzTel(""); setQarzLinked(false); setShowAddQarz(false);
  };

  // Qarz qo'shish (telefonsiz)
  const addQarz = useCallback(async () => {
    if (!qarzKim.trim() || !qarzSum || Number(qarzSum) <= 0) {
      return ok$(i18n.t("fill_all_fields", { defaultValue: "Barcha maydonlarni to'ldiring" }), "err");
    }
    // Balans tekshiruvi (qarz berish uchun)
    if (qarzTur === "bergan") {
      const myDar = dar.filter(d => d.uid === user.id || !d.uid).reduce((s, d) => s + Number(d.summa || 0), 0);
      const myXar = xar.filter(x => x.uid === user.id || !x.uid).reduce((s, x) => s + Number(x.summa || 0), 0);
      const myBal = myDar - myXar;
      if (myBal < Number(qarzSum)) {
        return ok$(
          i18n.t("debt_insufficient_balance", {
            bal: fmtN(Math.max(0, myBal), val, true),
            need: fmtN(Number(qarzSum), val, true),
            defaultValue: `❌ Balansda yetarli mablag' yo'q! Balans: ${fmtN(Math.max(0, myBal), val, true)}, Kerak: ${fmtN(Number(qarzSum), val, true)}`
          }),
          "err"
        );
      }
    }

    const item = {
      id: Date.now(), uid: user.id, tur: qarzTur,
      kim: qarzKim.trim(), summa: Number(qarzSum),
      izoh: qarzIzoh, sana: qarzSana, qaytSana: qarzQaytSana,
      paid: false, paidSana: "",
    };
    const upd = [item, ...(await freshQarz())];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);

    // Telefonsiz: avtomatik balansga bog'lash
    const sum = Number(qarzSum);
    const izohTxt = qarzTur === "olgan"
      ? i18n.t("debt_received_from", { name: qarzKim.trim(), defaultValue: "Qarz olindi: " + qarzKim.trim() })
      : i18n.t("debt_given_to", { name: qarzKim.trim(), defaultValue: "Qarz berildi: " + qarzKim.trim() });

    if (qarzTur === "olgan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: sum, izoh: izohTxt, sana: qarzSana, vaqt: nt(), uid: user.id, fromQarz: item.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
      ok$(i18n.t("debt_added_balance_plus", { amount: fmtN(sum, val, true), defaultValue: "Qarz olindi va balansga qo'shildi! +" + fmtN(sum, val, true) }));
    } else {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: sum, izoh: izohTxt, sana: qarzSana, vaqt: nt(), uid: user.id, repeat: false, fromQarz: item.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
      ok$(i18n.t("debt_deducted_balance_minus", { amount: fmtN(sum, val, true), defaultValue: "Qarz berildi va balansdan ayirildi! -" + fmtN(sum, val, true) }));
    }
    resetQarzForm();
  }, [qarzKim, qarzSum, qarzIzoh, qarzSana, qarzQaytSana, qarzTur, user, xar, dar, ok$, val]);

  // Telefon bilan qarz so'rovi yuborish
  const sendQarzRequest = useCallback(async () => {
    if (!qarzKim.trim() || !qarzSum || Number(qarzSum) <= 0) {
      return ok$(i18n.t("fill_all_fields", { defaultValue: "Barcha maydonlarni to'ldiring" }), "err");
    }
    if (!qarzLinked) { await addQarz(); return; }
    if (!qarzTel.trim()) return ok$(i18n.t("debt_enter_phone", { defaultValue: "Telefon raqamini kiriting" }), "err");
    // Qarz beruvchi: yuborishdan oldin balans tekshiruvi
    if (qarzTur === "bergan" && getMyBal() < Number(qarzSum)) {
      return ok$(
        i18n.t("debt_lend_insufficient_balance", {
          bal: fmtN(Math.max(0, getMyBal()), val, true),
          defaultValue: "❌ Siz qarz bera olmaysiz — sizda mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
        }),
        "err"
      );
    }

    const cleanTel = qarzTel.trim().replace(/[^0-9+]/g, "");
    const targetUid = await db.g("tel_" + cleanTel);
    if (!targetUid) { setInviteQarz({ tel: cleanTel, kim: qarzKim.trim(), summa: Number(qarzSum) }); return; }
    if (targetUid === user.id) return ok$(i18n.t("debt_cannot_send_self", { defaultValue: "O'zingizga yubora olmaysiz" }), "err");

    const req = {
      id: Date.now(), fromUid: user.id, fromIsm: user.ism, fromTel: user.tel || "",
      toTel: cleanTel, tur: qarzTur, summa: Number(qarzSum),
      izoh: qarzIzoh, sana: qarzSana, qaytSana: qarzQaytSana, status: "pending",
    };
    // XAVFSIZLIK: begona pochtani o'qimaymiz — alohida hujjat yaratamiz
    await qmail.send(cleanTel, req);

    const rN = { id: Date.now() + Math.random(), type: "qarz", title: i18n.t("debt_new_request_title", { defaultValue: "Yangi qarz so'rovi" }), body: (user.ism || "") + " - " + fmtN(Number(qarzSum), val, true), sana: new Date().toISOString(), read: false };
    const rC = (await db.g("notif_" + targetUid)) || [];
    await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));

    const myItem = { id: req.id, uid: user.id, tur: qarzTur, kim: qarzKim.trim(), summa: Number(qarzSum), izoh: qarzIzoh, sana: qarzSana, qaytSana: qarzQaytSana, paid: false, paidSana: "", linked: true, linkedTel: cleanTel, linkStatus: "pending" };
    const upd = [myItem, ...(await freshQarz())];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    resetQarzForm();
    ok$(i18n.t("debt_request_sent", { defaultValue: "Qarz so'rovi yuborildi!" }));
  }, [qarzKim, qarzSum, qarzIzoh, qarzSana, qarzQaytSana, qarzTur, qarzTel, qarzLinked, user, ok$, val, addQarz]);

  // So'rovni qabul qilish
  // Tasdiqlangandan keyin: qarz BERGAN balansidan (-), qarz OLGAN balansiga (+).
  // Qarz FAOL (paid:false) bo'lib qoladi — "qaytarildi" deb YOPILMAYDI.
  const acceptQarzReq = useCallback(async (req) => {
    const myTur = req.tur === "bergan" ? "olgan" : "bergan";

    // Balans tekshiruvi: men qarz BERUVCHI bo'lsam, balans yetarli bo'lishi shart
    if (myTur === "bergan" && getMyBal() < Number(req.summa)) {
      return ok$(
        i18n.t("debt_cannot_lend_needed", {
          bal: fmtN(Math.max(0, getMyBal()), val, true),
          need: fmtN(Number(req.summa), val, true),
          defaultValue: "❌ Siz qarz bera olmaysiz — sizda mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true) + ", Kerak: " + fmtN(Number(req.summa), val, true)
        }),
        "err"
      );
    }

    // MUHIM: uid qo'shildi — busiz bir oilada ikkala tomonga "meniki" bo'lib ko'rinardi
    const item = { id: req.id, uid: user.id, tur: myTur, kim: req.fromIsm, summa: req.summa, izoh: req.izoh, sana: req.sana, qaytSana: req.qaytSana, paid: false, paidSana: "", linked: true, linkedTel: req.fromTel, linkStatus: "accepted" };
    const upd = [item, ...(await freshQarz()).filter(q => !(q.id === item.id && q.uid === user.id))];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);

    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    try { await db.s("qreq_" + user.tel, newReqs); } catch {}
    await qmail.consume(user.tel, req.id);

    // XAVFSIZLIK: sender OILASINING hujjatlariga yozmaymiz — javob xabari
    // yuboramiz; sender ilovasi keyingi yuklanishda O'Z hujjatlarini yangilaydi.
    if (req.fromTel) {
      await qmail.send(req.fromTel, { id: "ls_" + req.id + "_" + Date.now(), type: "link_status", debtId: req.id, status: "accepted", byIsm: user.ism, byUid: user.id });
    }
    {
      // Sender'ga xabar
      const sN = { id: Date.now() + Math.random(), type: "qarz", title: i18n.t("debt_confirmed_title", { defaultValue: "✅ Qarz tasdiqlandi" }), body: i18n.t("debt_confirmed_body", { name: user.ism || "", amount: fmtN(Number(req.summa), val, true), defaultValue: (user.ism || "") + " qarzni tasdiqladi: " + fmtN(Number(req.summa), val, true) }), sana: new Date().toISOString(), read: false };
      const sC = (await db.g("notif_" + req.fromUid)) || [];
      await db.s("notif_" + req.fromUid, [sN, ...sC].slice(0, 100));
    }

    // O'z balansga bog'lash
    if (myTur === "olgan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: req.summa, izoh: i18n.t("debt_received_confirmed", { name: req.fromIsm, defaultValue: "Qarz olindi (tasdiqlangan): " + req.fromIsm }), sana: req.sana, vaqt: nt(), uid: user.id, fromQarz: req.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
    }
    if (myTur === "bergan") {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: req.summa, izoh: i18n.t("debt_given_confirmed", { name: req.fromIsm, defaultValue: "Qarz berildi: " + req.fromIsm }), sana: req.sana, vaqt: nt(), uid: user.id, repeat: false, fromQarz: req.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
    }
    ok$(i18n.t("debt_confirmed_toast", { defaultValue: "Qarz tasdiqlandi va balansga bog'landi! ✅" }));
  }, [qarzlar, qarzReqs, user, xar, dar, ok$, val]);

  // So'rovni rad etish
  const rejectQarzReq = useCallback(async (req) => {
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    try { await db.s("qreq_" + user.tel, newReqs); } catch {}
    await qmail.consume(user.tel, req.id);
    // XAVFSIZLIK: rad javobi ham xabar orqali — sender o'zi qo'llaydi
    if (req.fromTel) {
      await qmail.send(req.fromTel, { id: "ls_" + req.id + "_" + Date.now(), type: "link_status", debtId: req.id, status: "rejected", byIsm: user.ism, byUid: user.id });
    }
    ok$(i18n.t("rejected", { defaultValue: "Rad etildi" }), "warn");
  }, [qarzReqs, user, ok$]);

  // Qarzni to'langan deb belgilash
  const markQarzPaid = useCallback(async (id) => {
    const list = await freshQarz();
    const q = list.find(x => x.id === id && (!x.uid || x.uid === user.id));
    // Men qarzdorman va qaytarmoqchiman → balans yetarli bo'lishi shart (minusga tushmaslik)
    if (q && q.tur === "olgan" && getMyBal() < Number(q.summa)) {
      return ok$(
        i18n.t("debt_repay_insufficient_balance", {
          bal: fmtN(Math.max(0, getMyBal()), val, true),
          defaultValue: "❌ Qarzingizni qaytarishingiz uchun mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
        }),
        "err"
      );
    }
    if (q?.linked && q?.linkStatus === "accepted" && q?.linkedTel) {
      const targetUid = await db.g("tel_" + q.linkedTel);
      if (targetUid) {
        const upd = list.map(x => (x.id === id && (!x.uid || x.uid === user.id)) ? { ...x, payStatus: "pending", payBy: user.id } : x);
        await db.s("qarz_" + user.oilaId, upd);
        setQarzlar(upd);
        const payReq = { id: "pay_" + id + "_" + Date.now(), debtId: id, fromUid: user.id, fromIsm: user.ism, fromTel: user.tel || "", toTel: q.linkedTel, summa: q.summa, paySum: Number(q.summa), partial: false, kim: q.kim, tur: q.tur, sana: td(), type: "payment" };
        await qmail.send(q.linkedTel, payReq);
        const rN = { id: Date.now() + Math.random(), type: "qarz", title: i18n.t("debt_return_request_title", { defaultValue: "Qarz qaytarish so'rovi" }), body: i18n.t("debt_return_request_body", { name: user.ism || "", amount: fmtN(q.summa, val, true), defaultValue: (user.ism || "") + " qarzni qaytardim deyapti: " + fmtN(q.summa, val, true) }), sana: new Date().toISOString(), read: false };
        const rC = (await db.g("notif_" + targetUid)) || [];
        await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
        ok$(i18n.t("debt_return_request_sent", { defaultValue: "Qaytarish so'rovi yuborildi!" }));
        return;
      }
    }
    // Bog'lanmagan qarz: darhol yopiladi va balansga AVTOMATIK yoziladi (so'rovsiz)
    const upd = list.map(x => (x.id === id && (!x.uid || x.uid === user.id)) ? { ...x, paid: true, paidSana: td() } : x);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    if (q) {
      if (q.tur === "bergan") {
        const dItem = { id: Date.now() + 1, tur: "qarz", summa: Number(q.summa), izoh: i18n.t("debt_returned_by", { name: q.kim, defaultValue: "Qarz qaytdi: " + q.kim }), sana: td(), vaqt: nt(), uid: user.id, fromQarz: q.id };
        const dk = "d_" + user.oilaId + "_" + user.id;
        await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
        setDar(d => [dItem, ...d]);
        ok$(i18n.t("debt_returned_toast_plus", { amount: fmtN(Number(q.summa), val, true), defaultValue: "Qaytarib olindi! Balansga qo'shildi: +" + fmtN(Number(q.summa), val, true) }));
      } else {
        const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: Number(q.summa), izoh: i18n.t("debt_repaid_to", { name: q.kim, defaultValue: "Qarz qaytarildi: " + q.kim }), sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: q.id };
        const xk = "x_" + user.oilaId + "_" + user.id;
        await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
        setXar(x => [xItem, ...x]);
        ok$(i18n.t("debt_repaid_toast_minus", { amount: fmtN(Number(q.summa), val, true), defaultValue: "Qaytarildi! Balansdan yechildi: -" + fmtN(Number(q.summa), val, true) }));
      }
    }
  }, [qarzlar, user, xar, dar, ok$, val]);

  // Qisman qaytarish
  const applyPartial = useCallback(async () => {
    if (!partialQarz || !partialSum || Number(partialSum) <= 0) return ok$(i18n.t("enter_amount", { defaultValue: "Summa kiriting" }), "err");
    const pay = Number(partialSum);
    const q = partialQarz;
    if (pay >= q.summa) { setPartialQarz(null); setPartialSum(""); markQarzPaid(q.id); return; }
    // Qarzdor qisman qaytaryapti → balans yetarli bo'lishi shart
    if (q.tur === "olgan" && getMyBal() < pay) {
      return ok$(
        i18n.t("debt_repay_insufficient_balance", {
          bal: fmtN(Math.max(0, getMyBal()), val, true),
          defaultValue: "❌ Qarzingizni qaytarishingiz uchun mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
        }),
        "err"
      );
    }
    // Bog'langan qarz: qisman qaytarish ham ikkinchi tomon TASDIG'INI talab qiladi
    if (q.linked && q.linkStatus === "accepted" && q.linkedTel) {
      const targetUid = await db.g("tel_" + q.linkedTel);
      if (targetUid) {
        const list = await freshQarz();
        const upd = list.map(x => (x.id === q.id && (!x.uid || x.uid === user.id)) ? { ...x, payStatus: "pending", payBy: user.id } : x);
        await db.s("qarz_" + user.oilaId, upd);
        setQarzlar(upd);
        const payReq = { id: "pay_" + q.id + "_" + Date.now(), debtId: q.id, fromUid: user.id, fromIsm: user.ism, fromTel: user.tel || "", toTel: q.linkedTel, summa: q.summa, paySum: pay, partial: true, kim: q.kim, tur: q.tur, sana: td(), type: "payment" };
        await qmail.send(q.linkedTel, payReq);
        const rN = { id: Date.now() + Math.random(), type: "qarz", title: i18n.t("debt_partial_return_request_title", { defaultValue: "Qisman qaytarish so'rovi" }), body: i18n.t("debt_partial_return_request_body", { name: user.ism || "", amount: fmtN(pay, val, true), defaultValue: (user.ism || "") + " qisman qaytardim deyapti: " + fmtN(pay, val, true) }), sana: new Date().toISOString(), read: false };
        const rC = (await db.g("notif_" + targetUid)) || [];
        await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
        setPartialQarz(null); setPartialSum("");
        ok$(i18n.t("debt_partial_request_sent", { defaultValue: "Qisman qaytarish so'rovi yuborildi! Tasdiq kutilmoqda." }));
        return;
      }
    }
    // Bog'lanmagan qarz: darhol qo'llanadi + balansga AVTOMATIK yoziladi
    const paidSoFar = (q.paidPart || 0) + pay;
    const newTimeline = [...(q.timeline || []), { sana: td(), summa: pay, ism: user.ism || i18n.t("me", { defaultValue: "Men" }) }];
    const upd = (await freshQarz()).map(x => (x.id === q.id && (!x.uid || x.uid === user.id)) ? { ...x, summa: x.summa - pay, paidPart: paidSoFar, asl: x.asl || q.summa + (q.paidPart || 0), timeline: newTimeline } : x);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    if (q.tur === "bergan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: pay, izoh: i18n.t("debt_partial_returned_by", { name: q.kim, defaultValue: "Qarz qisman qaytdi: " + q.kim }), sana: td(), vaqt: nt(), uid: user.id, fromQarz: q.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
    } else {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: pay, izoh: i18n.t("debt_partial_repaid_to", { name: q.kim, defaultValue: "Qarz qisman qaytarildi: " + q.kim }), sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: q.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
    }
    setPartialQarz(null); setPartialSum("");
    ok$(i18n.t("debt_partial_repaid_toast", { amount: fmtN(pay, val, true), remaining: fmtN(q.summa - pay, val, true), defaultValue: "Qisman qaytarildi: " + fmtN(pay, val, true) + ". Qoldi: " + fmtN(q.summa - pay, val, true) }));
  }, [partialQarz, partialSum, qarzlar, user, xar, dar, ok$, val, markQarzPaid]);

  // Qarzni o'chirish
  const delQarz = useCallback(async (id) => {
    const list = await freshQarz();
    const q = list.find(x => x.id === id && (!x.uid || x.uid === user.id));
    // Bog'langan va tasdiqlangan qarz TO'LIQ YOPILMAGUNCHA o'chirib bo'lmaydi
    if (q && q.linked && q.linkStatus === "accepted" && !q.paid) {
      return ok$(
        i18n.t("debt_confirmed_cannot_delete", { defaultValue: "❌ Bu qarz ikki tomon tasdiqlagan. Faqat to'liq qaytarilib yopilgandan keyin o'chirish mumkin!" }),
        "err"
      );
    }
    const upd = list.filter(x => !(x.id === id && (!x.uid || x.uid === user.id)));
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
  }, [qarzlar, user, ok$]);

  // Eslatma yuborish
  const sendQarzReminder = useCallback(async (q) => {
    if (!q.linked || !q.linkedTel) {
      const msg = i18n.t("debt_clipboard_reminder", { amount: fmtN(q.summa, val, true), defaultValue: "Assalomu alaykum! " + fmtN(q.summa, val, true) + " qarz haqida eslatma." });
      try { navigator.clipboard.writeText(msg); ok$(i18n.t("copied", { defaultValue: "Nusxalandi!" })); } catch { ok$(msg); }
      return;
    }
    const targetUid = await db.g("tel_" + q.linkedTel);
    if (targetUid) {
      const rN = { id: Date.now() + Math.random(), type: "qarz", title: i18n.t("debt_reminder_title", { defaultValue: "🔔 Qarz eslatmasi" }), body: i18n.t("debt_reminder_body", { name: user.ism || "", amount: fmtN(q.summa, val, true), defaultValue: (user.ism || "") + " qarz haqida eslatma yubordi: " + fmtN(q.summa, val, true) }), sana: new Date().toISOString(), read: false };
      const rC = (await db.g("notif_" + targetUid)) || [];
      await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
      ok$(i18n.t("debt_reminder_sent", { defaultValue: "Eslatma yuborildi!" }));
    }
  }, [user, ok$, val]);

  // Daromad/xarajatga qo'shish
  const addQarzAsDaromad = useCallback(async (q) => {
    const item = { id: Date.now(), tur: "boshqa", summa: q.summa, izoh: i18n.t("debt_return_title", { name: q.kim, defaultValue: "Qarz qaytishi: " + q.kim }), sana: td(), vaqt: nt() };
    const key = "d_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setDar(d => [{ ...item, uid: user.id }, ...d]);
    setQarzDonePrompt(null);
    ok$(i18n.t("debt_added_income_toast", { amount: fmtN(q.summa, val, true), defaultValue: "Daromadlarga qo'shildi! +" + fmtN(q.summa, val, true) }));
  }, [user, ok$, val]);

  const addQarzAsXarajat = useCallback(async (q) => {
    if (getMyBal() < Number(q.summa)) {
      return ok$(i18n.t("insufficient_balance", { defaultValue: "❌ Balansda yetarli mablag' yo'q!" }), "err");
    }
    const item = { id: Date.now(), kategoriya: "boshqa", summa: q.summa, izoh: i18n.t("debt_payment_title", { name: q.kim, defaultValue: "Qarz qaytarish: " + q.kim }), sana: td(), vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setXar(x => [{ ...item, uid: user.id }, ...x]);
    setQarzDonePrompt(null);
    ok$(i18n.t("debt_added_expense_toast", { amount: fmtN(q.summa, val, true), defaultValue: "Xarajatlarga qo'shildi! -" + fmtN(q.summa, val, true) }));
  }, [user, xar, dar, ok$, val]);

  // Qaytarishni tasdiqlash
  const acceptPayReq = useCallback(async (req) => {
    const paySum = Number(req.paySum || req.summa || 0);
    const list = await freshQarz();
    const doneQ = list.find(q => q.id === req.debtId && (!q.uid || q.uid === user.id));
    // To'liq yopiladimi yoki qisman qoladimi?
    const closeIt = doneQ ? (Number(doneQ.summa) - paySum) <= 0 : !req.partial;
    // Men qarzdorman va "qaytarib oldim" da'vosini tasdiqlayapman → mendan pul chiqadi
    if (doneQ && doneQ.tur === "olgan" && getMyBal() < paySum) {
      return ok$(
        i18n.t("debt_repay_insufficient_balance", {
          bal: fmtN(Math.max(0, getMyBal()), val, true),
          defaultValue: "❌ Qarzingizni qaytarishingiz uchun mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
        }),
        "err"
      );
    }
    const upd = list.map(q => {
      if (q.id === req.debtId && (!q.uid || q.uid === user.id)) {
        const newTimeline = [...(q.timeline || []), { sana: td(), summa: paySum, ism: req.fromIsm || i18n.t("partner", { defaultValue: "Hamkor" }) }];
        return closeIt
          ? { ...q, paid: true, paidSana: td(), payStatus: "confirmed", timeline: newTimeline }
          : { ...q, summa: Number(q.summa) - paySum, paidPart: (q.paidPart || 0) + paySum, asl: q.asl || Number(q.summa) + (q.paidPart || 0), payStatus: null, payBy: null, timeline: newTimeline };
      }
      return q;
    });
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    // MENING balansimga avtomatik yozuv (hech qanday qo'shimcha so'rovsiz)
    if (doneQ && paySum > 0) {
      if (doneQ.tur === "bergan") {
        const dItem = { id: Date.now() + 1, tur: "qarz", summa: paySum, izoh: i18n.t("debt_returned_by", { name: doneQ.kim, defaultValue: "Qarz qaytdi: " + doneQ.kim }), sana: td(), vaqt: nt(), uid: user.id, fromQarz: doneQ.id };
        const dk = "d_" + user.oilaId + "_" + user.id;
        await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
        setDar(d => [dItem, ...d]);
      } else {
        const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: paySum, izoh: i18n.t("debt_repaid_to", { name: doneQ.kim, defaultValue: "Qarz qaytarildi: " + doneQ.kim }), sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: doneQ.id };
        const xk = "x_" + user.oilaId + "_" + user.id;
        await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
        setXar(x => [xItem, ...x]);
      }
    }
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    try { await db.s("qreq_" + user.tel, newReqs); } catch {}
    await qmail.consume(user.tel, req.id);
    // XAVFSIZLIK: qarshi tomon hujjatlariga yozmaymiz — natija xabari yuboriladi,
    // uning ilovasi O'Z qarz_/x_/d_ hujjatlarini keyingi yuklanishda yangilaydi.
    if (req.fromTel) {
      await qmail.send(req.fromTel, { id: "pr_" + req.id + "_" + Date.now(), type: "pay_result", debtId: req.debtId, status: "confirmed", paySum, closeIt, byIsm: user.ism });
    }
    try {
      const parentTitle = closeIt
        ? i18n.t("debt_confirmed_title", { defaultValue: "✅ Qarz tasdiqlandi" })
        : i18n.t("debt_partial_confirmed_title", { defaultValue: "✅ Qisman qaytarish tasdiqlandi" });
      const pN = { id: Date.now() + Math.random(), type: "qarz", title: parentTitle, body: (user.ism || "") + ": " + fmtN(paySum, val, true), sana: new Date().toISOString(), read: false };
      const pC = (await db.g("notif_" + req.fromUid)) || [];
      await db.s("notif_" + req.fromUid, [pN, ...pC].slice(0, 100));
    } catch {}
    ok$(
      closeIt
        ? i18n.t("debt_repay_confirmed_toast", { defaultValue: "Qaytarish tasdiqlandi! Balansga yozildi." })
        : i18n.t("debt_partial_repay_confirmed_toast", { defaultValue: "Qisman qaytarish tasdiqlandi! Balansga yozildi." })
    );
  }, [qarzlar, qarzReqs, user, xar, dar, ok$, val]);

  const rejectPayReq = useCallback(async (req) => {
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    try { await db.s("qreq_" + user.tel, newReqs); } catch {}
    await qmail.consume(user.tel, req.id);
    if (req.fromTel) {
      await qmail.send(req.fromTel, { id: "pr_" + req.id + "_" + Date.now(), type: "pay_result", debtId: req.debtId, status: "rejected", paySum: 0, closeIt: false, byIsm: user.ism });
    }
    ok$(i18n.t("debt_return_rejected", { defaultValue: "Qaytarish rad etildi" }), "warn");
  }, [qarzReqs, user, ok$]);

  // To'liq yangilash: so'rovlar, qarzlar, bildirishnomalar VA balans (xarajat/daromad)
  // silent === true bo'lsa toast ko'rsatilmaydi (avtomatik sinxronizatsiya uchun)
  const refreshQarzReqs = useCallback(async (silent) => {
    if (!user?.id) return;
    try {
      if (user.tel) {
        const pending = await qmail.load(user, { setQarzlar, setXar, setDar });
        setQarzReqs(pending);
      }
      setQarzlar((await db.g("qarz_" + user.oilaId)) || []);
      setNotifs((await db.g("notif_" + user.id)) || []);
      // Balans sinxronizatsiyasi: barcha a'zolarning xarajat/daromadlari
      if ((azolar || []).length) {
        const allX = [], allD = [];
        await Promise.all(azolar.map(async (m) => {
          try {
            const xA = await db.g("x_" + user.oilaId + "_" + m.id);
            const dA = await db.g("d_" + user.oilaId + "_" + m.id);
            if (xA?.length) allX.push(...xA.map(x => ({ ...x, uid: m.id })));
            if (dA?.length) allD.push(...dA.map(d => ({ ...d, uid: m.id })));
          } catch {}
        }));
        setXar(allX);
        setDar(allD);
      }
      if (silent !== true) ok$(i18n.t("refreshed", { defaultValue: "Yangilandi" }));
    } catch (e) { console.error("refreshQarzReqs:", e); }
  }, [user, azolar, ok$]);

  return {
    // State
    showAddQarz, setShowAddQarz,
    qarzTur, setQarzTur, qarzKim, setQarzKim,
    qarzSum, setQarzSum, qarzIzoh, setQarzIzoh,
    qarzSana, setQarzSana, qarzQaytSana, setQarzQaytSana,
    qarzTel, setQarzTel, qarzLinked, setQarzLinked,
    qarzDonePrompt, setQarzDonePrompt,
    partialQarz, setPartialQarz, partialSum, setPartialSum,
    inviteQarz, setInviteQarz,
    // Actions
    addQarz, sendQarzRequest, acceptQarzReq, rejectQarzReq,
    markQarzPaid, applyPartial, delQarz, sendQarzReminder,
    addQarzAsDaromad, addQarzAsXarajat,
    acceptPayReq, rejectPayReq, refreshQarzReqs,
  };
}
