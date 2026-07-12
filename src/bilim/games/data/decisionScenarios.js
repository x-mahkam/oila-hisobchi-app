export const decisionScenarios = [
  {
    id: 1,
    title: { uz: "Bilimga sarmoya", ru: "Инвестиция в знания" },
    text: { 
      uz: "Sizda 100 000 so'm bor. Do'stingiz yangi moliyaviy kitob sotib olishni taklif qildi (u kelajakda pul topish sirlarini o'rgatadi). Ikkinchi variant — yangi kompyuter o'yinini sotib olish.", 
      ru: "У вас есть 100 000 сум. Друг предложил купить книгу по финансам (она научит секретам заработка). Второй вариант — купить новую компьютерную игру." 
    },
    options: [
      {
        text: { uz: "Kitob sotib olish", ru: "Купить книгу" },
        effect: { coins: 20, xp: 40 },
        feedback: {
          uz: "Ajoyib qaror! Kitob sotib olish — bu o'z ustingizda ishlash va kelajakka qilingan eng yaxshi sarmoyadir. Bilim doim daromad keltiradi!",
          ru: "Отличное решение! Покупка книги — это работа над собой и лучшая инвестиция в будущее. Знания всегда приносят доход!"
        }
      },
      {
        text: { uz: "O'yin sotib olish", ru: "Купить игру" },
        effect: { coins: -5, xp: 10 },
        feedback: {
          uz: "O'yin sizga vaqtinchalik xursandchilik beradi, lekin yangi ko'nikmalar bermaydi. Bu o'yin-kulgi xarajati bo'ldi.",
          ru: "Игра принесет временное удовольствие, но не даст новых навыков. Это были расходы на развлечения."
        }
      }
    ]
  },
  {
    id: 2,
    title: { uz: "Aksiya va Chegirmalar", ru: "Акции и скидки" },
    text: { 
      uz: "Siz do'konda poyabzal ko'ryapsiz. Chegirma bilan poyabzal 150 000 so'm turibdi, lekin sizga hozir poyabzal kerak emas. Ikkinchi variant — bu pulni kelgusi maqsadlar uchun olib qo'yish.", 
      ru: "Вы видите обувь в магазине. Со скидкой она стоит 150 000 сум, но вам она сейчас не нужна. Второй вариант — отложить эти деньги на будущие цели." 
    },
    options: [
      {
        text: { uz: "Keraksiz chegirmadan voz kechish", ru: "Отказаться от покупки со скидкой" },
        effect: { coins: 15, xp: 25 },
        feedback: {
          uz: "To'g'ri tanlov! Agar buyum kerak bo'lmasa, chegirmada ham uni sotib olmaslik haqiqiy tejashdir. Siz 150 000 so'm tejadingiz!",
          ru: "Правильный выбор! Если вещь не нужна, то даже со скидкой покупка — лишний расход. Вы сэкономили 150 000 сум!"
        }
      },
      {
        text: { uz: "Chegirma borligi uchun sotib olish", ru: "Купить ради скидки" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Afsuski, siz chegirma tuzog'iga tushdingiz. Keraksiz narsani sotib olish orqali pulingizni sarfladingiz.",
          ru: "К сожалению, вы попались в ловушку скидок. Купив ненужную вещь, вы просто потратили деньги."
        }
      }
    ]
  },
  {
    id: 3,
    title: { uz: "Moliyaviy xavfsizlik yostiqchasi", ru: "Финансовая подушка безопасности" },
    text: { 
      uz: "Siz har oy oladigan pulingizdan 10% ini daxlsiz jamg'arma sifatida saqlashni boshlamoqchisiz yoki hamma pulni shu oyda sarflab yubormoqchisiz.", 
      ru: "Вы хотите начать откладывать 10% от ежемесячных карманных денег в неприкосновенный фонд или потратить все деньги в этом месяце." 
    },
    options: [
      {
        text: { uz: "10% daxlsiz jamg'armaga qo'shish", ru: "Откладывать 10% в фонд" },
        effect: { coins: 25, xp: 35 },
        feedback: {
          uz: "Super! Moliyaviy xavfsizlik yostiqchasi kutilmagan vaziyatlarda (masalan, telefoningiz buzilib qolsa) sizni qiyin ahvoldan qutqaradi.",
          ru: "Супер! Финансовая подушка безопасности выручит вас в непредвиденных ситуациях (например, если сломается телефон)."
        }
      },
      {
        text: { uz: "Hamma pulni sarflash", ru: "Потратить все деньги" },
        effect: { coins: -15, xp: 5 },
        feedback: {
          uz: "Xavfli qaror. Kutilmagan vaziyat yuz bersa, siz qarz olishga yoki qiyin vaziyatda qolishga majbur bo'lasiz.",
          ru: "Опасное решение. Если случится непредвиденное, вам придется брать в долг или остаться в сложной ситуации."
        }
      }
    ]
  },
  {
    id: 4,
    title: { uz: "Tadbirkorlik tashabbusi", ru: "Предпринимательская инициатива" },
    text: { 
      uz: "Siz yozgi ta'tilda muzqaymoq sotish biznesini boshlamoqchisiz. Uskunalarni ijaraga olish va muzqaymoq sotib olish uchun 200 000 so'm sarmoya kerak. Yoki bu pulni shunchaki saqlash.", 
      ru: "Вы хотите начать бизнес по продаже мороженого на каникулах. Нужны инвестиции в 200 000 сум на аренду оборудования и закупку. Или просто сохранить деньги." 
    },
    options: [
      {
        text: { uz: "Biznesni boshlash va sarmoya kiritish", ru: "Начать бизнес и инвестировать" },
        effect: { coins: 30, xp: 50 },
        feedback: {
          uz: "Barakalla! Risk qilish va yangi biznes boshlash tadbirkorlik ko'nikmalarini rivojlantiradi. Bu sarmoya sizga foyda olib keladi!",
          ru: "Молодец! Риск и создание нового бизнеса развивают предпринимательские навыки. Эта инвестиция принесет вам хорошую прибыль!"
        }
      },
      {
        text: { uz: "Pulni shunchaki saqlash", ru: "Просто держать деньги" },
        effect: { coins: 5, xp: 10 },
        feedback: {
          uz: "Pul xavfsiz turadi, lekin o'smaydi va siz hech qanday yangi amaliy ko'nikmaga ega bo'lmaysiz.",
          ru: "Деньги будут в безопасности, но не будут расти, и вы не получите никаких новых практических навыков."
        }
      }
    ]
  },
  {
    id: 5,
    title: { uz: "Do'stga qarz berish", ru: "Давать в долг другу" },
    text: { 
      uz: "Sinfdoshingiz sizdan o'yinchoq sotib olish uchun pul qarz so'rayapti. Lekin uning avval ham qarzlarini qaytarmagan odati borligini bilasiz.", 
      ru: "Одноклассник просит у вас деньги в долг на покупку игрушки. Но вы знаете, что раньше он неохотно возвращал долги." 
    },
    options: [
      {
        text: { uz: "Qarz berishni yumshoqlik bilan rad etish", ru: "Вежливо отказать в долге" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Oqilona qaror. Moliyaviy ishonchsiz odamlarga qarz berish ko'pincha pulingizni yo'qotishga olib keladi. Moliyaviy chegaralarni belgilash muhim.",
          ru: "Мудрое решение. Давать в долг финансово ненадежным людям часто ведет к потере денег. Важно уметь ставить границы."
        }
      },
      {
        text: { uz: "Baribir qarz berish", ru: "Все равно дать в долг" },
        effect: { coins: -20, xp: 5 },
        feedback: {
          uz: "Afsuski, do'stingiz pulni vaqtida qaytarmadi. Do'stlik ham, pul ham xavf ostida qoldi.",
          ru: "К сожалению, ваш друг не вернул деньги вовремя. И дружба, и деньги оказались под угрозой."
        }
      }
    ]
  },
  {
    id: 6,
    title: { uz: "Bank depoziti", ru: "Банковский депозит" },
    text: { 
      uz: "Sizda yig'ilgan 500 000 so'm bor. Uni yillik 20% ustama bilan bankka omonatga qo'yishingiz mumkin yoki uyda hamyonda saqlashingiz mumkin.", 
      ru: "У вас есть накопленные 500 000 сум. Вы можете положить их на депозит в банк под 20% годовых или хранить дома в кошельке." 
    },
    options: [
      {
        text: { uz: "Bankda omonat ochish", ru: "Открыть депозит в банке" },
        effect: { coins: 25, xp: 30 },
        feedback: {
          uz: "To'g'ri! Bankdagi omonat pulingizni inflyatsiyadan himoya qiladi va foizlar hisobiga ko'paytiradi (Murakkab foiz effekti).",
          ru: "Правильно! Депозит в банке защищает деньги от инфляции и увеличивает их за счет процентов (эффект сложного процента)."
        }
      },
      {
        text: { uz: "Uyda saqlash", ru: "Хранить дома" },
        effect: { coins: 0, xp: 10 },
        feedback: {
          uz: "Uyda saqlangan pul ko'paymaydi va inflyatsiya tufayli vaqt o'tishi bilan o'z qiymatini yo'qotadi.",
          ru: "Деньги, хранящиеся дома, не приумножаются и со временем теряют свою покупательную способность из-за инфляции."
        }
      }
    ]
  },
  {
    id: 7,
    title: { uz: "Komissiya va To'lovlar", ru: "Комиссии и платежи" },
    text: { 
      uz: "Siz internet orqali buyurtma qilyapsiz. Birinchi sayt tezkor yetkazib berish bilan qo'shimcha 30 000 so'm oladi, ikkinchi sayt bepul yetkazib beradi lekin 2 kun kutish kerak.", 
      ru: "Вы заказываете товар онлайн. Первый сайт берет за быструю доставку дополнительно 30 000 сум, второй сайт доставляет бесплатно, но нужно подождать 2 дня." 
    },
    options: [
      {
        text: { uz: "2 kun kutish va bepul yetkazishni tanlash", ru: "Подождать 2 дня и выбрать бесплатную доставку" },
        effect: { coins: 15, xp: 15 },
        feedback: {
          uz: "Sabrli va tejamkor qaror! Agar shoshilinch bo'lmasa, qo'shimcha to'lovlardan qochish oqilona byudjet boshqaruvidir.",
          ru: "Терпеливое и экономное решение! Если покупка не срочная, избегание лишних комиссий — это разумно для бюджета."
        }
      },
      {
        text: { uz: "Tezkor yetkazib berishga to'lash", ru: "Оплатить быструю доставку" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Siz shunchaki sabrsizlik sababli qo'shimcha pul sarfladingiz va byudjetingizga zarar yetkazdingiz.",
          ru: "Вы потратили лишние деньги просто из-за нетерпения, что нанесло урон вашему бюджету."
        }
      }
    ]
  },
  {
    id: 8,
    title: { uz: "Xayriya qilish", ru: "Благотворительность" },
    text: { 
      uz: "Mahallangizda hayvonlar boshpanasi uchun yordam yig'ilmoqda. Jamg'armangizdan ozroq ulush ajratishni xohlaysizmi yoki yo'q?", 
      ru: "В вашем районе собирают помощь для приюта животных. Хотите выделить небольшую сумму из своих накоплений?" 
    },
    options: [
      {
        text: { uz: "Yordam ajratish (xayriya)", ru: "Пожертвовать (благотворительность)" },
        effect: { coins: 15, xp: 45 },
        feedback: {
          uz: "Saxovatli qaror! Xayriya moliyaviy baraka va jamiyat oldidagi ijtimoiy mas'uliyat hissini rivojlantiradi. Bu katta ma'naviy sarmoya!",
          ru: "Благородный выбор! Благотворительность развивает социальную ответственность и приносит внутреннее удовлетворение."
        }
      },
      {
        text: { uz: "Rad etish", ru: "Отказаться" },
        effect: { coins: 0, xp: 5 },
        feedback: {
          uz: "Siz pulingizni saqlab qoldingiz, lekin ezgu ishda ishtirok etish imkoniyatini qo'ldan boy berdingiz.",
          ru: "Вы сохранили деньги, но упустили возможность поучаствовать в добром деле."
        }
      }
    ]
  },
  {
    id: 9,
    title: { uz: "Qarz tuzog'i", ru: "Ловушка долгов" },
    text: { 
      uz: "Siz qimmat telefon sotib olmoqchisiz. Buning uchun katta foizli mikroqarz olishingiz yoki sabr qilib, har oy pul yig'ishingiz mumkin.", 
      ru: "Вы хотите купить дорогой телефон. Для этого можно взять микрокредит под большой процент или набраться терпения и откладывать каждый месяц." 
    },
    options: [
      {
        text: { uz: "Pul yig'ish (sabr qilish)", ru: "Копить деньги (подождать)" },
        effect: { coins: 30, xp: 40 },
        feedback: {
          uz: "Ajoyib! Qarz va kreditlar kelajakdagi daromadlaringizni yeb bitiradi. Sabr qilib pul yig'ish — eng sog'lom moliyaviy yo'ldir.",
          ru: "Отлично! Долги и кредиты забирают ваши будущие доходы. Терпеливое накопление — самый здоровый финансовый путь."
        }
      },
      {
        text: { uz: "Foizli qarzga sotib olish", ru: "Купить в кредит под проценты" },
        effect: { coins: -30, xp: 10 },
        feedback: {
          uz: "Xato! Foizlar tufayli siz telefon uchun uning haqiqiy narxidan deyarli ikki barobar ko'p to'laysiz va qarz tuzog'iga tushasiz.",
          ru: "Ошибка! Из-за процентов вы переплатите за телефон почти в два раза больше его реальной стоимости и попадете в долги."
        }
      }
    ]
  },
  {
    id: 10,
    title: { uz: "Rejalashtirilmagan xaridlar", ru: "Импульсивные покупки" },
    text: { 
      uz: "Do'konda aylanib yurganda chiroyli, lekin mutlaqo keraksiz suvenirni ko'rib qoldingiz. Uni darhol sotib olasizmi yoki 24 soat o'ylab ko'rasizmi?", 
      ru: "Гуляя по магазину, вы увидели красивый, но абсолютно ненужный сувенир. Купите его сразу или подумаете 24 часа?" 
    },
    options: [
      {
        text: { uz: "24 soatlik qoida (o'ylash)", ru: "Правило 24 часов (подумать)" },
        effect: { coins: 20, xp: 25 },
        feedback: {
          uz: "Daho! 24 soatlik qoida hissiyotlarga berilib keraksiz xaridlar (impulsiv) qilishdan himoya qiladi. Ertaga bu narsa kerak emasligini tushunasiz.",
          ru: "Гениально! Правило 24 часов уберегает от импульсивных покупок на эмоциях. Завтра вы поймете, что эта вещь вам не так уж и нужна."
        }
      },
      {
        text: { uz: "Darhol sotib olish", ru: "Купить сразу" },
        effect: { coins: -15, xp: 5 },
        feedback: {
          uz: "Afsuski, bu hissiyotli xarid bo'ldi. Ertaga bu suvenir uydagi keraksiz chang yig'uvchi buyumga aylanadi.",
          ru: "К сожалению, это была импульсивная покупка. Завтра этот сувенир превратится в обычный пылесборник дома."
        }
      }
    ]
  },
  {
    id: 11,
    title: { uz: "Moliyaviy firibgarlik", ru: "Финансовое мошенничество" },
    text: { 
      uz: "Telegramda sizga notanish odam yozib, 50 000 so'm tikib, 1 soatda 500 000 so'm qilib qaytaradigan o'yin haqida aytdi. Ishtirok etasizmi?", 
      ru: "В Telegram вам написал незнакомец и предложил вложить 50 000 сум, чтобы через час получить 500 000 сум. Будете участвовать?" 
    },
    options: [
      {
        text: { uz: "Suhbatni o'chirib yuborish (bloklash)", ru: "Удалить чат и заблокировать" },
        effect: { coins: 25, xp: 30 },
        feedback: {
          uz: "Juda to'g'ri! 'Tez boyish' va'dalari har doim firibgarlik (moliyaviy piramida) bo'ladi. Pulingizni saqlab qoldingiz!",
          ru: "Абсолютно верно! Обещания 'быстрого богатства' всегда оказываются мошенничеством (финансовой пирамидой). Вы спасли свои деньги!"
        }
      },
      {
        text: { uz: "Pul o'tkazib sinab ko'rish", ru: "Перевести деньги и попробовать" },
        effect: { coins: -25, xp: 5 },
        feedback: {
          uz: "Afsuski, firibgarlar pulni olishdi va sizni bloklab qo'yishdi. Hech qachon oson va tezkor mo'jizaviy daromadlarga ishonmang.",
          ru: "К сожалению, мошенники забрали деньги и заблокировали вас. Никогда не верьте обещаниям легких и быстрых денег."
        }
      }
    ]
  },
  {
    id: 12,
    title: { uz: "Kafolat muddati", ru: "Гарантийный срок" },
    text: { 
      uz: "Qimmatbaho naushnik sotib olayotganda do'kon qo'shimcha 10 000 so'm evaziga 2 yillik rasmiy kafolat taklif qildi. Kafolatni olasizmi?", 
      ru: "При покупке дорогих наушников магазин предложил 2 года официальной гарантии за дополнительные 10 000 сум. Возьмете гарантию?" 
    },
    options: [
      {
        text: { uz: "Kafolatni sotib olish", ru: "Купить гарантию" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "To'g'ri tanlov! Qimmatbaho texnika uchun rasmiy kafolat olish — kelajakdagi katta ta'mirlash xarajatlaridan sug'urtalanish demakdir.",
          ru: "Правильный выбор! Покупка гарантии для дорогой техники — это страховка от больших расходов на ремонт в будущем."
        }
      },
      {
        text: { uz: "Kafolatsiz sotib olish", ru: "Купить без гарантии" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Siz 10 000 so'm tejadingiz, lekin yaqin orada naushnik buzilib qolsa, yangisini to'liq narxga sotib olishingizga to'g'ri keladi.",
          ru: "Вы сэкономили 10 000 сум, но если наушники сломаются в ближайшее время, ремонт или покупка новых обойдется в полную стоимость."
        }
      }
    ]
  }
];
