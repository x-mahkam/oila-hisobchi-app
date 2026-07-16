import { useCallback } from "react";
import { db } from "../firebase.js";
import { td, nt, f } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";
import { KATS, KN } from "../utils/constants.js";
import i18n from "../i18n/index.js";

export function useTransactions() {
  const { user, oila, xar, setXar, dar, setDar,
          ok$, buzz, addStar, isPremium, syncDailyReminderRef } = useApp();

  // Xarajat qo'shish
  const addX = useCallback(async ({ kategoriya, summa, izoh, sana, repeat, forMember, mode }) => {
    if (!summa || Number(summa) <= 0) return ok$(i18n.t("enter_amount", { defaultValue: "Summa kiriting" }), "err");
    buzz(10);
    const sum = Number(summa);
    const key = "x_" + user.oilaId + "_" + user.id;

    if (forMember && mode === "give") {
      // Balans tekshiruvi — minusga tushmaslik
      const gD = dar.filter(d => d.uid === user.id || !d.uid).reduce((s, d) => s + Number(d.summa || 0), 0);
      const gX = xar.filter(x => x.uid === user.id || !x.uid).reduce((s, x) => s + Number(x.summa || 0), 0);
      if (gD - gX < sum) {
        ok$(i18n.t("insufficient_balance_param", { val: f(Math.max(0, gD - gX), true), defaultValue: "❌ Balans yetarli emas! Balans: " + f(Math.max(0, gD - gX), true) }), "err");
        return;
      }
      // Pul berish — a'zoga so'rov
      const defaultIzoh = i18n.t("cat_" + kategoriya, { defaultValue: KN[i18n.language]?.[KATS.findIndex(k=>k.id===kategoriya)] || kategoriya });
      const req = {
        id: Date.now(), fromUid: user.id, fromIsm: user.ism,
        toUid: forMember, kategoriya, summa: sum,
        izoh: izoh || defaultIzoh,
        sana, kind: "expense"
      };
      const reqArr = (await db.g("xreq_" + forMember)) || [];
      await db.s("xreq_" + forMember, [req, ...reqArr]);
      // O'zidan xarajat
      const xItem = { id:Date.now(), kategoriya, summa:sum, izoh:req.izoh, sana, vaqt:nt(), repeat:false, uid:user.id };
      await db.s(key, [xItem, ...(xar.filter(x=>x.uid===user.id))]);
      setXar(prev => [xItem, ...prev]);
      ok$(i18n.t("tx_request_sent_param", { val: f(sum, true), defaultValue: "So'rov yuborildi! -" + f(sum, true) }));
      syncDailyReminderRef.current?.();
      return;
    }

    if (forMember) {
      // Boshqa a'zo nomidan
      const defaultIzoh = i18n.t("cat_" + kategoriya, { defaultValue: KN[i18n.language]?.[KATS.findIndex(k=>k.id===kategoriya)] || kategoriya });
      const req = {
        id: Date.now(), fromUid: user.id, fromIsm: user.ism,
        toUid: forMember, kategoriya, summa: sum,
        izoh: izoh || defaultIzoh,
        sana, kind: "expense"
      };
      const reqArr = (await db.g("xreq_" + forMember)) || [];
      await db.s("xreq_" + forMember, [req, ...reqArr]);
      ok$(i18n.t("tx_request_sent", { defaultValue: "So'rov yuborildi" }));
      return;
    }

    // O'z xarajati
    const defaultIzoh = i18n.t("cat_" + kategoriya, { defaultValue: KN[i18n.language]?.[KATS.findIndex(k=>k.id===kategoriya)] || kategoriya });
    const item = {
      id: Date.now(), kategoriya, summa: sum,
      izoh: izoh || defaultIzoh,
      sana, vaqt: nt(), repeat, uid: user.id
    };

    // Balans tekshiruvi — manusga tushsa bloklash
    const myDar = dar.filter(d => d.uid === user.id || !d.uid).reduce((s, d) => s + Number(d.summa || 0), 0);
    const myXar = xar.filter(x => x.uid === user.id || !x.uid).reduce((s, x) => s + Number(x.summa || 0), 0);
    const currentBal = myDar - myXar;
    if (sum > currentBal) {
      ok$(
        i18n.t("tx_insufficient_balance_income_first", { val: f(Math.max(0, currentBal), true), defaultValue: "❌ Balans yetarli emas! Balans: " + f(Math.max(0, currentBal), true) + ". Avval daromad kiriting." }),
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
        const catName = i18n.t("cat_" + kategoriya, { defaultValue: KN[i18n.language]?.[KATS.findIndex(k=>k.id===kategoriya)] || kategoriya });
        ok$(catName + " " + i18n.t("limit_exceeded", { defaultValue: "limiti oshdi!" }), "warn");
        return;
      }
    }
    addStar(1, i18n.t("tx_expense_logged", { defaultValue: "Xarajat kiritildi" }));
    ok$(i18n.t("tx_expense_added", { defaultValue: "Xarajat qo'shildi" }));
    syncDailyReminderRef.current?.();
  }, [user, oila, xar, ok$, buzz, addStar, syncDailyReminderRef]);

  // Daromad qo'shish
  const addD = useCallback(async ({ tur, summa, izoh, sana }) => {
    if (!summa || Number(summa) <= 0) return ok$(i18n.t("enter_amount", { defaultValue: "Summa kiriting" }), "err");
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
    addStar(1, i18n.t("tx_income_logged", { defaultValue: "Daromad kiritildi" }));
    ok$(i18n.t("tx_income_added", { defaultValue: "Daromad qo'shildi" }));
    syncDailyReminderRef.current?.();
  }, [user, dar, ok$, buzz, addStar, syncDailyReminderRef]);

  // O'chirish (delTx)
  const delTx = useCallback(async (item) => {
    if (!user || !user.id || !user.oilaId) return;
    if (item.uid !== user.id) {
      return ok$(i18n.t("tx_only_own_delete", { defaultValue: "Faqat o'zingiz kiritgan amallarni o'chira olasiz" }), "warn");
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
    ok$(i18n.t("deleted", { defaultValue: "O'chirildi" }));
  }, [user, setXar, setDar, ok$, buzz]);

  // Tahrirlash (editTx)
  const editTx = useCallback(async (oldItem, updatedData) => {
    if (!user || !user.id || !user.oilaId) return;
    if (oldItem.uid !== user.id) {
      return ok$(i18n.t("tx_only_own_edit", { defaultValue: "Faqat o'zingiz kiritgan amallarni tahrirlay olasiz" }), "warn");
    }
    buzz(10);
    const isX = !!oldItem.kategoriya;
    const key = (isX ? "x_" : "d_") + user.oilaId + "_" + user.id;
    const existing = (await db.g(key)) || [];
    
    // update the transaction item
    const index = existing.findIndex(t => t.id === oldItem.id);
    if (index === -1) return ok$(i18n.t("not_found", { defaultValue: "Topilmadi" }), "err");
    
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
    ok$(i18n.t("saved_successfully", { defaultValue: "Muvaffaqiyatli saqlandi" }));
  }, [user, setXar, setDar, ok$, buzz]);

  return { addX, addD, delTx, editTx };
}
