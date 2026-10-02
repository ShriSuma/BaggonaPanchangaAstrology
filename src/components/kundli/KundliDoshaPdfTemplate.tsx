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

// 5-Language UI Localized Dictionary for Dossier PDF
const PDF_TEXT: Record<SupportedLanguage, Record<string, string>> = {
  kn: {
    templeBanner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    mainTitle: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ಸಮಗ್ರ ದೋಷ ನಿರ್ಣಯ, ಗಂಡಾಂತರ & ವಯೋನುಗುಣ ಪರಿಹಾರ ಪತ್ರ",
    page2Title: "ದ್ವಿತೀಯ ಭಾಗ: ಶೇಷ ಕರ್ಮ ದೋಷಗಳು, ಗಂಡಾಂತರ ವಯೋಮಿತಿ & ಸಂರಕ್ಷಣಾ ಕವಚ",
    page3Title: "ತೃತೀಯ ಭಾಗ: ಅಂತರ್ಗತ ಮನೋಭಯಗಳು, ಗೋಕರ್ಣ ಮಹಾ ಪರಿಹಾರ ಸೇವೆಗಳು & ಅರ್ಚಕರ ಆಶೀರ್ವಾದ",
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
    pariharaHeading: "ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ & ಗೋಕರ್ಣ ಸೇವೆ:",
    mantraLabel: "ಮಂತ್ರ ಜಪ & ಪರಿಹಾರ ಕ್ರಮ:",
    daanaLabel: "ದಾನ & ಸೇವೆ:",
    noDoshaTitle: "🕊️ ಶುದ್ಧ ನಿರ್ದೋಷ ಜಾತಕ (No Critical Afflictions)",
    noDoshaDesc: "ಜಾತಕದಲ್ಲಿ ಯಾವುದೇ ಮಾರಕ ಕರ್ಮ ದೋಷಗಳು ಅಥವಾ ಗಂಡಾಂತರಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಭಗವಂತನ ಕೃಪೆಯಿಂದ ಸಕಲ ಶುಭಗಳು ಲಭಿಸಲಿ.",
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
    balaSevaTitle: "ಬಾಲಾರಿಷ್ಟ ಶಮನ & ಆಯುಷ್ಯ ವೃದ್ಧಿ ಸೇವೆ:",
    vidyaSevaTitle: "ಸಾರಸ್ವತ & ವಿದ್ಯಾಭಿವೃದ್ಧಿ ಸೇವೆ:",
    vivahaSevaTitle: "ಕುಜ ಶಾಂತಿ & ಕಲ್ಯಾಣ ಪ್ರಾಪ್ತಿ ಸೇವೆ:",
    gruhasthaSevaTitle: "ತಿಲ ಹೋಮ, ನಾರಾಯಣ ಬಲಿ & ಪಿತೃ ಶಾಂತಿ:",
    cowSevaLabel: "ಗೋಸೇವೆ & ಮಹಾ ಅನ್ನದಾನ:",
    rudrakshaGemLabel: "ರುದ್ರಾಕ್ಷಿ & ರತ್ನ ಧಾರಣೆ:",
    priestBlessingHeading: "🙏 ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestTitle: "ಪ್ರಧಾನ ಅರ್ಚಕರು, ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ",
    priestPhone: "ದೂರವಾಣಿ: +91 99723 39362",
    sanskritAshirvada: "॥ ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ । ಸರ್ವೇ ಭದ್ರಾಣಿ ಪಶ್ಯಂತು ಮಾ ಕಶ್ಚಿತ್ ದುಃಖಭಾಗ್ಭವತ್ ॥",
    ashirvadaMeaning: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಅನುಗ್ರಹದಿಂದ ಜಾತಕದ ಸಮಸ್ತ ದೋಷಗಳು, ಗಂಡಾಂತರಗಳು ಶಮನವಾಗಿ, ಆಯುರಾರೋಗ್ಯ, ಸನ್ಮಂಗಳ ಉಂಟಾಗಲಿ ಎಂದು ಆಶೀರ್ವದಿಸಲಾಗಿದೆ.",
    officialSealLabel: "ಅಧಿಕೃತ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    page1Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೧/೩ (ಮುಂದುವರಿದಿದೆ...)",
    page2Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೨/೩ (ಮುಂದುವರಿದಿದೆ...)",
    page3Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೩/೩ (ಸಂಪೂರ್ಣ)"
  },
  en: {
    templeBanner: "॥ SRI GOKARNA MAHABALESHWARA TEMPLE · BAGGONA PANCHANGA ASTROLOGY ॥",
    mainTitle: "Kundali Dosha Analysis, Gandantara Hazards & Age-Adaptive Remedy Dossier",
    page2Title: "Part 2: Remaining Karmic Doshas, Critical Gandantaras & Protective Kavachas",
    page3Title: "Part 3: Subconscious Fears, Sacred Gokarna Sevas & Chief Priest Blessing",
    shloka: "॥ Namah Suryaya Shantaya Sarvaroga Nivarine | Ayurarogyamaishvaryam Dehi Deva Jagatpate ॥",
    nativeDetails: "Devotee Profile",
    birthDetails: "Birth Details:",
    lagnaLabel: "Ascendant (Lagna):",
    rashiLabel: "Moon Sign (Rashi):",
    nakshatraLabel: "Constellation (Nakshatra):",
    dashaLabel: "Active Dasha-Bhukti:",
    currentAgeLabel: "Current Age:",
    ageStageLabel: "Life Stage:",
    activeDoshasCountLabel: "Active Doshas:",
    ageStrategyHeading: "⭐ Current Age Priority Directives & Immediate Focus",
    ageStrategyNotice: "Note: All afflictions are strictly ordered in ascending priority (#1, #2, #3...) based on the native's current age urgency.",
    immediateActionLabel: "🎯 Immediate Priority Action (What Must Be Done First):",
    agePriorityBadgeLabel: "Current Age Priority",
    technicalRootLabel: "Technical Astrological Cause:",
    realLifeImpactLabel: "Real-Life Struggles & Symptoms:",
    pariharaHeading: "Prescribed Parashari Remedy & Gokarna Seva:",
    mantraLabel: "Mantra Japa & Remedies:",
    daanaLabel: "Daana & Service:",
    noDoshaTitle: "🕊️ Pristine Kundali (Nir-Dosha)",
    noDoshaDesc: "No major karmic afflictions or critical Gandantaras detected. May Lord Mahabaleshwara bless the native with health and prosperity.",
    gandantaraHeading: "⚡ Gandantara Life Hazards & Safe Age Limits",
    gandantaraNotice: "Parashari age windows, behavioral prohibitions, and protective Kavachas for water, fire, vehicular, and venom hazards",
    safeAgeLimitLabel: "Safe Age Threshold:",
    karmicCauseLabel: "Karmic Root:",
    mandatoryPrecautionLabel: "Mandatory Behavioral Prohibitions:",
    protectiveMantraLabel: "Protective Kavacha & Mantras:",
    fearsHeading: "🧠 Innate Subconscious Phobias & Cognitive Fortification",
    fearsSubheading: "Astrological root causes of inherent psychological fears and daily pacification routines",
    symptomLabel: "Somatic / Mind Symptom:",
    strengtheningPracticeLabel: "Cognitive Fortification:",
    templeRemediesHeading: "🪔 Sacred Sri Gokarna Mahabaleshwara Temple Remedies",
    balaSevaTitle: "Balarishta Shanti & Vitality Enhancement:",
    vidyaSevaTitle: "Saraswata Homa & Academic Brilliance:",
    vivahaSevaTitle: "Kuja Shanti & Matrimonial Harmony:",
    gruhasthaSevaTitle: "Tila Homa, Narayana Bali & Pitru Shanti:",
    cowSevaLabel: "Go-Seva & Annadaana:",
    rudrakshaGemLabel: "Rudraksha & Gemstone:",
    priestBlessingHeading: "🙏 Chief Priest Vedic Blessing & Official Temple Seal",
    priestName: "Shreeram Pandit",
    priestTitle: "Chief Priest, Sri Gokarna Mahabaleshwara Temple",
    priestPhone: "Contact: +91 99723 39362",
    sanskritAshirvada: "॥ Sarve Bhavantu Sukhinah Sarve Santu Niramayah | Sarve Bhadrani Pashyantu Ma Kashchid Duhkhabhagbhavet ॥",
    ashirvadaMeaning: "By the divine grace of Lord Mahabaleshwara, may all afflicted planetary energies and life hazards be dissolved, granting long life and prosperity.",
    officialSealLabel: "Official Temple Seal",
    page1Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 1 of 3 (Continued...)",
    page2Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 2 of 3 (Continued...)",
    page3Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 3 of 3 (Complete)"
  },
  hi: {
    templeBanner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    mainTitle: "जन्म कुंडली आधारित समग्र दोष निर्णय, गंडांतर एवं आयु-अनुकूल उपाय रिपोर्ट",
    page2Title: "द्वितीय भाग: शेष कर्म दोष, गंडांतर आयु सीमा एवं सुरक्षा कवच",
    page3Title: "तृतीय भाग: अंतर्निहित भय, गोकर्ण क्षेत्र महा उपाय एवं अर्चक आशीर्वाद",
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
    ageStrategyHeading: "⭐ वर्तमान आयु प्राथमिकता निर्देश एवं तत्काल मार्गदर्शन",
    ageStrategyNotice: "सूचना: जातक की वर्तमान आयु की तात्कालिक आवश्यकता के आधार पर दोषों को प्राथमिकता क्रम (#1, #2, #3...) में व्यवस्थित किया गया है।",
    immediateActionLabel: "🎯 सर्वप्रथम करने योग्य अनिवार्य कर्तव्य (Immediate Action):",
    agePriorityBadgeLabel: "वर्तमान आयु प्राथमिकता",
    technicalRootLabel: "शास्त्रीय ज्योतिषीय कारण:",
    realLifeImpactLabel: "वास्तविक जीवन में प्रभाव एवं लक्षण:",
    pariharaHeading: "शास्त्रोक्त उपाय एवं गोकर्ण सेवा:",
    mantraLabel: "मंत्र जप एवं उपाय:",
    daanaLabel: "दान एवं सेवा:",
    noDoshaTitle: "🕊️ शुद्ध निर्दोष कुंडली (No Critical Afflictions)",
    noDoshaDesc: "कुंडली में कोई मारक कर्म दोष या गंडांतर नहीं पाया गया। श्री महाबलेश्वर की कृपा से सदा कल्याण हो।",
    gandantaraHeading: "⚡ गंडांतर संकट एवं सुरक्षा आयु सीमा (Life Hazards & Safe Age Limits)",
    gandantaraNotice: "जल, अग्नि, वाहन, सर्प संकटों की शास्त्रोक्त सुरक्षा आयु सीमा एवं अनिवार्य सावधानियां",
    safeAgeLimitLabel: "सुरक्षा आयु सीमा:",
    karmicCauseLabel: "कर्म कारण:",
    mandatoryPrecautionLabel: "अनिवार्य निषेध एवं सावधानी:",
    protectiveMantraLabel: "रक्षा कवच एवं मंत्र:",
    fearsHeading: "🧠 अंतर्निहित भय एवं मानसिक संबल (Innate Fears & Phobias)",
    fearsSubheading: "ग्रह प्रभाव से उत्पन्न मानसिक भय का शमन एवं आत्मबल वृद्धि",
    symptomLabel: "मानसिक लक्षण:",
    strengtheningPracticeLabel: "मनोबल साधना:",
    templeRemediesHeading: "🪔 श्री गोकर्ण महाबलेश्वर सन्निधि के महा उपाय",
    balaSevaTitle: "बालारिष्ट शमन एवं आयु वृद्धि सेवा:",
    vidyaSevaTitle: "सारस्वत एवं विद्या वृद्धि सेवा:",
    vivahaSevaTitle: "कुज शांति एवं शीघ्र विवाह सेवा:",
    gruhasthaSevaTitle: "तिल होम, नारायण बलि एवं पितृ शांति:",
    cowSevaLabel: "गोसेवा एवं महा अन्नदान:",
    rudrakshaGemLabel: "रुद्राक्ष एवं रत्न धारण:",
    priestBlessingHeading: "🙏 प्रधान अर्चक आशीर्वाद एवं गोकर्ण सन्निधि मुद्रा",
    priestName: "श्रीराम पंडित",
    priestTitle: "प्रधान अर्चक, श्री गोकर्ण महाबलेश्वर सन्निधान",
    priestPhone: "संपर्क: +91 99723 39362",
    sanskritAshirvada: "॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद् दुःखभाग्भवेत् ॥",
    ashirvadaMeaning: "श्री महाबलेश्वर स्वामी की असीम अनुकंपा से जातक के समस्त दोष व संकट शांत हों, दीर्घायु एवं सुख-समृद्धि प्राप्त हो।",
    officialSealLabel: "आधिकारिक सन्निधि मुद्रा",
    page1Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ १/३ (क्रमशः...)",
    page2Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ २/३ (क्रमशः...)",
    page3Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ ३/३ (पूर्ण)"
  },
  te: {
    templeBanner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    mainTitle: "జన్మ కుండలి ఆధారిత సమగ్ర దోష నిర్ణయం, గండాంతర & వయోనుగుణ పరిహార పత్రం",
    page2Title: "ద్వితీయ భాగం: శేష కర్మ దోషాలు, గండాంతర రక్షణ వయస్సు & కవచం",
    page3Title: "తృతీయ భాగం: అంతర్గత భయాలు, గోకర్ణ మహా పరిహారాలు & అర్చకుల ఆశీర్వాదం",
    shloka: "॥ నమః సూర్యాయ శాంతాయ సర్వరోగ నివారిణే । ఆయురారోగ్యమైశ్వర్యం దేహి దేవ జగత్పతే ॥",
    nativeDetails: "జాతకుని వివరాలు",
    birthDetails: "జనన వివరాలు:",
    lagnaLabel: "లగ్నం:",
    rashiLabel: "చంద్ర రాశి:",
    nakshatraLabel: "నక్షత్రం:",
    dashaLabel: "ప్రస్తుత మహర్దశ-భుక్తి:",
    currentAgeLabel: "ప్రస్తుత వయస్సు:",
    ageStageLabel: "జీవిత దశ:",
    activeDoshasCountLabel: "సక్రియ దోషాలు:",
    ageStrategyHeading: "⭐ ప్రస్తుత వయస్సు ప్రాధాన్యత సూచిక & తక్షణ మార్గదర్శనం",
    ageStrategyNotice: "గమనిక: జాతకుని ప్రస్తుత వయస్సు అవసరాల ఆధారంగా దోషాలు ప్రాధాన్యతా క్రమంలో (#1, #2, #3...) అమర్చబడ్డాయి.",
    immediateActionLabel: "🎯 మొదట చేయవలసిన అత్యవసర కర్తవ్యం (Immediate Priority Action):",
    agePriorityBadgeLabel: "ప్రస్తుత వయస్సు ప్రాధాన్యత",
    technicalRootLabel: "శాస్త్రీయ జ్యోతిష కారణం:",
    realLifeImpactLabel: "నిజ జీవితంలో ఎదురయ్యే సమస్యలు:",
    pariharaHeading: "శాస్త్రోక్త పరిహారం & గోకర్ణ సేవ:",
    mantraLabel: "మంత్ర జపం & పరిహారాలు:",
    daanaLabel: "దానం & సేవ:",
    noDoshaTitle: "🕊️ శుద్ధ నిర్దోష జాతకం (No Critical Afflictions)",
    noDoshaDesc: "జాతకంలో ఎటువంటి తీవ్రమైన దోషాలు లేదా గండాంతరాలు లేవు. శ్రీ మహాబలేశ్వరుని కృపతో సకల శుభాలు కలుగుగాక.",
    gandantaraHeading: "⚡ గండాంతరాలు & సంరక్షణ వయోపరిమితి (Life Hazards & Safe Age Limits)",
    gandantaraNotice: "జల, అగ్ని, వాహన, సర్ప ప్రమాదాల రక్షణ వయోపరిమితి మరియు నిషేధాలు",
    safeAgeLimitLabel: "రక్షణ వయస్సు పరిమితి:",
    karmicCauseLabel: "కర్మ కారణం:",
    mandatoryPrecautionLabel: "తప్పనిసరి నిబంధనలు:",
    protectiveMantraLabel: "రక్షా కవచం & మంత్రాలు:",
    fearsHeading: "🧠 అంతర్గత భయాలు & మనోధైర్య సాధన (Innate Fears & Phobias)",
    fearsSubheading: "గ్రహ ప్రభావం వల్ల కలిగే భయాల నివారణ మరియు మనోబల వృద్ధి",
    symptomLabel: "మానసిక లక్షణం:",
    strengtheningPracticeLabel: "మనోధైర్య సాధన:",
    templeRemediesHeading: "🪔 శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధి దివ్య పరిహారాలు",
    balaSevaTitle: "బాలారిష్ట శమనం & ఆయుర్వృద్ధి సేవ:",
    vidyaSevaTitle: "సారస్వత & విద్యాభివృద్ధి సేవ:",
    vivahaSevaTitle: "కుజ శాంతి & వివాహ ప్రాప్తి సేవ:",
    gruhasthaSevaTitle: "తిల హోమం, నారాయణ బలి & పితృ శాంతి:",
    cowSevaLabel: "గోసేవ & అన్నదానం:",
    rudrakshaGemLabel: "రుద్రాక్ష & రత్న ధారణ:",
    priestBlessingHeading: "🙏 ప్రధాన అర్చకుల ఆశీర్వచనం & గోకర్ణ సన్నిధి ముద్ర",
    priestName: "శ్రీరామ్ పండిత్",
    priestTitle: "ప్రధాన అర్చకులు, శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం",
    priestPhone: "సంప్రదించండి: +91 99723 39362",
    sanskritAshirvada: "॥ సర్వే భవంతు సుఖినః సర్వే సంతు నిరామయాః । సర్వే భద్రాణి పశ్యంతు మా కశ్చిద్ దుఃఖభాగ్భవేత్ ॥",
    ashirvadaMeaning: "శ్రీ మహాబలేశ్వర స్వామివారి దివ్య కటాక్షంతో జాతకంలోని సమస్త దోషాలు, గండాంతరాలు తొలగి ఆయురారోగ్యాలు కలగాలని ఆశీర్వదించడమైనది.",
    officialSealLabel: "అధికారిక సన్నిధి ముద్ర",
    page1Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం · పుట 1/3 (కొనసాగుతుంది...)",
    page2Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం · పుట 2/3 (కొనసాగుతుంది...)",
    page3Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం · పుట 3/3 (సంపూర్ణం)"
  },
  ta: {
    templeBanner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்ககோண பஞ்சாங்க ஜோதிடம் ॥",
    mainTitle: "ஜாதக தோஷ ஆய்வு, கண்டாந்தரங்கள் & வயதுக்கேற்ற பரிகார அறிக்கை",
    page2Title: "இரண்டாம் பகுதி: எஞ்சிய கர்ம தோஷங்கள், கண்டாந்தர வயது வரம்பு & கவசம்",
    page3Title: "மூன்றாம் பகுதி: உள்ளுறை அச்சங்கள், கோகர்ண மகா சேவைகள் & அர்ச்சகர் ஆசி",
    shloka: "॥ நமஹ சூர்யாய சாந்தாய சர்வரோக நிவாரினே । ஆயுராரோக்யமைஸ்வர்யம் தேஹி தேவ ஜகத்பதே ॥",
    nativeDetails: "ஜாதகர் விபரம்",
    birthDetails: "பிறப்பு விபரம்:",
    lagnaLabel: "லக்னம்:",
    rashiLabel: "சந்திர ராசி:",
    nakshatraLabel: "நட்சத்திரம்:",
    dashaLabel: "நடப்பு மகாதிசை-புத்தி:",
    currentAgeLabel: "தற்போதைய வயது:",
    ageStageLabel: "வாழ்க்கை பருவம்:",
    activeDoshasCountLabel: "நடப்பு தோஷங்கள்:",
    ageStrategyHeading: "⭐ தற்போதைய வயது முன்னுரிமை & உடனடி வழிகாட்டுதல்",
    ageStrategyNotice: "குறிப்பு: ஜாதகரின் தற்போதைய வயதின் அவசர நிலையை அடிப்படையாகக் கொண்டு தோஷங்கள் முன்னுரிமை வரிசையில் (#1, #2, #3...) அடுக்கப்பட்டுள்ளன.",
    immediateActionLabel: "🎯 முதலில் செய்ய வேண்டிய தலையாய கடமை (Immediate Action):",
    agePriorityBadgeLabel: "தற்போதைய வயது முன்னுரிமை",
    technicalRootLabel: "சாஸ்திர ஜோதிடக் காரணம்:",
    realLifeImpactLabel: "நிஜ வாழ்க்கையில் ஏற்படும் பாதிப்புகள்:",
    pariharaHeading: "சாஸ்திர பரிகாரம் & கோகர்ண சேவை:",
    mantraLabel: "மந்திர ஜபம் & பரிகாரங்கள்:",
    daanaLabel: "தானம் & தொண்டு:",
    noDoshaTitle: "🕊️ தூய தோஷமற்ற ஜாதகம் (No Critical Afflictions)",
    noDoshaDesc: "ஜாதகத்தில் கொடிய கர்ம தோஷங்களோ கண்டாந்தரங்களோ இல்லை. ஸ்ரீ மகாபலேஸ்வரர் அருளால் சகல நன்மைகளும் உண்டாகட்டும்.",
    gandantaraHeading: "⚡ கண்டாந்தரங்கள் & பாதுகாப்பு வயது வரம்பு (Life Hazards & Safe Age Limits)",
    gandantaraNotice: "நீர், நெருப்பு, வாகனம், பாம்பு ஆபத்துகளின் பாதுகாப்பு வயது மற்றும் எச்சரிக்கைகள்",
    safeAgeLimitLabel: "பாதுகாப்பு வயது வரம்பு:",
    karmicCauseLabel: "கர்ம காரணம்:",
    mandatoryPrecautionLabel: "கட்டாய கட்டுப்பாடுகள்:",
    protectiveMantraLabel: "பாதுகாப்பு கவசம் & மந்திரங்கள்:",
    fearsHeading: "🧠 உள்ளுறை அச்சங்கள் & மனோபலம் (Innate Fears & Phobias)",
    fearsSubheading: "கிரக தாக்கத்தால் ஏற்படும் உள் பயங்களை நீக்குதல் மற்றும் மனோபலம் பெறுதல்",
    symptomLabel: "மனதின் அறிகுறி:",
    strengtheningPracticeLabel: "மனோபல பயிற்சி:",
    templeRemediesHeading: "🪔 ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி மகா பரிகாரங்கள்",
    balaSevaTitle: "பாலாரிஷ்ட சமனம் & ஆயுள் விருத்தி சேவை:",
    vidyaSevaTitle: "சரஸ்வதி & கல்வி விருத்தி சேவை:",
    vivahaSevaTitle: "செவ்வாய் சாந்தி & திருமணப் பிராப்தி:",
    gruhasthaSevaTitle: "தில ஹோமம், நாராயண பலி & பித்ரு சாந்தி:",
    cowSevaLabel: "கோசேவை & அன்னதானம்:",
    rudrakshaGemLabel: "ருத்ராட்சம் & ரத்தினம்:",
    priestBlessingHeading: "🙏 தலைமை அர்ச்சகர் ஆசி & கோகர்ண சந்நிதி முத்திரை",
    priestName: "ஸ்ரீராம் பண்டித்",
    priestTitle: "தலைமை அர்ச்சகர், ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி",
    priestPhone: "தொடர்புக்கு: +91 99723 39362",
    sanskritAshirvada: "॥ சர்வே பவந்து சுகினஹ சர்வே சந்து நிராமயாஃ । சர்வே பத்ராணி பஸ்யந்து மா கஸ்சித் துக்கபாக்பவேத் ॥",
    ashirvadaMeaning: "ஸ்ரீ மகாபலேஸ்வரர் சுவாமியின் பேரருளால் ஜாதகரின் சகல தோஷங்களும் நீங்கி, தீர்க்காயுளும் நல்வாழ்வும் பெற ஆசீர்வதிக்கப்படுகிறது.",
    officialSealLabel: "அதிகாரப்பூர்வ சந்நிதி முத்திரை",
    page1Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்ககோண பஞ்சாங்க ஜோதிடம் · பக்கம் 1/3 (தொடர்கிறது...)",
    page2Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்ககோண பஞ்சாங்க ஜோதிடம் · பக்கம் 2/3 (தொடர்கிறது...)",
    page3Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்ககோண பஞ்சாங்க ஜோதிடம் · பக்கம் 3/3 (முழுமை)"
  }
};

interface AgeStageRemedyItem {
  icon: string;
  title: string;
  desc: string;
  isPriority?: boolean;
}

const getAgeStageRemedies = (
  stageKey: string,
  lang: SupportedLanguage,
  hasPitru: boolean
): AgeStageRemedyItem[] => {
  if (stageKey === "bala") {
    const titles: Record<SupportedLanguage, string[]> = {
      kn: ["ಬಾಲಾರಿಷ್ಟ ಶಮನ & ಆಯುಷ್ಯ ವೃದ್ಧಿ ಸೇವೆ:", "ಬಾಲ ಸರಸ್ವತೀ & ಮೇಧಾ ಸೂಕ್ತ ಜಪ:", "ಗೋಮಾತೆಗೆ ಮೇವು & ಬಾಲ ರಕ್ಷಾ ಅನ್ನದಾನ:", "ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ರಕ್ಷಾ ಕವಚ:"],
      hi: ["बालारिष्ट शमन एवं आयुष्य होम:", "बाल सरस्वती एवं मेधा सूक्त जप:", "गोसेवा एवं बाल रक्षा अन्नदान:", "पंचमुखी रुद्राक्ष अथवा रक्षा कवच:"],
      te: ["బాలారిష్ట శమనం & ఆయుర్వృద్ధి సేవ:", "బాల సరస్వతీ & మేధా సూక్త జపం:", "గోసేవ & బాల రక్షా అన్నదానం:", "పంచముఖి రుద్రాక్ష లేదా రక్షా కవచం:"],
      ta: ["பாலாரிஷ்ட சமனம் & ஆயுள் விருத்தி சேவை:", "பால சரஸ்வதி & மேதா சூக்த ஜபம்:", "கோசேவை & பால ரக்ஷா அன்னதானம்:", "பஞ்சமுக ருத்ராட்சம் அல்லது ரக்ஷா கவசம்:"],
      en: ["Balarishta Shanti & Longevity Homa:", "Bala Saraswati & Medha Sukta Chant:", "Cow Feeding & Child Protection Annadaana:", "Panchamukhi Rudraksha or Silver Kavacha:"]
    };
    const descs: Record<SupportedLanguage, string[]> = {
      kn: [
        "ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ, ಆಯುಷ್ಯ ಸೂಕ್ತ ಹೋಮ, ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಗೋದಾನ.",
        "ಮಗುವಿನ ವಾಕ್ಶಕ್ತಿ, ಬುದ್ಧಿಮತ್ತೆ ಹಾಗೂ ಉತ್ತಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ ಸರಸ್ವತೀ ಪೂಜೆ.",
        "ಗೋಮಾತೆಗೆ ಬೆಲ್ಲ-ಮೇವು ಸಮರ್ಪಣೆ ಹಾಗೂ ಮಗುವಿನ ಆಯುಷ್ಯಕ್ಕಾಗಿ ಅನ್ನದಾನ.",
        "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಅಭಿಮಂತ್ರಿತ ಶುದ್ಧ ಬೆಳ್ಳಿಯ ರಕ್ಷಾ ಕವಚ ಧಾರಣೆ."
      ],
      hi: [
        "महामृत्युंजय मंत्र जप, आयुष्य सूक्त हवन, रुद्राभिषेक एवं गोदान।",
        "शिशु की वाणी, बुद्धि एवं स्वास्थ्य संवर्धन हेतु सरस्वती पूजन।",
        "गोमाता को गुड़-चारा अर्पण एवं दीर्घायु हेतु अन्नदान।",
        "श्री महाबलेश्वर सान्निध्य में अभिमंत्रित चांदी का रक्षा कवच धारण।"
      ],
      te: [
        "మహామృత్యుంజయ జపం, ఆయుష్య సూక్త హోమం, రుద్రాభిషేకం మరియు గోదానం.",
        "పిల్లల వాక్శక్తి, బుద్ధి మరియు ఆరోగ్య రక్షణకు సరస్వతీ పూజ.",
        "గోమాతకు బెల్లం-గడ్డి సమర్పణ మరియు ఆయుష్షు రక్షణకు అన్నదానం.",
        "శ్రీ మహాబలేశ్వర సన్నిధిలో పూజించిన వెండి రక్షా కవచ ధారణ."
      ],
      ta: [
        "மகா மிருத்யுஞ்ஜய ஜபம், ஆயுஷ்ய சூக்த ஹோமம், ருத்ராபிஷேகம் மற்றும் கோதானம்.",
        "குழந்தையின் வாக்குவன்மை, புத்தி மற்றும் ஆரோக்கியத்திற்கு சரஸ்வதி பூஜை.",
        "பசுவிற்கு வெல்லம்-புல் வழங்கி ஆயுள் பலத்திற்கு அன்னதானம்.",
        "ஸ்ரீ மகாபலேஸ்வரர் சந்நிதியில் பூஜிக்கப்பட்ட வெள்ளி ரக்ஷா கவசம்."
      ],
      en: [
        "Mahamrityunjaya Homa, Ayushya Sukta chant, Rudrabhishekam and Go-Daana.",
        "Saraswati Pooja and Medha Sukta for intellect, speech fluency, and immunity.",
        "Cow feeding with jaggery/fodder and temple Annadaana for longevity.",
        "Consecrated silver protection Kavacha blessed at Sri Gokarna Kshetra."
      ]
    };
    const tList = titles[lang] || titles.kn;
    const dList = descs[lang] || descs.kn;
    return [
      { icon: "🔱", title: tList[0], desc: dList[0] },
      { icon: "📚", title: tList[1], desc: dList[1] },
      { icon: "🐄", title: tList[2], desc: dList[2] },
      { icon: "📿", title: tList[3], desc: dList[3] }
    ];
  }

  if (stageKey === "vidya") {
    const titles: Record<SupportedLanguage, string[]> = {
      kn: ["ಶ್ರೀ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ & ಸರಸ್ವತೀ ಹೋಮ:", "ಬುಧ-ಗುರು ಶಾಂತಿ & ಗಾಯತ್ರೀ ಜಪ ಸಂಕಲ್ಪ:", hasPitru ? "ಪಿತೃ ತರ್ಪಣ & ವಂಶ ರಕ್ಷಣೆ (ವಿಶೇಷ ಆದ್ಯತೆ):" : "ಗೋಸೇವೆ & ವಿದ್ಯಾ ವಿದ್ಯಾರ್ಥಿ ಅನ್ನದಾನ:", "ಚತುರ್ಮುಖಿ / ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ:"],
      hi: ["मेधा दक्षिणामूर्ति एवं सरस्वती महाहवन:", "बुध-गुरु शांति एवं गायत्री जप संकल्प:", hasPitru ? "पितृ तर्पण एवं वंश रक्षा (विशेष प्राथमिकता):" : "गोसेवा एवं विद्यार्थी अन्नदान:", "चतुर्मुखी / पंचमुखी रुद्राक्ष धारण:"],
      te: ["మేధా దక్షిణామూర్తి & సరస్వతీ హోమం:", "బుధ-గురు శాంతి & గాయత్రీ జప సంకల్పం:", hasPitru ? "పితృ తర్పణం & వంశ రక్షణ (ముఖ్య ప్రాధాన్యం):" : "గోసేవ & విద్యా అన్నదానం:", "చతుర్ముఖి / పంచముఖి రుద్రాక్ష ధారణ:"],
      ta: ["மேதா தட்சிணாமூர்த்தி & சரஸ்வதி ஹோமம்:", "புதன்-குரு சாந்தி & காயத்ரி ஜப சங்கல்பம்:", hasPitru ? "பித்ரு தர்ப்பணம் & வம்ச ரக்ஷை (முன்னுரிமை):" : "கோசேவை & மாணவர் அன்னதானம்:", "சதுர்முக / பஞ்சமுக ருத்ராட்ச தாரணம்:"],
      en: ["Medha Dakshinamoorthy & Saraswati Homa:", "Budha-Guru Shanti & Gayatri Sankalpa:", hasPitru ? "Ancestral Tarpanam & Lineage Grace (Priority):" : "Cow Feeding & Student Annadaana:", "4-Mukhi / 5-Mukhi Vidya Rudraksha:"]
    };
    const descs: Record<SupportedLanguage, string[]> = {
      kn: [
        "ಉನ್ನತ ಶಿಕ್ಷಣ, ಏಕಾಗ್ರತೆ, ಗ್ರಹಣಶಕ್ತಿ ಹಾಗೂ ಪರೀಕ್ಷಾ ಯಶಸ್ಸಿಗಾಗಿ ಸರಸ್ವತೀ ಹೋಮ.",
        "ಬುದ್ಧಿ ದೋಷ ನಿವಾರಣೆ, ಗುರು ಕೃಪೆ ಹಾಗೂ ಉಜ್ವಲ ವೃತ್ತಿ ಭವಿಷ್ಯಕ್ಕಾಗಿ ಸಂಕಲ್ಪ ಪೂಜೆ.",
        hasPitru
          ? "ಪೋಷಕರ ಮೂಲಕ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ತಿಲತರ್ಪಣ ನೆರವೇರಿಸಿ ವಿದ್ಯಾಭ್ಯಾಸದ ಅಡೆತಡೆ ನಿವಾರಣೆ."
          : "ಗೋಮಾತೆಗೆ ಸೇವೆ ಹಾಗೂ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿದ್ಯಾರ್ಥಿ ಅನ್ನದಾನ ಸೇವೆ.",
        "ಏಕಾಗ್ರತೆ ಹಾಗೂ ಧಾರಣಾ ಶಕ್ತಿ ವೃದ್ಧಿಗೆ ಗೋಕರ್ಣದಲ್ಲಿ ಪೂಜಿಸಿದ ಪವಿತ್ರ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ."
      ],
      hi: [
        "उच्च शिक्षा, एकाग्रता, ग्रहणशक्ति एवं परीक्षा सफलता हेतु सरस्वती हवन।",
        "बुद्धि भ्रम निवारण, गुरु कृपा एवं उज्ज्वल भविष्य हेतु संकल्प पूजन।",
        hasPitru
          ? "गोकर्ण कोटितीर्थ में पितृ तर्पण करवाकर विद्या अध्ययन की रुकावटें दूर करें।"
          : "गोसेवा एवं गोकर्ण क्षेत्र में जरूरतमंद छात्रों के लिए अन्नदान।",
        "एकाग्रता एवं स्मरणशक्ति वृद्धि हेतु गोकर्ण पूजित पवित्र रुद्राक्ष धारण।"
      ],
      te: [
        "ఉన్నత విద్య, ఏకాగ్రత మరియు పరీక్షా విజయం కొరకు సరస్వతీ హోమం.",
        "బుద్ధి వికాసం, గురు కృప మరియు ఉజ్వల భవిష్యత్తు కోసం సంకల్ప పూజ.",
        hasPitru
          ? "గోకర్ణ కోటితీర్థంలో పితృ తర్పణం ద్వారా విద్యా ఆటంకాలను తొలగించడం."
          : "గోసేవ మరియు గోకర్ణంలో విద్యార్థుల అన్నదాన సేవ.",
        "ఏకాగ్రత మరియు జ్ఞాపకశక్తి పెంపొందించుకోవడానికి పవిత్ర రుద్రాక్ష ధారణ."
      ],
      ta: [
        "உயர்கல்வி, மன ஒருமைப்பாடு மற்றும் தேர்வில் வெற்றி பெற சரஸ்வதி ஹோமம்.",
        "புத்தி கூர்மை, குருவருள் மற்றும் சிறந்த எதிர்காலத்திற்கான சங்கல்ப பூஜை.",
        hasPitru
          ? "கோகர்ண கோடிதீர்த்தத்தில் பித்ரு தர்ப்பணம் செய்து கல்வித் தடைகளை நீக்குதல்."
          : "கோசேவை மற்றும் கோகர்ண சந்நிதியில் மாணவர்களுக்கு அன்னதானம்.",
        "கவனக் குவிப்பு மற்றும் நினைவாற்றல் அதிகரிக்க பூஜிக்கப்பட்ட ருத்ராட்சம்."
      ],
      en: [
        "Saraswati Homa and Medha Sukta at Gokarna for sharp focus, memory, and exam excellence.",
        "Planetary harmonizing for intellectual wisdom, mentor guidance, and academic direction.",
        hasPitru
          ? "Parents perform Tila Tarpanam at Gokarna Kotiteertha to remove academic obstacles."
          : "Cow seva and educational Annadaana for students at Sri Gokarna Temple.",
        "Consecrated Rudraksha for memory retention, calm confidence, and academic peace."
      ]
    };
    const tList = titles[lang] || titles.kn;
    const dList = descs[lang] || descs.kn;
    return [
      { icon: "📚", title: tList[0], desc: dList[0] },
      { icon: "🧠", title: tList[1], desc: dList[1] },
      { icon: hasPitru ? "🪔" : "🐄", title: tList[2], desc: dList[2], isPriority: hasPitru },
      { icon: "📿", title: tList[3], desc: dList[3] }
    ];
  }

  if (stageKey === "vivaha_udyoga") {
    const titles: Record<SupportedLanguage, string[]> = {
      kn: ["ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಕುಜ ಶಾಂತಿ & ಕಲ್ಯಾಣ ಸೇವೆ:", "ಗೋಕರ್ಣ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ & ಉದ್ಯೋಗ ಸಿದ್ಧಿ:", hasPitru ? "ಕೋಟಿತೀರ್ಥ ತಿಲ ಹೋಮ & ನಾರಾಯಣ ಬಲಿ (ಪವಿತ್ರ ಆದ್ಯತೆ):" : "ಆಶ್ಲೇಷಾ ಬಲಿ & ಕಾಲಸರ್ಪ ಶಾಂತಿ:", "ಷಣ್ಮುಖಿ / ಸಪ್ತಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಮಹಾಲಕ್ಷ್ಮೀ ಕವಚ:"],
      hi: ["सुब्रह्मण्य कुज शांति एवं विवाह प्राप्ति:", "गोकर्ण महा रुद्राभिषेक एवं आजीविका सिद्धि:", hasPitru ? "कोटितीर्थ तिल होम एवं नारायण बलि (परम प्राथमिकता):" : "आश्लेषा बलि एवं कालसर्प शांति:", "षण्मुखी / सप्तमुखी रुद्राक्ष अथवा लक्ष्मी कवच:"],
      te: ["సుబ్రహ్మణ్య కుజ శాంతి & వివాహ ప్రాప్తి:", "గోకర్ణ మహా రుద్రాభిషేకం & ఉద్యోగ సిద్ధి:", hasPitru ? "కోటితీర్థ తిల హోమం & నారాయణ బలి (ముఖ్య ప్రాధాన్యం):" : "ఆశ్లేషా బలి & కాలసర్ప శాంతి:", "షణ్ముఖి / సప్తముఖి రుద్రాక్ష లేదా లక్ష్మీ కవచం:"],
      ta: ["சுப்பிரமணிய செவ்வாய் சாந்தி & திருமண சேவை:", "கோகர்ண மகா ருத்ராபிஷேகம் & உத்தியோக சித்தி:", hasPitru ? "கோடிதீர்த்த தில ஹோமம் & நாராயண பலி (முன்னுரிமை):" : "ஆயில்ய பலி & காலசர்ப்ப சாந்தி:", "அறுமுக / ஏழுமுக ருத்ராட்சம் அல்லது லட்சுமி கவசம்:"],
      en: ["Subrahmanya Kuja Shanti & Vivaha Seva:", "Gokarna Rudrabhishekam & Career Seva:", hasPitru ? "Kotiteertha Tila Homa & Narayana Bali (Sacred Priority):" : "Ashlesha Bali & Sarpa Shanti:", "6/7-Mukhi Rudraksha / Lakshmi Talisman:"]
    };
    const descs: Record<SupportedLanguage, string[]> = {
      kn: [
        "ವಿವಾಹ ವಿಳಂಬ ನಿವಾರಣೆ, ಕಲ್ಯಾಣೋತ್ಸವ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ದಾಂಪತ್ಯ ಸೌಖ್ಯಕ್ಕಾಗಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಶಾಂತಿ.",
        "ಉದ್ಯೋಗ ಪ್ರಮೋಷನ್, ವ್ಯಾಪಾರ ವೃದ್ಧಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯಜಯಕ್ಕೆ ರುದ್ರಾಭಿಷೇಕ.",
        hasPitru
          ? "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ತಿಲ ಹೋಮ & ನಾರಾಯಣ ಬಲಿ ಮೂಲಕ ವಿವಾಹ-ವೃತ್ತಿ ಅಡೆತಡೆಗಳ ಶಾಶ್ವತ ನಿವಾರಣೆ."
          : "ನಾಗದೋಷ, ಕಾಳಸರ್ಪ ಶಮನ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿಗಾಗಿ ಗೋಕರ್ಣದಲ್ಲಿ ಪವಿತ್ರ ಆಶ್ಲೇಷಾ ಬಲಿ.",
        "ವೃತ್ತಿ ಕೀರ್ತಿ, ಭಾಗ್ಯೋದಯ ಹಾಗೂ ಆರ್ಥಿಕ ಆಕರ್ಷಣೆಗೆ ಅಭಿಮಂತ್ರಿತ ಕವಚ ಧಾರಣೆ."
      ],
      hi: [
        "विवाह विलंब निवारण, दांपत्य सुख एवं मांगलिक दोष शमन हेतु सुब्रह्मण्य पूजा।",
        "पदोन्नति, व्यापार वृद्धि, आर्थिक स्थिरता एवं कार्य सिद्धि हेतु रुद्राभिषेक।",
        hasPitru
          ? "गोकर्ण कोटितीर्थ में तिल होम एवं नारायण बलि द्वारा करियर-विवाह बाधाओं का स्थायी निवारण।"
          : "नागदोष, कालसर्प शांति एवं वंश रक्षा हेतु गोकर्ण में आश्लेषा बलि।",
        "करियर में यश, भाग्यवृद्धि एवं आर्थिक स्थिरता हेतु अभिमंत्रित रुद्राक्ष धारण।"
      ],
      te: [
        "వివాహ ఆలస్య నివారణ, దాంపత్య సుఖం కొరకు సుబ్రహ్మణ్య కుజ శాంతి పూజ.",
        "ఉద్యోగ ప్రమోషన్, వ్యాపార వృద్ధి మరియు కార్యజయం కొరకు రుద్రాభిషేకం.",
        hasPitru
          ? "గోకర్ణ కోటితీర్థంలో తిల హోమం & నారాయణ బలి ద్వారా వివాహ-ఉద్యోగ ఆటంకాల నివారణ."
          : "నాగదోషం, కాలసర్ప శాంతి కొరకు పవిత్ర ఆశ్లేషా బలి పూజ.",
        "వృత్తిలో కీర్తి, భాగ్యోదయం మరియు ఆర్థిక స్థిరత్వం కొరకు పవిత్ర కవచ ధారణ."
      ],
      ta: [
        "திருமணத் தடை நீங்க, தாம்பத்திய அமைதி பெற சுப்பிரமணிய செவ்வாய் சாந்தி.",
        "பதவி உயர்வு, தொழில் வளர்ச்சி மற்றும் காரிய வெற்றிக்கு ருத்ராபிஷேகம்.",
        hasPitru
          ? "கோகர்ண கோடிதீர்த்தத்தில் தில ஹோமம் & நாராயண பலி மூலம் திருமண-தொழில் தடைகள் நீங்குதல்."
          : "நாக தோஷம், காலசர்ப்ப தோஷ நிவர்த்திக்கு புனித ஆயில்ய பலி பூஜை.",
        "தொழில் மேன்மை, அதிர்ஷ்டம் மற்றும் பொருளாதார வளர்ச்சிக்கு லட்சுமி கவசம்."
      ],
      en: [
        "Subrahmanya Kuja Shanti for removing marriage delays and bestowing harmonious wedlock.",
        "Rudrabhishekam and Navagraha Homa for professional advancement and financial stability.",
        hasPitru
          ? "Perform Tila Homa & Narayana Bali at Gokarna Kotiteertha to dissolve career/marriage obstacles."
          : "Ashlesha Bali at Sri Gokarna Temple for removing Rahu-Ketu and Sarpa afflictions.",
        "Consecrated Rudraksha or Lakshmi talisman for career expansion and wealth retention."
      ]
    };
    const tList = titles[lang] || titles.kn;
    const dList = descs[lang] || descs.kn;
    return [
      { icon: "💍", title: tList[0], desc: dList[0] },
      { icon: "⚡", title: tList[1], desc: dList[1] },
      { icon: hasPitru ? "🪔" : "🌾", title: tList[2], desc: dList[2], isPriority: hasPitru },
      { icon: "📿", title: tList[3], desc: dList[3] }
    ];
  }

  if (stageKey === "gruhastha") {
    const titles: Record<SupportedLanguage, string[]> = {
      kn: ["ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ತಿಲ ಹೋಮ & ನಾರಾಯಣ ಬಲಿ:", "ಆತ್ಮಾಲಿಂಗ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ & ಆಶ್ಲೇಷಾ ಬಲಿ:", "ಮಹಾ ಗೋದಾನ & ಸನ್ನಿಧಿ ಅನ್ನದಾನ ಸೇವೆ:", "ಅಷ್ಟಮುಖಿ ರುದ್ರಾಕ್ಷಿ & ರಕ್ಷಾ ಕವಚ:"],
      hi: ["गोकर्ण कोटितीर्थ तिल होम एवं नारायण बलि:", "आत्मलिंग महा रुद्राभिषेक एवं आश्लेषा बलि:", "महा गोदान एवं सान्निध्य अन्नदान:", "अष्टमुखी रुद्राक्ष एवं रक्षा कवच:"],
      te: ["గోకర్ణ కోటితీర్థ తిల హోమం & నారాయణ బలి:", "ఆత్మలింగ మహా రుద్రాభిషేకం & ఆశ్లేషా బలి:", "మహా గోదానం & ఆలయ అన్నదానం:", "అష్టముఖి రుద్రాక్ష & రక్షా కవచం:"],
      ta: ["கோகர்ண கோடிதீர்த்த தில ஹோமம் & நாராயண பலி:", "ஆத்மலிங்க மகா ருத்ராபிஷேகம் & ஆயில்ய பலி:", "மகா கோதானம் & சந்நிதி அன்னதானம்:", "எண்முக ருத்ராட்சம் & ரக்ஷா கவசம்:"],
      en: ["Gokarna Kotiteertha Tila Homa & Narayana Bali:", "Atmalinga Maha Rudrabhishekam & Ashlesha Bali:", "Maha Go-Daana & Temple Annadaana:", "8-Mukhi Rudraksha & Family Raksha Kavacha:"]
    };
    const descs: Record<SupportedLanguage, string[]> = {
      kn: [
        "ಪೂರ್ವಜರ ಋಣಮುಕ್ತಿ, ಕುಟುಂಬದ ಶಾಂತಿ, ಸಂತಾನ ಕ್ಷೇಮ ಹಾಗೂ ಸಾಲಬಾಧೆ ನಿವಾರಣೆಗೆ ಶಾಶ್ವತ ಶಾಂತಿ.",
        "ಗೋಕರ್ಣ ಆತ್ಮಾಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ-ಆರೋಗ್ಯ ರಕ್ಷಣೆಗೆ ಪೂಜೆ.",
        "ಗೋಮಾತೆಗೆ ಮೇವು-ಬೆಲ್ಲ ಸಮರ್ಪಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಭಕ್ತರಿಗೆ ಮಹಾ ಅನ್ನದಾನ.",
        "ವಿಘ್ನ ನಿವಾರಣೆ, ಶನಿ-ರಾಹು ಪೀಡಾ ಶಮನ ಹಾಗೂ ಕುಟುಂಬದ ಸರ್ವತೋಮುಖ ರಕ್ಷಣೆಗೆ ಧಾರಣೆ."
      ],
      hi: [
        "पितृ ऋण मुक्ति, पारिवारिक शांति, संतान सुख एवं ऋण मुक्ति हेतु अनिवार्य अनुष्ठान।",
        "गोकर्ण आत्मलिंग सान्निध्य में रुद्राभिषेक तथा अचल संपत्ति एवं स्वास्थ्य रक्षा हेतु पूजा।",
        "गोमाता को चारा-गुड़ अर्पण एवं गोकर्ण क्षेत्र में विशाल अन्नदान सेवा।",
        "विघ्न निवारण, शनि-राहु पीड़ा शांति तथा पारिवारिक सुरक्षा हेतु कवच धारण।"
      ],
      te: [
        "పితృ ఋణ విముక్తి, కుటుంబ శాంతి, సంతాన రక్షణ మరియు రుణ విముక్తికి శాంతి పూజ.",
        "గోకర్ణ ఆత్మలింగ సన్నిధిలో మహా రుద్రాభిషేకం మరియు ఆస్తి-ఆరోగ్య రక్షణ పూజలు.",
        "గోమాతకు గడ్డి-బెల్లం సమర్పణ మరియు గోకర్ణ క్షేత్రంలో అన్నదాన సేవ.",
        "సకల విఘ్న నివారణ, శని-రాహు దోషాల శమనం కొరకు రక్షా కవచ ధారణ."
      ],
      ta: [
        "பித்ரு கடன் தீர, குடும்ப அமைதி, சந்தான பாக்கியம் மற்றும் கடன் நிவர்த்திக்கு சிறந்த சாந்தி.",
        "கோகர்ண ஆத்மலிங்க சந்நிதியில் ருத்ராபிஷேகம் மற்றும் சொத்து-உடல்நலப் பாதுகாப்பு வழிபாடு.",
        "பசுவிற்கு தீவனம் அளித்தல் மற்றும் கோகர்ண சந்நிதியில் பக்தர்களுக்கு அன்னதானம்.",
        "சகல தடைகள் நீங்க, சனி-ராகு தோஷங்கள் விலக ரக்ஷா கவசம் அணிதல்."
      ],
      en: [
        "Dissolves ancestral debts, relieves financial burdens, and shields family lineage.",
        "Sacred abhishekam at Gokarna for property security, family vitality, and peace.",
        "Perpetual cow feeding and Annadaana at Sri Gokarna Temple for generational blessings.",
        "Vedic talisman and Rudraksha for warding off obstacles and preserving domestic bliss."
      ]
    };
    const tList = titles[lang] || titles.kn;
    const dList = descs[lang] || descs.kn;
    return [
      { icon: "🪔", title: tList[0], desc: dList[0], isPriority: true },
      { icon: "🔱", title: tList[1], desc: dList[1] },
      { icon: "🐄", title: tList[2], desc: dList[2] },
      { icon: "📿", title: tList[3], desc: dList[3] }
    ];
  }

  // vanaprastha (56+)
  const titles: Record<SupportedLanguage, string[]> = {
    kn: ["ನಾರಾಯಣ ಬಲಿ, ತೀರ್ಥ ಶ್ರಾದ್ಧ & ಮೋಕ್ಷ ಸಂಕಲ್ಪ:", "ಧನ್ವಂತರಿ ಮಹಾ ಆರೋಗ್ಯ ಹೋಮ & ಮೃತ್ಯುಂಜಯ ಜಪ:", "ಗೋಸೇವೆ & ಮಹಾಲಿಂಗ ಅನ್ನದಾನ ಪುಣ್ಯ ಸಂಕಲ್ಪ:", "ಏಕಮುಖಿ / ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಮುಕ್ತಿ ಧಾರಣೆ:"],
    hi: ["नारायण बलि, तीर्थ श्राद्ध एवं मोक्ष संकल्प:", "धन्वंतरि महा आरोग्य हवन एवं मृत्युंजय जप:", "गोसेवा एवं महालिंग अन्नदान पुण्य संकल्प:", "एकमुखी / पंचमुखी रुद्राक्ष मुक्ति धारण:"],
    te: ["నారాయణ బలి, తీర్థ శ్రాద్ధం & మోక్ష సంకల్పం:", "ధన్వంతరి మహా ఆరోగ్య హోమం & మృత్యుంజయ జపం:", "గోసేవ & మహా లింగ అన్నదాన పుణ్య సంకల్పం:", "ఏకముఖి / పంచముఖి రుద్రాక్ష ముక్తి ధారణ:"],
    ta: ["நாராயண பலி, தீர்த்த சிரார்த்தம் & மோட்ச சங்கல்பம்:", "தன்வந்திரி மகா ஆரோக்கிய ஹோமம் & மிருத்யுஞ்ஜய ஜபம்:", "கோசேவை & அன்னதான புண்ணிய சங்கல்பம்:", "ஏகமுக / பஞ்சமுக ருத்ராட்ச முக்தி தாரணம்:"],
    en: ["Narayana Bali & Ancestral Moksha Sankalpa:", "Dhanvantari Health Homa & Mahamrityunjaya Japa:", "Cow Service & Perpetual Annadaana:", "1-Mukhi / 5-Mukhi Mukti Rudraksha:"]
  };
  const descs: Record<SupportedLanguage, string[]> = {
    kn: [
      "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಅತೃಪ್ತ ಪೂರ್ವಜರ ಮುಕ್ತಿಗಾಗಿ ನಾರಾಯಣ ಬಲಿ & ಪವಿತ್ರ ತರ್ಪಣ ಸೇವೆ.",
      "ದೀರ್ಘಾಯುಷ್ಯ ರಕ್ಷಣೆ, ನರ-ಕೀಲುಗಳ ಸ್ವಾಸ್ಥ್ಯ ಹಾಗೂ ಆರೋಗ್ಯ ಶಾಂತಿಗಾಗಿ ದೈವಿಕ ಹೋಮ.",
      "ಗೋಮಾತೆಗೆ ಸೇವೆ ಹಾಗೂ ನಿತ್ಯ ಅನ್ನದಾನ ಸೇವೆಗಳ ಮೂಲಕ ಜನ್ಮ ಪುಣ್ಯಾರ್ಜನೆ ಸಂಕಲ್ಪ.",
      "ಮನಶ್ಶಾಂತಿ, ಈಶ್ವರ ಸಾಕ್ಷಾತ್ಕಾರ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಉನ್ನತಿಗೆ ಪವಿತ್ರ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ."
    ],
    hi: [
      "गोकर्ण कोटितीर्थ में पूर्वजों की सद्गति एवं मुक्ति हेतु नारायण बलि एवं तर्पण।",
      "दीर्घायु रक्षा, जोड़ों एवं स्नायुओं के स्वास्थ्य हेतु धन्वंतरि महाहवन।",
      "गोसेवा एवं नित्य अन्नदान द्वारा अक्षय पुण्य संचय का संकल्प।",
      "मानसिक शांति, भगवद् साक्षात्कार एवं मोक्ष प्राप्ति हेतु रुद्राक्ष धारण।"
    ],
    te: [
      "గోకర్ణ కోటితీర్థంలో పూర్వీకుల ముక్తి కొరకు నారాయణ బలి మరియు తర్పణ సేవలు.",
      "దీర్ఘాయుష్షు రక్షణ, కీళ్ళు-నరాల ఆరోగ్యం కొరకు ధన్వంతరి మహా హోమం.",
      "గోసేవ మరియు నిత్య అన్నదాన సేవల ద్వారా శాశ్వత పుణ్య సంపాదన.",
      "మనోశాంతి, దైవ సాక్షాత్కారం మరియు మోక్షం కొరకు పవిత్ర రుద్రాక్ష ధారణ."
    ],
    ta: [
      "கோகர்ண கோடிதீர்த்தத்தில் முன்னோர்களின் முக்திக்கு நாராயண பலி மற்றும் தர்ப்பணம்.",
      "நீண்ட ஆயுள், மூட்டு-நரம்பு நலன் மற்றும் ஆரோக்கிய சாந்திக்கு தன்வந்திரி ஹோமம்.",
      "கோசேவை மற்றும் தினசரி அன்னதானம் மூலம் புண்ணிய நற்பேறுகளைப் பெறுதல்.",
      "மன அமைதி, இறை அருள் மற்றும் ஆன்மீக உயர்வுக்கு புனித ருத்ராட்சம் அணிதல்."
    ],
    en: [
      "Narayana Bali and ancestral Shraddha at Gokarna Kotiteertha for ancestral elevation and peace.",
      "Consecrated health Homa for vitality, physical comfort, and freedom from chronic ailments.",
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

  const { devoteeInfo, doshas, gandantaraAndBhaya } = report;
  const activeDoshas = (doshas || []).filter((d) => d.isDetected);
  const isPitruActive = activeDoshas.some((d) => d.id === "pitru_dosha");
  const ageStageRemedies = getAgeStageRemedies(devoteeInfo.ageStageKey || "gruhastha", code, isPitruActive);
  const gandantaras = gandantaraAndBhaya?.activeGandantaras || [];
  const fears = gandantaraAndBhaya?.detectedFears || [];

  // Split doshas across pages for clean layout: Page 1 holds top 2 prioritized doshas, Page 2 holds remaining doshas
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
      {/* PAGE 1: DEVOTEE PROFILE, AGE DIRECTIVE & TOP #1 & #2 PRIORITIZED DOSHAS */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          height: "1273px",
          minHeight: "1273px",
          padding: "20px 24px",
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
            height: "1225px",
            maxHeight: "1225px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "14px 18px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 35%, #FEF3C7 100%)",
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
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "10px",
              padding: "9px 14px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "12px", color: "#FDE68A", fontWeight: 800, letterSpacing: "0.5px" }}>
              {t.templeBanner}
            </div>
            <div style={{ fontSize: "15px", fontWeight: 900, color: "#FFFFFF", marginTop: "3px" }}>
              {t.mainTitle}
            </div>
            <div style={{ fontSize: "10px", color: "#FEF08A", fontStyle: "italic", marginTop: "2px" }}>
              {t.shloka}
            </div>
          </div>

          {/* Devotee Info Matrix & Panchanga Details (Clean 4-column A4 grid) */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "8px 12px",
              boxShadow: "0 1.5px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.1fr 1.1fr 1.1fr", gap: "10px", fontSize: "11px", lineHeight: 1.45 }}>
              <div>
                <span style={{ fontWeight: 800, color: "#92400E" }}>👤 {t.nativeDetails}:</span>{" "}
                <span style={{ fontWeight: 900, color: "#451A03" }}>{devoteeInfo.name}</span>
                <div style={{ fontSize: "10px", color: "#57534E", marginTop: "2px" }}>
                  📅 {devoteeInfo.birthDate} • {devoteeInfo.birthTime}
                </div>
              </div>

              <div>
                <span style={{ fontWeight: 800, color: "#92400E" }}>🏛️ {t.lagnaLabel}</span>{" "}
                <span style={{ fontWeight: 700, color: "#451A03" }}>
                  {devoteeInfo.lagnaRashiRecord?.[code] || devoteeInfo.lagnaRashi}
                </span>
                <div style={{ fontSize: "10px", color: "#57534E", marginTop: "2px" }}>
                  🌙 {t.rashiLabel} {devoteeInfo.moonRashiRecord?.[code] || devoteeInfo.moonRashi}
                </div>
              </div>

              <div>
                <span style={{ fontWeight: 800, color: "#92400E" }}>⭐ {t.nakshatraLabel}</span>{" "}
                <span style={{ fontWeight: 700, color: "#451A03" }}>
                  {devoteeInfo.nakshatraRecord?.[code] || devoteeInfo.nakshatra} ({devoteeInfo.pada})
                </span>
                <div style={{ fontSize: "10px", color: "#57534E", marginTop: "2px" }}>
                  ⏳ {t.dashaLabel} {devoteeInfo.currentDashaRecord?.[code] || devoteeInfo.currentDashaStr}
                </div>
              </div>

              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "6px", padding: "5px 7px", textAlign: "center" }}>
                <div style={{ fontWeight: 900, color: "#991B1B", fontSize: "11.5px" }}>
                  ⭐ {t.currentAgeLabel} {devoteeInfo.currentAge || devoteeInfo.devoteeAge} {code === "kn" ? "ವರ್ಷ" : "Yrs"}
                </div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#B91C1C", marginTop: "2px" }}>
                  🔥 {activeDoshas.length} {t.activeDoshasCountLabel} ({devoteeInfo.ageStageNameRecord?.[code] || devoteeInfo.ageStageKey})
                </div>
              </div>
            </div>
          </div>

          {/* Age-Adaptive Priority Strategy Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
              border: "1.5px solid #F59E0B",
              borderRadius: "9px",
              padding: "7px 12px",
              boxShadow: "0 1.5px 3px rgba(245, 158, 11, 0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "12px", fontWeight: 900, color: "#78350F" }}>
                {t.ageStrategyHeading} ({devoteeInfo.ageStageNameRecord?.[code] || "ವಯಸ್ಸು " + (devoteeInfo.currentAge || devoteeInfo.devoteeAge)})
              </div>
              <div style={{ fontSize: "9.5px", background: "#78350F", color: "#FDE68A", padding: "2px 7px", borderRadius: "10px", fontWeight: 800 }}>
                ⚡ {t.agePriorityBadgeLabel}
              </div>
            </div>
            <div style={{ fontSize: "11px", color: "#451A03", fontWeight: 700, marginTop: "3px", lineHeight: 1.4 }}>
              {getLangVal(devoteeInfo.currentAgeFocusSummary, "ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ಮೊದಲ ಆದ್ಯತೆಯ ಪರಿಹಾರಗಳನ್ನು ಕೈಗೊಳ್ಳುವುದು ಅತ್ಯಾವಶ್ಯಕ.")}
            </div>
            <div style={{ fontSize: "9.5px", color: "#92400E", marginTop: "2px", fontStyle: "italic" }}>
              {t.ageStrategyNotice}
            </div>
          </div>

          {/* Page 1 Doshas List: Top 2 Prioritized Doshas */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, marginTop: "4px" }}>
            {page1Doshas.length === 0 ? (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "2px dashed #10B981",
                  borderRadius: "10px",
                  padding: "24px 16px",
                  textAlign: "center",
                  margin: "auto 0"
                }}
              >
                <div style={{ fontSize: "32px" }}>🕊️</div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#065F46", marginTop: "6px" }}>
                  {t.noDoshaTitle}
                </div>
                <div style={{ fontSize: "12px", color: "#047857", marginTop: "4px", lineHeight: 1.5 }}>
                  {t.noDoshaDesc}
                </div>
              </div>
            ) : (
              page1Doshas.map((dosha) => {
                const isCritical = dosha.severity === "critical";
                const isPitru = dosha.id === "pitru_dosha";
                const cardBorder = isPitru
                  ? "2px solid #B45309"
                  : (isCritical ? "1.5px solid #EF4444" : "1.5px solid #F59E0B");
                const headerBg = isPitru
                  ? "linear-gradient(90deg, #FEF3C7 0%, #FDE68A 100%)"
                  : (isCritical
                    ? "linear-gradient(90deg, #FEE2E2 0%, #FEF2F2 100%)"
                    : "linear-gradient(90deg, #FEF3C7 0%, #FFFBEB 100%)");

                return (
                  <div
                    key={dosha.id}
                    style={{
                      background: "#FFFFFF",
                      border: cardBorder,
                      borderRadius: "9px",
                      padding: "8px 12px",
                      boxShadow: isPitru ? "0 2px 6px rgba(180, 83, 9, 0.15)" : "0 1.5px 3px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px"
                    }}
                  >
                    {isPitru && (
                      <div
                        style={{
                          background: "linear-gradient(90deg, #78350F 0%, #B45309 100%)",
                          color: "#FEF3C7",
                          fontSize: "9.5px",
                          fontWeight: 900,
                          padding: "2.5px 8px",
                          borderRadius: "6px",
                          letterSpacing: "0.4px",
                          border: "1px solid #FCD34D"
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
                        background: headerBg,
                        border: isPitru ? "1.5px solid #F59E0B" : (isCritical ? "1px solid #FCA5A5" : "1px solid #FDE68A"),
                        borderRadius: "7px",
                        padding: "5px 9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "15px" }}>{isPitru ? "🪔" : (isCritical ? "⚠️" : "⚡")}</span>
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 900, color: isCritical ? "#991B1B" : "#78350F" }}>
                            {getLangVal(dosha.name)}
                          </span>
                          <span style={{ fontSize: "9.5px", color: "#78350F", marginLeft: "6px" }}>
                            ({dosha.technicalDetail?.scripturalReference})
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {/* Glowing Age Priority Badge */}
                        <span
                          style={{
                            background: isCritical ? "#DC2626" : "#D97706",
                            color: "#FFFFFF",
                            fontSize: "10px",
                            fontWeight: 900,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                          }}
                        >
                          ⚡ {getLangVal(dosha.agePriorityBadge, `ಆದ್ಯತೆ #${dosha.agePriorityRank || 1}`)}
                        </span>
                        <span
                          style={{
                            background: isCritical ? "#FEF2F2" : "#FFFBEB",
                            border: isCritical ? "1px solid #F87171" : "1px solid #FBBF24",
                            color: isCritical ? "#B91C1C" : "#92400E",
                            fontSize: "9.5px",
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: "10px"
                          }}
                        >
                          {getLangVal(dosha.statusBadge)}
                        </span>
                      </div>
                    </div>

                    {/* Age Priority Reason */}
                    {dosha.agePriorityReason && (
                      <div style={{ fontSize: "10px", color: "#78350F", background: "#FEFCE8", padding: "3px 8px", borderRadius: "5px", border: "1px solid #FEF08A", lineHeight: 1.35 }}>
                        <span style={{ fontWeight: 800 }}>📌 {t.agePriorityBadgeLabel}: </span>
                        {getLangVal(dosha.agePriorityReason)}
                      </div>
                    )}

                    {/* 🎯 MANDATORY ACTIVE HIGHLIGHT: IMMEDIATE ACTION REQUIRED */}
                    {dosha.immediateActionRequired && (
                      <div
                        style={{
                          background: "linear-gradient(135deg, #FEF2F2 0%, #FFF7ED 100%)",
                          border: "1.5px solid #DC2626",
                          borderRadius: "7px",
                          padding: "5px 9px",
                          boxShadow: "0 2px 4px rgba(220, 38, 38, 0.12)"
                        }}
                      >
                        <div style={{ fontSize: "10.5px", fontWeight: 900, color: "#991B1B", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>{t.immediateActionLabel}</span>
                        </div>
                        <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#7F1D1D", marginTop: "2px", lineHeight: 1.35 }}>
                          {getLangVal(dosha.immediateActionRequired)}
                        </div>
                      </div>
                    )}

                    {/* Technical Root & Life Struggles */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "6px", fontSize: "10px", lineHeight: 1.35 }}>
                      <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "5px", padding: "4px 7px" }}>
                        <div style={{ fontWeight: 800, color: "#475569" }}>🔍 {t.technicalRootLabel}</div>
                        <div style={{ color: "#1E293B", marginTop: "1px" }}>
                          {getLangVal(dosha.technicalWhy)}
                        </div>
                      </div>

                      <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "5px", padding: "4px 7px" }}>
                        <div style={{ fontWeight: 800, color: "#991B1B" }}>⚡ {t.realLifeImpactLabel}</div>
                        <div style={{ color: "#7F1D1D", marginTop: "1px" }}>
                          {getLangVal(dosha.currentLifeProblems) || getLangVal(dosha.lifeImpact)}
                        </div>
                      </div>
                    </div>

                    {/* Prescribed Parihara & Gokarna Seva */}
                    <div style={{ background: "#FEFCE8", border: "1.5px solid #F59E0B", borderRadius: "6px", padding: "5px 8px", fontSize: "10px", lineHeight: 1.35 }}>
                      <div style={{ fontWeight: 900, color: "#92400E" }}>🪔 {t.pariharaHeading}</div>
                      <div style={{ color: "#451A03", fontWeight: 700, marginTop: "1px" }}>
                        {getLangVal(dosha.recommendedPooja)}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px", fontSize: "9.5px", color: "#78350F" }}>
                        <span><strong>{t.mantraLabel}</strong> {getLangArr(dosha.remedies).slice(0, 2).join(" • ")}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Page 1 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1px dashed #D97706",
              paddingTop: "4px"
            }}
          >
            {t.page1Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 2: REMAINING DOSHAS & CRITICAL GANDANTARA HAZARDS TABLE           */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          height: "1273px",
          minHeight: "1273px",
          padding: "20px 24px",
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
            height: "1225px",
            maxHeight: "1225px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "14px 18px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 35%, #FEF3C7 100%)",
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
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "8px",
              padding: "8px 14px",
              color: "#FFFFFF",
              border: "1.5px solid #F59E0B"
            }}
          >
            <div style={{ fontSize: "11.5px", color: "#FDE68A", fontWeight: 800 }}>
              {t.templeBanner}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px" }}>
              {t.page2Title}
            </div>
          </div>

          {/* Section: Remaining Doshas (Rank 3+) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {page2Doshas.length > 0 ? (
              page2Doshas.slice(0, 2).map((dosha) => {
                const isCritical = dosha.severity === "critical";
                const isPitru = dosha.id === "pitru_dosha";
                return (
                  <div
                    key={dosha.id}
                    style={{
                      background: "#FFFFFF",
                      border: isPitru ? "2px solid #B45309" : (isCritical ? "1.5px solid #EF4444" : "1.5px solid #F59E0B"),
                      borderRadius: "8px",
                      padding: "7px 9px",
                      boxShadow: isPitru ? "0 2px 5px rgba(180, 83, 9, 0.15)" : "0 1px 3px rgba(0,0,0,0.05)"
                    }}
                  >
                    {isPitru && (
                      <div
                        style={{
                          background: "linear-gradient(90deg, #78350F 0%, #B45309 100%)",
                          color: "#FEF3C7",
                          fontSize: "9px",
                          fontWeight: 900,
                          padding: "2px 7px",
                          borderRadius: "5px",
                          letterSpacing: "0.3px",
                          border: "1px solid #FCD34D",
                          marginBottom: "4px"
                        }}
                      >
                        {code === "kn"
                          ? "🪔 ಪವಿತ್ರ ಪಿತೃ ಋಣ ನಿವಾರಣಾ ವಿಶೇಷ ಆದ್ಯತೆ · ಶ್ರೀ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ತಿಲ ಹೋಮ & ನಾರಾಯಣ ಬಲಿ"
                          : "🪔 Sacred Ancestral Karma Priority · Sri Gokarna Kotiteertha Tila Homa & Narayana Bali"}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ fontSize: "14px" }}>{isPitru ? "🪔" : (isCritical ? "⚠️" : "⚡")}</span>
                        <span style={{ fontSize: "12px", fontWeight: 900, color: isCritical ? "#991B1B" : "#78350F" }}>
                          {getLangVal(dosha.name)}
                        </span>
                        <span style={{ fontSize: "9px", color: "#6B7280" }}>
                          ({dosha.technicalDetail?.scripturalReference})
                        </span>
                      </div>
                      <span
                        style={{
                          background: isCritical ? "#DC2626" : "#D97706",
                          color: "#FFFFFF",
                          fontSize: "9.5px",
                          fontWeight: 900,
                          padding: "2px 6px",
                          borderRadius: "10px"
                        }}
                      >
                        ⚡ {getLangVal(dosha.agePriorityBadge, `ಆದ್ಯತೆ #${dosha.agePriorityRank}`)}
                      </span>
                    </div>

                    {dosha.immediateActionRequired && (
                      <div style={{ background: "#FEF2F2", border: "1px solid #F87171", borderRadius: "5px", padding: "4px 6px", marginTop: "4px" }}>
                        <span style={{ fontWeight: 800, color: "#991B1B", fontSize: "10.5px" }}>{t.immediateActionLabel} </span>
                        <span style={{ color: "#7F1D1D", fontWeight: 700, fontSize: "10.5px" }}>{getLangVal(dosha.immediateActionRequired)}</span>
                      </div>
                    )}

                    <div style={{ fontSize: "10px", color: "#374151", marginTop: "3px", lineHeight: 1.35 }}>
                      <strong>{t.pariharaHeading}</strong> {getLangVal(dosha.recommendedPooja)} • <strong>{t.mantraLabel}</strong> {getLangArr(dosha.remedies).slice(0, 2).join(" • ")}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ background: "#FEFCE8", border: "1px solid #FDE047", borderRadius: "7px", padding: "8px 10px", fontSize: "11px", color: "#78350F", fontWeight: 700, textAlign: "center" }}>
                ✓ {code === "kn" ? "ಶೇಷ ಕರ್ಮ ದೋಷಗಳು ಶಾಂತವಾಗಿದ್ದು, ಪ್ರಮುಖ ದೋಷಗಳು ಪ್ರಥಮ ಪುಟದಲ್ಲಿ ಆದ್ಯತಾ ಕ್ರಮದಲ್ಲಿ ದಾಖಲಾಗಿವೆ." : "All primary active doshas prioritized on Page 1."}
              </div>
            )}
          </div>

          {/* Section: Critical Gandantara Hazards & Protective Age Windows */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "9px 11px",
              boxShadow: "0 1.5px 3px rgba(0,0,0,0.05)",
              flex: 1,
              marginTop: "4px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid #FDE68A", paddingBottom: "4px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#991B1B" }}>
                  {t.gandantaraHeading}
                </div>
                <div style={{ fontSize: "9.5px", color: "#92400E", fontWeight: 700 }}>
                  {gandantaras.length} {code === "kn" ? "ಗಂಡಾಂತರಗಳು ಸಕ್ರಿಯ" : "Hazards"}
                </div>
              </div>
              <div style={{ fontSize: "10px", color: "#78350F", marginTop: "2px", fontStyle: "italic" }}>
                {t.gandantaraNotice}
              </div>

              {/* Gandantara Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                {gandantaras.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px", color: "#065F46", fontWeight: 700, fontSize: "11px" }}>
                    ✓ {code === "kn" ? "ಯಾವುದೇ ಮಾರಕ ಜಲ-ಅಗ್ನಿ-ಸರ್ಪ ಗಂಡಾಂತರಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ. ಜಾತಕರು ಸುರಕ್ಷಿತರಾಗಿದ್ದಾರೆ." : "No critical life hazards or Gandantaras detected."}
                  </div>
                ) : (
                  gandantaras.slice(0, 3).map((g) => (
                    <div
                      key={g.id}
                      style={{
                        background: "#FFFBEB",
                        border: "1px solid #FCD34D",
                        borderRadius: "7px",
                        padding: "6px 8px",
                        fontSize: "10.5px",
                        lineHeight: 1.35
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 900, color: "#78350F", fontSize: "11.5px" }}>
                          ⚡ {getLangVal(g.name)}
                        </div>
                        <span style={{ background: "#DC2626", color: "#FFFFFF", fontSize: "9px", fontWeight: 900, padding: "1px 6px", borderRadius: "8px" }}>
                          {t.safeAgeLimitLabel} {getLangVal(g.ageWindowDescription, `${g.vulnerableTillAge} ವರ್ಷದವರೆಗೆ`)}
                        </span>
                      </div>

                      <div style={{ color: "#991B1B", fontWeight: 700, marginTop: "2px" }}>
                        ⛔ {t.mandatoryPrecautionLabel} {getLangArr(g.cautionDirectives).slice(0, 2).join(" • ") || getLangVal(g.technicalReason)}
                      </div>

                      <div style={{ color: "#065F46", fontWeight: 700, marginTop: "2px" }}>
                        🛡️ {t.protectiveMantraLabel} {getLangVal(g.protectiveParihara)} • {getLangArr(g.protectiveMantras).slice(0, 1).join("")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sacred Guidance Box */}
            <div
              style={{
                background: "linear-gradient(135deg, #FEF2F2 0%, #FEF9C3 100%)",
                border: "1px solid #F87171",
                borderRadius: "7px",
                padding: "6px 8px",
                fontSize: "10px",
                color: "#78350F",
                lineHeight: 1.35
              }}
            >
              <strong>🔱 {code === "kn" ? "ಪರಾಶರ ಶಾಸ್ತ್ರ ರಕ್ಷಾ ಸೂತ್ರ:" : "Parashari Hazard Protocol:"}</strong>{" "}
              {code === "kn"
                ? "ಗಂಡಾಂತರ ವಯೋಮಿತಿ ದಾಟುವ ತನಕ ಜಾತಕರಿಗೆ ನಿತ್ಯ ರುದ್ರಾಭಿಷೇಕ ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ, ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆಯುಷ್ಯ ಶಾಂತಿ ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ."
                : "Until the safe age threshold is crossed, daily Mahamrityunjaya chanting, protective sacred ash (Vibhuti), and temple Kavacha are strongly advised."}
            </div>
          </div>

          {/* Page 2 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1px dashed #D97706",
              paddingTop: "4px"
            }}
          >
            {t.page2Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 3: SUBCONSCIOUS FEARS, GOKARNA SEVAS & CHIEF PRIEST BLESSING & SEAL*/}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          height: "1273px",
          minHeight: "1273px",
          padding: "20px 24px",
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
            height: "1225px",
            maxHeight: "1225px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "14px 18px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 35%, #FEF3C7 100%)",
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
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "8px",
              padding: "8px 14px",
              color: "#FFFFFF",
              border: "1.5px solid #F59E0B"
            }}
          >
            <div style={{ fontSize: "11.5px", color: "#FDE68A", fontWeight: 800 }}>
              {t.templeBanner}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px" }}>
              {t.page3Title}
            </div>
          </div>

          {/* Section: Subconscious Innate Phobias & Fears (Top 2-3) */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "8px 11px",
              boxShadow: "0 1.5px 3px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#78350F", borderBottom: "1.5px solid #FDE68A", paddingBottom: "4px" }}>
              🧠 {t.fearsHeading}
            </div>
            <div style={{ fontSize: "10px", color: "#92400E", marginTop: "2px", fontStyle: "italic" }}>
              {t.fearsSubheading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" }}>
              {fears.slice(0, 2).map((fear) => (
                <div
                  key={fear.id}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    padding: "5px 7px",
                    fontSize: "10px",
                    lineHeight: 1.35
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 800, color: "#1E293B" }}>
                      {fear.icon} {getLangVal(fear.name)}
                    </div>
                    <span style={{ fontSize: "8.5px", background: "#EDE9FE", color: "#6D28D9", padding: "1px 5px", borderRadius: "6px", fontWeight: 700 }}>
                      {fear.severity}
                    </span>
                  </div>
                  <div style={{ color: "#DC2626", marginTop: "2px" }}>
                    <strong>{t.symptomLabel}</strong> {getLangVal(fear.psychologicalSymptom)}
                  </div>
                  <div style={{ color: "#065F46", fontWeight: 700, marginTop: "2px" }}>
                    <strong>{t.strengtheningPracticeLabel}</strong> {getLangVal(fear.strengtheningPractice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Sacred Gokarna Mahabaleshwara Remedies tailored to Age Stage */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "8px 11px",
              boxShadow: "0 1.5px 3px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#78350F", borderBottom: "1.5px solid #FDE68A", paddingBottom: "4px" }}>
              🪔 {t.templeRemediesHeading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px", fontSize: "10.5px", lineHeight: 1.35 }}>
              {ageStageRemedies.map((remedy, idx) => (
                <div
                  key={idx}
                  style={{
                    background: remedy.isPriority ? "#FEF2F2" : (idx < 2 ? "#FEFCE8" : "#FFFBEB"),
                    border: remedy.isPriority ? "1.5px solid #F87171" : (idx < 2 ? "1px solid #FDE047" : "1px solid #FCD34D"),
                    borderRadius: "6px",
                    padding: "5px 7px"
                  }}
                >
                  <div style={{ fontWeight: 800, color: remedy.isPriority ? "#991B1B" : "#92400E" }}>
                    {remedy.icon} {remedy.title}
                  </div>
                  <div style={{ color: remedy.isPriority ? "#7F1D1D" : "#451A03", marginTop: "2px" }}>
                    {remedy.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Chief Priest Shreeram Pandit's Blessing & Official Temple Seal */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "8px 11px",
              boxShadow: "0 1.5px 3px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#78350F", borderBottom: "1.5px solid #FDE68A", paddingBottom: "4px", marginBottom: "6px" }}>
              🙏 {t.priestBlessingHeading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "10px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F" }}>
                  {t.priestName}
                </div>
                <div style={{ fontSize: "10.5px", color: "#92400E", fontWeight: 700 }}>
                  {t.priestTitle} · {t.priestPhone}
                </div>
                <div style={{ fontSize: "11px", color: "#991B1B", fontWeight: 800, marginTop: "3px", lineHeight: 1.4 }}>
                  {t.sanskritAshirvada}
                </div>
                <div style={{ fontSize: "10.5px", color: "#451A03", marginTop: "2px", lineHeight: 1.4, fontStyle: "italic" }}>
                  {t.ashirvadaMeaning}
                </div>
              </div>

              {/* Official Temple Seal Graphic */}
              <div
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  border: "2px double #B45309",
                  background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "3px",
                  boxSizing: "border-box",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ fontSize: "15px" }}>🪔</div>
                <div style={{ fontSize: "7px", fontWeight: 900, color: "#78350F", lineHeight: 1.1, marginTop: "1px" }}>
                  {code === "kn" ? "॥ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥" : code === "hi" ? "॥ गोकर्ण सन्निधि ॥" : code === "te" ? "॥ గోకర్ణ సన్నిధి ॥" : code === "ta" ? "॥ கோகர்ண சந்நிதி ॥" : "॥ Sri Gokarna ॥"}
                </div>
                <div style={{ fontSize: "6px", color: "#92400E", fontWeight: 800 }}>
                  {t.officialSealLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Page 3 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1px dashed #D97706",
              paddingTop: "4px"
            }}
          >
            {t.page3Footer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KundliDoshaPdfTemplate;
