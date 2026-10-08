/**
 * Baggona Panchanga - Authentic Guided Vedic Pooja & Mantra Engine
 * (ಪುರೋಹಿತ ಮಾರ್ಗದರ್ಶಿತ ವೇದ ಮಂತ್ರ & ಪೂಜಾ ಮಹಾವಿಧಿ)
 * 
 * Rooted in the 50-year experienced Smartha & Vedic priest tradition of Karnataka & Gokarna Kshetra:
 * 1. ತ್ರಿಕಾಲ ಸಂಧ್ಯಾವಂದನಾ ಮಹಾವಿಧಿ (Sandhyavandana - Achamana, Pranayama, Marjana, Arghya, Gayatri 28/108, Suryopasthana)
 * 2. ಪ್ರಾತಃಕಾಲ ನಿತ್ಯ ದೇವತಾ ಪೂಜಾ ವಿಧಿ (Morning Deva Pooja - Deepa, Ghanta, Kalasha, Ganapati, 16 Upacharas, Arathi)
 * 3. ಸಾಯಂಕಾಲದ ಪೂಜೆ & ದೀಪಾರಾಧನಾ ಮಹಾವಿಧಿ (Evening Sandhya & Deeparadhana - Sandhya Deepa, Tulasi Pooja, Evening Stuti, Arathi)
 * 4. ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸಂಕಷ್ಟಹರ ಪೂಜಾ ವಿಧಿ (Maha Ganapati Pooja - Avahana, Durva/Pushpa 21/108 Japa, Sankata Nashana Stotra, Modaka)
 * 5. ಶ್ರೀ ಶಿವ ಪೂಜಾ, ರುದ್ರಾಭಿಷೇಕ & ಬಿಲ್ವಾರ್ಚನಾ ವಿಧಿ (Shiva Pooja - Bhasma, Abhisheka, Bilvashtaka, Om Namah Shivaya 108 Japa, Mahamrityunjaya)
 * 
 * STRICT USER AUDIO & SCRIPT MANDATE:
 * - "when user click on audio right, all the mantra please add it in Sanskrit itself. Only instruction will be based on Kannada, Telugu, Tamil, whatever the language, but all the mantra, all the pooja related stuff apart from instruction, everything should be in... Sanskrit."
 * - "If they are reading, when they are reading, whatever the language they have selected in that language only give it."
 * - "If they have selected the voice mode then all the mantra should be in Sanskrit, explanation or details or any preparation related stuff will be in the selected language. All the mantra will be on Sanskrit, no compromise in that."
 */

import type { SevaLang } from "../seva/sevaLocale";

export type GuidedPoojaKey =
  | "sandhyavandana"
  | "morning_pooja"
  | "evening_pooja"
  | "ganapati_pooja"
  | "shiva_pooja";

export interface GuidedPoojaAudioInstruction {
  intro: string;
  mid?: string;
  outro?: string;
}

export interface GuidedPoojaStep {
  step: number;
  titleKn: string;
  titleEn: string;
  titleHi?: string;
  titleTe?: string;
  titleTa?: string;
  actionCueKn: string;
  actionCueEn: string;
  actionCueHi?: string;
  actionCueTe?: string;
  actionCueTa?: string;
  icon: string;
  mantraSanskrit: string; // PURE SANSKRIT IN DEVANAGARI SCRIPT (Ensures 100% accurate Vedic phonetics in TTS)
  mantraSanskritPart2?: string; // Optional 2nd segment in pure Devanagari Sanskrit
  mantraL5: Record<SevaLang, string>; // Script localized for on-screen reading
  audioInstructionL5: Record<SevaLang, GuidedPoojaAudioInstruction>; // Localized priest instructions/details
  spokenPriestGuidance?: string; // Legacy/fallback precomputed string
  hiddenPriestInstructionKn: string;
  hiddenPriestInstructionEn: string;
  japaTarget?: number;
  japaMantra?: string;
  approxSeconds: number;
  visualEffect: "achamana" | "pranayama" | "deepa" | "bell" | "kalasha" | "arghya" | "japa" | "tulasi" | "bilva" | "abhisheka" | "arathi" | "namaskara";
}

export interface GuidedPoojaItem {
  key: GuidedPoojaKey;
  titleKn: string;
  titleEn: string;
  subtitleKn: string;
  subtitleEn: string;
  icon: string;
  badgeTextKn: string;
  badgeTextEn: string;
  colorScheme: {
    primary: string;
    border: string;
    badgeBg: string;
    gradient: string;
  };
  defaultJapaTarget?: number;
  steps: GuidedPoojaStep[];
}

/**
 * Builds the voice synthesis speech script for a given pooja step:
 * - Instructions, details, explanations, and preparations are spoken in the devotee's chosen language (Kn, Te, Ta, Hi, En).
 * - ALL SACRED MANTRAS and chanting segments are strictly in PURE SANSKRIT (Devanagari script)
 *   so the neural voice clone engine recites them with authentic Vedic pronunciation.
 */
export function getStepSpokenAudio(step: GuidedPoojaStep, lang: SevaLang = "kn"): string {
  const instr = step.audioInstructionL5?.[lang] || step.audioInstructionL5?.kn;
  if (!instr) {
    return step.spokenPriestGuidance || step.mantraSanskrit;
  }

  const parts: string[] = [];

  // 1. Spoken priest instructions / preparations in selected language
  if (instr.intro && instr.intro.trim()) {
    parts.push(instr.intro.trim());
  }

  // 2. Sacred Vedic Mantra ALWAYS IN PURE SANSKRIT (Devanagari)
  if (step.mantraSanskrit && step.mantraSanskrit.trim()) {
    parts.push(step.mantraSanskrit.trim());
  }

  // 3. Middle ritual action guidance in selected language (if any)
  if (instr.mid && instr.mid.trim()) {
    parts.push(instr.mid.trim());
  }

  // 4. Second Sacred Mantra segment ALWAYS IN PURE SANSKRIT (Devanagari)
  if (step.mantraSanskritPart2 && step.mantraSanskritPart2.trim()) {
    parts.push(step.mantraSanskritPart2.trim());
  }

  // 5. Outro / closing blessing in selected language (if any)
  if (instr.outro && instr.outro.trim()) {
    parts.push(instr.outro.trim());
  }

  return parts.join("\n\n");
}

export const GUIDED_POOJAS: Record<GuidedPoojaKey, GuidedPoojaItem> = {
  // =========================================================================
  // POOJA 1: ತ್ರಿಕಾಲ ಸಂಧ್ಯಾವಂದನಾ ಮಹಾವಿಧಿ (Sandhyavandana Vidhi)
  // =========================================================================
  sandhyavandana: {
    key: "sandhyavandana",
    titleKn: "ತ್ರಿಕಾಲ ಸಂಧ್ಯಾವಂದನಾ ಮಹಾವಿಧಿ",
    titleEn: "Trikala Sandhyavandana Vidhi",
    subtitleKn: "ಆಚಮನ, ಪ್ರಾಣಾಯಾಮ, ಮಾರ್ಜನ, ಸೂರ್ಯಾರ್ಘ್ಯ, ಗಾಯತ್ರೀ ಜಪ (೨೮/೧೦೮) ಹಾಗೂ ಉಪಸ್ಥಾನ",
    subtitleEn: "Authentic Vedic Sandhya: Achamana, Pranayama, Arghya & Gayatri Chanting",
    icon: "🌅",
    badgeTextKn: "ವೇದ ಪರಂಪರೆ · ನಿತ್ಯ ಕರ್ಮ",
    badgeTextEn: "Vedic Tradition · Daily Rite",
    colorScheme: {
      primary: "#B45309",
      border: "#D97706",
      badgeBg: "#FEF3C7",
      gradient: "from-amber-600 to-amber-700"
    },
    defaultJapaTarget: 28,
    steps: [
      {
        step: 1,
        titleKn: "೧. ಆಚಮನ (ಆತ್ಮ ಶುದ್ಧಿ)",
        titleEn: "1. Achamana (Inner Purification)",
        actionCueKn: "💧 ಉದ್ದರಣೆಯಿಂದ ಬಲ ಅಂಗೈಗೆ ನೀರು ಹಾಕಿ ೩ ಬಾರಿ ಸ್ವೀಕರಿಸಿ · ೧ ಬಾರಿ ಹರಿವಾಣಕ್ಕೆ ಬಿಡಿ",
        actionCueEn: "💧 Take 3 sips of water in right palm with mantra · Wash hands once",
        icon: "💧",
        visualEffect: "achamana",
        mantraSanskrit: "ॐ केशवाय स्वाहा। ॐ नारायणाय स्वाहा। ॐ माधवाय स्वाहा।",
        mantraSanskritPart2: "ॐ गोविन्दाय नमः। ॐ विष्णवे नमः। ॐ मधुसूदनाय नमः। ॐ त्रिविक्रमाय नमः। ॐ वामनाय नमः। ॐ श्रीधराय नमः। ॐ हृषीकेशाय नमः। ॐ पद्मनाभाय नमः। ॐ दामोदराय नमः॥",
        mantraL5: {
          kn: "ಓಂ ಕೇಶವಾಯ ಸ್ವಾಹಾ । ಓಂ ನಾರಾಯಣಾಯ ಸ್ವಾಹಾ । ಓಂ ಮಾಧವಾಯ ಸ್ವಾಹಾ ।\n(ಹಸ್ತ ಪ್ರಕ್ಷಾಲನ)\nಓಂ ಗೋವಿಂದಾಯ ನಮಃ, ಓಂ ವಿಷ್ಣವೇ ನಮಃ, ಓಂ ಮಧುಸೂದನಾಯ ನಮಃ, ಓಂ ತ್ರಿವಿಕ್ರಮಾಯ ನಮಃ, ಓಂ ವಾಮನಾಯ ನಮಃ, ಓಂ ಶ್ರೀಧರಾಯ ನಮಃ, ಓಂ ಹೃಷೀಕೇಶಾಯ ನಮಃ, ಓಂ ಪದ್ಮನಾಭಾಯ ನಮಃ, ಓಂ ದಾಮೋದರಾಯ ನಮಃ ॥",
          hi: "ॐ केशवाय स्वाहा। ॐ नारायणाय स्वाहा। ॐ माधवाय स्वाहा।\n(हस्त प्रक्षालन)\nॐ गोविन्दाय नमः, ॐ विष्णवे नमः, ॐ मधुसूदनाय नमः, ॐ त्रिविक्रमाय नमः, ॐ वामनाय नमः, ॐ श्रीधराय नमः, ॐ हृषीकेशाय नमः, ॐ पद्मनाभाय नमः, ॐ दामोदराय नमः॥",
          te: "ఓం కేశవాయ స్వాహా। ఓం నారాయణాయ స్వాహా। ఓం మాధవాయ స్వాహా।\n(హస్త ప్రక్షాళన)\nఓం గోవిందాయ నమః, ఓం విష్ణవే నమః, ఓం మధుసూదనాయ నమః, ఓం త్రివిక్రమాయ నమః, ఓం వామనాయ నమః, ఓం శ్రీధరాయ నమః, ఓం హృషీకేశాయ నమః, ఓం పద్మనాభాయ నమః, ఓం దామోదరాయ నమః॥",
          ta: "ஓம் கேசவாய ஸ்வாஹா। ஓம் நாராயணாய ஸ்வாஹா। ஓம் மாதவாய ஸ்வாஹா।\n(ஹஸ்த ப்ரக்ஷாலனம்)\nஓம் கோவிந்தாய நமஃ, ஓம் விஷ்ணவே நமஃ, ஓம் மதுசூதனாய நமஃ, ஓம் த்ரிவிக்ரமாய நமஃ, ஓம் வாமனாய நமஃ, ஓம் ஸ்ரீதராய நமஃ, ஓம் ஹ்ருஷீகேசாய நமஃ, ஓம் பத்மநாபாய நமஃ, ஓம் தாமோதராய நமஃ॥",
          en: "Om Keshavaya Svaha | Om Narayanaya Svaha | Om Madhavaya Svaha |\n(Cleanse Hands)\nOm Govindaya Namah, Om Vishnave Namah, Om Madhusudanaya Namah, Om Trivikramaya Namah, Om Vamanaya Namah, Om Shridharaya Namah, Om Hrishikeshaya Namah, Om Padmanabhaya Namah, Om Damodaraya Namah ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಹರಿ ಓಂ. ಪವಿತ್ರ ಸಂಧ್ಯಾವಂದನೆಯನ್ನು ಪ್ರಾರಂಭಿಸೋಣ. ಪಾತ್ರೆ ಮತ್ತು ಉದ್ದರಣೆಯನ್ನು ಬಲಬದಿಯಲ್ಲಿ ಇಟ್ಟುಕೊಳ್ಳಿ. ಬಲ ಅಂಗೈಗೆ ಉದ್ದರಣೆಯಿಂದ ಮೂರು ಬಾರಿ ನೀರನ್ನು ಹಾಕಿಕೊಳ್ಳಿ. ಪ್ರತಿ ಬಾರಿ ಮಂತ್ರವನ್ನು ಹೇಳಿ ಸ್ವೀಕರಿಸಿ.",
            mid: "ಈಗ ಹರಿವಾಣಕ್ಕೆ ನೀರನ್ನು ಬಿಟ್ಟು ಹಸ್ತ ಪ್ರಕ್ಷಾಲನ ಮಾಡಿಕೊಳ್ಳಿ.",
            outro: "ನಿಮ್ಮ ಅಂಗೈಗಳನ್ನು ಶುದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ."
          },
          en: {
            intro: "Hari Om. Let us begin sacred Sandhyavandana. Keep the water vessel and spoon on your right. Take water in your right palm three times using the spoon. Recite the sacred mantra with each sip.",
            mid: "Now release water into the plate and cleanse your hands.",
            outro: "Keep your palms clean and focused."
          },
          te: {
            intro: "హరి ఓం. పవిత్ర సంధ్యావందనాన్ని ప్రారంభిద్దాం. పాత్ర మరియు ఉద్ధరణిని కుడివైపున ఉంచుకోండి. కుడి అరచేతిలో ఉద్ధరణితో మూడుసార్లు నీటిని వేసుకోండి. ప్రతిసారి మంత్రాన్ని చెబుతూ స్వీకరించండి.",
            mid: "ఇప్పుడు పళ్లెంలోకి నీటిని వదిలి చేతులు శుభ్రం చేసుకోండి.",
            outro: "చేతులను పవిత్రంగా ఉంచుకోండి."
          },
          ta: {
            intro: "ஹரி ஓம். பவித்ர சந்தியாவந்தனத்தைத் தொடங்குவோம். பாத்திரம் மற்றும் உத்தரணியை வலதுபுறம் வைத்துக் கொள்ளுங்கள். வலது உள்ளங்கையில் உத்தரணியால் மூன்று முறை நீரை ஊற்றிக் கொள்ளுங்கள். ஒவ்வொரு முறையும் மந்திரத்தைக் கூறி ஏற்றுக்கொள்ளுங்கள்.",
            mid: "இப்போது தட்டில் நீரை விட்டு கைகளை தூய்மை செய்து கொள்ளுங்கள்.",
            outro: "உள்ளங்கைகளைத் தூய்மையாக வைத்துக் கொள்ளுங்கள்."
          },
          hi: {
            intro: "हरि ॐ। पवित्र संध्यावंदना प्रारंभ करते हैं। पात्र और आचमनी को दाईं ओर रखें। आचमनी से दाहिनी हथेली में तीन बार जल लें। प्रत्येक बार मंत्र का उच्चारण करते हुए आचमन करें।",
            mid: "अब थाली में जल छोड़कर हाथ धो लें।",
            outro: "हथेलियों को शुद्ध रखें।"
          }
        },
        spokenPriestGuidance: "ಹರಿ ಓಂ. ಪವಿತ್ರ ಸಂಧ್ಯಾವಂದನೆಯನ್ನು ಪ್ರಾರಂಭಿಸೋಣ. ಪಾತ್ರೆ ಮತ್ತು ಉದ್ದರಣೆಯನ್ನು ಬಲಬದಿಯಲ್ಲಿ ಇಟ್ಟುಕೊಳ್ಳಿ. ಬಲ ಅಂಗೈಗೆ ಉದ್ದರಣೆಯಿಂದ ಮೂರು ಬಾರಿ ನೀರನ್ನು ಹಾಕಿಕೊಳ್ಳಿ. ॐ केशवाय स्वाहा। ॐ नारायणाय स्वाहा। ॐ माधवाय स्वाहा। ಈಗ ಹರಿವಾಣಕ್ಕೆ ನೀರನ್ನು ಬಿಟ್ಟು ಹಸ್ತ ಪ್ರಕ್ಷಾಲನ ಮಾಡಿಕೊಳ್ಳಿ. ॐ गोविन्दाय नमः। ॐ विष्णवे नमः। ॐ मधुसूदनाय नमः। ॐ त्रिविक्रमाय नमः। ॐ वामनाय नमः। ॐ श्रीधराय नमः। ॐ हृषीकेशಾಯ नमः। ॐ पद्मनाभाय नमः। ॐ दामोदराय नमः॥",
        hiddenPriestInstructionKn: "ಬ್ರಾಹ್ಮತೀರ್ಥದಿಂದ (ಬಲ ಅಂಗೈ ಹೆಬ್ಬೆರಳಿನ ಮೂಲ) ಉದ್ದರಣೆಯ ನೀರಿನಿಂದ ಮೂರು ಬಾರಿ ಆಚಮನ ಮಾಡಬೇಕು. ನಾಲ್ಕನೇ ಬಾರಿ ನೀರನ್ನು ಹರಿವಾಣಕ್ಕೆ ಬಿಟ್ಟು ಕೈ ತೊಳೆದುಕೊಳ್ಳಬೇಕು. ನಂತರ ದ್ವಾದಶ ನಾಮಗಳನ್ನು ಉಚ್ಚರಿಸುತ್ತಾ ಶರೀರದ ಅಂಗಗಳನ್ನು ಸ್ಪರ್ಶಿಸಿ ಶುದ್ಧೀಕರಿಸಿಕೊಳ್ಳಬೇಕು.",
        hiddenPriestInstructionEn: "Take water in the right palm using the spoon, sip three times for each invocation, release water once to cleanse hands, then chant the twelve holy names.",
        approxSeconds: 35
      },
      {
        step: 2,
        titleKn: "೨. ಪ್ರಾಣಾಯಾಮ (ಪಂಚಪ್ರಾಣ ಧ್ಯಾನ)",
        titleEn: "2. Pranayama (Pranic Energy Breathwork)",
        actionCueKn: "🌬️ ನಾಸಿಕಾಗ್ರ ಸ್ಪರ್ಶಿಸಿ · ದೀರ್ಘ ಉಸಿರು ತೆಗೆದುಕೊಂಡು ಪಂಚಪ್ರಾಣ ಮಂತ್ರ ಧ್ಯಾನಿಸಿ",
        actionCueEn: "🌬️ Touch nostrils gently · Inhale deeply and meditate upon Pancha Prana",
        icon: "🌬️",
        visualEffect: "pranayama",
        mantraSanskrit: "ॐ प्राणाय स्वाहा। ॐ अपानाय स्वाहा। ॐ व्यानाय स्वाहा। ॐ उदानाय स्वाहा। ॐ समानाय स्वाहा॥",
        mantraSanskritPart2: "ॐ भूः। ॐ भुवः। ॐ सुवः। ॐ महः। ॐ जनः। ॐ तपः। ॐ सत्यम्॥ ॐ तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥ ॐ आपो ज्योती रसोऽमृतं ब्रह्म भूर्भुवस्सुवरोम्॥",
        mantraL5: {
          kn: "ಓಂ ಪ್ರಾಣಾಯ ಸ್ವಾಹಾ । ಓಂ ಅಪಾನಾಯ ಸ್ವಾಹಾ । ಓಂ ವ್ಯಾನಾಯ ಸ್ವಾಹಾ । ಓಂ ಉದಾನಾಯ ಸ್ವಾಹಾ । ಓಂ ಸಮಾನಾಯ ಸ್ವಾಹಾ ॥\nಓಂ ಭೂಃ । ಓಂ ಭುವಃ । ಓಂ ಸುವಃ । ಓಂ ಮಹಃ । ಓಂ ಜನಃ । ಓಂ ತಪಃ । ಓಂ ಸತ್ಯಮ್ ॥\nಓಂ ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ ಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್ ॥\nಓಮಾಪೋ ಜ್ಯೋತೀ ರಸೋಽಮೃತಂ ಬ್ರಹ್ಮ ಭೂರ್ಭುವಸ್ಸುವರೋಮ್ ॥",
          hi: "ॐ प्राणाय स्वाहा। ॐ अपानाय स्वाहा। ॐ व्यानाय स्वाहा। ॐ उदानाय स्वाहा। ॐ समानाय स्वाहा॥\nॐ भूः। ॐ भुवः। ॐ सुवः। ॐ महः। ॐ जनः। ॐ तपः। ॐ सत्यम्॥\nॐ तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥\nॐ आपो ज्योती रसोऽमृतं ब्रह्म भूर्भुवस्सुवरोम्॥",
          te: "ఓం ప్రాణాయ స్వాహా। ఓం అపానాయ స్వాహా। ఓం వ్యానాయ స్వాహా। ఓం ఉదానాయ స్వాహా। ఓం సమానాయ స్వాహా॥\nఓం భూః। ఓం భువః। ఓం సువః। ఓం మహః। ఓం జనః। ఓం తపః। ఓం సత్యమ్॥\nఓం తత్సవితుర్వరేణ్యం భర్గో దేవస్య ధీమహి ధియో యో నః ప్రచోదయాత్॥\nఓమాపో జ్యోతీ రసోಽమృతం బ్రహ్మ భూర్భువస్సువరోమ్॥",
          ta: "ஓம் ப்ராணாய ஸ்வாஹா। ஓம் அபானாய ஸ்வாஹா। ஓம் வ்யானாய ஸ்வாஹா। ஓம் உதானாய ஸ்வாஹா। ஓம் ஸமானாய ஸ்வாஹா॥\nஓம் பூஃ। ஓம் புவஃ। ஓம் ஸுவஃ। ஓம் மஹஃ। ஓம் ஜனஃ। ஓம் தபஃ। ஓம் ஸத்யம்॥\nஓம் தத்ஸவிதுர்வரேண்யம் பர்கோ தேவஸ்ய தீமஹி தியோ யோ நஃ ப்ரசோதயாத்॥\nஓமாபோ ஜ்யோதீ ரஸோऽம்ருதம் ப்ரம்ஹ பூர்புவஸ்ஸுவரோம்॥",
          en: "Om Pranaya Svaha | Om Apanaya Svaha | Om Vyanaya Svaha | Om Udanaya Svaha | Om Samanaya Svaha ||\nOm Bhuh | Om Bhuvah | Om Suvah | Om Mahah | Om Janah | Om Tapah | Om Satyam ||\nOm Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat ||\nOm Apo Jyoti Raso Amritam Brahma Bhur Bhuvas Suvar Om ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಈಗ ಪ್ರಾಣಾಯಾಮವನ್ನು ಕೈಗೊಳ್ಳೋಣ. ಬಲಗೈ ಹೆಬ್ಬೆರಳು ಮತ್ತು ಉಂಗುಷ್ಟದಿಂದ ನಾಸಿಕವನ್ನು ಮೃದುವಾಗಿ ಸ್ಪರ್ಶಿಸಿ. ದೀರ್ಘವಾಗಿ ಉಸಿರನ್ನು ತೆಗೆದುಕೊಂಡು ಪಂಚಪ್ರಾಣಗಳನ್ನು ಧ್ಯಾನಿಸಿ.",
            outro: "ನಿಧಾನವಾಗಿ ಉಸಿರನ್ನು ಹೊರಬಿಡಿ."
          },
          en: {
            intro: "Now perform Pranayama. Gently touch your nostrils with thumb and ring finger. Inhale deeply and meditate upon the five vital cosmic energies.",
            outro: "Gently exhale and feel supreme tranquility."
          },
          te: {
            intro: "ఇప్పుడు ప్రాణాయామం చేద్దాం. కుడిచేతి బొటనవేలు మరియు ఉంగరపు వేలితో ముక్కును మెల్లగా తాకండి. దీర్ఘంగా శ్వాస తీసుకుంటూ పంచప్రాణాలను ధ్యానించండి.",
            outro: "నెమ్మదిగా శ్వాసను విడిచిపెట్టండి."
          },
          ta: {
            intro: "இப்போது பிராணாயாமம் செய்வோம். வலது கை கட்டைவிரல் மற்றும் மோதிர விரலால் மூக்கை மென்மையாகத் தொடுங்கள். ஆழமாக மூச்சை இழுத்து பஞ்சப் பிராணங்களைத் தியானியுங்கள்.",
            outro: "மெதுவாக மூச்சை வெளிவிடுங்கள்."
          },
          hi: {
            intro: "अब प्राणायाम करें। दाहिने हाथ के अँगूठे और अनामिका से नासिका का स्पर्श करें। दीर्घ श्वास लेते हुए पंचप्राणों का ध्यान करें।",
            outro: "धीरे-धीरे श्वास छोड़ें।"
          }
        },
        spokenPriestGuidance: "ಈಗ ಪ್ರಾಣಾಯಾಮವನ್ನು ಕೈಗೊಳ್ಳೋಣ. ಬಲಗೈ ಹೆಬ್ಬೆರಳು ಮತ್ತು ಉಂಗುಷ್ಟದಿಂದ ನಾಸಿಕವನ್ನು ಮೃದುವಾಗಿ ಸ್ಪರ್ಶಿಸಿ. ದೀರ್ಘವಾಗಿ ಉಸಿರನ್ನು ತೆಗೆದುಕೊಂಡು ಪಂಚಪ್ರಾಣಗಳನ್ನು ಧ್ಯಾನಿಸಿ. ॐ प्राणाय स्वाहा। ॐ अपानाय स्वाहा। ॐ व्यानाय स्वाहा। ॐ उदानाय स्वाहा। ॐ समानाय स्वाहा॥ ॐ भूः। ॐ भुवः। ॐ सुवः। ॐ महः। ॐ जनः। ॐ तपः। ॐ सत्यम्॥ ॐ तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥ ॐ आपो ज्योती रसोऽमृतं ब्रह्म भूर्भुवस्सुवरोम्॥ ನಿಧಾನವಾಗಿ ಉಸಿರನ್ನು ಹೊರಬಿಡಿ.",
        hiddenPriestInstructionKn: "ಪ್ರಾಣಾಯಾಮವು ಶರೀರದಲ್ಲಿ ಪ್ರಾಣ, ಅಪಾನ, ವ್ಯಾನ, ಉದಾನ, ಸಮಾನ ಶಕ್ತಿಗಳನ್ನು ಸಮತೋಲನಗೊಳಿಸುತ್ತದೆ. ಪೂರಕ, ಕುಂಭಕ, ರೇಚಕ ಕ್ರಮದಲ್ಲಿ ಸಪ್ತ ವ್ಯಾಹೃತಿಗಳನ್ನು ಮತ್ತು ಗಾಯತ್ರೀ ಶಿರೋಮಂತ್ರವನ್ನು ಧ್ಯಾನಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Perform Pranayama by regulating breath with thumb and ring finger, chanting the seven Vyahritis and Gayatri Shiras.",
        approxSeconds: 40
      },
      {
        step: 3,
        titleKn: "೩. ಮಾರ್ಜನ & ಪುನರ್ಮಾರ್ಜನ",
        titleEn: "3. Marjana (Sacred Water Sprinkling)",
        actionCueKn: "🌿 ಉದ್ದರಣೆ ನೀರಿನಿಂದ ಹೂವು/ದರ್ಬೆಯಿಂದ ಶಿರಸ್ಸಿನ ಮೇಲೆ ಪ್ರೋಕ್ಷಿಸಿ",
        actionCueEn: "🌿 Sprinkle water over the head with flowers/durva grass",
        icon: "🌿",
        visualEffect: "kalasha",
        mantraSanskrit: "आपो हि ष्ठा मयोभुवः। ता न ऊर्जे दधातन। महे रणाय चक्षसे॥ यो वः शिवतमो रसः। तस्य भाजयतेह नः। उशतीरिव मातरः॥ तस्मा अरं गमाम वः। यस्य क्षयाय जिन्वथ। आपो जनयथा च नः॥",
        mantraL5: {
          kn: "ಆಪೋ ಹಿ ಷ್ಠಾ ಮಯೋಭುವಃ । ತಾ ನ ಊರ್ಜೇ ದಧಾತನ । ಮಹೇ ರಣಾಯ ಚಕ್ಷಸೇ ॥\nಯೋ ವಃ ಶಿವತಮೋ ರಸಃ । ತಸ್ಯ ಭಾಜಯತೇಹ ನಃ । ಉಶತೀರಿವ ಮಾತರಃ ॥\nತಸ್ಮಾ ಅರಂ ಗಮಾಮ ವಃ । ಯಸ್ಯ ಕ್ಷಯಾಯ ಜಿನ್ವಥ । ಆಪೋ ಜನಯಥಾ ಚ ನಃ ॥",
          hi: "आपो हि ष्ठा मयोभुवः। ता न ऊर्जे दधातन। महे रणाय चक्षसे॥\nयो वः शिवतमो रसः। तस्य भाजयतेह नः। उशतीरिव मातरः॥\nतस्मा अरं गमाम वः। यस्य क्षयाय जिन्वथ। आपो जनयथा च नः॥",
          te: "ఆపో హి ష్ఠా మయోభువః। తా న ఊర్జే దధాతన। మహే రణాయ చక్షసే॥\nయో వః శివతమో రసః। తస్య భాజయతేహ నః। ఉశతీరివ మాతరః॥\nతస్మా అర host గమామ వః। యస్య క్షయాయ జిన్వథ। ఆపో జనయథా చ నః॥",
          ta: "ஆபோ ஹி ஷ்டா மயோபுவஃ। தா ந ஊர்ஜே ததாதன। மஹே ரணாய சக்ஷஸே॥\nயோ வஃ சிவதமோ ரஸஃ। தஸ்ய பாஜயதேஹ நஃ। உசதீரிவ மாதரஃ॥\nதஸ்மா அரம் கமாம வஃ। யஸ்ய க்ஷயாய ஜின்வத। ஆபோ ஜனயதா ச நஃ॥",
          en: "Apo Hi Shta Mayo Bhuvah | Ta Na Urje Dhadhatana | Mahe Ranaya Chakshase ||\nYo Vah Shivathamo Rasah | Tasya Bhajayateha Nah | Ushatiriva Matarah ||\nTasma Aram Gamama Vah | Yasya Kshayaya Jinvatha | Apo Janayatha Cha Nah ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಈಗ ಮಾರ್ಜನ ಪ್ರಕ್ರಿಯೆ. ಉದ್ದರಣೆಯಿಂದ ಹೂವು ಅಥವಾ ದರ್ಬೆಯ ಮೂಲಕ ಪವಿತ್ರ ಜಲವನ್ನು ತಲೆಯ ಮೇಲೆ ಪ್ರೋಕ್ಷಿಸಿಕೊಳ್ಳಿ.",
            outro: "ಪವಿತ್ರ ಜಲವು ಶರೀರ ಮತ್ತು ಮನಸ್ಸನ್ನು ಶುದ್ಧೀಕರಿಸಲಿ."
          },
          en: {
            intro: "Now perform Marjana. Sprinkle sanctified water drops onto the crown of your head using flowers or sacred grass.",
            outro: "May the divine waters cleanse both body and mind."
          },
          te: {
            intro: "ఇప్పుడు మార్జన ప్రక్రియ. ఉద్ధరణి నుండి పువ్వు లేదా దర్భ ద్వారా పవిత్ర జలాన్ని తలపై చల్లుకోండి.",
            outro: "పవిత్ర జలం శరీరాన్ని మరియు మనస్సును శుద్ధి చేయుగాక."
          },
          ta: {
            intro: "இப்போது மார்ஜனம். உத்தரணியிலிருந்து மலர் அல்லது தருப்பையால் புனித நீரை தலையில் தெளித்துக் கொள்ளுங்கள்.",
            outro: "புனித நீர் உங்கள் உடலையும் மனதையும் தூய்மையாக்கட்டும்."
          },
          hi: {
            intro: "अब मार्जन करें। आचमनी से पुष्प या दुर्वा द्वारा पवित्र जल को अपने मस्तक पर छिड़कें।",
            outro: "पवित्र जल आपके तन और मन को शुद्ध करे।"
          }
        },
        spokenPriestGuidance: "ಈಗ ಮಾರ್ಜನ ಪ್ರಕ್ರಿಯೆ. ಉದ್ದರಣೆಯಿಂದ ಹೂವು ಅಥವಾ ದರ್ಬೆಯ ಮೂಲಕ ಪವಿತ್ರ ಜಲವನ್ನು ತಲೆಯ ಮೇಲೆ ಪ್ರೋಕ್ಷಿಸಿಕೊಳ್ಳಿ. आपो हि ष्ठा मयोभुवः। ता न ऊर्जे दधातन। महे रणाय चक्षसे॥ यो वः शिवतमो रसः। तस्य भाजयतेह नः। उशतीरिव मातरः॥ तस्मा अरं गमाम वः। यस्य क्षयाय जिन्वथ। आपो जनयथा च नः॥ ಪವಿತ್ರ ಜಲವು ಶರೀರ ಮತ್ತು ಮನಸ್ಸನ್ನು ಶುದ್ಧೀಕರಿಸಲಿ.",
        hiddenPriestInstructionKn: "ಮಾರ್ಜನ ಮಂತ್ರದಿಂದ ಪವಿತ್ರ ಜಲವನ್ನು ಶಿರಸ್ಸಿಗೆ ಹಾಗೂ ಪಾದಗಳಿಗೆ ಪ್ರೋಕ್ಷಿಸುವುದರಿಂದ ಶರೀರ ಮತ್ತು ಪ್ರಾಣ ಶುದ್ಧಿಯಾಗುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Sprinkle drops of sacred water on the crown and heart to invoke the healing cosmic waters.",
        approxSeconds: 30
      },
      {
        step: 4,
        titleKn: "೪. ಸೂರ್ಯಾರ್ಘ್ಯ ಪ್ರದಾನ (೩ ಬಾರಿ)",
        titleEn: "4. Suryarghya Pradana (Offering 3 Arghyas)",
        actionCueKn: "☀️ ಎದ್ದು ನಿಂತು ಕೈಜೋಡಿಸಿ ಸೂರ್ಯನಾರಾಯಣನಿಗೆ ೩ ಬಾರಿ ಅರ್ಘ್ಯ ಅರ್ಪಿಸಿ",
        actionCueEn: "☀️ Stand facing Sun and offer 3 palms of water to Lord Surya",
        icon: "☀️",
        visualEffect: "arghya",
        mantraSanskrit: "ॐ भूर्भुवस्सुवः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥ श्री सूर्यनारायणाय इदमर्घ्यं समर्पयामि। प्रथमोऽर्घ्यः, द्वितीयोऽर्घ्यः, तृतीयोऽर्घ्यः॥",
        mantraL5: {
          kn: "ಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ । ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ ಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್ ॥\nಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣಾಯ ಇದಮರ್ಘ್ಯಂ ಸಮರ್ಪಯಾಮಿ ॥ (ಮೂರು ಬಾರಿ)",
          hi: "ॐ भूर्भुवस्सुवः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥\nश्री सूर्यनारायणाय इदमर्घ्यं समर्पयामि॥ (तीन बार)",
          te: "ఓం భూర్భුවస్సువః। తత్సవితుర్వరేణ్యం భర్గో దేవస్య ధీమహి ధియో యో నః ప్రచోదయాత్॥\nశ్రీ సూర్యనారాయణాయ ఇదమర్ఘ్యం సమర్పయామి॥ (మూడుసార్లు)",
          ta: "ஓம் பூர்புவஸ்ஸுவஃ। தத்ஸவிதுர்வரேண்யம் பர்கோ தேவஸ்ய தீமஹி தியோ யோ நஃ ப்ரசோதயாத்॥\nஸ்ரீ சூர்யநாராயணாய இதமர்க்யம் ஸமர்பயாமி॥ (மூன்று முறை)",
          en: "Om Bhur Bhuvas Suvah | Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat ||\nShri Suryanarayanaya Idam Arghyam Samarpayami || (Three times)"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಈಗ ಎದ್ದು ನಿಲ್ಲಿ. ಎರಡೂ ಕೈಗಳನ್ನು ಜೋಡಿಸಿ ಅಂಜಲಿ ಬದ್ಧರಾಗಿ. ಸೂರ್ಯದೇವನಿಗೆ ಗಾಯತ್ರೀ ಮಂತ್ರದಿಂದ ಮೂರು ಬಾರಿ ಅರ್ಘ್ಯ ಜಲವನ್ನು ಹರಿವಾಣಕ್ಕೆ ಅರ್ಪಿಸಿ.",
            outro: "ಸೂರ್ಯನಾರಾಯಣನಿಗೆ ನಮಸ್ಕರಿಸಿ ಕುಳಿತುಕೊಳ್ಳಿ."
          },
          en: {
            intro: "Now stand up. Cup both hands together and offer sacred Arghya water to Lord Suryanarayana three times with the Gayatri hymn.",
            outro: "Bow to the Sun Lord and be seated."
          },
          te: {
            intro: "ఇప్పుడు లేచి నిలబడండి. రెండు చేతులు జోడించి సూర్యభగవానునికి గాయత్రీ మంత్రంతో మూడుసార్లు అర్ఘ్య జలాన్ని సమర్పించండి.",
            outro: "సూర్యనారాయణునికి నమస్కరించి కూర్చోండి."
          },
          ta: {
            intro: "இப்போது எழுந்து நில்லுங்கள். இரு கைகளையும் குவித்து சூரிய பகவானுக்கு காயத்ரி மந்திரத்துடன் மூன்று முறை அர்க்ய நீரை அர்ப்பணியுங்கள்.",
            outro: "சூரிய நாராயணனை வணங்கி அமருங்கள்."
          },
          hi: {
            intro: "अब खड़े हों। दोनों हाथों को अंजलिबद्ध कर सूर्यदेव को गायत्री मंत्र से तीन बार अर्घ्य जल समर्पित करें।",
            outro: "सूर्यनारायण को नमन कर बैठें।"
          }
        },
        spokenPriestGuidance: "ಈಗ ಎದ್ದು ನಿಲ್ಲಿ. ಎರಡೂ ಕೈಗಳನ್ನು ಜೋಡಿಸಿ ಅಂಜಲಿ ಬದ್ಧರಾಗಿ. ಸೂರ್ಯದೇವನಿಗೆ ಗಾಯತ್ರೀ ಮಂತ್ರದಿಂದ ಮೂರು ಬಾರಿ ಅರ್ಘ್ಯ ಜಲವನ್ನು ಹರಿವಾಣಕ್ಕೆ ಅರ್ಪಿಸಿ. ॐ भूर्भुवस्सुवः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥ श्री सूर्यनारायणाय इदमर्घ्यं समर्पयामि। प्रथमोऽर्घ्यः, द्वितीयोऽर्घ्यः, तृतीयोऽर्घ्यः॥ ಸೂರ್ಯನಾರಾಯಣನಿಗೆ ನಮಸ್ಕರಿಸಿ ಕುಳಿತುಕೊಳ್ಳಿ.",
        hiddenPriestInstructionKn: "ಸೂರ್ಯಾರ್ಘ್ಯವನ್ನು ನಿಂತುಕೊಂಡು ಎರಡೂ ಹಸ್ತಗಳಿಂದ ಎದೆಮಟ್ಟಕ್ಕೆ ಎತ್ತಿ ಬೆರಳುಗಳ ಸಂದುಗಳಿಂದ ನೀರು ಹರಿಯುವಂತೆ ಅರ್ಪಿಸಬೇಕು. ಇದು ಜನ್ಮ ಜನ್ಮಾಂತರಗಳ ಪಾಪಗಳನ್ನು ನಿವಾರಿಸುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Stand up facing East/Sun, hold water in cupped hands at heart level, and let it stream into the vessel with Gayatri mantra 3 times.",
        approxSeconds: 35
      },
      {
        step: 5,
        titleKn: "೫. ಗಾಯತ್ರೀ ಆವಾಹನ",
        titleEn: "5. Gayatri Avahana (Invocation of Divine Mother)",
        actionCueKn: "🪷 ಕೈಮುಗಿದು ಗಾಯತ್ರೀ ದೇವಿಯನ್ನು ಹೃತ್ಕಮಲದಲ್ಲಿ ಆವಾಹಿಸಿ",
        actionCueEn: "🪷 Fold hands and welcome Mother Gayatri into your spiritual heart",
        icon: "🪷",
        visualEffect: "namaskara",
        mantraSanskrit: "तेजोऽसि भ्राजोऽस्यमृतमसि धामनामासि विश्वमसि विश्वायुः सर्वमसि सर्वायुः अभिभूरोम्। गायत्रीमावाहयामि सावित्रीमावाहयामि सरस्वतीमावाहयामि॥ ॐ आयातु वरदा देवी अक्षरं ब्रह्म सम्मितम्। गायत्रीं छन्दसां मातेदं ब्रह्म जुषस्व मे॥",
        mantraL5: {
          kn: "ತೇಜೋಽಸಿ ಭ್ರೋಜೋಽಸ್ಯಮೃತಮಸಿ ಧಾಮನಾಮಾಸಿ ವಿಶ್ವಮಸಿ ವಿಶ್ವಾಬುರಭಿಭೂರೋಮ್ ।\nಗಾಯತ್ರೀಮಾವಾಹಯಾಮಿ ಸಾವಿತ್ರೀಮಾವಾಹಯಾಮಿ ಸರಸ್ವತೀಮಾವಾಹಯಾಮಿ ॥\nಓಂ ಆಯಾತು ವರದಾ ದೇವೀ ಅಕ್ಷರಂ ಬ್ರಹ್ಮ ಸಮ್ಮಿತಮ್ । ಗಾಯತ್ರೀಂ ಛಂದಸಾಂ ಮಾತೇದಂ ಬ್ರಹ್ಮ ಜುಷಸ್ವ ಮೇ ॥",
          hi: "तेजोऽसि भ्राजोऽस्यमृतमसि धामनामासि विश्वमसि विश्वायुः सर्वमसि सर्वायुः अभिभूरोम्।\nगायत्रीमावाहयामि सावित्रीमावाहयामि सरस्वतीमावाहयामि॥\nॐ आयातु वरदा देवी अक्षरं ब्रह्म सम्मितम्। गायत्रीं छन्दसां मातेदं ब्रह्म जुषस्व मे॥",
          te: "తేజోಽసి భ్రోజోಽస్యమృతమసి ధామనామాసి విశ్వమసి విశ్వాబురభిభూరోమ్।\nగాయత్రీమావాహయామి సావిత్రీమావాహయామి సరస్వతీమావాహయామి॥\nఓం ఆయాతు వరదా దేవీ అక్షరం బ్రహ్మ సమ్మితమ్। గాయత్రీం ఛందసాం మాతేదం బ్రహ్మ జుషస్వ మే॥",
          ta: "தேஜோऽஸி ப்ரோஜோऽஸ்யம்ருதமஸி தாமநாமாஸி விச்வமஸி விச்வாபுரபிபூரோம்।\nகாயத்ரீமாவாஹயாமி ஸாவித்ரீமாவாஹயாமி ஸரஸ்வதீமாவாஹயாமி॥\nஓம் ஆயாது வரதா தேவீ அக்ஷரம் ப்ரம்ஹ ஸம்மிதம்। காயத்ரீம் சந்தஸாம் மாதேதம் ப்ரம்ஹ ஜுஷஸ்வ மே॥",
          en: "Tejosi Bhrajosi Amritamasi Dhamanamasi Vishvamasi Vishvayuh Sarvamasi Sarvayuh Abhibhurom |\nGayatri Mavahayami Savitri Mavahayami Saraswati Mavahayami ||\nOm Ayatu Varada Devi Aksharam Brahma Sammitam | Gayatri Chhandasam Matedam Brahma Jushasva Me ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಕೈಮುಗಿದು ಗಾಯತ್ರೀ ದೇವಿಯನ್ನು ಹೃತ್ಕಮಲದಲ್ಲಿ ಆವಾಹನೆ ಮಾಡಿ.",
            outro: "ಜಗದಂಬೆಯ ಅನುಗ್ರಹವನ್ನು ಭಕ್ತಿಯಿಂದ ಪ್ರಾರ್ಥಿಸಿ."
          },
          en: {
            intro: "Fold your hands and invoke Divine Mother Gayatri into the lotus of your heart.",
            outro: "Pray for the supreme blessings of the Mother of Vedas."
          },
          te: {
            intro: "చేతులు జోడించి గాయత్రీ దేవిని హృదయ కమలంలోకి ఆవాహన చేయండి.",
            outro: "జగన్మాత అనుగ్రహాన్ని భక్తితో ప్రార్థించండి."
          },
          ta: {
            intro: "கைகளைக் குவித்து காயத்ரி தேவியை இதயத் தாமரையில் ஆவாஹனம் செய்யுங்கள்.",
            outro: "வேத மாதாவின் அருளை பக்தியுடன் பிரார்த்தியுங்கள்."
          },
          hi: {
            intro: "हाथ जोड़कर भगवती गायत्री को अपने हृदय कमल में आवाह्न करें।",
            outro: "वेदमाता की कृपा की प्रार्थना करें।"
          }
        },
        spokenPriestGuidance: "ಕೈಮುಗಿದು ಗಾಯತ್ರೀ ದೇವಿಯನ್ನು ಹೃತ್ಕಮಲದಲ್ಲಿ ಆವಾಹನೆ ಮಾಡಿ. तेजोऽसि भ्राजोऽस्यमृतमसि धामनामासि विश्वमसि विश्वायुः सर्वमसि सर्वायुः अभिभूरोम्। गायत्रीमावाहयामि सावित्रीमावाहयामि सरस्वतीमावाहयामि॥ ॐ आयातु वरदा देवी अक्षरं ब्रह्म सम्मितम्। गायत्रीं छन्दसां मातेदं ब्रह्म जुषस्व मे॥ ಜಗದಂಬೆಯ ಅನುಗ್ರಹವನ್ನು ಭಕ್ತಿಯಿಂದ ಪ್ರಾರ್ಥಿಸಿ.",
        hiddenPriestInstructionKn: "ವೇದಮಾತೆಯಾದ ಗಾಯತ್ರಿಯನ್ನು, ಸಾವಿತ್ರಿಯನ್ನು, ಸರಸ್ವತಿಯನ್ನು ಹೃದಯದಲ್ಲಿ ಪ್ರತಿಷ್ಠಾಪಿಸಿ ಜಪಕ್ಕೆ ಸಿದ್ಧರಾಗಬೇಕು.",
        hiddenPriestInstructionEn: "Invoke Mother Gayatri with folded hands, focusing devotion upon the heart lotus.",
        approxSeconds: 30
      },
      {
        step: 6,
        titleKn: "೬. ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರ ಜಪ (೨೮ ಬಾರಿ / ೧೦೮ ಬಾರಿ)",
        titleEn: "6. Gayatri Mahamantra Japa (28 / 108 Times)",
        actionCueKn: "📿 ಅಂಗುಲಿ ಪರ್ವಗಳಲ್ಲಿ ಅಥವಾ ಜಪಮಾಲೆಯಲ್ಲಿ ೨೮ ಬಾರಿ / ೧೦೮ ಬಾರಿ ಜಪಿಸಿ",
        actionCueEn: "📿 Chant 28 or 108 times with focus on the solar intellect",
        icon: "📿",
        visualEffect: "japa",
        japaTarget: 28,
        japaMantra: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
        mantraSanskrit: "ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥",
        mantraL5: {
          kn: "ಓಂ ಭೂರ್ಭುವಃ ಸುವಃ ।\nತತ್ ಸವಿತುರ್ ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ ।\nಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್ ॥\n(೨೮ ಬಾರಿ ಅಥವಾ ೧೦೮ ಬಾರಿ ಜಪ)",
          hi: "ॐ भूर्भुवः स्वः।\nतत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि।\nधियो यो नः प्रचोदयात्॥\n(२८ बार अथवा १०८ बार जप)",
          te: "ఓం భూర్భువః సువః।\nతత్ సవితుర్ వరేణ్యం భర్గో దేవస్య ధీమహి।\nధియో యో నః ప్రచోదయాత్॥\n(28 సార్లు లేదా 108 సార్లు జపం)",
          ta: "ஓம் பூர்புவஃ ஸுவஃ।\nதத் ஸவிதுர் வரேண்யம் பர்கோ தேவஸ்ய தீமஹி।\nதியோ யோ நஃ ப்ரசோதயாத்॥\n(28 முறை அல்லது 108 முறை ஜபம்)",
          en: "Om Bhur Bhuvah Suvah |\nTat Savitur Varenyam Bhargo Devasya Dhimahi |\nDhiyo Yo Nah Prachodayat ||\n(Chant 28 or 108 Times)"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಈಗ ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರದ ಜಪವನ್ನು ಕೈಗೊಳ್ಳೋಣ. ಮನಸ್ಸನ್ನು ಶಾಂತಗೊಳಿಸಿ, ಸೂರ್ಯಮಂಡಲ ಮಧ್ಯವರ್ತಿಯಾದ ಶ್ರೀಮನ್ನಾರಾಯಣನನ್ನು ಧ್ಯಾನಿಸಿ. ಇಪ್ಪತ್ತೆಂಟು ಬಾರಿ ಅಥವಾ ನೂರಎಂಟು ಬಾರಿ ಏಕಾಗ್ರತೆಯಿಂದ ಜಪಿಸಿ.",
            outro: "ನಿಮ್ಮ ಬುದ್ಧಿ ಸದಾ ತೇಜಸ್ವಿಯಾಗಿರಲಿ."
          },
          en: {
            intro: "Now let us undertake the sacred Gayatri Japa. Quiet your mind and meditate upon Lord Narayana within the solar disc. Chant 28 or 108 times with single-pointed focus.",
            outro: "May divine solar wisdom illumine your intellect forever."
          },
          te: {
            intro: "ఇప్పుడు గాయత్రీ మహామంత్ర జపం చేద్దాం. మనస్సును ప్రశాంతంగా ఉంచి, సూర్యమండల మధ్యవర్తియైన లక్ష్మీనారాయణుని ధ్యానించండి. 28 సార్లు లేదా 108 సార్లు ఏకాగ్రతతో జపించండి.",
            outro: "మీ బుద్ధి తేజోవంతమగుగాక."
          },
          ta: {
            intro: "இப்போது காயத்ரி மகா மந்திர ஜபத்தை மேற்கொள்வோம். மனதை அமைதிப்படுத்தி, சூரிய மண்டல மத்தியில் உறையும் ஸ்ரீமன் நாராயணனைத் தியானியுங்கள். 28 முறை அல்லது 108 முறை ஏகாக்கிர சித்தத்துடன் ஜபியுங்கள்.",
            outro: "உங்கள் புத்தி எப்போதும் பிரகாசிக்கட்டும்."
          },
          hi: {
            intro: "अब गायत्री महामंत्र का जप करें। मन को शांत कर, सूर्यमंडल मध्यवर्ती श्रीमन्नारायण का ध्यान करें। अट्ठाईस या एक सौ आठ बार एकाग्रता से जप करें।",
            outro: "आपकी बुद्धि सदैव तेजस्वी रहे।"
          }
        },
        spokenPriestGuidance: "ಈಗ ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರದ ಜಪವನ್ನು ಕೈಗೊಳ್ಳೋಣ. ಮನಸ್ಸನ್ನು ಶಾಂತಗೊಳಿಸಿ, ಸೂರ್ಯಮಂಡಲ ಮಧ್ಯವರ್ತಿಯಾದ ಶ್ರೀಮನ್ನಾರಾಯಣನನ್ನು ಧ್ಯಾನಿಸಿ. ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥ ಈ ಮಹಾಮಂತ್ರವನ್ನು ಇಪ್ಪತ್ತೆಂಟು ಬಾರಿ ಅಥವಾ ನೂರಎಂಟು ಬಾರಿ ಏಕಾಗ್ರತೆಯಿಂದ ಜಪಿಸಿ. ನಿಮ್ಮ ಬುದ್ಧಿ ತೇಜಸ್ವಿಯಾಗಲಿ.",
        hiddenPriestInstructionKn: "ಗಾಯತ್ರೀ ಜಪವನ್ನು ಕನಿಷ್ಠ ೨೮ ಬಾರಿ ಅಥವಾ ಶಕ್ತಾನುಸಾರ ೧೦೮ ಬಾರಿ ಜಪಿಸಬೇಕು. ಜಪಮಾಲೆಯನ್ನು ವಸ್ತ್ರದಿಂದ ಮುಚ್ಚಿ, ತುಟಿಗಳನ್ನು ಅಲುಗಾಡಿಸದೆ ಮಾನಸಿಕವಾಗಿ ಜಪಿಸುವುದು ಅತ್ಯುತ್ತಮ.",
        hiddenPriestInstructionEn: "Chant the supreme Gayatri mantra 28 times (minimum) or 108 times using finger marks or sacred mala, meditating on divine wisdom.",
        approxSeconds: 60
      },
      {
        step: 7,
        titleKn: "೭. ಸೂರ್ಯೋಪಸ್ಥಾನ & ದಿಗ್ವಂದನೆ",
        titleEn: "7. Suryopasthana & Digvandane (Sun Reverence)",
        actionCueKn: "🌅 ಎದ್ದು ನಿಂತು ಸೂರ್ಯನಿಗೆ ಕೈಮುಗಿದು ನಾಲ್ಕೂ ದಿಕ್ಕುಗಳಿಗೆ ನಮಸ್ಕರಿಸಿ",
        actionCueEn: "🌅 Stand up, face Sun, and offer reverence to all 4 cardinal directions",
        icon: "🌅",
        visualEffect: "namaskara",
        mantraSanskrit: "मित्रस्य चर्षणीधृतः श्रवो देवस्य सानसिम्। सत्यं चित्रश्रवस्तमम्॥ उदुत्यं जातवेदसं देवं वहन्ति केतवः। दृशे विश्वाय सूर्यम्॥",
        mantraSanskritPart2: "ॐ नमः प्राच्यै दिशे। ॐ नमः दक्षिणायै दिशे। ॐ नमः प्रतीच्यै दिशे। ॐ नमः उदीच्यै दिशे॥",
        mantraL5: {
          kn: "ಮಿತ್ರಸ್ಯ ಚರ್ಷಣೀಧೃತಃ ಶ್ರವೋ ದೇವಸ್ಯ ಸಾನಸಿಮ್ । ಸತ್ಯಂ ಚಿತ್ರಶ್ರವಸ್ತಮಮ್ ॥\nಉದುತ್ಯಂ ಜಾತವೇದಸಂ ದೇವಂ ವಹಂತಿ ಕೇತವಃ । ದೃಶೇ ವಿಶ್ವಾಯ ಸೂರ್ಯಮ್ ॥\nಓಂ ನಮಃ ಪ್ರಾಚ್ಯೈ ದಿಶೇ । ಓಂ ನಮಃ ದಕ್ಷಿಣಾಯೈ ದಿಶೇ । ಓಂ ನಮಃ ಪ್ರತೀಚ್ಯೈ ದಿಶೇ । ಓಂ ನಮಃ ಉದೀಚ್ಯೈ ದಿಶೇ ॥",
          hi: "मित्रस्य चर्षणीधृतः श्रवो देवस्य सानसिम्। सत्यं चित्रश्रवस्तमम्॥\nउदुत्यं जातवेदसं देवं वहन्ति केतवः। दृशे विश्वाय सूर्यम्॥\nॐ नमः प्राच्यै दिशे। ॐ नमः दक्षिणायै दिशे। ॐ नमः प्रतीच्यै दिशे। ॐ नमः उदीच्यै दिशे॥",
          te: "మిత్రస్య చర్షణీధృతః శ్రవో దేవస్య సానసిమ్। సత్యం చిత్రశ్రవస్తమమ్॥\nఉదుత్యం జాతవేదసం దేవం వహంతి కేతవః। దృశే విశ్వాయ సూర్యమ్॥\nఓం నమః ప్రాచ్యై దిశే। ఓం నమః దక్షిణాయై దిశే। ఓం నమః ప్రతీచ్యై దిశే। ఓం నమః ఉదీచ్యై దిశే॥",
          ta: "மித்ரஸ்ய சர்ஷணீத்ருதஃ ச்ரவோ தேவஸ்ய ஸானஸிம்। ஸத்யம் சித்ரச்ரவஸ்தமம்॥\nஉதுத்யம் ஜாதவேதஸம் தேவம் வஹந்தி கேதவஃ। த்ருசே விச்வாய சூர்யம்॥\nஓம் நமஃ ப்ராச்யை திசே। ஓம் நமஃ தக்ஷிணாயை திசே। ஓம் நமஃ ப்ரதீச்யை திசே। ஓம் நமஃ உதீச்யை திசே॥",
          en: "Mitrasya Charshanidhritah Shravo Devasya Sanasim | Satyam Chitrasravastamam ||\nUdutyam Jatavedasam Devam Vahanti Ketavah | Drishe Vishvaya Suryam ||\nOm Namah Prachyai Dishe | Om Namah Dakshinayai Dishe | Om Namah Pratichyai Dishe | Om Namah Udichyai Dishe ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಎದ್ದು ನಿಲ್ಲಿ. ಸೂರ್ಯದೇವರಿಗೆ ನಮಸ್ಕರಿಸಿ ಉಪಸ್ಥಾನ ಮಂತ್ರವನ್ನು ಹೇಳಿ.",
            mid: "ಈಗ ಪೂರ್ವ, ದಕ್ಷಿಣ, ಪಶ್ಚಿಮ, ಉತ್ತರ ನಾಲ್ಕೂ ದಿಕ್ಕುಗಳ ದೇವತೆಗಳಿಗೆ ಕೈಮುಗಿದು ಪ್ರಾರ್ಥಿಸಿ.",
            outro: "ದಿಕ್ಪಾಲಕರು ನಿಮಗೆ ಸರ್ವದಾ ರಕ್ಷಣೆ ನೀಡಲಿ."
          },
          en: {
            intro: "Stand tall. Offer reverential praise to Lord Surya with the Upasthana hymn.",
            mid: "Now bow and offer salutations to the divine guardians of the East, South, West, and North.",
            outro: "May the cosmic regents protect you on all sides."
          },
          te: {
            intro: "లేచి నిలబడండి. సూర్యభగవానునికి నమస్కరిస్తూ ఉపస్థాన మంత్రం పఠించండి.",
            mid: "ఇప్పుడు తూర్పు, దక్షిణ, పశ్చిమ, ఉత్తర నాలుగు దిక్కుల దేవతలకు నమస్కరించండి.",
            outro: "దిక్పాలకులు మీకు సర్వదా రక్షణ కల్పింతురుగాక."
          },
          ta: {
            intro: "எழுந்து நில்லுங்கள். சூரிய பகவானை வணங்கி உபஸ்தான மந்திரத்தைக் கூறுங்கள்.",
            mid: "இப்போது கிழக்கு, தெற்கு, மேற்கு, வடக்கு ஆகிய நான்கு திசைக் காவலர்களுக்கும் வணக்கம் செலுத்துங்கள்.",
            outro: "திக்கு பாலகர்கள் உங்களை எப்போதும் காக்கட்டும்."
          },
          hi: {
            intro: "खड़े हों। भगवान सूर्य को नमन करते हुए उपस्थान मंत्र बोलें।",
            mid: "अब पूर्व, दक्षिण, पश्चिम और उत्तर चारों दिशाओं के देवों को नमन करें।",
            outro: "दिक्पाल सदैव आपकी रक्षा करें।"
          }
        },
        spokenPriestGuidance: "ಎದ್ದು ನಿಲ್ಲಿ. ಸೂರ್ಯದೇವರಿಗೆ ನಮಸ್ಕರಿಸಿ ಉಪಸ್ಥಾನ ಮಂತ್ರವನ್ನು ಹೇಳಿ. मित्रस्य चर्षणीधृतः श्रवो देवस्य सानसिम्। सत्यं चित्रश्रवस्तमम्॥ उदुत्यं जातवेदसं देवं वहन्ति केतवः। दृशे विश्वाय सूर्यम्॥ ಈಗ ಪೂರ್ವ, ದಕ್ಷಿಣ, ಪಶ್ಚಿಮ, ಉತ್ತರ ನಾಲ್ಕೂ ದಿಕ್ಕುಗಳ ದೇವತೆಗಳಿಗೆ ಕೈಮುಗಿದು ಪ್ರಾರ್ಥಿಸಿ. ॐ नमः प्राच्यै दिशे। ॐ नमः दक्षिणायै दिशे। ॐ नमः प्रतीच्यै दिशे। ॐ नमः उदीच्यै दिशे॥ ದಿಕ್ಪಾಲಕರು ನಿಮಗೆ ಸರ್ವದಾ ರಕ್ಷಣೆ ನೀಡಲಿ.",
        hiddenPriestInstructionKn: "ಸೂರ್ಯೋಪಸ್ಥಾನ ಮಂತ್ರದಿಂದ ಸೂರ್ಯನ ಅನುಗ್ರಹ ಮತ್ತು ನಾಲ್ಕು ದಿಕ್ಕುಗಳ ದಿಕ್ಪಾಲಕರ ರಕ್ಷಣೆ ಲಭಿಸುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Stand tall facing the Sun, chant the sacred Vedic hymns of praise, and bow to the divine guardians of the four quarters.",
        approxSeconds: 35
      },
      {
        step: 8,
        titleKn: "೮. ಸಮರ್ಪಣ & ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ",
        titleEn: "8. Narayana Samarpanam & Prostration",
        actionCueKn: "🙏 ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ · ಸಮಸ್ತ ಕರ್ಮಗಳನ್ನು ಭಗವಂತನಿಗೆ ಅರ್ಪಿಸಿ",
        actionCueEn: "🙏 Prostrate with devotion and dedicate all merits to Lord Narayana",
        icon: "🙏",
        visualEffect: "namaskara",
        mantraSanskrit: "कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात्। करोमि यद्यत्सकलं परस्मै नारायणायेति समर्पयामि॥ अनेन सन्ध्यावन्दनेन भगवान् श्री लक्ष्मीनारायणः प्रीयतां सुप्रीतो वरदो भवतु॥",
        mantraL5: {
          kn: "ಕಾಯೇನ ವಾಚಾ ಮನಸೇಂದ್ರಿಯೈರ್ವಾ ಬುದ್ಧ್ಯಾತ್ಮನಾ ವಾ ಪ್ರಕೃತೇಃ ಸ್ವಭಾವಾತ್ ।\nಕರೋಮಿ ಯದ್ಯತ್ಸಕಲಂ ಪರಸ್ಮೈ ನಾರಾಯಣಾಯೇತಿ ಸಮರ್ಪಯಾಮಿ ॥\nಅನೇನ ಪ್ರಾತಃ/ಸಾಯಂ ಸಂಧ್ಯಾವಂದನೇನ ಭಗವಾನ್ ಶ್ರೀ ಲಕ್ಷ್ಮೀನಾರಾಯಣಃ ಪ್ರೀಯತಾಂ ಸುಪ್ರೀತೋ ವರದೋ ಭವತು ॥",
          hi: "कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात्।\nकरोमि यद्यत्सकलं परस्मै नारायणायेति समर्पयामि॥\nअनेन सन्ध्यावन्दनेन भगवान् श्री लक्ष्मीनारायणः प्रीयतां सुप्रीतो वरदो भवतु॥",
          te: "కాయేన వాచా మనసేంద్రియైర్వా బుద్ధ్యాత్మనా వా ప్రకృతేః స్వభావాత్।\nకరోమి యద్యత్సకలం పరస్మై నారాయణాయేతి సమర్పయామి॥\nఅనేన సంధ్యావందనేన భగవాన్ శ్రీ లక్ష్మీనారాయణః ప్రీయతాం సుప్రీతో వరదో భవతు॥",
          ta: "காயேன வாசா மனஸேந்த்ரியைர்வா புத்யாத்மனா வா ப்ரக்ருதேஃ ஸ்வபாவாத்।\nகரோமி யத்யத்ஸகலம் பரஸ்மை நாராயணாயேதி ஸமர்பயாமி॥\nஅனேன ஸந்த்யாவந்தனேன பகவான் ஸ்ரீ லக்ஷ்மீநாராயணஃ ப்ரீயதாம் ஸுப்ரீதோ வரதோ பவது॥",
          en: "Kayena Vacha Manasendriyairva Buddhyatmana Va Prakriteh Svabhavat |\nKaromi Yad Yat Sakalam Parasmai Narayanayeti Samarpayami ||\nAnena Sandhyavandanena Bhagavan Shri Lakshmi Narayanah Priyatam Suprito Varado Bhavatu ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ. ಸಂಧ್ಯಾವಂದನೆಯ ಸಮಸ್ತ ಪುಣ್ಯ ಫಲಗಳನ್ನು ಪರಮಾತ್ಮನಿಗೆ ಅರ್ಪಿಸಿ.",
            outro: "ನಿಮ್ಮ ಸಂಧ್ಯಾವಂದನೆಯು ಸಂಪೂರ್ಣವಾಗಿ ಸಂಪನ್ನವಾಯಿತು. ಹರಿ ಓಂ ತತ್ಸತ್."
          },
          en: {
            intro: "Perform full prostration. Surrender all merits of this Sandhyavandana to the Supreme Lord.",
            outro: "Your Sandhyavandana ritual is successfully completed. Hari Om Tat Sat."
          },
          te: {
            intro: "సాష్టాంగ నమస్కారం చేయండి. సంధ్యావందన పుణ్య ఫలాలన్నింటినీ భగవంతునికి సమర్పించండి.",
            outro: "మీ సంధ్యావందనం సంపూర్ణంగా ముగిసింది. హరి ఓం తత్సత్."
          },
          ta: {
            intro: "சாஷ்டாங்க நமஸ்காரம் செய்யுங்கள். சந்தியாவந்தனத்தின் புண்ணிய பலன்களை எல்லாம் இறைவனுக்கு அர்ப்பணியுங்கள்.",
            outro: "உங்கள் சந்தியாவந்தனம் இனிதே நிறைவடைந்தது. ஹரி ஓம் தத்ஸத்."
          },
          hi: {
            intro: "साष्टांग प्रणाम करें। संध्यावंदन के समस्त पुण्य फल परमात्मा को समर्पित करें।",
            outro: "आपका संध्यावंदन पूर्ण हुआ। हरि ॐ तत्सत्।"
          }
        },
        spokenPriestGuidance: "ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ. ಸಂಧ್ಯಾವಂದನೆಯ ಸಮಸ್ತ ಪುಣ್ಯ ಫಲಗಳನ್ನು ಪರಮಾತ್ಮನಿಗೆ ಅರ್ಪಿಸಿ. कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात्। करोमि यद्यत्सकलं परस्मै नारायणायेति समर्पयामि॥ अनेन सन्ध्यावन्दनेन भगवान् श्री लक्ष्मीनारायणः प्रीयतां सुप्रीतो वरदो भवतु॥ ನಿಮ್ಮ ಸಂಧ್ಯಾವಂದನೆಯು ಸಂಪೂರ್ಣವಾಗಿ ಸಂಪನ್ನವಾಯಿತು. ಹರಿ ಓಂ ತತ್ಸತ್.",
        hiddenPriestInstructionKn: "ಕೊನೆಯಲ್ಲಿ ಬಲ ಅಂಗೈಯಿಂದ ನೀರನ್ನು ಹರಿವಾಣಕ್ಕೆ ಸಮರ್ಪಿಸಿ ಕರ್ಮ ಸಮರ್ಪಣೆ ಮಾಡಬೇಕು. ಶ್ರೀ ಲಕ್ಷ್ಮೀನಾರಾಯಣನಿಗೆ ಪ್ರಣಾಮ ಸಲ್ಲಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Release water drops into the Harivana dedicating all spiritual fruits to the Supreme Lord Narayana.",
        approxSeconds: 30
      }
    ]
  },

  // =========================================================================
  // POOJA 2: ಪ್ರಾತಃಕಾಲ ನಿತ್ಯ ದೇವತಾ ಪೂಜಾ ವಿಧಿ (Morning Deva Pooja - 16 Upacharas)
  // =========================================================================
  morning_pooja: {
    key: "morning_pooja",
    titleKn: "ಪ್ರಾತಃಕಾಲ ನಿತ್ಯ ದೇವತಾ ಪೂಜಾ ವಿಧಿ",
    titleEn: "Morning Deva Pooja Vidhi (16 Upacharas)",
    subtitleKn: "ದೀಪ ಪ್ರಜ್ವಲನೆ, ಘಂಟಾನಾದ, ಕಳಶ ಪೂಜೆ, ಗಣಪತಿ ಧ್ಯಾನ, ಷೋಡಶೋಪಚಾರ ಹಾಗೂ ಕರ್ಪೂರಾರತಿ",
    subtitleEn: "Sacred Morning Home Deity Worship with 16 Classical Vedic Offerings",
    icon: "🪔",
    badgeTextKn: "ಷೋಡಶೋಪಚಾರ · ಗೃಹ ಪೂಜೆ",
    badgeTextEn: "16 Upacharas · Home Worship",
    colorScheme: {
      primary: "#D97706",
      border: "#F59E0B",
      badgeBg: "#FEF3C7",
      gradient: "from-amber-500 to-yellow-600"
    },
    steps: [
      {
        step: 1,
        titleKn: "೧. ದೀಪ ಪ್ರಜ್ವಲನೆ & ಶುದ್ಧಿ",
        titleEn: "1. Lighting the Sanctum Lamp",
        actionCueKn: "🪔 ದೇವರ ಮಂಟಪದಲ್ಲಿ ಶುದ್ಧ ತುಪ್ಪ/ಎಣ್ಣೆಯ ದೀಪ ಬೆಳಗಿಸಿ ನಮಸ್ಕರಿಸಿ",
        actionCueEn: "🪔 Light pure ghee/oil lamp before sanctum with reverence",
        icon: "🪔",
        visualEffect: "deepa",
        mantraSanskrit: "शुभं करोति कल्याणं आरोग्यं धनसंपदः। शत्रुबुद्धि विनाशाय दीपज्योतिर्नमोऽस्तु ते॥ दीपज्योतिः परब्रह्म दीपज्योतिर्जनार्दनः। दीपो हरतु मे पापं सन्ध्याज्योतिर्नमोऽस्तु ते॥",
        mantraL5: {
          kn: "ಶುಭಂ ಕರೋತಿ ಕಲ್ಯಾಣಂ ಆರೋಗ್ಯಂ ಧನಸಂಪದಃ । ಶತ್ರುಬುದ್ಧಿ ವಿನಾಶಾಯ ದೀಪಜ್ಯೋತಿರ್ನಮೋಸ್ತು ತೇ ॥\nದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ । ದೀಪೋ ಹರತು ಮೇ ಪಾಪಂ ಸಂಧ್ಯಾಜ್ಯೋತಿರ್ನಮೋಸ್ತು ತೇ ॥",
          hi: "शुभं करोति कल्याणं आरोग्यं धनसंपदः। शत्रुबुद्धि विनाशाय दीपज्योतिर्नमोऽस्तु ते॥\nदीपज्योतिः परब्रह्म दीपज्योतिर्जनार्दनः। दीपो हरतु मे पापं सन्ध्याज्योतिर्नमोऽस्तु ते॥",
          te: "శుభం కరోతి కల్యాణం ఆరోగ్యం ధనసంపదః। శత్రుబుద్ధి వినాశాయ దీపజ్యోతిర్నమోఽస్తు తే॥\nదీపజ్యోతిః పరబ్రహ్మ దీపజ్యోతిర్జనార్దనః। దీపో హరతు మే పాపం సంధ్యాజ్యోతిర్నమోఽస్తు తే॥",
          ta: "சுபம் கரோதி கல்யாணம் ஆரோக்யம் தனஸம்பதஃ। சத்ருபுத்தி விநாசாய தீபஜ்யோதிர்நமோஸ்து தே॥\nதீபஜ்யோதிஃ பரப்ரம்ஹ தீபஜ்யோதிர்ஜனார்தனஃ। தீபோ ஹரது மே பாபம் ஸந்த்யாஜ்யோதிர்நமோஸ்து தே॥",
          en: "Shubham Karoti Kalyanam Arogyam Dhana Sampadah | Shatru Buddhi Vinashaya Deepajyotir Namostu Te ||\nDeepajyotih Parabrahma Deepajyotir Janardanah | Deepo Haratu Me Papam Sandhyajyotir Namostu Te ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಹರಿ ಓಂ. ಮುಂಜಾನೆಯ ಪವಿತ್ರ ದೇವತಾ ಪೂಜೆಗೆ ಸುಸ್ವಾಗತ. ದೇವರ ಮಂಟಪದಲ್ಲಿ ಶುದ್ಧ ತುಪ್ಪ ಅಥವಾ ಎಳ್ಳೆಣ್ಣೆಯ ದೀಪವನ್ನು ಭಕ್ತಿಯಿಂದ ಬೆಳಗಿಸಿ.",
            outro: "ಜ್ಞಾನಜ್ಯೋತಿಯು ಮನೆಯ ಅಂಧಕಾರವನ್ನು ಕಳೆದು ಸರ್ವ ಮಂಗಳವನ್ನು ತರಲಿ."
          },
          en: {
            intro: "Hari Om. Welcome to morning deity worship. Light a pure ghee or oil lamp before the sanctum altar with deep reverence.",
            outro: "May the divine flame dispel darkness and bring all-round auspiciousness."
          },
          te: {
            intro: "హరి ఓం. ఉదయపు పవిత్ర దేవతా పూజకు స్వాగతం. పూజా మందిరంలో ఆవునెయ్యి లేదా నువ్వుల నూనెతో దీపాన్ని వెలిగించండి.",
            outro: "జ్ఞానజ్యోతి చీకట్లను తొలగించి సర్వ శుభాలను కలిగించుగాక."
          },
          ta: {
            intro: "ஹரி ஓம். காலை வழிபாட்டிற்கு நல்வரவு. பூஜை அறையில் தூய நெய் அல்லது நல்லெண்ணெய் தீபத்தை பக்தியுடன் ஏற்றுங்கள்.",
            outro: "ஞான தீபம் இருளை நீக்கி மங்களத்தை அருளட்டும்."
          },
          hi: {
            intro: "हरि ॐ। प्रातःकालीन देव पूजा में आपका स्वागत है। पूजा मंदिर में शुद्ध घी या तेल का दीपक प्रज्वलित करें।",
            outro: "ज्ञान का प्रकाश घर के अंधकार को दूर कर सर्व मंगल करे।"
          }
        },
        spokenPriestGuidance: "ಹರಿ ಓಂ. ಮುಂಜಾನೆಯ ಪವಿತ್ರ ದೇವತಾ ಪೂಜೆಗೆ ಸುಸ್ವಾಗತ. ದೇವರ ಮಂಟಪದಲ್ಲಿ ಶುದ್ಧ ತುಪ್ಪ ಅಥವಾ ಎಳ್ಳೆಣ್ಣೆಯ ದೀಪವನ್ನು ಭಕ್ತಿಯಿಂದ ಬೆಳಗಿಸಿ. शुभं करोति कल्याणं आरोग्यं धनसंपदः। शत्रुबुद्धि विनाशाय दीपज्योतिर्नमोऽस्तु ते॥ दीपज्योतिः परब्रह्म दीपज्योतिर्जनार्दनः। दीपो हरतु मे पापं सन्ध्याज्योतिर्नमोऽस्तु ते॥ ಜ್ಞಾನಜ್ಯೋತಿಯು ಮನೆಯ ಅಂಧಕಾರವನ್ನು ಕಳೆದು ಸರ್ವ ಮಂಗಳವನ್ನು ತರಲಿ.",
        hiddenPriestInstructionKn: "ದೀಪಕ್ಕೆ ಅರಿಶಿಣ, ಕುಂಕುಮ, ಅಕ್ಷತೆ ಇಟ್ಟು, ಹತ್ತಿಯ ಬತ್ತಿಯಿಂದ ದೀಪವನ್ನು ಬೆಳಗಿಸಿ ನಮಸ್ಕರಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Apply Chandana, Kumkuma, and Akshata to the sacred brass lamp, light with reverence.",
        approxSeconds: 30
      },
      {
        step: 2,
        titleKn: "೨. ಘಂಟಾನಾದ & ಶಂಖ ಪೂಜೆ",
        titleEn: "2. Temple Bell Chime Invocation",
        actionCueKn: "🔔 ಲಯಬದ್ಧವಾಗಿ ಘಂಟೆಯನ್ನು ನುಡಿಸಿ ದೇವತಾ ಸಾನ್ನಿಧ್ಯ ಆಹ್ವಾನಿಸಿ",
        actionCueEn: "🔔 Ring the pooja bell with rhythmic chime to invite deities",
        icon: "🔔",
        visualEffect: "bell",
        mantraSanskrit: "आगमार्थं तु देवानां गमनार्थं तु राक्षसाम्। कुर्वे घण्टारवं तत्र देवताह्वान लक्षणम्॥",
        mantraL5: {
          kn: "ಆಗಮಾರ್ಥಂ ತು ದೇವಾನಾಂ ಗಮನಾರ್ಥಂ ತು ರಾಕ್ಷಸಾಮ್ ।\nಕುರ್ವೇ ಘಂಟಾರವಂ ತತ್ರ ದೇವತಾಹ್ವಾನ ಲಕ್ಷಣಮ್ ॥",
          hi: "आगमार्थं तु देवानां गमनार्थं तु राक्षसाम्।\nकुर्वे घण्टारवं तत्र देवताह्वान लक्षणम्॥",
          te: "ఆగమార్థం తు దేవానాం గమనార్థం తు రాక్షసామ్।\nకుర్వే ఘంటారవం తత్ర దేవతాహ్వాన లక్షణమ్॥",
          ta: "ஆகமார்த்தம் து தேவானாம் கவனார்த்தம் து ராக்ஷஸாம்।\nகுர்வே கண்டாரவம் தத்ர தேவதாஹ்வான லக்ஷணம்॥",
          en: "Agamartham Tu Devanam Gamanartham Tu Rakshasam |\nKurve Ghantaravam Tatra Devatahvana Lakshanam ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ದೇವತಾ ಸಾನ್ನಿಧ್ಯವನ್ನು ಆಹ್ವಾನಿಸಲು ಹಾಗೂ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳನ್ನು ನಿವಾರಿಸಲು ಘಂಟೆಯನ್ನು ಭಕ್ತಿಯಿಂದ ನುಡಿಸಿ.",
            outro: "ಓಂಕಾರ ನಾದವು ನಿಮ್ಮ ಮನೆಯನ್ನು ಶುದ್ಧೀಕರಿಸಲಿ."
          },
          en: {
            intro: "Ring the puja bell to invite divine celestial presence and dispel negative vibrations.",
            outro: "May the sacred Omkara resonance sanctify your household."
          },
          te: {
            intro: "దేవతల సాన్నిధ్యాన్ని ఆహ్వానించడానికి, ప్రతికూల శక్తులను పారద్రోలడానికి గంటను మ్రోగించండి.",
            outro: "ఓంకార నాదం మీ ఇంటిని పవిత్రం చేయుగాక."
          },
          ta: {
            intro: "தெய்வ சாந்நித்தியத்தை அழைக்கவும், எதிர்மறை ஆற்றல்களை நீக்கவும் மணியை பக்தியுடன் ஒலியுங்கள்.",
            outro: "ஓம் எனும் நாதம் உங்கள் இல்லத்தைத் தூய்மையாக்கட்டும்."
          },
          hi: {
            intro: "देवताओं के आगमन तथा नकारात्मक ऊर्जा के निवारण हेतु घंटी बजाएं।",
            outro: "ॐकार की ध्वनि आपके घर को पवित्र करे।"
          }
        },
        spokenPriestGuidance: "ದೇವತಾ ಸಾನ್ನಿಧ್ಯವನ್ನು ಆಹ್ವಾನಿಸಲು ಹಾಗೂ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳನ್ನು ನಿವಾರಿಸಲು ಘಂಟೆಯನ್ನು ಭಕ್ತಿಯಿಂದ ನುಡಿಸಿ. आगमार्थं तु देवानां गमनार्थं तु राक्षसाम्। कुर्वे घण्टारवं तत्र देवताह्वान लक्षणम्॥ ಓಂಕಾರ ನಾದವು ನಿಮ್ಮ ಮನೆಯನ್ನು ಶುದ್ಧೀಕರಿಸಲಿ.",
        hiddenPriestInstructionKn: "ಘಂಟಾನಾದವು ವಾತಾವರಣದಲ್ಲಿ ಪವಿತ್ರ ತರಂಗಗಳನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ. ಘಂಟೆಯನ್ನು ನುಡಿಸುತ್ತಾ ದೇವರಿಗೆ ನಮಸ್ಕರಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Ring the bronze bell softly, purifying the room with sacred Omkara resonance.",
        approxSeconds: 25
      },
      {
        step: 3,
        titleKn: "೩. ಕಳಶ ಪೂಜೆ (ಸಪ್ತನದಿ ಆವಾಹನೆ)",
        titleEn: "3. Kalasha Pooja (Seven Sacred Rivers)",
        actionCueKn: "🌊 ಪೂಜಾ ಪಾತ್ರೆಯ ನೀರಿಗೆ ಹೂವು-ಅಕ್ಷತೆ ಅರ್ಪಿಸಿ ಸಪ್ತನದಿಗಳನ್ನು ಪ್ರಾರ್ಥಿಸಿ",
        actionCueEn: "🌊 Touch water vessel with flowers & invoke the seven holy rivers",
        icon: "🌊",
        visualEffect: "kalasha",
        mantraSanskrit: "कलशस्य मुखे विष्णुः कण्ठे रुद्रः समाश्रितः। मूले तत्र स्थितो ब्रह्मा मध्ये मातृगणाः स्थिताः॥ गङ्गे च यमुने चैव गोदावरि सरस्वति। नर्मदे सिन्धु कावेरि जलेऽस्मिन् सन्निधिं कुरु॥",
        mantraL5: {
          kn: "ಕಲಶಸ್ಯ ಮುಖೇ ವಿಷ್ಣುಃ ಕಂಠೇ ರುದ್ರಃ ಸಮಾಶ್ರಿತಃ । ಮೂಲೇ ತತ್ರ ಸ್ಥಿತೋ ಬ್ರಹ್ಮಾ ಮಧ್ಯೇ ಮಾತೃಗಣಾಃ ಸ್ಥಿತಾಃ ॥\nಗಂಗೇ ಚ ಯಮುನೇ ಚೈವ ಗೋದಾವರಿ ಸರಸ್ವತಿ । ನರ್ಮದೇ ಸಿಂಧು ಕಾವೇರಿ ಜಲೇಽಸ್ಮಿನ್ ಸನ್ನಿಧಿಂ ಕುರು ॥",
          hi: "कलशस्य मुखे विष्णुः कण्ठे रुद्रः समाश्रितः। मूले तत्र स्थितो ब्रह्मा मध्ये मातृगणाः स्थिताः॥\nगङ्गे च यमुने चैव गोदावरि सरस्वति। नर्मदे सिन्धु कावेरि जलेऽस्मिन् सन्निधिं कुरु॥",
          te: "కలశస్య ముఖే విష్ణుః కంఠే రుద్రః సమాశ్రితః। మూలే తత్ర స్థితో బ్రహ్మా మధ్యే మాతృగణాః స్థితాః॥\nగంగే చ యమునే చైవ గోదావరి సరస్వతి। నర్మదే సింధు కావేరి జలేಽస్మిన్ సన్నిధిం కురు॥",
          ta: "கலசஸ்ய முகே விஷ்ணுஃ கண்டே ருத்ரஃ ஸமாச்ரிதஃ। மூலே தத்ர ஸ்திதோ ப்ரம்ஹா மத்யே மாத்ருகணாஃ ஸ்திதாஃ॥\nகங்கே ச யமுனே சைவ கோதாவரி ஸரஸ்வதி। நர்மதே ஸிந்து காவேரி ஜலேऽஸ்மின் ஸந்நிதிம் குரு॥",
          en: "Kalashasya Mukhe Vishnuh Kanthe Rudrah Samashritah | Mule Tatra Sthito Brahma Madhye Matriganah Sthitah ||\nGange Cha Yamune Chaiva Godavari Saraswati | Narmade Sindhu Kaveri Jalesmin Sannidhim Kuru ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಪೂಜಾ ಪಾತ್ರೆಯ ಜಲಕ್ಕೆ ಗಂಧ, ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಸಮರ್ಪಿಸಿ. ಸಪ್ತನದಿಗಳ ಪವಿತ್ರ ಸಾನ್ನಿಧ್ಯವನ್ನು ಆವಾಹನೆ ಮಾಡಿ.",
            outro: "ಈ ಪವಿತ್ರ ತೀರ್ಥದಿಂದ ಪೂಜಾ ದ್ರವ್ಯಗಳನ್ನು ಪ್ರೋಕ್ಷಿಸಿ."
          },
          en: {
            intro: "Offer flowers and akshata to the water pot. Invoke the seven holy rivers of Bharat into this sacred vessel.",
            outro: "Sprinkle this consecrated Tirtha over the offerings and yourself."
          },
          te: {
            intro: "పూజా పాత్రలోని నీటికి గంధం, అక్షతలు, పుష్పాలు సమర్పించండి. సప్త నదుల సాన్నిధ్యాన్ని ఆవాహన చేయండి.",
            outro: "ఈ పవిత్ర తీర్థంతో పూజా ద్రవ్యాలను సంప్రోక్షించండి."
          },
          ta: {
            intro: "கலச நீரில் சந்தனம், அட்சதை, மலர்களை இட்டு சப்த நதிகளின் புனித சாந்நித்தியத்தை ஆவாஹனம் செய்யுங்கள்.",
            outro: "இந்த தீர்த்தத்தால் பூஜா திரவியங்களை தூய்மைப்படுத்துங்கள்."
          },
          hi: {
            intro: "कलश के जल में चंदन, अक्षत और पुष्प अर्पित करें। सप्त पवित्र नदियों का आवाह्न करें।",
            outro: "इस पवित्र तीर्थ से पूजा सामग्री को अभिमंत्रित करें।"
          }
        },
        spokenPriestGuidance: "ಪೂಜಾ ಪಾತ್ರೆಯ ಜಲಕ್ಕೆ ಗಂಧ, ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಸಮರ್ಪಿಸಿ. ಸಪ್ತನದಿಗಳ ಪವಿತ್ರ ಸಾನ್ನಿಧ್ಯವನ್ನು ಆವಾಹನೆ ಮಾಡಿ. कलशस्य मुखे विष्णुः कण्ठे रुद्रः समाश्रितः। मूले तत्र स्थितो ब्रह्मा मध्ये मातृगणाः स्थिताः॥ गङ्गे च यमुने चैव गोदावरि सरस्वति। नर्मदे सिन्धु कावेरि जलेऽस्मिन् सन्निधिं कुरु॥ ಈ ಪವಿತ್ರ ತೀರ್ಥದಿಂದ ಪೂಜಾ ದ್ರವ್ಯಗಳನ್ನು ಪ್ರೋಕ್ಷಿಸಿ.",
        hiddenPriestInstructionKn: "ಬಲಗೈಯನ್ನು ಕಳಶದ ಮುಖದ ಮೇಲೆ ಇರಿಸಿ ಗಂಗಾದಿ ಪುಣ್ಯ ನದಿಗಳನ್ನು ಆವಾಹಿಸಿ, ಆ ತೀರ್ಥದಿಂದ ಪೂಜಾ ದ್ರವ್ಯಗಳನ್ನು ಮತ್ತು ತಮ್ಮನ್ನು ಪ್ರೋಕ್ಷಿಸಿಕೊಳ್ಳಬೇಕು.",
        hiddenPriestInstructionEn: "Place right palm over the water pot and chant, transforming household water into sanctified Tirtha.",
        approxSeconds: 30
      },
      {
        step: 4,
        titleKn: "೪. ಮಹಾಗಣಪತಿ & ಗುರು ಪ್ರಾರ್ಥನೆ",
        titleEn: "4. Maha Ganapati & Guru Invocation",
        actionCueKn: "🌺 ಕೈಯಲ್ಲಿ ಅಕ್ಷತೆ-ಹೂವು ಹಿಡಿದು ಗಣೇಶ ಮತ್ತು ಸದ್ಗುರುವಿಗೆ ನಮಸ್ಕರಿಸಿ",
        actionCueEn: "🌺 Hold flowers and akshata, pray to Lord Ganesha and Guru",
        icon: "🌺",
        visualEffect: "namaskara",
        mantraSanskrit: "शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्। प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥ अगजानन पद्मार्कं गजाननमहर्निशम्। अनेकदं तं भक्तानां एकदन्तमुपास्महे॥ गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः। गुरुः साक्षात् परब्रह्म तस्मै श्री गुरवे नमः॥",
        mantraL5: {
          kn: "ಶುಕ್ಲಾಂಬರಧರಂ ವಿಷ್ಣುಂ ಶಶಿವರ್ಣಂ ಚತುರ್ಭುಜಮ್ । ಪ್ರಸನ್ನವದನಂ ಧ್ಯಾಯೇತ್ ಸರ್ವವಿಘ್ನೋಪಶಾಂತಯೇ ॥\nಅಗಜಾನನ ಪದ್ಮಾರ್ಕಂ ಗಜಾನನಮಹರ್ನಿಶಮ್ । ಅನೇಕದಂತಂ ಭಕ್ತಾನಾಂ ಏಕದಂತಮುಪಾಸ್ಮಹೇ ॥\nಗುರುರ್ಬ್ರಹ್ಮಾ ಗುರುರ್ವಿಷ್ಣುಃ ಗುರುರ್ದೇವೋ ಮಹೇಶ್ವರಃ । ಗುರುಃ ಸಾಕ್ಷಾತ್ ಪರಬ್ರಹ್ಮ ತಸ್ಮೈ ಶ್ರೀ ಗುರವೇ ನಮಃ ॥",
          hi: "शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्। प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥\nअगजानन पद्मार्कं गजाननमहर्निशम्। अनेकदं तं भक्तानां एकदन्तमुपास्महे॥\nगुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः। गुरुः साक्षात् परब्रह्म तस्मै श्री गुरवे नमः॥",
          te: "శుక్లాంబరధరం విష్ణుం శశివర్ణం చతుర్భుజమ్। ప్రసన్నవదనం ధ్యాయేత్ సర్వవిఘ్నోపశాంతయే॥\nఅగజానన పద్మార్కం గజాననమహర్నిశమ్। అనేకదం తం భక్తానాం ఏకదంతముపాస్మహే॥\nగురుర్బ్రహ్మా గురుర్విష్ణుః గురుర్దేవో మహేశ్వరః। గురుః సాక్షాత్ పరబ్రహ్మ తస్మై శ్రీ గురవే నమః॥",
          ta: "சுக்லாம்பரதரம் விஷ்ணும் சசிவர்ணம் சதுர்புஜம்। ப்ரஸன்னவதனம் த்யாயேத் ஸர்வவிக்நோபசாந்தயே॥\nஅகஜானன பத்மார்க்கம் கஜானனமஹர்நிசம்। அனேகதம் தம் பக்தானாம் ஏகதந்தமுபாஸ்மஹே॥\nகுருர்ப்ரம்ஹா குருர்விஷ்ணுஃ குருர்தேவோ மஹேச்வரஃ। குருஃ ஸாக்ஷாத் பரப்ரம்ஹ தஸ்மை ஸ்ரீ குரவே நமஃ॥",
          en: "Shuklambaradharam Vishnum Shashivarnam Chaturbhujam | Prasanna Vadanam Dhyayet Sarva Vighnopashantaye ||\nAgajanana Padmarkam Gajananama Harnisham | Anekadam Tam Bhaktanam Ekadantam Upasmahe ||\nGurur Brahma Gurur Vishnuh Gurur Devo Maheshvarah | Guruh Sakshat Parabrahma Tasmai Shri Gurave Namah ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಕೈಯಲ್ಲಿ ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ. ಸಕಲ ವಿಘ್ನ ನಿವಾರಕನಾದ ಗಣಪತಿ ಹಾಗೂ ಸದ್ಗುರುವಿಗೆ ನಮಸ್ಕರಿಸಿ.",
            outro: "ಅಕ್ಷತೆ-ಹೂವನ್ನು ದೇವರಿಗೆ ಅರ್ಪಿಸಿ."
          },
          en: {
            intro: "Hold sacred flowers and Akshata in your hands. Offer salutations to Lord Ganesha, the remover of obstacles, and the revered Guru.",
            outro: "Offer the flowers and Akshata at the feet of the Lord."
          },
          te: {
            intro: "చేతిలో అక్షతలు, పుష్పాలు పట్టుకోండి. విఘ్న నివారకుడైన గణపతికి, సద్గురువునకు నమస్కరించండి.",
            outro: "పుష్పాక్షతలను స్వామివారికి సమర్పించండి."
          },
          ta: {
            intro: "கைகளில் மலர்களையும் அட்சதையையும் எடுத்துக் கொள்ளுங்கள். விக்னங்களை நீக்கும் கணபதி மற்றும் குருவை வணங்குங்கள்.",
            outro: "மலர்களையும் அட்சதையையும் இறைவனின் திருவடிகளில் அர்ப்பணியுங்கள்."
          },
          hi: {
            intro: "हाथ में अक्षत और पुष्प लें। विघ्नहर्ता गणेश और सदगुरु को नमन करें।",
            outro: "पुष्प और अक्षत प्रभु के चरणों में अर्पित करें।"
          }
        },
        spokenPriestGuidance: "ಕೈಯಲ್ಲಿ ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ. ಸಕಲ ವಿಘ್ನ ನಿವಾರಕನಾದ ಗಣಪತಿ ಹಾಗೂ ಸದ್ಗುರುವಿಗೆ ನಮಸ್ಕರಿಸಿ. शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्। प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥ अगजानन पद्मार्कं गजाननमहर्निशम्। अनेकदं तं भक्तानां एकदन्तमुपास्महे॥ गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः। गुरुः साक्षात् परब्रह्म तस्मै श्री गुरवे नमः॥ ಅಕ್ಷತೆ-ಹೂವನ್ನು ದೇವರಿಗೆ ಅರ್ಪಿಸಿ.",
        hiddenPriestInstructionKn: "ಪ್ರಥಮ ಪೂಜೆಯನ್ನು ಗಣಪತಿಗೆ ಅರ್ಪಿಸಬೇಕು. ಗುರು ಸ್ಮರಣೆಯು ಪೂಜಾ ಫಲವನ್ನು ಸಿದ್ಧಿಸುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Offer flowers to Sri Ganesha and Guru, ensuring auspiciousness and removal of hurdles.",
        approxSeconds: 35
      },
      {
        step: 5,
        titleKn: "೫. ಷೋಡಶೋಪಚಾರ ಸಮರ್ಪಣೆ (ಗಂಧ, ಅಕ್ಷತೆ, ಪುಷ್ಪ, ಧೂಪ, ನೈವೇದ್ಯ)",
        titleEn: "5. Shodashopachara Offerings",
        actionCueKn: "🌸 ಗಂಧ, ಕುಂಕುಮ, ಅಕ್ಷತೆ, ಹೂವು, ಧೂಪ ಮತ್ತು ನೈವೇದ್ಯ ಸಮರ್ಪಿಸಿ",
        actionCueEn: "🌸 Offer Chandana, Akshata, fragrant flowers, incense & Naivedya",
        icon: "🌸",
        visualEffect: "arghya",
        mantraSanskrit: "श्री गन्धं समर्पयामि। कुङ्कुमं अक्षतान् समर्पयामि। पुष्पाणि पूजयामि। धूपं आघ्रापयामि। दीपं दर्शयामि॥",
        mantraSanskritPart2: "ॐ भूर्भुवस्सुवः सत्यं त्वर्तेन परिषिञ्चामि, अमृतोपस्तरणमसि स्वाहा... नैवेद्यं निवेदयामि। ताम्बूलं दक्षिणां च समर्पयामि॥",
        mantraL5: {
          kn: "ಶ್ರೀ ಗಂಧಂ ಸಮರ್ಪಯಾಮಿ । ಕುಂಕುಮಂ ಅಕ್ಷತಾನ್ ಸಮರ್ಪಯಾಮಿ । ಪುಷ್ಪಾಣಿ ಪೂಜಯಾಮಿ ।\nಧೂಪಂ ಆಘ್ರಾಪಯಾಮಿ । ದೀಪಂ ದರ್ಶಯಾಮಿ ।\nಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ ಸತ್ಯಂ ತ್ವರ್ತೇನ ಪರಿಷಿಂಚಾಮಿ, ಅಮೃತೋಪಸ್ತರಣಮಸಿ ಸ್ವಾಹಾ... ನೈವೇದ್ಯಂ ನಿವೇದಯಾಮಿ ॥\nತಾಂಬೂಲಂ ದಕ್ಷಿಣಾಂ ಚ ಸಮರ್ಪಯಾಮಿ ॥",
          hi: "श्री गन्धं समर्पयामि। कुङ्कुमं अक्षतान् समर्पयामि। पुष्पाणि पूजयामि।\nधूपं आघ्रापयामि। दीपं दर्शयामि।\nॐ भूर्भुवस्सुवः सत्यं त्वर्तेन परिषिञ्चामि, अमृतोपस्तरणमसि स्वाहा... नैवेद्यं निवेदयामि॥\nताम्बूलं दक्षिणां च समर्पयामि॥",
          te: "శ్రీ గంధం సమర్పయామి। కుంకుమం అక్షతాన్ సమర్పయామి। పుష్పాణి పూజయామి।\nధూపం ఆఘ్రాపయామి। దీపం దర్శయామి।\nఓం భూర్భුවస్సువః సత్యం త్వర్తేన పరిషించామి, అమృతోపస్తరణమసి స్వాహా... నైవేద్యం నివేదయామి॥\nతాంబూలం దక్షిణాం చ సమర్పయామి॥",
          ta: "ஸ்ரீ கந்தம் ஸமர்பயாமி। குங்குமம் அக்ஷதான் ஸமர்பயாமி। புஷ்பாணி பூஜயாமி।\nதூபம் ஆக்ராபயாமி। தீபம் தர்சயாமி।\nஓம் பூர்புவஸ்ஸுவஃ ஸத்யம் த்வர்தேன பரிஷிஞ்சாமி, அம்ருதோபஸ்தரணமஸி ஸ்வாஹா... நைவேத்யம் நிவேதயாமி॥\nதாம்பூலம் தக்ஷிணாம் ச ஸமர்பயாமி॥",
          en: "Shri Gandham Samarpayami | Kumkumam Akshatan Samarpayami | Pushpani Poojayami |\nDhoopam Aghrapayami | Deepam Darshayami |\nOm Bhur Bhuvas Suvah Satyam Tvartena Parishinchami, Amritopastaranamasi Svaha... Naivedyam Nivedayami |\nTambulam Dakshinam Cha Samarpayami ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಈಗ ದೇವರಿಗೆ ಭಕ್ತಿಯಿಂದ ಶ್ರೀಗಂಧ, ಕುಂಕುಮ, ಮಂಗಳಾಕ್ಷತೆ ಮತ್ತು ಪರಿಮಳ ಪುಷ್ಪಗಳನ್ನು ಅರ್ಪಿಸಿ.",
            mid: "ಈಗ ನೈವೇದ್ಯ ಪಾತ್ರೆಯ ಸುತ್ತಲೂ ನೀರಿನಿಂದ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ ನೈವೇದ್ಯವನ್ನು ಅರ್ಪಿಸಿ.",
            outro: "ಸಮಸ್ತ ಉಪಚಾರಗಳನ್ನು ಭಗವಂತನು ಪ್ರೀತಿಯಿಂದ ಸ್ವೀಕರಿಸಲಿ."
          },
          en: {
            intro: "Now lovingly offer Chandana, Kumkuma, Akshata, and fragrant flowers to the Lord.",
            mid: "Encircle the food offering with sacred water drops and offer Naivedya.",
            outro: "May the Supreme Lord accept all sacred offerings with joy."
          },
          te: {
            intro: "ఇప్పుడు భగవంతునికి చందనం, కుంకుమ, అక్షతలు, సుగంధ పుష్పాలను సమర్పించండి.",
            mid: "నైవేద్య పాత్ర చుట్టూ జలంతో ప్రదక్షిణ చేసి నైవేద్యం సమర్పించండి.",
            outro: "సమస్త ఉపచారాలను భగవానుడు ప్రీతితో స్వీకరించుగాక."
          },
          ta: {
            intro: "இப்போது சந்தனம், குங்குமம், அட்சதை, நறுமண மலர்களை இறைவனுக்கு அர்ப்பணியுங்கள்.",
            outro: "அனைத்து உபசாரங்களையும் இறைவன் மகிழ்வுடன் ஏற்கட்டும்."
          },
          hi: {
            intro: "अब प्रभु को चंदन, कुमकुम, अक्षत और सुगंधित पुष्प अर्पित करें।",
            mid: "नैवेद्य के चारों ओर जल घुमाकर भोग लगाएं।",
            outro: "भगवान सभी उपचारों को सानंद स्वीकार करें।"
          }
        },
        spokenPriestGuidance: "ಈಗ ದೇವರಿಗೆ ಭಕ್ತಿಯಿಂದ ಶ್ರೀಗಂಧ, ಕುಂಕುಮ, ಮಂಗಳಾಕ್ಷತೆ ಮತ್ತು ಪರಿಮಳ ಪುಷ್ಪಗಳನ್ನು ಅರ್ಪಿಸಿ. श्री गन्धं समर्पयामि। कुङ्कुमं अक्षतान् समर्पयामि। पुष्पाणि पूजयामि। धूपं आघ्रापयामि। दीपं दर्शयामि॥ ಈಗ ನೈವೇದ್ಯ ಪಾತ್ರೆಯ ಸುತ್ತಲೂ ನೀರಿನಿಂದ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ ನೈವೇದ್ಯವನ್ನು ಅರ್ಪಿಸಿ. ॐ भूर्भुवस्सुवः सत्यं त्वर्तेन परिषिञ्चामि, अमृतोपस्तरणमसि स्वाहा... नैवेद्यं निवेदयामि। ताम्बूलं दक्षिणां च समर्पयामि॥ ಸಮಸ್ತ ಉಪಚಾರಗಳನ್ನು ಭಗವಂತನು ಪ್ರೀತಿಯಿಂದ ಸ್ವೀಕರಿಸಲಿ.",
        hiddenPriestInstructionKn: "ಷೋಡಶೋಪಚಾರಗಳಲ್ಲಿ ಗಂಧ, ಕುಂಕುಮ, ಅಕ್ಷತೆ, ಪುಷ್ಪ, ಧೂಪ, ದೀಪ, ನೈವೇದ್ಯ ಮತ್ತು ತಾಂಬೂಲ ಪ್ರಮುಖವಾದವು. ನೈವೇದ್ಯಕ್ಕೆ ತುಳಸಿ ಅಥವಾ ಹೂವಿನಿಂದ ನೀರು ಪ್ರೋಕ್ಷಿಸಿ ದೇವರಿಗೆ ತೋರಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Offer Chandana, Kumkuma, Akshata, fragrant flowers, waving incense, followed by sanctified food offering with Gayatri water circle.",
        approxSeconds: 40
      },
      {
        step: 6,
        titleKn: "೬. ಕರ್ಪೂರ ಮಂಗಳಾರತಿ & ಪ್ರದಕ್ಷಿಣೆ",
        titleEn: "6. Karpura Mangalarathi & Pradakshina",
        actionCueKn: "🔔 ಕರ್ಪೂರಾರತಿ ಬೆಳಗಿ · ೩ ಬಾರಿ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕರಿಸಿ",
        actionCueEn: "🔔 Wave camphor flame, do 3 clockwise turns and prostrate",
        icon: "🔔",
        visualEffect: "arathi",
        mantraSanskrit: "कर्पूर गौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्। सदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥",
        mantraSanskritPart2: "यानि कानि च पापानि जन्मान्तरकृतानि च। तानि तानि विनश्यन्ति प्रदक्षिण पदे पदे॥ अकालमृत्युहरणं सर्वव्याधिनिवारणं समस्तपापक्षयकरं श्री देवता पादोदकं पावनं शुभम्॥",
        mantraL5: {
          kn: "ಕರ್ಪೂರ ಗೌರಂ ಕರುಣಾವತಾರಂ ಸಂಸಾರಸಾರಂ ಭುಜಗೇಂದ್ರಹಾರಮ್ ।\nಸದಾ ವಸಂತಂ ಹೃದಯಾರವಿಂದೇ ಭವಂ ಭವಾನೀಸಹಿತಂ ನಮಾಮಿ ॥\nಯಾನಿ ಕಾನಿ ಚ ಪಾಪಾನಿ ಜನ್ಮಾಂತರಕೃತಾನಿ ಚ ।\nತಾನಿ ತಾನಿ ವಿನಶ್ಯಂತಿ ಪ್ರದಕ್ಷಿಣ ಪದೇ ಪದೇ ॥\nಅಕಾಲಮೃತ್ಯುಹರಣಂ ಸರ್ವವ್ಯಾಧಿನಿವಾರಣಂ ಸಮಸ್ತಪಾಪಕ್ಷಯಕರಂ ಶ್ರೀ ದೇವತಾ ಪಾದೋದಕಂ ಪಾವನಂ ಶುಭಮ್ ॥",
          hi: "कर्पूर गौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्।\nसदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥\nयानि कानि च पापानि जन्मान्तरकृतानि च।\nतानि तानि विनश्यन्ति प्रदक्षिण पदे पदे॥\nअकालमृत्युहरणं सर्वव्याधिनिवारणं समस्तपापक्षयकरं श्री देवता पादोदकं पावनं शुभम्॥",
          te: "కర్పూర గౌరం కరుణావతారం సంసారసారం భుజగేంద్రహారమ్।\nసదా వసంతం హృదయారవిందే భవం భవానీసహితం నమామి॥\nయాని కాని చ పాపాని జన్మాంతరకృతాని చ।\nతాని తాని వినశ్యంతి ప్రదక్షిణ పదే పదే॥\nఅకాలమృత్యుహరణం సర్వవ్యాధినివారణం సమస్తపాపక్షయకరం శ్రీ దేవతా పాదోదకం పావనం శుభమ్॥",
          ta: "க Karpura ಗೌರಂ ಕರುಣಾವತಾರಂ ಸಂಸಾರಸಾರಂ ಭುಜಗೇಂದ್ರಹಾರಮ್।\nஸதா வஸந்தம் ஹ்ருதயாரவிந்தே பவம் பவானீஸஹிதம் நமாமி॥\nயானி கானி ச பாபானி ஜன்மாந்தரக்ருதானி ச।\nதானி தானி விநச்யந்தி ப்ரதக்ஷிண পদে পদে॥\nஅகாலம்ருத்யுஹரணம் ஸர்வவ்யாதிநிவாரணம் ஸமஸ்தபாபக்ஷயகரம் ஸ்ரீ தேவதா பாதோதகம் பாவனம் சுபம்॥",
          en: "Karpura Gauram Karunavataram Samsarasaram Bhujagendraharam |\nSada Vasantam Hridayaravinde Bhavam Bhavanisahitam Namami ||\nYani Kani Cha Papani Janmantarakritani Cha |\nTani Tani Vinashyanti Pradakshina Pade Pade ||\nAkalamrityu Haranam Sarvavyadhi Nivaranam Samastapapa Kshayakaram Shri Devata Padodakam Pavanam Shubham ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಘಂಟೆಯನ್ನು ನುಡಿಸುತ್ತಾ ಕರ್ಪೂರ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ.",
            mid: "ಈಗ ಎದ್ದು ನಿಂತು ಮೂರು ಬಾರಿ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕರಿಸಿ.",
            outro: "ದೇವರ ತೀರ್ಥ-ಪ್ರಸಾದವನ್ನು ಕಣ್ಣಿಗೆ ಒತ್ತಿಕೊಂಡು ಸ್ವೀಕರಿಸಿ. ಪೂಜೆ ಸಂಪನ್ನವಾಯಿತು."
          },
          en: {
            intro: "Wave the sacred camphor flame while ringing the bell rhythmically.",
            mid: "Now stand, perform three clockwise pradakshinas, and prostrate with devotion.",
            outro: "Touch the arati warmth to your eyes and accept the sanctified Tirtha. The pooja is blessed."
          },
          te: {
            intro: "గంట మ్రోగిస్తూ కర్పూర మంగళహారతిని వెలిగించండి.",
            mid: "ఇప్పుడు లేచి మూడు ప్రదక్షిణలు చేసి సాష్టాంగ నమస్కారం చేయండి.",
            outro: "తీర్థ ప్రసాదాలను స్వీకరించండి. పూజ సంపూర్ణమయింది."
          },
          ta: {
            intro: "மணியை ஒலிக்கச் செய்து கற்பூர மங்களாரத்தியை ஏற்றுங்கள்.",
            mid: "இப்போது எழுந்து மூன்று முறை பிரதட்சிணம் செய்து வணங்குங்கள்.",
            outro: "தீர்த்த பிரசாதத்தை ஏற்றுக்கொள்ளுங்கள். பூஜை இனிதே நிறைவுற்றது."
          },
          hi: {
            intro: "घंटी बजाते हुए कर्पूर मंगला आरती करें।",
            mid: "अब खड़े होकर तीन प्रदक्षिणा करें और साष्टांग प्रणाम करें।",
            outro: "तीर्थ-प्रसाद ग्रहण करें। पूजा संपन्न हुई।"
          }
        },
        spokenPriestGuidance: "ಘಂಟೆಯನ್ನು ನುಡಿಸುತ್ತಾ ಕರ್ಪೂರ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ. कर्पूर गौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्। सदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥ ಈಗ ಎದ್ದು ನಿಂತು ಮೂರು ಬಾರಿ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ. यानि कानि च पापानि जन्मान्तरकृतानि च। तानि तानि विनश्यन्ति प्रदक्षिण पदे पदे॥ अकालमृत्युहरणं सर्वव्याधिनिवारणं समस्तपापक्षयकरं श्री देवता पादोदकं पावनं शुभम्॥ ದೇವರ ತೀರ್ಥ-ಪ್ರಸಾದವನ್ನು ಕಣ್ಣಿಗೆ ಒತ್ತಿಕೊಂಡು ಸ್ವೀಕರಿಸಿ. ಪೂಜೆ ಸಂಪನ್ನವಾಯಿತು.",
        hiddenPriestInstructionKn: "ಮಂಗಳಾರತಿಯನ್ನು ದೇವರಿಗೆ ಮೂರು ಸುತ್ತು ಸುತ್ತಿಸಿ, ಭಕ್ತರು ಕಣ್ಣುಗಳಿಗೆ ಸ್ಪರ್ಶಿಸಿಕೊಂಡು ನಂತರ ತೀರ್ಥ-ಪ್ರಸಾದವನ್ನು ಸ್ವೀಕರಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Wave sacred camphor arati with bell, perform 3 clockwise turns, prostrate, and accept consecrated Tirtha.",
        approxSeconds: 40
      }
    ]
  },

  // =========================================================================
  // POOJA 3: ಸಾಯಂಕಾಲದ ಪೂಜೆ & ದೀಪಾರಾಧನಾ ಮಹಾವಿಧಿ (Evening Sandhya & Deeparadhana)
  // =========================================================================
  evening_pooja: {
    key: "evening_pooja",
    titleKn: "ಸಾಯಂಕಾಲದ ಪೂಜೆ & ದೀಪಾರಾಧನಾ ಮಹಾವಿಧಿ",
    titleEn: "Evening Sandhya & Deeparadhana Vidhi",
    subtitleKn: "ಸಾಯಂ ಶುದ್ಧಿ, ದೀಪಾರಾಧನೆ, ತುಳಸೀ ಪ್ರದಕ್ಷಿಣೆ, ಸಾಯಂ ಸ್ತೋತ್ರ ಹಾಗೂ ಕಾಯೇನ ವಾಚಾ ಶಾಂತಿ ಪ್ರಾರ್ಥನೆ",
    subtitleEn: "Auspicious Twilight Worship: Lamp Lighting, Tulasi Pradakshina & Evening Stuti",
    icon: "🌆",
    badgeTextKn: "ಸಂಧ್ಯಾದೀಪ · ತುಳಸೀ ಪೂಜೆ",
    badgeTextEn: "Twilight Lamp · Tulasi Worship",
    colorScheme: {
      primary: "#C2410C",
      border: "#EA580C",
      badgeBg: "#FFEDD5",
      gradient: "from-orange-600 to-amber-700"
    },
    steps: [
      {
        step: 1,
        titleKn: "೧. ಸಾಯಂ ಶುದ್ಧಿ & ಆಚಮನ",
        titleEn: "1. Evening Purification & Achamana",
        actionCueKn: "💧 ಕೈಕಾಲು ತೊಳೆದು ಆಚಮನ ಪಾತ್ರೆಯಿಂದ ೩ ಬಾರಿ ಜಲ ಸ್ವೀಕರಿಸಿ",
        actionCueEn: "💧 Cleanse hands/feet and take 3 water sips for twilight purity",
        icon: "💧",
        visualEffect: "achamana",
        mantraSanskrit: "ॐ केशवाय स्वाहा। ॐ नारायणाय स्वाहा। ॐ माधवाय स्वाहा॥ हस्त प्रक्षालनं समर्पयामि॥",
        mantraSanskritPart2: "अपवित्रः पवित्रो वा सर्वावस्थां गतोऽपि वा। यः स्मरेत् पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥",
        mantraL5: {
          kn: "ಓಂ ಕೇಶವಾಯ ಸ್ವಾಹಾ । ಓಂ ನಾರಾಯಣಾಯ ಸ್ವಾಹಾ । ಓಂ ಮಾಧವಾಯ ಸ್ವಾಹಾ ॥\nಹಸ್ತ ಪ್ರಕ್ಷಾಲನಂ ಸಮರ್ಪಯಾಮಿ ॥\nಅಪವಿತ್ರಃ ಪವಿತ್ರೋ ವಾ ಸರ್ವಾವಸ್ಥಾಂ ಗತೋಽಪಿ ವಾ । ಯಃ ಸ್ಮರೇತ್ ಪುಂಡರೀಕಾಕ್ಷಂ ಸ ಬಾಹ್ಯಾಭ್ಯಂತರಃ ಶುಚಿಃ ॥",
          hi: "ॐ केशवाय स्वाहा। ॐ नारायणाय स्वाहा। ॐ माधवाय स्वाहा॥\nहस्त प्रक्षालनं समर्पयामि॥\nअपवित्रः पवित्रो वा सर्वावस्थां गतोऽपि वा। यः स्मरेत् पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥",
          te: "ఓం కేశవాయ స్వాహా। ఓం నారాయణాయ స్వాహా। ఓం మాధవాయ స్వాహా॥\nహస్త ప్రక్షాళనం సమర్పయామి॥\nఅపవిత్రః పవిత్రో వా సర్వావస్థాం గతోಽపి వా। యః స్మరేత్ పుండరీకాక్షం స బాహ్యాభ్యంతరః శుచిః॥",
          ta: "ஓம் கேசவாய ஸ்வாஹா। ஓம் நாராயணாய ஸ்வாஹா। ஓம் மாதவாய ஸ்வாஹா॥\nஹஸ்த ப்ரக்ஷாலனம் ஸமர்பயாமி॥\nஅபவித்ரஃ பவித்ரோ வா ஸர்வாவஸ்தாம் கதோऽபி வா। யஃ ஸ்மரேத் புண்டரீகாக்ஷம் ஸ பாஹ்யாப்யந்தரஃ சுசிஃ॥",
          en: "Om Keshavaya Svaha | Om Narayanaya Svaha | Om Madhavaya Svaha ||\nHasta Prakshalanam Samarpayami ||\nApavitrah Pavitro Va Sarvavastham Gatopi Va | Yah Smaret Pundarikaksham Sa Bahyabhyantarah Shuchih ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಹರಿ ಓಂ. ಸಾಯಂಕಾಲದ ಪವಿತ್ರ ಸಂಧ್ಯಾವೇಳೆಗೆ ಸುಸ್ವಾಗತ. ಕೈಕಾಲುಗಳನ್ನು ಶುದ್ಧವಾಗಿ ತೊಳೆದುಕೊಂಡು ಆಚಮನ ಪಾತ್ರೆಯಿಂದ ಮೂರು ಬಾರಿ ಪವಿತ್ರ ಜಲವನ್ನು ಸ್ವೀಕರಿಸಿ.",
            outro: "ಶುದ್ಧ ಮನಸ್ಸಿನಿಂದ ಸಂಧ್ಯಾ ಪೂಜೆಗೆ ಸಿದ್ಧರಾಗಿ."
          },
          en: {
            intro: "Hari Om. Welcome to the auspicious evening twilight worship. Wash your hands and feet, and take three sacred sips with the Achamana spoon.",
            outro: "Prepare your consciousness for evening contemplation."
          },
          te: {
            intro: "హరి ఓం. సాయంత్రం పవిత్ర సంధ్యా సమయానికి స్వాగతం. ఆచమనం చేసి మూడుసార్లు పవిత్ర జలాన్ని స్వీకరించండి.",
            outro: "శుద్ధ మనస్సుతో సంధ్యా పూజకు సిద్ధంకండి."
          },
          ta: {
            intro: "ஹரி ஓம். மாலையின் புனித சந்தியா வேளைக்கு நல்வரவு. கை கால்களைக் கழுவி மூன்று முறை ஆசமனம் செய்யுங்கள்.",
            outro: "தூய உள்ளத்துடன் வழிபாட்டிற்குத் தயாராகுங்கள்."
          },
          hi: {
            intro: "हरि ॐ। सांध्यकालीन पावन बेला में आपका स्वागत है। हाथ-पैर धोकर आचमनी से तीन बार जल लें।",
            outro: "शुद्ध भाव से संध्या पूजा प्रारंभ करें।"
          }
        },
        spokenPriestGuidance: "ಹರಿ ಓಂ. ಸಾಯಂಕಾಲದ ಪವಿತ್ರ ಸಂಧ್ಯಾವೇಳೆಗೆ ಸುಸ್ವಾಗತ. ಕೈಕಾಲುಗಳನ್ನು ಶುದ್ಧವಾಗಿ ತೊಳೆದುಕೊಂಡು ಆಚಮನ ಪಾತ್ರೆಯಿಂದ ಮೂರು ಬಾರಿ ಪವಿತ್ರ ಜಲವನ್ನು ಸ್ವೀಕರಿಸಿ. ॐ केशवाय स्वाहा। ॐ नारायणाय स्वाहा। ॐ माधवाय स्वाहा॥ हस्त प्रक्षालनं समर्पयामि॥ अपवित्रः पवित्रो वा सर्वावस्थां गतोऽपि वा। यः स्मरेत् पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥ ಶುದ್ಧ ಮನಸ್ಸಿನಿಂದ ಸಂಧ್ಯಾ ಪೂಜೆಗೆ ಸಿದ್ಧರಾಗಿ.",
        hiddenPriestInstructionKn: "ಸಂಧ್ಯಾ ಕಾಲದಲ್ಲಿ ಶರೀರ ಮತ್ತು ಮನಸ್ಸಿನ ಶುದ್ಧಿಗಾಗಿ ಪುಂಡರೀಕಾಕ್ಷ ಸ್ಮರಣೆಯೊಂದಿಗೆ ಆಚಮನ ಮಾಡಬೇಕು.",
        hiddenPriestInstructionEn: "Perform twilight purification with Achamana and remembrance of Lord Pundarikaksha.",
        approxSeconds: 25
      },
      {
        step: 2,
        titleKn: "೨. ಸಂಧ್ಯಾ ದೀಪ ಪ್ರಜ್ವಲನೆ",
        titleEn: "2. Lighting the Evening Sandhya Lamp",
        actionCueKn: "🪔 ದೇವರ ಮನೆಯಲ್ಲಿ & ಮುಖ್ಯದ್ವಾರದಲ್ಲಿ ಮಂಗಳ ದೀಪ ಬೆಳಗಿಸಿ",
        actionCueEn: "🪔 Light evening lamps at the altar and main home entrance",
        icon: "🪔",
        visualEffect: "deepa",
        mantraSanskrit: "दीपमूले स्थितो ब्रह्मा दीपमध्ये जनार्दनः। दीपाग्रे शंकरः प्रोक्तः सन्ध्याज्योतिर्नमोऽस्तु ते॥ कल्याणवृष्टिमृषितां भुवनैकमातः कल्याणिदेहि मम सद्मनि सम्पदस्ते॥",
        mantraL5: {
          kn: "ದೀಪಮೂಲೇ ಸ್ಥಿತೋ ಬ್ರಹ್ಮಾ ದೀಪಮಧ್ಯೇ ಜನಾರ್ದನಃ । ದೀಪಾಗ್ರೇ ಶಂಕರಃ ಪ್ರೋಕ್ತಃ ಸಂಧ್ಯಾಜ್ಯೋತಿರ್ನಮೋಸ್ತು ತೇ ॥\nಕಲ್ಯಾಣವೃಷ್ಟಿಮೃಷಿತಾಂ ಭುವನೈಕಮಾತಃ ಕಲ್ಯಾಣಿದೇಹಿ ಮಮ ಸದ್ಮನಿ ಸಂಪದಸ್ತೇ ॥",
          hi: "दीपमूले स्थितो ब्रह्मा दीपमध्ये जनार्दनः। दीपाग्रे शंकरः प्रोक्तः सन्ध्याज्योतिर्नमोऽस्तु ते॥\nकल्याणवृष्टिमृषितां भुवनैकमातः कल्याणिदेहि मम सद्मनि सम्पदस्ते॥",
          te: "దీపమూలే స్థితో బ్రహ్మా దీపమధ్యే జనార్దనః। దీపాగ్రే శంకరః ప్రోక్తః సంధ్యాజ్యోతిర్నమోఽస్తు తే॥\nకల్యాణవృష్టిమృషితాం భువనైకమాతః కల్యాణిదేహి మమ సద్మని సంపదస్తే॥",
          ta: "தீபமூலே ஸ்திதோ ப்ரம்ஹா தீபமத்யே ஜனார்தனஃ। தீபாக்ரே சங்கரஃ ப்ரோக்தஃ ஸந்த்யாஜ்யோதிர்நமோஸ்து தே॥\nகல்யாணவ்ருஷ்டிம்ருஷிதாம் புவனைகமாதஃ கல்யாணிதேஹி மம ஸத்மனி ஸம்பதஸ்தே॥",
          en: "Deepamule Sthito Brahma Deepamadhye Janardanah | Deepagre Shankarah Proktah Sandhyajyotir Namostu Te ||\nKalyana Vrishtim Rishitam Bhuvanaika Matah Kalyani Dehi Mama Sadmani Sampadaste ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಸಾಯಂಕಾಲದ ಸಂಧ್ಯಾ ದೇವತೆಯ ಸಾನ್ನಿಧ್ಯಕ್ಕಾಗಿ ದೇವರ ಮನೆಯಲ್ಲಿ ಹಾಗೂ ಮುಖ್ಯದ್ವಾರದಲ್ಲಿ ಮಂಗಳ ದೀಪಗಳನ್ನು ಬೆಳಗಿಸಿ.",
            outro: "ಮಹಾಲಕ್ಷ್ಮಿಯು ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಸದಾ ನೆಲೆಸಲಿ."
          },
          en: {
            intro: "Light the auspicious twilight lamps at the sanctum altar and the front threshold to invite Goddess Mahalakshmi.",
            outro: "May the Goddess of abundance dwell eternally in your home."
          },
          te: {
            intro: "సంధ్యా లక్ష్మి స్వాగతార్థం దేవుని గదిలో మరియు ప్రధాన ద్వారం వద్ద దీపాలు వెలిగించండి.",
            outro: "మహాలక్ష్మి మీ ఇంట్లో స్థిరంగా నివసించుగాక."
          },
          ta: {
            intro: "மாலை நேரத்தில் மஹாலக்ஷ்மியின் அருளைப் பெற பூஜை அறையிலும் தலைவாசலிலும் தீபம் ஏற்றுங்கள்.",
            outro: "லக்ஷ்மி தேவி உங்கள் இல்லத்தில் நிரந்தரமாக வாசம் செய்யட்டும்."
          },
          hi: {
            intro: "संध्या देवी के आवाह्न हेतु पूजा घर और मुख्य द्वार पर मंगल दीप प्रज्वलित करें।",
            outro: "महालक्ष्मी आपके घर में सदा निवास करें।"
          }
        },
        spokenPriestGuidance: "ಸಾಯಂಕಾಲದ ಸಂಧ್ಯಾ ದೇವತೆಯ ಸಾನ್ನಿಧ್ಯಕ್ಕಾಗಿ ದೇವರ ಮನೆಯಲ್ಲಿ ಹಾಗೂ ಮುಖ್ಯದ್ವಾರದಲ್ಲಿ ಮಂಗಳ ದೀಪಗಳನ್ನು ಬೆಳಗಿಸಿ. दीपमूले स्थितो ब्रह्मा दीपमध्ये जनार्दनः। दीपाग्रे शंकरः प्रोक्तः सन्ध्याज्योतिर्नमोऽस्तु ते॥ कल्याणवृष्टिमृषितां भुवनैकमातः कल्याणिदेहि मम सद्मनि सम्पदस्ते॥ ಮಹಾಲಕ್ಷ್ಮಿಯು ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಸದಾ ನೆಲೆಸಲಿ.",
        hiddenPriestInstructionKn: "ಸಾಯಂಕಾಲದಲ್ಲಿ ಲಕ್ಷ್ಮೀ ದೇವಿಯು ಮನೆಯೊಳಗೆ ಪ್ರವೇಶಿಸುವ ಶುಭವೇಳೆ. ಮುಖ್ಯದ್ವಾರ ಹಾಗೂ ದೇವರ ಮಂಟಪದಲ್ಲಿ ದೀಪ ಬೆಳಗಿಸುವುದು ಶ್ರೇಷ್ಠ.",
        hiddenPriestInstructionEn: "Light oil lamps at twilight to invoke Goddess Mahalakshmi and ward off negative energies.",
        approxSeconds: 30
      },
      {
        step: 3,
        titleKn: "೩. ತುಳಸೀ ಪೂಜೆ & ಪ್ರದಕ್ಷಿಣೆ (೩ ಬಾರಿ)",
        titleEn: "3. Tulasi Pooja & 3 Pradakshinas",
        actionCueKn: "🌿 ತುಳಸೀ ಕಟ್ಟೆಯ ಮುಂದೆ ದೀಪವಿಟ್ಟು ಹೂವು-ಅಕ್ಷತೆ ಅರ್ಪಿಸಿ ೩ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ",
        actionCueEn: "🌿 Place lamp before Tulasi Vrindavana, offer flowers & 3 pradakshinas",
        icon: "🌿",
        visualEffect: "tulasi",
        mantraSanskrit: "यन्मूले सर्वतीर्थानि यन्मध्ये सर्वदेवताः। यदग्रे सर्ववेदाश्च तुलसि त्वां नमाम्यहम्॥ तुलसी श्रीसखि शुभे पापहारिणि पुण्यदे। नमस्ते नारदनुते नारायणमनःप्रिये। प्रसीद मामके गेहे सदा तिष्ठ शुभप्रदे॥",
        mantraL5: {
          kn: "ಯನ್ಮೂಲೇ ಸರ್ವತೀರ್ಥಾನಿ ಯನ್ಮಧ್ಯೇ ಸರ್ವದೇವತಾಃ । ಯದಗ್ರೇ ಸರ್ವವೇದಾಶ್ಚ ತುಳಸಿ ತ್ವಾಂ ನಮಾಮ್ಯಹಮ್ ॥\nತುಳಸೀ ಶ್ರೀಸಖಿ ಶುಭೇ ಪಾಪಹಾರಿಣಿ ಪುಣ್ಯದೇ । ನಮಸ್ತೇ ನಾರದನುತೇ ನಾರಾಯಣಮನಃಪ್ರಿಯೇ ॥\nಪ್ರಸೀದ ಮಾಮಕೇ ಗೇಹೇ ಸದಾ ತಿಷ್ಠ ಶುಭಪ್ರದೇ ॥",
          hi: "यन्मूले सर्वतीर्थानि यन्मध्ये सर्वदेवताः। यदग्रे सर्ववेदाश्च तुलसि त्वां नमाम्यहम्॥\nतुलसी श्रीसखि शुभे पापहारिणि पुण्यदे। नमस्ते नारदनुते नारायणमनःप्रिये। प्रसीद मामके गेहे सदा तिष्ठ शुभप्रदे॥",
          te: "యన్మూలే సర్వతీర్థాని యన్మధ్యే సర్వదేవతాః। యదగ్రే సర్వవేదాశ్చ తులసి త్వాం నమామ్యహమ్॥\nతులసీ శ్రీసఖి శుభే పాపహారిణి పుణ్యదే। నమస్తే నారదనుతే నారాయణమనఃప్రియే। ప్రసీద మామకే గేహే సదా తిష్ఠ శుభప్రదే॥",
          ta: "யன்மூலே ஸர்வதீர்த்தானி யன்மத்யே ஸர்வதேவதாஃ। யதக்ரே ஸர்வவேதாச்ச துளஸி த்வாம் நமாம்யஹம்॥\nதுளஸீ ஸ்ரீஸகி சுபே பாபஹாரிணி புண்யதே। நமஸ்தே நாரதனுதே நாராயணமனஃப்ரியே। ப்ரஸீத மாமகே கேஹே ஸதா திஷ்ட சுபப்ரதே॥",
          en: "Yanmule Sarva Tirthani Yanmadhye Sarva Devatah | Yadagre Sarva Vedashcha Tulasi Tvam Namamyaham ||\nTulasi Shri Sakhi Shubhe Papaharini Punyade | Namaste Naradanute Narayana Manahpriye | Prasida Mamake Gehe Sada Tishtha Shubhaprade ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ತುಳಸೀ ಕಟ್ಟೆಯ ಮುಂದೆ ತುಪ್ಪದ ದೀಪವನ್ನು ಇರಿಸಿ. ಗಂಧ, ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಸಮರ್ಪಿಸಿ ಮೂರು ಬಾರಿ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ.",
            outro: "ತುಳಸೀ ಮಾತೆಯ ಕೃಪೆಯಿಂದ ಮನೆಯ ಸಕಲ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಲಿ."
          },
          en: {
            intro: "Place a ghee lamp before the sacred Tulasi altar. Offer flowers, Akshata, and perform three clockwise turns.",
            outro: "May Mother Tulasi remove all planetary and spiritual afflictions."
          },
          te: {
            intro: "తులసి కోట వద్ద నెయ్యి దీపం ఉంచండి. పువ్వులు, అక్షతలు సమర్పించి మూడు ప్రదక్షిణలు చేయండి.",
            outro: "తులసీ దేవి కృపతో సర్వ దోషాలు తొలగిపోవుగాక."
          },
          ta: {
            intro: "துளசி மாடத்தின் முன் நெய் தீபம் வைத்து மலர்கள் சாற்றி மூன்று முறை வலம் வாருங்கள்.",
            outro: "துளசி மாதாவின் அருளால் அனைத்து தோஷங்களும் நீங்கட்டும்."
          },
          hi: {
            intro: "तुलसी महारानी के आगे घी का दीपक रखें। पुष्प, अक्षत अर्पित कर तीन परिक्रमा करें।",
            outro: "तुलसी माता की कृपा से घर के सभी दोष मिटें।"
          }
        },
        spokenPriestGuidance: "ತುಳಸೀ ಕಟ್ಟೆಯ ಮುಂದೆ ತುಪ್ಪದ ದೀಪವನ್ನು ಇರಿಸಿ. ಗಂಧ, ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಸಮರ್ಪಿಸಿ ಮೂರು ಬಾರಿ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ. यन्मूले सर्वतीर्थानि यन्मध्ये सर्वदेवताः। यदग्रे सर्ववेदाश्च तुलसि त्वां नमाम्यहम्॥ तुलसी श्रीसखि शुभे पापहारिणि पुण्यदे। नमस्ते नारदनुते नारायणमनःप्रिये। प्रसीद मामके गेहे सदा तिष्ठ शुभप्रदे॥ ತುಳಸೀ ಮಾತೆಯ ಕೃಪೆಯಿಂದ ಮನೆಯ ಸಕಲ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಲಿ.",
        hiddenPriestInstructionKn: "ಸಾಯಂಕಾಲದಲ್ಲಿ ತುಳಸೀ ದಳವನ್ನು ಕೀಳಬಾರದು, ಬದಲಾಗಿ ದೀಪ, ಧೂಪ, ಅಕ್ಷತೆಗಳಿಂದ ಪೂಜಿಸಿ ಪ್ರದಕ್ಷಿಣೆ ನಮಸ್ಕಾರ ಮಾಡಬೇಕು.",
        hiddenPriestInstructionEn: "Never pluck Tulasi leaves at sunset; worship with lamp, fragrance, and 3 clockwise pradakshinas.",
        approxSeconds: 35
      },
      {
        step: 4,
        titleKn: "೪. ಸಾಯಂ ಮಂಗಳಾರತಿ & ಸ್ತೋತ್ರ",
        titleEn: "4. Evening Arathi & Divine Stuti",
        actionCueKn: "🔔 ಘಂಟೆ ನುಡಿಸುತ್ತಾ ಮಂಗಳಾರತಿ ಬೆಳಗಿ ಸಾಯಂ ಸ್ತುತಿ ಪಠಿಸಿ",
        actionCueEn: "🔔 Wave sacred Arati with bell chimes and chant evening stuti",
        icon: "🔔",
        visualEffect: "arathi",
        mantraSanskrit: "सर्वमङ्गल माङ्गल्ये शिवे सर्वार्थ साधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥ शुभं भवतु कल्याणं आयुरारोग्य सम्पदः। धनधान्य समृद्धिश्च सर्वसौभाग्यदायकी॥",
        mantraL5: {
          kn: "ಸರ್ವಮಂಗಳ ಮಾಂಗಲ್ಯೇ ಶಿವೇ ಸರ್ವಾರ್ಥ ಸಾಧಿಕೇ । ಶರಣ್ಯೇ ತ್ರ್ಯಂಬಕೇ ಗೌರಿ ನಾರಾಯಣಿ ನಮೋಸ್ತು ತೇ ॥\nಶುಭಂ ಭವತು ಕಲ್ಯಾಣಂ ಆಯುರಾರೋಗ್ಯ ಸಂಪದಃ । ಧನಧಾನ್ಯ ಸಮೃದ್ಧಿಶ್ಚ ಸರ್ವಸೌಭಾಗ್ಯದಾಯಕೀ ॥",
          hi: "सर्वमङ्गल माङ्गल्ये शिवे सर्वार्थ साधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥\nशुभं भवतु कल्याणं आयुरारोग्य सम्पदः। धनधान्य समृद्धिश्च सर्वसौभाग्यदायकी॥",
          te: "సర్వమంగళ మాంగల్యే శివే సర్వార్థ సాధికే। శరణ్యే త్ర్యంబకే గౌరి నారాయణి నమోఽస్తు తే॥\nశుభం భవతు కల్యాణం ఆయురారోగ్య సంపదః। ధనధాన్య సమృద్ధిశ్చ సర్వసౌభాగ్యదాయకీ॥",
          ta: "ஸர்வமங்கள மாங்கல்யே சிவே ஸர்வார்த்த ஸாதிகே। சரண்யே த்ர்யம்பகே கௌரி நாராயணி நமோஸ்து தே॥\nசுபம் பவது கல்யாணம் ஆயுராரோக்ய ஸம்பதஃ। தனதான்ய ஸம்ருத்திச்ச ஸர்வஸௌபாக்யதாயகீ॥",
          en: "Sarva Mangala Mangalye Shive Sarvartha Sadhike | Sharanye Tryambake Gauri Narayani Namostu Te ||\nShubham Bhavatu Kalyanam Ayur Arogya Sampadah | Dhana Dhanya Samriddhishcha Sarva Saubhagyadayaki ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಘಂಟೆಯನ್ನು ನುಡಿಸುತ್ತಾ ದೇವರ ಮನೆಯಲ್ಲಿ ಸಂಧ್ಯಾ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ. ಜಗದಂಬೆಯನ್ನು ಧ್ಯಾನಿಸಿ.",
            outro: "ಮಂಗಳಾರತಿಯ ದಿವ್ಯ ಪ್ರಕಾಶವನ್ನು ಕಣ್ಣಿಗೆ ಒತ್ತಿಕೊಳ್ಳಿ."
          },
          en: {
            intro: "Wave the evening Arati lamp while ringing the bell, meditating on Mother Jagadamba.",
            outro: "Touch the sanctified flame to your eyes with devotion."
          },
          te: {
            intro: "గంట మ్రోగిస్తూ సంధ్యా హారతిని వెలిగించండి. జగన్మాతను ధ్యానించండి.",
            outro: "హారతి వెలుగును కళ్లకు అద్దుకోండి."
          },
          ta: {
            intro: "மணியை ஒலிக்கச் செய்து மாலை ஆரத்தியை ஏற்றுங்கள். அம்பிகையைத் தியானியுங்கள்.",
            outro: "ஆரத்தி ஒளியை கண்களில் ஒற்றிக் கொள்ளுங்கள்."
          },
          hi: {
            intro: "घंटी बजाते हुए संध्या आरती करें। जगदम्बा का ध्यान करें।",
            outro: "आरती की पावन ज्योति को आंखों से लगाएं।"
          }
        },
        spokenPriestGuidance: "ಘಂಟೆಯನ್ನು ನುಡಿಸುತ್ತಾ ದೇವರ ಮನೆಯಲ್ಲಿ ಸಂಧ್ಯಾ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ. ಜಗದಂಬೆಯನ್ನು ಧ್ಯಾನಿಸಿ. सर्वमङ्गल माङ्गल्ये शिवे सर्वार्थ साधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥ शुभं भवतु कल्याणं आयुरारोग्य सम्पदः। धनधान्य समृद्धिश्च सर्वसौभाग्यदायकी॥ ಮಂಗಳಾರತಿಯ ಪ್ರಕಾಶವನ್ನು ಕಣ್ಣಿಗೆ ಒತ್ತಿಕೊಳ್ಳಿ.",
        hiddenPriestInstructionKn: "ಸಾಯಂಕಾಲದ ಆರತಿಯು ಗೃಹದಲ್ಲಿ ಶಾಂತಿ, ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಧನಾತ್ಮಕ ಶಕ್ತಿಯನ್ನು ನೆಲೆಗೊಳಿಸುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Wave twilight Arati to purify home ambience and protect against nocturnal negativities.",
        approxSeconds: 30
      },
      {
        step: 5,
        titleKn: "೫. ಕಾಯೇನ ವಾಚಾ & ಶಾಂತಿ ಪ್ರಾರ್ಥನೆ",
        titleEn: "5. Kayena Vacha & Shanti Prayer",
        actionCueKn: "🙏 ಕೈಮುಗಿದು ಸಕಲ ಸಮರ್ಪಣೆ ಮಾಡಿ ಶಾಂತಿ ಮಂತ್ರ ಪಠಿಸಿ",
        actionCueEn: "🙏 Fold hands, surrender all actions to Lord, chant Om Shanti",
        icon: "🙏",
        visualEffect: "namaskara",
        mantraSanskrit: "कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात्। करोमि यद्यत्सकलं परस्मै नारायणायेति समर्पयामि॥ ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिः। ॐ शान्तिः शान्तिः शान्तिः॥",
        mantraL5: {
          kn: "ಕಾಯೇನ ವಾಚಾ ಮನಸೇಂದ್ರಿಯೈರ್ವಾ ಬುದ್ಧ್ಯಾತ್ಮನಾ ವಾ ಪ್ರಕೃತೇಃ ಸ್ವಭಾವಾತ್ ।\nಕರೋಮಿ ಯದ್ಯತ್ಸಕಲಂ ಪರಸ್ಮೈ ನಾರಾಯಣಾಯೇತಿ ಸಮರ್ಪಯಾಮಿ ॥\nಓಂ ದ್ಯೌಃ ಶಾಂತಿರಂತರಿಕ್ಷಂ ಶಾಂತಿಃ ಪೃಥಿವೀ ಶಾಂತಿರಾಪಃ ಶಾಂತಿಃ । ಓಂ ಶಾಂತಿಃ ಶಾಂತಿಃ ಶಾಂತಿಃ ॥",
          hi: "कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात्।\nकरोमि यद्यत्सकलं परस्मै नारायणायेति समर्पयामि॥\nॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिः। ॐ शान्तिः शान्तिः शान्तिः॥",
          te: "కాయేన వాచా మనసేంద్రియైర్వా బుద్ధ్యాత్మనా వా ప్రకృతేః స్వభావాత్।\nకరోమి యద్యత్సకలం పరస్మై నారాయణాయేతి సమర్పయామి॥\nఓం ద్యౌః శాంతిరంతరిక్షం శాంతిః పృథివీ శాంతిరాపః శాంతిః। ఓం శాంతిః శాంతిః శాంతిః॥",
          ta: "காயேன வாசா மனஸேந்த்ரியைர்வா புத்யாத்மனா வா ப்ரக்ருதேஃ ஸ்வபாவாத்।\nகரோமி யத்யத்ஸகலம் பரஸ்மை நாராயணாயேதி ஸமர்பயாமி॥\nஓம் த்யௌஃ சாந்திரந்தரிக்ஷம் சாந்திஃ ப்ருதிவீ சாந்திராபஃ சாந்திஃ। ஓம் சாந்திஃ சாந்திஃ சாந்திஃ॥",
          en: "Kayena Vacha Manasendriyairva Buddhyatmana Va Prakriteh Svabhavat |\nKaromi Yad Yat Sakalam Parasmai Narayanayeti Samarpayami ||\nOm Dyauh Shantir Antariksham Shantih Prithivi Shantir Apah Shantih | Om Shantih Shantih Shantih ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಕೈಮುಗಿದು ದಿನದ ಸಮಸ್ತ ಕರ್ಮಗಳನ್ನು ಭಗವಂತನ ಚರಣಾರವಿಂದಕ್ಕೆ ಸಮರ್ಪಿಸಿ.",
            outro: "ಸಾಯಂಕಾಲದ ಪೂಜಾ ವಿಧಿ ಯಶಸ್ವಿಯಾಗಿ ನೆರವೇರಿತು. ಓಂ ಶಾಂತಿಃ."
          },
          en: {
            intro: "Fold your hands and surrender all deeds of the day at the lotus feet of Lord Narayana.",
            outro: "Your evening twilight ritual is completed with cosmic peace. Om Shanti."
          },
          te: {
            intro: "చేతులు జోడించి రోజంతా చేసిన కర్మలను భగవంతునికి సమర్పించండి.",
            outro: "సాయం సంధ్యా పూజ సంపూర్ణమయింది. ఓం శాంతిః."
          },
          ta: {
            intro: "கைகூப்பி அன்றைய செயல்கள் அனைத்தையும் நாராயணனின் திருவடிகளில் அர்ப்பணியுங்கள்.",
            outro: "மாலை வழிபாடு இனிதே நிறைவுற்றது. ஓம் சாந்தி."
          },
          hi: {
            intro: "हाथ जोड़कर दिन भर के समस्त कर्म प्रभु के चरणों में समर्पित करें।",
            outro: "संध्या पूजा पूर्ण हुई। ॐ शांतिः शांतिः शांतिः।"
          }
        },
        spokenPriestGuidance: "ಕೈಮುಗಿದು ದಿನದ ಸಮಸ್ತ ಕರ್ಮಗಳನ್ನು ಭಗವಂತನ ಚರಣಾರವಿಂದಕ್ಕೆ ಸಮರ್ಪಿಸಿ. कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात्। करोमि यद्यत्सकलं परस्मै नारायणायेति समर्पयामि॥ ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिः। ॐ शान्तिः शान्तिः शान्तिः॥ ಸಾಯಂಕಾಲದ ಪೂಜಾ ವಿಧಿ ಯಶಸ್ವಿಯಾಗಿ ನೆರವೇರಿತು.",
        hiddenPriestInstructionKn: "ಕೊನೆಯಲ್ಲಿ ಶಾಂತಿ ಮಂತ್ರ ಪಠಣೆಯಿಂದ ಮನಸ್ಸಿಗೆ ಪ್ರಶಾಂತ ನಿದ್ರೆ ಮತ್ತು ಆರೋಗ್ಯಕರ ವಿಶ್ರಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Complete twilight pooja with total surrender to Lord Narayana and universal cosmic peace chant.",
        approxSeconds: 30
      }
    ]
  },

  // =========================================================================
  // POOJA 4: ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸಂಕಷ್ಟಹರ ಪೂಜಾ ವಿಧಿ (Sri Maha Ganapati Sankashtahara Pooja)
  // =========================================================================
  ganapati_pooja: {
    key: "ganapati_pooja",
    titleKn: "ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸಂಕಷ್ಟಹರ ಪೂಜಾ ವಿಧಿ",
    titleEn: "Sri Maha Ganapati Sankashtahara Vidhi",
    subtitleKn: "ಆವಾಹನೆ, ದೂರ್ವಾ-ಪುಷ್ಪಾರ್ಚನೆ, ಗಣಪತಿ ಜಪ (೨೧/೧೦೮), ಸಂಕಟನಾಶನ ಸ್ತೋತ್ರ ಹಾಗೂ ಮೋದಕ ನೈವೇದ್ಯ",
    subtitleEn: "Vedic Ganesha Pooja: Avahana, Durva Chanting, Obstacle Removal Stotra & Arathi",
    icon: "🐘",
    badgeTextKn: "ವಿಘ್ನನಿವಾರಕ · ಸಂಕಟಹರ",
    badgeTextEn: "Obstacle Remover · Sankashti",
    colorScheme: {
      primary: "#DC2626",
      border: "#EF4444",
      badgeBg: "#FEE2E2",
      gradient: "from-red-600 to-amber-700"
    },
    defaultJapaTarget: 21,
    steps: [
      {
        step: 1,
        titleKn: "೧. ಗಣೇಶ ಧ್ಯಾನ & ಆಚಮನ",
        titleEn: "1. Ganesha Dhyana & Inner Purity",
        actionCueKn: "💧 ಆಚಮನ ಮಾಡಿ ಶುಕ್ಲಾಂಬರಧರಂ ಮಂತ್ರದಿಂದ ಗಣಪತಿಯನ್ನು ಧ್ಯಾನಿಸಿ",
        actionCueEn: "💧 Perform Achamana and invoke Lord Ganesha with Shuklambaradharam",
        icon: "💧",
        visualEffect: "achamana",
        mantraSanskrit: "शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्। प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥ ॐ केशवाय स्वाहा, ॐ नारायणाय स्वाहा, ॐ माधवाय स्वाहा॥ हस्त प्रक्षालनम्॥",
        mantraL5: {
          kn: "ಶುಕ್ಲಾಂಬರಧರಂ ವಿಷ್ಣುಂ ಶಶಿವರ್ಣಂ ಚತುರ್ಭುಜಮ್ । ಪ್ರಸನ್ನವದನಂ ಧ್ಯಾಯೇತ್ ಸರ್ವವಿಘ್ನೋಪಶಾಂತಯೇ ॥\nಓಂ ಕೇಶವಾಯ ಸ್ವಾಹಾ, ಓಂ ನಾರಾಯಣಾಯ ಸ್ವಾಹಾ, ಓಂ ಮಾಧವಾಯ ಸ್ವಾಹಾ ॥ ಹಸ್ತ ಪ್ರಕ್ಷಾಲನಮ್ ॥",
          hi: "शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्। प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥\nॐ केशवाय स्वाहा, ॐ नारायणाय स्वाहा, ॐ माधवाय स्वाहा॥ हस्त प्रक्षालनम्॥",
          te: "శుక్లాంబరధరం విష్ణుం శశివర్ణం చతుర్భుజమ్। ప్రసన్నవదనం ధ్యాయేత్ సర్వవిఘ్నోపశాంతయే॥\nఓం కేశవాయ స్వాహా, ఓం నారాయణాయ స్వాహా, ఓం మాధవాయ స్వాహా॥ హస్త ప్రక్షాళనమ్॥",
          ta: "சுக்லாம்பரதரம் விஷ்ணும் சசிவர்ணம் சதுர்புஜம்। ப்ரஸன்னவதனம் த்யாயேத் ஸர்வவிக்நோபசாந்தயே॥\nஓம் கேசவாய ஸ்வாஹா, ஓம் நாராயணாய ஸ்வாஹா, ஓம் மாதவாய ஸ்வாஹா॥ ஹஸ்த ப்ரக்ஷாலனம்॥",
          en: "Shuklambaradharam Vishnum Shashivarnam Chaturbhujam | Prasanna Vadanam Dhyayet Sarva Vighnopashantaye ||\nOm Keshavaya Svaha, Om Narayanaya Svaha, Om Madhavaya Svaha || Hasta Prakshalanam ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಹರಿ ಓಂ. ಶ್ರೀ ಮಹಾಗಣಪತಿಯ ಪವಿತ್ರ ಸಂಕಷ್ಟಹರ ಪೂಜೆಗೆ ಸುಸ್ವಾಗತ. ಆಚಮನ ಪಾತ್ರೆಯಿಂದ ಮೂರು ಬಾರಿ ಜಲವನ್ನು ಸ್ವೀಕರಿಸಿ ಅಂಗೈ ಶುದ್ಧಿ ಮಾಡಿಕೊಳ್ಳಿ.",
            outro: "ವಿಘ್ನನಿವಾರಕನಾದ ಗಣಪತಿಯನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಧ್ಯಾನಿಸಿ."
          },
          en: {
            intro: "Hari Om. Welcome to the sacred Sankashtahara Ganesha worship. Take three sips with the Achamana spoon and purify your palms.",
            outro: "Meditate upon the elephant-faced Lord who removes all difficulties."
          },
          te: {
            intro: "హరి ఓం. శ్రీ మహాగణపతి సంకష్టహర పూజకు స్వాగతం. ఆచమనం చేసి మూడుసార్లు జలాన్ని స్వీకరించండి.",
            outro: "విఘ్ననివారకుడైన గణపతిని మనస్సులో ధ్యానించండి."
          },
          ta: {
            intro: "ஹரி ஓம். ஸ்ரீ மகா கணபதியின் சங்கடஹர பூஜைக்கு நல்வரவு. ஆசமனம் செய்து மூன்று முறை நீரை அருந்தி தூய்மை பெறுங்கள்.",
            outro: "விக்னங்களை அகற்றும் விநாயகரை மனதில் தியானியுங்கள்."
          },
          hi: {
            intro: "हरि ॐ। श्री महागणपति संकष्टहर पूजा में स्वागत है। आचमनी से तीन बार जल ग्रहण कर शुद्धि करें।",
            outro: "विघ्नहर्ता गणेश का हृदय में ध्यान करें।"
          }
        },
        spokenPriestGuidance: "ಹರಿ ಓಂ. ಶ್ರೀ ಮಹಾಗಣಪತಿಯ ಪವಿತ್ರ ಸಂಕಷ್ಟಹರ ಪೂಜೆಗೆ ಸುಸ್ವಾಗತ. ಆಚಮನ ಪಾತ್ರೆಯಿಂದ ಮೂರು ಬಾರಿ ಜಲವನ್ನು ಸ್ವೀಕರಿಸಿ ಅಂಗೈ ಶುದ್ಧಿ ಮಾಡಿಕೊಳ್ಳಿ. शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्। प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥ ॐ केशवाय स्वाहा, ॐ नारायणाय स्वाहा, ॐ माधवाय स्वाहा॥ हस्त प्रक्षालनम्॥ ವಿಘ್ನನಿವಾರಕನಾದ ಗಣಪತಿಯನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಧ್ಯಾನಿಸಿ.",
        hiddenPriestInstructionKn: "ಯಾವುದೇ ಪೂಜೆಯ ಆರಂಭದಲ್ಲಿ ಗಣಪತಿ ಧ್ಯಾನ ಮತ್ತು ಆಚಮನ ಅತ್ಯಗತ್ಯ. ಇದು ಸಮಸ್ತ ವಿಘ್ನಗಳನ್ನು ದಹಿಸುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Cleanse inner being with Achamana and meditate upon the elephant-faced lord.",
        approxSeconds: 30
      },
      {
        step: 2,
        titleKn: "೨. ಗಣೇಶ ಆವಾಹನೆ & ಪ್ರಾಣಪ್ರತಿಷ್ಠೆ",
        titleEn: "2. Ganesha Avahana (Sacred Invocation)",
        actionCueKn: "🌺 ಕೆಂಪು ಹೂವು-ಅಕ್ಷತೆ ಹಿಡಿದು ಗಣಪತಿಯನ್ನು ಪೀಠದಲ್ಲಿ ಆವಾಹಿಸಿ",
        actionCueEn: "🌺 Hold red flowers & akshata, invite Lord Ganesha into the altar",
        icon: "🌺",
        visualEffect: "namaskara",
        mantraSanskrit: "ॐ गणानां त्वा गणपतिं हवामहे कविं कवीनामुपमश्रवस्तमम्। ज्येष्ठराजं ब्रह्मणां ब्रह्मणस्पत आ नः शृण्वन्नूतिभिः सीद सादनम्॥ अस्य प्राणाः प्रतिष्ठन्तु अस्य प्राणाः क्षरन्तु च। श्री महागणपतये नमः आवाहयामि स्थापयामि पूजयामि॥",
        mantraL5: {
          kn: "ಓಂ ಗಣಾನಾಂ ತ್ವಾ ಗಣಪತಿಂ ಹವಾಮಹೇ ಕವಿಂ ಕವೀನಾಮುಪಮಶ್ರವಸ್ತಮಮ್ ।\nಜ್ಯೇಷ್ಠರಾಜಂ ಬ್ರಹ್ಮಣಾಂ ಬ್ರಹ್ಮಣಸ್ಪತ ಆ ನಃ ಶೃಣ್ವನ್ನೂತಿಭಿಃ ಸೀದ ಸಾದನಮ್ ॥\nಅಸ್ಯ ಪ್ರಾಣಾಃ ಪ್ರತಿಷ್ಠಂತು ಅಸ್ಯ ಪ್ರಾಣಾಃ ಕ್ಷರಂತು ಚ ।\nಶ್ರೀ ಮಹಾಗಣಪತಯೇ ನಮಃ ಆವಾಹಯಾಮಿ ಸ್ಥಾಪಯಾಮಿ ಪೂಜಯಾಮಿ ॥",
          hi: "ॐ गणानां त्वा गणपतिं हवामहे कविं कवीनामुपमश्रवस्तमम्।\nज्येष्ठराजं ब्रह्मणां ब्रह्मणस्पत आ नः शृण्वन्नूतिभिः सीद सादनम्॥\nअस्य प्राणाः प्रतिष्ठन्तु अस्य प्राणाः क्षरन्तु च।\nश्री महागणपतये नमः आवाहयामि स्थापयामि पूजयामि॥",
          te: "ఓం గణానాం త్వా గణపతిం హవామహే కవిం కవీనాముపమశ్రవస్తమమ్।\nజ్యేష్ఠరాజం బ్రహ్మణాం బ్రహ్మణస్పత ఆ నః శృణ్వన్నూతిభిః సీద సాదనమ్॥\nఅస్య ప్రాణాః ప్రతిష్ఠంతు అస్య ప్రాణాః క్షరంతు చ।\nశ్రీ మహాగణపతయే నమః ఆవాహయామి స్థాపయామి పూజయామి॥",
          ta: "ஓம் கணானாம் த்வா கணபதிம் ஹவாமஹே கவிம் கவீனामुபமச்ரவஸ்தமம்।\nஜ்யேஷ்டராஜம் ப்ரம்ஹணாம் ப்ரம்ஹணஸ்பத ஆ நஃ ச்ருண்வன்னூதிபிஃ ஸீத ஸாதனம்॥\nஅஸ்ய ப்ராணாஃ ப்ரதிஷ்டந்து அஸ்ய ப்ராணாஃ க்ஷரந்து ச।\nஸ்ரீ மஹாகணபதயே நமஃ ஆவாஹயாமி ஸ்தாபயாமி பூஜயாமி॥",
          en: "Om Gananam Tva Ganapatigm Havamahe Kavim Kavinam Upamashravastamam |\nJyeshtharajam Brahmanam Brahmanaspata A Nah Shrinvannutibhih Sida Sadanam ||\nAsya Pranah Pratishthantu Asya Pranah Ksharantu Cha |\nShri Mahaganapataye Namah Avahayami Sthapayami Poojayami ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಕೈಯಲ್ಲಿ ಕೆಂಪು ಹೂವು ಮತ್ತು ಅಕ್ಷತೆಯನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ. ಋಗ್ವೇದೋಕ್ತ ಗಣಪತಿ ಆವಾಹನ ಮಂತ್ರದಿಂದ ಗಣೇಶನನ್ನು ಆವಾಹಿಸಿ.",
            outro: "ಕೈಯಲ್ಲಿರುವ ಹೂವು-ಅಕ್ಷತೆಯನ್ನು ಗಣಪತಿಯ ಪಾದಗಳಿಗೆ ಅರ್ಪಿಸಿ."
          },
          en: {
            intro: "Hold red flowers and Akshata in your hands. Invoke Lord Ganesha into the altar with the sacred Rigvedic hymn.",
            outro: "Offer the flowers reverently at the feet of Lord Ganesha."
          },
          te: {
            intro: "చేతిలో ఎర్రటి పువ్వులు, అక్షతలు పట్టుకోండి. వేద మంత్రంతో గణపతిని ఆవాహన చేయండి.",
            outro: "పుష్పాక్షతలను గణపతి పాదాల వద్ద సమర్పించండి."
          },
          ta: {
            intro: "கையில் சிகப்பு மலர்களையும் அட்சதையையும் ஏந்தி ரிக்வேத கணபதி மந்திரத்தால் ஆவாஹனம் செய்யுங்கள்.",
            outro: "மலர்களை கணபதியின் திருவடிகளில் சமர்ப்பியுங்கள்."
          },
          hi: {
            intro: "हाथ में लाल पुष्प और अक्षत लें। ऋग्वेदोक्त गणपति आवाह्न मंत्र से प्रभु का आवाह्न करें।",
            outro: "पुष्प और अक्षत गणेश जी के चरणों में अर्पित करें।"
          }
        },
        spokenPriestGuidance: "ಕೈಯಲ್ಲಿ ಕೆಂಪು ಹೂವು ಮತ್ತು ಅಕ್ಷತೆಯನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ. ಋಗ್ವೇದೋಕ್ತ ಗಣಪತಿ ಆವಾಹನ ಮಂತ್ರದಿಂದ ಗಣೇಶನನ್ನು ಆವಾಹಿಸಿ. ॐ गणानां त्वा गणपतिं हवामहे कविं कवीनामुपमश्रवस्तमम्। ज्येष्ठराजं ब्रह्मणां ब्रह्मणस्पत आ नः शृण्वन्नूतिभिः सीद सादनम्॥ अस्य प्राणाः प्रतिष्ठन्तु अस्य प्राणाः क्षरन्तु च। श्री महागणपतये नमः आवाहयामि स्थापयामि पूजयामि॥ ಕೈಯಲ್ಲಿರುವ ಹೂವು-ಅಕ್ಷತೆಯನ್ನು ಗಣಪತಿಯ ಪಾದಗಳಿಗೆ ಅರ್ಪಿಸಿ.",
        hiddenPriestInstructionKn: "ವೈದಿಕ ಮಂತ್ರದಿಂದ ಗಣಪತಿಯನ್ನು ಆವಾಹಿಸಿ ರತ್ನಸಿಂಹಾಸನ, ಪಾದ್ಯ, ಅರ್ಘ್ಯ, ಆಚಮನೀಯಗಳನ್ನು ಸಮರ್ಪಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Chant the Vedic Ganapati hymn and install the divine presence in the idol/yantra.",
        approxSeconds: 35
      },
      {
        step: 3,
        titleKn: "೩. ದೂರ್ವಾ-ಪುಷ್ಪಾರ್ಚನೆ & ಗಣೇಶ ಮಂತ್ರ ಜಪ (೨೧ ಬಾರಿ)",
        titleEn: "3. Durva Leaf Offering & Japa (21 Times)",
        actionCueKn: "🌿 ಗರಿಕೆ (ದೂರ್ವೆ) ಸಮರ್ಪಿಸುತ್ತಾ 'ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ' ೨೧ ಬಾರಿ ಜಪಿಸಿ",
        actionCueEn: "🌿 Offer sacred Durva grass blades chanting Om Gam Ganapataye Namah 21 times",
        icon: "🌿",
        visualEffect: "japa",
        japaTarget: 21,
        japaMantra: "ॐ गं गणपतये नमः॥",
        mantraSanskrit: "ॐ गं गणपतये नमः। गणाधिपाय नमः। उमापुत्राय नमः। विघ्ननाशनाय नमः। विनायकाय नमः। ईशपुत्राय नमः। सर्वसिद्धिप्रदायकाय नमः॥ दूर्वादलं रक्तपुष्पं च समर्पयामि॥",
        mantraL5: {
          kn: "ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ । ಗಣಾಧಿಪಾಯ ನಮಃ । ಉಮಾಪುತ್ರಾಯ ನಮಃ ।\nವಿಘ್ನನಾಶನಾಯ ನಮಃ । ವಿನಾಯಕಾಯ ನಮಃ । ಈಶಪುತ್ರಾಯ ನಮಃ । ಸರ್ವಸಿದ್ಧಿಪ್ರದಾಯಕಾಯ ನಮಃ ॥\nದೂರ್ವಾದಳಂ ರಕ್ತಪುಷ್ಪಂ ಚ ಸಮರ್ಪಯಾಮಿ ॥\n(೨೧ ಬಾರಿ ಮಂತ್ರ ಜಪ)",
          hi: "ॐ गं गणपतये नमः। गणाधिपाय नमः। उमापुत्राय नमः।\nविघ्ननाशनाय नमः। विनायकाय नमः। ईशपुत्राय नमः। सर्वसिद्धिप्रदायकाय नमः॥\nदूर्वादलं रक्तपुष्पं च समर्पयामि॥\n(२१ बार मन्त्र जप)",
          te: "ఓం గం గణపతయే నమః। గణాధిపాయ నమః। ఉమాపుత్రాయ నమః।\nవిఘ్ననాశనాయ నమః। వినాయకాయ నమః। ఈశపుత్రాయ నమః। సర్వసిద్ధిప్రదాయకాయ నమః॥\nదూర్వాదళం రక్తపుష్పం చ సమర్పయామి॥\n(21 సార్లు మంత్ర జపం)",
          ta: "ஓம் கம் கணபதயே நமஃ। கணாதிபாய நமஃ। உமாபுத்ராய நமஃ।\nவிக்நநாசனாய நமஃ। விநாயகாய நமஃ। ஈசபுத்ராய நமஃ। ஸர்வஸித்திப்ரதாயகாய நமஃ॥\nதூர்வாதளம் ரக்தபுஷ்பம் ச ஸமர்பயாமி॥\n(21 முறை மந்திர ஜபம்)",
          en: "Om Gam Ganapataye Namah | Ganadhipaya Namah | Umaputraya Namah |\nVighnanashanaya Namah | Vinayakaya Namah | Ishaputraya Namah | Sarvasiddhipradayakaya Namah ||\nDurvadalam Raktapushpam Cha Samarpayami ||\n(Chant 21 Times)"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಗಣೇಶನಿಗೆ ಪರಮ ಪ್ರಿಯವಾದ ಗರಿಕೆ ಅಂದರೆ ದೂರ್ವಾದಳ ಹಾಗೂ ಕೆಂಪು ಹೂವುಗಳನ್ನು ಕೈಯಲ್ಲಿ ಹಿಡಿಯಿರಿ. ಪ್ರತಿ ಬಾರಿ ಸಮರ್ಪಿಸುತ್ತಾ ಮೂಲ ಮಂತ್ರವನ್ನು ಇಪ್ಪತ್ತೊಂದು ಬಾರಿ ಜಪಿಸಿ.",
            outro: "ಗಣಪತಿಯು ನಿಮ್ಮ ಸರ್ವ ಸಂಕಷ್ಟಗಳನ್ನು ಕಳೆಯಲಿ."
          },
          en: {
            intro: "Hold sacred blades of Durva grass and red flowers. Offer them one by one while chanting the Ganesha Moola Mantra 21 times.",
            outro: "May Lord Ganesha remove all your obstacles and grant success."
          },
          te: {
            intro: "గణపతికి ప్రీతిపాత్రమైన గరిక మరియు ఎరుపు పూలను చేతిలో తీసుకోండి. 21 సార్లు మూల మంత్రాన్ని జపిస్తూ సమర్పించండి.",
            outro: "గణపతి మీ సర్వ సంకటాలను నివారించుగాక."
          },
          ta: {
            intro: "விநாயகருக்கு மிகவும் பிடித்த அருகம்புல் மற்றும் சிவப்பு மலர்களை ஏந்தி 21 முறை மூல மந்திரத்தை ஜபித்து அர்ச்சனை செய்யுங்கள்.",
            outro: "கணபதி உங்கள் சகல சங்கடங்களையும் தீர்க்கட்டும்."
          },
          hi: {
            intro: "गणेश जी को प्रिय दुर्वा तथा लाल पुष्प हाथ में लें। इक्कीस बार मूल मंत्र जपते हुए दुर्वा अर्पित करें।",
            outro: "गणपति आपके समस्त संकटों का नाश करें।"
          }
        },
        spokenPriestGuidance: "ಗಣೇಶನಿಗೆ ಪರಮ ಪ್ರಿಯವಾದ ಗರಿಕೆ ಅಂದರೆ ದೂರ್ವಾದಳ ಹಾಗೂ ಕೆಂಪು ಹೂವುಗಳನ್ನು ಕೈಯಲ್ಲಿ ಹಿಡಿಯಿರಿ. ಪ್ರತಿ ಬಾರಿ ಸಮರ್ಪಿಸುತ್ತಾ ಮೂಲ ಮಂತ್ರವನ್ನು ಇಪ್ಪತ್ತೊಂದು ಬಾರಿ ಜಪಿಸಿ. ॐ गं गणपतये नमः। गणाधिपाय नमः। उमापुत्राय नमः। विघ्ननाशनाय नमः। विनायकाय नमः। ईशपुत्राय नमः। सर्वसिद्धिप्रदायकाय नमः॥ दूर्वादलं रक्तपुष्पं च समर्पयामि॥ ಗಣಪತಿಯು ನಿಮ್ಮ ಸರ್ವ ಸಂಕಷ್ಟಗಳನ್ನು ಕಳೆಯಲಿ.",
        hiddenPriestInstructionKn: "ಗಣಪತಿಗೆ ೨೧ ದೂರ್ವಾದಳಗಳನ್ನು ಏಕೈಕವಾಗಿ ಮಂತ್ರಪೂರ್ವಕ ಸಮರ್ಪಿಸುವುದು ಸಂಕಷ್ಟಹರ ಪೂಜೆಯ ಪ್ರಮುಖ ಅಂಗ.",
        hiddenPriestInstructionEn: "Offer 21 blades of fresh Durva grass paired with red flowers while chanting the Ganesha Moola mantra.",
        approxSeconds: 45
      },
      {
        step: 4,
        titleKn: "೪. ಸಂಕಟನಾಶನ ಗಣೇಶ ಸ್ತೋತ್ರಂ",
        titleEn: "4. Sankata Nashana Ganesha Stotram",
        actionCueKn: "📜 ಕೈಮುಗಿದು ನಾರದ ಪುರಾಣೋಕ್ತ ಸಂಕಟನಾಶನ ಸ್ತೋತ್ರ ಪಠಿಸಿ",
        actionCueEn: "📜 Fold hands and chant the sacred 12 names from Narada Purana",
        icon: "📜",
        visualEffect: "namaskara",
        mantraSanskrit: "प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम्। भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये॥ प्रथमं वक्रतुण्डं च एकदन्तं द्वितीयकम्। तृतीयं कृष्णपिङ्गाक्षं गजवक्त्रं चतुर्थकम्॥ लम्बोदरं पञ्चमं च षष्ठं विकटमेव च। सप्तमं विघ्नराजेन्द्रं धूम्रवर्णं तथाष्टमम्॥ नवमं भालचन्द्रं च दशमं तु विनायकम्। एकादशं गणपतिं द्वादशं तु गजाननम्॥ द्वादशैतानि नामानि त्रिसन्ध्यं यः पठेन्नरः। न च विघ्नभयं तस्य सर्वसिद्धिकरं प्रभो॥",
        mantraL5: {
          kn: "ಪ್ರಣಮ್ಯ ಶಿರಸಾ ದೇವಂ ಗೌರೀಪುತ್ರಂ ವಿನಾಯಕಮ್ । ಭಕ್ತಾವಾಸಂ ಸ್ಮರೇನ್ನಿತ್ಯಮಾಯುಃಕಾಮಾರ್ಥಸಿದ್ಧಯೇ ॥\nಪ್ರಥಮಂ ವಕ್ರತುಂಡಂ ಚ ಏಕದಂತಂ ದ್ವಿತೀಯಕಮ್ । ತೃತೀಯಂ ಕೃಷ್ಣಪಿಂಗಾಕ್ಷಂ ಗಜವಕ್ತ್ರಂ ಚತುರ್ಥಕಮ್ ॥\nಲಂಬೋದರಂ ಪಂಚಮಂ ಚ ಷಷ್ಠಂ ವಿಕಟಮೇವ ಚ । ಸಪ್ತಮಂ ವಿಘ್ನರಾಜೇಂದ್ರಂ ಧೂಮ್ರವರ್ಣಂ ತಥಾಷ್ಟಮಮ್ ॥\nನವಮಂ ಭಾಲಚಂದ್ರಂ ಚ ದಶಮಂ ತು ವಿನಾಯಕಮ್ । ಏಕಾದಶಂ ಗಣಪತಿಂ ದ್ವಾದಶಂ ತು ಗಜಾನನಮ್ ॥\nದ್ವಾದಶೈತಾನಿ ನಾಮಾನಿ ತ್ರಿಸಂಧ್ಯಂ ಯಃ ಪಠೇನ್ನರಃ । ನ ಚ ವಿಘ್ನಭಯಂ ತಸ್ಯ ಸರ್ವಸಿದ್ಧಿಕರಂ ಪ್ರಭೋ ॥",
          hi: "प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम्। भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये॥\nप्रथमं वक्रतुण्डं च एकदन्तं द्वितीयकम्। तृतीयं कृष्णपिङ्गाक्षं गजवक्त्रं चतुर्थकम्॥\nलम्बोदरं पञ्चमं च षष्ठं विकटमेव च। सप्तमं विघ्नराजेन्द्रं धूम्रवर्णं तथाष्टमम्॥\nनवमं भालचन्द्रं च दशमं तु विनायकम्। एकादशं गणपतिं द्वादशं तु गजाननम्॥\nद्वादशैतानि नामानि त्रिसन्ध्यं यः पठेन्नरः। न च विघ्नभयं तस्य सर्वसिद्धिकरं प्रभो॥",
          te: "ప్రణమ్య శిరసా దేవం గౌరీపుత్రం వినాయకమ్। భక్తావాసం స్మరేన్నిత్యమాయుఃకామార్థసిద్ధయే॥\nప్రథమం వక్రతుండం చ ఏకదంతం ద్వితీయకమ్। తృతీయం కృష్ణపింగాక్షం గజవక్త్రం చతుర్థకమ్॥\nలంబోదరం పంచమం చ షష్ఠం వికటమేవ చ। సప్తమం విఘ్నరాజేంద్రం ధూమ్రవర్ణం తథాష్టమమ్॥\nనవమం భాలచంద్రం చ దశమం తు వినాయకమ్। ఏకాదశం గణపతిం ద్వాదశం తు గజాననమ్॥\nద్వాదశైతాని నామాని త్రిసంధ్యం యః పఠేన్నరః। న చ విఘ్నభయం తస్య సర్వసిద్ధికరం ప్రభో॥",
          ta: "ப்ரணம்ய சிரஸா தேவம் கௌரீபுத்ரம் விநாயகம்। பக்தாவாஸம் ஸ்மரேந்நித்யமாயுஃகாமார்த்தஸித்தயே॥\nப்ரதமம் வக்ரதுண்டம் ச ஏகதந்தம் த்விதீயகம்। த்ருதீயம் க்ருஷ்ணபிங்காக்ஷம் கஜவக்த்ரம் சதுர்த்தகம்॥\nலம்போதரம் பஞ்சமம் ச ஷஷ்டம் விகடமேவ ச। ஸப்தமம் விக்நராஜேந்த்ரம் தூம்ரவர்ணம் ததாஷ்டமம்॥\nநவமம் பாலசந்த்ரம் ச தசமம் து விநாயகம்। ஏகாதசம் கணபதிம் த்வாதசம் து கஜானனம்॥\nத்வாதசைதானி நாமானி த்ரிஸந்த்யம் யஃ படேந்நரஃ। ந ச விக்நபயம் தஸ்ய ஸர்வஸித்திகரம் ப்ரபோ॥",
          en: "Pranamya Shirasa Devam Gauriputram Vinayakam | Bhaktavasam Smarennityam Ayuh Kamartha Siddhaye ||\nPrathamam Vakratundam Cha Ekadantam Dvitiyakam | Tritiyam Krishnapingaksham Gajavaktram Chaturthakam ||\nLambodaram Panchamam Cha Shashtam Vikatameva Cha | Saptamam Vighnarajendram Dhumravarnam Tathashtamam ||\nNavamam Bhalachandram Cha Dashamam Tu Vinayakam | Ekadasham Ganapatim Dvadasham Tu Gajananam ||\nDvadashaitani Namani Trisandhyam Yah Pathennarah | Na Cha Vighnabhayam Tasya Sarvasiddhikaram Prabho ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಸಕಲ ಸಂಕಷ್ಟಗಳನ್ನು ಪರಿಹರಿಸುವ ನಾರದ ಪುರಾಣೋಕ್ತ ಸಂಕಟನಾಶನ ಗಣೇಶ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸಿ.",
            outro: "ಗಣೇಶನ ದ್ವಾದಶ ನಾಮಗಳು ಸರ್ವ ಸಿದ್ಧಿಗಳನ್ನು ಕರುಣಿಸಲಿ."
          },
          en: {
            intro: "Chant the sacred Sankata Nashana Ganesha Stotram from Narada Purana to dissolve all distress.",
            outro: "May the twelve divine names bestow success in all your undertakings."
          },
          te: {
            intro: "సకల కష్టాలను నివారించే నారద పురాణోక్త సంకటనాశన స్తోత్రాన్ని భక్తితో పఠించండి.",
            outro: "ద్వాదశ నామాలు సర్వ సిద్ధులను ప్రసాదించుగాక."
          },
          ta: {
            intro: "சகல துன்பங்களையும் போக்கும் நாரத புராண சங்கடநாசன விநாயகர் ஸ்தோத்திரத்தைப் படியுங்கள்.",
            outro: "பன்னிரு திருநாமங்கள் சகல வெற்றிகளையும் அருளட்டும்."
          },
          hi: {
            intro: "सभी संकटों के निवारण हेतु नारद पुराणोक्त संकटनाशन गणेश स्तोत्र का पाठ करें।",
            outro: "द्वादश नाम स्मरण से सर्व सिद्धियां प्राप्त हों।"
          }
        },
        spokenPriestGuidance: "ಸಕಲ ಸಂಕಷ್ಟಗಳನ್ನು ಪರಿಹರಿಸುವ ನಾರದ ಪುರಾಣೋಕ್ತ ಸಂಕಟನಾಶನ ಗಣೇಶ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸಿ. प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम्। भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये॥ प्रथमं वक्रतुण्डं च एकदन्तं द्वितीयकम्। तृतीयं कृष्णपिङ्गाक्षं गजवक्त्रं चतुर्थकम्॥ लम्बोदरं पञ्चमं च षष्ठं विकटमेव च। सप्तमं विघ्नराजेन्द्रं धूम्रवर्णं तथाष्टमम्॥ नवमं भालचन्द्रं च दशमं तु विनायकम्। एकादशं गणपतिं द्वादशं तु गजाननम्॥ द्वादशैतानि नामानि त्रिसन्ध्यं यः पठेन्नरः। न च विघ्नभयं तस्य सर्वसिद्धिकरं प्रभो॥ ಗಣೇಶನ ದ್ವಾದಶ ನಾಮಗಳು ಸರ್ವ ಸಿದ್ಧಿಗಳನ್ನು ಕರುಣಿಸಲಿ.",
        hiddenPriestInstructionKn: "ದ್ವಾದಶ ನಾಮ ಸ್ಮರಣೆಯು ಯಾವುದೇ ಕಾರ್ಯಾರಂಭದ ವಿಘ್ನಗಳನ್ನು, ರೋಗ-ಭಯಗಳನ್ನು ಮತ್ತು ಕಷ್ಟಗಳನ್ನು ನಿವಾರಿಸುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Chanting the twelve names of Lord Ganesha eliminates obstacles and brings all-round auspiciousness.",
        approxSeconds: 45
      },
      {
        step: 5,
        titleKn: "೫. ಮೋದಕ ನೈವೇದ್ಯ & ಮಹಾಮಂಗಳಾರತಿ",
        titleEn: "5. Modaka Naivedya & Mahamangalarathi",
        actionCueKn: "🔔 ಮೋದಕ/ಬೆಲ್ಲ ನೈವೇದ್ಯ ಮಾಡಿ ಕರ್ಪೂರ ಮಂಗಳಾರತಿ ಬೆಳಗಿಸಿ",
        actionCueEn: "🔔 Offer modakas or jaggery, wave camphor arati with bell",
        icon: "🔔",
        visualEffect: "arathi",
        mantraSanskrit: "ॐ भूर्भुवस्सुवः। सत्यं त्वर्तेन परिषिञ्चामि। अमृतोपस्तरणमसि स्वाहा॥ श्री महागणपतये मोदकं गुड-फलं च समर्पयामि॥",
        mantraSanskritPart2: "एकदन्ताय विद्महे वक्रतुण्डाय धीमहि। तन्नो दन्तिः प्रचोदयात्॥ महामङ्गलारतिं समर्पयामि॥",
        mantraL5: {
          kn: "ಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ । ಸತ್ಯಂ ತ್ವರ್ತೇನ ಪರಿಷಿಂಚಾಮಿ । ಅಮೃತೋಪಸ್ತರಣಮಸಿ ಸ್ವಾಹಾ ॥\nಶ್ರೀ ಮಹಾಗಣಪತಯೇ ಮೋದಕಂ ಗುಡ-ಫಲಂ ಚ ಸಮರ್ಪಯಾಮಿ ॥\nಏಕದಂತಾಯ ವಿದ್ಮಹೇ ವಕ್ರತುಂಡಾಯ ಧೀಮಹಿ । ತನ್ನೋ ದಂತಿಃ ಪ್ರಚೋದಯಾತ್ ॥\nಮಹಾಮಂಗಳಾರತಿಂ ಸಮರ್ಪಯಾಮಿ ॥",
          hi: "ॐ भूर्भुवस्सुवः। सत्यं त्वर्तेन परिषिञ्चामि। अमृतोपस्तरणमसि स्वाहा॥\nश्री महागणपतये मोदकं गुड-फलं च समर्पयामि॥\nएकदन्ताय विद्महे वक्रतुण्डाय धीमहि। तन्नो दन्तिः प्रचोदयात्॥\nमहामङ्गलारतिं समर्पयामि॥",
          te: "ఓం భూర్భුවస్సువః। సత్యం త్వర్తేన పరిషించామి। అమృతోపస్తరణమసి స్వాహా॥\nశ్రీ మహాగణపతయే మోదకం గుడ-ఫలం చ సమర్పయామి॥\nఏకదంతాయ విద్మహే వక్రతుండాయ ధీమహి। తన్నో దంతిః ప్రచోదయాత్॥\nమహామంగళారతిం సమర్పయామి॥",
          ta: "ஓம் பூர்புவஸ்ஸுவஃ। ஸத்யம் த்வர்தேன பரிஷிஞ்சாமி। அம்ருதோபஸ்தரணமஸி ஸ்வாஹா॥\nஸ்ரீ மஹாகணபதயே மோதகம் குட-பலம் ச ஸமர்பயாமி॥\nஏகதந்தாய வித்மஹே வக்ரதுண்டாய தீமஹி। தன்னோ தந்திஃ ப்ரசோதயாத்॥\nமஹாமங்களாரதிம் ஸமர்பயாமி॥",
          en: "Om Bhur Bhuvas Suvah | Satyam Tvartena Parishinchami | Amritopastaranamasi Svaha ||\nShri Mahaganapataye Modakam Guda-Phalam Cha Samarpayami ||\nEkadantaya Vidmahe Vakratundaya Dhimahi | Tanno Dantih Prachodayat ||\nMahamangalaratim Samarpayami ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಗಣೇಶನಿಗೆ ಅತ್ಯಂತ ಪ್ರಿಯವಾದ ಮೋದಕ, ಬೆಲ್ಲ ಅಥವಾ ಹಣ್ಣುಗಳನ್ನು ಭಕ್ತಿಯಿಂದ ನೈವೇದ್ಯ ಮಾಡಿ.",
            mid: "ಈಗ ಗಣೇಶ ಗಾಯತ್ರಿಯೊಂದಿಗೆ ಕರ್ಪೂರ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ.",
            outro: "ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ ಗಣಪತಿಯ ಆಶೀರ್ವಾದ ಪಡೆಯಿರಿ. ಪೂಜೆ ಸಂಪನ್ನವಾಯಿತು."
          },
          en: {
            intro: "Offer sweet Modakas, fruits, or jaggery to Lord Ganesha with deep love.",
            mid: "Now wave the sacred camphor Arati chanting the Ganesha Gayatri.",
            outro: "Prostrate before the Lord and receive His supreme grace. Pooja is blessed."
          },
          te: {
            intro: "గణపతికి ప్రీతిపాత్రమైన మోదకాలు, బెల్లం నైవేద్యంగా సమర్పించండి.",
            mid: "గణేశ గాయత్రితో కర్పూర హారతిని వెలిగించండి.",
            outro: "సాష్టాంగ నమస్కారం చేసి అనుగ్రహం పొందండి. పూజ సంపూర్ణమయింది."
          },
          ta: {
            intro: "விநாயகருக்கு பிடித்த கொழுக்கட்டை மற்றும் பழங்களை நைவேத்தியம் செய்யுங்கள்.",
            mid: "கணேச காயத்ரியுடன் கற்பூர ஆரத்தியை ஏற்றுங்கள்.",
            outro: "வணங்கி பிரசாதம் ஏற்றுக்கொள்ளுங்கள். பூஜை இனிதே நிறைவுற்றது."
          },
          hi: {
            intro: "गणेश जी को प्रिय मोदक अथवा फलों का भोग लगाएं।",
            mid: "अब गणेश गायत्री के साथ कर्पूर मंगल आरती करें।",
            outro: "साष्टांग प्रणाम कर गणपति का आशीर्वाद लें। पूजा संपन्न हुई।"
          }
        },
        spokenPriestGuidance: "ಗಣೇಶನಿಗೆ ಅತ್ಯಂತ ಪ್ರಿಯವಾದ ಮೋದಕ, ಬೆಲ್ಲ ಅಥವಾ ಹಣ್ಣುಗಳನ್ನು ನೈವೇದ್ಯ ಮಾಡಿ. ॐ भूर्भुवस्सुवः। सत्यं त्वर्तेन परिषिञ्चामि। अमृतोपस्तरणमसि स्वाहा॥ श्री महागणपतये मोदकं गुड-फलं च समर्पयामि॥ ಈಗ ಗಣೇಶ ಗಾಯತ್ರಿಯೊಂದಿಗೆ ಕರ್ಪೂರ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ. एकदन्ताय विद्महे वक्रतुण्डाय धीमहि। तन्नो दन्तिः प्रचोदयात्॥ महामङ्गलारतिं समर्पयामि॥ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ ಗಣಪತಿಯ ಅನುಗ್ರಹವನ್ನು ಸ್ವೀಕರಿಸಿ.",
        hiddenPriestInstructionKn: "ಮೋದಕ ಸಮರ್ಪಣೆಯು ಗಣಪತಿಗೆ ಅತ್ಯುತ್ಸಾಹ ತರುತ್ತದೆ. ಗಣೇಶ ಗಾಯತ್ರಿಯಿಂದ ಮಂಗಳಾರತಿ ಬೆಳಗಿಸಿ ಪ್ರಸಾದ ಸ್ವೀಕರಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Offer sweet Modakas/fruits followed by camphor arati with Ganesha Gayatri.",
        approxSeconds: 35
      }
    ]
  },

  // =========================================================================
  // POOJA 5: ಶ್ರೀ ಶಿವ ಪೂಜಾ, ರುದ್ರಾಭಿಷೇಕ & ಬಿಲ್ವಾರ್ಚನಾ ಮಹಾವಿಧಿ
  // =========================================================================
  shiva_pooja: {
    key: "shiva_pooja",
    titleKn: "ಶ್ರೀ ಶಿವ ಪೂಜಾ, ರುದ್ರಾಭಿಷೇಕ & ಬಿಲ್ವಾರ್ಚನಾ ವಿಧಿ",
    titleEn: "Sri Shiva Pooja, Rudrabhisheka & Bilvarchana",
    subtitleKn: "ಭಸ್ಮಧಾರಣೆ, ಶಿವ ಧ್ಯಾನ, ರುದ್ರಾಭಿಷೇಕ, ಬಿಲ್ವಾಷ್ಟಕ, ಓಂ ನಮಃ ಶಿವಾಯ (೧೦೮ ಜಪ) ಹಾಗೂ ಮಹಾಮೃತ್ಯುಂಜಯ",
    subtitleEn: "Vedic Shiva Pooja: Bhasma, Abhisheka, Bilvashtaka, 108 Chants & Mahamrityunjaya",
    icon: "🔱",
    badgeTextKn: "ರುದ್ರಾಭಿಷೇಕ · ೧೦೮ ಜಪ",
    badgeTextEn: "Rudrabhisheka · 108 Chants",
    colorScheme: {
      primary: "#0F766E",
      border: "#14B8A6",
      badgeBg: "#CCFBF1",
      gradient: "from-teal-700 to-emerald-800"
    },
    defaultJapaTarget: 108,
    steps: [
      {
        step: 1,
        titleKn: "೧. ಭಸ್ಮಧಾರಣೆ, ಆಚಮನ & ಶಿವ ಧ್ಯಾನ",
        titleEn: "1. Bhasma Dharana & Shiva Dhyana",
        actionCueKn: "⚪ ಹಣೆಗೆ ಪವಿತ್ರ ವಿಭೂತಿ ಧರಿಸಿ · ಆಚಮನ ಮಾಡಿ ಸದಾಶಿವನನ್ನು ಧ್ಯಾನಿಸಿ",
        actionCueEn: "⚪ Apply sacred Bhasma to forehead, do Achamana, meditate on Lord Shiva",
        icon: "⚪",
        visualEffect: "achamana",
        mantraSanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात्॥ ध्यायेन्नित्यं महेशं रजतगिरिनिभं चारुचन्द्रावतंसं। रत्नाकल्पोज्ज्वलाङ्गं परशुमृगवराभीतिहस्तं प्रसन्नम्॥ पद्मासीनं समन्तात् स्तुतममरगणैर्व्याघ्रकृत्तिं वसानं। विश्वाद्यं विश्वबीजं निखिलभयहरं पञ्चवक्त्रं त्रिनेत्रम्॥",
        mantraL5: {
          kn: "ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಽಮೃತಾತ್ ॥\nಧ್ಯಾಯೇನ್ನಿತ್ಯಂ ಮಹೇಶಂ ರಜತಗಿರಿನಿಭಂ ಚಾರುಚಂದ್ರಾವತಂಸಂ ।\nರತ್ನಾಕಲ್ಪೋಜ್ಜ್ವಲಾಂಗಂ ಪರಶುಮೃಗವರಾಭೀತಿಹಸ್ತಂ ಪ್ರಸನ್ನಮ್ ॥\nಪದ್ಮಾಸೀನಂ ಸಮಂತಾತ್ ಸ್ತುತಮಮರಗಣೈರ್ವ್ಯಾಘ್ರಕೃತ್ತಿಂ ವಸಾನಂ ।\nವಿಶ್ವಾದ್ಯಂ ವಿಶ್ವಬೀಜಂ ನಿಖಿಲಭಯಹರಂ ಪಂಚವಕ್ತ್ರಂ ತ್ರಿನೇತ್ರಮ್ ॥",
          hi: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात्॥\nध्यायेन्नित्यं महेशं रजतगिरिनिभं चारुचन्द्रावतंसं।\nरत्नाकल्पोज्ज्वलाङ्गं परशुमृगवराभीतिहस्तं प्रसन्नम्॥\nपद्मासीनं समन्तात् स्तुतममरगणैर्व्याघ्रकृत्तिं वसानं।\nविश्वाद्यं विश्वबीजं निखिलभयहरं पञ्चवक्त्रं त्रिनेत्रम्॥",
          te: "ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్। ఉర్వారుకమివ బంధనాన్ మృత్యోర్ముక్షీయ మాಽమృతాత్॥\nధ్యాయేన్నిత్యం మహేశం రజతగిరినిభం చారుచంద్రావతంసం।\nరత్నాకల్పోజ్జ్వలాంగం పరశుమృగవరాభీతిహస్తం ప్రసన్నమ్॥\nపద్మాసీనం సమంతాత్ స్తుతమమరగణైర్వ్యాఘ్రకృత్తిం వసానం।\nవిశ్వాద్యం విశ్వబీజం నిఖిలభయహరం పంచవక్త్రం త్రినేత్రమ్॥",
          ta: "ஓம் த்ர்யம்பகம் யஜாமஹே ஸுகந்திம் புஷ்டிவர்த்தனம்। உர்வாருகமிவ பந்தனான் ம்ருத்யோர்முக்ஷீய மாऽம்ருதாத்॥\nத்யாயேந்நித்யம் மஹேசம் ரஜதகிரிநிபம் சாருசந்த்ராவதம்ஸம்।\nரத்னாகல்போஜ்ஜ்வலாங்கம் பரசும்ருகவராபீதிஹஸ்தம் ப்ரஸன்னம்॥\nபத்மாஸீனம் ஸமந்தாத் ஸ்துதமமரகணைர்வ்யாக்ரக்ருத்திம் வஸானம்।\nவிச்வாத்யம் விச்வபீஜம் நிகிலபயஹரம் பஞ்சவக்த்ரம் த்ரிநேத்ரம்॥",
          en: "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam | Urvarukamiva Bandhanan Mrityor Mukshiya Mamritat ||\nDhyayennityam Mahesham Rajatagirinibham Charuchandravatamsam |\nRatnakalpojvalangam Parashumrigavarabhitihastam Prasannam ||\nPadmasinam Samantat Stutam Amaraganair Vyaghrakrittim Vasanam |\nVishvadyam Vishvabijam Nikhilabhayaharam Panchavaktram Trinetram ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಹರಿ ಓಂ. ಶ್ರೀ ಸಾಂಬಸದಾಶಿವನ ಪರಮ ಪಾವನ ಪೂಜೆಗೆ ಸುಸ್ವಾಗತ. ಹಣೆಗೆ ಪವಿತ್ರ ಭಸ್ಮವನ್ನು ತ್ರಿಪುಂಡ್ರವಾಗಿ ಧರಿಸಿ, ಆಚಮನ ಪಾತ್ರೆಯಿಂದ ಮೂರು ಬಾರಿ ನೀರನ್ನು ಸ್ವೀಕರಿಸಿ. ಕೈಮುಗಿದು ಕೈಲಾಸವಾಸಿಯಾದ ಸದಾಶಿವನನ್ನು ಧ್ಯಾನಿಸಿ.",
            outro: "ಶಿವಧ್ಯಾನವು ಮನಸ್ಸಿಗೆ ಶಾಶ್ವತ ಪ್ರಶಾಂತತೆಯನ್ನು ನೀಡಲಿ."
          },
          en: {
            intro: "Hari Om. Welcome to the divine worship of Lord Sambasadashiva. Apply sacred Bhasma to your forehead, perform Achamana, and fold hands in meditation on Shiva.",
            outro: "May contemplation of Shiva bestow unshakeable peace."
          },
          te: {
            intro: "హరి ఓం. శ్రీ సాంబసదాశివుని పవిత్ర పూజకు స్వాగతం. విభూతిని ధరించి, ఆచమనం చేసి పరమశివుని ధ్యానించండి.",
            outro: "శివధ్యానం శాశ్వత ప్రశాంతతను ప్రసాదించుగాక."
          },
          ta: {
            intro: "ஹரி ஓம். ஸ்ரீ சாம்பசதாசிவனின் வழிபாட்டிற்கு நல்வரவு. நெற்றியில் விபூதி பூசி, ஆசமனம் செய்து சிவபெருமானைத் தியானியுங்கள்.",
            outro: "சிவ தியானம் உள்ளத்திற்கு அமைதியைத் தரட்டும்."
          },
          hi: {
            intro: "हरि ॐ। साम्बसदाशिव की पावन पूजा में स्वागत है। मस्तक पर भस्म धारण करें, आचमन करें और शिव जी का ध्यान करें।",
            outro: "शिव ध्यान से अखंड शांति प्राप्त हो।"
          }
        },
        spokenPriestGuidance: "ಹರಿ ಓಂ. ಶ್ರೀ ಸಾಂಬಸದಾಶಿವನ ಪರಮ ಪಾವನ ಪೂಜೆಗೆ ಸುಸ್ವಾಗತ. ಹಣೆಗೆ ಪವಿತ್ರ ಭಸ್ಮವನ್ನು ತ್ರಿಪುಂಡ್ರವಾಗಿ ಧರಿಸಿ, ಆಚಮನ ಪಾತ್ರೆಯಿಂದ ಮೂರು ಬಾರಿ ನೀರನ್ನು ಸ್ವೀಕರಿಸಿ. ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात्॥ ध्यायेन्नित्यं महेशं रजतगिरिनिभं चारुचन्द्रावतंसं। रत्नाकल्पोज्ज्वलाङ्गं परशुमृगवराभीतिहस्तं प्रसन्नम्॥ पद्मासीनं समन्तात् स्तुतममरगणैर्व्याघ्रकृत्तिं वसानं। विश्वाद्यं विश्वबीजं निखिलभयहरं पञ्चवक्त्रं त्रिनेत्रम्॥ ಶಿವಧ್ಯಾನವು ಮನಸ್ಸಿಗೆ ಶಾಶ್ವತ ಪ್ರಶಾಂತತೆಯನ್ನು ನೀಡಲಿ.",
        hiddenPriestInstructionKn: "ಶಿವ ಪೂಜೆಗೆ ಭಸ್ಮಧಾರಣೆ ಮತ್ತು ಶುದ್ಧಿ ಮೊದಲ ಹೆಜ್ಜೆ. ತ್ರಿಪುಂಡ್ರ ಭಸ್ಮವು ತ್ರಿಗುಣಾತೀತ ಶಿವತತ್ತ್ವವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Apply sacred Vibhuti in three lines on the forehead and meditate upon the five-faced, three-eyed Lord Shiva.",
        approxSeconds: 35
      },
      {
        step: 2,
        titleKn: "೨. ಶಿವಲಿಂಗ ಅಭಿಷೇಕ (ಶುದ್ಧೋದಕ & ಪಂಚಾಮೃತ)",
        titleEn: "2. Shivalinga Abhisheka (Vedic Bath)",
        actionCueKn: "🥛 ಉದ್ದರಣೆಯಿಂದ ಶಿವಲಿಂಗದ ಮೇಲೆ ಶುದ್ಧೋದಕ/ಪಂಚಾಮೃತ ಅಭಿಷೇಕ ಮಾಡಿ",
        actionCueEn: "🥛 Gently bathe the Shivalinga with pure water and milk chanting Namaste Rudra",
        icon: "🥛",
        visualEffect: "abhisheka",
        mantraSanskrit: "ॐ नमस्ते रुद्र मन्यव उतो त इषवे नमः। नमस्ते अस्तु धन्वने बाहुभ्यामुत ते नमः॥ या त इषुः शिवतमा शिवं बभूव ते धनुः। शिवा शरव्या या तव तया नो रुद्र मृडय॥ शुद्धोदक स्नानं पञ्चामृत स्नानं च समर्पयामि॥",
        mantraL5: {
          kn: "ಓಂ ನಮಸ್ತೇ ರುದ್ರ ಮನ್ಯವ ಉತೋ ತ ಇಷವೇ ನಮಃ । ನಮಸ್ತೇ ಅಸ್ತು ಧನ್ವನೇ ಬಾಹುಭ್ಯಾಮುತ ತೇ ನಮಃ ॥\nಯಾ ತ ಇಷುಃ ಶಿವತಮಾ ಶಿವಂ ಬಭೂವ ತೇ ಧನುಃ । ಶಿವಾ ಶರವ್ಯಾ ಯಾ ತವ ತಯಾ ನೋ ರುದ್ರ ಮೃಡಯ ॥\nಶುದ್ಧೋದಕ ಸ್ನಾನಂ ಪಂಚಾಮೃತ ಸ್ನಾನಂ ಚ ಸಮರ್ಪಯಾಮಿ ॥",
          hi: "ॐ नमस्ते रुद्र मन्यव उतो त इषवे नमः। नमस्ते अस्तु धन्वने बाहुभ्यामुत ते नमः॥\nया त इषुः शिवतमा शिवं बभूव ते धनुः। शिवा शरव्या या तव तया नो रुद्र मृडय॥\nशुद्धोदक स्नानं पञ्चामृत स्नानं च समर्पयामि॥",
          te: "ఓం నమస్తే రుద్ర మన్యవ ఉతో త ఇషవే నమః। నమస్తే అస్తు ధన్వనే బాహుభ్యాముత తే నమః॥\nయా త ఇషుః శివతమా శివం బభూవ తే ధనుః। శివా శరవ్యా యా తవ తయా నో రుద్ర మృడయ॥\nశుద్ధోదక స్నానం పంచామృత స్నానం చ సమర్పయామి॥",
          ta: "ஓம் நமஸ்தே ருத்ர மன்யவ உதோ த இஷவே நமஃ। நமஸ்தே அஸ்து தன்வனே பாஹுப்யாமுத தே நமஃ॥\nயா த இஷுஃ சிவதமா சிவம் பபூவ தே தனுஃ। சிவா சரவ்யா யா தவ தயா நோ ருத்ர ம்ருடய॥\nசுத்தோதக ஸ்நானம் பஞ்சாம்ருத ஸ்நானம் ச ஸமர்பயாமி॥",
          en: "Om Namaste Rudra Manyava Uto Ta Ishave Namah | Namaste Astu Dhanvane Bahubhyamuta Te Namah ||\nYa Ta Ishuh Shivathama Shivam Babhuva Te Dhanuh | Shiva Sharavya Ya Tava Taya No Rudra Mridaya ||\nShuddhodaka Snanam Panchamrita Snanam Cha Samarpayami ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಉದ್ದರಣೆಯಿಂದ ಶಿವಲಿಂಗದ ಮೇಲೆ ಶುದ್ಧ ಜಲ ಹಾಗೂ ಹಾಲು ಅಥವಾ ಪಂಚಾಮೃತವನ್ನು ನಿಧಾನವಾಗಿ ಅಭಿಷೇಕ ಮಾಡಿ. ಶ್ರೀ ರುದ್ರಪ್ರಶ್ನವನ್ನು ಧ್ಯಾನಿಸಿ.",
            outro: "ನಂತರ ಸ್ವಚ್ಛ ವಸ್ತ್ರದಿಂದ ಲಿಂಗವನ್ನು ಒರೆಸಿ ಪೀಠದಲ್ಲಿರಿಸಿ."
          },
          en: {
            intro: "Gently pour streams of pure water and milk over the Shivalinga while chanting the sacred Sri Rudram.",
            outro: "Gently wipe the Lingam with a clean cloth and seat it upon the sanctified altar."
          },
          te: {
            intro: "ఉద్ధరణితో శివలింగంపై శుద్ధ జలం, పాలు లేదా పంచామృతంతో అభిషేకం చేయండి.",
            outro: "అనంతరం పరిశుభ్రమైన వస్త్రంతో లింగాన్ని తుడిచి పీఠంపై ఉంచండి."
          },
          ta: {
            intro: "சிவ லிங்கத்தின் மீது புனித நீர் மற்றும் பாலினால் ருத்ர மந்திரம் கூறி மெதுவாக அபிஷேகம் செய்யுங்கள்.",
            outro: "தூய ஆடையால் லிங்கத்தைத் துடைத்து பீடத்தில் வையுங்கள்."
          },
          hi: {
            intro: "आचमनी से शिवलिंग पर शुद्ध जल व दूध अथवा पंचामृत से धीरे-धीरे अभिषेक करें।",
            outro: "स्वच्छ वस्त्र से पोंछकर शिवलिंग को पीठ पर स्थापित करें।"
          }
        },
        spokenPriestGuidance: "ಉದ್ದರಣೆಯಿಂದ ಶಿವಲಿಂಗದ ಮೇಲೆ ಶುದ್ಧ ಜಲ ಹಾಗೂ ಹಾಲು ಅಥವಾ ಪಂಚಾಮೃತವನ್ನು ನಿಧಾನವಾಗಿ ಅಭಿಷೇಕ ಮಾಡಿ. ಶ್ರೀ ರುದ್ರಪ್ರಶ್ನದ ಮೊದಲ ಅನುವಾಕವನ್ನು ಧ್ಯಾನಿಸಿ. ॐ नमस्ते रुद्र मन्यव उतो त इषवे नमः। नमस्ते अस्तु धन्वने बाहुभ्यामुत ते नमः॥ या त इषुः शिवतमा शिवं बभूव ते धनुः। शिवा शरव्या या तव तया नो रुद्र मृडय॥ शुद्धोदक स्नानं पञ्चामृत स्नानं च समर्पयामि॥ ನಂತರ ಸ್ವಚ್ಛ ವಸ್ತ್ರದಿಂದ ಲಿಂಗವನ್ನು ಒರೆಸಿ ಪೀಠದಲ್ಲಿರಿಸಿ.",
        hiddenPriestInstructionKn: "ಅಭಿಷೇಕ ಪ್ರಿಯನಾದ ಶಿವನಿಗೆ ಜಲ, ಕ್ಷೀರ ಮತ್ತು ಪಂಚಾಮೃತ ಧಾರೆಯು ಅತ್ಯಂತ ಸಂತೋಷವನ್ನುಂಟು ಮಾಡುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Slowly pour drops of pure water and milk over the sacred Shivalinga with the Sri Rudram hymn.",
        approxSeconds: 40
      },
      {
        step: 3,
        titleKn: "೩. ಬಿಲ್ವಾಷ್ಟಕ & ಬಿಲ್ವಾರ್ಚನೆ",
        titleEn: "3. Bilvashtaka & Sacred Bilva Leaf Offering",
        actionCueKn: "🍃 ಮೂರು ಎಲೆಯ ಬಿಲ್ವಪತ್ರೆಯನ್ನು ಬಲಗೈಯಿಂದ ಶಿವಲಿಂಗಕ್ಕೆ ಅರ್ಪಿಸಿ",
        actionCueEn: "🍃 Offer three-leaf Bilva sprigs with devotion chanting Bilvashtaka",
        icon: "🍃",
        visualEffect: "bilva",
        mantraSanskrit: "त्रिदलं त्रिगुणाकारं त्रिनेत्रं च त्रियायुधम्। त्रिजन्मपापसंहारं एकबिल्वं शिवार्पणम्॥ त्रिशाखैः बिल्वपत्रैश्च अच्छिद्रैः कोमलैः शुभैः। तव पूजां करिष्यामि एकबिल्वं शिवार्पणम्॥ दर्शनं बिल्ववृक्षस्य स्पर्शनं पापनाशनम्। अघोरपापसंहारं एकबिल्वं शिवार्पणम्॥",
        mantraL5: {
          kn: "ತ್ರಿದಳಂ ತ್ರಿಗುಣಾಕಾರಂ ತ್ರಿನೇತ್ರಂ ಚ ತ್ರಿಯಾಯುಧಮ್ । ತ್ರಿಜನ್ಮಪಾಪಸಂಹಾರಂ ಏಕಬಿಲ್ವಂ ಶಿವಾರ್ಪಣಮ್ ॥\nತ್ರಿಶಾಖೈಃ ಬಿಲ್ವಪತ್ರೈಶ್ಚ ಅಚ್ಛಿದ್ರೈಃ ಕೋಮಲೈಃ ಶುಭೈಃ । ತವ ಪೂಜಾಂ ಕರಿಷ್ಯಾಮಿ ಏಕಬಿಲ್ವಂ ಶಿವಾರ್ಪಣಮ್ ॥\nದರ್ಶನಂ ಬಿಲ್ವವೃಕ್ಷಸ್ಯ ಸ್ಪರ್ಶನಂ ಪಾಪನಾಶನಮ್ । ಅಘೋರಪಾಪಸಂಹಾರಂ ಏಕಬಿಲ್ವಂ ಶಿವಾರ್ಪಣಮ್ ॥",
          hi: "त्रिदलं त्रिगुणाकारं त्रिनेत्रं च त्रियायुधम्। त्रिजन्मपापसंहारं एकबिल्वं शिवार्पणम्॥\nत्रिशाखैः बिल्वपत्रैश्च अच्छिद्रैः कोमलैः शुभैः। तव पूजां करिष्यामि एकबिल्वं शिवार्पणम्॥\nदर्शनं बिल्ववृक्षस्य स्पर्शनं पापनाशनम्। अघोरपापसंहारं एकबिल्वं शिवार्पणम्॥",
          te: "త్రిదళం త్రిగుణాకారం త్రినేత్రం చ త్రియాయుధమ్। త్రిజన్మపాపసంహారం ఏకబిల్వం శివార్పణమ్॥\nత్రిశాఖైః బిల్వపత్రైశ్చ అచ్ఛిద్రైః కోమలైః శుభైః। తవ పూజాం కరిష్యామి ఏకబిల్వం శివార్పణమ్॥\nదర్శనం బిల్వవృక్షస్య స్పర్శనం పాపనాశనమ్। అఘోరపాపసంహారం ఏకబిల్వం శివార్పణమ్॥",
          ta: "த்ரிதளம் த்ரிகுணாகாரம் த்ரிநேத்ரம் ச த்ரியாயுதம்। த்ரிஜன்மபாபஸம்ஹாரம் ஏகபில்வம் சிவார்பணம்॥\nத்ரிசாகைஃ பில்வபத்ரைச்ச அச்சித்ரைஃ கோமலைஃ சுபைஃ। தவ பூஜாம் கரிஷ்யாமி ஏகபில்வம் சிவார்பணம்॥\nதர்சனம் பில்வவ்ருக்ஷஸ்ய ஸ்பர்சனம் பாபநாசனம்। அகோரபாபஸம்ஹாரம் ஏகபில்வம் சிவார்பணம்॥",
          en: "Tridalam Trigunakaram Trinetram Cha Triyayudham | Trijanma Papa Samharam Eka Bilvam Shivapanam ||\nTrishakhaih Bilvapatraishcha Achhidraih Komalaih Shubhaih | Tava Poojam Karishyami Eka Bilvam Shivapanam ||\nDarshanam Bilvavrikshasya Sparshanam Papanashanam | Aghorapapa Samharam Eka Bilvam Shivapanam ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಮೂರು ಎಲೆಗಳ ಪವಿತ್ರ ಬಿಲ್ವಪತ್ರೆಯನ್ನು ಬಲಗೈಯಿಂದ ಶಿವಲಿಂಗಕ್ಕೆ ಸಮರ್ಪಿಸಿ.",
            outro: "ಏಕ ಬಿಲ್ವಾರ್ಪಣೆಯು ಮೂರು ಜನ್ಮಗಳ ಪಾಪಗಳನ್ನು ನಿವಾರಿಸಲಿ."
          },
          en: {
            intro: "Offer unbroken trifoliate Bilva leaves onto the Shivalinga with your right hand reciting Bilvashtaka.",
            outro: "May the offering of a single Bilva leaf dissolve sins of three lifetimes."
          },
          te: {
            intro: "మూడు ఆకుల పవిత్ర బిల్వపత్రాన్ని కుడిచేతితో శివలింగానికి సమర్పించండి.",
            outro: "ఏక బిల్వార్పణ మూడు జన్మల పాపాలను పోగొట్టుగాక."
          },
          ta: {
            intro: "மூன்று தளங்கள் கொண்ட வில்வ இலைகளை வலது கையால் சிவலிங்கத்திற்கு அர்ப்பணியுங்கள்.",
            outro: "வில்வ அர்ச்சனை முற்பிறவிப் பாவங்களை நீக்கட்டும்."
          },
          hi: {
            intro: "तीन दलों वाले पवित्र बेलपत्र को दाहिने हाथ से शिवलिंग पर अर्पित करें।",
            outro: "एक बिल्वपत्र अर्पण से तीन जन्मों के पाप नष्ट हों।"
          }
        },
        spokenPriestGuidance: "ಮೂರು ಎಲೆಗಳ ಪವಿತ್ರ ಬಿಲ್ವಪತ್ರೆಯನ್ನು ಬಲಗೈಯಿಂದ ಶಿವಲಿಂಗಕ್ಕೆ ಸಮರ್ಪಿಸಿ. त्रिदलं त्रिगुणाकारं त्रिनेत्रं च त्रियायुधम्। त्रिजन्मपापसंहारं एकबिल्वं शिवार्पणम्॥ त्रिशाखैः बिल्वपत्रैश्च अच्छिद्रैः कोमलैः शुभैः। तव पूजां करिष्यामि एकबिल्वं शिवार्पणम्॥ दर्शनं बिल्ववृक्षस्य स्पर्शनं पापनाशनम्। अघोरपापसंहारं एकबिल्वं शिवार्पणम्॥ ಏಕ ಬಿಲ್ವಾರ್ಪಣೆಯು ಮೂರು ಜನ್ಮಗಳ ಪಾಪಗಳನ್ನು ನಿವಾರಿಸಲಿ.",
        hiddenPriestInstructionKn: "ಶಿವನಿಗೆ ಒಂದು ಬಿಲ್ವಪತ್ರೆ ಸಮರ್ಪಿಸಿದರೆ ಮೂರು ಜನ್ಮಗಳ ಪಾಪ ನಾಶವಾಗುತ್ತದೆ ಎಂಬುದು ಪುರಾಣೋಕ್ತ ಫಲ.",
        hiddenPriestInstructionEn: "Offer unblemished 3-leaf Bilva leaves on top of the Lingam while reciting Bilvashtaka.",
        approxSeconds: 35
      },
      {
        step: 4,
        titleKn: "೪. ಓಂ ನಮಃ ಶಿವಾಯ ಮಹಾಮಂತ್ರ ಜಪ (೧೦೮ ಬಾರಿ)",
        titleEn: "4. Om Namah Shivaya Japa (108 Times)",
        actionCueKn: "📿 ರುದ್ರಾಕ್ಷಿ ಮಾಲೆಯಲ್ಲಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಮಹಾಮಂತ್ರ ೧೦೮ ಬಾರಿ ಜಪಿಸಿ",
        actionCueEn: "📿 Chant Om Namah Shivaya 108 times meditating on Lord Shiva",
        icon: "📿",
        visualEffect: "japa",
        japaTarget: 108,
        japaMantra: "ॐ नमः शिवाय॥",
        mantraSanskrit: "ॐ नमः शिवाय। ॐ नमः शिवाय। ॐ नमः शिवाय॥ (१०८ वार रुद्राक्ष माला जप)",
        mantraL5: {
          kn: "ಓಂ ನಮಃ ಶಿವಾಯ ॥\n(೧೦೮ ಬಾರಿ ರುದ್ರಾಕ್ಷಿ ಮಾಲೆಯಲ್ಲಿ ಜಪ)",
          hi: "ॐ नमः शिवाय॥\n(१०८ बार रुद्राक्ष माला में जप)",
          te: "ఓం నమః శివాయ॥\n(108 సార్లు రుద్రాక్ష మాలలో జపం)",
          ta: "ஓம் நமஃ சிவாய॥\n(108 முறை ருத்ராக்ஷ மாலையில் ஜபம்)",
          en: "Om Namah Shivaya ||\n(Chant 108 Times with Rudraksha)"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಈಗ ಶಿವನ ಪರಮ ಪವಿತ್ರ ಷಡಕ್ಷರೀ ಮಹಾಮಂತ್ರ 'ಓಂ ನಮಃ ಶಿವಾಯ'ವನ್ನು ನೂರಎಂಟು ಬಾರಿ ಏಕಾಗ್ರತೆಯಿಂದ ಜಪಿಸಿ. ಮನಸ್ಸಿನಲ್ಲಿ ಶಿವನ ಜ್ಯೋತಿರ್ಲಿಂಗವನ್ನು ಸ್ಮರಿಸಿ.",
            outro: "ಈ ಮಂತ್ರವು ಜನ್ಮ ಜನ್ಮಾಂತರಗಳ ದೋಷಗಳನ್ನು ಕಳೆದು ಆಂತರಿಕ ಶಾಂತಿಯನ್ನು ತರುತ್ತದೆ."
          },
          en: {
            intro: "Now chant the sacred six-syllable Mahamantra 'Om Namah Shivaya' 108 times with unbroken devotion, visualizing the radiant Jyotirlinga.",
            outro: "May this supreme chant awaken eternal peace and spiritual realization within you."
          },
          te: {
            intro: "ఇప్పుడు పరమ పవిత్రమైన 'ఓం నమః శివాయ' మంత్రాన్ని 108 సార్లు ఏకాగ్రతతో జపించండి.",
            outro: "ఈ మంత్రం అంతఃశాంతిని ప్రసాదించుగాక."
          },
          ta: {
            intro: "இப்போது 'ஓம் நம சிவாய' எனும் பஞ்சாட்சர மந்திரத்தை 108 முறை உருவேற்றுங்கள்.",
            outro: "இந்த மந்திரம் உள்ளத்தில் அமைதியை நிலைநாட்டட்டும்."
          },
          hi: {
            intro: "अब भगवान शिव के पंचाक्षर महामंत्र 'ॐ नमः शिवाय' का १०८ बार एकाग्रता से जप करें।",
            outro: "यह मंत्र आंतरिक शांति और मुक्ति प्रदान करता है।"
          }
        },
        spokenPriestGuidance: "ಈಗ ಶಿವನ ಪರಮ ಪವಿತ್ರ ಷಡಕ್ಷರೀ ಮಹಾಮಂತ್ರ 'ಓಂ ನಮಃ ಶಿವಾಯ'ವನ್ನು ನೂರಎಂಟು ಬಾರಿ ಏಕಾಗ್ರತೆಯಿಂದ ಜಪಿಸಿ. ಮನಸ್ಸಿನಲ್ಲಿ ಶಿವನ ಜ್ಯೋತಿರ್ಲಿಂಗವನ್ನು ಸ್ಮರಿಸಿ. ॐ नमः शिवाय। ॐ नमः शिवाय। ॐ नमः शिवाय॥ ಈ ಮಂತ್ರವು ಜನ್ಮ ಜನ್ಮಾಂತರಗಳ ದೋಷಗಳನ್ನು ಕಳೆದು ಆಂತರಿಕ ಶಾಂತಿಯನ್ನು ತರುತ್ತದೆ.",
        hiddenPriestInstructionKn: "೧೦೮ ಬಾರಿ ಷಡಕ್ಷರಿ ಜಪವು ಮನಸ್ಸನ್ನು ಲಯಗೊಳಿಸಿ ಶಿವಚೈತನ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ. ರುದ್ರಾಕ್ಷಿ ಮಾಲೆ ಅಥವಾ ಅಂಗುಲಿ ಪರ್ವಗಳಲ್ಲಿ ಜಪಿಸಬಹುದು.",
        hiddenPriestInstructionEn: "Chant the six-syllable Shiva Panchakshara 108 times with continuous sacred rhythm and peace.",
        approxSeconds: 65
      },
      {
        step: 5,
        titleKn: "೫. ಮಹಾಮೃತ್ಯುಂಜಯ, ಕರ್ಪೂರಾರತಿ & ತೀರ್ಥ",
        titleEn: "5. Mahamrityunjaya, Arathi & Tirtha",
        actionCueKn: "🔔 ಕರ್ಪೂರ ಮಂಗಳಾರತಿ ಬೆಳಗಿ · ಶಿವ ಪಾದೋದಕ ತೀರ್ಥ ಸ್ವೀಕರಿಸಿ",
        actionCueEn: "🔔 Wave camphor flame with bell, chant Mahamrityunjaya and sip Tirtha",
        icon: "🔔",
        visualEffect: "arathi",
        mantraSanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात्॥ कर्पूर गौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्। सदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥",
        mantraSanskritPart2: "अकालमृत्युहरणं सर्वव्याधिनिवारणं सर्वदुरितोपशमनं श्री साम्बसदाशिव पादोदकं पावनं शुभम्॥",
        mantraL5: {
          kn: "ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಽಮೃತಾತ್ ॥\nಕರ್ಪೂರ ಗೌರಂ ಕರುಣಾವತಾರಂ ಸಂಸಾರಸಾರಂ ಭುಜಗೇಂದ್ರಹಾರಮ್ । ಸದಾ ವಸಂತಂ ಹೃದಯಾರವಿಂದೇ ಭವಂ ಭವಾನೀಸಹಿತಂ ನಮಾಮಿ ॥\nಅಕಾಲಮೃತ್ಯುಹರಣಂ ಸರ್ವವ್ಯಾಧಿನಿವಾರಣಂ ಸರ್ವದುರಿತೋಪಶಮನಂ ಶ್ರೀ ಸಾಂಬಸದಾಶಿವ ಪಾದೋದಕಂ ಪಾವನಂ ಶುಭಮ್ ॥",
          hi: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात्॥\nकर्पूर गौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्। सदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥\nअकालमृत्युहरणं सर्वव्याधिनिवारणं सर्वदुरितोपशमनं श्री साम्बसदाशिव पादोदकं पावनं शुभम्॥",
          te: "ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్। ఉర్వారుకమివ బంధనాన్ మృత్యోర్ముక్షీయ మాಽమృతాత్॥\nకర్పూర గౌరం కరుణావతారం సంసారసారం భుజగేంద్రహారమ్। సదా వసంతం హృదయారవిందే భవం భవానీసహితం నమామి॥\nఅకాలమృత్యుహరణం సర్వవ్యాధినివారణం సర్వదురితోపశమనం శ్రీ సాంబసదాశివ పాదోదకం పావనం శుభమ్॥",
          ta: "ஓம் த்ர்யம்பகம் யஜாமஹே ஸுகந்திம் புஷ்டிவர்த்தனம்। உர்வாருகமிவ பந்தனான் ம்ருத்யோர்முக்ஷீய மாऽம்ருதாத்॥\nகற்பூர கௌரம் கருணாவதாரம் ஸம்ஸாரஸாரம் புஜகsecurityேந்த்ரஹாரம்। ஸதா வஸந்தம் ஹ்ருதயாரவிந்தே பவம் பவானீஸஹிதம் நமாமி॥\nஅகாலம்ருத்யுஹரணம் ஸர்வவ்யாதிநிவாரணம் ஸர்வதுரிதோபசமనం ஸ்ரீ ஸாம்பஸதாசிவ பாதோதகம் பாவனம் சுபம்॥",
          en: "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam | Urvarukamiva Bandhanan Mrityor Mukshiya Mamritat ||\nKarpura Gauram Karunavataram Samsarasaram Bhujagendraharam | Sada Vasantam Hridayaravinde Bhavam Bhavanisahitam Namami ||\nAkalamrityu Haranam Sarvavyadhi Nivaranam Sarvaduritopashamanam Shri Sambasadashiva Padodakam Pavanam Shubham ||"
        },
        audioInstructionL5: {
          kn: {
            intro: "ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರವನ್ನು ಪಠಿಸಿ ಕರ್ಪೂರ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ.",
            mid: "ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ ಶಿವನ ಪವಿತ್ರ ಪಾದೋದಕ ತೀರ್ಥವನ್ನು ಸ್ವೀಕರಿಸಿ.",
            outro: "ಶಿವ ಪೂಜಾ ವಿಧಿ ಯಶಸ್ವಿಯಾಗಿ ಸಂಪನ್ನವಾಯಿತು. ಹರ ಹರ ಮಹಾದೇವ."
          },
          en: {
            intro: "Chant the Mahamrityunjaya hymn and wave sacred camphor Arati before Lord Shiva.",
            mid: "Prostrate in full surrender and accept the consecrated Shiva Padodaka Tirtha.",
            outro: "Shiva Pooja is successfully concluded with divine blessings. Hara Hara Mahadeva."
          },
          te: {
            intro: "మహామృత్యుంజయ మంత్రాన్ని పఠిస్తూ కర్పూర హారతిని వెలిగించండి.",
            mid: "సాష్టాంగ నమస్కారం చేసి పరమశివుని పాదోదక తీర్థాన్ని స్వీకరించండి.",
            outro: "శివ పూజ సంపూర్ణమయింది. హర హర మహాదేవ."
          },
          ta: {
            intro: "மகா மிருத்யுஞ்சய மந்திரத்தைக் கூறி கற்பூர ஆரத்தியை ஏற்றுங்கள்.",
            mid: "சாஷ்டாங்கமாக வணங்கி சிவ தீர்த்தத்தை ஏற்றுக்கொள்ளுங்கள்.",
            outro: "சிவபூஜை இனிதே நிறைவுற்றது. ஹர ஹர மஹாதேவ."
          },
          hi: {
            intro: "महामृत्युंजय मंत्र बोलते हुए कर्पूर आरती करें।",
            mid: "साष्टांग प्रणाम कर भगवान शिव का पावन पादोदक तीर्थ ग्रहण करें।",
            outro: "शिव पूजा संपन्न हुई। हर हर महादेव।"
          }
        },
        spokenPriestGuidance: "ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರವನ್ನು ಪಠಿಸಿ ಕರ್ಪೂರ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ. ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात्॥ कर्पूर गौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्। सदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ ಶಿವನ ಪವಿತ್ರ ಪಾದೋದಕ ತೀರ್ಥವನ್ನು ಸ್ವೀಕರಿಸಿ. अकालमृत्युहरणं सर्वव्याधिनिवारणं सर्वदुरितोपशमनं श्री साम्बसदाशिव पादोदकं पावनं शुभम्॥ ಶಿವ ಪೂಜೆ ಸಂಪನ್ನವಾಯಿತು.",
        hiddenPriestInstructionKn: "ಮೃತ್ಯುಂಜಯ ಜಪ ಹಾಗೂ ಕರ್ಪೂರಾರತಿ ಆಯುರಾರೋಗ್ಯಗಳನ್ನು ಪ್ರಸಾದಿಸುತ್ತದೆ. ಪಾದೋದಕ ಸ್ವೀಕಾರವು ಸಮಸ್ತ ರೋಗ ನಿವಾರಕ.",
        hiddenPriestInstructionEn: "Conclude with Mahamrityunjaya chant, wave Arati, prostrate, and accept sanctified Shiva Abhisheka water.",
        approxSeconds: 35
      }
    ]
  }
};

export const GUIDED_POOJA_KEYS: GuidedPoojaKey[] = [
  "sandhyavandana",
  "morning_pooja",
  "evening_pooja",
  "ganapati_pooja",
  "shiva_pooja"
];

export function getGuidedPooja(key: string): GuidedPoojaItem | undefined {
  return GUIDED_POOJAS[key as GuidedPoojaKey];
}

export function getAllGuidedPoojas(): GuidedPoojaItem[] {
  return GUIDED_POOJA_KEYS.map((k) => GUIDED_POOJAS[k]);
}

export function filterGuidedPoojas(keys?: string[]): GuidedPoojaItem[] {
  if (keys === undefined) return getAllGuidedPoojas();
  if (keys.length === 0) return [];
  const matched: GuidedPoojaItem[] = [];
  for (const k of keys) {
    const item = GUIDED_POOJAS[k as GuidedPoojaKey];
    if (item && !matched.some((m) => m.key === item.key)) {
      matched.push(item);
    }
  }
  return matched;
}
