import { useTranslation } from "react-i18next";
import { patrikaMetaForNakshatraIndex } from "../../core/nakshatraPatrikaMeta";
import type { KundliOutput, PlanetPosition } from "../../core/AstroTypes";
import { formatChartHouseNumber, patrikaNavamshaFromDegree } from "../../core/localeNumbers";
import type { TraditionalBaggonaPanchanga } from "../../core/TraditionalBaggonaEngine";
import { localTranslations } from "../../utils/localTranslations";

type Props = {
  kundli: KundliOutput;
  personName: string;
  parentsName: string;
  birthDateObj: Date;
  isDayBirth: boolean;
  birthTimeStr?: string;
  panchanga: TraditionalBaggonaPanchanga | null;
  gothra?: string;
  pdfLanguage?: string;
  dynamicValues?: Record<string, string>;
};

// Zodiac Sign indices (0 = Aries, 11 = Pisces)
const RASHI_CELL_MAP = [
  11, 0, 1, 2,  // Pisces, Aries, Taurus, Gemini
  10, -1, -1, 3, // Aquarius, Center, Center, Cancer
  9, -1, -1, 4,  // Capricorn, Center, Center, Leo
  8, 7, 6, 5    // Sagittarius, Scorpio, Libra, Virgo
];

const RASHI_SANSKRIT_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const GokarnaKundaliTemplate: React.FC<Props> = ({
  kundli,
  personName,
  parentsName,
  birthDateObj,
  birthTimeStr,
  isDayBirth,
  panchanga,
  gothra,
  pdfLanguage = "kn",
  dynamicValues,
}) => {
  const { t } = useTranslation();
  
  // Placements
  const rashiGroups: Record<number, PlanetPosition[]> = {};
  kundli.planets.forEach((p) => {
    if (!rashiGroups[p.rashi.index]) rashiGroups[p.rashi.index] = [];
    rashiGroups[p.rashi.index].push(p);
  });
  const lagnaRashiId = kundli.lagnaRashi.index;

  const getLabel = (key: string) => {
    const localVal = localTranslations[pdfLanguage]?.[key];
    if (localVal) return localVal;
    return t(key, { lng: pdfLanguage });
  };
  
  const getValue = (key: string, fallback: string) => dynamicValues?.[key] || fallback;

  const shakaYear = panchanga ? `೧೯${formatChartHouseNumber(panchanga.shakaYear % 100, pdfLanguage)}` : "೧೯೫೦"; 
  const samvatsara = getValue("samvatsara", panchanga?.samvatsaraKn || "ಕೀಲಕ ಸಂವತ್ಸರೇ");
  const masa = getValue("masa", panchanga?.masaKn || "ಚೈತ್ರ ಮಾಸೇ");
  const paksha = getValue("paksha", panchanga?.pakshaKn || "ಶುಕ್ಲ ಪಕ್ಷೇ");
  
  const tithi = panchanga ? <>{getValue("tithi", panchanga.tithiKn)} – {getLabel("Ghati")} {formatChartHouseNumber(panchanga.tithiGhati, pdfLanguage)} {getLabel("Pale")} {formatChartHouseNumber(panchanga.tithiVighati, pdfLanguage)}</> : "";
  const vasara = panchanga ? <>{getValue("weekday", panchanga.weekdayKn)} – <b>{getLabel("Ravi Nakshatra")}</b> {getValue("sunNakshatra", panchanga.sunNakshatraKn)}, {getLabel("Ghati")} {formatChartHouseNumber(panchanga.sunNakshatraGhati, pdfLanguage)} {getLabel("Pale")} {formatChartHouseNumber(panchanga.sunNakshatraVighati, pdfLanguage)}</> : "";
  const nakshatra = panchanga ? <>{getValue("moonNakshatra", panchanga.moonNakshatraKn)}, {getLabel("Ghati")} {formatChartHouseNumber(panchanga.moonNakshatraGhati, pdfLanguage)} {getLabel("Pale")} {formatChartHouseNumber(panchanga.moonNakshatraVighati, pdfLanguage)}</> : "";
  const yoga = panchanga ? <>{getValue("yoga", panchanga.yogaKn)} – {getLabel("Ghati")} {formatChartHouseNumber(panchanga.yogaGhati, pdfLanguage)} {getLabel("Pale")} {formatChartHouseNumber(panchanga.yogaVighati, pdfLanguage)}</> : "";
  const karana = panchanga ? <>{getValue("karana", panchanga.karanaKn)} – {getLabel("Ghati")} {formatChartHouseNumber(panchanga.karanaGhati, pdfLanguage)} {getLabel("Pale")} {formatChartHouseNumber(panchanga.karanaVighati, pdfLanguage)}</> : "";
  
  const visha = panchanga ? <>{formatChartHouseNumber(panchanga.vishaGhati.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.vishaGhati.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const amruta = panchanga ? <>{formatChartHouseNumber(panchanga.amrithaGhati.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.amrithaGhati.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const diva = panchanga ? <>{formatChartHouseNumber(panchanga.divaGhati.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.divaGhati.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const sankranti = panchanga ? <>{getValue("sankrantiSign", panchanga.sankrantiSignKn)} {getLabel("Sankranti")}, {getLabel("Gata Dina")} {formatChartHouseNumber(panchanga.sankrantiGataDina, pdfLanguage)}</> : "";
  const parama = panchanga ? <>{formatChartHouseNumber(panchanga.paramaGhati.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.paramaGhati.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const aishya = panchanga ? <>{formatChartHouseNumber(panchanga.ashayaGhati.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.ashayaGhati.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const gata = panchanga ? <>{formatChartHouseNumber(panchanga.ghatadina.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.ghatadina.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const suryodayadi = panchanga ? <>{formatChartHouseNumber(panchanga.suryodhayadgata.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.suryodhayadgata.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  
  let dashaBalance = "";
  if (panchanga?.dashaLord) {
    const pName = getValue("dashaLord", getLabel(panchanga.dashaLord || ""));
    dashaBalance = `${pName} ${getLabel("Dasha Bhukti")} ${formatChartHouseNumber(panchanga.dashaYears!, pdfLanguage)} ${getLabel("Masa")} ${formatChartHouseNumber(panchanga.dashaMonths!, pdfLanguage)} ${getLabel("Dina")} ${formatChartHouseNumber(panchanga.dashaDays!, pdfLanguage)}`;
  }
  
  const birthTimeLabel = isDayBirth ? getLabel("Day") : getLabel("Night");
  let h = birthDateObj.getHours();
  let m = birthDateObj.getMinutes();
  if (birthTimeStr && birthTimeStr.includes(":")) {
    const parts = birthTimeStr.split(":");
    h = parseInt(parts[0], 10) || h;
    m = parseInt(parts[1], 10) || m;
  }
  const displayH = h % 12 || 12;
  const displayHKn = formatChartHouseNumber(displayH, pdfLanguage);
  const displayMKn = formatChartHouseNumber(m, pdfLanguage).padStart(2, pdfLanguage === "kn" ? '೦' : '0');

  const moonDegree = kundli.planets.find((p) => p.name === "Moon")?.degree || 0;
  const pada = formatChartHouseNumber(kundli.moonPada, pdfLanguage); 
  
  const moonNakshatra = kundli.planets.find((p) => p.name === "Moon")?.nakshatra.sanskrit || "";
  const moonRashiName = getValue("moonRashiName", getLabel(kundli.moonSign.sanskrit));

  const lagnaAmsha = formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.ascendant), pdfLanguage);
  const maandi = kundli.maandi;
  const maandiAmsha = maandi ? formatChartHouseNumber(patrikaNavamshaFromDegree(maandi.degree), pdfLanguage) : "";

  const renderPlanetKn = (p: PlanetPosition) => {
    let base = getValue(`planet_${p.name}`, t(`planets.${p.name}`, { lng: pdfLanguage }));
    if (p.isRetrograde) base += getLabel("Retrograde");
    const amsha = formatChartHouseNumber(patrikaNavamshaFromDegree(p.degree), pdfLanguage);
    return `${base}(${amsha})`;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily: "'Hind', sans-serif",
        color: "#000000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Outer Border (Ornate Style) */}
      <div
        style={{
          border: "6px double #000000",
          outline: "1px solid #000000",
          outlineOffset: "-4px",
          width: "100%",
          height: "100%",
          padding: "25px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Section (3-column layout) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <div style={{ flex: 1, fontSize: "14px", fontWeight: "bold", textAlign: "left", lineHeight: "1.4", whiteSpace: "pre-line" }}>
            {getLabel("Shloka 1").split(" ").slice(0, 3).join(" ")}<br/>
            {getLabel("Shloka 1").split(" ").slice(3, 6).join(" ")}<br/>
            {getLabel("Shloka 1").split(" ").slice(6).join(" ")}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "45px", height: "45px", borderRadius: "50%", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold", paddingBottom: "4px" }}>
              <span>{getLabel("Om")}</span>
            </div>
            <div style={{ fontSize: "16px", fontWeight: "bold", marginTop: "6px", textAlign: "center" }}>{getLabel("Baggona Patrika Title")}</div>
          </div>
          <div style={{ flex: 1, fontSize: "14px", fontWeight: "bold", textAlign: "right", lineHeight: "1.4", whiteSpace: "pre-line" }}>
            {getLabel("Shloka 2").split(" ").slice(0, 3).join(" ")}<br/>
            {getLabel("Shloka 2").split(" ").slice(3, 6).join(" ")}<br/>
            {getLabel("Shloka 2").split(" ").slice(6).join(" ")}
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          flexWrap: "wrap",
          gap: "8px 16px", 
          fontSize: "14px", 
          lineHeight: "1.6", 
          marginBottom: "15px",
          border: "2px solid #000",
          padding: "8px 12px",
          backgroundColor: "#ffffff",
          fontFamily: "'Hind', sans-serif"
        }}>
          <div><b>{getLabel("Shaka Varsha")}:</b> {shakaYear} {samvatsara}</div>
          <div><b>{getLabel("Masa")}:</b> {masa}</div>
          <div><b>{getLabel("Paksha")}:</b> {paksha}</div>
          <div><b>{getLabel("Tithi")}:</b> {tithi}</div>
          <div><b>{getLabel("Vasara")}:</b> {vasara}</div>
          <div><b>{getLabel("Chandra Nakshatra")}:</b> <b>{nakshatra}</b></div>
          <div><b>{getLabel("Yoga")}:</b> {yoga}</div>
          <div><b>{getLabel("Karana")}:</b> {karana}</div>
          <div><b>{getLabel("Sankranti")}:</b> {sankranti}</div>
          <div><b>{getLabel("Visha Ghati")}:</b> {visha}</div>
          <div><b>{getLabel("Amruta Ghati")}:</b> {amruta}</div>
          <div><b>{getLabel("Diva Ghati")}:</b> {diva}</div>
          <div><b>{getLabel("Parama Ghati")}:</b> {parama}</div>
          <div><b>{getLabel("Aishya Ghati")}:</b> {aishya}</div>
          <div><b>{getLabel("Gata Ghati")}:</b> {gata}</div>
          
          <div style={{ flexBasis: "100%", borderTop: "1px dashed #ccc", paddingTop: "5px", marginTop: "2px", lineHeight: "1.6" }}>
            <b>{getLabel("Sunrise")}:</b> {panchanga?.sunrise} &nbsp;|&nbsp; 
            <b>{getLabel("Sunset")}:</b> {panchanga?.sunset} &nbsp;|&nbsp; 
            <b>{getLabel("Suryodayadi")}:</b> {suryodayadi} &nbsp;|&nbsp; 
            <b>{getLabel("Janma Kala")}:</b> ({birthTimeLabel} {getLabel("Hour")} {displayHKn} {getLabel("Min")} {displayMKn}) <br/> 
            <b>{getLabel("Dasha Bhukti")}:</b> {dashaBalance}
            {parentsName ? <><br/>{parentsName}</> : null}
            {gothra ? ` | ${getLabel("Gotra")}: ${gothra}` : null}
          </div>
        </div>

        {/* Core Kundali Grid */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "stretch", flex: 1, margin: "10px 0" }}>
          {/* 4x4 Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              borderTop: "2px solid #000",
              borderLeft: "2px solid #000",
              width: "480px",
              height: "480px",
              backgroundColor: "transparent",
            }}
          >
            {RASHI_CELL_MAP.map((rashiId, idx) => {
              if (rashiId === -1) {
                // Center Merged Box
                if (idx === 5) {
                  return (
                    <div
                      key={`center-${idx}`}
                      style={{
                        gridColumn: "2 / span 2",
                        gridRow: "2 / span 2",
                        borderBottom: "2px solid #000",
                        borderRight: "2px solid #000",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: "20px",
                        fontSize: "17px",
                        fontWeight: "bold",
                        lineHeight: "2",
                      }}
                    >
                      <div style={{ display: "flex", whiteSpace: "nowrap" }}>
                        <span style={{ width: "95px" }}>{getLabel("Name")}</span>
                        <span>: {personName || "________________"}</span>
                      </div>
                      <div style={{ display: "flex", fontSize: "14px", marginTop: "4px", whiteSpace: "nowrap" }}>
                        <span style={{ width: "95px" }}>{getLabel("Gotra")}</span>
                        <span>: {gothra || "________________"}</span>
                      </div>
                      <div style={{ display: "flex", marginTop: "4px", whiteSpace: "nowrap" }}>
                        <span style={{ width: "95px" }}>{getLabel("Rashi/Pada")}</span>
                        <span>: {moonRashiName} / {pada}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }

              const isLagna = lagnaRashiId === rashiId;
              const planetsHere = rashiGroups[rashiId] || [];
              return (
                <div
                  key={`rashi-${rashiId}`}
                  style={{
                    borderBottom: "2px solid #000",
                    borderRight: "2px solid #000",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <div style={{ position: "absolute", top: "4px", left: "4px", fontSize: "11px", color: "#000000" }}>
                    {getValue(`sign_${rashiId}`, getLabel(RASHI_SANSKRIT_NAMES[rashiId]))}
                  </div>
                  {isLagna && (
                    <div style={{ color: "#000000", fontWeight: "bold", fontSize: "14px", lineHeight: "1.4" }}>
                      {getLabel("Lagna")}({lagnaAmsha})
                    </div>
                  )}
                  {planetsHere.map((p, i) => (
                    <div key={i} style={{ color: "#000000", fontWeight: "bold", fontSize: "14px", lineHeight: "1.4" }}>
                      {renderPlanetKn(p)}
                    </div>
                  ))}
                  {maandi && maandi.rashi.index === rashiId && (
                    <div style={{ color: "#000000", fontWeight: "bold", fontSize: "14px", lineHeight: "1.4" }}>
                      {getLabel("Maandi")}({maandiAmsha})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Details Section */}
        <div style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", margin: "15px 0", padding: "10px 0", display: "flex", justifyContent: "space-around", fontSize: "15px", fontWeight: "bold" }}>
          <div>{getValue("label_yoni", "ಯೋನಿ")}: <span>{moonNakshatra ? getValue("yoni", patrikaMetaForNakshatraIndex(kundli.planets.find(p => p.name === "Moon")?.nakshatra.index || 0).yoniKn) : "-"}</span></div>
          <div>{getValue("label_gana", "ಗಣ")}: <span>{moonNakshatra ? getValue("gana", patrikaMetaForNakshatraIndex(kundli.planets.find(p => p.name === "Moon")?.nakshatra.index || 0).ganaKn) : "-"}</span></div>
          <div>{getValue("label_nadi", "ನಾಡಿ")}: <span>{moonNakshatra ? getValue("nadi", patrikaMetaForNakshatraIndex(kundli.planets.find(p => p.name === "Moon")?.nakshatra.index || 0).nadiKn) : "-"}</span></div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "15px", paddingTop: "5px", color: "#000" }}>
          <div style={{ fontWeight: "bold" }}>
            {getValue("label_footer", "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರು")}
          </div>
        </div>
      </div>
    </div>
  );
};
