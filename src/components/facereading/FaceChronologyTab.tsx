import React from "react";
import Card from "../ui/Card";
import type { FacialAgeMilestone } from "../../features/facereading/faceReadingEngine";
import { VEDIC_CHRONOLOGY_PHASES_L5 } from "../../features/facereading/samudrikaFaceKnowledge";

type Props = {
  milestones?: FacialAgeMilestone[];
  lang: string;
  estimatedAge?: number;
};

const buildDefaultMilestones = (): FacialAgeMilestone[] => {
  return VEDIC_CHRONOLOGY_PHASES_L5.map((p) => ({
    agePhase: p.title,
    ageWindow: p.defaultWindow,
    facialArea: p.facialArea,
    prediction: {
      kn: "ಮುಖದ ದೈವಿಕ ರೇಖೆಗಳ ಆಧಾರದಲ್ಲಿ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ಶುಭ ಫಲಗಳು ಪ್ರಾಪ್ತಿಯಾಗುತ್ತವೆ.",
      en: "Favorable results unfold during this life phase based on authentic facial contours.",
      hi: "मुख के दिव्य लक्षणों के आधार पर इस जीवन चरण में शुभ फल प्राप्त होंगे।",
      te: "ముఖ దివ్య లక్షణాల ఆధారంగా ఈ జీవిత దశలో శుభ ఫలితాలు సిద్ధిస్తాయి.",
      ta: "முகத்தின் தெய்வீக லட்சணங்களின் அடிப்படையில் இந்த காலகட்டத்தில் நற்பலன்கள் உண்டாகும்."
    }
  }));
};

const CHRONOLOGY_SUBTITLES: Record<string, string> = {
  kn: "ಮುಖ ಲಕ್ಷಣ ಕಾಲಗಣನೆ",
  en: "Vedic Physiognomy Chronology",
  hi: "मुख लक्षण कालक्रम",
  te: "ముఖ లక్షణ కాలక్రమం",
  ta: "முக லட்சண காலக்கணிப்பு"
};

const CHRONOLOGY_MAP_BADGES: Record<string, string> = {
  kn: "೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರ ನಕ್ಷೆ",
  en: "100-Year Vedic Facial Map",
  hi: "100-वर्षीय मुख कालचक्र",
  te: "100-సంవత్సరాల ముఖ కాలచక్రం",
  ta: "100-ஆண்டு முக காலச்சக்கரம்"
};

const ESTIMATED_AGE_PREFIXES: Record<string, (age: number) => string> = {
  kn: (age) => `ಮುಖದ ರೇಖಾ ವಯಸ್ಸು: ಸುಮಾರು ${age} ವರ್ಷಗಳು`,
  en: (age) => `Estimated Face Age: ~${age} Years`,
  hi: (age) => `अनुमानित मुख रेखा आयु: लगभग ${age} वर्ष`,
  te: (age) => `అంచనా వేసిన ముఖ వయస్సు: దాదాపు ${age} సంవత్సరాలు`,
  ta: (age) => `கணிக்கப்பட்ட முக வயது: சுமார் ${age} ஆண்டுகள்`
};

const AGE_BADGE_LABELS: Record<string, string> = {
  kn: "ವಯಸ್ಸು:",
  en: "Age:",
  hi: "आयु:",
  te: "వయస్సు:",
  ta: "வயது:"
};

const ZONE_LABELS: Record<string, string> = {
  kn: "ಮುಖದ ನಿರ್ದಿಷ್ಟ ಭಾಗ:",
  en: "Facial Zone:",
  hi: "मुख का विशिष्ट भाग:",
  te: "ముఖ నిర్దిష్ట భాగం:",
  ta: "முகத்தின் குறிப்பிட்ட பகுதி:"
};

const MILESTONE_LABELS: Record<string, string> = {
  kn: "ಸಾಮುದ್ರಿಕ ಕಾಲ ಫಲ (Prediction):",
  en: "Vedic Milestone (Prediction):",
  hi: "सामुद्रिक काल फल (भविष्यवाणी):",
  te: "సాముద్రిక కాల ఫలం (భవిష్యవాణి):",
  ta: "சாமுத்ரிகா கால பலன் (கணிப்பு):"
};

const CURRENT_PHASE_BADGES: Record<string, string> = {
  kn: "✨ ಪ್ರಸ್ತುತ ಹಂತ",
  en: "✨ Current Phase",
  hi: "✨ वर्तमान चरण",
  te: "✨ ప్రస్తుత దశ",
  ta: "✨ தற்போதைய பருவம்"
};

function formatText(value: Record<string, string> | string | undefined, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.kn || value.en || "";
}

function isAgeInPhase(idx: number, age?: number): boolean {
  if (typeof age !== "number" || isNaN(age)) return false;
  if (idx === 0) return age <= 30;
  if (idx === 1) return age >= 31 && age <= 50;
  if (idx === 2) return age >= 51 && age <= 70;
  return age >= 71;
}

export const FaceChronologyTab: React.FC<Props> = ({
  milestones,
  lang,
  estimatedAge
}) => {
  const list = milestones && milestones.length > 0 ? milestones : buildDefaultMilestones();
  const ageFormatter = ESTIMATED_AGE_PREFIXES[lang] || ESTIMATED_AGE_PREFIXES.en;

  return (
    <div className="space-y-6">
      {/* Age Estimation Banner */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
            {CHRONOLOGY_SUBTITLES[lang] || CHRONOLOGY_SUBTITLES.en}
          </div>
          <h3 className="font-serif text-base font-bold text-amber-950 mt-0.5">
            ⏳ {typeof estimatedAge === "number" ? ageFormatter(estimatedAge) : (lang === "kn" ? "ಮುಖದ ಕಾಲಗಣನೆ ನಕ್ಷೆ" : "Facial Chronology Map")}
          </h3>
        </div>

        <div className="rounded-full bg-amber-800 text-amber-50 px-4 py-1 text-xs font-extrabold shadow-sm">
          {CHRONOLOGY_MAP_BADGES[lang] || CHRONOLOGY_MAP_BADGES.en}
        </div>
      </Card>

      {/* 4 Chronological Age Phases */}
      <div className="space-y-4">
        {list.map((m, idx) => {
          const isCurrent = isAgeInPhase(idx, estimatedAge);
          return (
            <Card
              key={idx}
              className={`border transition space-y-2.5 p-4 shadow-sm ${
                isCurrent
                  ? "border-2 border-amber-500 bg-amber-50/50 shadow-md ring-1 ring-amber-400"
                  : "border-amber-300 bg-white hover:border-amber-400"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
                    <span>📍</span>
                    <span>{formatText(m.agePhase, lang)}</span>
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                      {CURRENT_PHASE_BADGES[lang] || CURRENT_PHASE_BADGES.en}
                    </span>
                  )}
                </div>

                <span className="text-xs bg-amber-100 border border-amber-300 text-amber-900 font-extrabold px-3 py-1 rounded-full">
                  {AGE_BADGE_LABELS[lang] || AGE_BADGE_LABELS.en} {formatText(m.ageWindow, lang)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200/80">
                  <span className="font-bold text-amber-900 block">{ZONE_LABELS[lang] || ZONE_LABELS.en}</span>
                  <span className="font-semibold text-amber-950">{formatText(m.facialArea, lang)}</span>
                </div>

                <div className="sm:col-span-2 rounded-xl bg-white p-2.5 border border-amber-200/80">
                  <span className="font-bold text-amber-900 block mb-0.5">{MILESTONE_LABELS[lang] || MILESTONE_LABELS.en}</span>
                  <span className="text-amber-950 font-medium leading-relaxed">{formatText(m.prediction, lang)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
