import { Suspense, useCallback, useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { auth, call, loginEmail, loginGoogle, signOut, onAuthStateChanged } from "./lib/firebase.js";
import { ThemeProvider } from "./lib/theme.jsx";
import { ToastProvider } from "./shared/ui.jsx";
import { resolveRole } from "./lib/rbac.js";
import { MODULES } from "./app/registry.js";
import AppShell from "./app/AppShell.jsx";

// HashRouter — /admin/ ost-yo'lida ham server sozlamasiz ishlaydi
// (URL: /admin/#/families). Vercel rewrite bilan ham mos.
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Root />
      </ToastProvider>
    </ThemeProvider>
  );
}

function Root() {
  const [user, setUser] = useState(undefined); // undefined = aniqlanmoqda
  const [access, setAccess] = useState("checking"); // checking | ok | denied
  const [accessMsg, setAccessMsg] = useState("");

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u || null)), []);

  const probe = useCallback(async () => {
    setAccess("checking");
    try {
      await call("adminStats"); // admin ekanini tekshirish (engil so'rov)
      setAccess("ok");
    } catch (e) {
      setAccessMsg(e.message || "Ruxsat yo'q");
      setAccess("denied");
    }
  }, []);

  useEffect(() => { if (user) probe(); }, [user, probe]);

  if (user === undefined) return <Center>Yuklanmoqda…</Center>;
  if (!user) return <Login />;
  if (access === "checking") return <Center>Ruxsat tekshirilmoqda…</Center>;
  if (access === "denied") return <NotAdmin user={user} msg={accessMsg} />;

  const role = resolveRole(user);

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell user={user} role={role} />}>
          {MODULES.map((m) => (
            <Route
              key={m.id}
              path={m.route === "/" ? "/" : m.route}
              element={
                <Suspense fallback={<div className="loading">Yuklanmoqda…</div>}>
                  <m.component />
                </Suspense>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

function Center({ children }) {
  return <div className="loading" style={{ marginTop: 90 }}>{children}</div>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try { await loginEmail(email.trim(), pw); }
    catch (e2) { setErr("Kirish xatosi: " + (e2?.code || e2?.message || "")); }
    finally { setBusy(false); }
  };

  const google = async () => {
    setErr(""); setBusy(true);
    try { await loginGoogle(); }
    catch (e2) { setErr("Google kirish xatosi: " + (e2?.code || e2?.message || "")); }
    finally { setBusy(false); }
  };

  return (
    <div className="center-wrap">
      <form className="center-card" onSubmit={submit}>
        <h1>Admin panel</h1>
        <p className="sub">Oila Hisobchi — boshqaruv markazi. Admin hisobingiz bilan kiring.</p>
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </div>
        <div className="field">
          <label>Parol</label>
          <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
        </div>
        <button className="btn block" disabled={busy}>{busy ? "Kirilmoqda…" : "Kirish"}</button>
        <button type="button" className="btn ghost block" style={{ marginTop: 10 }} disabled={busy} onClick={google}>
          Google bilan kirish
        </button>
        {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}
      </form>
    </div>
  );
}

function NotAdmin({ user, msg }) {
  return (
    <div className="center-wrap">
      <div className="center-card">
        <h1>Ruxsat yo'q</h1>
        <p className="sub">
          Bu hisob admin emas. Admin qilish uchun quyidagi UID'ni Cloud Functions
          muhitidagi <code>ADMIN_UIDS</code> ro'yxatiga qo'shib, funksiyalarni qayta deploy qiling.
        </p>
        <div className="field">
          <label>Hisob</label>
          <input className="input" value={user.email || "(email yo'q)"} readOnly />
        </div>
        <div className="field">
          <label>Sizning UID (nusxa oling)</label>
          <input className="input mono" value={user.uid} readOnly onFocus={(e) => e.target.select()} />
        </div>
        <p className="notice">{msg}</p>
        <button className="btn ghost block" onClick={() => signOut(auth)}>Chiqish</button>
      </div>
    </div>
  );
}
