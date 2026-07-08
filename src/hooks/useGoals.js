import { useCallback, useState } from "react";
import { db } from "../firebase.js";
import { td, nt, f } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";

export function useGoals() {
  const { user, oila, azolar, maq, setMaq, xar, setXar, dar, setDar,
          kidBalances, setKidBalances, notifs, setNotifs,
          ok$, buzz, addStar, addNotif, fireConfetti, lg, isPremium,
          setMaqsadConfirmNotif } = useApp();

  const [tupId, setTupId] = useState(null);
  const [tupS, setTupS]   = useState("");

  const [editMq,   setEditMq]   = useState(null);
  const [editMqS,  setEditMqS]  = useState("");
  const [editMqN,  setEditMqN]  = useState("");

  const notifyTo = async (uid, type, title, text, extra = {}) => {
    try {
      const cur = (await db.g("notif_" + uid)) || [];
      await db.s("notif_" + uid, [{ id: Date.now() + Math.random(), type, title, text, sana: new Date().toISOString(), read: false, ...extra }, ...cur].slice(0, 100));
    } catch (e) {}
  };

  const boshIdOf = () => oila?.boshId || azolar.find(a => a.rol === "bosh")?.id;

  const addMq = useCallback(async ({ ism, maqsad, rang, shared }) => {
    if (!ism?.trim() || !maqsad || Number(maqsad) <= 0) {
      return ok$(lg==="uz"?"Barcha maydonlarni to'ldiring":"Fill all fields", "err");
    }
    const myGoals = maq.filter(m => m.uid === user.id).length;
    if (!isPremium && myGoals >= 3) {
      return ok$(
        lg === "uz"
          ? "⚠️ Bepul rejada 3 tagacha maqsad. Yangi qo'shish uchun eskisini yoping yoki Premium oling."
          : "⚠️ Free plan: up to 3 goals.",
        "err"
      );
    }

    const isFamily = shared === true;
    const u = [...maq, {
      id:Date.now(), ism:ism.trim(), maqsad:Number(maqsad),
      jamg:0, rang, createdAt:td(), uid:user.id, status:"active",
      shared: isFamily,
      type: isFamily ? "family" : "personal",
      contribs: [],
      lastContrib: null
    }];
    await db.s("maq_" + user.oilaId, u);
    setMaq(u);
    addStar(20, lg==="uz"?"Maqsad yaratildi":"Goal created");
    ok$(lg==="uz"?"Maqsad qo'shildi":"Goal added");
  }, [maq, user, ok$, addStar, isPremium, lg]);

  const tupMq = useCallback(async () => {
    if (!tupS || Number(tupS) <= 0) return;
    const summa = Number(tupS);
    const isKid = user?.rol === "kid";

    if (!isKid) {
      const myDar = dar.filter(d=>d.uid===user.id||!d.uid).reduce((s,d)=>s+Number(d.summa||0),0);
      const myXar = xar.filter(x=>x.uid===user.id||!x.uid).reduce((s,x)=>s+Number(x.summa||0),0);
      if (myDar - myXar < summa) {
        return ok$(lg==="uz"?"❌ Balansda yetarli mablag' yo'q!":"❌ Insufficient balance!", "err");
      }
      const xItem = {
        id:Date.now(), kategoriya:"maqsad", summa,
        izoh:(lg==="uz"?"Maqsad to'plami: ":"Goal savings: ")+(maq.find(m=>m.id===tupId)?.ism||""),
        sana:td(), vaqt:new Date().toTimeString().slice(0,5), uid:user.id, repeat:false, forGoal:tupId
      };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk))||[])]);
      setXar(x => [xItem, ...x]);
    } else {
      const myPocket = Number(kidBalances?.[user.id] || 0);
      if (myPocket < summa) {
        return ok$(
          lg === "uz"
            ? "❌ Cho'ntak pulingiz yetarli emas! Sizda: " + f(myPocket, true)
            : "❌ Not enough pocket money!",
          "err"
        );
      }
      const kb = { ...(kidBalances || {}) };
      kb[user.id] = myPocket - summa;
      await db.s("kidbal_" + user.oilaId, kb);
      setKidBalances(kb);
      try {
        const led = (await db.g("kidledger_" + user.id)) || [];
        const d = new Date();
        const sana = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        await db.s("kidledger_" + user.id, [{ id: Date.now(), tur: "spend", summa, sana, izoh: "goal" }, ...led].slice(0, 200));
      } catch {}
    }

    const tgtGoal = maq.find(m=>m.id===tupId);
    const wasComplete = tgtGoal && (tgtGoal.jamg+summa) >= tgtGoal.maqsad && tgtGoal.jamg < tgtGoal.maqsad;
    const completedNow = wasComplete ? td() : undefined;
    const contribRec = { uid: user.id, ism: user.ism || "", summa, at: new Date().toISOString() };
    const u = maq.map(m => m.id===tupId
      ? {...m, jamg:Math.min(m.maqsad, m.jamg+summa), ...(wasComplete?{completedAt:completedNow}:{}),
         contribs: [ ...(Array.isArray(m.contribs) ? m.contribs : []), contribRec ],
         lastContrib: contribRec }
      : m
    );

    if (wasComplete) {
      fireConfetti(); buzz(20);
      addStar(10, lg==="uz"?"Maqsadga yetildi: "+(tgtGoal?.ism||""):"Goal reached: "+(tgtGoal?.ism||""));
      if (isKid) {
        const boshId = oila?.boshId || azolar.find(a=>a.rol==="bosh")?.id;
        if (boshId && boshId !== user.id) {
          try {
            const bn = (await db.g("notif_" + boshId)) || [];
            await db.s("notif_" + boshId, [{
              id:Date.now(), type:"maqsad_confirm",
              title:lg==="uz"?"🎯 Farzandingiz orzusiga yetdi!":"🎯 Your child reached their goal!",
              text:(lg==="uz"?user.ism+"'ning '":user.ism+"'s '")+(tgtGoal?.ism||"")+(lg==="uz"?"' orzusi! Sotib oldingizmi?":"' goal reached! Did you buy it?"),
              maqsadId:tgtGoal?.id, kidId:user.id, kidIsm:user.ism,
              maqsadIsm:tgtGoal?.ism||"", summa:tgtGoal?.maqsad||0,
              sana:new Date().toISOString(), read:false, status:"pending"
            }, ...bn]);
            const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
            await db.s("maq_" + user.oilaId, maqUpd.map(m=>m.id===tgtGoal?.id?{...m,status:"waiting_parent"}:m));
          } catch {}
        }
        addNotif("yangilik", lg==="uz"?"🎉 Orzungizga yetdingiz!":"🎉 Goal reached!",
          (tgtGoal?.ism||"")+" "+(lg==="uz"?"uchun pul to'plandi!":"funded!"));
      } else {
        if (typeof setMaqsadConfirmNotif === "function") {
          setMaqsadConfirmNotif({ type:"self_confirm", maqsadId:tgtGoal?.id, maqsadIsm:tgtGoal?.ism||"", summa:tgtGoal?.maqsad||0 });
        }
      }
    }

    await db.s("maq_" + user.oilaId, u);
    setMaq(u);
    setTupId(null); setTupS("");
    ok$(isKid?(lg==="uz"?"Orzungizga "+f(summa,true)+" jamg'arildi! 🌟":"Saved!"):lg==="uz"?"Yangilandi":"Updated");
  }, [tupId, tupS, maq, user, oila, azolar, xar, dar, kidBalances, ok$, buzz, addStar, addNotif, fireConfetti, lg, setMaqsadConfirmNotif, f]);

  const delMq = useCallback(async (id) => {
    const goal = maq.find(m=>m.id===id);
    if (goal?.jamg > 0 && !goal?.paid && user?.rol === "kid") {
      const kb = { ...(kidBalances || {}) };
      kb[user.id] = (Number(kb[user.id]) || 0) + Number(goal.jamg);
      await db.s("kidbal_" + user.oilaId, kb);
      setKidBalances(kb);
      ok$(lg === "uz" ? "Pul cho'ntagingizga qaytarildi: +" + f(goal.jamg, true) : "Returned to pocket money");
    }
    if (goal?.jamg > 0 && !goal?.paid && user?.rol !== "kid") {
      const dItem = {
        id:Date.now(), tur:"boshqa", summa:goal.jamg,
        izoh:(lg==="uz"?"Maqsad o'chirildi, pul qaytarildi: ":"Goal deleted, funds returned: ")+(goal.ism||""),
        sana:td(), vaqt:new Date().toTimeString().slice(0,5), uid:user.id
      };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk))||[])]);
    }
    const u = maq.filter(m=>m.id!==id);
    await db.s("maq_" + user.oilaId, u);
    setMaq(u);
  }, [maq, user, kidBalances, ok$, lg, f]);

  const confirmMaqParent = useCallback(async (notif) => {
    try {
      const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
      const finalMaq = maqUpd.map(m => m.id === notif.maqsadId ? { ...m, status: "parent_confirmed", parentConfirmedAt: new Date().toISOString() } : m);
      await db.s("maq_" + user.oilaId, finalMaq); setMaq(finalMaq);
      const kn = (await db.g("notif_" + notif.kidId)) || [];
      await db.s("notif_" + notif.kidId, [{ id: Date.now(), type: "maqsad_kid_confirm", title: lg === "uz" ? "🎁 Ota/onang orzuingni amalga oshirdi!" : "🎁 Parent fulfilled your dream!", text: (lg === "uz" ? "'" + (notif.maqsadIsm || "") + "' sotib olindi! Siz ham tasdiqlang 👇" : "Was bought! Confirm below 👇"), maqsadId: notif.maqsadId, maqsadIsm: notif.maqsadIsm, sana: new Date().toISOString(), read: false, status: "pending" }, ...kn]);
      const myN = notifs.map(n => n.id === notif.id ? { ...n, read: true, status: "confirmed" } : n);
      setNotifs(myN); await db.s("notif_" + user.id, myN);
      fireConfetti(); buzz(20);
      ok$(lg === "uz" ? "✅ Tasdiqlandi! Farzandingizga xabar yuborildi 🎉" : "✅ Confirmed!");
    } catch { ok$(lg === "uz" ? "Xato" : "Error", "err"); }
  }, [user, notifs, setNotifs, setMaq, fireConfetti, buzz, ok$, lg]);

  const confirmMaqKid = useCallback(async (notif) => {
    try {
      const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
      const finalMaq = maqUpd.map(m => m.id === notif.maqsadId ? { ...m, status: "completed", completedAt: new Date().toISOString(), paid: true } : m);
      await db.s("maq_" + user.oilaId, finalMaq); setMaq(finalMaq);
      const myN = notifs.map(n => n.id === notif.id ? { ...n, read: true, status: "confirmed" } : n);
      setNotifs(myN); await db.s("notif_" + user.id, myN);
      fireConfetti(); buzz(30);
      ok$(lg === "uz" ? "🎉 Barakalla! Orzuingiz amalga oshdi!" : "🎉 Congratulations!");
    } catch (e) { ok$((lg === "uz" ? "Xato: " : "Error: ") + (e.message || ""), "err"); }
  }, [user, notifs, setNotifs, setMaq, fireConfetti, buzz, ok$, lg]);

  const parentBoughtMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "parent_confirmed", parentConfirmedAt: new Date().toISOString(), parentLater: false } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    await notifyTo(goal.uid, "maqsad_kid_confirm",
      lg === "uz" ? "🎁 Ota/onang orzuingni amalga oshirdi!" : "🎁 Parent fulfilled your dream!",
      "'" + (goal.ism || "") + "' " + (lg === "uz" ? "sotib olindi! Maqsad bo'limida tasdiqlang" : "was bought! Confirm in Goals"),
      { maqsadId: goal.id, maqsadIsm: goal.ism, status: "pending" });
    fireConfetti(); buzz(20);
    ok$(lg === "uz" ? "✅ Farzandingizga xabar yuborildi — u tasdiqlaydi" : "✅ Sent to child for confirmation");
  }, [maq, setMaq, user, fireConfetti, buzz, ok$, lg]);

  const parentLaterMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, parentLater: true, parentLaterAt: new Date().toISOString() } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    await notifyTo(goal.uid, "yangilik",
      lg === "uz" ? "⏰ Orzuing esda!" : "⏰ Dream noted!",
      (lg === "uz" ? "Ota-onangiz '" : "Parent will buy '") + (goal.ism || "") + (lg === "uz" ? "'ni keyinroq olib berishini aytdi" : "' later"));
    ok$(lg === "uz" ? "Farzandingizga xabar berildi ⏰" : "Child notified ⏰");
  }, [maq, setMaq, user, ok$, lg]);

  const kidAcceptMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "completed", paid: true, completedAt: new Date().toISOString() } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    const b = boshIdOf();
    if (b) await notifyTo(b, "yangilik", lg === "uz" ? "🎉 Orzu amalga oshdi!" : "🎉 Dream fulfilled!",
      (user.ism || "") + " '" + (goal.ism || "") + "' " + (lg === "uz" ? "orzusini tasdiqladi. Rahmat!" : "confirmed."));
    fireConfetti(); buzz(30);
    ok$(lg === "uz" ? "🎉 Barakalla! Orzuingiz amalga oshdi!" : "🎉 Congratulations!");
  }, [maq, setMaq, user, oila, azolar, fireConfetti, buzz, ok$, lg]);

  const kidRejectMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "waiting_parent", parentConfirmedAt: null } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    const b = boshIdOf();
    if (b) await notifyTo(b, "maqsad_confirm", lg === "uz" ? "⚠️ Farzandingiz hali olmaganini aytdi" : "⚠️ Child says not received",
      (user.ism || "") + " '" + (goal.ism || "") + "' " + (lg === "uz" ? "hali qo'liga tegmaganini bildirdi. Iltimos, olib bering." : "not received yet."),
      { maqsadId: goal.id, kidId: user.id, kidIsm: user.ism, maqsadIsm: goal.ism, summa: goal.maqsad, status: "pending" });
    ok$(lg === "uz" ? "Ota-onangizga xabar yuborildi" : "Parent notified", "warn");
  }, [maq, setMaq, user, oila, azolar, ok$, lg]);

  const confirmMaqBought = useCallback(async (info) => {
    const u = maq.map(m => m.id === info.maqsadId ? { ...m, status: "completed", paid: true, completedAt: td() } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setMaqsadConfirmNotif(null); fireConfetti(); buzz(30);
    ok$(lg === "uz" ? "🎉 Tabriklaymiz!" : "🎉 Congratulations!");
  }, [maq, setMaq, user, setMaqsadConfirmNotif, fireConfetti, buzz, ok$, lg]);

  const cancelMaqReturn = useCallback(async (info) => {
    const goal = maq.find(m => m.id === info.maqsadId);
    if (goal?.jamg > 0) {
      const dItem = { id: Date.now(), tur: "boshqa", summa: goal.jamg, izoh: (lg === "uz" ? "Maqsaddan qaytarildi: " : "Goal cancelled: ") + (goal.ism || ""), sana: td(), vaqt: nt(), uid: user.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]); setDar(d => [dItem, ...d]);
    }
    const u = maq.filter(m => m.id !== info.maqsadId);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setMaqsadConfirmNotif(null);
    ok$(lg === "uz" ? "Maqsad bekor qilindi ↩️" : "Goal cancelled", "warn");
  }, [maq, setMaq, user, setDar, setMaqsadConfirmNotif, ok$, lg]);

  const saveEditMq = useCallback(async () => {
    const t = lg === "uz" ? { fa: "Barcha maydonlarni to'ldiring", ua: "Yangilandi" } : { fa: "Fill all fields", ua: "Updated" };
    if (!editMqN.trim() || !editMqS || Number(editMqS) <= 0) return ok$(t.fa, "err");
    const u = maq.map(m => m.id === editMq ? { ...m, ism: editMqN.trim(), maqsad: Number(editMqS) } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setEditMq(null); setEditMqS(""); setEditMqN(""); ok$(t.ua);
  }, [editMq, editMqN, editMqS, maq, setMaq, user, ok$, lg]);

  return {
    tupId, setTupId, tupS, setTupS, addMq, tupMq, delMq,
    editMq, setEditMq, editMqS, setEditMqS, editMqN, setEditMqN,
    confirmMaqParent, confirmMaqKid, parentBoughtMaqsad, parentLaterMaqsad,
    kidAcceptMaqsad, kidRejectMaqsad, confirmMaqBought, cancelMaqReturn, saveEditMq
  };
}
