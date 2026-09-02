import React from "react";
import Card from "../ui/Card";
import type { PalmMountAnalysis, PalmReadingResult } from "../../features/palmreading/palmReadingEngine";
import { VEDIC_7_MOUNTS_CATALOG } from "../../features/palmreading/samudrikaKnowledge";

export type PalmMountsTabProps = {
  result?: PalmReadingResult | null;
  mounts?: PalmMountAnalysis[];
  lang?: string;
  devoteeName?: string;
};

export const PalmMountsTab: React.FC<PalmMountsTabProps> = ({
  result,
  mounts,
  lang = "kn",
  devoteeName = "Devotee"
}) => {
  type SupportedLang = "kn" | "en" | "hi" | "te" | "ta";
  const langKey: SupportedLang = (["kn", "en", "hi", "te", "ta"].includes(lang) ? lang : "kn") as SupportedLang;
  const isKn = langKey === "kn";

  const tDict: Record<string, Record<string, string>> = {
    shastraHeader: {
      kn: "॥ ವರಾಹಮಿಹಿರ ಬೃಹತ್ ಸಂಹಿತಾ & ಗರುಡ ಪುರಾಣ ಶಾಸ್ತ್ರ ॥",
      en: "॥ Classical Brihat Samhita & Garuda Purana Hastarekha Shastra ॥",
      hi: "॥ वराहमिहिर बृहत्संहिता एवं गरुड़ पुराण सामुद्रिक शास्त्र ॥",
      te: "॥ వరాహమిహిర బృహత్సంహిత & గరుడ పురాణ సాముద్రిక శాస్త్రం ॥",
      ta: "॥ வராகமிஹிர பிருஹத் சம்ஹிதை & கருட புராண சாமுத்ரிக சாஸ்திரம் ॥"
    },
    title: {
      kn: "ಸಪ್ತ ಗ್ರಹ ಪರ್ವತಗಳು & ಹಸ್ತ ತತ್ತ್ವ ವಿಶ್ಲೇಷಣೆ",
      en: "7 Planetary Mounts & Chironomy Analysis",
      hi: "सप्त ग्रह पर्वत एवं हस्त तत्त्व विश्लेषण",
      te: "సప్త గ్రహ పర్వతాలు & హస్త తత్త్వ విశ్లేషణ",
      ta: "சப்த கிரக மேடுகள் & ஹஸ்த தத்துவ ஆய்வு"
    },
    intro: {
      kn: "ಪ್ರಾಚೀನ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಹಸ್ತದ ೭ ಪರ್ವತಗಳು ನವಗ್ರಹಗಳ ಕಾಸ್ಮಿಕ್ ಕಿರಣಗಳನ್ನು ಹೀರಿಕೊಂಡು ಮನುಷ್ಯನ ವ್ಯಕ್ತಿತ್ವ, ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಭಾಗ್ಯೋದಯವನ್ನು ನಿರ್ಧರಿಸುತ್ತವೆ.",
      en: "Classical Vedic Samudrika Shastra details how the 7 planetary mounts channel celestial cosmic rays, governing executive ambition, wealth resilience, and spiritual elevation.",
      hi: "प्राचीन सामुद्रिक शास्त्र के अनुसार हथेली के ७ पर्वत नवग्रहों की कॉस्मिक ऊर्जा को ग्रहण कर व्यक्ति के चरित्र, सामर्थ्य एवं भाग्योदय का निर्धारण करते हैं।",
      te: "ప్రాచీన సాముద్రిక శాస్త్రం ప్రకారం అరచేతిలోని 7 పర్వతాలు నవగ్రహాల శక్తిని గ్రహించి వ్యక్తిత్వం, సంపద & భాగ్యోదయాలను నిర్ణయిస్తాయి.",
      ta: "பண்டைய சாமுத்ரிக சாஸ்திரத்தின்படி உள்ளங்கையின் 7 மேடுகள் நவகிரகங்களின் காஸ்மிக் ஆற்றலை ஈர்த்து ஆளுமை, செல்வம் மற்றும் வெற்றியை நிர்ணயிக்கின்றன."
    },
    chironomyTitle: {
      kn: "ಹಸ್ತ ತತ್ತ್ವ & ಅಂಗುಷ್ಠ (ಹೆಬ್ಬೆರಳು) ರಹಸ್ಯ",
      en: "Chironomy Hand Element & Thumb (Angushtha) Secrets",
      hi: "हस्त पंचतत्त्व एवं अंगुष्ठ (अंगूठा) रहस्य",
      te: "హస్త తత్త్వం & బొటనవేలి అంతరార్థం",
      ta: "ஹஸ்த தத்துவம் & பெருவிரல் (அங்குஷ்ட) ரகசியம்"
    },
    elementLabel: {
      kn: "ಹಸ್ತ ಪಂಚಭೂತ ತತ್ತ್ವ:",
      en: "Elemental Hand Type:",
      hi: "हस्त पंचभूत तत्त्व:",
      te: "హస్త పంచభూత తత్త్వం:",
      ta: "கை பஞ்சபூத தத்துவம்:"
    },
    yavaLabel: {
      kn: "ಅಂಗುಷ್ಠ ಯವ ಚಿಹ್ನೆ (ಶಿವ ನೇತ್ರ):",
      en: "Thumb Yava (Eye of Shiva):",
      hi: "अंगुष्ठ यव चिह्न (शिव नेत्र):",
      te: "బొటనవేలి యవ చిహ్నం (శివ నేత్రం):",
      ta: "பெருவிரல் யவ குறியீடு (சிவ நேத்திரம்):"
    },
    willpower: {
      kn: "ಇಚ್ಛಾ ಶಕ್ತಿ:",
      en: "Willpower:",
      hi: "इच्छा शक्ति:",
      te: "ఇచ్ఛా శక్తి:",
      ta: "இச்சா சக்தி:"
    },
    logic: {
      kn: "ತರ್ಕ ಶಕ್ತಿ:",
      en: "Logic & Reason:",
      hi: "तर्क शक्ति:",
      te: "తర్క శక్తి:",
      ta: "தர்க்க சக்தி:"
    },
    strengthBadge: {
      kn: "ಬಲ",
      en: "Strength",
      hi: "शक्ति",
      te: "బలం",
      ta: "பலம்"
    },
    rulingPlanet: {
      kn: "ಅಧಿಪತಿ ಗ್ರಹ:",
      en: "Ruling Planet:",
      hi: "शासक ग्रह:",
      te: "అధిపతి గ్రహం:",
      ta: "ஆளும் கிரகம்:"
    },
    associatedFinger: {
      kn: "ಸಂಬಂಧಿತ ಬೆರಳು:",
      en: "Associated Finger:",
      hi: "संबंधित अंगुली:",
      te: "సంబంధిత వేలు:",
      ta: "தொடர்புடைய விரல்:"
    },
    gemChakra: {
      kn: "ರತ್ನ & ಚಕ್ರ:",
      en: "Gemstone & Chakra:",
      hi: "रत्न एवं चक्र:",
      te: "రత్నం & చక్రం:",
      ta: "ரத்தினம் & சக்கரம்:"
    },
    vedicImpact: {
      kn: "ದೈವಿಕ ಫಲ (Vedic Impact):",
      en: "Vedic Impact & Divine Fruit:",
      hi: "दैवीय फल (Vedic Impact):",
      te: "దైవిక ఫలితం:",
      ta: "தெய்வீக பலன்:"
    },
    statusLabel: {
      kn: "ಪರ್ವತ ಸ್ಥಿತಿ:",
      en: "Mount Status:",
      hi: "पर्वत स्थिति:",
      te: "పర్వత స్థితి:",
      ta: "மேட்டின் நிலை:"
    }
  };

  const getT = (key: string) => tDict[key]?.[langKey] || tDict[key]?.kn || "";

  // Combine AI mounts with catalog
  const effectiveMounts = mounts || result?.mounts || [];

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none filter drop-shadow">🪐</span>
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
              {getT("shastraHeader")}
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {getT("title")}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {getT("intro")}
            </p>
          </div>
        </div>
      </Card>

      {/* Chironomy Hand Element & Thumb Analysis Card */}
      {result && (
        <Card className="border border-amber-300 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm space-y-4">
          <div className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-1.5 flex items-center gap-2">
            <span>🖐️</span>
            <span>{getT("chironomyTitle")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Hand Type */}
            <div className="rounded-xl bg-white p-3.5 border border-amber-200 shadow-sm space-y-1">
              <span className="font-bold text-amber-900 block">
                {getT("elementLabel")}
              </span>
              <span className="font-extrabold text-amber-950 text-sm block">
                {result.chironomyHandType?.element?.[langKey] ||
                  result.chironomyHandType?.element?.en ||
                  result.chironomyHandType?.element?.kn ||
                  "Earth (Prithvi)"}
              </span>
              <p className="text-amber-900/90 font-medium pt-1 leading-relaxed">
                {result.chironomyHandType?.traits?.[langKey] ||
                  result.chironomyHandType?.traits?.en ||
                  result.chironomyHandType?.traits?.kn ||
                  ""}
              </p>
            </div>

            {/* Thumb Shiva Eye */}
            <div className="rounded-xl bg-white p-3.5 border border-amber-200 shadow-sm space-y-1">
              <span className="font-bold text-emerald-900 block">
                {getT("yavaLabel")}
              </span>
              <span className="font-bold text-amber-950 block">
                {result.thumbAnalysis?.yavaSign?.[langKey] ||
                  result.thumbAnalysis?.yavaSign?.en ||
                  result.thumbAnalysis?.yavaSign?.kn ||
                  "Sacred Eye of Shiva Present"}
              </span>
              <div className="text-[11px] text-amber-900 pt-1 space-y-0.5">
                <div>
                  <strong>{getT("willpower")}</strong>{" "}
                  {result.thumbAnalysis?.willpower?.[langKey] ||
                    result.thumbAnalysis?.willpower?.en ||
                    result.thumbAnalysis?.willpower?.kn}
                </div>
                <div>
                  <strong>{getT("logic")}</strong>{" "}
                  {result.thumbAnalysis?.logic?.[langKey] ||
                    result.thumbAnalysis?.logic?.en ||
                    result.thumbAnalysis?.logic?.kn}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 7 Mounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VEDIC_7_MOUNTS_CATALOG.map((catDef, idx) => {
          // Attempt to locate AI analyzed mount by keyword or index
          const aiMount = effectiveMounts.find(
            m =>
              m.mountName?.en?.toLowerCase().includes(catDef.planetKey.toLowerCase()) ||
              m.mountName?.kn?.includes(catDef.planetKey) ||
              m.mountName?.kn?.includes(catDef.planetName.kn.split(" ")[0])
          ) || effectiveMounts[idx];

          // Compute dynamic personalized energy percentage
          let dynamicEnergy = catDef.baseEnergy;
          if (aiMount?.strength) {
            const strVal = Object.values(aiMount.strength).join(" ").toLowerCase();
            if (strVal.includes("prominent") || strVal.includes("elevated") || strVal.includes("ಉನ್ನತ") || strVal.includes("ಪ್ರಬಲ")) {
              dynamicEnergy = Math.min(96, catDef.baseEnergy + 4);
            } else if (strVal.includes("moderate") || strVal.includes("ಮಧ್ಯಮ") || strVal.includes("ಸಾಮಾನ್ಯ")) {
              dynamicEnergy = Math.max(78, catDef.baseEnergy - 6);
            } else if (strVal.includes("low") || strVal.includes("weak") || strVal.includes("ಕ್ಷೀಣ")) {
              dynamicEnergy = Math.max(68, catDef.baseEnergy - 14);
            }
          }

          // Modulation based on overall devotee score if present
          if (result?.overallScore) {
            const delta = Math.round((result.overallScore - 85) / 4);
            dynamicEnergy = Math.min(98, Math.max(65, dynamicEnergy + delta));
          }

          const localizedMountName = catDef.name[langKey] || catDef.name.kn;
          const localizedPlanet = catDef.planetName[langKey] || catDef.planetName.kn;
          const localizedFinger = catDef.finger[langKey] || catDef.finger.kn;
          const localizedChakra = catDef.chakra[langKey] || catDef.chakra.kn;
          const localizedGem = catDef.gemstone[langKey] || catDef.gemstone.kn;
          const localizedVirtue =
            aiMount?.indication?.[langKey] ||
            aiMount?.indication?.en ||
            aiMount?.indication?.kn ||
            catDef.virtues[langKey] ||
            catDef.virtues.kn;

          const localizedStrengthStatus =
            aiMount?.strength?.[langKey] ||
            aiMount?.strength?.en ||
            aiMount?.strength?.kn;

          return (
            <Card
              key={catDef.id}
              className="border-2 border-amber-300/80 bg-white hover:border-amber-400 p-4 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="font-serif text-sm font-bold text-amber-950">
                  {localizedMountName}
                </span>
                <span className="text-[11px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                  {getT("strengthBadge")}: {dynamicEnergy}%
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-amber-900 font-bold">{getT("rulingPlanet")}</span>
                  <span className="font-semibold text-amber-950">{localizedPlanet}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-amber-900 font-bold">{getT("associatedFinger")}</span>
                  <span className="font-medium text-slate-900">{localizedFinger}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-amber-900 font-bold">{getT("gemChakra")}</span>
                  <span className="font-medium text-slate-900">{localizedGem} · {localizedChakra}</span>
                </div>

                {localizedStrengthStatus && (
                  <div className="flex justify-between">
                    <span className="text-amber-900 font-bold">{getT("statusLabel")}</span>
                    <span className="font-semibold text-emerald-800">{localizedStrengthStatus}</span>
                  </div>
                )}

                <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200 mt-2">
                  <span className="font-bold text-amber-950 block mb-0.5">
                    🪔 {getT("vedicImpact")}
                  </span>
                  <span className="text-amber-900 font-medium leading-relaxed block">
                    {localizedVirtue}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PalmMountsTab;
