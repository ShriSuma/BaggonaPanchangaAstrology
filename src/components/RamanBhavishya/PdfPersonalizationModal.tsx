import React, { useState, useEffect, useMemo } from "react";
import { pick } from "../../features/seva/sevaLocale";
import { buildPersonalizedMarriageText, buildPersonalizedChildrenText } from "./BhavishyaView";

export type PersonalizationState = {
  maritalStatus: "unmarried" | "married" | "general";
  childrenStatus: "has_children" | "no_children" | "general";
  childFocus?: "education" | "activities" | "health" | "general";
};

type Props = {
  isOpen: boolean;
  lang: string;
  ageYears?: number;
  initialMaritalStatus?: "unmarried" | "married" | "general";
  initialChildrenStatus?: "has_children" | "no_children" | "general";
  onClose: () => void;
  onConfirm: (personalization: PersonalizationState) => void;
};

export default function PdfPersonalizationModal({
  isOpen,
  lang,
  ageYears,
  initialMaritalStatus = "general",
  initialChildrenStatus = "general",
  onClose,
  onConfirm
}: Props): JSX.Element | null {
  const isChild = ageYears !== undefined && ageYears < 8;

  const [maritalStatus, setMaritalStatus] = useState<"unmarried" | "married" | "general">(initialMaritalStatus);
  const [childrenStatus, setChildrenStatus] = useState<"has_children" | "no_children" | "general">(initialChildrenStatus);
  const [childFocus, setChildFocus] = useState<"education" | "activities" | "health" | "general">("education");
  const [activePreviewTab, setActivePreviewTab] = useState<"marriage" | "children">("marriage");

  useEffect(() => {
    if (isOpen) {
      setMaritalStatus(initialMaritalStatus);
      setChildrenStatus(initialChildrenStatus);
    }
  }, [isOpen, initialMaritalStatus, initialChildrenStatus]);

  const liveMarriageText = useMemo(() => {
    if (isChild) return "";
    return buildPersonalizedMarriageText(lang, "", "", maritalStatus);
  }, [lang, maritalStatus, isChild]);

  const liveChildrenText = useMemo(() => {
    if (isChild) return "";
    return buildPersonalizedChildrenText(lang, childrenStatus);
  }, [lang, childrenStatus, isChild]);

  if (!isOpen) return null;

  const titleMap = {
    kn: isChild ? "ಬಾಲ ಜಾತಕ ಪ್ರೀಮಿಯಂ ಪಿಡಿಎಫ್ ಗ್ರಾಹಕೀಕರಣ" : "ಪ್ರೀಮಿಯಂ ಪಿಡಿಎಫ್ V1 ಗ್ರಾಹಕೀಕರಣ",
    en: isChild ? "Child Horoscope Premium PDF Personalization" : "Premium PDF V1 Personalization",
    hi: isChild ? "बाल कुंडली प्रीमियम पीडीएफ कस्टमाइज़ेशन" : "प्रीमियम पीडीएफ V1 कस्टमाइज़ेशन",
    te: isChild ? "బాల జాతకం ప్రీమియం పిడిఎఫ్ వ్యక్తిగతీకరణ" : "ప్రీమియం పిడిఎఫ్ V1 వ్యక్తిగతీకరణ",
    ta: isChild ? "குழந்தை ஜாதகம் பிரீமியம் PDF தனிப்பயனாக்கம்" : "பிரீமியம் PDF V1 தனிப்பயனாக்கம்"
  };

  const subtitleMap = {
    kn: isChild
      ? "ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ, ಬುದ್ಧಿಶಕ್ತಿ, ಆಟ-ಚಟುವಟಿಕೆಗಳು ಹಾಗೂ ದೈಹಿಕ ಆರೋಗ್ಯದ ನಿಖರ ಭವಿಷ್ಯಕ್ಕೆ ಆದ್ಯತೆ ಆಯ್ಕೆ ಮಾಡಿ:"
      : "ನಿಮ್ಮ ವೈವಾಹಿಕ ಮತ್ತು ಸಂತಾನ ಸ್ಥಿತಿ ಆಯ್ಕೆ ಮಾಡಿ. ಕ್ಲಿಕ್ ಮಾಡಿದ ತಕ್ಷಣ ಕೆಳಗೆ ಲೈವ್ ನಿರೂಪಣೆ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ:",
    en: isChild
      ? "Select key growth areas for targeted child education, intellect, creative activities, and vitality:"
      : "Select your marital and children status. Narration dynamically updates live on click:",
    hi: isChild
      ? "बच्चे की शिक्षा, बुद्धि, रचनात्मक गतिविधियों एवं स्वास्थ्य के लिए प्राथमिक क्षेत्र चुनें:"
      : "अपनी वैवाहिक एवं संतान स्थिति चुनें। क्लिक करते ही लाइव व्याख्या तुरंत अपडेट होगी:",
    te: isChild
      ? "పిల్లల విద్య, బుద్ధివికాసం, సృజనాత్మకత మరియు ఆరోగ్య సంరక్షణ కోసం ప్రాధాన్యతను ఎంచుకోండి:"
      : "మీ వైవాహిక మరియు సంతాన స్థితిని ఎంచుకోండి. క్లిక్ చేయగానే వివరణ ప్రత్యక్షంగా నవీకరించబడుతుంది:",
    ta: isChild
      ? "குழந்தையின் கல்வி, புத்தி கூர்மை, விளையாட்டு மற்றும் உடல் ஆரோக்கியத்திற்கான முக்கிய வழிகாட்டுதலைத் தேர்ந்தெடுக்கவும்:"
      : "உங்கள் திருமண மற்றும் சந்ததி நிலையைத் தேர்ந்தெடுக்கவும். கிளிக் செய்தவுடன் நேரலை பலன்கள் மாறும்:"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 via-stone-50 to-amber-100/90 p-5 md:p-7 shadow-2xl space-y-5 text-slate-900">
        <div className="flex items-center justify-between border-b border-amber-300 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 border border-amber-400 text-[10px] font-black tracking-widest text-amber-900 uppercase">
              ✨ Baggona Panchanga V1 Engine
            </div>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-amber-950 mt-1">
              {titleMap[lang as keyof typeof titleMap] || titleMap.en}
            </h3>
            <p className="mt-1 text-xs text-amber-900/80 font-medium">
              {subtitleMap[lang as keyof typeof subtitleMap] || subtitleMap.en}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-amber-800 hover:bg-amber-200 transition font-bold text-lg"
            title="Close"
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
                  { id: "general", label: { kn: "🌟 ಸಾಮಾನ್ಯ / ಸರ್ವತೋಮುಖ", en: "🌟 Samanya / All-round", hi: "🌟 सामान्य / सर्वांगीण", te: "🌟 సామాన్య / సమగ్రం", ta: "🌟 பொதுவானது / முழுமை" } }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setChildFocus(opt.id as any)}
                    className={`rounded-xl border p-3 text-xs font-bold transition text-center cursor-pointer ${
                      childFocus === opt.id
                        ? "border-amber-700 bg-amber-800 text-amber-50 shadow-md ring-2 ring-amber-400"
                        : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
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
            <div className="space-y-2 bg-white/70 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950">
                  {lang === "kn" ? "೧. ವೈವಾಹಿಕ ಸ್ಥಿತಿ (Marital Status)" : "1. Marital Status"}
                </label>
                <span className="text-[11px] font-semibold text-amber-700">
                  {maritalStatus === "married" ? "ವಿವಾಹಿತರು (Married)" : maritalStatus === "unmarried" ? "ಅವಿವಾಹಿತರು (Unmarried)" : "ಸಾಮಾನ್ಯ (Samanya)"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "married", label: { kn: "💍 ವಿವಾಹಿತರು", en: "💍 Married", hi: "💍 विवाहित", te: "💍 వివాహితులు", ta: "💍 திருமணமானவர்" } },
                  { id: "unmarried", label: { kn: "🌸 ಅವಿವಾಹಿತರು", en: "🌸 Unmarried", hi: "🌸 अविवाहित", te: "🌸 అవివాహితులు", ta: "🌸 திருமணமாகாதவர்" } },
                  { id: "general", label: { kn: "❓ ಸಾಮಾನ್ಯ", en: "❓ Samanya (General)", hi: "❓ सामान्य", te: "❓ సాధారణం", ta: "❓ பொதுவானது" } }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setMaritalStatus(opt.id as any);
                      setActivePreviewTab("marriage");
                    }}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition text-center cursor-pointer ${
                      maritalStatus === opt.id
                        ? "border-amber-700 bg-amber-800 text-amber-50 shadow-md ring-2 ring-amber-400 scale-[1.02]"
                        : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    {pick(opt.label, lang)}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Children Status */}
            <div className="space-y-2 bg-white/70 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950">
                  {lang === "kn" ? "೨. ಸಂತಾನ ವಿವರ (Children Status)" : "2. Children Status"}
                </label>
                <span className="text-[11px] font-semibold text-amber-700">
                  {childrenStatus === "has_children" ? "ಸಂತಾನವಿದೆ (Has Children)" : childrenStatus === "no_children" ? "ಸಂತಾನವಿಲ್ಲ (No Children)" : "ಸಾಮಾನ್ಯ (Samanya)"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "has_children", label: { kn: "👶 ಸಂತಾನವಿದೆ", en: "👶 Has Children", hi: "👶 संतान है", te: "👶 పిల్లలు ఉన్నారు", ta: "👶 குழந்தைகள் உள்ளனர்" } },
                  { id: "no_children", label: { kn: "🙏 ಸಂತಾನವಿಲ್ಲ", en: "🙏 Not Has Children", hi: "🙏 संतान नहीं", te: "🙏 సంతానం లేదు", ta: "🙏 குழந்தைகள் இல்லை" } },
                  { id: "general", label: { kn: "❓ ಸಾಮಾನ್ಯ", en: "❓ Samanya (General)", hi: "❓ सामान्य", te: "❓ సాధారణం", ta: "❓ பொதுவானது" } }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setChildrenStatus(opt.id as any);
                      setActivePreviewTab("children");
                    }}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition text-center cursor-pointer ${
                      childrenStatus === opt.id
                        ? "border-amber-700 bg-amber-800 text-amber-50 shadow-md ring-2 ring-amber-400 scale-[1.02]"
                        : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    {pick(opt.label, lang)}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Narration Dynamic Preview Box */}
            <div className="bg-amber-950/90 text-amber-100 p-4 md:p-5 rounded-2xl border-2 border-amber-500/70 shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="animate-pulse text-sm">⚡</span>
                  <span className="text-xs font-black tracking-wide text-amber-300 uppercase">
                    {lang === "kn" ? "ಲೈವ್ ನಿರೂಪಣಾ ಮುನ್ನೋಟ (Live Narration Preview)" : "Live Narration Dynamic Preview"}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("marriage")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      activePreviewTab === "marriage"
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "bg-amber-900/60 text-amber-200 hover:bg-amber-900"
                    }`}
                  >
                    {lang === "kn" ? "💍 ವಿವಾಹ ಅಧ್ಯಾಯ" : "💍 Marriage"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("children")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      activePreviewTab === "children"
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "bg-amber-900/60 text-amber-200 hover:bg-amber-900"
                    }`}
                  >
                    {lang === "kn" ? "👶 ಸಂತಾನ ಅಧ್ಯಾಯ" : "👶 Children"}
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-2.5 max-h-48 overflow-y-auto pr-2 leading-relaxed font-sans scrollbar-thin scrollbar-thumb-amber-600">
                {(activePreviewTab === "marriage" ? liveMarriageText : liveChildrenText)
                  .split("\n\n")
                  .map((para, idx) => (
                    <p key={idx} className="bg-black/30 p-2.5 rounded-xl border border-amber-500/20 text-amber-100/90">
                      <strong className="text-amber-400 font-bold block mb-1">
                        {lang === "kn" ? `ಪರಿಚ್ಛೇದ ${idx + 1}:` : `Paragraph ${idx + 1}:`}
                      </strong>
                      {para}
                    </p>
                  ))}
              </div>
              <p className="text-[10px] text-amber-400/70 italic text-right">
                ✓ {lang === "kn" ? "ಖಚಿತ ೩ ಪರಿಚ್ಛೇದಗಳು (ಪ್ರತಿಯೊಂದೂ ೫-೬ ಸಾಲುಗಳು)" : "Strict 3 paragraphs (5-6 lines each)"}
              </p>
            </div>
          </>
        )}

        {/* Submit & Cancel */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={() =>
              onConfirm(
                isChild
                  ? { maritalStatus: "general", childrenStatus: "general", childFocus }
                  : { maritalStatus, childrenStatus }
              )
            }
            className="flex-1 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 py-3.5 text-sm font-black text-white shadow-lg hover:from-amber-700 hover:to-orange-800 transition cursor-pointer border border-amber-300"
          >
            ✨ {lang === "kn" ? "ಈ ಆಯ್ಕೆಗಳೊಂದಿಗೆ V1 ಪ್ರೀಮಿಯಂ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ" : "Download V1 Premium PDF with Selections"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-amber-300 bg-white px-5 py-3.5 text-sm font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
          >
            {lang === "kn" ? "ರದ್ದುಗೊಳಿಸಿ" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
