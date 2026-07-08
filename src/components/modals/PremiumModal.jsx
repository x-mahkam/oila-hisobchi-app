import { useState, useEffect } from "react";
import {
  BottomSheet, AppCard, ListItem, Badge, SectionHeader,
  PremiumButton, GhostButton, PrimaryButton, LoadingButton, TextInput
} from "../ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, PREMIUM, OPACITY, SHADOW, COMP } from "../../utils/tokens.js";
import { useApp } from "../../context/AppContext.jsx";
import { Ico } from "../../utils/icons.jsx";

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
  chevD: (c, s = 12, open) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}><path d="M4 6l4 4 4-4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  card: (c, s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  phone: (c, s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
};

export default function PremiumModal({ th, STY, lg, onActivate, onClose }) {
  const { isPremium, fireConfetti, buzz } = useApp();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTier, setActiveTier] = useState("yearly"); // monthly | yearly | lifetime
  const [checkoutStep, setCheckoutStep] = useState("tiers"); // tiers | checkout | success
  const [payMethod, setPayMethod] = useState("card"); // card | click | payme
  const [isLoading, setIsLoading] = useState(false);

  // To'lov formalari state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardName, setCardName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const uz = lg === "uz";
  const gold = PREMIUM.gold;

  const TIERS = {
    monthly: {
      id: "monthly",
      title: uz ? "Oylik" : "Monthly",
      price: "15 000 UZS",
      sub: uz ? "Har oy to'lanadi" : "Billed monthly",
      tag: null,
      val: 15000,
    },
    yearly: {
      id: "yearly",
      title: uz ? "Yillik obuna" : "Yearly Plan",
      price: "99 000 UZS",
      sub: uz ? "Yiliga bir marta to'lov" : "Billed annually",
      tag: uz ? "Eng ommabop (-45%)" : "Popular (-45%)",
      val: 99000,
    },
    lifetime: {
      id: "lifetime",
      title: uz ? "Umrbod (Lifetime)" : "Lifetime Access",
      price: "199 000 UZS",
      sub: uz ? "Bir martalik to'lov, abadiy!" : "One-time payment, forever!",
      tag: uz ? "Eng yaxshi qiymat" : "Best value",
      val: 199000,
    }
  };

  const FEATURES = [
    { ico: PIco.target, uz: "Cheksiz maqsad", en: "Unlimited goals" },
    { ico: PIco.family, uz: "Cheksiz oila a'zosi", en: "Unlimited members" },
    { ico: PIco.doc, uz: "PDF/Excel eksport", en: "PDF/Excel export" },
    { ico: PIco.mic, uz: "Ovozli boshqaruv (AI)", en: "Voice input (AI)" },
    { ico: PIco.qr, uz: "Tushum cheklarini QR skanerlash", en: "QR receipt scanner" },
    { ico: PIco.ai, uz: "AI aqlli moliyaviy maslahatlar", en: "AI smart insights" },
  ];

  const FREE_ITEMS = uz ? ["3 ta maqsad", "2 oila a'zosi", "Asosiy hisobot"] : ["3 goals", "2 members", "Basic report"];
  const PREM_ITEMS = FEATURES.map(f => (uz ? f.uz : f.en));

  const FAQ = [
    { q: uz ? "Premium nimani beradi?" : "What does Premium include?", a: uz ? "Cheksiz maqsad va a'zolar, PDF/Excel eksport, ovoz kiritish, QR skaner va AI tavsiyalar — barcha cheklovlar olib tashlanadi." : "Unlimited goals & members, PDF/Excel export, voice input, QR scanner and AI insights — all limits removed." },
    { q: uz ? "Butun oilaga ta'sir qiladimi?" : "Does it apply to the whole family?", a: uz ? "Ha. Oila boshlig'i faollashtirsa, Premium obunasi butun oila a'zolariga avtomatik qo'llanadi." : "Yes. When the family head activates, Premium applies to the whole family." },
    { q: uz ? "Bekor qilsam ma'lumotlarim yo'qoladimi?" : "Do I lose data if I cancel?", a: uz ? "Yo'q. Barcha yozuvlaringiz saqlanib qoladi, faqat Premium imkoniyatlar cheklanadi." : "No. All your records stay — only Premium features become limited." },
  ];

  // Karta raqamini formatlash (8600 0000 ...)
  const handleCardChange = (val) => {
    const clean = val.replace(/\D/g, "");
    let formatted = "";
    for (let i = 0; i < clean.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) formatted += " ";
      formatted += clean[i];
    }
    setCardNumber(formatted);
  };

  // Amal muddati formatlash (MM/YY)
  const handleExpiryChange = (val) => {
    const clean = val.replace(/\D/g, "");
    let formatted = "";
    if (clean.length > 0) {
      formatted += clean.substring(0, 2);
      if (clean.length > 2) {
        formatted += "/" + clean.substring(2, 4);
      }
    }
    setCardExpiry(formatted);
  };

  // Telefon raqamini formatlash
  const handlePhoneChange = (val) => {
    const clean = val.replace(/\D/g, "");
    setPhoneNumber(clean);
  };

  // Karta provayderini aniqlash (Uzcard, Humo, Visa)
  const getCardType = (num) => {
    const clean = num.replace(/\s/g, "");
    if (clean.startsWith("8600")) return "Uzcard";
    if (clean.startsWith("9860")) return "Humo";
    if (clean.startsWith("4") || clean.startsWith("5")) return "Visa/Mastercard";
    return null;
  };

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (payMethod === "card" && cardNumber.replace(/\s/g, "").length < 16) return;
    if ((payMethod === "click" || payMethod === "payme") && phoneNumber.length < 9) return;

    buzz(15);
    setIsLoading(true);

    // To'lovni simulyatsiya qilish (1.5 soniya)
    setTimeout(() => {
      setIsLoading(false);
      setCheckoutStep("success");
      if (typeof fireConfetti === "function") {
        fireConfetti();
      }
    }, 1500);
  };

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
              <div style={{ ...TYPE.title, color: "#fff", fontWeight: 800 }}>{isPremium ? (uz ? "Premium Faol!" : "Premium Active!") : (uz ? "Oila Hisobchi Premium" : "Oila Hisobchi Premium")}</div>
              <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.85)", marginTop: SPACE.s1 }}>{isPremium ? (uz ? "Barcha premium imkoniyatlaridan foydalanmoqdasiz" : "All features unlocked") : (uz ? "Aqlli va barakali moliya boshqaruvi" : "Smart and blessed financial control")}</div>
              <div style={{ marginTop: SPACE.s3, display: "flex", justifyContent: "center" }}>
                {isPremium
                  ? <Badge th={th} type="success" icon={PIco.check(th.gr)} style={{ background: "rgba(255,255,255,0.95)" }}>{uz ? "Obuna faol" : "Subscription active"}</Badge>
                  : <Badge th={th} type="premium" icon={null}>{uz ? "Cheklovlarni olib tashlang" : "Remove all limits"}</Badge>}
              </div>
            </div>
          </div>

          {/* ═══ 2. Tiers (Obuna turlari) ═══ */}
          {!isPremium && (
            <div style={{ marginBottom: SPACE.s4 }}>
              <SectionHeader th={th}>{uz ? "Obuna rejasini tanlang" : "Choose your plan"}</SectionHeader>
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
          <SectionHeader th={th}>{uz ? "Premium imkoniyatlar" : "Premium features"}</SectionHeader>
          <AppCard th={th} pad={0} style={{ marginBottom: SPACE.s4 }}>
            {FEATURES.map((ft, i) => (
              <ListItem key={i} th={th} divider={i < FEATURES.length - 1}
                icon={ft.ico(gold)} iconTone={gold}
                title={uz ? ft.uz : ft.en}
                right={isPremium ? PIco.check(th.gr, 16) : <Badge th={th} type="pro" />} />
            ))}
          </AppCard>

          {/* ═══ 4. Taqqoslash: Bepul / Premium ═══ */}
          <SectionHeader th={th}>{uz ? "Bepul vs Premium" : "Free vs Premium"}</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3, marginBottom: SPACE.s5 }}>
            <div style={{ background: th.surH, border: "1px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s4 }}>
              <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t2, marginBottom: SPACE.s3, textAlign: "center", textTransform: "uppercase", fontSize: 10 }}>{uz ? "Bepul" : "Free"}</div>
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
          <SectionHeader th={th}>{uz ? "Ko'p so'raladigan savollar" : "FAQ"}</SectionHeader>
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
            <PremiumButton th={th} onClick={() => { buzz(10); setCheckoutStep("checkout"); }} style={{ marginBottom: SPACE.s2 }}>
              {PIco.gem("#fff", 18)}{uz ? `Davom etish: ${TIERS[activeTier].price}` : `Continue: ${TIERS[activeTier].price}`}
            </PremiumButton>
          ) : (
            <PrimaryButton th={th} onClick={onClose} style={{ marginBottom: SPACE.s4 }}>{uz ? "Yopish" : "Close"}</PrimaryButton>
          )}

          {!isPremium && (
            <div style={{ textAlign: "center" }}>
              <GhostButton th={th} onClick={onClose} style={{ width: "auto", margin: "0 auto " + SPACE.s4 + "px", border: "none" }}>{uz ? "Keyinroq" : "Later"}</GhostButton>
            </div>
          )}
        </div>
      )}

      {checkoutStep === "checkout" && (
        <div className="ui-fadeUp" style={{ paddingBottom: SPACE.s4 }}>
          {/* Sarlavha */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.s4 }}>
            <button className="ui-press" onClick={() => setCheckoutStep("tiers")} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={th.t1} strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <div style={{ ...TYPE.heading, color: th.t1, textAlign: "center" }}>{uz ? "Xavfsiz To'lov" : "Secure Payment"}</div>
            <div style={{ width: 24 }} />
          </div>

          {/* Tanlangan Reja Xulosasi */}
          <AppCard th={th} style={{ background: gold + "0D", border: "1.5px solid " + gold, marginBottom: SPACE.s4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ ...TYPE.body, fontWeight: 800, color: th.t1 }}>{TIERS[activeTier].title}</div>
                <div style={{ ...TYPE.caption, color: th.t2, fontSize: TYPE.caption.fontSize - 1 }}>{TIERS[activeTier].sub}</div>
              </div>
              <div style={{ ...TYPE.heading, color: gold, fontWeight: 900 }}>{TIERS[activeTier].price}</div>
            </div>
          </AppCard>

          {/* To'lov usuli tanlagich */}
          <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
            {[
              { id: "card", label: uz ? "Karta orqali" : "By Card", icon: PIco.card },
              { id: "click", label: "Click", icon: PIco.phone },
              { id: "payme", label: "Payme", icon: PIco.phone },
            ].map(m => {
              const isSel = payMethod === m.id;
              return (
                <button key={m.id} className="ui-press" onClick={() => { buzz(8); setPayMethod(m.id); }} style={{
                  flex: 1, padding: SPACE.s3 + "px " + SPACE.s2 + "px",
                  background: isSel ? th.ac + "15" : th.surH,
                  border: isSel ? "1.5px solid " + th.ac : "1px solid " + th.bor,
                  borderRadius: RADIUS.m, cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 6, transition: "all 0.15s ease", fontFamily: "inherit"
                }}>
                  {m.icon(isSel ? th.ac : th.t2, 20)}
                  <span style={{ ...TYPE.caption, fontSize: TYPE.caption.fontSize - 1, fontWeight: isSel ? 700 : 500, color: isSel ? th.ac : th.t1 }}>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handlePaySubmit}>
            {payMethod === "card" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3, marginBottom: SPACE.s4 }}>
                <div>
                  <label style={{ ...TYPE.caption, color: th.t2, display: "block", marginBottom: 6, fontWeight: 600 }}>{uz ? "Karta raqami" : "Card number"}</label>
                  <div style={{ position: "relative" }}>
                    <TextInput th={th} placeholder="8600 0000 0000 0000" value={cardNumber} onChange={handleCardChange} required style={{ letterSpacing: 1.5, fontFamily: "monospace", fontSize: 16 }} />
                    {getCardType(cardNumber) && (
                      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                        <Badge th={th} type="pro" style={{ background: th.ac, color: "#fff", fontWeight: 700 }}>{getCardType(cardNumber)}</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3 }}>
                  <div>
                    <label style={{ ...TYPE.caption, color: th.t2, display: "block", marginBottom: 6, fontWeight: 600 }}>{uz ? "Amal qilish muddati" : "Expiry date"}</label>
                    <TextInput th={th} placeholder="MM/YY" value={cardExpiry} onChange={handleExpiryChange} maxLength={5} required style={{ textAlign: "center", fontFamily: "monospace", fontSize: 16 }} />
                  </div>
                  <div>
                    <label style={{ ...TYPE.caption, color: th.t2, display: "block", marginBottom: 6, fontWeight: 600 }}>{uz ? "Karta egasi ismi" : "Cardholder name"}</label>
                    <TextInput th={th} placeholder="ISM SHARIF" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} required style={{ textTransform: "uppercase" }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s3, marginBottom: SPACE.s4 }}>
                <div>
                  <label style={{ ...TYPE.caption, color: th.t2, display: "block", marginBottom: 6, fontWeight: 600 }}>{uz ? "Telefon raqamingiz" : "Phone number"}</label>
                  <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                    <div style={{ position: "absolute", left: 12, ...TYPE.body, fontWeight: 700, color: th.t1 }}>+998</div>
                    <TextInput th={th} placeholder="90 123 45 67" value={phoneNumber} onChange={(e) => handlePhoneChange(e.target.value)} required style={{ paddingLeft: 56, letterSpacing: 1, fontWeight: "bold" }} />
                  </div>
                  <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginTop: 6 }}>{uz ? "To'lovni tasdiqlash uchun telefoningizga SMS-kod yuboriladi." : "An SMS-code will be sent to confirm payment."}</div>
                </div>
              </div>
            )}

            {/* To'lash tugmasi */}
            <LoadingButton th={th} loading={isLoading} type="submit" style={{ background: gold, borderColor: gold, color: "#fff", width: "100%", marginBottom: SPACE.s3 }}>
              {uz ? "To'lovni amalga oshirish" : "Pay now"}
            </LoadingButton>

            <GhostButton th={th} onClick={() => setCheckoutStep("tiers")} style={{ width: "100%" }}>{uz ? "Bekor qilish" : "Cancel"}</GhostButton>
          </form>
        </div>
      )}

      {checkoutStep === "success" && (
        <div className="ui-fadeUp" style={{ textAlign: "center", padding: SPACE.s6 + "px " + SPACE.s4 + "px", pb: SPACE.s10 }}>
          {/* Animated bounce check */}
          <div className="anim-bounceIn" style={{ width: 80, height: 80, borderRadius: RADIUS.full, background: th.gr + ALPHA.faint, border: "2px solid " + th.gr, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto " + SPACE.s4 + "px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={th.gr} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <div className="anim-scaleIn" style={{ ...TYPE.hero, color: th.t1, fontWeight: 900, marginBottom: SPACE.s2 }}>{uz ? "Tabriklaymiz!" : "Congratulations!"}</div>
          <div style={{ ...TYPE.title, color: gold, fontWeight: 800, marginBottom: SPACE.s3 }}>Oila Hisobchi Premium</div>

          <div style={{ ...TYPE.body, color: th.t2, lineHeight: 1.6, maxWidth: 320, margin: "0 auto " + SPACE.s6 + "px" }}>
            {uz
              ? `Xaridingiz muvaffaqiyatli amalga oshirildi! Premium obuna (${TIERS[activeTier].title}) butun oilangiz uchun faollashtirildi.`
              : `Your purchase was successful! Premium subscription (${TIERS[activeTier].title}) has been activated for your entire family.`}
          </div>

          <PrimaryButton th={th} onClick={handleSuccessDone} style={{ width: "100%", background: th.gr, borderColor: th.gr, marginBottom: 0 }}>
            {uz ? "Ilovani boshlash" : "Start using Premium"}
          </PrimaryButton>
        </div>
      )}
    </BottomSheet>
  );
}
