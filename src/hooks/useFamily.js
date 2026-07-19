import { useState, useCallback, useRef, useEffect } from "react";
import { db } from "../firebase.js";
import { td, nt, f, hp } from "../utils/formatters.js";
import { canApproveTask, canCompleteTask, canAssignTask, canDeleteTask } from "../utils/permissions.js";
import { useApp } from "../context/AppContext.jsx";

export function useFamily() {
  const { user, oila, azolar, setAzolar, setOila,
          vazifalar, setVazifalar, kidBalances, setKidBalances,
          xar, setXar, dar, setDar,
          ok$, buzz, addStar, addNotif, fireConfetti, t, setShowPremModal } = useApp();

  // ── Kid / Gift local states ──
  const [showGift,  setShowGift]  = useState(false);
  const [giftSum,   setGiftSum]   = useState("");
  const [giftFrom,  setGiftFrom]  = useState("");

  const [showAddKid, setShowAddKid] = useState(false);
  const [kidName,   setKidName]   = useState("");
  const [kidSurname,   setKidSurname]   = useState("");
  const [kidBirthYear, setKidBirthYear] = useState("");
  const [kidGender,    setKidGender]    = useState("");
  const [kidGrade,     setKidGrade]     = useState("");
  const [kidLogin,  setKidLogin]  = useState("");
  const [kidPw,     setKidPw]     = useState("");
  const [kidCreated, setKidCreated] = useState(null);

  // ── Tasks local states ──
  const [showAddVazifa, setShowAddVazifa] = useState(false);
  const [vTitle,    setVTitle]    = useState("");
  const [vReward,   setVReward]   = useState("");
  const [vAssignee, setVAssignee] = useState("");
  const [vEmoji,    setVEmoji]    = useState("📚");
  const [vDeadline, setVDeadline] = useState("");
  const [vTargetParentId, setVTargetParentId] = useState("");

  // ── Task logic ──

  // Vazifa bajarildi (bola)
  const vazifaDone = useCallback(async (id) => {
    const vv = vazifalar.find(v => v.id === id);
    if (!canCompleteTask(user, vv))
      return ok$(t("uf_taskNotAssigned"), "err");
    buzz(15);
    const upd = vazifalar.map(v => v.id===id ? {...v, status:"done", doneSana:td()} : v);
    await db.s("vazifa_" + user.oilaId, upd);
    setVazifalar(upd);

    try {
      const parents = azolar.filter(a => a.rol !== "kid");
      for (const p of parents) {
        const pkn = (await db.g("notif_" + p.id)) || [];
        const newNotifs = [{
          id: Date.now(),
          type: "vazifa_done",
          text: t("uf_kidDoneNotifText", { kid: user.ism, title: vv.title }),
          sana: new Date().toISOString(),
          read: false,
          vazifaId: id
        }, ...pkn];
        await db.s("notif_" + p.id, newNotifs);
      }
    } catch (e) {
      console.error("Parent notif error:", e);
    }

    ok$(t("uf_markedDone"));
  }, [vazifalar, user, azolar, ok$, buzz, t]);

  // Vazifani tasdiqlash (ota-ona)
  const vazifaApprove = useCallback(async (id) => {
    if (!canApproveTask(user))
      return ok$(t("uf_onlyAdultsApprove"), "err");
    buzz(20);
    const v = vazifalar.find(x => x.id===id);
    if (!v) return;

    if (v.deadline && td() > v.deadline && v.status !== "approved") {
      const updX = vazifalar.map(x => x.id===id ? {...x, status:"expired"} : x);
      await db.s("vazifa_" + user.oilaId, updX);
      setVazifalar(updX);
      return ok$(t("uf_deadlinePassed"), "err");
    }

    const myDar = dar.filter(d=>d.uid===user.id||!d.uid).reduce((s,d)=>s+Number(d.summa||0),0);
    const myXar = xar.filter(x=>x.uid===user.id||!x.uid).reduce((s,x)=>s+Number(x.summa||0),0);
    const myBal = myDar - myXar;
    if (myBal < v.reward) {
      return ok$(t("uf_insufficientBalanceNeed", { amt: f(v.reward, true) }), "err");
    }

    const upd = vazifalar.map(x => x.id===id ? {...x, status:"approved", paidSana:td()} : x);
    await db.s("vazifa_" + user.oilaId, upd);
    setVazifalar(upd);

    const kidsAll = azolar.filter(a => a.rol === "kid");
    const nm = (x) => (x || "").trim().toLowerCase();
    const cand = kidsAll.filter(a =>
      a.id === v.assignedTo ||
      (v.assignedLogin && a.login && a.login === v.assignedLogin) ||
      (v.assignedName && a.ism && nm(a.ism) === nm(v.assignedName))
    );
    let kidId = v.assignedTo;
    const loginKey = v.assignedLogin || cand.map(a => a.login).find(Boolean);
    if (loginKey) {
      try {
        const look = await db.gFresh("kidlogin_" + loginKey);
        const realUid = (look && typeof look === "object") ? look.uid : look;
        if (realUid) kidId = realUid;
      } catch (e2) {}
    } else if (cand.length) {
      kidId = cand.sort((a, b) => String(b.id).localeCompare(String(a.id)))[0].id;
    }
    const kb = {...kidBalances};
    const staleIds = [v.assignedTo, ...cand.map(a => a.id)].filter((id, i, arr) => id !== kidId && arr.indexOf(id) === i);
    staleIds.forEach(id => {
      if (kb[id]) { kb[kidId] = (kb[kidId] || 0) + (Number(kb[id]) || 0); delete kb[id]; }
    });
    kb[kidId] = (kb[kidId] || 0) + v.reward;
    await db.s("kidbal_" + user.oilaId, kb);
    setKidBalances(kb);



    const xItem = {
      id: Date.now(), kategoriya:"boshqa", summa:v.reward,
      izoh: t("uf_taskRewardLabel", { title: v.title || "" }),
      sana:td(), vaqt:new Date().toTimeString().slice(0,5), uid:user.id, repeat:false
    };
    const xk = "x_" + user.oilaId + "_" + user.id;
    await db.s(xk, [xItem, ...((await db.g(xk))||[])]);
    setXar(x => [xItem, ...x]);

    try {
      const kn = (await db.g("notif_" + kidId)) || [];
      await db.s("notif_" + kidId, [{
        id:Date.now(), type:"vazifa",
        text: t("uf_taskApprovedPlus", { amt: f(v.reward, true) }),
        sana:new Date().toISOString(), read:false,
        vazifaId: v.id
      }, ...kn]);
    } catch {}

    addStar(3, t("uf_taskCompletedStar", { title: v.title || "" }), "vaz_" + v.id);
    ok$(t("uf_approvedKidGot", { amt: f(v.reward, true) }));
  }, [vazifalar, kidBalances, user, xar, dar, ok$, buzz, addStar, t, azolar, setAzolar, setXar, setKidBalances, f]);

  // Gift Money
  const addGiftMoney = async () => {
    if (!giftSum || Number(giftSum) <= 0) return ok$(t("uf_enterAmount"), "err");
    buzz(15);
    const summa = Number(giftSum);
    const kb = { ...kidBalances }; kb[user.id] = (kb[user.id] || 0) + summa;
    await db.s("kidbal_" + user.oilaId, kb); setKidBalances(kb);
    try {
      const hist = (await db.g("kidgift_" + user.id)) || [];
      await db.s("kidgift_" + user.id, [{ id: Date.now(), summa, from: giftFrom.trim() || t("uf_giftFallback"), sana: td() }, ...hist].slice(0, 100));
    } catch {}
    setShowGift(false); setGiftSum(""); setGiftFrom("");
    ok$(t("uf_addedToPocket", { amt: f(summa, true) }));
    fireConfetti();
  };

  // Add Kid Account
  const addKidAccount = async () => {
    const nowY = new Date().getFullYear();
    const by = Number(kidBirthYear);
    if (kidName.trim().length < 2)    return ok$(t("uf_enterKidName"), "err");
    if (kidSurname.trim().length < 2) return ok$(t("uf_enterSurname"), "err");
    if (!/^\d{4}$/.test(String(kidBirthYear)) || by < nowY - 17 || by > nowY - 3)
      return ok$(t("uf_invalidBirthYear"), "err");
    if (kidGrade !== "" && (Number(kidGrade) < 1 || Number(kidGrade) > 11))
      return ok$(t("uf_gradeRange"), "err");
    if (kidLogin.trim().length < 3)   return ok$(t("uf_loginMinChars"), "err");
    if (kidPw.length < 4)             return ok$(t("uf_pwMinChars"), "err");
    buzz(12);
    const loginKey = kidLogin.trim().toLowerCase();
    if (await db.gFresh("kidlogin_" + loginKey)) return ok$(t("uf_loginTaken"), "err");
    
    // Check for Premium limit (max 2 members in free version)
    if ((oila?.azolarIds || oila?.azolar || []).length >= 2 && !oila?.premium) {
      setShowPremModal(true);
      return ok$(t("uf_familyLimitReached"), "err");
    }

    try {
      const uid = "kid" + Date.now();
      const ph = await hp(kidPw);
      const nu = { id: uid, ism: kidName.trim(), familya: kidSurname.trim(), birthYear: by, gender: kidGender || null, sinf: kidGrade !== "" ? Number(kidGrade) : null, login: loginKey, ph, oilaId: user.oilaId, rol: "kid", rel: "farzand", photo: null, parentId: user.id };
      await db.s("user_" + uid, nu); await db.s("kidlogin_" + loginKey, { uid, oila: user.oilaId });
      const o2 = { ...oila, azolarIds: [...(oila.azolarIds || oila.azolar || [user.id]), uid] };
      if (oila.id) await db.s("oila_" + oila.id, o2);
      await db.s("fam_" + user.oilaId, { ...o2, azolar: o2.azolarIds });
      setOila(o2);
      setAzolar([...azolar, nu]);
      setShowAddKid(false); setKidName(""); setKidSurname(""); setKidBirthYear(""); setKidGender(""); setKidGrade(""); setKidLogin(""); setKidPw("");
      setKidCreated({ ism: nu.ism, login: loginKey, pw: kidPw });
    } catch (e) { ok$(t("uf_errorCode", { msg: e.code || e.message }), "err"); }
  };

  // Eski bola login-lookup'larini davolash
  const kidLookupHealed = useRef(false);
  useEffect(() => {
    if (kidLookupHealed.current || !user || user.rol === "kid" || !user.oilaId || !azolar?.length) return;
    kidLookupHealed.current = true;
    (async () => {
      for (const a of azolar) {
        if (a.rol !== "kid" || !a.login) continue;
        try {
          const cur = await db.gFresh("kidlogin_" + a.login);
          if (cur && typeof cur !== "object") await db.s("kidlogin_" + a.login, { uid: a.id, oila: user.oilaId });
        } catch (e) {}
      }
    })();
  }, [user, azolar]);

  // Bola o'chirish
  const delKidAccount = async (kid) => {
    if (!kid || kid.rol !== "kid") return;
    if (user?.rol !== "bosh" && kid.parentId !== user?.id)
      return ok$(t("uf_onlyHeadCanDelete"), "err");
    buzz(15);
    try {
      if (kid.login) await db.del("kidlogin_" + kid.login);
      await db.del("user_" + kid.id);
      const ids = (oila?.azolarIds || oila?.azolar || []).filter(id => id !== kid.id);
      const o2 = { ...oila, azolarIds: ids };
      if (oila?.id) await db.s("oila_" + oila.id, o2);
      await db.s("fam_" + user.oilaId, { ...o2, azolar: ids });
      setOila(o2); setAzolar(azolar.filter(a => a.id !== kid.id));
      ok$(t("uf_kidDeleted", { name: kid.ism }));
    } catch (e) { ok$(t("uf_errorCode", { msg: e.code || e.message }), "err"); }
  };

  // Purge Data
  const purgeData = async (fromS, toS, wholeFamily) => {
    if (wholeFamily && user?.rol !== "bosh")
      return ok$(t("uf_onlyHeadClearFamily"), "err");
    const inRange = sn => (!fromS || (sn || "") >= fromS) && (!toS || (sn || "") <= toS);
    const targets = wholeFamily ? azolar : azolar.filter(a => a.id === user.id);
    buzz(15);
    let removed = 0;
    try {
      for (const m of targets) {
        const kx = "x_" + user.oilaId + "_" + m.id, kd2 = "d_" + user.oilaId + "_" + m.id;
        const xa = (await db.g(kx)) || [], da = (await db.g(kd2)) || [];
        const xKeep = xa.filter(r => !inRange(r.sana)), dKeep = da.filter(r => !inRange(r.sana));
        removed += (xa.length - xKeep.length) + (da.length - dKeep.length);
        if (xKeep.length !== xa.length) await db.s(kx, xKeep);
        if (dKeep.length !== da.length) await db.s(kd2, dKeep);
      }
      const ids = new Set(targets.map(m => m.id));
      setXar(xar.filter(r => !(ids.has(r.uid) && inRange(r.sana))));
      setDar(dar.filter(r => !(ids.has(r.uid) && inRange(r.sana))));
      ok$(t("uf_recordsDeleted", { n: removed }));
      return true;
    } catch (e) { ok$(t("uf_errorCode", { msg: e.code || e.message }), "err"); return false; }
  };

  // Add Task (Vazifa)
  const addVazifa = async () => {
    const isKidUser = user?.rol === "kid";
    const assigneeId = isKidUser ? user.id : vAssignee;

    if (!isKidUser && !canAssignTask(user)) {
      return ok$(t("uf_onlyAdultsAssign"), "err");
    }

    const cleanRewardStr = String(vReward).replace(/\D/g, "");
    const parsedReward = Number(cleanRewardStr);

    if (!vTitle.trim() || !cleanRewardStr || parsedReward <= 0 || !assigneeId) {
      return ok$(t("uf_fillAllFields2"), "err");
    }
    buzz(12);
    const kd = isKidUser ? user : azolar.find(a => a.id === assigneeId);
    const status = isKidUser ? "proposed" : "pending";

    const item = {
      id: Date.now(),
      title: vTitle.trim(),
      reward: parsedReward,
      emoji: vEmoji,
      assignedTo: assigneeId,
      assignedName: kd?.ism || "",
      assignedLogin: kd?.login || "",
      createdBy: user.id,
      createdByName: user.ism || "",
      status,
      sana: td(),
      doneSana: "",
      paidSana: "",
      deadline: vDeadline || "",
      targetParentId: isKidUser ? vTargetParentId : ""
    };

    const upd = [item, ...vazifalar];
    await db.s("vazifa_" + user.oilaId, upd); setVazifalar(upd);
    setShowAddVazifa(false); setVTitle(""); setVReward(""); setVAssignee(""); setVEmoji("📚"); setVDeadline(""); setVTargetParentId("");

    if (isKidUser) {
      try {
        const parents = azolar.filter(a => a.rol !== "kid");
        const targetParents = (vTargetParentId && vTargetParentId !== "all")
          ? parents.filter(p => p.id === vTargetParentId)
          : parents;

        for (const p of targetParents) {
          const pkn = (await db.g("notif_" + p.id)) || [];
          const newNotifs = [{
            id: Date.now(),
            type: "vazifa_proposed",
            text: t("uf_proposedTaskNotifText", { kid: user.ism, title: item.title, amt: f(item.reward, true) }),
            sana: new Date().toISOString(),
            read: false,
            vazifaId: item.id
          }, ...pkn];
          await db.s("notif_" + p.id, newNotifs);
        }
      } catch (e) {
        console.error("Proposed task notification error:", e);
      }
      ok$(t("uf_proposalSentToParents"));
    } else {
      ok$(t("uf_taskAdded"));
    }
  };

  const vazifaAcceptProposed = useCallback(async (id, customReward) => {
    if (!canApproveTask(user))
      return ok$(t("uf_onlyAdultsAccept"), "err");
    buzz(15);
    const v = vazifalar.find(x => x.id === id);
    if (!v) return;

    // Remove any spaces or non-digit chars from the reward
    const cleanRewardStr = String(customReward != null ? customReward : v.reward).replace(/\D/g, "");
    const finalReward = Number(cleanRewardStr);

    if (isNaN(finalReward) || finalReward <= 0) {
      return ok$(t("uf_invalidPrice"), "err");
    }

    const upd = vazifalar.map(x => x.id === id ? { ...x, status: "pending", reward: finalReward, acceptedBy: user.id, acceptedByName: user.ism } : x);
    await db.s("vazifa_" + user.oilaId, upd);
    setVazifalar(upd);

    try {
      const kn = (await db.g("notif_" + v.assignedTo)) || [];
      await db.s("notif_" + v.assignedTo, [{
        id: Date.now(),
        type: "vazifa_accepted",
        text: t("uf_proposalAcceptedNotifText", { title: v.title, amt: f(finalReward, true) }),
        sana: new Date().toISOString(),
        read: false,
        vazifaId: id
      }, ...kn]);
    } catch (e) {}

    ok$(t("uf_proposalAccepted"));
  }, [vazifalar, user, ok$, buzz, t, f]);

  const delVazifa = async (id) => {
    const v = vazifalar.find(x => x.id === id);
    if (!canDeleteTask(user, v))
      return ok$(t("uf_onlyCreatorDelete"), "err");
    const upd = vazifalar.filter(x => x.id !== id);
    await db.s("vazifa_" + user.oilaId, upd); setVazifalar(upd);
  };

  return {
    vazifaDone, vazifaApprove,
    showGift,  setShowGift,
    giftSum,   setGiftSum,
    giftFrom,  setGiftFrom,
    addGiftMoney,
    showAddKid, setShowAddKid,
    kidName,   setKidName,
    kidSurname,   setKidSurname,
    kidBirthYear, setKidBirthYear,
    kidGender,    setKidGender,
    kidGrade,     setKidGrade,
    kidLogin,  setKidLogin,
    kidPw,     setKidPw,
    kidCreated, setKidCreated,
    addKidAccount, delKidAccount,
    showAddVazifa, setShowAddVazifa,
    vTitle,    setVTitle,
    vReward,   setVReward,
    vAssignee, setVAssignee,
    vEmoji,    setVEmoji,
    vDeadline, setVDeadline,
    vTargetParentId, setVTargetParentId,
    addVazifa, delVazifa, vazifaAcceptProposed,
    purgeData
  };
}
