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
      // Balans tekshiruvi — minusga tushmaslik
      const gD = dar.filter(d => d.uid === user.id || !d.uid).reduce((s, d) => s + Number(d.summa || 0), 0);
      const gX = xar.filter(x => x.uid === user.id || !x.uid).reduce((s, x) => s + Number(x.summa || 0), 0);
      if (gD - gX < sum) {
        ok$(lg === "uz" ? "❌ Balans yetarli emas! Balans: " + f(Math.max(0, gD - gX), true) : "❌ Insufficient balance!", "err");
        return;
      }
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

    // Balans tekshiruvi — manusga tushsa bloklash
    const myDar = dar.filter(d => d.uid === user.id || !d.uid).reduce((s, d) => s + Number(d.summa || 0), 0);
    const myXar = xar.filter(x => x.uid === user.id || !x.uid).reduce((s, x) => s + Number(x.summa || 0), 0);
    const currentBal = myDar - myXar;
    if (sum > currentBal) {
      ok$(lg === "uz"
        ? "❌ Balans yetarli emas! Balans: " + f(Math.max(0, currentBal), true) + ". Avval daromad kiriting."
        : "❌ Insufficient balance! Balance: " + f(Math.max(0, currentBal), true) + ". Add income first.",
        "err"
      );
      return;
    }
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

  // O'chirish (delTx)
  const delTx = useCallback(async (item) => {
    if (!user || !user.id || !user.oilaId) return;
    if (item.uid !== user.id) {
      return ok$(lg === "uz" ? "Faqat o'zingiz kiritgan amallarni o'chira olasiz" : "You can only delete your own transactions", "warn");
    }
    buzz(10);
    const isX = !!item.kategoriya;
    const key = (isX ? "x_" : "d_") + user.oilaId + "_" + user.id;
    const existing = (await db.g(key)) || [];
    const updated = existing.filter(t => t.id !== item.id);
    await db.s(key, updated);
    if (isX) {
      setXar(prev => prev.filter(x => !(x.id === item.id && x.uid === user.id)));
    } else {
      setDar(prev => prev.filter(d => !(d.id === item.id && d.uid === user.id)));
    }
    ok$(lg === "uz" ? "O'chirildi" : "Deleted");
  }, [user, setXar, setDar, ok$, buzz, lg]);

  // Tahrirlash (editTx)
  const editTx = useCallback(async (oldItem, updatedData) => {
    if (!user || !user.id || !user.oilaId) return;
    if (oldItem.uid !== user.id) {
      return ok$(lg === "uz" ? "Faqat o'zingiz kiritgan amallarni tahrirlay olasiz" : "You can only edit your own transactions", "warn");
    }
    buzz(10);
    const isX = !!oldItem.kategoriya;
    const key = (isX ? "x_" : "d_") + user.oilaId + "_" + user.id;
    const existing = (await db.g(key)) || [];
    
    // update the transaction item
    const index = existing.findIndex(t => t.id === oldItem.id);
    if (index === -1) return ok$(lg === "uz" ? "Topilmadi" : "Not found", "err");
    
    const newItem = {
      ...existing[index],
      summa: Number(updatedData.summa),
      izoh: updatedData.izoh,
      sana: updatedData.sana || oldItem.sana,
    };
    if (isX) {
      newItem.kategoriya = updatedData.kategoriya || oldItem.kategoriya;
      newItem.repeat = updatedData.repeat !== undefined ? updatedData.repeat : oldItem.repeat;
    } else {
      newItem.tur = updatedData.tur || oldItem.tur;
    }
    
    existing[index] = newItem;
    await db.s(key, existing);
    
    if (isX) {
      setXar(prev => prev.map(x => (x.id === oldItem.id && x.uid === user.id) ? newItem : x));
    } else {
      setDar(prev => prev.map(d => (d.id === oldItem.id && d.uid === user.id) ? newItem : d));
    }
    ok$(lg === "uz" ? "Muvaffaqiyatli saqlandi" : "Saved successfully");
  }, [user, setXar, setDar, ok$, buzz, lg]);

  return { addX, addD, delTx, editTx };
}
