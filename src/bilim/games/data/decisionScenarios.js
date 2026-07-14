export const decisionScenarios = [
  {
    id: 1,
    difficulty: "easy",
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
    difficulty: "easy",
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
    difficulty: "easy",
    title: { uz: "Moliyaviy xavfsizlik yostiqchasi", ru: "Финансовая подушка безопасности" },
    text: { 
      uz: "Siz har oy oladigan pulingizdan 10% ini daxlsiz jamg'arma sifatida saqlashni boshlamoqchisiz yoki hamma pulni shu oyda sarflav yubormoqchisiz.", 
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
    difficulty: "hard",
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
    difficulty: "medium",
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
    difficulty: "medium",
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
    difficulty: "easy",
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
    difficulty: "medium",
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
    difficulty: "hard",
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
    difficulty: "medium",
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
    difficulty: "hard",
    title: { uz: "Moliyaviy firibgarlik", ru: "Финансовое мошенничество" },
    text: { 
      uz: "Telegramda sizga notanish odam yozib, 50 000 so'm tikib, 1 soatda 500 000 so'm qilib qaytaradigan o'yin haqida aytdi. Ishtirok etasizmi?", 
      ru: "В Telegram вам написал незнакомец и предложил вложить 50 000 сум, чтобы через час получить 500 000 сум. Будет ли участвовать?" 
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
    difficulty: "medium",
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
  },
  {
    id: 13,
    difficulty: "easy",
    title: { uz: "Supermarketga borish", ru: "Поход в супермаркет" },
    text: {
      uz: "Siz supermarketga oziq-ovqat sotib olish uchun bormoqchisiz. Lekin juda qorningiz och. Variantlar: ovqatlanib keyin borish yoki hozirning o'zida och holda tezroq borish.",
      ru: "Вы собираетесь в супермаркет за продуктами, но очень голодны. Варианты: сначала перекусить дома или сразу пойти голодным."
    },
    options: [
      {
        text: { uz: "Avval to'yib ovqatlanish", ru: "Сначала поесть дома" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Barakalla! Och qoringa do'konga borish rejalashtirilmagan va keraksiz shirinliklar, gazli suvlar sotib olishga majbur qiladi. Siz pulingizni tejadingiz!",
          ru: "Молодец! Поход в магазин на голодный желудок заставляет покупать лишние сладости и закуски. Вы сэкономили бюджет!"
        }
      },
      {
        text: { uz: "Och holda borish", ru: "Пойти голодным" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Siz ochlik sababli savatga rejadagidan tashqari ko'plab keraksiz shirinlik va chipslarni solib, ko'p pul sarfladingiz.",
          ru: "Из-за голода вы набрали полную корзину вредных чипсов и конфет, серьезно переплатив за покупку."
        }
      }
    ]
  },
  {
    id: 14,
    difficulty: "medium",
    title: { uz: "Kredit karta taklifi", ru: "Предложение кредитки" },
    text: {
      uz: "Bank sizga bepul kredit karta taklif qildi va birinchi 30 kun foizsiz ekanini aytdi. Uni rasmiylashtirib, istalgan narsani xarid qilasizmi?",
      ru: "Банк предлагает вам бесплатную кредитную карту с беспроцентным периодом 30 дней. Оформите её для покупки любых капризов?"
    },
    options: [
      {
        text: { uz: "Taklifni rad etish", ru: "Отказаться от предложения" },
        effect: { coins: 20, xp: 25 },
        feedback: {
          uz: "Ajoyib moliyaviy onglilik! Kredit kartalar yo'q pulni sarflash hissiyotini beradi va odamlarni o'zi sezmagan holda qarz botqog'iga boshlaydi.",
          ru: "Отличная финансовая осознанность! Кредитные карты создают иллюзию обладания деньгами и незаметно загоняют людей в долги."
        }
      },
      {
        text: { uz: "Kredit kartani olish", ru: "Взять кредитную карту" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "Afsuski, 30 kun tez o'tdi va siz foizlarni qaytarishga qiynaldingiz. Kredit — bu birovning pulini olib, o'zinikini berishdir.",
          ru: "К сожалению, 30 дней пролетели быстро, и вам пришлось выплачивать проценты. Кредит — это трата чужих денег, а отдача своих."
        }
      }
    ]
  },
  {
    id: 15,
    difficulty: "easy",
    title: { uz: "Xaridlar ro'yxati", ru: "Список покупок" },
    text: {
      uz: "Siz kanselyariya do'koniga daftar sotib olgani bormoqchisiz. Borishdan oldin daftar, qalam va boshqa zarur narsalarni qog'ozga yozib olasizmi yoki shunchaki borasizmi?",
      ru: "Вы идете в магазин за канцелярией. Запишете ли вы необходимые тетради и ручки на лист бумаги перед выходом или просто пойдете?"
    },
    options: [
      {
        text: { uz: "Ro'yxat tuzib olish", ru: "Написать список" },
        effect: { coins: 15, xp: 15 },
        feedback: {
          uz: "Ajoyib odat! Ro'yxat sizni do'kondagi rang-barang reklama va keraksiz takliflardan himoya qiladi. Do'konda faqat kerakli narsani olasiz.",
          ru: "Отличная привычка! Список защищает вас от яркой рекламы и лишних трат. В магазине вы купите только то, что действительно нужно."
        }
      },
      {
        text: { uz: "Shunchaki borish", ru: "Просто пойти" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Siz bir nechta rangli qalamlar va yorqin bloknotlarni sotib oldingiz, lekin eng kerakli bo'lgan chizgichni esdan chiqarib qoldirdingiz.",
          ru: "Вы набрали кучу красивых наклеек и ярких блокнотов, но забыли купить самое главное — линейку и простые тетради."
        }
      }
    ]
  },
  {
    id: 16,
    difficulty: "hard",
    title: { uz: "Yig'ilgan sarmoya", ru: "Накопленный капитал" },
    text: {
      uz: "Sizda 1 000 000 so'm jamg'arma bor. Uni yillik 22% lik davlat obligatsiyalariga sarmoya qilasizmi yoki yangi chiqqan trenddagi krossovkani sotib olasizmi?",
      ru: "У вас есть сбережения 1 000 000 сум. Инвестируете ли вы их в государственные облигации под 22% годовых или купите новые трендовые кроссовки?"
    },
    options: [
      {
        text: { uz: "Obligatsiyalarga sarmoya qilish", ru: "Инвестировать в облигации" },
        effect: { coins: 35, xp: 45 },
        feedback: {
          uz: "Ajoyib! Obligatsiyalar eng ishonchli va kafolatlangan moliyaviy aktivlardan biridir. Pul siz uchun passiv daromad keltirishni boshladi!",
          ru: "Великолепно! Облигации — один из самых надежных финансовых инструментов. Ваши деньги начали работать на вас и приносить пассивный доход!"
        }
      },
      {
        text: { uz: "Trenddagi krossovkani olish", ru: "Купить трендовые кроссовки" },
        effect: { coins: -20, xp: 10 },
        feedback: {
          uz: "Krossovkalar kelgusi mavsumda urfdan qoladi va eskiradi, obligatsiyalar esa yillar davomida sizga pul keltirishi mumkin edi.",
          ru: "Кроссовки быстро выйдут из моды и износятся, тогда как облигации могли бы приносить вам стабильный доход годами."
        }
      }
    ]
  },
  {
    id: 17,
    difficulty: "easy",
    title: { uz: "Suvni tejash", ru: "Экономия воды" },
    text: {
      uz: "Tishlaringizni tozalayotganda kran suvi tinimsiz oqib turibdi. Uni o'chirib qo'yib, faqat chayishda yoqasizmi yoki ochiq qoldirasizmi?",
      ru: "Когда вы чистите зубы, вода из крана течет непрерывно. Будете ли вы закрывать кран во время чистки и открывать только для полоскания?"
    },
    options: [
      {
        text: { uz: "Kranni o'chirib qo'yish", ru: "Закрывать кран" },
        effect: { coins: 10, xp: 20 },
        feedback: {
          uz: "Barakalla! Bu ham tabiatni asrash, ham oilaviy kommunal xarajatlarni sezilarli darajada tejashga yordam beradi. Har bir tomchi puldir!",
          ru: "Молодец! Это помогает беречь экологию и заметно снижает семейные расходы на коммунальные услуги. Каждая капля — это деньги!"
        }
      },
      {
        text: { uz: "Suvni ochiq qoldirish", ru: "Оставлять воду открытой" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Isrofgarchilik! Ko'p litr toza suv behuda oqib ketdi va oylik suv hisoblagichi miqdori keraksiz oshdi.",
          ru: "Расточительство! Десятки литров чистой воды утекли впустую, увеличив ежемесячный счет за коммунальные услуги."
        }
      }
    ]
  },
  {
    id: 18,
    difficulty: "medium",
    title: { uz: "Uydagi ta'mirlash", ru: "Домашний ремонт" },
    text: {
      uz: "Sizning sevimli stulingizning oyog'i sinib qoldi. Uni tashlab yuborib yangisini olasizmi yoki usta chaqirib yoki o'zingiz ta'mirlab ko'rasizmi?",
      ru: "У вашего любимого стула сломалась ножка. Выбросите его и купите новый или попробуете починить самостоятельно (или позвать мастера)?"
    },
    options: [
      {
        text: { uz: "Ta'mirlab ishlatish", ru: "Починить стул" },
        effect: { coins: 15, xp: 25 },
        feedback: {
          uz: "Ajoyib ekologik va iqtisodiy qaror! Narsalarni qayta tiklash yangisini sotib olishdan ko'ra bir necha barobar arzonroqqa tushadi.",
          ru: "Отличное экологичное и экономичное решение! Восстановление старых вещей обходится гораздо дешевле, чем покупка новых."
        }
      },
      {
        text: { uz: "Yangi stul sotib olish", ru: "Купить новый стул" },
        effect: { coins: -15, xp: 5 },
        feedback: {
          uz: "Yangi stul qimmat turadi. Eski stulni ozgina harakat bilan yangidek qilish mumkin edi. Keraksiz xarajat qildingiz.",
          ru: "Новый стул стоит недешево. Старый стул можно было легко отремонтировать с минимальными затратами."
        }
      }
    ]
  },
  {
    id: 19,
    difficulty: "easy",
    title: { uz: "Sinf sovg'asi", ru: "Подарок однокласснику" },
    text: {
      uz: "Yaqin do'stingizning tug'ilgan kuni. Unga qimmat do'kon sovg'asini olasizmi yoki o'z qo'lingiz bilan chiroyli va mazmunli albom yasab berasizmi?",
      ru: "У вашего близкого друга день рождения. Купите дорогой подарок в магазине или сделаете красивый памятный альбом своими руками?"
    },
    options: [
      {
        text: { uz: "Albom yasash (DIY)", ru: "Сделать альбом своими руками" },
        effect: { coins: 15, xp: 30 },
        feedback: {
          uz: "Samimiy va tejamkor qaror! O'z qo'lingiz bilan mehr berib tayyorlangan sovg'alar do'kon buyumlaridan ko'ra qadrliroq hisoblanadi.",
          ru: "Душевное и экономное решение! Подарки, сделанные своими руками с любовью, часто ценятся гораздо выше бездушных покупных вещей."
        }
      },
      {
        text: { uz: "Qimmatbaho buyum sotib olish", ru: "Купить дорогую вещь" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Siz ko'p pul sarfladingiz, lekin sovg'angiz do'stingiz uchun u qadar chuqur xotira qoldirmasligi mumkin.",
          ru: "Вы потратили много карманных денег, хотя подарок ручной работы мог принести другу гораздо больше теплых эмоций."
        }
      }
    ]
  },
  {
    id: 20,
    difficulty: "medium",
    title: { uz: "Mobil internet paket", ru: "Пакет мобильного интернета" },
    text: {
      uz: "Telefoningiz uchun qaysi tarifni tanlaysiz: uydagi Wi-Fi borligini hisobga olib, kichik va arzon paketni yoki keragidan ortiq va qimmat cheksiz paketni?",
      ru: "Какой тариф вы выберете для телефона: небольшой и дешевый (учитывая домашний Wi-Fi) или дорогой безлимитный тариф на всякий случай?"
    },
    options: [
      {
        text: { uz: "Ehtiyojga yarasha arzon paket", ru: "Дешевый тариф под реальные нужды" },
        effect: { coins: 15, xp: 15 },
        feedback: {
          uz: "Moliyaviy hisob-kitobingiz to'g'ri! Ishlatilmaydigan megabaytlar uchun ortiqcha pul to'lash — bu shunchaki pulni havoga uchirishdir.",
          ru: "Правильный расчет! Платить за неиспользуемые гигабайты — это пустая трата денег. Вы выбрали практичность."
        }
      },
      {
        text: { uz: "Cheksiz qimmat tarif", ru: "Дорогой безлимитный тариф" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Siz har oy ko'p pul sarflaysiz, lekin uydagi bepul Wi-Fi tufayli mobil paketning bor-yo'g'i 10% ini ishlatasiz, xolos.",
          ru: "Вы ежемесячно переплачиваете за тариф, хотя из-за домашнего Wi-Fi тратите лишь малую часть мобильного интернета."
        }
      }
    ]
  },
  {
    id: 21,
    difficulty: "medium",
    title: { uz: "Kitob o'qish", ru: "Чтение книг" },
    text: {
      uz: "Siz yangi badiiy kitob o'qimoqchisiz. Uni do'kondan qimmat yangi qog'oz formatda sotib olasizmi yoki tuman kutubxonasiga a'zo bo'lib bepul ijaraga olasizmi?",
      ru: "Вы хотите прочитать новую художественную книгу. Купите её в магазине в твердом переплете или запишетесь в библиотеку бесплатно?"
    },
    options: [
      {
        text: { uz: "Kutubxonadan ijara olish", ru: "Записаться в библиотеку" },
        effect: { coins: 20, xp: 25 },
        feedback: {
          uz: "Ajoyib qaror! Kutubxonalar — bilim xazinasi va ulardan foydalanish shaxsiy byudjetingizga minglab so'mlarni tejash imkonini beradi.",
          ru: "Отличное решение! Библиотеки — это кладезь знаний, а их использование позволяет бесплатно читать сотни книг, сохраняя личный бюджет."
        }
      },
      {
        text: { uz: "Do'kondan yangi kitob sotib olish", ru: "Купить новую книгу в магазине" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Kitob javonda bir marta o'qilgandan so'ng chang bosib yotadi. Kutubxona orqali bu pulni boshqa maqsadlarga tejash mumkin edi.",
          ru: "Книга будет просто стоять на полке после одного прочтения. Использование библиотеки сэкономило бы ваши деньги."
        }
      }
    ]
  },
  {
    id: 22,
    difficulty: "easy",
    title: { uz: "Chiroqni o'chirish", ru: "Выключение света" },
    text: {
      uz: "Siz xonadan boshqa xonaga chiqib ketyapsiz. Chiroqni yoqilgan holda qoldirasizmi yoki tejamkorlik qilib chiroqni o'chirib chiqasizmi?",
      ru: "Вы переходите из одной комнаты в другую на долгое время. Оставите ли вы свет включенным или выключите его для экономии?"
    },
    options: [
      {
        text: { uz: "Chiroqni o'chirish", ru: "Выключить свет" },
        effect: { coins: 10, xp: 15 },
        feedback: {
          uz: "Barakalla! Energiya resurslarini tejash nafaqat tabiatga, balki oilaviy byudjetga ham foyda keltiradi. Kichik harakat — katta tejash!",
          ru: "Молодец! Экономия электроэнергии полезна как для экологии планеты, так и для семейного бюджета. Маленькое действие — большая польза!"
        }
      },
      {
        text: { uz: "Yoqilgan qoldirish", ru: "Оставить свет включенным" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Isrofgarchilik. Ishlatilmagan elektr energiyasi uchun ortiqcha pul to'lanadi va resurslar bekorga sarflanadi.",
          ru: "Нерационально. Электроэнергия расходуется вхолостую, увеличивая счета за коммунальные услуги."
        }
      }
    ]
  },
  {
    id: 23,
    difficulty: "medium",
    title: { uz: "Ugurli obunalar", ru: "Платные подписки" },
    text: {
      uz: "Siz har oy musiqa va filmlar saytlari obunasi uchun pul to'laysiz, lekin oxirgi paytlarda deyarli kirmayapsiz. Ulardan voz kechasizmi yoki turaveradimi?",
      ru: "Вы ежемесячно оплачиваете подписки на онлайн-кинотеатры, но в последнее время почти не пользуетесь ими. Отмените их?"
    },
    options: [
      {
        text: { uz: "Faol bo'lmagan obunalarni bekor qilish", ru: "Отменить неиспользуемые подписки" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Aqlli qaror! Ko'p odamlar avtomatik to'lovlar tufayli ishlatmaydigan xizmatlariga yillab pul to'lab yurishadi. Siz bu sizib chiquvchi xarajatni to'xtatdingiz.",
          ru: "Мудрое решение! Из-за автоплатежей люди годами переплачивают за ненужные услуги. Вы закрыли эту брешь в бюджете."
        }
      },
      {
        text: { uz: "Shunchaki qoldirish", ru: "Оставить всё как есть" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Har oy pul kartangizdan avtomatik yechiladi, lekin siz xizmatlardan foydalanmaysiz. Bu behuda xarajat.",
          ru: "Каждый месяц с вашей карты списываются деньги за то, чем вы не пользуетесь. Это неразумная трата ресурсов."
        }
      }
    ]
  },
  {
    id: 24,
    difficulty: "hard",
    title: { uz: "Kriptovalyuta vasvasasi", ru: "Крипто-хайп" },
    text: {
      uz: "Do'stingiz ijtimoiy tarmoqda yangi chiqqan kriptovalyuta 1 haftada 5 barobar o'sishini va'da qilayotganini ko'rib, hamma pulini unga tikmoqchi. Siz ham qo'shilasizmi?",
      ru: "Ваш знакомый увидел новую криптовалюту, которая обещает рост в 5 раз за неделю, и хочет вложить туда все деньги. Присоединитесь?"
    },
    options: [
      {
        text: { uz: "Voz kechish va moliyaviy tahlil qilish", ru: "Отказаться и изучить риски" },
        effect: { coins: 30, xp: 40 },
        feedback: {
          uz: "Ajoyib munosabat! Yuqori daromad va'da qiladigan joyda doimo yuqori risk va firibgarlik ehtimoli bo'ladi. Pulingizni xavfsiz saqladingiz.",
          ru: "Отличная реакция! Там, где обещают мгновенную сверхприбыль, всегда кроется огромный риск полной потери капитала."
        }
      },
      {
        text: { uz: "Tavakkal qilib bor pulni tikish", ru: "Рискнуть и вложить всё" },
        effect: { coins: -30, xp: 10 },
        feedback: {
          uz: "Bu juda katta xato! Kripto-loyiha firibgarlik bo'lib chiqdi va narxi bir kunda nolga tushdi. Hamma jamg'armangizni yo'qotdingiz.",
          ru: "Огромная ошибка! Проект оказался финансовым мыльным пузырем, и его цена упала до нуля. Вы потеряли все свои сбережения."
        }
      }
    ]
  },
  {
    id: 25,
    difficulty: "easy",
    title: { uz: "Maktab tushligi", ru: "Школьный обед" },
    text: {
      uz: "Siz maktab oshxonasidan har kuni qimmat pitsa va gazli suv sotib olasiz. Variant: haftada 3 marta uydan tayyorlangan foydali sendvich olib borish.",
      ru: "Вы каждый день покупаете в школьной столовой дорогую пиццу и газировку. Вариант: приносить из дома полезный сэндвич 3 раза в неделю."
    },
    options: [
      {
        text: { uz: "Uydan ovqat olib borish", ru: "Приносить еду из дома" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Barakalla! Uydan ovqat olib yurish ham sog'ligingiz uchun foydali, ham cho'ntak pulingizning yarmidan ko'pini tejashga imkon beradi.",
          ru: "Молодец! Домашняя еда гораздо полезнее для здоровья и позволяет сэкономить больше половины ваших карманных денег."
        }
      },
      {
        text: { uz: "Har kuni do'kondan sotib olish", ru: "Покупать всё в столовой" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Fast-fudga ko'p pul sarf bo'ldi va sog'ligingizga ham foyda keltirmadi. Cho'ntak pulingiz tez tugab qoladi.",
          ru: "Деньги быстро улетучились на фаст-фуд и чипсы, которые не приносят пользы организму. Карманные расходы выросли."
        }
      }
    ]
  },
  {
    id: 26,
    difficulty: "medium",
    title: { uz: "Katta idishda xarid", ru: "Покупка оптом" },
    text: {
      uz: "Siz har kuni uyingizga kichik idishdagi 0.5 litrlik suvdan olasiz. Do'konda 5 litrlik katta idishdagi suv 3 barobar arzonroq ekanini hisobladingiz. Katta idishdagini olasizmi?",
      ru: "Вы каждый день покупаете домой воду в маленьких бутылках по 0.5л. Вы посчитали, что большая 5-литровая бутыль стоит в 3 раза дешевле. Купите большую?"
    },
    options: [
      {
        text: { uz: "Katta idishdagini sotib olish", ru: "Купить большую бутыль" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "To'g'ri moliyaviy hisob! Bir dona katta qadoqda mahsulot sotib olish bir martalik kichik qadoqlarga qaraganda ancha arzonga tushadi (ulgurji tejash).",
          ru: "Верный финансовый расчет! Покупка в большой упаковке всегда выгоднее мелкой фасовки и уменьшает количество пластикового мусора."
        }
      },
      {
        text: { uz: "Kichik idishda olishni davom etish", ru: "Продолжать брать маленькие" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Siz qadoq va plastik uchun keraksiz pul to'layapsiz va ko'proq chiqindi hosil qilyapsiz.",
          ru: "Вы переплачиваете за упаковку и пластик в несколько раз больше, создавая лишние расходы на ровном месте."
        }
      }
    ]
  },
  {
    id: 27,
    difficulty: "easy",
    title: { uz: "Eski kitoblar", ru: "Старые книги" },
    text: {
      uz: "Yangi o'quv yili uchun darsliklar sotib olishingiz kerak. Variantlar: yangi nashrdan chop etilgan darslik olish yoki yuqori sinf o'quvchilaridan arzon narxda ishlatilganini sotib olish.",
      ru: "Вам нужны учебники на новый учебный год. Варианты: купить новые книги в магазине или купить б/у учебники у старшеклассников вдвое дешевле."
    },
    options: [
      {
        text: { uz: "Ishlatilgan darsliklarni olish", ru: "Купить подержанные учебники" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Ajoyib oqilonalik! Ishlatilgan yaxshi holatdagi kitoblarni olish shaxsiy byudjetni juda yaxshi asraydi va narsalarga ikkinchi hayot beradi.",
          ru: "Отличный выбор! Покупка подержанных книг в хорошем состоянии существенно экономит бюджет и помогает экологии."
        }
      },
      {
        text: { uz: "Faqat yangisini sotib olish", ru: "Купить только новые" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Kitoblar tarkibi mutlaqo bir xil bo'lsa ham, siz faqat yaltiroq muqova uchun ikki barobar ko'proq pul to'ladingiz.",
          ru: "Содержимое книг одинаковое, но вы переплатили в два раза больше просто за новую обложку учебника."
        }
      }
    ]
  },
  {
    id: 28,
    difficulty: "medium",
    title: { uz: "Velosiped sotib olish", ru: "Покупка велосипеда" },
    text: {
      uz: "Siz har kuni maktabga borib kelish uchun taksiga pul sarflaysiz. Velosiped sotib olib, ham sport bilan shug'ullanishni, ham xarajatni kamaytirishni xohlaysizmi?",
      ru: "Вы тратите много денег на такси, чтобы добираться до учебы. Хотите купить велосипед, чтобы экономить на проезде и заниматься спортом?"
    },
    options: [
      {
        text: { uz: "Velosiped sotib olish va minish", ru: "Купить велосипед" },
        effect: { coins: 25, xp: 30 },
        feedback: {
          uz: "Super investitsiya! Velosiped yo'lkira xarajatini nolga tushiradi va uzoq muddatda sizning eng yaxshi sog'liq sarmoyangizga aylanadi.",
          ru: "Супер инвестиция! Велосипед снижает расходы на проезд до нуля, укрепляет здоровье и быстро окупает свою стоимость."
        }
      },
      {
        text: { uz: "Taksidan foydalanishda davom etish", ru: "Продолжать ездить на такси" },
        effect: { coins: -20, xp: 5 },
        feedback: {
          uz: "Taksi xarajatlari oylik byudjetingizni yeb bitiradi, uzoq muddatda siz hech qanday aktivga ega bo'lmay, pul yo'qotasiz.",
          ru: "Расходы на такси продолжают опустошать кошелек, не принося долгосрочной пользы вашему здоровью и бюджету."
        }
      }
    ]
  },
  {
    id: 29,
    difficulty: "hard",
    title: { uz: "Murakkab foiz mo'jizasi", ru: "Магия сложного процента" },
    text: {
      uz: "Sizda 200 000 so'm bor. Agar uni hozir bank omonatiga qo'ysangiz va 5 yil davomida olmasangiz, foizlar o'z-o'zidan ko'payib boradi. Yoki hozir yangi quloqchin sotib olish kerak.",
      ru: "У вас есть 200 000 сум. Если положить их в банк на 5 лет без снятия, проценты будут капитализироваться и расти лавиной. Или купить наушники сейчас."
    },
    options: [
      {
        text: { uz: "Murakkab foizli omonat ochish", ru: "Открыть вклад со сложным процентом" },
        effect: { coins: 30, xp: 45 },
        feedback: {
          uz: "Daho moliyachi! Murakkab foizlar — Al'bert Eynshteyn aytganidek dunyoning sakkizinchi mo'jizasidir. Vaqt o'tishi bilan kichik pul katta kapitalga aylanadi.",
          ru: "Гениальный инвестор! Сложный процент — это восьмое чудо света. Со временем даже малые вложения вырастают в крупный капитал."
        }
      },
      {
        text: { uz: "Quloqchin sotib olish", ru: "Купить наушники сейчас" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Quloqchin 1 yildan keyin buziladi yoki eskiradi, bankdagi omonat esa kelajakda sizga o'nlab shunday quloqchinlarni tekin qilib berishi mumkin edi.",
          ru: "Наушники быстро потеряют ценность, в то время как сложный процент мог бы приумножить ваши деньги в несколько раз."
        }
      }
    ]
  },
  {
    id: 30,
    difficulty: "easy",
    title: { uz: "Telefon g'ilofi", ru: "Чехол для телефона" },
    text: {
      uz: "Telefoningiz uchun yangi g'ilof (chexol) olmoqchisiz. Do'konda bir xil g'ilof 50 000 so'm, internet platformada esa 20 000 so'm, lekin 3 kun kutish kerak.",
      ru: "Вы хотите купить новый чехол для телефона. В магазине он стоит 50 000 сум, а на маркетплейсе — 20 000 сум, но с доставкой через 3 дня."
    },
    options: [
      {
        text: { uz: "Internetdan buyurtma qilish va kutish", ru: "Заказать онлайн и подождать" },
        effect: { coins: 15, xp: 15 },
        feedback: {
          uz: "Ajoyib tejash! Oddiy sabr orqali siz mahsulot narxining 60% ini saqlab qoldingiz. Tejalgan pul — bu topilgan puldir!",
          ru: "Отличная экономия! Обычное терпение сберегло вам 60% стоимости товара. Сэкономленные деньги — это заработанные деньги!"
        }
      },
      {
        text: { uz: "Do'kondan darhol sotib olish", ru: "Купить сразу в магазине" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Siz shunchaki sabrsizlik qilganingiz uchun ortiqcha 30 000 so'm sarfladingiz va byudjetingizni kamaytirdingiz.",
          ru: "Вы переплатили 30 000 сум просто из-за нежелания подождать несколько дней. Бюджет понес лишние потери."
        }
      }
    ]
  },
  {
    id: 31,
    difficulty: "easy",
    title: { uz: "Sut sotib olish", ru: "Покупка молока" },
    text: {
      uz: "Sizga 1 litr sut kerak. Do'konda 1 litrlik sut qutisi 12 000 so'm, 2 litrligi esa maxsus aksiya bilan 18 000 so'm turibdi (siz 2 kunda sutni ichib tugata olasiz). Qaysi birini olasiz?",
      ru: "Вам нужен 1 литр молока. В магазине коробка 1 литр стоит 12 000 сум, а 2 литра по акции — 18 000 сум (вы успеете выпить его за 2 дня). Какой возьмете?"
    },
    options: [
      {
        text: { uz: "2 litrlik aksiyadagi sutni olish", ru: "Купить 2 литра по акции" },
        effect: { coins: 15, xp: 15 },
        feedback: {
          uz: "Oqilona va tejamkor qaror! Agar mahsulotni isrof qilmasdan ishlatishga ulgursangiz, aksiyadagi kattaroq qadoqni olish foydaliroqdir.",
          ru: "Умное и экономное решение! Если вы успеете использовать продукт до истечения срока годности, покупка большего объема по акции выгодна."
        }
      },
      {
        text: { uz: "1 litrlik oddiy sutni olish", ru: "Купить 1 литр молока" },
        effect: { coins: 5, xp: 5 },
        feedback: {
          uz: "Siz kerakli miqdorni oldingiz, lekin uzoq muddatda har bir litr sut uchun ortiqcha pul sarfladingiz.",
          ru: "Вы купили ровно столько, сколько нужно, но упустили возможность сэкономить на литре молока."
        }
      }
    ]
  },
  {
    id: 32,
    difficulty: "medium",
    title: { uz: "Uydagi chiroqlar", ru: "Лампочки в доме" },
    text: {
      uz: "Siz uyingizdagi eski, ko'p tok yeydigan cho'g'lanma lampalarni qimmatroq turadigan, lekin tejamkor va bardoshli LED svetodiodli lampalarga almashtirmoqchisiz. Nima qilasiz?",
      ru: "Вы хотите заменить старые лампы накаливания, которые потребляют много энергии, на более дорогие, но энергоэффективные LED-лампы."
    },
    options: [
      {
        text: { uz: "LED lampalarga almashtirish", ru: "Заменить на LED-лампы" },
        effect: { coins: 20, xp: 25 },
        feedback: {
          uz: "Ajoyib sarmoya! LED lampalar 90% gacha kamroq tok sarflaydi va 10 barobar uzoqroq xizmat qiladi. Oylik to'lovingiz sezilarli kamayadi.",
          ru: "Отличная инвестиция! LED-лампы потребляют до 90% меньше энергии и служат в 10 раз дольше. Ваши счета за свет быстро уменьшатся."
        }
      },
      {
        text: { uz: "Eski lampalarni qoldirish", ru: "Оставить старые лампы" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Siz hozir lampa olish uchun pul tejamadingiz, lekin har oy elektr energiyasi uchun ortiqcha pul to'lashda davom etasiz.",
          ru: "Вы сэкономили на покупке ламп сейчас, но будете продолжать переплачивать за электроэнергию каждый месяц."
        }
      }
    ]
  },
  {
    id: 33,
    difficulty: "hard",
    title: { uz: "Sarmoyadorlik", ru: "Инвестирование" },
    text: {
      uz: "Sizda ma'lum miqdorda sarmoya bor. Hammasini bitta yangi ochilayotgan startap kompaniyaga tikasizmi yoki bir qismini bankka, bir qismini aksiyalarga taqsimlaysizmi (diversifikatsiya)?",
      ru: "У вас есть сумма для инвестиций. Вложите ли вы все деньги в один многообещающий стартап или распределите между банком и акциями разных компаний?"
    },
    options: [
      {
        text: { uz: "Mablag'ni taqsimlash (Diversifikatsiya)", ru: "Распределить риски (Диверсификация)" },
        effect: { coins: 30, xp: 40 },
        feedback: {
          uz: "Tashakkur, haqiqiy investor! 'Hamma tuxumni bitta savatga solma' qoidasi xavfni kamaytiradi va mablag'ingizni yo'qotishdan saqlaydi.",
          ru: "Спасибо, настоящий инвестор! Правило 'не клади все яйца в одну корзину' минимизирует риски и защищает ваши сбережения."
        }
      },
      {
        text: { uz: "Bor pulni bitta startapga tikish", ru: "Вложить всё в один стартап" },
        effect: { coins: -20, xp: 10 },
        feedback: {
          uz: "Juda katta xavf. Startap muvaffaqiyatsizlikka uchragani sababli siz barcha sarmoyangizdan ayrilib qoldingiz.",
          ru: "Огромный риск. Стартап прогорел, и из-за отсутствия распределения рисков вы потеряли все свои инвестиции."
        }
      }
    ]
  },
  {
    id: 34,
    difficulty: "easy",
    title: { uz: "Chiqindilarni saralash", ru: "Сортировка мусора" },
    text: {
      uz: "Uyingizda ko'plab eski qog'ozlar, karton qutilar va plastik butilkalar yig'ilib qoldi. Ularni shunchaki axlatga tashlaysizmi yoki makulaturaga topshirib pul olasizmi?",
      ru: "Дома скопилось много старых газет, картонных коробок и пластиковых бутылок. Выбросите в общий мусор или сдадите на переработку за деньги?"
    },
    options: [
      {
        text: { uz: "Qayta ishlashga topshirish", ru: "Сдать на вторичную переработку" },
        effect: { coins: 15, xp: 25 },
        feedback: {
          uz: "Barakalla! Ham ekologiyaga foyda keltirdingiz, ham keraksiz chiqindidan kichik bo'lsa-da moddiy daromad oldingiz. Juda oqilona!",
          ru: "Молодец! Вы помогли экологии и получили небольшую копеечку за ненужный хлам. Это разумное использование ресурсов!"
        }
      },
      {
        text: { uz: "Axlat qutisiga tashlash", ru: "Просто выбросить в мусор" },
        effect: { coins: 0, xp: 5 },
        feedback: {
          uz: "Siz qo'shimcha daromad olish va tabiatni asrash imkoniyatini qo'ldan boy berdingiz. Chiqindilar tabiatda uzoq yillar chirib yotadi.",
          ru: "Вы упустили возможность подзаработать и внести вклад в защиту природы. Мусор отправился на обычную свалку."
        }
      }
    ]
  },
  {
    id: 35,
    difficulty: "medium",
    title: { uz: "Eski o'yinchoqlar", ru: "Старые игрушки" },
    text: {
      uz: "Siz ulg'aydingiz va eski o'yinchoqlaringiz ortiqcha joy egallab yotibdi. Variantlar: ularni arzonroq narxda sotuv saytlariga qo'yish yoki shunchaki tashlab yuborish.",
      ru: "Вы выросли, и ваши старые детские игрушки просто пылятся в шкафу. Выставите их на продажу в интернете подешевле или выбросите?"
    },
    options: [
      {
        text: { uz: "Sotuvga qo'yib pul topish", ru: "Продать через интернет-объявления" },
        effect: { coins: 20, xp: 20 },
        feedback: {
          uz: "Ajoyib! Eskirgan narsalaringizni sotish orqali siz hamyoningizni to'ldirdingiz va xonangizda bo'sh joy ochdingiz.",
          ru: "Прекрасно! Продажа ненужных вещей приносит дополнительный доход и помогает расчистить домашнее пространство."
        }
      },
      {
        text: { uz: "Shunchaki tashlab yuborish", ru: "Просто выбросить" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Siz yaxshi holatdagi narsalardan mutlaqo foydasiz voz kechdingiz, vaziyatdan foyda olish imkoni bor edi.",
          ru: "Вы выбросили хорошие вещи, лишившись возможности заработать карманные деньги на их продаже."
        }
      }
    ]
  },
  {
    id: 36,
    difficulty: "easy",
    title: { uz: "Bozorda savdolashish", ru: "Торг на рынке" },
    text: {
      uz: "Siz bozordan meva sotib olyapsiz. Sotuvchi uzum uchun 30 000 so'm so'radi, lekin do'stona tarzda savdolashib narxni tushirish imkoni bor. Harakat qilasizmi?",
      ru: "Вы покупаете фрукты на рынке. Продавец просит за виноград 30 000 сум, но есть возможность вежливо поторговаться и снизить цену. Попробуете?"
    },
    options: [
      {
        text: { uz: "Chiroyli muomala bilan savdolashish", ru: "Вежливо поторговаться" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Siz haqiqiy tadbirkorsiz! Chiroyli muzokara o'tkazish orqali uzumni 22 000 so'mga olishga erishdingiz va pulni tejadingiz.",
          ru: "Вы отличный переговорщик! С помощью вежливого общения вы снизили цену до 22 000 сум и сэкономили деньги."
        }
      },
      {
        text: { uz: "Aytilgan narxni to'lab qo'ya qolish", ru: "Заплатить полную цену без торга" },
        effect: { coins: 5, xp: 5 },
        feedback: {
          uz: "Siz sotuvchining birinchi aytgan narxiga rozi bo'ldingiz, savdolashish mahoratingizni sinab ko'rish imkonidan foydalanmadingiz.",
          ru: "Вы сразу согласились на первую цену, упустив шанс потренировать навык общения и сохранить часть денег."
        }
      }
    ]
  },
  {
    id: 37,
    difficulty: "medium",
    title: { uz: "Keshbek va To'lovlar", ru: "Кэшбэк и платежи" },
    text: {
      uz: "Do'konda to'lov qilyapsiz. Naqd pul to'lasangiz hech qanday bonus yo'q, lekin ilova yoki plastik karta orqali to'lasangiz 2% keshbek (pul qaytarish) beriladi. Qaysi yo'lni tanlaysiz?",
      ru: "Вы оплачиваете покупку в магазине. Наличными — без бонусов, а через платежное приложение или карту — с кэшбэком 2%. Что выберете?"
    },
    options: [
      {
        text: { uz: "Karta orqali keshbek bilan to'lash", ru: "Оплатить картой с кэшбэком" },
        effect: { coins: 15, xp: 15 },
        feedback: {
          uz: "Juda to'g'ri! Kichik foizli keshbeklar yig'ilib, oylar davomida katta summani tashkil etadi va tejamkorlikka xizmat qiladi.",
          ru: "Абсолютно верно! Маленькие проценты кэшбэка со временем суммируются в приличные сбережения. Это умная экономия."
        }
      },
      {
        text: { uz: "Naqd pulda to'lash", ru: "Оплатить наличными" },
        effect: { coins: 0, xp: 5 },
        feedback: {
          uz: "Siz hech qanday foyda olmadingiz, keshbek orqali tejaladigan pulni do'konga qoldirib ketdingiz.",
          ru: "Вы не получили никакой выгоды, просто упустив возможность вернуть часть потраченных средств обратно на карту."
        }
      }
    ]
  },
  {
    id: 38,
    difficulty: "easy",
    title: { uz: "Muzlatgich eshigi", ru: "Дверца холодильника" },
    text: {
      uz: "Siz shirinlik qidirib muzlatgich eshigini uzoq vaqt ochiq qoldirib, o'ylanib turibsiz. Bu odat to'g'rimi yoki tezda yopish kerakmi?",
      ru: "Вы ищете вкусняшки и долго стоите перед открытой дверцей холодильника, размышляя. Стоит ли быстрее закрыть дверцу?"
    },
    options: [
      {
        text: { uz: "Tezda yopish va oldindan o'ylab ochish", ru: "Быстро закрыть и думать до открытия" },
        effect: { coins: 10, xp: 15 },
        feedback: {
          uz: "Ajoyib munosabat! Muzlatgich eshigi ochiq tursa, u ichkarini sovitish uchun ko'p elektr energiyasi sarflaydi va oilaviy byudjetga ziyon yetadi.",
          ru: "Отличный выбор! Открытая дверца заставляет холодильник работать на полную мощность, что увеличивает расход электроэнергии."
        }
      },
      {
        text: { uz: "Eshikni ochiq qoldirib o'ylashda davom etish", ru: "Оставить открытой и долго думать" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Muzlatgich ichidagi harorat ko'tarilib ketdi va u ko'p tok isrof qildi. Kommunal to'lov keraksiz oshdi.",
          ru: "Температура внутри повысилась, и холодильник потратил много электроэнергии на охлаждение. Лишние траты для семьи."
        }
      }
    ]
  },
  {
    id: 39,
    difficulty: "medium",
    title: { uz: "Avtobus va Taksi", ru: "Автобус или Такси" },
    text: {
      uz: "Siz do'stingiz bilan uchrashishga shoshilmayapsiz, vaqtingiz bemalol. Maktabgacha bo'lgan yo'lni taksida (15 000 so'm) bosib o'tasizmi yoki avtobusda (2 000 so'm) borasizmi?",
      ru: "Вы не торопитесь на встречу с другом. Поедете ли вы на такси за 15 000 сум или выберете автобус за 2 000 сум?"
    },
    options: [
      {
        text: { uz: "Avtobusda borish", ru: "Поехать на автобусе" },
        effect: { coins: 15, xp: 15 },
        feedback: {
          uz: "Ajoyib tejamkorlik! Shoshilinch bo'lmaganda jamoat transportidan foydalanish hamyonni keraksiz xarajatlardan asraydi.",
          ru: "Отличная экономия! Использование общественного транспорта при отсутствии спешки бережет ваши карманные деньги."
        }
      },
      {
        text: { uz: "Taksida ketish", ru: "Поехать на такси" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Ortiqcha dabdaba. Shoshilinch bo'lmagan vaziyatda taksiga pul sarflash — shaxsiy byudjetga asossiz xarajat demakdir.",
          ru: "Излишние расходы. Тратить деньги на такси без острой необходимости — нерациональное отношение к бюджету."
        }
      }
    ]
  },
  {
    id: 40,
    difficulty: "hard",
    title: { uz: "Yo'qotilgan sarmoya", ru: "Утерянные вложения" },
    text: {
      uz: "Siz juda qimmat o'yin konsolini sotib oldingiz, lekin u 2 kunda buzildi va uni ta'mirlash uning narxidan ham qimmatroq turadi. Ta'mirga yana pul sarflaysizmi (sunk cost tuzog'i) yoki undan voz kechasizmi?",
      ru: "Вы купили дорогую игровую приставку, но она сломалась. Ремонт стоит дороже её цены. Будете ли вы тратить деньги на ремонт или откажетесь от неё?"
    },
    options: [
      {
        text: { uz: "Ta'mirdan voz kechish va zarar bilan murosaga kelish", ru: "Отказаться от ремонта и принять потерю" },
        effect: { coins: 25, xp: 35 },
        feedback: {
          uz: "Ajoyib moliyaviy psixologiya! Avval sarflangan pulni deb keraksiz va asossiz yangi xarajatlar girdobiga tushmaslik juda katta mahoratdir.",
          ru: "Отличная финансовая психология! Умение вовремя остановиться и не тратить новые деньги из-за жалости к старым расходам — редкий навык."
        }
      },
      {
        text: { uz: "Baribir pul sarflab ta'mirlatish", ru: "Всё равно оплатить дорогой ремонт" },
        effect: { coins: -25, xp: 5 },
        feedback: {
          uz: "Afsuski, siz 'Ketgan pulga achinish' tuzog'iga tushdingiz va konsol baribir yaxshi ishlamadi, natijada ikki karobar ko'p pul yo'qotdingiz.",
          ru: "К сожалению, вы попали в ментальную ловушку невозвратных затрат. Вы потратили кучу денег, а приставка все равно сломалась."
        }
      }
    ]
  },
  {
    id: 41,
    difficulty: "easy",
    title: { uz: "Tomchilab oqayotgan kran", ru: "Капающий кран" },
    text: {
      uz: "Uyingizdagi suv krani tomchilab oqyapti. Uni hozir usta chaqirib yoki o'zingiz rezinasini almashtirib sozlab qo'yasizmi yoki turaveradimi?",
      ru: "Дома капает кран. Почините ли вы его самостоятельно (или позовете мастера) сейчас или отложите ремонт на потом?"
    },
    options: [
      {
        text: { uz: "Kranni darhol ta'mirlash", ru: "Сразу отремонтировать кран" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Juda to'g'ri! Tomchilayotgan kran bir oyda minglab litr suvni isrof qiladi va oylik suv to'lovini asossiz ravishda ko'paytiradi.",
          ru: "Правильно! Капающий кран за месяц может потратить тысячи литров чистой воды, существенно увеличив расходы на коммунальные платежи."
        }
      },
      {
        text: { uz: "Keyinga qoldirish", ru: "Отложить ремонт на потом" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Suv behuda oqishda davom etmoqda, suv hisoblagichi esa sizning pulingizni hisoblayapti. Kelajakda ko'p pul to'laysiz.",
          ru: "Вода продолжает утекать впустую, увеличивая долг за воду. Позже ремонт всё равно придется сделать, но вы уже переплатили."
        }
      }
    ]
  },
  {
    id: 42,
    difficulty: "medium",
    title: { uz: "Do'stlar bilan ulashish", ru: "Подписка на двоих" },
    text: {
      uz: "Siz ingliz tili o'rganish saytida qimmat premium akkaunt sotib olmoqchisiz. Variantlar: do'stingiz bilan pulni teng bo'lishib, oilaviy paket sotib olish yoki hammasini o'zingiz to'lash.",
      ru: "Вы хотите купить премиум-аккаунт для изучения английского. Варианты: купить семейный доступ на двоих с другом или оплатить всё самому."
    },
    options: [
      {
        text: { uz: "Do'st bilan sherik bo'lib sotib olish", ru: "Купить совместный доступ с другом" },
        effect: { coins: 20, xp: 25 },
        feedback: {
          uz: "Ajoyib hamkorlik! Xarajatlarni bo'lishish (shering iqtisodiyoti) shaxsiy byudjetni asrashning zamonaviy va samarali usulidir.",
          ru: "Отличное сотрудничество! Разделение расходов (шеринг-экономика) — это современный и эффективный способ экономии личных денег."
        }
      },
      {
        text: { uz: "To'liq narxni o'zi to'lash", ru: "Оплатить полную стоимость в одиночку" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Siz bir xil xizmat uchun ikki barobar ko'proq pul sarfladingiz, sheriklik imkoniyatidan foydalanmadingiz.",
          ru: "Вы переплатили за тот же функционал в два раза больше, хотя могли легко разделить траты с единомышленником."
        }
      }
    ]
  },
  {
    id: 43,
    difficulty: "easy",
    title: { uz: "Kinoteatrdagi yegulik", ru: "Еда в кинотеатре" },
    text: {
      uz: "Siz kinoteatrga boryapsiz. U yerdagi popkorn va ichimliklar do'kondagidan 3 barobar qimmat turadi. Nima qilasiz?",
      ru: "Вы идете в кинотеатр. Попкорн и напитки там стоят в 3 раза дороже обычного магазина. Как поступите?"
    },
    options: [
      {
        text: { uz: "Do'kondan oddiy narxda ichimlik olib borish", ru: "Купить напиток заранее в супермаркете" },
        effect: { coins: 15, xp: 15 },
        feedback: {
          uz: "Aqlli tejash! Kinoteatrlardagi yashirin va qimmat ustamalardan qochish oqilona byudjet boshqaruvining yaxshi namunasidir.",
          ru: "Умная экономия! Избегание завышенных наценок в развлекательных центрах бережет ваши карманные деньги от пустых трат."
        }
      },
      {
        text: { uz: "Kinoteatr peshtaxtasidan xarid qilish", ru: "Купить попкорн на кассе кинотеатра" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Siz shunchaki do'kondagi oddiy suv va shirinlik uchun 3 barobar ko'proq pul to'ladingiz va byudjetingizga zarar yetkazdingiz.",
          ru: "Вы значительно переплатили за обычную воду и попкорн, поддавшись атмосфере кинотеатра."
        }
      }
    ]
  },
  {
    id: 44,
    difficulty: "medium",
    title: { uz: "Sifat va Narx", ru: "Качество и Цена" },
    text: {
      uz: "Sizga maktab sumkasi kerak. Bozor va do'konda ikki xil sumka bor: arzon tez yirtiladigan sumka (50 000 so'm) va qimmat sifatli chidamli sumka (150 000 so'm). Qaysi birini sotib olasiz?",
      ru: "Вам нужен школьный рюкзак. Есть дешевый рюкзак за 50 000 сум, но он быстро рвется, и качественный прочный за 150 000 сум. Какой выберете?"
    },
    options: [
      {
        text: { uz: "Sifatli va qimmat sumkani olish", ru: "Купить качественный прочный рюкзак" },
        effect: { coins: 20, xp: 30 },
        feedback: {
          uz: "To'g'ri qaror! 'Sipor (arzon) narsa olguncha, bir marta sifatlisini ol' degan naql bejiz aytilmagan. Uzoq muddatda siz pulingizni tejadingiz.",
          ru: "Правильное решение! Как говорят, 'скупой платит дважды'. Качественная вещь прослужит годами, избавляя от повторных трат."
        }
      },
      {
        text: { uz: "Arzon sumkani sotib olish", ru: "Купить дешевый рюкзак" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Siz hozir tejadingiz, lekin sumka 2 oydan keyin yirtildi va yana yangi sumka sotib olishga majbur bo'ldingiz, xarajatingiz oshib ketdi.",
          ru: "Вы сэкономили сейчас, но рюкзак порвался через пару месяцев. Вам придется снова покупать рюкзак, потратив в итоге больше."
        }
      }
    ]
  },
  {
    id: 45,
    difficulty: "hard",
    title: { uz: "Do'stona sheriklik", ru: "Дружеское партнёрство" },
    text: {
      uz: "Siz do'stingiz bilan birgalikda rasm chizib sotish biznesini yo'lga qo'ymoqchisiz. Ishni boshlashdan oldin barcha xarajatlar va foyda taqsimotini yozma ravishda kelishib olasizmi yoki shunchaki og'zaki gaplashib ketaverasizmi?",
      ru: "Вы с другом хотите запустить бизнес по продаже рисунков. Зафиксируете ли вы письменно распределение расходов и прибыли или договоритесь устно?"
    },
    options: [
      {
        text: { uz: "Yozma shartnoma tuzib kelishib olish", ru: "Зафиксировать договоренности письменно" },
        effect: { coins: 25, xp: 40 },
        feedback: {
          uz: "Barakalla, professional munosabat! Aniq yozma kelishuv kelajakdagi tushunmovchiliklar, do'stlikning buzilishi va moliyaviy yo'qotishlarning oldini oladi.",
          ru: "Молодец, профессиональный подход! Письменные правила и соглашения спасают бизнес от разногласий, а друзей — от обид."
        }
      },
      {
        text: { uz: "Og'zaki gaplashib boshlash", ru: "Договориться устно" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "Afsuski, birinchi daromad kelganda foyda bo'lishish ustida kelisha olmay do'stligingizga ham, ishingizga ham putur yetdi.",
          ru: "К сожалению, при первом же разделении прибыли у вас возник спор, который навредил и вашему делу, и вашей дружбе."
        }
      }
    ]
  },
  {
    id: 46,
    difficulty: "easy",
    title: { uz: "Daraxt ekish", ru: "Посадка дерева" },
    text: {
      uz: "Mahallada daraxt ko'chatlari ekish aksiyasi o'tkazilyapti. Ko'chat sotib olib (10 000 so'm) ekishda qatnashasizmi yoki shunchaki chetda turasizmi?",
      ru: "В районе проходит акция по посадке деревьев. Купите ли вы саженец за 10 000 сум для посадки или просто понаблюдаете?"
    },
    options: [
      {
        text: { uz: "Ko'chat sotib olib ekish", ru: "Купить саженец и посадить дерево" },
        effect: { coins: 15, xp: 35 },
        feedback: {
          uz: "Dono va xayrli ish! Daraxt ekish — bu kelajakka qo'shilgan hissiy, ekologik va ma'naviy sarmoyadir. Kelajakda uning mevasini hamma ko'radi.",
          ru: "Прекрасный выбор! Посадка деревьев — это зеленая инвестиция в будущее нашего города и здоровье будущих поколений."
        }
      },
      {
        text: { uz: "Qatnashmaslik", ru: "Не участвовать" },
        effect: { coins: 0, xp: 5 },
        feedback: {
          uz: "Siz 10 000 so'm pulingizni saqladingiz, lekin mahallangizni yashillashiga o'z hissangizni qo'shish baxtidan bebahra qoldingiz.",
          ru: "Вы сохранили небольшую сумму, но упустили возможность оставить добрый след и сделать мир чуточку зеленее."
        }
      }
    ]
  },
  {
    id: 47,
    difficulty: "medium",
    title: { uz: "Sayohat sug'urtasi", ru: "Страхование поездки" },
    text: {
      uz: "Siz boshqa shaharga lagerga ketyapsiz. Lager tashkilotchilari kutilmagan baxtsiz hodisalardan himoyalanish uchun 15 000 so'm evaziga sug'urta taklif qilishmoqda. Sug'urta qildirasizmi?",
      ru: "Вы едете в лагерь в другой город. Организаторы предлагают оформить страховку здоровья за 15 000 сум на случай травм. Оформите?"
    },
    options: [
      {
        text: { uz: "Sayohat sug'urtasini rasmiylashtirish", ru: "Оформить медицинскую страховку" },
        effect: { coins: 15, xp: 25 },
        feedback: {
          uz: "Aqlli munosabat! Sug'urta qilish — kelajakdagi katta kutilmagan tibbiy xarajatlardan o'zingizni va oilangizni moliyaviy asrash demakdir.",
          ru: "Умный подход! Страхование — это надежный щит от огромных незапланированных медицинских расходов при форс-мажоре."
        }
      },
      {
        text: { uz: "Sug'urtadan voz kechish", ru: "Отказаться от страховки" },
        effect: { coins: -5, xp: 10 },
        feedback: {
          uz: "Siz pulingizni tejadingiz, lekin lagerda tasodifan qo'lingiz lat yesa, barcha tibbiy xarajatlarni to'liq to'lashga majbur bo'lasiz.",
          ru: "Вы сэкономили копейку, но в случае малейшей травмы все расходы на лечение лягут на ваши плечи в стократном объеме."
        }
      }
    ]
  },
  {
    id: 48,
    difficulty: "easy",
    title: { uz: "Kiyim ta'miri", ru: "Ремонт одежды" },
    text: {
      uz: "Sizning yangi shymingizda kichik teshik paydo bo'ldi. Uni tashlab yuborib yangisini olasizmi yoki tikuvchiga berib chiroyli yamoq qo'ydirasizmi?",
      ru: "На ваших новых брюках появилась маленькая дырочка. Выбросите их ради покупки новых или отнесете в ателье?"
    },
    options: [
      {
        text: { uz: "Shimni ta'mirlatib ishlatish", ru: "Отремонтировать брюки в ателье" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Siz juda tejamkorsiz! Shimingiz yanada chiroyli va o'ziga xos uslubga ega bo'ldi, hamyoningiz esa keraksiz xarajatdan asraldi.",
          ru: "Вы очень бережливы! После мелкого ремонта брюки выглядят отлично, а ваш бюджет спасен от трат на покупку новых вещей."
        }
      },
      {
        text: { uz: "Yangi shim sotib olish", ru: "Купить новые брюки" },
        effect: { coins: -15, xp: 5 },
        feedback: {
          uz: "Oddiy teshik uchun butun boshli yangi shim olish — iqtisodiy isrofgarchilik va byudjetni o'ylamaslik belgisidir.",
          ru: "Покупка новых брюк из-за крошечной дырочки — это расточительство и неумение ценить вещи и деньги."
        }
      }
    ]
  },
  {
    id: 49,
    difficulty: "medium",
    title: { uz: "Bilim va Kurslar", ru: "Обучение и Курсы" },
    text: {
      uz: "Siz dasturlashga qiziqasiz. Uni o'rgatadigan qimmat kursni (200 000 so'm) o'qib, sertifikat va amaliy ko'nikma olasizmi yoki bu pulni yangi kiyim-kechaklarga sarflaysizmi?",
      ru: "Вы увлекаетесь программированием. Запишетесь на платный курс за 200 000 сум ради востребованных знаний или потратите деньги на одежду?"
    },
    options: [
      {
        text: { uz: "Dasturlash kursida o'qish", ru: "Пройти курс программирования" },
        effect: { coins: 25, xp: 45 },
        feedback: {
          uz: "Ajoyib sarmoya! Ko'nikma va bilim olishga tikilgan pul — kelajakda sizga yuz barobar ko'proq daromad keltiradigan eng ishonchli investitsiyadir.",
          ru: "Отличный вклад! Деньги, вложенные в образование, окупаются стократно и открывают огромные карьерные перспективы."
        }
      },
      {
        text: { uz: "Kiyim-kechak sotib olish", ru: "Купить модную одежду" },
        effect: { coins: -5, xp: 10 },
        feedback: {
          uz: "Siz chiroyli kiyindingiz, lekin bilim olish va kelajakda yuqori maoshli mutaxassis bo'lish imkonini kechiktirdingiz.",
          ru: "Вы купили обновку, но упустили возможность развить ценный навык, который мог бы приносить вам стабильный доход."
        }
      }
    ]
  },
  {
    id: 50,
    difficulty: "hard",
    title: { uz: "Inflyatsiya va Omonat", ru: "Инфляция и Накопления" },
    text: {
      uz: "Mamlakatda inflyatsiya darajasi yuqori. Siz jamg'argan pullaringizni shunchaki hamyonda naqd saqlaysizmi yoki uni inflyatsiyadan himoya qilish uchun oltin yoxud qattiq valyutaga almashtirasizmi?",
      ru: "В стране наблюдается инфляция. Будете ли вы хранить свои накопления в наличных дома или купите золото для защиты сбережений?"
    },
    options: [
      {
        text: { uz: "Oltin yoki ishonchli aktiv sotib olish", ru: "Купить золото или надежные активы" },
        effect: { coins: 30, xp: 40 },
        feedback: {
          uz: "Daho iqtisodchi! Inflyatsiya vaqtida qog'oz pullar qiymatsizlanadi, oltin va aktivlar esa sizning sotib olish qobiliyatingizni saqlab beradi.",
          ru: "Гениальный экономист! Во время инфляции бумажные деньги обесцениваются, а золото помогает уберечь реальную ценность сбережений."
        }
      },
      {
        text: { uz: "Uydagi hamyonda naqd saqlash", ru: "Хранить дома в наличных" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "Inflyatsiya tufayli 1 yildan so'ng sizning pullaringiz o'z qiymatining sezilarli qismini yo'qotdi, ko'p narsa sotib ololmay qoldingiz.",
          ru: "Из-за инфляции ваши наличные деньги обесценились, и теперь вы можете купить на них гораздо меньше вещей, чем год назад."
        }
      }
    ]
  },
  {
    id: 51,
    difficulty: "easy",
    title: { uz: "Elektr energiyasini tejash", ru: "Энергосбережение" },
    text: {
      uz: "Xonadan chiqayotganda chiroqni o'chirishni unutdingiz. Chiroqni o'chirish uchun orqaga qaytasizmi yoki 'shundog'am tezda qaytaman' deb qoldirasizmi?",
      ru: "Вы забыли выключить свет, выходя из комнаты. Вернетесь ли вы, чтобы выключить его, или оставите включенным, думая 'я скоро вернусь'?"
    },
    options: [
      {
        text: { uz: "Chiroqni o'chirish", ru: "Выключить свет" },
        effect: { coins: 10, xp: 15 },
        feedback: {
          uz: "Barakalla! Kichik odatlar katta tejashga olib keladi va oila byudjeti hamda tabiatni asraydi.",
          ru: "Молодец! Маленькие привычки приводят к большой экономии семейного бюджета и заботе о природе."
        }
      },
      {
        text: { uz: "Yoqilgan qoldirish", ru: "Оставить включенным" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Elektr energiyasining isrofi oilaviy to'lovlarni ko'paytiradi. Tejamkorlikni odat qiling!",
          ru: "Расход энергии увеличивает коммунальные счета. Привыкайте к бережливости!"
        }
      }
    ]
  },
  {
    id: 52,
    difficulty: "medium",
    title: { uz: "Maktab tushligi", ru: "Школьный обед" },
    text: {
      uz: "Siz har kuni maktab kafeteriyasida qimmat tushlik sotib olasiz. Onangiz uyda tayyorlangan foydali tushlikni qutiga solib berishni taklif qildi. Qaysi birini tanlaysiz?",
      ru: "Вы каждый день покупаете дорогой обед в школьной столовой. Мама предложила собирать вам полезный домашний ланчбокс. Что выберете?"
    },
    options: [
      {
        text: { uz: "Uydan tushlik olib borish", ru: "Брать домашний обед" },
        effect: { coins: 20, xp: 25 },
        feedback: {
          uz: "Ajoyib tanlov! Ham sog'lom ovqatlanasiz, ham har kuni sezilarli miqdorda pul tejaladi.",
          ru: "Отличный выбор! И здоровое питание, и ежедневная ощутимая экономия ваших карманных денег."
        }
      },
      {
        text: { uz: "Kafeteriyadan sotib olish", ru: "Покупать в столовой" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Tayyor tushlik qulay, lekin uydan olib borishga qaraganda ikki barobar qimmatroqqa tushadi.",
          ru: "Готовый обед удобен, но обходится в два раза дороже домашнего ланча."
        }
      }
    ]
  },
  {
    id: 53,
    difficulty: "hard",
    title: { uz: "Kriptovalyuta vs Indeks Fond", ru: "Криптовалюта или Индексный Фонд" },
    text: {
      uz: "Sizda ma'lum bir jamg'arma bor. Internetda tez boyitadigan yangi mem-koinni reklama qilishmoqda. Yoki pulni ishonchli indeks fondiga sarmoya qilmoqchisiz.",
      ru: "У вас есть сбережения. В интернете активно рекламируют новую взрывную мем-монету. Или вы можете инвестировать в надежный индексный фонд."
    },
    options: [
      {
        text: { uz: "Ishonchli indeks fondiga sarmoya", ru: "Инвестировать в индексный фонд" },
        effect: { coins: 25, xp: 40 },
        feedback: {
          uz: "Aqlli investor! Diversifikatsiyalangan indeks fondi uzoq muddatda barqaror va xavfsiz o'sishni ta'minlaydi.",
          ru: "Разумный инвестор! Диверсифицированный фонд обеспечивает стабильный и безопасный долгосрочный рост капитала."
        }
      },
      {
        text: { uz: "Tez o'sadigan mem-koinga tikish", ru: "Купить хайповую мем-монету" },
        effect: { coins: -20, xp: 15 },
        feedback: {
          uz: "Katta xavf! Mem-koinlar tezda qulashi va bor pulingizni yo'qotishingizga sabab bo'lishi mumkin.",
          ru: "Высокий риск! Хайповые монеты часто обесцениваются в ноль, лишая инвесторов всех вложений."
        }
      }
    ]
  },
  {
    id: 54,
    difficulty: "easy",
    title: { uz: "Yo'l xarajati", ru: "Транспортные расходы" },
    text: {
      uz: "Maktabdan qaytishda ob-havo yaxshi. Do'stlaringiz avtobusda ketishni yoki qimmat taksi chaqirishni taklif qilishdi. Qaysi transportni tanlaysiz?",
      ru: "На обратном пути из школы погода отличная. Друзья предлагают вызвать дорогое такси или поехать на автобусе. Что выберете?"
    },
    options: [
      {
        text: { uz: "Avtobusda ketish", ru: "Поехать на автобусе" },
        effect: { coins: 12, xp: 15 },
        feedback: {
          uz: "Tejamkor va to'g'ri! Jamoat transporti taksiga qaraganda ancha arzon va qulay.",
          ru: "Экономно и правильно! Общественный транспорт сбережет ваши деньги для более важных целей."
        }
      },
      {
        text: { uz: "Taksi chaqirish", ru: "Вызвать такси" },
        effect: { coins: -15, xp: 5 },
        feedback: {
          uz: "Shoshilinch vaziyat bo'lmasa, qimmat taksiga pul sarflash tejamkorlik qoidalariga zid keladi.",
          ru: "Без спешки тратить деньги на такси — нерациональное использование личного бюджета."
        }
      }
    ]
  },
  {
    id: 55,
    difficulty: "medium",
    title: { uz: "Velosiped sotib olish", ru: "Покупка велосипеда" },
    text: {
      uz: "Sizga yozda minish uchun velosiped kerak. Do'konda yangisi 1 000 000 so'm turibdi. Internetda esa kam ishlatilgan yaxshi velosipedni 400 000 so'mga topdingiz.",
      ru: "Вам нужен велосипед на лето. Новый в магазине стоит 1 000 000 сум. В интернете вы нашли б/у велосипед в отличном состоянии за 400 000 сум."
    },
    options: [
      {
        text: { uz: "Ishlatilganini sotib olish", ru: "Купить поддержанный велосипед" },
        effect: { coins: 20, xp: 30 },
        feedback: {
          uz: "Moliyaviy g'alaba! Ikkinchi qo'l tovarlarni yaxshi holatda sotib olish — pulni tejashning eng zo'r usuli.",
          ru: "Финансовая победа! Покупка качественных подержанных вещей экономит огромную часть бюджета."
        }
      },
      {
        text: { uz: "Do'kondan yangisini olish", ru: "Купить новый в магазине" },
        effect: { coins: -20, xp: 15 },
        feedback: {
          uz: "Yangi velosiped yaxshi, lekin ortiqcha 600 000 so'mni boshqa foydali ishlarga jamg'arsangiz bo'lar edi.",
          ru: "Новый велосипед — это здорово, но переплата в 600 000 сум лишает вас возможности накопить на другие цели."
        }
      }
    ]
  },
  {
    id: 56,
    difficulty: "hard",
    title: { uz: "Maktab loyihasi", ru: "Школьный стартап" },
    text: {
      uz: "Siz maktab gazetasi loyihasini boshlamoqchisiz. Qog'oz va bo'yoq xarajatlarini qoplash uchun undan reklama joyi sotasizmi yoki obuna narxini juda qimmat qilasizmi?",
      ru: "Вы запускаете школьную газету. Как покрыть расходы на печать: продавать рекламные места в газете или сделать дорогую подписку?"
    },
    options: [
      {
        text: { uz: "Reklama joyini sotish", ru: "Продавать рекламу" },
        effect: { coins: 25, xp: 45 },
        feedback: {
          uz: "Haqiqiy tadbirkor! Reklama orqali xarajatlarni qoplab, gazetani o'quvchilarga bepul yoki juda arzon yetkazib bera olasiz.",
          ru: "Настоящий предприниматель! Реклама покроет расходы, позволив сделать газету доступной для всех учеников."
        }
      },
      {
        text: { uz: "Qimmat obuna joriy etish", ru: "Сделать дорогую подписку" },
        effect: { coins: -10, xp: 15 },
        feedback: {
          uz: "Qimmat obuna tufayli gazetangizni deyarli hech kim sotib olmadi va loyiha zarar ko'rdi.",
          ru: "Из-за высокой цены никто не подписался на газету, и проект остался без бюджета на развитие."
        }
      }
    ]
  },
  {
    id: 57,
    difficulty: "easy",
    title: { uz: "Suvni tejash", ru: "Берегите воду" },
    text: {
      uz: "Tishlaringizni yuvayotganda suv jo'mragini ochiq qoldirasizmi yoki tish yuvish jarayonida jo'mrakni yopib turasizmi?",
      ru: "Выключаете ли вы кран, пока чистите зубы, или оставляете воду течь постоянно?"
    },
    options: [
      {
        text: { uz: "Jo'mrakni yopib turish", ru: "Выключать кран" },
        effect: { coins: 10, xp: 15 },
        feedback: {
          uz: "Juda yaxshi! Birgina tish yuvishda o'nlab litr toza suv va kommunal to'lov pullari tejaladi.",
          ru: "Отлично! За одну чистку зубов вы сохраняете литры воды и помогаете родителям экономить на счетах."
        }
      },
      {
        text: { uz: "Ochiq qoldirish", ru: "Оставлять включенным" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Suv isrofi — tabiatga ham, oila hamyoniga ham zarar yetkazadi. Odatingizni o'zgartiring!",
          ru: "Трата чистой воды вредит экологии и увеличивает расходы вашей семьи. Будьте бережливее!"
        }
      }
    ]
  },
  {
    id: 58,
    difficulty: "medium",
    title: { uz: "Obunalar byudjeti", ru: "Бюджет на подписки" },
    text: {
      uz: "Sizda bir vaqtning o'zida 3 ta bir xil video-xizmat obunasi bor. Ularning har biri oyiga 20 000 so'm turadi. Faqat bittasini qoldirib, qolganlarini bekor qilasizmi?",
      ru: "У вас оформлены подписки на 3 разных видеосервиса. Каждая стоит по 20 000 сум в месяц. Оставите только одну или продолжите платить за все?"
    },
    options: [
      {
        text: { uz: "Faqat 1 ta foydali obunani qoldirish", ru: "Оставить только одну подписку" },
        effect: { coins: 18, xp: 25 },
        feedback: {
          uz: "Aqlli qaror! Keraksiz yoki takrorlanuvchi obunalardan voz kechish orqali oyiga 40 000 so'm tejab qoldingiz.",
          ru: "Разумное решение! Отказ от лишних подписок экономит вам 40 000 сум в месяц без потери качества досуга."
        }
      },
      {
        text: { uz: "Uchalasini ham saqlab qolish", ru: "Оставить все три подписки" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "Siz baribir hamma xizmatlardan bir vaqtda foydalana olmaysiz. Bu ortiqcha sarf-xarajatdir.",
          ru: "Вы физически не успеваете смотреть все сервисы. Это нерациональные автоматические траты."
        }
      }
    ]
  },
  {
    id: 59,
    difficulty: "hard",
    title: { uz: "Yozgi savdo", ru: "Летняя торговля" },
    text: {
      uz: "Siz o'z qo'lingiz bilan tayyorlagan esdalik sovg'alarini sotmoqchisiz. Buning uchun qimmat ko'rgazma rastasini ijaraga olasizmi yoki bepul ijtimoiy tarmoqda sahifa ochib sotishni boshlaysizmi?",
      ru: "Вы хотите продавать поделки ручной работы. Арендуете ли вы дорогой торговый стенд или откроете бесплатный магазин в соцсетях?"
    },
    options: [
      {
        text: { uz: "Ijtimoiy tarmoqda bepul boshlash", ru: "Начать бесплатно в соцсетях" },
        effect: { coins: 30, xp: 40 },
        feedback: {
          uz: "Ajoyib startap mantiqi! Biznesni minimal xarajatlar bilan boshlash xavfni kamaytiradi va foydani oshiradi.",
          ru: "Отличный стартап-подход! Начало бизнеса с минимальными вложениями снижает риски финансовых потерь."
        }
      },
      {
        text: { uz: "Qimmat rasta ijaraga olish", ru: "Арендовать дорогой стенд" },
        effect: { coins: -20, xp: 20 },
        feedback: {
          uz: "Savdo kam bo'lsa, ijara haqi sizni katta zarar ko'rishingizga olib kelishi mumkin edi.",
          ru: "Высокая аренда на старте без уверенности в стабильных продажах может быстро привести к банкротству."
        }
      }
    ]
  },
  {
    id: 60,
    difficulty: "easy",
    title: { uz: "Velosiped shinasi", ru: "Велосипедная шина" },
    text: {
      uz: "Velosipedingiz shinasi teshilib qoldi. Uni usta do'stining yordamida yamab olasizmi yoki butunlay yangi shina sotib olishga do'konga borasizmi?",
      ru: "Шина вашего велосипеда прокололась. Вы заклеите её самостоятельно или сразу пойдете покупать новую шину?"
    },
    options: [
      {
        text: { uz: "Shinani yamash va ta'mirlash", ru: "Заклеить шину" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Tejamkor usta! Kichik teshik tufayli buyumni tashlab yubormaslik katta pullarni tejaydi.",
          ru: "Бережливый мастер! Мелкий ремонт спасает от крупных незапланированных трат."
        }
      },
      {
        text: { uz: "Yangi shina sotib olish", ru: "Купить новую шину" },
        effect: { coins: -12, xp: 5 },
        feedback: {
          uz: "Arzimas muammo uchun yangi shina olish — keraksiz xarajat bo'lib, pulni ko'kka sovurishdir.",
          ru: "Покупка новой шины из-за простого прокола — нерациональное расходование карманных денег."
        }
      }
    ]
  },
  {
    id: 61,
    difficulty: "medium",
    title: { uz: "Sifatli oyoq kiyim", ru: "Качественная обувь" },
    text: {
      uz: "Qishki poyabzal olyapsiz. 150 000 so'mlik arzon poyabzal bor (tez yirtiladi) yoki 350 000 so'mlik sifatli poyabzal bor (3 yil xizmat qiladi). Qaysini olasiz?",
      ru: "Вы выбираете зимнюю обувь. Есть дешевая за 150 000 сум (быстро порвется) и качественная за 350 000 сум (прослужит 3 года). Что выберете?"
    },
    options: [
      {
        text: { uz: "Sifatli va qimmatrog'ini olish", ru: "Купить качественную обувь" },
        effect: { coins: 20, xp: 30 },
        feedback: {
          uz: "Oqilona investitsiya! 'Arzonning oshining tami bo'lmas'. Sifatli buyum uzoq muddatda pulingizni tejaydi.",
          ru: "Умная инвестиция! 'Скупой платит дважды'. Качественная вещь в итоге экономит ваши деньги на повторных покупках."
        }
      },
      {
        text: { uz: "Arzon poyabzal sotib olish", ru: "Купить дешевую обувь" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Arzon poyabzal bir necha oydan so'ng yirtilib, yana yangisini sotib olishga majbur bo'lasiz.",
          ru: "Дешевая обувь быстро придет в негодность, вынуждая вас снова тратиться на новую пару уже в этом сезоне."
        }
      }
    ]
  },
  {
    id: 62,
    difficulty: "hard",
    title: { uz: "Quyosh panellari", ru: "Солнечные панели" },
    text: {
      uz: "Uyingizda elektr to'lovlari juda ko'p chiqmoqda. Quyosh panellarini o'rnatish (katta boshlang'ich xarajat) kelajakda tejamkorlik beradi. O'rnatasizmi?",
      ru: "У вас дома большие счета за электричество. Установка солнечных панелей требует затрат на старте, но обещает бесплатный свет в будущем. Решитесь?"
    },
    options: [
      {
        text: { uz: "Panellarni o'rnatish", ru: "Установить панели" },
        effect: { coins: 35, xp: 45 },
        feedback: {
          uz: "Kelajakni o'ylovchi investor! Yashil texnologiyalar uzoq muddatda xarajatlarni nolgacha tushiradi va ekologiyani asraydi.",
          ru: "Прогрессивный инвестор! Экотехнологии со временем полностью окупаются, сводя коммунальные платежи к минимуму."
        }
      },
      {
        text: { uz: "Eski tizimda qolish", ru: "Оставить все как есть" },
        effect: { coins: -10, xp: 15 },
        feedback: {
          uz: "Siz boshlang'ich pulni tejamadingiz, lekin har oy yuqori elektr to'lovlarini to'lashda davom etasiz.",
          ru: "Вы избежали стартовых расходов, но продолжите ежемесячно переплачивать по классическим тарифам."
        }
      }
    ]
  },
  {
    id: 63,
    difficulty: "easy",
    title: { uz: "Kutubxonadan foydalanish", ru: "Использование библиотеки" },
    text: {
      uz: "Maktab loyihasi uchun sizga qiziqarli kitob kerak bo'ldi. Do'kondan yangisini sotib olasizmi (80 000 so'm) yoki kutubxonadan bepul olib turasizmi?",
      ru: "Для школьного проекта вам нужна книга. Вы купите её в магазине за 80 000 сум или возьмете бесплатно в библиотеке?"
    },
    options: [
      {
        text: { uz: "Kutubxonadan bepul olish", ru: "Взять в библиотеке" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Barakalla! Kutubxonadan foydalanish bepul bilim olish va pulni tejashning eng samarali yo'lidir.",
          ru: "Отлично! Библиотека — это доступ к миллионам книг без лишних затрат для вашего кошелька."
        }
      },
      {
        text: { uz: "Do'kondan sotib olish", ru: "Купить в магазине" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Bir marta o'qish uchun mo'ljallangan kitobga pul sarflash tejamkorlikka to'g'ri kelmaydi.",
          ru: "Покупка книги на один раз — не самое разумное использование личных финансовых ресурсов."
        }
      }
    ]
  },
  {
    id: 64,
    difficulty: "medium",
    title: { uz: "Garaj savdosi", ru: "Гаражная распродажа" },
    text: {
      uz: "Xonangizda ortiqcha eski o'yinchoqlar va kitoblar to'planib qoldi. Ularni axlatga tashlaysizmi yoki do'stlar bilan kichik savdo uyushtirib sotasizmi?",
      ru: "В вашей комнате накопилось много старых игрушек и книг. Вы выбросите их или устроите распродажу во дворе?"
    },
    options: [
      {
        text: { uz: "Savdo tashkil qilib sotish", ru: "Устроить распродажу" },
        effect: { coins: 22, xp: 30 },
        feedback: {
          uz: "Daho tadbirkor! Ortiqcha narsalardan xalos bo'lib, qo'shimcha daromad ishladingiz va ularga yangi hayot berdingiz.",
          ru: "Супер! Вы избавились от хлама, подарили вещам вторую жизнь и заработали дополнительные карманные деньги."
        }
      },
      {
        text: { uz: "Hammasini axlatga tashlash", ru: "Просто выбросить вещи" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Isrofgarchilik! Siz sotilishi mumkin bo'lgan buyumlardan hech qanday foyda ko'rmay tashlab yubordingiz.",
          ru: "Расточительство! Вы лишились возможности заработать на вещах, которые еще могли кому-то послужить."
        }
      }
    ]
  },
  {
    id: 65,
    difficulty: "hard",
    title: { uz: "Pullarni taqsimlash", ru: "Распределение карманных денег" },
    text: {
      uz: "Sizga oylik cho'ntak puli berishdi. Uni qanday boshqarasiz: 3 ta qutiga solib taqsimlaysizmi (Jamg'arma, Xayriya, Xarajat) yoki hammasini hamyonga solib yurasizmi?",
      ru: "Вам выдали карманные деньги на месяц. Будете ли вы распределять их по 3 конвертам (Сбережения, Благотворительность, Траты) или положите все в один кошелек?"
    },
    options: [
      {
        text: { uz: "3 ta qutiga taqsimlash", ru: "Распределить по конвертам" },
        effect: { coins: 30, xp: 45 },
        feedback: {
          uz: "Moliyaviy strateg! Pullarni taqsimlash kelajakda boy bo'lishingiz va tizimli tejashingizni ta'minlaydi.",
          ru: "Настоящий финансист! Метод конвертов защищает от импульсивных трат и помогает планомерно копить."
        }
      },
      {
        text: { uz: "Hamyonda birga olib yurish", ru: "Хранить всё вместе" },
        effect: { coins: -15, xp: 15 },
        feedback: {
          uz: "Bir joyda turgan pul tezda keraksiz narsalarga sarflanib ketadi. Rejalashtirishni o'rganing!",
          ru: "Когда все деньги лежат в одном месте, их гораздо проще незаметно потратить на ерунду."
        }
      }
    ]
  },
  {
    id: 66,
    difficulty: "easy",
    title: { uz: "Shirinlik xaridi", ru: "Покупка сладостей" },
    text: {
      uz: "Siz har kuni 5000 so'mga dona shirinlik olasiz. Katta paketlisi 30 000 so'm turadi va u 10 kunga yetadi. Qaysi usulda sotib olasiz?",
      ru: "Вы каждый день покупаете поштучно сладости за 5000 сум. Большая пачка стоит 30 000 сум и её хватит на 10 дней. Какую покупку совершите?"
    },
    options: [
      {
        text: { uz: "Katta paketni ulgurji olish", ru: "Купить большую пачку оптом" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Aqlli xaridor! Ulgurji sotib olish har doim donabay xaridga qaraganda arzonroq tushadi va 20 000 so'm tejaladi.",
          ru: "Умный покупатель! Оптовые упаковки снижают цену за единицу товара, сберегая ваши деньги."
        }
      },
      {
        text: { uz: "Har kuni donalab olish", ru: "Покупать поштучно каждый день" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Siz har kuni donabay olib, jami 50 000 so'm sarfladingiz. Bu tejamkorlikka ziddir.",
          ru: "Покупая поштучно, вы переплатили за упаковку и маркетинг лишние 20 000 сум за 10 дней."
        }
      }
    ]
  },
  {
    id: 67,
    difficulty: "medium",
    title: { uz: "Fastfud yoki Uy taomi", ru: "Фастфуд или Домашняя еда" },
    text: {
      uz: "Kechki ovqatga uydagilar pitsa buyurtma qilishni (120 000 so'm) yoki birgalikda mazali uy taomini tayyorlashni (50 000 so'm masalliqlar) taklif qilishdi. Qaysini tanlaysiz?",
      ru: "Семья думает над ужином: заказать пиццу за 120 000 сум или вместе приготовить вкусное домашнее блюдо (ингредиенты стоят 50 000 сум)?"
    },
    options: [
      {
        text: { uz: "Uyda birga taom tayyorlash", ru: "Приготовить дома вместе" },
        effect: { coins: 22, xp: 30 },
        feedback: {
          uz: "Ajoyib oilaviy tanlov! Ham foydali, ham tejamkor va juda qiziqarli kecha bo'ldi.",
          ru: "Прекрасный семейный выбор! Домашняя еда полезнее, дешевле, а совместная готовка сближает близких."
        }
      },
      {
        text: { uz: "Pitsa buyurtma qilish", ru: "Заказать пиццу" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "Buyurtma qulay, lekin uydan ko'ra qariyb 3 barobar qimmatroq va kamroq foydali.",
          ru: "Доставка еды экономит время, но забирает в два раза больше денег из вашего кошелька."
        }
      }
    ]
  },
  {
    id: 68,
    difficulty: "hard",
    title: { uz: "Qarz berish xavfi", ru: "Риски займа денег" },
    text: {
      uz: "Sinfdoshingiz qimmat o'yinchoq olish uchun sizdan katta pul so'radi va haftasiga oz-ozdan qaytarishini aytdi. Siz esa u pulga kelajak uchun sarmoya olmoqchi edingiz.",
      ru: "Одноклассник просит у вас крупную сумму взаймы на покупку дорогой игрушки, обещая отдавать частями. А у вас были планы на инвестиции."
    },
    options: [
      {
        text: { uz: "Qarz bermay o'z sarmoyangizni qilish", ru: "Отказать в займе и инвестировать" },
        effect: { coins: 25, xp: 35 },
        feedback: {
          uz: "To'g'ri tahlil! Do'stlarga ko'ngil uchun qarz berish ko'pincha pulning yo'qolishiga va do'stlik buzilishiga olib keladi.",
          ru: "Верный расчет! Давать взаймы на развлечения рискованно, лучше направить средства на свое развитие."
        }
      },
      {
        text: { uz: "Hamma pulni qarzga berish", ru: "Одолжить все деньги другу" },
        effect: { coins: -20, xp: 15 },
        feedback: {
          uz: "Siz do'stingizga pul berdingiz, lekin u va'dasida turmadi va siz o'z investitsiya imkoniyatingizni boy berdingiz.",
          ru: "К сожалению, друг задержал возврат, лишив вас возможности совершить запланированную важную покупку."
        }
      }
    ]
  },
  {
    id: 69,
    difficulty: "easy",
    title: { uz: "Xaridlar ro'yxati", ru: "Список покупок" },
    text: {
      uz: "Do'konga borishdan oldin mahsulotlar ro'yxatini tuzasizmi yoki do'kon aylanib ko'zingizga chiroyli ko'ringan narsalarni olaverasizmi?",
      ru: "Составляете ли вы список покупок перед походом в супермаркет или покупаете всё, на что упадёт взгляд?"
    },
    options: [
      {
        text: { uz: "Ro'yxat bo'yicha sotib olish", ru: "Покупать строго по списку" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Moliyaviy intizom! Ro'yxat bo'yicha xarid qilish keraksiz shirinliklar va ortiqcha xarajatlardan asraydi.",
          ru: "Финансовая дисциплина! Список оберегает от маркетинговых ловушек и импульсивных трат у кассы."
        }
      },
      {
        text: { uz: "Hissiyotga berilib sotib olish", ru: "Покупать импульсивно" },
        effect: { coins: -12, xp: 5 },
        feedback: {
          uz: "Do'kondagi reklamalarga uchib, keraksiz va qimmat narsalarni olib pulingizni tugatdingiz.",
          ru: "Без списка вы потратили деньги на спонтанные желания, оставив кошелек практически пустым."
        }
      }
    ]
  },
  {
    id: 70,
    difficulty: "medium",
    title: { uz: "Brend va Sifat", ru: "Бренд или Качество" },
    text: {
      uz: "Do'konda mashhur brendli pechenye (40 000 so'm) va deyarli tarkibi bir xil bo'lgan mahalliy pechenye (15 000 so'm) turibdi. Qaysi birini sotib olasiz?",
      ru: "В магазине лежит печенье известного бренда за 40 000 сум и местное печенье с таким же вкусом за 15 000 сум. Что купите?"
    },
    options: [
      {
        text: { uz: "Mahalliy pechenyeni olish", ru: "Купить местное печенье" },
        effect: { coins: 18, xp: 25 },
        feedback: {
          uz: "Aqlli xaridor! Brend uchun ortiqcha pul to'lamaslik orqali siz 25 000 so'mni tejab qoldingiz.",
          ru: "Разумный выбор! Не переплачивая за имя бренда и дорогую рекламу, вы сэкономили 25 000 сум."
        }
      },
      {
        text: { uz: "Brend pechenyeni sotib olish", ru: "Купить брендовое печенье" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Mashhur brend chiroyli, lekin uning mazasi arzonroq pechenye bilan deyarli bir xil edi.",
          ru: "Красивая обертка бренда обошлась вам слишком дорого при том же качестве и вкусе продукта."
        }
      }
    ]
  },
  {
    id: 71,
    difficulty: "hard",
    title: { uz: "Bepul ta'lim imkoniyati", ru: "Бесплатное самообразование" },
    text: {
      uz: "Siz ingliz tilini o'rganmoqchisiz. Internetda bepul sifatli darsliklar va videolar bor, ikkinchi variant — 150 000 so'mga faqat chiroyli sertifikat beradigan kurs.",
      ru: "Вы хотите подтянуть английский. В сети есть бесплатные отличные курсы и видео, а есть платный курс за 150 000 сум ради красивого сертификата."
    },
    options: [
      {
        text: { uz: "Bepul darslar orqali o'rganish", ru: "Учиться бесплатно онлайн" },
        effect: { coins: 25, xp: 40 },
        feedback: {
          uz: "O'z-o'zini rivojlantiruvchi daho! Haqiqiy bilim qog'oz sertifikatdan ko'ra muhimroqdir.",
          ru: "Самодисциплина решает! Реальные знания и навыки намного важнее платного бумажного диплома."
        }
      },
      {
        text: { uz: "Qimmat kursni sotib olish", ru: "Купить платный курс ради диплома" },
        effect: { coins: -15, xp: 15 },
        feedback: {
          uz: "Siz pul sarfladingiz, lekin dars sifati bepul internetdagi ma'lumotlardan yaxshiroq emas edi.",
          ru: "Вы потратили деньги на курс, программа которого уступала бесплатным открытым урокам."
        }
      }
    ]
  },
  {
    id: 72,
    difficulty: "easy",
    title: { uz: "Xayriya va Saxovat", ru: "Благотворительность" },
    text: {
      uz: "Sizda ko'p o'ynalmaydigan yaxshi o'yinchoqlar bor. Ularni bepul bolalar uyi xayriya fondiga topshirasizmi yoki chang bosib turishiga qoldirasizmi?",
      ru: "У вас есть хорошие игрушки, в которые вы уже не играете. Отдадите их на благотворительность или оставите пылиться в шкафу?"
    },
    options: [
      {
        text: { uz: "Xayriya sifatida ulashish", ru: "Отдать на благотворительность" },
        effect: { coins: 15, xp: 30 },
        feedback: {
          uz: "Oliyjanob qalb! Saxovat va xayriya qilish — nafaqat boshqalarga yordam beradi, balki hayotda baraka keltiradi.",
          ru: "Доброе сердце! Помогая тем, кто нуждается, вы развиваете социальную ответственность и щедрость."
        }
      },
      {
        text: { uz: "Javonda saqlab turish", ru: "Оставить лежать в шкафу" },
        effect: { coins: 0, xp: 5 },
        feedback: {
          uz: "Buyumlar chang bosib turguncha, boshqa muhtoj bolalarga quvonch bag'ishlashi mumkin edi.",
          ru: "Вещи просто занимают место, хотя могли бы принести огромную пользу и радость другим детям."
        }
      }
    ]
  },
  {
    id: 73,
    difficulty: "medium",
    title: { uz: "Suv jo'mragining nosozligi", ru: "Утечка воды" },
    text: {
      uz: "Uyingizda suv jo'mragidan har soniyada suv tomib turibdi. Uni o'zingiz yoki usta chaqirib tezda tuzatasizmi yoki 'keyinroq qilaman' deb tashlab qo'yasizmi?",
      ru: "У вас дома слегка капает кран. Постараетесь ли вы сразу починить его самостоятельно или оставите решение вопроса на потом?"
    },
    options: [
      {
        text: { uz: "Jo'mrakni darhol tuzatish", ru: "Починить кран сразу" },
        effect: { coins: 20, xp: 25 },
        feedback: {
          uz: "Ajoyib egasi! Tomchilayotgan suv oyiga tonnalab isrofga va katta suv to'loviga sabab bo'lishining oldini oldingiz.",
          ru: "Хозяин своего дома! Капающий кран за месяц сливает тонны воды, увеличивая счета за коммуналку."
        }
      },
      {
        text: { uz: "E'tiborsiz qoldirish", ru: "Игнорировать проблему" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "Tomchilar yig'ilib katta suv isrofi bo'ldi va oilaviy to'lovlar sezilarli darajada oshib ketdi.",
          ru: "Попустительство привело к переплатам за воду и порче сантехники, усугубив проблему."
        }
      }
    ]
  },
  {
    id: 74,
    difficulty: "hard",
    title: { uz: "Avtomatik jamg'arish", ru: "Автокопилка" },
    text: {
      uz: "Bank kartangiz bor. Kelajak uchun har bir xaridingizdan 3% ini avtomatik ravishda 'Avto-jamg'arma' qutisiga o'tkazishni yoqasizmi yoki qo'lda tejashga harakat qilasizmi?",
      ru: "У вас есть банковская карта. Подключите ли вы автокопилку, переводящую 3% с каждой покупки на сберегательный счет, или будете копить вручную?"
    },
    options: [
      {
        text: { uz: "Avto-jamg'arishni yoqish", ru: "Подключить автокопилку" },
        effect: { coins: 30, xp: 40 },
        feedback: {
          uz: "Texnologik moliyachi! Avtomatik tizimlar siz sezmagan holda katta miqdorda sarmoya to'plash imkonini beradi.",
          ru: "Умное решение! Автоматизация сбережений помогает легко копить деньги без лишних усилий и напоминаний."
        }
      },
      {
        text: { uz: "Faqat qo'lda tejash", ru: "Копить вручную" },
        effect: { coins: -5, xp: 15 },
        feedback: {
          uz: "Qo'lda jamg'arish qiyin, chunki pulni saqlashni tezda unutasiz yoki barchasini sarflab yuborasiz.",
          ru: "Вручную копить сложнее: частые соблазны мешают регулярно откладывать нужный процент."
        }
      }
    ]
  },
  {
    id: 75,
    difficulty: "easy",
    title: { uz: "Xayriya yarmarkasi", ru: "Благотворительная ярмарка" },
    text: {
      uz: "Maktabda xayriya yarmarkasi o'tkazilmoqda. Uyda tayyorlangan shirinliklarni sotasizmi va tushgan pulni xayriya qilasizmi yoki shunchaki yarmarkada tomoshabin bo'lasizmi?",
      ru: "В школе проходит благотворительная ярмарка. Примете ли вы участие, продав домашнюю выпечку для помощи приюту, или просто посмотрите?"
    },
    options: [
      {
        text: { uz: "Shirinlik tayyorlab qatnashish", ru: "Участвовать с выпечкой" },
        effect: { coins: 15, xp: 30 },
        feedback: {
          uz: "Moliyaviy saxovat! Ham tadbirkorlikni o'rgandingiz, ham muhtojlarga yordam berib ulkan savobga erishdingiz.",
          ru: "Потрясающе! Вы применили навыки продаж ради благородного дела, заработав уважение школы."
        }
      },
      {
        text: { uz: "Shunchaki tomosha qilish", ru: "Быть зрителем" },
        effect: { coins: 0, xp: 10 },
        feedback: {
          uz: "Faol bo'lish va yordam berish har doim jamiyat rivojlanishiga va shaxsingiz o'sishiga yordam beradi.",
          ru: "Пассивное участие лишает вас возможности проявить свои таланты и помочь окружающим."
        }
      }
    ]
  },
  {
    id: 76,
    difficulty: "medium",
    title: { uz: "Tomorqa sarmoyasi", ru: "Домашний огород" },
    text: {
      uz: "Bahorda uyingiz hovlisida kichik poliz ekmoqchisiz (ko'katlar, pomidor). Do'kondan urug' sotib olish (15 000 so'm) yoki tayyor sabzavotlarni bozordan sotib olish. Qaysini tanlaysiz?",
      ru: "Весной вы решаете посадить на даче зелень и помидоры. Купите семена за 15 000 сум для ухода за огородом или будете покупать овощи на рынке?"
    },
    options: [
      {
        text: { uz: "Urug' ekib o'stirish", ru: "Посадить огород" },
        effect: { coins: 25, xp: 35 },
        feedback: {
          uz: "Tejamkor dehqon! O'z qo'lingiz bilan yetishtirilgan sabzavotlar ham tabiiy toza, ham oilaviy byudjetni sezilarli asraydi.",
          ru: "Эко-фермер! Собственный урожай гораздо полезнее магазинного и полностью окупает затраты на семена."
        }
      },
      {
        text: { uz: "Bozordan tayyorini olish", ru: "Покупать на рынке" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Har safar bozordan sabzavot olish oila byudjetidan ancha ko'p pul chiqib ketishiga sabab bo'ladi.",
          ru: "Регулярная покупка зелени обходится вашей семье значительно дороже, чем уход за грядками."
        }
      }
    ]
  },
  {
    id: 77,
    difficulty: "hard",
    title: { uz: "Intellektual mulk himoyasi", ru: "Защита авторских прав" },
    text: {
      uz: "Siz yangi kompyuter dasturini yaratdingiz. Uni patentlash va huquqlarini himoya qilish uchun pul sarflaysizmi yoki shunchaki internetga bepul joylab qo'yasizmi?",
      ru: "Вы разработали уникальное мобильное приложение. Потратите ли вы деньги на оформление авторских прав или выложите код в открытый доступ?"
    },
    options: [
      {
        text: { uz: "Mualliflik huquqini himoya qilish", ru: "Защитить авторские права" },
        effect: { coins: 30, xp: 45 },
        feedback: {
          uz: "Professional tadbirkor! O'z g'oyangiz va mehnatingizni himoya qilish kelajakda sizga katta qonuniy daromad kafolatlaydi.",
          ru: "Защита интеллектуальной собственности позволяет монетизировать ваши разработки в будущем."
        }
      },
      {
        text: { uz: "Bepul internetga yuklash", ru: "Выложить бесплатно в сеть" },
        effect: { coins: -15, xp: 20 },
        feedback: {
          uz: "Boshqalar sizning g'oyangizni o'g'irlab, undan o'zlari pul ishlashdi va siz daromadsiz qoldingiz.",
          ru: "Другие разработчики скопировали вашу идею и заработали на ней миллионы, не упомянув автора."
        }
      }
    ]
  },
  {
    id: 78,
    difficulty: "easy",
    title: { uz: "Maktab yeguligi", ru: "Перекус в школу" },
    text: {
      uz: "Siz maktabda tez-tez ochqab qolasiz. Uyda onangiz bergan bepul meva va yong'oqlarni olib borasizmi yoki kafeteriyada chipslar va kola sotib olasizmi?",
      ru: "Вы часто хотите перекусить на переменах. Будете ли брать из дома яблоки и орехи или покупать в школе чипсы и колу?"
    },
    options: [
      {
        text: { uz: "Uydan bepul meva olib borish", ru: "Брать перекус из дома" },
        effect: { coins: 12, xp: 15 },
        feedback: {
          uz: "Sog'lom turmush tarzi! Ham tanangizga foyda keltirasiz, ham har kuni shirinlik va chiplarga ketadigan pul tejaladi.",
          ru: "Отличная привычка! Домашние перекусы намного полезнее для здоровья и выгоднее для кошелька."
        }
      },
      {
        text: { uz: "Sinfdoshlar bilan shirinlik olish", ru: "Покупать чипсы и колу" },
        effect: { coins: -12, xp: 5 },
        feedback: {
          uz: "Zararli fastfudga pul sarflash — sog'lig'ingizga zarar va hamyoningizni bo'shatuvchi keraksiz odatdir.",
          ru: "Тратить карманные деньги на газировку и чипсы — вредно для организма и расточительно."
        }
      }
    ]
  },
  {
    id: 79,
    difficulty: "medium",
    title: { uz: "Kino tomoshasi", ru: "Просмотр фильма" },
    text: {
      uz: "Siz yangi chiqqan kinoni ko'rmoqchisiz. Kinoteatrda tomosha qilish (50 000 so'm) yoki 1 oydan keyin televizorda rasmiy bepul ko'rsatilishini kutish?",
      ru: "Вы хотите посмотреть новый фильм. Пойдете в кинотеатр за 50 000 сум или подождете бесплатного показа на ТВ через месяц?"
    },
    options: [
      {
        text: { uz: "Bepul namoyishni kutish", ru: "Подождать бесплатного показа" },
        effect: { coins: 18, xp: 20 },
        feedback: {
          uz: "Siz kutishni biladigan sabrlisiz! Moliyada sabr-toqat — shoshqaloqlik oqibatida kelib chiqadigan xarajatlarni bartaraf etadi.",
          ru: "Умение ждать бережет ваши финансы. Терпеливые инвесторы всегда оказываются в выигрыше."
        }
      },
      {
        text: { uz: "Kinoteatrga borib ko'rish", ru: "Сразу пойти в кинотеатр" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "Kino tomoshasi yoqimli bo'ldi, lekin shoshilganingiz sababli hamyoningiz biroz bo'shab qoldi.",
          ru: "Вы посмотрели фильм раньше всех, но заплатили за это сиюминутное удовольствие приличную сумму."
        }
      }
    ]
  },
  {
    id: 80,
    difficulty: "hard",
    title: { uz: "Birgalikda jamg'arish", ru: "Совместные сбережения" },
    text: {
      uz: "Siz akangiz bilan birgalikda o'yin konsoli sotib olmoqchisiz. Pullaringizni birlashtirib umumiy omonat qutisiga solasizmi yoki har kim alohida to'playdimi?",
      ru: "Вы с братом хотите купить игровую приставку. Объедините ли вы усилия, откладывая в общую копилку, или будете копить по отдельности?"
    },
    options: [
      {
        text: { uz: "Umumiy omonat qutisi ochish", ru: "Копить в общую копилку" },
        effect: { coins: 30, xp: 40 },
        feedback: {
          uz: "Hamkorlik kuchi! Birgalikda tejash maqsadga tezroq yetishishga yordam beradi va jamoada ishlashni o'rgatadi.",
          ru: "Командная работа! Совместные накопления ускоряют достижение цели и учат финансовому согласию."
        }
      },
      {
        text: { uz: "Alohida jamg'arish", ru: "Копить по отдельности" },
        effect: { coins: -5, xp: 15 },
        feedback: {
          uz: "Alohida jamg'arganda maqsadga yetishish muddati ikki barobar uzayadi va kelishmovchiliklar kelib chiqishi mumkin.",
          ru: "По отдельности процесс займет гораздо больше времени, а мотивация может быстро угаснуть."
        }
      }
    ]
  },
  {
    id: 81,
    difficulty: "easy",
    title: { uz: "Ekologik paketlar", ru: "Эко-сумка" },
    text: {
      uz: "Supermarketda xarid qilayotganda uydan olib borilgan ko'p marta ishlatiladigan bepul ekobagni ishlatasizmi yoki har safar yangi polietilen paket sotib olasizmi?",
      ru: "При покупках в магазине используете ли вы многоразовую эко-сумку из дома или каждый раз покупаете пластиковый пакет?"
    },
    options: [
      {
        text: { uz: "Uydan olingan ekobagni ishlatish", ru: "Использовать свою эко-сумку" },
        effect: { coins: 10, xp: 15 },
        feedback: {
          uz: "Ekolog va iqtisodchi! Plastik paketlarni kamaytirish tabiatni asraydi va yillik paket xarajatlarini tejaydi.",
          ru: "Эко-логично! Отказ от пластиковых пакетов бережет планету и ваши карманные деньги от мелких трат."
        }
      },
      {
        text: { uz: "Polietilen paket sotib olish", ru: "Покупать пластиковый пакет" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Har safar arzimas paket olish yil davomida katta pul isrofi va atrof-muhit ifloslanishiga olib keladi.",
          ru: "Мелкие траты на пакеты за год превращаются в приличную сумму, а пластик засоряет природу."
        }
      }
    ]
  },
  {
    id: 82,
    difficulty: "medium",
    title: { uz: "Planshet tanlash", ru: "Выбор планшета" },
    text: {
      uz: "O'qishingiz uchun planshet kerak. Do'konda eng so'nggi model planshet turibdi (kreditga 500 000 so'm oylik to'lov) yoki 2-qo'l juda yaxshi ishlaydigan arzon planshet bor. Qaysini tanlaysiz?",
      ru: "Вам нужен планшет для учебы. Есть новейшая модель в кредит с ежемесячным платежом 500 000 сум или надежный б/у планшет в три раза дешевле?"
    },
    options: [
      {
        text: { uz: "Ishlatilgan planshetni naqdga olish", ru: "Купить б/у планшет" },
        effect: { coins: 20, xp: 30 },
        feedback: {
          uz: "Kreditlarsiz tinch hayot! Kredit to'lovlarisiz oqilona planshet olish kelgusi moliyaviy barqarorligingizni asraydi.",
          ru: "Жизнь без долгов! Покупка хорошей б/у техники спасает ваш будущий бюджет от кредитной кабалы."
        }
      },
      {
        text: { uz: "Eng so'nggi modelni kreditga olish", ru: "Взять флагман в кредит" },
        effect: { coins: -20, xp: 15 },
        feedback: {
          uz: "Haddan tashqari katta xarajat va kredit yuki sizni uzoq muddat davomida qiyin ahvolda qoldiradi.",
          ru: "Вы получили красивый гаджет, но теперь вынуждены отдавать все свои карманные деньги банку."
        }
      }
    ]
  },
  {
    id: 83,
    difficulty: "hard",
    title: { uz: "Biznes lager sarmoyasi", ru: "Бизнес-лагерь для подростков" },
    text: {
      uz: "Sizda yozgi biznes lagerda qatnashish imkoniyati bor. U yerda tadbirkorlikni o'rganasiz (kirish 150 000 so'm), ikkinchi variant — shu pulga kompyuter o'yinidagi virtual kiyimlar olish.",
      ru: "У вас есть шанс поехать в летний бизнес-лагерь для обучения стартапам (вход 150 000 сум). Или вы можете купить крутые скины в любимой игре."
    },
    options: [
      {
        text: { uz: "Biznes lagerda qatnashish", ru: "Поехать в бизнес-лагерь" },
        effect: { coins: 28, xp: 45 },
        feedback: {
          uz: "Kelajak tadbirkori! Olingan bilimlar sizga kelgusida millionlab daromad olib keladigan startaplar yaratishga asos bo'ladi.",
          ru: "Инвестиция в будущее! Знания и связи из лагеря помогут вам запустить свой прибыльный бизнес."
        }
      },
      {
        text: { uz: "O'yin uchun kiyim sotib olish", ru: "Купить виртуальные скины" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "Virtual o'yindagi kiyimlar faqat vaqtinchalik xursandchilik beradi, lekin real hayotda sizga hech qanday foyda keltirmaydi.",
          ru: "Игровые скины — это пассив, который нельзя продать или использовать в реальной жизни для заработка."
        }
      }
    ]
  },
  {
    id: 84,
    difficulty: "easy",
    title: { uz: "Mavsumiy kiyim savdosi", ru: "Сезонная покупка одежды" },
    text: {
      uz: "Qishki kurtkani qachon sotib olasiz: qishning qoq o'rtasida qimmat narxdami yoki yozgi chegirmalar mavsumida 50% arzonroq narxdami?",
      ru: "Когда выгоднее покупать зимнюю куртку: в самый разгар зимы по полной цене или на летней распродаже со скидкой 50%?"
    },
    options: [
      {
        text: { uz: "Yozda arzon chegirmada olish", ru: "Купить летом со скидкой" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Daho xaridor! Aqlli odamlar qishki kiyimni yozda, yozgilarini esa qishda sotib olib katta tejashga erishadilar.",
          ru: "Мудрое решение! Покупка сезонных вещей заранее в периоды распродаж бережет огромную часть бюджета."
        }
      },
      {
        text: { uz: "Qishda zarurat bo'lganda olish", ru: "Купить зимой в пик сезона" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Siz mavsumiy yuqori narxda sotib oldingiz va salkam ikki barobar ortiqcha pul to'ladingiz.",
          ru: "Покупка в разгар сезона всегда обходится значительно дороже из-за высокого спроса."
        }
      }
    ]
  },
  {
    id: 85,
    difficulty: "medium",
    title: { uz: "Eski telefon ta'miri", ru: "Ремонт старого телефона" },
    text: {
      uz: "Sizning telefoningiz ekrani darz ketdi. Uni 50 000 so'mga almashtirasizmi yoki yangi telefon modelini oylik to'lovli qarz evaziga sotib olasizmi?",
      ru: "Экран вашего телефона треснул. Вы замените его в ремонте за 50 000 сум или купите новый телефон в рассрочку?"
    },
    options: [
      {
        text: { uz: "Ekranini almashtirib ishlataverish", ru: "Отремонтировать экран" },
        effect: { coins: 18, xp: 25 },
        feedback: {
          uz: "Aqlli va tejamkor! Telefon hali yaxshi ishlasa, kichik narsa uchun yangisini qarzga olish xato qarordir.",
          ru: "Бережливый подход! Ремонт исправного гаджета избавляет от глупых долгов ради демонстрации статуса."
        }
      },
      {
        text: { uz: "Yangi telefonni qarzga olish", ru: "Купить новый телефон в долг" },
        effect: { coins: -20, xp: 10 },
        feedback: {
          uz: "Kichik chiziq uchun katta qarz yukini bo'yingizga oldingiz. Bu noto'g'ri moliyaviy qaror.",
          ru: "Взяв новый телефон в долг из-за царапины, вы совершили серьезную финансовую ошибку."
        }
      }
    ]
  },
  {
    id: 86,
    difficulty: "hard",
    title: { uz: "Favqulodda jamg'arma", ru: "Резервный фонд" },
    text: {
      uz: "Sizda jami 100 000 so'm bor. Uni yuqori riskli aksiyalarga tikasizmi yoki yarmini favqulodda vaziyatlar daxlsiz jamg'armasiga olib qo'yasizmi?",
      ru: "У вас есть 100 000 сум. Вложите ли вы все деньги в высокорисковые акции или отложите половину в резервный фонд?"
    },
    options: [
      {
        text: { uz: "Yarmini daxlsiz jamg'armaga qo'yish", ru: "Отложить 50% в резервный фонд" },
        effect: { coins: 25, xp: 35 },
        feedback: {
          uz: "Barakalla! Moliyaviy xavfsizlik har doim birinchi o'rinda turishi kerak. Bu sizni kutilmagan zarardan asraydi.",
          ru: "Отличная стратегия! Создание резерва — основа финансовой грамотности перед любым инвестированием."
        }
      },
      {
        text: { uz: "Hammasini riskli aksiyalarga tikish", ru: "Вложить все в рисковые акции" },
        effect: { coins: -15, xp: 20 },
        feedback: {
          uz: "Aksiyalar qulaganda siz bor pulingizdan ajraldingiz va kutilmagan vaziyatda qiyinchilikka duch keldingiz.",
          ru: "Акции упали в цене, и вы лишились большей части накоплений, не имея запаса на экстренный случай."
        }
      }
    ]
  },
  {
    id: 87,
    difficulty: "easy",
    title: { uz: "Yurish foydasi", ru: "Прогулка пешком" },
    text: {
      uz: "Do'kondan uyga qaytayotganda masofa atigi 1 bekat. Avtobus kutib pul sarflaysizmi yoki piyoda toza havoda sayr qilib qaytasizmi?",
      ru: "Вы возвращаетесь домой, расстояние всего одна остановка. Пойдете пешком или будете ждать автобус и платить за проезд?"
    },
    options: [
      {
        text: { uz: "Piyoda sayr qilib qaytish", ru: "Пойти пешком" },
        effect: { coins: 10, xp: 15 },
        feedback: {
          uz: "Sog'lom va tejamkor! Piyoda yurish sog'lig'ingiz uchun ham foydali va yo'l puli tejaladi.",
          ru: "Здорово и выгодно! Пешие прогулки укрепляют иммунитет и сберегают ваши карманные деньги."
        }
      },
      {
        text: { uz: "Avtobusda ketish", ru: "Поехать на автобусе" },
        effect: { coins: -5, xp: 5 },
        feedback: {
          uz: "Juda qisqa masofaga ham transportga pul sarflash — ortiqcha xarajat hisoblanadi.",
          ru: "Тратить деньги на проезд ради пятиминутной поездки — не самое экономное решение."
        }
      }
    ]
  },
  {
    id: 88,
    difficulty: "medium",
    title: { uz: "Tabiiy o'g'it va Tejamkorlik", ru: "Натуральные удобрения" },
    text: {
      uz: "Hovlidagi polizga o'g'it kerak. Bozordan qimmat kimyoviy o'g'it sotib olasizmi (40 000 so'm) yoki uyda ovqat qoldiqlaridan kompost (bepul o'g'it) tayyorlaysizmi?",
      ru: "Для вашего огорода нужны удобрения. Купите ли вы дорогую химию за 40 000 сум или сделаете домашний бесплатный компост?"
    },
    options: [
      {
        text: { uz: "Uyda bepul kompost tayyorlash", ru: "Сделать домашний компост" },
        effect: { coins: 20, xp: 30 },
        feedback: {
          uz: "Ekolog-ijtimoiy daho! Chiqindilarsiz hayot va tabiiy o'g'it ham polizga, ham hamyonga katta foyda beradi.",
          ru: "Супер-эколог! Домашний компост абсолютно бесплатен, экологичен и дает отличный урожай."
        }
      },
      {
        text: { uz: "Kimyoviy o'g'it sotib olish", ru: "Купить химические удобрения" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Siz bepul olish mumkin bo'lgan narsaga pul sarfladingiz va poliz tuprog'ini biroz kimyoviylashtirdingiz.",
          ru: "Вы потратили деньги на химию, упустив шанс бесплатно утилизировать органические отходы с пользой."
        }
      }
    ]
  },
  {
    id: 89,
    difficulty: "hard",
    title: { uz: "Jamg'arma hisob raqami", ru: "Выбор сберегательного счета" },
    text: {
      uz: "O'z pullaringizni qayerda saqlaysiz: oddiy hamyondami (foiz qo'shilmaydi) yoki bankda inflyatsiyadan himoyalovchi va qo'shimcha foiz beradigan hisob raqamidami?",
      ru: "Где вы будете хранить сбережения: дома в копилке или откроете накопительный счет в банке с начислением процентов?"
    },
    options: [
      {
        text: { uz: "Bankda foizli hisob raqami ochish", ru: "Открыть накопительный счет" },
        effect: { coins: 28, xp: 40 },
        feedback: {
          uz: "Sarmoyador! Bankdagi omonat pullaringizni inflyatsiyadan himoyalaydi va uxlagan vaqtingizda ham pul ishlaydi.",
          ru: "Мудрый инвестор! Накопительный счет заставляет ваши деньги работать, принося пассивный доход."
        }
      },
      {
        text: { uz: "Hamyonda naqd saqlash", ru: "Хранить дома в копилке" },
        effect: { coins: -10, xp: 15 },
        feedback: {
          uz: "Hamyondagi pullar inflyatsiya tufayli har yili qiymatini yo'qotadi va siz foyda ko'rmaysiz.",
          ru: "В домашней копилке деньги постепенно обесцениваются из-за инфляции, не принося никакой пользы."
        }
      }
    ]
  },
  {
    id: 90,
    difficulty: "easy",
    title: { uz: "Ichimlik suvi xaridi", ru: "Питьевая вода" },
    text: {
      uz: "Siz har kuni ko'chada donalab plastik idishdagi suv olasiz. Uyda filtrdan o'tkazilgan suvni ko'p marta ishlatiladigan shishaga solib yurasizmi yoki yo'q?",
      ru: "Вы каждый день покупаете воду в пластиковых бутылках на улице. Будете ли вы брать воду из дома в своей многоразовой фляжке?"
    },
    options: [
      {
        text: { uz: "Uydan o'z shishangizda olib yurish", ru: "Брать воду из дома" },
        effect: { coins: 12, xp: 15 },
        feedback: {
          uz: "Ajoyib! Plastik chiqindilarni kamaytirib tabiatni asradingiz va har kungi keraksiz xarajatdan qutuldingiz.",
          ru: "Умница! Вы экономите приличную сумму в месяц и не засоряете планету лишним пластиком."
        }
      },
      {
        text: { uz: "Har kuni plastik idishda sotib olish", ru: "Покупать воду в бутылках" },
        effect: { coins: -10, xp: 5 },
        feedback: {
          uz: "Siz bir yilda suv uchun juda katta pul sarfladingiz va yuzlab plastik idishlarni axlatga otdingiz.",
          ru: "Постоянная покупка воды в бутылках — это огромная переплата за пластик и брешь в вашем бюджете."
        }
      }
    ]
  },
  {
    id: 91,
    difficulty: "medium",
    title: { uz: "Kiyimga ikkinchi hayot berish", ru: "Вторая жизнь вещей" },
    text: {
      uz: "Eski jinsingiz eskirib, tizzasi yirtildi. Uni tashlab yuborasizmi yoki undan zamonaviy jinsi shortik yasab kiyaverasizmi?",
      ru: "Ваши старые джинсы порвались на коленях. Вы выбросите их или сделаете из них модные летние шорты?"
    },
    options: [
      {
        text: { uz: "Shortik yasab ikkinchi hayot berish", ru: "Сделать шорты" },
        effect: { coins: 18, xp: 25 },
        feedback: {
          uz: "Ijodkor dizayner! Ham o'ziga xos shortik yaratdingiz, ham yangi kiyim sotib olish xarajatidan qutuldingiz.",
          ru: "Креативный дизайнер! Вы получили классную обновку совершенно бесплатно, проявив творчество."
        }
      },
      {
        text: { uz: "Tashlab yuborish va yangisini olish", ru: "Выбросить и купить новые" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "Oson yo'l, lekin keraksiz yangi xarajat oila byudjetiga salbiy ta'sir ko'rsatdi.",
          ru: "Выбросить исправную вещь из-за мелкого дефекта — не самый разумный и экономный подход."
        }
      }
    ]
  },
  {
    id: 92,
    difficulty: "hard",
    title: { uz: "O'z bilimini sotish", ru: "Монетизация знаний" },
    text: {
      uz: "Siz matematikani juda yaxshi bilasiz. Bo'sh vaqtingizda kichik sinflarga dars berib pul topasizmi yoki bo'sh vaqtni faqat televizor ko'rib o'tkazasizmi?",
      ru: "Вы отлично разбираетесь в математике. Станете ли вы подрабатывать репетитором для младших классов или проведете время перед экраном?"
    },
    options: [
      {
        text: { uz: "Kichik sinflarga dars berish", ru: "Репетиторство для младших" },
        effect: { coins: 35, xp: 50 },
        feedback: {
          uz: "Siz ajoyib insonsiz! O'z bilimingiz orqali halol pul topishni boshladingiz, bu eng yaxshi ko'nikmadir.",
          ru: "Великолепно! Монетизация своих талантов — это первый шаг к финансовой независимости и успеху."
        }
      },
      {
        text: { uz: "Faqat televizor ko'rish", ru: "Просто смотреть телевизор" },
        effect: { coins: 0, xp: 10 },
        feedback: {
          uz: "Televizor dam olish uchun yaxshi, lekin o'z mahoratingizni rivojlantirish va daromad topish imkonini yo'qotdingiz.",
          ru: "Вы упустили возможность заработать реальные деньги и получить ценный педагогический опыт."
        }
      }
    ]
  },
  {
    id: 93,
    difficulty: "easy",
    title: { uz: "Tug'ilgan kun sovg'asi puli", ru: "Подарок на день рождения" },
    text: {
      uz: "Tug'ilgan kuningizga bobongiz 100 000 so'm sovg'a qildi. Yarmini kelgusi orzularingiz uchun jamg'armaga qo'yasizmi yoki hammasini o'sha kuni shirinliklarga sarflaysizmi?",
      ru: "На день рождения дедушка подарил вам 100 000 сум. Отложите ли вы половину на мечту или потратите все на сладости в тот же день?"
    },
    options: [
      {
        text: { uz: "Yarmini jamg'armaga qo'shish", ru: "Отложить 50% в копилку" },
        effect: { coins: 20, xp: 20 },
        feedback: {
          uz: "Barakalla! Sovg'a qilingan pullarning bir qismini tejash kelajakda orzularingizga tezroq yetishishga yordam beradi.",
          ru: "Отличный самоконтроль! Сбережение половины подарка приближает вас к покупке крупной желанной вещи."
        }
      },
      {
        text: { uz: "Hammasini o'sha kuni sarflash", ru: "Потратить все сразу" },
        effect: { coins: -15, xp: 5 },
        feedback: {
          uz: "Hissiyotga berilib barcha pulni shirinlikka sarfladingiz va ertasiga hamyoningiz bo'sh qoldi.",
          ru: "Импульсивные траты принесли мимолетную радость, оставив вас без накоплений на важные цели."
        }
      }
    ]
  },
  {
    id: 94,
    difficulty: "medium",
    title: { uz: "LED lampochkalar", ru: "Энергосберегающие лампы" },
    text: {
      uz: "Uydagi eski lampochkalar kuyib qoldi. Do'kondan qimmatroq lekin kam tok sarflovchi LED chiroq olasizmi yoki eski turdagi arzon va ko'p tok yeydigan chiroq olasizmi?",
      ru: "Дома перегорели лампочки. Купите ли вы современные LED-лампы (дороже на старте, но светят дольше) или обычные дешевые лампы?"
    },
    options: [
      {
        text: { uz: "Sifatli va tejamkor LED chiroq olish", ru: "Купить LED-лампы" },
        effect: { coins: 18, xp: 25 },
        feedback: {
          uz: "Tejamkor uy egasi! LED chiroqlar 10 barobar kam elektr sarflaydi va uzoq yillar xizmat qiladi.",
          ru: "Умный хозяин! LED-технологии снижают счета за электричество и служат в разы дольше обычных ламп."
        }
      },
      {
        text: { uz: "Arzon eski turdagi chiroq olish", ru: "Купить обычные лампы" },
        effect: { coins: -10, xp: 10 },
        feedback: {
          uz: "Siz boshida pul tejadingiz, lekin kelgusi oylarda elektr to'lovlarida bir necha barobar ko'proq yutqazasiz.",
          ru: "Вы сэкономили при покупке, но продолжите переплачивать за перерасход электроэнергии каждый месяц."
        }
      }
    ]
  },
  {
    id: 95,
    difficulty: "hard",
    title: { uz: "Mahalliy kooperativ", ru: "Местный кооператив" },
    text: {
      uz: "Mahallangizda qo'shnilar asalarichilik kooperativini ochishdi va kichik sarmoyadorlarni jalb qilishmoqda. Kooperativ ulushini sotib olasizmi yoki yangi zamonaviy qimmat o'yinchoq olasizmi?",
      ru: "Соседи открыли пчеловодческий кооператив и ищут мелких инвесторов. Купите ли вы долю в кооперативе или дорогой модный спиннер?"
    },
    options: [
      {
        text: { uz: "Kooperativ ulushini sotib olish", ru: "Купить долю в кооперативе" },
        effect: { coins: 30, xp: 45 },
        feedback: {
          uz: "Haqiqiy investor! Kooperativ sizga kelgusida har mavsumda toza asal va barqaror passiv daromad keltira boshlaydi.",
          ru: "Гениальный шаг! Инвестиции в местное производство принесут вам стабильные дивиденды и пользу."
        }
      },
      {
        text: { uz: "Qimmat o'yinchoq sotib olish", ru: "Купить дорогую игрушку" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "O'yinchoq bir necha kundan so'ng eskiradi va uning qiymati butunlay nolga teng bo'ladi.",
          ru: "Игрушка быстро надоест и превратится в бесполезный пластик, не принеся вам никакого дохода."
        }
      }
    ]
  },
  {
    id: 96,
    difficulty: "easy",
    title: { uz: "Stol o'yinlari ijarasi", ru: "Настольные игры" },
    text: {
      uz: "Do'stlar bilan stol o'yini o'ynamoqchisiz. Markazdan dam olish kunlari uchun bepul ijaraga olasizmi yoki do'kondan qimmat yangi stol o'yini sotib olasizmi?",
      ru: "Вы хотите поиграть с друзьями в монополию. Возьмете игру бесплатно в клубе настолок на выходные или купите новую за 120 000 сум?"
    },
    options: [
      {
        text: { uz: "Bepul ijaraga olib o'ynash", ru: "Взять бесплатно на прокат" },
        effect: { coins: 15, xp: 20 },
        feedback: {
          uz: "Siz tejamkorsiz! Vaqtincha o'ynash uchun mo'ljallangan narsaga pul sarflamaslik — aqlli moliyaviy qaror.",
          ru: "Отличная экономия! Аренда позволяет весело провести время без лишних трат на покупку коробки."
        }
      },
      {
        text: { uz: "Do'kondan sotib olish", ru: "Купить в магазине" },
        effect: { coins: -15, xp: 10 },
        feedback: {
          uz: "Bir marta o'ynab, o'yinni javonga tashlab qo'ydingiz va 120 000 so'm pulingiz isrof bo'ldi.",
          ru: "Вы потратили крупную сумму на игру, которая теперь просто пылится на полке после одного вечера."
        }
      }
    ]
  },
  {
    id: 97,
    difficulty: "medium",
    title: { uz: "Dush qabul qilish", ru: "Экономия воды в душе" },
    text: {
      uz: "Dushda cho'milyapsiz. Yarim soat davomida uzoq suv oqizib rohatlanasizmi yoki dush qabul qilishni 5-10 daqiqagacha qisqartirasizmi?",
      ru: "Вы принимаете душ. Будете ли вы стоять под горячей водой полчаса или сократите время купания до 10 минут?"
    },
    options: [
      {
        text: { uz: "Dushni 10 daqiqagacha qisqartirish", ru: "Принять душ за 10 минут" },
        effect: { coins: 18, xp: 22 },
        feedback: {
          uz: "Tabiat do'sti! Suv resurslarini asrash hamda oilaviy kommunal to'lovlarni minimal qilishga yordam berdingiz.",
          ru: "Забота об экологии! Быстрый душ экономит тонны горячей воды и снижает счета вашей семьи."
        }
      },
      {
        text: { uz: "Uzoq dush qabul qilish", ru: "Стоять в душе полчаса" },
        effect: { coins: -12, xp: 8 },
        feedback: {
          uz: "Uzoq dush yoqimli, lekin u juda katta suv isrofiga va yuqori to'lovlarga olib keladi.",
          ru: "Излишне долгий душ — это неоправданный перерасход ценных природных и денежных ресурсов."
        }
      }
    ]
  },
  {
    id: 98,
    difficulty: "hard",
    title: { uz: "Valyuta diversifikatsiyasi", ru: "Диверсификация валюты" },
    text: {
      uz: "Mahalliy valyuta kursi tez-tez tebranib turibdi. Jamg'armangizni faqat bitta valyutada saqlaysizmi yoki uni bir nechta barqaror aktivlarga bo'lib qo'yasizmi?",
      ru: "Курс местной валюты нестабилен. Будете ли вы хранить все сбережения в одной валюте или разделите их между стабильными валютами?"
    },
    options: [
      {
        text: { uz: "Pullarni diversifikatsiya qilish", ru: "Диверсифицировать сбережения" },
        effect: { coins: 30, xp: 42 },
        feedback: {
          uz: "Moliyaviy tahlilchi! 'Tuxumlarni bitta savatga solmaslik' qoidasi sizni valyuta tushishidan to'liq asraydi.",
          ru: "Блестящий выбор! Диверсификация валютных рисков защищает ваш капитал от внезапной девальвации."
        }
      },
      {
        text: { uz: "Faqat bitta valyutada saqlash", ru: "Хранить все в одной валюте" },
        effect: { coins: -15, xp: 15 },
        feedback: {
          uz: "Valyuta kursi tushganda siz o'z jamg'armangizning chorak qismini yo'qotib, moliyaviy zarar ko'rdingiz.",
          ru: "К сожалению, местная валюта просела, снизив покупательную способность ваших сбережений."
        }
      }
    ]
  },
  {
    id: 99,
    difficulty: "easy",
    title: { uz: "Bayram tabriknomasi", ru: "Поздравительная открытка" },
    text: {
      uz: "Onangizning tug'ilgan kuni yaqinlashmoqda. Do'kondan qimmat tayyor tabriknoma olasizmi (15 000 so'm) yoki o'z qo'lingiz bilan chiroyli qilib yasaysizmi?",
      ru: "Приближается день рождения мамы. Купите ли вы готовую открытку за 15 000 сум или сделаете её своими руками?"
    },
    options: [
      {
        text: { uz: "O'z qo'li bilan yasash", ru: "Сделать открытку своими руками" },
        effect: { coins: 15, xp: 25 },
        feedback: {
          uz: "Eng samimiy sovg'a! Onangiz uchun o'z qo'lingiz bilan tayyorlangan sovg'a sotib olinganidan yuz barobar qadrliroqdir.",
          ru: "Самый душевный подарок! Открытка ручной работы для мамы бесценна и согреет её сердце сильнее покупной."
        }
      },
      {
        text: { uz: "Tayyorini sotib olish", ru: "Купить готовую открытку" },
        effect: { coins: -5, xp: 10 },
        feedback: {
          uz: "Siz pul sarfladingiz, lekin o'zingiz tayyorlagan sovg'aning o'rnini hech narsa bosa olmas edi.",
          ru: "Покупная открытка стандартна и лишена той искренности и тепла, которые вы могли бы вложить сами."
        }
      }
    ]
  },
  {
    id: 100,
    difficulty: "hard",
    title: { uz: "Raqamli rejalashtiruvchi", ru: "Цифровой планировщик" },
    text: {
      uz: "O'z shaxsiy byudjetingizni rejalashtirmoqchisiz. Buning uchun qimmat qog'oz daftar sotib olasizmi (30 000 so'm) yoki bepul telefon ilovasi yoxud Excel varag'idan foydalanasizmi?",
      ru: "Вы хотите вести личный бюджет. Купите ли вы для этого дорогой блокнот за 30 000 сум или будете вести учет в бесплатной Excel-таблице?"
    },
    options: [
      {
        text: { uz: "Bepul raqamli jadvaldan foydalanish", ru: "Использовать Excel или приложение" },
        effect: { coins: 30, xp: 45 },
        feedback: {
          uz: "Raqamli asr iqtisodchisi! Raqamli jadvallar bepul, hisob-kitobni avtomatik bajaradi va yo'qolib ketmaydi.",
          ru: "Экономист цифровой эры! Таблицы автоматизируют расчеты, они долговечны, наглядны и абсолютно бесплатны."
        }
      },
      {
        text: { uz: "Qimmat maxsus daftar sotib olish", ru: "Купить дорогой блокнот" },
        effect: { coins: -10, xp: 15 },
        feedback: {
          uz: "Daftar chiroyli, lekin u yerda hamma narsani qo'lda qo'shib chiqish kerak va u tez orada to'lib qoladi.",
          ru: "Блокнот быстро закончится, а все расчеты вам придется вводить и складывать на калькуляторе вручную."
        }
      }
    ]
  }
];

