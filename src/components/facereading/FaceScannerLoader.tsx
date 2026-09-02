import React, { useEffect, useState } from "react";

type Props = {
  lang?: string;
  isKn?: boolean;
};

const SCAN_STEPS_BY_LANG: Record<string, string[]> = {
  kn: [
    "೧. ಮುಖದ ರಚನೆ ಹಾಗೂ ಲಲಾಟ (ಹಣೆ) ಗುರು-ರವಿ ರೇಖೆಗಳ ಪರಿಶೀಲನೆ...",
    "೨. ನೇತ್ರ (ಕಣ್ಣುಗಳು) ಹಾಗೂ ಭ್ರೂಮಧ್ಯ ಆಜ್ಞಾ ಚಕ್ರ ತೇಜಸ್ಸು ಗಣನೆ...",
    "೩. ನಾಸಿಕ (ಮೂಗು) ಕುಬೇರ ಸ್ಥಾನ & ಧನ ಸೇತುವೆ ಸಾಮುದ್ರಿಕ ಅಳತೆ...",
    "೪. ಓಷ್ಠ (ತುಟಿಗಳು), ವಾಕ್ ಸಿದ್ಧಿ ಹಾಗೂ ಚಿಬುಕ (ಗಡ್ಡ) ಸ್ಥಿರಾಸ್ತಿ ಯೋಗ...",
    "೫. ೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಫಲ ಸಿದ್ಧಿ!"
  ],
  en: [
    "1. Scanning Forehead (Lalata) & Jupiter-Sun Leadership lines...",
    "2. Analyzing Eyes (Netra), Sclera luster & Ajna Chakra radiance...",
    "3. Measuring Nose Bridge (Dhana Rekha) & Kuber Sthana wealth vault...",
    "4. Inspecting Lips (Vak Siddhi), Chin (Land assets) & Jaw fortitude...",
    "5. Mapping 100-Year Face Chronology & Sacred Gokarna Blessings!"
  ],
  hi: [
    "1. ललाट (माथा) एवं गुरु-सूर्य नेतृत्व रेखाओं का सूक्ष्म विश्लेषण...",
    "2. नयन (आँखें) एवं आज्ञा चक्र की सात्विक कांति का परीक्षण...",
    "3. नासिका (नाक) एवं कुबेर स्थान धन योग का सामुद्रिक मापन...",
    "4. ओष्ठ (होंठ), वाक् सिद्धि एवं चिबुक (ठोड़ी) अचल संपत्ति योग...",
    "5. 100-वर्षीय मुख कालचक्र एवं श्री गोकर्ण महाबलेश्वर दिव्य कृपा!"
  ],
  te: [
    "1. లలాటం (నుదురు) & గురు-సూర్య నాయకత్వ రేఖల పరిశీలన...",
    "2. నేత్రాలు & ఆజ్ఞా చక్ర సాత్విక తేజస్సు విశ్లేషణ...",
    "3. నాసిక (ముక్కు) కుబేర స్థానం & ధన సంపద యోగ మాపనం...",
    "4. పెదవులు, వాక్ సిద్ధి & చిబుకం (గడ్డం) స్థిరాస్తి భాగ్యం...",
    "5. 100-సంవత్సరాల ముఖ కాలచక్రం & గోకర్ణ మహాబలేశ్వర దివ్య ఆశీస్సులు!"
  ],
  ta: [
    "1. நெற்றி (லலாடம்) & குரு-சூரிய தலைமை ரேகைகள் ஸ்கேன் செய்யப்படுகின்றன...",
    "2. கண்கள் (நேத்ரம்) & ஆக்ஞா சக்கர தேஜஸ் பரிசோதனை...",
    "3. நாசிகா (மூக்கு) குபேர தன யோகம் மற்றும் ஐஸ்வர்ய ஆய்வு...",
    "4. உதடுகள், வாக் சித்தி & தாடை சொத்து யோகக் கணிப்பு...",
    "5. 100-ஆண்டு முக காலச்சக்கரம் & கோகர்ண மகாபலேஸ்வரர் அருள் ஆசீர்வாதம்!"
  ]
};

const SCANNER_TITLES: Record<string, string> = {
  kn: "ಪ್ರಾಚೀನ ಮುಖ ಲಕ್ಷಣ ಸ್ಕ್ಯಾನರ್",
  en: "Vedic Physiognomy Scanner",
  hi: "वैदिक मुख सामुद्रिक स्कैनर",
  te: "వైదిక ముఖ సాముద్రిక స్కానర్",
  ta: "வேத முக சாமுத்ரிகா ஸ்கேனர்"
};

const SUBTITLES: Record<string, string> = {
  kn: "॥ ಮುಖ ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಶಾಸ್ತ್ರ ॥",
  en: "॥ MUKHA SAMUDRIKA LAKSHMI SHASTRA ॥",
  hi: "॥ मुख सामुद्रिक लक्ष्मी शास्त्र ॥",
  te: "॥ ముఖ సాముద్రిక లక్ష్మీ శాస్త్రం ॥",
  ta: "॥ முக சாமுத்ரிகா லட்சுமி சாஸ்திரம் ॥"
};

const SHLOKAS: Record<string, string> = {
  kn: "॥ ಮುಖಂ ವದತಿ ಧರ್ಮಜ್ಞಂ ಲಕ್ಷಣಂ ಜಯದಾಯಕಮ್ ॥",
  en: "॥ Mukham Vadati Dharmajnam Lakshanam Jayadayakam ॥",
  hi: "॥ मुखं वदति धर्मज्ञं लक्षणं जयदायकम् ॥",
  te: "॥ ముఖం వదति धर्मज्ञं लक्षणं जयदायकम् ॥",
  ta: "॥ முகம் வததி தர்மஜ்ஞம் லட்சணம் ஜயதாயகம் ॥"
};

export const FaceScannerLoader: React.FC<Props> = ({ lang, isKn }) => {
  const currentLang = lang || (isKn ? "kn" : "en");
  const steps = SCAN_STEPS_BY_LANG[currentLang] || SCAN_STEPS_BY_LANG.en;
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-b from-amber-950/90 via-amber-900/90 to-amber-950 border-2 border-amber-400 shadow-2xl max-w-md w-full text-center space-y-6">
        
        {/* Animated Sacred Face Scan Circle */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Rotating Outer Sacred Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/70 animate-spin" style={{ animationDuration: "12s" }} />
          
          {/* Golden Pulse Glow */}
          <div className="absolute inset-3 rounded-full bg-amber-500/20 blur-md animate-pulse" />

          {/* Central Face Silhouette with Scanning Laser */}
          <div className="relative w-32 h-32 rounded-full border-2 border-amber-300 bg-amber-900/60 overflow-hidden flex items-center justify-center shadow-inner">
            <span className="text-6xl select-none filter drop-shadow">👤</span>

            {/* Vertical Gold Laser Beam */}
            <div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_12px_#F59E0B] animate-pulse"
              style={{
                top: "10%",
                animation: "scanFace 2.2s ease-in-out infinite alternate"
              }}
            />

            {/* Ajna Third Eye Node */}
            <div className="absolute top-8 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_#FBBF24] animate-ping" />
          </div>
        </div>

        {/* Title & Mantras */}
        <div className="space-y-2">
          <div className="text-[11px] font-extrabold tracking-widest text-amber-300 uppercase">
            {SUBTITLES[currentLang] || SUBTITLES.kn}
          </div>
          <h3 className="font-serif text-lg font-bold text-amber-100">
            {SCANNER_TITLES[currentLang] || SCANNER_TITLES.en}
          </h3>
        </div>

        {/* Dynamic Step Status */}
        <div className="min-h-[48px] flex items-center justify-center px-3 py-2 rounded-xl bg-amber-900/80 border border-amber-500/40 text-xs font-bold text-amber-200 shadow-inner">
          <span className="animate-fade-in">{steps[stepIdx]}</span>
        </div>

        {/* Sacred Shloka */}
        <div className="text-[11px] font-serif italic text-amber-300/80">
          {SHLOKAS[currentLang] || SHLOKAS.en}
        </div>
      </div>

      <style>{`
        @keyframes scanFace {
          0% { top: 12%; opacity: 0.8; }
          50% { top: 50%; opacity: 1; }
          100% { top: 88%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
