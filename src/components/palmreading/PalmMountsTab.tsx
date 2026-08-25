import React from "react";
import Card from "../ui/Card";
import type { PalmMountAnalysis, PalmReadingResult } from "../../features/palmreading/palmReadingEngine";

export type PalmMountsTabProps = {
  result?: PalmReadingResult | null;
  mounts?: PalmMountAnalysis[];
  lang?: string;
  devoteeName?: string;
};

export const PalmMountsTab: React.FC<PalmMountsTabProps> = ({
  result,
  mounts,
  lang = "kn",
  devoteeName = "Devotee"
}) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  const defaultMountsData = [
    {
      nameKn: "೧. ಗುರು ಪರ್ವತ (Mount of Jupiter)",
      nameEn: "1. Mount of Jupiter (Guru)",
      planet: "Jupiter (ಗುರು)",
      energy: 92,
      chakraKn: "ಆಜ್ಞಾ ಚಕ್ರ (Third Eye)",
      gemKn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
      fingerKn: "ತರ್ಜನಿ (Index Finger)",
      descriptionKn: "ಅತ್ಯುನ್ನತ ನಾಯಕತ್ವ, ಆಧ್ಯಾತ್ಮಿಕ ಗೌರವ, ಧರ್ಮನಿಷ್ಠೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಪ್ರಭಾವ."
    },
    {
      nameKn: "೨. ಶನಿ ಪರ್ವತ (Mount of Saturn)",
      nameEn: "2. Mount of Saturn (Shani)",
      planet: "Saturn (ಶನಿ)",
      energy: 85,
      chakraKn: "ಮೂಲಾಧಾರ ಚಕ್ರ (Root Chakra)",
      gemKn: "ಇಂದ್ರನೀಲ (Blue Sapphire)",
      fingerKn: "ಮಧ್ಯಮಾ (Middle Finger)",
      descriptionKn: "ಶಿಸ್ತು, ತಾಳ್ಮೆ, ದೀರ್ಘಕಾಲಿಕ ಯಶಸ್ಸು, ನ್ಯಾಯನಿಷ್ಠೆ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ."
    },
    {
      nameKn: "೩. ಸೂರ್ಯ ಪರ್ವತ (Mount of Sun / Apollo)",
      nameEn: "3. Mount of Sun (Surya)",
      planet: "Sun (ಸೂರ್ಯ)",
      energy: 88,
      chakraKn: "ಮಣಿಪೂರ ಚಕ್ರ (Solar Plexus)",
      gemKn: "ಮಾಣಿಕ್ಯ (Ruby)",
      fingerKn: "ಅನಾಮಿಕಾ (Ring Finger)",
      descriptionKn: "ತೇಜಸ್ಸು, ಕೀರ್ತಿ, ಸೌಂದರ್ಯಪ್ರಜ್ಞೆ, ರಾಜ ಸನ್ಮಾನ ಹಾಗೂ ಉನ್ನತ ಪ್ರತಿಷ್ಠೆ."
    },
    {
      nameKn: "೪. ಬುಧ ಪರ್ವತ (Mount of Mercury)",
      nameEn: "4. Mount of Mercury (Budha)",
      planet: "Mercury (ಬುಧ)",
      energy: 86,
      chakraKn: "ವಿಶುದ್ಧ ಚಕ್ರ (Throat Chakra)",
      gemKn: "ಪಚ್ಚೆ (Emerald)",
      fingerKn: "ಕನಿಷ್ಠಿಕಾ (Little Finger)",
      descriptionKn: "ವಾಕ್ ಸಿದ್ಧಿ, ವ್ಯಾಪಾರ ಚಾಕಚಕ್ಯತೆ, ಗಣಿತ ವಿಶ್ಲೇಷಣೆ ಹಾಗೂ ಸಂವಹನ ಕಲೆ."
    },
    {
      nameKn: "೫. ಶುಕ್ರ ಪರ್ವತ (Mount of Venus)",
      nameEn: "5. Mount of Venus (Shukra)",
      planet: "Venus (ಶುಕ್ರ)",
      energy: 90,
      chakraKn: "ಸ್ವಾಧಿಷ್ಠಾನ ಚಕ್ರ (Sacral Chakra)",
      gemKn: "ವಜ್ರ (Diamond)",
      fingerKn: "ಅಂಗುಷ್ಠ ಮೂಲ (Thumb Base)",
      descriptionKn: "ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ, ವಾಹನ ಸೌಭಾಗ್ಯ, ಕಲಾತ್ಮಕ ರಸಿಕತೆ ಹಾಗೂ ಸಕಲ ಭೋಗ ಯೋಗ."
    },
    {
      nameKn: "೬. ಚಂದ್ರ ಪರ್ವತ (Mount of Moon)",
      nameEn: "6. Mount of Moon (Chandra)",
      planet: "Moon (ಚಂದ್ರ)",
      energy: 84,
      chakraKn: "ಸಹಸ್ರಾರ ಚಕ್ರ (Crown Chakra)",
      gemKn: "ಮುತ್ತು (Natural Pearl)",
      fingerKn: "ಹಸ್ತದ ಕೆಳಭಾಗ (Palm Base)",
      descriptionKn: "ತೀಕ್ಷ್ಣ ಕಲ್ಪನಾ ಶಕ್ತಿ, ಅಂತಃಸ್ಫೂರ್ತಿ, ಜಲ/ವಿದೇಶ ಪ್ರಯಾಣ ಯೋಗ ಹಾಗೂ ಪ್ರಶಾಂತ ಮನಸ್ಸು."
    },
    {
      nameKn: "೭. ಕುಜ ಪರ್ವತ (Mount of Mars - Upper & Lower)",
      nameEn: "7. Mount of Mars (Kuja)",
      planet: "Mars (ಮಂಗಳ)",
      energy: 87,
      chakraKn: "ಮೂಲಾಧಾರ / ಮಣಿಪೂರ",
      gemKn: "ಹವಳ (Red Coral)",
      fingerKn: "ಹಸ್ತದ ಮಧ್ಯ ವಲಯ",
      descriptionKn: "ಮಾನಸಿಕ ಧೈರ್ಯ, ಶತ್ರು ಜಯ, ರಕ್ಷಣಾ ಶಕ್ತಿ ಹಾಗೂ ಅಚಲ ಹೋರಾಟ ಮನೋಭಾವ."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none filter drop-shadow">🪐</span>
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
              ॥ ವರಾಹಮಿಹಿರ ಬೃಹತ್ ಸಂಹಿತಾ & ಗರುಡ ಪುರಾಣ ಶಾಸ್ತ್ರ ॥
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {isKn ? "ಸಪ್ತ ಗ್ರಹ ಪರ್ವತಗಳು & ಹಸ್ತ ತತ್ತ್ವ ವಿಶ್ಲೇಷಣೆ" : "7 Planetary Mounts & Chironomy Analysis"}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {isKn
                ? "ಪ್ರಾಚೀನ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಹಸ್ತದ ೭ ಪರ್ವತಗಳು ನವಗ್ರಹಗಳ ಕಾಸ್ಮಿಕ್ ಕಿರಣಗಳನ್ನು ಹೀರಿಕೊಂಡು ಮನುಷ್ಯನ ವ್ಯಕ್ತಿತ್ವ, ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಭಾಗ್ಯೋದಯವನ್ನು ನಿರ್ಧರಿಸುತ್ತವೆ."
                : "Classical Vedic Samudrika Shastra details how the 7 planetary mounts channel cosmic energies, governing ambition, wealth, intellect, and spiritual protection."}
            </p>
          </div>
        </div>
      </Card>

      {/* Chironomy Hand Element & Thumb Analysis Card */}
      {result && (
        <Card className="border border-amber-300 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm space-y-4">
          <div className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-1.5 flex items-center gap-2">
            <span>🖐️</span>
            <span>{isKn ? "ಹಸ್ತ ತತ್ತ್ವ & ಅಂಗುಷ್ಠ (ಹೆಬ್ಬೆರಳು) ರಹಸ್ಯ" : "Chironomy Element & Thumb (Angushtha) Secrets"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Hand Type */}
            <div className="rounded-xl bg-white p-3.5 border border-amber-200 shadow-sm space-y-1">
              <span className="font-bold text-amber-900 block">
                {isKn ? "ಹಸ್ತ ಪಂಚಭೂತ ತತ್ತ್ವ:" : "Elemental Hand Type:"}
              </span>
              <span className="font-extrabold text-amber-950 text-sm block">
                {result.chironomyHandType.element[lang] || result.chironomyHandType.element.kn}
              </span>
              <p className="text-amber-900/90 font-medium pt-1 leading-relaxed">
                {result.chironomyHandType.traits[lang] || result.chironomyHandType.traits.kn}
              </p>
            </div>

            {/* Thumb Shiva Eye */}
            <div className="rounded-xl bg-white p-3.5 border border-amber-200 shadow-sm space-y-1">
              <span className="font-bold text-emerald-900 block">
                {isKn ? "ಅಂಗುಷ್ಠ ಯವ ಚಿಹ್ನೆ (ಶಿವ ನೇತ್ರ):" : "Thumb Yava (Eye of Shiva):"}
              </span>
              <span className="font-bold text-amber-950 block">
                {result.thumbAnalysis.yavaSign[lang] || result.thumbAnalysis.yavaSign.kn}
              </span>
              <div className="text-[11px] text-amber-900 pt-1 space-y-0.5">
                <div><strong>{isKn ? "ಇಚ್ಛಾ ಶಕ್ತಿ:" : "Willpower:"}</strong> {result.thumbAnalysis.willpowerPhalanx[lang] || result.thumbAnalysis.willpowerPhalanx.kn}</div>
                <div><strong>{isKn ? "ತರ್ಕ ಶಕ್ತಿ:" : "Logic:"}</strong> {result.thumbAnalysis.logicPhalanx[lang] || result.thumbAnalysis.logicPhalanx.kn}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 7 Mounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultMountsData.map((m, idx) => (
          <Card
            key={idx}
            className="border-2 border-amber-300/80 bg-white hover:border-amber-400 p-4 shadow-sm hover:shadow-md transition space-y-3"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="font-serif text-sm font-bold text-amber-950">
                {isKn ? m.nameKn : m.nameEn}
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                ಬಲ: {m.energy}%
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
              <div className="flex justify-between">
                <span className="text-amber-900 font-bold">{isKn ? "ಅಧಿಪತಿ ಗ್ರಹ:" : "Ruling Planet:"}</span>
                <span className="font-semibold text-amber-950">{m.planet}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-amber-900 font-bold">{isKn ? "ಸಂಬಂಧಿತ ಬೆರಳು:" : "Associated Finger:"}</span>
                <span className="font-medium text-slate-900">{m.fingerKn}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-amber-900 font-bold">{isKn ? "ರತ್ನ & ಚಕ್ರ:" : "Gemstone & Chakra:"}</span>
                <span className="font-medium text-slate-900">{m.gemKn} · {m.chakraKn}</span>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200 mt-2">
                <span className="font-bold text-amber-950 block mb-0.5">
                  🪔 {isKn ? "ದೈವಿಕ ಫಲ (Vedic Impact):" : "Vedic Impact:"}
                </span>
                <span className="text-amber-900 font-medium">{m.descriptionKn}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
