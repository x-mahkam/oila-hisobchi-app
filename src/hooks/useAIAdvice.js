import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";
import { tm, fmtN } from "../utils/formatters.js";
import { KATS, KN } from "../utils/constants.js";
import i18n from "../i18n/index.js";

export function useAIAdvice() {
  const {
    xar, dar, oila, maq, qarzlar, user, isPremium,
    setShowPremModal, setScr, val
  } = useApp();

  const [adv, setAdv] = useState("");
  const [advL, setAdvL] = useState(false);
  const [advErr, setAdvErr] = useState("");

  const f = useCallback((n, sh) => fmtN(n, val, sh), [val]);

  // Lokal tahlil dvigateli — internetga bog'liq emas, HAR DOIM tahlil natijasini taqdim etadi.
  const buildLocalAdvice = useCallback(() => {
    const mX = xar.filter(x => x.sana && x.sana.indexOf(tm()) === 0);
    const mD = dar.filter(d => d.sana && d.sana.indexOf(tm()) === 0);
    const totX = mX.reduce((s, x) => s + Number(x.summa || 0), 0);
    const totD = mD.reduce((s, d) => s + Number(d.summa || 0), 0);
    const budget = oila && oila.budjet ? oila.budjet : 2000000;
    const bal2 = totD - totX;
    const dayN = new Date().getDate();
    const tips = [];

    if (totD > 0 || totX > 0) {
      if (bal2 >= 0) {
        tips.push(i18n.t("ai_tip_positive_bal", { val: f(bal2, true), defaultValue: "◆ Ijobiy balans: Bu oy balansingiz ijobiy: +" + f(bal2, true) + ". Barakali boring!" }));
      } else {
        tips.push(i18n.t("ai_tip_negative_bal", { val: f(-bal2, true), defaultValue: "◆ Diqqat: Bu oy xarajat daromaddan " + f(-bal2, true) + " ko'p." }));
      }
    }
    const bpct = budget > 0 ? Math.round(totX / budget * 100) : 0;
    if (bpct >= 100) {
      tips.push(i18n.t("ai_tip_budget_warn", { pct: bpct, defaultValue: "◆ Budjet ogohlantirishi: Budjet " + bpct + "% ishlatildi!" }));
    } else if (bpct >= 80) {
      tips.push(i18n.t("ai_tip_budget_check", { pct: bpct, defaultValue: "◆ Budjet nazorati: Budjetning " + bpct + "% sarflandi." }));
    } else if (bpct > 0 && dayN <= 15 && bpct < 40) {
      tips.push(i18n.t("ai_tip_budget_great", { pct: bpct, defaultValue: "◆ Zo'r natija: Ajoyib! Oy yarmida faqat " + bpct + "% sarfladingiz." }));
    }
    
    const katTotals = KATS.map((k, i) => ({ nom: i18n.t("cat_" + k.id, { defaultValue: (KN[i18n.language] || KN.uz)[i] }), sum: mX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).filter(k => k.sum > 0).sort((a, b) => b.sum - a.sum);
    if (katTotals.length > 0 && totX > 0) {
      const top = katTotals[0];
      const topPct = Math.round(top.sum / totX * 100);
      tips.push(i18n.t("ai_top_spending", { cat: top.nom, pct: topPct, defaultValue: "◆ Eng yuqori xarajat: Eng ko'p xarajat: " + top.nom + " (" + topPct + "%)." }));
    }
    
    if (totD > 0) {
      const savePct = bal2 > 0 ? Math.round(bal2 / totD * 100) : 0;
      if (savePct >= 20) {
        tips.push(i18n.t("ai_tip_savings_success", { pct: savePct, defaultValue: "◆ Jamg'arma muvaffaqiyati: Daromadning " + savePct + "% jamg'ardingiz. A'lo natija!" }));
      } else if (savePct > 0) {
        tips.push(i18n.t("ai_tip_savings_analysis", { pct: savePct, defaultValue: "◆ Jamg'arma tahlili: Daromadning faqat " + savePct + "% qoldi." }));
      } else if (bal2 < 0) {
        tips.push(i18n.t("ai_tip_savings_none", { defaultValue: "◆ Jamg'arma tahlili: Bu oy jamg'arma bo'lmadi." }));
      }
    }
    
    if (maq.length > 0) {
      const ng = maq.filter(m => !m.paid).map(m => ({ ...m, pct: Math.round(m.jamg / m.maqsad * 100) })).sort((a, b) => b.pct - a.pct)[0];
      if (ng) {
        if (ng.pct >= 80 && ng.pct < 100) {
          tips.push(i18n.t("ai_tip_goal_progress", { name: ng.ism, pct: ng.pct, defaultValue: "◆ Maqsad progressi: '" + ng.ism + "' maqsadi " + ng.pct + "% bajarildi!" }));
        } else if (ng.pct < 30) {
          tips.push(i18n.t("ai_tip_goal_advice", { name: ng.ism, defaultValue: "◆ Maqsad maslahati: '" + ng.ism + "' uchun har oy summa ajrating." }));
        }
      }
    } else {
      tips.push(i18n.t("ai_tip_goal_none", { defaultValue: "◆ Maqsad qo'ying: Maqsad qo'ying — jamg'arish uchun motivatsiya veradi." }));
    }
    
    const aQ = qarzlar.filter(q => !q.paid);
    const meOwe = aQ.filter(q => q.tur === "olgan").reduce((s, q) => s + q.summa, 0);
    if (meOwe > 0) {
      tips.push(i18n.t("ai_tip_liabilities", { amount: f(meOwe, true), defaultValue: "◆ Majburiyatlar: Sizda " + f(meOwe, true) + " qarz bor." }));
    }
    
    const genTips = [
      "50/30/20 qoidasini qo'llang: daromadning 50% zarur xarajatlarga, 30% xohish-istaklarga, 20% jamg'armaga.",
      "Kichik tejamkorlik — katta baraka. Har kuni ozgina tejasangiz, yiliga katta summa bo'ladi.",
      "Xarid ro'yxati — eng yaxshi qalqon. Ro'yxat tuzib, faqat shu mahsulotlarni oling.",
      "Oylik daromad kelishi bilan birinchi navbatda majburiy to'lovlarni chetga oling.",
      "Moliyaviy xavfsizlik yostig'i: kamida 3 oylik xarajatga teng zaxira fondi yarating."
    ];
    const genTipsEn = [
      "Use 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
      "Small savings add up over a year.",
      "A shopping list is your best shield.",
      "Pay mandatory bills first when income arrives.",
      "Build a 3-month emergency fund."
    ];
    const tipIndex = new Date().getDate() % genTips.length;
    const defaultTipVal = i18n.language === "en" ? genTipsEn[tipIndex] : genTips[tipIndex];
    tips.push(i18n.t("ai_tip_label", { defaultValue: "◆ Maslahat: " }) + i18n.t("ai_gen_tip_" + tipIndex, { defaultValue: defaultTipVal }));
    
    const MOTIV = [
      "Boylik bir kunda yig'ilmaydi — lekin har kungi to'g'ri qaror sizni unga yaqinlashtiradi. Siz to'g'ri yo'ldasiz!",
      "Pulni boshqarayotgan og'am — kelajagini boshqarayotgan odam. Davom eting!",
      "Bugungi kichik tejamkorlik — ertangi katta imkoniyat. Har bir so'm ishlasin!",
      "Eng yaxshi sarmoya — o'z moliyaviy intizomingizga qilingan sarmoya. Barakalla!",
      "Maqsadi bor odam yo'ldan adashmaydi. Maqsadlaringizga sodiq qoling!",
      "Daromad qancha bo'lishidan qat'i nazar, uni hisoblab yurgan oila hech qachon kam bo'lmaydi.",
      "Sabr va izchillik — moliyaviy erkinlikning ikki qanoti. Siz uchyapsiz!",
      "Har hisobot — bir qadam oldinga. O'zingizni tahlil qilayotganingiz allaqachon g'alaba!"
    ];
    const MOTIVEn = [
      "Wealth is built one good decision at a time.",
      "Manage your money, manage your future.",
      "Small savings today, big opportunities tomorrow.",
      "Discipline is the best investment.",
      "A person with a goal never gets lost.",
      "A family that counts never lacks.",
      "Patience and consistency are the wings of financial freedom.",
      "Every report is a step forward."
    ];
    const motivIndex = new Date().getDate() % MOTIV.length;
    const defaultMotivVal = i18n.language === "en" ? MOTIVEn[motivIndex] : MOTIV[motivIndex];
    tips.push(i18n.t("ai_motivation_label", { defaultValue: "◆ Motivatsiya: " }) + i18n.t("ai_motiv_" + motivIndex, { defaultValue: defaultMotivVal }));
    
    const salomUz = bal2 >= 0
      ? "◆ Barakalla, " + (user?.ism || "do'stim") + "! Siz moliyangizni nazoratda tutyapsiz — bu ko'pchilikning qo'lidan kelmaydi. Keling, tahlilni ko'ramiz:"
      : "◆ Diqqatli bo'ling, " + (user?.ism || "Do'stim") + ", tashvishlanmang — har bir katta yutuq kichik qadamdan boshlanadi. Bu oy tahlili sizga yo'l ko'rsatadi:";
    const salomEn = bal2 >= 0
      ? "◆ Great job, " + (user?.ism || "") + "!"
      : "◆ Don't worry, every big win starts small.";
    const defaultSalom = i18n.language === "en" ? salomEn : salomUz;
    const salom = totX === 0 && totD === 0 ? "" : i18n.t(bal2 >= 0 ? "ai_salut_positive" : "ai_salut_negative", { name: user?.ism || "", defaultValue: defaultSalom });
    
    if (totX === 0 && totD === 0) {
      return i18n.t("ai_no_data", { defaultValue: "Hali bu oy uchun ma'lumot yo'q. Xarajat va daromad kiriting!" });
    }
    return salom + "\n\n" + i18n.t("ai_month_analysis_header", { month: tm(), defaultValue: "◆ " + tm() + " tahlili\n\n" }) + tips.join("\n\n");
  }, [xar, dar, oila, maq, qarzlar, user, f]);

  // Masofaviy maslahat o'chirildi (faqat offline va tezkor lokal tizim ishlaydi)
  const fetchRemoteAdvice = useCallback(async () => {
    return null;
  }, []);

  const aiAdv = useCallback(async () => {
    if (!isPremium) { setShowPremModal(true); return; }
    setAdvL(true); setAdv(""); setAdvErr(""); setScr("maslahat");
    try {
      let text = null;
      try { text = await fetchRemoteAdvice(); }
      catch (e) { text = null; }
      if (!text) text = buildLocalAdvice();
      setAdv(text);
    } catch (e) {
      setAdvErr(i18n.t("ai_error_generating", { defaultValue: "Maslahat tayyorlashda xatolik yuz berdi. Internetni tekshirib, qayta urinib ko'ring." }));
    } finally {
      setTimeout(() => setAdvL(false), 400);
    }
  }, [isPremium, setShowPremModal, setScr, fetchRemoteAdvice, buildLocalAdvice]);

  return {
    adv,
    advL,
    advErr,
    aiAdv,
    setAdv,
  };
}
