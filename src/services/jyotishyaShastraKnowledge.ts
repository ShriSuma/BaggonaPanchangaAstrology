/**
 * jyotishyaShastraKnowledge.ts
 *
 * 100% Authentic Classical Vedic Astrology Knowledge Matrix (ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರ ಮಹಾಜ್ಞಾನ ಭಂಡಾರ)
 * Based on Brihat Parashara Hora Shastra, Jaimini Upadesha Sutras, Varahamihira's Brihat Jataka,
 * and Dr. B.V. Raman's classical principles.
 *
 * Features:
 * 1. 9 Grahas complete matrix: Uccha (Exaltation) & Neecha (Debilitation) with deep degrees,
 *    Moolatrikona, Swakshetra, Karakatwas, Vedic Deities, Beeja Mantras, Gayatri Mantras,
 *    Authentic Classical Japa Counts, Gemstones, Metals, Dana items, and Gokarna Remedies.
 * 2. Neechabhanga Raja Yoga 5 classical rules of cancellation.
 * 3. 27 Nakshatras compendium: Lords, Deities, Ganas, Animal Yonis, Muhurtha quality,
 *    and Ganda Moola status (Ashwini, Ashlesha, Magha, Jyeshtha, Moola, Revati).
 * 4. 12 Bhavas (Houses) encyclopedia: Significations, House classifications (Kendras,
 *    Trikonas, Dusthanas, Upachayas, Marakas), and Karakas.
 * 5. Classical Yogas & Doshas catalog with conditions and remedies.
 * 6. Full Kannada and English scholarly representations.
 */

import { PlanetName, RASHIS } from "../core/AstroTypes";
import type { SupportedLanguage } from "../stores/appStore";

export interface GrahaShastraRecord {
  planet: PlanetName;
  name: Record<SupportedLanguage, string>;
  sanskrit: string;
  ucchaSign: number; // 0..11
  ucchaSignName: Record<SupportedLanguage, string>;
  ucchaDeepDegree: number; // Deep exaltation degree
  neechaSign: number; // 0..11
  neechaSignName: Record<SupportedLanguage, string>;
  neechaDeepDegree: number; // Deep debilitation degree
  moolatrikona: {
    sign: number;
    span: string;
    signName: Record<SupportedLanguage, string>;
  };
  swakshetra: number[];
  swakshetraNames: Record<SupportedLanguage, string[]>;
  deity: Record<SupportedLanguage, string>;
  karakatwa: Record<SupportedLanguage, string[]>;
  beejaMantra: {
    sa: string;
    kn: string;
    en: string;
  };
  gayatriMantra: {
    sa: string;
    kn: string;
    en: string;
  };
  japaCount: number;
  japaCountStr: Record<SupportedLanguage, string>;
  gemstone: Record<SupportedLanguage, string>;
  metal: Record<SupportedLanguage, string>;
  danaItems: Record<SupportedLanguage, string[]>;
  auspiciousDay: Record<SupportedLanguage, string>;
  gokarnaRemedy: Record<SupportedLanguage, string>;
}

export const GRAHA_SHASTRA_MATRIX: Record<PlanetName, GrahaShastraRecord> = {
  [PlanetName.Sun]: {
    planet: PlanetName.Sun,
    name: {
      kn: "ಸೂರ್ಯ (Surya / Ravi)",
      en: "Sun (Surya)",
      hi: "सूर्य (Surya)",
      te: "సూర్యుడు (Surya)",
      ta: "சூரியன் (Surya)"
    },
    sanskrit: "सूर्य",
    ucchaSign: 0, // Mesha (Aries)
    ucchaSignName: {
      kn: "ಮೇಷ (Mesha / Aries)",
      en: "Aries (Mesha)",
      hi: "मेष (Mesha)",
      te: "మేషం (Mesham)",
      ta: "மேஷம் (Mesham)"
    },
    ucchaDeepDegree: 10,
    neechaSign: 6, // Tula (Libra)
    neechaSignName: {
      kn: "ತುಲಾ (Tula / Libra)",
      en: "Libra (Tula)",
      hi: "तुला (Tula)",
      te: "తులా (Tula)",
      ta: "துலாம் (Thulam)"
    },
    neechaDeepDegree: 10,
    moolatrikona: {
      sign: 4, // Simha
      span: "0° - 20°",
      signName: { kn: "ಸಿಂಹ (Simha)", en: "Leo (Simha)", hi: "सिंह", te: "సింహం", ta: "சிம்மம்" }
    },
    swakshetra: [4],
    swakshetraNames: {
      kn: ["ಸಿಂಹ (Simha)"],
      en: ["Leo (Simha)"],
      hi: ["सिंह (Simha)"],
      te: ["సింహం (Simham)"],
      ta: ["சிம்மம் (Simmam)"]
    },
    deity: {
      kn: "ಭಗವಾನ್ ಶಿವ / ಅಗ್ನಿ / ರುದ್ರ",
      en: "Lord Shiva / Agni Deva",
      hi: "भगवान शिव / अग्नि देव",
      te: "శివుడు / అగ్ని దేవుడు",
      ta: "சிவபெருமான் / அக்னி தேவன்"
    },
    karakatwa: {
      kn: ["ಆತ್ಮ (Soul)", "ತಂದೆ (Father)", "ರಾಜಾಧಿಕಾರ & ಸರ್ಕಾರ (Authority)", "ಆರೋಗ್ಯ & ತೇಜಸ್ಸು (Vitality)", "ಮೂಳೆಗಳು (Bones)"],
      en: ["Soul (Atma)", "Father (Pitri)", "Authority & Governance", "Vitality & Prana", "Bones & Heart"],
      hi: ["आत्मकारक", "पिता", "प्रशासन", "तेज", "अस्थि"],
      te: ["ఆత్మకారకుడు", "తండ్రి", "అధికారం", "ఆరోగ్యం", "ఎముకలు"],
      ta: ["ஆத்மகாரகன்", "தந்தை", "அதிகாரம்", "ஆரோக்கியம்", "எலும்புகள்"]
    },
    beejaMantra: {
      sa: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",
      kn: "ಓಂ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ",
      en: "Om Hraam Hreem Hroum Sah Suryaya Namah"
    },
    gayatriMantra: {
      sa: "ॐ आदित्याय विद्महे मार्तण्डाय धीमहि तन्नः सूर्यः प्रचोदयात्",
      kn: "ಓಂ ಆದಿತ್ಯಾಯ ವಿದ್ಮಹೇ ಮಾರ್ತಂಡಾಯ ಧೀಮಹಿ ತನ್ನಃ ಸೂರ್ಯಃ ಪ್ರಚೋದಯಾತ್",
      en: "Om Adityaya Vidmahe Martandaya Dhimahi Tannah Suryah Prachodayat"
    },
    japaCount: 7000,
    japaCountStr: {
      kn: "೭,೦೦೦ ಜಪಗಳು (7,000 times)",
      en: "7,000 times",
      hi: "७,००० जप",
      te: "7,000 జపాలు",
      ta: "7,000 ஜெபங்கள்"
    },
    gemstone: {
      kn: "ಮಾಣಿಕ್ಯ (Ruby)",
      en: "Ruby (Manikya)",
      hi: "माणिक्य (Ruby)",
      te: "మాణిక్యం",
      ta: "மாணிக்கம்"
    },
    metal: { kn: "ತಾಮ್ರ / ಬಂಗಾರ (Copper / Gold)", en: "Copper / Gold", hi: "तांबा / सोना", te: "రాగి / బంగారం", ta: "செம்பு / தங்கம்" },
    danaItems: {
      kn: ["ಗೋಧಿ (Wheat)", "ಮಾಣಿಕ್ಯ", "ತಾಮ್ರದ ಪಾತ್ರೆ", "ಕೆಂಪು ವಸ್ತ್ರ", "ಬೆಲ್ಲ (Jaggery)"],
      en: ["Wheat", "Ruby", "Copper vessels", "Red cloth", "Jaggery on Sunday"],
      hi: ["गेहूं", "माणिक्य", "तांबा", "लाल वस्त्र", "गुड़"],
      te: ["గోధుమలు", "రాగి పాత్ర", "ఎరుపు వస్త్రం", "బెల్లం"],
      ta: ["கோதுமை", "மாணிக்கம்", "செம்பு பாத்திரம்", "சிவப்பு ஆடை", "வெல்லம்"]
    },
    auspiciousDay: { kn: "ಭಾನುವಾರ ಮುಂಜಾನೆ (Sunday Morning)", en: "Sunday Sunrise", hi: "रविवार प्रातः", te: "ఆదివారం ఉదయం", ta: "ஞாயிறு காலை" },
    gokarnaRemedy: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರವಿವಾರ ತೈಲಾಭಿಷೇಕ, ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಾರಾಯಣ.",
      en: "Ravivara Tailabhisheka at Gokarna Mahabaleshwara temple, Surya Namaskara, and Aditya Hridaya Stotra chanting.",
      hi: "गोकर्ण महाबलेश्वर में रविवार तैलाभिषेक एवं आदित्य हृदय स्तोत्र पाठ।",
      te: "గోకర్ణ మహాబలేశ్వర ఆలయంలో ఆదివారం తైలాభిషేకం, ఆదిత్య హృదయ స్తోత్ర పారాయణం.",
      ta: "கோகர்ண மகாபலேஸ்வரர் சன்னதியில் ஞாயிறு தைலாபிஷேகம் மற்றும் ஆதித்ய ஹிருதய ஸ்தோத்திரம்."
    }
  },

  [PlanetName.Moon]: {
    planet: PlanetName.Moon,
    name: {
      kn: "ಚಂದ್ರ (Chandra / Soma)",
      en: "Moon (Chandra)",
      hi: "चन्द्र (Chandra)",
      te: "చంద్రుడు (Chandra)",
      ta: "சந்திரன் (Chandra)"
    },
    sanskrit: "चन्द्र",
    ucchaSign: 1, // Vrishabha (Taurus)
    ucchaSignName: {
      kn: "ವೃಷಭ (Vrishabha / Taurus)",
      en: "Taurus (Vrishabha)",
      hi: "वृषभ (Vrishabha)",
      te: "వృషభం (Vrishabham)",
      ta: "ரிஷபம் (Rishabham)"
    },
    ucchaDeepDegree: 3,
    neechaSign: 7, // Vrischika (Scorpio)
    neechaSignName: {
      kn: "ವೃಶ್ಚಿಕ (Vrischika / Scorpio)",
      en: "Scorpio (Vrischika)",
      hi: "वृश्चिक (Vrischika)",
      te: "వృశ్చికం (Vrischikam)",
      ta: "விருச்சிகம் (Viruchigam)"
    },
    neechaDeepDegree: 3,
    moolatrikona: {
      sign: 1, // Vrishabha
      span: "3° - 30°",
      signName: { kn: "ವೃಷಭ (Vrishabha)", en: "Taurus (Vrishabha)", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்" }
    },
    swakshetra: [3],
    swakshetraNames: {
      kn: ["ಕರ್ಕಾಟಕ (Karka)"],
      en: ["Cancer (Karka)"],
      hi: ["कर्क (Karka)"],
      te: ["కర్కాటకం (Karkatakam)"],
      ta: ["கடகம் (Kadagam)"]
    },
    deity: {
      kn: "ಮಾತಾ ಗೌರಿ / ಪಾರ್ವತಿ / ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ",
      en: "Goddess Parvati / Gauri / Sri Mahalakshmi",
      hi: "माता पार्वती / गौरी / महालक्ष्मी",
      te: "గౌరీ దేవి / పార్వతి / మహాలక్ష్మి",
      ta: "பார்வதி தேவி / கௌரி / மகாலட்சுமி"
    },
    karakatwa: {
      kn: ["ಮನಸ್ಸು (Mind / Emotions)", "ತಾಯಿ (Mother)", "ಮಾನಸಿಕ ಶಾಂತಿ (Peace of Mind)", "ಜಲತತ್ವ & ದ್ರವಗಳು (Fluids)", "ಸ್ಮರಣಶಕ್ತಿ (Memory)"],
      en: ["Mind & Emotions (Manas)", "Mother (Matri)", "Mental Serenity & Peace", "Bodily Fluids & Blood", "Memory & Imagination"],
      hi: ["मन", "माता", "मानसिक शांति", "जल", "स्मृति"],
      te: ["మనస్సు", "తల్లి", "శాంతి", "నీరు", "జ్ఞాపకశక్తి"],
      ta: ["மனம்", "தாய்", "மன அமைதி", "நீர்", "நினைவாற்றல்"]
    },
    beejaMantra: {
      sa: "ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः",
      kn: "ಓಂ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ",
      en: "Om Shraam Shreem Shroum Sah Chandramase Namah"
    },
    gayatriMantra: {
      sa: "ॐ क्षीरपुत्राय विद्महे अमृततत्त्वाय धीमहि तन्नश्चन्द्रः प्रचोदयात्",
      kn: "ಓಂ ಕ್ಷೀರಪುತ್ರಾಯ ವಿದ್ಮಹೇ ಅಮೃತತತ್ತ್ವಾಯ ಧೀಮಹಿ ತನ್ನಶ್ಚಂದ್ರಃ ಪ್ರಚೋದಯಾತ್",
      en: "Om Ksheeraputraya Vidmahe Amritatattwaya Dhimahi Tannah Chandrah Prachodayat"
    },
    japaCount: 11000,
    japaCountStr: {
      kn: "೧೧,೦೦೦ ಜಪಗಳು (11,000 times)",
      en: "11,000 times",
      hi: "११,००० जप",
      te: "11,000 జపాలు",
      ta: "11,000 ஜெபங்கள்"
    },
    gemstone: {
      kn: "ನೈಸರ್ಗಿಕ ಮುತ್ತು (Natural Pearl / Mukta)",
      en: "Natural Pearl (Mukta)",
      hi: "मोती (Pearl)",
      te: "ముత్యం (Pearl)",
      ta: "முத்து (Pearl)"
    },
    metal: { kn: "ಬೆಳ್ಳಿ (Silver)", en: "Silver", hi: "चांदी", te: "వెండి", ta: "வெள்ளி" },
    danaItems: {
      kn: ["ಅಕ್ಕಿ (Rice)", "ಹಾಲು (Milk)", "ಬೆಳ್ಳಿ", "ಬಿಳಿ ವಸ್ತ್ರ", "ಸಕ್ಕರೆ (Sugar)"],
      en: ["Rice", "Milk", "Silver", "White cloth", "Sugar on Monday evening"],
      hi: ["चावल", "दूध", "चांदी", "श्वेत वस्त्र", "शक्कर"],
      te: ["బియ్యం", "పాలు", "వెండి", "తెల్లని వస్త్రం", "చక్కెర"],
      ta: ["அரிசி", "பால்", "வெள்ளி", "வெள்ளை ஆடை", "சர்க்கரை"]
    },
    auspiciousDay: { kn: "ಸೋಮವಾರ ಸಂಜೆ (Monday Evening)", en: "Monday Evening", hi: "सोमवार संध्या", te: "సోమవారం సాయంత్రం", ta: "திங்கள் மாலை" },
    gokarnaRemedy: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಸೋಮವಾರ ಕ್ಷೀರಾಭಿಷೇಕ (ಶುದ್ಧ ಹಾಲಿನ ಅಭಿಷೇಕ), ಚಂದ್ರಮೌಳೀಶ್ವರ ಪೂಜೆ ಹಾಗೂ ಬಿಲ್ವಾರ್ಚನೆ.",
      en: "Ksheerabhisheka (pure milk offering) to the Atmalinga at Gokarna Mahabaleshwara on Monday and Chandramouleshwara Archana.",
      hi: "गोकर्ण महाबलेश्वर आत्मलिंग पर सोमवार को दुग्धाभिषेक एवं चंद्रमौलीश्वर पूजा।",
      te: "గోకర్ణ మహాబలేశ్వర ఆత్మలింగానికి సోమవారం క్షీరాభిషేకం మరియు బిల్వార్చన.",
      ta: "கோகர்ண மகாபலேஸ்வரர் ஆத்மலிங்கத்திற்கு திங்கட்கிழமை பாலாபிஷேகம் மற்றும் வில்வார்ச்சனை."
    }
  },

  [PlanetName.Mars]: {
    planet: PlanetName.Mars,
    name: {
      kn: "ಕುಜ / ಮಂಗಳ (Kuja / Mangala / Angaraka)",
      en: "Mars (Kuja / Mangala)",
      hi: "मंगल (Mangala)",
      te: "కుజుడు (Kuja)",
      ta: "செவ்வாய் (Chevvai)"
    },
    sanskrit: "मङ्गल",
    ucchaSign: 9, // Makara (Capricorn)
    ucchaSignName: {
      kn: "ಮಕರ (Makara / Capricorn)",
      en: "Capricorn (Makara)",
      hi: "मकर (Makara)",
      te: "మకరం (Makaram)",
      ta: "மகரம் (Magaram)"
    },
    ucchaDeepDegree: 28,
    neechaSign: 3, // Karka (Cancer)
    neechaSignName: {
      kn: "ಕರ್ಕಾಟಕ (Karka / Cancer)",
      en: "Cancer (Karka)",
      hi: "कर्क (Karka)",
      te: "కర్కాటకం (Karkatakam)",
      ta: "கடகம் (Kadagam)"
    },
    neechaDeepDegree: 28,
    moolatrikona: {
      sign: 0, // Mesha
      span: "0° - 12°",
      signName: { kn: "ಮೇಷ (Mesha)", en: "Aries (Mesha)", hi: "मेष", te: "మేషం", ta: "மேஷம்" }
    },
    swakshetra: [0, 7],
    swakshetraNames: {
      kn: ["ಮೇಷ (Mesha)", "ವೃಶ್ಚಿಕ (Vrischika)"],
      en: ["Aries (Mesha)", "Scorpio (Vrischika)"],
      hi: ["मेष", "वृश्चिक"],
      te: ["మేషం", "వృశ్చికం"],
      ta: ["மேஷம்", "விருச்சிகம்"]
    },
    deity: {
      kn: "ಭಗವಾನ್ ಸುಬ್ರಹ್ಮಣ್ಯ / ಕಾರ್ತಿಕೇಯ / ವೀರಭದ್ರ",
      en: "Lord Subrahmanya / Kartikeya / Veerabhadra",
      hi: "भगवान कार्तिकेय / सुब्रह्मण्य / वीरभद्र",
      te: "సుబ్రహ్మణ్య స్వామి / కార్తికేయుడు",
      ta: "முருகப்பெருமான் / சுப்பிரமணியர்"
    },
    karakatwa: {
      kn: ["ಧೈರ್ಯ & ಪರಾಕ್ರಮ (Courage)", "ಸಹೋದರರು (Younger Siblings)", "ಭೂಮಿ & ಆಸ್ತಿ (Land & Property)", "ರಕ್ತ & ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Blood & Surgery)", "ತಾಂತ್ರಿಕ ಸಾಮರ್ಥ್ಯ (Engineering)"],
      en: ["Courage & Valour (Bhratri)", "Younger Siblings", "Real Estate & Land", "Blood, Muscles & Surgery", "Engineering & Logic"],
      hi: ["साहस", "भाई", "भूमि", "रक्त", "पराक्रम"],
      te: ["ధైర్యం", "సోదరులు", "భూమి", "రక్తం", "సాంకేతికత"],
      ta: ["தைரியம்", "சகோதரர்கள்", "நிலம்", "இரத்தம்", "வீரம்"]
    },
    beejaMantra: {
      sa: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः",
      kn: "ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ",
      en: "Om Kraam Kreem Kroum Sah Bhaumaya Namah"
    },
    gayatriMantra: {
      sa: "ॐ अंगारकाय विद्महे शक्तिहस्ताय धीमहि तन्नो भौमः प्रचोदयात्",
      kn: "ಓಂ ಅಂಗಾರಕಾಯ ವಿದ್ಮಹೇ ಶಕ್ತಿಹಸ್ತಾಯ ಧೀಮಹಿ ತನ್ನೋ ಭೌಮಃ ಪ್ರಚೋದಯಾತ್",
      en: "Om Angarakaya Vidmahe Shaktihastaya Dhimahi Tanno Bhaumah Prachodayat"
    },
    japaCount: 10000,
    japaCountStr: {
      kn: "೧೦,೦೦೦ ಜಪಗಳು (10,000 times)",
      en: "10,000 times",
      hi: "१०,००० जप",
      te: "10,000 జపాలు",
      ta: "10,000 ஜெபங்கள்"
    },
    gemstone: {
      kn: "ಕೆಂಪು ಹವಳ (Red Coral / Pavizham)",
      en: "Red Coral (Moonga / Pavizham)",
      hi: "मूंगा (Red Coral)",
      te: "పగడం (Coral)",
      ta: "பவளம் (Coral)"
    },
    metal: { kn: "ತಾಮ್ರ (Copper)", en: "Copper", hi: "तांबा", te: "రాగి", ta: "செம்பு" },
    danaItems: {
      kn: ["ತೊಗರಿ ಬೇಳೆ (Toor Dal)", "ತಾಮ್ರದ ಪಾತ್ರೆ", "ಕೆಂಪು ವಸ್ತ್ರ", "ಕೆಂಪು ಚಂದನ"],
      en: ["Red lentils (Toor Dal)", "Copper utensil", "Red cloth", "Red sandalwood on Tuesday"],
      hi: ["तूर दाल", "तांबे का बर्तन", "लाल वस्त्र", "लाल चंदन"],
      te: ["కందిపప్పు", "రాగి పాత్ర", "ఎరుపు వస్త్రం"],
      ta: ["துவரம் பருப்பு", "செம்பு பாத்திரம்", "சிவப்பு ஆடை"]
    },
    auspiciousDay: { kn: "ಮಂಗಳವಾರ ಮಧ್ಯಾಹ್ನ (Tuesday Noon)", en: "Tuesday Noon", hi: "मंगलवार दोपहर", te: "మంగళవారం మధ్యాహ్నం", ta: "செவ்வாய் மதியம்" },
    gokarnaRemedy: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ ಕುಜ ದೋಷ ಶಾಂತಿ ಹೋಮ, ಸುಬ್ರಹ್ಮಣ್ಯ ಸಹಸ್ರನಾಮ ಅರ್ಚನೆ ಮತ್ತು ಅಂಗಾರಕ ಶಾಂತಿ ಪೂಜೆ.",
      en: "Kuja Dosha Shanti Homa, Subrahmanya Sahasranama Archana, and Angaraka Shanti at Gokarna.",
      hi: "गोकर्ण में कुज दोष शांति होम एवं सुब्रह्मण्य अर्चना।",
      te: "గోకర్ణంలో కుజ దోష నివారణ హోమం మరియు సుబ్రహ్మణ్య పూజ.",
      ta: "கோகர்ணத்தில் செவ்வாய் தோஷ சாந்தி ஹோமம் மற்றும் சுப்பிரமணியர் பூஜை."
    }
  },

  [PlanetName.Mercury]: {
    planet: PlanetName.Mercury,
    name: {
      kn: "ಬುಧ (Budha / Saumya)",
      en: "Mercury (Budha)",
      hi: "बुध (Budha)",
      te: "బుధుడు (Budha)",
      ta: "புதன் (Budhan)"
    },
    sanskrit: "बुध",
    ucchaSign: 5, // Kanya (Virgo)
    ucchaSignName: {
      kn: "ಕನ್ಯಾ (Kanya / Virgo)",
      en: "Virgo (Kanya)",
      hi: "कन्या (Kanya)",
      te: "కన్య (Kanya)",
      ta: "கன்னி (Kanni)"
    },
    ucchaDeepDegree: 15,
    neechaSign: 11, // Meena (Pisces)
    neechaSignName: {
      kn: "ಮೀನ (Meena / Pisces)",
      en: "Pisces (Meena)",
      hi: "मीन (Meena)",
      te: "మీనం (Meenam)",
      ta: "மீனம் (Meenam)"
    },
    neechaDeepDegree: 15,
    moolatrikona: {
      sign: 5, // Kanya
      span: "15° - 20°",
      signName: { kn: "ಕನ್ಯಾ (Kanya)", en: "Virgo (Kanya)", hi: "कन्या", te: "కన్య", ta: "கன்னி" }
    },
    swakshetra: [2, 5],
    swakshetraNames: {
      kn: ["ಮಿಥುನ (Mithuna)", "ಕನ್ಯಾ (Kanya)"],
      en: ["Gemini (Mithuna)", "Virgo (Kanya)"],
      hi: ["मिथुन", "कन्या"],
      te: ["మిథునం", "కన్య"],
      ta: ["மிதுனம்", "கன்னி"]
    },
    deity: {
      kn: "ಭಗವಾನ್ ಶ್ರೀ ಮಹಾವಿಷ್ಣು / ಸರಸ್ವತೀ ದೇವಿ",
      en: "Lord Maha Vishnu / Goddess Saraswati",
      hi: "भगवान श्री विष्णु / सरस्वती देवी",
      te: "శ్రీ మహావిష్ణువు / సరస్వతీ దేవి",
      ta: "மகாவிஷ்ணு / சரஸ்வதி தேவி"
    },
    karakatwa: {
      kn: ["ಬುದ್ಧಿಮತ್ತೆ (Intellect / Buddhi)", "ವಾಕ್ಚಾತುರ್ಯ & ಮಾತು (Speech)", "ವ್ಯಾಪಾರ & ವಾಣಿಜ್ಯ (Commerce)", "ಜ್ಯೋತಿಷ್ಯ & ಗಣಿತ (Astrology & Maths)", "ನರಮಂಡಲ (Nervous System)"],
      en: ["Intellect (Buddhi)", "Speech & Communication (Vak)", "Trade, Commerce & Finance", "Mathematics & Astrology", "Nervous System & Skin"],
      hi: ["बुद्धि", "वाणी", "व्यापार", "गणित", "तंत्रिका तंत्र"],
      te: ["బుద్ధి", "వాక్కు", "వ్యాపారం", "గణితం", "నరాల వ్యవస్థ"],
      ta: ["புத்தி", "பேச்சுத்திறன்", "வியாபாரம்", "கணிதம்", "நரம்பு மண்டலம்"]
    },
    beejaMantra: {
      sa: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः",
      kn: "ಓಂ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ",
      en: "Om Braam Breem Broum Sah Budhaya Namah"
    },
    gayatriMantra: {
      sa: "ॐ सौम्यरूपाय विद्महे वाणेशाय धीमहि तन्नೋ ಸೌಮ್ಯಃ ಪ್ರಚೋದಯಾತ್",
      kn: "ಓಂ ಸೌಮ್ಯರೂಪಾಯ ವಿದ್ಮಹೇ ವಾಣೇಶಾಯ ಧೀಮಹಿ ತನ್ನೋ ಸೌಮ್ಯಃ ಪ್ರಚೋದಯಾತ್",
      en: "Om Saumyarupaya Vidmahe Vaneshaya Dhimahi Tanno Saumyah Prachodayat"
    },
    japaCount: 17000,
    japaCountStr: {
      kn: "೧೭,೦೦೦ ಜಪಗಳು (17,000 times)",
      en: "17,000 times",
      hi: "१७,००० जप",
      te: "17,000 జపాలు",
      ta: "17,000 ஜெபங்கள்"
    },
    gemstone: {
      kn: "ಪಚ್ಚೆ (Emerald / Marakata)",
      en: "Emerald (Panna / Marakata)",
      hi: "पन्ना (Emerald)",
      te: "పచ్చ (Emerald)",
      ta: "மரகதம் (Emerald)"
    },
    metal: { kn: "ಕಂಚು / ಹಿತ್ತಾಳೆ (Bronze / Brass)", en: "Bronze / Brass", hi: "कांस्य", te: "కంచు", ta: "வெண்கலம்" },
    danaItems: {
      kn: ["ಹೆಸರು ಕಾಳು (Green Moong Dal)", "ಹಸಿರು ವಸ್ತ್ರ", "ಪಚ್ಚೆ ರತ್ನ", "ಪುಸ್ತಕಗಳು & ಲೇಖನ ಸಾಮಗ್ರಿ"],
      en: ["Whole Green Gram (Moong Dal)", "Green cloth", "Emerald", "Educational books on Wednesday"],
      hi: ["साबुत मूंग", "हरा वस्त्र", "पन्ना", "पुस्तके"],
      te: ["పెసలు", "ఆకుపచ్చని వస్త్రం", "పుస్తకాలు"],
      ta: ["பாசிப்பயறு", "பச்சை ஆடை", "புத்தகங்கள்"]
    },
    auspiciousDay: { kn: "ಬುಧವಾರ ಮುಂಜಾನೆ (Wednesday Morning)", en: "Wednesday Morning", hi: "बुधवार प्रातः", te: "బుధవారం ఉదయం", ta: "புதன் காலை" },
    gokarnaRemedy: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಅರ್ಚನೆ, ಬುಧ ಶಾಂತಿ ಮಹಾಯಾಗ ಮತ್ತು ವಿದ್ಯಾಭಿವೃದ್ಧಿ ಸರಸ್ವತೀ ಪೂಜೆ.",
      en: "Vishnu Sahasranama Archana at Gokarna, Budha Shanti Maha Yajna, and Saraswati Pooja for intellectual clarity.",
      hi: "गोकर्ण में विष्णु सहस्रनाम पाठ एवं बुध शांति याग।",
      te: "గోకర్ణంలో విష్ణు సహస్రనామ పూజ మరియు బుధ శాంతి హోమం.",
      ta: "கோகர்ணத்தில் விஷ்ணு சகஸ்ரநாம அர்ச்சனை மற்றும் புதன் சாந்தி ஹோமம்."
    }
  },

  [PlanetName.Jupiter]: {
    planet: PlanetName.Jupiter,
    name: {
      kn: "ಗುರು / ಬೃಹಸ್ಪತಿ (Guru / Brihaspati)",
      en: "Jupiter (Guru / Brihaspati)",
      hi: "गुरु / बृहस्पति (Jupiter)",
      te: "గురువు / బృహస్పతి (Guru)",
      ta: "குரு / பிரஹஸ்பதி (Guru)"
    },
    sanskrit: "गुरु",
    ucchaSign: 3, // Karka (Cancer)
    ucchaSignName: {
      kn: "ಕರ್ಕಾಟಕ (Karka / Cancer)",
      en: "Cancer (Karka)",
      hi: "कर्क (Karka)",
      te: "కర్కాటకం (Karkatakam)",
      ta: "கடகம் (Kadagam)"
    },
    ucchaDeepDegree: 5,
    neechaSign: 9, // Makara (Capricorn)
    neechaSignName: {
      kn: "ಮಕರ (Makara / Capricorn)",
      en: "Capricorn (Makara)",
      hi: "मकर (Makara)",
      te: "మకరం (Makaram)",
      ta: "மகரம் (Magaram)"
    },
    neechaDeepDegree: 5,
    moolatrikona: {
      sign: 8, // Dhanus
      span: "0° - 10°",
      signName: { kn: "ಧನುಸ್ಸು (Dhanus)", en: "Sagittarius (Dhanus)", hi: "धनु", te: "ధనుస్సు", ta: "தனுசு" }
    },
    swakshetra: [8, 11],
    swakshetraNames: {
      kn: ["ಧನುಸ್ಸು (Dhanus)", "ಮೀನ (Meena)"],
      en: ["Sagittarius (Dhanus)", "Pisces (Meena)"],
      hi: ["धनु", "मीन"],
      te: ["ధనుస్సు", "మీనం"],
      ta: ["தனுசு", "மீனம்"]
    },
    deity: {
      kn: "ಭಗವಾನ್ ದಕ್ಷಿಣಾಮೂರ್ತಿ / ಶ್ರೀ ಸದಾಶಿವ / ಬ್ರಹ್ಮದೇವ",
      en: "Lord Dakshinamurthy / Lord Sadashiva / Lord Brahma",
      hi: "भगवान दक्षिणामूर्ति / शिवजी / ब्रह्मा",
      te: "దక్షిణామూర్తి / శివుడు",
      ta: "தட்சிணாமூர்த்தி / சிவபெருமான்"
    },
    karakatwa: {
      kn: ["ಗುರು & ಜ್ಞಾನ (Guru & Wisdom)", "ಸಂತಾನ (Children / Putra)", "ಧರ್ಮ & ಸದ್ಗುಣ (Dharma & Virtue)", "ಸಂಪತ್ತು & ಭಾಗ್ಯ (Wealth & Luck)", "ಯಕೃತ್ & ಸ್ಥೂಲಕಾಯ (Liver & Fat)"],
      en: ["Guru & Spiritual Wisdom (Jnana)", "Children (Putra Karaka)", "Dharma, Righteousness & Law", "Abundant Wealth & Fortune", "Liver & Higher Learning"],
      hi: ["ज्ञान", "संतान", "धर्म", "धन", "यकृत"],
      te: ["జ్ఞానం", "సంతానం", "ధర్మం", "సంపద", "కాలేయం"],
      ta: ["ஞானம்", "சந்தானம்", "தர்மம்", "செல்வம்", "ஈரல்"]
    },
    beejaMantra: {
      sa: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः",
      kn: "ಓಂ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ",
      en: "Om Graam Greem Groum Sah Gurave Namah"
    },
    gayatriMantra: {
      sa: "ॐ वृषभध्वजाय विद्महे धनुर्हस्ताय धीमहि तन्नो गुरुः प्रचोदयात्",
      kn: "ಓಂ ವೃಷಭಧ್ವಜಾಯ ವಿದ್ಮಹೇ ಧನುರ್ಹಸ್ತಾಯ ಧೀಮಹಿ ತನ್ನೋ ಗುರುಃ ಪ್ರಚೋದಯಾತ್",
      en: "Om Vrishabhadhvajaya Vidmahe Dhanurhastaya Dhimahi Tanno Guruh Prachodayat"
    },
    japaCount: 19000,
    japaCountStr: {
      kn: "೧೯,೦೦೦ ಜಪಗಳು (19,000 times)",
      en: "19,000 times",
      hi: "१९,००० जप",
      te: "19,000 జపాలు",
      ta: "19,000 ஜெபங்கள்"
    },
    gemstone: {
      kn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire / Pushparaga)",
      en: "Yellow Sapphire (Pukhraj / Pushparaga)",
      hi: "पुखराज (Yellow Sapphire)",
      te: "పుష్యరాగం (Yellow Sapphire)",
      ta: "புஷ்பராகம் (Yellow Sapphire)"
    },
    metal: { kn: "ಬಂಗಾರ (Gold)", en: "Gold", hi: "स्वर्ण (Gold)", te: "బంగారం", ta: "தங்கம்" },
    danaItems: {
      kn: ["ಕಡಲೆ ಬೇಳೆ (Chana Dal)", "ಹಳದಿ ವಸ್ತ್ರ", "ಅರಿಶಿನ (Turmeric)", "ಬಂಗಾರ", "ಬಾಳೆಹಣ್ಣು"],
      en: ["Bengal Gram (Chana Dal)", "Yellow cloth", "Turmeric", "Gold", "Bananas on Thursday morning"],
      hi: ["चना दाल", "पीला वस्त्र", "हल्दी", "सोना", "केला"],
      te: ["శనగపప్పు", "పసుపు వస్త్రం", "పసుపు", "అరటిపండ్లు"],
      ta: ["கடலைப்பருப்பு", "மஞ்சள் ஆடை", "மஞ்சள்", "வாழைப்பழம்"]
    },
    auspiciousDay: { kn: "ಗುರುವಾರ ಮುಂಜಾನೆ (Thursday Morning)", en: "Thursday Sunrise", hi: "गुरुवार प्रातः", te: "గురువారం ఉదయం", ta: "வியாழன் காலை" },
    gokarnaRemedy: {
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಗುರುವಾರ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಯಾಗ, ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ಗುರು-ಚಂಡಾಲ ದೋಷ ಶಾಂತಿ ಹೋಮ.",
      en: "Dakshinamurthy Maha Yajna at Gokarna, Bilvarchana to Lord Mahabaleshwara on Thursday, and Guru Chandala Shanti.",
      hi: "गोकर्ण में दक्षिणामूर्ति महायाग एवं गुरु चांडाल शांति होम।",
      te: "గోకర్ణంలో గురువారం దక్షిణామూర్తి హోమం మరియు బిల్వార్చన.",
      ta: "கோகர்ணத்தில் தட்சிணாமூர்த்தி ஹோமம் மற்றும் குரு சாந்தி பூஜை."
    }
  },

  [PlanetName.Venus]: {
    planet: PlanetName.Venus,
    name: {
      kn: "ಶುಕ್ರ (Shukra / Bhrigu)",
      en: "Venus (Shukra)",
      hi: "शुक्र (Shukra)",
      te: "శుక్రుడు (Shukra)",
      ta: "சுக்கிரன் (Shukran)"
    },
    sanskrit: "शुक्र",
    ucchaSign: 11, // Meena (Pisces)
    ucchaSignName: {
      kn: "ಮೀನ (Meena / Pisces)",
      en: "Pisces (Meena)",
      hi: "मीन (Meena)",
      te: "మీనం (Meenam)",
      ta: "மீனம் (Meenam)"
    },
    ucchaDeepDegree: 27,
    neechaSign: 5, // Kanya (Virgo)
    neechaSignName: {
      kn: "ಕನ್ಯಾ (Kanya / Virgo)",
      en: "Virgo (Kanya)",
      hi: "कन्या (Kanya)",
      te: "కన్య (Kanya)",
      ta: "கன்னி (Kanni)"
    },
    neechaDeepDegree: 27,
    moolatrikona: {
      sign: 6, // Tula
      span: "0° - 15°",
      signName: { kn: "ತುಲಾ (Tula)", en: "Libra (Tula)", hi: "तुला", te: "తులా", ta: "துலாம்" }
    },
    swakshetra: [1, 6],
    swakshetraNames: {
      kn: ["ವೃಷಭ (Vrishabha)", "ತುಲಾ (Tula)"],
      en: ["Taurus (Vrishabha)", "Libra (Tula)"],
      hi: ["वृषभ", "तुला"],
      te: ["వృషభం", "తులా"],
      ta: ["ரிஷபம்", "துலாம்"]
    },
    deity: {
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ / ಇಂದ್ರಾಣಿ ದೇವಿ",
      en: "Goddess Sri Mahalakshmi / Indrani",
      hi: "माता महालक्ष्मी / इंद्राणी",
      te: "శ్రీ మహాలక్ష్మి",
      ta: "மகாலட்சுமி தாயார்"
    },
    karakatwa: {
      kn: ["ವಿವಾಹ & ಸಂಗಾತಿ (Spouse / Kalatra)", "ಪ್ರೀತಿ & ಸೌಂದರ್ಯ (Love & Beauty)", "ವಾಹನ & ಭೋಗ (Vehicles & Luxury)", "ಕಲೆ & ಸಂಗೀತ (Fine Arts)", "ವೀರ್ಯ & ಸಂತಾನ ಶಕ್ತಿ (Reproduction)"],
      en: ["Spouse & Marriage (Kalatra Karaka)", "Luxury, Vehicles & Wealth", "Love, Romance & Aesthetics", "Fine Arts, Music & Poetry", "Reproductive Vitality"],
      hi: ["पत्नी/पति", "वैवाहिक सुख", "वाहन", "कला", "ऐश्वर्य"],
      te: ["వివాహం", "భార్య/భర్త", "వాహనాలు", "సౌందర్యం", "లగ్జరీ"],
      ta: ["களத்திரம்", "திருமண வாழ்க்கை", "வாகனம்", "கலை", "செல்வம்"]
    },
    beejaMantra: {
      sa: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः",
      kn: "ಓಂ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ",
      en: "Om Draam Dreem Droum Sah Shukraya Namah"
    },
    gayatriMantra: {
      sa: "ॐ भृगुजाय विद्महे दिव्यदेहाय धीमहि तन्नः शुक्रः प्रचोदयात्",
      kn: "ಓಂ ಭೃಗುಜಾಯ ವಿದ್ಮಹೇ ದಿವ್ಯದೇಹಾಯ ಧೀಮಹಿ ತನ್ನಃ ಶುಕ್ರಃ ಪ್ರಚೋದಯಾತ್",
      en: "Om Bhrigujaya Vidmahe Divyadehaya Dhimahi Tannah Shukrah Prachodayat"
    },
    japaCount: 16000,
    japaCountStr: {
      kn: "೧೬,೦೦೦ ಜಪಗಳು (16,000 times)",
      en: "16,000 times",
      hi: "१६,००० जप",
      te: "16,000 జపాలు",
      ta: "16,000 ஜெபங்கள்"
    },
    gemstone: {
      kn: "ವಜ್ರ (Diamond / Heera) ಅಥವಾ ಬಿಳಿ ಝಿರ್ಕಾನ್",
      en: "Diamond (Heera) or White Zircon / White Sapphire",
      hi: "हीरा (Diamond) अथवा श्वेत जरकन",
      te: "వజ్రం (Diamond)",
      ta: "வைரம் (Diamond)"
    },
    metal: { kn: "ಬೆಳ್ಳಿ / ಪ್ಲಾಟಿನಮ್ (Silver / Platinum)", en: "Silver / Platinum", hi: "चांदी", te: "వెండి", ta: "வெள்ளி" },
    danaItems: {
      kn: ["ಅವರೆ ಕಾಳು (Cowpeas)", "ಮೊಸರು (Curd)", "ತುಪ್ಪ (Ghee)", "ಬಿಳಿ ಸಿಹಿ ತಿಂಡಿಗಳು", "ಬೆಳ್ಳಿ"],
      en: ["White Cowpeas (Avare)", "Curd", "Ghee", "White sweets", "Silver on Friday sunrise"],
      hi: ["सफेद वस्त्र", "दही", "घी", "मिश्री", "चांदी"],
      te: ["అలసందలు", "పెరుగు", "నెయ్యి", "తెల్లని మిఠాయిలు"],
      ta: ["மொச்சை", "தயிர்", "நெய்", "வெள்ளை இனிப்புகள்"]
    },
    auspiciousDay: { kn: "ಶುಕ್ರವಾರ ಮುಂಜಾನೆ (Friday Morning)", en: "Friday Morning", hi: "शुक्रवार प्रातः", te: "శుక్రవారం ఉదయం", ta: "வெள்ளி காலை" },
    gokarnaRemedy: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ, ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಜಪ ಹಾಗೂ ಸೌಭಾಗ್ಯ ವೃದ್ಧಿ ಶುಕ್ರ ಪ್ರೀತಿ ಹೋಮ.",
      en: "Sri Mahalakshmi Pooja at Gokarna, Kanakadhara Stotra Japa, and Shukra Preeti Homa for conjugal harmony.",
      hi: "गोकर्ण में महालक्ष्मी पूजा एवं कनकधारा स्तोत्र पाठ।",
      te: "గోకర్ణంలో మహాలక్ష్మి పూజ మరియు శుక్ర ప్రీతి హోమం.",
      ta: "கோகர்ணத்தில் மகாலட்சுமி பூஜை மற்றும் கனகதாரா ஸ்தோத்திரம்."
    }
  },

  [PlanetName.Saturn]: {
    planet: PlanetName.Saturn,
    name: {
      kn: "ಶನಿ / ಶನೈಶ್ಚರ (Shani / Shanaishchara)",
      en: "Saturn (Shani)",
      hi: "शनि (Shani)",
      te: "శని దేవుడు (Shani)",
      ta: "சனீஸ்வரன் (Shani)"
    },
    sanskrit: "शनि",
    ucchaSign: 6, // Tula (Libra)
    ucchaSignName: {
      kn: "ತುಲಾ (Tula / Libra)",
      en: "Libra (Tula)",
      hi: "तुला (Tula)",
      te: "తులా (Tula)",
      ta: "துலாம் (Thulam)"
    },
    ucchaDeepDegree: 20,
    neechaSign: 0, // Mesha (Aries)
    neechaSignName: {
      kn: "ಮೇಷ (Mesha / Aries)",
      en: "Aries (Mesha)",
      hi: "मेष (Mesha)",
      te: "మేషం (Mesham)",
      ta: "மேஷம் (Mesham)"
    },
    neechaDeepDegree: 20,
    moolatrikona: {
      sign: 10, // Kumbha
      span: "0° - 20°",
      signName: { kn: "ಕುಂಭ (Kumbha)", en: "Aquarius (Kumbha)", hi: "कुम्भ", te: "కుంభం", ta: "கும்பம்" }
    },
    swakshetra: [9, 10],
    swakshetraNames: {
      kn: ["ಮಕರ (Makara)", "ಕುಂಭ (Kumbha)"],
      en: ["Capricorn (Makara)", "Aquarius (Kumbha)"],
      hi: ["मकर", "कुम्भ"],
      te: ["మకరం", "కుంభం"],
      ta: ["மகரம்", "கும்பம்"]
    },
    deity: {
      kn: "ಭಗವಾನ್ ಯಮಧರ್ಮರಾಜ / ಶಿವ / ಶ್ರೀ ಹನುಮಂತ",
      en: "Lord Yama / Lord Shiva / Lord Hanuman",
      hi: "भगवान यमराज / शिवजी / हनुमान जी",
      te: "యమధర్మరాజు / శివుడు / హనుమంతుడు",
      ta: "யமதர்மராஜன் / சிவபெருமான் / அனுமன்"
    },
    karakatwa: {
      kn: ["ಆಯುಷ್ಯ (Longevity / Ayush)", "ಕರ್ಮ & ಶ್ರಮ (Karma & Discipline)", "ವಿಳಂಬ & ತಾಳ್ಮೆ (Delays & Patience)", "ವೈರಾಗ್ಯ (Detachment)", "ದೀರ್ಘಕಾಲಿಕ ಕಾಯಿಲೆಗಳು (Chronic Ailments)"],
      en: ["Longevity (Ayush Karaka)", "Hard Work, Discipline & Karma", "Patience, Delay & Obstacles", "Detachment & Renunciation", "Legs, Knees & Chronic Diseases"],
      hi: ["आयु", "कर्म", "श्रम", "धैर्य", "वैराग्य"],
      te: ["ఆయుష్షు", "కర్మ", "శ్రమ", "ఓర్పు", "దీర్ఘకాలిక సమస్యలు"],
      ta: ["ஆயுள்", "கர்மா", "கடின உழைப்பு", "பொறுமை", "வைராக்கியம்"]
    },
    beejaMantra: {
      sa: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः",
      kn: "ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ",
      en: "Om Praam Preem Proum Sah Shanaishcharaya Namah"
    },
    gayatriMantra: {
      sa: "ॐ काकध्वजाय विद्महे खड्गहस्ताय धीमहि तन्नೋ ಮಂದಃ ಪ್ರಚೋದಯಾತ್",
      kn: "ಓಂ ಕಾಕಧ್ವಜಾಯ ವಿದ್ಮಹೇ ಖಡ್ಗಹಸ್ತಾಯ ಧೀಮಹಿ ತನ್ನೋ ಮಂದಃ ಪ್ರಚೋದಯಾತ್",
      en: "Om Kakadhvajaya Vidmahe Khadgahastaya Dhimahi Tanno Mandah Prachodayat"
    },
    japaCount: 23000,
    japaCountStr: {
      kn: "೨೩,೦೦೦ ಜಪಗಳು (23,000 times)",
      en: "23,000 times",
      hi: "२३,००० जप",
      te: "23,000 జపాలు",
      ta: "23,000 ஜெபங்கள்"
    },
    gemstone: {
      kn: "ನೀಲ (Blue Sapphire / Neelam) ಅಥವಾ ಅಮೆಥಿಸ್ಟ್ (ಕಾಕನೀಲ)",
      en: "Blue Sapphire (Neelam) or Amethyst",
      hi: "नीलम (Blue Sapphire)",
      te: "నీలం (Blue Sapphire)",
      ta: "நீலம் (Blue Sapphire)"
    },
    metal: { kn: "ಕಬ್ಬಿಣ (Iron)", en: "Iron", hi: "लोहा (Iron)", te: "ఇనుము", ta: "இரும்பு" },
    danaItems: {
      kn: ["ಕಪ್ಪು ಎಳ್ಳು (Black Sesame)", "ಎಳ್ಳೆಣ್ಣೆ (Sesame Oil)", "ಕಬ್ಬಿಣದ ಪಾತ್ರೆ", "ಕಪ್ಪು ಕಂಬಳಿ", "ಉದ್ದಿನ ಬೇಳೆ"],
      en: ["Black Sesame seeds", "Mustard/Sesame oil", "Iron pan", "Black blanket on Saturday evening"],
      hi: ["काले तिल", "सरसों का तेल", "लोहे का तवा", "काली कमली", "उड़द"],
      te: ["నల్ల నువ్వులు", "నువ్వుల నూనె", "ఇనుప పాత్ర", "నల్లని దుప్పటి"],
      ta: ["கருப்பு எள்", "நல்லெண்ணெய்", "இரும்பு சட்டி", "கருப்பு போர்வை"]
    },
    auspiciousDay: { kn: "ಶನಿವಾರ ಸಂಜೆ (Saturday Twilight)", en: "Saturday Sunset", hi: "शनिवार संध्या", te: "శనివారం సాయంత్రం", ta: "சனி மாலை" },
    gokarnaRemedy: {
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸಾಡೇಸಾತಿ ಹಾಗೂ ಅಷ್ಟಮ ಶನಿ ನಿವಾರಣೆಗೆ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಎಳ್ಳೆಣ್ಣೆ ಅಭಿಷೇಕ, ಶನಿ ಮಹಾಯಾಗ ಮತ್ತು ತಿಲ ಹೋಮ.",
      en: "Sesame oil Abhisheka to Lord Mahabaleshwara at Gokarna, Shani Maha Yajna, and Tila Homa for Sade Sati / Ashtama Shani pacification.",
      hi: "गोकर्ण में साढ़ेसाती निवारण हेतु तैलाभिषेक एवं तिल होम।",
      te: "గోకర్ణంలో సాడేసాతి నివారణకు తైలాభిషేకం మరియు తిల హోమం.",
      ta: "கோகர்ணத்தில் ஏழரை சனி நிவர்த்திக்காக நல்லெண்ணெய் அபிஷேகம் மற்றும் தில ஹோமம்."
    }
  },

  [PlanetName.Rahu]: {
    planet: PlanetName.Rahu,
    name: {
      kn: "ರಾಹು (Rahu / North Node)",
      en: "Rahu (North Node)",
      hi: "राहु (Rahu)",
      te: "రాహువు (Rahu)",
      ta: "ராகு (Rahu)"
    },
    sanskrit: "राहु",
    ucchaSign: 1, // Vrishabha / Mithuna (Classical Parashara / Raman)
    ucchaSignName: {
      kn: "ವೃಷಭ / ಮಿಥುನ (Vrishabha / Mithuna)",
      en: "Taurus / Gemini",
      hi: "वृषभ / मिथुन",
      te: "వృషభం / మిథునం",
      ta: "ரிஷபம் / மிதுனம்"
    },
    ucchaDeepDegree: 15,
    neechaSign: 7, // Vrischika / Dhanus
    neechaSignName: {
      kn: "ವೃಶ್ಚಿಕ / ಧನುಸ್ಸು (Vrischika / Dhanus)",
      en: "Scorpio / Sagittarius",
      hi: "वृश्चिक / धनु",
      te: "వృశ్చికం / ధనుస్సు",
      ta: "விருச்சிகம் / தனுசு"
    },
    neechaDeepDegree: 15,
    moolatrikona: {
      sign: 10, // Kumbha
      span: "0° - 30°",
      signName: { kn: "ಕುಂಭ (Kumbha)", en: "Aquarius (Kumbha)", hi: "कुम्भ", te: "కుంభం", ta: "கும்பம்" }
    },
    swakshetra: [10],
    swakshetraNames: {
      kn: ["ಕುಂಭ (Kumbha) ಸಹ-ಅಧಿಪತಿ"],
      en: ["Aquarius (Kumbha) Co-lord"],
      hi: ["कुम्भ"],
      te: ["కుంభం"],
      ta: ["கும்பம்"]
    },
    deity: {
      kn: "ದುರ್ಗಾ ದೇವಿ / ಭೈರವ / ನಾಗದೇವತೆ",
      en: "Goddess Durga / Bhairava / Nagadevata",
      hi: "माता दुर्गा / भैरव / नागदेव",
      te: "దుర్గా దేవి / కాలభైరవుడు / నాగదేవత",
      ta: "துர்க்கை அம்மன் / பைரவர் / நாகதேவதை"
    },
    karakatwa: {
      kn: ["ಲೌಕಿಕ ಆಸೆಗಳು (Material Desires)", "ವಿದೇಶ ಪ್ರಯಾಣ (Foreign Travel)", "ತಂತ್ರಜ್ಞಾನ & ಮಾಯೆ (Tech & Illusion)", "ಅನಿರೀಕ್ಷಿತ ಏರಿಳಿತಗಳು (Sudden Swings)", "ವಿಷ & ರಹಸ್ಯಗಳು (Toxins & Secrets)"],
      en: ["Material Desires & Obsession (Bhoga)", "Foreign Lands & Unconventional Paths", "Technology, AI & Virtual Worlds", "Sudden Windfalls & Speculation", "Phobias & Toxins"],
      hi: ["माया", "विदेश यात्रा", "तकनीक", "आकस्मिक धन", "विष"],
      te: ["భోగము", "విదేశీ ప్రయాణం", "మాయ", "ఆకస్మిక లాభాలు"],
      ta: ["மாயை", "வெளிநாட்டு பயணம்", "தொழில்நுட்பம்", "திடீர் அதிர்ஷ்டம்"]
    },
    beejaMantra: {
      sa: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः",
      kn: "ಓಂ ಭ್ರಾಂ ಭ್ರೀಂ ಭ್ರೌಂ ಸಃ ರಾಹವೇ ನಮಃ",
      en: "Om Bhraam Bhreem Bhroum Sah Rahave Namah"
    },
    gayatriMantra: {
      sa: "ॐ नागध्वजाय विद्महे पद्महस्ताय धीमहि तन्नೋ ರಾಹುಃ ಪ್ರಚೋದಯಾತ್",
      kn: "ಓಂ ನಾಗಧ್ವಜಾಯ ವಿದ್ಮಹೇ ಪದ್ಮಹಸ್ತಾಯ ಧೀಮಹಿ ತನ್ನೋ ರಾಹುಃ ಪ್ರಚೋದಯಾತ್",
      en: "Om Nagadhvajaya Vidmahe Padmahastaya Dhimahi Tanno Rahuh Prachodayat"
    },
    japaCount: 18000,
    japaCountStr: {
      kn: "೧೮,೦೦೦ ಜಪಗಳು (18,000 times)",
      en: "18,000 times",
      hi: "१८,००० जप",
      te: "18,000 జపాలు",
      ta: "18,000 ஜெபங்கள்"
    },
    gemstone: {
      kn: "ಗೋಮೇಧಿಕ (Hessonite Garnet / Gomedha)",
      en: "Hessonite Garnet (Gomedha)",
      hi: "गोमेद (Hessonite)",
      te: "గోమేధికం (Gomedha)",
      ta: "கோமேதகம் (Gomedh)"
    },
    metal: { kn: "ಸೀಸ (Lead)", en: "Lead", hi: "सीसा (Lead)", te: "సీసము", ta: "ஈயம்" },
    danaItems: {
      kn: ["ಉದ್ದಿನ ಕಾಳು (Black Urad Dal)", "ಸೀಸದ ನಾಣ್ಯ", "ನೀಲಿ/ಬೂದು ವಸ್ತ್ರ", "ತೆಂಗಿನಕಾಯಿ ನದಿಗೆ ಹರಿಸುವುದು"],
      en: ["Black Urad Dal", "Lead piece", "Smoky/Blue cloth", "Coconut floating in running water on Saturday sunset"],
      hi: ["उड़द", "सीसा", "नीला वस्त्र", "नारियल बहते जल में"],
      te: ["మినుములు", "సీసము", "నీలి వస్త్రం", "కొబ్బరికాయ"],
      ta: ["உளுந்து", "ஈயம்", "நீல ஆடை", "தேங்காய்"]
    },
    auspiciousDay: { kn: "ಶನಿವಾರ ಸಂಜೆ ಅಥವಾ ರಾಹುಕಾಲ (Saturday Twilight / Rahu Kaalam)", en: "Saturday Twilight / Rahu Kaalam", hi: "शनिवार संध्या", te: "శనివారం సాయంత్రం", ta: "சனி மாலை" },
    gokarnaRemedy: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ ಕಾಳಸರ್ಪ ದೋಷ ನಿವಾರಣೆಗೆ ನಾಗ ಪ್ರತಿಷ್ಠೆ, ಸರ್ಪ ಬಲಿ / ನಾರಾಯಣ ಬಲಿ ಮತ್ತು ದುರ್ಗಾ ಸಪ್ತಶತೀ ಚಂಡಿಕಾ ಹೋಮ.",
      en: "Naga Pratishta at Gokarna Kshetra, Sarpa Shanti / Narayana Bali, and Durga Saptashati Chandika Homa.",
      hi: "गोकर्ण में कालसर्प दोष निवारण हेतु नाग प्रतिष्ठा एवं नारायण बलि।",
      te: "గోకర్ణంలో కాలసర్ప దోష నివారణకు నాగ ప్రతిష్ట మరియు నారాయణ బలి.",
      ta: "கோகர்ணத்தில் கால சர்ப்ப தோஷ நிவர்த்திக்காக நாக பிரதிஷ்டை மற்றும் சண்டி ஹோமம்."
    }
  },

  [PlanetName.Ketu]: {
    planet: PlanetName.Ketu,
    name: {
      kn: "ಕೇತು (Ketu / South Node)",
      en: "Ketu (South Node)",
      hi: "केतु (Ketu)",
      te: "కేతువు (Ketu)",
      ta: "கேது (Ketu)"
    },
    sanskrit: "केतु",
    ucchaSign: 7, // Vrischika / Dhanus
    ucchaSignName: {
      kn: "ವೃಶ್ಚಿಕ / ಧನುಸ್ಸು (Vrischika / Dhanus)",
      en: "Scorpio / Sagittarius",
      hi: "वृश्चिक / धनु",
      te: "వృశ్చికం / ధనుస్సు",
      ta: "விருச்சிகம் / தனுசு"
    },
    ucchaDeepDegree: 15,
    neechaSign: 1, // Vrishabha / Mithuna
    neechaSignName: {
      kn: "ವೃಷಭ / ಮಿಥುನ (Vrishabha / Mithuna)",
      en: "Taurus / Gemini",
      hi: "वृषभ / मिथुन",
      te: "వృషభం / మిథునం",
      ta: "ரிஷபம் / மிதுனம்"
    },
    neechaDeepDegree: 15,
    moolatrikona: {
      sign: 11, // Meena
      span: "0° - 30°",
      signName: { kn: "ಮೀನ (Meena)", en: "Pisces (Meena)", hi: "मीन", te: "మీనం", ta: "மீனம்" }
    },
    swakshetra: [7],
    swakshetraNames: {
      kn: ["ವೃಶ್ಚಿಕ (Vrischika) ಸಹ-ಅಧಿಪತಿ"],
      en: ["Scorpio (Vrischika) Co-lord"],
      hi: ["वृश्चिक"],
      te: ["వృశ్చికం"],
      ta: ["விருச்சிகம்"]
    },
    deity: {
      kn: "ಭಗವಾನ್ ಶ್ರೀ ಗಣೇಶ / ಚಿತ್ರಗುಪ್ತ",
      en: "Lord Ganesha / Chitragupta",
      hi: "भगवान श्री गणेश / चित्रगुप्त",
      te: "వినాయకుడు / చిత్రగుప్తుడు",
      ta: "விநாயகர் / சித்திரகுப்தர்"
    },
    karakatwa: {
      kn: ["ಮೋಕ್ಷ & ವೈರಾಗ್ಯ (Moksha & Liberation)", "ಆಧ್ಯಾತ್ಮ & ಜ್ಯೋತಿಷ್ಯ (Spirituality)", "ಅನಿರೀಕ್ಷಿತ ಘಟನೆಗಳು (Sudden Breaks)", "ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Surgeries)", "ಅತೀಂದ್ರಿಯ ಜ್ಞಾನ (Occult Wisdom)"],
      en: ["Moksha & Liberation (Moksha Karaka)", "Spiritual Enlightenment & Detachment", "Intuition, Astrology & Occult", "Surgeries & Sudden Severance", "Flag, High Renown & Hermit Life"],
      hi: ["मोक्ष", "अध्यात्म", "वैराग्य", "शल्यक्रिया", "रहस्य विद्या"],
      te: ["మోక్షం", "ఆధ్యాత్మికత", "వైరాగ్యం", "శస్త్రచికిత్స"],
      ta: ["மோட்சம்", "ஆன்மீகம்", "வைராக்கியம்", "அறுவை சிகிச்சை"]
    },
    beejaMantra: {
      sa: "ॐ स्रां स्रीं स्रौं सः केतवे नमः",
      kn: "ಓಂ ಸ್ರಾಂ ಸ್ರೀಂ ಸ್ರೌಂ ಸಃ ಕೇತವೇ ನಮಃ",
      en: "Om Sraam Sreem Sroum Sah Ketave Namah"
    },
    gayatriMantra: {
      sa: "ॐ अश्मध्वजाय विद्महे शूलहस्ताय धीमहि तन्नः केतुः प्रचोदयात्",
      kn: "ಓಂ ಅಶ್ಮಧ್ವಜಾಯ ವಿದ್ಮಹೇ ಶೂಲಹಸ್ತಾಯ ಧೀಮಹಿ ತನ್ನಃ ಕೇತುಃ ಪ್ರಚೋದಯಾತ್",
      en: "Om Ashmadhvajaya Vidmahe Shulahastaya Dhimahi Tannah Ketuh Prachodayat"
    },
    japaCount: 17000,
    japaCountStr: {
      kn: "೧೭,೦೦೦ ಜಪಗಳು (17,000 times)",
      en: "17,000 times",
      hi: "१७,००० जप",
      te: "17,000 జపాలు",
      ta: "17,000 ஜெபங்கள்"
    },
    gemstone: {
      kn: "ವೈಡೂರ್ಯ (Cat's Eye / Lehsunia)",
      en: "Cat's Eye (Vaidurya / Lehsunia)",
      hi: "लहसुनिया (Cat's Eye)",
      te: "వైడూర్యం (Cat's Eye)",
      ta: "வைடூரியம் (Cat's Eye)"
    },
    metal: { kn: "ಮಿಶ್ರ ಲೋಹ (Alloy / Panchadhatu)", en: "Alloy / Panchadhatu", hi: "मिश्र धातु", te: "మిశ్రమ లోహం", ta: "பஞ்சலோகம்" },
    danaItems: {
      kn: ["ಹುರುಳಿ ಕಾಳು (Horse Gram)", "ಬಹುಬಣ್ಣದ ಕಂಬಳಿ", "ಸಾಸಿವೆ (Mustard)", "ಕಬ್ಬಿಣದ ಚಾಕು"],
      en: ["Horse Gram (Kulthi)", "Multi-coloured blanket", "Mustard seeds on Tuesday/Thursday sunset"],
      hi: ["कुलथी दाल", "पंचरंगी कंबल", "सरसों"],
      te: ["ఉలవలు", "రంగురంగుల దుప్పటి", "ఆవాలు"],
      ta: ["கொள்ளு", "வண்ணப் போர்வை", "கடுகு"]
    },
    auspiciousDay: { kn: "ಮಂಗಳವಾರ ಅಥವಾ ಗುರುವಾರ ಸಂಜೆ (Tuesday / Thursday Twilight)", en: "Tuesday / Thursday Sunset", hi: "मंगलवार/गुरुवार संध्या", te: "మంగళవారం/గురువారం సాయంత్రం", ta: "செவ்வாய்/வியாழன் மாலை" },
    gokarnaRemedy: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಷ್ಟಹರ ಗಣಪತಿ ವ್ರತ, ಕೇತು ಶಾಂತಿ ಮಹಾಯಾಗ ಮತ್ತು ಅಥರ್ವಶೀರ್ಷ ಅಭಿಷೇಕ.",
      en: "Maha Ganapati Seva at Gokarna, Atharvashirsha Abhisheka, and Ketu Shanti Maha Yajna for obstacle removal and spiritual elevation.",
      hi: "गोकर्ण महागणपति में अथर्वशीर्ष अभिषेक एवं केतु शांति होम।",
      te: "గోకర్ణ మహా గణపతి సన్నిధిలో అధర్వశీర్ష అభిషేకం మరియు కేతు శాంతి హోమం.",
      ta: "கோகர்ண மகாகணபதி சன்னதியில் அதர்வசீரிஷ அபிஷேகம் மற்றும் கேது சாந்தி ஹோமம்."
    }
  }
};

// =========================================================================
// NEECHABHANGA RAJA YOGA RULES (ನೀಚಭಂಗ ರಾಜಯೋಗದ ೫ ಸುವರ್ಣ ನಿಯಮಗಳು)
// =========================================================================
export const NEECHABHANGA_RULES = {
  title: {
    kn: "ನೀಚಭಂಗ ರಾಜಯೋಗ (Neechabhanga Raja Yoga)",
    en: "Neechabhanga Raja Yoga (Cancellation of Debilitation)"
  },
  scripture: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ & ಫಲದೀಪಿಕಾ (Phaladeepika & BPHS)",
  description: {
    kn: "ಜಾತಕದಲ್ಲಿ ಯಾವುದಾದರೂ ಗ್ರಹವು ನೀಚ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದರೂ, ಈ ಕೆಳಗಿನ ಶಾಸ್ತ್ರೋಕ್ತ ೫ ಸನ್ನಿವೇಶಗಳಲ್ಲಿ ನೀಚತ್ವವು ಭಂಗವಾಗಿ, ಆ ಗ್ರಹವು ಅತ್ಯುನ್ನತ ರಾಜಯೋಗವನ್ನು ಕರುಣಿಸುತ್ತದೆ:",
    en: "When a planet is debilitated (Neecha), its weakness is nullified and converted into an extraordinary Raja Yoga under the following 5 classical rules:"
  },
  rules: [
    {
      ruleNumber: 1,
      kn: "ನೀಚ ಗ್ರಹವು ಸ್ಥಿತವಾಗಿರುವ ರಾಶಿಯ ಅಧಿಪತಿಯು ಲಗ್ನದಿಂದ ಅಥವಾ ಚಂದ್ರನಿಂದ ಕೇಂದ್ರದಲ್ಲಿದ್ದರೆ (೧, ೪, ೭, ೧೦ ನೇ ಮನೆ), ನೀಚಭಂಗ ರಾಜಯೋಗವಾಗುತ್ತದೆ.",
      en: "The lord of the sign where the debilitated planet sits is in a Kendra (1, 4, 7, 10) from the Ascendant (Lagna) or the Moon."
    },
    {
      ruleNumber: 2,
      kn: "ನೀಚ ಗ್ರಹವು ಯಾವ ರಾಶಿಯಲ್ಲಿ ಉಚ್ಚವಾಗುತ್ತದೆಯೋ, ಆ ರಾಶಿಯ ಅಧಿಪತಿಯು ಲಗ್ನದಿಂದ ಅಥವಾ ಚಂದ್ರನಿಂದ ಕೇಂದ್ರದಲ್ಲಿದ್ದರೆ ನೀಚಭಂಗವಾಗುತ್ತದೆ.",
      en: "The planet that gets exalted in the sign occupied by the debilitated planet is in a Kendra from Lagna or the Moon."
    },
    {
      ruleNumber: 3,
      kn: "ನೀಚ ಗ್ರಹವನ್ನು ಅದೇ ರಾಶಿಯ ಅಧಿಪತಿಯು ದೃಷ್ಟಿಸಿದರೆ ಅಥವಾ ಯುತಿಯಾಗಿದ್ದರೆ ತಕ್ಷಣ ನೀಚಭಂಗವಾಗುತ್ತದೆ.",
      en: "The debilitated planet is aspected by or conjunct with its own sign lord."
    },
    {
      ruleNumber: 4,
      kn: "ನೀಚ ಗ್ರಹವು ನವಾಂಶ ಕುಂಡಲಿಯಲ್ಲಿ (D9) ಉಚ್ಚ ರಾಶಿಯಲ್ಲಿದ್ದರೆ (ಉಚ್ಚ ನವಾಂಶ) ಅಥವಾ ವರ್ಗೋತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದರೆ ಪೂರ್ಣ ನೀಚಭಂಗ ಫಲ ನೀಡುತ್ತದೆ.",
      en: "The debilitated planet is exalted in the Navamsha (D9) chart or attains Vargottama status."
    },
    {
      ruleNumber: 5,
      kn: "ನೀಚ ಗ್ರಹವು ಮತ್ತೊಂದು ನೀಚ ಗ್ರಹದೊಂದಿಗೆ ಪರಸ್ಪರ ದೃಷ್ಟಿ ಹೊಂದಿದ್ದರೆ, ಇಬ್ಬರೂ ನೀಚತ್ವ ಕಳೆದುಕೊಂಡು ಪರಸ್ಪರ ಶಕ್ತಿವಂತರಾಗುತ್ತಾರೆ.",
      en: "Two debilitated planets mutually aspect each other (e.g. Sun in Libra aspecting Saturn in Aries)."
    }
  ]
};

// =========================================================================
// 27 NAKSHATRAS ENCYCLOPEDIA (೨೭ ನಕ್ಷತ್ರಗಳ ಶಾಸ್ತ್ರೀಯ ಕೋಶ)
// =========================================================================
export interface NakshatraShastraRecord {
  index: number; // 0..26
  name: { kn: string; en: string; sa: string };
  lord: PlanetName;
  lordName: { kn: string; en: string };
  rashiSpans: { kn: string; en: string };
  deity: { kn: string; en: string };
  gana: "Deva" | "Manushya" | "Rakshasa";
  ganaKn: "ದೇವ" | "ಮನುಷ್ಯ" | "ರಾಕ್ಷಸ";
  animalYoni: { kn: string; en: string };
  muhurthaQuality: { kn: string; en: string };
  isGandaMoola: boolean;
  gandantaDescription?: { kn: string; en: string };
}

export const NAKSHATRA_SHASTRA_CATALOG: NakshatraShastraRecord[] = [
  {
    index: 0,
    name: { kn: "ಅಶ್ವಿನಿ", en: "Ashwini", sa: "अश्विनी" },
    lord: PlanetName.Ketu,
    lordName: { kn: "ಕೇತು", en: "Ketu" },
    rashiSpans: { kn: "ಮೇಷ (0°00' - 13°20')", en: "Aries (0°00' - 13°20')" },
    deity: { kn: "ಅಶ್ವಿನಿ ಕುಮಾರರು (ದೇವ ವೈದ್ಯರು)", en: "Ashwini Kumaras (Divine Healers)" },
    gana: "Deva",
    ganaKn: "ದೇವ",
    animalYoni: { kn: "ಕುದುರೆ (Horse)", en: "Horse (Ashva)" },
    muhurthaQuality: { kn: "ಕ್ಷಿಪ್ರ / ಲಘು (Swift - Auspicious for medicine, travel, starting ventures)", en: "Kshipra / Laghu (Swift)" },
    isGandaMoola: true,
    gandantaDescription: {
      kn: "ಮೊದಲ ಪಾದವು ಗಂಡಮೂಲ / ಗಂಡಾಂತ ಸಂಧಿ. ಜನನ ಶಾಂತಿ ಅಗತ್ಯ (೨೭ ನಕ್ಷತ್ರ ಜಲ ಸ್ನಾನ & ಗೋ ದಾನ).",
      en: "First pada is in Ganda Moola Nakshatra Sandhi. Requires Gandanta Shanti within 27 days."
    }
  },
  {
    index: 1,
    name: { kn: "ಭರಣಿ", en: "Bharani", sa: "भरणी" },
    lord: PlanetName.Venus,
    lordName: { kn: "ಶುಕ್ರ", en: "Venus" },
    rashiSpans: { kn: "ಮೇಷ (13°20' - 26°40')", en: "Aries (13°20' - 26°40')" },
    deity: { kn: "ಯಮಧರ್ಮರಾಜ", en: "Lord Yama (God of Dharma & Transition)" },
    gana: "Manushya",
    ganaKn: "ಮನುಷ್ಯ",
    animalYoni: { kn: "ಆನೆ (Elephant)", en: "Elephant (Gaja)" },
    muhurthaQuality: { kn: "ಉಗ್ರ / ಕ್ರೂರ (Fierce - good for demolition, competition, penance)", en: "Ugra / Krura (Fierce)" },
    isGandaMoola: false
  },
  {
    index: 2,
    name: { kn: "ಕೃತಿಕಾ", en: "Krittika", sa: "कृत्तिका" },
    lord: PlanetName.Sun,
    lordName: { kn: "ಸೂರ್ಯ", en: "Sun" },
    rashiSpans: { kn: "ಮೇಷ (26°40') ರಿಂದ ವೃಷಭ (10°00')", en: "Aries 26°40' to Taurus 10°00'" },
    deity: { kn: "ಅಗ್ನಿದೇವ", en: "Lord Agni (God of Fire)" },
    gana: "Rakshasa",
    ganaKn: "ರಾಕ್ಷಸ",
    animalYoni: { kn: "ಕುರಿ (Sheep / Ram)", en: "Sheep / Ram (Mesha)" },
    muhurthaQuality: { kn: "ಮಿಶ್ರ / ಸಾಧಾರಣ (Mixed)", en: "Mishra (Mixed)" },
    isGandaMoola: false
  },
  {
    index: 3,
    name: { kn: "ರೋಹಿಣಿ", en: "Rohini", sa: "रोहिणी" },
    lord: PlanetName.Moon,
    lordName: { kn: "ಚಂದ್ರ", en: "Moon" },
    rashiSpans: { kn: "ವೃಷಭ (10°00' - 23°20')", en: "Taurus (10°00' - 23°20')" },
    deity: { kn: "ಬ್ರಹ್ಮದೇವ / ಪ್ರಜಾಪತಿ", en: "Lord Brahma / Prajapati (Creator)" },
    gana: "Manushya",
    ganaKn: "ಮನುಷ್ಯ",
    animalYoni: { kn: "ಹಾವು (Serpent)", en: "Serpent (Sarpa)" },
    muhurthaQuality: { kn: "ಸ್ಥಿರ / ಧ್ರುವ (Stable - Auspicious for coronation, housewarming, marriage)", en: "Sthira / Dhruva (Fixed)" },
    isGandaMoola: false
  },
  {
    index: 4,
    name: { kn: "ಮೃಗಶಿರ", en: "Mrigashirsha", sa: "मृगशिरा" },
    lord: PlanetName.Mars,
    lordName: { kn: "ಕುಜ", en: "Mars" },
    rashiSpans: { kn: "ವೃಷಭ (23°20') ರಿಂದ ಮಿಥುನ (6°40')", en: "Taurus 23°20' to Gemini 6°40'" },
    deity: { kn: "ಸೋಮ / ಚಂದ್ರದೇವ", en: "Soma / Moon God" },
    gana: "Deva",
    ganaKn: "ದೇವ",
    animalYoni: { kn: "ಹಾವು (Serpent)", en: "Serpent (Sarpa)" },
    muhurthaQuality: { kn: "ಮೃದು / ಮೈತ್ರ (Tender - auspicious for travel, arts, marriage)", en: "Mridu (Soft)" },
    isGandaMoola: false
  },
  {
    index: 5,
    name: { kn: "ಆರ್ದ್ರಾ", en: "Ardra", sa: "आर्द्रा" },
    lord: PlanetName.Rahu,
    lordName: { kn: "ರಾಹು", en: "Rahu" },
    rashiSpans: { kn: "ಮಿಥುನ (6°40' - 20°00')", en: "Gemini (6°40' - 20°00')" },
    deity: { kn: "ರುದ್ರ (ಶಿವನ ರೌದ್ರ ರೂಪ)", en: "Lord Rudra (Storm God)" },
    gana: "Manushya",
    ganaKn: "ಮನುಷ್ಯ",
    animalYoni: { kn: "ನಾಯಿ (Dog)", en: "Dog (Shvana)" },
    muhurthaQuality: { kn: "ತೀಕ್ಷ್ಣ / ದಾರುಣ (Sharp - good for research, overcoming obstacles)", en: "Tikshna / Daruna (Dreadful)" },
    isGandaMoola: false
  },
  {
    index: 6,
    name: { kn: "ಪುನರ್ವಸು", en: "Punarvasu", sa: "पुनर्वसु" },
    lord: PlanetName.Jupiter,
    lordName: { kn: "ಗುರು", en: "Jupiter" },
    rashiSpans: { kn: "ಮಿಥುನ (20°00') ರಿಂದ ಕರ್ಕಾಟಕ (3°20')", en: "Gemini 20°00' to Cancer 3°20'" },
    deity: { kn: "ಅದಿತಿ (ದೇವತೆಗಳ ಮಾತೆ)", en: "Aditi (Mother of the Gods)" },
    gana: "Deva",
    ganaKn: "ದೇವ",
    animalYoni: { kn: "ಬೆಕ್ಕು (Cat)", en: "Cat (Marjara)" },
    muhurthaQuality: { kn: "ಚರ (Movable - auspicious for returning home, healing, new beginnings)", en: "Chara (Movable)" },
    isGandaMoola: false
  },
  {
    index: 7,
    name: { kn: "ಪುಷ್ಯ", en: "Pushya", sa: "पुष्य" },
    lord: PlanetName.Saturn,
    lordName: { kn: "ಶನಿ", en: "Saturn" },
    rashiSpans: { kn: "ಕರ್ಕಾಟಕ (3°20' - 16°40')", en: "Cancer (3°20' - 16°40')" },
    deity: { kn: "ಬೃಹಸ್ಪತಿ (ದೇವಗುರು)", en: "Brihaspati (Priest of the Gods)" },
    gana: "Deva",
    ganaKn: "ದೇವ",
    animalYoni: { kn: "ಮೇಕೆ (Goat)", en: "Goat (Aja)" },
    muhurthaQuality: { kn: "ಕ್ಷಿಪ್ರ / ಸಾರ್ವಕಾಲಿಕ ಶುಭ (Nourishing - The King of all Nakshatras for all good works except marriage)", en: "Kshipra / Nourishing (Most Auspicious)" },
    isGandaMoola: false
  },
  {
    index: 8,
    name: { kn: "ಆಶ್ಲೇಷಾ", en: "Ashlesha", sa: "आश्लेषा" },
    lord: PlanetName.Mercury,
    lordName: { kn: "ಬುಧ", en: "Mercury" },
    rashiSpans: { kn: "ಕರ್ಕಾಟಕ (16°40' - 30°00')", en: "Cancer (16°40' - 30°00')" },
    deity: { kn: "ಸರ್ಪಗಳು / ನಾಗರಾಜ", en: "Sarpas / Nagas (Serpent Deities)" },
    gana: "Rakshasa",
    ganaKn: "ರಾಕ್ಷಸ",
    animalYoni: { kn: "ಬೆಕ್ಕು (Cat)", en: "Cat (Marjara)" },
    muhurthaQuality: { kn: "ತೀಕ್ಷ್ಣ / ದಾರುಣ (Sharp)", en: "Tikshna (Sharp)" },
    isGandaMoola: true,
    gandantaDescription: {
      kn: "೪ನೇ ಪಾದವು ಕರ್ಕಾಟಕ-ಸಿಂಹ ರಾಶಿ ಸಂಧಿಯ ಅತಿ ತೀವ್ರ ಗಂಡಾಂತ. ಆಶ್ಲೇಷಾ ಬಲಿ & ನಾಗ ಶಾಂತಿ ಪೂಜೆ ಅತ್ಯಗತ್ಯ.",
      en: "4th pada is in severe Gandanta Sandhi between Cancer and Leo. Ashlesha Bali at Gokarna required."
    }
  },
  {
    index: 9,
    name: { kn: "ಮಘಾ", en: "Magha", sa: "मघा" },
    lord: PlanetName.Ketu,
    lordName: { kn: "ಕೇತು", en: "Ketu" },
    rashiSpans: { kn: "ಸಿಂಹ (0°00' - 13°20')", en: "Leo (0°00' - 13°20')" },
    deity: { kn: "ಪಿತೃ ದೇವತೆಗಳು (Ancestors)", en: "Pitrus (Ancestral Souls)" },
    gana: "Rakshasa",
    ganaKn: "ರಾಕ್ಷಸ",
    animalYoni: { kn: "ಇಲಿ (Rat)", en: "Rat (Mushaka)" },
    muhurthaQuality: { kn: "ಉಗ್ರ / ಕ್ರೂರ (Fierce - royal ceremonies, ancestral rites)", en: "Ugra (Fierce)" },
    isGandaMoola: true,
    gandantaDescription: {
      kn: "೧ನೇ ಪಾದವು ಗಂಡಮೂಲ ಸಂಧಿ. ಪಿತೃ ಶಾಂತಿ & ನಾರಾಯಣ ಬಲಿ ಪೂಜೆ ಹಿತಕರ.",
      en: "First pada is Ganda Moola Gandanta. Pitru Tarpan and Narayana Bali recommended."
    }
  },
  {
    index: 10,
    name: { kn: "ಪೂರ್ವ ಫಲ್ಗುಣಿ", en: "Purva Phalguni", sa: "पूर्वफाल्गुनी" },
    lord: PlanetName.Venus,
    lordName: { kn: "ಶುಕ್ರ", en: "Venus" },
    rashiSpans: { kn: "ಸಿಂಹ (13°20' - 26°40')", en: "Leo (13°20' - 26°40')" },
    deity: { kn: "ಭಾಗ (ಸಂತೋಷ & ಸಮೃದ್ಧಿ ದೇವ)", en: "Bhaga (God of Fortune & Prosperity)" },
    gana: "Manushya",
    ganaKn: "ಮನುಷ್ಯ",
    animalYoni: { kn: "ಇಲಿ (Rat)", en: "Rat (Mushaka)" },
    muhurthaQuality: { kn: "ಉಗ್ರ (Fierce)", en: "Ugra (Fierce)" },
    isGandaMoola: false
  },
  {
    index: 11,
    name: { kn: "ಉತ್ತರ ಫಲ್ಗುಣಿ", en: "Uttara Phalguni", sa: "उत्तरफाल्गुनी" },
    lord: PlanetName.Sun,
    lordName: { kn: "ಸೂರ್ಯ", en: "Sun" },
    rashiSpans: { kn: "ಸಿಂಹ (26°40') ರಿಂದ ಕನ್ಯಾ (10°00')", en: "Leo 26°40' to Virgo 10°00'" },
    deity: { kn: "ಅರ್ಯಮನ್ (ಸ್ನೇಹ & ಉಪಕಾರ ದೇವ)", en: "Aryaman (God of Patronage & Contracts)" },
    gana: "Manushya",
    ganaKn: "ಮನುಷ್ಯ",
    animalYoni: { kn: "ಹಸು / ಎತ್ತು (Cow / Bull)", en: "Cow / Bull (Gau)" },
    muhurthaQuality: { kn: "ಸ್ಥಿರ / ಧ್ರುವ (Stable - auspicious for marriage and vows)", en: "Sthira (Fixed)" },
    isGandaMoola: false
  },
  {
    index: 12,
    name: { kn: "ಹಸ್ತ", en: "Hasta", sa: "हस्त" },
    lord: PlanetName.Moon,
    lordName: { kn: "ಚಂದ್ರ", en: "Moon" },
    rashiSpans: { kn: "ಕನ್ಯಾ (10°00' - 23°20')", en: "Virgo (10°00' - 23°20')" },
    deity: { kn: "ಸವಿತೃ (ಸೂರ್ಯನ ಜ್ಞಾನ ರೂಪ)", en: "Savitur (Sun God of Intellect)" },
    gana: "Deva",
    ganaKn: "ದೇವ",
    animalYoni: { kn: "ಕೋಣ (Buffalo)", en: "Buffalo (Mahisha)" },
    muhurthaQuality: { kn: "ಕ್ಷಿಪ್ರ / ಲಘು (Swift - great for arts, crafts, commerce)", en: "Kshipra (Swift)" },
    isGandaMoola: false
  },
  {
    index: 13,
    name: { kn: "ಚಿತ್ತಾ", en: "Chitra", sa: "चित्रा" },
    lord: PlanetName.Mars,
    lordName: { kn: "ಕುಜ", en: "Mars" },
    rashiSpans: { kn: "ಕನ್ಯಾ (23°20') ರಿಂದ ತುಲಾ (6°40')", en: "Virgo 23°20' to Libra 6°40'" },
    deity: { kn: "ತ್ವಷ್ಟಾ / ವಿಶ್ವಕರ್ಮ (ದೈವಿಕ ವಾಸ್ತುಶಿಲ್ಪಿ)", en: "Tvashtar / Vishwakarma (Divine Architect)" },
    gana: "Rakshasa",
    ganaKn: "ರಾಕ್ಷಸ",
    animalYoni: { kn: "ಹುಲಿ (Tiger)", en: "Tiger (Vyaghra)" },
    muhurthaQuality: { kn: "ಮೃದು / ಚಿತ್ರ (Tender)", en: "Mridu (Soft)" },
    isGandaMoola: false
  },
  {
    index: 14,
    name: { kn: "ಸ್ವಾತಿ", en: "Swati", sa: "स्वाती" },
    lord: PlanetName.Rahu,
    lordName: { kn: "ರಾಹು", en: "Rahu" },
    rashiSpans: { kn: "ತುಲಾ (6°40' - 20°00')", en: "Libra (6°40' - 20°00')" },
    deity: { kn: "ವಾಯುದೇವ (ಪವನ)", en: "Lord Vayu (Wind God)" },
    gana: "Deva",
    ganaKn: "ದೇವ",
    animalYoni: { kn: "ಕೋಣ (Buffalo)", en: "Buffalo (Mahisha)" },
    muhurthaQuality: { kn: "ಚರ (Movable - auspicious for travel, vehicles, business expansion)", en: "Chara (Movable)" },
    isGandaMoola: false
  },
  {
    index: 15,
    name: { kn: "ವಿಶಾಖಾ", en: "Vishakha", sa: "विशाखा" },
    lord: PlanetName.Jupiter,
    lordName: { kn: "ಗುರು", en: "Jupiter" },
    rashiSpans: { kn: "ತುಲಾ (20°00') ರಿಂದ ವೃಶ್ಚಿಕ (3°20')", en: "Libra 20°00' to Scorpio 3°20'" },
    deity: { kn: "ಇಂದ್ರಾಗ್ನಿ (ಇಂದ್ರ ಮತ್ತು ಅಗ್ನಿ ಜೋಡಿ)", en: "Indragni (Indra & Agni)" },
    gana: "Rakshasa",
    ganaKn: "ರಾಕ್ಷಸ",
    animalYoni: { kn: "ಹುಲಿ (Tiger)", en: "Tiger (Vyaghra)" },
    muhurthaQuality: { kn: "ಮಿಶ್ರ / ಸಾಧಾರಣ (Mixed)", en: "Mishra (Mixed)" },
    isGandaMoola: false
  },
  {
    index: 16,
    name: { kn: "ಅನೂರಾಧಾ", en: "Anuradha", sa: "अनुराधा" },
    lord: PlanetName.Saturn,
    lordName: { kn: "ಶನಿ", en: "Saturn" },
    rashiSpans: { kn: "ವೃಶ್ಚಿಕ (3°20' - 16°40')", en: "Scorpio (3°20' - 16°40')" },
    deity: { kn: "ಮಿತ್ರ (ಸ್ನೇಹ & ಧರ್ಮ ದೇವ)", en: "Mitra (God of Friendship & Devotion)" },
    gana: "Deva",
    ganaKn: "ದೇವ",
    animalYoni: { kn: "ಜಿಂಕೆ (Deer)", en: "Deer (Mriga)" },
    muhurthaQuality: { kn: "ಮೃದು / ಮೈತ್ರ (Tender - auspicious for travel, arts, friendship)", en: "Mridu (Soft)" },
    isGandaMoola: false
  },
  {
    index: 17,
    name: { kn: "ಜ್ಯೇಷ್ಠಾ", en: "Jyeshtha", sa: "ज्येष्ठा" },
    lord: PlanetName.Mercury,
    lordName: { kn: "ಬುಧ", en: "Mercury" },
    rashiSpans: { kn: "ವೃಶ್ಚಿಕ (16°40' - 30°00')", en: "Scorpio (16°40' - 30°00')" },
    deity: { kn: "ದೇವೇಂದ್ರ (King of the Gods)", en: "Lord Indra (King of the Gods)" },
    gana: "Rakshasa",
    ganaKn: "ರಾಕ್ಷಸ",
    animalYoni: { kn: "ಜಿಂಕೆ (Deer)", en: "Deer (Mriga)" },
    muhurthaQuality: { kn: "ತೀಕ್ಷ್ಣ / ದಾರುಣ (Sharp)", en: "Tikshna (Sharp)" },
    isGandaMoola: true,
    gandantaDescription: {
      kn: "೪ನೇ ಪಾದವು ವೃಶ್ಚಿಕ-ಧನುಸ್ಸು ಮಹಾ ಗಂಡಾಂತ ಸಂಧಿ (ಜಲ-ಅಗ್ನಿ ಸಂಧಿ). ಜ್ಯೇಷ್ಠಾ ಶಾಂತಿ & ರುದ್ರಾಭಿಷೇಕ ಅಗತ್ಯ.",
      en: "4th pada is critical Jyeshtha-Moola Gandanta junction. Jyeshtha Shanti & Rudrabhisheka required."
    }
  },
  {
    index: 18,
    name: { kn: "ಮೂಲಾ", en: "Moola", sa: "मूला" },
    lord: PlanetName.Ketu,
    lordName: { kn: "ಕೇತು", en: "Ketu" },
    rashiSpans: { kn: "ಧನುಸ್ಸು (0°00' - 13°20')", en: "Sagittarius (0°00' - 13°20')" },
    deity: { kn: "ನಿರೃತಿ (ವಿನಾಶ & ಕತ್ತಲೆಯ ದೇವತೆ)", en: "Nirriti (Goddess of Destruction & Deep Truth)" },
    gana: "Rakshasa",
    ganaKn: "ರಾಕ್ಷಸ",
    animalYoni: { kn: "ನಾಯಿ (Dog)", en: "Dog (Shvana)" },
    muhurthaQuality: { kn: "ತೀಕ್ಷ್ಣ / ದಾರುಣ (Sharp - rooting out secrets, research)", en: "Tikshna (Sharp)" },
    isGandaMoola: true,
    gandantaDescription: {
      kn: "೧ನೇ ಪಾದವು ಅತಿ ಪ್ರಮುಖ ಮೂಲ ನಕ್ಷತ್ರ ಗಂಡಾಂತ. ಗೋಕರ್ಣದಲ್ಲಿ ಮೂಲ ಶಾಂತಿ & ಪೋಷಕರ ದೃಷ್ಟಿದೋಷ ನಿವಾರಣೆ ಪೂಜೆ ಅಗತ್ಯ.",
      en: "1st pada is primary Moola Nakshatra Gandanta. Moola Shanti at Gokarna recommended."
    }
  },
  {
    index: 19,
    name: { kn: "ಪೂರ್ವಾಷಾಢಾ", en: "Purva Ashadha", sa: "पूर्वाषाढ़ा" },
    lord: PlanetName.Venus,
    lordName: { kn: "ಶುಕ್ರ", en: "Venus" },
    rashiSpans: { kn: "ಧನುಸ್ಸು (13°20' - 26°40')", en: "Sagittarius (13°20' - 26°40')" },
    deity: { kn: "ಆಪಃ (ಜಲದೇವತೆ)", en: "Apas (Water Deity)" },
    gana: "Manushya",
    ganaKn: "ಮನುಷ್ಯ",
    animalYoni: { kn: "ಮಂಗ (Monkey)", en: "Monkey (Vanara)" },
    muhurthaQuality: { kn: "ಉಗ್ರ / ಕ್ರೂರ (Fierce - battle, winning arguments)", en: "Ugra (Fierce)" },
    isGandaMoola: false
  },
  {
    index: 20,
    name: { kn: "ಉತ್ತರಾಷಾಢಾ", en: "Uttara Ashadha", sa: "उत्तराषाढ़ा" },
    lord: PlanetName.Sun,
    lordName: { kn: "ಸೂರ್ಯ", en: "Sun" },
    rashiSpans: { kn: "ಧನುಸ್ಸು (26°40') ರಿಂದ ಮಕರ (10°00')", en: "Sagittarius 26°40' to Capricorn 10°00'" },
    deity: { kn: "ವಿಶ್ವೇದೇವತೆಗಳು (ಸಮಸ್ತ ದೇವತೆಗಳ ಗಣ)", en: "Vishwadevas (Universal Gods)" },
    gana: "Manushya",
    ganaKn: "ಮನುಷ್ಯ",
    animalYoni: { kn: "ಮುಂಗುಸಿ (Mongoose)", en: "Mongoose (Nakula)" },
    muhurthaQuality: { kn: "ಸ್ಥಿರ / ಧ್ರುವ (Stable - permanent achievements, foundation laying)", en: "Sthira (Fixed)" },
    isGandaMoola: false
  },
  {
    index: 21,
    name: { kn: "ಶ್ರವಣ", en: "Shravana", sa: "श्रवण" },
    lord: PlanetName.Moon,
    lordName: { kn: "ಚಂದ್ರ", en: "Moon" },
    rashiSpans: { kn: "ಮಕರ (10°00' - 23°20')", en: "Capricorn (10°00' - 23°20')" },
    deity: { kn: "ಭಗವಾನ್ ಶ್ರೀ ಮಹಾವಿಷ್ಣು", en: "Lord Maha Vishnu" },
    gana: "Deva",
    ganaKn: "ದೇವ",
    animalYoni: { kn: "ಮಂಗ (Monkey)", en: "Monkey (Vanara)" },
    muhurthaQuality: { kn: "ಚರ (Movable - auspicious for education, travel, mantra deeksha)", en: "Chara (Movable)" },
    isGandaMoola: false
  },
  {
    index: 22,
    name: { kn: "ಧನಿಷ್ಠಾ", en: "Dhanishta", sa: "धनिष्ठा" },
    lord: PlanetName.Mars,
    lordName: { kn: "ಕುಜ", en: "Mars" },
    rashiSpans: { kn: "ಮಕರ (23°20') ರಿಂದ ಕುಂಭ (6°40')", en: "Capricorn 23°20' to Aquarius 6°40'" },
    deity: { kn: "ಅಷ್ಟ ವಸುಗಳು (೮ ಪ್ರಕೃತಿ ಶಕ್ತಿಗಳು)", en: "Ashta Vasus (Eight Gods of Abundance)" },
    gana: "Rakshasa",
    ganaKn: "ರಾಕ್ಷಸ",
    animalYoni: { kn: "ಸಿಂಹ (Lion)", en: "Lion (Simha)" },
    muhurthaQuality: { kn: "ಚರ (Movable - music, wealth accumulation, finance)", en: "Chara (Movable)" },
    isGandaMoola: false
  },
  {
    index: 23,
    name: { kn: "ಶತಭಿಷಾ", en: "Shatabhisha", sa: "शतभिषा" },
    lord: PlanetName.Rahu,
    lordName: { kn: "ರಾಹು", en: "Rahu" },
    rashiSpans: { kn: "ಕುಂಭ (6°40' - 20°00')", en: "Aquarius (6°40' - 20°00')" },
    deity: { kn: "ವರುಣದೇವ (ಸಮುದ್ರ & ಆಕಾಶ ದೇವ)", en: "Lord Varuna (God of Cosmic Oceans & Healing)" },
    gana: "Rakshasa",
    ganaKn: "ರಾಕ್ಷಸ",
    animalYoni: { kn: "ಕುದುರೆ (Horse)", en: "Horse (Ashva)" },
    muhurthaQuality: { kn: "ಚರ (Movable - medicinal treatments, astrology, esoteric science)", en: "Chara (Movable)" },
    isGandaMoola: false
  },
  {
    index: 24,
    name: { kn: "ಪೂರ್ವ ಭಾದ್ರಪದ", en: "Purva Bhadrapada", sa: "पूर्वभाद्रपदा" },
    lord: PlanetName.Jupiter,
    lordName: { kn: "ಗುರು", en: "Jupiter" },
    rashiSpans: { kn: "ಕುಂಭ (20°00') ರಿಂದ ಮೀನ (3°20')", en: "Aquarius 20°00' to Pisces 3°20'" },
    deity: { kn: "ಅಜ ಏಕಪಾದ (ರುದ್ರ ರೂಪ)", en: "Aja Ekapada (One-footed Serpent/Rudra)" },
    gana: "Manushya",
    ganaKn: "ಮನುಷ್ಯ",
    animalYoni: { kn: "ಸಿಂಹ (Lion)", en: "Lion (Simha)" },
    muhurthaQuality: { kn: "ಉಗ್ರ / ಕ್ರೂರ (Fierce - spiritual tapas, renunciation)", en: "Ugra (Fierce)" },
    isGandaMoola: false
  },
  {
    index: 25,
    name: { kn: "ಉತ್ತರ ಭಾದ್ರಪದ", en: "Uttara Bhadrapada", sa: "उत्तरभाद्रपदा" },
    lord: PlanetName.Saturn,
    lordName: { kn: "ಶನಿ", en: "Saturn" },
    rashiSpans: { kn: "ಮೀನ (3°20' - 16°40')", en: "Pisces (3°20' - 16°40')" },
    deity: { kn: "ಅಹಿರ್ಬುಧ್ನ್ಯ (ಆಳವಾದ ಕುಂಡಲಿನಿ ಸರ್ಪ)", en: "Ahirbudhnya (Serpent of the Depths)" },
    gana: "Manushya",
    ganaKn: "ಮನುಷ್ಯ",
    animalYoni: { kn: "ಹಸು (Cow)", en: "Cow (Gau)" },
    muhurthaQuality: { kn: "ಸ್ಥಿರ / ಧ್ರುವ (Stable - spiritual foundation, meditation, charity)", en: "Sthira (Fixed)" },
    isGandaMoola: false
  },
  {
    index: 26,
    name: { kn: "ರೇವತಿ", en: "Revati", sa: "रेवती" },
    lord: PlanetName.Mercury,
    lordName: { kn: "ಬುಧ", en: "Mercury" },
    rashiSpans: { kn: "ಮೀನ (16°40' - 30°00')", en: "Pisces (16°40' - 30°00')" },
    deity: { kn: "ಪೂಷನ್ (ಪೋಷಕ & ಮಾರ್ಗದರ್ಶಿ ದೇವ)", en: "Pushan (Nourisher & Guide of Travelers)" },
    gana: "Deva",
    ganaKn: "ದೇವ",
    animalYoni: { kn: "ಆನೆ (Elephant)", en: "Elephant (Gaja)" },
    muhurthaQuality: { kn: "ಮೃದು / ಮೈತ್ರ (Tender - auspicious for travel, arts, trade)", en: "Mridu (Soft)" },
    isGandaMoola: true,
    gandantaDescription: {
      kn: "೪ನೇ ಪಾದವು ರಾಶಿಚಕ್ರದ ಅಂತಿಮ ಗಂಡಾಂತ ಸಂಧಿ (ಮೀನ-ಮೇಷ ಸಂಧಿ). ರೇವತಿ ಶಾಂತಿ ಪೂಜೆ ಅತ್ಯಗತ್ಯ.",
      en: "4th pada is the final Gandanta Sandhi of the Zodiac (Pisces-Aries). Revati Shanti recommended."
    }
  }
];

// =========================================================================
// 12 BHAVAS (HOUSES) ENCYCLOPEDIA (೧೨ ಭಾವಗಳ ಸಮಗ್ರ ಕಾರಕತ್ವ ಕೋಶ)
// =========================================================================
export interface BhavaShastraRecord {
  houseNumber: number; // 1..12
  name: { kn: string; en: string };
  sanskritName: string;
  classification: { kn: string; en: string };
  karakatwas: { kn: string[]; en: string[] };
  bodyParts: { kn: string; en: string };
  keySignificator: PlanetName; // Karaka
}

export const BHAVA_SHASTRA_CATALOG: BhavaShastraRecord[] = [
  {
    houseNumber: 1,
    name: { kn: "ತನು ಭಾವ / ಲಗ್ನ (Lagna / 1st House)", en: "Tanu Bhava (1st House - Ascendant)" },
    sanskritName: "तनु भाव (Lagna)",
    classification: { kn: "ಕೇಂದ್ರ ಹಾಗೂ ತ್ರಿಕೋನ (Kendra & Trikona - ಅತ್ಯಂತ ಶುಭ)", en: "Kendra & Trikona (Supreme Pillar of Life)" },
    karakatwas: {
      kn: ["ದೇಹದ ರೂಪ & ವರ್ಣ", "ಆತ್ಮವಿಶ್ವಾಸ & ವ್ಯಕ್ತಿತ್ವ", "ಆಯುಷ್ಯ & ಆರೋಗ್ಯ", "ಪ್ರವೃತ್ತಿ & ಮನೋಭಾವ", "ಜೀವನದ ಆರಂಭ"],
      en: ["Physical Body & Complexion", "Self-confidence & Personality", "Longevity & Vitality", "General Nature & Temperament", "Life Outlook"]
    },
    bodyParts: { kn: "ತಲೆ & ಮುಖ (Head & Face)", en: "Head, Brain & Forehead" },
    keySignificator: PlanetName.Sun
  },
  {
    houseNumber: 2,
    name: { kn: "ಧನ & ಕುಟುಂಬ ಭಾವ (2nd House)", en: "Dhana Bhava (2nd House - Wealth & Family)" },
    sanskritName: "धन भाव",
    classification: { kn: "ಮಾರಕ ಹಾಗೂ ಧನ ಸ್ಥಾನ (Maraka & Dhana)", en: "Maraka & Wealth House" },
    karakatwas: {
      kn: ["ಸಂಚಿತ ಸಂಪತ್ತು (Accumulated Wealth)", "ಕುಟುಂಬ (Immediate Family)", "ವಾಕ್ ಶಕ್ತಿ & ಮಾತು (Speech)", "ಬಲಗಣ್ಣು (Right Eye)", "ಆಹಾರ ಪದ್ಧತಿ (Food Habits)"],
      en: ["Accumulated Wealth & Assets", "Family Heritage", "Vocal Expression & Speech", "Right Eye & Facial Countenance", "Eating Habits"]
    },
    bodyParts: { kn: "ಮುಖ, ಗಂಟಲು, ಬಲಗಣ್ಣು, ಹಲ್ಲುಗಳು", en: "Face, Throat, Right Eye, Teeth, Tongue" },
    keySignificator: PlanetName.Jupiter
  },
  {
    houseNumber: 3,
    name: { kn: "ಸಹಜ & ಭ್ರಾತೃ ಭಾವ (3rd House)", en: "Sahaja Bhava (3rd House - Courage & Siblings)" },
    sanskritName: "सहज भाव",
    classification: { kn: "ಉಪಚಯ ಹಾಗೂ ಆಯುಷ್ಯ ಸ್ಥಾನ (Upachaya & Life Force)", en: "Upachaya House (Grows with Effort)" },
    karakatwas: {
      kn: ["ಧೈರ್ಯ & ಪರಾಕ್ರಮ (Valour)", "ಕಿರಿಯ ಸಹೋದರರು (Younger Siblings)", "ಸಂವಹನ & ಬರವಣಿಗೆ (Communication)", "ಸಣ್ಣ ಪ್ರಯಾಣಗಳು (Short Journeys)", "ಹವ್ಯಾಸಗಳು"],
      en: ["Courage & Willpower", "Younger Siblings", "Communication, Writing & Media", "Short Journeys", "Hobbies & Manual Dexterity"]
    },
    bodyParts: { kn: "ಭುಜಗಳು, ತೋಳುಗಳು, ಕಿವಿಗಳು", en: "Shoulders, Arms, Hands, Right Ear" },
    keySignificator: PlanetName.Mars
  },
  {
    houseNumber: 4,
    name: { kn: "ಸುಖ & ಮಾತೃ ಭಾವ (4th House)", en: "Sukha Bhava (4th House - Mother & Home)" },
    sanskritName: "सुख भाव",
    classification: { kn: "ಕೇಂದ್ರ ಹಾಗೂ ಮೋಕ್ಷ ತ್ರಿಕೋನ (Kendra & Moksha Trikona)", en: "Kendra House (Foundation of Happiness)" },
    karakatwas: {
      kn: ["ತಾಯಿ (Mother)", "ಮನೆ & ವಾಹನಗಳು (Home & Vehicles)", "ಸ್ಥಿರ ಆಸ್ತಿ & ಭೂಮಿ (Real Estate)", "ಮಾನಸಿಕ ಸುಖ & ಸಮಾಧಾನ", "ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ"],
      en: ["Mother (Matri)", "Home, Vehicles & Comforts", "Real Estate & Land", "Mental Peace & Emotional Security", "Foundational Education"]
    },
    bodyParts: { kn: "ಎದೆ, ಹೃದಯ, ಶ್ವಾಸಕೋಶ", en: "Chest, Heart, Lungs, Breast" },
    keySignificator: PlanetName.Moon
  },
  {
    houseNumber: 5,
    name: { kn: "ಪುತ್ರ & ಪೂರ್ವ ಪುಣ್ಯ ಭಾವ (5th House)", en: "Putra Bhava (5th House - Children & Intellect)" },
    sanskritName: "पुत्र भाव (पूर्व पुण्य)",
    classification: { kn: "ತ್ರಿಕೋನ (Trikona - ಲಕ್ಷ್ಮೀ ಸ್ಥಾನ)", en: "Trikona House (House of Lakshmi & Grace)" },
    karakatwas: {
      kn: ["ಸಂತಾನ (Children)", "ಬುದ್ಧಿಮತ್ತೆ & ಪ್ರತಿಭೆ (Intellect)", "ಪೂರ್ವ ಜನ್ಮದ ಪುಣ್ಯ (Past Life Merit)", "ಮಂತ್ರ ಜಪ & ಸಾಧನೆ", "ಹಣಕಾಸಿನ ಹೂಡಿಕೆ"],
      en: ["Progeny & Children (Putra)", "Creativity, Wisdom & Intellect", "Past Life Merits (Purva Punya)", "Mantras, Yantras & Spiritual Speculation", "Investments"]
    },
    bodyParts: { kn: "ಹೊಟ್ಟೆ, ಜಠರ, ಬೆನ್ನುಹುರಿ", en: "Stomach, Upper Abdomen, Spine" },
    keySignificator: PlanetName.Jupiter
  },
  {
    houseNumber: 6,
    name: { kn: "ಶತ್ರು & ರೋಗ ಭಾವ (6th House)", en: "Ripu Bhava (6th House - Health, Debts & Enemies)" },
    sanskritName: "रिपु / रोग भाव",
    classification: { kn: "ದುಸ್ಥಾನ ಹಾಗೂ ಉಪಚಯ (Dusthana & Upachaya)", en: "Dusthana & Upachaya (Overcoming Battles)" },
    karakatwas: {
      kn: ["ರೋಗ & ಅನಾರೋಗ್ಯ (Diseases)", "ಸಾಲಗಳು (Debts & Loans)", "ಶತ್ರುಗಳು & ಸ್ಪರ್ಧೆ (Enemies & Litigation)", "ದೈನಂದಿನ ಸೇವೆ & ನೌಕರಿ", "ಸಹನೆ"],
      en: ["Diseases & Chronic Ailments", "Financial Debts & Liabilities", "Enemies, Legal Litigations & Competitions", "Daily Service & Employment", "Maternal Uncles"]
    },
    bodyParts: { kn: "ಸಣ್ಣ ಕರುಳು, ಜೀರ್ಣಾಂಗಗಳು, ಸೊಂಟ", en: "Intestines, Digestive Tract, Kidney Region" },
    keySignificator: PlanetName.Mars
  },
  {
    houseNumber: 7,
    name: { kn: "ಕಳತ್ರ & ಜಾಯಾ ಭಾವ (7th House)", en: "Kalatra Bhava (7th House - Marriage & Partnership)" },
    sanskritName: "कलत्र भाव",
    classification: { kn: "ಕೇಂದ್ರ ಹಾಗೂ ಮಾರಕ ಸ್ಥಾನ (Kendra & Maraka)", en: "Kendra & Maraka (Public Relations & Partner)" },
    karakatwas: {
      kn: ["ವಿವಾಹ & ಜೀವನ ಸಂಗಾತಿ (Spouse)", "ವ್ಯವಹಾರಿಕ ಪಾಲುದಾರಿಕೆ (Business Partnerships)", "ಸಾರ್ವಜನಿಕ ಸಂಬಂಧಗಳು", "ವಿದೇಶ ವಾಸ & ವ್ಯಾಪಾರ", "ಲೈಂಗಿಕ ಜೀವನ"],
      en: ["Spouse & Marriage (Kalatra)", "Business Partnerships & Contracts", "Public Image & Social Encounters", "Foreign Travel & Commercial Relations", "Maraka Influences"]
    },
    bodyParts: { kn: "ಸಂತಾನೋತ್ಪತ್ತಿ ಅಂಗಗಳು, ಮೂತ್ರಕೋಶ", en: "Reproductive Organs, Pelvis, Bladder" },
    keySignificator: PlanetName.Venus
  },
  {
    houseNumber: 8,
    name: { kn: "ಆಯುಷ್ಯ & ರಂಧ್ರ ಭಾವ (8th House)", en: "Ayur Bhava (8th House - Longevity & Transformation)" },
    sanskritName: "आयुर् / रन्ध्र भाव",
    classification: { kn: "ತೀವ್ರ ದುಸ್ಥಾನ ಹಾಗೂ ಮೋಕ್ಷ ತ್ರಿಕೋನ (Deep Dusthana)", en: "Deep Dusthana & Moksha Trikona (Transformation)" },
    karakatwas: {
      kn: ["ಆಯುರ್ಬಲ (Longevity)", "ಅನಿರೀಕ್ಷಿತ ಆಘಾತಗಳು ಅಥವಾ ಲಾಭಗಳು", "ಗುಪ್ತ ಜ್ಞಾನ & ಗೂಢ ಶಾಸ್ತ್ರ (Occult)", "ವಿಲ್ & ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿ", "ಅವಮಾನ ಅಥವಾ ಪುನರುಜ್ಜೀವನ"],
      en: ["Longevity (Ayush) & Death", "Sudden Unexpected Calamities or Windfalls", "Occult, Astrology & Mysticism", "Unearned Wealth, Inheritances & Insurance", "Surgeries & Transformation"]
    },
    bodyParts: { kn: "ಗುಹ್ಯಾಂಗಗಳು, ವಿಸರ್ಜನಾಂಗಗಳು", en: "Excretory System, Genitals, Anus" },
    keySignificator: PlanetName.Saturn
  },
  {
    houseNumber: 9,
    name: { kn: "ಭಾಗ್ಯ & ಧರ್ಮ ಭಾವ (9th House)", en: "Bhagya Bhava (9th House - Fortune & Dharma)" },
    sanskritName: "भाग्य भाव (धर्म)",
    classification: { kn: "ಅತ್ಯುನ್ನತ ತ್ರಿಕೋನ (Supreme Trikona - ಪರಮ ಲಕ್ಷ್ಮೀ ಸ್ಥಾನ)", en: "Supreme Trikona (House of Divine Fortune & Dharma)" },
    karakatwas: {
      kn: ["ಭಾಗ್ಯೋದಯ (Fortune & Luck)", "ತಂದೆ & ಗುರು (Father & Spiritual Preceptor)", "ಧರ್ಮ & ದೇವತಾ ಭಕ್ತಿ", "ಉನ್ನತ ಶಿಕ್ಷಣ & ವಿದೇಶ ತೀರ್ಥಯಾತ್ರೆ", "ಪುಣ್ಯ ಕರ್ಮಗಳು"],
      en: ["Supreme Fortune & Luck (Bhagya)", "Father (Pitru) & Spiritual Preceptor (Guru)", "Dharma, Piety & Higher Truth", "Long Pilgrimages & Foreign Wisdom", "Temple Construction & Charities"]
    },
    bodyParts: { kn: "ತೊಡೆಗಳು, ಸೊಂಟದ ಕೆಳಭಾಗ", en: "Thighs, Hips, Arterial System" },
    keySignificator: PlanetName.Jupiter
  },
  {
    houseNumber: 10,
    name: { kn: "ಕರ್ಮ ಭಾವ (10th House)", en: "Karma Bhava (10th House - Career & Status)" },
    sanskritName: "कर्म भाव",
    classification: { kn: "ಅತ್ಯುನ್ನತ ಕೇಂದ್ರ ಹಾಗೂ ಉಪಚಯ (Supreme Kendra & Upachaya)", en: "Supreme Kendra & Upachaya (Apex of Achievement)" },
    karakatwas: {
      kn: ["ಉದ್ಯೋಗ & ವ್ಯಾಪಾರ (Profession & Career)", "ಕೀರ್ತಿ & ಯಶಸ್ಸು (Fame & Public Recognition)", "ಅಧಿಕಾರ & ರಾಜಕೀಯ (Authority & Power)", "ಸಾಮಾಜಿಕ ಗೌರವ", "ಜೀವನದ ಕರ್ತವ್ಯ"],
      en: ["Profession, Vocation & Career (Karma)", "Fame, Renown & Public Honor", "Authority, Government Connections & Leadership", "Father's Legacy", "Life Accomplishments"]
    },
    bodyParts: { kn: "ಮಂಡಿಗಳು, ಕೀಲುಗಳು", en: "Knees, Joints, Skeletal Frame" },
    keySignificator: PlanetName.Mercury
  },
  {
    houseNumber: 11,
    name: { kn: "ಲಾಭ & ಆಯ ಭಾವ (11th House)", en: "Labha Bhava (11th House - Gains & Networks)" },
    sanskritName: "लाभ भाव (आय)",
    classification: { kn: "ಅತ್ಯುತ್ತಮ ಉಪಚಯ (Supreme Upachaya - ಆಕಾಂಕ್ಷಾ ಸಿದ್ಧಿ)", en: "Supreme Upachaya (Fulfillment of Desires)" },
    karakatwas: {
      kn: ["ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ (Fulfillment of Desires)", "ಆದಾಯ & ಧನಲಾಭ (Gains & Profits)", "ಹಿರಿಯ ಸಹೋದರರು (Elder Siblings)", "ಸ್ನೇಹಿತರು & ಪ್ರಭಾವಿ ವಲಯ (Social Network)", "ಪ್ರಶಸ್ತಿಗಳು"],
      en: ["Gains, Profits & Revenues (Labha)", "Fulfillment of Ambitions & Wishes", "Elder Siblings (Jyeshta Bhratri)", "Social Circles, Elite Networks & Communities", "Awards & Honours"]
    },
    bodyParts: { kn: "ಕಾಲುಗಳ ಕೆಳಭಾಗ, ಕಣಕಾಲುಗಳು, ಎಡಕಿವಿ", en: "Shins, Ankles, Left Ear" },
    keySignificator: PlanetName.Jupiter
  },
  {
    houseNumber: 12,
    name: { kn: "ವ್ಯಯ & ಮೋಕ್ಷ ಭಾವ (12th House)", en: "Vyaya Bhava (12th House - Losses & Liberation)" },
    sanskritName: "व्यय भाव (मोक्ष)",
    classification: { kn: "ದುಸ್ಥಾನ ಹಾಗೂ ಪರಮ ಮೋಕ್ಷ ತ್ರಿಕೋನ (Dusthana & Supreme Moksha)", en: "Dusthana & Supreme Moksha (Transcendence)" },
    karakatwas: {
      kn: ["ಮೋಕ್ಷ & ಮುಕ್ತಿ (Spiritual Liberation)", "ವ್ಯಯ & ಖರ್ಚುಗಳು (Expenditure)", "ವಿದೇಶ ವಾಸ & ದೂರದ ಪ್ರಯಾಣ", "ಶಯ್ಯಾ ಸುಖ & ನಿದ್ರೆ (Sleep & Solitude)", "ಆಸ್ಪತ್ರೆ ಅಥವಾ ಏಕಾಂತ ವಾಸ"],
      en: ["Moksha & Spiritual Liberation", "Losses & Unavoidable Expenditures (Vyaya)", "Foreign Relocation & Distant Settlements", "Bed Pleasures & Sleep Quality", "Hospitals, Asylums & Hermitages"]
    },
    bodyParts: { kn: "ಪಾದಗಳು, ಎಡಗಣ್ಣು", en: "Feet, Toes, Left Eye" },
    keySignificator: PlanetName.Saturn
  }
];

// =========================================================================
// CLASSICAL YOGAS CATALOG (ಶಾಸ್ತ್ರೀಯ ಯೋಗಗಳ ವಿವರಣೆ)
// =========================================================================
export const CLASSICAL_YOGAS_CATALOG = [
  {
    id: "gajakesari",
    name: { kn: "ಗಜಕೇಸರಿ ಯೋಗ (Gaja Kesari Yoga)", en: "Gaja Kesari Yoga" },
    scripturalCitation: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ (BPHS Chapter 36)",
    condition: {
      kn: "ಚಂದ್ರನಿಂದ ಕೇಂದ್ರದಲ್ಲಿ (೧, ೪, ೭, ೧೦ ನೇ ಮನೆ) ಗುರುವು ಸ್ಥಿತನಾಗಿದ್ದರೆ ಗಜಕೇಸರಿ ಯೋಗ ಉಂಟಾಗುತ್ತದೆ.",
      en: "Jupiter is placed in an angular house (Kendra: 1, 4, 7, 10) from the Moon."
    },
    results: {
      kn: "ಆನೆಗಳ ಹಿಂಡಿನಲ್ಲಿ ಸಿಂಹದಂತೆ ಜಾತಕನು ಸಮಾಜದಲ್ಲಿ ಶಕ್ತಿಶಾಲಿ, ಬುದ್ಧಿವಂತ, ದೀರ್ಘಕಾಲಿಕ ಕೀರ್ತಿವಂತ ಮತ್ತು ರಾಜಗೌರವ ಪಡೆಯುತ್ತಾನೆ.",
      en: "Endows the native with lion-like courage, intellectual brilliance, long-lasting fame, and virtuous prosperity."
    }
  },
  {
    id: "pancha_mahapurusha",
    name: { kn: "ಪಂಚ ಮಹಾಪುರುಷ ಯೋಗಗಳು (Pancha Mahapurusha Yogas)", en: "Pancha Mahapurusha Yogas" },
    scripturalCitation: "ಬೃಹತ್ ಸಂಹಿತಾ & ಫಲದೀಪಿಕಾ (Brihat Samhita & Phaladeepika)",
    condition: {
      kn: "ಕುಜ, ಬುಧ, ಗುರು, ಶುಕ್ರ ಅಥವಾ ಶನಿ - ಈ ತಾರಾಗ್ರಹಗಳಲ್ಲಿ ಯಾವುದಾದರೂ ಒಂದು ಗ್ರಹವು ಲಗ್ನದಿಂದ ಅಥವಾ ಚಂದ್ರನಿಂದ ಕೇಂದ್ರದಲ್ಲಿದ್ದು, ತನ್ನ ಸ್ವಕ್ಷೇತ್ರ ಅಥವಾ ಉಚ್ಚ ರಾಶಿಯಲ್ಲಿದ್ದರೆ:",
      en: "When Mars, Mercury, Jupiter, Venus, or Saturn sits in Kendra from Lagna or Moon in its own or exalted sign:"
    },
    variations: [
      { name: "ರುಚಕ ಯೋಗ (Ruchaka)", graha: "ಕುಜ (Mars)", effects: "ಪರಾಕ್ರಮ, ಭೂಮಾಲೀಕ, ರಕ್ಷಣಾ ಮುಖ್ಯಸ್ಥ ಅಥವಾ ಅಪ್ರತಿಮ ನಾಯಕ." },
      { name: "ಭದ್ರ ಯೋಗ (Bhadra)", graha: "ಬುಧ (Mercury)", effects: "ಉತ್ತಮ ವಿದ್ವಾಂಸ, ವಾಕ್ಚತುರ, ಶ್ರೇಷ್ಠ ವ್ಯಾಪಾರಿ, ಜ್ಯೋತಿಷಿ." },
      { name: "ಹಂಸ ಯೋಗ (Hamsa)", graha: "ಗುರು (Jupiter)", effects: "ಧಾರ್ಮಿಕ ಪಂಡಿತ, ಸದ್ಗುಣಿ, ಗೌರವಾನ್ವಿತ ಗುರು, ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶಿ." },
      { name: "ಮಾಳವ್ಯ ಯೋಗ (Malavya)", graha: "ಶುಕ್ರ (Venus)", effects: "ಸಕಲ ಭೋಗ-ಭಾಗ್ಯ, ಸೌಂದರ್ಯ, ವಾಹನ, ಕಲಾಪ್ರೇಮಿ, ಶ್ರೀಮಂತಿಕೆ." },
      { name: "ಶಶ ಯೋಗ (Sasa)", graha: "ಶನಿ (Saturn)", effects: "ಜನನಾಯಕ, ನ್ಯಾಯಾಧೀಶ, ದೀರ್ಘಾಯುಷಿ, ಭೂಗತ ಸಂಪತ್ತು, ಅಧಿಕಾರ." }
    ]
  },
  {
    id: "budhaditya",
    name: { kn: "ಬುಧಾದಿತ್ಯ ಯೋಗ (Budhaditya Yoga)", en: "Budhaditya Yoga" },
    scripturalCitation: "ಸಾರಾವಳಿ (Saravali)",
    condition: {
      kn: "ಸೂರ್ಯ ಮತ್ತು ಬುಧ ಗ್ರಹಗಳು ಒಂದೇ ರಾಶಿಯಲ್ಲಿ ಯುತಿಯಾಗಿದ್ದರೆ.",
      en: "Sun and Mercury conjoin in the same sign without severe combustion."
    },
    results: {
      kn: "ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ, ತಾರ್ಕಿಕ ಬುದ್ಧಿವಂತಿಕೆ, ಆಡಳಿತಾತ್ಮಕ ಕೌಶಲ್ಯ ಹಾಗೂ ಗಣಿತ ಮತ್ತು ಬರವಣಿಗೆಯಲ್ಲಿ ನಿಪುಣತೆ.",
      en: "Sharp analytical intellect, administrative eloquence, academic excellence, and public repute."
    }
  },
  {
    id: "viparita_raja",
    name: { kn: "ವಿಪರೀತ ರಾಜಯೋಗ (Viparita Raja Yoga)", en: "Viparita Raja Yoga" },
    scripturalCitation: "ಉತ್ತರ ಕಾಲಾಮೃತ (Uttara Kalamrita)",
    condition: {
      kn: "೬, ೮, ೧೨ ನೇ ದುಸ್ಥಾನಗಳ ಅಧಿಪತಿಗಳು ಪರಸ್ಪರ ೬, ೮, ೧೨ ನೇ ಮನೆಗಳಲ್ಲಿ ಮಾತ್ರ ಸ್ಥಿತರಾಗಿದ್ದು, ಇತರ ಶುಭ ಗ್ರಹರ ಸಂಬಂಧವಿಲ್ಲದಿದ್ದರೆ:",
      en: "Lords of Dusthanas (6, 8, 12) placed exclusively within houses 6, 8, or 12:"
    },
    variations: [
      { name: "ಹರ್ಷ ಯೋಗ (Harsha)", rule: "೬ ನೇ ಅಧಿಪತಿ ೬, ೮, ೧೨ ರಲ್ಲಿದ್ದರೆ - ಶತ್ರುನಾಶ, ಅಚಲ ಆರೋಗ್ಯ." },
      { name: "ಸರಳ ಯೋಗ (Sarala)", rule: "೮ ನೇ ಅಧಿಪತಿ ೬, ೮, ೧೨ ರಲ್ಲಿದ್ದರೆ - ಅನಿರೀಕ್ಷಿತ ಧನಲಾಭ, ದೀರ್ಘಾಯುಷ್ಯ." },
      { name: "ವಿಮಲ ಯೋಗ (Vimala)", rule: "೧೨ ನೇ ಅಧಿಪತಿ ೬, ೮, ೧೨ ರಲ್ಲಿದ್ದರೆ - ಸ್ವತಂತ್ರ ಜೀವನ, ಅಧ್ಯಾತ್ಮಿಕ ಉನ್ನತಿ." }
    ]
  }
];

// =========================================================================
// HELPER QUERY FUNCTIONS FOR GURUKULA TEACHING
// =========================================================================
export function lookupGrahaByName(term: string): GrahaShastraRecord | undefined {
  const clean = term.toLowerCase().trim();
  for (const record of Object.values(GRAHA_SHASTRA_MATRIX)) {
    if (
      record.planet.toLowerCase() === clean ||
      record.sanskrit.toLowerCase().includes(clean) ||
      record.name.kn.toLowerCase().includes(clean) ||
      record.name.en.toLowerCase().includes(clean)
    ) {
      return record;
    }
  }

  // Alias lookup
  if (clean.includes("sun") || clean.includes("surya") || clean.includes("ಸೂರ್ಯ") || clean.includes("ರವಿ") || clean.includes("ravi")) {
    return GRAHA_SHASTRA_MATRIX[PlanetName.Sun];
  }
  if (clean.includes("moon") || clean.includes("chandra") || clean.includes("ಚಂದ್ರ") || clean.includes("ಸೋಮ") || clean.includes("soma")) {
    return GRAHA_SHASTRA_MATRIX[PlanetName.Moon];
  }
  if (clean.includes("mars") || clean.includes("kuja") || clean.includes("mangala") || clean.includes("ಕುಜ") || clean.includes("ಮಂಗಳ") || clean.includes("ಅಂಗಾರಕ") || clean.includes("angaraka")) {
    return GRAHA_SHASTRA_MATRIX[PlanetName.Mars];
  }
  if (clean.includes("mercury") || clean.includes("budha") || clean.includes("ಬುಧ") || clean.includes("ಸೌಮ್ಯ")) {
    return GRAHA_SHASTRA_MATRIX[PlanetName.Mercury];
  }
  if (clean.includes("jupiter") || clean.includes("guru") || clean.includes("ಗುರು") || clean.includes("ಬೃಹಸ್ಪತಿ") || clean.includes("brihaspati")) {
    return GRAHA_SHASTRA_MATRIX[PlanetName.Jupiter];
  }
  if (clean.includes("venus") || clean.includes("shukra") || clean.includes("ಶುಕ್ರ") || clean.includes("ಭೃಗು") || clean.includes("bhrigu")) {
    return GRAHA_SHASTRA_MATRIX[PlanetName.Venus];
  }
  if (clean.includes("saturn") || clean.includes("shani") || clean.includes("ಶನಿ") || clean.includes("ಶನೈಶ್ಚರ") || clean.includes("sani")) {
    return GRAHA_SHASTRA_MATRIX[PlanetName.Saturn];
  }
  if (clean.includes("rahu") || clean.includes("ರಾಹು")) {
    return GRAHA_SHASTRA_MATRIX[PlanetName.Rahu];
  }
  if (clean.includes("ketu") || clean.includes("ಕೇತು")) {
    return GRAHA_SHASTRA_MATRIX[PlanetName.Ketu];
  }

  return undefined;
}

export function lookupNakshatraByName(term: string): NakshatraShastraRecord | undefined {
  const clean = term.toLowerCase().trim();
  for (const nak of NAKSHATRA_SHASTRA_CATALOG) {
    if (
      nak.name.en.toLowerCase().includes(clean) ||
      nak.name.kn.toLowerCase().includes(clean) ||
      clean.includes(nak.name.en.toLowerCase()) ||
      clean.includes(nak.name.kn.toLowerCase())
    ) {
      return nak;
    }
  }
  return undefined;
}

export function lookupBhavaByNumberOrTerm(term: string): BhavaShastraRecord | undefined {
  const clean = term.toLowerCase().trim();
  const numMatch = clean.match(/\b([1-9]|1[0-2])(?:st|nd|rd|th)?\s*(?:house|bhava|ಭಾವ|ಮನೆ)?\b/);
  if (numMatch && numMatch[1]) {
    const n = parseInt(numMatch[1], 10);
    return BHAVA_SHASTRA_CATALOG.find((b) => b.houseNumber === n);
  }

  if (clean.includes("lagna") || clean.includes("ಲಗ್ನ") || clean.includes("tanu") || clean.includes("ತನು")) {
    return BHAVA_SHASTRA_CATALOG[0];
  }
  if (clean.includes("dhana") || clean.includes("ಧನ") || clean.includes("family house") || clean.includes("ಕುಟುಂಬ")) {
    return BHAVA_SHASTRA_CATALOG[1];
  }
  if (clean.includes("bhratri") || clean.includes("ಭ್ರಾತೃ") || clean.includes("sahaja") || clean.includes("ಸಹೋದರ")) {
    return BHAVA_SHASTRA_CATALOG[2];
  }
  if (clean.includes("sukha") || clean.includes("ಸುಖ") || clean.includes("matru") || clean.includes("ಮಾತೃ") || clean.includes("home")) {
    return BHAVA_SHASTRA_CATALOG[3];
  }
  if (clean.includes("putra") || clean.includes("ಪುತ್ರ") || clean.includes("children") || clean.includes("ಸಂತಾನ") || clean.includes("purva punya")) {
    return BHAVA_SHASTRA_CATALOG[4];
  }
  if (clean.includes("ripu") || clean.includes("ಶತ್ರು") || clean.includes("roga") || clean.includes("ರೋಗ") || clean.includes("debt") || clean.includes("ಸಾಲ")) {
    return BHAVA_SHASTRA_CATALOG[5];
  }
  if (clean.includes("kalatra") || clean.includes("ಕಳತ್ರ") || clean.includes("marriage house") || clean.includes("ವಿವಾಹ") || clean.includes("spouse") || clean.includes("ಸಂಗಾತಿ")) {
    return BHAVA_SHASTRA_CATALOG[6];
  }
  if (clean.includes("ayur") || clean.includes("ಆಯುಷ್ಯ") || clean.includes("randhra") || clean.includes("ರಂಧ್ರ") || clean.includes("death") || clean.includes("ಮೋಕ್ಷ")) {
    return BHAVA_SHASTRA_CATALOG[7];
  }
  if (clean.includes("bhagya") || clean.includes("ಭಾಗ್ಯ") || clean.includes("dharma") || clean.includes("ಧರ್ಮ") || clean.includes("father") || clean.includes("guru")) {
    return BHAVA_SHASTRA_CATALOG[8];
  }
  if (clean.includes("karma") || clean.includes("ಕರ್ಮ") || clean.includes("career house") || clean.includes("ಉದ್ಯೋಗ") || clean.includes("profession")) {
    return BHAVA_SHASTRA_CATALOG[9];
  }
  if (clean.includes("labha") || clean.includes("ಲಾಭ") || clean.includes("aya") || clean.includes("ಆಯ") || clean.includes("gain") || clean.includes("ಇಷ್ಟಾರ್ಥ")) {
    return BHAVA_SHASTRA_CATALOG[10];
  }
  if (clean.includes("vyaya") || clean.includes("ವ್ಯಯ") || clean.includes("moksha") || clean.includes("ಮೋಕ್ಷ") || clean.includes("losses") || clean.includes("ಖರ್ಚು")) {
    return BHAVA_SHASTRA_CATALOG[11];
  }

  return undefined;
}
