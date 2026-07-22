import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { MODULES } from "./registry.js";
import { useTheme } from "../lib/theme.jsx";
import { hasPermission } from "../lib/rbac.js";
import { auth, signOut } from "../lib/firebase.js";

// AppShell: chap vertikal sidebar + topbar + kontent (Outlet).
export default function AppShell({ user, role }) {
  const { theme, toggle } = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // Ruxsatga qarab ko'rinadigan modullar, guruhlab
  const groups = useMemo(() => {
    const g = new Map();
    for (const m of MODULES) {
      if (!hasPermission(role, m.permission)) continue;
      if (!g.has(m.group)) g.set(m.group, []);
      g.get(m.group).push(m);
    }
    return [...g.entries()];
  }, [role]);

  const current = MODULES.find((m) =>
    m.route === "/" ? location.pathname === "/" : location.pathname.startsWith(m.route)
  );

  return (
    <div className="layout">
      <aside className={"sidebar" + (navOpen ? " open" : "")}>
        <div className="logo">Oila Hisobchi <span>Admin</span></div>
        <nav className="nav">
          {groups.map(([group, mods]) => (
            <div key={group}>
              <div className="nav-group">{group}</div>
              {mods.map((m) => (
                <NavLink
                  key={m.id}
                  to={m.route}
                  end={m.route === "/"}
                  className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
                  onClick={() => setNavOpen(false)}
                >
                  <span className="ic">{m.icon}</span>
                  {m.title}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: "auto", padding: "12px 12px 4px", fontSize: 11, color: "var(--muted)" }}>
          v2 · Faza 0
        </div>
      </aside>

      {navOpen && <div className="drawer-overlay" style={{ zIndex: 18 }} onClick={() => setNavOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn burger" onClick={() => setNavOpen(true)}>☰</button>
          <div className="title">{current?.title || "Admin"}</div>
          <div className="spacer" />
          <button className="icon-btn" title="Tema" onClick={toggle}>
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
          <div className="who">{user.email}</div>
          <button className="btn ghost sm" onClick={() => signOut(auth)}>Chiqish</button>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
