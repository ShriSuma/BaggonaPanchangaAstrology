import React from "react";
import type { KundliOutput } from "../../core/AstroTypes";
import { RASHIS, PlanetName as PN } from "../../core/AstroTypes";
import { degreeToNakshatraPada } from "../../core/AstroMath";
import { generateDashaTimeline, vimshottariBalanceAtBirth, type DashaEntry } from "../../core/DashaBhuktiEngine";
import { GRAHA_L5, RASHI_L5, NAKSHATRA_L5, type GrahaKey } from "../../features/premiumPdf/premiumPdfLocale";
import type { PackageLang } from "./packageDownloadLocale";

function formatDegree(totalDeg: number): string {
  const norm = ((totalDeg % 30) + 30) % 30;
  const d = Math.floor(norm);
  const m = Math.floor((norm - d) * 60);
  const s = Math.floor(((norm - d) * 60 - m) * 60);
  return `${d}° ${m}' ${s}"`;
}

interface Props {
  id: string;
  kundli: KundliOutput;
  devoteeName: string;
  gender?: "male" | "female";
  birthDate: string;
  birthTime: string;
  placeLabel: string;
  gotra?: string;
  lang: PackageLang;
}

const UI_TITLES: Record<PackageLang, Record<string, string>> = {
  kn: {
    templeBanner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    mainTitle: "ಅಧಿಕೃತ ಜನನ ಕುಂಡಲಿ, ನವಗ್ರಹ ಸ್ಫುಟ ಹಾಗೂ ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ ಪತ್ರ",
    page2Title: "ದ್ವಿತೀಯ ಭಾಗ: ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ-ಅಂತರ್ದಶಾ ಅವಧಿ & ಆಶೀರ್ವಾದ",
    nameLabel: "ಜಾತಕರ ಹೆಸರು:",
    genderLabel: "ಲಿಂಗ:",
    dobLabel: "ಜನನ ದಿನಾಂಕ:",
    tobLabel: "ಜನನ ಸಮಯ:",
    placeLabel: "ಜನನ ಸ್ಥಳ:",
    gotraLabel: "ಗೋತ್ರ:",
    lagnaLabel: "ಲಗ್ನ:",
    moonSignLabel: "ಚಂದ್ರ ರಾಶಿ:",
    nakshatraLabel: "ಜನ್ಮ ನಕ್ಷತ್ರ:",
    padaLabel: "ಪಾದ:",
    avakahadaHeading: "ಅವಕಹಡ ಚಕ್ರ & ಮೂಲ ಲಕ್ಷಣಗಳು",
    varna: "ವರ್ಣ",
    vashya: "ವಶ್ಯ",
    yoni: "ಯೋನಿ",
    gana: "ಗಣ",
    nadi: "ನಾಡಿ",
    chartTitle: "ಜನ್ಮ ಕುಂಡಲಿ ಚಕ್ರ (South Indian Layout)",
    planetTableTitle: "ನವಗ್ರಹ ಸ್ಪಷ್ಟ ಸ್ಫುಟ ಕೋಷ್ಟಕ (Planetary Sphutas)",
    graha: "ಗ್ರಹ",
    rashi: "ರಾಶಿ",
    bhava: "ಭಾವ",
    degrees: "ಅಂಶ (Sphuta)",
    nakshatraCol: "ನಕ್ಷತ್ರ (ಪಾದ)",
    dignityCol: "ಸ್ಥಿತಿ / ಬಲ",
    retrogradeCol: "ವಕ್ರ / ಗತಿ",
    dashaTimelineTitle: "ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ ಹಾಗೂ ಅಂತರ್ದಶಾ ಅವಧಿ ಕೋಷ್ಟಕ",
    currentPeriodNotice: "ಪ್ರಸ್ತುತ ಜಾತಕರ ಜೀವಮಾನದಲ್ಲಿ ನಡೆಯುತ್ತಿರುವ ದಶಾ ಅವಧಿಯನ್ನು ಹೈಲೈಟ್ ಮಾಡಲಾಗಿದೆ.",
    startAge: "ಪ್ರಾರಂಭ ವಯಸ್ಸು",
    endAge: "ಮುಕ್ತಾಯ ವಯಸ್ಸು",
    periodYears: "ಅವಧಿ (ವರ್ಷ)",
    blessingText: "॥ ಸೂರ್ಯಃ ಶೌರ್ಯಮಥೇಂದುರುಚ್ಚಪದವೀಂ ಸನ್ಮಂಗಳಂ ಮಂಗಳಃ । ಸದ್ಬುದ್ಧಿಂ ಚ ಬುಧೋ ಗುರುಶ್ಚ ಗುರುತಾಂ ಶುಕ್ರಃ ಸುಖಂ ಶಂ ಶನಿಃ ॥",
    page1Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೧/೨",
    page2Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೨/೨"
  },
  en: {
    templeBanner: "॥ Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga Astrology ॥",
    mainTitle: "Authentic Janana Kundali, Planetary Sphutas & Vimshottari Dasha Dossier",
    page2Title: "Part II: Vimshottari Mahadasha Timeline & Sacred Benediction",
    nameLabel: "Devotee Name:",
    genderLabel: "Gender:",
    dobLabel: "Date of Birth:",
    tobLabel: "Time of Birth:",
    placeLabel: "Birth Place:",
    gotraLabel: "Gotra:",
    lagnaLabel: "Ascendant (Lagna):",
    moonSignLabel: "Moon Sign (Rashi):",
    nakshatraLabel: "Birth Star (Nakshatra):",
    padaLabel: "Pada:",
    avakahadaHeading: "Avakahada Chakra & Core Attributes",
    varna: "Varna",
    vashya: "Vashya",
    yoni: "Yoni",
    gana: "Gana",
    nadi: "Nadi",
    chartTitle: "Janma Kundali Chart (South Indian Layout)",
    planetTableTitle: "Nine Planetary Sphutas & Dignity Table",
    graha: "Graha",
    rashi: "Rashi",
    bhava: "House",
    degrees: "Longitude (Degrees)",
    nakshatraCol: "Nakshatra (Pada)",
    dignityCol: "Dignity",
    retrogradeCol: "Motion / Vakri",
    dashaTimelineTitle: "Vimshottari Mahadasha Lifetime Chronology",
    currentPeriodNotice: "Active running Dasha periods tailored to the native's current lifespan.",
    startAge: "Start Age",
    endAge: "End Age",
    periodYears: "Duration (Years)",
    blessingText: "May Lord Mahabaleshwara and the Navagrahas bestow wisdom, health, prosperity, and peace.",
    page1Footer: "Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga · Page 1/2",
    page2Footer: "Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga · Page 2/2"
  },
  hi: {
    templeBanner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    mainTitle: "प्रामाणिक जन्म कुंडली, नवग्रह स्फुट एवं विंशोत्तरी महादशा पत्र",
    page2Title: "द्वितीय भाग: विंशोत्तरी महादशा अवधि एवं आशीर्वाद",
    nameLabel: "जातक का नाम:",
    genderLabel: "लिंग:",
    dobLabel: "जन्म तिथि:",
    tobLabel: "जन्म समय:",
    placeLabel: "जन्म स्थान:",
    gotraLabel: "गोत्र:",
    lagnaLabel: "लग्न:",
    moonSignLabel: "चंद्र राशि:",
    nakshatraLabel: "जन्म नक्षत्र:",
    padaLabel: "चरण:",
    avakahadaHeading: "अवकहड़ा चक्र एवं मूल लक्षण",
    varna: "वर्ण",
    vashya: "वश्य",
    yoni: "योनि",
    gana: "गण",
    nadi: "नाड़ी",
    chartTitle: "जन्म कुंडली चक्र (दक्षिण भारतीय प्रारूप)",
    planetTableTitle: "नवग्रह स्पष्ट स्फुट तालिका",
    graha: "ग्रह",
    rashi: "राशि",
    bhava: "भाव",
    degrees: "अंश (Sphuta)",
    nakshatraCol: "नक्षत्र (चरण)",
    dignityCol: "स्थिति / बल",
    retrogradeCol: "वक्र / गति",
    dashaTimelineTitle: "विंशोत्तरी महादशा जीवनकाल तालिका",
    currentPeriodNotice: "जातक के जीवनकाल में सक्रिय महादशाओं का विवरण।",
    startAge: "प्रारंभ आयु",
    endAge: "समाप्ति आयु",
    periodYears: "अवधि (वर्ष)",
    blessingText: "॥ सूर्यः शौर्यमथेन्दुुरुच्चपदवीं सन्मङ्गलं मङ्गलः । सद्बुद्धिं च बुधो गुरुश्च गुरुतां शुक्रः सुखं शं शनिः ॥",
    page1Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ १/२",
    page2Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ २/२"
  },
  te: {
    templeBanner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    mainTitle: "ప్రామాణిక జన్మ కుండలి, నవగ్రహ స్ఫుట మరియు వింశోత్తరి మహర్దశ పత్రం",
    page2Title: "రెండవ భాగం: వింశోత్తరి మహర్దశ కాలక్రమం & ఆశీర్వాదం",
    nameLabel: "జాతకుల పేరు:",
    genderLabel: "లింగం:",
    dobLabel: "పుట్టిన తేదీ:",
    tobLabel: "పుట్టిన సమయం:",
    placeLabel: "పుట్టిన స్థలం:",
    gotraLabel: "గోత్రం:",
    lagnaLabel: "లగ్నం:",
    moonSignLabel: "చంద్ర రాశి:",
    nakshatraLabel: "జన్మ నక్షత్రం:",
    padaLabel: "పాదం:",
    avakahadaHeading: "అవకహడ చక్రం & మూల లక్షణాలు",
    varna: "వర్ణం",
    vashya: "వశ్యం",
    yoni: "యోని",
    gana: "గణం",
    nadi: "నాడి",
    chartTitle: "జన్మ కుండలి చక్రం (South Indian Layout)",
    planetTableTitle: "నవగ్రహ స్పష్ట స్ఫుట పట్టిక",
    graha: "గ్రహం",
    rashi: "రాశి",
    bhava: "భావం",
    degrees: "డిగ్రీలు (Sphuta)",
    nakshatraCol: "నక్షత్రం (పాదం)",
    dignityCol: "స్థితి / బలం",
    retrogradeCol: "వక్రం / గతి",
    dashaTimelineTitle: "వింశోత్తరి మహర్దశ జీవిత కాలక్రమం",
    currentPeriodNotice: "జాతకుని జీవితకాలంలో సక్రియంగా ఉన్న దశా కాలాల వివరాలు.",
    startAge: "ప్రారంభ వయస్సు",
    endAge: "ముగింపు వయస్సు",
    periodYears: "వ్యవధి (సంవత్సరాలు)",
    blessingText: "॥ సూర్యః శౌర్యమథేందురుచ్చపదవీం సన్మంగళం మంగళః । సద్బుద్ధిం చ బుధో గురుశ్చ గురుతాం శుక్రః సుఖం శం శనిః ॥",
    page1Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 1/2",
    page2Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 2/2"
  },
  ta: {
    templeBanner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்க ஜோதிடம் ॥",
    mainTitle: "அங்கீகரிக்கப்பட்ட பிறப்பு ஜாதகம், நவகிரக ஸ்புடம் & விம்சோத்தரி மகாதிசை அறிக்கை",
    page2Title: "இரண்டாம் பகுதி: விம்சோத்தரி மகாதிசை காலவரிசை & ஆசீர்வாதம்",
    nameLabel: "ஜாதகர் பெயர்:",
    genderLabel: "பாலினம்:",
    dobLabel: "பிறந்த தேதி:",
    tobLabel: "பிறந்த நேரம்:",
    placeLabel: "பிறந்த இடம்:",
    gotraLabel: "கோத்திரம்:",
    lagnaLabel: "லக்னம்:",
    moonSignLabel: "சந்திர ராசி:",
    nakshatraLabel: "பிறப்பு நட்சத்திரம்:",
    padaLabel: "பாதம்:",
    avakahadaHeading: "அவகஹடா சக்கரம் & அடிப்படை பண்புகள்",
    varna: "வர்ணம்",
    vashya: "வச்யம்",
    yoni: "யோனி",
    gana: "கணம்",
    nadi: "நாடி",
    chartTitle: "பிறப்பு ஜாதக சக்கரம் (தென்னிந்திய பாணி)",
    planetTableTitle: "நவகிரக ஸ்புட அட்டவணை",
    graha: "கிரகம்",
    rashi: "ராசி",
    bhava: "பாவம்",
    degrees: "பாகை (Sphuta)",
    nakshatraCol: "நட்சத்திரம் (பாதம்)",
    dignityCol: "நிலை / பலம்",
    retrogradeCol: "வக்ரம் / கதி",
    dashaTimelineTitle: "விம்சோத்தரி மகாதிசை கால அட்டவணை",
    currentPeriodNotice: "ஜாதகரின் ஆயுளில் நடக்கும் திசை காலங்களின் விவரங்கள்.",
    startAge: "தொடக்க வயது",
    endAge: "முடிவு வயது",
    periodYears: "காலம் (ஆண்டுகள்)",
    blessingText: "ஸ்ரீ மகாபலேஸ்வரர் மற்றும் நவகிரகங்களின் பரிபூரண அருளினால் சகல மங்களங்களும் உண்டாகட்டும்.",
    page1Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம் · பக்கம் 1/2",
    page2Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம் · பக்கம் 2/2"
  }
};

export const JananaKundaliPrintTemplate: React.FC<Props> = ({
  id,
  kundli,
  devoteeName,
  gender,
  birthDate,
  birthTime,
  placeLabel,
  gotra,
  lang
}) => {
  const dict = UI_TITLES[lang] || UI_TITLES.kn;
  const dashaTimeline = generateDashaTimeline(kundli, 100);

  const moonPlanet = kundli.planets.find((p) => p.name === PN.Moon);
  const moonRashiSanskrit = kundli.moonSign?.sanskrit || moonPlanet?.rashi?.sanskrit || "Mesha";
  const moonNakshatraSanskrit = moonPlanet?.nakshatra?.sanskrit || "Ashwini";
  const moonPada = kundli.moonPada || 1;
  const lagnaRashiSanskrit = kundli.lagnaRashi?.sanskrit || "Mesha";
  const lagnaRashiIdx = kundli.lagnaRashi?.index ?? 0;
  const birthDashaInfo = vimshottariBalanceAtBirth(kundli);

  // South Indian Chart Grid (12 boxes around perimeter)
  const southGridRashiOrder = [
    11, 0, 1, 2,  // Row 1
    10, -1, -1, 3, // Row 2
    9, -1, -1, 4,  // Row 3
    8, 7, 6, 5    // Row 4
  ];

  const planetsByRashi: Record<number, string[]> = {};
  for (let r = 0; r < 12; r++) planetsByRashi[r] = [];

  // Add Lagna
  planetsByRashi[lagnaRashiIdx].push(lang === "kn" ? "ಲಗ್ನ" : lang === "hi" ? "लग्न" : lang === "te" ? "లగ్నం" : lang === "ta" ? "லக்னம்" : "Asc");

  // Add Planets
  kundli.planets.forEach((p) => {
    const rIdx = p.rashi?.index ?? 0;
    const gKey = String(p.name) as GrahaKey;
    const localizedG = GRAHA_L5[gKey]?.[lang] || p.name;
    const vakriMark = p.isRetrograde ? " (R)" : "";
    planetsByRashi[rIdx].push(`${localizedG}${vakriMark}`);
  });

  return (
    <div id={id} className="pdf-container" style={{ width: 900, backgroundColor: "#FFFDF7", color: "#1E293B", fontFamily: "'Noto Sans Kannada', 'Noto Sans Devanagari', 'Inter', sans-serif" }}>
      {/* PAGE 1: Natal Chart & Graha Sphutas */}
      <div className="pdf-page" style={{ width: 900, minHeight: 1250, padding: "32px 36px", boxSizing: "border-box", borderBottom: "2px dashed #E2E8F0" }}>
        {/* Sacred Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #D4AF37", paddingBottom: 14, marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", letterSpacing: 1.5, textTransform: "uppercase" }}>
            {dict.templeBanner}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#78350F", margin: "6px 0 4px" }}>
            {dict.mainTitle}
          </h1>
          <div style={{ fontSize: 11, color: "#64748B" }}>
            {dict.blessingText}
          </div>
        </div>

        {/* Devotee Birth Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: 12, backgroundColor: "#FEF3C7", borderRadius: 8, border: "1px solid #FCD34D", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>{dict.nameLabel}</span>{" "}
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1E293B" }}>{devoteeName || "Devotee"}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>{dict.dobLabel}</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 600 }}>{birthDate}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>{dict.tobLabel}</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 600 }}>{birthTime}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>{dict.placeLabel}</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 600 }}>{placeLabel || "Gokarna"}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>{dict.gotraLabel}</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 600 }}>{gotra || "Kashyapa / Shiva"}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>{dict.lagnaLabel}</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 800, color: "#B45309" }}>
              {RASHI_L5[lagnaRashiSanskrit as any]?.[lang] || lagnaRashiSanskrit} ({formatDegree(kundli.ascendant ?? 0)})
            </span>
          </div>
        </div>

        {/* Chart + Avakahada Split Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: 16, marginBottom: 18 }}>
          {/* South Indian Chart Box */}
          <div style={{ border: "2px solid #D4AF37", borderRadius: 8, padding: 8, backgroundColor: "#FFFBEB" }}>
            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>
              {dict.chartTitle}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(4, 90px)", gap: 4 }}>
              {southGridRashiOrder.map((rIdx, idx) => {
                if (rIdx === -1) {
                  // Center cell (2x2 center)
                  if (idx === 5) {
                    return (
                      <div key={idx} style={{ gridColumn: "span 2", gridRow: "span 2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#FEF3C7", border: "1px dashed #F59E0B", borderRadius: 6, padding: 8, textAlign: "center" }}>
                        <span style={{ fontSize: 24 }}>🕉️</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#78350F", marginTop: 4 }}>
                          {RASHI_L5[moonRashiSanskrit as any]?.[lang] || moonRashiSanskrit} {dict.rashi}
                        </span>
                        <span style={{ fontSize: 10, color: "#92400E" }}>
                          {NAKSHATRA_L5[moonNakshatraSanskrit as any]?.[lang] || moonNakshatraSanskrit} ({moonPada} {dict.padaLabel})
                        </span>
                      </div>
                    );
                  }
                  return null;
                }
                const rObj = RASHIS[rIdx];
                const rName = RASHI_L5[rObj?.sanskrit as any]?.[lang] || rObj?.sanskrit || "";
                const occupants = planetsByRashi[rIdx] || [];
                const isLagnaHouse = rIdx === lagnaRashiIdx;

                return (
                  <div key={idx} style={{ border: isLagnaHouse ? "2px solid #B45309" : "1px solid #E2E8F0", borderRadius: 4, backgroundColor: isLagnaHouse ? "#FEF9C3" : "#FFFFFF", padding: 4, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", borderBottom: "1px solid #F1F5F9", paddingBottom: 2, marginBottom: 2 }}>
                      {rName}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {occupants.map((occ, oIdx) => (
                        <span key={oIdx} style={{ fontSize: 9, fontWeight: occ.includes("Asc") || occ.includes("ಲಗ್ನ") ? 800 : 600, color: occ.includes("Asc") || occ.includes("ಲಗ್ನ") ? "#B45309" : "#1E293B", backgroundColor: "#F8FAFC", padding: "1px 3px", borderRadius: 2 }}>
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Avakahada Attributes Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ border: "1px solid #FCD34D", borderRadius: 8, padding: 12, backgroundColor: "#FFFDF0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", borderBottom: "1px solid #FDE68A", paddingBottom: 6, marginBottom: 8 }}>
                ✦ {dict.avakahadaHeading}
              </div>
              <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #FEF3C7" }}>
                    <td style={{ padding: "4px 0", color: "#64748B", fontWeight: 600 }}>{dict.moonSignLabel}</td>
                    <td style={{ padding: "4px 0", fontWeight: 800, color: "#78350F" }}>
                      {RASHI_L5[moonRashiSanskrit as any]?.[lang] || moonRashiSanskrit}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #FEF3C7" }}>
                    <td style={{ padding: "4px 0", color: "#64748B", fontWeight: 600 }}>{dict.nakshatraLabel}</td>
                    <td style={{ padding: "4px 0", fontWeight: 800, color: "#78350F" }}>
                      {NAKSHATRA_L5[moonNakshatraSanskrit as any]?.[lang] || moonNakshatraSanskrit} ({moonPada} {dict.padaLabel})
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #FEF3C7" }}>
                    <td style={{ padding: "4px 0", color: "#64748B", fontWeight: 600 }}>{dict.varna}</td>
                    <td style={{ padding: "4px 0", fontWeight: 600 }}>Brahmin / Deva</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #FEF3C7" }}>
                    <td style={{ padding: "4px 0", color: "#64748B", fontWeight: 600 }}>{dict.yoni}</td>
                    <td style={{ padding: "4px 0", fontWeight: 600 }}>Ashwa / Gaja</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #FEF3C7" }}>
                    <td style={{ padding: "4px 0", color: "#64748B", fontWeight: 600 }}>{dict.gana}</td>
                    <td style={{ padding: "4px 0", fontWeight: 600 }}>Deva Gana</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0", color: "#64748B", fontWeight: 600 }}>{dict.nadi}</td>
                    <td style={{ padding: "4px 0", fontWeight: 600 }}>Madhya Nadi</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 10, backgroundColor: "#F8FAFC" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                🕉️ ಸನ್ನಿಧಾನದ ಮಹಾ ಆಶೀರ್ವಾದ
              </div>
              <p style={{ fontSize: 10.5, lineHeight: 1.5, color: "#64748B", margin: 0 }}>
                ಜಾತಕರ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ಲಗ್ನಾಧಿಪತಿಯ ಅನುಗ್ರಹದಿಂದ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ಯಶಸ್ಸು, ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಣೆ ಲಭಿಸಲಿ.
              </p>
            </div>
          </div>
        </div>

        {/* 9 Planetary Sphutas Table */}
        <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden", backgroundColor: "#FFFFFF" }}>
          <div style={{ backgroundColor: "#78350F", color: "#FFFFFF", padding: "8px 12px", fontSize: 11, fontWeight: 700 }}>
            {dict.planetTableTitle}
          </div>
          <table style={{ width: "100%", fontSize: 10.5, borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                <th style={{ padding: "6px 10px" }}>{dict.graha}</th>
                <th style={{ padding: "6px 10px" }}>{dict.rashi}</th>
                <th style={{ padding: "6px 10px" }}>{dict.bhava}</th>
                <th style={{ padding: "6px 10px" }}>{dict.degrees}</th>
                <th style={{ padding: "6px 10px" }}>{dict.nakshatraCol}</th>
                <th style={{ padding: "6px 10px" }}>{dict.dignityCol}</th>
                <th style={{ padding: "6px 10px" }}>{dict.retrogradeCol}</th>
              </tr>
            </thead>
            <tbody>
              {kundli.planets.map((p, idx) => {
                const gKey = String(p.name) as GrahaKey;
                const localizedG = GRAHA_L5[gKey]?.[lang] || p.name;
                const localizedR = RASHI_L5[p.rashi.sanskrit as any]?.[lang] || p.rashi.sanskrit;
                const localizedNak = NAKSHATRA_L5[p.nakshatra.sanskrit as any]?.[lang] || p.nakshatra.sanskrit;
                const pPada = degreeToNakshatraPada(p.degree ?? 0);
                const dignityText = p.isExalted ? "ಉಚ್ಚ (Exalted)" : p.isDebilitated ? "ನೀಚ (Debilitated)" : "ಸಮ (Standard)";
                const dignityBg = p.isExalted ? "#DCFCE7" : p.isDebilitated ? "#FEE2E2" : "#F1F5F9";
                const dignityColor = p.isExalted ? "#166534" : p.isDebilitated ? "#991B1B" : "#475569";
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FFFDF7" }}>
                    <td style={{ padding: "6px 10px", fontWeight: 700, color: "#1E293B" }}>{localizedG}</td>
                    <td style={{ padding: "6px 10px", color: "#475569" }}>{localizedR}</td>
                    <td style={{ padding: "6px 10px", fontWeight: 700, color: "#B45309" }}>{p.house}</td>
                    <td style={{ padding: "6px 10px", fontFamily: "monospace" }}>{formatDegree(p.degree ?? 0)}</td>
                    <td style={{ padding: "6px 10px" }}>{localizedNak} ({pPada})</td>
                    <td style={{ padding: "6px 10px" }}>
                      <span style={{ backgroundColor: dignityBg, color: dignityColor, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                        {dignityText}
                      </span>
                    </td>
                    <td style={{ padding: "6px 10px", color: p.isRetrograde ? "#DC2626" : "#64748B", fontWeight: p.isRetrograde ? 700 : 500 }}>
                      {p.isRetrograde ? "ವಕ್ರಿ (Retrograde)" : "ಮಾರ್ಗಿ (Direct)"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 14, textAlign: "center", fontSize: 10, color: "#94A3B8" }}>
          {dict.page1Footer}
        </div>
      </div>

      {/* PAGE 2: Vimshottari Mahadasha Timeline */}
      <div className="pdf-page" style={{ width: 900, minHeight: 1250, padding: "32px 36px", boxSizing: "border-box" }}>
        {/* Sacred Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #D4AF37", paddingBottom: 12, marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", letterSpacing: 1.5, textTransform: "uppercase" }}>
            {dict.templeBanner}
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "#78350F", margin: "6px 0 4px" }}>
            {dict.page2Title}
          </h2>
          <div style={{ fontSize: 11, color: "#64748B" }}>
            {dict.currentPeriodNotice}
          </div>
        </div>

        {/* Dasha Balance Note */}
        <div style={{ padding: 12, backgroundColor: "#FEF3C7", borderRadius: 8, border: "1px solid #FCD34D", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F" }}>
            ⭐ ಜನನ ಕಾಲದ ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ ಶಿಷ್ಟ (Birth Dasha Balance)
          </div>
          <div style={{ fontSize: 11, color: "#92400E", marginTop: 4 }}>
            ಜಾತಕರ ಜನನ ಕಾಲದಲ್ಲಿ {GRAHA_L5[String(birthDashaInfo.lord) as GrahaKey]?.[lang] || birthDashaInfo.lord} ಮಹಾದಶೆಯು ಚಾಲ್ತಿಯಲ್ಲಿದ್ದು (ಶಿಷ್ಟ: {birthDashaInfo.balanceYears.toFixed(1)} ವರ್ಷ), ಅದರಿಂದ ಮುಂದುವರಿದ ಸಂಪೂರ್ಣ ಜೀವನ ಕಾಲದ ದಶಾ ಕೋಷ್ಟಕವನ್ನು ಕೆಳಗೆ ನೀಡಲಾಗಿದೆ.
          </div>
        </div>

        {/* Full Dasha Timeline Table */}
        <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden", backgroundColor: "#FFFFFF", marginBottom: 20 }}>
          <div style={{ backgroundColor: "#92400E", color: "#FFFFFF", padding: "8px 12px", fontSize: 11, fontWeight: 700 }}>
            {dict.dashaTimelineTitle}
          </div>
          <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                <th style={{ padding: "8px 12px" }}>ಮಹಾದಶಾಧಿಪತಿ (Mahadasha Lord)</th>
                <th style={{ padding: "8px 12px" }}>{dict.startAge}</th>
                <th style={{ padding: "8px 12px" }}>{dict.endAge}</th>
                <th style={{ padding: "8px 12px" }}>{dict.periodYears}</th>
                <th style={{ padding: "8px 12px" }}>ಸಾಮಾನ್ಯ ಫಲ ಪ್ರಭಾವ (Signification)</th>
              </tr>
            </thead>
            <tbody>
              {dashaTimeline.map((entry, idx) => {
                const gKey = String(entry.planet) as GrahaKey;
                const localizedG = GRAHA_L5[gKey]?.[lang] || entry.planet;
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FFFDF7" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 800, color: "#78350F" }}>
                      🪐 {localizedG} ಮಹಾದಶೆ
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{entry.startAge.toFixed(1)} ವರ್ಷ</td>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{entry.endAge.toFixed(1)} ವರ್ಷ</td>
                    <td style={{ padding: "8px 12px", fontWeight: 700, color: "#B45309" }}>{entry.durationYears.toFixed(1)} ವರ್ಷ</td>
                    <td style={{ padding: "8px 12px", color: "#64748B" }}>
                      {entry.planet === PN.Jupiter ? "ಜ್ಞಾನ, ಧರ್ಮ, ಭಾಗ್ಯ ವೃದ್ಧಿ & ಗುರು ಕೃಪೆ" :
                       entry.planet === PN.Saturn ? "ಕರ್ಮ ಪರಿಪಕ್ವತೆ, ಶಿಸ್ತು, ಸಹನೆ & ನಿಧಾನ ಪ್ರಗತಿ" :
                       entry.planet === PN.Mercury ? "ವ್ಯಾಪಾರ, ಬುದ್ಧಿವಂತಿಕೆ, ವಿದ್ಯಾಭ್ಯಾಸ & ಸಂಪರ್ಕ" :
                       entry.planet === PN.Venus ? "ಕೌಟುಂಬಿಕ ಸುಖ, ವಾಹನ, ಆಸ್ತಿ & ಕಲಾ ಪ್ರೀತಿ" :
                       entry.planet === PN.Sun ? "ಆತ್ಮಬಲ, ಅಧಿಕಾರ, ಪಿತೃ ಕೃಪೆ & ಸರ್ಕಾರಿ ಗೌರವ" :
                       entry.planet === PN.Moon ? "ಮನಃಶಾಂತಿ, ಮಾತೃ ಪ್ರೀತಿ, ಪ್ರಯಾಣ & ಸೃಜನಶೀಲತೆ" :
                       entry.planet === PN.Mars ? "ಧೈರ್ಯ, ಭೂಮಿ ಲಾಭ, ಸಹೋದರ ಬಲ & ಸಾಹಸ" :
                       entry.planet === PN.Rahu ? "ಅನಿರೀಕ್ಷಿತ ಬದಲಾವಣೆ, ವಿದೇಶ ಸಂಪರ್ಕ & ಆಸೆಗಳು" :
                       "ಆಧ್ಯಾತ್ಮಿಕ ಒಲವು, ಮೋಕ್ಷ ಸಾಧನೆ & ಆಂತರಿಕ ಅನ್ವೇಷಣೆ"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sacred Priest Benediction Box */}
        <div style={{ border: "2px solid #D4AF37", borderRadius: 8, padding: 16, backgroundColor: "#FFFBEB", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>🪔</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#78350F" }}>
                ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರ ದೈವಿಕ ಆಶೀರ್ವಚನ
              </div>
              <div style={{ fontSize: 10, color: "#92400E" }}>
                ಸಮಸ್ತ ಗ್ರಹ ಪೀಡಾ ನಿವಾರಣಾ ಸಂಕಲ್ಪ ಪೂರ್ವಕ ಆಶೀರ್ವಾದ
              </div>
            </div>
          </div>
          <p style={{ fontSize: 11, lineHeight: 1.6, color: "#451A03", margin: 0 }}>
            ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಕೃಪೆಯಿಂದ, ಜಾತಕರಾದ {devoteeName || "ಭಕ್ತರಿಗೆ"} ಅವರ ಜೀವಮಾನದ ಸಕಲ ಗ್ರಹದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ, ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾದಿ ಸಕಲ ಸುಖ ಸಂಪತ್ತುಗಳು ಸಿದ್ಧಿಸಲಿ ಎಂದು ಶ್ರೀ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಲಾಗಿದೆ.
          </p>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", textAlign: "center", fontSize: 10, color: "#94A3B8" }}>
          {dict.page2Footer}
        </div>
      </div>
    </div>
  );
};
