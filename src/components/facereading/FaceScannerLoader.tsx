import React, { useEffect, useState } from "react";

type Props = {
  isKn: boolean;
};

const SCAN_STEPS_KN = [
  "೧. ಮುಖದ ರಚನೆ ಹಾಗೂ ಲಲಾಟ (ಹಣೆ) ಗುರು-ರವಿ ರೇಖೆಗಳ ಪರಿಶೀಲನೆ...",
  "೨. ನೇತ್ರ (ಕಣ್ಣುಗಳು) ಹಾಗೂ ಭ್ರೂಮಧ್ಯ ಆಜ್ಞಾ ಚಕ್ರ ತೇಜಸ್ಸು ಗಣನೆ...",
  "೩. ನಾಸಿಕ (ಮೂಗು) ಕುಬೇರ ಸ್ಥಾನ & ಧನ ಸೇತುವೆ ಸಾಮುದ್ರಿಕ ಅಳತೆ...",
  "೪. ಓಷ್ಠ (ತುಟಿಗಳು), ವಾಕ್ ಸಿದ್ಧಿ ಹಾಗೂ ಚಿಬುಕ (ಗಡ್ಡ) ಸ್ಥಿರಾಸ್ತಿ ಯೋಗ...",
  "೫. ೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಫಲ ಸಿದ್ಧಿ!"
];

const SCAN_STEPS_EN = [
  "1. Scanning Forehead (Lalata) & Jupiter-Sun Leadership lines...",
  "2. Analyzing Eyes (Netra), Sclera luster & Ajna Chakra radiance...",
  "3. Measuring Nose Bridge (Dhana Rekha) & Kuber Sthana wealth vault...",
  "4. Inspecting Lips (Vak Siddhi), Chin (Land assets) & Jaw fortitude...",
  "5. Mapping 100-Year Face Chronology & Sacred Gokarna Blessings!"
];

export const FaceScannerLoader: React.FC<Props> = ({ isKn }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const steps = isKn ? SCAN_STEPS_KN : SCAN_STEPS_EN;

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
            ॥ ಮುಖ ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಶಾಸ್ತ್ರ ॥
          </div>
          <h3 className="font-serif text-lg font-bold text-amber-100">
            {isKn ? "ಪ್ರಾಚೀನ ಮುಖ ಲಕ್ಷಣ ಸ್ಕ್ಯಾನರ್" : "Vedic Physiognomy Scanner"}
          </h3>
        </div>

        {/* Dynamic Step Status */}
        <div className="min-h-[48px] flex items-center justify-center px-3 py-2 rounded-xl bg-amber-900/80 border border-amber-500/40 text-xs font-bold text-amber-200 shadow-inner">
          <span className="animate-fade-in">{steps[stepIdx]}</span>
        </div>

        {/* Sacred Shloka */}
        <div className="text-[11px] font-serif italic text-amber-300/80">
          {isKn ? "॥ ಮುಖಂ ವದತಿ ಧರ್ಮಜ್ಞಂ ಲಕ್ಷಣಂ ಜಯದಾಯಕಮ್ ॥" : "॥ Mukham Vadati Dharmajnam Lakshanam Jayadayakam ॥"}
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
