import { useCallback } from "react";
import { db } from "../firebase.js";
import { td, nt, f } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";

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

    // Bola balansiga qo'shish — bir xil bolaning BARCHA yozuvlari (eski id, login, ism)
    // ichidan ENG YANGI akkaunti tanlanadi (eski o'lik yozuv id bo'yicha mos kelsa ham)
    const kidsAll = azolar.filter(a => a.rol === "kid");
    const nm = (x) => (x || "").trim().toLowerCase();
    const cand = kidsAll.filter(a =>
      a.id === v.assignedTo ||
      (v.assignedLogin && a.login && a.login === v.assignedLogin) ||
      (v.assignedName && a.ism && nm(a.ism) === nm(v.assignedName))
    );
    const realKid = cand.sort((a, b) => String(b.id).localeCompare(String(a.id)))[0];
    const kidId = realKid?.id || v.assignedTo;
    const kb = {...kidBalances};
    kb[kidId] = (kb[kidId]||0) + v.reward;
    // Eski id'da qolib ketgan cho'ntak puli bo'lsa — yangi akkauntga ko'chiriladi
    if (kidId !== v.assignedTo && kb[v.assignedTo]) {
      kb[kidId] += Number(kb[v.assignedTo]) || 0;
      delete kb[v.assignedTo];
    }
    await db.s("kidbal_" + user.oilaId, kb);
    setKidBalances(kb);

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
