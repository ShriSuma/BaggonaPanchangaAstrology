import React from "react";
import Card from "../ui/Card";
import type { FacialFeatureAnalysis } from "../../features/facereading/faceReadingEngine";

type Props = {
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

export const FaceFeaturesTab: React.FC<Props> = ({ features = DEFAULT_FEATURES, lang }) => {
  const isKn = lang === "kn";
  const featureList = features && features.length > 0 ? features : DEFAULT_FEATURES;

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <Card className="border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none">👁️</span>
          <div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {isKn ? "ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು & ನವಗ್ರಹ ಅಧಿಪತ್ಯ" : "7 Facial Features & Planetary Rulers"}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium mt-1">
              {isKn
                ? "ಪ್ರಾಚೀನ ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಮಾನವ ಮುಖದ ಪ್ರತಿಯೊಂದು ಅಂಗವೂ ನಿರ್ದಿಷ್ಟ ಗ್ರಹದ ಶಕ್ತಿ ಹಾಗೂ ಕರ್ಮ ಫಲವನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ."
                : "According to classical Vedic Physiognomy, each facial feature reflects the energy of specific ruling Grahas and karmic blueprints."}
            </p>
          </div>
        </div>
      </Card>

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
    </div>
  );
};
