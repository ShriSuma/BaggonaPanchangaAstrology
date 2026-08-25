import React from "react";
import Card from "../ui/Card";
import {
  VEDIC_HASTAREKHA_SACRED_YOGAS,
  VEDIC_MANIBANDHA_WRIST_BRACELETS,
  VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT,
  VEDIC_ANGULI_FINGER_PROPORTIONS
} from "../../features/palmreading/samudrikaKnowledge";

export type SamudrikaYogasTabProps = {
  lang?: string;
  devoteeName?: string;
};

export const SamudrikaYogasTab: React.FC<SamudrikaYogasTabProps> = ({
  lang = "kn",
  devoteeName = "Devotee"
}) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  const sacredMarks = [
    {
      symbol: "🔱",
      nameKn: "ಸಾಮುದ್ರಿಕ ತ್ರಿಶೂಲ ಯೋಗ (Trishula Yoga)",
      nameEn: "Trishula Yoga (Divine Trident Mark)",
      mountKn: "ಗುರು / ಸೂರ್ಯ ಪರ್ವತ (Mount of Jupiter / Sun)",
      rarityKn: "ಅತ್ಯಂತ ಅಪರೂಪದ (Top 2%)",
      indicationKn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಸಾಕ್ಷಾತ್ ರಕ್ಷಣೆ. ಸಮಾಜದಲ್ಲಿ ಪರಮೋಚ್ಚ ನಾಯಕತ್ವ, ಧಾರ್ಮಿಕ ಅಧಿಕಾರ ಹಾಗೂ ರಾಜ ಸನ್ಮಾನ.",
      statusKn: "ಸಕ್ರಿಯವಾಗಿದೆ (Active)"
    },
    {
      symbol: "🐟",
      nameKn: "ಸಾಮುದ್ರಿಕ ಮತ್ಸ್ಯ ಯೋಗ (Matsya / Fish Sign)",
      nameEn: "Matsya Yoga (Fish Sign on Ketu/Wrist)",
      mountKn: "ಕೇತು / ಮಣಿಬಂಧ ತಳಭಾಗ (Ketu / Wrist)",
      rarityKn: "ಪರಮ ಭಾಗ್ಯ ಯೋಗ (Top 5%)",
      indicationKn: "ಅನಿರೀಕ್ಷಿತ ಆಕಸ್ಮಿಕ ಧನಾಗಮನ, ವಿದೇಶ ಪ್ರವಾಸ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಜೀವನದ ದ್ವಿತೀಯಾರ್ಧದಲ್ಲಿ ಅಪಾರ ಸಂಪತ್ತು.",
      statusKn: "ಉದಯಿಸುತ್ತಿದೆ (Rising)"
    },
    {
      symbol: "✨",
      nameKn: "ರಹಸ್ಯ ಸ್ವಸ್ತಿಕ (Mystic Cross of Intuition)",
      nameEn: "Mystic Cross (Quadrangle Intuition)",
      mountKn: "ಹೃದಯ-ಬುದ್ಧಿ ರೇಖಾ ಮಧ್ಯ (Quadrangle)",
      rarityKn: "ಅತೀಂದ್ರಿಯ ಸಿದ್ಧಿ (Top 4%)",
      indicationKn: "ಪ್ರಬಲ ೬ನೇ ಇಂದ್ರಿಯ, ಅತೀಂದ್ರಿಯ ಅಂತಃಸ್ಫೂರ್ತಿ, ಜ್ಯೋತಿಷ್ಯ-ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ ಹಾಗೂ ದೈವಿಕ ಮುನ್ನೋಟ.",
      statusKn: "ಸಕ್ರಿಯವಾಗಿದೆ (Active)"
    },
    {
      symbol: "💍",
      nameKn: "ಗುರು ಮುದ್ರಿಕಾ / ಸಾಲೋಮನ್ ರಿಂಗ್ (Ring of Solomon)",
      nameEn: "Ring of Solomon (Guru Mudrika)",
      mountKn: "ಗುರು ಪರ್ವತ (Mount of Jupiter)",
      rarityKn: "ಜ್ಞಾನ ಯೋಗ (Top 6%)",
      indicationKn: "ಸಹಜ ಮನೋವೈಜ್ಞಾನಿಕ ಗ್ರಹಣ ಶಕ್ತಿ, ಗುರು ಪದವಿ, ಬೋಧನೆ ಹಾಗೂ ನ್ಯಾಯಪರ ಸಮಾಜ ಗೌರವ.",
      statusKn: "ಸ್ಪಷ್ಟವಾಗಿದೆ (Prominent)"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none filter drop-shadow">👑</span>
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
              ॥ ವರಾಹಮಿಹಿರ ಬೃಹತ್ ಸಂಹಿತಾ ಹಸ್ತ ಯೋಗ ಶಾಸ್ತ್ರ ॥
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {isKn ? "ಪರಮ ಪವಿತ್ರ ಸಾಮುದ್ರಿಕ ಯೋಗಗಳು & ಮಣಿಬಂಧ ರೇಖೆಗಳು" : "Sacred Samudrika Yogas & Rascette Bracelets"}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {isKn
                ? "ಪೂರ್ವಜನ್ಮದ ತಪಸ್ಸು ಹಾಗೂ ಶುಭ ಕರ್ಮಗಳ ಫಲವಾಗಿ ಹಸ್ತದಲ್ಲಿ ಉದ್ಭವಿಸುವ ಅಪರೂಪದ ಯೋಗಗಳು, ಮಣಿಬಂಧ ರೇಖೆಗಳು ಹಾಗೂ ಧನ ಕೋಶ ತ್ರಿಕೋನಗಳು ಜೀವನದಲ್ಲಿ ಸಾರ್ವಭೌಮ ಯಶಸ್ಸನ್ನು ನೀಡುತ್ತವೆ."
                : "Classical Vedic texts detail how rare yogas, wrist bracelets, and the Great Triangle signify accumulated past merit, sudden wealth, and sovereign destiny."}
            </p>
          </div>
        </div>
      </Card>

      {/* 4 Sacred Vedic Hastarekha Yogas */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
            <span>🪷</span>
            <span>{isKn ? "ಚತುರ್ವಿಧ ಮಹಾ ಹಸ್ತ ಯೋಗಗಳು (4 Sacred Palm Yogas):" : "4 Major Vedic Palm Yogas:"}</span>
          </h4>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
            Brihat Samhita
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VEDIC_HASTAREKHA_SACRED_YOGAS.map((y, idx) => (
            <div
              key={idx}
              className="rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 p-4 shadow-sm space-y-2 hover:border-amber-400 transition"
            >
              <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                <span className="font-serif text-sm font-bold text-amber-950">
                  {isKn ? y.yogaNameKn : y.yogaNameEn}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ" : "Auspicious"}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-800">
                <div>
                  <strong className="text-amber-900">{isKn ? "ರೇಖಾ ಸಂಯೋಜನೆ:" : "Formation:"}</strong>{" "}
                  <span className="font-medium text-slate-900">{y.formationKn}</span>
                </div>
                <div className="rounded-xl bg-amber-100/60 p-2 border border-amber-200 mt-1">
                  <strong className="text-amber-950 block text-[11px] mb-0.5">
                    🪔 {isKn ? "ದೈವಿಕ ಫಲ (Vedic Impact):" : "Vedic Impact:"}
                  </strong>
                  <span className="text-amber-900 font-medium">{y.fruitKn}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Manibandha Wrist Bracelets (Rascettes) */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
            <span>✨</span>
            <span>{isKn ? "ಮಣಿಬಂಧ ಚತುರ್ ರೇಖೆಗಳು (4 Wrist Bracelets - Rascettes):" : "4 Wrist Bracelets (Manibandha Rascettes):"}</span>
          </h4>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
            Garuda Purana
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {VEDIC_MANIBANDHA_WRIST_BRACELETS.map((b) => (
            <div key={b.bracelet} className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span>{isKn ? b.nameKn : b.nameEn}</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-extrabold">
                  #{b.bracelet}
                </span>
              </div>
              <p className="text-amber-900 font-medium leading-relaxed">
                {isKn ? b.meaningKn : b.meaningEn}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Great Triangle & Finger Proportions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Great Triangle */}
        <Card className="border border-amber-300 bg-gradient-to-br from-amber-50/90 to-white p-4 shadow-sm space-y-2">
          <div className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-1.5 flex items-center gap-2">
            <span>🔺</span>
            <span>{isKn ? VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.nameKn : VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.nameEn}</span>
          </div>
          <p className="text-xs text-amber-900 font-medium leading-relaxed">
            {isKn ? VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.meaningKn : VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.meaningEn}
          </p>
        </Card>

        {/* Little Finger Mercury Rule */}
        <Card className="border border-amber-300 bg-gradient-to-br from-amber-50/90 to-white p-4 shadow-sm space-y-2">
          <div className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-1.5 flex items-center gap-2">
            <span>💎</span>
            <span>{isKn ? VEDIC_ANGULI_FINGER_PROPORTIONS.littleFingerMercury.nameKn : VEDIC_ANGULI_FINGER_PROPORTIONS.littleFingerMercury.nameEn}</span>
          </div>
          <p className="text-xs text-amber-900 font-medium leading-relaxed">
            {isKn ? VEDIC_ANGULI_FINGER_PROPORTIONS.littleFingerMercury.meaningKn : VEDIC_ANGULI_FINGER_PROPORTIONS.littleFingerMercury.meaningEn}
          </p>
        </Card>
      </div>

      {/* Sacred Marks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sacredMarks.map((y, idx) => (
          <Card
            key={idx}
            className="border-2 border-amber-300/80 bg-white hover:border-amber-400 p-4 shadow-sm hover:shadow-md transition space-y-3"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl select-none">{y.symbol}</span>
                <span className="font-serif text-sm font-bold text-amber-950">
                  {isKn ? y.nameKn : y.nameEn}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                {y.statusKn}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
              <div className="flex justify-between">
                <span className="text-amber-900 font-bold">{isKn ? "ಪರ್ವತ ಸ್ಥಾನ:" : "Mount Location:"}</span>
                <span className="font-semibold text-amber-950">{y.mountKn}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-amber-900 font-bold">{isKn ? "ಅಪರೂಪತೆ:" : "Rarity Quotient:"}</span>
                <span className="font-semibold text-purple-900">{y.rarityKn}</span>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200 mt-2">
                <span className="font-bold text-amber-950 block mb-0.5">
                  🪔 {isKn ? "ದೈವಿಕ ಫಲ (Vedic Impact):" : "Vedic Impact:"}
                </span>
                <span className="text-amber-900 font-medium">{y.indicationKn}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
