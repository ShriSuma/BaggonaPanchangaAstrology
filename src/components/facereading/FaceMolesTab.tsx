import React from "react";
import Card from "../ui/Card";
import type { FacialMoleResult } from "../../features/facereading/faceReadingEngine";

type Props = {
  moles?: FacialMoleResult[];
  lang: string;
};

const DEFAULT_MOLES: FacialMoleResult[] = [
  {
    location: { kn: "೧. ಹಣೆಯ ಮಧ್ಯಭಾಗ (ಭ್ರೂಮಧ್ಯ)", en: "1. Center Forehead (Ajna Chakra)" },
    significance: { kn: "ಉನ್ನತ ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನ, ನಾಯಕತ್ವ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವ.", en: "Spiritual intuition, wisdom and natural authority." },
    isAuspicious: true
  },
  {
    location: { kn: "೨. ಬಲ ಕೆನ್ನೆ (Right Cheek)", en: "2. Right Cheek" },
    significance: { kn: "ಹಠಾತ್ ಧನಲಾಭ, ವ್ಯಾಪಾರದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಕೃಪೆ.", en: "Sudden wealth influx, business success and financial abundance." },
    isAuspicious: true
  },
  {
    location: { kn: "೩. ಮೂಗಿನ ತುದಿ (Nose Tip - Kuber)", en: "3. Nose Tip (Kuber Point)" },
    significance: { kn: "ಕುಬೇರ ಸಂಪತ್ತು, ಸ್ಥಿರಾಸ್ತಿ ಸಂಗ್ರಹ ಹಾಗೂ ಆರ್ಥಿಕ ಭದ್ರತೆ.", en: "Kuber fortune, cash reserves and real estate ownership." },
    isAuspicious: true
  },
  {
    location: { kn: "೪. ಚಿಬುಕ / ಗದ್ದ (Chin Area)", en: "4. Chin (Bhoomi Point)" },
    significance: { kn: "ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಭೂಮಿ/ಮನೆ ಖರೀದಿ ಹಾಗೂ ಸುಖಕರ ವೃದ್ಧಾಪ್ಯ.", en: "Self-made property acquisition and comfortable elderhood." },
    isAuspicious: true
  }
];

export const FaceMolesTab: React.FC<Props> = ({ moles = DEFAULT_MOLES, lang }) => {
  const isKn = lang === "kn";
  const moleList = moles && moles.length > 0 ? moles : DEFAULT_MOLES;

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <Card className="border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none">🪔</span>
          <div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {isKn ? "ಮುಖ ತಿಲಕ / ಮಚ್ಚೆ ಶಾಸ್ತ್ರ & ದೈವಿಕ ಪರಿಹಾರ" : "Facial Mole (Tilaka) Astrology & Remedies"}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium mt-1">
              {isKn
                ? "ಮುಖದ ಮೇಲಿರುವ ನೈಸರ್ಗಿಕ ಮಚ್ಚೆಗಳು ವ್ಯಕ್ತಿಯ ಭಾಗ್ಯೋದಯ, ಧನಾಗಮನ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಣೆಯನ್ನು ಸಾಮುದ್ರಿಕ ಗ್ರಂಥಗಳ ಪ್ರಕಾರ ಸೂಚಿಸುತ್ತವೆ."
                : "Natural facial moles (Tilaka Lakshana) indicate destiny shifts, wealth influx, and karmic traits according to classical Samudrika texts."}
            </p>
          </div>
        </div>
      </Card>

      {/* Moles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moleList.map((m, idx) => (
          <Card
            key={idx}
            className="border-2 border-amber-300/80 bg-white hover:border-amber-400 p-4 shadow-sm hover:shadow-md transition space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <span>📍</span>
                <span>{m.location[lang] || m.location.kn}</span>
              </span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  m.isAuspicious ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-amber-100 text-amber-900"
                }`}
              >
                {m.isAuspicious ? (isKn ? "🌟 ಅತ್ಯಂತ ಶುಭ" : "Auspicious") : (isKn ? "ಸಾಮಾನ್ಯ" : "Neutral")}
              </span>
            </div>

            <p className="text-xs text-amber-950 font-medium leading-relaxed bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80">
              {m.significance[lang] || m.significance.kn}
            </p>
          </Card>
        ))}
      </div>

      {/* Gokarna Kshetra Sacred Remedy Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md space-y-3">
        <div className="flex items-center gap-2 border-b border-amber-300 pb-2">
          <span className="text-2xl select-none">🔱</span>
          <h4 className="font-serif text-base font-bold text-amber-950">
            {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮುಖ ತೇಜಸ್ಸು ವೃದ್ಧಿ ಪರಿಹಾರ" : "Sacred Gokarna Facial Tejas & Peace Remedy"}
          </h4>
        </div>

        <div className="text-xs text-amber-950 leading-relaxed font-medium space-y-2">
          <p>
            {isKn
              ? "ಮುಖದಲ್ಲಿ ಸದಾ ಮಂಗಳಕರ ಕಾಂತಿ ಹಾಗೂ ಸಾತ್ವಿಕ ತೇಜಸ್ಸು ನೆಲೆಸಲು, ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲದಲ್ಲಿ ಶುದ್ಧ ಗಂಧ ಅಥವಾ ಕುಂಕುಮ ತಿಲಕವನ್ನು ಆಜ್ಞಾ ಚಕ್ರದಲ್ಲಿ ಧರಿಸಿ, 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸುವುದು ಅತ್ಯುನ್ನತ."
              : "To enhance natural facial radiance and inner peace, apply pure sandalwood paste or kumkuma at the Ajna chakra daily while chanting Om Namah Shivaya."}
          </p>
          <div className="rounded-xl bg-white p-3 border border-amber-300 text-amber-900 font-bold">
            🙏 {isKn ? "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಅರ್ಚಕರ ಸನ್ನಿಧಿ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (+91 99723 39362)" : "Priest Contact: Sri Shreeram Pandit (+91 99723 39362)"}
          </div>
        </div>
      </Card>
    </div>
  );
};
