import React, { useState } from "react";
import { pick } from "../../features/seva/sevaLocale";

export type PersonalizationState = {
  maritalStatus: "unmarried" | "married" | "general";
  childrenStatus: "has_children" | "no_children" | "general";
};

type Props = {
  isOpen: boolean;
  lang: string;
  onClose: () => void;
  onConfirm: (personalization: PersonalizationState) => void;
};

export default function PdfPersonalizationModal({
  isOpen,
  lang,
  onClose,
  onConfirm
}: Props): JSX.Element | null {
  const [maritalStatus, setMaritalStatus] = useState<"unmarried" | "married" | "general">("general");
  const [childrenStatus, setChildrenStatus] = useState<"has_children" | "no_children" | "general">("general");

  if (!isOpen) return null;

  const titleMap = {
    kn: "ಪ್ರೀಮಿಯಂ ಪಿಡಿಎಫ್ ಗ್ರಾಹಕೀಕರಣ (ವೈಯಕ್ತಿಕ ಭವಿಷ್ಯ)",
    en: "Personalize Your Premium Astrological PDF",
    hi: "प्रीमियम पीडीएफ कस्टमाइज़ेशन",
    te: "ప్రీమియం పిడిఎఫ్ వ్యక్తిగతీకరణ",
    ta: "பிரீமியம் PDF தனிப்பயனாக்கம்"
  };

  const subtitleMap = {
    kn: "ನಿಮ್ಮ ವಿವಾಹ ಹಾಗೂ ಸಂತಾನ ಯೋಗದ ನಿಖರ ಭವಿಷ್ಯ ಮತ್ತು ಪೂರ್ಣ ಪರಿಹಾರ ಪಡೆಯಲು ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:",
    en: "Select your current status for targeted predictions and exact remedies in your report:",
    hi: "सटीक विवाह और संतान भविष्यवाणियों के लिए अपनी वर्तमान स्थिति चुनें:",
    te: "ఖచ్చితమైన వివాహ మరియు సంతాన జాతక విశ్లేషణ కోసం మీ ప్రస్తుత స్థితిని ఎంచుకోండి:",
    ta: "துல்லியமான திருமணம் மற்றும் சந்ததி பலன்களுக்கு உங்கள் தற்போதைய நிலையைத் தேர்ந்தெடுக்கவும்:"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-amber-300/80 bg-amber-50 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
          <div>
            <h3 className="font-serif text-xl font-bold text-amber-950">
              ✨ {titleMap[lang as keyof typeof titleMap] || titleMap.en}
            </h3>
            <p className="mt-1 text-xs text-amber-900/70">
              {subtitleMap[lang as keyof typeof subtitleMap] || subtitleMap.en}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-amber-800 hover:bg-amber-200/60"
          >
            ✕
          </button>
        </div>

        {/* Question 1: Marital Status */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900">
            {lang === "kn" ? "1. ವೈವಾಹಿಕ ಸ್ಥಿತಿ (Marital Status)" : "1. Marital Status"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "general", label: { kn: "ಸಾಮಾನ್ಯ (ಸಾಮಾನ್ಯ)", en: "General (Default)", hi: "सामान्य (Default)", te: "సాధారణం (Default)", ta: "பொதுவானது (Default)" } },
              { id: "unmarried", label: { kn: "ಅವಿವಾಹಿತ (ಮದುವೆ)", en: "Unmarried (Single)", hi: "अविवाहित (विवाह)", te: "అవివాహితుడు", ta: "திருமணமாகாதவர்" } },
              { id: "married", label: { kn: "ವಿವಾಹಿತ", en: "Married", hi: "विवाहित", te: "వివాహితుడు", ta: "திருமணமானவர்" } }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setMaritalStatus(opt.id as any);
                  if (opt.id === "unmarried") setChildrenStatus("general");
                }}
                className={`rounded-xl border p-2.5 text-xs font-semibold transition text-center ${
                  maritalStatus === opt.id
                    ? "border-amber-700 bg-amber-700 text-white shadow-sm"
                    : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100/60"
                }`}
              >
                {pick(opt.label, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Children (shown if Married or General) */}
        {maritalStatus !== "unmarried" && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900">
              {lang === "kn" ? "2. ಸಂತಾನ ವಿವರ (Children Status)" : "2. Children Status"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "general", label: { kn: "ಸಾಮಾನ್ಯ (ಸಾಮಾನ್ಯ)", en: "General (Default)", hi: "सामान्य (Default)", te: "సాధారణం (Default)", ta: "பொதுவானது (Default)" } },
                { id: "no_children", label: { kn: "ಮಕ್ಕಳಿಲ್ಲ (ಸಂತಾನ ನಿರೀಕ್ಷೆ)", en: "Seeking Progeny", hi: "संतान की आकांक्षा", te: "సంతాన నిరీక్షణ", ta: "குழந்தை பாக்கியம்" } },
                { id: "has_children", label: { kn: "ಮಕ್ಕಳಿದ್ದಾರೆ", en: "Has Children", hi: "संतान है", te: "పిల్లలు ఉన్నారు", ta: "குழந்தைகள் உள்ளனர்" } }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setChildrenStatus(opt.id as any)}
                  className={`rounded-xl border p-2.5 text-xs font-semibold transition text-center ${
                    childrenStatus === opt.id
                      ? "border-amber-700 bg-amber-700 text-white shadow-sm"
                      : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100/60"
                  }`}
                >
                  {pick(opt.label, lang)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit & Cancel */}
        <div className="pt-3 flex gap-3">
          <button
            type="button"
            onClick={() => onConfirm({ maritalStatus, childrenStatus })}
            className="flex-1 rounded-xl bg-gradient-to-r from-amber-700 to-orange-700 py-3 text-sm font-bold text-white shadow-md hover:from-amber-800 hover:to-orange-800 transition"
          >
            ✨ {lang === "kn" ? "ಪ್ರೀಮಿಯಂ ಪಿಡಿಎಫ್ ಸಿದ್ಧಪಡಿಸಿ" : "Generate Customized PDF"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-100/60"
          >
            {lang === "kn" ? "ರದ್ದುಗೊಳಿಸಿ" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
