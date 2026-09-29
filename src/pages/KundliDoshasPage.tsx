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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 print:bg-white print:text-black print:pb-0">
      {/* 🌟 Top Navigation Bar 🌟 */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPage("kundli")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all border border-amber-500/30"
            >
              <span>{t("backToKundli")}</span>
            </button>
            <span className="text-sm font-extrabold text-amber-200 hidden sm:inline">
              {t("pageTitle")}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 🌐 5-Language Selector */}
            <div className="inline-flex rounded-xl bg-slate-800/80 p-0.5 border border-slate-700">
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
                      ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* 🖨️ Print Dossier Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
            >
              <span>🖨️</span>
              <span>{t("printPdf")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📜 Main Content Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 space-y-6">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full mb-3" />
            <p className="text-amber-300 text-sm font-semibold">
              {selectedLang === "kn" ? "ಜಾತಕದ ದೋಷಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." : "Analyzing Kundli Doshas & Planetary Alignments..."}
            </p>
          </div>
        )}

        {/* Empty State when no Kundli is loaded */}
        {!isLoading && !doshaReport && (
          <div className="rounded-3xl border-2 border-dashed border-amber-500/40 bg-slate-900/60 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="text-5xl animate-bounce">🛡️</div>
            <h2 className="text-xl font-bold text-amber-200">
              {selectedLang === "kn" ? "ಯಾವುದೇ ಜಾತಕ ಸಿದ್ಧವಾಗಿಲ್ಲ" : "No Active Kundli Found"}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {selectedLang === "kn"
                ? "ದೋಷ ವಿಶ್ಲೇಷಣೆ ವೀಕ್ಷಿಸಲು ಮೊದಲು 'ಜಾತಕ' ಪುಟದಲ್ಲಿ ಜನ್ಮ ದಿನಾಂಕ, ಸಮಯ ಹಾಗೂ ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ ಜಾತಕ ಸಿದ್ಧಪಡಿಸಿ."
                : "To examine technical Dosha calculations and sacred Vedic remedies, please generate a Kundli first."}
            </p>
            <button
              type="button"
              onClick={() => setPage("kundli")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl transition-all"
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
            <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/80 via-slate-900 to-stone-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden print:border-black print:bg-white print:text-black print:p-4">
              <div className="absolute -right-8 -top-8 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-amber-500/20 pb-6 print:border-black">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-black uppercase text-amber-300 border border-amber-400/30 print:border-black print:text-black">
                    <span>🔱</span>
                    <span>॥ ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-amber-100 mt-2 tracking-tight print:text-black">
                    {t("pageTitle")}
                  </h1>
                  <p className="text-xs text-amber-200/80 mt-1 print:text-black">
                    {t("pageSubtitle")}
                  </p>
                </div>

                <div className="text-center sm:text-right shrink-0 bg-slate-800/80 p-4 rounded-2xl border border-amber-500/30 print:bg-white print:border-black">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest print:text-black">
                    {t("nativeName")}
                  </div>
                  <div className="text-lg font-black text-amber-200 capitalize mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.name}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1 print:text-black">
                    {doshaReport.devoteeInfo.birthDate} • {doshaReport.devoteeInfo.birthTime}
                  </div>
                </div>
              </div>

              {/* Natal Coordinates & Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-2">
                <div className="rounded-xl bg-slate-900/60 p-3 border border-amber-500/20 text-center print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-400 print:text-black">
                    {t("lagnaLabel")}
                  </div>
                  <div className="text-sm font-black text-slate-100 mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.lagnaRashiRecord?.[selectedLang] || doshaReport.devoteeInfo.lagnaRashi}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/60 p-3 border border-amber-500/20 text-center print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-400 print:text-black">
                    {t("moonLabel")}
                  </div>
                  <div className="text-sm font-black text-slate-100 mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.moonRashiRecord?.[selectedLang] || doshaReport.devoteeInfo.moonRashi} • {doshaReport.devoteeInfo.nakshatraRecord?.[selectedLang] || doshaReport.devoteeInfo.nakshatra} ({doshaReport.devoteeInfo.pada})
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/60 p-3 border border-amber-500/20 text-center print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-400 print:text-black">
                    {t("activeCountLabel")}
                  </div>
                  <div className={`text-sm font-black mt-0.5 print:text-black ${
                    activeDoshas.length > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {activeDoshas.length} {selectedLang === "kn" ? "ದೋಷಗಳು ಸಕ್ರಿಯ" : "Active Doshas"}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/60 p-3 border border-amber-500/20 text-center print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-400 print:text-black">
                    {t("currentDashaLabel")}
                  </div>
                  <div className="text-sm font-black text-amber-300 mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.currentDashaRecord?.[selectedLang] || doshaReport.devoteeInfo.currentDashaStr}
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 Top Navigation Bar: Section Tabs (All, Doshas, Gandantara, Fears) 🌟 */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 print:hidden">
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
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg font-black scale-[1.02]"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 hover:text-white"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-amber-300 flex items-center gap-2">
                    <span>🛡️</span>
                    <span>{t("activeDoshasHeading")}</span>
                    <span className="text-xs bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-500/40">
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
                              ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 font-black"
                              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className="text-[10px] opacity-75">({tab.count})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Auspicious Nir-dosha State if 0 doshas */}
                {activeDoshas.length === 0 && (
                  <div className="rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-emerald-950/30 p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-5 shadow-2xl">
                    <div className="text-6xl animate-bounce">🕊️</div>
                    <h3 className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight">
                      {t("pureKundliTitle")}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                      {t("pureKundliDesc")}
                    </p>
                    <div className="pt-4 border-t border-emerald-500/20 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-emerald-400">
                      <span>✓ ಪಿತೃ ದೋಷ ರಹಿತ</span>
                      <span>✓ ಕಾಳಸರ್ಪ ಬಾಧಾ ಮುಕ್ತ</span>
                      <span>✓ ಕುಜ ದೋಷ ಮುಕ್ತ</span>
                      <span>✓ ಗುರು ಬಲ ಸಂಪನ್ನ</span>
                    </div>
                  </div>
                )}

                {/* Doshas Cards List */}
                {filteredDoshas.map((dosha) => {
                  const isCritical = dosha.severity === "critical";
                  const borderClass = isCritical
                    ? "border-rose-500/60 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900"
                    : "border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900";

                  const badgeBg = isCritical
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40";

                  return (
                    <article
                      key={dosha.id}
                      className={`rounded-3xl border-2 ${borderClass} p-6 sm:p-7 shadow-xl space-y-5 transition-all print:border-black print:bg-white print:text-black print:p-4 print:break-inside-avoid`}
                    >
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 print:border-black">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-900/40 text-2xl print:border-black">
                            {isCritical ? "⚠️" : "⚡"}
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-black text-amber-200 print:text-black">
                              {getLangText(dosha.name)}
                            </h3>
                            <p className="text-[11px] text-slate-400 print:text-black">
                              {dosha.technicalDetail.scripturalReference}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border ${badgeBg} print:border-black print:text-black`}>
                            <span className="animate-pulse">●</span>
                            <span>{getLangText(dosha.statusBadge)}</span>
                          </span>
                        </div>
                      </div>

                      {/* ⚠️ SECTION: DEDICATED CURRENT LIFE PROBLEMS PARAGRAPH */}
                      <div className="rounded-2xl bg-rose-950/30 border border-rose-500/40 p-4 space-y-2 print:bg-white print:border-black">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-300 print:text-black">
                          <span>🚨</span>
                          <span>{t("currentProblemsTitle")}</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-rose-100/90 font-medium print:text-black">
                          {getLangText(dosha.currentLifeProblems)}
                        </p>
                      </div>

                      {/* 🪐 SECTION: RUNNING DASHA-BHUKTI RESONANCE */}
                      <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/30 p-4 space-y-2 print:bg-white print:border-black">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-300 print:text-black">
                          <span>🪐</span>
                          <span>{t("dashaResonanceTitle")}</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-indigo-100/90 font-medium print:text-black">
                          {getLangText(dosha.dashaResonance)}
                        </p>
                      </div>

                      {/* 🔍 SECTION: Technical "WHY" Breakdown */}
                      <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/80 space-y-2 print:bg-white print:border-black">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 print:text-black">
                          <span>🔍</span>
                          <span>{t("technicalWhyTitle")}</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-medium print:text-black">
                          {getLangText(dosha.technicalWhy)}
                        </p>

                        {/* Technical Tags */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          {dosha.technicalDetail.houseNumbers.length > 0 && (
                            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-slate-700 print:border-black print:text-black">
                              <span>🏠</span>
                              <span>
                                {selectedLang === "kn" ? "ಭಾವಗಳು: " : "Houses: "}
                                {dosha.technicalDetail.houseNumbers.join(", ")}
                              </span>
                            </div>
                          )}
                          {dosha.technicalDetail.grahasInvolved.length > 0 && (
                            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-slate-700 print:border-black print:text-black">
                              <span>🪐</span>
                              <span>
                                {selectedLang === "kn" ? "ಗ್ರಹಗಳು: " : "Grahas: "}
                                {dosha.technicalDetail.grahasInvolved.join(", ")}
                              </span>
                            </div>
                          )}
                          {dosha.technicalDetail.hasBhangaOrMitigation && (
                            <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-950/80 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/40 print:border-black print:text-black">
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
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 print:text-black">
                          <span>⚡</span>
                          <span>{t("lifeImpactTitle")}</span>
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-300 print:text-black">
                          {getLangText(dosha.lifeImpact)
                            .split(/\n\n+/)
                            .map((para, idx) => (
                              <p key={idx} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 print:border-none print:p-0">
                                {para}
                              </p>
                            ))}
                        </div>
                      </div>

                      {/* 🔱 SECTION: Prescribed Vedic Shanti & Parihara */}
                      <div className="rounded-2xl bg-amber-950/30 border border-amber-500/30 p-4 space-y-3 print:border-black print:bg-white">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 print:text-black">
                          <span>🔱</span>
                          <span>{t("shantiRemediesTitle")}</span>
                        </div>

                        {/* Sacred Temple / Ritual */}
                        <div className="rounded-xl bg-slate-900/80 p-3 border border-amber-400/30 flex items-start gap-2.5 print:bg-white print:border-black">
                          <span className="text-xl">🛕</span>
                          <div>
                            <div className="text-[10px] font-bold uppercase text-amber-400 print:text-black">
                              {t("recommendedPoojaLabel")}
                            </div>
                            <div className="text-xs sm:text-sm font-black text-amber-200 mt-0.5 print:text-black">
                              {getLangText(dosha.recommendedPooja)}
                            </div>
                          </div>
                        </div>

                        {/* Practical Lifestyle Remedies */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-slate-400 print:text-black">
                            {t("dailyRemediesLabel")}
                          </div>
                          <ul className="space-y-1">
                            {getLangArray(dosha.remedies).map((rem, rIdx) => (
                              <li key={rIdx} className="text-xs text-slate-300 flex items-start gap-2 print:text-black">
                                <span className="text-amber-400 font-bold shrink-0">✦</span>
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
              <section className="space-y-6 pt-6 border-t-2 border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-wide text-amber-300 flex items-center gap-2">
                      <span>⚡</span>
                      <span>{t("gandantaraHeading")}</span>
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                        {detectedGandantaras.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {t("gandantaraSubheading")}
                    </p>
                  </div>
                </div>

                {/* If 0 Gandantaras detected */}
                {detectedGandantaras.length === 0 && (
                  <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 p-8 text-center max-w-2xl mx-auto space-y-3">
                    <div className="text-5xl">🛡️</div>
                    <h3 className="text-xl font-black text-emerald-300">
                      {t("noGandantaraTitle")}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {t("noGandantaraDesc")}
                    </p>
                  </div>
                )}

                {/* Gandantara Cards Grid */}
                <div className="space-y-6">
                  {detectedGandantaras.map((gandantara) => {
                    const isUnderDanger = gandantara.isCurrentlyInDangerWindow;
                    const cardBorder = isUnderDanger
                      ? "border-rose-500/60 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 shadow-rose-950/40"
                      : "border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900";

                    return (
                      <article
                        key={gandantara.id}
                        className={`rounded-3xl border-2 ${cardBorder} p-6 sm:p-7 shadow-xl space-y-5 transition-all print:border-black print:bg-white print:text-black print:p-4 print:break-inside-avoid`}
                      >
                        {/* Header: Title, Icon, Age Window Status Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 print:border-black">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-slate-900 text-2xl print:border-black">
                              {gandantara.icon}
                            </div>
                            <div>
                              <h3 className="text-lg sm:text-xl font-black text-amber-200 print:text-black">
                                {getLangText(gandantara.name)}
                              </h3>
                              <p className="text-[11px] text-slate-400 print:text-black">
                                {gandantara.scripturalReference}
                              </p>
                            </div>
                          </div>

                          <div>
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase border shadow-sm ${
                              isUnderDanger
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
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
                            ? "bg-rose-950/40 border-rose-500/50 text-rose-100"
                            : "bg-emerald-950/30 border-emerald-500/40 text-emerald-100"
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
                        <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/80 space-y-2 print:bg-white print:border-black">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 print:text-black">
                            <span>🔍</span>
                            <span>{t("technicalWhyTitle")}</span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-medium print:text-black">
                            {getLangText(gandantara.technicalReason)}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {gandantara.houseNumbers.length > 0 && (
                              <div className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-slate-700 print:border-black print:text-black">
                                <span>🏠</span>
                                <span>ಭಾವ: {gandantara.houseNumbers.join(", ")}</span>
                              </div>
                            )}
                            {gandantara.grahasInvolved.length > 0 && (
                              <div className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-slate-700 print:border-black print:text-black">
                                <span>🪐</span>
                                <span>ಗ್ರಹ: {gandantara.grahasInvolved.join(", ")}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 🪐 RUNNING DASHA RESONANCE */}
                        <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/30 p-4 space-y-2 print:bg-white print:border-black">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-300 print:text-black">
                            <span>🪐</span>
                            <span>{t("dashaResonanceTitle")}</span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed text-indigo-100/90 font-medium print:text-black">
                            {getLangText(gandantara.dashaResonance)}
                          </p>
                        </div>

                        {/* 🛑 PRECAUTIONS & BEHAVIORAL PROHIBITIONS */}
                        <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-4 space-y-2.5 print:bg-white print:border-black">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 print:text-black">
                            <span>🛑</span>
                            <span>{t("cautionProhibitionsLabel")}</span>
                          </div>
                          <ul className="space-y-1.5">
                            {getLangArray(gandantara.cautionDirectives).map((dir, dIdx) => (
                              <li key={dIdx} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2 print:text-black">
                                <span className="text-rose-400 font-bold shrink-0">⚠️</span>
                                <span className="font-medium">{dir}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 🔱 PROTECTIVE PARIHARA & MANTRAS */}
                        <div className="rounded-2xl bg-slate-900/80 border border-amber-400/30 p-4 space-y-2.5 print:bg-white print:border-black">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 print:text-black">
                            <span>🔱</span>
                            <span>{t("protectiveKavachaLabel")}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-black text-amber-200 print:text-black">
                            {getLangText(gandantara.protectiveParihara)}
                          </div>
                          <div className="space-y-1 pt-1">
                            {getLangArray(gandantara.protectiveMantras).map((man, mIdx) => (
                              <div key={mIdx} className="text-xs text-slate-300 flex items-center gap-2 print:text-black">
                                <span className="text-amber-400 font-bold">✦</span>
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
              <section className="space-y-6 pt-6 border-t-2 border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-wide text-amber-300 flex items-center gap-2">
                      <span>🧠</span>
                      <span>{t("fearsHeading")}</span>
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                        {detectedFears.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {t("fearsSubheading")}
                    </p>
                  </div>
                </div>

                {/* If 0 Fears detected */}
                {detectedFears.length === 0 && (
                  <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 p-8 text-center max-w-2xl mx-auto space-y-3">
                    <div className="text-5xl">🦁</div>
                    <h3 className="text-xl font-black text-emerald-300">
                      {t("noFearsTitle")}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
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
                          isHigh ? "border-rose-500/50 bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900" : "border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-900"
                        } p-5 sm:p-6 shadow-xl space-y-4 transition-all print:border-black print:bg-white print:text-black print:p-4 print:break-inside-avoid`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 print:border-black">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{fear.icon}</span>
                            <h3 className="text-base font-black text-amber-200 print:text-black">
                              {getLangText(fear.name)}
                            </h3>
                          </div>
                          <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${
                            isHigh
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                          } print:border-black print:text-black`}>
                            {fear.severity}
                          </span>
                        </div>

                        {/* Planetary Trigger */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 print:text-black">
                            {selectedLang === "kn" ? "ಗ್ರಹ ಪ್ರೇರಿತ ಕಾರಣ:" : "Astrological Root:"}
                          </div>
                          <p className="text-xs text-slate-300 font-medium leading-relaxed print:text-black">
                            {getLangText(fear.planetaryTrigger)}
                          </p>
                        </div>

                        {/* Psychological & Somatic Symptom */}
                        <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-1 print:bg-white print:border-black">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300 print:text-black">
                            {t("symptomLabel")}
                          </div>
                          <p className="text-xs text-rose-100/90 font-medium leading-relaxed print:text-black">
                            {getLangText(fear.psychologicalSymptom)}
                          </p>
                        </div>

                        {/* Real-Life Manifestation */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-black">
                            {t("realLifeSymptomLabel")}
                          </div>
                          <p className="text-xs text-slate-300 font-medium leading-relaxed print:text-black">
                            {getLangText(fear.realLifeManifestation)}
                          </p>
                        </div>

                        {/* Mind-Strengthening Remedy */}
                        <div className="rounded-xl bg-amber-950/20 p-3 border border-amber-500/30 space-y-1 print:bg-white print:border-black">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 print:text-black">
                            {t("mindStrengtheningLabel")}
                          </div>
                          <p className="text-xs text-amber-200/90 font-medium leading-relaxed print:text-black">
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
    </div>
  );
};

export default KundliDoshasPage;
