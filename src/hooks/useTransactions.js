import { useCallback } from "react";
import { db } from "../firebase.js";
import { td, nt, f } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";
import { KATS, KN } from "../utils/constants.js";

export function useTransactions() {
  const { user, oila, xar, setXar, dar, setDar,
          ok$, buzz, addStar, lg, t, isPremium, syncDailyReminderRef } = useApp();

  // Xarajat qo'shish
  const addX = useCallback(async ({ kategoriya, summa, izoh, sana, repeat, forMember, mode }) => {
    if (!summa || Number(summa) <= 0) return ok$(t("ut_enterAmount"), "err");
    buzz(10);
    const sum = Number(summa);
    const key = "x_" + user.oilaId + "_" + user.id;

    if (forMember && mode === "give") {
      // Balans tekshiruvi — minusga tushmaslik
      const gD = dar.filter(d => d.uid === user.id || !d.uid).reduce((s, d) => s + Number(d.summa || 0), 0);
      const gX = xar.filter(x => x.uid === user.id || !x.uid).reduce((s, x) => s + Number(x.summa || 0), 0);
      if (gD - gX < sum) {
        ok$(t("ut_insufficientBalanceHave", { bal: f(Math.max(0, gD - gX), true) }), "err");
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
      ok$(t("ut_requestSentMinus", { amt: f(sum, true) }));
      syncDailyReminderRef.current?.();
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
      ok$(t("ut_requestSent"));
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
      ok$(t("ut_insufficientBalanceFull", { bal: f(Math.max(0, currentBal), true) }), "err");
      return;
    }
    // MUHIM: Firestore'dan qayta o'qish o'rniga xotiradagi joriy holatdan
    // (xar) foydalanamiz — bu tarmoq safarini yarmiga qisqartiradi va
    // tarix uzun bo'lgan foydalanuvchilarda "qo'shish" tugmasi sekin
    // ishlashining asosiy sababi shu edi.
    await db.s(key, [item, ...xar.filter(x => x.uid === user.id)]);
    setXar(prev => [item, ...prev]);

    // Budjet limit tekshirish
    const lim = oila?.katLimits?.[kategoriya];
    if (lim) {
      const month = sana.slice(0, 7);
      const total = [...xar.filter(x=>x.uid===user.id), item]
        .filter(x=>x.sana?.startsWith(month) && x.kategoriya===kategoriya)
        .reduce((s,x)=>s+Number(x.summa||0), 0);
      if (total > lim) {
        ok$(KN[lg][KATS.findIndex(k=>k.id===kategoriya)] + " " + t("ut_limitExceeded"), "warn");
        return;
      }
    }
    addStar(1, t("ut_expenseAddedStar"), "x_" + item.id);
    ok$(t("ut_expenseAdded"));
    syncDailyReminderRef.current?.();
  }, [user, oila, xar, ok$, buzz, addStar, lg, syncDailyReminderRef]);

  // Daromad qo'shish
  const addD = useCallback(async ({ tur, summa, izoh, sana }) => {
    if (!summa || Number(summa) <= 0) return ok$(t("ut_enterAmount"), "err");
    buzz(10);
    const sum = Number(summa);
    const item = {
      id: Date.now(), tur, summa: sum,
      izoh: izoh || tur,
      sana: sana || td(), vaqt: nt(), uid: user.id
    };
    const key = "d_" + user.oilaId + "_" + user.id;
    await db.s(key, [item, ...dar.filter(d => d.uid === user.id)]);
    setDar(prev => [item, ...prev]);
    addStar(1, t("ut_incomeAddedStar"), "d_" + item.id);
    ok$(t("ut_incomeAdded"));
    syncDailyReminderRef.current?.();
  }, [user, dar, ok$, buzz, addStar, t, syncDailyReminderRef]);

  // O'chirish (delTx)
  const delTx = useCallback(async (item) => {
    if (!user || !user.id || !user.oilaId) return;
    if (item.uid !== user.id) {
      return ok$(t("ut_onlyOwnDelete"), "warn");
    }
    buzz(10);
    const isX = !!item.kategoriya;
    const key = (isX ? "x_" : "d_") + user.oilaId + "_" + user.id;
    const existing = (isX ? xar : dar).filter(tx => tx.uid === user.id);
    const updated = existing.filter(tx => tx.id !== item.id);
    await db.s(key, updated);
    if (isX) {
      setXar(prev => prev.filter(x => !(x.id === item.id && x.uid === user.id)));
    } else {
      setDar(prev => prev.filter(d => !(d.id === item.id && d.uid === user.id)));
    }
    ok$(t("ut_deleted"));
  }, [user, xar, dar, setXar, setDar, ok$, buzz, t]);

  // Tahrirlash (editTx)
  const editTx = useCallback(async (oldItem, updatedData) => {
    if (!user || !user.id || !user.oilaId) return;
    if (oldItem.uid !== user.id) {
      return ok$(t("ut_onlyOwnEdit"), "warn");
    }
    buzz(10);
    const isX = !!oldItem.kategoriya;
    const key = (isX ? "x_" : "d_") + user.oilaId + "_" + user.id;
    const existing = (isX ? xar : dar).filter(tx => tx.uid === user.id);

    // update the transaction item
    const index = existing.findIndex(tx => tx.id === oldItem.id);
    if (index === -1) return ok$(t("ut_notFound"), "err");
    
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
    ok$(t("ut_savedSuccessfully"));
  }, [user, xar, dar, setXar, setDar, ok$, buzz, t]);

  return { addX, addD, delTx, editTx };
}
