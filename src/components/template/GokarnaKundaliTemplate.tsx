import { useTranslation } from "react-i18next";
import { patrikaMetaForNakshatraIndex } from "../../core/nakshatraPatrikaMeta";
import type { KundliOutput, PlanetPosition } from "../../core/AstroTypes";
import { formatChartHouseNumber, patrikaNavamshaFromDegree } from "../../core/localeNumbers";
import type { TraditionalBaggonaPanchanga } from "../../core/TraditionalBaggonaEngine";
import { localTranslations } from "../../utils/localTranslations";
import { NAKSHATRA_L5, RASHI_L5, pick, getTimeOfDayLabel } from "../../features/seva/sevaLocale";
import { GOTRA_OPTIONS } from "../../data/gotras";

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

const GANA_L5: Record<string, Record<string, string>> = {
  Deva: { kn: "ದೇವ", hi: "देव", te: "దేవ", ta: "தேவ", en: "Deva" },
  Manushya: { kn: "ಮಾನವ", hi: "मानव", te: "మానవ", ta: "மானிட", en: "Manushya" },
  Rakshasa: { kn: "ರಾಕ್ಷಸ", hi: "राक्षस", te: "రాక్షస", ta: "ராட்சச", en: "Rakshasa" }
};

const NADI_L5: Record<string, Record<string, string>> = {
  Adi: { kn: "ಆದಿ", hi: "आदि", te: "ఆది", ta: "ஆதி", en: "Adi" },
  Madhya: { kn: "ಮಧ್ಯ", hi: "मध्य", te: "మధ్య", ta: "மத்ய", en: "Madhya" },
  Antya: { kn: "ಅಂತ್ಯ", hi: "अन्त्य", te: "అంత్య", ta: "அந்திய", en: "Antya" }
};

const YONI_L5: Record<string, Record<string, string>> = {
  Horse: { kn: "ಅಶ್ವ", hi: "अश्व", te: "అశ్వ", ta: "அசுவம்", en: "Horse" },
  Elephant: { kn: "ಗಜ", hi: "गज", te: "గజ", ta: "யானை", en: "Elephant" },
  Goat: { kn: "ಮೇಷ", hi: "मेष", te: "మేష", ta: "ஆடு", en: "Goat" },
  Serpent: { kn: "ಸರ್ಪ", hi: "सर्प", te: "సర్ప", ta: "பாம்பு", en: "Serpent" },
  Dog: { kn: "ಶ್ವಾನ", hi: "श्वान", te: "శ్వాన", ta: "நாய்", en: "Dog" },
  Cat: { kn: "ಮಾರ್ಜಾಲ", hi: "मार्जार", te: "మార్జాల", ta: "பூனை", en: "Cat" },
  Rat: { kn: "ಮೂಷಕ", hi: "मूषक", te: "మూషక", ta: "எலி", en: "Rat" },
  Cow: { kn: "ಗೌ", hi: "गौ", te: "గోవు", ta: "பசு", en: "Cow" },
  Buffalo: { kn: "ಮಹಿಷ", hi: "महिष", te: "మహిష", ta: "எருமை", en: "Buffalo" },
  Tiger: { kn: "ವ್ಯಾಘ್ರ", hi: "व्याघ्र", te: "వ్యాఘ్ర", ta: "புலி", en: "Tiger" },
  Deer: { kn: "ಹರಿಣ", hi: "हरिण", te: "హరిణ", ta: "மான்", en: "Deer" },
  Monkey: { kn: "ವಾನರ", hi: "वानर", te: "వానర", ta: "குரங்கு", en: "Monkey" },
  Mongoose: { kn: "ನಕುಲ", hi: "नकुल", te: "నకులం", ta: "கீரி", en: "Mongoose" },
  Lion: { kn: "ಸಿಂಹ", hi: "सिंह", te: "సింహం", ta: "சிங்கம்", en: "Lion" }
};

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

  const getFontFamily = (langCode: string): string => {
    switch (langCode) {
      case "kn":
        return `'Tiro Kannada', 'Noto Serif Kannada', 'Noto Sans Kannada', serif, sans-serif`;
      case "te":
        return `'Noto Sans Telugu', serif, sans-serif`;
      case "ta":
        return `'Noto Sans Tamil', serif, sans-serif`;
      case "hi":
        return `'Noto Sans Devanagari', serif, sans-serif`;
      case "en":
      default:
        return `'Outfit', 'Cinzel', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    }
  };
  const activeFontFamily = getFontFamily(pdfLanguage);
  
  const getValue = (key: string, fallback: string) => dynamicValues?.[key] || fallback;

  const shakaYear = panchanga 
    ? formatChartHouseNumber(panchanga.shakaYear, pdfLanguage) 
    : formatChartHouseNumber(1946, pdfLanguage); 
  const defaultSamvatsara = pdfLanguage === "kn" ? "ಕೀಲಕ ಸಂವತ್ಸರೇ" : pdfLanguage === "hi" ? "कीलक संवत्सरे" : pdfLanguage === "te" ? "కీలక సంవత్సరే" : pdfLanguage === "ta" ? "கீலக வத்ஸரே" : "Keelaka Samvatsare";
  const defaultMasa = pdfLanguage === "kn" ? "ಚೈತ್ರ ಮಾಸೇ" : pdfLanguage === "hi" ? "चैत्र मासे" : pdfLanguage === "te" ? "చైత్ర మాసే" : pdfLanguage === "ta" ? "சித்திரை மாஸே" : "Chaitra Mase";
  const defaultPaksha = pdfLanguage === "kn" ? "ಶುಕ್ಲ ಪಕ್ಷೇ" : pdfLanguage === "hi" ? "शुक्ल पक्षे" : pdfLanguage === "te" ? "శుక్ల పక్షే" : pdfLanguage === "ta" ? "சுக்ல பக்ஷே" : "Shukla Pakshe";

  const samvatsara = getValue("samvatsara", (panchanga ? (pdfLanguage === "kn" ? panchanga.samvatsaraKn : (panchanga.samvatsara || panchanga.samvatsaraKn)) : defaultSamvatsara));
  const masa = getValue("masa", (panchanga ? (pdfLanguage === "kn" ? panchanga.masaKn : (panchanga.masa || panchanga.masaKn)) : defaultMasa));
  const paksha = getValue("paksha", (panchanga ? (pdfLanguage === "kn" ? panchanga.pakshaKn : (panchanga.paksha || panchanga.pakshaKn)) : defaultPaksha));
  
  const defaultTithi = panchanga ? (pdfLanguage === "kn" ? panchanga.tithiKn : (panchanga.tithi || panchanga.tithiKn)) : "";
  const tithi = panchanga ? <>{getValue("tithi", defaultTithi)} – {getLabel("Ghati")} {formatChartHouseNumber(panchanga.tithiGhati, pdfLanguage)} {getLabel("Pale")} {formatChartHouseNumber(panchanga.tithiVighati, pdfLanguage)}</> : "";

  const defaultWeekday = panchanga ? (pdfLanguage === "kn" ? panchanga.weekdayKn : (panchanga.weekday || panchanga.weekdayKn)) : "";
  const defaultSunNak = panchanga ? (pdfLanguage === "kn" ? panchanga.sunNakshatraKn : (panchanga.sunNakshatra || panchanga.sunNakshatraKn)) : "";
  const vasara = panchanga ? <>{getValue("weekday", defaultWeekday)} – <b>{getLabel("Ravi Nakshatra")}</b> {getValue("sunNakshatra", defaultSunNak)}, {getLabel("Ghati")} {formatChartHouseNumber(panchanga.sunNakshatraGhati, pdfLanguage)} {getLabel("Pale")} {formatChartHouseNumber(panchanga.sunNakshatraVighati, pdfLanguage)}</> : "";

  const defaultMoonNak = panchanga ? (pdfLanguage === "kn" ? panchanga.moonNakshatraKn : (panchanga.moonNakshatra || panchanga.moonNakshatraKn)) : "";
  const nakshatra = panchanga ? <>{getValue("moonNakshatra", defaultMoonNak)}, {getLabel("Ghati")} {formatChartHouseNumber(panchanga.moonNakshatraGhati, pdfLanguage)} {getLabel("Pale")} {formatChartHouseNumber(panchanga.moonNakshatraVighati, pdfLanguage)}</> : "";

  const defaultYoga = panchanga ? (pdfLanguage === "kn" ? panchanga.yogaKn : (panchanga.yoga || panchanga.yogaKn)) : "";
  const yoga = panchanga ? <>{getValue("yoga", defaultYoga)} – {getLabel("Ghati")} {formatChartHouseNumber(panchanga.yogaGhati, pdfLanguage)} {getLabel("Pale")} {formatChartHouseNumber(panchanga.yogaVighati, pdfLanguage)}</> : "";

  const defaultKarana = panchanga ? (pdfLanguage === "kn" ? panchanga.karanaKn : (panchanga.karana || panchanga.karanaKn)) : "";
  const karana = panchanga ? <>{getValue("karana", defaultKarana)} – {getLabel("Ghati")} {formatChartHouseNumber(panchanga.karanaGhati, pdfLanguage)} {getLabel("Pale")} {formatChartHouseNumber(panchanga.karanaVighati, pdfLanguage)}</> : "";
  
  const visha = panchanga ? <>{formatChartHouseNumber(panchanga.vishaGhati.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.vishaGhati.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const amruta = panchanga ? <>{formatChartHouseNumber(panchanga.amrithaGhati.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.amrithaGhati.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const diva = panchanga ? <>{formatChartHouseNumber(panchanga.divaGhati.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.divaGhati.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const defaultSankrantiSign = panchanga ? (pdfLanguage === "kn" ? panchanga.sankrantiSignKn : (panchanga.sankrantiSign || panchanga.sankrantiSignKn)) : "";
  const sankranti = panchanga ? <>{getValue("sankrantiSign", defaultSankrantiSign)} {getLabel("Sankranti")}, {getLabel("Gata Dina")} {formatChartHouseNumber(panchanga.sankrantiGataDina, pdfLanguage)}</> : "";
  const parama = panchanga ? <>{formatChartHouseNumber(panchanga.paramaGhati.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.paramaGhati.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const aishya = panchanga ? <>{formatChartHouseNumber(panchanga.ashayaGhati.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.ashayaGhati.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const gata = panchanga ? <>{formatChartHouseNumber(panchanga.ghatadina.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.ghatadina.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  const suryodayadi = panchanga ? <>{formatChartHouseNumber(panchanga.suryodhayadgata.ghati, pdfLanguage)} {getLabel("Ghati")} {formatChartHouseNumber(panchanga.suryodhayadgata.vighati, pdfLanguage)} {getLabel("Pale")}</> : "";
  
  let dashaBalance = "";
  if (panchanga?.dashaLord) {
    const pName = getValue("dashaLord", getLabel(panchanga.dashaLord || ""));
    dashaBalance = `${pName} ${getLabel("Dasha Bhukti")} ${formatChartHouseNumber(panchanga.dashaYears!, pdfLanguage)} ${getLabel("Masa")} ${formatChartHouseNumber(panchanga.dashaMonths!, pdfLanguage)} ${getLabel("Dina")} ${formatChartHouseNumber(panchanga.dashaDays!, pdfLanguage)}`;
  }
  
  let h = birthDateObj.getHours();
  let m = birthDateObj.getMinutes();
  if (birthTimeStr && birthTimeStr.includes(":")) {
    const parts = birthTimeStr.split(":");
    const parsedH = parseInt(parts[0], 10);
    const parsedM = parseInt(parts[1], 10);
    if (!isNaN(parsedH)) h = parsedH;
    if (!isNaN(parsedM)) m = parsedM;
  }
  const timeOfDayLabel = getTimeOfDayLabel(h, pdfLanguage);
  const displayH = h % 12 || 12;
  const displayHKn = formatChartHouseNumber(displayH, pdfLanguage);
  const displayMKn = formatChartHouseNumber(m, pdfLanguage).padStart(2, pdfLanguage === "kn" ? '೦' : '0');

  const moonDegree = kundli.planets.find((p) => p.name === "Moon")?.degree || 0;
  const safeMoonPada = kundli.moonPada && kundli.moonPada >= 1 ? kundli.moonPada : 1;
  const pada = formatChartHouseNumber(safeMoonPada, pdfLanguage); 
  
  const moonPlanet = kundli.planets.find((p) => p.name === "Moon");
  const moonNakshatra = moonPlanet?.nakshatra.sanskrit || "";
  const moonNakshatraIndex = moonPlanet?.nakshatra.index ?? -1;
  const moonNakshatraName = NAKSHATRA_L5[moonNakshatraIndex]
    ? pick(NAKSHATRA_L5[moonNakshatraIndex], pdfLanguage)
    : getValue("moonNakshatraName", getLabel(moonPlanet?.nakshatra.sanskrit || ""));

  const moonRashiIndex = kundli.moonSign.index;
  const moonRashiName = RASHI_L5[moonRashiIndex]
    ? pick(RASHI_L5[moonRashiIndex], pdfLanguage)
    : getValue("moonRashiName", getLabel(kundli.moonSign.sanskrit));

  const lagnaAmsha = formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.ascendant), pdfLanguage);
  const maandi = kundli.maandi;
  const maandiAmsha = maandi ? formatChartHouseNumber(patrikaNavamshaFromDegree(maandi.degree), pdfLanguage) : "";

  const renderPlanetKn = (p: PlanetPosition) => {
    let base = getValue(`planet_${p.name}`, t(`planets.${p.name}`, { lng: pdfLanguage }));
    if (p.isRetrograde) base += getLabel("Retrograde");
    const amsha = formatChartHouseNumber(patrikaNavamshaFromDegree(p.degree), pdfLanguage);
    return `${base}(${amsha})`;
  };

  const localizeGotra = (g?: string): string => {
    if (!g || !g.trim() || g.trim() === "—") return "—";
    const clean = g.replace(/gotra|ಗೋತ್ರ|గోత్రం|கோத்திரம்|गोत्र/gi, "").trim();
    const matched = GOTRA_OPTIONS.find(opt => 
      opt.toLowerCase() === clean.toLowerCase() || 
      g.toLowerCase().includes(opt.toLowerCase())
    );
    if (matched) {
      const trans = t(`gotras.${matched}` as any, { lng: pdfLanguage });
      if (trans && !trans.startsWith("gotras.")) {
        return trans;
      }
    }
    return g;
  };

  return (
    <div
      className="pdf-page"
      style={{
        width: "900px",
        height: "1273px",
        minHeight: "1273px",
        maxHeight: "1273px",
        backgroundColor: "#ffffff",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily: activeFontFamily,
        letterSpacing: "normal",
        color: "#000000",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
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
          justifyContent: "space-between"
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
          fontFamily: activeFontFamily,
          letterSpacing: "normal"
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
            <b>{getLabel("Janma Kala")}:</b> ({timeOfDayLabel} {getLabel("Hour")} {displayHKn} {getLabel("Min")} {displayMKn}) <br/> 
            <b>{getLabel("Dasha Bhukti")}:</b> {dashaBalance}
            {parentsName ? <><br/>{parentsName}</> : null}
            {gothra && localizeGotra(gothra) !== "—" ? ` | ${getLabel("Gotra")}: ${localizeGotra(gothra)}` : null}
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
                        padding: "16px 20px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        lineHeight: "1.6",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", marginBottom: "4px" }}>
                        <span style={{ width: "95px", display: "inline-block" }}>{getLabel("Name")}</span>
                        <span>: {personName || (pdfLanguage === "kn" ? "ಜಾತಕರು" : pdfLanguage === "hi" ? "जातक" : pdfLanguage === "te" ? "జాతకుడు" : pdfLanguage === "ta" ? "ஜாதகர்" : "Devotee")}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", marginBottom: "4px" }}>
                        <span style={{ width: "95px", display: "inline-block" }}>{getLabel("Gotra")}</span>
                        <span>: {localizeGotra(gothra)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", marginBottom: "4px" }}>
                        <span style={{ width: "95px", display: "inline-block" }}>{getLabel("Rashi")}</span>
                        <span>: {moonRashiName}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", marginBottom: "4px" }}>
                        <span style={{ width: "95px", display: "inline-block" }}>{getLabel("Nakshatra")}</span>
                        <span>: {moonNakshatraName}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                        <span style={{ width: "95px", display: "inline-block" }}>{getLabel("Pada")}</span>
                        <span>: {pada}</span>
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
        {(() => {
          const yoniMeta = moonPlanet ? patrikaMetaForNakshatraIndex(moonPlanet.nakshatra.index) : null;
          const yoniVal = yoniMeta
            ? (YONI_L5[yoniMeta.yoniEn]?.[pdfLanguage] || (pdfLanguage === "kn" ? yoniMeta.yoniKn : yoniMeta.yoniEn))
            : "—";
          const ganaVal = yoniMeta
            ? (GANA_L5[yoniMeta.ganaEn]?.[pdfLanguage] || (pdfLanguage === "kn" ? yoniMeta.ganaKn : yoniMeta.ganaEn))
            : "—";
          const nadiVal = yoniMeta
            ? (NADI_L5[yoniMeta.nadiEn]?.[pdfLanguage] || (pdfLanguage === "kn" ? yoniMeta.nadiKn : yoniMeta.nadiEn))
            : "—";

          return (
            <div style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", margin: "15px 0", padding: "10px 0", display: "flex", justifyContent: "space-around", fontSize: "15px", fontWeight: "bold" }}>
              <div>{getLabel("Yoni")}: <span>{yoniVal}</span></div>
              <div>{getLabel("Gana")}: <span>{ganaVal}</span></div>
              <div>{getLabel("Nadi")}: <span>{nadiVal}</span></div>
            </div>
          );
        })()}

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "15px", paddingTop: "5px", color: "#000" }}>
          <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "4px" }}>
            {pdfLanguage === "kn" ? "॥ ಶುಭಮಸ್ತು ॥" : pdfLanguage === "te" ? "॥ శుభమస్తు ॥" : pdfLanguage === "ta" ? "॥ சுபமஸ்து ॥" : pdfLanguage === "hi" ? "॥ शुभमस्तु ॥" : "|| Shubhamastu ||"}
          </div>
          <div style={{ fontWeight: "bold" }}>
            {getLabel("Panchanga Kartaru")}
          </div>
        </div>
      </div>
    </div>
  );
};
