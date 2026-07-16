# Til (i18n) arxitekturasi — siyosat va qoidalar

## Nega bu hujjat kerak

Ilova bir necha marta turli, bir-biriga bog'liq bo'lmagan tarjima
mexanizmlari bilan qurilgan edi (react-i18next JSON fayllari, ikkita
qo'lda yozilgan JS lug'at, `App.jsx` ichidagi tarqoq shart zanjirlari).
Bu — kalit nomlari to'qnashishi, ba'zi tillarning yarim tarjima
qilinishi va hatto ishlab chiqarishda haqiqiy ReferenceError kabi real
muammolarga olib keldi. Quyidagi qoidalar shu muammoning qaytalanishini
oldini olish uchun.

## Asosiy tamoyil

**Tarjimalar butunlay koddan ajratilgan.** Firestore — yagona haqiqat
manbai. React komponentlari va oddiy JS modullari hech qachon quyidagini
bilmasligi kerak:

- `language === "uz"`, `switch(language)`, `lg === "kk"` kabi shartlar
- Til nomlarining qattiq kodlangan (hardcoded) ro'yxati
- To'g'ridan-to'g'ri matn (`"Bosh sahifa"` kabi JSX yoki JS ichida)

Komponent faqat tarjima **kalitini** biladi: `t("dashboard_title")`
yoki modulga qarab `T("cardHealth", lg)`.

## Ma'lumot oqimi

```
src/locales/*.json (build ichidagi zaxira — offline/cold-start uchun)
        +
Firestore: translations/{docId}, languages/{code}, i18n_meta/current
        ↓
src/i18n/translationService.js  (Firestore bilan aloqa, versiya+kesh)
        ↓
src/i18n/index.js               (i18next bootstrap, localStorage kesh)
        ↓
react-i18next useTranslation()  →  t("kalit")
        yoki
goals/i18n.js, ai/i18n.js       →  T("kalit", lg, ...args)
```

Yangi til qo'shish = Firestore'da yangi hujjat yaratish
(`translations/{lang}`, `languages/{lang}`, `i18n_meta.versions`). Kod
o'zgarmaydi, qayta build/deploy shart emas.

## Namespace siyosati

i18next **namespace** tushunchasidan foydalaniladi — bu turli modul
lug'atlarini bir-biridan ajratib turadi, kalit nomlari hech qachon
to'qnashmasligi uchun.

| Namespace | Modul | Fayllar |
|---|---|---|
| `translation` (default) | Asosiy ilova (Dashboard, Reports, Profile, Tasks, Debts, modal oynalar...) | `src/locales/{uz,en,ru}.json` |
| `goals` | Smart Goals (`src/goals/*`) | `src/locales/goals.{uz,en,ru}.json` |
| `budgetai` | Smart Budget AI (`src/ai/*`) | `src/locales/budgetai.{uz,en,ru}.json` |

Firestore'da har bir namespace **`translations/{lang}__{namespace}`**
hujjatida saqlanadi (masalan `translations/uz__goals`); asosiy
`translation` fazosi orqaga moslik uchun `translations/{lang}` (`__`
qo'shimchasiz) nomida qoladi.

### Qoida: yangi modul = yangi namespace

Kelajakda qo'shiladigan har bir mustaqil modul (masalan `loan`,
`garden`, `settings`, `notifications`) **o'z alohida namespace'ini**
oladi:

1. `src/locales/{namespace}.{uz,en,ru}.json` yarating.
2. `src/i18n/index.js`dagi `NAMESPACES` massiviga qo'shing va
   `resources`ga import qiling.
3. `scripts/migrate-i18n.js`dagi `NAMESPACES` massiviga qo'shing.
4. Modul ichida `i18n.getResource(lg, "namespace", key)` orqali o'qing
   (`goals/i18n.js`/`ai/i18n.js`dagi `T()` naqshiga qarang) — yoki
   React komponentida `useTranslation("namespace")`.

Mavjud 278 kalitlik asosiy `translation` fazosi **hozircha
namespace'larga bo'lib tashlanmaydi** — bunda haqiqiy to'qnashuv
topilmagan (faqat `goals` bilan 2 ta: `overdue`, `day` — ular endi
`goals` namespace'ida izolyatsiya qilingan). Butun ilovani bir yo'la
namespace'larga bo'lish — 500+ chaqiruv joyini o'zgartirishni talab
qiladi va UI ekranlarini avtomatik tekshiradigan test yo'qligi sababli
yuqori regressiya xavfi bor edi. Shuning uchun **evolyutsion**
yondashuv tanlandi: zarurat tug'ilganda (haqiqiy to'qnashuv yoki yangi
mustaqil modul), o'sha aniq qism ajratiladi — butun kodni oldindan
qayta yozmasdan.

## Sof (pure) modullar

`smartEngine.js` kabi modullar hisob-kitob funksiyalarini React/Firebase
holatidan mustaqil, sinxron va test qilinadigan qilib saqlaydi. `T()`
funksiyasi i18next resurs do'konidan **sinxron** o'qiydi (`getResource`,
tarmoq so'rovisiz) — shuning uchun bu modullar hamon oddiy funksiya
chaqiruvlari bilan, mock'siz test qilinadi (`src/goals/smartEngine.test.js`,
`src/goals/i18n.test.js`ga qarang).

## Amaliy qadamlar (checklist)

- [ ] Yangi matn kerakmi? → `src/locales/*.json`ga kalit qo'shing (yoki
      tegishli namespace fayliga), so'ng `node scripts/migrate-i18n.js`
      ishga tushiring.
- [ ] Yangi mustaqil modul yozyapsizmi? → Yuqoridagi "yangi modul = yangi
      namespace" qoidasiga amal qiling.
- [ ] Kodda `if (lg === ...)` yozmoqchimisiz? → To'xtang — bu deyarli
      har doim tarjima kalitiga aylantirilishi kerak bo'lgan belgi.
