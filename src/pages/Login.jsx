import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { KatIco, DarIco, MoneyInput, Tst } from "../components/common/index.jsx";
import { Ico } from "../utils/icons.jsx";
import { COUNTRIES, VALS, RELATIONS, TL } from "../utils/constants.js";
import { td, nt, normTel, hp } from "../utils/formatters.js";
import { db, auth, setOwnerCtx, fbAuth } from "../firebase.js";

export default function LoginPage() {
  const {
    user, setUser, oila, setOila, azolar, setAzolar,
    setXar, setDar, setMaq, setScr, setBoot, val, setVal,
    dark, setDark, lg, setLg, th, t, ok$, buzz, addStar,
    tst,
  } = useApp();

  const { loadFam } = useAuth();
  const authBusyRef = useRef(false);

  // ── 7 tilni to'liq qo'llab-quvvatlaydigan tarjima yordamchisi ──
  // L(uz, ru, en, kk, ky, tg, qr) — qaysi til tanlangan bo'lsa O'SHA
  // qaytadi, HECH QACHON boshqa tilga tushib qolmaydi.
  const L = (uzVal, ruVal, enVal, kkVal, kyVal, tgVal, qrVal) => {
    const map = { uz: uzVal, ru: ruVal, en: enVal, kk: kkVal, ky: kyVal, tg: tgVal, qr: qrVal };
    return map[lg] !== undefined ? map[lg] : uzVal;
  };

  // ── Local states ──
  const [reg,          setReg]          = useState(false);
  const [kidLoginMode, setKidLoginMode] = useState(false);
  const [join,         setJoin]         = useState(false);
  const [fIsm,  setFIsm]  = useState("");
  const [fEm,   setFEm]   = useState("");
  const [fPw,   setFPw]   = useState("");
  const [fON,   setFON]   = useState("");
  const [fKd,   setFKd]   = useState("");
  const [fTel,  setFTel]  = useState("");
  const [fDial, setFDial] = useState("+998");
  const [fCountry, setFCountry] = useState("uz");
  const [showValDD,    setShowValDD]    = useState(false);
  const [fRel,         setFRel]         = useState("");
  const [showCountryDD, setShowCountryDD] = useState(false);
  const [showRelDD,    setShowRelDD]    = useState(false);
  const [fRefCode,     setFRefCode]     = useState("");
  const [showPw,       setShowPw]       = useState(false);
  const [showResetScreen, setShowResetScreen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetEmail,   setResetEmail]   = useState("");
  const [resetInput,   setResetInput]   = useState("");
  const [resetSent,    setResetSent]    = useState(false);
  const [showLgDD,     setShowLgDD]     = useState(false);

  const LANGS_MAP = {
    uz: { label: "🇺🇿 O'zbekcha", name: "O'zbekcha" },
    ru: { label: "🇷🇺 Русский", name: "Русский" },
    kk: { label: "🇰🇿 Қазақша", name: "Қазақша" },
    ky: { label: "🇰🇬 Кыргызча", name: "Кыргызча" },
    tg: { label: "🇹🇯 Тоҷикӣ", name: "Тоҷикӣ" },
    qr: { label: "🇺🇿 Qaraqalpaqsha", name: "Qaraqalpaqsha" },
    en: { label: "🇬🇧 English", name: "English" }
  };
  const LANG_KEYS = ["uz", "en", "ru", "kk", "ky", "tg", "qr"];

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const rc = params.get("ref"); if (rc) { setFRefCode(rc); setReg(true); }
      const fam = params.get("fam"); if (fam) { setFKd(fam); setJoin(true); setReg(true); }
    } catch {}
  }, []);

  const STY = useApp().th ? {
    pg: { background: th.bg, minHeight: "100vh", color: th.t1, position: "relative", overflowX: "hidden" },
    cd: { background: th.sur, border: "1px solid " + th.bor, borderRadius: 24, padding: "24px 20px 20px", boxShadow: "0 10px 30px " + th.bor + "55" },
    lb: { fontSize: 11, color: th.t2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" },
    ip: { width: "100%", background: th.surH, border: "1.5px solid " + th.bor, borderRadius: 12, padding: "12px 14px", color: th.t1, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 },
    bt: (bg = th.ac) => ({ width: "100%", background: bg, border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }),
    ch: (act, col = th.ac) => ({ background: act ? col + "15" : th.sur, border: "1.5px solid " + (act ? col : th.bor), borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: 700, color: act ? col : th.t2 }),
    tb: (act) => ({ flex: 1, background: act ? th.ac + "15" : th.surH, border: "2px solid " + (act ? th.ac : th.bor), borderRadius: 12, padding: "11px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, color: act ? th.ac : th.t2, transition: "all .15s" }),
  } : {};

  const switchAuthMode = (toReg, kidMode = false) => {
    setReg(toReg); setKidLoginMode(kidMode);
    setFIsm(""); setFEm(""); setFPw(""); setFTel(""); setFKd(""); setFRel(""); setFON("");
    setShowPw(false); setJoin(false);
  };

  const genPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let p = ""; for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setFPw(p); setShowPw(true);
    ok$(L("Parol yaratildi!", "Пароль создан!", "Password generated!", "Пароль жасалды!", "Сыр сөз түзүлдү!", "Рамз тавлид шуд!", "Parol jasaldı!"));
  };

  const handleResetPw = () => { setResetInput(fEm.trim() || ""); setResetSent(false); setShowResetScreen(true); };

  const sendResetEmail = async () => {
    const email = resetInput.trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return ok$(L("To'g'ri email kiriting", "Введите корректный email", "Enter valid email", "Дұрыс email енгізіңіз", "Туура email киргизиңиз", "Email-и дурустро ворид кунед", "Durıs email kiritiń"), "err");
    let exists = false;
    try { const uid = await db.gFresh("em_" + email); if (uid) exists = true; } catch (e) { exists = false; }
    if (!exists) {
      ok$(L("Bu email ro'yxatdan o'tmagan. Ro'yxatdan o'ting.", "Этот email не зарегистрирован. Зарегистрируйтесь.", "Email not registered. Please sign up.", "Бұл email тіркелмеген. Тіркеліңіз.", "Бул email катталган эмес. Каттоодон өтүңүз.", "Ин email сабт нашудааст. Сабти ном шавед.", "Bul email dizimnen ótpegen. Dizimnen ótiń."), "err");
      setTimeout(() => { setShowResetScreen(false); setReg(true); setFEm(email); }, 1600);
      return;
    }
    try { await auth.resetPassword(email); setResetSent(true); }
    catch (e) { ok$(L("Xato: ", "Ошибка: ", "Error: ", "Қате: ", "Ката: ", "Хато: ", "Qátelik: ") + (e.code || e.message), "err"); }
  };

  const googleJoinFamily = async (gUser, code) => {
    const uid = gUser.uid;
    const displayName = gUser.displayName || gUser.email?.split("@")[0] || "Foydalanuvchi";
    const email = (gUser.email || "").toLowerCase();
    setOwnerCtx(uid, code);
    let o = await db.g("oila_" + code);
    if (!o) o = await db.g("fam_" + code);
    if (!o) {
      setOwnerCtx(null, null); try { await auth.logout(); } catch (e) {}
      ok$(L("Oila kodi topilmadi: ", "Код семьи не найден: ", "Family code not found: ", "Отбасы коды табылмады: ", "Үй-бүлө коду табылган жок: ", "Коди оила ёфт нашуд: ", "Oila kodı tabılmadı: ") + code, "err");
      return null;
    }
    if ((o.azolarIds || o.azolar || []).length >= 2 && !o.premium) {
      setOwnerCtx(null, null); try { await auth.logout(); } catch (e) {}
      ok$(L("Bu oilada a'zolar limiti to'lgan (2). Oila boshi Premiumga o'tishi kerak.", "В этой семье лимит участников исчерпан (2). Главе семьи нужен Premium.", "Family member limit reached (2). Head needs Premium.", "Бұл отбасында мүшелер лимиті толды (2). Отбасы басшысы Premium-ге өтуі керек.", "Бул үй-бүлөдө мүчөлөр лимити толду (2). Үй-бүлө башчысы Premium-ге өтүшү керек.", "Дар ин оила ҳудуди аъзоён пур шудааст (2). Сарпарасти оила бояд ба Premium гузарад.", "Bul oilada aǵzalar limiti tolǵan (2). Oila basshısı Premiumǵa ótiwi kerek."), "err");
      return null;
    }
    const nu = { id: uid, ism: displayName, email, tel: "", ph: null, photo: gUser.photoURL || null, oilaId: code, rol: "azo", rel: "boshqa", registeredAt: new Date().toISOString(), loginMethod: "google" };
    await db.s("user_" + uid, nu); if (email) await db.s("em_" + email, uid);
    await db.s("x_" + code + "_" + uid, []); await db.s("d_" + code + "_" + uid, []);
    const mIds = [...new Set([...(o.azolarIds || o.azolar || []), uid])];
    o.azolarIds = mIds; o.azolar = mIds; if (!o.id) o.id = code;
    await db.s("oila_" + code, o); await db.s("fam_" + code, o);
    return nu;
  };

  const handleGoogleUser = async (gUser) => {
    let u = await db.g("user_" + gUser.uid);
    const pendingJoin = (localStorage.getItem("oilaV7GoogleJoin") || "").trim();
    localStorage.removeItem("oilaV7GoogleJoin");
    if (!u && pendingJoin) {
      u = await googleJoinFamily(gUser, pendingJoin);
      if (!u) return;
      localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id }));
      setUser(u); await loadFam(u); setScr("bosh");
      ok$(t.jf2);
      return;
    }
    if (!u) {
      const uid = gUser.uid;
      const displayName = gUser.displayName || gUser.email?.split("@")[0] || "Foydalanuvchi";
      const email = (gUser.email || "").toLowerCase();
      const famId = "fam_" + uid + "_" + Date.now();
      setOwnerCtx(uid, famId);
      u = { id: uid, oilaId: famId, ism: displayName, email, tel: "", photo: gUser.photoURL || null, rol: "bosh", val: "uzs", lg, dark, registeredAt: new Date().toISOString(), loginMethod: "google" };
      await db.s("user_" + uid, u);
      const gFam = { id: famId, nomi: displayName + L(" oilasi", " семья", " family", " отбасы", " үй-бүлөсү", " оила", " oilası"), boshId: uid, azolar: [uid], azolarIds: [uid], budjet: 2000000, katLimits: {}, yaratilgan: new Date().toISOString() };
      await db.s("fam_" + famId, gFam); await db.s("oila_" + famId, gFam);
      if (email) await db.s("em_" + email, uid);
    }
    localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id }));
    setUser(u); await loadFam(u); setScr("bosh");
    ok$(L("Xush kelibsiz, ", "Добро пожаловать, ", "Welcome, ", "Қош келдіңіз, ", "Кош келиңиз, ", "Хуш омадед, ", "Xosh keldińiz, ") + u.ism + " 👋");
  };

  const doGoogleLogin = async () => {
    try {
      if (join && fKd.trim()) localStorage.setItem("oilaV7GoogleJoin", fKd.trim());
      else localStorage.removeItem("oilaV7GoogleJoin");
      const res = await auth.googleLogin();
      if (res?.user) await handleGoogleUser(res.user);
    } catch (e) {
      localStorage.removeItem("oilaV7GoogleJoin");
      if (e.code !== "auth/popup-closed-by-user") {
        ok$(L("Google bilan kirishda xato: ", "Ошибка входа через Google: ", "Google sign-in error: ", "Google арқылы кіруде қате: ", "Google аркылуу кирүүдө ката: ", "Хатои воридшавӣ бо Google: ", "Google arqalı kiriwde qátelik: ") + (e.message || e.code), "err");
      }
    }
  };

  const doAuth = async () => {
    authBusyRef.current = true;
    try {
      if (kidLoginMode) {
        const loginKey = fTel.trim().toLowerCase();
        if (!loginKey || !fPw.trim()) return ok$(L("Login va parolni yozing", "Введите логин и пароль", "Enter login and password", "Логин мен парольді жазыңыз", "Логин жана сырсөздү жазыңыз", "Логин ва рамзро нависед", "Login hám paroldi jazıń"), "err");
        const look = await db.gFresh("kidlogin_" + loginKey);
        if (!look) return ok$(L("Login topilmadi. Ota-onangdan so'ra.", "Логин не найден. Спросите у родителей.", "Login not found", "Логин табылмады. Ата-анаңыздан сұраңыз.", "Логин табылган жок. Ата-энеңизден сураңыз.", "Логин ёфт нашуд. Аз волидайн пурсед.", "Login tabılmadı. Ata-anańnan sorań."), "err");
        const kidUid  = (typeof look === "object" && look) ? look.uid : look;
        const kidOila = (typeof look === "object" && look) ? (look.oila || null) : null;
        if (!kidUid) return ok$(L("Login topilmadi. Ota-onangdan so'ra.", "Логин не найден. Спросите у родителей.", "Login not found", "Логин табылмады. Ата-анаңыздан сұраңыз.", "Логин табылган жок. Ата-энеңизден сураңыз.", "Логин ёфт нашуд. Аз волидайн пурсед.", "Login tabılmadı. Ata-anańnan sorań."), "err");
        buzz(15);
        try {
          if (!fbAuth.currentUser || !fbAuth.currentUser.isAnonymous) await auth.loginAnon();
        } catch (e) { console.error("Anon login:", e); return ok$(L("Firebase Anonymous yoqilmagan!", "Firebase Anonymous не включён!", "Anonymous auth not enabled", "Firebase Anonymous қосылмаған!", "Firebase Anonymous күйгүзүлгөн эмес!", "Firebase Anonymous фаъол нест!", "Firebase Anonymous qosılmaǵan!"), "err"); }
        const anonUid = auth.current()?.uid;
        const phv = await hp(fPw);
        setOwnerCtx(kidUid, kidOila);
        try {
          if (anonUid) await db.s("ksess_" + anonUid, { kid: kidUid, oila: kidOila, ph: phv });
        } catch (e) {
          try { await auth.logout(); } catch (e2) {}
          return ok$(L("Kirishda xato, qayta urinib ko'ring", "Ошибка входа, попробуйте снова", "Sign-in error, try again", "Кіруде қате, қайта көріңіз", "Кирүүдө ката, кайра аракет кылыңыз", "Хатои воридшавӣ, дубора кӯшиш кунед", "Kiriwde qátelik, qayta urinip kóriń"), "err");
        }
        const ku = await db.g("user_" + kidUid);
        if (!ku || ku.rol !== "kid") {
          try { if (anonUid) await db.del("ksess_" + anonUid); } catch (e) {}
          try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
          return ok$(kidOila
            ? L("Login topilmadi", "Логин не найден", "Not found", "Логин табылмады", "Логин табылган жок", "Логин ёфт нашуд", "Login tabılmadı")
            : L("Akkaunt yangilanishi kerak: ota-onangiz ilovani bir marta ochib qo'ysin.", "Нужно обновить аккаунт: попросите родителей один раз открыть приложение.", "Ask a parent to open the app once, then retry.", "Аккаунтты жаңарту керек: ата-анаңыз қолданбаны бір рет ашсын.", "Аккаунтту жаңыртуу керек: ата-энеңиз колдонмону бир жолу ачсын.", "Ҳисоб бояд навсозӣ шавад: аз волидайн хоҳед, ки барномаро як бор кушоянд.", "Akkawnttı jańalaw kerek: ata-anańız qosımshanı bir márte ashıp qoysın."), "err");
        }
        if (phv !== ku.ph) {
          try { if (anonUid) await db.del("ksess_" + anonUid); } catch (e) {}
          try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
          return ok$(L("Parol noto'g'ri", "Неверный пароль", "Wrong password", "Құпия сөз қате", "Сыр сөз туура эмес", "Рамз нодуруст", "Parol qáte"), "err");
        }
        try { if (anonUid && (ku.oilaId || null) !== kidOila) await db.s("ksess_" + anonUid, { kid: kidUid, oila: ku.oilaId || null, ph: phv }); } catch (e) {}
        setOwnerCtx(kidUid, ku.oilaId || kidOila);
        try {
          if (ku.parentId) {
            const pu = await db.g("user_" + ku.parentId);
            if (pu?.oilaId && pu.oilaId !== ku.oilaId) { ku.oilaId = pu.oilaId; await db.s("user_" + ku.id, ku); }
          }
        } catch (e2) {}
        localStorage.setItem("oilaV7", JSON.stringify({ uid: ku.id, kid: true }));
        setUser(ku); await loadFam(ku); setScr("bosh");
        ok$(L("Xush kelibsiz, ", "Добро пожаловать, ", "Welcome, ", "Қош келдіңіз, ", "Кош келиңиз, ", "Хуш омадед, ", "Xosh keldińiz, ") + ku.ism + " 👋");
        return;
      }
      if (reg) {
        if (!fIsm.trim() || !fTel.trim() || fPw.length < 6) return ok$(L("Ism, telefon va parol (6+ belgi) kiriting", "Введите имя, телефон и пароль (6+ символов)", "Enter name, phone and password (6+)", "Аты-жөні, телефон және парольді (6+ таңба) енгізіңіз", "Аты, телефон жана сырсөздү (6+ белги) киргизиңиз", "Ном, телефон ва рамз (6+ аломат) ворид кунед", "Atı, telefon hám paroldi (6+ belgi) kiritiń"), "err");
        if (!fEm.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fEm.trim())) return ok$(L("To'g'ri email kiriting", "Введите корректный email", "Enter valid email", "Дұрыс email енгізіңіз", "Туура email киргизиңиз", "Email-и дурустро ворид кунед", "Durıs email kiritiń"), "err");
        if (await db.g("tel9_" + normTel(fTel))) return ok$(L("Bu telefon allaqachon ro'yxatda", "Этот телефон уже зарегистрирован", "Phone already registered", "Бұл телефон тіркелген", "Бул телефон катталган", "Ин телефон аллакай сабт шудааст", "Bul telefon dizimde bar"), "err");

        if (join) {
          if (!fKd.trim()) return ok$(t.fa, "err");
        } else {
          if (!fON.trim()) return ok$(t.fa, "err");
        }

        let authUser;
        try { authUser = await auth.register(fEm.trim().toLowerCase(), fPw); }
        catch (e) {
          const msg = e.code === "auth/email-already-in-use"
            ? L("Bu email allaqachon ishlatilgan", "Этот email уже используется", "Email already in use", "Бұл email қолданыста", "Бул email колдонулууда", "Ин email аллакай истифода мешавад", "Bul email paydalanılıp atır")
            : e.code === "auth/weak-password"
            ? L("Parol juda zaif (6+ belgi)", "Слишком слабый пароль (6+ символов)", "Weak password", "Құпия сөз әлсіз (6+ таңба)", "Сыр сөз алсыз (6+ белги)", "Рамз хеле суст аст (6+ аломат)", "Parol tım álsiz (6+ belgi)")
            : L("Ro'yxatda xato: ", "Ошибка регистрации: ", "Register error: ", "Тіркеуде қате: ", "Каттоодо ката: ", "Хато дар сабти ном: ", "Dizimnen ótiwde qátelik: ") + (e.code || e.message);
          return ok$(msg, "err");
        }
        const uid = authUser.uid, ph = await hp(fPw);
        if (join) {
          setOwnerCtx(uid, fKd.trim());
          const fid = fKd.trim();
          let o = await db.g("oila_" + fid);
          if (!o) o = await db.g("fam_" + fid);
          if (!o) { await auth.deleteCurrentUser(); setOwnerCtx(null, null); return ok$(t.ffe, "err"); }
          if ((o.azolarIds || o.azolar || []).length >= 2 && !o.premium) {
            await auth.deleteCurrentUser(); setOwnerCtx(null, null);
            return ok$(L("Bu oilada a'zolar limiti to'lgan (2). Oila boshi Premiumga o'tishi kerak.", "В этой семье лимит участников исчерпан (2). Главе семьи нужен Premium.", "Family member limit reached (2). Head needs Premium.", "Бұл отбасында мүшелер лимиті толды (2). Отбасы басшысы Premium-ге өтуі керек.", "Бул үй-бүлөдө мүчөлөр лимити толду (2). Үй-бүлө башчысы Premium-ге өтүшү керек.", "Дар ин оила ҳудуди аъзоён пур шудааст (2). Сарпарасти оила бояд ба Premium гузарад.", "Bul oilada aǵzalar limiti tolǵan (2). Oila basshısı Premiumǵa ótiwi kerek."), "err");
          }
          const dialC = (COUNTRIES.find(c => c.code === fCountry) || {}).dial || ""; const tel = (dialC + fTel.trim()).replace(/[^0-9+]/g, ""); const n9 = normTel(fTel);
          const nu = { id: uid, ism: fIsm.trim(), email: fEm.trim().toLowerCase(), tel, ph, oilaId: fKd.trim(), rol: "azo", rel: fRel || "boshqa", photo: null };
          await db.s("user_" + uid, nu); if (fEm.trim()) await db.s("em_" + fEm.toLowerCase(), uid);
          if (n9) { await db.s("tel9_" + n9, uid); await db.s("tel_" + tel, uid); await db.s("tphone_" + n9, fEm.trim().toLowerCase()); }
          if (fRefCode.trim()) {
            const refUid = fRefCode.trim();
            if (refUid && refUid !== uid) {
              try {
                await db.s("refi_" + refUid + "_" + uid, { uid, ism: fIsm.trim(), sana: new Date().toISOString() }, { c: "ref_" + refUid });
                const rn = { id: Date.now() + Math.random(), type: "yangilik", title: L("Yangi taklif! 🎉", "Новый реферал! 🎉", "New referral!", "Жаңа рефералл! 🎉", "Жаңы реферал! 🎉", "Тавсияи нав! 🎉", "Jańa referal! 🎉"), body: (fIsm.trim()) + " " + L("sizning havolangiz orqali qo'shildi", "присоединился по вашей ссылке", "joined via your link", "сіздің сілтемеңіз арқылы қосылды", "сиздин шилтемеңиз аркылуу кошулду", "тавассути пайванди шумо ҳамроҳ шуд", "sizdiń siltemeńiz arqalı qosıldı"), sana: new Date().toISOString(), read: false };
                const rc = (await db.g("notif_" + refUid)) || [];
                await db.s("notif_" + refUid, [rn, ...rc].slice(0, 100));
              } catch (eRef) {}
            }
          }
          await db.s("x_" + fKd.trim() + "_" + uid, []); await db.s("d_" + fKd.trim() + "_" + uid, []);
          const mIds = [...new Set([...(o.azolarIds || o.azolar || []), uid])];
          o.azolarIds = mIds; o.azolar = mIds; if (!o.id) o.id = fid;
          await db.s("oila_" + fid, o); await db.s("fam_" + fid, o);
          const cV = COUNTRIES.find(c => c.code === fCountry); if (cV) { const vv = VALS.find(x => x.id === cV.val); if (vv) { setVal(vv); localStorage.setItem("oilaV7V", vv.id); } }
          localStorage.setItem("oilaV7", JSON.stringify({ uid })); setUser(nu); await loadFam(nu); setScr("bosh"); ok$(t.jf2); addStar(15, L("Oila azosi qoshildi", "Член семьи добавлен", "Family member added", "Отбасы мүшесі қосылды", "Үй-бүлө мүчөсү кошулду", "Аъзои оила илова шуд", "Oila aǵzası qosıldı"));
        } else {
          const oid = "o" + Date.now();
          setOwnerCtx(uid, oid);
          const dialC = (COUNTRIES.find(c => c.code === fCountry) || {}).dial || ""; const tel = (dialC + fTel.trim()).replace(/[^0-9+]/g, ""); const n9 = normTel(fTel);
          const nu = { id: uid, ism: fIsm.trim(), email: fEm.trim().toLowerCase(), tel, ph, oilaId: oid, rol: "bosh", rel: "bosh", photo: null };
          const no_ = { id: oid, nomi: fON.trim(), boshId: uid, azolarIds: [uid], budjet: 2000000, katLimits: {} };
          await db.s("user_" + uid, nu); if (fEm.trim()) await db.s("em_" + fEm.toLowerCase(), uid);
          if (n9) { await db.s("tel9_" + n9, uid); await db.s("tel_" + tel, uid); await db.s("tphone_" + n9, fEm.trim().toLowerCase()); }
          if (fRefCode.trim()) {
            const refUid = fRefCode.trim();
            if (refUid && refUid !== uid) {
              try {
                await db.s("refi_" + refUid + "_" + uid, { uid, ism: fIsm.trim(), sana: new Date().toISOString() }, { c: "ref_" + refUid });
                const rn = { id: Date.now() + Math.random(), type: "yangilik", title: L("Yangi taklif! 🎉", "Новый реферал! 🎉", "New referral!", "Жаңа рефералл! 🎉", "Жаңы реферал! 🎉", "Тавсияи нав! 🎉", "Jańa referal! 🎉"), body: (fIsm.trim()) + " " + L("sizning havolangiz orqali qo'shildi", "присоединился по вашей ссылке", "joined via your link", "сіздің сілтемеңіз арқылы қосылды", "сиздин шилтемеңиз аркылуу кошулду", "тавассути пайванди шумо ҳамроҳ шуд", "sizdiń siltemeńiz arqalı qosıldı"), sana: new Date().toISOString(), read: false };
                const rc = (await db.g("notif_" + refUid)) || [];
                await db.s("notif_" + refUid, [rn, ...rc].slice(0, 100));
              } catch (eRef) {}
            }
          }
          await db.s("oila_" + oid, no_); await db.s("fam_" + oid, { ...no_, azolar: no_.azolarIds }); await db.s("x_" + oid + "_" + uid, []); await db.s("d_" + oid + "_" + uid, []);
          const cV = COUNTRIES.find(c => c.code === fCountry); if (cV) { const vv = VALS.find(x => x.id === cV.val); if (vv) { setVal(vv); localStorage.setItem("oilaV7V", vv.id); } }
          localStorage.setItem("oilaV7", JSON.stringify({ uid })); setUser(nu); setOila(no_); setAzolar([nu]); setXar([]); setDar([]); setMaq([]); setScr("bosh"); ok$(t.fc3);
        }
      } else {
        const tryLogin = fTel.trim().toLowerCase();
        if (tryLogin && !tryLogin.includes("@") && !/^[0-9+ ]+$/.test(tryLogin)) {
          const look2 = await db.gFresh("kidlogin_" + tryLogin);
          const kidUid  = (typeof look2 === "object" && look2) ? look2.uid : look2;
          const kidOila2 = (typeof look2 === "object" && look2) ? (look2.oila || null) : null;
          if (kidUid) {
            buzz(15);
            try {
              if (!fbAuth.currentUser || !fbAuth.currentUser.isAnonymous) await auth.loginAnon();
            } catch (e) {}
            const anonUid2 = auth.current()?.uid;
            const phv2 = await hp(fPw);
            setOwnerCtx(kidUid, kidOila2);
            try { if (anonUid2) await db.s("ksess_" + anonUid2, { kid: kidUid, oila: kidOila2, ph: phv2 }); } catch (e) {}
            const ku = await db.g("user_" + kidUid);
            if (ku && ku.rol === "kid") {
              if (phv2 !== ku.ph) {
                try { if (anonUid2) await db.del("ksess_" + anonUid2); } catch (e) {}
                try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
                return ok$(L("Parol noto'g'ri", "Неверный пароль", "Wrong password", "Құпия сөз қате", "Сыр сөз туура эмес", "Рамз нодуруст", "Parol qáte"), "err");
              }
              try { if (anonUid2 && (ku.oilaId || null) !== kidOila2) await db.s("ksess_" + anonUid2, { kid: kidUid, oila: ku.oilaId || null, ph: phv2 }); } catch (e) {}
              setOwnerCtx(kidUid, ku.oilaId || kidOila2);
              try {
                if (ku.parentId) {
                  const pu = await db.g("user_" + ku.parentId);
                  if (pu?.oilaId && pu.oilaId !== ku.oilaId) { ku.oilaId = pu.oilaId; await db.s("user_" + ku.id, ku); }
                }
              } catch (e2) {}
              localStorage.setItem("oilaV7", JSON.stringify({ uid: ku.id, kid: true }));
              setUser(ku); await loadFam(ku); setScr("bosh");
              ok$(L("Xush kelibsiz, ", "Добро пожаловать, ", "Welcome, ", "Қош келдіңіз, ", "Кош келиңиз, ", "Хуш омадед, ", "Xosh keldińiz, ") + ku.ism + " 👋");
              return;
            }
            try { if (anonUid2) await db.del("ksess_" + anonUid2); } catch (e) {}
            try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
            return ok$(kidOila2
              ? L("Login topilmadi", "Логин не найден", "Not found", "Логин табылмады", "Логин табылган жок", "Логин ёфт нашуд", "Login tabılmadı")
              : L("Akkaunt yangilanishi kerak: ota-onangiz ilovani bir marta ochib qo'ysin.", "Нужно обновить аккаунт: попросите родителей один раз открыть приложение.", "Ask a parent to open the app once, then retry.", "Аккаунтты жаңарту керек: ата-анаңыз қолданбаны бір рет ашсын.", "Аккаунтту жаңыртуу керек: ата-энеңиз колдонмону бир жолу ачсын.", "Ҳисоб бояд навсозӣ шавад: аз волидайн хоҳед, ки барномаро як бор кушоянд.", "Akkawnttı jańalaw kerek: ata-anańız qosımshanı bir márte ashıp qoysın."), "err");
          }
          return ok$(L("Login yoki parol noto'g'ri", "Неверный логин или пароль", "Wrong login or password", "Логин немесе құпия сөз қате", "Логин же сырсөз туура эмес", "Логин ё рамз нодуруст", "Login yamasa parol qáte"), "err");
        }

        let email = fEm.trim().toLowerCase();
        if (!email && fTel.trim()) {
          const n9 = normTel(fTel);
          const foundEmail = await db.g("tphone_" + n9);
          if (foundEmail) email = foundEmail;
          else return ok$(L("Bu telefon topilmadi. Email bilan kiring yoki ro'yxatdan o'ting.", "Этот телефон не найден. Войдите по email или зарегистрируйтесь.", "Phone not found", "Бұл телефон табылмады. Email арқылы кіріңіз немесе тіркеліңіз.", "Бул телефон табылган жок. Email аркылуу кириңиз же каттооодон өтүңүз.", "Ин телефон ёфт нашуд. Бо email ворид шавед ё сабти ном кунед.", "Bul telefon tabılmadı. Email arqalı kiriń yamasa dizimnen ótiń."), "err");
        }
        if (!email || !fPw.trim()) return ok$(L("Telefon/email va parol kiriting", "Введите телефон/email и пароль", "Enter phone/email and password", "Телефон/email және парольді енгізіңіз", "Телефон/email жана сырсөздү киргизиңиз", "Телефон/email ва рамзро ворид кунед", "Telefon/email hám paroldi kiritiń"), "err");
        let authUser;
        try { authUser = await auth.login(email, fPw); }
        catch (e) {
          const msg = (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential")
            ? L("Email yoki parol noto'g'ri", "Неверный email или пароль", "Wrong email or password", "Email немесе құпия сөз қате", "Email же сырсөз туура эмес", "Email ё рамз нодуруст", "Email yamasa parol qáte")
            : e.code === "auth/user-not-found"
            ? L("Foydalanuvchi topilmadi", "Пользователь не найден", "User not found", "Пайдаланушы табылмады", "Колдонуучу табылган жок", "Корбар ёфт нашуд", "Paydalanıwshı tabılmadı")
            : e.code === "auth/too-many-requests"
            ? L("Ko'p urinish. Biroz kuting.", "Слишком много попыток. Подождите.", "Too many attempts", "Тым көп әрекет. Күте тұрыңыз.", "Өтө көп аракет. Күтө туруңуз.", "Кӯшишҳои зиёд. Каме сабр кунед.", "Tım kóp áreket. Sáytiray turıń.")
            : L("Kirishda xato: ", "Ошибка входа: ", "Login error: ", "Кіруде қате: ", "Кирүүдө ката: ", "Хатои воридшавӣ: ", "Kiriwde qátelik: ") + (e.code || e.message);
          return ok$(msg, "err");
        }
        let u = await db.g("user_" + authUser.uid);
        if (!u) { const oldUid = await db.g("em_" + email); if (oldUid) u = await db.g("user_" + oldUid); }
        if (!u) return ok$(L("Profil topilmadi", "Профиль не найден", "Profile not found", "Профиль табылмады", "Профиль табылган жок", "Профил ёфт нашуд", "Profil tabılmadı"), "err");
        localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id })); setUser(u); await loadFam(u); setScr("bosh"); ok$(t.wc + ", " + u.ism + " 👋");
      }
    } catch (err) {
      console.error("AUTH ERROR:", err);
      ok$(L("Xatolik: ", "Ошибка: ", "Error: ", "Қате: ", "Ката: ", "Хато: ", "Qátelik: ") + (err.code || err.message || "Firebase ulanmadi."), "err");
    } finally {
      authBusyRef.current = false;
    }
  };

  return (
    <div style={STY.pg}>
      <Tst msg={tst.msg} type={tst.type} th={th}/>
      <div style={{position:"fixed",top:-120,left:"50%",transform:"translateX(-50%)",width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle,"+th.ac+"1a,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{padding:"50px 24px 40px",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{margin:"0 auto 14px",display:"flex",justifyContent:"center"}}>{Ico.logo(82, true)}</div>
          <div style={{fontSize:28,fontWeight:800,letterSpacing:-0.5}}>
            {lg==="uz"||lg==="qr"
              ? <><span style={{color:th.ac}}>Oila</span><span style={{color:th.gr}}>Hisobchi</span></>
              : lg==="ru"
              ? <><span style={{color:th.ac}}>Семейный</span><span style={{color:th.gr}}>Бюджет</span></>
              : lg==="kk"
              ? <><span style={{color:th.ac}}>Отбасылық</span><span style={{color:th.gr}}>бюджет</span></>
              : lg==="ky"
              ? <><span style={{color:th.ac}}>Үй-бүлөлүк</span><span style={{color:th.gr}}>бюджет</span></>
              : lg==="tg"
              ? <><span style={{color:th.ac}}>Бюҷети</span><span style={{color:th.gr}}>оилавӣ</span></>
              : <><span style={{color:th.ac}}>Family</span><span style={{color:th.gr}}>Budget</span></>}
          </div>
          <div style={{color:th.t2,fontSize:13,marginTop:5}}>
            {L("Daromad · Xarajat · Maqsad · Oila", "Доход · Расход · Цели · Семья", "Income · Expense · Goals · Family", "Кіріс · Шығыс · Мақсаттар · Отбасы", "Киреше · Чыгым · Максаттар · Үй-бүлө", "Даромад · Хароҷот · Ҳадафҳо · Оила", "Kirim · Shıǵın · Maqset · Oila")}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:24,position:"relative",zIndex:100,flexWrap:"wrap"}}>
          {/* Custom Language Dropdown Selector */}
          <div style={{position:"relative",minWidth:165}}>
            <button onClick={()=>{ buzz(5); setShowLgDD(v=>!v); }} style={{...STY.ch(showLgDD, th.ac), padding:"8px 14px", display:"flex", alignItems:"center", gap:6, width:"100%", justifyContent:"space-between", height:"100%"}}>
              <span style={{fontSize:13}}>{(LANGS_MAP[lg] || LANGS_MAP.uz).label}</span>
              <span style={{transform:showLgDD?"rotate(180deg)":"none",transition:"transform .2s",display:"flex",alignItems:"center"}}>{Ico.chevron(th.t2,false)}</span>
            </button>
            {showLgDD && (
              <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:th.sur,border:"1.5px solid "+th.bor,borderRadius:12,maxHeight:180,overflowY:"auto",zIndex:200,boxShadow:"0 8px 24px rgba(0,0,0,.15)"}}>
                {LANG_KEYS.map(l => (
                  <button key={l} onClick={()=>{ buzz(5); setLg(l); localStorage.setItem("oilaV7L",l); setShowLgDD(false); }} style={{width:"100%",background:lg===l?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",color:lg===l?th.ac:th.t1,fontSize:13}}>
                    <span>{LANGS_MAP[l].label}</span>
                    {lg===l && Ico.check(th.ac)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={()=>{setDark(v=>!v);localStorage.setItem("oilaV7D",String(!dark));}} style={{...STY.ch(true,th.t2),padding:"8px 14px",display:"flex",alignItems:"center",gap:6,height:"100%",fontSize:13}}>{dark?Ico.sun(th.t2):Ico.moon(th.t2)}{dark?L("Kunduz","Дневной","Light","Күндізгі","Күндүзгү","Рӯзона","Kúndizgi"):L("Tungi","Ночной","Dark","Түнгі","Түнкү","Шабона","Túngi")}</button>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:18}}>
          <button onClick={()=>switchAuthMode(false,false)} style={{...STY.tb(!reg&&!kidLoginMode),fontSize:13,padding:"11px 6px"}}>{L("Kirish","Войти","Login","Кіру","Кирүү","Воридшавӣ","Kiriw")}</button>
          <button onClick={()=>switchAuthMode(true,false)} style={{...STY.tb(reg&&!kidLoginMode),fontSize:13,padding:"11px 6px"}}>{L("Ro'yxat","Регистрация","Register","Тіркеу","Каттоо","Сабтном","Dizimnen ótiw")}</button>
          <button onClick={()=>switchAuthMode(false,true)} style={{...STY.tb(kidLoginMode),fontSize:13,padding:"11px 6px",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {L("Bola","Ребёнок","Kid","Бала","Бала","Кӯдак","Bala")}
          </button>
        </div>
        <div style={STY.cd}>
          {reg&&<><label style={STY.lb}>{L("Ism familiya","Имя и фамилия","Full name","Аты-жөні","Аты-жөнү","Ном ва насаб","Atı familiyası")}</label><input style={STY.ip} value={fIsm} onChange={e=>setFIsm(e.target.value)} placeholder={L("Ism familiyangiz","Имя Фамилия","First and last name","Атыңыз бен тегіңіз","Атыңыз жана атаңыздын аты","Ному насаби шумо","Atıńız hám familiyańız")}/>
          <label style={STY.lb}>{L("Davlat","Страна","Country","Ел","Өлкө","Кишвар","Mámleket")}</label>
          <div style={{position:"relative",marginBottom:12}}>
            <button onClick={()=>setShowCountryDD(v=>!v)} style={{width:"100%",background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1,fontSize:14}}>
              {(()=>{const sc=COUNTRIES.find(c=>c.code===fCountry)||COUNTRIES[0];return <><span style={{fontSize:20}}>{sc.flag}</span><span style={{flex:1,textAlign:"left",fontWeight:600}}>{sc[lg]||sc.uz}</span><span style={{fontSize:11,color:th.t2}}>{(VALS.find(v=>v.id===sc.val)||{}).b}</span><span style={{transform:showCountryDD?"rotate(180deg)":"none",transition:"transform .2s"}}>{Ico.chevron(th.t2,false)}</span></>;})()}
            </button>
            {showCountryDD&&<div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:th.sur,border:"1.5px solid "+th.bor,borderRadius:12,maxHeight:240,overflowY:"auto",zIndex:30,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
              {COUNTRIES.map(c=>(<button key={c.code} onClick={()=>{setFCountry(c.code);setShowCountryDD(false);}} style={{width:"100%",background:fCountry===c.code?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1}}>
                <span style={{fontSize:18}}>{c.flag}</span><span style={{flex:1,textAlign:"left",fontSize:13,fontWeight:fCountry===c.code?700:500,color:fCountry===c.code?th.ac:th.t1}}>{c[lg]||c.uz}</span><span style={{fontSize:11,color:th.t2}}>{(VALS.find(v=>v.id===c.val)||{}).b}</span>{fCountry===c.code&&Ico.check(th.ac)}
              </button>))}
            </div>}
          </div>
          <label style={STY.lb}>{L("Telefon raqami","Номер телефона","Phone number","Телефон нөмірі","Телефон номери","Рақами телефон","Telefon nomeri")}</label>
          <div style={{display:"flex",gap:8,marginBottom:11}}>
            <div style={{display:"flex",alignItems:"center",gap:5,background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"0 12px",flexShrink:0}}>
              <span style={{fontSize:18}}>{(COUNTRIES.find(c=>c.code===fCountry)||COUNTRIES[0]).flag}</span>
              <span style={{fontSize:14,fontWeight:700,color:th.t1}}>{(COUNTRIES.find(c=>c.code===fCountry)||COUNTRIES[0]).dial}</span>
            </div>
            <input style={{...STY.ip,marginBottom:0,flex:1}} type="tel" value={fTel} onChange={e=>setFTel(e.target.value.replace(/[^0-9 ]/g,""))} placeholder="90 123 45 67"/>
          </div>
          {fRefCode&&<div style={{background:th.gr+"11",border:"1px solid "+th.gr+"33",borderRadius:11,padding:"10px 13px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{display:"flex",alignItems:"center",justifyContent:"center",color:th.gr}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"/><line x1="12" y1="20" x2="12" y2="8"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 8c0-3.5-3.5-3.5-3.5-1.5s3.5 1.5 3.5 1.5 3.5.5 3.5-1.5S12 4.5 12 8z"/></svg>
            </span>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:th.gr}}>{L("Taklif havolasi orqali","По реферальной ссылке","Via referral link","Рефералдық сілтеме арқылы","Реферал шилтемеси аркылуу","Тавассути пайванди тавсиявӣ","Referal siltemesi arqalı")}</div><div style={{fontSize:10,color:th.t2}}>{L("Do'stingiz sizni taklif qildi","Друг пригласил вас","Your friend invited you","Досыңыз сізді шақырды","Досуңуз сизди чакырды","Дӯстатон шуморо даъват кард","Dosıńız sizdi shaqırdı")}</div></div>
          </div>}</>}
          {/* BOLA KIRISHI: faqat login + parol */}
          {kidLoginMode&&<><div style={{textAlign:"center",marginBottom:14,display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{width:54,height:54,borderRadius:16,background:th.ac+"14",color:th.ac,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style={{fontSize:13,color:th.t2}}>{L("Ota-onang bergan login va parolni yoz","Введи логин от родителей","Enter the login your parent gave you","Ата-анаң берген логин мен парольді жаз","Ата-энең берген логин жана сырсөздү жаз","Логин ва рамзи аз волидайн гирифтаатонро нависед","Ata-anaŋ bergen login hám paroldi jaz")}</div>
          </div>
          <label style={STY.lb}>{L("Logining","Ваш логин","Your login","Логиниңіз","Логиниңиз","Логини шумо","Loginiŋiz")}</label>
          <input style={STY.ip} type="text" value={fTel} onChange={e=>setFTel(e.target.value.replace(/[^a-zA-Z0-9_]/g,"").toLowerCase())} placeholder="mohichehra25" autoFocus/></>}
          {/* ODDIY KIRISH: telefon */}
          {!reg&&!kidLoginMode&&<><label style={STY.lb}>{L("Telefon raqami","Номер телефона","Phone number","Телефон нөмірі","Телефон номери","Рақами телефон","Telefon nomeri")}</label>
          <div style={{display:"flex",gap:8,marginBottom:11}}>
            <div style={{display:"flex",alignItems:"center",gap:4,background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"0 10px",flexShrink:0,width:96}}>
              <span style={{fontSize:18}}>{(COUNTRIES.find(c=>c.dial===fDial)||{flag:"🌐"}).flag}</span>
              <input style={{background:"none",border:"none",outline:"none",color:th.t1,fontSize:14,fontWeight:700,width:52}} type="tel" value={fDial} onChange={e=>{let v=e.target.value.replace(/[^0-9+]/g,"");if(!v.startsWith("+"))v="+"+v;setFDial(v);const c=COUNTRIES.find(x=>x.dial===v);if(c)setFCountry(c.code);}} placeholder="+998"/>
            </div>
            <input style={{...STY.ip,marginBottom:0,flex:1}} type="tel" value={fTel} onChange={e=>setFTel(e.target.value.replace(/[^0-9 ]/g,""))} placeholder="90 123 45 67"/>
          </div></>}
          {reg&&<><label style={STY.lb}>{L("Email (parolni tiklash uchun)","Email (для сброса пароля)","Email (for password reset)","Email (құпия сөзді қалпына келтіру үшін)","Email (сырсөздү калыбына келтирүү үчүн)","Email (барои барқарор кардани рамз)","Email (parold qayta tiklew ushın)")}</label>
          <input style={STY.ip} type="email" value={fEm} onChange={e=>setFEm(e.target.value)} placeholder="email@example.com"/></>}
          <label style={STY.lb}>{L("Parol","Пароль","Password","Құпия сөз","Сыр сөз","Рамз","Parol")}</label>
          <div style={{position:"relative",marginBottom:reg?14:4}}>
            <input style={{...STY.ip,marginBottom:0,paddingRight:reg?108:44}} type={showPw?"text":"password"} value={fPw} onChange={e=>setFPw(e.target.value)} placeholder={reg?L("Kamida 6 belgi","Минимум 6 символов","Min 6 chars","Кемінде 6 таңба","Жок дегенде 6 белги","Ҳадди ақал 6 аломат","Eń kemi 6 belgi"):L("Parolingiz","Ваш пароль","Password","Құпия сөзіңіз","Сыр сөзүңүз","Рамзи шумо","Parolıńız")}/>
            <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:reg?64:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,padding:4}} title={showPw?L("Yashirish","Скрыть","Hide","Жасыру","Жашыруу","Пинҳон кардан","Jasırıw"):L("Ko'rsatish","Показать","Show","Көрсету","Көрсөтүү","Нишон додан","Kórsetiw")}>{showPw?"🙈":"👁"}</button>
            {reg&&<button onClick={genPassword} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:th.ac+"18",border:"1px solid "+th.ac+"44",borderRadius:8,cursor:"pointer",fontSize:11,padding:"5px 9px",color:th.ac,fontWeight:700}} title={L("Parol yaratish","Сгенерировать","Generate","Пароль жасау","Сыр сөз түзүү","Тавлиди рамз","Parol jasaw")}>🎲</button>}
          </div>
          {reg&&<>
            <div style={{display:"flex",gap:8,marginBottom:13}}>
              <button onClick={()=>setJoin(false)} style={STY.tb(!join)}>{L("Yangi oila","Новая семья","New family","Жаңа отбасы","Жаңы үй-бүлө","Оилаи нав","Jańa oila")}</button>
              <button onClick={()=>setJoin(true)} style={STY.tb(join)}>{L("Qo'shilish","Присоединиться","Join","Қосылу","Кошулуу","Ҳамроҳ шудан","Qosılıw")}</button>
            </div>
            {!join?<><label style={STY.lb}>{L("Oila nomi","Название семьи","Family name","Отбасы атауы","Үй-бүлө аты","Номи оила","Oila atı")}</label><input style={STY.ip} value={fON} onChange={e=>setFON(e.target.value)} placeholder={L("Karimov oilasi","Семья Каримовых","Family name","Каримов отбасы","Каримовдордун үй-бүлөсү","Оилаи Каримов","Karimov oilası")}/></>
            :<><label style={STY.lb}>{L("Oila kodi","Код семьи","Family code","Отбасы коды","Үй-бүлө коду","Коди оила","Oila kodı")}</label><input style={STY.ip} value={fKd} onChange={e=>setFKd(e.target.value)} placeholder={L("Bosh a'zodan oling","Получите у главы семьи","Get from head member","Отбасы басшысынан алыңыз","Үй-бүлө башчысынан алыңыз","Аз сарпарасти оила гиред","Oila basshısınan alıń")}/><div style={{background:th.ac+"11",borderRadius:11,padding:11,marginBottom:11,fontSize:12,color:th.t2}}>{L("Kodni Profil > Shaxsiy ma'lumotlar bo'limida toping","Найдите код в Профиль > Личные данные","Find code in Profile > Personal info","Кодты Профиль > Жеке деректер бөлімінен табыңыз","Кодду Профиль > Жеке маалымат бөлүмүнөн табыңыз","Кодро дар Профил > Маълумоти шахсӣ ёбед","Kodtı Profil > Jeke maǵlıwmatlar bólimi(nen) tabıń")}</div>
            <label style={STY.lb}>{L("Oila boshiga kim bo'lasiz?","Кем вы приходитесь главе?","Your relation to head","Отбасы басшысына кім боласыз?","Үй-бүлө башчысына ким болосуз?","Ба сарпарасти оила кӣ ҳастед?","Oila basshısına kim bolasız?")}</label>
            <div style={{position:"relative",marginBottom:11}}>
              <button onClick={()=>setShowRelDD(v=>!v)} style={{width:"100%",background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1,fontSize:14}}>
                {(()=>{const sr=RELATIONS.find(r=>r.id===fRel);return sr?<><span style={{fontSize:20}}>{sr.emoji}</span><span style={{flex:1,textAlign:"left",fontWeight:600}}>{sr[lg]||sr.uz}</span></>:<span style={{flex:1,textAlign:"left",color:th.t2}}>{L("Tanlang...","Выберите...","Select...","Таңдаңыз...","Тандаңыз...","Интихоб кунед...","Tańlań...")}</span>;})()}
                <span style={{transform:showRelDD?"rotate(180deg)":"none",transition:"transform .2s"}}>{Ico.chevron(th.t2,false)}</span>
              </button>
              {showRelDD&&<div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:th.sur,border:"1.5px solid "+th.bor,borderRadius:12,maxHeight:240,overflowY:"auto",zIndex:30,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
                {RELATIONS.map(r=>(<button key={r.id} onClick={()=>{setFRel(r.id);setShowRelDD(false);}} style={{width:"100%",background:fRel===r.id?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1}}>
                  <span style={{fontSize:18}}>{r.emoji}</span><span style={{flex:1,textAlign:"left",fontSize:13,fontWeight:fRel===r.id?700:500,color:fRel===r.id?th.ac:th.t1}}>{r[lg]||r.uz}</span>{fRel===r.id&&Ico.check(th.ac)}
                </button>))}
              </div>}
            </div></>}
          </>}
          <button onClick={doAuth} style={STY.bt()}>{kidLoginMode?("👶 "+L("Kirish","Войти","Login","Кіру","Кирүү","Воридшавӣ","Kiriw")):reg?L("Ro'yxatdan o'tish","Зарегистрироваться","Register","Тіркелу","Катталуу","Сабти ном шудан","Dizimnen ótiw"):L("Kirish","Войти","Login","Кіру","Кирүү","Воридшавӣ","Kiriw")}</button>
          {!kidLoginMode&&<div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0 4px"}}>
            <div style={{flex:1,height:1,background:th.bor}}/>
            <span style={{fontSize:12,color:th.t2,whiteSpace:"nowrap"}}>{L("yoki","или","or","немесе","же","ё","yamasa")}</span>
            <div style={{flex:1,height:1,background:th.bor}}/>
          </div>}
          {!kidLoginMode&&<button onClick={doGoogleLogin} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid "+th.bor,background:th.surH,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
            <span style={{fontSize:15,fontWeight:600,color:th.t1}}>{L("Google bilan kirish","Войти через Google","Continue with Google","Google арқылы кіру","Google аркылуу кирүү","Бо Google ворид шудан","Google arqalı kiriw")}</span>
          </button>}
          {!reg&&!kidLoginMode&&<button onClick={handleResetPw} style={{background:"none",border:"none",color:th.ac,cursor:"pointer",fontSize:13,fontWeight:600,marginTop:14,width:"100%",textAlign:"center",padding:"6px"}}>{L("Parolni unutdingizmi?","Забыли пароль?","Forgot password?","Құпия сөзді ұмыттыңыз ба?","Сыр сөздү унуттуңузбу?","Рамзро фаромӯш кардед?","Paroldi umıttıńız ba?")}</button>}
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "6px 12px", marginTop: 28, fontSize: 11, fontWeight: 500, letterSpacing: 0.2, textAlign: "center" }}>
          <a href={"/privacy.html?lang=" + lg} target="_blank" rel="noopener noreferrer" style={{ color: th.t3, textDecoration: "underline" }}>
            {L("Maxfiylik siyosati","Политика конфиденциальности","Privacy Policy","Құпиялық саясаты","Купуялуулук саясаты","Сиёсати махфият","Qupıyalıq siyasatı")}
          </a>
          <span style={{ color: th.bor }}>•</span>
          <a href={"/terms.html?lang=" + lg} target="_blank" rel="noopener noreferrer" style={{ color: th.t3, textDecoration: "underline" }}>
            {L("Foydalanish shartlari","Условия использования","Terms of Use","Пайдалану шарттары","Колдонуу шарттары","Шартҳои истифода","Paydalanıw shártleri")}
          </a>
          <span style={{ color: th.bor }}>•</span>
          <a href={"/child-safety.html?lang=" + lg} target="_blank" rel="noopener noreferrer" style={{ color: th.t3, textDecoration: "underline" }}>
            {L("Bolalar xavfsizligi siyosati","Политика безопасности детей","Child Safety Policy","Балалар қауіпсіздігі саясаты","Балдардын коопсуздук саясаты","Сиёсати бехатарии кӯдакон","Balalar qáwipsizligi siyasatı")}
          </a>
        </div>
      </div>
      {showResetScreen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowResetScreen(false)}>
        <div style={{background:th.bg,borderRadius:20,maxWidth:400,width:"100%",padding:"26px 22px"}} onClick={e=>e.stopPropagation()}>
          {!resetSent?<>
            <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>🔑</div>
            <div style={{fontSize:18,fontWeight:800,color:th.t1,textAlign:"center",marginBottom:8}}>{L("Parolni tiklash","Сброс пароля","Reset password","Құпия сөзді қалпына келтіру","Сыр сөздү калыбына келтирүү","Барқарор кардани рамз","Paroldi qayta tiklew")}</div>
            <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{L("Ro'yxatdan o'tgan emailingizni kiriting. Tiklash havolasini yuboramiz.","Введите ваш зарегистрированный email. Мы отправим ссылку для восстановления.","Enter your registered email.","Тіркелген email-іңізді енгізіңіз. Қалпына келтіру сілтемесін жібереміз.","Катталган email дарегиңизди киргизиңиз. Калыбына келтирүү шилтемесин жиберебиз.","Email-и сабтшудаи худро ворид кунед. Мо пайванди барқароркуниро мефиристем.","Dizimnen ótken email-iŋizdi kiritiń. Qayta tiklew siltemesin jiberemiz.")}</div>
            <label style={STY.lb}>Email</label>
            <input style={STY.ip} type="email" value={resetInput} onChange={e=>setResetInput(e.target.value)} placeholder="email@example.com" autoFocus/>
            <button onClick={sendResetEmail} style={{...STY.bt(),marginTop:6,marginBottom:10}}>{L("Tiklash xatini yuborish","Отправить","Send reset link","Қалпына келтіру хатын жіберу","Калыбына келтирүү катын жөнөтүү","Фиристодани мактуби барқарорсозӣ","Qayta tiklew xatın jiberiw")}</button>
            <button onClick={()=>setShowResetScreen(false)} style={{width:"100%",background:"transparent",border:"none",color:th.t2,cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px"}}>{L("Bekor qilish","Отмена","Cancel","Бас тарту","Жокко чыгаруу","Бекор кардан","Biykar etiw")}</button>
          </>:<>
            <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>📧</div>
            <div style={{fontSize:18,fontWeight:800,color:th.gr,textAlign:"center",marginBottom:8}}>{L("Xat yuborildi!","Письмо отправлено!","Email sent!","Хат жіберілді!","Кат жөнөтүлдү!","Мактуб фиристода шуд!","Xat jiberildi!")}</div>
            <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.7,marginBottom:8}}>{L("Parolni tiklash havolasi yuborildi:","Ссылка для сброса пароля отправлена:","Reset link sent to:","Қалпына келтіру сілтемесі жіберілді:","Калыбына келтирүү шилтемеси жөнөтүлдү:","Пайванди барқарорсозӣ фиристода шуд:","Qayta tiklew siltemesi jiberildi:")}</div>
            <div style={{fontSize:14,fontWeight:700,color:th.ac,textAlign:"center",background:th.ac+"11",borderRadius:10,padding:"10px",marginBottom:14,wordBreak:"break-all"}}>{resetInput}</div>
            <div style={{fontSize:12,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{L("📌 Pochtangizni oching va havolani bosing. Ko'rinmasa, Spam papkasini tekshiring.","Откройте почту и нажмите на ссылку. Если не видите письмо, проверьте папку Спам.","Check inbox and Spam.","Поштаңызды ашып, сілтемені басыңыз. Көрінбесе, Спам қалтасын тексеріңіз.","Почтаңызды ачып, шилтемени басыңыз. Көрүнбесе, Спам папкасын текшериңиз.","Почтаи худро кушоед ва пайвандро зер кунед. Агар нест бошад, Спамро санҷед.","Poshtańızdı ashıp, siltemeni basıń. Kórinbese, Spam qaltasın tekserіń.")}</div>
            <button onClick={()=>setShowResetScreen(false)} style={{...STY.bt(),marginBottom:0}}>{L("Tushunarli","Понятно","Got it","Түсінікті","Түшүнүктүү","Фаҳмо","Túsinikli")}</button>
          </>}
        </div>
      </div>}
    </div>
  );
}
