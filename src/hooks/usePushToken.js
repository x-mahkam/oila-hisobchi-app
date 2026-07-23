import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { db } from "../firebase.js";

export function usePushToken(userId) {
  useEffect(() => {
    if (!userId || !Capacitor.isNativePlatform()) return;

    let isSubscribed = true;

    const initPush = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive !== "granted") {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive === "granted") {
          await PushNotifications.register();
        } else {
          console.warn("Push notification permission denied.");
        }
      } catch (e) {
        console.error("Error setting up push permissions:", e);
      }
    };

    const registerListener = PushNotifications.addListener("registration", async (token) => {
      const tokVal = token?.value;
      if (!tokVal || !isSubscribed) return;

      try {
        const key = "fcm_tokens_" + userId;
        const currentTokens = (await db.gFresh(key)) || [];
        // Yangi token oxiriga; ko'pi bilan 10 ta saqlaymiz (eskilari o'lik
        // bo'ladi — server ham yuborishda o'liklarni avtomatik tozalaydi)
        const updatedTokens = Array.from(new Set([...currentTokens, tokVal])).slice(-10);
        await db.s(key, updatedTokens);
        console.log("FCM token registered successfully:", tokVal);
      } catch (e) {
        console.error("Error saving FCM token to db:", e);
      }
    });

    const errorListener = PushNotifications.addListener("registrationError", (err) => {
      console.error("Capacitor registrationError:", err);
    });

    initPush();

    return () => {
      isSubscribed = false;
      registerListener.remove();
      errorListener.remove();
    };
  }, [userId]);
}
