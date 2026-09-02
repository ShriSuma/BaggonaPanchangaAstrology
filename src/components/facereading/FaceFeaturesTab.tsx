import React from "react";
import Card from "../ui/Card";
import type { FacialFeatureAnalysis, FaceReadingResult } from "../../features/facereading/faceReadingEngine";
import {
  VEDIC_LALATA_PLANETARY_LINES,
  VEDIC_7_FACIAL_FEATURES_CATALOG_L5
} from "../../features/facereading/samudrikaFaceKnowledge";

type Props = {
  result?: FaceReadingResult | null;
  features?: FacialFeatureAnalysis[];
  lang: string;
};

const STRENGTH_LABELS: Record<string, string> = {
  kn: "ಬಲ:",
  en: "Strength:",
  hi: "शक्ति:",
  te: "బలం:",
  ta: "பலம்:"
};

const RULING_PLANET_LABELS: Record<string, string> = {
  kn: "ಅಧಿಪತಿ ಗ್ರಹ:",
  en: "Ruling Planet:",
  hi: "स्वामी ग्रह:",
  te: "అధిపతి గ్రహం:",
  ta: "அதிபதி கிரகம்:"
};

const STRUCTURE_LABELS: Record<string, string> = {
  kn: "ಮುಖ ಲಕ್ಷಣ ರಚನೆ:",
  en: "Structure Observed:",
  hi: "लक्षण संरचना:",
  te: "లక్షణ నిర్మాణం:",
  ta: "அமைப்பு வடிவம்:"
};

const VEDIC_INDICATION_LABELS: Record<string, string> = {
  kn: "ದೈವಿಕ ಸಾಮುದ್ರಿಕ ಫಲ (Vedic Indication):",
  en: "Vedic Indication:",
  hi: "वैदिक फल (Vedic Indication):",
  te: "వైదిక ఫలం (Vedic Indication):",
  ta: "வேத பலன் (Vedic Indication):"
};

const INTRO_TITLES: Record<string, string> = {
  kn: "ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು, ಮಹಾಪುರುಷ ಯೋಗ & ಲಲಾಟ ರೇಖೆಗಳು",
  en: "7 Facial Features, Mahapurusha Yogas & Metoposcopy",
  hi: "सप्त मुख लक्षण, महापुरुष योग एवं ललाट रेखाएं",
  te: "సప్త ముఖ లక్షణాలు, మహాపురుష యోగాలు & లలాట రేఖలు",
  ta: "ஏழு முக லட்சணங்கள், மகாபுருஷ யோகம் & நெற்றி ரேகைகள்"
};

const INTRO_TEXTS: Record<string, string> = {
  kn: "ಪ್ರಾಚೀನ ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಮುಖದ ಪ್ರತಿಯೊಂದು ಅಂಗವೂ ವ್ಯಕ್ತಿಯ ಪೂರ್ವಜನ್ಮದ ಸುಕೃತ, ಪಂಚಮಹಾಭೂತ ತತ್ತ್ವ ಹಾಗೂ ನವಗ್ರಹ ಕರ್ಮಫಲವನ್ನು ಪ್ರಕಟಿಸುತ್ತದೆ.",
  en: "According to classical Vedic Samudrika Shastra, every facial contour reflects the native's past merit, elemental balance, and planetary governance.",
  hi: "प्राचीन वैदिक सामुद्रिक शास्त्र के अनुसार मुख का प्रत्येक अंग पूर्वजन्म के पुण्य, पंचमहाभूत तत्व व नवग्रह कर्मफल को दर्शाता है।",
  te: "ప్రాచీన ముఖ సాಮುద్రಿಕ శాస్త్రం ప్రకారం ముఖంలోని ప్రతి అంగమూ పూర్వజన్మ సుకృతం, పంచభూత తత్త్వం & నవగ్రహ కర్మఫలాన్ని తెలియజేస్తుంది.",
  ta: "பழங்கால முக சாமுத்ரிகா சாஸ்திரப்படி முகத்தின் ஒவ்வொரு பகுதியும் பூர்வ புண்ணியம், பஞ்சபூத தத்துவம் மற்றும் நவகிரக கர்ம பலனைப் பிரதிபலிக்கிறது."
};

const CONSTITUTION_TITLES: Record<string, string> = {
  kn: "ಪಂಚ ಮಹಾಪುರುಷ ಯೋಗ & ದೈವಿಕ ಸಂವಿಧಾನ",
  en: "Pancha Mahapurusha Archetype & Constitution",
  hi: "पंच महापुरुष योग एवं प्रकृति",
  te: "పంచ మహాపురుష యోగం & ప్రకృతి",
  ta: "பஞ்ச மகாபுருஷ யோகம் & உடல் தத்துவம்"
};

const MAHAPURUSHA_LABELS: Record<string, string> = {
  kn: "ಮಹಾಪುರುಷ ಯೋಗ:",
  en: "Mahapurusha Yoga:",
  hi: "महापुरुष योग:",
  te: "మహాపురుష యోగం:",
  ta: "மகாபுருஷ யோகம்:"
};

const ELEMENT_LABELS: Record<string, string> = {
  kn: "ಪಂಚಭೂತ ತತ್ತ್ವ:",
  en: "Elemental Constitution:",
  hi: "पंचमहाभूत तत्व:",
  te: "పంచభూత తత్త్వం:",
  ta: "பஞ்சபூத தத்துவம்:"
};

const EYE_SHAPE_LABELS: Record<string, string> = {
  kn: "ನೇತ್ರ ರೂಪ (Eye Shape):",
  en: "Vedic Eye Shape:",
  hi: "नेत्र रूप (Eye Shape):",
  te: "నేత్ర రూపం (Eye Shape):",
  ta: "கண் வடிவம் (Eye Shape):"
};

const METOPOSCOPY_TITLES: Record<string, string> = {
  kn: "ಲಲಾಟ ಸಪ್ತ ಗ್ರಹ ರೇಖಾ ವಿಶ್ಲೇಷಣೆ (Forehead Metoposcopy)",
  en: "7 Forehead Planetary Lines (Metoposcopy)",
  hi: "ललाट सप्त ग्रह रेखा विश्लेषण (Metoposcopy)",
  te: "లలాట సప్త గ్రహ రేఖా విశ్లేషణ (Metoposcopy)",
  ta: "நெற்றி சப்த கிரக ரேகை ஆய்வு (Metoposcopy)"
};

const LALATA_BADGES: Record<string, string> = {
  kn: "ಲಲಾಟ ರೇಖಾ",
  en: "Lalata Rekha",
  hi: "ललाट रेखा",
  te: "లలాట రేఖ",
  ta: "லலாட ரேகை"
};

function formatText(value: Record<string, string> | { kn: string; en: string; hi?: string; te?: string; ta?: string } | string | undefined, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const dict = value as Record<string, string>;
  return dict[lang] || dict.kn || dict.en || "";
}

export const FaceFeaturesTab: React.FC<Props> = ({ result, features, lang }) => {
  const featureList = features && features.length > 0 ? features : (result?.features || VEDIC_7_FACIAL_FEATURES_CATALOG_L5);

  return (
    <div className="space-y-6">
      {/* Intro Card with Brihat Samhita Lineage */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none filter drop-shadow">📜</span>
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
              ॥ ವರಾಹಮಿಹಿರ ಬೃಹತ್ ಸಂಹಿತಾ & ಗರುಡ ಪುರಾಣ ಶಾಸ್ತ್ರ ॥
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {INTRO_TITLES[lang] || INTRO_TITLES.en}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {INTRO_TEXTS[lang] || INTRO_TEXTS.en}
            </p>
          </div>
        </div>
      </Card>

      {/* Archetype & Constitution Card (if result available) */}
      {result && (
        <Card className="border border-amber-300 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm space-y-3">
          <div className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-1.5 flex items-center gap-2">
            <span>👑</span>
            <span>{CONSTITUTION_TITLES[lang] || CONSTITUTION_TITLES.en}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-sm">
              <span className="font-bold text-amber-900 block">{MAHAPURUSHA_LABELS[lang] || MAHAPURUSHA_LABELS.en}</span>
              <span className="font-extrabold text-amber-950 text-sm mt-0.5 block">{formatText(result.facialConstitution.mahapurushaArchetype, lang)}</span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-sm">
              <span className="font-bold text-amber-900 block">{ELEMENT_LABELS[lang] || ELEMENT_LABELS.en}</span>
              <span className="font-bold text-amber-950 mt-0.5 block">{formatText(result.facialConstitution.primaryElement, lang)}</span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-sm">
              <span className="font-bold text-amber-900 block">{EYE_SHAPE_LABELS[lang] || EYE_SHAPE_LABELS.en}</span>
              <span className="font-bold text-emerald-900 mt-0.5 block">{formatText(result.facialConstitution.eyeShapeType, lang)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureList.map((f, idx) => (
          <Card
            key={idx}
            className="border-2 border-amber-300/80 bg-white hover:border-amber-400 p-4 shadow-sm hover:shadow-md transition space-y-3"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="font-serif text-sm font-bold text-amber-950">
                {formatText(f.name, lang)}
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                {STRENGTH_LABELS[lang] || STRENGTH_LABELS.en} {f.score}%
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
              <div>
                <span className="font-bold text-amber-900">{RULING_PLANET_LABELS[lang] || RULING_PLANET_LABELS.en}</span>{" "}
                <span className="font-semibold text-amber-950">{formatText(f.planetaryRuler, lang)}</span>
              </div>

              <div>
                <span className="font-bold text-amber-900">{STRUCTURE_LABELS[lang] || STRUCTURE_LABELS.en}</span>{" "}
                <span className="font-medium text-slate-900">{formatText(f.observedStructure, lang)}</span>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200 mt-2">
                <span className="font-bold text-amber-950 block mb-0.5">
                  🪔 {VEDIC_INDICATION_LABELS[lang] || VEDIC_INDICATION_LABELS.en}
                </span>
                <span className="text-amber-900 font-medium">{formatText(f.vedicIndication, lang)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Metoposcopy: 7 Forehead Planetary Lines */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
            <span>✨</span>
            <span>{METOPOSCOPY_TITLES[lang] || METOPOSCOPY_TITLES.en}</span>
          </h4>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
            {LALATA_BADGES[lang] || LALATA_BADGES.en}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {VEDIC_LALATA_PLANETARY_LINES.map((line, idx) => (
            <div key={idx} className="rounded-xl bg-amber-50/60 p-3 border border-amber-200/80 space-y-1">
              <div className="font-bold text-amber-950 flex items-center justify-between">
                <span>{formatText(line.planet, lang)}</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-extrabold">
                  #{line.lineIndex}
                </span>
              </div>
              <p className="text-amber-900 font-medium leading-relaxed">
                {formatText(line.meaning, lang)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
