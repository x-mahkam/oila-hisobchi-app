import { useCallback } from "react";
import { db } from "../firebase.js";
import { useApp } from "../context/AppContext.jsx";
import i18n from "../i18n/index.js";

export function useNotifications() {
  const { user, notifs, setNotifs, ok$ } = useApp();

  const markNotifRead = useCallback(async (id) => {
    const upd = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifs(upd);
    await db.s("notif_" + user.id, upd);
  }, [notifs, user]);

  const markAllRead = useCallback(async () => {
    const upd = notifs.map(n => ({ ...n, read: true }));
    setNotifs(upd);
    await db.s("notif_" + user.id, upd);
  }, [notifs, user]);

  const clearNotifs = useCallback(async () => {
    setNotifs([]);
    await db.s("notif_" + user.id, []);
    ok$(i18n.t("cleared", { defaultValue: "Tozalandi" }));
  }, [user, ok$]);

  const unreadCount = notifs.filter(n => !n.read).length;

  return { markNotifRead, markAllRead, clearNotifs, unreadCount };
}
