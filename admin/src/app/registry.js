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
    id: "families",
    title: "Oilalar",
    icon: "👨‍👩‍👧",
    route: "/families",
    group: "Boshqaruv",
    permission: "families.read",
    component: lazy(() => import("../modules/families/Page.jsx")),
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
  // Keyingi fazalar shu yerga qo'shiladi:
  // users, premium, push, ai, flags, analytics, logs, support, backup...
];
