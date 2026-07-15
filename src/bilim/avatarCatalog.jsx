import React from "react";

export const AVATAR_CATALOG = [
  {
    id: "avatar_sher",
    name: {
      uz: "Olovli Geymer Sher",
      en: "Fire Gamer Lion",
      ru: "Огненный Лев-Геймер",
      kk: "Отты Геймер Арыстан",
      ky: "Оттуу Геймер Арстан",
      tg: "Шери Геймери Оташин",
      qr: "Alangli Geymer Arslan"
    },
    price: 0,
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="mane_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="50%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="face_grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#facc15" />
    </linearGradient>
    <linearGradient id="hp_grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <!-- Background Circle Glow -->
  <circle cx="60" cy="60" r="54" fill="#fed7aa" opacity="0.15" />
  
  <!-- Mane (Massa) -->
  <path d="M60 12 C32 12 14 30 14 60 C14 85 30 106 54 108 C56 108 58 108 60 108 C62 108 64 108 66 108 C90 106 106 85 106 60 C106 30 88 12 60 12 Z" fill="url(#mane_grad)" />
  
  <!-- Mane spikes for extra detail -->
  <path d="M40 18 L32 28 L46 28 Z" fill="#c2410c" />
  <path d="M80 18 L88 28 L74 28 Z" fill="#c2410c" />
  <path d="M20 44 L10 54 L24 58 Z" fill="#c2410c" />
  <path d="M100 44 L110 54 L96 58 Z" fill="#c2410c" />
  <path d="M22 80 L12 88 L28 92 L22 80 Z" fill="#c2410c" />
  <path d="M98 80 L108 88 L92 92 L98 80 Z" fill="#c2410c" />

  <!-- Ears -->
  <circle cx="36" cy="36" r="14" fill="#c2410c" />
  <circle cx="36" cy="36" r="8" fill="#fca5a5" />
  <circle cx="84" cy="36" r="14" fill="#c2410c" />
  <circle cx="84" cy="36" r="8" fill="#fca5a5" />

  <!-- Face Center -->
  <circle cx="60" cy="66" r="36" fill="url(#face_grad)" />

  <!-- Eyes with gorgeous sparkling anime highlights -->
  <ellipse cx="46" cy="62" rx="7" ry="9" fill="#1e293b" />
  <circle cx="44" cy="59" r="3.2" fill="#ffffff" />
  <circle cx="49" cy="65" r="1.5" fill="#ffffff" />

  <ellipse cx="74" cy="62" rx="7" ry="9" fill="#1e293b" />
  <circle cx="72" cy="59" r="3.2" fill="#ffffff" />
  <circle cx="77" cy="65" r="1.5" fill="#ffffff" />

  <!-- Cute Snout & Pink Nose -->
  <ellipse cx="60" cy="74" rx="10" ry="7" fill="#ffffff" opacity="0.9" />
  <polygon points="60,75 54,69 66,69" fill="#ec4899" rx="2" />
  
  <!-- Happy Mouth -->
  <path d="M54 77 Q60 83 66 77" stroke="#1e293b" stroke-width="2.5" fill="none" stroke-linecap="round" />
  
  <!-- Cute rosy cheeks -->
  <circle cx="36" cy="71" r="5" fill="#ef4444" opacity="0.4" />
  <circle cx="84" cy="71" r="5" fill="#ef4444" opacity="0.4" />

  <!-- Dynamic Gaming Headphones -->
  <path d="M24 64 Q24 24 60 24 Q96 24 96 64" stroke="url(#hp_grad)" stroke-width="6" fill="none" stroke-linecap="round" />
  <rect x="18" y="52" width="10" height="24" rx="5" fill="#1d4ed8" />
  <rect x="21" y="56" width="4" height="16" rx="2" fill="#60a5fa" />
  <rect x="92" y="52" width="10" height="24" rx="5" fill="#1d4ed8" />
  <rect x="95" y="56" width="4" height="16" rx="2" fill="#60a5fa" />
</svg>`
  },
  {
    id: "avatar_baqa",
    name: {
      uz: "Geymer Baqacha",
      en: "Neon Gamer Frog",
      ru: "Неоновый Лягушонок",
      kk: "Геймер Бақа",
      ky: "Геймер Бака",
      tg: "Қурбоққаи Геймер",
      qr: "Geymer Baqasha"
    },
    price: 0,
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="frog_grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="neon_pink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#be123c" />
    </linearGradient>
  </defs>
  <!-- Glow effect -->
  <circle cx="60" cy="60" r="52" fill="#a7f3d0" opacity="0.2" />

  <!-- Frog Head -->
  <ellipse cx="60" cy="66" rx="44" ry="38" fill="url(#frog_grad)" />

  <!-- Frog Eyes (raised up) -->
  <circle cx="36" cy="38" r="15" fill="url(#frog_grad)" />
  <circle cx="36" cy="38" r="10" fill="#ffffff" />
  <circle cx="36" cy="38" r="5" fill="#111827" />
  <circle cx="34" cy="35" r="2.5" fill="#ffffff" /> <!-- highlight -->

  <circle cx="84" cy="38" r="15" fill="url(#frog_grad)" />
  <circle cx="84" cy="38" r="10" fill="#ffffff" />
  <circle cx="84" cy="38" r="5" fill="#111827" />
  <circle cx="82" cy="35" r="2.5" fill="#ffffff" /> <!-- highlight -->

  <!-- Star glasses / Neon sunglasses overlay -->
  <path d="M22 52 L48 52 L52 56 L68 56 L72 52 L98 52 L94 66 L74 66 L68 60 L52 60 L46 66 L26 66 Z" fill="url(#neon_pink)" opacity="0.9" />
  <!-- Glass highlights -->
  <line x1="28" y1="56" x2="40" y2="62" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
  <line x1="80" y1="56" x2="92" y2="62" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />

  <!-- Big joyful smile -->
  <path d="M42 76 Q60 92 78 76" stroke="#064e3b" stroke-width="4.5" fill="none" stroke-linecap="round" />

  <!-- Rosy cheeks glowing outside the glasses -->
  <circle cx="24" cy="74" r="5.5" fill="#f43f5e" opacity="0.65" />
  <circle cx="96" cy="74" r="5.5" fill="#f43f5e" opacity="0.65" />
  
  <!-- Tiny sparkles -->
  <polygon points="12,35 15,38 12,41 9,38" fill="#facc15" />
  <polygon points="108,35 111,38 108,41 105,38" fill="#facc15" />
</svg>`
  },
  {
    id: "avatar_panda",
    name: {
      uz: "Koinot Pandasi",
      en: "Cosmo Panda",
      ru: "Космо-Панда",
      kk: "Ғарыш Пандасы",
      ky: "Космос Пандасы",
      tg: "Пандаи Кайҳонӣ",
      qr: "Kosmos Pandasi"
    },
    price: 20,
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="cosmo_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#311042" />
    </linearGradient>
    <linearGradient id="visor_grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
  </defs>
  <!-- Astronaut background circle -->
  <circle cx="60" cy="60" r="54" fill="url(#cosmo_bg)" />
  
  <!-- Stars in background -->
  <circle cx="30" cy="30" r="1" fill="#fff" opacity="0.8" />
  <circle cx="92" cy="34" r="1.5" fill="#fff" opacity="0.9" />
  <circle cx="40" cy="94" r="1" fill="#fff" opacity="0.5" />
  <circle cx="85" cy="88" r="0.8" fill="#fff" opacity="0.6" />
  
  <!-- Panda Ears (outside helmet but inside background) -->
  <circle cx="34" cy="34" r="13" fill="#1e293b" />
  <circle cx="34" cy="34" r="7" fill="#fda4af" />
  <circle cx="86" cy="34" r="13" fill="#1e293b" />
  <circle cx="86" cy="34" r="7" fill="#fda4af" />

  <!-- Panda Face White Head -->
  <circle cx="60" cy="66" r="34" fill="#ffffff" />

  <!-- Black Eye Patches (Panda signature) -->
  <ellipse cx="48" cy="64" rx="10" ry="12" fill="#1e293b" transform="rotate(-15 48 64)" />
  <ellipse cx="72" cy="64" rx="10" ry="12" fill="#1e293b" transform="rotate(15 72 64)" />

  <!-- Glowing Anime Eyes -->
  <circle cx="49" cy="62" r="4.5" fill="#38bdf8" />
  <circle cx="49" cy="62" r="2" fill="#ffffff" />
  <circle cx="71" cy="62" r="4.5" fill="#38bdf8" />
  <circle cx="71" cy="62" r="2" fill="#ffffff" />

  <!-- Cute Nose & Mouth -->
  <ellipse cx="60" cy="71" rx="4.5" ry="3" fill="#111827" />
  <path d="M56 75 Q60 79 64 75" stroke="#111827" stroke-width="2" fill="none" stroke-linecap="round" />

  <!-- Space Helmet Glass Dome -->
  <circle cx="60" cy="60" r="44" fill="none" stroke="#e2e8f0" stroke-width="4.5" />
  <path d="M22 45 Q60 22 98 45" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />

  <!-- Cheek Blushes -->
  <circle cx="38" cy="71" r="3.5" fill="#f43f5e" opacity="0.5" />
  <circle cx="82" cy="71" r="3.5" fill="#f43f5e" opacity="0.5" />
</svg>`
  },
  {
    id: "avatar_tulki",
    name: {
      uz: "Alpinist Tulkivoy",
      en: "Explorer Fox",
      ru: "Лис-Исследователь",
      kk: "Саяхатшы Түлкі",
      ky: "Саякатчы Түлкү",
      tg: "Рӯбоҳи Сайёҳ",
      qr: "Alpinist Tu'lki"
    },
    price: 40,
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="fox_body" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <linearGradient id="goggle_lens" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
  </defs>
  <!-- Background Circle -->
  <circle cx="60" cy="60" r="54" fill="#fef3c7" opacity="0.3" />

  <!-- Ears (large pointy) -->
  <polygon points="16,24 44,12 36,44" fill="#c2410c" />
  <polygon points="16,24 44,12 36,44" fill="url(#fox_body)" />
  <polygon points="22,25 36,18 32,36" fill="#fca5a5" />

  <polygon points="104,24 76,12 84,44" fill="#c2410c" />
  <polygon points="104,24 76,12 84,44" fill="url(#fox_body)" />
  <polygon points="98,25 84,18 88,36" fill="#fca5a5" />

  <!-- Fox Main Face -->
  <circle cx="60" cy="66" r="40" fill="url(#fox_body)" />
  
  <!-- Cheek Fluff (White mask) -->
  <path d="M20 66 C20 86 60 106 60 106 C60 106 100 86 100 66 C100 58 92 56 84 58 C72 60 60 66 60 66 C60 66 48 60 36 58 C28 56 20 58 20 66 Z" fill="#ffffff" />

  <!-- Eyes (cute & friendly) -->
  <ellipse cx="42" cy="60" rx="5" ry="7" fill="#1e293b" />
  <circle cx="40" cy="57" r="2" fill="#ffffff" />
  <circle cx="44" cy="62" r="0.8" fill="#ffffff" />

  <ellipse cx="78" cy="60" rx="5" ry="7" fill="#1e293b" />
  <circle cx="76" cy="57" r="2" fill="#ffffff" />
  <circle cx="80" cy="62" r="0.8" fill="#ffffff" />

  <!-- Cute Nose & Mouth -->
  <circle cx="60" cy="75" r="5" fill="#0f172a" />
  <path d="M54 82 Q60 86 66 82" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round" />

  <!-- Adventurer Goggles on Forehead -->
  <rect x="28" y="32" width="64" height="6" rx="3" fill="#1e293b" />
  
  <!-- Left Lens -->
  <rect x="34" y="24" width="22" height="18" rx="6" fill="#1e293b" />
  <rect x="36" y="26" width="18" height="14" rx="4" fill="url(#goggle_lens)" />
  <line x1="38" y1="28" x2="48" y2="36" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.7" />

  <!-- Right Lens -->
  <rect x="64" y="24" width="22" height="18" rx="6" fill="#1e293b" />
  <rect x="66" y="26" width="18" height="14" rx="4" fill="url(#goggle_lens)" />
  <line x1="68" y1="28" x2="78" y2="36" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.7" />
  
  <!-- Rosy cheeks -->
  <circle cx="30" cy="72" r="4" fill="#f43f5e" opacity="0.5" />
  <circle cx="90" cy="72" r="4" fill="#f43f5e" opacity="0.5" />
</svg>`
  },
  {
    id: "avatar_koala",
    name: {
      uz: "Musiqachi Koala",
      en: "DJ Koala",
      ru: "Коала-Диджей",
      kk: "Диджей Коала",
      ky: "Диджей Коала",
      tg: "Коалаи Диджей",
      qr: "Musiqashi Koala"
    },
    price: 60,
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="koala_head" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <linearGradient id="neon_orange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>
  <!-- Background Circle -->
  <circle cx="60" cy="60" r="54" fill="#cbd5e1" opacity="0.2" />

  <!-- Large fluffy ears with inside gradients -->
  <circle cx="28" cy="46" r="18" fill="#475569" />
  <circle cx="28" cy="46" r="13" fill="#f1f5f9" />
  <path d="M20 46 A8 8 0 0 1 36 46" fill="#fda4af" opacity="0.7" />

  <circle cx="92" cy="46" r="18" fill="#475569" />
  <circle cx="92" cy="46" r="13" fill="#f1f5f9" />
  <path d="M84 46 A8 8 0 0 1 100 46" fill="#fda4af" opacity="0.7" />

  <!-- Main Face -->
  <circle cx="60" cy="68" r="38" fill="url(#koala_head)" />

  <!-- Cute Sleepy Anime Eyes -->
  <path d="M40 64 Q45 58 50 64" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
  <path d="M70 64 Q75 58 80 64" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
  <circle cx="45" cy="68" r="1.5" fill="#ffffff" />
  <circle cx="75" cy="68" r="1.5" fill="#ffffff" />

  <!-- Big characteristic dark grey nose -->
  <ellipse cx="60" cy="72" rx="9" ry="14" fill="#1e293b" />
  <!-- Highlight on nose -->
  <ellipse cx="58" cy="66" rx="3" ry="5" fill="#64748b" opacity="0.6" />

  <!-- Rosy Cute Cheeks -->
  <circle cx="38" cy="74" r="4" fill="#ec4899" opacity="0.5" />
  <circle cx="82" cy="74" r="4" fill="#ec4899" opacity="0.5" />

  <!-- DJ Neon Headphones -->
  <path d="M22 64 Q22 24 60 24 Q98 24 98 64" stroke="url(#neon_orange)" stroke-width="6.5" fill="none" stroke-linecap="round" />
  <circle cx="20" cy="64" r="11" fill="#1e293b" />
  <circle cx="20" cy="64" r="7" fill="url(#neon_orange)" />
  <circle cx="100" cy="64" r="11" fill="#1e293b" />
  <circle cx="100" cy="64" r="7" fill="url(#neon_orange)" />

  <!-- Sparkles -->
  <path d="M12 24 L14 28 L18 26 L14 30 L16 34 L12 32 L8 34 L10 30 L6 26 L10 28 Z" fill="#fbbf24" transform="scale(0.8) translate(15, 10)" />
</svg>`
  },
  {
    id: "avatar_mushuk",
    name: {
      uz: "Malika Mushuk",
      en: "Princess Kitty",
      ru: "Кошка-Принцесса",
      kk: "Ханшайым Мысық",
      ky: "Ханбийке Мышык",
      tg: "Маликаи Гурба",
      qr: "Xan'shajim Pishiq"
    },
    price: 100,
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="cat_grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbcfe8" />
      <stop offset="100%" stop-color="#f472b6" />
    </linearGradient>
    <linearGradient id="crown_grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <!-- Glow -->
  <circle cx="60" cy="60" r="54" fill="#fce7f3" opacity="0.4" />

  <!-- Pointy Ears with shiny inside -->
  <polygon points="22,42 12,12 44,30" fill="#db2777" />
  <polygon points="24,40 16,16 42,28" fill="#ffe4e6" />

  <polygon points="98,42 108,12 76,30" fill="#db2777" />
  <polygon points="96,40 104,16 78,28" fill="#ffe4e6" />

  <!-- Main Kitty Face -->
  <circle cx="60" cy="66" r="38" fill="url(#cat_grad)" />

  <!-- Beautiful Royal Crown with gems -->
  <polygon points="44,24 48,10 54,16 60,8 66,16 72,10 76,24" fill="url(#crown_grad)" />
  <circle cx="48" cy="10" r="2" fill="#ec4899" />
  <circle cx="60" cy="8" r="2.5" fill="#3b82f6" />
  <circle cx="72" cy="10" r="2" fill="#22c55e" />
  <rect x="52" y="20" width="16" height="3" fill="#ffffff" opacity="0.8" rx="1" />

  <!-- Large, shiny magical star eyes -->
  <ellipse cx="44" cy="60" rx="7.5" ry="9" fill="#1e293b" />
  <polygon points="44,54 46,58 50,58 47,60 49,64 44,62 39,64 41,60 38,58 42,58" fill="#ffffff" />
  <circle cx="47" cy="63" r="1.5" fill="#ffffff" />

  <ellipse cx="76" cy="60" rx="7.5" ry="9" fill="#1e293b" />
  <polygon points="76,54 78,58 82,58 79,60 81,64 76,62 71,64 73,60 70,58 74,58" fill="#ffffff" />
  <circle cx="79" cy="63" r="1.5" fill="#ffffff" />

  <!-- Heart nose -->
  <path d="M60 69 C59 67 56 67 56 69 C56 71 60 73 60 73 C60 73 64 71 64 69 C64 67 61 67 60 69 Z" fill="#e11d48" />
  
  <!-- Mouth and whiskers -->
  <path d="M54 75 Q60 79 66 75" stroke="#1e293b" stroke-width="2.5" fill="none" stroke-linecap="round" />
  
  <!-- Rosy Blush -->
  <circle cx="30" cy="71" r="5" fill="#f43f5e" opacity="0.4" />
  <circle cx="90" cy="71" r="5" fill="#f43f5e" opacity="0.4" />

  <!-- Whiskers -->
  <line x1="22" y1="68" x2="10" y2="66" stroke="#475569" stroke-width="2" stroke-linecap="round" />
  <line x1="24" y1="74" x2="12" y2="74" stroke="#475569" stroke-width="2" stroke-linecap="round" />
  <line x1="98" y1="68" x2="110" y2="66" stroke="#475569" stroke-width="2" stroke-linecap="round" />
  <line x1="96" y1="74" x2="108" y2="74" stroke="#475569" stroke-width="2" stroke-linecap="round" />
</svg>`
  },
  {
    id: "avatar_quyon",
    name: {
      uz: "Uchar Kosmo-Quyon",
      en: "Cosmo Bunny",
      ru: "Космо-Кролик",
      kk: "Ұшатын Ғарыш Қояны",
      ky: "Учуучу Космос Коёну",
      tg: "Харгӯши Кайҳонӣ",
      qr: "Ushar Kosmos Qoyani"
    },
    price: 150,
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="bunny_ears" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <linearGradient id="cyber_visor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
  <!-- Cyberpunk background space aura -->
  <circle cx="60" cy="60" r="54" fill="#0f172a" />
  <circle cx="60" cy="60" r="50" fill="#1e293b" />
  
  <!-- Laser grids/lines in background -->
  <line x1="20" y1="30" x2="100" y2="30" stroke="#06b6d4" stroke-width="0.5" opacity="0.3" />
  <line x1="20" y1="60" x2="100" y2="60" stroke="#06b6d4" stroke-width="0.5" opacity="0.3" />
  <line x1="20" y1="90" x2="100" y2="90" stroke="#06b6d4" stroke-width="0.5" opacity="0.3" />

  <!-- High standing ears with pink inside -->
  <ellipse cx="40" cy="28" rx="10" ry="24" fill="url(#bunny_ears)" transform="rotate(-10 40 28)" />
  <ellipse cx="40" cy="28" rx="5" ry="17" fill="#fda4af" transform="rotate(-10 40 28)" />

  <ellipse cx="80" cy="28" rx="10" ry="24" fill="url(#bunny_ears)" transform="rotate(10 80 28)" />
  <ellipse cx="80" cy="28" rx="5" ry="17" fill="#fda4af" transform="rotate(10 80 28)" />

  <!-- Bunny Face -->
  <circle cx="60" cy="72" r="34" fill="#ffffff" />

  <!-- High-tech Glowing Visor Glasses -->
  <rect x="30" y="52" width="60" height="18" rx="9" fill="url(#cyber_visor)" stroke="#ffffff" stroke-width="1.5" />
  <!-- Lens reflection -->
  <path d="M35 56 L55 56 L52 64 L38 64 Z" fill="#ffffff" opacity="0.6" />
  <circle cx="82" cy="61" r="3" fill="#ffffff" opacity="0.8" />

  <!-- Cute Pink Nose & Mouth -->
  <polygon points="60,74 57,70 63,70" fill="#f43f5e" />
  <path d="M55 78 Q60 82 65 78" stroke="#475569" stroke-width="2" fill="none" stroke-linecap="round" />

  <!-- Glowing Cheeks -->
  <circle cx="34" cy="78" r="4.5" fill="#22c55e" opacity="0.6" />
  <circle cx="86" cy="78" r="4.5" fill="#06b6d4" opacity="0.6" />
</svg>`
  },
  {
    id: "avatar_bot",
    name: {
      uz: "Super CyberBot-3000",
      en: "Super CyberBot 3000",
      ru: "Робот СайберБот-3000",
      kk: "Супер КиберБот-3000",
      ky: "Супер КиберБот-3000",
      tg: "Супер КиберБот-3000",
      qr: "Super KiberBot-3000"
    },
    price: 200,
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="metal_body" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="eye_glow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
  </defs>
  <!-- Tech Aura background -->
  <circle cx="60" cy="60" r="54" fill="#0f172a" />
  <circle cx="60" cy="60" r="48" fill="#1e293b" />
  
  <!-- Glowing Circuit lines in BG -->
  <path d="M25 45 L40 45 L50 35" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.4" />
  <path d="M95 45 L80 45 L70 35" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.4" />
  <path d="M60 15 L60 25" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" />

  <!-- Robot Ears / Screws -->
  <rect x="20" y="50" width="8" height="20" rx="3" fill="#64748b" />
  <rect x="92" y="50" width="8" height="20" rx="3" fill="#64748b" />

  <!-- Robot Head (Main Box) -->
  <rect x="26" y="32" width="68" height="60" rx="16" fill="url(#metal_body)" stroke="#0284c7" stroke-width="2" />
  
  <!-- Highlight shine on head -->
  <path d="M34 38 L86 38 L82 46 L38 46 Z" fill="#ffffff" opacity="0.25" />

  <!-- Glowing Eye Screen -->
  <rect x="34" y="46" width="52" height="24" rx="8" fill="#090d16" />

  <!-- Eyes - glowing cyber spectacles -->
  <circle cx="47" cy="58" r="7" fill="url(#eye_glow)" />
  <circle cx="47" cy="58" r="3" fill="#ffffff" />
  
  <circle cx="73" cy="58" r="7" fill="url(#eye_glow)" />
  <circle cx="73" cy="58" r="3" fill="#ffffff" />

  <!-- Glowing Cheeks / status light -->
  <circle cx="39" cy="80" r="3" fill="#22c55e" />
  <circle cx="81" cy="80" r="3" fill="#22c55e" />

  <!-- High-tech grid teeth/mouth -->
  <rect x="48" y="74" width="24" height="6" rx="3" fill="#1e293b" />
  <line x1="53" y1="74" x2="53" y2="80" stroke="#38bdf8" stroke-width="1.5" />
  <line x1="60" y1="74" x2="60" y2="80" stroke="#38bdf8" stroke-width="1.5" />
  <line x1="67" y1="74" x2="67" y2="80" stroke="#38bdf8" stroke-width="1.5" />

  <!-- Golden Antenna Tip -->
  <circle cx="60" cy="12" r="6" fill="#eab308" />
  <circle cx="60" cy="12" r="3" fill="#ffffff" />
</svg>`
  },
  {
    id: "avatar_kahramon",
    name: {
      uz: "Tungi Qalqon Ninja",
      en: "Cosmic Knight Ninja",
      ru: "Ночной Ниндзя-Герой",
      kk: "Түнгі Ниндзя-Қорған",
      ky: "Түнкү Ниндзя-Калкан",
      tg: "Ниндзяи Қалқони Шабона",
      qr: "Tu'ngi Qalxan Ninja"
    },
    price: 250,
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="shield_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <linearGradient id="mask_grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="gold_accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>
  <!-- Glowing Background energy aura -->
  <circle cx="60" cy="60" r="54" fill="url(#shield_grad)" />
  <circle cx="60" cy="60" r="48" fill="#000" opacity="0.3" />

  <!-- Head with ninja mask wrapper -->
  <circle cx="60" cy="60" r="38" fill="url(#mask_grad)" />

  <!-- Golden forehead band -->
  <path d="M26 42 Q60 25 94 42 L90 48 Q60 32 30 48 Z" fill="url(#gold_accent)" />
  <!-- Golden crest symbol -->
  <polygon points="60,20 64,30 60,34 56,30" fill="#ffffff" />
  <circle cx="60" cy="30" r="1.5" fill="#ef4444" />

  <!-- Eyes Opening inside the mask -->
  <path d="M34 50 C38 46 48 46 52 50 C48 56 38 56 34 50 Z" fill="#ffffff" />
  <circle cx="44" cy="50" r="3.5" fill="#a855f7" />
  <circle cx="44" cy="50" r="1.5" fill="#ffffff" />

  <path d="M68 50 C72 46 82 46 86 50 C82 56 72 56 68 50 Z" fill="#ffffff" />
  <circle cx="76" cy="50" r="3.5" fill="#a855f7" />
  <circle cx="76" cy="50" r="1.5" fill="#ffffff" />

  <!-- Cool cheek scarf lines -->
  <path d="M36 78 Q60 92 84 78 L80 84 Q60 98 40 84 Z" fill="url(#gold_accent)" />

  <!-- Sparkles/Stars around head -->
  <polygon points="18,30 21,33 18,36 15,33" fill="#ffffff" />
  <polygon points="102,30 105,33 102,36 99,33" fill="#ffffff" />
  <polygon points="60,105 62,107 60,109 58,107" fill="#ffffff" />
</svg>`
  },
  {
    id: "avatar_ajdar",
    name: {
      uz: "Sehrli Alanga Ajdari",
      en: "Cosmic Flame Dragon",
      ru: "Космический Дракоша",
      kk: "Сиқырлы Жалын Айдаһары",
      ky: "Сыйкырдуу Жалын Ажыдаары",
      tg: "Аждаҳои Оташини Сеҳрнок",
      qr: "A'jajip Alanga Ajdari"
    },
    price: 300,
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="drag_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="50%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#b91c1c" />
    </linearGradient>
    <linearGradient id="wing_grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f57c00" />
    </linearGradient>
  </defs>
  <!-- Magical fire glow -->
  <circle cx="60" cy="60" r="54" fill="#fee2e2" opacity="0.2" />

  <!-- Dragon Spikes/Wings in BG -->
  <polygon points="26,44 10,24 28,34" fill="url(#wing_grad)" />
  <polygon points="94,44 110,24 92,34" fill="url(#wing_grad)" />
  
  <!-- Back spines -->
  <polygon points="40,24 46,10 52,24" fill="#ea580c" />
  <polygon points="68,24 74,10 80,24" fill="#ea580c" />
  <polygon points="54,18 60,4 66,18" fill="#fbbf24" />

  <!-- Dragon Head -->
  <circle cx="60" cy="66" r="40" fill="url(#drag_grad)" stroke="#991b1b" stroke-width="1.5" />

  <!-- Cute gold horns -->
  <path d="M38 32 Q32 14 24 16 C30 22 36 28 38 32" fill="url(#wing_grad)" />
  <path d="M82 32 Q88 14 96 16 C90 22 84 28 82 32" fill="url(#wing_grad)" />

  <!-- Large sparkling friendly eyes -->
  <circle cx="44" cy="58" r="8" fill="#ffffff" />
  <circle cx="44" cy="58" r="5" fill="#1e293b" />
  <circle cx="42" cy="55" r="2.2" fill="#ffffff" /> <!-- Big spark -->
  <circle cx="46" cy="61" r="0.9" fill="#ffffff" /> <!-- Low spark -->

  <circle cx="76" cy="58" r="8" fill="#ffffff" />
  <circle cx="76" cy="58" r="5" fill="#1e293b" />
  <circle cx="74" cy="55" r="2.2" fill="#ffffff" /> <!-- Big spark -->
  <circle cx="78" cy="61" r="0.9" fill="#ffffff" /> <!-- Low spark -->

  <!-- Cheek Blushes -->
  <circle cx="34" cy="69" r="4.5" fill="#f43f5e" opacity="0.8" />
  <circle cx="86" cy="69" r="4.5" fill="#f43f5e" opacity="0.8" />

  <!-- Golden glowing snout breathing stars -->
  <ellipse cx="60" cy="75" rx="16" ry="10" fill="url(#wing_grad)" />
  <!-- Nostrils -->
  <circle cx="54" cy="73" r="2" fill="#451a03" />
  <circle cx="66" cy="73" r="2" fill="#451a03" />
  
  <!-- Happy mouth with cute single tooth -->
  <path d="M52 79 Q60 84 68 79" stroke="#451a03" stroke-width="2" fill="none" stroke-linecap="round" />
  <polygon points="56,79 58,83 60,79" fill="#ffffff" />

  <!-- Fire sparkle floating -->
  <polygon points="60,95 62,91 65,95 62,97" fill="#fbbf24" />
  <polygon points="25,92 28,88 30,92 28,94" fill="#fbbf24" />
  <polygon points="95,92 98,88 100,92 98,94" fill="#fbbf24" />
</svg>`
  }
];

export function getAvatarUri(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}
