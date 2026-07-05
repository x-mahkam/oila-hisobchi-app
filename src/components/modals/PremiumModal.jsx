import { useState } from "react";
import {
  BottomSheet, AppCard, ListItem, Badge, SectionHeader,
  PremiumButton, GhostButton,
} from "../ui/index.js";
import { SPACE, TYPE, RADIUS, ALPHA, PREMIUM, OPACITY } from "../../utils/tokens.js";
import { useApp } from "../../context/AppContext.jsx";

// ── Premium-lokal outline SVG ikonkalar (DS 6-qoida) ──
const PIco = {
  gem: (c, s = 26) => <svg width={s} height={s} viewBox="0 0 18 18" fill="none"><path d="M5 2.5h8L16.5 7 9 15.5 1.5 7 5 2.5z" fill={c} opacity=".2" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M1.5 7h15M6.5 7L9 15.5 11.5 7M5 2.5L6.5 7 9 2.5l2.5 4.5 1.5-4.5" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  target: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.2" opacity=".4"/><circle cx="8" cy="8" r="3.8" stroke={c} strokeWidth="1.2" opacity=".7"/><circle cx="8" cy="8" r="1.4" fill={c}/></svg>,
  family: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2.2" stroke={c} strokeWidth="1.2"/><circle cx="11" cy="5.8" r="1.7" stroke={c} strokeWidth="1.2"/><path d="M1.5 13.5c0-2.4 1.8-4 4-4s4 1.6 4 4M9.5 13.5c.2-1.9 1.3-3 2.8-3 1.4 0 2.4 1 2.7 3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  doc: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 1.5h5.5L13 5v9.5H4V1.5z" fill={c} opacity=".1" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/><path d="M9.5 1.5V5H13M6 8.5h5M6 11h3.5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>,
  mic: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="6" y="1.5" width="4" height="7.5" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.2"/><path d="M3.5 7.5c0 2.6 2 4.5 4.5 4.5s4.5-1.9 4.5-4.5M8 12v2.5M6 14.5h4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  qr: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke={c} strokeWidth="1.2"/><rect x="9" y="2" width="5" height="5" rx="1" stroke={c} strokeWidth="1.2"/><rect x="2" y="9" width="5" height="5" rx="1" stroke={c} strokeWidth="1.2"/><path d="M9 9h2v2H9zM12 12h2v2h-2zM12 9h2M9 12v2" stroke={c} strokeWidth="1.2"/></svg>,
  ai: (c, s = 18) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.2 3.3L12.5 6 9.2 7.2 8 10.5 6.8 7.2 3.5 6l3.3-1.2L8 1.5z" fill={c} opacity=".2" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/><path d="M12.5 10l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6z" fill={c}/></svg>,
  check: (c, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevD: (c, s = 12, open) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "none" }}><path d="M4 6l4 4 4-4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

export default function PremiumModal({ th, STY, lg, onActivate, onClose }) {
  const { isPremium } = useApp(); // faqat status ko'rsatish uchun (logika o'zgarmaydi)
  const [openFaq, setOpenFaq] = useState(null);
  const uz = lg === "uz";
  const gold = PREMIUM.gold;

  // Feature nomlari — eski PremiumModal bilan bir xil (+ AI tavsiyalar, Reports'dagi mavjud PRO funksiya)
  const FEATURES = [
    { ico: PIco.target, uz: "Cheksiz maqsad", en: "Unlimited goals" },
    { ico: PIco.family, uz: "Cheksiz oila a'zosi", en: "Unlimited members" },
    { ico: PIco.doc, uz: "PDF/Excel eksport", en: "PDF/Excel export" },
    { ico: PIco.mic, uz: "Ovoz kiritish", en: "Voice input" },
    { ico: PIco.qr, uz: "QR skaner", en: "QR scanner" },
    { ico: PIco.ai, uz: "AI tavsiyalar", en: "AI insights" },
  ];
  const FREE_ITEMS = uz ? ["3 ta maqsad", "2 oila a'zo", "Asosiy hisobot"] : ["3 goals", "2 members", "Basic report"];
  const PREM_ITEMS = FEATURES.map(f => (uz ? f.uz : f.en));
  const FAQ = [
    { q: uz ? "Premium nimani beradi?" : "What does Premium include?", a: uz ? "Cheksiz maqsad va a'zolar, PDF/Excel eksport, ovoz kiritish, QR skaner va AI tavsiyalar — barcha cheklovlar olib tashlanadi." : "Unlimited goals & members, PDF/Excel export, voice input, QR scanner and AI insights — all limits removed." },
    { q: uz ? "Butun oilaga ta'sir qiladimi?" : "Does it apply to the whole family?", a: uz ? "Ha. Oila boshlig'i faollashtirsa, Premium butun oilaga qo'llanadi." : "Yes. When the family head activates, Premium applies to the whole family." },
    { q: uz ? "Bekor qilsam ma'lumotlarim yo'qoladimi?" : "Do I lose data if I cancel?", a: uz ? "Yo'q. Barcha yozuvlaringiz saqlanib qoladi, faqat Premium imkoniyatlar cheklanadi." : "No. All your records stay — only Premium features become limited." },
  ];

  return (
    <BottomSheet th={th} open onClose={onClose} maxH="92vh">
      {/* ═══ 1. HERO — oltin gradient, sokin ═══ */}
      <div className="ui-fadeUp" style={{ background: PREMIUM.grad, borderRadius: RADIUS.m, padding: SPACE.s6 + "px " + SPACE.s4 + "px", textAlign: "center", marginBottom: SPACE.s4, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -SPACE.s8, right: -SPACE.s8, width: SPACE.s16 * 2, height: SPACE.s16 * 2, borderRadius: RADIUS.full, background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s2 }}>{PIco.gem("#fff", SPACE.s8)}</div>
          <div style={{ ...TYPE.title, color: "#fff" }}>{isPremium ? (uz ? "Premium faol" : "Premium active") : (uz ? "Oila Hisobchi Premium" : "Oila Hisobchi Premium")}</div>
          <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.85)", marginTop: SPACE.s1 }}>{isPremium ? (uz ? "Barcha imkoniyatlar ochiq" : "All features unlocked") : (uz ? "Barcha funksiyalarni oching!" : "Unlock all features!")}</div>
          {/* 2. Premium status */}
          <div style={{ marginTop: SPACE.s3, display: "flex", justifyContent: "center" }}>
            {isPremium
              ? <Badge th={th} type="success" icon={PIco.check(th.gr)} style={{ background: "rgba(255,255,255,0.92)" }}>{uz ? "Obuna faol" : "Subscription active"}</Badge>
              : <Badge th={th} type="premium" icon={null}>{uz ? "Bepul reja" : "Free plan"}</Badge>}
          </div>
        </div>
      </div>

      {/* ═══ 3. Eng katta foydalar ═══ */}
      {!isPremium && (
        <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s2 }}>
          {[
            { ico: PIco.target(gold), l: uz ? "Chek yo'q" : "No limits" },
            { ico: PIco.doc(gold), l: uz ? "Eksport" : "Export" },
            { ico: PIco.ai(gold), l: uz ? "AI kuch" : "AI power" },
          ].map((b, i) => (
            <div key={i} style={{ flex: 1, background: gold + ALPHA.faint, border: "1px solid " + gold + ALPHA.med, borderRadius: RADIUS.s + 3, padding: SPACE.s3 + "px " + SPACE.s1 + "px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: SPACE.s1 }}>{b.ico}</div>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, fontWeight: 700, color: th.t1 }}>{b.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ 4-5. Feature list + PRO badge ═══ */}
      <SectionHeader th={th}>{uz ? "Premium imkoniyatlar" : "Premium features"}</SectionHeader>
      <AppCard th={th} pad={0}>
        {FEATURES.map((ft, i) => (
          <ListItem key={i} th={th} divider={i < FEATURES.length - 1}
            icon={ft.ico(gold)} iconTone={gold}
            title={uz ? ft.uz : ft.en}
            right={isPremium ? PIco.check(th.gr, 16) : <Badge th={th} type="pro" />} />
        ))}
      </AppCard>

      {/* ═══ 6. Taqqoslash: Bepul / Premium ═══ */}
      <SectionHeader th={th}>{uz ? "Taqqoslash" : "Compare"}</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2 + 2, marginBottom: SPACE.s4 }}>
        <div style={{ background: th.surH, border: "1.5px solid " + th.bor, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s3 + "px" }}>
          <div style={{ ...TYPE.caption, fontWeight: 700, color: th.t2, marginBottom: SPACE.s2 + 2, textAlign: "center" }}>{uz ? "Bepul" : "Free"}</div>
          {FREE_ITEMS.map((item, ii) => (
            <div key={ii} style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2, marginBottom: SPACE.s1 + 2, ...TYPE.caption, color: th.t1 }}>
              <span style={{ flexShrink: 0, display: "flex" }}>{PIco.check(th.t3)}</span>{item}
            </div>
          ))}
        </div>
        <div style={{ background: gold + ALPHA.faint, border: "1.5px solid " + gold + ALPHA.strong, borderRadius: RADIUS.m, padding: SPACE.s3 + "px " + SPACE.s3 + "px" }}>
          <div style={{ ...TYPE.caption, fontWeight: 800, color: gold, marginBottom: SPACE.s2 + 2, textAlign: "center" }}>Premium</div>
          {PREM_ITEMS.map((item, ii) => (
            <div key={ii} style={{ display: "flex", alignItems: "center", gap: SPACE.s1 + 2, marginBottom: SPACE.s1 + 2, ...TYPE.caption, color: th.t1 }}>
              <span style={{ flexShrink: 0, display: "flex" }}>{PIco.check(gold)}</span>{item}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 7. Narx ═══ */}
      {!isPremium && (
        <AppCard th={th} style={{ background: gold + ALPHA.faint, border: "1.5px solid " + gold + ALPHA.med, textAlign: "center" }}>
          <div style={{ ...TYPE.tiny, color: th.t2, marginBottom: SPACE.s1 }}>{uz ? "Premium narxi" : "Price"}</div>
          <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>15 000 – 25 000 <span style={{ ...TYPE.caption, color: th.t2, fontWeight: 600 }}>{uz ? "so'm / oy" : "UZS / month"}</span></div>
        </AppCard>
      )}

      {/* ═══ 8. CTA ═══ */}
      {!isPremium && (
        <PremiumButton th={th} onClick={onActivate} style={{ marginBottom: SPACE.s2 }}>
          {PIco.gem("#fff", 18)}{uz ? "Premium faollashtirish (Demo)" : "Activate Premium (Demo)"}
        </PremiumButton>
      )}
      <GhostButton th={th} onClick={onClose} style={{ marginBottom: SPACE.s4 }}>{isPremium ? (uz ? "Yopish" : "Close") : (uz ? "Keyinroq" : "Later")}</GhostButton>

      {/* ═══ 9. FAQ ═══ */}
      <SectionHeader th={th}>{uz ? "Ko'p so'raladigan savollar" : "FAQ"}</SectionHeader>
      <AppCard th={th} pad={0}>
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

      {/* ═══ 10. Restore Purchase — mavjud demo-belgini qayta o'qiydi, yangi to'lov logikasi YO'Q ═══ */}
      {!isPremium && (
        <GhostButton th={th}
          onClick={() => { if (localStorage.getItem("oilaV7Prem") === "1") onActivate(); }}
          style={{ width: "auto", margin: "0 auto", padding: SPACE.s2 + "px " + SPACE.s4 + "px", fontSize: TYPE.caption.fontSize, border: "none", opacity: OPACITY.hint }}>
          {uz ? "Xaridni tiklash" : "Restore purchase"}
        </GhostButton>
      )}
    </BottomSheet>
  );
}
