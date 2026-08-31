/**
 * Kundli Personal Remedy & 11-Time Japa Engine (ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ವೈಯಕ್ತಿಕ ದೋಷ ಪರಿಹಾರ & ೧೧ ಬಾರಿ ಮಂತ್ರ ಜಪ)
 * 
 * Analyzes the devotee's Janma Kundali (debilitated/combust planets, Rahu-Ketu dosha, 
 * Saturn sade-sati/kantaka, Moon affliction/Kemadruma, 6/8/12 Dusthana lords)
 * to prescribe a hyper-targeted Vedic Shloka specifically to soothe mental anxiety,
 * domestic stress, and planetary friction.
 * 
 * Devotee chants this Shloka 11 times with an interactive bead counter.
 * Upon completion, delivers the heartfelt "Hurray 🎉 - Today go with a fresh mind, all things good" blessing.
 */

import { PlanetName, type KundliOutput, type PlanetPosition } from "../../core/AstroTypes";
import type { SevaLang } from "../seva/sevaLocale";

export interface PersonalRemedyJapaInfo {
  grahaKey: PlanetName | "sarvadosha";
  deityName: Record<SevaLang, string>;
  afflictionTitle: Record<SevaLang, string>;
  afflictionReason: Record<SevaLang, string>;
  sanskritShloka: string;
  transliteration: string;
  meaning: Record<SevaLang, string>;
  calmingBenefit: Record<SevaLang, string>;
  recommendedJapaCount: 11;
  celebrationHurrayText: Record<SevaLang, string>;
  freshMindBlessingText: Record<SevaLang, string>;
  audioNarrationText: Record<SevaLang, string>;
}

export interface DetermineRemedyParams {
  birthKundli?: KundliOutput | null;
  devoteeName?: string;
  rashiName?: string;
  nakshatraName?: string;
  lang?: SevaLang;
}

// Authentic Vedic Shlokas for each Graha & Devata specifically tailored for calming & stress-relief
const REMEDY_DATABASE: Record<PlanetName | "sarvadosha", Omit<PersonalRemedyJapaInfo, "grahaKey">> = {
  // 1. SHANI (Saturn) - Lord Shiva / Shani Shanti Shloka
  [PlanetName.Saturn]: {
    deityName: {
      kn: "ಶ್ರೀ ಶನೈಶ್ಚರ & ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ (ಶಿವ)",
      hi: "श्री शनैश्चर एवं श्री महाबलेश्वर (शिव)",
      te: "శ్రీ శనైశ్చర & శ్రీ మహాబలేశ్వర (శివ)",
      ta: "ஸ்ரீ சனீஸ்வரர் & ஸ்ரீ மகாபலேஸ்வரர் (சிவன்)",
      en: "Lord Shani & Lord Mahabaleshwara (Shiva)"
    },
    afflictionTitle: {
      kn: "ಶನಿ ದೋಷ / ಸಾಡೇಸಾತಿ ಮಾನಸಿಕ ಶಾಂತಿ ಪರಿಹಾರ ಜಪ",
      hi: "शनि दोष / साढ़ेसाती मानसिक शांति निवारण जप",
      te: "శని దోష / సాడేసాతి మానసిక శాంతి నివారణ జపం",
      ta: "சனி தோஷ / ஏழரை சனி மன அமைதி நிவர்த்தி ஜபம்",
      en: "Lord Saturn / Sade Sati Inner Peace & Obstacle Removal Japa"
    },
    afflictionReason: {
      kn: "ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಶನಿಯ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುವ ಮಾನಸಿಕ ಆತಂಕ, ಕಾರ್ಯ ವಿಳಂಬ ಮತ್ತು ಕೌಟುಂಬಿಕ ಒತ್ತಡವನ್ನು ಹೋಗಲಾಡಿಸಲು ಈ ದಿವ್ಯ ಜಪ.",
      hi: "जन्म कुंडली में शनि के प्रभाव से उत्पन्न तनाव, विलंब एवं पारिवारिक चिंता को दूर करने हेतु यह पावन जप।",
      te: "జన్మ కుండలిలో శని ప్రభావంతో కలిగే మానసిక ఒత్తిడి, ఆలస్యాలు తొలగించడానికి ఈ దివ్య జపం.",
      ta: "ஜாதகத்தில் சனியின் தாக்கத்தால் ஏற்படும் மன அழுத்தம் மற்றும் தடைகளை நீக்க இந்த புனித ஜபம்.",
      en: "Heals Saturn's delaying influence, dissolving domestic friction, anxiety, and bringing unwavering mental peace."
    },
    sanskritShloka: `ನೀಲಾಂಜನ ಸಮಾಭಾಸಂ ರವಿಪುತ್ರಂ ಯಮಾಗ್ರಜಮ್ ।
ಛಾಯಾಮಾರ್ತಾಂಡ ಸಂಭೂತಂ ತಂ ನಮಾಮಿ ಶನೈಶ್ಚರಮ್ ॥
ಓಂ ನಮಃ ಶಿವಾಯ ॥`,
    transliteration: "Nīlāñjana samābhāsaṁ raviputraṁ yamāgrajam | Chāyāmārtāṇḍa sambhūtaṁ taṁ namāmi shanaiścharam || Om Namaḥ Śivāya ||",
    meaning: {
      kn: "ಕಡುನೀಲಿ ಕಾಂತಿಯುಳ್ಳವನು, ಸೂರ್ಯನ ಪುತ್ರನು, ಯಮನ ಹಿರಿಯಣ್ಣನು ಹಾಗೂ ಛಾಯಾದೇವಿಯ ಗರ್ಭಸಂಜಾತನಾದ ಶ್ರೀ ಶನೈಶ್ಚರ ದೇವರಿಗೆ ಮತ್ತು ಪರಮೇಶ್ವರನಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      hi: "नीले अंजन के समान कांति वाले, सूर्यपुत्र, यमराज के भ्राता एवं छाया के पुत्र भगवान शनैश्चर तथा शिव को नमन।",
      te: "నీలాంజన కాంతి కలవాడు, సూర్యపుత్రుడు, యముని సోదరుడైన శనీశ్వరునికి మరియు శివునికి నమస్కారం.",
      ta: "நீல வண்ண மேனி கொண்டவரும், சூரிய புத்திரரும், எமனின் சகோதரருமான சனீஸ்வரருக்கும் சிவனுக்கும் நமஸ்காரம்.",
      en: "Salutations to Lord Saturn, radiant like blue collyrium, son of Surya and Chhaya, and the supreme protector Lord Shiva."
    },
    calmingBenefit: {
      kn: "ಮನಸ್ಸಿನಲ್ಲಿರುವ ಭಯ, ಅನಿಶ್ಚಿತತೆ ಮತ್ತು ಮನೆಯ ಎಲ್ಲಾ ಸಮಸ್ಯೆಗಳನ್ನು ಹೋಗಲಾಡಿಸಿ ಆಳವಾದ ನೆಮ್ಮದಿ ನೀಡುತ್ತದೆ.",
      hi: "मन के समस्त भय, अनिश्चितता और पारिवारिक तनाव को मिटाकर गहन शांति प्रदान करता है।",
      te: "మనస్సులోని భయాలు, అనిశ్చితిని తొలగించి అపారమైన ప్రశాంతతను చేకూరుస్తుంది.",
      ta: "மன பயம் மற்றும் குடும்ப கவலைகளை நீக்கி ஆழ்ந்த அமைதியைத் தரும்.",
      en: "Dissolves fear, fatigue, and household worries, infusing the mind with deep stability and calm."
    },
    recommendedJapaCount: 11,
    celebrationHurrayText: {
      kn: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! ೧೧ ಬಾರಿ ಪವಿತ್ರ ಜಪ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು!",
      hi: "🎉 शुभ जयसिद्धि! ११ बार पावन जप सफलतापूर्वक संपन्न हुआ!",
      te: "🎉 శుభ జయసిద్ధి! 11 సార్లు పవిత్ర జపం విజయవంతంగా పూర్తయింది!",
      ta: "🎉 சுப ஜெயசித்தி! 11 முறை புனித ஜபம் இனிதே நிறைவடைந்தது!",
      en: "🎉 Hurray! 11 Sacred Chants Completed with Divine Grace!"
    },
    freshMindBlessingText: {
      kn: "ಇಂದಿನ ದಿನವನ್ನು ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಮನೆಯ ಸಕಲ ಚಿಂತೆಗಳೂ ದೂರವಾಗಿ, ಶುಭ ಫಲಗಳು ನಿಮ್ಮದಾಗಲಿ!",
      hi: "आज का दिन शांत एवं प्रसन्न मन से प्रारंभ करें। घर-परिवार की समस्त चिंताएं दूर हों और सब कुछ शुभ हो!",
      te: "ఈ రోజును ప్రశాంతమైన మరియు ఉల్లాసమైన మనస్సుతో ప్రారంభించండి. సర్వ శుభాలు మీకు కలుగుతాయి!",
      ta: "இன்றைய நாளை அமைதியான மற்றும் புத்துணர்ச்சியூட்டும் மனதுடன் தொடங்குங்கள். அனைத்தும் சுபமாக அமையும்!",
      en: "Today go with a fresh, peaceful mind. All domestic tensions are dissolved, and auspicious blessings are with you!"
    },
    audioNarrationText: {
      kn: "ಹರಿ ಓಂ. ನಿಮ್ಮ ಕುಂಡಲಿಯ ಶನಿ ಶಾಂತಿಗಾಗಿ ೧೧ ಬಾರಿ ಜಪವನ್ನು ಪ್ರಾರಂಭಿಸಿ: ನೀಲಾಂಜನ ಸಮಾಭಾಸಂ ರವಿಪುತ್ರಂ ಯಮಾಗ್ರಜಮ್...",
      hi: "हरि ॐ। आपकी कुंडली के शनि दोष निवारण हेतु ११ बार पावन जप प्रारंभ करें...",
      te: "హరి ఓం. మీ కుండలి శని శాంతి కొరకు 11 సార్లు జపం ప్రారంభించండి...",
      ta: "ஹரி ஓம். உங்கள் ஜாதக சனி சாந்திக்காக 11 முறை ஜபம் தொடங்குங்கள்...",
      en: "Hari Om. For Saturn pacification and mental calm, begin the 11 sacred chants..."
    }
  },

  // 2. RAHU / KETU - Goddess Durga & Lord Subramanya Shanti Shloka
  [PlanetName.Rahu]: {
    deityName: {
      kn: "ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ & ಶ್ರೀ ಮಹಾಗಣಪತಿ",
      hi: "श्री दुर्गा परमेश्वरी एवं श्री महागणपति",
      te: "శ్రీ దుర్గా పరమేశ్వరి & శ్రీ మహాగణపతి",
      ta: "ஸ்ரீ துர்கா பரமேஸ்வரி & ஸ்ரீ மஹாகணபதி",
      en: "Goddess Durga Parameshwari & Lord Ganesha"
    },
    afflictionTitle: {
      kn: "ರಾಹು-ಕೇತು ಸರ್ಪದೋಷ / ಆತಂಕ ನಿವಾರಣಾ ಶಾಂತಿ ಜಪ",
      hi: "राहु-केतु सर्पदोष / मानसिक चिंता निवारण जप",
      te: "రాహు-కేతు సర్పదోష / ఆందోళన నివారణ శాంతి జపం",
      ta: "ராகு-கேது சர்ப்ப தோஷ / மன அமைதி சாந்தி ஜபம்",
      en: "Rahu-Ketu / Sarpa Dosha Anxiety Healing Japa"
    },
    afflictionReason: {
      kn: "ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುವ ಭ್ರಮೆ, ಮಾನಸಿಕ ಗೊಂದಲ ಮತ್ತು ಅತಿಯಾದ ಆಲೋಚನೆಗಳನ್ನು ತಣಿಸಲು ಈ ಶಾಂತಿ ಜಪ.",
      hi: "राहु के प्रभाव से उत्पन्न अनिद्रा, मानसिक भ्रम और अति-विचार को शांत करने हेतु यह पावन मंत्र।",
      te: "రాహు ప్రభావంతో కలిగే మానసిక గందరగోళం, అధిక ఆలోచనలను నివారించడానికి ఈ శాంతి జపం.",
      ta: "ராகுவினால் ஏற்படும் மன குழப்பம் மற்றும் அதிக சிந்தனைகளை தணிக்க இந்த சாந்தி ஜபம்.",
      en: "Calms overthinking, illusion, sleep restlessness, and hidden anxieties caused by Rahu/Ketu placement."
    },
    sanskritShloka: `ಸರ್ವಮಂಗಳ ಮಾಂಗಲ್ಯೇ ಶಿವೇ ಸರ್ವಾರ್ಥ ಸಾಧಿಕೇ ।
ಶರಣ್ಯೇ ತ್ರ್ಯಂಬಕೇ ಗೌರಿ ನಾರಾಯಣಿ ನಮೋಸ್ತು ತೇ ॥
ಓಂ ರಾಹವೇ ನಮಃ ॥`,
    transliteration: "Sarvamaṅgala māṅgalye śive sarvārtha sādhike | Śaraṇye tryambake gauri nārāyaṇi namo'stu te || Om Rāhave Namaḥ ||",
    meaning: {
      kn: "ಸಕಲ ಮಂಗಳವನ್ನುಂಟುಮಾಡುವ, ಸರ್ವಾರ್ಥಗಳನ್ನು ಸಾಧಿಸುವ, ತ್ರಿನೇತ್ರಧಾರಿಯಾದ ಶ್ರೀ ದುರ್ಗಾದೇವಿಗೆ ಭಕ್ತಿಯ ನಮನಗಳು.",
      hi: "सब मंगलों में मंगल रूप, सर्व मनोरथ सिद्ध करने वाली, त्रिनेत्रधारिणी हे नारायणी! आपको नमस्कार है।",
      te: "సర్వ మంగళాలను ప్రసాదించే, సర్వ కార్యాలను సిద్ధింపజేసే శ్రీ దుర్గాదేవికి ప్రణామాలు.",
      ta: "அனைத்து மங்களங்களையும் அருளும், சகல காரியங்களையும் நிறைவேற்றும் ஸ்ரீ துர்கா தேவிக்கு நமஸ்காரம்.",
      en: "Salutations to Divine Mother Durga, the fulfiller of all auspicious desires, refuge of the three worlds."
    },
    calmingBenefit: {
      kn: "ಅತಿಯಾದ ಯೋಚನೆ, ಭಯ ಮತ್ತು ಆತಂಕವನ್ನು ನಿವಾರಿಸಿ ಮನಸ್ಸಿಗೆ ಅದ್ಭುತ ಧೈರ್ಯ ಮತ್ತು ಶಾಂತಿ ನೀಡುತ್ತದೆ.",
      hi: "अति-विचार और भय को दूर कर मन को अपार साहस एवं शांति प्रदान करता है।",
      te: "అధిక ఆలోచనలు, భయాలను తొలగించి మనస్సుకు అపారమైన ధైర్యాన్ని చేకూరుస్తుంది.",
      ta: "அதிக சிந்தனை மற்றும் பயத்தை போக்கி மனதிற்கு அமைதியையும் தைரியத்தையும் தருகிறது.",
      en: "Silences racing thoughts, eliminates phantom fears, and bestows supreme clarity of mind."
    },
    recommendedJapaCount: 11,
    celebrationHurrayText: {
      kn: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! ೧೧ ಬಾರಿ ದುರ್ಗಾ ಮಂತ್ರ ಜಪ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು!",
      hi: "🎉 शुभ जयसिद्धि! ११ बार दुर्गा मंत्र जप संपन्न हुआ!",
      te: "🎉 శుభ జయసిద్ధి! 11 సార్లు దుర్గా మంత్ర జపం పూర్తయింది!",
      ta: "🎉 சுப ஜெயசித்தி! 11 முறை துர்கா மந்திர ஜபம் நிறைவடைந்தது!",
      en: "🎉 Hurray! 11 Divine Chants Completed! Protection Shield Active!"
    },
    freshMindBlessingText: {
      kn: "ಇಂದಿನ ದಿನವನ್ನು ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಮನೆಯ ಸಕಲ ಚಿಂತೆಗಳೂ ದೂರವಾಗಿ, ಶುಭ ಫಲಗಳು ನಿಮ್ಮದಾಗಲಿ!",
      hi: "आज का दिन शांत एवं तनावमुक्त मन से शुरू करें। सब कुछ शुभ और मंगलमय होगा!",
      te: "ఈ రోజును ప్రశాంతమైన మరియు ఆనందకరమైన మనస్సుతో ప్రారంభించండి. సర్వదా శుభం జరుగుతుంది!",
      ta: "இன்றைய நாளை அமைதியான மனதுடன் தொடங்குங்கள். அனைத்தும் சுபமாக அமையும்!",
      en: "Today go with a fresh, tranquil mind. Divine Mother Durga shields your home with peace and positivity!"
    },
    audioNarrationText: {
      kn: "ಹರಿ ಓಂ. ರಾಹು ಶಾಂತಿ ಹಾಗೂ ಮಾನಸಿಕ ಧೈರ್ಯಕ್ಕಾಗಿ ೧೧ ಬಾರಿ ಈ ಪವಿತ್ರ ಮಂತ್ರ ಜಪಿಸಿ: ಸರ್ವಮಂಗಳ ಮಾಂಗಲ್ಯೇ ಶಿವೇ ಸರ್ವಾರ್ಥ ಸಾಧಿಕೇ...",
      hi: "हरि ॐ। राहु शांति एवं मानसिक शक्ति हेतु ११ बार इस पावन मंत्र का जप करें...",
      te: "హరి ఓం. రాహు శాంతి కొరకు 11 సార్లు ఈ పవిత్ర మంత్రాన్ని జపించండి...",
      ta: "ஹரி ஓம். ராகு சாந்திக்காக 11 முறை இந்த புனித மந்திரத்தை ஜபியுங்கள்...",
      en: "Hari Om. For inner fearlessness and peace, chant this sacred mantra 11 times..."
    }
  },

  // 3. KETU - Lord Ganesha & Spiritual Clarity Shloka
  [PlanetName.Ketu]: {
    deityName: {
      kn: "ಶ್ರೀ ಮಹಾಗಣಪತಿ & ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ",
      hi: "श्री महागणपति एवं श्री सुब्रह्मण्य",
      te: "శ్రీ మహాగణపతి & శ్రీ సుబ్రహ్మణ్య",
      ta: "ஸ்ரீ மஹாகணபதி & ஸ்ரீ சுப்ரமணியர்",
      en: "Lord Maha Ganapati & Lord Subramanya"
    },
    afflictionTitle: {
      kn: "ಕೇತು ಶಾಂತಿ / ಮಾನಸಿಕ ನೆಮ್ಮದಿ & ಜ್ಞಾನ ವೃದ್ಧಿ ಜಪ",
      hi: "केतु शांति / मानसिक एकाग्रता एवं ज्ञान शांति जप",
      te: "కేతు శాంతి / మానసిక ప్రశాంతత & జ్ఞాన వృద్ధి జపం",
      ta: "கேது சாந்தி / மன அமைதி & ஞான விருத்தி ஜபம்",
      en: "Lord Ketu Peace, Focus & Spiritual Harmony Japa"
    },
    afflictionReason: {
      kn: "ಕೇತುವಿನ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುವ ಅಶಾಂತಿ, ಒಂಟಿತನದ ಭಾವನೆ ಮತ್ತು ಮನಸ್ಸಿನ ತೊಳಲಾಟವನ್ನು ನಿವಾರಿಸಲು ಈ ದಿವ್ಯ ಜಪ.",
      hi: "केतु के प्रभाव से मन में आने वाली उदासी, एकाकीपन और अशांति को मिटाने हेतु यह पावन जप।",
      te: "కేతు ప్రభావంతో కలిగే అశాంతి, ఒంటరితనాన్ని దూరం చేయడానికి ఈ దివ్య జపం.",
      ta: "கேதுவின் தாக்கத்தால் ஏற்படும் தனிமை உணர்வு மற்றும் மன சஞ்சலத்தை போக்க இந்த ஜபம்.",
      en: "Relieves feelings of detachment, anxiety, and restores mental focus and divine contentment."
    },
    sanskritShloka: `ಗಣಾನಾಂ ತ್ವಾ ಗಣಪತಿಂ ಹವಾಮಹೇ ಕವಿಂ ಕವೀನಾಮುಪಮಶ್ರವಸ್ತಮಮ್ ।
ಜ್ಯೇಷ್ಠರಾಜಂ ಬ್ರಹ್ಮಣಾಂ ಬ್ರಹ್ಮಣಸ್ಪತ ಆ ನಃ ಶೃಣ್ವನ್ನೋತಿಭಿಃ ಸೀದ ಸಾದನಮ್ ॥
ಓಂ ಕೇತವೇ ನಮಃ ॥`,
    transliteration: "Gaṇānāṁ tvā gaṇapatiṁ havāmahe kaviṁ kavīnāmupamaśravastamam | Jyeṣṭharājaṁ brahmaṇāṁ brahmaṇaspata ā naḥ śṛṇvannūtibhiḥ sīda sādanam || Om Ketave Namaḥ ||",
    meaning: {
      kn: "ಗಣಗಳ ಒಡೆಯನಾದ, ಮಹಾ ವಿದ್ವಾಂಸನಾದ, ಜೇಷ್ಠರಾಜನಾದ ಶ್ರೀ ಮಹಾಗಣಪತಿಯನ್ನು ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ. ನಮ್ಮ ಆಹ್ವಾನವನ್ನು ಸ್ವೀಕರಿಸಿ ನಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ನೆಲೆಸು.",
      hi: "गणों के स्वामी, कवियों के कवि, देवों के ज्येष्ठ पूज्य गणपति हम आपका आह्वान करते हैं, हमारे हृदय में विराजें।",
      te: "గణాల అధిపతి, పరమ జ్ఞాని అయిన గణపతిని ప్రార్థిస్తున్నాము. మా హృదయాలలో ప్రశాంతతను నింపండి.",
      ta: "கணங்களின் தலைவரும், மகா ஞானியுமான விநாயகப் பெருமானை பணிகிறோம். எங்கள் மனதில் அமைதியை அருளுங்கள்.",
      en: "We invoke Lord Ganapati, the supreme guide of wisdom and remover of all obstacles, to dwell in our hearts."
    },
    calmingBenefit: {
      kn: "ಮನಸ್ಸಿನ ಅಲೆದಾಟವನ್ನು ನಿಲ್ಲಿಸಿ ಆಳವಾದ ಏಕಾಗ್ರತೆ ಹಾಗೂ ಆಂತರಿಕ ನೆಮ್ಮದಿಯನ್ನು ತರುತ್ತದೆ.",
      hi: "मन के भटकाव को रोककर गहरी एकाग्रता एवं आंतरिक शांति लाता है।",
      te: "మనస్సులోని చంచలత్వాన్ని తొలగించి ఏకాగ్రత మరియు శాంతిని అందిస్తుంది.",
      ta: "மன சஞ்சலத்தை நீக்கி ஆழ்ந்த மன அமைதியையும் கவனத்தையும் தரும்.",
      en: "Anchors wandering thoughts, clears brain fog, and brings grounded spiritual serenity."
    },
    recommendedJapaCount: 11,
    celebrationHurrayText: {
      kn: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! ೧೧ ಬಾರಿ ಗಣಪತಿ ಮಂತ್ರ ಜಪ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು!",
      hi: "🎉 शुभ जयसिद्धि! ११ बार गणपति मंत्र जप पूर्ण हुआ!",
      te: "🎉 శుభ జయసిద్ధి! 11 సార్లు గణపతి జపం పూర్తయింది!",
      ta: "🎉 சுப ஜெயசித்தி! 11 முறை கணபதி ஜபம் பூர்த்தியானது!",
      en: "🎉 Hurray! 11 Sacred Chants Completed! Obstacles Dissolved!"
    },
    freshMindBlessingText: {
      kn: "ಇಂದಿನ ದಿನವನ್ನು ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಮನೆಯ ಸಕಲ ಚಿಂತೆಗಳೂ ದೂರವಾಗಿ, ಶುಭ ಫಲಗಳು ನಿಮ್ಮದಾಗಲಿ!",
      hi: "आज का दिन एकदम तरोताजा और शांत मन से शुरू करें। समस्त विघ्न दूर होंगे!",
      te: "ఈ రోజును సరికొత్త ఉత్సాహంతో మరియు ప్రశాంత మనస్సుతో ప్రారంభించండి. సర్వ శుభాలు కలుగుతాయి!",
      ta: "இன்றைய நாளை புத்துணர்ச்சியுடனும் அமைதியுடனும் தொடங்குங்கள். அனைத்தும் நன்மையாகவே முடியும்!",
      en: "Today go with a fresh, clear mind. All tensions are cleared, and every path opens smoothly!"
    },
    audioNarrationText: {
      kn: "ಹರಿ ಓಂ. ಮನಸ್ಸಿನ ಶಾಂತಿ ಹಾಗೂ ಕೇತು ಪರಿಹಾರಕ್ಕಾಗಿ ೧೧ ಬಾರಿ ಈ ಮಂತ್ರ ಜಪಿಸಿ: ಗಣಾನಾಂ ತ್ವಾ ಗಣಪತಿಂ ಹವಾಮಹೇ...",
      hi: "हरि ॐ। मन की शांति हेतु ११ बार इस पावन गणपति मंत्र का जप करें...",
      te: "హరి ఓం. మనశ్శాంతి కొరకు 11 సార్లు ఈ గణపతి మంత్రాన్ని జపించండి...",
      ta: "ஹரி ஓம். மன அமைதிக்காக 11 முறை இந்த கணபதி மந்திரத்தை ஜபியுங்கள்...",
      en: "Hari Om. For inner peace and focus, chant this Ganapati mantra 11 times..."
    }
  },

  // 4. MANGALA (Mars) - Lord Kartikeya / Subramanya & Hanuman Shanti Shloka
  [PlanetName.Mars]: {
    deityName: {
      kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ & ಶ್ರೀ ಹನುಮಂತ",
      hi: "श्री सुब्रह्मण्य स्वामी एवं श्री हनुमान",
      te: "శ్రీ సుబ్రహ్మణ్య స్వామి & శ్రీ హనుమాన్",
      ta: "ஸ்ரீ முருகப் பெருமான் & ஸ்ரீ அனுமன்",
      en: "Lord Subramanya & Lord Hanuman"
    },
    afflictionTitle: {
      kn: "ಕುಜ ದೋಷ / ಸಿಟ್ಟು & ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಪರಿಹಾರ ಜಪ",
      hi: "मंगल दोष / क्रोध शमन एवं पारिवारिक शांति जप",
      te: "కుజ దోష / కోప నివారణ & కుటుంబ శాంతి జపం",
      ta: "செவ்வாய் தோஷ / கோப தணிப்பு & குடும்ப அமைதி ஜபம்",
      en: "Mars / Kuja Dosha Anger Soothing & Harmony Japa"
    },
    afflictionReason: {
      kn: "ಕುಂಡಲಿಯಲ್ಲಿ ಮಂಗಳನ ತೀಕ್ಷ್ಣತೆಯಿಂದ ಉಂಟಾಗುವ ಸಿಟ್ಟು, ಆವೇಶ, ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಮನೆಯಲ್ಲಿನ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಶಮನಗೊಳಿಸಲು ಈ ಜಪ.",
      hi: "कुंडली में मंगल के प्रभाव से होने वाले क्रोध, आवेश और पारिवारिक वाद-विवाद को शांत करने हेतु यह पावन जप।",
      te: "కుజ ప్రభావంతో వచ్చే కోపం, ఆవేశం మరియు కుటుంబ కలహాలు తగ్గించడానికి ఈ శాంతి జపం.",
      ta: "செவ்வாயின் தாக்கத்தால் ஏற்படும் கோபம், பதற்றம் மற்றும் குடும்ப சச்சரவுகளை தணிக்க இந்த ஜபம்.",
      en: "Pacifies anger, irritability, impatience, and domestic disputes caused by afflicted Mars / Kuja."
    },
    sanskritShloka: `ಧರಣೀಗರ್ಭ ಸಂಭೂತಂ ವಿದ್ಯುತ್ಕಾಂತಿ ಸಮಪ್ರಭಮ್ ।
ಕುಮಾರಂ ಶಕ್ತಿಹಸ್ತಂ ಚ ಮಂಗಲಂ ಪ್ರಣಮಾಮ್ಯಹಮ್ ॥
ಓಂ ಹಂ ಹನುಮತೇ ನಮಃ ॥`,
    transliteration: "Dharaṇīgarbha sambhūtaṁ vidyutkānti samaprabham | Kumāraṁ śaktihastaṁ cha maṅgalaṁ praṇamāmyaham || Om Haṁ Hanumate Namaḥ ||",
    meaning: {
      kn: "ಭೂದೇವಿಯ ಪುತ್ರನು, ಮಿಂಚಿನಂತೆ ಹೊಳೆಯುವ ತೇಜಸ್ಸಿನವನು, ಕೈಯಲ್ಲಿ ಶಕ್ತಿ ಆಯುಧವನ್ನು ಧರಿಸಿದ ಶ್ರೀ ಮಂಗಳ ದೇವರಿಗೆ ಹಾಗೂ ಶ್ರೀ ಹನುಮಂತನಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      hi: "पृथ्वी के गर्भ से उत्पन्न, विद्युत की कांति के समान तेजस्वी, शक्ति अस्त्र धारण करने वाले मंगल देव एवं हनुमान जी को नमन।",
      te: "భూదేవి పుత్రుడు, మెరుపు లాంటి తేజస్సు కలవాడైన కుజ గ్రహానికి మరియు హనుమంతునికి నమస్కారాలు.",
      ta: "பூமி தாயின் மைந்தரும், மின்னல் போன்ற பிரகாசம் கொண்டவருமான அங்காரகனுக்கும் அனுமனுக்கும் நமஸ்காரம்.",
      en: "Salutations to Mars, born of Earth, radiant as lightning, and to Lord Hanuman for cooling anger into divine strength."
    },
    calmingBenefit: {
      kn: "ಮನಸ್ಸಿನ ಸಿಟ್ಟು ಮತ್ತು ಆವೇಶವನ್ನು ಕರಗಿಸಿ, ಮನೆಯಲ್ಲಿ ಸಾಮರಸ್ಯ ಹಾಗೂ ಸದಾ ನಗುಮುಖವನ್ನು ತರುತ್ತದೆ.",
      hi: "क्रोध और अधीरता को शांत कर परिवार में प्रेम, सौहार्द और शांति की स्थापना करता है।",
      te: "కోపాన్ని తగ్గించి కుటుంబంలో సంతోషం, అనురాగం మరియు ప్రశాంతతను పెంచుతుంది.",
      ta: "கோபத்தை தணித்து குடும்பத்தில் ஒற்றுமையையும் மகிழ்ச்சியையும் நிலைநிறுத்துகிறது.",
      en: "Cools mental heat, soothes high temper, and fosters deep patience and harmony at home."
    },
    recommendedJapaCount: 11,
    celebrationHurrayText: {
      kn: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! ೧೧ ಬಾರಿ ಮಂಗಳ ಶಾಂತಿ ಜಪ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು!",
      hi: "🎉 शुभ जयसिद्धि! ११ बार मंगल शांति जप संपन्न हुआ!",
      te: "🎉 శుభ జయసిద్ధి! 11 సార్లు కుజ శాంతి జపం పూర్తయింది!",
      ta: "🎉 சுப ஜெயசித்தி! 11 முறை அங்காரக சாந்தி ஜபம் நிறைவடைந்தது!",
      en: "🎉 Hurray! 11 Soothing Chants Completed! Anger Cools into Peace!"
    },
    freshMindBlessingText: {
      kn: "ಇಂದಿನ ದಿನವನ್ನು ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಮನೆಯ ಸಕಲ ಚಿಂತೆಗಳೂ ದೂರವಾಗಿ, ಶುಭ ಫಲಗಳು ನಿಮ್ಮದಾಗಲಿ!",
      hi: "आज का दिन एकदम शांत और निर्मल मन से शुरू करें। घर में सुख और शांति बनी रहे!",
      te: "ఈ రోజును ప్రశాంతమైన మరియు ప్రేమపూర్వక మనస్సుతో ప్రారంభించండి. సర్వదా శుభం!",
      ta: "இன்றைய நாளை அமைதியான மற்றும் ஆனந்தமான மனதுடன் தொடங்குங்கள். குடும்பத்தில் நலம் பெருகும்!",
      en: "Today go with a fresh, patient mind. All domestic friction is healed, and blessings surround you!"
    },
    audioNarrationText: {
      kn: "ಹರಿ ಓಂ. ಸಿಟ್ಟು ಶಮನ ಹಾಗೂ ಮನೆಯ ಶಾಂತಿಗಾಗಿ ೧೧ ಬಾರಿ ಈ ಪವಿತ್ರ ಮಂತ್ರ ಜಪಿಸಿ: ಧರಣೀಗರ್ಭ ಸಂಭೂತಂ...",
      hi: "हरि ॐ। क्रोध शमन एवं शांति हेतु ११ बार इस मंत्र का जप करें...",
      te: "హరి ఓం. కోప నివారణ & శాంతి కొరకు 11 సార్లు ఈ మంత్రాన్ని జపించండి...",
      ta: "ஹரி ஓம். கோப தணிப்பு மற்றும் அமைதிக்காக 11 முறை இந்த மந்திரத்தை ஜபியுங்கள்...",
      en: "Hari Om. For calming anger and bringing domestic peace, chant this 11 times..."
    }
  },

  // 5. CHANDRA (Moon) - Lord Shiva Someshwara & Manas Shanti Shloka
  [PlanetName.Moon]: {
    deityName: {
      kn: "ಶ್ರೀ ಚಂದ್ರಮೌಳೀಶ್ವರ (ಶಿವ) & ಶ್ರೀ ಸೋಮೇಶ್ವರ",
      hi: "श्री चंद्रमौलेश्वर (शिव) एवं श्री सोमेश्वर",
      te: "శ్రీ చంద్రమౌళీశ్వర (శివ) & శ్రీ సోమేశ్వర",
      ta: "ஸ்ரீ சந்திரமௌலீஸ்வரர் (சிவன்) & சோமேஸ்வரர்",
      en: "Lord Chandramouleshwara (Shiva)"
    },
    afflictionTitle: {
      kn: "ಚಂದ್ರ ದೋಷ / ಮಾನಸಿಕ ಆತಂಕ & ಒತ್ತಡ ನಿವಾರಣಾ ಜಪ",
      hi: "चंद्र दोष / मानसिक तनाव एवं चिंता निवारण जप",
      te: "చంద్ర దోష / మానసిక ఒత్తిడి నివారణ శాంతి జపం",
      ta: "சந்திர தோஷ / மன அழுத்தம் நீக்கும் சாந்தி ஜபம்",
      en: "Moon Affliction / Emotional Serenity & Mental Peace Japa"
    },
    afflictionReason: {
      kn: "ಮನಃಕಾರಕನಾದ ಚಂದ್ರನ ಕ್ಷೀಣತೆ ಅಥವಾ ಆತಂಕದಿಂದ ಉಂಟಾಗುವ ಮಾನಸಿಕ ಅಸ್ಥಿರತೆ, ನಿದ್ರಾಹೀನತೆ ಮತ್ತು ಕಳವಳವನ್ನು ಕಳೆಯಲು ಈ ಶಾಂತಿ ಜಪ.",
      hi: "मन के स्वामी चंद्र की निर्बलता से होने वाली मानसिक चंचलता, अनिद्रा और उदासी को दूर करने हेतु यह मंत्र।",
      te: "మనస్సు కారకుడైన చంద్రుని బలహీనత వల్ల కలిగే ఆందోళన, నిద్రలేమిని దూరం చేయడానికి ఈ జపం.",
      ta: "மனோகாரகனான சந்திரனின் பலவீனத்தால் ஏற்படும் மன உளைச்சல் மற்றும் கவலையை போக்க இந்த ஜபம்.",
      en: "Nourishes the emotional mind, curing mood swings, sleep disturbances, and hypersensitivity."
    },
    sanskritShloka: `ದಧಿಶಂಖತುಷಾರಾಭಂ ಕ್ಷೀರೋದಾರ್ಣವ ಸಂಭವಮ್ ।
ನಮಾಮಿ ಶಶಿನಂ ಸೋಮಂ ಶಂಭೋರ್ಮುಕುಟ ಭೂಷಣಮ್ ॥
ಓಂ ನಮಃ ಶಿವಾಯ ॥`,
    transliteration: "Dadhiśaṅkhatuṣārābhaṁ kṣīrodārṇava sambhavam | Namāmi śaśinaṁ somaṁ śambhormukuṭa bhūṣaṇam || Om Namaḥ Śivāya ||",
    meaning: {
      kn: "ಮೊಸರು, ಶಂಖ ಮತ್ತು ಹಿಮದಂತೆ ಬಿಳಿಯಾದ ಕಾಂತಿಯುಳ್ಳವನು, ಕ್ಷೀರಸಮುದ್ರದಿಂದ ಉದ್ಭವಿಸಿದವನು ಹಾಗೂ ಈಶ್ವರನ ಮುಡಿಯ ಅಲಂಕಾರವಾದ ಶ್ರೀ ಸೋಮ ದೇವರಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      hi: "दही, शंख और हिम के समान उज्ज्वल, क्षीरसागर से प्रकट एवं भगवान शिव के मस्तक के आभूषण चंद्र देव को नमन।",
      te: "శంఖము మరియు మంచు వంటి తెల్లని కాంతి కలవాడు, శివుని శిరస్సుపై విరాజిల్లే చంద్రునికి ప్రణామాలు.",
      ta: "சங்கு மற்றும் பனி போன்ற வெண்மையான ஒளிகொண்டவரும், சிவபெருமானின் சிரசை அலங்கரிக்கும் சந்திரனுக்கு நமஸ்காரம்.",
      en: "Salutations to the luminous Moon, born from the Ocean of Nectar, adorning the crest of Lord Shiva."
    },
    calmingBenefit: {
      kn: "ಮನಸ್ಸಿನಲ್ಲಿರುವ ಎಲ್ಲಾ ಚಿಂತೆಗಳನ್ನು ತಂಪಾಗಿಸಿ, ಕ್ಷಣಮಾತ್ರದಲ್ಲಿ ಅನಿರ್ವಚನೀಯ ನೆಮ್ಮದಿ ಹಾಗೂ ಸಮಾಧಾನ ನೀಡುತ್ತದೆ.",
      hi: "मन की समस्त चिंताओं को शीतल कर असीम सुख, शांति और गहरी नींद प्रदान करता है।",
      te: "మనస్సులోని బాధలను చల్లబరిచి అపారమైన శాంతి, సంతోషాలను ప్రసాదిస్తుంది.",
      ta: "மன கவலைகளை ஆற்றி, மனதிற்கு அமைதியையும் நிம்மதியையும் தருகிறது.",
      en: "Cools mental agitation instantly, bringing profound emotional tranquility and restorative calm."
    },
    recommendedJapaCount: 11,
    celebrationHurrayText: {
      kn: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! ೧೧ ಬಾರಿ ಚಂದ್ರ ಶಾಂತಿ ಜಪ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು!",
      hi: "🎉 शुभ जयसिद्धि! ११ बार चंद्र शांति जप पूर्ण हुआ!",
      te: "🎉 శుభ జయసిద్ధి! 11 సార్లు చంద్ర శాంతి జపం పూర్తయింది!",
      ta: "🎉 சுப ஜெயசித்தி! 11 முறை சந்திர சாந்தி ஜபம் பூர்த்தியானது!",
      en: "🎉 Hurray! 11 Soothing Chants Completed! Heart Filled with Peace!"
    },
    freshMindBlessingText: {
      kn: "ಇಂದಿನ ದಿನವನ್ನು ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಮನೆಯ ಸಕಲ ಚಿಂತೆಗಳೂ ದೂರವಾಗಿ, ಶುಭ ಫಲಗಳು ನಿಮ್ಮದಾಗಲಿ!",
      hi: "आज का दिन अत्यंत शांत, प्रसन्न और प्रफुल्लित मन से आरंभ करें। सब शुभ होगा!",
      te: "ఈ రోజును ప్రశాంతమైన మరియు స్వచ్ఛమైన మనస్సుతో ప్రారంభించండి. సర్వదా విజయం!",
      ta: "இன்றைய நாளை தூய, அமைதியான மனதுடன் தொடங்குங்கள். அனைத்தும் சுபமாக விளங்கும்!",
      en: "Today go with a fresh, tranquil heart. All emotional burdens are surrendered to Lord Shiva!"
    },
    audioNarrationText: {
      kn: "ಹರಿ ಓಂ. ಮನಸ್ಸಿನ ಪರಿಪೂರ್ಣ ಶಾಂತಿಗಾಗಿ ೧೧ ಬಾರಿ ಈ ಚಂದ್ರ ಶಾಂತಿ ಮಂತ್ರ ಜಪಿಸಿ: ದಧಿಶಂಖತುಷಾರಾಭಂ...",
      hi: "हरि ॐ। मन की शांति हेतु ११ बार इस चंद्र मंत्र का पावन जप करें...",
      te: "హరి ఓం. మనశ్శాంతి కొరకు 11 సార్లు ఈ చంద్ర మంత్రాన్ని జపించండి...",
      ta: "ஹரி ஓம். மன அமைதிக்காக 11 முறை இந்த சந்திர மந்திரத்தை ஜபியுங்கள்...",
      en: "Hari Om. For complete emotional peace, chant this Moon pacification mantra 11 times..."
    }
  },

  // 6. GURU (Jupiter) - Lord Dakshinamurthy & Divine Wisdom Shloka
  [PlanetName.Jupiter]: {
    deityName: {
      kn: "ಶ್ರೀ ದಕ್ಷಿಣಾಮೂರ್ತಿ & ಶ್ರೀ ಗುರು ಬೃಹಸ್ಪತಿ",
      hi: "श्री दक्षिणामूर्ति एवं श्री गुरु बृहस्पति",
      te: "శ్రీ దక్షిణామూర్తి & శ్రీ గురు బృహస్పతి",
      ta: "ஸ்ரீ தட்சிணாமூர்த்தி & குரு பிரகஸ்பதி",
      en: "Lord Dakshinamurthy & Guru Brihaspati"
    },
    afflictionTitle: {
      kn: "ಗುರು ಬಲ ವೃದ್ಧಿ / ಮಕ್ಕಳ ಚಿಂತೆ & ಭಾಗ್ಯೋದಯ ಶಾಂತಿ ಜಪ",
      hi: "गुरु बल वृद्धि / संतान चिंता एवं भाग्योदय शांति जप",
      te: "గురు బల వృద్ధి / సంతాన & భాగ్యోదయ శాంతి జపం",
      ta: "குரு பல விருத்தி / சுப காரிய தடை நீக்கும் சாந்தி ஜபம்",
      en: "Jupiter Blessings / Wisdom, Family & Prosperity Japa"
    },
    afflictionReason: {
      kn: "ಕುಂಡಲಿಯಲ್ಲಿ ಗುರುವಿನ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುವ ನಿರ್ಧಾರ ಗೊಂದಲ, ಸಂತಾನ ಚಿಂತೆ ಮತ್ತು ಧನಾಗಮನದ ಅಡೆತಡೆ ನಿವಾರಣೆಗೆ ಈ ಜಪ.",
      hi: "गुरु की निर्बलता से होने वाले निर्णय भ्रम, संतान चिंता और आर्थिक रुकावटों को मिटाने हेतु यह जप।",
      te: "గురు బలహీనత వల్ల వచ్చే నిర్ణయాల లోపం, ఆర్థిక ఇబ్బందులు తొలగించడానికి ఈ జపం.",
      ta: "குருவின் பலவீனத்தால் ஏற்படும் முடிவெடுக்கும் தயக்கம் மற்றும் சுப காரிய தடைகளை நீக்க இந்த ஜபம்.",
      en: "Dispels financial anxiety, brings clarity of decision-making, and blesses children and family fortune."
    },
    sanskritShloka: `ಗುರುರ್ಬ್ರಹ್ಮಾ ಗುರುರ್ವಿಷ್ಣುಃ ಗುರುರ್ದೇವೋ ಮಹೇಶ್ವರಃ ।
ಗುರುಸ್ಸಾಕ್ಷಾತ್ ಪರಬ್ರಹ್ಮ ತಸ್ಮೈ ಶ್ರೀ ಗುರವೇ ನಮಃ ॥
ಓಂ ಗುರವೇ ನಮಃ ॥`,
    transliteration: "Gururbrahmā gururviṣṇuḥ gururdevo maheśvaraḥ | Gurussākṣāt parabrahma tasmai śrī gurave namaḥ || Om Gurave Namaḥ ||",
    meaning: {
      kn: "ಗುರುವೇ ಬ್ರಹ್ಮ, ಗುರುವೇ ವಿಷ್ಣು, ಗುರುವೇ ಮಹೇಶ್ವರ. ಸಾಕ್ಷಾತ್ ಪರಬ್ರಹ್ಮ ಸ್ವರೂಪಿಯಾದ ಶ್ರೀ ಗುರುವಿಗೆ ಭಕ್ತಿಪೂರ್ವಕ ನಮಸ್ಕಾರಗಳು.",
      hi: "गुरु ही ब्रह्मा हैं, गुरु ही विष्णु हैं और गुरु ही महेश्वर हैं। साक्षात परब्रह्म स्वरूप श्री गुरु को नमन।",
      te: "గురువే బ్రహ్మ, గురువే విష్ణువు, గురువే మహేశ్వరుడు. సాక్షాత్ పరబ్రహ్మ స్వరూపుడైన గురువుకు నమస్కారాలు.",
      ta: "குருவே பிரம்மா, குருவே விஷ்ணு, குருவே மகேஸ்வரன். சாக்ஷாத் பரபிரம்மமான குருவுக்கு நமஸ்காரம்.",
      en: "Guru is Brahma, Vishnu, and Shiva; Guru is the supreme reality. Prostrations to the divine Guru."
    },
    calmingBenefit: {
      kn: "ಮನಸ್ಸಿನ ಅಂಧಕಾರವನ್ನು ಕಳೆದು, ಸರಿಯಾದ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಅದ್ಭುತ ವಿವೇಕ ಮತ್ತು ಶಾಂತಿಯನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
      hi: "मन के भ्रम को मिटाकर सही निर्णय लेने की क्षमता और परम विवेक प्रदान करता है।",
      te: "సరైన నిర్ణయాలు తీసుకునే వివేకాన్ని మరియు జీవితంలో స్థిరమైన శాంతిని ఇస్తుంది.",
      ta: "மன குழப்பத்தை போக்கி சரியான முடிவெடுக்கும் ஞானத்தையும் அமைதியையும் தருகிறது.",
      en: "Eliminates confusion, bestowing supreme wisdom, optimism, and divine guidance in daily life."
    },
    recommendedJapaCount: 11,
    celebrationHurrayText: {
      kn: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! ೧೧ ಬಾರಿ ಗುರು ಮಂತ್ರ ಜಪ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು!",
      hi: "🎉 शुभ जयसिद्धि! ११ बार गुरु मंत्र जप पूर्ण हुआ!",
      te: "🎉 శుభ జయసిద్ధి! 11 సార్లు గురు మంత్ర జపం పూర్తయింది!",
      ta: "🎉 சுப ஜெயசித்தி! 11 முறை குரு மந்திர ஜபம் பூர்த்தியானது!",
      en: "🎉 Hurray! 11 Divine Chants Completed! Wisdom & Grace Activated!"
    },
    freshMindBlessingText: {
      kn: "ಇಂದಿನ ದಿನವನ್ನು ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಮನೆಯ ಸಕಲ ಚಿಂತೆಗಳೂ ದೂರವಾಗಿ, ಶುಭ ಫಲಗಳು ನಿಮ್ಮದಾಗಲಿ!",
      hi: "आज का दिन ज्ञान, शांति और नवीन ऊर्जा के साथ शुरू करें। गुरु कृपा से सब उत्तम होगा!",
      te: "ఈ రోజును గొప్ప ఉత్సాహంతో మరియు నిర్మల మనస్సుతో ప్రారంభించండి. సర్వత్రా విజయం!",
      ta: "இன்றைய நாளை ஞானத்துடனும் தெளிவான மனதுடனும் தொடங்குங்கள். குரு அருள் என்றும் துணை நிற்கும்!",
      en: "Today go with a fresh, enlightened mind. Guru's protective wisdom guides every step you take!"
    },
    audioNarrationText: {
      kn: "ಹರಿ ಓಂ. ಗುರು ಕೃಪೆ ಹಾಗೂ ನಿರ್ಮಲ ಶಾಂತಿಗಾಗಿ ೧೧ ಬಾರಿ ಈ ಮಂತ್ರ ಜಪಿಸಿ: ಗುರುರ್ಬ್ರಹ್ಮಾ ಗುರುರ್ವಿಷ್ಣುಃ...",
      hi: "हरि ॐ। गुरु कृपा एवं शांति हेतु ११ बार इस मंत्र का पावन जप करें...",
      te: "హరి ఓం. గురు కృప కొరకు 11 సార్లు ఈ మంత్రాన్ని జపించండి...",
      ta: "ஹரி ஓம். குரு அருள் பெற 11 முறை இந்த மந்திரத்தை ஜபியுங்கள்...",
      en: "Hari Om. For wisdom and inner guidance, chant this sacred Guru mantra 11 times..."
    }
  },

  // 7. SURYA (Sun) - Lord Surya Aditya Gayatri & Vitality Shloka
  [PlanetName.Sun]: {
    deityName: {
      kn: "ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣ & ಶ್ರೀ ಮಹಾವಿಷ್ಣು",
      hi: "श्री सूर्यनारायण एवं श्री महाविष्णु",
      te: "శ్రీ సూర్యనారాయణ & శ్రీ మహావిష్ణు",
      ta: "ஸ்ரீ சூரியநாராயணர் & ஸ்ரீ மகாவிஷ்ணு",
      en: "Lord Suryanarayana & Lord Vishnu"
    },
    afflictionTitle: {
      kn: "ಸೂರ್ಯ ದೋಷ / ಆರೋಗ್ಯ, ತೇಜಸ್ಸು & ಆತ್ಮವಿಶ್ವಾಸ ವೃದ್ಧಿ ಜಪ",
      hi: "सूर्य दोष / स्वास्थ्य, तेज एवं आत्मबल शांति जप",
      te: "సూర్య దోష / ఆరోగ్యం, తేజస్సు & ఆత్మవిశ్వాస వృద్ధి జపం",
      ta: "சூரிய தோஷ / உடல் நலம் & தன்னம்பிக்கை தரும் சாந்தி ஜபம்",
      en: "Sun / Health, Vitality & Inner Confidence Japa"
    },
    afflictionReason: {
      kn: "ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಸೂರ್ಯನ ಅಸ್ತ ಅಥವಾ ನೀಚ ಸ್ಥಿತಿಯಿಂದ ಉಂಟಾಗುವ ಆಲಸ್ಯ, ಕಣ್ಣಿನ ಸಮಸ್ಯೆ, ತಂದೆ/ಉದ್ಯೋಗ ಚಿಂತೆ ನಿವಾರಣೆಗೆ ಈ ಜಪ.",
      hi: "सूर्य की दुर्बलता से होने वाले आलस्य, आत्मविश्वास की कमी और स्वास्थ्य चिंता को दूर करने हेतु यह जप।",
      te: "సూర్య బలహీనత వల్ల కలిగే బద్ధకం, ఆత్మవిశ్వాస లోపాన్ని తొలగించడానికి ఈ జపం.",
      ta: "சூரிய பலவீனத்தால் ஏற்படும் சோர்வு மற்றும் தன்னம்பிக்கை குறைவை போக்க இந்த ஜபம்.",
      en: "Recharges vitality, cures lethargy, and removes career self-doubt with solar cosmic energy."
    },
    sanskritShloka: `ಜಪಾಕುಸುಮ ಸಂಕಾಶಂ ಕಾಶ್ಯಪೇಯಂ ಮಹಾದ್ಯುತಿಮ್ ।
ತಮೋಽರಿಂ ಸರ್ವಪಾಪಘ್ನಂ ಪ್ರಣತೋಽಸ್ಮಿ ದಿವಾಕರಮ್ ॥
ಓಂ ಸೂರ್ಯಾಯ ನಮಃ ॥`,
    transliteration: "Japākusuma saṅkāśaṁ kāśyapeyaṁ mahādyutim | Tamo'riṁ sarvapāpaghnaṁ praṇato'smi divākaram || Om Sūryāya Namaḥ ||",
    meaning: {
      kn: "ದಾಸವಾಳ ಪುಷ್ಪದಂತೆ ಕೆಂಪಾದ ಕಾಂತಿಯುಳ್ಳವನು, ಕಶ್ಯಪರ ಪುತ್ರನು, ಮಹಾ ತೇಜಸ್ವಿಯು ಹಾಗೂ ಕತ್ತಲೆಯನ್ನು ಓಡಿಸುವ ಸೂರ್ಯ ದೇವರಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      hi: "गुड़हल के पुष्प के समान कांति वाले, कश्यप के पुत्र, महा तेजस्वी, अंधकार के नाशक सूर्य देव को नमन।",
      te: "మందార పువ్వు వంటి ఎర్రని కాంతి కలవాడు, చీకటిని పోగొట్టే సూర్య భగవానునికి నమస్కారాలు.",
      ta: "செம்பருத்தி மலர் போன்ற ஒளிகொண்டவரும், இருளை விரட்டும் சூரிய பகவானுக்கு நமஸ்காரம்.",
      en: "Salutations to Lord Surya, radiant as the red hibiscus, son of Kashyapa, dispeller of all darkness."
    },
    calmingBenefit: {
      kn: "ದೇಹ ಮತ್ತು ಮನಸ್ಸಿನಲ್ಲಿ ಹೊಸ ಚೈತನ್ಯ ಹಾಗೂ ಉತ್ಸಾಹವನ್ನು ತುಂಬಿ, ಯಾವುದೇ ಸವಾಲನ್ನು ಗೆಲ್ಲುವ ಆತ್ಮವಿಶ್ವಾಸ ನೀಡುತ್ತದೆ.",
      hi: "तन-मन में नई ऊर्जा, ओज और आत्मविश्वास भरकर हर चुनौती से पार पाने की शक्ति देता है।",
      te: "శరీరంలో, మనస్సులో నూతన ఉత్తేజాన్ని నింపి అపారమైన ఆత్మవిశ్వాసాన్ని అందిస్తుంది.",
      ta: "உடலிலும் மனதிலும் புது தெம்பையும் புத்துணர்ச்சியையும் நிரப்பி தன்னம்பிக்கையை வளர்க்கும்.",
      en: "Infuses the soul with radiant vitality, erasing exhaustion and restoring inner self-worth."
    },
    recommendedJapaCount: 11,
    celebrationHurrayText: {
      kn: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! ೧೧ ಬಾರಿ ಸೂರ್ಯ ಮಂತ್ರ ಜಪ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು!",
      hi: "🎉 शुभ जयसिद्धि! ११ बार सूर्य मंत्र जप संपन्न हुआ!",
      te: "🎉 శుభ జయసిద్ధి! 11 సార్లు సూర్య జపం పూర్తయింది!",
      ta: "🎉 சுப ஜெயசித்தி! 11 முறை சூரிய மந்திர ஜபம் நிறைவடைந்தது!",
      en: "🎉 Hurray! 11 Radiant Chants Completed! Vitality Restored!"
    },
    freshMindBlessingText: {
      kn: "ಇಂದಿನ ದಿನವನ್ನು ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಮನೆಯ ಸಕಲ ಚಿಂತೆಗಳೂ ದೂರವಾಗಿ, ಶುಭ ಫಲಗಳು ನಿಮ್ಮದಾಗಲಿ!",
      hi: "आज का दिन नई ऊर्जा, आरोग्य और प्रसन्न मन से शुरू करें। सब कार्य सफल होंगे!",
      te: "ఈ రోజును సరికొత్త తేజస్సు మరియు ఉల్లాసమైన మనస్సుతో ప్రారంభించండి. అంతా శుభమే!",
      ta: "இன்றைய நாளை புதிய ஆற்றலுடனும் புத்துணர்ச்சியுடனும் தொடங்குங்கள். வெற்றி நிச்சயம்!",
      en: "Today go with a fresh, radiant mind. Surya's golden rays bless you with robust health and success!"
    },
    audioNarrationText: {
      kn: "ಹರಿ ಓಂ. ಆರೋಗ್ಯ ಮತ್ತು ಚೈತನ್ಯಕ್ಕಾಗಿ ೧೧ ಬಾರಿ ಈ ಸೂರ್ಯ ಮಂತ್ರ ಜಪಿಸಿ: ಜಪಾಕುಸುಮ ಸಂಕಾಶಂ...",
      hi: "हरि ॐ। स्वास्थ्य एवं तेज हेतु ११ बार इस सूर्य मंत्र का जप करें...",
      te: "హరి ఓం. ఆరోగ్యం కొరకు 11 సార్లు ఈ సూర్య మంత్రాన్ని జపించండి...",
      ta: "ஹரி ஓம். உடல் நலனுக்காக 11 முறை இந்த சூரிய மந்திரத்தை ஜபியுங்கள்...",
      en: "Hari Om. For health and divine vitality, chant this Sun mantra 11 times..."
    }
  },

  // 8. BUDHA (Mercury) - Lord Vishnu / Medha Sukta Shloka
  [PlanetName.Mercury]: {
    deityName: {
      kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ಶ್ರೀ ವಿದ್ಯಾ ಸರಸ್ವತಿ",
      hi: "श्री महाविष्णु एवं श्री विद्या सरस्वती",
      te: "శ్రీ మహావిష్ణువు & శ్రీ విద్యా సరస్వతి",
      ta: "ஸ்ரீ மகாவிஷ்ணு & ஸ்ரீ வித்யா சரஸ்வதி",
      en: "Lord Maha Vishnu & Goddess Saraswati"
    },
    afflictionTitle: {
      kn: "ಬುಧ ದೋಷ / ವಾಕ್ಚಾತುರ್ಯ, ವ್ಯಾಪಾರ & ಮಾನಸಿಕ ತೀಕ್ಷ್ಣತೆ ಜಪ",
      hi: "बुध दोष / व्यापार, वाणी एवं बुद्धि शुद्धि शांति जप",
      te: "బుధ దోష / వ్యాపార, వాక్శుద్ధి & బుద్ధి వికాస జపం",
      ta: "புதன் தோஷ / தொழில், வாக்குவன்மை & அறிவு விருத்தி சாந்தி ஜபம்",
      en: "Mercury / Intellect, Business Harmony & Clarity Japa"
    },
    afflictionReason: {
      kn: "ಕುಂಡಲಿಯಲ್ಲಿ ಬುಧನ ದುರ್ಬಲತೆಯಿಂದ ಉಂಟಾಗುವ ಮಾತಿನ ಎಡವಟ್ಟು, ವ್ಯಾಪಾರದ ಆತಂಕ ಮತ್ತು ನೆನಪಿನ ಶಕ್ತಿಯ ಕೊರತೆಯನ್ನು ನೀಗಿಸಲು ಈ ಜಪ.",
      hi: "बुध की निर्बलता से होने वाले व्यापारिक तनाव, बातचीत में असहजता और एकाग्रता की कमी को दूर करने हेतु यह मंत्र।",
      te: "బుధ బలహీనత వల్ల వచ్చే వ్యాపార ఒత్తిడి, మాటల్లో స్పష్టత లేకపోవడాన్ని దూరం చేయడానికి ఈ జపం.",
      ta: "புதனின் பலவீனத்தால் ஏற்படும் வணிக கவலைகள் மற்றும் மன குழப்பங்களை போக்க இந்த ஜபம்.",
      en: "Heals nervous tension, business anxiety, speech hesitation, and memory fatigue."
    },
    sanskritShloka: `ಪ್ರಿಯಂಗು ಕಲಿಕಾಶ್ಯಾಮಂ ರೂಪೇಣಾಪ್ರತಿಮಂ ಬುಧಮ್ ।
ಸೌಮ್ಯಂ ಸೌಮ್ಯಗುಣೋಪೇತಂ ತಂ ಬುಧಂ ಪ್ರಣಮಾಮ್ಯಹಮ್ ॥
ಓಂ ನಮೋ ನಾರಾಯಣಾಯ ॥`,
    transliteration: "Priyaṅgu kalikāśyāmaṁ rūpeṇāpratimaṁ budham | Saumyaṁ saumyaguṇopetaṁ taṁ budhaṁ praṇamāmyaham || Om Namo Nārāyaṇāya ||",
    meaning: {
      kn: "ಪ್ರಿಯಂಗು ಹೂವಿನ ಮೊಗ್ಗಿನಂತೆ ಹಸಿರು ಕಾಂತಿಯುಳ್ಳವನು, ಸಾಟಿಯಿಲ್ಲದ ರೂಪವಂತನು ಹಾಗೂ ಸೌಮ್ಯ ಗುಣಗಳಿಂದ ಕೂಡಿದ ಶ್ರೀ ಬುಧ ದೇವರಿಗೆ ಮತ್ತು ನಾರಾಯಣನಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      hi: "प्रियंगु की कली के समान श्यामवर्ण, अनुपम रूपवान एवं शांत स्वभाव वाले बुध देव तथा नारायण को नमन।",
      te: "ప్రియంగు మొగ్గ వంటి కాంతి గలవాడు, సౌమ్య గుణాలు కలిగిన బుధ గ్రహానికి మరియు నారాయణునికి ప్రణామాలు.",
      ta: "பிரியங்கு மொட்டு போன்ற பச்சை வண்ண மேனி கொண்டவரும், சாந்த குணமுடைய புதனுக்கும் நாராயணனுக்கும் நமஸ்காரம்.",
      en: "Salutations to Lord Mercury, calm and radiant, embodiment of intellect, and to Lord Narayana."
    },
    calmingBenefit: {
      kn: "ನೆನಪಿನ ಶಕ್ತಿಯನ್ನು ಚುರುಕುಗೊಳಿಸಿ, ವ್ಯಾಪಾರ ಹಾಗೂ ಮಾತಿನಲ್ಲಿ ಅದ್ಭುತ ಸ್ಪಷ್ಟತೆ ಮತ್ತು ಪ್ರಶಾಂತತೆಯನ್ನು ತರುತ್ತದೆ.",
      hi: "स्मरण शक्ति और निर्णय क्षमता को तीव्र कर व्यापार एवं वाणी में मधुरता और शांति लाता है।",
      te: "జ్ఞాపకశక్తిని పెంచి, వ్యాపారంలో మరియు సంభాషణలలో స్పష్టత మరియు ప్రశాంతతను ఇస్తుంది.",
      ta: "நினைவாற்றலை கூர்மையாக்கி, பேச்சு மற்றும் தொழிலில் தெளிவையும் அமைதியையும் தரும்.",
      en: "Clears nervous anxiety, sharpen mental eloquence, and blesses business and communication."
    },
    recommendedJapaCount: 11,
    celebrationHurrayText: {
      kn: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! ೧೧ ಬಾರಿ ಬುಧ ಮಂತ್ರ ಜಪ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು!",
      hi: "🎉 शुभ जयसिद्धि! ११ बार बुध मंत्र जप पूर्ण हुआ!",
      te: "🎉 శుభ ಜಯಸಿದ್ಧಿ! 11 ಸార్లు ಬುಧ ಜಪಂ ಪೂರ್ತಯಿಂದಿ!",
      ta: "🎉 சுப ஜெயசித்தி! 11 முறை புதன் மந்திர ஜபம் நிறைவடைந்தது!",
      en: "🎉 Hurray! 11 Chants Completed! Mental Clarity & Eloquence Activated!"
    },
    freshMindBlessingText: {
      kn: "ಇಂದಿನ ದಿನವನ್ನು ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಮನೆಯ ಸಕಲ ಚಿಂತೆಗಳೂ ದೂರವಾಗಿ, ಶುಭ ಫಲಗಳು ನಿಮ್ಮದಾಗಲಿ!",
      hi: "आज का दिन शांत, चतुर एवं प्रसन्न मन से आरंभ करें। सब कार्य सिद्ध होंगे!",
      te: "ఈ రోజును స్పష్టమైన ఆలోచనలతో మరియు ప్రశాంత మనస్సుతో ప్రారంభించండి. సర్వదా విజయం!",
      ta: "இன்றைய நாளை தெளிவான புத்தியுடனும் அமைதியான மனதுடனும் தொடங்குங்கள். காரிய சித்தி உண்டாகும்!",
      en: "Today go with a fresh, sharp, and peaceful mind. All business and communication endeavors will succeed!"
    },
    audioNarrationText: {
      kn: "ಹರಿ ಓಂ. ಬುದ್ಧಿ ಸ್ಪಷ್ಟತೆ ಹಾಗೂ ಬುಧ ಶಾಂತಿಗಾಗಿ ೧೧ ಬಾರಿ ಈ ಮಂತ್ರ ಜಪಿಸಿ: ಪ್ರಿಯಂಗು ಕಲಿಕಾಶ್ಯಾಮಂ...",
      hi: "हरि ॐ। बुद्धि शुद्धि एवं शांति हेतु ११ बार इस मंत्र का पावन जप करें...",
      te: "హరి ఓం. బుద్ధి వికాసం కొరకు 11 సార్లు ఈ బుధ మంత్రాన్ని జపించండి...",
      ta: "ஹரி ஓம். அறிவு விருத்திக்காக 11 முறை இந்த புதன் மந்திரத்தை ஜபியுங்கள்...",
      en: "Hari Om. For intellect and calm eloquence, chant this Mercury mantra 11 times..."
    }
  },

  // 9. SHUKRA (Venus) - Goddess Mahalakshmi & Domestic Bliss Shloka
  [PlanetName.Venus]: {
    deityName: {
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ & ಶ್ರೀ ಶುಕ್ರಾಚಾರ್ಯ",
      hi: "श्री महालक्ष्मी एवं श्री शुक्राचार्य",
      te: "శ్రీ మహాలక్ష్మి & శ్రీ శుక్రాచార్య",
      ta: "ஸ்ரீ மகாலட்சுமி & ஸ்ரீ சுக்ராச்சாரியார்",
      en: "Goddess Mahalakshmi & Lord Shukra"
    },
    afflictionTitle: {
      kn: "ಶುಕ್ರ ದೋಷ / ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ, ಸುಖ & ಐಶ್ವರ್ಯ ವೃದ್ಧಿ ಜಪ",
      hi: "शुक्र दोष / वैवाहिक सुख, प्रेम एवं समृद्धि शांति जप",
      te: "శుక్ర దోష / దాంపత్య సుఖం, ప్రేమ & ఐశ్వర్య వృద్ధి జపం",
      ta: "சுக்கிர தோஷ / குடும்ப அமைதி, அன்பு & செல்வ விருத்தி சாந்தி ஜபம்",
      en: "Venus Affliction / Domestic Love, Harmony & Prosperity Japa"
    },
    afflictionReason: {
      kn: "ಕುಂಡಲಿಯಲ್ಲಿ ಶುಕ್ರನ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುವ ವೈವಾಹಿಕ ಭಿನ್ನಾಭಿಪ್ರಾಯ, ಸುಖದ ಕೊರತೆ ಮತ್ತು ಕೌಟುಂಬಿಕ ಅಸಮಾಧಾನವನ್ನು ಹೋಗಲಾಡಿಸಲು ಈ ಜಪ.",
      hi: "शुक्र की निर्बलता से होने वाले वैवाहिक मनमुटाव, सुख की कमी और पारिवारिक असंतोष को दूर करने हेतु यह जप।",
      te: "దాంపత్య జీవితంలో వచ్చే విభేదాలు, అశాంతిని తొలగించి ప్రేమను నింపడానికి ఈ శాంతి జపం.",
      ta: "குடும்பத்தில் ஏற்படும் கருத்து வேறுபாடுகள் மற்றும் அமைதியின்மையை போக்க இந்த ஜபம்.",
      en: "Heals relationship friction, cures domestic discontent, and attracts grace and prosperity."
    },
    sanskritShloka: `ಹಿಮಕುಂದ ಮೃಣಾಲಾಭಂ ದೈತ್ಯಾನಾಂ ಪರಮಂ ಗುರುಮ್ ।
ಸರ್ವಶಾಸ್ತ್ರ ಪ್ರವಕ್ತಾರಂ ಭಾರ್ಗವಂ ಪ್ರಣಮಾಮ್ಯಹಮ್ ॥
ಓಂ ಶ್ರೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ ॥`,
    transliteration: "Himakunda mṛṇālābhaṁ daityānāṁ paramaṁ gurum | Sarvaśāstra pravaktāraṁ bhārgavaṁ praṇamāmyaham || Om Śrīṁ Mahālakṣmyai Namaḥ ||",
    meaning: {
      kn: "ಹಿಮ, ಮಲ್ಲಿಗೆ ಮತ್ತು ಕಮಲದ ದಂಟಿನಂತೆ ಬೆಳ್ಳಗಿರುವ, ಸಕಲ ಶಾಸ್ತ್ರಗಳನ್ನು ಬಲ್ಲ ಶ್ರೀ ಶುಕ್ರ ದೇವರಿಗೆ ಮತ್ತು ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      hi: "बर्फ, कुंद पुष्प एवं कमल-नाल के समान श्वेत कांति वाले, समस्त शास्त्रों के ज्ञाता भार्गव शुक्र एवं महालक्ष्मी को नमन।",
      te: "మంచు మరియు మల్లె పువ్వు వంటి తెల్లని కాంతి కలవాడు, సర్వ శాస్త్ర పండితుడైన శుక్రునికి మరియు మహాలక్ష్మికి నమస్కారాలు.",
      ta: "பனி மற்றும் மல்லிகை மலர் போன்ற வெண்மையான ஒளிகொண்டவரும், மகா வித்வானுமான சுக்கிரனுக்கும் மகாலட்சுமிக்கும் நமஸ்காரம்.",
      en: "Salutations to radiant Lord Shukra, teacher of all sciences, and to Goddess Mahalakshmi for blissful home harmony."
    },
    calmingBenefit: {
      kn: "ಮನೆಯಲ್ಲಿ ಪ್ರೀತಿ, ವಾತ್ಸಲ್ಯ ಹಾಗೂ ಐಶ್ವರ್ಯವನ್ನು ನೆಲೆಗೊಳಿಸಿ, ದಂಪತಿಗಳಲ್ಲಿ ಪರಸ್ಪರ ನಂಬಿಕೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
      hi: "घर में प्रेम, मिठास एवं समृद्धि को बढ़ाकर वैवाहिक जीवन में मधुरता और शांति लाता है।",
      te: "ఇంట్లో ప్రేమ, ఆప్యాయతలను పెంచి దాంపత్య జీవితంలో మాధుర్యాన్ని నింపుతుంది.",
      ta: "வீட்டில் அன்பும் மகிழ்ச்சியும் பெருகி, குடும்பத்தில் அமைதியை நிலைநிறுத்தும்.",
      en: "Infuses the home with sweetness, emotional bonding, aesthetic joy, and abundant blessings."
    },
    recommendedJapaCount: 11,
    celebrationHurrayText: {
      kn: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! ೧೧ ಬಾರಿ ಮಹಾಲಕ್ಷ್ಮೀ ಮಂತ್ರ ಜಪ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು!",
      hi: "🎉 शुभ जयसिद्धि! ११ बार महालक्ष्मी मंत्र जप संपन्न हुआ!",
      te: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! 11 ಸార్లు మహాలక్ష్మి జపం పూర్తయింది!",
      ta: "🎉 சுப ஜெயசித்தி! 11 முறை மகாலட்சுமி மந்திர ஜபம் நிறைவடைந்தது!",
      en: "🎉 Hurray! 11 Auspicious Chants Completed! Home Filled with Prosperity!"
    },
    freshMindBlessingText: {
      kn: "ಇಂದಿನ ದಿನವನ್ನು ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಮನೆಯ ಸಕಲ ಚಿಂತೆಗಳೂ ದೂರವಾಗಿ, ಶುಭ ಫಲಗಳು ನಿಮ್ಮದಾಗಲಿ!",
      hi: "आज का दिन प्रेम, शांति एवं आनंदमय मन से आरंभ करें। घर में सुख-समृद्धि की वर्षा होगी!",
      te: "ఈ రోజును ఆనందకరమైన మరియు ప్రశాంత మనస్సుతో ప్రారంభించండి. సర్వదా ఐశ్వర్యం!",
      ta: "இன்றைய நாளை அன்பான மற்றும் மகிழ்ச்சியான மனதுடன் தொடங்குங்கள். குடும்பத்தில் செல்வம் கொழிக்கும்!",
      en: "Today go with a fresh, joyful mind. Goddess Mahalakshmi blesses your household with peace and fortune!"
    },
    audioNarrationText: {
      kn: "ಹರಿ ಓಂ. ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಕೃಪೆಗಾಗಿ ೧೧ ಬಾರಿ ಈ ಮಂತ್ರ ಜಪಿಸಿ: ಹಿಮಕುಂದ ಮೃಣಾಲಾಭಂ...",
      hi: "हरि ॐ। पारिवारिक सुख एवं समृद्धि हेतु ११ बार इस मंत्र का जप करें...",
      te: "హరి ఓం. కుటుంబ సౌఖ్యం కొరకు 11 సార్లు ఈ మంత్రాన్ని జపించండి...",
      ta: "ஹரி ஓம். குடும்ப சுபிட்சத்திற்காக 11 முறை இந்த மந்திரத்தை ஜபியுங்கள்...",
      en: "Hari Om. For domestic bliss and Mahalakshmi grace, chant this 11 times..."
    }
  },

  // 10. SARVADOSHA / GENERAL CALMING - Lord Shiva Maha Mrityunjaya & Gokarna Mahabaleshwara Shloka
  sarvadosha: {
    deityName: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ (ಗೋಕರ್ಣ)",
      hi: "श्री महाबलेश्वर स्वामी (गोकर्ण)",
      te: "శ్రీ మహాబలేశ్వర స్వామి (గోకర్ణ)",
      ta: "ஸ்ரீ மகாபலேஸ்வர சுவாமி (கோகர்ணம்)",
      en: "Lord Mahabaleshwara (Gokarna Sanctum)"
    },
    afflictionTitle: {
      kn: "ಸರ್ವದೋಷ ನಿವಾರಣಾ / ಮಾನಸಿಕ ಆತಂಕ ಮುಕ್ತಿ ಮಹಾ ಶಾಂತಿ ಜಪ",
      hi: "सर्वदोष निवारण / मानसिक शांति एवं तनाव मुक्ति महा जप",
      te: "సర్వదోష నివారణ / మనశ్శాంతి & ఒత్తిడి ముక్తి మహా జపం",
      ta: "சர்வ தோஷ நிவர்த்தி / மன அமைதி & மன அழுத்தம் போக்கும் மகா சாந்தி ஜபம்",
      en: "Universal Planetary Peace & Instant Mental Stress Relief Japa"
    },
    afflictionReason: {
      kn: "ಜನ್ಮ ಕುಂಡಲಿಯ ಸಕಲ ಗ್ರಹದೋಷಗಳನ್ನು ಶಾಂತಗೊಳಿಸಿ, ದಿನನಿತ್ಯದ ಒತ್ತಡ, ಆತಂಕ ಮತ್ತು ಮನೆಯ ಸಮಸ್ಯೆಗಳನ್ನು ನಿವಾರಿಸಲು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಈ ಮಹಾ ಮಂತ್ರ.",
      hi: "कुंडली के समस्त ग्रहों की शांति तथा दैनिक तनाव, चिंता और पारिवारिक समस्याओं से मुक्ति हेतु गोकर्ण क्षेत्र का महामंत्र।",
      te: "సకల గ్రహ దోషాలను నివారించి, నిత్య ఒత్తిడి మరియు కుటుంబ సమస్యల నుండి విముక్తి కోసం ఈ మహా జపం.",
      ta: "சகல கிரக தோஷங்களையும் போக்கி, அன்றாட மன அழுத்தம் மற்றும் குடும்ப கவலைகளை நீக்க இந்த மகா ஜபம்.",
      en: "Universal supreme Vedic pacifier dissolving all stress, home tensions, and planetary imbalances."
    },
    sanskritShloka: `ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ ।
ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಽಮೃತಾತ್ ॥
ಓಂ ನಮಃ ಶಿವಾಯ ॥`,
    transliteration: "Om Tryambakaṁ yajāmahe sugandhiṁ puṣṭivardhanam | Urvārukamiva bandhanān mṛtyormukṣīya mā'mṛtāt || Om Namaḥ Śivāya ||",
    meaning: {
      kn: "ಸುಗಂಧಭರಿತನಾದ, ಸಕಲ ಪೋಷಕನಾದ ತ್ರಿನೇತ್ರಧಾರಿ ಈಶ್ವರನನ್ನು ಪೂಜಿಸುತ್ತೇವೆ. ಹಣ್ಣು ತೊಟ್ಟಿನಿಂದ ಕಳಚುವಂತೆ ನಮ್ಮನ್ನು ಸಂಸಾರ ಬಂಧನ, ರೋಗ, ಭಯ ಮತ್ತು ಆತಂಕಗಳಿಂದ ಮುಕ್ತಗೊಳಿಸು.",
      hi: "सुगंधित, पुष्टि को बढ़ाने वाले त्रिनेत्रधारी भगवान शिव का हम ध्यान करते हैं। जैसे पका हुआ खरबूजा बेल से मुक्त होता है, वैसे ही हमें भय और कष्टों से मुक्त करें।",
      te: "సుగంధ భరితుడు, సమస్త పోషకుడైన త్రినేత్రధారి శివుని ప్రార్థిస్తున్నాము. సర్వ భయాలు, బాధల నుండి మమ్ములను విముక్తులను చేయండి.",
      ta: "முக்கண்ணனான சிவபெருமானை வணங்குகிறோம். எங்களை அனைத்து பயங்கள் மற்றும் துன்பங்களிலிருந்து விடுவித்து அமைதியை அருள வேண்டுகிறோம்.",
      en: "We worship the three-eyed Lord Shiva, fragrant and nourishing, liberating the mind from all fear, illness, and anxiety."
    },
    calmingBenefit: {
      kn: "ಕ್ಷಣಮಾತ್ರದಲ್ಲಿ ಮನಸ್ಸಿನ ಎಲ್ಲಾ ಭಾರವನ್ನು ಇಳಿಸಿ, ಅಂತರಾಳದಲ್ಲಿ ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಅಪಾರ ಶಾಂತಿಯನ್ನು ತುಂಬುತ್ತದೆ.",
      hi: "क्षण भर में मन के संपूर्ण भार को हल्का कर अंतर्मन में ईश्वरीय सुरक्षा और अगाध शांति भर देता है।",
      te: "క్షణాల్లో మనస్సులోని సమస్త భారాలను తొలగించి అపారమైన దివ్య రక్షణ మరియు శాంతిని నింపుతుంది.",
      ta: "நொடிப் பொழுதில் மன பாரத்தை குறைத்து, ஆழ்ந்த அமைதியையும் தெய்வீக பாதுகாப்பையும் அளிக்கும்.",
      en: "Instantly lifts all mental heaviness, instills profound calm, and creates an impenetrable aura of divine protection."
    },
    recommendedJapaCount: 11,
    celebrationHurrayText: {
      kn: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! ೧೧ ಬಾರಿ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು!",
      hi: "🎉 शुभ जयसिद्धि! ११ बार महामृत्युंजय जप संपन्न हुआ!",
      te: "🎉 ಶುಭ ಜಯಸಿದ್ಧಿ! 11 ಸార్లు మహా మృత్యుంజయ జపం పూర్తయింది!",
      ta: "🎉 சுப ஜெயசித்தி! 11 முறை மகா மிருத்யுஞ்சய ஜபம் நிறைவடைந்தது!",
      en: "🎉 Hurray! 11 Maha Mrityunjaya Chants Completed! Divine Shield Active!"
    },
    freshMindBlessingText: {
      kn: "ಇಂದಿನ ದಿನವನ್ನು ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಮನೆಯ ಸಕಲ ಚಿಂತೆಗಳೂ ದೂರವಾಗಿ, ಶುಭ ಫಲಗಳು ನಿಮ್ಮದಾಗಲಿ!",
      hi: "आज का दिन एकदम शांत, तनावमुक्त और प्रसन्न मन से आरंभ करें। भगवान शिव की कृपा से सब शुभ होगा!",
      te: "ఈ రోజును ప్రశాంతమైన మరియు స్వచ్ఛమైన మనస్సుతో ప్రారంభించండి. సర్వదా శుభం జరుగుతుంది!",
      ta: "இன்றைய நாளை ஆழ்ந்த அமைதியுடனும் புத்துணர்ச்சியுடனும் தொடங்குங்கள். அனைத்தும் சுபமாக விளங்கும்!",
      en: "Today go with a fresh, stress-free mind. All domestic worries are lifted, and supreme auspiciousness is yours!"
    },
    audioNarrationText: {
      kn: "ಹರಿ ಓಂ. ಸಕಲ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಅಪಾರ ಮನಶ್ಶಾಂತಿಗಾಗಿ ೧೧ ಬಾರಿ ಈ ಪವಿತ್ರ ಮಂತ್ರ ಜಪಿಸಿ: ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ...",
      hi: "हरि ॐ। सर्वदोष निवारण एवं परम शांति हेतु ११ बार इस महामंत्र का जप करें...",
      te: "హరి ఓం. సమస్త దోష నివారణ కొరకు 11 సార్లు ఈ మహా మంత్రాన్ని జపించండి...",
      ta: "ஹரி ஓம். சர்வ தோஷ நிவர்த்திக்காக 11 முறை இந்த மகா மந்திரத்தை ஜபியுங்கள்...",
      en: "Hari Om. For universal peace and dissolving all anxieties, chant this 11 times..."
    }
  }
};

/**
 * Deterministically analyzes the birth Kundli to find the most afflicted Graha / Dosha
 * requiring immediate morning 11-time Japa remedy.
 */
export function determineKundliPersonalRemedy(params: DetermineRemedyParams): PersonalRemedyJapaInfo {
  const { birthKundli } = params;

  if (!birthKundli || !birthKundli.planets || !Array.isArray(birthKundli.planets)) {
    return {
      grahaKey: "sarvadosha",
      ...REMEDY_DATABASE.sarvadosha
    };
  }

  const positions: PlanetPosition[] = birthKundli.planets;

  // Helper to check sign name
  const isSign = (p: PlanetPosition, signName: string) => {
    return (
      (p.rashi && p.rashi.english && p.rashi.english.toLowerCase() === signName.toLowerCase()) ||
      ((p as any).sign && String((p as any).sign).toLowerCase() === signName.toLowerCase())
    );
  };

  // 1. Check for Debilitated (Neecha) planets or strong Dusthana placement
  // Saturn in Aries (Mesh)
  const saturn = positions.find((p: PlanetPosition) => p.name === PlanetName.Saturn);
  if (saturn && (isSign(saturn, "Aries") || saturn.isDebilitated || saturn.house === 8 || saturn.house === 12 || saturn.isRetrograde)) {
    return { grahaKey: PlanetName.Saturn, ...REMEDY_DATABASE[PlanetName.Saturn] };
  }

  // Moon in Scorpio (Vrishchika) or conjunct Rahu/Ketu
  const moon = positions.find((p: PlanetPosition) => p.name === PlanetName.Moon);
  const rahu = positions.find((p: PlanetPosition) => p.name === PlanetName.Rahu);
  const ketu = positions.find((p: PlanetPosition) => p.name === PlanetName.Ketu);

  if (moon) {
    if (isSign(moon, "Scorpio") || moon.isDebilitated || moon.house === 6 || moon.house === 8 || moon.house === 12) {
      return { grahaKey: PlanetName.Moon, ...REMEDY_DATABASE[PlanetName.Moon] };
    }
    if (rahu && Math.abs((moon.degree || 0) - (rahu.degree || 0)) < 15) {
      return { grahaKey: PlanetName.Rahu, ...REMEDY_DATABASE[PlanetName.Rahu] };
    }
  }

  // Mars in Cancer (Karka) or in 7th/8th house (Kuja Dosha)
  const mars = positions.find((p: PlanetPosition) => p.name === PlanetName.Mars);
  if (mars && (isSign(mars, "Cancer") || mars.isDebilitated || mars.house === 7 || mars.house === 8 || mars.house === 1)) {
    return { grahaKey: PlanetName.Mars, ...REMEDY_DATABASE[PlanetName.Mars] };
  }

  // Jupiter in Capricorn (Makara) or conjunct Rahu (Guru Chandal)
  const jupiter = positions.find((p: PlanetPosition) => p.name === PlanetName.Jupiter);
  if (jupiter && (isSign(jupiter, "Capricorn") || jupiter.isDebilitated || (rahu && Math.abs((jupiter.degree || 0) - (rahu.degree || 0)) < 15))) {
    return { grahaKey: PlanetName.Jupiter, ...REMEDY_DATABASE[PlanetName.Jupiter] };
  }

  // Sun in Libra (Tula) or conjunct Rahu
  const sun = positions.find((p: PlanetPosition) => p.name === PlanetName.Sun);
  if (sun && (isSign(sun, "Libra") || sun.isDebilitated || sun.house === 8 || (rahu && Math.abs((sun.degree || 0) - (rahu.degree || 0)) < 10))) {
    return { grahaKey: PlanetName.Sun, ...REMEDY_DATABASE[PlanetName.Sun] };
  }

  // Venus in Virgo (Kanya)
  const venus = positions.find((p: PlanetPosition) => p.name === PlanetName.Venus);
  if (venus && (isSign(venus, "Virgo") || venus.isDebilitated || venus.house === 6 || venus.house === 8)) {
    return { grahaKey: PlanetName.Venus, ...REMEDY_DATABASE[PlanetName.Venus] };
  }

  // Mercury in Pisces (Meena) or in 8th/12th
  const mercury = positions.find((p: PlanetPosition) => p.name === PlanetName.Mercury);
  if (mercury && (isSign(mercury, "Pisces") || mercury.isDebilitated || mercury.house === 8)) {
    return { grahaKey: PlanetName.Mercury, ...REMEDY_DATABASE[PlanetName.Mercury] };
  }

  // Rahu or Ketu in 1st, 7th, or 8th house
  if (rahu && (rahu.house === 1 || rahu.house === 7 || rahu.house === 8)) {
    return { grahaKey: PlanetName.Rahu, ...REMEDY_DATABASE[PlanetName.Rahu] };
  }

  if (ketu && (ketu.house === 1 || ketu.house === 8 || ketu.house === 12)) {
    return { grahaKey: PlanetName.Ketu, ...REMEDY_DATABASE[PlanetName.Ketu] };
  }

  // Default to universal Shiva / Sarvadosha Shanti
  return {
    grahaKey: "sarvadosha",
    ...REMEDY_DATABASE.sarvadosha
  };
}
