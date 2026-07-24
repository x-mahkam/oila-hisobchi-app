// ═══════════════════════════════════════════════════════════
//  BOZOR — to'liq savdo simulyatori (10+ yosh, moliyaviy savodxonlik)
//  Aylanma: mol olish (xarid) → narx qo'yish → bozorda sotish
//  (savdolashish + qaytim berish) → kun yakuni (foyda = daromad − xarajat).
//  O'rgatadi: foyda, narx strategiyasi, talab, qaytim, savdolashish.
//  Self-contained: o'z holatini boshqaradi (BudgetGame uslubida).
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, PREMIUM, PALETTE } from "../../utils/tokens.js";
import { f } from "../../utils/formatters.js";
import { addCoins, logGameSession, bestForGame, readSessions } from "../engine/persist.js";
import { addXp, readXp, levelFor, didLevelUp } from "../engine/xp.js";
import { playSound } from "../engine/sound.js";
import { BOZOR_PRODUCTS, NOTES } from "./data/bozorProducts.js";

const CAPITAL = 60000;      // boshlang'ich pul
const CUSTOMERS = 8;        // bir kunda mijozlar soni
const TARGET_PROFIT = 15000; // 3 yulduz uchun foyda

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const round500 = (n) => Math.round(n / 500) * 500;

// ── UI matnlari (7 til) ──
const T = {
  title:      { uz: "Bozor", ru: "Базар", en: "Bazaar", kk: "Базар", ky: "Базар", tg: "Бозор", qr: "Bazar" },
  introH:     { uz: "Do'kon egasi bo'l!", ru: "Стань хозяином лавки!", en: "Become a shopkeeper!", kk: "Дүкен иесі бол!", ky: "Дүкөн ээси бол!", tg: "Соҳиби дӯкон шав!", qr: "Dúkan iyesi bol!" },
  introP:     { uz: "Ombordan arzon mol ol, narx qo'y, bozorda sot. Maqsad — foyda topish! Savdolashishni va qaytim berishni ham o'rganasan.", ru: "Купи товар дёшево на складе, назначь цену, продай на базаре. Цель — прибыль! Научишься торговаться и давать сдачу.", en: "Buy goods cheap, set a price, sell them at the bazaar. Goal: make profit! You'll also learn haggling and giving change.", kk: "Қоймадан арзан тауар ал, баға қой, базарда сат. Мақсат — пайда! Сауда жасауды және қайырым беруді үйренесің.", ky: "Кампадан арзан товар ал, баа кой, базарда сат. Максат — пайда! Соодалашууну жана кайтарым берүүнү үйрөнөсүң.", tg: "Аз анбор моли арзон гир, нарх мон, дар бозор фурӯш. Мақсад — фоида! Савдо ва қайтарониро низ меомӯзӣ.", qr: "Qoymadan arzan tawar al, baha qoy, bazarda sat. Maqset — payda! Sawda hám qaytım bewdi úyreneseñ." },
  capital:    { uz: "Pulingiz", ru: "Ваши деньги", en: "Your money", kk: "Ақшаңыз", ky: "Акчаңыз", tg: "Пули шумо", qr: "Aqshañız" },
  step1:      { uz: "1-qadam: Mol oling", ru: "Шаг 1: Закупка", en: "Step 1: Stock up", kk: "1-қадам: Сатып алу", ky: "1-кадам: Сатып алуу", tg: "Қадами 1: Харид", qr: "1-qádem: Sawda alıw" },
  step2:      { uz: "2-qadam: Narx qo'ying", ru: "Шаг 2: Цены", en: "Step 2: Set prices", kk: "2-қадам: Баға", ky: "2-кадам: Баа", tg: "Қадами 2: Нарх", qr: "2-qádem: Baha" },
  costLabel:  { uz: "Olish narxi", ru: "Закупка", en: "Cost", kk: "Сатып алу", ky: "Алуу баасы", tg: "Нархи харид", qr: "Alıw bahası" },
  marketPrice:{ uz: "Bozor narxi", ru: "Рыночная цена", en: "Market price", kk: "Нарық бағасы", ky: "Базар баасы", tg: "Нархи бозор", qr: "Bazar bahası" },
  yourPrice:  { uz: "Sizning narx", ru: "Ваша цена", en: "Your price", kk: "Сіздің баға", ky: "Сиздин баа", tg: "Нархи шумо", qr: "Sizdiń baha" },
  spent:      { uz: "Sarflandi", ru: "Потрачено", en: "Spent", kk: "Жұмсалды", ky: "Жумшалды", tg: "Сарф шуд", qr: "Jumsaldı" },
  remaining:  { uz: "Qoldi", ru: "Осталось", en: "Left", kk: "Қалды", ky: "Калды", tg: "Монд", qr: "Qaldı" },
  toPricing:  { uz: "Narx qo'yishga →", ru: "К ценам →", en: "Set prices →", kk: "Бағаға →", ky: "Баага →", tg: "Ба нарх →", qr: "Bahaǵa →" },
  toMarket:   { uz: "Bozorga chiqish →", ru: "На базар →", en: "Go to bazaar →", kk: "Базарға →", ky: "Базарга →", tg: "Ба бозор →", qr: "Bazarǵa →" },
  belowCost:  { uz: "Zarar! Narx olish narxidan past.", ru: "Убыток! Цена ниже закупки.", en: "Loss! Price below cost.", kk: "Шығын! Баға сатып алудан төмен.", ky: "Зыян! Баа алуудан төмөн.", tg: "Зарар! Нарх аз харид пасттар.", qr: "Ziyan! Baha alıwdan tómen." },
  buyNothing: { uz: "Avval biror mol oling.", ru: "Сначала купите товар.", en: "Buy some goods first.", kk: "Алдымен тауар алыңыз.", ky: "Адегенде товар алыңыз.", tg: "Аввал мол харед.", qr: "Áwele tawar alıñız." },
  customerN:  { uz: "Mijoz {n}/{total}", ru: "Клиент {n}/{total}", en: "Customer {n}/{total}", kk: "Клиент {n}/{total}", ky: "Кардар {n}/{total}", tg: "Мизоҷ {n}/{total}", qr: "Kliyent {n}/{total}" },
  wants:      { uz: "{qty} {unit} {name} kerak", ru: "Нужно {qty} {unit} {name}", en: "Wants {qty} {unit} {name}", kk: "{qty} {unit} {name} керек", ky: "{qty} {unit} {name} керек", tg: "{qty} {unit} {name} лозим", qr: "{qty} {unit} {name} kerek" },
  totalIs:    { uz: "Jami: {sum}", ru: "Итого: {sum}", en: "Total: {sum}", kk: "Барлығы: {sum}", ky: "Баары: {sum}", tg: "Ҳамагӣ: {sum}", qr: "Bárligi: {sum}" },
  paysWith:   { uz: "Mijoz {note} berdi. Qancha qaytim?", ru: "Клиент дал {note}. Сколько сдачи?", en: "Customer paid {note}. How much change?", kk: "Клиент {note} берді. Қанша қайырым?", ky: "Кардар {note} берди. Канча кайтарым?", tg: "Мизоҷ {note} дод. Чанд қайтарон?", qr: "Kliyent {note} berdi. Qansha qaytım?" },
  sold:       { uz: "Sotildi! +{sum}", ru: "Продано! +{sum}", en: "Sold! +{sum}", kk: "Сатылды! +{sum}", ky: "Сатылды! +{sum}", tg: "Фурӯхта шуд! +{sum}", qr: "Satıldı! +{sum}" },
  rightChange:{ uz: "To'g'ri qaytim!", ru: "Верная сдача!", en: "Correct change!", kk: "Дұрыс қайырым!", ky: "Туура кайтарым!", tg: "Қайтарони дуруст!", qr: "Durıs qaytım!" },
  wrongChange:{ uz: "Qaytim noto'g'ri. To'g'risi: {sum}", ru: "Сдача неверна. Верно: {sum}", en: "Wrong change. Correct: {sum}", kk: "Қайырым қате. Дұрысы: {sum}", ky: "Кайтарым туура эмес. Туурасы: {sum}", tg: "Қайтарон нодуруст. Дуруст: {sum}", qr: "Qaytım qáte. Durısı: {sum}" },
  haggle:     { uz: "Mijoz {offer} taklif qilyapti (siz {ask} so'radingiz).", ru: "Клиент предлагает {offer} (вы просите {ask}).", en: "Customer offers {offer} (you asked {ask}).", kk: "Клиент {offer} ұсынады (сіз {ask} сұрадыңыз).", ky: "Кардар {offer} сунуштайт (сиз {ask} сурадыңыз).", tg: "Мизоҷ {offer} пешниҳод мекунад (шумо {ask} хостед).", qr: "Kliyent {offer} usınıp atır (siz {ask} soradıñız)." },
  accept:     { uz: "Roziman", ru: "Согласен", en: "Accept", kk: "Келісемін", ky: "Макулмун", tg: "Розӣ", qr: "Kelisemen" },
  decline:    { uz: "Yo'q", ru: "Нет", en: "Decline", kk: "Жоқ", ky: "Жок", tg: "Не", qr: "Joq" },
  declined:   { uz: "Kelishmadi — mijoz ketdi.", ru: "Не сошлись — клиент ушёл.", en: "No deal — customer left.", kk: "Келіспеді — клиент кетті.", ky: "Келишпеди — кардар кетти.", tg: "Наомад — мизоҷ рафт.", qr: "Kelispedi — kliyent ketti." },
  tooPricey:  { uz: "Juda qimmat! Mijoz ketdi.", ru: "Слишком дорого! Клиент ушёл.", en: "Too pricey! Customer left.", kk: "Тым қымбат! Клиент кетті.", ky: "Өтө кымбат! Кардар кетти.", tg: "Хеле қимат! Мизоҷ рафт.", qr: "Júdá qımbat! Kliyent ketti." },
  soldOut:    { uz: "Bu mol tugadi — mijoz ketdi.", ru: "Товар кончился — клиент ушёл.", en: "Out of stock — customer left.", kk: "Тауар бітті — клиент кетті.", ky: "Товар түгөндү — кардар кетти.", tg: "Мол тамом шуд — мизоҷ рафт.", qr: "Tawar bitti — kliyent ketti." },
  next:       { uz: "Keyingi →", ru: "Далее →", en: "Next →", kk: "Келесі →", ky: "Кийинки →", tg: "Баъдӣ →", qr: "Keyingi →" },
  dayOver:    { uz: "Kun yakunlandi", ru: "День завершён", en: "Day over", kk: "Күн аяқталды", ky: "Күн бүттү", tg: "Рӯз тамом", qr: "Kún tamamlandı" },
  revenue:    { uz: "Daromad (sotuv)", ru: "Выручка", en: "Revenue", kk: "Түсім", ky: "Түшүм", tg: "Даромад", qr: "Kirim" },
  costOut:    { uz: "Xarajat (mol)", ru: "Затраты", en: "Cost", kk: "Шығын", ky: "Чыгым", tg: "Хароҷот", qr: "Xarajat" },
  profit:     { uz: "Foyda", ru: "Прибыль", en: "Profit", kk: "Пайда", ky: "Пайда", tg: "Фоида", qr: "Payda" },
  loss:       { uz: "Zarar", ru: "Убыток", en: "Loss", kk: "Шығын", ky: "Зыян", tg: "Зарар", qr: "Ziyan" },
  unsold:     { uz: "Sotilmagan", ru: "Не продано", en: "Unsold", kk: "Сатылмады", ky: "Сатылган жок", tg: "Нофурӯхта", qr: "Satılmadı" },
  coinsW:     { uz: "Tanga", ru: "Монеты", en: "Coins", kk: "Тиын", ky: "Тыйын", tg: "Танга", qr: "Tıyın" },
  tipHighPrice:{ uz: "💡 Narxni bozorga yaqin qo'y — juda qimmat qo'ysang mijozlar ketadi.", ru: "💡 Держи цену ближе к рыночной — при завышении клиенты уходят.", en: "💡 Keep prices near market — too high and customers leave.", kk: "💡 Бағаны нарыққа жақын ұста — тым қымбат болса клиент кетеді.", ky: "💡 Бааны базарга жакын карма — өтө кымбат болсо кардарлар кетет.", tg: "💡 Нархро ба бозор наздик нигоҳ дор — хеле қимат бошад, мизоҷон мераванд.", qr: "💡 Bahanı bazarǵa jaqın usta — júdá qımbat bolsa kliyentler ketedi." },
  tipOverbuy: { uz: "💡 Ko'p mol olib sotolmasang — pul molda qolib zarar bo'ladi.", ru: "💡 Закупишь много и не продашь — деньги застрянут в товаре.", en: "💡 Overbuy and you can't sell — money gets stuck in stock.", kk: "💡 Көп алып сатпасаң — ақша тауарда қалады.", ky: "💡 Көп алып сатпасаң — акча товордо калат.", tg: "💡 Бисёр гирӣ ва нафурӯшӣ — пул дар мол мемонад.", qr: "💡 Kóp alıp satpasañ — aqsha tawarda qaladı." },
  tipLowPrice:{ uz: "💡 Juda arzon sotma — foyda oz bo'ladi. Olish narxidan yuqori qo'y.", ru: "💡 Не продавай слишком дёшево — мало прибыли. Ставь выше закупки.", en: "💡 Don't sell too cheap — low profit. Price above cost.", kk: "💡 Тым арзан сатпа — пайда аз. Сатып алудан жоғары қой.", ky: "💡 Өтө арзан сатпа — пайда аз. Алуудан жогору кой.", tg: "💡 Хеле арзон нафурӯш — фоида кам. Аз харид болотар мон.", qr: "💡 Júdá arzan satpa — payda az. Alıwdan joqarı qoy." },
  tipGreat:   { uz: "🎉 Zo'r savdo! Narx va mol miqdorini yaxshi muvozanatladingiz.", ru: "🎉 Отличная торговля! Хороший баланс цены и запаса.", en: "🎉 Great trading! Nice balance of price and stock.", kk: "🎉 Керемет сауда! Баға мен қорды жақсы теңгердіңіз.", ky: "🎉 Сонун соода! Баа менен корду жакшы тең салмактадыңыз.", tg: "🎉 Савдои олӣ! Нарх ва захираро хуб мувозна кардед.", qr: "🎉 Ájayıp sawda! Baha menen qordı jaqsı teństirdiñiz." },
  start:      { uz: "Boshlash", ru: "Начать", en: "Start", kk: "Бастау", ky: "Баштоо", tg: "Оғоз", qr: "Baslaw" },
  again:      { uz: "Yana o'ynash", ru: "Играть снова", en: "Play again", kk: "Қайта ойнау", ky: "Кайра ойноо", tg: "Боз бозӣ", qr: "Qayta oynaw" },
  back:       { uz: "Orqaga", ru: "Назад", en: "Back", kk: "Артқа", ky: "Артка", tg: "Бозгашт", qr: "Artqa" },
};

export default function BozorGame({ user, lg = "uz", dark, gameId = "finance/bozor", name, onBack }) {
  const th = dark ? PALETTE.dark : PALETTE.light;
  const { t } = useApp();
  const nm = (o) => (o && (o[lg] || o.uz)) || "";
  const tr = (k, vars) => {
    let s = (T[k] && (T[k][lg] || T[k].uz)) || k;
    if (vars) for (const key in vars) s = s.replace(new RegExp("\\{" + key + "\\}", "g"), vars[key]);
    return s;
  };

  const [phase, setPhase] = useState("intro"); // intro|restock|pricing|market|result
  const [cart, setCart] = useState(() => Object.fromEntries(BOZOR_PRODUCTS.map(p => [p.id, 0])));
  const [prices, setPrices] = useState(() => Object.fromEntries(BOZOR_PRODUCTS.map(p => [p.id, p.fair])));
  const [customers, setCustomers] = useState([]);
  const [ci, setCi] = useState(0);
  const [stock, setStock] = useState({});
  const [revenue, setRevenue] = useState(0);
  const [outcome, setOutcome] = useState(null); // joriy mijoz natijasi ko'rsatilgani
  const [changeTask, setChangeTask] = useState(null);
  const [tally, setTally] = useState({ leftPrice: 0, declined: 0, soldOut: 0, sold: 0 });
  const [result, setResult] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const savingRef = useRef(false);

  const spent = BOZOR_PRODUCTS.reduce((s, p) => s + cart[p.id] * p.cost, 0);
  const remaining = CAPITAL - spent;

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Faza o'tishlari ──
  const beginGame = () => {
    setCart(Object.fromEntries(BOZOR_PRODUCTS.map(p => [p.id, 0])));
    setPrices(Object.fromEntries(BOZOR_PRODUCTS.map(p => [p.id, p.fair])));
    setCustomers([]); setCi(0); setStock({}); setRevenue(0);
    setOutcome(null); setChangeTask(null);
    setTally({ leftPrice: 0, declined: 0, soldOut: 0, sold: 0 });
    setResult(null); setSeconds(0); savingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    setPhase("restock");
  };

  const buyStep = (id, delta) => {
    setCart(prev => {
      const p = BOZOR_PRODUCTS.find(x => x.id === id);
      const nextQty = Math.max(0, prev[id] + delta);
      const nextSpent = BOZOR_PRODUCTS.reduce((s, x) => s + (x.id === id ? nextQty : prev[x.id]) * x.cost, 0);
      if (nextSpent > CAPITAL) return prev; // pul yetmasa — o'zgarmaydi
      playSound.tick();
      return { ...prev, [id]: nextQty };
    });
  };

  const priceStep = (id, delta) => {
    setPrices(prev => ({ ...prev, [id]: Math.max(500, prev[id] + delta) }));
    playSound.tick();
  };

  const goPricing = () => {
    const anyBought = BOZOR_PRODUCTS.some(p => cart[p.id] > 0);
    if (!anyBought) return;
    setPhase("pricing");
  };

  const generateCustomers = () => {
    // Talab bo'yicha vaznli hovuz (faqat olingan mollar)
    const pool = [];
    BOZOR_PRODUCTS.forEach(p => { if (cart[p.id] > 0) for (let i = 0; i < p.demand; i++) pool.push(p); });
    if (pool.length === 0) return [];
    const list = [];
    for (let n = 0; n < CUSTOMERS; n++) {
      const p = pool[rnd(0, pool.length - 1)];
      const qty = Math.random() < 0.55 ? 1 : Math.random() < 0.8 ? 2 : 3;
      const willUnit = round500(p.fair * (0.85 + Math.random() * 0.35)); // to'lashga tayyor narx (birlik)
      const my = prices[p.id];
      let kind, offerUnit = 0, note = 0;
      if (my <= willUnit) {
        kind = "buy";
        // ba'zan yirik pul bilan to'laydi → qaytim vazifasi
        const total = my * qty;
        if (Math.random() < 0.5) {
          const bigger = NOTES.filter(nt => nt > total);
          if (bigger.length) note = bigger[0];
        }
      } else if (my <= Math.round(willUnit * 1.15)) {
        kind = "haggle";
        offerUnit = willUnit;
      } else {
        kind = "leave";
      }
      list.push({ pid: p.id, qty, willUnit, kind, offerUnit, note });
    }
    return list;
  };

  const goMarket = () => {
    setStock({ ...cart });
    setCustomers(generateCustomers());
    setCi(0); setRevenue(0); setOutcome(null); setChangeTask(null);
    setTally({ leftPrice: 0, declined: 0, soldOut: 0, sold: 0 });
    setPhase("market");
  };

  // ── Sotuvni yakunlash (mol beriladi, pul olinadi) ──
  const finalizeSale = (pid, qty, unitPrice) => {
    const sum = unitPrice * qty;
    setRevenue(r => r + sum);
    setStock(s => ({ ...s, [pid]: s[pid] - qty }));
    setTally(x => ({ ...x, sold: x.sold + qty }));
    playSound.correct();
    setOutcome({ type: "sold", sum });
  };

  // Joriy mijozni ishga tushirish (stok tekshiruvi + tur bo'yicha)
  const serveCustomer = useCallback(() => {
    const c = customers[ci];
    if (!c) return;
    const avail = Math.min(c.qty, stock[c.pid] || 0);
    if (avail <= 0) {
      setTally(x => ({ ...x, soldOut: x.soldOut + 1 }));
      playSound.wrong();
      setOutcome({ type: "soldout" });
      return;
    }
    const qty = avail;
    if (c.kind === "leave") {
      setTally(x => ({ ...x, leftPrice: x.leftPrice + 1 }));
      playSound.wrong();
      setOutcome({ type: "leave" });
    } else if (c.kind === "buy") {
      const total = prices[c.pid] * qty;
      if (c.note && c.note > total) {
        // qaytim vazifasi
        const due = c.note - total;
        const opts = new Set([due]);
        let g = 0;
        while (opts.size < 4 && g < 40) { g++; const d = round500(due + (Math.random() < 0.5 ? 1 : -1) * rnd(1, 4) * 500); if (d > 0) opts.add(d); }
        let ex = due + 500; while (opts.size < 4) { if (ex > 0) opts.add(ex); ex += 500; }
        const options = [...opts].sort(() => Math.random() - 0.5);
        setChangeTask({ pid: c.pid, qty, unitPrice: prices[c.pid], due, note: c.note, total, options, picked: null });
        setOutcome(null);
      } else {
        finalizeSale(c.pid, qty, prices[c.pid]);
      }
    } else if (c.kind === "haggle") {
      setOutcome({ type: "haggle", qty });
    }
  }, [customers, ci, stock, prices]);

  // Har mijozga o'tganda avtomatik xizmat
  useEffect(() => {
    if (phase !== "market") return;
    if (ci >= customers.length) { finishDay(); return; }
    setOutcome(null); setChangeTask(null);
    const id = setTimeout(serveCustomer, 60);
    return () => clearTimeout(id);
  }, [ci, phase, customers.length]);

  const pickChange = (val) => {
    if (!changeTask || changeTask.picked != null) return;
    const correct = val === changeTask.due;
    setChangeTask(ct => ({ ...ct, picked: val, correct }));
    if (correct) playSound.correct(); else playSound.wrong();
    // Sotuv baribir amalga oshadi (pul olinadi, mol beriladi)
    const sum = changeTask.unitPrice * changeTask.qty;
    setRevenue(r => r + sum);
    setStock(s => ({ ...s, [changeTask.pid]: s[changeTask.pid] - changeTask.qty }));
    setTally(x => ({ ...x, sold: x.sold + changeTask.qty }));
  };

  const acceptHaggle = () => {
    const c = customers[ci];
    const qty = outcome?.qty || Math.min(c.qty, stock[c.pid] || 0);
    finalizeSale(c.pid, qty, c.offerUnit);
  };
  const declineHaggle = () => {
    setTally(x => ({ ...x, declined: x.declined + 1 }));
    playSound.wrong();
    setOutcome({ type: "declined" });
  };

  const nextCustomer = () => setCi(i => i + 1);

  // ── Kun yakuni ──
  const finishDay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const totalCost = spent;
    const profit = revenue - totalCost;
    const unsold = BOZOR_PRODUCTS.reduce((s, p) => s + (stock[p.id] || 0), 0);
    const stars = profit >= TARGET_PROFIT ? 3 : profit >= TARGET_PROFIT * 0.6 ? 2 : profit > 0 ? 1 : 0;

    // Maslahat
    let tip = "tipGreat";
    if (stars < 3) {
      if (tally.leftPrice >= 2) tip = "tipHighPrice";
      else if (unsold >= 3) tip = "tipOverbuy";
      else if (profit <= 0) tip = "tipLowPrice";
      else tip = "tipOverbuy";
    }

    setResult({ revenue, totalCost, profit, unsold, stars, tip });
    (stars > 0 ? playSound.victory : playSound.wrong)();
    setPhase("result");

    if (user?.id && !savingRef.current) {
      savingRef.current = true;
      (async () => {
        const sessions = await readSessions(user.id);
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        const playedToday = sessions.filter(s => s && s.date === today && s.gameId === gameId).length;
        let mult = 1.0;
        if (playedToday === 1) mult = 0.6; else if (playedToday === 2) mult = 0.3; else if (playedToday >= 3) mult = 0.1;

        const baseCoins = Math.max(1, Math.min(45, Math.round(Math.max(0, profit) / 1200)));
        const finalCoins = Math.max(1, Math.round(baseCoins * mult));
        const xpGain = Math.max(2, Math.round(baseCoins * 2));

        const beforeXp = await readXp(user.id);
        await addCoins(user.id, finalCoins);
        const afterXp = await addXp(user.id, xpGain);
        const prevBest = await bestForGame(user.id, gameId);
        await logGameSession(user.id, {
          gameId, subject: "finance", correct: tally.sold, total: CUSTOMERS,
          pct: Math.round((profit >= TARGET_PROFIT ? 100 : Math.max(0, profit) / TARGET_PROFIT * 100)),
          seconds, coins: finalCoins, xp: xpGain, difficulty: "hard",
          newRecord: finalCoins > prevBest, starsEarned: stars,
        });
        setResult(r => r ? { ...r, coins: finalCoins, xp: xpGain, levelUp: didLevelUp(beforeXp, afterXp), newLevel: levelFor(afterXp).level } : r);
      })();
    }
  };

  // ═══════════════ RENDER ═══════════════
  const card = (extra) => ({ background: th.sur, border: "1px solid " + th.bor, borderRadius: RADIUS.l, padding: SPACE.s4, ...extra });
  const stepBtn = (onClick, label, disabled) => (
    <button className="ui-press" onClick={onClick} disabled={disabled} style={{
      width: 36, height: 36, borderRadius: RADIUS.m, border: "1px solid " + th.bor,
      background: disabled ? th.bor : th.surH || th.sur, color: th.t1, fontSize: 20, fontWeight: 800,
      cursor: disabled ? "default" : "pointer", fontFamily: "inherit", flexShrink: 0,
    }}>{label}</button>
  );

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <div style={{ textAlign: "center", padding: SPACE.s6 + "px " + SPACE.s4 }}>
        <PageHeader th={th} title={tr("title")} onBack={onBack} />
        <div style={{ fontSize: 56, margin: SPACE.s4 + "px 0" }}>🏪</div>
        <h2 style={{ ...TYPE.heading, color: th.t1 }}>{tr("introH")}</h2>
        <p style={{ ...TYPE.caption, color: th.t2, margin: SPACE.s3 + "px auto", maxWidth: 340, lineHeight: 1.5 }}>{tr("introP")}</p>
        <div style={{ ...TYPE.subtitle, color: PREMIUM.gold, fontWeight: 800, marginBottom: SPACE.s4 }}>💰 {tr("capital")}: {f(CAPITAL, true)}</div>
        <PrimaryButton th={th} onClick={beginGame}>{tr("start")}</PrimaryButton>
      </div>
    );
  }

  // ── RESTOCK (mol olish) ──
  if (phase === "restock") {
    return (
      <div style={{ paddingBottom: SPACE.s8 }}>
        <PageHeader th={th} title={tr("step1")} onBack={onBack} />
        <div style={{ display: "flex", justifyContent: "space-between", margin: SPACE.s3 + "px 0", padding: SPACE.s3, borderRadius: RADIUS.m, background: th.ac + ALPHA.faint }}>
          <span style={{ ...TYPE.caption, color: th.t2 }}>{tr("remaining")}</span>
          <span style={{ ...TYPE.subtitle, fontWeight: 800, color: remaining >= 0 ? th.gr : th.rd }}>{f(remaining, true)}</span>
        </div>
        {BOZOR_PRODUCTS.map(p => (
          <div key={p.id} style={{ ...card(), marginBottom: SPACE.s3, display: "flex", alignItems: "center", gap: SPACE.s3 }}>
            <div style={{ fontSize: 34 }}>{p.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1 }}>{nm(p.name)}</div>
              <div style={{ ...TYPE.tiny, color: th.t2 }}>{tr("costLabel")}: {f(p.cost, true)} / {nm(p.unit)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 }}>
              {stepBtn(() => buyStep(p.id, -1), "−", cart[p.id] <= 0)}
              <span style={{ minWidth: 28, textAlign: "center", ...TYPE.subtitle, fontWeight: 800, color: th.t1 }}>{cart[p.id]}</span>
              {stepBtn(() => buyStep(p.id, +1), "+", remaining < p.cost)}
            </div>
          </div>
        ))}
        <PrimaryButton th={th} onClick={goPricing} style={{ marginTop: SPACE.s2, opacity: BOZOR_PRODUCTS.some(p => cart[p.id] > 0) ? 1 : 0.5 }}>{tr("toPricing")}</PrimaryButton>
      </div>
    );
  }

  // ── PRICING (narx qo'yish) ──
  if (phase === "pricing") {
    return (
      <div style={{ paddingBottom: SPACE.s8 }}>
        <PageHeader th={th} title={tr("step2")} onBack={() => setPhase("restock")} />
        {BOZOR_PRODUCTS.filter(p => cart[p.id] > 0).map(p => {
          const below = prices[p.id] < p.cost;
          return (
            <div key={p.id} style={{ ...card(), marginBottom: SPACE.s3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3, marginBottom: SPACE.s2 }}>
                <div style={{ fontSize: 30 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1 }}>{nm(p.name)} × {cart[p.id]}</div>
                  <div style={{ ...TYPE.tiny, color: th.t2 }}>{tr("costLabel")}: {f(p.cost, true)} · {tr("marketPrice")}: ~{f(p.fair, true)}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.s2 }}>
                <span style={{ ...TYPE.tiny, color: th.t2 }}>{tr("yourPrice")}</span>
                <div style={{ display: "flex", alignItems: "center", gap: SPACE.s2 }}>
                  {stepBtn(() => priceStep(p.id, -500), "−")}
                  <span style={{ minWidth: 84, textAlign: "center", ...TYPE.subtitle, fontWeight: 800, color: below ? th.rd : th.gr }}>{f(prices[p.id], true)}</span>
                  {stepBtn(() => priceStep(p.id, +500), "+")}
                </div>
              </div>
              {below && <div style={{ ...TYPE.tiny, color: th.rd, marginTop: SPACE.s2 }}>{tr("belowCost")}</div>}
            </div>
          );
        })}
        <PrimaryButton th={th} onClick={goMarket} style={{ marginTop: SPACE.s2 }}>{tr("toMarket")}</PrimaryButton>
      </div>
    );
  }

  // ── RESULT ──
  if (phase === "result" && result) {
    const win = result.stars > 0;
    return (
      <div style={{ paddingBottom: SPACE.s8 }}>
        <PageHeader th={th} title={tr("dayOver")} onBack={onBack} />
        <div style={{ textAlign: "center", margin: SPACE.s5 + "px 0" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: SPACE.s3 }}>
            {[1, 2, 3].map(s => (
              <svg key={s} width="34" height="34" viewBox="0 0 24 24" fill={result.stars >= s ? PREMIUM.gold : "none"} stroke={result.stars >= s ? PREMIUM.gold : th.bor} strokeWidth="1.6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: result.profit >= 0 ? th.gr : th.rd }}>
            {result.profit >= 0 ? "+" : ""}{f(result.profit, true)}
          </div>
          <div style={{ ...TYPE.caption, color: th.t2 }}>{result.profit >= 0 ? tr("profit") : tr("loss")}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatCard th={th} value={f(result.revenue, true)} label={tr("revenue")} tone={th.gr} />
          <StatCard th={th} value={f(result.totalCost, true)} label={tr("costOut")} tone={th.rd} />
          <StatCard th={th} value={String(result.unsold)} label={tr("unsold")} tone={th.am} />
          <StatCard th={th} value={`+${result.coins ?? "…"}`} label={tr("coinsW")} tone={PREMIUM.gold} />
        </div>

        <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med, marginBottom: SPACE.s4 }}>
          <div style={{ ...TYPE.caption, color: th.t1, lineHeight: 1.5 }}>{tr(result.tip)}</div>
        </AppCard>

        {result.levelUp && result.newLevel && (
          <div style={{ textAlign: "center", marginBottom: SPACE.s3 }}>
            <Badge th={th} type="premium" icon={null}>LEVEL {result.newLevel}</Badge>
          </div>
        )}

        <PrimaryButton th={th} onClick={beginGame}>{tr("again")}</PrimaryButton>
        <button className="ui-press" onClick={onBack} style={{ width: "100%", marginTop: SPACE.s2, background: "transparent", border: "none", color: th.t2, padding: SPACE.s3, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{tr("back")}</button>
      </div>
    );
  }

  // ── MARKET (sotish) ──
  const c = customers[ci];
  const p = c ? BOZOR_PRODUCTS.find(x => x.id === c.pid) : null;
  const avail = c ? Math.min(c.qty, stock[c.pid] || 0) : 0;

  return (
    <div style={{ minHeight: "70vh", paddingBottom: SPACE.s8 }}>
      <PageHeader th={th} title={tr("title")} onBack={onBack} />

      {/* Yuqori panel: daromad + progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: SPACE.s2 + "px 0 " + SPACE.s3 }}>
        <span style={{ ...TYPE.subtitle, color: PREMIUM.gold, fontWeight: 800 }}>💰 {f(revenue, true)}</span>
        <span style={{ ...TYPE.caption, color: th.t2, fontWeight: 700 }}>{tr("customerN", { n: Math.min(ci + 1, customers.length), total: customers.length })}</span>
      </div>
      <div style={{ display: "flex", gap: 3, marginBottom: SPACE.s4 }}>
        {customers.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: RADIUS.full, background: i < ci ? th.gr : i === ci ? th.ac : th.bor }} />
        ))}
      </div>

      {c && p && (
        <div style={{ ...card({ padding: SPACE.s5 }), textAlign: "center" }}>
          <div style={{ fontSize: 46 }}>🧑‍🦱</div>
          <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.t1, marginTop: SPACE.s2 }}>
            {p.icon} {tr("wants", { qty: c.qty, unit: nm(p.unit), name: nm(p.name) })}
          </div>

          {/* Qaytim vazifasi */}
          {changeTask ? (
            <div style={{ marginTop: SPACE.s4 }}>
              <div style={{ ...TYPE.caption, color: th.t1, marginBottom: SPACE.s1 }}>{tr("totalIs", { sum: f(changeTask.total, true) })}</div>
              <div style={{ ...TYPE.subtitle, fontWeight: 800, color: th.ac, marginBottom: SPACE.s3 }}>{tr("paysWith", { note: f(changeTask.note, true) })}</div>
              {changeTask.picked == null ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2 }}>
                  {changeTask.options.map((o, i) => (
                    <button key={i} className="ui-press" onClick={() => pickChange(o)} style={{ padding: SPACE.s4, borderRadius: RADIUS.m, border: "2px solid " + th.bor, background: th.surH || th.sur, color: th.t1, fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>{f(o, true)}</button>
                  ))}
                </div>
              ) : (
                <div>
                  <div style={{ ...TYPE.subtitle, fontWeight: 800, color: changeTask.correct ? th.gr : th.rd, marginBottom: SPACE.s3 }}>
                    {changeTask.correct ? tr("rightChange") : tr("wrongChange", { sum: f(changeTask.due, true) })}
                  </div>
                  <PrimaryButton th={th} onClick={nextCustomer}>{tr("next")}</PrimaryButton>
                </div>
              )}
            </div>
          ) : outcome?.type === "haggle" ? (
            <div style={{ marginTop: SPACE.s4 }}>
              <div style={{ ...TYPE.caption, color: th.t1, marginBottom: SPACE.s3, lineHeight: 1.5 }}>
                {tr("haggle", { offer: f(c.offerUnit * avail, true), ask: f(prices[c.pid] * avail, true) })}
              </div>
              <div style={{ display: "flex", gap: SPACE.s2 }}>
                <PrimaryButton th={th} onClick={acceptHaggle} style={{ flex: 1, background: th.gr }}>{tr("accept")}</PrimaryButton>
                <PrimaryButton th={th} onClick={declineHaggle} style={{ flex: 1, background: th.rd }}>{tr("decline")}</PrimaryButton>
              </div>
            </div>
          ) : outcome ? (
            <div style={{ marginTop: SPACE.s4 }}>
              <div style={{ ...TYPE.subtitle, fontWeight: 800, marginBottom: SPACE.s3, color: outcome.type === "sold" ? th.gr : th.rd }}>
                {outcome.type === "sold" ? tr("sold", { sum: f(outcome.sum, true) })
                  : outcome.type === "leave" ? tr("tooPricey")
                  : outcome.type === "declined" ? tr("declined")
                  : tr("soldOut")}
              </div>
              <PrimaryButton th={th} onClick={nextCustomer}>{tr("next")}</PrimaryButton>
            </div>
          ) : (
            <div style={{ marginTop: SPACE.s4, ...TYPE.caption, color: th.t3 }}>…</div>
          )}
        </div>
      )}
    </div>
  );
}
