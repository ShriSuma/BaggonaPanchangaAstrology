import { forwardRef } from "react";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { generateDashaTimeline, generateBhuktisInMahadasha } from "../../core/DashaBhuktiEngine";
import { PlanetName } from "../../core/AstroTypes";
import { format, parseISO, addDays, differenceInDays } from "date-fns";
import { RASHI_L5, pick } from "../../features/seva/sevaLocale";

type Props = {
  session: KundliViewerSession;
  maxAge?: number;
  pdfLanguage?: string;
};

type LangCode = "kn" | "en" | "te" | "ta" | "hi";

const DASHA_PDF_I18N: Record<LangCode, {
  shlokaLeft1: string;
  shlokaLeft2: string;
  shlokaLeft3: string;
  shlokaRight1: string;
  shlokaRight2: string;
  shlokaRight3: string;
  om: string;
  title: string;
  nameLabel: string;
  dobLabel: string;
  lagnaLabel: string;
  rashiLabel: string;
  mahadasha: string;
  bhukti: string;
  shubhamastu: string;
  footerAuthor: string;
}> = {
  kn: {
    shlokaLeft1: "|| ಶ್ರೀ ||",
    shlokaLeft2: "ಜನನಿ ಜನ್ಮ ಸೌಖ್ಯಾನಾಂ",
    shlokaLeft3: "ವರ್ಧನೀ ಕುಲ ಸಂಪದಾಂ",
    shlokaRight1: "|| ಶ್ರೀ ||",
    shlokaRight2: "ಪದವೀ ಪೂರ್ವ ಪುಣ್ಯಾನಾಂ",
    shlokaRight3: "ಲಿಖ್ಯತೇ ಜನ್ಮ ಪತ್ರಿಕಾ",
    om: "ಓಂ",
    title: "ವಿಂಶೋತ್ತರಿ ದಶಾ ಭುಕ್ತಿ",
    nameLabel: "ಹೆಸರು:",
    dobLabel: "ಜನ್ಮ ದಿನಾಂಕ:",
    lagnaLabel: "ಲಗ್ನ:",
    rashiLabel: "ರಾಶಿ:",
    mahadasha: "ಮಹಾದಶೆ",
    bhukti: "ಭುಕ್ತಿ",
    shubhamastu: "ಶುಭಮಸ್ತು (Shubhamastu)",
    footerAuthor: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರು",
  },
  en: {
    shlokaLeft1: "|| Sri ||",
    shlokaLeft2: "Janani Janma Saukhyanam",
    shlokaLeft3: "Vardhani Kula Sampadam",
    shlokaRight1: "|| Sri ||",
    shlokaRight2: "Padavi Poorva Punyanam",
    shlokaRight3: "Likhyate Janma Patrika",
    om: "Om",
    title: "Vimshottari Dasha Bhukti",
    nameLabel: "Name:",
    dobLabel: "Date of Birth:",
    lagnaLabel: "Lagna:",
    rashiLabel: "Rashi:",
    mahadasha: "Mahadasha",
    bhukti: "Bhukti",
    shubhamastu: "Shubhamastu",
    footerAuthor: "Baggona Panchanga Author",
  },
  te: {
    shlokaLeft1: "|| శ్రీ ||",
    shlokaLeft2: "జననీ జన్మ సౌఖ్యానాం",
    shlokaLeft3: "వర్ధనీ కుల సంపదాం",
    shlokaRight1: "|| శ్రీ ||",
    shlokaRight2: "పదవీ పూర్వ పుణ్యానాం",
    shlokaRight3: "లిఖ్యతే జన్మ పత్రికా",
    om: "ఓం",
    title: "వింశోత్తరి దశ భుక్తి",
    nameLabel: "పేరు:",
    dobLabel: "జనన తేదీ:",
    lagnaLabel: "లగ్నం:",
    rashiLabel: "రాశి:",
    mahadasha: "మహాదశ",
    bhukti: "భుక్తి",
    shubhamastu: "శుభమస్తు (Shubhamastu)",
    footerAuthor: "బగ్గోణ పంచాంగ కర్తలు",
  },
  ta: {
    shlokaLeft1: "|| ஸ்ரீ ||",
    shlokaLeft2: "ஜனனி ஜன்ம சௌக்யானாம்",
    shlokaLeft3: "வர்தனி குல சம்பதாம்",
    shlokaRight1: "|| ஸ்ரீ ||",
    shlokaRight2: "பதவி பூர்வ புண்யானாம்",
    shlokaRight3: "லிக்யதே ஜன்ம பத்ரிகா",
    om: "ஓம்",
    title: "விம்சோத்தரி தசை புக்தி",
    nameLabel: "பெயர்:",
    dobLabel: "பிறந்த தேதி:",
    lagnaLabel: "லக்னம்:",
    rashiLabel: "ராசி:",
    mahadasha: "மகா தசை",
    bhukti: "புக்தி",
    shubhamastu: "சுபமஸ்து (Shubhamastu)",
    footerAuthor: "பக்கோன பஞ்சாங்கம் கர்த்தா",
  },
  hi: {
    shlokaLeft1: "|| श्री ||",
    shlokaLeft2: "जननी जन्म सौख्यानां",
    shlokaLeft3: "वर्धनी कुल संपदां",
    shlokaRight1: "|| श्री ||",
    shlokaRight2: "पदवी पूर्व पुण्यानां",
    shlokaRight3: "लिख्यते जन्म पत्रिका",
    om: "ॐ",
    title: "विंशोत्तरी दशा भुक्ति",
    nameLabel: "नाम:",
    dobLabel: "जन्म तिथि:",
    lagnaLabel: "लग्न:",
    rashiLabel: "राशि:",
    mahadasha: "महादशा",
    bhukti: "भुक्ति",
    shubhamastu: "शुभमस्तु (Shubhamastu)",
    footerAuthor: "बग्गोण पंचांग कर्ता",
  },
};

const PLANET_NAMES_L5: Record<PlanetName, Record<LangCode, string>> = {
  [PlanetName.Sun]: { en: "Sun", kn: "ರವಿ", te: "సూర్య", ta: "சூரியன்", hi: "सूर्य" },
  [PlanetName.Moon]: { en: "Moon", kn: "ಚಂದ್ರ", te: "చంద్ర", ta: "சந்திரன்", hi: "चंद्र" },
  [PlanetName.Mars]: { en: "Mars", kn: "ಕುಜ", te: "కుజ", ta: "செவ்வாய்", hi: "मंगल" },
  [PlanetName.Mercury]: { en: "Mercury", kn: "ಬುಧ", te: "బుధ", ta: "புதன்", hi: "बुध" },
  [PlanetName.Jupiter]: { en: "Jupiter", kn: "ಗುರು", te: "గురు", ta: "குரு", hi: "गुरु" },
  [PlanetName.Venus]: { en: "Venus", kn: "ಶುಕ್ರ", te: "శుక్ర", ta: "சுக்கிரன்", hi: "शुक्र" },
  [PlanetName.Saturn]: { en: "Saturn", kn: "ಶನಿ", te: "శని", ta: "సని", hi: "शनि" },
  [PlanetName.Rahu]: { en: "Rahu", kn: "ರಾಹು", te: "రాహు", ta: "ராகு", hi: "राहु" },
  [PlanetName.Ketu]: { en: "Ketu", kn: "ಕೇತು", te: "కేతు", ta: "கேது", hi: "केतु" },
};

function formatDateFromAge(birthDateStr: string, ageInYears: number): string {
  try {
    const dob = parseISO(birthDateStr);
    const daysToAdd = Math.round(ageInYears * 365.2425);
    const targetDate = addDays(dob, daysToAdd);
    return format(targetDate, "dd MMM yyyy");
  } catch {
    return `${ageInYears.toFixed(2)} Yrs`;
  }
}

export const DashaPdfTemplate = forwardRef<HTMLDivElement, Props>(({ session, maxAge = 120, pdfLanguage = "kn" }, ref) => {
  const langKey: LangCode = (pdfLanguage || "kn").split("-")[0] as LangCode;
  const validLang: LangCode = ["kn", "en", "te", "ta", "hi"].includes(langKey) ? langKey : "kn";

  const labels = DASHA_PDF_I18N[validLang];

  const lagnaName = session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], validLang) : "";
  const moonSignName = session.result.moonSign ? pick(RASHI_L5[session.result.moonSign.index], validLang) : "";

  const getPlanetName = (p: PlanetName): string => {
    return PLANET_NAMES_L5[p]?.[validLang] || p;
  };

  const timeline = generateDashaTimeline(session.result, maxAge);
  const birthDateStr = session.input.birthDate;

  // Calculate current age
  const today = new Date();
  const dob = parseISO(birthDateStr);
  const currentAgeInYears = differenceInDays(today, dob) / 365.2425;

  // Filter timeline: keep only Mahadashas that end after current age
  const futureTimeline = timeline.filter(maha => maha.endAge > currentAgeInYears);

  return (
    <div 
      ref={ref} 
      style={{
        width: "210mm",
        backgroundColor: "#ffffff",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily: "'Hind', sans-serif",
        color: "#000000",
      }}
    >
      {/* Outer Border (Ornate Style like Jataka) */}
      <div
        style={{
          border: "6px double #000000",
          outline: "1px solid #000000",
          outlineOffset: "-4px",
          width: "100%",
          padding: "25px",
          boxSizing: "border-box",
        }}
      >
        {/* Header Section with Shlokas */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ flex: 1, fontSize: "14px", fontWeight: "bold", textAlign: "left", lineHeight: "1.4" }}>
            {labels.shlokaLeft1}<br/>
            {labels.shlokaLeft2}<br/>
            {labels.shlokaLeft3}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "45px", height: "45px", borderRadius: "50%", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold", paddingBottom: "4px" }}>
              <span>{labels.om}</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "8px" }}>{labels.title}</div>
          </div>
          <div style={{ flex: 1, fontSize: "14px", fontWeight: "bold", textAlign: "right", lineHeight: "1.4" }}>
            {labels.shlokaRight1}<br/>
            {labels.shlokaRight2}<br/>
            {labels.shlokaRight3}
          </div>
        </div>

        {/* Basic Info Block */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "2px solid #000",
          borderBottom: "2px solid #000",
          padding: "10px 15px",
          marginBottom: "25px",
          fontSize: "15px",
          fontWeight: "bold"
        }}>
          <div>{labels.nameLabel} {session.input.name}</div>
          <div>{labels.dobLabel} {formatDateFromAge(birthDateStr, 0)}</div>
          <div>{labels.lagnaLabel} {lagnaName}</div>
          <div>{labels.rashiLabel} {moonSignName}</div>
        </div>

        {/* Tabular Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {futureTimeline.map((maha) => {
            const bhuktis = generateBhuktisInMahadasha(maha.planet, maha.durationYears);
            
            let currentAge = maha.startAge;
            const futureBhuktis = bhuktis.map(bhukti => {
              const bStart = currentAge;
              const bEnd = currentAge + bhukti.years;
              currentAge = bEnd;
              return { ...bhukti, bStart, bEnd };
            }).filter(b => b.bEnd > currentAgeInYears);

            if (futureBhuktis.length === 0) return null;

            return (
              <div 
                key={`${maha.planet}-${maha.startAge}`}
                style={{ 
                  breakInside: 'avoid',
                  border: "1px solid #000",
                  padding: "15px",
                }}
              >
                {/* Mahadasha Row */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  borderBottom: "2px dashed #000",
                  paddingBottom: "10px",
                  marginBottom: "10px"
                }}>
                  <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                    {getPlanetName(maha.planet)} {labels.mahadasha}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {formatDateFromAge(birthDateStr, maha.startAge)} — {formatDateFromAge(birthDateStr, maha.endAge)}
                  </div>
                </div>

                {/* Bhukti List */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  columnGap: "30px",
                  rowGap: "8px"
                }}>
                  {futureBhuktis.map((bhukti, i) => {
                    const { bStart, bEnd } = bhukti;

                    return (
                      <div 
                        key={`${bhukti.planet}-${i}`} 
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          borderBottom: "1px solid #eee",
                          paddingBottom: "4px"
                        }}
                      >
                        <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                          {getPlanetName(bhukti.planet)} {labels.bhukti}
                        </div>
                        <div style={{ fontSize: "14px", fontFamily: "monospace", fontWeight: "bold" }}>
                          {formatDateFromAge(birthDateStr, Math.max(bStart, currentAgeInYears))} - {formatDateFromAge(birthDateStr, bEnd)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "16px", marginTop: "30px", borderTop: "2px solid #000", paddingTop: "10px" }}>
          <div style={{ fontWeight: "bold" }}>{labels.shubhamastu}</div>
          <div style={{ fontSize: "14px", marginTop: "5px" }}>{labels.footerAuthor}</div>
        </div>
      </div>
    </div>
  );
});

DashaPdfTemplate.displayName = "DashaPdfTemplate";

