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
import { getUniversalBirthDetails } from "../utils/universalDevoteeKundli";
import type { RhythmDay } from "../core/DailyRhythmEngine";
import type { DetailedTithiInfo } from "../core/VedicCalculations";
import { nakshatraName, rashiName, tithiLabel, pakshaLabel, tithiOnlyLabel, getDailyActionableGuidance, formatLongDate, getLocalizedPanditName } from "../features/seva/sevaPresentation";
import { RASHI_L5, NAKSHATRA_L5, GRAHA_L5, LANGUAGE_OWN_NAME, pick, type SevaLang } from "../features/seva/sevaLocale";
import { calculateKundli } from "../core/KundliEngine";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";
import { signLord } from "../core/KundliInsightsEngine";
import { normalizeDegree } from "../core/AstroMath";
import { PlanetName, type KundliOutput, type PlanetPosition } from "../core/AstroTypes";
import { transliterateName } from "../utils/transliterator";
import {
  recordCalendarVisit,
  getPoojaStreak,
  fetchPoojaStreakFromCloud,
  checkPassExpiration,
  type PoojaStreakInfo
} from "../features/seva/calendarVisitService";
import {
  checkAndRegisterDevoteeUser,
  hasDevoteeContactDetails,
  getDevoteeUserId,
  type DevoteeUserRecord
} from "../features/seva/devoteeUserService";
import { DevoteeContactCaptureModal } from "../components/darshana/DevoteeContactCaptureModal";
import { DailyPoojaSankalpaModal } from "../components/darshana/DailyPoojaSankalpaModal";
import { ManageSankalpaModal } from "../components/darshana/ManageSankalpaModal";
import { DevoteeStreakBadge } from "../components/darshana/DevoteeStreakBadge";
import { PostPoojaRemedyJapaCard } from "../components/darshana/PostPoojaRemedyJapaCard";
import { PersonalGoldenHourWidget } from "../components/darshana/PersonalGoldenHourWidget";
import { DailyLuckyGemWidget } from "../components/darshana/DailyLuckyGemWidget";
import { DailyKarmaNavigator } from "../components/darshana/DailyKarmaNavigator";
import { DailyBlessingShareCard } from "../components/darshana/DailyBlessingShareCard";
import { buildCleanDailyWhatsAppShareText } from "../features/darshana/dailyInspirationAlmanac";
import { SanctumPrayerBox } from "../components/darshana/SanctumPrayerBox";
import { playTempleBellChime } from "../features/seva/priestAudioNarrator";
import { synthesizeAndPlayClonedVoice, stopClonedAudio } from "../features/audio/aiVoiceCloneEngine";
import { stopAllAudioGlobal, onGlobalAudioStop } from "../features/audio/globalAudioManager";

// Comprehensive 5-Language Dictionary for DailyDarshanaPage
const DARSHANA_LABELS: Record<SevaLang, Record<string, string>> = {
  kn: {
    tabSanctum: "ದರ್ಶನ & ಪೂಜೆ",
    tabGuidance: "ಮುಹೂರ್ತ & ಶಕ್ತಿ",
    tabKundali: "ಜನ್ಮ ಕುಂಡಲಿ",
    tabGochara: "ಗೋಚಾರ ಕುಂಡಲಿ",
    tabDasha: "ದಶಾ-ಭುಕ್ತಿ",
    tabBhavishya: "ದಿನ ಭವಿಷ್ಯ",
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
    tabSanctum: "Sanctum & Pooja",
    tabGuidance: "Golden Hour & Power",
    tabKundali: "Janma Kundali",
    tabGochara: "Gochara Chart",
    tabDasha: "Dasha-Bhukti",
    tabBhavishya: "Daily Horoscope",
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
    tabSanctum: "दर्शन एवं पूजा",
    tabGuidance: "मुहूर्त एवं शक्ति",
    tabKundali: "जन्म कुंडली",
    tabGochara: "गोचर कुंडली",
    tabDasha: "दशा-भुक्ति",
    tabBhavishya: "दैनिक राशिफल",
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
    tabSanctum: "దర్శనం & పూజ",
    tabGuidance: "ముహూర్తం & శక్తి",
    tabKundali: "జన్మ కుండలి",
    tabGochara: "గోచార కుండలి",
    tabDasha: "దశా-భుక్తి",
    tabBhavishya: "దిన భవిష్యత్తు",
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
    tabSanctum: "தரிசனம் & பூஜை",
    tabGuidance: "முகூர்த்தம் & சக்தி",
    tabKundali: "ஜன்ம ஜாதகம்",
    tabGochara: "கோச்சார கட்டம்",
    tabDasha: "தசா-புக்தி",
    tabBhavishya: "தினம் பலன்",
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
  devoteeName?: string;
}

const SouthIndianKundaliGrid: React.FC<RashiGridProps> = ({
  lang,
  highlightRashiIndex = 3,
  lagnaRashiIndex = 4,
  planetPlacements = {},
  title,
  isGochara = false,
  devoteeName
}) => {
  const gridCells: { moonRashiIdx: number; row: number; col: number }[] = [
    { moonRashiIdx: 11, row: 0, col: 0 },
    { moonRashiIdx: 0,  row: 0, col: 1 },
    { moonRashiIdx: 1,  row: 0, col: 2 },
    { moonRashiIdx: 2,  row: 0, col: 3 },
    { moonRashiIdx: 10, row: 1, col: 0 },
    { moonRashiIdx: 3,  row: 1, col: 3 },
    { moonRashiIdx: 9,  row: 2, col: 0 },
    { moonRashiIdx: 4,  row: 2, col: 3 },
    { moonRashiIdx: 8,  row: 3, col: 0 },
    { moonRashiIdx: 7,  row: 3, col: 1 },
    { moonRashiIdx: 6,  row: 3, col: 2 },
    { moonRashiIdx: 5,  row: 3, col: 3 }
  ];

  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(45, 20, 7, 0.95) 0%, rgba(26, 10, 3, 0.98) 100%)",
      border: "2px solid #D4AF37",
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      width: "100%",
      boxSizing: "border-box",
      boxShadow: "0 8px 28px rgba(0,0,0,0.6)"
    }}>
      <div style={{
        fontSize: 15,
        fontWeight: 800,
        color: "#FDE68A",
        marginBottom: 12,
        textAlign: "center",
        borderBottom: "1.5px solid rgba(212, 175, 55, 0.35)",
        paddingBottom: 8,
        letterSpacing: "0.2px"
      }}>
        {title}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(4, minmax(84px, 1fr))",
        gap: 5,
        background: "#1C0A00",
        padding: 6,
        borderRadius: 12,
        border: "1.5px solid #78350F",
        width: "100%",
        boxSizing: "border-box",
        position: "relative"
      }}>
        {/* Center Title Box */}
        <div style={{
          gridColumn: "2 / 4",
          gridRow: "2 / 4",
          background: "linear-gradient(135deg, rgba(120, 53, 15, 0.45) 0%, rgba(45, 20, 7, 0.8) 100%)",
          border: "1.5px dashed rgba(212, 175, 55, 0.6)",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 8,
          textAlign: "center",
          boxShadow: "inset 0 0 12px rgba(0,0,0,0.5)"
        }}>
          <div style={{ fontSize: 20 }}>🛕</div>
          <div style={{ fontSize: 11.5, fontWeight: 900, color: "#FDE68A", marginTop: 3 }}>
            {isGochara ? (lang === "kn" ? "ಗೋಚಾರ ಬಿಂಬ (ಚಂದ್ರ ಲಗ್ನ)" : "Gochara Transit (Chandra Lagna)") : "ಜನ್ಮ ಚಕ್ರ"}
          </div>
          {devoteeName && (
            <div style={{ fontSize: 12.5, fontWeight: 900, color: "#FFFFFF", marginTop: 2, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              {devoteeName}
            </div>
          )}
          <div style={{ fontSize: 9.5, color: "#F59E0B", marginTop: 2, fontWeight: 700 }}>
            {isGochara ? (lang === "kn" ? "ಗೋಕರ್ಣ ಪಂಚಾಂಗ" : "Gokarna Panchanga") : "South Indian Grid"}
          </div>
        </div>

        {/* 12 Rashi Outer House Cells */}
        {gridCells.map(({ moonRashiIdx, row, col }) => {
          const isMoonRashi = moonRashiIdx === highlightRashiIndex;
          const isLagna = moonRashiIdx === lagnaRashiIndex;
          const rashiObj = RASHI_L5[moonRashiIdx] || RASHI_L5[0];
          const planets = planetPlacements[moonRashiIdx] || [];

          return (
            <div
              key={moonRashiIdx}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
                background: isMoonRashi
                  ? "linear-gradient(135deg, rgba(217, 119, 6, 0.4), rgba(120, 53, 15, 0.55))"
                  : isLagna
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(6, 78, 59, 0.45))"
                  : "rgba(35, 15, 5, 0.9)",
                border: isMoonRashi
                  ? "1.5px solid #F59E0B"
                  : isLagna
                  ? "1.5px solid #10B981"
                  : "1px solid rgba(212, 175, 55, 0.25)",
                borderRadius: 7,
                padding: "5px 6px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
                boxShadow: isMoonRashi ? "0 0 10px rgba(245, 158, 11, 0.35)" : "none"
              }}
            >
              {/* Rashi Header & Lagna Indicator */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: isMoonRashi ? "#FEF3C7" : isLagna ? "#D1FAE5" : "#E5E7EB" }}>
                  {rashiObj[lang] || rashiObj.en}
                </span>
                {isLagna && (
                  <span style={{ fontSize: 8, fontWeight: 900, color: "#10B981", background: "rgba(16, 185, 129, 0.25)", padding: "0 3px", borderRadius: 3, border: "0.5px solid #10B981" }}>
                    {isGochara ? (lang === "kn" ? "ಚಂದ್ರ" : "Chandra") : "Lagna"}
                  </span>
                )}
                {isMoonRashi && !isLagna && (
                  <span style={{ fontSize: 9, fontWeight: 900, color: "#F59E0B" }}>
                    🌙
                  </span>
                )}
              </div>

              {/* Planet Badges inside House */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2.5,
                marginTop: 3,
                alignContent: "flex-end"
              }}>
                {planets.map((pl, pIdx) => (
                  <span
                    key={pIdx}
                    style={{
                      background: "rgba(245, 158, 11, 0.28)",
                      border: "1px solid rgba(245, 158, 11, 0.55)",
                      color: "#FFF8E7",
                      fontSize: 8.5,
                      fontWeight: 800,
                      padding: "1px 3.5px",
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
    guruDesc = `ಗುರುವು ${guruRashiName} ರಾಶಿಯಲ್ಲಿ ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ ${guruHouse}ನೇ ಭಾವದಲ್ಲಿದ್ದಾನೆ.\n【ನಿರೀಕ್ಷಿಸಬಹುದಾದ ಫಲ】 ${
      guruAuspicious
        ? "ಅತ್ಯಂತ ಶುಭ ಫಲದಾಯಕ ಸ್ಥಾನ! ಧನ ಲಾಭವೃದ್ಧಿ, ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ, ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಯಶಸ್ಸು ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಆಯೋಜನೆ ನಡೆಯಲಿದೆ."
        : "ಈ ಸಮಯದಲ್ಲಿ ತಾಳ್ಮೆ ಹಾಗೂ ವಿವೇಚನೆಯಿಂದ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳುವುದು ಸೂಕ್ತ. ಆತುರದ ಹೂಡಿಕೆಗಳನ್ನು ತಡೆದು ಕಾಯಕ ನಿಷ್ಠೆ ವಹಿಸಬೇಕು."
    }\n【ಪರಿಹಾರ/ಆರಾಧನೆ】 ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಅಥವಾ ಶ್ರೀ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆ ಹಾಗೂ ಹಳದಿ ಹೂವುಗಳಿಂದ ದೇವತಾರಾಧನೆ ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ.`;
  } else if (code === "hi") {
    guruDesc = `गुरु ${guruRashiName} राशि में आपकी राशि से ${guruHouse}वें भाव में हैं।\n【अपेक्षित प्रभाव】 ${
      guruAuspicious
        ? "अत्यंत शुभ गोचर! कार्यक्षेत्र में उन्नति, धन लाभ, ज्ञान वृद्धि और परिवार में मांगलिक कार्य संपन्न होंगे।"
        : "धैर्य और विवेक से कार्य करें। अनावश्यक व्यय और जल्दबाजी के निर्णयों से बचें।"
    }\n【उपाय/पूजा】 श्री गुरु राघवेंद्र स्वामी एवं भगवान दक्षिणामूर्ति की पूजा और पीले पुष्पों का अर्पण अति कल्याणकारी है।`;
  } else if (code === "te") {
    guruDesc = `గురు గ్రహం ${guruRashiName} రాశిలో మీ రాశి నుండి ${guruHouse}వ స్థానంలో ఉన్నారు.\n【ఆశించే ఫలితాలు】 ${
      guruAuspicious
        ? "అత్యంత శుభప్రదమైన సమయం! ధన లాభాలు, ఉద్యోగంలో పదోన్నతి, విద్యలో యశస్సు మరియు కుటుంబంలో శుభ కార్యాలు."
        : "సహనంతో నిర్ణయాలు తీసుకోండి. తొందరపాటు పెట్టుబడులు నివారించండి."
    }\n【పరిహారము/పూజ】 శ్రీ గురు రాఘవేంద్ర స్వామి లేదా శ్రీ దక్షిణామూర్తి ఆరాధన శ్రేయస్కరం.`;
  } else if (code === "ta") {
    guruDesc = `குரு பகவான் ${guruRashiName} ராசியில் உங்கள் ராசிக்கு ${guruHouse}ஆம் இடத்தில் உள்ளார்.\n【எதிர்பார்க்கும் பலன்கள்】 ${
      guruAuspicious
        ? "மிகச் சிறந்த சுப கோச்சாரம்! தன லாபம், தொழில் வளர்ச்சி, கல்வி மேம்பாடு மற்றும் குடும்பத்தில் சுப நிகழ்ச்சிகள்."
        : "அமைதியாகவும் நிதானமாகவும் செயல்படவும்."
    }\n【பரிகாரம்/வழிபாடு】 ஸ்ரீ குரு ராகவேந்திரர் மற்றும் தட்சிணாமூர்த்தி வழிபாடு சிறந்தது.`;
  } else {
    guruDesc = `Jupiter transits in ${guruRashiName} in the ${guruHouse}th house from your Moon sign.\n【What to Expect】 ${
      guruAuspicious
        ? "Highly favorable transit! Brings financial progress, career elevation, academic excellence, and domestic harmony."
        : "Requires patient execution and avoiding impulsive investments. Maintain steady work discipline."
    }\n【Remedy & Prayer】 Devotion to Sri Guru Raghavendra Swamy & Lord Dakshinamurthy with yellow flower offerings brings immense blessings.`;
  }

  // Shani (Saturn) Phala
  const isSadeSati = [12, 1, 2].includes(shaniHouse);
  const isKantaka = [4, 8].includes(shaniHouse);
  const shaniAuspicious = [3, 6, 11].includes(shaniHouse);
  let shaniDesc = "";
  if (code === "kn") {
    shaniDesc = `ಶನಿಯು ${shaniRashiName} ರಾಶಿಯಲ್ಲಿ ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ ${shaniHouse}ನೇ ಭಾವದಲ್ಲಿದ್ದಾನೆ.\n【ನಿರೀಕ್ಷಿಸಬಹುದಾದ ಫಲ】 ${
      isSadeSati
        ? "ಸಾಡೇಸಾತಿ (ಏಳೂವರೆ ಶನಿ) ಪ್ರಭಾವ. ಪರಿಶ್ರಮ, ಧರ್ಮನಿಷ್ಠೆ ಹಾಗೂ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆಯಿಂದ ಅಪಾರ ಯಶಸ್ಸು ಮತ್ತು ಸನ್ಮಾನ ಲಭಿಸಲಿದೆ."
        : isKantaka
        ? "ಅರ್ಧಾಷ್ಟಮ / ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವ. ಪ್ರಯಾಣ ಹಾಗೂ ಆರೋಗ್ಯದಲ್ಲಿ ಜಾಗ್ರತೆ ಅಗತ್ಯ, ನಕಾರಾತ್ಮಕ ಚಿಂತನೆಗಳಿಂದ ದೂರವಿರಿ."
        : shaniAuspicious
        ? "ಅತ್ಯುತ್ತಮ ಶುಭ ಶನಿ ಸಂಚಾರ! ಶತ್ರು ಜಯ, ಕಾರ್ಯ ಸಿದ್ಧಿ, ಆಸ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ಸುಸ್ಥಿರ ಆರ್ಥಿಕ ಪ್ರಗತಿ ಲಭಿಸಲಿದೆ."
        : "ನಿರಂತರ ಪರಿಶ್ರಮ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ ಕಾರ್ಯಕ್ಕೆ ತಕ್ಕ ಯಶಸ್ಸು ನಿಶ್ಚಿತ."
    }\n【ಪರಿಹಾರ/ಆರಾಧನೆ】 ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ, ಶನಿ ದೇವಾಲಯದಲ್ಲಿ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗುವುದು ಹಾಗೂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದರ್ಶನ ಪಡೆಯುವುದು ಸೂಕ್ತ.`;
  } else if (code === "hi") {
    shaniDesc = `शनि देव ${shaniRashiName} राशि में आपकी राशि से ${shaniHouse}वें भाव में हैं।\n【अपेक्षित प्रभाव】 ${
      isSadeSati
        ? "साढ़ेसाती का प्रभाव। कड़ी मेहनत, सत्यनिष्ठा और धैर्य से बड़ी सफलता मिलेगी।"
        : isKantaka
        ? "ढैय्या/अष्टम शनि का प्रभाव। स्वास्थ्य और यात्रा में सावधानी बरतें।"
        : shaniAuspicious
        ? "अत्यंत शुभ गोचर! शत्रु विजय, संपत्ति वृद्धि और कार्य सिद्धि।"
        : "मेहनत का पूर्ण फल मिलेगा।"
    }\n【उपाय/पूजा】 शनिवार को हनुमान चालीसा का पाठ करें और तिल के तेल का दीपक जलाएं।`;
  } else if (code === "te") {
    shaniDesc = `శని భగవానుడు ${shaniRashiName} రాశిలో మీ రాశి నుండి ${shaniHouse}వ భావంలో ఉన్నారు.\n【ఆశించే ఫలితాలు】 ${
      isSadeSati
        ? "సాడేసాతీ ప్రభావం. క్రమశిక్షణ, శ్రమ మరియు సత్యంతో గొప్ప విజయం లభిస్తుంది."
        : isKantaka
        ? "అష్టమ శని ప్రభావం. ఆరోగ్యం మరియు ప్రయాణాలలో జాగ్రత్త వహించండి."
        : shaniAuspicious
        ? "అత్యంత అనుకూల సంచారం! కార్య సిద్ధి మరియు స్థిరాస్తి అభివృద్ధి."
        : "శ్రమకు తగిన ప్రతిఫలం నిశ్చయం."
    }\n【పరిహారము/పూజ】 హనుమాన్ చాలీసా పారాయణ మరియు నువ్వుల నూనె దీపారాధన శ్రేయస్కరం.`;
  } else if (code === "ta") {
    shaniDesc = `சனீஸ்வர பகவான் ${shaniRashiName} ராசியில் உங்கள் ராசிக்கு ${shaniHouse}ஆம் இடத்தில் உள்ளார்.\n【எதிர்பார்க்கும் பலன்கள்】 ${
      isSadeSati
        ? "ஏழரை சனி காலம். கடின உழைப்பும் நேர்மையும் பெரு வெற்றி தரும்."
        : isKantaka
        ? "அஷ்டம சனி காலம். உடல் ஆரோக்கியத்திலும் பயணத்திலும் கவனம் தேவை."
        : shaniAuspicious
        ? "சுப கோச்சாரம்! தொழில் வளர்ச்சி மற்றும் சுப பலன்கள்."
        : "உழைப்புக்கேற்ற பலன் கிடைக்கும்."
    }\n【பரிகாரம்/வழிபாடு】 அனுமன் சாலீசா பாராயணம் மற்றும் நல்லெண்ணெய் தீபம் ஏற்றவும்.`;
  } else {
    shaniDesc = `Saturn transits in ${shaniRashiName} in the ${shaniHouse}th house from your Moon sign.\n【What to Expect】 ${
      isSadeSati
        ? "Sade Sati phase active. Honesty, discipline, and hard work lead to major long-term triumphs."
        : isKantaka
        ? "Ashtama/Kantaka Shani phase. Exercise care in travel & health; maintain emotional calmness."
        : shaniAuspicious
        ? "Highly auspicious transit! Overcoming competitors, career advancement, and wealth accumulation."
        : "Steady phase rewarding honest effort."
    }\n【Remedy & Prayer】 Chanting Sri Hanuman Chalisa & lighting a Sesame oil lamp on Saturdays bring victory.`;
  }

  // Rahu-Ketu Axis
  let rahuKetuDesc = "";
  if (code === "kn") {
    rahuKetuDesc = `ರಾಹುವು ${rahuRashiName} (${rahuHouse}ನೇ ಭಾವ) ಹಾಗೂ ಕೇತುವು ${ketuRashiName} (${ketuHouse}ನೇ ಭಾವ) ಸಂಚಾರದಲ್ಲಿದ್ದಾರೆ.\n【ನಿರೀಕ್ಷಿಸಬಹುದಾದ ಫಲ】 ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದ ನೂತನ ಸೃಜನಾತ್ಮಕ ಆಲೋಚನೆಗಳು, ವಿದೇಶಿ/ದೂರದ ಸಂಪರ್ಕ ಹಾಗೂ ಬೌದ್ಧಿಕ ಪ್ರಗತಿ ಉಂಟಾಗಲಿದೆ. ಕೇತುವಿನ ಪ್ರಭಾವದಿಂದ ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ, ಅನಿರೀಕ್ಷಿತ ಧನಲಾಭ ಹಾಗೂ ಅಂತರ್ಜ್ಞಾನ ವೃದ್ಧಿಯಾಗಲಿದೆ.\n【ಪರಿಹಾರ/ಆರಾಧನೆ】 ಶ್ರೀ ದುರ್ಗಾದೇವಿ ಆರಾಧನೆ, ಶ್ರೀ ಮಹಾಗಣಪತಿ ಹೋಮ/ಪೂಜೆ ಹಾಗೂ ರಾಹು-ಕೇತು ಕವಚ ಪಠಣದಿಂದ ಪೂರ್ಣ ಅಭಯ ಮತ್ತು ಕೌಶಲ್ಯ ವೃದ್ಧಿಯಾಗಲಿದೆ.`;
  } else if (code === "hi") {
    rahuKetuDesc = `राहु ${rahuRashiName} (${rahuHouse}वें भाव) और केतु ${ketuRashiName} (${ketuHouse}वें भाव) में हैं।\n【अपेक्षित प्रभाव】 राहु के प्रभाव से नए विचार, दूरगामी योजनाएं और बौद्धिक विकास होगा। केतु के प्रभाव से आध्यात्मिक उन्नति और आकस्मिक लाभ मिलेगा।\n【उपाय/पूजा】 मां दुर्गा और श्री गणेश जी की नियमित पूजा से मानसिक शांति और सुरक्षा मिलेगी।`;
  } else if (code === "te") {
    rahuKetuDesc = `రాహువు ${rahuRashiName} (${rahuHouse}వ ఇల్లు), కేతువు ${ketuRashiName} (${ketuHouse}వ ఇల్లు) సంచారంలో ఉన్నారు.\n【ఆశించే ఫలితాలు】 రాహువు వల్ల నూతన ఆలోచనలు, మేధో సంపత్తి వృద్ధి చెందుతాయి. కేతువు వల్ల ఆధ్యాత్మిక చింతన, ఆకస్మిక ధన లాభాలు లభిస్తాయి.\n【పరిహారము/పూజ】 శ్రీ దుర్గాదేవి, శ్రీ మహాగణపతి ఆరాధన శ్రేయస్కరం.`;
  } else if (code === "ta") {
    rahuKetuDesc = `ரஹு ${rahuRashiName} (${rahuHouse}ஆம் இடம்), கேது ${ketuRashiName} (${ketuHouse}ஆம் இடம்) கோச்சாரத்தில் உள்ளனர்.\n【எதிர்பார்க்கும் பலன்கள்】 ராகுவால் புதிய சிந்தனைகளும், கேதுவால் ஆன்மீக வளர்ச்சியும் திடீர் தன லாபமும் உண்டாகும்.\n【பரிகாரம்/வழிபாடு】 ஸ்ரீ துர்க்கை அம்மன் & கணபதி வழிபாடு மன நிம்மதியையும் பாதுகாப்பையும் தரும்.`;
  } else {
    rahuKetuDesc = `Rahu transits in ${rahuRashiName} (${rahuHouse}th house) & Ketu in ${ketuRashiName} (${ketuHouse}th house).\n【What to Expect】 Rahu stimulates creative ambition, strategic vision, and networking. Ketu enhances spiritual intuition, detachment from worry, and sudden unexpected gains.\n【Remedy & Prayer】 Regular prayers to Goddess Durga and Lord Ganesha provide spiritual protection, mental clarity, and success.`;
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

// 100% Dynamic 5-Language Dasha-Bhukti Predictions Generator using Vimshottari Engine
function getDynamicDashaPredictions(
  birthKundli: KundliOutput,
  targetDateStr: string,
  lang: SevaLang,
  birthDateStr: string
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
  const birthDate = new Date(birthDateStr || "1993-03-16");

  const ageYears = isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())
    ? 31
    : Math.max(0, (targetDate.getTime() - birthDate.getTime()) / (365.2425 * 86400 * 1000));

  const bhuktiInfo = findBhuktiAtAge(birthKundli, ageYears);

  const mahaPlanet = bhuktiInfo?.maha.planet || "Jupiter";
  const bhuktiPlanet = bhuktiInfo?.bhukti || "Venus";

  const mahaName = GRAHA_L5[mahaPlanet as keyof typeof GRAHA_L5]?.[code] || mahaPlanet;
  const bhuktiName = GRAHA_L5[bhuktiPlanet as keyof typeof GRAHA_L5]?.[code] || bhuktiPlanet;

  const startDateObj = isNaN(birthDate.getTime()) || !bhuktiInfo
    ? new Date()
    : new Date(birthDate.getTime() + bhuktiInfo.bhuktiStartAge * 365.2425 * 86400 * 1000);
  const endDateObj = isNaN(birthDate.getTime()) || !bhuktiInfo
    ? new Date()
    : new Date(birthDate.getTime() + bhuktiInfo.bhuktiEndAge * 365.2425 * 86400 * 1000);

  const startDateStr = startDateObj.toISOString().slice(0, 10);
  const endDateStr = endDateObj.toISOString().slice(0, 10);

  const activePhase = `${mahaName} ${code === "kn" ? "ಮಹಾದಶಾ" : code === "hi" ? "महादशा" : code === "te" ? "మహాదశ" : code === "ta" ? "மகாதிசை" : "Mahadasha"} · ${bhuktiName} ${code === "kn" ? "ಅಂತರ್ದಶಾ" : code === "hi" ? "अंतर्दशा" : code === "te" ? "అంతర్దశ" : code === "ta" ? "புக்தி" : "Antardasha"}`;

  const dashaPeriod = code === "kn" ? `ಪ್ರಾರಂಭ ದಿನಾಂಕ: ${startDateStr} | ಮುಕ್ತಾಯ ದಿನಾಂಕ: ${endDateStr}` :
                      code === "hi" ? `प्रारंभ तिथि: ${startDateStr} | समाप्ति तिथि: ${endDateStr}` :
                      code === "te" ? `ప్రారంభ తేది: ${startDateStr} | ముగింపు తేది: ${endDateStr}` :
                      code === "ta" ? `தொடக்கம்: ${startDateStr} | முடிவு: ${endDateStr}` :
                      `Start Date: ${startDateStr} | End Date: ${endDateStr}`;

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

export interface TodayBhavishyaHighlightPoint {
  icon: string;
  category: string;
  prediction: string;
  advice: string;
}

export interface TodayBhavishyaData {
  title: string;
  subtitle: string;
  overallVibe: string;
  energyScore: number;
  points: TodayBhavishyaHighlightPoint[];
}

function getTodayBhavishyaHighlights(
  birthKundli: KundliOutput,
  targetDateStr: string,
  lang: SevaLang,
  rhythmDay: RhythmDay,
  dashaPredictions: ReturnType<typeof getDynamicDashaPredictions>
): TodayBhavishyaData {
  const code = lang || "en";
  const score = rhythmDay?.energyScore ?? 85;
  const guidance = getDailyActionableGuidance(rhythmDay, lang);

  const vehiclePoint = guidance.find(p => p.icon === "🚗") || {
    category: code === "kn" ? "ವಾಹನ, ಆಸ್ತಿ & ಪ್ರಯಾಣ" : code === "hi" ? "वाहन, संपत्ति व यात्रा" : code === "te" ? "వాహన & ఆస్తి మార్గదర్శకత్వం" : code === "ta" ? "வாகனம், சொத்து & பயணம்" : "Vehicle, Asset & Travel",
    text: "Favorable day for planned travels."
  };
  const careerPoint = guidance.find(p => p.icon === "💰") || {
    category: code === "kn" ? "ವೃತ್ತಿ & ಧನ ಲಾಭ" : code === "hi" ? "धन वृद्धि एवं करियर" : code === "te" ? "ధన లాభం & ఉద్యోగం" : code === "ta" ? "தன லாபம் & தொழில்" : "Financial Growth & Career",
    text: "Steady financial growth."
  };
  const mindPoint = guidance.find(p => p.icon === "🧠") || {
    category: code === "kn" ? "ಮನಃಸ್ಥಿತಿ & ಕುಟುಂಬ" : code === "hi" ? "मनोस्थिति व पारिवारिक सौहार्द" : code === "te" ? "మానసిక ప్రశాంతత & కుటుంబం" : code === "ta" ? "மன நிலை & குடும்ப அமைதி" : "Mindset & Family",
    text: "Peaceful domestic environment."
  };
  const spiritualPoint = guidance.find(p => p.icon === "🪔") || {
    category: code === "kn" ? "ದೈವಿಕ ಕೃಪೆ & ಉಪಾಸನೆ" : code === "hi" ? "दैवीय संकल्प एवं पूजा" : code === "te" ? "దైవిక సంకల్పం & పూజ" : code === "ta" ? "தெய்வீக சங்கல்பம் & பூஜை" : "Spiritual Grace & Remedy",
    text: "Deity prayers bring blessings."
  };

  return {
    title: code === "kn" ? "🔮 ಇಂದಿನ ದಿನ ಭವಿಷ್ಯ" : code === "hi" ? "🔮 आज का मुख्य राशिफल मार्गदर्शन" : code === "te" ? "🔮 నేటి ముఖ్య రోజు జాతక మార్గదర్శకత్వం" : code === "ta" ? "🔮 இன்றைய முக்கிய தின பலன்கள்" : "🔮 Today's Personalized Bhavishya Highlights",
    subtitle: code === "kn" ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ದಶಾ-ಭುಕ್ತಿ ಹಾಗೂ ಗೋಚಾರ ಆಧಾರಿತ 4 ಪ್ರಮುಖ ಮಾರ್ಗದರ್ಶನಗಳು" :
              code === "hi" ? "आपकी जन्म कुंडली, दशा-भुक्ति एवं गोचर आधारित 4 मुख्य मार्गदर्शन" :
              code === "te" ? "మీ జన్మ జాతకం, దశా-భుక్తి & గోచార ఆధారిత 4 ముఖ్య మార్గదర్శకాలు" :
              code === "ta" ? "உங்கள் ஜாதகம், திசை-புக்தி மற்றும் கோச்சார அடிப்படையிலான 4 முக்கிய வழிகாட்டுதல்கள்" :
              "4 Key Actionable Focus Points based on Birth Kundli, Dasha & Gochara",
    overallVibe: rhythmDay?.band === "high" ? "🟢 Auspicious" : rhythmDay?.band === "rest" ? "🔴 Rest Day" : "🟡 Steady Day",
    energyScore: score,
    points: [
      {
        icon: "🚗",
        category: vehiclePoint.category,
        prediction: vehiclePoint.text,
        advice: score >= 75 ? (code === "kn" ? "ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ನೂತನ ಕಾರ್ಯಾರಂಭ ಮಾಡಿ." : "Proceed during auspicious Muhurtha.") : (code === "kn" ? "ಸಾಮಾನ್ಯ ಪ್ರಯಾಣಗಳಿಗೆ ಮಾತ್ರ ಆದ್ಯತೆ ನೀಡಿ." : "Focus on essential routine travels.")
      },
      {
        icon: "💼",
        category: careerPoint.category,
        prediction: `${dashaPredictions.activePhase} - ${careerPoint.text}`,
        advice: dashaPredictions.wealthDesc || (code === "kn" ? "ವೃತ್ತಿಪರ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಸ್ಥಿರತೆ ಕಾಯ್ದುಕೊಳ್ಳಿ." : "Maintain professional focus.")
      },
      {
        icon: "🧠",
        category: mindPoint.category,
        prediction: mindPoint.text,
        advice: rhythmDay?.isChandrashtama ? (code === "kn" ? "ಧ್ಯಾನ, ಸಾತ್ವಿಕತೆ ಹಾಗೂ ದೈವ ಪ್ರಾರ್ಥನೆಯಿಂದ ಶಾಂತಿ ಕಂಡುಕೊಳ್ಳಿ." : "Maintain calm focus with prayer and meditation.") : (code === "kn" ? "ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಪಡೆದು ದಿನವನ್ನು ಶುಭವಾಗಿಸಿ." : "Seek elders blessings for a prosperous day.")
      },
      {
        icon: "🕉️",
        category: spiritualPoint.category,
        prediction: spiritualPoint.text,
        advice: code === "kn" ? "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಆತ್ಮಲಿಂಗ ಸ್ಮರಿಸಿ." : "Meditate upon the sacred Gokarna Atmalinga."
      }
    ]
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

  const isQrScanAutoDownload = useMemo(() => {
    const action = params.get("action");
    return action === "ics" || action === "ics90" || action === "download";
  }, [params]);

  const isFromCalendarRedirect = useMemo(() => {
    return (
      params.get("fromCal") === "1" ||
      params.get("fromCal") === "true" ||
      (!isQrScanAutoDownload && Boolean(tokenParam))
    );
  }, [params, tokenParam, isQrScanAutoDownload]);

  const [lang, setLang] = useState<SevaLang>(langParam);
  const dict = useMemo(() => DARSHANA_LABELS[lang] || DARSHANA_LABELS.en, [lang]);

  const initialTab = useMemo(() => {
    const rawTab = (params.get("tab") || (decoded as any)?.tab || "").toLowerCase();
    if (rawTab.includes("guid") || rawTab.includes("muhur") || rawTab.includes("gem") || rawTab.includes("karm") || rawTab.includes("gold")) return "guidance";
    if (rawTab.includes("bhav") || rawTab.includes("dina") || rawTab.includes("fore")) return "bhavishya";
    if (rawTab.includes("kund") || rawTab.includes("janma")) return "kundali";
    if (rawTab.includes("goch")) return "gochara";
    if (rawTab.includes("dash")) return "dasha";
    return "darshana";
  }, [decoded, params]);

  const [activeTab, setActiveTab] = useState<"darshana" | "guidance" | "bhavishya" | "kundali" | "gochara" | "dasha">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadedNotice, setDownloadedNotice] = useState(false);
  const [storedSession, setStoredSession] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isContactCaptureOpen, setIsContactCaptureOpen] = useState(false);
  const [devoteeUser, setDevoteeUser] = useState<DevoteeUserRecord | null>(null);
  const [isPoojaModalOpen, setIsPoojaModalOpen] = useState(false);
  const [isManageSankalpaOpen, setIsManageSankalpaOpen] = useState(false);

  const activeVoiceId = useMemo(() => {
    return (decoded as any)?.vid || (decoded as any)?.voiceId || params.get("vid") || params.get("voiceId") || "voice_shrisuma_master";
  }, [decoded, params]);

  const [poojaStreak, setPoojaStreak] = useState<PoojaStreakInfo>({
    currentStreak: 1,
    highestStreak: 1,
    lastSankalpaDate: "",
    isCompletedToday: false,
    totalSankalpas: 1
  });

  useEffect(() => {
    try {
      const streak = getPoojaStreak();
      setPoojaStreak(streak);
      const raw = localStorage.getItem("baggona_kundli_session");
      if (raw) {
        setStoredSession(JSON.parse(raw));
      }
    } catch {
      // Ignore
    }

    const unregisterAudioStop = onGlobalAudioStop(() => {
      setActiveVoiceKey("none");
      setActiveVoiceState("idle");
      setIsPlayingAudio(false);
    });

    return () => {
      unregisterAudioStop();
      stopAllAudioGlobal();
    };
  }, []);

  // Whenever user switches tab or selected date, stop any active audio immediately
  useEffect(() => {
    stopAllAudioGlobal();
  }, [activeTab, dateParam]);

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
  // Extract dynamic birth inputs for the specific user from URL params / decoded token payload / stored session
  const urlParams = useMemo(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  }, []);

  const localizedPandit = useMemo(() => getLocalizedPanditName(panditParam, lang), [panditParam, lang]);

  const activePanditPhone = useMemo(() => {
    if (decoded?.ocp && (decoded?.ph || decoded?.phone)) {
      return (decoded.ph || decoded.phone)!.trim();
    }
    if (urlParams.get("overrideContact") === "true" && urlParams.get("priestPhone")) {
      return urlParams.get("priestPhone")!.trim();
    }
    return "9972339362";
  }, [decoded, urlParams]);

  const activePanditName = useMemo(() => {
    if (decoded?.ocp && (decoded?.p || decoded?.pandit)) {
      return (decoded.p || decoded.pandit)!.trim();
    }
    if (urlParams.get("overrideContact") === "true" && urlParams.get("priestName")) {
      return urlParams.get("priestName")!.trim();
    }
    return localizedPandit;
  }, [decoded, urlParams, localizedPandit]);
  
  const devoteeDisplayName = useMemo(() => {
    let raw = "";
    if (nameParam && nameParam.trim().length > 0) raw = nameParam.trim();
    else if (decoded?.n && decoded.n.trim().length > 0) raw = decoded.n.trim();
    else if (storedSession?.name && storedSession.name.trim().length > 0) raw = storedSession.name.trim();
    else raw = lang === "kn" ? "ಭಕ್ತರು" : "Devotee";
    return transliterateName(raw, lang);
  }, [nameParam, decoded, storedSession, lang]);

  const devoteeGotra = useMemo(() => {
    return (decoded as any)?.g || (decoded as any)?.gotra || storedSession?.gotra || "ಕಾಶ್ಯಪ";
  }, [decoded, storedSession]);

  const resolvedBirth = useMemo(() => {
    const paramDob = urlParams.get("dob");
    const paramTob = urlParams.get("tob");
    const tokenDob = (decoded as any)?.dob ? String((decoded as any).dob) : null;
    const tokenTob = (decoded as any)?.tob ? String((decoded as any).tob) : null;
    const sessionDob = storedSession?.birthDate || null;
    const sessionTob = storedSession?.birthTime || null;
    const tokenNak = decoded?.nk ?? (decoded as any)?.nakshatra ?? storedSession?.nakshatraIndex ?? null;

    return getUniversalBirthDetails({
      dob: paramDob || tokenDob || sessionDob,
      tob: paramTob || tokenTob || sessionTob,
      name: devoteeDisplayName,
      nakshatraIndex: tokenNak
    });
  }, [urlParams, decoded, storedSession, devoteeDisplayName]);

  const birthDateStr = resolvedBirth.dob;
  const birthTimeStr = resolvedBirth.tob;

  const userLat = useMemo(() => {
    return decoded?.lt ?? decoded?.lat ?? storedSession?.latitude ?? 14.5479;
  }, [decoded, storedSession]);

  const userLng = useMemo(() => {
    return decoded?.lg ?? decoded?.lng ?? storedSession?.longitude ?? 74.3187;
  }, [decoded, storedSession]);

  const userPincode = useMemo(() => {
    return decoded?.pc || storedSession?.pincode || "581326";
  }, [decoded, storedSession]);

  const userLocationName = useMemo(() => {
    return (decoded as any)?.loc || (decoded as any)?.location || storedSession?.placeName || "Gokarna";
  }, [decoded, storedSession]);

  // 100% Dynamic Synchronous Birth Kundli calculation for the specific user's DOB, TOB, Lat, Lng
  const birthKundli = useMemo<KundliOutput>(() => {
    return calculateKundli({
      name: devoteeDisplayName,
      birthDate: birthDateStr,
      birthTime: birthTimeStr,
      latitude: userLat,
      longitude: userLng,
      pincode: userPincode
    });
  }, [devoteeDisplayName, birthDateStr, birthTimeStr, userLat, userLng, userPincode]);

  const moonPlanet = useMemo(() => {
    return birthKundli.planets.find((p) => p.name === "Moon") || birthKundli.planets[1];
  }, [birthKundli]);

  const moonRashiIdx = useMemo(() => {
    if (moonPlanet?.rashi?.index !== undefined && moonPlanet.rashi.index >= 0 && moonPlanet.rashi.index < 12) {
      return moonPlanet.rashi.index;
    }
    if (decoded?.r !== undefined && decoded?.r !== null && typeof decoded.r === "number" && decoded.r >= 0 && decoded.r < 12) {
      return decoded.r;
    }
    if (storedSession?.rashiIndex !== undefined && storedSession?.rashiIndex !== null) {
      return storedSession.rashiIndex;
    }
    return 8;
  }, [moonPlanet, decoded, storedSession]);

  const moonNakshatraIdx = useMemo(() => {
    if (moonPlanet?.nakshatra?.index !== undefined && moonPlanet.nakshatra.index >= 0 && moonPlanet.nakshatra.index < 27) {
      return moonPlanet.nakshatra.index;
    }
    if (decoded?.nk !== undefined && decoded?.nk !== null && typeof decoded.nk === "number" && decoded.nk >= 0 && decoded.nk < 27) {
      return decoded.nk;
    }
    if (storedSession?.nakshatraIndex !== undefined && storedSession?.nakshatraIndex !== null) {
      return storedSession.nakshatraIndex;
    }
    return 18;
  }, [moonPlanet, decoded, storedSession]);

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

  // Dynamic Today's Personalized Bhavishya Highlights (4 Key Actionable Focus Points)
  const todayBhavishya = useMemo(() => {
    return getTodayBhavishyaHighlights(birthKundli, dateParam, lang, mockDay, dashaPredictions);
  }, [birthKundli, dateParam, lang, mockDay, dashaPredictions]);

  const devoteeUserId = useMemo(() => {
    return getDevoteeUserId({
      name: devoteeDisplayName,
      dob: resolvedBirth.dob,
      tob: resolvedBirth.tob,
      token: tokenParam || undefined
    });
  }, [devoteeDisplayName, resolvedBirth, tokenParam]);

  // Check & Register Devotee in Firestore on page load / calendar redirect
  useEffect(() => {
    let cancelled = false;
    async function syncDevoteeProfile() {
      try {
        const userRec = await checkAndRegisterDevoteeUser({
          name: devoteeDisplayName,
          dob: resolvedBirth.dob,
          tob: resolvedBirth.tob,
          gotra: devoteeGotra,
          rashi: rashiName(moonRashiIdx, "en"),
          rashiIndex: moonRashiIdx,
          nakshatra: nakshatraName(moonNakshatraIdx, "en"),
          nakshatraIndex: moonNakshatraIdx,
          pincode: decoded?.pc || urlParams.get("pincode") || "",
          phone: decoded?.ph || decoded?.phone || urlParams.get("phone") || "",
          email: (decoded as any)?.email || urlParams.get("email") || "",
          token: tokenParam || undefined,
          source: isFromCalendarRedirect ? "calendar_redirect" : "direct_darshana"
        });

        if (cancelled) return;
        setDevoteeUser(userRec);

        // Fetch & synchronize cloud streak across devices
        const cloudStreak = await fetchPoojaStreakFromCloud(devoteeUserId);
        if (!cancelled && cloudStreak) {
          setPoojaStreak(cloudStreak);
        }

        // Check if Contact details (Phone or Email) are present in Firestore database or local storage
        const isLocallyCollected = typeof window !== "undefined" && (
          localStorage.getItem(`baggona_contact_collected_${devoteeUserId}`) === "true" ||
          localStorage.getItem("baggona_contact_collected_global") === "true"
        );
        const hasContact = hasDevoteeContactDetails(userRec) || isLocallyCollected;
        if (!hasContact) {
          // Show popup asking for Phone or Email only if never provided
          setIsContactCaptureOpen(true);
        } else {
          setIsContactCaptureOpen(false);
        }
      } catch (err) {
        console.warn("[DailyDarshanaPage] Devotee profile sync notice:", err);
      }
    }

    void syncDevoteeProfile();
    return () => {
      cancelled = true;
    };
  }, [devoteeUserId, devoteeDisplayName, devoteeGotra, moonRashiIdx, moonNakshatraIdx, resolvedBirth, tokenParam, decoded, urlParams, isFromCalendarRedirect]);

  // 90-Day / Custom Duration Pass Expiry Calculation
  const rawStartDate = decoded?.sd || decoded?.startDate || urlParams.get("startDate") || urlParams.get("sd") || "";
  const rawDuration = decoded?.dy || decoded?.days || Number(urlParams.get("days")) || 90;
  const passExpiration = useMemo(() => {
    return checkPassExpiration(rawStartDate, rawDuration);
  }, [rawStartDate, rawDuration]);

  // Track calendar visit for metrics and priest sync
  useEffect(() => {
    const todayYmd = new Date().toISOString().split("T")[0];
    const tokenIdentifier = tokenParam || (decoded as any)?.n || devoteeDisplayName;
    void recordCalendarVisit({
      devoteeName: devoteeDisplayName,
      tokenIdentifier,
      dateClicked: dateParam,
      actualDate: todayYmd,
      lang,
      tabVisited: activeTab,
      rashiIndex: moonRashiIdx,
      nakshatraIndex: moonNakshatraIdx,
      priestName: activePanditName,
      dob: resolvedBirth.dob,
      tob: resolvedBirth.tob,
      gotra: devoteeGotra,
      rashi: rashiName(moonRashiIdx, "en"),
      nakshatra: nakshatraName(moonNakshatraIdx, "en"),
      lagnaRashi: birthKundli?.lagnaRashi?.english || "Dhanu",
      sunSign: birthKundli?.sunSign?.english || "Mesha",
      placeName: decoded?.loc || urlParams.get("location") || "Gokarna",
      pincode: decoded?.pc || urlParams.get("pincode") || "581326",
      phone: devoteeUser?.phone || decoded?.ph || decoded?.phone || urlParams.get("phone") || "",
      email: devoteeUser?.email || (decoded as any)?.email || (decoded as any)?.em || urlParams.get("email") || "",
      durationDays: rawDuration,
      startDate: rawStartDate,
      source: isFromCalendarRedirect ? "calendar_redirect" : "direct_darshana"
    });
  }, [
    dateParam,
    activeTab,
    lang,
    devoteeDisplayName,
    tokenParam,
    moonRashiIdx,
    moonNakshatraIdx,
    activePanditName,
    resolvedBirth,
    devoteeGotra,
    birthKundli,
    decoded,
    urlParams,
    devoteeUser,
    rawDuration,
    rawStartDate,
    isFromCalendarRedirect
  ]);

  // Mobile local device caching for date-specific payload
  useEffect(() => {
    if (typeof window !== "undefined" && mockDay?.ymd) {
      const devoteeKey = devoteeDisplayName ? devoteeDisplayName.toLowerCase().replace(/[^a-z0-9]/g, "_") : "devotee_default";
      const cacheKey = `baggona_darshana_cache_${mockDay.ymd}_${devoteeKey}`;
      try {
        const payload = {
          dateStr: mockDay.ymd,
          devoteeName: devoteeDisplayName,
          gotra: devoteeGotra,
          rashiIndex: moonRashiIdx,
          nakshatraIndex: moonNakshatraIdx,
          energyScore: mockDay.energyScore,
          vibeTag: vibe.vibeTag,
          tithiStr: tithiLabel(mockDay, lang),
          nakshatraStr: nakshatraName(mockDay.moonNakshatraIndex, lang),
          cachedAt: new Date().toISOString()
        };
        localStorage.setItem(cacheKey, JSON.stringify(payload));
      } catch (err) {
        console.warn("[DailyDarshanaPage] Local caching notice:", err);
      }
    }
  }, [mockDay?.ymd, devoteeDisplayName, devoteeGotra, moonRashiIdx, moonNakshatraIdx, vibe, lang]);

  // Multi-harmonic Authentic Temple Bell Synthesis ("THAAANNN...")
  const playTempleBell = () => {
    try {
      stopAllAudioGlobal();
      setActiveVoiceKey("none");
      setActiveVoiceState("idle");

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

  const [activeVoiceKey, setActiveVoiceKey] = useState<"none" | "benediction" | "mantra">("none");
  const [activeVoiceState, setActiveVoiceState] = useState<"idle" | "loading" | "playing">("idle");

  const isBenedictionLoading = activeVoiceKey === "benediction" && activeVoiceState === "loading";
  const isBenedictionPlaying = activeVoiceKey === "benediction" && activeVoiceState === "playing";
  const isMantraLoading = activeVoiceKey === "mantra" && activeVoiceState === "loading";
  const isMantraPlaying = activeVoiceKey === "mantra" && activeVoiceState === "playing";

  const toggleBenedictionVoice = async () => {
    if (activeVoiceKey === "benediction" && (activeVoiceState === "loading" || activeVoiceState === "playing")) {
      stopAllAudioGlobal();
      setActiveVoiceKey("none");
      setActiveVoiceState("idle");
      return;
    }
    stopAllAudioGlobal();
    setIsPlayingAudio(false);
    setActiveVoiceKey("benediction");
    setActiveVoiceState("loading");

    try {
      await synthesizeAndPlayClonedVoice(
        benediction,
        lang,
        activeVoiceId,
        () => {
          setActiveVoiceKey((prev) => (prev === "benediction" ? "none" : prev));
          setActiveVoiceState((prev) => (prev === "playing" ? "idle" : prev));
        },
        () => {
          setActiveVoiceKey("benediction");
          setActiveVoiceState("playing");
        }
      );
    } catch {
      setActiveVoiceKey((prev) => (prev === "benediction" ? "none" : prev));
      setActiveVoiceState("idle");
    }
  };

  const toggleMantraVoice = async () => {
    const mantraText = deity.mantra[lang] || deity.mantra.kn;
    if (activeVoiceKey === "mantra" && (activeVoiceState === "loading" || activeVoiceState === "playing")) {
      stopAllAudioGlobal();
      setActiveVoiceKey("none");
      setActiveVoiceState("idle");
      return;
    }
    stopAllAudioGlobal();
    setIsPlayingAudio(false);
    setActiveVoiceKey("mantra");
    setActiveVoiceState("loading");

    try {
      await synthesizeAndPlayClonedVoice(
        mantraText,
        lang,
        activeVoiceId,
        () => {
          setActiveVoiceKey((prev) => (prev === "mantra" ? "none" : prev));
          setActiveVoiceState((prev) => (prev === "playing" ? "idle" : prev));
        },
        () => {
          setActiveVoiceKey("mantra");
          setActiveVoiceState("playing");
        }
      );
    } catch {
      setActiveVoiceKey((prev) => (prev === "mantra" ? "none" : prev));
      setActiveVoiceState("idle");
    }
  };

  const requestedCalendarDays = useMemo(() => {
    const raw = Number((decoded as any)?.dy || (decoded as any)?.days || (decoded as any)?.duration || params.get("days") || 90);
    return Number.isFinite(raw) && raw > 0 ? raw : 90;
  }, [params, decoded]);

  const downloadIcsLabel = useMemo(() => {
    if (lang === "kn") return `${requestedCalendarDays} ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (.ics)`;
    if (lang === "hi") return `${requestedCalendarDays}-दिवसीय कैलेंडर डाउनलोड करें (.ics)`;
    if (lang === "te") return `${requestedCalendarDays} రోజుల క్యాలెండర్ డౌన్‌లోడ్ చేయండి (.ics)`;
    if (lang === "ta") return `${requestedCalendarDays} நாட்கள் காலண்டர் பதிவிறக்கு (.ics)`;
    return `Download ${requestedCalendarDays}-Day Calendar (.ics)`;
  }, [requestedCalendarDays, lang]);

  // Helper to generate & download dynamic duration .ics file
  const handleDownload90DayIcs = () => {
    try {
      const startDateStr = decoded?.d || dateParam || new Date().toISOString().split("T")[0];
      const parts = startDateStr.split("-").map(Number);
      const sy = parts[0] || 2026;
      const sm = (parts[1] || 1) - 1;
      const sd = parts[2] || 1;
      
      const birthNakIdx = (birthKundli ? birthKundli.planets.find(p => p.name === 'Moon')?.nakshatra.index : undefined) ?? (decoded?.nk !== undefined ? decoded.nk : 18);
      const birthRashiIdx = (birthKundli ? birthKundli.planets.find(p => p.name === 'Moon')?.rashi.index : undefined) ?? (decoded?.r !== undefined ? decoded.r : 8);
      
      const days: RhythmDay[] = [];
      for (let i = 0; i < requestedCalendarDays; i++) {
        const noonUtc = new Date(Date.UTC(sy, sm, sd + i, 12, 0, 0));
        const ymd = noonUtc.toISOString().slice(0, 10);
        const rhythmDay = calculateDeterministicRhythmDay(ymd, birthNakIdx, birthRashiIdx, startDateStr);
        days.push(rhythmDay);
      }

      const ics = generateSevaICalendarString({
        days,
        lang,
        panditName: localizedPandit,
        personName: devoteeDisplayName,
        birthNakshatraIndex: birthNakIdx,
        birthRashiIndex: birthRashiIdx,
        dob: birthDateStr,
        tob: birthTimeStr,
        lat: userLat,
        lng: userLng,
        pincode: userPincode,
        locationName: userLocationName
      });

      const sanitizeName = (str: string) => str.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
      const cleanPandit = sanitizeName(localizedPandit) || "Shreeram_Pandit";
      const cleanDevotee = sanitizeName(devoteeDisplayName) || "Devotee";
      const cleanDate = startDateStr.replace(/[^\d-]/g, "");

      downloadIcsFile(`${cleanPandit}_${cleanDevotee}_${requestedCalendarDays}Days_${cleanDate}.ics`, ics);
      setDownloadedNotice(true);
    } catch (err) {
      console.error("Download ICS error:", err);
    }
  };

  // Trigger automatic download ONLY when scanning physical QR code (action=ics)
  useEffect(() => {
    if (isQrScanAutoDownload) {
      const timer = setTimeout(() => {
        handleDownload90DayIcs();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isQrScanAutoDownload]);

  const handleShareWhatsApp = () => {
    const text = buildCleanDailyWhatsAppShareText(
      mockDay.ymd,
      lang,
      tithiLabel(mockDay, lang),
      nakshatraName(mockDay.moonNakshatraIndex, lang)
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = () => {
    const text = buildCleanDailyWhatsAppShareText(
      mockDay.ymd,
      lang,
      tithiLabel(mockDay, lang),
      nakshatraName(mockDay.moonNakshatraIndex, lang)
    );
    navigator.clipboard.writeText(text);
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

          {/* Main Prominent Heading - Line 1: Energy Badge Emoji + Paksha - Tithi (NO brackets!) */}
          <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: "#FDE68A", letterSpacing: 0.5 }}>
            {vibe.badgeEmoji} {pakshaLabel(mockDay, lang)} - {tithiOnlyLabel(mockDay, lang)}
          </h1>
          
          {/* Line 2: Priest Name */}
          <div style={{ fontSize: 16, color: "#FBBF24", fontWeight: 800, marginBottom: 4 }}>
            {localizedPandit}
          </div>

          {/* Line 3: Gokarna Kshetra */}
          <div style={{ fontSize: 14, color: "#F59E0B", fontWeight: 700 }}>
            🛕 {dict.kshetraTitle}
          </div>

          {/* Devotee Streak & 5-Language Switcher */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
            flexWrap: "wrap"
          }}>
            <DevoteeStreakBadge
              devoteeName={devoteeDisplayName}
              lang={lang}
            />

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

      {/* Ashirvada Pass Expired & Renewal Alert Banner */}
      {passExpiration.isExpired && (
        <div style={{
          maxWidth: 600,
          margin: "14px auto 8px",
          padding: "16px",
          borderRadius: "18px",
          background: "linear-gradient(135deg, #450A0A 0%, #7F1D1D 100%)",
          border: "2px solid #EF4444",
          boxShadow: "0 8px 25px rgba(239, 68, 68, 0.35)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "26px", marginBottom: "4px" }}>⏳</div>
          <h3 style={{ color: "#FEE2E2", fontSize: "16px", fontWeight: 900, margin: "0 0 6px" }}>
            {lang === "kn" ? "ಆಶೀರ್ವಾದ ಪಂಚಾಂಗ ಪಾಸ್ ಕಾಲಾವಧಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ" : "Ashirvada Calendar Pass Expired"}
          </h3>
          <p style={{ color: "#FECACA", fontSize: "12px", margin: "0 0 12px", lineHeight: 1.5 }}>
            {lang === "kn"
              ? `ನಿಮ್ಮ ${rawDuration}-ದಿನಗಳ ದೈನಂದಿನ ದರ್ಶನ ಪಾಸ್ ದಿನಾಂಕ ${passExpiration.expiryDate} ರಂದು ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಪಂಚಾಂಗ ಸೇವೆ ಮತ್ತು ಮುಹೂರ್ತಗಳ ನವೀಕರಣಕ್ಕಾಗಿ ದಯವಿಟ್ಟು ಪುರೋಹಿತರನ್ನು ಸಂಪರ್ಕಿಸಿ.`
              : `Your ${rawDuration}-day Daily Darshana pass expired on ${passExpiration.expiryDate}. Please contact the priest to renew your sanctum access.`}
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={`tel:${activePanditPhone.replace(/[^\d+]/g, "")}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "12px",
                background: "#DC2626",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)"
              }}
            >
              📞 {lang === "kn" ? "ಪಂಡಿತರಿಗೆ ಕರೆ ಮಾಡಿ" : "Call Priest"}
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `ನಮಸ್ಕಾರ ಶ್ರೀರಾಮ್ ಪಂಡಿತರೆ, ನನ್ನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಆಶೀರ್ವಾದ ಪಾಸ್ (${rawDuration} ದಿನಗಳು) ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ನವೀಕರಣಕ್ಕಾಗಿ ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ.\nಭಕ್ತರ ಹೆಸರು: ${devoteeDisplayName}\nಗೋತ್ರ: ${devoteeGotra}\nದಿನಾಂಕ: ${mockDay.ymd}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "12px",
                background: "#16A34A",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.4)"
              }}
            >
              💬 WhatsApp {lang === "kn" ? "ನವೀಕರಣ" : "Renew"}
            </a>
          </div>
        </div>
      )}

      {/* Sticky Mobile 3-Tab Navigation */}
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
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8
        }}>
          <button
            onClick={() => setActiveTab("darshana")}
            style={{
              background: activeTab === "darshana" ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(45, 20, 7, 0.85)",
              color: activeTab === "darshana" ? "#FFFFFF" : "#FCD34D",
              border: activeTab === "darshana" ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.3)",
              padding: "10px 4px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center",
              boxShadow: activeTab === "darshana" ? "0 4px 12px rgba(217, 119, 6, 0.4)" : "none"
            }}
          >
            🛕 {dict.tabSanctum}
          </button>

          <button
            onClick={() => setActiveTab("guidance")}
            style={{
              background: activeTab === "guidance" ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(45, 20, 7, 0.85)",
              color: activeTab === "guidance" ? "#FFFFFF" : "#FCD34D",
              border: activeTab === "guidance" ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.3)",
              padding: "10px 4px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center",
              boxShadow: activeTab === "guidance" ? "0 4px 12px rgba(217, 119, 6, 0.4)" : "none"
            }}
          >
            ✨ {dict.tabGuidance}
          </button>

          <button
            onClick={() => setActiveTab("bhavishya")}
            style={{
              background: activeTab === "bhavishya" ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(45, 20, 7, 0.85)",
              color: activeTab === "bhavishya" ? "#FFFFFF" : "#FCD34D",
              border: activeTab === "bhavishya" ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.3)",
              padding: "10px 4px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center",
              boxShadow: activeTab === "bhavishya" ? "0 4px 12px rgba(217, 119, 6, 0.4)" : "none"
            }}
          >
            🔮 {dict.tabBhavishya}
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
            {/* Daily Priest-Guided 3-5 Minute Morning Deva Pooja & Sankalpa Banner */}
            <div style={{
              background: "linear-gradient(135deg, rgba(146, 64, 14, 0.95) 0%, rgba(69, 26, 3, 0.98) 100%)",
              border: "2px solid #F59E0B",
              borderRadius: 18,
              padding: "16px 18px",
              marginBottom: 16,
              boxShadow: "0 8px 24px rgba(217, 119, 6, 0.35)",
              display: "flex",
              flexDirection: "column",
              gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 26 }}>🪔</span>
                  <div>
                    <span style={{ fontSize: 13.5, fontWeight: 900, color: "#FDE68A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {lang === "kn" ? "೩-೫ ನಿಮಿಷಗಳ ನಿತ್ಯ ದೈವಿಕ ಸಂಕಲ್ಪ & ಸರಳ ಪೂಜೆ" :
                       lang === "hi" ? "३-५ मिनट दैनिक वैदिक संकल्प एवं सरल पूजा" :
                       lang === "te" ? "3-5 నిమిషాల నిత్య దైవిక సంకల్పం & పూజ" :
                       lang === "ta" ? "3-5 நிமிட நித்ய வைதீக சங்கல்பம் & பூஜை" :
                       "3-5 Min Vedic Daily Sankalpa & Pooja"}
                    </span>
                    <div style={{ fontSize: 11.5, color: "#FEF3C7", marginTop: 2, lineHeight: 1.4 }}>
                      {lang === "kn" ? `ಇಂದಿನ ಅರ್ಚನೆ: ${deity.name.kn} · ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸಂಕಲ್ಪಗಳೊಂದಿಗೆ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ವೇದ ಪಂಡಿತರ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ · ಪೂಜಾ ನಿರಂತರತೆ: ${poojaStreak.currentStreak} ದಿನ` :
                       lang === "hi" ? `आज की पूजा: ${deity.name.hi || deity.name.en} · व्यक्तिगत संकल्पों के साथ वैदिक पंडित मार्गदर्शन · संकल्प: ${poojaStreak.currentStreak} दिन` :
                       lang === "te" ? `నేటి పూజ: ${deity.name.te || deity.name.en} · వ్యక్తిగత సంకల్పాలతో వైదిక పండితుల మార్గదర్శనం · క్రమం: ${poojaStreak.currentStreak} రోజులు` :
                       lang === "ta" ? `இன்றைய பூஜை: ${deity.name.ta || deity.name.en} · தனிப்பட்ட சங்கல்பங்களுடன் வைதீக பண்டிதர் வழிகாட்டல் · தொடர்ச்சி: ${poojaStreak.currentStreak} நாட்கள்` :
                       `Today's Archana: ${deity.name.en} · 3-5 Min Vedic morning pooja guided by Chief Priest with your personal Sankalpas · Streak: ${poojaStreak.currentStreak} Days`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Manage Sankalpas & Start Pooja */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsManageSankalpaOpen(true)}
                  style={{
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "#FEF3C7",
                    border: "1.5px solid #FCD34D",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 12.5,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>📝</span>
                  <span>{lang === "kn" ? "ನಿಮ್ಮ ಸಂಕಲ್ಪಗಳು (Manage)" : "Manage Sankalpas"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPoojaModalOpen(true)}
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    color: "#1C0A00",
                    border: "1.5px solid #FDE68A",
                    borderRadius: 12,
                    padding: "10px 16px",
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  <span>🪔</span>
                  <span>{lang === "kn" ? "ಪೂಜೆ ಆರಂಭಿಸಿ (Start Pooja)" : "Start 3-5 Min Pooja"}</span>
                </button>
              </div>
            </div>

            {/* Post-Pooja 11-Time Personal Kundli Remedy Japa Card */}
            <div className="mb-4">
              <PostPoojaRemedyJapaCard
                birthKundli={birthKundli}
                devoteeName={devoteeDisplayName}
                gotra={devoteeGotra}
                rashiName={rashiName(moonRashiIdx, lang)}
                nakshatraName={nakshatraName(moonNakshatraIdx, lang)}
                lang={lang}
                voiceId={activeVoiceId}
              />
            </div>

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

            {/* Sacred Tithi Timings & Transition Details Card */}
            {(() => {
              const dt = (mockDay as any).detailedTithi as DetailedTithiInfo | undefined;
              if (!dt) return null;

              const cardHeading = lang === "kn" ? "ತಿಥಿ ಸಮಯ & ವಿವರ" :
                lang === "hi" ? "तिथि समय एवं विवरण" :
                lang === "te" ? "తిథి సమయాలు & వివరాలు" :
                lang === "ta" ? "திதி நேரம் மற்றும் விவரங்கள்" :
                "Tithi Timings & Transitions";

              const activeTithiLabel = lang === "kn" ? "ಪ್ರಸ್ತುತ ತಿಥಿ (ಸೂರ್ಯೋದಯ)" :
                lang === "hi" ? "वर्तमान तिथि (सूर्योदय)" :
                lang === "te" ? "ప్రస్తుత తిథి (సూర్యోదయం)" :
                lang === "ta" ? "தற்போதைய திதி (சூரியோதயம்)" :
                "Primary Tithi (Sunrise)";

              const untilLabel = lang === "kn" ? "ಮುಕ್ತಾಯ ಸಮಯ (IST)" :
                lang === "hi" ? "समाप्ति समय (IST)" :
                lang === "te" ? "ముగింపు సమయం (IST)" :
                lang === "ta" ? "முடிவு நேரம் (IST)" :
                "Active Until (IST)";

              const nextTithiLabel = lang === "kn" ? "ನಂತರದ ತಿಥಿ (ಉಪರಿ ತಿಥಿ)" :
                lang === "hi" ? "आगामी तिथि (उपरी तिथि)" :
                lang === "te" ? "తదుపరి తిథಿ" :
                lang === "ta" ? "அடுத்த திதி" :
                "Next Tithi";

              const nextDurationLabel = lang === "kn" ? "ಅವಧಿ" :
                lang === "hi" ? "अवधि" :
                lang === "te" ? "వ్యವಧಿ" :
                lang === "ta" ? "கால அளவு" :
                "Duration";

              const majorityHeading = lang === "kn" ? "ದಿನದ ಪ್ರಮುಖ ಶಕ್ತಿ ಆಧಾರ" :
                lang === "hi" ? "दिन का मुख्य ऊर्जा आधार" :
                lang === "te" ? "రోజు ప్రధాన శక్తి ఆధారం" :
                lang === "ta" ? "நாளின் முதன்மை ஆற்றல் அடிப்படை" :
                "Dominant Day Energy";

              return (
                <div style={{
                  background: "linear-gradient(135deg, rgba(80, 27, 17, 0.95) 0%, rgba(45, 14, 5, 0.95) 100%)",
                  border: "1.5px solid #F59E0B",
                  borderRadius: 16,
                  padding: "16px 18px",
                  marginBottom: 16,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.5)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#FDE68A", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>📜</span>
                      <span>{cardHeading}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", background: "rgba(245, 158, 11, 0.15)", padding: "2px 8px", borderRadius: 8, border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                      100% IST
                    </span>
                  </div>

                  {/* 2-Column Grid: Current Tithi vs Next Tithi */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    {/* Primary Sunrise Tithi */}
                    <div style={{
                      background: "rgba(30, 10, 5, 0.8)",
                      border: "1px solid rgba(212, 175, 55, 0.35)",
                      borderRadius: 12,
                      padding: 12
                    }}>
                      <div style={{ fontSize: 10, color: "#F59E0B", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        🌅 {activeTithiLabel}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>
                        {dt.tithiFullLabel[lang] || dt.tithiFullLabel.en}
                      </div>
                      <div style={{ fontSize: 11, color: "#FDE68A", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        <span>⏱️</span>
                        <span>{untilLabel}: <strong style={{ color: "#86EFAC" }}>{dt.tithiEndTimeStr}</strong></span>
                      </div>
                    </div>

                    {/* Next Tithi */}
                    <div style={{
                      background: "rgba(30, 10, 5, 0.8)",
                      border: "1px solid rgba(212, 175, 55, 0.35)",
                      borderRadius: 12,
                      padding: 12
                    }}>
                      <div style={{ fontSize: 10, color: "#93C5FD", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        🌙 {nextTithiLabel}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>
                        {dt.nextTithiFullLabel[lang] || dt.nextTithiFullLabel.en}
                      </div>
                      <div style={{ fontSize: 11, color: "#E0E7FF", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        <span>⏳</span>
                        <span>{nextDurationLabel}: <strong style={{ color: "#FDE047" }}>{dt.nextTithiDurationStr[lang] || dt.nextTithiDurationStr.en}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Majority Tithi Banner & Energy Focus */}
                  <div style={{
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px dashed rgba(245, 158, 11, 0.5)",
                    borderRadius: 10,
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "#FFF8E7"
                  }}>
                    <span style={{ fontSize: 16 }}>⚡</span>
                    <div>
                      <strong style={{ color: "#FDE68A" }}>{majorityHeading}:</strong>{" "}
                      <span style={{ color: "#86EFAC", fontWeight: 700 }}>
                        {dt.majorityTithiName[lang] || dt.majorityTithiName.en}
                      </span>{" "}
                      <span style={{ fontSize: 11, color: "rgba(255, 248, 231, 0.8)" }}>
                        ({dt.isSunriseTithiMajority 
                          ? (lang === "kn" ? "ದಿನದ ಬಹುಪಾಲು ಸಮಯ ಸೂರ್ಯೋದಯ ತಿಥಿ ಮುಂದುವರಿಯುತ್ತದೆ" : "Active for majority of day") 
                          : (lang === "kn" ? "ದಿನದ ಬಹುಪಾಲು ಸಮಯ ಉಪರಿ ತಿಥಿ ಆಳುತ್ತದೆ" : "Subsequent tithi governs majority waking hours")})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

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
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={playTempleBell}
                  style={{
                    background: isPlayingAudio ? "#10B981" : "linear-gradient(135deg, #D97706, #B45309)",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "9px 18px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(217, 119, 6, 0.4)"
                  }}
                >
                  🔔 {isPlayingAudio ? dict.bellPlaying : dict.playBell}
                </button>
                <button
                  type="button"
                  onClick={toggleMantraVoice}
                  style={{
                    background: isMantraPlaying
                      ? "#DC2626"
                      : isMantraLoading
                      ? "linear-gradient(135deg, #B45309, #78350F)"
                      : "linear-gradient(135deg, #F59E0B, #D97706)",
                    color: isMantraPlaying || isMantraLoading ? "#FFFFFF" : "#1E1B4B",
                    border: "1px solid #FCD34D",
                    padding: "9px 18px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  {isMantraPlaying ? (
                    <>
                      <span>⏹️</span>
                      <span>{lang === "kn" ? "ಮಂತ್ರ ನಿಲ್ಲಿಸಿ (Stop)" : "Stop Mantra"}</span>
                    </>
                  ) : isMantraLoading ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      <span>{lang === "kn" ? "ಮಂತ್ರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Synthesizing Mantra..."}</span>
                    </>
                  ) : (
                    <>
                      <span>🔊</span>
                      <span>{lang === "kn" ? "ಮಂತ್ರ ಶ್ರವಣ (Listen Mantra)" : "Listen Mantra"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Chief Priest Benediction */}
            <div style={{
              background: "rgba(45, 20, 7, 0.85)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FDE68A", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span>📜 {lang === "kn"
                  ? `ಪ್ರಧಾನ ಅರ್ಚಕ ${localizedPandit} ಅವರ ಆಶೀರ್ವಚನ ಹಾಗೂ ಆಶೀರ್ವಾದ`
                  : lang === "hi"
                  ? `मुख्य अर्चक ${localizedPandit} का पावन आशीर्वाद`
                  : lang === "te"
                  ? `ప్రధాన అర్చకులు ${localizedPandit} గారి ఆశీర్వచనం మరియు ಆಶೀರ್వాదం`
                  : lang === "ta"
                  ? `முதன்மை அர்ச்சகர் ${localizedPandit} அவர்களின் புனித ஆசி`
                  : `Chief Priest ${localizedPandit}'s Sacred Benediction & Blessings`}</span>
                <button
                  type="button"
                  onClick={toggleBenedictionVoice}
                  style={{
                    background: isBenedictionPlaying
                      ? "#DC2626"
                      : isBenedictionLoading
                      ? "linear-gradient(135deg, #B45309, #78350F)"
                      : "linear-gradient(135deg, #D97706, #B45309)",
                    color: "#FFFFFF",
                    border: "1px solid #FCD34D",
                    padding: "6px 14px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    boxShadow: "0 2px 8px rgba(217, 119, 6, 0.3)"
                  }}
                >
                  {isBenedictionPlaying ? (
                    <>
                      <span>⏹️</span>
                      <span>{lang === "kn" ? "ನಿಲ್ಲಿಸಿ (Stop)" : "Stop Voice"}</span>
                    </>
                  ) : isBenedictionLoading ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      <span>{lang === "kn" ? "ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating Voice..."}</span>
                    </>
                  ) : (
                    <>
                      <span>🔊</span>
                      <span>{lang === "kn" ? "ಧ್ವನಿಯಲ್ಲಿ ಆಲಿಸಿ (Listen in Cloned Voice)" : "Listen in Cloned Voice"}</span>
                    </>
                  )}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#E5E7EB", fontStyle: "italic" }}>
                "{benediction}"
              </p>
            </div>

            {/* Sanctum Prayer Box */}
            <SanctumPrayerBox
              devoteeName={devoteeDisplayName}
              gotra={devoteeGotra}
              dateStr={mockDay.ymd}
              lang={lang}
              priestName={activePanditName}
            />
          </div>
        )}

        {/* ── TAB 2: GOLDEN HOUR & POWER GUIDANCE ── */}
        {activeTab === "guidance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 1. Personalized Golden Hour Widget */}
            <PersonalGoldenHourWidget
              dateStr={mockDay.ymd}
              devoteeName={devoteeDisplayName}
              rashiIndex={moonRashiIdx}
              nakshatraIndex={moonNakshatraIdx}
              lang={lang}
              voiceId={activeVoiceId}
            />

            {/* 2. Daily Lucky Gem & Power Direction + 11-Bead Digital Japa Mala */}
            <DailyLuckyGemWidget
              dateStr={mockDay.ymd}
              rashiIndex={moonRashiIdx}
              nakshatraIndex={moonNakshatraIdx}
              lang={lang}
              deityMantra={deity.mantra[lang] || deity.mantra.kn}
            />

            {/* 3. Daily Karma Navigator (Do's & Don'ts + 1-Min Micro-Parihara) */}
            <DailyKarmaNavigator
              dateStr={mockDay.ymd}
              rashiIndex={moonRashiIdx}
              nakshatraIndex={moonNakshatraIdx}
              lang={lang}
              devoteeName={devoteeDisplayName}
            />

            {/* 4. 1-Tap WhatsApp Story & Blessing Card Generator */}
            <DailyBlessingShareCard
              devoteeName={devoteeDisplayName}
              dateStr={mockDay.ymd}
              tithiStr={tithiLabel(mockDay, lang)}
              nakshatraStr={nakshatraName(mockDay.moonNakshatraIndex, lang)}
              goldenHourStr="10:48 AM - 11:36 AM"
              lang={lang}
              priestName={activePanditName}
            />
          </div>
        )}

        {/* ── TAB 3: DAILY HOROSCOPE & VEDIC ASTROLOGY (BHAVISHYA, KUNDALI, GOCHARA, DASHA) ── */}
        {(activeTab === "bhavishya" || activeTab === "kundali" || activeTab === "gochara" || activeTab === "dasha") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(69, 26, 3, 0.95) 0%, rgba(30, 10, 0, 0.95) 100%)",
              border: "2px solid #D4AF37",
              borderRadius: 16,
              padding: "18px 20px",
              textAlign: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.5)"
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FCD34D", letterSpacing: "0.5px" }}>
                ✨ {lang === "kn" ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ ಪ್ರಸಾದಿತ" : "Sri Gokarna Mahabaleshwara Blessed"}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", margin: "6px 0 4px", fontFamily: "serif" }}>
                {lang === "kn" ? "ಇಂದಿನ ದೈನಂದಿನ ದಿನ ಭವಿಷ್ಯ" : "Today's Personalized Daily Horoscope"}
              </h2>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B", marginBottom: 8 }}>
                📅 {formatLongDate(mockDay, lang)} ({rashiName(moonRashiIdx, lang)})
              </div>
              <p style={{ fontSize: 12, color: "#FEF3C7", margin: 0, lineHeight: 1.5 }}>
                {lang === "kn"
                  ? `${devoteeDisplayName} ಅವರ ಜನ್ಮ ಲಗ್ನ, ಚಂದ್ರ ರಾಶಿ ಹಾಗೂ ಇಂದಿನ ನವಗ್ರಹ ಸಂಚಾರ ಆಧರಿಸಿ ${activePanditName} ಗಣಿಸಿದ ಇಂದಿನ ಶುಭ ಫಲಗಳು.`
                  : `Personalized daily predictions computed for ${devoteeDisplayName} based on birth chart planetary alignments and today's Gochara transits.`}
              </p>
            </div>

            {/* Section 1: Daily Highlight */}
            <div style={{
              background: "rgba(30, 10, 0, 0.85)",
              border: "1.5px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 14,
              padding: "16px 18px"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FCD34D", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🌟</span> {lang === "kn" ? "ದಿನದ ಮುಖ್ಯಾಂಶ ಹಾಗೂ ದೈವಿಕ ಶಕ್ತಿ" : "Daily Overview & Spiritual Vibe"}
              </div>
              <p style={{ fontSize: 13, color: "#FEE2E2", lineHeight: 1.6, margin: 0 }}>
                {lang === "kn"
                  ? `ಇಂದು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಾದ ${rashiName(moonRashiIdx, "kn")}ಗೆ ಗೋಚಾರ ಚಂದ್ರನ ಶುಭ ಸಂಚಾರದಿಂದ ಕಾರ್ಯಗಳಲ್ಲಿ ಯಶಸ್ಸು ಹಾಗೂ ಮಾನಸಿಕ ಪ್ರಸನ್ನತೆ ಲಭಿಸಲಿದೆ. ನೂತನ ಯೋಜನೆಗಳನ್ನು ಪ್ರಾರಂಭಿಸಲು ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಮಹತ್ವದ ಚರ್ಚೆ ನಡೆಸಲು ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ದಿನ.`
                  : `Today, with favorable Moon transits relative to your Moon sign ${rashiName(moonRashiIdx, "en")}, you will experience mental clarity and success in daily tasks. Ideal day for initiating key discussions.`}
              </p>
            </div>

            {/* Section 2: Career & Wealth */}
            <div style={{
              background: "rgba(30, 10, 0, 0.85)",
              border: "1.5px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 14,
              padding: "16px 18px"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FCD34D", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span>💼</span> {lang === "kn" ? "ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ ಹಾಗೂ ಧನ ಲಾಭ" : "Career, Business & Finance"}
              </div>
              <p style={{ fontSize: 13, color: "#FEE2E2", lineHeight: 1.6, margin: 0 }}>
                {lang === "kn"
                  ? `ವೃತ್ತಿರಂಗದಲ್ಲಿ ಶ್ರಮಕ್ಕೆ ಸೂಕ್ತ ಮಾನ್ಯತೆ ಲಭಿಸಲಿದೆ. ಹಣಕಾಸಿನ ವಹಿವಾಟುಗಳಲ್ಲಿ ಪ್ರಗತಿ ಕಂಡುಬರಲಿದ್ದು, ಹಳೆಯ ಬಾಕಿ ಹಣ ಕೈಸೇರುವ ಯೋಗವಿದೆ. ನೂತನ ಹೂಡಿಕೆ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆಗೆ ಹಿರಿಯರ ಸಲಹೆ ಸ್ವೀಕರಿಸಿ.`
                  : `Professional efforts will be recognized. Good financial flow and recovery of pending dues expected. Consult mentors before making fresh capital investments.`}
              </p>
            </div>

            {/* Section 3: Health & Family */}
            <div style={{
              background: "rgba(30, 10, 0, 0.85)",
              border: "1.5px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 14,
              padding: "16px 18px"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FCD34D", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🧘</span> {lang === "kn" ? "ಆರೋಗ್ಯ, ಕುಟುಂಬ ಹಾಗೂ ಬಾಂಧವ್ಯ" : "Health & Family Harmony"}
              </div>
              <p style={{ fontSize: 13, color: "#FEE2E2", lineHeight: 1.6, margin: 0 }}>
                {lang === "kn"
                  ? `ದೈಹಿಕ ಅರೋಗ್ಯ ಉತ್ತಮವಾಗಿರಲಿದ್ದು, ಮನಸ್ಸಿನಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ ತುಂಬಿರುತ್ತದೆ. ಗೃಹದಲ್ಲಿ ಮಂಗಳಕರ ವಾತಾವರಣ ಹಾಗೂ ಬಂಧುಗಳೊಂದಿಗೆ ಪ್ರೀತಿಪೂರ್ವಕ ಸಂಬಂಧ ಸೌಹಾರ್ದತೆಯಿಂದ ಕೂಡಿರುತ್ತದೆ.`
                  : `Physical vitality remains strong with positive energy. Domestic atmosphere is peaceful, fostering warm bonds with family and friends.`}
              </p>
            </div>

            {/* Major Planetary Gochara Transits */}
            <div style={{
              background: "rgba(45, 20, 7, 0.85)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: 16,
              padding: 16
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

            {/* Collapsible Uncluttered Deep Astrology Accordion (Kundali, Gochara Grid, Dasha) */}
            <details style={{
              background: "linear-gradient(135deg, rgba(45, 20, 7, 0.95), rgba(28, 10, 0, 0.95))",
              border: "1.5px solid #D4AF37",
              borderRadius: 16,
              padding: "14px 16px",
              cursor: "pointer"
            }}>
              <summary style={{
                fontSize: 14,
                fontWeight: 900,
                color: "#FDE68A",
                outline: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span>📜 {lang === "kn" ? "ಸಂಪೂರ್ಣ ಜನ್ಮ ಕುಂಡಲಿ, ಗೋಚಾರ & ದಶಾ ವಿವರಗಳು (ಹೆಚ್ಚಿನ ವಿವರ)" :
                          lang === "hi" ? "संपूर्ण जन्म कुंडली, गोचर व दशा विवरण (विस्तृत)" :
                          lang === "te" ? "పూర్తి జన్మ జాతకం, గోచారం & దశా వివరాలు (వివరాలు)" :
                          lang === "ta" ? "முழு ஜாதகம், கோச்சாரம் & தசா விவரங்கள் (விரிவானது)" :
                          "Complete Janma Kundali, Gochara & Dasha Details"}</span>
                <span style={{ fontSize: 12, color: "#F59E0B" }}>▼</span>
              </summary>

              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16, cursor: "default" }}>
                {/* Birth Attributes Summary */}
                <div style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: 12,
                  padding: 12
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#FDE68A", marginBottom: 8 }}>
                    📜 {dict.birthAttributes}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11.5 }}>
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
                  devoteeName={devoteeDisplayName}
                  title={
                    lang === "kn"
                      ? `📜 ${devoteeDisplayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿ`
                      : lang === "hi"
                      ? `📜 ${devoteeDisplayName} जी की जन्म कुंडली`
                      : lang === "te"
                      ? `📜 ${devoteeDisplayName} గారి జన్మ జాతక చక్రం`
                      : lang === "ta"
                      ? `📜 ${devoteeDisplayName} அவர்களின் ஜாதகக் கட்டம்`
                      : `📜 Janma Kundali of ${devoteeDisplayName}`
                  }
                  isGochara={false}
                />

                {/* Visual South-Indian Gochara Transit Chart */}
                <SouthIndianKundaliGrid
                  lang={lang}
                  highlightRashiIndex={moonRashiIdx}
                  lagnaRashiIndex={moonRashiIdx}
                  planetPlacements={gocharaPlacements}
                  devoteeName={devoteeDisplayName}
                  title={
                    lang === "kn"
                      ? `🌌 ${devoteeDisplayName} ಅವರ ಲೈವ್ ಗೋಚಾರ ಕುಂಡಲಿ`
                      : lang === "hi"
                      ? `🌌 ${devoteeDisplayName} जी की लाइव गोचर कुंडली`
                      : lang === "te"
                      ? `🌌 ${devoteeDisplayName} గారి లైవ్ గోచార జాతకం`
                      : lang === "ta"
                      ? `🌌 ${devoteeDisplayName} அவர்களின் கோச்சார ஜாதகம்`
                      : `🌌 Live Gochara Transit Chart for ${devoteeDisplayName}`
                  }
                  isGochara={true}
                />

                {/* Active Dasha Phase */}
                <div style={{
                  background: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
                  border: "1.5px solid #F59E0B",
                  borderRadius: 14,
                  padding: 14,
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 11, color: "#FDE68A", fontWeight: 700, textTransform: "uppercase" }}>
                    ⏳ {dict.dashaHeader}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>
                    {dashaPredictions.activePhase}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#FCD34D", marginTop: 2 }}>
                    {dashaPredictions.dashaPeriod}
                  </div>
                </div>

                {/* 4-Category Dasha Phala Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                  <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 12, padding: 12 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#F59E0B", marginBottom: 3 }}>
                      💼 {dict.careerTitle}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#E5E7EB", lineHeight: 1.5 }}>
                      {dashaPredictions.careerDesc}
                    </div>
                  </div>

                  <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 12, padding: 12 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#F59E0B", marginBottom: 3 }}>
                      💰 {dict.wealthTitle}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#E5E7EB", lineHeight: 1.5 }}>
                      {dashaPredictions.wealthDesc}
                    </div>
                  </div>

                  <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 12, padding: 12 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#F59E0B", marginBottom: 3 }}>
                      🏡 {dict.familyTitle}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#E5E7EB", lineHeight: 1.5 }}>
                      {dashaPredictions.familyDesc}
                    </div>
                  </div>

                  <div style={{ background: "rgba(45, 20, 7, 0.85)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 12, padding: 12 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#F59E0B", marginBottom: 3 }}>
                      🌿 {dict.healthTitle}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#E5E7EB", lineHeight: 1.5 }}>
                      {dashaPredictions.healthDesc}
                    </div>
                  </div>
                </div>
              </div>
            </details>
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
              : "To get this calendar or to get current life related details/predictions, you can contact Chief Archaka:"}
          </div>
          <div style={{ fontSize: 16, color: "#FFFFFF", fontWeight: 900, marginBottom: 10 }}>
            🛕 {lang === "kn" ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಪ್ರಧಾನ ಅರ್ಚಕರು)" :
                lang === "hi" ? "श्रीराम पंडित (मुख्य अर्चक)" :
                lang === "te" ? "శ్రీరామ్ పండిత్ (ప్రధాన అర్చకులు)" :
                lang === "ta" ? "ஸ்ரீராம் பண்டிட் (முதன்மை அர்ச்சகர்)" :
                "Shreeram Pandit (Chief Archaka)"}
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
            <span>{dict.callPandit}: {activePanditPhone}</span>
          </button>
        </div>
      </main>

      {/* Priest Direct Contact Modal */}
      {showContactModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowContactModal(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
        >
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
              {activePanditName}
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
                href={`tel:${activePanditPhone.replace(/[^\d+]/g, "")}`}
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
      {/* Devotee Contact Details Capture Modal (Phone / Email Popup) */}
      <DevoteeContactCaptureModal
        isOpen={isContactCaptureOpen && !hasDevoteeContactDetails(devoteeUser)}
        onClose={() => {
          setIsContactCaptureOpen(false);
          if (typeof window !== "undefined") {
            localStorage.setItem(`baggona_contact_collected_${devoteeUserId}`, "true");
            localStorage.setItem("baggona_contact_collected_global", "true");
          }
        }}
        devoteeId={devoteeUserId}
        devoteeName={devoteeDisplayName}
        gotra={devoteeGotra}
        lang={lang}
        initialPhone={devoteeUser?.phone || ""}
        initialEmail={devoteeUser?.email || ""}
        onSuccess={(updatedUser) => {
          setDevoteeUser(updatedUser);
          setIsContactCaptureOpen(false);
          if (typeof window !== "undefined") {
            localStorage.setItem(`baggona_contact_collected_${devoteeUserId}`, "true");
            localStorage.setItem("baggona_contact_collected_global", "true");
          }
        }}
      />

      {/* Daily Priest Voice Guided 3-5 Minute Pooja & Sankalpa Modal */}
      <DailyPoojaSankalpaModal
        isOpen={isPoojaModalOpen}
        onClose={() => setIsPoojaModalOpen(false)}
        devoteeId={devoteeUserId}
        devoteeName={devoteeDisplayName}
        birthKundli={birthKundli}
        gotra={devoteeGotra}
        rashiName={rashiName(moonRashiIdx, lang)}
        nakshatraName={nakshatraName(moonNakshatraIdx, lang)}
        lang={lang}
        priestName={activePanditName}
        voiceId={activeVoiceId}
        samvatsara={(mockDay as any).samvatsara || "ಪರಾಭವ"}
        ayana={(mockDay as any).ayana || "ದಕ್ಷಿಣಾಯನ"}
        ritu={(mockDay as any).ritu || "ವರ್ಷ ಋತು"}
        masa={(mockDay as any).masa || "ಶ್ರಾವಣ ಮಾಸ"}
        paksha={pakshaLabel(mockDay, lang)}
        tithi={tithiOnlyLabel(mockDay, lang)}
        vasara={(mockDay as any).vasara || "ಭೃಗುವಾಸರ"}
        nakshatra={nakshatraName(moonNakshatraIdx, lang)}
        onPlayBell={playTempleBell}
        onStreakUpdated={(newStreak) => setPoojaStreak(newStreak)}
      />

      {/* Personal Sankalpas Management Modal */}
      <ManageSankalpaModal
        isOpen={isManageSankalpaOpen}
        onClose={() => setIsManageSankalpaOpen(false)}
        userId={devoteeDisplayName}
        devoteeName={devoteeDisplayName}
        lang={lang}
        onOpenPooja={() => setIsPoojaModalOpen(true)}
      />
    </div>
  );
}
