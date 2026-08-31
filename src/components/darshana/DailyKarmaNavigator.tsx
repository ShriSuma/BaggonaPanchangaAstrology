import React, { useState, useMemo, useEffect } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";

export interface DailyKarmaNavigatorProps {
  dateStr: string;
  rashiIndex?: number;
  nakshatraIndex?: number;
  lang?: SevaLang;
  devoteeName?: string;
}

const KARMA_TEXTS: Record<SevaLang, {
  title: string;
  subtitle: string;
  dosTitle: string;
  dontsTitle: string;
  microPariharaTitle: string;
  microPariharaDesc: string;
  markDoneBtn: string;
  doneBadge: string;
}> = {
  kn: {
    title: "ದಿನದ ಕರ್ಮ ಮಾರ್ಗದರ್ಶಿ (Daily Karma Navigator)",
    subtitle: "ಇಂದು ಕೈಗೊಳ್ಳಬೇಕಾದ & ತಪ್ಪಿಸಬೇಕಾದ ಕಾರ್ಯಗಳು ಮತ್ತು ೧-ನಿಮಿಷದ ಪುಣ್ಯ ಪರಿಹಾರ",
    dosTitle: "ಇಂದು ಕೈಗೊಳ್ಳಬಹುದಾದ ಶುಭ ಕಾರ್ಯಗಳು (Do's)",
    dontsTitle: "ಇಂದು ತಪ್ಪಿಸಬೇಕಾದ ಕಾರ್ಯಗಳು (Don'ts)",
    microPariharaTitle: "ದಿನದ ೧-ನಿಮಿಷದ ಸೂಕ್ಷ್ಮ ಪುಣ್ಯ ಕಾರ್ಯ (Micro-Parihara)",
    microPariharaDesc: "ಇಂದು ಹಸುವಿಗೆ ಬೆಲ್ಲ/ಹುಲ್ಲು ನೀಡಿ ಅಥವಾ ಮನೆಯ ತುಳಸಿ ಗಿಡಕ್ಕೆ ನೀರೆರೆದು ನಮಸ್ಕರಿಸಿ.",
    markDoneBtn: "✓ ಇಂದು ಈ ಪುಣ್ಯ ಕಾರ್ಯ ಮಾಡಿದ್ದೇನೆ",
    doneBadge: "ಪುಣ್ಯ ಕಾರ್ಯ ಸಂಪನ್ನ! ಧನ್ಯವಾದಗಳು ✓"
  },
  en: {
    title: "Daily Karma Navigator (Do's & Don'ts)",
    subtitle: "Auspicious actions, activities to avoid & 1-minute daily good deed",
    dosTitle: "Favorable Actions Today (Do's)",
    dontsTitle: "Actions to Avoid Today (Don'ts)",
    microPariharaTitle: "1-Minute Daily Good Deed (Micro-Parihara)",
    microPariharaDesc: "Feed a cow, offer water to holy Basil (Tulasi), or offer seeds to birds.",
    markDoneBtn: "✓ Completed this Good Deed Today",
    doneBadge: "Sacred Good Deed Completed! ✓"
  },
  hi: {
    title: "दैनिक कर्म मार्गदर्शक (Do's & Don'ts)",
    subtitle: "आज किए जाने वाले शुभ कार्य, त्याज्य बातें एवं १-मिनट का पुण्य कार्य",
    dosTitle: "आज के अनुकूल कार्य (Do's)",
    dontsTitle: "आज क्या न करें (Don'ts)",
    microPariharaTitle: "१-मिनट का दैनिक पुण्य कार्य (Micro-Parihara)",
    microPariharaDesc: "गाय को गुड़/रोटी खिलाएं अथवा तुलसी को जल अर्पित कर नमन करें।",
    markDoneBtn: "✓ मैंने आज यह पुण्य कार्य किया",
    doneBadge: "पुण्य कार्य संपन्न! धन्यवाद ✓"
  },
  te: {
    title: "నేటి కర్మ మార్గదర్శి (Do's & Don'ts)",
    subtitle: "నేడు చేయవలసిన మరియు నివారించవలసిన పనులు & ౧-నిమిషం పుణ్య కార్యం",
    dosTitle: "నేడు చేపట్టవలసిన శుభ కార్యాలు (Do's)",
    dontsTitle: "నేడు నివారించవలసిన పనులు (Don'ts)",
    microPariharaTitle: "౧-నిమిషం సూక్ష్మ పుణ్య కార్యం (Micro-Parihara)",
    microPariharaDesc: "గోవుకు బెల్లం/గడ్డి తినిపించండి లేదా తులసి కోటకు నీరు సమర్పించండి.",
    markDoneBtn: "✓ నేడు ఈ పుణ్య కార్యం చేశాను",
    doneBadge: "పుణ్య కార్యం పూర్తయింది! ధన్యవాదాలు ✓"
  },
  ta: {
    title: "இன்றைய கர்ம வழிகாட்டி (Do's & Don'ts)",
    subtitle: "செய்ய வேண்டியவை, தவிர்க்க வேண்டியவை & 1-நிமிட நற்காரியம்",
    dosTitle: "இன்று செய்ய வேண்டிய சுப காரியங்கள் (Do's)",
    dontsTitle: "இன்று தவிர்க்க வேண்டியவை (Don'ts)",
    microPariharaTitle: "1-நிமிட புண்ணிய பரிகாரம் (Micro-Parihara)",
    microPariharaDesc: "பசுவிற்கு வெல்லம் அல்லது துளசிக்கு நீர் ஊற்றி பிரார்த்திக்கவும்.",
    markDoneBtn: "✓ இன்று இந்த நற்காரியம் செய்தேன்",
    doneBadge: "நற்காரியம் நிறைவடைந்தது! நன்றி ✓"
  }
};

const DO_DONT_POOLS = [
  {
    dosKn: ["ಹಣಕಾಸು ಹೂಡಿಕೆ ಹಾಗೂ ನೂತನ ಉಳಿತಾಯ ಯೋಜನೆಗಳು", "ಕುಟುಂಬದ ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಪಡೆದು ದಿನಾರಂಭ", "ದೇವಸ್ಥಾನ ದರ್ಶನ ಹಾಗೂ ಸೂರ್ಯ ನಮಸ್ಕಾರ"],
    dontsKn: ["ಅನಗತ್ಯ ವಾದ-ವಿವಾದ ಹಾಗೂ ಕೋಪದ ತೀರ್ಮಾನಗಳು", "ಆತುರದ ವಾಹನ ಚಾಲನೆ ಹಾಗೂ ಪ್ರಯಾಣದಲ್ಲಿ ಅವಸರ", "ಯಾರಿಗೂ ಕಟು ಮಾತುಗಳನ್ನಾಡುವುದು"],
    microKn: "ಮನೆಯ ಮುಂದಿನ ಪಕ್ಷಿಗಳಿಗೆ ಕಾಳು ಅಥವಾ ನೀರು ನೀಡಿ."
  },
  {
    dosKn: ["ವ್ಯಾಪಾರದಲ್ಲಿ ಹೊಸ ಒಪ್ಪಂದ ಹಾಗೂ ಗ್ರಾಹಕರೊಂದಿಗೆ ಸೌಹಾರ್ದ ಮಾತುಕತೆ", "ದಾನ-ಧರ್ಮ ಹಾಗೂ ಅಗತ್ಯವಿರುವವರಿಗೆ ನೆರವು", "ಆರೋಗ್ಯವರ್ಧಕ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ"],
    dontsKn: ["ಹಳೆಯ ಸಾಲಗಳ ಬಗ್ಗೆ ಅತಿಯಾದ ಮಾನಸಿಕ ಆತಂಕ", "ಸಂಜೆ ಸಮಯದಲ್ಲಿ ಹಣದ ಕೊಡು-ಕೊಳ್ಳುವಿಕೆ ಜಗಳ", "ಹೊಸ ಸಾಲ ಪಡೆಯಲು ಆತುರ"],
    microKn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಧ್ಯಾನ ಮಾಡಿ ತುಳಸಿ ಕಟ್ಟೆಗೆ ನಮಸ್ಕರಿಸಿ."
  },
  {
    dosKn: ["ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಅಧ್ಯಯನ ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷಾ ಸಿದ್ಧತೆ", "ಸ್ಥಿರಾಸ್ತಿ ಅಥವಾ ಗೃಹೋಪಯೋಗಿ ವಸ್ತುಗಳ ಖರೀದಿ ಚಿಂತನೆ", "ಧ್ಯಾನ ಮತ್ತು ಪ್ರಾಣಾಯಾಮ ಅಭ್ಯಾಸ"],
    dontsKn: ["ಋಣಾತ್ಮಕ ಯೋಚನೆಗಳಲ್ಲಿ ಕಾಲಹರಣ ಮಾಡುವುದು", "ಅಪರಿಚಿತರೊಂದಿಗೆ ಹಣಕಾಸಿನ ರಹಸ್ಯ ಹಂಚಿಕೊಳ್ಳುವುದು", "ಅನ್ಯರ ದೋಷಗಳನ್ನು ಎಣಿಸುವುದು"],
    microKn: "ಗೋಮಾತೆಗೆ ಬಾಳೆಹಣ್ಣು ಅಥವಾ ಬೆಲ್ಲವನ್ನು ಪ್ರೀತಿಯಿಂದ ನೀಡಿ."
  }
];

export const DailyKarmaNavigator: React.FC<DailyKarmaNavigatorProps> = ({
  dateStr,
  rashiIndex = 8,
  nakshatraIndex = 18,
  lang = "kn",
  devoteeName = "ಭಕ್ತರು"
}) => {
  const t = KARMA_TEXTS[lang] || KARMA_TEXTS.kn;
  const storageKey = `baggona_micro_parihara_${dateStr}_${devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDone(localStorage.getItem(storageKey) === "done");
    }
  }, [storageKey]);

  const karmaData = useMemo(() => {
    const d = new Date(dateStr);
    const seed = (d.getFullYear() * 100 + (d.getMonth() + 1) * 10 + d.getDate() + rashiIndex + nakshatraIndex) % DO_DONT_POOLS.length;
    return DO_DONT_POOLS[seed];
  }, [dateStr, rashiIndex, nakshatraIndex]);

  const handleMarkDone = () => {
    setIsDone(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, "done");
      } catch {}
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#451A03] via-[#301004] to-[#1C0A00] border-2 border-[#D4AF37] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-amber-100">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-amber-500/30 pb-3">
        <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl shadow-xs">
          🧭
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

      {/* Do's and Don'ts 2-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Do's */}
        <div className="p-4 bg-emerald-950/40 rounded-2xl border-2 border-emerald-500/50 space-y-2 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">✓</span>
            <span>{t.dosTitle}</span>
          </div>
          <ul className="space-y-2 text-xs text-emerald-100 font-medium pl-1">
            {karmaData.dosKn.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-black">•</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Don'ts */}
        <div className="p-4 bg-rose-950/40 rounded-2xl border-2 border-rose-500/50 space-y-2 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-black text-rose-300">
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">✕</span>
            <span>{t.dontsTitle}</span>
          </div>
          <ul className="space-y-2 text-xs text-rose-100 font-medium pl-1">
            {karmaData.dontsKn.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-black">•</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 1-Minute Micro-Parihara / Daily Good Deed */}
      <div className="p-4 bg-gradient-to-r from-amber-950/80 via-black/60 to-amber-950/80 rounded-2xl border-2 border-amber-500/50 space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-[#FDE68A]">
            <span>🪔</span>
            <span>{t.microPariharaTitle}</span>
          </div>
          <span className="text-[10px] font-black text-amber-300 bg-amber-900/80 px-3 py-1 rounded-full border border-amber-400 shadow-xs">
            ೧ ನಿಮಿಷದ ಪುಣ್ಯ
          </span>
        </div>

        <p className="text-xs sm:text-sm text-amber-100 font-bold leading-relaxed">
          {karmaData.microKn}
        </p>

        {/* Interactive Completion Button */}
        {!isDone ? (
          <button
            type="button"
            onClick={handleMarkDone}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 border border-amber-300"
          >
            <span>{t.markDoneBtn}</span>
          </button>
        ) : (
          <div className="p-3 bg-emerald-950/80 border-2 border-emerald-400 rounded-xl text-center text-xs sm:text-sm font-black text-emerald-200 animate-in fade-in flex items-center justify-center gap-2 shadow-md">
            <span>✓</span>
            <span>{t.doneBadge}</span>
          </div>
        )}
      </div>
    </div>
  );
};
