const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");
const crypto = require("crypto");

admin.initializeApp();

const db = admin.firestore();

// Oila va fam hujjatlari uchun safeKey kodi (firebase.js bilan bir xil)
const safeKey = (k) => ("oilaV7_" + k).replace(/[+\/\\#?]/g, "_").replace(/\s/g, "_");

/**
 * 1. verifyPurchase callable Cloud Function
 */
exports.verifyPurchase = functions.https.onCall(async (data, context) => {
  // Autentifikatsiyani tekshirish
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Faqat tizimga kirgan foydalanuvchilar xaridni tekshira oladi."
    );
  }

  const { purchaseToken, productId, packageName } = data;
  if (!purchaseToken || !productId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Xaridni tekshirish uchun purchaseToken va productId talab qilinadi."
    );
  }

  // Chaqiruvchining o'z profilidan server tomonda aniqlaymiz
  const userDocRef = db.collection("appdata").doc(safeKey("user_" + context.auth.uid));
  const userDoc = await userDocRef.get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Foydalanuvchi profili topilmadi."
    );
  }

  const userData = userDoc.data()?.v || {};
  const oilaId = userData.oilaId;
  const rol = userData.rol;

  if (!oilaId) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Foydalanuvchi profilida oilaId topilmadi."
    );
  }

  if (rol !== "bosh") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Faqat oila boshlig'i premium xaridini tasdiqlay oladi."
    );
  }

  const pkgName = packageName || "com.mahakam.oilahisobchi";

  // Google Play Service Account JSON kalitini tekshirish
  const saKeyJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT;
  const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

  if (!saKeyJson) {
    if (isEmulator) {
      console.warn("[EMULATOR ONLY] GOOGLE_PLAY_SERVICE_ACCOUNT muhit o'zgaruvchisi topilmadi. Sandbox rejimida xarid faollashtirilmoqda.");
      
      // Sandbox rejimida premium maqomini faollashtirish
      await enablePremiumForOila(oilaId, productId, "sandbox_token", Date.now() + 365 * 24 * 60 * 60 * 1000);
      return {
        success: true,
        sandbox: true,
        message: "Sandbox rejimida faollashtirildi. Real to'lov uchun service account JSON qo'shing."
      };
    }

    throw new functions.https.HttpsError(
      "failed-precondition",
      "To'lov tizimi hali sozlanmagan (GOOGLE_PLAY_SERVICE_ACCOUNT yo'q). Administratorga murojaat qiling."
    );
  }

  try {
    const saKey = JSON.parse(saKeyJson);
    const auth = new google.auth.JWT(
      saKey.client_email,
      null,
      saKey.private_key,
      ["https://www.googleapis.com/auth/androidpublisher"]
    );

    const androidpublisher = google.androidpublisher({
      version: "v3",
      auth
    });

    let expiresAt = null;
    let isPurchaseValid = false;

    // Subscriptions vs Products tekshiruvi (obuna yoki bir martalik xarid)
    const isSubscription = productId.includes("monthly") || productId.includes("yearly") || productId.includes("sub");

    if (isSubscription) {
      const res = await androidpublisher.purchases.subscriptions.get({
        packageName: pkgName,
        subscriptionId: productId,
        token: purchaseToken
      });

      // expiryTimeMillis yoki startTimeMillis tekshiruvi
      const expiryMs = parseInt(res.data.expiryTimeMillis, 10);
      if (expiryMs && expiryMs > Date.now()) {
        isPurchaseValid = true;
        expiresAt = expiryMs;
      }
    } else {
      const res = await androidpublisher.purchases.products.get({
        packageName: pkgName,
        productId,
        token: purchaseToken
      });

      // purchaseState === 0 muvaffaqiyatli xaridni bildiradi
      if (res.data.purchaseState === 0) {
        isPurchaseValid = true;
        // Bir martalik xaridlar uchun (Lifetime) - muddatsiz yoki juda uzoq muddat (masalan, 100 yil keyin)
        expiresAt = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000;
      }
    }

    if (!isPurchaseValid) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Xarid haqiqiy emas yoki muddati tugagan."
      );
    }

    await enablePremiumForOila(oilaId, productId, purchaseToken, expiresAt);

    return {
      success: true,
      expiresAt,
      productId
    };

  } catch (error) {
    console.error("verifyPurchase Error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Google Play billing serverida tekshirish xatosi yuz berdi: " + error.message
    );
  }
});

/**
 * 2. RevenueCat Webhook HTTP Cloud Function
 */
exports.revenuecatWebhook = functions.https.onRequest(async (req, res) => {
  // Faqat POST so'rovlarni qabul qilish
  if (req.method !== "POST") {
    res.status(405).send("Faqat POST so'rovi qabul qilinadi.");
    return;
  }

  // ─── XAVFSIZLIK: Authorization sarlavhasini tekshirish ───────────────
  // Ilgari bu webhook HECH QANDAY tekshiruvsiz edi — istalgan odam POST
  // yuborib, istalgan app_user_id (oila) uchun premiumni bepul yoqa olardi.
  // Endi RevenueCat panelida sozlangan maxfiy kalitni (Authorization header)
  // talab qilamiz. Kalit sozlanmagan bo'lsa — YOPIQ (fail-closed), chunki
  // tekshiruvsiz premium berish to'lovsiz obunaga teng.
  const expectedAuth = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!expectedAuth) {
    console.error("revenuecatWebhook: REVENUECAT_WEBHOOK_SECRET sozlanmagan — so'rov rad etildi.");
    res.status(503).send("Webhook hali sozlanmagan.");
    return;
  }
  const gotAuth = req.get("authorization") || "";
  const a = Buffer.from(gotAuth);
  const b = Buffer.from(expectedAuth);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.warn("revenuecatWebhook: Authorization mos kelmadi — so'rov rad etildi.");
    res.status(401).send("Ruxsat berilmadi.");
    return;
  }
  // ────────────────────────────────────────────────────────────────────

  const payload = req.body;
  if (!payload || !payload.event) {
    res.status(400).send("Noto'g'ri webhook payload.");
    return;
  }

  const { type, app_user_id, product_id, expiration_at_ms } = payload.event;
  if (!app_user_id) {
    res.status(200).send("Webhook qabul qilindi, lekin app_user_id topilmadi.");
    return;
  }

  console.log(`RevenueCat Webhook: event=${type}, app_user_id=${app_user_id}, product=${product_id}`);

  try {
    // Obunani faollashtiruvchi event turlari
    const activeEvents = ["INITIAL_PURCHASE", "RENEWAL", "SUBSCRIBER_ALIAS", "RESTORE"];
    // Obunani bekor qiluvchi / tugatuvchi event turlari
    const cancelEvents = ["EXPIRATION", "CANCELLATION", "BILLING_ISSUE"];

    if (activeEvents.includes(type)) {
      const expiresAt = expiration_at_ms || (Date.now() + 365 * 24 * 60 * 60 * 1000);
      await enablePremiumForOila(app_user_id, product_id || "revenuecat_product", "revenuecat_token", expiresAt);
      console.log(`Premium faollashtirildi (oila/user: ${app_user_id})`);
    } else if (cancelEvents.includes(type)) {
      await disablePremiumForOila(app_user_id);
      console.log(`Premium bekor qilindi (oila/user: ${app_user_id})`);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("revenuecatWebhook Error:", err);
    res.status(500).send("Webhookni qayta ishlashda ichki xato: " + err.message);
  }
});

/**
 * Oila va oila-fam hujjatlarini premium qilish yordamchi funksiyasi
 */
async function enablePremiumForOila(oilaId, productId, token, expiresAt) {
  const t = Date.now();
  
  // Oila va fam hujjatlari uchun safe kalitlar
  const oilaKey = safeKey("oila_" + oilaId);
  const famKey = safeKey("fam_" + oilaId);

  // Firestore transaction yoki parallel setDoc yordamida yozamiz
  const docRefs = [
    db.collection("appdata").doc(oilaKey),
    db.collection("appdata").doc(famKey)
  ];

  for (const ref of docRefs) {
    try {
      const snap = await ref.get();
      if (snap.exists) {
        const data = snap.data();
        const currentV = data.v || {};
        
        // v ichidagi premium va boshqa billing maydonlarini yangilash
        currentV.premium = true;
        currentV.premiumProductId = productId;
        currentV.premiumExpiresAt = expiresAt;
        currentV.premiumToken = token;
        currentV.verifiedAt = t;

        await ref.set({
          v: currentV,
          t,
          _u: "system_billing",
          _o: oilaId
        }, { merge: true });
      } else {
        // Agar hujjat hali mavjud bo'lmasa, yangidan premium bilan yaratamiz
        await ref.set({
          v: {
            oilaId,
            premium: true,
            premiumProductId: productId,
            premiumExpiresAt: expiresAt,
            premiumToken: token,
            verifiedAt: t
          },
          t,
          _u: "system_billing",
          _o: oilaId
        });
      }
    } catch (e) {
      console.error(`Oila hujjatingni premium qilishda xato (${ref.id}):`, e);
    }
  }
}

/**
 * Premium maqomini o'chirish
 */
async function disablePremiumForOila(oilaId) {
  const t = Date.now();
  const oilaKey = safeKey("oila_" + oilaId);
  const famKey = safeKey("fam_" + oilaId);

  const docRefs = [
    db.collection("appdata").doc(oilaKey),
    db.collection("appdata").doc(famKey)
  ];

  for (const ref of docRefs) {
    try {
      const snap = await ref.get();
      if (snap.exists) {
        const data = snap.data();
        const currentV = data.v || {};
        
        currentV.premium = false;
        currentV.premiumExpiresAt = null;

        await ref.set({
          v: currentV,
          t,
          _u: "system_billing",
          _o: oilaId
        }, { merge: true });
      }
    } catch (e) {
      console.error(`Oila premiumini o'chirishda xato (${ref.id}):`, e);
    }
  }
}

/**
 * sendNotificationPush trigger - sends real-time FCM push notifications when a new in-app notification is created.
 */
exports.sendNotificationPush = functions.firestore
  .document("appdata/{docId}")
  .onWrite(async (change, context) => {
    const docId = context.params.docId;
    // Only target notifications (safeKey("notif_" + uid) results in "oilaV7_notif_<uid>")
    const prefix = "oilaV7_notif_";
    if (!docId.startsWith(prefix)) return null;
    const uid = docId.slice(prefix.length);

    const beforeArr = (change.before.exists ? change.before.data()?.v : []) || [];
    const afterArr = (change.after.exists ? change.after.data()?.v : []) || [];
    if (!Array.isArray(afterArr) || afterArr.length === 0) return null;

    // Detect new items added (usually prepended by notifyTo at index 0)
    const beforeIds = new Set(beforeArr.map(n => n.id));
    const newItems = afterArr.filter(n => !beforeIds.has(n.id));
    if (newItems.length === 0) return null;

    // Read target user's registered FCM tokens
    const tokDoc = await db.collection("appdata").doc(safeKey("fcm_tokens_" + uid)).get();
    const tokens = (tokDoc.exists ? tokDoc.data()?.v : []) || [];
    if (!Array.isArray(tokens) || tokens.length === 0) return null;

    // Send push for the latest notification (index 0 of newItems)
    const latest = newItems[0];
    try {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: latest.title || "Oila Hisobchi",
          body: latest.text || "",
        },
      });
    } catch (e) {
      console.error("FCM push error", e);
    }
    return null;
  });

// ═══════════════════════════════════════════════════════════════════
//  ADMIN PANEL uchun callable funksiyalar.
//  Barcha admin amallari SHU YERDA — Firestore Rules ochilmaydi.
//  Admin UID'lar ADMIN_UIDS muhit o'zgaruvchisida (vergul bilan ajratilgan).
//  Sozlash: firebase functions:config yoki .env — ADMIN_UIDS="uid1,uid2"
// ═══════════════════════════════════════════════════════════════════
const DBP = "oilaV7_";

// Faqat admin — aks holda rad. context.auth.uid ADMIN_UIDS ichida bo'lishi shart.
function assertAdmin(context) {
  const admins = (process.env.ADMIN_UIDS || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Tizimga kiring.");
  }
  if (admins.length === 0) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ADMIN_UIDS sozlanmagan. Administratorga murojaat qiling."
    );
  }
  if (!admins.includes(context.auth.uid)) {
    throw new functions.https.HttpsError("permission-denied", "Ruxsat yo'q (admin emas).");
  }
}

// docId prefiksi bo'yicha oraliq (masalan "oilaV7_user_" bilan boshlanadigan hammasi).
function prefixRange(coll, prefix) {
  return coll
    .orderBy(admin.firestore.FieldPath.documentId())
    .startAt(prefix)
    .endAt(prefix + "");
}

/**
 * ADMIN 1: Umumiy statistika (foydalanuvchi/oila/premium/bola sonlari + oxirgi ro'yxatdan o'tganlar).
 */
exports.adminStats = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const appdata = db.collection("appdata");

  // Foydalanuvchilar
  let totalUsers = 0, kids = 0, adults = 0;
  const recent = [];
  const usersSnap = await prefixRange(appdata, DBP + "user_").get();
  usersSnap.forEach((docSnap) => {
    totalUsers++;
    const v = docSnap.data().v || {};
    if (v.rol === "kid") kids++; else adults++;
    if (v.registeredAt) {
      recent.push({
        ism: v.ism || "", email: v.email || "", oilaId: v.oilaId || "",
        rol: v.rol || "", registeredAt: v.registeredAt,
      });
    }
  });

  // Oilalar (bir skan bilan premium va a'zolar sonini ham hisoblaymiz)
  let totalFamilies = 0, premiumFamilies = 0, totalMembers = 0;
  const famSnap = await prefixRange(appdata, DBP + "oila_").get();
  famSnap.forEach((docSnap) => {
    totalFamilies++;
    const v = docSnap.data().v || {};
    if (v.premium === true) premiumFamilies++;
    const ids = v.azolarIds || v.azolar || [];
    if (Array.isArray(ids)) totalMembers += ids.length;
  });

  recent.sort((a, b) => String(b.registeredAt).localeCompare(String(a.registeredAt)));

  return {
    totalUsers, adults, kids,
    totalFamilies, premiumFamilies, totalMembers,
    recent: recent.slice(0, 15),
    generatedAt: Date.now(),
  };
});

/**
 * ADMIN 2: Oilalar ro'yxati (ixtiyoriy qidiruv bilan). Har biri qisqa xulosa.
 */
exports.adminListFamilies = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const search = (data && data.search ? String(data.search) : "").toLowerCase().trim();
  const limit = Math.min(Math.max(parseInt((data && data.limit) || 200, 10), 1), 1000);

  const famSnap = await prefixRange(db.collection("appdata"), DBP + "oila_").get();
  const out = [];
  famSnap.forEach((docSnap) => {
    const v = docSnap.data().v || {};
    const oilaId = (v.id || docSnap.id.replace(DBP + "oila_", "")) || "";
    const nomi = v.nomi || "";
    if (search && !(nomi.toLowerCase().includes(search) || oilaId.toLowerCase().includes(search))) return;
    const ids = v.azolarIds || v.azolar || [];
    out.push({
      oilaId, nomi,
      boshId: v.boshId || "",
      members: Array.isArray(ids) ? ids.length : 0,
      premium: v.premium === true,
      premiumExpiresAt: v.premiumExpiresAt || null,
      premiumProductId: v.premiumProductId || null,
    });
  });
  out.sort((a, b) => Number(b.premium) - Number(a.premium) || b.members - a.members);
  return { families: out.slice(0, limit), total: out.length };
});

/**
 * ADMIN 3: Oilaga qo'lda premium berish / olib qo'yish.
 */
exports.adminSetPremium = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const oilaId = data && data.oilaId ? String(data.oilaId) : "";
  const enable = !!(data && data.enable);
  if (!oilaId) {
    throw new functions.https.HttpsError("invalid-argument", "oilaId talab qilinadi.");
  }
  if (enable) {
    const days = Math.min(Math.max(parseInt((data && data.days) || 365, 10), 1), 36500);
    const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
    await enablePremiumForOila(oilaId, "admin_manual", "admin_grant", expiresAt);
    return { success: true, premium: true, expiresAt };
  } else {
    await disablePremiumForOila(oilaId);
    return { success: true, premium: false };
  }
});

/**
 * ADMIN 4: Til tarjimalarini o'qish (translations/{lang}/sections/* birlashtirilgan).
 */
exports.adminGetTranslations = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const lang = data && data.lang ? String(data.lang) : "";
  if (!lang) throw new functions.https.HttpsError("invalid-argument", "lang talab qilinadi.");

  const merged = {};
  const sectionsSnap = await db.collection("translations").doc(lang).collection("sections").get();
  sectionsSnap.forEach((s) => {
    Object.entries(s.data() || {}).forEach(([k, v]) => { merged[k] = v; });
  });
  // Yassi hujjat (fallback tuzilma) ni ham qo'shamiz
  const flatSnap = await db.collection("translations").doc(lang).get();
  if (flatSnap.exists) {
    Object.entries(flatSnap.data() || {}).forEach(([k, v]) => {
      if (typeof v !== "object") merged[k] = v;
    });
  }

  const metaSnap = await db.collection("translations").doc("metadata").get();
  const meta = metaSnap.exists ? (metaSnap.data() || {}) : {};
  return { lang, entries: merged, languages: meta.languages || ["uz", "en", "ru"], version: meta.version || "1.0.0" };
});

/**
 * ADMIN 5: Tarjimalarni saqlash. entries = {kalit: qiymat}.
 *  translations/{lang}/sections/admin_overrides ga yoziladi (ilova o'qiydigan joy),
 *  metadata.version oshiriladi va til ro'yxatga qo'shiladi — ilova keyingi
 *  ochilishda yangi matnlarni oladi (APK shart emas).
 */
exports.adminSaveTranslations = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const lang = data && data.lang ? String(data.lang) : "";
  const entries = data && data.entries ? data.entries : null;
  if (!lang || !entries || typeof entries !== "object" || Array.isArray(entries)) {
    throw new functions.https.HttpsError("invalid-argument", "lang va entries (obyekt) talab qilinadi.");
  }
  const keys = Object.keys(entries);
  if (keys.length > 2000) {
    throw new functions.https.HttpsError("invalid-argument", "Bir martada 2000 tadan ko'p kalit bo'lmasin.");
  }

  await db.collection("translations").doc(lang).collection("sections")
    .doc("admin_overrides").set(entries, { merge: true });

  // metadata: versiyani oshirish + tilni ro'yxatga qo'shish
  const metaRef = db.collection("translations").doc("metadata");
  const metaSnap = await metaRef.get();
  const meta = metaSnap.exists ? (metaSnap.data() || {}) : {};
  const langs = Array.isArray(meta.languages) ? meta.languages : ["uz", "en", "ru"];
  if (!langs.includes(lang)) langs.push(lang);
  const bump = (v) => {
    const p = String(v || "1.0.0").split(".").map((n) => parseInt(n, 10) || 0);
    p[2] = (p[2] || 0) + 1;
    return p.join(".");
  };
  await metaRef.set({
    languages: langs,
    version: bump(meta.version),
    updatedAt: Date.now(),
    updatedBy: context.auth.uid,
  }, { merge: true });

  return { success: true, savedKeys: keys.length, lang };
});

