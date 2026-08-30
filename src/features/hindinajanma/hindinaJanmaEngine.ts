import { askGemini } from "../../core/GeminiEngine";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { wallClockBirthToUtc } from "../../core/birthTime";
import type {
  HindinaJanmaInput,
  HindinaJanmaResult,
  PastLifePersona,
  SanchitaKarmaAnalysis,
  InnateBoonsAndTalents,
  PhobiaAndBirthmarkCorrelation,
  RahuKetuMokshaAxis,
  KarmicRemediesAndGokarnaShanti,
  BirthMarkLocation,
  InexplicableAffinity,
  InexplicablePhobia
} from "./hindinaJanmaTypes";

const RASHI_NAMES_EN = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
];

const RASHI_NAMES_KN = [
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ",
  "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ",
  "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
];

const NAKSHATRA_NAMES_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRA_NAMES_KN = [
  "ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತ್ತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರ", "ಆರ್ದ್ರಾ",
  "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಆಶ್ಲೇಷಾ", "ಮಘಾ", "ಪೂರ್ವ ಫಲ್ಗುಣಿ", "ಉತ್ತರ ಫಲ್ಗುಣಿ",
  "ಹಸ್ತ", "ಚಿತ್ರಾ", "ಸ್ವಾತಿ", "ವಿಶಾಖಾ", "ಅನುರಾಧಾ", "ಜ್ಯೇಷ್ಠಾ",
  "ಮೂಲ", "ಪೂರ್ವಾಷಾಢ", "ಉತ್ತರಾಷಾಢ", "ಶ್ರವಣ", "ಧನಿಷ್ಠಾ", "ಶತಭಿಷಾ",
  "ಪೂರ್ವ ಭಾದ್ರಪದ", "ಉತ್ತರ ಭಾದ್ರಪದ", "ರೇವತಿ"
];

export function computePastLifePersona(
  sunSignNum: number,
  nakshatraIndex: number,
  input: HindinaJanmaInput
): PastLifePersona {
  const personas: PastLifePersona[] = [
    // 0: Mesha
    {
      eraAndTimeline: {
        kn: "೧೭ನೇ ಶತಮಾನ — ಮಹಾರಾಷ್ಟ್ರ / ರಾಜಸ್ಥಾನ ಧರ್ಮ ರಕ್ಷಣಾ ಯುಗ (ಶಿವಾಜಿ & ರಜಪೂತ ಕಾಲ)",
        en: "17th Century — Maratha & Rajput Dharma Defense Epoch (Era of Shivaji & Rajput Chieftains)",
        hi: "17वीं शताब्दी — मराठा एवं राजपूत धर्म रक्षा युग",
        te: "17వ శతాబ్దం — ధర్మ రక్షణ పోరాట యుగం",
        ta: "17ம் நூற்றாண்டு — தர்ம ரக்ஷண வீர வரலாறு"
      },
      geographicalRealm: {
        kn: "ಸಹ್ಯಾದ್ರಿ ಗಿರಿ ಕೋಟೆಗಳು & ಪಶ್ಚಿಮ ಭಾರತದ ಕಣಿವೆ ಪ್ರದೇಶ",
        en: "Sahyadri Mountain Fortresses & Rugged Valleys of Western India",
        hi: "सह्याद्रि गिरि दुर्ग एवं पश्चिमी भारत की घाटियाँ",
        te: "సహ్యాద్రి గిరి కోటల ప్రాంతం",
        ta: "சஹ்யாத்ரி மலைக்கோட்டை பிரதேசம்"
      },
      genderInPastLife: { kn: "ಪುರುಷ / ವೀರ ಮಹಿಳೆ (ಸೇನಾಧಿಕಾರಿ)", en: "Male / Valiant Knight (Defense Commander)", hi: "वीर सेनापति", te: "వీర సేనాధిపతి", ta: "தீர படைத்தளபதி" },
      socialStatusAndVocation: {
        kn: "ದೇವಾಲಯ, ಗೋವು ಹಾಗೂ ಸಮಾಜ ರಕ್ಷಕ ಸೇನಾನಿ (Dharma Senani)",
        en: "Protector of Shrines, Lineage & Valiant Knight of Dharma",
        hi: "मंदिर एवं समाज रक्षक शूरवीर सेनानी",
        te: "ఆలయాల సంరక్షకుడు & ధర్మ యోధుడు",
        ta: "கோவில் மற்றும் தர்மத்தை காத்த தீரப் படைத்தளபதி"
      },
      dominantGraha: "Mangala & Ravi (ಮಂಗಳ-ರವಿ)",
      personalitySummary: {
        kn: "ಧರ್ಮ ಮತ್ತು ಅಸಹಾಯಕರ ರಕ್ಷಣೆಗಾಗಿ ಮುಂಚೂಣಿಯಲ್ಲಿ ನಿಂತ ಸಾಹಸಿ ಆತ್ಮ. ನಿಮ್ಮ ನಿಸ್ವಾರ್ಥ ಧೀರತೆಯು ಇಂದಿಗೂ ನಿಮ್ಮಲ್ಲಿ ನಾಯಕತ್ವದ ಗುಣವಾಗಿ ಉಳಿದಿದೆ.",
        en: "A fearless champion who defended holy places and the vulnerable, leaving an enduring legacy of courage and leadership in your soul.",
        hi: "धर्म एवं दुर्बलों की रक्षा हेतु प्राणपण से समर्पित शूरवीर, जिनका अदम्य साहस आज भी आपकी आत्मा में विद्यमान है।",
        te: "ధర్మ రక్షణ కోసం పోరాడిన మహా యోధుడు, ఆ నాయకత్వ గుణం ఇప్పటికీ మీలో ప్రకాశిస్తోంది.",
        ta: "தர்மத்தைக் காக்க வீரத்துடன் போரிட்டவர், அந்த தலைமைப்பண்பு இன்றும் உங்களிடம் மிளிர்கிறது."
      }
    },
    // 1: Vrishabha
    {
      eraAndTimeline: {
        kn: "೧೨ನೇ ಶತಮಾನ — ಚೋಳ ಸಾಮ್ರಾಜ್ಯದ ಸಾಗರ ವ್ಯಾಪಾರ & ಬೃಹದೀಶ್ವರ ಕಾಲಮಾನ",
        en: "12th Century — Chola Maritime Trade & Great Temple Architecture Era",
        hi: "12वीं शताब्दी — चोल कालीन सामुद्रिक व्यापार एवं स्थापत्य युग",
        te: "12వ శతాబ్దం — చోళుల సముద్ర వ్యాపార యుగం",
        ta: "12ம் நூற்றாண்டு — சோழப் பேரரசின் கடல் வாணிபக் காலம்"
      },
      geographicalRealm: {
        kn: "ಕಾವೇರಿ ಮುಖಜ ಭೂಮಿ & ಪ್ರಾಚೀನ ಸಮುದ್ರ ಬಂದರು (ನಾಗಪಟ್ಟಣ)",
        en: "Kaveri Delta & Ancient Maritime Trade Port (Nagapattinam)",
        hi: "कावेरी डेल्टा एवं प्राचीन समुद्री बंदरगाह",
        te: "కావేరి డెల్టా & ప్రాచీన సముద్ర రేవు",
        ta: "காவேரி டெல்டா & நாகப்பட்டினம் கடல் துறைமுகம்"
      },
      genderInPastLife: { kn: "ಪುರುಷ (ಶ್ರೇಷ್ಠ ಸಾರ್ಥವಾಹ)", en: "Male (Naval Merchant/Philanthropist)", hi: "पुरुष (श्रेष्ठ श्रेष्ठी)", te: "పురుషుడు (శ్రేష్ఠ వర్తకుడు)", ta: "ஆண் (பெரு வணிகர்)" },
      socialStatusAndVocation: {
        kn: "ಸಾಗರೋತ್ತರ ಧರ್ಮ ನಿಷ್ಠ ವರ್ತಕ & ಅನ್ನದಾನ ಛತ್ರಗಳ ಸ್ಥಾಪಕ",
        en: "Maritime Merchant & Founder of Public Anna-Dana Annachatras",
        hi: "सामुद्रिक व्यापारी एवं महा अन्नदान सत्रागारों के संस्थापक",
        te: "సముద్ర వర్తకుడు & అన్నదాన సత్రాల నిర్మాత",
        ta: "கடல் வணிகர் & அன்னதான சத்திரங்களை நிறுவியவர்"
      },
      dominantGraha: "Shukra & Budha (ಶುಕ್ರ-ಬುಧ)",
      personalitySummary: {
        kn: "ವ್ಯಾಪಾರದಲ್ಲಿ ನೈತಿಕ ಪ್ರಾಮಾಣಿಕತೆ ಮೆರೆದು, ಗಳಿಸಿದ ಸಂಪತ್ತಿನ ಬಹುಪಾಲನ್ನು ಬಡವರ ಅನ್ನದಾನ ಹಾಗೂ ಯಾತ್ರಿಕರ ಛತ್ರಗಳಿಗೆ ಧಾರೆ ಎರೆದ ಮಹಾದಾನಿಯಾಗಿದ್ದಿರಿ.",
        en: "You operated with immaculate integrity in vast mercantile ventures, dedicating wealth to mass food charity and pilgrim shelters.",
        hi: "व्यापार में परम शुचिता रखते हुए अपनी विपुल संपदा का अधिकांश भाग अन्नदान एवं तीर्थयात्रियों की सेवा में अर्पित किया।",
        te: "వ్యాపారంలో నిజాయితీగా ఉంటూ ఆర్జించిన సంపదను అన్నదానానికి ధారపోసిన మహనీయులు.",
        ta: "நேர்மையான வணிகம் செய்து, ஈட்டிய செல்வத்தை அன்னதானத்திற்கும் அறப்பணிகளுக்கும் வழங்கிய வள்ளல்."
      }
    },
    // 2: Mithuna
    {
      eraAndTimeline: {
        kn: "ಕ್ರಿ.ಪೂ ೪ನೇ ಶತಮಾನ — ತಕ್ಷಶಿಲಾ & ಉಜ್ಜಯಿನಿ ಖಗೋಳ-ಗಣಿತ ಗುರುಕುಲ ಕಾಲ",
        en: "4th Century BCE — Taxila & Ujjain Astronomy-Mathematics Gurukula Era",
        hi: "ईसा पूर्व 4थी शताब्दी — तक्षशिला एवं उज्जयिनी खगोल-गणित गुरुकुल युग",
        te: "క్రీ.పూ 4వ శతాబ్దం — తక్షశిల & ఉజ్జయిని గురుకుల యుగం",
        ta: "கி.மு 4ம் நூற்றாண்டு — தட்சசீலம் & உஜ்ஜைனி குருகுலக் காலம்"
      },
      geographicalRealm: {
        kn: "ಅವಂತಿ (ಉಜ್ಜಯಿನಿ) & ಸಿಂಧೂ ನದೀ ಜಲಾನಯನ ಕಣಿವೆ",
        en: "Avanti (Ujjain) & Indus River Learning Sanctuary",
        hi: "अवंती (उज्जयिनी) एवं सिंधु नदी ज्ञान उपत्यका",
        te: "అవంతి (ఉజ్జయిని) సరస్వతీ విద్యాపీఠం",
        ta: "அவந்தி (உஜ்ஜைனி) & சிந்து நதி ஞான பூமி"
      },
      genderInPastLife: { kn: "ವಿದ್ವಾಂಸ / ಗ್ರಂಥಪಾಲಕ", en: "Scholar / Master Scribe", hi: "आचार्य / ग्रंथपाल", te: "ఆచార్యుడు / గ్రంథకర్త", ta: "ஆசிரியர் / சுவடி ஆய்வாளர்" },
      socialStatusAndVocation: {
        kn: "ಖಗೋಳ ಶಾಸ್ತ್ರಜ್ಞ, ರಾಜತಾಂತ್ರಿಕ ರಾಯಭಾರಿ & ಸಂಸ್ಕೃತ ಸೂತ್ರಕಾರ",
        en: "Astronomer, Diplomatic Envoy & Sanskrit Scribe",
        hi: "खगोलविद, राजनायिक दूत एवं संस्कृत सूत्रकार",
        te: "ఖగోళ శాస్త్రవేత్త & సంస్కృత సూత్రకారుడు",
        ta: "வானியல் அறிஞர் & சமஸ்கிருத சுலோக ஆசான்"
      },
      dominantGraha: "Budha (ಬುಧ - ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ)",
      personalitySummary: {
        kn: "ಅಪಾರ ಜ್ಞಾನ ಸಂಗ್ರಹ, ಗ್ರಂಥಾಲಯ ಸಂರಕ್ಷಣೆ ಮತ್ತು ರಾಜತಾಂತ್ರಿಕ ಶಾಂತಿ ಸ್ಥಾಪನೆಯಲ್ಲಿ ನಿಮ್ಮ ಬುದ್ಧಿಮತ್ತೆ ಪ್ರಮುಖ ಪಾತ್ರ ವಹಿಸಿತ್ತು.",
        en: "You were an esteemed polymath and peace envoy whose intellectual codices preserved sacred mathematics and astronomical wisdom.",
        hi: "अगाध ज्ञान, पांडुलिपि संरक्षण एवं शांति स्थापना में आपकी मेधा ने ऐतिहासिक भूमिका निभाई।",
        te: "అపార విద్యా సంపన్నతతో గ్రంథాలను పరిరక్షించిన మహా పండితుడు.",
        ta: "பேரறிவாலும் சுவடிப் பாதுகாப்பாலும் உலகிற்கு வழிகாட்டிய ஞானி."
      }
    },
    // 3: Karka
    {
      eraAndTimeline: {
        kn: "ಕ್ರಿ.ಪೂ ೧೦೦೦ — ವೈದಿಕ ಸರಸ್ವತೀ ನದೀ ತೀರದ ಋಷಿಕುಲ ತಪೋಭೂಮಿ",
        en: "1000 BCE — Vedic Saraswati Riverbank Hermitage & Healing Hermit Era",
        hi: "ईसा पूर्व 1000 — वैदिक सरस्वती नदी तट ऋषिकुल युग",
        te: "క్రీ.పూ 1000 — సరస్వతీ నదీ తీర ఋషికుల కాలం",
        ta: "கி.மு 1000 — சரஸ்வதி நதிக்கரை முனிவர் தவக்காலம்"
      },
      geographicalRealm: {
        kn: "ಪವಿತ್ರ ಸರಸ್ವತೀ & ನರ್ಮದಾ ಸಂಗಮ ತಪೋವನ",
        en: "Sacred Saraswati-Narmada Confluence Sanctuary",
        hi: "पावन सरस्वती एवं नर्मदा संगम तपोवन",
        te: "సరస్వతీ-నర్మదా సంగమ పుణ్యభూమి",
        ta: "சரஸ்வதி-நர்மதா நதி சங்கம தவ வனம்"
      },
      genderInPastLife: { kn: "ಋಷಿ ಪತ್ನಿ / ಯೋಗಿನಿ / ಆಯುರ್ವೇದ ವೈದ್ಯ", en: "Yogini / Ayurvedic Master Healer", hi: "योगिनी / आयुर्वेद वैद्य", te: "యోగిని / ఆయుర్వేద వైద్యురాలు", ta: "யோகினி / சித்த மருத்துவர்" },
      socialStatusAndVocation: {
        kn: "ಆಯುರ್ವೇದ ರಸವೈದ್ಯ & ಅನಾಥ ಶಿಶುಗಳ ಪೋಷಕ ಮಾತೃಸ್ವರೂಪಿ",
        en: "Herbal Alchemist & Nurturing Sanctuary Guardian",
        hi: "आयुर्वेद रसवैद्य एवं अनाथ बालकों की पालक मातृमूर्त",
        te: "ఆయుర్వేద రసవైద్యుడు & శరణార్థుల సంరక్షకుడు",
        ta: "மூலிகை மருத்துவர் & ஆதரவற்றோரை காத்த அன்னை"
      },
      dominantGraha: "Chandra & Guru (ಚಂದ್ರ-ಗುರು)",
      personalitySummary: {
        kn: "ಮಾತೃವಾತ್ಸಲ್ಯದಿಂದ ಸರ್ವರ ನೋವನ್ನು ನಿವಾರಿಸುತ್ತಾ, ಪ್ರಕೃತಿಯ ಮೂಲಿಕೆಗಳಿಂದ ನೂರಾರು ಜೀವಗಳಿಗೆ ಪುನರ್ಜನ್ಮ ನೀಡಿದ ಪವಿತ್ರ ಆತ್ಮ.",
        en: "Radiating maternal compassion, you healed incurable afflictions with sacred plant essences and sheltered seekers in forest hermitages.",
        hi: "मातृवत वात्सल्य से सभी के कष्टों का निवारण करते हुए दिव्य जड़ी-बूटियों से नवजीवन प्रदान करने वाली पुण्यात्मा।",
        te: "సకల జీవుల పట్ల అపార దయతో మూలికా వైద్యం చేసిన పవిత్ర ఆత్మ.",
        ta: "அன்பால் அனைவரின் நோயையும் தீர்த்த சித்த மருத்துவ புண்ணியவான்."
      }
    },
    // 4: Simha
    {
      eraAndTimeline: {
        kn: "೧೫ನೇ ಶತಮಾನ — ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ಸ್ವರ್ಣ ಯುಗ (ಹಂಪಿ/ದಕ್ಷಿಣ ಭಾರತ)",
        en: "15th Century — Golden Era of Vijayanagara Empire (Hampi, South India)",
        hi: "15वीं शताब्दी — विजयनगर साम्राज्य का स्वर्ण युग",
        te: "15వ శతాబ్దం — విజయనగర సామ్రాజ్య స్వర్ణ యుగం",
        ta: "15ம் நூற்றாண்டு — விஜயநகர பேரரசின் பொற்காலம்"
      },
      geographicalRealm: {
        kn: "ತುಂಗಭದ್ರಾ ನದಿ ತೀರ & ವಿರೂಪಾಕ್ಷ ಸನ್ನಿಧಿ ರಾಜಧಾನಿ",
        en: "Tungabhadra Basin & Virupaksha Capital Sanctuary (Hampi)",
        hi: "तुंगभद्रा नदी तट एवं विरुपाक्ष राजधानी",
        te: "తుంగభద్ర నదీ తీరం & విరూపాక్ష క్షేత్రం",
        ta: "துங்கபத்ரா நதிக்கரை & விருபாக்ஷ சந்நிதி"
      },
      genderInPastLife: { kn: "ಪುರುಷ (ಮಂತ್ರಿ / ದಂಡನಾಯಕ)", en: "Male (Royal Minister / Chief Governor)", hi: "प्रधान मंत्री / महादंडनायक", te: "మంత్రి / దండనాయకుడు", ta: "அரசு தலைமை அமைச்சர்" },
      socialStatusAndVocation: {
        kn: "ಧರ್ಮಶಾಸ್ತ್ರಜ್ಞ, ದೇವಾಲಯ ಶಿಲ್ಪ ಸಂಯೋಜಕ & ರಾಜಗುರು ಸಲಹೆಗಾರ",
        en: "Royal Dharma Counselor & Sacred Temple Architecture Patron",
        hi: "धर्मशास्त्री एवं विशाल देवालय स्थापत्य संरक्षक",
        te: "ధర్మశాస్త్రవేత్త & ఆలయ శిల్పకళా పోషకుడు",
        ta: "தர்மசாஸ்திர அறிஞர் & கோவில் சிற்பகலா புரவலர்"
      },
      dominantGraha: "Ravi & Guru (ರವಿ-ಗುರು)",
      personalitySummary: {
        kn: "ರಾಜಾಶ್ರಯದಲ್ಲಿ ಸತ್ಯ, ನ್ಯಾಯ ಮತ್ತು ಧರ್ಮದ ಸಂರಕ್ಷಣೆಗೆ ಗಂಭೀರ ಕೊಡುಗೆ ನೀಡಿದ ಗೌರವಾನ್ವಿತ ನಾಯಕ.",
        en: "An illustrious counselor whose unyielding commitment to truth and righteousness anchored royal governance and built timeless temple sanctuaries.",
        hi: "राजदरबार में सत्य, न्याय एवं धर्म की प्रतिष्ठा करने वाले परम तेजस्वी एवं सम्मानीय महापुरुष।",
        te: "రాజసభలో సత్యం, ధర్మం నిలబెట్టిన గొప్ప దార్శనికుడు.",
        ta: "அரச சபையில் தர்மத்தை நிலைநிறுத்தி கோவில்களை எழுப்பிய உத்தமர்."
      }
    },
    // 5: Kanya
    {
      eraAndTimeline: {
        kn: "೬ನೇ ಶತಮಾನ — ಮಗಧ / ಪಾಟಲೀಪುತ್ರ ಶಾಸ್ತ್ರೀಯ ಶೋಧನೆ ಕಾಲ",
        en: "6th Century — Classical Magadha / Pataliputra Research & Lexicon Era",
        hi: "6वीं शताब्दी — मगध / पाटलिपुत्र शास्त्रीय शोध युग",
        te: "6వ శతాబ్దం — మగధ / పాటలీపుత్ర పరిశోధన యుగం",
        ta: "6ம் நூற்றாண்டு — மகத / பாடலிபுத்திர ஆராய்ச்சி காலம்"
      },
      geographicalRealm: {
        kn: "ಗಂಗಾ-ಸೋಣ ನದೀ ಸಂಗಮ ಪಾಟಲೀಪುತ್ರ ನಗರಿ",
        en: "Ganga-Sone Confluence, Imperial Pataliputra",
        hi: "गंगा-सोन संगम, पाटलिपुत्र नगरी",
        te: "గంగా-శోణ సంగమ పాటలీపుత్ర పుణ్యక్షేత్రం",
        ta: "கங்கை நதிக்கரை பாடலிபுத்திர மாநகரம்"
      },
      genderInPastLife: { kn: "ಮುಖ್ಯ ಲೇಖಕ / ಕೋಶಾಧಿಕಾರಿ", en: "Chief Scribe / Imperial Treasurer", hi: "महालेखाकार / कोषाध्यक्ष", te: "ముఖ్య లేఖకుడు / కోశాధికారి", ta: "தலைமை கணக்காயர் / பொக்கிஷ அதிகாரி" },
      socialStatusAndVocation: {
        kn: "ರಾಜಕೋಶದ ದೋಷರಹಿತ ಲೆಕ್ಕಪತ್ರ ಪಾಲಕ & ಧರ್ಮದಾನ ದಾಖಲೆ ಸಂರಕ್ಷಕ",
        en: "State Treasurer, Granary Custodian & Legal Documentation Master",
        hi: "राजकोष एवं धान्य-भंडार संरक्षक, दान अभिलेखकार",
        te: "రాజకోశ సంరక్షకుడు & ధర్మదాన పత్రాల సంకలనకర్త",
        ta: "பொக்கிஷ காப்பாளர் & அறக்கொடை ஆவண ஆய்வாளர்"
      },
      dominantGraha: "Budha (ಬುಧ - ಪರಿಪೂರ್ಣತೆ)",
      personalitySummary: {
        kn: "ಸಣ್ಣ ತಪ್ಪನ್ನೂ ಸಹಿಸದ ಅತ್ಯುನ್ನತ ಪ್ರಾಮಾಣಿಕತೆ, ಲೆಕ್ಕಪತ್ರ ಶುದ್ಧತೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಸಂಪನ್ಮೂಲಗಳ ನ್ಯಾಯಯುತ ರಕ್ಷಣೆ ಮಾಡಿದ ಪುಣ್ಯಾತ್ಮ.",
        en: "Celebrated for impeccable precision and uncompromising honesty, safeguarding public treasuries and ensuring famine relief reached all citizens.",
        hi: "परम शुचिता, निष्कलंक सत्यनिष्ठा एवं जनकल्याण हेतु सार्वजनिक संपदा के निस्वार्थ संरक्षक।",
        te: "నిష్కళంక నిజాయితీతో ప్రజాధనాన్ని కాపాడిన ధర్మాత్ముడు.",
        ta: "தூய்மையான நேர்மையோடு பொதுச் செல்வத்தை காத்த புண்ணியவான்."
      }
    },
    // 6: Tula
    {
      eraAndTimeline: {
        kn: "೧೦ನೇ ಶತಮಾನ — ಗೂರ್ಜರ-ಪ್ರತಿಹಾರ & ಸೋಮನಾಥ ಕಲಾ ವೈಭವ ಯುಗ",
        en: "10th Century — Gurjara-Pratihara & Somnath Classical Arts Epoch",
        hi: "10वीं शताब्दी — गुर्जर-प्रतिहार एवं सोमनाथ कला वैभव युग",
        te: "10వ శతాబ్దం — సోమనాథ కళా వైభవ కాలం",
        ta: "10ம் நூற்றாண்டு — சோமநாதர் கலைப் பொற்காலம்"
      },
      geographicalRealm: {
        kn: "ಸೌರಾಷ್ಟ್ರ ಕರಾವಳಿ & ಪ್ರಾಚೀನ ರೇಷ್ಮೆ ವ್ಯಾಪಾರ ಮಾರ್ಗ",
        en: "Saurashtra Coast & Ancient Maritime Silk Route",
        hi: "सौराष्ट्र समुद्र तट एवं प्राचीन रेशम व्यापार मार्ग",
        te: "సౌరాష్ట్ర తీరం & ప్రాచీన పట్టు వర్తక మార్గం",
        ta: "சௌராஷ்டிர கடற்கரை & பட்டு வாணிபப் பாதை"
      },
      genderInPastLife: { kn: "ಕಲಾ ನಿರ್ದೇಶಕ / ರಾಜದೂತ", en: "Arts Arbiter / Diplomatic Ambassador", hi: "कला संरक्षक / राजनायिक", te: "కళా సంరక్షకుడు / రాయబారి", ta: "கலை புரவலர் / ராஜதந்திரி" },
      socialStatusAndVocation: {
        kn: "ದೇವಾಲಯ ಶಿಲ್ಪಶಾಸ್ತ್ರಜ್ಞ & ಸಂಗೀತ-ನೃತ್ಯ ಸಭಾಪತಿ",
        en: "Temple Sculptural Iconographer & Classical Music Patron",
        hi: "देवालय शिल्पशास्त्री एवं संगीत-नृत्य सभापति",
        te: "ఆలయ శిల్పకారుడు & సంగీత సభా నిర్వాహకుడు",
        ta: "கோவில் சிற்பக்கலை ஆசான் & சங்கீத புரவலர்"
      },
      dominantGraha: "Shukra (ಶುಕ್ರ - ಸೌಂದರ್ಯ & ಸಾಮರಸ್ಯ)",
      personalitySummary: {
        kn: "ಸೌಂದರ್ಯ, ಸಂಗೀತ ಮತ್ತು ವಾಸ್ತುಶಿಲ್ಪದಲ್ಲಿ ದೈವಿಕತೆಯನ್ನು ಕಂಡು, ವಿವಾದಗಳನ್ನು ಶಾಂತಿಯುತ ಮಾತುಕತೆಯಿಂದ ಬಗೆಹರಿಸಿದ ರಾಯಭಾರಿ.",
        en: "You harmonized deep aesthetic devotion with diplomacy, creating sacred temple masterworks and negotiating peaceful alliances across kingdoms.",
        hi: "सौंदर्य, संगीत एवं वास्तु में दिव्यता का दर्शन करते हुए समस्त विवादों का शांतिपूर्ण समाधान करने वाले महनीय पुरुष।",
        te: "కళలలో దైవత్వాన్ని దర్శిస్తూ సామరస్యాన్ని పెంచిన రాయబారి.",
        ta: "கலைகளில் இறைவனைக் கண்டு, அமைதிப் புறாவாக வாழ்ந்த உன்னதர்."
      }
    },
    // 7: Vrischika
    {
      eraAndTimeline: {
        kn: "೮ನೇ ಶತಮಾನ — ಹಿಮಾಲಯದ ಕೇದಾರ-ಬದರೀ ತಪೋಭೂಮಿ ಕಾಲ (ಆದಿ ಶಂಕರರ ಯುಗ)",
        en: "8th Century — Himalayan Kedarnath-Badrinath Hermitage Era (Epoch of Adi Shankara)",
        hi: "8वीं शताब्दी — हिमालयी केदार-बद्री तपोभूमि युग (आदि शंकर काल)",
        te: "8వ శతాబ్దం — హిమాలయ కేదార-బదరీ తపోభూమి కాలం",
        ta: "8ம் நூற்றாண்டு — இமயமலை கேதார்-பத்ரி ஆதிசங்கரர் காலம்"
      },
      geographicalRealm: {
        kn: "ಗಂಗೋತ್ರಿ-ರುದ್ರಪ್ರಯಾಗ ಗಿರಿ ಕಂದರಗಳು & ಬದರಿಕಾಶ್ರಮ",
        en: "Gangotri-Rudraprayag Valley, Sacred Upper Himalayas",
        hi: "गंगोत्री-रुद्रप्रयाग पर्वत घाटी, पावन उच्च हिमालय",
        te: "గంగోత్రి-రుద్రప్రయాగ గిరి శ్రేణులు",
        ta: "கங்கோத்ரி-ருத்ரபிரயாக் இமயமலை பள்ளத்தாக்கு"
      },
      genderInPastLife: { kn: "ಯೋಗಿ / ತಪಸ್ವಿ / ಸಿದ್ಧ ಪುರುಷ", en: "Yogi / Tantric Adept / Ascetic", hi: "योगी / संन्यासी / सिद्ध पुरुष", te: "యోగి / తపస్వి", ta: "யோகி / தவமுனிவர் / சித்தர்" },
      socialStatusAndVocation: {
        kn: "ಶಿವ ತಪಸ್ವಿ, ಆಯುರ್ವೇದ ರಹಸ್ಯ ಮೂಲಿಕಾ ಸಂಶೋಧಕ & ಪ್ರಾಣಾಯಾಮ ಸಿದ್ಧ",
        en: "Shiva Sadhaka, Himalayan Herb Mystic & Kundalini Master",
        hi: "शिव साधक, दिव्य जड़ी-बूटी वैद्य एवं प्राणायाम सिद्ध",
        te: "శివ సాధకుడు, ఆయుర్వేద మూలికా వైద్యుడు",
        ta: "சிவ யோகி, மூலிகை சித்தர் & மந்திர சாதகர்"
      },
      dominantGraha: "Ketu & Mangala (ಕೇತು-ಮಂಗಳ)",
      personalitySummary: {
        kn: "ಪ್ರಕೃತಿಯ ಏಕಾಂತದಲ್ಲಿ ತಪಸ್ಸು ಮಾಡುತ್ತಾ, ದಾರಿತಪ್ಪಿದ ಯಾತ್ರಿಕರಿಗೆ ಮತ್ತು ರೋಗಿಗಳಿಗೆ ಸಂಜೀವಿನಿ ಮೂಲಿಕೆಗಳಿಂದ ಜೀವದಾನ ಮಾಡಿದ ಪುಣ್ಯಜೀವಿ.",
        en: "Living in meditative solitude high in the Himalayas, you unlocked esoteric healing remedies and guided earnest souls toward liberation.",
        hi: "एकांत साधना में रत रहकर असहाय यात्रियों एवं रोगियों को दिव्य संजीवनी औषधियों से नवजीवन प्रदान करने वाले पुण्यात्मा।",
        te: "ఏకాంతంలో తపస్సు చేస్తూ దైవిక మూలికలతో ఎందరో రోగులను కాపాడిన పుణ్యాత్ముడు.",
        ta: "ஏகாந்த தவத்தில் இருந்து, யாத்ரீகர்களுக்கு மூலிகைகளால் உயிர்ப்பிச்சை அளித்த புண்ணிய ஆன்மா."
      }
    },
    // 8: Dhanu
    {
      eraAndTimeline: {
        kn: "ಕ್ರಿ.ಪೂ ೫೦೦ — ಮಿಥಿಲಾ ಜನಕ ರಾಜಸಭೆ & ಉಪನಿಷತ್ ಚಿಂತನಾ ಕಾಲ",
        en: "500 BCE — Mithila Janaka Philosophical Court & Upanishadic Discourse Era",
        hi: "ईसा पूर्व 500 — मिथिला जनक राजसभा एवं उपनिषद युग",
        te: "క్రీ.పూ 500 — మిథిలా జనక రాజసభ కాలం",
        ta: "கி.மு 500 — மிதிலை ஜனக மன்னர் தத்துவ சபை காலம்"
      },
      geographicalRealm: {
        kn: "ಮಿಥಿಲಾ & ಗಂಡಕೀ ನದೀ ತೀರದ ಬ್ರಹ್ಮವಿದ್ಯಾ ಆಶ್ರಮ",
        en: "Mithila Basin & Gandaki River Spiritual Sanctuary",
        hi: "मिथिला उपत्यका एवं गंडकी नदी ब्रह्मविद्या आश्रम",
        te: "మిథిల & గండకీ నదీ తీర బ్రహ్మవిద్యా కేంద్రం",
        ta: "மிதிலை & கண்டகி நதிக்கரை ஞான தபோவனம்"
      },
      genderInPastLife: { kn: "ಬ್ರಹ್ಮರ್ಷಿ / ಕುಲಪತಿ", en: "Vedic Sage / Chancellorship Patriarch", hi: "ब्रह्मर्षि / कुलपति", te: "బ్రహ్మర్షి / గురుకులపతి", ta: "பிரம்மரிஷி / குருகுல தலைவர்" },
      socialStatusAndVocation: {
        kn: "ವೇದಾಂತ ಪ್ರಾಧ್ಯಾಪಕ, ರಾಜಕೀಯ ಧರ್ಮೋಪದೇಶಕ & ಯಜ್ಞ ಆಚಾರ್ಯ",
        en: "Professor of Vedanta, Royal Counselor & Principal Yajna Priest",
        hi: "वेदांत आचार्य, राजनैतिक धर्मोपदेशक एवं याज्ञिक",
        te: "వేదాంత ఆచార్యుడు & యాజ్ఞిక శ్రేష్ఠుడు",
        ta: "வேதாந்த ஆசான் & வேள்வி தலைமை குரு"
      },
      dominantGraha: "Guru (ಬೃಹಸ್ಪತಿ - ಬ್ರಹ್ಮಜ್ಞಾನ)",
      personalitySummary: {
        kn: "ಆಧ್ಯಾತ್ಮಿಕ ತತ್ವಜ್ಞಾನದ ಉತ್ತುಂಗದಲ್ಲಿದ್ದು, ಶಿಷ್ಯ ಪರಂಪರೆಗೆ ವೇದ ಸಾರವನ್ನು ನಿಷ್ಪಕ್ಷಪಾತವಾಗಿ ಬೋಧಿಸಿದ ಜ್ಞಾನ ಸೂರ್ಯ.",
        en: "An exalted master of the Upanishads whose discourses illuminated royalty and students alike, anchoring Vedic ethics across northern realms.",
        hi: "आध्यात्मिक तत्वज्ञान के सर्वोच्च शिखर पर आरूढ़ होकर निष्पक्ष ज्ञानदान करने वाले परम पूज्य गुरुदेव।",
        te: "ఉపనిషత్ సారాన్ని లోకానికి అందించిన మహా జ్ఞానజ్యోతి.",
        ta: "உபநிடத ஞானத்தை உலகிற்கு போதித்த உன்னத குருதேவர்."
      }
    },
    // 9: Makara
    {
      eraAndTimeline: {
        kn: "೧೪ನೇ ಶತಮಾನ — ಕಾಕತೀಯ & ವಾರಂಗಲ್ ಕೋಟೆ-ಕೆರೆ ನಿರ್ಮಾಣ ಕಾಲ",
        en: "14th Century — Kakatiya & Warangal Massive Reservoir-Fortress Era",
        hi: "14वीं शताब्दी — काकतीय एवं वारंगल दुर्ग-सरोवर निर्माण काल",
        te: "14వ శతాబ్దం — కాకతీయ & వరంగల్ చెరువుల నిర్మాణ యుగం",
        ta: "14ம் நூற்றாண்டு — காகதீய ஏரிகள் & கோட்டை வரலாற்று காலம்"
      },
      geographicalRealm: {
        kn: "ತೆಲಂಗಾಣ-ಕರ್ನಾಟಕ ಗಡಿಭಾಗ & ಕೃಷ್ಣಾ ನದೀ ಕಣಿವೆ",
        en: "Krishna River Valley & Deccan Plateau Bastions",
        hi: "कृष्णा नदी घाटी एवं दक्खन पठार",
        te: "కృష్ణా నదీ లోయ & చారిత్రక తెలంగాణ దుర్గాలు",
        ta: "கிருஷ்ணா நதி சமவெளி & தக்காண பீடபூமி"
      },
      genderInPastLife: { kn: "ಮುಖ್ಯ ವಾಸ್ತುಶಿಲ್ಪಿ / ಎಂಜಿನಿಯರ್", en: "Chief Master Architect / Civil Hydro-Engineer", hi: "महाशिल्पी / जल-व्यवस्थापक", te: "ప్రధాన శిల్పి / జలవనరుల నిపుణుడు", ta: "தலைமை ஸ்தபதி / நீர்மேலாண்மை நிபுணர்" },
      socialStatusAndVocation: {
        kn: "ಬೃಹತ್ ಕೆರೆ-ಕಟ್ಟೆಗಳ ನಿರ್ಮಾತೃ, ಕೋಟೆ ವಿನ್ಯಾಸಕ & ಶ್ರಮಜೀವಿಗಳ ರಕ್ಷಕ",
        en: "Architect of Imperial Reservoirs, Hill-Forts & Laborer Welfare Warden",
        hi: "विशाल सरोवर-दुर्ग निर्माता एवं श्रमजीवियों के संरक्षक",
        te: "మహా చెరువులు, కోటల రూపశిల్పి & కార్మికుల సంరక్షకుడు",
        ta: "ஏரி-குளங்கள், கோட்டைகளை உருவாக்கிய தலைமை ஸ்தபதி"
      },
      dominantGraha: "Shani (ಶನಿ - ಶ್ರಮ & ಸ್ಥಿರತೆ)",
      personalitySummary: {
        kn: "ಮಾತಿನ ಬದಲು ಕ್ರಿಯೆಯಲ್ಲಿ ನಂಬಿಕೆ ಇಟ್ಟು, ಶತಮಾನಗಳ ಕಾಲ ಜನರಿಗೆ ಕುಡಿಯುವ ನೀರು ಮತ್ತು ರಕ್ಷಣೆ ನೀಡಿದ ಅಮರ ನಿರ್ಮಾಣಗಳನ್ನು ಕಟ್ಟಿದ ಮಹಾಶಿಲ್ಪಿ.",
        en: "Believing in relentless craftsmanship over empty words, you engineered colossal water reservoirs and stone bastions that sustained millions.",
        hi: "कथनी से अधिक करनी में विश्वास रखते हुए शताब्दियों तक जन-कल्याण करने वाले जल-दुर्गों के निष्काम निर्माता।",
        te: "నిరంతర శ్రమతో ప్రజలకు తాగునీరు అందించే చెరువులను నిర్మించిన మహానుభావుడు.",
        ta: "சொல்லை விட செயலே பெரிதென எண்ணி ஏரிகளையும் கோட்டைகளையும் அமைத்த சிற்பி."
      }
    },
    // 10: Kumbha
    {
      eraAndTimeline: {
        kn: "೧೬ನೇ ಶತಮಾನ — ವಾರಣಾಸಿ (ಕಾಶೀ) ಸಂತ ಪರಂಪರೆ & ಅದ್ವೈತ ಸಭಾ ಯುಗ",
        en: "16th Century — Varanasi (Kashi) Saint Conclave & Social Reform Epoch",
        hi: "16वीं शताब्दी — काशी संत परंपरा एवं सामाजिक समरसता युग",
        te: "16వ శతాబ్దం — కాశీ క్షేత్ర సంతుల యుగం",
        ta: "16ம் நூற்றாண்டு — காசி நகர் சாதுக்கள் சங்கம்"
      },
      geographicalRealm: {
        kn: "ಕಾಶೀ ಮಣಿಕರ್ಣಿಕಾ-ದಶಾಶ್ವಮೇಧ ಘಾಟ್ & ಗಂಗಾ ತೀರ",
        en: "Kashi Manikarnika-Dashashwamedha Ghats & Holy Ganga Realm",
        hi: "काशी मणिकर्णिका-दशाश्वमेध घाट एवं गंगा तट",
        te: "కాశీ క్షేత్రం & పవిత్ర గంగా తీరం",
        ta: "காசி மணிகர்ணிகா படித்துறை & கங்கை நதிக்கரை"
      },
      genderInPastLife: { kn: "ದಾರ್ಶನಿಕ / ಸಮಾಜ ಸುಧಾರಕ", en: "Visionary Philosopher / Social Reformer", hi: "दार्शनिक / समाज सुधारक", te: "సామాజిక సంస్కర్త / తత్వవేత్త", ta: "சமூக சீர்திருத்தவாதி / ஞானி" },
      socialStatusAndVocation: {
        kn: "ಜಾತಿ-ಭೇದವಿಲ್ಲದೆ ವೇದ ಸಾರವನ್ನು ಎಲ್ಲರಿಗೂ ಬೋಧಿಸಿದ ಕ್ರಾಂತಿಕಾರಿ ಮುಕ್ತ ಸಂತ",
        en: "Egalitarian Mystic, Bhakti Saint & Sanskrit-Vernacular Bridge",
        hi: "सर्वसमावेशी संत, भक्ति मर्मज्ञ एवं लोककल्याणकारी",
        te: "అందరికీ సమాన ధర్మబోధ చేసిన సమతావాది సంతుడు",
        ta: "அனைவருக்கும் ஆன்மீக ஞானம் வழங்கிய புரட்சித் துறவி"
      },
      dominantGraha: "Shani & Rahu (ಶನಿ-ರಾಹು - ಮುನ್ನಡೆ)",
      personalitySummary: {
        kn: "ಮೂಢನಂಬಿಕೆಗಳನ್ನು ವಿರೋಧಿಸಿ, ಮಾನವೀಯ ಪ್ರೇಮ ಮತ್ತು ಈಶ್ವರ ಭಕ್ತಿಯೇ ಶ್ರೇಷ್ಠವೆಂದು ಜನಸಾಮಾನ್ಯರಿಗೆ ತಿಳಿಹೇಳಿದ ಜ್ಞಾನಿ.",
        en: "A visionary sage who dismantled dogmatism and spread pure unconditioned love and universal Advaitic oneness.",
        hi: "रूढ़ियों का खंडन कर विशुद्ध भगवद-भक्ति एवं मानवता का शंखनाद करने वाले युगदृष्टा संत।",
        te: "మూఢనమ్మకాలను పారద్రోలి మానవతావాదాన్ని చాటిన మహా సంతుడు.",
        ta: "மூடநம்பிக்கைகளை அகற்றி அன்பே சிவம் என வாழ்ந்த ஞானி."
      }
    },
    // 11: Meena
    {
      eraAndTimeline: {
        kn: "ಕ್ರಿ.ಪೂ ೨೦೦ — ದ್ವಾರಕಾ & ಗೋಕರ್ಣ ಸಾಗರ ಕರಾವಳಿ ತಪಸ್ವಿ ಯುಗ",
        en: "200 BCE — Sacred Dwaraka & Gokarna Coastal Hermitage Epoch",
        hi: "ईसा पूर्व 200 — द्वारका एवं गोकर्ण समुद्र तपोभूमि काल",
        te: "క్రీ.పూ 200 — ద్వారక & గోకర్ణ తీర తపోభూమి కాలం",
        ta: "கி.மு 200 — துவாரகை & கோகர்ண கடற்கரை தபோவனம்"
      },
      geographicalRealm: {
        kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ & ಅರಬ್ಬೀ ಸಮುದ್ರ ತೀರ",
        en: "Gokarna Atmalinga Kshetra & Arabian Ocean Cliffs",
        hi: "गोकर्ण महाबलेश्वर सान्निध्य एवं पश्चिम समुद्र तट",
        te: "గోకర్ణ మహాబలేశ్వర క్షేత్రం & సముద్ర తీరం",
        ta: "கோகர்ண மகாபலேஸ்வரர் சந்நிதி & கடற்கரை தபோவனம்"
      },
      genderInPastLife: { kn: "ಆತ್ಮಲಿಂಗ ಅರ್ಚಕ / ಸಾಗರ ಸಾಧಕ", en: "Atmalinga Priest / Ocean Mystic", hi: "आत्मलिंग अर्चक / समुद्र साधक", te: "ఆత్మలింగ పూజారి / సముద్ర సాధకుడు", ta: "ஆத்மலிங்க அர்ச்சகர் / யோகி" },
      socialStatusAndVocation: {
        kn: "ಶಿವಾರ್ಚಕ, ಪ್ರಕೃತಿ ಕಾವ್ಯ ರಚಯಿತ & ಸಮುದ್ರ ಯಾನಿಗಳ ಸಂರಕ್ಷಕ",
        en: "Atmalinga Head Priest, Devotional Poet & Seafarers' Guardian",
        hi: "शिवाभिषेक कर्ता, भक्ति-कवि एवं नाविकों के आध्यात्मिक रक्षक",
        te: "శివార్చకుడు, భక్తి కవి & నావికుల మార్గదర్శి",
        ta: "சிவாச்சாரியார், பக்தி கவிஞர் & மாலுமிகளின் ஆன்மீக வழிகாட்டி"
      },
      dominantGraha: "Guru & Ketu (ಗುರು-ಕೇತು - ಮೋಕ್ಷ)",
      personalitySummary: {
        kn: "ಸದಾ ಈಶ್ವರ ಧ್ಯಾನದಲ್ಲಿ ಮುಳುಗಿದ್ದು, ಸಮುದ್ರದ ಸದ್ದು ಹಾಗೂ ಮಂತ್ರ ಘೋಷಗಳಲ್ಲಿ ಪರಬ್ರಹ್ಮನನ್ನು ಕಂಡ ಪರಮ ಭಕ್ತ.",
        en: "Immersed in deep contemplation of Lord Shiva at Gokarna, your sacred hymns calmed turbulent waters and blessed seekers with eternal peace.",
        hi: "निरंतर शिव-आराधना में लीन रहकर सागर के कलरव में ओंकार नाद का साक्षात्कार करने वाले परम सिद्ध भक्त।",
        te: "సదా ఈశ్వర ధ్యానంలో మునిగి భక్తి గీతాలు రచించిన పుణ్యమూర్తి.",
        ta: "எப்போதும் சிவ தியானத்தில் திளைத்து, அலைகளில் ஓங்காரத்தை உணர்ந்த பரம பக்தர்."
      }
    }
  ];

  const index = (sunSignNum + nakshatraIndex) % personas.length;
  return personas[index] || personas[0]!;
}

export function computeSanchitaKarmaAnalysis(
  sunSignNum: number,
  nakshatraIndex: number,
  input: HindinaJanmaInput
): SanchitaKarmaAnalysis {
  // Deterministic calculation of Punya / Paapa
  const punyaSeed = 68 + ((sunSignNum * 7 + nakshatraIndex * 5 + (input.dob.length * 3)) % 25);
  const punya = Math.min(94, Math.max(65, punyaSeed));
  const paapa = 100 - punya;

  const debts = [
    { kn: "ದೇವ ಋಣ (ದೇವಸ್ಥಾನ ಸೇವೆ & ಸಂಕಲ್ಪ ಪೂರ್ಣಗೊಳಿಸುವಿಕೆ)", en: "Deva Rina (Fulfilling ancient temple vows & sacred deity service)", hi: "देव ऋण (अपूर्ण मंदिर सेवा एवं संकल्प पूर्ति)", te: "దేవ ఋణం (ఆలయ సేవ & మొక్కుల తీర్పు)", ta: "தேவ கடன் (கோவில் திருப்பணி & பிரார்த்தனை நிறைவேற்றுதல்)" },
    { kn: "ಋಷಿ ಋಣ (ವೇದ-ಶಾಸ್ತ್ರ ಜ್ಞಾನವನ್ನು ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಧಾರೆ ಎರೆವುದು)", en: "Rishi Rina (Disseminating sacred wisdom & mentoring the next generation)", hi: "ऋषि ऋण (ज्ञान प्रसार एवं शिष्यों का मार्गदर्शन)", te: "ఋషి ఋణం (జ్ఞాన ప్రసారం & విద్యాదానం)", ta: "ரிஷி கடன் (ஞான போதனை & குருகுல சேவை)" },
    { kn: "ಪಿತೃ ಋಣ (ವಂಶೋದ್ಧಾರ, ಕುಲದೇವತಾ ಆರಾಧನೆ & ಅನ್ನದಾನ)", en: "Pitru Rina (Lineage elevation, Kuladevata worship & feeding the hungry)", hi: "पितृ ऋण (वंशोद्धार, कुलदेवता पूजन एवं अन्नदान)", te: "పితృ ఋణం (వంశోద్ధరణ & కులదేవత పూజ)", ta: "பித்ரு கடன் (குலதெய்வ வழிபாடு & அன்னதானம்)" },
    { kn: "ಮನುಷ್ಯ ಋಣ (ಅಸಹಾಯಕರಿಗೆ ಆಶ್ರಯ & ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕೆ ಸಹಾಯ)", en: "Manushya Rina (Sheltering the helpless & supporting student education)", hi: "मनुष्य ऋण (निराश्रितों को आश्रय एवं विद्यादान)", te: "మనుష్య ఋణం (అనాథలకు ఆశ్రయం & విద్యా సహాయం)", ta: "மனுஷிய கடன் (ஏழைகளுக்கு அடைக்கலம் & கல்வி உதவி)" }
  ];

  const desires = [
    { kn: "ಬೃಹತ್ ದೇವಾಲಯ ಅಥವಾ ಧರ್ಮ ಛತ್ರದ ನಿರ್ಮಾಣವನ್ನು ಸಂಪೂರ್ಣಗೊಳಿಸುವುದು", en: "Completing the construction of a great public temple or pilgrim shelter", hi: "भव्य देवालय अथवा धर्मसत्र का निर्माण पूर्ण करना", te: "మహా ఆలయం లేదా అన్నదాన సత్రం పూర్తి చేయడం", ta: "பெரும் கோவில் அல்லது அன்னதான சத்திரத்தை நிறைவு செய்தல்" },
    { kn: "ಆಧ್ಯಾತ್ಮಿಕ ತತ್ವಜ್ಞಾನ ಗ್ರಂಥ ರಚನೆ ಮಾಡಿ ಲೋಕಕ್ಕೆ ಸಮರ್ಪಿಸುವುದು", en: "Authoring a timeless treatise on spiritual philosophy for humanity", hi: "आध्यात्मिक ज्ञानग्रंथ की रचना कर लोक को समर्पित करना", te: "ఆధ్యాత్మిక వేదాంత గ్రంథాన్ని రచించి లోకానికి అర్పించడం", ta: "ஆன்மீக ஞான நூலை எழுதி உலகிற்கு அர்ப்பணித்தல்" },
    { kn: "ಗೋಕರ್ಣ / ಕಾಶೀ ಯಾತ್ರೆ ಮಾಡಿ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಸಂಪೂರ್ಣ ಶರಣಾಗತಿ ಹೊಂದುವುದು", en: "Performing pilgrimage to Gokarna/Kashi with complete surrender at Atmalinga", hi: "गोकर्ण/काशी तीर्थयात्रा कर आत्मलिंग के चरणों में पूर्ण समर्पण", te: "గోకర్ణ/కాశీ యాత్ర చేసి ఆత్మలింగానికి సంపూర్ణ శరణాగతి", ta: "கோகர்ணம்/காசி யாத்திரை சென்று ஆத்மலிங்கத்தில் சரணடைதல்" },
    { kn: "ವಂಶದ ಸಕಲರಿಗೂ ಆರ್ಥಿಕ & ಆಧ್ಯಾತ್ಮಿಕ ಭದ್ರತೆ ನೀಡಿ ಮುಕ್ತಿ ಪಡೆಯುವುದು", en: "Securing generation-spanning spiritual and financial stability for lineage", hi: "वंश की सर्वांगीण उन्नति एवं मोक्ष प्राप्ति", te: "సంతానానికి ధార్మిక ఉన్నతిని కలిగించి ముక్తి పొందడం", ta: "வம்சத்தினருக்கு தர்ம வழியமைத்து முக்தி அடைதல்" }
  ];

  const blessings = [
    { kn: "ಪೂರ್ವಜರ ತಪಃಫಲ: ಸಂಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ದೈವಿಕ ರಕ್ಷಣೆ & ವಾಕ್‌ಸಿದ್ಧಿ", en: "Ancestral Tapas Boon: Miraculous divine protection during crises & resonant speech", hi: "पूर्वजों का तपःफल: संकट में आकस्मिक ईश्वरीय रक्षा एवं वाक्सिद्धि", te: "పూర్వీకుల తపఃఫలం: ఆపదలో అదృశ్య దైవ రక్షణ & వాక్శుద్ధి", ta: "முன்னோர் தபஸ்: ஆபத்தில் தெய்வீக பாதுகாப்பு & வாக்கு பலிதம்" },
    { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ವರದಾನ: ಶೂನ್ಯದಿಂದಲೂ ಮಹಾ ಸಂಪತ್ತನ್ನು ಮರಳಿ ಸೃಷ್ಟಿಸುವ ಆಂತರಿಕ ಶಕ್ತಿ", en: "Mahalakshmi Boon: Innate ability to resurrect immense wealth from zero", hi: "महालक्ष्मी वरदान: शून्यावस्था से भी विपुल संपदा पुनः सृजन करने का सामर्थ्य", te: "మహాలక్ష్మి వరం: సున్నా నుండి కూడా సంపదను సృష్టించే శక్తి", ta: "மகாலட்சுமி அருள்: பூஜ்ஜியத்திலிருந்தும் செல்வத்தை உருவாக்கும் ஆற்றல்" },
    { kn: "ಗುರು ಕೃಪಾ ಕವಚ: ಜ್ಞಾನಗ್ರಹಣ ಸಾಮರ್ಥ್ಯ, ಗೌರವ ಹಾಗೂ ಗಣ್ಯರ ಒಡನಾಟ", en: "Guru Krupa Shield: High cognitive absorption, widespread honor & noble alliances", hi: "गुरु कृपा कवच: तीक्ष्ण ग्रहण शक्ति, सामाजिक सम्मान एवं संतों की संगति", te: "గురు కృపా కవచం: అపార గ్రహణ శక్తి, గౌరవం & సత్పురుషుల సాంగత్యం", ta: "குரு கிருபை: கூர்மையான அறிவு, சமூக மரியாதை & பெரியோர் நட்பு" },
    { kn: "ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷೆ: ದೀರ್ಘಾಯುಷ್ಯ, ರೋಗನಿರೋಧಕ ಸ್ಥೈರ್ಯ & ಶತ್ರು ನಿಗ್ರಹ", en: "Mahabaleshwara Aegis: Robust longevity, cellular vitality & triumph over obstacles", hi: "महाबलेश्वर रक्षा: दीर्घायु, रोग-प्रतिरोधक क्षमता एवं शत्रु बाधा निवारण", te: "మహాబలేశ్వర రక్ష: దీర్ఘాయువు, ఆరోగ్య స్థైర్యం & శత్రు విజయం", ta: "மகாபலேஸ்வரர் அருள்: நீண்ட ஆயுள், ஆரோக்கியம் & எதிரிகள் வீழ்ச்சி" }
  ];

  const debtIdx = (sunSignNum + nakshatraIndex) % debts.length;
  const desireIdx = (sunSignNum * 2 + nakshatraIndex) % desires.length;
  const blessIdx = (sunSignNum + nakshatraIndex * 3) % blessings.length;

  return {
    sanchitaPunyaPercentage: punya,
    sanchitaPaapaPercentage: paapa,
    dominantKarmicDebt: debts[debtIdx] || debts[0]!,
    pastLifeUnfinishedDesire: desires[desireIdx] || desires[0]!,
    karmicCurseOrBlessing: blessings[blessIdx] || blessings[0]!
  };
}

export function computeInnateBoonsAndTalents(
  sunSignNum: number,
  nakshatraIndex: number,
  affinity: InexplicableAffinity = "ancient_temples"
): InnateBoonsAndTalents {
  const talentsMap: Record<number, { talents: { kn: string[]; en: string[]; hi: string[]; te: string[]; ta: string[] }; instinct: Record<string, string>; deity: Record<string, string>; triggers: { kn: string[]; en: string[]; hi: string[]; te: string[]; ta: string[] } }> = {
    0: {
      talents: {
        kn: ["ಸಂಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ನಿರ್ಭಯ ನಾಯಕತ್ವ", "ತಂತ್ರಜ್ಞಾನ ಹಾಗೂ ಯಂತ್ರಗಳ ತ್ವರಿತ ಗ್ರಹಿಕೆ", "ಸಂಘಟನಾ ಸಾಮರ್ಥ್ಯ & ರಣತಂತ್ರ"],
        en: ["Courageous command under severe pressure", "Instant grasp of mechanics & systems", "Strategic battlefield intuition"],
        hi: ["संकट में निर्भय नेतृत्व", "यंत्र एवं तकनीक की त्वरित समझ", "रणनीतिक संगठन कौशल"],
        te: ["ఆపదలో ధైర్యమైన నాయకత్వం", "సాంకేతిక పరిజ్ఞానం", "వ్యూహాత్మక ప్రణాళిక"],
        ta: ["நெருக்கடியில் அஞ்சா நெஞ்சம்", "இயந்திர மற்றும் தொழில்நுட்ப அறிவு", "போர்த்தந்திர மேலாண்மை"]
      },
      instinct: { kn: "ಅನ್ಯಾಯವನ್ನು ಕಂಡರೆ ತಕ್ಷಣ ಧ್ವನಿ ಎತ್ತುವ ನೈಸರ್ಗಿಕ ಪ್ರವೃತ್ತಿ", en: "Innate reflex to stand firm against injustice", hi: "अन्याय के विरुद्ध स्वतः मुखर होने की स्वाभाविक प्रवृत्ति", te: "అన్యాయాన్ని సహించలేని గుణం", ta: "அநீதியை எதிர்க்கும் இயல்பான வீரம்" },
      deity: { kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ / ಆಂಜನೇಯ", en: "Lord Kartikeya / Lord Hanuman", hi: "श्री कार्तिकेय / हनुमान जी", te: "సుబ్రహ్మణ్య స్వామి / హనుమంతుడు", ta: "முருகப்பெருமான் / ஆஞ்சநேயர்" },
      triggers: {
        kn: ["ಯುದ್ಧಭೂಮಿ ಅಥವಾ ಹಳೆಯ ಕೋಟೆಗಳ ದರ್ಶನ", "ತಾಮ್ರದ ಪಾತ್ರೆಗಳು & ಕತ್ತಿ-ಗುರಾಣಿ", "ಸೂರ್ಯೋದಯದ ಕೆಂಪು ಪ್ರಕಾಶ"],
        en: ["Sight of historic hill fortresses", "Copper armor & traditional weaponry", "Crimson dawn horizon"],
        hi: ["प्राचीन दुर्गों के दर्शन", "ताम्र पात्र एवं पारंपरिक अस्त्र", "उषाकाल की लालिमा"],
        te: ["చారిత్రక కోటల దర్శనం", "రాగి పాత్రలు", "సూర్యోదయ కాంతి"],
        ta: ["பழங்கால மலைக்கோட்டைகள்", "செப்புப் பாத்திரங்கள்", "செவ்வான உதயக் காட்சி"]
      }
    }
  };

  const genericTalents = [
    {
      kn: ["ವೇದ ಶ್ಲೋಕಗಳನ್ನು ಸುಲಭವಾಗಿ ನೆನಪಿಡುವ ಸಾಮರ್ಥ್ಯ", "ಜನರ ಮನಸ್ಥಿತಿಯನ್ನು ತ್ವರಿತವಾಗಿ ಅರಿಯುವ ಅಂತರ್ದೃಷ್ಟಿ", "ಆರ್ಥಿಕ ಸಂಪನ್ಮೂಲಗಳ ವ್ಯವಸ್ಥಿತ ನಿರ್ವಹಣೆ"],
      en: ["Spontaneous retention of sacred mantras", "Profound intuition into human psychology", "Systematic stewardship of wealth"],
      hi: ["मंत्रों को सहज कंठस्थ करने की क्षमता", "मानव स्वभाव की तीव्र परख", "वित्तीय संसाधनों का कुशल प्रबंधन"],
      te: ["మంత్రాలను సులభంగా గ్రహించే శక్తి", "మనుషుల మనస్తత్వాన్ని గ్రహించే నేర్పు", "ఆర్థిక నిర్వహణ సామర్థ్యం"],
      ta: ["சுலோகங்களை எளிதில் மனனம் செய்யும் ஆற்றல்", "மனித மனங்களை அறியும் உள்ளுணர்வு", "நிதி மேலாண்மைத் திறன்"]
    },
    {
      kn: ["ಆಯುರ್ವೇದ & ಗಿಡಮೂಲಿಕೆಗಳ ನೈಸರ್ಗಿಕ ಆಕರ್ಷಣೆ", "ಸಂಕೀರ್ಣ ಸಮಸ್ಯೆಗಳಿಗೆ ಶಾಂತಿಯುತ ಪರಿಹಾರ", "ಸಂಗೀತ, ಕಾವ್ಯ ಹಾಗೂ ಕಲಾ ಪ್ರಾವೀಣ್ಯತೆ"],
      en: ["Innate resonance with herbal healing", "Harmonious resolution of intricate conflicts", "Excellence in classical music & poetry"],
      hi: ["औषधीय वनस्पतियों के प्रति सहज आकर्षण", "जटिल विवादों का शांत समाधान", "संगीत एवं काव्य में विशेष रुचि"],
      te: ["మూలికా వైద్యం పట్ల ఆకర్షణ", "సమస్యలకు శాంతియుత పరిష్కారం", "సంగీత, సాహిత్య ప్రావీణ్యం"],
      ta: ["மூலிகை மருத்துவம் மீதான ஈர்ப்பு", "சிக்கல்களுக்கு அமைதியான தீர்வு", "இசை மற்றும் இலக்கிய புலமை"]
    },
    {
      kn: ["ವಾಸ್ತುಶಿಲ್ಪ & ಗಣಿತದ ಸೂಕ್ಷ್ಮ ಗ್ರಹಿಕೆ", "ಸಾರ್ವಜನಿಕ ಭಾಷಣ & ಸಂಭಾಷಣಾ ಕಲೆ", "ಧಾರ್ಮಿಕ ಶಿಸ್ತು ಹಾಗೂ ಧ್ಯಾನಾಸಕ್ತಿ"],
      en: ["Spatial mastery of sacred architecture", "Compelling oratory & diplomatic speech", "Spontaneous meditative focus"],
      hi: ["वास्तु एवं गणित की गहरी समझ", "प्रभावशाली संभाषण कला", "ध्यान एवं अनुशासन में स्वाभाविक रुचि"],
      te: ["వాస్తు, గణిత పరిజ్ఞానం", "ఆకర్షణీయమైన వక్తృత్వ కళ", "ధ్యాన సాధనా శ్రద్ధ"],
      ta: ["வாஸ்து மற்றும் கணித நுணுக்கம்", "சிறந்த பேச்சாற்றல்", "தியான ஈடுபாடு"]
    }
  ];

  const genericTriggers = [
    {
      kn: ["ಪುರಾತನ ಶಿಲ್ಪಕಲೆ ಹಾಗೂ ದೇವಾಲಯದ ಘಂಟಾನಾದ", "ಸಾಂಬ್ರಾಣಿ, ಶ್ರೀಗಂಧ ಹಾಗೂ ತುಪ್ಪದ ದೀಪದ ಪರಿಮಳ", "ಸಂಸ್ಕೃತ ಮಂತ್ರ ಘೋಷ ಕೇಳಿದಾಗ ಉಂಟಾಗುವ ರೋಮಾಂಚನ"],
      en: ["Echo of ancient temple sanctum bells", "Fragrance of burning camphor and sandalwood", "Inexplicable goosebumps upon hearing Vedic chants"],
      hi: ["प्राचीन देवालयों की घंटियों की गूंज", "कपूर, चंदन एवं घी के दीपों की सुगंध", "वैदिक मंत्रों के श्रवण से रोमांच"],
      te: ["ప్రాచీన ఆలయ గంటల నాదం", "సాంబ్రాణి, చందన సువాసనలు", "వేద మంత్రాలు విన్నప్పుడు కలిగే పులకరింత"],
      ta: ["பழைய கோவில் மணி ஓசை", "சாம்பிராணி, சந்தன நறுமணம்", "வேத மந்திரங்களை கேட்கும்போது ஏற்படும் மெய்சிலிர்ப்பு"]
    },
    {
      kn: ["ಬೆಟ್ಟದ ಮೇಲಿನ ತಣ್ಣನೆಯ ಮಂಜು & ನದಿಯ ತೀರ", "ಹಳೆಯ ಹಸ್ತಪ್ರತಿಗಳು ಹಾಗೂ ಗ್ರಂಥಾಲಯಗಳು", "ಸಮುದ್ರದ ಅಲೆಗಳ ಗಂಭೀರ ಘರ್ಜನೆ"],
      en: ["Mountain mist & tranquil riverbanks", "Ancient palm-leaf manuscripts and scrolls", "Deep ocean tides crashing against cliffs"],
      hi: ["पर्वतों की धुंध एवं शांत नदी तट", "प्राचीन ताड़पत्र पांडुलिपियां", "समुद्र की गंभीर गर्जना"],
      te: ["కొండల పై మంచు & నదీ తీరం", "తాళపత్ర గ్రంథాలు", "సముద్రపు అలల ఘోష"],
      ta: ["மலைப்பனி & அமைதியான நதிக்கரை", "பழைய ஓலைச்சுவடிகள்", "கடல் அலைகளின் ஓசை"]
    }
  ];

  const selTalents = genericTalents[(sunSignNum + nakshatraIndex) % genericTalents.length]!;
  const selTriggers = genericTriggers[(sunSignNum + nakshatraIndex) % genericTriggers.length]!;

  const instincts = [
    { kn: "ಅಂತರಂಗದ ಧ್ವನಿ ಸದಾ ಸರಿಯಾದ ಮಾರ್ಗವನ್ನು ಮೊದಲೇ ಮುನ್ಸೂಚಿಸುವುದು", en: "A powerful internal compass that presciently forecasts safe pathways", hi: "अंतरात्मा की आवाज जो संकट से पूर्व ही सही मार्ग का संकेत देती है", te: "అంతర్వాణి ఎల్లప్పుడూ సరైన మార్గాన్ని సూచించడం", ta: "உள்ளுணர்வு எப்போதும் சரியான பாதையை முன்கூட்டியே உணர்த்துதல்" },
    { kn: "ಯಾವುದೇ ಕಷ್ಟದಲ್ಲೂ ಧೃತಿಗೆಡದೆ ಸಕಾರಾತ್ಮಕವಾಗಿ ಮುನ್ನಡೆಯುವ ಸ್ಥೈರ್ಯ", en: "Unshakable equanimity that remains poised amidst adversity", hi: "विषम परिस्थितियों में भी अडिग रहकर सकारात्मक रहने का धैर्य", te: "ఎలాంటి కష్టంలోనైనా ధైర్యంగా నిలబడే స్థైర్యం", ta: "எத்தகைய துன்பத்திலும் கலங்காத மன உறுதி" }
  ];

  const deities = [
    { kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ (ಗೋಕರ್ಣ ಪರಮೇಶ್ವರ)", en: "Lord Mahabaleshwara (Gokarna Atmalinga)", hi: "श्री महाबलेश्वर (गोकर्ण आत्मलिंग)", te: "శ్రీ మహాబలేశ్వర స్వామి (గోకర్ణం)", ta: "ஸ்ரீ மகாபலேஸ்வரர் (கோகர்ணம்)" },
    { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ / ತಾಮ್ರಗೌರಿ ದೇವಿ", en: "Goddess Mahalakshmi / Goddess Tamragauri", hi: "महालक्ष्मी / ताम्रगौरी देवी", te: "శ్రీ మహాలక్ష్మి / తామ్రగౌరి అమ్మవారు", ta: "ஸ்ரீ மகாலட்சுமி / தாம்ரகௌரி அம்மன்" },
    { kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು / ನರಸಿಂಹ ಸ್ವಾಮಿ", en: "Lord Maha Vishnu / Lord Narasimha", hi: "श्री लक्ष्मीनरसिंह स्वामी", te: "శ్రీ లక్ష్మీనరసింహ స్వామి", ta: "ஸ்ரீ நரசிம்ம மூர்த்தி" }
  ];

  return {
    inheritedTalents: selTalents,
    intuitiveInstincts: instincts[(sunSignNum + nakshatraIndex) % instincts.length]!,
    sacredDeityAffinity: deities[(sunSignNum + nakshatraIndex) % deities.length]!,
    dejaVuTriggers: selTriggers
  };
}

export function computePhobiaAndBirthmarkCorrelation(
  mark: BirthMarkLocation = "head_face",
  phobia: InexplicablePhobia = "none",
  sunSignNum: number
): PhobiaAndBirthmarkCorrelation {
  const markSignificances: Record<BirthMarkLocation, { kn: string; en: string; hi: string; te: string; ta: string }> = {
    head_face: {
      kn: "ಹಣೆ / ಮುಖದ ಮೇಲಿನ ಮಚ್ಚೆ: ಹಿಂದಿನ ಜನ್ಮದ ಕಿರೀಟ ಧಾರಣೆ, ರಾಜ ಮುದ್ರೆ ಅಥವಾ ರಣರಂಗದ ಶೌರ್ಯದ ಗುರುತು.",
      en: "Head/Face Mark: Residual imprint of royal crown, sovereign tilaka, or honorable warrior forehead defense.",
      hi: "मस्तक/मुख पर चिन्ह: पूर्व जन्म का मुकुट चिन्ह, राजमुद्रा अथवा शौर्य का निशान।",
      te: "నుదురు/ముఖం పై మచ్చ: పూర్వజన్మ కిరీట ధారణ లేదా వీరత్వపు గుర్తు.",
      ta: "நெற்றி/முகத்தில் உள்ள மச்சம்: முன் ஜென்ம கிரீடம், ராஜமுத்திரை அல்லது வீரத்தின் வடு."
    },
    neck_chest: {
      kn: "ಕುತ್ತಿಗೆ / ಎದೆಯ ಮೇಲಿನ ಮಚ್ಚೆ: ಪವಿತ್ರ ರಕ್ಷಾ ಕವಚ, ರುದ್ರಾಕ್ಷಿ ಮಾಲೆ ಅಥವಾ ಹೃದಯ ರಕ್ಷಣಾ ಕವಚದ ಸ್ಥಳ.",
      en: "Neck/Chest Mark: Residual impression of sacred Kavacha amulet, Rudraksha mala, or breastplate defense.",
      hi: "कंठ/वक्ष पर चिन्ह: पवित्र रक्षा कवच, रुद्राक्ष माला अथवा हृदय कवच का स्थान।",
      te: "మెడ/ఛాతీ పై మచ్చ: పవిత్ర రక్షా కవచం లేదా రుద్రాక్ష మాల ధారణ చిహ్నం.",
      ta: "கழுத்து/மார்பில் உள்ள மச்சம்: புனித ரக்ஷா கவசம் அல்லது ருத்ராட்ச மாலை அணிந்த அடையாளம்."
    },
    back_spine: {
      kn: "ಬೆನ್ನು / ಬೆನ್ನುಮೂಳೆಯ ಮಚ್ಚೆ: ಯೋಗ ದಂಡ ಸಾಧನೆ ಅಥವಾ ಇತರರನ್ನು ರಕ್ಷಿಸುವಾಗ ಬೆನ್ನಿಗೆ ಹೊತ್ತ ಜವಾಬ್ದಾರಿಯ ಸಂಕೇತ.",
      en: "Back/Spine Mark: Imprint of rigorous yogic danda discipline or shielding comrades with one's back.",
      hi: "पृष्ठ/रीढ़ पर चिन्ह: योगाभ्यास का प्रभाव अथवा दूसरों की रक्षा करते हुए वहन किया गया भार।",
      te: "వీపు/వెన్నుపాము పై మచ్చ: యోగ సాధన లేదా ఇతరులను కాపాడిన గుర్తు.",
      ta: "முதுகு/முதுகெலும்பில் உள்ள மச்சம்: யோக தண்டு சாதனையின் அடையாளம்."
    },
    hands_arms: {
      kn: "ಕೈ / ತೋಳಿನ ಮಚ್ಚೆ: ಧನುರ್ವಿದ್ಯಾ ಪ್ರಾವೀಣ್ಯತೆ, ಪವಿತ್ರ ಮುದ್ರಾ ಯೋಗ ಅಥವಾ ಶ್ರೇಷ್ಠ ದಾನ ನೀಡಿದ ಕರಗಳ ಆಶೀರ್ವಾದ.",
      en: "Hands/Arms Mark: Past mastery of archery, sacred healing mudras, or hands that poured vast philanthropic water-oblations.",
      hi: "हस्त/भुजा पर चिन्ह: धनुर्विद्या, दिव्य मुद्रा योग अथवा महादान का शुभ चिन्ह।",
      te: "చేతులు/భుజాల పై మచ్చ: ధనుర్విద్య లేదా అన్నదానం చేసిన పుణ్యహస్తాల గుర్తు.",
      ta: "கை/தோள்பட்டையில் உள்ள மச்சம்: வில்வித்தை அல்லது பெரும் தானம் செய்த புண்ணியக் கரங்கள்."
    },
    legs_feet: {
      kn: "ಕಾಲು / ಪಾದಗಳ ಮಚ್ಚೆ: ಗೋಕರ್ಣ, ಕಾಶೀ, ರಾಮೇಶ್ವರಗಳ ನಿರಂತರ ಪಾದಯಾತ್ರೆ ಮಾಡಿದ ಪುಣ್ಯ ಪಾದಗಳ ರೇಖೆ.",
      en: "Legs/Feet Mark: Imprint of thousands of miles traversed on sacred barefoot pilgrimages across Gokarna, Kashi & Rameshwaram.",
      hi: "चरणों पर चिन्ह: गोकर्ण, काशी, रामेश्वरम तीर्थों की सहस्रों मील पदयात्रा का पुण्य प्रभाव।",
      te: "కాళ్ళు/పాదాల పై మచ్చ: గోకర్ణం, కాశీ పుణ్యక్షేత్రాల పాదయాత్ర చిహ్నం.",
      ta: "கால்/பாதங்களில் உள்ள மச்சம்: கோகர்ணம், காசி தலங்களுக்கு பாதயாத்திரை சென்ற புண்ணிய தடம்."
    },
    abdomen_waist: {
      kn: "ಹೊಟ್ಟೆ / ಸೊಂಟದ ಮಚ್ಚೆ: ಕಠಿಣ ಉಪವಾಸ ವ್ರತ ಅಥವಾ ರಾಜಕೋಶದ ಕೀಲಿಕೈ ರಕ್ಷಿಸಿದ ಅಧಿಕಾರದ ಸಂಕೇತ.",
      en: "Abdomen/Waist Mark: Residual imprint of severe vow fasts or golden treasury waistband worn in high office.",
      hi: "उदर/कटि पर चिन्ह: कठोर उपवास व्रत अथवा राजकोष की स्वर्ण मेखला का प्रतीक।",
      te: "పొట్ట/నడుము పై మచ్చ: కఠిన ఉపవాస దీక్షలు లేదా రాజకోశ సంరక్షణ గుర్తు.",
      ta: "வயிறு/இடுப்பில் உள்ள மச்சம்: விரத அனுஷ்டானம் அல்லது பொக்கிஷப் பொறுப்பின் அடையாளம்."
    },
    none: {
      kn: "ದೇಹದಲ್ಲಿ ಯಾವುದೇ ವಿಶೇಷ ಮಚ್ಚೆಗಳಿಲ್ಲ: ಸಮತೋಲಿತ ಕರ್ಮದೊಂದಿಗೆ ಶಾಂತಿಯುತ ಪುನರ್ಜನ್ಮದ ಲಕ್ಷಣ.",
      en: "No Prominent Birthmark: Indicates a harmonious, untraumatized rebirth with pure cellular slate.",
      hi: "कोई विशेष चिन्ह नहीं: शांत एवं संतुलित पुनर्जन्म का शुभ लक्षण।",
      te: "ప్రత్యేక మచ్చలు లేకపోవడం: ప్రశాంతమైన పునర్జన్మ సంకేతం.",
      ta: "குறிப்பிட்ட மச்சங்கள் இல்லை: அமைதியான, சமநிலையான மறுபிறவியின் அடையாளம்."
    }
  };

  const phobiaOrigins: Record<InexplicablePhobia, { kn: string; en: string; hi: string; te: string; ta: string }> = {
    water_drowning: {
      kn: "ನೀರಿನ ಭಯ (Jala Bhaya): ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಸಾಗರ ಯಾನ ಅಥವಾ ಪ್ರವಾಹದ ಸಮಯದಲ್ಲಿ ಸಂಭವಿಸಿದ ಜಲ ಸಮಾಧಿ.",
      en: "Water Phobia: Soul transition during a sacred ocean voyage or turbulent monsoon river crossing.",
      hi: "जल भय: पूर्व जन्म में समुद्र यात्रा अथवा नदी पार करते समय हुई जल समाधि।",
      te: "నీటి భయం: పూర్వజన్మలో నదీ లేదా సముద్ర ప్రయాణంలో సంభవించిన మార్పు.",
      ta: "நீர் பயம்: முன் ஜென்மத்தில் கடல் பயணம் அல்லது ஆற்று வெள்ளத்தில் நிகழ்ந்த முடிவு."
    },
    fire_burns: {
      kn: "ಬೆಂಕಿಯ ಭಯ (Agni Bhaya): ಪವಿತ್ರ ಯಜ್ಞಕುಂಡದ ರಕ್ಷಣೆ ಅಥವಾ ಕೋಟೆಯ ಅಗ್ನಿ ಅವಘಡದಲ್ಲಿ ಸಂಭವಿಸಿದ ಪ್ರಾಣತ್ಯಾಗ.",
      en: "Fire Phobia: Soul departure amidst sacred sacrificial Yajna fire defense or fortress siege blaze.",
      hi: "अग्नि भय: पावन यज्ञ वेदी की रक्षा अथवा दुर्ग की अग्नि में प्राणोत्सर्ग।",
      te: "అగ్ని భయం: యజ్ఞ వేదిక రక్షణలో లేదా అగ్ని ప్రమాదంలో జరిగిన పరిణామం.",
      ta: "தீ பயம்: யாக குண்ட பாதுகாப்பு அல்லது தீ விபத்தில் நிகழ்ந்த ஆன்மப் பிரிர்வு."
    },
    heights_fall: {
      kn: "ಎತ್ತರದ ಭಯ (Giri Bhaya): ಹಿಮಾಲಯದ ಕಡಿದಾದ ಗಿರಿ ಶಿಖರಗಳಲ್ಲಿ ತಪಸ್ಸು ಮಾಡುತ್ತಾ ಮುಕ್ತಿ ಹೊಂದಿದ ನೆನಪು.",
      en: "Heights Phobia: Soul transition from high-altitude Himalayan cliffside meditation sanctuary.",
      hi: "ऊंचाई का भय: हिमालय के दुर्गम पर्वत शिखरों पर तपस्या करते हुए मोक्ष प्राप्ति।",
      te: "ఎత్తైన ప్రదేశాల భయం: హిమాలయ శిఖరాల పై తపస్సు చేస్తూ ముక్తి పొందిన స్మృతి.",
      ta: "உயரமான இட பயம்: இமயமலை சிகரத்தில் தவம் செய்தபோது நிகழ்ந்த ஆன்ம முக்தி."
    },
    enclosed_darkness: {
      kn: "ಕತ್ತಲೆ / ಬಂಧನದ ಭಯ (Guha Bhaya): ಪ್ರಾಚೀನ ಗುಹೆಗಳಲ್ಲಿ ದೀರ್ಘಕಾಲಿಕ ಏಕಾಂತ ತಪಸ್ಸು (ಗುಹಾ ಸಾಧನೆ).",
      en: "Enclosed Darkness Phobia: Imprint of decades spent in subterranean cave meditation (Guha Sadhana).",
      hi: "अंधकार/संकीर्णता का भय: पावन कंदराओं में दीर्घकालीन एकांत गुहा साधना की स्मृति।",
      te: "చీకటి భయం: పురాతన గుహలలో సుదీర్ఘ కాలం చేసిన ఏకాంత తపస్సు.",
      ta: "இருட்டு பயம்: குகைகளில் பல ஆண்டுகள் தனிமையில் செய்த தவத்தின் தாக்கம்."
    },
    sharp_weapons: {
      kn: "ಆಯುಧಗಳ ಭಯ (Shastra Bhaya): ರಣರಂಗದಲ್ಲಿ ಧರ್ಮ ರಕ್ಷಣೆಯ ಹೋರಾಟದಲ್ಲಿ ಗೌರವಾನ್ವಿತವಾಗಿ ಪ್ರಾಣತೆತ್ತ ವೀರ ಮರಣ.",
      en: "Sharp Weapon Phobia: Glorious departure in the heat of battlefield defense protecting holy shrines.",
      hi: "शस्त्र भय: रणभूमि में धर्म रक्षा करते हुए प्राप्त हुआ वीरगति का गौरव।",
      te: "ఆయుధాల భయం: యుద్ధరంగంలో ధర్మ రక్షణ చేస్తూ పొందిన వీరమరణం.",
      ta: "ஆயுத பயம்: போர்க்களத்தில் தர்மத்தை காத்து அடைந்த வீர மரணம்."
    },
    isolation_abandonment: {
      kn: "ಏಕಾಂಗಿತನದ ಭಯ: ಸನ್ಯಾಸ ಸ್ವೀಕರಿಸಿ ಜನಸಂಪರ್ಕವಿಲ್ಲದ ಅರಣ್ಯದಲ್ಲಿ ಮುಕ್ತಿ ಹೊಂದಿದ ಸಂನ್ಯಾಸ ನೆನಪು.",
      en: "Isolation Phobia: Memory of forest hermit solitude (Vanaprastha/Sannyasa) transitioning in deep silence.",
      hi: "एकाकीपन का भय: घने अरण्य में सन्यास लेकर परम शांति में विलीन होने की स्मृति।",
      te: "ఒంటరితనపు భయం: వానప్రస్థంలో అరణ్యంలో ప్రశాంతంగా ముక్తి పొందిన అనుభవం.",
      ta: "தனிமை பயம்: காட்டில் துறவறம் பூண்டு ஏகாந்தத்தில் முக்தி அடைந்த நினைவு."
    },
    none: {
      kn: "ಯಾವುದೇ ಭಯಗಳಿಲ್ಲ: ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ವೃದ್ಧಾಪ್ಯದಲ್ಲಿ ಶಾಂತಿಯುತವಾಗಿ ಭಗವನ್ನಾಮ ಸ್ಮರಣೆಯೊಂದಿಗೆ ಮುಕ್ತಿ ಹೊಂದಿದ ಲಕ್ಷಣ.",
      en: "No Inexplicable Phobias: Indicates a serene transition surrounded by sacred chants and family in ripe age.",
      hi: "कोई भय नहीं: पूर्व जन्म में वृद्धावस्था में भगवन्नाम स्मरण करते हुए शांतिपूर्ण निर्वाण।",
      te: "ఎలాంటి భయాలు లేవు: వృద్ధాప్యంలో భగవన్నామ స్మరణతో ప్రశాంతంగా ముక్తి పొందారు.",
      ta: "பயங்கள் இல்லை: முதுமையில் இறை நாமத்தை உச்சரித்தபடி அமைதியாக முக்தி அடைந்த புண்ணியம்."
    }
  };

  const transitions = [
    { kn: "ಈಶ್ವರ ನಾಮ ಸ್ಮರಣೆ & ತುಳಸೀ ತೀರ್ಥ ಸ್ವೀಕರಿಸುತ್ತಾ ಶಾಂತ ನಿರ್ಗಮನ", en: "Serene departure imbibing sacred Tulasi water and chanting Lord Shiva's name", hi: "तुलसी जल एवं ओंकार जप के साथ शांत देहत्याग", te: "తులసి తీర్థం స్వీకరిస్తూ ఈశ్వర నామస్మరణతో ప్రశాంత ముక్తి", ta: "துளசி தீர்த்தம் அருந்தி சிவநாம உச்சரிப்புடன் அமைதியான முக்தி" },
    { kn: "ಧರ್ಮ ಕಾರ್ಯವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ ತೃಪ್ತಿಯೊಂದಿಗೆ ಪುಣ್ಯ ತಿಥಿಯಲ್ಲಿ ದೇಹತ್ಯಾಗ", en: "Fulfilling life dharma and transitioning on an auspicious Tithi with deep contentment", hi: "सकल धर्मकार्यों की पूर्णता के साथ पुण्य तिथि पर देहत्याग", te: "ధర్మకార్యాలు పూర్తి చేసి పుణ్య తిథిలో దేహత్యాగం", ta: "தர்ம காரியங்களை நிறைவு செய்து புண்ணிய திதியில் உடலை நீத்தல்" }
  ];

  return {
    birthmarkSignificance: markSignificances[mark] || markSignificances.none,
    phobiaKarmicOrigin: phobiaOrigins[phobia] || phobiaOrigins.none,
    pastLifeTransitionType: transitions[sunSignNum % transitions.length]!
  };
}

export function computeRahuKetuMokshaAxis(
  sunSignNum: number,
  nakshatraIndex: number
): RahuKetuMokshaAxis {
  const axes = [
    {
      ketu: { kn: "ತುಲಾ ಕೇತು: ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಸಂಬಂಧಗಳು, ರಾಜತಾಂತ್ರಿಕತೆ & ವ್ಯವಹಾರಗಳಲ್ಲಿ ಸಂಪೂರ್ಣ ಪರಿಣತಿ.", en: "Libra Ketu: Mastered diplomacy, partnerships & commercial equilibrium in past incarnations.", hi: "तुला केतु: पूर्व जन्म में संबंध, कूटनीति एवं संतुलन में पूर्ण दक्षता।", te: "తులా కేతువు: పూర్వజన్మలో సంబంధాలు, రాయబారంలో నైపుణ్యం.", ta: "துலாம் கேது: முன் ஜென்மத்தில் ராஜதந்திரம் மற்றும் உறவுகளில் முழு தேர்ச்சி." },
      rahu: { kn: "ಮೇಷ ರಾಹು: ಈ ಜನ್ಮದಲ್ಲಿ ಸ್ವಾವಲಂಬನೆ, ಧೈರ್ಯಶಾಲಿ ನಾಯಕತ್ವ & ಸ್ವಂತ ಹೆಜ್ಜೆ ಇಡುವುದು ನಿಮ್ಮ ಪ್ರಮುಖ ಸಂಕಲ್ಪ.", en: "Aries Rahu: This lifetime demands pioneering self-reliance, bold initiative & independent leadership.", hi: "मेष राहु: इस जन्म में स्वावलंबन, निर्भय नेतृत्व एवं स्वतंत्र मार्ग निर्माण आपका मुख्य संकल्प है।", te: "మేష రాహువు: ఈ జన్మలో స్వయం సమృద్ధి & ధైర్యమైన నాయకత్వం మీ లక్ష్యం.", ta: "மேஷம் ராகு: இந்த ஜென்மத்தில் சுயசார்பு மற்றும் தைரியமான தலைமை உங்கள் கடமை." },
      stage: { kn: "ದೇವ ಅಂಶ (Deva Amsha - ಧರ್ಮ ನಾಯಕ)", en: "Deva Amsha (Pioneering Dharma Leader)", hi: "देव अंश (धर्म नायक)", te: "దేవ అంశ (ధర్మ నాయకుడు)", ta: "தேவ அம்சம் (தர்ம நாயகன்)" }
    },
    {
      ketu: { kn: "ವೃಶ್ಚಿಕ ಕೇತು: ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಗೂಢ ವಿದ್ಯೆಗಳು, ತಂತ್ರ, ರಹಸ್ಯ ಸಂಶೋಧನೆ & ಆಧ್ಯಾತ್ಮಿಕ ಪರಿವರ್ತನೆ ಸಾಧನೆ.", en: "Scorpio Ketu: Past life mastery of esoteric mysticism, deep research & occult transformation.", hi: "वृश्चिक केतु: पूर्व जन्म में गूढ़ विद्याएं, शोध एवं आध्यात्मिक रूपांतरण में प्रवीणता।", te: "వృశ్చిక కేతువు: పూర్వజన్మలో గూఢ విద్యలు & పరిశోధనలలో ప్రావీణ్యం.", ta: "விருச்சிக கேது: முன் ஜென்மத்தில் ரகசிய ஞானம் மற்றும் ஆன்மீக சாதனையில் தேர்ச்சி." },
      rahu: { kn: "ವೃಷಭ ರಾಹು: ಈ ಜನ್ಮದಲ್ಲಿ ಸ್ಥಿರ ಸಂಪನ್ಮೂಲ ನಿರ್ಮಾಣ, ಕುಟುಂಬ ರಕ್ಷಣೆ & ಶಾಶ್ವತ ಮೌಲ್ಯ ಸೃಷ್ಟಿ ನಿಮ್ಮ ಕರ್ತವ್ಯ.", en: "Taurus Rahu: Grounding in material stability, building enduring institutions & nourishing family.", hi: "वृषभ राहु: इस जन्म में स्थायी संपदा निर्माण, पारिवारिक संरक्षण एवं सत्यनिष्ठा मुख्य लक्ष्य है।", te: "వృషభ రాహువు: స్థిరమైన సంపద నిర్మాణం & కుటుంబ రక్షణ మీ కర్తవ్యం.", ta: "ரிஷபம் ராகு: நிலையான செல்வம் உருவாக்குதல் மற்றும் குடும்பத்தை காப்பது உங்கள் கடமை." },
      stage: { kn: "ಋಷಿ ಅಂಶ (Rishi Amsha - ತಪಸ್ವಿ ಜ್ಞಾನಿ)", en: "Rishi Amsha (Contemplative Sage)", hi: "ऋषि अंश (तपस्वी ज्ञानी)", te: "ఋషి అంశ (తపస్వి)", ta: "ரிஷி அம்சம் (தவ ஞானி)" }
    },
    {
      ketu: { kn: "ಧನು ಕೇತು: ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ವೇದ ಶಾಸ್ತ್ರ ಅಧ್ಯಯನ, ಧರ್ಮ ಬೋಧನೆ & ಗುರುಕುಲ ನಿರ್ವಹಣೆ.", en: "Sagittarius Ketu: Past life immersion in higher philosophy, pilgrimage & scriptural authority.", hi: "धनु केतु: पूर्व जन्म में उच्च दर्शन, तीर्थाटन एवं वेदांत ज्ञान में पूर्णता।", te: "ధనుస్సు కేతువు: పూర్వజన్మలో వేద శాస్త్ర అధ్యయనం & ధర్మ బోధన.", ta: "தனுசு கேது: முன் ஜென்மத்தில் வேதாந்த ஞானம் மற்றும் ஆன்மீக போதனையில் சிறப்பு." },
      rahu: { kn: "ಮಿಥುನ ರಾಹು: ಈ ಜನ್ಮದಲ್ಲಿ ಪ್ರಾಯೋಗಿಕ ಸಂವಹನ, ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನ ಕಲಿಕೆ & ಜ್ಞಾನವನ್ನು ಜನಸಾಮಾನ್ಯರಿಗೆ ಹಂಚುವುದು.", en: "Gemini Rahu: Practical communication, mastering modern networks & simplifying wisdom for the masses.", hi: "मिथुन राहु: व्यावहारिक संचार, आधुनिक विद्या एवं जन-सामान्य तक ज्ञान पहुँचाना।", te: "మిథున రాహువు: ఆధునిక విద్య & సమాచార ప్రసారం మీ ధర్మం.", ta: "மிதுனம் ராகு: உலகியல் தொடர்பு மற்றும் புதிய கலைகளை கற்பது உங்கள் நோக்கம்." },
      stage: { kn: "ಗಂಧರ್ವ ಅಂಶ (Gandharva Amsha - ಸೃಜನಶೀಲ ಸೌಂದರ್ಯ)", en: "Gandharva Amsha (Harmonious Illuminator)", hi: "गंधर्व अंश (कला-विद्या निपुण)", te: "గంధర్వ అంశ (సృజనశీలి)", ta: "கந்தர்வ அம்சம் (கலைச் சுடர்)" }
    },
    {
      ketu: { kn: "ಮಕರ ಕೇತು: ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಕಠಿಣ ಶ್ರಮ, ಸಾಮಾಜಿಕ ಜವಾಬ್ದಾರಿ & ಸಾಮ್ರಾಜ್ಯ ಆಡಳಿತದ ಅಧಿಕಾರ.", en: "Capricorn Ketu: Past life mastery of duty, disciplined operations & executive statecraft.", hi: "मकर केतु: पूर्व जन्म में कठोर अनुशासन, कर्तव्यनिष्ठा एवं साम्राज्य संचालन।", te: "మకర కేతువు: పూర్వజన్మలో రాజ్యాధికారం & క్రమశిక్షణతో కూడిన సేవ.", ta: "மகர கேது: முன் ஜென்மத்தில் கடின உழைப்பு மற்றும் அரசு நிர்வாகத்தில் சாதனை." },
      rahu: { kn: "ಕರ್ಕಾಟಕ ರಾಹು: ಈ ಜನ್ಮದಲ್ಲಿ ಭಾವನಾತ್ಮಕ ಪ್ರೀತಿ, ಕರುಣೆ, ಕುಟುಂಬ ಪೋಷಣೆ & ಆಂತರಿಕ ನೆಮ್ಮದಿ ಸಾಕ್ಷಾತ್ಕಾರ.", en: "Cancer Rahu: Embracing emotional vulnerability, unconditional nurturing & inner peace.", hi: "कर्क राहु: भावनात्मक वात्सल्य, करुणा, पारिवारिक पोषण एवं अंतःशांति।", te: "కర్కాటక రాహువు: ప్రేమ, కరుణ & కుటుంబ అనుబంధాలను కాపాడుకోవడం.", ta: "கடகம் ராகு: அன்பு, கருணை மற்றும் குடும்ப அமைதியை நிலைநாட்டுதல்." },
      stage: { kn: "ಕುಬೇರ ಅಂಶ (Kubera Amsha - ಸಂಪದ್ಭರಿತ ದಾನಿ)", en: "Kubera Amsha (Prosperous Benefactor)", hi: "कुबेर अंश (वैभवशाली दानी)", te: "కుబేర అంశ (సంపన్నుడు)", ta: "குபேர அம்சம் (செல்வ வள்ளல்)" }
    }
  ];

  const maturityLevels = [
    { kn: "ಪ್ರೌಢ ಆತ್ಮ (Mature Soul — ೪ನೇ ಪುನರ್ಜನ್ಮ ಚಕ್ರ)", en: "Mature Soul (4th Cycle of Conscious Rebirth)", hi: "प्रौढ़ आत्मा (4था पुनर्जन्म चक्र)", te: "ప్రౌఢ ఆత్మ (నాల్గవ జన్మ చక్రం)", ta: "முதிர்ந்த ஆன்மா (4வது பிறவிச் சுழற்சி)" },
    { kn: "ಜ್ಞಾನಿ ಆತ್ಮ (Wise Luminary Soul — ಅಂತಿಮ ಮೋಕ್ಷ ಸನಿಹ)", en: "Illuminated Soul (Approaching Final Moksha Liberation)", hi: "ज्ञानी आत्मा (परम मोक्ष के अत्यंत निकट)", te: "జ్ఞాని ఆత్మ (మోక్షానికి అతి సమీపం)", ta: "ஞான ஆன்மா (முக்திக்கு மிக அருகில்)" }
  ];

  const axisIdx = sunSignNum % axes.length;
  const selectedAxis = axes[axisIdx] || axes[0]!;

  return {
    ketuPastLifeMastery: selectedAxis.ketu,
    rahuCurrentLifeMission: selectedAxis.rahu,
    d60SoulEvolutionStage: selectedAxis.stage,
    soulMaturityLevel: maturityLevels[(sunSignNum + nakshatraIndex) % maturityLevels.length]!
  };
}

export function computeKarmicRemediesAndGokarnaShanti(
  sunSignNum: number
): KarmicRemediesAndGokarnaShanti {
  const mantras = [
    "॥ ಓಂ ನಮಃ ಶಿವಾಯ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ ॥",
    "॥ ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ॥",
    "॥ ಓಂ ನಮೋ ನಾರಾಯಣಾಯ ನಮಃ ಶಾಂತಾತ್ಮನೇ ನಮಃ ॥"
  ];

  const danaItems = {
    kn: ["ಕಪ್ಪು ಎಳ್ಳು & ಶುದ್ಧ ತುಪ್ಪ (Tila & Ghee)", "ಬಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಅನ್ನದಾನ & ಪುಸ್ತಕ ದಾನ", "ಗೋಮಾತೆಗೆ ಹಸಿರು ಹುಲ್ಲು & ಬೆಲ್ಲದ ಸೇವೆ"],
    en: ["Black Sesame & Pure Desi Cow Ghee", "Anna-Dana & Educational Book Support", "Go-Seva with fresh green grass & jaggery"],
    hi: ["काले तिल एवं शुद्ध गाय का घी", "अन्नदान एवं निर्धन विद्यार्थियों को पुस्तक दान", "गौमाता को हरा चारा एवं गुड़"],
    te: ["నల్ల నువ్వులు & నెయ్యి", "అన్నదానం & పేద విద్యార్థులకు సహాయం", "గోసేవ & బెల్లం సమర్పణ"],
    ta: ["கருப்பு எள் & நெய்", "அன்னதானம் & கல்வி உதவி", "பசுவிற்கு அகத்திக்கீரை & வெல்லம்"]
  };

  const gokarnaRemedies = {
    kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಪೂಜೆ, ಪಂಚಾಮೃತ ಅಭಿಷೇಕ ಹಾಗೂ ತ್ರಯೋದಶಿ ಪ್ರದೋಷ ಪೂಜೆ ಸರ್ವ ಪೂರ್ವ ಜನ್ಮ ದೋಷ ನಿವಾರಕ.",
    en: "Atmalinga Sparsha Pooja, Panchamrita Abhisheka & Pradosha Seva at Sri Gokarna Mahabaleshwara Kshetra dissolves deep-rooted karmic debts.",
    hi: "गोकर्ण महाबलेश्वर सान्निध्य में आत्मलिंग स्पर्श पूजन, पंचामृत अभिषेक एवं प्रदोष पूजा से पूर्व जन्म के समस्त कर्म-दोष शांत होते हैं।",
    te: "గోకర్ణ మహాబలేశ్వర క్షేత్రంలో ఆత్మలింగ స్పర్శ పూజ & ప్రదోష సేవ ద్వారా పూర్వజన్మ దోషాలు తొలగిపోతాయి.",
    ta: "கோகர்ண மகாபலேஸ்வரர் சந்நிதியில் ஆத்மலிங்க ஸ்பரிச பூஜை மற்றும் பிரதோஷ வழிபாடு சகல பூர்வ ஜென்ம பாவங்களையும் நீக்கும்."
  };

  return {
    sacredAtmaShantiMantra: mantras[sunSignNum % mantras.length]!,
    recommendedTilaAndDanaItems: danaItems,
    sacredGokarnaRemedy: gokarnaRemedies,
    priestName: "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರು)",
    priestPhone: "+91 99723 39362"
  };
}

export async function executeHindinaJanmaCalculation(
  input: HindinaJanmaInput,
  geminiApiKey?: string
): Promise<HindinaJanmaResult> {
  const parts = input.dob.split("-").map(Number);
  const timeStr = input.tob ? input.tob : "12:00";
  const utcDate = wallClockBirthToUtc(input.dob, timeStr, 14.5479, 74.3188, "581326");
  const longs = siderealLongitudes(utcDate, "lahiri");

  const sunSignIdx = Math.floor(longs.sun / 30) % 12;
  const moonNakIdx = Math.floor(longs.moon / (360 / 27)) % 27;

  const isKn = input.lang === "kn";
  const sunSignStr = isKn ? RASHI_NAMES_KN[sunSignIdx]! : RASHI_NAMES_EN[sunSignIdx]!;
  const moonNakStr = isKn ? NAKSHATRA_NAMES_KN[moonNakIdx]! : NAKSHATRA_NAMES_EN[moonNakIdx]!;

  const persona = computePastLifePersona(sunSignIdx, moonNakIdx, input);
  const karma = computeSanchitaKarmaAnalysis(sunSignIdx, moonNakIdx, input);
  const boons = computeInnateBoonsAndTalents(sunSignIdx, moonNakIdx, input.inexplicableAffinity);
  const phobiaCorr = computePhobiaAndBirthmarkCorrelation(input.birthMarkLocation, input.inexplicablePhobia, sunSignIdx);
  const moksha = computeRahuKetuMokshaAxis(sunSignIdx, moonNakIdx);
  const remedies = computeKarmicRemediesAndGokarnaShanti(sunSignIdx);

  const buildDeterministicNarrative = () => {
    const customQ = input.customQuestion?.trim();
    if (isKn) {
      const p1Direct = customQ
        ? `ನಿಮ್ಮ ಪ್ರಶ್ನೆಯಾದ "${customQ}" ಕುರಿತು ಪರಿಶೀಲಿಸಿದಾಗ, ಇದು ನಿಮ್ಮ ಹಿಂದಿನ ಜನ್ಮದ ಋಣಾನುಬಂಧ ಹಾಗೂ ಸಂಚಿತ ಕರ್ಮದ ನೇರ ಪ್ರಭಾವವಾಗಿದೆ. ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಉಂಟಾಗಿದ್ದ ಅಪೂರ್ಣ ಒಡಂಬಡಿಕೆ ಅಥವಾ ತಪ್ಪುಗ್ರಹಿಕೆಗಳು ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಪುನರಾವರ್ತನೆಯಾಗುತ್ತಿವೆ. ಎದುರಿಗಿರುವ ವ್ಯಕ್ತಿಗಳ ನಡವಳಿಕೆಗೆ ಅವರ ಆಂತರಿಕ ಅಸೂಯೆ ಅಥವಾ ಪೂರ್ವಜನ್ಮದ ವಾಸನೆಗಳೇ ಕಾರಣವಾಗಿದ್ದು, ನೇರ ಸಂವಾದ ಹಾಗೂ ಶಾಂತಿ ಮಾರ್ಗದಿಂದ ಈ ಬಂಧನವು ಸಡಿಲಗೊಳ್ಳುತ್ತದೆ.`
        : `ನಿಮ್ಮ ಜಾತಕದ ೫ನೇ ಭಾವ ಹಾಗೂ ೧೨ನೇ ಭಾವಗಳ ಕರ್ಮ ಶಕ್ತಿಯಂತೆ, ನಿಮ್ಮ ಆತ್ಮವು ಪೂರ್ವಜನ್ಮದ ಮಹತ್ತರವಾದ ಪುಣ್ಯ ಸಂಚಿತವನ್ನು ಹೊತ್ತು ಈ ದೇಹವನ್ನು ಧರಿಸಿದೆ. ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಎದುರಾಗುವ ಸವಾಲುಗಳು ನಿಮ್ಮ ಆತ್ಮದ ಪರಿಶುದ್ಧತೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಉನ್ನತಿಗೆ ಪೂರಕವಾದ ಕರ್ಮ ಪರೀಕ್ಷೆಗಳಾಗಿವೆ.`;

      return `೧. ನೇರ ವಾಸ್ತವಿಕ ನಿರ್ಣಯ & ಕರ್ಮ ವಿಶ್ಲೇಷಣೆ:
${p1Direct}

೨. ಹಿಂದಿನ ಜನ್ಮದ ಗುರುತು & ಕಾಲಮಾನ:
ನಿಮ್ಮ ಜಾತಕದ ಸೂರ್ಯ ರಾಶಿ (${sunSignStr}) ಮತ್ತು ಜನ್ಮ ನಕ್ಷತ್ರ (${moonNakStr}) ಗಳ ಡಿ-೬೦ ಷಷ್ಟ್ಯಂಶ ಗಣನೆಯಂತೆ, ನೀವು ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ${persona.eraAndTimeline.kn} ದಲ್ಲಿ ${persona.geographicalRealm.kn} ಪ್ರದೇಶದಲ್ಲಿದ್ದಿರಿ. ನೀವು ${persona.socialStatusAndVocation.kn} ಆಗಿ ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸ್ಥಾನದಲ್ಲಿದ್ದಿರಿ. ನಿಮ್ಮ ಆತ್ಮವು ${karma.sanchitaPunyaPercentage}% ಪುಣ್ಯ ಬಲದೊಂದಿಗೆ ಮರುಹುಟ್ಟು ಪಡೆದಿದೆ. ಹಿಂದಿನ ಜನ್ಮದ ಸತ್ಕರ್ಮಗಳಿಂದ ${karma.karmicCurseOrBlessing.kn}.

೩. ಸುಪ್ತ ಪ್ರತಿಭೆ, ಮಚ್ಚೆ & ಆತ್ಮ ಲಕ್ಷ್ಯ:
ನಿಮ್ಮಲ್ಲಿರುವ ${boons.inheritedTalents.kn.join(", ")} ಹಿಂದಿನ ಜನ್ಮದಿಂದ ಸುಪ್ತವಾಗಿ ಬಂದಿರುವ ದೈವಿಕ ವರದಾನಗಳಾಗಿವೆ. ನಿಮ್ಮ ${phobiaCorr.birthmarkSignificance.kn} ಹಾಗೂ ${phobiaCorr.phobiaKarmicOrigin.kn}. ಈ ಜನ್ಮದಲ್ಲಿ ${moksha.rahuCurrentLifeMission.kn}.

೪. ಪ್ರಾಯೋಗಿಕ ಪರಿಹಾರ & ಮುಕ್ತಿ ಮಾರ್ಗ:
ಪೂರ್ವಜನ್ಮದ ಶೇಷ ಋಣಗಳನ್ನು ಕಳೆದುಕೊಳ್ಳಲು ನಿತ್ಯವೂ ${remedies.sacredAtmaShantiMantra} ಪಠಿಸಿ, ${remedies.sacredGokarnaRemedy.kn} ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದರಿಂದ ನಿಮ್ಮ ಸಕಲ ಕರ್ಮ ಕ್ಲೇಶಗಳು ನಿವಾರಣೆಯಾಗಿ ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ಶಾಂತಿ, ಸಂತೋಷ ಪ್ರಾಪ್ತಿಯಾಗುವುದು.`;
    }

    const p1DirectEn = customQ
      ? `Regarding your inquiry "${customQ}", this dynamic originates directly from past-life Rnanubandha (karmic entanglement) and unresolved relational patterns. Misunderstandings or external friction experienced now are echoes of past cycle obligations. Approaching the situation with calm boundaries, conscious dialogue, and remedial shanti will resolve the underlying karmic friction.`
      : `According to your 5th and 12th house karmic axis, your soul has reincarnated with a substantial reservoir of accumulated merits (Sanchita Punya), purposefully positioned to dissolve lingering ancestral residues.`;

    return `1. Direct Karmic Assessment & Current Situation:
${p1DirectEn}

2. Past Life Persona, Era & Sanchita Balance:
Based on your Sidereal Sun Sign (${sunSignStr}) and Nakshatra (${moonNakStr}) in the Parashara D-60 Shashtiamsha matrix, your soul inhabited the ${persona.eraAndTimeline.en} within ${persona.geographicalRealm.en}. You served as a ${persona.socialStatusAndVocation.en}. Your soul carries ${karma.sanchitaPunyaPercentage}% Punya into this embodiment, resulting in: ${karma.karmicCurseOrBlessing.en}.

3. Inherited Soul Faculties, Birthmarks & Current Mission:
Your innate faculties including ${boons.inheritedTalents.en.join(", ")} are unbroken spiritual carry-forwards from past mastery. ${phobiaCorr.birthmarkSignificance.en} ${phobiaCorr.phobiaKarmicOrigin.en} In this current incarnation: ${moksha.rahuCurrentLifeMission.en}.

4. Actionable Remedies & Karmic Liberation:
To dissolve pending karmic residues, recite ${remedies.sacredAtmaShantiMantra} daily and perform ${remedies.sacredGokarnaRemedy.en}. May Lord Mahabaleshwara of Gokarna bless your soul with liberation, mental serenity, and enduring fulfillment.`;
  };

  let aiNarrative: string | undefined = undefined;
  const activeKey = (geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (activeKey) {
    try {
      const summaryContext = `
================================================================
🕉️ BAGGONA HINDINA JANMA (PAST LIFE) SOUL BLUEPRINT
================================================================
1. Devotee: ${input.personName} (${input.gender})
2. Date of Birth: ${input.dob} (Place: ${input.birthPlace || "Gokarna"})
3. Sun Sign: ${sunSignStr}, Nakshatra: ${moonNakStr}
4. Past Life Era: ${persona.eraAndTimeline.en} (${persona.geographicalRealm.en})
5. Past Life Vocation: ${persona.socialStatusAndVocation.en} (Governing Planet: ${persona.dominantGraha})
6. Sanchita Punya Ratio: ${karma.sanchitaPunyaPercentage}% Punya, ${karma.sanchitaPaapaPercentage}% Paapa
7. Dominant Karmic Debt: ${karma.dominantKarmicDebt.en}
8. Karmic Blessing: ${karma.karmicCurseOrBlessing.en}
9. Inherited Talents: ${boons.inheritedTalents.en.join(", ")}
10. Deja-Vu Triggers: ${boons.dejaVuTriggers.en.join(", ")}
11. Birthmark Location: ${input.birthMarkLocation || "none"} -> ${phobiaCorr.birthmarkSignificance.en}
12. Inexplicable Phobia: ${input.inexplicablePhobia || "none"} -> ${phobiaCorr.phobiaKarmicOrigin.en}
13. Rahu-Ketu Evolution Stage: ${moksha.d60SoulEvolutionStage.en} (${moksha.soulMaturityLevel.en})
14. Current Life Soul Mission: ${moksha.rahuCurrentLifeMission.en}
15. Sacred Gokarna Remedy: ${remedies.sacredGokarnaRemedy.en}
16. Devotee's Custom Question: "${input.customQuestion || "None specified"}"
================================================================
`;

      const prompt = `You are the authentic Baggona Hindina Janma (Past Life & Karmic Oracle) from Gokarna Mahabaleshwara Kshetra.
Deliver a 100% technical, deep, accurate, realistic, and up-to-point consultation.

MANDATORY RULES & CONSTRAINTS:
1. STRICTLY NO INTRODUCTORY GREETINGS, NO PREAMBLE, NO PLEASANTRIES ("ನಮಸ್ಕಾರ...", "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪಂಡಿತ್...", "Chief Priest...", etc.). START IMMEDIATELY WITH THE DIAGNOSIS.
2. NO GENERIC FLUFF, NO HALLUCINATIONS, NO BLUFFING. Give precise, realistic, up-to-point details.
3. If the devotee provided a specific question ("${input.customQuestion || ""}"), PARAGRAPH 1 MUST ADDRESS AND DIAGNOSE THAT EXACT QUESTION DIRECTLY IN THE OPENING SENTENCE.
4. Structure the response into EXACTLY 4 comprehensive, detailed paragraphs (5–6 lines each) in ${input.lang === "kn" ? "pure Kannada (ಕನ್ನಡ)" : input.lang === "hi" ? "Hindi (हिंदी)" : input.lang === "te" ? "Telugu (తెలుగు)" : input.lang === "ta" ? "Tamil (தமிழ்)" : "English"}:
   - Paragraph 1: Direct situational & karmic diagnosis of the devotee's query (${input.customQuestion || "Past life karmic carryover"}).
   - Paragraph 2: Past life persona, historical era (${persona.eraAndTimeline.en}), geographical realm (${persona.geographicalRealm.en}), vocation, and Sanchita Karma balance (${karma.sanchitaPunyaPercentage}% Punya).
   - Paragraph 3: Inherited talents, birthmark/phobia karmic origins, and current life soul mission (${moksha.rahuCurrentLifeMission.en}).
   - Paragraph 4: Practical remedies, sacred Shiva stotra, Gokarna Mahabaleshwara blessings, and karmic resolution timeline.`;

      const aiResponse = await askGemini(summaryContext, prompt, activeKey, input.lang, {
        temperature: 0.3
      });

      aiNarrative = aiResponse || buildDeterministicNarrative();
    } catch {
      aiNarrative = buildDeterministicNarrative();
    }
  } else {
    aiNarrative = buildDeterministicNarrative();
  }

  return {
    input,
    sunSign: sunSignStr,
    moonNakshatra: moonNakStr,
    pastLifePersona: persona,
    karmaAnalysis: karma,
    innateBoons: boons,
    phobiaCorrelation: phobiaCorr,
    mokshaAxis: moksha,
    remedies,
    aiNarrative,
    generatedAt: new Date().toISOString()
  };
}
