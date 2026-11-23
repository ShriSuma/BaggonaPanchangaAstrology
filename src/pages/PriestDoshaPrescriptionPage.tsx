import React, { useState } from "react";
import { calculateKundli } from "../core/KundliEngine";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { checkNeechaBhanga, type PlanetPosition as PrecisionPlanetPos } from "../engine/jyotishPrecisionGates";
import { evaluatePitruAndKarmaDosha } from "../engine/secretAccuracyEngine";
import type { KundliInput, PlanetPosition } from "../core/AstroTypes";

export type SixLang = "kn" | "mr" | "hi" | "te" | "ta" | "en";

interface PriestProfile {
  id: string;
  name: string;
  title: string;
  phone: string;
  kshetra: string;
}

export interface DoshaFinding {
  id: string;
  name: string;
  severity: "HIGH" | "MODERATE" | "CANCELLED";
  mathematicalCause: string;
  whatIsHappening: string[]; // Exact real-life symptoms the devotee is experiencing
  remedyTitle: string;
  sevaFee: number;
}

// Priest Directory — Shreeram Pandit default & Custom Partner Priest
export const PRIEST_DIRECTORY: PriestProfile[] = [
  {
    id: "shreeram",
    name: "Shreeram Pandit",
    title: "Chief Vedic Astrologer & Purohit",
    phone: "919972339362",
    kshetra: "Sri Kshetra Gokarna Mahabaleshwara",
  },
  {
    id: "partner_1",
    name: "Custom / Partner Priest",
    title: "Associate Temple Purohit",
    phone: "",
    kshetra: "Partner Kshetra",
  },
];

const UI_TEXT: Record<SixLang, {
  badge: string;
  title: string;
  subtitle: string;
  priestLabel: string;
  partnerNamePlaceholder: string;
  partnerPhonePlaceholder: string;
  namePlaceholder: string;
  phonePlaceholder: string;
  pobPlaceholder: string;
  btnCalculate: string;
  reportHeading: string;
  btnWhatsApp: string;
  btnCopy: string;
  copied: string;
  shastriyaBasis: string;
  whatHappeningTitle: string;
  remedyLabel: string;
  sevaFeeLabel: string;
  bookingContact: string;
}> = {
  kn: {
    badge: "ಬಗ್ಗೋಣ ಪುರೋಹಿತ & ದೋಷ ನಿವಾರಣಾ ಡೆಸ್ಕ್",
    title: "ನಿಖರ ದೋಷ ಪರಿಶೀಲನೆ, ನೈಜ ಲಕ್ಷಣಗಳು & ಪರಿಹಾರ ಡೆಸ್ಕ್",
    subtitle: "ಪುರೋಹಿತರ ಹೆಸರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ, 100% ಗಣಿತೀಯ ದೋಷ ಆಡಿಟ್ ಚಲಾಯಿಸಿ, ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಭಕ್ತರಿಗೆ ನೇರ ಪರಿಹಾರ ಚೀಟಿ ಕಳುಹಿಸಿ.",
    priestLabel: "1. ಅಧಿಕೃತ ಪುರೋಹಿತರ ಆಯ್ಕೆ (ವರದಿ ಹಾಗೂ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಮುದ್ರಿತವಾಗುತ್ತದೆ)",
    partnerNamePlaceholder: "ಸಹಯೋಗಿ ಪುರೋಹಿತರ ಹೆಸರು",
    partnerPhonePlaceholder: "ಪುರೋಹಿತರ ವಾಟ್ಸಾಪ್ (ಉದಾ: 919876543210)",
    namePlaceholder: "ಭಕ್ತರ ಪೂರ್ಣ ಹೆಸರು",
    phonePlaceholder: "ಭಕ್ತರ ವಾಟ್ಸಾಪ್ ನಂಬರ್ (ಐಚ್ಛಿಕ, 91 ನೊಂದಿಗೆ)",
    pobPlaceholder: "ಜನನ ಸ್ಥಳ (ಊರು, ರಾಜ್ಯ)",
    btnCalculate: "100% ನಿಖರ ದೋಷ & ನೈಜ ಲಕ್ಷಣಗಳ ವರದಿ ಪಡೆಯಿರಿ →",
    reportHeading: "ದೋಷ ರೋಗನಿರ್ಣಯ & ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ",
    btnWhatsApp: "📲 ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಪರಿಹಾರ ಚೀಟಿ ಕಳುಹಿಸಿ",
    btnCopy: "📋 ಸಂದೇಶ ನಕಲಿಸಿ",
    copied: "✓ ನಕಲಿಸಲಾಗಿದೆ!",
    shastriyaBasis: "ಶಾಸ್ತ್ರೀಯ ಆಧಾರ:",
    whatHappeningTitle: "ಈ ದೋಷದಿಂದ ನಿಮ್ಮ ನೈಜ ಜೀವನದಲ್ಲಿ ಏನಾಗುತ್ತಿದೆ:",
    remedyLabel: "ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ:",
    sevaFeeLabel: "ಸಂಕಲ್ಪ ಸೇವಾ ಕಾಣಿಕೆ:",
    bookingContact: "ಸಂಕಲ್ಪ & ಸೇವಾ ವಿವರಗಳಿಗೆ ಪುರೋಹಿತರ ಸಂಪರ್ಕ:",
  },
  mr: {
    badge: "बग्गोण पुरोहित व दोष निवारण डेस्क",
    title: "अचूक दोष परीक्षण, प्रत्यक्ष लक्षणे व उपाय डेस्क",
    subtitle: "पुरोहितांचे नाव निवडा, १००% गणितीय दोष परीक्षण करा आणि व्हॉट्सॲपवर भक्तांना थेट मार्गदर्शन पत्रिका पाठवा.",
    priestLabel: "१. अधिकृत पुरोहित निवडा (अहवाल व व्हॉट्सॲपवर मुद्रित होईल)",
    partnerNamePlaceholder: "सहयोगी पुरोहितांचे नाव",
    partnerPhonePlaceholder: "पुरोहितांचा व्हॉट्सॲप (उदा. 919876543210)",
    namePlaceholder: "भक्ताचे पूर्ण नाव",
    phonePlaceholder: "भक्ताचा व्हॉट्सॲप नंबर (ऐच्छिक, 91 सह)",
    pobPlaceholder: "जन्मस्थान (गाव, राज्य)",
    btnCalculate: "१००% अचूक दोष व प्रत्यक्ष लक्षणांचा अहवाल मिळवा →",
    reportHeading: "दोष निदान व शास्त्रीय उपाय",
    btnWhatsApp: "📲 व्हॉट्सॲपवर उपाय पत्रिका पाठवा",
    btnCopy: "📋 मजकूर कॉपी करा",
    copied: "✓ कॉपी झाले!",
    shastriyaBasis: "शास्त्रीय आधार:",
    whatHappeningTitle: "या दोषामुळे आपल्या प्रत्यक्ष जीवनात काय घडत आहे:",
    remedyLabel: "शास्त्रीय उपाय:",
    sevaFeeLabel: "संकल्प सेवा शुल्क:",
    bookingContact: "संकल्प व सेवेसाठी पुरोहितांशी संपर्क:",
  },
  hi: {
    badge: "बग्गोण पुरोहित एवं दोष निवारण डेस्क",
    title: "सटीक दोष विश्लेषण, प्रत्यक्ष लक्षण एवं उपाय डेस्क",
    subtitle: "पुरोहित का नाम चुनें, 100% गणितीय दोष ऑडिट चलाएं और व्हाट्सएप पर भक्तों को सीधे उपाय पर्ची भेजें।",
    priestLabel: "1. अधिकृत पुरोहित चुनें (रिपोर्ट और व्हाट्सएप पर अंकित होगा)",
    partnerNamePlaceholder: "सहयोगी पुरोहित का नाम",
    partnerPhonePlaceholder: "पुरोहित का व्हाट्सएप (उदा. 919876543210)",
    namePlaceholder: "भक्त का पूरा नाम",
    phonePlaceholder: "भक्त का व्हाट्सएप नंबर (वैकल्पिक, 91 सहित)",
    pobPlaceholder: "जन्म स्थान (शहर, राज्य)",
    btnCalculate: "100% सटीक दोष एवं प्रत्यक्ष लक्षणों की रिपोर्ट प्राप्त करें →",
    reportHeading: "दोष निदान एवं शास्त्रीय उपाय",
    btnWhatsApp: "📲 व्हाट्सएप पर उपाय पर्ची भेजें",
    btnCopy: "📋 संदेश कॉपी करें",
    copied: "✓ कॉपी किया गया!",
    shastriyaBasis: "शास्त्रीय आधार:",
    whatHappeningTitle: "इस दोष के कारण आपके वास्तविक जीवन में क्या घटित हो रहा है:",
    remedyLabel: "शास्त्रीय उपाय:",
    sevaFeeLabel: "संकल्प सेवा शुल्क:",
    bookingContact: "संकल्प एवं सेवा बुकिंग हेतु पुरोहित से संपर्क करें:",
  },
  te: {
    badge: "బగ్గోణ పురోహిత & దోష నివారణ డెస్క్",
    title: "ఖచ్చితమైన దోష పరీక్ష, నిజ జీవిత లక్షణాలు & నివారణ డెస్క్",
    subtitle: "పురోహితుల పేరును ఎంచుకోండి, 100% ఖచ్చితమైన దోష ఆడిట్ చేసి వాట్సాప్ ద్వారా భక్తులకు నేరుగా పరిహార పత్రాన్ని పంపండి.",
    priestLabel: "1. అధికృత పురోహితుడి ఎంపిక (నివేదిక మరియు వాట్సాప్‌లో ముద్రించబడుతుంది)",
    partnerNamePlaceholder: "సహయోగ పురోహితుడి పేరు",
    partnerPhonePlaceholder: "పురోహితుడి వాట్సాప్ (ఉదా: 919876543210)",
    namePlaceholder: "భక్తుడి పూర్తి పేరు",
    phonePlaceholder: "భక్తుడి వాట్సాప్ నంబర్ (ఐచ్ఛికం, 91 తో)",
    pobPlaceholder: "జన్మ స్థలం (నగరం, రాష్ట్రం)",
    btnCalculate: "100% ఖచ్చితమైన దోష & వాస్తవ లక్షణాల నివేదిక పొందండి →",
    reportHeading: "దోష విశ్లేషణ & శాస్త్రీయ నివారణ",
    btnWhatsApp: "📲 వాట్సాప్‌లో పరిహార పత్రం పంపండి",
    btnCopy: "📋 సందేశాన్ని కాపీ చేయండి",
    copied: "✓ కాపీ చేయబడింది!",
    shastriyaBasis: "శాస్త్రీయ ఆధారం:",
    whatHappeningTitle: "ఈ దోషం వల్ల మీ వాస్తవ జీవితంలో ఏమి జరుగుతోంది:",
    remedyLabel: "శాస్త్రీయ నివారణ:",
    sevaFeeLabel: "సంకల్ప సేవా రుసుము:",
    bookingContact: "సంకల్పం & సేవల వివరాలకు పురోహితుడిని సంప్రదించండి:",
  },
  ta: {
    badge: "பக்கோணா புரோகிதர் & தோஷ நிவாரண மையம்",
    title: "துல்லியமான தோஷ பரிசோதனை, நிஜ வாழ்க்கை அறிகுறிகள் & பரிகார மையம்",
    subtitle: "புரோகிதரைத் தேர்ந்தெடுத்து, 100% கணித தோஷ தணிக்கையை இயக்கி வாட்ஸ்அப் மூலம் பக்தர்களுக்கு நேரடியாக பரிகாரக் குறிப்பை அனுப்புங்கள்.",
    priestLabel: "1. பொறுப்பு புரோகிதரைத் தேர்வு செய்க (அறிக்கையிலும் வாட்ஸ்அப்பிலும் பதியப்படும்)",
    partnerNamePlaceholder: "இணை புரோகிதர் பெயர்",
    partnerPhonePlaceholder: "புரோகிதர் வாட்ஸ்அப் (எ.கா: 919876543210)",
    namePlaceholder: "பக்தரின் முழுப் பெயர்",
    phonePlaceholder: "பக்தரின் வாட்ஸ்அப் எண் (விருப்பத்தேர்வு, 91 உடன்)",
    pobPlaceholder: "பிறந்த இடம் (நகரம், மாநிலம்)",
    btnCalculate: "100% துல்லிய தோஷ & நிஜ வாழ்க்கை அறிக்கை பெறுக →",
    reportHeading: "தோஷக் கண்டறிதல் & சாஸ்திர பரிகாரம்",
    btnWhatsApp: "📲 வாட்ஸ்அப்பில் பரிகாரச் சீட்டை அனுப்புங்கள்",
    btnCopy: "📋 நகலெடுக்கவும்",
    copied: "✓ நகலெடுக்கப்பட்டது!",
    shastriyaBasis: "சாஸ்திர அடிப்படை:",
    whatHappeningTitle: "இந்த தோஷத்தினால் உங்கள் நிஜ வாழ்க்கையில் என்ன நடக்கிறது:",
    remedyLabel: "சாஸ்திர பரிகாரம்:",
    sevaFeeLabel: "சங்கல்ப சேவைக் காணிக்கை:",
    bookingContact: "சங்கல்பம் & சேவைப் பதிவிற்கு புரோகிதரைத் தொடர்பு கொள்க:",
  },
  en: {
    badge: "Baggona Priest & Dosha Prescription Desk",
    title: "Exact Dosha, Real-Life Impact & Remedy Sender",
    subtitle: "Select the officiating Priest, run the 100% mathematical Dosha audit, and send a branded WhatsApp prescription directly to the devotee.",
    priestLabel: "1. Select Officiating Priest (Stamped on Report & WhatsApp)",
    partnerNamePlaceholder: "Enter Partner Priest Name",
    partnerPhonePlaceholder: "Priest WhatsApp (e.g. 919876543210)",
    namePlaceholder: "Devotee Full Name",
    phonePlaceholder: "Devotee WhatsApp (Optional, with 91)",
    pobPlaceholder: "Place of Birth (City, State)",
    btnCalculate: "Generate 100% Accurate Dosha & Symptom Report →",
    reportHeading: "Dosha Diagnostics & Shastriya Remedies",
    btnWhatsApp: "📲 Send Prescription on WhatsApp",
    btnCopy: "📋 Copy Text",
    copied: "✓ Copied!",
    shastriyaBasis: "Shastriya Basis:",
    whatHappeningTitle: "What Is Happening in Real Life Because of This:",
    remedyLabel: "Recommended Remedy:",
    sevaFeeLabel: "Sankalpa Seva:",
    bookingContact: "Contact for Sankalpa & Seva Booking:",
  },
};

export const PriestDoshaPrescriptionPage: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<SixLang>("kn");
  const [selectedPriestId, setSelectedPriestId] = useState<string>("shreeram");
  const [customPriestName, setCustomPriestName] = useState("");
  const [customPriestPhone, setCustomPriestPhone] = useState("");
  const [copied, setCopied] = useState(false);

  const [devotee, setDevotee] = useState({
    name: "",
    dob: "",
    tob: "",
    pob: "",
    clientWhatsApp: "",
  });

  const [findings, setFindings] = useState<DoshaFinding[] | null>(null);

  const t = UI_TEXT[selectedLang];

  const activePriest: PriestProfile =
    selectedPriestId === "partner_1"
      ? {
          id: "partner_1",
          name: customPriestName || "Temple Purohit",
          title: "Vedic Purohit",
          phone: customPriestPhone.replace(/\D/g, "") || "919972339362",
          kshetra: "Sri Kshetra Gokarna",
        }
      : PRIEST_DIRECTORY.find((p) => p.id === selectedPriestId) || PRIEST_DIRECTORY[0];

  const runDoshaAudit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Construct Kundli Input
    const [y, m, d] = devotee.dob.split("-").map(Number);
    const validDob = devotee.dob && y && m && d ? devotee.dob : "1995-01-01";
    const validTob = devotee.tob || "12:00";

    const kundliInput: KundliInput = {
      name: devotee.name || "Devotee",
      birthDate: validDob,
      birthTime: validTob,
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Male",
    };

    // 2. Real Parashari Kundli Calculation
    const kundli = calculateKundli(kundliInput, { ayanamsaModel: "lahiri" });

    // 3. Comprehensive Dosha Engine Calculation
    const doshaReport = calculateComprehensiveDoshas(kundli, kundliInput, new Date());

    // 4. Precision Neecha Bhanga & Precision Gates
    const planetMap: Partial<Record<string, PrecisionPlanetPos>> = {};
    kundli.planets.forEach((p) => {
      planetMap[p.name] = {
        planet: p.name as any,
        longitude: p.degree,
        rashi: p.rashi.index as any,
        degreeInSign: p.degree % 30,
        rashiHouse: p.house,
      };
    });

    const marsPos = kundli.planets.find((p) => p.name === "Mars");
    const jupiterPos = kundli.planets.find((p) => p.name === "Jupiter");
    const sunPos = kundli.planets.find((p) => p.name === "Sun");
    const rahuPos = kundli.planets.find((p) => p.name === "Rahu");
    const saturnPos = kundli.planets.find((p) => p.name === "Saturn");

    // Mars Manglik & Parashari Cancellation Check
    let marsIsManglik = false;
    let marsCancelled = false;
    let marsCancelReason = "";

    if (marsPos) {
      const kujaHouses = [1, 2, 4, 7, 8, 12];
      if (kujaHouses.includes(marsPos.house)) {
        marsIsManglik = true;
      }
      // Check Neecha Bhanga for Mars
      const marsNB = checkNeechaBhanga(
        {
          planet: "Mars",
          longitude: marsPos.degree,
          rashi: marsPos.rashi.index as any,
          degreeInSign: marsPos.degree % 30,
          rashiHouse: marsPos.house,
        },
        planetMap,
        kundli.lagnaRashi.index,
        kundli.moonSign.index
      );

      // Check Jupiter aspect on Mars (Jupiter 5th, 7th, 9th aspect)
      let jupiterAspectsMars = false;
      if (jupiterPos) {
        const diffHouse = ((marsPos.house - jupiterPos.house + 12) % 12) + 1;
        if (diffHouse === 5 || diffHouse === 7 || diffHouse === 9) {
          jupiterAspectsMars = true;
        }
      }

      // Check own sign / exalted (Aries, Scorpio, Capricorn)
      const isMarsOwnOrExalted = [0, 7, 9].includes(marsPos.rashi.index);

      if (marsNB.hasNeechaBhanga || jupiterAspectsMars || isMarsOwnOrExalted) {
        marsCancelled = true;
        marsCancelReason = jupiterAspectsMars
          ? "Benefic Jupiter Aspect on Mars (Guru Drishti Parashari Bhanga)"
          : isMarsOwnOrExalted
          ? "Mars in Own Sign or Exaltation (Swakshetra / Uccha Bhanga)"
          : marsNB.reason || "Neecha Bhanga Cancellation";
      }
    }

    // 5. Secret Accuracy Engine — Pitru & Karma Audit
    const maandiHouse = (kundli as any).maandi?.house || 1;
    const pitruAudit = evaluatePitruAndKarmaDosha(
      kundli.planets.map((p) => ({
        planet: p.name as any,
        longitude: p.degree,
        rashi: p.rashi.index as any,
        degreeInSign: p.degree % 30,
        rashiHouse: p.house,
      })),
      maandiHouse
    );

    // 6. Check Sarpa / Kala Sarpa Dosha
    const detectedKalaSarpa = doshaReport.doshas.find((d) => d.id === "kala_sarpa");
    const hasSarpa = detectedKalaSarpa ? detectedKalaSarpa.isDetected : false;

    // Build Formatted Findings in Selected Language
    const generatedFindings: DoshaFinding[] = [];

    // --- Finding 1: Pitru Dosha ---
    const pitruDetected = pitruAudit.hasPitruDosha || doshaReport.doshas.some((d) => d.id === "pitru_dosha" && d.isDetected);
    const pitruSeverity: "HIGH" | "MODERATE" | "CANCELLED" = pitruDetected ? "HIGH" : "CANCELLED";
    const pitruMathCause = (pitruAudit.pitruDoshaReasons && pitruAudit.pitruDoshaReasons.length > 0)
      ? pitruAudit.pitruDoshaReasons.join("; ")
      : sunPos && rahuPos && Math.abs(sunPos.house - rahuPos.house) <= 1
      ? "Sun-Rahu nodal pressure affecting 9th Bhava of Pitru Dharma"
      : "No malefic affliction on Sun or 9th Bhava; Ancestral lineage is purified";

    const pitruSymptoms: Record<SixLang, string[]> = {
      kn: pitruDetected
        ? [
            "ಕುಟುಂಬದ ಶುಭ ಕಾರ್ಯಗಳಲ್ಲಿ ಪದೇ ಪದೇ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು ಅಥವಾ ವಿವಾಹ-ಸಂತಾನ ವಿಳಂಬ.",
            "ಉಳಿತಾಯ ಕೂಡಿಬಂದ ಬೆನ್ನಲ್ಲೇ ಆಸ್ಪತ್ರೆ ಅಥವಾ ಅನಿರೀಕ್ಷಿತ ಧನವ್ಯಯ.",
            "ಕಾರಣವಿಲ್ಲದ ಮಾನಸಿಕ ಭಾರ, ಪಿತೃಗಳ ಕನಸು ಅಥವಾ ಮನೆಯಲ್ಲಿ ನೆಮ್ಮದಿಯ ಕೊರತೆ.",
          ]
        : ["ಪಿತೃ ದೋಷದಿಂದ ಯಾವುದೇ ಅಡೆತಡೆಗಳಿಲ್ಲ. ಪಿತೃಗಳ ಆಶೀರ್ವಾದ ಪರಿಪೂರ್ಣವಾಗಿದೆ."],
      mr: pitruDetected
        ? [
            "कुटुंबातील शुभ कार्यात वारंवार अनपेक्षित अडथळे किंवा विवाह-संतती विलंब.",
            "बचत साठताच अचानक दवाखाना किंवा अनपेक्षित आर्थिक गळती.",
            "विनाकारण मानसिक ताण, पूर्वजांचे स्वप्न किंवा घरात शांततेचा अभाव.",
          ]
        : ["पितृ दोषाचा कोणताही अडथळा नाही. पूर्वजांचे आशीर्वाद पूर्ण आहेत."],
      hi: pitruDetected
        ? [
            "पारिवारिक मांगलिक कार्यों में बार-बार अप्रत्याशित बाधाएं या विवाह-संतान में विलंब।",
            "जैसे ही बचत संचित होती है, तुरंत अप्रत्याशित खर्च या स्वास्थ्य संबंधी धन हानि।",
            "अकारण मानसिक भारीपन, पूर्वजों के स्वप्न या घर में अशांति।",
          ]
        : ["पितृ दोष का कोई प्रभाव नहीं है। पूर्वजों का पूर्ण आशीर्वाद प्राप्त है।"],
      te: pitruDetected
        ? [
            "కుటుంబ శుభకార్యాలలో పదేపదే అనుకోని ఆటంకాలు లేదా వివాహ-సంతాన ఆలస్యం.",
            "పొదుపు సమకూరగానే ఊహించని ఖర్చులు లేదా అనారోగ్య వ్యయం.",
            "కారణం లేని మానసిక ఆందోళన, పితృదేవతల కలలు లేదా ఇంట్లో ప్రశాంతత లోపించడం.",
          ]
        : ["పితృ దోష ప్రభావం ఏమీ లేదు. పితృదేవతల ఆశీస్సులు పరిపూర్ణంగా ఉన్నాయి."],
      ta: pitruDetected
        ? [
            "குடும்ப சுப காரியங்களில் மீண்டும் மீண்டும் ஏற்படும் தடைகள் அல்லது திருமண தாமதம்.",
            "சேமிப்பு சேர்ந்தவுடன் திடீரென ஏற்படும் எதிர்பாராத மருத்துவ அல்லது பண விரயம்.",
            "காரணமில்லாத மன அழுத்தம், முன்னோர்களின் கனவுகள் அல்லது வீட்டில் அமைதியின்மை.",
          ]
        : ["பித்ரு தோஷ பாதிப்பு எதுவுமில்லை. முன்னோர்களின் ஆசி நிறைந்துள்ளது."],
      en: pitruDetected
        ? [
            "Repeated obstacles in family auspicious events (marriage/progeny delays).",
            "Sudden unexpected financial drain right when savings accumulate.",
            "Unexplained heaviness, ancestral dreams, or lack of peace at home.",
          ]
        : ["No active Pitru Dosha impediment. Ancestral lineage blessings intact."],
    };

    const pitruRemedyTitle: Record<SixLang, string> = {
      kn: "ಶ್ರೀಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ನಾರಾಯಣ ಬಲಿ / ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ & ಪಿತೃ ತರ್ಪಣ",
      mr: "श्रीक्षेत्र गोकर्ण नारायण बली / त्रिपिंडी श्राद्ध व पितृ तर्पण",
      hi: "श्री क्षेत्र गोकर्ण नारायण बलि / त्रिपिंडी श्राद्ध एवं पितृ तर्पण",
      te: "శ్రీక్షేత్ర గోకర్ణ నారాయణ బలి / త్రిపిండి శ్రాద్ధం & పితృ తర్పణం",
      ta: "ஸ்ரீ க்ஷேத்ர கோகர்ணா நாராயண பலி / திரிபிண்டி சிரார்த்தம் & பித்ரு தர்ப்பணம்",
      en: "Sri Kshetra Gokarna Narayana Bali / Tripindi Shraddha & Pitru Tarpanam",
    };

    generatedFindings.push({
      id: "pitru",
      name:
        selectedLang === "kn"
          ? "ಪಿತೃ ದೋಷ (9ನೇ ಭಾವ ರವಿ-ರಾಹು ಪೀಡೆ)"
          : selectedLang === "mr"
          ? "पितृ दोष (९ वे स्थान सूर्य-राहू पीडा)"
          : selectedLang === "hi"
          ? "पितृ दोष (नवम भाव सूर्य-राहु पीड़ा)"
          : selectedLang === "te"
          ? "పితృ దోషం (9వ భావం రవి-రాహు పీడ)"
          : selectedLang === "ta"
          ? "பித்ரு தோஷம் (9ம் பாவம் சூரிய-ராகு பீடை)"
          : "Pitru Dosha (9th House Sun-Rahu Affliction)",
      severity: pitruSeverity,
      mathematicalCause: pitruMathCause,
      whatIsHappening: pitruSymptoms[selectedLang],
      remedyTitle: pitruRemedyTitle[selectedLang],
      sevaFee: pitruDetected ? 3100 : 0,
    });

    // --- Finding 2: Sarpa / Kala Sarpa Dosha ---
    const sarpaSeverity: "HIGH" | "MODERATE" | "CANCELLED" = hasSarpa ? "MODERATE" : "CANCELLED";
    const sarpaMathCause = hasSarpa
      ? (detectedKalaSarpa?.technicalWhy?.[selectedLang] || "Rahu-Ketu nodal axis encompassing planets with Moon Nakshatra tension.")
      : "Rahu-Ketu axis open; planets free from total nodal grip.";

    const sarpaSymptoms: Record<SixLang, string[]> = {
      kn: hasSarpa
        ? [
            "ಅತಿಯಾದ ಆಲೋಚನೆ, ನಂಬಿದವರಿಂದ ದ್ರೋಹದ ಭೀತಿ ಮತ್ತು ರಾತ್ರಿಯ ವೇಳೆ ಹಠಾತ್ ಆತಂಕ.",
            "ಉತ್ತಮ ಅವಕಾಶಗಳು ಅಥವಾ ಮಾತುಕತೆಗಳು ಅಂತಿಮ ಘಟ್ಟದಲ್ಲಿ ಕೈತಪ್ಪಿ ಹೋಗುವುದು.",
          ]
        : ["ಸರ್ಪ ದೋಷ ಬಾಧೆ ಇಲ್ಲ; ಮಾನಸಿಕ ಸ್ಥೈರ್ಯ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸ ಉತ್ತಮವಾಗಿದೆ."],
      mr: hasSarpa
        ? [
            "अतिविचार, विश्वासू व्यक्तींकडून विश्वासाघाताची भीती आणि रात्री अचानक अस्वस्थता.",
            "चांगल्या संधी किंवा चर्चा अंतिम टप्प्यात हातातून निसटणे.",
          ]
        : ["सर्प दोषाचा कोणताही प्रभाव नाही; मानसिक स्थैर्य उत्तम आहे."],
      hi: hasSarpa
        ? [
            "अत्यधिक चिंता, विश्वासपात्र लोगों से धोखे का भय और अचानक घबराहट।",
            "अंतिम बातचीत के स्तर पर अच्छे अवसर अचानक हाथ से निकल जाना।",
          ]
        : ["सर्प दोष का प्रभाव नहीं है; मानसिक स्थिरता एवं आत्मविश्वास उत्तम है।"],
      te: hasSarpa
        ? [
            "అధిక ఆలోచనలు, నమ్మిన వారి నుండి మోసం జరుగుతుందనే భయం మరియు ఆందోళన.",
            "మంచి అవకాశాలు చివరి దశలో చేజారిపోవడం.",
          ]
        : ["సర్ప దోష ప్రభావం లేదు; మనోధైర్యం చక్కగా ఉంది."],
      ta: hasSarpa
        ? [
            "அதிக சிந்தனை, நம்பியவர்களால் ஏமாற்றப்படுவோமோ என்ற பயம் மற்றும் திடீர் பதற்றம்.",
            "நல்ல வாய்ப்புகள் இறுதி கட்டத்தில் கைநழுவிப் போவது.",
          ]
        : ["சர்ப்ப தோஷ பாதிப்பு இல்லை; மனோபலம் சீராக உள்ளது."],
      en: hasSarpa
        ? [
            "Overthinking, sudden anxiety, and fear of betrayal from close people.",
            "Good opportunities slipping away at the final discussion stage.",
          ]
        : ["No Sarpa Dosha obstruction; mental clarity and progress stable."],
    };

    const sarpaRemedyTitle: Record<SixLang, string> = {
      kn: "ಶ್ರೀಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ನಾಗಪ್ರತಿಷ್ಠೆ / ಆಶ್ಲೇಷಾ ಬಲಿ & ರಾಹು-ಕೇತು ಶಾಂತಿ",
      mr: "श्रीक्षेत्र गोकर्ण नाग प्रतिष्ठा / आश्लेषा बली व राहू-केतू शांती",
      hi: "श्री क्षेत्र गोकर्ण नाग प्रतिष्ठा / आश्लेषा बलि एवं राहु-केतु शांति",
      te: "శ్రీక్షేత్ర గోకర్ణ నాగ ప్రతిష్ట / ఆశ్లేషా బలి & రాహు-కేతు శాంతి",
      ta: "ஸ்ரீ க்ஷேத்ர கோகர்ணா நாக பிரதிஷ்டை / ஆயில்ய பலி & ராகு-கேது சாந்தி",
      en: "Sri Kshetra Gokarna Naga Pratishtha / Ashlesha Bali & Rahu-Ketu Shanti",
    };

    generatedFindings.push({
      id: "sarpa",
      name:
        selectedLang === "kn"
          ? "ಆಶ್ಲೇಷಾ / ಸರ್ಪ ದೋಷ (ರಾಹು-ಕೇತು ಅಕ್ಷ ಪೀಡೆ)"
          : selectedLang === "mr"
          ? "आश्लेषा / सर्प दोष (राहू-केतू अक्ष पीडा)"
          : selectedLang === "hi"
          ? "आश्लेषा / सर्प दोष (राहु-केतु अक्ष पीड़ा)"
          : selectedLang === "te"
          ? "ఆశ్లేష / సర్ప దోషం (రాహు-కేతు అక్ష పీడ)"
          : selectedLang === "ta"
          ? "ஆயில்யம் / சர்ப்ப தோஷம் (ராகு-கேது அச்சு பீடை)"
          : "Ashlesha / Sarpa Dosha (Rahu-Ketu Nodal Pressure)",
      severity: sarpaSeverity,
      mathematicalCause: sarpaMathCause,
      whatIsHappening: sarpaSymptoms[selectedLang],
      remedyTitle: sarpaRemedyTitle[selectedLang],
      sevaFee: hasSarpa ? 2100 : 0,
    });

    // --- Finding 3: Kuja (Manglik) Dosha ---
    const kujaSeverity: "HIGH" | "MODERATE" | "CANCELLED" =
      marsCancelled || !marsIsManglik ? "CANCELLED" : "HIGH";

    const kujaMathCause = marsCancelled
      ? `Mars in House ${marsPos?.house || 7}, but Cancelled: ${marsCancelReason}`
      : marsIsManglik
      ? `Mars placed in 7th/8th Bhava without benefic Jupiter relief.`
      : "Mars favorably situated outside Manglik houses.";

    const kujaSymptoms: Record<SixLang, string[]> = {
      kn: marsCancelled
        ? ["ದಾಂಪತ್ಯದಲ್ಲಿ ಸಾಮಾನ್ಯ ಸ್ವಭಾವದ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಹೊರತುಪಡಿಸಿ ಯಾವುದೇ ಗಂಭೀರ ಆಪತ್ತಿಲ್ಲ."]
        : marsIsManglik
        ? ["ಸಂಬಂಧಗಳಲ್ಲಿ ತೀವ್ರ ಕೋಪ ಹಾಗೂ ಹಠಾತ್ ಘರ್ಷಣೆ, ವಿವಾಹ ನಿಶ್ಚಯದಲ್ಲಿ ಅಡೆತಡೆಗಳು."]
        : ["ಕುಜ ದೋಷವಿಲ್ಲ; ದಾಂಪತ್ಯ ಜೀವನ ಸುಸೂತ್ರವಾಗಿದೆ."],
      mr: marsCancelled
        ? ["नात्यात सामान्य स्वभावभेद वगळता कोणताही गंभीर धोका नाही."]
        : marsIsManglik
        ? ["नात्यात तीव्र राग व अचानक वाद, विवाह जुळण्यात वारंवार अडथळे."]
        : ["कुज दोष नाही; वैवाहिक जीवन सुरळीत राहील."],
      hi: marsCancelled
        ? ["दांपत्य में सामान्य स्वभाविक मतभेद के अलावा कोई गंभीर संकट नहीं है।"]
        : marsIsManglik
        ? ["संबंधों में तीव्र क्रोध एवं अचानक टकराव, विवाह तय होने में रुकावटें।"]
        : ["कुज दोष नहीं है; वैवाहिक स्थिति सामान्य है।"],
      te: marsCancelled
        ? ["దాంపత్యంలో చిన్నపాటి అభిప్రాయ భేదాలు తప్ప ఎటువంటి తీవ్ర ముప్పు లేదు."]
        : marsIsManglik
        ? ["సంబంధాలలో తీవ్రమైన కోపం మరియు ఘర్షణలు, వివాహం కుదరడంలో ఆటంకాలు."]
        : ["కుజ దోషం లేదు; దాంపత్యం అనుకూలంగా ఉంది."],
      ta: marsCancelled
        ? ["உறவில் இயல்பான கருத்து வேறுபாட்டைத் தவிர எவ்வித தீவிர ஆபத்தும் இல்லை."]
        : marsIsManglik
        ? ["உறவுகளில் தீவிர கோபம் மற்றும் மோதல்கள், திருமணப் பேச்சுவார்த்தையில் தடைகள்."]
        : ["செவ்வாய் தோஷம் இல்லை; திருமண வாழ்க்கை சீரானது."],
      en: marsCancelled
        ? ["Minor temper or ego friction in partnerships, but NO severe marriage danger."]
        : marsIsManglik
        ? ["Intense relationship friction, short temper, and hurdles in marriage settlement."]
        : ["No active Manglik affliction; harmonious marital alignment."],
    };

    const kujaRemedyTitle: Record<SixLang, string> = {
      kn: marsCancelled
        ? "ಯಾವುದೇ ದುಬಾರಿ ಪೂಜೆ ಅಗತ್ಯವಿಲ್ಲ — ಮಂಗಳವಾರ ಸರಳ ಸುಬ್ರಹ್ಮಣ್ಯ ಅರ್ಚನೆ ಸಾಕು."
        : "ಶ್ರೀಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕುಜದೋಷ ಶಾಂತಿ & ಸುಬ್ರಹ್ಮಣ್ಯ ಹೋಮ",
      mr: marsCancelled
        ? "कोणत्याही महागड्या पूजेची गरज नाही — मंगळवारी साधी सुब्रह्मण्य अर्चना पुरेशी आहे."
        : "श्रीक्षेत्र गोकर्ण कुजदोष शांती व सुब्रह्मण्य होम",
      hi: marsCancelled
        ? "किसी महंगे अनुष्ठान की आवश्यकता नहीं — मंगलवार को सरल सुब्रह्मण्य अर्चना पर्याप्त है।"
        : "श्री क्षेत्र गोकर्ण कुज दोष शांति एवं सुब्रह्मण्य होम",
      te: marsCancelled
        ? "ఎటువంటి ఖరీదైన పూజ అవసరం లేదు — మంగళవారం సుబ్రహ్మణ్య స్వామి అర్చన సరిపోతుంది."
        : "శ్రీక్షేత్ర గోకర్ణ కుజదోష శాంతి & సుబ్రహ్మణ్య హోమం",
      ta: marsCancelled
        ? "செலவு மிகுந்த பூஜை தேவையில்லை — செவ்வாய்க்கிழமை எளிய சுப்பிரமணியர் அர்ச்சனை போதுமானது."
        : "ஸ்ரீ க்ஷேத்ர கோகர்ணா செவ்வாய் தோஷ சாந்தி & சுப்பிரமணிய ஹோமம்",
      en: marsCancelled
        ? "No expensive puja needed — Simple Tuesday Subramanya Archana suffices."
        : "Sri Kshetra Gokarna Kuja Dosha Shanti & Subramanya Homa",
    };

    generatedFindings.push({
      id: "kuja",
      name:
        selectedLang === "kn"
          ? marsCancelled ? "ಕುಜ (ಮಾಂಗಲ್ಯ) ದೋಷ — ಪರಾಶರಿ ಭಂಗ (ರದ್ದು)" : "ಕುಜ (ಮಾಂಗಲ್ಯ) ದೋಷ — ಸಕ್ರಿಯ"
          : selectedLang === "mr"
          ? marsCancelled ? "कुज (मांगलिक) दोष — पराशरी भंग (रद्द)" : "कुज (मांगलिक) दोष — सक्रिय"
          : selectedLang === "hi"
          ? marsCancelled ? "कुज (मांगलिक) दोष — पराशरी भंग (रद्द)" : "कुज (मांगलिक) दोष — सक्रिय"
          : selectedLang === "te"
          ? marsCancelled ? "కుజ (మాంగళ్య) దోషం — పరాశరి భంగం (రద్దు)" : "కుజ (మాంగళ్య) దోషం — సక్రియం"
          : selectedLang === "ta"
          ? marsCancelled ? "செவ்வாய் (மாங்கல்ய) தோஷம் — பராசர பரிஹாரம் (ரத்து)" : "செவ்வாய் தோஷம் — தீவிரம்"
          : marsCancelled ? "Kuja (Manglik) Dosha — Parashari Cancelled" : "Kuja (Manglik) Dosha — Active",
      severity: kujaSeverity,
      mathematicalCause: kujaMathCause,
      whatIsHappening: kujaSymptoms[selectedLang],
      remedyTitle: kujaRemedyTitle[selectedLang],
      sevaFee: marsCancelled ? 0 : 1800,
    });

    // --- Finding 4: Maandi (Gulika) 99% Knot ---
    const maandiSeverity = pitruAudit.hasMaandi99Knot ? "HIGH" : "MODERATE";
    const maandiMathCause = `Maandi (Gulika) positioned in Bhava ${maandiHouse}; creates last-mile karmic friction.`;

    const maandiSymptoms: Record<SixLang, string[]> = {
      kn: [
        "ಕೆಲಸಗಳು 99% ವರೆಗೆ ಸುಲಭವಾಗಿ ಸಾಗಿ ಕೊನೆಯ ಹೆಜ್ಜೆಯಲ್ಲಿ ಸ್ಥಗಿತಗೊಳ್ಳುವುದು.",
        "ಅದೃಶ್ಯ ಕೈಯೊಂದು ಯಶಸ್ಸನ್ನು ಹಿಂದಕ್ಕೆ ಎಳೆಯುತ್ತಿರುವಂತೆ ಭಾಸವಾಗುವುದು.",
      ],
      mr: [
        "कामे ९९% पर्यंत व्यवस्थित होऊन अगदी शेवटच्या क्षणी थांबणे.",
        "एक अदृश्य शक्ती यशापासून मागे खेचत असल्याचा अनुभव येणे.",
      ],
      hi: [
        "कार्य 99% तक सुचारू रूप से आगे बढ़कर अंतिम क्षण में रुक जाना।",
        "ऐसा अनुभव होना कि कोई अदृश्य शक्ति सफलता को पीछे खींच रही है।",
      ],
      te: [
        "పనులు 99% వరకు సజావుగా సాగి చివరి క్షణంలో ఆగిపోవడం.",
        "అదృశ్య శక్తి విజయాన్ని వెనక్కి లాగుతున్నట్లు అనిపించడం.",
      ],
      ta: [
        "காரியங்கள் 99% வரை எளிதாக நடந்து இறுதி தருணத்தில் தடைபடுதல்.",
        "ஒரு கண்ணுக்குத் தெரியாத சக்தி வெற்றியை பின்னிழுப்பது போன்ற உணர்வு.",
      ],
      en: [
        "Tasks progress smoothly up to 99% and then stall at the absolute final step.",
        "Feeling as if an unseen invisible hand is pulling back your rightful success.",
      ],
    };

    const maandiRemedyTitle: Record<SixLang, string> = {
      kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ & ಮಾಂದಿ ಶಾಂತಿ",
      mr: "श्री गोकर्ण महाबळेश्वर महा रुद्राभिषेक व मांदी शांती",
      hi: "श्री गोकर्ण महाबलेश्वर महा रुद्राभिषेक एवं मांदी शांति",
      te: "శ్రీ గోకర్ణ మహాబలేశ్వర మహా రుద్రాభిషేకం & మాంది శాంతి",
      ta: "ஸ்ரீ கோகர்ணா மகாபலேஸ்வரர் மகா ருத்ராபிஷேகம் & மாந்தி சாந்தி",
      en: "Sri Gokarna Mahabaleshwara Maha Rudrabhisheka & Maandi Shanti",
    };

    generatedFindings.push({
      id: "maandi",
      name:
        selectedLang === "kn"
          ? "ಮಾಂದಿ (ಗುಳಿಕ) 99% ಅಂತಿಮ ಗಂಟು"
          : selectedLang === "mr"
          ? "मांदी (गुलिक) ९९% शेवटचा अडथळा"
          : selectedLang === "hi"
          ? "मांदी (गुलिक) 99% अंतिम रुकावट"
          : selectedLang === "te"
          ? "మాంది (గుళిక) 99% చివరి ముడి"
          : selectedLang === "ta"
          ? "மாந்தி (குளிகன்) 99% இறுதித் தடை"
          : "Maandi (Gulika) 99% Last-Mile Knot",
      severity: maandiSeverity,
      mathematicalCause: maandiMathCause,
      whatIsHappening: maandiSymptoms[selectedLang],
      remedyTitle: maandiRemedyTitle[selectedLang],
      sevaFee: 1500,
    });

    setFindings(generatedFindings);
  };

  const buildPrescriptionText = (): string => {
    if (!findings) return "";
    const activeDoshas = findings.filter((f) => f.severity !== "CANCELLED");
    const summaryLines = activeDoshas
      .map(
        (d, idx) =>
          `${idx + 1}. *${d.name}* [${d.severity}]\n` +
          `   • ${t.whatHappeningTitle} ${d.whatIsHappening[0]}\n` +
          `   • ${t.remedyLabel} ${d.remedyTitle}` +
          (d.sevaFee > 0 ? ` (${t.sevaFeeLabel} ₹${d.sevaFee})` : "")
      )
      .join("\n\n");

    const priestPhone = activePriest.phone || "919972339362";

    return (
      `🙏 *Namaste ${devotee.name || "Devotee"}*\n` +
      `*${t.reportHeading}*\n` +
      `Officiating Priest: *${activePriest.name}* (${activePriest.kshetra})\n\n` +
      `${summaryLines}\n\n` +
      `📞 ${t.bookingContact} +${priestPhone}`
    );
  };

  const sendToWhatsApp = () => {
    const rawText = buildPrescriptionText();
    if (!rawText) return;
    const message = encodeURIComponent(rawText);
    const targetPhone = devotee.clientWhatsApp.replace(/\D/g, "");
    const url = targetPhone
      ? `https://wa.me/${targetPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, "_blank");
  };

  const copyToClipboard = () => {
    const rawText = buildPrescriptionText();
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0E0705] text-[#F9F1E8] py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-7">
        {/* Language Selector Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E8C563]/20 pb-3">
          <div className="text-xs text-[#E8C563] font-bold tracking-wider uppercase">
            Language / ಭಾಷೆ / भाषा
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { code: "kn", label: "ಕನ್ನಡ" },
                { code: "mr", label: "मराठी" },
                { code: "hi", label: "हिंदी" },
                { code: "te", label: "తెలుగు" },
                { code: "ta", label: "தமிழ்" },
                { code: "en", label: "English" },
              ] as const
            ).map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  selectedLang === lang.code
                    ? "bg-[#E8C563] text-[#120805] font-bold shadow-md"
                    : "bg-[#24120C] text-[#C7B3A3] hover:text-white hover:bg-[#341A10]"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#2B140C] text-[#E8C563] border border-[#E8C563]/30">
            {t.badge}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-3 leading-tight">
            {t.title}
          </h1>
          <p className="text-sm text-[#C7B3A3] mt-2 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={runDoshaAudit}
          className="bg-[#1A0D09] border border-[#E8C563]/30 rounded-2xl p-5 md:p-8 space-y-6 shadow-2xl"
        >
          {/* Priest Selector */}
          <div className="p-4 rounded-xl bg-[#26130D] border border-[#E8C563]/40 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#E8C563]">
              {t.priestLabel}
            </label>
            <select
              value={selectedPriestId}
              onChange={(e) => setSelectedPriestId(e.target.value)}
              className="w-full bg-[#120805] border border-[#E8C563]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E8C563]"
            >
              {PRIEST_DIRECTORY.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.kshetra}
                </option>
              ))}
            </select>

            {selectedPriestId === "partner_1" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <input
                  type="text"
                  required
                  placeholder={t.partnerNamePlaceholder}
                  value={customPriestName}
                  onChange={(e) => setCustomPriestName(e.target.value)}
                  className="bg-[#120805] border border-[#E8C563]/30 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#E8C563]"
                />
                <input
                  type="tel"
                  required
                  placeholder={t.partnerPhonePlaceholder}
                  value={customPriestPhone}
                  onChange={(e) => setCustomPriestPhone(e.target.value)}
                  className="bg-[#120805] border border-[#E8C563]/30 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#E8C563]"
                />
              </div>
            )}
          </div>

          {/* Devotee Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder={t.namePlaceholder}
              value={devotee.name}
              onChange={(e) => setDevotee({ ...devotee, name: e.target.value })}
              className="bg-[#120805] border border-[#E8C563]/25 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E8C563]"
            />
            <input
              type="tel"
              placeholder={t.phonePlaceholder}
              value={devotee.clientWhatsApp}
              onChange={(e) => setDevotee({ ...devotee, clientWhatsApp: e.target.value })}
              className="bg-[#120805] border border-[#E8C563]/25 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E8C563]"
            />
            <div>
              <label htmlFor="devotee-dob" className="block text-xs text-[#C7B3A3] mb-1">Date of Birth</label>
              <input
                id="devotee-dob"
                type="date"
                required
                value={devotee.dob}
                onChange={(e) => setDevotee({ ...devotee, dob: e.target.value })}
                className="w-full bg-[#120805] border border-[#E8C563]/25 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8C563]"
              />
            </div>
            <div>
              <label htmlFor="devotee-tob" className="block text-xs text-[#C7B3A3] mb-1">Time of Birth</label>
              <input
                id="devotee-tob"
                type="time"
                value={devotee.tob}
                onChange={(e) => setDevotee({ ...devotee, tob: e.target.value })}
                className="w-full bg-[#120805] border border-[#E8C563]/25 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E8C563]"
              />
            </div>
            <input
              type="text"
              placeholder={t.pobPlaceholder}
              value={devotee.pob}
              onChange={(e) => setDevotee({ ...devotee, pob: e.target.value })}
              className="md:col-span-2 bg-[#120805] border border-[#E8C563]/25 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E8C563]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-base md:text-lg bg-gradient-to-r from-[#E8C563] to-[#C29228] text-[#120805] hover:brightness-110 active:scale-[0.99] transition cursor-pointer shadow-lg"
          >
            {t.btnCalculate}
          </button>
        </form>

        {/* Results & 1-Click WhatsApp Sender */}
        {findings && (
          <div className="space-y-5 pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#24120C] border border-[#E8C563]/40 rounded-xl p-5 shadow-xl">
              <div>
                <div className="text-xs uppercase text-[#E8C563] font-bold tracking-wider">
                  Officiating Priest: {activePriest.name}
                </div>
                <div className="text-base md:text-lg font-bold text-white mt-0.5">
                  {t.reportHeading}: {devotee.name}
                </div>
                <div className="text-xs text-[#C7B3A3] mt-0.5">
                  {activePriest.kshetra} • +{activePriest.phone || "919972339362"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#341A10] hover:bg-[#452215] text-[#E8C563] border border-[#E8C563]/30 transition cursor-pointer"
                >
                  {copied ? t.copied : t.btnCopy}
                </button>
                <button
                  type="button"
                  onClick={sendToWhatsApp}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  {t.btnWhatsApp}
                </button>
              </div>
            </div>

            {findings.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl p-5 md:p-6 border transition ${
                  item.severity === "HIGH"
                    ? "bg-[#220E0D] border-red-500/50 shadow-red-950/20"
                    : item.severity === "MODERATE"
                    ? "bg-[#21150B] border-amber-500/50 shadow-amber-950/20"
                    : "bg-[#0F1E16] border-emerald-500/40 shadow-emerald-950/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base md:text-lg font-bold text-white">{item.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      item.severity === "HIGH"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : item.severity === "MODERATE"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-[#C7B3A3] mt-1.5 leading-relaxed">
                  <strong className="text-[#E8C563]">{t.shastriyaBasis}</strong> {item.mathematicalCause}
                </p>

                <div className="mt-4 bg-black/30 rounded-xl p-3.5 border border-white/5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#E8C563] mb-2">
                    {t.whatHappeningTitle}
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-xs md:text-sm text-[#F9F1E8]">
                    {item.whatIsHappening.map((symptom, i) => (
                      <li key={i}>{symptom}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="text-xs md:text-sm">
                    <span className="text-[#E8C563] font-semibold">{t.remedyLabel} </span>
                    <span className="text-white font-medium">{item.remedyTitle}</span>
                  </div>
                  {item.sevaFee > 0 && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E8C563]/15 text-[#E8C563] border border-[#E8C563]/30 whitespace-nowrap self-start md:self-auto">
                      {t.sevaFeeLabel} ₹{item.sevaFee}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriestDoshaPrescriptionPage;
