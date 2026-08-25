import React from "react";
import Card from "../ui/Card";
import type { FacialFeatureAnalysis, FaceReadingResult } from "../../features/facereading/faceReadingEngine";
import {
  VEDIC_PANCHA_MAHABHUTA_FACES,
  VEDIC_MAHAPURUSHA_FACIAL_ARCHETYPES,
  VEDIC_LALATA_PLANETARY_LINES,
  VEDIC_EYE_TYPES
} from "../../features/facereading/samudrikaFaceKnowledge";

type Props = {
  result?: FaceReadingResult | null;
  features?: FacialFeatureAnalysis[];
  lang: string;
};

const DEFAULT_FEATURES: FacialFeatureAnalysis[] = [
  {
    featureKey: "forehead",
    name: { kn: "೧. ಲಲಾಟ (Forehead)", en: "1. Forehead (Lalata)" },
    planetaryRuler: { kn: "ಗುರು & ಸೂರ್ಯ (ಜ್ಞಾನ & ನಾಯಕತ್ವ)", en: "Jupiter & Sun (Wisdom & Leadership)" },
    observedStructure: { kn: "ವಿಶಾಲ ಹಾಗೂ ಉನ್ನತ ಲಲಾಟ (Broad & Elevated)", en: "Broad and elevated forehead" },
    vedicIndication: { kn: "ಉನ್ನತ ಬುದ್ಧಿಶಕ್ತಿ, ಆಡಳಿತ ನಾಯಕತ್ವ ಹಾಗೂ ಸ್ವತಂತ್ರ ಚಿಂತನೆ.", en: "Executive intellect, strategic leadership and independent thought." },
    score: 92
  },
  {
    featureKey: "eyes",
    name: { kn: "೨. ನೇತ್ರ (Eyes)", en: "2. Eyes (Netra)" },
    planetaryRuler: { kn: "ಸೂರ್ಯ (ಬಲ) & ಚಂದ್ರ (ಎಡ)", en: "Sun (Right) & Moon (Left)" },
    observedStructure: { kn: "ಪದ್ಮಾಕಾರದ ನೇತ್ರಗಳು (Lotus Shaped)", en: "Lotus/Almond shaped eyes" },
    vedicIndication: { kn: "ದೈವಿಕ ಅಂತಃಸ್ಫೂರ್ತಿ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಗ್ರಹಣ ಶಕ್ತಿ.", en: "Deep intuition, integrity, and perceptive foresight." },
    score: 88
  },
  {
    featureKey: "nose",
    name: { kn: "೩. ನಾಸಿಕ (Nose & Bridge)", en: "3. Nose & Wealth Bridge (Nasika)" },
    planetaryRuler: { kn: "ಗುರು & ಬುಧ (ಕುಬೇರ ಸ್ಥಾನ)", en: "Jupiter & Mercury (Kuber Sthana)" },
    observedStructure: { kn: "ಉನ್ನತ ಧನ ರೇಖಾ ಸೇತುವೆ & ಮಾಂಸಲ ತುದಿ", en: "High bridge with well-rounded wealth tip" },
    vedicIndication: { kn: "ಸ್ಥಿರ ಧನ ವೃದ್ಧಿ, ಕುಬೇರ ಯೋಗ ಹಾಗೂ ಉತ್ತಮ ಆರ್ಥಿಕ ನಿರ್ವಹಣೆ.", en: "Continuous wealth accumulation, financial wisdom and prosperity." },
    score: 90
  },
  {
    featureKey: "lips",
    name: { kn: "೪. ಓಷ್ಠ & ಮುಖ (Lips & Mouth)", en: "4. Lips & Expression (Oshtha)" },
    planetaryRuler: { kn: "ಶುಕ್ರ & ಬುಧ (ವಾಕ್ ಸಿದ್ಧಿ)", en: "Venus & Mercury (Vak Siddhi)" },
    observedStructure: { kn: "ಸಮತೋಲಿತ ಹಾಗೂ ಆಕರ್ಷಕ ಓಷ್ಠ", en: "Harmonious and expressive lips" },
    vedicIndication: { kn: "ಚಾಣಾಕ್ಷ ವಾಕ್ಚಾತುರ್ಯ, ಸೌಹಾರ್ದಯುತ ಮಾತು ಹಾಗೂ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ.", en: "Articulate eloquence, diplomatic charm and warm affection." },
    score: 86
  },
  {
    featureKey: "chin",
    name: { kn: "೫. ಚಿಬುಕ & ಹನು (Chin & Jaw)", en: "5. Chin & Jawline (Chibuka)" },
    planetaryRuler: { kn: "ಶನಿ & ಮಂಗಳ (ಭೂಮಿ ಯೋಗ)", en: "Saturn & Mars (Bhoomi Yoga)" },
    observedStructure: { kn: "ದೃಢ ಹಾಗೂ ಬಲಯುತ ಚಿಬುಕ", en: "Firm, well-rounded and strong chin" },
    vedicIndication: { kn: "ಅಚಲ ಮನೋಬಲ, ಸ್ವಂತ ಆಸ್ತಿ ನಿರ್ಮಾಣ ಹಾಗೂ ಸುಖಕರ ವೃದ್ಧಾಪ್ಯ.", en: "Unshakeable willpower, real estate ownership and serene late life." },
    score: 91
  },
  {
    featureKey: "ears",
    name: { kn: "೬. ಕರ್ಣ (Ears & Lobes)", en: "6. Ears & Lobes (Karna)" },
    planetaryRuler: { kn: "ಗುರು (ಆಯುಷ್ಯ ರಕ್ಷೆ)", en: "Jupiter (Longevity & Grace)" },
    observedStructure: { kn: "ದೀರ್ಘ ಹಾಗೂ ಸುಂದರ ಕರ್ಣ ಪಾಲಿಕೆಗಳು", en: "Long, auspicious and thick earlobes" },
    vedicIndication: { kn: "ದೀರ್ಘಾಯುಷ್ಯ, ದೈವಿಕ ರಕ್ಷೆ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದ.", en: "Longevity, spiritual protection and blessing of ancestors." },
    score: 87
  },
  {
    featureKey: "cheeks",
    name: { kn: "೭. ಗಂಡಸ್ಥಳ & ತೇಜಸ್ಸು (Cheeks & Aura)", en: "7. Cheeks & Aura Radiance (Gandasthala)" },
    planetaryRuler: { kn: "ಸೂರ್ಯ & ಚಂದ್ರ (ತೇಜಸ್ಸು)", en: "Sun & Moon (Tejas & Ojas)" },
    observedStructure: { kn: "ಕಾಂತಿಯುತ ಗಂಡಸ್ಥಳ ಹಾಗೂ ತೇಜಸ್ಸು", en: "Radiant cheek contour with natural luster" },
    vedicIndication: { kn: "ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಗೌರವ, ಜನಪ್ರಿಯತೆ ಹಾಗೂ ಸಾತ್ವಿಕ ಪ್ರಭಾವ.", en: "High societal respect, magnetic goodwill and pure charisma." },
    score: 89
  }
];

export const FaceFeaturesTab: React.FC<Props> = ({ result, features, lang }) => {
  const isKn = lang === "kn";
  const featureList = features && features.length > 0 ? features : (result?.features || DEFAULT_FEATURES);

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
              {isKn ? "ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು, ಮಹಾಪುರುಷ ಯೋಗ & ಲಲಾಟ ರೇಖೆಗಳು" : "7 Facial Features, Mahapurusha Yogas & Metoposcopy"}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {isKn
                ? "ಪ್ರಾಚೀನ ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಮುಖದ ಪ್ರತಿಯೊಂದು ಅಂಗವೂ ವ್ಯಕ್ತಿಯ ಪೂರ್ವಜನ್ಮದ ಸುಕೃತ, ಪಂಚಮಹಾಭೂತ ತತ್ತ್ವ ಹಾಗೂ ನವಗ್ರಹ ಕರ್ಮಫಲವನ್ನು ಪ್ರಕಟಿಸುತ್ತದೆ."
                : "According to classical Vedic Samudrika Shastra, every facial contour reflects the native's past merit, elemental balance, and planetary governance."}
            </p>
          </div>
        </div>
      </Card>

      {/* Archetype & Constitution Card (if result available) */}
      {result && (
        <Card className="border border-amber-300 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm space-y-3">
          <div className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-1.5 flex items-center gap-2">
            <span>👑</span>
            <span>{isKn ? "ಪಂಚ ಮಹಾಪುರುಷ ಯೋಗ & ದೈವಿಕ ಸಂವಿಧಾನ" : "Pancha Mahapurusha Archetype & Constitution"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-sm">
              <span className="font-bold text-amber-900 block">{isKn ? "ಮಹಾಪುರುಷ ಯೋಗ:" : "Mahapurusha Yoga:"}</span>
              <span className="font-extrabold text-amber-950 text-sm mt-0.5 block">{result.facialConstitution.mahapurushaArchetype[lang] || result.facialConstitution.mahapurushaArchetype.kn}</span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-sm">
              <span className="font-bold text-amber-900 block">{isKn ? "ಪಂಚಭೂತ ತತ್ತ್ವ:" : "Elemental Constitution:"}</span>
              <span className="font-bold text-amber-950 mt-0.5 block">{result.facialConstitution.primaryElement[lang] || result.facialConstitution.primaryElement.kn}</span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-amber-200 shadow-sm">
              <span className="font-bold text-amber-900 block">{isKn ? "ನೇತ್ರ ರೂಪ (Eye Shape):" : "Vedic Eye Shape:"}</span>
              <span className="font-bold text-emerald-900 mt-0.5 block">{result.facialConstitution.eyeShapeType[lang] || result.facialConstitution.eyeShapeType.kn}</span>
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
                {f.name[lang] || f.name.kn}
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                ಬಲ: {f.score}%
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
              <div>
                <span className="font-bold text-amber-900">{isKn ? "ಅಧಿಪತಿ ಗ್ರಹ:" : "Ruling Planet:"}</span>{" "}
                <span className="font-semibold text-amber-950">{f.planetaryRuler[lang] || f.planetaryRuler.kn}</span>
              </div>

              <div>
                <span className="font-bold text-amber-900">{isKn ? "ಮುಖ ಲಕ್ಷಣ ರಚನೆ:" : "Structure Observed:"}</span>{" "}
                <span className="font-medium text-slate-900">{f.observedStructure[lang] || f.observedStructure.kn}</span>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200 mt-2">
                <span className="font-bold text-amber-950 block mb-0.5">
                  🪔 {isKn ? "ದೈವಿಕ ಸಾಮುದ್ರಿಕ ಫಲ (Vedic Indication):" : "Vedic Indication:"}
                </span>
                <span className="text-amber-900 font-medium">{f.vedicIndication[lang] || f.vedicIndication.kn}</span>
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
            <span>{isKn ? "ಲಲಾಟ ಸಪ್ತ ಗ್ರಹ ರೇಖಾ ವಿಶ್ಲೇಷಣೆ (Forehead Metoposcopy)" : "7 Forehead Planetary Lines"}</span>
          </h4>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
            Lalata Rekha
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {VEDIC_LALATA_PLANETARY_LINES.map((line, idx) => (
            <div key={idx} className="rounded-xl bg-amber-50/60 p-3 border border-amber-200/80 space-y-1">
              <div className="font-bold text-amber-950 flex items-center justify-between">
                <span>{line.planetKn}</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-extrabold">
                  #{line.lineIndex}
                </span>
              </div>
              <p className="text-amber-900 font-medium leading-relaxed">
                {isKn ? line.meaningKn : line.meaningEn}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
