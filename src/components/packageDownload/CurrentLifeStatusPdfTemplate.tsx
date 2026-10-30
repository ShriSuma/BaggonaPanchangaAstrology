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
    footer2: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೨/೨",
    devoteeLabel: "ಜಾತಕರು",
    moonSignLabel: "ಚಂದ್ರ ರಾಶಿ",
    nakshatraLabel: "ಜನ್ಮ ನಕ್ಷತ್ರ",
    activeBadge: "ಸಕ್ರಿಯ ದಶಾ ಕಾಲ (Active)",
    yearsUnit: "ವರ್ಷ",
    dashaSuffix: "ಮಹಾದಶೆ",
    bhuktiSuffix: "ಅಂತರ್ದಶೆ",
    priestContactNote: "ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ಪೂಜಾ ವಿವರಗಳಿಗೆ ಸಂಪರ್ಕಿಸಿ:",
    page2Subtitle: "ಮುಂದಿನ ೬ ರಿಂದ ೧೨ ತಿಂಗಳ ಜೀವನ ವಿಸ್ತಾರ & ತಕ್ಷಣ ಆಚರಿಸಬೇಕಾದ ಸನ್ನಿಧಾನದ ದೈವಿಕ ಪರಿಹಾರಗಳು",
    energyMeterHigh: "ಉನ್ನತ ಶಕ್ತಿ ದಿನ",
    energyMeterModerate: "ಮಧ್ಯಮ ಶಕ್ತಿ ದಿನ",
    energyDescHigh: "ಚಂದ್ರಬಲವು ಉತ್ತಮವಾಗಿದ್ದು, ಮಾನಸಿಕ ಸಮತೋಲನ ಮತ್ತು ಪ್ರಮುಖ ದಿನನಿತ್ಯದ ಕಾರ್ಯಗಳನ್ನು ಕೈಗೆತ್ತಿಕೊಳ್ಳಲು ಪ್ರಶಸ್ತವಾದ ಸಮಯವಾಗಿದೆ.",
    energyDescModerate: "ದಿನದ ಶಕ್ತಿ ಸಮತೋಲನದಲ್ಲಿದೆ. ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಮುನ್ನ ಗುರು ಹಿರಿಯರ ಸಲಹೆ ಪಡೆಯುವುದು ಉತ್ತಮ.",
    mantraText: "॥ ॐ ನಮಃ ಶಿವಾಯ ॥ & ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ",
    mantraDesc: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲದಲ್ಲಿ ೧೧ ಅಥವಾ ೧೦೮ ಬಾರಿ ಪಠಿಸುವುದರಿಂದ ಸಕಲ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ಶಮನಗೊಳ್ಳುತ್ತವೆ.",
    sevaText: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ & ನವಗ್ರಹ ಶಾಂತಿ",
    sevaDesc: "ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನದಂದು ಅಥವಾ ಸೋಮವಾರದಂದು ಸಂಕಲ್ಪ ಪೂರ್ವಕ ಸೇವೆ ಸಲ್ಲಿಸುವುದು ಅತ್ಯುನ್ನತ ಫಲದಾಯಕ."
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
    footer2: "Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga · Page 2/2",
    devoteeLabel: "Devotee",
    moonSignLabel: "Moon Sign",
    nakshatraLabel: "Birth Star",
    activeBadge: "Active Running Period",
    yearsUnit: "years",
    dashaSuffix: "Mahadasha",
    bhuktiSuffix: "Antardasha",
    priestContactNote: "For calendar & sacred seva appointments, contact:",
    page2Subtitle: "Immediate 6 to 12-month life horizon & authentic sacred remedies to observe.",
    energyMeterHigh: "High Energy Alignment",
    energyMeterModerate: "Balanced Energy Alignment",
    energyDescHigh: "Lunar strength is robust, promoting mental clarity and favorable execution for essential pursuits.",
    energyDescModerate: "Daily energy remains steady; verify critical decisions with patience and diligence.",
    mantraText: "॥ Om Namah Shivaya ॥ & Maha Mrityunjaya Mantra",
    mantraDesc: "Chanting 11 or 108 times daily at sunrise dispels anxieties and neutralizes negative energies.",
    sevaText: "Rudrabhisheka & Navagraha Shanti Pooja at Sri Gokarna Sannidhi",
    sevaDesc: "Performing sankalpa seva on your birth star day or Mondays bestows supreme divine shielding."
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
    footer2: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ २/२",
    devoteeLabel: "जातक",
    moonSignLabel: "चंद्र राशि",
    nakshatraLabel: "जन्म नक्षत्र",
    activeBadge: "सक्रिय दशा काल (Active)",
    yearsUnit: "वर्ष",
    dashaSuffix: "महादशा",
    bhuktiSuffix: "अंतर्दशा",
    priestContactNote: "कैलेंडर एवं पूजा विवरण हेतु संपर्क करें:",
    page2Subtitle: "आगामी ६ से १२ माह का जीवन क्षितिज एवं तत्काल अनुकरणीय दैवीय उपाय",
    energyMeterHigh: "उच्च ऊर्जा स्तर",
    energyMeterModerate: "मध्यम ऊर्जा स्तर",
    energyDescHigh: "चंद्रबल उत्तम है, जो मानसिक स्पष्टता और दैनिक महत्वपूर्ण कार्यों की सफलता हेतु अनुकूल है।",
    energyDescModerate: "दैनिक ऊर्जा संतुलित है; महत्वपूर्ण निर्णय धैर्य और विचारपूर्वक लें।",
    mantraText: "॥ ॐ नमः शिवाय ॥ एवं महामृत्युंजय मंत्र",
    mantraDesc: "प्रतिदिन प्रातःकाल ११ या १०८ बार जप करने से समस्त नकारात्मक ऊर्जाएं शांत होती हैं।",
    sevaText: "श्री गोकर्ण महाबलेश्वर सन्निधि में रुद्राभिषेक एवं नवग्रह शांति",
    sevaDesc: "जन्म नक्षत्र के दिन अथवा सोमवार को संकल्प पूर्वक सेवा करना अत्यंत फलदायी है।"
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
    footer2: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 2/2",
    devoteeLabel: "జాతకులు",
    moonSignLabel: "చంద్ర రాశి",
    nakshatraLabel: "జన్మ నక్షత్రం",
    activeBadge: "సక్రియ దశా కాలం (Active)",
    yearsUnit: "సంవత్సరాలు",
    dashaSuffix: "మహర్దశ",
    bhuktiSuffix: "అంతర్దశ",
    priestContactNote: "క్యాలెండర్ మరియు పూజా వివరాల కోసం సంప్రదించండి:",
    page2Subtitle: "రాబోయే 6 నుండి 12 నెలల జీవిత విస్తృతి & తక్షణమే ఆచరించవలసిన దైవిక పరిహారాలు",
    energyMeterHigh: "ఉన్నత శక్తి రోజు",
    energyMeterModerate: "మధ్యమ శక్తి రోజు",
    energyDescHigh: "చంద్రబలం బాగుంది, మానసిక స్థైర్యం మరియు రోజువారీ ముఖ్య కార్యాల నిర్వహణకు అనుకూలమైన సమయం.",
    energyDescModerate: "రోజువారీ శక్తి సమతుల్యంగా ఉంది; కీలక నిర్ణయాలు తీసుకునే ముందు సంయమనం పాటించండి.",
    mantraText: "॥ ఓం నమః శివాయ ॥ & మహామృత్యుంజయ మంత్రం",
    mantraDesc: "ప్రతిరోజూ ఉదయం 11 లేదా 108 సార్లు జపించడం ద్వారా ప్రతికూల శక్తులు నశిస్తాయి.",
    sevaText: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధిలో రుద్రాభిషేకం & నవగ్రహ శాంతి",
    sevaDesc: "జన్మ నక్షత్రం రోజున లేదా సోమవారం నాడు సంకల్ప సహిత సేవ ఆచరించడం అత్యుత్తమ ఫలితాన్నిస్తుంది."
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
    footer2: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம் · பக்கம் 2/2",
    devoteeLabel: "ஜாதகர்",
    moonSignLabel: "சந்திர ராசி",
    nakshatraLabel: "பிறப்பு நட்சத்திரம்",
    activeBadge: "நடப்பு திசை காலம் (Active)",
    yearsUnit: "ஆண்டுகள்",
    dashaSuffix: "மகாதிசை",
    bhuktiSuffix: "புத்தி",
    priestContactNote: "நாள்காட்டி மற்றும் பூஜை விவரங்களுக்கு தொடர்பு கொள்ளவும்:",
    page2Subtitle: "அடுத்த 6 முதல் 12 மாத கால வாழ்க்கை விரிவு & உடனடியாக செய்ய வேண்டிய தெய்விக பரிகாரங்கள்",
    energyMeterHigh: "உயர் ஆற்றல் நாள்",
    energyMeterModerate: "மிதமான ஆற்றல் நாள்",
    energyDescHigh: "சந்திரபலம் சிறப்பாக உள்ளது, மனத்தெளிவு மற்றும் முக்கிய பணிகளைத் தொடங்க இது உகந்த நேரம்.",
    energyDescModerate: "தினசரி ஆற்றல் சமநிலையில் உள்ளது; முக்கிய முடிவுகளை நிதானமாக எடுக்கவும்.",
    mantraText: "॥ ஓம் நம சிவாய ॥ & மகா மிருத்யுஞ்சய மந்திரம்",
    mantraDesc: "தினமும் அதிகாலையில் 11 அல்லது 108 முறை பாராயணம் செய்வது எதிர்மறை ஆற்றல்களை நீக்கும்.",
    sevaText: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதியில் ருத்ராபிஷேகம் & நவகிரக சாந்தி",
    sevaDesc: "பிறப்பு நட்சத்திர நாளிலோ அல்லது திங்கட்கிழமையிலோ சங்கல்ப பூஜை செய்வது மிகுந்த நன்மையளிக்கும்."
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

  // Dynamic energy score derived from natal strengths & transit harmonizers
  let dynamicEnergyScore = 68;
  const isGuruBeneficTransit = [2, 5, 7, 9, 11].includes(guruTransitHouse);
  if (isGuruBeneficTransit) dynamicEnergyScore += 12;
  if (!isSadeSati && !isAshtamaShani) dynamicEnergyScore += 8;
  if (isSadeSati) dynamicEnergyScore -= 8;
  if (isAshtamaShani) dynamicEnergyScore -= 10;
  if (kundli.planets.some((p) => p.isExalted)) dynamicEnergyScore += 6;
  dynamicEnergyScore = Math.min(95, Math.max(52, dynamicEnergyScore));

  const isHighEnergy = dynamicEnergyScore >= 70;
  const localizedEnergyMeter = isHighEnergy ? dict.energyMeterHigh : dict.energyMeterModerate;
  const localizedEnergyDesc = isHighEnergy ? dict.energyDescHigh : dict.energyDescModerate;

  const localizedPriestName = priestName || (lang === "kn" ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" : lang === "hi" ? "श्रीराम पंडित" : lang === "te" ? "శ్రీరామ్ పండిట్" : lang === "ta" ? "ஸ்ரீராம் பண்டிட்" : "Shreeram Pandit");

  const houseSuffix = lang === "kn" ? "ನೇ ಭಾವ" : lang === "hi" ? "वां भाव" : lang === "te" ? "వ భావం" : lang === "ta" ? "ஆம் இடம்" : "th House";

  const shaniStatusTag = isSadeSati
    ? (lang === "kn" ? "(ಸಾಡೇ ಸಾತಿ / ಏಳರೆ ಶನಿ)" : lang === "hi" ? "(साढ़े साती)" : lang === "te" ? "(ఏలినాటి శని)" : lang === "ta" ? "(ஏழரை சனி)" : "(Sade Sati)")
    : isAshtamaShani
    ? (lang === "kn" ? "(ಅಷ್ಟಮ ಶನಿ)" : lang === "hi" ? "(अष्टम शनि)" : lang === "te" ? "(అష్టమ శని)" : lang === "ta" ? "(அஷ்டம சனி)" : "(Ashtama Shani)")
    : isKantakaShani
    ? (lang === "kn" ? "(ಕಂಟಕ ಶನಿ)" : lang === "hi" ? "(कंटक शनि)" : lang === "te" ? "(కంటక శని)" : lang === "ta" ? "(கண்டக சனி)" : "(Kantaka Shani)")
    : (lang === "kn" ? "(ಶುಭ ಗೋಚಾರ)" : lang === "hi" ? "(शुभ गोचर)" : lang === "te" ? "(శుభ గోచారం)" : lang === "ta" ? "(சுப கோச்சாரம்)" : "(Favorable Transit)");

  const karmicFlowNarrative = lang === "kn"
    ? `ಪ್ರಸ್ತುತ ${mahaLocalized} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiLocalized} ಅಂತರ್ದಶೆಯು ${devoteeName || "ಜಾತಕರ"} ಕರ್ಮ ಫಲವನ್ನು ಪ್ರಚೋದಿಸುತ್ತಿದೆ. ಈ ಅವಧಿಯು ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಪ್ರಮುಖ ತೀರ್ಮಾನಗಳಿಗೆ, ಆರ್ಥಿಕ ಯೋಜನೆಗಳ ಪುನರ್ವಿಮರ್ಶೆಗೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಸಮರ್ಥವಾಗಿ ನಿರ್ವಹಿಸಲು ಅತ್ಯಂತ ಮಹತ್ವದ್ದಾಗಿದೆ. ಮಹಾದಶಾಧಿಪತಿ ಮತ್ತು ಅಂತರ್ದಶಾಧಿಪತಿಯ ನಡುವಿನ ಸಂಬಂಧವು ಜೀವನದಲ್ಲಿ ಹೊಸ ಅವಕಾಶಗಳೊಂದಿಗೆ ಕೆಲವು ಸವಾಲುಗಳನ್ನೂ ತರಲಿದ್ದು, ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರಗಳಿಂದ ಸುಗಮ ಪ್ರಗತಿ ಸಾಧ್ಯ.`
    : lang === "hi"
    ? `वर्तमान में ${mahaLocalized} महादशा एवं ${bhuktiLocalized} अंतर्दशा का प्रभाव ${devoteeName || "जातक"} के कर्म चक्र को जागृत कर रहा है। यह कालखंड आजीविका में महत्वपूर्ण निर्णयों, वित्तीय समीक्षा और पारिवारिक उत्तरदायित्वों को निभाने हेतु अत्यंत महत्वपूर्ण है। शास्त्रोक्त उपायों से प्रगति सुगम होगी।`
    : lang === "te"
    ? `ప్రస్తుతం ${mahaLocalized} మహర్దశ మరియు ${bhuktiLocalized} అంతర్దశ ప్రభావం ${devoteeName || "జాతకుల"} కర్మ ఫలాన్ని ప్రేరేపిస్తోంది. ఈ కాలం ఉద్యోగంలో కీలక నిర్ణయాలకు, ఆర్థిక ప్రణాళికల సమీక్షకు మరియు కుటుంబ బాధ్యతలను నిర్వర్తించడానికి ఎంతో ముఖ్యమైనది. శాస్త్రోక్త పరిహారాలతో సుగమ పురోగతి సాధ్యమవుతుంది.`
    : lang === "ta"
    ? `தற்போது ${mahaLocalized} மகாதிசை மற்றும் ${bhuktiLocalized} புத்தியின் தாக்கம் ${devoteeName || "ஜாதகரின்"} கர்ம பலனை விழிப்படையச் செய்கிறது. இக்காலகட்டம் தொழில் ரீதியான முக்கிய முடிவுகள், நிதி மறுஆய்வு மற்றும் குடும்பக் கடமைகளைச் செவ்வனே ஆற்ற மிக அவசியமானது. சாஸ்திரோக்த பரிகாரங்களால் வெற்றி கிட்டும்.`
    : `Currently, the interplay of ${mahaLocalized} Mahadasha and ${bhuktiLocalized} Antardasha activates the karmic trajectory for ${devoteeName || "the native"}. This phase is pivotal for strategic career consolidation, prudent financial reassessment, and fulfilling core familial duties.`;

  const guruGocharaText = isGuruBeneficTransit
    ? (lang === "kn" ? "🟢 ಗುರುಬಲ ಅತ್ಯಂತ ಶುಭಪ್ರದ. ಧನಲಾಭ, ಗೌರವ ವೃದ್ಧಿ, ಶುಭ ಕಾರ್ಯಗಳ ಸಿದ್ಧಿ ಹಾಗೂ ಗುರು ಕೃಪೆಯಿಂದ ಕಾರ್ಯಸಿದ್ಧಿ ಲಭಿಸಲಿದೆ." :
       lang === "hi" ? "🟢 अत्यंत शुभ गुरु बल। धन लाभ, मान-प्रतिष्ठा में वृद्धि, मांगलिक कार्य सिद्धि एवं गुरु कृपा प्राप्त होगी।" :
       lang === "te" ? "🟢 అత్యంత శుభప్రదమైన గురు బలం. ధనలాభం, గౌరవ వృద్ధి, శుభ కార్యాల సాఫల్యం మరియు గురు అనుగ్రహం కలుగుతాయి." :
       lang === "ta" ? "🟢 மிகச் சிறந்த குரு பலம். தன லாபம், கௌரவ வளர்ச்சி, சுப காரிய வெற்றி மற்றும் குருவின் பரிபூரண அருள் கிட்டும்." :
       "🟢 Highly auspicious Jupiter transit. Favors wealth accumulation, honor, successful ventures, and divine benevolence.")
    : (lang === "kn" ? "🟡 ಗುರು ಗೋಚಾರ ಸಾಧಾರಣ ಫಲ. ತೀರ್ಮಾನಗಳಲ್ಲಿ ಆತುರ ಬೇಡ. ಗುರು ಸ್ತೋತ್ರ ಪಠಣ ಮತ್ತು ಬ್ರಾಹ್ಮಣ ಸೇವೆ ಶಾಂತಿ ತರಲಿದೆ." :
       lang === "hi" ? "🟡 गुरु गोचर सामान्य फलदायी। निर्णयों में उतावलापन न दिखाएं; गुरु स्तोत्र का पाठ शांति प्रदान करेगा।" :
       lang === "te" ? "🟡 గురు గోచారం సాధారణ ఫలితాలు. నిర్ణయాలలో తొందరపాటు వద్దు; గురు స్తోత్ర పఠనం శాంతినిస్తుంది." :
       lang === "ta" ? "🟡 குரு சஞ்சாரம் மிதமான பலன். அவசர முடிவுகளைத் தவிர்க்கவும்; குரு ஸ்தோத்திரம் பாராயணம் அமைதி தரும்." :
       "🟡 Moderate Jupiter influence. Avoid impulsive commitments; recitation of Guru Stotram brings harmony.");

  const shaniGocharaText = isSadeSati
    ? (lang === "kn" ? "🔴 ಸಾಡೇ ಸಾತಿ (ಏಳರೆ ನಾಟು ಶನಿ) ಪ್ರಭಾವ. ತಾಳ್ಮೆ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಧರ್ಮಪಾಲನೆ ಮುಖ್ಯ. ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಮತ್ತು ಹನುಮಾನ್ ಚಾಲೀಸಾ ಜಪಿಸಿ." :
       lang === "hi" ? "🔴 साढ़े साती प्रभाव। धैर्य, सत्यनिष्ठा एवं धर्म का पालन अनिवार्य है। शनिवार को तिल के तेल का दीपक और हनुमान चालीसा का जप करें।" :
       lang === "te" ? "🔴 ఏలినాటి శని ప్రభావం. ఓర్పు, ధర్మం పాటించడం ప్రధానం. శనివారం నువ్వుల నూనె దీపం మరియు హనుమాన్ చాలీసా జపం శుభప్రదం." :
       lang === "ta" ? "🔴 ஏழரை சனி தாக்கம். பொறுமை, நேர்மை மற்றும் தர்ம சிந்தனை முக்கியம். சனிக்கிழமைகளில் நல்லெண்ணெய் தீபம் மற்றும் அனுமன் சாலிசா பாராயணம் செய்யவும்." :
       "🔴 Sade Sati active. Cultivate patience, righteousness, and humility. Lighting sesame oil lamps on Saturdays and chanting Hanuman Chalisa brings protection.")
    : isAshtamaShani
    ? (lang === "kn" ? "🔴 ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವ. ಪ್ರಯಾಣದಲ್ಲಿ ಜಾಗ್ರತೆ, ಅನಗತ್ಯ ವಾದ-ವಿವಾದಗಳಿಂದ ದೂರವಿರಿ. ತಿಲ ತೈಲ ದಾನ ಪರಿಹಾರ." :
       lang === "hi" ? "🔴 अष्टम शनि प्रभाव। यात्रा में सतर्कता बरतें एवं व्यर्थ विवादों से बचें। तिल तेल का दान शांति देगा।" :
       lang === "te" ? "🔴 అష్టమ శని ప్రభావం. ప్రయాణాలలో జాగ్రత్త, అనవసర వివాదాలకు దూరంగా ఉండండి. నువ్వుల నూనె దానం ఉపశమనం ఇస్తుంది." :
       lang === "ta" ? "🔴 அஷ்டம சனி தாக்கம். பயணங்களில் கவனம், வீண் வாக்குவாதங்களைத் தவிர்க்கவும். எள் தானம் சாந்தி தரும்." :
       "🔴 Ashtama Shani influence. Exercise caution during journeys and avoid avoidable disputes. Sesame charity alleviates stress.")
    : (lang === "kn" ? "🟢 ಶನಿ ಗೋಚಾರ ಅನುಕೂಲಕರ. ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ, ಹಳೆಯ ಬಾಕಿ ವಸೂಲಿ ಹಾಗೂ ದೃಢ ನಿಶ್ಚಯದಿಂದ ಯಶಸ್ಸು." :
       lang === "hi" ? "🟢 अनुकूल शनि गोचर। परिश्रम का यथोचित फल, पुराने बकाए की प्राप्ति एवं संकल्प से विजय प्राप्त होगी।" :
       lang === "te" ? "🟢 అనుకూల శని గోచారం. కృషికి తగిన ప్రతిఫలం, మొండి బాకీల వసూలు మరియు పట్టుదలతో విజయం." :
       lang === "ta" ? "🟢 சாதகமான சனி கோச்சாரம். கடின உழைப்புக்குரிய பலன், நிலுவைத் தொகை வசூல் மற்றும் வெற்றிகள் குவியும்." :
       "🟢 Favorable Saturn transit. Diligence yields fruitful rewards, debt recovery, and durable career progress.");

  const rahuKetuGocharaText = lang === "kn"
    ? `ರಾಹು ಮತ್ತು ಕೇತುಗಳು ಕ್ರಮವಾಗಿ ${rahuTransitHouse} ಮತ್ತು ${ketuTransitHouse}ನೇ ಭಾವದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಗೆ ಪ್ರೇರಣೆ ನೀಡಲಿವೆ.`
    : lang === "hi"
    ? `राहु और केतु क्रमशः ${rahuTransitHouse}वें और ${ketuTransitHouse}वें भाव में गोचर कर रहे हैं, जो अप्रत्याशित परिवर्तनों और आध्यात्मिक उन्नति को प्रेरित करते हैं।`
    : lang === "te"
    ? `రాహువు మరియు కేతువులు వరుసగా ${rahuTransitHouse}వ మరియు ${ketuTransitHouse}వ భావాలలో సంచరిస్తూ, ఊహించని మార్పులు మరియు ఆధ్యాత్మిక సాధనకు దోహదపడతారు.`
    : lang === "ta"
    ? `ராகு மற்றும் கேது முறையே ${rahuTransitHouse} மற்றும் ${ketuTransitHouse}ஆம் இடங்களில் சஞ்சரித்து, எதிர்பாராத மாற்றங்களையும் ஆன்மீக நாட்டத்தையும் ஏற்படுத்துகின்றனர்.`
    : `Rahu and Ketu transit through the ${rahuTransitHouse}th and ${ketuTransitHouse}th houses respectively, catalyzing unexpected shifts and deeper spiritual introspection.`;

  const careerNarrative = lang === "kn"
    ? `ಮುಂದಿನ ೬-೧೨ ತಿಂಗಳ ಅವಧಿಯಲ್ಲಿ ${devoteeName || "ಜಾತಕರ"} ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಪ್ರತಿಭೆಗೆ ಮನ್ನಣೆ ದೊರೆಯಲಿದೆ. ನೂತನ ಜವಾಬ್ದಾರಿಗಳು ಅಥವಾ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿಯ ಯೋಗವಿದ್ದು, ಹಣಕಾಸಿನ ಹರಿವು ಸುಸ್ಥಿರವಾಗಿರಲಿದೆ. ಹೊಸ ಪಾಲುದಾರಿಕೆ ಅಥವಾ ಹೂಡಿಕೆ ಮಾಡುವಾಗ ಪರಿಣಿತರ ಸಲಹೆ ಪಡೆಯುವುದು ಶ್ರೇಯಸ್ಕರ.`
    : lang === "hi"
    ? `आगामी ६-१२ माह में ${devoteeName || "जातक"} के कार्यक्षेत्र में उनकी प्रतिभा और परिश्रम को यथोचित सम्मान प्राप्त होगा। नवीन दायित्वों तथा पदोन्नति के योग हैं एवं आर्थिक स्थिति सुदृढ़ रहेगी। बड़े निवेश में वरिष्ठों का मार्गदर्शन लें।`
    : lang === "te"
    ? `రాబోయే 6-12 నెలల్లో ${devoteeName || "జాతకుల"} వృత్తిపరమైన ప్రతిభకు తగిన గుర్తింపు లభిస్తుంది. నూతన బాధ్యతలు లేదా పదోన్నతి లభించే అవకాశాలున్నాయి మరియు ఆర్థిక పరిస్థితి నిలకడగా ఉంటుంది. పెద్ద పెట్టుబడులలో నిపుణుల సలహా శ్రేయస్కరం.`
    : lang === "ta"
    ? `அடுத்த 6-12 மாதங்களில் ${devoteeName || "ஜாதகரின்"} தொழில் மற்றும் உழைப்புக்கு உரிய அங்கீகாரம் கிட்டும். புதிய பொறுப்புகள் அல்லது பதவி உயர்வு வாய்ப்புகள் கூடிவரும், நிதி நிலை சீராகும். பெரிய முதலீடுகளில் பெரியோரின் ஆலோசனை பெறுவது நன்று.`
    : `Over the next 6–12 months, ${devoteeName || "the native"}'s professional dedication will receive well-deserved recognition. Opportunities for elevated responsibilities and steady cash flow are indicated; consult trusted mentors before undertaking substantial capital investments.`;

  const familyNarrative = lang === "kn"
    ? `ಕುಟುಂಬದಲ್ಲಿ ಹಿರಿಯರ ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ಹಾಗೂ ಶುಭ ಕಾರ್ಯಗಳ ಸಿದ್ಧಿ ಲಭಿಸಲಿದೆ. ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಸಂಭಾಷಣೆಯ ಮೂಲಕ ಸೌಹಾರ್ದಯುತವಾಗಿ ಬಗೆಹರಿಸಿಕೊಳ್ಳಿ. ಗೃಹದಲ್ಲಿ ಶಾಂತಿ ಮತ್ತು ನೆಮ್ಮದಿ ನೆಲೆಸಲಿದೆ.`
    : lang === "hi"
    ? `परिवार में वरिष्ठों का स्नेह और सहयोग बना रहेगा तथा मांगलिक कार्यों में सफलता मिलेगी। छोटे-मोटे मतभेदों को संवाद से सुलझाएं। गृह में शांति और सामंजस्य का वातावरण रहेगा।`
    : lang === "te"
    ? `కుటుంబంలో పెద్దల ఆశీస్సులు, ఆప్యాయత లభిస్తాయి మరియు శుభకార్యాలు విజయవంతమవుతాయి. చిన్నపాటి అభిప్రాయ భేదాలను పరస్పర సంభాషణ ద్వారా పరిష్కరించుకోండి. గృహంలో ప్రశాంతత నెలకొంటుంది.`
    : lang === "ta"
    ? `குடும்பத்தில் மூத்தோரின் நல்லாசியும் அன்பும் நிலைத்திருக்கும், சுப காரியங்கள் கைகூடும். சிறிய கருத்து வேறுபாடுகளை அன்பான உரையாடல் மூலம் தீர்த்துக் கொள்ளவும். இல்லத்தில் அமைதியும் மகிழ்ச்சியும் நிலவும்.`
    : `Warmth, trust, and blessings from family elders will prevail. Minor differences can be smoothly harmonized through open dialogue. A peaceful domestic atmosphere and auspicious family events are favored.`;

  const healthNarrative = lang === "kn"
    ? `ಮಾನಸಿಕ ಒತ್ತಡವನ್ನು ನಿಯಂತ್ರಿಸಲು ಪ್ರಾಣಾಯಾಮ ಮತ್ತು ಧ್ಯಾನ ಅಗತ್ಯ. ಪಿತ್ತ ಅಥವಾ ಜೀರ್ಣಾಂಗ ಸಂಬಂಧಿ ತೊಂದರೆಗಳಿಂದ ಪಾರಾಗಲು ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ ಶ್ರೇಷ್ಠ. ಸಮತೋಲಿತ ಜೀವನಶೈಲಿ ನಿಮ್ಮ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಲಿದೆ.`
    : lang === "hi"
    ? `मानसिक शांति हेतु प्राणायाम एवं ध्यान अत्यंत लाभकारी रहेगा। पित्त एवं उदर संबंधी संतुलन बनाए रखने के लिए सात्विक आहार अपनाएं। संतुलित दिनचर्या जीवन ऊर्जा में वृद्धि करेगी।`
    : lang === "te"
    ? `మానసిక ఒత్తిడిని అధిగమించడానికి ప్రాణాయామం మరియు ధ్యానం మేలు చేస్తాయి. జీర్ణక్రియ బాగుండటానికి సాత్విక ఆహారం స్వీకరించండి. క్రమశిక్షణతో కూడిన జీవనశైలి శక్తిని పెంపొందిస్తుంది.`
    : lang === "ta"
    ? `மன அழுத்தத்தைக் கட்டுப்படுத்த பிராணாயாமம் மற்றும் தியானம் துணைபுரியும். செரிமானம் மற்றும் பித்த சமநிலைக்கு சாத்வீக உணவை உட்கொள்ளவும். முறையான தினசரி பழக்கங்கள் புத்துணர்ச்சி தரும்.`
    : `Cultivating mindfulness through Pranayama and regular meditation will balance stress. Adopting wholesome Satvik nutrition supports digestive harmony and vitality; avoid irregular sleep schedules.`;

  const cautionNarrative = lang === "kn"
    ? `ಚಂದ್ರಾಷ್ಟಮ ದಿನಗಳಲ್ಲಿ ಹಾಗೂ ರಾಹು ಕಾಲದ ಅವಧಿಯಲ್ಲಿ ಮಹತ್ವದ ಒಪ್ಪಂದಗಳಿಗೆ ಸಹಿ ಹಾಕಬೇಡಿ. ಹಣಕಾಸಿನ ಸಾಲ ನೀಡುವಾಗ ಅಥವಾ ಆತುರದ ತೀರ್ಮಾನಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವಾಗ ವಿಶೇಷ ಜಾಗ್ರತೆ ವಹಿಸಿ.`
    : lang === "hi"
    ? `चंद्राष्टम दिवसों एवं राहुकाल के दौरान महत्वपूर्ण अनुबंधों पर हस्ताक्षर करने से बचें। वित्तीय लेन-देन एवं जल्दबाजी में लिए जाने वाले निर्णयों में विशेष सावधानी बरतें।`
    : lang === "te"
    ? `చంద్రాష్టమ దినాలలో మరియు రాహుకాల సమయంలో ముఖ్యమైన ఒప్పందాలపై సంతకాలు చేయకండి. ఆర్థిక లావాదేవీలు మరియు తొందరపాటు నిర్ణయాలలో అత్యంత జాగ్రత్త అవసరం.`
    : lang === "ta"
    ? `சந்திராஷ்டம நாட்கள் மற்றும் ராகு கால நேரங்களில் முக்கிய ஒப்பந்தங்களில் கையெழுத்திடுவதைத் தவிர்க்கவும். கடன் கொடுப்பது மற்றும் அவசர முடிவுகளில் விழிப்புடன் இருக்கவும்.`
    : `Avoid signing major binding commitments during Chandrashtama days and Rahu Kaalam windows. Exercise heightened diligence before extending unsecured loans or executing abrupt career moves.`;

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
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>{dict.devoteeLabel}:</span>{" "}
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1E293B" }}>{devoteeName || "Devotee"}</span>
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>{dict.currentAgeLabel}</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 800, color: "#B45309" }}>{currentAgeInt} {dict.yearsUnit} ({currentAgeDecimal.toFixed(1)}y)</span>
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>{dict.moonSignLabel}:</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 700 }}>{RASHI_L5[moonRashiSanskrit as any]?.[lang] || moonRashiSanskrit}</span>
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>{dict.nakshatraLabel}:</span>{" "}
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
              {dict.activeBadge}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 10, backgroundColor: "#FFFFFF", borderRadius: 6, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 10, color: "#64748B" }}>{dict.dashaStatus}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E", marginTop: 2 }}>
                🪐 {mahaLocalized} {dict.dashaSuffix}
              </div>
            </div>
            <div style={{ padding: 10, backgroundColor: "#FFFFFF", borderRadius: 6, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 10, color: "#64748B" }}>{dict.bhuktiStatus}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#B45309", marginTop: 2 }}>
                ✨ {bhuktiLocalized} {dict.bhuktiSuffix}
              </div>
            </div>
            <div style={{ padding: 10, backgroundColor: "#FFFFFF", borderRadius: 6, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 10, color: "#64748B" }}>{dict.dashaSpan}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1E293B", marginTop: 2 }}>
                {runningBhukti ? `${runningBhukti.bhuktiStartAge.toFixed(1)} - ${runningBhukti.bhuktiEndAge.toFixed(1)} ${dict.yearsUnit}` : dict.activeBadge}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, lineHeight: 1.6, color: "#451A03" }}>
            <strong>{dict.karmicFlowHeading}</strong> {karmicFlowNarrative}
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
                {dict.guruGochara} {guruTransitHouse}{houseSuffix}
              </div>
              <div style={{ fontSize: 10.5, color: "#92400E", marginTop: 4, lineHeight: 1.5 }}>
                {guruGocharaText}
              </div>
            </div>

            {/* Shani Gochara */}
            <div style={{ padding: 10, backgroundColor: isSadeSati || isAshtamaShani ? "#FEE2E2" : "#F0FDF4", borderRadius: 6, border: isSadeSati || isAshtamaShani ? "1px solid #FCA5A5" : "1px solid #BBF7D0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: isSadeSati || isAshtamaShani ? "#991B1B" : "#166534" }}>
                {dict.shaniGochara} {shaniTransitHouse}{houseSuffix} {shaniStatusTag}
              </div>
              <div style={{ fontSize: 10.5, color: isSadeSati || isAshtamaShani ? "#7F1D1D" : "#14532D", marginTop: 4, lineHeight: 1.5 }}>
                {shaniGocharaText}
              </div>
            </div>

            {/* Rahu-Ketu Gochara */}
            <div style={{ padding: 10, backgroundColor: "#F8FAFC", borderRadius: 6, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#334155" }}>
                {dict.rahuKetuGochara} {rahuTransitHouse}{houseSuffix} / {ketuTransitHouse}{houseSuffix}
              </div>
              <div style={{ fontSize: 10.5, color: "#64748B", marginTop: 4, lineHeight: 1.5 }}>
                {rahuKetuGocharaText}
              </div>
            </div>

            {/* Energy Meter */}
            <div style={{ padding: 10, backgroundColor: "#ECFDF5", borderRadius: 6, border: "1px solid #A7F3D0" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#065F46" }}>
                {dict.chandraTaraBala} {dynamicEnergyScore}% ({localizedEnergyMeter})
              </div>
              <div style={{ fontSize: 10.5, color: "#047857", marginTop: 4, lineHeight: 1.5 }}>
                {localizedEnergyDesc}
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
            {dict.page2Subtitle}
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
              {careerNarrative}
            </p>
          </div>

          {/* Family & Peace */}
          <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 14, backgroundColor: "#FFFFFF" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 6 }}>
              {dict.familyFocus}
            </div>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "#334155", margin: 0 }}>
              {familyNarrative}
            </p>
          </div>

          {/* Health & Vitality */}
          <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 14, backgroundColor: "#FFFFFF" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#166534", marginBottom: 6 }}>
              {dict.healthFocus}
            </div>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "#14532D", margin: 0 }}>
              {healthNarrative}
            </p>
          </div>

          {/* Caution Periods */}
          <div style={{ border: "1px solid #FECACA", borderRadius: 8, padding: 14, backgroundColor: "#FEF2F2" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#991B1B", marginBottom: 6 }}>
              {dict.cautionFocus}
            </div>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "#7F1D1D", margin: 0 }}>
              {cautionNarrative}
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
                {dict.mantraText}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                {dict.mantraDesc}
              </div>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", padding: 12, borderRadius: 6, border: "1px solid #FCD34D" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#B45309" }}>{dict.prescribedSeva}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1E293B", marginTop: 4 }}>
                {dict.sevaText}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                {dict.sevaDesc}
              </div>
            </div>
          </div>

          {/* Official Priest Banner */}
          <div style={{ padding: 10, backgroundColor: "#FEF3C7", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#78350F" }}>
                {dict.priestContactHeading} {localizedPriestName}
              </div>
              <div style={{ fontSize: 10, color: "#92400E" }}>
                {dict.priestContactNote} {priestPhone}
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
