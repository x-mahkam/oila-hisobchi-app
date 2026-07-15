import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { db } from "../firebase.js";
import { useApp } from "../context/AppContext.jsx";
import { td } from "../utils/formatters.js";

const DAILY_REMINDER_ID = 90010;

export function useDailyReminder() {
  const { user, xar, dar, lg } = useApp();
  const [settings, setSettings] = useState({ enabled: true, hour: 20, minute: 0 });

  // Load settings from Firestore
  useEffect(() => {
    if (!user?.id) return;
    
    let active = true;
    const loadSettings = async () => {
      try {
        const key = "reminder_settings_" + user.id;
        const stored = await db.g(key);
        if (stored && active) {
          setSettings(stored);
        }
      } catch (err) {
        console.error("Error loading reminder settings:", err);
      }
    };

    loadSettings();
    return () => { active = false; };
  }, [user?.id]);

  const syncDailyReminder = useCallback(async (customSettings) => {
    if (!Capacitor.isNativePlatform()) return;
    if (!user?.id) return;

    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== "granted") {
        await LocalNotifications.requestPermissions();
      }

      const key = "reminder_settings_" + user.id;
      const latestSettings = customSettings || (await db.g(key)) || settings;

      // Always cancel existing reminder to avoid duplication
      await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] });

      if (!latestSettings.enabled) {
        return; // disabled, so we just cancelled it and exit
      }

      const { hour, minute } = latestSettings;

      // Check if logged any transaction today
      const todayStr = td();
      const hasLoggedToday = xar.some(x => x.sana === todayStr && x.uid === user.id) || 
                             dar.some(d => d.sana === todayStr && d.uid === user.id);

      const now = new Date();
      const todayScheduled = new Date();
      todayScheduled.setHours(hour, minute, 0, 0);

      let targetDate;

      if (hasLoggedToday) {
        // Already logged today. Schedule for tomorrow.
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(hour, minute, 0, 0);
        targetDate = tomorrow;
      } else {
        if (todayScheduled.getTime() > now.getTime()) {
          // Scheduled time is in the future today. Schedule for today.
          targetDate = todayScheduled;
        } else {
          // Scheduled time has passed. Schedule for tomorrow.
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(hour, minute, 0, 0);
          targetDate = tomorrow;
        }
      }

      const titleText = {
        uz: "Kunlik eslatma",
        ru: "Ежедневное напоминание",
        en: "Daily Reminder"
      }[lg] || "Daily Reminder";

      const bodyText = {
        uz: "Bugungi xarajat va daromadlaringizni kiritishni unutmang!",
        ru: "Не забудьте внести сегодняшние расходы и доходы!",
        en: "Don't forget to log today's expenses and income!"
      }[lg] || "Don't forget to log today's expenses and income!";

      await LocalNotifications.schedule({
        notifications: [
          {
            title: titleText,
            body: bodyText,
            id: DAILY_REMINDER_ID,
            schedule: { at: targetDate },
          }
        ]
      });

    } catch (err) {
      console.error("Error in syncDailyReminder:", err);
    }
  }, [user?.id, settings, xar, dar, lg]);

  const updateReminderSettings = useCallback(async (newSettings) => {
    if (!user?.id) return;
    try {
      const key = "reminder_settings_" + user.id;
      await db.s(key, newSettings);
      setSettings(newSettings);
      
      if (Capacitor.isNativePlatform()) {
        await syncDailyReminder(newSettings);
      }
    } catch (err) {
      console.error("Error updating reminder settings:", err);
    }
  }, [user?.id, syncDailyReminder]);

  return { settings, updateReminderSettings, syncDailyReminder };
}
