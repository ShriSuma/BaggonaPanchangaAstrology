import React from "react";
import Card from "../ui/Card";
import type { FacialAgeMilestone } from "../../features/facereading/faceReadingEngine";

type Props = {
  milestones?: FacialAgeMilestone[];
  lang: string;
  estimatedAge?: number;
};

const DEFAULT_MILESTONES: FacialAgeMilestone[] = [
  {
    agePhase: "೧. ಯೌವನ & ವಿದ್ಯಾಭ್ಯಾಸ (Youth & Foundation)",
    ageWindow: "೧೫ ರಿಂದ ೩೦ ವರ್ಷ",
    facialArea: { kn: "ಲಲಾಟ & ಹಣೆಯ ರೇಖೆಗಳು (Forehead)", en: "Forehead & Brow Lines" },
    prediction: { kn: "ಶಿಕ್ಷಣದಲ್ಲಿ ಉತ್ತಮ ಸಾಧನೆ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಯಶಸ್ಸು ಹಾಗೂ ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ವೃತ್ತಿ ಪ್ರವೇಶ.", en: "Academic achievements, rapid skill acquisition and solid career entry." }
  },
  {
    agePhase: "೨. ವೃತ್ತಿ ಉನ್ನತಿ & ವಿವಾಹ (Career & Marriage)",
    ageWindow: "೩೧ ರಿಂದ ೪೦ ವರ್ಷ",
    facialArea: { kn: "ನೇತ್ರ & ಭ್ರೂಮಧ್ಯ (Eyes & Brow Ridge)", en: "Eyes & Ajna Center" },
    prediction: { kn: "ವಿವಾಹ ಯೋಗ, ಸಾಮಾಜಿಕ ಮನ್ನಣೆ, ವಿದೇಶ/ದೂರ ಪ್ರಯಾಣ ಹಾಗೂ ವೃತ್ತಿಪರ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ.", en: "Marital harmony, executive elevation, travel and influential networking." }
  },
  {
    agePhase: "೩. ಧನ ಸಮೃದ್ಧಿ & ಭಾಗ್ಯೋದಯ (Peak Wealth & Assets)",
    ageWindow: "೪೧ ರಿಂದ ೫೦ ವರ್ಷ",
    facialArea: { kn: "ನಾಸಿಕ & ಗಂಡಸ್ಥಳ (Nose & Cheeks)", en: "Nose Bridge & Cheeks" },
    prediction: { kn: "ಕುಬೇರ ಯೋಗದ ಮೂಲಕ ಸ್ವಂತ ಮನೆ, ಭೂಮಿ ಖರೀದಿ, ಹೂಡಿಕೆಗಳಲ್ಲಿ ಲಾಭ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ.", en: "Peak wealth creation, property acquisition and business expansion." }
  },
  {
    agePhase: "೪. ಕೀರ್ತಿ & ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿ (Legacy & Peace)",
    ageWindow: "೫೧ ರಿಂದ ೭೫+ ವರ್ಷ",
    facialArea: { kn: "ಚಿಬುಕ & ಓಷ್ಠ (Chin & Lower Face)", en: "Chin & Mouth Contour" },
    prediction: { kn: "ಮಕ್ಕಳಿಂದ ಅಪಾರ ನೆಮ್ಮದಿ, ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ, ಗೌರವಾನ್ವಿತ ಸ್ಥಾನ ಹಾಗೂ ಆರೋಗ್ಯಪೂರ್ಣ ದೀರ್ಘಾಯುಷ್ಯ.", en: "Family joy from children, spiritual fulfillment and peaceful longevity." }
  }
];

export const FaceChronologyTab: React.FC<Props> = ({
  milestones = DEFAULT_MILESTONES,
  lang,
  estimatedAge = 29
}) => {
  const isKn = lang === "kn";
  const list = milestones && milestones.length > 0 ? milestones : DEFAULT_MILESTONES;

  return (
    <div className="space-y-6">
      {/* Age Estimation Banner */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
            {isKn ? "ಮುಖ ಲಕ್ಷಣ ಕಾಲಗಣನೆ" : "Vedic Physiognomy Chronology"}
          </div>
          <h3 className="font-serif text-base font-bold text-amber-950 mt-0.5">
            ⏳ {isKn ? `ಮುಖದ ರೇಖಾ ವಯಸ್ಸು: ಸುಮಾರು ${estimatedAge} ವರ್ಷಗಳು` : `Estimated Face Age: ~${estimatedAge} Years`}
          </h3>
        </div>

        <div className="rounded-full bg-amber-800 text-amber-50 px-4 py-1 text-xs font-extrabold shadow-sm">
          {isKn ? "೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರ ನಕ್ಷೆ" : "100-Year Vedic Facial Map"}
        </div>
      </Card>

      {/* 4 Chronological Age Phases */}
      <div className="space-y-4">
        {list.map((m, idx) => (
          <Card
            key={idx}
            className="border border-amber-300 bg-white p-4 shadow-sm hover:border-amber-400 transition space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
              <span className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>📍</span>
                <span>{m.agePhase}</span>
              </span>
              <span className="text-xs bg-amber-100 border border-amber-300 text-amber-900 font-extrabold px-3 py-1 rounded-full">
                ವಯಸ್ಸು: {m.ageWindow}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200/80">
                <span className="font-bold text-amber-900 block">{isKn ? "ಮುಖದ ನಿರ್ದಿಷ್ಟ ಭಾಗ:" : "Facial Zone:"}</span>
                <span className="font-semibold text-amber-950">{m.facialArea[lang] || m.facialArea.kn}</span>
              </div>

              <div className="sm:col-span-2 rounded-xl bg-white p-2.5 border border-amber-200/80">
                <span className="font-bold text-amber-900 block mb-0.5">{isKn ? "ಸಾಮುದ್ರಿಕ ಕಾಲ ಫಲ (Prediction):" : "Vedic Milestone:"}</span>
                <span className="text-amber-950 font-medium leading-relaxed">{m.prediction[lang] || m.prediction.kn}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
