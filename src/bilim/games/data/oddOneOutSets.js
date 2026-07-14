export const ODD_ONE_OUT_SETS = [
  {
    id: 1,
    difficulty: "easy",
    items: [
      { id: "apple", label: { uz: "Olma", ru: "Яблоко", en: "Apple" }, icon: "apple" },
      { id: "bread", label: { uz: "Non", ru: "Хлеб", en: "Bread" }, icon: "bread" },
      { id: "milk", label: { uz: "Sut", ru: "Молоко", en: "Milk" }, icon: "milk" },
      { id: "toy_car", label: { uz: "O'yinchoq mashina", ru: "Игрушечная машина", en: "Toy Car" }, icon: "toy" }
    ],
    oddIndex: 3,
    explanation: {
      uz: "O'yinchoq mashina — bu 'Xohish' (istak), qolgan uchta mahsulot esa yashash uchun zarur bo'lgan 'Ehtiyoj' (oziq-ovqat) hisoblanadi.",
      ru: "Игрушечная машинка — это 'Желание', а остальные три продукта — это 'Потребности' (еда), необходимые для жизни.",
      en: "The toy car is a 'Want', while the other three items are essential 'Needs' (food) for living."
    }
  },
  {
    id: 2,
    difficulty: "easy",
    items: [
      { id: "dollar", label: { uz: "AQSH Dollari", ru: "Доллар США", en: "US Dollar" }, icon: "dollar" },
      { id: "euro", label: { uz: "Yevro", ru: "Евро", en: "Euro" }, icon: "euro" },
      { id: "uzs", label: { uz: "O'zbek So'mi", ru: "Узбекский сум", en: "Uzbek Som" }, icon: "uzs" },
      { id: "robux", label: { uz: "Robux", ru: "Робуксы", en: "Robux" }, icon: "game_coin" }
    ],
    oddIndex: 3,
    explanation: {
      uz: "Robux — bu faqat o'yin ichidagi virtual valyuta. Dollar, Yevro va So'm esa haqiqiy hayotda ishlatiladigan rasmiy valyutalardir.",
      ru: "Робуксы — это виртуальная игровая валюта. Доллар, Евро и Сум — это официальные государственные валюты.",
      en: "Robux is a virtual in-game currency. Dollar, Euro, and Som are official real-world currencies."
    }
  },
  {
    id: 3,
    difficulty: "medium",
    items: [
      { id: "salary", label: { uz: "Oylik ish haqi", ru: "Зарплата", en: "Salary" }, icon: "income" },
      { id: "gift", label: { uz: "Hadya puli", ru: "Подарочные деньги", en: "Gift Money" }, icon: "gift" },
      { id: "cashback", label: { uz: "Keshbek", ru: "Кэшбэк", en: "Cashback" }, icon: "cashback" },
      { id: "rent", label: { uz: "Ijara to'lovi", ru: "Арендная плата", en: "Rent Payment" }, icon: "expense" }
    ],
    oddIndex: 3,
    explanation: {
      uz: "Ijara to'lovi — bu 'Xarajat' (pul chiqishi). Oylik, sovg'a va keshbek esa sizga pul olib keladigan 'Daromad' (pul kirishi) turlaridir.",
      ru: "Аренда — это 'Расход' (уход денег). Зарплата, подарки и кэшбэк — это виды 'Дохода' (приход денег).",
      en: "Rent payment is an 'Expense' (money flowing out). Salary, gifts, and cashback are types of 'Income' (money flowing in)."
    }
  },
  {
    id: 4,
    difficulty: "easy",
    items: [
      { id: "notebook", label: { uz: "Daftar", ru: "Тетрадь", en: "Notebook" }, icon: "notebook" },
      { id: "pencil", label: { uz: "Qalam", ru: "Карандаш", en: "Pencil" }, icon: "pencil" },
      { id: "eraser", label: { uz: "O'chirg'ich", ru: "Ластик", en: "Eraser" }, icon: "eraser" },
      { id: "playstation", label: { uz: "PlayStation", ru: "Игровая приставка", en: "PlayStation" }, icon: "gamepad" }
    ],
    oddIndex: 3,
    explanation: {
      uz: "PlayStation — juda qimmat o'yinchoq va 'Xohish'dir. Daftar, qalam va o'chirg'ich esa arzon va maktab o'quvchisi uchun 'Ehtiyoj'dir.",
      ru: "PlayStation — дорогая игрушка и 'Желание'. Тетрадь, карандаш и ластик — недорогие школьные 'Потребности'.",
      en: "PlayStation is an expensive gaming console ('Want'). Notebook, pencil, and eraser are low-cost school 'Needs'."
    }
  },
  {
    id: 5,
    difficulty: "medium",
    items: [
      { id: "water_bill", label: { uz: "Suv to'lovi", ru: "Плата за воду", en: "Water Bill" }, icon: "utilities" },
      { id: "gas_bill", label: { uz: "Gaz to'lovi", ru: "Плата за газ", en: "Gas Bill" }, icon: "utilities" },
      { id: "power_bill", label: { uz: "Elektr to'lovi", ru: "Плата за свет", en: "Electricity Bill" }, icon: "utilities" },
      { id: "cinema", label: { uz: "Kino chiptasi", ru: "Билет в кино", en: "Cinema Ticket" }, icon: "cinema" }
    ],
    oddIndex: 3,
    explanation: {
      uz: "Kino chiptasi — ko'ngilochar 'Xohish'. Suv, gaz va elektr to'lovlari (kommunal xizmatlar) esa uyda yashash uchun majburiy 'Ehtiyoj' xarajatlaridir.",
      ru: "Билет в кино — это развлечение ('Желание'). Плата за воду, газ и свет — это обязательные коммунальные 'Потребности'.",
      en: "A cinema ticket is entertainment ('Want'). Water, gas, and electricity are mandatory utility 'Needs'."
    }
  },
  {
    id: 6,
    difficulty: "hard",
    items: [
      { id: "bank_deposit", label: { uz: "Bank depoziti", ru: "Банковский депозит", en: "Bank Deposit" }, icon: "bank" },
      { id: "home_safe", label: { uz: "Uy seyfi", ru: "Домашний сейф", en: "Home Safe" }, icon: "safe" },
      { id: "savings_card", label: { uz: "Jamg'arma kartasi", ru: "Сберегательная карта", en: "Savings Card" }, icon: "card" },
      { id: "lottery", label: { uz: "Lotereya chiptasi", ru: "Лотерейный билет", en: "Lottery Ticket" }, icon: "lottery" }
    ],
    oddIndex: 3,
    explanation: {
      uz: "Lotereya chiptasi — yuqori xavfli tavakkalchilik (ko'pincha pul yo'qotiladi). Bank omonati, seyf va jamg'arma kartasi esa pulni ishonchli asrash usullaridir.",
      ru: "Лотерейный билет — это высокий риск потерять деньги. Депозит, сейф и сберегательная карта — это надежные способы сохранения денег.",
      en: "A lottery ticket is a high-risk gamble where you usually lose money. Deposits, safes, and savings cards are secure ways to store money."
    }
  },
  {
    id: 7,
    difficulty: "medium",
    items: [
      { id: "turn_off_water", label: { uz: "Suvni o'chirish", ru: "Выключать воду", en: "Turn off water" }, icon: "eco" },
      { id: "turn_off_light", label: { uz: "Chiroqni o'chirish", ru: "Выключать свет", en: "Turn off light" }, icon: "eco" },
      { id: "ride_bike", label: { uz: "Velosipedda yurish", ru: "Ездить на велике", en: "Ride a bicycle" }, icon: "bike" },
      { id: "waste_food", label: { uz: "Ovqatni tashlash", ru: "Выбрасывать еду", en: "Waste Food" }, icon: "waste" }
    ],
    oddIndex: 3,
    explanation: {
      uz: "Ovqatni uvol qilib tashlash — bu isrofgarchilik (ortiqcha xarajat). Suv/chiroqni tejash va velosipedda yurish esa pul va tabiatni asraydi.",
      ru: "Выбрасывать еду — это расточительство. Экономия воды/света и езда на велосипеде сберегают деньги и экологию.",
      en: "Wasting food is a wasteful expense. Saving water/light and riding a bicycle save both money and resources."
    }
  },
  {
    id: 8,
    difficulty: "easy",
    items: [
      { id: "ice_cream", label: { uz: "Muzqaymoq", ru: "Мороженое", en: "Ice Cream" }, icon: "sweets" },
      { id: "candy", label: { uz: "Konfet", ru: "Конфета", en: "Candy" }, icon: "sweets" },
      { id: "soda", label: { uz: "Gazli suv", ru: "Газировка", en: "Soda" }, icon: "soda" },
      { id: "pure_water", label: { uz: "Toza suv", ru: "Чистая вода", en: "Pure Water" }, icon: "water" }
    ],
    oddIndex: 3,
    explanation: {
      uz: "Toza suv — inson salomatligi va hayoti uchun eng muhim 'Ehtiyoj'. Muzqaymoq, konfet va gazli suv esa shunchaki shirinlik ('Xohish').",
      ru: "Чистая вода — важнейшая 'Потребность' для здоровья. Мороженое, конфеты и газировка — это сладости ('Желания').",
      en: "Pure water is an essential health 'Need'. Ice cream, candy, and soda are sugary treats ('Wants')."
    }
  },
  {
    id: 9,
    difficulty: "hard",
    items: [
      { id: "house", label: { uz: "Uy sotib olish", ru: "Покупка дома", en: "Buying a House" }, icon: "house" },
      { id: "education", label: { uz: "O'qish to'lovi", ru: "Плата за учебу", en: "Tuition Fee" }, icon: "education" },
      { id: "business", label: { uz: "Biznes boshlash", ru: "Старт бизнеса", en: "Starting a Business" }, icon: "business" },
      { id: "fancy_shoes", label: { uz: "Brend krossovka", ru: "Брендовые кроссовки", en: "Brand Shoes" }, icon: "shoes" }
    ],
    oddIndex: 3,
    explanation: {
      uz: "Brend krossovka — tez o'tadigan kichik xohish. Uy, ta'lim va biznes esa sizning kelajagingiz uchun katta qiymat beradigan 'Uzoq muddatli maqsadlar'dir.",
      ru: "Брендовые кроссовки — импульсивное сиюминутное желание. Дом, образование и бизнес — это важные 'Долгосрочные цели'.",
      en: "Brand shoes are a short-term impulse want. Home, education, and business are high-value 'Long-term Goals' for your future."
    }
  },
  {
    id: 10,
    difficulty: "medium",
    items: [
      { id: "gold_coin", label: { uz: "Oltin tanga", ru: "Золотая монета", en: "Gold Coin" }, icon: "gold" },
      { id: "stock", label: { uz: "Kompaniya aksiyasi", ru: "Акция компании", en: "Company Stock" }, icon: "stock" },
      { id: "savings", label: { uz: "Jamg'arma", ru: "Сбережения в банке", en: "Savings Account" }, icon: "savings" },
      { id: "fancy_car_rent", label: { uz: "Limuzin ijarasi", ru: "Аренда лимузина", en: "Limousine Rent" }, icon: "car" }
    ],
    oddIndex: 3,
    explanation: {
      uz: "Limuzin ijarasi — shunchaki bir martalik sarf (aktiv emas). Oltin, aksiyalar va bank omonatlari esa vaqt o'tishi bilan o'suvchi 'Aktivlar' (jamg'armalar)dir.",
      ru: "Аренда лимузина — это одноразовая трата. Золото, акции и вклады — это 'Активы', которые сохраняют и приумножают капитал.",
      en: "Limo rental is a one-time temporary expense. Gold, stocks, and savings are wealth-building 'Assets' that grow over time."
    }
  }
];
