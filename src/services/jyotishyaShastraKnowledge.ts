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

// =========================================================================
// SECTION 6: SANKHYA SHASTRA (Vedic Numerology - Mulank, Bhagyank, Namaank)
// =========================================================================
export interface SankhyaNumberRecord {
  number: number;
  graha: PlanetName;
  grahaName: Record<SupportedLanguage, string>;
  title: Record<SupportedLanguage, string>;
  qualities: Record<SupportedLanguage, string[]>;
  friendlyNumbers: number[];
  enemyNumbers: number[];
  neutralNumbers: number[];
  luckyGem: Record<SupportedLanguage, string>;
  luckyDay: Record<SupportedLanguage, string>;
  luckyColors: Record<SupportedLanguage, string[]>;
  careerFields: Record<SupportedLanguage, string[]>;
  remedy: Record<SupportedLanguage, string>;
}

export const SANKHYA_SHASTRA_CATALOG: Record<number, SankhyaNumberRecord> = {
  1: {
    number: 1,
    graha: PlanetName.Sun,
    grahaName: { kn: "ಸೂರ್ಯ", en: "Surya (Sun)", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" },
    title: { kn: "ಅಧಿಪತಿ & ನಾಯಕತ್ವ (Leader & Pioneer)", en: "The Leader & Pioneer", hi: "अधिपति व नेता", te: "నాయకత్వం", ta: "தலைவர்" },
    qualities: {
      kn: ["ಅಪ್ರತಿಮ ಆತ್ಮವಿಶ್ವಾಸ", "ನಾಯಕತ್ವ ಗುಣ", "ಸ್ವಾಭಿಮಾನ", "ದೃಢ ನಿರ್ಧಾರ", "ಸಾರ್ವಜನಿಕ ಯಶಸ್ಸು"],
      en: ["Dynamic leadership", "Unshakable self-confidence", "Original thinking", "Commanding authority", "Pioneering spirit"],
      hi: ["नेतृत्व", "आत्मविश्वास", "दृढ़ निश्चय", "साहस", "तेजस्विता"],
      te: ["నాయకత్వం", "ఆత్మవిశ్వాసం", "పట్టుదల", "కీర్తి", "శక్తి"],
      ta: ["தலைமை", "சுயநம்பிக்கை", "ஆற்றல்", "துணிவு", "புகழ்"]
    },
    friendlyNumbers: [1, 2, 3, 5, 9],
    enemyNumbers: [8],
    neutralNumbers: [4, 6, 7],
    luckyGem: { kn: "ಮಾಣಿಕ್ಯ (Ruby)", en: "Ruby (Manikya)", hi: "माणिक्य", te: "కెంపు", ta: "மாணிக்கம்" },
    luckyDay: { kn: "ಭಾನುವಾರ (Sunday)", en: "Sunday", hi: "रविवार", te: "ఆదివారం", ta: "ஞாயிறு" },
    luckyColors: { kn: ["ಕಿತ್ತಳೆ", "ಚಿನ್ನದ ಹಳದಿ", "ಕೆಂಪು"], en: ["Orange", "Golden Yellow", "Crimson Red"], hi: ["नारंगी", "सुनहरा", "लाल"], te: ["నారింజ", "బంగారు", "ఎరుపు"], ta: ["ஆரஞ்சு", "தங்க நிறம்", "சிவப்பு"] },
    careerFields: { kn: ["ಆಡಳಿತ", "ರಾಜಕೀಯ", "ಉನ್ನತ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್", "ಸರ್ಕಾರಿ ಸೇವೆ", "ಸ್ವತಂತ್ರ ಉದ್ಯಮ"], en: ["Administration", "Politics", "Executive Management", "Government", "Entrepreneurship"], hi: ["प्रशासन", "राजनीति", "उद्यम"], te: ["పరిపాలన", "రాజకీయాలు", "వ్యాపారం"], ta: ["நிர்வாகம்", "அரசியல்", "தொழில்"] },
    remedy: { kn: "ಪ್ರತಿದಿನ ಸೂರ್ಯ ನಮಸ್ಕಾರ, ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಣ ಹಾಗೂ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ನೀರು ಕುಡಿಯುವುದು.", en: "Daily Surya Namaskar, chanting Aditya Hridaya Stotram, and drinking water stored in copper vessel.", hi: "सूर्य नमस्कार व आदित्य हृदय स्तोत्र पाठ।", te: "సూర్య నమస్కారాలు, ఆదిత్య హృదయ స్తోత్రం.", ta: "சூரிய நமஸ்காரம் மற்றும் ஆதித்ய ஹிருதய ஸ்தோத்திரம்." }
  },
  2: {
    number: 2,
    graha: PlanetName.Moon,
    grahaName: { kn: "ಚಂದ್ರ", en: "Chandra (Moon)", hi: "चन्द्र", te: "చంద్రుడు", ta: "சந்திரன்" },
    title: { kn: "ಸಂವೇದನಾಶೀಲ & ಶಾಂತಿಪ್ರಿಯ (Intuitive Peacemaker)", en: "The Intuitive Peacemaker", hi: "संवेदनशील व शान्तिप्रिय", te: "శాంతి కాముకుడు", ta: "அமைதி விரும்பி" },
    qualities: {
      kn: ["ತೀಕ್ಷ್ಣ ಕಲ್ಪನಾಶಕ್ತಿ", "ಕೋಮಲ ಹೃದಯ", "ಸಂಧಾನಕಾರ", "ಕಲಾತ್ಮಕತೆ", "ಮಾನಸಿಕ ಅಂತಃಪ್ರಜ್ಞೆ"],
      en: ["Deep intuition", "Diplomatic charm", "Artistic imagination", "Gentle empathy", "Subconscious perception"],
      hi: ["कल्पनाशीलता", "कोमल हृदय", "सहानुभूति", "शांतिप्रियता", "कला"],
      te: ["ఊహాశక్తి", "శాంతి", "కళాత్మకత", "సహానుభూతి", "ఆలోచన"],
      ta: ["கற்பனைத்திறன்", "அன்பு", "அமைதி", "கலை", "உணர்வு"]
    },
    friendlyNumbers: [1, 2, 3, 5],
    enemyNumbers: [8, 9],
    neutralNumbers: [4, 6, 7],
    luckyGem: { kn: "ಮುತ್ತು (Natural Pearl)", en: "Natural Pearl (Mukta)", hi: "मोती", te: "ముత్యం", ta: "முத்து" },
    luckyDay: { kn: "ಸೋಮವಾರ (Monday)", en: "Monday", hi: "सोमवार", te: "సోమవారం", ta: "திங்கள்" },
    luckyColors: { kn: ["ಬಿಳಿ", "ಬೆಳ್ಳಿ ಬಣ್ಣ", "ಹಾಲಿನ ಬಣ್ಣ"], en: ["Milky White", "Silver", "Cream"], hi: ["सफेद", "चांदी", "क्रीम"], te: ["తెలుపు", "వెండి", "క్రీమ్"], ta: ["வெள்ளை", "வெள்ளி", "கிரீம்"] },
    careerFields: { kn: ["ಸಾಹಿತ್ಯ", "ಸಂಗೀತ", "ಮನಃಶಾಸ್ತ್ರ", "ಜಲ & ದ್ರವ ವ್ಯಾಪಾರ", "ಆತಿಥ್ಯ ರಂಗ"], en: ["Literature", "Psychology", "Music & Arts", "Hospitality", "Water & Dairy Trade"], hi: ["साहित्य", "संगीत", "मनोविज्ञान", "डेयरी"], te: ["సాహిత్యం", "సంగీతం", "వైద్యం", "వ్యాపారం"], ta: ["இலக்கியம்", "இசை", "மருத்துவம்", "விருந்தோம்பல்"] },
    remedy: { kn: "ಸೋಮವಾರ ಶಿವಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ, ಚಂದ್ರ ಗಾಯತ್ರಿ ಜಪ ಹಾಗೂ ತಾಯಿಯ ಆಶೀರ್ವಾದ ಪಡೆಯುವುದು.", en: "Offering milk abhisheka to Shiva Linga on Mondays, Chandra Gayatri japa, and seeking mother's blessings.", hi: "सोमवार को शिवलिंग पर दुग्धाभिषेक व माता का चरण स्पर्श।", te: "సోమవారం శివునికి క్షీరాభిషేకం, తల్లి దీవెనలు.", ta: "திங்கள்கிழமை சிவலிங்கத்திற்கு பாலாபிஷேகம்." }
  },
  3: {
    number: 3,
    graha: PlanetName.Jupiter,
    grahaName: { kn: "ಗುರು / ಬೃಹಸ್ಪತಿ", en: "Guru (Jupiter)", hi: "गुरु / बृहस्पति", te: "గురుడు", ta: "குரு" },
    title: { kn: "ಜ್ಞಾನಿ & ಮಾರ್ಗದರ್ಶಕ (Wisdom Counselor)", en: "The Wisdom Guide & Counselor", hi: "ज्ञानी व परामर्शदाता", te: "జ్ఞాన గురువు", ta: "ஞான வழிகாட்டி" },
    qualities: {
      kn: ["ವಿಸ್ತಾರ ಜ್ಞಾನ", "ದೈವಭಕ್ತಿ", "ಉಪದೇಶ ಸಾಮರ್ಥ್ಯ", "ಸತ್ಯನಿಷ್ಠೆ", "ಶುಭ ದೃಷ್ಟಿ"],
      en: ["Vast wisdom", "Spiritual devotion", "Natural mentorship", "Optimistic vision", "Ethical integrity"],
      hi: ["विशाल ज्ञान", "परामर्श शक्ति", "धार्मिकता", "उदारता", "सत्यनिष्ठा"],
      te: ["జ్ఞానం", "సలహాదారు", "ధార్మికత", "ఆశావాదం", "నిజాయితీ"],
      ta: ["ஞானம்", "வழிகாட்டுதல்", "ஆன்மீகம்", "நேர்மை", "கருணை"]
    },
    friendlyNumbers: [1, 2, 3, 9],
    enemyNumbers: [6],
    neutralNumbers: [4, 5, 7, 8],
    luckyGem: { kn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)", en: "Yellow Sapphire (Pushparaga)", hi: "पुखराज", te: "పుష్యరాగం", ta: "புஷ்பராகம்" },
    luckyDay: { kn: "ಗುರುವಾರ (Thursday)", en: "Thursday", hi: "गुरुवार", te: "గురువారం", ta: "வியாழன்" },
    luckyColors: { kn: ["ಹಳದಿ", "ಚಿನ್ನ", "ಕೇಸರಿ"], en: ["Bright Yellow", "Gold", "Saffron"], hi: ["पीला", "स्वर्ण", "केसरिया"], te: ["పసుపు", "బంగారు", "కాషాయం"], ta: ["மஞ்சள்", "தங்கம்", "காவி"] },
    careerFields: { kn: ["ಶಿಕ್ಷಣ & ಬೋಧನೆ", "ಜ್ಯೋತಿಷ್ಯ", "ನ್ಯಾಯಾಂಗ", "ಬ್ಯಾಂಕಿಂಗ್ & ಹಣಕಾಸು", "ಧಾರ್ಮಿಕ ಕ್ಷೇತ್ರ"], en: ["Education & Academics", "Astrology & Shastras", "Judiciary & Law", "Banking & Finance", "Spiritual Leadership"], hi: ["शिक्षा", "ज्योतिष", "न्याय", "बैंकिंग"], te: ["విద్య", "జ్యోతిష్యం", "న్యాయం", "బ్యాంకింగ్"], ta: ["கல்வி", "ஜோதிடம்", "சட்டம்", "வங்கி"] },
    remedy: { kn: "ಗುರುವಾರ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸ್ತೋತ್ರ ಪಠಣ, ಕಡಲೆ ಕಾಳು ದಾನ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ/ಗುರುಗಳ ಸೇವೆ.", en: "Chanting Dakshinamurthy Stotram on Thursday, donating chana dal, and serving elders/Gurus.", hi: "गुरुवार को चना दाल दान व गुरु सेवा।", te: "గురువారం శనగల దానం, గురుసేవ.", ta: "வியாழக்கிழமை கடலை தானம் மற்றும் குரு சேவை." }
  },
  4: {
    number: 4,
    graha: PlanetName.Rahu,
    grahaName: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு" },
    title: { kn: "ಕ್ರಾಂತಿಕಾರಿ & ತಾಂತ್ರಿಕ ಪ್ರತಿಭೆ (The Revolutionary Innovator)", en: "The Revolutionary Innovator", hi: "क्रांतिकारी व वैज्ञानिक", te: "విప్లవాత్మక ఆవిష్కర్త", ta: "புரட்சிகர கண்டுபிடிப்பாளர்" },
    qualities: {
      kn: ["ಅಸಾಮಾನ್ಯ ಯೋಚನೆ", "ತಾಂತ್ರಿಕ ಕುಶಲತೆ", "ಆಕಸ್ಮಿಕ ಯಶಸ್ಸು", "ಸಂಶೋಧನಾ ಮನೋಭಾವ", "ಧೈರ್ಯ"],
      en: ["Unconventional breakthrough thinking", "Technical genius", "Sudden life shifts", "Courage to challenge orthodoxy", "Practical realism"],
      hi: ["क्रांतिकारी सोच", "तकनीकी कौशल", "अकस्मात सफलता", "साहस"],
      te: ["నూతన ఆలోచన", "సాంకేతిక నైపుణ్యం", "ఆకస్మిక మార్పులు"],
      ta: ["புதுமையான சிந்தனை", "தொழில்நுட்ப மேதை", "திடீர் வளர்ச்சி"]
    },
    friendlyNumbers: [1, 5, 6, 7],
    enemyNumbers: [8],
    neutralNumbers: [2, 3, 9],
    luckyGem: { kn: "ಗೋಮೇಧಿಕ (Hessonite)", en: "Hessonite Garnet (Gomedha)", hi: "गोमेद", te: "గోమేధికం", ta: "கோமேதகம்" },
    luckyDay: { kn: "ಶನಿವಾರ (Saturday)", en: "Saturday", hi: "शनिवार", te: "శనివారం", ta: "சனி" },
    luckyColors: { kn: ["ನೀಲಿ", "ಬೂದು (Grey)", "ಕಡು ಕಂದು"], en: ["Electric Blue", "Smoke Grey", "Khaki"], hi: ["नीला", "धूसर", "भूरा"], te: ["నీలం", "బూడిద", "గోధుమ"], ta: ["நீலம்", "சாம்பல்", "பழுப்பு"] },
    careerFields: { kn: ["ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ (IT)", "ಸಂಶೋಧನೆ", "ವಿದೇಶಿ ವ್ಯವಹಾರ", "ವಿದ್ಯುತ್ & ಇಂಜಿನಿಯರಿಂಗ್", "ರಾಜಕೀಯ ತಂತ್ರಗಾರಿಕೆ"], en: ["Software & IT", "Scientific Research", "Foreign Business", "Aviation & Electronics", "Strategic Analytics"], hi: ["आईटी", "इंजीनियरिंग", "विदेशी व्यापार", "रिसर्च"], te: ["ఐటీ", "ఎలక్ట్రానిక్స్", "విదేశీ వ్యాపారం"], ta: ["தகவல் தொழில்நுட்பம்", "வெளிநாட்டு வணிகம்", "ஆராய்ச்சி"] },
    remedy: { kn: "ಶ್ರೀ ದುರ್ಗಾ ಸಪ್ತಶತಿ ಪಠಣ, ಪಕ್ಷಿಗಳಿಗೆ ನೀರು-ಧಾನ್ಯ ನೀಡುವುದು ಹಾಗೂ ಗೋಕರ್ಣದಲ್ಲಿ ಕಾಳಸರ್ಪ ಶಾಂತಿ.", en: "Durga Saptashati parayana, feeding wild birds daily, and Kalasarpa Shanti at Gokarna.", hi: "दुर्गा चालीसा पाठ व पक्षियों को दाना खिलाना।", te: "దుర్గా దేవి పూజ, పక్షులకు దాణా.", ta: "துர்கா பூஜை மற்றும் பறவைகளுக்கு தானியம் வழங்குதல்." }
  },
  5: {
    number: 5,
    graha: PlanetName.Mercury,
    grahaName: { kn: "ಬುಧ", en: "Budha (Mercury)", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
    title: { kn: "ವಾಕ್ಚತುರ & ವ್ಯಾಪಾರ ಸಾರ್ವಭೌಮ (Master Communicator & Trader)", en: "Master Communicator & Merchant", hi: "वाक्चतुर व व्यापारी", te: "వాక్చాతుర్యం గల వ్యాపారి", ta: "பேச்சுத்திறன் மிக்க வணிகர்" },
    qualities: {
      kn: ["ಮಿಂಚಿನ ಬುದ್ಧಿ", "ವಾಕ್ಚಾತುರ್ಯ", "ವ್ಯಾಪಾರ ಜಾಣ್ಮೆ", "ಹೊಂದಿಕೊಳ್ಳುವ ಸ್ವಭಾವ", "ಹಾಸ್ಯಪ್ರಜ್ಞೆ"],
      en: ["Lightning intellect", "Articulate diplomacy", "Mercantile acumen", "Chameleonic adaptability", "Youthful curiosity"],
      hi: ["तीव्र बुद्धि", "वाकपटुता", "व्यापारिक कुशलता", "हास्यबोध"],
      te: ["చురుకైన బుద్ధి", "మాటకారి", "వ్యాపార మెలకువలు"],
      ta: ["கூர்மையான புத்தி", "பேச்சுத்திறமை", "வணிக அறிவு"]
    },
    friendlyNumbers: [1, 5, 6],
    enemyNumbers: [2],
    neutralNumbers: [3, 4, 7, 8, 9],
    luckyGem: { kn: "ಪಚ್ಚೆ (Emerald)", en: "Emerald (Marakatha / Panna)", hi: "पन्ना", te: "పచ్చ", ta: "மரகதம்" },
    luckyDay: { kn: "ಬುಧವಾರ (Wednesday)", en: "Wednesday", hi: "बुधवार", te: "బుధవారం", ta: "புதன்" },
    luckyColors: { kn: ["ಹಸಿರು", "ಕಿಳಿ ಹಸಿರು", "ತಿಳಿ ಹಳದಿ"], en: ["Emerald Green", "Parrot Green", "Mint"], hi: ["हरा", "तोतिया", "हल्का पीला"], te: ["ఆకుపచ్చ", "చిలక పచ్చ"], ta: ["பச்சை", "கிளிப்பச்சை"] },
    careerFields: { kn: ["ವ್ಯಾಪಾರ & ಮಾರ್ಕೆಟಿಂಗ್", "ಪತ್ರಿಕೋದ್ಯಮ", "ಲೆಕ್ಕಪತ್ರ (CA)", "ಸಾಫ್ಟ್‌ವೇರ್", "ಬರವಣಿಗೆ & ಸಂವಹನ"], en: ["Trade & Marketing", "Journalism & Media", "Chartered Accountancy", "Data Science", "Writing & Translation"], hi: ["व्यापार", "मार्केटिंग", "सीए", "पत्रकारिता"], te: ["వ్యాపారం", "మీడియా", "అకౌంటింగ్", "సాఫ్ట్‌వేర్"], ta: ["வணிகம்", "ஊடகம்", "கணக்கியல்", "மென்பொருள்"] },
    remedy: { kn: "ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ, ಹಸುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು ನೀಡುವುದು ಹಾಗೂ ಹೆಸರು ಕಾಳು ದಾನ.", en: "Vishnu Sahasranama chanting, feeding green grass to holy cows, and green gram donation.", hi: "विष्णु सहस्रनाम पाठ व गाय को हरी घास खिलाना।", te: "విష్ణు సహస్రనామ పారాయణం, గోవుకు పచ్చగడ్డి.", ta: "விஷ்ணு சஹஸ்ரநாமம் மற்றும் பசுவுக்கு அகத்திக்கீரை." }
  },
  6: {
    number: 6,
    graha: PlanetName.Venus,
    grahaName: { kn: "ಶುಕ್ರ", en: "Shukra (Venus)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
    title: { kn: "ಸೌಂದರ್ಯ & ಭೋಗ ಪ್ರಿಯ (Lover of Luxury & Harmony)", en: "Harmonizer & Luxury Creator", hi: "सौंदर्य व विलासिता प्रेमी", te: "సౌందర్యారాధకుడు", ta: "அழகியல் விரும்பி" },
    qualities: {
      kn: ["ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ", "ಕಲಾ ಪ್ರೇಮ", "ಭೋಗ ಭಾಗ್ಯ", "ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ", "ರಾಯಲ್ ಜೀವನಶೈಲಿ"],
      en: ["Magnetism & charm", "Refined artistic aesthetics", "Opulence & luxury", "Warm familial harmony", "Romantic chivalry"],
      hi: ["आकर्षक व्यक्तित्व", "कलात्मक रुचि", "विलासिता", "प्रेम व सद्भाव"],
      te: ["ఆకర్షణీయమైన వ్యక్తిత్వం", "కళాభిరుచి", "విలాసవంతమైన జీవితం"],
      ta: ["கவர்ச்சியான ஆளுமை", "கலை ஆர்வம்", "ஆடம்பரம்", "குடும்ப அமைதி"]
    },
    friendlyNumbers: [1, 4, 5, 6, 7],
    enemyNumbers: [3],
    neutralNumbers: [2, 8, 9],
    luckyGem: { kn: "ವಜ್ರ (Diamond) / ಓಪಲ್ (Opal)", en: "Diamond (Heera) or White Zircon / Opal", hi: "हीरा / ओपल", te: "వజ్రం / ఓపల్", ta: "வைரம் / ஓபல்" },
    luckyDay: { kn: "ಶುಕ್ರವಾರ (Friday)", en: "Friday", hi: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளி" },
    luckyColors: { kn: ["ಬಿಳಿ", "ಗುಲಾಬಿ (Pink)", "ಆಕಾಶ ನೀಲಿ"], en: ["Bright White", "Pastel Pink", "Sky Blue"], hi: ["सफेद", "गुलाबी", "आसमानी"], te: ["తెలుపు", "గులాబీ", "నీలం"], ta: ["வெள்ளை", "இளஞ்சிவப்பு", "வான நீலம்"] },
    careerFields: { kn: ["ಸಿನಿಮಾ & ಮನರಂಜನೆ", "ಫ್ಯಾಷನ್ & ಒಡವೆ", "ವಾಸ್ತುಶಿಲ್ಪ", "ಆಟೋಮೊಬೈಲ್", "ಐಷಾರಾಮಿ ಹೋಟೆಲ್"], en: ["Cinema & Entertainment", "Fashion & Jewelry", "Interior Architecture", "Luxury Goods", "Fine Arts & Perfumery"], hi: ["फिल्म व संगीत", "फैशन", "होटल", "गहने"], te: ["చలనచిత్ర రంగం", "ఫ్యాషన్", "హోటల్ వ్యాపారం"], ta: ["திரைத்துறை", "ஆடை வடிவமைப்பு", "நகை வணிகம்"] },
    remedy: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಅಷ್ಟಕಂ ಪಠಣ, ಶುಕ್ರವಾರ ಬಿಳಿ ಸಿಹಿ ಹಂಚುವುದು ಹಾಗೂ ಸ್ತ್ರೀಯರನ್ನು ಗೌರವಿಸುವುದು.", en: "Mahalakshmi Ashtakam chanting on Fridays, sharing white sweets, and honoring feminine divinity.", hi: "महालक्ष्मी अष्टकम पाठ व शुक्रवार को सफेद मिष्ठान्न वितरण।", te: "మహాలక్ష్మి పూజ, శుక్రవారం తెల్లటి స్వీట్ల పంపిణీ.", ta: "மகாலட்சுமி அஷ்டகம் மற்றும் வெள்ளிக்கிழமை வெள்ளை இனிப்பு தானம்." }
  },
  7: {
    number: 7,
    graha: PlanetName.Ketu,
    grahaName: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது" },
    title: { kn: "ಯೋಗಿ & ಸಂಶೋಧಕ (Mystic Sage & Seeker)", en: "The Mystic Seeker & Philosopher", hi: "तपस्वी व गूढ़ शोधकर्ता", te: "యోగి & పరిశోధకుడు", ta: "ஞானி & ஆராய்ச்சியாளர்" },
    qualities: {
      kn: ["ಆಧ್ಯಾತ್ಮಿಕ ಒಳನೋಟ", "ಗಂಭೀರ ಸಂಶೋಧನೆ", "ವೈರಾಗ್ಯ ಭಾವ", "ವಿಶ್ಲೇಷಣಾ ಶಕ್ತಿ", "ಅದ್ಭುತ ಕನಸುಗಳು"],
      en: ["Transcendent spiritual intuition", "Deep analytical research", "Philosophical detachment", "Occult wisdom", "Prophetic dreams"],
      hi: ["आध्यात्मिक अंतर्दृष्टि", "गूढ़ ज्ञान", "तपस्या", "वैराग्य"],
      te: ["ఆధ్యాత్మిక దృష్టి", "లోతైన పరిశోధన", "వైరాగ్యం", "జ్ఞానం"],
      ta: ["ஆன்மீக ஞானம்", "ஆழ்ந்த ஆராய்ச்சி", "பற்றற்ற நிலை", "அறிவு"]
    },
    friendlyNumbers: [1, 4, 6, 7],
    enemyNumbers: [8],
    neutralNumbers: [2, 3, 5, 9],
    luckyGem: { kn: "ವೈಡೂರ್ಯ (Cat's Eye)", en: "Cat's Eye Chrysoberyl (Vaidurya)", hi: "लहसुनिया", te: "వైడూర్యం", ta: "வைடூரியம்" },
    luckyDay: { kn: "ಮಂಗಳವಾರ / ಗುರುವಾರ", en: "Tuesday / Thursday", hi: "मंगलवार / गुरुवार", te: "మంగళవారం / గురువారం", ta: "செவ்வாய் / வியாழன்" },
    luckyColors: { kn: ["ಬೂದು", "ಹೊಗೆ ಬಣ್ಣ (Smoky)", "ಚಿನ್ನದ ಕಂದು"], en: ["Smoky Grey", "Sea Green", "Golden Brown"], hi: ["धूमिल", "धूसर", "हरा-भूरा"], te: ["బూడిద", "గోధుమ"], ta: ["சாம்பல்", "புகை நிறம்"] },
    careerFields: { kn: ["ಸಂಶೋಧನೆ & ವಿಜ್ಞಾನ", "ಆಧ್ಯಾತ್ಮ & ಜ್ಯೋತಿಷ್ಯ", "ಮನೋಚಿಕಿತ್ಸೆ", "ಫಿಲಾಸಫಿ", "ಸೈಬರ್ ಭದ್ರತೆ"], en: ["Pure Science & Research", "Occult & Astrology", "Psychotherapy & Healing", "Cyber Security", "Spiritual Authorship"], hi: ["अनुसंधान", "ज्योतिष", "दर्शनशास्त्र", "साइबर सुरक्षा"], te: ["పరిశోధన", "జ్యోతిష్యం", "తత్వశాస్త్రం"], ta: ["ஆராய்ச்சி", "ஜோதிடம்", "மெய்ஞ்ஞானம்"] },
    remedy: { kn: "ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಠಣ, ಬೀದಿ ನಾಯಿಗಳಿಗೆ ರೊಟ್ಟಿ ನೀಡುವುದು ಹಾಗೂ ಧ್ಯಾನ.", en: "Ganapati Atharvashirsha chanting, feeding stray dogs with bread/milk, and daily meditation.", hi: "गणेश अथर्वशीर्ष पाठ व श्वानों को भोजन कराना।", te: "గణపతి అథర్వశీర్ష పారాయణం, కుక్కలకు ఆహారం.", ta: "கணபதி அதர்வசீரிடம் மற்றும் நாய்களுக்கு உணவளித்தல்." }
  },
  8: {
    number: 8,
    graha: PlanetName.Saturn,
    grahaName: { kn: "ಶನಿ", en: "Shani (Saturn)", hi: "शनि", te: "శని", ta: "சனி" },
    title: { kn: "ಕರ್ಮಯೋಗಿ & ನ್ಯಾಯಾಧೀಶ (The Karmic Master of Endurance)", en: "The Karmic Master of Discipline & Legacy", hi: "कर्मयोगी व न्यायप्रिय", te: "కర్మయోగి & న్యాయమూర్తి", ta: "கர்மயோகி & நீதியாளர்" },
    qualities: {
      kn: ["ಅಸಾಧಾರಣ ತಾಳ್ಮೆ", "ಕಠಿಣ ಪರಿಶ್ರಮ", "ದೀರ್ಘಾವಧಿ ಯಶಸ್ಸು", "ನ್ಯಾಯಪರತೆ", "ಸ್ಥಿರ ಸಂಪತ್ತು"],
      en: ["Unyielding endurance", "Relentless discipline", "Delayed yet indestructible success", "Judicial fairness", "Generational empire building"],
      hi: ["अथक परिश्रम", "धैर्य", "न्यायप्रियता", "चिरस्थायी सफलता"],
      te: ["అపారమైన ఓర్పు", "కఠిన శ్రమ", "శాశ్వత విజయం", "న్యాయం"],
      ta: ["கடுமையான உழைப்பு", "பொறுமை", "நிலையான வெற்றி", "நீதி"]
    },
    friendlyNumbers: [3, 4, 5, 6, 7],
    enemyNumbers: [1, 2, 9],
    neutralNumbers: [],
    luckyGem: { kn: "ನೀಲ (Blue Sapphire) / ಅಮೆಥಿಸ್ಟ್ (Amethyst)", en: "Blue Sapphire (Neelam) or Amethyst (Jamuniya)", hi: "नीलम / जामुनिया", te: "నీలం", ta: "நீலம்" },
    luckyDay: { kn: "ಶನಿವಾರ (Saturday)", en: "Saturday", hi: "शनिवार", te: "శనివారం", ta: "சனி" },
    luckyColors: { kn: ["ಕಡು ನೀಲಿ", "ಕಪ್ಪು", "ಕಡು ಬೂದು"], en: ["Midnight Blue", "Deep Black", "Charcoal Grey"], hi: ["गहरा नीला", "काला", "ग्रे"], te: ["నలుపు", "ముదురు నీలం"], ta: ["கருப்பு", "அடர் நீலம்"] },
    careerFields: { kn: ["ರಿಯಲ್ ಎಸ್ಟೇಟ್ & ಭೂಮಿ", "ನ್ಯಾಯಾಂಗ", "ಉಕ್ಕು & ಗಣಿಗಾರಿಕೆ", "ದೊಡ್ಡ ಕೈಗಾರಿಕೆಗಳು", "ಸರ್ಕಾರಿ ಇಂಜಿನಿಯರಿಂಗ್"], en: ["Real Estate & Infrastructure", "Judiciary & Law", "Mining, Oil & Steel", "Heavy Manufacturing", "Structural Engineering"], hi: ["भूमि व भवन", "वकालत", "खनिज व लोहा", "उद्योग"], te: ["రియల్ ఎస్టేట్", "న్యాయవాదం", "గనులు", "పరిశ్రమలు"], ta: ["ரியல் எஸ்டேட்", "நீதித்துறை", "சுரங்கம்", "தொழிற்சாலை"] },
    remedy: { kn: "ಶನಿವಾರ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ, ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸುವುದು ಹಾಗೂ ಬಡವರಿಗೆ/ಶ್ರಮಿಕರಿಗೆ ಅನ್ನದಾನ.", en: "Hanuman Chalisa chanting on Saturdays, lighting sesame oil lamp, and feeding laborers/underprivileged.", hi: "हनुमान चालीसा पाठ, तिल तेल का दीप व गरीबों की सेवा।", te: "హనుమాన్ చాలీసా, నువ్వుల నూనె దీపం, అన్నదానం.", ta: "ஹனுமான் சாலிசா, எள் விளக்கு ஏற்றுதல் மற்றும் அன்னதானம்." }
  },
  9: {
    number: 9,
    graha: PlanetName.Mars,
    grahaName: { kn: "ಕುಜ / ಮಂಗಳ", en: "Kuja (Mars)", hi: "मंगल", te: "కుజుడు", ta: "செவ்வாய்" },
    title: { kn: "ಶೌರ್ಯ & ಯೋಧ (The Valiant Commander)", en: "The Valiant Commander & Humanitarian", hi: "शौर्यवान सेनापति", te: "ధైర్యశాలి సైన్యాధ్యక్షుడు", ta: "வீர தளபதி" },
    qualities: {
      kn: ["ಅಗಾಧ ಧೈರ್ಯ", "ಚುರುಕುತನ", "ರಕ್ಷಣಾ ಶಕ್ತಿ", "ಉದಾತ್ತ ತ್ಯಾಗ", "ತಂತ್ರಜ್ಞಾನ ಕುಶಲತೆ"],
      en: ["Fearless valour", "Dynamism & speed", "Protective leadership", "Generous humanitarian spirit", "Engineering prowess"],
      hi: ["अदम्य साहस", "तेजस्वी", "परोपकार", "शौर्य व पराक्रम"],
      te: ["అపారమైన ధైర్యం", "వేగం", "నాయకత్వం", "త్యాగం"],
      ta: ["வீரம்", "வேகம்", "பாதுகாக்கும் குணம்", "தியாகம்"]
    },
    friendlyNumbers: [1, 2, 3, 5],
    enemyNumbers: [2, 8],
    neutralNumbers: [4, 6, 7],
    luckyGem: { kn: "ಹವಳ (Red Coral / Pravala)", en: "Red Coral (Moonga / Pravala)", hi: "मूंगा", te: "పగడం", ta: "பவளம்" },
    luckyDay: { kn: "ಮಂಗಳವಾರ (Tuesday)", en: "Tuesday", hi: "मंगलवार", te: "మంగళవారం", ta: "செவ்வாய்" },
    luckyColors: { kn: ["ರಕ್ತ ಕೆಂಪು", "ಮೆರೂನ್", "ಕಿತ್ತಳೆ"], en: ["Blood Red", "Deep Maroon", "Fiery Coral"], hi: ["लाल", "मैरून", "नारंगी"], te: ["ఎరుపు", "మెరూన్"], ta: ["சிவப்பு", "மெரூன்"] },
    careerFields: { kn: ["ರಕ್ಷಣಾ ಪಡೆ (Army/Navy)", "ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Surgeon)", "ಸಿವಿಲ್ & ಮೆಕ್ಯಾನಿಕಲ್ ಇಂಜಿನಿಯರಿಂಗ್", "ಕ್ರೀಡೆ", "ಭೂಮಿ ವ್ಯಾಪಾರ"], en: ["Defense & Armed Forces", "Surgery & Medicine", "Civil & Mechanical Engineering", "Sports & Athletics", "Land Development"], hi: ["सेना व पुलिस", "शल्य चिकित्सा", "इंजीनियरिंग", "खेल"], te: ["రక్షణ రంగం", "సర్జన్", "ఇంజనీరింగ్", "క్రీడలు"], ta: ["ராணுவம்", "அறுவை சிகிச்சை", "பொறியியல்", "விளையாட்டு"] },
    remedy: { kn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಭುಜಂಗ ಸ್ತೋತ್ರ ಪಠಣ, ಮಂಗಳವಾರ ರಕ್ತದಾನ ಅಥವಾ ತೊಗರಿ ಬೇಳೆ ದಾನ, ಹಾಗೂ ಋಣವಿಮೋಚಕ ಅಂಗಾರಕ ಸ್ತೋತ್ರ.", en: "Subrahmanya Bhujanga Stotram, donating toor dal / blood on Tuesday, and Rinavimochan Angaraka Stotram.", hi: "सुब्रह्मण्य स्वामी पूजा व मसूर दाल दान।", te: "సుబ్రహ్మణ్య స్వామి పూజ, కందుల దానం.", ta: "முருகன் வழிபாடு மற்றும் துவரம் பருப்பு தானம்." }
  }
};

/**
 * Calculates Mulank, Bhagyank, and Namaank with Chaldean numerology.
 */
export function calculateSankhyaProfile(dobStr: string, nameStr?: string) {
  // 1. Calculate Mulank (Birth Root)
  let dayNum = 1;
  const isoMatch = dobStr.match(/^\d{4}[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    dayNum = parseInt(isoMatch[2], 10);
  } else {
    const ddmmyyyyMatch = dobStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (ddmmyyyyMatch) {
      dayNum = parseInt(ddmmyyyyMatch[1], 10);
    } else {
      const dayMatch = dobStr.match(/\b(\d{1,2})\b/);
      if (dayMatch && dayMatch[1]) {
        const rawDay = parseInt(dayMatch[1], 10);
        dayNum = rawDay <= 31 ? rawDay : 1;
      }
    }
  }
  const reduceToSingle = (n: number): number => {
    let cur = n;
    while (cur > 9) {
      cur = cur.toString().split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return cur || 1;
  };

  const mulank = reduceToSingle(dayNum);

  // 2. Calculate Bhagyank (Life Path Destiny)
  const digits = dobStr.replace(/\D/g, "").split("").map((c) => parseInt(c, 10));
  const dateSum = digits.reduce((acc, d) => acc + d, 0);
  const bhagyank = reduceToSingle(dateSum);

  // 3. Calculate Namaank (Chaldean System)
  // Chaldean Letter Values:
  // 1: A, I, J, Q, Y
  // 2: B, K, R
  // 3: C, G, L, S
  // 4: D, M, T
  // 5: E, H, N, X
  // 6: U, V, W
  // 7: O, Z
  // 8: F, P
  const CHALDEAN_MAP: Record<string, number> = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
  };

  let namaank = mulank;
  if (nameStr && nameStr.trim()) {
    const letters = nameStr.toUpperCase().replace(/[^A-Z]/g, "").split("");
    const nameSum = letters.reduce((acc, char) => acc + (CHALDEAN_MAP[char] || 0), 0);
    namaank = reduceToSingle(nameSum);
  }

  const mulankRecord = SANKHYA_SHASTRA_CATALOG[mulank];
  const bhagyankRecord = SANKHYA_SHASTRA_CATALOG[bhagyank];
  const namaankRecord = SANKHYA_SHASTRA_CATALOG[namaank];

  const isMulankBhagyankHarmonious =
    mulankRecord.friendlyNumbers.includes(bhagyank) && !mulankRecord.enemyNumbers.includes(bhagyank);

  return {
    mulank,
    bhagyank,
    namaank,
    mulankRecord,
    bhagyankRecord,
    namaankRecord,
    isMulankBhagyankHarmonious
  };
}

// =========================================================================
// SECTION 7: HASTA MUDRIKA (Vedic Palmistry Lines, Mounts & Sacred Marks)
// =========================================================================
export interface HastaLineRecord {
  id: string;
  name: Record<SupportedLanguage, string>;
  location: Partial<Record<SupportedLanguage, string>> & { kn: string; en: string };
  significance: Partial<Record<SupportedLanguage, string>> & { kn: string; en: string };
  auspiciousFeatures: Partial<Record<SupportedLanguage, string[]>> & { kn: string[]; en: string[] };
  inAuspiciousFeatures: Partial<Record<SupportedLanguage, string[]>> & { kn: string[]; en: string[] };
}

export const HASTA_MUDRIKA_LINES: HastaLineRecord[] = [
  {
    id: "ayushya_rekha",
    name: { kn: "ಆಯುಷ್ಯ ರೇಖೆ (Life Line)", en: "Life Line (Ayushya Rekha)", hi: "आयु रेखा", te: "ఆయుష్షు రేఖ", ta: "ஆயுள் ரேகை" },
    location: { kn: "ಗುರು & ಕುಜ ಪರ್ವತದ ಮಧ್ಯದಿಂದ ಆರಂಭವಾಗಿ ಶುಕ್ರ ಪರ್ವತವನ್ನು ಸುತ್ತುವರೆದು ಮಣಿಕಟ್ಟಿನ ಕಡೆ ಸಾಗುತ್ತದೆ.", en: "Originates between Jupiter & Mars mounts, wraps gracefully around Mount of Venus towards wrist." },
    significance: { kn: "ದೈಹಿಕ ಚೈತನ್ಯ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ಆಯಸ್ಸು ಹಾಗೂ ಜೀವನೋತ್ಸಾಹವನ್ನು ಸೂಚಿಸುತ್ತದೆ.", en: "Governs vital physical prana, cellular resilience, longevity, and biological stamina." },
    auspiciousFeatures: {
      kn: ["ಸ್ಪಷ್ಟ, ಆಳವಾದ ಹಾಗೂ ತುಂಡಾಗದ ರೇಖೆ ದೀರ್ಘಾಯುಷ್ಯ ಮತ್ತು ರೋಗಮುಕ್ತ ಆರೋಗ್ಯದ ಸಂಕೇತ.", "ಶುಕ್ರ ಪರ್ವತದ ಕಡೆ ಅಗಲವಾಗಿ ಆವರಿಸಿದರೆ ಅಪಾರ ಜೀವನೋತ್ಸಾಹ."],
      en: ["Clear, deep unbroken curve indicates robust constitution and enduring longevity.", "Wide sweep around Venus mount signals abundant vitality and passion for life."]
    },
    inAuspiciousFeatures: {
      kn: ["ರೇಖೆಯಲ್ಲಿ ದ್ವೀಪ ಅಥವಾ ಕತ್ತರಿ ಗುರುತು ಆಯಾ ವಯಸ್ಸಿನಲ್ಲಿ ತೀವ್ರ ಅನಾರೋಗ್ಯ ಸೂಚಿಸುತ್ತದೆ.", "ಹಲವು ಅಡ್ಡ ರೇಖೆಗಳು ಕೌಟುಂಬಿಕ ಮಾನಸಿಕ ಒತ್ತಡವನ್ನು ತರುತ್ತವೆ."],
      en: ["Islands or cross-bars mark periods of acute health challenges or energy depletion.", "Severe breaks indicate major accidents or life crises requiring divine protection."]
    }
  },
  {
    id: "mastaka_rekha",
    name: { kn: "ಮಸ್ತಕ ರೇಖೆ / ಬುದ್ಧಿ ರೇಖೆ (Head Line)", en: "Head Line (Mastaka Rekha)", hi: "मस्तिष्क रेखा", te: "మస్తిష్క రేఖ", ta: "புத்தி ரேகை" },
    location: { kn: "ತೋರುಬೆರಳಿನ ಕೆಳಗಿನಿಂದ ಆರಂಭವಾಗಿ ಹಸ್ತದ ಮಧ್ಯಭಾಗವನ್ನು ದಾಟಿ ಚಂದ್ರ ಅಥವಾ ಕುಜ ಪರ್ವತದತ್ತ ಸಾಗುತ್ತದೆ.", en: "Starts below index finger, runs horizontally across palm towards Mount of Moon or Upper Mars." },
    significance: { kn: "ಬುದ್ಧಿಶಕ್ತಿ, ಗ್ರಹಣ ಸಾಮರ್ಥ್ಯ, ಮಾನಸಿಕ ಏಕಾಗ್ರತೆ, ತಾರ್ಕಿಕತೆ ಹಾಗೂ ಕಲ್ಪನಾ ಶಕ್ತಿ.", en: "Dictates mental concentration, logical faculty, memory power, and emotional stability under pressure." },
    auspiciousFeatures: {
      kn: ["ಸರಳ ಹಾಗೂ ಸ್ಪಷ್ಟ ರೇಖೆ ಪ್ರಖರ ಬುದ್ಧಿ ಮತ್ತು ಲೆಕ್ಕಾಚಾರದ ಜಾಣ್ಮೆಯನ್ನು ನೀಡುತ್ತದೆ.", "ರೇಖೆಯ ಕೊನೆಯಲ್ಲಿ ತ್ರಿಶೂಲ ಅಥವಾ ಕವಲು (Fork) ಇದ್ದರೆ ಅಪ್ರತಿಮ ಲೇಖಕ/ಸಂಶೋಧನಾ ಯೋಗ."],
      en: ["Long, clearly etched line represents brilliant analytical intellect and laser focus.", "A bifurcated fork ('Writer's Fork') at the end reveals extraordinary literary, business and inventive genius."]
    },
    inAuspiciousFeatures: {
      kn: ["ಅತಿ ಹೆಚ್ಚು ಕೆಳಕ್ಕೆ ಬಾಗಿದ ರೇಖೆ ಅತಿಯಾದ ಚಿಂತೆ ಮತ್ತು ಮಾನಸಿಕ ಖಿನ್ನತೆಗೆ ಕಾರಣವಾಗಬಹುದು.", "ರೇಖೆಯ ಮೇಲೆ ನಕ್ಷತ್ರ ಅಥವಾ ಚುಕ್ಕೆ ತಲೆಗೆ ಪೆಟ್ಟು ಅಥವಾ ನರಗಳ ದೌರ್ಬಲ್ಯ ಸೂಚಿಸುತ್ತದೆ."],
      en: ["Excessively drooping slope into lower Moon mount warns of depression, over-imagination, or insomnia.", "Islands on the head line correlate with mental exhaustion, eye strain, or migraines."]
    }
  },
  {
    id: "hridaya_rekha",
    name: { kn: "ಹೃದಯ ರೇಖೆ (Heart Line)", en: "Heart Line (Hridaya Rekha)", hi: "हृदय रेखा", te: "హృదయ రేఖ", ta: "இதய ரேகை" },
    location: { kn: "ಕಿರುಬೆರಳಿನ ಕೆಳಗಿನಿಂದ ಆರಂಭವಾಗಿ ಗುರು ಪರ್ವತದ (ತೋರುಬೆರಳು) ಕಡೆಗೆ ಮುಂದುವರಿಯುತ್ತದೆ.", en: "Begins beneath Mercury mount (little finger) and curves upwards towards Mount of Jupiter." },
    significance: { kn: "ಪ್ರೀತಿ, ಪ್ರೇಮ, ಹೃದಯದ ಆರೋಗ್ಯ, ಭಾವನಾತ್ಮಕ ನಿಷ್ಠೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಭಕ್ತಿ.", en: "Rules cardiovascular health, emotional loyalty, romantic bonds, empathy, and spiritual devotion." },
    auspiciousFeatures: {
      kn: ["ಗುರು ಪರ್ವತದ ಮೇಲೆ ತಲುಪಿ ಕೊನೆಗೊಳ್ಳುವ ರೇಖೆ ಆದರ್ಶ ದಾಂಪತ್ಯ, ಉನ್ನತ ನೈತಿಕತೆ ಹಾಗೂ ದೈವಭಕ್ತಿಯ ಸಂಕೇತ.", "ಕೊನೆಯಲ್ಲಿ ತ್ರಿಶೂಲ (Trident) ರಚನೆಯಾದರೆ ಶಿವ-ಪಾರ್ವತಿಯರ ಕೃಪೆಯಿಂದ ಸಕಲ ಸೌಭಾಗ್ಯ."],
      en: ["Terminating squarely on Mount of Jupiter denotes profound moral purity, marital fidelity, and noble spouse.", "Ending in a sacred Trident bestows universal respect, divine grace, and enduring love."]
    },
    inAuspiciousFeatures: {
      kn: ["ಶನಿ ಪರ್ವತದಲ್ಲೇ ಅರ್ಧಕ್ಕೆ ನಿಲ್ಲುವ ರೇಖೆ ಸ್ವಾರ್ಥ ಅಥವಾ ಪ್ರೇಮ ವೈಫಲ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ.", "ಸರಪಳಿಯಾಕಾರದ ರೇಖೆ ಹೃದಯ ದೌರ್ಬಲ್ಯ ಮತ್ತು ರಕ್ತದೊತ್ತಡದ ಎಚ್ಚರಿಕೆ."],
      en: ["Abrupt termination under Saturn indicates emotional cynicism, isolation, or romantic disillusionment.", "Chained heart line warns of cardiovascular sensitivity and recurring emotional turmoil."]
    }
  },
  {
    id: "bhagya_rekha",
    name: { kn: "ಭಾಗ್ಯ ರೇಖೆ / ಶನಿ ರೇಖೆ (Fate / Saturn Line)", en: "Fate Line (Bhagya Rekha)", hi: "भाग्य रेखा / शनि रेखा", te: "భాగ్య రేఖ", ta: "விதி ரேகை / சனி ரேகை" },
    location: { kn: "ಮಣಿಕಟ್ಟಿನಿಂದ ಅಥವಾ ಚಂದ್ರ ಪರ್ವತದಿಂದ ನೇರವಾಗಿ ಮಧ್ಯದ ಬೆರಳಿನ (ಶನಿ ಪರ್ವತ) ಕೆಳಗೆ ಮೇಲೇರುತ್ತದೆ.", en: "Rises straight from base of palm or Mount of Moon up towards Mount of Saturn (middle finger)." },
    significance: { kn: "ವೃತ್ತಿಜೀವನ, ಸಂಪತ್ತು ಗಳಿಕೆ, ಅದೃಷ್ಟ, ಸಮಾಜದಲ್ಲಿ ಸ್ಥಾನಮಾನ ಹಾಗೂ ಭಾಗ್ಯೋದಯದ ಕಾಲಾವಧಿ.", en: "Illuminates career trajectory, financial ascent, luck in business, and social prominence." },
    auspiciousFeatures: {
      kn: ["ಆಳವಾದ ನೇರ ರೇಖೆ ಶನಿ ಪರ್ವತ ತಲುಪಿದರೆ ದರಿದ್ರನೂ ಮಹಾ ಕೋಟ್ಯಾಧಿಪತಿಯಾಗುವ ಯೋಗ.", "ಚಂದ್ರ ಪರ್ವತದಿಂದ ಆರಂಭವಾದರೆ ಸಾರ್ವಜನಿಕ ಬೆಂಬಲ, ಹೆಂಡತಿಯ ಕಡೆಯಿಂದ ಭಾಗ್ಯೋದಯ ಹಾಗೂ ವಿದೇಶ ಯೋಗ."],
      en: ["Deep, unhindered ascent to Mount of Saturn promises continuous financial growth and royal legacy.", "Originating from Mount of Moon guarantees fame through public adulation, foreign wealth, and prosperous marriage."]
    },
    inAuspiciousFeatures: {
      kn: ["ಮಸ್ತಕ ರೇಖೆ (೩೫ನೇ ವಯಸ್ಸು) ಅಥವಾ ಹೃದಯ ರೇಖೆಯಲ್ಲಿ (೫೨ನೇ ವಯಸ್ಸು) ನಿಂತರೆ ವೃತ್ತಿಜೀವನದ ದೊಡ್ಡ ಅಡೆತಡೆ.", "ಅಡ್ಡ ಕತ್ತರಿ ರೇಖೆಗಳು ವ್ಯಾಪಾರದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ನಷ್ಟ ತರುತ್ತವೆ."],
      en: ["Stoppage at Head line marks career obstruction at age 35 through misjudgment.", "Crosses intersecting the line bring unforeseen financial litigation requiring Shani remedies."]
    }
  },
  {
    id: "surya_rekha",
    name: { kn: "ಸೂರ್ಯ ರೇಖೆ / ಕೀರ್ತಿ ರೇಖೆ (Sun / Apollo Line)", en: "Sun Line (Surya Rekha / Apollo Line)", hi: "सूर्य रेखा / कीर्ति रेखा", te: "సూర్య రేఖ", ta: "சூரிய ரேகை / கீர்த்தி ரேகை" },
    location: { kn: "ಉಂಗುರದ ಬೆರಳಿನ (ಸೂರ್ಯ ಪರ್ವತ) ಕೆಳಗೆ ಸಾಗುವ ಲಂಬ ರೇಖೆ.", en: "Runs vertically beneath ring finger towards Mount of Sun." },
    significance: { kn: "ಖ್ಯಾತಿ, ಸರ್ಕಾರದ ಮನ್ನಣೆ, ರಾಜಯೋಗ, ಕಲಾ ನೈಪುಣ್ಯ ಹಾಗೂ ಅಪ್ರತಿಮ ಜನಪ್ರಿಯತೆ.", en: "Bestows fame, governmental honors, artistic genius, charisma, and wealth beyond lineage." },
    auspiciousFeatures: {
      kn: ["ಸ್ಪಷ್ಟ ಸೂರ್ಯ ರೇಖೆ ಉಳ್ಳ ವ್ಯಕ್ತಿಗೆ ಸಮಾಜದಲ್ಲಿ ಅಪಾರ ಗೌರವ ಮತ್ತು ಅಧಿಕಾರ ಲಭಿಸುತ್ತದೆ.", "ಸೂರ್ಯ ಪರ್ವತದಲ್ಲಿ ನಕ್ಷತ್ರ (Star) ಅಥವಾ ತ್ರಿಕೋನವಿದ್ದರೆ ಜಾಗತಿಕ ಖ್ಯಾತಿ."],
      en: ["Unblemished Sun line confers state awards, political influence, and lasting legacy.", "A star on Mount of Sun indicates world renown and extraordinary fortune."]
    },
    inAuspiciousFeatures: {
      kn: ["ರೇಖೆ ಇಲ್ಲದಿದ್ದರೆ ಎಷ್ಟೇ ಪರಿಶ್ರಮ ಪಟ್ಟರೂ ಅರ್ಹ ಮನ್ನಣೆ ಸಿಗದೆ ತಡವಾಗಬಹುದು.", "ಅಡ್ಡ ಕಲೆಗಳು ಅಪವಾದ ಅಥವಾ ಸಾರ್ವಜನಿಕ ನಿಂದನೆಯ ಎಚ್ಚರಿಕೆ ನೀಡುತ್ತವೆ."],
      en: ["Absence of Sun line requires double effort to earn public recognition.", "Spots on the line warn of sudden controversies or tax audits requiring Surya Arghya."]
    }
  }
];

export const HASTA_MUDRIKA_SIGNS = [
  {
    id: "trishula",
    name: { kn: "ತ್ರಿಶೂಲ ಚಿಹ್ನೆ (Trident Sign)", en: "Trishula (Sacred Trident Sign)" },
    significance: {
      kn: "ಗುರು ಅಥವಾ ಶನಿ ಪರ್ವತದ ಮೇಲೆ ತ್ರಿಶೂಲ ಮೂಡಿದರೆ ಭಗವಾನ್ ಶಿವನ ಸಾಕ್ಷಾತ್ ರಕ್ಷಣೆ, ಅಪಾರ ಆಧ್ಯಾತ್ಮಿಕ ಅಧಿಕಾರ ಹಾಗೂ ರಾಜಯೋಗ ಪ್ರಾಪ್ತಿ.",
      en: "On Jupiter or Saturn mount, the Trident of Lord Shiva confers supreme authority, unassailable wealth, and divine grace."
    }
  },
  {
    id: "matsya",
    name: { kn: "ಮತ್ಸ್ಯ ರೇಖೆ (Fish Sign)", en: "Matsya (Fish Sign)" },
    significance: {
      kn: "ಕೇತು ಅಥವಾ ಜೀವ ರೇಖೆಯ ತುದಿಯಲ್ಲಿ ಮೀನಿನ ಆಕಾರವಿದ್ದರೆ ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯದಿಂದ ಕೋಟ್ಯಂತರ ಆಸ್ತಿ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಮೋಕ್ಷ ಗತಿ.",
      en: "At base of palm on Mount of Ketu, the Fish sign unlocks sudden inheritance, spiritual enlightenment, and sacred pilgrimage."
    }
  },
  {
    id: "chatuskona",
    name: { kn: "ಚತುಷ್ಕೋನ (Square Sign / Divine Raksha)", en: "Square (Divine Shield)" },
    significance: {
      kn: "ಯಾವುದೇ ದೋಷಯುಕ್ತ ರೇಖೆಯ ಮೇಲಿರುವ ಚತುಷ್ಕೋನವು ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚವಾಗಿ ಕೆಲಸ ಮಾಡಿ ಪ್ರಾಣಾಪಾಯದಿಂದ ಪಾರುಮಾಡುತ್ತದೆ.",
      en: "Acts as a mystical armor (Kavacha), neutralizing severe line breaks and shielding from fatal disasters."
    }
  }
];

// =========================================================================
// SECTION 8: MUKHA MUDRIKA (Vedic Face Reading / Samudrika Shastra)
// =========================================================================
export const MUKHA_MUDRIKA_CATALOG = {
  forehead: {
    title: { kn: "ಲಲಾಟ ಲಕ್ಷಣ (Forehead - Destiny & Intellect)", en: "Forehead (Lalata - Destiny & Intellect)" },
    points: {
      kn: [
        "ಅಗಲವಾದ ಮತ್ತು ಉಬ್ಬಿದ ಹಣೆ (Broad Forehead): ಉನ್ನತ ಬುದ್ಧಿವಂತಿಕೆ, ಪೂರ್ವಪುಣ್ಯ ಮತ್ತು ರಾಜತಾಂತ್ರಿಕ ಯಶಸ್ಸಿನ ಸಂಕೇತ.",
        "ಮೂರು ಸ್ಪಷ್ಟ ಅಡ್ಡ ರೇಖೆಗಳು: ಮೊದಲನೆಯದು ಗುರು ರೇಖೆ (ಜ್ಞಾನ), ಎರಡನೆಯದು ಮಂಗಳ ರೇಖೆ (ಧೈರ್ಯ), ಮೂರನೆಯದು ಶನಿ ರೇಖೆ (ದೀರ್ಘಾಯುಷ್ಯ).",
        "ಮಧ್ಯದಲ್ಲಿ ಮಚ್ಚೆ (Center Mole): ಮಹಾನ್ ದೈವಭಕ್ತಿ, ತೀಕ್ಷ್ಣ ಅಂತಃಪ್ರಜ್ಞೆ ಹಾಗೂ ೪೦ ವರ್ಷದ ನಂತರ ಅಪಾರ ಸಿರಿವಂತಿಕೆ."
      ],
      en: [
        "Broad, slightly convex forehead indicates supreme administrative brilliance and strong ancestral merit.",
        "Three distinct horizontal lines correspond to Jupiter (Wisdom), Mars (Courage), and Saturn (Longevity).",
        "A mole centered on the brow signifies awakened third-eye intuition and substantial wealth after age 40."
      ]
    }
  },
  eyes: {
    title: { kn: "ನೇತ್ರ ಲಕ್ಷಣ (Eyes - Soul Mirror & Sun-Moon)", en: "Eyes (Netra - Sun & Moon Balance)" },
    points: {
      kn: [
        "ಬಲಗಣ್ಣು ಸೂರ್ಯ (ಪಿತ್ರಾರ್ಜಿತ ಶಕ್ತಿ) ಮತ್ತು ಎಡಗಣ್ಣು ಚಂದ್ರ (ಮಾತೃ ಶಕ್ತಿ) ದೇವತೆಗಳಿಗೆ ಸಂಬಂಧಿಸಿದೆ.",
        "ಕಮಲದಳದಂತೆ ಉದ್ದವಾದ ಹೊಳೆಯುವ ಕಣ್ಣುಗಳು ಕರುಣೆ, ಸತ್ಯನಿಷ್ಠೆ ಮತ್ತು ಧಾರ್ಮಿಕ ಮುನ್ನಡೆಯ ಲಕ್ಷಣ.",
        "ಕಣ್ಣಿನ ಬಿಳಿಭಾಗ ಕೆಂಪಾದ ರೇಖೆಗಳಿಂದ ಕೂಡಿದ್ದರೆ (ಕುಜ ಪ್ರಭಾವ) ತೀವ್ರ ಶೌರ್ಯ, ಅಧಿಕಾರ ಮತ್ತು ನಾಯಕತ್ವ."
      ],
      en: [
        "Right eye is governed by the Sun (soul authority, paternal lineage); Left eye is ruled by the Moon (emotions, maternal grace).",
        "Lotus petal-shaped, lustrous eyes reveal saintly compassion, truthfulness, and spiritual evolution.",
        "Fine red micro-vessels in white of eye indicate potent Mars influence, conferring fearless leadership."
      ]
    }
  },
  nose: {
    title: { kn: "ನಾಸಿಕ ಲಕ್ಷಣ (Nose - Dhanasthana / Wealth Vault)", en: "Nose (Nasika - Dhanasthana / Wealth Vault)" },
    points: {
      kn: [
        "ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರದಲ್ಲಿ ಮೂಗು ಜಾತಕದ ಧನಸ್ಥಾನ ಮತ್ತು ಗುರು-ಬುಧರ ಪ್ರಭಾವವನ್ನು ನೇರವಾಗಿ ಪ್ರದರ್ಶಿಸುತ್ತದೆ.",
        "ನೇರವಾದ ಮೂಗಿನ ಸೇತುವೆ ಹಾಗೂ ದುಂಡಗಾದ ತುದಿ (Rounded Tip): ಕುಬೇರ ಯೋಗ! ಎಂದೂ ಹಣದ ಕೊರತೆ ಬಾರದಂತೆ ನೋಡಿಕೊಳ್ಳುತ್ತದೆ.",
        "ಮೂಗಿನ ತುದಿಯಲ್ಲಿ ಮಚ್ಚೆ: ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನ, ಲಾಟರಿ/ಷೇರು ಯಶಸ್ಸು ಮತ್ತು ಐಷಾರಾಮಿ ವಾಹನ ಯೋಗ."
      ],
      en: [
        "In Samudrika Shastra, the nose is the primary barometer of personal wealth, self-esteem, and Jupiterian bounty.",
        "Straight nasal bridge ending in a fleshy, rounded tip creates Kubera Yoga — lifelong monetary security.",
        "Mole on the nasal tip indicates sudden windfalls, real estate success, and luxury vehicle acquisitions."
      ]
    }
  },
  chinAndLips: {
    title: { kn: "ವದನ & ಚುಬುಕ ಲಕ್ಷಣ (Lips, Speech & Chin Longevity)", en: "Mouth, Lips & Chin (Speech & Longevity)" },
    points: {
      kn: [
        "ಕೆಂಪು ತುಟಿಗಳು ಹಾಗೂ ಸ್ಪಷ್ಟ ಬಾಯಿ: ವಾಕ್-ಸಿದ್ಧಿ, ಪ್ರಭಾವಿ ಉಪನ್ಯಾಸ ಹಾಗೂ ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ.",
        "ದೃಢವಾದ ಮತ್ತು ಮುಂದಕ್ಕೆ ಚಾಚಿದ ಗದ್ದ (Firm Chin): ಪ್ರಬಲ ಇಚ್ಛಾಶಕ್ತಿ, ನಾಯಕತ್ವ ಮತ್ತು ೬೦ ವರ್ಷದ ನಂತರ ಅತ್ಯುನ್ನತ ಆಸ್ತಿ ಸೌಖ್ಯ.",
        "ಗಲ್ಲದ ಮಧ್ಯದಲ್ಲಿ ಗುಳಿ (Cleft Chin): ಕಲಾತ್ಮಕ ಆಕರ್ಷಣೆ, ರೊಮ್ಯಾಂಟಿಕ್ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಪ್ರೀತಿ."
      ],
      en: [
        "Naturally reddish, well-proportioned lips bestow Vak-Siddhi (potency of speech) and persuasive commercial acumen.",
        "A strong, prominently contoured chin ensures iron willpower, robust longevity, and vast landed estate in retirement.",
        "A cleft chin signifies magnetic artistic charisma, deep emotional loyalty, and immense public adoration."
      ]
    }
  },
  molesAndMarks: {
    title: { kn: "ತಿಲ ಲಕ್ಷಣ (Facial Moles & Destiny Indicators)", en: "Mole Astrology (Tila Lakshana - Facial Moles)" },
    points: {
      kn: [
        "ಹಣೆಯ ಮಧ್ಯದಲ್ಲಿ ಮಚ್ಚೆ: ಅಖಂಡ ದೈವಾನುಗ್ರಹ, ಆಡಳಿತಾತ್ಮಕ ನಾಯಕತ್ವ ಮತ್ತು ತೀಕ್ಷ್ಣ ಅಂತಃಪ್ರಜ್ಞೆ.",
        "ಬಲಗಲ್ಲದ ಮೇಲೆ ಮಚ್ಚೆ: ವಿವಾಹದ ನಂತರ ಅಪಾರ ಆರ್ಥಿಕ ಏಳಿಗೆ ಹಾಗೂ ಸುಖಮಯ ದಾಂಪತ್ಯ.",
        "ಮೂಗಿನ ತುದಿಯಲ್ಲಿ ಮಚ್ಚೆ: ಕುಬೇರ ಧನಾಗಮನ, ಆಸ್ತಿ ವೃದ್ಧಿ ಮತ್ತು ವ್ಯಾಪಾರ ಜಯ."
      ],
      en: [
        "Center forehead mole indicates supreme spiritual insight and administrative leadership.",
        "Right cheek mole bestows exponential prosperity post-marriage and affectionate relations.",
        "Nose tip mole triggers Kubera wealth windfalls and prosperous trade investments."
      ]
    }
  }
};

// =========================================================================
// SECTION 9: SATYA SANJEEVINI / AYUR SANJEEVINI (Vedic Health & Medical Astrology)
// =========================================================================
export const AYUR_SANJEEVINI_CATALOG = {
  tridoshaAnalysis: {
    vata: {
      title: { kn: "ವಾತ ಪ್ರಕೃತಿ (Vata Dosha - Air & Ether)", en: "Vata Constitution (Air & Ether)" },
      rashis: { kn: "ಮಿಥುನ, ಕನ್ಯಾ, ತುಲಾ, ಮಕರ, ಕುಂಭ", en: "Gemini, Virgo, Libra, Capricorn, Aquarius" },
      planets: { kn: "ಶನಿ, ಬುಧ, ರಾಹು", en: "Saturn, Mercury, Rahu" },
      symptoms: {
        kn: ["ಕೀಲು ನೋವು & ವಾತ ಬಾಧೆ", "ಒಣ ಚರ್ಮ", "ನಿದ್ರಾಹೀನತೆ & ಅತಿಯಾದ ಯೋಚನೆ", "ನರಗಳ ದೌರ್ಬಲ್ಯ"],
        en: ["Joint pain & arthritis", "Dry skin & hair", "Anxiety & erratic sleep", "Nervous hypersensitivity"]
      },
      ayurvedicRemedies: {
        kn: ["ಬಿಸಿ ಎಳ್ಳೆಣ್ಣೆ ಮಸಾಜ್ (ಅಭ್ಯಂಗ)", "ಅಶ್ವಗಂಧ ಕ್ಷೀರಪಾಕ", "ಬೆಚ್ಚಗಿನ, ಜಿಡ್ಡಿನ ತಾಜಾ ಆಹಾರ", "ನಿಯಮಿತ ನಿದ್ರೆ"],
        en: ["Warm sesame oil self-massage (Abhyanga)", "Ashwagandha with warm spiced milk", "Nourishing, grounding warm cooked meals", "Consistent sleep schedule"]
      }
    },
    pitta: {
      title: { kn: "ಪಿತ್ತ ಪ್ರಕೃತಿ (Pitta Dosha - Fire & Water)", en: "Pitta Constitution (Fire & Water)" },
      rashis: { kn: "ಮೇಷ, ಸಿಂಹ, ವೃಶ್ಚಿಕ, ಧನುಸ್ಸು", en: "Aries, Leo, Scorpio, Sagittarius" },
      planets: { kn: "ಸೂರ್ಯ, ಕುಜ, ಕೇತು", en: "Sun, Mars, Ketu" },
      symptoms: {
        kn: ["ಅಸಿಡಿಟಿ & ಎದೆಯುರಿ", "ರಕ್ತದೊತ್ತಡ", "ಕೋಪ & ಉದ್ವೇಗ", "ಚರ್ಮದಲ್ಲಿ ತುರಿಕೆ / ಗುಳ್ಳೆಗಳು"],
        en: ["Hyperacidity & heartburn", "Elevated blood pressure", "Irritability & impatience", "Skin rashes & inflammatory flare-ups"]
      },
      ayurvedicRemedies: {
        kn: ["ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ ಸೇವನೆ", "ಶತಾವರಿ ಕಷಾಯ", "ತಂಪಾದ ಹಣ್ಣುಗಳು (ದಾಳಿಂಬೆ, ಕಲ್ಲಂಗಡಿ)", "ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ"],
        en: ["A2 Desi cow ghee daily", "Shatavari root tonic", "Cooling fresh melons and pomegranates", "Mahamrityunjaya Mantra meditation"]
      }
    },
    kapha: {
      title: { kn: "ಕಫ ಪ್ರಕೃತಿ (Kapha Dosha - Earth & Water)", en: "Kapha Constitution (Earth & Water)" },
      rashis: { kn: "ವೃಷಭ, ಕರ್ಕಾಟಕ, ಮೀನ", en: "Taurus, Cancer, Pisces" },
      planets: { kn: "ಚಂದ್ರ, ಗುರು, ಶುಕ್ರ", en: "Moon, Jupiter, Venus" },
      symptoms: {
        kn: ["ತೂಕ ಹೆಚ್ಚಳ & ಸ್ಥೂಲಕಾಯ", "ಸೀನುವಿಕೆ, ಕಫ & ಶೀತ", "ಆಲಸ್ಯ & ಅತಿಯಾದ ನಿದ್ರೆ", "ಮಧುಮೇಹ ಸಂಭವ"],
        en: ["Sluggish metabolism & weight gain", "Excess mucus, sinus congestion", "Lethargy & excessive daytime sleepiness", "Risk of metabolic resistance"]
      },
      ayurvedicRemedies: {
        kn: ["ತ್ರಿಕಟು ಚೂರ್ಣ (ಶುಂಠಿ, ಮೆಣಸು, ಹಿಪ್ಪಲಿ) ಜೇನುತುಪ್ಪದೊಂದಿಗೆ", "ಪ್ರತಿದಿನ ಚುರುಕಾದ ವ್ಯಾಯಾಮ", "ಉಪವಾಸ", "ತುಳಸಿ ಕಷಾಯ"],
        en: ["Trikatu powder with raw honey", "Vigorous aerobic exercise & Surya Namaskara", "Periodic intermittent fasting", "Warm holy basil (Tulasi) decoction"]
      }
    }
  },
  gokarnaHealthRemedies: {
    kn: [
      "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ ಹಾಗೂ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಬಿಲ್ವಾರ್ಚನೆ ದೀರ್ಘಕಾಲದ ರೋಗ ನಿವಾರಣೆ ಮಾಡುತ್ತದೆ.",
      "ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರದ ನಿರಂತರ ಪಠಣದಿಂದ ಕಣ್ಣು ಮತ್ತು ಹೃದಯದ ತೊಂದರೆಗಳು ಶಮನವಾಗುತ್ತವೆ.",
      "ಪ್ರತಿದಿನ ಮುಂಜಾನೆ ತಾಮ್ರದ ಪಾತ್ರೆಯ ಜಲ ಹಾಗೂ ಗೋಕರ್ಣದ ಪಂಚಾಮೃತ ಪ್ರಸಾದ ಸ್ವೀಕಾರದಿಂದ ಸಕಲ ದೈಹಿಕ ವಿಷಗಳು ಪರಿಹಾರವಾಗುತ್ತವೆ."
    ],
    en: [
      "Performing Maha Mrityunjaya Homa and Bilvarchana at Gokarna Atmalinga cures chronic planetary ailments.",
      "Chanting Aditya Hridaya Stotram continuously shields against cardiovascular and ophthalmic disorders.",
      "Drinking morning water stored in pure copper alongside sanctified Gokarna Panchamrita detoxifies bodily tissues."
    ]
  }
};

// =========================================================================
// SECTION 10: HINDINA JANMA RAHASYA (Past Life Karma Astrology)
// =========================================================================
export const HINDINA_JANMA_CATALOG = {
  karmicHouses: {
    house12: {
      title: { kn: "೧೨ನೇ ಭಾವ (Moksha & Past Life Exit)", en: "12th House (Past Life Exit & Subconscious Realm)" },
      kn: "ಜಾತಕದ ೧೨ನೇ ಭಾವವು ಆತ್ಮವು ಹಿಂದಿನ ಜನ್ಮವನ್ನು ಎಲ್ಲಿ ಮುಗಿಸಿತು ಮತ್ತು ಯಾವ ಪರಿಸರದಿಂದ ಪ್ರಸ್ತುತ ಜನ್ಮಕ್ಕೆ ಬಂದಿದೆ ಎಂಬುದನ್ನು ತಿಳಿಸುತ್ತದೆ. ಶುಭ ಗ್ರಹಗಳಿದ್ದರೆ ಪುಣ್ಯಕ್ಷೇತ್ರ ಅಥವಾ ಸದ್ಗತಿಯಿಂದ ಬಂದ ಆತ್ಮ.",
      en: "The 12th house reveals the soul's previous departure point, spiritual retreat, and the subconscious memories transported into this incarnation."
    },
    house5: {
      title: { kn: "೫ನೇ ಭಾವ (Purva Punya Bhava - Accrued Merit)", en: "5th House (Purva Punya - Past Life Merit)" },
      kn: "೫ನೇ ಭಾವವು ಹಿಂದಿನ ಜನ್ಮಗಳಲ್ಲಿ ಸಂಗ್ರಹಿಸಿದ ಪುಣ್ಯದ ಭಂಡಾರ (ಸಂಚಿತ ಶುಭ ಕರ್ಮ). ಪ್ರತಿಭಾವಂತ ಮಕ್ಕಳು, ಅಪ್ರತಿಮ ಜ್ಞಾನ ಮತ್ತು ಹಠಾತ್ ಅದೃಷ್ಟ ಹಿಂದಿನ ಜನ್ಮದ ತಪಸ್ಸಿನ ಫಲ.",
      en: "The 5th house acts as the spiritual treasury of past life good deeds (Sanchita Subha Karma). Extraordinary intellect and virtuous offspring stem from this house."
    },
    house8: {
      title: { kn: "೮ನೇ ಭಾವ (Runanubandha - Unpaid Karmic Debts)", en: "8th House (Runanubandha - Unresolved Karmic Debts)" },
      kn: "೮ನೇ ಭಾವವು ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ಮುಗಿಯದೆ ಬಾಕಿ ಉಳಿದ ಋಣಗಳನ್ನು (ಹಣ, ನಂಬಿಕೆ, ಪ್ರೀತಿ ಅಥವಾ ಕರ್ತವ್ಯದ ಸಾಲ) ಸೂಚಿಸುತ್ತದೆ. ಈ ಜನ್ಮದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಸವಾಲುಗಳಾಗಿ ಇದು ಎದುರಾಗುತ್ತದೆ.",
      en: "The 8th house governs unresolved debts (Runanubandha) across lifespans. Karmic creditors often re-enter life as challenging partners or sudden financial claims."
    }
  },
  rahuKetuAxis: {
    title: { kn: "ರಾಹು-ಕೇತುಗಳ ಪೂರ್ವಜನ್ಮದ ಅಕ್ಷ (Evolutionary Karmic Axis)", en: "Rahu-Ketu Past Life Evolutionary Axis" },
    ketuPrinciple: {
      kn: "ಕೇತುವು ಕುಳಿತ ರಾಶಿ & ಭಾವವು ಹಿಂದಿನ ಜನ್ಮದಲ್ಲಿ ನೀವು ಈಗಾಗಲೇ ಸಂಪೂರ್ಣವಾಗಿ ಕಲಿತು ಕರಗತ ಮಾಡಿಕೊಂಡಿದ್ದ ಜ್ಞಾನ ಮತ್ತು ಕರ್ಮವನ್ನು ತೋರಿಸುತ್ತದೆ. ಇದು ನಿಮ್ಮ ನೈಸರ್ಗಿಕ ಪ್ರತಿಭೆ.",
      en: "Ketu marks where your soul already mastered spiritual and worldly skills in past lives. It represents instinctual mastery and familiar subconscious territory."
    },
    rahuPrinciple: {
      kn: "ರಾಹುವು ಕುಳಿತ ರಾಶಿ & ಭಾವವು ಈ ಜನ್ಮದಲ್ಲಿ ನಿಮ್ಮ ಆತ್ಮವು ಪೂರೈಸಬೇಕಾದ ಅಪೂರ್ಣ ಕರ್ಮ ಮತ್ತು ನವೀನ ಅನುಭವಗಳನ್ನು ತೋರಿಸುತ್ತದೆ. ಇದು ನಿಮ್ಮ ಜೀವನದ ಮುಖ್ಯ ಗುರಿ.",
      en: "Rahu represents the evolutionary frontier — the unfulfilled desires and uncharted lessons your soul took birth to master in this lifetime."
    }
  },
  gokarnaKarmicParihara: {
    kn: [
      "ಪೂರ್ವಜನ್ಮದ ಋಣಾನುಬಂಧ ಹಾಗೂ ಪಿತೃ ದೋಷ ನಿವಾರಣೆಗಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ 'ಮೋಕ್ಷ ನಾರಾಯಣ ಬಲಿ' ಹಾಗೂ 'ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ' ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.",
      "ಸರ್ಪ ದೋಷ ಅಥವಾ ಹಿಂದಿನ ಜನ್ಮದ ಶಾಪ ನಿವಾರಣೆಗೆ 'ನಾಗಪ್ರತಿಷ್ಠೆ' ಮತ್ತು ರುದ್ರಾಭಿಷೇಕ ಶಾಂತಿ.",
      "ಗೋ-ದಾನ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಭೋಜನದಿಂದ ಹಿಂದಿನ ಜನ್ಮದ ಸಂಚಿತ ಪಾಪಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಭಸ್ಮವಾಗುತ್ತವೆ."
    ],
    en: [
      "To dissolve past-life ancestral debts (Runanubandha), performing Moksha Narayana Bali and Tripindi Shraddha at Gokarna is paramount.",
      "Naga Pratishthe and Rudrabhisheka dissolve ancient curses and unfulfilled oaths made in prior incarnations.",
      "Go-Dana (sacred cow charity) and feeding pilgrims at Gokarna Mahabaleshwara purifies deep-rooted karmic debts."
    ]
  }
};

// =========================================================================
// SECTION 11: PROFILE IMPROVEMENTS & BOSS STRATEGIC ADVISORY
// =========================================================================
export function generateProfileImprovements(profile: any, targetLang: SupportedLanguage = "kn") {
  const isKn = targetLang === "kn";
  const name = profile?.name || (isKn ? "ಜಾತಕರು" : "Devotee");

  const improvementsKn = [
    `🎯 **೧. ಶಾಸ್ತ್ರೋಕ್ತ ಮುಹೂರ್ತ ಮತ್ತು ಸಮಯದ ಅನುಕೂಲತೆ:** ${name} ಅವರಿಗೆ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ದಶಾ ಅವಧಿಯಲ್ಲಿ ಯಾವುದೇ ಹೊಸ ವ್ಯಾಪಾರ, ಹೂಡಿಕೆ ಅಥವಾ ವಿವಾಹ ಮಾತುಕತೆಗಳನ್ನು ಗುರುವಾರ ಅಥವಾ ಭಾನುವಾರ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಮಾತ್ರ ಪ್ರಾರಂಭಿಸಲು ಸೂಚಿಸಿ.`,
    `📿 **೨. ರತ್ನ ಧಾರಣೆ & ಜಪದ ಶಕ್ತಿ:** ಮುಖ್ಯ ದುರ್ಬಲ ಗ್ರಹದ ಬೀಜ ಮಂತ್ರವನ್ನು ನಿತ್ಯ ೧೦೮ ಬಾರಿ ಜಪಿಸಲು ತಿಳಿಸಿ. ನಿಗದಿತ ಶುದ್ಧ ರತ್ನವನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಪ್ರಾಣಪ್ರತಿಷ್ಠಾಪನೆ ಮಾಡಿ ಧರಿಸುವುದರಿಂದ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಶಮನವಾಗುತ್ತದೆ.`,
    `📞 **೩. ದೈವಜ್ಞರ ಫೋನ್ ಕರೆಯಲ್ಲಿ ಸಮಾಧಾನದ ಕೌನ್ಸೆಲಿಂಗ್:** ಗ್ರಾಹಕರಿಗೆ ಕರೆ ಮಾಡಿದಾಗ, ಅವರ ಸಮಸ್ಯೆಯನ್ನು ಮೊದಲೇ ಗುರುತಿಸಿ ("ನಿಮಗೆ ಇತ್ತೀಚೆಗೆ ಮಾನಸಿಕ ಒತ್ತಡ ಅಥವಾ ವೃತ್ತಿಯಲ್ಲಿ ಅನಿಶ್ಚಿತತೆ ಕಾಡುತ್ತಿದೆ ಅಲ್ಲವೇ?") ಎಂದು ಹೇಳಿ ಅವರ ನಂಬಿಕೆಯನ್ನು ಗಳಿಸಿ. ನಂತರ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರದ ಕಾಲಾವಧಿ ನೀಡಿ.`,
    `🛕 **೪. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವಾ ಸಮರ್ಪಣೆ:** ಜಾತಕದಲ್ಲಿರುವ ದೋಷ ನಿವಾರಣೆಗಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಅರ್ಚಕರಿಂದ ಸಂಕಲ್ಪ ಮಾಡಿಸಿ, ೫-ಪುಟಗಳ ಅಧಿಕೃತ ಆಶೀರ್ವಾದ ಪತ್ರ ಸಹಿತ ಸೇವಾ ಪ್ರಸಾದವನ್ನು ಅವರ ಮನೆಗೆ ತಲುಪಿಸುವ ವ್ಯವಸ್ಥೆ ಮಾಡಿ.`,
    `📲 **೫. ಅಪ್ಲಿಕೇಶನ್ ಸ್ವಯಂ-ಕ್ಯಾಲೆಂಡರ್ & QR ಕೋಡ್ ಜೋಡಣೆ:** ಜಾತಕರ ವಾರ್ಷಿಕ ಪೂಜಾ ದಿನಾಂಕಗಳನ್ನು Google Calendar ಗೆ ಸಿಂಕ್ ಮಾಡಲು QR ಕೋಡ್ ಒದಗಿಸಿ, ನಿರಂತರ ಡಿಜಿಟಲ್ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.`
  ];

  const improvementsEn = [
    `🎯 **1. Astrological Timing & Auspicious Muhurtha:** Advise ${name} to initiate high-stakes business investments or marriage discussions only during auspicious Muhurthas on Thursdays or Sundays aligned with their beneficial Nakshatra.`,
    `📿 **2. Gemstone Consecration & Mantra Protocol:** Recommend chanting their primary remedial Beeja Mantra 108 times daily. Consecrating the prescribed gemstone during Shukla Paksha will accelerate protective results.`,
    `📞 **3. Priest Phone Consultation Delivery:** When placing the call, lead with reassuring validation ("You have felt sudden career pressures and fatigue recently, correct?"). This establishes instant astrological credibility before prescribing relief timelines.`,
    `🛕 **4. Sri Kshetra Gokarna Remedial Sankalpa:** Perform the dedicated family Sankalpa at Gokarna Mahabaleshwara temple, delivering the 5-page sanctified Ashirvada Patra and Prasada directly to their doorstep.`,
    `📲 **5. Digital Calendar Sync & QR Code Integration:** Provide a scannable QR code to auto-sync their annual puja reminders into Google Calendar, ensuring continuous client engagement.`
  ];

  return {
    title: isKn ? `🌟 ${name} ಅವರ ಜಾತಕ ಹಾಗೂ ಪ್ರೊಫೈಲ್ ಸುಧಾರಣಾ ಕಾರ್ಯತಂತ್ರ (Boss Strategic Advisory)` : `🌟 Strategic Profile Improvements for ${name} (Boss Advisory)`,
    points: isKn ? improvementsKn : improvementsEn
  };
}
