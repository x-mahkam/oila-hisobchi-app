import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Purchases } from "@revenuecat/purchases-capacitor";
import {
  BottomSheet, AppCard, ListItem, Badge, SectionHeader,
  PremiumButton, GhostButton, PrimaryButton
} from "../ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, PREMIUM, SHADOW } from "../../utils/tokens.js";
import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "react-i18next";

// ── Premium-lokal outline SVG ikonkalar (DS 6-qoida) ──
const PIco = {
  gem: (c, s = 26) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M5 2.5h8L16.5 7 9 15.5 1.5 7 5 2.5z" fill={c} opacity=".2" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M1.5 7h15M6.5 7L9 15.5 11.5 7M5 2.5L6.5 7 9 2.5l2.5 4.5 1.5-4.5" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  target: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.2" opacity=".4"/><circle cx="8" cy="8" r="3.8" stroke={c} strokeWidth="1.2" opacity=".7"/><circle cx="8" cy="8" r="1.4" fill={c}/></svg>,
  family: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2.2" stroke={c} strokeWidth="1.2"/><circle cx="11" cy="5.8" r="1.7" stroke={c} strokeWidth="1.2"/><path d="M1.5 13.5c0-2.4 1.8-4 4-4s4 1.6 4 4M9.5 13.5c.2-1.9 1.3-3 2.8-3 1.4 0 2.4 1 2.7 3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  doc: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 1.5h5.5L13 5v9.5H4V1.5z" fill={c} opacity=".1" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M9.5 1.5V5H13M6 8.5h5M6 11h3.5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  mic: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="6" y="1.5" width="4" height="7.5" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.2"/><path d="M3.5 7.5c0 2.6 2 4.5 4.5 4.5s4.5-1.9 4.5-4.5M8 12v2.5M6 14.5h4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  qr: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke={c} strokeWidth="1.2"/><rect x="9" y="2" width="5" height="5" rx="1" stroke={c} strokeWidth="1.2"/><rect x="2" y="9" width="5" height="5" rx="1" stroke={c} strokeWidth="1.2"/><path d="M9 9h2v2H9zM12 12h2v2h-2zM12 9h2M9 12v2" stroke={c} strokeWidth="1.2"/></svg>,
  ai: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.2 3.3L12.5 6 9.2 7.2 8 10.5 6.8 7.2 3.5 6l3.3-1.2L8 1.5z" fill={c} opacity=".2" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/><path d="M12.5 10l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6z" fill={c}/></svg>,
  check: (c, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevD: (c, s = 12, open) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}><path d="M4 6l4 4 4-4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
};

export default function PremiumModal({ th, STY, lg, onActivate, onClose }) {
  const { isPremium, fireConfetti, buzz, user, activatePremium } = useApp();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTier, setActiveTier] = useState("yearly"); // monthly | yearly | lifetime
  const [checkoutStep, setCheckoutStep] = useState("tiers"); // tiers | success
  const [isLoading, setIsLoading] = useState(false);
  const [rcOfferings, setRcOfferings] = useState(null);
  const [rcError, setRcError] = useState("");

  const { t, i18n } = useTranslation();
  const L = (key, uz, ru = uz, en = uz, kk = uz, ky = uz, tg = uz, qr = uz) => {
    const activeLg = i18n.language || lg || "uz";
    const fallback = activeLg === "uz" ? uz :
                     activeLg === "ru" ? ru :
                     activeLg === "kk" ? kk :
                     activeLg === "ky" ? ky :
                     activeLg === "tg" ? tg :
                     activeLg === "qr" ? qr :
                     en;
    return t(key, fallback);
  };

  const uz = (i18n.language || lg || "uz") === "uz";
  const gold = PREMIUM.gold;

  const TIERS = {
    monthly: {
      id: "monthly",
      title: L("tier_monthly_title", "Oylik", "Ежемесячно", "Monthly", "Ай сайын", "Ай сайын", "Ҳармоҳа", "Aylıq"),
      price: "15 000 UZS",
      sub: L("tier_monthly_sub", "Har oy to'lanadi", "Оплачивается ежемесячно", "Billed monthly", "Ай сайын төленеді", "Ай сайын төлөнөт", "Ҳар моҳ пардохт мешавад", "Ha'r ay to'lenedi"),
      tag: null,
      val: 15000,
    },
    yearly: {
      id: "yearly",
      title: L("tier_yearly_title", "Yillik obuna", "Годовая подписка", "Yearly Plan", "Жылдық жазылым", "Жылдык жазылуу", "Обунаи солона", "Jıllıq obuna"),
      price: "99 000 UZS",
      sub: L("tier_yearly_sub", "Yiliga bir marta to'lov", "Оплата раз в год", "Billed annually", "Жылына бір рет төлеу", "Жылына бир жолу төлөө", "Пардохт як бор дар сол", "Jılına bir ma'rte to'lew"),
      tag: L("tier_yearly_tag", "Eng ommabop (-45%)", "Самый популярный (-45%)", "Popular (-45%)", "Ең танымал (-45%)", "Эң популярдуу (-45%)", "Маҳбубтарин (-45%)", "En' ommabop (-45%)"),
      val: 99000,
    },
    lifetime: {
      id: "lifetime",
      title: L("tier_lifetime_title", "Umrbod (Lifetime)", "Пожизненно (Lifetime)", "Lifetime Access", "Өмір бойы (Lifetime)", "Өмүр бою (Lifetime)", "Барои ҳамеша (Lifetime)", "U'mrbod (Lifetime)"),
      price: "199 000 UZS",
      sub: L("tier_lifetime_sub", "Bir martalik to'lov, abadiy!", "Единоразовый платеж, навсегда!", "One-time payment, forever!", "Бір реттік төлем, мәңгілікке!", "Бир жолку төлөм, түбөлүккө!", "Пардохти яккарата, барои ҳамеша!", "Bir ma'rtelik to'lew, a'badiy!"),
      tag: L("tier_lifetime_tag", "Eng yaxshi qiymat", "Лучшая цена", "Best value", "Ең жақсы баға", "Эң жакшы баа", "Арзиши олӣ", "En' jaqsı qıymat"),
      val: 199000,
    }
  };

  useEffect(() => {
    async function initAndLoadRevenueCat() {
      if (!Capacitor.isNativePlatform()) {
        console.log("Web mode: using static mock plans.");
        return;
      }
      try {
        setIsLoading(true);
        const apiKey = import.meta.env.VITE_REVENUECAT_API_KEY || "goog_mock_api_key_for_android";
        await Purchases.configure({
          apiKey,
          appUserID: user?.oilaId || user?.id || "anonymous"
        });
        const offeringsData = await Purchases.getOfferings();
        setRcOfferings(offeringsData);
      } catch (err) {
        console.error("RevenueCat offering load error:", err);
        setRcError(err.message || "Failed to load packages");
      } finally {
        setIsLoading(false);
      }
    }
    initAndLoadRevenueCat();
  }, [user]);

  const handlePurchaseClick = async () => {
    if (!Capacitor.isNativePlatform()) return;

    buzz(15);
    setIsLoading(true);

    try {
      let selectedPackage = null;
      if (rcOfferings?.current?.availablePackages) {
        selectedPackage = rcOfferings.current.availablePackages.find(p => p.identifier.includes(activeTier) || p.product.identifier.includes(activeTier));
      }
      
      if (!selectedPackage && rcOfferings?.current?.availablePackages?.length > 0) {
        selectedPackage = rcOfferings.current.availablePackages[0];
      }

      if (!selectedPackage) {
        throw new Error(L("rc_package_not_found", "RevenueCat obuna paketi topilmadi", "Пакет подписки RevenueCat не найден", "No active RevenueCat packages found", "RevenueCat жазылым пакеті табылмады", "RevenueCat жазылуу пакети табылган жок", "Бастаи обунаи RevenueCat ёфт нашуд", "RevenueCat obuna paketi tabılmadı"));
      }

      const res = await Purchases.purchasePackage({ aPackage: selectedPackage });
      const purchaseToken = res.customerInfo?.originalAppUserId || "native_rc_token";
      
      const verifyRes = await activatePremium(purchaseToken, selectedPackage.product.identifier);
      if (verifyRes.success) {
        setCheckoutStep("success");
        if (typeof fireConfetti === "function") {
          fireConfetti();
        }
      }
    } catch (e) {
      console.error("RevenueCat purchase error:", e);
      if (!e.userCancelled) {
        alert(L("payment_failed_prefix", "To'lov amalga oshmadi: ", "Ошибка оплаты: ", "Payment failed: ", "Төлем сәтсіз аяқталды: ", "Төлөм ишке ашкан жок: ", "Пардохт ноком шуд: ", "To'lew a'melge aspadi: ") + (e.message || e));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (!Capacitor.isNativePlatform()) return;

    buzz(15);
    setIsLoading(true);
    try {
      const { customerInfo } = await Purchases.restorePurchases();
      const entitlements = customerInfo.entitlements.active;
      if (Object.keys(entitlements).length > 0) {
        const ent = Object.values(entitlements)[0];
        const verifyRes = await activatePremium(ent.transactionIdentifier || "restore_token", ent.productIdentifier);
        if (verifyRes.success) {
          alert(L("restore_success", "Xaridlar muvaffaqiyatli tiklandi!", "Покупки успешно восстановлены!", "Purchases restored successfully!", "Сатып алулар сәтті қалпына келтірілді!", "Сатып алуулар ийгиликтүү калыбына келтирилди!", "Харидҳо бомуваффақият барқарор шуданд!", "Satıp alıwlar tabıslı qalpına keltirildi!"));
          onClose();
        } else {
          alert(L("restore_verify_error", "Xaridni tasdiqlashda xatolik: ", "Ошибка подтверждения покупки: ", "Verification error: ", "Сатып алуды растау қатесі: ", "Сатып алууну ырастоо катасы: ", "Хатогии тасдиқи харид: ", "Satıp alıwdı tastıyıqlawda qa'telik: ") + verifyRes.message);
        }
      } else {
        alert(L("restore_not_found", "Faol premium xaridlar topilmadi.", "Активные премиум покупки не найдены.", "No active premium purchases found.", "Белсенді премиум сатып алулар табылмады.", "Активдүү премиум сатып алуулар табылган жок.", "Харидҳои фаъоли премиум ёфт нашуданд.", "Faol premium satıp alıwlar tabılmadı."));
      }
    } catch (e) {
      console.error("Restore Purchases Error:", e);
      alert(L("restore_error", "Xaridlarni tiklashda xatolik: ", "Ошибка восстановления покупок: ", "Error restoring purchases: ", "Сатып алуларды қалпына келтіру қатесі: ", "Сатып алууларды калыбына келтирүү катасы: ", "Хатогии барқарорсозии харидҳо: ", "Satıp alıwlardı qalpına keltiriwde qa'telik: ") + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const FEATURES = [
    { ico: PIco.target,
      uz: "Cheksiz maqsad",
      ru: "Безлимитные цели",
      en: "Unlimited goals",
      kk: "Шексіз мақсаттар",
      ky: "Чексиз максаттар",
      tg: "Ҳадафҳои номаҳдуд",
      qr: "Sheksiz maqset"
    },
    { ico: PIco.family,
      uz: "Cheksiz oila a'zosi",
      ru: "Безлимитные члены семьи",
      en: "Unlimited members",
      kk: "Шексіз отбасы мүшелері",
      ky: "Үй-бүлөнүн чексиз мүчөлөрү",
      tg: "Аъзоёни номаҳдуди оила",
      qr: "Sheksiz shan'araq ag'zası"
    },
    { ico: PIco.doc,
      uz: "PDF/Excel eksport",
      ru: "Экспорт в PDF/Excel",
      en: "PDF/Excel export",
      kk: "PDF/Excel экспорты",
      ky: "PDF/Excel экспорту",
      tg: "Интиқоли PDF/Excel",
      qr: "PDF/Excel eksport"
    },
    { ico: PIco.mic,
      uz: "Ovozli boshqaruv (Smart)",
      ru: "Голосовое управление (Smart)",
      en: "Voice input (Smart)",
      kk: "Дауыспен басқару (Smart)",
      ky: "Үн менен башкаруу (Smart)",
      tg: "Идоракунии овозӣ (Smart)",
      qr: "Ovozlı basqarıw (Smart)"
    },
    { ico: PIco.qr,
      uz: "Tushum cheklarini QR skanerlash",
      ru: "QR-сканирование чеков",
      en: "QR receipt scanner",
      kk: "Чектерді QR сканерлеу",
      ky: "Чектерди QR сканерлөө",
      tg: "Сканери QR-и квитанцияҳо",
      qr: "Tu'sum cheklerin QR skanerlew"
    },
    { ico: PIco.ai,
      uz: "Foydali moliyaviy maslahatlar",
      ru: "Полезные финансовые советы",
      en: "Useful financial insights",
      kk: "Пайдалы қаржылық кеңестер",
      ky: "Пайдалуу каржылык кеңештер",
      tg: "Маслиҳатҳои муфиди молиявӣ",
      qr: "Paydalı moliyaviy ma'slahatlar"
    },
  ];

  const FREE_ITEMS = [
    L("free_item_1", "3 ta maqsad", "3 цели", "3 goals", "3 мақсат", "3 максат", "3 ҳадаф", "3 maqset"),
    L("free_item_2", "2 oila a'zosi", "2 члена семьи", "2 members", "2 отбасы мүшесі", "2 үй-бүлө мүчөсү", "2 аъзои оила", "2 shan'araq ag'zası"),
    L("free_item_3", "Asosiy hisobot", "Базовый отчет", "Basic report", "Негізгі есеп", "Негизги отчет", "Ҳисоботи асосӣ", "Asosiy esabat")
  ];
  const PREM_ITEMS = FEATURES.map((f, idx) => L(`premium_feature_${idx}`, f.uz, f.ru, f.en, f.kk, f.ky, f.tg, f.qr));

  const FAQ = [
    {
      q: L("faq_q_1", "Premium nimani beradi?", "Что дает Premium?", "What does Premium include?", "Premium не береді?", "Premium эмнени берет?", "Premium чӣ медиҳад?", "Premium ne beredi?"),
      a: L("faq_a_1", "Cheksiz maqsad va a'zolar, PDF/Excel eksport, ovoz kiritish, QR skaner va foydali tavsiyalar — barcha cheklovlar olib tashlanadi.", "Безлимитные цели и члены семьи, экспорт в PDF/Excel, голосовой ввод, QR-сканер и полезные рекомендации — все ограничения снимаются.", "Unlimited goals & members, PDF/Excel export, voice input, QR scanner and useful insights — all limits removed.", "Шексіз мақсаттар мен мүшелер, PDF/Excel экспорты, дауыспен енгізу, QR сканер және пайдалы ұсыныстар — барлық шектеулер алынып тасталады.", "Чексиз максаттар жана мүчөлөр, PDF/Excel экспорту, үн менен киргизүү, QR сканер жана пайдалуу сунуштар — бардык чектөөлөр алынып салынат.", "Ҳадафҳо ва аъзоёни номаҳдуд, интиқоли PDF/Excel, воридоти овозӣ, сканери QR ва тавсияҳои муфид — ҳамаи маҳдудиятҳо бардошта мешаванд.", "Sheksiz maqset ha'm ag'zalar, PDF/Excel eksport, ovoz kirgiziw, QR skaner ha'm paydalı ma'slahatlar — barlıq sheklewler alıp taslanadı.")
    },
    {
      q: L("faq_q_2", "Butun oilaga ta'sir qiladimi?", "Влияет ли это на всю семью?", "Does it apply to the whole family?", "Бүкіл отбасыға әсер ете ме?", "Бүткүл үй-бүлөгө таасир этеби?", "Оё ин ба тамоми оила дахл дорад?", "Butun shan'araqqa ta'sir qılamadı ma?"),
      a: L("faq_a_2", "Ha. Oila boshlig'i faollashtirsa, Premium obunasi butun oila a'zolariga avtomatik qo'llanadi.", "Да. Если глава семьи активирует, Premium автоматически применяется ко всем членам семьи.", "Yes. When the family head activates, Premium applies to the whole family.", "Иә. Егер отбасы басшысы белсендірсе, Premium жазылымы барлық отбасы мүшелеріне автоматты түрде қолданылады.", "Ооба. Эгер үй-бүлө башчысы активдештирсе, Premium жазылуусу бардык үй-бүлө мүчөлөрүнө автоматтык түрде қолдонулат.", "Бале. Агар сарвари оила фаъол кунад, обунаи Premium ба таври автоматӣ ба тамоми аъзоёни оила татбиқ мешавад.", "Awa. Shan'araq basshısı belsendirse, Premium obunası butun shan'araq ag'zalarına avtomatik qollanıladı.")
    },
    {
      q: L("faq_q_3", "Bekor qilsam ma'lumotlarim yo'qoladimi?", "Пропадут ли мои данные при отмене?", "Do I lose data if I cancel?", "Бас тартсам, деректерім жоғала ма?", "Жокко чыгарсам, маалыматтарым жоголобу?", "Оё ҳангоми бекор кардан маълумоти ман гум мешавад?", "Bekor qilsam mag'luwmatlarım jo'qoladı ma?"),
      a: L("faq_a_3", "Yo'q. Barcha yozuvlaringiz saqlanib qoladi, faqat Premium imkoniyatlar cheklanadi.", "Нет. Все ваши записи сохранятся, только функции Premium станут ограниченными.", "No. All your records stay — only Premium features become limited.", "Жоқ. Барлық жазбаларыңыз сақталады, тек Premium мүмкіндіктері шектеледі.", "Жок. Бардык жазууларыңыз сакталат, болгону Premium мүмкүнчүлүктөрү чектелет.", "Не. Ҳамаи сабтҳои шумо боқӣ мемонанд, танҳо имкониятҳои Premium маҳдуд мешаванд.", "Jo'q. Barlıq jazıwların'ız saqlanıp qaladı, tek Premium imkaniyatlar sheklenedi.")
    }
  ];

  const handleSuccessDone = () => {
    onActivate(); // real premium statusni faollashtiradi
    onClose();
  };

  return (
    <BottomSheet th={th} open onClose={onClose} maxH="95vh">
      {checkoutStep === "tiers" && (
        <div className="ui-fadeUp">
          {/* ═══ 1. HERO — oltin gradient, sokin ═══ */}
          <div style={{ background: PREMIUM.grad, borderRadius: RADIUS.m, padding: SPACE.s6 + "px " + SPACE.s4 + "px", textAlign: "center", marginBottom: SPACE.s4, position: "relative", overflow: "hidden", boxShadow: SHADOW.e1(gold) }}>
            <div style={{ position: "absolute", top: -SPACE.s8, right: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>{PIco.gem("#fff", SPACE.s8)}</div>
              <div style={{ ...TYPE.title, color: "#fff", fontWeight: 800 }}>{isPremium ? L("premium_hero_active", "Premium Faol!", "Премиум активен!", "Premium Active!", "Премиум белсенді!", "Премиум активдүү!", "Премиуми фаъол!", "Premium Faol!") : L("premium_hero_inactive", "Oila Hisobchi Premium", "Семейный Бюджет Премиум", "Family Budget Premium", "Семейный Бюджет Премиум", "Семейный Бюджет Премиум", "Семейный Бюджет Премиум", "Oila Hisobchi Premium")}</div>
              <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.85)", marginTop: SPACE.s1 }}>{isPremium ? L("premium_hero_active_sub", "Barcha premium imkoniyatlaridan foydalanmoqdasiz", "Вы используете все премиум функции", "All features unlocked", "Барлық премиум мүмкіндіктерді пайдаланудасыз", "Бардык премиум функцияларын колдонуп жатасыз", "Шумо тамоми имкониятҳои премиумро истифода мебаред", "Barlıq premium imkaniyatlarınan paydalanbaqtasız") : L("premium_hero_inactive_sub", "Aqlli va barakali moliya boshqaruvi", "Умное и благословенное управление финансами", "Smart and blessed financial control", "Ақылды және берекелі қаржылық басқару", "Акылдуу жана берекелүү каржылык башкаруу", "Идоракунии оқилона ва бобаракати молиявӣ", "Aqıllı ha'm barakalı moliya basqarıwı")}</div>
              <div style={{ marginTop: SPACE.s3, display: "flex", justifyContent: "center" }}>
                {isPremium
                  ? <Badge th={th} type="success" icon={PIco.check(th.gr)} style={{ background: "rgba(255,255,255,0.95)" }}>{L("prem_sub_active", "Obuna faol", "Подписка активна", "Subscription active", "Жазылым белсенді", "Жазылуу активдүү", "Обуна фаъол", "Obuna faol")}</Badge>
                  : <Badge th={th} type="premium" icon={null}>{L("prem_remove_limits", "Cheklovlarni olib tashlang", "Снимите ограничения", "Remove all limits", "Шектеулерді алып тастаңыз", "Чектөөлөрдү алып салыңыз", "Маҳдудиятҳоро бардоред", "Sheklewlerdi alıp taslan'z")}</Badge>}
              </div>
            </div>
          </div>

          {/* ═══ 2. Tiers (Obuna turlari) ═══ */}
          {!isPremium && (
            <div style={{ marginBottom: SPACE.s4 }}>
              <SectionHeader th={th}>{L("prem_choose_plan", "Obuna rejasini tanlang", "Выберите тарифный план", "Choose your plan", "Тарифтік жоспарды таңдаңыз", "Тарифтик планды тандаңыз", "Нақшаи обунаро таҳрир кунед", "Obuna rejasin tan'lan'")}</SectionHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
                {Object.values(TIERS).map((tier) => {
                  const isSelected = activeTier === tier.id;
                  return (
                    <button key={tier.id} className="ui-press" onClick={() => { buzz(10); setActiveTier(tier.id); }} style={{
                      display: "block", width: "100%", textAlign: "left", padding: SPACE.s4,
                      background: isSelected ? gold + "0D" : th.surH,
                      border: isSelected ? "2px solid " + gold : "1px solid " + th.bor,
                      borderRadius: RADIUS.m, cursor: "pointer", position: "relative",
                      transition: "all 0.15s ease", outline: "none", fontFamily: "inherit"
                    }}>
                      {tier.tag && (
                        <div style={{
                          position: "absolute", top: -10, right: 12, background: gold, color: "#fff",
                          ...TYPE.tiny, fontWeight: 800, padding: "2px 8px", borderRadius: RADIUS.pill,
                          fontSize: 9, textTransform: "uppercase"
                        }}>{tier.tag}</div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ ...TYPE.body, fontWeight: 800, color: th.t1 }}>{tier.title}</div>
                          <div style={{ ...TYPE.caption, color: th.t2, fontSize: TYPE.caption.fontSize - 1, marginTop: 2 }}>{tier.sub}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ ...TYPE.title, color: isSelected ? gold : th.t1, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{tier.price}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ 3. Features list ═══ */}
          <SectionHeader th={th}>{L("prem_features", "Premium imkoniyatlar", "Премиум возможности", "Premium features", "Премиум мүмкіндіктер", "Премиум мүмкүнчүлүктөр", "Имкониятҳои премиум", "Premium imkaniyatlar")}</SectionHeader>
          <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s4 }}>
            {FEATURES.map((ft, i) => (
              <ListItem key={i} th={th} divider={i < FEATURES.length - 1}
                icon={ft.ico(gold)} iconTone={gold}
                title={L(`prem_feature_title_${i}`, ft.uz, ft.ru, ft.en, ft.kk, ft.ky, ft.tg, ft.qr)}
                right={isPremium ? PIco.check(th.gr, 16) : <Badge th={th} type="pro" />} />
            ))}
          </AppCard>

          {/* ═══ 4. Taqqoslash: Bepul / Premium ═══ */}
          <SectionHeader th={th}>{L("prem_vs_free", "Bepul vs Premium", "Бесплатно vs Премиум", "Free vs Premium", "Тегін vs Премиум", "Акысыз vs Премиум", "Ройгон vs Премиум", "Bepul vs Premium")}</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3, marginBottom: SPACE.s5 }}>
            <div style={{ background: th.surH, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s4 }}>
              <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t2, marginBottom: SPACE.s3, textAlign: "center", textTransform: "uppercase", fontSize: 10 }}>{L("prem_free_badge", "Bepul", "Бесплатно", "Free", "Тегін", "Акысыз", "Ройгон", "Bepul")}</div>
              {FREE_ITEMS.map((item, ii) => (
                <div key={ii} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, ...TYPE.caption, color: th.t2, fontSize: TYPE.caption.fontSize - 1 }}>
                  <span style={{ display: "flex", flexShrink: 0 }}>{PIco.check(th.t3, 12)}</span>{item}
                </div>
              ))}
            </div>
            <div style={{ background: gold + "0D", border: "1.5px solid " + gold, borderRadius: RADIUS.m, padding: SPACE.s4 }}>
              <div style={{ ...TYPE.caption, fontWeight: 800, color: gold, marginBottom: SPACE.s3, textAlign: "center", textTransform: "uppercase", fontSize: 10 }}>Premium</div>
              {PREM_ITEMS.map((item, ii) => (
                <div key={ii} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, ...TYPE.caption, color: th.t1, fontWeight: 600, fontSize: TYPE.caption.fontSize - 1 }}>
                  <span style={{ display: "flex", flexShrink: 0 }}>{PIco.check(gold, 12)}</span>{item}
                </div>
              ))}
            </div>
          </div>

          {/* ═══ 5. FAQ ═══ */}
          <SectionHeader th={th}>{L("prem_faq", "Ko'p so'raladigan savollar", "Часто задаваемые вопросы", "FAQ", "Жиі қойылатын сұрақтар", "Көп берилүүчү суроолор", "Саволҳои камтарин", "Ko'p soraladıg'an sawollar")}</SectionHeader>
          <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s6 }}>
            {FAQ.map((f, i) => (
              <div key={i} style={{ borderBottom: i < FAQ.length - 1 ? "1px solid " + th.bor : "none" }}>
                <button className="ui-press" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: SPACE.s2, padding: SPACE.s3 + "px " + SPACE.s4 + "px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                  <span style={{ flex: 1, ...TYPE.caption, fontSize: TYPE.caption.fontSize + 1, fontWeight: 700, color: th.t1 }}>{f.q}</span>
                  {PIco.chevD(th.t2, 12, openFaq === i)}
                </button>
                {openFaq === i && (
                  <div className="ui-fadeUp" style={{ padding: "0 " + SPACE.s4 + "px " + SPACE.s3 + "px", ...TYPE.caption, color: th.t2, lineHeight: 1.6 }}>{f.a}</div>
                )}
              </div>
            ))}
          </AppCard>

          {/* ═══ 6. Action Button ═══ */}
          {!isPremium ? (
            Capacitor.isNativePlatform() ? (
              <PremiumButton th={th} onClick={handlePurchaseClick} style={{ marginBottom: SPACE.s2 }}>
                {PIco.gem("#fff", 18)}
                {isLoading 
                  ? L("loading", "Yuklanmoqda...", "Загрузка...", "Loading...", "Жүктелуде...", "Жүктөлүүдө...", "Боргирӣ...", "Ju'klenbekte...") 
                  : L("continue_price", "Davom etish: {{price}}", "Продолжить: {{price}}", "Continue: {{price}}", "Жалғастыру: {{price}}", "Улантуу: {{price}}", "Идома додан: {{price}}", "Davom etis': {{price}}").replace("{{price}}", TIERS[activeTier].price)}
              </PremiumButton>
            ) : (
              <div style={{
                background: th.surH,
                border: "1px dashed " + th.ac,
                borderRadius: RADIUS.m,
                padding: SPACE.s4,
                textAlign: "center",
                marginBottom: SPACE.s4,
                color: th.ac,
                ...TYPE.caption,
                fontSize: TYPE.caption.fontSize + 1,
                lineHeight: 1.5,
                fontWeight: 600
              }}>
                {L("premium_play_store_only", "Premium xarid faqat Android ilovasi (Google Play) orqali mavjud. Iltimos, Oila Hisobchi ilovasini Play Store'dan o'rnating.", "Премиум-покупка доступна только через приложение для Android (Google Play). Пожалуйста, установите приложение Семейный Бюджет из Play Store.", "Premium purchase is only available on the Android app (Google Play). Please install the Family Budget app from the Play Store.", "Премиум сатып алу тек Android қосымшасы (Google Play) арқылы қолжетімді. Семейный Бюджет қосымшасын Play Store-дан орнатыңыз.", "Премиум сатып алуу Android колдонмосу (Google Play) аркылы гана жеткиликтүү. Сураныч, Семейный Бюджет колдонмосун Play Storeдон орнотуңуз.", "Хариди премиум танҳо тавассути барномаи Android (Google Play) дастрас аст. Лутфан, барномаи Семейный Бюджет-ро аз Play Store насб кунед.", "Premium xarid tek Android qosımshası (Google Play) arqalı bar. Iltimos, Oila Hisobchi qosımshasın Play Store'dan ornatın'.")}
              </div>
            )
          ) : (
            <PrimaryButton th={th} onClick={onClose} style={{ marginBottom: SPACE.s4 }}>{L("close", "Yopish", "Закрыть", "Close", "Жабу", "Жабуу", "Пӯшидан", "Jabıw")}</PrimaryButton>
          )}

          {!isPremium && (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <GhostButton th={th} onClick={onClose} style={{ width: "auto", margin: "0 auto", border: "none" }}>{L("later", "Keyinroq", "Позже", "Later", "Кейінірек", "Кийинчерээк", "Дертар", "Keyinirek")}</GhostButton>
              {Capacitor.isNativePlatform() && (
                <GhostButton th={th} onClick={handleRestorePurchases} style={{ width: "auto", margin: "0 auto " + SPACE.s4 + "px", fontSize: 11, border: "none", opacity: 0.7 }}>
                  {L("restore_purchases", "Sotib olinganlarni tiklash (Restore Purchases)", "Восстановить покупки (Restore Purchases)", "Restore Purchases", "Сатып алуларды қалпына келтіру (Restore Purchases)", "Сатып алууларды калыбына келтирүү (Restore Purchases)", "Барқарорсозии харидҳо (Restore Purchases)", "Satıp alıwlardı qalpına keltiriw (Restore Purchases)")}
                </GhostButton>
              )}
            </div>
          )}
        </div>
      )}

      {checkoutStep === "success" && (
        <div className="ui-fadeUp" style={{ textAlign: "center", padding: SPACE.s6 + "px " + SPACE.s4 + "px" }}>
          {/* Animated bounce check */}
          <div className="anim-bounceIn" style={{ width: 80, height: 80, borderRadius: RADIUS.full, background: th.gr + ALPHA.faint, border: "2px solid " + th.gr, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto " + SPACE.s4 + "px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={th.gr} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <div className="anim-scaleIn" style={{ ...TYPE.hero, color: th.t1, fontWeight: 900, marginBottom: SPACE.s2 }}>{L("congratulations", "Tabriklaymiz!", "Поздравляем!", "Congratulations!", "Құттықтаймыз!", "Куттуктайбыз!", "Табрик мекунем!", "Qutlıqlaymız!")}</div>
          <div style={{ ...TYPE.title, color: gold, fontWeight: 800, marginBottom: SPACE.s3 }}>Oila Hisobchi Premium</div>

          <div style={{ ...TYPE.body, color: th.t2, lineHeight: 1.6, maxWidth: 320, margin: "0 auto " + SPACE.s6 + "px" }}>
            {L("purchase_success_desc", "Xaridingiz muvaffaqiyatli amalga oshirildi! Premium obuna ({{plan}}) butun oilangiz uchun faollashtirildi.", "Покупка успешно совершена! Премиум подписка ({{plan}}) активирована для всей вашей семьи.", "Your purchase was successful! Premium subscription ({{plan}}) has been activated for your entire family.", "Сатып алуыңыз сәтті аяқталды! Премиум жазылым ({{plan}}) бүкіл отбасыңыз үшін белсендірілді.", "Сатып алууңуз ийгиликтүү ишке ашты! Премиум жазылуу ({{plan}}) бүткүл үй-бүлөңүз үчүн активдештирилди.", "Хариди шумо бомуваффақият анҷом ёфт! Обунаи премиум ({{plan}}) барои тамоми оилаи шумо фаъол карда шуд.", "Satıp alıwın'ız tabıslı a'melge asırıldı! Premium obuna ({{plan}}) barlıq shan'aran'ız ushın belsendirildi.").replace("{{plan}}", TIERS[activeTier].title)}
          </div>

          <PrimaryButton th={th} onClick={handleSuccessDone} style={{ width: "100%", background: th.gr, borderColor: th.gr, marginBottom: 0 }}>
            {L("start_using_premium", "Ilovani boshlash", "Начать использование", "Start using Premium", "Қосымшаны бастау", "Колдонмону баштоо", "Оғози барнома", "Qosımshanı baslaw")}
          </PrimaryButton>
        </div>
      )}
    </BottomSheet>
  );
}
