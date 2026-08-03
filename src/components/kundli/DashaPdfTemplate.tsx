import { forwardRef } from "react";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { generateDashaTimeline, generateBhuktisInMahadasha } from "../../core/DashaBhuktiEngine";
import { PlanetName } from "../../core/AstroTypes";
import { format, parseISO, addDays, differenceInDays } from "date-fns";
import { useTranslation } from "react-i18next";

type Props = {
  session: KundliViewerSession;
  maxAge?: number;
};

const planetBarColor: Record<PlanetName, string> = {
  [PlanetName.Sun]: "bg-amber-500",
  [PlanetName.Moon]: "bg-slate-400",
  [PlanetName.Mars]: "bg-red-600",
  [PlanetName.Mercury]: "bg-emerald-500",
  [PlanetName.Jupiter]: "bg-orange-400",
  [PlanetName.Venus]: "bg-pink-400",
  [PlanetName.Saturn]: "bg-indigo-700",
  [PlanetName.Rahu]: "bg-violet-600",
  [PlanetName.Ketu]: "bg-teal-600",
};

const planetColors: Record<PlanetName, { bg: string; border: string; text: string }> = {
  [PlanetName.Sun]: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900" },
  [PlanetName.Moon]: { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-900" },
  [PlanetName.Mars]: { bg: "bg-red-50", border: "border-red-200", text: "text-red-900" },
  [PlanetName.Mercury]: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900" },
  [PlanetName.Jupiter]: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-900" },
  [PlanetName.Venus]: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-900" },
  [PlanetName.Saturn]: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-900" },
  [PlanetName.Rahu]: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-900" },
  [PlanetName.Ketu]: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-900" },
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

export const DashaPdfTemplate = forwardRef<HTMLDivElement, Props>(({ session, maxAge = 120 }, ref) => {
  const { t } = useTranslation();
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
            || ಶ್ರೀ ||<br/>
            ಜನನಿ ಜನ್ಮ ಸೌಖ್ಯಾನಾಂ<br/>ವರ್ಧನೀ ಕುಲ ಸಂಪದಾಂ
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "45px", height: "45px", borderRadius: "50%", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold", paddingBottom: "4px" }}>
              <span>ಓಂ</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "8px" }}>ವಿಂಶೋತ್ತರಿ ದಶಾ ಭುಕ್ತಿ</div>
          </div>
          <div style={{ flex: 1, fontSize: "14px", fontWeight: "bold", textAlign: "right", lineHeight: "1.4" }}>
            || ಶ್ರೀ ||<br/>
            ಪದವೀ ಪೂರ್ವ ಪುಣ್ಯಾನಾಂ<br/>ಲಿಖ್ಯತೇ ಜನ್ಮ ಪತ್ರಿಕಾ
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
          <div>ಹೆಸರು: {session.input.name}</div>
          <div>ಜನ್ಮ ದಿನಾಂಕ: {formatDateFromAge(birthDateStr, 0)}</div>
          <div>ಲಗ್ನ: {t(`rashis.${session.result.lagnaRashi?.sanskrit}`, session.result.lagnaRashi?.english)}</div>
          <div>ರಾಶಿ: {t(`rashis.${session.result.moonSign?.sanskrit}`, session.result.moonSign?.english)}</div>
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
                    {t(`planets.${maha.planet}`)} {t("kundli.dashaMaha", "Mahadasha")}
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
                          {t(`planets.${bhukti.planet}`)} ಭುಕ್ತಿ
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
          <div style={{ fontWeight: "bold" }}>ಶುಭಮಸ್ತು (Shubhamastu)</div>
          <div style={{ fontSize: "14px", marginTop: "5px" }}>ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರು</div>
        </div>
      </div>
    </div>
  );
});

DashaPdfTemplate.displayName = "DashaPdfTemplate";
