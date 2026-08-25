import React, { useState } from "react";
import Card from "../ui/Card";
import type { FacialMoleResult } from "../../features/facereading/faceReadingEngine";

type Props = {
  moles?: FacialMoleResult[];
  lang: string;
};

const CLASSICAL_12_FACIAL_MOLE_ZONES = [
  {
    id: "forehead-center",
    locationKn: "೧. ಹಣೆಯ ಮಧ್ಯಭಾಗ (ಆಜ್ಞಾ ಚಕ್ರ)",
    locationEn: "1. Forehead Center (Ajna Chakra)",
    meaningKn: "ಅದ್ಭುತ ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನ, ನಾಯಕತ್ವ, ಧರ್ಮನಿಷ್ಠೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವ.",
    meaningEn: "High spiritual intellect, executive leadership, and widespread honor."
  },
  {
    id: "right-forehead",
    locationKn: "೨. ಬಲ ಹಣೆ / ಶಂಖ ಪ್ರದೇಶ (Right Temple)",
    locationEn: "2. Right Forehead / Temple",
    meaningKn: "ವಿದೇಶ/ದೂರ ಪ್ರಯಾಣದಲ್ಲಿ ಯಶಸ್ಸು, ಸರ್ಕಾರಿ ಉದ್ಯೋಗ ಕೀರ್ತಿ ಹಾಗೂ ಹಠಾತ್ ಭಾಗ್ಯೋದಯ.",
    meaningEn: "Travel success, governmental favor, and sudden career breakthroughs."
  },
  {
    id: "left-forehead",
    locationKn: "೩. ಎಡ ಹಣೆ (Left Forehead)",
    locationEn: "3. Left Forehead",
    meaningKn: "ತೀಕ್ಷ್ಣ ಕಲ್ಪನಾ ಶಕ್ತಿ, ಸಂಶೋಧನಾ ಪ್ರವೃತ್ತಿ ಹಾಗೂ ಕಲಾತ್ಮಕ ಸಿದ್ಧಿ.",
    meaningEn: "Deep imaginative intuition, research prowess, and artistic talents."
  },
  {
    id: "right-eyebrow",
    locationKn: "೪. ಬಲ ಹುಬ್ಬು (Right Eyebrow)",
    locationEn: "4. Right Eyebrow",
    meaningKn: "ಸಕಾಲದಲ್ಲಿ ಶುಭ ವಿವಾಹ ಯೋಗ, ಗುಣವಂತ ಸಂಗಾತಿ ಹಾಗೂ ದಾಂಪತ್ಯ ಸುಖ.",
    meaningEn: "Early auspicious marriage, loving partner, and domestic bliss."
  },
  {
    id: "left-eyebrow",
    locationKn: "೫. ಎಡ ಹುಬ್ಬು (Left Eyebrow)",
    locationEn: "5. Left Eyebrow",
    meaningKn: "ವ್ಯವಹಾರದಲ್ಲಿ ಚಾಣಾಕ್ಷತೆ, ಹಣಕಾಸು ಉಳಿತಾಯ ಹಾಗೂ ಸ್ವಾಭಿಮಾನಿ ಜೀವನ.",
    meaningEn: "Financial prudence, clever bargaining, and independent spirit."
  },
  {
    id: "right-cheek",
    locationKn: "೬. ಬಲ ಕೆನ್ನೆ (Right Cheek - Lakshmi Sthana)",
    locationEn: "6. Right Cheek (Lakshmi Spot)",
    meaningKn: "ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷ, ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ, ಧನ ಸಮೃದ್ಧಿ ಹಾಗೂ ಸುಖ ಭೋಗ.",
    meaningEn: "Blessing of Goddess Lakshmi, business profitability, and material wealth."
  },
  {
    id: "left-cheek",
    locationKn: "೭. ಎಡ ಕೆನ್ನೆ (Left Cheek)",
    locationEn: "7. Left Cheek",
    meaningKn: "ಗಂಭೀರ ಚಿಂತನೆ, ಸಾಹಿತ್ಯ ಪ್ರೇಮ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದ.",
    meaningEn: "Contemplative nature, literary affinity, and ancestor grace."
  },
  {
    id: "nose-bridge",
    locationKn: "೮. ನಾಸಿಕ ಸೇತುವೆ (Nose Bridge - Dhana Rekha)",
    locationEn: "8. Nose Bridge (Dhana Rekha)",
    meaningKn: "ನಿರಂತರ ಆದಾಯದ ಮೂಲ, ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಉನ್ನತ ಹುದ್ದೆ.",
    meaningEn: "Continuous income streams and career advancement through self-effort."
  },
  {
    id: "nose-tip",
    locationKn: "೯. ಮೂಗಿನ ತುದಿ (Nose Tip - Kuber Vault)",
    locationEn: "9. Nose Tip (Kuber Point)",
    meaningKn: "ಕುಬೇರ ಯೋಗ, ಹಠಾತ್ ಧನಾಗಮನ, ಚಿನ್ನಾಭರಣ ಸಂಗ್ರಹ ಹಾಗೂ ಆಸ್ತಿ ಗಳಿಕೆ.",
    meaningEn: "Kuber wealth surge, gold jewelry accumulation, and solid liquidity."
  },
  {
    id: "upper-lip",
    locationKn: "೧೦. ಮೇಲಿನ ತುಟಿ (Upper Lip - Vak Sthana)",
    locationEn: "10. Upper Lip (Vak Sthana)",
    meaningKn: "ಚಾಣಾಕ್ಷ ವಾಕ್ಚಾತುರ್ಯ, ಮಧುರ ಸಂಭಾಷಣೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಅತಿ ಜನಪ್ರಿಯತೆ.",
    meaningEn: "Sweet speech, persuasive charisma, and widespread social popularity."
  },
  {
    id: "lower-lip",
    locationKn: "೧೧. ಕೆಳಗಿನ ತುಟಿ (Lower Lip)",
    locationEn: "11. Lower Lip",
    meaningKn: "ಉತ್ತಮ ಭೋಜನ ಪ್ರಿಯತೆ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಪ್ರೇಮಮಯ ದಾಂಪತ್ಯ.",
    meaningEn: "Appreciation for culinary arts, vehicle comforts, and loving relationships."
  },
  {
    id: "chin-center",
    locationKn: "೧೨. ಚಿಬುಕ / ಗದ್ದ (Chin Center - Bhoomi Sthana)",
    locationEn: "12. Chin Center (Bhoomi Sthana)",
    meaningKn: "ಸ್ವಂತ ಮನೆ, ಕೃಷಿ/ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ಸುಖಕರ ವೃದ್ಧಾಪ್ಯ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿ.",
    meaningEn: "Real estate ownership, ancestral property growth, and peaceful retirement."
  }
];

export const FaceMolesTab: React.FC<Props> = ({ moles, lang }) => {
  const isKn = lang === "kn";
  const [selectedMoleZone, setSelectedMoleZone] = useState<string>("forehead-center");
  const activeZoneData = CLASSICAL_12_FACIAL_MOLE_ZONES.find((z) => z.id === selectedMoleZone) || CLASSICAL_12_FACIAL_MOLE_ZONES[0];

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none filter drop-shadow">🪔</span>
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
              ॥ ಬೃಹತ್ ಸಂಹಿತಾ & ಭವಿಷ್ಯ ಪುರಾಣ ಮುಖ ತಿಲಕ ಶಾಸ್ತ್ರ ॥
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {isKn ? "ಮುಖ ತಿಲಕ (ಮಚ್ಚೆ) ಶಾಸ್ತ್ರ & ದೈವಿಕ ಫಲ ರಹಸ್ಯ" : "Facial Mole (Tilaka) Astrology & Sacred Destiny"}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {isKn
                ? "ಮುಖದ ೧೨ ಪ್ರಧಾನ ಸ್ಥಾನಗಳಲ್ಲಿರುವ ನೈಸರ್ಗಿಕ ಮಚ್ಚೆಗಳು ವ್ಯಕ್ತಿಯ ಪೂರ್ವಜನ್ಮದ ಸುಕೃತ, ಧನಾಗಮನ, ವಿವಾಹ ಕಾಲ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಣೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಸೂಚಿಸುತ್ತವೆ."
                : "Classical Vedic texts detail how natural moles across 12 facial coordinates reveal past karmic merit, sudden wealth, marriage timing, and divine protection."}
            </p>
          </div>
        </div>
      </Card>

      {/* Interactive 12-Zone Facial Mole Finder */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
            <span>📍</span>
            <span>{isKn ? "ದ್ವಾದಶ ಮುಖ ಸ್ಥಾನಗಳ ಮಚ್ಚೆ ಫಲ (12-Zone Mole Explorer):" : "12-Zone Facial Mole Explorer:"}</span>
          </h4>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
            Brihat Samhita Ch. 68
          </span>
        </div>

        {/* Zone Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {CLASSICAL_12_FACIAL_MOLE_ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setSelectedMoleZone(z.id)}
              className={`p-2.5 rounded-xl text-left text-xs font-bold transition border shadow-sm ${
                selectedMoleZone === z.id
                  ? "bg-amber-800 text-amber-50 border-amber-900 shadow-md"
                  : "bg-amber-50/70 border-amber-200 text-amber-950 hover:bg-amber-100"
              }`}
            >
              {isKn ? z.locationKn : z.locationEn}
            </button>
          ))}
        </div>

        {/* Selected Zone Deep Dive Display */}
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-4 shadow-sm space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1">
            <span className="font-serif text-sm font-extrabold text-amber-950">
              {isKn ? activeZoneData.locationKn : activeZoneData.locationEn}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              🌟 {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ಫಲ" : "Vedic Indication"}
            </span>
          </div>
          <p className="text-xs text-amber-900 font-semibold leading-relaxed pt-1">
            {isKn ? activeZoneData.meaningKn : activeZoneData.meaningEn}
          </p>
        </div>
      </Card>

      {/* Detected Moles from Devotee Image if any */}
      {moles && moles.length > 0 && (
        <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-3">
          <div className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-2 flex items-center gap-2">
            <span>✨</span>
            <span>{isKn ? "ನಿಮ್ಮ ಛಾಯಾಚಿತ್ರದಲ್ಲಿ ಗುರುತಿಸಲಾದ ಮಚ್ಚೆಗಳು (Detected Moles):" : "Detected Moles from Your Photo:"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {moles.map((m, idx) => (
              <div key={idx} className="rounded-xl bg-amber-50/70 p-3 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-xs text-amber-950">
                  <span>{m.location[lang] || m.location.kn}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-extrabold">
                    {m.isAuspicious ? (isKn ? "ಶುಭ" : "Auspicious") : (isKn ? "ಸಾಮಾನ್ಯ" : "Neutral")}
                  </span>
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  {m.significance[lang] || m.significance.kn}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

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
