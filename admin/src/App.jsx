import { useEffect, useState, useCallback } from "react";
import {
  auth,
  call,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "./firebase.js";
import Stats from "./panels/Stats.jsx";
import Families from "./panels/Families.jsx";
import Translations from "./panels/Translations.jsx";

const TABS = [
  { id: "stats", label: "📊 Statistika" },
  { id: "families", label: "👨‍👩‍👧 Oilalar" },
  { id: "i18n", label: "🌐 Tarjima" },
];

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = hali aniqlanmagan
  const [tab, setTab] = useState("stats");

  // Admin ekanini tekshirish
  const [access, setAccess] = useState("checking"); // checking | ok | denied
  const [accessMsg, setAccessMsg] = useState("");
  const [initialStats, setInitialStats] = useState(null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u || null)), []);

  const probeAdmin = useCallback(async () => {
    setAccess("checking");
    try {
      const stats = await call("adminStats");
      setInitialStats(stats);
      setAccess("ok");
    } catch (e) {
      setAccess("denied");
      setAccessMsg(e.message || "Ruxsat yo'q");
    }
  }, []);

  useEffect(() => {
    if (user) probeAdmin();
  }, [user, probeAdmin]);

  if (user === undefined) {
    return <div className="loading" style={{ marginTop: 80 }}>Yuklanmoqda…</div>;
  }

  if (!user) return <Login />;

  if (access === "checking") {
    return <div className="loading" style={{ marginTop: 80 }}>Ruxsat tekshirilmoqda…</div>;
  }

  if (access === "denied") {
    return <NotAdmin uid={user.uid} email={user.email} msg={accessMsg} />;
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand">Oila Hisobchi <span>Admin</span></div>
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={"tab" + (tab === t.id ? " active" : "")}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="spacer" />
        <div className="who">{user.email}</div>
        <button className="btn ghost small" onClick={() => signOut(auth)}>Chiqish</button>
      </div>
      <div className="content">
        {tab === "stats" && <Stats initial={initialStats} onReload={probeAdmin} />}
        {tab === "families" && <Families />}
        {tab === "i18n" && <Translations />}
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw);
    } catch (e2) {
      setErr("Kirish xatosi: " + (e2?.code || e2?.message || ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>Admin panel</h1>
        <p className="sub">Oila Hisobchi — boshqaruv paneli. Admin hisobingiz bilan kiring.</p>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </div>
        <div className="field">
          <label>Parol</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
        </div>
        <button className="btn" disabled={busy}>{busy ? "Kirilmoqda…" : "Kirish"}</button>
        {err && <div className="error">{err}</div>}
      </form>
    </div>
  );
}

function NotAdmin({ uid, email, msg }) {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Ruxsat yo'q</h1>
        <p className="sub">Bu hisob admin emas. Sizni admin qilish uchun quyidagi UID'ni
          Cloud Functions muhitidagi <code>ADMIN_UIDS</code> ro'yxatiga qo'shing.</p>
        <div className="field">
          <label>Hisob</label>
          <input value={email || ""} readOnly />
        </div>
        <div className="field">
          <label>Sizning UID</label>
          <input value={uid} readOnly onFocus={(e) => e.target.select()} />
        </div>
        <p className="notice">{msg}</p>
        <button className="btn ghost" onClick={() => signOut(auth)}>Chiqish</button>
      </div>
    </div>
  );
}
