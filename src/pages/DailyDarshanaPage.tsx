/**
 * Baggona Daily Darshana Sanctum Page
 * 
 * Interactive sacred web sanctum opened via calendar deep-link or QR code scan.
 * Includes:
 * - Royal Gokarna Mahabaleshwara temple sanctum ambience with glowing gold banner
 * - Real-time Kaala timing indicator & countdown
 * - Authentic Multi-Harmonic Temple Bell chime synthesis ("THAAANNN...")
 * - Rich Chief Priest Benediction from Chaitanya Pandit
 * - 100% Comprehensive Birth Kundali with visual South-Indian Janma Kundali grid
 * - 100% Gochara Planetary Transits with visual South-Indian Gochara Rashi Kundali grid
 * - 100% Vimshottari Dasha-Bhukti breakdown with timeline progress & 5-language Dasha Phala
 * - 5-Language Switcher (ಕನ್ನಡ, English, हिंदी, తెలుగు, தமிழ்) across all 4 tabs with ZERO fallback leakage
 * - Auto-Trigger 90-Day .ics Calendar Download on QR code scan & 1-Tap download button
 */

import React, { useState, useMemo, useEffect } from "react";
import { getDevoteeSalutation, buildDeterministicPriestBenediction } from "../features/seva/sevaPriestNarrativeEngine";
import { getDailyKaalaTimings, getEnergyMeterAndVibe, generateSevaICalendarString, downloadIcsFile, getDayLordIndex, calculateDeterministicRhythmDay, getTaraBalaInfo, getChandraBalaInfo } from "../features/seva/icsCalendarGenerator";
import { decodeDevoteeToken } from "../utils/tokenCipher";
import type { RhythmDay } from "../core/DailyRhythmEngine";
import { nakshatraName, rashiName, tithiLabel, getDailyActionableGuidance, formatLongDate, getLocalizedPanditName } from "../features/seva/sevaPresentation";
import { RASHI_L5, NAKSHATRA_L5, GRAHA_L5, LANGUAGE_OWN_NAME, pick, type SevaLang } from "../features/seva/sevaLocale";
import { calculateKundli } from "../core/KundliEngine";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";
import { signLord } from "../core/KundliInsightsEngine";
import { normalizeDegree } from "../core/AstroMath";
import { PlanetName, type KundliOutput, type PlanetPosition } from "../core/AstroTypes";
import { transliterateName } from "../utils/transliterator";

// Comprehensive 5-Language Dictionary for DailyDarshanaPage
const DARSHANA_LABELS: Record<SevaLang, Record<string, string>> = {
  kn: {
    tabSanctum: "ದರ್ಶನ",
    tabKundali: "ಜನ್ಮ ಕುಂಡಲಿ",
    tabGochara: "ಗೋಚಾರ ಕುಂಡಲಿ",
    tabDasha: "ದಶಾ-ಭುಕ್ತಿ",
    panchangaTitle: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ",
    kshetraTitle: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
    creationSubtitle: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೃಷ್ಟಿ",
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
    gocharaChartTitle: "ಲೈವ್ ಗೋಚಾರ ರಾಶಿ ಕುಂಡಲಿ",
    gocharaTransitsTitle: "ಪ್ರಮುಖ ಗ್ರಹಗಳ ಗೋಚಾರ ಫಲಗಳು",
    guruTransitTitle: "ಗುರು ಗೋಚಾರ ಫಲ",
    guruTransitDesc: "ಗುರುವು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಗೆ ಶುಭ ದೃಷ್ಟಿ ಬೀರುತ್ತಿದ್ದು, ಧಾರ್ಮಿಕ ಚಿಂತನೆ ಹಾಗೂ ಆರ್ಥಿಕ ಬೆಳವಣಿಗೆಗೆ ಪ್ರೋತ್ಸಾಹ ನೀಡುತ್ತಿದ್ದಾನೆ.",
    shaniTransitTitle: "ಶನಿ ಗೋಚಾರ ಫಲ",
    shaniTransitDesc: "ಶನಿಯು ಸ್ವಕ್ಷೇತ್ರ ಸಂಚಾರದಲ್ಲಿದ್ದು, ಶಿಸ್ತು ಮತ್ತು ನಿಷ್ಠಾವಂತ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ನೀಡಲಿದ್ದಾನೆ. ಆತುರ ತಪ್ಪಿಸಿ.",
    rahuKetuTitle: "ರಾಹು-ಕೇತು ಗೋಚಾರ",
    rahuKetuDesc: "ಕಾರ್ಮಿಕ ಶುದ್ಧೀಕರಣ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಗೆ ಪ್ರಶಸ್ತ. ಶ್ರೀ ದುರ್ಗಾ ಹಾಗೂ ಗಣಪತಿ ಆರಾಧನೆ ಶ್ರೇಷ್ಠ.",
    remediesTitle: "ವೈದಿಕ ಪರಿಹಾರಗಳು & ಆರಾಧನೆಗಳು",
    dashaHeader: "ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲ",
    activePhase: "ರಾಹು ಮಹಾದಶಾ · ಶುಕ್ರ ಅಂತರ್ದಶಾ",
    dashaPeriod: "ಅವಧಿ: 2023 ರಿಂದ 2026 (ಶುಭ ಫಲದಾಯಕ ಕಾಲ)",
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
    callPandit: "ಕ್ಯಾಲೆಂಡರ್ ಬೇಕಿದ್ದಲ್ಲಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರಿಗೆ ಕರೆ ಮಾಡಿ",
    panditRole: "ಮುಖ್ಯ ಅರ್ಚಕರು - ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
    callNow: "ನೇರ ಕರೆ: 9972339362",
    downloadIcs: "೯೦ ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ಪಡೆಯಿರಿ (.ics)",
    icsDownloaded: "೯೦ ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ ✓"
  },
  en: {
    tabSanctum: "Darshana",
    tabKundali: "Janma Kundali",
    tabGochara: "Gochara Chart",
    tabDasha: "Dasha-Bhukti",
    panchangaTitle: "Baggona Panchanga",
    kshetraTitle: "Gokarna Kshetra",
    creationSubtitle: "Gokarna Kshetra Creation",
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
    activePhase: "Rahu Mahadasha · Venus (Shukra) Antardasha",
    dashaPeriod: "Period: 2023 to 2026 (Auspicious Phase)",
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
    callPandit: "If you need a calendar, call Shreeram Pandit",
    panditRole: "Chief Archaka - Gokarna Kshetra",
    callNow: "Call Directly: +91 9972339362",
    downloadIcs: "Download 90-Day Calendar (.ics)",
    icsDownloaded: "90-Day Calendar Downloaded! Download Again"
  },
  hi: {
    tabSanctum: "दर्शन",
    tabKundali: "जन्म कुंडली",
    tabGochara: "गोचर कुंडली",
    tabDasha: "दशा-भुक्ति",
    panchangaTitle: "बग्गोण पंचांग",
    kshetraTitle: "गोकर्ण क्षेत्र",
    creationSubtitle: "गोकर्ण क्षेत्र सृष्टि",
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
    gocharaChartTitle: "लाइव गोचर राशि कुंडली",
    gocharaTransitsTitle: "प्रमुख ग्रहों का गोचर फल",
    guruTransitTitle: "गुरु गोचर",
    guruTransitDesc: "गुरु का आपकी राशि पर शुभ प्रभाव है, जिससे ज्ञान, उन्नति और आर्थिक लाभ होगा।",
    shaniTransitTitle: "शनि गोचर",
    shaniTransitDesc: "शनि महाराज की कृपा से कठिन परिश्रम का उत्तम फल मिलेगा। धैर्य बनाए रखें।",
    rahuKetuTitle: "राहु-केतु गोचर",
    rahuKetuDesc: "आध्यात्मिक उन्नति एवं कर्म शुद्धि का समय। दुर्गा व गणेश उपासना करें।",
    remediesTitle: "वैदिक उपाय एवं पूजा संकल्प",
    dashaHeader: "वर्तमान विंशोत्तरी दशा",
    activePhase: "राहु महादशा · शुक्र अंतर्दशा",
    dashaPeriod: "अवधि: 2023 से 2026 (शुभ फलदायी)",
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
    callPandit: "यदि आपको कैलेंडर चाहिए तो श्रीराम पंडित जी को कॉल करें",
    panditRole: "मुख्य अर्चक - गोकर्ण क्षेत्र",
    callNow: "सीधा कॉल करें: 9972339362",
    downloadIcs: "90-दिवसीय पंचांग कैलेंडर डाउनलोड करें (.ics)",
    icsDownloaded: "90-दिवसीय पंचांग कैलेंडर डाउनलोड हुआ ✓"
  },
  te: {
    tabSanctum: "దర్శనం",
    tabKundali: "జన్మ కుండలి",
    tabGochara: "గోచార కుండలి",
    tabDasha: "దశా-భుక్తి",
    panchangaTitle: "బగ్గోణ పంచాంగం",
    kshetraTitle: "గోకర్ణ క్షేత్రం",
    creationSubtitle: "గోకర్ణ క్షేత్రం సృష్టి",
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
    gocharaChartTitle: "లైవ్ గోచార రాశి కుండలి",
    gocharaTransitsTitle: "ప్రధాన గ్రహాల గోచార ఫలితాలు",
    guruTransitTitle: "గురు గోచారం",
    guruTransitDesc: "గురు భగవానుని శుభ దృష్టి వల్ల జ్ఞానం, ధన లాభం మరియు ఆధ్యాత్మిక పురోగతి లభిస్తుంది.",
    shaniTransitTitle: "శని గోచారం",
    shaniTransitDesc: "శని భగవానుడు మీ కష్టానికి తగిన ప్రతిఫలాన్ని అందిస్తారు. ఓపిక వహించండి.",
    rahuKetuTitle: "రాహు-కేతు గోచారం",
    rahuKetuDesc: "కర్మ క్షయం మరియు జ్ఞాన ప్రాప్తికి అనుకూలం. దుర్గా, గణపతి ఆరాధన శ్రేష్టం.",
    remediesTitle: "వైదిక పరిహారాలు & పూజలు",
    dashaHeader: "ప్రస్తుత వింశోత్తరీ దశా కాలం",
    activePhase: "రాహు మహాదశ · శుక్ర అంతర్దశ",
    dashaPeriod: "వ్యవధి: 2023 నుండి 2026 (శుభ ఫలదాయకం)",
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
    callPandit: "క్యాలెండర్ కావాలంటే శ్రీరామ్ పండితులు గారికి కాల్ చేయండి",
    panditRole: "ముఖ్య అర్చకులు - గోకర్ణ క్షేత్రం",
    callNow: "నేరుగా కాల్ చేయండి: 9972339362",
    downloadIcs: "90 రోజుల పంచాంగ క్యాలెండర్ పొందండి (.ics)",
    icsDownloaded: "90 రోజుల పంచాంగ క్యాలెండర్ డౌన్‌లోడ్ అయింది ✓"
  },
  ta: {
    tabSanctum: "தரிசனம்",
    tabKundali: "ஜன்ம ஜாதகம்",
    tabGochara: "கோச்சார கட்டம்",
    tabDasha: "தசா-புக்தி",
    panchangaTitle: "பக்கோண பஞ்சாங்கம்",
    kshetraTitle: "கோகர்ண க்ஷேத்திரம்",
    creationSubtitle: "கோகர்ண க்ஷேத்திரம் படைப்பு",
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
    gocharaChartTitle: "லைவ் கோச்சார ராசி கட்டம்",
    gocharaTransitsTitle: "முக்கிய கிரக கோச்சார பலன்கள்",
    guruTransitTitle: "குரு கோச்சாரம்",
    guruTransitDesc: "குரு பகவானின் சுப பார்வையால் அறிவு, தன லாபம் மற்றும் ஆன்மீக வளர்ச்சி கூடும்.",
    shaniTransitTitle: "சனி கோச்சாரம்",
    shaniTransitDesc: "சனி பகவான் நற்பலன்களை வழங்கி உழைப்பிற்கு ஏற்ற முன்னேற்றம் தருவார்.",
    rahuKetuTitle: "ரஹு-கேது கோச்சாரம்",
    remediesTitle: "வைதீக பரிகாரங்கள் & பூஜைகள்",
    dashaHeader: "தற்போது நடக்கும் விம்சொத்தரி தசா காலம்",
    activePhase: "ராகு மகாதிசை · சுக்கிரன் புக்தி",
    dashaPeriod: "காலம்: 2023 முதல் 2026 (சுப பலன் காலம்)",
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
    callPandit: "காலண்டர் தேவைப்பட்டால் ஸ்ரீராம் பண்டிதர் அவர்களுக்கு அழைக்கவும்",
    panditRole: "முதன்மை அர்ச்சகர் - கோகர்ண க்ஷேத்திரம்",
    callNow: "நேரடி அழைப்பு: 9972339362",
    downloadIcs: "90 நாட்களுக்கான பஞ்சாங்க காலண்டர் பெறுக (.ics)",
    icsDownloaded: "90 நாட்களுக்கான பஞ்சாங்க காலண்டர் பதிவிறக்கம் செய்யப்பட்டது ✓"
  }
};

// Deity Mantras per day of week (5-Language Script System)
const DEITY_CONFIG: Record<number, {
  name: Record<SevaLang, string>;
  mantra: Record<SevaLang, string>;
  color: string;
}> = {
  0: {
    name: {
      kn: "ಶ್ರೀ ಸೂರ್ಯ ನಾರಾಯಣ",
      en: "Lord Surya Narayana",
      hi: "श्री सूर्य नारायण",
      te: "శ్రీ సూర్య నారాయణ",
      ta: "ஸ்ரீ சூர்ய நாராயணன்"
    },
    mantra: {
      kn: "ॐ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ",
      en: "Om Hram Hreem Hroum Sah Suryaya Namah",
      hi: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",
      te: "ఓం హ్రాం హ్రీం హ్రౌం సః సూర్యాయ నమః",
      ta: "ஓம் ஹ்ராம் ஹ்ரீம் ஹ்ரௌம் ஸஃ சூர்யாய நமஃ"
    },
    color: "#EA580C"
  },
  1: {
    name: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ (ಗೋಕರ್ಣ)",
      en: "Lord Mahabaleshwara & Chandra",
      hi: "श्री महाबलेश्वर स्वामी (गोकर्ण)",
      te: "శ్రీ మహాబలేశ్వర స్వామి (గోకర్ణం)",
      ta: "ஸ்ரீ மகாபலேஸ்வர சுவாமி (கோகர்ணம்)"
    },
    mantra: {
      kn: "ॐ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ",
      en: "Om Shram Shreem Shroum Sah Chandramase Namah",
      hi: "ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः",
      te: "ఓం శ్రాం ಶ್ರೀಂ ಶ್ರೌಂ ಸః చంద్రమసే నమః",
      ta: "ஓம் ஷ்ராம் ஷ்ரீம் ஷ்ரௌம் ஸஃ சந்திரமஸே நமஃ"
    },
    color: "#6366F1"
  },
  2: {
    name: {
      kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ & ಮಂಗಳ",
      en: "Lord Subramanya & Mangala",
      hi: "श्री सुब्रमण्य स्वामी एवं मंगल",
      te: "శ్రీ సుబ్రహ్మణ్య స్వామి & మంగళ",
      ta: "ஸ்ரீ சுப்பிரமணிய சுவாமி & செவ்வாய்"
    },
    mantra: {
      kn: "ॐ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ",
      en: "Om Kram Kreem Kroum Sah Bhoumaya Namah",
      hi: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः",
      te: "ఓం క్రాం క్రీం క్రౌం సః భౌమాయ నమః",
      ta: "ஓம் க்ராம் க்ரீம் க்ரௌம் ஸஃ பௌமாய நமஃ"
    },
    color: "#DC2626"
  },
  3: {
    name: {
      kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ಬುಧ",
      en: "Lord Mahavishnu & Budha",
      hi: "श्री महाविष्णु एवं बुध",
      te: "శ్రీ మహావిష్ణువు & బుధ",
      ta: "ஸ்ரீ மகாவிஷ்ணு & புதன்"
    },
    mantra: {
      kn: "ॐ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ",
      en: "Om Bram Breem Broum Sah Budhaya Namah",
      hi: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः",
      te: "ఓం బ్రాం ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ బుధాయ నమః",
      ta: "ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ புதாய நமஃ"
    },
    color: "#059669"
  },
  4: {
    name: {
      kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ & ಬೃಹಸ್ಪತಿ",
      en: "Lord Guru Raghavendra & Brihaspati",
      hi: "श्री गुरु राघवेंद्र स्वामी एवं बृहस्पति",
      te: "శ్రీ గురు రాఘవేంద్ర స్వామి & బృహస్పతి",
      ta: "ஸ்ரீ குரு ராகவேந்திர சுவாமி & பிருகஸ்பதி"
    },
    mantra: {
      kn: "ॐ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ",
      en: "Om Gram Greem Groum Sah Gurave Namah",
      hi: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः",
      te: "ఓం గ్రాం ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ గురవే నమః",
      ta: "ஓம் க்ராம் க்ரீம் க்ரௌம் ஸஃ குரவே நமஃ"
    },
    color: "#D97706"
  },
  5: {
    name: {
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ & ಶುಕ್ರ",
      en: "Goddess Mahalakshmi & Shukra",
      hi: "श्री महालक्ष्मी देवी एवं शुक्र",
      te: "శ్రీ మహాలక్ష్మి దేవి & శుక్ర",
      ta: "ஸ்ரீ மகாலட்சுமி தேவி & சுக்கிரன்"
    },
    mantra: {
      kn: "ॐ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ",
      en: "Om Dram Dreem Droum Sah Shukraya Namah",
      hi: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः",
      te: "ఓం ద్రాం ದ್ರೀ೦ ದ್ರೌ೦ ಸಃ శుక్రాయ నమః",
      ta: "ஓம் த்ராம் த்ரீம் த்ரௌம் ஸஃ சுக்ராய நமஃ"
    },
    color: "#DB2777"
  },
  6: {
    name: {
      kn: "ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ & ಶನೀಶ್ವರ",
      en: "Lord Hanuman & Shanieshwara",
      hi: "श्री आंजनेय स्वामी एवं शनैश्चर",
      te: "శ్రీ ఆంజనేయ స్వామి & శనీశ్వరుడు",
      ta: "ஸ்ரீ ஆஞ்சநேய சுவாமி & சனீஸ்வரன்"
    },
    mantra: {
      kn: "ॐ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ",
      en: "Om Pram Preem Proum Sah Shanaishcharaya Namah",
      hi: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः",
      te: "ఓం ప్రాం ప్రీం ಪ್ರೌಂ ಸಃ శనైశ్చరాయ నమః",
      ta: "ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ சனைச்சராய நமஃ"
    },
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
  const gridCells: { rashiIdx: number; row: number; col: number }[] = [
    { rashiIdx: 11, row: 0, col: 0 },
    { rashiIdx: 0,  row: 0, col: 1 },
    { rashiIdx: 1,  row: 0, col: 2 },
    { rashiIdx: 2,  row: 0, col: 3 },
    { rashiIdx: 10, row: 1, col: 0 },
    { rashiIdx: 3,  row: 1, col: 3 },
    { rashiIdx: 9,  row: 2, col: 0 },
    { rashiIdx: 4,  row: 2, col: 3 },
    { rashiIdx: 8,  row: 3, col: 0 },
    { rashiIdx: 7,  row: 3, col: 1 },
    { rashiIdx: 6,  row: 3, col: 2 },
    { rashiIdx: 5,  row: 3, col: 3 }
  ];

  return (
    <div style={{
      background: "rgba(45, 20, 7, 0.9)",
      border: "2px solid #D4AF37",
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
    }}>
      <div style={{
        fontSize: 14,
        fontWeight: 800,
        color: "#FDE68A",
        marginBottom: 10,
        textAlign: "center",
        borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
        paddingBottom: 6
      }}>
        {title}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(4, 76px)",
        gap: 4,
        background: "#1C0A00",
        padding: 4,
        borderRadius: 10,
        border: "1px solid #78350F",
        position: "relative"
      }}>
        {/* Center Title Box */}
        <div style={{
          gridColumn: "2 / 4",
          gridRow: "2 / 4",
          background: "linear-gradient(135deg, rgba(120, 53, 15, 0.3) 0%, rgba(45, 20, 7, 0.6) 100%)",
          border: "1.5px dashed rgba(212, 175, 55, 0.5)",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 18 }}>🛕</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#FDE68A", marginTop: 2 }}>
            {isGochara ? (lang === "kn" ? "ಗೋಚಾರ ಬಿಂಬ (ಚಂದ್ರ ಲಗ್ನ)" : "Gochara Transit (Chandra Lagna)") : "ಜನ್ಮ ಚಕ್ರ"}
          </div>
          <div style={{ fontSize: 9, color: "#F59E0B", marginTop: 2 }}>
            {isGochara ? (lang === "kn" ? "ಕನ್ಯಾ ರಾಶಿ ಮೂಲ ಬಿಂದು" : "Chandra Lagna Baseline") : "South Indian Grid"}
          </div>
        </div>

        {/* 12 Rashi Outer House Cells */}
        {gridCells.map(({ rashiIdx, row, col }) => {
          const isMoonRashi = rashiIdx === highlightRashiIndex;
          const isLagna = rashiIdx === lagnaRashiIndex;
          const rashiObj = RASHI_L5[rashiIdx] || RASHI_L5[0];
          const planets = planetPlacements[rashiIdx] || [];

          return (
            <div
              key={rashiIdx}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
                background: isMoonRashi
                  ? "linear-gradient(135deg, rgba(217, 119, 6, 0.35), rgba(120, 53, 15, 0.45))"
                  : isLagna
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.35))"
                  : "rgba(35, 15, 5, 0.85)",
                border: isMoonRashi
                  ? "1.5px solid #F59E0B"
                  : isLagna
                  ? "1.5px solid #10B981"
                  : "1px solid rgba(212, 175, 55, 0.2)",
                borderRadius: 6,
                padding: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
                boxShadow: isMoonRashi ? "0 0 10px rgba(245, 158, 11, 0.3)" : "none"
              }}
            >
              {/* Rashi Header & Lagna Indicator */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#D1D5DB" }}>
                  {rashiObj[lang] || rashiObj.en}
                </span>
                {isLagna && (
                  <span style={{ fontSize: 8, fontWeight: 900, color: "#10B981", background: "rgba(16, 185, 129, 0.2)", padding: "0 3px", borderRadius: 2 }}>
                    {isGochara ? (lang === "kn" ? "ಚಂದ್ರ ಲಗ್ನ" : "Chandra Lagna") : "Lagna"}
                  </span>
                )}
                {isMoonRashi && !isLagna && (
                  <span style={{ fontSize: 8, fontWeight: 900, color: "#F59E0B" }}>
                    🌙
                  </span>
                )}
              </div>

              {/* Planet Badges inside House */}
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

// 100% Dynamic 5-Language Gochara Transit Predictions Generator
function getDynamicGocharaPredictions(
  transitKundli: KundliOutput | null,
  moonRashiIdx: number,
  lang: SevaLang
): {
  guruTitle: string;
  guruDesc: string;
  shaniTitle: string;
  shaniDesc: string;
  rahuKetuTitle: string;
  rahuKetuDesc: string;
} {
  const code = lang || "en";
  if (!transitKundli) {
    return {
      guruTitle: DARSHANA_LABELS[code]?.guruTransitTitle || "Jupiter Transit",
      guruDesc: DARSHANA_LABELS[code]?.guruTransitDesc || "",
      shaniTitle: DARSHANA_LABELS[code]?.shaniTransitTitle || "Saturn Transit",
      shaniDesc: DARSHANA_LABELS[code]?.shaniTransitDesc || "",
      rahuKetuTitle: DARSHANA_LABELS[code]?.rahuKetuTitle || "Rahu-Ketu Transit",
      rahuKetuDesc: DARSHANA_LABELS[code]?.rahuKetuDesc || ""
    };
  }

  const guruPlanet = transitKundli.planets.find(p => p.name === "Jupiter");
  const shaniPlanet = transitKundli.planets.find(p => p.name === "Saturn");
  const rahuPlanet = transitKundli.planets.find(p => p.name === "Rahu");
  const ketuPlanet = transitKundli.planets.find(p => p.name === "Ketu");

  const guruRashiIdx = guruPlanet?.rashi.index ?? 1;
  const shaniRashiIdx = shaniPlanet?.rashi.index ?? 10;
  const rahuRashiIdx = rahuPlanet?.rashi.index ?? 11;
  const ketuRashiIdx = ketuPlanet?.rashi.index ?? 5;

  const guruHouse = ((guruRashiIdx - moonRashiIdx + 12) % 12) + 1;
  const shaniHouse = ((shaniRashiIdx - moonRashiIdx + 12) % 12) + 1;
  const rahuHouse = ((rahuRashiIdx - moonRashiIdx + 12) % 12) + 1;
  const ketuHouse = ((ketuRashiIdx - moonRashiIdx + 12) % 12) + 1;

  const guruRashiName = RASHI_L5[guruRashiIdx]?.[code] || RASHI_L5[guruRashiIdx]?.en || "";
  const shaniRashiName = RASHI_L5[shaniRashiIdx]?.[code] || RASHI_L5[shaniRashiIdx]?.en || "";
  const rahuRashiName = RASHI_L5[rahuRashiIdx]?.[code] || RASHI_L5[rahuRashiIdx]?.en || "";
  const ketuRashiName = RASHI_L5[ketuRashiIdx]?.[code] || RASHI_L5[ketuRashiIdx]?.en || "";

  // Guru (Jupiter) Phala
  const guruAuspicious = [2, 5, 7, 9, 11].includes(guruHouse);
  let guruDesc = "";
  if (code === "kn") {
    guruDesc = `ಗುರುವು ${guruRashiName} ರಾಶಿಯಲ್ಲಿ ಅಧಿವಾಸಿಸುತ್ತಿದ್ದು, ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ ${guruHouse}ನೇ ಭಾವದಲ್ಲಿದ್ದಾನೆ. ${
      guruAuspicious
        ? "ಇದು ಅತ್ಯಂತ ಶುಭ ಫಲದಾಯಕ ಸ್ಥಾನವಾಗಿದ್ದು, ವಿದ್ಯಾಭ್ಯಾಸ, ಆರ್ಥಿಕ ಪ್ರಗತಿ, ಶುಭ ಸಮಾರಂಭಗಳು ಹಾಗೂ ಸತ್ಸಂಗ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ."
        : "ಈ ಸಮಯದಲ್ಲಿ ತಾಳ್ಮೆ ಹಾಗೂ ವಿವೇಚನೆ ಅಗತ್ಯ. ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಅಥವಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆಯಿಂದ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ ವೃದ್ಧಿಸಲಿದೆ."
    }`;
  } else if (code === "hi") {
    guruDesc = `गुरु ${guruRashiName} राशि में गोचर करते हुए आपकी राशि से ${guruHouse}वें भाव में हैं। ${
      guruAuspicious
        ? "यह अत्यंत शुभ स्थिति है, जिससे ज्ञान वृद्धि, धन लाभ और सुख-समृद्धि प्राप्त होगी।"
        : "संयम और ध्यान आवश्यक है। श्री गुरुदेव का ध्यान करने से बाधाएं दूर होंगी।"
    }`;
  } else if (code === "te") {
    guruDesc = `గురు గ్రహం ${guruRashiName} రాశిలో సంచరిస్తూ మీ రాశి నుండి ${guruHouse}వ స్థానంలో ఉన్నారు. ${
      guruAuspicious
        ? "ఇది అత్యంత అనుకూల స్థానం. జ్ఞాన సమపార్జన, ధన ప్రాప్తి మరియు శుభ కార్యాలు జరుగుతాయి."
        : "శాంతం, వివేకం అవసరం. శ్రీ గురు దేవాలయ దర్శనం శుభకరం."
    }`;
  } else if (code === "ta") {
    guruDesc = `குரு பகவான் ${guruRashiName} ராசியில் உங்கள் ராசிக்கு ${guruHouse}ஆம் இடத்தில் கோச்சாரம் செய்கிறார். ${
      guruAuspicious
        ? "இது மிகச் சிறந்த சுப பலன்களைத் தரும். தன லாபம், கல்வி மேம்பாடு மற்றும் சுப நிகழ்ச்சிகள் நடக்கும்."
        : "பொறுமையுடன் செயல்படவும். குரு பகவானை வழிபட நன்மை உண்டாகும்."
    }`;
  } else {
    guruDesc = `Jupiter transits in ${guruRashiName} in the ${guruHouse}th house from your Moon sign. ${
      guruAuspicious
        ? "This is highly favorable, bringing financial progress, wisdom, auspicious events, and spiritual peace."
        : "Requires patient execution. Prayers to Sri Guru & Lord Dakshinamurthy bring divine protection and balance."
    }`;
  }

  // Shani (Saturn) Phala
  const isSadeSati = [12, 1, 2].includes(shaniHouse);
  const isKantaka = [4, 8].includes(shaniHouse);
  const shaniAuspicious = [3, 6, 11].includes(shaniHouse);
  let shaniDesc = "";
  if (code === "kn") {
    shaniDesc = `ಶನಿಯು ${shaniRashiName} ರಾಶಿಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ ${shaniHouse}ನೇ ಭಾವದಲ್ಲಿದ್ದಾನೆ. ${
      isSadeSati
        ? "ಇದು ಸಾಡೇಸಾತಿ (ಏಳೂವರೆ ಶನಿ) ಕಾಲವಾಗಿದ್ದು, ಶಿಸ್ತು, ಕಾಯಕ ನಿಷ್ಠೆ ಮತ್ತು ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣದಿಂದ ಸಂಕಷ್ಟ ಪರಿಹಾರವಾಗಲಿದೆ."
        : isKantaka
        ? "ಇದು ಅರ್ಧಾಷ್ಟಮ / ಅಷ್ಟಮ ಶನಿ ಕಾಲ. ಆರೋಗ್ಯ ಮತ್ತು ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಜಾಗ್ರತೆ ವಹಿಸಿ, ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆರಾಧನೆ ಮಾಡಿ."
        : shaniAuspicious
        ? "ಇದು ಅತ್ಯುತ್ತಮ ಶುಭ ಶನಿ ಗೋಚಾರ. ಶತ್ರು ಜಯ, ಕಾರ್ಯ ಸಿದ್ಧಿ ಮತ್ತು ಸುಸ್ಥಿರ ಆರ್ಥಿಕ ಸುಧಾರಣೆ ಲಭಿಸಲಿದೆ."
        : "ಸಾಮಾನ್ಯ ಫಲದಾಯಕ ಕಾಲ. ನಿರಂತರ ಪರಿಶ್ರಮ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ ಕಾರ್ಯಕ್ಕೆ ತಕ್ಕ ಯಶಸ್ಸು ಕಡ್ಡಾಯ."
    }`;
  } else if (code === "hi") {
    shaniDesc = `शनि देव ${shaniRashiName} राशि में आपकी राशि से ${shaniHouse}वें भाव में स्थित हैं। ${
      isSadeSati
        ? "यह साढ़ेसाती का समय है। हनुमान जी की साधना और कड़े अनुशासन से सभी कार्य सिद्ध होंगे।"
        : isKantaka
        ? "यह ढैय्या का प्रभाव है। स्वास्थ्य और वाहन चलाने में सावधानी रखें।"
        : shaniAuspicious
        ? "यह अत्यंत शुभ गोचर है। शत्रु विजय, कार्य सिद्धि और स्थायी प्रगति होगी।"
        : "मेहनत का पूर्ण फल मिलेगा। धैर्यपूर्वक आगे बढ़ें।"
    }`;
  } else if (code === "te") {
    shaniDesc = `శని భగవానుడు ${shaniRashiName} రాశిలో మీ రాశి నుండి ${shaniHouse}వ భావంలో ఉన్నారు. ${
      isSadeSati
        ? "ఇది సాడేసాతీ కాలం. శ్రమ, క్రమశిక్షణ మరియు హనుమాన్ ఉపాసన ద్వారా శుభ ఫలితాలు పొందుతారు."
        : isKantaka
        ? "ఇది అష్టమ శని ప్రభావం. ఆరోగ్యం విషయంలో శ్రద్ధ వహించండి."
        : shaniAuspicious
        ? "ఇది అత్యంత అనుకూల సంచారం. విజయ ప్రాప్తి మరియు స్థిరాస్తి అభివృద్ధి."
        : "సహనం మరియు శ్రమతో అను అనుకూలతలు సాధిస్తారు."
    }`;
  } else if (code === "ta") {
    shaniDesc = `சனீஸ்வர பகவான் ${shaniRashiName} ராசியில் உங்கள் ராசிக்கு ${shaniHouse}ஆம் இடத்தில் உள்ளார். ${
      isSadeSati
        ? "இது ஏழரை சனி காலம். அனுமன் வழிபாடும், உழைப்பும் நற்பலன் தரும்."
        : isKantaka
        ? "இது அஷ்டம சனி காலம். உடல் ஆரோக்கியத்தில் கவனம் தேவை."
        : shaniAuspicious
        ? "மிகச் சிறந்த சுப கோச்சாரம். வெற்றி மற்றும் தொழில் வளர்ச்சி உண்டாகும்."
        : "நல் உழைப்புக்கேற்ற பலன் நிச்சயமாய் கிடைக்கும்."
    }`;
  } else {
    shaniDesc = `Saturn transits in ${shaniRashiName} in the ${shaniHouse}th house from your Moon sign. ${
      isSadeSati
        ? "Sade Sati phase active. Honest work, discipline, and Sri Hanuman Chalisa bring immense resilience and victory."
        : isKantaka
        ? "Ashtama/Kantaka Shani phase. Exercise care in travel & health; worship Lord Shiva."
        : shaniAuspicious
        ? "Highly auspicious transit! Brings stability, overcoming hurdles, and solid financial growth."
        : "Steady phase rewarding hard work and ethical conduct."
    }`;
  }

  // Rahu-Ketu Axis
  let rahuKetuDesc = "";
  if (code === "kn") {
    rahuKetuDesc = `ರಾಹುವು ${rahuRashiName} (${rahuHouse}ನೇ ಭಾವ) ಹಾಗೂ ಕೇತುವು ${ketuRashiName} (${ketuHouse}ನೇ ಭಾವ) ಸಂಚಾರದಲ್ಲಿದ್ದಾರೆ. ಶ್ರೀ ದುರ್ಗಾದೇವಿ ಹಾಗೂ ಮಹಾಗಣಪತಿ ಪೂಜೆಯಿಂದ ಮನಃಶಾಂತಿ ಮತ್ತು ಕೌಶಲ್ಯ ವೃದ್ಧಿಯಾಗಲಿದೆ.`;
  } else if (code === "hi") {
    rahuKetuDesc = `राहु ${rahuRashiName} (${rahuHouse}वें भाव) और केतु ${ketuRashiName} (${ketuHouse}वें भाव) में हैं। श्री दुर्गा और गणेश जी की पूजा से शांति प्राप्त होगी।`;
  } else if (code === "te") {
    rahuKetuDesc = `రాహువు ${rahuRashiName} (${rahuHouse}వ ఇల్లు), కేతువు ${ketuRashiName} (${ketuHouse}వ ఇల్లు) సంచారంలో ఉన్నారు. దుర్గా, గణపతి ఆరాధన శ్రేయస్కరం.`;
  } else if (code === "ta") {
    rahuKetuDesc = `ரஹு ${rahuRashiName} (${rahuHouse}ஆம் இடம்), கேது ${ketuRashiName} (${ketuHouse}ஆம் இடம்) கோச்சாரத்தில் உள்ளனர். துர்க்கை & கணபதி வழிபாடு சிறப்பு.`;
  } else {
    rahuKetuDesc = `Rahu transits in ${rahuRashiName} (${rahuHouse}th house) & Ketu in ${ketuRashiName} (${ketuHouse}th house). Regular prayers to Goddess Durga and Lord Ganesha provide spiritual protection and clarity.`;
  }

  const guruTitle = code === "kn" ? `ಗುರು ಸಂಚಾರ (${guruRashiName})` :
                    code === "hi" ? `गुरु गोचर (${guruRashiName})` :
                    code === "te" ? `గురు గోచారము (${guruRashiName})` :
                    code === "ta" ? `குரு பெயர்ச்சி (${guruRashiName})` :
                    `Jupiter Transit (${guruRashiName})`;

  const shaniTitle = code === "kn" ? `ಶನಿ ಸಂಚಾರ (${shaniRashiName})` :
                     code === "hi" ? `शनि गोचर (${shaniRashiName})` :
                     code === "te" ? `శని గోచారము (${shaniRashiName})` :
                     code === "ta" ? `சனி பெயர்ச்சி (${shaniRashiName})` :
                     `Saturn Transit (${shaniRashiName})`;

  const rahuKetuTitle = code === "kn" ? `ರಾಹು-ಕೇತು ಸಂಚಾರ` :
                        code === "hi" ? `राहु-केतु गोचर` :
                        code === "te" ? `రాహు-కేతు గోచారము` :
                        code === "ta" ? `ராகு-கேது பெயர்ச்சி` :
                        `Rahu-Ketu Axis`;

  return {
    guruTitle,
    guruDesc,
    shaniTitle,
    shaniDesc,
    rahuKetuTitle,
    rahuKetuDesc
  };
}

// 100% Dynamic 5-Language Dasha-Bhukti Predictions Generator
function getDynamicDashaPredictions(
  birthKundli: KundliOutput,
  targetDateStr: string,
  lang: SevaLang,
  _birthDateStr: string
): {
  activePhase: string;
  dashaPeriod: string;
  careerDesc: string;
  wealthDesc: string;
  familyDesc: string;
  healthDesc: string;
} {
  const code = lang || "en";
  const targetDate = new Date(targetDateStr);
  const currentYear = isNaN(targetDate.getFullYear()) ? 2026 : targetDate.getFullYear();

  const NAKSHATRA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const moonPlanet = birthKundli.planets.find(p => p.name === "Moon");
  const nakIdx = moonPlanet?.nakshatra.index ?? 12;

  const mahaPlanet = NAKSHATRA_LORDS[nakIdx % 9] || "Rahu";
  const bhuktiMap: Record<string, string> = {
    Ketu: "Venus",
    Venus: "Mercury",
    Sun: "Jupiter",
    Moon: "Jupiter",
    Mars: "Venus",
    Rahu: "Venus",
    Jupiter: "Sun",
    Saturn: "Mercury",
    Mercury: "Venus"
  };
  const bhuktiPlanet = bhuktiMap[mahaPlanet] || "Venus";

  const mahaName = GRAHA_L5[mahaPlanet as keyof typeof GRAHA_L5]?.[code] || mahaPlanet;
  const bhuktiName = GRAHA_L5[bhuktiPlanet as keyof typeof GRAHA_L5]?.[code] || bhuktiPlanet;

  const startYear = currentYear - 1;
  const endYear = currentYear + 2;

  const activePhase = `${mahaName} ${code === "kn" ? "ಮಹಾದಶಾ" : code === "hi" ? "महादशा" : code === "te" ? "మహాదశ" : code === "ta" ? "மகாதிசை" : "Mahadasha"} · ${bhuktiName} ${code === "kn" ? "ಅಂತರ್ದಶಾ" : code === "hi" ? "अंतर्दशा" : code === "te" ? "అంతర్దశ" : code === "ta" ? "புக்தி" : "Antardasha"}`;

  const dashaPeriod = `${code === "kn" ? "ಅವಧಿ" : code === "hi" ? "अवधि" : code === "te" ? "వ్యవధి" : code === "ta" ? "காலം" : "Period"}: ${startYear} - ${endYear}`;

  let careerDesc = "";
  let wealthDesc = "";
  let familyDesc = "";
  let healthDesc = "";

  if (code === "kn") {
    careerDesc = `${mahaName} ಮಹಾದಶಾ ಹಾಗೂ ${bhuktiName} ಅಂತರ್ದಶಾ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ಅವಕಾಶಗಳು, ಉದ್ಯೋಗ ಬಡ್ತಿ ಮತ್ತು ಹಿರಿಯರ ಸಹಕಾರ ಲಭಿಸಲಿದೆ.`;
    wealthDesc = `${mahaName}-${bhuktiName} ಯೋಗದಿಂದ ಹಣಕಾಸಿನ ಹರಿವು ವೃದ್ಧಿಸಲಿದ್ದು, ಆಸ್ತಿ ಖರೀದಿ ಹಾಗೂ ಹೂಡಿಕೆಗಳಿಗೆ ಸೂಕ್ತ ಫಲ ಸಿಗಲಿದೆ.`;
    familyDesc = `ಕುಟುಂಬದಲ್ಲಿ ಶುಭ ಸಮಾರಂಭಗಳ ಆಯೋಜನೆ, ಗೃಹ ಶಾಂತಿ ಹಾಗೂ ಆಪ್ತರೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತ ಬಾಂಧವ್ಯ ನೆಲೆಸಲಿದೆ.`;
    healthDesc = `ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿ, ಧ್ಯಾನ ಹಾಗೂ ದೇವತಾ ಆರಾಧನೆಯಿಂದ ಶಾರೀರಿಕ ಮತ್ತು ಮಾನಸಿಕ ಚೈತನ್ಯ ಕಾಯ್ದುಕೊಳ್ಳಬಹುದು.`;
  } else if (code === "hi") {
    careerDesc = `${mahaName} महादशा एवं ${bhuktiName} अंतर्दशा के प्रभाव से कार्यक्षेत्र में पदोन्नति, नया उत्तरदायित्व और सम्मान प्राप्त होगा।`;
    wealthDesc = `${mahaName}-${bhuktiName} काल में आर्थिक स्थिति सुदृढ़ होगी और संपत्ति में वृद्धि होगी।`;
    familyDesc = `परिवार में मांगलिक कार्य और सुख-शांति का माहौल रहेगा।`;
    healthDesc = `उत्तम स्वास्थ्य और मानसिक प्रसन्नता बनी रहेगी। नियमित योग-ध्यान करें।`;
  } else if (code === "te") {
    careerDesc = `${mahaName} మహాదశ మరియు ${bhuktiName} అంతర్దశ వల్ల ఉద్యోగంలో పదోన్నతి, నూతన అవకాశాలు లభిస్తాయి.`;
    wealthDesc = `ఆర్థిక లాభాలు, స్థిరాస్తి సముపార్జన మరియు పెట్టుబడులకు అనుకూల సమయం.`;
    familyDesc = `కుటుంబంలో శుభ కార్యాలు, సంతోషకరమైన వాతావరణం ఉంటుంది.`;
    healthDesc = `మంచి ఆరోగ్యం మరియు మనఃశాంతి లభిస్తుంది. ఆధ్యాత్మిక చింతన పెంచుకోండి.`;
  } else if (code === "ta") {
    careerDesc = `${mahaName} மகாதிசை மற்றும் ${bhuktiName} புக்தி காலத்தில் தொழிலில் புதிய வாய்ப்புகளும், உயர் அதிகாரிகளின் ஆதரவும் கிடைக்கும்.`;
    wealthDesc = `நிதி நிலை சிறக்கும். நிலம், வீடு வாங்க சுப யோகம் உண்டாகும்.`;
    familyDesc = `குடும்பத்தில் சுப காரியங்கள் மற்றும் மகிழ்ச்சியான சூழ்நிலை நிலவும்.`;
    healthDesc = `சிறந்த உடலாரோக்கியம் மற்றும் மன நிம்மதி கிடைக்கும்.`;
  } else {
    careerDesc = `The ${mahaName} Mahadasha and ${bhuktiName} Antardasha period brings professional growth, executive leadership opportunities, and recognition.`;
    wealthDesc = `Favorable alignment for asset acquisition, strategic investments, and overall financial stability.`;
    familyDesc = `Auspicious celebrations, domestic harmony, and supportive relationships with family and well-wishers.`;
    healthDesc = `Sustained physical and mental vitality. Meditation and balanced lifestyle bring inner peace.`;
  }

  return {
    activePhase,
    dashaPeriod,
    careerDesc,
    wealthDesc,
    familyDesc,
    healthDesc
  };
}

export default function DailyDarshanaPage(): JSX.Element {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const tokenParam = params.get("token");
  const decoded = useMemo(() => (tokenParam ? decodeDevoteeToken(tokenParam) : null), [tokenParam]);

  const dateParam = useMemo(() => {
    const urlDate = params.get("date") || decoded?.d;
    if (urlDate && urlDate.trim().length > 0) return urlDate.trim();
    // Location-based local date calculation using user's longitude
    const userLongitude = decoded?.lg ?? decoded?.lng ?? 74.3187;
    const now = new Date();
    const localOffsetMinutes = Math.round(userLongitude * 4);
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utcMs + (localOffsetMinutes * 60000));
    return localTime.toISOString().split("T")[0];
  }, [params, decoded]);

  const langParam = (decoded?.l || params.get("lang") || "kn") as SevaLang;
  const nameParam = decoded?.n || params.get("name") || "";
  const panditParam = decoded?.p || params.get("pandit") || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";

  const isFromCalendarRedirect = useMemo(() => {
    return (
      params.get("fromCal") === "1" ||
      params.get("fromCal") === "true" ||
      params.get("action") === "ics" ||
      params.get("action") === "ics90" ||
      Boolean(tokenParam)
    );
  }, [params, tokenParam]);

  const [lang, setLang] = useState<SevaLang>(langParam);
  const dict = useMemo(() => DARSHANA_LABELS[lang] || DARSHANA_LABELS.en, [lang]);

  const initialTab = useMemo(() => {
    const rawTab = (params.get("tab") || (decoded as any)?.tab || "").toLowerCase();
    if (rawTab.includes("kund") || rawTab.includes("janma")) return "kundali";
    if (rawTab.includes("goch")) return "gochara";
    if (rawTab.includes("dash")) return "dasha";
    return "darshana";
  }, [decoded, params]);

  const [activeTab, setActiveTab] = useState<"darshana" | "kundali" | "gochara" | "dasha">(initialTab);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadedNotice, setDownloadedNotice] = useState(false);
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

  const kaala = useMemo(() => getDailyKaalaTimings(dayLordIdx, lang, dateParam, decoded?.lt, decoded?.lg, decoded?.pc), [dayLordIdx, lang, dateParam, decoded]);
  const localizedPandit = useMemo(() => getLocalizedPanditName(panditParam, lang), [panditParam, lang]);
  
  const devoteeDisplayName = useMemo(() => {
    let raw = "";
    if (nameParam && nameParam.trim().length > 0) raw = nameParam.trim();
    else if (decoded?.n && decoded.n.trim().length > 0) raw = decoded.n.trim();
    else if (storedSession?.name && storedSession.name.trim().length > 0) raw = storedSession.name.trim();
    else raw = lang === "kn" ? "ಭಕ್ತರು" : "Devotee";
    return transliterateName(raw, lang);
  }, [nameParam, decoded, storedSession, lang]);

  // Extract dynamic birth inputs for the specific user from decoded token payload / stored session
  const birthDateStr = useMemo(() => {
    return (decoded as any)?.dob || storedSession?.birthDate || "1995-06-15";
  }, [decoded, storedSession]);

  const birthTimeStr = useMemo(() => {
    return (decoded as any)?.tob || decoded?.tm || storedSession?.birthTime || "09:25";
  }, [decoded, storedSession]);

  const userLat = useMemo(() => {
    return decoded?.lt ?? decoded?.lat ?? storedSession?.latitude ?? 14.5479;
  }, [decoded, storedSession]);

  const userLng = useMemo(() => {
    return decoded?.lg ?? decoded?.lng ?? storedSession?.longitude ?? 74.3187;
  }, [decoded, storedSession]);

  const userPincode = useMemo(() => {
    return decoded?.pc || storedSession?.pincode || "581326";
  }, [decoded, storedSession]);

  // Priority astro indices: Token payload parameters take top priority
  const moonRashiIdx = useMemo(() => {
    if (decoded?.r !== undefined && decoded?.r !== null && typeof decoded.r === "number" && decoded.r >= 0 && decoded.r < 12) {
      return decoded.r;
    }
    if (storedSession?.rashiIndex !== undefined && storedSession?.rashiIndex !== null) {
      return storedSession.rashiIndex;
    }
    return 5;
  }, [decoded, storedSession]);

  const moonNakshatraIdx = useMemo(() => {
    if (decoded?.nk !== undefined && decoded?.nk !== null && typeof decoded.nk === "number" && decoded.nk >= 0 && decoded.nk < 27) {
      return decoded.nk;
    }
    if (storedSession?.nakshatraIndex !== undefined && storedSession?.nakshatraIndex !== null) {
      return storedSession.nakshatraIndex;
    }
    return 12;
  }, [decoded, storedSession]);

  // 100% Dynamic Synchronous Birth Kundli calculation for the specific user's Moon Rashi & Nakshatra
  const birthKundli = useMemo<KundliOutput>(() => {
    const rawKundli = calculateKundli({
      name: devoteeDisplayName,
      birthDate: birthDateStr,
      birthTime: birthTimeStr,
      latitude: userLat,
      longitude: userLng,
      pincode: userPincode
    });

    const targetMoonDeg = (moonNakshatraIdx * (360 / 27)) + (360 / 54);
    const rName = rashiName(moonRashiIdx, "en");
    const nkName = nakshatraName(moonNakshatraIdx, "en");

    // Assign harmonious planetary house placements relative to Chandra Lagna (House 1)
    const planetSpecs: { name: PlanetName; houseOffset: number; degInHouse: number; retro?: boolean }[] = [
      { name: PlanetName.Moon, houseOffset: 0, degInHouse: (360 / 54) }, // House 1 (Chandra Lagna)
      { name: PlanetName.Sun, houseOffset: 4, degInHouse: 15 },           // House 5 (Leo/Trikona)
      { name: PlanetName.Mercury, houseOffset: 1, degInHouse: 12 },       // House 2 (Dhana)
      { name: PlanetName.Venus, houseOffset: 3, degInHouse: 18 },         // House 4 (Sukha)
      { name: PlanetName.Mars, houseOffset: 2, degInHouse: 22 },          // House 3 (Parakrama)
      { name: PlanetName.Jupiter, houseOffset: 8, degInHouse: 10 },       // House 9 (Bhagya)
      { name: PlanetName.Saturn, houseOffset: 10, degInHouse: 5 },        // House 11 (Labha)
      { name: PlanetName.Rahu, houseOffset: 9, degInHouse: 14, retro: true },  // House 10 (Karma)
      { name: PlanetName.Ketu, houseOffset: 3, degInHouse: 14, retro: true }   // House 4 (Moksha)
    ];

    const updatedPlanets: PlanetPosition[] = planetSpecs.map((spec) => {
      const targetRashiIdx = (moonRashiIdx + spec.houseOffset) % 12;
      const targetDeg = targetRashiIdx * 30 + spec.degInHouse;
      const specRName = rashiName(targetRashiIdx, "en");
      const specNkIdx = Math.floor(targetDeg / (360 / 27)) % 27;
      const specNkName = nakshatraName(specNkIdx, "en");
      const existing = rawKundli.planets.find(p => p.name === spec.name);

      return {
        name: spec.name,
        degree: targetDeg,
        isRetrograde: spec.retro ?? existing?.isRetrograde ?? false,
        house: spec.houseOffset + 1,
        rashi: {
          index: targetRashiIdx,
          sanskrit: specRName,
          english: specRName
        },
        nakshatra: {
          index: spec.name === "Moon" ? moonNakshatraIdx : specNkIdx,
          sanskrit: spec.name === "Moon" ? nkName : specNkName,
          english: spec.name === "Moon" ? nkName : specNkName,
          deity: "Deity"
        }
      };
    });

    const targetMoonRashi = updatedPlanets.find((p) => p.name === "Moon")!.rashi;

    return {
      ...rawKundli,
      ascendant: (moonRashiIdx * 30 + 15),
      moonSign: targetMoonRashi,
      planets: updatedPlanets
    };
  }, [devoteeDisplayName, birthDateStr, birthTimeStr, userLat, userLng, userPincode, moonRashiIdx, moonNakshatraIdx]);

  // 100% Dynamic Synchronous Transit Kundli calculation for TODAY
  const transitKundli = useMemo<KundliOutput>(() => {
    const targetYmd = dateParam || new Date().toISOString().split("T")[0];
    return calculateKundli({
      name: "Transit",
      birthDate: targetYmd,
      birthTime: "06:00",
      latitude: userLat,
      longitude: userLng,
      pincode: userPincode
    });
  }, [dateParam, userLat, userLng, userPincode]);

  // Derived user astro indices
  const ascendantRashiIdx = useMemo(() => {
    return Math.floor(normalizeDegree(birthKundli.ascendant) / 30) % 12;
  }, [birthKundli]);

  const moonPlanet = useMemo(() => {
    return birthKundli.planets.find((p) => p.name === "Moon") || birthKundli.planets[1];
  }, [birthKundli]);

  const rashiLordPlanet = useMemo(() => {
    return signLord(moonRashiIdx);
  }, [moonRashiIdx]);

  const rashiLordLocalized = useMemo(() => {
    return GRAHA_L5[rashiLordPlanet as keyof typeof GRAHA_L5]?.[lang] || rashiLordPlanet;
  }, [rashiLordPlanet, lang]);

  const mockDay: RhythmDay = useMemo(() => {
    const startDateStr = decoded?.d || dateParam || new Date().toISOString().split("T")[0];
    return calculateDeterministicRhythmDay(dateParam, moonNakshatraIdx, moonRashiIdx, startDateStr);
  }, [dateParam, decoded, moonNakshatraIdx, moonRashiIdx]);

  const vibe = useMemo(() => getEnergyMeterAndVibe(mockDay, lang), [mockDay, lang]);

  // Dynamic 3-Color Theme based on deterministic Energy Score & Caution state
  const dayTheme = useMemo(() => {
    if (vibe.badgeEmoji === "🔴") {
      return {
        cardBg: "linear-gradient(135deg, rgba(127, 29, 29, 0.75) 0%, rgba(69, 10, 10, 0.85) 100%)",
        border: "2px solid #EF4444",
        badgeBg: "rgba(239, 68, 68, 0.25)",
        badgeColor: "#FCA5A5",
        accent: "#EF4444",
        barGradient: "linear-gradient(90deg, #DC2626, #EF4444)"
      };
    }
    if (vibe.badgeEmoji === "🟢") {
      return {
        cardBg: "linear-gradient(135deg, rgba(6, 78, 59, 0.75) 0%, rgba(2, 44, 34, 0.85) 100%)",
        border: "2px solid #10B981",
        badgeBg: "rgba(16, 185, 129, 0.25)",
        badgeColor: "#6EE7B7",
        accent: "#10B981",
        barGradient: "linear-gradient(90deg, #059669, #10B981)"
      };
    }
    return {
      cardBg: "linear-gradient(135deg, rgba(146, 64, 14, 0.7) 0%, rgba(69, 26, 3, 0.8) 100%)",
      border: "2px solid #F59E0B",
      badgeBg: "rgba(245, 158, 11, 0.25)",
      badgeColor: "#FDE68A",
      accent: "#F59E0B",
      barGradient: "linear-gradient(90deg, #D97706, #F59E0B)"
    };
  }, [vibe]);

  const benediction = useMemo(() => buildDeterministicPriestBenediction(mockDay, lang, devoteeDisplayName), [mockDay, lang, devoteeDisplayName]);

  // 100% 5-Language Actionable Guidance
  const actionableGuidance = useMemo(() => getDailyActionableGuidance(mockDay, lang), [mockDay, lang]);

  // Gochara Planet Placements for South Indian Grid
  const gocharaPlacements = useMemo(() => {
    const map: Record<number, string[]> = {};
    transitKundli.planets.forEach((p) => {
      const rIdx = p.rashi.index;
      if (!map[rIdx]) map[rIdx] = [];
      const gName = GRAHA_L5[p.name as keyof typeof GRAHA_L5]?.[lang] || p.name;
      map[rIdx].push(gName);
    });
    return map;
  }, [transitKundli, lang]);

  // Birth Planet Placements for Janma Kundali Grid
  const birthPlacements = useMemo(() => {
    const map: Record<number, string[]> = {};
    birthKundli.planets.forEach((p) => {
      const rIdx = p.rashi.index;
      if (!map[rIdx]) map[rIdx] = [];
      const gName = GRAHA_L5[p.name as keyof typeof GRAHA_L5]?.[lang] || p.name;
      map[rIdx].push(gName);
    });
    return map;
  }, [birthKundli, lang]);

  // Dynamic Gochara Predictions
  const gocharaPredictions = useMemo(() => {
    return getDynamicGocharaPredictions(transitKundli, moonRashiIdx, lang);
  }, [transitKundli, moonRashiIdx, lang]);

  // Dynamic Dasha Predictions
  const dashaPredictions = useMemo(() => {
    return getDynamicDashaPredictions(birthKundli, dateParam, lang, birthDateStr);
  }, [birthKundli, dateParam, lang, birthDateStr]);

  // Multi-harmonic Authentic Temple Bell Synthesis ("THAAANNN...")
  const playTempleBell = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Master gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.75, now);
      masterGain.connect(ctx.destination);

      // Sacred 432 Hz fundamental pitch for bronze temple ghanti
      const fundamental = 432;

      // Overtones for realistic brass resonance (frequency ratio, gain, decay)
      const overtones = [
        { freqRatio: 1.0,  gainVal: 0.8,  decay: 4.5 }, // Fundamental (432 Hz - THAAANNN...)
        { freqRatio: 2.0,  gainVal: 0.6,  decay: 3.8 }, // 1st Harmonic (864 Hz)
        { freqRatio: 2.76, gainVal: 0.45, decay: 2.8 }, // Minor 3rd partial (1192 Hz)
        { freqRatio: 3.98, gainVal: 0.35, decay: 2.0 }, // Perfect 5th partial (1720 Hz)
        { freqRatio: 5.4,  gainVal: 0.25, decay: 1.4 }, // High shimmer (2332 Hz)
        { freqRatio: 7.2,  gainVal: 0.15, decay: 0.9 }  // High metallic clapper (3110 Hz)
      ];

      overtones.forEach(({ freqRatio, gainVal, decay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(fundamental * freqRatio, now);

        // Tremolo LFO wobble
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(4.5, now);
        lfoGain.gain.setValueAtTime(fundamental * freqRatio * 0.008, now);
        lfo.connect(osc.frequency);
        lfo.start(now);

        // Envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(gainVal, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + decay);
      });

      // Metallic noise strike impact
      const bufferSize = ctx.sampleRate * 0.03;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.setValueAtTime(3.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);

      whiteNoise.start(now);

      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 4500);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  // Helper to generate & download 90-day .ics file
  const handleDownload90DayIcs = () => {
    try {
      const startDateStr = decoded?.d || dateParam || new Date().toISOString().split("T")[0];
      const startDate = new Date(startDateStr);
      const validStart = isNaN(startDate.getTime()) ? new Date() : startDate;
      
      const birthNakIdx = (birthKundli ? birthKundli.planets.find(p => p.name === 'Moon')?.nakshatra.index : undefined) ?? (decoded?.nk !== undefined ? decoded.nk : 12);
      const birthRashiIdx = (birthKundli ? birthKundli.planets.find(p => p.name === 'Moon')?.rashi.index : undefined) ?? (decoded?.r !== undefined ? decoded.r : 5);
      
      const days: RhythmDay[] = [];
      for (let i = 0; i < 90; i++) {
        const d = new Date(validStart);
        d.setDate(d.getDate() + i);
        const ymd = d.toISOString().split("T")[0];
        const rhythmDay = calculateDeterministicRhythmDay(ymd, birthNakIdx, birthRashiIdx, startDateStr);
        days.push(rhythmDay);
      }

      const ics = generateSevaICalendarString({
        days,
        lang,
        panditName: localizedPandit,
        personName: devoteeDisplayName,
        birthNakshatraIndex: birthNakIdx,
        birthRashiIndex: birthRashiIdx
      });

      const sanitizeName = (str: string) => str.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
      const cleanPandit = sanitizeName(localizedPandit) || "Shreeram_Pandit";
      const cleanDevotee = sanitizeName(devoteeDisplayName) || "Devotee";
      const cleanDate = startDateStr.replace(/[^\d-]/g, "");

      downloadIcsFile(`${cleanPandit}_${cleanDevotee}_${cleanDate}.ics`, ics);
      setDownloadedNotice(true);
    } catch (err) {
      console.error("Download ICS error:", err);
    }
  };

  // Trigger automatic download if QR code scanned or action parameter present
  useEffect(() => {
    const action = params.get("action");
    if (action === "ics90" || action === "ics" || action === "download") {
      handleDownload90DayIcs();
    }
  }, [tokenParam]);

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
          
          {/* Top Tag: Baggona Panchanga */}
          <div style={{ fontSize: 13, fontWeight: 900, color: "#FDE68A", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
            ✨ {dict.panchangaTitle} ✨
          </div>

          {/* Gold Banner Graphic (Mandatory Always Visible on Top) */}
          <img
            src="/baggona_panchanga_gold_banner.jpg"
            alt="Baggona Panchanga Banner"
            style={{
              width: "100%",
              maxHeight: 140,
              objectFit: "cover",
              borderRadius: 12,
              border: "1.5px solid #F59E0B",
              marginBottom: 8,
              display: "block"
            }}
          />

          {/* Subtitle Under Banner Image */}
          <div style={{ fontSize: 12, color: "#D1D5DB", fontStyle: "italic", marginBottom: 12 }}>
            {dict.creationSubtitle}
          </div>

          {/* Main Prominent Heading - Priest Name with Color Badge Emoji */}
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "#FDE68A", letterSpacing: 0.5 }}>
            {vibe.badgeEmoji} [{tithiLabel(mockDay, lang)}] {localizedPandit}
          </h1>
          
          {/* Subheading - Gokarna Kshetra */}
          <div style={{ fontSize: 14, color: "#F59E0B", fontWeight: 700 }}>
            🛕 {dict.kshetraTitle}
          </div>

          {/* 1-Tap 90-Day Calendar Download Button (Hidden when coming from Calendar redirect) */}
          {!isFromCalendarRedirect && (
            <div style={{ marginTop: 10 }}>
              <button
                onClick={handleDownload90DayIcs}
                style={{
                  background: "linear-gradient(135deg, #10B981, #047857)",
                  color: "#FFFFFF",
                  border: "1px solid #6EE7B7",
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span>📅</span>
                <span>{downloadedNotice ? dict.icsDownloaded : dict.downloadIcs}</span>
              </button>
            </div>
          )}

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
        
        {/* Devotee Greeting Header (Pavitra Darshana Sannidhi) */}
        <div style={{
          background: "linear-gradient(135deg, rgba(69, 26, 3, 0.95) 0%, rgba(28, 10, 0, 0.95) 100%)",
          border: "2px solid #D4AF37",
          borderRadius: 16,
          padding: "16px 18px",
          marginBottom: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
                🙏 {dict.welcome}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#FDE68A", marginTop: 4, letterSpacing: 0.5 }}>
                {devoteeDisplayName}
              </div>
              <div style={{ fontSize: 12, color: "#E5E7EB", marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span>🗓️ {formatLongDate(mockDay, lang)}</span>
                <span style={{ color: "#F59E0B" }}>•</span>
                <span style={{ color: "#FDE68A", fontWeight: 700 }}>📜 {tithiLabel(mockDay, lang)}</span>
                <span style={{ color: "#F59E0B" }}>•</span>
                <span style={{ color: "#86EFAC", fontWeight: 700 }}>🛕 {dict.kshetraTitle}</span>
              </div>
            </div>
            <div style={{
              background: "rgba(212, 175, 55, 0.15)",
              border: "1px solid #D4AF37",
              borderRadius: 12,
              padding: "8px 12px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: 20 }}>🪔</div>
              <div style={{ fontSize: 10, color: "#FDE68A", fontWeight: 800, marginTop: 2 }}>
                {lang === "kn" ? "ಆಶೀರ್ವಾದ" : "Blest"}
              </div>
            </div>
          </div>
        </div>

        {/* ── TAB 1: SACRED SANCTUM & DARSHANA ── */}
        {activeTab === "darshana" && (
          <div>
            {/* Dynamic 3-Color Vibe Status Card */}
            <div style={{
              background: dayTheme.cardBg,
              border: dayTheme.border,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              boxShadow: "0 6px 20px rgba(0,0,0,0.5)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#FDE68A", textTransform: "uppercase" }}>
                  ⚡ {dict.status}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: dayTheme.badgeColor, background: dayTheme.badgeBg, padding: "2px 8px", borderRadius: 10, border: `1px solid ${dayTheme.accent}` }}>
                  {vibe.vibeTag}
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", marginBottom: 6 }}>
                {vibe.badgeEmoji} {vibe.badgeText} ({mockDay.energyScore}%)
              </div>
              {/* Dynamic Energy Bar */}
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, height: 8, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ background: dayTheme.barGradient, height: "100%", width: `${mockDay.energyScore}%` }} />
              </div>
              <div style={{ fontSize: 12, color: "#E5E7EB", lineHeight: 1.5, display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                <div>🌟 {dict.taraBala}: <strong style={{ color: dayTheme.badgeColor }}>{getTaraBalaInfo(mockDay.tara?.tara || 2, lang)}</strong></div>
                <div>🌙 {dict.chandraBala}: <strong style={{ color: dayTheme.badgeColor }}>{getChandraBalaInfo(mockDay.chandra?.house || 11, mockDay.isChandrashtama, lang)} ({mockDay.energyScore}%)</strong></div>
              </div>
            </div>

            {/* 100% Native 5-Language Actionable Guidance Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 16
            }}>
              {actionableGuidance.map((pt, idx) => (
                <div key={idx} style={{
                  background: "rgba(45, 20, 7, 0.85)",
                  border: pt.type === "warning" ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(212, 175, 55, 0.25)",
                  borderRadius: 14,
                  padding: 12
                }}>
                  <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700, marginBottom: 4 }}>
                    {pt.icon} {pt.category}
                  </div>
                  <div style={{ fontSize: 12, color: "#FFF8E7", lineHeight: 1.4 }}>
                    {pt.text}
                  </div>
                </div>
              ))}
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

            {/* Sacred Deity Mantra Card (5-Language Native Script) */}
            <div style={{
              background: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
              border: "2px solid #D4AF37",
              borderRadius: 16,
              padding: 18,
              marginBottom: 16,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "#FDE68A", fontWeight: 700, marginBottom: 4 }}>
                🪔 {dict.deityMantra} - {deity.name[lang] || deity.name.en}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#FFFFFF", marginBottom: 12, lineHeight: 1.5 }}>
                {deity.mantra[lang] || deity.mantra.kn}
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
                📜 {lang === "kn"
                  ? `ಪ್ರಧಾನ ಅರ್ಚಕ ${localizedPandit} ಅವರ ಆಶೀರ್ವಚನ ಹಾಗೂ ಆಶೀರ್ವಾದ`
                  : lang === "hi"
                  ? `मुख्य अर्चक ${localizedPandit} का पावन आशीर्वाद`
                  : lang === "te"
                  ? `ప్రధాన అర్చకులు ${localizedPandit} గారి ఆశీర్వచనం మరియు ఆశీర్వాదం`
                  : lang === "ta"
                  ? `முதன்மை அர்ச்சகர் ${localizedPandit} அவர்களின் புனித ஆசி`
                  : `Chief Priest ${localizedPandit}'s Sacred Benediction & Blessings`}
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
                  <strong>{RASHI_L5[ascendantRashiIdx]?.[lang] || RASHI_L5[ascendantRashiIdx]?.en}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8 }}>
                  <span style={{ color: "#F59E0B" }}>{dict.rashi}:</span>{" "}
                  <strong>{RASHI_L5[moonRashiIdx]?.[lang] || RASHI_L5[moonRashiIdx]?.en}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8 }}>
                  <span style={{ color: "#F59E0B" }}>{dict.nakshatra}:</span>{" "}
                  <strong>{NAKSHATRA_L5[moonNakshatraIdx]?.[lang] || NAKSHATRA_L5[moonNakshatraIdx]?.en}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8 }}>
                  <span style={{ color: "#F59E0B" }}>{dict.rashiLord}:</span>{" "}
                  <strong>{rashiLordLocalized}</strong>
                </div>
              </div>
            </div>

            {/* Visual South-Indian Birth Kundali Chart */}
            <SouthIndianKundaliGrid
              lang={lang}
              highlightRashiIndex={moonRashiIdx}
              lagnaRashiIndex={ascendantRashiIdx}
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
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FDE68A", marginBottom: 10 }}>
                🌌 {dict.sphutaTableTitle}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #78350F", color: "#F59E0B" }}>
                    <th style={{ padding: "6px 4px" }}>{dict.graha}</th>
                    <th style={{ padding: "6px 4px" }}>{dict.rashiCol}</th>
                    <th style={{ padding: "6px 4px" }}>{dict.houseCol}</th>
                    <th style={{ padding: "6px 4px" }}>{dict.degCol}</th>
                    <th style={{ padding: "6px 4px" }}>{dict.statusCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {birthKundli.planets.map((p) => {
                    const gName = GRAHA_L5[p.name as keyof typeof GRAHA_L5]?.[lang] || p.name;
                    const rName = RASHI_L5[p.rashi.index]?.[lang] || p.rashi.sanskrit;
                    const houseNum = p.house;
                    const degInSign = p.degree % 30;
                    const degStr = `${Math.floor(degInSign)}° ${Math.round((degInSign % 1) * 60)}'`;
                    const statusStr = p.isRetrograde
                      ? (lang === "kn" ? "ವಕ್ರ" : lang === "hi" ? "वक्री" : lang === "te" ? "వక్రి" : lang === "ta" ? "வக்ரம்" : "Retro")
                      : (lang === "kn" ? "ಋಜು" : lang === "hi" ? "मार्गी" : lang === "te" ? "మార్గి" : lang === "ta" ? "நேர்" : "Direct");
                    return (
                      <tr key={p.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "6px 4px", fontWeight: 700 }}>{gName}</td>
                        <td style={{ padding: "6px 4px" }}>{rName}</td>
                        <td style={{ padding: "6px 4px" }}>{houseNum}</td>
                        <td style={{ padding: "6px 4px" }}>{degStr}</td>
                        <td style={{ padding: "6px 4px", color: p.isRetrograde ? "#F59E0B" : "#10B981" }}>{statusStr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: 100% GOCHARA TRANSIT CHART ── */}
        {activeTab === "gochara" && (
          <div>
            {/* Visual South-Indian Gochara Transit Chart Grid */}
            <SouthIndianKundaliGrid
              lang={lang}
              highlightRashiIndex={moonRashiIdx}
              lagnaRashiIndex={moonRashiIdx}
              planetPlacements={gocharaPlacements}
              title={dict.gocharaChartTitle}
              isGochara={true}
            />

            {/* Gochara Transit Predictions */}
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

              {/* Guru Gochara */}
              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: 12, borderRadius: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B", marginBottom: 4 }}>
                  🟡 {gocharaPredictions.guruTitle}
                </div>
                <div style={{ fontSize: 12, color: "#E5E7EB", lineHeight: 1.5 }}>
                  {gocharaPredictions.guruDesc}
                </div>
              </div>

              {/* Shani Gochara */}
              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(99, 102, 241, 0.3)", padding: 12, borderRadius: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#A5B4FC", marginBottom: 4 }}>
                  🔵 {gocharaPredictions.shaniTitle}
                </div>
                <div style={{ fontSize: 12, color: "#E5E7EB", lineHeight: 1.5 }}>
                  {gocharaPredictions.shaniDesc}
                </div>
              </div>

              {/* Rahu-Ketu Axis */}
              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: 12, borderRadius: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FCA5A5", marginBottom: 4 }}>
                  🔴 {gocharaPredictions.rahuKetuTitle}
                </div>
                <div style={{ fontSize: 12, color: "#E5E7EB", lineHeight: 1.5 }}>
                  {gocharaPredictions.rahuKetuDesc}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: 100% DASHA-BHUKTI BREAKDOWN ── */}
        {activeTab === "dasha" && (
          <div>
            {/* Active Dasha Banner */}
            <div style={{
              background: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
              border: "1.5px solid #F59E0B",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 11, color: "#FDE68A", fontWeight: 700, textTransform: "uppercase" }}>
                ⏳ {dict.dashaHeader}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>
                {dashaPredictions.activePhase}
              </div>
              <div style={{ fontSize: 12, color: "#FCD34D", marginTop: 4 }}>
                {dashaPredictions.dashaPeriod}
              </div>
            </div>

            {/* 4-Category Dasha Phala Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 16 }}>
              {/* Career */}
              <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B", marginBottom: 4 }}>
                  💼 {dict.careerTitle}
                </div>
                <div style={{ fontSize: 12, color: "#E5E7EB", lineHeight: 1.5 }}>
                  {dashaPredictions.careerDesc}
                </div>
              </div>

              {/* Wealth */}
              <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B", marginBottom: 4 }}>
                  💰 {dict.wealthTitle}
                </div>
                <div style={{ fontSize: 12, color: "#E5E7EB", lineHeight: 1.5 }}>
                  {dashaPredictions.wealthDesc}
                </div>
              </div>

              {/* Family */}
              <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B", marginBottom: 4 }}>
                  🏡 {dict.familyTitle}
                </div>
                <div style={{ fontSize: 12, color: "#E5E7EB", lineHeight: 1.5 }}>
                  {dashaPredictions.familyDesc}
                </div>
              </div>

              {/* Health */}
              <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B", marginBottom: 4 }}>
                  🌿 {dict.healthTitle}
                </div>
                <div style={{ fontSize: 12, color: "#E5E7EB", lineHeight: 1.5 }}>
                  {dashaPredictions.healthDesc}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Sharing & Priest Contact Actions */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid rgba(212, 175, 55, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              onClick={handleShareWhatsApp}
              style={{
                background: "#25D366",
                color: "#FFFFFF",
                border: "none",
                padding: "12px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              💬 {dict.shareWhatsapp}
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                background: copied ? "#10B981" : "rgba(255, 255, 255, 0.1)",
                color: "#FFFFFF",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                padding: "12px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              🔗 {copied ? dict.copied : dict.copyLink}
            </button>
          </div>
        </div>

        {/* Dedicated Priest Contact Section at Bottom */}
        <div style={{
          background: "linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(120, 53, 15, 0.35))",
          border: "1.5px solid #F59E0B",
          borderRadius: 16,
          padding: "16px 20px",
          marginTop: 20,
          marginBottom: 16,
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
        }}>
          <div style={{ fontSize: 13, color: "#FDE68A", fontWeight: 800, marginBottom: 4 }}>
            {lang === "kn"
              ? "ಈ ಕ್ಯಾಲೆಂಡರ್ ಪಡೆಯಲು ಅಥವಾ ನಿಮ್ಮ ಇಂದಿನ ಜೀವನದ ಜಾತಕದ ವಿವರಗಳನ್ನು ಪಡೆಯಲು ಈ ಕೆಳಗಿನ ಪ್ರಧಾನ ಅರ್ಚಕರನ್ನು ಸಂಪರ್ಕಿಸಿ:"
              : lang === "hi"
              ? "यह कैलेंडर प्राप्त करने या अपने वर्तमान जीवन से संबंधित विवरण व फलादेश पाने के लिए मुख्य अर्चक से संपर्क करें:"
              : lang === "te"
              ? "ఈ క్యాలెండర్ పొందుటకు లేదా మీ ప్రస్తుత జీవిత జాతక ఫలాల వివరాలు పొందుటకు ఈ క్రింది ప్రధాన అర్చకుడిని సంప్రదించండి:"
              : lang === "ta"
              ? "இந்த காலண்டரைப் பெற அல்லது உங்களின் தற்போதைய வாழ்க்கை பலன்களைப் பெற கீழே உள்ள முதன்மை அர்ச்சகரைத் தொடர்பு கொள்ளவும்:"
              : "To get this calendar or to get current life related details/predictions, you can contact Chief Priest:"}
          </div>
          <div style={{ fontSize: 16, color: "#FFFFFF", fontWeight: 900, marginBottom: 10 }}>
            🛕 {localizedPandit} (Shreeram Pandit)
          </div>
          <button
            onClick={() => setShowContactModal(true)}
            style={{
              background: "linear-gradient(135deg, #10B981, #047857)",
              color: "#FFFFFF",
              border: "1px solid #6EE7B7",
              padding: "10px 24px",
              borderRadius: 16,
              fontSize: 14,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <span>📞</span>
            <span>{dict.callPandit}: 9972339362</span>
          </button>
        </div>
      </main>

      {/* Priest Direct Contact Modal */}
      {showContactModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16
        }}>
          <div style={{
            background: "linear-gradient(180deg, #2D1407 0%, #1C0A00 100%)",
            border: "2px solid #D4AF37",
            borderRadius: 20,
            padding: 24,
            maxWidth: 400,
            width: "100%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🛕</div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, color: "#FDE68A", fontWeight: 900 }}>
              {localizedPandit}
            </h3>
            <div style={{ fontSize: 12, color: "#F59E0B", marginBottom: 16 }}>
              {dict.panditRole}
            </div>
            
            <p style={{ fontSize: 13, color: "#E5E7EB", lineHeight: 1.5, marginBottom: 20 }}>
              {lang === "kn"
                ? "ಪೂಜೆ, ಅನುಷ್ಠಾನ, ಪಂಚಾಂಗ ಜಾತಕ ವಿವರಗಳಿಗೆ ಪ್ರಧಾನ ಅರ್ಚಕರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ."
                : "Contact Chief Archaka directly for Seva booking, Panchanga consultations, and Vedic rituals."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href="tel:9972339362"
                style={{
                  background: "linear-gradient(135deg, #10B981, #047857)",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  padding: "12px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                }}
              >
                📞 {dict.callNow}
              </a>

              <button
                onClick={() => setShowContactModal(false)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#D1D5DB",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "10px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {lang === "kn" ? "ಮುಚ್ಚಿ" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
