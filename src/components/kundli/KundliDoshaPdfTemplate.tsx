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
    priestPhone: "ದೂರವಾಣಿ: +91 94486 24477",
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
    priestPhone: "Contact: +91 94486 24477",
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
    priestPhone: "संपर्क: +91 94486 24477",
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
    priestPhone: "సంప్రదించండి: +91 94486 24477",
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
    priestPhone: "தொடர்புக்கு: +91 94486 24477",
    sanskritAshirvada: "॥ சர்வே பவந்து சுகினஹ சர்வே சந்து நிராமயாஃ । சர்வே பத்ராணி பஸ்யந்து மா கஸ்சித் துக்கபாக்பவேத் ॥",
    ashirvadaMeaning: "ஸ்ரீ மகாபலேஸ்வரர் சுவாமியின் பேரருளால் ஜாதகரின் சகல தோஷங்களும் நீங்கி, தீர்க்காயுளும் நல்வாழ்வும் பெற ஆசீர்வதிக்கப்படுகிறது.",
    officialSealLabel: "அதிகாரப்பூர்வ சந்நிதி முத்திரை",
    page1Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்ககோண பஞ்சாங்க ஜோதிடம் · பக்கம் 1/3 (தொடர்கிறது...)",
    page2Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்ககோண பஞ்சாங்க ஜோதிடம் · பக்கம் 2/3 (தொடர்கிறது...)",
    page3Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்ககோண பஞ்சாங்க ஜோதிடம் · பக்கம் 3/3 (முழுமை)"
  }
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
        width: "794px",
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
          width: "794px",
          height: "1123px",
          padding: "16px",
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
            height: "1091px",
            maxHeight: "1091px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "12px 14px",
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
              padding: "8px 12px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "11.5px", color: "#FDE68A", fontWeight: 800, letterSpacing: "0.5px" }}>
              {t.templeBanner}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF", marginTop: "3px" }}>
              {t.mainTitle}
            </div>
            <div style={{ fontSize: "10px", color: "#FEF08A", fontStyle: "italic", marginTop: "2px" }}>
              {t.shloka}
            </div>
          </div>

          {/* Devotee Info Matrix (4-col grid) */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "7px 10px",
              boxShadow: "0 1.5px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1.2fr", gap: "6px", fontSize: "11px", lineHeight: 1.4 }}>
              <div>
                <span style={{ fontWeight: 800, color: "#92400E" }}>{t.nativeDetails}:</span>{" "}
                <span style={{ fontWeight: 900, color: "#451A03" }}>{devoteeInfo.name}</span>
                <div style={{ fontSize: "10px", color: "#57534E", marginTop: "1px" }}>
                  {devoteeInfo.birthDate} • {devoteeInfo.birthTime}
                </div>
              </div>

              <div>
                <span style={{ fontWeight: 800, color: "#92400E" }}>{t.lagnaLabel}</span>{" "}
                <span style={{ fontWeight: 700, color: "#451A03" }}>
                  {devoteeInfo.lagnaRashiRecord?.[code] || devoteeInfo.lagnaRashi}
                </span>
                <div style={{ fontSize: "10px", color: "#57534E", marginTop: "1px" }}>
                  {t.rashiLabel} {devoteeInfo.moonRashiRecord?.[code] || devoteeInfo.moonRashi}
                </div>
              </div>

              <div>
                <span style={{ fontWeight: 800, color: "#92400E" }}>{t.nakshatraLabel}</span>{" "}
                <span style={{ fontWeight: 700, color: "#451A03" }}>
                  {devoteeInfo.nakshatraRecord?.[code] || devoteeInfo.nakshatra} ({devoteeInfo.pada})
                </span>
                <div style={{ fontSize: "10px", color: "#57534E", marginTop: "1px" }}>
                  {t.dashaLabel} {devoteeInfo.currentDashaRecord?.[code] || devoteeInfo.currentDashaStr}
                </div>
              </div>

              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "6px", padding: "4px 6px", textAlign: "center" }}>
                <div style={{ fontWeight: 900, color: "#991B1B", fontSize: "11.5px" }}>
                  {t.currentAgeLabel} {devoteeInfo.currentAge || devoteeInfo.devoteeAge} {code === "kn" ? "ವರ್ಷ" : "Yrs"}
                </div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#B91C1C", marginTop: "1px" }}>
                  {devoteeInfo.ageStageNameRecord?.[code] || devoteeInfo.ageStageKey} • {activeDoshas.length} {t.activeDoshasCountLabel}
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
              padding: "7px 10px",
              boxShadow: "0 1.5px 3px rgba(245, 158, 11, 0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "12px", fontWeight: 900, color: "#78350F" }}>
                {t.ageStrategyHeading} ({devoteeInfo.ageStageNameRecord?.[code] || "ವಯಸ್ಸು " + (devoteeInfo.currentAge || devoteeInfo.devoteeAge)})
              </div>
              <div style={{ fontSize: "9.5px", background: "#78350F", color: "#FDE68A", padding: "2px 6px", borderRadius: "10px", fontWeight: 800 }}>
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
                const cardBorder = isCritical ? "1.5px solid #EF4444" : "1.5px solid #F59E0B";
                const headerBg = isCritical
                  ? "linear-gradient(90deg, #FEE2E2 0%, #FEF2F2 100%)"
                  : "linear-gradient(90deg, #FEF3C7 0%, #FFFBEB 100%)";

                return (
                  <div
                    key={dosha.id}
                    style={{
                      background: "#FFFFFF",
                      border: cardBorder,
                      borderRadius: "9px",
                      padding: "8px 10px",
                      boxShadow: "0 1.5px 3px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px"
                    }}
                  >
                    {/* Header Row */}
                    <div
                      style={{
                        background: headerBg,
                        border: isCritical ? "1px solid #FCA5A5" : "1px solid #FDE68A",
                        borderRadius: "7px",
                        padding: "5px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "16px" }}>{isCritical ? "⚠️" : "⚡"}</span>
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 900, color: isCritical ? "#991B1B" : "#78350F" }}>
                            {getLangVal(dosha.name)}
                          </span>
                          <span style={{ fontSize: "9.5px", color: "#78350F", marginLeft: "6px" }}>
                            ({dosha.technicalDetail?.scripturalReference})
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        {/* Glowing Age Priority Badge */}
                        <span
                          style={{
                            background: isCritical ? "#DC2626" : "#D97706",
                            color: "#FFFFFF",
                            fontSize: "10px",
                            fontWeight: 900,
                            padding: "2px 7px",
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
                            padding: "2px 6px",
                            borderRadius: "10px"
                          }}
                        >
                          {getLangVal(dosha.statusBadge)}
                        </span>
                      </div>
                    </div>

                    {/* Age Priority Reason */}
                    {dosha.agePriorityReason && (
                      <div style={{ fontSize: "10.5px", color: "#78350F", background: "#FEFCE8", padding: "4px 7px", borderRadius: "5px", border: "1px solid #FEF08A", lineHeight: 1.35 }}>
                        <span style={{ fontWeight: 800 }}>📌 {t.agePriorityBadgeLabel}: </span>
                        {getLangVal(dosha.agePriorityReason)}
                      </div>
                    )}

                    {/* 🎯 MANDATORY ACTIVE HIGHLIGHT: IMMEDIATE ACTION REQUIRED */}
                    {dosha.immediateActionRequired && (
                      <div
                        style={{
                          background: "linear-gradient(135deg, #FEF2F2 0%, #FFF7ED 100%)",
                          border: "2px solid #DC2626",
                          borderRadius: "7px",
                          padding: "6px 8px",
                          boxShadow: "0 2px 4px rgba(220, 38, 38, 0.12)"
                        }}
                      >
                        <div style={{ fontSize: "11px", fontWeight: 900, color: "#991B1B", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>{t.immediateActionLabel}</span>
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#7F1D1D", marginTop: "2px", lineHeight: 1.4 }}>
                          {getLangVal(dosha.immediateActionRequired)}
                        </div>
                      </div>
                    )}

                    {/* Technical Root & Life Struggles */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "6px", fontSize: "10.5px", lineHeight: 1.35 }}>
                      <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "5px", padding: "4px 6px" }}>
                        <div style={{ fontWeight: 800, color: "#475569" }}>🔍 {t.technicalRootLabel}</div>
                        <div style={{ color: "#1E293B", marginTop: "1px" }}>
                          {getLangVal(dosha.technicalWhy)}
                        </div>
                      </div>

                      <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "5px", padding: "4px 6px" }}>
                        <div style={{ fontWeight: 800, color: "#991B1B" }}>⚡ {t.realLifeImpactLabel}</div>
                        <div style={{ color: "#7F1D1D", marginTop: "1px" }}>
                          {getLangVal(dosha.currentLifeProblems) || getLangVal(dosha.lifeImpact)}
                        </div>
                      </div>
                    </div>

                    {/* Prescribed Parihara & Gokarna Seva */}
                    <div style={{ background: "#FEFCE8", border: "1.5px solid #F59E0B", borderRadius: "6px", padding: "5px 7px", fontSize: "10.5px", lineHeight: 1.35 }}>
                      <div style={{ fontWeight: 900, color: "#92400E" }}>🪔 {t.pariharaHeading}</div>
                      <div style={{ color: "#451A03", fontWeight: 700, marginTop: "1px" }}>
                        {getLangVal(dosha.recommendedPooja)}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px", fontSize: "10px", color: "#78350F" }}>
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
          width: "794px",
          height: "1123px",
          padding: "16px",
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
            height: "1091px",
            maxHeight: "1091px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "12px 14px",
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
              padding: "7px 12px",
              color: "#FFFFFF",
              border: "1.5px solid #F59E0B"
            }}
          >
            <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 800 }}>
              {t.templeBanner}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px" }}>
              {t.page2Title}
            </div>
          </div>

          {/* Section: Remaining Doshas (Rank 3+) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {page2Doshas.length > 0 ? (
              page2Doshas.slice(0, 2).map((dosha) => {
                const isCritical = dosha.severity === "critical";
                return (
                  <div
                    key={dosha.id}
                    style={{
                      background: "#FFFFFF",
                      border: isCritical ? "1.5px solid #EF4444" : "1.5px solid #F59E0B",
                      borderRadius: "8px",
                      padding: "7px 9px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ fontSize: "14px" }}>{isCritical ? "⚠️" : "⚡"}</span>
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
          width: "794px",
          height: "1123px",
          padding: "16px",
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
            height: "1091px",
            maxHeight: "1091px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "12px 14px",
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
              padding: "7px 12px",
              color: "#FFFFFF",
              border: "1.5px solid #F59E0B"
            }}
          >
            <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 800 }}>
              {t.templeBanner}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px" }}>
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
              <div style={{ background: "#FEFCE8", border: "1px solid #FDE047", borderRadius: "6px", padding: "5px 7px" }}>
                <div style={{ fontWeight: 800, color: "#92400E" }}>🔱 {t.balaSevaTitle}</div>
                <div style={{ color: "#451A03", marginTop: "2px" }}>
                  {code === "kn"
                    ? "ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ, ಆಯುಷ್ಯ ಹೋಮ, ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಗೋದಾನ."
                    : "Mahamrityunjaya Homa, Ayushya Sukta chant, Rudrabhishekam and Go-Daana."}
                </div>
              </div>

              <div style={{ background: "#FEFCE8", border: "1px solid #FDE047", borderRadius: "6px", padding: "5px 7px" }}>
                <div style={{ fontWeight: 800, color: "#92400E" }}>🌾 {t.gruhasthaSevaTitle}</div>
                <div style={{ color: "#451A03", marginTop: "2px" }}>
                  {code === "kn"
                    ? "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ತಿಲ ಹೋಮ, ನಾರಾಯಣ ಬಲಿ, ಆಶ್ಲೇಷಾ ಬಲಿ & ಕಾಲಸರ್ಪ ಶಾಂತಿ."
                    : "Tila Homa, Narayana Bali, Ashlesha Bali & Sarpa Shanti at Gokarna Kotiteertha."}
                </div>
              </div>

              <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "6px", padding: "5px 7px" }}>
                <div style={{ fontWeight: 800, color: "#92400E" }}>🐄 {t.cowSevaLabel}</div>
                <div style={{ color: "#451A03", marginTop: "2px" }}>
                  {code === "kn"
                    ? "ಗೋಮಾತೆಗೆ ಮೇವು, ಬೆಲ್ಲ ಸಮರ್ಪಣೆ ಹಾಗೂ ಕ್ಷೇತ್ರ ಬ್ರಾಹ್ಮಣ ಅನ್ನದಾನ."
                    : "Cow feeding (Jaggery & fodder) and Annadaana at Sri Gokarna Temple."}
                </div>
              </div>

              <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "6px", padding: "5px 7px" }}>
                <div style={{ fontWeight: 800, color: "#92400E" }}>📿 {t.rudrakshaGemLabel}</div>
                <div style={{ color: "#451A03", marginTop: "2px" }}>
                  {code === "kn"
                    ? "ಜಾತಕಾನುಗುಣ ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಅಥವಾ ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಕವಚ ಧಾರಣೆ."
                    : "Panchamukhi Rudraksha or silver astrological protection Kavacha."}
                </div>
              </div>
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
