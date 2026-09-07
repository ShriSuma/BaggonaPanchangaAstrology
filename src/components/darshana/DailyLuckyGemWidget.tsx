import React, { useState, useMemo } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { playTempleBellChime } from "../../features/seva/priestAudioNarrator";

export interface DailyLuckyGemWidgetProps {
  dateStr: string;
  rashiIndex?: number;
  nakshatraIndex?: number;
  lang?: SevaLang;
  deityMantra?: string;
  dynamicLuckyColor?: {
    name: Record<SevaLang, string>;
    hex: string;
    borderClass: string;
  };
  dynamicLuckyDigit?: number;
  dynamicLuckyNumbers?: number[];
  dynamicLuckyDirection?: {
    name: Record<SevaLang, string>;
    degrees: string;
  };
}

const LUCKY_TEXTS: Record<SevaLang, {
  title: string;
  subtitle: string;
  powerColorTitle: string;
  luckyDigitTitle: string;
  directionTitle: string;
  japaMalaTitle: string;
  japaCompleted: string;
  chantBtn: string;
  resetMala: string;
  mantraTitle: string;
  auspiciousVibe: (n: string | number) => string;
}> = {
  kn: {
    title: "ದಿನದ ದೈವಿಕ ಶಕ್ತಿ ರತ್ನ & ಶುಭ ಮಾರ್ಗದರ್ಶಿ",
    subtitle: "ನಿಮ್ಮ ಜನ್ಮ ಜಾತಕ & ಗೋಚಾರ ಆಧಾರಿತ ಶುಭ ವರ್ಣ, ಸಂಖ್ಯೆ, ದಿಕ್ಕು & ೧೧-ಮಣಿಗಳ ಡಿಜಿಟಲ್ ಜಪಮಾಲೆ",
    powerColorTitle: "ದಿನದ ಅದೃಷ್ಟ ವರ್ಣ",
    luckyDigitTitle: "ದಿನದ ಅದೃಷ್ಟ ಸಂಖ್ಯೆ",
    directionTitle: "ದಿನದ ಶುಭ ಸಂಚಾರ ದಿಕ್ಕು",
    japaMalaTitle: "೧೧-ಮಣಿಗಳ ಡಿಜಿಟಲ್ ಜಪಮಾಲೆ",
    japaCompleted: "🎉 ೧೧ ಬಾರಿ ಪವಿತ್ರ ಜಪ ಸಂಪನ್ನವಾಯಿತು! ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರರ ಅನುಗ್ರಹ ಸದಾ ಇರಲಿ.",
    chantBtn: "📿 ಮಂತ್ರ ಜಪಿಸಿ",
    resetMala: "↺ ಮರು ಜಪ",
    mantraTitle: "ಇಂದಿನ ಪವಿತ್ರ ಜಪ ಮಂತ್ರ",
    auspiciousVibe: (n) => `ಸಂಖ್ಯೆ ${n} (ಶುಭ ಕಂಪನ)`
  },
  en: {
    title: "Daily Power Gem & Auspicious Guidance",
    subtitle: "Auspicious Color, Lucky Number, Direction & 11-Bead Digital Japa Mala",
    powerColorTitle: "Daily Power Color",
    luckyDigitTitle: "Daily Lucky Number",
    directionTitle: "Auspicious Travel Direction",
    japaMalaTitle: "11-Bead Sacred Digital Mala",
    japaCompleted: "🎉 11 Chants Completed! May Lord Mahabaleshwara bless your day.",
    chantBtn: "📿 Chant Mantra",
    resetMala: "↺ Reset Mala",
    mantraTitle: "Today's Sacred Japa Mantra",
    auspiciousVibe: (n) => `Number ${n} (Auspicious)`
  },
  hi: {
    title: "दैनिक दिव्य शक्ति रत्न एवं शुभ मार्गदर्शन",
    subtitle: "शुभ रंग, लकी नंबर, शुभ दिशा एवं ११-मनकों की डिजिटल जपमाला",
    powerColorTitle: "आज का शुभ रंग",
    luckyDigitTitle: "आज का लकी नंबर",
    directionTitle: "आज की शुभ दिशा",
    japaMalaTitle: "११-मनकों की डिजिटल जपमाला",
    japaCompleted: "🎉 ११ पावन जप संपन्न! भगवान महाबलेश्वर की कृपा बनी रहे।",
    chantBtn: "📿 मंत्र जपें",
    resetMala: "↺ पुनः जप",
    mantraTitle: "आज का पावन जप मंत्र",
    auspiciousVibe: (n) => `संख्या ${n} (शुभ स्पंदन)`
  },
  te: {
    title: "నేటి దివ్య శక్తి రత్నం & శుభ మార్గదర్శి",
    subtitle: "శుభ వర్ణం, లక్కీ నంబర్, శుభ దిశ & ౧౧-పూసల డిజిటల్ జపమాల",
    powerColorTitle: "నేటి శుభ వర్ణం",
    luckyDigitTitle: "నేటి లక్కీ నంబర్",
    directionTitle: "నేటి శుభ ప్రయాణ దిశ",
    japaMalaTitle: "౧౧-పూసల డిజిటల్ జపమాల",
    japaCompleted: "🎉 ౧౧ జపాలు పూర్తయ్యాయి! శ్రీ మహాబలేశ్వరుని అనుగ్రహం లభించుగాక.",
    chantBtn: "📿 మంత్రం జపించండి",
    resetMala: "↺ రీసెట్ మాల",
    mantraTitle: "నేటి పవిత్ర జప మంత్రం",
    auspiciousVibe: (n) => `సంఖ్య ${n} (శుభ కంపనం)`
  },
  ta: {
    title: "இன்றைய சக்தி ரத்தினம் & சுப வழிகாட்டி",
    subtitle: "சுப நிறம், அதிர்ஷ்ட எண், சுப திசை & 11-மணி டிஜிட்டல் ஜபமாலை",
    powerColorTitle: "இன்றைய சுப நிறம்",
    luckyDigitTitle: "இன்றைய அதிர்ஷ்ட எண்",
    directionTitle: "இன்றைய சுப திசை",
    japaMalaTitle: "11-மணி புனித டிஜிட்டல் ஜபமாலை",
    japaCompleted: "🎉 11 முறை ஜபம் நிறைவடைந்தது! மகாபலேஸ்வரர் அருள் நிலைக்கட்டும்.",
    chantBtn: "📿 மந்திரம் ஜபிக்கவும்",
    resetMala: "↺ மீண்டும் ஜபிக்க",
    mantraTitle: "இன்றைய புனித ஜப மந்திரம்",
    auspiciousVibe: (n) => `எண் ${n} (சுப அதிர்வு)`
  }
};

const COLOR_MAP: Array<{
  name: Record<SevaLang, string>;
  hex: string;
  borderClass: string;
}> = [
  {
    name: {
      kn: "ಮಾಣಿಕ್ಯ ಕೆಂಪು • ಸೂರ್ಯ ಬಲ",
      en: "Ruby Red • Sun Vitality",
      hi: "माणिक्य लाल • सूर्य बल",
      te: "మాణిక్య ఎరుపు • సూర్య బలం",
      ta: "மாணிக்க சிவப்பு • சூரிய பலம்"
    },
    hex: "#DC2626",
    borderClass: "border-rose-400"
  },
  {
    name: {
      kn: "ಮುತ್ತಿನ ಬಿಳಿ • ಚಂದ್ರ ಶಾಂತಿ",
      en: "Pearl White • Moon Peace",
      hi: "मोती श्वेत • चन्द्र शांति",
      te: "ముత్యపు తెలుపు • చంద్ర శాంతి",
      ta: "முத்து வெள்ளை • சந்திர சாந்தி"
    },
    hex: "#F8FAFC",
    borderClass: "border-slate-300"
  },
  {
    name: {
      kn: "ಹವಳ ಕೇಸರಿ • ಕುಜ ತೇಜಸ್ಸು",
      en: "Coral Saffron • Mars Aura",
      hi: "मूंगा केसरिया • मंगल तेज",
      te: "పగడపు కేసరి • కుజ తేజస్సు",
      ta: "பவள காவி • செவ்வாய் தேஜஸ்"
    },
    hex: "#EA580C",
    borderClass: "border-orange-400"
  },
  {
    name: {
      kn: "ಪಚ್ಚೆ ಹಸಿರು • ಬುಧ ಬುದ್ಧಿ",
      en: "Emerald Green • Mercury Intellect",
      hi: "पन्ना हरा • बुध बुद्धि",
      te: "పచ్చ ఆకుపచ్చ • బుధ బుద్ధి",
      ta: "மரகத பச்சை • புதன் அறிவு"
    },
    hex: "#10B981",
    borderClass: "border-emerald-400"
  },
  {
    name: {
      kn: "ಪೀತಾಂಬರ ಹಳದಿ • ಗುರು ಕೃಪೆ",
      en: "Golden Yellow • Jupiter Grace",
      hi: "पीतांबर पीला • गुरु कृपा",
      te: "పీతాంబర పసుపు • గురు కృప",
      ta: "பீதாம்பர மஞ்சள் • குரு கிருபை"
    },
    hex: "#F59E0B",
    borderClass: "border-yellow-400"
  },
  {
    name: {
      kn: "ವಜ್ರ ಶುಭ್ರ • ಶುಕ್ರ ಸೌಖ್ಯ",
      en: "Diamond White • Venus Radiance",
      hi: "हीरा शुभ्र • शुक्र सौख्य",
      te: "వజ్ర శుభ్రం • శుక్ర సౌఖ్యం",
      ta: "வைர வெள்ளை • சுக்கிர சௌக்கியம்"
    },
    hex: "#EC4899",
    borderClass: "border-pink-300"
  },
  {
    name: {
      kn: "ನೀಲಮಣಿ ನೀಲಿ • ಶನಿ ರಕ್ಷೆ",
      en: "Sapphire Blue • Saturn Shield",
      hi: "नीलम नीला • शनि रक्षा",
      te: "నీలమణి నీలం • శని రక్ష",
      ta: "நீலமணி நீலம் • சனி ரக்ஷை"
    },
    hex: "#1E3A8A",
    borderClass: "border-blue-400"
  }
];

const DIRECTION_MAP: Array<{
  dir: Record<SevaLang, string>;
}> = [
  {
    dir: {
      kn: "ಉತ್ತರ • ಕುಬೇರ ದಿಕ್ಕು",
      en: "North (Wealth & Growth)",
      hi: "उत्तर • कुबेर दिशा",
      te: "ఉత్తరం • కుబేర దిశ",
      ta: "வடக்கு • குபேர திசை"
    }
  },
  {
    dir: {
      kn: "ಈಶಾನ್ಯ • ಈಶ್ವರ ದಿಕ್ಕು",
      en: "North-East (Spiritual Sanctuary)",
      hi: "ईशान • ईश्वर दिशा",
      te: "ఈశాన్యం • ఈశ్వర దిశ",
      ta: "ஈசான்யம் • ஈஸ்வர திசை"
    }
  },
  {
    dir: {
      kn: "ಪೂರ್ವ • ಸೂರ್ಯೋದಯ ದಿಕ್ಕು",
      en: "East (Vitality & Success)",
      hi: "पूर्व • सूर्योदय दिशा",
      te: "తూర్పు • సూర్యోదయ దిశ",
      ta: "கிழக்கு • சூரியோதய திசை"
    }
  },
  {
    dir: {
      kn: "ಪಶ್ಚಿಮ • ವರುಣ ದಿಕ್ಕು",
      en: "West (Trade & Networking)",
      hi: "पश्चिम • वरुण दिशा",
      te: "పడమర • వరుణ దిశ",
      ta: "மேற்கு • வருண திசை"
    }
  },
  {
    dir: {
      kn: "ವಾಯುವ್ಯ • ವಾಯು ದಿಕ್ಕು",
      en: "North-West (Speed & Travel)",
      hi: "वायव्य • वायु दिशा",
      te: "వాయువ్యం • వాయు దిశ",
      ta: "வாயுவ்யம் • வாயு திசை"
    }
  }
];

export const DailyLuckyGemWidget: React.FC<DailyLuckyGemWidgetProps> = ({
  dateStr,
  rashiIndex = 8,
  nakshatraIndex = 18,
  lang = "kn",
  deityMantra = "ಓಂ ನಮಃ ಶಿವಾಯ",
  dynamicLuckyColor,
  dynamicLuckyDigit,
  dynamicLuckyNumbers,
  dynamicLuckyDirection
}) => {
  const [japaCount, setJapaCount] = useState<number>(0);
  const t = LUCKY_TEXTS[lang] || LUCKY_TEXTS.kn;

  const gemData = useMemo(() => {
    const d = new Date(dateStr);
    const seed = (d.getFullYear() * 1000 + (d.getMonth() + 1) * 31 + d.getDate() + rashiIndex * 5 + nakshatraIndex * 3);

    const color = COLOR_MAP[seed % COLOR_MAP.length];
    const luckyDigit = ((seed % 9) + 1);
    const direction = DIRECTION_MAP[seed % DIRECTION_MAP.length];

    return { color, luckyDigit, direction };
  }, [dateStr, rashiIndex, nakshatraIndex]);

  const colorName = dynamicLuckyColor?.name[lang] || dynamicLuckyColor?.name.en || gemData.color.name[lang] || gemData.color.name.en;
  const colorHex = dynamicLuckyColor?.hex || gemData.color.hex;
  const colorBorder = dynamicLuckyColor?.borderClass || gemData.color.borderClass;
  const digitVal = dynamicLuckyDigit !== undefined ? dynamicLuckyDigit : (dynamicLuckyNumbers?.[0] ?? gemData.luckyDigit);
  const numberStr = dynamicLuckyNumbers && dynamicLuckyNumbers.length > 0 ? dynamicLuckyNumbers.join(" · ") : String(digitVal);
  const dirName = dynamicLuckyDirection?.name[lang] || dynamicLuckyDirection?.name.en || gemData.direction.dir[lang] || gemData.direction.dir.en;

  const handleBeadClick = () => {
    if (japaCount < 11) {
      const next = japaCount + 1;
      setJapaCount(next);

      if (next === 11) {
        playTempleBellChime();
      } else {
        try {
          if (typeof window !== "undefined" && (window.AudioContext || (window as any).webkitAudioContext)) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(528 + japaCount * 24, ctx.currentTime);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
          }
        } catch {}
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#451A03] via-[#301004] to-[#1C0A00] border-2 border-[#D4AF37] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-amber-100">
      <div className="flex items-center gap-3 border-b border-amber-500/30 pb-3">
        <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl shadow-xs">
          💎
        </span>
        <div>
          <h3 className="text-sm sm:text-base font-black text-[#FDE68A]">
            {t.title}
          </h3>
          <span className="text-xs text-amber-300 font-bold">
            {t.subtitle}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Lucky Color */}
        <div className="p-3.5 bg-black/40 rounded-2xl border border-amber-500/30 flex items-center gap-3 shadow-inner">
          <div
            className={`w-11 h-11 rounded-xl shadow-md border-2 ${colorBorder} flex items-center justify-center shrink-0`}
            style={{ backgroundColor: colorHex }}
          >
            <span className="text-xs">🎨</span>
          </div>
          <div>
            <div className="text-[10px] font-black text-[#FDE68A] uppercase tracking-wider">
              {t.powerColorTitle}
            </div>
            <div className="text-xs font-black text-white leading-tight mt-0.5">
              {colorName}
            </div>
          </div>
        </div>

        {/* Lucky Digit */}
        <div className="p-3.5 bg-black/40 rounded-2xl border border-amber-500/30 flex items-center gap-3 shadow-inner">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black font-mono text-xl shadow-md border border-amber-300 flex items-center justify-center shrink-0">
            {digitVal}
          </div>
          <div>
            <div className="text-[10px] font-black text-[#FDE68A] uppercase tracking-wider">
              {t.luckyDigitTitle}
            </div>
            <div className="text-xs font-black text-white leading-tight mt-0.5">
              {t.auspiciousVibe(numberStr)}
            </div>
          </div>
        </div>

        {/* Travel Direction */}
        <div className="p-3.5 bg-black/40 rounded-2xl border border-amber-500/30 flex items-center gap-3 shadow-inner">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-lg shadow-md border border-indigo-400 flex items-center justify-center shrink-0">
            🧭
          </div>
          <div>
            <div className="text-[10px] font-black text-[#FDE68A] uppercase tracking-wider">
              {t.directionTitle}
            </div>
            <div className="text-xs font-black text-white leading-tight mt-0.5">
              {dirName}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 11-Bead Digital Japa Mala */}
      <div className="p-4 bg-gradient-to-r from-amber-950/70 via-black/50 to-amber-950/70 rounded-2xl border-2 border-amber-500/40 space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-[#FDE68A]">
            <span>📿</span>
            <span>{t.japaMalaTitle}</span>
          </div>
          <span className="font-mono font-black text-xs text-amber-300 bg-amber-900/80 px-3 py-1 rounded-full border border-amber-400 shadow-xs">
            {japaCount} / 11
          </span>
        </div>

        {/* Deity Mantra Box */}
        <div className="p-3 bg-black/50 rounded-xl border border-amber-500/30 text-center">
          <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">{t.mantraTitle}</span>
          <h4 className="text-sm sm:text-base font-serif font-black text-[#FDE68A] mt-1 tracking-wide">
            "{deityMantra}"
          </h4>
        </div>

        {/* 11 Beads Visual Chain */}
        <div className="flex items-center justify-center gap-2 flex-wrap py-2">
          {Array.from({ length: 11 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={handleBeadClick}
              className={`w-8 h-8 rounded-full text-xs font-black transition-all transform active:scale-90 flex items-center justify-center shadow-md border ${
                idx < japaCount
                  ? "bg-gradient-to-tr from-amber-500 to-amber-300 border-amber-300 text-slate-950 scale-110 shadow-amber-500/40"
                  : "bg-black/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/50 hover:border-amber-400"
              }`}
            >
              {idx < japaCount ? "✓" : idx + 1}
            </button>
          ))}
        </div>

        {/* Japa Action Button */}
        {japaCount < 11 ? (
          <button
            type="button"
            onClick={handleBeadClick}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 border border-amber-300"
          >
            <span>{t.chantBtn} ({japaCount + 1} / 11)</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-emerald-950/80 border-2 border-emerald-400 rounded-xl text-center text-xs sm:text-sm font-black text-emerald-200 animate-in fade-in shadow-md">
              {t.japaCompleted}
            </div>
            <button
              type="button"
              onClick={() => setJapaCount(0)}
              className="w-full py-2 bg-amber-900/60 hover:bg-amber-800 text-amber-200 font-bold text-xs rounded-xl border border-amber-500/50 transition-all"
            >
              {t.resetMala}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
