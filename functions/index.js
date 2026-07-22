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

// ── Audit log: har muhim admin amali yozib boriladi ──
// audit_log/{auto} = { t, uid, email, action, detail }
async function logAdmin(context, action, detail) {
  try {
    await db.collection("audit_log").add({
      t: Date.now(),
      uid: context.auth?.uid || null,
      email: context.auth?.token?.email || null,
      action,
      detail: detail || {},
    });
  } catch (e) {
    console.error("audit_log yozishda xato:", e); // amalni to'xtatmaydi
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
    await logAdmin(context, "premium.grant", { oilaId, days });
    return { success: true, premium: true, expiresAt };
  } else {
    await disablePremiumForOila(oilaId);
    await logAdmin(context, "premium.revoke", { oilaId });
    return { success: true, premium: false };
  }
});

/**
 * ADMIN 4: Til tarjimalarini o'qish (translations/{lang}/sections/* birlashtirilgan).
 */
// ═══ I18N v2 — ilova HAQIQATAN o'qiydigan format ═══
// Ilova (src/i18n/translationService.js):
//   translations/{lang}            — "translation" namespace  { version, updatedAt, data }
//   translations/{lang}__{ns}      — boshqa namespace'lar     { version, updatedAt, data }
//   i18n_meta/current              — { versions: { "<id>": <raqam> } }  (id = lang yoki lang__ns)
//   languages                      — { code, name, enabled, sort } (til tanlash ro'yxati)
// Saqlash = versiya +1 → ilova keyingi ochilishda yangi matnni oladi (publish).
const I18N_NAMESPACES = ["translation", "goals", "budgetai", "garden", "wedding", "bilimbozor"];
const i18nBundleId = (lang, ns) => (ns === "translation" ? lang : `${lang}__${ns}`);

/**
 * ADMIN 4/5: Tarjima boshqaruvi (bitta ko'p amalli funksiya).
 * data.op:
 *  "meta"        → namespace'lar, tillar ro'yxati, joriy versiyalar
 *  "get"         → { lang, ns } → bundle { version, data }
 *  "save"        → { lang, ns, entries, replace? } → merge (yoki to'liq almashtirish) + versiya +1 (publish)
 *  "addLanguage" → { code, name } → languages ro'yxatiga qo'shish
 *  "toggleLanguage" → { code } → tilni yoqish/o'chirish
 */
exports.adminI18n = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const op = data?.op ? String(data.op) : "meta";

  if (op === "meta") {
    const metaSnap = await db.collection("i18n_meta").doc("current").get();
    const versions = metaSnap.exists ? (metaSnap.data().versions || {}) : {};
    const langs = [];
    try {
      const lSnap = await db.collection("languages").get();
      lSnap.forEach((d) => { const v = d.data(); langs.push({ code: v.code || d.id, name: v.name || v.nomi || d.id, enabled: v.enabled !== false, sort: v.sort || 0 }); });
      langs.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    } catch (e) { console.warn("languages o'qish:", e.message); }
    if (langs.length === 0) {
      // Hali languages kolleksiyasi bo'lmasa — build ichidagi standart uchlik
      for (const c of ["uz", "ru", "en"]) langs.push({ code: c, name: c.toUpperCase(), enabled: true, sort: 0 });
    }
    return { namespaces: I18N_NAMESPACES, languages: langs, versions };
  }

  if (op === "get") {
    const lang = data?.lang ? String(data.lang) : "";
    const ns = data?.ns ? String(data.ns) : "translation";
    if (!lang) throw new functions.https.HttpsError("invalid-argument", "lang talab qilinadi.");
    const snap = await db.collection("translations").doc(i18nBundleId(lang, ns)).get();
    if (!snap.exists) return { lang, ns, version: 0, data: {} };
    const b = snap.data();
    return { lang, ns, version: b.version || 0, data: b.data || {} };
  }

  if (op === "save") {
    const lang = data?.lang ? String(data.lang) : "";
    const ns = data?.ns ? String(data.ns) : "translation";
    const entries = data?.entries;
    const replace = data?.replace === true;
    if (!lang || !entries || typeof entries !== "object" || Array.isArray(entries)) {
      throw new functions.https.HttpsError("invalid-argument", "lang va entries (obyekt) talab qilinadi.");
    }
    if (Object.keys(entries).length > 5000) {
      throw new functions.https.HttpsError("invalid-argument", "Bir martada 5000 tadan ko'p kalit bo'lmasin.");
    }
    const id = i18nBundleId(lang, ns);
    const ref = db.collection("translations").doc(id);
    const snap = await ref.get();
    const cur = snap.exists ? (snap.data() || {}) : {};
    const newData = replace ? { ...entries } : { ...(cur.data || {}), ...entries };
    const newVersion = (Number(cur.version) || 0) + 1;
    await ref.set({ version: newVersion, updatedAt: Date.now(), data: newData });
    // i18n_meta/current.versions — ilova aynan shu raqamga qarab yangilanadi
    await db.collection("i18n_meta").doc("current").set(
      { versions: { [id]: newVersion } }, { merge: true }
    );
    await logAdmin(context, "i18n.save", { lang, ns, keys: Object.keys(entries).length, version: newVersion, replace });
    return { success: true, lang, ns, version: newVersion, totalKeys: Object.keys(newData).length };
  }

  if (op === "addLanguage") {
    const code = (data?.code ? String(data.code) : "").toLowerCase().replace(/[^a-z]/g, "").slice(0, 5);
    const name = data?.name ? String(data.name).slice(0, 40) : code.toUpperCase();
    if (!code) throw new functions.https.HttpsError("invalid-argument", "Til kodi kiriting (masalan: kk).");
    await db.collection("languages").doc(code).set({ code, name, enabled: true, sort: Date.now() }, { merge: true });
    await logAdmin(context, "i18n.addLanguage", { code, name });
    return { success: true, code };
  }

  if (op === "toggleLanguage") {
    const code = (data?.code ? String(data.code) : "").toLowerCase();
    if (!code) throw new functions.https.HttpsError("invalid-argument", "code talab qilinadi.");
    const ref = db.collection("languages").doc(code);
    const snap = await ref.get();
    const cur = snap.exists ? snap.data() : { code, name: code.toUpperCase(), sort: Date.now() };
    const enabled = !(cur.enabled !== false);
    await ref.set({ ...cur, enabled }, { merge: true });
    await logAdmin(context, "i18n.toggleLanguage", { code, enabled });
    return { success: true, code, enabled };
  }

  throw new functions.https.HttpsError("invalid-argument", "Noma'lum op: " + op);
});

/**
 * ADMIN 6: Dashboard v2 — DAU/WAU/MAU, ro'yxatdan o'tish grafigi,
 * platforma/til taqsimoti, so'nggi admin amallari (audit feed).
 *
 * Manba: act_<uid> hujjatlari (ilova kuniga 1 marta yozadi) + user_ +
 * oila_ skanlari + audit_log. Bitta chaqiruvda dashboard uchun hammasi.
 */
exports.adminDashboard = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const appdata = db.collection("appdata");
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  // 1) Foydalanuvchilar: totals + ro'yxatdan o'tish seriyasi (90 kun) + tillar
  let totalUsers = 0, kids = 0, adults = 0;
  const regByDay = {};
  const recent = [];
  const usersSnap = await prefixRange(appdata, DBP + "user_").get();
  usersSnap.forEach((docSnap) => {
    totalUsers++;
    const v = docSnap.data().v || {};
    if (v.rol === "kid") kids++; else adults++;
    if (v.registeredAt) {
      const dayKey = String(v.registeredAt).slice(0, 10);
      if (now - new Date(dayKey).getTime() <= 90 * DAY) {
        regByDay[dayKey] = (regByDay[dayKey] || 0) + 1;
      }
      recent.push({ ism: v.ism || "", email: v.email || "", rol: v.rol || "", oilaId: v.oilaId || "", registeredAt: v.registeredAt });
    }
  });
  recent.sort((a, b) => String(b.registeredAt).localeCompare(String(a.registeredAt)));

  // 2) Faollik (act_): DAU/WAU/MAU + platforma + til taqsimoti
  let dau = 0, wau = 0, mau = 0;
  const platforms = {}, langs = {};
  const actSnap = await prefixRange(appdata, DBP + "act_").get();
  actSnap.forEach((docSnap) => {
    const v = docSnap.data().v || {};
    const t = Number(v.t || 0);
    if (!t) return;
    const age = now - t;
    if (age <= DAY) dau++;
    if (age <= 7 * DAY) wau++;
    if (age <= 30 * DAY) {
      mau++;
      platforms[v.platform || "?"] = (platforms[v.platform || "?"] || 0) + 1;
      langs[v.lg || "?"] = (langs[v.lg || "?"] || 0) + 1;
    }
  });

  // 3) Oilalar: jami + premium (mahsulot bo'yicha)
  let totalFamilies = 0, premiumFamilies = 0;
  const premiumByProduct = {};
  const famSnap = await prefixRange(appdata, DBP + "oila_").get();
  famSnap.forEach((docSnap) => {
    totalFamilies++;
    const v = docSnap.data().v || {};
    if (v.premium === true) {
      premiumFamilies++;
      const p = v.premiumProductId || "noma'lum";
      premiumByProduct[p] = (premiumByProduct[p] || 0) + 1;
    }
  });

  // 4) Activity feed: so'nggi admin amallari
  let activity = [];
  try {
    const audSnap = await db.collection("audit_log").orderBy("t", "desc").limit(15).get();
    audSnap.forEach((d) => { const a = d.data(); activity.push({ t: a.t, email: a.email, action: a.action, detail: a.detail || {} }); });
  } catch (e) {
    console.warn("audit_log o'qilmadi (birinchi ishga tushishda normal):", e.message);
  }

  // Reg seriyasini massivga aylantirish (kun bo'yicha, 90 kun to'ldirilgan)
  const regSeries = [];
  for (let i = 89; i >= 0; i--) {
    const dayKey = new Date(now - i * DAY).toISOString().slice(0, 10);
    regSeries.push({ day: dayKey, count: regByDay[dayKey] || 0 });
  }

  return {
    totalUsers, adults, kids, totalFamilies, premiumFamilies,
    dau, wau, mau, platforms, langs, premiumByProduct,
    regSeries, recent: recent.slice(0, 10), activity,
    generatedAt: now,
  };
});

/**
 * ADMIN 7: Foydalanuvchilar ro'yxati — qidiruv + filtr + faollik (act_) join.
 * data: { search?, rol? ("bosh"|"azo"|"kid"), status? ("blocked"|"active"), limit? }
 */
exports.adminListUsers = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const search = (data?.search ? String(data.search) : "").toLowerCase().trim();
  const rolF = data?.rol ? String(data.rol) : "";
  const statusF = data?.status ? String(data.status) : "";
  const limit = Math.min(Math.max(parseInt(data?.limit || 300, 10), 1), 1000);
  const appdata = db.collection("appdata");

  // Faollik xaritasi: uid -> {t, platform, lg}
  const act = {};
  const actSnap = await prefixRange(appdata, DBP + "act_").get();
  actSnap.forEach((d) => {
    const uid = d.id.slice((DBP + "act_").length);
    const v = d.data().v || {};
    act[uid] = { t: v.t || null, platform: v.platform || null, lg: v.lg || null };
  });

  const out = [];
  let total = 0;
  const usersSnap = await prefixRange(appdata, DBP + "user_").get();
  usersSnap.forEach((docSnap) => {
    const uid = docSnap.id.slice((DBP + "user_").length);
    const v = docSnap.data().v || {};
    total++;
    const rol = v.rol || "azo";
    if (rolF && rol !== rolF) return;
    const blocked = v.blocked === true;
    if (statusF === "blocked" && !blocked) return;
    if (statusF === "active" && blocked) return;
    if (search) {
      const hay = [v.ism, v.familya, v.email, v.tel, v.login, uid, v.oilaId]
        .filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(search)) return;
    }
    const a = act[uid] || {};
    out.push({
      uid, ism: v.ism || "", familya: v.familya || "", email: v.email || "",
      tel: v.tel || "", login: v.login || "", rol, oilaId: v.oilaId || "",
      blocked, registeredAt: v.registeredAt || null, loginMethod: v.loginMethod || null,
      lastActiveAt: a.t || null, platform: a.platform || null, lg: a.lg || null,
    });
  });
  // Oxirgi faollik bo'yicha tartib (faollari yuqorida)
  out.sort((a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0) ||
    String(b.registeredAt || "").localeCompare(String(a.registeredAt || "")));
  return { users: out.slice(0, limit), matched: out.length, total };
});

/**
 * ADMIN 8: Foydalanuvchini bloklash / blokdan chiqarish.
 * Auth hisobini o'chirib qo'yadi (disable) — qayta kira olmaydi.
 * (Bola profillari auth'siz — ularda faqat flag qo'yiladi.)
 */
exports.adminSetUserBlocked = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const uid = data?.uid ? String(data.uid) : "";
  const blocked = !!data?.blocked;
  if (!uid) throw new functions.https.HttpsError("invalid-argument", "uid talab qilinadi.");

  const ref = db.collection("appdata").doc(DBP + "user_" + uid);
  const snap = await ref.get();
  if (!snap.exists) throw new functions.https.HttpsError("not-found", "Foydalanuvchi topilmadi.");
  const cur = snap.data();
  const v = cur.v || {};
  v.blocked = blocked;
  await ref.set({ ...cur, v, t: Date.now() }, { merge: true });

  // Auth hisobini bloklash (bola/anonim bo'lsa yo'q bo'lishi mumkin — jim)
  let authDisabled = false;
  try {
    await admin.auth().updateUser(uid, { disabled: blocked });
    authDisabled = true;
  } catch (e) {
    console.warn("auth updateUser (blok):", uid, e.message);
  }

  await logAdmin(context, blocked ? "user.block" : "user.unblock", { uid, authDisabled });
  return { success: true, blocked, authDisabled };
});

/**
 * ADMIN 9: Foydalanuvchi hisobini o'chirish.
 * O'chiradi: auth hisobi, user_ hujjati, act_, em_/kidlogin_ lookuplari,
 * oila a'zolar ro'yxatidan. Moliyaviy tarix (x_/d_) oila hisobida qoladi.
 */
exports.adminDeleteUser = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const uid = data?.uid ? String(data.uid) : "";
  if (!uid) throw new functions.https.HttpsError("invalid-argument", "uid talab qilinadi.");

  const ref = db.collection("appdata").doc(DBP + "user_" + uid);
  const snap = await ref.get();
  if (!snap.exists) throw new functions.https.HttpsError("not-found", "Foydalanuvchi topilmadi.");
  const v = snap.data().v || {};

  // 1) Auth hisobi (bo'lmasa jim)
  try { await admin.auth().deleteUser(uid); } catch (e) { console.warn("auth deleteUser:", e.message); }

  // 2) Lookup hujjatlari
  const dels = [];
  if (v.email) dels.push(db.collection("appdata").doc(safeKey("em_" + String(v.email).toLowerCase())).delete().catch(() => {}));
  if (v.login) dels.push(db.collection("appdata").doc(safeKey("kidlogin_" + v.login)).delete().catch(() => {}));
  dels.push(db.collection("appdata").doc(DBP + "act_" + uid).delete().catch(() => {}));
  await Promise.all(dels);

  // 3) Oila a'zolar ro'yxatidan chiqarish
  if (v.oilaId) {
    for (const key of ["oila_" + v.oilaId, "fam_" + v.oilaId]) {
      try {
        const fref = db.collection("appdata").doc(safeKey(key));
        const fsnap = await fref.get();
        if (fsnap.exists) {
          const fcur = fsnap.data();
          const fv = fcur.v || {};
          const ids = (fv.azolarIds || fv.azolar || []).filter((id) => id !== uid);
          fv.azolarIds = ids; fv.azolar = ids;
          await fref.set({ ...fcur, v: fv, t: Date.now() }, { merge: true });
        }
      } catch (e) { console.warn("oila ro'yxatidan chiqarish:", key, e.message); }
    }
  }

  // 4) User hujjatining o'zi
  await ref.delete();

  await logAdmin(context, "user.delete", { uid, ism: v.ism || "", email: v.email || "", oilaId: v.oilaId || "" });
  return { success: true };
});


/**
 * ADMIN 10: Premium ko'rinishi — premium oilalar ro'yxati (muddat bilan),
 * mahsulot kesimi, yaqin 7/30 kunda tugaydiganlar.
 */
exports.adminPremiumOverview = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const families = [];
  const byProduct = {};
  let exp7 = 0, exp30 = 0;
  const famSnap = await prefixRange(db.collection("appdata"), DBP + "oila_").get();
  famSnap.forEach((docSnap) => {
    const v = docSnap.data().v || {};
    if (v.premium !== true) return;
    const oilaId = v.id || docSnap.id.slice((DBP + "oila_").length);
    const exp = Number(v.premiumExpiresAt || 0) || null;
    const product = v.premiumProductId || "noma'lum";
    byProduct[product] = (byProduct[product] || 0) + 1;
    if (exp) {
      const left = exp - now;
      if (left > 0 && left <= 7 * DAY) exp7++;
      if (left > 0 && left <= 30 * DAY) exp30++;
    }
    families.push({
      oilaId, nomi: v.nomi || "",
      members: (v.azolarIds || v.azolar || []).length,
      product, expiresAt: exp,
      daysLeft: exp ? Math.ceil((exp - now) / DAY) : null,
      verifiedAt: v.verifiedAt || null,
    });
  });
  families.sort((a, b) => (a.expiresAt || Infinity) - (b.expiresAt || Infinity));

  // Promo kodlar xulosasi
  let promoActive = 0, promoUses = 0;
  try {
    const pSnap = await db.collection("promo_codes").get();
    pSnap.forEach((d) => {
      const p = d.data();
      if (p.active) promoActive++;
      promoUses += Number(p.usedCount || 0);
    });
  } catch (e) { console.warn("promo o'qish:", e.message); }

  return {
    total: families.length, byProduct, expiringIn7: exp7, expiringIn30: exp30,
    promoActive, promoUses, families, generatedAt: now,
  };
});

/**
 * ADMIN 11: Promo kodlar CRUD.
 * promo_codes/{KOD} = { code, days, maxUses, usedCount, active, createdAt,
 *                       createdBy, note, usedBy: {uid: ts} }
 * data.op: "list" | "create" | "toggle" | "delete"
 */
exports.adminPromo = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const op = data?.op ? String(data.op) : "list";
  const coll = db.collection("promo_codes");

  if (op === "list") {
    const out = [];
    const snap = await coll.orderBy("createdAt", "desc").limit(200).get();
    snap.forEach((d) => {
      const p = d.data();
      out.push({
        code: d.id, days: p.days, maxUses: p.maxUses, usedCount: p.usedCount || 0,
        active: p.active !== false, createdAt: p.createdAt || null, note: p.note || "",
      });
    });
    return { promos: out };
  }

  if (op === "create") {
    let code = (data?.code ? String(data.code) : "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!code) {
      // Avto-kod: OILA- + 6 belgi (adashtiruvchi 0/O/1/I belgilarisiz)
      const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      code = "OILA";
      for (let i = 0; i < 6; i++) code += alpha[Math.floor(Math.random() * alpha.length)];
    }
    const days = Math.min(Math.max(parseInt(data?.days || 30, 10), 1), 3650);
    const maxUses = Math.min(Math.max(parseInt(data?.maxUses || 1, 10), 1), 100000);
    const note = data?.note ? String(data.note).slice(0, 200) : "";
    const ref = coll.doc(code);
    if ((await ref.get()).exists) {
      throw new functions.https.HttpsError("already-exists", "Bu kod allaqachon mavjud: " + code);
    }
    await ref.set({
      code, days, maxUses, usedCount: 0, active: true,
      createdAt: Date.now(), createdBy: context.auth.uid, note, usedBy: {},
    });
    await logAdmin(context, "promo.create", { code, days, maxUses });
    return { success: true, code };
  }

  const code = (data?.code ? String(data.code) : "").toUpperCase();
  if (!code) throw new functions.https.HttpsError("invalid-argument", "code talab qilinadi.");
  const ref = coll.doc(code);
  const snap = await ref.get();
  if (!snap.exists) throw new functions.https.HttpsError("not-found", "Promo kod topilmadi.");

  if (op === "toggle") {
    const cur = snap.data();
    await ref.update({ active: cur.active === false });
    await logAdmin(context, "promo.toggle", { code, active: cur.active === false });
    return { success: true, active: cur.active === false };
  }
  if (op === "delete") {
    await ref.delete();
    await logAdmin(context, "promo.delete", { code });
    return { success: true };
  }
  throw new functions.https.HttpsError("invalid-argument", "Noma'lum op: " + op);
});

/**
 * FOYDALANUVCHI: Promo kodni ishlatish (admin emas — oddiy foydalanuvchi).
 * Faqat oila boshlig'i. Bir oila bir kodni bir marta ishlatadi.
 * Transaction bilan: parallel ishlatishda limit oshib ketmaydi.
 */
exports.redeemPromo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Tizimga kiring.");
  }
  const code = (data?.code ? String(data.code) : "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!code) throw new functions.https.HttpsError("invalid-argument", "Promo kod kiriting.");

  // Chaqiruvchining oilasi va roli — o'z profilidan (server tomonda)
  const uSnap = await db.collection("appdata").doc(DBP + "user_" + context.auth.uid).get();
  if (!uSnap.exists) throw new functions.https.HttpsError("failed-precondition", "Profil topilmadi.");
  const uv = uSnap.data().v || {};
  if (uv.rol !== "bosh") {
    throw new functions.https.HttpsError("permission-denied", "Faqat oila boshlig'i promo kodni faollashtira oladi.");
  }
  const oilaId = uv.oilaId;
  if (!oilaId) throw new functions.https.HttpsError("failed-precondition", "Profilingizda oila topilmadi.");

  const ref = db.collection("promo_codes").doc(code);
  const days = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Bunday promo kod yo'q.");
    const p = snap.data();
    if (p.active === false) throw new functions.https.HttpsError("failed-precondition", "Bu kod o'chirilgan.");
    if ((p.usedCount || 0) >= p.maxUses) {
      throw new functions.https.HttpsError("resource-exhausted", "Bu kodning limiti tugagan.");
    }
    const usedBy = p.usedBy || {};
    if (usedBy["oila_" + oilaId]) {
      throw new functions.https.HttpsError("already-exists", "Bu kod oilangizda allaqachon ishlatilgan.");
    }
    usedBy["oila_" + oilaId] = Date.now();
    tx.update(ref, { usedCount: (p.usedCount || 0) + 1, usedBy });
    return p.days;
  });

  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
  await enablePremiumForOila(oilaId, "promo_" + code, "promo", expiresAt);
  try {
    await db.collection("audit_log").add({
      t: Date.now(), uid: context.auth.uid, email: context.auth.token?.email || null,
      action: "promo.redeem", detail: { code, oilaId, days },
    });
  } catch (e) { console.warn("audit:", e.message); }

  return { success: true, days, expiresAt };
});
