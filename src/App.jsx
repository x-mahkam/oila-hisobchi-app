import{useState,useEffect,useCallback,useMemo,useRef}from"react";
import{LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid}from"recharts";
import{db,auth,fbAuth}from"./firebase.js";

const MK=d=>d?{bg:"#090e1c",sur:"#111827",surH:"#192035",bor:"#1e293b",ac:"#6366f1",ac2:"#818cf8",gr:"#10b981",rd:"#ef4444",am:"#f59e0b",t1:"#f1f5f9",t2:"#94a3b8",dark:true}:{bg:"#eef2ff",sur:"#ffffff",surH:"#f5f7ff",bor:"#e2e8f0",ac:"#6366f1",ac2:"#4f46e5",gr:"#059669",rd:"#dc2626",am:"#d97706",t1:"#0f172a",t2:"#64748b",dark:false};

const KATS=[{id:"oziq",c:"#10b981"},{id:"transport",c:"#3b82f6"},{id:"kiyim",c:"#8b5cf6"},{id:"sog",c:"#ef4444"},{id:"kommunal",c:"#f59e0b"},{id:"konil",c:"#ec4899"},{id:"talim",c:"#06b6d4"},{id:"hadya",c:"#f43f5e"},{id:"boshqa",c:"#64748b"}];
const KN={uz:["Oziq-ovqat","Transport","Kiyim","Sog'liq","Kommunal","Ko'ngil ochar","Ta'lim","Hadya","Boshqa"],ru:["Продукты","Транспорт","Одежда","Здоровье","Коммунальные","Развлечения","Образование","Подарок","Другое"],en:["Food","Transport","Clothing","Health","Utilities","Entertainment","Education","Gift","Other"]};
const DARS=[{id:"oylik",c:"#10b981"},{id:"qoshimcha",c:"#f59e0b"},{id:"biznes",c:"#3b82f6"},{id:"sovga",c:"#8b5cf6"},{id:"boshqa",c:"#64748b"}];
const DN={uz:["Oylik maosh","Qo'shimcha","Biznes","Sovg'a","Boshqa"],ru:["Зарплата","Доп.доход","Бизнес","Подарок","Другое"],en:["Salary","Additional","Business","Gift","Other"]};
const VALS=[{id:"uzs",b:"so'm",k:1},{id:"usd",b:"$",k:12800},{id:"rub",b:"₽",k:140},{id:"eur",b:"€",k:13900},{id:"kzt",b:"₸",k:26},{id:"kgs",b:"сом",k:145},{id:"tjs",b:"сомони",k:1180},{id:"try",b:"₺",k:380},{id:"gbp",b:"£",k:16200},{id:"aed",b:"د.إ",k:3485}];
const ONB_SLIDES=[
  {emoji:"\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66",titleUz:"Oilaviy byudjet",titleRu:"\u0421\u0435\u043c\u0435\u0439\u043d\u044b\u0439 \u0431\u044e\u0434\u0436\u0435\u0442",titleEn:"Family budget",descUz:"Butun oila daromad va xarajatlarini bir joyda kuzating. Har bir a'zo o'z xarajatini kiritadi.",descRu:"\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u0434\u043e\u0445\u043e\u0434\u044b \u0438 \u0440\u0430\u0441\u0445\u043e\u0434\u044b \u0432\u0441\u0435\u0439 \u0441\u0435\u043c\u044c\u0438.",descEn:"Track your whole family's income and expenses in one place.",color:"#6366f1"},
  {emoji:"\ud83c\udfaf",titleUz:"Maqsadlarga erishing",titleRu:"\u0414\u043e\u0441\u0442\u0438\u0433\u0430\u0439\u0442\u0435 \u0446\u0435\u043b\u0435\u0439",titleEn:"Reach your goals",descUz:"Uy, mashina, sayohat yoki umra uchun jamg'aring. Ilova har oy qancha ajratishni hisoblab beradi.",descRu:"\u041a\u043e\u043f\u0438\u0442\u0435 \u043d\u0430 \u0434\u043e\u043c, \u043c\u0430\u0448\u0438\u043d\u0443 \u0438\u043b\u0438 \u043f\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u0435.",descEn:"Save for a house, car, travel or Umrah with smart monthly targets.",color:"#10b981"},
  {emoji:"\ud83e\udd1d",titleUz:"Qarzlarni boshqaring",titleRu:"\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u0439\u0442\u0435 \u0434\u043e\u043b\u0433\u0430\u043c\u0438",titleEn:"Manage debts",descUz:"Kimga qancha qarzingiz borligini unutmang. Telefon orqali bog'lab, ikkala tomon tasdiqlaydi.",descRu:"\u041d\u0435 \u0437\u0430\u0431\u044b\u0432\u0430\u0439\u0442\u0435 \u043e \u0434\u043e\u043b\u0433\u0430\u0445. \u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u043e\u0431\u0435\u0438\u0445 \u0441\u0442\u043e\u0440\u043e\u043d.",descEn:"Never forget who owes what. Link by phone with two-way confirmation.",color:"#f59e0b"},
  {emoji:"\ud83c\udf81",titleUz:"Do'stlarni taklif qiling",titleRu:"\u041f\u0440\u0438\u0433\u043b\u0430\u0448\u0430\u0439\u0442\u0435 \u0434\u0440\u0443\u0437\u0435\u0439",titleEn:"Invite friends",descUz:"3 ta do'stingizni taklif qiling va 1 oy Premium bepul oling! Imtiyozlar sizni kutmoqda.",descRu:"\u041f\u0440\u0438\u0433\u043b\u0430\u0441\u0438\u0442\u0435 3 \u0434\u0440\u0443\u0437\u0435\u0439 \u0438 \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u0435 1 \u043c\u0435\u0441\u044f\u0446 Premium.",descEn:"Invite 3 friends and get 1 month Premium free!",color:"#ec4899"}
];
const COUNTRIES=[{code:"uz",dial:"+998",flag:"🇺🇿",uz:"O'zbekiston",ru:"Узбекистан",en:"Uzbekistan",val:"uzs"},{code:"ru",dial:"+7",flag:"🇷🇺",uz:"Rossiya",ru:"Россия",en:"Russia",val:"rub"},{code:"kz",dial:"+7",flag:"🇰🇿",uz:"Qozog'iston",ru:"Казахстан",en:"Kazakhstan",val:"kzt"},{code:"kg",dial:"+996",flag:"🇰🇬",uz:"Qirg'iziston",ru:"Кыргызстан",en:"Kyrgyzstan",val:"kgs"},{code:"tj",dial:"+992",flag:"🇹🇯",uz:"Tojikiston",ru:"Таджикистан",en:"Tajikistan",val:"tjs"},{code:"tr",dial:"+90",flag:"🇹🇷",uz:"Turkiya",ru:"Турция",en:"Turkey",val:"try"},{code:"us",dial:"+1",flag:"🇺🇸",uz:"AQSH",ru:"США",en:"USA",val:"usd"},{code:"ae",dial:"+971",flag:"🇦🇪",uz:"BAA (Dubay)",ru:"ОАЭ",en:"UAE",val:"aed"},{code:"gb",dial:"+44",flag:"🇬🇧",uz:"Buyuk Britaniya",ru:"Великобритания",en:"UK",val:"gbp"},{code:"eu",dial:"+",flag:"🇪🇺",uz:"Yevropa",ru:"Европа",en:"Europe",val:"eur"}];
const QUICK_ADD=[{emoji:"\ud83c\udf54",kat:"oziq",uz:"Ovqat",ru:"\u0415\u0434\u0430",en:"Food"},{emoji:"\ud83d\ude95",kat:"transport",uz:"Transport",ru:"\u0422\u0440\u0430\u043d\u0441\u043f\u043e\u0440\u0442",en:"Transport"},{emoji:"\u2615",kat:"oziq",uz:"Kofe",ru:"\u041a\u043e\u0444\u0435",en:"Coffee"},{emoji:"\ud83d\uded2",kat:"oziq",uz:"Bozor",ru:"\u041f\u0440\u043e\u0434\u0443\u043a\u0442\u044b",en:"Groceries"},{emoji:"\u26fd",kat:"transport",uz:"Benzin",ru:"\u0411\u0435\u043d\u0437\u0438\u043d",en:"Fuel"},{emoji:"\ud83d\udc8a",kat:"sog",uz:"Dorixona",ru:"\u0410\u043f\u0442\u0435\u043a\u0430",en:"Pharmacy"}];
const GOAL_PRESETS=[{emoji:"🏠",uz:"Uy xarid qilish",ru:"Покупка дома",en:"Buy a house",rang:"#10b981"},{emoji:"🚗",uz:"Mashina xarid qilish",ru:"Покупка машины",en:"Buy a car",rang:"#3b82f6"},{emoji:"✈️",uz:"Sayohat",ru:"Путешествие",en:"Travel",rang:"#f59e0b"},{emoji:"🕋",uz:"Umra ziyorati",ru:"Умра",en:"Umrah",rang:"#8b5cf6"},{emoji:"🕌",uz:"Haj amallari",ru:"Хадж",en:"Hajj",rang:"#06b6d4"},{emoji:"💍",uz:"To'y marosimi",ru:"Свадьба",en:"Wedding",rang:"#ec4899"},{emoji:"📱",uz:"Telefon / Texnika",ru:"Телефон",en:"Phone / Gadget",rang:"#6366f1"},{emoji:"🎓",uz:"Ta'lim / O'qish",ru:"Образование",en:"Education",rang:"#ef4444"},{emoji:"🏥",uz:"Favqulodda jamg'arma",ru:"Резерв",en:"Emergency",rang:"#14b8a6"},{emoji:"💼",uz:"Biznes boshlash",ru:"Бизнес",en:"Business",rang:"#f97316"}];

const RELATIONS=[{id:"ota",emoji:"\ud83d\udc68",uz:"Ota",ru:"\u041e\u0442\u0435\u0446",en:"Father"},{id:"ona",emoji:"\ud83d\udc69",uz:"Ona",ru:"\u041c\u0430\u0442\u044c",en:"Mother"},{id:"turmush",emoji:"\ud83d\udc91",uz:"Turmush o'rtoq",ru:"\u0421\u0443\u043f\u0440\u0443\u0433(\u0430)",en:"Spouse"},{id:"farzand",emoji:"\ud83d\udc66",uz:"Farzand",ru:"\u0420\u0435\u0431\u0451\u043d\u043e\u043a",en:"Child"},{id:"aka",emoji:"\ud83d\udc68",uz:"Aka",ru:"\u0421\u0442\u0430\u0440\u0448\u0438\u0439 \u0431\u0440\u0430\u0442",en:"Older brother"},{id:"uka",emoji:"\ud83d\udc66",uz:"Uka",ru:"\u041c\u043b\u0430\u0434\u0448\u0438\u0439 \u0431\u0440\u0430\u0442",en:"Younger brother"},{id:"opa",emoji:"\ud83d\udc69",uz:"Opa",ru:"\u0421\u0442\u0430\u0440\u0448\u0430\u044f \u0441\u0435\u0441\u0442\u0440\u0430",en:"Older sister"},{id:"singil",emoji:"\ud83d\udc67",uz:"Singil",ru:"\u041c\u043b\u0430\u0434\u0448\u0430\u044f \u0441\u0435\u0441\u0442\u0440\u0430",en:"Younger sister"},{id:"boshqa",emoji:"\ud83d\udc64",uz:"Boshqa",ru:"\u0414\u0440\u0443\u0433\u043e\u0435",en:"Other"}];
const TL={
uz:{app:"Oila Hisobchi",hi:"Salom",home:"Bosh",chart:"Grafik",goal:"Maqsad",rep:"Hisobot",inc:"Daromad",exp:"Xarajat",bal:"Balans",bud:"Budjet",me:"Men",hd:"Bosh",mb2:"A'zo",prf:"Profil",up:"Rasm yuklash",rp:"Rasmni o'chirish",ep:"Tahrirlash",un:"Ismni yangilash",fc2:"Oila kodi",fcd:"Oila a'zolaringizga yuboring",bll:"Budjet",mb:"Oylik budjet (so'm)",cl:"Kategoriya limitleri",fam:"Oila",sa:"Saqlandi",ua:"Yangilandi",lo:"Chiqish",sp:"sarflandi",lf:"qoldi",ex:"oshdi!",le:"limiti oshdi!",bw:"Budjetning 90% sarflandi!",be:"Budjet oshib ketdi!",xa:"Xarajat qo'shildi",da:"Daromad qo'shildi",ma:"Maqsad qo'shildi",od:"Faqat o'z yozuvingizni o'chira olasiz",fa:"Barcha maydonlarni to'ldiring",ea:"Summa kiriting",ec:"To'g'ri raqam kiriting",ee:"Bu email allaqachon ro'yxatda",ue:"Foydalanuvchi topilmadi",we:"Parol noto'g'ri",ffe:"Bunday oila kodi topilmadi",fc3:"Oila yaratildi!",jf2:"Oilaga qo'shildingiz!",wc:"Xush kelibsiz",sch:"Qidirish...",res:"Natijalar",nf2:"Topilmadi",nr:"Hali yozuv yo'q",l7:"So'nggi 7 kun (ming so'm)",l6:"Oylik xarajatlar",bc:"Bu oy kategoriyalar",hm:"Kunlik faollik (30 kun)",st:"Oylik ko'rsatkichlar",ad:"O'rtacha kunlik",ir:"Daromad/Xarajat",bs:"Budjet tejalgan",rc:"Yozuvlar soni",rates:"Valyuta kurslari",rSub:"Markaziy bank kursi",ldd:"Yuklanmoqda...",all:"Hammasi",ed:"Xarajat taqsimoti",isr:"Daromad manbalari",bm:"A'zolar bo'yicha",aa:"AI Moliyaviy maslahat",an:"Tahlil...",na:"Yangi maslahat",sv:"Saqlash",am:"Qo'shish",ach:"Maqsadga erishdingiz!",rem:"Qolgan",tp:"Pul qo'shish",mr:"oylik hisoboti",cn:"Bekor",shaxsiy:"Shaxsiy ma'lumotlar",ilovaS:"Ilova sozlamalari",xav:"Xavfsizlik",qol:"Qo'llab-quvvatlash",ver:"Ilova versiyasi",til:"Interfeys tili",mavzu:"Ilova mavzusi",kunduzi:"Kunduzgi",tungi:"Tungi",pin:"PIN kodni o'zgartirish",barmoq:"Barmoq izi bilan kirish",tgBot:"Rasmiy Telegram bot",faq:"Ko'p so'raladigan savollar",qoshimcha:"QO'SHIMCHA"},
ru:{app:"Семейный Бюджет",hi:"Привет",home:"Главная",chart:"Графики",goal:"Цели",rep:"Отчёт",inc:"Доход",exp:"Расход",bal:"Баланс",bud:"Бюджет",me:"Я",hd:"Глава",mb2:"Участник",prf:"Профиль",up:"Загрузить фото",rp:"Удалить фото",ep:"Редактировать",un:"Обновить имя",fc2:"Код семьи",fcd:"Отправьте код членам семьи",bll:"Бюджет",mb:"Месячный бюджет (сум)",cl:"Лимиты категорий",fam:"Семья",sa:"Сохранено",ua:"Обновлено",lo:"Выйти",sp:"потрачено",lf:"осталось",ex:"превышен!",le:"лимит превышен!",bw:"Использовано 90% бюджета!",be:"Бюджет превышен!",xa:"Расход добавлен",da:"Доход добавлен",ma:"Цель добавлена",od:"Можно удалять только свои записи",fa:"Заполните все поля",ea:"Введите сумму",ec:"Введите корректное число",ee:"Email уже зарегистрирован",ue:"Пользователь не найден",we:"Неверный пароль",ffe:"Код семьи не найден",fc3:"Семья создана!",jf2:"Вы присоединились!",wc:"Добро пожаловать",sch:"Поиск...",res:"Результаты",nf2:"Не найдено",nr:"Записей пока нет",l7:"Последние 7 дней",l6:"Месячные расходы",bc:"Категории за месяц",hm:"Активность за 30 дней",st:"Показатели месяца",ad:"Средний дневной",ir:"Доход/Расход",bs:"Экономия бюджета",rc:"Записей за месяц",rates:"Курсы валют",rSub:"Курс Центрального банка",ldd:"Загрузка...",all:"Все",ed:"Распределение расходов",isr:"Источники дохода",bm:"По участникам",aa:"AI Финансовый совет",an:"Анализируется...",na:"Новый совет",sv:"Сохранить",am:"Добавить",ach:"Цель достигнута!",rem:"Осталось",tp:"Пополнение",mr:"отчёт за",cn:"Отмена",shaxsiy:"Личные данные",ilovaS:"Настройки приложения",xav:"Безопасность",qol:"Поддержка",ver:"Версия приложения",til:"Язык интерфейса",mavzu:"Тема приложения",kunduzi:"Светлый",tungi:"Тёмный",pin:"Изменить PIN-код",barmoq:"Отпечаток пальца",tgBot:"Официальный Telegram бот",faq:"Частые вопросы",qoshimcha:"ДОПОЛНИТЕЛЬНО"},
en:{app:"Family Budget",hi:"Hello",home:"Home",chart:"Charts",goal:"Goals",rep:"Report",inc:"Income",exp:"Expense",bal:"Balance",bud:"Budget",me:"Me",hd:"Head",mb2:"Member",prf:"Profile",up:"Upload photo",rp:"Remove photo",ep:"Edit",un:"Update name",fc2:"Family code",fcd:"Share with family members",bll:"Budget",mb:"Monthly budget (UZS)",cl:"Category limits",fam:"Family",sa:"Saved",ua:"Updated",lo:"Sign out",sp:"spent",lf:"left",ex:"exceeded!",le:"limit exceeded!",bw:"90% of budget used!",be:"Budget exceeded!",xa:"Expense added",da:"Income added",ma:"Goal added",od:"You can only delete your own records",fa:"Please fill all fields",ea:"Enter amount",ec:"Enter valid number",ee:"Email already registered",ue:"User not found",we:"Wrong password",ffe:"Family code not found",fc3:"Family created!",jf2:"You joined the family!",wc:"Welcome",sch:"Search...",res:"Results",nf2:"Nothing found",nr:"No records yet",l7:"Last 7 days (K UZS)",l6:"Monthly expenses",bc:"This month",hm:"Activity last 30 days",st:"Monthly stats",ad:"Avg daily expense",ir:"Income/Expense ratio",bs:"Budget saved",rc:"Records this month",rates:"Exchange rates",rSub:"Central Bank rate",ldd:"Loading...",all:"All",ed:"Expense breakdown",isr:"Income sources",bm:"By members",aa:"AI Financial advice",an:"Analyzing...",na:"New advice",sv:"Save",am:"Add",ach:"Goal achieved!",rem:"Remaining",tp:"Add funds",mr:"monthly report",cn:"Cancel",shaxsiy:"Personal info",ilovaS:"App settings",xav:"Security",qol:"Support",ver:"App version",til:"Interface language",mavzu:"App theme",kunduzi:"Light",tungi:"Dark",pin:"Change PIN code",barmoq:"Fingerprint login",tgBot:"Official Telegram Bot",faq:"FAQ",qoshimcha:"ADDITIONAL"},
};

const FAQS={
uz:[{q:"Oila kodi nima?",a:"Oilangizga boshqa a'zolarni qo'shish uchun ishlatiladigan maxsus kod. Profil > Shaxsiy ma'lumotlar bo'limida topasiz."},{q:"Valyuta kurslari qayerdan?",a:"O'zbekiston Markaziy Banki rasmiy saytidan olinadi."},{q:"AI maslahat qanday ishlaydi?",a:"AI oylik daromad va xarajatlaringizni tahlil qilib, moliyaviy maslahat beradi."},{q:"PIN kod nima uchun?",a:"Ilovaga kirish xavfsizligini ta'minlash uchun 4 raqamli PIN kod o'rnatishingiz mumkin."}],
ru:[{q:"Что такое код семьи?",a:"Уникальный код для добавления членов семьи. Найдите в Профиль > Личные данные."},{q:"Откуда берутся курсы?",a:"Данные Центрального банка Узбекистана."},{q:"Как работает AI совет?",a:"AI анализирует доходы и расходы и даёт финансовые рекомендации."},{q:"Зачем PIN код?",a:"Для безопасного входа в приложение."}],
en:[{q:"What is the family code?",a:"A code to add family members. Find it in Profile > Personal info."},{q:"Where do exchange rates come from?",a:"From the Central Bank of Uzbekistan."},{q:"How does AI advice work?",a:"AI analyzes your income and expenses and gives financial tips."},{q:"What is the PIN code for?",a:"To secure access to the app."}],
};

const normTel=t=>{const d=(t||"").replace(/[^0-9]/g,"");return d.length>9?d.slice(-9):d;};
const ADMIN_TEL="937414866";
const td=()=>new Date().toISOString().slice(0,10);
const tm=()=>new Date().toISOString().slice(0,7);
const nt=()=>new Date().toLocaleTimeString("uz-UZ",{hour:"2-digit",minute:"2-digit"});
// Haptic feedback (telefon tebranishi) - qo'llab-quvvatlasa
const buzz=(ms=12)=>{try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}};
// Summani so'z bilan yozish (o'zbekcha): 5000000 -> "besh million so'm"
const sonSoz=(n)=>{
  n=Math.round(Math.abs(Number(n)||0));
  if(n===0)return "nol";
  const bir=["","bir","ikki","uch","to'rt","besh","olti","yetti","sakkiz","to'qqiz"];
  const on=["","o'n","yigirma","o'ttiz","qirq","ellik","oltmish","yetmish","sakson","to'qson"];
  const uchXona=(x)=>{ // 0-999
    let s="";
    const yuz=Math.floor(x/100),qol=x%100,o=Math.floor(qol/10),b=qol%10;
    if(yuz>0)s+=(yuz>1?bir[yuz]+" ":"")+"yuz ";
    if(o>0)s+=on[o]+" ";
    if(b>0)s+=bir[b]+" ";
    return s.trim();
  };
  let res="";
  const mlrd=Math.floor(n/1e9),mln=Math.floor((n%1e9)/1e6),ming=Math.floor((n%1e6)/1000),qoldiq=n%1000;
  if(mlrd>0)res+=uchXona(mlrd)+" milliard ";
  if(mln>0)res+=uchXona(mln)+" million ";
  if(ming>0)res+=uchXona(ming)+" ming ";
  if(qoldiq>0)res+=uchXona(qoldiq)+" ";
  return res.trim();
};
const hp=async s=>{
  const str=s+"v7s";
  // HTTPS/localhost'da crypto.subtle ishlaydi
  if(typeof crypto!=="undefined"&&crypto.subtle){
    try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(str));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");}catch(e){}
  }
  // Fallback (oddiy hash) - faqat HTTP test uchun
  let h=0;for(let i=0;i<str.length;i++){h=((h<<5)-h+str.charCodeAt(i))|0;}
  return "fb"+Math.abs(h).toString(16);
};
function spc(n){
  // Har 3 raqamdan keyin probel: 1250000 -> "1 250 000"
  const neg=n<0;const s=Math.round(Math.abs(n)).toString();
  let r="";for(let i=0;i<s.length;i++){if(i>0&&(s.length-i)%3===0)r+=" ";r+=s[i];}
  return (neg?"-":"")+r;
}
function fmtN(n,val,sh){
  const v=Math.abs(Number(n)||0);
  const c=val.id==="uzs"?v:v/val.k;
  // sh=true: qisqartirilgan format (1.25 mln / 25 mln)
  if(sh){
    if(val.id==="uzs"){
      if(v>=1e9)return(v/1e9).toFixed(v%1e9===0?0:1).replace(/(\.\d*?)0+$/,"$1").replace(/\.$/,"")+" mlrd so'm";
      if(v>=1e6)return(v/1e6).toFixed(v%1e6===0?0:2).replace(/(\.\d*?)0+$/,"$1").replace(/\.$/,"")+" mln so'm";
      if(v>=1e3)return spc(v)+" so'm";
      return spc(v)+" so'm";
    }
    if(c>=1e6)return(c/1e6).toFixed(1)+"M "+val.b;
    if(c>=1e3)return Math.round(c/1e3)+"K "+val.b;
    return Math.round(c)+" "+val.b;
  }
  // To'liq format: probel bilan ajratilgan (1 250 000 so'm)
  if(val.id==="uzs")return spc(v)+" so'm";
  return spc(Math.round(c))+" "+val.b;
}

// ── SVG ICONS (all self-contained) ──────────────────────────────────────────
const Ico={
  search:c=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="5" stroke={c} strokeWidth="1.6"/><line x1="11.5" y1="11.5" x2="15.5" y2="15.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  user:c=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke={c} strokeWidth="1.4"/><path d="M2 16c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  settings:c=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="2.5" stroke={c} strokeWidth="1.4"/><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.6 3.6l1.4 1.4M13 13l1.4 1.4M3.6 14.4l1.4-1.4M13 5l1.4-1.4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  shield:c=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 5v5c0 4 3.5 7 7 8 3.5-1 7-4 7-8V5L10 2z" fill={c} opacity=".15" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M7 10l2 2 4-4" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  help:c=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.4"/><path d="M8 8c0-1.1.9-2 2-2s2 .9 2 2c0 1-1 1.5-2 2.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="14.5" r=".9" fill={c}/></svg>,
  globe:c=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke={c} strokeWidth="1.3"/><path d="M9 1.5c-2 2-3 4-3 7.5s1 5.5 3 7.5M9 1.5c2 2 3 4 3 7.5s-1 5.5-3 7.5M1.5 9h15" stroke={c} strokeWidth="1.1"/></svg>,
  moon:c=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 10A6 6 0 016 4c0-.7.1-1.4.3-2A6 6 0 1014 11.7 6.2 6.2 0 0112 10z" fill={c} opacity=".2" stroke={c} strokeWidth="1.3"/></svg>,
  sun:c=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill={c}/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  door:c=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke={c} strokeWidth="1.3"/><circle cx="10.5" cy="8" r="1" fill={c}/></svg>,
  camera:c=><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3.5" width="12" height="8.5" rx="1.5" stroke={c} strokeWidth="1.3"/><circle cx="7" cy="7.5" r="2" stroke={c} strokeWidth="1.3"/><path d="M5 3.5l.8-2h2.4l.8 2" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  edit:c=><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10L9.5 2.5a2 2 0 012.8 2.8L4.8 13 1 13.2 2 10z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  check:c=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash:c=><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="2" y1="4" x2="12" y2="4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M5 4V2.5h4V4M3 4l.7 8h6.6l.7-8" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  key:c=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="7" r="3.5" stroke={c} strokeWidth="1.3"/><path d="M9 9l5 5M12 12l1.5-1.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  crown:c=><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11h10M2 11L3.5 4l3.5 4 3.5-6L12 11" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  users:c=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke={c} strokeWidth="1.2"/><path d="M1 13c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="5" r="2" stroke={c} strokeWidth="1.1" opacity=".6"/><path d="M15 13c0-2-1.5-3.5-3-3.5" stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity=".6"/></svg>,
  chevron:(c,up)=><svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{transform:up?"rotate(180deg)":"none",transition:"transform .2s"}}><path d="M4 6l4 4 4-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  back:c=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  right:c=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  repeat:c=><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7A5 5 0 0111 3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M9 2l2 1.5L9 5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7a5 5 0 01-9 3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M5 12l-2-1.5L5 9" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  wallet:c=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="5" width="18" height="13" rx="2.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.4"/><path d="M2 9h18" stroke={c} strokeWidth="1.3"/><circle cx="15" cy="13" r="1.5" fill={c} opacity=".8"/></svg>,
  money:c=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><circle cx="9" cy="9" r="2.5" stroke={c} strokeWidth="1.3"/></svg>,
  bank:c=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 8L10 3l8 5H2z" fill={c} opacity=".2" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><rect x="4" y="9" width="2.5" height="6" rx=".8" fill={c} opacity=".6"/><rect x="8.75" y="9" width="2.5" height="6" rx=".8" fill={c} opacity=".6"/><rect x="13.5" y="9" width="2.5" height="6" rx=".8" fill={c} opacity=".6"/><line x1="2" y1="15" x2="18" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  brain:c=><svg width="38" height="38" viewBox="0 0 38 38" fill="none"><path d="M19 6c-3 0-5 1.5-6.5 4-2 0-4 1.5-4 4 0 1 .3 2 .8 2.8C8 18 7 20 7 22.5c0 3 2 5 4.5 6V30c0 1.7 1.3 3 3 3h9c1.7 0 3-1.3 3-3v-1.5c2.5-1 4.5-3 4.5-6 0-2.5-1-4.5-3-5.7.5-.8.8-1.8.8-2.8 0-2.5-2-4-4-4C23 7.5 22 6 19 6z" fill={c} opacity=".15" stroke={c} strokeWidth="1.5"/><path d="M19 10v18M13 14c1.5.8 3.5 1.2 6 1.2M25 17c-1.5.8-3.5 1.2-6 1.2" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity=".6"/></svg>,
  lock:c=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="9" rx="2" fill={c} opacity=".2" stroke={c} strokeWidth="1.4"/><path d="M7 9V7a3 3 0 016 0v2" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="13.5" r="1.5" fill={c}/></svg>,
  finger:c=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C6.7 2 4 4.7 4 8c0 1 .3 2 .7 2.8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M10 2c3.3 0 6 2.7 6 6 0 4-2 7-6 9C6 15 4 12 4 8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="8" r="2" fill={c} opacity=".3"/><circle cx="10" cy="8" r="1" fill={c}/></svg>,
  tg:()=><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/></svg>,
  version:c=><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h7l4 4v8H4V4z" fill={c} opacity=".15" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M11 4v4h4" stroke={c} strokeWidth="1.3"/><path d="M7 10l1.5 2 3-3" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  fire:c=><svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2c0 2-3 3.5-3 6.5a3 3 0 006 0c0-2-1-3-1-4.5 0 1.5-1 3-1 3.5" stroke={c} strokeWidth="1.3" strokeLinecap="round" fill={c} fillOpacity=".1"/></svg>,
  add:c=><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><line x1="13" y1="4" x2="13" y2="22" stroke={c} strokeWidth="2.5" strokeLinecap="round"/><line x1="4" y1="13" x2="22" y2="13" stroke={c} strokeWidth="2.5" strokeLinecap="round"/></svg>,
  navHome:c=><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3L2 11h3v11h5v-6h6v6h5V11h3L13 3z" fill={c} opacity=".18" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/><circle cx="13" cy="9.5" r="1.5" fill={c} opacity=".7"/></svg>,
  navChart:c=><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="15" width="4" height="8" rx="1.5" fill={c} opacity=".45"/><rect x="9" y="9" width="4" height="14" rx="1.5" fill={c} opacity=".65"/><rect x="15" y="12" width="4" height="11" rx="1.5" fill={c} opacity=".55"/><rect x="21" y="5" width="4" height="18" rx="1.5" fill={c} opacity=".85"/><path d="M4 13L10 7.5l6 3 6-7" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/></svg>,
  navGoal:c=><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="10.5" stroke={c} strokeWidth="1.4" opacity=".25"/><circle cx="13" cy="13" r="7" stroke={c} strokeWidth="1.4" opacity=".5"/><circle cx="13" cy="13" r="3.5" stroke={c} strokeWidth="1.4" opacity=".8"/><circle cx="13" cy="13" r="1.5" fill={c}/><line x1="13" y1="2.5" x2="13" y2="5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><line x1="13" y1="21" x2="13" y2="23.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><line x1="2.5" y1="13" x2="5" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><line x1="21" y1="13" x2="23.5" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  navRep:c=><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="5" y="3" width="16" height="20" rx="2.5" fill={c} opacity=".12" stroke={c} strokeWidth="1.4"/><line x1="9" y1="9" x2="17" y2="9" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><line x1="9" y1="13" x2="17" y2="13" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><line x1="9" y1="17" x2="14" y2="17" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><circle cx="19" cy="19" r="4" fill={c}/><path d="M17 19l1.5 1.5L21 17.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function KatIco({id,c,s=20}){
  const p={oziq:"M10 2C7 2 4 5 4 8c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7 0-3-3-6-6-6z",transport:null,kiyim:null,sog:null,kommunal:null,konil:null,talim:null,boshqa:null};
  if(id==="oziq")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2C7 2 4 5 4 8c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7 0-3-3-6-6-6z" fill={c} opacity=".2"/><path d="M7 9c0 2.5 1.3 4.5 3 5.5C12.7 13.5 14 11.5 14 9H7z" fill={c}/><line x1="10" y1="2" x2="10" y2="5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
  if(id==="transport")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="9" rx="2.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><rect x="4" y="8" width="5" height="3" rx="1" fill={c} opacity=".6"/><rect x="11" y="8" width="5" height="3" rx="1" fill={c} opacity=".6"/><path d="M5 15v2m10-2v2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
  if(id==="kiyim")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M7 2L4 5l2 1.5V16h8V6.5L16 5l-3-3c0 0-1 2-3 2S7 2 7 2z" fill={c} opacity=".2" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>;
  if(id==="sog")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="8.5" y="3" width="3" height="14" rx="1.5" fill={c}/><rect x="3" y="8.5" width="14" height="3" rx="1.5" fill={c}/></svg>;
  if(id==="kommunal")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2L7 8h2.5l-2 9 7-9H12L14 2H10z" fill={c} opacity=".25" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>;
  if(id==="konil")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><circle cx="8" cy="11" r="2" fill={c}/><path d="M13 9l1.5 2L13 13" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if(id==="talim")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="9" height="12" rx="1.5" fill={c} opacity=".2" stroke={c} strokeWidth="1.3"/><path d="M7 17h9V8" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" fill={c} opacity=".5"/><rect x="11" y="3" width="6" height="6" rx="1.5" fill={c} opacity=".3"/><rect x="3" y="11" width="6" height="6" rx="1.5" fill={c} opacity=".3"/><rect x="11" y="11" width="6" height="6" rx="1.5" fill={c} opacity=".5"/></svg>;
}
function DarIco({id,c,s=20}){
  if(id==="oylik")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><line x1="3" y1="8" x2="17" y2="8" stroke={c} strokeWidth="1.3"/><circle cx="7" cy="12" r="1.5" fill={c}/><path d="M10 11h4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>;
  if(id==="qoshimcha")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" fill={c} opacity=".12" stroke={c} strokeWidth="1.3"/><path d="M10 6v8M6 10h8" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if(id==="biznes")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M3 9h14v8a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><path d="M1 9h18M7 9V7a3 3 0 016 0v2" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>;
  if(id==="sovga")return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="8" width="16" height="2.5" rx="1.25" fill={c} opacity=".5"/><rect x="3" y="10.5" width="14" height="7" rx="1.5" fill={c} opacity=".15" stroke={c} strokeWidth="1.3"/><path d="M10 8.5v9" stroke={c} strokeWidth="1.3"/><path d="M10 8C10 8 7 7 7 5s2-2 3 0c1-2 3-2 3 0s-3 3-3 3z" fill={c} opacity=".7"/></svg>;
  return <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2" fill={c}/><circle cx="3.5" cy="10" r="2" fill={c} opacity=".5"/><circle cx="16.5" cy="10" r="2" fill={c} opacity=".5"/></svg>;
}

function MoneyInput({value,onChange,style,placeholder,autoFocus}){
  // type=text bilan probel ko'rsatadi, lekin toza raqam saqlaydi
  const fmt=(s)=>{const digits=String(s).replace(/[^0-9]/g,"");if(!digits)return "";return digits.replace(/\B(?=(\d{3})+(?!\d))/g," ");};
  const display=value?fmt(value):"";
  return <input type="text" inputMode="numeric" style={style} placeholder={placeholder} autoFocus={autoFocus} value={display} onChange={e=>{const raw=e.target.value.replace(/[^0-9]/g,"");onChange(raw);}}/>;
}
function Av({src,name,size=44,ac}){
  const ini=(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  if(src)return <img src={src} alt={name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"2px solid "+ac+"44",flexShrink:0}}/>;
  return <div style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,"+ac+","+ac+"88)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.36,fontWeight:800,color:"#fff",flexShrink:0}}>{ini}</div>;
}
function Spark({data,color}){
  if(!data||data.length<2)return null;
  const max=Math.max(...data,1);
  const W=72,H=26;
  const pts=data.map((v,i)=>((i/(data.length-1))*W)+","+(H-(v/max)*H)).join(" ");
  return <svg width={W} height={H} style={{display:"block"}}><polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Heat({xar,ac}){
  const days=[];
  const now=new Date();
  for(let i=29;i>=0;i--){
    const d=new Date(now);
    d.setDate(d.getDate()-i);
    const k=d.toISOString().slice(0,10);
    const tot=xar.filter(x=>x.sana===k).reduce((s,x)=>s+Number(x.summa||0),0);
    days.push({k,tot});
  }
  const max=Math.max(...days.map(d=>d.tot),1);
  return <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:4}}>
    {days.map(d=>{
      const a=d.tot>0?Math.round((d.tot/max)*200+30):0;
      const bg=d.tot>0?ac+a.toString(16).padStart(2,"0"):"#1e293b22";
      return <div key={d.k} title={d.k+": "+d.tot.toLocaleString()} style={{aspectRatio:"1",borderRadius:4,background:bg,cursor:"default",transition:"transform .15s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.4)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>;
    })}
  </div>;
}
function Tst({msg,type,th}){
  if(!msg)return null;
  const bg=type==="err"?th.rd:type==="warn"?th.am:th.gr;
  return <div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:bg,color:"#fff",borderRadius:14,padding:"11px 22px",fontSize:14,fontWeight:700,maxWidth:340,textAlign:"center",boxShadow:"0 8px 28px rgba(0,0,0,.3)",pointerEvents:"none"}}>{msg}</div>;
}
function BH({label,th,onBack}){
  return <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
    <button onClick={onBack} style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{Ico.back(th.t1)}</button>
    <div style={{fontSize:17,fontWeight:700,color:th.t1}}>{label}</div>
  </div>;
}

export default function App(){
  const [boot,setBoot]=useState(true);
  const [onbStep,setOnbStep]=useState(()=>{try{return localStorage.getItem("oilaV7Onb")==="1"?-1:0;}catch{return 0;}});
  const [confetti,setConfetti]=useState(false);
  const [qarzDonePrompt,setQarzDonePrompt]=useState(null);
  const [partialQarz,setPartialQarz]=useState(null);
  const [partialSum,setPartialSum]=useState("");
  const [user,setUser]=useState(null);
  const [adminStats,setAdminStats]=useState(null);
  const [adminLoad,setAdminLoad]=useState(false);
  const [oila,setOila]=useState(null);
  const [azolar,setAzolar]=useState([]);
  const [xar,setXar]=useState([]);
  const [dar,setDar]=useState([]);
  const [maq,setMaq]=useState([]);
  const [vazifalar,setVazifalar]=useState([]);
  const [kidBalances,setKidBalances]=useState({});
  const [showAddVazifa,setShowAddVazifa]=useState(false);
  const [vTitle,setVTitle]=useState("");
  const [vReward,setVReward]=useState("");
  const [vAssignee,setVAssignee]=useState("");
  const [vEmoji,setVEmoji]=useState("📚");
  const [showAddKid,setShowAddKid]=useState(false);
  const [kidName,setKidName]=useState("");
  const [kidLogin,setKidLogin]=useState("");
  const [kidPw,setKidPw]=useState("");
  const [scr,setScr]=useState("login");
  const [tst,setTst]=useState({msg:"",type:"ok"});
  const [dark,setDark]=useState(true);
  const [lg,setLg]=useState("uz");
  const [val,setVal]=useState(VALS[0]);
  const [hisFil,setHisFil]=useState("all");
  const [ctab,setCtab]=useState("line");
  const [adv,setAdv]=useState("");
  const [advL,setAdvL]=useState(false);
  const [srch,setSrch]=useState("");
  const [showS,setShowS]=useState(false);
  const [addM,setAddM]=useState(false);
  const [tupId,setTupId]=useState(null);
  const [tupS,setTupS]=useState("");
  const [reg,setReg]=useState(false);
  const [join,setJoin]=useState(false);
  const [faqO,setFaqO]=useState(null);
  const [edN,setEdN]=useState(false);
  const [newN,setNewN]=useState("");
  const [pTab,setPTab]=useState("main");
  const [pinStep,setPinStep]=useState("idle");
  const [pinVal,setPinVal]=useState("");
  const [pinCfm,setPinCfm]=useState("");
  const [finger,setFinger]=useState(false);
  const [qarzlar,setQarzlar]=useState([]);
  const [showAddQarz,setShowAddQarz]=useState(false);
  const [qarzTur,setQarzTur]=useState("olgan");
  const [qarzKim,setQarzKim]=useState("");
  const [qarzSum,setQarzSum]=useState("");
  const [qarzIzoh,setQarzIzoh]=useState("");
  const [qarzSana,setQarzSana]=useState(td());
  const [qarzQaytSana,setQarzQaytSana]=useState("");
  const [exportLoading,setExportLoading]=useState(false);
  const [isPremium,setIsPremium]=useState(()=>{try{return localStorage.getItem("oilaV7Prem")==="1";}catch{return false;}});
  const [showPremModal,setShowPremModal]=useState(false);
  const [notifEnabled,setNotifEnabled]=useState(()=>{try{return localStorage.getItem("oilaV7Notif")==="1";}catch{return false;}});
  const [notifTime,setNotifTime]=useState(()=>{try{return localStorage.getItem("oilaV7NotifT")||"20:00";}catch{return "20:00";}});
  const [showScanner,setShowScanner]=useState(false);
  const [scanMsg,setScanMsg]=useState("");
  const [showImport,setShowImport]=useState(false);
  const [importRows,setImportRows]=useState([]);
  const [importStep,setImportStep]=useState("upload");
  const importFileRef=useRef(null);
  const videoRef=useRef(null);
  const scanStreamRef=useRef(null);
  const scanRafRef=useRef(null);
  const [fbRating,setFbRating]=useState(0);
  const [fbText,setFbText]=useState("");
  const [fbType,setFbType]=useState("taklif");
  const [fbSending,setFbSending]=useState(false);
  const [qarzReqs,setQarzReqs]=useState([]);
  const [qarzTel,setQarzTel]=useState("");
  const [qarzLinked,setQarzLinked]=useState(false);
  const [notifs,setNotifs]=useState([]);
  const [showNotifs,setShowNotifs]=useState(false);
  const [showReferral,setShowReferral]=useState(false);
  const [refCount,setRefCount]=useState(0);
  const [fRefCode,setFRefCode]=useState("");
  const [rates,setRates]=useState([]);
  const [rateL,setRateL]=useState(false);
  const [fIsm,setFIsm]=useState("");const [fEm,setFEm]=useState("");const [fPw,setFPw]=useState("");
  const [fON,setFON]=useState("");const [fKd,setFKd]=useState("");const [fTel,setFTel]=useState("");const [fDial,setFDial]=useState("+998");const [fCountry,setFCountry]=useState("uz");const [showValDD,setShowValDD]=useState(false);const [fRel,setFRel]=useState("");const [showCountryDD,setShowCountryDD]=useState(false);const [showRelDD,setShowRelDD]=useState(false);const [inviteQarz,setInviteQarz]=useState(null);const [xForMember,setXForMember]=useState("");const [xMode,setXMode]=useState("expense");const [xReqs,setXReqs]=useState([]);const [quickItem,setQuickItem]=useState(null);const [quickSum,setQuickSum]=useState("");const [voiceOn,setVoiceOn]=useState(false);const [voiceText,setVoiceText]=useState("");const [showVoice,setShowVoice]=useState(false);const [voiceParsed,setVoiceParsed]=useState(null);const voiceRecRef=useRef(null);
  const [fS,setFS]=useState("");const [fK,setFK]=useState("oziq");const [fIz,setFIz]=useState("");const [fSn,setFSn]=useState(td());const [fRp,setFRp]=useState(false);
  const [fDS,setFDS]=useState("");const [fDT,setFDT]=useState("oylik");const [fDI,setFDI]=useState("");
  const [fBj,setFBj]=useState("2000000");const [fKL,setFKL]=useState({});
  const [mN,setMN]=useState("");const [mS,setMS]=useState("");const [mR,setMR]=useState("#10b981");
  const [editMq,setEditMq]=useState(null);const [editMqS,setEditMqS]=useState("");const [editMqN,setEditMqN]=useState("");
  const fRef=useRef(null);
  const APP_VER="1.0.0";
  const th=useMemo(()=>MK(dark),[dark]);
  const t=useMemo(()=>TL[lg]||TL.uz,[lg]);
  const f=useCallback((n,sh)=>fmtN(n,val,sh),[val]);
  const ok$=useCallback((msg,type="ok")=>{try{if(navigator.vibrate)navigator.vibrate(type==="err"?[8,40,8]:12);}catch(e){}setTst({msg,type});setTimeout(()=>setTst({msg:"",type:"ok"}),3000);},[]);
  const fireConfetti=useCallback(()=>{setConfetti(true);setTimeout(()=>setConfetti(false),2500);},[]);
  const S={
    pg:{minHeight:"100vh",background:th.bg,fontFamily:"'Inter',system-ui,sans-serif",color:th.t1,maxWidth:430,margin:"0 auto"},
    cd:{background:th.sur,borderRadius:18,padding:16,border:"1px solid "+th.bor,marginBottom:10},
    ip:{width:"100%",background:th.surH,border:"1.5px solid "+th.bor,borderRadius:13,padding:"13px 16px",color:th.t1,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:12},
    lb:{fontSize:10,color:th.t2,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:1.4,fontWeight:600},
    bt:(a,b)=>({width:"100%",background:"linear-gradient(135deg,"+(a||th.ac)+","+(b||th.ac2)+")",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:9,boxShadow:"0 4px 14px "+(a||th.ac)+"44"}),
    tb:on=>({flex:1,background:on?th.ac+"18":"transparent",border:"1.5px solid "+(on?th.ac:th.bor),borderRadius:11,padding:"9px 0",color:on?th.ac:th.t2,cursor:"pointer",fontWeight:700,fontSize:13}),
    ch:(on,c)=>({whiteSpace:"nowrap",background:on?(c||th.ac)+"18":"transparent",border:"1px solid "+(on?(c||th.ac):th.bor),borderRadius:20,padding:"6px 14px",color:on?(c||th.ac):th.t2,cursor:"pointer",fontSize:12,fontWeight:600}),
    row:{display:"flex",justifyContent:"space-between",alignItems:"center"},
    sec:{fontSize:10,color:th.t2,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:8},
  };
  const loadFam=useCallback(async u=>{
    if(!u?.oilaId)return;
    // TEZKOR: avval keshdan ko'rsatamiz (Firebase kutmasdan)
    try{
      const cO=db.gCache("oila_"+u.oilaId);
      if(cO){
        setOila(cO);setFBj(String(cO.budjet||2000000));setFKL(cO.katLimits||{});
        const cIds=cO.azolarIds||[];
        const cMs=cIds.map(a=>db.gCache("user_"+a)).filter(Boolean);if(cMs.length)setAzolar(cMs);
        const caX=[],caD=[];
        cIds.forEach(a=>{(db.gCache("x_"+u.oilaId+"_"+a)||[]).forEach(x=>caX.push({...x,uid:a}));(db.gCache("d_"+u.oilaId+"_"+a)||[]).forEach(d=>caD.push({...d,uid:a}));});
        if(caX.length)setXar(caX.sort((a,b)=>b.id-a.id));if(caD.length)setDar(caD.sort((a,b)=>b.id-a.id));
        const cMaq=db.gCache("maq_"+u.oilaId);if(cMaq)setMaq(cMaq);
        const cQ=db.gCache("qarz_"+u.oilaId);if(cQ)setQarzlar(cQ);
      }
    }catch(e){}
    // Keyin Firebase'dan yangilaymiz (eng so'nggi ma'lumot)
    const o=await db.g("oila_"+u.oilaId);if(!o)return;
    setOila(o);setFBj(String(o.budjet||2000000));setFKL(o.katLimits||{});
    const ids=o.azolarIds||[];
    // PARALLEL yuklash - hammasi bir vaqtda (tez!)
    const [ms,xArr,dArr,maqR,qarzR,qreqR,xreqR,notifR,refsR,vazR,kidbR]=await Promise.all([
      Promise.all(ids.map(a=>db.g("user_"+a))),
      Promise.all(ids.map(a=>db.g("x_"+u.oilaId+"_"+a))),
      Promise.all(ids.map(a=>db.g("d_"+u.oilaId+"_"+a))),
      db.g("maq_"+u.oilaId),
      db.g("qarz_"+u.oilaId),
      u.tel?db.g("qreq_"+u.tel):Promise.resolve(null),
      db.g("xreq_"+u.id),
      db.g("notif_"+u.id),
      db.g("refs_"+u.id),
      db.g("vazifa_"+u.oilaId),
      db.g("kidbal_"+u.oilaId)
    ]);
    setAzolar(ms.filter(Boolean));
    const aX=[],aD=[];
    ids.forEach((a,i)=>{
      (xArr[i]||[]).forEach(x=>aX.push({...x,uid:a}));
      (dArr[i]||[]).forEach(d=>aD.push({...d,uid:a}));
    });
    setXar(aX.sort((a,b)=>b.id-a.id));setDar(aD.sort((a,b)=>b.id-a.id));
    setMaq(maqR||[]);
    setQarzlar(qarzR||[]);
    setVazifalar(vazR||[]);
    setKidBalances(kidbR||{});
    if(u.tel)setQarzReqs(qreqR||[]);
    setXReqs(xreqR||[]);
    let uN=notifR||[];const nsK="news_v1_"+u.id;
    if(!(uN.find(n=>n.id==="news1"))){const nsSeen=await db.g(nsK);if(!nsSeen){const nw={id:"news1",type:"yangilik",title:"Yangi funksiyalar!",body:"Endi qarzlarni telefon orqali bog'lash, chek QR skaneri va PDF/Excel eksport mavjud!",sana:new Date().toISOString(),read:false};uN=[nw,...uN];db.s("notif_"+u.id,uN);db.s(nsK,true);}}
    setNotifs(uN);
    setRefCount((refsR||[]).length);
    // Qarz qaytarish tasdiqlangan bo'lsa - xarajat/daromad qo'shish so'rovini ko'rsataman
    const pd=await db.g("paydone_"+u.id);
    if(pd){setQarzDonePrompt({tur:pd.tur,summa:pd.summa,kim:pd.kim,id:pd.id,paid:true});await db.s("paydone_"+u.id,null);}
    if((refsR||[]).length>=3&&!localStorage.getItem("oilaV7Prem")){localStorage.setItem("oilaV7Prem","1");setIsPremium(true);}
  },[]);
  useEffect(()=>{(async()=>{
    try{
      // Firebase Auth holatini kuzatamiz - faqat kirgan bo'lsa ma'lumot o'qiymiz
      auth.onChange(async(fbUser)=>{
        if(fbUser){
          // Kirgan: localStorage'dagi uid yoki Auth uid bilan user topamiz
          let uid=null;
          try{const s=localStorage.getItem("oilaV7");if(s)uid=JSON.parse(s).uid;}catch(e){}
          if(!uid)uid=fbUser.uid;
          const u=await db.g("user_"+uid);
          if(u){setUser(u);setScr("bosh");loadFam(u);}
          else{const u2=await db.g("user_"+fbUser.uid);if(u2){setUser(u2);setScr("bosh");loadFam(u2);}}
        }
        // Kirmagan: login ekranida qoladi (ma'lumot o'qimaymiz)
      });
      const dl=localStorage.getItem("oilaV7L");if(dl&&TL[dl])setLg(dl);
      const dd=localStorage.getItem("oilaV7D");if(dd!=null)setDark(dd!=="false");
      const dv=localStorage.getItem("oilaV7V");if(dv){const v=VALS.find(x=>x.id===dv);if(v)setVal(v);}
      try{const params=new URLSearchParams(window.location.search);const rc=params.get("ref");if(rc){setFRefCode(rc);setReg(true);}const fam=params.get("fam");if(fam){setFKd(fam);setJoin(true);setReg(true);}const tx=params.get("tilxat");if(tx){try{setVerifyTilxat(JSON.parse(tx));}catch(e2){}}}catch(e){}
    }catch{}
    setBoot(false);
  })();},[]);
  useEffect(()=>{if(scr==="bosh"&&rates.length===0)fetchRates();},[scr]);
  const fetchRates=async()=>{
    setRateL(true);
    let ok2=false;
    // Bir nechta CORS proxy orqali urinish (artifact tashqi APIni bloklashi mumkin)
    const cbuUrl="https://cbu.uz/uz/arkhiv-kursov-valyut/json/";
    const sources=[
      "https://api.allorigins.win/raw?url="+encodeURIComponent(cbuUrl),
      "https://corsproxy.io/?url="+encodeURIComponent(cbuUrl),
      cbuUrl,
      "https://api.codetabs.com/v1/proxy/?quest="+cbuUrl
    ];
    for(const url of sources){
      try{
        const res=await fetch(url);
        const data=await res.json();
        const want=["USD","EUR","RUB","GBP","CNY","KZT"];
        const filt=data.filter(r=>want.includes(r.Ccy));
        if(filt.length>0){
          setRates(filt.map(r=>({code:r.Ccy,rate:r.Rate,name:r.CcyNm_UZ,diff:r.Diff})));
          ok2=true;
          try{localStorage.setItem("oilaV7Rates",JSON.stringify(filt.map(r=>({code:r.Ccy,rate:r.Rate,name:r.CcyNm_UZ}))));localStorage.setItem("oilaV7RatesT",new Date().toISOString());}catch(e){}
          ok$(lg==="uz"?"Kurslar yangilandi!":lg==="ru"?"Курсы обновлены!":"Rates updated!");
          break;
        }
      }catch(e){}
    }
    if(!ok2){
      // Saqlangan kurslar yoki zaxira
      let saved=null;
      try{saved=JSON.parse(localStorage.getItem("oilaV7Rates"));}catch(e){}
      if(saved&&saved.length>0){setRates(saved);ok$(lg==="uz"?"Saqlangan kurslar (internet yo'q)":"Saved rates (offline)","warn");}
      else{setRates([{code:"USD",rate:"12850",name:"AQSH dollari"},{code:"EUR",rate:"13920",name:"Evro"},{code:"RUB",rate:"143",name:"Rossiya rubli"},{code:"GBP",rate:"16200",name:"Britaniya funti"},{code:"CNY",rate:"1780",name:"Xitoy yuani"},{code:"KZT",rate:"26",name:"Qozog'. tengesi"}]);ok$(lg==="uz"?"Demo kurslar (API bloklangan)":"Demo rates (API blocked)","warn");}
    }
    setRateL(false);
  };
  const [showPw,setShowPw]=useState(false);
  const [showResetConfirm,setShowResetConfirm]=useState(false);
  const [resetEmail,setResetEmail]=useState("");
  const [verifyTilxat,setVerifyTilxat]=useState(null);
  const [showResetScreen,setShowResetScreen]=useState(false);
  const [resetInput,setResetInput]=useState("");
  const [resetSent,setResetSent]=useState(false);
  const switchAuthMode=(toReg)=>{
    // Ro'yxat <-> Kirish almashganda maydonlarni tozalaymiz
    setReg(toReg);
    setFIsm("");setFEm("");setFPw("");setFTel("");setFKd("");setFRel("");setFON("");
    setShowPw(false);setJoin(false);
  };
  const genPassword=()=>{
    const chars="abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let p="";for(let i=0;i<10;i++)p+=chars[Math.floor(Math.random()*chars.length)];
    setFPw(p);setShowPw(true);
    ok$(lg==="uz"?"Parol yaratildi! Eslab qoling yoki saqlang.":"Password generated!");
  };
  const handleResetPw=()=>{
    // Alohida tiklash ekranini ochamiz
    setResetInput(fEm.trim()||"");setResetSent(false);setShowResetScreen(true);
  };
  const sendResetEmail=async()=>{
    const email=resetInput.trim().toLowerCase();
    if(!email||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return ok$(lg==="uz"?"To'g'ri email kiriting":"Enter valid email","err");
    // Avval email ro'yxatda bormi - o'zimiz tekshiramiz (Firebase buni aytmaydi)
    // Keshni chetlab, to'g'ridan-to'g'ri tekshiramiz
    let exists=false;
    try{
      const uid=await db.gFresh("em_"+email);
      if(uid)exists=true;
    }catch(e){exists=false;}
    if(!exists){
      // Ro'yxatdan o'tmagan - ro'yxatga yo'naltiramiz
      ok$(lg==="uz"?"Bu email ro'yxatdan o'tmagan. Ro'yxatdan o'ting.":"Email not registered. Please sign up.","err");
      setTimeout(()=>{setShowResetScreen(false);setReg(true);setFEm(email);},1600);
      return;
    }
    // Email ro'yxatda bor - tiklash xatini yuboramiz
    try{
      await auth.resetPassword(email);
      setResetSent(true);
    }catch(e){
      ok$(lg==="uz"?"Xato: "+(e.code||e.message):"Error","err");
    }
  };
  const doAuth=async()=>{
   try{
    const dialNow=reg?((COUNTRIES.find(c=>c.code===fCountry)||{}).dial||""):fDial;
    const telKey=(dialNow+fTel.trim()).replace(/[^0-9+]/g,"");
    if(reg){
      if(!fIsm.trim()||!fTel.trim()||fPw.length<6)return ok$(lg==="uz"?"Ism, telefon va parol (6+ belgi) kiriting":"Enter name, phone and password (6+)","err");
      if(!fEm.trim()||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fEm.trim()))return ok$(lg==="uz"?"To'g'ri email kiriting (parolni tiklash uchun zarur)":"Enter valid email","err");
      if(await db.g("tel9_"+normTel(fTel)))return ok$(lg==="uz"?"Bu telefon allaqachon ro'yxatda":"Phone already registered","err");
      // Firebase Auth orqali akkaunt yaratish (parol Firebase'da xavfsiz saqlanadi)
      let authUser;
      try{
        authUser=await auth.register(fEm.trim().toLowerCase(),fPw);
      }catch(e){
        const msg=e.code==="auth/email-already-in-use"?(lg==="uz"?"Bu email allaqachon ishlatilgan":"Email already in use"):e.code==="auth/weak-password"?(lg==="uz"?"Parol juda zaif (6+ belgi)":"Weak password"):(lg==="uz"?"Ro'yxatda xato: ":"Register error: ")+(e.code||e.message);
        return ok$(msg,"err");
      }
      const uid=authUser.uid,ph=await hp(fPw);
      if(join){
        if(!fKd.trim())return ok$(t.fa,"err");
        const o=await db.g("oila_"+fKd.trim());if(!o)return ok$(t.ffe,"err");
        // Oila a'zolari limiti: bepulда 2 a'zo, Premium uchun cheksiz
        if((o.azolarIds||[]).length>=2&&!o.premium){
          return ok$(lg==="uz"?"Bu oilada a'zolar limiti to'lgan (2). Oila boshi Premiumga o'tishi kerak.":lg==="ru"?"Лимит участников исчерпан (2). Нужен Premium.":"Family member limit reached (2). Head needs Premium.","err");
        }
        const dialC=(COUNTRIES.find(c=>c.code===fCountry)||{}).dial||"";const tel=(dialC+fTel.trim()).replace(/[^0-9+]/g,"");const n9=normTel(fTel);
        const nu={id:uid,ism:fIsm.trim(),email:fEm.trim().toLowerCase(),tel,ph,oilaId:fKd.trim(),rol:"azo",rel:fRel||"boshqa",photo:null};
        await db.s("user_"+uid,nu);if(fEm.trim())await db.s("em_"+fEm.toLowerCase(),uid);
        if(n9){await db.s("tel9_"+n9,uid);await db.s("tel_"+tel,uid);await db.s("tphone_"+n9,fEm.trim().toLowerCase());}
        if(fRefCode.trim()){const refUid=fRefCode.trim();const refUser=await db.g("user_"+refUid);if(refUser&&refUid!==uid){const refList=(await db.g("refs_"+refUid))||[];if(!refList.find(r=>r.uid===uid)){refList.push({uid,ism:fIsm.trim(),sana:new Date().toISOString()});await db.s("refs_"+refUid,refList);const rn={id:Date.now()+Math.random(),type:"yangilik",title:lg==="uz"?"Yangi taklif! \ud83c\udf89":"New referral!",body:(fIsm.trim())+" "+(lg==="uz"?"sizning havolangiz orqali qo'shildi":"joined via your link"),sana:new Date().toISOString(),read:false};const rc=(await db.g("notif_"+refUid))||[];await db.s("notif_"+refUid,[rn,...rc].slice(0,100));if(refList.length>=3){const ru=await db.g("user_"+refUid);if(ru){/* premium granted on their next load */}}}}}
        await db.s("x_"+fKd.trim()+"_"+uid,[]);await db.s("d_"+fKd.trim()+"_"+uid,[]);
        o.azolarIds=[...(o.azolarIds||[]),uid];await db.s("oila_"+o.id,o);
        const cV=COUNTRIES.find(c=>c.code===fCountry);if(cV){const vv=VALS.find(x=>x.id===cV.val);if(vv){setVal(vv);localStorage.setItem("oilaV7V",vv.id);}}
        localStorage.setItem("oilaV7",JSON.stringify({uid}));setUser(nu);await loadFam(nu);setScr("bosh");ok$(t.jf2);
      }else{
        if(!fON.trim())return ok$(t.fa,"err");
        const oid="o"+Date.now();
        const dialC=(COUNTRIES.find(c=>c.code===fCountry)||{}).dial||"";const tel=(dialC+fTel.trim()).replace(/[^0-9+]/g,"");const n9=normTel(fTel);
        const nu={id:uid,ism:fIsm.trim(),email:fEm.trim().toLowerCase(),tel,ph,oilaId:oid,rol:"bosh",rel:"bosh",photo:null};
        const no_={id:oid,nomi:fON.trim(),boshId:uid,azolarIds:[uid],budjet:2000000,katLimits:{}};
        await db.s("user_"+uid,nu);if(fEm.trim())await db.s("em_"+fEm.toLowerCase(),uid);
        if(n9){await db.s("tel9_"+n9,uid);await db.s("tel_"+tel,uid);await db.s("tphone_"+n9,fEm.trim().toLowerCase());}
        if(fRefCode.trim()){const refUid=fRefCode.trim();const refUser=await db.g("user_"+refUid);if(refUser&&refUid!==uid){const refList=(await db.g("refs_"+refUid))||[];if(!refList.find(r=>r.uid===uid)){refList.push({uid,ism:fIsm.trim(),sana:new Date().toISOString()});await db.s("refs_"+refUid,refList);const rn={id:Date.now()+Math.random(),type:"yangilik",title:lg==="uz"?"Yangi taklif! \ud83c\udf89":"New referral!",body:(fIsm.trim())+" "+(lg==="uz"?"sizning havolangiz orqali qo'shildi":"joined via your link"),sana:new Date().toISOString(),read:false};const rc=(await db.g("notif_"+refUid))||[];await db.s("notif_"+refUid,[rn,...rc].slice(0,100));}}}
        await db.s("oila_"+oid,no_);await db.s("x_"+oid+"_"+uid,[]);await db.s("d_"+oid+"_"+uid,[]);
        const cV=COUNTRIES.find(c=>c.code===fCountry);if(cV){const vv=VALS.find(x=>x.id===cV.val);if(vv){setVal(vv);localStorage.setItem("oilaV7V",vv.id);}}
        localStorage.setItem("oilaV7",JSON.stringify({uid}));setUser(nu);setOila(no_);setAzolar([nu]);setXar([]);setDar([]);setMaq([]);setScr("bosh");ok$(t.fc3);
      }
    }else{
      // BOLA LOGINI: agar email/telefon emas, oddiy login kiritilgan bo'lsa
      const tryLogin=fTel.trim().toLowerCase();
      if(tryLogin&&!tryLogin.includes("@")&&!/^[0-9+ ]+$/.test(tryLogin)){
        // Bu bola logini (raqam ham email ham emas)
        const kidUid=await db.gFresh("kidlogin_"+tryLogin);
        if(kidUid){
          const ku=await db.g("user_"+kidUid);
          if(ku&&ku.rol==="kid"){
            if(await hp(fPw)!==ku.ph)return ok$(lg==="uz"?"Parol noto'g'ri":"Wrong password","err");
            buzz(15);
            // Anonim Firebase Auth (Firestore o'qishi uchun request.auth kerak)
            try{await auth.loginAnon();}catch(e){}
            localStorage.setItem("oilaV7",JSON.stringify({uid:ku.id,kid:true}));
            setUser(ku);await loadFam(ku);setScr("bosh");
            ok$((lg==="uz"?"Xush kelibsiz, ":"Welcome, ")+ku.ism+" 👋");
            return;
          }
        }
        return ok$(lg==="uz"?"Login yoki parol noto'g'ri":"Wrong login or password","err");
      }
      // Telefon yoki email + parol bilan kirish (Firebase Auth)
      let email=fEm.trim().toLowerCase();
      // Telefon kiritilgan bo'lsa - tphone_ orqali emailni topamiz
      if(!email&&fTel.trim()){
        const n9=normTel(fTel);
        const foundEmail=await db.g("tphone_"+n9);
        if(foundEmail)email=foundEmail;
        else return ok$(lg==="uz"?"Bu telefon topilmadi. Email bilan kiring yoki ro'yxatdan o'ting.":"Phone not found","err");
      }
      if(!email||!fPw.trim())return ok$(lg==="uz"?"Telefon/email va parol kiriting":"Enter phone/email and password","err");
      let authUser;
      try{
        authUser=await auth.login(email,fPw);
      }catch(e){
        const msg=(e.code==="auth/wrong-password"||e.code==="auth/invalid-credential")?(lg==="uz"?"Email yoki parol noto'g'ri":"Wrong email or password"):e.code==="auth/user-not-found"?(lg==="uz"?"Foydalanuvchi topilmadi":"User not found"):e.code==="auth/too-many-requests"?(lg==="uz"?"Ko'p urinish. Biroz kuting.":"Too many attempts"):(lg==="uz"?"Kirishda xato: ":"Login error: ")+(e.code||e.message);
        return ok$(msg,"err");
      }
      // Kirgandan keyin user ma'lumotini olamiz (endi request.auth bor)
      let u=await db.g("user_"+authUser.uid);
      if(!u){const oldUid=await db.g("em_"+email);if(oldUid)u=await db.g("user_"+oldUid);}
      if(!u)return ok$(lg==="uz"?"Profil topilmadi":"Profile not found","err");
      localStorage.setItem("oilaV7",JSON.stringify({uid:u.id}));setUser(u);await loadFam(u);setScr("bosh");ok$(t.wc+", "+u.ism+" \ud83d\udc4b");
    }
   }catch(err){
     console.error("AUTH ERROR:",err);
     ok$((lg==="uz"?"Xatolik: ":"Error: ")+(err.code||err.message||"Firebase ulanmadi. Internetni tekshiring."),"err");
   }
  };
  const doPhoto=e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=async ev=>{const p=ev.target.result;const u2={...user,photo:p};await db.s("user_"+user.id,u2);setUser(u2);setAzolar(azolar.map(a=>a.id===user.id?{...a,photo:p}:a));ok$(t.ua);};r.readAsDataURL(file);};
  const rmPhoto=async()=>{const u2={...user,photo:null};await db.s("user_"+user.id,u2);setUser(u2);setAzolar(azolar.map(a=>a.id===user.id?{...a,photo:null}:a));ok$(t.ua);};
  const updName=async()=>{if(!newN.trim())return;const u2={...user,ism:newN.trim()};await db.s("user_"+user.id,u2);setUser(u2);setAzolar(azolar.map(a=>a.id===user.id?{...a,ism:newN.trim()}:a));setEdN(false);ok$(t.ua);};
  const addX=async()=>{
    if(!fS||Number(fS)<=0)return ok$(t.ea,"err");
    // Agar boshqa a'zo uchun bo'lsa - so'rov yuboramiz
    if(xForMember&&xForMember!==user.id){
      if(xMode==="give"){
        // A'ZOGA PUL BERDIM: menga HADYA xarajati (darhol), a'zoga daromad so'rovi
        const item={id:Date.now(),kategoriya:"hadya",summa:Number(fS),izoh:(lg==="uz"?"Hadya: ":"Gift: ")+(azolar.find(a=>a.id===xForMember)?.ism||""),sana:fSn,vaqt:nt(),repeat:false};
        const mk="x_"+user.oilaId+"_"+user.id;
        await db.s(mk,[item,...((await db.g(mk))||[])]);
        setXar(x=>[{...item,uid:user.id},...x]);
        // A'zoga daromad so'rovi
        const req={id:Date.now(),fromUid:user.id,fromIsm:user.ism,toUid:xForMember,tur:"sovga",summa:Number(fS),izoh:(lg==="uz"?user.ism+" dan":"from "+user.ism),sana:fSn,kind:"income"};
        const tReqs=(await db.g("xreq_"+xForMember))||[];
        await db.s("xreq_"+xForMember,[req,...tReqs]);
        const rN={id:Date.now()+Math.random(),type:"daromad",title:lg==="uz"?"Pul oldingiz 💰":"You received money",body:(user.ism||"")+" "+(lg==="uz"?"sizga pul berdi":"gave you money")+": "+fmtN(Number(fS),val,true),sana:new Date().toISOString(),read:false};
        const rC=(await db.g("notif_"+xForMember))||[];
        await db.s("notif_"+xForMember,[rN,...rC].slice(0,100));
        setFS("");setFIz("");setFK("oziq");setFSn(td());setFRp(false);setXForMember("");setXMode("expense");setScr("bosh");
        ok$(lg==="uz"?"Pul berildi! A'zo tasdiqlasa daromadiga qo'shiladi.":"Money sent! Will be added to their income.");
        return;
      }
      const req={id:Date.now(),fromUid:user.id,fromIsm:user.ism,toUid:xForMember,kategoriya:fK,summa:Number(fS),izoh:fIz||KN[lg][KATS.findIndex(k=>k.id===fK)],sana:fSn,kind:"expense"};
      const tReqs=(await db.g("xreq_"+xForMember))||[];
      await db.s("xreq_"+xForMember,[req,...tReqs]);
      const rN={id:Date.now()+Math.random(),type:"xarajat",title:lg==="uz"?"Xarajat so'rovi":"Expense request",body:(user.ism||"")+" "+(lg==="uz"?"sizning nomingizdan xarajat kiritdi":"added an expense for you")+": "+fmtN(Number(fS),val,true),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+xForMember))||[];
      await db.s("notif_"+xForMember,[rN,...rC].slice(0,100));
      setFS("");setFIz("");setFK("oziq");setFSn(td());setFRp(false);setXForMember("");setXMode("expense");setScr("bosh");
      ok$(lg==="uz"?"Xarajat so'rovi yuborildi! A'zo tasdiqlasa qo'shiladi.":"Expense request sent!");
      return;
    }
    const item={id:Date.now(),kategoriya:fK,summa:Number(fS),izoh:fIz||KN[lg][KATS.findIndex(k=>k.id===fK)],sana:fSn,vaqt:nt(),repeat:fRp};
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    const na=[{...item,uid:user.id},...xar];setXar(na);
    const bt=na.filter(x=>x.sana?.startsWith(tm())).reduce((s,x)=>s+Number(x.summa||0),0),bdj=oila?.budjet||2000000;
    if(bt>bdj){ok$(t.be,"err");addNotif("budjet",lg==="uz"?"Budjet oshib ketdi!":"Budget exceeded!",lg==="uz"?"Bu oy xarajatlar budjetdan oshdi":"Expenses exceeded budget");}else if(bt>bdj*.9){ok$(t.bw,"warn");addNotif("budjet",lg==="uz"?"Budjet 90% sarflandi":"90% used",lg==="uz"?"Budjet tugashga yaqin":"Budget almost reached");}
    else{const lim=oila?.katLimits?.[fK];const kt=na.filter(x=>x.sana?.startsWith(tm())&&x.kategoriya===fK).reduce((s,x)=>s+Number(x.summa||0),0);if(lim&&kt>lim)ok$(KN[lg][KATS.findIndex(k=>k.id===fK)]+" "+t.le,"warn");else ok$(t.xa);}
    setFS("");setFIz("");setFK("oziq");setFSn(td());setFRp(false);setXForMember("");setScr("bosh");
  };
  const parseVoice=(text)=>{
    if(!text)return null;
    const low=text.toLowerCase();
    // Summani ajratish: raqam + (ming/million) yoki yakka raqam
    let summa=0;
    // "20 ming", "20ming", "2 million", "500 so'm"
    const mingMatch=low.match(/([0-9]+(?:[.,][0-9]+)?)\s*(ming|tisyacha|тысяч|k)/);
    const milMatch=low.match(/([0-9]+(?:[.,][0-9]+)?)\s*(million|mln|млн|millon)/);
    const plainMatch=low.match(/([0-9]{3,})/);
    if(milMatch){summa=Math.round(parseFloat(milMatch[1].replace(",","."))*1000000);}
    else if(mingMatch){summa=Math.round(parseFloat(mingMatch[1].replace(",","."))*1000);}
    else if(plainMatch){summa=parseInt(plainMatch[1]);}
    // Kategoriyani ajratish - kalit so'zlar
    const katKeys={
      oziq:["ovqat","ovkat","yeg","tushlik","nonushta","kechki","restoran","kafe","kofe","choy","non","sut","gosht","go'sht","meva","sabzavot","bozor","produkt","еда","обед","ужин","кофе","food","oziq","ovqatlanish"],
      transport:["transport","taksi","taxi","yo'l","benzin","yoqilg'i","avtobus","metro","mashina","такси","бензин","транспорт","fuel","gas"],
      kommunal:["kommunal","svet","gaz","suv","elektr","internet","telefon to'lov","комунал","свет","газ","вода","utility"],
      sog:["dori","dorixona","shifokor","kasalxona","apteka","аптека","лекарство","sog'liq","tibbiyot","health","medicine","klinika"],
      kiyim:["kiyim","ko'ylak","poyabzal","kross","одежда","обувь","clothes","kiyinish"],
      kongil:["kino","o'yin","sayohat","dam","konsert","развлечение","entertainment","kongilochar","ko'ngil"],
      talim:["kitob","o'qish","kurs","ta'lim","maktab","universitet","образование","study","education","dars"],
      boshqa:["boshqa","other","другое"]
    };
    let kat="boshqa";
    for(const[k,words]of Object.entries(katKeys)){
      if(words.some(w=>low.includes(w))){kat=k;break;}
    }
    if(summa<=0)return null;
    return {summa,kat,text};
  };
  const startVoice=()=>{
    if(!isPremium){setShowPremModal(true);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setShowVoice(true);setVoiceText("");setVoiceParsed(null);ok$(lg==="uz"?"Brauzer ovozni qo'llamaydi. Qo'lda yozing.":"Voice not supported. Type manually.","warn");return;}
    setShowVoice(true);setVoiceText("");setVoiceParsed(null);setVoiceOn(true);
    try{
      const rec=new SR();
      rec.lang=lg==="uz"?"uz-UZ":lg==="ru"?"ru-RU":"en-US";
      rec.interimResults=true;rec.continuous=false;
      rec.onresult=(e)=>{
        let txt="";
        for(let i=0;i<e.results.length;i++){txt+=e.results[i][0].transcript;}
        setVoiceText(txt);
        const parsed=parseVoice(txt);
        if(parsed)setVoiceParsed(parsed);
      };
      rec.onerror=(e)=>{setVoiceOn(false);if(e.error==="not-allowed"||e.error==="permission-denied"){ok$(lg==="uz"?"Mikrofon ruxsati berilmadi. Qo'lda yozing.":"Mic denied. Type manually.","warn");}};
      rec.onend=()=>{setVoiceOn(false);};
      voiceRecRef.current=rec;
      rec.start();
    }catch(e){setVoiceOn(false);ok$(lg==="uz"?"Xatolik. Qo'lda yozing.":"Error. Type manually.","warn");}
  };
  const stopVoice=()=>{
    if(voiceRecRef.current){try{voiceRecRef.current.stop();}catch(e){}}
    setVoiceOn(false);
  };
  const applyVoice=async()=>{
    const parsed=voiceParsed||parseVoice(voiceText);
    if(!parsed){return ok$(lg==="uz"?"Summa topilmadi. Masalan: 'transportga 20 ming'":"No amount found. E.g. 'transport 20000'","err");}
    const item={id:Date.now(),kategoriya:parsed.kat,summa:parsed.summa,izoh:parsed.text.slice(0,50),sana:td(),vaqt:nt(),repeat:false};
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    const na=[{...item,uid:user.id},...xar];setXar(na);
    setShowVoice(false);setVoiceText("");setVoiceParsed(null);
    ok$(lg==="uz"?"Qo'shildi: "+f(parsed.summa,true)+" - "+KN[lg][KATS.findIndex(k=>k.id===parsed.kat)]:"Added: "+f(parsed.summa,true));
  };
  const quickAdd=async()=>{
    if(!quickItem||!quickSum||Number(quickSum)<=0)return ok$(t.ea,"err");
    const item={id:Date.now(),kategoriya:quickItem.kat,summa:Number(quickSum),izoh:quickItem[lg]||quickItem.uz,sana:td(),vaqt:nt(),repeat:false};
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    const na=[{...item,uid:user.id},...xar];setXar(na);
    const bt=na.filter(x=>x.sana&&x.sana.indexOf(tm())===0).reduce((s,x)=>s+Number(x.summa||0),0),bdj=oila?.budjet||2000000;
    if(bt>bdj){ok$(t.be,"err");addNotif("budjet",lg==="uz"?"Budjet oshib ketdi!":"Budget exceeded!",lg==="uz"?"Bu oy xarajatlar budjetdan oshdi":"Expenses exceeded");}else if(bt>bdj*.9){ok$(t.bw,"warn");}else ok$(t.xa);
    setQuickItem(null);setQuickSum("");
  };
  const addD=async()=>{
    if(!fDS||Number(fDS)<=0)return ok$(t.ea,"err");
    const item={id:Date.now(),tur:fDT,summa:Number(fDS),izoh:fDI||DN[lg][DARS.findIndex(d=>d.id===fDT)],sana:td(),vaqt:nt()};
    const key="d_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    setDar([{...item,uid:user.id},...dar]);setFDS("");setFDI("");setFDT("oylik");setScr("bosh");ok$(t.da);
  };
  const addMq=async()=>{
    if(!mN.trim()||!mS||Number(mS)<=0)return ok$(t.fa,"err");
    if(!isPremium&&maq.length>=3){setShowPremModal(true);return;}
    const u=[...maq,{id:Date.now(),ism:mN.trim(),maqsad:Number(mS),jamg:0,rang:mR}];
    await db.s("maq_"+user.oilaId,u);setMaq(u);setMN("");setMS("");setAddM(false);ok$(t.ma);
  };
  const tupMq=async()=>{
    if(!tupS||Number(tupS)<=0)return;
    const tgtGoal=maq.find(m=>m.id===tupId);const wasComplete=tgtGoal&&(tgtGoal.jamg+Number(tupS))>=tgtGoal.maqsad&&tgtGoal.jamg<tgtGoal.maqsad;const u=maq.map(m=>m.id===tupId?{...m,jamg:Math.min(m.maqsad,m.jamg+Number(tupS))}:m);if(wasComplete){fireConfetti();addNotif("yangilik",lg==="uz"?"Maqsadga yetdingiz! 🎉":"Goal reached! 🎉",(tgtGoal?tgtGoal.ism:"")+" "+(lg==="uz"?"maqsadi bajarildi":"completed"));}
    await db.s("maq_"+user.oilaId,u);setMaq(u);setTupId(null);setTupS("");ok$(t.ua);
  };
  const delMq=async id=>{const u=maq.filter(m=>m.id!==id);await db.s("maq_"+user.oilaId,u);setMaq(u);};
  const saveEditMq=async()=>{
    if(!editMqN.trim()||!editMqS||Number(editMqS)<=0)return ok$(t.fa,"err");
    const u=maq.map(m=>m.id===editMq?{...m,ism:editMqN.trim(),maqsad:Number(editMqS)}:m);
    await db.s("maq_"+user.oilaId,u);setMaq(u);setEditMq(null);setEditMqS("");setEditMqN("");ok$(t.ua);
  };
  const delX=async item=>{
    if(item.uid!==user.id)return ok$(t.od,"warn");
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,(await db.g(key)||[]).filter(x=>x.id!==item.id));
    setXar(xar.filter(x=>!(x.id===item.id&&x.uid===user.id)));
  };
  const saveBj=async()=>{
    const v=Number(fBj);if(!v||v<=0)return ok$(t.ec,"err");
    const u={...oila,budjet:v,katLimits:fKL};await db.s("oila_"+oila.id,u);setOila(u);ok$(t.sa);
  };
  const logout=()=>{try{auth.logout();}catch(e){}localStorage.removeItem("oilaV7");setUser(null);setOila(null);setAzolar([]);setXar([]);setDar([]);setMaq([]);setScr("login");};
  // ===== VAZIFALAR TIZIMI =====
  // Vazifa qo'shish (faqat ota-ona/oila boshi)
  const addVazifa=async()=>{
    if(!vTitle.trim()||!vReward||Number(vReward)<=0||!vAssignee)return ok$(lg==="uz"?"Vazifa nomi, mukofot va bolani tanlang":"Fill all fields","err");
    buzz(12);
    const item={id:Date.now(),title:vTitle.trim(),reward:Number(vReward),emoji:vEmoji,assignedTo:vAssignee,createdBy:user.id,status:"pending",sana:td(),doneSana:"",paidSana:""};
    const upd=[item,...vazifalar];
    await db.s("vazifa_"+user.oilaId,upd);setVazifalar(upd);
    setShowAddVazifa(false);setVTitle("");setVReward("");setVAssignee("");setVEmoji("📚");
    ok$(lg==="uz"?"Vazifa qo'shildi! 🎯":"Task added!");
  };
  // Bola "bajardim" deydi
  const vazifaDone=async(id)=>{
    buzz(15);
    const upd=vazifalar.map(v=>v.id===id?{...v,status:"done",doneSana:td()}:v);
    await db.s("vazifa_"+user.oilaId,upd);setVazifalar(upd);
    ok$(lg==="uz"?"Bajarildi deb belgilandi! Ota-ona tasdiqlaydi.":"Marked done!");
  };
  // Ota-ona tasdiqlaydi -> mukofot bolaning balansiga qo'shiladi
  const vazifaApprove=async(id)=>{
    buzz(20);
    const v=vazifalar.find(x=>x.id===id);if(!v)return;
    const upd=vazifalar.map(x=>x.id===id?{...x,status:"approved",paidSana:td()}:x);
    await db.s("vazifa_"+user.oilaId,upd);setVazifalar(upd);
    // Bola balansiga qo'shamiz
    const kb={...kidBalances};
    kb[v.assignedTo]=(kb[v.assignedTo]||0)+v.reward;
    await db.s("kidbal_"+user.oilaId,kb);setKidBalances(kb);
    // Bolaga bildirishnoma
    try{const kn=(await db.g("notif_"+v.assignedTo))||[];await db.s("notif_"+v.assignedTo,[{id:Date.now(),text:(lg==="uz"?"🏆 Vazifa tasdiqlandi! +":"Task approved! +")+f(v.reward,true),sana:new Date().toISOString(),read:false},...kn]);}catch(e){}
    ok$(lg==="uz"?"Tasdiqlandi! Bola "+f(v.reward,true)+" oldi 🎉":"Approved!");
  };
  // Vazifani rad etish (qayta bajarsin)
  const vazifaReject=async(id)=>{
    buzz(10);
    const upd=vazifalar.map(x=>x.id===id?{...x,status:"pending",doneSana:""}:x);
    await db.s("vazifa_"+user.oilaId,upd);setVazifalar(upd);
    ok$(lg==="uz"?"Qaytarildi. Bola qayta bajaradi.":"Sent back","warn");
  };
  const delVazifa=async(id)=>{
    buzz(10);
    const upd=vazifalar.filter(x=>x.id!==id);
    await db.s("vazifa_"+user.oilaId,upd);setVazifalar(upd);
    ok$(lg==="uz"?"O'chirildi":"Deleted");
  };
  // Bola akkaunti yaratish (ota-ona profil orqali)
  const addKidAccount=async()=>{
    if(!kidName.trim()||!kidLogin.trim()||kidPw.length<4)return ok$(lg==="uz"?"Ism, login va parol (4+) kiriting":"Fill all fields","err");
    buzz(12);
    const loginKey=kidLogin.trim().toLowerCase();
    // Login band emasmi
    if(await db.gFresh("kidlogin_"+loginKey))return ok$(lg==="uz"?"Bu login band. Boshqasini tanlang.":"Login taken","err");
    try{
      const uid="kid"+Date.now();
      const ph=await hp(kidPw);
      const nu={id:uid,ism:kidName.trim(),login:loginKey,ph,oilaId:user.oilaId,rol:"kid",rel:"farzand",photo:null,parentId:user.id};
      await db.s("user_"+uid,nu);
      await db.s("kidlogin_"+loginKey,uid);
      // Oilaga qo'shamiz
      const o2={...oila,azolarIds:[...(oila.azolarIds||[]),uid]};
      await db.s("oila_"+oila.id,o2);setOila(o2);
      setAzolar([...azolar,nu]);
      setShowAddKid(false);setKidName("");setKidLogin("");setKidPw("");
      ok$(lg==="uz"?"Bola akkaunti yaratildi! 👶 Login: "+loginKey:"Kid account created!");
    }catch(e){ok$(lg==="uz"?"Xato: "+(e.code||e.message):"Error","err");}
  };
  const addQarz=async()=>{
    if(!qarzKim.trim()||!qarzSum||Number(qarzSum)<=0)return ok$(t.fa,"err");
    const item={id:Date.now(),uid:user.id,tur:qarzTur,kim:qarzKim.trim(),summa:Number(qarzSum),izoh:qarzIzoh,sana:qarzSana,qaytSana:qarzQaytSana,paid:false,paidSana:""};
    const upd=[item,...qarzlar];
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
    setShowAddQarz(false);setQarzKim("");setQarzSum("");setQarzIzoh("");setQarzSana(td());setQarzQaytSana("");setQarzTur("olgan");
    ok$(t.xa);
  };
  const addQarzAsDaromad=async(q)=>{
    const item={id:Date.now(),tur:"boshqa",summa:q.summa,izoh:(lg==="uz"?"Qarz qaytishi: ":"Debt return: ")+q.kim,sana:td(),vaqt:nt()};
    const key="d_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    setDar(d=>[{...item,uid:user.id},...d]);
    setQarzDonePrompt(null);
    ok$(lg==="uz"?"Daromadlarga qo'shildi! +"+f(q.summa,true):"Added to income!");
  };
  const addQarzAsXarajat=async(q)=>{
    const item={id:Date.now(),kategoriya:"boshqa",summa:q.summa,izoh:(lg==="uz"?"Qarz qaytarish: ":"Debt payment: ")+q.kim,sana:td(),vaqt:nt(),repeat:false};
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    setXar(x=>[{...item,uid:user.id},...x]);
    setQarzDonePrompt(null);
    ok$(lg==="uz"?"Xarajatlarga qo'shildi! -"+f(q.summa,true):"Added to expenses!");
  };
  // ===== TILXAT (RASPISKA) PDF - faqat ikki tomon tasdiqlagan qarzlar uchun =====
  const generateTilxat=(q)=>{
    // Faqat bog'langan va tasdiqlangan qarz
    if(!q.linked||q.linkStatus!=="accepted"){
      ok$(lg==="uz"?"Tilxat faqat ikki tomon tasdiqlagan qarzlar uchun":"Receipt only for mutually confirmed debts","err");
      return;
    }
    try{
      // Tomonlar: qarz beruvchi (kreditor) va oluvchi (qarzdor)
      // tur="olgan": men oldim (men qarzdor), kim=beruvchi
      // tur="bergan": men berdim (men kreditor), kim=oluvchi
      const menQarzdor=q.tur==="olgan";
      const qarzdor=menQarzdor?(user.ism||""):q.kim;
      const kreditor=menQarzdor?q.kim:(user.ism||"");
      const qarzdorTel=menQarzdor?(user.tel||""):q.linkedTel;
      const kreditorTel=menQarzdor?q.linkedTel:(user.tel||"");
      const summaSom=Number(q.summa||0);
      const sanaStr=q.sana||td();
      const qaytStr=q.qaytSana||(lg==="uz"?"kelishuv bo'yicha":"as agreed");

      // Summани so'z bilan (oddiy)
      const summaRaqam=fmtN(summaSom,val,false);
      // Summani so'z bilan (qavs ichida) - faqat o'zbekcha
      const summaSoz=lg==="uz"?sonSoz(summaSom):"";
      const summaText=summaRaqam+(summaSoz?" ("+summaSoz+" so'm)":"");
      const hujjatRaqami="OH-"+String(q.id).slice(-8);
      // QR -> ilovaning tekshiruv havolasi (skanerlaganda hujjat chiroyli ko'rinadi)
      // Ixcham format: uzun bo'lib QR sig'masligi uchun qisqa
      const tilxatJson=JSON.stringify({id:q.id,q:qarzdor,k:kreditor,s:summaSom,d:sanaStr,r:qaytStr,n:hujjatRaqami});
      const verifyUrl=window.location.origin+"/?tilxat="+encodeURIComponent(tilxatJson);
      // QR API uchun URL bir marta kodlanadi
      const verifyQR="https://api.qrserver.com/v1/create-qr-code/?size=150x150&ecc=L&data="+encodeURIComponent(verifyUrl);

      const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        @page{size:A4;margin:2cm}
        body{font-family:'Times New Roman',serif;color:#1a1a1a;line-height:1.8;font-size:14px}
        .head{text-align:center;margin-bottom:30px;border-bottom:2px solid #333;padding-bottom:16px}
        .title{font-size:22px;font-weight:bold;letter-spacing:1px;margin-bottom:6px}
        .sub{font-size:12px;color:#666}
        .body{text-align:justify;margin:24px 0}
        .body p{margin:14px 0}
        .field{font-weight:bold;text-decoration:underline}
        .sum{font-size:16px;font-weight:bold;color:#000;background:#f5f5f5;padding:2px 8px}
        .sign{margin-top:48px;display:flex;justify-content:space-between}
        .sign-box{width:45%;text-align:center}
        .sign-line{border-top:1px solid #333;margin-top:40px;padding-top:6px;font-size:12px}
        .foot{margin-top:40px;font-size:10px;color:#888;text-align:center;border-top:1px solid #ddd;padding-top:12px}
        .stamp{margin-top:20px;padding:12px;border:1.5px dashed #4f46e5;border-radius:8px;background:#4f46e508;font-size:11px;color:#4f46e5;text-align:center}
        .doc-num{text-align:right;font-size:11px;color:#666;margin-bottom:8px}
        .clause{margin:12px 0;text-align:justify}
        .num{display:inline-block;width:22px;font-weight:bold}
        .verify-box{margin-top:24px;display:flex;align-items:center;gap:16px;padding:14px 16px;border:2px solid #4f46e5;border-radius:10px;background:#4f46e506}
        .verify-box img{width:90px;height:90px}
        .legal{margin-top:18px;font-size:11px;color:#444;line-height:1.6;background:#fafafa;border-left:3px solid #4f46e5;padding:10px 14px}
      </style></head><body>
        <div class="doc-num">${lg==="uz"?"Hujjat №":lg==="ru"?"Документ №":"Document №"} ${hujjatRaqami}</div>
        <div class="head">
          <div class="title">${lg==="uz"?"TILXAT":lg==="ru"?"РАСПИСКА":"RECEIPT"}</div>
          <div class="sub">${lg==="uz"?"pul qarzi olinganligi to'g'risida":lg==="ru"?"о получении денежного займа":"of a monetary loan"}</div>
        </div>
        <div class="body">
          <p>${sanaStr}</p>
          <div class="clause"><span class="num">1.</span>${lg==="uz"?"Men":lg==="ru"?"Я":"I"}, <span class="field">${qarzdor}</span>${qarzdorTel?", tel: "+qarzdorTel:""} (${lg==="uz"?"bundan keyin — Qarzdor":lg==="ru"?"далее — Должник":"hereinafter — Debtor"}), ${lg==="uz"?"o'z ixtiyorim bilan, quyidagi shaxsdan":lg==="ru"?"добровольно получил(а) от":"voluntarily received from"} <span class="field">${kreditor}</span>${kreditorTel?", tel: "+kreditorTel:""} (${lg==="uz"?"bundan keyin — Kreditor":lg==="ru"?"далее — Кредитор":"hereinafter — Creditor"}) ${lg==="uz"?"naqd pul mablag'ini qarz sifatida oldim":lg==="ru"?"денежные средства в долг":"a monetary loan"}:</div>
          <p style="text-align:center"><span class="sum">${summaText}</span></p>
          <div class="clause"><span class="num">2.</span>${lg==="uz"?"Yuqoridagi summani":lg==="ru"?"Указанную сумму обязуюсь вернуть до":"I undertake to repay the above amount by"} <span class="field">${qaytStr}</span> ${lg==="uz"?"sanasigacha to'liq qaytarishni zimmamga olaman.":""}</div>
          <div class="clause"><span class="num">3.</span>${lg==="uz"?"Mazkur tilxat ikki tomonning erkin xohish-irodasi asosida tuzildi. Tomonlar hujjat mazmuni va oqibatlarini to'liq anglaydilar.":lg==="ru"?"Расписка составлена по доброй воле обеих сторон.":"Made by free will of both parties."}</div>
          <div class="clause"><span class="num">4.</span>${lg==="uz"?"Nizo kelib chiqqan taqdirda, tomonlar uni muzokara yo'li bilan, kelisha olmagan holda esa O'zbekiston Respublikasi qonunchiligiga muvofiq sud tartibida hal etadilar.":lg==="ru"?"Споры решаются переговорами или в суде.":"Disputes resolved by negotiation or court."}</div>
        </div>
        <div class="sign">
          <div class="sign-box"><div class="sign-line">${lg==="uz"?"Qarzdor":lg==="ru"?"Должник":"Debtor"}<br>${qarzdor}<br>${lg==="uz"?"(imzo)":lg==="ru"?"(подпись)":"(signature)"}</div></div>
          <div class="sign-box"><div class="sign-line">${lg==="uz"?"Kreditor":lg==="ru"?"Кредитор":"Creditor"}<br>${kreditor}<br>${lg==="uz"?"(imzo)":lg==="ru"?"(подпись)":"(signature)"}</div></div>
        </div>
        <div class="verify-box">
          <img src="${verifyQR}" alt="QR"/>
          <div>
            <div style="font-size:13px;font-weight:bold;color:#4f46e5">🔒 ${lg==="uz"?"Elektron tasdiq":lg==="ru"?"Электронное подтверждение":"Electronic confirmation"}</div>
            <div style="font-size:11px;color:#555;margin-top:4px;line-height:1.5">${lg==="uz"?"Ushbu hujjat 'Oila Hisobchi' ilovasida har ikki tomon tomonidan elektron tasdiqlangan. QR kod hujjat haqiqiyligini bildiradi.":lg==="ru"?"Подтверждён обеими сторонами. QR удостоверяет подлинность.":"Confirmed by both parties. QR verifies authenticity."}</div>
            <div style="font-size:10px;color:#888;margin-top:4px">${lg==="uz"?"Hujjat raqami":"Doc"}: ${hujjatRaqami} · ID: ${q.id}</div>
          </div>
        </div>
        <div class="legal">
          <b>${lg==="uz"?"Huquqiy eslatma:":lg==="ru"?"Правовая справка:":"Legal note:"}</b> ${lg==="uz"?"Mazkur tilxat O'zbekiston Respublikasi Fuqarolik kodeksining qarz shartnomasiga oid normalariga muvofiq tuzilgan va tomonlar o'rtasidagi kelishuvni qayd etuvchi yozma dalil hisoblanadi. To'liq yuridik kuchga ega bo'lishi uchun notarial tasdiqlash yoki E-IMZO tavsiya etiladi. Aniq holatlar bo'yicha malakali yuristga murojaat qiling.":lg==="ru"?"Расписка составлена согласно нормам ГК о займе. Для полной силы рекомендуется нотариус или ЭЦП.":"Drawn up per civil-law loan provisions. For full force, notarization or e-signature is recommended."}
        </div>
        <div class="foot">
          ${lg==="uz"?"Oila Hisobchi ilovasi tomonidan yaratilgan":lg==="ru"?"Создано в Oila Hisobchi":"Generated by Oila Hisobchi"} · ${new Date().toLocaleDateString("uz-UZ")}
        </div>
      </body></html>`;

      const w=window.open("","_blank");
      if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),400);}
      else{ok$(lg==="uz"?"Pop-up bloklangan. Ruxsat bering.":"Pop-up blocked","err");}
    }catch(e){console.error(e);ok$(lg==="uz"?"Tilxat yaratishda xato":"Error","err");}
  };
  const markQarzPaid=async(id)=>{
    const q=qarzlar.find(x=>x.id===id);
    // Bog'langan + tasdiqlangan qarz: ikkinchi tomon tasdiqlashi kerak
    if(q&&q.linked&&q.linkStatus==="accepted"&&q.linkedTel){
      const targetUid=await db.g("tel_"+q.linkedTel);
      if(targetUid){
        // O'z qarzimni "qaytarish kutilmoqda" holatiga o'tkazaman
        const upd=qarzlar.map(x=>x.id===id?{...x,payStatus:"pending",payBy:user.id}:x);
        await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
        // Ikkinchi tomonga qaytarish so'rovi yuboraman
        const payReq={id:"pay_"+id,debtId:id,fromUid:user.id,fromIsm:user.ism,fromTel:user.tel||"",toTel:q.linkedTel,summa:q.summa,kim:q.kim,tur:q.tur,sana:td(),type:"payment"};
        const targetReqs=(await db.g("qreq_"+q.linkedTel))||[];
        await db.s("qreq_"+q.linkedTel,[payReq,...targetReqs]);
        // Bildirishnoma
        const rN={id:Date.now()+Math.random(),type:"qarz",title:lg==="uz"?"Qarz qaytarish so'rovi":"Debt return request",body:(user.ism||"")+" "+(lg==="uz"?"qarzni qaytardim deyapti":"says debt is returned")+": "+fmtN(q.summa,val,true),sana:new Date().toISOString(),read:false};
        const rC=(await db.g("notif_"+targetUid))||[];
        await db.s("notif_"+targetUid,[rN,...rC].slice(0,100));
        ok$(lg==="uz"?"Qaytarish so'rovi yuborildi! Tasdiqlanishini kuting.":"Return request sent! Awaiting confirmation.");
        return;
      }
    }
    // Oddiy qarz: darhol qaytarilgan
    const upd=qarzlar.map(x=>x.id===id?{...x,paid:true,paidSana:td()}:x);
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);ok$(t.ua);
    if(q)setQarzDonePrompt(q);
  };
  const acceptPayReq=async(req)=>{
    // Qaytarishni tasdiqlash: o'z qarzimni paid qilaman
    const upd=qarzlar.map(q=>q.id===req.debtId?{...q,paid:true,paidSana:td(),payStatus:"confirmed"}:q);
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
    const doneQ=qarzlar.find(q=>q.id===req.debtId);if(doneQ)setQarzDonePrompt({...doneQ,paid:true});
    // So'rovni o'chiraman
    const newReqs=qarzReqs.filter(r=>r.id!==req.id);
    setQarzReqs(newReqs);await db.s("qreq_"+user.tel,newReqs);
    // Boshlovchining qarzini ham paid qilaman + unga "xarajat/daromad qo'shish" so'rovini saqlayman
    const fromUser=await db.g("user_"+req.fromUid);
    if(fromUser){
      const fq=(await db.g("qarz_"+fromUser.oilaId))||[];
      const fromDebt=fq.find(q=>q.id===req.debtId);
      await db.s("qarz_"+fromUser.oilaId,fq.map(q=>q.id===req.debtId?{...q,paid:true,paidSana:td(),payStatus:"confirmed"}:q));
      const rN={id:Date.now()+Math.random(),type:"qarz",title:lg==="uz"?"Qaytarish tasdiqlandi":"Return confirmed",body:(user.ism||"")+" "+(lg==="uz"?"qarz qaytarilganini tasdiqladi":"confirmed the return"),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+req.fromUid))||[];
      await db.s("notif_"+req.fromUid,[rN,...rC].slice(0,100));
      // Boshlovchi uchun "qo'shish so'rovi" saqlayman (u ilovani ochganда chiqadi)
      if(fromDebt){await db.s("paydone_"+req.fromUid,{tur:fromDebt.tur,summa:fromDebt.summa,kim:fromDebt.kim,id:fromDebt.id});}
    }
    // Tasdiqlovchining o'ziga ham prompt (agar u ham qarz yozган bo'lsa)
    const myDebt=qarzlar.find(q=>q.id===req.debtId);
    if(myDebt)setQarzDonePrompt({...myDebt,paid:true});
    ok$(lg==="uz"?"Qaytarish tasdiqlandi!":"Return confirmed!");
  };
  const rejectPayReq=async(req)=>{
    const newReqs=qarzReqs.filter(r=>r.id!==req.id);
    setQarzReqs(newReqs);await db.s("qreq_"+user.tel,newReqs);
    // Boshlovchining qarzini faol holatga qaytaraman
    const fromUser=await db.g("user_"+req.fromUid);
    if(fromUser){
      const fq=(await db.g("qarz_"+fromUser.oilaId))||[];
      await db.s("qarz_"+fromUser.oilaId,fq.map(q=>q.id===req.debtId?{...q,payStatus:null,payBy:null}:q));
      const rN={id:Date.now()+Math.random(),type:"qarz",title:lg==="uz"?"Qaytarish rad etildi":"Return rejected",body:(user.ism||"")+" "+(lg==="uz"?"qaytarishni rad etdi":"rejected the return"),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+req.fromUid))||[];
      await db.s("notif_"+req.fromUid,[rN,...rC].slice(0,100));
    }
    ok$(lg==="uz"?"Qaytarish rad etildi":"Return rejected","warn");
  };
  const applyPartial=async()=>{
    if(!partialQarz||!partialSum||Number(partialSum)<=0)return ok$(t.ea,"err");
    const pay=Number(partialSum);
    const q=partialQarz;
    if(pay>=q.summa){
      // To'liq qaytarish - normal flow
      setPartialQarz(null);setPartialSum("");
      markQarzPaid(q.id);
      return;
    }
    // Qisman: summani kamaytiramiz, tarixga yozamiz
    const paidSoFar=(q.paidPart||0)+pay;
    const upd=qarzlar.map(x=>x.id===q.id?{...x,summa:x.summa-pay,paidPart:paidSoFar,asl:x.asl||q.summa+(q.paidPart||0)}:x);
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
    setPartialQarz(null);setPartialSum("");
    ok$(lg==="uz"?"Qisman qaytarildi: "+f(pay,true)+". Qoldi: "+f(q.summa-pay,true):"Partial: "+f(pay,true)+" paid");
    // Daromad/xarajatga qo'shish taklifi
    setQarzDonePrompt({...q,summa:pay,_partial:true});
  };
  const isAdmin=normTel(user?.tel)===ADMIN_TEL;
  const loadAdminStats=async()=>{
    setAdminLoad(true);setScr("admin");
    try{
      const all=await db.all();
      const users=all.filter(d=>d.id.startsWith("oilaV7_user_"));
      const oilas=all.filter(d=>d.id.startsWith("oilaV7_oila_"));
      const tels=all.filter(d=>d.id.startsWith("oilaV7_tel9_"));
      // Sanalar bo'yicha
      const now=new Date();const todayStr=now.toISOString().slice(0,10);
      const weekAgo=new Date(now-7*864e5).toISOString().slice(0,10);
      const monthAgo=new Date(now-30*864e5).toISOString().slice(0,10);
      let todayU=0,weekU=0,monthU=0;
      users.forEach(u=>{const v=u.v||{};const uid=v.id||"";const ts=parseInt((uid.match(/\d+/)||[])[0]||"0");if(ts){const ds=new Date(ts).toISOString().slice(0,10);if(ds===todayStr)todayU++;if(ds>=weekAgo)weekU++;if(ds>=monthAgo)monthU++;}});
      // Moliyaviy hajm
      let totX=0,totD=0,xCount=0,dCount=0;
      all.forEach(d=>{
        if(d.id.includes("_x_")&&Array.isArray(d.v)){d.v.forEach(x=>{totX+=Number(x.summa||0);xCount++;});}
        if(d.id.includes("_d_")&&Array.isArray(d.v)){d.v.forEach(x=>{totD+=Number(x.summa||0);dCount++;});}
      });
      // Premium oilalar
      const premOilas=oilas.filter(o=>(o.v||{}).premium).length;
      // Fikr-mulohazalar
      const fbDoc=all.find(d=>d.id==="oilaV7_feedback_all");
      const feedbacks=(fbDoc&&Array.isArray(fbDoc.v))?fbDoc.v:[];
      const avgRating=feedbacks.filter(f=>f.rating>0).length?Math.round(feedbacks.filter(f=>f.rating>0).reduce((s,f)=>s+f.rating,0)/feedbacks.filter(f=>f.rating>0).length*10)/10:0;
      setAdminStats({
        totalUsers:users.length,totalOilas:oilas.length,totalTels:tels.length,
        todayU,weekU,monthU,totX,totD,xCount,dCount,premOilas,
        avgPerOila:oilas.length?Math.round(users.length/oilas.length*10)/10:0,
        docCount:all.length,
        feedbacks:feedbacks.slice(0,50),fbCount:feedbacks.length,avgRating
      });
    }catch(e){console.error(e);ok$("Xato: "+e.message,"err");}
    setAdminLoad(false);
  };
  const toggleReportAccess=async(memberId)=>{
    if(user?.rol!=="bosh"||!oila)return;
    const cur=oila.reportAccess||[];
    const upd=cur.includes(memberId)?cur.filter(x=>x!==memberId):[...cur,memberId];
    const o2={...oila,reportAccess:upd};
    await db.s("oila_"+oila.id,o2);setOila(o2);
    ok$(lg==="uz"?"Ruxsat yangilandi":"Access updated");
  };
  const acceptXReq=async(req)=>{
    const newReqs=xReqs.filter(r=>r.id!==req.id);
    setXReqs(newReqs);await db.s("xreq_"+user.id,newReqs);
    if(req.kind==="income"){
      // PUL OLDIM: daromadga qo'shiladi
      const item={id:req.id,tur:req.tur||"sovga",summa:req.summa,izoh:req.izoh,sana:req.sana,vaqt:nt()};
      const key="d_"+user.oilaId+"_"+user.id;
      await db.s(key,[item,...((await db.g(key))||[])]);
      setDar(d=>[{...item,uid:user.id},...d]);
      const rN={id:Date.now()+Math.random(),type:"daromad",title:lg==="uz"?"Pul qabul qilindi":"Money accepted",body:(user.ism||"")+" "+(lg==="uz"?"pulni qabul qildi":"accepted the money"),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+req.fromUid))||[];
      await db.s("notif_"+req.fromUid,[rN,...rC].slice(0,100));
      ok$(lg==="uz"?"Daromadga qo'shildi!":"Added to income!");
      return;
    }
    // XARAJAT: xarajatga qo'shiladi
    const item={id:req.id,kategoriya:req.kategoriya,summa:req.summa,izoh:req.izoh+" ("+(lg==="uz"?"so'rov: ":"req: ")+req.fromIsm+")",sana:req.sana,vaqt:nt(),repeat:false};
    const key="x_"+user.oilaId+"_"+user.id;
    await db.s(key,[item,...((await db.g(key))||[])]);
    setXar(x=>[{...item,uid:user.id},...x]);
    const rN={id:Date.now()+Math.random(),type:"xarajat",title:lg==="uz"?"Xarajat tasdiqlandi":"Expense confirmed",body:(user.ism||"")+" "+(lg==="uz"?"xarajatni tasdiqladi":"confirmed the expense"),sana:new Date().toISOString(),read:false};
    const rC=(await db.g("notif_"+req.fromUid))||[];
    await db.s("notif_"+req.fromUid,[rN,...rC].slice(0,100));
    ok$(lg==="uz"?"Xarajat qo'shildi!":"Expense added!");
  };
  const rejectXReq=async(req)=>{
    const newReqs=xReqs.filter(r=>r.id!==req.id);
    setXReqs(newReqs);await db.s("xreq_"+user.id,newReqs);
    ok$(lg==="uz"?"Rad etildi":"Rejected","warn");
  };
  const sendQarzReminder=async(q)=>{
    if(!q.linked||!q.linkedTel){
      // Oddiy qarz - Telegram orqali eslatma
      const today=new Date().toISOString().slice(0,10);
      const overdue=q.qaytSana&&q.qaytSana<today;
      const msg=overdue?(lg==="uz"?"Assalomu alaykum! "+f(q.summa,true)+" qarzni qaytarish muddati o'tdi. Iltimos, imkoniyat bo'lsa qaytaring.":"Reminder: "+f(q.summa,true)+" debt is overdue."):(lg==="uz"?"Assalomu alaykum! "+f(q.summa,true)+" qarz haqida eslatma. Qaytarish sanasi: "+(q.qaytSana||"-"):"Reminder about "+f(q.summa,true)+" debt.");
      try{navigator.clipboard.writeText(msg);ok$(lg==="uz"?"Eslatma matni nusxalandi!":"Reminder copied!");}catch(e){ok$(msg);}
      return;
    }
    // Bog'langan qarz - ilova ichida bildirishnoma
    const targetUid=await db.g("tel_"+q.linkedTel);
    if(targetUid){
      const today=new Date().toISOString().slice(0,10);
      const overdue=q.qaytSana&&q.qaytSana<today;
      const rN={id:Date.now()+Math.random(),type:"qarz",title:overdue?(lg==="uz"?"⏰ Qarz muddati o'tdi":"Debt overdue"):(lg==="uz"?"🔔 Qarz eslatmasi":"Debt reminder"),body:(user.ism||"")+" "+(overdue?(lg==="uz"?"qarzni qaytarishni so'ramoqda (muddati o'tgan)":"asks to return overdue debt"):(lg==="uz"?"qarz haqida eslatma yubordi":"sent a debt reminder"))+": "+fmtN(q.summa,val,true),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+targetUid))||[];
      await db.s("notif_"+targetUid,[rN,...rC].slice(0,100));
      ok$(lg==="uz"?"Eslatma yuborildi!":"Reminder sent!");
    }else{
      ok$(lg==="uz"?"Foydalanuvchi topilmadi":"User not found","warn");
    }
  };
  const delQarz=async(id)=>{
    const upd=qarzlar.filter(q=>q.id!==id);
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
  };
  const addNotif=async(type,title,body)=>{
    if(!user)return;
    const n={id:Date.now()+Math.random(),type,title,body,sana:new Date().toISOString(),read:false};
    const key="notif_"+user.id;
    const cur=(await db.g(key))||[];
    const upd=[n,...cur].slice(0,100);
    await db.s(key,upd);setNotifs(upd);
  };
  const markNotifRead=async(id)=>{
    const upd=notifs.map(n=>n.id===id?{...n,read:true}:n);
    setNotifs(upd);await db.s("notif_"+user.id,upd);
  };
  const markAllRead=async()=>{
    const upd=notifs.map(n=>({...n,read:true}));
    setNotifs(upd);await db.s("notif_"+user.id,upd);
  };
  const clearNotifs=async()=>{
    setNotifs([]);await db.s("notif_"+user.id,[]);ok$(lg==="uz"?"Tozalandi":"Cleared");
  };
  const sendQarzRequest=async()=>{
    if(!qarzKim.trim()||!qarzSum||Number(qarzSum)<=0)return ok$(t.fa,"err");
    if(qarzLinked){
      if(!qarzTel.trim())return ok$(lg==="uz"?"Telefon raqamini kiriting":"Enter phone number","err");
      const cleanTel=qarzTel.trim().replace(/[^0-9+]/g,"");
      const targetUid=await db.g("tel_"+cleanTel);
      if(!targetUid){setInviteQarz({tel:cleanTel,kim:qarzKim.trim(),summa:Number(qarzSum)});return;}
      if(targetUid===user.id){return ok$(lg==="uz"?"O'zingizga yubora olmaysiz":"Cannot send to yourself","err");}
      const req={id:Date.now(),fromUid:user.id,fromIsm:user.ism,fromTel:user.tel||"",toTel:cleanTel,tur:qarzTur,summa:Number(qarzSum),izoh:qarzIzoh,sana:qarzSana,qaytSana:qarzQaytSana,status:"pending"};
      const targetReqs=(await db.g("qreq_"+cleanTel))||[];
      await db.s("qreq_"+cleanTel,[req,...targetReqs]);
      const rN={id:Date.now()+Math.random(),type:"qarz",title:lg==="uz"?"Yangi qarz so'rovi":"New debt request",body:(user.ism||"")+" - "+fmtN(Number(qarzSum),val,true),sana:new Date().toISOString(),read:false};
      const rC=(await db.g("notif_"+targetUid))||[];
      await db.s("notif_"+targetUid,[rN,...rC].slice(0,100));
      const myItem={id:req.id,uid:user.id,tur:qarzTur,kim:qarzKim.trim(),summa:Number(qarzSum),izoh:qarzIzoh,sana:qarzSana,qaytSana:qarzQaytSana,paid:false,paidSana:"",linked:true,linkedTel:cleanTel,linkStatus:"pending"};
      const upd=[myItem,...qarzlar];
      await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
      setShowAddQarz(false);setQarzKim("");setQarzSum("");setQarzIzoh("");setQarzSana(td());setQarzQaytSana("");setQarzTur("olgan");setQarzTel("");setQarzLinked(false);
      ok$(lg==="uz"?"Qarz so'rovi yuborildi!":"Debt request sent!");
    }else{await addQarz();}
  };
  const acceptQarzReq=async(req)=>{
    const myTur=req.tur==="bergan"?"olgan":"bergan";
    const item={id:req.id,tur:myTur,kim:req.fromIsm,summa:req.summa,izoh:req.izoh,sana:req.sana,qaytSana:req.qaytSana,paid:false,paidSana:"",linked:true,linkedTel:req.fromTel,linkStatus:"accepted"};
    const upd=[item,...qarzlar];
    await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
    const newReqs=qarzReqs.filter(r=>r.id!==req.id);
    setQarzReqs(newReqs);await db.s("qreq_"+user.tel,newReqs);
    const senderUser=await db.g("user_"+req.fromUid);
    if(senderUser){const sq=(await db.g("qarz_"+senderUser.oilaId))||[];await db.s("qarz_"+senderUser.oilaId,sq.map(q=>q.id===req.id?{...q,linkStatus:"accepted"}:q));}
    ok$(lg==="uz"?"Qarz tasdiqlandi!":"Debt confirmed!");
  };
  const rejectQarzReq=async(req)=>{
    const newReqs=qarzReqs.filter(r=>r.id!==req.id);
    setQarzReqs(newReqs);await db.s("qreq_"+user.tel,newReqs);
    const senderUser=await db.g("user_"+req.fromUid);
    if(senderUser){const sq=(await db.g("qarz_"+senderUser.oilaId))||[];await db.s("qarz_"+senderUser.oilaId,sq.map(q=>q.id===req.id?{...q,linkStatus:"rejected"}:q));}
    ok$(lg==="uz"?"Rad etildi":"Rejected","warn");
  };
  const refreshQarzReqs=async()=>{
    if(user?.tel){setQarzReqs((await db.g("qreq_"+user.tel))||[]);setQarzlar((await db.g("qarz_"+user.oilaId))||[]);setNotifs((await db.g("notif_"+user.id))||[]);ok$(lg==="uz"?"Yangilandi":"Refreshed");}
  };
  const activatePremium=async()=>{
    localStorage.setItem("oilaV7Prem","1");setIsPremium(true);setShowPremModal(false);
    // Oila obyektiga ham premium belgisi (a'zolar limiti uchun)
    if(user?.oilaId&&user?.rol==="bosh"){try{const o=await db.g("oila_"+user.oilaId);if(o){o.premium=true;await db.s("oila_"+user.oilaId,o);setOila(o);}}catch(e){}}
    ok$(lg==="uz"?"Premium faollashtirildi!":"Premium activated!");
  };
  const toggleNotif=async()=>{
    if(!notifEnabled){
      if("Notification" in window){
        const perm=await Notification.requestPermission();
        if(perm==="granted"){setNotifEnabled(true);localStorage.setItem("oilaV7Notif","1");ok$(lg==="uz"?"Bildirishnomalar yoqildi!":"Notifications enabled!");}
        else{ok$(lg==="uz"?"Ruxsat berilmadi.":"Permission denied.","err");}
      }else{ok$(lg==="uz"?"Brauzer qo'llamaydi.":"Not supported.","warn");}
    }else{setNotifEnabled(false);localStorage.setItem("oilaV7Notif","0");ok$(lg==="uz"?"O'chirildi.":"Disabled.");}
  };
  const saveNotifTime=(time)=>{setNotifTime(time);localStorage.setItem("oilaV7NotifT",time);ok$(lg==="uz"?"Vaqt saqlandi: "+time:"Time saved: "+time);};
  const parseCheckQR=(text)=>{
    const res={summa:0,sana:"",raqam:"",raw:text};
    try{
      // O'zbekiston soliq cheki: ofd.soliq.uz/.../?...&s=SUMMA (s odatda TIYIN = so'm*100)
      let m=text.match(/[?&]s=([0-9]+(?:\.[0-9]+)?)/i);
      if(m){
        let v=parseFloat(m[1]);
        // s= butun son va katta bo'lsa - tiyinda (so'mga aylantirish uchun /100)
        if(!m[1].includes(".")&&v>=10000){v=v/100;}
        res.summa=Math.round(v);
      }
      // Sana: c=YYYYMMDD yoki t=YYYYMMDDHHmmss
      m=text.match(/[?&]c=([0-9]{8})/i)||text.match(/[?&]t=([0-9]{8})/i);
      if(m){const d=m[1];res.sana=d.slice(0,4)+"-"+d.slice(4,6)+"-"+d.slice(6,8);}
      // Chek raqami
      m=text.match(/[?&]r=([0-9]+)/i);
      if(m)res.raqam=m[1];
    }catch(e){}
    return res;
  };
  const stopScanner=()=>{
    if(scanRafRef.current){cancelAnimationFrame(scanRafRef.current);scanRafRef.current=null;}
    if(scanStreamRef.current){scanStreamRef.current.getTracks().forEach(tr=>tr.stop());scanStreamRef.current=null;}
    setShowScanner(false);setScanMsg("");
  };
  // ===== AQLLI CSV/EXCEL IMPORT =====
  const parseCSVLine=(line)=>{
    const out=[];let cur="";let q=false;
    for(let i=0;i<line.length;i++){const c=line[i];
      if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}
      else if((c===","||c===";"||c==="\t")&&!q){out.push(cur);cur="";}
      else cur+=c;
    }
    out.push(cur);return out;
  };
  const smartParseNum=(s)=>{
    if(s==null)return NaN;
    let v=String(s).replace(/\s/g,"").replace(/[^0-9.,\-]/g,"");
    // 1.234,56 (yevropa) yoki 1,234.56 (amerika) - oxirgi ajratuvchini nuqta deb olamiz
    const lastComma=v.lastIndexOf(",");const lastDot=v.lastIndexOf(".");
    if(lastComma>lastDot){v=v.replace(/\./g,"").replace(",",".");}
    else{v=v.replace(/,/g,"");}
    return parseFloat(v);
  };
  const handleImportFile=async(file)=>{
    if(!file)return;
    try{
      let text="";
      const name=(file.name||"").toLowerCase();
      if(name.endsWith(".xlsx")||name.endsWith(".xls")){
        ok$(lg==="uz"?"Excel uchun avval CSV saqlang. CSV yuklang.":"Save as CSV first.","warn");return;
      }
      text=await file.text();
      const lines=text.split(/\r?\n/).filter(l=>l.trim());
      if(lines.length<2){ok$(lg==="uz"?"Fayl bo'sh yoki noto'g'ri":"Empty file","err");return;}
      // Sarlavha qatorini topish
      const header=parseCSVLine(lines[0]).map(h=>h.toLowerCase().trim());
      // Ustunlarni aqlli aniqlash
      const findCol=(keys)=>header.findIndex(h=>keys.some(k=>h.includes(k)));
      let dateCol=findCol(["sana","date","дата","tarix","time","vaqt"]);
      let amtCol=findCol(["summa","amount","сумма","miqdor","pul","sum"]);
      let descCol=findCol(["izoh","desc","описание","tavsif","comment","narration","maqsad","operatsiya","operation","payee","kim"]);
      // Agar topilmasa - ustunlarni qiymatdan aniqlash
      const sampleRows=lines.slice(1,Math.min(6,lines.length)).map(parseCSVLine);
      if(amtCol<0){
        for(let c=0;c<header.length;c++){if(sampleRows.every(r=>!isNaN(smartParseNum(r[c]))&&r[c]&&r[c].trim())){amtCol=c;break;}}
      }
      if(dateCol<0){
        for(let c=0;c<header.length;c++){if(sampleRows.some(r=>/\d{1,4}[\.\/\-]\d{1,2}[\.\/\-]\d{1,4}/.test(r[c]||""))){dateCol=c;break;}}
      }
      if(descCol<0){descCol=header.findIndex((h,i)=>i!==dateCol&&i!==amtCol);}
      if(amtCol<0){ok$(lg==="uz"?"Summa ustuni topilmadi":"Amount column not found","err");return;}
      // Qatorlarni o'qish
      const parsed=[];
      for(let i=1;i<lines.length;i++){
        const cells=parseCSVLine(lines[i]);
        const rawAmt=smartParseNum(cells[amtCol]);
        if(isNaN(rawAmt)||rawAmt===0)continue;
        // Sana normalizatsiya
        let sana=td();
        if(dateCol>=0&&cells[dateCol]){
          const m=cells[dateCol].match(/(\d{1,4})[\.\/\-](\d{1,2})[\.\/\-](\d{1,4})/);
          if(m){let y,mo,d;if(m[1].length===4){y=m[1];mo=m[2];d=m[3];}else{d=m[1];mo=m[2];y=m[3];}if(y.length===2)y="20"+y;sana=y+"-"+String(mo).padStart(2,"0")+"-"+String(d).padStart(2,"0");}
        }
        const isIncome=rawAmt>0;
        parsed.push({
          sel:true,
          kind:isIncome?"income":"expense",
          summa:Math.abs(rawAmt),
          sana,
          izoh:(descCol>=0?cells[descCol]:"")||"",
          kategoriya:"boshqa"
        });
      }
      if(parsed.length===0){ok$(lg==="uz"?"O'qiladigan yozuv topilmadi":"No records found","err");return;}
      // Avtomatik kategoriya (kalit so'zlar)
      parsed.forEach(p=>{
        const t2=(p.izoh||"").toLowerCase();
        if(/market|magazin|oziq|food|продукт|savdo/.test(t2))p.kategoriya="oziq";
        else if(/benzin|taxi|yo'l|transport|fuel|такси|metro/.test(t2))p.kategoriya="transport";
        else if(/dorixona|shifo|klinika|health|аптека|med/.test(t2))p.kategoriya="sog";
        else if(/svet|gaz|suv|komunal|utility|комм/.test(t2))p.kategoriya="kommunal";
        else if(/kiyim|cloth|одежда/.test(t2))p.kategoriya="kiyim";
      });
      setImportRows(parsed);setImportStep("review");
    }catch(e){console.error(e);ok$(lg==="uz"?"Fayl o'qishda xato":"File read error","err");}
  };
  const confirmImport=async()=>{
    const sel=importRows.filter(r=>r.sel);
    if(sel.length===0){ok$(lg==="uz"?"Hech narsa tanlanmadi":"Nothing selected","err");return;}
    const newX=[],newD=[];
    sel.forEach((r,i)=>{
      const item={id:Date.now()+i,summa:Number(r.summa),izoh:r.izoh.slice(0,60),sana:r.sana,vaqt:nt(),repeat:false};
      if(r.kind==="income"){newD.push({...item,tur:"boshqa"});}
      else{newX.push({...item,kategoriya:r.kategoriya});}
    });
    if(newX.length){const mk="x_"+user.oilaId+"_"+user.id;const cur=(await db.g(mk))||[];await db.s(mk,[...newX,...cur]);setXar(x=>[...newX.map(n=>({...n,uid:user.id})),...x]);}
    if(newD.length){const dk="d_"+user.oilaId+"_"+user.id;const cur=(await db.g(dk))||[];await db.s(dk,[...newD,...cur]);setDar(d=>[...newD.map(n=>({...n,uid:user.id})),...d]);}
    setShowImport(false);setImportRows([]);setImportStep("upload");
    ok$((lg==="uz"?"Import qilindi: ":"Imported: ")+sel.length+(lg==="uz"?" ta yozuv":" records"));
  };
  const startScanner=async()=>{
    if(!isPremium){setShowPremModal(true);return;}
    setShowScanner(true);setScanMsg(lg==="uz"?"Kamera ochilmoqda...":"Opening camera...");
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      scanStreamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
      setScanMsg(lg==="uz"?"QR kodni ramkaga joylang":"Point QR into frame");
      if("BarcodeDetector" in window){
        const detector=new window.BarcodeDetector({formats:["qr_code"]});
        const scan=async()=>{
          if(!videoRef.current||!scanStreamRef.current)return;
          try{
            const codes=await detector.detect(videoRef.current);
            if(codes&&codes.length>0){
              const parsed=parseCheckQR(codes[0].rawValue);
              if(parsed.summa>0){setFS(String(parsed.summa));if(parsed.sana)setFSn(parsed.sana);if(parsed.raqam)setFIz((lg==="uz"?"Chek #":"Receipt #")+parsed.raqam);stopScanner();ok$(lg==="uz"?"✓ "+f(parsed.summa,true)+" — tekshiring va saqlang":"✓ "+f(parsed.summa,true)+" — verify & save");return;}
              else{setFIz(codes[0].rawValue.slice(0,60));stopScanner();ok$(lg==="uz"?"QR o'qildi, summa topilmadi.":"QR read, no amount.","warn");return;}
            }
          }catch(e){}
          scanRafRef.current=requestAnimationFrame(scan);
        };
        scanRafRef.current=requestAnimationFrame(scan);
      }else{setScanMsg(lg==="uz"?"Brauzer QR skanerini qo'llamaydi.":"QR scanner not supported.");}
    }catch(e){
      const isDenied=(e.name==="NotAllowedError"||(e.message||"").indexOf("denied")>=0||(e.message||"").indexOf("Permission")>=0);
      if(isDenied){setScanMsg(lg==="uz"?"Kamera ruxsati berilmadi. Sozlamalardan ruxsat bering yoki qo'lda kiriting.":"Camera denied. Allow in settings or enter manually.");}
      else{setScanMsg((lg==="uz"?"Kamera ochilmadi. Qo'lda kiriting.":"Camera unavailable.")+" ("+(e.name||"")+")");}
    }
  };
  const downloadFile=(content,filename,mime)=>{
    try{
      const blob=new Blob([content],{type:mime});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
    }catch(e){return false;}
  };
  const exportExcel=()=>{
    if(!isPremium){setShowPremModal(true);return;}
    setExportLoading(true);
    try{
      const month=tm();
      const esc=s=>{const v=String(s==null?"":s);if(v.indexOf('"')>=0||v.indexOf(";")>=0){return '"'+v.split('"').join('""')+'"';}return v;};
      // Tanlangan filtrga mos (Hammasi yoki a'zo); ruxsatsiz a'zo - faqat o'zi
      const exFil=canSeeReport?hisFil:user?.id;
      const exX=exFil==="all"?bX:bX.filter(x=>x.uid===exFil);
      const exD=exFil==="all"?bD:bD.filter(d=>d.uid===exFil);
      const exjX=exX.reduce((s,x)=>s+Number(x.summa||0),0);
      const exjD=exD.reduce((s,d)=>s+Number(d.summa||0),0);
      const rows=[];
      rows.push([lg==="uz"?"OILA HISOBOTI":"FAMILY REPORT",month].join(";"));
      rows.push("");
      rows.push([lg==="uz"?"Jami daromad":"Total income",exjD].join(";"));
      rows.push([lg==="uz"?"Jami xarajat":"Total expense",exjX].join(";"));
      rows.push([lg==="uz"?"Balans":"Balance",exjD-exjX].join(";"));
      rows.push([lg==="uz"?"Budjet":"Budget",bdj].join(";"));
      rows.push("");
      const bx=exX;
      if(bx.length>0){
        rows.push([lg==="uz"?"XARAJATLAR":"EXPENSES"].join(";"));
        rows.push(["#",lg==="uz"?"Sana":"Date",lg==="uz"?"Kategoriya":"Category",lg==="uz"?"Izoh":"Note",lg==="uz"?"Kim":"Who",lg==="uz"?"Summa":"Amount"].map(esc).join(";"));
        bx.forEach((x,i)=>rows.push([i+1,x.sana,KN[lg][KATS.findIndex(k=>k.id===x.kategoriya)]||"",x.izoh||"",gN(x.uid),x.summa].map(esc).join(";")));
        rows.push("");
      }
      const bd=exD;
      if(bd.length>0){
        rows.push([lg==="uz"?"DAROMADLAR":"INCOME"].join(";"));
        rows.push(["#",lg==="uz"?"Sana":"Date",lg==="uz"?"Tur":"Type",lg==="uz"?"Izoh":"Note",lg==="uz"?"Kim":"Who",lg==="uz"?"Summa":"Amount"].map(esc).join(";"));
        bd.forEach((d,i)=>rows.push([i+1,d.sana,DN[lg][DARS.findIndex(dr=>dr.id===d.tur)]||"",d.izoh||"",gN(d.uid),d.summa].map(esc).join(";")));
        rows.push("");
      }
      if(qarzlar.length>0){
        rows.push([lg==="uz"?"QARZLAR":"DEBTS"].join(";"));
        rows.push(["#",lg==="uz"?"Kim":"Person",lg==="uz"?"Tur":"Type",lg==="uz"?"Summa":"Amount",lg==="uz"?"Sana":"Date",lg==="uz"?"Holat":"Status"].map(esc).join(";"));
        qarzlar.forEach((q,i)=>rows.push([i+1,q.kim,q.tur==="bergan"?(lg==="uz"?"Berdim":"Lent"):(lg==="uz"?"Oldim":"Borrowed"),q.summa,q.sana,q.paid?(lg==="uz"?"Qaytarilgan":"Returned"):(lg==="uz"?"Faol":"Active")].map(esc).join(";")));
      }
      const csv="\uFEFF"+rows.join("\n");
      const okk=downloadFile(csv,"OilaHisobot_"+month+".csv","text/csv;charset=utf-8;");
      ok$(okk?(lg==="uz"?"Yuklab olindi! Excel da oching.":"Downloaded!"):(lg==="uz"?"Xatolik":"Error"),okk?"ok":"err");
    }catch(e){ok$((lg==="uz"?"Xatolik: ":"Error: ")+e.message,"err");}
    setExportLoading(false);
  };
  const exportPDF=()=>{
    if(!isPremium){setShowPremModal(true);return;}
    try{
      const month=tm();
      // PDF tanlangan filtrga mos: "Hammasi" yoki tanlangan a'zo. Ruxsatsiz a'zo - faqat o'zi.
      const pdfFil=canSeeReport?hisFil:user?.id;
      const pX=pdfFil==="all"?bX:bX.filter(x=>x.uid===pdfFil);
      const pD=pdfFil==="all"?bD:bD.filter(d=>d.uid===pdfFil);
      const pdfWho=pdfFil==="all"?(lg==="uz"?"Butun oila":lg==="ru"?"Вся семья":"Whole family"):(azolar.find(a=>a.id===pdfFil)?.ism||"");
      const jX2=pX.reduce((s,x)=>s+Number(x.summa||0),0);
      const jD2=pD.reduce((s,d)=>s+Number(d.summa||0),0);
      const katRows=KATS.map((k,i)=>{const tot=pX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0);if(!tot)return"";const pct=jX2>0?Math.round(tot/jX2*100):0;return "<tr><td>"+KN[lg][i]+"</td><td style='text-align:right'>"+tot.toLocaleString()+" so'm</td><td style='text-align:center'>"+pct+"%</td></tr>";}).join("");
      const xRows=pX.slice(0,40).map(x=>"<tr><td>"+x.sana+"</td><td>"+KN[lg][KATS.findIndex(k=>k.id===x.kategoriya)]+"</td><td>"+(x.izoh||"")+"</td><td style='text-align:right'>"+x.summa.toLocaleString()+"</td><td>"+gN(x.uid)+"</td></tr>").join("");
      const qActive=qarzlar.filter(q=>!q.paid&&(pdfFil==="all"?(canSeeReport):(q.uid===pdfFil||(!q.uid&&pdfFil===user?.id))));
      const qRows=qActive.map(q=>"<tr><td>"+q.kim+"</td><td>"+(q.tur==="bergan"?(lg==="uz"?"Berdim":"Lent"):(lg==="uz"?"Oldim":"Borrowed"))+"</td><td style='text-align:right'>"+q.summa.toLocaleString()+"</td><td>"+(q.qaytSana||"-")+"</td></tr>").join("");
      // Har a'zo bo'yicha (faqat ruxsatli/bosh va 2+ a'zo)
      let memberSection="";
      if(canSeeReport&&azolar.length>1&&pdfFil==="all"){
        const memRows=azolar.map(a=>{
          const ax=bX.filter(x=>x.uid===a.id).reduce((s,x)=>s+Number(x.summa||0),0);
          const ad=bD.filter(d=>d.uid===a.id).reduce((s,d)=>s+Number(d.summa||0),0);
          const rel=RELATIONS.find(r=>r.id===a.rel);
          return "<tr><td>"+(a.ism||"")+(a.rol==="bosh"?" \ud83d\udc51":"")+"</td><td>"+(rel?(rel[lg]||rel.uz):"-")+"</td><td style='text-align:right' class='g'>+"+ad.toLocaleString()+"</td><td style='text-align:right' class='r'>-"+ax.toLocaleString()+"</td><td style='text-align:right'>"+(ad-ax).toLocaleString()+"</td></tr>";
        }).join("");
        memberSection="<h2>"+(lg==="uz"?"Oila a'zolari bo'yicha":lg==="ru"?"По участникам":"By members")+"</h2><table><thead><tr><th>"+(lg==="uz"?"A'zo":"Member")+"</th><th>"+(lg==="uz"?"Kim":"Relation")+"</th><th style='text-align:right'>"+(lg==="uz"?"Daromad":"Income")+"</th><th style='text-align:right'>"+(lg==="uz"?"Xarajat":"Expense")+"</th><th style='text-align:right'>"+(lg==="uz"?"Balans":"Balance")+"</th></tr></thead><tbody>"+memRows+"</tbody></table>";
      }
      // Referal QR - kimning hisoboti bo'lsa, shu taklif qiladi
      const refLink=window.location.origin+"/?ref="+(user?.id||"");
      const H="<\u0021DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Hisobot "+month+"</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:24px;color:#1f2937;max-width:760px;margin:0 auto;font-size:13px}h1{color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:10px;font-size:22px}h2{color:#374151;margin-top:26px;font-size:16px}table{width:100%;border-collapse:collapse;margin:10px 0}th{background:#6366f1;color:#fff;padding:9px 12px;text-align:left;font-size:12px}td{padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px}.sum{display:flex;gap:12px;margin:18px 0}.box{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;text-align:center}.box .lbl{font-size:11px;color:#6b7280}.box .val{font-size:18px;font-weight:800;margin-top:5px}.g{color:#10b981}.r{color:#ef4444}.btn{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#6366f1;color:#fff;border:none;padding:14px 32px;border-radius:30px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(99,102,241,.4);z-index:99}.foot{margin-top:34px;padding-top:18px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}.hdr{display:flex;align-items:center;gap:12px;margin-bottom:6px}.logo{width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;flex-shrink:0}.logo span{color:#fff;font-size:24px}.qr{display:flex;align-items:center;gap:14px;justify-content:center;margin-top:20px;padding:14px;background:#f9fafb;border-radius:12px}.qr img{width:80px;height:80px;border-radius:8px}@media print{.btn{display:none}}</style></head><body><div class='hdr'><div class='logo'><span>\ud83d\udcb0</span></div><div><div style='font-size:20px;font-weight:800;color:#6366f1'>Oila Hisobchi</div><div style='font-size:12px;color:#6b7280'>"+(oila&&oila.nomi?oila.nomi:"Oila")+" \u00b7 "+pdfWho+" \u00b7 "+month+"</div></div></div><div style='border-bottom:3px solid #6366f1;margin-bottom:14px'></div><p style='color:#6b7280;font-size:12px'>"+(lg==="uz"?"Yaratildi":"Generated")+": "+new Date().toLocaleString("uz-UZ")+"</p><div class='sum'><div class='box'><div class='lbl'>"+(lg==="uz"?"Daromad":"Income")+"</div><div class='val g'>"+jD2.toLocaleString()+"</div></div><div class='box'><div class='lbl'>"+(lg==="uz"?"Xarajat":"Expense")+"</div><div class='val r'>"+jX2.toLocaleString()+"</div></div><div class='box'><div class='lbl'>"+(lg==="uz"?"Balans":"Balance")+"</div><div class='val "+(jD2-jX2>=0?"g":"r")+"'>"+(jD2-jX2).toLocaleString()+"</div></div></div><h2>"+(lg==="uz"?"Kategoriyalar":"Categories")+"</h2><table><thead><tr><th>"+(lg==="uz"?"Kategoriya":"Category")+"</th><th style='text-align:right'>"+(lg==="uz"?"Summa":"Amount")+"</th><th style='text-align:center'>%</th></tr></thead><tbody>"+(katRows||"<tr><td colspan=3 style='text-align:center;color:#9ca3af'>-</td></tr>")+"</tbody></table><h2>"+(lg==="uz"?"Xarajatlar":"Expenses")+"</h2><table><thead><tr><th>"+(lg==="uz"?"Sana":"Date")+"</th><th>"+(lg==="uz"?"Kategoriya":"Category")+"</th><th>"+(lg==="uz"?"Izoh":"Note")+"</th><th style='text-align:right'>"+(lg==="uz"?"Summa":"Amount")+"</th><th>"+(lg==="uz"?"Kim":"Who")+"</th></tr></thead><tbody>"+(xRows||"<tr><td colspan=5 style='text-align:center;color:#9ca3af'>-</td></tr>")+"</tbody></table>"+(qActive.length>0?"<h2>"+(lg==="uz"?"Faol qarzlar":"Active debts")+"</h2><table><thead><tr><th>"+(lg==="uz"?"Kim":"Person")+"</th><th>"+(lg==="uz"?"Tur":"Type")+"</th><th style='text-align:right'>"+(lg==="uz"?"Summa":"Amount")+"</th><th>"+(lg==="uz"?"Qaytarish":"Return")+"</th></tr></thead><tbody>"+qRows+"</tbody></table>":"")+"<div class='qr'><img src='https://api.qrserver.com/v1/create-qr-code/?size=160x160&data="+encodeURIComponent(refLink)+"' alt='QR'/><div style='text-align:left'><div style='font-size:13px;font-weight:700;color:#374151'>"+(lg==="uz"?(user?.ism||"")+" sizni taklif qiladi":(user?.ism||"")+" invites you")+"</div><div style='font-size:11px;color:#6b7280;margin-top:3px'>"+(lg==="uz"?"QR kodni skanerlab ilovaga qo'shiling":lg==="ru"?"Сканируйте QR чтобы присоединиться":"Scan QR to join the app")+"</div></div></div><div class='foot'>"+(lg==="uz"?"Bu hisobot Oila Hisobchi ilovasi tomonidan yaratilgan":lg==="ru"?"Отчёт создан в приложении Oila Hisobchi":"Generated by Oila Hisobchi app")+" \u00b7 "+month+"</div><button class='btn' onclick='window.print()'>"+(lg==="uz"?"PDF saqlash / Chop etish":"Save PDF / Print")+"</button></body></html>";
      const w=window.open("","_blank");
      if(w&&w.document){w.document.write(H);w.document.close();ok$(lg==="uz"?"PDF tayyor! Pastdagi tugmani bosing.":"PDF ready!");}
      else{const okk=downloadFile(H,"OilaHisobot_"+month+".html","text/html;charset=utf-8;");ok$(okk?(lg==="uz"?"HTML yuklandi! Oching va chop eting.":"HTML downloaded!"):(lg==="uz"?"Xatolik":"Error"),okk?"ok":"err");}
    }catch(e){ok$((lg==="uz"?"Xatolik: ":"Error: ")+e.message,"err");}
  };
  const sendFeedback=async()=>{
    if(!fbText.trim()&&fbRating===0)return ok$(lg==="uz"?"Baho yoki izoh kiriting":"Add rating or text","err");
    setFbSending(true);
    try{
      const fb={id:Date.now(),uid:user?.id||"anon",ism:user?.ism||"",type:fbType,rating:fbRating,text:fbText.trim(),sana:new Date().toISOString()};
      const all=(await db.g("feedback_all"))||[];
      await db.s("feedback_all",[fb,...all].slice(0,500));
      setFbRating(0);setFbText("");setFbType("taklif");
      ok$(lg==="uz"?"Rahmat! Fikringiz yuborildi.":"Thank you!");
    }catch(e){ok$(lg==="uz"?"Xatolik":"Error","err");}
    setFbSending(false);
  };
  const aiAdv=async()=>{
    if(!isPremium){setShowPremModal(true);return;}
    setAdvL(true);setAdv("");setScr("maslahat");
    const mX=xar.filter(x=>x.sana&&x.sana.indexOf(tm())===0);
    const mD=dar.filter(d=>d.sana&&d.sana.indexOf(tm())===0);
    const totX=mX.reduce((s,x)=>s+Number(x.summa||0),0);
    const totD=mD.reduce((s,d)=>s+Number(d.summa||0),0);
    const budget=oila&&oila.budjet?oila.budjet:2000000;
    const bal=totD-totX;
    const dayN=new Date().getDate();
    const tips=[];
    const L=(uz,ru,en)=>lg==="uz"?uz:lg==="ru"?ru:en;
    if(totD>0||totX>0){
      if(bal>=0){tips.push("\u2705 "+L("Bu oy balansingiz ijobiy: +"+f(bal,true)+". Barakali boring!","Баланс положительный: +"+f(bal,true),"Positive balance: +"+f(bal,true)));}
      else{tips.push("\u26a0\ufe0f "+L("Bu oy xarajat daromaddan "+f(-bal,true)+" ko'p. Tejashga e'tibor bering.","Расходы превышают доход на "+f(-bal,true),"Expenses exceed income by "+f(-bal,true)));}
    }
    const bpct=budget>0?Math.round(totX/budget*100):0;
    if(bpct>=100){tips.push("\ud83d\udd34 "+L("Budjet "+bpct+"% ishlatildi! Keyingi oy uchun limitni qayta ko'rib chiqing.","Бюджет израсходован на "+bpct+"%!","Budget used "+bpct+"%!"));}
    else if(bpct>=80){tips.push("\ud83d\udfe1 "+L("Budjetning "+bpct+"% sarflandi. Oy oxirigacha ehtiyot bo'ling.","Израсходовано "+bpct+"%.","Used "+bpct+"%."));}
    else if(bpct>0&&dayN<=15&&bpct<40){tips.push("\ud83d\udc4d "+L("Ajoyib! Oy yarmida faqat "+bpct+"% sarfladingiz.","Отлично! Только "+bpct+"%.","Great! Only "+bpct+"%."));}
    const katTotals=KATS.map((k,i)=>({nom:KN[lg][i],sum:mX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0)})).filter(k=>k.sum>0).sort((a,b)=>b.sum-a.sum);
    if(katTotals.length>0&&totX>0){const top=katTotals[0];const topPct=Math.round(top.sum/totX*100);tips.push("\ud83d\udcca "+L("Eng ko'p xarajat: "+top.nom+" ("+topPct+"%). "+(topPct>50?"Bu juda yuqori — kamaytirish mumkinmi?":"Nazoratda saqlang."),top.nom+" - "+topPct+"%",top.nom+" is "+topPct+"%"));}
    if(totD>0){
      const savePct=bal>0?Math.round(bal/totD*100):0;
      if(savePct>=20){tips.push("\ud83d\udcb0 "+L("Daromadning "+savePct+"% jamg'ardingiz. A'lo natija!","Сэкономлено "+savePct+"%!","Saved "+savePct+"%!"));}
      else if(savePct>0){tips.push("\ud83d\udca1 "+L("Daromadning faqat "+savePct+"% qoldi. 20% jamg'arish tavsiya etiladi.","Сэкономлено "+savePct+"%.","Only "+savePct+"% saved."));}
      else if(bal<0){tips.push("\ud83d\udca1 "+L("Bu oy jamg'arma bo'lmadi. Daromadning 10% ini avval ajrating.","Нет сбережений.","No savings."));}
    }
    if(maq.length>0){
      const ng=maq.filter(m=>!m.paid).map(m=>({...m,pct:Math.round(m.jamg/m.maqsad*100)})).sort((a,b)=>b.pct-a.pct)[0];
      if(ng){if(ng.pct>=80&&ng.pct<100){tips.push("\ud83c\udfaf "+L("'"+ng.ism+"' maqsadi "+ng.pct+"% bajarildi! Yana "+f(ng.maqsad-ng.jamg,true)+" qoldi.","Цель '"+ng.ism+"' на "+ng.pct+"%!","Goal '"+ng.ism+"' at "+ng.pct+"%!"));}else if(ng.pct<30){tips.push("\ud83c\udfaf "+L("'"+ng.ism+"' uchun har oy summa ajrating.","Откладывайте на '"+ng.ism+"'.","Save for '"+ng.ism+"'."));}}
    }else{tips.push("\ud83c\udfaf "+L("Maqsad qo'ying — jamg'arish uchun motivatsiya beradi.","Поставьте цель.","Set a goal."));}
    const aQ=qarzlar.filter(q=>!q.paid);
    const meOwe=aQ.filter(q=>q.tur==="olgan").reduce((s,q)=>s+q.summa,0);
    if(meOwe>0){tips.push("\ud83d\udcb8 "+L("Sizda "+f(meOwe,true)+" qarz bor. Eng eskisidan boshlab to'lang.","Долг: "+f(meOwe,true),"You owe "+f(meOwe,true)));}
    const genTips=[
      L("50/30/20 qoidasini qo'llang: daromadning 50% zarur xarajatlarga (ijara, oziq-ovqat), 30% xohish va o'yin-kulgiga, 20% jamg'armaga yo'naltiring.","Правило 50/30/20: 50% на нужды, 30% на желания, 20% на сбережения.","Use 50/30/20 rule: 50% needs, 30% wants, 20% savings."),
      L("Kichik tejamkorlik — katta baraka. \"Tomchi-tomchi ko'l bo'lur.\" Har kuni 5 ming so'mlik ortiqcha xaridni chetga surib qo'ysangiz, bir yilda salkam 2 million so'm tejaladi.","Малая экономия — большая выгода. Откладывая по 5000 в день, за год сэкономите ~2 млн.","Small savings add up. Saving 5000 daily gives ~2M a year."),
      L("Xarid ro'yxati — eng yaxshi qalqon. Do'kon yoki bozorga kirishdan avval oilaviy xarid ro'yxatini tuzing va faqat undagi mahsulotlarni oling. Bu impulsiv xaridlardan himoya qiladi.","Список покупок — лучшая защита. Составьте список заранее и покупайте только по нему.","A shopping list is your best shield. Make one before shopping and stick to it."),
      L("Rejali ish buzilmas. Oylik daromad kelishi bilan birinchi navbatda kommunal va majburiy to'lovlarni chetga oling. Shunda qolgan pulni bemalol rejalashtirasiz.","Сначала оплатите обязательные платежи, затем планируйте остаток.","Pay mandatory bills first when income arrives, then plan the rest."),
      L("Moliyaviy xavfsizlik yostig'i: oila uchun kamida 3 oylik xarajatga teng zaxira fondi yarating. Daromad olgan zahoti 10% ini zaxiraga o'tkazing.","Создайте резерв на 3 месяца расходов. Откладывайте 10% сразу при получении дохода.","Build a 3-month emergency fund. Move 10% to savings as soon as income arrives.")
    ];
    tips.push("\ud83d\udca1 "+genTips[new Date().getDate()%genTips.length]);
    if(totX===0&&totD===0){setAdv(L("Hali bu oy uchun ma'lumot yo'q. Xarajat va daromad kiriting, keyin shaxsiy tahlil olasiz!","Нет данных. Добавьте расходы и доходы.","No data yet. Add expenses and income."));}
    else{setAdv(L("\ud83d\udcc8 "+tm()+" tahlili\n\n","Анализ "+tm()+"\n\n","Analysis "+tm()+"\n\n")+tips.join("\n\n"));}
    setTimeout(()=>setAdvL(false),400);
  };
  const bX=useMemo(()=>xar.filter(x=>x.sana?.startsWith(tm())),[xar]);
  const bD=useMemo(()=>dar.filter(d=>d.sana?.startsWith(tm())),[dar]);
  const jX=bX.reduce((s,x)=>s+Number(x.summa||0),0);
  const jD=bD.reduce((s,d)=>s+Number(d.summa||0),0);
  // Shaxsiy (faqat o'z) hisob - bosh ekran salomlashuvi uchun
  const myX=bX.filter(x=>x.uid===user?.id).reduce((s,x)=>s+Number(x.summa||0),0);
  const myD=bD.filter(d=>d.uid===user?.id).reduce((s,d)=>s+Number(d.summa||0),0);
  const myBal=myD-myX;
  const bdj=oila?.budjet||2000000;
  const pct=Math.min(100,Math.round((jX/bdj)*100));
  const bRng=pct>=90?th.rd:pct>=70?th.am:th.gr;
  const bal=jD-jX;
  const canSeeReport=user?.rol==="bosh"||(oila?.reportAccess||[]).includes(user?.id);
  const gN=uid=>azolar.find(a=>a.id===uid)?.ism||"?";
  const gP=uid=>azolar.find(a=>a.id===uid)?.photo||null;
  const lineD=useMemo(()=>{const days=[];const now=new Date();for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);days.push({k:d.toLocaleDateString("uz-UZ",{weekday:"short"}),x:Math.round(xar.filter(x=>x.sana===k).reduce((s,x)=>s+Number(x.summa||0),0)/1000),d:Math.round(dar.filter(x=>x.sana===k).reduce((s,x)=>s+Number(x.summa||0),0)/1000)});}return days;},[xar,dar]);
  const barD=useMemo(()=>{const m=[];const now=new Date();for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const k=d.toISOString().slice(0,7);m.push({o:d.toLocaleDateString("uz-UZ",{month:"short"}),v:Math.round(xar.filter(x=>x.sana?.startsWith(k)).reduce((s,x)=>s+Number(x.summa||0),0)/1000)});}return m;},[xar]);
  const pieD=useMemo(()=>KATS.map((k,i)=>({name:KN[lg][i],value:bX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0),color:k.c})).filter(d=>d.value>0),[bX,lg]);
  const srchR=useMemo(()=>{if(!srch.trim())return[];const q=srch.toLowerCase();return[...xar.filter(x=>x.izoh?.toLowerCase().includes(q)),...dar.filter(d=>d.izoh?.toLowerCase().includes(q))].slice(0,20);},[srch,xar,dar]);

  const TxRow=({item})=>{
    const isX=!!item.kategoriya;
    const ki=isX?KATS.findIndex(k=>k.id===item.kategoriya):-1;
    const di=!isX?DARS.findIndex(d=>d.id===item.tur):-1;
    const cl=isX?KATS[ki]?.c||"#64748b":DARS[di]?.c||"#64748b";
    return <div style={{...S.cd,padding:"10px 13px",display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
      <div style={{width:38,height:38,borderRadius:11,background:cl+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        {isX?<KatIco id={item.kategoriya} c={cl} s={20}/>:<DarIco id={item.tur} c={cl} s={20}/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,color:th.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {item.izoh}{item.repeat&&<span style={{marginLeft:5}}>{Ico.repeat(th.ac)}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
          <Av src={gP(item.uid)} name={gN(item.uid)} size={14} ac={th.ac}/>
          <span style={{fontSize:10,color:th.t2}}>{gN(item.uid)} · {item.sana}</span>
        </div>
      </div>
      <span style={{fontWeight:700,color:isX?th.rd:th.gr,fontSize:13,whiteSpace:"nowrap"}}>{isX?"-":"+"}{f(item.summa,true)}</span>
      {isX&&item.uid===user.id&&<button onClick={()=>delX(item)} style={{background:"none",border:"none",cursor:"pointer",flexShrink:0,display:"flex",padding:"2px"}}>{Ico.trash(th.t2)}</button>}
    </div>;
  };
  const SL=({ch})=><div style={S.sec}>{ch}</div>;
  const SC=({label,value,color})=><div style={{...S.cd,textAlign:"center",padding:"12px 8px",margin:0}}><div style={{fontSize:9,color:th.t2,marginBottom:3,fontWeight:600}}>{label}</div><div style={{fontSize:16,fontWeight:800,color}}>{value}</div></div>;

  if(boot)return <div style={{...S.pg,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>{Ico.wallet(th.ac)}</div>;

  // ===== TILXAT TEKSHIRUV SAHIFASI (QR skanerlaganda) =====
  if(verifyTilxat){
    const v=verifyTilxat;
    return <div style={{...S.pg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",background:dark?"#0f172a":"#f8fafc"}}>
      <div className="anim-scaleIn" style={{background:th.sur,borderRadius:24,padding:"30px 24px",maxWidth:420,width:"100%",border:"1px solid "+th.bor,boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div className="anim-bounceIn" style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,margin:"0 auto 14px",boxShadow:"0 12px 36px #10b98155"}}>✓</div>
          <div style={{fontSize:20,fontWeight:800,color:th.t1}}>{lg==="uz"?"Hujjat tasdiqlandi":lg==="ru"?"Документ подтверждён":"Document verified"}</div>
          <div style={{fontSize:12,color:th.gr,fontWeight:600,marginTop:4}}>🔒 {lg==="uz"?"Oila Hisobchi rasmiy tilxati":"Official Oila Hisobchi receipt"}</div>
        </div>
        <div style={{background:th.bg,borderRadius:16,padding:"18px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Hujjat raqami":"Document №"}</span><span style={{fontSize:12,fontWeight:700,color:th.ac,fontFamily:"monospace"}}>{v.n}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Qarzdor":"Debtor"}</span><span style={{fontSize:13,fontWeight:700,color:th.t1}}>{v.q}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Kreditor":"Creditor"}</span><span style={{fontSize:13,fontWeight:700,color:th.t1}}>{v.k}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Summa":"Amount"}</span><span style={{fontSize:15,fontWeight:800,color:th.gr}}>{f(Number(v.s),true)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Berilgan sana":"Date"}</span><span style={{fontSize:13,fontWeight:600,color:th.t1}}>{v.d}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Qaytarish":"Return by"}</span><span style={{fontSize:13,fontWeight:600,color:th.t1}}>{v.r}</span></div>
        </div>
        <div style={{fontSize:11,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18,background:th.ac+"0d",borderRadius:10,padding:"10px 12px"}}>{lg==="uz"?"Bu hujjat 'Oila Hisobchi' ilovasida har ikki tomon tomonidan elektron tasdiqlangan. Ma'lumotlar QR kod orqali tekshirildi.":"Confirmed by both parties in the app. Verified via QR."}</div>
        <button onClick={()=>{setVerifyTilxat(null);try{window.history.replaceState({},"",window.location.pathname);}catch(e){}}} style={{...S.bt(),marginBottom:0}}>{lg==="uz"?"Ilovaga o'tish":lg==="ru"?"Открыть приложение":"Open app"}</button>
      </div>
    </div>;
  }
  if(onbStep>=0&&onbStep<ONB_SLIDES.length){
    const s=ONB_SLIDES[onbStep];
    const finish=()=>{try{localStorage.setItem("oilaV7Onb","1");}catch(e){}setOnbStep(-1);};
    return <div style={{...S.pg,minHeight:"100vh",display:"flex",flexDirection:"column",background:dark?"#0f172a":"#f8fafc"}}>
      <div style={{position:"fixed",top:-100,left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,"+s.color+"22,transparent 70%)",pointerEvents:"none",transition:"background .5s"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",gap:6}}>
          {["uz","ru","en"].map(l=><button key={l} onClick={()=>{setLg(l);localStorage.setItem("oilaV7L",l);}} style={{background:lg===l?th.ac+"18":"transparent",border:"1px solid "+(lg===l?th.ac:th.bor),borderRadius:8,padding:"4px 10px",color:lg===l?th.ac:th.t2,cursor:"pointer",fontSize:12,fontWeight:600}}>{l.toUpperCase()}</button>)}
        </div>
        <button onClick={finish} style={{background:"none",border:"none",color:th.t2,cursor:"pointer",fontSize:14,fontWeight:600}}>{lg==="uz"?"O'tkazib yuborish":lg==="ru"?"\u041f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c":"Skip"}</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 32px",position:"relative",zIndex:2,textAlign:"center"}}>
        <div className="anim-float" style={{width:160,height:160,borderRadius:"50%",background:"linear-gradient(135deg,"+s.color+"33,"+s.color+"0d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:84,marginBottom:40,boxShadow:"0 24px 70px "+s.color+"44",transition:"all .4s",border:"1px solid "+s.color+"22"}} key={"emoji"+onbStep}>{s.emoji}</div>
        <div className="anim-fadeUp" key={"t"+onbStep} style={{fontSize:29,fontWeight:800,color:th.t1,marginBottom:14,letterSpacing:"-0.5px"}}>{lg==="uz"?s.titleUz:lg==="ru"?s.titleRu:s.titleEn}</div>
        <div className="anim-fadeUp" key={"d"+onbStep} style={{fontSize:15,color:th.t2,lineHeight:1.65,maxWidth:320,animationDelay:".1s"}}>{lg==="uz"?s.descUz:lg==="ru"?s.descRu:s.descEn}</div>
      </div>
      <div style={{padding:"24px 32px 44px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:28}}>
          {ONB_SLIDES.map((_,i)=>(<div key={i} style={{width:i===onbStep?28:8,height:8,borderRadius:4,background:i===onbStep?s.color:th.bor,transition:"all .3s"}}/>))}
        </div>
        <button onClick={()=>{if(onbStep<ONB_SLIDES.length-1)setOnbStep(onbStep+1);else finish();}} style={{width:"100%",background:"linear-gradient(135deg,"+s.color+","+s.color+"dd)",border:"none",borderRadius:16,padding:"16px",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 24px "+s.color+"44",transition:"all .3s"}}>{onbStep<ONB_SLIDES.length-1?(lg==="uz"?"Keyingi":lg==="ru"?"\u0414\u0430\u043b\u0435\u0435":"Next"):(lg==="uz"?"Boshlash":lg==="ru"?"\u041d\u0430\u0447\u0430\u0442\u044c":"Get started")}</button>
        {onbStep>0&&<button onClick={()=>setOnbStep(onbStep-1)} style={{width:"100%",background:"none",border:"none",color:th.t2,cursor:"pointer",fontSize:14,fontWeight:600,marginTop:12}}>{lg==="uz"?"Orqaga":lg==="ru"?"\u041d\u0430\u0437\u0430\u0434":"Back"}</button>}
      </div>
    </div>;
  }

  if(scr==="login")return <div style={S.pg}>
    <Tst msg={tst.msg} type={tst.type} th={th}/>
    <div style={{position:"fixed",top:-120,left:"50%",transform:"translateX(-50%)",width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle,"+th.ac+"1a,transparent 70%)",pointerEvents:"none"}}/>
    <div style={{padding:"50px 24px 40px",position:"relative"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:82,height:82,borderRadius:24,background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 14px 36px "+th.ac+"44"}}>{Ico.wallet("#fff")}</div>
        <div style={{fontSize:28,fontWeight:800,letterSpacing:-0.5}}>{lg==="uz"?<><span style={{color:th.ac}}>Oila</span><span style={{color:th.gr}}>Hisobchi</span></>:lg==="ru"?<><span style={{color:th.ac}}>Семейный</span><span style={{color:th.gr}}>Бюджет</span></>:<><span style={{color:th.ac}}>Family</span><span style={{color:th.gr}}>Budget</span></>}</div>
        <div style={{color:th.t2,fontSize:13,marginTop:5}}>{lg==="uz"?"Daromad \u00b7 Xarajat \u00b7 Maqsad \u00b7 Oila":lg==="ru"?"\u0414\u043e\u0445\u043e\u0434 \u00b7 \u0420\u0430\u0441\u0445\u043e\u0434 \u00b7 \u0426\u0435\u043b\u0438 \u00b7 \u0421\u0435\u043c\u044c\u044f":"Income \u00b7 Expense \u00b7 Goals \u00b7 Family"}</div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
        {["uz","ru","en"].map(l=><button key={l} onClick={()=>{setLg(l);localStorage.setItem("oilaV7L",l);}} style={{...S.ch(lg===l),padding:"5px 12px"}}>{l.toUpperCase()}</button>)}
        <button onClick={()=>{setDark(v=>!v);localStorage.setItem("oilaV7D",String(!dark));}} style={{...S.ch(true,th.t2),padding:"5px 12px",display:"flex",alignItems:"center",gap:4}}>{dark?Ico.sun(th.t2):Ico.moon(th.t2)}{dark?(lg==="uz"?"Kunduz":"Light"):(lg==="uz"?"Tungi":"Dark")}</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        <button onClick={()=>switchAuthMode(false)} style={S.tb(!reg)}>{lg==="uz"?"Kirish":lg==="ru"?"\u0412\u043e\u0439\u0442\u0438":"Login"}</button>
        <button onClick={()=>switchAuthMode(true)} style={S.tb(reg)}>{lg==="uz"?"Ro'yxat":lg==="ru"?"\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f":"Register"}</button>
      </div>
      <div style={S.cd}>
        {reg&&<><label style={S.lb}>{lg==="uz"?"Ism familiya":lg==="ru"?"Имя и фамилия":"Full name"}</label><input style={S.ip} value={fIsm} onChange={e=>setFIsm(e.target.value)} placeholder={lg==="uz"?"Ism familiyangiz":lg==="ru"?"Имя Фамилия":"First and last name"}/>
        <label style={S.lb}>{lg==="uz"?"Davlat":lg==="ru"?"Страна":"Country"}</label>
        <div style={{position:"relative",marginBottom:12}}>
          <button onClick={()=>setShowCountryDD(v=>!v)} style={{width:"100%",background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1,fontSize:14}}>
            {(()=>{const sc=COUNTRIES.find(c=>c.code===fCountry)||COUNTRIES[0];return <><span style={{fontSize:20}}>{sc.flag}</span><span style={{flex:1,textAlign:"left",fontWeight:600}}>{sc[lg]||sc.uz}</span><span style={{fontSize:11,color:th.t2}}>{(VALS.find(v=>v.id===sc.val)||{}).b}</span><span style={{transform:showCountryDD?"rotate(180deg)":"none",transition:"transform .2s"}}>{Ico.chevron(th.t2,false)}</span></>;})()}
          </button>
          {showCountryDD&&<div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:th.sur,border:"1.5px solid "+th.bor,borderRadius:12,maxHeight:240,overflowY:"auto",zIndex:30,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
            {COUNTRIES.map(c=>(<button key={c.code} onClick={()=>{setFCountry(c.code);setShowCountryDD(false);}} style={{width:"100%",background:fCountry===c.code?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1}}>
              <span style={{fontSize:18}}>{c.flag}</span><span style={{flex:1,textAlign:"left",fontSize:13,fontWeight:fCountry===c.code?700:500,color:fCountry===c.code?th.ac:th.t1}}>{c[lg]||c.uz}</span><span style={{fontSize:11,color:th.t2}}>{(VALS.find(v=>v.id===c.val)||{}).b}</span>{fCountry===c.code&&Ico.check(th.ac)}
            </button>))}
          </div>}
        </div>
        <label style={S.lb}>{lg==="uz"?"Telefon raqami":lg==="ru"?"Номер телефона":"Phone number"}</label>
        <div style={{display:"flex",gap:8,marginBottom:11}}>
          <div style={{display:"flex",alignItems:"center",gap:5,background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"0 12px",flexShrink:0}}>
            <span style={{fontSize:18}}>{(COUNTRIES.find(c=>c.code===fCountry)||COUNTRIES[0]).flag}</span>
            <span style={{fontSize:14,fontWeight:700,color:th.t1}}>{(COUNTRIES.find(c=>c.code===fCountry)||COUNTRIES[0]).dial}</span>
          </div>
          <input style={{...S.ip,marginBottom:0,flex:1}} type="tel" value={fTel} onChange={e=>setFTel(e.target.value.replace(/[^0-9 ]/g,""))} placeholder="90 123 45 67"/>
        </div>
        {fRefCode&&<div style={{background:th.gr+"11",border:"1px solid "+th.gr+"33",borderRadius:11,padding:"10px 13px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>🎁</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:th.gr}}>{lg==="uz"?"Taklif havolasi orqali":lg==="ru"?"По реферальной ссылке":"Via referral link"}</div><div style={{fontSize:10,color:th.t2}}>{lg==="uz"?"Do'stingiz sizni taklif qildi":"Your friend invited you"}</div></div></div>}</>}
        {!reg&&<><label style={S.lb}>{lg==="uz"?"Telefon raqami":lg==="ru"?"Номер телефона":"Phone number"}</label>
        <div style={{display:"flex",gap:8,marginBottom:11}}>
          <div style={{display:"flex",alignItems:"center",gap:4,background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"0 10px",flexShrink:0,width:96}}>
            <span style={{fontSize:18}}>{(COUNTRIES.find(c=>c.dial===fDial)||{flag:"🌐"}).flag}</span>
            <input style={{background:"none",border:"none",outline:"none",color:th.t1,fontSize:14,fontWeight:700,width:52}} type="tel" value={fDial} onChange={e=>{let v=e.target.value.replace(/[^0-9+]/g,"");if(!v.startsWith("+"))v="+"+v;setFDial(v);const c=COUNTRIES.find(x=>x.dial===v);if(c)setFCountry(c.code);}} placeholder="+998"/>
          </div>
          <input style={{...S.ip,marginBottom:0,flex:1}} type="tel" value={fTel} onChange={e=>setFTel(e.target.value.replace(/[^0-9 ]/g,""))} placeholder="90 123 45 67"/>
        </div></>}
        {reg&&<><label style={S.lb}>{lg==="uz"?"Email (parolni tiklash uchun)":lg==="ru"?"Email (для сброса пароля)":"Email (for password reset)"}</label>
        <input style={S.ip} type="email" value={fEm} onChange={e=>setFEm(e.target.value)} placeholder="email@example.com"/></>}
        <label style={S.lb}>{lg==="uz"?"Parol":"Password"}</label>
        <div style={{position:"relative",marginBottom:reg?14:4}}>
          <input style={{...S.ip,marginBottom:0,paddingRight:reg?108:44}} type={showPw?"text":"password"} value={fPw} onChange={e=>setFPw(e.target.value)} placeholder={reg?(lg==="uz"?"Kamida 6 belgi":"Min 6 chars"):(lg==="uz"?"Parolingiz":"Password")}/>
          <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:reg?64:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,padding:4}} title={showPw?"Yashirish":"Ko'rsatish"}>{showPw?"🙈":"👁"}</button>
          {reg&&<button onClick={genPassword} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:th.ac+"18",border:"1px solid "+th.ac+"44",borderRadius:8,cursor:"pointer",fontSize:11,padding:"5px 9px",color:th.ac,fontWeight:700}} title={lg==="uz"?"Parol yaratish":"Generate"}>🎲</button>}
        </div>
        {reg&&<>
          <div style={{display:"flex",gap:8,marginBottom:13}}>
            <button onClick={()=>setJoin(false)} style={S.tb(!join)}>{lg==="uz"?"Yangi oila":"New family"}</button>
            <button onClick={()=>setJoin(true)} style={S.tb(join)}>{lg==="uz"?"Qo'shilish":"Join"}</button>
          </div>
          {!join?<><label style={S.lb}>{lg==="uz"?"Oila nomi":"Family name"}</label><input style={S.ip} value={fON} onChange={e=>setFON(e.target.value)} placeholder={lg==="uz"?"Karimov oilasi":"Family name"}/></>
          :<><label style={S.lb}>{lg==="uz"?"Oila kodi":"Family code"}</label><input style={S.ip} value={fKd} onChange={e=>setFKd(e.target.value)} placeholder={lg==="uz"?"Bosh a'zodan oling":"Get from head member"}/><div style={{background:th.ac+"11",borderRadius:11,padding:11,marginBottom:11,fontSize:12,color:th.t2}}>{lg==="uz"?"Kodni Profil > Shaxsiy ma'lumotlar bo'limida toping":"Find code in Profile > Personal info"}</div>
          <label style={S.lb}>{lg==="uz"?"Oila boshiga kim bo'lasiz?":lg==="ru"?"Кем вы приходитесь главе?":"Your relation to head"}</label>
          <div style={{position:"relative",marginBottom:11}}>
            <button onClick={()=>setShowRelDD(v=>!v)} style={{width:"100%",background:th.surH,border:"1.5px solid "+th.bor,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1,fontSize:14}}>
              {(()=>{const sr=RELATIONS.find(r=>r.id===fRel);return sr?<><span style={{fontSize:20}}>{sr.emoji}</span><span style={{flex:1,textAlign:"left",fontWeight:600}}>{sr[lg]||sr.uz}</span></>:<span style={{flex:1,textAlign:"left",color:th.t2}}>{lg==="uz"?"Tanlang...":lg==="ru"?"Выберите...":"Select..."}</span>;})()}
              <span style={{transform:showRelDD?"rotate(180deg)":"none",transition:"transform .2s"}}>{Ico.chevron(th.t2,false)}</span>
            </button>
            {showRelDD&&<div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:th.sur,border:"1.5px solid "+th.bor,borderRadius:12,maxHeight:240,overflowY:"auto",zIndex:30,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
              {RELATIONS.map(r=>(<button key={r.id} onClick={()=>{setFRel(r.id);setShowRelDD(false);}} style={{width:"100%",background:fRel===r.id?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:th.t1}}>
                <span style={{fontSize:18}}>{r.emoji}</span><span style={{flex:1,textAlign:"left",fontSize:13,fontWeight:fRel===r.id?700:500,color:fRel===r.id?th.ac:th.t1}}>{r[lg]||r.uz}</span>{fRel===r.id&&Ico.check(th.ac)}
              </button>))}
            </div>}
          </div></>}
        </>}
        <button onClick={doAuth} style={S.bt()}>{reg?(lg==="uz"?"Ro'yxatdan o'tish":"Register"):(lg==="uz"?"Kirish":"Login")}</button>
        {!reg&&<button onClick={handleResetPw} style={{background:"none",border:"none",color:th.ac,cursor:"pointer",fontSize:13,fontWeight:600,marginTop:14,width:"100%",textAlign:"center",padding:"6px"}}>{lg==="uz"?"Parolni unutdingizmi?":lg==="ru"?"Забыли пароль?":"Forgot password?"}</button>}
      </div>
    </div>
    {showResetScreen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowResetScreen(false)}>
      <div style={{background:th.bg,borderRadius:20,maxWidth:400,width:"100%",padding:"26px 22px"}} onClick={e=>e.stopPropagation()}>
        {!resetSent?<>
          <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>🔑</div>
          <div style={{fontSize:18,fontWeight:800,color:th.t1,textAlign:"center",marginBottom:8}}>{lg==="uz"?"Parolni tiklash":lg==="ru"?"Сброс пароля":"Reset password"}</div>
          <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{lg==="uz"?"Ro'yxatdan o'tgan emailingizni kiriting. Tiklash havolasini yuboramiz.":"Enter your registered email."}</div>
          <label style={S.lb}>Email</label>
          <input style={S.ip} type="email" value={resetInput} onChange={e=>setResetInput(e.target.value)} placeholder="email@example.com" autoFocus/>
          <button onClick={sendResetEmail} style={{...S.bt(),marginTop:6,marginBottom:10}}>{lg==="uz"?"Tiklash xatini yuborish":lg==="ru"?"Отправить":"Send reset link"}</button>
          <button onClick={()=>setShowResetScreen(false)} style={{width:"100%",background:"transparent",border:"none",color:th.t2,cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px"}}>{lg==="uz"?"Bekor qilish":"Cancel"}</button>
        </>:<>
          <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>📧</div>
          <div style={{fontSize:18,fontWeight:800,color:th.gr,textAlign:"center",marginBottom:8}}>{lg==="uz"?"Xat yuborildi!":"Email sent!"}</div>
          <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.7,marginBottom:8}}>{lg==="uz"?"Parolni tiklash havolasi yuborildi:":"Reset link sent to:"}</div>
          <div style={{fontSize:14,fontWeight:700,color:th.ac,textAlign:"center",background:th.ac+"11",borderRadius:10,padding:"10px",marginBottom:14,wordBreak:"break-all"}}>{resetInput}</div>
          <div style={{fontSize:12,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{lg==="uz"?"📌 Pochtangizni oching va havolani bosing. Ko'rinmasa, Spam papkasini tekshiring.":"Check inbox and Spam."}</div>
          <button onClick={()=>setShowResetScreen(false)} style={{...S.bt(),marginBottom:0}}>{lg==="uz"?"Tushunarli":"Got it"}</button>
        </>}
      </div>
    </div>}
  </div>;

  const isKid=user?.rol==="kid";
  const navItems=isKid
    ?[{id:"bosh",lb:t.home},{id:"vazifa",lb:lg==="uz"?"Vazifa":lg==="ru"?"Задания":"Tasks"},{id:"maqsad",lb:t.goal}]
    :[{id:"bosh",lb:t.home},{id:"vazifa",lb:lg==="uz"?"Vazifa":lg==="ru"?"Задания":"Tasks"},{id:"qoshish",pr:true},{id:"maqsad",lb:t.goal},{id:"hisobot",lb:t.rep}];

  return <div style={S.pg}>
    <Tst msg={tst.msg} type={tst.type} th={th}/>
    <input ref={fRef} type="file" accept="image/*" style={{display:"none"}} onChange={doPhoto}/>
    {/* VAZIFA QO'SHISH MODAL */}
    {showAddVazifa&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowAddVazifa(false)}>
      <div className="anim-fadeUp" style={{background:th.bg,borderRadius:"24px 24px 0 0",maxWidth:480,width:"100%",padding:"24px 20px 32px",maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,borderRadius:2,background:th.bor,margin:"0 auto 18px"}}/>
        <div style={{fontSize:18,fontWeight:800,color:th.t1,marginBottom:18,textAlign:"center"}}>🎯 {lg==="uz"?"Yangi vazifa":lg==="ru"?"Новое задание":"New task"}</div>
        <label style={S.lb}>{lg==="uz"?"Vazifa nomi":lg==="ru"?"Название":"Task name"}</label>
        <input style={S.ip} value={vTitle} onChange={e=>setVTitle(e.target.value)} placeholder={lg==="uz"?"Masalan: Xonani yig'ishtirish":"e.g. Clean room"}/>
        <label style={S.lb}>{lg==="uz"?"Belgi (emoji)":"Emoji"}</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          {["📚","🧹","🛏️","🍽️","🦷","🏃","🕌","🎨","🐕","💧","🌱","📝"].map(em=>(
            <button key={em} onClick={()=>{buzz(6);setVEmoji(em);}} style={{width:44,height:44,borderRadius:12,border:"2px solid "+(vEmoji===em?th.ac:th.bor),background:vEmoji===em?th.ac+"18":th.sur,fontSize:22,cursor:"pointer"}}>{em}</button>
          ))}
        </div>
        <label style={S.lb}>{lg==="uz"?"Mukofot (so'm)":lg==="ru"?"Награда":"Reward"}</label>
        <MoneyInput value={vReward} onChange={setVReward} placeholder="20 000" th={th} style={S.ip}/>
        <label style={S.lb}>{lg==="uz"?"Kimga (farzand)":lg==="ru"?"Кому":"Assign to"}</label>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
          {azolar.filter(a=>a.rol==="kid"||a.id!==user.id).length===0?<div style={{fontSize:12,color:th.t2,textAlign:"center",padding:"12px",background:th.sur,borderRadius:12}}>{lg==="uz"?"Avval profil orqali bola akkaunti yarating":"Create a kid account first via Profile"}</div>:azolar.filter(a=>a.id!==user.id).map(a=>(
            <button key={a.id} onClick={()=>{buzz(6);setVAssignee(a.id);}} style={{display:"flex",alignItems:"center",gap:10,background:vAssignee===a.id?th.ac+"18":th.sur,border:"2px solid "+(vAssignee===a.id?th.ac:th.bor),borderRadius:13,padding:"11px 14px",cursor:"pointer"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:th.ac+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{a.rol==="kid"?"👶":"👤"}</div>
              <span style={{fontSize:14,fontWeight:600,color:th.t1}}>{a.ism}</span>
              {a.rol==="kid"&&<span style={{fontSize:9,background:th.gr+"22",color:th.gr,borderRadius:6,padding:"2px 7px",fontWeight:700,marginLeft:"auto"}}>KIDS</span>}
            </button>
          ))}
        </div>
        <button onClick={addVazifa} style={{...S.bt(),marginBottom:0}}>{lg==="uz"?"Vazifa berish":lg==="ru"?"Создать":"Create task"}</button>
      </div>
    </div>}
    {/* BOLA AKKAUNTI QO'SHISH MODAL */}
    {showAddKid&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowAddKid(false)}>
      <div className="anim-fadeUp" style={{background:th.bg,borderRadius:"24px 24px 0 0",maxWidth:480,width:"100%",padding:"24px 20px 32px"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,borderRadius:2,background:th.bor,margin:"0 auto 18px"}}/>
        <div style={{fontSize:42,textAlign:"center",marginBottom:8}}>👶</div>
        <div style={{fontSize:18,fontWeight:800,color:th.t1,marginBottom:6,textAlign:"center"}}>{lg==="uz"?"Bola akkaunti yaratish":lg==="ru"?"Создать детский аккаунт":"Create kid account"}</div>
        <div style={{fontSize:12,color:th.t2,textAlign:"center",marginBottom:18,lineHeight:1.5}}>{lg==="uz"?"Farzandingiz uchun login va parol yarating. U shu login bilan kiradi.":"Create a login for your child."}</div>
        <label style={S.lb}>{lg==="uz"?"Bola ismi":"Child's name"}</label>
        <input style={S.ip} value={kidName} onChange={e=>setKidName(e.target.value)} placeholder={lg==="uz"?"Jahongir":"Name"}/>
        <label style={S.lb}>{lg==="uz"?"Login (faqat harf/raqam)":"Login"}</label>
        <input style={S.ip} value={kidLogin} onChange={e=>setKidLogin(e.target.value.replace(/[^a-zA-Z0-9_]/g,"").toLowerCase())} placeholder="jahongir2015"/>
        <label style={S.lb}>{lg==="uz"?"Parol":"Password"}</label>
        <input style={S.ip} type="text" value={kidPw} onChange={e=>setKidPw(e.target.value)} placeholder={lg==="uz"?"Kamida 4 belgi":"Min 4 chars"}/>
        <button onClick={addKidAccount} style={{...S.bt(),marginTop:6,marginBottom:0}}>{lg==="uz"?"Akkaunt yaratish":"Create account"}</button>
      </div>
    </div>}
    {showResetScreen&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowResetScreen(false)}>
      <div style={{background:th.bg,borderRadius:20,maxWidth:400,width:"100%",padding:"26px 22px"}} onClick={e=>e.stopPropagation()}>
        {!resetSent?<>
          <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>🔑</div>
          <div style={{fontSize:18,fontWeight:800,color:th.t1,textAlign:"center",marginBottom:8}}>{lg==="uz"?"Parolni tiklash":lg==="ru"?"Сброс пароля":"Reset password"}</div>
          <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{lg==="uz"?"Ro'yxatdan o'tgan emailingizni kiriting. Tiklash havolasini yuboramiz.":"Enter your registered email."}</div>
          <label style={S.lb}>Email</label>
          <input style={S.ip} type="email" value={resetInput} onChange={e=>setResetInput(e.target.value)} placeholder="email@example.com" autoFocus/>
          <button onClick={sendResetEmail} style={{...S.bt(),marginTop:6,marginBottom:10}}>{lg==="uz"?"Tiklash xatini yuborish":lg==="ru"?"Отправить":"Send reset link"}</button>
          <button onClick={()=>setShowResetScreen(false)} style={{width:"100%",background:"transparent",border:"none",color:th.t2,cursor:"pointer",fontSize:13,fontWeight:600,padding:"8px"}}>{lg==="uz"?"Bekor qilish":"Cancel"}</button>
        </>:<>
          <div style={{fontSize:44,textAlign:"center",marginBottom:14}}>📧</div>
          <div style={{fontSize:18,fontWeight:800,color:th.gr,textAlign:"center",marginBottom:8}}>{lg==="uz"?"Xat yuborildi!":"Email sent!"}</div>
          <div style={{fontSize:13,color:th.t2,textAlign:"center",lineHeight:1.7,marginBottom:8}}>{lg==="uz"?"Parolni tiklash havolasi yuborildi:":"Reset link sent to:"}</div>
          <div style={{fontSize:14,fontWeight:700,color:th.ac,textAlign:"center",background:th.ac+"11",borderRadius:10,padding:"10px",marginBottom:14,wordBreak:"break-all"}}>{resetInput}</div>
          <div style={{fontSize:12,color:th.t2,textAlign:"center",lineHeight:1.6,marginBottom:18}}>{lg==="uz"?"📌 Pochtangizni oching va havolani bosing. Ko'rinmasa, Spam papkasini tekshiring.":"Check inbox and Spam."}</div>
          <button onClick={()=>setShowResetScreen(false)} style={{...S.bt(),marginBottom:0}}>{lg==="uz"?"Tushunarli":"Got it"}</button>
        </>}
      </div>
    </div>}

    {inviteQarz&&(()=>{
      const iq=inviteQarz;
      const link=(window.location.origin+"/?ref=")+(user?.id||"");
      const msg=(lg==="uz"?"Salom! Men sizga Oila Hisobchi ilovasida qarz yozmoqchiman. Ilovani o'rnating, qarzlarni birga kuzatamiz: ":"Hi! I want to record a debt with you on Oila Hisobchi app. Install it: ")+link;
      const saveSimple=async()=>{
        const item={id:Date.now(),uid:user.id,tur:qarzTur,kim:qarzKim.trim(),summa:Number(qarzSum),izoh:qarzIzoh,sana:qarzSana,qaytSana:qarzQaytSana,paid:false,paidSana:""};
        const upd=[item,...qarzlar];await db.s("qarz_"+user.oilaId,upd);setQarzlar(upd);
        setInviteQarz(null);setShowAddQarz(false);setQarzKim("");setQarzSum("");setQarzIzoh("");setQarzSana(td());setQarzQaytSana("");setQarzTur("olgan");setQarzTel("");setQarzLinked(false);
        ok$(t.xa);
      };
      return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setInviteQarz(null)}>
        <div style={{background:th.sur,borderRadius:24,padding:"26px 24px",width:"100%",maxWidth:360}} onClick={e=>e.stopPropagation()}>
          <div style={{textAlign:"center",marginBottom:18}}>
            <div style={{width:60,height:60,borderRadius:17,background:th.am+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 12px"}}>📲</div>
            <div style={{fontSize:17,fontWeight:800,color:th.t1,marginBottom:6}}>{lg==="uz"?"Bu raqam ilovada yo'q":lg==="ru"?"Номер не в приложении":"Number not in app"}</div>
            <div style={{fontSize:13,color:th.t2,lineHeight:1.5}}>{lg==="uz"?iq.tel+" raqami Oila Hisobchidan foydalanmaydi. Taklif yuborsangiz, u qo'shilgach qarz tasdiqlanadi.":"This number doesn't use the app yet. Invite them to confirm the debt together."}</div>
          </div>
          <button onClick={()=>{const url="https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent(msg);window.open(url,"_blank");}} style={{width:"100%",background:"#2196F3",border:"none",borderRadius:14,padding:"13px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:9,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {lg==="uz"?"Telegram orqali taklif yuborish":"Invite via Telegram"}
          </button>
          <button onClick={()=>{if(navigator.share){navigator.share({text:msg,url:link}).catch(()=>{});}else{try{navigator.clipboard.writeText(msg);ok$(lg==="uz"?"Nusxalandi!":"Copied!");}catch(e){}}}} style={{width:"100%",background:th.surH,border:"1px solid "+th.bor,borderRadius:14,padding:"13px",color:th.t1,cursor:"pointer",fontWeight:700,fontSize:14,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="4" cy="9" r="2" stroke={th.t1} strokeWidth="1.4"/><circle cx="14" cy="4" r="2" stroke={th.t1} strokeWidth="1.4"/><circle cx="14" cy="14" r="2" stroke={th.t1} strokeWidth="1.4"/><path d="M6 8l6-3M6 10l6 3" stroke={th.t1} strokeWidth="1.4"/></svg>
            {lg==="uz"?"Boshqa ilova orqali ulashish":"Share via other app"}
          </button>
          <div style={{height:1,background:th.bor,marginBottom:14}}/>
          <button onClick={saveSimple} style={{width:"100%",background:"transparent",border:"1.5px solid "+th.bor,borderRadius:14,padding:"13px",color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{lg==="uz"?"Oddiy qarz sifatida saqlash":lg==="ru"?"Сохранить как обычный долг":"Save as simple debt"}</button>
        </div>
      </div>;
    })()}
    {partialQarz&&(()=>{
      const q=partialQarz;const isLent=q.tur==="bergan";const dc=isLent?th.gr:th.rd;
      const pay=Number(partialSum)||0;const remain=q.summa-pay;
      return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>{setPartialQarz(null);setPartialSum("");}}>
        <div style={{background:th.sur,borderRadius:24,padding:"26px 24px",width:"100%",maxWidth:360}} onClick={e=>e.stopPropagation()}>
          <div style={{textAlign:"center",marginBottom:18}}>
            <div style={{width:60,height:60,borderRadius:17,background:dc+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 12px"}}>{isLent?"💰":"💸"}</div>
            <div style={{fontSize:17,fontWeight:800,color:th.t1,marginBottom:4}}>{lg==="uz"?"Qisman qaytarish":lg==="ru"?"Частичный возврат":"Partial payment"}</div>
            <div style={{fontSize:13,color:th.t2}}>{q.kim} · {lg==="uz"?"Jami":"Total"}: {f(q.summa,true)}</div>
          </div>
          <label style={S.lb}>{lg==="uz"?"Qaytarilgan summa":lg==="ru"?"Возвращённая сумма":"Returned amount"}</label>
          <MoneyInput autoFocus style={{...S.ip,fontSize:22,fontWeight:800,textAlign:"center"}} value={partialSum} onChange={setPartialSum} placeholder="0"/>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {[25,50,75].map(pct=>(<button key={pct} onClick={()=>setPartialSum(String(Math.round(q.summa*pct/100)))} style={{flex:1,background:th.bg,border:"1px solid "+th.bor,borderRadius:9,padding:"7px 0",color:th.t2,cursor:"pointer",fontSize:12,fontWeight:600}}>{pct}%</button>))}
            <button onClick={()=>setPartialSum(String(q.summa))} style={{flex:1,background:th.ac+"15",border:"1px solid "+th.ac+"33",borderRadius:9,padding:"7px 0",color:th.ac,cursor:"pointer",fontSize:12,fontWeight:600}}>{lg==="uz"?"Hammasi":"All"}</button>
          </div>
          {pay>0&&<div style={{background:th.bg,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Qaytarilmoqda":"Paying"}</span><span style={{fontSize:13,fontWeight:700,color:dc}}>{f(pay,true)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Qoladi":"Remaining"}</span><span style={{fontSize:13,fontWeight:700,color:remain<=0?th.gr:th.t1}}>{remain<=0?(lg==="uz"?"To'liq yopiladi ✓":"Fully closed ✓"):f(remain,true)}</span></div>
          </div>}
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{setPartialQarz(null);setPartialSum("");}} style={{flex:1,background:"transparent",border:"1.5px solid "+th.bor,borderRadius:14,padding:"13px",color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{t.cn}</button>
            <button onClick={applyPartial} style={{flex:2,background:"linear-gradient(135deg,"+dc+","+dc+"cc)",border:"none",borderRadius:14,padding:"13px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:14}}>{lg==="uz"?"Tasdiqlash":lg==="ru"?"Подтвердить":"Confirm"}</button>
          </div>
        </div>
      </div>;
    })()}
    {qarzDonePrompt&&(()=>{
      const q=qarzDonePrompt;const isLent=q.tur==="bergan";const dc=isLent?th.gr:th.rd;
      return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setQarzDonePrompt(null)}>
        <div style={{background:th.sur,borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:360}} onClick={e=>e.stopPropagation()}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{width:64,height:64,borderRadius:18,background:dc+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 14px"}}>{isLent?"💰":"💸"}</div>
            <div style={{fontSize:18,fontWeight:800,color:th.t1,marginBottom:8}}>{isLent?(lg==="uz"?"Qarz qaytarib olindi":lg==="ru"?"Долг получен":"Debt received"):(lg==="uz"?"Qarz qaytarildi":lg==="ru"?"Долг возвращён":"Debt paid")}</div>
            <div style={{fontSize:14,color:th.t2,lineHeight:1.5}}>{isLent?(lg==="uz"?"Qaytarib olgan "+f(q.summa,true)+" pulni daromadlarga qo'shaylikmi?":lg==="ru"?"Добавить "+f(q.summa,true)+" в доходы?":"Add "+f(q.summa,true)+" to income?"):(lg==="uz"?"Qaytargan "+f(q.summa,true)+" pulni xarajatlarga qo'shaylikmi?":lg==="ru"?"Добавить "+f(q.summa,true)+" в расходы?":"Add "+f(q.summa,true)+" to expenses?")}</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setQarzDonePrompt(null)} style={{flex:1,background:"transparent",border:"1.5px solid "+th.bor,borderRadius:14,padding:"13px",color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{lg==="uz"?"Yo'q":lg==="ru"?"Нет":"No"}</button>
            <button onClick={()=>isLent?addQarzAsDaromad(q):addQarzAsXarajat(q)} style={{flex:2,background:"linear-gradient(135deg,"+dc+","+dc+"cc)",border:"none",borderRadius:14,padding:"13px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:14}}>{lg==="uz"?"Ha, qo'shilsin":lg==="ru"?"Да, добавить":"Yes, add"}</button>
          </div>
        </div>
      </div>;
    })()}
    {confetti&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      <style>{"@keyframes confFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:0}}"}</style>
      {Array.from({length:60}).map((_,i)=>{
        const colors=["#6366f1","#10b981","#f59e0b","#ec4899","#06b6d4","#ef4444","#8b5cf6"];
        const c=colors[i%colors.length];
        const left=Math.random()*100;
        const delay=Math.random()*0.5;
        const dur=2+Math.random()*1.5;
        const size=6+Math.random()*8;
        return <div key={i} style={{position:"absolute",top:0,left:left+"%",width:size,height:size,background:c,borderRadius:i%2===0?"50%":"2px",animation:"confFall "+dur+"s "+delay+"s ease-in forwards"}}/>;
      })}
    </div>}
    <div style={{background:th.sur,padding:"14px 18px 10px",borderBottom:"1px solid "+th.bor,position:"sticky",top:0,zIndex:20}}>
      <div style={{...S.row,marginBottom:scr==="bosh"&&!showS?10:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>{setScr("profil");setPTab("main");}} style={{background:"none",border:"none",cursor:"pointer",padding:0,position:"relative"}}>
            <Av src={user?.photo} name={user?.ism} size={36} ac={th.ac}/>
            <div style={{position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:"50%",background:th.gr,border:"2px solid "+th.sur}}/>
          </button>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:13,fontWeight:700,color:th.t1}}>{user?.ism||t.app}</span>{isPremium&&<span style={{fontSize:8,background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",color:"#fff",borderRadius:20,padding:"1px 6px",fontWeight:700}}>PRO</span>}</div>
            <span style={{fontSize:11,fontWeight:800,letterSpacing:-0.2}}>{lg==="uz"?<><span style={{color:th.ac}}>Oila</span><span style={{color:th.gr}}>Hisobchi</span></>:lg==="ru"?<><span style={{color:th.ac}}>Семейный</span><span style={{color:th.gr}}>Бюджет</span></>:<><span style={{color:th.ac}}>Family</span><span style={{color:th.gr}}>Budget</span></>}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>{setShowS(v=>!v);setSrch("");}} style={{background:showS?th.ac+"18":"transparent",border:"1px solid "+(showS?th.ac:th.bor),borderRadius:10,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center"}}>{Ico.search(showS?th.ac:th.t2)}</button>
          <button onClick={()=>setShowNotifs(true)} style={{background:"transparent",border:"1px solid "+th.bor,borderRadius:10,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",position:"relative"}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a4.5 4.5 0 00-4.5 4.5v2.7L3 12h12l-1.5-2.8V6.5A4.5 4.5 0 009 2z" fill={th.t2} opacity=".15" stroke={th.t2} strokeWidth="1.3" strokeLinejoin="round"/><path d="M7.5 14.5a1.5 1.5 0 003 0" stroke={th.t2} strokeWidth="1.3" strokeLinecap="round"/></svg>
            {notifs.filter(n=>!n.read).length>0&&<div style={{position:"absolute",top:2,right:2,minWidth:16,height:16,borderRadius:8,background:th.rd,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{notifs.filter(n=>!n.read).length>9?"9+":notifs.filter(n=>!n.read).length}</div>}
          </button>
        </div>
      </div>
      {showS&&<input autoFocus style={{...S.ip,marginBottom:0,marginTop:8}} value={srch} onChange={e=>setSrch(e.target.value)} placeholder={t.sch}/>}
      {scr==="bosh"&&!showS&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
        {[{l:t.inc,v:myD,c:th.gr,ic:"📈"},{l:t.exp,v:myX,c:bRng,ic:"📉"},{l:t.bal,v:myBal,c:myBal>=0?th.gr:th.rd,ic:"💰"}].map((item,ix)=>(
          <div key={item.l} className="anim-fadeUp" style={{background:"linear-gradient(135deg,"+item.c+"0d,"+th.bg+")",borderRadius:13,padding:"10px 10px",textAlign:"center",border:"1px solid "+item.c+"22",animationDelay:(ix*0.08)+"s",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:item.c,opacity:.6}}/>
            <div style={{fontSize:9,color:th.t2,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}><span style={{fontSize:10}}>{item.ic}</span>{item.l}</div>
            <div style={{fontSize:13,fontWeight:800,color:item.c,marginTop:3}}>{item.v<0?"-":""}{f(Math.abs(item.v),true)}</div>
          </div>
        ))}
      </div>}
    </div>
    <div style={{padding:"14px 16px 100px"}}>
      {showS&&<div><SL ch={t.res+" ("+srchR.length+")"}/>
        {srch.trim()&&srchR.length===0&&<div style={{...S.cd,textAlign:"center",color:th.t2,padding:28}}>{t.nf2}</div>}
        {srchR.map(item=><TxRow key={(item.kategoriya?"x":"d")+item.id} item={item}/>)}
      </div>}
      {scr==="bosh"&&!showS&&xReqs.length>0&&<div style={{...S.cd,border:"1.5px solid "+th.am+"55",marginBottom:14,background:th.am+"0a"}}>
        <div style={{fontSize:13,fontWeight:700,color:th.am,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:16}}>📥</span>{lg==="uz"?"So'rovlar":lg==="ru"?"Запросы":"Requests"} ({xReqs.length})
        </div>
        {xReqs.map(req=>{const isInc=req.kind==="income";return(
          <div key={req.id} style={{background:th.sur,borderRadius:13,padding:"12px 14px",marginBottom:10,border:"1px solid "+(isInc?th.gr+"44":th.bor)}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:13,color:th.t1,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:16}}>{isInc?"💰":"📤"}</span><b>{req.fromIsm}</b> {isInc?(lg==="uz"?"sizga pul berdi":"gave you money"):(lg==="uz"?"sizning nomingizdan":"for you")}</div>
              <div style={{fontSize:15,fontWeight:800,color:isInc?th.gr:th.rd}}>{isInc?"+":"-"}{f(req.summa,true)}</div>
            </div>
            <div style={{background:th.bg,borderRadius:9,padding:"7px 11px",marginBottom:10,fontSize:12,color:th.t2}}>{isInc?(DN[lg][DARS.findIndex(d=>d.id===(req.tur||"sovga"))]||req.izoh):KN[lg][KATS.findIndex(k=>k.id===req.kategoriya)]} · {req.izoh} · {req.sana}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>acceptXReq(req)} style={{flex:1,background:th.gr,border:"none",borderRadius:10,padding:"9px 0",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>{isInc?(lg==="uz"?"Daromadga qo'shish":"Add to income"):(lg==="uz"?"Tasdiqlash":"Accept")}</button>
              <button onClick={()=>rejectXReq(req)} style={{flex:1,background:"transparent",border:"1.5px solid "+th.rd+"55",borderRadius:10,padding:"9px 0",color:th.rd,cursor:"pointer",fontWeight:700,fontSize:13}}>{lg==="uz"?"Rad etish":lg==="ru"?"Отклонить":"Reject"}</button>
            </div>
          </div>
        );})}
      </div>}
      {scr==="bosh"&&!showS&&<div>
        <div className="anim-fadeUp" style={{background:"linear-gradient(135deg,"+th.ac+" 0%,"+th.ac2+" 60%,#a78bfa 100%)",borderRadius:24,padding:"20px 22px",marginBottom:16,position:"relative",overflow:"hidden",boxShadow:"0 12px 40px "+th.ac+"40"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:130,height:130,borderRadius:"50%",background:"rgba(255,255,255,0.10)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-40,left:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.06)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:20,right:40,width:8,height:8,borderRadius:"50%",background:"rgba(255,255,255,0.3)",pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.85)",marginBottom:2}}>{(()=>{const h=new Date().getHours();const greet=h<6?(lg==="uz"?"Xayrli tun":lg==="ru"?"Доброй ночи":"Good night"):h<12?(lg==="uz"?"Xayrli tong":lg==="ru"?"Доброе утро":"Good morning"):h<18?(lg==="uz"?"Xayrli kun":lg==="ru"?"Добрый день":"Good afternoon"):(lg==="uz"?"Xayrli kech":lg==="ru"?"Добрый вечер":"Good evening");return greet;})()}</div>
            <div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:14}}>{user?.ism||""} 👋</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:8}}>{lg==="uz"?"Mening balansim (bu oy)":lg==="ru"?"Мой баланс":"My balance"}</div>
            <div style={{fontSize:28,fontWeight:800,color:"#fff",marginBottom:14,letterSpacing:"-0.5px"}}>{myBal<0?"-":""}{f(Math.abs(myBal),true)}</div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1,background:"rgba(255,255,255,0.13)",borderRadius:13,padding:"10px 13px"}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.75)",marginBottom:3,display:"flex",alignItems:"center",gap:4}}><span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:"#86efac"}}/>{t.inc}</div>
                <div style={{fontSize:15,fontWeight:800,color:"#fff"}}>+{f(myD,true)}</div>
              </div>
              <div style={{flex:1,background:"rgba(255,255,255,0.13)",borderRadius:13,padding:"10px 13px"}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.75)",marginBottom:3,display:"flex",alignItems:"center",gap:4}}><span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:"#fca5a5"}}/>{t.exp}</div>
                <div style={{fontSize:15,fontWeight:800,color:"#fff"}}>-{f(myX,true)}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:th.t2,fontWeight:600,marginBottom:8,display:"flex",alignItems:"center",gap:5}}>⚡ {lg==="uz"?"Tez qo'shish":lg==="ru"?"Быстро добавить":"Quick add"}</div>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
            {QUICK_ADD.map((q,i)=>{
              const kat=KATS.find(k=>k.id===q.kat);
              return <button key={i} onClick={()=>{buzz(10);setQuickItem(q);setQuickSum("");}} style={{flexShrink:0,background:th.sur,border:"1px solid "+th.bor,borderRadius:14,padding:"10px 14px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:68}}>
                <span style={{fontSize:24}}>{q.emoji}</span>
                <span style={{fontSize:10,color:th.t2,fontWeight:600}}>{q[lg]||q.uz}</span>
              </button>;
            })}
          </div>
        </div>
        <div style={{...S.cd,marginBottom:14}}>
          <div style={{...S.row,marginBottom:8}}><span style={{color:th.t2,fontSize:12}}>{t.bud}</span><span style={{fontWeight:700,fontSize:12,color:th.t1}}>{f(bdj,true)}</span></div>
          <div style={{background:th.bg,borderRadius:10,height:12,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:"linear-gradient(90deg,"+bRng+"88,"+bRng+")",borderRadius:10,transition:"width .6s"}}/></div>
          <div style={{...S.row,marginTop:7}}><span style={{color:bRng,fontSize:11,fontWeight:700}}>{pct}% {t.sp}</span><span style={{color:bdj-jX>=0?th.gr:th.rd,fontSize:11}}>{f(Math.abs(bdj-jX),true)} {bdj-jX>=0?t.lf:t.ex}</span></div>
        </div>
        <div style={{...S.cd,marginBottom:14}}>
          <div style={{...S.row,marginBottom:12}}>
            <div><div style={{fontSize:13,fontWeight:700,color:th.t1,display:"flex",alignItems:"center",gap:6}}>{Ico.bank(th.ac)}{t.rates}</div><div style={{fontSize:10,color:th.t2,marginTop:2}}>{t.rSub}{(()=>{try{const rt=localStorage.getItem("oilaV7RatesT");if(rt){const d=new Date(rt);const today=new Date().toDateString()===d.toDateString();return " · "+(today?(lg==="uz"?"bugun":lg==="ru"?"сегодня":"today"):d.toLocaleDateString("uz-UZ"))+" "+d.toLocaleTimeString("uz-UZ",{hour:"2-digit",minute:"2-digit"});}}catch(e){}return"";})()}</div></div>
            <button onClick={fetchRates} style={{background:"none",border:"1px solid "+th.bor,borderRadius:9,padding:"4px 10px",cursor:"pointer",fontSize:11,color:th.t2,display:"flex",alignItems:"center",gap:4}}>{Ico.repeat(th.t2)}{lg==="uz"?"Yangilash":"Refresh"}</button>
          </div>
          {rateL&&<div style={{textAlign:"center",padding:"12px 0",color:th.t2,fontSize:13}}>{t.ldd}</div>}
          {!rateL&&rates.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {rates.map(r=>{
              const flags={USD:"\ud83c\uddfa\ud83c\uddf8",EUR:"\ud83c\uddea\ud83c\uddfa",RUB:"\ud83c\uddf7\ud83c\uddfa",GBP:"\ud83c\uddec\ud83c\udde7",CNY:"\ud83c\udde8\ud83c\uddf3",KZT:"\ud83c\uddf0\ud83c\uddff"};
              return <div key={r.code} style={{background:th.surH,borderRadius:12,padding:"10px 12px",border:"1px solid "+th.bor,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18,flexShrink:0}}>{flags[r.code]||"\ud83d\udcb1"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:700,color:th.t1}}>{r.code}</div>
                  <div style={{fontSize:9,color:th.t2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:12,fontWeight:800,color:th.ac}}>{Number(r.rate).toLocaleString("uz-UZ",{maximumFractionDigits:0})}</div>
                  <div style={{fontSize:9,color:th.t2}}>{"so'm"}</div>
                </div>
              </div>;
            })}
          </div>}
        </div>
        {bX.length>0&&<div style={{marginBottom:14}}>
          <SL ch={t.exp+" ("+tm()+")"}/>
          {KATS.map((k,i)=>{
            const tx=bX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0);if(!tx)return null;
            const lim=oila?.katLimits?.[k.id];const ov=lim&&tx>lim;
            const sp=Array.from({length:7},(_,si)=>{const d=new Date();d.setDate(d.getDate()-6+si);return xar.filter(x=>x.kategoriya===k.id&&x.sana===d.toISOString().slice(0,10)).reduce((s,x)=>s+Number(x.summa||0),0);});
            return <div key={k.id} style={{...S.cd,padding:"10px 13px",display:"flex",alignItems:"center",gap:10,marginBottom:7,borderColor:ov?th.rd+"44":th.bor}}>
              <div style={{width:36,height:36,borderRadius:10,background:k.c+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><KatIco id={k.id} c={k.c} s={20}/></div>
              <div style={{flex:1}}>
                <div style={{...S.row,marginBottom:3}}><span style={{fontSize:12,fontWeight:600,color:th.t1}}>{KN[lg][i]}</span><span style={{fontWeight:700,color:ov?th.rd:k.c,fontSize:12}}>{f(tx,true)}</span></div>
                <div style={{background:th.bg,borderRadius:4,height:5}}><div style={{width:Math.min(100,(tx/jX)*100)+"%",height:"100%",background:k.c,borderRadius:4}}/></div>
                {lim&&<div style={{fontSize:9,color:ov?th.rd:th.t2,marginTop:2}}>Limit: {f(lim,true)}{ov?" \u26a0":""}</div>}
              </div>
              <Spark data={sp} color={k.c}/>
            </div>;
          })}
        </div>}
        <div style={{...S.cd,marginBottom:14}}>
          <div style={{fontSize:11,color:th.t2,marginBottom:10,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>{Ico.fire(th.rd)}{t.hm}</div>
          <Heat xar={xar} ac={th.ac}/>
        </div>
        <SL ch={lg==="uz"?"Oxirgi operatsiyalar":lg==="ru"?"\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0438":"Recent transactions"}/>
        {xar.filter(x=>x.uid===user?.id).length===0&&dar.filter(d=>d.uid===user?.id).length===0?<div style={{textAlign:"center",padding:"40px 20px",color:th.t2,display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{width:80,height:80,borderRadius:"50%",background:th.ac+"11",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:14}}>\ud83d\udcb3</div><div style={{fontSize:16,fontWeight:700,color:th.t1,marginBottom:6}}>{lg==="uz"?"Hali xarajat kiritilmagan":lg==="ru"?"Пока нет операций":"No transactions yet"}</div><div style={{fontSize:13,color:th.t2,marginBottom:18,maxWidth:240}}>{lg==="uz"?"Yuqoridagi tez qo'shish tugmalaridan foydalaning yoki pastdagi + tugmasini bosing":"Use quick add buttons above or tap + below"}</div><button onClick={()=>setScr("qoshish")} style={{...S.bt(),width:"auto",padding:"12px 28px",marginBottom:0,display:"flex",alignItems:"center",gap:8}}>{Ico.add("#fff")}{lg==="uz"?"Xarajat qo'shish":lg==="ru"?"Добавить расход":"Add expense"}</button></div>
        :[...xar.filter(x=>x.uid===user?.id).slice(0,8).map(x=>({...x,tp:"x"})),...dar.filter(d=>d.uid===user?.id).slice(0,5).map(d=>({...d,tp:"d"}))].sort((a,b)=>b.id-a.id).slice(0,12).map(item=><TxRow key={item.tp+item.id} item={item}/>)}
      </div>}
      {scr==="grafik"&&<div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:14,color:th.t1}}>{t.chart}</div>
        <div style={{display:"flex",gap:5,marginBottom:16,background:th.bg,borderRadius:13,padding:4}}>
          {[{id:"line",l:lg==="uz"?"Trend":"Trend"},{id:"bar",l:lg==="uz"?"Oylik":"Monthly"},{id:"pie",l:lg==="uz"?"Taqsimot":"Distribution"}].map(tb=>(
            <button key={tb.id} onClick={()=>setCtab(tb.id)} style={{flex:1,background:ctab===tb.id?th.sur:"transparent",border:ctab===tb.id?"1px solid "+th.bor:"1px solid transparent",borderRadius:10,padding:"8px 2px",color:ctab===tb.id?th.ac:th.t2,cursor:"pointer",fontWeight:700,fontSize:11}}>{tb.l}</button>
          ))}
        </div>
        {ctab==="line"&&<div style={S.cd}><div style={{fontSize:12,fontWeight:600,color:th.t2,marginBottom:12}}>{t.l7}</div><ResponsiveContainer width="100%" height={200}><LineChart data={lineD} margin={{top:5,right:5,left:-25,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={th.bor}/><XAxis dataKey="k" tick={{fontSize:10,fill:th.t2}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:th.t2}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:th.sur,border:"1px solid "+th.bor,borderRadius:12,color:th.t1,fontSize:12}} formatter={v=>[v+"K",""]}/><Line type="monotone" dataKey="x" stroke={th.rd} strokeWidth={2.5} dot={false}/><Line type="monotone" dataKey="d" stroke={th.gr} strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer><div style={{display:"flex",gap:16,justifyContent:"center",marginTop:8}}><span style={{fontSize:11,color:th.rd,fontWeight:600}}>-- {t.exp}</span><span style={{fontSize:11,color:th.gr,fontWeight:600}}>-- {t.inc}</span></div></div>}
        {ctab==="bar"&&<div style={S.cd}><div style={{fontSize:12,fontWeight:600,color:th.t2,marginBottom:12}}>{t.l6}</div><ResponsiveContainer width="100%" height={200}><BarChart data={barD} margin={{top:5,right:5,left:-25,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={th.bor}/><XAxis dataKey="o" tick={{fontSize:10,fill:th.t2}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:th.t2}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:th.sur,border:"1px solid "+th.bor,borderRadius:12,color:th.t1,fontSize:12}} formatter={v=>[v+"K",""]}/><Bar dataKey="v" fill={th.ac} radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></div>}
        {ctab==="pie"&&<div style={S.cd}><div style={{fontSize:12,fontWeight:600,color:th.t2,marginBottom:12}}>{t.bc}</div>{pieD.length===0?<div style={{textAlign:"center",padding:30,color:th.t2}}>--</div>:<div><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieD} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>{pieD.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{background:th.sur,border:"1px solid "+th.bor,borderRadius:12,color:th.t1,fontSize:12}} formatter={v=>[f(v),""]}/></PieChart></ResponsiveContainer><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>{pieD.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7,background:th.bg,borderRadius:10,padding:"7px 10px"}}><div style={{width:10,height:10,borderRadius:"50%",background:d.color,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:11,color:th.t1,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div><div style={{fontSize:10,color:th.t2}}>{jX>0?Math.round(d.value/jX*100):0}%</div></div></div>)}</div></div>}</div>}
        <div style={{...S.cd,marginTop:4}}><div style={{fontSize:12,fontWeight:600,color:th.t2,marginBottom:12}}>{t.hm}</div><Heat xar={xar} ac={th.ac}/></div>
        <div style={S.cd}><div style={{fontSize:12,fontWeight:600,color:th.t2,marginBottom:10}}>{t.st}</div>{[{l:t.ad,v:f(Math.round(jX/Math.max(1,new Date().getDate())),true)},{l:t.ir,v:jX>0?(jD/jX).toFixed(2)+"x":"--"},{l:t.bs,v:f(Math.max(0,bdj-jX),true)},{l:t.rc,v:(bX.length+bD.length)+" ta"}].map(item=><div key={item.l} style={{...S.row,padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{item.l}</span><span style={{fontSize:12,fontWeight:700,color:th.ac}}>{item.v}</span></div>)}</div>
      </div>}
      {scr==="qoshish"&&<div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <button onClick={()=>setScr("qoshish")} style={S.tb(true)}>{t.exp}</button>
          <button onClick={()=>setScr("kirim")} style={S.tb(false)}>{t.inc}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <button onClick={startScanner} style={{position:"relative",background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",border:"none",borderRadius:14,padding:"13px 8px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 14px "+th.ac+"44"}}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1" stroke="#fff" strokeWidth="1.5"/><rect x="12" y="2" width="6" height="6" rx="1" stroke="#fff" strokeWidth="1.5"/><rect x="2" y="12" width="6" height="6" rx="1" stroke="#fff" strokeWidth="1.5"/><path d="M12 12h2v2M16 12v6M12 16h2M18 16v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {lg==="uz"?"QR skaner":lg==="ru"?"QR скан":"QR scan"}{!isPremium&&<span style={{position:"absolute",top:-6,right:-6,fontSize:8,background:"#f59e0b",color:"#fff",borderRadius:8,padding:"1px 5px",fontWeight:800}}>PRO</span>}
          </button>
          <button onClick={startVoice} style={{position:"relative",background:"linear-gradient(135deg,#8b5cf6,#6366f1)",border:"none",borderRadius:14,padding:"13px 8px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 14px #8b5cf644"}}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="7" y="2" width="6" height="10" rx="3" stroke="#fff" strokeWidth="1.5"/><path d="M4 9a6 6 0 0012 0M10 15v3M7 18h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {lg==="uz"?"Ovoz bilan":lg==="ru"?"Голос":"Voice"}{!isPremium&&<span style={{position:"absolute",top:-6,right:-6,fontSize:8,background:"#f59e0b",color:"#fff",borderRadius:8,padding:"1px 5px",fontWeight:800}}>PRO</span>}
          </button>
        </div>
        <button onClick={()=>{if(!isPremium){setShowPremModal(true);return;}setShowImport(true);setImportStep("upload");}} style={{position:"relative",width:"100%",background:"linear-gradient(135deg,#0ea5e9,#0284c7)",border:"none",borderRadius:14,padding:"13px 8px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16,boxShadow:"0 4px 14px #0ea5e944"}}>
          <span style={{fontSize:17}}>📄</span>{lg==="uz"?"Bank hisobotini import qilish (CSV)":lg==="ru"?"Импорт выписки (CSV)":"Import bank statement (CSV)"}{!isPremium&&<span style={{position:"absolute",top:-6,right:-6,fontSize:8,background:"#f59e0b",color:"#fff",borderRadius:8,padding:"1px 5px",fontWeight:800}}>PRO</span>}
        </button>
        <label style={S.lb}>{lg==="uz"?"Summa (so'm)":"Amount"}</label>
        <MoneyInput style={{...S.ip,fontSize:28,fontWeight:800,textAlign:"center"}} value={fS} onChange={setFS} placeholder="0" autoFocus/>
        {!(xForMember&&xMode==="give")&&<><label style={S.lb}>{t.bud}</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:13}}>
          {KATS.map((k,i)=>(
            <button key={k.id} onClick={()=>setFK(k.id)} style={{background:fK===k.id?k.c+"18":th.sur,border:"2px solid "+(fK===k.id?k.c:th.bor),borderRadius:12,padding:"9px 11px",color:fK===k.id?k.c:th.t2,cursor:"pointer",fontSize:12,fontWeight:600,textAlign:"left",display:"flex",alignItems:"center",gap:7}}>
              <KatIco id={k.id} c={fK===k.id?k.c:th.t2} s={18}/>{KN[lg][i]}
            </button>
          ))}
        </div></>}
        {xForMember&&xMode==="give"&&<div style={{background:"#f43f5e11",border:"1.5px solid #f43f5e44",borderRadius:12,padding:"11px 14px",marginBottom:13,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>🎁</span><div><div style={{fontSize:12,fontWeight:700,color:"#f43f5e"}}>{lg==="uz"?"Hadya":lg==="ru"?"Подарок":"Gift"}</div><div style={{fontSize:10,color:th.t2}}>{lg==="uz"?"Bu xarajat 'Hadya' kategoriyasiga yoziladi":"Saved as 'Gift' category"}</div></div></div>}
        <label style={S.lb}>{lg==="uz"?"Izoh":"Note"}</label>
        <input style={S.ip} value={fIz} onChange={e=>setFIz(e.target.value)} placeholder={lg==="uz"?"Nima uchun?":"What for?"}/>
        <label style={S.lb}>{lg==="uz"?"Sana":"Date"}</label>
        <input type="date" style={S.ip} value={fSn} onChange={e=>setFSn(e.target.value)}/>
        {azolar.length>1&&<><label style={S.lb}>{lg==="uz"?"Kim uchun?":lg==="ru"?"Для кого?":"For whom?"}</label>
        <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:6,marginBottom:12}}>
          <button onClick={()=>setXForMember("")} style={{flexShrink:0,background:!xForMember?th.ac+"18":th.surH,border:"1.5px solid "+(!xForMember?th.ac:th.bor),borderRadius:11,padding:"9px 13px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:!xForMember?th.ac:th.t2,fontSize:12,fontWeight:600}}><Av src={user?.photo} name={user?.ism} size={22} ac={th.ac}/>{lg==="uz"?"O'zim":lg==="ru"?"Я":"Me"}</button>
          {azolar.filter(a=>a.id!==user.id).map(a=>(<button key={a.id} onClick={()=>setXForMember(a.id)} style={{flexShrink:0,background:xForMember===a.id?th.ac+"18":th.surH,border:"1.5px solid "+(xForMember===a.id?th.ac:th.bor),borderRadius:11,padding:"9px 13px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:xForMember===a.id?th.ac:th.t2,fontSize:12,fontWeight:600}}><Av src={a.photo} name={a.ism} size={22} ac={th.ac}/>{a.ism.split(" ")[0]}</button>))}
        </div>
        {xForMember&&<>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <button onClick={()=>setXMode("expense")} style={{flex:1,background:xMode==="expense"?th.ac+"18":th.surH,border:"1.5px solid "+(xMode==="expense"?th.ac:th.bor),borderRadius:11,padding:"10px",cursor:"pointer",color:xMode==="expense"?th.ac:th.t2,fontSize:12,fontWeight:700}}>{lg==="uz"?"Uning xarajati":lg==="ru"?"Его расход":"Their expense"}</button>
          <button onClick={()=>setXMode("give")} style={{flex:1,background:xMode==="give"?th.gr+"18":th.surH,border:"1.5px solid "+(xMode==="give"?th.gr:th.bor),borderRadius:11,padding:"10px",cursor:"pointer",color:xMode==="give"?th.gr:th.t2,fontSize:12,fontWeight:700}}>{lg==="uz"?"Pul berdim":lg==="ru"?"Дал деньги":"Gave money"}</button>
        </div>
        <div style={{background:(xMode==="give"?th.gr:th.am)+"11",borderRadius:11,padding:"9px 13px",marginBottom:12,fontSize:11,color:th.t2,display:"flex",alignItems:"center",gap:6}}><span>{xMode==="give"?"💰":"ℹ️"}</span>{xMode==="give"?(lg==="uz"?"Sizga xarajat, a'zoga daromad so'rovi yuboriladi. U tasdiqlasa daromadiga qo'shiladi.":"Your expense + their income request."):(lg==="uz"?"Bu xarajat tanlangan a'zoga so'rov sifatida yuboriladi.":"Sent as expense request to the member.")}</div></>}</>}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,background:th.sur,border:"1px solid "+th.bor,borderRadius:13,padding:"12px 14px"}}>
          <input type="checkbox" id="rep" checked={fRp} onChange={e=>setFRp(e.target.checked)} style={{width:18,height:18,cursor:"pointer",accentColor:th.ac}}/>
          <label htmlFor="rep" style={{fontSize:13,color:th.t1,cursor:"pointer"}}>{lg==="uz"?"Takroriy (oy sayin)":"Recurring (monthly)"}</label>
        </div>
        <button onClick={addX} style={S.bt(th.rd,"#dc2626")}>{Ico.check("#fff")}{xForMember?(lg==="uz"?" So'rov yuborish":" Send request"):(lg==="uz"?" Xarajatni saqlash":" Save expense")}</button>
      </div>}
      {scr==="kirim"&&<div>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          <button onClick={()=>setScr("qoshish")} style={S.tb(false)}>{t.exp}</button>
          <button onClick={()=>setScr("kirim")} style={S.tb(true)}>{t.inc}</button>
        </div>
        <label style={S.lb}>{lg==="uz"?"Summa (so'm)":"Amount"}</label>
        <MoneyInput style={{...S.ip,fontSize:28,fontWeight:800,textAlign:"center"}} value={fDS} onChange={setFDS} placeholder="0" autoFocus/>
        <label style={S.lb}>{lg==="uz"?"Daromad turi":"Income type"}</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:13}}>
          {DARS.map((d,i)=>(
            <button key={d.id} onClick={()=>setFDT(d.id)} style={{background:fDT===d.id?d.c+"18":th.sur,border:"2px solid "+(fDT===d.id?d.c:th.bor),borderRadius:12,padding:"9px 11px",color:fDT===d.id?d.c:th.t2,cursor:"pointer",fontSize:12,fontWeight:600,textAlign:"left",display:"flex",alignItems:"center",gap:7}}>
              <DarIco id={d.id} c={fDT===d.id?d.c:th.t2} s={18}/>{DN[lg][i]}
            </button>
          ))}
        </div>
        <label style={S.lb}>{lg==="uz"?"Izoh":"Note"}</label>
        <input style={S.ip} value={fDI} onChange={e=>setFDI(e.target.value)} placeholder="..."/>
        <button onClick={addD} style={S.bt(th.gr,"#059669")}>{Ico.check("#fff")}{lg==="uz"?" Daromadni saqlash":" Save income"}</button>
      </div>}
      {scr==="maqsad"&&<div>
        <div style={{...S.row,marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:700,color:th.t1}}>{t.goal}</div>
          <button onClick={()=>setAddM(v=>!v)} style={{background:th.ac,border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:5,boxShadow:"0 4px 12px "+th.ac+"44"}}>{Ico.add("#fff")}</button>
        </div>
        {addM&&<div style={{...S.cd,border:"1.5px solid "+th.ac+"55",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:th.ac,marginBottom:13}}>{lg==="uz"?"Yangi maqsad":"New goal"}</div>
          <label style={S.lb}>{lg==="uz"?"Tayyor maqsadlar":lg==="ru"?"Готовые цели":"Quick presets"}</label>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:12}}>
            {GOAL_PRESETS.map((p,i)=>(
              <button key={i} onClick={()=>{setMN(p[lg]||p.uz);setMR(p.rang);}} style={{flexShrink:0,background:mN===(p[lg]||p.uz)?p.rang+"18":th.bg,border:"1.5px solid "+(mN===(p[lg]||p.uz)?p.rang:th.bor),borderRadius:12,padding:"10px 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:78}}>
                <span style={{fontSize:24}}>{p.emoji}</span>
                <span style={{fontSize:10,color:mN===(p[lg]||p.uz)?p.rang:th.t2,fontWeight:600,textAlign:"center",lineHeight:1.2}}>{p[lg]||p.uz}</span>
              </button>
            ))}
          </div>
          <label style={S.lb}>{lg==="uz"?"Maqsad nomi":"Goal name"}</label><input style={S.ip} value={mN} onChange={e=>setMN(e.target.value)} placeholder={lg==="uz"?"Yoki o'zingiz yozing...":"Or write your own..."}/>
          <label style={S.lb}>{lg==="uz"?"Summa (so'm)":"Amount"}</label><MoneyInput style={S.ip} value={mS} onChange={setMS} placeholder="5 000 000"/>
          {mS&&Number(mS)>0&&<div style={{background:"linear-gradient(135deg,"+th.ac+"11,"+th.ac2+"08)",border:"1px solid "+th.ac+"33",borderRadius:13,padding:"13px 15px",marginBottom:13}}>
            <div style={{fontSize:11,color:th.ac,fontWeight:700,marginBottom:8,display:"flex",alignItems:"center",gap:5}}>💡 {lg==="uz"?"Avtomatik hisob":lg==="ru"?"Авторасчёт":"Auto calculation"}</div>
            {[{m:6,l:lg==="uz"?"6 oyda":"6 months"},{m:12,l:lg==="uz"?"12 oyda":"12 months"},{m:24,l:lg==="uz"?"24 oyda":"24 months"}].map(opt=>{
              const perMonth=Math.ceil(Number(mS)/opt.m);
              return <div key={opt.m} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
                <span style={{color:th.t2}}>{opt.l}:</span>
                <span style={{color:th.t1,fontWeight:700}}>{f(perMonth,true)}/{lg==="uz"?"oy":lg==="ru"?"мес":"mo"}</span>
              </div>;
            })}
            <div style={{fontSize:11,color:th.t2,marginTop:8,paddingTop:8,borderTop:"1px solid "+th.bor}}>{lg==="uz"?"Har oy ajratsangiz, shu muddatda yig'asiz":lg==="ru"?"Откладывая ежемесячно, накопите за этот срок":"Save monthly to reach your goal"}</div>
          </div>}
          <label style={S.lb}>{lg==="uz"?"Rang":"Color"}</label>
          <div style={{display:"flex",gap:8,marginBottom:13}}>{[th.gr,th.ac,"#f59e0b","#8b5cf6",th.rd,"#06b6d4"].map(r=><button key={r} onClick={()=>setMR(r)} style={{width:32,height:32,borderRadius:"50%",background:r,border:mR===r?"3px solid "+th.t1:"3px solid transparent",cursor:"pointer",flexShrink:0}}/>)}</div>
          <button onClick={addMq} style={S.bt()}>{t.sv}</button>
        </div>}
        {tupId&&<div style={{...S.cd,border:"1.5px solid "+th.ac+"55",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:th.t1}}>{t.tp}</div>
          <MoneyInput autoFocus style={S.ip} value={tupS} onChange={setTupS} placeholder="..."/>
          <div style={{display:"flex",gap:8}}><button onClick={tupMq} style={{...S.bt(),marginBottom:0,flex:1}}>{t.am}</button><button onClick={()=>setTupId(null)} style={{flex:1,background:"transparent",border:"1.5px solid "+th.bor,borderRadius:14,padding:14,color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{t.cn}</button></div>
        </div>}
        {editMq&&<div style={{...S.cd,border:"1.5px solid "+th.am+"55",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:th.am}}>{lg==="uz"?"Maqsadni tahrirlash":lg==="ru"?"Редактировать цель":"Edit goal"}</div>
          <label style={S.lb}>{lg==="uz"?"Maqsad nomi":"Goal name"}</label>
          <input style={S.ip} value={editMqN} onChange={e=>setEditMqN(e.target.value)} placeholder="..."/>
          <label style={S.lb}>{lg==="uz"?"Summa (so'm)":"Amount"}</label>
          <MoneyInput style={S.ip} value={editMqS} onChange={setEditMqS} placeholder="..."/>
          <div style={{display:"flex",gap:8}}><button onClick={saveEditMq} style={{...S.bt(),marginBottom:0,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{Ico.check("#fff")}{t.sv}</button><button onClick={()=>setEditMq(null)} style={{flex:1,background:"transparent",border:"1.5px solid "+th.bor,borderRadius:14,padding:14,color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{t.cn}</button></div>
        </div>}
        {maq.length===0&&!addM?<div style={{textAlign:"center",padding:"44px 0",color:th.t2,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}><div style={{fontSize:48}}>\ud83c\udfaf</div><span>{lg==="uz"?"Maqsad qo'shing":"Add a goal"}</span></div>
        :maq.map(m=>{
          const p=Math.round(m.jamg/m.maqsad*100);
          return <div key={m.id} style={{...S.cd,marginBottom:10}}>
            <div style={{...S.row,alignItems:"flex-start",marginBottom:10}}>
              <div><div style={{fontWeight:700,fontSize:15,color:th.t1}}>{m.ism}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{f(m.jamg,true)} / {f(m.maqsad,true)}</div></div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:18,fontWeight:800,color:m.rang}}>{p}%</span><button onClick={()=>{setEditMq(m.id);setEditMqN(m.ism);setEditMqS(String(m.maqsad));}} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}>{Ico.edit(th.t2)}</button><button onClick={()=>delMq(m.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}>{Ico.trash(th.t2)}</button></div>
            </div>
            <div style={{background:th.bg,borderRadius:10,height:14,overflow:"hidden",marginBottom:10}}><div style={{width:p+"%",height:"100%",background:"linear-gradient(90deg,"+m.rang+"88,"+m.rang+")",borderRadius:10,transition:"width .7s"}}/></div>
            {p<100&&(()=>{const remain=m.maqsad-m.jamg;const perMonth=Math.ceil(m.maqsad/12);const monthsLeft=Math.ceil(remain/perMonth);return <div style={{background:m.rang+"0d",borderRadius:9,padding:"8px 11px",marginBottom:10,fontSize:11,color:th.t2,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}>💡</span><span>{lg==="uz"?"Har oy "+f(perMonth,true)+" ajratsangiz, ~"+monthsLeft+" oyda yig'asiz":lg==="ru"?"Откладывая "+f(perMonth,true)+"/мес, накопите за ~"+monthsLeft+" мес":"Save "+f(perMonth,true)+"/mo to reach in ~"+monthsLeft+" months"}</span></div>;})()}
            {p>=100?<div style={{textAlign:"center",color:m.rang,fontWeight:700,fontSize:13}}>{t.ach}</div>:<div style={{...S.row}}><span style={{fontSize:11,color:th.t2}}>{t.rem}: {f(m.maqsad-m.jamg,true)}</span><button onClick={()=>{setTupId(m.id);setTupS("");}} style={{background:m.rang+"18",border:"1px solid "+m.rang+"44",borderRadius:9,padding:"5px 12px",color:m.rang,cursor:"pointer",fontWeight:700,fontSize:12}}>{t.am}</button></div>}
          </div>;
        })}
      </div>}
      {scr==="vazifa"&&<div>
        {/* BOLA BALANSI (faqat bola yoki tanlangan) */}
        {isKid&&<div className="anim-fadeUp" style={{background:"linear-gradient(135deg,#f59e0b 0%,#ec4899 60%,#8b5cf6 100%)",borderRadius:24,padding:"22px 20px",marginBottom:18,position:"relative",overflow:"hidden",boxShadow:"0 12px 40px #f59e0b40"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.12)"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.9)",marginBottom:4}}>{lg==="uz"?"Mening cho'ntak pulim":lg==="ru"?"Мои карманные":"My pocket money"}</div>
            <div style={{fontSize:32,fontWeight:800,color:"#fff",marginBottom:6}}>{f(kidBalances[user.id]||0,true)}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.85)"}}>🏆 {vazifalar.filter(v=>v.assignedTo===user.id&&v.status==="approved").length} {lg==="uz"?"ta vazifa bajarildi":"tasks done"}</div>
          </div>
        </div>}
        {/* OTA-ONA: vazifa qo'shish tugmasi */}
        {!isKid&&<button onClick={()=>{buzz(10);setShowAddVazifa(true);}} style={{...S.bt(),marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{Ico.add("#fff")}{lg==="uz"?"Yangi vazifa berish":lg==="ru"?"Новое задание":"New task"}</button>}
        {/* VAZIFALAR RO'YXATI */}
        {(()=>{
          const myTasks=isKid?vazifalar.filter(v=>v.assignedTo===user.id):vazifalar;
          if(myTasks.length===0)return <div style={{textAlign:"center",padding:"40px 20px",color:th.t2,display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{width:80,height:80,borderRadius:"50%",background:th.ac+"11",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:14}}>🎯</div><div style={{fontSize:16,fontWeight:700,color:th.t1,marginBottom:6}}>{isKid?(lg==="uz"?"Hali vazifa yo'q":"No tasks yet"):(lg==="uz"?"Hali vazifa bermadingiz":"No tasks created")}</div><div style={{fontSize:13,color:th.t2,maxWidth:240}}>{isKid?(lg==="uz"?"Ota-onangiz tez orada vazifa beradi":"Your parent will add tasks soon"):(lg==="uz"?"Bolalaringizga vazifa berib, ularni rag'batlantiring":"Add tasks to motivate your kids")}</div></div>;
          return myTasks.map(v=>{
            const kid=azolar.find(a=>a.id===v.assignedTo);
            const st=v.status;
            const stColor=st==="approved"?th.gr:st==="done"?th.am:th.ac;
            const stText=st==="approved"?(lg==="uz"?"Tasdiqlandi":"Approved"):st==="done"?(lg==="uz"?"Tekshirilmoqda":"Pending review"):(lg==="uz"?"Bajarilmagan":"To do");
            return <div key={v.id} className="anim-fadeUp" style={{background:th.sur,borderRadius:16,padding:"14px 16px",marginBottom:10,border:"1px solid "+th.bor,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:stColor}}/>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:46,height:46,borderRadius:13,background:stColor+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{v.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:th.t1,marginBottom:2}}>{v.title}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontWeight:800,color:th.gr}}>+{f(v.reward,true)}</span>
                    {!isKid&&kid&&<span style={{fontSize:11,color:th.t2}}>👶 {kid.ism}</span>}
                    <span style={{fontSize:10,background:stColor+"18",color:stColor,borderRadius:6,padding:"2px 8px",fontWeight:700}}>{stText}</span>
                  </div>
                </div>
              </div>
              {/* HARAKATLAR */}
              <div style={{display:"flex",gap:8,marginTop:12}}>
                {isKid&&st==="pending"&&<button onClick={()=>vazifaDone(v.id)} style={{flex:1,background:th.ac,border:"none",borderRadius:10,padding:"10px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>✓ {lg==="uz"?"Bajardim":"Done"}</button>}
                {isKid&&st==="done"&&<div style={{flex:1,textAlign:"center",fontSize:12,color:th.am,fontWeight:600,padding:"10px"}}>⏳ {lg==="uz"?"Ota-ona tasdig'i kutilmoqda":"Awaiting approval"}</div>}
                {isKid&&st==="approved"&&<div style={{flex:1,textAlign:"center",fontSize:12,color:th.gr,fontWeight:700,padding:"10px"}}>🎉 {lg==="uz"?"Mukofot olindi!":"Reward received!"}</div>}
                {!isKid&&st==="done"&&<><button onClick={()=>vazifaApprove(v.id)} style={{flex:2,background:th.gr,border:"none",borderRadius:10,padding:"10px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>✓ {lg==="uz"?"Tasdiqlash":"Approve"}</button><button onClick={()=>vazifaReject(v.id)} style={{flex:1,background:th.am+"18",border:"1px solid "+th.am+"44",borderRadius:10,padding:"10px",color:th.am,cursor:"pointer",fontWeight:700,fontSize:13}}>↩</button></>}
                {!isKid&&st!=="done"&&<button onClick={()=>delVazifa(v.id)} style={{width:"100%",background:th.rd+"11",border:"1px solid "+th.rd+"33",borderRadius:10,padding:"9px",color:th.rd,cursor:"pointer",fontWeight:600,fontSize:12}}>{lg==="uz"?"O'chirish":"Delete"}</button>}
              </div>
            </div>;
          });
        })()}
      </div>}
      {scr==="qarz"&&<div>
        <div style={{...S.row,marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:700,color:th.t1}}>{lg==="uz"?"Qarzlar":lg==="ru"?"Долги":"Debts"}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={refreshQarzReqs} style={{background:th.surH,border:"1px solid "+th.bor,borderRadius:10,padding:"7px 11px",cursor:"pointer",display:"flex",alignItems:"center"}}>{Ico.repeat(th.t2)}</button>
            <button onClick={()=>setShowAddQarz(v=>!v)} style={{background:th.ac,border:"none",borderRadius:10,padding:"7px 14px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,boxShadow:"0 4px 12px "+th.ac+"44"}}>{showAddQarz?"x":(lg==="uz"?"+ Qo'shish":"+ Add")}</button>
          </div>
        </div>
        {showAddQarz&&<div style={{...S.cd,border:"1.5px solid "+th.ac+"55",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:th.ac,marginBottom:13}}>{lg==="uz"?"Yangi qarz":"New debt"}</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button onClick={()=>setQarzTur("olgan")} style={{...S.tb(qarzTur==="olgan"),flex:1}}>{lg==="uz"?"Oldim":"I borrowed"}</button>
            <button onClick={()=>setQarzTur("bergan")} style={{...S.tb(qarzTur==="bergan"),flex:1}}>{lg==="uz"?"Berdim":"I lent"}</button>
          </div>
          <div style={{background:qarzTur==="olgan"?th.rd+"11":th.gr+"11",borderRadius:11,padding:"9px 13px",marginBottom:12,fontSize:12,color:qarzTur==="olgan"?th.rd:th.gr,fontWeight:600}}>{qarzTur==="olgan"?(lg==="uz"?"Kimdir menga pul berdi — men qarzdorman":lg==="ru"?"Мне дали в долг — я должен":"Someone lent me money — I owe"):(lg==="uz"?"Men birovga pul berdim — ular qarzdor":lg==="ru"?"Я дал в долг — мне должны":"I lent money — they owe me")}</div>
          <label style={S.lb}>{lg==="uz"?"Ism (kim?)":"Person name"}</label>
          <input style={S.ip} value={qarzKim} onChange={e=>setQarzKim(e.target.value)} placeholder={lg==="uz"?"Masalan: Akbar aka":"e.g. John"}/>
          <label style={S.lb}>{lg==="uz"?"Summa (so'm)":"Amount"}</label>
          <MoneyInput style={{...S.ip,fontSize:22,fontWeight:800,textAlign:"center"}} value={qarzSum} onChange={setQarzSum} placeholder="0"/>
          <label style={S.lb}>{lg==="uz"?"Sana":"Date"}</label>
          <input type="date" style={S.ip} value={qarzSana} onChange={e=>setQarzSana(e.target.value)}/>
          <label style={S.lb}>{lg==="uz"?"Qaytarish sanasi":"Return date"}</label>
          <input type="date" style={S.ip} value={qarzQaytSana} onChange={e=>setQarzQaytSana(e.target.value)}/>
          <label style={S.lb}>{lg==="uz"?"Izoh (ixtiyoriy)":"Note (optional)"}</label>
          <input style={S.ip} value={qarzIzoh} onChange={e=>setQarzIzoh(e.target.value)} placeholder="..."/>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:qarzLinked?12:14,background:th.surH,border:"1px solid "+th.bor,borderRadius:13,padding:"12px 14px"}}>
            <div onClick={()=>setQarzLinked(v=>!v)} style={{width:46,height:26,borderRadius:13,background:qarzLinked?th.ac:"#334155",cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0}}>
              <div style={{position:"absolute",top:3,left:qarzLinked?23:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .3s"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:th.t1,fontWeight:600}}>{lg==="uz"?"Telefon orqali bog'lash":"Link by phone"}</div>
              <div style={{fontSize:10,color:th.t2,marginTop:1}}>{lg==="uz"?"Tasdiqlash so'rovi yuboriladi":"Sends confirmation"}</div>
            </div>
          </div>
          {qarzLinked&&<><label style={S.lb}>{lg==="uz"?"Qarzdor telefon raqami":"Person's phone"}</label>
          <input style={S.ip} type="tel" value={qarzTel} onChange={e=>setQarzTel(e.target.value)} placeholder="+998 90 123 45 67"/>
          <div style={{background:th.ac+"11",borderRadius:11,padding:"9px 13px",marginBottom:12,fontSize:11,color:th.t2}}>{lg==="uz"?"Bu raqam bilan ro'yxatdan o'tgan foydalanuvchiga so'rov boradi.":"A request is sent to the registered user."}</div></>}
          <button onClick={qarzLinked?sendQarzRequest:addQarz} style={S.bt()}>{qarzLinked?(lg==="uz"?"So'rov yuborish":"Send request"):(lg==="uz"?"Saqlash":"Save")}</button>
        </div>}
        {qarzReqs.length>0&&<div style={{...S.cd,border:"1.5px solid "+th.am+"55",marginBottom:14,background:th.am+"0a"}}>
          <div style={{fontSize:13,fontWeight:700,color:th.am,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" fill={th.am} opacity=".2" stroke={th.am} strokeWidth="1.3"/></svg>
            {lg==="uz"?"Yangi qarz so'rovlari":"New requests"} ({qarzReqs.length})
          </div>
          {qarzReqs.map(req=>{
            const isPay=req.type==="payment";
            const theyLent=req.tur==="bergan";
            return <div key={req.id} style={{background:th.sur,borderRadius:13,padding:"13px 15px",marginBottom:10,border:"1px solid "+(isPay?th.gr+"44":th.bor)}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:42,height:42,borderRadius:12,background:(isPay?th.gr:th.ac)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{isPay?"✅":"👤"}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:th.t1}}>{req.fromIsm}</div><div style={{fontSize:11,color:th.t2}}>{req.fromTel}</div></div>
                <div style={{fontSize:16,fontWeight:800,color:isPay?th.gr:(theyLent?th.rd:th.gr)}}>{f(req.summa,true)}</div>
              </div>
              <div style={{background:th.bg,borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:12,color:th.t1}}>
                {isPay?<span style={{fontWeight:600,color:th.gr}}>{lg==="uz"?req.fromIsm+" qarzni qaytardim deyapti. Tasdiqlaysizmi?":req.fromIsm+" says the debt is returned. Confirm?"}</span>:(theyLent?(lg==="uz"?req.fromIsm+" sizga "+f(req.summa,true)+" qarz berdi":"They lent you money"):(lg==="uz"?"Siz "+req.fromIsm+" dan "+f(req.summa,true)+" oldingiz":"You borrowed"))}
                {!isPay&&req.qaytSana&&<div style={{fontSize:11,color:th.t2,marginTop:3}}>{lg==="uz"?"Qaytarish":"Return"}: {req.qaytSana}</div>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>isPay?acceptPayReq(req):acceptQarzReq(req)} style={{flex:1,background:th.gr,border:"none",borderRadius:10,padding:"10px 0",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>{lg==="uz"?(isPay?"Qaytarildi, tasdiqlash":"Tasdiqlash"):(isPay?"Confirm return":"Accept")}</button>
                <button onClick={()=>isPay?rejectPayReq(req):rejectQarzReq(req)} style={{flex:1,background:"transparent",border:"1.5px solid "+th.rd+"55",borderRadius:10,padding:"10px 0",color:th.rd,cursor:"pointer",fontWeight:700,fontSize:13}}>{lg==="uz"?"Rad etish":"Reject"}</button>
              </div>
            </div>;
          })}
        </div>}
        {(()=>{
          // Har a'zo faqat O'Z qarzini ko'radi. Oila boshi a'zolarnikini ham (alohida).
          const isBosh=user?.rol==="bosh";
          const myQ=qarzlar.filter(q=>!q.uid||q.uid===user.id);
          // Oila a'zolari qarzlari (faqat oila boshi ko'radi)
          const memberQ=isBosh?qarzlar.filter(q=>q.uid&&q.uid!==user.id):[];
          const active=myQ.filter(q=>!q.paid);
          const done=myQ.filter(q=>q.paid);
          const memberActive=memberQ.filter(q=>!q.paid);
          const olganSum=active.filter(q=>q.tur==="bergan").reduce((s,q)=>s+Number(q.summa||0),0);
          const berganSum=active.filter(q=>q.tur==="olgan").reduce((s,q)=>s+Number(q.summa||0),0);
          const gN2=uid=>azolar.find(a=>a.id===uid)?.ism||"?";
          return <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div style={{...S.cd,textAlign:"center",margin:0,border:"1px solid "+th.gr+"44"}}><div style={{fontSize:10,color:th.gr,fontWeight:700,marginBottom:4}}>{lg==="uz"?"Menga qaytariladi":"They owe me"}</div><div style={{fontSize:18,fontWeight:800,color:th.gr}}>{f(olganSum,true)}</div></div>
              <div style={{...S.cd,textAlign:"center",margin:0,border:"1px solid "+th.rd+"44"}}><div style={{fontSize:10,color:th.rd,fontWeight:700,marginBottom:4}}>{lg==="uz"?"Men qaytaraman":"I owe"}</div><div style={{fontSize:18,fontWeight:800,color:th.rd}}>{f(berganSum,true)}</div></div>
            </div>
            {active.length>0&&<div>
              <div style={S.sec}>{isBosh&&memberActive.length>0?(lg==="uz"?"Mening qarzlarim":lg==="ru"?"Мои долги":"My debts"):(lg==="uz"?"Faol qarzlar":"Active debts")} ({active.length})</div>
              {active.map(q=>{
                const isLent=q.tur==="bergan";const color=isLent?th.gr:th.rd;
                const today=new Date().toISOString().slice(0,10);const overdue=q.qaytSana&&q.qaytSana<today;
                return <div key={q.id} style={{...S.cd,padding:"13px 15px",marginBottom:10,border:"1px solid "+(overdue?th.rd+"55":th.bor)}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:42,height:42,borderRadius:12,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{isLent?"💰":"💸"}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:th.t1,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>{q.kim}
                          {q.payStatus==="pending"&&<span style={{fontSize:9,background:th.am+"22",color:th.am,borderRadius:6,padding:"2px 7px",fontWeight:700}}>{lg==="uz"?"QAYTARISH KUTILMOQDA":"RETURN PENDING"}</span>}
                          {q.linked&&q.linkStatus==="pending"&&!q.payStatus&&<span style={{fontSize:9,background:th.am+"22",color:th.am,borderRadius:6,padding:"2px 7px",fontWeight:700}}>{lg==="uz"?"KUTILMOQDA":"PENDING"}</span>}
                          {q.linked&&q.linkStatus==="accepted"&&!q.payStatus&&<span style={{fontSize:9,background:th.gr+"22",color:th.gr,borderRadius:6,padding:"2px 7px",fontWeight:700}}>✓ {lg==="uz"?"TASDIQLANGAN":"CONFIRMED"}</span>}
                          {q.linked&&q.linkStatus==="rejected"&&<span style={{fontSize:9,background:th.rd+"22",color:th.rd,borderRadius:6,padding:"2px 7px",fontWeight:700}}>{lg==="uz"?"RAD ETILGAN":"REJECTED"}</span>}
                        </div>
                        <div style={{fontSize:11,color:th.t2,marginTop:2}}>{q.sana}{q.qaytSana?" → "+q.qaytSana:""}</div>
                        {q.izoh&&<div style={{fontSize:11,color:th.t2,marginTop:1,fontStyle:"italic"}}>{q.izoh}</div>}
                        {overdue&&<div style={{fontSize:10,color:th.rd,fontWeight:700,marginTop:3}}>{"⚠️ "+(lg==="uz"?"Muddati o'tgan!":"Overdue!")}</div>}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,color}}>{f(q.summa,true)}</div>{q.paidPart>0?<div style={{fontSize:9,color:th.gr,marginTop:2,fontWeight:600}}>{lg==="uz"?"To'langan: ":"Paid: "}{f(q.paidPart,true)}</div>:<div style={{fontSize:10,color:th.t2,marginTop:2}}>{isLent?(lg==="uz"?"ular qarzli":"they owe"):(lg==="uz"?"men qarzman":"I owe")}</div>}</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    {q.payStatus==="pending"?
                      <div style={{flex:1,background:th.am+"11",border:"1px solid "+th.am+"33",borderRadius:10,padding:"8px 0",color:th.am,fontWeight:700,fontSize:12,textAlign:"center"}}>{q.payBy===user.id?(lg==="uz"?"Tasdiq kutilmoqda...":"Awaiting confirmation..."):(lg==="uz"?"Qaytarish so'rovi keldi":"Return requested")}</div>
                      :<button onClick={()=>markQarzPaid(q.id)} style={{flex:1,background:color+"18",border:"1px solid "+color+"44",borderRadius:10,padding:"8px 0",color,cursor:"pointer",fontWeight:700,fontSize:12}}>{isLent?(lg==="uz"?"Qaytarib oldim":lg==="ru"?"Получил обратно":"Got it back"):(lg==="uz"?"Qaytardim":lg==="ru"?"Вернул":"Paid back")}</button>
                    }
                    {q.payStatus!=="pending"&&isLent&&<button onClick={()=>sendQarzReminder(q)} style={{background:(overdue?th.rd:th.am)+"15",border:"1px solid "+(overdue?th.rd:th.am)+"44",borderRadius:10,padding:"8px 11px",color:overdue?th.rd:th.am,cursor:"pointer",fontWeight:700,fontSize:12,flexShrink:0,display:"flex",alignItems:"center",gap:4}}><svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke={overdue?th.rd:th.am} strokeWidth="1.4" strokeLinejoin="round"/></svg>{lg==="uz"?"Eslatish":lg==="ru"?"Напомнить":"Remind"}</button>}
                    {q.payStatus!=="pending"&&<button onClick={()=>{setPartialQarz(q);setPartialSum("");}} style={{background:th.ac+"11",border:"1px solid "+th.ac+"33",borderRadius:10,padding:"8px 12px",color:th.ac,cursor:"pointer",fontWeight:700,fontSize:12,flexShrink:0}}>{lg==="uz"?"Qisman":lg==="ru"?"Частично":"Partial"}</button>}
                    {q.linked&&q.linkStatus==="accepted"&&q.payStatus!=="pending"&&<button onClick={()=>generateTilxat(q)} style={{background:"#4f46e515",border:"1px solid #4f46e544",borderRadius:10,padding:"8px 11px",color:"#4f46e5",cursor:"pointer",fontWeight:700,fontSize:12,flexShrink:0,display:"flex",alignItems:"center",gap:4}} title={lg==="uz"?"Tilxat (PDF)":"Receipt (PDF)"}><span style={{fontSize:13}}>📄</span>{lg==="uz"?"Tilxat":lg==="ru"?"Расписка":"Receipt"}</button>}
                    <button onClick={()=>delQarz(q.id)} style={{width:38,background:th.rd+"11",border:"1px solid "+th.rd+"33",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.trash(th.rd)}</button>
                  </div>
                </div>;
              })}
            </div>}
            {isBosh&&memberActive.length>0&&<div style={{marginTop:active.length>0?18:0}}>
              <div style={{...S.sec,display:"flex",alignItems:"center",gap:6}}>👨‍👩‍👧‍👦 {lg==="uz"?"Oila a'zolari qarzlari":lg==="ru"?"Долги участников":"Members' debts"} ({memberActive.length})</div>
              {memberActive.map(q=>{
                const isLent=q.tur==="bergan";const color=isLent?th.gr:th.rd;
                const today=new Date().toISOString().slice(0,10);const overdue=q.qaytSana&&q.qaytSana<today;
                const owner=azolar.find(a=>a.id===q.uid);
                return <div key={q.id} style={{...S.cd,padding:"12px 14px",marginBottom:9,border:"1px solid "+th.bor,borderLeft:"3px solid "+th.ac}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:8,borderBottom:"1px solid "+th.bor}}>
                    <Av src={owner?.photo} name={owner?.ism||q.kim} size={26} ac={th.ac}/>
                    <span style={{fontSize:12,fontWeight:700,color:th.ac}}>{gN2(q.uid)}</span>
                    <span style={{fontSize:10,color:th.t2}}>{lg==="uz"?"ning qarzi":"'s debt"}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:38,height:38,borderRadius:11,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{isLent?"💰":"💸"}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:th.t1}}>{q.kim}</div>
                        <div style={{fontSize:11,color:th.t2,marginTop:2}}>{q.sana}{q.qaytSana?" → "+q.qaytSana:""}</div>
                        {q.izoh&&<div style={{fontSize:11,color:th.t2,fontStyle:"italic"}}>{q.izoh}</div>}
                        {overdue&&<div style={{fontSize:10,color:th.rd,fontWeight:700,marginTop:3}}>⚠️ {lg==="uz"?"Muddati o'tgan":"Overdue"}</div>}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,color}}>{f(q.summa,true)}</div><div style={{fontSize:10,color:th.t2,marginTop:2}}>{isLent?(lg==="uz"?"ular qarzli":"they owe"):(lg==="uz"?"qarzdor":"owes")}</div></div>
                  </div>
                </div>;
              })}
            </div>}
            {done.length>0&&<div>
              <div style={S.sec}>{lg==="uz"?"Qaytarilganlar":"Returned"} ({done.length})</div>
              {done.slice(0,8).map(q=>{const isLent=q.tur==="bergan";const dc=isLent?th.gr:th.rd;return <div key={q.id} style={{...S.cd,padding:"11px 14px",marginBottom:8,borderLeft:"3px solid "+dc+"66"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:34,height:34,borderRadius:9,background:dc+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{isLent?"💰":"💸"}</div><div><div style={{fontWeight:600,fontSize:13,color:th.t1}}>{q.kim}</div><div style={{fontSize:10,color:dc,fontWeight:600}}>{isLent?(lg==="uz"?"Qaytarib oldim":lg==="ru"?"Получено":"Got back"):(lg==="uz"?"Qaytardim":lg==="ru"?"Возвращено":"Paid back")} · {q.paidSana}</div></div></div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,fontWeight:800,color:dc}}>{isLent?"+":"−"}{f(q.summa,true)}</span><button onClick={()=>delQarz(q.id)} style={{background:"none",border:"none",cursor:"pointer"}}>{Ico.trash(th.t2)}</button></div></div></div>;})}
            </div>}
            {qarzlar.length===0&&!showAddQarz&&qarzReqs.length===0&&<div style={{textAlign:"center",padding:"44px 0",color:th.t2,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}><div style={{fontSize:48}}>💸</div><div style={{fontSize:15}}>{lg==="uz"?"Hali qarz yo'q":"No debts yet"}</div></div>}
          </div>;
        })()}
      </div>}
      {scr==="hisobot"&&<div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:14,color:th.t1}}>{tm()} {t.mr}</div>
        {!canSeeReport&&azolar.length>1&&<div style={{background:th.ac+"11",borderRadius:12,padding:"11px 14px",marginBottom:14,fontSize:12,color:th.t2,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>🔒</span>{lg==="uz"?"Siz faqat o'z hisobotingizni ko'rasiz. Umumiy oila hisoboti uchun oila boshidan ruxsat so'rang.":lg==="ru"?"Вы видите только свой отчёт.":"You see only your own report. Ask the head for full access."}</div>}
        {canSeeReport&&azolar.length>1&&(()=>{
          const totX=bX.reduce((s,x)=>s+Number(x.summa||0),0);
          const totD=bD.reduce((s,d)=>s+Number(d.summa||0),0);
          const memData=azolar.map(a=>{
            const ax=bX.filter(x=>x.uid===a.id).reduce((s,x)=>s+Number(x.summa||0),0);
            const ad=bD.filter(d=>d.uid===a.id).reduce((s,d)=>s+Number(d.summa||0),0);
            const rel=RELATIONS.find(r=>r.id===a.rel);
            return {...a,ax,ad,relEmoji:rel?rel.emoji:"👤",pctX:totX>0?Math.round(ax/totX*100):0,pctD:totD>0?Math.round(ad/totD*100):0};
          }).sort((p,q)=>q.ax-p.ax);
          return <div style={{...S.cd,background:"linear-gradient(135deg,"+th.ac+"12,"+th.ac2+"06)",border:"1.5px solid "+th.ac+"33",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:18}}>👑</span>
              <div style={{fontSize:14,fontWeight:800,color:th.ac}}>{lg==="uz"?"Oila boshi paneli":lg==="ru"?"Панель главы семьи":"Head of family panel"}</div>
            </div>
            <div style={{fontSize:11,color:th.t2,marginBottom:14}}>{lg==="uz"?"Oilaning umumiy moliyaviy ko'rinishi":lg==="ru"?"Общая картина семьи":"Family financial overview"}</div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <div style={{flex:1,background:th.gr+"12",borderRadius:12,padding:"11px 13px",textAlign:"center"}}><div style={{fontSize:9,color:th.gr,fontWeight:700,marginBottom:3}}>{lg==="uz"?"UMUMIY DAROMAD":"TOTAL INCOME"}</div><div style={{fontSize:15,fontWeight:800,color:th.gr}}>{f(totD,true)}</div></div>
              <div style={{flex:1,background:th.rd+"12",borderRadius:12,padding:"11px 13px",textAlign:"center"}}><div style={{fontSize:9,color:th.rd,fontWeight:700,marginBottom:3}}>{lg==="uz"?"UMUMIY XARAJAT":"TOTAL EXPENSE"}</div><div style={{fontSize:15,fontWeight:800,color:th.rd}}>{f(totX,true)}</div></div>
            </div>
            <div style={{fontSize:11,color:th.t2,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>{lg==="uz"?"Kim qancha sarflaydi":lg==="ru"?"Кто сколько тратит":"Who spends how much"}</div>
            {memData.map(m=>(
              <div key={m.id} style={{marginBottom:13}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <span style={{fontSize:16}}>{m.relEmoji}</span>
                  <span style={{flex:1,fontSize:13,fontWeight:600,color:th.t1}}>{m.ism}{m.id===user.id&&<span style={{color:th.ac,fontSize:10}}> ({t.me})</span>}</span>
                  <span style={{fontSize:13,fontWeight:800,color:th.rd}}>-{f(m.ax,true)}</span>
                  <span style={{fontSize:10,color:th.t2,minWidth:32,textAlign:"right"}}>{m.pctX}%</span>
                </div>
                <div style={{height:7,background:th.bg,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:m.pctX+"%",background:"linear-gradient(90deg,"+th.rd+","+th.am+")",borderRadius:4,transition:"width .5s"}}/></div>
                {m.ad>0&&<div style={{fontSize:10,color:th.gr,marginTop:3}}>{lg==="uz"?"Daromad hissasi":"Income share"}: +{f(m.ad,true)} ({m.pctD}%)</div>}
              </div>
            ))}
            <div style={{marginTop:8,padding:"11px 13px",background:th.bg,borderRadius:11,fontSize:11,color:th.t2,lineHeight:1.5}}>
              {(()=>{const top=memData[0];if(top&&top.ax>0)return lg==="uz"?"💡 Eng ko'p xarajat: "+top.ism+" ("+top.pctX+"%). Umumiy xarajatning katta qismi shu a'zoga to'g'ri keladi.":"Top spender: "+top.ism+" ("+top.pctX+"%)";return lg==="uz"?"Hali xarajatlar kam.":"Few expenses yet.";})()}
            </div>
          </div>;
        })()}
        {(()=>{
          let score=50;const checks=[];
          const ratio=jX>0?jD/jX:(jD>0?2:1);
          if(jD>=jX){score+=20;checks.push({ok:true,t:lg==="uz"?"Daromad xarajatdan ko'p":"Income exceeds expenses"});}else{score-=15;checks.push({ok:false,t:lg==="uz"?"Xarajat daromaddan ko'p":"Expenses exceed income"});}
          if(jX<=bdj){score+=15;checks.push({ok:true,t:lg==="uz"?"Budjetdan chiqmagansiz":"Within budget"});}else{score-=15;checks.push({ok:false,t:lg==="uz"?"Budjetdan oshib ketdingiz":"Over budget"});}
          const savePct=jD>0?(jD-jX)/jD*100:0;
          if(savePct>=20){score+=15;checks.push({ok:true,t:lg==="uz"?"Yaxshi jamg'arma (20%+)":"Good savings (20%+)"});}else if(savePct>0){score+=5;checks.push({ok:true,t:lg==="uz"?"Ozgina jamg'arma bor":"Some savings"});}else{checks.push({ok:false,t:lg==="uz"?"Jamg'arma yo'q":"No savings"});}
          const topKat=KATS.map((k,i)=>({nom:KN[lg][i],sum:bX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0)})).sort((a,b)=>b.sum-a.sum)[0];
          if(topKat&&jX>0&&topKat.sum/jX>0.5){score-=5;checks.push({ok:false,t:(topKat.nom)+" "+(lg==="uz"?"xarajati yuqori":"spending high")});}
          if(maq.length>0){score+=5;checks.push({ok:true,t:lg==="uz"?"Moliyaviy maqsadingiz bor":"You have goals"});}
          const activeDebt=qarzlar.filter(q=>!q.paid&&q.tur==="olgan").reduce((s,q)=>s+q.summa,0);
          if(activeDebt>0&&jD>0&&activeDebt>jD){score-=10;checks.push({ok:false,t:lg==="uz"?"Qarzingiz daromaddan ko'p":"Debt exceeds income"});}
          score=Math.max(0,Math.min(100,Math.round(score)));
          const sColor=score>=75?th.gr:score>=50?th.am:th.rd;
          const sLabel=score>=75?(lg==="uz"?"Zo'r!":"Excellent!"):score>=50?(lg==="uz"?"Yaxshi":"Good"):(lg==="uz"?"Yaxshilash kerak":"Needs work");
          if(jX===0&&jD===0)return null;
          return <div style={{...S.cd,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
              <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
                <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke={th.bor} strokeWidth="8"/><circle cx="40" cy="40" r="34" fill="none" stroke={sColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={2*Math.PI*34} strokeDashoffset={2*Math.PI*34*(1-score/100)} transform="rotate(-90 40 40)"/></svg>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:22,fontWeight:800,color:sColor}}>{score}</span><span style={{fontSize:9,color:th.t2}}>/100</span></div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:th.t2,fontWeight:600,marginBottom:2}}>{lg==="uz"?"Moliyaviy sog'liq":lg==="ru"?"Финансовое здоровье":"Financial health"}</div>
                <div style={{fontSize:18,fontWeight:800,color:sColor}}>{sLabel}</div>
              </div>
            </div>
            <div style={{borderTop:"1px solid "+th.bor,paddingTop:12}}>
              {checks.slice(0,5).map((c,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,fontSize:12,color:th.t1}}><span style={{color:c.ok?th.gr:th.am,fontSize:14,fontWeight:700,flexShrink:0}}>{c.ok?"✓":"⚠"}</span>{c.t}</div>))}
            </div>
          </div>;
        })()}
        {canSeeReport&&azolar.length>1&&<div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>{[{id:"all",ism:t.all},...azolar].map(a=><button key={a.id} onClick={()=>setHisFil(a.id)} style={S.ch(hisFil===a.id,th.ac)}>{a.ism}</button>)}</div>}
        {(()=>{
          // Ruxsatsiz a'zo faqat o'z ma'lumotini ko'radi
          const effFil=canSeeReport?hisFil:user?.id;
          const fX=effFil==="all"?bX:bX.filter(x=>x.uid===effFil);
          const fD=effFil==="all"?bD:bD.filter(d=>d.uid===effFil);
          const fjX=fX.reduce((s,x)=>s+Number(x.summa||0),0),fjD=fD.reduce((s,d)=>s+Number(d.summa||0),0),fb=fjD-fjX;
          return <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}><SC label={t.inc} value={f(fjD,true)} color={th.gr}/><SC label={t.exp} value={f(fjX,true)} color={th.rd}/><SC label={t.bud} value={f(bdj,true)} color={th.ac}/><SC label={t.bal} value={(fb<0?"-":"")+f(Math.abs(fb),true)} color={fb>=0?th.gr:th.rd}/></div>
            {fjX>0&&<div><SL ch={t.ed}/>{KATS.map((k,i)=>{const tx=fX.filter(x=>x.kategoriya===k.id).reduce((s,x)=>s+Number(x.summa||0),0);if(!tx)return null;return <div key={k.id} style={{...S.cd,padding:"9px 12px",display:"flex",alignItems:"center",gap:9,marginBottom:7}}><div style={{width:32,height:32,borderRadius:9,background:k.c+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><KatIco id={k.id} c={k.c} s={17}/></div><div style={{flex:1}}><div style={{...S.row,marginBottom:3}}><span style={{fontSize:12,fontWeight:600,color:th.t1}}>{KN[lg][i]}</span><span style={{fontSize:12,fontWeight:700,color:k.c}}>{f(tx,true)}</span></div><div style={{background:th.bg,borderRadius:4,height:6}}><div style={{width:fjX>0?Math.min(100,(tx/fjX)*100)+"%":"0%",height:"100%",background:k.c,borderRadius:4}}/></div><div style={{fontSize:9,color:th.t2,marginTop:2}}>{fjX>0?Math.round((tx/fjX)*100):0}%</div></div></div>;})}</div>}
            {fjD>0&&<div><SL ch={t.isr}/>{DARS.map((d,i)=>{const tx=fD.filter(x=>x.tur===d.id).reduce((s,x)=>s+Number(x.summa||0),0);if(!tx)return null;return <div key={d.id} style={{...S.cd,padding:"9px 12px",...S.row,marginBottom:7}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:32,height:32,borderRadius:9,background:d.c+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><DarIco id={d.id} c={d.c} s={17}/></div><span style={{fontSize:13,fontWeight:600,color:th.t1}}>{DN[lg][i]}</span></div><span style={{fontWeight:700,color:th.gr,fontSize:13}}>+{f(tx,true)}</span></div>;})}</div>}
            {hisFil==="all"&&canSeeReport&&azolar.length>1&&<div><SL ch={t.bm}/>{azolar.map(a=>{const ax=bX.filter(x=>x.uid===a.id).reduce((s,x)=>s+Number(x.summa||0),0);const ad=bD.filter(d=>d.uid===a.id).reduce((s,d)=>s+Number(d.summa||0),0);return <div key={a.id} style={{...S.cd,padding:"12px 14px",marginBottom:8}}><div style={{...S.row,marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8}}><Av src={a.photo} name={a.ism} size={32} ac={th.ac}/><span style={{fontWeight:700,fontSize:14,color:th.t1}}>{a.ism}{a.id===user.id&&<span style={{color:th.ac,fontSize:10}}> ({t.me})</span>}</span></div><span style={{fontSize:10,color:th.t2}}>{a.rol==="bosh"?t.hd:t.mb2}</span></div><div style={{display:"flex",gap:12}}><span style={{fontSize:12,color:th.gr,fontWeight:600}}>+{f(ad,true)}</span><span style={{fontSize:12,color:th.rd,fontWeight:600}}>-{f(ax,true)}</span><span style={{fontSize:12,fontWeight:700,color:ad-ax>=0?th.gr:th.rd}}>{ad-ax<0?"-":""}{f(Math.abs(ad-ax),true)}</span></div></div>;})}</div>}
            {hisFil==="all"&&canSeeReport&&azolar.length>1&&(()=>{
              const memStats=azolar.map(a=>{
                const ax=bX.filter(x=>x.uid===a.id).reduce((s,x)=>s+Number(x.summa||0),0);
                const ad=bD.filter(d=>d.uid===a.id).reduce((s,d)=>s+Number(d.summa||0),0);
                const cnt=bX.filter(x=>x.uid===a.id).length+bD.filter(d=>d.uid===a.id).length;
                return {...a,ax,ad,bal:ad-ax,cnt};
              });
              const topSaver=[...memStats].sort((p,q)=>q.bal-p.bal)[0];
              const lowSpender=[...memStats].filter(m=>m.ax>0).sort((p,q)=>p.ax-q.ax)[0];
              const mostActive=[...memStats].sort((p,q)=>q.cnt-p.cnt)[0];
              const awards=[];
              if(topSaver&&topSaver.bal>0)awards.push({emoji:"🏆",color:"#f59e0b",titleUz:"Eng ko'p tejagan",titleRu:"Лучший экономист",titleEn:"Top saver",who:topSaver,val:"+"+f(topSaver.bal,true)});
              if(lowSpender&&mostActive&&lowSpender.id!==(topSaver&&topSaver.id))awards.push({emoji:"💎",color:"#10b981",titleUz:"Eng kam xarajat",titleRu:"Меньше всех тратит",titleEn:"Lowest spender",who:lowSpender,val:f(lowSpender.ax,true)});
              if(mostActive&&mostActive.cnt>0)awards.push({emoji:"⚡",color:"#6366f1",titleUz:"Eng faol a'zo",titleRu:"Самый активный",titleEn:"Most active",who:mostActive,val:mostActive.cnt+(lg==="uz"?" yozuv":" records")});
              if(awards.length===0)return null;
              return <div style={{...S.cd,background:"linear-gradient(135deg,#f59e0b0d,#ec489908)",border:"1.5px solid #f59e0b33",marginBottom:14,marginTop:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><span style={{fontSize:18}}>🏅</span><div style={{fontSize:14,fontWeight:800,color:"#f59e0b"}}>{lg==="uz"?"Oilaviy reyting":lg==="ru"?"Семейный рейтинг":"Family ranking"}</div></div>
                <div style={{fontSize:11,color:th.t2,marginBottom:14}}>{tm()} · {lg==="uz"?"Bu oy yutuqlari":lg==="ru"?"Достижения месяца":"This month's achievements"}</div>
                {awards.map((aw,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:th.sur,borderRadius:13,padding:"11px 14px",marginBottom:9,border:"1px solid "+aw.color+"33"}}>
                    <div style={{width:42,height:42,borderRadius:12,background:aw.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{aw.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,color:aw.color,fontWeight:700,marginBottom:2}}>{lg==="uz"?aw.titleUz:lg==="ru"?aw.titleRu:aw.titleEn}</div>
                      <div style={{fontSize:14,fontWeight:700,color:th.t1,display:"flex",alignItems:"center",gap:6}}><Av src={aw.who.photo} name={aw.who.ism} size={20} ac={aw.color}/>{aw.who.ism}{aw.who.id===user.id&&<span style={{fontSize:9,color:aw.color}}>({t.me})</span>}</div>
                    </div>
                    <div style={{fontSize:13,fontWeight:800,color:aw.color,flexShrink:0,textAlign:"right"}}>{aw.val}</div>
                  </div>
                ))}
                <div style={{fontSize:10,color:th.t2,textAlign:"center",marginTop:6,fontStyle:"italic"}}>{lg==="uz"?"💪 Oilaviy tejamkorlikni rag'batlantiring!":lg==="ru"?"💪 Поощряйте семейную экономию!":"💪 Encourage family savings!"}</div>
              </div>;
            })()}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:6}}>
              <button onClick={exportExcel} disabled={exportLoading} style={{...S.bt("#10b981","#059669"),marginBottom:0,display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:exportLoading?.6:1}}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white" opacity=".2"/><path d="M5 6l2.5 3L5 12M9 12h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {exportLoading?"...":"Excel"}{!isPremium&&<span style={{position:"absolute",top:-6,right:-6,fontSize:8,background:"#f59e0b",color:"#fff",borderRadius:8,padding:"1px 5px",fontWeight:800}}>PRO</span>}
              </button>
              <button onClick={exportPDF} style={{...S.bt("#ef4444","#dc2626"),marginBottom:0,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white" opacity=".2"/><path d="M5 4h5l3 3v7H5V4z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/><line x1="7" y1="10" x2="11" y2="10" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                PDF{!isPremium&&<span style={{position:"absolute",top:-6,right:-6,fontSize:8,background:"#f59e0b",color:"#fff",borderRadius:8,padding:"1px 5px",fontWeight:800}}>PRO</span>}
              </button>
            </div>
            <button onClick={aiAdv} style={{...S.bt(),marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{Ico.brain(th.ac)}{t.aa}</button>
          </div>;
        })()}
      </div>}
      {scr==="admin"&&isAdmin&&<div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
          <span style={{fontSize:22}}>🛠️</span>
          <div style={{fontSize:18,fontWeight:800,color:th.t1}}>{lg==="uz"?"Admin Panel":lg==="ru"?"Админ Панель":"Admin Panel"}</div>
          <span style={{fontSize:9,background:"#f43f5e",color:"#fff",borderRadius:8,padding:"2px 7px",fontWeight:800}}>MAXFIY</span>
        </div>
        {adminLoad?<div style={{textAlign:"center",padding:"64px 0",color:th.t2}}>{lg==="uz"?"Yuklanmoqda...":"Loading..."}</div>:adminStats&&<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:14}}>
            <div style={{...S.cd,margin:0,textAlign:"center",background:"linear-gradient(135deg,"+th.ac+"15,"+th.ac2+"08)",border:"1px solid "+th.ac+"33"}}>
              <div style={{fontSize:32,fontWeight:800,color:th.ac}}>{adminStats.totalUsers}</div>
              <div style={{fontSize:11,color:th.t2,fontWeight:600,marginTop:2}}>{lg==="uz"?"Jami foydalanuvchi":"Total users"}</div>
            </div>
            <div style={{...S.cd,margin:0,textAlign:"center",background:"linear-gradient(135deg,"+th.gr+"15,"+th.gr+"08)",border:"1px solid "+th.gr+"33"}}>
              <div style={{fontSize:32,fontWeight:800,color:th.gr}}>{adminStats.totalOilas}</div>
              <div style={{fontSize:11,color:th.t2,fontWeight:600,marginTop:2}}>{lg==="uz"?"Jami oila":"Total families"}</div>
            </div>
          </div>
          <div style={{...S.cd,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:th.t1,marginBottom:12}}>📈 {lg==="uz"?"Yangi qo'shilganlar":"New signups"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:th.ac}}>{adminStats.todayU}</div><div style={{fontSize:10,color:th.t2}}>{lg==="uz"?"Bugun":"Today"}</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:th.am}}>{adminStats.weekU}</div><div style={{fontSize:10,color:th.t2}}>{lg==="uz"?"7 kun":"7 days"}</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:th.gr}}>{adminStats.monthU}</div><div style={{fontSize:10,color:th.t2}}>{lg==="uz"?"30 kun":"30 days"}</div></div>
            </div>
          </div>
          <div style={{...S.cd,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:th.t1,marginBottom:12}}>💰 {lg==="uz"?"Moliyaviy faollik":"Financial activity"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Jami daromad kiritilgan":"Total income"}</span><span style={{fontSize:14,fontWeight:700,color:th.gr}}>{f(adminStats.totD,true)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Jami xarajat kiritilgan":"Total expenses"}</span><span style={{fontSize:14,fontWeight:700,color:th.rd}}>{f(adminStats.totX,true)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid "+th.bor,paddingTop:9}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Yozuvlar soni":"Records"}</span><span style={{fontSize:13,fontWeight:700,color:th.t1}}>{adminStats.xCount+adminStats.dCount} ({lg==="uz"?"X:":""}{adminStats.xCount} / D:{adminStats.dCount})</span></div>
            </div>
          </div>
          <div style={{...S.cd,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:th.t1,marginBottom:12}}>📊 {lg==="uz"?"Boshqa":"Other"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Premium oilalar":"Premium families"}</span><span style={{fontSize:13,fontWeight:700,color:"#f59e0b"}}>⭐ {adminStats.premOilas}</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"O'rtacha a'zo/oila":"Avg members/family"}</span><span style={{fontSize:13,fontWeight:700,color:th.t1}}>{adminStats.avgPerOila}</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Jami yozuvlar (DB)":"Total DB docs"}</span><span style={{fontSize:13,fontWeight:700,color:th.t1}}>{adminStats.docCount}</span></div>
            </div>
          </div>
          <div style={{...S.cd,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:th.t1}}>💬 {lg==="uz"?"Foydalanuvchi fikrlari":"User feedback"} ({adminStats.fbCount||0})</div>
              {adminStats.avgRating>0&&<div style={{fontSize:13,fontWeight:700,color:"#f59e0b"}}>⭐ {adminStats.avgRating}</div>}
            </div>
            {(!adminStats.feedbacks||adminStats.feedbacks.length===0)?<div style={{fontSize:12,color:th.t2,textAlign:"center",padding:"16px 0"}}>{lg==="uz"?"Hali fikr yo'q":"No feedback yet"}</div>:
            <div style={{maxHeight:"40vh",overflowY:"auto"}}>
              {adminStats.feedbacks.map((fb,i)=>(
                <div key={i} style={{background:th.bg,borderRadius:11,padding:"11px 13px",marginBottom:8,border:"1px solid "+th.bor}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                    <div style={{fontSize:12,fontWeight:700,color:th.t1}}>{fb.ism||(lg==="uz"?"Anonim":"Anonymous")}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      {fb.rating>0&&<span style={{fontSize:11,color:"#f59e0b"}}>{"⭐".repeat(fb.rating)}</span>}
                      <span style={{fontSize:9,background:(fb.type==="kamchilik"?th.rd:fb.type==="maqtov"?th.gr:th.ac)+"22",color:fb.type==="kamchilik"?th.rd:fb.type==="maqtov"?th.gr:th.ac,borderRadius:6,padding:"2px 7px",fontWeight:700}}>{fb.type==="kamchilik"?(lg==="uz"?"Kamchilik":"Bug"):fb.type==="maqtov"?(lg==="uz"?"Maqtov":"Praise"):(lg==="uz"?"Taklif":"Idea")}</span>
                    </div>
                  </div>
                  {fb.text&&<div style={{fontSize:12,color:th.t2,lineHeight:1.5}}>{fb.text}</div>}
                  <div style={{fontSize:9,color:th.t2,marginTop:5,opacity:.7}}>{(fb.sana||"").slice(0,10)}</div>
                </div>
              ))}
            </div>}
          </div>
        </div>}
        <button onClick={loadAdminStats} style={{...S.bt(),display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{Ico.repeat("#fff")}{lg==="uz"?"Yangilash":"Refresh"}</button>
      </div>}
      {scr==="maslahat"&&<div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:18,color:th.t1}}>{t.aa}</div>
        {advL?<div style={{textAlign:"center",padding:"64px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>{Ico.brain(th.ac)}<div style={{color:th.t2}}>{t.an}</div></div>:adv&&<div style={{...S.cd,lineHeight:1.85,fontSize:14,color:th.t1,whiteSpace:"pre-wrap"}}>{adv}</div>}
        {!advL&&<button onClick={aiAdv} style={{...S.bt(),marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{Ico.repeat(th.ac)}{t.na}</button>}
      </div>}
      {scr==="profil"&&<div>
        {pTab==="main"&&<div>
          <div style={{...S.row,marginBottom:20}}>
            <div style={{fontSize:20,fontWeight:800,color:th.t1}}>{t.prf}</div>
            <button onClick={logout} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:th.rd,fontWeight:700,fontSize:14}}>{Ico.door(th.rd)}{t.lo}</button>
          </div>
          {isAdmin&&<button onClick={loadAdminStats} style={{width:"100%",background:"linear-gradient(135deg,#1e293b,#0f172a)",border:"1px solid #f43f5e44",borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <span style={{fontSize:24}}>🛠️</span>
            <div style={{flex:1,textAlign:"left"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{lg==="uz"?"Admin Panel":"Admin Panel"}</div>
              <div style={{fontSize:11,color:"#94a3b8"}}>{lg==="uz"?"Ilova statistikasi (faqat siz)":"App statistics (you only)"}</div>
            </div>
            <span style={{fontSize:18,color:"#64748b"}}>›</span>
          </button>}
          <div style={{background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",borderRadius:20,padding:"20px 18px",marginBottom:18,display:"flex",alignItems:"center",gap:14,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.08)",pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <Av src={user?.photo} name={user?.ism} size={64} ac="#fff"/>
              <button onClick={()=>fRef.current?.click()} style={{position:"absolute",bottom:-2,right:-2,width:22,height:22,borderRadius:"50%",background:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,.2)"}}>{Ico.camera(th.ac)}</button>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.ism}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginTop:3}}>{user?.email}</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.18)",borderRadius:20,padding:"3px 10px",marginTop:7,fontSize:11,color:"#fff",fontWeight:600}}>
                {user?.rol==="bosh"?Ico.crown("#fff"):Ico.user("#fff")}
                {user?.rol==="bosh"?(lg==="uz"?"Oila boshlig'i":lg==="ru"?"\u0413\u043b\u0430\u0432\u0430 \u0441\u0435\u043c\u044c\u0438":"Family head"):(lg==="uz"?"A'zo":lg==="ru"?"\u0423\u0447\u0430\u0441\u0442\u043d\u0438\u043a":"Member")}
              </div>
            </div>
          </div>
          <div style={{fontSize:11,color:th.t2,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:10,paddingLeft:4}}>{t.qoshimcha}</div>
          {[
            {id:"shaxsiy",label:t.shaxsiy,ico:Ico.user(th.ac)},
            ...(user?.rol==="bosh"?[{id:"budjet",label:lg==="uz"?"Budjet va limitlar":lg==="ru"?"Бюджет и лимиты":"Budget & limits",ico:Ico.wallet(th.ac)}]:[]),
            {id:"ilovaS", label:t.ilovaS, ico:Ico.settings(th.ac)},
            {id:"xav",    label:t.xav,    ico:Ico.shield(th.ac)},
            {id:"qol",    label:t.qol,    ico:Ico.help(th.ac)},
          ].map(item=>(
            <button key={item.id} onClick={()=>setPTab(item.id)} style={{width:"100%",background:th.sur,border:"1px solid "+th.bor,borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:10,textAlign:"left"}}>
              <div style={{width:40,height:40,borderRadius:12,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.ico}</div>
              <span style={{flex:1,fontSize:15,fontWeight:600,color:th.t1}}>{item.label}</span>
              {Ico.right(th.t2)}
            </button>
          ))}
          <button onClick={()=>setShowReferral(true)} style={{width:"100%",background:"linear-gradient(135deg,#10b98115,#05966908)",border:"1.5px solid #10b98144",borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:10,textAlign:"left"}}>
            <div style={{width:40,height:40,borderRadius:12,background:"#10b98122",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20}}>🎁</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:th.gr}}>{lg==="uz"?"Do'stlarni taklif qiling":lg==="ru"?"Пригласить друзей":"Invite friends"}</div><div style={{fontSize:11,color:th.t2,marginTop:2}}>{lg==="uz"?"3 ta do'st = 1 oy Premium bepul!":"3 friends = 1 month Premium free!"}</div></div>
            {Ico.right(th.gr)}
          </button>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.version(th.ac)}</div>
            <span style={{flex:1,fontSize:15,fontWeight:600,color:th.t1}}>{t.ver}</span>
            <span style={{fontSize:13,color:th.t2,fontWeight:600}}>v{APP_VER}</span>
          </div>
        </div>}
        {pTab==="shaxsiy"&&<div>
          <BH label={t.shaxsiy} th={th} onBack={()=>setPTab("main")}/>
          <div style={{...S.cd,textAlign:"center",padding:"22px 16px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
              <div style={{position:"relative",padding:4,borderRadius:"50%",background:isPremium?"linear-gradient(135deg,#f59e0b,#ec4899,#6366f1)":"linear-gradient(135deg,"+th.ac+","+th.ac2+")"}}>
                <div style={{padding:3,borderRadius:"50%",background:th.sur}}>
                  <Av src={user?.photo} name={user?.ism} size={78} ac={th.ac}/>
                </div>
                <button onClick={()=>fRef.current?.click()} style={{position:"absolute",bottom:2,right:2,width:26,height:26,borderRadius:"50%",background:th.ac,border:"2px solid "+th.sur,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ico.camera("#fff")}</button>
              </div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button onClick={()=>fRef.current?.click()} style={{background:th.ac+"18",border:"1px solid "+th.ac+"44",borderRadius:10,padding:"7px 14px",color:th.ac,cursor:"pointer",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:4}}>{Ico.camera(th.ac)}{t.up}</button>
              {user?.photo&&<button onClick={rmPhoto} style={{background:th.rd+"18",border:"1px solid "+th.rd+"44",borderRadius:10,padding:"7px 14px",color:th.rd,cursor:"pointer",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:4}}>{Ico.trash(th.rd)}{t.rp}</button>}
            </div>
          </div>
          <div style={S.cd}>
            <div style={{...S.row,marginBottom:edN?12:0}}>
              <div><div style={{fontSize:10,color:th.t2,marginBottom:2,textTransform:"uppercase",letterSpacing:1}}>{lg==="uz"?"Ism":"Name"}</div><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{user?.ism}</div></div>
              <button onClick={()=>{setEdN(v=>!v);setNewN(user?.ism||"");}} style={{background:th.ac+"18",border:"1px solid "+th.ac+"44",borderRadius:9,padding:"6px 12px",color:th.ac,cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>{Ico.edit(th.ac)}{edN?t.cn:t.ep}</button>
            </div>
            {edN&&<div><div style={{height:10}}/><input style={S.ip} value={newN} onChange={e=>setNewN(e.target.value)} placeholder="Ism" autoFocus/><button onClick={updName} style={S.bt()}>{t.un}</button></div>}
          </div>
          <div style={S.cd}><div style={{fontSize:10,color:th.t2,marginBottom:2,textTransform:"uppercase",letterSpacing:1}}>Email</div><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{user?.email}</div></div>
          <div style={S.cd}><div style={{fontSize:13,fontWeight:700,color:th.t1,marginBottom:10}}>{lg==="uz"?"Bu oy statistikasi":"Stats"}</div>{[{l:lg==="uz"?"Xarajat":"Expense",v:f(bX.filter(x=>x.uid===user.id).reduce((s,x)=>s+Number(x.summa||0),0),true),c:th.rd},{l:lg==="uz"?"Daromad":"Income",v:f(bD.filter(d=>d.uid===user.id).reduce((s,d)=>s+Number(d.summa||0),0),true),c:th.gr},{l:lg==="uz"?"Jami yozuvlar":"Total records",v:xar.filter(x=>x.uid===user.id).length+" ta",c:th.ac}].map(item=><div key={item.l} style={{...S.row,padding:"8px 0",borderBottom:"1px solid "+th.bor}}><span style={{fontSize:12,color:th.t2}}>{item.l}</span><span style={{fontSize:13,fontWeight:700,color:item.c}}>{item.v}</span></div>)}</div>
          {user?.rol==="bosh"&&<div style={{...S.cd,background:th.ac+"0d",border:"1px solid "+th.ac+"33"}}><div style={{fontSize:11,color:th.t2,marginBottom:5,fontWeight:600}}>{Ico.key(th.ac)}{t.fc2}</div><div style={{fontFamily:"monospace",fontSize:12,color:th.ac,wordBreak:"break-all",fontWeight:700}}>{oila?.id}</div><div style={{fontSize:10,color:th.t2,marginTop:5}}>{t.fcd}</div></div>}
          {user?.rol==="bosh"&&<button onClick={()=>{buzz(10);setShowAddKid(true);}} style={{...S.cd,width:"100%",background:"linear-gradient(135deg,#f59e0b0d,#ec48990d)",border:"1px solid #f59e0b33",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
            <div style={{width:42,height:42,borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>\ud83d\udc76</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:th.t1}}>{lg==="uz"?"Bola akkaunti qo'shish":lg==="ru"?"Добавить ребёнка":"Add kid account"}</div>
              <div style={{fontSize:11,color:th.t2,marginTop:2}}>{lg==="uz"?"Farzandingizga login yarating":"Create a login for your child"}</div>
            </div>
            <span style={{fontSize:18,color:th.t2}}>\u203a</span>
          </button>}
          {user?.rol==="bosh"&&azolar.length>1&&<div style={{...S.cd}}>
            <div style={{fontSize:13,fontWeight:700,color:th.t1,marginBottom:3,display:"flex",alignItems:"center",gap:6}}>👨‍👩‍👧‍👦 {lg==="uz"?"Oila a'zolari va ruxsatlar":lg==="ru"?"Участники и доступы":"Members & access"}</div>
            <div style={{fontSize:10,color:th.t2,marginBottom:12}}>{lg==="uz"?"Kimga umumiy hisobotni ko'rishga ruxsat berasiz?":"Who can view the full family report?"}</div>
            {azolar.map(a=>{const isBosh=a.rol==="bosh";const hasAccess=isBosh||(oila?.reportAccess||[]).includes(a.id);const rel=RELATIONS.find(r=>r.id===a.rel);return(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid "+th.bor}}>
                <Av src={a.photo} name={a.ism} size={34} ac={th.ac}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:th.t1}}>{a.ism}{a.id===user.id&&<span style={{color:th.ac,fontSize:10}}> ({t.me})</span>}</div>
                  <div style={{fontSize:10,color:th.t2}}>{rel?(rel.emoji+" "+(rel[lg]||rel.uz)):(isBosh?t.hd:t.mb2)}</div>
                </div>
                {isBosh?<span style={{fontSize:10,color:th.ac,fontWeight:700,background:th.ac+"15",borderRadius:8,padding:"4px 10px"}}>{lg==="uz"?"Oila boshi":"Head"}</span>:
                  <button onClick={()=>toggleReportAccess(a.id)} style={{width:46,height:26,borderRadius:13,border:"none",cursor:"pointer",background:hasAccess?th.gr:th.bor,position:"relative",transition:"background .2s"}}>
                    <span style={{position:"absolute",top:3,left:hasAccess?23:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                  </button>}
              </div>
            );})}
            <div style={{fontSize:10,color:th.t2,marginTop:10,fontStyle:"italic"}}>{lg==="uz"?"💡 Yashil = umumiy hisobotni ko'ra oladi":"💡 Green = can see full report"}</div>
          </div>}
          {azolar.length>0&&<div style={S.cd}><div style={{fontWeight:700,marginBottom:12,color:th.t1}}>{t.fam}: {oila?.nomi}</div>{azolar.map(a=><div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid "+th.bor}}><Av src={a.photo} name={a.ism} size={34} ac={th.ac}/><div style={{flex:1}}><div style={{fontSize:13,color:th.t1,fontWeight:600}}>{a.ism}{a.id===user.id&&<span style={{color:th.ac,fontSize:10}}> ({t.me})</span>}</div><div style={{fontSize:10,color:th.t2}}>{a.email}</div></div><span style={{fontSize:10,color:a.rol==="bosh"?th.am:th.t2,background:a.rol==="bosh"?th.am+"18":th.bg,padding:"3px 9px",borderRadius:20,fontWeight:600}}>{a.rol==="bosh"?t.hd:t.mb2}</span></div>)}</div>}

        </div>}
        {pTab==="budjet"&&<div>
          <BH label={lg==="uz"?"Budjet va limitlar":lg==="ru"?"Бюджет и лимиты":"Budget & limits"} th={th} onBack={()=>setPTab("main")}/>
          <div style={{...S.cd,background:"linear-gradient(135deg,"+th.ac+"15,"+th.ac2+"08)",border:"1.5px solid "+th.ac+"33"}}>
            <div style={{fontSize:13,fontWeight:700,color:th.ac,marginBottom:4,display:"flex",alignItems:"center",gap:6}}>{Ico.wallet(th.ac)}{lg==="uz"?"Oylik budjet":"Monthly budget"}</div>
            <div style={{fontSize:11,color:th.t2,marginBottom:14}}>{lg==="uz"?"Bu oy uchun umumiy xarajat chegarasi":"Total spending limit this month"}</div>
            <label style={S.lb}>{t.mb}</label>
            <MoneyInput style={{...S.ip,fontSize:22,fontWeight:800,textAlign:"center",marginBottom:4}} value={fBj} onChange={setFBj} placeholder="2 000 000"/>
            <div style={{fontSize:11,color:th.t2,textAlign:"center"}}>{f(Number(fBj)||0,false)}</div>
          </div>
          {(()=>{
            const bjNum=Number(fBj)||0;
            const avgInc=jD>0?jD:0;
            if(bjNum>0&&avgInc>0&&bjNum>avgInc){
              return <div style={{background:th.rd+"11",border:"1.5px solid "+th.rd+"44",borderRadius:14,padding:"13px 15px",marginBottom:12,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:20,flexShrink:0}}>⚠️</span>
                <div><div style={{fontSize:13,fontWeight:700,color:th.rd,marginBottom:3}}>{lg==="uz"?"Budjet daromaddan yuqori!":lg==="ru"?"Бюджет выше дохода!":"Budget exceeds income!"}</div><div style={{fontSize:11,color:th.t2,lineHeight:1.5}}>{lg==="uz"?"Bu oy daromadingiz "+f(avgInc,true)+", lekin budjet "+f(bjNum,true)+". Daromaddan ko'p sarflash qarzga olib keladi.":lg==="ru"?"Доход "+f(avgInc,true)+", бюджет "+f(bjNum,true):"Income "+f(avgInc,true)+", budget "+f(bjNum,true)}</div></div>
              </div>;
            }
            return null;
          })()}
          {jD>0&&<div style={{background:th.gr+"0d",border:"1px solid "+th.gr+"33",borderRadius:14,padding:"14px 15px",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:th.gr,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>💡 {lg==="uz"?"50/30/20 qoidasi bo'yicha taklif":lg==="ru"?"Правило 50/30/20":"50/30/20 rule"}</div>
            <div style={{fontSize:11,color:th.t2,marginBottom:12,lineHeight:1.5}}>{lg==="uz"?"Daromadingiz ("+f(jD,true)+") asosida tavsiya:":lg==="ru"?"На основе дохода ("+f(jD,true)+"):":"Based on income ("+f(jD,true)+"):"}</div>
            {[{p:50,c:"#10b981",uz:"Ehtiyojlar (oziq, uy, transport)",ru:"Нужды",en:"Needs"},{p:30,c:"#f59e0b",uz:"Xohishlar (ko'ngilochar, kiyim)",ru:"Желания",en:"Wants"},{p:20,c:"#6366f1",uz:"Jamg'arma va maqsadlar",ru:"Сбережения",en:"Savings"}].map(r=>(
              <div key={r.p} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:38,height:24,borderRadius:6,background:r.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:r.c,flexShrink:0}}>{r.p}%</div>
                <span style={{flex:1,fontSize:11,color:th.t1}}>{lg==="uz"?r.uz:lg==="ru"?r.ru:r.en}</span>
                <span style={{fontSize:12,fontWeight:700,color:r.c}}>{f(Math.round(jD*r.p/100),true)}</span>
              </div>
            ))}
            <button onClick={()=>setFBj(String(Math.round(jD*0.8)))} style={{width:"100%",marginTop:8,background:th.gr+"15",border:"1px solid "+th.gr+"44",borderRadius:10,padding:"9px",color:th.gr,cursor:"pointer",fontWeight:700,fontSize:12}}>{lg==="uz"?"Budjetni 80% ("+f(Math.round(jD*0.8),true)+") qilib o'rnatish":lg==="ru"?"Установить 80%":"Set budget to 80%"}</button>
          </div>}
          <div style={S.cd}>
            <div style={{fontWeight:700,marginBottom:6,color:th.t1}}>{lg==="uz"?"Kategoriya limitlari":"Category limits"}</div>
            <div style={{fontSize:11,color:th.t2,marginBottom:14}}>{lg==="uz"?"Har bir kategoriya uchun alohida chegara (ixtiyoriy)":"Separate limit per category (optional)"}</div>
            {KATS.map((k,i)=>(
              <div key={k.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:k.c+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><KatIco id={k.id} c={k.c} s={18}/></div>
                <span style={{fontSize:13,color:th.t1,flex:1,fontWeight:500}}>{KN[lg][i]}</span>
                <input type="number" style={{width:120,background:th.bg,border:"1.5px solid "+th.bor,borderRadius:10,padding:"8px 12px",color:th.t1,fontSize:13,outline:"none",textAlign:"right"}} value={fKL[k.id]||""} onChange={e=>setFKL(p=>({...p,[k.id]:Number(e.target.value)||0}))} placeholder="—"/>
              </div>
            ))}
          </div>
          {(()=>{
            const limTotal=KATS.reduce((s,k)=>s+(Number(fKL[k.id])||0),0);
            const bjNum=Number(fBj)||0;
            if(limTotal>0&&bjNum>0&&limTotal>bjNum){
              return <div style={{background:th.am+"11",border:"1.5px solid "+th.am+"44",borderRadius:14,padding:"13px 15px",marginBottom:12,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:20,flexShrink:0}}>⚠️</span>
                <div><div style={{fontSize:13,fontWeight:700,color:th.am,marginBottom:3}}>{lg==="uz"?"Limitlar budjetdan oshdi":lg==="ru"?"Лимиты превышают бюджет":"Limits exceed budget"}</div><div style={{fontSize:11,color:th.t2,lineHeight:1.5}}>{lg==="uz"?"Kategoriya limitlari jami "+f(limTotal,true)+", umumiy budjet esa "+f(bjNum,true)+". Limitlarni kamaytiring yoki budjetni oshiring.":lg==="ru"?"Сумма лимитов "+f(limTotal,true)+" > бюджет "+f(bjNum,true):"Limits total "+f(limTotal,true)+" > budget "+f(bjNum,true)}</div></div>
              </div>;
            }
            if(limTotal>0&&bjNum>0){
              return <div style={{background:th.gr+"0d",borderRadius:12,padding:"11px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:12,color:th.t2}}>{lg==="uz"?"Limitlar jami":lg==="ru"?"Сумма лимитов":"Limits total"}</span><span style={{fontSize:13,fontWeight:700,color:th.gr}}>{f(limTotal,true)} / {f(bjNum,true)}</span></div>;
            }
            return null;
          })()}
          <button onClick={saveBj} style={{...S.bt(),display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{Ico.check("#fff")}{t.sv}</button>
        </div>}
        {pTab==="ilovaS"&&<div>
          <BH label={t.ilovaS} th={th} onBack={()=>setPTab("main")}/>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,overflow:"hidden",marginBottom:12}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+th.bor}}>
              <div style={{width:38,height:38,borderRadius:11,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.globe(th.ac)}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{t.til}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{lg==="uz"?"O'zbek":lg==="ru"?"\u0420\u0443\u0441\u0441\u043a\u0438\u0439":"English"}</div></div>
            </div>
            <div style={{padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{id:"uz",l:"\ud83c\uddfa\ud83c\uddff O'zbek"},{id:"ru",l:"\ud83c\uddf7\ud83c\uddfa \u0420\u0443\u0441\u0441\u043a\u0438\u0439"},{id:"kk",l:"\ud83c\uddf0\ud83c\uddff Qaraqalpaq"},{id:"en",l:"\ud83c\uddec\ud83c\udde7 English"}].map(l=>(
                <button key={l.id} onClick={()=>{const nl=l.id==="kk"?"uz":l.id;setLg(nl);localStorage.setItem("oilaV7L",nl);}} style={{background:lg===l.id?th.ac+"18":th.bg,border:"2px solid "+(lg===l.id?th.ac:th.bor),borderRadius:11,padding:"10px 8px",color:lg===l.id?th.ac:th.t2,cursor:"pointer",fontWeight:700,fontSize:12}}>{l.l}</button>
              ))}
            </div>
          </div>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,overflow:"hidden",marginBottom:12}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid "+th.bor}}>
              <div style={{width:38,height:38,borderRadius:11,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{dark?Ico.moon(th.ac):Ico.sun(th.ac)}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{t.mavzu}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{dark?t.tungi:t.kunduzi}</div></div>
            </div>
            <div style={{padding:"12px 16px",display:"flex",gap:8}}>
              {[{v:false,l:"\u2600\ufe0f "+t.kunduzi},{v:true,l:"\ud83c\udf19 "+t.tungi}].map(m=>(
                <button key={String(m.v)} onClick={()=>{setDark(m.v);localStorage.setItem("oilaV7D",String(m.v));}} style={{flex:1,background:dark===m.v?th.ac+"18":th.bg,border:"2px solid "+(dark===m.v?th.ac:th.bor),borderRadius:11,padding:"11px 8px",color:dark===m.v?th.ac:th.t2,cursor:"pointer",fontWeight:700,fontSize:13}}>{m.l}</button>
              ))}
            </div>
          </div>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,overflow:"hidden",marginBottom:12}}>
            <button onClick={()=>setShowValDD(v=>!v)} style={{width:"100%",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer"}}>
              <div style={{width:38,height:38,borderRadius:11,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.money(th.ac)}</div>
              <div style={{flex:1,textAlign:"left"}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{lg==="uz"?"Valyuta":"\u0412\u0430\u043b\u044e\u0442\u0430"}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{val.b} {val.id.toUpperCase()}</div></div>
              <div style={{transform:showValDD?"rotate(180deg)":"none",transition:"transform .2s"}}>{Ico.chevron(th.t2,false)}</div>
            </button>
            {showValDD&&<div style={{borderTop:"1px solid "+th.bor,maxHeight:280,overflowY:"auto"}}>
              {VALS.map(v=><button key={v.id} onClick={()=>{setVal(v);localStorage.setItem("oilaV7V",v.id);setShowValDD(false);}} style={{width:"100%",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,background:val.id===v.id?th.ac+"11":"none",border:"none",borderBottom:"1px solid "+th.bor,cursor:"pointer"}}>
                <div style={{width:34,height:34,borderRadius:9,background:(val.id===v.id?th.ac:th.t2)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:val.id===v.id?th.ac:th.t2,flexShrink:0}}>{v.b}</div>
                <span style={{flex:1,textAlign:"left",fontSize:14,fontWeight:600,color:val.id===v.id?th.ac:th.t1}}>{v.id.toUpperCase()}</span>
                {val.id===v.id&&<span style={{color:th.ac}}>{Ico.check(th.ac)}</span>}
              </button>)}
            </div>}
          </div>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,overflow:"hidden",marginBottom:12}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:notifEnabled?"1px solid "+th.bor:"none"}}>
              <div style={{width:38,height:38,borderRadius:11,background:(notifEnabled?th.gr:th.t2)+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" fill={notifEnabled?th.gr:th.t2} opacity=".2" stroke={notifEnabled?th.gr:th.t2} strokeWidth="1.3"/><path d="M8.5 16.5a1.5 1.5 0 003 0" stroke={notifEnabled?th.gr:th.t2} strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{lg==="uz"?"Bildirishnomalar":"Notifications"}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{notifEnabled?(lg==="uz"?"Yoqilgan — har kuni "+notifTime:"On — daily at "+notifTime):(lg==="uz"?"O'chirilgan":"Off")}</div></div>
              <div onClick={toggleNotif} style={{width:50,height:28,borderRadius:14,background:notifEnabled?th.gr:"#334155",cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0}}>
                <div style={{position:"absolute",top:4,left:notifEnabled?24:4,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .3s"}}/>
              </div>
            </div>
            {notifEnabled&&<div style={{padding:"12px 16px"}}>
              <div style={{fontSize:11,color:th.t2,marginBottom:8,fontWeight:600}}>{lg==="uz"?"Eslatma vaqti":"Reminder time"}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["08:00","12:00","18:00","20:00","21:00","22:00"].map(time=>(<button key={time} onClick={()=>saveNotifTime(time)} style={{background:notifTime===time?th.ac+"18":th.bg,border:"1.5px solid "+(notifTime===time?th.ac:th.bor),borderRadius:10,padding:"7px 14px",color:notifTime===time?th.ac:th.t2,cursor:"pointer",fontWeight:700,fontSize:13}}>{time}</button>))}
              </div>
            </div>}
          </div>
          <div style={{background:"linear-gradient(135deg,"+th.ac+"11,"+th.ac2+"08)",border:"1.5px solid "+th.ac+"33",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>setShowPremModal(true)}>
            <div style={{fontSize:28}}>💎</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:th.ac}}>{isPremium?(lg==="uz"?"Premium faol":"Premium active"):(lg==="uz"?"Premium ga o'ting":"Upgrade to Premium")}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{isPremium?(lg==="uz"?"Barcha funksiyalar ochiq":"All unlocked"):(lg==="uz"?"Cheksiz maqsad, PDF, Excel...":"Unlimited goals, PDF...")}</div></div>
            {!isPremium?<div style={{background:th.ac,borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:12,fontWeight:700,flexShrink:0}}>{lg==="uz"?"Ochish":"Unlock"}</div>:<div style={{fontSize:20}}>✓</div>}
          </div>
        </div>}
        {pTab==="xav"&&<div>
          <BH label={t.xav} th={th} onBack={()=>setPTab("main")}/>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,overflow:"hidden",marginBottom:12}}>
            <div style={{padding:"16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:12,background:th.ac+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.lock(th.ac)}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{t.pin}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{lg==="uz"?"4 raqamli maxfiy kod":"4-digit code"}</div></div>
              <button onClick={()=>setPinStep(pinStep==="idle"?"enter":"idle")} style={{background:th.ac,border:"none",borderRadius:9,padding:"7px 14px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:12}}>{pinStep==="idle"?(lg==="uz"?"O'zgartirish":"Change"):(lg==="uz"?"Bekor":"Cancel")}</button>
            </div>
            {pinStep!=="idle"&&<div style={{padding:"16px",borderTop:"1px solid "+th.bor}}>
              <div style={{fontSize:13,color:th.t2,marginBottom:12,textAlign:"center",fontWeight:600}}>{pinStep==="enter"?(lg==="uz"?"Yangi PIN kiriting":"Enter new PIN"):(lg==="uz"?"PIN ni tasdiqlang":"Confirm PIN")}</div>
              <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:16}}>
                {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:(pinStep==="enter"?pinVal:pinCfm).length>i?th.ac:th.bor,transition:"background .2s"}}/>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[1,2,3,4,5,6,7,8,9,"",0,"\u232b"].map((num,ni)=>(
                  <button key={ni} onClick={()=>{
                    if(num==="")return;
                    const cur=pinStep==="enter"?pinVal:pinCfm;
                    const setter=pinStep==="enter"?setPinVal:setPinCfm;
                    if(num==="\u232b"){setter(cur.slice(0,-1));return;}
                    const next=cur+String(num);setter(next);
                    if(next.length===4){
                      if(pinStep==="enter"){setTimeout(()=>setPinStep("confirm"),300);}
                      else{if(next===pinVal){setPinStep("idle");setPinVal("");setPinCfm("");ok$(lg==="uz"?"PIN saqlandi":"PIN saved");}else{setPinCfm("");ok$(lg==="uz"?"PIN mos kelmadi":"PIN mismatch","err");}}
                    }
                  }} style={{background:typeof num==="number"?th.sur:"transparent",border:typeof num==="number"?"1px solid "+th.bor:"none",borderRadius:12,padding:"14px",fontSize:18,fontWeight:700,color:num==="\u232b"?th.rd:th.t1,cursor:num===""?"default":"pointer"}}>{num}</button>
                ))}
              </div>
            </div>}
          </div>
          <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:16,padding:"16px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:12,background:th.gr+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.finger(th.gr)}</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:th.t1}}>{t.barmoq}</div><div style={{fontSize:12,color:th.t2,marginTop:2}}>{lg==="uz"?"Tez va xavfsiz":"Fast & secure"}</div></div>
            <div onClick={()=>setFinger(v=>!v)} style={{width:50,height:28,borderRadius:14,background:finger?th.gr:"#334155",cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0}}>
              <div style={{position:"absolute",top:4,left:finger?24:4,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .3s",boxShadow:"0 2px 4px rgba(0,0,0,.2)"}}/>
            </div>
          </div>
        </div>}
        {pTab==="qol"&&<div>
          <BH label={t.qol} th={th} onBack={()=>setPTab("main")}/>
          <a href="https://t.me/oila_hisobchi_bot" target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
            <div style={{background:"linear-gradient(135deg,#2196F3,#0d47a1)",borderRadius:18,padding:"18px",marginBottom:14,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
              <div style={{width:46,height:46,borderRadius:13,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Ico.tg()}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{t.tgBot}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginTop:3}}>@oila_hisobchi_bot</div></div>
              {Ico.right("rgba(255,255,255,0.7)")}
            </div>
          </a>
          <div style={{fontSize:11,color:th.t2,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:10}}>{t.faq}</div>
          {FAQS[lg].map((item,i)=>(
            <div key={i} style={{marginBottom:8,borderRadius:14,overflow:"hidden",border:"1px solid "+th.bor}}>
              <button onClick={()=>setFaqO(faqO===i?null:i)} style={{width:"100%",background:faqO===i?th.ac+"18":th.sur,border:"none",padding:"14px 16px",cursor:"pointer",textAlign:"left",color:th.t1,fontSize:14,fontWeight:600,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{flex:1,paddingRight:8}}>{item.q}</span>
                {Ico.chevron(th.ac,faqO===i)}
              </button>
              {faqO===i&&<div style={{background:th.surH,padding:"12px 16px",fontSize:13,color:th.t2,lineHeight:1.75,borderTop:"1px solid "+th.bor}}>{item.a}</div>}
            </div>
          ))}
          <div style={{fontSize:11,color:th.t2,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:10,marginTop:20}}>{lg==="uz"?"Taklif va kamchiliklar":lg==="ru"?"Отзывы":"Feedback"}</div>
          <div style={S.cd}>
            <div style={{fontSize:14,fontWeight:700,color:th.t1,marginBottom:4}}>{lg==="uz"?"Ilovani baholang":"Rate the app"}</div>
            <div style={{fontSize:12,color:th.t2,marginBottom:12}}>{lg==="uz"?"Fikringiz biz uchun muhim!":"Your opinion matters!"}</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
              {[1,2,3,4,5].map(star=>(<button key={star} onClick={()=>setFbRating(star)} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><svg width="34" height="34" viewBox="0 0 24 24" fill={star<=fbRating?"#f59e0b":"none"} stroke={star<=fbRating?"#f59e0b":th.t2} strokeWidth="1.5"><path d="M12 2l2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.6 5.7 20.7 7 13.8 2 9.1l6.8-.8L12 2z" strokeLinejoin="round"/></svg></button>))}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {[{id:"taklif",l:lg==="uz"?"Taklif":"Suggestion"},{id:"xato",l:lg==="uz"?"Kamchilik":"Bug"},{id:"boshqa",l:lg==="uz"?"Boshqa":"Other"}].map(ty=>(<button key={ty.id} onClick={()=>setFbType(ty.id)} style={{flex:1,background:fbType===ty.id?th.ac+"18":th.bg,border:"1.5px solid "+(fbType===ty.id?th.ac:th.bor),borderRadius:10,padding:"8px 4px",color:fbType===ty.id?th.ac:th.t2,cursor:"pointer",fontWeight:600,fontSize:12}}>{ty.l}</button>))}
            </div>
            <textarea value={fbText} onChange={e=>setFbText(e.target.value)} placeholder={lg==="uz"?"Fikr, taklif yoki kamchilikni yozing...":"Write your feedback..."} style={{width:"100%",minHeight:90,background:th.surH,border:"1.5px solid "+th.bor,borderRadius:13,padding:"12px 14px",color:th.t1,fontSize:14,outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit",marginBottom:12}}/>
            <button onClick={sendFeedback} disabled={fbSending} style={{...S.bt(),marginBottom:0,opacity:fbSending?0.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M16 2L8 10M16 2l-5 14-3-6-6-3 14-5z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {fbSending?(lg==="uz"?"Yuborilmoqda...":"Sending..."):(lg==="uz"?"Yuborish":"Send")}
            </button>
          </div>
          <a href="https://t.me/oila_hisobchi_bot" target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
            <div style={{background:th.sur,border:"1px solid "+th.bor,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
              <div style={{width:38,height:38,borderRadius:11,background:"#2196F318",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="#2196F3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:th.t1}}>{lg==="uz"?"Telegram orqali yozish":"Message on Telegram"}</div><div style={{fontSize:11,color:th.t2,marginTop:2}}>{lg==="uz"?"To'g'ridan-to'g'ri bog'laning":"Contact us directly"}</div></div>
              {Ico.right(th.t2)}
            </div>
          </a>
        </div>}
      </div>}
    </div>
    {quickItem&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setQuickItem(null)}>
      <div style={{background:th.sur,borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:340}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:48,marginBottom:8}}>{quickItem.emoji}</div>
          <div style={{fontSize:20,fontWeight:800,color:th.t1}}>{quickItem[lg]||quickItem.uz}</div>
          <div style={{fontSize:13,color:th.t2,marginTop:2}}>{KN[lg][KATS.findIndex(k=>k.id===quickItem.kat)]}</div>
        </div>
        <MoneyInput autoFocus value={quickSum} onChange={setQuickSum} placeholder="0" style={{width:"100%",background:th.surH,border:"1.5px solid "+th.bor,borderRadius:14,padding:"16px",color:th.t1,fontSize:30,fontWeight:800,textAlign:"center",outline:"none",boxSizing:"border-box",marginBottom:8}}/>
        <div style={{fontSize:12,color:th.t2,textAlign:"center",marginBottom:16}}>{quickSum?f(Number(quickSum)||0,false):(lg==="uz"?"Summani kiriting":"Enter amount")}</div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {[10000,20000,50000,100000].map(amt=>(<button key={amt} onClick={()=>setQuickSum(String(amt))} style={{flex:"1 1 calc(50% - 4px)",background:th.bg,border:"1px solid "+th.bor,borderRadius:10,padding:"8px 0",color:th.t1,cursor:"pointer",fontSize:12,fontWeight:600}}>{(amt/1000)+"K"}</button>))}
        </div>
        <button onClick={quickAdd} style={{...S.bt(),marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{Ico.check("#fff")}{lg==="uz"?"Qo'shish":lg==="ru"?"Добавить":"Add"}</button>
        <button onClick={()=>setQuickItem(null)} style={{width:"100%",background:"transparent",border:"1px solid "+th.bor,borderRadius:14,padding:"12px",color:th.t2,cursor:"pointer",fontWeight:600,fontSize:14}}>{lg==="uz"?"Bekor":lg==="ru"?"Отмена":"Cancel"}</button>
      </div>
    </div>}
    {showReferral&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowReferral(false)}>
      <div style={{background:th.sur,borderRadius:"24px 24px 0 0",padding:"28px 24px 40px",width:"100%",maxWidth:430,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:48,marginBottom:8}}>🎁</div>
          <div style={{fontSize:22,fontWeight:800,color:th.t1,marginBottom:4}}>{lg==="uz"?"Do'stlarni taklif qiling":lg==="ru"?"Пригласить друзей":"Invite friends"}</div>
          <div style={{fontSize:13,color:th.t2}}>{lg==="uz"?"Har bir do'st uchun imtiyozlar oling!":lg==="ru"?"Получайте бонусы за каждого друга!":"Get rewards for each friend!"}</div>
        </div>
        <div style={{background:"linear-gradient(135deg,"+th.gr+"15,"+th.ac+"08)",border:"1.5px solid "+th.gr+"33",borderRadius:16,padding:"16px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:th.t1}}>{lg==="uz"?"Sizning natijangiz":lg==="ru"?"Ваш прогресс":"Your progress"}</div>
            <div style={{fontSize:13,fontWeight:800,color:th.gr}}>{refCount}/3</div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {[0,1,2].map(i=>(<div key={i} style={{flex:1,height:8,borderRadius:4,background:i<refCount?th.gr:th.bor}}/>))}
          </div>
          <div style={{fontSize:12,color:th.t2}}>{refCount>=3?(lg==="uz"?"🎉 Tabriklaymiz! Premium ochildi!":"🎉 Premium unlocked!"):(lg==="uz"?"Yana "+(3-refCount)+" ta do'st = 1 oy Premium bepul":(3-refCount)+" more friends = 1 month free Premium")}</div>
        </div>
        <div style={{fontSize:11,color:th.t2,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{lg==="uz"?"Sizning taklif havolangiz":lg==="ru"?"Ваша ссылка":"Your invite link"}</div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <div style={{flex:1,background:th.bg,border:"1.5px solid "+th.bor,borderRadius:12,padding:"12px 14px",fontSize:12,color:th.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"monospace"}}>{(window.location.origin+"/?ref=")+(user?.id||"")}</div>
          <button onClick={()=>{const link=(window.location.origin+"/?ref=")+(user?.id||"");try{navigator.clipboard.writeText(link);ok$(lg==="uz"?"Havola nusxalandi!":"Link copied!");}catch(e){ok$(lg==="uz"?"Nusxalab bo'lmadi":"Copy failed","err");}}} style={{background:th.ac,border:"none",borderRadius:12,padding:"0 16px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,flexShrink:0}}>{lg==="uz"?"Nusxa":lg==="ru"?"Копир":"Copy"}</button>
        </div>
        <div style={{background:th.ac+"0a",border:"1px solid "+th.ac+"22",borderRadius:14,padding:"13px 14px",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:th.t1,marginBottom:3,display:"flex",alignItems:"center",gap:6}}>👥 {lg==="uz"?"Do'stni taklif qilish":lg==="ru"?"Пригласить друга":"Invite a friend"}</div>
          <div style={{fontSize:10,color:th.t2,marginBottom:10}}>{lg==="uz"?"Faqat ilovaga taklif (alohida oila ochadi)":"App invite only (they create own family)"}</div>
          <button onClick={()=>{const link=(window.location.origin+"/?ref=")+(user?.id||"");const txt=(lg==="uz"?"Oila Hisobchi - oilaviy byudjet ilovasi! Men bilan qo'shiling: ":"Join me on Family Budget app: ")+link;const url="https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent(txt);window.open(url,"_blank");}} style={{width:"100%",background:"#2196F3",border:"none",borderRadius:11,padding:"11px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{lg==="uz"?"Telegram orqali yuborish":"Send via Telegram"}
          </button>
        </div>
        {user?.rol==="bosh"&&<div style={{background:th.gr+"0a",border:"1px solid "+th.gr+"22",borderRadius:14,padding:"13px 14px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:th.t1,marginBottom:3,display:"flex",alignItems:"center",gap:6}}>👨‍👩‍👧‍👦 {lg==="uz"?"Oila a'zosini taklif qilish":lg==="ru"?"Пригласить в семью":"Invite to family"}</div>
          <div style={{fontSize:10,color:th.t2,marginBottom:10}}>{lg==="uz"?"Oila kodi bilan — sizning oilangizga qo'shiladi":"With family code — joins your family"}</div>
          <div style={{background:th.bg,borderRadius:9,padding:"8px 12px",marginBottom:9,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11,color:th.t2}}>{lg==="uz"?"Oila kodi":"Family code"}</span>
            <span style={{fontSize:13,fontWeight:800,color:th.gr,fontFamily:"monospace",letterSpacing:1}}>{user?.oilaId}</span>
          </div>
          <button onClick={()=>{const code=user?.oilaId||"";const link=(window.location.origin+"/?ref=")+(user?.id||"")+"&fam="+code;const txt=(lg==="uz"?"Bizning oilamizga Oila Hisobchi ilovasida qo'shiling! Oila kodi: "+code+"\n":"Join our family on Oila Hisobchi! Family code: "+code+"\n")+link;const url="https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent(txt);window.open(url,"_blank");}} style={{width:"100%",background:th.gr,border:"none",borderRadius:11,padding:"11px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M2 12L22 4l-6.5 18-4.5-7.5L22 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{lg==="uz"?"Oila kodi bilan yuborish":"Send with family code"}
          </button>
        </div>}
        <div style={{background:th.bg,borderRadius:14,padding:"14px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:th.t1,marginBottom:10}}>{lg==="uz"?"Imtiyozlar":lg==="ru"?"Награды":"Rewards"}</div>
          {[{n:1,t:lg==="uz"?"1 do'st — 100 ball":"1 friend — 100 points"},{n:3,t:lg==="uz"?"3 do'st — 1 oy Premium":"3 friends — 1 month Premium"},{n:10,t:lg==="uz"?"10 do'st — 1 yil Premium":"10 friends — 1 year Premium"}].map(r=>(
            <div key={r.n} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:26,height:26,borderRadius:8,background:refCount>=r.n?th.gr+"22":th.bor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:refCount>=r.n?th.gr:th.t2,flexShrink:0}}>{refCount>=r.n?"✓":r.n}</div>
              <span style={{fontSize:12,color:refCount>=r.n?th.t1:th.t2,fontWeight:refCount>=r.n?600:400}}>{r.t}</span>
            </div>
          ))}
        </div>
        {refCount>0&&<div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:th.t2,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{lg==="uz"?"Taklif qilinganlar":lg==="ru"?"Приглашённые":"Invited"} ({refCount})</div>
          <div style={{fontSize:12,color:th.t2}}>{lg==="uz"?refCount+" ta do'st qo'shildi. Rahmat!":refCount+" friends joined. Thanks!"}</div>
        </div>}
        <button onClick={()=>setShowReferral(false)} style={{width:"100%",background:"transparent",border:"1px solid "+th.bor,borderRadius:14,padding:"12px",color:th.t2,cursor:"pointer",fontWeight:600,fontSize:14}}>{lg==="uz"?"Yopish":lg==="ru"?"Закрыть":"Close"}</button>
      </div>
    </div>}
    {showNotifs&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:998,display:"flex",justifyContent:"flex-end"}} onClick={()=>setShowNotifs(false)}>
      <div style={{background:th.bg,width:"100%",maxWidth:430,height:"100%",overflowY:"auto",boxShadow:"-4px 0 24px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{position:"sticky",top:0,background:th.sur,borderBottom:"1px solid "+th.bor,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:2}}>
          <div style={{fontSize:17,fontWeight:800,color:th.t1}}>{lg==="uz"?"Bildirishnomalar":lg==="ru"?"Уведомления":"Notifications"}</div>
          <button onClick={()=>setShowNotifs(false)} style={{background:th.surH,border:"none",borderRadius:"50%",width:34,height:34,color:th.t1,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        {notifs.length>0&&<div style={{display:"flex",gap:8,padding:"12px 18px",borderBottom:"1px solid "+th.bor}}>
          <button onClick={markAllRead} style={{flex:1,background:th.surH,border:"1px solid "+th.bor,borderRadius:10,padding:"8px 0",color:th.t2,cursor:"pointer",fontSize:12,fontWeight:600}}>{lg==="uz"?"Hammasini o'qilgan":"Mark all read"}</button>
          <button onClick={clearNotifs} style={{flex:1,background:th.rd+"11",border:"1px solid "+th.rd+"33",borderRadius:10,padding:"8px 0",color:th.rd,cursor:"pointer",fontSize:12,fontWeight:600}}>{lg==="uz"?"Tozalash":"Clear"}</button>
        </div>}
        <div style={{padding:"12px 18px 40px"}}>
          {notifs.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:th.t2}}><div style={{fontSize:46,marginBottom:10,opacity:.5}}>🔔</div><div style={{fontSize:15}}>{lg==="uz"?"Bildirishnomalar yo'q":"No notifications"}</div></div>}
          {notifs.map(n=>{
            const icons={qarz:"💸",budjet:"⚠️",xarajat:"💰",yangilik:"🎉"};
            const colors={qarz:th.ac,budjet:th.am,xarajat:th.rd,yangilik:th.gr};
            const c=colors[n.type]||th.ac;
            return <div key={n.id} onClick={()=>markNotifRead(n.id)} style={{background:n.read?th.sur:c+"0d",border:"1px solid "+(n.read?th.bor:c+"33"),borderRadius:14,padding:"13px 15px",marginBottom:10,cursor:"pointer",display:"flex",gap:12}}>
              <div style={{width:40,height:40,borderRadius:11,background:c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icons[n.type]||"🔔"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,fontWeight:700,color:th.t1}}>{n.title}</span>{!n.read&&<span style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0}}/>}</div>
                <div style={{fontSize:12,color:th.t2,marginTop:3,lineHeight:1.5}}>{n.body}</div>
                <div style={{fontSize:10,color:th.t2,marginTop:5,opacity:.7}}>{new Date(n.sana).toLocaleString("uz-UZ",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>}
    {showVoice&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <button onClick={()=>{stopVoice();setShowVoice(false);}} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:40,height:40,color:"#fff",fontSize:22,cursor:"pointer"}}>×</button>
      <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8}}>{lg==="uz"?"Ovoz bilan kiritish":lg==="ru"?"Голосовой ввод":"Voice input"}</div>
      <div style={{fontSize:13,color:"rgba(255,255,255,.6)",marginBottom:36,textAlign:"center",maxWidth:300}}>{lg==="uz"?"Masalan: \"Transportga 20 ming ishlatdim\"":lg==="ru"?"Например: \"На транспорт 20 тысяч\"":"E.g. \"Spent 20000 on transport\""}</div>
      <button onClick={voiceOn?stopVoice:startVoice} style={{width:110,height:110,borderRadius:"50%",background:voiceOn?"linear-gradient(135deg,#ef4444,#dc2626)":"linear-gradient(135deg,#8b5cf6,#6366f1)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:30,boxShadow:voiceOn?"0 0 0 12px rgba(239,68,68,.2),0 0 0 24px rgba(239,68,68,.1)":"0 8px 30px rgba(139,92,246,.5)",transition:"all .3s"}}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" fill="#fff"/><path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      <div style={{fontSize:14,color:voiceOn?"#ef4444":"rgba(255,255,255,.7)",fontWeight:600,marginBottom:24}}>{voiceOn?(lg==="uz"?"Tinglayapman...":lg==="ru"?"Слушаю...":"Listening..."):(lg==="uz"?"Bosing va gapiring":lg==="ru"?"Нажмите и говорите":"Tap and speak")}</div>
      {voiceText&&<div style={{background:"rgba(255,255,255,.1)",borderRadius:16,padding:"16px 20px",marginBottom:20,maxWidth:340,width:"100%"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>{lg==="uz"?"Eshitildi":lg==="ru"?"Распознано":"Heard"}</div>
        <div style={{fontSize:15,color:"#fff",lineHeight:1.5}}>{voiceText}</div>
      </div>}
      {voiceParsed&&<div style={{background:"linear-gradient(135deg,#10b98122,#05966911)",border:"1.5px solid #10b98155",borderRadius:16,padding:"16px 20px",marginBottom:24,maxWidth:340,width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>{lg==="uz"?"Summa":lg==="ru"?"Сумма":"Amount"}</span>
          <span style={{fontSize:20,fontWeight:800,color:"#10b981"}}>{f(voiceParsed.summa,true)}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>{lg==="uz"?"Kategoriya":lg==="ru"?"Категория":"Category"}</span>
          <span style={{fontSize:14,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:6}}>{KN[lg][KATS.findIndex(k=>k.id===voiceParsed.kat)]}</span>
        </div>
      </div>}
      {(voiceText&&!voiceOn)&&<div style={{display:"flex",gap:10,maxWidth:340,width:"100%"}}>
        <button onClick={()=>{setVoiceText("");setVoiceParsed(null);startVoice();}} style={{flex:1,background:"rgba(255,255,255,.15)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>{lg==="uz"?"Qayta":lg==="ru"?"Заново":"Retry"}</button>
        <button onClick={applyVoice} disabled={!voiceParsed} style={{flex:2,background:voiceParsed?"linear-gradient(135deg,#10b981,#059669)":"rgba(255,255,255,.1)",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,cursor:voiceParsed?"pointer":"not-allowed",opacity:voiceParsed?1:.5}}>{lg==="uz"?"Qo'shish":lg==="ru"?"Добавить":"Add"}</button>
      </div>}
    </div>}
    {showImport&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{setShowImport(false);setImportRows([]);setImportStep("upload");}}>
      <div style={{background:th.bg,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",padding:"22px 18px"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontSize:17,fontWeight:800,color:th.t1,display:"flex",alignItems:"center",gap:8}}>📄 {lg==="uz"?"Hisobot import":lg==="ru"?"Импорт":"Import"}</div>
          <button onClick={()=>{setShowImport(false);setImportRows([]);setImportStep("upload");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:th.t2}}>×</button>
        </div>
        {importStep==="upload"&&<div>
          <div style={{background:th.ac+"0d",border:"1.5px dashed "+th.ac+"55",borderRadius:16,padding:"32px 18px",textAlign:"center",marginBottom:14,cursor:"pointer"}} onClick={()=>importFileRef.current?.click()}>
            <div style={{fontSize:44,marginBottom:10}}>📁</div>
            <div style={{fontSize:14,fontWeight:700,color:th.t1,marginBottom:5}}>{lg==="uz"?"CSV faylni tanlang":lg==="ru"?"Выберите CSV":"Choose CSV file"}</div>
            <div style={{fontSize:11,color:th.t2}}>{lg==="uz"?"Bank hisobotini CSV formatda yuklang":"Upload bank statement as CSV"}</div>
          </div>
          <input ref={importFileRef} type="file" accept=".csv,text/csv" style={{display:"none"}} onChange={e=>handleImportFile(e.target.files?.[0])}/>
          <div style={{background:th.sur,borderRadius:12,padding:"13px 15px",fontSize:11,color:th.t2,lineHeight:1.7}}>
            <div style={{fontWeight:700,color:th.t1,marginBottom:6}}>{lg==="uz"?"💡 Qanday ishlaydi:":"💡 How it works:"}</div>
            {lg==="uz"?"1. Bank ilovangizdan hisobotni CSV qilib yuklab oling\n2. Shu yerga tanlang\n3. Ilova sana, summa, izohni avtomatik aniqlaydi\n4. Ko'rib chiqib, tasdiqlang":"1. Export statement as CSV from your bank\n2. Select it here\n3. App auto-detects date, amount, note\n4. Review and confirm"}
          </div>
        </div>}
        {importStep==="review"&&<div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:12,color:th.t2}}>{importRows.filter(r=>r.sel).length}/{importRows.length} {lg==="uz"?"tanlandi":"selected"}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setImportRows(rows=>rows.map(r=>({...r,sel:true})))} style={{fontSize:11,background:th.ac+"15",border:"none",borderRadius:8,padding:"5px 10px",color:th.ac,cursor:"pointer",fontWeight:600}}>{lg==="uz"?"Hammasi":"All"}</button>
              <button onClick={()=>setImportRows(rows=>rows.map(r=>({...r,sel:false})))} style={{fontSize:11,background:th.bor,border:"none",borderRadius:8,padding:"5px 10px",color:th.t2,cursor:"pointer",fontWeight:600}}>{lg==="uz"?"Hech biri":"None"}</button>
            </div>
          </div>
          <div style={{maxHeight:"42vh",overflowY:"auto",marginBottom:14}}>
            {importRows.map((r,i)=>(
              <div key={i} onClick={()=>setImportRows(rows=>rows.map((x,j)=>j===i?{...x,sel:!x.sel}:x))} style={{display:"flex",alignItems:"center",gap:10,background:r.sel?th.sur:th.bg,border:"1px solid "+(r.sel?(r.kind==="income"?th.gr+"44":th.rd+"33"):th.bor),borderRadius:11,padding:"10px 12px",marginBottom:7,cursor:"pointer",opacity:r.sel?1:.5}}>
                <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(r.sel?th.ac:th.bor),background:r.sel?th.ac:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{r.sel&&<span style={{color:"#fff",fontSize:12}}>✓</span>}</div>
                <div style={{width:30,height:30,borderRadius:8,background:(r.kind==="income"?th.gr:th.rd)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{r.kind==="income"?"💰":"💸"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:th.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.izoh||(lg==="uz"?"(izohsiz)":"(no note)")}</div>
                  <div style={{fontSize:10,color:th.t2}}>{r.sana} · {r.kind==="income"?(lg==="uz"?"Daromad":"Income"):(KN[lg][KATS.findIndex(k=>k.id===r.kategoriya)]||"")}</div>
                </div>
                <div style={{fontSize:13,fontWeight:800,color:r.kind==="income"?th.gr:th.rd,flexShrink:0}}>{r.kind==="income"?"+":"-"}{f(r.summa,true)}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{setImportStep("upload");setImportRows([]);}} style={{flex:1,background:"transparent",border:"1.5px solid "+th.bor,borderRadius:13,padding:"13px",color:th.t2,cursor:"pointer",fontWeight:700,fontSize:14}}>{lg==="uz"?"Orqaga":"Back"}</button>
            <button onClick={confirmImport} style={{flex:2,...S.bt(),marginBottom:0}}>{lg==="uz"?"Import qilish":"Import"} ({importRows.filter(r=>r.sel).length})</button>
          </div>
        </div>}
      </div>
    </div>}
    {showScanner&&<div style={{position:"fixed",inset:0,background:"#000",zIndex:1000,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,.6)",position:"relative",zIndex:2}}>
        <div style={{color:"#fff",fontSize:16,fontWeight:700}}>{lg==="uz"?"Chek skaneri":"Receipt scanner"}</div>
        <button onClick={stopScanner} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:36,height:36,color:"#fff",fontSize:20,cursor:"pointer"}}>×</button>
      </div>
      <div style={{flex:1,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <video ref={videoRef} playsInline muted style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>
        <div style={{position:"relative",zIndex:2,width:240,height:240,border:"3px solid "+th.ac,borderRadius:24,boxShadow:"0 0 0 9999px rgba(0,0,0,.5)"}}>
          <div style={{position:"absolute",top:-3,left:-3,width:40,height:40,borderTop:"5px solid #fff",borderLeft:"5px solid #fff",borderRadius:"24px 0 0 0"}}/>
          <div style={{position:"absolute",top:-3,right:-3,width:40,height:40,borderTop:"5px solid #fff",borderRight:"5px solid #fff",borderRadius:"0 24px 0 0"}}/>
          <div style={{position:"absolute",bottom:-3,left:-3,width:40,height:40,borderBottom:"5px solid #fff",borderLeft:"5px solid #fff",borderRadius:"0 0 0 24px"}}/>
          <div style={{position:"absolute",bottom:-3,right:-3,width:40,height:40,borderBottom:"5px solid #fff",borderRight:"5px solid #fff",borderRadius:"0 0 24px 0"}}/>
        </div>
      </div>
      <div style={{padding:"20px 24px 40px",background:"rgba(0,0,0,.6)",textAlign:"center"}}>
        <div style={{color:"#fff",fontSize:14,marginBottom:6}}>{scanMsg}</div>
        <div style={{color:"rgba(255,255,255,.6)",fontSize:12,marginBottom:16}}>{lg==="uz"?"Chekdagi QR kodni ramka ichiga joylang":"Point the receipt QR into the frame"}</div>
        <button onClick={stopScanner} style={{background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.4)",borderRadius:12,padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>{lg==="uz"?"Qo'lda kiritish":"Enter manually"}</button>
      </div>
    </div>}
    {showPremModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowPremModal(false)}>
      <div style={{background:th.sur,borderRadius:"24px 24px 0 0",padding:"28px 24px 40px",width:"100%",maxWidth:430}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:8}}>💎</div>
          <div style={{fontSize:22,fontWeight:800,color:th.t1,marginBottom:4}}>{lg==="uz"?"Premium versiya":"Premium Version"}</div>
          <div style={{fontSize:13,color:th.t2}}>{lg==="uz"?"Barcha funksiyalarni oching!":"Unlock all features!"}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {[{label:lg==="uz"?"Bepul":"Free",items:lg==="uz"?["3 ta maqsad","2 oila a'zo","Asosiy hisobot","Qarzlar"]:["3 goals","2 members","Basic report","Debts"]},{label:"Premium",items:lg==="uz"?["♾️ Cheksiz maqsad","👨‍👩‍👧 Cheksiz a'zo","📄 PDF/Excel","🎤 Ovoz kiritish","📷 QR skaner","🤖 AI maslahat"]:["♾️ Unlimited goals","👨‍👩‍👧 Unlimited members","📄 PDF/Excel","🎤 Voice input","📷 QR scanner","🤖 AI advice"]}].map((plan,pi)=>(
            <div key={pi} style={{background:pi===1?"linear-gradient(135deg,"+th.ac+"22,"+th.ac2+"11)":th.surH,border:"1.5px solid "+(pi===1?th.ac:th.bor),borderRadius:16,padding:"14px 12px"}}>
              <div style={{fontSize:13,fontWeight:700,color:pi===1?th.ac:th.t2,marginBottom:10,textAlign:"center"}}>{plan.label}</div>
              {plan.items.map((item,ii)=>(<div key={ii} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,fontSize:12,color:th.t1}}><span style={{color:pi===1?th.ac:th.gr,fontSize:14}}>✓</span>{item}</div>))}
            </div>
          ))}
        </div>
        <div style={{background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",borderRadius:16,padding:"14px 20px",marginBottom:10,textAlign:"center"}}>
          <div style={{fontSize:12,color:"rgba(255,255,255,.8)",marginBottom:4}}>{lg==="uz"?"Premium narxi":"Price"}</div>
          <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>15 000 – 25 000 {lg==="uz"?"so'm / oy":"UZS / month"}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>99 000 {lg==="uz"?"so'm / yil":"UZS / year"}</div>
        </div>
        <button onClick={activatePremium} style={{...S.bt(),marginBottom:8,fontSize:16}}>💎 {lg==="uz"?"Premium faollashtirish (Demo)":"Activate Premium (Demo)"}</button>
        <button onClick={()=>setShowPremModal(false)} style={{width:"100%",background:"transparent",border:"1px solid "+th.bor,borderRadius:14,padding:"12px",color:th.t2,cursor:"pointer",fontWeight:600,fontSize:14}}>{lg==="uz"?"Keyinroq":"Later"}</button>
      </div>
    </div>}
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:th.sur,borderTop:"1px solid "+th.bor,padding:"8px 12px 22px",display:"flex",justifyContent:"space-around",alignItems:"center",zIndex:20}}>
      {navItems.map(item=>item.pr
        ?<button key="add" onClick={()=>{buzz(15);setScr("qoshish");}} style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,"+th.ac+","+th.ac2+")",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 22px "+th.ac+"55",flexShrink:0}} className="anim-pulse">{Ico.add("#fff")}</button>
        :<button key={item.id} onClick={()=>{buzz(8);setScr(item.id);}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,opacity:scr===item.id?1:0.5,transition:"all .2s",padding:"4px 8px",transform:scr===item.id?"translateY(-2px)":"none"}}>
          {item.id==="bosh"&&Ico.navHome(scr===item.id?th.ac:th.t2)}
          {item.id==="grafik"&&Ico.navChart(scr===item.id?th.ac:th.t2)}
          {item.id==="qarz"&&<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="6" width="20" height="14" rx="3" fill={scr===item.id?th.ac:th.t2} opacity=".15" stroke={scr===item.id?th.ac:th.t2} strokeWidth="1.4"/><path d="M3 10h20" stroke={scr===item.id?th.ac:th.t2} strokeWidth="1.3"/><path d="M7 14h5M16 14h3" stroke={scr===item.id?th.ac:th.t2} strokeWidth="1.5" strokeLinecap="round"/></svg>}
          {item.id==="maqsad"&&Ico.navGoal(scr===item.id?th.ac:th.t2)}
          {item.id==="hisobot"&&Ico.navRep(scr===item.id?th.ac:th.t2)}
          <span style={{fontSize:9,fontWeight:700,letterSpacing:.5,color:scr===item.id?th.ac:th.t2}}>{item.lb}</span>
        </button>
      )}
    </div>
  </div>;
}
