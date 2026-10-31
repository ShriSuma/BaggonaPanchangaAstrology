import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import type {
  ComprehensiveDoshaReport,
  DetectedDosha,
  DetectedGandantara,
  DetectedFear
} from "../../core/ComprehensiveDoshaEngine";
import { cleanDegreesFromText } from "../../features/premiumPdf/yogaDoshaGocharaEnricher";

export type SupportedLanguage = "kn" | "hi" | "te" | "ta" | "en";

export interface KundliDoshaPdfTemplateProps {
  id?: string;
  report: ComprehensiveDoshaReport;
  lang?: string;
  qrCodeDataUrl?: string;
}

// 5-Language UI Localized Dictionary for 2-Page Master Dossier PDF
const PDF_TEXT: Record<SupportedLanguage, Record<string, string>> = {
  kn: {
    templeBanner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    mainTitle: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ಸಮಗ್ರ ದೋಷ ನಿರ್ಣಯ, ಗಂಡಾಂತರ & ವಯೋನುಗುಣ ಪರಿಹಾರ ಪತ್ರ",
    page2Title: "ದ್ವಿತೀಯ ಭಾಗ: ಗಂಡಾಂತರ ಸಂರಕ್ಷಣೆ, ಮನೋಭಯ ನಿವಾರಣೆ, ಗೋಕರ್ಣ ಸೇವೆಗಳು & ಆಶೀರ್ವಾದ",
    shloka: "॥ ನಮಃ ಸೂರ್ಯಾಯ ಶಾಂತಾಯ ಸರ್ವರೋಗ ನಿವಾರಿಣೇ । ಆಯುರಾರೋಗ್ಯಮೈಶ್ವರ್ಯಂ ದೇಹಿ ದೇವ ಜಗತ್ಪತೇ ॥",
    page2Shloka: "॥ ಸದಾಶಿವೋ ರಕ್ಷತು ಮಾಂ ಪ್ರಪನ್ನಂ । ಗೋಕರ್ಣನಾಥಂ ಶರಣಂ ಪ್ರಪದ್ಯೇ ॥",
    nativeDetails: "ಜಾತಕರ ವಿವರ",
    birthDetails: "ಜನನ ವಿವರ:",
    lagnaLabel: "ಲಗ್ನ:",
    rashiLabel: "ಚಂದ್ರ ರಾಶಿ:",
    nakshatraLabel: "ನಕ್ಷತ್ರ:",
    dashaLabel: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ-ಭುಕ್ತಿ:",
    currentAgeLabel: "ಪ್ರಸ್ತುತ ವಯಸ್ಸು:",
    ageStageLabel: "ಜೀವನ ಹಂತ:",
    activeDoshasCountLabel: "ಸಕ್ರಿಯ ದೋಷಗಳು:",
    ageStrategyHeading: "⭐ ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಆದ್ಯತಾ ಸೂಚಿ & ತುರ್ತು ಮಾರ್ಗದರ್ಶನ",
    ageStrategyNotice: "ಗಮನಿಸಿ: ದೋಷಗಳನ್ನು ಜಾತಕರ ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ತುರ್ತು ಆಧಾರದ ಮೇಲೆ ಆದ್ಯತಾ ಕ್ರಮದಲ್ಲಿ (#1, #2, #3...) ಜೋಡಿಸಲಾಗಿದೆ.",
    immediateActionLabel: "🎯 ಮೊದಲು ಮಾಡಬೇಕಾದ ಕರ್ತವ್ಯ (Immediate Priority Action):",
    agePriorityBadgeLabel: "ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಆದ್ಯತೆ",
    technicalRootLabel: "ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ಕಾರಣ:",
    realLifeImpactLabel: "ನೈಜ ಜೀವನದ ಪರಿಣಾಮಗಳು:",
    dashaResonanceLabel: "ದಶಾ-ಭುಕ್ತಿ ಪ್ರಭಾವ:",
    pariharaHeading: "ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ & ಗೋಕರ್ಣ ಸೇವೆ:",
    mantraLabel: "ಮಂತ್ರ ಜಪ & ಪರಿಹಾರ ಕ್ರಮ:",
    daanaLabel: "ದಾನ & ಸೇವೆ:",
    noDoshaTitle: "🕊️ ಶುದ್ಧ ನಿರ್ದೋಷ ಜಾತಕ (No Critical Afflictions)",
    noDoshaDesc: "ಜಾತಕದಲ್ಲಿ ಯಾವುದೇ ಮಾರಕ ಕರ್ಮ ದೋಷಗಳು ಅಥವಾ ಗಂಡಾಂತರಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಭಗವಂತನ ಕೃಪೆಯಿಂದ ಸಕಲ ಶುಭಗಳು ಲಭಿಸಲಿ.",
    secondaryDoshasHeading: "⚡ ದ್ವಿತೀಯ ಕರ್ಮ ದೋಷ ನಿರ್ಣಯ (Secondary Afflictions)",
    planetaryHarmonyHeading: "🕊️ ಗ್ರಹ ಸಾಮರಸ್ಯ & ದೋಷ ಶಮನ ರಕ್ಷಾ ಕವಚ (Harmonious Alignment)",
    planetaryHarmonyDesc: "ಜಾತಕದ ಇತರ ಭಾವಗಳು ಮತ್ತು ಗ್ರಹ ಸ್ಥಾನಗಳು ಸುಸ್ಥಿತಿಯಲ್ಲಿದ್ದು, ಪ್ರಮುಖ ಕರ್ಮ ದೋಷಗಳು ಪ್ರಥಮ ಪುಟದಲ್ಲಿ ಆದ್ಯತಾ ಕ್ರಮದಲ್ಲಿ ದಾಖಲಾಗಿವೆ. ಕೆಳಗಿನ ಗಂಡಾಂತರ ಸಂರಕ್ಷಣೆ ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾ ಪರಿಹಾರಗಳು ಸಕಲ ಶುಭಗಳನ್ನು ತರಲಿವೆ.",
    chartBalanceHeading: "🪐 ಗ್ರಹ ಸ್ಥಿತಿ & ಜಾತಕ ಭಾವ ಪರೀಕ್ಷೆ (Natal Balance Overview)",
    gandantaraHeading: "⚡ ಗಂಡಾಂತರಗಳು & ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ (Life Hazards & Safe Age Limits)",
    gandantaraNotice: "ಜಲ, ಅಗ್ನಿ, ವಾಹನ, ಸರ್ಪ ಇತ್ಯಾದಿ ಅಪಾಯಗಳ ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ ಹಾಗೂ ಕಡ್ಡಾಯ ನಿಷೇಧಗಳು",
    safeAgeLimitLabel: "ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ:",
    karmicCauseLabel: "ಕರ್ಮ ಕಾರಣ:",
    mandatoryPrecautionLabel: "ಕಡ್ಡಾಯ ನಿಷೇಧ & ರಕ್ಷಣೆ:",
    protectiveMantraLabel: "ರಕ್ಷಾ ಕವಚ & ಮಂತ್ರ:",
    fearsHeading: "🧠 ಅಂತರ್ಗತ ಮನೋಭಯಗಳು & ನಿವಾರಣಾ ಸಾಧನೆ (Innate Fears & Phobias)",
    fearsSubheading: "ಗ್ರಹ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುವ ಆಂತರಿಕ ಭಯಗಳ ಶಮನ ಹಾಗೂ ಮನೋಬಲ ವೃದ್ಧಿ",
    symptomLabel: "ಮಾನಸಿಕ ಲಕ್ಷಣ:",
    strengtheningPracticeLabel: "ಮನೋಬಲ ಸಾಧನೆ:",
    templeRemediesHeading: "🪔 ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಮಹಾ ಪರಿಹಾರಗಳು",
    priestBlessingHeading: "🙏 ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    priestName: "ವೇದಮೂರ್ತಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestTitle: "ಪ್ರಧಾನ ಅರ್ಚಕರು, ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ",
    priestPhone: "ದೂರವಾಣಿ: +91 99723 39362",
    sanskritAshirvada: "॥ ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ । ಸರ್ವೇ ಭದ್ರಾಣಿ ಪಶ್ಯಂತು ಮಾ ಕಶ್ಚಿತ್ ದುಃಖಭಾಗ್ಭವತ್ ॥",
    ashirvadaMeaning: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಅನುಗ್ರಹದಿಂದ ಜಾತಕದ ಸಮಸ್ತ ದೋಷಗಳು, ಗಂಡಾಂತರಗಳು ಶಮನವಾಗಿ, ಆಯುರಾರೋಗ್ಯ, ಸನ್ಮಂಗಳ ಉಂಟಾಗಲಿ ಎಂದು ಆಶೀರ್ವದಿಸಲಾಗಿದೆ.",
    officialSealLabel: "ಅಧಿಕೃತ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    scanToVerify: "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ (ಆನ್‌ಲೈನ್ ಪರಿಶೀಲನೆ)",
    page1Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಅಧಿಕೃತ ದೋಷ ಪತ್ರ · ಪುಟ ೧/೨ (ಮುಂದುವರಿದಿದೆ...)",
    page2Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಅಧಿಕೃತ ದೋಷ ಪತ್ರ · ಪುಟ ೨/೨ (ಸಂಪೂರ್ಣ)",
    expectedImprovementHeading: "✨ ಪರಿಹಾರದ ನಂತರದ ಸುಧಾರಣೆ & ಶುಭ ಫಲಗಳು:"
  },
  en: {
    templeBanner: "॥ Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga Astrology ॥",
    mainTitle: "Natal Kundli Comprehensive Doshas, Hazards & Age-Adaptive Remedies",
    page2Title: "Part II: Life Hazards (Gandantara), Fears, Gokarna Temple Sevas & Blessings",
    shloka: "॥ Namah Suryaya Shantaya Sarva Roga Nivarine | Ayur Arogyam Aishwaryam Dehi Deva Jagatpate ॥",
    page2Shloka: "॥ Sadashivo Rakshatu Mam Prapannam | Gokarnanatham Sharanam Prapadye ॥",
    nativeDetails: "Devotee Profile",
    birthDetails: "Birth Details:",
    lagnaLabel: "Lagna (Ascendant):",
    rashiLabel: "Moon Sign (Rashi):",
    nakshatraLabel: "Birth Star:",
    dashaLabel: "Running Dasha-Bhukti:",
    currentAgeLabel: "Current Age:",
    ageStageLabel: "Life Phase:",
    activeDoshasCountLabel: "Active Doshas:",
    ageStrategyHeading: "⭐ Age-Adaptive Priority Strategy & Urgent Guidance",
    ageStrategyNotice: "Notice: Doshas are strictly arranged by urgency for your current age phase (#1, #2, #3...).",
    immediateActionLabel: "🎯 Immediate Priority Action (Must Do First):",
    agePriorityBadgeLabel: "Current Age Priority",
    technicalRootLabel: "Classical Astrological Root:",
    realLifeImpactLabel: "Real-World Manifestation:",
    dashaResonanceLabel: "Dasha-Bhukti Resonance:",
    pariharaHeading: "Prescribed Parihara & Gokarna Seva:",
    mantraLabel: "Sacred Mantra & Remedy:",
    daanaLabel: "Charity & Offerings:",
    noDoshaTitle: "🕊️ Pure & Unafflicted Natal Chart",
    noDoshaDesc: "No critical karmic afflictions or life hazards detected. Under divine grace, may life remain peaceful and prosperous.",
    secondaryDoshasHeading: "⚡ Secondary Karmic Afflictions",
    planetaryHarmonyHeading: "🕊️ Planetary Harmony & Karmic Shield",
    planetaryHarmonyDesc: "Other planetary placements and bhavas are well-aligned. The primary karmic obligations are prioritized on Page 1. Following the protective guidance below ensures comprehensive auspiciousness.",
    chartBalanceHeading: "🪐 Natal Balance & Planetary Fortitude",
    gandantaraHeading: "⚡ Gandantara Hazards & Protective Age Windows",
    gandantaraNotice: "Critical elemental hazard thresholds (Water, Fire, Travel, Serpentine) and required precautions.",
    safeAgeLimitLabel: "Safe Age Threshold:",
    karmicCauseLabel: "Karmic Cause:",
    mandatoryPrecautionLabel: "Mandatory Cautions & Protections:",
    protectiveMantraLabel: "Protective Kavacha & Mantra:",
    fearsHeading: "🧠 Subconscious Innate Fears & Strengthening Practices",
    fearsSubheading: "Planetary root causes of subconscious anxieties and practical methods to cultivate mental fortitude.",
    symptomLabel: "Psychological Symptom:",
    strengtheningPracticeLabel: "Fortitude Practice:",
    templeRemediesHeading: "🪔 Sacred Gokarna Mahabaleshwara Remedies by Life Stage",
    priestBlessingHeading: "🙏 Chief Priest Blessing & Official Temple Seal",
    priestName: "Vedamurthy Shreeram Pandit",
    priestTitle: "Chief Priest & Astrologer, Sri Gokarna Kshetra",
    priestPhone: "Direct Phone: +91 99723 39362",
    sanskritAshirvada: "॥ Sarve Bhavantu Sukhinah Sarve Santu Niramayah | Sarve Bhadrani Pashyantu Ma Kashchid Duhkhabhag Bhavet ॥",
    ashirvadaMeaning: "Blessed with divine longevity, health, and liberation from all karmic afflictions under Sri Mahabaleshwara's grace.",
    officialSealLabel: "Official Temple Seal",
    scanToVerify: "Scan to Verify (Online)",
    page1Footer: "Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga · Official Dosha Report · Page 1/2 (Contd...)",
    page2Footer: "Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga · Official Dosha Report · Page 2/2 (Complete)",
    expectedImprovementHeading: "✨ Expected Life Improvement & Positive Transformations:"
  },
  hi: {
    templeBanner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    mainTitle: "जन्म कुंडली आधारित समग्र दोष निर्णय, गंडांतर एवं आयु-अनुकूल परिहार पत्र",
    page2Title: "द्वितीय भाग: गंडांतर संरक्षण, मनोभय निवारण, गोकर्ण सेवा एवं आशीर्वाद",
    shloka: "॥ नमः सूर्याय शान्ताय सर्वरोग निवारिणे । आयुरारोग्यमैश्वर्यं देहि देव जगत्पते ॥",
    page2Shloka: "॥ सदाशिवो रक्षतु मां प्रपन्नं । गोकर्णनाथं शरणं प्रपद्ये ॥",
    nativeDetails: "जातक विवरण",
    birthDetails: "जन्म विवरण:",
    lagnaLabel: "लग्न:",
    rashiLabel: "चंद्र राशि:",
    nakshatraLabel: "नक्षत्र:",
    dashaLabel: "वर्तमान महादशा-भुक्ति:",
    currentAgeLabel: "वर्तमान आयु:",
    ageStageLabel: "जीवन अवस्था:",
    activeDoshasCountLabel: "सक्रिय दोष:",
    ageStrategyHeading: "⭐ वर्तमान आयु प्राथमिकता सूची एवं तात्कालिक मार्गदर्शन",
    ageStrategyNotice: "सूचना: दोषों को जातक की वर्तमान आयु की तात्कालिक आवश्यकता के अनुसार प्राथमिकता क्रम में सजाया गया है।",
    immediateActionLabel: "🎯 सर्वप्रथम कर्तव्य (Immediate Priority Action):",
    agePriorityBadgeLabel: "वर्तमान आयु प्राथमिकता",
    technicalRootLabel: "शास्त्रीय तकनीकी कारण:",
    realLifeImpactLabel: "वास्तविक जीवन पर प्रभाव:",
    dashaResonanceLabel: "दशा-भुक्ति प्रभाव:",
    pariharaHeading: "शास्त्रोक्त परिहार एवं गोकर्ण सेवा:",
    mantraLabel: "मंत्र जप एवं परिहार विधि:",
    daanaLabel: "दान एवं सेवा:",
    noDoshaTitle: "🕊️ शुद्ध निर्दोष जातक (No Critical Afflictions)",
    noDoshaDesc: "कुंडली में कोई मारक कर्म दोष अथवा गंडांतर उपस्थित नहीं है। ईश्वर की कृपा से सर्वत्र शुभता बनी रहे।",
    secondaryDoshasHeading: "⚡ द्वितीयक कर्म दोष निर्णय (Secondary Afflictions)",
    planetaryHarmonyHeading: "🕊️ ग्रह सामंजस्य एवं दोष शमन रक्षा कवच (Harmonious Alignment)",
    planetaryHarmonyDesc: "कुंडली के अन्य भाव एवं ग्रह स्थिति अनुकूल हैं। प्रथम पृष्ठ के मुख्य परिहारों के साथ नीचे दिए गए निर्देशों का पालन सर्वतोमुखी सुरक्षा प्रदान करेगा।",
    chartBalanceHeading: "🪐 ग्रह स्थिति एवं कुंडली भाव विश्लेषण (Natal Balance Overview)",
    gandantaraHeading: "⚡ गंडांतर एवं रक्षात्मक आयु सीमा (Life Hazards & Safe Age Limits)",
    gandantaraNotice: "जल, अग्नि, वाहन, सर्प आदि संकटों की रक्षात्मक आयु सीमा एवं अनिवार्य निषेध।",
    safeAgeLimitLabel: "रक्षात्मक आयु सीमा:",
    karmicCauseLabel: "कर्म कारण:",
    mandatoryPrecautionLabel: "अनिवार्य निषेध एवं सावधानी:",
    protectiveMantraLabel: "रक्षा कवच एवं मंत्र:",
    fearsHeading: "🧠 अंतर्निहित मनोभय एवं निवारण साधना (Innate Fears & Phobias)",
    fearsSubheading: "ग्रह प्रभाव से उत्पन्न मानसिक भयों का शमन एवं मनोबल संवर्धन।",
    symptomLabel: "मानसिक लक्षण:",
    strengtheningPracticeLabel: "मनोबल साधना:",
    templeRemediesHeading: "🪔 श्री गोकर्ण महाबलेश्वर सन्निधान के महा परिहार",
    priestBlessingHeading: "🙏 प्रधान अर्चक आशीर्वाद एवं गोकर्ण सन्निधि मुहर",
    priestName: "वेदामूर्ति श्रीराम पंडित",
    priestTitle: "प्रधान अर्चक, श्री गोकर्ण महाबलेश्वर सन्निधान",
    priestPhone: "सीधा फोन: +91 99723 39362",
    sanskritAshirvada: "॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद् दुःखभाग्भवेत् ॥",
    ashirvadaMeaning: "श्री महाबलेश्वर स्वामी के अनुग्रह से समस्त दोषों का शमन हो एवं जातक को दीर्घायु, स्वास्थ्य व सुख प्राप्त हो।",
    officialSealLabel: "अधिकारिक सन्निधि मुहर",
    scanToVerify: "स्कैन करें (सत्यापन)",
    page1Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग · आधिकारिक दोष पत्र · पृष्ठ १/२ (जारी...)",
    page2Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग · आधिकारिक दोष पत्र · पृष्ठ २/२ (संपूर्ण)",
    expectedImprovementHeading: "✨ शांति उपरांत अपेक्षित जीवन सुधार एवं शुभ परिणाम:"
  },
  te: {
    templeBanner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    mainTitle: "జన్మ కుండలి సమగ్ర దోష నిర్ణయం, గండాతర & వయోనుగుణ పరిహార పత్రం",
    page2Title: "రెండవ భాగం: గండాతర రక్షణ, మనోభయ నివారణ, గోకర్ణ సేవలు & ఆశీర్వాదం",
    shloka: "॥ నమః సూర్యాయ శాంతాయ సర్వరోగ నివారిణే । ఆయురారోగ్యమైశ్వర్యం దేహి దేవ జగత్పతే ॥",
    page2Shloka: "॥ సదాశివో రక్షతు మాం ప్రపన్నం । గోకర్ణనాథం శరణం ప్రపద్యే ॥",
    nativeDetails: "జాతకుని వివరాలు",
    birthDetails: "జన్మ వివరాలు:",
    lagnaLabel: "లగ్నం:",
    rashiLabel: "చంద్ర రాశి:",
    nakshatraLabel: "నక్షత్రం:",
    dashaLabel: "ప్రస్తుత మహాదశ-భుక్తి:",
    currentAgeLabel: "ప్రస్తుత వయస్సు:",
    ageStageLabel: "జీవిత దశ:",
    activeDoshasCountLabel: "సక్రియ దోషాలు:",
    ageStrategyHeading: "⭐ ప్రస్తుత వయస్సు ప్రాధాన్యత & తక్షణ మార్గదర్శనం",
    ageStrategyNotice: "గమనిక: ప్రస్తుత వయస్సు అవసరానికి అనుగుణంగా దోషాలు ప్రాధాన్యతా క్రమంలో అమర్చబడ్డాయి.",
    immediateActionLabel: "🎯 మొదట చేయవలసిన కర్తవ్యం (Immediate Priority Action):",
    agePriorityBadgeLabel: "ప్రస్తుత వయస్సు ప్రాధాన్యత",
    technicalRootLabel: "శాస్త్రీయ సాంకేతిక కారణం:",
    realLifeImpactLabel: "నిజ జీవితంలో ప్రభావం:",
    dashaResonanceLabel: "దశా-భుక్తి ప్రభావం:",
    pariharaHeading: "శాస్త్రోక్త పరిహారం & గోకర్ణ సేవ:",
    mantraLabel: "మంత్ర జపం & పరిహార విధి:",
    daanaLabel: "దానం & సేవ:",
    noDoshaTitle: "🕊️ శుద్ధ నిర్దోష జాతకం (No Critical Afflictions)",
    noDoshaDesc: "జాతకంలో ఎటువంటి తీవ్ర కర్మ దోషాలు లేవు. భగవంతుని కృపతో సర్వ శుభాలు కలుగుగాక.",
    secondaryDoshasHeading: "⚡ ద్వితీయ కర్మ దోష నిర్ణయం (Secondary Afflictions)",
    planetaryHarmonyHeading: "🕊️ గ్రహ సామరస్యం & రక్షా కవచం (Harmonious Alignment)",
    planetaryHarmonyDesc: "జాతకంలోని ఇతర గ్రహ స్థితులు అనుకూలంగా ఉన్నాయి. మొదటి పేజీలోని ముఖ్య పరిహారాలతో పాటు క్రింది సూచనలు సర్వతోముఖ రక్షణ కల్పిస్తాయి.",
    chartBalanceHeading: "🪐 గ్రహ స్థితి & కుండలి భావ పరిశీలన (Natal Balance Overview)",
    gandantaraHeading: "⚡ గండాతరాలు & రక్షణ వయోపరిమితి (Life Hazards & Safe Age Limits)",
    gandantaraNotice: "జల, అగ్ని, వాహన, సర్ప ప్రమాదాల రక్షణ వయోపరిమితి మరియు తప్పనిసరి నియమాలు.",
    safeAgeLimitLabel: "రక్షణ వయోపరిమితి:",
    karmicCauseLabel: "కర్మ కారణం:",
    mandatoryPrecautionLabel: "తప్పనిసరి జాగ్రత్తలు & రక్షణ:",
    protectiveMantraLabel: "రక్షా కవచం & మంత్రం:",
    fearsHeading: "🧠 అంతర్గత మనోభయాలు & నివారణ సాధన (Innate Fears & Phobias)",
    fearsSubheading: "గ్రహ ప్రభావం వల్ల కలిగే ఆందోళనల శమనం మరియు మనోబల వృద్ధి.",
    symptomLabel: "మానసిక లక్షణం:",
    strengtheningPracticeLabel: "మనోబల సాధన:",
    templeRemediesHeading: "🪔 శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధాన మహా పరిహారాలు",
    priestBlessingHeading: "🙏 ప్రధాన అర్చకుల ఆశీర్వచనం & గోకర్ణ ముద్ర",
    priestName: "వేదమూర్తి శ్రీరామ్ పండిత్",
    priestTitle: "ప్రధాన అర్చకులు, శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం",
    priestPhone: "ప్రత్యక్ష ఫోన్: +91 99723 39362",
    sanskritAshirvada: "॥ సర్వే భవంతు సుఖినః సర్వే సంతు నిరామయాః । సర్వే భద్రాణి పశ్యంతు మా కశ్చిద్ దుఃఖభాగ్భవేత్ ॥",
    ashirvadaMeaning: "శ్రీ మహాబలేశ్వర స్వామి అనుగ్రహంతో సమస్త దోషాలు తొలగి, ఆయురారోగ్యాలు సిద్ధించుగాక.",
    officialSealLabel: "అధికారిక సన్నిధి ముద్ర",
    scanToVerify: "స్కాన్ చేయండి (ధృవీకరణ)",
    page1Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · అధికారిక దోష పత్రం · పేజీ 1/2 (కొనసాగింపు...)",
    page2Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · అధికారిక దోష పత్రం · పేజీ 2/2 (సంపూర్ణం)",
    expectedImprovementHeading: "✨ పరిహారం తర్వాత ఆశించే శుభ పరిణామాలు & అభివృద్ధి:"
  },
  ta: {
    templeBanner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதானம் · பக்ககோண பஞ்சாங்க ஜோதிடம் ॥",
    mainTitle: "ஜன்ம குண்டலி தோஷ ஆய்வு, கண்டாந்தரங்கள் & வயதுக்கேற்ற பரிகார அறிக்கை",
    page2Title: "இரண்டாம் பகுதி: கண்டாந்தர பாதுகாப்பு, பய நிவாரணம், கோகர்ண சேவைகள் & ஆசி",
    shloka: "॥ நமஃ சூர்யாய சாந்தாய சர்வரோக நிவாரினே । ஆயுராரோக்யமைஸ்வர்யம் தேஹி தேவ ஜகத்பதே ॥",
    page2Shloka: "॥ சதாசிவோ ரக்ஷது மாம் ப்ரபன்னம் । கோகர்ணநாதம் சரணம் ப்ரபத்யே ॥",
    nativeDetails: "ஜாதகர் விவரம்",
    birthDetails: "பிறப்பு விவரங்கள்:",
    lagnaLabel: "லக்னம்:",
    rashiLabel: "சந்திர ராசி:",
    nakshatraLabel: "நட்சத்திரம்:",
    dashaLabel: "தற்போதைய மகாதிசை-புக்தி:",
    currentAgeLabel: "தற்போதைய வயது:",
    ageStageLabel: "வாழ்க்கை நிலை:",
    activeDoshasCountLabel: "நடப்பு தோஷங்கள்:",
    ageStrategyHeading: "⭐ நடப்பு வயது முன்னுரிமை & உடனடி வழிகாட்டுதல்",
    ageStrategyNotice: "குறிப்பு: ஜாதகரின் தற்போதைய வயதுக்கு ஏற்ப தோஷங்கள் முன்னுரிமை வரிசையில் பட்டியலிடப்பட்டுள்ளன.",
    immediateActionLabel: "🎯 முதலில் செய்ய வேண்டிய பரிகாரம் (Immediate Priority Action):",
    agePriorityBadgeLabel: "நடப்பு வயது முன்னுரிமை",
    technicalRootLabel: "சாஸ்திர ஜோதிடக் காரணம்:",
    realLifeImpactLabel: "நடைமுறை வாழ்க்கைப் பாதிப்புகள்:",
    dashaResonanceLabel: "திசை-புக்தி தாக்கம்:",
    pariharaHeading: "சாஸ்திரோக்த பரிகாரம் & கோகர்ண சேவை:",
    mantraLabel: "மந்திர ஜபம் & பரிகார முறை:",
    daanaLabel: "தானம் & வழிபாட்டு முறைகள்:",
    noDoshaTitle: "🕊️ தோஷமற்ற தூய ஜாதகம் (No Critical Afflictions)",
    noDoshaDesc: "ஜாதகத்தில் கடுமையான கர்ம தோஷங்கள் ஏதுமில்லை. இறைவனின் அருளால் வாழ்க்கை அமைதியாக அமையட்டும்.",
    secondaryDoshasHeading: "⚡ இரண்டாம் நிலை தோஷங்கள் (Secondary Afflictions)",
    planetaryHarmonyHeading: "🕊️ கிரக சமநிலை & பாதுகாப்பு கவசம் (Harmonious Alignment)",
    planetaryHarmonyDesc: "ஜாதகத்தின் பிற நிலைகள் சுபமாக உள்ளன. முதல் பக்க பரிகாரங்களுடன் கீழேயுள்ள வழிமுறைகள் பூரண பாதுகாப்பு அளிக்கும்.",
    chartBalanceHeading: "🪐 கிரக நிலை & ஜாதக பலம் (Natal Balance Overview)",
    gandantaraHeading: "⚡ கண்டாந்தரங்கள் & பாதுகாப்பு வயது வரம்பு (Life Hazards & Safe Age Limits)",
    gandantaraNotice: "நீர், நெருப்பு, வாகனம், நாக தோஷ ஆபத்துகளுக்கான பாதுகாப்பு வயது வரம்பு மற்றும் எச்சரிக்கைகள்.",
    safeAgeLimitLabel: "பாதுகாப்பு வயது வரம்பு:",
    karmicCauseLabel: "கர்ம காரணம்:",
    mandatoryPrecautionLabel: "கட்டாய எச்சரிக்கை & பாதுகாப்பு:",
    protectiveMantraLabel: "பாதுகாப்பு கவசம் & மந்திரம்:",
    fearsHeading: "🧠 ஆழ்மன பயங்கள் & மனோபல வளர்ச்சி (Innate Fears & Phobias)",
    fearsSubheading: "கிரக தாக்கத்தால் ஏற்படும் உள்மன அச்சங்களை நீக்கி மனோதைரியம் பெருக்கும் முறைகள்.",
    symptomLabel: "மனோதத்துவ அறிகுறி:",
    strengtheningPracticeLabel: "மனோபல சாதனை:",
    templeRemediesHeading: "🪔 ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி மகா பரிகாரங்கள்",
    priestBlessingHeading: "🙏 தலைமை அர்ச்சகர் ஆசீர்வாதம் & சந்நிதி முத்திரை",
    priestName: "வேதமூர்த்தி ஸ்ரீராம் பண்டிதர்",
    priestTitle: "தலைமை அர்ச்சகர், ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதானம்",
    priestPhone: "நேரடி அழைப்பு: +91 99723 39362",
    sanskritAshirvada: "॥ சர்வே பவந்து சுகினஃ சர்வே சந்து நிராமயாஃ । சர்வே பத்ராணி பஸ்யந்து மா கஸ்சித் துக்கபாக்பவேத் ॥",
    ashirvadaMeaning: "ஸ்ரீ மகாபலேஸ்வரர் திருவருளால் சகல தோஷங்களும் நீங்கி, நீண்ட ஆயுளும் ஆரோக்கியமும் உண்டாக வாழ்த்துகிறோம்.",
    officialSealLabel: "அதிகாரப்பூர்வ சந்நிதி முத்திரை",
    scanToVerify: "ஸ்கேன் செய்க (சரிபார்ப்பு)",
    page1Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதானம் · பக்ககோண பஞ்சாங்கம் · அதிகாரப்பூர்வ அறிக்கை · பக்கம் 1/2 (தொடர்கிறது...)",
    page2Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதானம் · பக்ககோண பஞ்சாங்கம் · அதிகாரப்பூர்வ அறிக்கை · பக்கம் 2/2 (முழுமை)",
    expectedImprovementHeading: "✨ பரிகாரத்திற்குப் பின் எதிர்பார்க்கப்படும் நற்பலன்கள் & முன்னேற்றம்:"
  }
};

interface DoshaSnippets {
  part1: string;
  part2: string;
  shivaMedallion: string;
  suryaMedallion: string;
  gokarnanathaMedallion: string;
  yearsUnit: string;
  yearsTillUnit: string;
  evaluated: string;
  critical: string;
  moderate: string;
  karmicVulnerability: string;
  subconsciousFear: string;
  subconsciousFearShort: string;
  shantiCompleted: string;
  shantiPrep: string;
  guidance: string;
  guidanceShort: string;
  lagnaFortitude: string;
  chandraFortitude: string;
  suryaFortitudeTitle: string;
  suryaFortitudeDesc: string;
  trikonaFortitudeTitle: string;
  trikonaFortitudeDesc: string;
  pitruBadge: string;
  hazardsActiveSuffix: string;
  allHazardSafe: string;
  noGandantaraDetected: string;
  safeAgePassed: string;
  safeThresholdSurpassedDesc: (age: number) => string;
  parashariProtocol: string;
  parashariRuleDesc: string;
  agePrefix: string;
  ageFocusFallback: string;
  priorityPrefix: string;
  divNative: string;
  divPrimaryDosha: string;
  divSecondaryDosha: string;
  divPriestBlessing: string;
}

const LOCALIZED_SNIPPETS: Record<string, DoshaSnippets> = {
  kn: {
    part1: "ಭಾಗ ೧",
    part2: "ಭಾಗ ೨",
    shivaMedallion: "॥ ಶಿವ ॥",
    suryaMedallion: "॥ ಸೂರ್ಯ ॥",
    gokarnanathaMedallion: "॥ ಗೋಕರ್ಣನಾಥ ॥",
    yearsUnit: "ವರ್ಷ",
    yearsTillUnit: "ವರ್ಷದವರೆಗೆ",
    evaluated: "ಪರಿಶೀಲಿತ ವರ್ಗಗಳು:",
    critical: "ತೀವ್ರ ಬಾಧೆ:",
    moderate: "ಮಧ್ಯಮ ಬಾಧೆ:",
    karmicVulnerability: "ದೋಷ ಸೂಚ್ಯಂಕ:",
    subconsciousFear: "ಆಂತರಿಕ ಮನೋಭಯ & ಚಿಂತೆಗಳು:",
    subconsciousFearShort: "ಆಂತರಿಕ ಮನೋಭಯ:",
    shantiCompleted: "ಶಾಂತಿ ನೆರವೇರಿದ ದೃಢೀಕರಣ:",
    shantiPrep: "ಶಾಂತಿ ಸಿದ್ಧತೆ:",
    guidance: "ವಿಶೇಷ ಮಾರ್ಗದರ್ಶನ:",
    guidanceShort: "ಮಾರ್ಗದರ್ಶನ:",
    lagnaFortitude: "ಲಗ್ನ ಕೇಂದ್ರವು ಜಾತಕರ ಶಾರೀರಿಕ ಆರೋಗ್ಯ ಮತ್ತು ಜೀವ ಶಕ್ತಿಯನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ಪ್ರಮುಖ ಭಾವಗಳು ರಕ್ಷಿತವಾಗಿವೆ.",
    chandraFortitude: "ಚಂದ್ರ ರಾಶಿ ಮತ್ತು ಮನೋಸ್ಥಿತಿ ಸಮತೋಲನದಲ್ಲಿದ್ದು, ನಿತ್ಯ ಪೂಜೆ ಹಾಗೂ ಈಶ್ವರ ಪ್ರಾರ್ಥನೆಯು ಮಾನಸಿಕ ಶಾಂತಿಯನ್ನು ತರುತ್ತದೆ.",
    suryaFortitudeTitle: "ಆತ್ಮಕಾರಕ ಸೂರ್ಯ ಬಲ:",
    suryaFortitudeDesc: "ಪೂರ್ವ ಪುಣ್ಯ ಮತ್ತು ಪಿತೃ ಆಶೀರ್ವಾದದ ಪ್ರಭಾವದಿಂದ ಜಾತಕರಿಗೆ ಕಷ್ಟಗಳನ್ನು ಎದುರಿಸುವ ನೈಸರ್ಗಿಕ ಸಂಕಲ್ಪ ಶಕ್ತಿ ಲಭಿಸಿದೆ.",
    trikonaFortitudeTitle: "ತ್ರಿಕೋಣ ಭಾವ ರಕ್ಷಣೆ:",
    trikonaFortitudeDesc: "ಧರ್ಮ ಮತ್ತು ಭಾಗ್ಯ ಸ್ಥಾನಗಳು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕೈಗೊಳ್ಳುವ ನಿತ್ಯ ಅರ್ಚನೆಯಿಂದ ಸದಾ ಜಾಗೃತವಾಗಿರುತ್ತವೆ.",
    pitruBadge: "🪔 ಪವಿತ್ರ ಪಿತೃ ಋಣ ನಿವಾರಣಾ ವಿಶೇಷ ಆದ್ಯತೆ · ಶ್ರೀ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ತಿಲ ಹೋಮ & ನಾರಾಯಣ ಬಲಿ",
    hazardsActiveSuffix: "ಗಂಡಾಂತರಗಳು ಸಕ್ರಿಯ",
    allHazardSafe: "✓ ಸಕಲ ಗಂಡಾಂತರ ವಯೋಮಿತಿ ಸುರಕ್ಷಿತವಾಗಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ",
    noGandantaraDetected: "ಯಾವುದೇ ಮಾರಕ ಜಲ-ಅಗ್ನಿ-ಸರ್ಪ ಗಂಡಾಂತರಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ. ಜಾತಕರು ಸುರಕ್ಷಿತರಾಗಿದ್ದಾರೆ.",
    safeAgePassed: "ವಯೋಮಿತಿ ದಾಟಿದೆ",
    safeThresholdSurpassedDesc: (age: number) => `ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ (${age} ವರ್ಷ) ಯಶಸ್ವಿಯಾಗಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಈ ಗಂಡಾಂತರದಿಂದ ಜಾತಕರು ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತರಾಗಿದ್ದಾರೆ.`,
    parashariProtocol: "ಪರಾಶರ ಶಾಸ್ತ್ರ ರಕ್ಷಾ ಸೂತ್ರ:",
    parashariRuleDesc: "ಗಂಡಾಂತರ ವಯೋಮಿತಿ ದಾಟುವ ತನಕ ಜಾತಕರಿಗೆ ನಿತ್ಯ ರುದ್ರಾಭಿಷೇಕ ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ, ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆಯುಷ್ಯ ಶಾಂತಿ ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ.",
    agePrefix: "ವಯಸ್ಸು ",
    ageFocusFallback: "ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ಮೊದಲ ಆದ್ಯತೆಯ ಪರಿಹಾರಗಳನ್ನು ಕೈಗೊಳ್ಳುವುದು ಅತ್ಯಾವಶ್ಯಕ.",
    priorityPrefix: "ಆದ್ಯತೆ #",
    divNative: "❖ ಜಾತಕ ವಿವರ ❖",
    divPrimaryDosha: "❖ ಪ್ರಮುಖ ಕರ್ಮ ದೋಷ ವಿಶ್ಲೇಷಣೆ ❖",
    divSecondaryDosha: "❖ ದ್ವಿತೀಯ ಕರ್ಮ ಫಲ & ಗ್ರಹ ಸಾಮರಸ್ಯ ❖",
    divPriestBlessing: "❖ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಸನ್ನಿಧಿ ಮುದ್ರೆ ❖"
  },
  hi: {
    part1: "भाग १",
    part2: "भाग २",
    shivaMedallion: "॥ शिव ॥",
    suryaMedallion: "॥ सूर्य ॥",
    gokarnanathaMedallion: "॥ गोकर्णनाथ ॥",
    yearsUnit: "वर्ष",
    yearsTillUnit: "वर्ष की आयु तक",
    evaluated: "परीक्षित वर्ग:",
    critical: "तीव्र बाधा:",
    moderate: "मध्यम बाधा:",
    karmicVulnerability: "कर्म दोष सूचकांक:",
    subconsciousFear: "आंतरिक मनोभय एवं चिंताएं:",
    subconsciousFearShort: "आंतरिक मनोभय:",
    shantiCompleted: "शांति संपन्न प्रमाण:",
    shantiPrep: "शांति तैयारी:",
    guidance: "विशेष मार्गदर्शन:",
    guidanceShort: "मार्गदर्शन:",
    lagnaFortitude: "लग्न केंद्र जातक के शारीरिक स्वास्थ्य और जीवन शक्ति को निर्धारित करता है। प्रमुख भाव सुरक्षित हैं।",
    chandraFortitude: "चंद्र राशि एवं मनोस्थिति संतुलन में है, नित्य पूजा तथा शिव आराधना मानसिक शांति प्रदान करती है।",
    suryaFortitudeTitle: "आत्मकारक सूर्य बल:",
    suryaFortitudeDesc: "पूर्व पुण्य एवं पितृ आशीर्वाद के प्रभाव से जातक को विपत्तियों से लड़ने की स्वाभाविक संकल्प शक्ति प्राप्त है।",
    trikonaFortitudeTitle: "त्रिकोण भाव रक्षा:",
    trikonaFortitudeDesc: "धर्म एवं भाग्य स्थान श्री गोकर्ण महाबलेश्वर के सानिध्य में की जाने वाली नित्य आराधना से सदैव जागृत रहते हैं।",
    pitruBadge: "🪔 पवित्र पितृ ऋण निवारण विशेष प्राथमिकता · श्री गोकर्ण कोटितीर्थ तिल होम एवं नारायण बलि",
    hazardsActiveSuffix: "गंडांतर सक्रिय",
    allHazardSafe: "✓ सभी गंडांतर आयु-सीमाएं सुरक्षित रूप से समाप्त हो चुकी हैं",
    noGandantaraDetected: "कोई घातक जल-अग्नि-सर्प गंडांतर नहीं पाया गया। जातक पूर्णतः सुरक्षित हैं।",
    safeAgePassed: "आयु-सीमा पार हो चुकी है",
    safeThresholdSurpassedDesc: (age: number) => `सुरक्षा आयु-सीमा (${age} वर्ष) सफलतापूर्वक पार हो चुकी है। इस गंडांतर से जातक पूरी तरह सुरक्षित हैं।`,
    parashariProtocol: "पाराशर शास्त्र रक्षा सूत्र:",
    parashariRuleDesc: "गंडांतर आयु सीमा पार करने तक जातक को नित्य रुद्राभिषेक तीर्थ मार्जन, महामृत्युंजय मंत्र जप एवं गोकर्ण क्षेत्र में आयुष्य शांति अनुष्ठान कराना अत्यंत मंगलकारी है।",
    agePrefix: "आयु ",
    ageFocusFallback: "वर्तमान आयु की आवश्यकतानुसार प्राथमिक उपायों का श्रद्धापूर्वक अनुष्ठान करना अत्यंत आवश्यक है।",
    priorityPrefix: "प्राथमिकता #",
    divNative: "❖ जातक विवरण ❖",
    divPrimaryDosha: "❖ प्रमुख कर्म दोष विश्लेषण ❖",
    divSecondaryDosha: "❖ द्वितीय कर्म फल एवं ग्रह सामंजस्य ❖",
    divPriestBlessing: "❖ अर्चक आशीर्वचन एवं सन्निधि मुद्रा ❖"
  },
  en: {
    part1: "Part 1",
    part2: "Part 2",
    shivaMedallion: "॥ Shiva ॥",
    suryaMedallion: "॥ Surya ॥",
    gokarnanathaMedallion: "॥ Gokarnanatha ॥",
    yearsUnit: "Yrs",
    yearsTillUnit: "Years",
    evaluated: "Evaluated Categories:",
    critical: "Critical Afflictions:",
    moderate: "Moderate Afflictions:",
    karmicVulnerability: "Karmic Vulnerability:",
    subconsciousFear: "Subconscious Fear & Anxiety:",
    subconsciousFearShort: "Subconscious Fear:",
    shantiCompleted: "Remedy Completed:",
    shantiPrep: "Remedy Preparation:",
    guidance: "Special Guidance:",
    guidanceShort: "Guidance:",
    lagnaFortitude: "The Ascendant kendra protects physical vitality, immunity and baseline life fortitude.",
    chandraFortitude: "Lunar dignity preserves cognitive resilience; regular worship and meditation maintain calm clarity.",
    suryaFortitudeTitle: "Sun & Vital Dignity:",
    suryaFortitudeDesc: "Solar fortitude and dharmic inheritance bestow innate will-power to overcome karmic hurdles.",
    trikonaFortitudeTitle: "Trikona Divine Grace:",
    trikonaFortitudeDesc: "Benefic 9th and 5th house trines anchor lasting divine protection under Mahabaleshwara's grace.",
    pitruBadge: "🪔 Sacred Ancestral Karma Priority · Sri Gokarna Kotiteertha Tila Homa & Narayana Bali",
    hazardsActiveSuffix: "Hazards Active",
    allHazardSafe: "✓ All Hazard Windows Safely Surpassed",
    noGandantaraDetected: "No critical life hazards or Gandantaras detected. Devotee is safeguarded.",
    safeAgePassed: "Safe Age Passed",
    safeThresholdSurpassedDesc: (age: number) => `Safe threshold (${age} years) successfully surpassed. Native is fully shielded.`,
    parashariProtocol: "Parashari Hazard Protocol:",
    parashariRuleDesc: "Until the safe age threshold is crossed, daily Mahamrityunjaya chanting, protective sacred ash (Vibhuti), and temple Kavacha are strongly advised.",
    agePrefix: "Age ",
    ageFocusFallback: "It is essential to undertake priority remedial measures aligned with your current life stage.",
    priorityPrefix: "Priority #",
    divNative: "❖ Native Profile ❖",
    divPrimaryDosha: "❖ Primary Karmic Doshas ❖",
    divSecondaryDosha: "❖ Secondary Karmic Impact & Balance ❖",
    divPriestBlessing: "❖ Priest Blessing & Sannidhi Seal ❖"
  },
  te: {
    part1: "భాగం 1",
    part2: "భాగం 2",
    shivaMedallion: "॥ శివ ॥",
    suryaMedallion: "॥ సూర్య ॥",
    gokarnanathaMedallion: "॥ గోకర్ణనాథ ॥",
    yearsUnit: "సంవత్సరాలు",
    yearsTillUnit: "సంవత్సరాల వరకు",
    evaluated: "పరిశీలించిన వర్గాలు:",
    critical: "తీవ్ర బాధ:",
    moderate: "మధ్యమ బాధ:",
    karmicVulnerability: "దోష సూచిక:",
    subconsciousFear: "అంతర్గత భయాలు & ఆందోళనలు:",
    subconsciousFearShort: "అంతర్గత భయం:",
    shantiCompleted: "శాంతి పూర్తయిన నిర్ధారణ:",
    shantiPrep: "శాంతి సన్నద్ధత:",
    guidance: "ప్రత్యేక మార్గదర్శకత్వం:",
    guidanceShort: "మార్గదర్శకత్వం:",
    lagnaFortitude: "లగ్న కేంద్రం జాతకుని శారీరక ఆరోగ్యం మరియు ప్రాణశక్తిని నిర్ణయిస్తుంది. ముఖ్య భావాలు రక్షించబడ్డాయి.",
    chandraFortitude: "చంద్ర రాశి మరియు మనఃస్థితి సమతుల్యతలో ఉన్నాయి, నిత్య పూజ మరియు శివారాధన మానసిక ప్రశాంతతను చేకూరుస్తాయి.",
    suryaFortitudeTitle: "ఆత్మకారక సూర్య బలం:",
    suryaFortitudeDesc: "పూర్వ పుణ్యం మరియు పితృ ఆశీర్వాద ప్రభావంతో జాతకునికి కష్టాలను ఎదుర్కొనే సహజ సంకల్ప బలం లభించింది.",
    trikonaFortitudeTitle: "త్రికోణ భావ రక్షణ:",
    trikonaFortitudeDesc: "ధర్మ మరియు భాగ్య స్థానాలు గోకర్ణ మహాబలేశ్వరుని సన్నిధిలో చేసే నిత్య పూజతో సదా రక్షణనిస్తాయి.",
    pitruBadge: "🪔 పవిత్ర పితృ రుణ నివారణ ప్రత్యేక ప్రాధాన్యత · శ్రీ గోకర్ణ కోటితీర్థ తిల హోమం & నారాయణ బలి",
    hazardsActiveSuffix: "గండాంతరాలు చురుకుగా ఉన్నాయి",
    allHazardSafe: "✓ అన్ని గండాంతర వయోపరిమితులు సురక్షితంగా దాటాయి",
    noGandantaraDetected: "ఎటువంటి ప్రాణాంతక జల-అగ్ని-సర్ప గండాంతరాలు లేవు. జాతకుడు సురక్షితంగా ఉన్నాడు.",
    safeAgePassed: "వయోపరిమితి దాటింది",
    safeThresholdSurpassedDesc: (age: number) => `రక్షణ వయోపరిమితి (${age} సం.) విజయవంతంగా దాటింది. ఈ గండాంతరం నుండి జాతకుడు సంపూర్ణంగా సురక్షితం.`,
    parashariProtocol: "పరాశర శాస్త్ర రక్షా సూత్రం:",
    parashariRuleDesc: "గండాంతర వయోపరిమితి దాటే వరకు జాతకునికి నిత్య రుద్రాభిషేక తీర్థ ప్రోక్షణ, మహామృత్యుంజయ మంత్ర జపం మరియు గోకర్ణ సన్నిధిలో ఆయుష్య శాంతి చేయడం అత్యంత శ్రేయస్కరం.",
    agePrefix: "వయస్సు ",
    ageFocusFallback: "ప్రస్తుత వయస్సు అవసరానికి అనుగుణంగా ప్రాధాన్యతా పరిహారాలను ఆచరించడం అత్యంత ఆవశ్యకం.",
    priorityPrefix: "ప్రాధాన్యత #",
    divNative: "❖ జాతక వివరాలు ❖",
    divPrimaryDosha: "❖ ప్రధాన కర్మ దోష విశ్లేషణ ❖",
    divSecondaryDosha: "❖ ద్వితీయ కర్మ ఫలం & గ్రహ సమన్వయం ❖",
    divPriestBlessing: "❖ అర్చకుల ఆశీర్వచనం & సన్నిధి ముద్ర ❖"
  },
  ta: {
    part1: "பகுதி 1",
    part2: "பகுதி 2",
    shivaMedallion: "॥ சிவ ॥",
    suryaMedallion: "॥ சூர்யா ॥",
    gokarnanathaMedallion: "॥ கோகர்ணநாதர் ॥",
    yearsUnit: "ஆண்டுகள்",
    yearsTillUnit: "ஆண்டுகள் வரை",
    evaluated: "ஆய்வு செய்யப்பட்டவை:",
    critical: "தீவிர பாதிப்பு:",
    moderate: "நடுத்தர பாதிப்பு:",
    karmicVulnerability: "கர்ம தோஷ குறியீடு:",
    subconsciousFear: "ஆழ்மன பயம் & கவலைகள்:",
    subconsciousFearShort: "ஆழ்மன பயம்:",
    shantiCompleted: "பரிகாரம் நிறைவடைந்த உறுதிப்படுத்தல்:",
    shantiPrep: "பரிகார முன்னேற்பாடு:",
    guidance: "சிறப்பு வழிகாட்டுதல்:",
    guidanceShort: "வழிகாட்டுதல்:",
    lagnaFortitude: "லக்ன கேந்திரம் ஜாதகரின் உடல் நலம் மற்றும் ஆயுள் பலத்தை உறுதி செய்கிறது. முக்கிய ஸ்தானங்கள் பாதுகாக்கப்பட்டுள்ளன.",
    chandraFortitude: "சந்திர ராசி மற்றும் மனநிலை சமநிலையில் உள்ளது, தினசரி இறை வழிபாடு மன அமைதியை வழங்கும்.",
    suryaFortitudeTitle: "ஆத்மகாரக சூரிய பலம்:",
    suryaFortitudeDesc: "பூர்வ புண்ணியம் மற்றும் பித்ருக்களின் ஆசியால் தடைகளை வெல்லும் திடசங்கல்ப பலம் கிடைத்துள்ளது.",
    trikonaFortitudeTitle: "திரிகோண ஸ்தான பாதுகாப்பு:",
    trikonaFortitudeDesc: "தர்ம மற்றும் பாக்கிய ஸ்தானங்கள் கோகர்ண மகாபலேஸ்வரரின் அருளால் எப்போதும் பூரண பாதுகாப்பு அளிக்கின்றன.",
    pitruBadge: "🪔 புனித பித்ரு கடன் நிவர்த்தி முன்னுரிமை · ஸ்ரீ கோகர்ண கோடித்தீர்த்த தில ஹோமம் & நாராயண பலி",
    hazardsActiveSuffix: "கண்டாந்தரங்கள் தீவிரமாக உள்ளன",
    allHazardSafe: "✓ அனைத்து கண்டாந்தர ஆபத்து வயது வரம்புகளும் பாதுகாப்பாக கடந்துவிட்டன",
    noGandantaraDetected: "எந்தவித கொடிய நீர்-நெருப்பு-நாக கண்டாந்தரங்களும் இல்லை. ஜாதகர் பாதுகாப்பாக உள்ளார்.",
    safeAgePassed: "பாதுகாப்பான வயது கடந்துவிட்டது",
    safeThresholdSurpassedDesc: (age: number) => `பாதுகாப்பு வயது வரம்பு (${age} ஆண்டுகள்) வெற்றிகரமாக கடக்கப்பட்டது. இந்த கண்டாந்தரத்திலிருந்து ஜாதகர் பூரண பாதுகாப்பில் உள்ளார்.`,
    parashariProtocol: "பராசர சாஸ்திர பாதுகாப்பு சூத்திரம்:",
    parashariRuleDesc: "கண்டாந்தர வயது வரம்பு முடியும் வரை தினமும் ருத்ராபிஷேக தீர்த்தம் தெளித்தல், மகா மிருத்யுஞ்சய மந்திர ஜெபம் மற்றும் கோகர்ண சந்நிதானத்தில் ஆயுஷ்ய சாந்தி செய்வது மிகச் சிறந்தது.",
    agePrefix: "வயது ",
    ageFocusFallback: "தற்போதைய வயதின் தேவைக்கேற்ப முன்னுரிமை பரிகாரங்களைச் செய்வது மிகவும் அவசியம்.",
    priorityPrefix: "முன்னுரிமை #",
    divNative: "❖ ஜாதகர் விவரம் ❖",
    divPrimaryDosha: "❖ முதன்மை கர்ம தோஷ ஆய்வு ❖",
    divSecondaryDosha: "❖ இரண்டாம் நிலை கர்ம பலன் & கிரக சமநிலை ❖",
    divPriestBlessing: "❖ அர்ச்சகர் ஆசி & சந்நிதி முத்திரை ❖"
  }
};

const getAgeStageRemedies = (stage: string, lang: string, hasPitru: boolean) => {
  const titles: Record<string, string[]> = {
    kn: [
      hasPitru ? "ಪವಿತ್ರ ಪಿತೃ ತರ್ಪಣ & ತಿಲ ಹೋಮ" : "ಶ್ರೀ ಮಹಾಗಣಪತಿ & ಮೃತ್ಯುಂಜಯ ಹೋಮ",
      "ರುದ್ರಾಭಿಷೇಕ & ಪಂಚಾಮೃತ ಪೂಜೆ",
      "ಗೋಸೇವೆ & ಅನ್ನದಾನ ಸೇವೆ",
      "ಸಿದ್ಧ ರುದ್ರಾಕ್ಷಿ & ರಕ್ಷಾ ಕವಚ ಧಾರಣೆ"
    ],
    hi: [
      hasPitru ? "पवित्र पितृ तर्पण एवं तिल होम" : "श्री महागणपति एवं मृत्युंजय होम",
      "रुद्राभिषेक एवं पंचामृत पूजा",
      "गोसेवा एवं अन्नदान सेवा",
      "सिद्ध रुद्राक्ष एवं रक्षा कवच धारण"
    ],
    te: [
      hasPitru ? "పవిత్ర పితృ తర్పణం & తిల హోమం" : "శ్రీ మహాగణపతి & మృత్యుంజయ హోమం",
      "రుద్రాభిషేకం & పంచామృత పూజ",
      "గోసేవ & అన్నదాన సేవ",
      "సిద్ధ రుద్రాక్ష & రక్షా కవచ ధారణ"
    ],
    ta: [
      hasPitru ? "புனித பித்ரு தர்பணம் & தில ஹோமம்" : "ஸ்ரீ மாகணபதி & மிருத்யுஞ்சய ஹோமம்",
      "ருத்ராபிஷேகம் & பஞ்சாமிர்த பூஜை",
      "கோபூஜை & அன்னதான சேவை",
      "சித்த ருத்ராட்சம் & ரட்சா கவசம் அணிதல்"
    ],
    en: [
      hasPitru ? "Sacred Pitru Tarpana & Tila Homa" : "Sri Mahaganapati & Mrityunjaya Homa",
      "Rudrabhisheka & Panchamrita Seva",
      "Go-Seva (Cow Care) & Annadaana",
      "Consecrated Rudraksha & Kavacha"
    ]
  };

  const descs: Record<string, string[]> = {
    kn: [
      hasPitru
        ? "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪವಿತ್ರ ತಿಲ ಹೋಮ ಹಾಗೂ ನಾರಾಯಣ ಬಲಿಯಿಂದ ಪಿತೃ ಋಣ ನಿವಾರಣೆ."
        : "ಆರಂಭಿಕ ವಿಘ್ನ ನಿವಾರಣೆ, ಆಯುರ್ವೃದ್ಧಿ ಹಾಗೂ ಗ್ರಹ ದೋಷ ಶಮನಕ್ಕಾಗಿ ವಿಶೇಷ ಹೋಮ.",
      "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ನಿತ್ಯ ರುದ್ರಾಭಿಷೇಕ ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ ಮತ್ತು ಶ್ರದ್ಧಾ ಭಕ್ತಿ ಸಮರ್ಪಣೆ.",
      "ಗೋಮಾತೆಗೆ ಸೇವೆ ಹಾಗೂ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಅನ್ನದಾನದ ಮೂಲಕ ಆಧ್ಯಾತ್ಮಿಕ ಪುಣ್ಯ ಸಂಚಯ.",
      "ಮನಸ್ಸಿನ ಶಾಂತಿ, ಪರಮಾತ್ಮನ ಸಾಕ್ಷಾತ್ಕಾರ ಹಾಗೂ ಮೋಕ್ಷ ಪ್ರಾಪ್ತಿಗೆ ಪವಿತ್ರ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ."
    ],
    hi: [
      hasPitru
        ? "गोकर्ण कोटितीर्थ में पवित्र तिल होम एवं नारायण बलि द्वारा पितृ ऋण निवारण।"
        : "विघ्न निवारण, आयु वृद्धि एवं ग्रह दोष शमन हेतु विशेष होम।",
      "श्री महाबलेश्वर आत्मलिंग पर नित्य रुद्राभिषेक तीर्थ एवं श्रद्धा भक्ति समर्पण।",
      "गोसेवा एवं गोकर्ण क्षेत्र में अन्नदान द्वारा आध्यात्मिक पुण्य संचय।",
      "आत्मिक शांति एवं ईश्वर सान्निध्य हेतु गोकर्ण पूजित रुद्राक्ष धारण।"
    ],
    te: [
      hasPitru
        ? "గోకర్ణ కోటితీర్థంలో పవిత్ర తిల హోమం మరియు నారాయణ బలి ద్వారా పితృ ఋణ నివారణ."
        : "విఘ్న నివారణ, ఆయుర్వృద్ధి మరియు గ్రహ దోష శమనం కొరకు విశేష హోమం.",
      "శ్రీ మహాబలేశ్వర ఆత్మలింగానికి నిత్య రుద్రాభిషేక తీర్థ ప్రోక్షణ మరియు భక్తి సమర్పణ.",
      "గోసేవ మరియు గోకర్ణంలో నిత్యాన్నదానం ద్వారా ఆధ్యాత్మిక పుణ్య సంపాదన.",
      "మనోశాంతి మరియు మోక్ష సాధన కొరకు పవిత్ర రుద్రాక్ష ధారణ."
    ],
    ta: [
      hasPitru
        ? "கோகர்ண கோடிதீர்த்தத்தில் புனித தில ஹோமம் மற்றும் நாராயண பலி மூலம் பித்ரு கடன் நிவர்த்தி."
        : "விக்னங்கள் நீங்கி, ஆயுள் ஆரோக்கியம் பெருக மாகணபதி மற்றும் மிருத்யுஞ்சய ஹோமம்.",
      "ஸ்ரீ மகாபலேஸ்வரர் ஆத்மலிங்கத்திற்கு நித்ய ருத்ராபிஷேக தீர்த்த வழிபாடு.",
      "கோசேவை மற்றும் கோகர்ண சந்நிதியில் அன்னதானம் மூலம் புண்ணிய நற்பேறுகளைப் பெறுதல்.",
      "மன அமைதி, இறை அருள் மற்றும் ஆன்மீக உயர்வுக்கு புனித ருத்ராட்சம் அணிதல்."
    ],
    en: [
      hasPitru
        ? "Tila Homa and Narayana Bali at Gokarna Kotiteertha to dissolve ancestral debts."
        : "Consecrated Homa for obstacle removal, longevity, and vitality.",
      "Daily Rudrabhisheka to Sri Mahabaleshwara Atmalinga for divine healing and peace.",
      "Sacred Cow protection and Annadaana to accumulate dharmic merits and spiritual grace.",
      "Blessed Rudraksha bead consecrated at Gokarna for inner peace and divine connection."
    ]
  };

  const tList = titles[lang] || titles.kn;
  const dList = descs[lang] || descs.kn;
  return [
    { icon: "🪔", title: tList[0], desc: dList[0], isPriority: true },
    { icon: "🌿", title: tList[1], desc: dList[1] },
    { icon: "🐄", title: tList[2], desc: dList[2] },
    { icon: "📿", title: tList[3], desc: dList[3] }
  ];
};

/**
 * Strips redundant duplicate prefixes from text (e.g. duplicate "🎯 ಮೊದಲು ಮಾಡಬೇಕಾದ ಕರ್ತವ್ಯ:" or "💡 ವಿಶೇಷ ಮಾರ್ಗದರ್ಶನ:").
 */
function stripDuplicatePrefix(text: string, prefixes: string[]): string {
  let cleaned = (text || "").trim();
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length).trim();
    }
  }
  return cleaned;
}

// Ultra-Luxury Gold & Parchment Palette
const PARCHMENT_BG = "#FDFBF7"; // Royal warm parchment background
const CARD_BG = "#FFFFFF"; // Clean crisp white card background
const PANEL_WARM = "#FAF7F2"; // Royal warm serene panel
const PANEL_ACCENT = "#FFFBEB"; // Soft amber panel for highlights
const INK_DEEP = "#1C140D"; // Deepest contrast charcoal bronze - zero faint text
const INK_MUTED = "#5C4028"; // Warm sepia brown for subtitles and citations
const GOLD_PRIMARY = "#B45309"; // Regal amber gold
const GOLD_DARK = "#78350F"; // Deep imperial gold / rich maroon
const GOLD_LIGHT = "#E7C68A"; // Delicate golden filigree border
const GOLD_BORDER = "#D97706"; // Crisp royal golden border

function getSeverityLabel(severity: string, code: SupportedLanguage): string {
  const map: Record<string, Record<SupportedLanguage, string>> = {
    critical: {
      kn: "ತೀವ್ರ ದೋಷ",
      hi: "तीव्र दोष",
      en: "Critical Dosha",
      te: "తీవ్ర దోషం",
      ta: "தீவிர தோஷம்"
    },
    high: {
      kn: "ಮಧ್ಯಮ-ತೀವ್ರ",
      hi: "मध्यम-तीव्र",
      en: "High Priority",
      te: "మధ్యమ-తీవ్రం",
      ta: "நடுத்தர-தீவிரம்"
    },
    moderate: {
      kn: "ಮಧ್ಯಮ ದೋಷ",
      hi: "मध्यम दोष",
      en: "Moderate Dosha",
      te: "మధ్యమ దోషం",
      ta: "நடுத்தர தோஷம்"
    },
    low: {
      kn: "ಸಾಮಾನ್ಯ ದೋಷ",
      hi: "सामान्य दोष",
      en: "Mild Dosha",
      te: "సాధారణ దోషం",
      ta: "சாதாரண தோஷம்"
    }
  };
  return map[severity]?.[code] || map.critical[code] || "Critical Dosha";
}

function getExpectedImprovementAfterParihara(doshaId: string, lang: SupportedLanguage): string {
  const improvements: Record<string, Record<SupportedLanguage, string>> = {
    pitru_dosha: {
      kn: "ನಿಂತುಹೋಗಿದ್ದ ಶುಭ ಕಾರ್ಯಗಳು, ಸ್ಥಿರಾಸ್ತಿ-ಕೌಟುಂಬಿಕ ವಿವಾದಗಳು ಹಾಗೂ ವೃತ್ತಿ ಅಡೆತಡೆಗಳು ಶಮನವಾಗಿ ಹೊಸ ಶುಭ ಮಾರ್ಗಗಳು ತೆರೆದುಕೊಳ್ಳುತ್ತವೆ. ಕುಟುಂಬದಲ್ಲಿ ಶಾಂತಿ, ಸಂತಾನ ಭಾಗ್ಯ ಮತ್ತು ಪಿತೃಗಳ ದಿವ್ಯ ರಕ್ಷಣೆ ಸದಾ ಲಭಿಸುತ್ತದೆ.",
      hi: "रुके हुए मांगलिक कार्य, पारिवारिक गतिरोध एवं आजीविका की अड़चनें दूर होकर नए शुभ अवसर प्राप्त होंगे। घर में सुख-शांति, वंश वृद्धि और पितरों का दिव्य आशीर्वाद बना रहेगा।",
      en: "Stuck projects, property disputes, and career stagnations dissolve smoothly. Domestic peace, progeny blessings, and divine ancestral protection will flow into your life.",
      te: "నిలిచిపోయిన శుభకార్యాలు, కుటుంబ వివాదాలు మరియు ఉద్యోగ అడ్డంకులు తొలగిపోయి కొత్త అవకాశాలు లభిస్తాయి. మానసిక ప్రశాంతత మరియు పితృదేవతల రక్షణ చేకూరుతుంది.",
      ta: "தடைபட்ட சுபகாரியங்கள், குடும்ப சச்சரவுகள் மற்றும் தொழில் தடைகள் நீங்கி நல்வழிகள் பிறக்கும். மன அமைதியும் பித்ருக்களின் ஆசியும் நிறையும்."
    },
    kuja_dosha: {
      kn: "ವಿವಾಹದಲ್ಲಿ ಉಂಟಾಗುತ್ತಿದ್ದ ಅಡೆತಡೆಗಳು, ಅಕಾರಣ ವಿಳಂಬ ಹಾಗೂ ಸಂಬಂಧಗಳಲ್ಲಿನ ಮುನಿಸು ದೂರವಾಗಿ, ಯೋಗ್ಯ ಜೀವನ ಸಂಗಾತಿಯ ಆಯ್ಕೆ ಸುಗಮವಾಗುತ್ತದೆ. ದಾಂಪತ್ಯದಲ್ಲಿ ಅನ್ಯೋನ್ಯತೆ ಹಾಗೂ ಆಂತರಿಕ ನೆಮ್ಮದಿ ನೆಲೆಸುತ್ತದೆ.",
      hi: "विवाह में हो रहा अकारण विलंब और रिश्तों का तनाव समाप्त होगा, सुयोग्य जीवनसाथी का सहयोग तथा दांपत्य जीवन में मधुरता और मानसिक संतोष का संचार होगा।",
      en: "Unnecessary marriage delays and emotional friction dissolve, leading to timely union with a compatible life partner, domestic harmony, and enduring mutual respect.",
      te: "వివాహంలో ఎదురవుతున్న తీవ్ర జాప్యాలు మరియు సంబంధాలలోని ఘర్షణలు సమసిపోయి, అనుకూలమైన భాగస్వామి లభిస్తారు. దాంపత్య జీవితంలో పరస్పర ప్రేమ మరియు శాంతి వెల్లివిరుస్తుంది.",
      ta: "திருமணத் தடைகளும் உறவுகளில் ஏற்பட்ட குழப்பங்களும் நீங்கி, பொருத்தமான வாழ்க்கைத்துணை அமைந்து இல்வாழ்க்கை சிறக்கும்."
    },
    kala_sarpa_dosha: {
      kn: "ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಕೈತಪ್ಪುತ್ತಿದ್ದ ಕೆಲಸಗಳು, ನಿರಂತರ ಆರ್ಥಿಕ ಅನಿಶ್ಚಿತತೆ ಹಾಗೂ ಆಂತರಿಕ ಆತಂಕಗಳು ಶಮನವಾಗಿ, ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ವ್ಯಾಪಾರ, ವೃತ್ತಿ ಹಾಗೂ ಸಾಮಾಜಿಕ ಗೌರವದಲ್ಲಿ ಸ್ಥಿರ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ.",
      hi: "अंतिम समय में रुकने वाले कार्य, वित्तीय उतार-चढ़ाव और मानसिक घबराहट समाप्त होगी। आपके परिश्रम का पूर्ण फल व्यापार, नौकरी और सामाजिक प्रतिष्ठा के रूप में प्राप्त होगा।",
      en: "Last-minute career slips, financial volatility, and recurring anxieties subside. Your honest efforts translate into consistent success, financial growth, and well-earned social recognition.",
      te: "ఆఖరి క్షణంలో చేజారే పనులు, ఆర్థిక అస్థిరత మరియు అనవసర భయాలు సమసిపోయి, మీ శ్రమకు తగిన స్థిరమైన విజయం మరియు గౌరవం లభిస్తాయి.",
      ta: "கடைசி நேரத்தில் நழுவிப்போகும் வாய்ப்புகள் மற்றும் தேவையற்ற அச்சங்கள் நீங்கி, உழைப்பிற்கு ஏற்ற முன்னேற்றமும் தொழில் வெற்றியும் உண்டாகும்."
    },
    guru_chandal_dosha: {
      kn: "ಮಾನಸಿಕ ಗೊಂದಲಗಳು, ದಾರಿ ತಪ್ಪಿಸುವ ನಕಾರಾತ್ಮಕ ನಿರ್ಧಾರಗಳು ಹಾಗೂ ಧನ ನಷ್ಟ ನಿಯಂತ್ರಣಕ್ಕೆ ಬಂದು, ಆಧ್ಯಾತ್ಮಿಕ ಸ್ಪಷ್ಟತೆ, ಸರಿಯಾದ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಸಾಮಾಜಿಕ ಗೌರವ ವೃದ್ಧಿಸುತ್ತದೆ.",
      hi: "मानसिक भ्रम, गलत निर्णय और धन हानि से मुक्ति मिलेगी। विवेकपूर्ण निर्णय, श्रेष्ठ मार्गदर्शन और समाज में सम्मान व प्रतिष्ठा की वृद्धि होगी।",
      en: "Mental confusion, erroneous guidance, and financial leakage subside. Clear discernment, auspicious mentorship, and respected status are firmly established.",
      te: "మానసిక అయోమయం మరియు తప్పుడు నిర్ణయాల వల్ల కలిగే నష్టాలు తొలగిపోతాయి. సన్మార్గం, సరైన మార్గదర్శకత్వం మరియు గౌరవం లభిస్తాయి.",
      ta: "மனக் குழப்பங்களும் தவறான முடிவுகளால் ஏற்படும் நஷ்டங்களும் நீங்கும். தெளிவான சிந்தனையும் நல்வழியும் சமுதாய மரியாதையும் உயரும்."
    },
    shani_sade_sati: {
      kn: "ದೀರ್ಘಕಾಲದ ಮಾನಸಿಕ ಒತ್ತಡ, ಸ್ಥಾನಪಲ್ಲಟದ ಆತಂಕ ಮತ್ತು ಆರ್ಥಿಕ ಸಂಕಷ್ಟಗಳು ನಿವಾರಣೆಯಾಗಿ, ದೃಢ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಉದ್ಯೋಗದಲ್ಲಿ ಸ್ಥಿರತೆ, ಆಸ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ಶಾಶ್ವತ ನೆಮ್ಮದಿ ಲಭಿಸುತ್ತದೆ.",
      hi: "दीर्घकालिक मानसिक तनाव, कार्यक्षेत्र की अस्थिरता और आर्थिक दबाव समाप्त होंगे। धैर्य और निष्ठापूर्वक किए गए कार्यों में स्थायित्व तथा उन्नति प्राप्त होगी।",
      en: "Protracted mental fatigue and professional turbulence give way to stability, long-term asset building, resilience, and unshakeable inner peace.",
      te: "సుదీర్ఘ మానసిక ఒత్తిడి మరియు ఉద్యోగ అస్థిరత తొలగిపోతాయి. కష్టానికి తగిన ప్రతిఫలం, స్థిరమైన ఉన్నతి మరియు శాంతి చేకూరుతాయి.",
      ta: "நீண்டகால மன அழுத்தமும் தொழில் தடைகளும் நீங்கும். உழைப்பிற்கு ஏற்ற நிலையான வெற்றியும் பொருளாதார வளர்ச்சியும் கிட்டும்."
    }
  };

  const defaultImprovement: Record<SupportedLanguage, string> = {
    kn: "ಗ್ರಹಗಳ ಪ್ರತಿಕೂಲ ಪ್ರಭಾವ ಶಮನವಾಗಿ, ದೀರ್ಘಕಾಲದಿಂದ ನೆನೆಗುದಿಗೆ ಬಿದ್ದಿದ್ದ ಕೆಲಸ-ಕಾರ್ಯಗಳು ಚುರುಕುಗೊಳ್ಳುತ್ತವೆ. ಆರ್ಥಿಕ ಚೇತರಿಕೆ, ಆರೋಗ್ಯ ವೃದ್ಧಿ ಮತ್ತು ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚವು ನಿಮಗೆ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ನೀಡಲಿದೆ.",
    hi: "ग्रहों का प्रतिकूल प्रभाव शांत होगा और लंबे समय से अटके हुए कार्य गति पकड़ेंगे। आर्थिक स्थिरता, उत्तम स्वास्थ्य और ईश्वर की कृपा से जीवन में आत्मविश्वास बढ़ेगा।",
    en: "Adverse planetary influences harmonize, helping long-stuck tasks and delayed opportunities move forward smoothly. Financial stability, vitality, and divine peace will be restored.",
    te: "గ్రహాల ప్రతికూల ప్రభావం తొలగి, చాలా కాలంగా నిలిచిపోయిన పనులు వేగవంతమవుతాయి. ఆర్థిక స్థిరత్వం, ఆరోగ్యం మరియు ఆత్మవిశ్వాసం పెరుగుతాయి.",
    ta: "கிரகங்களின் பாதகமான தாக்கங்கள் நீங்கி, நீண்ட நாட்களாக தேங்கிக்கிடந்த பணிகள் விரைந்து முடியும். பொருளாதார நிலை உயர்ந்து மன அமைதி கிட்டும்."
  };

  const matched = improvements[doshaId];
  if (matched && matched[lang]) return matched[lang];
  return defaultImprovement[lang] || defaultImprovement.kn;
}

export const KundliDoshaPdfTemplate: React.FC<KundliDoshaPdfTemplateProps> = ({
  id = "kundli-doshas-pdf-container",
  report,
  lang = "kn",
  qrCodeDataUrl
}) => {
  const code: SupportedLanguage = (["kn", "hi", "te", "ta", "en"].includes(lang) ? lang : "kn") as SupportedLanguage;
  const t = PDF_TEXT[code] || PDF_TEXT.kn;
  const snip = LOCALIZED_SNIPPETS[code] || LOCALIZED_SNIPPETS.en;

  const { devoteeInfo, doshas, gandantaraAndBhaya, summary } = report;
  const activeDoshas = (doshas || []).filter((d) => d.isDetected);
  const isPitruActive = activeDoshas.some((d) => d.id === "pitru_dosha");
  const ageStageRemedies = getAgeStageRemedies(devoteeInfo.ageStageKey || "gruhastha", code, isPitruActive);
  const gandantaras = gandantaraAndBhaya?.activeGandantaras || [];
  const fears = gandantaraAndBhaya?.detectedFears || [];

  // Scannable Verification QR Code State
  const [internalQr, setInternalQr] = useState<string>(qrCodeDataUrl || "");

  useEffect(() => {
    if (qrCodeDataUrl) {
      setInternalQr(qrCodeDataUrl);
      return;
    }
    // In Node / Vitest test runner environments, skip background async canvas rendering to prevent post-teardown state updates
    if (typeof window === "undefined" || (typeof process !== "undefined" && process.env?.NODE_ENV === "test")) {
      return;
    }
    let isMounted = true;
    try {
      const verifyUrl = `https://baggonapanchanga.web.app/daily?action=dosha_verify&devotee=${encodeURIComponent(
        devoteeInfo.name || "Devotee"
      )}&priestPhone=9972339362&lang=${code}`;

      QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 260,
        color: {
          dark: "#78350F", // Royal deep gold/amber
          light: "#FFFFFF"
        }
      })
        .then((url) => {
          if (isMounted && typeof window !== "undefined") {
            setInternalQr(url);
          }
        })
        .catch((err) => {
          console.warn("[KundliDoshaPdfTemplate] QR Code generation fallback:", err);
        });
    } catch {
      // Safe fallback in non-browser or test runner
    }

    return () => {
      isMounted = false;
    };
  }, [qrCodeDataUrl, devoteeInfo.name, code]);

  // 2-PAGE STRICT STRUCTURING FOR FULL A4 SHEET UTILIZATION:
  // Page 1: Devotee Profile Matrix, Karmic Assessment Summary, Age Priority Directive & Top 2 Active Doshas (or Chart Fortitude).
  // Page 2: Secondary Doshas (Doshas 3+), Gandantara Hazards, Innate Fears, Gokarna Sacred Remedies & Official Priest Seal.
  const page1Doshas = activeDoshas.slice(0, 2);
  const page2Doshas = activeDoshas.slice(2);

  const getLangVal = (obj: Record<string, string> | undefined, fallback: string = ""): string => {
    if (!obj) return fallback;
    return obj[code] || obj["en"] || obj["kn"] || fallback;
  };

  const getLangArr = (obj: Record<string, string[]> | undefined): string[] => {
    if (!obj) return [];
    return obj[code] || obj["en"] || obj["kn"] || [];
  };

  const fontStack =
    "'Cinzel', 'Playfair Display', 'Noto Serif Kannada', 'Noto Serif Devanagari', 'Noto Serif Telugu', 'Noto Serif Tamil', 'Noto Serif', serif, sans-serif";

  // Dedicated Ornate Gold Landline Divider Component
  const renderGoldLandlineDivider = (centerOrnament: string = "❖ ॐ ❖") => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        margin: "3px 0",
        flexShrink: 0
      }}
    >
      <div
        style={{
          flex: 1,
          height: "1.5px",
          background: "linear-gradient(90deg, transparent 0%, #E7C68A 25%, #B45309 70%, #D97706 100%)"
        }}
      />
      <span
        style={{
          fontSize: "10.5px",
          fontWeight: 900,
          color: GOLD_PRIMARY,
          letterSpacing: "normal",
          padding: "0 4px"
        }}
      >
        {centerOrnament}
      </span>
      <div
        style={{
          flex: 1,
          height: "1.5px",
          background: "linear-gradient(90deg, #D97706 0%, #B45309 30%, #E7C68A 75%, transparent 100%)"
        }}
      />
    </div>
  );

  // Common Royal Header with Lord Shiva and Lord Surya Sacred Imagery
  const renderRoyalHeader = (partNum: number, title: string, subtitle?: string) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "62px 1fr 62px",
        gap: "12px",
        alignItems: "center",
        background: "linear-gradient(135deg, #451A03 0%, #78350F 45%, #92400E 75%, #451A03 100%)",
        borderRadius: "12px",
        padding: "8px 14px",
        color: "#FFFFFF",
        border: `2px solid ${GOLD_BORDER}`,
        boxShadow: "0 4px 12px rgba(120, 53, 15, 0.25)",
        flexShrink: 0
      }}
    >
      {/* Left Deity Medallion: Lord Shiva Mahabaleshwara Atmalinga */}
      <div style={{ textAlign: "center" }}>
        <img
          src="/daily_posters/poster_1_shiva.jpg"
          alt="Lord Shiva Mahabaleshwara Atmalinga"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "2.5px solid #FDE68A",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
            objectFit: "cover",
            backgroundColor: "#FEF3C7",
            display: "inline-block"
          }}
        />
        <div style={{ fontSize: "8px", fontWeight: 900, color: "#FDE68A", marginTop: "2px", letterSpacing: "normal" }}>
          {snip.shivaMedallion}
        </div>
      </div>

      {/* Center Temple Title & Sanskrit Invocation */}
      <div style={{ textAlign: "center", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            borderBottom: "1px solid rgba(254, 243, 199, 0.35)",
            paddingBottom: "3px",
            marginBottom: "3px"
          }}
        >
          <div style={{ fontSize: "11.5px", color: "#FDE68A", fontWeight: 800, letterSpacing: "normal" }}>
            {t.templeBanner}
          </div>
          <div
            style={{
              fontSize: "9.5px",
              fontWeight: 900,
              color: GOLD_DARK,
              backgroundColor: "#FEF3C7",
              padding: "1px 8px",
              borderRadius: 6,
              border: `1px solid ${GOLD_LIGHT}`
            }}
          >
            {partNum === 1 ? snip.part1 : snip.part2}
          </div>
        </div>
        <div
          style={{
            fontSize: "14.5px",
            fontWeight: 900,
            color: "#FFFFFF",
            marginTop: "1px",
            letterSpacing: "normal",
            lineHeight: 1.3
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: "10.5px",
              color: "#FEF08A",
              fontStyle: "italic",
              marginTop: "2px",
              letterSpacing: "normal",
              lineHeight: 1.35
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Right Deity Medallion: Lord Surya Bhagavan (Vitality & All-Protective Graha Raja) */}
      <div style={{ textAlign: "center" }}>
        <img
          src="/daily_posters/poster_0_surya.jpg"
          alt="Lord Surya Bhagavan Graha Raja"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "2.5px solid #FDE68A",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
            objectFit: "cover",
            backgroundColor: "#FEF3C7",
            display: "inline-block"
          }}
        />
        <div style={{ fontSize: "8px", fontWeight: 900, color: "#FDE68A", marginTop: "2px", letterSpacing: "normal" }}>
          {snip.suryaMedallion}
        </div>
      </div>
    </div>
  );

  return (
    <div
      id={id}
      style={{
        width: "900px",
        fontFamily: fontStack,
        color: INK_DEEP,
        WebkitFontSmoothing: "antialiased",
        letterSpacing: "normal",
        lineHeight: 1.55,
        wordBreak: "break-word",
        overflowWrap: "break-word",
        backgroundColor: PARCHMENT_BG
      }}
    >
      {/* ====================================================================== */}
      {/* PAGE 1: DEVOTEE PROFILE, AGE DIRECTIVE & PRIMARY ACTIVE KUNDLI DOSHAS  */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          height: "1273px",
          minHeight: "1273px",
          maxHeight: "1273px",
          padding: "16px 20px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          backgroundColor: PARCHMENT_BG,
          color: INK_DEEP,
          fontFamily: fontStack
        }}
      >
        {/* Subtle Sacred Sri Yantra / Atma Linga Watermark Overlay */}
        <svg
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            transform: "translate(-50%, -50%)",
            width: "520px",
            height: "520px",
            opacity: 0.035,
            pointerEvents: "none",
            zIndex: 0
          }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="95" stroke="#B45309" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="86" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="76" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,20 170,140 30,140" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,180 30,60 170,60" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,32 158,132 42,132" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,168 42,68 158,68" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,48 145,124 55,124" stroke="#78350F" strokeWidth="1" />
          <polygon points="100,152 55,76 145,76" stroke="#78350F" strokeWidth="1" />
          <circle cx="100" cy="100" r="24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="6" fill="#B45309" />
        </svg>

        {/* Ornate Gold Landline Border Frame with Double Lines & Corner Florets */}
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `3.5px double ${GOLD_BORDER}`,
            outline: `1.5px dashed rgba(217, 119, 6, 0.45)`,
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "12px 16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEFAF0 50%, #FFFDF8 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            position: "relative",
            zIndex: 1
          }}
        >
          {/* 4 Corner Florets */}
          <div style={{ position: "absolute", top: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", top: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>

          {/* Header Banner with Lord Shiva and Lord Surya Sacred Medallions */}
          {renderRoyalHeader(1, t.mainTitle, t.shloka)}

          {renderGoldLandlineDivider(snip.divNative)}

          {/* Devotee Info Matrix & Karmic Assessment Grid */}
          <div
            style={{
              backgroundColor: CARD_BG,
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "10px",
              padding: "8px 12px",
              boxShadow: "0 2px 8px rgba(180, 83, 9, 0.07)",
              flexShrink: 0
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1.1fr 1.1fr 1.15fr", gap: "8px 12px", fontSize: "11px", lineHeight: 1.5 }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 800, color: GOLD_DARK }}>👤 {t.nativeDetails}:</span>{" "}
                <span style={{ fontWeight: 900, color: INK_DEEP, fontSize: "12.5px" }}>{devoteeInfo.name}</span>
                <div style={{ fontSize: "10px", color: INK_MUTED, marginTop: "2px", lineHeight: 1.4 }}>
                  📅 {devoteeInfo.birthDate} • {devoteeInfo.birthTime}
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 800, color: GOLD_DARK }}>🏛️ {t.lagnaLabel}</span>{" "}
                <span style={{ fontWeight: 800, color: INK_DEEP }}>
                  {devoteeInfo.lagnaRashiRecord?.[code] || devoteeInfo.lagnaRashi}
                </span>
                <div style={{ fontSize: "10px", color: INK_MUTED, marginTop: "2px", lineHeight: 1.4 }}>
                  🌙 {t.rashiLabel} {devoteeInfo.moonRashiRecord?.[code] || devoteeInfo.moonRashi}
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 800, color: GOLD_DARK }}>⭐ {t.nakshatraLabel}</span>{" "}
                <span style={{ fontWeight: 800, color: INK_DEEP }}>
                  {devoteeInfo.nakshatraRecord?.[code] || devoteeInfo.nakshatra} ({devoteeInfo.pada})
                </span>
                <div style={{ fontSize: "10px", color: INK_MUTED, marginTop: "2px", lineHeight: 1.4 }}>
                  ⏳ {t.dashaLabel} {devoteeInfo.currentDashaRecord?.[code] || devoteeInfo.currentDashaStr}
                </div>
              </div>

              <div style={{ backgroundColor: PANEL_WARM, border: `1.5px solid ${GOLD_BORDER}`, borderRadius: "8px", padding: "4px 8px", textAlign: "center", minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "11.5px", lineHeight: 1.35 }}>
                  ⭐ {t.currentAgeLabel} {devoteeInfo.currentAge || devoteeInfo.devoteeAge} {snip.yearsUnit}
                </div>
                <div style={{ fontSize: "10px", fontWeight: 800, color: GOLD_PRIMARY, marginTop: "1px", lineHeight: 1.35 }}>
                  🔥 {activeDoshas.length} {t.activeDoshasCountLabel} ({devoteeInfo.ageStageNameRecord?.[code] || devoteeInfo.ageStageKey})
                </div>
              </div>
            </div>

            {/* Karmic Index Indicator Bar */}
            <div style={{ marginTop: "6px", paddingTop: "5px", borderTop: `1px dashed ${GOLD_LIGHT}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10.5px", lineHeight: 1.4 }}>
              <div style={{ display: "flex", gap: "12px", color: INK_MUTED, fontWeight: 700 }}>
                <span>📋 {snip.evaluated} <strong style={{ color: INK_DEEP }}>{summary?.totalEvaluated || 12}</strong></span>
                <span>⚡ {snip.critical} <strong style={{ color: "#B91C1C" }}>{summary?.criticalCount || 0}</strong></span>
                <span>⚠️ {snip.moderate} <strong style={{ color: GOLD_PRIMARY }}>{(summary?.highCount || 0) + (summary?.moderateCount || 0)}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: 800, color: GOLD_DARK }}>{snip.karmicVulnerability}</span>
                <span style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "11.5px", backgroundColor: PANEL_WARM, padding: "2px 8px", borderRadius: "5px", border: `1px solid ${GOLD_BORDER}` }}>
                  {summary?.karmicIndexScore || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Age-Adaptive Priority Strategy Card */}
          <div
            style={{
              backgroundColor: CARD_BG,
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "10px",
              padding: "7px 12px",
              boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)",
              flexShrink: 0
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <div style={{ fontSize: "12px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.35 }}>
                {t.ageStrategyHeading} ({devoteeInfo.ageStageNameRecord?.[code] || snip.agePrefix + (devoteeInfo.currentAge || devoteeInfo.devoteeAge)})
              </div>
              <div style={{ fontSize: "9.5px", background: `linear-gradient(135deg, ${GOLD_DARK} 0%, ${GOLD_PRIMARY} 100%)`, color: "#FFFFFF", padding: "2px 9px", borderRadius: "7px", fontWeight: 800, border: `1px solid ${GOLD_BORDER}`, letterSpacing: "normal", flexShrink: 0 }}>
                ⚡ {t.agePriorityBadgeLabel}
              </div>
            </div>
            <div style={{ fontSize: "10.5px", color: INK_DEEP, fontWeight: 700, marginTop: "3px", lineHeight: 1.45 }}>
              {getLangVal(devoteeInfo.currentAgeFocusSummary, snip.ageFocusFallback)}
            </div>
            <div style={{ fontSize: "9.5px", color: INK_MUTED, marginTop: "2px", fontStyle: "italic", lineHeight: 1.35 }}>
              {t.ageStrategyNotice}
            </div>
          </div>

          {renderGoldLandlineDivider(snip.divPrimaryDosha)}

          {/* Page 1 Primary Active Doshas (Up to 2 Major Doshas in Full Depth) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "9px", flex: 1, minHeight: 0, justifyContent: "space-around" }}>
            {page1Doshas.length === 0 ? (
              <div
                style={{
                  backgroundColor: CARD_BG,
                  border: `2px dashed ${GOLD_BORDER}`,
                  borderRadius: "12px",
                  padding: "26px 20px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "36px" }}>🕊️</div>
                <div style={{ fontSize: "17px", fontWeight: 900, color: GOLD_DARK, marginTop: "6px", lineHeight: 1.4 }}>
                  {t.noDoshaTitle}
                </div>
                <div style={{ fontSize: "12px", color: INK_MUTED, marginTop: "6px", lineHeight: 1.55, maxWidth: "680px", margin: "6px auto 0" }}>
                  {t.noDoshaDesc}
                </div>
              </div>
            ) : (
              page1Doshas.map((dosha) => {
                const isPitru = dosha.id === "pitru_dosha";
                const isKuja = dosha.id === "kuja_dosha";
                const isSarpa = dosha.id === "kala_sarpa_dosha";
                const isCompleted = dosha.shantiStatus === "completed";
                const priorityBadgeText = getLangVal(dosha.agePriorityBadge, `${snip.priorityPrefix}${dosha.agePriorityRank || 1}`);

                return (
                  <div
                    key={dosha.id}
                    style={{
                      backgroundColor: CARD_BG,
                      border: `1.5px solid ${GOLD_BORDER}`,
                      borderRadius: "10px",
                      padding: "8px 12px",
                      boxShadow: "0 2px 7px rgba(180, 83, 9, 0.06)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px"
                    }}
                  >
                    {isPitru && (
                      <div
                        style={{
                          background: "linear-gradient(90deg, #78350F 0%, #B45309 100%)",
                          color: "#FEF9E7",
                          fontSize: "9.5px",
                          fontWeight: 900,
                          padding: "3px 10px",
                          borderRadius: "6px",
                          letterSpacing: "normal",
                          lineHeight: 1.4,
                          border: `1px solid ${GOLD_LIGHT}`
                        }}
                      >
                        {snip.pitruBadge}
                      </div>
                    )}

                    {/* Header Row: Title on Left, Unclipped Badges on Right */}
                    <div
                      style={{
                        background: "linear-gradient(90deg, #FAF7F2 0%, #FFFFFF 100%)",
                        border: `1.5px solid ${GOLD_LIGHT}`,
                        borderRadius: "8px",
                        padding: "6px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "18px", flexShrink: 0 }}>
                          {isPitru ? "🪔" : isKuja ? "⚔️" : isSarpa ? "🐍" : "🪐"}
                        </span>
                        <span style={{ fontSize: "14.5px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.3 }}>
                          {getLangVal(dosha.name)}
                        </span>
                        {dosha.technicalDetail?.scripturalReference && (
                          <span style={{ fontSize: "9.5px", color: INK_MUTED, fontWeight: 700 }}>
                            ({dosha.technicalDetail.scripturalReference})
                          </span>
                        )}
                      </div>

                      {/* Right: Dedicated Unclipped Badges Group */}
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                        <span
                          style={{
                            background: dosha.severity === "critical" ? "#FEF2F2" : "#FFFBEB",
                            border: `1px solid ${dosha.severity === "critical" ? "#FCA5A5" : "#FCD34D"}`,
                            color: dosha.severity === "critical" ? "#991B1B" : "#92400E",
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "3px 9px",
                            borderRadius: "5px",
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            lineHeight: 1.1,
                            height: "fit-content"
                          }}
                        >
                          {getSeverityLabel(dosha.severity, code)}
                        </span>
                        {priorityBadgeText && (
                          <span
                            style={{
                              background: `linear-gradient(135deg, ${GOLD_PRIMARY} 0%, ${GOLD_DARK} 100%)`,
                              color: "#FFFFFF",
                              fontSize: "10px",
                              fontWeight: 800,
                              padding: "3px 9px",
                              borderRadius: "5px",
                              border: `1px solid ${GOLD_BORDER}`,
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              lineHeight: 1.1,
                              height: "fit-content"
                            }}
                          >
                            {priorityBadgeText.replace(/^⚡\s*/, "⚡ ")}
                          </span>
                        )}
                        <span
                          style={{
                            background: isCompleted ? "#F0FDF4" : "#FEF3C7",
                            border: `1.5px solid ${isCompleted ? "#86EFAC" : GOLD_BORDER}`,
                            color: isCompleted ? "#166534" : GOLD_DARK,
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "3px 9px",
                            borderRadius: "5px",
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            lineHeight: 1.1,
                            height: "fit-content"
                          }}
                        >
                          {getLangVal(dosha.statusBadge)}
                        </span>
                      </div>
                    </div>

                    {/* Age Priority Reason if present */}
                    {dosha.agePriorityReason && (
                      <div style={{ fontSize: "9.5px", color: INK_MUTED, fontStyle: "italic", lineHeight: 1.35, padding: "0 2px" }}>
                        ({getLangVal(dosha.agePriorityReason)})
                      </div>
                    )}

                    {/* Immediate Action Notice */}
                    {dosha.immediateActionRequired && (
                      <div
                        style={{
                          backgroundColor: PANEL_ACCENT,
                          border: `1.5px solid ${GOLD_BORDER}`,
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "9.5px",
                          lineHeight: 1.4
                        }}
                      >
                        <span style={{ fontWeight: 900, color: GOLD_DARK }}>{t.immediateActionLabel} </span>
                        <span style={{ fontWeight: 700, color: INK_DEEP }}>
                          {stripDuplicatePrefix(getLangVal(dosha.immediateActionRequired), [
                            "🎯 ಮೊದಲು ಮಾಡಬೇಕಾದ ಕರ್ತವ್ಯ:",
                            "🎯 Immediate Priority Action:",
                            "🎯 प्रथम कर्तव्य:",
                            "🎯 మొదట చేయవలసిన కర్తవ్యం:",
                            "🎯 முதலில் செய்ய வேண்டிய கடமை:"
                          ])}
                        </span>
                      </div>
                    )}

                    {/* 4 PILLARS FOR THE DEVOTEE */}
                    {/* Pillar 1 & 2: Root Cause & Struggles in Life (2-Column Grid) */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: "7px", fontSize: "10px", lineHeight: 1.5 }}>
                      <div style={{ backgroundColor: CARD_BG, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "6px", padding: "5px 8px", minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: GOLD_DARK, lineHeight: 1.35 }}>🔍 {t.technicalRootLabel}</div>
                        <div style={{ color: INK_DEEP, marginTop: "2px", lineHeight: 1.45 }}>
                          {cleanDegreesFromText(getLangVal(dosha.technicalWhy))}
                        </div>
                      </div>

                      <div style={{ backgroundColor: PANEL_WARM, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "6px", padding: "5px 8px", minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: GOLD_DARK, lineHeight: 1.35 }}>⚡ {t.realLifeImpactLabel}</div>
                        <div style={{ color: INK_DEEP, marginTop: "2px", lineHeight: 1.45 }}>
                          {getLangVal(dosha.currentLifeProblems) || getLangVal(dosha.lifeImpact)}
                        </div>
                      </div>
                    </div>

                    {/* Dasha Resonance if available */}
                    {dosha.dashaResonance && (
                      <div style={{ backgroundColor: CARD_BG, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "5px", padding: "2px 7px", fontSize: "9px", color: INK_DEEP, lineHeight: 1.35 }}>
                        <strong style={{ color: GOLD_DARK }}>⏳ {t.dashaResonanceLabel} </strong>
                        <span>{getLangVal(dosha.dashaResonance)}</span>
                      </div>
                    )}

                    {/* Pillar 3: Prescribed Remedy & Sacred Gokarna Seva */}
                    <div style={{ background: "linear-gradient(135deg, #FEF9E7 0%, #FFFDF9 100%)", border: `1.5px solid ${GOLD_BORDER}`, borderRadius: "7px", padding: "5px 9px", fontSize: "9.5px", lineHeight: 1.45 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "7px" }}>
                        <div>
                          <div style={{ fontWeight: 900, color: GOLD_DARK, lineHeight: 1.35 }}>🪔 {t.pariharaHeading}</div>
                          <div style={{ color: INK_DEEP, fontWeight: 700, marginTop: "2px", lineHeight: 1.4 }}>
                            {getLangVal(dosha.recommendedPooja)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, color: GOLD_DARK, lineHeight: 1.35 }}>📿 {t.mantraLabel}</div>
                          <div style={{ color: INK_DEEP, marginTop: "2px", lineHeight: 1.4 }}>
                            {getLangArr(dosha.remedies).slice(0, 2).join(" • ")}
                          </div>
                        </div>
                      </div>

                      {/* Subconscious Fear */}
                      {dosha.subconsciousFear && (
                        <div style={{ marginTop: "3px", paddingTop: "2px", borderTop: `1px dashed ${GOLD_LIGHT}`, fontSize: "9px", color: INK_DEEP, lineHeight: 1.35 }}>
                          <strong style={{ color: GOLD_DARK }}>🧠 {snip.subconsciousFear} </strong>
                          <span>{getLangVal(dosha.subconsciousFear)}</span>
                        </div>
                      )}

                      {/* Completed Narration vs Conditional Guidance */}
                      {isCompleted ? (
                        <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "5px", padding: "2px 6px", marginTop: "3px", fontSize: "9px", color: "#166534", lineHeight: 1.35 }}>
                          <strong>✓ {snip.shantiCompleted} </strong>
                          <span>{getLangVal(dosha.alreadyDoneNarration)}</span>
                        </div>
                      ) : (
                        dosha.conditionalGuidance && (
                          <div style={{ backgroundColor: CARD_BG, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "5px", padding: "2px 6px", marginTop: "3px", fontSize: "9px", color: INK_DEEP, lineHeight: 1.35 }}>
                            <strong style={{ color: GOLD_DARK }}>💡 {snip.guidance} </strong>
                            <span>
                              {stripDuplicatePrefix(getLangVal(dosha.conditionalGuidance), [
                                "ವಿಶೇಷ ಮಾರ್ಗದರ್ಶನ:",
                                "Special Guidance:",
                                "विशेष मार्गदर्शन:",
                                "ప్రత్యేక మార్గదర్శకత్వం:",
                                "சிறப்பு வழிகாட்டுதல்:"
                              ])}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Pillar 4: Expected Life Improvement & Stuck Work Moving Forward */}
                    <div
                      style={{
                        backgroundColor: "#FEFAF0",
                        border: `1.5px solid ${GOLD_PRIMARY}`,
                        borderRadius: "7px",
                        padding: "4px 8px",
                        fontSize: "9.5px",
                        lineHeight: 1.45
                      }}
                    >
                      <div style={{ fontWeight: 900, color: GOLD_DARK, display: "flex", alignItems: "center", gap: "5px" }}>
                        <span>{t.expectedImprovementHeading || "✨ ಪರಿಹಾರದ ನಂತರದ ಸುಧಾರಣೆ & ಶುಭ ಫಲಗಳು:"}</span>
                      </div>
                      <div style={{ color: INK_DEEP, fontWeight: 600, marginTop: "2px", lineHeight: 1.45 }}>
                        {getExpectedImprovementAfterParihara(dosha.id, code)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* If only 1 dosha is present on Page 1, render Natal Chart Fortitude & Planetary Protection to fully utilize A4 sheet */}
            {page1Doshas.length === 1 && (
              <div
                style={{
                  backgroundColor: CARD_BG,
                  border: `1.5px solid ${GOLD_BORDER}`,
                  borderRadius: "10px",
                  padding: "9px 12px",
                  boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 900, color: GOLD_DARK, borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "3px", lineHeight: 1.35 }}>
                  🪐 {t.chartBalanceHeading}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginTop: "6px", fontSize: "10px", lineHeight: 1.4 }}>
                  <div style={{ backgroundColor: PANEL_WARM, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "6px", padding: "5px 8px", minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: GOLD_DARK, lineHeight: 1.3 }}>🏛️ {t.lagnaLabel} {devoteeInfo.lagnaRashiRecord?.[code] || devoteeInfo.lagnaRashi}</div>
                    <div style={{ color: INK_DEEP, marginTop: "2px", lineHeight: 1.4 }}>
                      {snip.lagnaFortitude}
                    </div>
                  </div>
                  <div style={{ backgroundColor: PANEL_WARM, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "6px", padding: "5px 8px", minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: GOLD_DARK, lineHeight: 1.3 }}>🌙 {t.rashiLabel} {devoteeInfo.moonRashiRecord?.[code] || devoteeInfo.moonRashi}</div>
                    <div style={{ color: INK_DEEP, marginTop: "2px", lineHeight: 1.4 }}>
                      {snip.chandraFortitude}
                    </div>
                  </div>
                  <div style={{ backgroundColor: PANEL_WARM, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "6px", padding: "5px 8px", minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: GOLD_DARK, lineHeight: 1.3 }}>☀️ {snip.suryaFortitudeTitle}</div>
                    <div style={{ color: INK_DEEP, marginTop: "2px", lineHeight: 1.4 }}>
                      {snip.suryaFortitudeDesc}
                    </div>
                  </div>
                  <div style={{ backgroundColor: PANEL_WARM, border: `1px solid ${GOLD_LIGHT}`, borderRadius: "6px", padding: "5px 8px", minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: GOLD_DARK, lineHeight: 1.3 }}>🪔 {snip.trikonaFortitudeTitle}</div>
                    <div style={{ color: INK_DEEP, marginTop: "2px", lineHeight: 1.4 }}>
                      {snip.trikonaFortitudeDesc}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Page 1 Footer with Gold Landline Border */}
          <div
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: GOLD_DARK,
              fontWeight: 800,
              borderTop: `1.5px dashed ${GOLD_LIGHT}`,
              paddingTop: "5px",
              flexShrink: 0,
              lineHeight: 1.4,
              letterSpacing: "normal"
            }}
          >
            {t.page1Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 2: GANDANTARA HAZARDS, INNATE FEARS, GOKARNA SEVAS & PRIEST SEAL   */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          height: "1273px",
          minHeight: "1273px",
          maxHeight: "1273px",
          padding: "16px 20px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          backgroundColor: PARCHMENT_BG,
          color: INK_DEEP,
          fontFamily: fontStack
        }}
      >
        {/* Subtle Sacred Sri Yantra / Atma Linga Watermark Overlay */}
        <svg
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            transform: "translate(-50%, -50%)",
            width: "520px",
            height: "520px",
            opacity: 0.035,
            pointerEvents: "none",
            zIndex: 0
          }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="95" stroke="#B45309" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="86" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="76" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,20 170,140 30,140" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,180 30,60 170,60" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,32 158,132 42,132" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,168 42,68 158,68" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,48 145,124 55,124" stroke="#78350F" strokeWidth="1" />
          <polygon points="100,152 55,76 145,76" stroke="#78350F" strokeWidth="1" />
          <circle cx="100" cy="100" r="24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="6" fill="#B45309" />
        </svg>

        {/* Ornate Gold Landline Border Frame with Double Lines & Corner Florets */}
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `3.5px double ${GOLD_BORDER}`,
            outline: `1.5px dashed rgba(217, 119, 6, 0.45)`,
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "12px 16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEFAF0 50%, #FFFDF8 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            position: "relative",
            zIndex: 1
          }}
        >
          {/* 4 Corner Florets */}
          <div style={{ position: "absolute", top: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", top: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>

          {/* Page 2 Header with Sacred Imagery */}
          {renderRoyalHeader(2, t.page2Title, t.page2Shloka)}

          {renderGoldLandlineDivider(snip.divSecondaryDosha)}

          {/* Top Section: Secondary Doshas (if 3+ active doshas) OR Planetary Harmony Shield */}
          {page2Doshas.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
              {page2Doshas.slice(0, 2).map((dosha) => {
                const statusBadgeText = getLangVal(dosha.statusBadge);
                const isCompleted = dosha.shantiStatus === "completed";
                const priorityBadgeText = getLangVal(dosha.agePriorityBadge, `${snip.priorityPrefix}${dosha.agePriorityRank || 1}`);

                return (
                  <div
                    key={dosha.id}
                    style={{
                      backgroundColor: CARD_BG,
                      border: `1.5px solid ${GOLD_BORDER}`,
                      borderRadius: "9px",
                      padding: "7px 11px",
                      boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "3.5px"
                    }}
                  >
                    {/* Header Row: Title on Left, Unclipped Badges on Right */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: `1.5px solid ${GOLD_LIGHT}`,
                        paddingBottom: "4px",
                        gap: "10px"
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "15px", flexShrink: 0 }}>⚡</span>
                          <span style={{ fontSize: "13px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.3 }}>
                            {getLangVal(dosha.name)}
                          </span>
                          {dosha.technicalDetail?.scripturalReference && (
                            <span style={{ fontSize: "9px", color: INK_MUTED, fontWeight: 700 }}>
                              ({dosha.technicalDetail.scripturalReference})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Dedicated Unclipped Badges Group */}
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                        <span
                          style={{
                            background: dosha.severity === "critical" ? "#FEF2F2" : "#FFFBEB",
                            border: `1px solid ${dosha.severity === "critical" ? "#FCA5A5" : "#FCD34D"}`,
                            color: dosha.severity === "critical" ? "#991B1B" : "#92400E",
                            fontSize: "9px",
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: "4px",
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            lineHeight: 1.1,
                            height: "fit-content"
                          }}
                        >
                          {getSeverityLabel(dosha.severity, code)}
                        </span>
                        {priorityBadgeText && (
                          <span
                            style={{
                              background: `linear-gradient(135deg, ${GOLD_PRIMARY} 0%, ${GOLD_DARK} 100%)`,
                              color: "#FFFFFF",
                              fontSize: "9px",
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: "4px",
                              border: `1px solid ${GOLD_BORDER}`,
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              lineHeight: 1.1,
                              height: "fit-content"
                            }}
                          >
                            {priorityBadgeText.replace(/^⚡\s*/, "⚡ ")}
                          </span>
                        )}
                        <span
                          style={{
                            background: isCompleted ? "#F0FDF4" : "#FEF3C7",
                            border: `1.5px solid ${isCompleted ? "#86EFAC" : GOLD_BORDER}`,
                            color: isCompleted ? "#166534" : GOLD_DARK,
                            fontSize: "9px",
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            lineHeight: 1.1,
                            height: "fit-content"
                          }}
                        >
                          {statusBadgeText}
                        </span>
                      </div>
                    </div>

                    {/* Subconscious Fear */}
                    {dosha.subconsciousFear && (
                      <div
                        style={{
                          fontSize: "9px",
                          color: INK_DEEP,
                          backgroundColor: PANEL_WARM,
                          borderLeft: `3px solid ${GOLD_PRIMARY}`,
                          border: `1px solid ${GOLD_LIGHT}`,
                          borderRadius: "5px",
                          padding: "3px 6px",
                          lineHeight: 1.4
                        }}
                      >
                        <strong style={{ color: GOLD_DARK }}>🧠 {snip.subconsciousFearShort} </strong>
                        <span>{getLangVal(dosha.subconsciousFear)}</span>
                      </div>
                    )}

                    {/* Immediate Action Required */}
                    {dosha.immediateActionRequired && (
                      <div
                        style={{
                          backgroundColor: PANEL_ACCENT,
                          border: `1.5px solid ${GOLD_BORDER}`,
                          borderRadius: "6px",
                          padding: "4px 7px",
                          lineHeight: 1.4
                        }}
                      >
                        <span style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "9.5px" }}>{t.immediateActionLabel} </span>
                        <span style={{ color: INK_DEEP, fontWeight: 700, fontSize: "9.5px" }}>
                          {stripDuplicatePrefix(getLangVal(dosha.immediateActionRequired), [
                            "🎯 ಮೊದಲು ಮಾಡಬೇಕಾದ ಕರ್ತವ್ಯ:",
                            "🎯 Immediate Priority Action:",
                            "🎯 प्रथम कर्तव्य:",
                            "🎯 మొదట చేయవలసిన కర్తవ్యం:",
                            "🎯 முதலில் செய்ய வேண்டிய கடமை:"
                          ])}
                        </span>
                      </div>
                    )}

                    {/* Parihara & Mantra 2-Column Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr",
                        gap: "7px",
                        fontSize: "9px",
                        backgroundColor: CARD_BG,
                        border: `1px solid ${GOLD_LIGHT}`,
                        borderRadius: "5px",
                        padding: "3px 6px",
                        lineHeight: 1.4
                      }}
                    >
                      <div>
                        <strong style={{ color: GOLD_DARK }}>🪔 {t.pariharaHeading} </strong>
                        <span style={{ color: INK_DEEP, fontWeight: 700 }}>{getLangVal(dosha.recommendedPooja)}</span>
                      </div>
                      <div>
                        <strong style={{ color: GOLD_DARK }}>📿 {t.mantraLabel} </strong>
                        <span style={{ color: INK_DEEP }}>{getLangArr(dosha.remedies).slice(0, 2).join(" • ")}</span>
                      </div>
                    </div>

                    {/* Shanti Completed vs Special Guidance */}
                    {isCompleted ? (
                      <div
                        style={{
                          backgroundColor: "#F0FDF4",
                          border: "1px solid #86EFAC",
                          borderRadius: "5px",
                          padding: "3px 6px",
                          fontSize: "8.5px",
                          color: "#166534",
                          lineHeight: 1.35
                        }}
                      >
                        <strong>✓ {snip.shantiPrep} </strong>
                        <span>{getLangVal(dosha.alreadyDoneNarration)}</span>
                      </div>
                    ) : (
                      dosha.conditionalGuidance && (
                        <div
                          style={{
                            backgroundColor: CARD_BG,
                            border: `1px solid ${GOLD_LIGHT}`,
                            borderRadius: "5px",
                            padding: "3px 6px",
                            fontSize: "8.5px",
                            color: INK_DEEP,
                            lineHeight: 1.35
                          }}
                        >
                          <strong style={{ color: GOLD_DARK }}>💡 {snip.guidanceShort} </strong>
                          <span>
                            {stripDuplicatePrefix(getLangVal(dosha.conditionalGuidance), [
                              "ವಿಶೇಷ ಮಾರ್ಗದರ್ಶನ:",
                              "Special Guidance:",
                              "विशेष मार्गदर्शन:",
                              "ప్రత్యేక మార్గదర్శకత్వం:",
                              "சிறப்பு வழிகாட்டுதல்:"
                            ])}
                          </span>
                        </div>
                      )
                    )}

                    {/* Pillar 4: Expected Life Improvement & Stuck Work Moving Forward */}
                    <div
                      style={{
                        backgroundColor: "#FEFAF0",
                        border: `1.5px solid ${GOLD_PRIMARY}`,
                        borderRadius: "5px",
                        padding: "3px 6px",
                        fontSize: "8.5px",
                        lineHeight: 1.35
                      }}
                    >
                      <strong style={{ color: GOLD_DARK }}>{t.expectedImprovementHeading || "✨ ಪರಿಹಾರದ ನಂತರದ ಸುಧಾರಣೆ & ಶುಭ ಫಲಗಳು:"} </strong>
                      <span style={{ color: INK_DEEP, fontWeight: 600 }}>{getExpectedImprovementAfterParihara(dosha.id, code)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: CARD_BG,
                border: `1.5px solid ${GOLD_BORDER}`,
                borderRadius: "9px",
                padding: "8px 12px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)",
                flexShrink: 0
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.35 }}>
                {t.planetaryHarmonyHeading}
              </div>
              <div style={{ fontSize: "10px", color: INK_DEEP, marginTop: "2px", lineHeight: 1.45 }}>
                {t.planetaryHarmonyDesc}
              </div>
            </div>
          )}

          {renderGoldLandlineDivider("❖ ॐ ❖")}

          {/* Section: Critical Gandantara Hazards & Protective Age Windows */}
          <div
            style={{
              backgroundColor: CARD_BG,
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "10px",
              padding: "7px 11px",
              boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)",
              flexShrink: 0
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "3px", gap: "8px" }}>
              <div style={{ fontSize: "12px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.35 }}>
                {t.gandantaraHeading}
              </div>
              <div style={{ fontSize: "9.5px", color: INK_MUTED, fontWeight: 700, flexShrink: 0 }}>
                {gandantaras.filter(g => g.isCurrentlyInDangerWindow).length > 0
                  ? `${gandantaras.filter(g => g.isCurrentlyInDangerWindow).length} ${snip.hazardsActiveSuffix}`
                  : snip.allHazardSafe}
              </div>
            </div>
            <div style={{ fontSize: "9.5px", color: INK_MUTED, marginTop: "2px", fontStyle: "italic", lineHeight: 1.35 }}>
              {t.gandantaraNotice}
            </div>

            {/* Gandantara Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4.5px", marginTop: "5px" }}>
              {gandantaras.length === 0 ? (
                <div style={{ textAlign: "center", padding: "8px", color: GOLD_DARK, fontWeight: 700, fontSize: "10.5px", lineHeight: 1.4 }}>
                  ✓ {snip.noGandantaraDetected}
                </div>
              ) : (
                gandantaras.slice(0, 3).map((g) => {
                  const isDanger = g.isCurrentlyInDangerWindow;
                  return (
                    <div
                      key={g.id}
                      style={{
                        backgroundColor: isDanger ? PANEL_ACCENT : "#F0FDF4",
                        border: `1.5px solid ${isDanger ? GOLD_LIGHT : "#86EFAC"}`,
                        borderRadius: "6px",
                        padding: "5px 8px",
                        fontSize: "10px",
                        lineHeight: 1.4
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ fontWeight: 900, color: isDanger ? GOLD_DARK : "#166534", fontSize: "10.5px", lineHeight: 1.3, minWidth: 0 }}>
                          {isDanger ? "⚡" : "✓"} {getLangVal(g.name)}
                        </div>
                        <span
                          style={{
                            background: isDanger ? `linear-gradient(135deg, ${GOLD_PRIMARY} 0%, ${GOLD_DARK} 100%)` : "#DCFCE7",
                            color: isDanger ? "#FFFFFF" : "#166534",
                            fontSize: "9px",
                            fontWeight: 900,
                            padding: "2px 7px",
                            borderRadius: "5px",
                            border: `1px solid ${isDanger ? GOLD_BORDER : "#86EFAC"}`,
                            letterSpacing: "normal",
                            flexShrink: 0,
                            whiteSpace: "nowrap"
                          }}
                        >
                          {isDanger
                            ? `${t.safeAgeLimitLabel} ${g.vulnerableTillAge} ${snip.yearsTillUnit}`
                            : `✓ ${snip.safeAgePassed} (${g.vulnerableTillAge} ${snip.yearsUnit})`}
                        </span>
                      </div>

                      {isDanger ? (
                        <>
                          <div style={{ color: GOLD_DARK, fontWeight: 700, marginTop: "2px", lineHeight: 1.4 }}>
                            ⛔ {t.mandatoryPrecautionLabel} {getLangArr(g.cautionDirectives).slice(0, 2).join(" • ") || cleanDegreesFromText(getLangVal(g.technicalReason))}
                          </div>
                          <div style={{ color: INK_DEEP, fontWeight: 700, marginTop: "2px", lineHeight: 1.4 }}>
                            🛡️ {t.protectiveMantraLabel} {getLangVal(g.protectiveParihara)} • {getLangArr(g.protectiveMantras).slice(0, 1).join("")}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: "#166534", fontWeight: 700, marginTop: "2px", lineHeight: 1.4 }}>
                          ✓ {snip.safeThresholdSurpassedDesc(g.vulnerableTillAge)}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sacred Guidance Box */}
            <div
              style={{
                background: "linear-gradient(135deg, #FEF9E7 0%, #FFFDF8 100%)",
                border: `1px solid ${GOLD_LIGHT}`,
                borderRadius: "5px",
                padding: "4px 8px",
                fontSize: "9.5px",
                color: INK_DEEP,
                lineHeight: 1.4,
                marginTop: "4px"
              }}
            >
              <strong style={{ color: GOLD_DARK }}>🔱 {snip.parashariProtocol}</strong>{" "}
              <span>{snip.parashariRuleDesc}</span>
            </div>
          </div>

          {/* Section: Subconscious Innate Phobias & Fears */}
          <div
            style={{
              backgroundColor: CARD_BG,
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "10px",
              padding: "7px 11px",
              boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)",
              flexShrink: 0
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 900, color: GOLD_DARK, borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "3px", lineHeight: 1.35 }}>
              🧠 {t.fearsHeading}
            </div>
            <div style={{ fontSize: "9.5px", color: INK_MUTED, marginTop: "2px", fontStyle: "italic", lineHeight: 1.35 }}>
              {t.fearsSubheading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginTop: "5px" }}>
              {fears.slice(0, 2).map((fear) => (
                <div
                  key={fear.id}
                  style={{
                    backgroundColor: PANEL_WARM,
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: "6px",
                    padding: "5px 7px",
                    fontSize: "9.5px",
                    lineHeight: 1.4,
                    minWidth: 0
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                    <div style={{ fontWeight: 800, color: GOLD_DARK, lineHeight: 1.3, minWidth: 0 }}>
                      {fear.icon} {getLangVal(fear.name)}
                    </div>
                    <span style={{ fontSize: "8.5px", backgroundColor: CARD_BG, color: GOLD_DARK, padding: "1px 5px", borderRadius: "4px", fontWeight: 700, border: `1px solid ${GOLD_LIGHT}`, flexShrink: 0 }}>
                      {fear.severity}
                    </span>
                  </div>
                  <div style={{ color: INK_MUTED, marginTop: "2px", lineHeight: 1.35 }}>
                    <strong>{t.symptomLabel}</strong> {getLangVal(fear.psychologicalSymptom)}
                  </div>
                  <div style={{ color: INK_DEEP, fontWeight: 700, marginTop: "2px", lineHeight: 1.35 }}>
                    <strong style={{ color: GOLD_DARK }}>{t.strengtheningPracticeLabel}</strong> {getLangVal(fear.strengtheningPractice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Sacred Gokarna Mahabaleshwara Remedies tailored to Age Stage */}
          <div
            style={{
              backgroundColor: CARD_BG,
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "10px",
              padding: "7px 11px",
              boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)",
              flexShrink: 0
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 900, color: GOLD_DARK, borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "3px", lineHeight: 1.35 }}>
              🪔 {t.templeRemediesHeading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginTop: "5px", fontSize: "9.5px", lineHeight: 1.4 }}>
              {ageStageRemedies.map((remedy, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: PANEL_WARM,
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: "6px",
                    padding: "4.5px 7px",
                    minWidth: 0
                  }}
                >
                  <div style={{ fontWeight: 800, color: GOLD_DARK, lineHeight: 1.3 }}>
                    {remedy.icon} {remedy.title}
                  </div>
                  <div style={{ color: INK_DEEP, marginTop: "2px", lineHeight: 1.4 }}>
                    {remedy.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {renderGoldLandlineDivider(snip.divPriestBlessing)}

          {/* Section: Chief Priest Shreeram Pandit's Blessing, Official Temple Seal & Scannable QR Code */}
          <div
            style={{
              backgroundColor: CARD_BG,
              border: `2px solid ${GOLD_BORDER}`,
              borderRadius: "10px",
              padding: "8px 12px",
              boxShadow: "0 3px 8px rgba(180, 83, 9, 0.08)",
              flexShrink: 0
            }}
          >
            <div style={{ fontSize: "11.5px", fontWeight: 900, color: GOLD_DARK, borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "3px", marginBottom: "4px", lineHeight: 1.35 }}>
              🙏 {t.priestBlessingHeading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "72px 1fr 92px", gap: "10px", alignItems: "center" }}>
              {/* Left: Gokarna Mahabaleshwara Sacred Blessing Medallion */}
              <div style={{ textAlign: "center" }}>
                <img
                  src="/daily_posters/poster_1_shiva.jpg"
                  alt="Sri Gokarna Kshetra Atmalinga"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    border: `2.5px solid ${GOLD_BORDER}`,
                    boxShadow: "0 2px 6px rgba(180, 83, 9, 0.25)",
                    objectFit: "cover",
                    backgroundColor: "#FEF3C7",
                    display: "inline-block"
                  }}
                />
                <div style={{ fontSize: "8px", fontWeight: 900, color: GOLD_DARK, marginTop: "2px", letterSpacing: "normal" }}>
                  {snip.gokarnanathaMedallion}
                </div>
              </div>

              {/* Center: Chief Priest Info & Sanskrit Blessing */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "12.5px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.3 }}>
                  {t.priestName}
                </div>
                <div style={{ fontSize: "10px", color: INK_MUTED, fontWeight: 700, marginTop: "1px", lineHeight: 1.3 }}>
                  {t.priestTitle} · {t.priestPhone}
                </div>
                <div style={{ fontSize: "10.5px", color: GOLD_DARK, fontWeight: 800, marginTop: "2px", lineHeight: 1.45 }}>
                  {t.sanskritAshirvada}
                </div>
                <div style={{ fontSize: "9.5px", color: INK_DEEP, marginTop: "2px", lineHeight: 1.4, fontStyle: "italic" }}>
                  {t.ashirvadaMeaning}
                </div>
              </div>

              {/* Right: Live Scannable High-Resolution QR Code with Gold Frame OR Official Seal */}
              <div style={{ textAlign: "center" }}>
                {internalQr ? (
                  <div>
                    <div
                      style={{
                        width: "82px",
                        height: "82px",
                        padding: "2px",
                        backgroundColor: "#FFFFFF",
                        border: `2px solid ${GOLD_BORDER}`,
                        borderRadius: "8px",
                        boxShadow: "0 2px 6px rgba(180, 83, 9, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto"
                      }}
                    >
                      <img
                        src={internalQr}
                        alt="Baggona Panchanga Priest Verification QR"
                        style={{ width: "76px", height: "76px", objectFit: "contain" }}
                      />
                    </div>
                    <div style={{ fontSize: "7.5px", fontWeight: 900, color: GOLD_DARK, marginTop: "2px", letterSpacing: "normal" }}>
                      {t.scanToVerify}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "82px",
                      height: "82px",
                      borderRadius: "50%",
                      border: `3px double ${GOLD_BORDER}`,
                      outline: `1.5px solid ${GOLD_LIGHT}`,
                      background: "linear-gradient(135deg, #FEF9E7 0%, #FDE68A 100%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: "4px",
                      boxSizing: "border-box",
                      boxShadow: "0 2px 5px rgba(180, 83, 9, 0.15)",
                      margin: "0 auto"
                    }}
                  >
                    <div style={{ fontSize: "16px", color: GOLD_DARK }}>🔱</div>
                    <div style={{ fontSize: "8px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.2, marginTop: "1px", wordBreak: "keep-all" }}>
                      {code === "kn" ? "॥ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥" : code === "hi" ? "॥ गोकर्ण सन्निधि ॥" : code === "te" ? "॥ గోకర్ణ సన్నిధి ॥" : code === "ta" ? "॥ கோகர்ண சந்நிதி ॥" : "॥ Sri Gokarna ॥"}
                    </div>
                    <div style={{ fontSize: "7px", color: GOLD_PRIMARY, fontWeight: 800, marginTop: "1px" }}>
                      {t.officialSealLabel}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page 2 Footer with Gold Landline Border */}
          <div
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: GOLD_DARK,
              fontWeight: 800,
              borderTop: `1.5px dashed ${GOLD_LIGHT}`,
              paddingTop: "5px",
              flexShrink: 0,
              lineHeight: 1.4,
              letterSpacing: "normal"
            }}
          >
            {t.page2Footer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KundliDoshaPdfTemplate;
