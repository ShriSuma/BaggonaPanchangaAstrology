import React, { useState } from "react";
import { pick } from "../../features/seva/sevaLocale";

export type PersonalizationState = {
  maritalStatus: "unmarried" | "married" | "general";
  childrenStatus: "has_children" | "no_children" | "general";
  childFocus?: "education" | "activities" | "health" | "general";
};

type Props = {
  isOpen: boolean;
  lang: string;
  ageYears?: number;
  onClose: () => void;
  onConfirm: (personalization: PersonalizationState) => void;
};

export default function PdfPersonalizationModal({
  isOpen,
  lang,
  ageYears,
  onClose,
  onConfirm
}: Props): JSX.Element | null {
  const isChild = ageYears !== undefined && ageYears < 8;

  const [maritalStatus, setMaritalStatus] = useState<"unmarried" | "married" | "general">("general");
  const [childrenStatus, setChildrenStatus] = useState<"has_children" | "no_children" | "general">("general");
  const [childFocus, setChildFocus] = useState<"education" | "activities" | "health" | "general">("education");

  if (!isOpen) return null;

  const titleMap = {
    kn: isChild ? "ಬಾಲ ಜಾತಕ ಪ್ರೀಮಿಯಂ ಪಿಡಿಎಫ್ ಗ್ರಾಹಕೀಕರಣ" : "ಪ್ರೀಮಿಯಂ ಪಿಡಿಎಫ್ ಗ್ರಾಹಕೀಕರಣ (ವೈಯಕ್ತಿಕ ಭವಿಷ್ಯ)",
    en: isChild ? "Child Horoscope Premium PDF Personalization" : "Personalize Your Premium Astrological PDF",
    hi: isChild ? "बाल कुंडली प्रीमियम पीडीएफ कस्टमाइज़ेशन" : "प्रीमियम पीडीएफ कस्टमाइज़ेशन",
    te: isChild ? "బాల జాతకం ప్రీమియం పిడిఎఫ్ వ్యక్తిగతీకరణ" : "ప్రీమియం పిడిఎఫ్ వ్యక్తిగతీకరణ",
    ta: isChild ? "குழந்தை ஜாதகம் பிரீமியம் PDF தனிப்பயனாக்கம்" : "பிரீமியம் PDF தனிப்பயனாக்கம்"
  };

  const subtitleMap = {
    kn: isChild
      ? "ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ, ಬುದ್ಧಿಶಕ್ತಿ, ಆಟ-ಚಟುವಟಿಕೆಗಳು ಹಾಗೂ ದೈಹಿಕ ಆರೋಗ್ಯದ ನಿಖರ ಭವಿಷ್ಯಕ್ಕೆ ಆದ್ಯತೆ ಆಯ್ಕೆ ಮಾಡಿ:"
      : "ನಿಮ್ಮ ವಿವಾಹ ಹಾಗೂ ಸಂತಾನ ಯೋಗದ ನಿಖರ ಭವಿಷ್ಯ ಮತ್ತು ಪೂರ್ಣ ಪರಿಹಾರ ಪಡೆಯಲು ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:",
    en: isChild
      ? "Select key growth areas for targeted child education, intellect, creative activities, and vitality:"
      : "Select your current status for targeted predictions and exact remedies in your report:",
    hi: isChild
      ? "बच्चे की शिक्षा, बुद्धि, रचनात्मक गतिविधियों एवं स्वास्थ्य के लिए प्राथमिक क्षेत्र चुनें:"
      : "सटीक विवाह और संतान भविष्यवाणियों के लिए अपनी वर्तमान स्थिति चुनें:",
    te: isChild
      ? "పిల్లల విద్య, బుద్ధివికాసం, సృజనాత్మకత మరియు ఆరోగ్య సంరక్షణ కోసం ప్రాధాన్యతను ఎంచుకోండి:"
      : "ఖచ్చితమైన వివాహ మరియు సంతాన జాతక విశ్లేషణ కోసం మీ ప్రస్తుత స్థితిని ఎంచుకోండి:",
    ta: isChild
      ? "குழந்தையின் கல்வி, புத்தி கூர்மை, விளையாட்டு மற்றும் உடல் ஆரோக்கியத்திற்கான முக்கிய வழிகாட்டுதலைத் தேர்ந்தெடுக்கவும்:"
      : "துல்லியமான திருமணம் மற்றும் சந்ததி பலன்களுக்கு உங்கள் தற்போதைய நிலையைத் தேர்ந்தெடுக்கவும்:"
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

        {isChild ? (
          /* Child-Specific Growth & Activity Focus */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900">
                {lang === "kn" ? "ಬಾಲ ವಿಕಾಸ ಹಾಗೂ ವಿದ್ಯಾ ಆದ್ಯತೆ (Child Focus Area)" : "Child Focus Area"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "education", label: { kn: "🎓 ವಿದ್ಯಾಭ್ಯಾಸ & ಬುದ್ಧಿಶಕ್ತಿ", en: "🎓 Education & Intellect", hi: "🎓 शिक्षा एवं बुद्धि", te: "🎓 విద్యా & మేధస్సు", ta: "🎓 கல்வி & அறிவு" } },
                  { id: "activities", label: { kn: "🎨 ಸೃಜನಶೀಲತೆ & ಆಟ-ಚಟುವಟಿಕೆ", en: "🎨 Creativity & Sports", hi: "🎨 रचनात्मकता & खेल", te: "🎨 సృజనాత్మకత & ఆటలు", ta: "🎨 விளையாட்டு & கலை" } },
                  { id: "health", label: { kn: "🌿 ಆರೋಗ್ಯ & ರೋಗನಿರೋಧಕ ಶಕ್ತಿ", en: "🌿 Health & Immunity", hi: "🌿 स्वास्थ्य एवं ऊर्जा", te: "🌿 ఆరోగ్యం & శక్తి", ta: "🌿 உடல்நலம் & வளர்ச்சி" } },
                  { id: "general", label: { kn: "🌟 ಸರ್ವತೋಮುಖ ವಿಕಾಸ", en: "🌟 All-round Development", hi: "🌟 सर्वांगीण विकास", te: "🌟 సర్వతోముఖాభివృద్ధి", ta: "🌟 முழுமையான வளர்ச்சி" } }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setChildFocus(opt.id as any)}
                    className={`rounded-xl border p-2.5 text-xs font-semibold transition text-center ${
                      childFocus === opt.id
                        ? "border-amber-700 bg-amber-700 text-white shadow-sm"
                        : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100/60"
                    }`}
                  >
                    {pick(opt.label, lang)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Adult Marital & Progeny Questions */
          <>
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
          </>
        )}

        {/* Submit & Cancel */}
        <div className="pt-3 flex gap-3">
          <button
            type="button"
            onClick={() =>
              onConfirm(
                isChild
                  ? { maritalStatus: "general", childrenStatus: "general", childFocus }
                  : { maritalStatus, childrenStatus }
              )
            }
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
