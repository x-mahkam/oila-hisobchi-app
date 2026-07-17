import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";
import { tm, fmtN } from "../utils/formatters.js";
import { KATS, KN } from "../utils/constants.js";

export function useAIAdvice() {
  const {
    xar, dar, oila, maq, qarzlar, user, isPremium,
    setShowPremModal, setScr, lg, val, t
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
      if (bal2 >= 0) tips.push(t("aia_positiveBalance", { amt: f(bal2, true) }));
      else tips.push(t("aia_negativeBalance", { amt: f(-bal2, true) }));
    }
    const bpct = budget > 0 ? Math.round(totX / budget * 100) : 0;
    if (bpct >= 100) tips.push(t("aia_budgetWarning", { pct: bpct }));
    else if (bpct >= 80) tips.push(t("aia_budgetCheck", { pct: bpct }));
    else if (bpct > 0 && dayN <= 15 && bpct < 40) tips.push(t("aia_greatProgress", { pct: bpct }));
    
    const katTotals = KATS.map((k, i) => ({ nom: (KN[lg] || KN.uz)[i], sum: mX.filter(x => x.kategoriya === k.id).reduce((s, x) => s + Number(x.summa || 0), 0) })).filter(k => k.sum > 0).sort((a, b) => b.sum - a.sum);
    if (katTotals.length > 0 && totX > 0) { const top = katTotals[0]; const topPct = Math.round(top.sum / totX * 100); tips.push(t("aia_topSpending", { cat: top.nom, pct: topPct })); }
    
    if (totD > 0) {
      const savePct = bal2 > 0 ? Math.round(bal2 / totD * 100) : 0;
      if (savePct >= 20) tips.push(t("aia_savingsSuccess", { pct: savePct }));
      else if (savePct > 0) tips.push(t("aia_savingsAnalysisLow", { pct: savePct }));
      else if (bal2 < 0) tips.push(t("aia_savingsAnalysisNone"));
    }
    
    if (maq.length > 0) {
      const ng = maq.filter(m => !m.paid).map(m => ({ ...m, pct: Math.round(m.jamg / m.maqsad * 100) })).sort((a, b) => b.pct - a.pct)[0];
      if (ng) { if (ng.pct >= 80 && ng.pct < 100) tips.push(t("aia_goalProgress", { name: ng.ism, pct: ng.pct })); else if (ng.pct < 30) tips.push(t("aia_goalTip", { name: ng.ism })); }
    } else tips.push(t("aia_setGoal"));
    
    const aQ = qarzlar.filter(q => !q.paid);
    const meOwe = aQ.filter(q => q.tur === "olgan").reduce((s, q) => s + q.summa, 0);
    if (meOwe > 0) tips.push(t("aia_liabilities", { amt: f(meOwe, true) }));
    
    const genTips = [t("aia_genTip1"), t("aia_genTip2"), t("aia_genTip3"), t("aia_genTip4"), t("aia_genTip5")];
    tips.push(t("aia_practicalTipLabel") + genTips[new Date().getDate() % genTips.length]);
    
    const MOTIV = [t("aia_motiv1"), t("aia_motiv2"), t("aia_motiv3"), t("aia_motiv4"), t("aia_motiv5"), t("aia_motiv6"), t("aia_motiv7"), t("aia_motiv8")];
    tips.push(t("aia_motivationLabel") + MOTIV[new Date().getDate() % MOTIV.length]);
    
    const salom = totX === 0 && totD === 0 ? ""
      : bal2 >= 0
        ? t("aia_greetPositive", { name: user?.ism || t("aia_friendLower") })
        : t("aia_greetNegative", { name: user?.ism || t("aia_friendUpper") });
    
    if (totX === 0 && totD === 0) return t("aia_noDataYet");
    return salom + "\n\n" + t("aia_analysisHeader", { month: tm() }) + tips.join("\n\n");
  }, [xar, dar, oila, maq, qarzlar, user, lg, f, t]);

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
      setAdvErr(t("aia_errorGeneric"));
    } finally {
      setTimeout(() => setAdvL(false), 400);
    }
  }, [isPremium, setShowPremModal, setScr, fetchRemoteAdvice, buildLocalAdvice, t]);

  return {
    adv,
    advL,
    advErr,
    aiAdv,
    setAdv,
  };
}
