import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { KatIco, DarIco, MoneyInput, Tst } from "../components/common/index.jsx";
import { Ico } from "../utils/icons.jsx";
import { COUNTRIES, VALS, RELATIONS, TL } from "../utils/constants.js";
import { td, nt, normTel, hp } from "../utils/formatters.js";
import { db, auth, setOwnerCtx, fbAuth } from "../firebase.js";
import { fetchLanguageList } from "../i18n/translationService.js";

const FALLBACK_LANGS = [
  { code: "uz", nativeName: "O'zbekcha", flag: "🇺🇿" },
  { code: "en", nativeName: "English", flag: "🇬🇧" },
  { code: "ru", nativeName: "Русский", flag: "🇷🇺" },
];

export default function LoginPage() {
  const {
    user, setUser, oila, setOila, azolar, setAzolar,
    setXar, setDar, setMaq, setScr, setBoot, val, setVal,
    dark, setDark, lg, setLg, th, t, ok$, buzz, addStar,
    tst,
  } = useApp();

  const { loadFam } = useAuth();
  const authBusyRef = useRef(false);

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

  // Til ro'yxati Firestore'dagi "languages" kolleksiyasidan (enabled: true).
  const [langList, setLangList] = useState(null);
  useEffect(() => {
    let alive = true;
    fetchLanguageList().then((list) => { if (alive && list.length) setLangList(list); });
    return () => { alive = false; };
  }, []);
  const langs = langList || FALLBACK_LANGS;
  const currentLang = langs.find((l) => l.code === lg) || langs[0];

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
    setFPw(p); setShowPw(true); ok$(t("log001"));
  };

  const handleResetPw = () => { setResetInput(fEm.trim() || ""); setResetSent(false); setShowResetScreen(true); };

  const sendResetEmail = async () => {
    const email = resetInput.trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return ok$(t("log002"), "err");
    let exists = false;
    try { const uid = await db.gFresh("em_" + email); if (uid) exists = true; } catch (e) { exists = false; }
    if (!exists) {
      ok$(t("log003"), "err");
      setTimeout(() => { setShowResetScreen(false); setReg(true); setFEm(email); }, 1600);
      return;
    }
    try { await auth.resetPassword(email); setResetSent(true); }
    catch (e) { ok$(t("log_errCode", { msg: e.code || e.message }), "err"); }
  };

  const googleJoinFamily = async (gUser, code) => {
    const uid = gUser.uid;
    const displayName = gUser.displayName || gUser.email?.split("@")[0] || t("log_userFallback");
    const email = (gUser.email || "").toLowerCase();
    setOwnerCtx(uid, code);
    let o = await db.g("oila_" + code);
    if (!o) o = await db.g("fam_" + code);
    if (!o) {
      setOwnerCtx(null, null); try { await auth.logout(); } catch (e) {}
      ok$(t("log_familyNotFound", { code }), "err");
      return null;
    }
    if ((o.azolarIds || o.azolar || []).length >= 2 && !o.premium) {
      setOwnerCtx(null, null); try { await auth.logout(); } catch (e) {}
      ok$(t("log004"), "err");
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
      const displayName = gUser.displayName || gUser.email?.split("@")[0] || t("log_userFallback");
      const email = (gUser.email || "").toLowerCase();
      const famId = "fam_" + uid + "_" + Date.now();
      setOwnerCtx(uid, famId);
      u = { id: uid, oilaId: famId, ism: displayName, email, tel: "", photo: gUser.photoURL || null, rol: "bosh", val: "uzs", lg, dark, registeredAt: new Date().toISOString(), loginMethod: "google" };
      await db.s("user_" + uid, u);
      const gFam = { id: famId, nomi: t("log_familySuffix", { name: displayName }), boshId: uid, azolar: [uid], azolarIds: [uid], budjet: 2000000, katLimits: {}, yaratilgan: new Date().toISOString() };
      await db.s("fam_" + famId, gFam); await db.s("oila_" + famId, gFam);
      if (email) await db.s("em_" + email, uid);
    }
    localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id }));
    setUser(u); await loadFam(u); setScr("bosh");
    ok$(t("log_welcome", { name: u.ism }));
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
        ok$(t("log_googleErr", { msg: e.message || e.code }), "err");
      }
    }
  };

  const doAuth = async () => {
    authBusyRef.current = true;
    try {
      if (kidLoginMode) {
        const loginKey = fTel.trim().toLowerCase();
        if (!loginKey || !fPw.trim()) return ok$(t("log005"), "err");
        const look = await db.gFresh("kidlogin_" + loginKey);
        if (!look) return ok$(t("log006"), "err");
        const kidUid  = (typeof look === "object" && look) ? look.uid : look;
        const kidOila = (typeof look === "object" && look) ? (look.oila || null) : null;
        if (!kidUid) return ok$(t("log006"), "err");
        buzz(15);
        try {
          if (!fbAuth.currentUser || !fbAuth.currentUser.isAnonymous) await auth.loginAnon();
        } catch (e) { console.error("Anon login:", e); return ok$(t("log007"), "err"); }
        const anonUid = auth.current()?.uid;
        const phv = await hp(fPw);
        setOwnerCtx(kidUid, kidOila);
        try {
          if (anonUid) await db.s("ksess_" + anonUid, { kid: kidUid, oila: kidOila, ph: phv });
        } catch (e) {
          try { await auth.logout(); } catch (e2) {}
          return ok$(t("log008"), "err");
        }
        const ku = await db.g("user_" + kidUid);
        if (!ku || ku.rol !== "kid") {
          try { if (anonUid) await db.del("ksess_" + anonUid); } catch (e) {}
          try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
          return ok$(kidOila ? t("log009") : t("log010"), "err");
        }
        if (phv !== ku.ph) {
          try { if (anonUid) await db.del("ksess_" + anonUid); } catch (e) {}
          try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
          return ok$(t("log011"), "err");
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
        ok$(t("log_welcome", { name: ku.ism }));
        return;
      }
      if (reg) {
        if (!fIsm.trim() || !fTel.trim() || fPw.length < 6) return ok$(t("log012"), "err");
        if (!fEm.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fEm.trim())) return ok$(t("log002"), "err");
        if (await db.g("tel9_" + normTel(fTel))) return ok$(t("log013"), "err");

        if (join) {
          if (!fKd.trim()) return ok$(t.fa, "err");
        } else {
          if (!fON.trim()) return ok$(t.fa, "err");
        }

        let authUser;
        try { authUser = await auth.register(fEm.trim().toLowerCase(), fPw); }
        catch (e) {
          const msg = e.code === "auth/email-already-in-use" ? t("log014") : e.code === "auth/weak-password" ? t("log015") : t("log_registerErr", { msg: e.code || e.message });
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
            return ok$(t("log004"), "err");
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
                const rn = { id: Date.now() + Math.random(), type: "yangilik", title: t("log016"), body: fIsm.trim() + " " + t("log017"), sana: new Date().toISOString(), read: false };
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
          localStorage.setItem("oilaV7", JSON.stringify({ uid })); setUser(nu); await loadFam(nu); setScr("bosh"); ok$(t.jf2); addStar(15, t("log018"));
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
                const rn = { id: Date.now() + Math.random(), type: "yangilik", title: t("log016"), body: fIsm.trim() + " " + t("log017"), sana: new Date().toISOString(), read: false };
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
                return ok$(t("log011"), "err");
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
              ok$(t("log_welcome", { name: ku.ism }));
              return;
            }
            try { if (anonUid2) await db.del("ksess_" + anonUid2); } catch (e) {}
            try { await auth.deleteCurrentUser(); } catch (e) { try { await auth.logout(); } catch (e2) {} }
            return ok$(kidOila2 ? t("log009") : t("log010"), "err");
          }
          return ok$(t("log019"), "err");
        }

        let email = fEm.trim().toLowerCase();
        if (!email && fTel.trim()) {
          const n9 = normTel(fTel);
          const foundEmail = await db.g("tphone_" + n9);
          if (foundEmail) email = foundEmail;
          else return ok$(t("log020"), "err");
        }
        if (!email || !fPw.trim()) return ok$(t("log021"), "err");
        let authUser;
        try { authUser = await auth.login(email, fPw); }
        catch (e) {
          const msg = (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") ? t("log022") : e.code === "auth/user-not-found" ? t("log023") : e.code === "auth/too-many-requests" ? t("log024") : t("log_loginErr", { msg: e.code || e.message });
          return ok$(msg, "err");
        }
        let u = await db.g("user_" + authUser.uid);
        if (!u) { const oldUid = await db.g("em_" + email); if (oldUid) u = await db.g("user_" + oldUid); }
        if (!u) return ok$(t("log025"), "err");
        localStorage.setItem("oilaV7", JSON.stringify({ uid: u.id })); setUser(u); await loadFam(u); setScr("bosh"); ok$(t.wc + ", " + u.ism + " 👋");
      }
    } catch (err) {
      console.error("AUTH ERROR:", err);
      ok$(t("log_genericErr", { msg: err.code || err.message || t("log075") }), "err");
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
          <div style={{fontSize:28,fontWeight:800,letterSpacing:-0.5}}><span style={{color:th.ac}}>{t("log026")}</span><span style={{color:th.gr}}>{t("log027")}</span></div>
          <div style={{color:th.t2,fontSize:13,marginTop:5}}>{t("log028")}</div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:24,position:"relative",zIndex:100,flexWrap:"wrap"}}>
          {/* Custom Language Dropdown Selector */}
          <div style={{position:"relative",minWidth:165}}>
            <button onClick={()=>{ buzz(5); setShowLgDD(v=>!v); }} style={{...STY.ch(showLgDD, th.ac), padding:"8px 14px", display:"flex", alignItems:"center", gap:6, width:"100%", justifyContent:"space-between", height:"100%"}}>
              <span style={{fontSize:13}}>{currentLang.flag} {currentLang.nativeName}</span>
              <span style={{transform:showLgDD?"rotate(180deg)":"none",transition:"transform .2s",display:"flex",alignItems:"center"}}>{Ico.chevron(th.t2,false)}</span>
            </button>
            {showLgDD && (
              <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:th.sur,border:"1.5px solid "+th.bor,borderRadius:12,maxHeight:180,overflowY:"auto",zIndex:200,boxShadow:"0 8px 24px rgba(0,0,0,.15)"}}>
                {langs.map(l => (
                  <button key={l.code} onClick={()=>{ buzz(5); setLg(l.code); setShowLgDD(false); }} style={{width:"100%",background:lg===l.code?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",color:lg===l.code?th.ac:th.t1,fontSize:13}}>
                    <span>{l.flag} {l.nativeName}</span>
                    {lg===l.code && Ico.check(th.ac)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={()=>{setDark(v=>!v);localStorage.setItem("oilaV7D",String(!dark));}} style={{...STY.ch(true,th.t2),padding:"8px 14px",display:"flex",alignItems:"center",gap:6,height:"100%",fontSize:13}}>{dark?Ico.sun(th.t2):Ico.moon(th.t2)}{dark?t("log029"):t("log030")}</button>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:18}}>
          <button onClick={()=>switchAuthMode(false,false)} style={{...STY.tb(!reg&&!kidLoginMode),fontSize:13,padding:"11px 6px"}}>{t("log031")}</button>
          <button onClick={()=>switchAuthMode(true,false)} style={{...STY.tb(reg&&!kidLoginMode),fontSize:13,padding:"11px 6px"}}>{t("log032")}</button>
          <button onClick={()=>switchAuthMode(false,true)} style={{...STY.tb(kidLoginMode),fontSize:13,padding:"11px 6px",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {t("log033")}
          </button>
        </div>
        <div style={STY.cd}>
          {reg&&<><label style={STY.lb}>{t("log034")}</label><input style={STY.ip} value={fIsm} onChange={e=>setFIsm(e.target.value)} placeholder={t("log035")}/>
          <label style={STY.lb}>{t("log036")}</label>
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
          <label style={STY.lb}>{t("log037")}</label>
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
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:th.gr}}>{t("log038")}</div><div style={{fontSize:10,color:th.t2}}>{t("log039")}</div></div>
          </div>}</>}
          {/* BOLA KIRISHI: faqat login + parol */}
          {kidLoginMode&&<><div style={{textAlign:"center",marginBottom:14,display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{width:54,height:54,borderRadius:16,background:th.ac+"14",color:th.ac,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style={{fontSize:13,color:th.t2}}>{t("log040")}</div>
          </div>
          <label style={STY.lb}>{t("log041")}</label>
          <input style={STY.ip} type="text" value={fTel} onChange={e=>setFTel(e.target.value.replace(/[^a-zA-Z0-9_]/g,"").toLowerCase())} placeholder="mohichehra25" autoFocus/></>}
          {/* ODDIY KIRISH: telefon */}
          {!reg&&!kidLoginMode&&<><label style={STY.lb}>{t("log037")}</label>
          <div style={{display:"flex",gap:8,marginBottom:11}}>
            <div style={{display:"flex",alignItems:"center",gap:4,background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"0 10px",flexShrink:0,width:96}}>
              <span style={{fontSize:18}}>{(COUNTRIES.find(c=>c.dial===fDial)||{flag:"🌐"}).flag}</span>
              <input style={{background:"none",border:"none",outline:"none",color:th.t1,fontSize:14,fontWeight:700,width:52}} type="tel" value={fDial} onChange={e=>{let v=e.target.value.replace(/[^0-9+]/g,"");if(!v.startsWith("+"))v="+"+v;setFDial(v);const c=COUNTRIES.find(x=>x.dial===v);if(c)setFCountry(c.code);}} placeholder="+998"/>
            </div>
            <input style={{...STY.ip,marginBottom:0,flex:1}} type="tel" value={fTel} onChange={e=>setFTel(e.target.value.replace(/[^0-9 ]/g,""))} placeholder="90 123 45 67"/>
          </div></>}
          {reg&&<><label style={STY.lb}>{t("log042")}</label>
          <input style={STY.ip} type="email" value={fEm} onChange={e=>setFEm(e.target.value)} placeholder="email@example.com"/></>}
          <label style={STY.lb}>{t("log043")}</label>
          <div style={{position:"relative",marginBottom:reg?14:4}}>
            <input style={{...STY.ip,marginBottom:0,paddingRight:reg?108:44}} type={showPw?"text":"password"} value={fPw} onChange={e=>setFPw(e.target.value)} placeholder={reg?t("log044"):t("log045")}/>
            <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:reg?64:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,padding:4}} title={showPw?t("log046"):t("log047")}>{showPw?"🙈":"👁"}</button>
            {reg&&<button onClick={genPassword} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:th.ac+"18",border:"1px solid "+th.ac+"44",borderRadius:8,cursor:"pointer",fontSize:11,padding:"5px 9px",color:th.ac,fontWeight:700}} title={t("log048")}>🎲</button>}
          </div>
          {reg&&<>
            <div style={{display:"flex",gap:8,marginBottom:13}}>
              <button onClick={()=>setJoin(false)} style={STY.tb(!join)}>{t("log049")}</button>
              <button onClick={()=>setJoin(true)} style={STY.tb(join)}>{t("log050")}</button>
            </div>
            {!join?<><label style={STY.lb}>{t("log051")}</label><input style={STY.ip} value={fON} onChange={e=>setFON(e.target.value)} placeholder={t("log052")}/></>
            :<><label style={STY.lb}>{t("log053")}</label><input style={STY.ip} value={fKd} onChange={e=>setFKd(e.target.value)} placeholder={t("log054")}/><div style={{background:th.ac+"11",borderRadius:11,padding:11,marginBottom:11,fontSize:12,color:th.t2}}>{t("log055")}</div>
            <label style={STY.lb}>{t("log056")}</label>
            <div style={{position:"relative",marginBottom:11}}>
              <button onClick={()=>setShowRelDD(v=>!v)} style={{width:"100%",background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1,fontSize:14}}>
                {(()=>{const sr=RELATIONS.find(r=>r.id===fRel);return sr?<><span style={{fontSize:20}}>{sr.emoji}</span><span style={{flex:1,textAlign:"left",fontWeight:600}}>{sr[lg]||sr.uz}</span></>:<span style={{flex:1,textAlign:"left",color:th.t2}}>{t("log057")}</span>;})()}
                <span style={{transform:showRelDD?"rotate(180deg)":"none",transition:"transform .2s"}}>{Ico.chevron(th.t2,false)}</span>
              </button>
              {showRelDD&&<div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:th.sur,border:"1.5px solid "+th.bor,borderRadius:12,maxHeight:240,overflowY:"auto",zIndex:30,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
                {RELATIONS.map(r=>(<button key={r.id} onClick={()=>{setFRel(r.id);setShowRelDD(false);}} style={{width:"100%",background:fRel===r.id?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1}}>
                  <span style={{fontSize:18}}>{r.emoji}</span><span style={{flex:1,textAlign:"left",fontSize:13,fontWeight:fRel===r.id?700:500,color:fRel===r.id?th.ac:th.t1}}>{r[lg]||r.uz}</span>{fRel===r.id&&Ico.check(th.ac)}
                </button>))}
              </div>}
            </div></>}
          </>}
          <button onClick={doAuth} style={STY.bt()}>{kidLoginMode?t("log058"):reg?t("log059"):t("log031")}</button>
          {!kidLoginMode&&<div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0 4px"}}>
            <div style={{flex:1,height:1,background:th.bor}}/>
            <span style={{fontSize:12,color:th.t2,whiteSpace:"nowrap"}}>{t("log061")}</span>
            <div style={{flex:1,height:1,background:th.bor}}/>
          </div>}
          {!kidLoginMode&&<button onClick={doGoogleLogin} style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"1.5px solid "+th.bor,background:th.surH,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
            <span style={{fontSize:15,fontWeight:600,color:th.t1}}>{t("log062")}</span>
          </button>}
          {!reg&&!kidLoginMode&&<button onClick={handleResetPw} style={{background:"none",border:"none",color:th.ac,cursor:"pointer",fontSize:13,fontWeight:600,marginTop:14,width:"100%",textAlign:"center",padding:"6px"}}>{t("log063")}</button>}
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "6px 12px", marginTop: 28, fontSize: 11, fontWeight: 500, letterSpacing: 0.2, textAlign: "center" }}>
          <a href={"/privacy.html?lang=" + lg} target="_blank" rel="noopener noreferrer" style={{ color: th.t3, textDecoration: "underline" }}>
            {t("log064")}
          </a>
          <span style={{ color: th.bor }}>•</span>
          <a href={"/terms.html?lang=" + lg} target="_blank" rel="noopener noreferrer" style={{ color: th.t3, textDecoration: "underline" }}>
            {t("log065")}
          </a>
          <span style={{ color: th.bor }}>•</span>
          <a href={"/child-safety.html?lang=" + lg} target="_blank" rel="noopener noreferrer" style={{ color: th.t3, textDecoration: "underline" }}>
            {t("log066")}
          </a>
        </div>
      </div>
      {showResetScreen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowResetScreen(false)}>
        <div style={{background:th.bg,borderRadius:20,maxWidth:400,width:"100%",padding:"26px 22px"}} onClick={e=>e.stopPropagation()}>
          {!resetSent?<>
            <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>🔑</div>
            <div style={{fontSize:18,fontWeight:800,color:th.t1,textAlign:"center",marginBottom:8}}>{t("log067")}</div>
            <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{t("log068")}</div>
            <label style={STY.lb}>Email</label>
            <input style={STY.ip} type="email" value={resetInput} onChange={e=>setResetInput(e.target.value)} placeholder="email@example.com" autoFocus/>
            <button onClick={sendResetEmail} style={{...STY.bt(),marginTop:6,marginBottom:10}}>{t("log069")}</button>
            <button onClick={()=>setShowResetScreen(false)} style={{width:"100%",background:"transparent",border:"none",color:th.t2,cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px"}}>{t("log070")}</button>
          </>:<>
            <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>📧</div>
            <div style={{fontSize:18,fontWeight:800,color:th.gr,textAlign:"center",marginBottom:8}}>{t("log071")}</div>
            <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.7,marginBottom:8}}>{t("log072")}</div>
            <div style={{fontSize:14,fontWeight:700,color:th.ac,textAlign:"center",background:th.ac+"11",borderRadius:10,padding:"10px",marginBottom:14,wordBreak:"break-all"}}>{resetInput}</div>
            <div style={{fontSize:12,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{t("log073")}</div>
            <button onClick={()=>setShowResetScreen(false)} style={{...STY.bt(),marginBottom:0}}>{t("log074")}</button>
          </>}
        </div>
      </div>}
    </div>
  );
}
