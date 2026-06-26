import { useCallback } from "react";
import { db } from "../firebase.js";
import { td, nt, f } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";
import { KATS, KN } from "../utils/constants.js";

export function useTransactions() {
  const { user, oila, xar, setXar, dar, setDar,
          ok$, buzz, addStar, lg, isPremium } = useApp();

  // Xarajat qo'shish
  const addX = useCallback(async ({ kategoriya, summa, izoh, sana, repeat, forMember, mode }) => {
    if (!summa || Number(summa) <= 0) return ok$(lg==="uz"?"Summa kiriting":"Enter amount", "err");
    buzz(10);
    const sum = Number(summa);
    const key = "x_" + user.oilaId + "_" + user.id;

    if (forMember && mode === "give") {
      // Pul berish — a'zoga so'rov
      const req = {
        id: Date.now(), fromUid: user.id, fromIsm: user.ism,
        toUid: forMember, kategoriya, summa: sum,
        izoh: izoh || KN[lg][KATS.findIndex(k=>k.id===kategoriya)],
        sana, kind: "expense"
      };
      const reqArr = (await db.g("xreq_" + forMember)) || [];
      await db.s("xreq_" + forMember, [req, ...reqArr]);
      // O'zidan xarajat
      const xItem = { id:Date.now(), kategoriya, summa:sum, izoh:req.izoh, sana, vaqt:nt(), repeat:false, uid:user.id };
      await db.s(key, [xItem, ...(xar.filter(x=>x.uid===user.id))]);
      setXar(prev => [xItem, ...prev]);
      ok$(lg==="uz"?"So'rov yuborildi! -"+f(sum,true):"Request sent! -"+f(sum,true));
      return;
    }

    if (forMember) {
      // Boshqa a'zo nomidan
      const req = {
        id: Date.now(), fromUid: user.id, fromIsm: user.ism,
        toUid: forMember, kategoriya, summa: sum,
        izoh: izoh || KN[lg][KATS.findIndex(k=>k.id===kategoriya)],
        sana, kind: "expense"
      };
      const reqArr = (await db.g("xreq_" + forMember)) || [];
      await db.s("xreq_" + forMember, [req, ...reqArr]);
      ok$(lg==="uz"?"So'rov yuborildi":"Request sent");
      return;
    }

    // O'z xarajati
    const item = {
      id: Date.now(), kategoriya, summa: sum,
      izoh: izoh || KN[lg][KATS.findIndex(k=>k.id===kategoriya)],
      sana, vaqt: nt(), repeat, uid: user.id
    };
    const existing = (await db.g(key)) || [];
    await db.s(key, [item, ...existing]);
    setXar(prev => [item, ...prev]);

    // Budjet limit tekshirish
    const lim = oila?.katLimits?.[kategoriya];
    if (lim) {
      const month = sana.slice(0, 7);
      const total = [...xar.filter(x=>x.uid===user.id), item]
        .filter(x=>x.sana?.startsWith(month) && x.kategoriya===kategoriya)
        .reduce((s,x)=>s+Number(x.summa||0), 0);
      if (total > lim) {
        ok$(KN[lg][KATS.findIndex(k=>k.id===kategoriya)] + " " + (lg==="uz"?"limiti oshdi!":"limit exceeded!"), "warn");
        return;
      }
    }
    addStar(1, lg==="uz"?"Xarajat kiritildi":"Expense added");
    ok$(lg==="uz"?"Xarajat qo'shildi":"Expense added");
  }, [user, oila, xar, ok$, buzz, addStar, lg]);

  // Daromad qo'shish
  const addD = useCallback(async ({ tur, summa, izoh, sana }) => {
    if (!summa || Number(summa) <= 0) return ok$(lg==="uz"?"Summa kiriting":"Enter amount", "err");
    buzz(10);
    const sum = Number(summa);
    const item = {
      id: Date.now(), tur, summa: sum,
      izoh: izoh || tur,
      sana: sana || td(), vaqt: nt(), uid: user.id
    };
    const key = "d_" + user.oilaId + "_" + user.id;
    const existing = (await db.g(key)) || [];
    await db.s(key, [item, ...existing]);
    setDar(prev => [item, ...prev]);
    addStar(1, lg==="uz"?"Daromad kiritildi":"Income added");
    ok$(lg==="uz"?"Daromad qo'shildi":"Income added");
  }, [user, dar, ok$, buzz, addStar, lg]);

  return { addX, addD };
}
