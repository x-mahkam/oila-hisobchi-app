const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");

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
