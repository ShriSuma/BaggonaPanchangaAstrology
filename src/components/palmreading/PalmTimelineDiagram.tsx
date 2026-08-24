import React from "react";

export type LifeMilestoneEvent = {
  age: number;
  label: Record<string, string>;
  lineType: "life" | "head" | "heart" | "fate" | "sun";
  yOffset: number; // percentage down the line
  description: Record<string, string>;
};

export type PalmTimelineDiagramProps = {
  personName?: string;
  lang?: string;
  handSide?: string;
  milestones?: LifeMilestoneEvent[];
};

export const PalmTimelineDiagram: React.FC<PalmTimelineDiagramProps> = ({
  personName = "ಶ್ರೀಯುತ ಭಕ್ತರು",
  lang = "kn",
  handSide = "right",
  milestones
}) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  const defaultMilestones: LifeMilestoneEvent[] = [
    {
      age: 21,
      label: { kn: "ವಿದ್ಯಾಭ್ಯಾಸ & ಪ್ರಥಮ ಉದ್ಯೋಗ", en: "Education & First Career" },
      lineType: "head",
      yOffset: 25,
      description: { kn: "ವಿದ್ಯಾರ್ಹತೆ ಪೂರ್ಣಗೊಂಡು ಪ್ರಥಮ ಉದ್ಯೋಗ ಪ್ರಾಪ್ತಿ ಯೋಗ.", en: "Completion of education and career start." }
    },
    {
      age: 28,
      label: { kn: "ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ & ಗೃಹ ಯೋಗ", en: "Marriage & Home Realization" },
      lineType: "heart",
      yOffset: 40,
      description: { kn: "ವಿವಾಹ ಭಾಗ್ಯ, ದಾಂಪತ್ಯ ಪ್ರವೇಶ ಹಾಗೂ ಗೃಹ ಸೌಭಾಗ್ಯ.", en: "Marriage luck, family harmony & home entry." }
    },
    {
      age: 35,
      label: { kn: "ಮಹತ್ವದ ಭಾಗ್ಯೋದಯ & ವ್ಯಾಪಾರ ಯಶಸ್ಸು", en: "Major Fortune & Career Zenith" },
      lineType: "fate",
      yOffset: 55,
      description: { kn: "ಉದ್ಯೋಗದಲ್ಲಿ ಹಠಾತ್ ಬಡ್ತಿ, ಸ್ವಂತ ಉದ್ಯಮ ಜಯ ಹಾಗೂ ಧನ ಯೋಗ.", en: "Career promotion, business expansion & prosperity." }
    },
    {
      age: 45,
      label: { kn: "ಆಸ್ತಿ ಸಂಪಾದನೆ & ಪೂರ್ಣ ಸುಖ", en: "Property Acquisition & Fulfillment" },
      lineType: "sun",
      yOffset: 70,
      description: { kn: "ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ವಾಹನ ಯೋಗ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಗೌರವ.", en: "Real estate acquisition, luxury vehicle & social respect." }
    },
    {
      age: 60,
      label: { kn: "ಆಧ್ಯಾತ್ಮಿಕ ತೇಜಸ್ಸು & ಪೂರ್ಣ ಶಾಂತಿ", en: "Spiritual Enlightenment & Longevity" },
      lineType: "life",
      yOffset: 85,
      description: { kn: "ಸಂತಾನ ಶ್ರೇಯಸ್ಸು, ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ದೈವಿಕ ಶಾಂತಿ ಸಿದ್ಧಿ.", en: "Progeny bliss, great health & spiritual peace." }
    }
  ];

  const eventsList = milestones || defaultMilestones;

  return (
    <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-950 via-slate-950 to-amber-950 p-5 text-amber-100 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between border-b border-amber-500/40 pb-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
            <span>📜</span>
            <span>{isKn ? "ಆಯುಷ್ಯ ಹಾಗೂ ಜೀವನ ಘಟನಾವಳಿ ರೇಖಾ ಚಿತ್ರ" : "Visual Life Event Timeline Diagram"}</span>
          </h3>
          <p className="text-xs text-amber-300/80">
            {isKn ? `${personName} ಅವರ ಹಸ್ತ ರೇಖಾ ವಯೋಮಾನ ಗಣನಾವಳಿ` : `Life Event Milestones Timeline for ${personName}`}
          </p>
        </div>
        <div className="rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300">
          {handSide.toUpperCase()} HAND PALM
        </div>
      </div>

      {/* SVG Interactive Timeline Diagram */}
      <div className="relative w-full overflow-x-auto py-4">
        <div className="min-w-[650px] flex items-center justify-center">
          <svg width="650" height="320" viewBox="0 0 650 320" className="w-full h-auto">
            {/* Background Palm Contour Outline */}
            <path
              d="M 220 280 C 180 200, 160 140, 190 60 C 210 20, 240 20, 250 60 C 260 20, 290 20, 300 60 C 310 20, 340 20, 350 70 C 360 40, 390 40, 400 90 C 430 150, 440 220, 390 290 Z"
              fill="rgba(245, 158, 11, 0.05)"
              stroke="#D97706"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Life Line Path (Gold Curved) */}
            <path d="M 230 110 Q 210 180 280 260" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />
            <text x="200" y="275" fill="#FCD34D" fontSize="11" fontWeight="bold">ಆಯುರ್ ರೇಖೆ (Life Line)</text>

            {/* Head Line Path (Cyan Curved) */}
            <path d="M 230 110 Q 300 160 380 180" fill="none" stroke="#06B6D4" strokeWidth="3.5" strokeLinecap="round" />
            <text x="390" y="185" fill="#67E8F9" fontSize="11" fontWeight="bold">ಬುದ್ಧಿ ರೇಖೆ (Head Line)</text>

            {/* Heart Line Path (Rose Curved) */}
            <path d="M 210 135 Q 310 120 410 110" fill="none" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round" />
            <text x="420" y="112" fill="#FDA4AF" fontSize="11" fontWeight="bold">ಹೃದಯ ರೇಖೆ (Heart Line)</text>

            {/* Fate Line Path (Emerald Vertical) */}
            <path d="M 310 270 L 310 100" fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="6 3" />
            <text x="315" y="90" fill="#6EE7B7" fontSize="11" fontWeight="bold">ಭಾಗ್ಯ ರೇಖೆ (Fate Line)</text>

            {/* Milestone Event Nodes */}
            {eventsList.map((ev, idx) => {
              const xPos = 120 + idx * 110;
              const yPos = 50 + (idx % 2 === 0 ? 30 : 180);

              return (
                <g key={idx} className="cursor-pointer transition transform hover:scale-110">
                  {/* Connector Line to Node */}
                  <line x1={xPos} y1={yPos} x2={xPos} y2="150" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
                  
                  {/* Glowing Node Circle */}
                  <circle cx={xPos} cy={yPos} r="14" fill="#78350F" stroke="#F59E0B" strokeWidth="3" />
                  <text x={xPos} y={yPos + 4} textAnchor="middle" fill="#FEF3C7" fontSize="10" fontWeight="extrabold">
                    {ev.age}
                  </text>

                  {/* Text Badge */}
                  <rect x={xPos - 50} y={yPos + (idx % 2 === 0 ? -38 : 18)} width="100" height="26" rx="6" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1" />
                  <text x={xPos} y={yPos + (idx % 2 === 0 ? -22 : 34)} textAnchor="middle" fill="#E0E7FF" fontSize="9.5" fontWeight="bold">
                    {ev.label[isKn ? "kn" : "en"]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Milestones Detailed Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-amber-500/30">
        {eventsList.map((ev, idx) => (
          <div key={idx} className="rounded-xl border border-amber-400/40 bg-amber-900/40 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-amber-200">
              <span className="text-amber-300 font-extrabold text-sm">📍 ವಯಸ್ಸು {ev.age} ವರ್ಷ</span>
              <span className="text-[10px] text-emerald-400 uppercase">{ev.lineType} line</span>
            </div>
            <div className="font-bold text-amber-100">{ev.label[isKn ? "kn" : "en"]}</div>
            <div className="text-[11px] text-amber-300/80 leading-relaxed font-medium">{ev.description[isKn ? "kn" : "en"]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
