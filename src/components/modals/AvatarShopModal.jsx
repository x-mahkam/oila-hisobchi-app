import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AVATAR_CATALOG, getAvatarUri } from "../../bilim/avatarCatalog.jsx";
import { readCoins, spendCoins } from "../../bilim/engine/persist.js";
import { db } from "../../firebase.js";

const T = {
  uz: {
    title: "Avatar Do'koni",
    subtitle: "Yangi avatar sotib oling va profilingizni bezating!",
    coinsBalance: "Mening tangalarim",
    free: "Bepul",
    buy: "Sotib olish",
    unlocked: "Ochiq",
    active: "Amaldagi",
    select: "Tanlash",
    insufficientCoins: "Kechirasiz, sizda yetarli coin yo'q! Yana {amount} coin yig'ishingiz kerak.",
    errorTitle: "Coin yetarli emas",
    confirmTitle: "Xaridni tasdiqlash",
    confirmMsg: "Ushbu avatarni {price} coin evaziga sotib olmoqchisiz.",
    activeGoalWarning: "⚠️ Ogohlantirish: Sizda faol maqsad bor: '{goalTitle}'.",
    consciousSpendMsg: "Ushbu avatarni sotib olish sizning orzuyingizga yetishingizni sekinlashtiradi, chunki siz jamg'armangizdagi {price} coinni sarflaysiz.",
    wantsVsNeeds: "Ushbu xarid siz uchun hozir haqiqatan ham ehtiyojmi yoki shunchaki xohishmi? O'ylab ko'ring!",
    yesBuy: "Ha, sotib olaman",
    noCancel: "Yo'q, bekor qilish",
    successBuy: "Yangi avatar muvaffaqiyatli sotib olindi va o'rnatildi! 🎉",
    successSelect: "Avatar muvaffaqiyatli almashtirildi! ✓",
  },
  ru: {
    title: "Магазин Аватаров",
    subtitle: "Купите новый аватар и украсьте свой профиль!",
    coinsBalance: "Мои коины",
    free: "Бесплатно",
    buy: "Купить",
    unlocked: "Разблокирован",
    active: "Активен",
    select: "Выбрать",
    insufficientCoins: "Извините, у вас недостаточно коинов! Вам нужно собрать еще {amount} коинов.",
    errorTitle: "Недостаточно коинов",
    confirmTitle: "Подтверждение покупки",
    confirmMsg: "Вы собираетесь купить этот аватар за {price} коинов.",
    activeGoalWarning: "⚠️ Предупреждение: у вас есть активная цель: '{goalTitle}'.",
    consciousSpendMsg: "Покупка этого аватара замедлит достижение вашей цели, так как вы потратите {price} коинов из своих сбережений.",
    wantsVsNeeds: "Подумайте, является ли эта покупка реальной потребностью или просто мимолётным желанием?",
    yesBuy: "Да, купить",
    noCancel: "Нет, отменить",
    successBuy: "Новый аватар успешно куплен и установлен! 🎉",
    successSelect: "Аватар успешно изменен! ✓",
  },
  en: {
    title: "Avatar Shop",
    subtitle: "Buy a new avatar and customize your profile!",
    coinsBalance: "My Coins",
    free: "Free",
    buy: "Buy",
    unlocked: "Unlocked",
    active: "Active",
    select: "Select",
    insufficientCoins: "Sorry, you don't have enough coins! You need {amount} more coins.",
    errorTitle: "Insufficient Coins",
    confirmTitle: "Confirm Purchase",
    confirmMsg: "You are about to buy this avatar for {price} coins.",
    activeGoalWarning: "⚠️ Warning: You have an active goal: '{goalTitle}'.",
    consciousSpendMsg: "Buying this avatar will delay reaching your goal because you will spend {price} coins from your savings.",
    wantsVsNeeds: "Think about it: is this purchase a real need, or just a temporary want?",
    yesBuy: "Yes, buy it",
    noCancel: "No, cancel",
    successBuy: "New avatar successfully purchased and set! 🎉",
    successSelect: "Avatar successfully changed! ✓",
  }
};

export default function AvatarShopModal({ user, lg, th, dark, onClose, onAvatarChange, ok$, buzz }) {
  const [step, setStep] = useState(1);
  const [coins, setCoins] = useState(0);
  const [unlockedAvatars, setUnlockedAvatars] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasingItem, setPurchasingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const t = T[lg] || T.uz;

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        // Load actual coin balance
        const currentCoins = await readCoins(user.id);
        setCoins(currentCoins);

        // Load purchased avatars
        const purchased = (await db.g("bilim_avatars_" + user.id)) || [];
        setUnlockedAvatars(Array.isArray(purchased) ? purchased : []);

        // Load active goal to show warning/reflection
        if (user.oilaId) {
          const gList = (await db.g("maq_" + user.oilaId)) || [];
          if (Array.isArray(gList)) {
            const activeG = gList.find(m => 
              (m.uid === user.id || m.shared) && 
              !(m.completedAt || m.status === "completed" || (m.jamg >= m.maqsad && m.maqsad > 0))
            );
            setActiveGoal(activeG || null);
          }
        }
      } catch (err) {
        console.error("Error loading avatar shop data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, user?.oilaId]);

  const handleSelectItem = async (item) => {
    buzz(15);
    const dataUri = getAvatarUri(item.svgString);
    try {
      // Set the photo as user.photo in firestore
      const u2 = { ...user, photo: dataUri };
      await db.s("user_" + user.id, u2);
      onAvatarChange(dataUri, coins);
      ok$(t.successSelect);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleInitiatePurchase = (item) => {
    buzz(10);
    if (coins < item.price) {
      const needed = item.price - coins;
      ok$(t.insufficientCoins.replace("{amount}", needed), "err");
      return;
    }
    setPurchasingItem(item);
    setStep(2);
  };

  const handleConfirmPurchase = async () => {
    if (!purchasingItem || submitting) return;
    setSubmitting(true);
    buzz(25);

    try {
      const nextCoins = await spendCoins(user.id, purchasingItem.price);
      if (nextCoins === false) {
        ok$(t.errorTitle, "err");
        setStep(1);
        setSubmitting(false);
        return;
      }

      // 1. Save next coins balance locally
      setCoins(nextCoins);

      // 2. Add to unlocked avatars array
      const nextUnlocked = [...unlockedAvatars, purchasingItem.id];
      await db.s("bilim_avatars_" + user.id, nextUnlocked);
      setUnlockedAvatars(nextUnlocked);

      // 3. Update the user.photo locally and in firestore
      const dataUri = getAvatarUri(purchasingItem.svgString);
      const u2 = { ...user, photo: dataUri };
      await db.s("user_" + user.id, u2);

      // 4. Trigger state updates in parent component
      onAvatarChange(dataUri, nextCoins);

      ok$(t.successBuy);
      setStep(1);
      setPurchasingItem(null);
    } catch (err) {
      console.error("Error confirming avatar purchase:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      zIndex: 1001,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      backdropFilter: "blur(5px)",
      boxSizing: "border-box"
    }}>
      <div style={{
        background: th.sur,
        borderRadius: 24,
        padding: "24px 20px",
        width: "100%",
        maxWidth: 440,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxSizing: "border-box",
        border: "1px solid " + th.bor
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: th.sur,
            border: "1px solid " + th.bor,
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: th.t1,
            zIndex: 10
          }}
          className="ui-press"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
            <div style={{
              width: 36,
              height: 36,
              border: "3px solid " + th.ac + "33",
              borderTopColor: th.ac,
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            <span style={{ marginTop: 12, fontSize: 13, color: th.t2 }}>Loading...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                style={{ display: "flex", flexDirection: "column" }}
              >
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: th.t1, margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>
                    {t.title}
                  </h2>
                  <p style={{ fontSize: 13, color: th.t2, margin: 0, lineHeight: "1.4", padding: "0 10px" }}>
                    {t.subtitle}
                  </p>
                </div>

                {/* Coins HUD */}
                <div style={{
                  background: th.sur === "#fff" ? "#fef3c7" : "#1e1b4b",
                  border: "1.5px solid #fbbf24",
                  borderRadius: 16,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: th.t1 }}>
                    {t.coinsBalance}:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7.5" stroke="#fbbf24" strokeWidth="1.5" fill="#fbbf24" fillOpacity=".25"/>
                      <circle cx="10" cy="10" r="4.5" stroke="#fbbf24" strokeWidth="1.2"/>
                      <path d="M10 7.5v5M8 10h4" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#fbbf24", fontVariantNumeric: "tabular-nums" }}>
                      {coins}
                    </span>
                  </div>
                </div>

                {/* Avatar Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                  marginBottom: 10
                }}>
                  {AVATAR_CATALOG.map((item) => {
                    const isUnlocked = item.price === 0 || unlockedAvatars.includes(item.id);
                    const itemDataUri = getAvatarUri(item.svgString);
                    const isActive = user?.photo === itemDataUri;

                    return (
                      <div
                        key={item.id}
                        onClick={() => isUnlocked ? handleSelectItem(item) : handleInitiatePurchase(item)}
                        style={{
                          background: th.sur === "#fff" ? "#f8fafc" : "#1e293b",
                          border: isActive 
                            ? "2px solid #10b981" 
                            : isUnlocked 
                              ? "1px solid " + th.bor
                              : "1px solid " + th.bor,
                          borderRadius: 16,
                          padding: "12px 8px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "transform 0.15s, border-color 0.15s",
                          position: "relative"
                        }}
                        className="ui-press hover:scale-105"
                      >
                        {/* Active Badge */}
                        {isActive && (
                          <div style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            background: "#10b981",
                            borderRadius: "50%",
                            width: 16,
                            height: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        )}

                        {/* Avatar Image */}
                        <div style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          overflow: "hidden",
                          marginBottom: 8,
                          background: th.sur === "#fff" ? "#f1f5f9" : "#0f172a",
                          border: "1px solid " + th.bor,
                          padding: 2,
                          boxSizing: "border-box",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <img 
                            src={itemDataUri} 
                            alt={item.name[lg] || item.name.uz} 
                            referrerPolicy="no-referrer"
                            style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                          />
                        </div>

                        {/* Avatar Name */}
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: th.t1,
                          textAlign: "center",
                          width: "100%",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: 6
                        }}>
                          {item.name[lg] || item.name.uz}
                        </span>

                        {/* Price Tag */}
                        {isActive ? (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981" }}>
                            {t.active}
                          </span>
                        ) : isUnlocked ? (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: th.gr,
                            background: th.sur === "#fff" ? "#d1fae5" : "#064e3b",
                            padding: "2px 6px",
                            borderRadius: 8
                          }}>
                            {t.select}
                          </span>
                        ) : (
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            background: coins >= item.price ? (th.sur === "#fff" ? "#fef3c7" : "#451a03") : (th.sur === "#fff" ? "#fee2e2" : "#7f1d1d"),
                            padding: "2px 6px",
                            borderRadius: 8
                          }}>
                            {/* Lock Icon */}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: coins >= item.price ? "#d97706" : "#ef4444" }}>
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: coins >= item.price ? "#d97706" : "#ef4444",
                              fontVariantNumeric: "tabular-nums"
                            }}>
                              {item.price}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
              >
                {/* Large Preview */}
                <div style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  overflow: "hidden",
                  marginBottom: 16,
                  background: th.sur === "#fff" ? "#f1f5f9" : "#0f172a",
                  border: "3px solid #fbbf24",
                  padding: 4,
                  boxSizing: "border-box",
                  boxShadow: "0 10px 15px -3px rgba(251, 191, 36, 0.2)"
                }}>
                  <img 
                    src={getAvatarUri(purchasingItem.svgString)} 
                    alt={purchasingItem.name[lg] || purchasingItem.name.uz} 
                    referrerPolicy="no-referrer"
                    style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                  />
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: th.t1, margin: "0 0 8px 0" }}>
                  {t.confirmTitle}
                </h3>

                <p style={{ fontSize: 14, color: th.t2, margin: "0 0 16px 0", lineHeight: "1.5" }}>
                  {t.confirmMsg.replace("{price}", purchasingItem.price)}
                </p>

                {/* Conscious Spending Box - Wants vs Needs */}
                <div style={{
                  background: activeGoal 
                    ? (th.sur === "#fff" ? "#fffbeb" : "#451a03") 
                    : (th.sur === "#fff" ? "#f8fafc" : "#1e293b"),
                  border: activeGoal ? "1px solid #f59e0b" : "1px solid " + th.bor,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 24,
                  textAlign: "left",
                  boxSizing: "border-box",
                  width: "100%"
                }}>
                  {activeGoal ? (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 800, color: activeGoal ? "#d97706" : th.t1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{t.activeGoalWarning.replace("{goalTitle}", activeGoal.title)}</span>
                      </div>
                      <p style={{ fontSize: 12.5, color: th.t2, margin: "0 0 10px 0", lineHeight: "1.5" }}>
                        {t.consciousSpendMsg.replace("{price}", purchasingItem.price)}
                      </p>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: th.t1, margin: 0, lineHeight: "1.5", borderTop: "1px dashed " + (th.sur === "#fff" ? "#fde68a" : "#78350f"), paddingTop: 8 }}>
                        {t.wantsVsNeeds}
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: 13, color: th.t2, margin: 0, lineHeight: "1.5", textAlign: "center" }}>
                      {t.wantsVsNeeds}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", width: "100%", gap: 12 }}>
                  <button
                    onClick={() => {
                      buzz(8);
                      setStep(1);
                      setPurchasingItem(null);
                    }}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: 16,
                      background: "transparent",
                      border: "1px solid " + th.bor,
                      color: th.t2,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                    className="ui-press"
                  >
                    {t.noCancel}
                  </button>

                  <button
                    onClick={handleConfirmPurchase}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: 16,
                      background: "#10b981",
                      border: "none",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                    className="ui-press"
                  >
                    {submitting ? (
                      <div style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                      }} />
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{t.yesBuy}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
