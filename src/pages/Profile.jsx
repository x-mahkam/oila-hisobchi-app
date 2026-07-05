import { useMemo, memo } from "react";
import { KatIco, Av, MoneyInput, BH } from "../components/common/index.jsx";
import { Ico } from "../utils/icons.jsx";
import { makeS } from "../utils/styles.js";
import { KATS, KN, VALS, RELATIONS, FAQS } from "../utils/constants.js";
import Garden from "../Garden.jsx";

// ═══ Profile-lokal professional SVG ikonkalar (emoji o'rniga) ═══
const PIco = {
  leaf: c => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15 3C8 3 3.5 6.5 3.5 12c0 1 .2 2 .5 3 5.5 0 11-3 11-12z" fill={c} opacity=".15" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M4 15C6.5 11 9.5 8.5 13 6.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  book: c => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 4.5C7.5 3 5.5 2.5 2.5 2.5v11c3 0 5 .5 6.5 2 1.5-1.5 3.5-2 6.5-2v-11c-3 0-5 .5-6.5 2z" fill={c} opacity=".12" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 4.5v11" stroke={c} strokeWidth="1.2"/></svg>,
  baby: c => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke={c} strokeWidth="1.3" fill={c} opacity=".08"/><circle cx="9" cy="9" r="6.5" stroke={c} strokeWidth="1.3" fill="none"/><circle cx="6.8" cy="8" r=".9" fill={c}/><circle cx="11.2" cy="8" r=".9" fill={c}/><path d="M6.5 11.2c.7.8 1.5 1.2 2.5 1.2s1.8-.4 2.5-1.2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M9 2.5c.8-.8 2-.8 2 .3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  gift: c => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2.5" y="7" width="13" height="8.5" rx="1.5" fill={c} opacity=".12" stroke={c} strokeWidth="1.3"/><path d="M2 5h14v2.5H2z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 5v10.5M9 5C9 3 7.5 2 6.5 2.5 5.5 3 6 5 9 5zm0 0c0-2 1.5-3 2.5-2.5 1 .5.5 2.5-2.5 2.5z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  star: c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.9 4.1 4.5.5-3.3 3.1.9 4.4L8 11.4l-4 2.2.9-4.4L1.6 6.1l4.5-.5L8 1.5z" fill={c} opacity=".2" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  gem: c => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 2.5h8L16.5 7 9 15.5 1.5 7 5 2.5z" fill={c} opacity=".15" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M1.5 7h15M6.5 7L9 15.5 11.5 7M5 2.5L6.5 7 9 2.5l2.5 4.5 1.5-4.5" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  cal: c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  list: c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2" width="11" height="12" rx="2" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  target: c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.2" opacity=".4"/><circle cx="8" cy="8" r="3.8" stroke={c} strokeWidth="1.2" opacity=".7"/><circle cx="8" cy="8" r="1.4" fill={c}/></svg>,
  hand: c => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4" width="13" height="9" rx="1.8" fill={c} opacity=".12" stroke={c} strokeWidth="1.2"/><path d="M1.5 7h13" stroke={c} strokeWidth="1.1"/><circle cx="11.5" cy="10" r="1.1" fill={c} opacity=".8"/></svg>,
};

// ═══ Kichik, qayta ishlatiladigan qismlar (module-level → har renderda qayta yaratilmaydi) ═══
const SectionLabel = memo(({ th, children }) => (
  <div style={{ fontSize: 11, color: th.t2, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, margin: "18px 0 8px", paddingLeft: 4 }}>{children}</div>
));

const SettingRow = memo(({ th, ico, label, sub, right, onClick, first, last, danger }) => (
  <button onClick={onClick} className={onClick ? "pf-press" : undefined} style={{ width: "100%", background: "transparent", border: "none", borderBottom: last ? "none" : "1px solid " + th.bor, padding: "13px 16px", cursor: onClick ? "pointer" : "default", display: "flex", alignItems: "center", gap: 12, textAlign: "left", borderRadius: first && last ? 16 : first ? "16px 16px 0 0" : last ? "0 0 16px 16px" : 0 }}>
    <div style={{ width: 36, height: 36, borderRadius: 11, background: (danger ? th.rd : th.ac) + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ico}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: danger ? th.rd : th.t1 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: th.t2, marginTop: 1 }}>{sub}</div>}
    </div>
    {right !== undefined ? right : (onClick && Ico.right(th.t2))}
  </button>
));

const StatCell = memo(({ th, ico, value, label }) => (
  <div style={{ flex: 1, background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, padding: "12px 6px", textAlign: "center", minWidth: 0 }}>
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{ico}</div>
    <div style={{ fontSize: 17, fontWeight: 800, color: th.t1, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 9.5, color: th.t2, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: .4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
  </div>
));

const ProBadge = ({ th }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "linear-gradient(135deg,#f59e0b,#f97316)", borderRadius: 6, padding: "2px 6px", fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: .5, flexShrink: 0 }}>{PIco.star("#fff")}PRO</span>
);

export default function ProfilePage({
  user, oila, azolar, xar, qarzlar, maq,
  isPremium, isKid, isAdmin,
  th, t, f, lg, dark, val, setVal, setLg, setDark,
  bX, bD,
  ok$, buzz, addStar,
  pTab, setPTab,
  edN, setEdN, newN, setNewN, updName,
  edT, setEdT, newT, setNewT, saveTel,
  fBj, setFBj, fKL, setFKL, saveBj,
  faqO, setFaqO,
  pinStep, setPinStep, pinVal, setPinVal, pinCfm, setPinCfm,
  finger, setFinger,
  showAddKid, setShowAddKid, kidName, setKidName, kidLogin, setKidLogin, kidPw, setKidPw, addKidAccount,
  showReferral, setShowReferral, refCount,
  fbRating, setFbRating, fbText, setFbText, fbType, setFbType, fbSending, sendFeedback,
  adminStats, adminLoad, loadAdminStats,
  waterGarden, gardenData, stars,
  activatePremium, setShowPremModal,
  logout,
  fRef, doPhoto, rmPhoto,
  toggleReportAccess,
  notifEnabled, toggleNotif, notifTime, saveNotifTime,
  APP_VER,
  showValDD, setShowValDD,
  showBilim, setShowBilim,
}) {
  const STY = useMemo(() => makeS(th), [th]);

  // ═══ Statistika — faqat mavjud ma'lumotlardan, og'ir hisob memoizatsiya qilingan ═══
  const pStats = useMemo(() => {
    const myXar = (xar || []).filter(x => x.uid === user?.id);
    // Foydalanish kunlari: registeredAt (Google) yoki eng birinchi o'z yozuvi sanasi
    let firstTs = user?.registeredAt ? Date.parse(user.registeredAt) : NaN;
    for (const x of myXar) {
      const ts = Date.parse(x.sana);
      if (!isNaN(ts) && (isNaN(firstTs) || ts < firstTs)) firstTs = ts;
    }
    const days = isNaN(firstTs) ? 1 : Math.max(1, Math.floor((Date.now() - firstTs) / 86400000) + 1);
    return {
      days,
      txCount: myXar.length,
      goalCount: (maq || []).filter(m => m.uid === user?.id || m.shared).length,
      debtCount: (qarzlar || []).filter(q => !q.done).length,
      gardenLevel: gardenData?.level || 0,
    };
  }, [xar, maq, qarzlar, gardenData, user?.id, user?.registeredAt]);

  return (
    <div>
      {pTab === "main" && (
        <div>
          <style>{`.pf-press{transition:transform .12s ease,opacity .12s ease}.pf-press:active{transform:scale(.98);opacity:.85}`}</style>

          {/* ═══ 1. HERO ═══ */}
          <div style={{ fontSize: 20, fontWeight: 800, color: th.t1, marginBottom: 16 }}>{t.prf}</div>
          <div className="anim-fadeUp" style={{ background: "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", borderRadius: 20, padding: "22px 18px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -50, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ padding: isPremium ? 2.5 : 0, borderRadius: "50%", background: isPremium ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "transparent" }}>
                  <Av src={user?.photo} name={user?.ism} size={64} ac="#fff" />
                </div>
                <button onClick={() => fRef.current?.click()} className="pf-press" style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.2)" }}>{Ico.camera(th.ac)}</button>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.ism}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#fff", fontWeight: 600 }}>
                    {user?.rol === "bosh" ? Ico.crown("#fff") : Ico.user("#fff")}
                    {user?.rol === "bosh" ? (lg === "uz" ? "Oila boshlig'i" : "Family head") : (lg === "uz" ? "A'zo" : "Member")}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: isPremium ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "rgba(255,255,255,0.18)", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#fff", fontWeight: 700 }}>
                    {PIco.gem("#fff")}{isPremium ? "Premium" : (lg === "uz" ? "Bepul" : "Free")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ 2. STATISTIKA (faqat mavjud ma'lumotlar) ═══ */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <StatCell th={th} ico={PIco.cal(th.ac)} value={pStats.days} label={lg === "uz" ? "Kun" : "Days"} />
            <StatCell th={th} ico={PIco.list(th.ac)} value={pStats.txCount} label={lg === "uz" ? "Yozuv" : "Records"} />
            <StatCell th={th} ico={PIco.target(th.gr)} value={pStats.goalCount} label={lg === "uz" ? "Maqsad" : "Goals"} />
            <StatCell th={th} ico={PIco.hand(th.am)} value={pStats.debtCount} label={lg === "uz" ? "Qarz" : "Debts"} />
          </div>

          {/* ═══ 3. YUTUQLAR (faqat tizimda real hisoblanadigan: yulduzcha, bog' darajasi, takliflar) ═══ */}
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: th.t2, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 12 }}>{lg === "uz" ? "Yutuqlar" : "Achievements"}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { ico: PIco.star("#f59e0b"), v: stars || 0, l: lg === "uz" ? "Yulduzcha" : "Stars", c: "#f59e0b", onClick: null },
                { ico: PIco.leaf(th.gr), v: pStats.gardenLevel, l: lg === "uz" ? "Bog' darajasi" : "Garden lvl", c: th.gr, onClick: () => setPTab("garden") },
                { ico: PIco.gift(th.ac), v: refCount || 0, l: lg === "uz" ? "Taklif" : "Invites", c: th.ac, onClick: !isKid ? () => setShowReferral(true) : null },
              ].map((a, i) => (
                <button key={i} onClick={a.onClick || undefined} className={a.onClick ? "pf-press" : undefined} style={{ flex: 1, background: a.c + "0d", border: "1px solid " + a.c + "26", borderRadius: 13, padding: "11px 4px", textAlign: "center", cursor: a.onClick ? "pointer" : "default" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>{a.ico}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: a.c, lineHeight: 1 }}>{a.v}</div>
                  <div style={{ fontSize: 9.5, color: th.t2, marginTop: 4, fontWeight: 600 }}>{a.l}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ═══ 4. PREMIUM CARD ═══ */}
          <button onClick={() => { buzz(10); setShowPremModal(true); }} className="pf-press" style={{ width: "100%", background: isPremium ? "linear-gradient(135deg,#f59e0b14,#f9731608)" : "linear-gradient(135deg," + th.ac + "12," + th.ac2 + "08)", border: "1.5px solid " + (isPremium ? "#f59e0b44" : th.ac + "33"), borderRadius: 16, padding: "16px", marginBottom: 12, cursor: "pointer", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isPremium ? 0 : 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: isPremium ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{PIco.gem("#fff")}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: isPremium ? "#f59e0b" : th.ac }}>{isPremium ? (lg === "uz" ? "Premium faol" : "Premium active") : (lg === "uz" ? "Premium'ga o'ting" : "Upgrade to Premium")}</div>
                <div style={{ fontSize: 11, color: th.t2, marginTop: 2 }}>{isPremium ? (lg === "uz" ? "Barcha funksiyalar ochiq" : "All features unlocked") : (lg === "uz" ? "Barcha imkoniyatlarni oching" : "Unlock everything")}</div>
              </div>
              {isPremium ? <span style={{ color: "#f59e0b" }}>{Ico.check("#f59e0b")}</span> : <div style={{ background: th.ac, borderRadius: 10, padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{lg === "uz" ? "Ochish" : "Unlock"}</div>}
            </div>
            {!isPremium && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  lg === "uz" ? "Cheksiz maqsad" : "Unlimited goals",
                  lg === "uz" ? "PDF/Excel eksport" : "PDF/Excel export",
                  lg === "uz" ? "Cheksiz a'zo" : "Unlimited members",
                  lg === "uz" ? "Ovoz kiritish" : "Voice input",
                ].map(feat => (
                  <div key={feat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, background: th.sur, border: "1px solid " + th.bor, borderRadius: 10, padding: "8px 10px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{feat}</span>
                    <ProBadge th={th} />
                  </div>
                ))}
              </div>
            )}
          </button>

          {/* ═══ 5. REFERRAL (Premium'dan keyin, Hero bilan raqobatlashmaydigan neytral uslub) ═══ */}
          {!isKid && (
            <button onClick={() => setShowReferral(true)} className="pf-press" style={{ width: "100%", background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 4, textAlign: "left" }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: th.gr + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{PIco.gift(th.gr)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Do'stlarni taklif qiling" : "Invite friends"}</div>
                <div style={{ fontSize: 11, color: th.t2, marginTop: 1 }}>{lg === "uz" ? "3 ta do'st = 1 oy Premium bepul" : "3 friends = 1 month free Premium"}</div>
              </div>
              {Ico.right(th.t2)}
            </button>
          )}

          {/* ═══ 6. SOZLAMALAR — kategoriyalarga ajratilgan ═══ */}
          <SectionLabel th={th}>{lg === "uz" ? "Hisob" : "Account"}</SectionLabel>
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, overflow: "hidden" }}>
            <SettingRow th={th} first last={user?.rol !== "bosh" && isKid} ico={Ico.user(th.ac)} label={t.shaxsiy} sub={lg === "uz" ? "Ism, telefon, oila a'zolari" : "Name, phone, family"} onClick={() => setPTab("shaxsiy")} />
            {user?.rol === "bosh" && <SettingRow th={th} last={isKid} ico={Ico.wallet(th.ac)} label={lg === "uz" ? "Budjet va limitlar" : "Budget & limits"} sub={lg === "uz" ? "Oylik chegara, kategoriya limitlari" : "Monthly cap, category limits"} onClick={() => setPTab("budjet")} />}
            {!isKid && <SettingRow th={th} last ico={PIco.baby(th.ac)} label={lg === "uz" ? "Bola akkaunti qo'shish" : "Add kid account"} sub={lg === "uz" ? "Farzandingizga login yarating" : "Create a login for your child"} onClick={() => { buzz(10); setShowAddKid(true); }} />}
          </div>

          <SectionLabel th={th}>{lg === "uz" ? "Xavfsizlik" : "Security"}</SectionLabel>
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, overflow: "hidden" }}>
            <SettingRow th={th} first last ico={Ico.shield(th.ac)} label={t.xav} sub={lg === "uz" ? "PIN, biometrika" : "PIN, biometrics"} onClick={() => setPTab("xav")} />
          </div>

          <SectionLabel th={th}>{lg === "uz" ? "Ilova" : "App"}</SectionLabel>
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, overflow: "hidden" }}>
            <SettingRow th={th} first ico={Ico.settings(th.ac)} label={t.ilovaS} sub={lg === "uz" ? "Til, valyuta, mavzu, bildirishnoma" : "Language, currency, theme"} onClick={() => setPTab("ilovaS")} />
            <SettingRow th={th} ico={PIco.leaf(th.gr)} label={lg === "uz" ? "Oila bog'i" : "Family Garden"} sub={lg === "uz" ? "Yulduzcha bilan bog'ni o'stiring" : "Grow your garden with stars"} onClick={() => setPTab("garden")} />
            <SettingRow th={th} last ico={PIco.book(th.ac)} label={lg === "uz" ? "Bilim Bozori" : "Knowledge Market"} sub={lg === "uz" ? "Moliyaviy savodxonlik" : "Financial literacy"} onClick={() => { buzz(10); setShowBilim(true); }} />
          </div>

          <SectionLabel th={th}>{lg === "uz" ? "Ma'lumot" : "About"}</SectionLabel>
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, overflow: "hidden" }}>
            <SettingRow th={th} first ico={Ico.help(th.ac)} label={t.qol} sub={lg === "uz" ? "FAQ, Telegram bot, fikr bildirish" : "FAQ, Telegram, feedback"} onClick={() => setPTab("qol")} />
            <SettingRow th={th} last ico={Ico.version(th.ac)} label={t.ver} right={<span style={{ fontSize: 13, color: th.t2, fontWeight: 600 }}>v{APP_VER}</span>} />
          </div>

          {/* ═══ 7. LOGOUT — eng pastda, xavfsiz joyda ═══ */}
          <button onClick={logout} className="pf-press" style={{ width: "100%", background: th.rd + "0d", border: "1px solid " + th.rd + "33", borderRadius: 16, padding: "14px", marginTop: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: th.rd, fontWeight: 700, fontSize: 14 }}>
            {Ico.door(th.rd)}{t.lo}
          </button>
          <div style={{ textAlign: "center", fontSize: 10, color: th.t2, marginTop: 12, marginBottom: 4, opacity: .7 }}>Oila Hisobchi · v{APP_VER}</div>
        </div>
      )}

      {pTab === "shaxsiy" && (
        <div>
          <BH label={t.shaxsiy} th={th} onBack={() => setPTab("main")} />
          <div style={{ ...STY.cd, textAlign: "center", padding: "22px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div style={{ position: "relative", padding: 4, borderRadius: "50%", background: isPremium ? "linear-gradient(135deg,#f59e0b,#ec4899,#6366f1)" : "linear-gradient(135deg," + th.ac + "," + th.ac2 + ")" }}>
                <div style={{ padding: 3, borderRadius: "50%", background: th.sur }}>
                  <Av src={user?.photo} name={user?.ism} size={78} ac={th.ac} />
                </div>
                <button onClick={() => fRef.current?.click()} style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: th.ac, border: "2px solid " + th.sur, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ico.camera("#fff")}</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => fRef.current?.click()} style={{ background: th.ac + "18", border: "1px solid " + th.ac + "44", borderRadius: 10, padding: "7px 14px", color: th.ac, cursor: "pointer", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>{Ico.camera(th.ac)}{t.up}</button>
              {user?.photo && <button onClick={rmPhoto} style={{ background: th.rd + "18", border: "1px solid " + th.rd + "44", borderRadius: 10, padding: "7px 14px", color: th.rd, cursor: "pointer", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>{Ico.trash(th.rd)}{t.rp}</button>}
            </div>
          </div>
          <div style={STY.cd}>
            <div style={{ ...STY.row, marginBottom: edN ? 12 : 0 }}>
              <div><div style={{ fontSize: 10, color: th.t2, marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>{lg === "uz" ? "Ism" : "Name"}</div><div style={{ fontSize: 15, fontWeight: 600, color: th.t1 }}>{user?.ism}</div></div>
              <button onClick={() => { setEdN(v => !v); setNewN(user?.ism || ""); }} style={{ background: th.ac + "18", border: "1px solid " + th.ac + "44", borderRadius: 9, padding: "6px 12px", color: th.ac, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{Ico.edit(th.ac)}{edN ? t.cn : t.ep}</button>
            </div>
            {edN && <div><div style={{ height: 10 }} /><input style={STY.ip} value={newN} onChange={e => setNewN(e.target.value)} placeholder="Ism" autoFocus /><button onClick={updName} style={STY.bt()}>{t.un}</button></div>}
          </div>
          <div style={STY.cd}><div style={{ fontSize: 10, color: th.t2, marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>Email</div><div style={{ fontSize: 15, fontWeight: 600, color: th.t1 }}>{user?.email}</div></div>
          <div style={STY.cd}>
            <div style={{ ...STY.row, marginBottom: edT ? 12 : 0 }}>
              <div><div style={{ fontSize: 10, color: th.t2, marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>{lg === "uz" ? "Telefon" : "Phone"}</div><div style={{ fontSize: 15, fontWeight: 600, color: user?.tel ? th.t1 : th.t2 }}>{user?.tel || (lg === "uz" ? "Kiritilmagan" : "Not set")}</div></div>
              <button onClick={() => { setEdT(v => !v); setNewT(user?.tel || ""); }} style={{ background: th.ac + "18", border: "1px solid " + th.ac + "44", borderRadius: 9, padding: "6px 12px", color: th.ac, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{Ico.edit(th.ac)}{edT ? t.cn : (user?.tel ? t.ep : (lg === "uz" ? "Qo'shish" : "Add"))}</button>
            </div>
            {edT && <div><div style={{ height: 10 }} /><input style={STY.ip} value={newT} onChange={e => setNewT(e.target.value)} placeholder="+998 90 123 45 67" inputMode="tel" autoFocus /><button onClick={() => saveTel(newT)} style={STY.bt()}>{lg === "uz" ? "Saqlash" : "Save"}</button></div>}
          </div>
          <div style={STY.cd}>
            <div style={{ fontSize: 13, fontWeight: 700, color: th.t1, marginBottom: 10 }}>{lg === "uz" ? "Bu oy statistikasi" : "Stats"}</div>
            {[
              { l: lg === "uz" ? "Xarajat" : "Expense", v: f(bX.filter(x => x.uid === user.id).reduce((s, x) => s + Number(x.summa || 0), 0), true), c: th.rd },
              { l: lg === "uz" ? "Daromad" : "Income", v: f(bD.filter(d => d.uid === user.id).reduce((s, d) => s + Number(d.summa || 0), 0), true), c: th.gr },
              { l: lg === "uz" ? "Jami yozuvlar" : "Total records", v: xar.filter(x => x.uid === user.id).length + " ta", c: th.ac },
            ].map(item => (
              <div key={item.l} style={{ ...STY.row, padding: "8px 0", borderBottom: "1px solid " + th.bor }}><span style={{ fontSize: 12, color: th.t2 }}>{item.l}</span><span style={{ fontSize: 13, fontWeight: 700, color: item.c }}>{item.v}</span></div>
            ))}
          </div>
          {user?.rol === "bosh" && (
            <div style={{ ...STY.cd, background: th.ac + "0d", border: "1px solid " + th.ac + "33" }}>
              <div style={{ fontSize: 11, color: th.t2, marginBottom: 5, fontWeight: 600 }}>{Ico.key(th.ac)}{t.fc2}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", flexWrap: "wrap" }}>
                <div style={{ fontFamily: "monospace", fontSize: 14, color: th.ac, wordBreak: "break-all", fontWeight: 800, letterSpacing: 1, flex: 1, minWidth: 120 }}>{user?.oilaId || "—"}</div>
                {/* Copy — clipboard'ga nusxalash */}
                <button
                  aria-label={lg === "uz" ? "Oila kodini nusxalash" : "Copy family code"}
                  onClick={async () => {
                    const code = user?.oilaId || "";
                    if (!code) { ok$(lg === "uz" ? "Oila kodi topilmadi" : "No family code", "err"); return; }
                    buzz(10);
                    let done = false;
                    try {
                      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(code); done = true; }
                    } catch (e) { done = false; }
                    if (!done) {
                      // Zaxira usul: eski brauzerlar / HTTP muhit uchun
                      try {
                        const ta = document.createElement("textarea");
                        ta.value = code; ta.style.position = "fixed"; ta.style.opacity = "0";
                        document.body.appendChild(ta); ta.focus(); ta.select();
                        done = document.execCommand("copy");
                        document.body.removeChild(ta);
                      } catch (e) { done = false; }
                    }
                    if (done) ok$(lg === "uz" ? "Oila kodi nusxalandi" : "Family code copied");
                    else ok$(lg === "uz" ? "Nusxalab bo'lmadi" : "Copy failed", "err");
                  }}
                  style={{ background: th.ac + "18", border: "1px solid " + th.ac + "44", borderRadius: 9, padding: "7px 12px", color: th.ac, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="2" stroke={th.ac} strokeWidth="1.3" fill={th.ac} opacity=".12" /><rect x="5" y="5" width="9" height="9" rx="2" stroke={th.ac} strokeWidth="1.3" fill="none" /><path d="M11 5V4a2 2 0 00-2-2H4a2 2 0 00-2 2v5a2 2 0 002 2h1" stroke={th.ac} strokeWidth="1.3" /></svg>
                  {lg === "uz" ? "Nusxa" : "Copy"}
                </button>
                {/* Share — tizim ulashish oynasi (bo'lmasa nusxalashga tushadi) */}
                <button
                  aria-label={lg === "uz" ? "Oila kodini ulashish" : "Share family code"}
                  onClick={async () => {
                    const code = user?.oilaId || "";
                    if (!code) { ok$(lg === "uz" ? "Oila kodi topilmadi" : "No family code", "err"); return; }
                    buzz(10);
                    const txt = lg === "uz" ? "Oila Hisobchi ilovasiga qo'shiling! Oila kodi: " + code : "Join Oila Hisobchi! Family code: " + code;
                    if (navigator.share) {
                      try { await navigator.share({ title: "Oila Hisobchi", text: txt }); } catch (e) { /* foydalanuvchi bekor qildi */ }
                    } else {
                      try { await navigator.clipboard.writeText(txt); ok$(lg === "uz" ? "Oila kodi nusxalandi" : "Family code copied"); }
                      catch (e) { ok$(lg === "uz" ? "Ulashib bo'lmadi" : "Share failed", "err"); }
                    }
                  }}
                  style={{ background: th.gr + "18", border: "1px solid " + th.gr + "44", borderRadius: 9, padding: "7px 12px", color: th.gr, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="12" cy="3.5" r="2" stroke={th.gr} strokeWidth="1.3" /><circle cx="4" cy="8" r="2" stroke={th.gr} strokeWidth="1.3" /><circle cx="12" cy="12.5" r="2" stroke={th.gr} strokeWidth="1.3" /><path d="M5.8 7L10.2 4.5M5.8 9l4.4 2.5" stroke={th.gr} strokeWidth="1.3" strokeLinecap="round" /></svg>
                  {lg === "uz" ? "Ulashish" : "Share"}
                </button>
              </div>
              <div style={{ fontSize: 10, color: th.t2, marginTop: 5 }}>{t.fcd}</div>
            </div>
          )}
          {!isKid && (
            <button onClick={() => { buzz(10); setShowAddKid(true); }} style={{ ...STY.cd, width: "100%", background: "linear-gradient(135deg,#f59e0b0d,#ec48990d)", border: "1px solid #f59e0b33", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#f59e0b,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>👶</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Bola akkaunti qo'shish" : "Add kid account"}</div>
                <div style={{ fontSize: 11, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Farzandingizga login yarating" : "Create a login for your child"}</div>
              </div>
              <span style={{ fontSize: 18, color: th.t2 }}>›</span>
            </button>
          )}
          {user?.rol === "bosh" && azolar.length > 1 && (
            <div style={{ ...STY.cd }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: th.t1, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>👨‍👩‍👧‍👦 {lg === "uz" ? "Oila a'zolari va ruxsatlar" : "Members & access"}</div>
              <div style={{ fontSize: 10, color: th.t2, marginBottom: 12 }}>{lg === "uz" ? "Kimga umumiy hisobotni ko'rishga ruxsat berasiz?" : "Who can view the full family report?"}</div>
              {azolar.map(a => {
                const isAHead = a.rol === "bosh";
                const hasAccess = isAHead || (oila?.reportAccess || []).includes(a.id);
                const rel = RELATIONS.find(r => r.id === a.rel);
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid " + th.bor }}>
                    <Av src={a.photo} name={a.ism} size={34} ac={th.ac} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: th.t1 }}>{a.ism}{a.id === user.id && <span style={{ color: th.ac, fontSize: 10 }}> ({t.me})</span>}</div>
                      <div style={{ fontSize: 10, color: th.t2 }}>{rel ? (rel.emoji + " " + (rel[lg] || rel.uz)) : (isAHead ? t.hd : t.mb2)}</div>
                    </div>
                    {isAHead
                      ? <span style={{ fontSize: 10, color: th.ac, fontWeight: 700, background: th.ac + "15", borderRadius: 8, padding: "4px 10px" }}>{lg === "uz" ? "Oila boshi" : "Head"}</span>
                      : <button onClick={() => toggleReportAccess(a.id)} style={{ width: 46, height: 26, borderRadius: 13, border: "none", cursor: "pointer", background: hasAccess ? th.gr : th.bor, position: "relative", transition: "background .2s" }}>
                          <span style={{ position: "absolute", top: 3, left: hasAccess ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                        </button>}
                  </div>
                );
              })}
              <div style={{ fontSize: 10, color: th.t2, marginTop: 10, fontStyle: "italic" }}>{lg === "uz" ? "💡 Yashil = umumiy hisobotni ko'ra oladi" : "💡 Green = can see full report"}</div>
            </div>
          )}
          {azolar.length > 0 && (
            <div style={STY.cd}>
              <div style={{ fontWeight: 700, marginBottom: 12, color: th.t1 }}>{t.fam}: {oila?.nomi}</div>
              {azolar.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid " + th.bor }}>
                  <Av src={a.photo} name={a.ism} size={34} ac={th.ac} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: th.t1, fontWeight: 600 }}>{a.ism}{a.id === user.id && <span style={{ color: th.ac, fontSize: 10 }}> ({t.me})</span>}</div>
                    <div style={{ fontSize: 10, color: th.t2 }}>{a.email}</div>
                  </div>
                  <span style={{ fontSize: 10, color: a.rol === "bosh" ? th.am : th.t2, background: a.rol === "bosh" ? th.am + "18" : th.bg, padding: "3px 9px", borderRadius: 20, fontWeight: 600 }}>{a.rol === "bosh" ? t.hd : t.mb2}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {pTab === "budjet" && (
        <div>
          <BH label={lg === "uz" ? "Budjet va limitlar" : "Budget & limits"} th={th} onBack={() => setPTab("main")} />
          <div style={{ ...STY.cd, background: "linear-gradient(135deg," + th.ac + "15," + th.ac2 + "08)", border: "1.5px solid " + th.ac + "33" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: th.ac, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>{Ico.wallet(th.ac)}{lg === "uz" ? "Oylik budjet" : "Monthly budget"}</div>
            <div style={{ fontSize: 11, color: th.t2, marginBottom: 14 }}>{lg === "uz" ? "Bu oy uchun umumiy xarajat chegarasi" : "Total spending limit this month"}</div>
            <label style={STY.lb}>{t.mb}</label>
            <MoneyInput style={{ ...STY.ip, fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 4 }} value={fBj} onChange={setFBj} placeholder="2 000 000" th={th} />
            <div style={{ fontSize: 11, color: th.t2, textAlign: "center" }}>{f(Number(fBj) || 0, false)}</div>
          </div>
          {(() => {
            const bjNum = Number(fBj) || 0;
            const avgInc = bD.reduce((s, d) => s + Number(d.summa || 0), 0);
            if (bjNum > 0 && avgInc > 0 && bjNum > avgInc) {
              return (
                <div style={{ background: th.rd + "11", border: "1.5px solid " + th.rd + "44", borderRadius: 14, padding: "13px 15px", marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: th.rd, marginBottom: 3 }}>{lg === "uz" ? "Budjet daromaddan yuqori!" : "Budget exceeds income!"}</div><div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5 }}>{lg === "uz" ? "Bu oy daromadingiz " + f(avgInc, true) + ", lekin budjet " + f(bjNum, true) + "." : "Income " + f(avgInc, true) + ", budget " + f(bjNum, true)}</div></div>
                </div>
              );
            }
            return null;
          })()}
          {bD.reduce((s, d) => s + Number(d.summa || 0), 0) > 0 && (() => {
            const jD2 = bD.reduce((s, d) => s + Number(d.summa || 0), 0);
            return (
              <div style={{ background: th.gr + "0d", border: "1px solid " + th.gr + "33", borderRadius: 14, padding: "14px 15px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: th.gr, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>💡 {lg === "uz" ? "50/30/20 qoidasi bo'yicha taklif" : "50/30/20 rule"}</div>
                <div style={{ fontSize: 11, color: th.t2, marginBottom: 12, lineHeight: 1.5 }}>{lg === "uz" ? "Daromadingiz (" + f(jD2, true) + ") asosida tavsiya:" : "Based on income (" + f(jD2, true) + "):"}</div>
                {[{ p: 50, c: "#10b981", uz: "Ehtiyojlar (oziq, uy, transport)", en: "Needs" }, { p: 30, c: "#f59e0b", uz: "Xohishlar (ko'ngilochar, kiyim)", en: "Wants" }, { p: 20, c: "#6366f1", uz: "Jamg'arma va maqsadlar", en: "Savings" }].map(r => (
                  <div key={r.p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 38, height: 24, borderRadius: 6, background: r.c + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: r.c, flexShrink: 0 }}>{r.p}%</div>
                    <span style={{ flex: 1, fontSize: 11, color: th.t1 }}>{lg === "uz" ? r.uz : r.en}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.c }}>{f(Math.round(jD2 * r.p / 100), true)}</span>
                  </div>
                ))}
                <button onClick={() => setFBj(String(Math.round(jD2 * 0.8)))} style={{ width: "100%", marginTop: 8, background: th.gr + "15", border: "1px solid " + th.gr + "44", borderRadius: 10, padding: "9px", color: th.gr, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>{lg === "uz" ? "Budjetni 80% qilib o'rnatish" : "Set budget to 80%"}</button>
              </div>
            );
          })()}
          <div style={STY.cd}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: th.t1 }}>{lg === "uz" ? "Kategoriya limitlari" : "Category limits"}</div>
            <div style={{ fontSize: 11, color: th.t2, marginBottom: 14 }}>{lg === "uz" ? "Har bir kategoriya uchun alohida chegara (ixtiyoriy)" : "Separate limit per category (optional)"}</div>
            {KATS.map((k, i) => (
              <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: k.c + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><KatIco id={k.id} c={k.c} s={18} /></div>
                <span style={{ fontSize: 13, color: th.t1, flex: 1, fontWeight: 500 }}>{KN[lg][i]}</span>
                <input type="number" style={{ width: 120, background: th.bg, border: "1.5px solid " + th.bor, borderRadius: 10, padding: "8px 12px", color: th.t1, fontSize: 13, outline: "none", textAlign: "right" }} value={fKL[k.id] || ""} onChange={e => setFKL(p => ({ ...p, [k.id]: Number(e.target.value) || 0 }))} placeholder="—" />
              </div>
            ))}
          </div>
          {(() => {
            const limTotal = KATS.reduce((s, k) => s + (Number(fKL[k.id]) || 0), 0);
            const bjNum = Number(fBj) || 0;
            if (limTotal > 0 && bjNum > 0 && limTotal > bjNum) {
              return (
                <div style={{ background: th.am + "11", border: "1.5px solid " + th.am + "44", borderRadius: 14, padding: "13px 15px", marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: th.am, marginBottom: 3 }}>{lg === "uz" ? "Limitlar budjetdan oshdi" : "Limits exceed budget"}</div><div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5 }}>{lg === "uz" ? "Kategoriya limitlari jami " + f(limTotal, true) + ", budjet esa " + f(bjNum, true) + "." : "Limits total " + f(limTotal, true) + " > budget " + f(bjNum, true)}</div></div>
                </div>
              );
            }
            if (limTotal > 0 && bjNum > 0) {
              return <div style={{ background: th.gr + "0d", borderRadius: 12, padding: "11px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: th.t2 }}>{lg === "uz" ? "Limitlar jami" : "Limits total"}</span><span style={{ fontSize: 13, fontWeight: 700, color: th.gr }}>{f(limTotal, true)} / {f(bjNum, true)}</span></div>;
            }
            return null;
          })()}
          <button onClick={saveBj} style={{ ...STY.bt(), display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{Ico.check("#fff")}{t.sv}</button>
        </div>
      )}

      {pTab === "ilovaS" && (
        <div>
          <BH label={t.ilovaS} th={th} onBack={() => setPTab("main")} />
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid " + th.bor }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: th.ac + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ico.globe(th.ac)}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: th.t1 }}>{t.til}</div><div style={{ fontSize: 12, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "O'zbek" : lg === "ru" ? "Русский" : "English"}</div></div>
            </div>
            <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ id: "uz", l: "🇺🇿 O'zbek" }, { id: "ru", l: "🇷🇺 Русский" }, { id: "kk", l: "🇰🇿 Qaraqalpaq" }, { id: "en", l: "🇬🇧 English" }].map(l => (
                <button key={l.id} onClick={() => { const nl = l.id === "kk" ? "uz" : l.id; setLg(nl); localStorage.setItem("oilaV7L", nl); }} style={{ background: lg === l.id ? th.ac + "18" : th.bg, border: "2px solid " + (lg === l.id ? th.ac : th.bor), borderRadius: 11, padding: "10px 8px", color: lg === l.id ? th.ac : th.t2, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>{l.l}</button>
              ))}
            </div>
          </div>
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid " + th.bor }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: th.ac + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{dark ? Ico.moon(th.ac) : Ico.sun(th.ac)}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: th.t1 }}>{t.mavzu}</div><div style={{ fontSize: 12, color: th.t2, marginTop: 2 }}>{dark ? t.tungi : t.kunduzi}</div></div>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
              {[{ v: false, l: "☀️ " + t.kunduzi }, { v: true, l: "🌙 " + t.tungi }].map(m => (
                <button key={String(m.v)} onClick={() => { setDark(m.v); localStorage.setItem("oilaV7D", String(m.v)); }} style={{ flex: 1, background: dark === m.v ? th.ac + "18" : th.bg, border: "2px solid " + (dark === m.v ? th.ac : th.bor), borderRadius: 11, padding: "11px 8px", color: dark === m.v ? th.ac : th.t2, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{m.l}</button>
              ))}
            </div>
          </div>
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
            <button onClick={() => setShowValDD(v => !v)} style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: th.ac + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ico.money(th.ac)}</div>
              <div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 15, fontWeight: 600, color: th.t1 }}>{lg === "uz" ? "Valyuta" : "Валюта"}</div><div style={{ fontSize: 12, color: th.t2, marginTop: 2 }}>{val.b} {val.id.toUpperCase()}</div></div>
              <div style={{ transform: showValDD ? "rotate(180deg)" : "none", transition: "transform .2s" }}>{Ico.chevron(th.t2, false)}</div>
            </button>
            {showValDD && (
              <div style={{ borderTop: "1px solid " + th.bor, maxHeight: 280, overflowY: "auto" }}>
                {VALS.map(v => (
                  <button key={v.id} onClick={() => { setVal(v); localStorage.setItem("oilaV7V", v.id); setShowValDD(false); }} style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, background: val.id === v.id ? th.ac + "11" : "none", border: "none", borderBottom: "1px solid " + th.bor, cursor: "pointer" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: (val.id === v.id ? th.ac : th.t2) + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: val.id === v.id ? th.ac : th.t2, flexShrink: 0 }}>{v.b}</div>
                    <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 600, color: val.id === v.id ? th.ac : th.t1 }}>{v.id.toUpperCase()}</span>
                    {val.id === v.id && <span style={{ color: th.ac }}>{Ico.check(th.ac)}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: notifEnabled ? "1px solid " + th.bor : "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: (notifEnabled ? th.gr : th.t2) + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" fill={notifEnabled ? th.gr : th.t2} opacity=".2" stroke={notifEnabled ? th.gr : th.t2} strokeWidth="1.3" /><path d="M8.5 16.5a1.5 1.5 0 003 0" stroke={notifEnabled ? th.gr : th.t2} strokeWidth="1.3" strokeLinecap="round" /></svg>
              </div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: th.t1 }}>{lg === "uz" ? "Bildirishnomalar" : "Notifications"}</div><div style={{ fontSize: 12, color: th.t2, marginTop: 2 }}>{notifEnabled ? (lg === "uz" ? "Yoqilgan — har kuni " + notifTime : "On — daily at " + notifTime) : (lg === "uz" ? "O'chirilgan" : "Off")}</div></div>
              <div onClick={toggleNotif} style={{ width: 50, height: 28, borderRadius: 14, background: notifEnabled ? th.gr : "#334155", cursor: "pointer", position: "relative", transition: "background .3s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 4, left: notifEnabled ? 24 : 4, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .3s" }} />
              </div>
            </div>
            {notifEnabled && (
              <div style={{ padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: th.t2, marginBottom: 8, fontWeight: 600 }}>{lg === "uz" ? "Eslatma vaqti" : "Reminder time"}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["08:00", "12:00", "18:00", "20:00", "21:00", "22:00"].map(time => (
                    <button key={time} onClick={() => saveNotifTime(time)} style={{ background: notifTime === time ? th.ac + "18" : th.bg, border: "1.5px solid " + (notifTime === time ? th.ac : th.bor), borderRadius: 10, padding: "7px 14px", color: notifTime === time ? th.ac : th.t2, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{time}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ background: "linear-gradient(135deg," + th.ac + "11," + th.ac2 + "08)", border: "1.5px solid " + th.ac + "33", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setShowPremModal(true)}>
            <div style={{ fontSize: 28 }}>💎</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, color: th.ac }}>{isPremium ? (lg === "uz" ? "Premium faol" : "Premium active") : (lg === "uz" ? "Premium ga o'ting" : "Upgrade to Premium")}</div><div style={{ fontSize: 12, color: th.t2, marginTop: 2 }}>{isPremium ? (lg === "uz" ? "Barcha funksiyalar ochiq" : "All unlocked") : (lg === "uz" ? "Cheksiz maqsad, PDF, Excel..." : "Unlimited goals, PDF...")}</div></div>
            {!isPremium ? <div style={{ background: th.ac, borderRadius: 10, padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{lg === "uz" ? "Ochish" : "Unlock"}</div> : <div style={{ fontSize: 20 }}>✓</div>}
          </div>
        </div>
      )}

      {pTab === "xav" && (
        <div>
          <BH label={t.xav} th={th} onBack={() => setPTab("main")} />
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: th.ac + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ico.lock(th.ac)}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: th.t1 }}>{t.pin}</div><div style={{ fontSize: 12, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "4 raqamli maxfiy kod" : "4-digit code"}</div></div>
              <button onClick={() => setPinStep(pinStep === "idle" ? "enter" : "idle")} style={{ background: th.ac, border: "none", borderRadius: 9, padding: "7px 14px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>{pinStep === "idle" ? (lg === "uz" ? "O'zgartirish" : "Change") : (lg === "uz" ? "Bekor" : "Cancel")}</button>
            </div>
            {pinStep !== "idle" && (
              <div style={{ padding: "16px", borderTop: "1px solid " + th.bor }}>
                <div style={{ fontSize: 13, color: th.t2, marginBottom: 12, textAlign: "center", fontWeight: 600 }}>{pinStep === "enter" ? (lg === "uz" ? "Yangi PIN kiriting" : "Enter new PIN") : (lg === "uz" ? "PIN ni tasdiqlang" : "Confirm PIN")}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 16 }}>
                  {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: (pinStep === "enter" ? pinVal : pinCfm).length > i ? th.ac : th.bor, transition: "background .2s" }} />)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((num, ni) => (
                    <button key={ni} onClick={() => {
                      if (num === "") return;
                      const cur = pinStep === "enter" ? pinVal : pinCfm;
                      const setter = pinStep === "enter" ? setPinVal : setPinCfm;
                      if (num === "⌫") { setter(cur.slice(0, -1)); return; }
                      const next = cur + String(num);
                      setter(next);
                      if (next.length === 4) {
                        if (pinStep === "enter") { setTimeout(() => setPinStep("confirm"), 300); }
                        else { if (next === pinVal) { setPinStep("idle"); setPinVal(""); setPinCfm(""); ok$(lg === "uz" ? "PIN saqlandi" : "PIN saved"); } else { setPinCfm(""); ok$(lg === "uz" ? "PIN mos kelmadi" : "PIN mismatch", "err"); } }
                      }
                    }} style={{ background: typeof num === "number" ? th.sur : "transparent", border: typeof num === "number" ? "1px solid " + th.bor : "none", borderRadius: 12, padding: "14px", fontSize: 18, fontWeight: 700, color: num === "⌫" ? th.rd : th.t1, cursor: num === "" ? "default" : "pointer" }}>{num}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ background: th.sur, border: "1px solid " + th.bor, borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: th.gr + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ico.finger(th.gr)}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: th.t1 }}>{t.barmoq}</div><div style={{ fontSize: 12, color: th.t2, marginTop: 2 }}>{lg === "uz" ? "Tez va xavfsiz" : "Fast & secure"}</div></div>
            <div onClick={() => setFinger(v => !v)} style={{ width: 50, height: 28, borderRadius: 14, background: finger ? th.gr : "#334155", cursor: "pointer", position: "relative", transition: "background .3s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 4, left: finger ? 24 : 4, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .3s", boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
            </div>
          </div>
        </div>
      )}

      {pTab === "qol" && (
        <div>
          <BH label={t.qol} th={th} onBack={() => setPTab("main")} />
          <a href="https://t.me/oila_hisobchi_bot" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg,#2196F3,#0d47a1)", borderRadius: 18, padding: "18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ico.tg()}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{t.tgBot}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 3 }}>@oila_hisobchi_bot</div></div>
              {Ico.right("rgba(255,255,255,0.7)")}
            </div>
          </a>
          <div style={{ fontSize: 11, color: th.t2, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>{t.faq}</div>
          {FAQS[lg].map((item, i) => (
            <div key={i} style={{ marginBottom: 8, borderRadius: 14, overflow: "hidden", border: "1px solid " + th.bor }}>
              <button onClick={() => setFaqO(faqO === i ? null : i)} style={{ width: "100%", background: faqO === i ? th.ac + "18" : th.sur, border: "none", padding: "14px 16px", cursor: "pointer", textAlign: "left", color: th.t1, fontSize: 14, fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ flex: 1, paddingRight: 8 }}>{item.q}</span>
                {Ico.chevron(th.ac, faqO === i)}
              </button>
              {faqO === i && <div style={{ background: th.surH, padding: "12px 16px", fontSize: 13, color: th.t2, lineHeight: 1.75, borderTop: "1px solid " + th.bor }}>{item.a}</div>}
            </div>
          ))}
          <div style={{ fontSize: 11, color: th.t2, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 10, marginTop: 20 }}>{lg === "uz" ? "Taklif va kamchiliklar" : "Feedback"}</div>
          <div style={STY.cd}>
            <div style={{ fontSize: 14, fontWeight: 700, color: th.t1, marginBottom: 4 }}>{lg === "uz" ? "Ilovani baholang" : "Rate the app"}</div>
            <div style={{ fontSize: 12, color: th.t2, marginBottom: 12 }}>{lg === "uz" ? "Fikringiz biz uchun muhim!" : "Your opinion matters!"}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setFbRating(star)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill={star <= fbRating ? "#f59e0b" : "none"} stroke={star <= fbRating ? "#f59e0b" : th.t2} strokeWidth="1.5"><path d="M12 2l2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.6 5.7 20.7 7 13.8 2 9.1l6.8-.8L12 2z" strokeLinejoin="round" /></svg>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[{ id: "taklif", l: lg === "uz" ? "Taklif" : "Suggestion" }, { id: "xato", l: lg === "uz" ? "Kamchilik" : "Bug" }, { id: "boshqa", l: lg === "uz" ? "Boshqa" : "Other" }].map(ty => (
                <button key={ty.id} onClick={() => setFbType(ty.id)} style={{ flex: 1, background: fbType === ty.id ? th.ac + "18" : th.bg, border: "1.5px solid " + (fbType === ty.id ? th.ac : th.bor), borderRadius: 10, padding: "8px 4px", color: fbType === ty.id ? th.ac : th.t2, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>{ty.l}</button>
              ))}
            </div>
            <textarea value={fbText} onChange={e => setFbText(e.target.value)} placeholder={lg === "uz" ? "Fikr, taklif yoki kamchilikni yozing..." : "Write your feedback..."} style={{ width: "100%", minHeight: 90, background: th.surH, border: "1.5px solid " + th.bor, borderRadius: 13, padding: "12px 14px", color: th.t1, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", marginBottom: 12 }} />
            <button onClick={sendFeedback} disabled={fbSending} style={{ ...STY.bt(), marginBottom: 0, opacity: fbSending ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M16 2L8 10M16 2l-5 14-3-6-6-3 14-5z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {fbSending ? (lg === "uz" ? "Yuborilmoqda..." : "Sending...") : (lg === "uz" ? "Yuborish" : "Send")}
            </button>
          </div>
        </div>
      )}

      {pTab === "garden" && <Garden user={user} lg={lg} dark={dark} onBack={() => setPTab("main")} addCoin={addStar} />}

      {showAddKid && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowAddKid(false)}>
          <div className="anim-fadeUp" style={{ background: th.bg, borderRadius: "24px 24px 0 0", maxWidth: 480, width: "100%", padding: "24px 20px 32px" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: th.bor, margin: "0 auto 18px" }} />
            <div style={{ fontSize: 42, textAlign: "center", marginBottom: 8 }}>👶</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: th.t1, marginBottom: 6, textAlign: "center" }}>{lg === "uz" ? "Bola akkaunti yaratish" : "Create kid account"}</div>
            <div style={{ fontSize: 12, color: th.t2, textAlign: "center", marginBottom: 18, lineHeight: 1.5 }}>{lg === "uz" ? "Farzandingiz uchun login va parol yarating." : "Create a login for your child."}</div>
            <label style={STY.lb}>{lg === "uz" ? "Bola ismi" : "Child's name"}</label>
            <input style={STY.ip} value={kidName} onChange={e => setKidName(e.target.value)} placeholder={lg === "uz" ? "Jahongir" : "Name"} />
            <label style={STY.lb}>{lg === "uz" ? "Login" : "Login"}</label>
            <input style={STY.ip} value={kidLogin} onChange={e => setKidLogin(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())} placeholder="jahongir2015" />
            <label style={STY.lb}>{lg === "uz" ? "Parol" : "Password"}</label>
            <input style={STY.ip} type="text" value={kidPw} onChange={e => setKidPw(e.target.value)} placeholder={lg === "uz" ? "Kamida 4 belgi" : "Min 4 chars"} />
            <button onClick={addKidAccount} style={{ ...STY.bt(), marginTop: 6, marginBottom: 0 }}>{lg === "uz" ? "Akkaunt yaratish" : "Create account"}</button>
          </div>
        </div>
      )}

      {showReferral && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 999, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowReferral(false)}>
          <div style={{ background: th.sur, borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 430, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎁</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: th.t1, marginBottom: 4 }}>{lg === "uz" ? "Do'stlarni taklif qiling" : "Invite friends"}</div>
              <div style={{ fontSize: 13, color: th.t2 }}>{lg === "uz" ? "Har bir do'st uchun imtiyozlar oling!" : "Get rewards for each friend!"}</div>
            </div>
            <div style={{ background: "linear-gradient(135deg," + th.gr + "15," + th.ac + "08)", border: "1.5px solid " + th.gr + "33", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: th.t1 }}>{lg === "uz" ? "Sizning natijangiz" : "Your progress"}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: th.gr }}>{refCount}/3</div>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < refCount ? th.gr : th.bor }} />)}
              </div>
              <div style={{ fontSize: 12, color: th.t2 }}>{refCount >= 3 ? (lg === "uz" ? "🎉 Tabriklaymiz! Premium ochildi!" : "🎉 Premium unlocked!") : (lg === "uz" ? "Yana " + (3 - refCount) + " ta do'st = 1 oy Premium bepul" : (3 - refCount) + " more friends = 1 month free Premium")}</div>
            </div>
            <div style={{ fontSize: 11, color: th.t2, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{lg === "uz" ? "Sizning taklif havolangiz" : "Your invite link"}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, background: th.bg, border: "1.5px solid " + th.bor, borderRadius: 12, padding: "12px 14px", fontSize: 12, color: th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>{(window.location.origin + "/?ref=") + (user?.id || "")}</div>
              <button onClick={() => { const link = (window.location.origin + "/?ref=") + (user?.id || ""); try { navigator.clipboard.writeText(link); ok$(lg === "uz" ? "Havola nusxalandi!" : "Link copied!"); } catch (e) { ok$(lg === "uz" ? "Nusxalab bo'lmadi" : "Copy failed", "err"); } }} style={{ background: th.ac, border: "none", borderRadius: 12, padding: "0 16px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{lg === "uz" ? "Nusxa" : "Copy"}</button>
            </div>
            <div style={{ background: th.ac + "0a", border: "1px solid " + th.ac + "22", borderRadius: 14, padding: "13px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: th.t1, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>👥 {lg === "uz" ? "Do'stni taklif qilish" : "Invite a friend"}</div>
              <div style={{ fontSize: 10, color: th.t2, marginBottom: 10 }}>{lg === "uz" ? "Faqat ilovaga taklif" : "App invite only"}</div>
              <button onClick={() => { const link = (window.location.origin + "/?ref=") + (user?.id || ""); const txt = (lg === "uz" ? "Oila Hisobchi - oilaviy byudjet ilovasi! Men bilan qo'shiling: " : "Join me on Family Budget app: ") + link; const url = "https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent(txt); window.open(url, "_blank"); }} style={{ width: "100%", background: "#2196F3", border: "none", borderRadius: 11, padding: "11px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>{lg === "uz" ? "Telegram orqali yuborish" : "Send via Telegram"}
              </button>
            </div>
            {user?.rol === "bosh" && (
              <div style={{ background: th.gr + "0a", border: "1px solid " + th.gr + "22", borderRadius: 14, padding: "13px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: th.t1, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>👨‍👩‍👧‍👦 {lg === "uz" ? "Oila a'zosini taklif qilish" : "Invite to family"}</div>
                <div style={{ fontSize: 10, color: th.t2, marginBottom: 10 }}>{lg === "uz" ? "Oila kodi bilan" : "With family code"}</div>
                <div style={{ background: th.bg, borderRadius: 9, padding: "8px 12px", marginBottom: 9, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: th.t2 }}>{lg === "uz" ? "Oila kodi" : "Family code"}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: th.gr, fontFamily: "monospace", letterSpacing: 1 }}>{user?.oilaId}</span>
                </div>
                <button onClick={() => { const code = user?.oilaId || ""; const link = (window.location.origin + "/?ref=") + (user?.id || "") + "&fam=" + code; const txt = (lg === "uz" ? "Bizning oilamizga qo'shiling! Oila kodi: " + code + "\n" : "Join our family! Family code: " + code + "\n") + link; const url = "https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent(txt); window.open(url, "_blank"); }} style={{ width: "100%", background: th.gr, border: "none", borderRadius: 11, padding: "11px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>{lg === "uz" ? "Oila kodi bilan yuborish" : "Send with family code"}
                </button>
              </div>
            )}
            <div style={{ background: th.bg, borderRadius: 14, padding: "14px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: th.t1, marginBottom: 10 }}>{lg === "uz" ? "Imtiyozlar" : "Rewards"}</div>
              {[{ n: 1, t: lg === "uz" ? "1 do'st — 100 ball" : "1 friend — 100 points" }, { n: 3, t: lg === "uz" ? "3 do'st — 1 oy Premium" : "3 friends — 1 month Premium" }, { n: 10, t: lg === "uz" ? "10 do'st — 1 yil Premium" : "10 friends — 1 year Premium" }].map(r => (
                <div key={r.n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: refCount >= r.n ? th.gr + "22" : th.bor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: refCount >= r.n ? th.gr : th.t2, flexShrink: 0 }}>{refCount >= r.n ? "✓" : r.n}</div>
                  <span style={{ fontSize: 12, color: refCount >= r.n ? th.t1 : th.t2, fontWeight: refCount >= r.n ? 600 : 400 }}>{r.t}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowReferral(false)} style={{ width: "100%", background: "transparent", border: "1px solid " + th.bor, borderRadius: 14, padding: "12px", color: th.t2, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>{lg === "uz" ? "Yopish" : "Close"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
