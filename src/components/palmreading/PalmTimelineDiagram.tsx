import React from "react";
import type { LifeStageMilestones } from "../../features/palmreading/palmReadingEngine";

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
  milestones?: LifeMilestoneEvent[] | LifeStageMilestones;
};

export const PalmTimelineDiagram: React.FC<PalmTimelineDiagramProps> = ({
  personName = "ಶ್ರೀಯುತ ಭಕ್ತರು",
  lang = "kn",
  handSide = "right",
  milestones
}) => {
  const langKey = ["kn", "en", "hi", "te", "ta"].includes(lang) ? lang : "kn";
  const isKn = langKey === "kn";

  const tDict: Record<string, Record<string, string>> = {
    title: {
      kn: "ಆಯುಷ್ಯ ಹಾಗೂ ಜೀವನ ಘಟನಾವಳಿ ರೇಖಾ ಚಿತ್ರ",
      en: "Visual Life Event Timeline Diagram",
      hi: "जीवन घटनाक्रम एवं आयु रेखा चित्र",
      te: "జీవిత మైలురాళ్ళు & ఆయుష్షు రేఖా చిత్రం",
      ta: "வாழ்நாள் நிகழ்வுகள் & ஆயுள் காலக்கோடு வரைபடம்"
    },
    subtitle: {
      kn: `${personName} ಅವರ ಹಸ್ತ ರೇಖಾ ವಯೋಮಾನ ಗಣನಾವಳಿ`,
      en: `Life Event Milestones & Chironomic Age Timing for ${personName}`,
      hi: `${personName} का हस्त रेखा आयु कालक्रम विश्लेषण`,
      te: `${personName} గారి హస్త రేఖా వయస్సు లెక్కల వివరణ`,
      ta: `${personName} அவர்களின் கைரேகை வயது காலக்கோடு ஆய்வு`
    },
    lifeLine: {
      kn: "ಆಯುರ್ ರೇಖೆ (Life Line)",
      en: "Life Line (Ayur Rekha)",
      hi: "जीवन रेखा (Life Line)",
      te: "జీవిత రేఖ (Life Line)",
      ta: "ஆயுள் ரேகை (Life Line)"
    },
    headLine: {
      kn: "ಬುದ್ಧಿ ರೇಖೆ (Head Line)",
      en: "Head Line (Buddhi Rekha)",
      hi: "मस्तिष्क रेखा (Head Line)",
      te: "మస్తిష్క రేఖ (Head Line)",
      ta: "புத்தி ரேகை (Head Line)"
    },
    heartLine: {
      kn: "ಹೃದಯ ರೇಖೆ (Heart Line)",
      en: "Heart Line (Hridaya Rekha)",
      hi: "हृदय रेखा (Heart Line)",
      te: "హృదయ రేఖ (Heart Line)",
      ta: "இதய ரேகை (Heart Line)"
    },
    fateLine: {
      kn: "ಭಾಗ್ಯ ರೇಖೆ (Fate Line)",
      en: "Fate Line (Shani Rekha)",
      hi: "भाग्य रेखा (Fate Line)",
      te: "భాగ్య రేఖ (Fate Line)",
      ta: "விதி ரேகை (Fate Line)"
    },
    agePrefix: {
      kn: "ವಯಸ್ಸು",
      en: "Age",
      hi: "आयु",
      te: "వయస్సు",
      ta: "வயது"
    },
    ageYears: {
      kn: "ವರ್ಷ",
      en: "Years",
      hi: "वर्ष",
      te: "సం.",
      ta: "ஆண்டுகள்"
    },
    currentPhaseBadge: {
      kn: "ಪ್ರಸ್ತುತ ಹಂತ",
      en: "Current Phase",
      hi: "वर्तमान चरण",
      te: "ప్రస్తుత దశ",
      ta: "தற்போதைய நிலை"
    }
  };

  const getT = (k: string) => tDict[k]?.[langKey] || tDict[k]?.kn || "";

  // Parse milestones if LifeStageMilestones object is provided
  let eventsList: LifeMilestoneEvent[] = [];
  let estimatedDevoteeAge = 30;

  if (Array.isArray(milestones)) {
    eventsList = milestones;
  } else if (milestones && typeof milestones === "object" && "education" in milestones) {
    const ms = milestones as LifeStageMilestones;
    estimatedDevoteeAge = ms.estimatedAge || 30;

    // Parse marriage age
    const mMatch = (ms.marriage?.timingAgeWindowEn || "").match(/\b(\d{2})\b/);
    const marriageAge = mMatch ? parseInt(mMatch[1], 10) : 27;

    // Parse peak wealth age
    const wMatch = (ms.careerWealth?.peakWealthAgeEn || "").match(/\b(\d{2})\b/);
    const wealthAge = wMatch ? parseInt(wMatch[1], 10) : 35;

    eventsList = [
      {
        age: Math.min(23, Math.max(19, ms.estimatedAge < 24 ? ms.estimatedAge : 21)),
        label: {
          kn: "ವಿದ್ಯಾಭ್ಯಾಸ & ಬೌದ್ಧಿಕ ಪ್ರತಿಭೆ",
          en: "Education & Intellect Trait",
          hi: "शिक्षा एवं बौद्धिक विकास",
          te: "విద్య & మేధో సంపత్తి",
          ta: "கல்வி & அறிவுத்திறன்"
        },
        lineType: "head",
        yOffset: 25,
        description: {
          kn: ms.education?.intellectTraitKn || "ವಿದ್ಯಾರ್ಹತೆ ಪೂರ್ಣಗೊಂಡು ಪ್ರಥಮ ಉದ್ಯೋಗ ಪ್ರಾಪ್ತಿ ಯೋಗ.",
          en: ms.education?.intellectTraitEn || "Completion of education and intellectual breakthrough.",
          hi: ms.education?.intellectTraitEn || "शिक्षा की पूर्णता एवं बौद्धिक विकास।",
          te: ms.education?.intellectTraitKn || "విద్య & కెరీర్ ఆరంభం.",
          ta: ms.education?.intellectTraitEn || "கல்வி நிறைவு மற்றும் தொழில் துவக்கம்."
        }
      },
      {
        age: marriageAge,
        label: {
          kn: "ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ & ಗೃಹ ಯೋಗ",
          en: "Marriage & Domestic Union",
          hi: "वैवाहिक सुख एवं गृह योग",
          te: "దాంపత్య సుఖం & గృహ యోగం",
          ta: "திருமண பாக்கியம் & இல்லற யோகம்"
        },
        lineType: "heart",
        yOffset: 40,
        description: {
          kn: `${ms.marriage?.statusKn || ""} (${ms.marriage?.timingAgeWindowKn || ""}). ${ms.marriage?.spouseTraitKn || ""}`.trim(),
          en: `${ms.marriage?.statusEn || ""} (${ms.marriage?.timingAgeWindowEn || ""}). ${ms.marriage?.spouseTraitEn || ""}`.trim(),
          hi: `${ms.marriage?.statusEn || ""} (${ms.marriage?.timingAgeWindowEn || ""}).`,
          te: `${ms.marriage?.statusKn || ""} (${ms.marriage?.timingAgeWindowKn || ""}).`,
          ta: `${ms.marriage?.statusEn || ""} (${ms.marriage?.timingAgeWindowEn || ""}).`
        }
      },
      {
        age: wealthAge,
        label: {
          kn: "ವೃತ್ತಿ ಶಿಖರ & ಮಹಾಲಕ್ಷ್ಮೀ ಯೋಗ",
          en: "Career Zenith & Peak Wealth",
          hi: "करियर शिखर एवं विपुल धन लाभ",
          te: "కెరీర్ అత్యున్నత శిఖరం & ధన యోగం",
          ta: "தொழில் வெற்றி & உச்ச தன லாபம்"
        },
        lineType: "fate",
        yOffset: 55,
        description: {
          kn: `${ms.careerWealth?.peakWealthAgeKn || ""}. ${ms.careerWealth?.trajectoryKn || ""}`.trim(),
          en: `${ms.careerWealth?.peakWealthAgeEn || ""}. ${ms.careerWealth?.trajectoryEn || ""}`.trim(),
          hi: `${ms.careerWealth?.peakWealthAgeEn || ""}. ${ms.careerWealth?.trajectoryEn || ""}`.trim(),
          te: `${ms.careerWealth?.peakWealthAgeKn || ""}. ${ms.careerWealth?.trajectoryKn || ""}`.trim(),
          ta: `${ms.careerWealth?.peakWealthAgeEn || ""}. ${ms.careerWealth?.trajectoryEn || ""}`.trim()
        }
      },
      {
        age: Math.max(45, marriageAge + 17),
        label: {
          kn: "ಸಂತಾನ ಶ್ರೇಯಸ್ಸು & ಆಸ್ತಿ ವೃದ್ಧಿ",
          en: "Family Bliss & Property Growth",
          hi: "संतति सुख एवं अचल संपत्ति विस्तार",
          te: "సంతాన సౌభాగ్యం & స్థిరాస్తి వృద్ధి",
          ta: "சந்ததி நன்மை & சொத்து விருத்தி"
        },
        lineType: "sun",
        yOffset: 70,
        description: {
          kn: `${ms.children?.familyBlessingKn || ""} ${ms.children?.prospectsKn || ""}`.trim(),
          en: `${ms.children?.familyBlessingEn || ""} ${ms.children?.prospectsEn || ""}`.trim(),
          hi: `${ms.children?.familyBlessingEn || ""}`,
          te: `${ms.children?.familyBlessingKn || ""}`,
          ta: `${ms.children?.familyBlessingEn || ""}`
        }
      },
      {
        age: 62,
        label: {
          kn: "ಆಧ್ಯಾತ್ಮಿಕ ತೇಜಸ್ಸು & ಶತಾಯುಷ್ಯ",
          en: "Spiritual Wisdom & Longevity",
          hi: "आध्यात्मिक तेज एवं दीर्घायु शांति",
          te: "ఆధ్యాత్మిక తేజస్సు & దీర్ఘాయుష్షు",
          ta: "ஆன்மீக ஞானம் & நீண்ட ஆயுள்"
        },
        lineType: "life",
        yOffset: 85,
        description: {
          kn: "ದೀರ್ಘಾಯುಷ್ಯ ರೇಖಾ ಬಲ, ತೀರ್ಥಕ್ಷೇತ್ರ ಸೇವೆ ಹಾಗೂ ಅಖಂಡ ದೈವಿಕ ಶಾಂತಿ ಸಿದ್ಧಿ.",
          en: "Unbroken Life line vitality, pilgrimage fulfillment, and deep meditative inner peace.",
          hi: "सुदृढ़ जीवन रेखा, तीर्थाटन एवं अखंड आत्मिक शांति।",
          te: "దీర్ఘాయుష్షు రేఖా బలం, తీర్థయాత్రలు & దైవిక శాంతి.",
          ta: "நீண்ட ஆயுள் ரேகை பலம், புனித யாத்திரைகள் மற்றும் மன அமைதி."
        }
      }
    ];
  } else {
    // High-fidelity fallback catalog
    eventsList = [
      {
        age: 21,
        label: {
          kn: "ವಿದ್ಯಾಭ್ಯಾಸ & ಪ್ರಥಮ ಉದ್ಯೋಗ",
          en: "Education & Career Start",
          hi: "शिक्षा एवं प्रथम रोजगार",
          te: "విద్య & మొదటి ఉద్యోగం",
          ta: "கல்வி & முதல் வேலைவாய்ப்பு"
        },
        lineType: "head",
        yOffset: 25,
        description: {
          kn: "ವಿದ್ಯಾರ್ಹತೆ ಪೂರ್ಣಗೊಂಡು ಪ್ರಥಮ ಉದ್ಯೋಗ ಪ್ರಾಪ್ತಿ ಯೋಗ.",
          en: "Completion of education and successful career start.",
          hi: "शिक्षा की पूर्णता एवं सफल आजीविका आरंभ।",
          te: "విద్యాభ్యాసం పూర్తి & ఉద్యోగ ప్రాప్తి.",
          ta: "கல்வி நிறைவு மற்றும் உத்தியோக யோகம்."
        }
      },
      {
        age: 28,
        label: {
          kn: "ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ & ಗೃಹ ಯೋಗ",
          en: "Marriage & Family Bliss",
          hi: "वैवाहिक सुख एवं गृह योग",
          te: "దాంపత్య సుఖం & గృహ యోగం",
          ta: "திருமண பாக்கியம் & இல்லற யோகம்"
        },
        lineType: "heart",
        yOffset: 40,
        description: {
          kn: "ವಿವಾಹ ಭಾಗ್ಯ, ದಾಂಪತ್ಯ ಪ್ರವೇಶ ಹಾಗೂ ಗೃಹ ಸೌಭಾಗ್ಯ.",
          en: "Marriage luck, family harmony & home entry.",
          hi: "विवाह सौभाग्य, दांपत्य सुख एवं गृह प्रवेश योग।",
          te: "వివాహ ప్రాప్తి, దాంపత్యం & గృహ నిర్మాణం.",
          ta: "திருமண பாக்கியம், குடும்ப அமைதி & புதிய வீடு."
        }
      },
      {
        age: 35,
        label: {
          kn: "ಮಹತ್ವದ ಭಾಗ್ಯೋದಯ & ವ್ಯಾಪಾರ ಯಶಸ್ಸು",
          en: "Major Fortune & Business Zenith",
          hi: "व्यापार में सफलता एवं भाग्योदय",
          te: "వ్యాపార విజయం & గొప్ప భాగ్యోదయం",
          ta: "வணிக வெற்றி & பெரும் யோகம்"
        },
        lineType: "fate",
        yOffset: 55,
        description: {
          kn: "ಉದ್ಯೋಗದಲ್ಲಿ ಹಠಾತ್ ಬಡ್ತಿ, ಸ್ವಂತ ಉದ್ಯಮ ಜಯ ಹಾಗೂ ಧನ ಯೋಗ.",
          en: "Career promotion, business expansion & prosperity.",
          hi: "पदोन्नति, व्यावसायिक विस्तार एवं प्रचुर धन लाभ।",
          te: "ఉద్యోగోన్నతి, వ్యాపార విస్తరణ & ధన లాభం.",
          ta: "பதவி உயர்வு, தொழில் விரிவாக்கம் & செல்வம்."
        }
      },
      {
        age: 45,
        label: {
          kn: "ಆಸ್ತಿ ಸಂಪಾದನೆ & ಪೂರ್ಣ ಸುಖ",
          en: "Estate Acquisition & Prestige",
          hi: "संपत्ति अर्जन एवं सामाजिक प्रतिष्ठा",
          te: "ఆస్తి సమృద్ధి & సంపూర్ణ సుఖం",
          ta: "சொத்து சேர்க்கை & சமூக மரியாதை"
        },
        lineType: "sun",
        yOffset: 70,
        description: {
          kn: "ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ವಾಹನ ಯೋಗ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಗೌರವ.",
          en: "Real estate acquisition, luxury vehicle & social respect.",
          hi: "अचल संपत्ति क्रय, वाहन सुख एवं उच्च सामाजिक सम्मान।",
          te: "స్థిరాస్తి కొనుగోలు, వాహన యోగం & సమాజంలో గౌరవం.",
          ta: "நிலம் வாங்குதல், வாகன யோகம் & உயரிய மரியாதை."
        }
      },
      {
        age: 60,
        label: {
          kn: "ಆಧ್ಯಾತ್ಮಿಕ ತೇಜಸ್ಸು & ಪೂರ್ಣ ಶಾಂತಿ",
          en: "Spiritual Wisdom & Inner Peace",
          hi: "आध्यात्मिक तेज एवं मानसिक शांति",
          te: "ఆధ్యాత్మిక తేజస్సు & మనశ్శాంతి",
          ta: "ஆன்மீக ஞானம் & மன அமைதி"
        },
        lineType: "life",
        yOffset: 85,
        description: {
          kn: "ಸಂತಾನ ಶ್ರೇಯಸ್ಸು, ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ದೈವಿಕ ಶಾಂತಿ ಸಿದ್ಧಿ.",
          en: "Progeny bliss, robust health & spiritual peace.",
          hi: "संतान समृद्धि, दीर्घायु एवं आत्मिक शांति की प्राप्ति।",
          te: "సంతాన క్షేమం, దీర్ఘాయుష్షు & దైవిక ప్రశాంతత.",
          ta: "பிள்ளைகள் நலம், நீண்ட ஆயுள் & ஆன்மீக அமைதி."
        }
      }
    ];
  }

  // Find closest node to devotee's estimated age
  let closestIndex = 0;
  let minDiff = 999;
  eventsList.forEach((ev, idx) => {
    const diff = Math.abs(ev.age - estimatedDevoteeAge);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = idx;
    }
  });

  return (
    <div id="palm-timeline-diagram-container" className="rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-950 via-slate-950 to-amber-950 p-5 text-amber-100 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between border-b border-amber-500/40 pb-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-amber-200 flex items-center gap-2">
            <span>📜</span>
            <span>{getT("title")}</span>
          </h3>
          <p className="text-xs text-amber-300/80">
            {getT("subtitle")}
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
            <text x="200" y="275" fill="#FCD34D" fontSize="11" fontWeight="bold">{getT("lifeLine")}</text>

            {/* Head Line Path (Cyan Curved) */}
            <path d="M 230 110 Q 300 160 380 180" fill="none" stroke="#06B6D4" strokeWidth="3.5" strokeLinecap="round" />
            <text x="390" y="185" fill="#67E8F9" fontSize="11" fontWeight="bold">{getT("headLine")}</text>

            {/* Heart Line Path (Rose Curved) */}
            <path d="M 210 135 Q 310 120 410 110" fill="none" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round" />
            <text x="420" y="112" fill="#FDA4AF" fontSize="11" fontWeight="bold">{getT("heartLine")}</text>

            {/* Fate Line Path (Emerald Vertical) */}
            <path d="M 310 270 L 310 100" fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="6 3" />
            <text x="315" y="90" fill="#6EE7B7" fontSize="11" fontWeight="bold">{getT("fateLine")}</text>

            {/* Milestone Event Nodes */}
            {eventsList.map((ev, idx) => {
              const xPos = 120 + idx * 110;
              const yPos = 50 + (idx % 2 === 0 ? 30 : 180);
              const isCurrent = idx === closestIndex;

              return (
                <g key={idx} className="cursor-pointer transition transform hover:scale-110">
                  {/* Connector Line to Node */}
                  <line x1={xPos} y1={yPos} x2={xPos} y2="150" stroke={isCurrent ? "#FBBF24" : "#F59E0B"} strokeWidth={isCurrent ? 2.5 : 1.5} strokeDasharray="3 3" />
                  
                  {/* Current phase pulse aura */}
                  {isCurrent && (
                    <circle cx={xPos} cy={yPos} r="20" fill="none" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.8" />
                  )}

                  {/* Glowing Node Circle */}
                  <circle cx={xPos} cy={yPos} r="14" fill={isCurrent ? "#92400E" : "#78350F"} stroke={isCurrent ? "#FBBF24" : "#F59E0B"} strokeWidth={isCurrent ? 3.5 : 2.5} />
                  <text x={xPos} y={yPos + 4} textAnchor="middle" fill="#FEF3C7" fontSize="10" fontWeight="extrabold">
                    {ev.age}
                  </text>

                  {/* Text Badge */}
                  <rect x={xPos - 55} y={yPos + (idx % 2 === 0 ? -38 : 18)} width="110" height="26" rx="6" fill="#1E1B4B" stroke={isCurrent ? "#FBBF24" : "#818CF8"} strokeWidth={isCurrent ? 1.8 : 1} />
                  <text x={xPos} y={yPos + (idx % 2 === 0 ? -22 : 34)} textAnchor="middle" fill="#E0E7FF" fontSize="9.5" fontWeight="bold">
                    {ev.label[langKey] || ev.label.en || ev.label.kn}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Milestones Detailed Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-amber-500/30">
        {eventsList.map((ev, idx) => {
          const isCurrent = idx === closestIndex;

          return (
            <div
              key={idx}
              className={`rounded-xl border p-3 text-xs space-y-1 transition ${
                isCurrent
                  ? "border-amber-400 bg-amber-900/70 shadow-md ring-1 ring-amber-400/50"
                  : "border-amber-400/40 bg-amber-900/40"
              }`}
            >
              <div className="flex items-center justify-between font-bold text-amber-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-300 font-extrabold text-sm">
                    📍 {getT("agePrefix")} {ev.age} {getT("ageYears")}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.5 rounded uppercase">
                      {getT("currentPhaseBadge")}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">{ev.lineType} line</span>
              </div>
              <div className="font-bold text-amber-100">{ev.label[langKey] || ev.label.en || ev.label.kn}</div>
              <div className="text-[11px] text-amber-300/80 leading-relaxed font-medium">
                {ev.description[langKey] || ev.description.en || ev.description.kn}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PalmTimelineDiagram;
