import fs from 'fs';
import path from 'path';

const replacements = [
  {
    file: 'src/bilim/LearningProfile.jsx',
    replaces: [
      {
        from: `{uz ? "AI bahosi" : lg === "ru" ? "Оценка AI" : "AI assessment"}`,
        to: `{uz ? "Foydali baholash" : lg === "ru" ? "Полезная оценка" : "Useful assessment"}`
      }
    ]
  },
  {
    file: 'src/bilim/dashboard.jsx',
    replaces: [
      {
        from: `{uz ? "AI tavsiyasi" : lg === "ru" ? "Совет AI" : "AI suggestion"}`,
        to: `{uz ? "Foydali tavsiyalar" : lg === "ru" ? "Полезные советы" : "Useful suggestions"}`
      },
      {
        from: `{uz ? "AI TAVSIYA" : "AI TIP"}`,
        to: `{uz ? "FOYDALI TAVSIYA" : "USEFUL TIP"}`
      }
    ]
  },
  {
    file: 'src/pages/Onboarding.jsx',
    replaces: [
      {
        from: `"AI tavsiyalar"`,
        to: `"Foydali tavsiyalar"`
      },
      {
        from: `"AI insights"`,
        to: `"Useful insights"`
      }
    ]
  },
  {
    file: 'src/pages/Dashboard.jsx',
    replaces: [
      {
        from: `lg === "uz" ? "AI moliyaviy tahlil" : lg === "ru" ? "AI-анализ финансов" : "AI financial analysis"`,
        to: `lg === "uz" ? "Foydali moliyaviy tahlil" : lg === "ru" ? "Полезный анализ финансов" : "Useful financial analysis"`
      }
    ]
  },
  {
    file: 'src/pages/Reports.jsx',
    replaces: [
      {
        from: `lg === "uz" ? "AI tahlil" : lg === "ru" ? "AI-анализ" : "AI analysis"`,
        to: `lg === "uz" ? "Foydali tahlil" : lg === "ru" ? "Полезный анализ" : "Useful analysis"`
      }
    ]
  },
  {
    file: 'src/components/modals/PremiumModal.jsx',
    replaces: [
      {
        from: `uz: "AI aqlli moliyaviy maslahatlar", en: "AI smart insights"`,
        to: `uz: "Foydali moliyaviy maslahatlar", en: "Useful financial insights"`
      },
      {
        from: `"Cheksiz maqsad va a'zolar, PDF/Excel eksport, ovoz kiritish, QR skaner va AI tavsiyalar"`,
        to: `"Cheksiz maqsad va a'zolar, PDF/Excel eksport, ovoz kiritish, QR skaner va foydali tavsiyalar"`
      },
      {
        from: `"Unlimited goals & members, PDF/Excel export, voice input, QR scanner and AI insights"`,
        to: `"Unlimited goals & members, PDF/Excel export, voice input, QR scanner and useful insights"`
      }
    ]
  },
  {
    file: 'src/Garden.jsx',
    replaces: [
      {
        from: `L("AI moliyaviy maslahati tayyor!", "Финансовый совет от ИИ готов!")`,
        to: `L("Foydali moliyaviy maslahat tayyor!", "Полезный финансовый совет готов!")`
      },
      {
        from: `title={L("AI Maslahatchi", "ИИ Советник")}`,
        to: `title={L("Foydali Maslahatchi", "Полезный Советник")}`
      },
      {
        from: `L("AI Moliyaviy Maslahatchi", "ИИ Финансовый Советник")`,
        to: `L("Foydali Moliyaviy Maslahatchi", "Полезный Финансовый Советник")`
      }
    ]
  },
  {
    file: 'src/goals/i18n.js',
    replaces: [
      {
        from: `aiTips:       { uz: "AI tavsiyalar",       ru: "AI-советы",          en: "AI tips" },`,
        to: `aiTips:       { uz: "Foydali tavsiyalar",   ru: "Полезные советы",    en: "Useful tips" },`
      }
    ]
  },
  {
    file: 'src/utils/activity.jsx',
    replaces: [
      {
        from: `ai:      uz ? "AI tahlil" : ru ? "AI-анализ" : "AI analysis",`,
        to: `ai:      uz ? "Foydali tahlil" : ru ? "Полезный анализ" : "Useful analysis",`
      }
    ]
  },
  {
    file: 'src/utils/notify.jsx',
    replaces: [
      {
        from: `ai:      uz ? "AI tahlil" : ru ? "AI-анализ" : "AI analysis",`,
        to: `ai:      uz ? "Foydali tahlil" : ru ? "Полезный анализ" : "Useful analysis",`
      }
    ]
  }
];

replacements.forEach(entry => {
  const filePath = path.resolve(entry.file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  
  entry.replaces.forEach(rep => {
    const normalizedFrom = rep.from.replace(/\r\n/g, '\n');
    const normalizedContent = content.replace(/\r\n/g, '\n');
    
    if (normalizedContent.includes(normalizedFrom)) {
      content = normalizedContent.split(normalizedFrom).join(rep.to);
      count++;
    } else {
      if (content.includes(rep.from)) {
        content = content.split(rep.from).join(rep.to);
        count++;
      } else {
        console.warn(`WARNING: Match not found in ${entry.file}:`, rep.from);
      }
    }
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${entry.file}: applied ${count}/${entry.replaces.length} replacements.`);
});
