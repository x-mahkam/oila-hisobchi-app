import { useCallback, useState } from "react";
import { db } from "../firebase.js";
import { td, nt, f } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";
import i18n from "../i18n/index.js";

export function useGoals() {
  const { user, oila, azolar, maq, setMaq, xar, setXar, dar, setDar,
          kidBalances, setKidBalances, notifs, setNotifs,
          ok$, buzz, addStar, addNotif, fireConfetti, isPremium,
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
      return ok$(i18n.t("fill_all_fields", { defaultValue: "Barcha maydonlarni to'ldiring" }), "err");
    }
    const myGoals = maq.filter(m => m.uid === user.id).length;
    if (!isPremium && myGoals >= 3) {
      return ok$(
        i18n.t("goals_free_limit", { defaultValue: "⚠️ Bepul rejada 3 tagacha maqsad. Yangi qo'shish uchun eskisini yoping yoki Premium oling." }),
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
    addStar(20, i18n.t("goals_goal_created", { defaultValue: "Maqsad yaratildi" }));
    ok$(i18n.t("goals_goal_added", { defaultValue: "Maqsad qo'shildi" }));
  }, [maq, user, ok$, addStar, isPremium]);

  const tupMq = useCallback(async () => {
    if (!tupS || Number(tupS) <= 0) return;
    const summa = Number(tupS);
    const isKid = user?.rol === "kid";

    if (!isKid) {
      const myDar = dar.filter(d=>d.uid===user.id||!d.uid).reduce((s,d)=>s+Number(d.summa||0),0);
      const myXar = xar.filter(x=>x.uid===user.id||!x.uid).reduce((s,x)=>s+Number(x.summa||0),0);
      if (myDar - myXar < summa) {
        return ok$(i18n.t("insufficient_balance", { defaultValue: "❌ Balansda yetarli mablag' yo'q!" }), "err");
      }
      const goalIsm = maq.find(m=>m.id===tupId)?.ism || "";
      const xItem = {
        id:Date.now(), kategoriya:"maqsad", summa,
        izoh: i18n.t("goals_goal_savings_label", { name: goalIsm, defaultValue: "Maqsad to'plami: " + goalIsm }),
        sana:td(), vaqt:new Date().toTimeString().slice(0,5), uid:user.id, repeat:false, forGoal:tupId
      };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk))||[])]);
      setXar(x => [xItem, ...x]);
    } else {
      const myPocket = Number(kidBalances?.[user.id] || 0);
      if (myPocket < summa) {
        return ok$(
          i18n.t("goals_insufficient_pocket_money", { val: f(myPocket, true), defaultValue: "❌ Cho'ntak pulingiz yetarli emas! Sizda: " + f(myPocket, true) }),
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
      const goalIsm = tgtGoal?.ism || "";
      addStar(10, i18n.t("goals_goal_reached", { name: goalIsm, defaultValue: "Maqsadga yetildi: " + goalIsm }));
      if (isKid) {
        const boshId = oila?.boshId || azolar.find(a=>a.rol==="bosh")?.id;
        if (boshId && boshId !== user.id) {
          try {
            const bn = (await db.g("notif_" + boshId)) || [];
            await db.s("notif_" + boshId, [{
              id:Date.now(), type:"maqsad_confirm",
              title: i18n.t("goals_child_reached_title", { defaultValue: "🎯 Farzandingiz orzusiga yetdi!" }),
              text: i18n.t("goals_child_reached_desc", { kidName: user.ism, goalName: goalIsm, defaultValue: user.ism + "'ning '" + goalIsm + "' orzusi! Sotib oldingizmi?" }),
              maqsadId:tgtGoal?.id, kidId:user.id, kidIsm:user.ism,
              maqsadIsm:tgtGoal?.ism||"", summa:tgtGoal?.maqsad||0,
              sana:new Date().toISOString(), read:false, status:"pending"
            }, ...bn]);
            const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
            await db.s("maq_" + user.oilaId, maqUpd.map(m=>m.id===tgtGoal?.id?{...m,status:"waiting_parent"}:m));
          } catch {}
        }
        addNotif("yangilik", i18n.t("goals_reached_congrats", { defaultValue: "🎉 Orzungizga yetdingiz!" }),
          i18n.t("goals_funded_desc", { name: goalIsm, defaultValue: goalIsm + " uchun pul to'plandi!" }));
      } else {
        if (typeof setMaqsadConfirmNotif === "function") {
          setMaqsadConfirmNotif({ type:"self_confirm", maqsadId:tgtGoal?.id, maqsadIsm:tgtGoal?.ism||"", summa:tgtGoal?.maqsad||0 });
        }
      }
    }

    await db.s("maq_" + user.oilaId, u);
    setMaq(u);
    setTupId(null); setTupS("");
    ok$(
      isKid
        ? i18n.t("goals_saved_amount", { amount: f(summa, true), defaultValue: "Orzungizga " + f(summa, true) + " jamg'arildi! 🌟" })
        : i18n.t("updated_success", { defaultValue: "Yangilandi" })
    );
  }, [tupId, tupS, maq, user, oila, azolar, xar, dar, kidBalances, ok$, buzz, addStar, addNotif, fireConfetti, setMaqsadConfirmNotif, f]);

  const delMq = useCallback(async (id) => {
    const goal = maq.find(m=>m.id===id);
    if (goal?.jamg > 0 && !goal?.paid && user?.rol === "kid") {
      const kb = { ...(kidBalances || {}) };
      kb[user.id] = (Number(kb[user.id]) || 0) + Number(goal.jamg);
      await db.s("kidbal_" + user.oilaId, kb);
      setKidBalances(kb);
      ok$(i18n.t("goals_money_returned", { amount: f(goal.jamg, true), defaultValue: "Pul cho'ntagingizga qaytarildi: +" + f(goal.jamg, true) }));
    }
    if (goal?.jamg > 0 && !goal?.paid && user?.rol !== "kid") {
      const dItem = {
        id:Date.now(), tur:"boshqa", summa:goal.jamg,
        izoh: i18n.t("goals_deleted_returned_label", { name: goal.ism || "", defaultValue: "Maqsad o'chirildi, pul qaytarildi: " + (goal.ism || "") }),
        sana:td(), vaqt:new Date().toTimeString().slice(0,5), uid:user.id
      };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk))||[])]);
    }
    const u = maq.filter(m=>m.id!==id);
    await db.s("maq_" + user.oilaId, u);
    setMaq(u);
  }, [maq, user, kidBalances, ok$, f]);

  const confirmMaqParent = useCallback(async (notif) => {
    try {
      const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
      const finalMaq = maqUpd.map(m => m.id === notif.maqsadId ? { ...m, status: "parent_confirmed", parentConfirmedAt: new Date().toISOString() } : m);
      await db.s("maq_" + user.oilaId, finalMaq); setMaq(finalMaq);
      const kn = (await db.g("notif_" + notif.kidId)) || [];
      await db.s("notif_" + notif.kidId, [
        {
          id: Date.now(),
          type: "maqsad_kid_confirm",
          title: i18n.t("goals_parent_fulfilled_title", { defaultValue: "🎁 Ota/onang orzuingni amalga oshirdi!" }),
          text: i18n.t("goals_parent_fulfilled_desc", { name: notif.maqsadIsm || "", defaultValue: "'" + (notif.maqsadIsm || "") + "' sotib olindi! Siz ham tasdiqlang 👇" }),
          maqsadId: notif.maqsadId,
          maqsadIsm: notif.maqsadIsm,
          sana: new Date().toISOString(),
          read: false,
          status: "pending"
        },
        ...kn
      ]);
      const myN = notifs.map(n => n.id === notif.id ? { ...n, read: true, status: "confirmed" } : n);
      setNotifs(myN); await db.s("notif_" + user.id, myN);
      fireConfetti(); buzz(20);
      ok$(i18n.t("goals_parent_confirmed_msg", { defaultValue: "✅ Tasdiqlandi! Farzandingizga xabar yuborildi 🎉" }));
    } catch { ok$(i18n.t("error_generic", { defaultValue: "Xato" }), "err"); }
  }, [user, notifs, setNotifs, setMaq, fireConfetti, buzz, ok$]);

  const confirmMaqKid = useCallback(async (notif) => {
    try {
      const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
      const finalMaq = maqUpd.map(m => m.id === notif.maqsadId ? { ...m, status: "completed", completedAt: new Date().toISOString(), paid: true } : m);
      await db.s("maq_" + user.oilaId, finalMaq); setMaq(finalMaq);
      const myN = notifs.map(n => n.id === notif.id ? { ...n, read: true, status: "confirmed" } : n);
      setNotifs(myN); await db.s("notif_" + user.id, myN);
      fireConfetti(); buzz(30);
      ok$(i18n.t("goals_congrats_reached_message", { defaultValue: "🎉 Barakalla! Orzuingiz amalga oshdi!" }));
    } catch (e) { ok$(i18n.t("error_generic", { defaultValue: "Xato" }) + ": " + (e.message || ""), "err"); }
  }, [user, notifs, setNotifs, setMaq, fireConfetti, buzz, ok$]);

  const parentBoughtMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "parent_confirmed", parentConfirmedAt: new Date().toISOString(), parentLater: false } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    await notifyTo(
      goal.uid,
      "maqsad_kid_confirm",
      i18n.t("goals_parent_fulfilled_title", { defaultValue: "🎁 Ota/onang orzuingni amalga oshirdi!" }),
      "'" + (goal.ism || "") + "' " + i18n.t("goals_parent_fulfilled_desc_short", { defaultValue: "sotib olindi! Maqsad bo'limida tasdiqlang" }),
      { maqsadId: goal.id, maqsadIsm: goal.ism, status: "pending" }
    );
    fireConfetti(); buzz(20);
    ok$(i18n.t("goals_child_confirmation_sent", { defaultValue: "✅ Farzandingizga xabar yuborildi — u tasdiqlaydi" }));
  }, [maq, setMaq, user, fireConfetti, buzz, ok$]);

  const parentLaterMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, parentLater: true, parentLaterAt: new Date().toISOString() } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    await notifyTo(
      goal.uid,
      "yangilik",
      i18n.t("goals_dream_noted_title", { defaultValue: "⏰ Orzuing esda!" }),
      i18n.t("goals_dream_noted_desc", { name: goal.ism || "", defaultValue: "Ota-onangiz '" + (goal.ism || "") + "'ni keyinroq olib berishini aytdi" })
    );
    ok$(i18n.t("goals_child_notified", { defaultValue: "Farzandingizga xabar berildi ⏰" }));
  }, [maq, setMaq, user, ok$]);

  const kidAcceptMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "completed", paid: true, completedAt: new Date().toISOString() } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    const b = boshIdOf();
    if (b) {
      await notifyTo(
        b,
        "yangilik",
        i18n.t("goals_dream_fulfilled", { defaultValue: "🎉 Orzu amalga oshdi!" }),
        i18n.t("goals_kid_confirmed_parent_msg", { kidName: user.ism || "", goalName: goal.ism || "", defaultValue: (user.ism || "") + " '" + (goal.ism || "") + "' orzusini tasdiqladi. Rahmat!" })
      );
    }
    fireConfetti(); buzz(30);
    ok$(i18n.t("goals_congrats_reached_message", { defaultValue: "🎉 Barakalla! Orzuingiz amalga oshdi!" }));
  }, [maq, setMaq, user, fireConfetti, buzz, ok$]);

  const kidRejectMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "waiting_parent", parentConfirmedAt: null } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    const b = boshIdOf();
    if (b) {
      await notifyTo(
        b,
        "maqsad_confirm",
        i18n.t("goals_child_says_not_received_title", { defaultValue: "⚠️ Farzandingiz hali olmaganini aytdi" }),
        i18n.t("goals_child_says_not_received_desc", { kidName: user.ism || "", goalName: goal.ism || "", defaultValue: (user.ism || "") + " '" + (goal.ism || "") + "' hali qo'liga tegmaganini bildirdi. Iltimos, olib bering." }),
        { maqsadId: goal.id, kidId: user.id, kidIsm: user.ism, maqsadIsm: goal.ism, summa: goal.maqsad, status: "pending" }
      );
    }
    ok$(i18n.t("goals_parent_notified", { defaultValue: "Ota-onangizga xabar yuborildi" }), "warn");
  }, [maq, setMaq, user, ok$]);

  const confirmMaqBought = useCallback(async (info, giftPhoto = null) => {
    const u = maq.map(m => m.id === info.maqsadId ? { ...m, status: "completed", paid: true, completedAt: td(), ...(giftPhoto ? { giftPhoto } : {}) } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setMaqsadConfirmNotif(null); fireConfetti(); buzz(30);
    ok$(i18n.t("goals_congrats", { defaultValue: "🎉 Tabriklaymiz!" }));
  }, [maq, setMaq, user, setMaqsadConfirmNotif, fireConfetti, buzz, ok$]);

  const cancelMaqReturn = useCallback(async (info) => {
    const goal = maq.find(m => m.id === info.maqsadId);
    if (goal?.jamg > 0) {
      const dItem = {
        id: Date.now(),
        tur: "boshqa",
        summa: goal.jamg,
        izoh: i18n.t("goals_cancelled_returned", { name: goal.ism || "", defaultValue: "Maqsaddan qaytarildi: " + (goal.ism || "") }),
        sana: td(),
        vaqt: nt(),
        uid: user.id
      };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]); setDar(d => [dItem, ...d]);
    }
    const u = maq.filter(m => m.id !== info.maqsadId);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setMaqsadConfirmNotif(null);
    ok$(i18n.t("goals_cancelled_alert", { defaultValue: "Maqsad bekor qilindi ↩️" }), "warn");
  }, [maq, setMaq, user, setDar, setMaqsadConfirmNotif, ok$]);

  const saveEditMq = useCallback(async () => {
    if (!editMqN.trim() || !editMqS || Number(editMqS) <= 0) {
      return ok$(i18n.t("fill_all_fields", { defaultValue: "Barcha maydonlarni to'ldiring" }), "err");
    }
    const u = maq.map(m => m.id === editMq ? { ...m, ism: editMqN.trim(), maqsad: Number(editMqS) } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setEditMq(null); setEditMqS(""); setEditMqN("");
    ok$(i18n.t("updated_success", { defaultValue: "Yangilandi" }));
  }, [editMq, editMqN, editMqS, maq, setMaq, user, ok$]);

  return {
    addMq, tupMq, delMq, saveEditMq,
    confirmMaqParent, confirmMaqKid,
    parentBoughtMaqsad, parentLaterMaqsad,
    kidAcceptMaqsad, kidRejectMaqsad,
    confirmMaqBought, cancelMaqReturn,
    tupId, setTupId, tupS, setTupS,
    editMq, setEditMq, editMqS, setEditMqS, editMqN, setEditMqN
  };
}
