import { useTranslation } from "react-i18next";
import { patrikaMetaForNakshatraIndex } from "../../core/nakshatraPatrikaMeta";
import type { KundliOutput, PlanetPosition } from "../../core/AstroTypes";
import { formatChartHouseNumber, patrikaNavamshaFromDegree } from "../../core/localeNumbers";
import type { TraditionalBaggonaPanchanga } from "../../core/TraditionalBaggonaEngine";

type Props = {
  kundli: KundliOutput;
  personName: string;
  parentsName: string;
  birthDateObj: Date;
  isDayBirth: boolean;
  birthTimeStr?: string;
  panchanga: TraditionalBaggonaPanchanga | null;
  gothra?: string;
};

// Zodiac Sign indices (0 = Aries, 11 = Pisces)
const RASHI_CELL_MAP = [
  11, 0, 1, 2,  // Pisces, Aries, Taurus, Gemini
  10, -1, -1, 3, // Aquarius, Center, Center, Cancer
  9, -1, -1, 4,  // Capricorn, Center, Center, Leo
  8, 7, 6, 5    // Sagittarius, Scorpio, Libra, Virgo
];

const SIGN_NAMES_KN = [
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ",
  "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
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
}) => {
  const { t } = useTranslation();
  
  // Placements
  const rashiGroups: Record<number, PlanetPosition[]> = {};
  kundli.planets.forEach((p) => {
    if (!rashiGroups[p.rashi.index]) rashiGroups[p.rashi.index] = [];
    rashiGroups[p.rashi.index].push(p);
  });
  const lagnaRashiId = kundli.lagnaRashi.index;

  const shakaYear = panchanga ? `೧೯${formatChartHouseNumber(panchanga.shakaYear % 100, "kn")}` : "೧೯೫೦"; // Simple fallback, proper locale string better
  const samvatsara = panchanga?.samvatsaraKn || "ಕೀಲಕ ಸಂವತ್ಸರೇ";
  const masa = panchanga?.masaKn || "ಚೈತ್ರ ಮಾಸೇ";
  const paksha = panchanga?.pakshaKn || "ಶುಕ್ಲ ಪಕ್ಷೇ";
  
  const tithi = panchanga ? `${panchanga.tithiKn} – ಘಟಿ ${formatChartHouseNumber(panchanga.tithiGhati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.tithiVighati, "kn")}` : "ದ್ವಿತೀಯಾ (೨) – ಘಟಿ ೧೪ ವಿ ೩೭";
  const vasara = panchanga ? `${panchanga.weekdayKn} – ರವಿ ನಕ್ಷತ್ರ ${panchanga.sunNakshatraKn}, ಘಟಿ ${panchanga.sunNakshatraGhati} ವಿ ${panchanga.sunNakshatraVighati}` : "ಚಂದ್ರ ವಾಸರೇ – ರವಿ ನಕ್ಷತ್ರ ಪೂರ್ವಾಭಾದ್ರ, ಘಟಿ 39 ವಿ 38";
  const nakshatra = panchanga ? `${panchanga.moonNakshatraKn} – ಚಂದ್ರ ನಕ್ಷತ್ರ, ಘಟಿ ${formatChartHouseNumber(panchanga.moonNakshatraGhati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.moonNakshatraVighati, "kn")}` : "ಆಶ್ಲೇಷ – ಚಂದ್ರ ನಕ್ಷತ್ರ, ಘಟಿ ೬೦ ವಿ ೦೦";
  const yoga = panchanga ? `${panchanga.yogaKn} – ಘಟಿ ${formatChartHouseNumber(panchanga.yogaGhati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.yogaVighati, "kn")}` : "ವಿಷ್ಕಂಭ – ಘಟಿ ೧೯ ವಿ ೪೭";
  const karana = panchanga ? `${panchanga.karanaKn} – ಘಟಿ ${formatChartHouseNumber(panchanga.karanaGhati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.karanaVighati, "kn")}` : "ಬಾಲವ – ಘಟಿ ೧೪ ವಿ ೪೯";
  
  const visha = panchanga ? `ಘಟಿ ${formatChartHouseNumber(panchanga.vishaGhati.ghati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.vishaGhati.vighati, "kn")}` : "ಘಟಿ ೩೦ ವಿ ೩೨";
  const amruta = panchanga ? `ಘಟಿ ${formatChartHouseNumber(panchanga.amrithaGhati.ghati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.amrithaGhati.vighati, "kn")}` : "ಘಟಿ ೪೯ ವಿ ೩೨";
  const diva = panchanga ? `ಘಟಿ ${formatChartHouseNumber(panchanga.divaGhati.ghati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.divaGhati.vighati, "kn")}` : "ಘಟಿ ೩೦ ವಿ ೫೫";
  const sankranti = panchanga ? `${panchanga.sankrantiSignKn} ಸಂಕ್ರಾಂತಿ, ಗತದಿನ ${formatChartHouseNumber(panchanga.sankrantiGataDina, "kn")}` : "ಮೀನ ಸಂಕ್ರಾಂತಿ, ಗತದಿನ ೧೩";
  const parama = panchanga ? `ಘಟಿ ${formatChartHouseNumber(panchanga.paramaGhati.ghati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.paramaGhati.vighati, "kn")}` : "ಘಟಿ ೬೪ ವಿ ೧೪";
  const aishya = panchanga ? `ಘಟಿ ${formatChartHouseNumber(panchanga.ashayaGhati.ghati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.ashayaGhati.vighati, "kn")}` : "ಘಟಿ ೧೦ ವಿ ೧೪";
  const gata = panchanga ? `ಘಟಿ ${formatChartHouseNumber(panchanga.ghatadina.ghati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.ghatadina.vighati, "kn")}` : "ಘಟಿ ೫೪ ವಿ ೦೦";
  const suryodayadi = panchanga ? `ಘಟಿ ${formatChartHouseNumber(panchanga.suryodhayadgata.ghati, "kn")} ವಿ ${formatChartHouseNumber(panchanga.suryodhayadgata.vighati, "kn")}` : "ಘಟಿ ೦೨ ವಿ ೪೪";
  
  let dashaBalance = "ಬುಧ ದಶಾವರ್ಷ ೧೫ ಮಾಸ ೮ ದಿನ ೧೩";
  if (panchanga?.dashaLord) {
    const pName = t(`planets.${panchanga.dashaLord}`, { lng: "kn" });
    dashaBalance = `${pName} ದಶಾವರ್ಷ ${formatChartHouseNumber(panchanga.dashaYears!, "kn")} ಮಾಸ ${formatChartHouseNumber(panchanga.dashaMonths!, "kn")} ದಿನ ${formatChartHouseNumber(panchanga.dashaDays!, "kn")}`;
  }
  
  const birthTimeLabel = isDayBirth ? "ಹಗಲು" : "ರಾತ್ರಿ";
  let h = birthDateObj.getHours();
  let m = birthDateObj.getMinutes();
  if (birthTimeStr && birthTimeStr.includes(":")) {
    const parts = birthTimeStr.split(":");
    h = parseInt(parts[0], 10) || h;
    m = parseInt(parts[1], 10) || m;
  }
  const displayH = h % 12 || 12;
  const displayHKn = formatChartHouseNumber(displayH, "kn");
  const displayMKn = formatChartHouseNumber(m, "kn").padStart(2, '೦');

  const moonDegree = kundli.planets.find((p) => p.name === "Moon")?.degree || 0;
  const pada = formatChartHouseNumber(kundli.moonPada, "kn"); // 1, 2, 3, or 4
  
  const moonNakshatra = kundli.planets.find((p) => p.name === "Moon")?.nakshatra.sanskrit || "";
  const moonRashiName = t(`rashis.${kundli.moonSign.sanskrit}`, { lng: "kn" });

  const lagnaAmsha = formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.ascendant), "kn");
  const maandi = kundli.maandi;
  const maandiAmsha = maandi ? formatChartHouseNumber(patrikaNavamshaFromDegree(maandi.degree), "kn") : "";

  const renderPlanetKn = (p: PlanetPosition) => {
    let base = t(`planets.${p.name}`, { lng: "kn" });
    if (p.isRetrograde) base += "(ವ)";
    const amsha = formatChartHouseNumber(patrikaNavamshaFromDegree(p.degree), "kn");
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
          <div style={{ flex: 1, fontSize: "14px", fontWeight: "bold", textAlign: "left", lineHeight: "1.4" }}>
            || ಶ್ರೀ ||<br/>
            ಜನನಿ ಜನ್ಮ ಸೌಖ್ಯಾನಾಂ<br/>ವರ್ಧನೀ ಕುಲ ಸಂಪದಾಂ
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "45px", height: "45px", borderRadius: "50%", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "bold", paddingBottom: "4px" }}>
              <span>ಓಂ</span>
            </div>
            <div style={{ fontSize: "16px", fontWeight: "bold", marginTop: "6px" }}>ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಜನನ ಪತ್ರಿಕೆ</div>
          </div>
          <div style={{ flex: 1, fontSize: "14px", fontWeight: "bold", textAlign: "right", lineHeight: "1.4" }}>
            || ಶ್ರೀ ||<br/>
            ಪದವೀ ಪೂರ್ವ ಪುಣ್ಯಾನಾಂ<br/>ಲಿಖ್ಯತೇ ಜನ್ಮ ಪತ್ರಿಕಾ
          </div>
        </div>

        {/* Panchanga Block */}
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
          <div><b>ಶಕವರ್ಷ:</b> {shakaYear} {samvatsara}</div>
          <div><b>ಮಾಸ:</b> {masa}</div>
          <div><b>ಪಕ್ಷ:</b> {paksha}</div>
          <div><b>ತಿಥಿ:</b> {tithi}</div>
          <div><b>ವಾರ:</b> {vasara}</div>
          <div><b>ನಕ್ಷತ್ರ:</b> {nakshatra}</div>
          <div><b>ಯೋಗ:</b> {yoga}</div>
          <div><b>ಕರಣ:</b> {karana}</div>
          <div><b>ಸಂಕ್ರಾಂತಿ:</b> {sankranti}</div>
          <div><b>ವಿಷಘಟಿ:</b> {visha}</div>
          <div><b>ಅಮೃತಘಟಿ:</b> {amruta}</div>
          <div><b>ದಿವಾ:</b> {diva}</div>
          <div><b>ಪರಮ:</b> {parama}</div>
          <div><b>ಆಷ್ಯಕಾಲ:</b> {aishya}</div>
          <div><b>ಗತಕಾಲ:</b> {gata}</div>
          
          <div style={{ flexBasis: "100%", borderTop: "1px dashed #ccc", paddingTop: "5px", marginTop: "2px" }}>
            <b>ಸೂರ್ಯೋದಯಾದಿ:</b> {suryodayadi} &nbsp;|&nbsp; 
            <b>ಜನ್ಮಕಾಲ:</b> ({birthTimeLabel} ಘಂಟೆ {displayHKn} ಮಿ {displayMKn}) &nbsp;|&nbsp; 
            <b>ದಶಾಸಿಲ್ಕು:</b> {dashaBalance}
            {parentsName ? <><br/>{parentsName} ಇವರ ಪುತ್ರ/ಪುತ್ರಿ.</> : null}
            {gothra ? ` ಗೋತ್ರ: ${gothra}` : null}
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
                      <div style={{ display: "flex" }}>
                        <span style={{ width: "80px" }}>ಹೆಸರು</span>
                        <span>: {personName || "________________"}</span>
                      </div>
                      <div style={{ display: "flex", fontSize: "14px" }}>
                        <span style={{ width: "80px" }}>ಗೋತ್ರ</span>
                        <span>: {gothra || "________________"}</span>
                      </div>
                      <div style={{ display: "flex" }}>
                        <span style={{ width: "80px" }}>ರಾಶಿ/ಪಾದ</span>
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
                    padding: "4px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <div style={{ position: "absolute", top: "4px", left: "4px", fontSize: "11px", color: "#000000" }}>
                    {SIGN_NAMES_KN[rashiId]}
                  </div>
                  {isLagna && (
                    <div style={{ fontWeight: "bold", color: "#000000", marginBottom: "2px", fontSize: "13px" }}>
                      ಲಗ್ನ({lagnaAmsha})
                    </div>
                  )}
                  {maandi && maandi.rashi.index === rashiId && (
                    <div style={{ color: "#000000", fontWeight: "bold", fontSize: "14px", lineHeight: "1.4" }}>
                      ಮಾಂದಿ({maandiAmsha})
                    </div>
                  )}
                  {planetsHere.map((p) => (
                    <div key={p.name} style={{ color: "#000000", fontWeight: "bold", fontSize: "14px", lineHeight: "1.4" }}>
                      {renderPlanetKn(p)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Details Section */}
        <div style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", margin: "15px 0", padding: "10px 0", display: "flex", justifyContent: "space-around", fontSize: "15px", fontWeight: "bold" }}>
          <div>ಯೋನಿ: <span>{moonNakshatra ? patrikaMetaForNakshatraIndex(kundli.planets.find(p => p.name === "Moon")?.nakshatra.index || 0).yoniKn : "-"}</span></div>
          <div>ಗಣ: <span>{moonNakshatra ? patrikaMetaForNakshatraIndex(kundli.planets.find(p => p.name === "Moon")?.nakshatra.index || 0).ganaKn : "-"}</span></div>
          <div>ನಾಡಿ: <span>{moonNakshatra ? patrikaMetaForNakshatraIndex(kundli.planets.find(p => p.name === "Moon")?.nakshatra.index || 0).nadiKn : "-"}</span></div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "15px", paddingTop: "5px", color: "#000" }}>
          <div style={{ fontWeight: "bold" }}>
            ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರು
          </div>
        </div>
      </div>
    </div>
  );
};
