import { askGemini } from "../../core/GeminiEngine";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";
import type {
  HindinaJanmaInput,
  HindinaJanmaResult,
  PastLifePersona,
  SanchitaKarmaAnalysis,
  InnateBoonsAndTalents,
  PhobiaAndBirthmarkCorrelation,
  RahuKetuMokshaAxis,
  KarmicRemediesAndGokarnaShanti
} from "./hindinaJanmaTypes";

export function computePastLifePersona(
  sunSignNum: number,
  nakshatraIndex: number,
  input: HindinaJanmaInput
): PastLifePersona {
  const personas: PastLifePersona[] = [
    {
      eraAndTimeline: {
        kn: "೧೫ನೇ ಶತಮಾನ — ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ಸ್ವರ್ಣ ಯುಗ (ಹಂಪಿ/ದಕ್ಷಿಣ ಭಾರತ)",
        en: "15th Century — Golden Era of Vijayanagara Empire (Hampi, South India)",
        hi: "15वीं शताब्दी — विजयनगर साम्राज्य का स्वर्ण युग",
        te: "15వ శతాబ్దం — విజయనగర సామ్రాజ్య స్వర్ణ యుగం",
        ta: "15ம் நூற்றாண்டு — விஜயநகர பேரரசின் பொற்காலம்"
      },
      geographicalRealm: {
        kn: "ದಕ್ಷಿಣ ಭಾರತದ ಪವಿತ್ರ ತುಂಗಭದ್ರಾ ನದಿ ತೀರ & ದೇವಾಲಯ ನಗರ",
        en: "Sacred Riverbank of Tungabhadra & Temple City of South India",
        hi: "दक्षिण भारत की पावन तुंगभद्रा नदी तट एवं मंदिर नगरी",
        te: "దక్షిణ భారత పవిత్ర తుంగభద్ర నదీ తీరం",
        ta: "தென்னிந்தியாவின் துங்கபத்ரா நதிக்கரை & கோவில் நகரம்"
      },
      genderInPastLife: { kn: "ಪುರುಷ (ವಿದ್ವಾಂಸ/ಮಂತ್ರಿ)", en: "Male (Royal Scholar/Minister)", hi: "पुरुष (विद्वान/मंत्री)", te: "పురుషుడు (విద్వాంసుడు)", ta: "ஆண் (அரசு அறிஞர்)" },
      socialStatusAndVocation: {
        kn: "ರಾಜಾಶ್ರಯದಲ್ಲಿದ್ದ ಧರ್ಮಶಾಸ್ತ್ರಜ್ಞ & ದೇವಾಲಯ ಶಿಲ್ಪಕಲಾ ಸಂಯೋಜಕ",
        en: "Royal Dharma Counselor & Sacred Temple Architecture Patron",
        hi: "राज्याश्रित धर्मशास्त्री एवं देवालय स्थापत्य संरक्षक",
        te: "రాజాస్థాన ధర్మశాస్త్రవేత్త & ఆలయ శిల్పకళా పోషకుడు",
        ta: "ராஜ சபையின் தர்மசாஸ்திர அறிஞர் & கோவில் சிற்பகலா புரவலர்"
      },
      dominantGraha: "Guru (ಬೃಹಸ್ಪತಿ)",
      personalitySummary: {
        kn: "ನೀವು ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಗಂಭೀರ ಜ್ಞಾನ, ನ್ಯಾಯಪರತೆ ಮತ್ತು ಸಮಾಜಕ್ಕೆ ವೇದಜ್ಞ ಮಾರ್ಗದರ್ಶನ ನೀಡಿದ ಸದ್ಗುಣಿ ವ್ಯಕ್ತಿಯಾಗಿದ್ದಿರಿ. ನಿಮ್ಮ ನಿರ್ಧಾರಗಳು ಅನೇಕ ಕುಟುಂಬಗಳಿಗೆ ರಕ್ಷಣೆಯಾಗಿದ್ದವು.",
        en: "In your previous life, you were an upright scholar and ethical counselor whose wisdom guided royal courts and protected countless families.",
        hi: "पूर्व जन्म में आप अत्यंत ज्ञानी, न्यायप्रिय एवं धर्मनिष्ठ परामर्शदाता थे, जिनके निर्णयों से अनेक परिवारों का कल्याण हुआ।",
        te: "పూర్వ జన్మలో మీరు గొప్ప విద్వాంసులు మరియు న్యాయ మార్గదర్శకులుగా విశేష సేవలందించారు.",
        ta: "முன் ஜென்மத்தில் நீங்கள் பேரறிஞராகவும், தர்ம நெறி தவறாத ஆலோசகராகவும் திகழ்ந்தீர்கள்."
      }
    },
    {
      eraAndTimeline: {
        kn: "೧೨ನೇ ಶತಮಾನ — ಚೋಳ ಸಾಮ್ರಾಜ್ಯದ ಸಾಗರ ವ್ಯಾಪಾರ & ಬೃಹದೀಶ್ವರ ಕಾಲಮಾನ",
        en: "12th Century — Chola Maritime Trade & Temple Patronage Era",
        hi: "12वीं शताब्दी — चोल कालीन सामुद्रिक व्यापार एवं कला युग",
        te: "12వ శతాబ్దం — చోళుల సముద్ర వ్యాపార యుగం",
        ta: "12ம் நூற்றாண்டு — சோழப் பேரரசின் கடல் வாணிபக் காலம்"
      },
      geographicalRealm: {
        kn: "ಕಾವೇರಿ ಮುಖಜ ಭೂಮಿ & ಪ್ರಾಚೀನ ಸಮುದ್ರ ಬಂದರು (ನಾಗಪಟ್ಟಣ)",
        en: "Kaveri Delta & Ancient Maritime Port (Nagapattinam)",
        hi: "कावेरी डेल्टा एवं प्राचीन समुद्री बंदरगाह",
        te: "కావేరి డెల్టా & ప్రాచీన సముద్ర రేవు",
        ta: "காவேரி டெல்டா & நாகப்பட்டினம் கடல் துறைமுகம்"
      },
      genderInPastLife: { kn: "ಪುರುಷ (ಶ್ರೇಷ್ಠ ಸಾರ್ಥವಾಹ)", en: "Male (Naval Merchant/Philanthropist)", hi: "पुरुष (श्रेष्ठ श्रेष्ठी/व्यापारी)", te: "పురుషుడు (శ్రేష్ఠ వర్తకుడు)", ta: "ஆண் (பெரு வணிகர்)" },
      socialStatusAndVocation: {
        kn: "ಸಾಗರೋತ್ತರ ಧರ್ಮ ನಿಷ್ಠ ವರ್ತಕ & ಅನ್ನದಾನ ಛತ್ರಗಳ ಸ್ಥಾಪಕ",
        en: "Maritime Merchant & Founder of Public Anna-Dana Annachatras",
        hi: "सामुद्रिक व्यापारी एवं महा अन्नदान सत्रागारों के संस्थापक",
        te: "సముద్ర వర్తకుడు & అన్నదాన సత్రాల నిర్మాత",
        ta: "கடல் வணிகர் & அன்னதான சத்திரங்களை நிறுவியவர்"
      },
      dominantGraha: "Budha & Shukra (ಬುಧ-ಶುಕ್ರ)",
      personalitySummary: {
        kn: "ವ್ಯಾಪಾರದಲ್ಲಿ ನೈತಿಕ ಪ್ರಾಮಾಣಿಕತೆ ಮೆರೆದು, ಗಳಿಸಿದ ಸಂಪತ್ತಿನ ಬಹುಪಾಲನ್ನು ಬಡವರ ಅನ್ನದಾನ ಹಾಗೂ ಯಾತ್ರಿಕರ ಛತ್ರಗಳಿಗೆ ಧಾರೆ ಎರೆದ ಮಹಾದಾನಿಯಾಗಿದ್ದಿರಿ.",
        en: "You operated with immaculate integrity in vast mercantile ventures, dedicating the majority of wealth to mass food charity and pilgrim shelters.",
        hi: "व्यापार में परम शुचिता रखते हुए अपनी विपुल संपदा का अधिकांश भाग अन्नदान एवं तीर्थयात्रियों की सेवा में अर्पित किया।",
        te: "వ్యాపారంలో నిజాయితీగా ఉంటూ ఆర్జించిన సంపదను అన్నదానానికి ధారపోసిన మహనీయులు.",
        ta: "நேர்மையான வணிகம் செய்து, ஈட்டிய செல்வத்தை அன்னதானத்திற்கும் அறப்பணிகளுக்கும் வழங்கிய வள்ளல்."
      }
    },
    {
      eraAndTimeline: {
        kn: "೮ನೇ ಶತಮಾನ — ಹಿಮಾಲಯದ ಕೇದಾರ-ಬದರೀ ತಪೋಭೂಮಿ ಕಾಲ",
        en: "8th Century — Himalayan Kedarnath-Badrinath Hermitage Era",
        hi: "8वीं शताब्दी — हिमालयी केदार-बद्री तपोभूमि युग",
        te: "8వ శతాబ్దం — హిమాలయ కేదార-బదరీ ತಪೋಭೂಮಿ ಕಾಲಂ",
        ta: "8ம் நூற்றாண்டு — இமயமலை கேதார்-பத்ரி தவக்காலம்"
      },
      geographicalRealm: {
        kn: "ಉತ್ತರ ಭಾರತದ ಗಂಗೋತ್ರಿ-ರುದ್ರಪ್ರಯಾಗ ಗಿರಿ ಕಂದರಗಳು",
        en: "Gangotri-Rudraprayag Valley, Sacred Upper Himalayas",
        hi: "गंगोत्री-रुद्रप्रयाग पर्वत घाटी, पावन उच्च हिमालय",
        te: "గంగోత్రి-రుద్రప్రయాగ గిరి శ్రేణులు",
        ta: "கங்கோத்ரி-ருத்ரபிரயாக் இமயமலை பள்ளத்தாக்கு"
      },
      genderInPastLife: { kn: "ಯೋಗಿ / ತಪಸ್ವಿ", en: "Yogi / Ascetic", hi: "योगी / संन्यासी", te: "యోగి / తపస్వి", ta: "யோகி / தவமுனிவர்" },
      socialStatusAndVocation: {
        kn: "ಶಿವ ತಪಸ್ವಿ, ಆಯುರ್ವೇದ ಮೂಲಿಕಾ ಸಂಶೋಧಕ & ಮಂತ್ರ ಸಾಧಕ",
        en: "Shiva Sadhaka, Himalayan Herb Healer & Mantra Mystic",
        hi: "शिव साधक, दिव्य जड़ी-बूटी वैद्य एवं मंत्र साधक",
        te: "శివ సాధకుడు, ఆయుర్వేద మూలికా వైద్యుడు",
        ta: "சிவ யோகி, மூலிகை சித்தர் & மந்திர சாதகர்"
      },
      dominantGraha: "Ketu & Surya (ಕೇತು-ಸೂರ್ಯ)",
      personalitySummary: {
        kn: "ಪ್ರಕೃತಿಯ ಏಕಾಂತದಲ್ಲಿ ತಪಸ್ಸು ಮಾಡುತ್ತಾ, ದಾರಿತಪ್ಪಿದ ಯಾತ್ರಿಕರಿಗೆ ಮತ್ತು ರೋಗಿಗಳಿಗೆ ದೈವಿಕ ಸಂಜೀವಿನಿ ಮೂಲಿಕೆಗಳಿಂದ ಜೀವದಾನ ಮಾಡಿದ ಪುಣ್ಯಜೀವಿಯಾಗಿದ್ದಿರಿ.",
        en: "Living in meditative solitude, you healed weary pilgrims with sacred herbs and mastered profound mantra sadhana.",
        hi: "एकांत साधना में रत रहकर असहाय यात्रियों एवं रोगियों को दिव्य संजीवनी औषधियों से नवजीवन प्रदान करने वाले पुण्यात्मा थे।",
        te: "ఏకాంతంలో తపస్సు చేస్తూ దైవిక మూలికలతో ఎందరో రోగులను కాపాడిన పుణ్యాత్ముడు.",
        ta: "ஏகாந்த தவத்தில் இருந்து, யாத்ரீகர்களுக்கு மூலிகைகளால் உயிர்ப்பிச்சை அளித்த புண்ணிய ஆன்மா."
      }
    },
    {
      eraAndTimeline: {
        kn: "೧೭ನೇ ಶತಮಾನ — ರಾಜಸ್ಥಾನ / ಮರಾಠಾ ಸಾಮ್ರಾಜ್ಯದ ಧರ್ಮ ರಕ್ಷಣಾ ಯುಗ",
        en: "17th Century — Rajasthan / Maratha Dharma Defense Epoch",
        hi: "17वीं शताब्दी — राजस्थान / मराठा धर्म रक्षा युग",
        te: "17వ శతాబ్దం — ధర్మ రక్షణ పోరాట యుగం",
        ta: "17ம் நூற்றாண்டு — தர்ம ரக்ஷண வீர வரலாறு"
      },
      geographicalRealm: {
        kn: "ಪಶ್ಚಿಮ ಭಾರತದ ಕೋಟೆ-ಕೊತ್ತಲಗಳು & ಕಣಿವೆ ಪ್ರದೇಶ",
        en: "Fortresses & Rugged Valleys of Western India",
        hi: "दुर्ग एवं गिरि क्षेत्र, पश्चिमी भारत",
        te: "పశ్చిమ భారత చారిత్రక కోటల ప్రాంతం",
        ta: "மேற்கு இந்தியாவின் மலைக்கோட்டை பிரதேசம்"
      },
      genderInPastLife: { kn: "ಪುರುಷ / ವೀರ ಮಹಿಳೆ", en: "Warrior Leader / Commander", hi: "वीर सेनापति / धर्म रक्षक", te: "వీర సేనాపతి", ta: "தீர சேனாதிபதி" },
      socialStatusAndVocation: {
        kn: "ದೇವಾಲಯ & ಸಮಾಜ ರಕ್ಷಕ ಸೇನಾನಿ (Dharma Rakshaka)",
        en: "Protector of Temples & Valiant Knight of Dharma",
        hi: "मंदिर एवं समाज रक्षक शूरवीर सेनानी",
        te: "ఆలయాల సంరక్షకుడు & ధర్మ యోధుడు",
        ta: "கோவில் மற்றும் தர்மத்தை காத்த தீரப் படைத்தளபதி"
      },
      dominantGraha: "Mangala & Surya (ಮಂಗಳ-ಸೂರ್ಯ)",
      personalitySummary: {
        kn: "ಧರ್ಮ, ಗೋವು ಮತ್ತು ಅಸಹಾಯಕರ ರಕ್ಷಣೆಗಾಗಿ ನಿರ್ಭಯವಾಗಿ ನಿಂತ ಸಾಹಸಿ ಆತ್ಮ. ನಿಮ್ಮ ಧೀರತೆಯು ಇಂದಿಗೂ ನಿಮ್ಮಲ್ಲಿ ನಾಯಕತ್ವದ ಗುಣವಾಗಿ ಉಳಿದಿದೆ.",
        en: "A fearless warrior who defended shrines and the helpless, leaving an enduring legacy of courage and leadership in your soul.",
        hi: "धर्म, गौ रक्षा एवं दुर्बलों की रक्षा हेतु प्राणपण से समर्पित शूरवीर, जिनका अदम्य साहस आज भी आपकी आत्मा में विद्यमान है।",
        te: "ధర్మ రక్షణ కోసం పోరాడిన మహా యోధుడు, ఆ నాయకత్వ గుణం ఇప్పటికీ మీలో ప్రకాశిస్తోంది.",
        ta: "தர்மத்தைக் காக்க வீரத்துடன் போரிட்டவர், அந்த தலைமைப்பண்பு இன்றும் உங்களிடம் மிளிர்கிறது."
      }
    }
  ];

  const idx = (sunSignNum + nakshatraIndex) % personas.length;
  return personas[idx];
}

export function computeSanchitaKarma(
  nakshatraIndex: number,
  tithiNum: number
): SanchitaKarmaAnalysis {
  const basePunya = 70 + ((nakshatraIndex * 7 + tithiNum * 3) % 25);
  const basePaapa = 100 - basePunya;

  const debts = [
    {
      kn: "ದೇವ ಋಣ (ದೇವಾಲಯ ಸಂಕಲ್ಪ ಪೂರ್ಣಗೊಳಿಸಬೇಕಾದ ಸಾಫಲ್ಯ)",
      en: "Deva Rina (Fulfilling incomplete temple vows / spiritual service)",
      hi: "देव ऋण (अपूर्ण देव संकल्प एवं सेवा)",
      te: "దేవ ఋణం (అసంపూర్ణ ఆలయ సేవా సంకల్పం)",
      ta: "தேவ கடன் (முடிக்க வேண்டிய ஆன்மீக சங்கல்பம்)"
    },
    {
      kn: "ಪಿತೃ ಋಣ (ವಂಶೋದ್ಧಾರ ಹಾಗೂ ಪಿತೃ ತರ್ಪಣ ಕರ್ತವ್ಯ)",
      en: "Pitru Rina (Ancestral upliftment & lineage blessings)",
      hi: "पितृ ऋण (वंशोद्धार एवं पितृ तर्पण कर्तव्य)",
      te: "పితృ ఋణం (వంశాభివృద్ధి & పితృ తర్పణ బాధ్యత)",
      ta: "பித்ரு கடன் (வம்சவிருத்தி & தர்ப்பண கடமை)"
    },
    {
      kn: "ಗುರು ಋಣ (ಜ್ಞಾನ ಪ್ರಸಾರ & ಜ್ಞಾನೋಪದೇಶ ಕರ್ತವ್ಯ)",
      en: "Guru Rina (Disseminating sacred wisdom & mentoring seekers)",
      hi: "गुरु ऋण (ज्ञान प्रसार एवं शिष्यों का मार्गदर्शन)",
      te: "గురు ఋణం (జ్ఞాన ప్రచారం & మార్గదర్శకత్వం)",
      ta: "குரு கடன் (ஞான போதனை & வழிகாட்டல்)"
    },
    {
      kn: "ಮನುಷ್ಯ ಋಣ (ಸಹಜೀವಿಗಳ ಕಷ್ಟಕ್ಕೆ ಸ್ಪಂದಿಸುವ ಸೇವಾ ಸಂಕಲ್ಪ)",
      en: "Manushya Rina (Humanitarian charity & supporting needy)",
      hi: "मनुष्य ऋण (परोपकार एवं असहायों की सहायता)",
      te: "మనుష్య ఋణం (సమాజ సేవ & పరోపకారం)",
      ta: "மனுஷ கடன் (சமூக சேவை & அன்னதானம்)"
    }
  ];

  const desires = [
    {
      kn: "ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ & ತೀರ್ಥಯಾತ್ರೆಯ ಪರಮ ಸಾಕ್ಷಾತ್ಕಾರ ಪೂರ್ಣಗೊಳಿಸುವುದು",
      en: "Achieving total spiritual enlightenment and completing holy pilgrimages",
      hi: "आध्यात्मिक सिद्धि एवं तीर्थ यात्राओं का पूर्ण फल प्राप्त करना",
      te: "ఆధ్యాత్మిక సిద్ధి & తీర్థయాత్రల సంపూర్ణత",
      ta: "ஆன்மீக சித்தி & தீர்த்த யாத்திரை நிறைவு"
    },
    {
      kn: "ಪರರ ಕಷ್ಟಕ್ಕೆ ಶಾಶ್ವತ ಆಸರೆಯಾಗಿ ಸಮಾಜದಲ್ಲಿ ಸತ್ಕೀರ್ತಿ ನೆಲೆಸಿಸುವುದು",
      en: "Creating enduring institutions of charity and serving humanity",
      hi: "सदाचार एवं परोपकार की अमर कीर्ति स्थापित करना",
      te: "సమాజానికి శాశ్వత మేలు చేసే సేవా మార్గం",
      ta: "சமூகத்தில் அழியாத தர்ம நற்காரியங்களை நிலைநாட்டுதல்"
    },
    {
      kn: "ಕುಟುಂಬದ ಪರಂಪರೆಯನ್ನು ಉತ್ತುಂಗಕ್ಕೆ ಕೊಂಡೊಯ್ಯುವುದು",
      en: "Elevating family lineage to highest honor and cultural glory",
      hi: "पारिवारिक कुल परंपरा को सर्वोच्च गौरव प्रदान करना",
      te: "కుటుంబ వంశాన్ని ఉన్నత శిఖరాలకు చేర్చడం",
      ta: "குடும்ப பரம்பரையை உச்ச புகழுக்கு கொண்டு செல்லுதல்"
    }
  ];

  const blessings = [
    {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ & ಗುರು ಕೃಪೆಯ ದಿವ್ಯ ರಕ್ಷಾ ಕವಚ (Guru Anugraha)",
      en: "Divine Grace of Lord Mahabaleshwara & Guru's Protective Shield",
      hi: "श्री महाबलेश्वर एवं गुरु कृपा का दिव्य रक्षा कवच",
      te: "శ్రీ మహాబలేశ్వర & గురు కృపా రక్షా కవచం",
      ta: "ஸ்ரீ மகாபலேஸ்வரர் & குரு அருளின் திவ்ய ரக்ஷை"
    },
    {
      kn: "ಪೂರ್ವ ಪುಣ್ಯ ಫಲ: ಸಂಕಷ್ಟದ ವೇಳೆಯಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ದೈವಿಕ ರಕ್ಷಣೆ",
      en: "Poorva Punya: Miraculous divine rescue during critical life crises",
      hi: "पूर्व पुण्य फल: विपत्ति के समय अप्रत्याशित ईश्वरीय सहायता",
      te: "పూర్వ పుణ్య ఫలం: ఆపదలో అద్భుత దైవ రక్షణ",
      ta: "பூர்வ புண்ணியம்: இக்கட்டான சூழலில் எதிர்பாராத தெய்வ உதவி"
    }
  ];

  const dIdx = nakshatraIndex % debts.length;
  const desIdx = (nakshatraIndex + tithiNum) % desires.length;
  const bIdx = nakshatraIndex % blessings.length;

  return {
    sanchitaPunyaPercentage: basePunya,
    sanchitaPaapaPercentage: basePaapa,
    dominantKarmicDebt: debts[dIdx],
    pastLifeUnfinishedDesire: desires[desIdx],
    karmicCurseOrBlessing: blessings[bIdx]
  };
}

export function computeInnateBoons(
  sunSignNum: number,
  affinity?: string
): InnateBoonsAndTalents {
  const talentsMap: Record<string, string[]> = {
    kn: [
      "ತಕ್ಷಣವೇ ಸರಿ-ತಪ್ಪುಗಳನ್ನು ಗ್ರಹಿಸುವ ದಿವ್ಯ ಅಂತಃಪ್ರಜ್ಞೆ (Sharp Intuition)",
      "ಆಧ್ಯಾತ್ಮಿಕ & ಪುರಾತನ ಸಂಸ್ಕೃತಿಯ ಕಡೆಗೆ ಸಹಜ ಆಕರ್ಷಣೆ",
      "ಕಷ್ಟದಲ್ಲಿರುವವರ ಮನಸ್ಸನ್ನು ಸಾಂತ್ವನಗೊಳಿಸುವ ವಾಕ್ ಸಾಮರ್ಥ್ಯ",
      "ಹಣಕಾಸು & ನಿರ್ವಹಣೆಯಲ್ಲಿ ಅಪ್ರಯತ್ನಪೂರ್ವಕ ಕೌಶಲ್ಯ"
    ],
    en: [
      "Profound intuitive insight into human intentions and truth",
      "Spontaneous resonance with sacred temple architecture and ancient texts",
      "Innate gift of healing speech and comforting distressed souls",
      "Effortless natural aptitude for strategic stewardship and leadership"
    ],
    hi: [
      "सत्य और असत्य को तुरंत भांपने की तीव्र अंतर्दृष्टि",
      "प्राचीन संस्कृति एवं धर्मग्रंथों के प्रति स्वाभाविक आकर्षण",
      "व्यथित जनों को सांत्वना देने की प्रभावशाली वाक-शक्ति",
      "प्रबंधन एवं नेतृत्व की जन्मजात क्षमता"
    ],
    te: [
      "తీవ్రమైన అంతర్దృష్టి మరియు సత్యాన్వేషణ",
      "పురాతన సంస్కృతి మరియు ఆలయాల పట్ల సహజ ఆకర్షణ",
      "బాధలో ఉన్నవారిని ఓదార్చే వాక్ శక్తి",
      "సహజ నాయకత్వ పటిమ"
    ],
    ta: [
      "சரியானதை உடனடியாக உணரும் உள்ளுணர்வு ஆற்றல்",
      "பண்டைய கோவில் கலைகள் மற்றும் ஆன்மீக ஈர்ப்பு",
      "துன்பத்தில் உள்ளவர்களுக்கு ஆறுதல் அளிக்கும் வாக்கு வன்மை",
      "இயற்கையான தலைமைத்துவப் பண்பு"
    ]
  };

  const dejaVuList: Record<string, string[]> = {
    kn: [
      "ಪುರಾತನ ದೇವಾಲಯಗಳನ್ನು ಕಂಡಾಗ 'ನಾನು ಇಲ್ಲೇ ಮೊದಲೇ ಇದ್ದೆ' ಎಂಬ ತೀವ್ರ ಅನುಭವ",
      "ಕೆಲವು ಅಪರಿಚಿತ ವ್ಯಕ್ತಿಗಳನ್ನು ಭೇಟಿಯಾದಾಗ ಮೊದಲೇ ಆಪ್ತತೆಯ ಭಾವ ಮೂಡುವುದು",
      "ಮಳೆಯ ತಂಪಾದ ಸುಳಿಗಾಳಿ ಅಥವಾ ಮಂತ್ರ ಧ್ವನಿ ಕೇಳಿದಾಗ ಕಣ್ಣೀರು ಬರುವುದು"
    ],
    en: [
      "Sudden intense conviction of 'I have walked these stone corridors before' upon visiting ancient shrines",
      "Instant, unexplainable familiarity and soul bond when meeting certain strangers",
      "Involuntary emotional tears when hearing Vedic chants or smelling monsoon earth"
    ],
    hi: [
      "प्राचीन देवालयों में जाने पर 'मैं यहाँ पहले भी आ चुका हूँ' की तीव्र प्रतीति",
      "कुछ अपरिचित व्यक्तियों से प्रथम भेंट में ही पूर्व परिचय का गहरा भान",
      "वेद मंत्रों की ध्वनि सुनकर अनायास नयनों से भावाश्रु बहना"
    ],
    te: [
      "ప్రాచీన దేవాలయాలను చూసినప్పుడు పూర్వ పరిచయ భావన",
      "కొంతమంది అపరిచితులను కలిసినప్పుడు గాఢమైన ఆత్మీయత",
      "వేద మంత్రాలు విన్నప్పుడు హృదయం ద్రవించడం"
    ],
    ta: [
      "பண்டைய கோவில்களுக்கு செல்லும் போது 'நான் முன்பே இங்கு வந்திருக்கிறேன்' என்ற உணர்வு",
      "சில புதிய நபர்களை சந்திக்கும் போது ஏற்படும் தீவிர ஆத்மார்த்த பந்தம்",
      "வேத கோஷங்களை கேட்கும் போது நெகிழ்ச்சி அடைதல்"
    ]
  };

  const deityAffinityMap: Record<string, string> = {
    kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ (ಪರಮಶಿವ) & ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ (ಆತ್ಮಲಿಂಗದ ಅನುಗ್ರಹ)",
    en: "Lord Mahabaleshwara (Shiva) & Sri Mahalakshmi (Grace of Atmalinga)",
    hi: "भगवान महाबलेश्वर (शिव) एवं श्री महालक्ष्मी",
    te: "శ్రీ మహాబలేశ్వరుడు (శివుడు) & శ్రీ మహాలక్ష్మి",
    ta: "ஸ்ரீ மகாபலேஸ்வரர் & ஸ்ரீ மகாலக்ஷ்மி"
  };

  return {
    inheritedTalents: talentsMap,
    intuitiveInstincts: {
      kn: "ನಿಮ್ಮ ಆತ್ಮವು ಹಿಂದಿನ ಜನ್ಮದಿಂದಲೇ ಆಳವಾದ ವಿವೇಕವನ್ನು ಹೊತ್ತು ತಂದಿದೆ. ಯಾವುದೇ ಗೊಂದಲ ಬಂದಾಗ ನಿಮ್ಮ ಮೊದಲ ಒಳದನಿ (First Intuition) ಎಂದಿಗೂ ತಪ್ಪಾಗುವುದಿಲ್ಲ.",
      en: "Your soul carries deep wisdom across lifetimes. In critical moments, your initial intuitive gut feeling is unfailingly accurate.",
      hi: "आपकी आत्मा पूर्व जन्म से ही गूढ़ विवेक साथ लाई है। संकट के समय आपकी पहली आंतरिक ध्वनि सदैव सटीक मार्ग दिखाती है।",
      te: "మీ ఆత్మ పూర్వ జన్మల నుండే గొప్ప జ్ఞానాన్ని తెచ్చుకుంది. మీ అంతర్వాణి ఎల్లప్పుడూ సరైనదే చెబుతుంది.",
      ta: "உங்கள் ஆன்மா ஆழ்ந்த ஞானத்தை சுமந்து வந்துள்ளது. இக்கட்டான வேளையில் உங்கள் உள்ளுணர்வு தவறாது வழிகாட்டும்."
    },
    sacredDeityAffinity: deityAffinityMap,
    dejaVuTriggers: dejaVuList
  };
}

export function computePhobiaAndBirthmark(
  markLoc?: string,
  phobia?: string
): PhobiaAndBirthmarkCorrelation {
  const markDetails: Record<string, Record<string, string>> = {
    head_face: {
      kn: "ಶಿರಸ್ಸು/ಮುಖದ ಮೇಲಿನ ಮಚ್ಚೆಯು ಹಿಂದಿನ ಜನ್ಮದ ತೇಜಸ್ವಿ ಆಜ್ಞಾಚಕ್ರ ಸಾಧನೆ ಅಥವಾ ಗೌರವಯುತ ಯುದ್ಧದ ಗುರುತನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
      en: "A birthmark on head/face indicates mastery of Ajna chakra meditation or an honorable mark from past leadership/defense.",
      hi: "मस्तक/मुख पर तिल पूर्व जन्म की आज्ञा चक्र साधना अथवा शौर्यपूर्ण सम्मान का प्रतीक है।",
      te: "శిరస్సు/ముఖంపై మచ్చ పూర్వ జన్మ తపో సాధనకు లేదా వీరత్వానికి చిహ్నం.",
      ta: "தலை/முகத்தில் உள்ள மச்சம் முன் ஜென்ம தவ ஆற்றலின் அடையாளம்."
    },
    neck_chest: {
      kn: "ಕಂಠ/ಎದೆಯ ಮೇಲಿನ ಮಚ್ಚೆಯು ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಉನ್ನತ ಕಂಠೋಕ್ತ ಮಂತ್ರ ಸಿದ್ಧಿ ಅಥವಾ ಹೃದಯಪೂರ್ವಕ ದಾನ ಶೀಲತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
      en: "A birthmark on neck/chest signifies sacred Vedic vocal resonance or unconditional emotional generosity in past life.",
      hi: "कंठ/वक्ष पर तिल पूर्व जन्म की मंत्र सिद्धि अथवा अगाध हृदय दानशीलता का संकेत है।",
      te: "కంఠం/ఛాతీపై మచ్చ పూర్వ జన్మ మంత్ర సిద్ధికి మరియు దాన గుణానికి ప్రతీక.",
      ta: "கழுத்து/மார்பில் உள்ள மச்சம் முன் ஜென்ம தாராள மனப்பான்மையின் அடையாளம்."
    },
    hands_arms: {
      kn: "ಹಸ್ತ/ತೋಳುಗಳ ಮೇಲಿನ ಮಚ್ಚೆಯು ಹಸ್ತಸಾಮುದ್ರಿಕ ಕೌಶಲ್ಯ, ದೇವಾಲಯ ಶಿಲ್ಪಕಲೆ ಅಥವಾ ಸ್ವಹಸ್ತದಿಂದ ಮಾಡಿದ ಲಕ್ಷಾಂತರ ಅನ್ನದಾನವನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
      en: "A birthmark on hands/arms reflects master craftsmanship, temple artistry, or boundless charity distributed by your own hands.",
      hi: "हस्त/भुजाओं पर तिल पूर्व जन्म के हस्तशिल्प, देवालय निर्माण अथवा निरंतर हस्तदान का परिचायक है।",
      te: "చేతులపై మచ్చ పూర్వ జన్మ శిల్పకళ లేదా నిరంతర అన్నదాన హస్తానికి గుర్తు.",
      ta: "கைகளில் உள்ள மச்சம் முன் ஜென்ம தான தர்ம கைங்கர்யத்தின் அடையாளம்."
    },
    default: {
      kn: "ದೇಹದ ಮಚ್ಚೆಗಳು ಹಿಂದಿನ ಜನ್ಮದ ಸಂಸ್ಕಾರಗಳು ಸೂಕ್ಷ್ಮ ಶರೀರದಿಂದ ಸ್ಥೂಲ ಶರೀರಕ್ಕೆ ತಂದಿರುವ ದೈವಿಕ ಮುದ್ರೆಗಳಾಗಿವೆ.",
      en: "Your natural birthmarks represent subtle energetic seals transferred from past soul vessels to this physical incarnation.",
      hi: "शरीर के प्राकृतिक लक्षण पूर्व जन्म के संस्कारों की सूक्ष्म देह से स्थूल देह में अवतरित दिव्य मुहरें हैं।",
      te: "శరీర ముద్రలు పూర్వ జన్మ సంస్కారాల దైవిక చిహ్నాలు.",
      ta: "உடலில் உள்ள மச்சங்கள் முன் ஜென்ம புண்ணிய முத்திரைகள்."
    }
  };

  const phobiaDetails: Record<string, Record<string, string>> = {
    water_drowning: {
      kn: "ಜಲ ಭಯವು ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಸಾಗರ ಪಯಣ, ನದಿಯ ಪ್ರವಾಹ ಅಥವಾ ಜಲ ತತ್ವದ ಮೂಲಕ ಶಾಂತಿಯುತವಾಗಿ ದೇಹತ್ಯಾಗ ಮಾಡಿದ ಸ್ಮೃತಿಯಾಗಿದೆ.",
      en: "Water apprehension stems from past life oceanic voyages, sacred river immersion, or transition through the water element.",
      hi: "जल भय पूर्व जन्म में समुद्री यात्रा, नदी प्रवाह अथवा जल तत्व द्वारा शांतिपूर्ण देह त्याग की अवचेतन स्मृति है।",
      te: "నీటి భయం పూర్వ జన్మలో సముద్ర ప్రయాణం లేదా జల సమాధికి సంబంధించిన జ్ఞాపకం.",
      ta: "நீர் பயம் முன் ஜென்ம கடல் பயணம் அல்லது நீர் வழியே உடலை நீத்ததன் நினைவு."
    },
    heights_fall: {
      kn: "ಎತ್ತರದ ಭಯವು ಗಿರಿ ಶಿಖರಗಳಲ್ಲಿ ತಪಸ್ಸು ಅಥವಾ ಎತ್ತರದ ಕೋಟೆಯ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದ ತೀವ್ರ ಜಾಗರೂಕತೆಯ ಸಂಸ್ಕಾರದಿಂದ ಬಂದಿದೆ.",
      en: "Fear of heights reflects intense mountain cliff vigil or ancient fort defense instincts carried over.",
      hi: "ऊंचाई का भय पर्वतीय साधना अथवा उच्च दुर्ग रक्षा की तीक्ष्ण सजगता से उत्पन्न संस्कार है।",
      te: "ఎత్తు భయం పూర్వ జన్మ పర్వత తపస్సు లేదా కోట సంరక్షణ సంస్కారం.",
      ta: "உயர பயம் முன் ஜென்ம மலைத்தவ விழிப்புணர்வின் அடையாளம்."
    },
    fire_burns: {
      kn: "ಅಗ್ನಿ ಭಯವು ಹಿಂದಿನ ಜನ್ಮದ ಮಹಾ ಯಜ್ಞ ಕುಂಡದ ಸಮೀಪದ ತೀವ್ರ ತಪಸ್ಸು ಅಥವಾ ಅಗ್ನಿ ಪರೀಕ್ಷೆಯ ಪವಿತ್ರ ಸಂಸ್ಕಾರವಾಗಿದೆ.",
      en: "Aversion to fire connects to intense Maha Yajna fire offerings or sacred agni rites in previous lives.",
      hi: "अग्नि भय पूर्व जन्म के महायज्ञ अनुष्ठान अथवा पवित्र अग्नि साधना की स्मृति है।",
      te: "అగ్ని భయం పూర్వ జన్మ యజ్ఞ యాగాదుల పవిత్ర సంస్కారం.",
      ta: "நெருப்பு பயம் முன் ஜென்ம யாக சாலை தவ நினைவுகள்."
    },
    default: {
      kn: "ಬಾಲ್ಯದ ಅಕಾರಣ ಭಯಗಳು ಹಿಂದಿನ ಜನ್ಮದ ಕೊನೆಯ ಕ್ಷಣಗಳ ಅಂತಿಮ ಅರಿವಿನಿಂದ ಉಂಟಾಗಿದ್ದು, ಪ್ರಸ್ತುತ ಜನ್ಮದಲ್ಲಿ ಪ್ರಾರ್ಥನೆಯಿಂದ ನಿವಾರಣೆಯಾಗುತ್ತವೆ.",
      en: "Innate childhood aversions are echoes of the soul's previous transition, easily dissolved through sacred mantra japa.",
      hi: "बचपन के अकारण भय पूर्व जन्म के अंतिम क्षणों की चेतना की प्रतिध्वनि हैं, जो नित्य मंत्र जप से पूर्णतः शांत हो जाते हैं।",
      te: "చిన్ననాటి భయాలు పూర్వ జన్మ చివరి క్షణాల జ్ఞాపకాలు, మంత్ర జపంతో తొలగిపోతాయి.",
      ta: "சிறுவயது பயங்கள் முன் ஜென்ம நினைவுகள், மந்திர ஜபத்தால் சாந்தியடையும்."
    }
  };

  const markKey = markLoc && markDetails[markLoc] ? markLoc : "default";
  const phobiaKey = phobia && phobiaDetails[phobia] ? phobia : "default";

  return {
    birthmarkSignificance: markDetails[markKey],
    phobiaKarmicOrigin: phobiaDetails[phobiaKey],
    pastLifeTransitionType: {
      kn: "ಪವಿತ್ರ ತೀರ್ಥ ಸನ್ನಿಧಿಯಲ್ಲಿ ದೈವ ನಾಮಸ್ಮರಣೆಯೊಂದಿಗೆ ಸಂಭವಿಸಿದ ಗೌರವಾನ್ವಿತ ದೇಹತ್ಯಾಗ (Peaceful Spiritual Transition)",
      en: "Peaceful departure in the vicinity of sacred shrines while chanting the Divine Name",
      hi: "पावन तीर्थ क्षेत्र में प्रभु नाम स्मरण करते हुए परम शांतिपूर्ण देहोत्सर्ग",
      te: "పవిత్ర పుణ్యక్షేత్రంలో భగవన్నామ స్మరణతో జరిగిన ప్రశాంత దేహత్యాగం",
      ta: "புண்ணிய தீர்த்த சன்னதியில் நாமஸ்மரணையுடன் நிகழ்ந்த சாந்தமான முக்தி"
    }
  };
}

export function computeRahuKetuMokshaAxis(
  sunSignNum: number
): RahuKetuMokshaAxis {
  const axes = [
    {
      ketu: {
        kn: "ಕೇತು ೧೨/೮ನೇ ಭಾವ: ಹಿಂದಿನ ಜನ್ಮದಲ್ಲೇ ವೈರಾಗ್ಯ, ಧ್ಯಾನ ಹಾಗೂ ದಾನ ಧರ್ಮದ ಉತ್ತುಂಗ ಸಾಧನೆ ಮಾಡಿದ್ದೀರಿ.",
        en: "Ketu in Moksha Realm: You attained advanced mastery over detachment, solitude, and meditation in past lives.",
        hi: "केतु मोक्ष क्षेत्र: पूर्व जन्म में आपने वैराग्य, गहन ध्यान एवं दान की उच्च स्थिति प्राप्त कर ली थी।",
        te: "కేతు మోక్ష స్థానం: పూర్వ జన్మలో మీరు ధ్యాన సాధన మరియు దాన ధర్మాలలో సిద్ధులు.",
        ta: "கேது மோக்ஷ ஸ்தானம்: முன் ஜென்மத்தில் தியானம் மற்றும் தவத்தில் தேர்ச்சி பெற்றவர்."
      },
      rahu: {
        kn: "ರಾಹು ೨/೧೦ನೇ ಭಾವ: ಈ ಜನ್ಮದಲ್ಲಿ ಸಮಾಜದಲ್ಲಿ ನಾಯಕತ್ವ, ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆ ಹಾಗೂ ಕುಟುಂಬ ಪೋಷಣೆಯನ್ನು ಸಾಧಿಸುವುದು ನಿಮ್ಮ ಮುಖ್ಯ ಕರ್ತವ್ಯ.",
        en: "Rahu in Action/Wealth Realm: Your soul's mission in this lifetime is mastering righteous leadership, worldly stewardship, and family prosperity.",
        hi: "राहु कर्म/धन क्षेत्र: इस जन्म में समाज में नेतृत्व, आर्थिक सुदृढ़ता एवं परिवार का पोषण आपकी आत्मा का मुख्य लक्ष्य है।",
        te: "రాహు కర్మ స్థానం: ఈ జన్మలో నాయకత్వం మరియు కుటుంబ సంక్షేమం మీ కర్తవ్యం.",
        ta: "ராகு கர்ம ஸ்தானம்: இந்த ஜென்மத்தில் குடும்ப மேன்மை மற்றும் சமூக தலைமை உங்கள் லட்சியம்."
      }
    },
    {
      ketu: {
        kn: "ಕೇತು ೯/೫ನೇ ಭಾವ: ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ವೇದ ಶಾಸ್ತ್ರ, ಮಂತ್ರ ವಿದ್ಯೆ ಹಾಗೂ ತತ್ತ್ವಚಿಂತನೆಯಲ್ಲಿ ಅಗಾಧ ಪಾಂಡಿತ್ಯ ಗಳಿಸಿದ್ದೀರಿ.",
        en: "Ketu in Wisdom Realm: In past lives, you were an accomplished scholar of philosophy, mantra sciences, and scriptural truth.",
        hi: "केतु धर्म क्षेत्र: पूर्व जन्म में आपने वेद शास्त्र, मंत्र विद्या एवं दर्शन में अपार पांडित्य अर्जित किया था।",
        te: "కేతు ధర్మ స్థానం: పూర్వ జన్మలో వేద శాస్త్రాలు మరియు మంత్ర విద్యలలో గొప్ప ప్రావీణ్యం.",
        ta: "கேது தர்ம ஸ்தானம்: முன் ஜென்மத்தில் வேத சாஸ்திரம் மற்றும் மந்திர கலைகளில் மேதை."
      },
      rahu: {
        kn: "ರಾಹು ೩/೧೧ನೇ ಭಾವ: ಈ ಜನ್ಮದಲ್ಲಿ ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನ, ಸಂವಹನ, ವಿಸ್ತಾರವಾದ ಮಿತ್ರ ಬಳಗ ಹಾಗೂ ಸಾಮಾಜಿಕ ಪ್ರಭಾವ ಬೀರುವುದು ನಿಮ್ಮ ಕರ್ಮ ಪಥ.",
        en: "Rahu in Expansion Realm: In this life, mastering modern innovation, network outreach, and dynamic communications is your soul pathway.",
        hi: "राहु विस्तार क्षेत्र: इस जन्म में आधुनिक नवाचार, संचार कुशलता एवं विशाल जनसंपर्क द्वारा प्रभाव स्थापित करना आपका पथ है।",
        te: "రాహు లాభ స్థానం: ఈ జన్మలో ఆధునిక విద్య, సమాచార రంగంలో రాణించడం మీ లక్ష్యం.",
        ta: "ராகு லாப ஸ்தானம்: இந்த ஜென்மத்தில் நவீன அறிவியல் மற்றும் மக்கள் சேவையில் சிறந்து விளங்குதல்."
      }
    }
  ];

  const axis = axes[sunSignNum % axes.length];

  return {
    ketuPastLifeMastery: axis.ketu,
    rahuCurrentLifeMission: axis.rahu,
    d60SoulEvolutionStage: {
      kn: "ದೇವಗಣ / ಋಷಿ ಅಂಶ (ಉನ್ನತ ಆಧ್ಯಾತ್ಮಿಕ ಸಂಸ್ಕಾರ ಹೊಂದಿದ ವೃದ್ಧ ಆತ್ಮ)",
      en: "Deva Gana / Rishi Amsha (Evolved Old Soul with High Spiritual Imprint)",
      hi: "देवगण / ऋषि अंश (उच्च आध्यात्मिक संस्कारों से युक्त परिपक्व आत्मा)",
      te: "దేవగణం / ఋషి అంశ (ఉన్నత సంస్కారాలు కలిగిన పరిణత ఆత్మ)",
      ta: "தேவகணம் / ரிஷி அம்சம் (ஆன்மீக முதிர்ச்சி பெற்ற புனித ஆன்மா)"
    },
    soulMaturityLevel: {
      kn: "ವೃದ್ಧ ಆತ್ಮ — ೫ನೇ ಕಾಲಚಕ್ರ ಹಂತ (Old Soul - 5th Epoch)",
      en: "Old Soul — 5th Epoch of Karmic Mastery",
      hi: "प्रौढ़ आत्मा — 5वां कालचक्र चरण",
      te: "పరిణత ఆత్మ — 5వ కాలచక్ర దశ",
      ta: "முதிர்ந்த ஆன்மா — 5ம் காலச்சக்கர நிலை"
    }
  };
}

export function computeKarmicRemedies(): KarmicRemediesAndGokarnaShanti {
  return {
    sacredAtmaShantiMantra: "॥ ॐ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ · ॐ ನಮಃ ಶಿವಾಯ ॥",
    recommendedTilaAndDanaItems: {
      kn: [
        "ಕಪ್ಪು ಎಳ್ಳು (ತಿಲ) & ಗೋಧೂಳಿ ಮುಹೂರ್ತದಲ್ಲಿ ಗೋದಾನ / ಗೋಸೇವೆ",
        "ಬಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕ & ವಿದ್ಯಾ ದಾನ",
        "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ & ಬಿಲ್ವಾರ್ಚನೆ",
        "ಅಮಾವಾಸ್ಯೆಯಂದು ಹಸಿದವರಿಗೆ ಅನ್ನ ಸಂತರ್ಪಣೆ"
      ],
      en: [
        "Offering black sesame during sunset & feeding sacred cows (Go-Seva)",
        "Donating educational books and meals to deserving students",
        "Rudrabhishekam with sacred Bilva leaves at Gokarna Mahabaleshwara",
        "Anna-Dana (Food charity) on every Amavasya"
      ],
      hi: [
        "काले तिल का दान एवं गोधूलि वेला में गोसेवा",
        "निर्धन विद्यार्थियों को पुस्तक एवं विद्या दान",
        "गोकर्ण महाबलेश्वर में रुद्राभिषेक एवं बिल्वार्चन",
        "अमावस्या को भूखों को अन्नदान"
      ],
      te: [
        "నల్ల నువ్వుల దానం మరియు గోసేవ",
        "పేద విద్యార్థులకు విద్యా దానం",
        "గోకర్ణ మహాబలేశ్వరుడికి రుద్రాభిషేకం",
        "అమావాస్య రోజున అన్నదానం"
      ],
      ta: [
        "கருப்பு எள் தானம் மற்றும் கோபூஜை / பசு சேவை",
        "ஏழை மாணவர்களுக்கு கல்வி உதவி",
        "கோகர்ண மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் & வில்வார்ச்சனை",
        "அமாவாசை தோறும் அன்னதானம்"
      ]
    },
    sacredGokarnaRemedy: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗದ ಸ್ಪರ್ಶ ಪೂಜೆ ಹಾಗೂ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪಿತೃ ತರ್ಪಣ ನೆರವೇರಿಸುವುದರಿಂದ ಪೂರ್ವ ಜನ್ಮದ ಸಕಲ ಸಂಚಿತ ಕರ್ಮ ದೋಷಗಳು ಭಸ್ಮವಾಗಿ, ಆತ್ಮಕ್ಕೆ ಪರಮ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
      en: "Direct Sparsha Pooja of the sacred Atmalinga at Gokarna and Tarpana at Kotitirtha burns past-life karmic residues, bestowing absolute spiritual tranquility.",
      hi: "गोकर्ण महाबलेश्वर आत्मलिंग का स्पर्श पूजन एवं कोटितीर्थ में तर्पण करने से पूर्व जन्म के समस्त संचित कर्म दोष भस्म होकर परम शांति मिलती है।",
      te: "గోకర్ణ మహాబలేశ్వర ఆత్మలింగ స్పర్శ పూజ మరియు కోటితీర్థంలో తర్పణంతో పూర్వ జన్మ కర్మ దోషాలు నశిస్తాయి.",
      ta: "கோகர்ண மகாபலேஸ்வரர் ஆத்மலிங்க ஸ்பரிச பூஜை மற்றும் கோடிதீர்த்தத்தில் தர்ப்பணம் செய்வதால் முன் ஜென்ம கர்ம வினைகள் நீங்கும்."
    },
    priestName: "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Chief Priest, Gokarna Kshetra)",
    priestPhone: "9972339362"
  };
}

export async function executeHindinaJanmaCalculation(
  input: HindinaJanmaInput,
  apiKey?: string
): Promise<HindinaJanmaResult> {
  const { dob, tob, lang } = input;
  const timeStr = tob || "12:00";

  const engineResult = calculateTraditionalBaggona(
    dob,
    timeStr,
    14.5479,
    74.3188,
    "lahiri"
  );

  const sunSignStr = engineResult?.sankrantiSignKn || "ಸಿಂಹ (Simha)";
  const moonNakshatraStr = engineResult?.moonNakshatraKn || "ಅನುರಾಧಾ (Anuradha)";
  const nakshatraIndex = Math.abs(dob.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 27;
  const sunSignNum = Math.abs(dob.split("-").map(Number).reduce((a, b) => a + b, 0)) % 12;
  const tithiNum = engineResult?.tithiGhati || 5;

  const pastLifePersona = computePastLifePersona(sunSignNum, nakshatraIndex, input);
  const karmaAnalysis = computeSanchitaKarma(nakshatraIndex, tithiNum);
  const innateBoons = computeInnateBoons(sunSignNum, input.inexplicableAffinity);
  const phobiaCorrelation = computePhobiaAndBirthmark(input.birthMarkLocation, input.inexplicablePhobia);
  const mokshaAxis = computeRahuKetuMokshaAxis(sunSignNum);
  const remedies = computeKarmicRemedies();

  let aiNarrative: string | undefined = undefined;

  if (apiKey) {
    try {
      const prompt = `You are Sri Shreeram Pandit, Chief Priest of Gokarna Mahabaleshwara Kshetra, master of Vedic Parashara Astrology and D-60 Shashtiamsha Poorva Janma Shastra.
Generate a rich, deeply personalized, authentic, and compassionate past life revelation for the devotee:
- Name: ${input.personName}
- Date of Birth: ${input.dob} (Sun Sign: ${sunSignStr}, Nakshatra: ${moonNakshatraStr})
- Gender: ${input.gender}
- Past Life Persona Archetype: ${pastLifePersona.socialStatusAndVocation[lang] || pastLifePersona.socialStatusAndVocation.kn} in ${pastLifePersona.eraAndTimeline[lang] || pastLifePersona.eraAndTimeline.kn}
- Soul Affinity: ${input.inexplicableAffinity || "Ancient Temples & Spirituality"}
- Innate Phobia/Memory: ${input.inexplicablePhobia || "None"}
- Devotee's Specific Question: ${input.customQuestion || "What is my soul's highest purpose and karmic lesson in this birth?"}

Guidelines:
1. Explain with profound Vedic wisdom the narrative of who they were in the previous incarnation, what noble deeds they did, what unfinished desire brought them into this birth, and their spiritual strengths.
2. Address their specific question directly with authentic Vedic insight.
3. Write EXCLUSIVELY in the requested language: ${lang} (${lang === "kn" ? "Kannada" : lang === "hi" ? "Hindi" : lang === "te" ? "Telugu" : lang === "ta" ? "Tamil" : "English"}).
4. Keep the tone comforting, uplifting, sacred, and dignifying.`;

      aiNarrative = await askGemini(prompt, "", apiKey, lang, { raw: true });
    } catch (err) {
      console.error("Hindina Janma AI generation error:", err);
    }
  }

  return {
    input,
    sunSign: sunSignStr,
    moonNakshatra: moonNakshatraStr,
    pastLifePersona,
    karmaAnalysis,
    innateBoons,
    phobiaCorrelation,
    mokshaAxis,
    remedies,
    aiNarrative,
    generatedAt: new Date().toLocaleString()
  };
}
