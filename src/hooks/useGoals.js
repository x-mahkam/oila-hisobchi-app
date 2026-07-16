import { useCallback, useState } from "react";
import { db } from "../firebase.js";
import { td, nt, f } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";

export function useGoals() {
  const { user, oila, azolar, maq, setMaq, xar, setXar, dar, setDar,
          kidBalances, setKidBalances, notifs, setNotifs,
          ok$, buzz, addStar, addNotif, fireConfetti, isPremium, t,
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
      return ok$(t("ug_fillAllFields"), "err");
    }
    const myGoals = maq.filter(m => m.uid === user.id).length;
    if (!isPremium && myGoals >= 3) {
      return ok$(t("ug_freePlanLimit"), "err");
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
    addStar(20, t("ug_goalCreated"));
    ok$(t("ug_goalAdded"));
  }, [maq, user, ok$, addStar, isPremium, t]);

  const tupMq = useCallback(async () => {
    if (!tupS || Number(tupS) <= 0) return;
    const summa = Number(tupS);
    const isKid = user?.rol === "kid";

    if (!isKid) {
      const myDar = dar.filter(d=>d.uid===user.id||!d.uid).reduce((s,d)=>s+Number(d.summa||0),0);
      const myXar = xar.filter(x=>x.uid===user.id||!x.uid).reduce((s,x)=>s+Number(x.summa||0),0);
      if (myDar - myXar < summa) {
        return ok$(t("ug_insufficientBalance"), "err");
      }
      const xItem = {
        id:Date.now(), kategoriya:"maqsad", summa,
        izoh: t("ug_goalSavingsLabel", { name: maq.find(m=>m.id===tupId)?.ism || "" }),
        sana:td(), vaqt:new Date().toTimeString().slice(0,5), uid:user.id, repeat:false, forGoal:tupId
      };
      const xk = "x_" + user.oilaId + "_" + user.id;
      await db.s(xk, [xItem, ...((await db.g(xk))||[])]);
      setXar(x => [xItem, ...x]);
    } else {
      const myPocket = Number(kidBalances?.[user.id] || 0);
      if (myPocket < summa) {
        return ok$(t("ug_notEnoughPocket", { amt: f(myPocket, true) }), "err");
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
      addStar(10, t("ug_goalReachedStar", { name: tgtGoal?.ism || "" }));
      if (isKid) {
        const boshId = oila?.boshId || azolar.find(a=>a.rol==="bosh")?.id;
        if (boshId && boshId !== user.id) {
          try {
            const bn = (await db.g("notif_" + boshId)) || [];
            await db.s("notif_" + boshId, [{
              id:Date.now(), type:"maqsad_confirm",
              title: t("ug_kidReachedGoalTitle"),
              text: t("ug_kidReachedGoalText", { kid: user.ism, goal: tgtGoal?.ism || "" }),
              maqsadId:tgtGoal?.id, kidId:user.id, kidIsm:user.ism,
              maqsadIsm:tgtGoal?.ism||"", summa:tgtGoal?.maqsad||0,
              sana:new Date().toISOString(), read:false, status:"pending"
            }, ...bn]);
            const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
            await db.s("maq_" + user.oilaId, maqUpd.map(m=>m.id===tgtGoal?.id?{...m,status:"waiting_parent"}:m));
          } catch {}
        }
        addNotif("yangilik", t("ug_kidGoalReachedNotif"),
          t("ug_fundedText", { goal: tgtGoal?.ism || "" }));
      } else {
        if (typeof setMaqsadConfirmNotif === "function") {
          setMaqsadConfirmNotif({ type:"self_confirm", maqsadId:tgtGoal?.id, maqsadIsm:tgtGoal?.ism||"", summa:tgtGoal?.maqsad||0 });
        }
      }
    }

    await db.s("maq_" + user.oilaId, u);
    setMaq(u);
    setTupId(null); setTupS("");
    ok$(isKid ? t("ug_savedAmount", { amt: f(summa, true) }) : t("ug_updated"));
  }, [tupId, tupS, maq, user, oila, azolar, xar, dar, kidBalances, ok$, buzz, addStar, addNotif, fireConfetti, t, setMaqsadConfirmNotif, f]);

  const delMq = useCallback(async (id) => {
    const goal = maq.find(m=>m.id===id);
    if (goal?.jamg > 0 && !goal?.paid && user?.rol === "kid") {
      const kb = { ...(kidBalances || {}) };
      kb[user.id] = (Number(kb[user.id]) || 0) + Number(goal.jamg);
      await db.s("kidbal_" + user.oilaId, kb);
      setKidBalances(kb);
      ok$(t("ug_returnedToPocket", { amt: f(goal.jamg, true) }));
    }
    if (goal?.jamg > 0 && !goal?.paid && user?.rol !== "kid") {
      const dItem = {
        id:Date.now(), tur:"boshqa", summa:goal.jamg,
        izoh: t("ug_goalDeletedRefund", { name: goal.ism || "" }),
        sana:td(), vaqt:new Date().toTimeString().slice(0,5), uid:user.id
      };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk))||[])]);
    }
    const u = maq.filter(m=>m.id!==id);
    await db.s("maq_" + user.oilaId, u);
    setMaq(u);
  }, [maq, user, kidBalances, ok$, t, f]);

  const confirmMaqParent = useCallback(async (notif) => {
    try {
      const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
      const finalMaq = maqUpd.map(m => m.id === notif.maqsadId ? { ...m, status: "parent_confirmed", parentConfirmedAt: new Date().toISOString() } : m);
      await db.s("maq_" + user.oilaId, finalMaq); setMaq(finalMaq);
      const kn = (await db.g("notif_" + notif.kidId)) || [];
      await db.s("notif_" + notif.kidId, [{ id: Date.now(), type: "maqsad_kid_confirm", title: t("ug_parentFulfilledTitle"), text: t("ug_confirmBelowText", { goal: notif.maqsadIsm || "" }), maqsadId: notif.maqsadId, maqsadIsm: notif.maqsadIsm, sana: new Date().toISOString(), read: false, status: "pending" }, ...kn]);
      const myN = notifs.map(n => n.id === notif.id ? { ...n, read: true, status: "confirmed" } : n);
      setNotifs(myN); await db.s("notif_" + user.id, myN);
      fireConfetti(); buzz(20);
      ok$(t("ug_confirmedNotified"));
    } catch { ok$(t("ug_error"), "err"); }
  }, [user, notifs, setNotifs, setMaq, fireConfetti, buzz, ok$, t]);

  const confirmMaqKid = useCallback(async (notif) => {
    try {
      const maqUpd = (await db.g("maq_" + user.oilaId)) || [];
      const finalMaq = maqUpd.map(m => m.id === notif.maqsadId ? { ...m, status: "completed", completedAt: new Date().toISOString(), paid: true } : m);
      await db.s("maq_" + user.oilaId, finalMaq); setMaq(finalMaq);
      const myN = notifs.map(n => n.id === notif.id ? { ...n, read: true, status: "confirmed" } : n);
      setNotifs(myN); await db.s("notif_" + user.id, myN);
      fireConfetti(); buzz(30);
      ok$(t("ug_congratsAchieved"));
    } catch (e) { ok$(t("ug_errorMsg", { msg: e.message || "" }), "err"); }
  }, [user, notifs, setNotifs, setMaq, fireConfetti, buzz, ok$, t]);

  const parentBoughtMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "parent_confirmed", parentConfirmedAt: new Date().toISOString(), parentLater: false } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    await notifyTo(goal.uid, "maqsad_kid_confirm",
      t("ug_parentFulfilledTitle"),
      t("ug_confirmInGoalsText", { goal: goal.ism || "" }),
      { maqsadId: goal.id, maqsadIsm: goal.ism, status: "pending" });
    fireConfetti(); buzz(20);
    ok$(t("ug_sentToChildConfirm"));
  }, [maq, setMaq, user, fireConfetti, buzz, ok$, t]);

  const parentLaterMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, parentLater: true, parentLaterAt: new Date().toISOString() } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    await notifyTo(goal.uid, "yangilik",
      t("ug_dreamNotedTitle"),
      t("ug_parentBuyLaterText", { goal: goal.ism || "" }));
    ok$(t("ug_childNotifiedLater"));
  }, [maq, setMaq, user, ok$, t]);

  const kidAcceptMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "completed", paid: true, completedAt: new Date().toISOString() } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    const b = boshIdOf();
    if (b) await notifyTo(b, "yangilik", t("ug_dreamFulfilledTitle"),
      t("ug_kidConfirmedText", { kid: user.ism || "", goal: goal.ism || "" }));
    fireConfetti(); buzz(30);
    ok$(t("ug_congratsAchieved"));
  }, [maq, setMaq, user, oila, azolar, fireConfetti, buzz, ok$, t]);

  const kidRejectMaqsad = useCallback(async (goal) => {
    const u = maq.map(m => m.id === goal.id ? { ...m, status: "waiting_parent", parentConfirmedAt: null } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    const b = boshIdOf();
    if (b) await notifyTo(b, "maqsad_confirm", t("ug_notReceivedTitle"),
      t("ug_notReceivedText", { kid: user.ism || "", goal: goal.ism || "" }),
      { maqsadId: goal.id, kidId: user.id, kidIsm: user.ism, maqsadIsm: goal.ism, summa: goal.maqsad, status: "pending" });
    ok$(t("ug_parentNotified"), "warn");
  }, [maq, setMaq, user, oila, azolar, ok$, t]);

  const confirmMaqBought = useCallback(async (info, giftPhoto = null) => {
    const u = maq.map(m => m.id === info.maqsadId ? { ...m, status: "completed", paid: true, completedAt: td(), ...(giftPhoto ? { giftPhoto } : {}) } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setMaqsadConfirmNotif(null); fireConfetti(); buzz(30);
    ok$(t("ug_congratulations"));
  }, [maq, setMaq, user, setMaqsadConfirmNotif, fireConfetti, buzz, ok$, t]);

  const cancelMaqReturn = useCallback(async (info) => {
    const goal = maq.find(m => m.id === info.maqsadId);
    if (goal?.jamg > 0) {
      const dItem = { id: Date.now(), tur: "boshqa", summa: goal.jamg, izoh: t("ug_goalCancelledRefund", { name: goal.ism || "" }), sana: td(), vaqt: nt(), uid: user.id };
      const dk = "d_" + user.oilaId + "_" + user.id;
      await db.s(dk, [dItem, ...((await db.g(dk)) || [])]); setDar(d => [dItem, ...d]);
    }
    const u = maq.filter(m => m.id !== info.maqsadId);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setMaqsadConfirmNotif(null);
    ok$(t("ug_goalCancelled"), "warn");
  }, [maq, setMaq, user, setDar, setMaqsadConfirmNotif, ok$, t]);

  const saveEditMq = useCallback(async () => {
    if (!editMqN.trim() || !editMqS || Number(editMqS) <= 0) return ok$(t("ug_fillAllFields"), "err");
    const u = maq.map(m => m.id === editMq ? { ...m, ism: editMqN.trim(), maqsad: Number(editMqS) } : m);
    await db.s("maq_" + user.oilaId, u); setMaq(u);
    setEditMq(null); setEditMqS(""); setEditMqN(""); ok$(t("ug_updated"));
  }, [editMq, editMqN, editMqS, maq, setMaq, user, ok$, t]);

  return {
    tupId, setTupId, tupS, setTupS, addMq, tupMq, delMq,
    editMq, setEditMq, editMqS, setEditMqS, editMqN, setEditMqN,
    confirmMaqParent, confirmMaqKid, parentBoughtMaqsad, parentLaterMaqsad,
    kidAcceptMaqsad, kidRejectMaqsad, confirmMaqBought, cancelMaqReturn, saveEditMq
  };
}
