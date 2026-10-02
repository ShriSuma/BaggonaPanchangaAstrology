import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import {
  calculateComprehensiveDoshas,
  type ComprehensiveDoshaReport,
  type DetectedDosha,
  type DetectedGandantara,
  type DetectedFear,
} from "../core/ComprehensiveDoshaEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";
import { askGemini } from "../core/GeminiEngine";

// Comprehensive 5-Language UI Dictionary for KundliDoshasPage
const UI_TEXT: Record<string, Record<string, string>> = {
  backToKundli: {
    kn: "← ಜಾತಕಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    hi: "← कुण्डली पर वापस",
    te: "← జాతకానికి తిరిగి వెళ్ళు",
    ta: "← ஜாதகத்திற்குத் திரும்பு",
    en: "← Back to Kundli",
  },
  pageTitle: {
    kn: "॥ ಸಮಗ್ರ ಜಾತಕ ದೋಷ ನಿರ್ಣಯ, ಗಂಡಾಂತರ & ಮನೋಭಯ ದರ್ಶನ ॥",
    hi: "॥ समग्र कुंडली दोष निर्णय, गंडांतर एवं भय दर्शन ॥",
    te: "॥ సమగ్ర జాతక దోష నిర్ణయం, గండాంతర & భయ దర్శనం ॥",
    ta: "॥ முழுமையான ஜாதக தோஷ ஆய்வு, கண்டாந்தர & அச்ச தரிசனம் ॥",
    en: "Comprehensive Kundli Dosha Analysis, Gandantara & Phobia Insights",
  },
  pageSubtitle: {
    kn: "ಸಕ್ರಿಯ ಕರ್ಮ ದೋಷಗಳು, ಜಲ-ಅಗ್ನಿ-ವಾಹನ-ಸರ್ಪ ಗಂಡಾಂತರ ವಯೋಮಿತಿ & ಅಂತರ್ಗತ ಮನೋಭಯಗಳ ಸಂಪೂರ್ಣ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ",
    hi: "सक्रिय कर्म दोष, जल-अग्नि-वाहन-सर्प गंडांतर आयु सीमा एवं अंतर्निहित भय का प्रामाणिक वैदिक विश्लेषण",
    te: "సక్రియ దోషాలు, జల-అగ్ని-వాహన-సర్ప గండాంతర రక్షణ వయస్సు & అంతర్గత భయాల శాస్త్రీయ విశ్లేషణ",
    ta: "நடப்பு தோஷங்கள், நீர்-நெருப்பு-வாகன-சர்ப்ப கண்டாந்தர வயது வரம்பு & உள்ளுறை பயங்களின் முழு ஆய்வு",
    en: "Authentic Parashari Evaluation of Active Doshas, Critical Gandantara Age Thresholds & Innate Subconscious Phobias",
  },
  printPdf: {
    kn: "ಪತ್ರ ಮುದ್ರಣ (Print PDF)",
    hi: "दोष पत्र प्रिंट करें",
    te: "పత్ర ముద్రణ (Print PDF)",
    ta: "அறிக்கை அச்சிடுக (Print PDF)",
    en: "Print Dossier (PDF)",
  },
  downloadPdf: {
    kn: "ದೋಷ ಪತ್ರ PDF ಡೌನ್‌ಲೋಡ್",
    hi: "दोष पत्र PDF डाउनलोड",
    te: "దోష పత్రం PDF డౌన్‌లోడ్",
    ta: "தோஷ அறிக்கை PDF பதிவிறக்கம்",
    en: "Download PDF Dossier",
  },
  ageStrategyCardTitle: {
    kn: "⭐ ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಆದ್ಯತಾ ಸೂಚಿ & ತುರ್ತು ಮಾರ್ಗದರ್ಶನ",
    hi: "⭐ वर्तमान आयु प्राथमिकता निर्देश एवं तत्काल मार्गदर्शन",
    te: "⭐ ప్రస్తుత వయస్సు ప్రాధాన్యత సూచిక & తక్షణ మార్గదర్శనం",
    ta: "⭐ தற்போதைய வயது முன்னுரிமை & உடனடி வழிகாட்டுதல்",
    en: "⭐ Current Age Priority Directives & Immediate Focus",
  },
  ageStrategyNote: {
    kn: "ಗಮನಿಸಿ: ಜಾತಕರ ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ತುರ್ತು ಆಧಾರದ ಮೇಲೆ ದೋಷಗಳನ್ನು ಪರಿಹರಿಸಬೇಕಾದ ಆದ್ಯತಾ ಕ್ರಮದಲ್ಲಿ (#1, #2, #3...) ಜೋಡಿಸಲಾಗಿದೆ.",
    hi: "सूचना: जातक की वर्तमान आयु की तात्कालिक आवश्यकता के अनुसार दोषों को समाधान हेतु प्राथमिकता क्रम (#1, #2, #3...) में व्यवस्थित किया गया है।",
    te: "గమనిక: జాతకుని ప్రస్తుత వయస్సు అత్యవసర స్థితి ఆధారంగా దోషాలు పరిష్కార క్రమంలో (#1, #2, #3...) అమర్చబడ్డాయి.",
    ta: "குறிப்பு: ஜாதகரின் தற்போதைய வயதின் அவசர நிலையை அடிப்படையாகக் கொண்டு தோஷங்கள் முன்னுரிமை வரிசையில் (#1, #2, #3...) அடுக்கப்பட்டுள்ளன.",
    en: "Note: Afflictions are strictly sequenced in ascending urgency order (#1, #2, #3...) tailored to the native's current age.",
  },
  immediateActionTitle: {
    kn: "🎯 ತಕ್ಷಣ ಮೊದಲು ಮಾಡಬೇಕಾದ ಕರ್ತವ್ಯ (Immediate Priority Action)",
    hi: "🎯 सर्वप्रथम करने योग्य अनिवार्य कर्तव्य (Immediate Priority Action)",
    te: "🎯 మొదట చేయవలసిన అత్యవసర కర్తవ్యం (Immediate Priority Action)",
    ta: "🎯 முதலில் செய்ய வேண்டிய தலையாய கடமை (Immediate Priority Action)",
    en: "🎯 Immediate Priority Action (What Must Be Addressed First)",
  },
  agePriorityBadgeLabel: {
    kn: "ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಆದ್ಯತೆ",
    hi: "वर्तमान आयु प्राथमिकता",
    te: "ప్రస్తుత వయస్సు ప్రాధాన్యత",
    ta: "தற்போதைய வயது முன்னுரிமை",
    en: "Current Age Priority",
  },
  currentAgeLabel: {
    kn: "ಪ್ರಸ್ತುತ ವಯಸ್ಸು",
    hi: "वर्तमान आयु",
    te: "ప్రస్తుత వయస్సు",
    ta: "தற்போதைய வயது",
    en: "Current Age",
  },
  ageStageLabel: {
    kn: "ಜೀವನ ಹಂತ",
    hi: "जीवन अवस्था",
    te: "జీవిత దశ",
    ta: "வாழ்க்கை பருவம்",
    en: "Life Stage",
  },
  viewAllTab: {
    kn: "ಸಮಗ್ರ ಪತ್ರ ದರ್ಶನ (Unified Dossier)",
    hi: "समग्र पत्र दर्शन (Unified Dossier)",
    te: "సమగ్ర పత్ర దర్శనం (Unified Dossier)",
    ta: "முழுமையான அறிக்கை (Unified Dossier)",
    en: "Complete Unified Dossier",
  },
  doshasTab: {
    kn: "ಸಕ್ರಿಯ ಕರ್ಮ ದೋಷಗಳು",
    hi: "सक्रिय कर्म दोष",
    te: "సక్రియ కర్మ దోషాలు",
    ta: "நடப்பு கர்ம தோஷங்கள்",
    en: "Active Vedic Doshas",
  },
  gandantaraTab: {
    kn: "ಗಂಡಾಂತರಗಳು & ವಯೋಮಿತಿ",
    hi: "गंडांतर एवं संकट आयु सीमा",
    te: "గండాంతరాలు & రక్షణ వయస్సు",
    ta: "கண்டாந்தரங்கள் & பாதுகாப்பு வயது",
    en: "Life Hazards & Age Windows",
  },
  fearsTab: {
    kn: "ಅಂತರ್ಗತ ಮನೋಭಯಗಳು",
    hi: "अंतर्निहित भय एवं फोबिया",
    te: "అంతర్గత భయాలు & ఫోబియాలు",
    ta: "உள்ளுறை அச்சங்கள் & பயங்கள்",
    en: "Innate Fears & Phobias",
  },
  activeDoshasHeading: {
    kn: "ಸಕ್ರಿಯ ಜಾತಕ ದೋಷಗಳು (ಪ್ರಸ್ತುತ ಬಾಧಿಸುತ್ತಿರುವ ದೋಷಗಳು ಮಾತ್ರ)",
    hi: "सक्रिय कुंडली दोष (केवल वर्तमान में प्रभावित करने वाले दोष)",
    te: "సక్రియ జాతక దోషాలు (ప్రస్తుతం వేధిస్తున్న దోషాలు మాత్రమే)",
    ta: "நடப்பு ஜாதக தோஷங்கள் (தற்போது பாதிக்கும் தோஷங்கள் மட்டுமே)",
    en: "Active Kundli Afflictions (Only Detected & Currently Afflicting Doshas)",
  },
  gandantaraHeading: {
    kn: "⚡ ಗಂಡಾಂತರಗಳು & ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ (Life Hazard Warnings & Safe Age Limits)",
    hi: "⚡ गंडांतर एवं सुरक्षा आयु सीमा (Life Hazard Warnings & Safe Age Limits)",
    te: "⚡ గండాంతరాలు & రక్షణ వయస్సు (Life Hazard Warnings & Safe Age Limits)",
    ta: "⚡ கண்டாந்தரங்கள் & பாதுகாப்பு வயது வரம்பு (Life Hazard Warnings & Safe Age Limits)",
    en: "⚡ Critical Life Hazards & Protective Age Limits (Gandantaragalu)",
  },
  gandantaraSubheading: {
    kn: "ಜಲ, ಅಗ್ನಿ, ವಾಹನ, ಸರ್ಪ, ಪತನ ಇತ್ಯಾದಿ ಅಪಾಯಗಳ ಶಾಸ್ತ್ರೀಯ ವಯೋಮಿತಿ ಹಾಗೂ ಕಡ್ಡಾಯ ನಿಷೇಧಗಳು",
    hi: "जल, अग्नि, वाहन, सर्प, ऊंचाई आदि संकटों की शास्त्रोक्त आयु सीमा एवं अनिवार्य सावधानियां",
    te: "జల, అగ్ని, వాహన, సర్ప ప్రమాదాల శాస్త్రోక్త వయస్సు మరియు నియమాలు",
    ta: "நீர், நெருப்பு, வாகனம், பாம்பு போன்றவற்றின் சாஸ்திர வயது வரம்பு மற்றும் எச்சரிக்கைகள்",
    en: "Parashari age windows, behavioral prohibitions, and protective Kavachas for water, fire, vehicular, and venom hazards",
  },
  fearsHeading: {
    kn: "🧠 ಅಂತರ್ಗತ ಮನೋಭಯಗಳು & ಭೀತಿಗಳು (Innate Subconscious Phobias & Mental Fears)",
    hi: "🧠 अंतर्निहित भय एवं फोबिया (Innate Subconscious Phobias & Mental Fears)",
    te: "🧠 అంతర్గత భయాలు & ఫోబియాలు (Innate Subconscious Phobias & Mental Fears)",
    ta: "🧠 உள்ளுறை அச்சங்கள் & பயங்கள் (Innate Subconscious Phobias & Mental Fears)",
    en: "🧠 Innate Subconscious Phobias & Psychological Fears (Phobia Profile)",
  },
  fearsSubheading: {
    kn: "ಚಂದ್ರ, ಕುಜ, ರಾಹು, ಕೇತುಗಳ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುವ ಜಲಭಯ, ರಕ್ತಭಯ, ಸರ್ಪಭಯ ಹಾಗೂ ಕತ್ತಲೆಯ ಆತಂಕಗಳ ವಿಶ್ಲೇಷಣೆ",
    hi: "चंद्र, मंगल, राहु, केतु के प्रभाव से जल भय, रक्त भय, सर्प भय एवं अंधकार भय का ज्योतिषीय विश्लेषण",
    te: "చంద్రుడు, కుజుడు, రాహువు ప్రభావంతో కలిగే జలభయం, రక్తభయం మరియు చీకటి భయాల విశ్లేషణ",
    ta: "சந்திரன், செவ்வாய், ராகுவால் ஏற்படும் நீர் பயம், இரத்த பயம், பாம்பு பயம் ஆகியவற்றின் ஆய்வு",
    en: "Astrological root causes of hydrophobia, hemophobia, ophidiophobia, nyctophobia, and cognitive fortification",
  },
  filterAllActive: {
    kn: "ಎಲ್ಲಾ ಸಕ್ರಿಯ ದೋಷಗಳು",
    hi: "सभी सक्रिय दोष",
    te: "అన్ని సక్రియ దోషాలు",
    ta: "அனைத்து நடப்பு தோஷங்கள்",
    en: "All Active Doshas",
  },
  filterNatal: {
    kn: "ಜನ್ಮ ಜಾತಕ ದೋಷಗಳು",
    hi: "जन्म कुंडली दोष",
    te: "జన్మ కుండలి దోషాలు",
    ta: "ஜன்ம ஜாதக தோஷங்கள்",
    en: "Natal Afflictions",
  },
  filterDashaSandhi: {
    kn: "ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ",
    hi: "दशा-भुक्ति संधि",
    te: "దశా-భుక్తి సంధి",
    ta: "திசா-புத்தி சந்தி",
    en: "Dasha-Bhukti Sandhi",
  },
  filterGochara: {
    kn: "ಗೋಚಾರ ದೋಷಗಳು",
    hi: "गोचर दोष",
    te: "గోచార దోషాలు",
    ta: "கோசார தோஷங்கள்",
    en: "Transit Afflictions",
  },
  filterPanchanga: {
    kn: "ಪಂಚಾಂಗ ದೋಷಗಳು",
    hi: "पंचांग दोष",
    te: "పంచాంగ దోషాలు",
    ta: "பஞ்சாங்க தோஷங்கள்",
    en: "Panchanga Afflictions",
  },
  currentProblemsTitle: {
    kn: "ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಎದುರಾಗುತ್ತಿರುವ ನೈಜ ಸಮಸ್ಯೆಗಳು (Current Life Problems & Symptoms)",
    hi: "वर्तमान जीवन में उत्पन्न हो रही वास्तविक समस्याएं (Current Life Problems & Symptoms)",
    te: "ప్రస్తుత జీవితంలో ఎదురవుతున్న వాస్తవ సమస్యలు (Current Life Problems & Symptoms)",
    ta: "தற்போதைய வாழ்க்கையில் ஏற்படும் நேரடி பிரச்சனைகள் (Current Life Problems & Symptoms)",
    en: "Current Real-World Life Problems & Acute Symptoms",
  },
  dashaResonanceTitle: {
    kn: "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಪ್ರಭಾವ & ಸಕ್ರಿಯತೆ (Running Dasha-Bhukti Influence)",
    hi: "वर्तमान दशा-भुक्ति प्रभाव एवं सक्रियता (Running Dasha-Bhukti Resonance)",
    te: "ప్రస్తుత దశా-భుక్తి ప్రభావం & సక్రియత (Running Dasha-Bhukti Resonance)",
    ta: "நடப்பு திசா-புத்தி தாக்கம் & தூண்டுதல் (Running Dasha-Bhukti Resonance)",
    en: "Running Dasha-Bhukti Timing & Astrological Resonance",
  },
  technicalWhyTitle: {
    kn: "ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ಕಾರಣ (Technical Astrological Why)",
    hi: "शास्त्रीय ज्योतिषीय कारण (Technical Astrological Why)",
    te: "శాస్త్రీయ జ్యోతిష కారణం (Technical Astrological Why)",
    ta: "சாஸ்திர தொழில்நுட்ப காரணம் (Technical Astrological Why)",
    en: "Technical Astrological Justification (Why)",
  },
  lifeImpactTitle: {
    kn: "ದೈನಂದಿನ ಜೀವನದ ಪ್ರಭಾವ (Real-World Life Impact)",
    hi: "दैनिक जीवन पर प्रभाव (Real-World Life Impact)",
    te: "దైనందిన జీవిత ప్రభావం (Real-World Life Impact)",
    ta: "தினசரி வாழ்க்கைத் தாக்கம் (Real-World Life Impact)",
    en: "Deep Psychological & Life Impact",
  },
  shantiRemediesTitle: {
    kn: "ಶಾಸ್ತ್ರೋಕ್ತ ಶಾಂತಿ & ಪರಿಹಾರಗಳು (Sacred Vedic Shanti & Parihara)",
    hi: "शास्त्रोक्त शांति एवं वैदिक परिहार (Sacred Vedic Shanti & Parihara)",
    te: "శాస్త్రోక్త శాంతి & పరిహారాలు (Sacred Vedic Shanti & Parihara)",
    ta: "சாஸ்திரோக்த சாந்தி & பரிகாரங்கள் (Sacred Vedic Shanti & Parihara)",
    en: "Prescribed Vedic Shanti & Temple Parihara",
  },
  recommendedPoojaLabel: {
    kn: "ಶಿಫಾರಸು ಮಾಡಿದ ಶಾಸ್ತ್ರೋಕ್ತ ಪೂಜೆ / ಪುಣ್ಯಕ್ಷೇತ್ರ:",
    hi: "अनुशंसित वैदिक पूजा / तीर्थ क्षेत्र:",
    te: "సిఫార్సు చేయబడిన శాస్త్రోక్త పూజ / పుణ్యక్షేత్రం:",
    ta: "பரிந்துரைக்கப்பட்ட சாஸ்திர பூஜை / புண்ணியத்தலம்:",
    en: "Recommended Consecrated Ritual & Pilgrimage Kshetra:",
  },
  dailyRemediesLabel: {
    kn: "ದೈನಂದಿನ ಆಚರಣೆಗಳು & ಮಂತ್ರ ಪರಿಹಾರ:",
    hi: "दैनिक नियम एवं वैदिक मंत्र परिहार:",
    te: "దైనందిన ఆచరణలు & మంత్ర పరిహారం:",
    ta: "தினசரி ஆன்மீக வழிபாடுகள் & மந்திர ஜபம்:",
    en: "Prescribed Daily Spiritual Disciplines & Mantras:",
  },
  cautionProhibitionsLabel: {
    kn: "ಕಡ್ಡಾಯ ಶಾಸ್ತ್ರೀಯ ಎಚ್ಚರಿಕೆ & ನಿಷೇಧಗಳು (Mandatory Precautionary Directives):",
    hi: "अनिवार्य शास्त्रीय सावधानियां एवं निषेध:",
    te: "తప్పనిసరిగా పాటించవలసిన జాగ్రత్తలు & నిషేధాలు:",
    ta: "கட்டாய முன்னெச்சரிக்கைகள் மற்றும் தவிர்க்க வேண்டியவை:",
    en: "Mandatory Precautionary Prohibitions & Cautions:",
  },
  protectiveKavachaLabel: {
    kn: "ರಕ್ಷಾ ಕವಚ & ಶಾಂತಿ ಪರಿಹಾರ:",
    hi: "रक्षा कवच एवं शांति परिहार:",
    te: "రక్షా కవచం & శాంతి పరిహారం:",
    ta: "பாதுகாப்பு கவசம் & சாந்தி பரிகாரம்:",
    en: "Prescribed Protective Kavacha & Vedic Parihara:",
  },
  symptomLabel: {
    kn: "ಮನಸ್ಸಿನ ಲಕ್ಷಣ & ಅನುಭವ:",
    hi: "मानसिक लक्षण एवं अनुभूति:",
    te: "మానసిక లక్షణాలు & అనుభవం:",
    ta: "மனோவியல் உணர்வுகள் & அறிகுறிகள்:",
    en: "Psychological & Somatic Manifestation:",
  },
  realLifeSymptomLabel: {
    kn: "ದೈನಂದಿನ ನಡವಳಿಕೆ & ಪ್ರಭಾವ:",
    hi: "दैनिक व्यवहार एवं प्रभाव:",
    te: "దైనందిన ప్రవర్తన & ప్రభావం:",
    ta: "அன்றாட நடத்தை & தாக்கம்:",
    en: "Real-Life Behavioral Manifestation:",
  },
  mindStrengtheningLabel: {
    kn: "ಮನೋಸ್ಥೈರ್ಯ ಹೆಚ್ಚಿಸುವ ಪರಿಹಾರ & ನಿಯಮ:",
    hi: "मानसिक शक्ति वर्धक उपाय एवं नियम:",
    te: "మనోధైర్యాన్ని పెంచే పరిహారం:",
    ta: "மன தைரியத்தை அதிகரிக்கும் வழிகள்:",
    en: "Mind-Strengthening Practice & Remedy:",
  },
  pureKundliTitle: {
    kn: "🌟 ಪರಿಶುದ್ಧ ನಿರ್ದೋಷ ಜಾತಕ (Auspicious Pure Horoscope) 🌟",
    hi: "🌟 परम शुभ निर्दोष कुंडली (Auspicious Pure Horoscope) 🌟",
    te: "🌟 పరమ శుభ నిర్దోష జాతకం (Auspicious Pure Horoscope) 🌟",
    ta: "🌟 பரிபூரண சுப நிர்தோஷ ஜாதகம் (Auspicious Pure Horoscope) 🌟",
    en: "🌟 Fully Auspicious Pure Chart (Nir-Dosha Horoscope) 🌟",
  },
  pureKundliDesc: {
    kn: "ಅತ್ಯಂತ ಹರ್ಷದಾಯಕ ಸಂಗತಿ! ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಯಾವುದೇ ಪ್ರಮುಖ ಮಾರಕ ಅಥವಾ ಕರ್ಮ ದೋಷಗಳು (ಪಿತೃ, ನಾರಾಯಣ ಬಲಿ, ಕಾಳಸರ್ಪ, ಗುರು ಚಂಡಾಲ, ಶ್ರಪಿತ, ಗ್ರಹಣ, ಕೇಮದ್ರುಮ, ಗಂಡಾಂತ, ಕುಜ ಇತ್ಯಾದಿ) ಸಕ್ರಿಯವಾಗಿ ಬಾಧಿಸುತ್ತಿಲ್ಲ. ನಿಮ್ಮ ಜಾತಕವು ಶುಭ ಗ್ರಹಗಳ ಸೌಮ್ಯ ದೃಷ್ಟಿಯಿಂದ ರಕ್ಷಿಸಲ್ಪಟ್ಟಿದೆ. ನಿತ್ಯ ಇಷ್ಟದೇವತಾ ಆರಾಧನೆಯಿಂದ ಸಕಲ ಶುಭ ಫಲಗಳು ಪ್ರಾಪ್ತಿಯಾಗಲಿವೆ.",
    hi: "अत्यंत प्रसन्नता का विषय है! आपकी जन्म कुंडली में कोई भी प्रमुख मारक अथवा कर्म दोष (पितृ, नारायण बलि, कालसर्प, गुरु चांडाल, श्रापित, ग्रहण, केमद्रुम, गंडमूल, मांगलिक आदि) सक्रिय नहीं है। कुंडली शुभ ग्रहों की कृपा से सुरक्षित है। नित्य इष्टदेव उपासना से जीवन में सुख, शांति एवं सर्वत्र समृद्धि प्राप्त होगी।",
    te: "చాలా సంతోషకరమైన విషయం! మీ జన్మ కుండలిలో ఎలాంటి తీవ్రమైన దోషాలు (పితృ, నారాయణ బలి, కాలసర్ప, గురు చాండాల, శ్రాపిత, గ్రహణ, కేమద్రుమ, గండాంత, కుజ మొదలైనవి) బాధింపబడటం లేదు. శుభ గ్రహాల రక్షణ మీకు లభిస్తోంది. నిత్య ఇష్టదైవ ఆరాధనతో సకల శుభాలు కలుగుతాయి.",
    ta: "மிகவும் மகிழ்ச்சிகரமான நிலை! உங்கள் ஜாதகத்தில் பித்ரு, நாராயண பலி, காலசர்ப்ப, குரு சண்டாள, சிராபித, கிரகண, கேமத்ரும, கண்டாந்த, குஜ போன்ற எவ்வித கடுமையான தோஷங்களும் பாதிக்கவில்லை. சுப கிரகங்களின் ஆசிகள் நிறைந்துள்ளன. தினசரி இஷ்டதெய்வ வழிபாட்டால் சகல மங்கலங்களும் உண்டாகும்.",
    en: "Rejoice! Your natal chart is completely unblemished by any active major Vedic afflictions (Pitru, Narayana Bali, Kala Sarpa, Guru Chandala, Shrapit, Grahan, Kemadruma, Gandanta, or Kuja Dosha). Benefic planetary aspects shield your chart. Continued devotion to your Ishta Devata will ensure boundless prosperity and sustained peace.",
  },
  noGandantaraTitle: {
    kn: "🛡️ ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚ - ಯಾವುದೇ ತೀವ್ರ ಗಂಡಾಂತರಗಳಿಲ್ಲ",
    hi: "🛡️ दैवीय रक्षा कवच - कोई तीव्र गंडांतर नहीं",
    te: "🛡️ దైవిక రక్షణ కవచం - ఎలాంటి తీవ్ర గండాంతరాలు లేవు",
    ta: "🛡️ தெய்வீக பாதுகாப்பு - தீவிர கண்டாந்தரங்கள் இல்லை",
    en: "🛡️ Divine Planetary Armor - No Critical Life Hazards Detected",
  },
  noGandantaraDesc: {
    kn: "ಶುಭ ಸಂದೇಶ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಜಲ, ಅಗ್ನಿ, ವಾಹನ ಅಥವಾ ಸರ್ಪ ಸಂಬಂಧಿತ ಯಾವುದೇ ಮಾರಕ ಗಂಡಾಂತರ ಯೋಗಗಳಿಲ್ಲ. ಆಯುಷ್ಯ ಸ್ಥಾನವು ಸುದೃಢವಾಗಿದ್ದು ದೈವ ಕೃಪೆಯಿಂದ ಸಂರಕ್ಷಿಸಲ್ಪಟ್ಟಿದೆ.",
    hi: "शुभ समाचार! आपकी कुंडली में जल, अग्नि, वाहन अथवा सर्प संबंधी कोई घातक गंडांतर योग नहीं है। आयु भाव सुदृढ़ एवं सुरक्षित है।",
    te: "శుభ వార్త! మీ జాతకంలో ఎలాంటి ప్రాణాంతక గండాంతరాలు లేవు. ఆయుష్షు స్థానం బలంగా ఉంది.",
    ta: "நற்செய்தி! உங்கள் ஜாதகத்தில் எவ்வித கொடிய கண்டாந்தர அமைப்புகளும் இல்லை. ஆயுள் பலம் நிறைந்துள்ளது.",
    en: "Rejoice! Your horoscope is completely free of any fatal aquatic, fiery, vehicular, or venomous hazard yogas. The longevity house (Ayur Bhava) is well-fortified by benefic protection.",
  },
  noFearsTitle: {
    kn: "🦁 ಅದಮ್ಯ ಮನೋಸ್ಥೈರ್ಯ - ಯಾವುದೇ ತೀವ್ರ ಅಂತರ್ಗತ ಭಯಗಳಿಲ್ಲ",
    hi: "🦁 अदम्य मानसिक साहस - कोई गंभीर अंतर्निहित भय नहीं",
    te: "🦁 అద్భుత మనోధైర్యం - ఎలాంటి తీవ్ర అంతర్గత భయాలు లేవు",
    ta: "🦁 அசாத்திய மன தைரியம் - தீவிர உள்ளுறை அச்சங்கள் இல்லை",
    en: "🦁 High Emotional Fortitude - No Deep Pathological Phobias Detected",
  },
  noFearsDesc: {
    kn: "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಚಂದ್ರ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಗಳು ಬಲಿಷ್ಠರಾಗಿದ್ದು, ಯಾವುದೇ ಆಳವಾದ ಜಲಭಯ, ರಕ್ತಭಯ ಅಥವಾ ಸರ್ಪಭಯಗಳಿಲ್ಲ. ಮನಸ್ಸು ಸ್ಥಿರ ಹಾಗೂ ಧೈರ್ಯಶಾಲಿಯಾಗಿದೆ.",
    hi: "कुंडली में चंद्रमा एवं लग्नेश बली हैं। जातक में जल, रक्त या अंधेरे का कोई आंतरिक भय नहीं है। मन शांत एवं साहसी है।",
    te: "కుండలిలో చంద్రుడు మరియు లగ్నాధిపతి బలంగా ఉండటం వల్ల మనోధైర్యం పుష్కలంగా ఉంది.",
    ta: "சந்திரன் பலமாக இருப்பதால் எந்தவிதமான அச்சமும் இன்றி மன உறுதி நிறைந்துள்ளது.",
    en: "Benefic positioning of Moon and Lagna lord shields the subconscious mind against phobic fixations (hydrophobia, hemophobia, or nyctophobia). Mental grounding and courage are resilient.",
  },
  nativeName: {
    kn: "ಜಾತಕರ ಹೆಸರು",
    hi: "जातक का नाम",
    te: "జాతకుని పేరు",
    ta: "ஜாதகர் பெயர்",
    en: "Native's Name",
  },
  lagnaLabel: {
    kn: "ಜನ್ಮ ಲಗ್ನ",
    hi: "जन्म लग्न",
    te: "జన్మ లగ్నం",
    ta: "ஜன்ம லக்னம்",
    en: "Ascendant (Lagna)",
  },
  moonLabel: {
    kn: "ಚಂದ್ರ ರಾಶಿ & ನಕ್ಷತ್ರ",
    hi: "चंद्र राशि एवं नक्षत्र",
    te: "చంద్ర రాశి & నక్షత్రం",
    ta: "சந்திர ராசி & நட்சத்திரம்",
    en: "Moon Sign & Star",
  },
  activeCountLabel: {
    kn: "ಸಕ್ರಿಯ ಬಾಧಕ ದೋಷಗಳು",
    hi: "सक्रिय बाधक दोष",
    te: "సక్రియ బాధక దోషాలు",
    ta: "நடப்பு பாதக தோஷங்கள்",
    en: "Active Afflictions",
  },
  currentDashaLabel: {
    kn: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ-ಭುಕ್ತಿ",
    hi: "वर्तमान महादशा-भुक्ति",
    te: "ప్రస్తుత మహాదశ-భుక్తి",
    ta: "நடப்பு மகாதிசை-புத்தி",
    en: "Running Dasha-Bhukti",
  },
  pitruBannerHeader: {
    kn: "॥ ಪಿತೃ ದೇವೋ ಭವ - ಪ್ರಧಾನ ಪೂರ್ವಜ ಋಣ ಮೋಚನಾ ಮಹಾ ಸಂಕಲ್ಪ ॥",
    hi: "॥ पितृ देवो भव - प्रधान पूर्वज ऋण मोचन महा संकल्प ॥",
    te: "॥ పితృ దేవో భవ - ప్రధాన పూర్వీకుల ఋణ విముక్తి మహా సంకల్పం ॥",
    ta: "॥ பித்ரு தேவோ பவ - முதன்மை முன்னோர்கள் கடன் தீர்க்கும் மகா சங்கல்பம் ॥",
    en: "॥ Pitru Devo Bhava - Supreme Ancestral Debt Liberation Guidance ॥",
  },
  pitruBannerBadge: {
    kn: "ಆದ್ಯತೆ #1 • ಪ್ರಧಾನ ಕರ್ತವ್ಯ",
    hi: "प्राथमिकता #1 • सर्वोच्च कर्तव्य",
    te: "ప్రాధాన్యత #1 • అత్యున్నత కర్తవ్యం",
    ta: "முன்னுரிமை #1 • தலையாய கடமை",
    en: "Priority #1 • Supreme Ancestral Duty",
  },
  pitruBannerDesc: {
    kn: "ಜಾತಕದಲ್ಲಿ ಪಿತೃ ದೋಷವು ಸಕ್ರಿಯವಾಗಿದ್ದು, ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಇದು ಎಲ್ಲಾ ಶುಭ ಕಾರ್ಯಗಳು, ಸಂತಾನ, ವಿದ್ಯಾ ಹಾಗೂ ಆರ್ಥಿಕ ಸಮೃದ್ಧಿಗೆ ಮೂಲ ಅಡೆತಡೆಯಾಗಿರುತ್ತದೆ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕೋಟಿತೀರ್ಥ ಪವಿತ್ರ ಕ್ಷೇತ್ರದಲ್ಲಿ ತಿಲ ಹೋಮ, ನಾರಾಯಣ ಬಲಿ & ಪಿತೃ ತರ್ಪಣ ಕೈಗೊಳ್ಳುವುದು ಪ್ರಪ್ರಥಮ ಕರ್ತವ್ಯ.",
    hi: "कुंडली में पितृ दोष सक्रिय है। शास्त्रानुसार यह विवाह, संतति, करियर एवं धन वृद्धि में मूल बाधा माना गया है। श्री गोकर्ण महाबलेश्वर कोटितीर्थ क्षेत्र में तिल होम, नारायण बलि एवं पितृ तर्पण संपन्न करना सर्वप्रथम अनिवार्य कर्तव्य है।",
    te: "జాతకంలో పితృ దోషం సక్రియంగా ఉంది. శాస్త్రం ప్రకారం ఇది వివాహం, సంతానం, విద్య మరియు ధనవృద్ధికి ప్రధాన అడ్డంకి. శ్రీ గోకర్ణ కోటితీర్థంలో తిల హోమం, నారాయణ బలి మరియు పితృ తర్పణం చేయడం ప్రథమ కర్తవ్యం.",
    ta: "ஜாதகத்தில் பித்ரு தோஷம் தீவிரமாக உள்ளது. சாஸ்திரப்படி இது திருமணம், வம்ச விருத்தி, கல்வி மற்றும் பொருளாதார உயர்வுக்கு முதன்மைத் தடையாகும். கோகர்ண கோடிதீர்த்தத்தில் தில ஹோமம், நாராயண பலி மற்றும் பித்ரு தர்ப்பணம் செய்வது தலையாய கடமை.",
    en: "Pitru Dosha is actively afflicting the chart. Classically, ancestral debt must be redeemed before any other remedies can bear fruit. Performing Tila Homa, Narayana Bali & Pitru Tarpanam at Sri Gokarna Mahabaleshwara Kotiteertha Kshetra is the foremost priority.",
  },
  pitruGokarnaAction: {
    kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ತಿಲ ಹೋಮ & ನಾರಾಯಣ ಬಲಿ ಸಂಕಲ್ಪ",
    hi: "श्री गोकर्ण कोटितीर्थ तिल होम एवं नारायण बलि संकल्प",
    te: "శ్రీ గోకర్ణ కోటితీర్థ తిల హోమం & నారాయణ బలి సంకల్పం",
    ta: "ஸ்ரீ கோகர்ண கோடிதீர்த்த தில ஹோமம் & நாராயண பலி சங்கல்பம்",
    en: "Sri Gokarna Kotiteertha Tila Homa & Narayana Bali Sankalpa",
  },
  pitruChiefPriestCall: {
    kn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಪ್ರಧಾನ ಅರ್ಚಕರು): +91 99723 39362",
    hi: "श्रीराम पंडित (प्रधान अर्चक): +91 99723 39362",
    te: "శ్రీరామ్ పండితులు (ప్రధాన అర్చకులు): +91 99723 39362",
    ta: "ஸ்ரீராம் பண்டிதர் (தலைமை குருக்கள்): +91 99723 39362",
    en: "Shreeram Pandit (Chief Priest): +91 99723 39362",
  },
  supremeAncestralDuty: {
    kn: "👑 ಪೂರ್ವಜ ಋಣ ಮೋಚನ (Supreme Ancestral Duty)",
    hi: "👑 पूर्वज ऋण मोचन (Supreme Ancestral Duty)",
    te: "👑 పూర్వీకుల ఋణ విముక్తి (Supreme Ancestral Duty)",
    ta: "👑 பித்ரு கடன் நிவர்த்தி (Supreme Ancestral Duty)",
    en: "👑 Supreme Ancestral Duty (Pitru Mukti)",
  },
  aiGuidanceBtn: {
    kn: "🤖 AI ದೈವಿಕ ವಯೋನುಗುಣ ಮಾರ್ಗದರ್ಶನ",
    hi: "🤖 AI वैदिक आयु-आधारित मार्गदर्शन",
    te: "🤖 AI దైవిక వయోనుగుణ మార్గదర్శనం",
    ta: "🤖 AI தெய்வீக வயது வழிகாட்டுதல்",
    en: "🤖 AI Divine Life-Stage Directives",
  },
  aiParashariFallbackLabel: {
    kn: "ಪರಾಶರ ಸಿದ್ಧಾಂತ ಶಾಸ್ತ್ರೀಯ ಮಾರ್ಗದರ್ಶನ",
    hi: "पराशर शास्त्रीय मार्गदर्शन",
    te: "పరాశర శాస్త్రీయ మార్గదర్శనం",
    ta: "பராசர சாஸ்திர வழிகாட்டுதல்",
    en: "Classical Parashari Directives",
  },
  aiGeneratedLabel: {
    kn: "✨ ಶಾಸ್ತ್ರೋಕ್ತ ಜ್ಯೋತಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ & ಮಾರ್ಗದರ್ಶನ",
    hi: "✨ शास्त्रोक्त ज्योतिषीय विश्लेषण एवं मार्गदर्शन",
    te: "✨ శాస్త్రోక్త జ్యోతిష్య విశ్లేషణ & మార్గదర్శనం",
    ta: "✨ சாஸ்திர ஜோதிட ஆய்வு & வழிகாட்டல்",
    en: "✨ Shastric Astrological Analysis & Guidance",
  },
  aiGeneratingLabel: {
    kn: "ಶಾಸ್ತ್ರೋಕ್ತ ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    hi: "शास्त्रोक्त विश्लेषण तैयार हो रहा है...",
    te: "శాస్త్రోక్త విశ్లేషణ సిద్ధమవుతోంది...",
    ta: "சாஸ்திர ஆய்வு தயாராகிறது...",
    en: "Synthesizing Shastric Analysis...",
  },
  aiRevertToParashari: {
    kn: "ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    hi: "शास्त्रीय सिद्धांत पर लौटें",
    te: "శాస్త్రీయ సిద్ధాంతానికి తిరిగి వెళ్ళు",
    ta: "சாஸ்திர முறைக்கு திரும்பு",
    en: "Revert to Parashari Engine",
  }
};

export const KundliDoshasPage: React.FC = () => {
  const { i18n } = useTranslation();
  const setPage = useAppStore((s) => s.setPage);
  const session = useKundliViewerStore((s) => s.session);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);

  // Selected language for dosha view (kn, hi, te, ta, en)
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    const l = i18n.language ? i18n.language.split("-")[0] : "kn";
    return ["kn", "hi", "te", "ta", "en"].includes(l) ? l : "kn";
  });

  // Main Section Tab: "all_sections" | "doshas" | "gandantara" | "fears"
  const [mainTab, setMainTab] = useState<"all_sections" | "doshas" | "gandantara" | "fears">("all_sections");

  // Sub-filter for active doshas
  const [activeFilter, setActiveFilter] = useState<"all" | "natal" | "dasha_sandhi" | "gochara" | "panchanga">("all");

  // Local fallback state if no session in store
  const [localKundli, setLocalKundli] = useState<KundliOutput | null>(session?.result ?? null);
  const [localInput, setLocalInput] = useState<KundliInput | null>(session?.input ?? null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state whenever session changes in kundliViewerStore
  useEffect(() => {
    if (session?.result) {
      setLocalKundli(session.result);
      setLocalInput(session.input);
    }
  }, [session]);

  // Attempt to load from localStorage if store is empty
  useEffect(() => {
    if (!localKundli && typeof window !== "undefined") {
      try {
        const storedStr = localStorage.getItem("baggona_kundli_session");
        if (storedStr) {
          const stored = JSON.parse(storedStr);
          if (stored.name && stored.birthDate && stored.birthTime) {
            setIsLoading(true);
            const payload: KundliInput = {
              name: stored.name,
              birthDate: stored.birthDate,
              birthTime: stored.birthTime,
              latitude: stored.latitude || defaultLat,
              longitude: stored.longitude || defaultLng,
              gender: stored.gender || "Male",
              pincode: stored.pincode
            };
            calculateKundliWithPlaceSun(payload, { ayanamsaModel: "lahiri" })
              .then((res) => {
                setLocalKundli(res);
                setLocalInput(payload);
              })
              .catch((err) => console.warn("Failed to restore stored kundli:", err))
              .finally(() => setIsLoading(false));
          }
        }
      } catch (e) {
        console.warn("Storage parse error:", e);
      }
    }
  }, [localKundli, defaultLat, defaultLng]);

  // Compute comprehensive doshas report + gandantara + bhaya
  const doshaReport: ComprehensiveDoshaReport | null = useMemo(() => {
    if (!localKundli || !localInput) return null;
    return calculateComprehensiveDoshas(localKundli, localInput, new Date());
  }, [localKundli, localInput]);

  // STRICT REQUIREMENT: Only display the doshas that the native actually has!
  const activeDoshas = useMemo(() => {
    if (!doshaReport) return [];
    return doshaReport.doshas.filter((d) => d.isDetected);
  }, [doshaReport]);

  const filteredDoshas = useMemo(() => {
    if (activeFilter === "natal") {
      return activeDoshas.filter((d) => d.category === "natal");
    } else if (activeFilter === "dasha_sandhi") {
      return activeDoshas.filter((d) => d.category === "dasha_sandhi");
    } else if (activeFilter === "gochara") {
      return activeDoshas.filter((d) => d.category === "gochara");
    } else if (activeFilter === "panchanga") {
      return activeDoshas.filter((d) => d.category === "panchanga");
    }
    return activeDoshas;
  }, [activeDoshas, activeFilter]);

  // Gandantaras and Fears from report
  const gandantaraReport = doshaReport?.gandantaraAndBhaya;
  const detectedGandantaras = useMemo(() => {
    if (!gandantaraReport) return [];
    return gandantaraReport.activeGandantaras;
  }, [gandantaraReport]);

  const detectedFears = useMemo(() => {
    if (!gandantaraReport) return [];
    return gandantaraReport.detectedFears;
  }, [gandantaraReport]);

  // Pitru Dosha memo for supreme ancestral highlight
  const pitruDosha = useMemo(() => activeDoshas.find((d) => d.id === "pitru_dosha"), [activeDoshas]);

  // Gemini API Key for AI Life-Stage Directive
  const storeApiKey = useAppStore((s) => s.geminiApiKey);
  const geminiApiKey = storeApiKey || (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_GEMINI_API_KEY : "") || "";

  // AI Narrative State with instant fallback to deterministic Parashari engine
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Clear AI narrative on language or native change
  useEffect(() => {
    setAiNarrative(null);
    setAiError(null);
  }, [selectedLang, doshaReport?.devoteeInfo.name]);

  const handleGenerateAiNarrative = async () => {
    if (!doshaReport || isGeneratingAi) return;
    try {
      setIsGeneratingAi(true);
      setAiError(null);
      const age = doshaReport.devoteeInfo.currentAge || doshaReport.devoteeInfo.devoteeAge;
      const stage = doshaReport.devoteeInfo.ageStageKey;
      const stageName = doshaReport.devoteeInfo.ageStageNameRecord?.[selectedLang] || stage;
      const doshaSummaries = activeDoshas
        .slice(0, 3)
        .map((d) => `#${d.agePriorityRank}: ${d.name[selectedLang] || d.name.en} (${d.immediateActionRequired?.[selectedLang] || d.immediateActionRequired?.en || ""})`)
        .join("; ");

      const prompt = `Devotee: ${doshaReport.devoteeInfo.name}, Age: ${age} (${stageName}).
Active Doshas in order of priority: ${doshaSummaries || "None"}.
Pitru Dosha Present: ${pitruDosha ? "YES (Foremost Priority, requires Gokarna Kotiteertha Tila Homa & Narayana Bali)" : "NO"}.
Lagna: ${doshaReport.devoteeInfo.lagnaRashi}, Moon: ${doshaReport.devoteeInfo.moonRashi}.

Write a compassionate, highly authentic Parashari astrological life-stage directive (2 paragraphs) in ${selectedLang === "kn" ? "Kannada" : selectedLang === "hi" ? "Hindi" : selectedLang === "te" ? "Telugu" : selectedLang === "ta" ? "Tamil" : "English"}.
Focus strictly on:
1. Why this native's current age demands addressing the #1 priority affliction first.
2. Sacred ritual guidance at Sri Gokarna Mahabaleshwara Kotiteertha (especially for Pitru dosha / ancestral redemption if active).
Keep the tone divine, authoritative, and Vedic.`;

      const response = await askGemini(
        "Divine Life-Stage Priority Directive",
        prompt,
        geminiApiKey,
        selectedLang,
        { temperature: 0.3 }
      );
      if (response && response.trim().length > 20) {
        setAiNarrative(response.trim());
      } else {
        // Fallback to deterministic Parashari engine
        setAiError("fallback");
      }
    } catch (err) {
      console.warn("AI generation failed, smoothly falling back to deterministic Parashari engine:", err);
      // Fallback to deterministic Parashari engine
      setAiError("fallback");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf || !doshaReport) return;
    try {
      setIsDownloadingPdf(true);
      const nativeName = (doshaReport.devoteeInfo.name || "Devotee").replace(/\s+/g, "_");
      const fileName = `${nativeName}_Kundli_Dosha_Report_${selectedLang.toUpperCase()}.pdf`;
      await generatePDFFromElement("kundli-doshas-pdf-container", fileName);
    } catch (err) {
      console.error("Failed to generate Dosha PDF, falling back to window.print:", err);
      if (typeof window !== "undefined") {
        window.print();
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const t = (key: string): string => {
    const entry = UI_TEXT[key];
    if (!entry) return key;
    return entry[selectedLang] || entry["en"] || entry["kn"] || key;
  };

  const getLangText = (obj: Record<string, string> | undefined, fallback: string = ""): string => {
    if (!obj) return fallback;
    return obj[selectedLang] || obj["en"] || obj["kn"] || fallback;
  };

  const getLangArray = (obj: Record<string, string[]> | undefined): string[] => {
    if (!obj) return [];
    return obj[selectedLang] || obj["en"] || obj["kn"] || [];
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 font-sans pb-16 print:bg-white print:text-black print:pb-0">
      {/* 🖨️ Direct Print Stylesheet for exact 100% A4 portrait print layout with zero cutoff */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          .dosha-pdf-print-wrapper,
          .dosha-pdf-print-wrapper *,
          #kundli-doshas-pdf-container,
          #kundli-doshas-pdf-container * {
            visibility: visible !important;
          }
          .dosha-pdf-print-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            opacity: 1 !important;
            z-index: 99999 !important;
            display: block !important;
          }
          #kundli-doshas-pdf-container {
            position: relative !important;
            width: 100% !important;
            max-width: 210mm !important;
            margin: 0 auto !important;
            display: block !important;
            background: #FFFDF9 !important;
          }
          .pdf-page {
            page-break-after: always !important;
            break-after: page !important;
            width: 100% !important;
            max-width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* 🌟 Top Navigation Bar 🌟 */}
      <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b-2 border-amber-500/30 px-4 py-3 print:hidden shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPage("kundli")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition-all border border-amber-300 shadow-sm"
            >
              <span>{t("backToKundli")}</span>
            </button>
            <span className="text-sm font-black text-amber-950 hidden sm:inline">
              {t("pageTitle")}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 🌐 5-Language Selector */}
            <div className="inline-flex rounded-xl bg-amber-50 p-0.5 border border-amber-300">
              {[
                { code: "kn", label: "ಕನ್ನಡ" },
                { code: "hi", label: "हिन्दी" },
                { code: "te", label: "తెలుగు" },
                { code: "ta", label: "தமிழ்" },
                { code: "en", label: "English" }
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelectedLang(l.code)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedLang === l.code
                      ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm font-black"
                      : "text-slate-700 hover:text-amber-950"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* 📥 1-Click PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || !doshaReport}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 ${
                isDownloadingPdf
                  ? "bg-amber-600/50 text-slate-100 cursor-wait"
                  : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-600 text-white border border-amber-600/40"
              }`}
              title={t("downloadPdf")}
            >
              {isDownloadingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {selectedLang === "kn"
                      ? "PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..."
                      : selectedLang === "hi"
                      ? "PDF तैयार हो रहा है..."
                      : "Generating PDF..."}
                  </span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>{t("downloadPdf")}</span>
                </>
              )}
            </button>

            {/* 🖨️ Secondary Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 transition-all active:scale-95 shadow-sm"
              title={t("printPdf")}
            >
              <span>🖨️</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📜 Main Content Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 space-y-6">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full mb-3" />
            <p className="text-amber-900 text-sm font-semibold">
              {selectedLang === "kn" ? "ಜಾತಕದ ದೋಷಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." : "Analyzing Kundli Doshas & Planetary Alignments..."}
            </p>
          </div>
        )}

        {/* Empty State when no Kundli is loaded */}
        {!isLoading && !doshaReport && (
          <div className="rounded-3xl border-2 border-dashed border-amber-400 bg-white/90 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-md">
            <div className="text-5xl animate-bounce">🛡️</div>
            <h2 className="text-xl font-bold text-amber-950">
              {selectedLang === "kn" ? "ಯಾವುದೇ ಜಾತಕ ಸಿದ್ಧವಾಗಿಲ್ಲ" : "No Active Kundli Found"}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedLang === "kn"
                ? "ದೋಷ ವಿಶ್ಲೇಷಣೆ ವೀಕ್ಷಿಸಲು ಮೊದಲು 'ಜಾತಕ' ಪುಟದಲ್ಲಿ ಜನ್ಮ ದಿನಾಂಕ, ಸಮಯ ಹಾಗೂ ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ ಜಾತಕ ಸಿದ್ಧಪಡಿಸಿ."
                : "To examine technical Dosha calculations and sacred Vedic remedies, please generate a Kundli first."}
            </p>
            <button
              type="button"
              onClick={() => setPage("kundli")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-sm shadow-md transition-all"
            >
              <span>✨</span>
              <span>{selectedLang === "kn" ? "ಜಾತಕ ಸಿದ್ಧಪಡಿಸಿ (Open Kundli Page)" : "Generate Kundli Now"}</span>
            </button>
          </div>
        )}

        {/* 🌟 Rich Dosha Dossier View 🌟 */}
        {!isLoading && doshaReport && (
          <>
            {/* Header / Devotee Metadata Banner */}
            <div className="rounded-3xl border-2 border-amber-600/40 bg-gradient-to-br from-[#FFFDF8] via-[#FEFBF0] to-[#FFF8E7] p-6 sm:p-8 shadow-md relative overflow-hidden print:border-black print:bg-white print:text-black print:p-4">
              <div className="absolute -right-8 -top-8 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border-b-2 border-amber-500/30 pb-6 print:border-black">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 px-3.5 py-1 text-[11px] font-black uppercase text-amber-900 border border-amber-300 print:border-black print:text-black shadow-sm">
                    <span>🔱</span>
                    <span>॥ ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-indigo-950 mt-2 tracking-tight font-serif print:text-black">
                    {t("pageTitle")}
                  </h1>
                  <p className="text-xs text-slate-700 mt-1 font-medium print:text-black">
                    {t("pageSubtitle")}
                  </p>
                </div>

                <div className="text-center sm:text-right shrink-0 bg-white/90 p-4 rounded-2xl border-2 border-amber-400/50 shadow-sm print:bg-white print:border-black">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest print:text-black">
                    {t("nativeName")}
                  </div>
                  <div className="text-lg font-black text-indigo-950 capitalize mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.name}
                  </div>
                  <div className="text-xs text-slate-700 font-semibold mt-1 print:text-black">
                    {doshaReport.devoteeInfo.birthDate} • {doshaReport.devoteeInfo.birthTime}
                  </div>
                </div>
              </div>

              {/* Natal Coordinates & Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-2">
                <div className="rounded-xl bg-white p-3 border-2 border-amber-400/40 text-center shadow-sm print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-800 print:text-black">
                    {t("lagnaLabel")}
                  </div>
                  <div className="text-sm font-black text-indigo-950 mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.lagnaRashiRecord?.[selectedLang] || doshaReport.devoteeInfo.lagnaRashi}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3 border-2 border-amber-400/40 text-center shadow-sm print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-800 print:text-black">
                    {t("moonLabel")}
                  </div>
                  <div className="text-sm font-black text-indigo-950 mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.moonRashiRecord?.[selectedLang] || doshaReport.devoteeInfo.moonRashi} • {doshaReport.devoteeInfo.nakshatraRecord?.[selectedLang] || doshaReport.devoteeInfo.nakshatra} ({doshaReport.devoteeInfo.pada})
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3 border-2 border-amber-400/40 text-center shadow-sm print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-800 print:text-black">
                    {t("activeCountLabel")}
                  </div>
                  <div className={`text-sm font-black mt-0.5 print:text-black ${
                    activeDoshas.length > 0 ? "text-rose-700" : "text-emerald-700"
                  }`}>
                    {activeDoshas.length} {selectedLang === "kn" ? "ದೋಷಗಳು ಸಕ್ರಿಯ" : "Active Doshas"}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3 border-2 border-amber-400/40 text-center shadow-sm print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-800 print:text-black">
                    {t("currentDashaLabel")}
                  </div>
                  <div className="text-sm font-black text-amber-900 mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.currentDashaRecord?.[selectedLang] || doshaReport.devoteeInfo.currentDashaStr}
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 Age Priority Strategy Card with GenAI & Deterministic Parashari Fallback 🌟 */}
            <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-[#FFFDF9] via-[#FEFBF2] to-[#FFF9EB] p-5 sm:p-6 shadow-md relative overflow-hidden print:border-black print:bg-white print:text-black">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-500/20 pb-4 print:border-black">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-100 text-amber-900 text-2xl shadow-sm">
                    ⭐
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-amber-950 font-serif print:text-black">
                      {t("ageStrategyCardTitle")}
                    </h3>
                    <p className="text-xs text-amber-900 font-bold mt-0.5">
                      {doshaReport.devoteeInfo.ageStageNameRecord?.[selectedLang] || doshaReport.devoteeInfo.ageStageKey} • {t("currentAgeLabel")}: {doshaReport.devoteeInfo.currentAge || doshaReport.devoteeInfo.devoteeAge} {selectedLang === "kn" ? "ವರ್ಷ" : "Yrs"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-400 text-xs font-black shadow-sm">
                    <span>⚡</span>
                    <span>{t("agePriorityBadgeLabel")}</span>
                  </div>

                  {/* 🤖 GenAI Narrative Button (with instant deterministic Parashari fallback) */}
                  <button
                    type="button"
                    onClick={handleGenerateAiNarrative}
                    disabled={isGeneratingAi}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-700 hover:from-purple-800 hover:to-amber-800 text-white text-xs font-black shadow-md border border-purple-400/50 transition-all active:scale-95 disabled:opacity-60 print:hidden cursor-pointer"
                    title={t("aiGuidanceBtn")}
                  >
                    {isGeneratingAi ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t("aiGeneratingLabel")}</span>
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        <span>{aiNarrative ? t("aiRevertToParashari") : t("aiGuidanceBtn")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {/* When AI narrative is active, display the AI response */}
                {aiNarrative ? (
                  <div className="rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-amber-50/50 border-2 border-purple-300 p-4 sm:p-5 space-y-2.5 shadow-sm print:bg-white print:border-black">
                    <div className="flex items-center justify-between gap-2 border-b border-purple-200 pb-2">
                      <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-purple-950">
                        <span>✨</span>
                        <span>{t("aiGeneratedLabel")}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiNarrative(null)}
                        className="text-[11px] text-purple-800 hover:text-purple-950 font-bold underline print:hidden cursor-pointer"
                      >
                        {t("aiRevertToParashari")}
                      </button>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line print:text-black">
                      {aiNarrative}
                    </div>
                  </div>
                ) : (
                  /* Classical Deterministic Parashari Engine Directive */
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-300 p-4 space-y-1.5 print:bg-white print:text-black print:border-black">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-amber-900 print:text-black">
                      <span>📜</span>
                      <span>{t("aiParashariFallbackLabel")}</span>
                      {aiError && (
                        <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 font-semibold">
                          (Offline / Deterministic Mode)
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-amber-950 font-bold leading-relaxed print:text-black">
                      {getLangText(doshaReport.devoteeInfo.currentAgeFocusSummary, "ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ಮೊದಲ ಆದ್ಯತೆಯ ಪರಿಹಾರಗಳನ್ನು ಕೈಗೊಳ್ಳುವುದು ಅತ್ಯಾವಶ್ಯಕ.")}
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-amber-900/80 italic font-medium px-1 print:text-black">
                  {t("ageStrategyNote")}
                </p>
              </div>
            </div>

            {/* 🌟 Top Navigation Bar: Section Tabs (All, Doshas, Gandantara, Fears) 🌟 */}
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-amber-500/20 pb-3 print:hidden">
              {[
                { id: "all_sections", label: t("viewAllTab"), icon: "📜" },
                { id: "doshas", label: `${t("doshasTab")} (${activeDoshas.length})`, icon: "🛡️" },
                { id: "gandantara", label: `${t("gandantaraTab")} (${detectedGandantaras.length})`, icon: "⚡" },
                { id: "fears", label: `${t("fearsTab")} (${detectedFears.length})`, icon: "🧠" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMainTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 ${
                    mainTab === tab.id
                      ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md font-black scale-[1.02] border border-amber-700"
                      : "bg-white text-slate-700 hover:bg-amber-50 border border-amber-300 hover:text-amber-950 shadow-sm"
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ========================================================================= */}
            {/* SECTION 1: ACTIVE DOSHAS (Only detected doshas shown)                    */}
            {/* ========================================================================= */}
            {(mainTab === "all_sections" || mainTab === "doshas") && (
              <section className="space-y-6 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-500/20 pb-3">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-indigo-950 font-serif flex items-center gap-2">
                    <span>🛡️</span>
                    <span>{t("activeDoshasHeading")}</span>
                    <span className="text-xs bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-300 font-black shadow-sm">
                      {activeDoshas.length}
                    </span>
                  </h2>

                  {/* Sub-filter tabs for Dosha category */}
                  {activeDoshas.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 print:hidden">
                      {[
                        { id: "all", label: t("filterAllActive"), count: activeDoshas.length },
                        { id: "natal", label: t("filterNatal"), count: activeDoshas.filter((d) => d.category === "natal").length },
                        { id: "dasha_sandhi", label: t("filterDashaSandhi"), count: activeDoshas.filter((d) => d.category === "dasha_sandhi").length },
                        { id: "gochara", label: t("filterGochara"), count: activeDoshas.filter((d) => d.category === "gochara").length },
                        { id: "panchanga", label: t("filterPanchanga"), count: activeDoshas.filter((d) => d.category === "panchanga").length },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveFilter(tab.id as any)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                            activeFilter === tab.id
                              ? "bg-amber-700 text-white border border-amber-800 font-black shadow-sm"
                              : "bg-white text-slate-700 hover:text-amber-950 border border-amber-300 shadow-sm"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className="text-[10px] opacity-80">({tab.count})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Auspicious Nir-dosha State if 0 doshas */}
                {activeDoshas.length === 0 && (
                  <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-5 shadow-md">
                    <div className="text-6xl animate-bounce">🕊️</div>
                    <h3 className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight font-serif">
                      {t("pureKundliTitle")}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                      {t("pureKundliDesc")}
                    </p>
                    <div className="pt-4 border-t border-emerald-200 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-emerald-800">
                      <span>✓ ಪಿತೃ ದೋಷ ರಹಿತ</span>
                      <span>✓ ಕಾಳಸರ್ಪ ಬಾಧಾ ಮುಕ್ತ</span>
                      <span>✓ ಕುಜ ದೋಷ ಮುಕ್ತ</span>
                      <span>✓ ಗುರು ಬಲ ಸಂಪನ್ನ</span>
                    </div>
                  </div>
                )}

                {/* 🪔 PROMINENT PITRU DOSHA ANCESTRAL SACRED HIGHLIGHT CARD 🪔 */}
                {pitruDosha && (
                  <div className="rounded-3xl border-2 border-amber-600 bg-gradient-to-br from-[#FFF9E6] via-[#FFFDF5] to-[#FFF3DC] p-6 sm:p-7 shadow-lg relative overflow-hidden ring-2 ring-amber-500/40 space-y-4 print:border-black print:bg-white print:text-black">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-500/30 pb-4 print:border-black">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-500 bg-amber-500/10 text-amber-950 text-2xl shadow-sm">
                          🪔
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-amber-900 tracking-wider">
                            <span>👑</span>
                            <span>{t("pitruBannerHeader")}</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-amber-950 font-serif mt-0.5 print:text-black">
                            {getLangText(pitruDosha.name)} - {t("pitruBannerBadge")}
                          </h3>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-black shadow-md self-start sm:self-auto border border-amber-800">
                        <span>⚡</span>
                        <span>{getLangText(pitruDosha.agePriorityBadge, "ಆದ್ಯತೆ #1")}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed print:text-black">
                      {t("pitruBannerDesc")}
                    </p>

                    {/* Sacred Gokarna Kotiteertha Action Box */}
                    <div className="rounded-2xl bg-white/90 border-2 border-amber-400 p-4 sm:p-5 shadow-sm space-y-3 print:bg-white print:border-black">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                            <span>🔱</span>
                            <span>{t("pitruGokarnaAction")}</span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium">
                            {getLangText(pitruDosha.immediateActionRequired)}
                          </p>
                        </div>

                        <a
                          href="tel:+919972339362"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-black text-xs shadow-md transition-all shrink-0 active:scale-95 print:hidden"
                        >
                          <span>📞</span>
                          <span>{t("pitruChiefPriestCall")}</span>
                        </a>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-amber-200">
                        <div className="rounded-xl bg-amber-50 p-2.5 text-center border border-amber-200">
                          <span className="text-xs font-black text-amber-950">1. ತಿಲ ಹೋಮ (Tila Homa)</span>
                          <p className="text-[10px] text-amber-900/80 mt-0.5">ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪ್ರಾಯಶ್ಚಿತ್ತ ಆಹುತಿ</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-2.5 text-center border border-amber-200">
                          <span className="text-xs font-black text-amber-950">2. ನಾರಾಯಣ ಬಲಿ (Narayana Bali)</span>
                          <p className="text-[10px] text-amber-900/80 mt-0.5">ಅತೃಪ್ತ ಪೂರ್ವಜರ ಸದ್ಗತಿ ಮೋಕ್ಷ</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-2.5 text-center border border-amber-200">
                          <span className="text-xs font-black text-amber-950">3. ಪಿತೃ ತರ್ಪಣ (Pitru Tarpanam)</span>
                          <p className="text-[10px] text-amber-900/80 mt-0.5">ಅಮಾವಾಸ್ಯೆ / ಶ್ರಾದ್ಧ ತಿಲ ತರ್ಪಣ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Doshas Cards List */}
                {filteredDoshas.map((dosha) => {
                  const isPitru = dosha.id === "pitru_dosha";
                  const isCritical = dosha.severity === "critical";

                  const borderClass = isPitru
                    ? "border-2 border-amber-600 bg-gradient-to-br from-[#FFFBF0] via-[#FFFDF8] to-[#FFF5EB] shadow-xl ring-2 ring-amber-500/40"
                    : isCritical
                    ? "border-2 border-rose-300/80 bg-gradient-to-br from-white via-rose-50/25 to-white shadow-md"
                    : "border-2 border-amber-400/60 bg-gradient-to-br from-white via-amber-50/20 to-white shadow-md";

                  const badgeBg = isPitru
                    ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                    : isCritical
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : "bg-amber-100 text-amber-900 border-amber-300";

                  return (
                    <article
                      key={dosha.id}
                      className={`rounded-3xl ${borderClass} p-6 sm:p-7 shadow-md space-y-5 transition-all print:border-black print:bg-white print:text-black print:p-4 print:break-inside-avoid`}
                    >
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-200/60 pb-4 print:border-black">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-2xl print:border-black shadow-sm ${
                            isPitru
                              ? "border-amber-500 bg-amber-100 text-amber-950"
                              : isCritical
                              ? "border-rose-400 bg-rose-50"
                              : "border-amber-400/60 bg-amber-50"
                          }`}>
                            {isPitru ? "🪔" : isCritical ? "⚠️" : "⚡"}
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-black text-indigo-950 font-serif print:text-black flex items-center gap-2 flex-wrap">
                              <span>{getLangText(dosha.name)}</span>
                              {isPitru && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-400 text-[11px] font-black uppercase">
                                  <span>👑</span>
                                  <span>{t("supremeAncestralDuty")}</span>
                                </span>
                              )}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium print:text-black">
                              {dosha.technicalDetail.scripturalReference}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* ⚡ Glowing Age Priority Badge */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase shadow-sm border ${
                              isPitru
                                ? "bg-amber-600 text-white border-amber-700"
                                : isCritical
                                ? "bg-rose-600 text-white border-rose-400"
                                : "bg-amber-600 text-white border-amber-400"
                            } print:border-black print:text-black`}
                          >
                            <span>⚡</span>
                            <span>{getLangText(dosha.agePriorityBadge, `ಆದ್ಯತೆ #${dosha.agePriorityRank || 1}`)}</span>
                          </span>

                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border shadow-sm ${badgeBg} print:border-black print:text-black`}>
                            <span className="animate-pulse">●</span>
                            <span>{getLangText(dosha.statusBadge)}</span>
                          </span>
                        </div>
                      </div>

                      {/* 📌 Age Priority Reason */}
                      {dosha.agePriorityReason && (
                        <div className="rounded-xl bg-amber-50/80 border border-amber-300 p-3 text-xs text-amber-950 font-medium leading-relaxed print:bg-white print:text-black print:border-black">
                          <span className="font-black text-amber-900">📌 {t("agePriorityBadgeLabel")}: </span>
                          <span>{getLangText(dosha.agePriorityReason)}</span>
                        </div>
                      )}

                      {/* 🎯 MANDATORY ACTIVE HIGHLIGHT: IMMEDIATE ACTION REQUIRED */}
                      {dosha.immediateActionRequired && (
                        <div className="rounded-2xl border-2 border-rose-400 bg-gradient-to-br from-rose-50 via-white to-amber-50/30 p-4 sm:p-5 shadow-sm space-y-2 ring-1 ring-rose-400/40 print:border-black print:bg-white print:text-black">
                          <div className="flex items-center gap-2 text-xs font-black uppercase text-rose-900 tracking-wider print:text-black">
                            <span className="text-lg">🎯</span>
                            <span>{t("immediateActionTitle")}</span>
                          </div>
                          <p className="text-sm sm:text-base font-black text-rose-950 leading-relaxed print:text-black">
                            {getLangText(dosha.immediateActionRequired)}
                          </p>
                        </div>
                      )}

                      {/* ⚠️ SECTION: DEDICATED CURRENT LIFE PROBLEMS PARAGRAPH */}
                      <div className="rounded-2xl bg-rose-50/60 border border-rose-200 p-4 space-y-2 print:bg-white print:border-black">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-900 print:text-black">
                          <span>🚨</span>
                          <span>{t("currentProblemsTitle")}</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-800 font-medium print:text-black">
                          {Array.isArray((dosha.currentLifeProblems as any)?.[selectedLang])
                            ? (dosha.currentLifeProblems as any)[selectedLang].join(" • ")
                            : getLangText(dosha.currentLifeProblems) || getLangText(dosha.lifeImpact)}
                        </p>
                      </div>

                      {/* 🪐 SECTION: RUNNING DASHA-BHUKTI RESONANCE */}
                      <div className="rounded-2xl bg-indigo-50/60 border border-indigo-200 p-4 space-y-2 print:bg-white print:border-black">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-950 print:text-black">
                          <span>🪐</span>
                          <span>{t("dashaResonanceTitle")}</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-800 font-medium print:text-black">
                          {getLangText(dosha.dashaResonance)}
                        </p>
                      </div>

                      {/* 🔍 SECTION: Technical "WHY" Breakdown */}
                      <div className="rounded-2xl bg-amber-50/40 p-4 border border-amber-200 space-y-2 print:bg-white print:border-black">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 print:text-black">
                          <span>🔍</span>
                          <span>{t("technicalWhyTitle")}</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-medium print:text-black">
                          {getLangText(dosha.technicalWhy)}
                        </p>

                        {/* Technical Tags */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          {dosha.technicalDetail.houseNumbers.length > 0 && (
                            <div className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-amber-950 border border-amber-300 print:border-black print:text-black shadow-sm">
                              <span>🏠</span>
                              <span>
                                {selectedLang === "kn" ? "ಭಾವಗಳು: " : "Houses: "}
                                {dosha.technicalDetail.houseNumbers.join(", ")}
                              </span>
                            </div>
                          )}
                          {dosha.technicalDetail.grahasInvolved.length > 0 && (
                            <div className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-amber-950 border border-amber-300 print:border-black print:text-black shadow-sm">
                              <span>🪐</span>
                              <span>
                                {selectedLang === "kn" ? "ಗ್ರಹಗಳು: " : "Grahas: "}
                                {dosha.technicalDetail.grahasInvolved.join(", ")}
                              </span>
                            </div>
                          )}
                          {dosha.technicalDetail.hasBhangaOrMitigation && (
                            <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-900 border border-emerald-300 print:border-black print:text-black shadow-sm">
                              <span>✨</span>
                              <span>
                                {selectedLang === "kn" ? "ಭಂಗ / ಪರಿಹಾರಕ ಬಲ: " : "Mitigation: "}
                                {getLangText(dosha.technicalDetail.bhangaDescription)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ⚡ SECTION: Real-World Life Manifestation (2 Paragraphs) */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 print:text-black">
                          <span>⚡</span>
                          <span>{t("lifeImpactTitle")}</span>
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-700 print:text-black">
                          {getLangText(dosha.lifeImpact)
                            .split(/\n\n+/)
                            .map((para, idx) => (
                              <p key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 print:border-none print:p-0">
                                {para}
                              </p>
                            ))}
                        </div>
                      </div>

                      {/* 🔱 SECTION: Prescribed Vedic Shanti & Parihara */}
                      <div className="rounded-2xl bg-amber-50/70 border-2 border-amber-400/60 p-4 space-y-3 print:border-black print:bg-white shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-950 print:text-black">
                          <span>🔱</span>
                          <span>{t("shantiRemediesTitle")}</span>
                        </div>

                        {/* Sacred Temple / Ritual */}
                        <div className="rounded-xl bg-white p-3 border border-amber-300 flex items-start gap-2.5 print:bg-white print:border-black shadow-sm">
                          <span className="text-xl">🛕</span>
                          <div>
                            <div className="text-[10px] font-bold uppercase text-amber-800 print:text-black">
                              {t("recommendedPoojaLabel")}
                            </div>
                            <div className="text-xs sm:text-sm font-black text-indigo-950 mt-0.5 print:text-black">
                              {getLangText(dosha.recommendedPooja)}
                            </div>
                          </div>
                        </div>

                        {/* Practical Lifestyle Remedies */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-slate-600 print:text-black">
                            {t("dailyRemediesLabel")}
                          </div>
                          <ul className="space-y-1">
                            {getLangArray(dosha.remedies).map((rem, rIdx) => (
                              <li key={rIdx} className="text-xs text-slate-800 flex items-start gap-2 print:text-black">
                                <span className="text-amber-700 font-bold shrink-0">✦</span>
                                <span>{rem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}

            {/* ========================================================================= */}
            {/* SECTION 2: GANDANTARAGALU (Critical Life Hazards & Safe Age Limits)       */}
            {/* ========================================================================= */}
            {(mainTab === "all_sections" || mainTab === "gandantara") && (
              <section className="space-y-6 pt-6 border-t-2 border-amber-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-amber-500/20 pb-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-wide text-indigo-950 font-serif flex items-center gap-2">
                      <span>⚡</span>
                      <span>{t("gandantaraHeading")}</span>
                      <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold shadow-sm">
                        {detectedGandantaras.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {t("gandantaraSubheading")}
                    </p>
                  </div>
                </div>

                {/* If 0 Gandantaras detected */}
                {detectedGandantaras.length === 0 && (
                  <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-8 text-center max-w-2xl mx-auto space-y-3 shadow-md">
                    <div className="text-5xl">🛡️</div>
                    <h3 className="text-xl font-black text-emerald-900 font-serif">
                      {t("noGandantaraTitle")}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {t("noGandantaraDesc")}
                    </p>
                  </div>
                )}

                {/* Gandantara Cards Grid */}
                <div className="space-y-6">
                  {detectedGandantaras.map((gandantara) => {
                    const isUnderDanger = gandantara.isCurrentlyInDangerWindow;
                    const cardBorder = isUnderDanger
                      ? "border-2 border-rose-300/80 bg-gradient-to-br from-white via-rose-50/20 to-white shadow-md"
                      : "border-2 border-emerald-300/80 bg-gradient-to-br from-white via-emerald-50/20 to-white shadow-md";

                    return (
                      <article
                        key={gandantara.id}
                        className={`rounded-3xl ${cardBorder} p-6 sm:p-7 shadow-md space-y-5 transition-all print:border-black print:bg-white print:text-black print:p-4 print:break-inside-avoid`}
                      >
                        {/* Header: Title, Icon, Age Window Status Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-200/60 pb-4 print:border-black">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300 bg-amber-50 text-2xl print:border-black shadow-sm">
                              {gandantara.icon}
                            </div>
                            <div>
                              <h3 className="text-lg sm:text-xl font-black text-indigo-950 font-serif print:text-black">
                                {getLangText(gandantara.name)}
                              </h3>
                              <p className="text-[11px] text-slate-500 font-medium print:text-black">
                                {gandantara.scripturalReference}
                              </p>
                            </div>
                          </div>

                          <div>
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase border shadow-sm ${
                              isUnderDanger
                                ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                                : "bg-emerald-100 text-emerald-800 border-emerald-300"
                            } print:border-black print:text-black`}>
                              <span>{isUnderDanger ? "⚠️" : "✓"}</span>
                              <span>
                                {isUnderDanger ? t("activeDangerWindow") : t("safeAgeSurpassed")}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* ⚠️ AGE WINDOW CALLOUT BOX */}
                        <div className={`rounded-2xl p-4 border space-y-1.5 ${
                          isUnderDanger
                            ? "bg-rose-50 border-rose-300 text-rose-950"
                            : "bg-emerald-50 border-emerald-300 text-emerald-950"
                        } print:border-black print:bg-white print:text-black`}>
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                            <span>{isUnderDanger ? "🚨" : "🛡️"}</span>
                            <span>{getLangText(gandantara.name)} - {isUnderDanger ? "ವಿಶೇಷ ಎಚ್ಚರಿಕೆ ಕಾಲ" : "ಸುರಕ್ಷಿತ ಸ್ಥಿತಿ"}</span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                            {getLangText(gandantara.ageWindowDescription)}
                          </p>
                        </div>

                        {/* 🔍 ASTRONOMICAL REASON & HOUSES */}
                        <div className="rounded-2xl bg-amber-50/40 p-4 border border-amber-200 space-y-2 print:bg-white print:border-black">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 print:text-black">
                            <span>🔍</span>
                            <span>{t("technicalWhyTitle")}</span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-medium print:text-black">
                            {getLangText(gandantara.technicalReason)}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {gandantara.houseNumbers.length > 0 && (
                              <div className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-amber-950 border border-amber-300 print:border-black print:text-black shadow-sm">
                                <span>🏠</span>
                                <span>ಭಾವ: {gandantara.houseNumbers.join(", ")}</span>
                              </div>
                            )}
                            {gandantara.grahasInvolved.length > 0 && (
                              <div className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-amber-950 border border-amber-300 print:border-black print:text-black shadow-sm">
                                <span>🪐</span>
                                <span>ಗ್ರಹ: {gandantara.grahasInvolved.join(", ")}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 🪐 RUNNING DASHA RESONANCE */}
                        <div className="rounded-2xl bg-indigo-50/60 border border-indigo-200 p-4 space-y-2 print:bg-white print:border-black">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-950 print:text-black">
                            <span>🪐</span>
                            <span>{t("dashaResonanceTitle")}</span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed text-slate-800 font-medium print:text-black">
                            {getLangText(gandantara.dashaResonance)}
                          </p>
                        </div>

                        {/* 🛑 PRECAUTIONS & BEHAVIORAL PROHIBITIONS */}
                        <div className="rounded-2xl bg-amber-50/50 border border-amber-300 p-4 space-y-2.5 print:bg-white print:border-black">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-950 print:text-black">
                            <span>🛑</span>
                            <span>{t("cautionProhibitionsLabel")}</span>
                          </div>
                          <ul className="space-y-1.5">
                            {getLangArray(gandantara.cautionDirectives).map((dir, dIdx) => (
                              <li key={dIdx} className="text-xs sm:text-sm text-slate-800 flex items-start gap-2 print:text-black">
                                <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                                <span className="font-medium">{dir}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 🔱 PROTECTIVE PARIHARA & MANTRAS */}
                        <div className="rounded-2xl bg-white border-2 border-amber-400/50 p-4 space-y-2.5 print:bg-white print:border-black shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 print:text-black">
                            <span>🔱</span>
                            <span>{t("protectiveKavachaLabel")}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-black text-indigo-950 print:text-black">
                            {getLangText(gandantara.protectiveParihara)}
                          </div>
                          <div className="space-y-1 pt-1">
                            {getLangArray(gandantara.protectiveMantras).map((man, mIdx) => (
                              <div key={mIdx} className="text-xs text-slate-700 flex items-center gap-2 print:text-black">
                                <span className="text-amber-600 font-bold">✦</span>
                                <span>{man}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* SECTION 3: INNATE FEARS & PHOBIAS (Subconscious Fears & Phobia Profile)   */}
            {/* ========================================================================= */}
            {(mainTab === "all_sections" || mainTab === "fears") && (
              <section className="space-y-6 pt-6 border-t-2 border-amber-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-amber-500/20 pb-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-wide text-indigo-950 font-serif flex items-center gap-2">
                      <span>🧠</span>
                      <span>{t("fearsHeading")}</span>
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-300 font-bold shadow-sm">
                        {detectedFears.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {t("fearsSubheading")}
                    </p>
                  </div>
                </div>

                {/* If 0 Fears detected */}
                {detectedFears.length === 0 && (
                  <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-8 text-center max-w-2xl mx-auto space-y-3 shadow-md">
                    <div className="text-5xl">🦁</div>
                    <h3 className="text-xl font-black text-emerald-900 font-serif">
                      {t("noFearsTitle")}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {t("noFearsDesc")}
                    </p>
                  </div>
                )}

                {/* Fears Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {detectedFears.map((fear) => {
                    const isHigh = fear.severity === "high";

                    return (
                      <article
                        key={fear.id}
                        className={`rounded-3xl border-2 ${
                          isHigh ? "border-rose-300/80 bg-gradient-to-br from-white via-rose-50/20 to-white" : "border-indigo-300/70 bg-gradient-to-br from-white via-indigo-50/20 to-white"
                        } p-5 sm:p-6 shadow-md space-y-4 transition-all print:border-black print:bg-white print:text-black print:p-4 print:break-inside-avoid`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 border-b-2 border-amber-200/60 pb-3 print:border-black">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{fear.icon}</span>
                            <h3 className="text-base font-black text-indigo-950 font-serif print:text-black">
                              {getLangText(fear.name)}
                            </h3>
                          </div>
                          <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border shadow-sm ${
                            isHigh
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-indigo-100 text-indigo-800 border-indigo-300"
                          } print:border-black print:text-black`}>
                            {fear.severity}
                          </span>
                        </div>

                        {/* Planetary Trigger */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 print:text-black">
                            {selectedLang === "kn" ? "ಗ್ರಹ ಪ್ರೇರಿತ ಕಾರಣ:" : "Astrological Root:"}
                          </div>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed print:text-black">
                            {getLangText(fear.planetaryTrigger)}
                          </p>
                        </div>

                        {/* Psychological & Somatic Symptom */}
                        <div className="rounded-xl bg-rose-50/60 p-3 border border-rose-200 space-y-1 print:bg-white print:border-black">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-900 print:text-black">
                            {t("symptomLabel")}
                          </div>
                          <p className="text-xs text-rose-950 font-medium leading-relaxed print:text-black">
                            {getLangText(fear.psychologicalSymptom)}
                          </p>
                        </div>

                        {/* Real-Life Manifestation */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 print:text-black">
                            {t("realLifeSymptomLabel")}
                          </div>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed print:text-black">
                            {getLangText(fear.realLifeManifestation)}
                          </p>
                        </div>

                        {/* Mind-Strengthening Remedy */}
                        <div className="rounded-xl bg-amber-50/80 p-3 border border-amber-300 space-y-1 print:bg-white print:border-black">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 print:text-black">
                            {t("mindStrengtheningLabel")}
                          </div>
                          <p className="text-xs text-amber-950 font-medium leading-relaxed print:text-black">
                            {getLangText(fear.strengtheningPractice)}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* 🖨️ Off-screen PDF Container for 1-Click PDF Download (baggona-pdf-layout-guard compliant) */}
      <div
        className="dosha-pdf-print-wrapper"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 900,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
          height: 0
        }}
        aria-hidden="true"
      >
        {doshaReport && (
          <KundliDoshaPdfTemplate
            id="kundli-doshas-pdf-container"
            report={doshaReport}
            lang={selectedLang}
          />
        )}
      </div>
    </div>
  );
};

export default KundliDoshasPage;
