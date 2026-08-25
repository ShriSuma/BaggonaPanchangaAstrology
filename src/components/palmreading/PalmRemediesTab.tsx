import React from "react";
import Card from "../ui/Card";

export type PalmRemediesTabProps = {
  lang?: string;
  devoteeName?: string;
};

export const PalmRemediesTab: React.FC<PalmRemediesTabProps> = ({
  lang = "kn",
  devoteeName = "Devotee"
}) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  return (
    <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-6">
      <div className="border-b border-amber-200 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
            <span>💍</span>
            <span>{isKn ? "ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಸಾಮುದ್ರಿಕ ದೈವಿಕ ಪರಿಹಾರ ಮಾರ್ಗದರ್ಶನ" : "Gemstone, Rudraksha & Palmistry Remedies"}</span>
          </h3>
          <p className="text-xs text-amber-900/80 mt-1">
            {isKn
              ? `${devoteeName} ಅವರ ಹಸ್ತ ರೇಖೆಗಳ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ, ಲೋಹದ ಉಂಗುರ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರಗಳು.`
              : `Auspicious gemstones, Rudraksha, metal rings, and temple remedies customized for ${devoteeName}.`}
          </p>
        </div>

        <div className="rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-900">
          🪔 {isKn ? "ಗೋಕರ್ಣ ಸಿದ್ಧ ಪರಿಹಾರ" : "Gokarna Sacred Remedies"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Gemstones by Finger */}
        <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 shadow-sm space-y-3">
          <h4 className="font-serif text-sm font-bold text-amber-950 border-b border-amber-300/80 pb-2 flex items-center gap-2">
            <span>💎</span>
            <span>{isKn ? "ಬೆರಳುಗಳ ಪ್ರಕಾರ ಧರಿಸಬೇಕಾದ ರತ್ನಗಳು" : "Auspicious Gemstones by Finger"}</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div className="rounded-xl bg-white p-2.5 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-900">👉 ತರ್ಜನಿ (Index Finger - Guru):</span>
                <div className="text-[11px] text-amber-950 font-medium">ಪುಷ್ಯರಾಗ (Yellow Sapphire) / ಬಂಗಾರ</div>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">ಜ್ಞಾನ & ಅಧಿಕಾರ</span>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-900">👉 ಅನಾಮಿಕಾ (Ring Finger - Surya):</span>
                <div className="text-[11px] text-amber-950 font-medium">ಮಾಣಿಕ್ಯ (Ruby) / ತಾಮ್ರ ಅಥವಾ ಬಂಗಾರ</div>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">ಕೀರ್ತಿ & ಯಶಸ್ಸು</span>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-900">👉 ಕನಿಷ್ಠಿಕಾ (Little Finger - Budha):</span>
                <div className="text-[11px] text-amber-950 font-medium">ಪಚ್ಚೆ (Emerald) / ಬೆಳ್ಳಿ ಅಥವಾ ಪಂಚಲೋಹ</div>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">ವ್ಯಾಪಾರ & ಬುದ್ಧಿ</span>
            </div>
          </div>
        </div>

        {/* Card 2: Rudraksha Guidance */}
        <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 shadow-sm space-y-3">
          <h4 className="font-serif text-sm font-bold text-amber-950 border-b border-amber-300/80 pb-2 flex items-center gap-2">
            <span>📿</span>
            <span>{isKn ? "ಪವಿತ್ರ ರುದ್ರಾಕ್ಷಿ ಮಾರ್ಗದರ್ಶನ" : "Auspicious Rudraksha Guidance"}</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div className="rounded-xl bg-white p-2.5 border border-amber-200">
              <span className="font-bold text-amber-900">🌿 ೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5-Mukhi Rudraksha):</span>
              <p className="text-[11px] text-amber-950 font-medium mt-0.5">
                ಕಾಲಾಗ್ನಿ ರುದ್ರ ಸ್ವರೂಪ. ಮನಸ್ಸಿಗೆ ಶಾಂತಿ, ರಕ್ತದೊತ್ತಡ ನಿಯಂತ್ರಣ ಹಾಗೂ ಸರ್ವ ಪಾಪ ನಿವಾರಣೆ.
              </p>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-amber-200">
              <span className="font-bold text-amber-900">🌿 ೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (6-Mukhi Rudraksha):</span>
              <p className="text-[11px] text-amber-950 font-medium mt-0.5">
                ಕಾರ್ತಿಕೇಯ / ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವರೂಪ. ಏಕಾಗ್ರತೆ, ಧೈರ್ಯ ಹಾಗೂ ವ್ಯಾಪಾರ ವೃದ್ಧಿಗೆ ಅತ್ಯುನ್ನತ.
              </p>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-amber-200">
              <span className="font-bold text-amber-900">🌿 ೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (7-Mukhi Rudraksha):</span>
              <p className="text-[11px] text-amber-950 font-medium mt-0.5">
                ಮಹಾಲಕ್ಷ್ಮಿ ಸ್ವರೂಪ. ಆರ್ಥಿಕ ಮುಗ್ಗಟ್ಟು ನಿವಾರಿಸಿ ನಿರಂತರ ಧನಾಕರ್ಷಣೆಗೆ ಅತ್ಯುತ್ತಮ.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sacred Temple Remedies at Gokarna */}
      <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/70 p-5 shadow-sm space-y-3">
        <h4 className="font-serif text-sm font-bold text-emerald-950 border-b border-emerald-300 pb-2 flex items-center gap-2">
          <span>🪔</span>
          <span>{isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಸೇವಾ ಸಂಕಲ್ಪ" : "Sri Gokarna Mahabaleshwara Temple Seva Sankalpa"}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-white p-3 border border-emerald-200 space-y-1 shadow-sm">
            <div className="font-bold text-emerald-900">🥛 ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ</div>
            <p className="text-[11px] text-emerald-950">ಆತ್ಮ ಲಿಂಗಕ್ಕೆ ಹಾಲು ಮತ್ತು ಪಂಚಾಮೃತ ಅಭಿಷೇಕದಿಂದ ಸರ್ವ ದೋಷ ನಿವಾರಣೆ.</p>
          </div>

          <div className="rounded-xl bg-white p-3 border border-emerald-200 space-y-1 shadow-sm">
            <div className="font-bold text-emerald-900">🌿 ಬಿಲ್ವಾರ್ಚನೆ & ರುದ್ರಾಭಿಷೇಕ</div>
            <p className="text-[11px] text-emerald-950">ಏಕಾದಶ ರುದ್ರ ಪಠಣ ಹಾಗೂ ೧೦೮ ಬಿಲ್ವಪತ್ರೆ ಸಮರ್ಪಣೆಯಿಂದ ಆಯುರಾರೋಗ್ಯ ವೃದ್ಧಿ.</p>
          </div>

          <div className="rounded-xl bg-white p-3 border border-emerald-200 space-y-1 shadow-sm">
            <div className="font-bold text-emerald-900">🪔 ಮೃತ್ಯುಂಜಯ ಜಪ ಸಂಕಲ್ಪ</div>
            <p className="text-[11px] text-emerald-950">ಪ್ರತಿದಿನ 'ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ' ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ೧೦೮ ಬಾರಿ ಜಪಿಸಿ.</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
