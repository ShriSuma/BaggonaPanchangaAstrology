import React from "react";
import Card from "../ui/Card";
import type { FacialAgeMilestone } from "../../features/facereading/faceReadingEngine";

type Props = {
  milestones?: FacialAgeMilestone[];
  lang: string;
  estimatedAge?: number;
};

const DEFAULT_MILESTONES: FacialAgeMilestone[] = [
  {
    agePhase: {
      kn: "೧. ಯೌವನ & ವಿದ್ಯಾಭ್ಯಾಸ",
      en: "1. Youth & Foundation",
      hi: "१. यौवन एवं विद्याभ्यास",
      te: "౧. యవ్వనం & విద్యాభ్యాసం",
      ta: "1. இளமை & கல்விப் பருவம்"
    },
    ageWindow: {
      kn: "೧೫ ರಿಂದ ೩೦ ವರ್ಷ",
      en: "15 to 30 Years",
      hi: "15 से 30 वर्ष",
      te: "15 నుండి 30 సంవత్సరాలు",
      ta: "15 முதல் 30 ஆண்டுகள்"
    },
    facialArea: {
      kn: "ಲಲಾಟ & ಹಣೆಯ ರೇಖೆಗಳು (Forehead)",
      en: "Forehead & Brow Lines",
      hi: "ललाट व भाल रेखाएं",
      te: "లలాటం & నుదుటి రేఖలు",
      ta: "நெற்றி & புருவ ரேகைகள்"
    },
    prediction: {
      kn: "ಶಿಕ್ಷಣದಲ್ಲಿ ಉತ್ತಮ ಸಾಧನೆ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಯಶಸ್ಸು ಹಾಗೂ ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ವೃತ್ತಿ ಪ್ರವೇಶ.",
      en: "Academic achievements, rapid skill acquisition, competitive exam success, and solid career entry.",
      hi: "शिक्षा में उत्कृष्ट सफलता, प्रतियोगी परीक्षाओं में विजय एवं स्वावलंबन से आजीविका प्रारंभ।",
      te: "విద్యలో విశేష ప్రతిభ, పోటీ పరీక్షలలో విజయం & స్వశక్తితో వృత్తి జీవిత ప్రారంభం.",
      ta: "கல்வியில் சிறந்த வெற்றி, போட்டித் தேர்வுகளில் தேர்ச்சி & சுய உழைப்பில் தொழில் தொடக்கம்."
    }
  },
  {
    agePhase: {
      kn: "೨. ವೃತ್ತಿ ಉನ್ನತಿ & ವಿವಾಹ",
      en: "2. Career & Marriage",
      hi: "२. करियर उन्नति एवं विवाह",
      te: "౨. వృత్తి ఉన్నతి & వివాహం",
      ta: "2. தொழில் உயர்வு & திருமணம்"
    },
    ageWindow: {
      kn: "೩೧ ರಿಂದ ೪೦ ವರ್ಷ",
      en: "31 to 40 Years",
      hi: "31 से 40 वर्ष",
      te: "31 నుండి 40 సంవత్సరాలు",
      ta: "31 முதல் 40 ஆண்டுகள்"
    },
    facialArea: {
      kn: "ನೇತ್ರ & ಭ್ರೂಮಧ್ಯ (Eyes & Brow Ridge)",
      en: "Eyes & Ajna Center",
      hi: "नेत्र व भौंहों का मध्य (आज्ञा चक्र)",
      te: "నేత్రాలు & భ్రూమధ్యం",
      ta: "கண்கள் & புருவ மத்தி (ஆக்ஞா)"
    },
    prediction: {
      kn: "ವಿವಾಹ ಯೋಗ, ಸಾಮಾಜಿಕ ಮನ್ನಣೆ, ವಿದೇಶ/ದೂರ ಪ್ರಯಾಣ ಹಾಗೂ ವೃತ್ತಿಪರ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ.",
      en: "Marital harmony, executive elevation, travel, influential networking, and leadership recognition.",
      hi: "विवाह सुख, सामाजिक सम्मान, दूर यात्राएं एवं उच्च पद व नेतृत्व अधिकार प्राप्ति।",
      te: "వివాహ యోగం, సామాజిక గౌరవం, దూర ప్రయాణాలు & ఉన్నత పదవీ బాధ్యతలు.",
      ta: "திருமண யோகம், சமூக மதிப்பு, தூரப் பயணம் & உயர் நிர்வாகப் பதவி யோகம்."
    }
  },
  {
    agePhase: {
      kn: "೩. ಧನ ಸಮೃದ್ಧಿ & ಭಾಗ್ಯೋದಯ",
      en: "3. Peak Wealth & Assets",
      hi: "३. धन समृद्धि एवं भाग्योदय",
      te: "౩. ధన సమృద్ధి & భాగ్యోదయం",
      ta: "3. தன வளம் & பாக்கியோதயம்"
    },
    ageWindow: {
      kn: "೪೧ ರಿಂದ ೫೦ ವರ್ಷ",
      en: "41 to 50 Years",
      hi: "41 से 50 वर्ष",
      te: "41 నుండి 50 సంవత్సరాలు",
      ta: "41 முதல் 50 ஆண்டுகள்"
    },
    facialArea: {
      kn: "ನಾಸಿಕ & ಗಂಡಸ್ಥಳ (Nose & Cheeks)",
      en: "Nose Bridge & Cheeks",
      hi: "नासिका एवं कपोल",
      te: "నాసిక & చెంపలు",
      ta: "மூக்கு & கன்னங்கள்"
    },
    prediction: {
      kn: "ಕುಬೇರ ಯೋಗದ ಮೂಲಕ ಸ್ವಂತ ಮನೆ, ಭೂಮಿ ಖರೀದಿ, ಹೂಡಿಕೆಗಳಲ್ಲಿ ಲಾಭ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ.",
      en: "Peak wealth creation, property acquisition, investment returns, and business expansion through Kuber Yoga.",
      hi: "कुबेर योग से स्वयं का भवन, भूमि क्रय, निवेश लाभ एवं व्यापार का बहुमुखी विस्तार।",
      te: "కుబేర యోగంతో స్వంత ఇల్లు, భూమి కొనుగోలు, పెట్టుబడుల లాభం & వ్యాపార విస్తరణ.",
      ta: "குபேர யோகத்தால் சொந்த வீடு, பூமி வாங்குதல், முதலீட்டு லாபம் & வியாபார விரிவாக்கம்."
    }
  },
  {
    agePhase: {
      kn: "೪. ಕೀರ್ತಿ & ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿ",
      en: "4. Legacy & Peace",
      hi: "४. कीर्ति एवं आत्मिक शांति",
      te: "౪. కీర్తి & ప్రశాంతత",
      ta: "4. புகழ் & ஆத்ம சாந்தி"
    },
    ageWindow: {
      kn: "೫೧ ರಿಂದ ೭೫+ ವರ್ಷ",
      en: "51 to 75+ Years",
      hi: "51 से 75+ वर्ष",
      te: "51 నుండి 75+ సంవత్సరాలు",
      ta: "51 முதல் 75+ ஆண்டுகள்"
    },
    facialArea: {
      kn: "ಚಿಬುಕ & ಓಷ್ಠ (Chin & Lower Face)",
      en: "Chin & Mouth Contour",
      hi: "चिबुक एवं मुख परिधि",
      te: "చిబుకం & పెదవులు",
      ta: "தாடை & உதடுகள்"
    },
    prediction: {
      kn: "ಮಕ್ಕಳಿಂದ ಅಪಾರ ನೆಮ್ಮದಿ, ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ, ಗೌರವಾನ್ವಿತ ಸ್ಥಾನ ಹಾಗೂ ಆರೋಗ್ಯಪೂರ್ಣ ದೀರ್ಘಾಯುಷ್ಯ.",
      en: "Family joy from children, spiritual fulfillment, venerable social status, and healthy longevity.",
      hi: "संतान सुख, आध्यात्मिक सिद्धि, परम सम्मान तथा रोगमुक्त दीर्घायुष्य।",
      te: "పిల్లల వల్ల మనశ్శాంతి, ఆధ్యాత్మిక ఉన్నతి, గౌరవప్రదమైన స్థానం & ఆరోగ్యకర దీర్ఘాయుష్షు.",
      ta: "பிள்ளைகளால் பெருமகிழ்ச்சி, ஆன்மீக பக்குவம், உயரிய மரியாதை & ஆரோக்கியமான நீண்ட ஆயுள்."
    }
  }
];

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

function isAgeInPhase(idx: number, age: number): boolean {
  if (idx === 0) return age <= 30;
  if (idx === 1) return age >= 31 && age <= 40;
  if (idx === 2) return age >= 41 && age <= 50;
  return age >= 51;
}

export const FaceChronologyTab: React.FC<Props> = ({
  milestones = DEFAULT_MILESTONES,
  lang,
  estimatedAge = 29
}) => {
  const list = milestones && milestones.length > 0 ? milestones : DEFAULT_MILESTONES;
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
            ⏳ {ageFormatter(estimatedAge)}
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
