import React from "react";
import type { KundliOutput, PlanetName } from "../../core/AstroTypes";
import { PlanetName as PN, RASHIS } from "../../core/AstroTypes";
import { findBhuktiAtAge, findMahadashaAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { getTransitsForDate } from "../../core/BaggonaPredictionEngine";
import { GRAHA_L5, RASHI_L5, NAKSHATRA_L5, type GrahaKey } from "../../features/premiumPdf/premiumPdfLocale";
import type { PackageLang } from "./packageDownloadLocale";

interface Props {
  id: string;
  kundli: KundliOutput;
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  placeLabel: string;
  lang: PackageLang;
  priestName?: string;
  priestPhone?: string;
}

const UI_TITLES: Record<PackageLang, Record<string, string>> = {
  kn: {
    banner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    title: "ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ, ದಶಾಕಾಲ & ಲೈವ್ ಗೋಚಾರ ಪ್ರಭಾವ ವರದಿ",
    subtitle: "ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶೆ-ಅಂತರ್ದಶೆ, ಲೈವ್ ಗ್ರಹ ಗೋಚಾರ, ಚಂದ್ರಬಲ-ತಾರಾಬಲ ಹಾಗೂ ಮುಂದಿನ ೬-೧೨ ತಿಂಗಳ ಮಾರ್ಗದರ್ಶನ",
    currentAgeLabel: "ಪ್ರಸ್ತುತ ವಯಸ್ಸು:",
    runningPeriodHeading: "೧. ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶೆ ಹಾಗೂ ಅಂತರ್ದಶೆ (Running Dasha)",
    dashaStatus: "ಚಾಲ್ತಿ ಮಹಾದಶೆ:",
    bhuktiStatus: "ಚಾಲ್ತಿ ಅಂತರ್ದಶೆ:",
    dashaSpan: "ಅವಧಿ ವಯೋಮಿತಿ:",
    karmicFlowHeading: "ದಶಾ ಪ್ರಭಾವ & ಕರ್ಮ ಚಲನೆ:",
    gocharaHeading: "೨. ಲೈವ್ ಗೋಚಾರ ಗ್ರಹಗಳ ಸ್ಥಿತಿ (Live Planetary Transits)",
    gocharaDesc: "ಜನ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ ಪ್ರಸ್ತುತ ಆಕಾಶದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿರುವ ಪ್ರಮುಖ ಗ್ರಹಗಳ ಗೋಚಾರ ಫಲಗಳು:",
    guruGochara: "ಗುರು ಗೋಚಾರ (Jupiter Transit):",
    shaniGochara: "ಶನಿ ಗೋಚಾರ (Saturn Transit / Sade Sati):",
    rahuKetuGochara: "ರಾಹು-ಕೇತು ಗೋಚಾರ (Rahu-Ketu Axis):",
    chandraTaraBala: "ಪ್ರಸ್ತುತ ಚಂದ್ರಬಲ & ದಿನದ ಶಕ್ತಿ ಮಾನ:",
    future6MonthsHeading: "೩. ಮುಂದಿನ ೬ ರಿಂದ ೧೨ ತಿಂಗಳ ಜೀವನ ಭವಿಷ್ಯ (Immediate Outlook)",
    careerFocus: "💼 ಉದ್ಯೋಗ & ಆರ್ಥಿಕ ಮುನ್ನೋಟ:",
    familyFocus: "🏡 ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ & ನೆಮ್ಮದಿ:",
    healthFocus: "🩺 ಆರೋಗ್ಯ, ಮನೋಬಲ & ಆತಂಕ ಶಮನ:",
    cautionFocus: "⚠️ ಎಚ್ಚರಿಕೆಯ ದಿನಗಳು & ಪಾಲಿಸಬೇಕಾದ ನಿಯಮಗಳು:",
    remediesHeading: "೪. ಪ್ರಸ್ತುತ ಹಂತಕ್ಕೆ ತಕ್ಷಣ ಆಚರಿಸಬೇಕಾದ ದೈವಿಕ ಪರಿಹಾರಗಳು",
    dailyMantra: "ದೈನಂದಿನ ಶಾಂತಿ ಮಂತ್ರ:",
    prescribedSeva: "ಸನ್ನಿಧಾನದ ವಿಶೇಷ ಸೇವೆ:",
    priestContactHeading: "ಪುರೋಹಿತರ ಸಂಪರ್ಕ & ಆಶೀರ್ವಾದ:",
    footer1: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೧/೨",
    footer2: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೨/೨"
  },
  en: {
    banner: "॥ Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga Astrology ॥",
    title: "Current Life Status, Running Dasha & Live Transit Influences",
    subtitle: "Real-time Mahadasha-Antardasha, planetary transits, Chandra Bala, and 6 to 12-month life outlook.",
    currentAgeLabel: "Current Age:",
    runningPeriodHeading: "1. Active Running Mahadasha & Antardasha (Vimshottari)",
    dashaStatus: "Current Mahadasha:",
    bhuktiStatus: "Current Antardasha:",
    dashaSpan: "Active Age Span:",
    karmicFlowHeading: "Dasha Influence & Karmic Focus:",
    gocharaHeading: "2. Real-Time Planetary Transits (Live Gochara Analysis)",
    gocharaDesc: "Current movement of key major planets relative to the native's natal Moon sign:",
    guruGochara: "Jupiter Transit (Guru Gochara):",
    shaniGochara: "Saturn Transit (Shani Gochara / Sade Sati):",
    rahuKetuGochara: "Rahu-Ketu Transit Axis:",
    chandraTaraBala: "Current Chandra Bala & Daily Energy Meter:",
    future6MonthsHeading: "3. Immediate 6 to 12-Month Strategic Life Outlook",
    careerFocus: "💼 Career, Profession & Financial Growth:",
    familyFocus: "🏡 Family Harmony & Personal Relationships:",
    healthFocus: "🩺 Health, Mental Peace & Vitality:",
    cautionFocus: "⚠️ Caution Periods & Safeguards to Observe:",
    remediesHeading: "4. Immediate Vedic Remedies & Daily Peace Routine",
    dailyMantra: "Daily Peace Mantra:",
    prescribedSeva: "Recommended Temple Pooja:",
    priestContactHeading: "Priest Consultation & Benediction:",
    footer1: "Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga · Page 1/2",
    footer2: "Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga · Page 2/2"
  },
  hi: {
    banner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    title: "वर्तमान जीवन स्थिति, दशा काल एवं गोचर प्रभाव रिपोर्ट",
    subtitle: "सक्रिय महादशा-अंतर्दशा, लाइव ग्रह गोचर, चंद्रबल एवं आगामी ६-१२ माह का मार्गदर्शन",
    currentAgeLabel: "वर्तमान आयु:",
    runningPeriodHeading: "१. वर्तमान में सक्रिय महादशा एवं अंतर्दशा",
    dashaStatus: "सक्रिय महादशा:",
    bhuktiStatus: "सक्रिय अंतर्दशा:",
    dashaSpan: "सक्रिय आयु सीमा:",
    karmicFlowHeading: "दशा प्रभाव एवं कर्म प्रवाह:",
    gocharaHeading: "२. लाइव गोचर ग्रहों की स्थिति (Real-Time Transits)",
    gocharaDesc: "जन्म चंद्र राशि से वर्तमान ग्रहों का गोचर फल:",
    guruGochara: "गुरु गोचर (Jupiter Transit):",
    shaniGochara: "शनि गोचर (Saturn Transit / साढ़े साती):",
    rahuKetuGochara: "राहु-केतु गोचर धुरी:",
    chandraTaraBala: "वर्तमान चंद्रबल एवं ऊर्जा स्तर:",
    future6MonthsHeading: "३. आगामी ६ से १२ माह का सामरिक जीवन दृष्टिकोण",
    careerFocus: "💼 करियर एवं आर्थिक दृष्टिकोण:",
    familyFocus: "🏡 पारिवारिक सुख एवं शांति:",
    healthFocus: "🩺 स्वास्थ्य एवं मनोबल:",
    cautionFocus: "⚠️ सावधानी योग्य काल एवं नियम:",
    remediesHeading: "४. वर्तमान चरण हेतु तत्काल करने योग्य दैविक उपाय",
    dailyMantra: "दैनिक शांति मंत्र:",
    prescribedSeva: "सस्तुत क्षेत्र सेवा:",
    priestContactHeading: "पुरोहित संपर्क एवं आशीर्वाद:",
    footer1: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ १/२",
    footer2: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ २/२"
  },
  te: {
    banner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    title: "ప్రస్తుత జీవిత స్థితి, దశాకాలం & లైవ్ గోచార ప్రభావ నివేదిక",
    subtitle: "ప్రస్తుతం నడుస్తున్న మహర్దశ-అంతర్దశ, లైవ్ గ్రహ గోచారం, చంద్రబలం & రాబోయే 6-12 నెలల మార్గదర్శనం",
    currentAgeLabel: "ప్రస్తుత వయస్సు:",
    runningPeriodHeading: "1. ప్రస్తుతం నడుస్తున్న మహర్దశ మరియు అంతర్దశ",
    dashaStatus: "నడుస్తున్న మహర్దశ:",
    bhuktiStatus: "నడుస్తున్న అంతర్దశ:",
    dashaSpan: "వయస్సు పరిధి:",
    karmicFlowHeading: "దశా ప్రభావం & కర్మ చలనం:",
    gocharaHeading: "2. లైవ్ గోచార గ్రహాల స్థితి (Real-Time Transits)",
    gocharaDesc: "జన్మ చంద్ర రాశి నుండి ప్రస్తుత గ్రహాల గోచార ఫలితాలు:",
    guruGochara: "గురు గోచారం (Jupiter Transit):",
    shaniGochara: "శని గోచారం (Saturn Transit / ఏలినాటి శని):",
    rahuKetuGochara: "రాహు-కేతు గోచార ప్రభావం:",
    chandraTaraBala: "ప్రస్తుత చంద్రబలం & రోజువారీ శక్తి:",
    future6MonthsHeading: "3. రాబోయే 6 నుండి 12 నెలల జీవిత దృక్పథం",
    careerFocus: "💼 ఉద్యోగం & ఆర్థిక పురోగతి:",
    familyFocus: "🏡 కుటుంబ సౌఖ్యం & మనశ్శాంతి:",
    healthFocus: "🩺 ఆరోగ్యం & మానసిక స్థైర్యం:",
    cautionFocus: "⚠️ జాగ్రత్త వహించవలసిన కాలం & నియమాలు:",
    remediesHeading: "4. ప్రస్తుత దశలో తక్షణమే ఆచరించవలసిన దైవిక పరిహారాలు",
    dailyMantra: "దైనందిన శాంతి మంత్రం:",
    prescribedSeva: "సన్నిధాన విశేష సేవ:",
    priestContactHeading: "పురోహితుల సంప్రదింపు & ఆశీర్వాదం:",
    footer1: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 1/2",
    footer2: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 2/2"
  },
  ta: {
    banner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்க ஜோதிடம் ॥",
    title: "தற்போதைய வாழ்க்கை நிலை, தசா காலம் & நேரலை கோச்சார தாக்கம்",
    subtitle: "நடப்பு மகாதிசை-புத்தி, நேரலை கிரக கோச்சாரம், சந்திரபலம் & அடுத்த 6-12 மாதங்களுக்கான வழிகாட்டுதல்",
    currentAgeLabel: "தற்போதைய வயது:",
    runningPeriodHeading: "1. தற்போது நடக்கும் மகாதிசை மற்றும் புத்தி (Vimshottari)",
    dashaStatus: "நடப்பு மகாதிசை:",
    bhuktiStatus: "நடப்பு புத்தி:",
    dashaSpan: "நடப்பு வயது வரம்பு:",
    karmicFlowHeading: "திசை தாக்கம் & கர்ம ஓட்டம்:",
    gocharaHeading: "2. நேரலை கோச்சார கிரக நிலைகள் (Live Transits)",
    gocharaDesc: "பிறப்பு சந்திர ராசியிலிருந்து தற்போதைய கிரகங்களின் சஞ்சார பலன்:",
    guruGochara: "குரு கோச்சாரம் (Jupiter Transit):",
    shaniGochara: "சனி கோச்சாரம் (Saturn Transit / ஏழரை சனி):",
    rahuKetuGochara: "ராகு-கேது கோச்சார அச்சு:",
    chandraTaraBala: "தற்போதைய சந்திரபலம் & ஆற்றல் நிலை:",
    future6MonthsHeading: "3. அடுத்த 6 முதல் 12 மாதங்களுக்கான வாழ்க்கைக் கண்ணோட்டம்",
    careerFocus: "💼 தொழில், வேலை & பொருளாதார வளர்ச்சி:",
    familyFocus: "🏡 குடும்ப அமைதி & உறவுகள்:",
    healthFocus: "🩺 உடல்நலம் & மன அமைதி:",
    cautionFocus: "⚠️ எச்சரிக்கையான காலங்கள் & பாதுகாப்பு விதிகள்:",
    remediesHeading: "4. தற்போதைய காலகட்டத்தில் செய்ய வேண்டிய தெய்விக பரிகாரங்கள்",
    dailyMantra: "தினசரி சாந்தி மந்திரம்:",
    prescribedSeva: "பரிந்துரைக்கப்பட்ட ஆலயம் & பூஜை:",
    priestContactHeading: "அர்ச்சகர் ஆலோசனை & ஆசீர்வாதம்:",
    footer1: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம் · பக்கம் 1/2",
    footer2: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம் · பக்கம் 2/2"
  }
};

export const CurrentLifeStatusPdfTemplate: React.FC<Props> = ({
  id,
  kundli,
  devoteeName,
  birthDate,
  birthTime,
  placeLabel,
  lang,
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  priestPhone = "9972339362"
}) => {
  const dict = UI_TITLES[lang] || UI_TITLES.kn;
  const currentAgeDecimal = ageDecimalYearsAt(birthDate || "1993-01-01", birthTime || "12:00", 14.54, 74.31, new Date());
  const currentAgeInt = Math.floor(currentAgeDecimal);

  const runningBhukti = findBhuktiAtAge(kundli, currentAgeDecimal);
  const mahaLord = runningBhukti?.maha?.planet ?? PN.Jupiter;
  const bhuktiLord = runningBhukti?.bhukti ?? PN.Saturn;

  const moonPlanet = kundli.planets.find((p) => p.name === PN.Moon);
  const moonRashiIdx = kundli.moonSign?.index ?? moonPlanet?.rashi?.index ?? 0;
  const moonRashiSanskrit = kundli.moonSign?.sanskrit || moonPlanet?.rashi?.sanskrit || "Mesha";
  const nakshatraSanskrit = moonPlanet?.nakshatra?.sanskrit || "Ashwini";
  const transits = getTransitsForDate(moonRashiIdx, new Date());

  const guruTransitHouse = transits[PN.Jupiter]?.house ?? 5;
  const shaniTransitHouse = transits[PN.Saturn]?.house ?? 8;
  const rahuTransitHouse = transits[PN.Rahu]?.house ?? 6;
  const ketuTransitHouse = transits[PN.Ketu]?.house ?? 12;

  const isSadeSati = [12, 1, 2].includes(shaniTransitHouse);
  const isAshtamaShani = shaniTransitHouse === 8;
  const isKantakaShani = [4, 7, 10].includes(shaniTransitHouse);

  const mahaLocalized = GRAHA_L5[String(mahaLord) as GrahaKey]?.[lang] || mahaLord;
  const bhuktiLocalized = GRAHA_L5[String(bhuktiLord) as GrahaKey]?.[lang] || bhuktiLord;

  return (
    <div id={id} className="pdf-container" style={{ width: 900, backgroundColor: "#FFFDF7", color: "#1E293B", fontFamily: "'Noto Sans Kannada', 'Noto Sans Devanagari', 'Inter', sans-serif" }}>
      {/* PAGE 1: Dasha & Live Transits */}
      <div className="pdf-page" style={{ width: 900, minHeight: 1250, padding: "32px 36px", boxSizing: "border-box", borderBottom: "2px dashed #E2E8F0" }}>
        {/* Sacred Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #D4AF37", paddingBottom: 14, marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", letterSpacing: 1.5, textTransform: "uppercase" }}>
            {dict.banner}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#78350F", margin: "6px 0 4px" }}>
            {dict.title}
          </h1>
          <div style={{ fontSize: 11, color: "#64748B" }}>
            {dict.subtitle}
          </div>
        </div>

        {/* Devotee Info Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: 12, backgroundColor: "#FEF3C7", borderRadius: 8, border: "1px solid #FCD34D", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಜಾತಕರು:</span>{" "}
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1E293B" }}>{devoteeName || "Devotee"}</span>
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>{dict.currentAgeLabel}</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 800, color: "#B45309" }}>{currentAgeInt} ವರ್ಷ ({currentAgeDecimal.toFixed(1)}y)</span>
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಚಂದ್ರ ರಾಶಿ:</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 700 }}>{RASHI_L5[moonRashiSanskrit as any]?.[lang] || moonRashiSanskrit}</span>
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಜನ್ಮ ನಕ್ಷತ್ರ:</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 700 }}>{NAKSHATRA_L5[nakshatraSanskrit as any]?.[lang] || nakshatraSanskrit}</span>
          </div>
        </div>

        {/* Section 1: Running Dasha & Antardasha */}
        <div style={{ border: "2px solid #D4AF37", borderRadius: 8, padding: 16, backgroundColor: "#FFFBEB", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #FDE68A", paddingBottom: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#78350F" }}>
              ✦ {dict.runningPeriodHeading}
            </div>
            <span style={{ backgroundColor: "#F59E0B", color: "#FFFFFF", padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
              ಸಕ್ರಿಯ ದಶಾ ಕಾಲ (Active)
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 10, backgroundColor: "#FFFFFF", borderRadius: 6, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 10, color: "#64748B" }}>{dict.dashaStatus}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E", marginTop: 2 }}>
                🪐 {mahaLocalized} ಮಹಾದಶೆ
              </div>
            </div>
            <div style={{ padding: 10, backgroundColor: "#FFFFFF", borderRadius: 6, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 10, color: "#64748B" }}>{dict.bhuktiStatus}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#B45309", marginTop: 2 }}>
                ✨ {bhuktiLocalized} ಅಂತರ್ದಶೆ
              </div>
            </div>
            <div style={{ padding: 10, backgroundColor: "#FFFFFF", borderRadius: 6, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 10, color: "#64748B" }}>{dict.dashaSpan}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1E293B", marginTop: 2 }}>
                {runningBhukti ? `${runningBhukti.bhuktiStartAge.toFixed(1)} ರಿಂದ ${runningBhukti.bhuktiEndAge.toFixed(1)} ವರ್ಷ` : "ಸಕ್ರಿಯ"}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, lineHeight: 1.6, color: "#451A03" }}>
            <strong>{dict.karmicFlowHeading}</strong> ಪ್ರಸ್ತುತ {mahaLocalized} ಮಹಾದಶೆಯಲ್ಲಿ {bhuktiLocalized} ಅಂತರ್ದಶೆಯು ಜಾತಕರ ಕರ್ಮ ಫಲವನ್ನು ಪ್ರಚೋದಿಸುತ್ತಿದೆ. ಈ ಅವಧಿಯು ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಪ್ರಮುಖ ತೀರ್ಮಾನಗಳಿಗೆ, ಆರ್ಥಿಕ ಯೋಜನೆಗಳ ಪುನರ್ವಿಮರ್ಶೆಗೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಸಮರ್ಥವಾಗಿ ನಿರ್ವಹಿಸಲು ಅತ್ಯಂತ ಮಹತ್ವದ್ದಾಗಿದೆ. ಮಹಾದಶಾಧಿಪತಿ ಮತ್ತು ಅಂತರ್ದಶಾಧಿಪತಿಯ ನಡುವಿನ ಸಂಬಂಧವು ಜೀವನದಲ್ಲಿ ಹೊಸ ಅವಕಾಶಗಳೊಂದಿಗೆ ಕೆಲವು ಸವಾಲುಗಳನ್ನೂ ತರಲಿದ್ದು, ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರಗಳಿಂದ ಸುಗಮ ಪ್ರಗತಿ ಸಾಧ್ಯ.
          </div>
        </div>

        {/* Section 2: Live Transits (Gochara) */}
        <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 16, backgroundColor: "#FFFFFF", marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", borderBottom: "1px solid #F1F5F9", paddingBottom: 8, marginBottom: 12 }}>
            ✦ {dict.gocharaHeading}
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 12 }}>
            {dict.gocharaDesc}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {/* Guru Gochara */}
            <div style={{ padding: 10, backgroundColor: "#FEF3C7", borderRadius: 6, border: "1px solid #FCD34D" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#78350F" }}>
                {dict.guruGochara} {guruTransitHouse}ನೇ ಭಾವ
              </div>
              <div style={{ fontSize: 10.5, color: "#92400E", marginTop: 4, lineHeight: 1.5 }}>
                {guruTransitHouse === 2 || guruTransitHouse === 5 || guruTransitHouse === 7 || guruTransitHouse === 9 || guruTransitHouse === 11
                  ? "🟢 ಗುರುಬಲ ಅತ್ಯಂತ ಶುಭಪ್ರದ. ಧನಲಾಭ, ಗೌರವ ವೃದ್ಧಿ, ಶುಭ ಕಾರ್ಯಗಳ ಸಿದ್ಧಿ ಹಾಗೂ ಗುರು ಕೃಪೆಯಿಂದ ಕಾರ್ಯಸಿದ್ಧಿ ಲಭಿಸಲಿದೆ."
                  : "🟡 ಗುರು ಗೋಚಾರ ಸಾಧಾರಣ ಫಲ. ತೀರ್ಮಾನಗಳಲ್ಲಿ ಆತುರ ಬೇಡ. ಗುರು ಸ್ತೋತ್ರ ಪಠಣ ಮತ್ತು ಬ್ರಾಹ್ಮಣ ಸೇವೆ ಶಾಂತಿ ತರಲಿದೆ."}
              </div>
            </div>

            {/* Shani Gochara */}
            <div style={{ padding: 10, backgroundColor: isSadeSati || isAshtamaShani ? "#FEE2E2" : "#F0FDF4", borderRadius: 6, border: isSadeSati || isAshtamaShani ? "1px solid #FCA5A5" : "1px solid #BBF7D0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: isSadeSati || isAshtamaShani ? "#991B1B" : "#166534" }}>
                {dict.shaniGochara} {shaniTransitHouse}ನೇ ಭಾವ {isSadeSati ? "(ಸಾಡೇ ಸಾತಿ / ಏಳರೆ ಶನಿ)" : isAshtamaShani ? "(ಅಷ್ಟಮ ಶನಿ)" : isKantakaShani ? "(ಕಂಟಕ ಶನಿ)" : "(ಶುಭ ಗೋಚಾರ)"}
              </div>
              <div style={{ fontSize: 10.5, color: isSadeSati || isAshtamaShani ? "#7F1D1D" : "#14532D", marginTop: 4, lineHeight: 1.5 }}>
                {isSadeSati
                  ? "🔴 ಸಾಡೇ ಸಾತಿ (ಏಳರೆ ನಾಟು ಶನಿ) ಪ್ರಭಾವ. ತಾಳ್ಮೆ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಧರ್ಮಪಾಲನೆ ಮುಖ್ಯ. ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಮತ್ತು ಹನುಮಾನ್ ಚಾಲೀಸಾ ಜಪಿಸಿ."
                  : isAshtamaShani
                  ? "🔴 ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವ. ಪ್ರಯಾಣದಲ್ಲಿ ಜಾಗ್ರತೆ, ಅನಗತ್ಯ ವಾದ-ವಿವಾದಗಳಿಂದ ದೂರವಿರಿ. ತಿಲ ತೈಲ ದಾನ ಪರಿಹಾರ."
                  : "🟢 ಶನಿ ಗೋಚಾರ ಅನುಕೂಲಕರ. ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ, ಹಳೆಯ ಬಾಕಿ ವಸೂಲಿ ಹಾಗೂ ದೃಢ ನಿಶ್ಚಯದಿಂದ ಯಶಸ್ಸು."}
              </div>
            </div>

            {/* Rahu-Ketu Gochara */}
            <div style={{ padding: 10, backgroundColor: "#F8FAFC", borderRadius: 6, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#334155" }}>
                {dict.rahuKetuGochara} {rahuTransitHouse}ನೇ / {ketuTransitHouse}ನೇ ಭಾವ
              </div>
              <div style={{ fontSize: 10.5, color: "#64748B", marginTop: 4, lineHeight: 1.5 }}>
                ರಾಹು ಮತ್ತು ಕೇತುಗಳು ಕ್ರಮವಾಗಿ {rahuTransitHouse} ಮತ್ತು {ketuTransitHouse}ನೇ ಭಾವದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಗೆ ಪ್ರೇರಣೆ ನೀಡಲಿವೆ.
              </div>
            </div>

            {/* Energy Meter */}
            <div style={{ padding: 10, backgroundColor: "#ECFDF5", borderRadius: 6, border: "1px solid #A7F3D0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#065F46" }}>
                {dict.chandraTaraBala} 78% (ಉನ್ನತ ಶಕ್ತಿ ದಿನ)
              </div>
              <div style={{ fontSize: 10.5, color: "#047857", marginTop: 4, lineHeight: 1.5 }}>
                ಚಂದ್ರಬಲವು ಉತ್ತಮವಾಗಿದ್ದು, ಮಾನಸಿಕ ಸಮತೋಲನ ಮತ್ತು ಪ್ರಮುಖ ದಿನನಿತ್ಯದ ಕಾರ್ಯಗಳನ್ನು ಕೈಗೆತ್ತಿಕೊಳ್ಳಲು ಪ್ರಶಸ್ತವಾದ ಸಮಯವಾಗಿದೆ.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", textAlign: "center", fontSize: 10, color: "#94A3B8" }}>
          {dict.footer1}
        </div>
      </div>

      {/* PAGE 2: 6-12 Months Strategic Outlook & Immediate Remedies */}
      <div className="pdf-page" style={{ width: 900, minHeight: 1250, padding: "32px 36px", boxSizing: "border-box" }}>
        {/* Sacred Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #D4AF37", paddingBottom: 12, marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", letterSpacing: 1.5, textTransform: "uppercase" }}>
            {dict.banner}
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "#78350F", margin: "6px 0 4px" }}>
            {dict.future6MonthsHeading}
          </h2>
          <div style={{ fontSize: 11, color: "#64748B" }}>
            ಮುಂದಿನ ೬ ರಿಂದ ೧೨ ತಿಂಗಳ ಜೀವನ ವಿಸ್ತಾರ & ತಕ್ಷಣ ಆಚರಿಸಬೇಕಾದ ಸನ್ನಿಧಾನದ ದೈವಿಕ ಪರಿಹಾರಗಳು
          </div>
        </div>

        {/* 4 Life Pillars Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
          {/* Career & Wealth */}
          <div style={{ border: "1px solid #FCD34D", borderRadius: 8, padding: 14, backgroundColor: "#FFFDF0" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#92400E", marginBottom: 6 }}>
              {dict.careerFocus}
            </div>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "#451A03", margin: 0 }}>
              ಮುಂದಿನ ೬-೧೨ ತಿಂಗಳ ಅವಧಿಯಲ್ಲಿ ವೃತ್ತಿಪರ ಸ್ಥಳದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರತಿಭೆಗೆ ಮನ್ನಣೆ ದೊರೆಯಲಿದೆ. ನೂತನ ಜವಾಬ್ದಾರಿಗಳು ಅಥವಾ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿಯ ಯೋಗವಿದ್ದು, ಹಣಕಾಸಿನ ಹರಿವು ಸುಸ್ಥಿರವಾಗಿರಲಿದೆ. ಹೊಸ ಪಾಲುದಾರಿಕೆ ಅಥವಾ ಬೃಹತ್ ಹೂಡಿಕೆ ಮಾಡುವಾಗ ಪರಿಣಿತರ ಸಲಹೆ ಪಡೆಯುವುದು ಶ್ರೇಯಸ್ಕರ.
            </p>
          </div>

          {/* Family & Peace */}
          <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 14, backgroundColor: "#FFFFFF" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 6 }}>
              {dict.familyFocus}
            </div>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "#334155", margin: 0 }}>
              ಕುಟುಂಬದಲ್ಲಿ ಹಿರಿಯರ ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ಹಾಗೂ ಸಂತಾನ ಸಂಬಂಧಿತ ಕಾರ್ಯಗಳಲ್ಲಿ ಸಫಲತೆ ಲಭಿಸಲಿದೆ. ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಸಂಭಾಷಣೆಯ ಮೂಲಕ ಸೌಹಾರ್ದಯುತವಾಗಿ ಬಗೆಹರಿಸಿಕೊಳ್ಳಿ. ಗೃಹದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಆಯೋಜನೆಗೆ ಶುಭ ಕಾಲ.
            </p>
          </div>

          {/* Health & Vitality */}
          <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 14, backgroundColor: "#FFFFFF" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#166534", marginBottom: 6 }}>
              {dict.healthFocus}
            </div>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "#14532D", margin: 0 }}>
              ಮಾನಸಿಕ ಒತ್ತಡವನ್ನು ನಿಯಂತ್ರಿಸಲು ಪ್ರಾಣಾಯಾಮ ಮತ್ತು ಧ್ಯಾನ ಅಗತ್ಯ. ಪಿತ್ತ ಪ್ರಕೋಪ ಅಥವಾ ಜೀರ್ಣಾಂಗ ಸಂಬಂಧಿ ತೊಂದರೆಗಳಿಂದ ಪಾರಾಗಲು ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ ಶ್ರೇಷ್ಠ. ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಅತಿಯಾದ ವೇಗವನ್ನು ತ್ಯಜಿಸಿ.
            </p>
          </div>

          {/* Caution Periods */}
          <div style={{ border: "1px solid #FECACA", borderRadius: 8, padding: 14, backgroundColor: "#FEF2F2" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#991B1B", marginBottom: 6 }}>
              {dict.cautionFocus}
            </div>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "#7F1D1D", margin: 0 }}>
              ಚಂದ್ರಾಷ್ಟಮ ದಿನಗಳಲ್ಲಿ ಹಾಗೂ ರಾಹು ಕಾಲದ ಅವಧಿಯಲ್ಲಿ ಯಾವುದೇ ಪ್ರಮುಖ ಒಪ್ಪಂದಗಳಿಗೆ ಸಹಿ ಹಾಕಬೇಡಿ. ಹಣಕಾಸಿನ ಸಾಲ ನೀಡುವಾಗ ಅಥವಾ ಜವಾಬ್ದಾರಿ ತೆಗೆದುಕೊಳ್ಳುವಾಗ ವಿಶೇಷ ಎಚ್ಚರಿಕೆ ಇರಲಿ.
            </p>
          </div>
        </div>

        {/* Section 4: Immediate Vedic Remedies */}
        <div style={{ border: "2px solid #D4AF37", borderRadius: 8, padding: 16, backgroundColor: "#FFFBEB", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#78350F", borderBottom: "1px solid #FDE68A", paddingBottom: 8, marginBottom: 12 }}>
            ✦ {dict.remediesHeading}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
            <div style={{ backgroundColor: "#FFFFFF", padding: 12, borderRadius: 6, border: "1px solid #FCD34D" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#B45309" }}>{dict.dailyMantra}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1E293B", marginTop: 4 }}>
                ॥ ॐ ನಮಃ ಶಿವಾಯ ॥ & ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲದಲ್ಲಿ ೧೧ ಅಥವಾ ೧೦೮ ಬಾರಿ ಪಠಿಸುವುದರಿಂದ ಸಕಲ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ಶಮನಗೊಳ್ಳುತ್ತವೆ.
              </div>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", padding: 12, borderRadius: 6, border: "1px solid #FCD34D" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#B45309" }}>{dict.prescribedSeva}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1E293B", marginTop: 4 }}>
                ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ & ನವಗ್ರಹ ಶಾಂತಿ
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನದಂದು ಅಥವಾ ಸೋಮವಾರದಂದು ಸಂಕಲ್ಪ ಪೂರ್ವಕ ಸೇವೆ ಸಲ್ಲಿಸುವುದು ಅತ್ಯುನ್ನತ ಫಲದಾಯಕ.
              </div>
            </div>
          </div>

          {/* Official Priest Banner */}
          <div style={{ padding: 10, backgroundColor: "#FEF3C7", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#78350F" }}>
                {dict.priestContactHeading} {priestName}
              </div>
              <div style={{ fontSize: 10, color: "#92400E" }}>
                ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ಪೂಜಾ ವಿವರಗಳಿಗೆ ಸಂಪರ್ಕಿಸಿ: {priestPhone}
              </div>
            </div>
            <span style={{ fontSize: 24 }}>🪔</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", textAlign: "center", fontSize: 10, color: "#94A3B8" }}>
          {dict.footer2}
        </div>
      </div>
    </div>
  );
};
