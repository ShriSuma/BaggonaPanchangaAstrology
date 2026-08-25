import React from "react";
import Card from "../ui/Card";

export type SamudrikaYogasTabProps = {
  lang?: string;
  devoteeName?: string;
};

export const SamudrikaYogasTab: React.FC<SamudrikaYogasTabProps> = ({
  lang = "kn",
  devoteeName = "Devotee"
}) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  const yogas = [
    {
      symbol: "🔱",
      nameKn: "ಸಾಮುದ್ರಿಕ ತ್ರಿಶೂಲ ಯೋಗ (Trishula Yoga)",
      nameEn: "Trishula Yoga (Divine Trident Mark)",
      mountKn: "ಗುರು ಪರ್ವತ (Mount of Jupiter)",
      rarityKn: "ಅತ್ಯಂತ ಅಪರೂಪದ (Top 2%)",
      indicationKn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಸಾಕ್ಷಾತ್ ರಕ್ಷಣೆ. ಸಮಾಜದಲ್ಲಿ ಪರಮೋಚ್ಚ ನಾಯಕತ್ವ, ಧಾರ್ಮಿಕ ಅಧಿಕಾರ ಹಾಗೂ ರಾಜ ಸನ್ಮಾನ.",
      statusKn: "ಸಕ್ರಿಯವಾಗಿದೆ (Active)"
    },
    {
      symbol: "🐟",
      nameKn: "ಸಾಮುದ್ರಿಕ ಮತ್ಸ್ಯ ಯೋಗ (Matsya / Fish Sign)",
      nameEn: "Matsya Yoga (Fish Sign on Ketu/Life Line)",
      mountKn: "ಕೇತು / ಮಣಿಬಂಧ ತಳಭಾಗ (Ketu / Wrist)",
      rarityKn: "ಪರಮ ಭಾಗ್ಯ ಯೋಗ (Top 5%)",
      indicationKn: "ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನ, ವಿದೇಶ ಪ್ರವಾಸ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ವೃದ್ಧಾಪ್ಯದಲ್ಲಿ ಅಪಾರ ಆಸ್ತಿ ಸಂಪತ್ತಿನ ಯೋಗ.",
      statusKn: "ಉದಯಿಸುತ್ತಿದೆ (Rising)"
    },
    {
      symbol: "🪷",
      nameKn: "ಸಾಮುದ್ರಿಕ ಪದ್ಮ ಯೋಗ (Padma / Lotus Sign)",
      nameEn: "Padma Yoga (Lotus Mark of Goddess Lakshmi)",
      mountKn: "ಶುಕ್ರ / ಸೂರ್ಯ ಪರ್ವತ (Venus / Apollo)",
      rarityKn: "ರಾಜಯೋಗ (Top 3%)",
      indicationKn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿಯ ಕೃಪಾ ಕಟಾಕ್ಷ. ಸಕಲ ಭೋಗ ಭಾಗ್ಯ, ವಾಹನ ಸೌಭಾಗ್ಯ, ಶಾಶ್ವತ ಕೀರ್ತಿ ಹಾಗೂ ದಯಾಪರತೆ.",
      statusKn: "ಸಕ್ರಿಯವಾಗಿದೆ (Active)"
    },
    {
      symbol: "🔺",
      nameKn: "ದೈವಿಕ ತ್ರಿಕೋನ ರಕ್ಷೆ (Trikona Sign)",
      nameEn: "Trikona Sign (Great Triangle of Fortune)",
      mountKn: "ಹಸ್ತದ ಮಧ್ಯಭಾಗ (Palm Center / Rahu)",
      rarityKn: "ಆರ್ಥಿಕ ಸ್ಥಿರತೆ (Top 10%)",
      indicationKn: "ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ, ಸೂಕ್ಷ್ಮ ಸಂಶೋಧನಾ ಬುದ್ಧಿವಂತಿಕೆ ಹಾಗೂ ಸಾಲಮುಕ್ತಿ ಯೋಗ.",
      statusKn: "ಸ್ಪಷ್ಟವಾಗಿದೆ (Prominent)"
    },
    {
      symbol: "💍",
      nameKn: "ಗುರು ವಲಯ / ಸಾಲೋಮನ್ಸ್ ರಿಂಗ್ (Ring of Solomon)",
      nameEn: "Ring of Solomon (Guru Valaya)",
      mountKn: "ತರ್ಜನಿ ಬೆರಳಿನ ಬುಡ (Jupiter Base)",
      rarityKn: "ಆಧ್ಯಾತ್ಮಿಕ ತೇಜಸ್ಸು (Top 4%)",
      indicationKn: "ದೈವಿಕ ಅಂತಃಸ್ಫೂರ್ತಿ (Intuition), ಮನಃಶಾಸ್ತ್ರಜ್ಞತೆ, ಜ್ಯೋತಿಷ್ಯ-ವೇದಾಂತ ಪಾಂಡಿತ್ಯ ಹಾಗೂ ಗುರು ಕೃಪೆ.",
      statusKn: "ಸಕ್ರಿಯವಾಗಿದೆ (Active)"
    },
    {
      symbol: "✒️",
      nameKn: "ಬುದ್ಧಿ ಚಾತುರ್ಯ ದ್ವಿಮುಖ ಕವಲು (Writer's Fork)",
      nameEn: "Writer's Fork (Buddhi Shakha)",
      mountKn: "ಮಸ್ತಿಷ್ಕ ರೇಖೆಯ ತುದಿ (Head Line Termination)",
      rarityKn: "ವ್ಯವಹಾರ & ಸೃಜನಶೀಲತೆ (Top 8%)",
      indicationKn: "ವ್ಯಾಪಾರ ಹಾಗೂ ಸಾಹಿತ್ಯ-ಕಲೆಗಳ ಅದ್ಭುತ ಸಮನ್ವಯ. ಸಂಕಷ್ಟಗಳನ್ನು ಚತುರತೆಯಿಂದ ನಿಭಾಯಿಸುವ ಸಾಮರ್ಥ್ಯ.",
      statusKn: "ಸ್ಪಷ್ಟವಾಗಿದೆ (Prominent)"
    }
  ];

  return (
    <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-6">
      <div className="border-b border-amber-200 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
            <span>🌟</span>
            <span>{isKn ? "ಸಾಮುದ್ರಿಕ ರಾಜಯೋಗಗಳು & ಶುಭ ಚಿಹ್ನೆಗಳ ಪರಿಶೀಲನೆ" : "Auspicious Samudrika Yogas & Sacred Marks"}</span>
          </h3>
          <p className="text-xs text-amber-900/80 mt-1">
            {isKn
              ? `${devoteeName} ಅವರ ಹಸ್ತದಲ್ಲಿರುವ ಶುಭ ರೇಖಾ ಸಂಯೋಗಗಳು, ತ್ರಿಶೂಲ, ಮತ್ಸ್ಯ ಹಾಗೂ ಪದ್ಮ ಚಿಹ್ನೆಗಳ ವಿವರಣೆ.`
              : `Sacred marks, divine yogas and auspicious symbols identified on ${devoteeName}'s palm.`}
          </p>
        </div>

        <div className="rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-900">
          🔱 {isKn ? "ದೈವಿಕ ಚಿಹ್ನಾ ಫಲ" : "Divine Mark Results"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {yogas.map((y, idx) => (
          <div
            key={idx}
            className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 p-4 shadow-sm space-y-2.5 transition hover:border-amber-500"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{y.symbol}</span>
                <span className="font-bold text-xs text-amber-950">{isKn ? y.nameKn : y.nameEn}</span>
              </div>
              <span className="text-[10px] bg-emerald-700 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                {y.statusKn}
              </span>
            </div>

            <div className="text-[11px] text-amber-900 font-semibold flex items-center justify-between">
              <span>📍 {isKn ? "ಸ್ಥಾನ:" : "Location:"} <strong>{y.mountKn}</strong></span>
              <span className="text-amber-800">{y.rarityKn}</span>
            </div>

            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              {y.indicationKn}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
