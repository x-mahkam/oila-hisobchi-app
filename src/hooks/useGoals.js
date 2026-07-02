import { useCallback, useState } from "react";
import { db } from "../firebase.js";
import { td, f } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";

export function useGoals() {
  const { user, oila, azolar, maq, setMaq, xar, setXar, dar,
          ok$, buzz, addStar, addNotif, fireConfetti, lg, isPremium,
          setMaqsadConfirmNotif } = useApp();

  const [tupId, setTupId] = useState(null);
  const [tupS, setTupS]   = useState("");

  const addMq = useCallback(async ({ ism, maqsad, rang, shared }) => {
    if (!ism?.trim() || !maqsad || Number(maqsad) <= 0) {
      return ok$(lg==="uz"?"Barcha maydonlarni to'ldiring":"Fill all fields", "err");
    }
    if (!isPremium && maq.length >= 3) return; // show premium

    const u = [...maq, {
      id:Date.now(), ism:ism.trim(), maqsad:Number(maqsad),
      jamg:0, rang, createdAt:td(), uid:user.id, status:"active",
      shared: shared === true
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
      // Kattalar: balansdan ayirish
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
    }

    const tgtGoal = maq.find(m=>m.id===tupId);
    const wasComplete = tgtGoal && (tgtGoal.jamg+summa) >= tgtGoal.maqsad && tgtGoal.jamg < tgtGoal.maqsad;
    const completedNow = wasComplete ? td() : undefined;
    const u = maq.map(m => m.id===tupId
      ? {...m, jamg:Math.min(m.maqsad, m.jamg+summa), ...(wasComplete?{completedAt:completedNow}:{})}
      : m
    );

    if (wasComplete) {
      fireConfetti(); buzz(20);
      addStar(10, lg==="uz"?"Maqsadga yetildi: "+(tgtGoal?.ism||""):"Goal reached: "+(tgtGoal?.ism||""));
      if (isKid) {
        // Ota/onaga xabar
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
        // Kattalar confirm modal
        if (typeof setMaqsadConfirmNotif === "function") {
          setMaqsadConfirmNotif({ type:"self_confirm", maqsadId:tgtGoal?.id, maqsadIsm:tgtGoal?.ism||"", summa:tgtGoal?.maqsad||0 });
        }
      }
    }

    await db.s("maq_" + user.oilaId, u);
    setMaq(u);
    setTupId(null); setTupS("");
    ok$(isKid?(lg==="uz"?"Orzungizga "+f(summa,true)+" jamg'arildi! 🌟":"Saved!"):lg==="uz"?"Yangilandi":"Updated");
  }, [tupId, tupS, maq, user, oila, azolar, xar, dar, ok$, buzz, addStar, addNotif, fireConfetti, lg]);

  const delMq = useCallback(async (id) => {
    const goal = maq.find(m=>m.id===id);
    // Agar pul jamg'arilgan bo'lsa qaytarish
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
  }, [maq, user, lg]);

  return { tupId, setTupId, tupS, setTupS, addMq, tupMq, delMq };
}
