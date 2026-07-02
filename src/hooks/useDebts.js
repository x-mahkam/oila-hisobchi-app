import { useCallback, useState } from "react";
import { db } from "../firebase.js";
import { td, nt, f, normTel, fmtN } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";

export function useDebts() {
  const {
    user, oila, azolar, qarzlar, setQarzlar,
    xar, setXar, dar, setDar,
    qarzReqs, setQarzReqs, notifs, setNotifs,
    ok$, buzz, addNotif, lg, val,
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
      return ok$(lg === "uz" ? "Barcha maydonlarni to'ldiring" : "Fill all fields", "err");
    }
    // Balans tekshiruvi (qarz berish uchun)
    if (qarzTur === "bergan") {
      const myDar = dar.filter(d => d.uid === user.id || !d.uid).reduce((s, d) => s + Number(d.summa || 0), 0);
      const myXar = xar.filter(x => x.uid === user.id || !x.uid).reduce((s, x) => s + Number(x.summa || 0), 0);
      const myBal = myDar - myXar;
      if (myBal < Number(qarzSum)) {
        return ok$(
          lg === "uz"
            ? `❌ Balansda yetarli mablag' yo'q! Balans: ${fmtN(Math.max(0, myBal), val, true)}, Kerak: ${fmtN(Number(qarzSum), val, true)}`
            : `❌ Insufficient balance!`,
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
      ? (lg === "uz" ? "Qarz olindi: " : "Loan received: ") + qarzKim.trim()
      : (lg === "uz" ? "Qarz berildi: " : "Loan given: ") + qarzKim.trim();

    if (qarzTur === "olgan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: sum, izoh: izohTxt, sana: qarzSana, vaqt: nt(), uid: user.id, fromQarz: item.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
      ok$(lg === "uz" ? "Qarz olindi va balansga qo'shildi! +" + fmtN(sum, val, true) : "Loan added to balance!");
    } else {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: sum, izoh: izohTxt, sana: qarzSana, vaqt: nt(), uid: user.id, repeat: false, fromQarz: item.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
      ok$(lg === "uz" ? "Qarz berildi va balansdan ayirildi! -" + fmtN(sum, val, true) : "Loan deducted!");
    }
    resetQarzForm();
  }, [qarzKim, qarzSum, qarzIzoh, qarzSana, qarzQaytSana, qarzTur, user, qarzlar, xar, dar, ok$, lg, val]);

  // Telefon bilan qarz so'rovi yuborish
  const sendQarzRequest = useCallback(async () => {
    if (!qarzKim.trim() || !qarzSum || Number(qarzSum) <= 0) {
      return ok$(lg === "uz" ? "Barcha maydonlarni to'ldiring" : "Fill all fields", "err");
    }
    if (!qarzLinked) { await addQarz(); return; }
    if (!qarzTel.trim()) return ok$(lg === "uz" ? "Telefon raqamini kiriting" : "Enter phone", "err");
    // Qarz beruvchi: yuborishdan oldin balans tekshiruvi
    if (qarzTur === "bergan" && getMyBal() < Number(qarzSum)) {
      return ok$(
        lg === "uz"
          ? "❌ Siz qarz bera olmaysiz — sizda mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
          : "❌ You cannot lend — insufficient balance!",
        "err"
      );
    }

    const cleanTel = qarzTel.trim().replace(/[^0-9+]/g, "");
    const targetUid = await db.g("tel_" + cleanTel);
    if (!targetUid) { setInviteQarz({ tel: cleanTel, kim: qarzKim.trim(), summa: Number(qarzSum) }); return; }
    if (targetUid === user.id) return ok$(lg === "uz" ? "O'zingizga yubora olmaysiz" : "Cannot send to yourself", "err");

    const req = {
      id: Date.now(), fromUid: user.id, fromIsm: user.ism, fromTel: user.tel || "",
      toTel: cleanTel, tur: qarzTur, summa: Number(qarzSum),
      izoh: qarzIzoh, sana: qarzSana, qaytSana: qarzQaytSana, status: "pending",
    };
    const targetReqs = (await db.g("qreq_" + cleanTel)) || [];
    await db.s("qreq_" + cleanTel, [req, ...targetReqs]);

    const rN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "Yangi qarz so'rovi" : "New debt request", body: (user.ism || "") + " - " + fmtN(Number(qarzSum), val, true), sana: new Date().toISOString(), read: false };
    const rC = (await db.g("notif_" + targetUid)) || [];
    await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));

    const myItem = { id: req.id, uid: user.id, tur: qarzTur, kim: qarzKim.trim(), summa: Number(qarzSum), izoh: qarzIzoh, sana: qarzSana, qaytSana: qarzQaytSana, paid: false, paidSana: "", linked: true, linkedTel: cleanTel, linkStatus: "pending" };
    const upd = [myItem, ...(await freshQarz())];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    resetQarzForm();
    ok$(lg === "uz" ? "Qarz so'rovi yuborildi!" : "Debt request sent!");
  }, [qarzKim, qarzSum, qarzIzoh, qarzSana, qarzQaytSana, qarzTur, qarzTel, qarzLinked, user, qarzlar, xar, dar, ok$, lg, val, addQarz]);

  // So'rovni qabul qilish
  // Tasdiqlangandan keyin: qarz BERGAN balansidan (-), qarz OLGAN balansiga (+).
  // Qarz FAOL (paid:false) bo'lib qoladi — "qaytarildi" deb YOPILMAYDI.
  const acceptQarzReq = useCallback(async (req) => {
    const myTur = req.tur === "bergan" ? "olgan" : "bergan";

    // Balans tekshiruvi: men qarz BERUVCHI bo'lsam, balans yetarli bo'lishi shart
    if (myTur === "bergan" && getMyBal() < Number(req.summa)) {
      return ok$(
        lg === "uz"
          ? "❌ Siz qarz bera olmaysiz — sizda mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true) + ", Kerak: " + fmtN(Number(req.summa), val, true)
          : "❌ You cannot lend — insufficient balance!",
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
    await db.s("qreq_" + user.tel, newReqs);

    // Sender statusini yangilash + sender balansiga yozuv (IKKALA yo'nalishda ham)
    const senderUser = await db.g("user_" + req.fromUid);
    if (senderUser) {
      // MUHIM: senderUser.id o'rniga req.fromUid — user hujjatida id maydoni
      // bo'lmasa ham to'g'ri ishlashi uchun (KUTILMOQDA qolib ketish xatosi shu edi)
      const sOila = senderUser.oilaId || user.oilaId;
      const sq = (await db.g("qarz_" + sOila)) || [];
      await db.s("qarz_" + sOila, sq.map(q =>
        (q.id === req.id && q.uid !== user.id && (!q.uid || q.uid === req.fromUid || q.uid === senderUser.id)) ? { ...q, linkStatus: "accepted" } : q));
      if (req.tur === "bergan") {
        // Sender qarz BERGAN → sender balansidan xarajat (-)
        const xItem = { id: Date.now() + 2, kategoriya: "qarz", summa: req.summa, izoh: (lg === "uz" ? "Qarz berildi (tasdiqlangan): " : "Loan given: ") + user.ism, sana: req.sana, vaqt: nt(), uid: req.fromUid, repeat: false, fromQarz: req.id };
        const xk = "x_" + sOila + "_" + req.fromUid;
        await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      } else {
        // Sender qarz OLGAN → sender balansiga daromad (+)
        const dItem = { id: Date.now() + 2, tur: "qarz", summa: req.summa, izoh: (lg === "uz" ? "Qarz olindi (tasdiqlangan): " : "Loan received: ") + user.ism, sana: req.sana, vaqt: nt(), uid: req.fromUid, fromQarz: req.id };
        const dk = "d_" + sOila + "_" + req.fromUid;
        await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      }
      // Sender'ga xabar
      const sN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "✅ Qarz tasdiqlandi" : "Debt confirmed", body: (user.ism || "") + " " + (lg === "uz" ? "qarzni tasdiqladi" : "confirmed the debt") + ": " + fmtN(Number(req.summa), val, true), sana: new Date().toISOString(), read: false };
      const sC = (await db.g("notif_" + req.fromUid)) || [];
      await db.s("notif_" + req.fromUid, [sN, ...sC].slice(0, 100));
    }

    // O'z balansga bog'lash
    if (myTur === "olgan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: req.summa, izoh: (lg === "uz" ? "Qarz olindi (tasdiqlangan): " : "Loan received: ") + req.fromIsm, sana: req.sana, vaqt: nt(), uid: user.id, fromQarz: req.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
    }
    if (myTur === "bergan") {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: req.summa, izoh: (lg === "uz" ? "Qarz berildi: " : "Loan given: ") + req.fromIsm, sana: req.sana, vaqt: nt(), uid: user.id, repeat: false, fromQarz: req.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
    }
    ok$(lg === "uz" ? "Qarz tasdiqlandi va balansga bog'landi! ✅" : "Debt confirmed! ✅");
  }, [qarzlar, qarzReqs, user, xar, dar, ok$, lg, val]);

  // So'rovni rad etish
  const rejectQarzReq = useCallback(async (req) => {
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    await db.s("qreq_" + user.tel, newReqs);
    const senderUser = await db.g("user_" + req.fromUid);
    if (senderUser) {
      const sq = (await db.g("qarz_" + senderUser.oilaId)) || [];
      await db.s("qarz_" + senderUser.oilaId, sq.map(q => (q.id === req.id && (!q.uid || q.uid === req.fromUid || q.uid === senderUser.id)) ? { ...q, linkStatus: "rejected" } : q));
    }
    ok$(lg === "uz" ? "Rad etildi" : "Rejected", "warn");
  }, [qarzReqs, user, ok$, lg]);

  // Qarzni to'langan deb belgilash
  const markQarzPaid = useCallback(async (id) => {
    const list = await freshQarz();
    const q = list.find(x => x.id === id && (!x.uid || x.uid === user.id));
    // Men qarzdorman va qaytarmoqchiman → balans yetarli bo'lishi shart (minusga tushmaslik)
    if (q && q.tur === "olgan" && getMyBal() < Number(q.summa)) {
      return ok$(
        lg === "uz"
          ? "❌ Qarzingizni qaytarishingiz uchun mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
          : "❌ Insufficient balance to repay!",
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
        const targetReqs = (await db.g("qreq_" + q.linkedTel)) || [];
        await db.s("qreq_" + q.linkedTel, [payReq, ...targetReqs]);
        const rN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "Qarz qaytarish so'rovi" : "Debt return request", body: (user.ism || "") + " " + (lg === "uz" ? "qarzni qaytardim deyapti" : "says debt is returned") + ": " + fmtN(q.summa, val, true), sana: new Date().toISOString(), read: false };
        const rC = (await db.g("notif_" + targetUid)) || [];
        await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
        ok$(lg === "uz" ? "Qaytarish so'rovi yuborildi!" : "Return request sent!");
        return;
      }
    }
    // Bog'lanmagan qarz: darhol yopiladi va balansga AVTOMATIK yoziladi (so'rovsiz)
    const upd = list.map(x => (x.id === id && (!x.uid || x.uid === user.id)) ? { ...x, paid: true, paidSana: td() } : x);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    if (q) {
      if (q.tur === "bergan") {
        const dItem = { id: Date.now() + 1, tur: "qarz", summa: Number(q.summa), izoh: (lg === "uz" ? "Qarz qaytdi: " : "Debt returned: ") + q.kim, sana: td(), vaqt: nt(), uid: user.id, fromQarz: q.id };
        const dk = "d_" + user.oilaId + "_" + user.id;
        await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
        setDar(d => [dItem, ...d]);
        ok$(lg === "uz" ? "Qaytarib olindi! Balansga qo'shildi: +" + fmtN(Number(q.summa), val, true) : "Returned! Added to balance");
      } else {
        const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: Number(q.summa), izoh: (lg === "uz" ? "Qarz qaytarildi: " : "Debt repaid: ") + q.kim, sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: q.id };
        const xk = "x_" + user.oilaId + "_" + user.id;
        await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
        setXar(x => [xItem, ...x]);
        ok$(lg === "uz" ? "Qaytarildi! Balansdan yechildi: -" + fmtN(Number(q.summa), val, true) : "Repaid! Deducted from balance");
      }
    }
  }, [qarzlar, user, xar, dar, ok$, lg, val]);

  // Qisman qaytarish
  const applyPartial = useCallback(async () => {
    if (!partialQarz || !partialSum || Number(partialSum) <= 0) return ok$(lg === "uz" ? "Summa kiriting" : "Enter amount", "err");
    const pay = Number(partialSum);
    const q = partialQarz;
    if (pay >= q.summa) { setPartialQarz(null); setPartialSum(""); markQarzPaid(q.id); return; }
    // Qarzdor qisman qaytaryapti → balans yetarli bo'lishi shart
    if (q.tur === "olgan" && getMyBal() < pay) {
      return ok$(
        lg === "uz"
          ? "❌ Qarzingizni qaytarishingiz uchun mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
          : "❌ Insufficient balance to repay!",
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
        const targetReqs = (await db.g("qreq_" + q.linkedTel)) || [];
        await db.s("qreq_" + q.linkedTel, [payReq, ...targetReqs]);
        const rN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "Qisman qaytarish so'rovi" : "Partial return request", body: (user.ism || "") + " " + (lg === "uz" ? "qisman qaytardim deyapti" : "says partially returned") + ": " + fmtN(pay, val, true), sana: new Date().toISOString(), read: false };
        const rC = (await db.g("notif_" + targetUid)) || [];
        await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
        setPartialQarz(null); setPartialSum("");
        ok$(lg === "uz" ? "Qisman qaytarish so'rovi yuborildi! Tasdiq kutilmoqda." : "Partial return request sent!");
        return;
      }
    }
    // Bog'lanmagan qarz: darhol qo'llanadi + balansga AVTOMATIK yoziladi
    const paidSoFar = (q.paidPart || 0) + pay;
    const upd = (await freshQarz()).map(x => (x.id === q.id && (!x.uid || x.uid === user.id)) ? { ...x, summa: x.summa - pay, paidPart: paidSoFar, asl: x.asl || q.summa + (q.paidPart || 0) } : x);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    if (q.tur === "bergan") {
      const dItem = { id: Date.now() + 1, tur: "qarz", summa: pay, izoh: (lg === "uz" ? "Qarz qisman qaytdi: " : "Partial return: ") + q.kim, sana: td(), vaqt: nt(), uid: user.id, fromQarz: q.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
      setDar(d => [dItem, ...d]);
    } else {
      const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: pay, izoh: (lg === "uz" ? "Qarz qisman qaytarildi: " : "Partial repayment: ") + q.kim, sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: q.id };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      setXar(x => [xItem, ...x]);
    }
    setPartialQarz(null); setPartialSum("");
    ok$(lg === "uz" ? "Qisman qaytarildi: " + fmtN(pay, val, true) + ". Qoldi: " + fmtN(q.summa - pay, val, true) : "Partial payment done");
  }, [partialQarz, partialSum, qarzlar, user, xar, dar, ok$, lg, val, markQarzPaid]);

  // Qarzni o'chirish
  const delQarz = useCallback(async (id) => {
    const upd = (await freshQarz()).filter(q => !(q.id === id && (!q.uid || q.uid === user.id)));
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
  }, [qarzlar, user]);

  // Eslatma yuborish
  const sendQarzReminder = useCallback(async (q) => {
    if (!q.linked || !q.linkedTel) {
      const msg = (lg === "uz" ? "Assalomu alaykum! " + fmtN(q.summa, val, true) + " qarz haqida eslatma." : "Debt reminder: " + fmtN(q.summa, val, true));
      try { navigator.clipboard.writeText(msg); ok$(lg === "uz" ? "Nusxalandi!" : "Copied!"); } catch { ok$(msg); }
      return;
    }
    const targetUid = await db.g("tel_" + q.linkedTel);
    if (targetUid) {
      const rN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "🔔 Qarz eslatmasi" : "Debt reminder", body: (user.ism || "") + " " + (lg === "uz" ? "qarz haqida eslatma yubordi" : "sent a debt reminder") + ": " + fmtN(q.summa, val, true), sana: new Date().toISOString(), read: false };
      const rC = (await db.g("notif_" + targetUid)) || [];
      await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
      ok$(lg === "uz" ? "Eslatma yuborildi!" : "Reminder sent!");
    }
  }, [user, ok$, lg, val]);

  // Daromad/xarajatga qo'shish
  const addQarzAsDaromad = useCallback(async (q) => {
    const item = { id: Date.now(), tur: "boshqa", summa: q.summa, izoh: (lg === "uz" ? "Qarz qaytishi: " : "Debt return: ") + q.kim, sana: td(), vaqt: nt() };
    const key = "d_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setDar(d => [{ ...item, uid: user.id }, ...d]);
    setQarzDonePrompt(null);
    ok$(lg === "uz" ? "Daromadlarga qo'shildi! +" + fmtN(q.summa, val, true) : "Added to income!");
  }, [user, ok$, lg, val]);

  const addQarzAsXarajat = useCallback(async (q) => {
    if (getMyBal() < Number(q.summa)) {
      return ok$(
        lg === "uz"
          ? "❌ Balans yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
          : "❌ Insufficient balance!",
        "err"
      );
    }
    const item = { id: Date.now(), kategoriya: "boshqa", summa: q.summa, izoh: (lg === "uz" ? "Qarz qaytarish: " : "Debt payment: ") + q.kim, sana: td(), vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setXar(x => [{ ...item, uid: user.id }, ...x]);
    setQarzDonePrompt(null);
    ok$(lg === "uz" ? "Xarajatlarga qo'shildi! -" + fmtN(q.summa, val, true) : "Added to expenses!");
  }, [user, xar, dar, ok$, lg, val]);

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
        lg === "uz"
          ? "❌ Qarzingizni qaytarishingiz uchun mablag' yetarli emas! Balans: " + fmtN(Math.max(0, getMyBal()), val, true)
          : "❌ Insufficient balance to repay!",
        "err"
      );
    }
    const upd = list.map(q => (q.id === req.debtId && (!q.uid || q.uid === user.id))
      ? (closeIt
          ? { ...q, paid: true, paidSana: td(), payStatus: "confirmed" }
          : { ...q, summa: Number(q.summa) - paySum, paidPart: (q.paidPart || 0) + paySum, asl: q.asl || Number(q.summa) + (q.paidPart || 0), payStatus: null, payBy: null })
      : q);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    // MENING balansimga avtomatik yozuv (hech qanday qo'shimcha so'rovsiz)
    if (doneQ && paySum > 0) {
      if (doneQ.tur === "bergan") {
        const dItem = { id: Date.now() + 1, tur: "qarz", summa: paySum, izoh: (lg === "uz" ? "Qarz qaytdi: " : "Debt returned: ") + doneQ.kim, sana: td(), vaqt: nt(), uid: user.id, fromQarz: doneQ.id };
        const dk = "d_" + user.oilaId + "_" + user.id;
        await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
        setDar(d => [dItem, ...d]);
      } else {
        const xItem = { id: Date.now() + 1, kategoriya: "qarz", summa: paySum, izoh: (lg === "uz" ? "Qarz qaytarildi: " : "Debt repaid: ") + doneQ.kim, sana: td(), vaqt: nt(), uid: user.id, repeat: false, fromQarz: doneQ.id };
        const xk = "x_" + user.oilaId + "_" + user.id;
        await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
        setXar(x => [xItem, ...x]);
      }
    }
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    await db.s("qreq_" + user.tel, newReqs);
    const fromUser = await db.g("user_" + req.fromUid);
    if (fromUser) {
      const fOila = fromUser.oilaId || user.oilaId;
      const fq = (await db.g("qarz_" + fOila)) || [];
      await db.s("qarz_" + fOila, fq.map(q =>
        (q.id === req.debtId && q.uid !== user.id && (!q.uid || q.uid === req.fromUid || q.uid === fromUser.id))
          ? (closeIt
              ? { ...q, paid: true, paidSana: td(), payStatus: "confirmed" }
              : { ...q, summa: Number(q.summa) - paySum, paidPart: (q.paidPart || 0) + paySum, asl: q.asl || Number(q.summa) + (q.paidPart || 0), payStatus: null, payBy: null })
          : q));
      const fromDebt = fq.find(q => q.id === req.debtId && q.uid !== user.id && (!q.uid || q.uid === req.fromUid || q.uid === fromUser.id));
      if (fromDebt && paySum > 0) {
        // Qaytarish tasdiqlandi → sender balansiga avtomatik teskari yozuv
        if (fromDebt.tur === "bergan") {
          // Sender qarz bergan edi, endi qaytarib oldi → daromad (+)
          const dItem = { id: Date.now() + 3, tur: "qarz", summa: paySum, izoh: (lg === "uz" ? (closeIt ? "Qarz qaytdi: " : "Qarz qisman qaytdi: ") : "Debt returned: ") + fromDebt.kim, sana: td(), vaqt: nt(), uid: req.fromUid, fromQarz: fromDebt.id };
          const dk = "d_" + fOila + "_" + req.fromUid;
          await db.s(dk, [dItem, ...((await db.g(dk)) || [])]);
          if (req.fromUid === user.id) setDar(d => [dItem, ...d]);
        } else {
          // Sender qarz olgan edi, endi qaytardi → xarajat (-)
          const xItem = { id: Date.now() + 3, kategoriya: "qarz", summa: paySum, izoh: (lg === "uz" ? (closeIt ? "Qarz qaytarildi: " : "Qarz qisman qaytarildi: ") : "Debt repaid: ") + fromDebt.kim, sana: td(), vaqt: nt(), uid: req.fromUid, repeat: false, fromQarz: fromDebt.id };
          const xk = "x_" + fOila + "_" + req.fromUid;
          await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
          if (req.fromUid === user.id) setXar(x => [xItem, ...x]);
        }
        const pN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? (closeIt ? "✅ Qarz qaytarishi tasdiqlandi" : "✅ Qisman qaytarish tasdiqlandi") : "Return confirmed", body: (user.ism || "") + ": " + fmtN(paySum, val, true), sana: new Date().toISOString(), read: false };
        const pC = (await db.g("notif_" + req.fromUid)) || [];
        await db.s("notif_" + req.fromUid, [pN, ...pC].slice(0, 100));
      }
    }
    ok$(lg === "uz" ? (closeIt ? "Qaytarish tasdiqlandi! Balansga yozildi." : "Qisman qaytarish tasdiqlandi! Balansga yozildi.") : "Return confirmed!");
  }, [qarzlar, qarzReqs, user, xar, dar, ok$, lg, val]);

  const rejectPayReq = useCallback(async (req) => {
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    await db.s("qreq_" + user.tel, newReqs);
    const fromUser = await db.g("user_" + req.fromUid);
    if (fromUser) {
      const fq = (await db.g("qarz_" + fromUser.oilaId)) || [];
      await db.s("qarz_" + fromUser.oilaId, fq.map(q => (q.id === req.debtId && (!q.uid || q.uid === req.fromUid || q.uid === fromUser.id)) ? { ...q, payStatus: null, payBy: null } : q));
    }
    ok$(lg === "uz" ? "Qaytarish rad etildi" : "Return rejected", "warn");
  }, [qarzReqs, user, ok$, lg]);

  // To'liq yangilash: so'rovlar, qarzlar, bildirishnomalar VA balans (xarajat/daromad)
  // silent === true bo'lsa toast ko'rsatilmaydi (avtomatik sinxronizatsiya uchun)
  const refreshQarzReqs = useCallback(async (silent) => {
    if (!user?.id) return;
    try {
      if (user.tel) setQarzReqs((await db.g("qreq_" + user.tel)) || []);
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
      if (silent !== true) ok$(lg === "uz" ? "Yangilandi" : "Refreshed");
    } catch (e) { console.error("refreshQarzReqs:", e); }
  }, [user, azolar, ok$, lg]);

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
