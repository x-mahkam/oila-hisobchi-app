import { useState, useEffect, useRef } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, PREMIUM, PALETTE } from "../../utils/tokens.js";
import { useGameEngine } from "../engine/useGameEngine.js";
import { oddOneOutGenerator } from "./generators/oddOneOut.js";
import { addCoins, logGameSession, saveLevelProgress, dailyCoinMultiplier } from "../engine/persist.js";
import { addXp } from "../engine/xp.js";
import { playSound } from "../engine/sound.js";
import { starsFor } from "./levels/logicLevels.js";
import { Flame, Star, AlertCircle, Sparkles, ArrowRight } from "lucide-react";

// Inline beautiful SVG outline representations for Odd One Out Items
export const OddOneOutIcon = ({ iconId, color, size = 36 }) => {
  const s = size;
  const fillOpacity = 0.12;

  switch (iconId) {
    case "apple":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c-4.4 0-8-3.6-8-8 0-3.1 1.7-5.8 4.2-7.1C9.1 5.3 10.5 4.5 12 4.5s2.9.8 3.8 2.4c2.5 1.3 4.2 4 4.2 7.1 0 4.4-3.6 8-8 8z" fill={color} fillOpacity={fillOpacity} />
          <path d="M12 4V2M15 3.5c-1-1-2.5-.5-3 .5" />
        </svg>
      );
    case "bread":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M3 12a9 9 0 0118 0v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z" fill={color} fillOpacity={fillOpacity} />
          <path d="M8 12c.5-1 1.5-1 2 0M14 12c.5-1 1.5-1 2 0" />
        </svg>
      );
    case "milk":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M6 10l2-6h8l2 6v10a2 2 0 01-2 2H8a2 2 0 01-2-2V10z" fill={color} fillOpacity={fillOpacity} />
          <path d="M6 11h12M10 15a2 2 0 104 0" />
        </svg>
      );
    case "toy":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="2" y="8" width="20" height="9" rx="2" fill={color} fillOpacity={fillOpacity} />
          <circle cx="6" cy="19" r="2.5" fill={color} />
          <circle cx="18" cy="19" r="2.5" fill={color} />
          <path d="M14 8h-4l1-3h2Z" />
        </svg>
      );
    case "dollar":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" fill={color} fillOpacity={fillOpacity} />
          <path d="M12 6v12M14.5 9H11a2 2 0 100 4h2a2 2 0 110 4H9.5" />
        </svg>
      );
    case "euro":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" fill={color} fillOpacity={fillOpacity} />
          <path d="M15 9.5a4 4 0 100 5M9 11h5M9 13h5" />
        </svg>
      );
    case "uzs":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" fill={color} fillOpacity={fillOpacity} />
          <path d="M9 9h4c1.5 0 2 .5 2 1.5s-.5 1.5-2 1.5H9v4M11 12h4" />
        </svg>
      );
    case "game_coin":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" fill={color} fillOpacity={fillOpacity} />
          <polygon points="12 6 13.85 10.33 18.5 10.64 14.9 13.61 16.03 18.14 12 15.65 7.97 18.14 9.1 13.61 5.5 10.64 10.15 10.33 12 6" />
        </svg>
      );
    case "income":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" fill={color} fillOpacity={fillOpacity} />
          <path d="m12 15 3-3-3-3M15 12H9" />
        </svg>
      );
    case "gift":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="3" y="9" width="18" height="12" rx="2" fill={color} fillOpacity={fillOpacity} />
          <line x1="12" y1="9" x2="12" y2="21" />
          <line x1="3" y1="13" x2="21" y2="13" />
          <path d="M12 9A3 3 0 009 6a3 3 0 003 3M12 9a3 3 0 013-3 3 3 0 01-3 3" />
        </svg>
      );
    case "cashback":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M21 12a9 9 0 11-9-9" />
          <path d="M12 7V3h4" />
          <path d="M20 7l-4 4" fill={color} fillOpacity={fillOpacity} />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "expense":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" fill={color} fillOpacity={fillOpacity} />
          <path d="m12 9-3 3 3 3M9 12h6" />
        </svg>
      );
    case "notebook":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="5" y="3" width="15" height="18" rx="2" fill={color} fillOpacity={fillOpacity} />
          <path d="M5 6h3M5 10h3M5 14h3M5 18h3" />
        </svg>
      );
    case "pencil":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M18 2L22 6L9 19L5 19L5 15L18 2Z" fill={color} fillOpacity={fillOpacity} />
          <line x1="15" y1="5" x2="19" y2="9" />
        </svg>
      );
    case "eraser":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M18 10L14 14M22 14l-6 6M2 17l6-6L22 11l-6 6-10 4-4-4Z" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
    case "gamepad":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="6" fill={color} fillOpacity={fillOpacity} />
          <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
        </svg>
      );
    case "utilities":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
          <circle cx="12" cy="12" r="4" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
    case "cinema":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="3" y="6" width="18" height="12" rx="2" fill={color} fillOpacity={fillOpacity} />
          <path d="M10 10v4l4-2z" />
          <line x1="3" y1="10" x2="6" y2="10" />
          <line x1="3" y1="14" x2="6" y2="14" />
          <line x1="18" y1="10" x2="21" y2="10" />
          <line x1="18" y1="14" x2="21" y2="14" />
        </svg>
      );
    case "bank":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M3 21h18M3 10h18" />
          <polygon points="12 2 2 10 22 10 12 2" fill={color} fillOpacity={fillOpacity} />
          <line x1="6" y1="10" x2="6" y2="21" />
          <line x1="11" y1="10" x2="11" y2="21" />
          <line x1="13" y1="10" x2="13" y2="21" />
          <line x1="18" y1="10" x2="18" y2="21" />
        </svg>
      );
    case "safe":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" fill={color} fillOpacity={fillOpacity} />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      );
    case "lottery":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" transform="rotate(-5 12 12)" fill={color} fillOpacity={fillOpacity} />
          <circle cx="7" cy="12" r="2" />
          <line x1="12" y1="9" x2="18" y2="9" />
          <line x1="12" y1="12" x2="18" y2="12" />
          <line x1="12" y1="15" x2="18" y2="15" />
        </svg>
      );
    case "eco":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 0110 10c0 5.5-4.5 10-10 10S2 17.5 2 12a10 10 0 0110-10z" fill={color} fillOpacity={fillOpacity} />
          <path d="M12 8l-2 4h4l-2 4" />
        </svg>
      );
    case "bike":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="5.5" cy="14" r="3.5" fill={color} fillOpacity={fillOpacity} />
          <circle cx="18.5" cy="14" r="3.5" fill={color} fillOpacity={fillOpacity} />
          <path d="M12 14l3-7h3M5.5 14L9 7h3" />
        </svg>
      );
    case "waste":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" fill={color} fillOpacity={fillOpacity} />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );
    case "sweets":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M12 6a6 6 0 016 6v3H6v-3a6 6 0 016-6z" fill={color} fillOpacity={fillOpacity} />
          <rect x="4" y="15" width="16" height="4" rx="1" />
        </svg>
      );
    case "soda":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="6" y="5" width="12" height="15" rx="3" fill={color} fillOpacity={fillOpacity} />
          <path d="M12 5V2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
      );
    case "water":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M12 22a7 7 0 007-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 007 7z" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
    case "house":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill={color} fillOpacity={fillOpacity} />
          <rect x="9" y="14" width="6" height="8" />
        </svg>
      );
    case "education":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" fill={color} fillOpacity={fillOpacity} />
          <path d="M4.5 12v5a3 3 0 003 3h9a3 3 0 003-3v-5" />
        </svg>
      );
    case "business":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" fill={color} fillOpacity={fillOpacity} />
          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
        </svg>
      );
    case "shoes":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16a2 2 0 002-2v-3l-7-3-5 1L4 10v6a2 2 0 002 2" fill={color} fillOpacity={fillOpacity} />
          <path d="M8 11V8M12 11V9" />
        </svg>
      );
    case "gold":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" fill={color} fillOpacity={fillOpacity} />
          <rect x="8" y="8" width="8" height="8" transform="rotate(45 12 12)" />
        </svg>
      );
    case "stock":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" fill={color} fillOpacity={fillOpacity} />
          <path d="m16 9-4 4-2-2-4 4" />
          <path d="M12 9h4v4" />
        </svg>
      );
    case "savings":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 5c-1.5 0-2.8.9-3.4 2.2C14.8 6.3 13.5 5.5 12 5.5s-2.8.8-3.6 2.2C7.8 6.4 6.5 5.5 5 5.5 2.2 5.5 0 7.8 0 10.5c0 4.5 4.5 9.5 12 11.5 7.5-2 12-7 12-11.5C24 7.8 21.8 5.5 19 5.5z" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
    case "car":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-3-3-3h-4C7.3 7 6 10 6 10s-2.7.6-4.5 1.1C.7 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2" fill={color} fillOpacity={fillOpacity} />
          <circle cx="6" cy="17" r="2.5" fill={color} />
          <circle cx="16" cy="17" r="2.5" fill={color} />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

const T = {
  gameTitle: {
    uz: "Toq narsani top",
    ru: "Найди лишнее",
    en: "Odd One Out",
    kk: "Артығын тап",
    ky: "Ашыкчасын тап",
    tg: "Чизики бегонаро ёб",
    qr: "Artig'in tap"
  },
  instruction: {
    uz: "Guruhdagi boshqacha narsani top",
    ru: "Найди то, что отличается",
    en: "Find the One that is Different",
    kk: "Топтағы өзгеше затты тап",
    ky: "Топтогу башкача нерсени тап",
    tg: "Чизики аз гурӯҳ фарқкунандаро ёб",
    qr: "Topatag'i bas'qasha zatti tap"
  },
  description: {
    uz: "4 ta kartadan 3 tasi bir-biriga mantiqan yoki moliyaviy jihatdan bog'liq. Ammo bittasi butunlay boshqacha turkumga kiradi. O'sha toq narsani top va nima uchun toq ekanini o'rgan!",
    ru: "3 из 4 карточек логически или финансово связаны друг с другом. Но одна из них относится к совершенно другой категории. Найди лишнее и узнай, почему оно отличается!",
    en: "3 out of 4 cards are logically or financially related, but one belongs to a completely different category. Find the odd one out and learn why it differs!",
    kk: "4 картаның 3-еуі логикалық немесе қаржылық жағынан байланысты. Бірақ біреуі мүлдем басқа санатқа жатады. Сол артық затты тауып, себебін біліңіз!",
    ky: "4 картанын 3ү логикалык же каржылык жактан байланыштуу. Бирок бирөөсү таптакыр башка категорияга кирет. Ошол ашыкча нерсени таап, себебин билиңиз!",
    tg: "3-то аз 4-то кортҳо бо ҳам алоқаи мантиқӣ ё молиявӣ доранд. Аммо яке аз онҳо комилан ба категорияи дигар тааллуқ дорад. Он чизи бегонаро ёбед ва сабабашро омӯзед!",
    qr: "4 kartadan 3-ewi mantiqiy yamasa qarjiliq jaqtan baylanisli. Biraq birewi muldem basqa kategoriya giredi. Sol artiq zatti tawip, sebebin bilip alin'!"
  },
  start: {
    uz: "Boshlash",
    ru: "Начать",
    en: "Start",
    kk: "Бастау",
    ky: "Баштоо",
    tg: "Оғоз",
    qr: "Baslaw"
  },
  selectDiff: {
    uz: "Qiyinchilik darajasini tanlang:",
    ru: "Выберите сложность:",
    en: "Select difficulty level:",
    kk: "Қиындық деңгейін таңдаңыз:",
    ky: "Кыйындык деңгээлин тандаңыз:",
    tg: "Дараҷаи душвориро интихоб кунед:",
    qr: "Qiyinliq da'rejesin tan'lan'iz:"
  },
  easy: {
    uz: "Oson",
    ru: "Легко",
    en: "Easy",
    kk: "Оңай",
    ky: "Оңой",
    tg: "Осон",
    qr: "An'sat"
  },
  medium: {
    uz: "O'rtacha",
    ru: "Средне",
    en: "Medium",
    kk: "Орташа",
    ky: "Орточо",
    tg: "Миёна",
    qr: "Ortasha"
  },
  hard: {
    uz: "Qiyin",
    ru: "Сложно",
    en: "Hard",
    kk: "Қиын",
    ky: "Кыйын",
    tg: "Душвор",
    qr: "Qiyin"
  },
  ready: {
    uz: "TAYYOR",
    ru: "ГОТОВ",
    en: "READY",
    kk: "ДАЙЫН",
    ky: "ДАЯР",
    tg: "ТАЙЁР",
    qr: "TAYYOR"
  },
  result: {
    uz: "Natija",
    ru: "Результат",
    en: "Result",
    kk: "Нәтиже",
    ky: "Жыйынтык",
    tg: "Натиҷа",
    qr: "Natiyje"
  },
  awesome: {
    uz: "Ajoyib!",
    ru: "Отлично!",
    en: "Awesome!",
    kk: "Керемет!",
    ky: "Абдан жакшы!",
    tg: "Олии ҷаноб!",
    qr: "A'jajip!"
  },
  tryAgain: {
    uz: "Yana urinib ko'ring!",
    ru: "Попробуйте ещё раз!",
    en: "Try again!",
    kk: "Тағы да көріңіз!",
    ky: "Дагы бир жолу аракет кылып көрүңүз!",
    tg: "Боз кӯшиш кунед!",
    qr: "Yana urunip ko'rin'!"
  },
  correctCount: {
    uz: "to'g'ri",
    ru: "верно",
    en: "correct",
    kk: "дұрыс",
    ky: "туура",
    tg: "дуруст",
    qr: "durist"
  },
  correctLabel: {
    uz: "To'g'ri",
    ru: "Верно",
    en: "Correct",
    kk: "Дұрыс",
    ky: "Туура",
    tg: "Дуруст",
    qr: "Durist"
  },
  wrongLabel: {
    uz: "Xato",
    ru: "Ошибки",
    en: "Wrong",
    kk: "Қате",
    ky: "Ката",
    tg: "Хато",
    qr: "Qate"
  },
  timeLabel: {
    uz: "Vaqt",
    ru: "Время",
    en: "Time",
    kk: "Уақыт",
    ky: "Убакыт",
    tg: "Вақт",
    qr: "Waqit"
  },
  coinsFound: {
    uz: "Topilgan coinlar",
    ru: "Получено монет",
    en: "Coins earned",
    kk: "Табылған монеталар",
    ky: "Табылган монеталар",
    tg: "Тангаҳои ёфтшуда",
    qr: "Tabilg'an coinlar"
  },
  nextLevel: {
    uz: "Keyingi bosqich",
    ru: "Следующий уровень",
    en: "Next Level",
    kk: "Келесі деңгей",
    ky: "Кийинки деңгээл",
    tg: "Марҳилаи навбатӣ",
    qr: "Keyingi basqish"
  },
  playAgain: {
    uz: "Qayta o'ynash",
    ru: "Играть снова",
    en: "Play Again",
    kk: "Қайта ойнау",
    ky: "Кайра ойноо",
    tg: "Бозии дубора",
    qr: "Qayta oynaw"
  },
  back: {
    uz: "Orqaga",
    ru: "Назад",
    en: "Back",
    kk: "Артқа",
    ky: "Артка",
    tg: "Қафо",
    qr: "Izg'a"
  },
  questionLabel: (index, total) => ({
    uz: `Savol ${index}/${total}`,
    ru: `Вопрос ${index}/${total}`,
    en: `Question ${index}/${total}`,
    kk: `Сұрақ ${index}/${total}`,
    ky: `Суроо ${index}/${total}`,
    tg: `Савол ${index}/${total}`,
    qr: `Soraw ${index}/${total}`
  }),
  questionHeader: {
    uz: "Qaysi biri guruhga mos kelmaydi?",
    ru: "Что лишнее в этой группе?",
    en: "Which one doesn't belong?",
    kk: "Қайсысы топқа сәйкес келмейді?",
    ky: "Кайсысы топко туура келбейт?",
    tg: "Кадоме аз онҳо ба гурӯҳ мувофиқ нест?",
    qr: "Qaysi biri topatag'i tu'ri kelmeydi?"
  },
  correctUpper: {
    uz: "TO'G'RI!",
    ru: "ПРАВИЛЬНО!",
    en: "CORRECT!",
    kk: "ДҰРЫС!",
    ky: "ТУУРА!",
    tg: "ДУРУСТ!",
    qr: "DURIST!"
  },
  wrongUpper: {
    uz: "XATO JAVOB",
    ru: "НЕПРАВИЛЬНО",
    en: "WRONG ANSWER",
    kk: "ҚАТЕ ЖАУАП",
    ky: "КАТА ЖООП",
    tg: "ҶАВОБИ ХАТО",
    qr: "QATE JAWAP"
  },
  nextQuestion: {
    uz: "Keyingi savol",
    ru: "Следующий вопрос",
    en: "Next Question",
    kk: "Келесі сұрақ",
    ky: "Кийинки суроо",
    tg: "Саволи навбатӣ",
    qr: "Keyingi soraw"
  }
};

export default function OddOneOutGame({ user, lg = "uz", dark, gameId = "logic/odd-one-out", level, onBack, onNextLevel }) {
  const l = lg || "uz";
  const th = dark ? PALETTE.dark : PALETTE.light;

  const [difficulty, setDifficulty] = useState("easy");
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  // Initialize Game Engine
  const eng = useGameEngine({
    questionCount: level ? level.questionCount : 6,
    generator: oddOneOutGenerator,
    startDifficulty: level ? level.difficulty : difficulty,
    name: "Toq narsani top",
    lg: l,
    rewards: { coin: 1.8, xp: 3 }
  });

  const handleStart = (selectedDiff) => {
    setDifficulty(selectedDiff);
    eng.start();
  };

  useEffect(() => {
    if (level) {
      setDifficulty(level.difficulty);
    }
  }, [level]);

  useEffect(() => {
    if (eng.phase === "play" && eng.question) {
      setSelectedOpt(null);
      setIsCorrectFeedback(null);
      setShowExplanation(false);
    }
  }, [eng.phase, eng.qIndex, eng.question]);

  useEffect(() => {
    if (eng.phase === "countdown") {
      const timer = setTimeout(() => {
        eng.beginPlay();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [eng.phase]);

  const handleAnswerSelect = (option) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(option);

    const correct = option === eng.question.answer;
    setIsCorrectFeedback(correct);
    setShowExplanation(true);

    if (correct) {
      playSound.correct();
      setStreak(s => s + 1);
    } else {
      playSound.wrong();
      setStreak(0);
    }

    // Keep the choice visible so the user can read the explanation
    // then call eng.answer when they click "Keyingi" (Next)
  };

  const handleNextQuestion = () => {
    eng.answer(selectedOpt);
  };

  const hasSavedRef = useRef(false);
  useEffect(() => {
    if (eng.phase === "result" && eng.result && !hasSavedRef.current) {
      hasSavedRef.current = true;

      const r = eng.result;
      const pct = Math.round((r.correct / r.total) * 100);
      const stars = level ? starsFor(pct, level.passPct) : (r.correct >= 5 ? 3 : r.correct >= 4 ? 2 : r.correct >= 3 ? 1 : 0);

      if (stars > 0) {
        playSound.victory();
      } else {
        playSound.wrong();
      }

      if (user?.id) {
        (async () => {
          // Kunlik takror o'ynashda mukofot kamayadi (farmga qarshi, math kabi)
          const mult = await dailyCoinMultiplier(user.id, gameId);
          const dayCoins = Math.max(1, Math.round(r.coins * mult));
          r.coins = dayCoins;
          await addCoins(user.id, dayCoins);
          await addXp(user.id, r.xp);
          await logGameSession(user.id, {
            gameId,
            correct: r.correct,
            total: r.total,
            pct,
            seconds: r.seconds,
            coins: dayCoins,
            xp: r.xp,
            difficulty: difficulty
          });

          if (level && stars > 0) {
            await saveLevelProgress(user.id, "logic", level.id, stars);
          }
        })();
      }
    } else if (eng.phase !== "result") {
      hasSavedRef.current = false;
    }
  }, [eng.phase, eng.result, user, gameId, difficulty, level]);

  if (eng.phase === "intro") {
    return (
      <div>
        <PageHeader th={th} title={T.gameTitle[l] || T.gameTitle.uz} onBack={onBack} />
        
        <div style={{ padding: SPACE.s4, textAlign: "center", display: "flex", flexDirection: "column", gap: SPACE.s4 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: RADIUS.l,
            background: "linear-gradient(135deg, #fb923c, #f97316)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            boxShadow: SHADOW.e1("#fb923c")
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M4 4h16v16H4z" />
              <circle cx="12" cy="12" r="3" fill="#fff" />
            </svg>
          </div>

          <div>
            <h2 style={{ ...TYPE.heading, color: th.t1 }}>
              {T.instruction[l] || T.instruction.uz}
            </h2>
            <p style={{ ...TYPE.caption, color: th.t2, marginTop: SPACE.s2, lineHeight: 1.4 }}>
              {T.description[l] || T.description.uz}
            </p>
          </div>

          {level ? (
            <PrimaryButton th={th} onClick={() => handleStart(level.difficulty)} style={{ marginTop: SPACE.s4 }}>
              {T.start[l] || T.start.uz}
            </PrimaryButton>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, marginTop: SPACE.s1 }}>
              <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t3, alignSelf: "flex-start" }}>
                {T.selectDiff[l] || T.selectDiff.uz}
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: SPACE.s2 }}>
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleStart(d)}
                    className="ui-press"
                    style={{
                      background: difficulty === d ? "#fb923c22" : th.sur,
                      border: difficulty === d ? "2px solid #fb923c" : "1px solid " + th.bor,
                      borderRadius: RADIUS.m,
                      padding: SPACE.s3,
                      color: difficulty === d ? "#fb923c" : th.t2,
                      fontFamily: "inherit",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {d === "easy" ? (T.easy[l] || T.easy.uz) : d === "medium" ? (T.medium[l] || T.medium.uz) : (T.hard[l] || T.hard.uz)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (eng.phase === "countdown") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 120,
          height: 120,
          borderRadius: RADIUS.full,
          background: "linear-gradient(135deg, #fb923c, #f97316)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: SHADOW.e2
        }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>{T.ready[l] || T.ready.uz}</span>
        </div>
      </div>
    );
  }

  if (eng.phase === "result" && eng.result) {
    const r = eng.result;
    const pct = Math.round((r.correct / r.total) * 100);
    const finalStars = level ? starsFor(pct, level.passPct) : (r.correct >= 5 ? 3 : r.correct >= 4 ? 2 : r.correct >= 3 ? 1 : 0);
    const mm = Math.floor(r.seconds / 60), ss = r.seconds % 60;

    return (
      <div style={{ paddingBottom: SPACE.s8 }}>
        <PageHeader th={th} title={T.result[l] || T.result.uz} onBack={level ? onBack : () => eng.setPhase("intro")} />
        
        <div style={{
          background: "linear-gradient(135deg, #fb923c, #f97316)",
          borderRadius: RADIUS.l,
          padding: SPACE.s6 + "px " + SPACE.s4,
          textAlign: "center",
          marginBottom: SPACE.s4,
          boxShadow: SHADOW.e1("#fb923c")
        }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: SPACE.s2 }}>
            {[1, 2, 3].map(s => (
              <Star key={s} size={32} fill={finalStars >= s ? PREMIUM.gold : "transparent"} stroke={finalStars >= s ? PREMIUM.gold : "rgba(255,255,255,0.4)"} />
            ))}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
            {finalStars > 0 ? (T.awesome[l] || T.awesome.uz) : (T.tryAgain[l] || T.tryAgain.uz)}
          </div>
          <div style={{ ...TYPE.subtitle, color: "#fff", marginTop: SPACE.s1, opacity: 0.9 }}>
            {r.correct}/{r.total} {T.correctCount[l] || T.correctCount.uz}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
          <StatCard th={th} value={r.correct} label={T.correctLabel[l] || T.correctLabel.uz} tone={th.gr} />
          <StatCard th={th} value={r.wrong} label={T.wrongLabel[l] || T.wrongLabel.uz} tone={th.rd} />
          <StatCard th={th} value={(mm ? mm + "m " : "") + ss + "s"} label={T.timeLabel[l] || T.timeLabel.uz} tone={th.ac} />
          <StatCard th={th} value={"x" + r.maxCombo} label="Combo" tone={th.am} />
        </div>

        <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, marginBottom: SPACE.s2 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: PREMIUM.gold + "1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PREMIUM.gold} strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M9 12h6" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...TYPE.tiny, textTransform: "none", color: th.t2 }}>{T.coinsFound[l] || T.coinsFound.uz}</div>
            <div style={{ ...TYPE.title, color: th.t1 }}>+{r.coins}</div>
          </div>
        </AppCard>

        {level && onNextLevel && finalStars >= 1 && (
          <PrimaryButton th={th} onClick={onNextLevel} style={{ marginTop: SPACE.s2, background: th.gr }}>
            {T.nextLevel[l] || T.nextLevel.uz}
          </PrimaryButton>
        )}
        <PrimaryButton th={th} onClick={() => handleStart(difficulty)} style={{ marginTop: SPACE.s2 }}>
          {T.playAgain[l] || T.playAgain.uz}
        </PrimaryButton>
        <button className="ui-press" onClick={onBack} style={{
          width: "100%",
          marginTop: SPACE.s2,
          background: "transparent",
          border: "none",
          color: th.t2,
          padding: SPACE.s3,
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 600
        }}>
          {T.back[l] || T.back.uz}
        </button>
      </div>
    );
  }

  const question = eng.question;
  const meta = question?.meta || {};
  const items = meta.items || [];
  const explanation = meta.explanation || {};

  return (
    <div style={{ minHeight: "75vh", display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
      {/* HUD Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1, marginRight: SPACE.s3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ ...TYPE.caption, color: th.t2, fontWeight: 700 }}>
              {(T.questionLabel(eng.qIndex + 1, level ? level.questionCount : 6)[l] || T.questionLabel(eng.qIndex + 1, level ? level.questionCount : 6).uz)}
            </span>
            <span style={{ ...TYPE.caption, color: "#fb923c", fontWeight: 700 }}>
              {difficulty.toUpperCase()}
            </span>
          </div>
          <div style={{ height: 6, background: th.bor, borderRadius: RADIUS.pill, overflow: "hidden" }}>
            <div style={{ width: `${eng.progress}%`, height: "100%", background: "#fb923c", borderRadius: RADIUS.pill, transition: "width .2s" }} />
          </div>
        </div>
        {streak > 2 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: th.am + "1F", padding: "4px 10px", borderRadius: RADIUS.pill }}>
            <Flame size={16} color={th.am} />
            <span style={{ fontSize: 13, fontWeight: 800, color: th.am }}>x{streak}</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{ textAlign: "center", padding: "0 8px" }}>
        <h3 style={{ ...TYPE.subtitle, color: th.t1, fontWeight: 800 }}>
          {T.questionHeader[l] || T.questionHeader.uz}
        </h3>
      </div>

      {/* Choices Bento Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3, flex: 1, contentAlign: "center" }}>
        {items.map((item, idx) => {
          const isSel = selectedOpt === item.id;
          const isRightOpt = item.id === question.answer;

          let bg = th.sur;
          let border = "1.5px solid " + th.bor;
          let color = th.t1;
          let iconColor = th.t2;

          if (selectedOpt !== null) {
            if (isRightOpt) {
              bg = th.gr + "1A";
              border = "2.5px solid " + th.gr;
              color = th.gr;
              iconColor = th.gr;
            } else if (isSel) {
              bg = th.rd + "1A";
              border = "2.5px solid " + th.rd;
              color = th.rd;
              iconColor = th.rd;
            } else {
              bg = th.bg;
              border = "1px solid " + th.bor;
              color = th.t3;
              iconColor = th.t3;
            }
          }

          return (
            <button
              key={item.id}
              onClick={() => handleAnswerSelect(item.id)}
              disabled={selectedOpt !== null}
              className="ui-press"
              style={{
                background: bg,
                border: border,
                borderRadius: RADIUS.l,
                padding: "24px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: SPACE.s2,
                cursor: selectedOpt === null ? "pointer" : "default",
                transition: "all 0.15s",
                boxShadow: SHADOW.e1(th.bor)
              }}
            >
              <div style={{ padding: 8, borderRadius: "50%", background: iconColor + "0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <OddOneOutIcon iconId={item.icon} color={iconColor} size={38} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: color, textAlign: "center", lineHeight: 1.2 }}>
                {item.label?.[l] || item.label?.uz || item.id}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation Box Revealed After Answering */}
      {showExplanation && (
        <div style={{
          background: isCorrectFeedback ? th.gr + "0D" : th.rd + "0D",
          border: `1.5px solid ${isCorrectFeedback ? th.gr : th.rd}33`,
          borderRadius: RADIUS.l,
          padding: SPACE.s4,
          display: "flex",
          gap: SPACE.s3,
          alignItems: "flex-start",
          marginTop: SPACE.s1,
          animation: "fadeIn 0.3s"
        }}>
          <div style={{ padding: 6, borderRadius: "50%", background: (isCorrectFeedback ? th.gr : th.rd) + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isCorrectFeedback ? (
              <Sparkles size={20} color={th.gr} />
            ) : (
              <AlertCircle size={20} color={th.rd} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ ...TYPE.tiny, fontWeight: 800, color: isCorrectFeedback ? th.gr : th.rd, textTransform: "uppercase", marginBottom: 2 }}>
              {isCorrectFeedback ? (T.correctUpper[l] || T.correctUpper.uz) : (T.wrongUpper[l] || T.wrongUpper.uz)}
            </h4>
            <p style={{ ...TYPE.caption, color: th.t2, lineHeight: 1.4 }}>
              {explanation?.[l] || explanation?.uz}
            </p>
          </div>
        </div>
      )}

      {/* Next Question / Proceed Button */}
      {selectedOpt !== null && (
        <PrimaryButton th={th} onClick={handleNextQuestion} style={{ marginTop: SPACE.s2, background: isCorrectFeedback ? th.gr : th.ac }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {T.nextQuestion[l] || T.nextQuestion.uz}
            <ArrowRight size={18} />
          </span>
        </PrimaryButton>
      )}
    </div>
  );
}
