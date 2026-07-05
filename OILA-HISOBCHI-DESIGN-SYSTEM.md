# OILA HISOBCHI — DESIGN SYSTEM v1.0
### Premium Family Fintech · Product Design Document · 2026

> Bu hujjat keyingi barcha UI redesignlar uchun yagona manba (Single Source of Truth).
> Har qanday sahifa, komponent yoki animatsiya shu hujjatga zid bo'lsa — hujjat g'olib.
>
> **Texnik bog'lanish:** Bu tizim ilovaning mavjud `th.*` token arxitekturasi (constants.js) ustiga quriladi. Hech qanday framework almashtirilmaydi — faqat token qiymatlari va qoidalar aniqlashtiriladi.

---

# 1. DESIGN PHILOSOPHY

## 1.1 Brand Personality

**"Ishonchli oilaviy hamrohingiz — bankdek jiddiy, oiladek iliq."**

| O'lchov | Qiymat | Nima uchun |
|---|---|---|
| Jiddiylik | 70% fintech, 30% oilaviy iliqlik | Pul — ishonch masalasi. Foydalanuvchi ilovaga oylik maoshini yozadi; u o'yinchoqqa emas, bankka o'xshashi kerak. Lekin 100% sovuq fintech O'zbekiston oilasi uchun begona tuyuladi |
| Ohang | Hurmatli "siz", sodda so'zlar | Auditoriya — 20 yoshdan 60 yoshgacha oila a'zolari. Moliyaviy jargon taqiqlanadi: "Cash flow" emas — "Kirim-chiqim" |
| Xarakter | Xotirjam, optimist, panikasiz | Qarz oshganda ham ilova qichqirmaydi. U yechim ko'rsatadi |

## 1.2 Product Emotion — foydalanuvchi nimani his qilishi kerak

| Sahifa | Asosiy emotsiya | Dizayn vositasi |
|---|---|---|
| Dashboard | **Nazorat** ("hammasi qo'limda") | Katta balans raqami, tartibli kartalar, sokin fon |
| Reports | **Aniqlik** ("tushunaman") | Toza grafiklar, minimal rang, aniq raqamlar |
| Baraka Bog'i | **Quvonch** ("oilam bilan o'stiryapmiz") | Yagona illyustrativ zona, jonli animatsiya |
| Premium | **Istak** ("bunga arziydi") | Oltin urg'u, sifat hissi, bosim yo'q |
| Profile | **G'urur** ("mening yutuqlarim") | Statistika, yutuqlar, shaxsiylashtirish |
| Onboarding | **Xavfsizlik** ("bu joy ishonchli") | Kam matn, katta illyustratsiya, aniq qadamlar |

## 1.3 User Feeling — 5 so'z testi

Foydalanuvchi ilovani yopgach, do'stiga 5 so'zda ta'riflasa, shu so'zlar chiqishi kerak:

**Professional · Iliq · Ishonchli · Zamonaviy · Yengil**

Agar "chiroyli, lekin o'yinchoqqa o'xshaydi" desa — biz yutqazdik.
Agar "kuchli, lekin sovuq" desa — ham yutqazdik.

## 1.4 Visual Identity

- **Asosiy metafora:** *Oila daraxti + moliyaviy barqarorlik*. Indigo (ishonch, professional) + yashil (o'sish, baraka) — brendning ikki qutbi.
- **Shakl tili:** yumshoq burchaklar (16px standart) — qattiq to'rtburchak bank emas, taxta o'yin ham emas. Do'stona, lekin tartibli.
- **Rang temperaturasi:** neytral-sovuq asos (indigo/slate) + issiq urg'ular (amber/premium). Fon hech qachon "shovqin" qilmaydi.
- **Yorug'lik:** Light mode — asosiy (O'zbekistonda kunduzi, ochiq havoda ishlatiladi). Dark mode — teng huquqli, "qo'shimcha" emas.

## 1.5 Design Principles — 6 tamoyil

1. **Raqam — qahramon.** Har ekranda foydalanuvchini qiziqtirgan asosiy raqam (balans, xarajat, maqsad %) eng katta va eng aniq element bo'ladi. Dekoratsiya raqam bilan raqobatlashmaydi.
2. **Bir ekran — bir gradient.** Gradient — urg'u vositasi. Ikki gradient bir ekranda = urg'u yo'qolgan.
3. **Bog' — bog'da qoladi.** Illyustrativ, o'yin uslubi faqat Baraka Bog'i (+ bolalar bo'limi) ichida yashaydi. Dashboard/Reports/Premium/Profile — sof fintech.
4. **3 soniya qoidasi.** Har sahifaning maqsadi 3 soniyada tushunilishi kerak. Tushunilmasa — iyerarxiya buzilgan.
5. **Sokin xatolik.** Xato va ogohlantirish holатlari yordam beradi, ayblamaydi. Qizil rang faqat haqiqiy xavf uchun.
6. **Kamdan boshla.** Har element o'z o'rnini isbotlashi kerak. Shubha bo'lsa — olib tashla.

---

# 2. COLOR SYSTEM

> Barcha ranglar mavjud `th.*` token nomlariga bog'langan — implementatsiya `constants.js`dagi bitta obyektni yangilash orqali bo'ladi.

## 2.1 Primary — Indigo (ishonch, professionallik)

| Token | Light | Dark | Ishlatilishi |
|---|---|---|---|
| `ac` (Primary) | `#6366F1` | `#6366F1` | Asosiy tugmalar, aktiv tab, havolalar, tanlangan holat |
| `ac2` (Primary Deep) | `#4F46E5` | `#818CF8` | Gradient juftligi, bosilgan holat |
| Primary Soft | `ac + "14"` (8% opacity) | `ac + "1A"` | Ikonka fonlari, tanlangan chip foni |

**Asosiy gradient:** `linear-gradient(135deg, #6366F1, #4F46E5)` — *faqat* Hero karta va Primary tugmada. Boshqa joyda taqiq.

Nima uchun indigo: ko'k oilasi — moliyada ishonchning universal rangi (Revolut, Monarch), lekin sof ko'k O'zbekistonda bank kartalariga juda "o'xshab qolgan". Indigo — zamonaviyroq, premium his beradi va yashil (baraka) bilan chiroyli kontrast hosil qiladi.

## 2.2 Semantic ranglar

| Rol | Token | Light | Dark | Qachon |
|---|---|---|---|---|
| Success / Daromad | `gr` | `#059669` | `#10B981` | Kirim summalari, bajarilgan maqsad, "saqlandi" |
| Danger / Xarajat | `rd` | `#DC2626` | `#EF4444` | Chiqim summalari, o'chirish, kritik ogohlantirish |
| Warning | `am` | `#D97706` | `#F59E0B` | Limit yaqinlashdi, muddat o'tmoqda |
| Info | `ac` bilan bir xil | — | — | Alohida info rang **yo'q** — indigo ishlatiladi. 5-rang tizimni murakkablashtiradi |

**Qat'iy qoida:** yashil = pul kirdi, qizil = pul chiqdi. Bu semantika hech qachon dekorativ maqsadda buzilmaydi (masalan, "chiroyli" yashil sarlavha taqiq).

## 2.3 Surface & Background

| Token | Light | Dark | Ishlatilishi |
|---|---|---|---|
| `bg` (Background) | `#EEF2FF` → tavsiya: `#F4F6FB` | `#090E1C` | Sahifa foni. Light'da hozirgi indigo-tint biroz kuchli — neytralroq qilinadi, shunda kartalar "ko'tariladi" |
| `sur` (Surface) | `#FFFFFF` | `#111827` | Kartalar, modallar |
| `surH` (Surface High) | `#F5F7FF` | `#192035` | Input fonlari, ichki bloklar |
| `bor` (Border) | `#E2E8F0` | `#2B3852` | 1px chegaralar |
| `t1` (Text Primary) | `#0F172A` | `#FFFFFF` | Sarlavha, summa |
| `t2` (Text Secondary) | `#64748B` | `#B9C3D4` | Izoh, label |
| `t3` (Text Tertiary) | `#94A3B8` | `#9CA3AF` | Placeholder, nofaol |

## 2.4 Dark Mode qoidalari

- Dark mode — **teskari light emas**, alohida palitra: to'q navy asos (`#090E1C`), sof qora emas (OLED'da chiroyli, lekin `#000` kontrastni qattiqlashtiradi).
- Semantic ranglar dark'da **bir pog'ona ochroq** (`#059669` → `#10B981`) — to'q fonda to'yingan ranglar "yonib ketadi".
- Gradientlar dark'da 10–15% pastroq opacity bilan.
- Elevation dark'da shadow bilan emas, **surface ochligi** bilan beriladi (sur → surH).

## 2.5 Garden Colors — faqat Baraka Bog'i uchun

| Nom | HEX | Ishlatilishi |
|---|---|---|
| Sky Day | `#87CEEB → #B8E3F5` gradient | Bog' osmoni (kunduz) |
| Sky Evening | `#F9A86A → #B78CDB` gradient | Bog' osmoni (kech, 18:00 dan keyin — qurilma vaqti bo'yicha) |
| Grass | `#7CC576` | O't, yaproq asosi |
| Leaf Deep | `#4C9A45` | Yaproq soyasi |
| Soil | `#8B6647` | Tuproq |
| Trunk | `#6D4C33` | Daraxt tanasi |
| Water | `#5BB8E8` | Suv tomchisi, sug'orish |
| Sun | `#FFD75E` | Quyosh, yulduzcha porlashi |
| Bloom | `#F78FB3` | Gullar |

**Qoida:** bu 9 rang bog' konteyneridan tashqariga chiqmaydi. Dashboard'da bog' widgeti bo'lsa — u karta ichida "deraza" sifatida ko'rinadi, ranglari kartadan oqib chiqmaydi.

## 2.6 Premium Colors — oltin tizim

| Nom | HEX | Ishlatilishi |
|---|---|---|
| Gold | `#F59E0B` | PRO badge, premium ikonka |
| Gold Deep | `#D97706` | Gradient juftligi |
| Gold Gradient | `linear-gradient(135deg, #FBBF24, #F59E0B)` | Premium avatar halqasi, aktiv premium karta |
| Gold Soft | `#F59E0B14` | Premium karta foni |

Nima uchun oltin: premium = qimmatbaho metall assotsiatsiyasi, universal. Indigo (asosiy) bilan to'qnashmaydi va warning amber bilan ataylab bir oilada — ikkalasi ham "diqqat" chaqiradi, lekin premium kontekstda ijobiy, warning kontekstda ehtiyotkor. Kontekst ajratadi, alohida 2 sariq kerak emas.

## 2.7 Chart Colors — 8 ta kategoriya rangi

Grafiklar uchun qat'iy tartibli palitra (ketma-ketlik o'zgarmaydi, shunda kategoriya rangi doim bir xil):

1. `#6366F1` indigo · 2. `#10B981` emerald · 3. `#F59E0B` amber · 4. `#EC4899` pink · 5. `#06B6D4` cyan · 6. `#8B5CF6` violet · 7. `#F97316` orange · 8. `#64748B` slate (Boshqa)

Qoida: donut/bar grafikda 6 tadan ortiq segment ko'rsatilmaydi — qolgani "Boshqa" (slate) ga yig'iladi. 12 rangli kamalak = o'qib bo'lmaydigan grafik.

## 2.8 Gradient qoidalari

| Gradient | Qayerda RUXSAT | Qayerda TAQIQ |
|---|---|---|
| Indigo (`ac→ac2`) | Hero karta (har sahifada max 1), Primary tugma | Ro'yxat elementlari, fon, matn |
| Gold | Premium karta, PRO badge | Boshqa hamma joy |
| Garden Sky | Faqat bog' osmoni | Bog'dan tashqari hamma joy |
| Semantic soft (`gr15→ac08` kabi) | Bitta aksent-karta uchun | Bir ekranda 2+ marta |

---

# 3. TYPOGRAPHY SYSTEM

**Shrift:** Inter (mavjud, APK uchun lokal). Zaxira: `system-ui, sans-serif`.
Nima uchun Inter: raqamlar uchun `tabular-nums` qo'llab-quvvatlaydi (summalar ustunda tekis turadi — fintech uchun kritik), kirill+lotin to'liq, ekranda kichik o'lchamda ham o'qiladi.

| Daraja | Size | Weight | Line Height | Ishlatilishi |
|---|---|---|---|---|
| **Display** | 34px | 800 | 1.1 | Faqat Dashboard balansi va Onboarding sarlavhasi |
| **Hero** | 28px | 800 | 1.15 | Sahifa ichidagi bosh raqam (hisobot jami) |
| **Title** | 20px | 800 | 1.2 | Sahifa sarlavhasi ("Profil", "Hisobot") |
| **Heading** | 17px | 700 | 1.3 | Karta sarlavhasi, modal sarlavhasi |
| **Subtitle** | 15px | 600 | 1.4 | Ro'yxat elementi nomi, tugma matni |
| **Body** | 14px | 400–500 | 1.5 | Asosiy matn, izohlar |
| **Caption** | 12px | 500 | 1.4 | Ikkilamchi ma'lumot, sana, badge matni |
| **Tiny** | 10px | 600–700, letter-spacing 1.2px, UPPERCASE | 1.3 | Seksiya labellari, input labellari |

**Qoidalar:**
- Pul summalari **doim** `tabular-nums` va weight ≥ 700.
- Bir ekranda maksimum 4 daraja ishlatiladi (Display + Heading + Subtitle + Caption kabi).
- 10px dan kichik matn taqiqlanadi (accessibility).
- Bold (800) faqat raqam va sarlavha uchun — butun paragraf bold taqiq.

---

# 4. SPACING SYSTEM — 8-Point Grid

## 4.1 Spacing shkala

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48`

| Token | Qiymat | Ishlatilishi |
|---|---|---|
| space-1 | 4px | Ikonka↔matn orasi, badge ichki |
| space-2 | 8px | Karta ichidagi elementlar orasi, chip gap |
| space-3 | 12px | Ro'yxat qatorlari orasi, ikonka-konteyner↔matn |
| space-4 | 16px | Karta ichki padding (standart), kartalar orasi |
| space-5 | 20px | Sahifa gorizontal padding |
| space-6 | 24px | Seksiyalar orasi |
| space-8 | 32px | Katta bo'limlar orasi, modal yuqori padding |

## 4.2 Radius — faqat 4 qiymat

| Token | Qiymat | Ishlatilishi |
|---|---|---|
| radius-s | 10px | Kichik tugma, chip, badge, input ichki elementi |
| radius-m | 16px | **Standart**: karta, input, ro'yxat konteyner, tugma |
| radius-l | 24px | Bottom sheet yuqori burchaklari, Hero karta |
| radius-full | 50% | Avatar, FAB, toggle, dot |

Hozirgi kodda 9–20px oralig'ida 7 xil radius bor — hammasi shu 4 tasiga keltiriladi.

## 4.3 Elevation & Shadow — 3 daraja

| Daraja | Light shadow | Dark ekvivalenti | Qayerda |
|---|---|---|---|
| E0 (tekis) | yo'q, faqat 1px border | border | Oddiy kartalar, ro'yxatlar |
| E1 (ko'tarilgan) | `0 4px 14px rgba(99,102,241,0.25)` (rang = element rangi, 25%) | surH fon | Primary tugma, FAB |
| E2 (suzuvchi) | `0 12px 32px rgba(15,23,42,0.18)` | surH + border | Modal, bottom sheet, dropdown |

**Qoida:** E1 soyasi doim element rangida (indigo tugma — indigo soya). Qora universal soya faqat E2 da. Bir ekranda E1 elementlar soni ≤ 2.

## 4.4 Blur

Faqat 2 joyda: (1) modal orqa foni — `rgba(0,0,0,0.7)`, blur **ishlatilmaydi** (WebView/APK performance); (2) agar kelajakda glass-effekt kerak bo'lsa — faqat bottom navigation, `blur(16px)`, va past qurilmalarda solid fallback.

---

# 5. COMPONENT SYSTEM

Har komponent uchun: anatomiya + holatlar + qoidalar.

## 5.1 Buttons

| Tur | Ko'rinish | Balandlik | Qachon |
|---|---|---|---|
| Primary | Indigo gradient, oq matn, radius-m, E1 soya | 50px | Ekrandagi asosiy harakat — **har ekranda faqat 1 ta** |
| Secondary | `ac`14% fon, `ac` matn, 1px `ac`44% border | 44px | Ikkilamchi harakat (Bekor, Tahrirlash) |
| Ghost | Shaffof fon, 1px `bor` border, `t2` matn | 44px | Uchinchi darajali (Yopish, Keyinroq) |
| Danger | `rd`8% fon, `rd` matn | 44–50px | O'chirish, chiqish. To'liq qizil tugma faqat tasdiqlash dialogida |
| Icon button | 36–40px kvadrat, radius-s | 40px | Toolbar harakatlari |

Holatlar: pressed = scale(0.98) + opacity 0.85 · disabled = opacity 0.45 · loading = spinner + matn o'zgaradi ("Yuborilmoqda...").

## 5.2 Cards

- Anatomiya: `sur` fon + 1px `bor` + radius-m + padding 16px.
- Bosiladigan karta = press animatsiya + o'ng chevron. Bosilmaydigan kartada chevron **taqiq** (yolg'on affordance).
- Hero karta (gradient): sahifada faqat 1 ta, radius-l, dekorativ doiralar opacity ≤ 8%.
- Aksent karta (soft rang fon): ma'lumot urg'usi uchun, bir ekranda ≤ 2.

## 5.3 Input

- 50px balandlik, `surH` fon, 1.5px `bor`, radius-m, 15px matn.
- Focus: border `ac` ga o'tadi (boshqa effekt yo'q — sodda).
- Label: Tiny uslub (10px uppercase), input **ustida**, placeholder label o'rnini bosmaydi.
- Xato: border `rd` + pastda 12px qizil izoh matni. Input silkitilmaydi (reduced motion hurmati).
- Pul inputi: 22px, weight 800, markazda, valyuta belgisi `t2` rangda.

## 5.4 FAB (Floating Action Button)

56px doira, indigo gradient, E1, bottom nav markazida yoki o'ng pastda 20px otstup. Faqat "Yangi yozuv qo'shish" uchun — FAB hech qachon boshqa vazifa bajarmaydi. Press: scale 0.92 spring.

## 5.5 Bottom Navigation

- 5 element max, balandlik 62px + safe-area-inset-bottom.
- Aktiv: `ac` ikonka + Tiny label; nofaol: `t3` ikonka, label ko'rinadi (faqat ikonka — tushunarsiz).
- Fon: `sur` + yuqori 1px `bor`. Badge (bildirishnoma soni): 16px qizil doira, ikonka yuqori-o'ngida.

## 5.6 Tab / Segment

- Segment (2–3 variant): `surH` fon konteyner radius-m, aktiv segment `sur` fon + E0→yengil soya, 40px.
- Tab (3+ variant, scroll): chip uslubi — aktiv `ac`14% fon + `ac` matn, nofaol shaffof + `t2`.

## 5.7 Modal / Dialog / Bottom Sheet

- **Bottom Sheet** (asosiy pattern, mobil uchun): pastdan chiqadi, radius-l yuqorida, tepada 40×4px tortish dastasi, orqa fon `rgba(0,0,0,0.7)`, tashqariga bosish = yopish.
- **Dialog** (faqat qaytarilmas harakat tasdig'i): markazda, 320px max, sarlavha + matn + 2 tugma (Danger + Ghost).
- Qoida: bitta vaqtda faqat bitta sheet. Sheet ustida sheet taqiq.

## 5.8 Toast / Snackbar

- Yuqoridan tushadi, 3 soniya, radius-m, E2.
- 3 tur: success (`gr` chap chiziq + ikonka), error (`rd`), warning (`am`).
- Matn ≤ 40 belgi. Toast'da tugma yo'q (harakat kerak bo'lsa — dialog).

## 5.9 Badge

- Status badge: 20px radius (pill), 3px 10px padding, Caption matn, soft fon (`rang`+14%) + to'yingan matn.
- PRO badge: oltin gradient fon, oq 9px 800 matn, yulduzcha ikonka. **Bitta standart PRO badge butun ilovada** — o'lcham/rang varianti yo'q.
- Counter badge: 16px qizil doira, oq raqam.

## 5.10 Avatar

- O'lchamlar: 34 (ro'yxat) / 44 (qator) / 64 (hero) / 78 (profil markaz).
- Rasm yo'q bo'lsa: ism bosh harfi, `ac` fon.
- Premium halqa: 2.5px oltin gradient — faqat premium foydalanuvchida.

## 5.11 Progress

- Chiziqli: 8px balandlik, radius-full, `bor` trek, semantik rang to'ldiruv. Limit >80% da `am`, >100% da `rd` ga o'tadi.
- Doiraviy (maqsadlar): 4px stroke, markazда foiz raqami Heading uslubida.
- Har progress yonida aniq raqam bo'lishi shart (foiz yoki summa) — faqat vizual chiziq yetarli emas.

## 5.12 Charts

- Grid chiziqlari: `bor` rangda, 1px, faqat gorizontal.
- O'q labellari: Caption, `t2`. Tooltip: E2 karta.
- Donut: markazda jami summa (Hero tipografiya). Legendada rang-nuqta + nom + summa + %.
- Animatsiya: chiziq/bar birinchi ochilishda 400ms o'sadi, qayta renderda animatsiya yo'q.

## 5.13 Empty State

- Anatomiya: 64px yengil ikonka (`t3` rang, illyustratsiya emas — bu fintech zonasi) + Heading matn + Body izoh + Secondary tugma (harakatga chaqiriq).
- Ohang: aybsiz, yo'naltiruvchi. "Ma'lumot yo'q" ❌ → "Birinchi xarajatingizni qo'shing" ✅.
- Istisno: Bog' empty state illyustrativ bo'lishi mumkin (urug', tuproq).

## 5.14 Loading / Skeleton

- Sahifa yuklanishi: skeleton (spinner emas) — kartalar shakli `surH` fonda, shimmer animatsiya 1.2s.
- Tugma ichida: 18px spinner + matn.
- Skeleton real kontent tuzilishini takrorlaydi (balans joyi katta, ro'yxat joyi qatorlar).

## 5.15 Error State

- Tarmoq xatosi: karta ichida — ikonka + "Ulanishda muammo" + "Qayta urinish" Secondary tugma.
- Hech qachon texnik matn ko'rsatilmaydi (stack trace, "undefined" va h.k.).

---

# 6. ICONOGRAPHY

**Uslub: Outline, 1.3–1.5px stroke, yumaloq uchlar (round cap/join), 15% opacity ichki to'ldiruv ruxsat.**

Bu mavjud `Ico` to'plamining uslubi — u saqlanadi va kengaytiriladi. Nima uchun outline: yengil, professional, fintech standarti (Revolut, Monarch); filled ikonkalar kichik o'lchamda "dog'" bo'lib ko'rinadi.

| Qoida | Tafsilot |
|---|---|
| O'lchamlar | 16 / 18 / 20 / 26 (faqat shu 4) |
| Filled qachon | Faqat aktiv bottom-nav elementi va tanlangan holat — outline→filled o'tish "tanlandi" signali |
| Rang | Bir ikonka — bir rang. Ko'p rangli ikonka taqiq (bog'dan tashqari) |
| Konteyner | 36–40px, radius-s, `rang`+14% fon — ro'yxat va settings uchun standart |
| Emoji | **Butun ilovada taqiq.** Mavjud emoji'lar (🌱📚👶💎...) bosqichma-bosqich SVG ga almashtiriladi. Istisno: foydalanuvchi kiritgan matn ichida |

---

# 7. ILLUSTRATION SYSTEM — faqat Baraka Bog'i

**Uslub:** Lucky Garden / Township ruhidagi yumshoq 2D vektor: qalin shakllar, yumaloq siluetlar, quvnoq lekin ohangdor palitra (2.5-bo'lim ranglari), 2px dan qalin konturlar yo'q — soft shading (2 ton: asos + soya).

| Element | Tavsif |
|---|---|
| Osmon | Vertikal gradient (Sky Day), kechqurun Sky Evening ga almashadi — qurilma vaqti asosida. Bu "tirik dunyo" hissi |
| Bulutlar | 2–3 ta yumshoq oval klaster, oq 85% opacity, sekin drift (60–90s sikl) |
| Quyosh | Yumaloq, 8 qisqa nur, yengil pulse porlash (4s) |
| Qushlar | Soddalashtirilgan "V" siluet, 2 ta, vaqti-vaqti bilan uchib o'tadi (20–40s tasodifiy) |
| Daraxt | **Bosh qahramon.** Level 0 (urug')→ 1 (nihol) → 2 (yosh daraxt) → 3 (barg) → 4 (gullagan) → 5+ (mevali). Har level vizual sezilarli farq — o'sish motivatsiyaning yadrosi |
| Tuproq | Soil rang tepasi yumaloq tepalik, o't tutamlari |
| Suv | Sug'organda: 4–6 tomchi yuqoridan, teginish nuqtasida halqa to'lqin |
| Yaproqlar | Level oshganda 6–10 yaproq yuqoriga uchib konfetti vazifasini bajaradi |

Texnik chegara: barcha illyustratsiya SVG/CSS (rastr yo'q — APK hajmi), animatsiya faqat `transform`/`opacity` (60fps WebView).

---

# 8. MOTION SYSTEM

**Falsafa:** animatsiya — javob, dekoratsiya emas. Har harakat foydalanuvchi harakatiga javob beradi yoki e'tiborni yo'naltiradi.

## 8.1 Token'lar

| Token | Qiymat | Qachon |
|---|---|---|
| duration-fast | 120ms | Press, toggle, hover |
| duration-base | 240ms | Sheet, tab almashish, fade |
| duration-slow | 400ms | Grafik chizilishi, count-up |
| ease-out | `cubic-bezier(0.16, 1, 0.3, 1)` | Kirish animatsiyalari (deyarli hammasi) |
| ease-in-out | `cubic-bezier(0.65, 0, 0.35, 1)` | Holatlar orasidagi o'tish |
| spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | FAB, bog' elementlari — yengil "sakrash" |

## 8.2 Naqshlar

| Element | Animatsiya |
|---|---|
| Card/Button press | scale 0.98 + opacity 0.85, 120ms |
| Bottom Sheet | pastdan translateY, 240ms ease-out; yopilish 200ms |
| Dialog | scale 0.95→1 + fade, 200ms |
| Sahifa kontenti | fadeUp 12px, 240ms, stagger yo'q (WebView performance) |
| Count-up (balans) | 400ms, faqat birinchi ochilishda |
| Toast | yuqoridan slide + fade, 240ms |
| **Bog': floating** | Daraxt yengil sway (rotate ±1°, 5s), bulut drift, tanga/yulduz yig'ilganda pop (spring) + yuqoriga uchish |
| **Bog': suv** | Tomchi tushishi 600ms + halqa 400ms |

## 8.3 Taqiqlar

Parallax yo'q · cheksiz aylanadigan dekorativ animatsiya fintech zonasida yo'q · bir vaqtda 2+ katta animatsiya yo'q · `width/height/top/left` animatsiyasi yo'q (faqat transform/opacity).

---

# 9. INFORMATION HIERARCHY — ko'z yo'nalishi

| Sahifa | Ko'z tartibi | Izoh |
|---|---|---|
| **Dashboard** | Balans (Display raqam) → oy tanlash → kirim/chiqim juftligi → grafik → so'nggi yozuvlar → FAB | Foydalanuvchi 80% hollarda faqat balansni ko'rgani kiradi — u 1-o'rinda, hech narsa bilan raqobatlashmaydi |
| **Garden** | Daraxt (markaz, 55% ekran) → yulduz balansi (yuqori) → sug'orish tugmasi (past markaz) → oila a'zolari hissasi | O'yin sahnasi: qahramon markazda, boshqaruv bosh barmoq zonasida |
| **Reports** | Davr tanlash → jami raqam (Hero) → donut → kategoriya ro'yxati → eksport | Avval "qancha?", keyin "nimaga?", oxirida harakat |
| **Profile** | Avatar+ism → Premium holat → statistika → yutuqlar → Premium karta → sozlamalar → chiqish | (Amalga oshirilgan v1 tartibi) |
| **Premium** | Qiymat sarlavhasi ("Oilangiz uchun cheksiz") → funksiya taqqoslash → narx → CTA | Avval foyda, keyin narx — hech qachon teskari emas |
| **Onboarding** | Illyustratsiya → 1 jumla qiymat → progress nuqtalar → Davom tugmasi | Har qadam bitta g'oya. 3 qadamdan oshmaydi |

---

# 10. DESIGN RULES — qat'iy taqiqlar

❌ **Emoji** — UI'da mutlaqo (SVG ikonka bor)
❌ **5 xil radius** — faqat 10/16/24/full
❌ **Har xil shadow** — faqat E0/E1/E2
❌ **Bir ekranda 2+ gradient** — gradient urg'u, urg'u bitta bo'ladi
❌ **Har xil icon uslubi** — faqat outline tizimi
❌ **10 xil animatsiya** — faqat 8-bo'limdagi naqshlar
❌ **Sof qora (#000) va sof kulrang matn** — palitra tokenlaridan tashqari rang yo'q
❌ **3 qatordan uzun paragraf** mobil kartada
❌ **Chevronsiz bosiladigan / chevronli bosilmaydigan karta** — affordance yolg'oni
❌ **Bog' uslubining fintech sahifalarga oqib chiqishi** — illyustratsiya faqat bog'da
❌ **Qizil rangning dekorativ ishlatilishi** — qizil faqat chiqim/xavf/o'chirish
❌ **Ko'p uppercase** — faqat Tiny label darajasida

---

# 11. MONETIZATION UX

**Falsafa: Premium — devor emas, vitrina.** Foydalanuvchi premium funksiyalarni *ko'radi*, ishlatmoqchi bo'lganda yumshoq taklif oladi. Agressiv paywall O'zbekiston bozorida ishonchni o'ldiradi.

| Element | Qoida |
|---|---|
| **PRO Badge** | Yagona standart (oltin gradient, 9px). Premium funksiya nomi yonida turadi: "PDF Export [PRO]". Funksiya yashirilmaydi |
| **Premium Card** | Profile'da doim ko'rinadi (amalga oshirildi); Dashboard'da ko'rinmaydi (bosh sahifa sotuv joyi emas — ishonch joyi) |
| **Upgrade CTA** | Bepul foydalanuvchi PRO funksiyaga tekkanda: bottom sheet — funksiya foydasi + narx + "Keyinroq" (Ghost). Bloklovchi to'liq ekran taqiq |
| **Kontekstli trigger** | 4-maqsad qo'shmoqchi → "Cheksiz maqsad Premium'da" sheet. Trigger — foydalanuvchi harakati, taymer/popup emas |
| **Premium Color** | Oltin faqat premium kontekstda — shunda oltin ko'rinishi o'zi "premium" signalga aylanadi |
| **Premium bo'lgandan keyin** | PRO badge'lar yo'qoladi, oltin halqa avatar atrofida — status hissi (retention'ga ham ishlaydi) |
| **Referral bilan bog'lanish** | Referral = premiumga bepul yo'l. Premium kartadan keyin joylashadi: "sotib olmasang — do'st chaqir" muqobili |

---

# 12. RETENTION UX

Yangi biznes logika yo'q — faqat **mavjud** ma'lumotlarni qaytish sabablariga aylantirish:

| Mavjud ma'lumot | Dizayn ifodasi | Nega qaytaradi |
|---|---|---|
| Baraka Bog'i (`stars`, `level`) | Kunduz/kech osmon, o'sadigan daraxt, sug'orish rituali | Kunlik ritual + oilaviy umumiy maqsad |
| Foydalanish kunlari | Profile statistikasi "N kun" | Investitsiya hissi (yo'qotishdan qochish) |
| Bildirishnoma vaqti (mavjud sozlama) | Yumshoq matn: "Bugungi xarajatlarni yozdingizmi?" | Odat halqasi — belgilangan vaqtda |
| Maqsad progressi | Doiraviy progress + qolgan summa | Yakunlanmagan ish effekti (Zeigarnik) |
| Oila faolligi | "So'nggi yozuvlar"da a'zo avatari | Ijtimoiy signal: "oilam yozyapti, men ham" |
| Yulduzcha balansi | Bog'da ko'rinadigan valyuta | Yig'ish instinkti, bog' bilan yopiq sikl |

Taqiq: soxta shoshilinch ("faqat bugun!"), qo'rqitish ("pulingiz nazoratsiz!"), yolg'on badge.

---

# 13. RESPONSIVE RULES — Mobile First

| Qurilma | Qoida |
|---|---|
| Bazaviy dizayn | 360–430px kenglik (mavjud `maxWidth: 430` saqlanadi), 9:16–9:21 |
| Kichik Android (320–360px) | 4 ta stat-katak 2×2 grid'ga o'tadi; Display 34→30px; gorizontal padding 20→16px |
| iPhone | Safe-area insets (mavjud CSS saqlanadi): notch tepada, home indicator pastda — bottom nav padding-bottom oshadi |
| Fold / Tablet (600px+) | Konteyner 430px markazda qoladi, fon `bg` kengayadi. Ikki ustunli maxsus layout **qilinmaydi** — bitta kod, APK barqarorligi ustuvor |
| Landscape | Qo'llab-quvvatlanmaydi (portrait lock APK'da) — moliyaviy ilova uchun norma |
| Touch target | Minimum 44×44px har bosiladigan element uchun (kichik ko'ringan tugmada ham shaffof kengaytirilgan zona) |

---

# 14. ACCESSIBILITY

| Mezon | Qoida |
|---|---|
| Kontrast | Matn `t1`/fon ≥ 7:1; `t2`/fon ≥ 4.5:1 (WCAG AA); rang tokenlari shu talab bilan tanlangan. Oltin fondagi oq matn faqat ≥ 12px bold |
| Rang-ko'rlik | Kirim/chiqim faqat rang bilan ajratilmaydi: doim + / − prefiks va ikonka yo'nalishi qo'shiladi |
| Touch | 44px minimal nishon; qatorlar orasidagi bo'shliq ≥ 8px (noto'g'ri bosishdan himoya) |
| Shrift | Tizim shrift kattalashtirishga chidamlilik: layout 1.3× matn kattaligida sinmasligi kerak (fixed-height matn konteynerlar taqiq) |
| Dark Mode | To'liq parite: har yangi komponent ikkala rejimda tekshiriladi |
| Reduced Motion | `prefers-reduced-motion` da: barcha dekorativ animatsiya (bog' floating, shimmer, count-up) o'chadi, funksional o'tishlar (sheet ochilishi) 0ms ga yaqinlashadi |
| Til | 4 til (uz/ru/en/kk) — tugma matnlari uchun 30% kenglik zaxirasi (ruscha matn odatda uzunroq) |

---

# XULOSA — implementatsiya tartibi (keyingi promptlar uchun)

1. **Token yangilash** — `constants.js` theme obyekti + `styles.js` (radius/spacing/shadow birlashtirish). Eng kichik o'zgarish, eng katta ta'sir.
2. **Emoji → SVG migratsiya** — sahifama-sahifa (Profile'da boshlandi).
3. **Dashboard** → **Reports** → **Premium/Modal** → **Onboarding** — fintech zonasi.
4. **Baraka Bog'i** — illyustrativ tizim (7-bo'lim) alohida katta bosqich.
5. Har bosqich: mavjud logika saqlanadi, faqat ko'rinish shu hujjatga keltiriladi.

*Hujjat versiyasi: 1.0 · Oila Hisobchi Design System · 2026*
