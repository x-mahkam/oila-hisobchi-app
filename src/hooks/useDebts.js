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
    const upd = [item, ...qarzlar];
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
    const upd = [myItem, ...qarzlar];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    resetQarzForm();
    ok$(lg === "uz" ? "Qarz so'rovi yuborildi!" : "Debt request sent!");
  }, [qarzKim, qarzSum, qarzIzoh, qarzSana, qarzQaytSana, qarzTur, qarzTel, qarzLinked, user, qarzlar, ok$, lg, val, addQarz]);

  // So'rovni qabul qilish
  const acceptQarzReq = useCallback(async (req) => {
    const myTur = req.tur === "bergan" ? "olgan" : "bergan";
    const item = { id: req.id, tur: myTur, kim: req.fromIsm, summa: req.summa, izoh: req.izoh, sana: req.sana, qaytSana: req.qaytSana, paid: false, paidSana: "", linked: true, linkedTel: req.fromTel, linkStatus: "accepted" };
    const upd = [item, ...qarzlar];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);

    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    await db.s("qreq_" + user.tel, newReqs);

    // Sender statusini yangilash
    const senderUser = await db.g("user_" + req.fromUid);
    if (senderUser) {
      const sq = (await db.g("qarz_" + senderUser.oilaId)) || [];
      await db.s("qarz_" + senderUser.oilaId, sq.map(q => q.id === req.id ? { ...q, linkStatus: "accepted" } : q));
      if (req.tur === "bergan") {
        const xItem = { id: Date.now() + 2, kategoriya: "qarz", summa: req.summa, izoh: (lg === "uz" ? "Qarz berildi (tasdiqlangan): " : "Loan given: ") + user.ism, sana: req.sana, vaqt: nt(), uid: senderUser.id, repeat: false, fromQarz: req.id };
        const xk = "x_" + senderUser.oilaId + "_" + senderUser.id;
        await db.s(xk, [xItem, ...((await db.g(xk)) || [])]);
      }
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
  }, [qarzlar, qarzReqs, user, xar, dar, ok$, lg]);

  // So'rovni rad etish
  const rejectQarzReq = useCallback(async (req) => {
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    await db.s("qreq_" + user.tel, newReqs);
    const senderUser = await db.g("user_" + req.fromUid);
    if (senderUser) {
      const sq = (await db.g("qarz_" + senderUser.oilaId)) || [];
      await db.s("qarz_" + senderUser.oilaId, sq.map(q => q.id === req.id ? { ...q, linkStatus: "rejected" } : q));
    }
    ok$(lg === "uz" ? "Rad etildi" : "Rejected", "warn");
  }, [qarzReqs, user, ok$, lg]);

  // Qarzni to'langan deb belgilash
  const markQarzPaid = useCallback(async (id) => {
    const q = qarzlar.find(x => x.id === id);
    if (q?.linked && q?.linkStatus === "accepted" && q?.linkedTel) {
      const targetUid = await db.g("tel_" + q.linkedTel);
      if (targetUid) {
        const upd = qarzlar.map(x => x.id === id ? { ...x, payStatus: "pending", payBy: user.id } : x);
        await db.s("qarz_" + user.oilaId, upd);
        setQarzlar(upd);
        const payReq = { id: "pay_" + id, debtId: id, fromUid: user.id, fromIsm: user.ism, fromTel: user.tel || "", toTel: q.linkedTel, summa: q.summa, kim: q.kim, tur: q.tur, sana: td(), type: "payment" };
        const targetReqs = (await db.g("qreq_" + q.linkedTel)) || [];
        await db.s("qreq_" + q.linkedTel, [payReq, ...targetReqs]);
        const rN = { id: Date.now() + Math.random(), type: "qarz", title: lg === "uz" ? "Qarz qaytarish so'rovi" : "Debt return request", body: (user.ism || "") + " " + (lg === "uz" ? "qarzni qaytardim deyapti" : "says debt is returned") + ": " + fmtN(q.summa, val, true), sana: new Date().toISOString(), read: false };
        const rC = (await db.g("notif_" + targetUid)) || [];
        await db.s("notif_" + targetUid, [rN, ...rC].slice(0, 100));
        ok$(lg === "uz" ? "Qaytarish so'rovi yuborildi!" : "Return request sent!");
        return;
      }
    }
    const upd = qarzlar.map(x => x.id === id ? { ...x, paid: true, paidSana: td() } : x);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    if (q) setQarzDonePrompt(q);
    ok$(lg === "uz" ? "Qaytarilgan deb belgilandi" : "Marked as paid");
  }, [qarzlar, user, ok$, lg, val]);

  // Qisman qaytarish
  const applyPartial = useCallback(async () => {
    if (!partialQarz || !partialSum || Number(partialSum) <= 0) return ok$(lg === "uz" ? "Summa kiriting" : "Enter amount", "err");
    const pay = Number(partialSum);
    const q = partialQarz;
    if (pay >= q.summa) { setPartialQarz(null); setPartialSum(""); markQarzPaid(q.id); return; }
    const paidSoFar = (q.paidPart || 0) + pay;
    const upd = qarzlar.map(x => x.id === q.id ? { ...x, summa: x.summa - pay, paidPart: paidSoFar, asl: x.asl || q.summa + (q.paidPart || 0) } : x);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    setPartialQarz(null); setPartialSum("");
    ok$(lg === "uz" ? "Qisman qaytarildi: " + fmtN(pay, val, true) + ". Qoldi: " + fmtN(q.summa - pay, val, true) : "Partial payment done");
    setQarzDonePrompt({ ...q, summa: pay, _partial: true });
  }, [partialQarz, partialSum, qarzlar, user, ok$, lg, val, markQarzPaid]);

  // Qarzni o'chirish
  const delQarz = useCallback(async (id) => {
    const upd = qarzlar.filter(q => q.id !== id);
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
    const item = { id: Date.now(), kategoriya: "boshqa", summa: q.summa, izoh: (lg === "uz" ? "Qarz qaytarish: " : "Debt payment: ") + q.kim, sana: td(), vaqt: nt(), repeat: false };
    const key = "x_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...((await db.g(key)) || [])]);
    setXar(x => [{ ...item, uid: user.id }, ...x]);
    setQarzDonePrompt(null);
    ok$(lg === "uz" ? "Xarajatlarga qo'shildi! -" + fmtN(q.summa, val, true) : "Added to expenses!");
  }, [user, ok$, lg, val]);

  // Qaytarishni tasdiqlash
  const acceptPayReq = useCallback(async (req) => {
    const upd = qarzlar.map(q => q.id === req.debtId ? { ...q, paid: true, paidSana: td(), payStatus: "confirmed" } : q);
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    const doneQ = qarzlar.find(q => q.id === req.debtId);
    if (doneQ) setQarzDonePrompt({ ...doneQ, paid: true });
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    await db.s("qreq_" + user.tel, newReqs);
    const fromUser = await db.g("user_" + req.fromUid);
    if (fromUser) {
      const fq = (await db.g("qarz_" + fromUser.oilaId)) || [];
      await db.s("qarz_" + fromUser.oilaId, fq.map(q => q.id === req.debtId ? { ...q, paid: true, paidSana: td(), payStatus: "confirmed" } : q));
      const fromDebt = fq.find(q => q.id === req.debtId);
      if (fromDebt) await db.s("paydone_" + req.fromUid, { tur: fromDebt.tur, summa: fromDebt.summa, kim: fromDebt.kim, id: fromDebt.id });
    }
    ok$(lg === "uz" ? "Qaytarish tasdiqlandi!" : "Return confirmed!");
  }, [qarzlar, qarzReqs, user, ok$, lg]);

  const rejectPayReq = useCallback(async (req) => {
    const newReqs = qarzReqs.filter(r => r.id !== req.id);
    setQarzReqs(newReqs);
    await db.s("qreq_" + user.tel, newReqs);
    const fromUser = await db.g("user_" + req.fromUid);
    if (fromUser) {
      const fq = (await db.g("qarz_" + fromUser.oilaId)) || [];
      await db.s("qarz_" + fromUser.oilaId, fq.map(q => q.id === req.debtId ? { ...q, payStatus: null, payBy: null } : q));
    }
    ok$(lg === "uz" ? "Qaytarish rad etildi" : "Return rejected", "warn");
  }, [qarzReqs, user, ok$, lg]);

  const refreshQarzReqs = useCallback(async () => {
    if (user?.tel) {
      setQarzReqs((await db.g("qreq_" + user.tel)) || []);
      setQarzlar((await db.g("qarz_" + user.oilaId)) || []);
      setNotifs((await db.g("notif_" + user.id)) || []);
      ok$(lg === "uz" ? "Yangilandi" : "Refreshed");
    }
  }, [user, ok$, lg]);

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
