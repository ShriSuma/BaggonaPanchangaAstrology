import React, { forwardRef } from 'react';
import type { KundliViewerSession } from '../../stores/kundliViewerStore';
import type { PdfTranslations } from './PdfTemplate';

export type MultiQuestionItem = {
  id: string;
  topicId: string;
  topicLabel: string;
  smartHeader?: string;
  isCustomQuestion?: boolean;
  questionText: string;
  answer?: {
    paragraph1: string; // House & Kundali Analysis
    paragraph2: string; // Dasha & Gochara Transits
    paragraph3: string; // Prediction & Specific Timing
    paragraph4: string; // Parihara & Remedies
  };
};

interface Props {
  session: KundliViewerSession | null;
  translations: PdfTranslations;
  questionsData: MultiQuestionItem[];
  lang?: string;
}

const MQ_HEADINGS: Record<string, { p1: string; p2: string; p3: string; p4: string; title: string; subtitle: string; loading: string; footer: string }> = {
  kn: {
    title: "ಭಾಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ",
    subtitle: "ವಿಶೇಷ ಬಹುಪ್ರಶ್ನೆ ಜಾತಕ ಫಲ ಹಾಗೂ ಶಮನ ಪರಿಹಾರ ವರದಿ",
    p1: "೧. ಭಾವ ಹಾಗೂ ಜನ್ಮ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ವಿಶ್ಲೇಷಣೆ",
    p2: "೨. ದಶಾಕಾಲ ಹಾಗೂ ಗ್ರಹ ಗೋಚಾರ ಫಲ",
    p3: "೩. ನಿಖರ ಭವಿಷ್ಯಫಲ ಹಾಗೂ ಸಮಯ ಸಿದ್ಧಿ",
    p4: "೪. ವೈದಿಕ ಶಮನ ಪರಿಹಾರ ಹಾಗೂ ಪ್ರಾರ್ಥನೆ",
    loading: "ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ...",
    footer: "ಭಾಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ"
  },
  te: {
    title: "బగ్గోణ పంచాంగ జ్యోతిష్యం",
    subtitle: "విశేష బహుప్రశ్న జాతక ఫలం మరియు శమన పరిహార నివేదిక",
    p1: "1. భావ మరియు జన్మ గ్రహాల స్థితి విశ్లేషణ",
    p2: "2. దశాకాలం మరియు గ్రహ గోచార ఫలం",
    p3: "3. ఖచ్చిత భవిష్యత్తు మరియు సమయ సిద్ధత",
    p4: "4. వైదిక శమన పరిహారం మరియు ప్రార్థన",
    loading: "విశ్లేషణ సిద్ధమవుతోంది...",
    footer: "బగ్గోణ పంచాంగ జ్యోతిష్యం"
  },
  ta: {
    title: "பக்கோண பஞ்சாங்க ஜோதிடம்",
    subtitle: "விசேஷ பலகேள்வி ஜாதக பலன் மற்றும் பரிகார அறிக்கை",
    p1: "1. பாவம் மற்றும் பிறப்பு கிரகங்களின் நிலை பகுப்பாய்வு",
    p2: "2. தசா காலம் மற்றும் கிரக கோச்சார பலன்",
    p3: "3. துல்லியமான எதிர்கால பலன் மற்றும் கால நேரம்",
    p4: "4. வைதிக சாந்தி பரிகாரம் மற்றும் பிரார்த்தனை",
    loading: "பகுப்பாய்வு தயாராகிறது...",
    footer: "பக்கோண பஞ்சாங்க ஜோதிடம்"
  },
  hi: {
    title: "बग्गोण पंचांग ज्योतिष",
    subtitle: "विशेष बहुप्रश्न कुंडली फल एवं शमन समाधान रिपोर्ट",
    p1: "1. भाव एवं जन्म ग्रहों की स्थिति विश्लेषण",
    p2: "2. दशा काल एवं ग्रह गोचर फल",
    p3: "3. सटीक भविष्यफल एवं समय सिद्धि",
    p4: "4. वैदिक समाधान, उपाय एवं प्रार्थना",
    loading: "विश्लेषण तैयार हो रहा है...",
    footer: "बग्गोण पंचांग ज्योतिष"
  },
  en: {
    title: "Baggona Panchanga Astrology",
    subtitle: "Special Multi-Question Astrological Predictions & Remedies Report",
    p1: "1. Natal House & Planetary Positions Analysis",
    p2: "2. Running Dasha & Live Planetary Transits",
    p3: "3. Accurate Future Predictions & Timing Window",
    p4: "4. Recommended Vedic Remedies & Parihara",
    loading: "Generating accurate analysis...",
    footer: "Baggona Panchanga Astrology"
  }
};

export const MultiQuestionPdfTemplate = forwardRef<HTMLDivElement, Props>(({ session, translations, questionsData, lang = "kn" }, ref) => {
  if (!session) return null;

  const baseLang = (lang || "kn").split("-")[0];
  const h = MQ_HEADINGS[baseLang] || MQ_HEADINGS.kn;

  const solidBgClass = "bg-amber-50"; 
  const textColorClass = "text-amber-950"; 
  const borderColorClass = "border-amber-700/40"; 
  const shloka = "असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय॥";

  return (
    <div 
      ref={ref}
      style={{ width: '900px', height: 'max-content' }}
      className={`${solidBgClass} ${textColorClass} font-serif relative overflow-hidden`}
    >
      {/* Background Decorative Gold Radial Patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Royal Gold Outer Frame */}
      <div className={`m-6 p-8 border-4 border-double ${borderColorClass} rounded-2xl relative bg-amber-50/90 shadow-2xl`}>
        
        {/* Corner Emblems */}
        <div className="absolute top-2 left-2 text-amber-700/60 text-xl pointer-events-none">❖</div>
        <div className="absolute top-2 right-2 text-amber-700/60 text-xl pointer-events-none">❖</div>
        <div className="absolute bottom-2 left-2 text-amber-700/60 text-xl pointer-events-none">❖</div>
        <div className="absolute bottom-2 right-2 text-amber-700/60 text-xl pointer-events-none">❖</div>

        {/* Header Banner */}
        <div className="text-center pb-6 border-b-2 border-amber-600/30 mb-8 relative">
          <div className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-amber-800/80 mb-1">
            {shloka}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 tracking-normal font-sans mb-3 leading-normal drop-shadow-sm">
            {translations.title || h.title}
          </h1>
          <p className="text-base sm:text-lg font-bold text-amber-800 font-sans tracking-normal leading-normal mt-1">
            🔮 {translations.subtitle || h.subtitle}
          </p>
        </div>

        {/* User Kundali Details Card */}
        <div className="bg-amber-100/60 border-2 border-amber-600/40 rounded-xl p-6 mb-8 shadow-sm">
          {translations.introGreeting && (
            <h2 className="text-2xl font-bold text-amber-900 mb-3 font-sans tracking-normal">
              {translations.introGreeting}
            </h2>
          )}

          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm md:text-base font-sans">
            <div>
              <span className="font-bold text-amber-900">{translations.nameLabel}: </span>
              <span className="text-amber-950 font-semibold">{translations.nameValue}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{translations.dobLabel}: </span>
              <span className="text-amber-950">{translations.dobValue}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{translations.lagnaLabel}: </span>
              <span className="text-amber-950">{translations.lagnaValue}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{translations.moonLabel}: </span>
              <span className="text-amber-950">{translations.moonValue}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{translations.nakshatraLabel}: </span>
              <span className="text-amber-950">{translations.nakshatraValue}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{translations.dashaLabel} / {translations.bhuktiLabel}: </span>
              <span className="text-amber-950 font-bold">
                {translations.dashaPlanetValue} - {translations.bhuktiPlanetValue}
              </span>
            </div>
          </div>
        </div>

        {/* Questions & Detailed 3-Paragraph Answers + Remedy */}
        <div className="space-y-8">
          {questionsData.map((q, qIdx) => (
            <div 
              key={q.id || qIdx}
              className="bg-white/90 border-2 border-amber-400/80 rounded-2xl p-6 shadow-md relative overflow-hidden"
            >
              {/* Question Title Header Badge */}
              <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 text-white rounded-xl p-4 mb-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-extrabold text-base border border-white/30">
                    Q{qIdx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200 block font-sans">
                      {q.smartHeader || q.topicLabel}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-white font-sans tracking-normal leading-snug">
                      "{q.questionText}"
                    </h3>
                  </div>
                </div>
              </div>

              {q.answer ? (
                <div className="space-y-4">
                  {/* Paragraph 1: Kundali & House Analysis */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-amber-900 font-sans tracking-normal mb-1 flex items-center gap-2">
                      <span>1️⃣</span>
                      <span>{h.p1}</span>
                    </h4>
                    <p className="text-amber-950 text-base leading-relaxed font-sans whitespace-pre-wrap">
                      {q.answer.paragraph1}
                    </p>
                  </div>

                  {/* Paragraph 2: Dasha & Gochara Transits */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-amber-900 font-sans tracking-normal mb-1 flex items-center gap-2">
                      <span>2️⃣</span>
                      <span>{h.p2}</span>
                    </h4>
                    <p className="text-amber-950 text-base leading-relaxed font-sans whitespace-pre-wrap">
                      {q.answer.paragraph2}
                    </p>
                  </div>

                  {/* Paragraph 3: Future Predictions & Advice */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-amber-900 font-sans tracking-normal mb-1 flex items-center gap-2">
                      <span>3️⃣</span>
                      <span>{h.p3}</span>
                    </h4>
                    <p className="text-amber-950 text-base leading-relaxed font-sans whitespace-pre-wrap">
                      {q.answer.paragraph3}
                    </p>
                  </div>

                  {/* Paragraph 4: Parihara / Remedy Box */}
                  <div className="bg-gradient-to-r from-amber-100/90 via-orange-100/90 to-amber-100/90 border-2 border-amber-500/60 rounded-xl p-5 shadow-sm">
                    <h4 className="text-base font-bold text-amber-950 font-sans tracking-normal mb-2 flex items-center gap-2">
                      <span>📿</span>
                      <span>{h.p4}</span>
                    </h4>
                    <p className="text-amber-950 text-base leading-relaxed font-sans font-medium whitespace-pre-wrap">
                      {q.answer.paragraph4}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-amber-800 font-sans italic">
                  {h.loading}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ashirvada Blessing Card */}
        {translations.ashirvadaValue && (
          <div className="mt-8 bg-amber-100/70 border-2 border-amber-500/40 rounded-xl p-5 text-center">
            <h4 className="text-sm font-bold text-amber-900 uppercase tracking-normal mb-2 font-sans">
              ✦ {translations.ashirvadaTitle || "ಆಶೀರ್ವಚನ"} ✦
            </h4>
            <p className="text-amber-950 italic text-base leading-relaxed tracking-normal font-serif">
              "{translations.ashirvadaValue}"
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-amber-600/30 text-center text-xs text-amber-800/80 font-sans tracking-normal">
          <p>{translations.footer || h.footer}</p>
        </div>
      </div>
    </div>
  );
});

MultiQuestionPdfTemplate.displayName = "MultiQuestionPdfTemplate";
