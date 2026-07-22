import { lazy } from "react";

// ═══════════════════════════════════════════════════════════
//  MODUL REGISTRI — butun admin shu ro'yxatdan quriladi.
//  Yangi modul qo'shish = modules/<nomi>/Page.jsx + shu yerga 1 yozuv.
//  Sidebar, router va ruxsat tekshiruvi avtomatik ishlaydi.
//  group — sidebar bo'limi sarlavhasi.
// ═══════════════════════════════════════════════════════════

export const MODULES = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "📊",
    route: "/",
    group: "Asosiy",
    permission: "dashboard.read",
    component: lazy(() => import("../modules/dashboard/Page.jsx")),
  },
  {
    id: "users",
    title: "Foydalanuvchilar",
    icon: "👤",
    route: "/users",
    group: "Boshqaruv",
    permission: "users.read",
    component: lazy(() => import("../modules/users/Page.jsx")),
  },
  {
    id: "families",
    title: "Oilalar",
    icon: "👨‍👩‍👧",
    route: "/families",
    group: "Boshqaruv",
    permission: "families.read",
    component: lazy(() => import("../modules/families/Page.jsx")),
  },
  {
    id: "premium",
    title: "Premium",
    icon: "⭐",
    route: "/premium",
    group: "Boshqaruv",
    permission: "premium.write",
    component: lazy(() => import("../modules/premium/Page.jsx")),
  },
  {
    id: "i18n",
    title: "Tarjimalar",
    icon: "🌐",
    route: "/i18n",
    group: "Kontent",
    permission: "i18n.read",
    component: lazy(() => import("../modules/i18n/Page.jsx")),
  },
  {
    id: "push",
    title: "Push xabarlar",
    icon: "🔔",
    route: "/push",
    group: "Kontent",
    permission: "push.send",
    component: lazy(() => import("../modules/push/Page.jsx")),
  },
  {
    id: "settings",
    title: "Sozlamalar",
    icon: "⚙️",
    route: "/settings",
    group: "Tizim",
    permission: "config.write",
    component: lazy(() => import("../modules/settings/Page.jsx")),
  },
  // Keyingi fazalar shu yerga qo'shiladi:
  // push, ai, analytics, logs, support, backup...
];
