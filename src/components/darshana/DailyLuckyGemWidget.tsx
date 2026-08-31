import React, { useState, useMemo } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";

export interface DailyLuckyGemWidgetProps {
  dateStr: string;
  rashiIndex?: number;
  nakshatraIndex?: number;
  lang?: SevaLang;
  deityMantra?: string;
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
}> = {
  kn: {
    title: "ದಿನದ ದೈವಿಕ ಶಕ್ತಿ ರತ್ನ (Daily Power Gem)",
    subtitle: "ಇಂದಿನ ಶುಭ ಬಣ್ಣ, ಅದೃಷ್ಟ ಸಂಖ್ಯೆ, ದಿಕ್ಕು & ೧-ನಿಮಿಷದ ಜಪ ಮಾಲೆ",
    powerColorTitle: "ಇಂದಿನ ಶುಭ ಬಣ್ಣ",
    luckyDigitTitle: "ಅದೃಷ್ಟ ಸಂಖ್ಯೆ",
    directionTitle: "ಶುಭ ದಿಕ್ಕು (ದಿಶಾರಕ್ಷೆ)",
    japaMalaTitle: "೧೧ ಮಣಿಗಳ ಡಿಜಿಟಲ್ ಜಪ ಮಾಲೆ",
    japaCompleted: "೧೧ ಜಪ ಪೂರ್ಣಗೊಂಡಿದೆ! ಭಕ್ತಿ ಸಮರ್ಪಣೆ ಸಿದ್ಧಿಸಿದೆ ✓",
    chantBtn: "📿 ಜಪಿಸಿ (Chant Bead)",
    resetMala: "ಪುನಃ ಜಪಿಸಿ (Restart)"
  },
  en: {
    title: "Daily Power Gem & Auspicious Guidance",
    subtitle: "Power Color, Lucky Number, Travel Direction & Japa Mala",
    powerColorTitle: "Today's Power Color",
    luckyDigitTitle: "Lucky Number",
    directionTitle: "Auspicious Direction",
    japaMalaTitle: "11-Bead Digital Chanting Mala",
    japaCompleted: "11 Sacred Chants Completed! Divine Grace Attained ✓",
    chantBtn: "📿 Chant Bead",
    resetMala: "Restart Japa"
  },
  hi: {
    title: "दैनिक शक्ति रत्न एवं शुभ संकेत (Daily Power Gem)",
    subtitle: "आज का शुभ रंग, भाग्यशाली अंक, दिशा और जप माला",
    powerColorTitle: "आज का शुभ रंग",
    luckyDigitTitle: "भाग्यशाली अंक",
    directionTitle: "शुभ दिशा (दिशारक्षा)",
    japaMalaTitle: "११ मनकों की डिजिटल जप माला",
    japaCompleted: "११ जप पूर्ण हुए! प्रभु कृपा प्राप्त हुई ✓",
    chantBtn: "📿 जप करें",
    resetMala: "पुनः जप करें"
  },
  te: {
    title: "నేటి దైవిక శక్తి రత్నం (Daily Power Gem)",
    subtitle: "నేటి శుభ వర్ణం, అదృష్ట సంఖ్య, దిక్కు మరియు జపమాల",
    powerColorTitle: "నేటి శుభ వర్ణం",
    luckyDigitTitle: "అదృష్ట సంఖ్య",
    directionTitle: "శుభ దిక్కు",
    japaMalaTitle: "౧౧ పూసల డిజిటల్ జపమాల",
    japaCompleted: "౧౧ జపాలు పూర్తయ్యాయి! దైవానుగ్రహం లభించింది ✓",
    chantBtn: "📿 జపం చేయండి",
    resetMala: "మళ్ళీ ప్రారంభించండి"
  },
  ta: {
    title: "இன்றைய சக்தி ரத்தினம் (Daily Power Gem)",
    subtitle: "சுப நிறம், அதிர்ஷ்ட எண், திசை மற்றும் ஜெப மாலை",
    powerColorTitle: "இன்றைய சுப நிறம்",
    luckyDigitTitle: "அதிர்ஷ்ட எண்",
    directionTitle: "சுப திசை",
    japaMalaTitle: "11 மணி டிஜிட்டல் ஜெப மாலை",
    japaCompleted: "11 ஜெபம் முடிந்தது! இறை அருள் கிட்டியது ✓",
    chantBtn: "📿 ஜெபிக்க",
    resetMala: "மீண்டும் ஜெபிக்க"
  }
};

const COLOR_MAP = [
  { nameKn: "ಕೇಸರಿ / ಕಿತ್ತಳೆ", nameEn: "Saffron / Orange", bgClass: "bg-orange-500", textClass: "text-orange-950", borderClass: "border-orange-400", hex: "#F97316" },
  { nameKn: "ಹಳದಿ / ಬಂಗಾರ", nameEn: "Golden Yellow", bgClass: "bg-amber-400", textClass: "text-amber-950", borderClass: "border-amber-400", hex: "#FBBF24" },
  { nameKn: "ಬಿಳಿ / ಹಾಲುಗನ್ನಡಿ", nameEn: "Pure White / Cream", bgClass: "bg-white", textClass: "text-slate-900", borderClass: "border-amber-300", hex: "#FFFFFF" },
  { nameKn: "ಹಸಿರು / ಪಚ್ಚೆ", nameEn: "Emerald Green", bgClass: "bg-emerald-500", textClass: "text-emerald-950", borderClass: "border-emerald-400", hex: "#10B981" },
  { nameKn: "ಕೆಂಪು / ಗುಲಾಬಿ", nameEn: "Ruby Red / Rose", bgClass: "bg-rose-500", textClass: "text-rose-950", borderClass: "border-rose-400", hex: "#F43F5E" },
  { nameKn: "ನೀಲಿ / ಆಕಾಶ", nameEn: "Royal Sky Blue", bgClass: "bg-sky-500", textClass: "text-sky-950", borderClass: "border-sky-400", hex: "#0EA5E9" },
  { nameKn: "ನೇರಳೆ / ಲ್ಯಾವೆಂಡರ್", nameEn: "Royal Purple", bgClass: "bg-purple-500", textClass: "text-purple-950", borderClass: "border-purple-400", hex: "#A855F7" }
];

const DIRECTION_MAP = [
  { dirKn: "ಉತ್ತರ (North) • ಕುಬೇರ ದಿಕ್ಕು", dirEn: "North (Wealth & Growth)" },
  { dirKn: "ಈಶಾನ್ಯ (North-East) • ಈಶ್ವರ ದಿಕ್ಕು", dirEn: "North-East (Spiritual Sanctuary)" },
  { dirKn: "ಪೂರ್ವ (East) • ಸೂರ್ಯೋದಯ ದಿಕ್ಕು", dirEn: "East (Vitality & Success)" },
  { dirKn: "ಪಶ್ಚಿಮ (West) • ವರುಣ ದಿಕ್ಕು", dirEn: "West (Trade & Networking)" },
  { dirKn: "ವಾಯುವ್ಯ (North-West) • ವಾಯು ದಿಕ್ಕು", dirEn: "North-West (Speed & Travel)" }
];

export const DailyLuckyGemWidget: React.FC<DailyLuckyGemWidgetProps> = ({
  dateStr,
  rashiIndex = 8,
  nakshatraIndex = 18,
  lang = "kn",
  deityMantra = "ಓಂ ನಮಃ ಶಿವಾಯ"
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

  const handleBeadClick = () => {
    if (japaCount < 11) {
      setJapaCount((prev) => prev + 1);
      // Gentle Web Audio API bead chime
      try {
        if (typeof window !== "undefined" && (window.AudioContext || (window as any).webkitAudioContext)) {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(528 + japaCount * 24, ctx.currentTime); // 528Hz Solfeggio scale
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch {}
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-amber-300 pb-2.5">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-lg shadow-sm border border-amber-400">
          💎
        </span>
        <div>
          <h3 className="text-xs sm:text-sm font-black text-amber-950">
            {t.title}
          </h3>
          <span className="text-[10px] text-amber-800 font-bold">
            {t.subtitle}
          </span>
        </div>
      </div>

      {/* 3 Metric Grid: Color, Number, Direction */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Power Color */}
        <div className="p-3 bg-white rounded-2xl border border-amber-300 flex items-center gap-3 shadow-inner">
          <div
            className={`w-10 h-10 rounded-xl shadow-md border-2 ${gemData.color.borderClass} flex items-center justify-center shrink-0`}
            style={{ backgroundColor: gemData.color.hex }}
          >
            <span className="text-xs">🎨</span>
          </div>
          <div>
            <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
              {t.powerColorTitle}
            </div>
            <div className="text-xs font-black text-slate-900 leading-tight">
              {lang === "kn" ? gemData.color.nameKn : gemData.color.nameEn}
            </div>
          </div>
        </div>

        {/* Lucky Number */}
        <div className="p-3 bg-white rounded-2xl border border-amber-300 flex items-center gap-3 shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black font-mono text-xl shadow-md border border-amber-300 flex items-center justify-center shrink-0">
            {gemData.luckyDigit}
          </div>
          <div>
            <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
              {t.luckyDigitTitle}
            </div>
            <div className="text-xs font-black text-slate-900 leading-tight">
              ಸಂಖ್ಯೆ {gemData.luckyDigit} (ಶುಭ ಕಂಪನ)
            </div>
          </div>
        </div>

        {/* Travel Direction */}
        <div className="p-3 bg-white rounded-2xl border border-amber-300 flex items-center gap-3 shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-lg shadow-md border border-indigo-400 flex items-center justify-center shrink-0">
            🧭
          </div>
          <div>
            <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
              {t.directionTitle}
            </div>
            <div className="text-xs font-black text-slate-900 leading-tight">
              {lang === "kn" ? gemData.direction.dirKn : gemData.direction.dirEn}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 11-Bead Digital Japa Mala */}
      <div className="p-3.5 bg-gradient-to-r from-amber-100/70 via-orange-50 to-amber-100/70 rounded-2xl border-2 border-amber-400/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
            <span>📿</span>
            <span>{t.japaMalaTitle}</span>
          </div>
          <span className="font-mono font-black text-xs text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-400">
            {japaCount} / 11
          </span>
        </div>

        {/* Deity Mantra Box */}
        <div className="p-2 bg-white/90 rounded-xl border border-amber-300 text-center">
          <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">ಇಂದಿನ ಜಪ ಮಂತ್ರ</span>
          <h4 className="text-sm font-serif font-black text-amber-950 mt-0.5">
            "{deityMantra}"
          </h4>
        </div>

        {/* 11 Beads Visual Chain */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap py-1">
          {Array.from({ length: 11 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={handleBeadClick}
              className={`w-7 h-7 rounded-full text-xs font-black transition-all transform active:scale-90 flex items-center justify-center shadow-xs border ${
                idx < japaCount
                  ? "bg-gradient-to-tr from-amber-500 to-amber-300 border-amber-500 text-slate-950 scale-105"
                  : "bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
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
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all active:scale-98 flex items-center justify-center gap-1.5 border border-amber-400"
          >
            <span>{t.chantBtn} ({japaCount + 1} / 11)</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="p-2 bg-emerald-100 border border-emerald-400 rounded-xl text-center text-xs font-black text-emerald-950 animate-in fade-in">
              {t.japaCompleted}
            </div>
            <button
              type="button"
              onClick={() => setJapaCount(0)}
              className="w-full py-1.5 bg-white text-slate-700 hover:bg-amber-50 font-bold text-xs rounded-xl border border-amber-300"
            >
              {t.resetMala}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
