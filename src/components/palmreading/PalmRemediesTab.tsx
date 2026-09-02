import React from "react";
import Card from "../ui/Card";
import type { PalmReadingResult } from "../../features/palmreading/palmReadingEngine";
import { VEDIC_REMEDIES_CATALOG_L5 } from "../../features/palmreading/samudrikaKnowledge";

export type PalmRemediesTabProps = {
  result?: PalmReadingResult | null;
  lang?: string;
  devoteeName?: string;
};

export const PalmRemediesTab: React.FC<PalmRemediesTabProps> = ({
  result,
  lang = "kn",
  devoteeName = "Devotee"
}) => {
  const langKey = ["kn", "en", "hi", "te", "ta"].includes(lang) ? lang : "kn";
  const isKn = langKey === "kn";

  const tDict: Record<string, Record<string, string>> = {
    title: {
      kn: "ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಸಾಮುದ್ರಿಕ ದೈವಿಕ ಪರಿಹಾರ ಮಾರ್ಗದರ್ಶನ",
      en: "Gemstone, Rudraksha & Palmistry Remedies",
      hi: "रत्न, रुद्राक्ष एवं सामुद्रिक दैवीय उपाय मार्गदर्शन",
      te: "రత్నం, రుద్రాక్ష & సాముద్రిక దైవిక పరిహార మార్గదర్శనం",
      ta: "ரத்தினம், ருத்ராட்சம் & சாமுத்ரிக தெய்வீக பரிகார வழிகாட்டுதல்"
    },
    subtitle: {
      kn: `${devoteeName} ಅವರ ಹಸ್ತ ರೇಖೆಗಳ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ, ಲೋಹದ ಉಂಗುರ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರಗಳು.`,
      en: `Auspicious gemstones, Rudraksha beads, sacred rings, and Gokarna remedies customized for ${devoteeName}.`,
      hi: `${devoteeName} की हस्त रेखाओं एवं पर्वतों के आधार पर अनुकूल रत्न, रुद्राक्ष, धातु एवं गोकर्ण उपाय।`,
      te: `${devoteeName} గారి హస్త రేఖల ఆధారంగా సూచించిన రత్నాలు, రుద్రాక్షలు & గోకర్ణ పరిహారాలు.`,
      ta: `${devoteeName} அவர்களின் கைரேகைகளின் அடிப்படையில் பரிந்துரைக்கப்படும் ரத்தினங்கள், ருத்ராட்சம் மற்றும் கோகர்ண பரிகாரங்கள்.`
    },
    badge: {
      kn: "ಗೋಕರ್ಣ ಸಿದ್ಧ ಪರಿಹಾರ",
      en: "Gokarna Sacred Remedies",
      hi: "गोकर्ण सिद्ध उपाय",
      te: "గోకర్ణ సిద్ధ పరిహారాలు",
      ta: "கோகர்ண சித்த பரிகாரம்"
    },
    personalRemedyTitle: {
      kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸಿದ್ಧ ಹಸ್ತ ಪರಿಹಾರ ಸಂಕಲ್ಪ",
      en: "Sri Gokarna Mahabaleshwara Tailored Sacred Remedy",
      hi: "श्री गोकर्ण महाबलेश्वर वैयक्तिक सिद्ध हस्त उपाय",
      te: "గోకర్ణ మహాబలేశ్వర వ్యక్తిగత సాముద్రిక పరిహారం",
      ta: "ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் பிரத்யேக ஹஸ்த பரிகாரம்"
    },
    gemstonesTitle: {
      kn: "ಬೆರಳುಗಳ ಪ್ರಕಾರ ಧರಿಸಬೇಕಾದ ರತ್ನಗಳು (Gemstones by Finger):",
      en: "Auspicious Gemstones by Finger & Planetary Mount:",
      hi: "अंगुलियों के अनुसार धारण योग्य रत्न:",
      te: "వేళ్ళ ప్రకారం ధరించాల్సిన రత్నాలు:",
      ta: "விரல்களின்படி அணிய வேண்டிய ரத்தினங்கள்:"
    },
    rudrakshaTitle: {
      kn: "ಪವಿತ್ರ ರುದ್ರಾಕ್ಷಿ ಮಾರ್ಗದರ್ಶನ (Sacred Rudraksha):",
      en: "Auspicious Rudraksha Guidance:",
      hi: "पवित्र रुद्राक्ष मार्गदर्शन:",
      te: "పవిత్ర రుద్రాక్ష మార్గదర్శనం:",
      ta: "புனித ருத்ராட்ச வழிகாட்டுதல்:"
    },
    templeTitle: {
      kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಸೇವಾ ಸಂಕಲ್ಪ (Temple Seva):",
      en: "Sri Gokarna Mahabaleshwara Temple Seva Sankalpa:",
      hi: "श्री गोकर्ण महाबलेश्वर दैवीय सेवा संकल्प:",
      te: "గోకర్ణ మహాబలేశ్వర ఆలయ సేవా సంకల్పం:",
      ta: "ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் திருக்கோயில் சேவை சங்கல்பம்:"
    },
    recommendedBadge: {
      kn: "ಹಸ್ತಕ್ಕೆ ಪ್ರಶಸ್ತ",
      en: "Recommended",
      hi: "शुभ संस्तुति",
      te: "హస్తానికి శ్రేష్ఠం",
      ta: "சிறந்த பரிகாரம்"
    }
  };

  const getT = (k: string) => tDict[k]?.[langKey] || tDict[k]?.kn || "";

  // Extract personalized remedy recommendation from AI if present
  const personalizedAiRemedy =
    result?.remedyRecommendation?.[langKey] ||
    result?.remedyRecommendation?.en ||
    result?.remedyRecommendation?.kn;

  return (
    <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-amber-200 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
            <span>💍</span>
            <span>{getT("title")}</span>
          </h3>
          <p className="text-xs text-amber-900/80 mt-1">
            {getT("subtitle")}
          </p>
        </div>

        <div className="rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-900">
          🪔 {getT("badge")}
        </div>
      </div>

      {/* Dynamic Personalized Prescription Card (from AI result) */}
      {personalizedAiRemedy && (
        <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 font-serif text-sm font-bold text-amber-950 border-b border-amber-300/80 pb-1.5">
            <span className="text-xl">🪔</span>
            <span>{getT("personalRemedyTitle")}</span>
          </div>
          <p className="text-xs text-amber-950 font-medium leading-relaxed">
            {personalizedAiRemedy}
          </p>
        </div>
      )}

      {/* Gemstones & Rudraksha Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Gemstones by Finger */}
        <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 shadow-sm space-y-3">
          <h4 className="font-serif text-sm font-bold text-amber-950 border-b border-amber-300/80 pb-2 flex items-center gap-2">
            <span>💎</span>
            <span>{getT("gemstonesTitle")}</span>
          </h4>

          <div className="space-y-2 text-xs">
            {VEDIC_REMEDIES_CATALOG_L5.gemstones.map((gem, idx) => {
              const fingerName = gem[`finger${langKey.charAt(0).toUpperCase() + langKey.slice(1)}` as keyof typeof gem] || gem.fingerKn;
              const gemName = gem[`gem${langKey.charAt(0).toUpperCase() + langKey.slice(1)}` as keyof typeof gem] || gem.gemKn;
              const benefitName = gem[`benefit${langKey.charAt(0).toUpperCase() + langKey.slice(1)}` as keyof typeof gem] || gem.benefitKn;

              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white p-2.5 border border-amber-200 flex flex-wrap items-center justify-between gap-2 shadow-xs"
                >
                  <div>
                    <span className="font-bold text-amber-900 block">👉 {fingerName}:</span>
                    <div className="text-[11px] text-amber-950 font-medium">{gemName}</div>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                    {benefitName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Rudraksha Guidance */}
        <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 shadow-sm space-y-3">
          <h4 className="font-serif text-sm font-bold text-amber-950 border-b border-amber-300/80 pb-2 flex items-center gap-2">
            <span>📿</span>
            <span>{getT("rudrakshaTitle")}</span>
          </h4>

          <div className="space-y-2 text-xs">
            {VEDIC_REMEDIES_CATALOG_L5.rudrakshas.map((rud, idx) => {
              const rudName = rud[`name${langKey.charAt(0).toUpperCase() + langKey.slice(1)}` as keyof typeof rud] || rud.nameKn;
              const rudDesc = rud[`desc${langKey.charAt(0).toUpperCase() + langKey.slice(1)}` as keyof typeof rud] || rud.descKn;

              return (
                <div key={idx} className="rounded-xl bg-white p-2.5 border border-amber-200 shadow-xs space-y-0.5">
                  <span className="font-bold text-amber-900 block">🌿 {rudName}:</span>
                  <p className="text-[11px] text-amber-950 font-medium leading-relaxed">
                    {rudDesc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sacred Temple Remedies at Gokarna */}
      <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/70 p-5 shadow-sm space-y-3">
        <h4 className="font-serif text-sm font-bold text-emerald-950 border-b border-emerald-300 pb-2 flex items-center gap-2">
          <span>🪔</span>
          <span>{getT("templeTitle")}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {VEDIC_REMEDIES_CATALOG_L5.templeRituals.map((ritual) => {
            const rTitle = ritual[`title${langKey.charAt(0).toUpperCase() + langKey.slice(1)}` as keyof typeof ritual] || ritual.titleKn;
            const rDesc = ritual[`desc${langKey.charAt(0).toUpperCase() + langKey.slice(1)}` as keyof typeof ritual] || ritual.descKn;

            return (
              <div key={ritual.id} className="rounded-xl bg-white p-3 border border-emerald-200 space-y-1 shadow-sm">
                <div className="font-bold text-emerald-900">{rTitle}</div>
                <p className="text-[11px] text-emerald-950 leading-relaxed font-medium">
                  {rDesc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default PalmRemediesTab;
