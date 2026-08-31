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
    <div className="bg-gradient-to-br from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-amber-300 pb-2.5">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-lg shadow-sm border border-amber-400">
          🧭
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

      {/* Do's and Don'ts 2-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Do's */}
        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border-2 border-emerald-400/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
            <span>{t.dosTitle}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-emerald-950 font-semibold pl-2">
            {karmaData.dosKn.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-black">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Don'ts */}
        <div className="p-3.5 bg-red-50/70 rounded-2xl border-2 border-red-400/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-red-950">
            <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-black">✕</span>
            <span>{t.dontsTitle}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-red-950 font-semibold pl-2">
            {karmaData.dontsKn.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-red-700 font-black">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 1-Minute Micro-Parihara / Daily Good Deed */}
      <div className="p-3.5 bg-gradient-to-r from-amber-100/90 via-orange-100/70 to-amber-100/90 rounded-2xl border-2 border-amber-400 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
            <span>🪔</span>
            <span>{t.microPariharaTitle}</span>
          </div>
          <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-400">
            ೧ ನಿಮಿಷದ ಪುಣ್ಯ
          </span>
        </div>

        <p className="text-xs text-amber-950 font-bold leading-relaxed">
          {karmaData.microKn}
        </p>

        {/* Interactive Completion Button */}
        {!isDone ? (
          <button
            type="button"
            onClick={handleMarkDone}
            className="w-full py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all active:scale-98 flex items-center justify-center gap-1.5 border border-amber-400"
          >
            <span>{t.markDoneBtn}</span>
          </button>
        ) : (
          <div className="p-2 bg-emerald-100 border border-emerald-400 rounded-xl text-center text-xs font-black text-emerald-950 animate-in fade-in flex items-center justify-center gap-1.5">
            <span>✓</span>
            <span>{t.doneBadge}</span>
          </div>
        )}
      </div>
    </div>
  );
};
