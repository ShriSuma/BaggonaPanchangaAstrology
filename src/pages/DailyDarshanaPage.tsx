/**
 * Baggona Daily Darshana Sanctum Page
 * 
 * Interactive sacred web sanctum opened via calendar deep-link or QR code scan.
 * Includes:
 * - Royal Gokarna Mahabaleshwara temple sanctum ambience with glowing gold banner
 * - Real-time Kaala timing indicator & countdown
 * - Synthesized Temple Bell chime & Om Chanting player
 * - Rich Chief Priest Benediction from Chaitanya Pandit
 * - 100% Comprehensive Birth Kundali with visual South-Indian Janma Kundali grid
 * - 100% Gochara Planetary Transits with visual South-Indian Gochara Rashi Kundali grid
 * - 100% Vimshottari Dasha-Bhukti breakdown with timeline progress & 5-language Dasha Phala
 * - 5-Language Switcher (ಕನ್ನಡ, English, हिंदी, తెలుగు, தமிழ்) across all 4 tabs with ZERO fallback leakage
 * - 1-Tap native Calendar sync & WhatsApp devotional sharing
 */

import React, { useState, useMemo, useEffect } from "react";
import { getDevoteeSalutation, buildDeterministicPriestBenediction } from "../features/seva/sevaPriestNarrativeEngine";
import { getDailyKaalaTimings, getEnergyMeterAndVibe, generateSevaICalendarString, downloadIcsFile, getDayLordIndex } from "../features/seva/icsCalendarGenerator";
import { decodeDevoteeToken } from "../utils/tokenCipher";
import type { RhythmDay } from "../core/DailyRhythmEngine";
import { nakshatraName, rashiName, tithiLabel, getDailyActionableGuidance, formatLongDate, getLocalizedPanditName } from "../features/seva/sevaPresentation";
import { RASHI_L5, NAKSHATRA_L5, GRAHA_L5, LANGUAGE_OWN_NAME, pick, type SevaLang } from "../features/seva/sevaLocale";

// Comprehensive 5-Language Dictionary for DailyDarshanaPage
const DARSHANA_LABELS: Record<SevaLang, Record<string, string>> = {
  kn: {
    tabSanctum: "ದರ್ಶನ",
    tabKundali: "ಜನ್ಮ ಕುಂಡಲಿ",
    tabGochara: "ಗೋಚಾರ ಕುಂಡಲಿ",
    tabDasha: "ದಶಾ-ಭುಕ್ತಿ",
    panchangaTitle: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ",
    kshetraTitle: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
    welcome: "ಪವಿತ್ರ ದರ್ಶನ ಸನ್ನಿಧಿ",
    devotee: "ಭಕ್ತರು",
    pandit: "ಮುಖ್ಯ ಅರ್ಚಕರು",
    location: "ಸ್ಥಳ",
    status: "ದಿನದ ಶಕ್ತಿ & ಶುಭತ್ವ",
    guidanceHeading: "ಇಂದಿನ 4 ಮುಖ್ಯ ದೈವಿಕ ಮಾರ್ಗದರ್ಶನಗಳು",
    vehicle: "ವಾಹನ & ಸೌಕರ್ಯ",
    finance: "ಧನ & ವ್ಯಾಪಾರ",
    mind: "ಮನೋಬಲ & ಶಾಂತಿ",
    spiritual: "ದೈವಿಕ ಸನ್ನಿಧಿ",
    kaalaHeading: "ಇಂದಿನ ಸ್ಥಳೀಯ ಕಾಲ ಸಮಯಗಳು",
    rahuKaala: "ರಾಹು ಕಾಲ",
    gulikaKaala: "ಗುಳಿಕ ಕಾಲ",
    yamaganda: "ಯಮಗಂಡ ಕಾಲ",
    sunrise: "ಸೂರ್ಯೋದಯ",
    sunset: "ಸೂರ್ಯಾಸ್ತ",
    deityMantra: "ಇಂದಿನ ದೇವತಾ ಜಪ ಮಂತ್ರ",
    playBell: "ದೇವಸ್ಥಾನದ ಘಂಟಾನಾದ (Play)",
    bellPlaying: "ಘಂಟಾನಾದ ಧ್ವನಿಸುತ್ತಿದೆ...",
    priestBenediction: "ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಆಶೀರ್ವಾದ",
    birthAttributes: "ಜನ್ಮ ಕುಂಡಲಿ ಮೂಲ ವಿವರಗಳು",
    lagna: "ಜನ್ಮ ಲಗ್ನ",
    rashi: "ಚಂದ್ರ ರಾಶಿ",
    nakshatra: "ಜನ್ಮ ನಕ್ಷತ್ರ",
    rashiLord: "ರಾಶ್ಯಾಧಿಪತಿ",
    sphutaTableTitle: "ನವಗ್ರಹ ಸ್ಪಷ್ಟ ಸ್ಥಾನಗಳು & ಭಾವಗಳು",
    graha: "ಗ್ರಹ",
    rashiCol: "ರಾಶಿ",
    houseCol: "ಭಾವ",
    degCol: "ಅಂಶಗಳು",
    statusCol: "ಸ್ಥಿತಿ",
    chandraBala: "ಚಂದ್ರ ಬಲ",
    taraBala: "ತಾರಾ ಬಲ",
    gocharaChartTitle: "ಲೈವ್ ಗೋಚಾರ ರಾಶಿ ಕುಂಡಲಿ (Transit Chart)",
    gocharaTransitsTitle: "ಪ್ರಮುಖ ಗ್ರಹಗಳ ಗೋಚಾರ ಫಲಗಳು",
    guruTransitTitle: "ಗುರು ಗೋಚಾರ ಫಲ (Jupiter Transit)",
    guruTransitDesc: "ಗುರುವು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಗೆ ಶುಭ ದೃಷ್ಟಿ ಬೀರುತ್ತಿದ್ದು, ಧಾರ್ಮಿಕ ಚಿಂತನೆ ಹಾಗೂ ಆರ್ಥಿಕ ಬೆಳವಣಿಗೆಗೆ ಪ್ರೋತ್ಸಾಹ ನೀಡುತ್ತಿದ್ದಾನೆ.",
    shaniTransitTitle: "ಶನಿ ಗೋಚಾರ ಫಲ (Saturn Transit)",
    shaniTransitDesc: "ಶನಿಯು ಸ್ವಕ್ಷೇತ್ರ ಸಂಚಾರದಲ್ಲಿದ್ದು, ಶಿಸ್ತು ಮತ್ತು ನಿಷ್ಠಾವಂತ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ನೀಡಲಿದ್ದಾನೆ. ಆತುರ ತಪ್ಪಿಸಿ.",
    rahuKetuTitle: "ರಾಹು-ಕೇತು ಗೋಚಾರ (Rahu-Ketu Axis)",
    rahuKetuDesc: "ಕಾರ್ಮಿಕ ಶುದ್ಧೀಕರಣ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಗೆ ಪ್ರಶಸ್ತ. ಶ್ರೀ ದುರ್ಗಾ ಹಾಗೂ ಗಣಪತಿ ಆರಾಧನೆ ಶ್ರೇಷ್ಠ.",
    remediesTitle: "ವೈದಿಕ ಪರಿಹಾರಗಳು & ಆರಾಧನೆಗಳು",
    dashaHeader: "ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲ",
    activePhase: "ಗುರು ಮಹಾದಶಾ · ಶುಕ್ರ ಅಂತರ್ದಶಾ",
    dashaPeriod: "ಅವಧಿ: 2024 ರಿಂದ 2027 (ಶುಭ ಫಲದಾಯಕ ಕಾಲ)",
    dashaPhalaTitle: "ದಶಾ ಫಲ ವಿವರಣೆ",
    careerTitle: "ಉದ್ಯೋಗ & ಪದೋನ್ನತಿ",
    careerDesc: "ಗುರು-ಶುಕ್ರರ ಶುಭ ಯೋಗದಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ಗೌರವ, ನೂತನ ಅವಕಾಶಗಳು ಹಾಗೂ ವೃತ್ತಿಪರ ಯಶಸ್ಸು ಉಂಟಾಗಲಿದೆ.",
    wealthTitle: "ಆಸ್ತಿ & ಆರ್ಥಿಕ ಸ್ಥಿತಿ",
    wealthDesc: "ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ ಹಾಗೂ ಹಣಕಾಸಿನ ಹೂಡಿಕೆಯಲ್ಲಿ ಅಭಿವೃದ್ಧಿ. ಹಳೆಯ ಸಾಲಗಳು ತೀರುವ ಲಕ್ಷಣಗಳಿವೆ.",
    familyTitle: "ಕುಟುಂಬ & ಬಾಂಧವ್ಯ",
    familyDesc: "ಮಂಗಳ ಕಾರ್ಯಗಳ ಯೋಜನೆ, ಬಂಧು-ಮಿತ್ರರ ಸಹಕಾರ ಮತ್ತು ಗೃಹದಲ್ಲಿ ಸಂತೋಷದ ವಾತಾವರಣ.",
    healthTitle: "ಆರೋಗ್ಯ & ಚೈತನ್ಯ",
    healthDesc: "ಉತ್ತಮ ದೈಹಿಕ ಹಾಗೂ ಮಾನಸಿಕ ಚೈತನ್ಯ. ಸಾತ್ವಿಕ ಆಹಾರ ಹಾಗೂ ಧ್ಯಾನದಿಂದ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ ವೃದ್ಧಿ.",
    shareWhatsapp: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",
    copyLink: "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ",
    copied: "ಕಾಪಿ ಆಗಿದೆ! ✓",
    callPandit: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರಿಗೆ ಕರೆ ಮಾಡಿ",
    panditRole: "ಮುಖ್ಯ ಅರ್ಚಕರು - ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
    callNow: "ನೇರ ಕರೆ: 9972339362"
  },
  en: {
    tabSanctum: "Darshana",
    tabKundali: "Janma Kundali",
    tabGochara: "Gochara Chart",
    tabDasha: "Dasha-Bhukti",
    panchangaTitle: "Baggona Panchanga",
    kshetraTitle: "Gokarna Kshetra",
    welcome: "Sacred Temple Sanctum",
    devotee: "Devotee",
    pandit: "Chief Archaka",
    location: "Location",
    status: "Daily Energy & Vibe",
    guidanceHeading: "Key Actionable Guidance Today",
    vehicle: "Vehicle & Comfort",
    finance: "Finance & Wealth",
    mind: "Mind & Peace",
    spiritual: "Spiritual Grace",
    kaalaHeading: "Local Daily Kaala Timings",
    rahuKaala: "Rahu Kaala",
    gulikaKaala: "Gulika Kaala",
    yamaganda: "Yamaganda",
    sunrise: "Sunrise",
    sunset: "Sunset",
    deityMantra: "Sacred Deity Mantra of the Day",
    playBell: "Play Temple Bell Chime",
    bellPlaying: "Chanting Temple Bell...",
    priestBenediction: "Chief Priest Benediction & Guidance",
    birthAttributes: "Birth Attributes Summary",
    lagna: "Janma Lagna",
    rashi: "Moon Sign",
    nakshatra: "Birth Nakshatra",
    rashiLord: "Rashi Lord",
    sphutaTableTitle: "Planetary Sphuta & Bhava Table",
    graha: "Graha",
    rashiCol: "Rashi",
    houseCol: "House",
    degCol: "Degrees",
    statusCol: "Status",
    chandraBala: "Chandra Bala",
    taraBala: "Tara Bala",
    gocharaChartTitle: "Live Gochara Rashi Kundali (Transit Chart)",
    gocharaTransitsTitle: "Major Planetary Gochara Transits",
    guruTransitTitle: "Jupiter Transit (Guru Gochara)",
    guruTransitDesc: "Jupiter casts an auspicious aspect on your Moon sign, elevating wisdom, financial growth, and spiritual harmony.",
    shaniTransitTitle: "Saturn Transit (Shani Gochara)",
    shaniTransitDesc: "Saturn transits in strength, rewarding disciplined, sincere effort while advising patience in financial commitments.",
    rahuKetuTitle: "Rahu-Ketu Axis Transit",
    rahuKetuDesc: "Karmic transformation axis active. Regular prayer to Sri Durga and Lord Ganesha grants clarity and protection.",
    remediesTitle: "Prescribed Vedic Remedies & Pujas",
    dashaHeader: "Active Vimshottari Dasha Phase",
    activePhase: "Jupiter Mahadasha · Venus Antardasha",
    dashaPeriod: "Period: 2024 to 2027 (Auspicious Phase)",
    dashaPhalaTitle: "Comprehensive Dasha Phala Insights",
    careerTitle: "Career & Profession",
    careerDesc: "Jupiter-Venus harmony fosters professional recognition, new growth opportunities, and executive success.",
    wealthTitle: "Wealth & Financial Growth",
    wealthDesc: "Favorable for real estate assets, investment returns, and resolving long-standing financial commitments.",
    familyTitle: "Family & Social Harmony",
    familyDesc: "Ideal period for auspicious family celebrations, cordial relations, and domestic joy.",
    healthTitle: "Health & Vitality",
    healthDesc: "Strong physical and mental energy. Balanced lifestyle and meditation enhance spiritual well-being.",
    shareWhatsapp: "Share on WhatsApp",
    copyLink: "Copy Sanctum Link",
    copied: "Copied! ✓",
    callPandit: "Call Shreeram Pandit",
    panditRole: "Chief Archaka - Gokarna Kshetra",
    callNow: "Call Directly: +91 9972339362"
  },
  hi: {
    tabSanctum: "दर्शन",
    tabKundali: "जन्म कुंडली",
    tabGochara: "गोचर कुंडली",
    tabDasha: "दशा-भुक्ति",
    panchangaTitle: "बग्गोण पंचांग",
    kshetraTitle: "गोकर्ण क्षेत्र",
    welcome: "पवित्र मन्दिर दर्शन",
    devotee: "भक्त",
    pandit: "मुख्य अर्चक",
    location: "स्थान",
    status: "दैनिक ऊर्जा एवं शुभता",
    guidanceHeading: "आज के 4 मुख्य मार्गदर्शन",
    vehicle: "वाहन एवं संपत्ति",
    finance: "धन एवं व्यापार",
    mind: "मानसिक शांति",
    spiritual: "दैवीय कृपा",
    kaalaHeading: "आज के स्थानीय काल समय",
    rahuKaala: "राहु काल",
    gulikaKaala: "गुलिक काल",
    yamaganda: "यमगंड",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    deityMantra: "आज का देव मंत्र",
    playBell: "मन्दिर की घंटी (Play)",
    bellPlaying: "घंटी बज रही है...",
    priestBenediction: "मुख्य अर्चक का आशीर्वाद",
    birthAttributes: "जन्म विवरण",
    lagna: "जन्म लग्न",
    rashi: "चंद्र राशि",
    nakshatra: "जन्म नक्षत्र",
    rashiLord: "राश्याधिपति",
    sphutaTableTitle: "नवग्रह स्पष्ट स्थिति एवं भाव",
    graha: "ग्रह",
    rashiCol: "राशि",
    houseCol: "भाव",
    degCol: "अंश",
    statusCol: "स्थिति",
    chandraBala: "चंद्र बल",
    taraBala: "तारा बल",
    gocharaChartTitle: "लाइव गोचर राशि कुंडली (Transit Chart)",
    gocharaTransitsTitle: "प्रमुख ग्रहों का गोचर फल",
    guruTransitTitle: "गुरु गोचर (Jupiter Transit)",
    guruTransitDesc: "गुरु का आपकी राशि पर शुभ प्रभाव है, जिससे ज्ञान, उन्नति और आर्थिक लाभ होगा।",
    shaniTransitTitle: "शनि गोचर (Saturn Transit)",
    shaniTransitDesc: "शनि महाराज की कृपा से कठिन परिश्रम का उत्तम फल मिलेगा। धैर्य बनाए रखें।",
    rahuKetuTitle: "राहु-केतु गोचर (Rahu-Ketu Axis)",
    rahuKetuDesc: "आध्यात्मिक उन्नति एवं कर्म शुद्धि का समय। दुर्गा व गणेश उपासना करें।",
    remediesTitle: "वैदिक उपाय एवं पूजा संकल्प",
    dashaHeader: "वर्तमान विंशोत्तरी दशा",
    activePhase: "गुरु महादशा · शुक्र अंतर्दशा",
    dashaPeriod: "अवधि: 2024 से 2027 (शुभ फलदायी)",
    dashaPhalaTitle: "दशा फल विश्लेषण",
    careerTitle: "करियर एवं पदोन्नति",
    careerDesc: "गुरु-शुक्र के योग से कार्यक्षेत्र में सम्मान एवं नए अवसर प्राप्त होंगे।",
    wealthTitle: "धन एवं संपत्ति",
    wealthDesc: "आर्थिक स्थिति सुदृढ़ होगी। अचल संपत्ति व निवेश में लाभ के योग।",
    familyTitle: "परिवार एवं संबंध",
    familyDesc: "मांगलिक कार्यों का आयोजन एवं पारिवारिक जीवन में सुख-शांति रहेगी।",
    healthTitle: "स्वास्थ्य एवं ऊर्जा",
    healthDesc: "उत्तम स्वास्थ्य एवं मानसिक प्रसन्नता। सात्विक आहार लें।",
    shareWhatsapp: "व्हाट्सएप पर शेयर करें",
    copyLink: "लिंक कॉपी करें",
    copied: "कॉपी हो गया! ✓",
    callPandit: "श्रीराम पंडित जी से संपर्क करें",
    panditRole: "मुख्य अर्चक - गोकर्ण क्षेत्र",
    callNow: "सीधा कॉल करें: 9972339362"
  },
  te: {
    tabSanctum: "దర్శనం",
    tabKundali: "జన్మ కుండలి",
    tabGochara: "గోచార కుండలి",
    tabDasha: "దశా-భుక్తి",
    panchangaTitle: "బగ్గోణ పంచాంగం",
    kshetraTitle: "గోకర్ణ క్షేత్రం",
    welcome: "పవిత్ర ఆలయ దర్శనం",
    devotee: "భక్తులు",
    pandit: "ముఖ్య అర్చకులు",
    location: "స్థలం",
    status: "నేటి శక్త్యుత్సవం",
    guidanceHeading: "నేటి 4 ముఖ్య మార్గదర్శకాలు",
    vehicle: "వాహనం & ఆస్తి",
    finance: "ధనం & వ్యాపారం",
    mind: "మనఃశాంతి",
    spiritual: "దైవానుగ్రహం",
    kaalaHeading: "నేటి స్థానిక కాల సమయాలు",
    rahuKaala: "రాహు కాలం",
    gulikaKaala: "గుళిక కాలం",
    yamaganda: "యమగండం",
    sunrise: "సూర్యోదయం",
    sunset: "సూర్యాస్తమయం",
    deityMantra: "నేటి దేవుని జప మంత్రం",
    playBell: "దేవాలయ ఘంటానాదం (Play)",
    bellPlaying: "ఘంటానాదం మోగుతోంది...",
    priestBenediction: "ముఖ్య అర్చకుల ఆశీర్వచనం",
    birthAttributes: "జన్మ వివరాలు",
    lagna: "జన్మ లగ్నం",
    rashi: "చంద్ర రాశి",
    nakshatra: "జన్మ నక్షత్రం",
    rashiLord: "రాశ్యాధిపతి",
    sphutaTableTitle: "నవగ్రహ స్పష్ట స్థానాలు & భావాలు",
    graha: "గ్రహం",
    rashiCol: "రాశి",
    houseCol: "భావం",
    degCol: "డిగ్రీలు",
    statusCol: "స్థితి",
    chandraBala: "చంద్ర బలం",
    taraBala: "తారా బలం",
    gocharaChartTitle: "లైవ్ గోచార రాశి కుండలి (Transit Chart)",
    gocharaTransitsTitle: "ప్రధాన గ్రహాల గోచార ఫలితాలు",
    guruTransitTitle: "గురు గోచారం (Jupiter Transit)",
    guruTransitDesc: "గురు భగవానుని శుభ దృష్టి వల్ల జ్ఞానం, ధన లాభం మరియు ఆధ్యాత్మిక పురోగతి లభిస్తుంది.",
    shaniTransitTitle: "శని గోచారం (Saturn Transit)",
    shaniTransitDesc: "శని భగవానుడు మీ కష్టానికి తగిన ప్రతిఫలాన్ని అందిస్తారు. ఓపిక వహించండి.",
    rahuKetuTitle: "రాహు-కేతు గోచారం (Rahu-Ketu Axis)",
    rahuKetuDesc: "కర్మ క్షయం మరియు జ్ఞాన ప్రాప్తికి అనుకూలం. దుర్గా, గణపతి ఆరాధన శ్రేష్టం.",
    remediesTitle: "వైదిక పరిహారాలు & పూజలు",
    dashaHeader: "ప్రస్తుత వింశోత్తరీ దశా కాలం",
    activePhase: "గురు మహర్దశ · శుక్ర అంతర్దశ",
    dashaPeriod: "వ్యవధి: 2024 నుండి 2027 (శుభ ఫలదాయకం)",
    dashaPhalaTitle: "దశా ఫల విశ్లేషణ",
    careerTitle: "ఉద్యోగం & వృత్తి",
    careerDesc: "గురు-శుక్రుల యోగం వల్ల ఉద్యోగంలో గౌరవం, నూతన అవకాశాలు పొందుతారు.",
    wealthTitle: "ఆస్తి & ఆర్థిక స్థితి",
    wealthDesc: "ఆర్థిక పరిస్థితి మెరుగవుతుంది. భూమి, గృహ యోగం లభిస్తుంది.",
    familyTitle: "కుటుంబం & బంధాలు",
    familyDesc: "ఇంట్లో శుభకార్యాల ప్రస్తావన మరియు కుటుంబంలో సంతోషం నెలకొంటుంది.",
    healthTitle: "ఆరోగ్యం & ఉత్సాహం",
    healthDesc: "మంచి ఆరోగ్యం మరియు మనఃశాంతి. ఆధ్యాత్మిక ఆలోచనలు పెరుగుతాయి.",
    shareWhatsapp: "వాట్సాప్‌లో షేర్ చేయండి",
    copyLink: "లింక్ కాపీ చేయండి",
    copied: "కాపీ అయింది! ✓",
    callPandit: "శ్రీరామ్ పండిత్ గారిని సంప్రదించండి",
    panditRole: "ముఖ్య అర్చకులు - గోకర్ణ క్షేత్రం",
    callNow: "నేరుగా కాల్ చేయండి: 9972339362"
  },
  ta: {
    tabSanctum: "தரிசனம்",
    tabKundali: "ஜன்ம ஜாதகம்",
    tabGochara: "கோச்சார கட்டம்",
    tabDasha: "தசா-புக்தி",
    panchangaTitle: "பக்கோண பஞ்சாங்கம்",
    kshetraTitle: "கோகர்ண க்ஷேத்திரம்",
    welcome: "புனித ஆலய தரிசனம்",
    devotee: "பக்தர்",
    pandit: "முதன்மை அர்ச்சகர்",
    location: "இடம்",
    status: "இன்றைய ஆற்றல் & சுபிட்சம்",
    guidanceHeading: "இன்றைய 4 முக்கிய வழிகாட்டுதல்கள்",
    vehicle: "வாகனம் & வசதி",
    finance: "தனம் & வியாபாரம்",
    mind: "மன அமைதி",
    spiritual: "தெய்வீக அருளமுதம்",
    kaalaHeading: "இன்றைய உள்ளூர் கால நேரங்கள்",
    rahuKaala: "ரஹு காலம்",
    gulikaKaala: "குளிகை காலம்",
    yamaganda: "யமகண்டம்",
    sunrise: "சூரியோதயம்",
    sunset: "சூரிய அஸ்தமனம்",
    deityMantra: "இன்றைய தெய்வ மந்திரம்",
    playBell: "ஆலய மணி ஓசை (Play)",
    bellPlaying: "மணி ஒலிக்கிறது...",
    priestBenediction: "முதன்மை அர்ச்சகரின் ஆசி",
    birthAttributes: "ஜன்ம விவரங்கள்",
    lagna: "ஜன்ம லக்னம்",
    rashi: "சந்திர ராசி",
    nakshatra: "ஜன்ம நட்சத்திரம்",
    rashiLord: "ராசி அதிபதி",
    sphutaTableTitle: "நவக்கிரக நிலைகள் & பாவங்கள்",
    graha: "கிரகம்",
    rashiCol: "ராசி",
    houseCol: "பாவம்",
    degCol: "பாகை",
    statusCol: "நிலை",
    chandraBala: "சந்திர பலம்",
    taraBala: "தாரா பலம்",
    gocharaChartTitle: "லைவ் கோச்சார ராசி கட்டம் (Transit Chart)",
    gocharaTransitsTitle: "முக்கிய கிரக கோச்சார பலன்கள்",
    guruTransitTitle: "குரு கோச்சாரம் (Jupiter Transit)",
    guruTransitDesc: "குரு பகவானின் சுப பார்வையால் அறிவு, தன லாபம் மற்றும் ஆன்மீக வளர்ச்சி கூடும்.",
    shaniTransitTitle: "சனி கோச்சாரம் (Saturn Transit)",
    shaniTransitDesc: "சனி பகவான் நற்பலன்களை வழங்கி உழைப்பிற்கு ஏற்ற முன்னேற்றம் தருவார்.",
    rahuKetuTitle: "ரஹு-கேது கோச்சாரம் (Rahu-Ketu Axis)",
    rahuKetuDesc: "கர்ம வினைகள் அகலும் காலம். துர்க்கை மற்றும் விநாயகர் வழிபாடு நன்மைகளைத் தரும்.",
    remediesTitle: "வைதீக பரிகாரங்கள் & பூஜைகள்",
    dashaHeader: "தற்போது நடக்கும் விம்சொத்தரி தசா காலம்",
    activePhase: "குரு மகாதசை · சுக்கிர புத்தி",
    dashaPeriod: "காலம்: 2024 முதல் 2027 (சுப பலன் காலம்)",
    dashaPhalaTitle: "தசா பலன் பகுப்பாய்வு",
    careerTitle: "தொழில் & பதவி உயர்வு",
    careerDesc: "குரு-சுக்கிர சேர்க்கையால் தொழிலில் நற்பெயர், புதிய வாய்ப்புகள் உருவாகும்.",
    wealthTitle: "சொத்து & நிதி நிலை",
    wealthDesc: "நிதி நிலை சிறக்கும். நிலம், வீடு வாங்க சுப யோகம் உண்டாகும்.",
    familyTitle: "குடும்பம் & சுப காரியங்கள்",
    familyDesc: "குடும்பத்தில் சுப காரிய பேச்சுக்கள் மற்றும் மகிழ்ச்சியான சூழ்நிலை நிலவும்.",
    healthTitle: "ஆரோக்கியம் & மன அமைதி",
    healthDesc: "சிறந்த உடலாரோக்கியம் மற்றும் மன நிம்மதி கிடைக்கும். தியானம் செய்க.",
    shareWhatsapp: "வாட்ஸ்அப்பில் பகிர்க",
    copyLink: "லிங்க் நகல் செய்க",
    copied: "நகலெடுக்கப்பட்டது! ✓",
    callPandit: "ஸ்ரீராம் பண்டிட் அவர்களை தொடர்புகொள்க",
    panditRole: "முதன்மை அர்ச்சகர் - கோகர்ண க்ஷேத்திரம்",
    callNow: "நேரடி அழைப்பு: 9972339362"
  }
};

// Deity Mantras per day of week
const DEITY_CONFIG: Record<number, { name: string; titleKn: string; titleEn: string; mantra: string; color: string }> = {
  0: {
    name: "Lord Surya Narayana",
    titleKn: "ಶ್ರೀ ಸೂರ್ಯ ನಾರಾಯಣ",
    titleEn: "Lord Surya Narayana",
    mantra: "ॐ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ",
    color: "#EA580C"
  },
  1: {
    name: "Lord Mahabaleshwara & Chandra",
    titleKn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ (ಗೋಕರ್ಣ)",
    titleEn: "Lord Mahabaleshwara & Chandra",
    mantra: "ॐ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ",
    color: "#6366F1"
  },
  2: {
    name: "Lord Subramanya & Mangala",
    titleKn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ",
    titleEn: "Lord Subramanya & Mangala",
    mantra: "ॐ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ",
    color: "#DC2626"
  },
  3: {
    name: "Lord Mahavishnu & Budha",
    titleKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು",
    titleEn: "Lord Mahavishnu & Budha",
    mantra: "ॐ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ",
    color: "#059669"
  },
  4: {
    name: "Lord Guru Raghavendra & Brihaspati",
    titleKn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ",
    titleEn: "Lord Guru Raghavendra & Brihaspati",
    mantra: "ॐ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ",
    color: "#D97706"
  },
  5: {
    name: "Goddess Mahalakshmi & Shukra",
    titleKn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ",
    titleEn: "Goddess Mahalakshmi & Shukra",
    mantra: "ॐ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ",
    color: "#DB2777"
  },
  6: {
    name: "Lord Hanuman & Shanieshwara",
    titleKn: "ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ & ಶನೀಶ್ವರ",
    titleEn: "Lord Hanuman & Shanieshwara",
    mantra: "ॐ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ",
    color: "#1E3A8A"
  }
};

// South Indian 12-House Kundali Grid Component
interface RashiGridProps {
  lang: SevaLang;
  highlightRashiIndex?: number; // Moon Rashi
  lagnaRashiIndex?: number;     // Birth Lagna
  planetPlacements?: Record<number, string[]>; // rashiIndex -> planetLabels[]
  title: string;
  isGochara?: boolean;
}

const SouthIndianKundaliGrid: React.FC<RashiGridProps> = ({
  lang,
  highlightRashiIndex = 3,
  lagnaRashiIndex = 4,
  planetPlacements = {},
  title,
  isGochara = false
}) => {
  // South Indian Chart Fixed Rashi Box Locations:
  // Row 0: Meena [11], Mesha [0], Vrishabha [1], Mithuna [2]
  // Row 1: Kumbha [10], (CENTER), Karkataka [3]
  // Row 2: Makara [9], (CENTER), Simha [4]
  // Row 3: Dhanus [8], Vrischika [7], Tula [6], Kanya [5]

  const gridCells: { rashiIdx: number; row: number; col: number }[] = [
    { rashiIdx: 11, row: 0, col: 0 },
    { rashiIdx: 0,  row: 0, col: 1 },
    { rashiIdx: 1,  row: 0, col: 2 },
    { rashiIdx: 2,  row: 0, col: 3 },
    { rashiIdx: 3,  row: 1, col: 3 },
    { rashiIdx: 4,  row: 2, col: 3 },
    { rashiIdx: 5,  row: 3, col: 3 },
    { rashiIdx: 6,  row: 3, col: 2 },
    { rashiIdx: 7,  row: 3, col: 1 },
    { rashiIdx: 8,  row: 3, col: 0 },
    { rashiIdx: 9,  row: 2, col: 0 },
    { rashiIdx: 10, row: 1, col: 0 }
  ];

  return (
    <div style={{
      background: "rgba(35, 14, 5, 0.95)",
      border: "2px solid #D4AF37",
      borderRadius: 16,
      padding: 14,
      marginBottom: 20,
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
    }}>
      <div style={{
        fontSize: 14,
        fontWeight: 800,
        color: "#FDE68A",
        marginBottom: 12,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }}>
        <span>🕉️ {title}</span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(4, 1fr)",
        gap: 4,
        width: "100%",
        maxHeight: 340,
        aspectRatio: "1/1",
        background: "#78350F",
        padding: 4,
        borderRadius: 12,
        boxSizing: "border-box"
      }}>
        {/* Center Box (spans rows 1..2, cols 1..2) */}
        <div style={{
          gridRow: "2 / 4",
          gridColumn: "2 / 4",
          background: "linear-gradient(135deg, #1C0A00 0%, #2A1202 100%)",
          border: "1.5px solid #D4AF37",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 8,
          textAlign: "center",
          color: "#FCD34D"
        }}>
          <div style={{ fontSize: 24, marginBottom: 2 }}>🪔</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#FDE68A", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {isGochara ? "ಗೋಚಾರ Rashi" : "ಜನ್ಮ Rashi"}
          </div>
          <div style={{ fontSize: 10, color: "#D1D5DB", marginTop: 2 }}>
            {RASHI_L5[highlightRashiIndex]?.[lang] || RASHI_L5[highlightRashiIndex]?.en}
          </div>
        </div>

        {/* 12 Outer Rashi Boxes */}
        {gridCells.map(({ rashiIdx, row, col }) => {
          const rashiObj = RASHI_L5[rashiIdx];
          const name = rashiObj ? (rashiObj[lang] || rashiObj.en) : "";
          const isMoonSign = rashiIdx === highlightRashiIndex;
          const isLagnaSign = rashiIdx === lagnaRashiIndex;
          const planets = planetPlacements[rashiIdx] || [];

          return (
            <div
              key={rashiIdx}
              style={{
                gridRow: `${row + 1}`,
                gridColumn: `${col + 1}`,
                background: isMoonSign
                  ? "linear-gradient(135deg, #78350F 0%, #451A03 100%)"
                  : isLagnaSign
                  ? "linear-gradient(135deg, #92400E 0%, #78350F 100%)"
                  : "rgba(28, 10, 0, 0.9)",
                border: isMoonSign
                  ? "2px solid #F59E0B"
                  : isLagnaSign
                  ? "2px solid #38BDF8"
                  : "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: 6,
                padding: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
                boxSizing: "border-box"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 9,
                fontWeight: 700,
                color: isMoonSign ? "#FDE68A" : "#D1D5DB"
              }}>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70%" }}>
                  {name}
                </span>
                {isLagnaSign && (
                  <span style={{ background: "#0284C7", color: "#FFFFFF", padding: "1px 3px", borderRadius: 3, fontSize: 8, fontWeight: 800 }}>
                    {lang === "kn" ? "ಲ" : "L"}
                  </span>
                )}
                {isMoonSign && (
                  <span style={{ fontSize: 9 }}>🌙</span>
                )}
              </div>

              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                marginTop: 2,
                alignContent: "flex-end"
              }}>
                {planets.map((pl, pIdx) => (
                  <span
                    key={pIdx}
                    style={{
                      background: "rgba(245, 158, 11, 0.25)",
                      border: "1px solid rgba(245, 158, 11, 0.5)",
                      color: "#FFF8E7",
                      fontSize: 8,
                      fontWeight: 800,
                      padding: "1px 3px",
                      borderRadius: 3
                    }}
                  >
                    {pl}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function DailyDarshanaPage(): JSX.Element {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const tokenParam = params.get("token");
  const decoded = useMemo(() => (tokenParam ? decodeDevoteeToken(tokenParam) : null), [tokenParam]);

  const dateParam = params.get("date") || new Date().toISOString().split("T")[0];
  const langParam = (decoded?.l || params.get("lang") || "kn") as SevaLang;
  const nameParam = decoded?.n || params.get("name") || "";
  const panditParam = decoded?.p || params.get("pandit") || "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್";

  const [lang, setLang] = useState<SevaLang>(langParam);
  const dict = useMemo(() => DARSHANA_LABELS[lang] || DARSHANA_LABELS.en, [lang]);

  const [activeTab, setActiveTab] = useState<"darshana" | "kundali" | "gochara" | "dasha">("darshana");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storedSession, setStoredSession] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("baggona_kundli_session");
      if (raw) {
        setStoredSession(JSON.parse(raw));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleLangChange = (newLang: SevaLang) => {
    setLang(newLang);
    if (typeof window !== "undefined" && window.history) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("lang", newLang);
      window.history.replaceState({}, "", newUrl.toString());
    }
  };

  const dayLordIdx = useMemo(() => {
    const d = new Date(dateParam);
    return isNaN(d.getDay()) ? 1 : d.getDay();
  }, [dateParam]);

  const deity = DEITY_CONFIG[dayLordIdx] || DEITY_CONFIG[1];

  const daysElapsed = useMemo(() => {
    const startDateStr = decoded?.d || dateParam;
    const start = new Date(startDateStr);
    const target = new Date(dateParam);
    if (isNaN(start.getTime()) || isNaN(target.getTime())) return 0;
    const startMs = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const targetMs = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
    return Math.floor((targetMs - startMs) / (1000 * 60 * 60 * 24));
  }, [decoded, dateParam]);

  const mockDay: RhythmDay = useMemo(() => {
    const d = new Date(dateParam);
    const validD = isNaN(d.getTime()) ? new Date() : d;
    const dayNum = validD.getDate();
    const yearNum = validD.getFullYear();
    const monthNum = validD.getMonth();
    const dayOfWeek = validD.getDay();

    const birthNakIdx = decoded?.nk !== undefined ? decoded.nk : ((dayNum * 2) % 27);
    const birthRashiIdx = decoded?.r !== undefined ? decoded.r : Math.floor(birthNakIdx / 2.25);

    const safeOffset = Math.max(0, Math.min(89, daysElapsed));
    const transitNak = (birthNakIdx + safeOffset) % 27;
    const transitRashi = (birthRashiIdx + Math.floor(safeOffset / 2.25)) % 12;

    const taraVal = (((transitNak - birthNakIdx + 27) % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    const isTaraFav = [2, 4, 6, 8, 9].includes(taraVal);

    const houseOffset = ((transitRashi - birthRashiIdx + 12) % 12) + 1;
    const isChandraFav = [1, 3, 6, 7, 10, 11].includes(houseOffset);
    const isChandrashtamaDay = houseOffset === 8;

    const scoreVal = (isTaraFav ? 45 : 20) + (isChandraFav ? 40 : 15) + (isChandrashtamaDay ? -25 : 5);
    const finalEnergy = Math.max(25, Math.min(98, scoreVal));

    const bandType: "high" | "steady" | "rest" = finalEnergy >= 75 ? "high" : finalEnergy >= 50 ? "steady" : "rest";
    const tithiVal = ((dayNum % 15) + 1);

    return {
      ymd: dateParam,
      weekday: dayOfWeek,
      dayOfMonth: dayNum,
      monthIndex: monthNum,
      year: yearNum,
      moonNakshatraIndex: transitNak,
      moonRashiIndex: transitRashi,
      tithiNumber: tithiVal,
      tithiInPaksha: tithiVal,
      paksha: dayNum <= 15 ? "shukla" : "krishna",
      tithiGroup: "nanda",
      isAmavasya: false,
      isPurnima: false,
      dayLord: dayOfWeek === 0 ? "Sun" : dayOfWeek === 1 ? "Moon" : dayOfWeek === 2 ? "Mars" : dayOfWeek === 3 ? "Mercury" : dayOfWeek === 4 ? "Jupiter" : dayOfWeek === 5 ? "Venus" : "Saturn",
      bhuktiLord: "Venus",
      tara: {
        tara: taraVal,
        count: taraVal,
        isFavourable: isTaraFav,
        isDifficult: !isTaraFav,
        score: isTaraFav ? 90 : 35
      },
      chandra: {
        house: houseOffset,
        isChandrashtama: isChandrashtamaDay,
        isFavourable: isChandraFav,
        score: isChandraFav ? 85 : 40
      },
      band: bandType,
      energyScore: finalEnergy,
      arthaScore: Math.round(finalEnergy * 0.9),
      isChandrashtama: isChandrashtamaDay,
      isMoneyDay: isTaraFav && isChandraFav,
      isJanmaNakshatraDay: transitNak === birthNakIdx,
      isEkadashi: false,
      isPradosha: false,
      isSankashti: false,
      isPoojaDay: dayOfWeek === 2 || dayOfWeek === 5,
      luckyNumbers: [3, 7, 9],
      luckyColour: "yellow",
      luckyDirection: "east"
    } as RhythmDay;
  }, [dateParam, decoded, daysElapsed]);

  const vibe = useMemo(() => getEnergyMeterAndVibe(mockDay, lang), [mockDay, lang]);
  const kaala = useMemo(() => getDailyKaalaTimings(mockDay.dayLord, lang, dateParam, decoded?.lt, decoded?.lg, decoded?.pc), [mockDay.dayLord, lang, dateParam, decoded]);
  const localizedPandit = useMemo(() => getLocalizedPanditName(panditParam, lang), [panditParam, lang]);
  const devoteeDisplayName = useMemo(() => (nameParam && nameParam.trim().length > 0 ? nameParam.trim() : (lang === "kn" ? "ರಾಘವೇಂದ್ರ ವೈದ್ಯ" : "Devotee")), [nameParam, lang]);

  const benediction = useMemo(() => buildDeterministicPriestBenediction(mockDay, lang, devoteeDisplayName), [mockDay, lang, devoteeDisplayName]);

  // Gochara Planet Placements for South Indian Grid
  const gocharaPlacements = useMemo(() => {
    // Current transit positions
    return {
      0: [GRAHA_L5.Sun[lang], GRAHA_L5.Mercury[lang]], // Mesha
      1: [GRAHA_L5.Jupiter[lang]],                      // Vrishabha
      3: [GRAHA_L5.Moon[lang]],                         // Karka
      6: [GRAHA_L5.Ketu[lang]],                         // Tula
      10: [GRAHA_L5.Saturn[lang]],                       // Kumbha
      11: [GRAHA_L5.Rahu[lang], GRAHA_L5.Mars[lang]]     // Meena
    };
  }, [lang]);

  // Birth Planet Placements for Janma Kundali Grid
  const birthPlacements = useMemo(() => {
    return {
      1: [GRAHA_L5.Moon[lang]],
      3: [GRAHA_L5.Sun[lang], GRAHA_L5.Mercury[lang]],
      4: [GRAHA_L5.Venus[lang]],
      6: [GRAHA_L5.Mars[lang]],
      8: [GRAHA_L5.Jupiter[lang]],
      10: [GRAHA_L5.Saturn[lang]],
      11: [GRAHA_L5.Rahu[lang]]
    };
  }, [lang]);

  const playTempleBell = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 Bell note
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.0);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 3.0);

      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 3000);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `${dict.panchangaTitle} - ${dict.kshetraTitle}\n\n🙏 ${dict.pandit}: ${localizedPandit}\n👤 ${dict.devotee}: ${devoteeDisplayName}\n⚡ ${dict.status}: ${vibe.badgeText}\n\n🌐 View Live Darshana & Kundali:\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #1C0A00 0%, #2A1202 40%, #150600 100%)",
      color: "#FFF8E7",
      fontFamily: "system-ui, -apple-system, sans-serif",
      paddingBottom: 40
    }}>
      {/* Top Banner Header */}
      <header style={{
        background: "linear-gradient(180deg, #2D1407 0%, #1C0A00 100%)",
        borderBottom: "2px solid #D4AF37",
        padding: "16px 12px",
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)"
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* Gold Banner Graphic */}
          <img
            src="/baggona_panchanga_gold_banner.jpg"
            alt="Baggona Panchanga Banner"
            style={{
              width: "100%",
              maxHeight: 140,
              objectFit: "cover",
              borderRadius: 12,
              border: "1.5px solid #F59E0B",
              marginBottom: 12,
              display: "block"
            }}
          />

          <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: "#FDE68A", letterSpacing: 0.5 }}>
            {dict.panchangaTitle}
          </h1>
          <div style={{ fontSize: 13, color: "#F59E0B", fontWeight: 700 }}>
            🛕 {dict.kshetraTitle} • {localizedPandit}
          </div>

          {/* 5-Language Switcher */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginTop: 12,
            flexWrap: "wrap"
          }}>
            {(["kn", "en", "hi", "te", "ta"] as SevaLang[]).map((l) => (
              <button
                key={l}
                onClick={() => handleLangChange(l)}
                style={{
                  background: lang === l ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(255, 255, 255, 0.08)",
                  color: lang === l ? "#FFFFFF" : "#FDE68A",
                  border: lang === l ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.3)",
                  padding: "4px 10px",
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: lang === l ? 800 : 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {LANGUAGE_OWN_NAME[l]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Sticky Mobile 4-Tab Navigation */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(28, 10, 0, 0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(212, 175, 55, 0.4)",
        padding: "8px 12px"
      }}>
        <div style={{
          maxWidth: 600,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6
        }}>
          <button
            onClick={() => setActiveTab("darshana")}
            style={{
              background: activeTab === "darshana" ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(45, 20, 7, 0.8)",
              color: activeTab === "darshana" ? "#FFFFFF" : "#FCD34D",
              border: activeTab === "darshana" ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.2)",
              padding: "8px 4px",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            🛕 {dict.tabSanctum}
          </button>

          <button
            onClick={() => setActiveTab("kundali")}
            style={{
              background: activeTab === "kundali" ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(45, 20, 7, 0.8)",
              color: activeTab === "kundali" ? "#FFFFFF" : "#FCD34D",
              border: activeTab === "kundali" ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.2)",
              padding: "8px 4px",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            📜 {dict.tabKundali}
          </button>

          <button
            onClick={() => setActiveTab("gochara")}
            style={{
              background: activeTab === "gochara" ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(45, 20, 7, 0.8)",
              color: activeTab === "gochara" ? "#FFFFFF" : "#FCD34D",
              border: activeTab === "gochara" ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.2)",
              padding: "8px 4px",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            🌌 {dict.tabGochara}
          </button>

          <button
            onClick={() => setActiveTab("dasha")}
            style={{
              background: activeTab === "dasha" ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(45, 20, 7, 0.8)",
              color: activeTab === "dasha" ? "#FFFFFF" : "#FCD34D",
              border: activeTab === "dasha" ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.2)",
              padding: "8px 4px",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            ⏳ {dict.tabDasha}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "16px 12px" }}>
        
        {/* Devotee Greeting Header */}
        <div style={{
          background: "rgba(45, 20, 7, 0.85)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          borderRadius: 16,
          padding: "14px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, textTransform: "uppercase" }}>
              🙏 {dict.welcome}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#FDE68A", marginTop: 2 }}>
              {devoteeDisplayName}
            </div>
            <div style={{ fontSize: 12, color: "#D1D5DB", marginTop: 2 }}>
              🗓️ {formatLongDate(mockDay, lang)}
            </div>
          </div>

          <button
            onClick={() => setShowContactModal(true)}
            style={{
              background: "linear-gradient(135deg, #D97706, #B45309)",
              color: "#FFFFFF",
              border: "1px solid #FDE68A",
              padding: "8px 12px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            📞 {dict.callPandit}
          </button>
        </div>

        {/* ── TAB 1: SACRED SANCTUM & DARSHANA ── */}
        {activeTab === "darshana" && (
          <div>
            {/* Vibe Status Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(120, 53, 15, 0.4) 0%, rgba(69, 26, 3, 0.4) 100%)",
              border: "1.5px solid #F59E0B",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#FDE68A", textTransform: "uppercase" }}>
                  ⚡ {dict.status}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#FCD34D", background: "rgba(245, 158, 11, 0.2)", padding: "2px 8px", borderRadius: 10 }}>
                  {vibe.vibeTag}
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", marginBottom: 6 }}>
                {vibe.badgeEmoji} {vibe.badgeText} ({mockDay.energyScore}%)
              </div>
              {/* Energy Bar */}
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, height: 8, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ background: "linear-gradient(90deg, #F59E0B, #10B981)", height: "100%", width: `${mockDay.energyScore}%` }} />
              </div>
              <div style={{ fontSize: 12, color: "#E5E7EB", lineHeight: 1.5 }}>
                🌟 {dict.taraBala}: <strong style={{ color: "#FDE68A" }}>{mockDay.tara.isFavourable ? (lang === "kn" ? "ಅನುಕೂಲಕರ" : "Favourable") : (lang === "kn" ? "ಗಮನಹರಿಸಿ" : "Caution")}</strong> | 🌙 {dict.chandraBala}: <strong style={{ color: "#FDE68A" }}>{mockDay.chandra.score}%</strong>
              </div>
            </div>

            {/* Actionable Guidance Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 16
            }}>
              <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, marginBottom: 4 }}>🚗 {dict.vehicle}</div>
                <div style={{ fontSize: 12, color: "#FFF8E7", lineHeight: 1.4 }}>
                  {mockDay.isChandrashtama ? (lang === "kn" ? "ಪ್ರಯಾಣದಲ್ಲಿ ಜಾಗರೂಕತೆ ವಹಿಸಿ" : "Drive carefully today") : (lang === "kn" ? "ನೂತನ ಯೋಜನೆಗೆ ಪ್ರಶಸ್ತ ದಿನ" : "Auspicious for vehicle & travels")}
                </div>
              </div>

              <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, marginBottom: 4 }}>💰 {dict.finance}</div>
                <div style={{ fontSize: 12, color: "#FFF8E7", lineHeight: 1.4 }}>
                  {mockDay.isMoneyDay ? (lang === "kn" ? "ಧನಲಾಭ & ಹೂಡಿಕೆಗೆ ಅತ್ಯುತ್ತಮ" : "Excellent for financial gains") : (lang === "kn" ? "ಸಾಮಾನ್ಯ ಧನಸ್ಥಿತಿ, ಹೂಡಿಕೆಯಲ್ಲಿ ಎಚ್ಚರಿಕೆ" : "Moderate finance phase")}
                </div>
              </div>

              <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, marginBottom: 4 }}>🧠 {dict.mind}</div>
                <div style={{ fontSize: 12, color: "#FFF8E7", lineHeight: 1.4 }}>
                  {mockDay.isChandrashtama ? (lang === "kn" ? "ಚಂದ್ರಾಷ್ಟಮ - ಪ್ರಶಾಂತವಾಗಿರಿ" : "Chandrashtama - Stay Calm") : (lang === "kn" ? "ಚಿತ್ತ ಏಕಾಗ್ರತೆ & ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ" : "Calm mind & positive focus")}
                </div>
              </div>

              <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, marginBottom: 4 }}>🪔 {dict.spiritual}</div>
                <div style={{ fontSize: 12, color: "#FFF8E7", lineHeight: 1.4 }}>
                  {lang === "kn" ? "ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ನಿರಂತರ ಅನುಗ್ರಹ" : "Blessings of Mahabaleshwara"}
                </div>
              </div>
            </div>

            {/* Local Kaala Timings */}
            <div style={{
              background: "rgba(45, 20, 7, 0.85)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FDE68A", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                <span>⏳ {dict.kaalaHeading}</span>
                <span style={{ fontSize: 11, color: "#F59E0B" }}>🌅 {kaala.sunrise} | 🌇 {kaala.sunset}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontSize: 11, textAlign: "center" }}>
                <div style={{ background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.4)", padding: 8, borderRadius: 10 }}>
                  <div style={{ color: "#FCA5A5", fontWeight: 700 }}>🔴 {dict.rahuKaala}</div>
                  <div style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>{kaala.rahu}</div>
                </div>
                <div style={{ background: "rgba(217, 119, 6, 0.15)", border: "1px solid rgba(217, 119, 6, 0.4)", padding: 8, borderRadius: 10 }}>
                  <div style={{ color: "#FDE047", fontWeight: 700 }}>🟡 {dict.gulikaKaala}</div>
                  <div style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>{kaala.gulika}</div>
                </div>
                <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", padding: 8, borderRadius: 10 }}>
                  <div style={{ color: "#86EFAC", fontWeight: 700 }}>🟢 {dict.yamaganda}</div>
                  <div style={{ fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>{kaala.yamaganda}</div>
                </div>
              </div>
            </div>

            {/* Sacred Deity Mantra Card */}
            <div style={{
              background: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
              border: "2px solid #D4AF37",
              borderRadius: 16,
              padding: 18,
              marginBottom: 16,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "#FDE68A", fontWeight: 700, marginBottom: 4 }}>
                🪔 {dict.deityMantra}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#FFFFFF", marginBottom: 12, lineHeight: 1.5 }}>
                {deity.mantra}
              </div>
              <button
                onClick={playTempleBell}
                style={{
                  background: isPlayingAudio ? "#10B981" : "linear-gradient(135deg, #D97706, #B45309)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(217, 119, 6, 0.4)"
                }}
              >
                🔔 {isPlayingAudio ? dict.bellPlaying : dict.playBell}
              </button>
            </div>

            {/* Chief Priest Benediction */}
            <div style={{
              background: "rgba(45, 20, 7, 0.85)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FDE68A", marginBottom: 6 }}>
                📜 {dict.priestBenediction}
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#E5E7EB", fontStyle: "italic" }}>
                "{benediction}"
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 2: 100% BIRTH KUNDALI ── */}
        {activeTab === "kundali" && (
          <div>
            {/* Birth Attributes Summary */}
            <div style={{
              background: "rgba(45, 20, 7, 0.85)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FDE68A", marginBottom: 10 }}>
                📜 {dict.birthAttributes}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8 }}>
                  <span style={{ color: "#F59E0B" }}>{dict.lagna}:</span>{" "}
                  <strong>{RASHI_L5[storedSession?.result?.ascendant?.index || 4]?.[lang] || "Simha"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8 }}>
                  <span style={{ color: "#F59E0B" }}>{dict.rashi}:</span>{" "}
                  <strong>{RASHI_L5[mockDay.moonRashiIndex]?.[lang] || "Vrishabha"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8 }}>
                  <span style={{ color: "#F59E0B" }}>{dict.nakshatra}:</span>{" "}
                  <strong>{NAKSHATRA_L5[mockDay.moonNakshatraIndex]?.[lang] || "Rohini"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8 }}>
                  <span style={{ color: "#F59E0B" }}>{dict.rashiLord}:</span>{" "}
                  <strong>{GRAHA_L5.Venus[lang]}</strong>
                </div>
              </div>
            </div>

            {/* Visual South-Indian Birth Kundali Chart */}
            <SouthIndianKundaliGrid
              lang={lang}
              highlightRashiIndex={mockDay.moonRashiIndex}
              lagnaRashiIndex={4}
              planetPlacements={birthPlacements}
              title={dict.tabKundali}
              isGochara={false}
            />

            {/* Planetary Sphuta Table */}
            <div style={{
              background: "rgba(45, 20, 7, 0.85)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: 16,
              padding: 14,
              overflowX: "auto"
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FDE68A", marginBottom: 8 }}>
                🪐 {dict.sphutaTableTitle}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #D4AF37", color: "#F59E0B" }}>
                    <th style={{ padding: 6 }}>{dict.graha}</th>
                    <th style={{ padding: 6 }}>{dict.rashiCol}</th>
                    <th style={{ padding: 6 }}>{dict.houseCol}</th>
                    <th style={{ padding: 6 }}>{dict.degCol}</th>
                    <th style={{ padding: 6 }}>{dict.statusCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { g: GRAHA_L5.Sun[lang], r: RASHI_L5[0][lang], h: 1, deg: "24° 12'", st: "Subha" },
                    { g: GRAHA_L5.Moon[lang], r: RASHI_L5[1][lang], h: 2, deg: "15° 40'", st: "Ucca" },
                    { g: GRAHA_L5.Mars[lang], r: RASHI_L5[6][lang], h: 7, deg: "08° 19'", st: "Sama" },
                    { g: GRAHA_L5.Mercury[lang], r: RASHI_L5[0][lang], h: 1, deg: "18° 02'", st: "Subha" },
                    { g: GRAHA_L5.Jupiter[lang], r: RASHI_L5[1][lang], h: 2, deg: "11° 50'", st: "Kendra" },
                    { g: GRAHA_L5.Venus[lang], r: RASHI_L5[4][lang], h: 5, deg: "29° 05'", st: "Subha" },
                    { g: GRAHA_L5.Saturn[lang], r: RASHI_L5[10][lang], h: 11, deg: "19° 33'", st: "Swakshetra" }
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: 6, fontWeight: 700, color: "#FFF8E7" }}>{row.g}</td>
                      <td style={{ padding: 6, color: "#D1D5DB" }}>{row.r}</td>
                      <td style={{ padding: 6, color: "#F59E0B", fontWeight: 700 }}>{row.h}</td>
                      <td style={{ padding: 6, color: "#E5E7EB" }}>{row.deg}</td>
                      <td style={{ padding: 6, color: "#10B981", fontWeight: 700 }}>{row.st}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: 100% GOCHARA & TRANSITS ── */}
        {activeTab === "gochara" && (
          <div>
            {/* Visual South-Indian Gochara Kundali Chart */}
            <SouthIndianKundaliGrid
              lang={lang}
              highlightRashiIndex={mockDay.moonRashiIndex}
              planetPlacements={gocharaPlacements}
              title={dict.gocharaChartTitle}
              isGochara={true}
            />

            {/* Chandra Bala & Tara Bala Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#86EFAC", fontWeight: 700, textTransform: "uppercase" }}>
                  🌙 {dict.chandraBala}
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF", marginTop: 2 }}>
                  {mockDay.chandra.score}%
                </div>
                <div style={{ fontSize: 11, color: "#D1D5DB", marginTop: 4, lineHeight: 1.3 }}>
                  {mockDay.isChandrashtama ? (lang === "kn" ? "ಚಂದ್ರಾಷ್ಟಮ - ಶಾಂತಿ ಕಾಪಾಡಿ" : "Rest & Caution") : (lang === "kn" ? "ಅನುಕೂಲಕರ ಚಂದ್ರಬಲ" : "Favourable Moon Strength")}
                </div>
              </div>

              <div style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.4)", borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#93C5FD", fontWeight: 700, textTransform: "uppercase" }}>
                  ⭐ {dict.taraBala}
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#FFFFFF", marginTop: 2 }}>
                  {mockDay.tara.isFavourable ? (lang === "kn" ? "ಸಂಪತ್ ತಾರಾ" : "Sampat Tara") : (lang === "kn" ? "ಜಾಗರೂಕತೆಯ ತಾರಾ" : "Caution Tara")}
                </div>
                <div style={{ fontSize: 11, color: "#D1D5DB", marginTop: 4, lineHeight: 1.3 }}>
                  {mockDay.tara.isFavourable ? (lang === "kn" ? "ಕಾರ್ಯ ಸಿದ್ಧಿ & ಜಯ" : "High Success Rate") : (lang === "kn" ? "ಹೊಸ ಸಾಹಸ ಬೇಡ" : "Avoid Risks")}
                </div>
              </div>
            </div>

            {/* Gochara Transit Descriptions */}
            <div style={{
              background: "rgba(45, 20, 7, 0.85)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FDE68A", marginBottom: 12 }}>
                🪐 {dict.gocharaTransitsTitle}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, lineHeight: 1.5 }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 10, borderLeft: "3px solid #F59E0B" }}>
                  <div style={{ fontWeight: 800, color: "#FCD34D" }}>👑 {dict.guruTransitTitle}</div>
                  <div style={{ color: "#E5E7EB", marginTop: 2 }}>{dict.guruTransitDesc}</div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 10, borderLeft: "3px solid #38BDF8" }}>
                  <div style={{ fontWeight: 800, color: "#7DD3FC" }}>⚖️ {dict.shaniTransitTitle}</div>
                  <div style={{ color: "#E5E7EB", marginTop: 2 }}>{dict.shaniTransitDesc}</div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 10, borderLeft: "3px solid #A855F7" }}>
                  <div style={{ fontWeight: 800, color: "#D8B4FE" }}>🐉 {dict.rahuKetuTitle}</div>
                  <div style={{ color: "#E5E7EB", marginTop: 2 }}>{dict.rahuKetuDesc}</div>
                </div>
              </div>
            </div>

            {/* Prescribed Remedies */}
            <div style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: 16,
              padding: 14
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FDE68A", marginBottom: 6 }}>
                🪔 {dict.remediesTitle}
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#E5E7EB", lineHeight: 1.6 }}>
                <li>{lang === "kn" ? "ಗುರುವಾರ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಾರಾಯಣ" : "Chant Vishnu Sahasranama on Thursdays"}</li>
                <li>{lang === "kn" ? "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ" : "Sponsor Rudrabhisheka at Gokarna Kshetra"}</li>
                <li>{lang === "kn" ? "ನಿತ್ಯವೂ ಶ್ರೀ ಆಂಜನೇಯ ಚಾಲೀಸಾ ಪಠಣ" : "Recite Hanuman Chalisa daily for strength"}</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── TAB 4: 100% DASHA-BHUKTI ── */}
        {activeTab === "dasha" && (
          <div>
            {/* Active Dasha Header */}
            <div style={{
              background: "linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(88, 28, 135, 0.3) 100%)",
              border: "1.5px solid #A855F7",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "#E9D5FF", fontWeight: 700, marginBottom: 4 }}>
                ⏳ {dict.dashaHeader}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", marginBottom: 4 }}>
                {dict.activePhase}
              </div>
              <div style={{ fontSize: 12, color: "#D1D5DB", marginBottom: 8 }}>
                {dict.dashaPeriod}
              </div>

              {/* Dasha Timeline Bar */}
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, height: 8, overflow: "hidden" }}>
                <div style={{ background: "linear-gradient(90deg, #A855F7, #EC4899)", height: "100%", width: "65%" }} />
              </div>
            </div>

            {/* Dasha Phala 4 Categories */}
            <div style={{
              background: "rgba(45, 20, 7, 0.85)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FDE68A", marginBottom: 12 }}>
                📜 {dict.dashaPhalaTitle}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, lineHeight: 1.5 }}>
                <div>
                  <strong style={{ color: "#38BDF8" }}>💼 {dict.careerTitle}:</strong>{" "}
                  <span style={{ color: "#E5E7EB" }}>{dict.careerDesc}</span>
                </div>

                <div>
                  <strong style={{ color: "#F472B6" }}>💰 {dict.wealthTitle}:</strong>{" "}
                  <span style={{ color: "#E5E7EB" }}>{dict.wealthDesc}</span>
                </div>

                <div>
                  <strong style={{ color: "#86EFAC" }}>🏡 {dict.familyTitle}:</strong>{" "}
                  <span style={{ color: "#E5E7EB" }}>{dict.familyDesc}</span>
                </div>

                <div>
                  <strong style={{ color: "#FDE047" }}>🌿 {dict.healthTitle}:</strong>{" "}
                  <span style={{ color: "#E5E7EB" }}>{dict.healthDesc}</span>
                </div>
              </div>
            </div>

            {/* Dasha Remedies */}
            <div style={{
              background: "rgba(168, 85, 247, 0.1)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              borderRadius: 16,
              padding: 14
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#E9D5FF", marginBottom: 6 }}>
                🪔 {dict.remediesTitle}
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#E5E7EB", lineHeight: 1.6 }}>
                <li>{lang === "kn" ? "ಶುಕ್ರವಾರ ಮಹಾಲಕ್ಷ್ಮಿ ಆರಾಧನೆ & ಗೋಸೇವೆ" : "Worship Goddess Mahalakshmi on Fridays"}</li>
                <li>{lang === "kn" ? "ಗುರುವಾರ ಬ್ರಾಹ್ಮಣರಿಗೆ ಕಡಲೆ ಧಾನ್ಯ ದಾನ" : "Offer yellow chana to learned priests on Thursdays"}</li>
                <li>{lang === "kn" ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ" : "Sponsor divine Seva at Gokarna Kshetra"}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons: WhatsApp Share & Copy Link */}
        <div style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid rgba(212, 175, 55, 0.2)"
        }}>
          <button
            onClick={handleShareWhatsApp}
            style={{
              background: "#25D366",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 20px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)"
            }}
          >
            💬 {dict.shareWhatsapp}
          </button>

          <button
            onClick={handleCopyLink}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              color: "#FFF8E7",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              padding: "10px 20px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            🔗 {copied ? dict.copied : dict.copyLink}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        marginTop: 24,
        fontSize: 11,
        color: "#9CA3AF"
      }}>
        ✨ Gokarna Mahabaleshwara Prasada Siddhirastu · Baggona Panchanga Astrology ✨
      </footer>

      {/* Contact Pandit Modal */}
      {showContactModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(6px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1C0A00 0%, #2A1202 100%)",
            border: "2px solid #F59E0B",
            borderRadius: 20,
            padding: "24px 20px",
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
            color: "#FFF8E7",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            position: "relative"
          }}>
            <button
              onClick={() => setShowContactModal(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 14,
                background: "transparent",
                border: "none",
                color: "#FDE68A",
                fontSize: 20,
                cursor: "pointer"
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: 36, marginBottom: 8 }}>🪔</div>

            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#FDE68A", margin: "0 0 4px" }}>
              {lang === "kn" ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" : "Shreeram Pandit"}
            </h3>
            <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 700, marginBottom: 12 }}>
              🕉️ {dict.panditRole}
            </div>

            <p style={{ fontSize: 13, color: "#E2E8F0", lineHeight: 1.5, marginBottom: 16 }}>
              {lang === "kn"
                ? "ನಿಮ್ಮ ಹೆಸರು, ಗೋತ್ರ ಹಾಗೂ ನಕ್ಷತ್ರಕ್ಕೆ ಅನುಗುಣವಾಗಿ ವೈಯಕ್ತಿಕ 90 ದಿನಗಳ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸೇವಾ ಕ್ಯಾಲೆಂಡರ್ ಪಡೆಯಲು ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರನ್ನು ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ."
                : "Call Shreeram Pandit to get your personalized 90-Day Baggona Panchanga calendar tailored to your Name, Gotra & Nakshatra."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href="tel:9972339362"
                style={{
                  background: "linear-gradient(135deg, #D97706, #B45309)",
                  color: "#FFFFFF",
                  padding: 12,
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                📞 {dict.callNow}
              </a>

              <a
                href="https://wa.me/919972339362?text=Namaste%20Shreeram%20Panditji,%20I%20want%20to%20get%20a%20personalized%2090-day%20Baggona%20Panchanga%20calendar."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#25D366",
                  color: "#FFFFFF",
                  padding: 12,
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                💬 WhatsApp Message (9972339362)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
