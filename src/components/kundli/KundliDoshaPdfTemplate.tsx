import React from "react";
import type {
  ComprehensiveDoshaReport,
  DetectedDosha,
  DetectedGandantara,
  DetectedFear
} from "../../core/ComprehensiveDoshaEngine";

export type SupportedLanguage = "kn" | "hi" | "te" | "ta" | "en";

export interface KundliDoshaPdfTemplateProps {
  id?: string;
  report: ComprehensiveDoshaReport;
  lang?: string;
}

// 5-Language UI Localized Dictionary for 2-Page Master Dossier PDF
const PDF_TEXT: Record<SupportedLanguage, Record<string, string>> = {
  kn: {
    templeBanner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    mainTitle: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ಸಮಗ್ರ ದೋಷ ನಿರ್ಣಯ, ಗಂಡಾಂತರ & ವಯೋನುಗುಣ ಪರಿಹಾರ ಪತ್ರ",
    page2Title: "ದ್ವಿತೀಯ ಭಾಗ: ಗಂಡಾಂತರ ಸಂರಕ್ಷಣೆ, ಮನೋಭಯ ನಿವಾರಣೆ, ಗೋಕರ್ಣ ಸೇವೆಗಳು & ಆಶೀರ್ವಾದ",
    shloka: "॥ ನಮಃ ಸೂರ್ಯಾಯ ಶಾಂತಾಯ ಸರ್ವರೋಗ ನಿವಾರಿಣೇ । ಆಯುರಾರೋಗ್ಯಮೈಶ್ವರ್ಯಂ ದೇಹಿ ದೇವ ಜಗತ್ಪತೇ ॥",
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
    page1Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಅಧಿಕೃತ ದೋಷ ಪತ್ರ · ಪುಟ ೧/೨ (ಮುಂದುವರಿದಿದೆ...)",
    page2Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಅಧಿಕೃತ ದೋಷ ಪತ್ರ · ಪುಟ ೨/೨ (ಸಂಪೂರ್ಣ)"
  },
  en: {
    templeBanner: "॥ Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga Astrology ॥",
    mainTitle: "Natal Kundli Comprehensive Doshas, Hazards & Age-Adaptive Remedies",
    page2Title: "Part II: Life Hazards (Gandantara), Fears, Gokarna Temple Sevas & Blessings",
    shloka: "॥ Namah Suryaya Shantaya Sarva Roga Nivarine | Ayur Arogyam Aishwaryam Dehi Deva Jagatpate ॥",
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
    page1Footer: "Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga · Official Dosha Report · Page 1/2 (Contd...)",
    page2Footer: "Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga · Official Dosha Report · Page 2/2 (Complete)"
  },
  hi: {
    templeBanner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    mainTitle: "जन्म कुंडली आधारित समग्र दोष निर्णय, गंडांतर एवं आयु-अनुकूल परिहार पत्र",
    page2Title: "द्वितीय भाग: गंडांतर संरक्षण, मनोभय निवारण, गोकर्ण सेवा एवं आशीर्वाद",
    shloka: "॥ नमः सूर्याय शान्ताय सर्वरोग निवारिणे । आयुरारोग्यमैश्वर्यं देहि देव जगत्पते ॥",
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
    page1Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग · आधिकारिक दोष पत्र · पृष्ठ १/२ (जारी...)",
    page2Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग · आधिकारिक दोष पत्र · पृष्ठ २/२ (संपूर्ण)"
  },
  te: {
    templeBanner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    mainTitle: "జన్మ కుండలి సమగ్ర దోష నిర్ణయం, గండాతర & వయోనుగుణ పరిహార పత్రం",
    page2Title: "రెండవ భాగం: గండాతర రక్షణ, మనోభయ నివారణ, గోకర్ణ సేవలు & ఆశీర్వాదం",
    shloka: "॥ నమః సూర్యాయ శాంతాయ సర్వరోగ నివారిణే । ఆయురారోగ్యమైశ్వర్యం దేహి దేవ జగత్పతే ॥",
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
    page1Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · అధికారిక దోష పత్రం · పేజీ 1/2 (కొనసాగింపు...)",
    page2Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · అధికారిక దోష పత్రం · పేజీ 2/2 (సంపూర్ణం)"
  },
  ta: {
    templeBanner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதானம் · பக்ககோண பஞ்சாங்க ஜோதிடம் ॥",
    mainTitle: "ஜன்ம குண்டலி தோஷ ஆய்வு, கண்டாந்தரங்கள் & வயதுக்கேற்ற பரிகார அறிக்கை",
    page2Title: "இரண்டாம் பகுதி: கண்டாந்தர பாதுகாப்பு, பய நிவாரணம், கோகர்ண சேவைகள் & ஆசி",
    shloka: "॥ நமஃ சூர்யாய சாந்தாய சர்வரோக நிவாரினே । ஆயுராரோக்யமைஸ்வர்யம் தேஹி தேவ ஜகத்பதே ॥",
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
    page1Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதானம் · பக்ககோண பஞ்சாங்கம் · அதிகாரப்பூர்வ அறிக்கை · பக்கம் 1/2 (தொடர்கிறது...)",
    page2Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதானம் · பக்ககோண பஞ்சாங்கம் · அதிகாரப்பூர்வ அறிக்கை · பக்கம் 2/2 (முழுமை)"
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

export const KundliDoshaPdfTemplate: React.FC<KundliDoshaPdfTemplateProps> = ({
  id = "kundli-doshas-pdf-container",
  report,
  lang = "kn"
}) => {
  const code: SupportedLanguage = (["kn", "hi", "te", "ta", "en"].includes(lang) ? lang : "kn") as SupportedLanguage;
  const t = PDF_TEXT[code] || PDF_TEXT.kn;

  const { devoteeInfo, doshas, gandantaraAndBhaya, summary } = report;
  const activeDoshas = (doshas || []).filter((d) => d.isDetected);
  const isPitruActive = activeDoshas.some((d) => d.id === "pitru_dosha");
  const ageStageRemedies = getAgeStageRemedies(devoteeInfo.ageStageKey || "gruhastha", code, isPitruActive);
  const gandantaras = gandantaraAndBhaya?.activeGandantaras || [];
  const fears = gandantaraAndBhaya?.detectedFears || [];

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

  const fontFamily = `'Noto Sans Kannada', 'Tiro Kannada', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

  return (
    <div
      id={id}
      style={{
        width: "900px",
        fontFamily,
        color: "#261605",
        WebkitFontSmoothing: "antialiased"
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
          background: "#FFFDF7"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "3px double #B45309",
            outline: "1.5px solid #D4AF37",
            outlineOffset: "-5px",
            borderRadius: "14px",
            padding: "13px 18px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEFDF6 40%, #FFFDF8 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden"
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)",
              borderRadius: "10px",
              padding: "9px 14px",
              color: "#FFFFFF",
              border: "1.5px solid #D4AF37",
              boxShadow: "0 2px 8px rgba(180, 83, 9, 0.12)"
            }}
          >
            <div style={{ fontSize: "12px", color: "#FDE68A", fontWeight: 800, letterSpacing: "0.8px" }}>
              {t.templeBanner}
            </div>
            <div style={{ fontSize: "15.5px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px", letterSpacing: "0.5px" }}>
              {t.mainTitle}
            </div>
            <div style={{ fontSize: "10px", color: "#FEF08A", fontStyle: "italic", marginTop: "2px" }}>
              {t.shloka}
            </div>
          </div>

          {/* Devotee Info Matrix & Karmic Assessment Grid */}
          <div
            style={{
              background: "#FFFDF9",
              border: "1.5px solid #D4AF37",
              borderRadius: "10px",
              padding: "8px 14px",
              boxShadow: "0 1.5px 4px rgba(180, 83, 9, 0.05)"
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1.1fr 1.1fr 1.15fr", gap: "8px 12px", fontSize: "11px", lineHeight: 1.45 }}>
              <div>
                <span style={{ fontWeight: 800, color: "#92400E" }}>👤 {t.nativeDetails}:</span>{" "}
                <span style={{ fontWeight: 900, color: "#451A03", fontSize: "12px" }}>{devoteeInfo.name}</span>
                <div style={{ fontSize: "10px", color: "#78350F", marginTop: "2px" }}>
                  📅 {devoteeInfo.birthDate} • {devoteeInfo.birthTime}
                </div>
              </div>

              <div>
                <span style={{ fontWeight: 800, color: "#92400E" }}>🏛️ {t.lagnaLabel}</span>{" "}
                <span style={{ fontWeight: 800, color: "#451A03" }}>
                  {devoteeInfo.lagnaRashiRecord?.[code] || devoteeInfo.lagnaRashi}
                </span>
                <div style={{ fontSize: "10px", color: "#78350F", marginTop: "2px" }}>
                  🌙 {t.rashiLabel} {devoteeInfo.moonRashiRecord?.[code] || devoteeInfo.moonRashi}
                </div>
              </div>

              <div>
                <span style={{ fontWeight: 800, color: "#92400E" }}>⭐ {t.nakshatraLabel}</span>{" "}
                <span style={{ fontWeight: 800, color: "#451A03" }}>
                  {devoteeInfo.nakshatraRecord?.[code] || devoteeInfo.nakshatra} ({devoteeInfo.pada})
                </span>
                <div style={{ fontSize: "10px", color: "#78350F", marginTop: "2px" }}>
                  ⏳ {t.dashaLabel} {devoteeInfo.currentDashaRecord?.[code] || devoteeInfo.currentDashaStr}
                </div>
              </div>

              <div style={{ background: "#FEF9E7", border: "1.5px solid #D4AF37", borderRadius: "8px", padding: "5px 8px", textAlign: "center" }}>
                <div style={{ fontWeight: 900, color: "#78350F", fontSize: "11px" }}>
                  ⭐ {t.currentAgeLabel} {devoteeInfo.currentAge || devoteeInfo.devoteeAge} {code === "kn" ? "ವರ್ಷ" : "Yrs"}
                </div>
                <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#92400E", marginTop: "1.5px" }}>
                  🔥 {activeDoshas.length} {t.activeDoshasCountLabel} ({devoteeInfo.ageStageNameRecord?.[code] || devoteeInfo.ageStageKey})
                </div>
              </div>
            </div>

            {/* Karmic Index Indicator Bar */}
            <div style={{ marginTop: "6px", paddingTop: "5px", borderTop: "1px dashed #D4AF37", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10px" }}>
              <div style={{ display: "flex", gap: "10px", color: "#78350F", fontWeight: 700 }}>
                <span>📋 {code === "kn" ? "ಪರಿಶೀಲಿತ ವರ್ಗಗಳು:" : "Evaluated:"} <strong>{summary?.totalEvaluated || 12}</strong></span>
                <span>⚡ {code === "kn" ? "ತೀವ್ರ ಬಾಧೆ (Critical):" : "Critical:"} <strong style={{ color: "#92400E" }}>{summary?.criticalCount || 0}</strong></span>
                <span>⚠️ {code === "kn" ? "ಮಧ್ಯಮ (Moderate):" : "Moderate:"} <strong style={{ color: "#B45309" }}>{(summary?.highCount || 0) + (summary?.moderateCount || 0)}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: 800, color: "#92400E" }}>{code === "kn" ? "ದೋಷ ಸೂಚ್ಯಂಕ:" : "Karmic Vulnerability:"}</span>
                <span style={{ fontWeight: 900, color: "#78350F", fontSize: "11px", background: "#FEF9E7", padding: "1px 6px", borderRadius: "4px", border: "1px solid #D4AF37" }}>
                  {summary?.karmicIndexScore || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Age-Adaptive Priority Strategy Card */}
          <div
            style={{
              background: "#FFFDF9",
              border: "1.5px solid #D4AF37",
              borderRadius: "10px",
              padding: "7px 14px",
              boxShadow: "0 1.5px 4px rgba(180, 83, 9, 0.05)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 900, color: "#78350F" }}>
                {t.ageStrategyHeading} ({devoteeInfo.ageStageNameRecord?.[code] || "ವಯಸ್ಸು " + (devoteeInfo.currentAge || devoteeInfo.devoteeAge)})
              </div>
              <div style={{ fontSize: "9.5px", background: "linear-gradient(135deg, #78350F 0%, #B45309 100%)", color: "#FEF9E7", padding: "2px 8px", borderRadius: "10px", fontWeight: 800, border: "1px solid #D4AF37" }}>
                ⚡ {t.agePriorityBadgeLabel}
              </div>
            </div>
            <div style={{ fontSize: "10.5px", color: "#451A03", fontWeight: 700, marginTop: "2.5px", lineHeight: 1.4 }}>
              {getLangVal(devoteeInfo.currentAgeFocusSummary, "ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ಮೊದಲ ಆದ್ಯತೆಯ ಪರಿಹಾರಗಳನ್ನು ಕೈಗೊಳ್ಳುವುದು ಅತ್ಯಾವಶ್ಯಕ.")}
            </div>
            <div style={{ fontSize: "9px", color: "#92400E", marginTop: "1.5px", fontStyle: "italic" }}>
              {t.ageStrategyNotice}
            </div>
          </div>

          {/* Page 1 Primary Active Doshas (Up to 2 Major Doshas in Full Depth) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "7px", flex: 1, justifyContent: "space-around" }}>
            {page1Doshas.length === 0 ? (
              <div
                style={{
                  background: "#FFFDF9",
                  border: "2px dashed #D4AF37",
                  borderRadius: "10px",
                  padding: "24px 18px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "32px" }}>🕊️</div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#78350F", marginTop: "6px" }}>
                  {t.noDoshaTitle}
                </div>
                <div style={{ fontSize: "12px", color: "#92400E", marginTop: "5px", lineHeight: 1.55, maxWidth: "680px", margin: "5px auto 0" }}>
                  {t.noDoshaDesc}
                </div>
              </div>
            ) : (
              page1Doshas.map((dosha) => {
                const isPitru = dosha.id === "pitru_dosha";
                return (
                  <div
                    key={dosha.id}
                    style={{
                      background: "#FFFDF9",
                      border: "1.5px solid #D4AF37",
                      borderRadius: "10px",
                      padding: "9px 13px",
                      boxShadow: "0 1.5px 4px rgba(180, 83, 9, 0.05)",
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
                          padding: "2.5px 8px",
                          borderRadius: "6px",
                          letterSpacing: "0.4px",
                          border: "1px solid #D4AF37"
                        }}
                      >
                        {code === "kn"
                          ? "🪔 ಪವಿತ್ರ ಪಿತೃ ಋಣ ನಿವಾರಣಾ ವಿಶೇಷ ಆದ್ಯತೆ · ಶ್ರೀ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ತಿಲ ಹೋಮ & ನಾರಾಯಣ ಬಲಿ"
                          : "🪔 Sacred Ancestral Karma Priority · Sri Gokarna Kotiteertha Tila Homa & Narayana Bali"}
                      </div>
                    )}

                    {/* Header Row */}
                    <div
                      style={{
                        background: "linear-gradient(90deg, #FEF9E7 0%, #FFFDF8 100%)",
                        border: "1px solid #E5C378",
                        borderRadius: "7px",
                        padding: "4.5px 9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <span style={{ fontSize: "15px" }}>{isPitru ? "🪔" : "⚡"}</span>
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 900, color: "#78350F" }}>
                            {getLangVal(dosha.name)}
                          </span>
                          <span style={{ fontSize: "9px", color: "#92400E", marginLeft: "7px", fontWeight: 600 }}>
                            ({dosha.technicalDetail?.scripturalReference})
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            background: "linear-gradient(135deg, #B45309 0%, #78350F 100%)",
                            color: "#FFFDF8",
                            fontSize: "9.5px",
                            fontWeight: 900,
                            padding: "1.5px 7px",
                            borderRadius: "10px",
                            border: "1px solid #D4AF37"
                          }}
                        >
                          ⚡ {getLangVal(dosha.agePriorityBadge, `ಆದ್ಯತೆ #${dosha.agePriorityRank || 1}`)}
                        </span>
                        <span
                          style={{
                            background: "#FEF9E7",
                            border: "1px solid #D4AF37",
                            color: "#78350F",
                            fontSize: "9px",
                            fontWeight: 800,
                            padding: "1.5px 6px",
                            borderRadius: "7px"
                          }}
                        >
                          {getLangVal(dosha.statusBadge)}
                        </span>
                      </div>
                    </div>

                    {/* Age Priority Reason */}
                    {dosha.agePriorityReason && (
                      <div style={{ fontSize: "10px", color: "#78350F", background: "#FFFDF8", padding: "3px 8px", borderRadius: "6px", border: "1px solid #E5C378", lineHeight: 1.35 }}>
                        <span style={{ fontWeight: 800, color: "#92400E" }}>📌 {t.agePriorityBadgeLabel}: </span>
                        {getLangVal(dosha.agePriorityReason)}
                      </div>
                    )}

                    {/* Immediate Priority Action */}
                    {dosha.immediateActionRequired && (
                      <div
                        style={{
                          background: "#FEF9E7",
                          border: "1.5px solid #D4AF37",
                          borderRadius: "7px",
                          padding: "4.5px 9px"
                        }}
                      >
                        <div style={{ fontSize: "10px", fontWeight: 900, color: "#92400E" }}>
                          {t.immediateActionLabel}
                        </div>
                        <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#78350F", marginTop: "1.5px", lineHeight: 1.35 }}>
                          {getLangVal(dosha.immediateActionRequired)}
                        </div>
                      </div>
                    )}

                    {/* Technical Root & Life Struggles (2-column A4 grid) */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "7px", fontSize: "10px", lineHeight: 1.35 }}>
                      <div style={{ background: "#FFFDF8", border: "1px solid #E5C378", borderRadius: "6px", padding: "5px 8px" }}>
                        <div style={{ fontWeight: 800, color: "#78350F" }}>🔍 {t.technicalRootLabel}</div>
                        <div style={{ color: "#451A03", marginTop: "2px" }}>
                          {getLangVal(dosha.technicalWhy)}
                        </div>
                      </div>

                      <div style={{ background: "#FEF9E7", border: "1px solid #E5C378", borderRadius: "6px", padding: "5px 8px" }}>
                        <div style={{ fontWeight: 800, color: "#92400E" }}>⚡ {t.realLifeImpactLabel}</div>
                        <div style={{ color: "#78350F", marginTop: "2px" }}>
                          {getLangVal(dosha.currentLifeProblems) || getLangVal(dosha.lifeImpact)}
                        </div>
                      </div>
                    </div>

                    {/* Dasha Resonance Activation */}
                    {dosha.dashaResonance && (
                      <div style={{ background: "#FFFDF8", border: "1px solid #D4AF37", borderRadius: "6px", padding: "4px 8px", fontSize: "10px", color: "#78350F", lineHeight: 1.35 }}>
                        <strong>⏳ {t.dashaResonanceLabel}</strong> {getLangVal(dosha.dashaResonance)}
                      </div>
                    )}

                    {/* Prescribed Parihara & Gokarna Seva */}
                    <div style={{ background: "linear-gradient(135deg, #FEF9E7 0%, #FFFDF9 100%)", border: "1.5px solid #D4AF37", borderRadius: "6px", padding: "5px 9px", fontSize: "10px", lineHeight: 1.35 }}>
                      <div style={{ fontWeight: 900, color: "#92400E" }}>🪔 {t.pariharaHeading}</div>
                      <div style={{ color: "#451A03", fontWeight: 700, marginTop: "2px" }}>
                        {getLangVal(dosha.recommendedPooja)}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2.5px", fontSize: "9.5px", color: "#78350F" }}>
                        <span><strong>{t.mantraLabel}</strong> {getLangArr(dosha.remedies).slice(0, 2).join(" • ")}</span>
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
                  background: "#FFFDF9",
                  border: "1.5px solid #D4AF37",
                  borderRadius: "10px",
                  padding: "9px 13px",
                  boxShadow: "0 1.5px 4px rgba(180, 83, 9, 0.05)"
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 900, color: "#78350F", borderBottom: "1.5px solid #D4AF37", paddingBottom: "4px" }}>
                  🪐 {t.chartBalanceHeading}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginTop: "7px", fontSize: "10px", lineHeight: 1.4 }}>
                  <div style={{ background: "#FEF9E7", border: "1px solid #E5C378", borderRadius: "6px", padding: "5px 8px" }}>
                    <div style={{ fontWeight: 800, color: "#92400E" }}>🏛️ {t.lagnaLabel} {devoteeInfo.lagnaRashiRecord?.[code] || devoteeInfo.lagnaRashi}</div>
                    <div style={{ color: "#78350F", marginTop: "2px" }}>
                      {code === "kn"
                        ? "ಲಗ್ನ ಕೇಂದ್ರವು ಜಾತಕರ ಶಾರೀರಿಕ ಆರೋಗ್ಯ ಮತ್ತು ಜೀವ ಶಕ್ತಿಯನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ಪ್ರಮುಖ ಭಾವಗಳು ರಕ್ಷಿತವಾಗಿವೆ."
                        : "The Ascendant kendra protects physical vitality, immunity and baseline life fortitude."}
                    </div>
                  </div>
                  <div style={{ background: "#FEF9E7", border: "1px solid #E5C378", borderRadius: "6px", padding: "5px 8px" }}>
                    <div style={{ fontWeight: 800, color: "#92400E" }}>🌙 {t.rashiLabel} {devoteeInfo.moonRashiRecord?.[code] || devoteeInfo.moonRashi}</div>
                    <div style={{ color: "#78350F", marginTop: "2px" }}>
                      {code === "kn"
                        ? "ಚಂದ್ರ ರಾಶಿ ಮತ್ತು ಮನೋಸ್ಥಿತಿ ಸಮತೋಲನದಲ್ಲಿದ್ದು, ನಿತ್ಯ ಪೂಜೆ ಹಾಗೂ ಈಶ್ವರ ಪ್ರಾರ್ಥನೆಯು ಮಾನಸಿಕ ಶಾಂತಿಯನ್ನು ತರುತ್ತದೆ."
                        : "Lunar dignity preserves cognitive resilience; regular worship and meditation maintain calm clarity."}
                    </div>
                  </div>
                  <div style={{ background: "#FEF9E7", border: "1px solid #E5C378", borderRadius: "6px", padding: "5px 8px" }}>
                    <div style={{ fontWeight: 800, color: "#92400E" }}>☀️ {code === "kn" ? "ಆತ್ಮಕಾರಕ ಸೂರ್ಯ ಬಲ:" : "Sun & Vital Dignity:"}</div>
                    <div style={{ color: "#78350F", marginTop: "2px" }}>
                      {code === "kn"
                        ? "ಪೂರ್ವ ಪುಣ್ಯ ಮತ್ತು ಪಿತೃ ಆಶೀರ್ವಾದದ ಪ್ರಭಾವದಿಂದ ಜಾತಕರಿಗೆ ಕಷ್ಟಗಳನ್ನು ಎದುರಿಸುವ ನೈಸರ್ಗಿಕ ಸಂಕಲ್ಪ ಶಕ್ತಿ ಲಭಿಸಿದೆ."
                        : "Solar fortitude and dharmic inheritance bestow innate will-power to overcome karmic hurdles."}
                    </div>
                  </div>
                  <div style={{ background: "#FEF9E7", border: "1px solid #E5C378", borderRadius: "6px", padding: "5px 8px" }}>
                    <div style={{ fontWeight: 800, color: "#92400E" }}>🪔 {code === "kn" ? "ತ್ರಿಕೋಣ ಭಾವ ರಕ್ಷಣೆ:" : "Trikona Divine Grace:"}</div>
                    <div style={{ color: "#78350F", marginTop: "2px" }}>
                      {code === "kn"
                        ? "ಧರ್ಮ ಮತ್ತು ಭಾಗ್ಯ ಸ್ಥಾನಗಳು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕೈಗೊಳ್ಳುವ ನಿತ್ಯ ಅರ್ಚನೆಯಿಂದ ಸದಾ ಜಾಗೃತವಾಗಿರುತ್ತವೆ."
                        : "Benefic 9th and 5th house trines anchor lasting divine protection under Mahabaleshwara's grace."}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Page 1 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "9.5px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1.5px dashed #D4AF37",
              paddingTop: "5px"
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
          background: "#FFFDF7"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "3px double #B45309",
            outline: "1.5px solid #D4AF37",
            outlineOffset: "-5px",
            borderRadius: "14px",
            padding: "13px 18px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEFDF6 40%, #FFFDF8 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)",
              borderRadius: "9px",
              padding: "8px 14px",
              color: "#FFFFFF",
              border: "1.5px solid #D4AF37",
              boxShadow: "0 2px 8px rgba(180, 83, 9, 0.12)"
            }}
          >
            <div style={{ fontSize: "11.5px", color: "#FDE68A", fontWeight: 800 }}>
              {t.templeBanner}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px" }}>
              {t.page2Title}
            </div>
          </div>

          {/* Top Section: Secondary Doshas (if 3+ active doshas) OR Planetary Harmony Shield */}
          {page2Doshas.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {page2Doshas.slice(0, 2).map((dosha) => (
                <div
                  key={dosha.id}
                  style={{
                    background: "#FFFDF9",
                    border: "1.5px solid #D4AF37",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    boxShadow: "0 1.5px 3px rgba(180, 83, 9, 0.04)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E5C378", paddingBottom: "3px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "13px" }}>⚡</span>
                      <span style={{ fontSize: "12px", fontWeight: 900, color: "#78350F" }}>
                        {getLangVal(dosha.name)}
                      </span>
                      <span style={{ fontSize: "8.5px", color: "#92400E" }}>
                        ({dosha.technicalDetail?.scripturalReference})
                      </span>
                    </div>
                    <span
                      style={{
                        background: "linear-gradient(135deg, #B45309 0%, #78350F 100%)",
                        color: "#FFFDF8",
                        fontSize: "9px",
                        fontWeight: 900,
                        padding: "1px 6px",
                        borderRadius: "8px",
                        border: "1px solid #D4AF37"
                      }}
                    >
                      ⚡ {getLangVal(dosha.agePriorityBadge, `ಆದ್ಯತೆ #${dosha.agePriorityRank}`)}
                    </span>
                  </div>

                  {dosha.immediateActionRequired && (
                    <div style={{ background: "#FEF9E7", border: "1px solid #D4AF37", borderRadius: "5px", padding: "3px 7px", marginTop: "3.5px" }}>
                      <span style={{ fontWeight: 800, color: "#92400E", fontSize: "9.5px" }}>{t.immediateActionLabel} </span>
                      <span style={{ color: "#78350F", fontWeight: 700, fontSize: "9.5px" }}>{getLangVal(dosha.immediateActionRequired)}</span>
                    </div>
                  )}

                  <div style={{ fontSize: "9.5px", color: "#451A03", marginTop: "2.5px", lineHeight: 1.3 }}>
                    <strong>{t.pariharaHeading}</strong> {getLangVal(dosha.recommendedPooja)} • <strong>{t.mantraLabel}</strong> {getLangArr(dosha.remedies).slice(0, 2).join(" • ")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "#FFFDF9",
                border: "1.5px solid #D4AF37",
                borderRadius: "8px",
                padding: "7px 11px",
                boxShadow: "0 1.5px 3px rgba(180, 83, 9, 0.04)"
              }}
            >
              <div style={{ fontSize: "11.5px", fontWeight: 900, color: "#78350F" }}>
                {t.planetaryHarmonyHeading}
              </div>
              <div style={{ fontSize: "10px", color: "#451A03", marginTop: "2px", lineHeight: 1.35 }}>
                {t.planetaryHarmonyDesc}
              </div>
            </div>
          )}

          {/* Section: Critical Gandantara Hazards & Protective Age Windows */}
          <div
            style={{
              background: "#FFFDF9",
              border: "1.5px solid #D4AF37",
              borderRadius: "10px",
              padding: "7px 11px",
              boxShadow: "0 1.5px 4px rgba(180, 83, 9, 0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid #D4AF37", paddingBottom: "3px" }}>
              <div style={{ fontSize: "12px", fontWeight: 900, color: "#78350F" }}>
                {t.gandantaraHeading}
              </div>
              <div style={{ fontSize: "9.5px", color: "#92400E", fontWeight: 700 }}>
                {gandantaras.length} {code === "kn" ? "ಗಂಡಾಂತರಗಳು ಸಕ್ರಿಯ" : "Hazards Active"}
              </div>
            </div>
            <div style={{ fontSize: "9.5px", color: "#92400E", marginTop: "2px", fontStyle: "italic" }}>
              {t.gandantaraNotice}
            </div>

            {/* Gandantara Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "5px" }}>
              {gandantaras.length === 0 ? (
                <div style={{ textAlign: "center", padding: "10px", color: "#78350F", fontWeight: 700, fontSize: "10.5px" }}>
                  ✓ {code === "kn" ? "ಯಾವುದೇ ಮಾರಕ ಜಲ-ಅಗ್ನಿ-ಸರ್ಪ ಗಂಡಾಂತರಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ. ಜಾತಕರು ಸುರಕ್ಷಿತರಾಗಿದ್ದಾರೆ." : "No critical life hazards or Gandantaras detected. Devotee is safeguarded."}
                </div>
              ) : (
                gandantaras.slice(0, 3).map((g) => (
                  <div
                    key={g.id}
                    style={{
                      background: "#FEF9E7",
                      border: "1px solid #E5C378",
                      borderRadius: "6px",
                      padding: "5px 8px",
                      fontSize: "10px",
                      lineHeight: 1.35
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 900, color: "#78350F", fontSize: "10.5px" }}>
                        ⚡ {getLangVal(g.name)}
                      </div>
                      <span style={{ background: "linear-gradient(135deg, #B45309 0%, #78350F 100%)", color: "#FFFDF8", fontSize: "8.5px", fontWeight: 900, padding: "1px 6px", borderRadius: "6px", border: "1px solid #D4AF37" }}>
                        {t.safeAgeLimitLabel} {getLangVal(g.ageWindowDescription, `${g.vulnerableTillAge} ವರ್ಷದವರೆಗೆ`)}
                      </span>
                    </div>

                    <div style={{ color: "#92400E", fontWeight: 700, marginTop: "1.5px" }}>
                      ⛔ {t.mandatoryPrecautionLabel} {getLangArr(g.cautionDirectives).slice(0, 2).join(" • ") || getLangVal(g.technicalReason)}
                    </div>

                    <div style={{ color: "#451A03", fontWeight: 700, marginTop: "1.5px" }}>
                      🛡️ {t.protectiveMantraLabel} {getLangVal(g.protectiveParihara)} • {getLangArr(g.protectiveMantras).slice(0, 1).join("")}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sacred Guidance Box */}
            <div
              style={{
                background: "linear-gradient(135deg, #FEF9E7 0%, #FFFDF8 100%)",
                border: "1px solid #D4AF37",
                borderRadius: "6px",
                padding: "4.5px 8px",
                fontSize: "9.5px",
                color: "#78350F",
                lineHeight: 1.3,
                marginTop: "4px"
              }}
            >
              <strong>🔱 {code === "kn" ? "ಪರಾಶರ ಶಾಸ್ತ್ರ ರಕ್ಷಾ ಸೂತ್ರ:" : "Parashari Hazard Protocol:"}</strong>{" "}
              {code === "kn"
                ? "ಗಂಡಾಂತರ ವಯೋಮಿತಿ ದಾಟುವ ತನಕ ಜಾತಕರಿಗೆ ನಿತ್ಯ ರುದ್ರಾಭಿಷೇಕ ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ, ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆಯುಷ್ಯ ಶಾಂತಿ ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ."
                : "Until the safe age threshold is crossed, daily Mahamrityunjaya chanting, protective sacred ash (Vibhuti), and temple Kavacha are strongly advised."}
            </div>
          </div>

          {/* Section: Subconscious Innate Phobias & Fears */}
          <div
            style={{
              background: "#FFFDF9",
              border: "1.5px solid #D4AF37",
              borderRadius: "10px",
              padding: "7px 11px",
              boxShadow: "0 1.5px 4px rgba(180, 83, 9, 0.04)"
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 900, color: "#78350F", borderBottom: "1.5px solid #D4AF37", paddingBottom: "3px" }}>
              🧠 {t.fearsHeading}
            </div>
            <div style={{ fontSize: "9.5px", color: "#92400E", marginTop: "2px", fontStyle: "italic" }}>
              {t.fearsSubheading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "5px" }}>
              {fears.slice(0, 2).map((fear) => (
                <div
                  key={fear.id}
                  style={{
                    background: "#FEF9E7",
                    border: "1px solid #E5C378",
                    borderRadius: "6px",
                    padding: "4.5px 7px",
                    fontSize: "9.5px",
                    lineHeight: 1.3
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 800, color: "#451A03" }}>
                      {fear.icon} {getLangVal(fear.name)}
                    </div>
                    <span style={{ fontSize: "8px", background: "#FFFDF9", color: "#78350F", padding: "1px 5px", borderRadius: "5px", fontWeight: 700, border: "1px solid #D4AF37" }}>
                      {fear.severity}
                    </span>
                  </div>
                  <div style={{ color: "#92400E", marginTop: "1.5px" }}>
                    <strong>{t.symptomLabel}</strong> {getLangVal(fear.psychologicalSymptom)}
                  </div>
                  <div style={{ color: "#78350F", fontWeight: 700, marginTop: "1.5px" }}>
                    <strong>{t.strengtheningPracticeLabel}</strong> {getLangVal(fear.strengtheningPractice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Sacred Gokarna Mahabaleshwara Remedies tailored to Age Stage */}
          <div
            style={{
              background: "#FFFDF9",
              border: "1.5px solid #D4AF37",
              borderRadius: "10px",
              padding: "7px 11px",
              boxShadow: "0 1.5px 4px rgba(180, 83, 9, 0.04)"
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 900, color: "#78350F", borderBottom: "1.5px solid #D4AF37", paddingBottom: "3px" }}>
              🪔 {t.templeRemediesHeading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginTop: "5px", fontSize: "9.5px", lineHeight: 1.3 }}>
              {ageStageRemedies.map((remedy, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#FEF9E7",
                    border: "1px solid #E5C378",
                    borderRadius: "5px",
                    padding: "4px 7px"
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400E" }}>
                    {remedy.icon} {remedy.title}
                  </div>
                  <div style={{ color: "#78350F", marginTop: "1.5px" }}>
                    {remedy.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Chief Priest Shreeram Pandit's Blessing & Official Temple Seal */}
          <div
            style={{
              background: "#FFFDF9",
              border: "1.5px solid #D4AF37",
              borderRadius: "10px",
              padding: "7px 11px",
              boxShadow: "0 1.5px 4px rgba(180, 83, 9, 0.04)"
            }}
          >
            <div style={{ fontSize: "11.5px", fontWeight: 900, color: "#78350F", borderBottom: "1.5px solid #D4AF37", paddingBottom: "3px", marginBottom: "4px" }}>
              🙏 {t.priestBlessingHeading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 74px", gap: "8px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#78350F" }}>
                  {t.priestName}
                </div>
                <div style={{ fontSize: "10px", color: "#92400E", fontWeight: 700 }}>
                  {t.priestTitle} · {t.priestPhone}
                </div>
                <div style={{ fontSize: "10.5px", color: "#78350F", fontWeight: 800, marginTop: "2px", lineHeight: 1.35 }}>
                  {t.sanskritAshirvada}
                </div>
                <div style={{ fontSize: "9.5px", color: "#451A03", marginTop: "1.5px", lineHeight: 1.35, fontStyle: "italic" }}>
                  {t.ashirvadaMeaning}
                </div>
              </div>

              {/* Official Temple Seal Graphic */}
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  border: "2px double #B45309",
                  background: "linear-gradient(135deg, #FEF9E7 0%, #FDE68A 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "2px",
                  boxSizing: "border-box",
                  boxShadow: "0 2px 4px rgba(180, 83, 9, 0.12)"
                }}
              >
                <div style={{ fontSize: "14px" }}>🪔</div>
                <div style={{ fontSize: "6.5px", fontWeight: 900, color: "#78350F", lineHeight: 1.1, marginTop: "1px" }}>
                  {code === "kn" ? "॥ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥" : code === "hi" ? "॥ गोकर्ण सन्निधि ॥" : code === "te" ? "॥ గోకర్ణ సన్నిధి ॥" : code === "ta" ? "॥ கோகர்ண சந்நிதி ॥" : "॥ Sri Gokarna ॥"}
                </div>
                <div style={{ fontSize: "5.5px", color: "#92400E", fontWeight: 800 }}>
                  {t.officialSealLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "9.5px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1.5px dashed #D4AF37",
              paddingTop: "5px"
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
