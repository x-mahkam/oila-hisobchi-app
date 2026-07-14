import { useEffect, useState, useRef } from "react";
import { db } from "../firebase.js";
import { td } from "../utils/formatters.js";
import { useApp } from "../context/AppContext.jsx";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";

export function useScreenTime() {
  const { user, oila, azolar, setNotifs, lg } = useApp();
  const isKid = user?.rol === "kid";

  const [dbMinutesToday, setDbMinutesToday] = useState(0);
  const [activeSecondsToday, setActiveSecondsToday] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [extraMinutesToday, setExtraMinutesToday] = useState(0);

  const secondsAccumulatedRef = useRef(0);
  const lastSavedMinutesRef = useRef(0);
  const isAppActiveRef = useRef(true);

  // Derived: todayMinutes is derived from activeSecondsToday / 60
  const todayMinutes = Math.floor(activeSecondsToday / 60);

  // Derived: isOverLimit
  const isOverLimit = isKid && dailyLimit > 0 && todayMinutes >= (dailyLimit + extraMinutesToday);

  // Helper function to send notification (notifyTo pattern)
  const notifyTo = async (uid, type, title, text, extra = {}) => {
    try {
      const cur = (await db.g("notif_" + uid)) || [];
      await db.s("notif_" + uid, [
        {
          id: Date.now() + Math.random(),
          type,
          title,
          text,
          sana: new Date().toISOString(),
          read: false,
          ...extra
        },
        ...cur
      ].slice(0, 100));
    } catch (e) {
      console.error("notifyTo error in useScreenTime", e);
    }
  };

  // Load screen time data from Firestore
  const loadData = async () => {
    if (!user || !user.oilaId || !user.id) return;
    try {
      const todayStr = td();

      // 1. Load limits
      const limitsData = await db.g("screentime_limits_" + user.oilaId);
      const limit = limitsData?.[user.id] ? Number(limitsData[user.id]) : 0;
      setDailyLimit(limit);

      // 2. Load extra minutes
      const extraData = await db.g("screentime_extra_" + user.oilaId);
      const extra = extraData?.[user.id]?.[todayStr] ? Number(extraData[user.id][todayStr]) : 0;
      setExtraMinutesToday(extra);

      // 3. Load actual screen time
      const screentimeData = await db.g("screentime_" + user.oilaId);
      const minutes = screentimeData?.[user.id]?.[todayStr] ? Number(screentimeData[user.id][todayStr]) : 0;
      setDbMinutesToday(minutes);

      // Initialize or synchronize local active seconds
      setActiveSecondsToday(prev => {
        const currentSeconds = prev;
        const dbSeconds = minutes * 60;
        if (dbSeconds > currentSeconds) {
          lastSavedMinutesRef.current = minutes;
          return dbSeconds;
        }
        return prev === 0 ? dbSeconds : prev;
      });

      // 4. Calculate weekly minutes
      if (screentimeData?.[user.id]) {
        let weeklySum = 0;
        const kidData = screentimeData[user.id];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().slice(0, 10);
          weeklySum += Number(kidData[dateStr] || 0);
        }
        setWeeklyMinutes(weeklySum);
      }
    } catch (e) {
      console.error("Error loading screentime data", e);
    }
  };

  // Save the accumulated delta minutes to Firestore
  const saveTimeDelta = async (deltaMins) => {
    if (!user || !user.oilaId || !user.id) return;
    try {
      const k = "screentime_" + user.oilaId;
      const data = (await db.g(k)) || {};
      if (!data[user.id]) data[user.id] = {};
      const todayStr = td();
      const currentMin = data[user.id][todayStr] || 0;
      data[user.id][todayStr] = currentMin + deltaMins;

      await db.s(k, data);

      setDbMinutesToday(data[user.id][todayStr]);
      lastSavedMinutesRef.current = data[user.id][todayStr];

      // Refresh weekly calculation
      let weeklySum = 0;
      const kidData = data[user.id];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().slice(0, 10);
        weeklySum += Number(kidData[dateStr] || 0);
      }
      setWeeklyMinutes(weeklySum);
    } catch (e) {
      console.error("Error saving screentime delta", e);
    }
  };

  // Flush accumulated time to Firestore
  const flushTime = async () => {
    const currentMins = Math.floor(activeSecondsToday / 60);
    const delta = currentMins - lastSavedMinutesRef.current;
    if (delta >= 1) {
      await saveTimeDelta(delta);
    }
  };

  // Request extra time from parent
  const requestExtraTime = async (minutes) => {
    if (!user || !oila) return;
    const boshId = oila?.boshId || azolar.find(a => a.rol === "bosh")?.id;
    if (!boshId) return;

    const kidId = user.id;
    const kidIsm = user.ism || "Farzand";
    const title = lg === "uz" ? "⏱ Qo'shimcha vaqt so'rovi" : "⏱ Запрос доп. времени";
    const text = lg === "uz"
      ? `${kidIsm} bugun uchun ${minutes} daqiqa qo'shimcha ekran vaqti so'ramoqda.`
      : `${kidIsm} запрашивает дополнительные ${minutes} мин. экранного времени на сегодня.`;

    await notifyTo(boshId, "vaqt_sorov", title, text, {
      kidId,
      kidIsm,
      requestedMinutes: Number(minutes),
      status: "pending"
    });
  };

  // Parent approves extra time
  const approveExtraTime = async (notif) => {
    if (!user || !user.oilaId) return;
    try {
      const kidId = notif.kidId || notif.extra?.kidId;
      const reqMins = Number(notif.requestedMinutes || notif.extra?.requestedMinutes || 15);
      const todayStr = td();

      // 1. Update screentime_extra_<oilaId>
      const extraKey = "screentime_extra_" + user.oilaId;
      const extraData = (await db.g(extraKey)) || {};
      if (!extraData[kidId]) extraData[kidId] = {};
      const currentExtra = extraData[kidId][todayStr] || 0;
      extraData[kidId][todayStr] = currentExtra + reqMins;
      await db.s(extraKey, extraData);

      // 2. Update notification status in parent's notifications
      const parentNotifs = (await db.g("notif_" + user.id)) || [];
      const updatedParentNotifs = parentNotifs.map(n => n.id === notif.id ? { ...n, status: "approved" } : n);
      await db.s("notif_" + user.id, updatedParentNotifs);
      setNotifs(updatedParentNotifs);

      // 3. Notify the kid
      const title = lg === "uz" ? "⏱ Qo'shimcha vaqt berildi!" : "⏱ Доп. время одобрено!";
      const text = lg === "uz"
        ? `Sizga bugun uchun ${reqMins} daqiqa qo'shimcha vaqt ajratildi!`
        : `Вам выделено дополнительные ${reqMins} мин. на сегодня!`;

      await notifyTo(kidId, "vaqt_tasdiq", title, text, {
        requestedMinutes: reqMins,
        status: "approved"
      });
    } catch (e) {
      console.error("Error approving extra time", e);
    }
  };

  // Parent denies extra time
  const denyExtraTime = async (notif) => {
    if (!user) return;
    try {
      const kidId = notif.kidId || notif.extra?.kidId;

      // 1. Update notification status in parent's notifications
      const parentNotifs = (await db.g("notif_" + user.id)) || [];
      const updatedParentNotifs = parentNotifs.map(n => n.id === notif.id ? { ...n, status: "denied" } : n);
      await db.s("notif_" + user.id, updatedParentNotifs);
      setNotifs(updatedParentNotifs);

      // 2. Notify the kid
      if (kidId) {
        const title = lg === "uz" ? "⏱ So'rov rad etildi" : "⏱ Запрос отклонен";
        const text = lg === "uz"
          ? "Qo'shimcha vaqt so'rovingiz rad etildi."
          : "Запрос на дополнительное время был отклонен.";

        await notifyTo(kidId, "vaqt_rad", title, text, {
          status: "denied"
        });
      }
    } catch (e) {
      console.error("Error denying extra time", e);
    }
  };

  // Load data initially
  useEffect(() => {
    if (user && user.oilaId) {
      loadData();
    }
  }, [user]);

  // Periodically synchronize (every 15 seconds)
  useEffect(() => {
    if (!user || !user.oilaId) return;
    const syncInterval = setInterval(() => {
      loadData();
    }, 15000);

    return () => clearInterval(syncInterval);
  }, [user]);

  // Clock tick interval (every 1 second) - only runs for kids
  useEffect(() => {
    if (!isKid || !user) return;

    const clockInterval = setInterval(() => {
      if (isAppActiveRef.current && !isOverLimit) {
        setActiveSecondsToday(prev => {
          const next = prev + 1;
          const currentMins = Math.floor(next / 60);
          const delta = currentMins - lastSavedMinutesRef.current;
          if (delta >= 1) {
            // Trigger background write to firestore
            saveTimeDelta(delta);
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [isKid, user, isOverLimit]);

  // Foreground/Background Event Listeners
  useEffect(() => {
    if (!isKid || !user) return;

    const handleVisibilityChange = () => {
      const active = document.visibilityState === "visible";
      isAppActiveRef.current = active;
      if (!active) {
        flushTime();
      }
    };

    const handleFocus = () => {
      isAppActiveRef.current = true;
    };

    const handleBlur = () => {
      isAppActiveRef.current = false;
      flushTime();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Capacitor App State
    let capListener = null;
    if (Capacitor.isNativePlatform()) {
      try {
        CapApp.addListener("appStateChange", ({ isActive }) => {
          isAppActiveRef.current = isActive;
          if (!isActive) {
            flushTime();
          }
        }).then(listener => {
          capListener = listener;
        });
      } catch (e) {
        console.warn("Capacitor App state tracking error", e);
      }
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      if (capListener) {
        try {
          capListener.remove();
        } catch (e) {}
      }
    };
  }, [isKid, user, activeSecondsToday]);

  return {
    todayMinutes,
    weeklyMinutes,
    dailyLimit,
    extraMinutesToday,
    isOverLimit,
    requestExtraTime,
    approveExtraTime,
    denyExtraTime,
    refresh: loadData
  };
}
