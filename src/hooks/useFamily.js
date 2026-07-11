import { useState, useCallback, useRef, useEffect } from "react";
import { db } from "../firebase.js";
import { td, nt, f, hp } from "../utils/formatters.js";
import { canApproveTask, canCompleteTask, canAssignTask, canDeleteTask } from "../utils/permissions.js";
import { useApp } from "../context/AppContext.jsx";
import { publishKidScore } from "../utils/kidsBoard.js";

export function useFamily() {
  const { user, oila, azolar, setAzolar, setOila,
          vazifalar, setVazifalar, kidBalances, setKidBalances,
          xar, setXar, dar, setDar,
          ok$, buzz, addStar, addNotif, fireConfetti, lg } = useApp();

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
      return ok$(lg === "uz" ? "Bu vazifa sizga biriktirilmagan" : "This task is not assigned to you", "err");
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
          text: lg === "uz"
            ? `👶 ${user.ism} vazifani bajardi: "${vv.title}". Tasdiqlash kutilmoqda.`
            : `👶 ${user.ism} completed the task: "${vv.title}". Awaiting approval.`,
          sana: new Date().toISOString(),
          read: false
        }, ...pkn];
        await db.s("notif_" + p.id, newNotifs);
      }
    } catch (e) {
      console.error("Parent notif error:", e);
    }

    ok$(lg==="uz"?"Bajarildi deb belgilandi! Ota-ona tasdiqlaydi.":"Marked done!");
  }, [vazifalar, user, azolar, ok$, buzz, lg]);

  // Vazifani tasdiqlash (ota-ona)
  const vazifaApprove = useCallback(async (id) => {
    if (!canApproveTask(user))
      return ok$(lg === "uz" ? "Tasdiqlashni faqat katta oila a'zolari bajaradi" : "Only adults can approve tasks", "err");
    buzz(20);
    const v = vazifalar.find(x => x.id===id);
    if (!v) return;

    if (v.deadline && td() > v.deadline && v.status !== "approved") {
      const updX = vazifalar.map(x => x.id===id ? {...x, status:"expired"} : x);
      await db.s("vazifa_" + user.oilaId, updX);
      setVazifalar(updX);
      return ok$(lg==="uz" ? "Muddati o'tgan — mukofot berilmadi" : "Deadline passed — no reward", "err");
    }

    const myDar = dar.filter(d=>d.uid===user.id||!d.uid).reduce((s,d)=>s+Number(d.summa||0),0);
    const myXar = xar.filter(x=>x.uid===user.id||!x.uid).reduce((s,x)=>s+Number(x.summa||0),0);
    const myBal = myDar - myXar;
    if (myBal < v.reward) {
      return ok$(lg==="uz"
        ?"❌ Balansingizda yetarli mablag' yo'q! Kerak: "+f(v.reward,true)
        :"❌ Insufficient balance! Need: "+f(v.reward,true), "err");
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

    try {
      const kidObj = cand.find(a => a.id === kidId) || cand[0];
      await publishKidScore({
        kidId,
        ism: (kidObj?.ism || v.assignedName || "?"),
        oilaId: user.oilaId,
        deltaPts: 10,
        deltaTask: 1,
        deltaEarn: Number(v.reward) || 0,
      });
    } catch {}

    const xItem = {
      id: Date.now(), kategoriya:"boshqa", summa:v.reward,
      izoh:(lg==="uz"?"Vazifa mukofoti: ":"Task reward: ")+(v.title||""),
      sana:td(), vaqt:new Date().toTimeString().slice(0,5), uid:user.id, repeat:false
    };
    const xk = "x_" + user.oilaId + "_" + user.id;
    await db.s(xk, [xItem, ...((await db.g(xk))||[])]);
    setXar(x => [xItem, ...x]);

    try {
      const kn = (await db.g("notif_" + kidId)) || [];
      await db.s("notif_" + kidId, [{
        id:Date.now(), type:"vazifa",
        text:(lg==="uz"?"🏆 Vazifa tasdiqlandi! +":"Task approved! +")+f(v.reward,true),
        sana:new Date().toISOString(), read:false
      }, ...kn]);
    } catch {}

    addStar(3, lg==="uz"?"Vazifa bajarildi: "+(v.title||""):"Task completed: "+(v.title||""));
    ok$(lg==="uz"?"Tasdiqlandi! Bola "+f(v.reward,true)+" oldi 🎉":"Approved! +3⭐");
  }, [vazifalar, kidBalances, user, xar, dar, ok$, buzz, addStar, lg, azolar, setAzolar, setXar, setKidBalances, f]);

  // Gift Money
  const addGiftMoney = async () => {
    if (!giftSum || Number(giftSum) <= 0) return ok$(lg === "uz" ? "Summani kiriting" : "Enter amount", "err");
    buzz(15);
    const summa = Number(giftSum);
    const kb = { ...kidBalances }; kb[user.id] = (kb[user.id] || 0) + summa;
    await db.s("kidbal_" + user.oilaId, kb); setKidBalances(kb);
    try {
      const hist = (await db.g("kidgift_" + user.id)) || [];
      await db.s("kidgift_" + user.id, [{ id: Date.now(), summa, from: giftFrom.trim() || (lg === "uz" ? "Sovg'a" : "Gift"), sana: td() }, ...hist].slice(0, 100));
    } catch {}
    setShowGift(false); setGiftSum(""); setGiftFrom("");
    ok$(lg === "uz" ? "🎁 " + f(summa, true) + " cho'ntagingizga qo'shildi!" : "Added to your pocket!");
    fireConfetti();
  };

  // Add Kid Account
  const addKidAccount = async () => {
    const nowY = new Date().getFullYear();
    const by = Number(kidBirthYear);
    if (kidName.trim().length < 2)    return ok$(lg === "uz" ? "Bola ismini kiriting (kamida 2 belgi)" : "Enter child's first name", "err");
    if (kidSurname.trim().length < 2) return ok$(lg === "uz" ? "Familyani kiriting (kamida 2 belgi)" : "Enter surname", "err");
    if (!/^\d{4}$/.test(String(kidBirthYear)) || by < nowY - 17 || by > nowY - 3)
      return ok$(lg === "uz" ? "Tug'ilgan yili noto'g'ri (bola 3–17 yoshda bo'lishi kerak)" : "Invalid birth year (age 3–17)", "err");
    if (kidGrade !== "" && (Number(kidGrade) < 1 || Number(kidGrade) > 11))
      return ok$(lg === "uz" ? "Sinf 1 dan 11 gacha bo'lishi kerak" : "Grade must be 1–11", "err");
    if (kidLogin.trim().length < 3)   return ok$(lg === "uz" ? "Login kamida 3 belgi bo'lsin" : "Login min 3 chars", "err");
    if (kidPw.length < 4)             return ok$(lg === "uz" ? "Parol kamida 4 belgi bo'lsin" : "Password min 4 chars", "err");
    buzz(12);
    const loginKey = kidLogin.trim().toLowerCase();
    if (await db.gFresh("kidlogin_" + loginKey)) return ok$(lg === "uz" ? "Bu login band, boshqa login tanlang" : "Login taken, choose another", "err");
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
    } catch (e) { ok$(lg === "uz" ? "Xato: " + (e.code || e.message) : "Error: " + (e.code || e.message), "err"); }
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
      return ok$(lg === "uz" ? "Faqat oila boshi yoki akkauntni yaratgan ota-ona o'chira oladi" : "Only the family head or the creating parent can delete", "err");
    buzz(15);
    try {
      if (kid.login) await db.del("kidlogin_" + kid.login);
      await db.del("user_" + kid.id);
      const ids = (oila?.azolarIds || oila?.azolar || []).filter(id => id !== kid.id);
      const o2 = { ...oila, azolarIds: ids };
      if (oila?.id) await db.s("oila_" + oila.id, o2);
      await db.s("fam_" + user.oilaId, { ...o2, azolar: ids });
      setOila(o2); setAzolar(azolar.filter(a => a.id !== kid.id));
      ok$(lg === "uz" ? kid.ism + " akkaunti o'chirildi" : "Kid account deleted");
    } catch (e) { ok$((lg === "uz" ? "Xato: " : "Error: ") + (e.code || e.message), "err"); }
  };

  // Purge Data
  const purgeData = async (fromS, toS, wholeFamily) => {
    if (wholeFamily && user?.rol !== "bosh")
      return ok$(lg === "uz" ? "Butun oila ma'lumotini faqat oila boshi tozalay oladi" : "Only the family head can clear family data", "err");
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
      ok$(lg === "uz" ? removed + " ta yozuv o'chirildi" : removed + " records deleted");
      return true;
    } catch (e) { ok$((lg === "uz" ? "Xato: " : "Error: ") + (e.code || e.message), "err"); return false; }
  };

  // Add Task (Vazifa)
  const addVazifa = async () => {
    const isKidUser = user?.rol === "kid";
    const assigneeId = isKidUser ? user.id : vAssignee;

    if (!isKidUser && !canAssignTask(user)) {
      return ok$(lg === "uz" ? "Vazifani faqat katta oila a'zolari bera oladi" : "Only adult family members can assign tasks", "err");
    }

    const cleanRewardStr = String(vReward).replace(/\D/g, "");
    const parsedReward = Number(cleanRewardStr);

    if (!vTitle.trim() || !cleanRewardStr || parsedReward <= 0 || !assigneeId) {
      return ok$(lg === "uz" ? "Barcha maydonlarni to'ldiring" : "Fill all fields", "err");
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
            text: lg === "uz"
              ? `💡 ${user.ism} yangi vazifa taklif qildi: "${item.title}" (${f(item.reward, true)}).`
              : `💡 ${user.ism} proposed a new task: "${item.title}" (${f(item.reward, true)}).`,
            sana: new Date().toISOString(),
            read: false
          }, ...pkn];
          await db.s("notif_" + p.id, newNotifs);
        }
      } catch (e) {
        console.error("Proposed task notification error:", e);
      }
      ok$(lg === "uz" ? "Taklif ota-onaga jo'natildi! 💡" : "Proposal sent to parents!");
    } else {
      ok$(lg === "uz" ? "Vazifa qo'shildi! 🎯" : "Task added!");
    }
  };

  const vazifaAcceptProposed = useCallback(async (id, customReward) => {
    if (!canApproveTask(user))
      return ok$(lg === "uz" ? "Taklifni faqat katta oila a'zolari qabul qiladi" : "Only adults can accept task proposals", "err");
    buzz(15);
    const v = vazifalar.find(x => x.id === id);
    if (!v) return;

    // Remove any spaces or non-digit chars from the reward
    const cleanRewardStr = String(customReward != null ? customReward : v.reward).replace(/\D/g, "");
    const finalReward = Number(cleanRewardStr);

    if (isNaN(finalReward) || finalReward <= 0) {
      return ok$(lg === "uz" ? "Noto'g'ri narx" : "Invalid price", "err");
    }

    const upd = vazifalar.map(x => x.id === id ? { ...x, status: "pending", reward: finalReward, acceptedBy: user.id, acceptedByName: user.ism } : x);
    await db.s("vazifa_" + user.oilaId, upd);
    setVazifalar(upd);

    try {
      const kn = (await db.g("notif_" + v.assignedTo)) || [];
      await db.s("notif_" + v.assignedTo, [{
        id: Date.now(),
        type: "vazifa_accepted",
        text: lg === "uz"
          ? `🎉 Ota-onangiz "${v.title}" taklifingizni qabul qildi! Mukofot: ${f(finalReward, true)}.`
          : `🎉 Parent accepted your "${v.title}" proposal! Reward: ${f(finalReward, true)}.`,
        sana: new Date().toISOString(),
        read: false
      }, ...kn]);
    } catch (e) {}

    ok$(lg === "uz" ? "Taklif qabul qilindi! Vazifa faollashtirildi." : "Proposal accepted! Task activated.");
  }, [vazifalar, user, ok$, buzz, lg, f]);

  const delVazifa = async (id) => {
    const v = vazifalar.find(x => x.id === id);
    if (!canDeleteTask(user, v))
      return ok$(lg === "uz" ? "Faqat o'zingiz bergan yoki taklif qilgan vazifani o'chira olasiz" : "You can only delete tasks you created or proposed", "err");
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
