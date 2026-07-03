import { useCallback } from "react";
import { db } from "../firebase.js";
import { td, nt, f } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";
import { publishKidScore } from "../utils/kidsBoard.js";

export function useFamily() {
  const { user, oila, azolar, setAzolar, setOila,
          vazifalar, setVazifalar, kidBalances, setKidBalances,
          xar, setXar, dar, setDar,
          ok$, buzz, addStar, addNotif, fireConfetti, lg } = useApp();

  // Vazifa bajarildi (bola)
  const vazifaDone = useCallback(async (id) => {
    buzz(15);
    const upd = vazifalar.map(v => v.id===id ? {...v, status:"done", doneSana:td()} : v);
    await db.s("vazifa_" + user.oilaId, upd);
    setVazifalar(upd);
    ok$(lg==="uz"?"Bajarildi deb belgilandi! Ota-ona tasdiqlaydi.":"Marked done!");
  }, [vazifalar, user, ok$, buzz, lg]);

  // Vazifani tasdiqlash (ota-ona)
  const vazifaApprove = useCallback(async (id) => {
    buzz(20);
    const v = vazifalar.find(x => x.id===id);
    if (!v) return;

    // Balans tekshirish
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

    // Bola balansiga qo'shish — pul bola LOGIN bilan kiradigan HAQIQIY akkauntga borishi shart.
    // Yagona ishonchli manba: kidlogin_<login> → uid xaritasi.
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
        const realUid = await db.gFresh("kidlogin_" + loginKey);
        if (realUid) kidId = realUid;
      } catch (e2) {}
    } else if (cand.length) {
      kidId = cand.sort((a, b) => String(b.id).localeCompare(String(a.id)))[0].id;
    }
    const kb = {...kidBalances};
    // Xuddi shu bolaning boshqa (eski/dublikat) id'larida qolib ketgan pul — haqiqiy akkauntga jamlanadi
    const staleIds = [v.assignedTo, ...cand.map(a => a.id)].filter((id, i, arr) => id !== kidId && arr.indexOf(id) === i);
    staleIds.forEach(id => {
      if (kb[id]) { kb[kidId] = (kb[kidId] || 0) + (Number(kb[id]) || 0); delete kb[id]; }
    });
    kb[kidId] = (kb[kidId] || 0) + v.reward;
    await db.s("kidbal_" + user.oilaId, kb);
    setKidBalances(kb);

    // Global bolalar liderbordiga ball yozish (10 ball/vazifa + topilgan so'm ma'lumoti)
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

    // Ota/ona balansidan ayirish
    const xItem = {
      id: Date.now(), kategoriya:"boshqa", summa:v.reward,
      izoh:(lg==="uz"?"Vazifa mukofoti: ":"Task reward: ")+(v.title||""),
      sana:td(), vaqt:new Date().toTimeString().slice(0,5), uid:user.id, repeat:false
    };
    const xk = "x_" + user.oilaId + "_" + user.id;
    await db.s(xk, [xItem, ...((await db.g(xk))||[])]);
    setXar(x => [xItem, ...x]);

    // Bolaga bildirishnoma
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
  }, [vazifalar, kidBalances, user, xar, dar, ok$, buzz, addStar, lg]);

  return { vazifaDone, vazifaApprove };
}
