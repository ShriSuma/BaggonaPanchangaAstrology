import React from "react";
import Card from "../ui/Card";
import type { PalmMountAnalysis } from "../../features/palmreading/palmReadingEngine";

export type PalmMountsTabProps = {
  mounts?: PalmMountAnalysis[];
  lang?: string;
  devoteeName?: string;
};

export const PalmMountsTab: React.FC<PalmMountsTabProps> = ({
  mounts,
  lang = "kn",
  devoteeName = "Devotee"
}) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  const defaultMountsData = [
    {
      nameKn: "ಗುರು ಪರ್ವತ (Mount of Jupiter)",
      nameEn: "Mount of Jupiter (Guru)",
      planet: "Jupiter (ಗುರು)",
      energy: 92,
      chakraKn: "ಆಜ್ಞಾ ಚಕ್ರ (Third Eye)",
      gemKn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
      fingerKn: "ತರ್ಜನಿ (Index Finger)",
      descriptionKn: "ಅತ್ಯುನ್ನತ ನಾಯಕತ್ವ, ಆಧ್ಯಾತ್ಮಿಕ ಗೌರವ, ಧರ್ಮನಿಷ್ಠೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಪ್ರಭಾವ."
    },
    {
      nameKn: "ಶನಿ ಪರ್ವತ (Mount of Saturn)",
      nameEn: "Mount of Saturn (Shani)",
      planet: "Saturn (ಶನಿ)",
      energy: 85,
      chakraKn: "ಮೂಲಾಧಾರ ಚಕ್ರ (Root Chakra)",
      gemKn: "ಇಂದ್ರನೀಲ (Blue Sapphire)",
      fingerKn: "ಮಧ್ಯಮಾ (Middle Finger)",
      descriptionKn: "ಶಿಸ್ತು, ತಾಳ್ಮೆ, ದೀರ್ಘಕಾಲಿಕ ಯಶಸ್ಸು, ನ್ಯಾಯನಿಷ್ಠೆ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ."
    },
    {
      nameKn: "ಸೂರ್ಯ ಪರ್ವತ (Mount of Sun / Apollo)",
      nameEn: "Mount of Sun (Surya)",
      planet: "Sun (ಸೂರ್ಯ)",
      energy: 88,
      chakraKn: "ಮಣಿಪೂರ ಚಕ್ರ (Solar Plexus)",
      gemKn: "ಮಾಣಿಕ್ಯ (Ruby)",
      fingerKn: "ಅನಾಮಿಕಾ (Ring Finger)",
      descriptionKn: "ತೇಜಸ್ಸು, ಕೀರ್ತಿ, ಸೌಂದರ್ಯಪ್ರಜ್ಞೆ, ರಾಜ ಸನ್ಮಾನ ಹಾಗೂ ಉನ್ನತ ಪ್ರತಿಷ್ಠೆ."
    },
    {
      nameKn: "ಬುಧ ಪರ್ವತ (Mount of Mercury)",
      nameEn: "Mount of Mercury (Budha)",
      planet: "Mercury (ಬುಧ)",
      energy: 90,
      chakraKn: "ವಿಶುದ್ಧ ಚಕ್ರ (Throat Chakra)",
      gemKn: "ಪಚ್ಚೆ (Emerald)",
      fingerKn: "ಕನಿಷ್ಠಿಕಾ (Little Finger)",
      descriptionKn: "ಚಾಣಾಕ್ಷ ವ್ಯಾಪಾರ ಕೌಶಲ, ವಾಕ್ಚಾತುರ್ಯ, ಗಣಿತೀಯ ಬುದ್ಧಿವಂತಿಕೆ ಹಾಗೂ ವಿದ್ಯಾ ಯೋಗ."
    },
    {
      nameKn: "ಶುಕ್ರ ಪರ್ವತ (Mount of Venus)",
      nameEn: "Mount of Venus (Shukra)",
      planet: "Venus (ಶುಕ್ರ)",
      energy: 94,
      chakraKn: "ಸ್ವಾಧಿಷ್ಠಾನ ಚಕ್ರ (Sacral Chakra)",
      gemKn: "ವಜ್ರ / ಜಿರ್ಕಾನ್ (Diamond / Zircon)",
      fingerKn: "ಹೆಬ್ಬೆರಳು ಬೇಸ್ (Base of Thumb)",
      descriptionKn: "ಭೋಗ ಭಾಗ್ಯ, ವಾಹನ ಸೌಭಾಗ್ಯ, ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಕಲಾತ್ಮಕ ಜೀವನ ಶೈಲಿ."
    },
    {
      nameKn: "ಚಂದ್ರ ಪರ್ವತ (Mount of Moon)",
      nameEn: "Mount of Moon (Chandra)",
      planet: "Moon (ಚಂದ್ರ)",
      energy: 86,
      chakraKn: "ಅನಾಹತ ಚಕ್ರ (Heart Chakra)",
      gemKn: "ಮುತ್ತು (Pearl)",
      fingerKn: "ಹಸ್ತದ ತಳಭಾಗ (Palm Base)",
      descriptionKn: "ಅಪಾರ ಕಲ್ಪನಾ ಶಕ್ತಿ, ಶಾಂತಿಪ್ರಿಯತೆ, ಪ್ರವಾಸ ಪ್ರಿಯತೆ ಹಾಗೂ ಅಂತಃಸ್ಫೂರ್ತಿ."
    },
    {
      nameKn: "ಕುಜ ಪರ್ವತ (Mount of Mars)",
      nameEn: "Mount of Mars (Kuja)",
      planet: "Mars (ಮಂಗಳ)",
      energy: 89,
      chakraKn: "ಮಣಿಪೂರ ಚಕ್ರ (Solar Plexus)",
      gemKn: "ಹವಳ (Red Coral)",
      fingerKn: "ಹಸ್ತದ ಮಧ್ಯಭಾಗ (Plain of Mars)",
      descriptionKn: "ಧೈರ್ಯ, ಸಾಹಸ, ಆತ್ಮರಕ್ಷಣೆ, ಕಾರ್ಯದಕ್ಷತೆ ಹಾಗೂ ಭೂಮಿ-ಆಸ್ತಿ ಲಾಭ."
    }
  ];

  return (
    <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-6">
      <div className="border-b border-amber-200 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
            <span>🪐</span>
            <span>{isKn ? "ಸಪ್ತ ಗ್ರಹ ಪರ್ವತ & ಚಕ್ರ ಶಕ್ತಿ ವಿಶ್ಲೇಷಣೆ" : "7 Planetary Mounts & Chakra Energy Analysis"}</span>
          </h3>
          <p className="text-xs text-amber-900/80 mt-1">
            {isKn
              ? `${devoteeName} ಅವರ ಹಸ್ತದಲ್ಲಿರುವ ಸಪ್ತ ಗ್ರಹ ಪರ್ವತಗಳ ಉನ್ನತಿ, ಶಕ್ತಿ ಶೇಕಡಾವಾರು ಹಾಗೂ ಚಕ್ರ ಸಮನ್ವಯ.`
              : `Energy percentages, mount elevations and chakra alignment for ${devoteeName}.`}
          </p>
        </div>

        <div className="rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-900">
          ✨ {isKn ? "ಸಾಮುದ್ರಿಕ ಗಣಿತ ಸ್ಕ್ಯಾನರ್" : "Vedic Mount Scanner"}
        </div>
      </div>

      {/* Grid of Mounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultMountsData.map((m, idx) => (
          <div
            key={idx}
            className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/70 to-white p-4 shadow-sm space-y-3 transition hover:border-amber-500"
          >
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <div>
                <span className="font-bold text-xs text-amber-950">{isKn ? m.nameKn : m.nameEn}</span>
                <div className="text-[11px] text-amber-800 font-semibold">{m.planet}</div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-emerald-900">{m.energy}%</span>
                <div className="text-[10px] text-emerald-700 font-bold">{isKn ? "🟢 ಉನ್ನತ ಪರ್ವತ" : "🟢 Elevated"}</div>
              </div>
            </div>

            {/* Energy Progress Bar */}
            <div className="w-full bg-amber-200/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${m.energy}%` }}
              />
            </div>

            <p className="text-xs text-amber-950/90 leading-relaxed font-medium">
              {isKn ? m.descriptionKn : m.descriptionKn}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] border-t border-amber-200/60 font-semibold text-amber-900">
              <div>🌀 <strong>{isKn ? "ಚಕ್ರ:" : "Chakra:"}</strong> {m.chakraKn}</div>
              <div>💎 <strong>{isKn ? "ಅದೃಷ್ಟ ರತ್ನ:" : "Gem:"}</strong> {m.gemKn}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
