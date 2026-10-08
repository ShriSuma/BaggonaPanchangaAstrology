/**
 * Baggona Panchanga - Authentic Sacred Vratas & Prayoga Engine (ಪುಣ್ಯ ವ್ರತ ಮಹಾವಿಧಿ ಎಂಜಿನ್)
 * 
 * Rooted in the 50-year experienced Smartha & Vedic priest tradition of Karnataka & Gokarna Kshetra:
 * 1. ಶ್ರೀ ಕಲ್ಯಾಣ ಮಂಗಳಗೌರೀ & ಸ್ವಯಂವರ ಪಾರ್ವತೀ ವ್ರತ (Marriage delay, finding life partner, 32-year soulmate prayer)
 * 2. ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮೀ ವ್ರತ ಮಹಾವಿಧಿ (Family harmony, prosperity & removal of obstacles)
 * 3. ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮೀ ವ್ರತ ಮಹಾವಿಧಿ (Soubhagya, abundance & Ashtalakshmi blessings)
 * 4. ಶ್ರೀ ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ಗಣಪತಿ ವ್ರತ (Crisis resolution, debt relief & obstacle destruction)
 * 5. ಶ್ರೀ ಸೋಮವಾರ ಶಿವ ವ್ರತ & ಮಹಾಮೃತ್ಯುಂಜಯ (Health, recovery from illness & longevity)
 * 6. ಶ್ರೀ ವಿದ್ಯಾ ಸರಸ್ವತೀ & ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ವ್ರತ (Education, exams, competitive tests & career)
 * 
 * MANDATE ON AUDIO & SCRIPT:
 * - When audio plays: all mantras are strictly in pure Sanskrit (Devanagari script) with Vedic authenticity.
 * - Spoken instructions/explanations: in devotee's selected language (Kannada, Telugu, Tamil, Hindi, English).
 * - On-screen reading: displays in devotee's chosen language script, with instant toggle to pure Sanskrit Devanagari.
 */

import type { SevaLang } from "../seva/sevaLocale";
import type { GuidedPoojaStep } from "./guidedPoojaData";

export type GuidedVrataKey =
  | "kalyana_mangalagauri_vrata"
  | "satyanarayana_vrata"
  | "varalakshmi_vrata"
  | "sankashtahara_vrata"
  | "somavara_shiva_vrata"
  | "saraswati_medha_vrata";

export interface VrataSamagriItem {
  id: string;
  itemKn: string;
  itemEn: string;
  quantityKn: string;
  quantityEn: string;
  importance: "mandatory" | "recommended" | "optional";
  notesKn?: string;
  notesEn?: string;
}

export interface GuidedVrataItem {
  key: GuidedVrataKey;
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
  // Detailed Mahatmya & Purpose
  purposeKn: string;
  purposeEn: string;
  benefitsKn: string; // ಫಲಶ್ರುತಿ
  benefitsEn: string;
  idealForKn: string; // ಯಾರಿಗೆ ಸೂಕ್ತ (e.g. 32-year old delay in marriage)
  idealForEn: string;
  timingKn: string; // ಮುಹೂರ್ತ & ಶುಭ ಕಾಲ
  timingEn: string;
  // Ingredients checklist
  samagriList: VrataSamagriItem[];
  // Complete step-by-step prayoga
  steps: GuidedPoojaStep[];
}

export const GUIDED_VRATA_KEYS: GuidedVrataKey[] = [
  "kalyana_mangalagauri_vrata",
  "satyanarayana_vrata",
  "varalakshmi_vrata",
  "sankashtahara_vrata",
  "somavara_shiva_vrata",
  "saraswati_medha_vrata"
];

export const GUIDED_VRATAS: Record<GuidedVrataKey, GuidedVrataItem> = {
  // =========================================================================
  // VRATA 1: ಶ್ರೀ ಕಲ್ಯಾಣ ಮಂಗಳಗೌರೀ & ಸ್ವಯಂವರ ಪಾರ್ವತೀ ವ್ರತ (ವಿವಾಹ ಪ್ರಾಪ್ತಿ ವ್ರತ)
  // Specially designed for 32-year-old unmarried devotees, marital delays, finding righteous life partner
  // =========================================================================
  kalyana_mangalagauri_vrata: {
    key: "kalyana_mangalagauri_vrata",
    titleKn: "ಶ್ರೀ ಕಲ್ಯಾಣ ಮಂಗಳಗೌರೀ & ಸ್ವಯಂವರ ಪಾರ್ವತೀ ವ್ರತ",
    titleEn: "Sri Kalyana Mangalagauri & Swayamvara Parvati Vrata",
    subtitleKn: "ಶೀಘ್ರ ಸುಯೋಗ್ಯ ವಿವಾಹ ಪ್ರಾಪ್ತಿ, ವಿವಾಹ ವಿಳಂಬ ನಿವಾರಣೆ & ಅಖಂಡ ಮಾಂಗಲ್ಯ ಸಿದ್ಧಿ",
    subtitleEn: "Sacred Vrata for Quick Marriage, Soulmate Union & Removing Astrological Delays",
    icon: "💍",
    badgeTextKn: "ವಿವಾಹ ಪ್ರಾಪ್ತಿ ಮಹಾವ್ರತ",
    badgeTextEn: "Sacred Marriage Vrata",
    colorScheme: {
      primary: "#BE185D",
      border: "#F472B6",
      badgeBg: "#FDF2F8",
      gradient: "from-pink-600 via-rose-500 to-amber-500"
    },
    purposeKn: "ವಿವಾಹದಲ್ಲಿ ಉಂಟಾಗುತ್ತಿರುವ ಅಡೆತಡೆಗಳು, ಕುಜ ದೋಷ, ಗುರು ಬಲದ ಕೊರತೆ, ಸಪ್ತಮ ಭಾವದ ದೋಷಗಳು ಹಾಗೂ ೩೨+ ವರ್ಷ ವಯಸ್ಸಿನವರಲ್ಲೂ ಉಂಟಾಗುವ ವಿವಾಹ ವಿಳಂಬವನ್ನು ನಿವಾರಿಸಿ, ಸುಗುಣ ಸಂಪನ್ನ ವಧು/ವರರ ಶೀಘ್ರ ಪ್ರಾಪ್ತಿಗಾಗಿ ಆಚರಿಸುವ ಶ್ರೇಷ್ಠ ಗೌರೀ ಪೂಜೆ.",
    purposeEn: "Specially prescribed in Vedic Smartha tradition to overcome chronic delays in marriage, Kuja/Manglik doshas, lack of Guru Bala, and find a virtuous, harmonious life partner with divine blessings.",
    benefitsKn: "೧. ವಿವಾಹ ಸಂಬಂಧಗಳು ಶೀಘ್ರವೇ ಕುದುರುತ್ತವೆ. ೨. ಮನಮೆಚ್ಚಿದ ಗುಣವಂತ ಬಾಳಸಂಗಾತಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ. ೩. ಜಾತಕದ ಸಪ್ತಮ-ಅಷ್ಟಮ ದೋಷಗಳು ಶಾಂತವಾಗುತ್ತವೆ. ೪. ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಅಖಂಡ ಪ್ರೀತಿ, ಶಾಂತಿ ಮತ್ತು ಮಾಂಗಲ್ಯ ಬಲ ವೃದ್ಧಿಸುತ್ತದೆ.",
    benefitsEn: "1. Quick resolution of marriage proposals without obstacles. 2. Blessed with a virtuous and loving spouse. 3. Pacifies severe natal 7th/8th house flaws. 4. Lifelong marital harmony and mutual affection.",
    idealForKn: "೩೨ ವರ್ಷ ಅಥವಾ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚು ವಯಸ್ಸಾಗಿದ್ದರೂ ವಿವಾಹವಾಗದೇ ಚಿಂತಿತರಾಗಿರುವ ಯುವಕ-ಯುವತಿಯರು, ಕಲ್ಯಾಣಕ್ಕಾಗಿ ಕಾಯುತ್ತಿರುವ ಕನ್ಯೆಯರು ಮತ್ತು ಶೀಘ್ರ ವಿವಾಹ ಅಪೇಕ್ಷಿಸುವವರು.",
    idealForEn: "Devotees aged 28 to 35+ experiencing prolonged marriage delays, eligible brides/grooms seeking their ideal life partner, and parents praying for their children's wedding.",
    timingKn: "ಶ್ರಾವಣ ಮಾಸದ ಮಂಗಳವಾರಗಳು, ಯಾವುದೇ ಶುಕ್ಲ ಪಕ್ಷದ ಮಂಗಳವಾರ ಅಥವಾ ಶುಕ್ರವಾರ, ಪ್ರದೋಷ ಕಾಲ ಅಥವಾ ಪ್ರಾತಃಕಾಲ (ಸೂರ್ಯೋದಯದ ನಂತರ ೨ ಗಂಟೆಯೊಳಗೆ).",
    timingEn: "Tuesdays/Fridays of Shukla Paksha, Tuesdays in Shravana Masa, Pradosha evening or morning within 2 hours of sunrise.",
    samagriList: [
      {
        id: "gauri_idol",
        itemKn: "ಮಂಗಳಗೌರಿ ವಿಗ್ರಹ ಅಥವಾ ಅರಿಶಿನದ ಗೌರಿ",
        itemEn: "Mangalagauri Idol or Pure Turmeric Gauri",
        quantityKn: "೧ ಮೂರ್ತಿ",
        quantityEn: "1 idol",
        importance: "mandatory",
        notesKn: "ಅರಿಶಿನದ ಪುಡಿಗೆ ಗಂಗಾಜಲ ಬೆರೆಸಿ ತ್ರಿಕೋನಾಕಾರದಲ್ಲಿ ಗೌರಿಯನ್ನು ತಯಾರಿಸಬಹುದು."
      },
      {
        id: "haldi_kumkuma",
        itemKn: "ಶುದ್ಧ ಅರಿಶಿನ, ಕುಂಕುಮ, ಗಂಧ & ಅಕ್ಷತೆ",
        itemEn: "Pure Turmeric, Kumkuma, Sandalwood & Akshata",
        quantityKn: "ಸಾಕಷ್ಟು",
        quantityEn: "Adequate quantity",
        importance: "mandatory"
      },
      {
        id: "pushpa_garland",
        itemKn: "೧೬ ಬಗೆಯ ಹೂಗಳು (ಮಲ್ಲಿಗೆ/ಸೇವಂತಿ/ಗುಲಾಬಿ) & ಹೂಮಾಲೆ",
        itemEn: "16 kinds of fresh flowers & Garland",
        quantityKn: "೧ ಹಾರ + ೧೬ ಹೂಗಳು",
        quantityEn: "1 garland + 16 flowers",
        importance: "mandatory",
        notesKn: "ಗೌರಿಗೆ ಕೆಂಪು ಅಥವಾ ಹಳದಿ ಹೂವುಗಳು ಅತ್ಯಂತ ಪ್ರಿಯ."
      },
      {
        id: "raksha_dora",
        itemKn: "೧೬ ಎಳೆಯ ರಕ್ಷಾಸೂತ್ರ (ಅರಿಶಿನ ಲೇಪಿತ ಕಂಕಣ ದಾರ)",
        itemEn: "16-strand consecrated sacred thread (Dora)",
        quantityKn: "೧ ಸೂತ್ರ",
        quantityEn: "1 thread",
        importance: "mandatory",
        notesKn: "ಪೂಜೆಯ ನಂತರ ಬಲಗೈಗೆ ಕಟ್ಟಿಕೊಳ್ಳುವ ಮಂಗಳಸೂತ್ರ."
      },
      {
        id: "panchamrita",
        itemKn: "ಪಂಚಾಮೃತ (ಹಸುವಿನ ಹಾಲು, ಮೊಸರು, ತುಪ್ಪ, ಜೇನುತುಪ್ಪ, ಸಕ್ಕರೆ)",
        itemEn: "Panchamrita (Milk, Curd, Ghee, Honey, Sugar)",
        quantityKn: "೧ ಬಟ್ಟಲು",
        quantityEn: "1 bowl",
        importance: "mandatory"
      },
      {
        id: "deepa",
        itemKn: "೧೬ ತುಪ್ಪದ ದೀಪಗಳು ಅಥವಾ ೨ ಹಿತ್ತಾಳೆ ದೀಪಗಳು",
        itemEn: "16 Ghee lamps or 2 brass altar lamps",
        quantityKn: "೨ ಅಥವಾ ೧೬",
        quantityEn: "2 or 16",
        importance: "recommended",
        notesKn: "೧೬ ದೀಪಗಳ ಮಂಗಳಾರತಿ ಅತ್ಯಂತ ಫಲದಾಯಕ."
      },
      {
        id: "vilya_ele",
        itemKn: "ವಿಳ್ಳೇದೆಲೆ, ಅಡಿಕೆ & ತಾಮ್ರದ ನಾಣ್ಯಗಳು",
        itemEn: "Betel leaves, Areca nuts & Copper coins",
        quantityKn: "೨೧ ಎಲೆಗಳು, ೧೦ ಅಡಿಕೆ",
        quantityEn: "21 leaves, 10 nuts",
        importance: "mandatory"
      },
      {
        id: "fruits_coconut",
        itemKn: "ತೆಂಗಿನಕಾಯಿ (೨) & ಪಂಚಫಲಗಳು (ಬಾಳೆಹಣ್ಣು, ದಾಳಿಂಬೆ ಇತ್ಯಾದಿ)",
        itemEn: "2 Coconuts & 5 varieties of fresh fruits",
        quantityKn: "೨ ತೆಂಗಿನಕಾಯಿ + ೫ ಹಣ್ಣುಗಳು",
        quantityEn: "2 coconuts + 5 fruits",
        importance: "mandatory"
      },
      {
        id: "bagina_items",
        itemKn: "ಮಂಗಳ ಬಾಗಿನ (ಮೋರ, ರವಿಕೆ ವಸ್ತ್ರ, ಬಳೆಗಳು, ಕನ್ನಡಿ, ಬಾಚಣಿಗೆ)",
        itemEn: "Soubhagya Baagina (Blouse piece, Bangles, Mirror, Comb)",
        quantityKn: "೧ ಜೊತೆ",
        quantityEn: "1 set",
        importance: "recommended",
        notesKn: "ಪೂಜೆಯ ನಂತರ ಸುಮಂಗಲಿಯರಿಗೆ ಸಮರ್ಪಿಸಲು."
      },
      {
        id: "naivedya",
        itemKn: "ನೈವೇದ್ಯ (ಸಿಹಿ ಪಾಯಸ / ಗೋಧಿ ಕಜ್ಜಾಯ / ಸಿಹಿ ಪೊಂಗಲ್)",
        itemEn: "Sweet Naivedya (Payasa / Wheat Sweet)",
        quantityKn: "೧ ಪಾತ್ರೆ",
        quantityEn: "1 bowl",
        importance: "mandatory"
      }
    ],
    steps: [
      {
        step: 1,
        titleKn: "ಪ್ರಾತಃಕಾಲ ಸ್ನಾನ & ಶುದ್ಧ ಆಸನ",
        titleEn: "Sacred Purification & Altar Seating",
        actionCueKn: "ಪೂರ್ವ ಅಥವಾ ಉತ್ತರಕ್ಕೆ ಮುಖಮಾಡಿ ರೇಷ್ಮೆ/ಶುಭ್ರ ವಸ್ತ್ರ ಧರಿಸಿ ದರ್ಭಾಸನ ಅಥವಾ ಮಣೆಯ ಮೇಲೆ ಕುಳಿತುಕೊಳ್ಳಿ.",
        actionCueEn: "Sit facing East or North on a wooden plank or clean mat, wearing pure traditional attire.",
        icon: "🧘",
        mantraSanskrit: `ॐ अपवित्रः पवित्रो वा सर्वावस्थां गतोऽपि वा।
यः स्मरेत्पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥
ॐ पुण्डरीकाक्षाय नमः। ॐ पुण्डरीकाक्षाय नमः। ॐ पुण्डरीकाक्षाय नमः॥`,
        mantraL5: {
          kn: `ಓಂ ಅಪವಿತ್ರಃ ಪವಿತ್ರೋ ವಾ ಸರ್ವಾವಸ್ಥಾಂ ಗತೋಽಪಿ ವಾ।
ಯಃ ಸ್ಮರೇತ್ಪುಂಡರೀಕಾಕ್ಷಂ ಸ ಬಾಹ್ಯಾಭ್ಯಂತರಃ ಶುಚಿಃ॥
ಓಂ ಪುಂಡರೀಕಾಕ್ಷಾಯ ನಮಃ। ಓಂ ಪುಂಡರೀಕಾಕ್ಷಾಯ ನಮಃ। ಓಂ ಪುಂಡರೀಕಾಕ್ಷಾಯ ನಮಃ॥`,
          en: `Om Apavitrah Pavitro Vaa Sarvaavasthaam Gato'pi Vaa |
Yah Smaret Pundarikaaksham Sa Baahyaabhyantarah Shuchih ||
Om Pundarikaakshaaya Namah | Om Pundarikaakshaaya Namah ||`,
          hi: `ॐ अपवित्रः पवित्रो वा सर्वावस्थां गतोऽपि वा।
यः स्मरेत्पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥
ॐ पुण्डरीकाक्षाय नमः। ॐ पुण्डरीकाक्षाय नमः॥`,
          te: `ఓం అపవిత్రః పవిత్రో వా సర్వావస్థాం గతోಽపి వా।
యః స్మరేత్పుండరీకాక్షం స బాహ్యాభ్యంతరః శుచిః॥
ఓం పుండరీకాక్షాయ నమః॥`,
          ta: `ஓம் அபவித்ர꞉ பவித்ரோ வா ஸர்வாவஸ்தாம்ʼ க³தோঽபி வா।
ய꞉ ஸ்மரேத்புண்ட³ரீகாக்ஷம்ʼ ஸ பா³ஹ்யாப்⁴யந்தர꞉ ஶுசி꞉॥
ஓம் புண்ட³ரீகாக்ஷாய நம꞉॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಭಕ್ತರೇ, ಶ್ರೀ ಕಲ್ಯಾಣ ಮಂಗಳಗೌರೀ ವ್ರತದ ಆರಂಭದಲ್ಲಿ ಶುದ್ಧ ಗಂಗಾಜಲದಿಂದ ಮೈಮೇಲೆ ಪ್ರೋಕ್ಷಣೆ ಮಾಡಿಕೊಳ್ಳಿ.",
            mid: "ಮನಸ್ಸಿನಲ್ಲಿ ಶ್ರೀ ಪುಂಡರೀಕಾಕ್ಷ ಮಹಾವಿಷ್ಣುವನ್ನು ಸ್ಮರಿಸಿ.",
            outro: "ಈಗ ನಿಮ್ಮ ಮನಸ್ಸು ಮತ್ತು ದೇಹ ಎರಡೂ ವ್ರತಾಚರಣೆಗೆ ಪವಿತ್ರವಾಯಿತು."
          },
          en: {
            intro: "Dear devotee, begin this sacred Kalyana Mangalagauri Vrata by sprinkling sacred water upon yourself for purification.",
            mid: "Meditate upon the lotus-eyed Lord Pundarikaksha.",
            outro: "Your body and mind are now consecrated for the holy vrata."
          },
          hi: {
            intro: "भक्तजन, श्री कल्याण मंगलगौरी व्रत के आरंभ में गंगाजल से स्वयं को पवित्र करें।",
            mid: "श्री पुंडरीकाक्ष भगवान का स्मरण करें।",
            outro: "अब आपका तन-मन व्रत के लिए शुद्ध हुआ।"
          },
          te: {
            intro: "భక్తులారా, శ్రీ కళ్యాణ మంగళగౌరీ వ్రతం ఆరంభంలో గంగాజలంతో పవిత్రులవ్వండి.",
            mid: "పుండరీకాక్షుని ధ్యానించండి.",
            outro: "ఇప్పుడు మీ మనస్సు పవిత్రమైంది."
          },
          ta: {
            intro: "பக்தர்களே, ஸ்ரீ கல்யாண மங்களகௌரி விரதத்தின் தொடக்கத்தில் புனித கங்கா தீர்த்தத்தால் சுத்தி செய்துகொள்ளுங்கள்.",
            mid: "புண்டரீகாக்ஷனை தியானியுங்கள்.",
            outro: "இப்போது உங்கள் உள்ளமும் உடலும் சுத்தியடைந்தது."
          }
        },
        hiddenPriestInstructionKn: "ಭಕ್ತರು ಆಚಮನ ಮಾಡಿ ಶುದ್ಧರಾಗಿರಬೇಕು. ಪೂರ್ವಾಭಿಮುಖವಾಗಿ ಕುಳಿತುಕೊಳ್ಳುವುದು ಶ್ರೇಷ್ಠ.",
        hiddenPriestInstructionEn: "Ensure proper seating facing East with purified mindset.",
        approxSeconds: 30,
        visualEffect: "achamana"
      },
      {
        step: 2,
        titleKn: "ದೀಪಾರಾಧನೆ & ಪ್ರಾರ್ಥನೆ",
        titleEn: "Lighting the Sacred Altar Lamp",
        actionCueKn: "ಹಸುವಿನ ತುಪ್ಪ ಅಥವಾ ಎಳ್ಳೆಣ್ಣೆಯ ದೀಪವನ್ನು ಹಚ್ಚಿ, ಅಕ್ಷತೆ ಹೂವು ಅರ್ಪಿಸಿ ನಮಸ್ಕರಿಸಿ.",
        actionCueEn: "Light the sacred ghee lamp before the altar, offer flowers and bow down.",
        icon: "🪔",
        mantraSanskrit: `भो दीप ब्रह्मरूपस्त्वं अन्धकारनिवारक।
इमां मया कृतां पूजां गृह्णन् तेजः प्रवर्धय॥
दीपज्योतिः परं ब्रह्म दीपज्योतिर्जनार्दनः।
दीपो हरतु मे पापं दीपज्योतिर्नमोऽस्तु ते॥`,
        mantraL5: {
          kn: `ಭೋ ದೀಪ ಬ್ರಹ್ಮರೂಪಸ್ತ್ವಂ ಅಂಧಕಾರನಿವಾರಕ।
ಇಮಾಂ ಮಯಾ ಕೃತಾಂ ಪೂಜಾಂ ಗೃಹ್ಣನ್ ತೇಜಃ ಪ್ರವರ್ಧಯ॥
ದೀಪಜ್ಯೋತಿಃ ಪರಂ ಬ್ರಹ್ಮ ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ।
ದೀಪೋ ಹರತು ಮೇ ಪಾಪಂ ದೀಪಜ್ಯೋತಿರ್ನಮೋಽಸ್ತು ತೇ॥`,
          en: `Bho Deepa Brahmaroopastvam Andhakaaranivaaraka |
Imaam Mayaa Kritaam Poojaam Grihnan Tejah Pravardhaya ||
Deepajyotih Param Brahma Deepajyotir Janaardanah |
Deepo Haratu Me Paapam Deepajyotir Namo'stu Te ||`,
          hi: `भो दीप ब्रह्मरूपस्त्वं अन्धकारनिवारक।
इमां मया कृतां पूजां गृह्णन् तेजः प्रवर्धय॥
दीपज्योतिः परं ब्रह्म दीपज्योतिर्जनार्दनः।
दीपो हरतु मे पापं दीपज्योतिर्नमोऽस्तु ते॥`,
          te: `భో దీప బ్రహ్మరూపస్త్వం అంధకారనివారక।
ఇమాం మయా కృతాం పూజాం గృష్ణన్ తేజః ప్రవర్ధయ॥
దీపజ్యోతిః పరం బ్రహ్మ దీపజ్యోతిర్జనార్దనః।
దీపో హరతు మే పాపం దీపజ్యోతిర్నమోಽస్తు తే॥`,
          ta: `போ⁴ தீ³ப ப்³ரஹ்மரூபஸ்த்வம் அந்த⁴காரநிவாரக।
இமாம்ʼ மயா க்ருʼதாம்ʼ பூஜாம்ʼ க்³ருʼஹ்ணன் தேஜ꞉ ப்ரவர்த⁴ய॥
தீ³பஜ்யோதி꞉ பரம்ʼ ப்³ரஹ்ம தீ³பஜ்யோதிர்ஜனார்த³ன꞉।
தீ³போ ஹரது மே பாபம் தீ³பஜ்யோதிர்நโมঽஸ்து தே॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಪೀಠದ ಬಲಭಾಗದಲ್ಲಿರುವ ಮಂಗಳ ದೀಪವನ್ನು ಬೆಳಗಿಸಿ. ಜ್ಯೋತಿಯು ಭಗವಂತನ ಸಾಕ್ಷಾತ್ ತೇಜಸ್ಸು.",
            mid: "ದೀಪಕ್ಕೆ ಹೂವು ಮತ್ತು ಅಕ್ಷತೆಯನ್ನು ಸಮರ್ಪಿಸಿ ಕೈಮುಗಿಯಿರಿ.",
            outro: "ದೀಪಜ್ಯೋತಿಯು ಅಜ್ಞಾನವನ್ನು ಕಳೆದು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಕಲ್ಯಾಣದ ಬೆಳಕನ್ನು ತರಲಿ."
          },
          en: {
            intro: "Light the sacred lamp on the right side of the altar. The flame is the living presence of supreme consciousness.",
            mid: "Offer a flower and holy rice to the lamp.",
            outro: "May the divine flame remove all darkness and bring the light of marriage into your life."
          },
          hi: {
            intro: "पूजा वेदी के दाईं ओर दीप प्रज्वलित करें। यह साक्षात ब्रह्म का रूप है।",
            mid: "दीप को अक्षत और पुष्प अर्पित करें।",
            outro: "यह पावन दीप आपके जीवन में विवाह का उजियारा लाए।"
          },
          te: {
            intro: "వేదిక వద్ద దీపాన్ని వెలిగించండి. దీపం పరబ్రహ్మ స్వరూపం.",
            mid: "దీపానికి అక్షతలు సమర్పించండి.",
            outro: "దీపజ్యోతి మీ జీవితంలో వివాహ భాగ్యాన్ని ప్రసాదించుగాక."
          },
          ta: {
            intro: "மங்கள தீபத்தை ஏற்றுங்கள். தீப ஜோதி பரம்பொருளின் வடிவம்.",
            mid: "தீபத்திற்கு மலர் சமர்ப்பியுங்கள்.",
            outro: "தீபஜோதி உங்கள் வாழ்வில் சுப மங்கலத்தை கொண்டு வரட்டும்."
          }
        },
        hiddenPriestInstructionKn: "ದೀಪದ ಜ್ವಾಲೆಯು ದಕ್ಷಿಣಕ್ಕೆ ಇರಬಾರದು. ಪೂರ್ವ ಅಥವಾ ಉತ್ತರ ದಿಕ್ಕಿಗೆ ಮುಖಮಾಡಿರಬೇಕು.",
        hiddenPriestInstructionEn: "Keep lamp flame facing East or North.",
        approxSeconds: 35,
        visualEffect: "deepa"
      },
      {
        step: 3,
        titleKn: "ವಿಘ್ನರಾಜ ಶ್ರೀ ಗಣಪತಿ ಪೂಜೆ",
        titleEn: "Lord Maha Ganapati Invocation",
        actionCueKn: "ಮೊದಲು ಗಣಪತಿಯನ್ನು ಪ್ರಾರ್ಥಿಸಿ, ಅರಿಶಿನದ ಗಣಪತಿಗೆ ಅಕ್ಷತೆ, ಕೆಂಪು ಹೂವು ಮತ್ತು ಗರಿಕೆ ಅರ್ಪಿಸಿ.",
        actionCueEn: "Pray to Lord Vigneshwara, offering red flower, durva and akshata to remove all obstacles.",
        icon: "🐘",
        mantraSanskrit: `शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्।
प्रसन्नवदनं ध्यायॆत् सर्वविघ्नोपशान्तये॥
ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
अविघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
श्री महागणाधिपतये नमः। ध्यायामि, आवाहयामि, गन्धाक्षतपुष्पाणि समर्पयामि॥`,
        mantraL5: {
          kn: `ಶುಕ್ಲಾಂಬರಧರಂ ವಿಷ್ಣುಂ ಶಶಿವರ್ಣಂ ಚತುರ್ಭುಜಮ್।
ಪ್ರಸನ್ನವದನಂ ಧ್ಯಾಯೇತ್ ಸರ್ವವಿಘ್ನೋಪಶಾಂತಯೇ॥
ಓಂ ವಕ್ರತುಂಡ ಮಹಾಕಾಯ ಸೂರ್ಯಕೋಟಿ ಸಮಪ್ರಭ।
ಅವಿಘ್ನಂ ಕುರು ಮೇ ದೇವ ಸರ್ವಕಾರ್ಯೇಷು ಸರ್ವದಾ॥
ಶ್ರೀ ಮಹಾಗಣಾಧಿಪತಯೇ ನಮಃ। ಧ್ಯಾಯಾಮಿ, ಆವಾಹಯಾಮಿ, ಗಂಧಾಕ್ಷತಪುಷ್ಪಾಣಿ ಸಮರ್ಪಯಾಮಿ॥`,
          en: `Shuklaambaradharam Vishnum Shashivarnam Chaturbhujam |
Prasannavadanam Dhyaayet Sarvavighnopashaantaye ||
Om Vakratunda Mahaakaaya Sooryakoti Samaprabha |
Avighnam Kuru Me Deva Sarvakaaryeshu Sarvadaa ||
Shri Mahaaganaadhipataye Namah | Dhyaayaami, Aavaahayaami, Pushpaani Samarpayaami ||`,
          hi: `शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्।
प्रसन्नवदनं ध्यायॆत् सर्वविघ्नोपशान्तये॥
ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
अविघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
श्री महागणाधिपतये नमः।`,
          te: `శుక్లాంబరధరం విష్ణుం శశివర్ణం చతుర్భుజమ్।
ప్రసన్నవదనం ధ్యాయేత్ సర్వవిఘ్నోపశాంతయే॥
ఓం వక్రతుండ మహాకాయ సూర్యకోటి సమప్రభ।
అవిఘ్నం కురు మే దేవ సర్వకార్యేషు సర్వదా॥
శ్రీ మహాగణాధిపతయే నమః।`,
          ta: `ஶுக்லாம்ப³ரத⁴ரம்ʼ விஷ்ணும்ʼ ஶஶிவர்ணம்ʼ சதுர்பு⁴ஜம்।
ப்ரஸன்னவத³னம்ʼ த்⁴யாயேத் ஸர்வவிக்⁴நோபஶாந்தயே॥
ஓம் வக்ரதுண்ட³ மஹாகாய ஸூர்யகோடி ஸமப்ரப⁴।
அவிக்⁴னம்ʼ குரு மே தே³வ ஸர்வకార్யேஷு ஸர்வதா³॥
ஸ்ரீ மஹாக³ணாதி⁴பதயே நம꞉।`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಯಾವುದೇ ವ್ರತವು ನಿರ್ವಿಘ್ನವಾಗಿ ನೆರವೇರಲು ಮೊದಲು ಪ್ರಥಮ ಪೂಜಿತ ಶ್ರೀ ಗಣಪತಿಯನ್ನು ಆರಾಧಿಸಬೇಕು.",
            mid: "ಗಣೇಶನಿಗೆ ಕೆಂಪು ಹೂವು ಮತ್ತು ಅಕ್ಷತೆಯನ್ನು ಭಕ್ತಿಯಿಂದ ಅರ್ಪಿಸಿ.",
            outro: "ವಿಘ್ನರಾಜನು ನಿಮ್ಮ ವಿವಾಹಕ್ಕೆ ಎದುರಾಗುವ ಸಕಲ ಅಡೆತಡೆಗಳನ್ನೂ ದೂರಮಾಡಲಿ."
          },
          en: {
            intro: "Before every sacred vrata, Lord Maha Ganapati must be invoked to dissolve all known and unknown obstacles.",
            mid: "Offer red flower, sacred rice, and durva grass to Lord Ganesha.",
            outro: "May the remover of obstacles clear every hurdle on your wedding path."
          },
          hi: {
            intro: "व्रत के निर्विघ्न सिद्धि हेतु प्रथम पूज्य श्री गणेश जी का ध्यान करें।",
            mid: "गणपति को लाल पुष्प और अक्षत अर्पित करें।",
            outro: "विघ्नहर्ता आपके विवाह के सभी मार्ग प्रशस्त करें।"
          },
          te: {
            intro: "వ్రతం నిర్విఘ్నంగా సాగడానికి విఘ్నేశ్వరుని పూజించండి.",
            mid: "గణపతికి పుష్పం, అక్షతలు సమర్పించండి.",
            outro: "గణనాథుడు సమస్త విఘ్నాలను తొలగించుగాక."
          },
          ta: {
            intro: "விரதம் தடையின்றி நிறைவேற முதலில் விநாயகரை வணங்குங்கள்.",
            mid: "கணபதிக்கு மலர் மற்றும் அக்ஷதை சமர்ப்பியுங்கள்.",
            outro: "விநாயகர் உங்கள் திருமண தடைகளை அகற்றுவாராக."
          }
        },
        hiddenPriestInstructionKn: "ಗಣೇಶನಿಗೆ ತುಳಸಿ ಅರ್ಪಿಸಬಾರದು, ಗರಿಕೆ ಮತ್ತು ಕೆಂಪು ಪುಷ್ಪ ಶ್ರೇಷ್ಠ.",
        hiddenPriestInstructionEn: "Do not offer Tulasi to Ganesha; use Durva grass.",
        approxSeconds: 45,
        visualEffect: "kalasha"
      },
      {
        step: 4,
        titleKn: "ಕಲಶ ಸ್ಥಾಪನೆ & ವರುಣ ಆವಾಹನೆ",
        titleEn: "Sacred Kalasha Consecration",
        actionCueKn: "ತಾಮ್ರ ಅಥವಾ ಬೆಳ್ಳಿಯ ಚೊಂಬಿನಲ್ಲಿ ಶುದ್ಧ ನೀರು ತುಂಬಿ, ಮಾವಿನ ಎಲೆ, ಅಡಿಕೆ, ನಾಣ್ಯ ಹಾಗೂ ತೆಂಗಿನಕಾಯಿ ಇಟ್ಟು ಕಲಶ ಸ್ಥಾಪಿಸಿ.",
        actionCueEn: "Fill a copper/silver pot with clean water, place mango leaves, betel nut, coin, and coconut atop.",
        icon: "🏺",
        mantraSanskrit: `कलशस्य मुखे विष्णुः कण्ठे रुद्रः समाश्रितः।
मूले तत्र स्थितो ब्रह्मा मध्ये मातृगणाः स्मृताः॥
कुक्षौ तु सागराः सर्वे सप्तद्वीपा वसुन्धरा।
ऋग्वेदोऽथ यजुर्वेदः सामवेदो ह्यथर्वणः॥
अङ्गैश्च सहिताः सर्वे कलशं तु समाश्रिताः।
गङ्गे च यमुने चैव गोदावरि सरस्वति।
नर्मदे सिन्धु कावेरि जलेऽस्मिन् सन्निधिं कुरु॥`,
        mantraL5: {
          kn: `ಕಲಶಸ್ಯ ಮುಖೇ ವಿಷ್ಣುಃ ಕಂಠೇ ರುದ್ರಃ ಸಮಾಶ್ರಿತಃ।
ಮೂಲೇ ತತ್ರ ಸ್ಥಿತೋ ಬ್ರಹ್ಮಾ ಮಧ್ಯೇ ಮಾತೃಗಣಾಃ ಸ್ಮೃತಾಃ॥
ಕುಕ್ಷೌ ತು ಸಾಗರಾಃ ಸರ್ವೇ ಸಪ್ತದ್ವೀಪಾ ವಸುಂಧರಾ।
ಋಗ್ವೇದೋಽಥ ಯಜುರ್ವೇದಃ ಸಾಮವೇದೋ ಹ್ಯಥರ್ವಣಃ॥
ಅಂಗೈಶ್ಚ ಸಹಿತಾಃ ಸರ್ವೇ ಕಲಶಂ ತು ಸಮಾಶ್ರಿತಾಃ।
ಗಂಗೇ ಚ ಯಮುನೇ ಚೈವ ಗೋದಾವರಿ ಸರಸ್ವತಿ।
ನರ್ಮದೇ ಸಿಂಧು ಕಾವೇರಿ ಜಲೇಽಸ್ಮಿನ್ ಸನ್ನಿಧಿಂ ಕುರು॥`,
          en: `Kalashasya Mukhe Vishnuh Kanthe Rudrah Samaashritah |
Moole Tatra Sthito Brahmaa Madhye Maatriganaah Smritaah ||
Kukshau Tu Saagaraah Sarve Saptadweepaa Vasundharaa |
Rigvedo'tha Yajurvedah Saamavedo Hyatharvanah ||
Gangaa Cha Yamunaa Chaiva Godaavari Saraswati |
Narmade Sindhu Kaaveri Jale'smin Sannidhim Kuru ||`,
          hi: `कलशस्य मुखे विष्णुः कण्ठे रुद्रः समाश्रितः।
मूले तत्र स्थितो ब्रह्मा मध्ये मातृगणाः स्मृताः॥
गङ्गे च यमुने चैव गोदावरि सरस्वति।
नर्मदे सिन्धु कावेरि जलेऽस्मिन् सन्निधिं कुरु॥`,
          te: `కలశస్య ముఖే విష్ణుః కంఠే రుద్రః సమాశ్రితః।
మూలే తత్ర స్థితో బ్రహ్మా మధ్యే మాతృగణాః స్మృతాః॥
గంగే చ యమునే చైవ గోదావరి సరస్వతి।
నర్మదే సింధు కావేరి జలేಽస్మిన్ సన్నిధిం కురు॥`,
          ta: `கலஶஸ்ய முகே² விஷ்ணு꞉ கண்டே² ருத்³ர꞉ ஸமாஶ்ரித꞉।
மூலே தத்ர ஸ்தி²தோ ப்³ரஹ்மா மத்⁴யே மாத்ருʼக³ணா꞉ ஸ்ம்ருʼதா꞉॥
க³ங்கே³ ச யமுனே சைவ கோ³தா³வரி ஸரஸ்வதி।
நர்மதே³ ஸிந்து⁴ காவேரி ஜலேঽஸ்மின் ஸந்நிதி⁴ம்ʼ குரு॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಕಲಶದ ಮೇಲೆ ಬಲಗೈ ಇಟ್ಟು ಸಪ್ತ ನದಿಗಳನ್ನು, ತ್ರಿಮೂರ್ತಿಗಳನ್ನು ಮತ್ತು ಸಮಸ್ತ ದೇವತೆಗಳನ್ನು ಆವಾಹನೆ ಮಾಡಿ.",
            mid: "ಕಲಶದ ಜಲಕ್ಕೆ ಹೂವು ಮತ್ತು ಗಂಧವನ್ನು ಅರ್ಪಿಸಿ ನಮಸ್ಕರಿಸಿ.",
            outro: "ಕಲಶದಲ್ಲಿ ದೈವೀ ಶಕ್ತಿ ಸಾನ್ನಿಧ್ಯಗೊಂಡಿದೆ."
          },
          en: {
            intro: "Place your right hand over the sacred Kalasha, invoking the sacred rivers Ganges, Yamuna, Godavari, and Saraswati.",
            mid: "Offer a flower and holy rice to the consecrated pot.",
            outro: "The divine presence is now sanctified in this vessel."
          },
          hi: {
            intro: "कलश पर दाहिना हाथ रखकर पवित्र गंगा, यमुना आदि सप्त नदियों का आह्वान करें।",
            mid: "कलश को पुष्प और गंध अर्पित करें।",
            outro: "कलश में साक्षात देवत्व प्रतिष्ठित हुआ।"
          },
          te: {
            intro: "కలశంపై కుడిచేతిని ఉంచి గంగా, యమునా నదులను ఆవాహన చేయండి.",
            mid: "పుష్పాన్ని కలశంపై సమర్పించండి.",
            outro: "కలశంలో దైవిక శక్తి ప్రవేశించింది."
          },
          ta: {
            intro: "கலசத்தின் மீது வலது கையை வைத்து கங்கை, யமுனை போன்ற புனித நதிகளை அழையுங்கள்.",
            mid: "கலசத்திற்கு மலர் சமர்ப்பியுங்கள்.",
            outro: "கலசத்தில் தெய்வீக சாந்நித்யம் குடியேறியது."
          }
        },
        hiddenPriestInstructionKn: "ಕಲಶದ ಕೆಳಗೆ ಅಕ್ಕಿಯ ಅಷ್ಟದಲ ಪದ್ಮ ರಂಗೋಲಿ ರಚಿಸಿ ಅದರ ಮೇಲೆ ಕಲಶ ಇಡಬೇಕು.",
        hiddenPriestInstructionEn: "Place Kalasha on a bed of raw rice configured in lotus mandala.",
        approxSeconds: 45,
        visualEffect: "kalasha"
      },
      {
        step: 5,
        titleKn: "ಶ್ರೀ ಮಂಗಳಗೌರೀ ಆವಾಹನೆ & ಧ್ಯಾನ",
        titleEn: "Invoking Divine Mother Mangalagauri",
        actionCueKn: "ಗೌರಿ ವಿಗ್ರಹಕ್ಕೆ ಅರಿಶಿನ-ಕುಂಕುಮ ಇಟ್ಟು, ಹೂವನ್ನು ಅರ್ಪಿಸಿ ಭಕ್ತಿಯಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಪಾರ್ವತೀ ದೇವಿಯನ್ನು ಧ್ಯಾನಿಸಿ.",
        actionCueEn: "Apply turmeric-kumkum to Mother Gauri's idol, offer flowers, and meditate with intense devotion.",
        icon: "🌺",
        mantraSanskrit: `सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके।
शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥
ॐ कुङ्कुमागुरुपङ्काङ्कां सर्वाभरणभूषिताम्।
नीलकण्ठप्रियां गौरीं वन्दे मङ्गलदायिनीम्॥
श्री मङ्गलगौरी देव्यै नमः। ध्यायामि, आवाहयामि, आसनं समर्पयामि॥`,
        mantraL5: {
          kn: `ಸರ್ವಮಂಗಳಮಾಂಗಲ್ಯೇ ಶಿವೇ ಸರ್ವಾರ್ಥಸಾಧಿಕೇ।
ಶರಣ್ಯೇ ತ್ರ್ಯಂಬಕೇ ಗೌರಿ ನಾರಾಯಣಿ ನಮೋಽಸ್ತು ತೇ॥
ಓಂ ಕುಂಕುಮಾಗುರುಪಂಕಾಂಕಾಂ ಸರ್ವಾಭರಣಭೂಷಿತಾಮ್।
ನೀಲಕಂಠಪ್ರಿಯಾಂ ಗೌರೀಂ ವಂದೇ ಮಂಗಳದಾಯಿನೀಮ್॥
ಶ್ರೀ ಮಂಗಳಗೌರೀ ದೇವ್ಯೈ ನಮಃ। ಧ್ಯಾಯಾಮಿ, ಆವಾಹಯಾಮಿ, ಆಸನಂ ಸಮರ್ಪಯಾಮಿ॥`,
          en: `Sarvamangala Maangalye Shive Sarvaarthasaadhike |
Sharanye Tryambake Gauri Naaraayani Namo'stu Te ||
Om Kunkumaagurupankaankaam Sarvaabharana Bhooshitaam |
Neelakantha Priyaam Gaurim Vande Mangaladaayineem ||
Shri Mangalagauri Devyai Namah | Dhyaayaami, Aavaahayaami, Aasanam Samarpayaami ||`,
          hi: `सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके।
शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥
ॐ कुङ्कुमागुरुपङ्काङ्कां सर्वाभरणभूषिताम्।
नीलकण्ठप्रियां गौरीं वन्दे मङ्गलदायिनीम्॥
श्री मङ्गलगौरी देव्यै नमः। ध्यायामि, आवाहयामि॥`,
          te: `సర్వమంగళమాంగల్యే శివే సర్వార్థసాధికే।
శరణ్యే త్ర్యంబకే గౌరి నారాయణి నమోಽస్తు తే॥
శ్రీ మంగళగౌరీ దేవ్యై నమః। ధ్యాయామి, ఆవాహయామి॥`,
          ta: `ஸர்வமங்க³ளமாங்க³ல்யே ஶிவே ஸர்வார்த²ஸாதி⁴கே।
ஶரண்யே த்ர்யம்ப³கே கௌ³ரி நாராயணி நமோঽஸ்து தே॥
ஸ்ரீ மங்களகௌ³ரீ தே³வ்யை நம꞉। த்⁴யாயாமி, ஆவாஹயாமி॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಜಗನ್ಮಾತೆಯಾದ ಶ್ರೀ ಮಂಗಳಗೌರಿಯನ್ನು ಭಕ್ತಿಯಿಂದ ಧ್ಯಾನಿಸಿ. ಪಾರ್ವತಿಯು ಶಿವನನ್ನು ಪತಿಯಾಗಿ ಪಡೆಯಲು ತಪಸ್ಸು ಮಾಡಿ ವರಿಸಿದ ಮಂಗಳ ಮೂರ್ತಿ.",
            mid: "ದೇವಿಯ ಪಾದಗಳಿಗೆ ಕೆಂಪು ಹೂವು ಮತ್ತು ಅಕ್ಷತೆಯನ್ನು ಸಮರ್ಪಿಸಿ ಆವಾಹನೆ ಮಾಡಿ.",
            outro: "ತಾಯಿಯ ಕೃಪಾದೃಷ್ಟಿ ನಿಮ್ಮ ಮೇಲೆ ಬೀಳುತ್ತಿದೆ."
          },
          en: {
            intro: "Meditate upon Divine Mother Mangalagauri, who performed penance to unite with Lord Shiva as her divine consort.",
            mid: "Offer red fragrant flowers and sacred rice to Mother Gauri's feet.",
            outro: "Mother Parvati's compassionate gaze rests upon you."
          },
          hi: {
            intro: "जगन्माता मंगलगौरी का ध्यान करें जिन्होंने शिव को पति रूप में पाने हेतु तप किया।",
            mid: "माता के चरणों में लाल पुष्प अर्पित करें।",
            outro: "माता का अनुग्रह आप पर बरस रहा है।"
          },
          te: {
            intro: "జగన్మాత మంగళగౌరిని ధ్యానించండి.",
            mid: "దేవి పాదాలకు పుష్పాలు సమర్పించండి.",
            outro: "అమ్మవారి అనుగ్రహం మీపై ప్రసరిస్తోంది."
          },
          ta: {
            intro: "ஜகந்மாதாவான மங்களகௌரியை தியானியுங்கள்.",
            mid: "தாயின் பாதங்களில் மலர் சமர்ப்பியுங்கள்.",
            outro: "அன்னையின் பேரருள் உங்கள் மீது நிறைகிறது."
          }
        },
        hiddenPriestInstructionKn: "ಗೌರಿಯನ್ನು ಆವಾಹಿಸುವಾಗ ನೈವೇದ್ಯಕ್ಕೆ ಸ್ವಲ್ಪ ಬೆಲ್ಲವನ್ನು ಮೊದಲೇ ಸಮರ್ಪಿಸುವುದು ಸಂಪ್ರದಾಯ.",
        hiddenPriestInstructionEn: "Offer a pinch of jaggery during Gauri Avahana.",
        approxSeconds: 50,
        visualEffect: "tulasi"
      },
      {
        step: 6,
        titleKn: "ಪಂಚಾಮೃತ ಅಭಿಷೇಕ & ವಸ್ತ್ರಾರ್ಪಣೆ",
        titleEn: "Panchamrita Holy Abhisheka & Vastra",
        actionCueKn: "ಗೌರಿ ವಿಗ್ರಹಕ್ಕೆ ಹಾಲು, ಮೊಸರು, ತುಪ್ಪ, ಜೇನುತುಪ್ಪ, ಸಕ್ಕರೆ ಹಾಗೂ ಶುದ್ಧ ಗಂಗಾಜಲದಿಂದ ಪ್ರೋಕ್ಷಣೆ ಮಾಡಿ, ರವಿಕೆ ವಸ್ತ್ರ ಸಮರ್ಪಿಸಿ.",
        actionCueEn: "Offer Panchamrita drops to Mother Gauri followed by holy water, and present blouse cloth.",
        icon: "🥛",
        mantraSanskrit: `पयोधिक्षीरसम्पन्नं घृतं मधुसितायुतम्।
पञ्चामृतं मया दत्तं गृहाण परमेश्वरि॥
ॐ पार्वत्यै नमः, पञ्चामृतस्नानं समर्पयामि।
स्नानान्ते शुद्धोदकस्नानं समर्पयामि।
सर्वभूषावृतं दिव्यं कौशेयं पीतमम्बरम्।
गृहाण वरदे गौरि कान्तार्थं मङ्गलप्रदम्॥
वस्त्रं उपवस्त्रं च समर्पयामि॥`,
        mantraL5: {
          kn: `ಪಯೋಧಿಕ್ಷೀರಸಂಪನ್ನಂ ಘೃತಂ ಮಧುಸಿತಾಯುತಮ್।
ಪಂಚಾಮೃತಂ ಮಯಾ ದತ್ತಂ ಗೃಹಾಣ ಪರಮೇಶ್ವರಿ॥
ಓಂ ಪಾರ್ವತ್ಯೈ ನಮಃ, ಪಂಚಾಮೃತಸ್ನಾನಂ ಸಮರ್ಪಯಾಮಿ।
ಸ್ನಾನಾಂತೇ ಶುದ್ಧೋದಕಸ್ನಾನಂ ಸಮರ್ಪಯಾಮಿ।
ಸರ್ವಭೂಷಾವೃತಂ ದಿವ್ಯಂ ಕೌಶೇಯಂ ಪೀತಮಂಬರಮ್।
ಗೃಹಾಣ ವರದೇ ಗೌರಿ ಕಾಂತಾರ್ಥಂ ಮಂಗಳಪ್ರದಮ್॥
ವಸ್ತ್ರಂ ಉಪವಸ್ತ್ರಂ ಚ ಸಮರ್ಪಯಾಮಿ॥`,
          en: `Payodhiksirasampannam Ghritam Madhusitaayutam |
Panchaamritam Mayaa Dattam Grihaana Parameshwari ||
Om Paarvatyai Namah, Panchaamritasnaanam Samarpayaami |
Snaanaante Shuddhodakasnaanam Samarpayaami ||
Vastram Upavastram Cha Samarpayaami ||`,
          hi: `पयोधिक्षीरसम्पन्नं घृतं मधुसितायुतम्।
पञ्चामृतं मया दत्तं गृहाण परमेश्वरि॥
ॐ पार्वत्यै नमः, पञ्चामृतस्नानं समर्पयामि।
वस्त्रं समर्पयामि॥`,
          te: `పయోధిక్షీరసంపన్నం ఘృతం మధుసితాయుతమ్।
పంచామృతం మయా దత్తం గృహాణ పరమేశ్వరి॥
ఓం పార్వత్యై నమః, పంచామృతస్నానం సమర్పయామి।
వస్త్రం సమర్పయామి॥`,
          ta: `பயோதி⁴க்ஷீரஸம்பன்னம்ʼ க்⁴ருʼதம்ʼ மது⁴ஸிதாயுதம்।
பஞ்சாம்ருʼதம்ʼ மயா த³த்தம்ʼ க்³ருʼஹாண பரமேஶ்வரி॥
ஓம் பார்வத்யை நம꞉, பஞ்சாம்ருʼதஸ்நானம்ʼ ஸமர்பயாமி।
வஸ்த்ரம்ʼ ஸமர்பயாமி॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ತಾಯಿಗೆ ಪಂಚಾಮೃತ ಸ್ನಾನವನ್ನು ಸಮರ್ಪಿಸಿ. ಹಳದಿ ಅಥವಾ ಕೆಂಪು ರೇಷ್ಮೆ ವಸ್ತ್ರವನ್ನು ಗೌರಿಗೆ ಅರ್ಪಿಸಿ.",
            mid: "ಸ್ನಾನಾನಂತರ ಸುಗಂಧಭರಿತ ಗಂಧ-ಚಂದನವನ್ನು ಲೇಪಿಸಿ.",
            outro: "ದೇವಿಯು ಮಂಗಳಮಯಿಯಾಗಿ ಕಂಗೊಳಿಸುತ್ತಿದ್ದಾಳೆ."
          },
          en: {
            intro: "Offer drops of sacred Panchamrita bath to Mother Parvati, followed by pure ganga water and sacred yellow/red vastra.",
            mid: "Apply cooling sandalwood paste to the idol.",
            outro: "Mother Gauri radiates in auspicious splendor."
          },
          hi: {
            intro: "माता को पंचामृत स्नान अर्पित करें और लाल/पीला वस्त्र पहनाएं।",
            mid: "चंदन और अक्षत से सुसज्जित करें।",
            outro: "देवी का मंगल स्वरूप प्रकाशित हो रहा है।"
          },
          te: {
            intro: "పంచామృత స్నానం చేయించి, వస్త్రం సమర్పించండి.",
            mid: "గంధాక్షతలు అలంకరించండి.",
            outro: "అమ్మవారు దివ్య సుందరంగా ప్రకాశిస్తున్నారు."
          },
          ta: {
            intro: "பஞ்சாம்ருத ஸ்நானம் செய்து, வஸ்திரம் சமர்ப்பியுங்கள்.",
            mid: "சந்தனம் அணிவித்து மகிழுங்கள்.",
            outro: "அம்பாள் மங்களமாய் ஒளிர்கிறாள்."
          }
        },
        hiddenPriestInstructionKn: "ಅರಿಶಿನದ ಗೌರಿಯಾಗಿದ್ದರೆ ಜಲಪ್ರೋಕ್ಷಣೆಯನ್ನು ಹೂವಿನಿಂದ ಮಾತ್ರ ಸ್ಪರ್ಶಿಸಿ ಮಾಡಬೇಕು.",
        hiddenPriestInstructionEn: "If using turmeric idol, sprinkle panchamrita using a flower gently.",
        approxSeconds: 40,
        visualEffect: "abhisheka"
      },
      {
        step: 7,
        titleKn: "೧೬ ಬಗೆಯ ಹೂಗಳಿಂದ ಅಂಗಪೂಜೆ",
        titleEn: "Anga Pooja with 16 Sacred Flowers",
        actionCueKn: "ಗೌರಿ ದೇವಿಯ ಪಾದದಿಂದ ಶಿರಸ್ಸಿನವರೆಗೆ ೧೬ ಹೂವುಗಳನ್ನು ಒಂದೊಂದಾಗಿ ಅರ್ಪಿಸುತ್ತಾ ಅಂಗಪೂಜೆ ಮಾಡಿ.",
        actionCueEn: "Perform Anga Pooja from divine feet to crown offering 16 flowers with specific names.",
        icon: "🌸",
        mantraSanskrit: `ॐ गौर्यै नमः - पादौ पूजयामि।
ॐ मङ्गलायै नमः - गुल्फौ पूजयामि।
ॐ जगन्मात्रे नमः - जानुनी पूजयामि।
ॐ शर्वाण्यै नमः - ऊरू पूजयामि।
ॐ कामाक्ष्यै नमः - कटी पूजयामि।
ॐ जगत्प्रतिष्ठायै नमः - नाभिं पूजयामि।
ॐ भवान्यै नमः - उदरं पूजयामि।
ॐ पार्वत्यै नमः - स्तनौ पूजयामि।
ॐ शम्भुप्रियायै नमः - कण्ठं पूजयामि।
ॐ शिवाप्रियायै नमः - बाहू पूजयामि।
ॐ सुमुखायै नमः - मुखं पूजयामि।
ॐ त्रिनेत्रायै नमः - नेत्रे पूजयामि।
ॐ शशिशेखरायै नमः - ललाटं पूजयामि।
ॐ सर्वमङ्गलायै नमः - शिरः पूजयामि।
ॐ श्रीमङ्गलगौरी देव्यै नमः - सर्वाङ्गाणि पूजयामि॥`,
        mantraL5: {
          kn: `ಓಂ ಗೌರ್ಯೈ ನಮಃ - ಪಾದೌ ಪೂಜಯಾಮಿ।
ಓಂ ಮಂಗಳಾಯೈ ನಮಃ - ಗುಲ್ಫೌ ಪೂಜಯಾಮಿ।
ಓಂ ಜಗನ್ಮಾತ್ರೇ ನಮಃ - ಜಾನುನೀ ಪೂಜಯಾಮಿ।
ಓಂ ಶರ್ವಾಣ್ಯೈ ನಮಃ - ಊರೂ ಪೂಜಯಾಮಿ।
ಓಂ ಕಾಮಾಕ್ಷ್ಯೈ ನಮಃ - ಕಟೀಂ ಪೂಜಯಾಮಿ।
ಓಂ ಜಗತ್ಪ್ರತಿಷ್ಠಾಯೈ ನಮಃ - ನಾಭಿಂ ಪೂಜಯಾಮಿ।
ಓಂ ಭವಾನ್ಯೈ ನಮಃ - ಉದರಂ ಪೂಜಯಾಮಿ।
ಓಂ ಪಾರ್ವತ್ಯೈ ನಮಃ - ಸ್ತನೌ ಪೂಜಯಾಮಿ।
ಓಂ ಶಂಭುಪ್ರಿಯಾಯೈ ನಮಃ - ಕಂಠಂ ಪೂಜಯಾಮಿ।
ಓಂ ಶಿವಾಪ್ರಿಯಾಯೈ ನಮಃ - ಬಾಹೂ ಪೂಜಯಾಮಿ।
ಓಂ ಸುಮುಖಾಯೈ ನಮಃ - ಮುಖಂ ಪೂಜಯಾಮಿ।
ಓಂ ತ್ರಿನೇತ್ರಾಯೈ ನಮಃ - ನೇತ್ರೇ ಪೂಜಯಾಮಿ।
ಓಂ ಶಶಿಶೇಖರಾಯೈ ನಮಃ - ಲಲಾಟಂ ಪೂಜಯಾಮಿ।
ಓಂ ಸರ್ವಮಂಗಳಾಯೈ ನಮಃ - ಶಿರಃ ಪೂಜಯಾಮಿ।
ಓಂ ಶ್ರೀಮಂಗಳಗೌರೀ ದೇವ್ಯೈ ನಮಃ - ಸರ್ವಾಂಗಾಣಿ ಪೂಜಯಾಮಿ॥`,
          en: `Om Gauryai Namah - Paadau Poojayaami |
Om Mangalaayai Namah - Gulphau Poojayaami |
Om Jaganmaatre Namah - Jaanunee Poojayaami |
Om Sharvaanyai Namah - Ooroo Poojayaami |
Om Kaamaakshyai Namah - Kateem Poojayaami |
Om Bhavanyai Namah - Udaram Poojayaami |
Om Paarvatyai Namah - Kantham Poojayaami |
Om Shambhu Priyaayai Namah - Baahoo Poojayaami |
Om Sumukhaayai Namah - Mukham Poojayaami |
Om Sarvamangalaayai Namah - Shirah Poojayaami |
Om Shri Mangalagauri Devyai Namah - Sarvaangaani Poojayaami ||`,
          hi: `ॐ गौर्यै नमः - पादौ पूजयामि।
ॐ मङ्गलायै नमः - जानुनी पूजयामि।
ॐ पार्वत्यै नमः - कण्ठं पूजयामि।
ॐ सर्वमङ्गलायै नमः - शिरः पूजयामि।
ॐ श्रीमङ्गलगौरी देव्यै नमः - सर्वाङ्गाणि पूजयामि॥`,
          te: `ఓం గౌర్యై నమః - పాదౌ పూజయామి।
ఓం మంగళాయై నమః - కటీం పూజయామి।
ఓం పార్వత్యై నమః - కంఠం పూజయామి।
ఓం శ్రీమంగళగౌరీ దేవ్యై నమః - సర్వాంగాణి పూజయామి॥`,
          ta: `ஓம் கௌ³ர்யை நம꞉ - பாதௌ³ பூஜயாமி।
ஓம் மங்க³ளாயை நம꞉ - ஜானுனீ பூஜயாமி।
ஓம் பார்வத்யை நம꞉ - கண்ட²ம்ʼ பூஜயாமி।
ஓம் ஸ்ரீமங்களகௌ³ரீ தே³வ்யை நம꞉ - ஸர்வாங்கானி பூஜயாமி॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಈಗ ೧೬ ಪುಷ್ಪಗಳಿಂದ ತಾಯಿಯ ಸಮಸ್ತ ಅಂಗಗಳನ್ನೂ ಪೂಜಿಸಿ.",
            mid: "ಪಾದಗಳಿಂದ ಹಿಡಿದು ಶಿರಸ್ಸಿನವರೆಗೆ ಪ್ರತಿಯೊಂದು ನಾಮಕ್ಕೂ ಹೂವು ಮತ್ತು ಕುಂಕುಮಾರ್ಚನೆ ಮಾಡಿ.",
            outro: "ಸರ್ವಾಂಗ ಪೂಜೆಯಿಂದ ಸಕಲ ದೋಷಗಳೂ ನಿವಾರಣೆಯಾಗುತ್ತವೆ."
          },
          en: {
            intro: "Perform the sacred Anga Pooja, offering 16 flowers sequentially from divine feet to forehead.",
            mid: "With each sacred name, place a fragrant flower at Mother Gauri's feet.",
            outro: "Anga Pooja cleanses all biological and karmic obstacles to marriage."
          },
          hi: {
            intro: "१६ पुष्पों से देवी के अंगों का अर्चन करें।",
            mid: "प्रत्येक नाम के साथ पुष्प अर्पित करें।",
            outro: "अंगपूजा से समस्त वैवाहिक दोष नष्ट होते हैं।"
          },
          te: {
            intro: "అంగపూజ చేయండి. పదహారు పుష్పాలు సమర్పించండి.",
            mid: "ప్రతి నామానికి పువ్వు వేయండి.",
            outro: "సర్వాంగ పూజతో దోషాలన్నీ తొలగిపోతాయి."
          },
          ta: {
            intro: "அங்கபூஜை செய்யுங்கள். 16 மலர்களால் தாயை பூஜியுங்கள்.",
            mid: "ஒவ்வொரு நாமத்திற்கும் மலர் இடுங்கள்.",
            outro: "அங்கபூஜையால் அனைத்து தோஷங்களும் நீங்கும்."
          }
        },
        hiddenPriestInstructionKn: "ಅಂಗಪೂಜೆಯ ಸಮಯದಲ್ಲಿ ಕುಂಕುಮ ಮತ್ತು ಅಕ್ಷತೆಯನ್ನೂ ಹೂವಿನೊಂದಿಗೆ ಸೇರಿಸಿ ಅರ್ಪಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Combine kumkuma and akshata along with flowers during Anga Pooja.",
        approxSeconds: 60,
        visualEffect: "bilva"
      },
      {
        step: 8,
        titleKn: "ಸ್ವಯಂವರ ಪಾರ್ವತೀ ಮಂತ್ರ ಜಪ (ಶೀಘ್ರ ಕಲ್ಯಾಣ ಮಂತ್ರ)",
        titleEn: "Swayamvara Parvati Maha Mantra (Marriage Boon)",
        actionCueKn: "ವಿವಾಹ ವಿಳಂಬ ನಿವಾರಣೆಯ ಈ ಸಿದ್ಧ ಮಂತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ೨೮ ಅಥವಾ ೧೦೮ ಬಾರಿ ಜಪಿಸಿ. ಕೆಂಪು ಅಕ್ಷತೆ ಅರ್ಪಿಸಿ.",
        actionCueEn: "Chant the miraculous Swayamvara Parvati Mantra 28 or 108 times for speedy marriage.",
        icon: "📿",
        mantraSanskrit: `ॐ ह्रीं योगिनि योगिनि योगेश्वरि योगभयङ्करि।
सकलस्थावरजङ्गमस्य मुखहृदयं मम वशं आकर्षय आकर्षय नमः॥
ॐ ह्रीं श्रीं क्लीं मनोवाञ्छित वर/वधू प्राप्यर्थं
श्री स्वयंवरा पार्वत्यै नमः॥`,
        mantraL5: {
          kn: `ಓಂ ಹ್ರೀಂ ಯೋಗಿನಿ ಯೋಗಿನಿ ಯೋಗೇಶ್ವರಿ ಯೋಗಭಯಂಕರಿ।
ಸಕಲಸ್ಥಾವರಜಂಗಮಸ್ಯ ಮುಖಹೃದಯಂ ಮಮ ವಶಂ ಆಕರ್ಷಯ ಆಕರ್ಷಯ ನಮಃ॥
ಓಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕ್ಲೀಂ ಮನೋವಾಂಛಿತ ವರ/ವಧೂ ಪ್ರಾಪ್ತ್ಯರ್ಥಂ
ಶ್ರೀ ಸ್ವಯಂವರಾ ಪಾರ್ವತ್ಯೈ ನಮಃ॥`,
          en: `Om Hreem Yogini Yogini Yogeshwari Yogabhayankari |
Sakalasthaavara Jangamasya Mukha Hridayam Mama Vasham Aakarshaya Aakarshaya Namah ||
Om Hreem Shreem Kleem Manovaanchhita Vara/Vadhoo Praaptyartham
Shri Swayamvaraa Paarvatyai Namah ||`,
          hi: `ॐ ह्रीं योगिनि योगिनि योगेश्वरि योगभयङ्करि।
सकलस्थावरजङ्गमस्य मुखहृदयं मम वशं आकर्षय आकर्षय नमः॥
श्री स्वयंवरा पार्वत्यै नमः॥`,
          te: `ఓం హ్రీం యోగిని యోగిని యోగేశ్వరి యోగభయంకరి।
సకలస్థావరజంగమస్య ముఖహృదయం మమ వశం ఆకర్షయ ఆకర్షయ నమః॥
శ్రీ స్వయంవరా పార్వత్యై నమః॥`,
          ta: `ஓம் ஹ்ரீம்ʼ யோகினி யோகினி யோகே³ஶ்வரி யோக³ப⁴யங்கரி।
ஸகலஸ்தா²வரஜங்க³மஸ்ய முக²ஹ்ருʼத³யம்ʼ மம வஶம்ʼ ஆகர்ஷய ஆகர்ஷய நம꞉॥
ஸ்ரீ ஸ்வயம்வரா பார்வத்யை நம꞉॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಭಕ್ತರೇ, ಇದು ಶೀಘ್ರ ಕಲ್ಯಾಣ ಪ್ರಾಪ್ತಿಯ ಅತ್ಯಂತ ಪ್ರಭಾವಶಾಲಿ ಸ್ವಯಂವರ ಪಾರ್ವತೀ ಮಂತ್ರ. ೩೨ ವರ್ಷವಾಗಿದ್ದರೂ ವಿವಾಹವಾಗದಿದ್ದರೂ ಈ ಮಂತ್ರದ ಶಕ್ತಿಯಿಂದ ಸೂಕ್ತ ಸಂಗಾತಿ ಸಿಗುತ್ತಾರೆ.",
            mid: "ಮನಸ್ಸಿನಲ್ಲಿ ನಿಮ್ಮ ಇಷ್ಟಾರ್ಥವನ್ನು ದೃಢವಾಗಿ ಸಂಕಲ್ಪಿಸಿಕೊಂಡು ಮಣಿಗಳನ್ನು ಎಣಿಸುತ್ತಾ ಜಪಿಸಿ.",
            outro: "ದೇವಿಯ ಪರಮಾನುಗ್ರಹದಿಂದ ಶೀಘ್ರವೇ ಶುಭ ವಿವಾಹದ ಸುದ್ದಿ ಕೇಳಿಬರಲಿ."
          },
          en: {
            intro: "Devotee, this is the sovereign Swayamvara Parvati Mantra. Even after age 32 or prolonged delays, this mantra dissolves all barriers and attracts the ideal virtuous soulmate.",
            mid: "Chant with focused heart, holding the divine wish clearly in mind.",
            outro: "May the divine grace manifest the auspicious wedding bells swiftly."
          },
          hi: {
            intro: "यह परम शक्तिशाली स्वयंवर पार्वती मंत्र है जो शीघ्र उत्तम जीवनसाथी प्रदान करता है।",
            mid: "एकाग्र मन से जप करें।",
            outro: "मां जगदंबा के आशीर्वाद से शीघ्र शुभ विवाह संपन्न हो।"
          },
          te: {
            intro: "ఇది పరమ పవిత్ర స్వయంవర పార్వతీ మంత్రం. శీఘ్ర వివాహం సిద్ధిస్తుంది.",
            mid: "భక్తితో జపించండి.",
            outro: "దేవి కటాక్షంతో త్వరలోనే శుభ వివాహం జరుగుతుంది."
          },
          ta: {
            intro: "இது திருமண தடைகளை தகர்க்கும் சக்திவாய்ந்த ஸ்வயம்வர பார்வதி மகா மந்திரம்.",
            mid: "மனமுருகி ஜபம் செய்யுங்கள்.",
            outro: "அன்னையின் அருளால் விரைவில் திருமணம் கைகூடும்."
          }
        },
        hiddenPriestInstructionKn: "ಜಪದ ನಂತರ ೧೦೮ ಬಾರಿ ಶ್ರೀ ಗೌರಿಯ ಪಾದಗಳಿಗೆ ಅಕ್ಷತೆ ಸಮರ್ಪಿಸುವುದು ಶ್ರೇಷ್ಠ.",
        hiddenPriestInstructionEn: "Keep count carefully; 108 recitations yield unmatched fruit.",
        japaTarget: 108,
        japaMantra: "ॐ ह्रीं स्वयंवरा पार्वत्यै नमः",
        approxSeconds: 120,
        visualEffect: "japa"
      },
      {
        step: 9,
        titleKn: "೧೬ ಎಳೆಯ ರಕ್ಷಾಸೂತ್ರ (ದೋರ) ಬಂಧನ",
        titleEn: "Binding the Consecrated 16-Knot Thread",
        actionCueKn: "೧೬ ಎಳೆಯ ಅರಿಶಿನದ ರಕ್ಷಾಸೂತ್ರಕ್ಕೆ ೧೬ ಗ್ರಂಥಿ ಪೂಜೆ ಮಾಡಿ, ಪ್ರಾರ್ಥಿಸುತ್ತಾ ಬಲಗೈಗೆ ಕಟ್ಟಿಕೊಳ್ಳಿ.",
        actionCueEn: "Consecrate the 16-strand turmeric thread with flowers, pray for marital bliss, and tie on your right wrist.",
        icon: "🎗️",
        mantraSanskrit: `दोरग्रन्थिषु संपूज्याः प्रतिग्रन्थि विभावरी।
नमस्ते मङ्गलप्रदे नमस्ते दुःखहारिणी॥
सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके।
शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥
इदं कङ्कणं शुभ्रं मङ्गलं पापनाशनम्।
धारणात् सर्वकार्याणि सिद्ध्यन्ति वरदायिनी॥`,
        mantraL5: {
          kn: `ದೋರಗ್ರಂಥಿಷು ಸಂಪೂಜ್ಯಾಃ ಪ್ರತಿಗ್ರಂಥಿ ವಿಭಾವರೀ।
ನಮಸ್ತೇ ಮಂಗಳಪ್ರದೇ ನಮಸ್ತೇ ದುಃಖಹಾರಿಣೀ॥
ಸರ್ವಮಂಗಳಮಾಂಗಲ್ಯೇ ಶಿವೇ ಸರ್ವಾರ್ಥಸಾಧಿಕೇ।
ಶರಣ್ಯೇ ತ್ರ್ಯಂಬಕೇ ಗೌರಿ ನಾರಾಯಣಿ ನಮೋಽಸ್ತು ತೇ॥
ಇದಂ ಕಂಕಣಂ ಶುಭ್ರಂ ಮಂಗಳಂ ಪಾಪನಾಶನಮ್।
ಧಾರಣಾತ್ ಸರ್ವಕಾರ್ಯಾಣಿ ಸಿದ್ಧ್ಯಂತಿ ವರದಾಯಿನೀ॥`,
          en: `Doragranthishu Sampoojyaah Pratigranthi Vibhaavari |
Namaste Mangalaprade Namaste Duhkhahaarini ||
Sarvamangala Maangalye Shive Sarvaarthasaadhike |
Sharanye Tryambake Gauri Naaraayani Namo'stu Te ||
Idam Kankanam Shubhraam Mangalam Paapanaashanam |
Dhaaranaat Sarvakaaryaani Siddhyanti Varadaayinee ||`,
          hi: `दोरग्रन्थिषु संपूज्याः प्रतिग्रन्थि विभावरी।
नमस्ते मङ्गलप्रदे नमस्ते दुःखहारिणी॥
इदं कङ्कणं शुभ्रं मङ्गलं पापनाशनम्।
धारणात् सर्वकार्याणि सिद्ध्यन्ति वरदायिनी॥`,
          te: `దోరగ్రంథిషు సంపూజ్యాః ప్రతిగ్రంథి విభావరీ।
నమస్తే మంగళప్రదే నమస్తే దుఃఖహారిణీ॥
ఇదం కంకణం శుభ్రం మంగళం పాపనాశనమ్।
ధారణాత్ సర్వకార్యాణి సిద్ధ్యంతి వరదాయినీ॥`,
          ta: `தோ³ரக்³ரந்தி²ஷு ஸம்பூஜ்யா꞉ ப்ரதிக்³ரந்தி² விபா⁴வரீ।
நமஸ்தே மங்க³ளப்ரதே³ நமஸ்தே து³꞉க²ஹாரிணீ॥
இதம்ʼ கங்கணம்ʼ ஶுப்⁴ரம்ʼ மங்க³ளம்ʼ பாபநாஶநம்।
தா⁴ரணாத் ஸர்வకార్யாணி ஸித்³த்⁴யந்தி வரதா³யினீ॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಈಗ ಅತ್ಯಂತ ಪವಿತ್ರವಾದ ೧೬ ಎಳೆಯ ರಕ್ಷಾಸೂತ್ರವನ್ನು ಗೌರಿಯ ಪಾದಗಳಲ್ಲಿರಿಸಿ ಪೂಜಿಸಿ.",
            mid: "ಈ ಸೂತ್ರವನ್ನು ನಿಮ್ಮ ಬಲಗೈ ಮಣಿಕಟ್ಟಿಗೆ ಭಕ್ತಿಯಿಂದ ಕಟ್ಟಿಕೊಳ್ಳಿ ಅಥವಾ ಕಟ್ಟಿಸಿಕೊಳ್ಳಿ.",
            outro: "ಈ ರಕ್ಷಾಸೂತ್ರವು ಸಕಲ ದುರಿತಗಳನ್ನು ಕಳೆದು ಮಾಂಗಲ್ಯ ಭಾಗ್ಯವನ್ನು ತಂದುಕೊಡುತ್ತದೆ."
          },
          en: {
            intro: "Place the consecrated 16-strand turmeric sacred thread at Mother Gauri's feet.",
            mid: "Tie this consecrated Dora on your right wrist with intense faith.",
            outro: "This sacred thread protects against negative astral influences and seals the marriage boon."
          },
          hi: {
            intro: "१६ सूत्रों वाला पवित्र रक्षासूत्र देवी के चरणों में रखकर पूजन करें।",
            mid: "इस पवित्र कंकण को दाहिनी कलाई पर बांधें।",
            outro: "यह रक्षासूत्र समस्त बाधाओं का शमन कर मंगल विवाह प्रदान करता है।"
          },
          te: {
            intro: "పదహారు పోగుల రక్షాసూత్రాన్ని దేవి వద్ద ఉంచి పూజించండి.",
            mid: "కుడి చేతికి కట్టుకోండి.",
            outro: "ఈ రక్షాసూత్రం శుభ ఫలితాలను ఇస్తుంది."
          },
          ta: {
            intro: "16 இழைகள் கொண்ட ரக்ஷா சூத்திரத்தை அம்மன் பாதத்தில் வைத்து பூஜியுங்கள்.",
            mid: "வலது கையில் கட்டிக்கொள்ளுங்கள்.",
            outro: "இந்த கங்கணம் மங்கள யோகத்தை அருளும்."
          }
        },
        hiddenPriestInstructionKn: "ಈ ರಕ್ಷಾಸೂತ್ರವನ್ನು ಕನಿಷ್ಠ ೧೬ ದಿನಗಳ ಕಾಲ ಅಥವಾ ಮುಂದಿನ ಮಂಗಳವಾರದವರೆಗೆ ಕೈಯಲ್ಲೇ ಧರಿಸಿರಬೇಕು.",
        hiddenPriestInstructionEn: "Wear the consecrated wrist thread for at least 16 days or until the next Tuesday.",
        approxSeconds: 45,
        visualEffect: "namaskara"
      },
      {
        step: 10,
        titleKn: "ಮಹಾ ನೈವೇದ್ಯ, ಮಂಗಳಾರತಿ & ಬಾಗಿನ ಸಮರ್ಪಣೆ",
        titleEn: "Maha Naivedya, Mangalarathi & Baagina Dana",
        actionCueKn: "ಪಾಯಸ/ಸಿಹಿ ನೈವೇದ್ಯ ಅರ್ಪಿಸಿ, ಕರ್ಪೂರ ಮಂಗಳಾರತಿ ಬೆಳಗಿಸಿ. ನಂತರ ಸುಮಂಗಲಿಯರಿಗೆ ಬಾಗಿನ ನೀಡಿ ಆಶೀರ್ವಾದ ಪಡೆಯಿರಿ.",
        actionCueEn: "Offer sweet payasa, wave Karpura Mangalarathi with ringing bell, and present Baagina to elders/Sumangalis.",
        icon: "🔥",
        mantraSanskrit: `ॐ कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्।
सदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥
जय जय मङ्गलगौरि कल्याणी। जय जय शङ्करप्रिय राणी॥
मङ्गलारार्तिक्यं समर्पयामि।
अनेन मया कृतेन कल्याणामङ्गलगौरी व्रतानुष्ठानेन
श्री मङ्गलगौरी देवी सुप्रीता सुप्रसन्ना वरदा भवतु॥`,
        mantraL5: {
          kn: `ಓಂ ಕರ್ಪೂರಗೌರಂ ಕರುಣಾವತಾರಂ ಸಂಸಾರಸಾರಂ ಭುಜಗೇಂದ್ರಹಾರಮ್।
ಸದಾ ವಸಂತಂ ಹೃದಯಾರವಿಂದೇ ಭವಂ ಭವಾನೀಸಹಿತಂ ನಮಾಮಿ॥
ಜಯ ಜಯ ಮಂಗಳಗೌರಿ ಕಲ್ಯಾಣೀ। ಜಯ ಜಯ ಶಂಕರಪ್ರಿಯ ರಾಣೀ॥
ಮಂಗಳಾರಾರ್ತಿಕಂ ಸಮರ್ಪಯಾಮಿ।
ಅನೇನ ಮಯಾ ಕೃತೇನ ಕಲ್ಯಾಣಮಂಗಳಗೌರೀ ವ್ರತಾನುಷ್ಠಾನೇನ
ಶ್ರೀ ಮಂಗಳಗೌರೀ ದೇವೀ ಸುಪ್ರೀತಾ ಸುಪ್ರಸನ್ನಾ ವರದಾ ಭವತು॥`,
          en: `Om Karpooragauram Karunaavataaram Samsaarasaaram Bhujagendrahaaram |
Sadaa Vasantam Hridayaaravinde Bhavam Bhavaaneesahitam Namaami ||
Jaya Jaya Mangalagauri Kalyaani | Jaya Jaya Shankara Priya Raani ||
Mangalaaraartikyam Samarpayaami |
Anena Mayaa Kritena Kalyaana Mangalagauri Vrataanushthaanena
Shri Mangalagauri Devi Supreetaa Suprasannaa Varadaa Bhavatu ||`,
          hi: `ॐ कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्।
सदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥
कर्पूर मङ्गलारार्तिक्यं समर्पयामि।
श्री मङ्गलगौरी देवी सुप्रीता सुप्रसन्ना भवतु॥`,
          te: `ఓం కర్పూరగౌరం కరుణావతారం సంసారసారం భుజగేంద్రహారమ్।
సదా వసంతం హృదయారవిందే భవం భవానీసహితం నమామి॥
మంగళహారతిం సమర్పయామి।
శ్రీ మంగళగౌరీ దేవీ సుప్రీతా సుప్రసన్నా వరదా భవతు॥`,
          ta: `ஓம் கற்பூர கௌ³ரம்ʼ கருணாவதாரம்ʼ ஸம்ஸாரஸாரம்ʼ பு⁴ஜகே³ந்த்³ரஹாரம்।
ஸதா³ வஸந்தம்ʼ ஹ்ருʼத³யாரவிந்தே³ ப⁴வம்ʼ ப⁴வானீஸஹிதம்ʼ நமாமி॥
மங்களாரத்தி சமர்ப்பயாமி।
ஸ்ரீ மங்களகௌ³ரீ தே³வீ ஸுப்ரீதா ஸுப்ரஸன்னா ப⁴வது॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಘಂಟಾನಾದದೊಂದಿಗೆ ದೇವಿಗೆ ಕರ್ಪೂರ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ. ಕಣ್ಣುಗಳಿಗೆ ಆರತಿಯನ್ನು ಸ್ಪರ್ಶಿಸಿಕೊಳ್ಳಿ.",
            mid: "ಪಾಯಸ ಪ್ರಸಾದವನ್ನು ಸ್ವೀಕರಿಸಿ, ತಯಾರಿಸಿಟ್ಟ ಮಂಗಳ ಬಾಗಿನವನ್ನು ಸುಮಂಗಲಿಯರಿಗೆ ನೀಡಿ ಅವರ ಪಾದಗಳಿಗೆ ನಮಸ್ಕರಿಸಿ.",
            outro: "ನಿಮ್ಮ ಕಲ್ಯಾಣ ಮಂಗಳಗೌರೀ ವ್ರತವು ಸಂಪೂರ್ಣವಾಯಿತು. ಶ್ರೀ ಶಂಕರ-ಪಾರ್ವತಿಯರ ಕೃಪೆಯಿಂದ ಶೀಘ್ರವೇ ನಿಮ್ಮ ಸುಯೋಗ್ಯ ಕಲ್ಯಾಣವು ನೆರವೇರಲಿ!"
          },
          en: {
            intro: "Wave the sacred camphor Mangalarathi while ringing the temple bell. Take the divine light to your eyes.",
            mid: "Accept the holy payasa prasada, and gift the auspicious Baagina to married women or elders, seeking their blessings.",
            outro: "Your sacred Kalyana Mangalagauri Vrata is auspiciously fulfilled! By the infinite grace of Shiva and Parvati, may your righteous marriage take place swiftly!"
          },
          hi: {
            intro: "घंटानाद के साथ देवी को कर्पूर आरती दिखाएं और नेत्रों से स्पर्श करें।",
            mid: "प्रसाद ग्रहण करें और सुहागिनों को बायना भेंट कर आशीर्वाद लें।",
            outro: "कल्याण मंगलगौरी व्रत संपन्न हुआ। मां पार्वती की कृपा से शीघ्र विवाह सिद्ध हो।"
          },
          te: {
            intro: "కర్పూర హారతి ఇవ్వండి. హారతిని కళ్ళకు అద్దుకోండి.",
            mid: "వాయనం సమర్పించి పెద్దల ఆశీర్వాదం తీసుకోండి.",
            outro: "మీ వ్రతం సంపూర్ణమైంది. శీఘ్ర వివాహ ప్రాప్తి కలుగుగాక!"
          },
          ta: {
            intro: "கற்பூர ஆரத்தி காட்டி கண்களில் ஒற்றிக் கொள்ளுங்கள்.",
            mid: "பாகினம் தானம் செய்து பெரியோர்களிடம் ஆசி பெறுங்கள்.",
            outro: "உங்கள் விரதம் இனிதே நிறைவுற்றது. விரைவில் திருமண யோகம் கைகூடட்டும்!"
          }
        },
        hiddenPriestInstructionKn: "ಬಾಗಿನ ಕೊಡುವಾಗ 'ಬಾಗಿನ ತಗೋ ಸುಮಂಗಲಿ - ಬಾಗಿನ ಕೊಡ್ತೀನಿ ಸುಮಂಗಲಿ' ಎಂದು ನಮಸ್ಕರಿಸುವುದು ಪರಮ ಶ್ರೇಷ್ಠ ಸಂಪ್ರದಾಯ.",
        hiddenPriestInstructionEn: "Seek blessings of elderly married women after offering the Baagina.",
        approxSeconds: 60,
        visualEffect: "arathi"
      }
    ]
  },

  // =========================================================================
  // VRATA 2: ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮೀ ವ್ರತ ಮಹಾವಿಧಿ
  // Family peace, wish fulfillment, overall prosperity
  // =========================================================================
  satyanarayana_vrata: {
    key: "satyanarayana_vrata",
    titleKn: "ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮೀ ವ್ರತ ಮಹಾವಿಧಿ",
    titleEn: "Sri Satyanarayana Swamy Vrata Mahavidhi",
    subtitleKn: "ಕುಟುಂಬ ಶಾಂತಿ, ಮನೋಕಾಮನಾ ಸಿದ್ಧಿ, ಸಮೃದ್ಧಿ & ಸಕಲ ಸಂಕಷ್ಟ ನಿವಾರಣೆ",
    subtitleEn: "Sacred Satyanarayana Vrata for Wish Fulfillment, Harmony & Total Prosperity",
    icon: "🪷",
    badgeTextKn: "ಸರ್ವ ಕಾಮನಾ ಸಿದ್ಧಿ ವ್ರತ",
    badgeTextEn: "Universal Wish Fulfillment",
    colorScheme: {
      primary: "#D97706",
      border: "#F59E0B",
      badgeBg: "#FFFBEB",
      gradient: "from-amber-600 via-yellow-500 to-orange-500"
    },
    purposeKn: "ಸಂಸಾರದ ಸಕಲ ಕಷ್ಟಗಳ ನಿವಾರಣೆ, ಧನ-ಧಾನ್ಯ-ಐಶ್ವರ್ಯ ಸಮೃದ್ಧಿ, ಗೃಹಪ್ರವೇಶ, ನೂತನ ಕಾರ್ಯಾರಂಭ ಹಾಗೂ ಮನೋಕಾಮನೆಗಳ ಈಡೇರಿಕೆಗಾಗಿ ಕಲಿಯುಗದ ಪರಮ ಶ್ರೇಷ್ಠ ವ್ರತ.",
    purposeEn: "The supreme vrata of Kaliyuga described in the Skanda Purana, performed to dispel financial hardships, bring harmony to family life, and ensure smooth completion of all righteous endeavors.",
    benefitsKn: "೧. ಅತಿ ಶೀಘ್ರದಲ್ಲಿ ಮನೋಕಾಮನೆ ಈಡೇರುವುದು. ೨. ಮನೆಯಲ್ಲಿ ಕಲಹ ನಿವಾರಣೆಯಾಗಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸುವುದು. ೩. ವ್ಯಾಪಾರ, ಉದ್ಯೋಗದಲ್ಲಿ ದಿವ್ಯ ಲಾಭ. ೪. ಧರ್ಮ, ಅರ್ಥ, ಕಾಮ, ಮೋಕ್ಷ ಚತುರ್ವಿಧ ಫಲಗಳ ಪ್ರಾಪ್ತಿ.",
    benefitsEn: "1. Rapid fulfillment of heartfelt wishes. 2. Lasting peace and unity in household. 3. Success in business, ventures, and employment. 4. Attainment of the 4 purusharthas: Dharma, Artha, Kama, and Moksha.",
    idealForKn: "ಕುಟುಂಬದ ನೆಮ್ಮದಿ ಬಯಸುವವರು, ಹೊಸ ಮನೆ ಕಟ್ಟಿದವರು, ಹೊಸ ಉದ್ಯೋಗ ಅಥವಾ ವ್ಯಾಪಾರ ಆರಂಭಿಸುವವರು, ಸಂಕಷ್ಟಗಳಿಂದ ಮುಕ್ತಿ ಅಪೇಕ್ಷಿಸುವವರು.",
    idealForEn: "Families seeking tranquility, new homeowners, business founders, and anyone desiring divine peace and wish fulfillment.",
    timingKn: "ಹುಣ್ಣಿಮೆ (ಪೌರ್ಣಮಿ), ಸಂಕ್ರಾಂತಿ, ಯಾವುದೇ ತಿಂಗಳ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ದಿನ, ಸಾಯಂಕಾಲದ ಪ್ರದೋಷ ಸಮಯ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.",
    timingEn: "Purnima (Full Moon), Sankranti, or any auspicious Shukla Paksha day during evening Pradosha hours.",
    samagriList: [
      {
        id: "satyanarayana_photo",
        itemKn: "ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮೀ ಪಟ ಅಥವಾ ಮೂರ್ತಿ",
        itemEn: "Sri Satyanarayana Photo or Idol",
        quantityKn: "೧",
        quantityEn: "1",
        importance: "mandatory"
      },
      {
        id: "sapada_bhakshya",
        itemKn: "ಸಪಾದ ಭಕ್ಷ್ಯ (ರವೆ, ತುಪ್ಪ, ಸಕ್ಕರೆ, ಹಾಲು, ಬಾಳೆಹಣ್ಣು ಸರಿಸಮನಾದ ಸಜ್ಜಪ್ಪ/ಶಿರಾ)",
        itemEn: "Sapada Bhakshya (Equal parts semolina, ghee, sugar, milk, banana)",
        quantityKn: "೧/೪ ಕೆ.ಜಿ ಪ್ರಮಾಣ",
        quantityEn: "1.25 units measurement",
        importance: "mandatory",
        notesKn: "ಸತ್ಯನಾರಾಯಣ ಪೂಜೆಯ ಪ್ರಮುಖ ನೈವೇದ್ಯ."
      },
      {
        id: "kalasha_vessel",
        itemKn: "ಕಲಶ ಪಾತ್ರೆ, ತಾಮ್ರದ ನಾಣ್ಯಗಳು & ತೆಂಗಿನಕಾಯಿ",
        itemEn: "Kalasha pot, copper coins & coconut",
        quantityKn: "೧ ಸೆಟ್",
        quantityEn: "1 set",
        importance: "mandatory"
      },
      {
        id: "navadhanya",
        itemKn: "ನವಧಾನ್ಯಗಳು & ಅಕ್ಕಿ (ಪೀಠಕ್ಕೆ)",
        itemEn: "Navadhanya (Nine grains) & Raw rice",
        quantityKn: "೧ ಬಟ್ಟಲು",
        quantityEn: "1 bowl",
        importance: "recommended"
      },
      {
        id: "tulasi_garland",
        itemKn: "ಪವಿತ್ರ ತುಳಸಿ ದಳಗಳು & ಹೂವಿನ ಹಾರಗಳು",
        itemEn: "Fresh Tulasi leaves & flower garlands",
        quantityKn: "ಸಾಕಷ್ಟು",
        quantityEn: "Abundant",
        importance: "mandatory"
      },
      {
        id: "panchamrita",
        itemKn: "ಪಂಚಾಮೃತ (ಹಾಲು, ಮೊಸರು, ತುಪ್ಪ, ಜೇನು, ಸಕ್ಕರೆ)",
        itemEn: "Panchamrita",
        quantityKn: "೧ ಬಟ್ಟಲು",
        quantityEn: "1 bowl",
        importance: "mandatory"
      },
      {
        id: "vilya_ele",
        itemKn: "ವಿಳ್ಳೇದೆಲೆ, ಅಡಿಕೆ & ಹಣ್ಣುಗಳು",
        itemEn: "Betel leaves, nuts & bananas",
        quantityKn: "೨೫ ಎಲೆಗಳು",
        quantityEn: "25 leaves",
        importance: "mandatory"
      }
    ],
    steps: [
      {
        step: 1,
        titleKn: "ಪ್ರಾತಃ ಶುದ್ಧಿ & ಪ್ರಾರ್ಥನೆ",
        titleEn: "Preliminary Sanctification & Aachamana",
        actionCueKn: "ಆಚಮನ ಮಾಡಿ, ಪೂಜಾ ಮಂಟಪವನ್ನು ಗಂಗಾಜಲದಿಂದ ಶುದ್ಧೀಕರಿಸಿ ಕುಳಿತುಕೊಳ್ಳಿ.",
        actionCueEn: "Perform Achamana and sprinkle holy water on altar and self.",
        icon: "💧",
        mantraSanskrit: `ॐ अपवित्रः पवित्रो वा सर्वावस्थां गतोऽपि वा।
यः स्मरेत्पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥
ॐ केशवाय नमः। ॐ नारायणाय नमः। ॐ माधवाय नमः॥`,
        mantraL5: {
          kn: `ಓಂ ಅಪವಿತ್ರಃ ಪವಿತ್ರೋ ವಾ ಸರ್ವಾವಸ್ಥಾಂ ಗತೋಽಪಿ ವಾ।
ಯಃ ಸ್ಮರೇತ್ಪುಂಡರೀಕಾಕ್ಷಂ ಸ ಬಾಹ್ಯಾಭ್ಯಂತರಃ ಶುಚಿಃ॥
ಓಂ ಕೇಶವಾಯ ನಮಃ। ಓಂ ನಾರಾಯಣಾಯ ನಮಃ। ಓಂ ಮಾಧವಾಯ ನಮಃ॥`,
          en: `Om Apavitrah Pavitro Vaa Sarvaavasthaam Gato'pi Vaa |
Yah Smaret Pundarikaaksham Sa Baahyaabhyantarah Shuchih ||
Om Keshavaaya Namah | Om Naaraayanaaya Namah | Om Maadhavaaya Namah ||`,
          hi: `ॐ अपवित्रः पवित्रो वा सर्वावस्थां गतोऽपि वा।
यः स्मरेत्पुण्डरीकाक्षं स बाह्याभ्यन्तरः शुचिः॥`,
          te: `ఓం అపవిత్రః పవిత్రో వా సర్వావస్థాం గతోಽపి వా।
యః స్మరేత్పుండరీకాక్షం స బాహ్యాభ్యంతరః శుచిః॥`,
          ta: `ஓம் அபவித்ர꞉ பவித்ரோ வா ஸர்வாவஸ்தாம்ʼ க³தோঽபி வா।
ய꞉ ஸ்மரேத்புண்ட³ரீகாக்ஷம்ʼ ஸ பா³ஹ்யாப்⁴யந்தர꞉ ஶுசி꞉॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ವ್ರತದ ಆರಂಭದಲ್ಲಿ ಆಚಮನ ಮಾಡಿ ಶುದ್ಧರಾಗಿ.",
            mid: "ಮಂಟಪದ ಮೇಲೆ ಗಂಗಾಜಲ ಸಿಂಪಡಿಸಿ.",
            outro: "ಪವಿತ್ರ ಮನಸ್ಸಿನಿಂದ ಆಸನದಲ್ಲಿ ಸ್ಥಿರವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ."
          },
          en: {
            intro: "Begin the sacred Satyanarayana Vrata with purifying Achamana.",
            mid: "Sprinkle holy water across the sanctified altar.",
            outro: "Sit peacefully with a devoted heart."
          },
          hi: {
            intro: "सत्यनारायण व्रत के प्रारंभ में आचमन कर पवित्र हों।",
            mid: "वेदी पर गंगाजल छिड़कें।",
            outro: "शुद्ध भाव से आसन ग्रहण करें।"
          },
          te: {
            intro: "ఆచమనం చేసి పవిత్రులవ్వండి.",
            mid: "తీర్థం చల్లండి.",
            outro: "శాంతంగా కూర్చోండి."
          },
          ta: {
            intro: "ஆசமனம் செய்து சுத்தியடையுங்கள்.",
            mid: "கங்கா தீர்த்தம் தெளியுங்கள்.",
            outro: "அமைதியாய் அமருங்கள்."
          }
        },
        hiddenPriestInstructionKn: "ಮಂಟಪವನ್ನು ರಂಗೋಲಿ ಮತ್ತು ಮಾವಿನ ತೋರಣಗಳಿಂದ ಶೃಂಗರಿಸುವುದು ಶ್ರೇಷ್ಠ.",
        hiddenPriestInstructionEn: "Decorate the altar with mango leaves and rangoli.",
        approxSeconds: 30,
        visualEffect: "achamana"
      },
      {
        step: 2,
        titleKn: "ಗಣಪತಿ & ನವಗ್ರಹ ದೇವತಾ ಸ್ಮರಣೆ",
        titleEn: "Ganesha & Navagraha Invocation",
        actionCueKn: "ವಿಘ್ನರಾಜ ಗಣಪತಿಗೆ ಹಾಗೂ ನವಗ್ರಹ ದೇವತೆಗಳಿಗೆ ಅಕ್ಷತೆ ಹೂವು ಸಮರ್ಪಿಸಿ ಪ್ರಾರ್ಥಿಸಿ.",
        actionCueEn: "Offer flowers and sacred rice to Lord Ganesha and planetary deities.",
        icon: "🐘",
        mantraSanskrit: `वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
अविघ्नं कुरु मे देव सर्वकार्येषು सर्वदा॥
ॐ नवग्रहेभ्यो नमः। अर्घ्यं पाद्यं गन्धाक्षतपुष्पाणि समर्पयामि॥`,
        mantraL5: {
          kn: `ವಕ್ರತುಂಡ ಮಹಾಕಾಯ ಸೂರ್ಯಕೋಟಿ ಸಮಪ್ರಭ।
ಅವಿಘ್ನಂ ಕುರು ಮೇ ದೇವ ಸರ್ವಕಾರ್ಯೇಷು ಸರ್ವದಾ॥
ಓಂ ನವಗ್ರಹೇಭ್ಯೋ ನಮಃ। ಅರ್ಘ್ಯಂ ಪಾದ್ಯಂ ಗಂಧಾಕ್ಷತಪುಷ್ಪಾಣಿ ಸಮರ್ಪಯಾಮಿ॥`,
          en: `Vakratunda Mahaakaaya Sooryakoti Samaprabha |
Avighnam Kuru Me Deva Sarvakaaryeshu Sarvadaa ||
Om Navagrahebhyo Namah | Pushpaani Samarpayaami ||`,
          hi: `वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
अविघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥`,
          te: `వక్రతుండ మహాకాయ సూర్యకోటి సమప్రభ।
అవిఘ్నం కురు మే దేవ సర్వకార్యేషు సర్వదా॥`,
          ta: `வக்ரதுண்ட³ மஹாகாய ஸூர்யகோடி ஸமப்ரப⁴।
அவிக்⁴னம்ʼ குரு மே தே³வ ஸர்வకార్யேஷு ஸர்வதா³॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಸತ್ಯನಾರಾಯಣ ವ್ರತವು ಸಾಂಗವಾಗಿ ನೆರವೇರಲು ಗಣೇಶ ಮತ್ತು ನವಗ್ರಹರನ್ನು ಆವಾಹಿಸಿ.",
            mid: "ಅಕ್ಷತೆ ಹೂವುಗಳನ್ನು ಪೀಠದ ಮೇಲೆ ಅರ್ಪಿಸಿ.",
            outro: "ಸಕಲ ಗ್ರಹದೋಷಗಳೂ ಶಾಂತವಾಗಲಿ."
          },
          en: {
            intro: "Invoke Lord Ganesha and the nine planetary rulers to bless the ritual without impediment.",
            mid: "Offer flowers and holy rice.",
            outro: "May all planetary influences turn auspicious."
          },
          hi: {
            intro: "गणेश जी और नवग्रहों का आह्वान करें।",
            mid: "पुष्प और अक्षत अर्पित करें।",
            outro: "ग्रहबाधा शांत हो।"
          },
          te: {
            intro: "గణపతిని మరియు నవగ్రహాలను పూజించండి.",
            mid: "పుష్పాలు సమర్పించండి.",
            outro: "గ్రహ శాంతి కలుగుగాక."
          },
          ta: {
            intro: "விநாயகர் மற்றும் நவகிரகங்களை வழிபடுங்கள்.",
            mid: "மலர் சமர்ப்பியுங்கள்.",
            outro: "கிரக தோஷங்கள் நீங்கட்டும்."
          }
        },
        hiddenPriestInstructionKn: "ನವಧಾನ್ಯಗಳನ್ನು ನವಗ್ರಹ ಮಂಡಲದಲ್ಲಿ ಇಟ್ಟು ಪೂಜಿಸುವುದು ಅತ್ಯುತ್ತಮ.",
        hiddenPriestInstructionEn: "Place nine grains in Navagraha mandala if possible.",
        approxSeconds: 35,
        visualEffect: "kalasha"
      },
      {
        step: 3,
        titleKn: "ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಧ್ಯಾನ & ಆವಾಹನೆ",
        titleEn: "Invoking Lord Sri Satyanarayana Swamy",
        actionCueKn: "ಚತುರ್ಭುಜ ಶಂಖ-ಚಕ್ರ-ಗದಾ-ಪದ್ಮಧಾರಿಯಾದ ಶ್ರೀ ನಾರಾಯಣನನ್ನು ತುಳಸಿಯಿಂದ ಆವಾಹಿಸಿ.",
        actionCueEn: "Meditate upon Lord Narayana holding conch, discus, mace, and lotus; offer Tulasi leaves.",
        icon: "🪷",
        mantraSanskrit: `शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं
विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्।
लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं
वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥
ॐ नमो भगवते सत्यनारायणाय नमः।
ध्यायामि, आवाहयामि, तुलसीदलं समर्पयामि॥`,
        mantraL5: {
          kn: `ಶಾಂತಾಕಾರಂ ಭುಜಗಶಯನಂ ಪದ್ಮನಾಭಂ ಸುರೇಶಂ
ವಿಶ್ವಾಧಾರಂ ಗಗನಸದೃಶಂ ಮೇಘವರ್ಣಂ ಶುಭಾಂಗಮ್।
ಲಕ್ಷ್ಮೀಕಾಂತಂ ಕಮಲನಯನಂ ಯೋಗಿಭಿರ್ಧ್ಯಾನಗಮ್ಯಂ
ವಂದೇ ವಿಷ್ಣುಂ ಭವಭಯಹರಂ ಸರ್ವಲೋಕೈಕನಾಥಮ್॥
ಓಂ ನಮೋ ಭಗವತೇ ಸತ್ಯನಾರಾಯಣಾಯ ನಮಃ।
ಧ್ಯಾಯಾಮಿ, ಆವಾಹಯಾಮಿ, ತುಳಸೀದಲಂ ಸಮರ್ಪಯಾಮಿ॥`,
          en: `Shaantaakaaram Bhujagashayanam Padmanaabham Suresham
Vishwaadhaaram Gaganasadrisham Meghavarnam Shubhaangam |
Lakshmikaantam Kamalanayanam Yogibhirdhyaanagamyam
Vande Vishnum Bhavabhayaharam Sarvalokaikanaatham ||
Om Namo Bhagavate Satyanaaraayanaaya Namah ||`,
          hi: `शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं
विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्।
लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं
वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥
ॐ नमो भगवते सत्यनारायणाय नमः।`,
          te: `శాంతాకారం భుజగశయనం పద్మనాభం సురేశం
విశ్వాధారం గగనసదృశం మేఘవర్ణం శుభాంగమ్।
లక్ష్మీకాంతం కమలనయనం యోగిభిర్ధ్యానగమ్యం
వందే విష్ణుం భవభయహరం సర్వలోకైకనాథమ్॥`,
          ta: `ஶாந்தாகாரம்ʼ பு⁴ஜக³ஶயனம்ʼ பத்³மநாப⁴ம்ʼ ஸுரேஶம்
விஶ்வாத⁴ாரம்ʼ க³க³நஸத்³ருʼஶம்ʼ மேக⁴வர்ணம்ʼ ஶுபா⁴ங்க³ம்।
லக்ஷ்மீகாந்தம்ʼ கமலநயனம்ʼ யோகி³பி⁴ர்த்⁴யானக³ம்யம்
வந்தே³ விஷ்ணும்ʼ ப⁴வப⁴யஹரம்ʼ ஸர்வலோகைகநாத²ம்॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಶಾಂತಾಕಾರನಾದ ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮಿಯನ್ನು ಹೃದಯಕಮಲದಲ್ಲಿ ಧ್ಯಾನಿಸಿ.",
            mid: "ಪವಿತ್ರ ತುಳಸಿ ದಳಗಳನ್ನು ಭಗವಂತನ ಶ್ರೀಪಾದಗಳಿಗೆ ಅರ್ಪಿಸಿ.",
            outro: "ಭಕ್ತವತ್ಸಲನಾದ ನಾರಾಯಣನು ನಿಮ್ಮ ಪೂಜೆಯಲ್ಲಿ ಸಾನ್ನಿಧ್ಯಗೊಂಡಿದ್ದಾನೆ."
          },
          en: {
            intro: "Meditate upon serene Lord Satyanarayana seated in your lotus heart.",
            mid: "Offer fresh sacred Tulasi leaves at His lotus feet.",
            outro: "The Lord of the Universe has arrived to accept your devotion."
          },
          hi: {
            intro: "शांताकार भगवान श्री सत्यनारायण का ध्यान करें।",
            mid: "तुलसीदल भगवान के चरणों में अर्पित करें।",
            outro: "प्रभु आपकी पूजा में पधारे हैं।"
          },
          te: {
            intro: "శాంతాకారుడైన సత్యనారాయణ స్వామిని ధ్యానించండి.",
            mid: "తులసీదళాలను సమర్పించండి.",
            outro: "స్వామి సాన్నిధ్యం లభించింది."
          },
          ta: {
            intro: "சாந்தரூபியான சத்தியநாராயணரை தியானியுங்கள்.",
            mid: "துளசி தளம் சமர்ப்பியுங்கள்.",
            outro: "ஸ்ரீமன் நாராயணன் உங்கள் பூஜையில் எழுந்தருளினார்."
          }
        },
        hiddenPriestInstructionKn: "ತುಳಸಿಯಿಲ್ಲದೆ ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ ಸಂಪೂರ್ಣವಾಗುವುದಿಲ್ಲ. ಹಸಿರು ತುಳಸಿ ಶ್ರೇಷ್ಠ.",
        hiddenPriestInstructionEn: "Tulasi is indispensable for Lord Satyanarayana.",
        approxSeconds: 45,
        visualEffect: "tulasi"
      },
      {
        step: 4,
        titleKn: "ಅಷ್ಟೋತ್ತರ ಶತನಾಮಾವಳಿ & ತುಳಸಿ ಅರ್ಚನೆ",
        titleEn: "108 Names Archana with Tulasi Leaves",
        actionCueKn: "ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮಿಯ ಪವಿತ್ರ ನಾಮಗಳನ್ನು ಪಠಿಸುತ್ತಾ ತುಳಸಿ ಮತ್ತು ಹೂವುಗಳನ್ನು ಸಮರ್ಪಿಸಿ.",
        actionCueEn: "Chant the sacred names of Sri Satyanarayana while offering fragrant Tulasi and flowers.",
        icon: "🌿",
        mantraSanskrit: `ॐ सत्यनारायणाय नमः। ॐ सत्यदेवाय नमः।
ॐ सत्यव्रताय नमः। ॐ सत्यात्मने नमः।
ॐ जगन्नाथाय नमः। ॐ जनार्दनाय नमः।
ॐ पीताम्बराय नमः। ॐ चतुर्भुजाय नमः।
ॐ वासुदेवाय नमः। ॐ वैकुण्ठपतये नमः।
ॐ श्रीवत्साङ्काय नमः। ॐ कौस्तुभधराय नमः।
ॐ लक्ष्मीवक्षःस्थलस्थिताय नमः।
ॐ सर्वकामप्रदायकाय नमः॥`,
        mantraL5: {
          kn: `ಓಂ ಸತ್ಯನಾರಾಯಣಾಯ ನಮಃ। ಓಂ ಸತ್ಯದೇವಾಯ ನಮಃ।
ಓಂ ಸತ್ಯವ್ರತಾಯ ನಮಃ। ಓಂ ಸತ್ಯಾತ್ಮನೇ ನಮಃ।
ಓಂ ಜಗನ್ನಾಥಾಯ ನಮಃ। ಓಂ ಜನಾರ್ದನಾಯ ನಮಃ।
ಓಂ ಪೀತಾಂಬರಾಯ ನಮಃ। ಓಂ ಚತುರ್ಭುಜಾಯ ನಮಃ।
ಓಂ ವಾಸುದೇವಾಯ ನಮಃ। ಓಂ ವೈಕುಂಠಪತಯೇ ನಮಃ।
ಓಂ ಶ್ರೀವತ್ಸಾಂಕಾಯ ನಮಃ। ಓಂ ಕೌಸ್ತುಭಧರಾಯ ನಮಃ।
ಓಂ ಲಕ್ಷ್ಮೀವಕ್ಷಃಸ್ಥಲಸ್ಥಿತಾಯ ನಮಃ।
ಓಂ ಸರ್ವಕಾಮಪ್ರದಾಯಕಾಯ ನಮಃ॥`,
          en: `Om Satyanaaraayanaaya Namah | Om Satyadevaaya Namah |
Om Satyavrataaya Namah | Om Satyaatmane Namah |
Om Jagannaathaaya Namah | Om Janaardanaaya Namah |
Om Peetaambaraaya Namah | Om Chaturbhujaaya Namah |
Om Vaasudevaaya Namah | Om Vaikunthapataye Namah |
Om Sarvakaamapradaayakaaya Namah ||`,
          hi: `ॐ सत्यनारायणाय नमः। ॐ सत्यदेवाय नमः।
ॐ सत्यव्रताय नमः। ॐ सत्यात्मने नमः।
ॐ जनार्दनाय नमः। ॐ चतुर्भुजाय नमः।
ॐ सर्वकामप्रदायकाय नमः॥`,
          te: `ఓం సత్యనారాయణాయ నమః। ఓం సత్యదేవాయ నమః।
ఓం జగన్నాథాయ నమః। ఓం జనార్దనాయ నమః।
ఓಂ సర్వకామప్రదాయకాయ నమః॥`,
          ta: `ஓம் ஸத்யநாராயணாய நம꞉। ஓம் ஸத்யதே³வாய நம꞉।
ஓம் ஜக³ந்நாதா²ய நம꞉। ஓம் ஜனார்த³னாய நம꞉।
ஓம் ஸர்வகாமப்ரதா³யகாய நம꞉॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಈಗ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮಿಯ ದಿವ್ಯ ನಾಮಗಳಿಂದ ತುಳಸಿ ಅರ್ಚನೆ ಮಾಡಿ.",
            mid: "ಪ್ರತಿ ನಾಮಕ್ಕೂ ಭಕ್ತಿಯಿಂದ ತುಳಸಿ ಮತ್ತು ಹೂವುಗಳನ್ನು ಸ್ವಾಮಿಯ ಪಾದಗಳಿಗೆ ಅರ್ಪಿಸಿ.",
            outro: "ಈ ಅರ್ಚನೆಯು ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳನ್ನೂ ಸಿದ್ಧಿಸುತ್ತದೆ."
          },
          en: {
            intro: "Perform Tulasi Archana chanting the sacred names of Sri Satyanarayana.",
            mid: "With each holy name, place a fragrant Tulasi leaf at His feet.",
            outro: "This Archana bestows victory, wealth, and inner bliss."
          },
          hi: {
            intro: "सत्यनारायण भगवान के नामों से तुलसी अर्चना करें।",
            mid: "प्रत्येक नाम पर तुलसी अर्पित करें।",
            outro: "यह अर्चना समस्त कामनाओं को पूर्ण करती है।"
          },
          te: {
            intro: "తులసితో అష్టోత్తర అర్చన చేయండి.",
            mid: "స్వామి పాదాలకు తులసి సమర్పించండి.",
            outro: "సకల శుభాలు కలుగుతాయి."
          },
          ta: {
            intro: "துளசியால் அர்ச்சனை செய்யுங்கள்.",
            mid: "நாமங்களை சொல்லி துளசி இடுங்கள்.",
            outro: "மனக்கவலைகள் யாவும் தீரும்."
          }
        },
        hiddenPriestInstructionKn: "ಸಾಧ್ಯವಿದ್ದರೆ ೧೦೮ ತುಳಸಿ ದಳಗಳಿಂದ ಪೂರ್ಣ ಅಷ್ಟೋತ್ತರ ಪಠಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Use 108 fresh Tulasi leaves for full Ashtottara chanting.",
        approxSeconds: 60,
        visualEffect: "tulasi"
      },
      {
        step: 5,
        titleKn: "ಸಪಾದ ಭಕ್ಷ್ಯ ನೈವೇದ್ಯ, ಮಂಗಳಾರತಿ & ಪ್ರಸಾದ ಸ್ವೀಕಾರ",
        titleEn: "Sapada Bhakshya Offering & Maha Mangalarathi",
        actionCueKn: "ಸಪಾದ ಭಕ್ಷ್ಯ (ರವೆ, ತುಪ್ಪ, ಹಾಲು, ಸಕ್ಕರೆ, ಬಾಳೆಹಣ್ಣು ಪ್ರಸಾದ) ಸಮರ್ಪಿಸಿ, ಕರ್ಪೂರಾರತಿ ಬೆಳಗಿಸಿ.",
        actionCueEn: "Present Sapada Bhakshya sacred prasada, wave Karpura Arathi, and receive blessings.",
        icon: "🔥",
        mantraSanskrit: `ॐ सपादभक्ष्यं नैवेद्यं सुवर्णकलशस्थितम्।
गृहाण देवदेवेश भक्तिं मे ह्यचलां कुरु॥
ॐ सत्यनारायणाय नमः, नैवेद्यं समर्पयामि।
कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्।
सदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥
नारायण नमस्तेऽस्तु शङ्खचक्रगदाधर।
प्रसीद मे जगन्नाथ सर्वकामप्रदो भव॥`,
        mantraL5: {
          kn: `ಓಂ ಸಪಾದಭಕ್ಷ್ಯಂ ನೈವೇದ್ಯಂ ಸುವರ್ಣಕಲಶಸ್ಥಿತಮ್।
ಗೃಹಾಣ ದೇವದೇವೇಶ ಭಕ್ತಿಂ ಮೇ ಹ್ಯಚಲಾಂ ಕುರು॥
ಓಂ ಸತ್ಯನಾರಾಯಣಾಯ ನಮಃ, ನೈವೇದ್ಯಂ ಸಮರ್ಪಯಾಮಿ।
ಕರ್ಪೂರಗೌರಂ ಕರುಣಾವತಾರಂ ಸಂಸಾರಸಾರಂ ಭುಜಗೇಂದ್ರಹಾರಮ್।
ಸದಾ ವಸಂತಂ ಹೃದಯಾರವಿಂದೇ ಭವಂ ಭವಾನೀಸಹಿತಂ ನಮಾಮಿ॥
ನಾರಾಯಣ ನಮಸ್ತೇಽಸ್ತು ಶಂಖಚಕ್ರಗದಾಧರ।
ಪ್ರಸೀದ ಮೇ ಜಗನ್ನಾಥ ಸರ್ವಕಾಮಪ್ರದೋ ಭವ॥`,
          en: `Om Sapaadabhakshyam Naivedyam Suvarnakalashasthitam |
Grihaana Devadevesha Bhaktim Me Hyachalaam Kuru ||
Om Satyanaaraayanaaya Namah, Naivedyam Samarpayaami ||
Karpooragauram Karunaavataaram Samsaarasaaram Bhujagendrahaaram |
Naaraayana Namaste'stu Shankhachakragadaadhara |
Praseeda Me Jagannaatha Sarvakaamaprado Bhava ||`,
          hi: `ॐ सपादभक्ष्यं नैवेद्यं गृहाण देवदेवेश।
ॐ सत्यनारायणाय नमः, नैवेद्यं समर्पयामि।
कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्।
प्रसीद मे जगन्नाथ सर्वकामप्रदो भव॥`,
          te: `ఓం సపాదభక్ష్యం నైవేద్యం గృహాణ దేవదేవేశ।
నైవేద్యం సమర్పయామి।
కర్పూరహారతిం సమర్పయామి।
ప్రసీద మే జగన్నాథ సర్వకామప్రదో భవ॥`,
          ta: `ஓம் ஸபாத³ப⁴க்ஷ்யம்ʼ நைவேத்³யம்ʼ க்³ருʼஹாண தே³வதே³வேஶ।
நைவேத்யம் சமர்ப்பயாமி।
கற்பூர ஆரத்தி காட்டி மகிழுங்கள்।
ப்ரஸீத³ மே ஜக³ந்நாத² ஸர்வகாமப்ரதோ³ ப⁴வ॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮಿಗೆ ಅತ್ಯಂತ ಪ್ರಿಯವಾದ ಸಪಾದ ಭಕ್ಷ್ಯವನ್ನು ಭಕ್ತಿಯಿಂದ ನೈವೇದ್ಯ ಮಾಡಿ.",
            mid: "ಕರ್ಪೂರದ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ, ಘಂಟಾನಾದ ಮಾಡಿ.",
            outro: "ಪ್ರಸಾದವನ್ನು ಎಲ್ಲರಿಗೂ ಹಂಚಿ, ನೀವೂ ಭಕ್ತಿಯಿಂದ ಸ್ವೀಕರಿಸಿ. ನಿಮ್ಮ ಸತ್ಯನಾರಾಯಣ ವ್ರತವು ಸಫಲವಾಯಿತು!"
          },
          en: {
            intro: "Offer the beloved Sapada Bhakshya prasada to Lord Sri Satyanarayana.",
            mid: "Wave the radiant camphor flame and ring the sacred bell.",
            outro: "Distribute the holy prasada to all and partake with reverence. Your Satyanarayana Vrata is fulfilled!"
          },
          hi: {
            intro: "सत्यनारायण भगवान को प्रिय पंजीरी/शीरा सपाद भक्ष्य भोग लगाएं।",
            mid: "कर्पूर आरती करें।",
            outro: "प्रसाद वितरण कर स्वयं भी ग्रहण करें। व्रत पूर्ण हुआ।"
          },
          te: {
            intro: "స్వామికి ప్రసాదం నైవేద్యం పెట్టండి.",
            mid: "హారతి ఇవ్వండి.",
            outro: "ప్రసాదాన్ని స్వీకరించండి. వ్రతం సంపూర్ణమైంది."
          },
          ta: {
            intro: "சத்தியநாராயணருக்கு பிரசாதம் சமர்ப்பியுங்கள்.",
            mid: "கற்பூர ஆரத்தி எடுங்கள்.",
            outro: "பிரசாதம் விநியோகித்து நீங்களும் உட்கொள்ளுங்கள். விரதம் இனிதே முடிந்தது."
          }
        },
        hiddenPriestInstructionKn: "ಕಥಾ ಶ್ರವಣದ ನಂತರ ಪ್ರಸಾದ ಸ್ವೀಕರಿಸುವುದು ಪರಮ ಕಡ್ಡಾಯ. ಪ್ರಸಾದ ನಿರಾಕರಿಸಬಾರದು.",
        hiddenPriestInstructionEn: "Never reject Satyanarayana prasada; distribute gladly.",
        approxSeconds: 60,
        visualEffect: "arathi"
      }
    ]
  },

  // =========================================================================
  // VRATA 3: ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮೀ ವ್ರತ ಮಹಾವಿಧಿ
  // Soubhagya, abundance & Ashtalakshmi blessings
  // =========================================================================
  varalakshmi_vrata: {
    key: "varalakshmi_vrata",
    titleKn: "ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮೀ ವ್ರತ ಮಹಾವಿಧಿ",
    titleEn: "Sri Varamahalakshmi Vrata Mahavidhi",
    subtitleKn: "ಅಷ್ಟಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷ, ಸೌಭಾಗ್ಯ ವೃದ್ಧಿ, ಅಖಂಡ ಸಂಪತ್ತು & ಮಾಂಗಲ್ಯ ಬಲ",
    subtitleEn: "Sacred Varamahalakshmi Vrata for Soubhagya, Wealth & Ashta Lakshmi Blessings",
    icon: "🪙",
    badgeTextKn: "ಸೌಭಾಗ್ಯ ಲಕ್ಷ್ಮೀ ವ್ರತ",
    badgeTextEn: "Abundance & Fortune",
    colorScheme: {
      primary: "#C026D3",
      border: "#E879F9",
      badgeBg: "#FDF4FF",
      gradient: "from-fuchsia-600 via-pink-500 to-amber-500"
    },
    purposeKn: "ಮನೆಯಲ್ಲಿ ಅಷ್ಟೈಶ್ವರ್ಯ, ಸೌಭಾಗ್ಯ, ಶಾಂತಿ ಹಾಗೂ ಲಕ್ಷ್ಮಿ ಕಟಾಕ್ಷ ಸದಾ ನೆಲೆಸಲು, ಸುಮಂಗಲಿಯರ ಮಾಂಗಲ್ಯ ಬಲ ರಕ್ಷಣೆಗಾಗಿ ಶ್ರಾವಣ ಮಾಸದಲ್ಲಿ ಆಚರಿಸುವ ಪರಮ ಮಂಗಳಕರ ವ್ರತ.",
    purposeEn: "Celebrated on the Friday before Shravana Purnima, invoking Goddess Varamahalakshmi who grants boons (Vara) of health, wealth, progeny, courage, and unbroken auspiciousness.",
    benefitsKn: "೧. ಧನ-ಧಾನ್ಯ ಮತ್ತು ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ. ೨. ಅಖಂಡ ಸೌಭಾಗ್ಯ ಮತ್ತು ದಾಂಪತ್ಯ ಪ್ರೇಮ. ೩. ಸಾಲಬಾಧೆ ಹಾಗೂ ದಾರಿದ್ರ್ಯದ ಶಾಶ್ವತ ನಿವಾರಣೆ. ೪. ಸಂತಾನ ಭಾಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಯಶಸ್ಸು.",
    benefitsEn: "1. Steady financial growth and wealth. 2. Lifelong marital harmony and longevity of spouse. 3. Liberation from debts and poverty. 4. Auspicious lineage and peace.",
    idealForKn: "ಸುಮಂಗಲಿಯರು, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಮತ್ತು ಕುಟುಂಬದ ಶ್ರೇಯಸ್ಸು ಬಯಸುವ ಗೃಹಸ್ಥರು, ನವವಿವಾಹಿತೆಯರು.",
    idealForEn: "Married women seeking lifelong marital fortune, families seeking prosperity, and newly married couples.",
    timingKn: "ಶ್ರಾವಣ ಶುಕ್ಲ ಪಕ್ಷದ ಹುಣ್ಣಿಮೆಗೆ ಮುನ್ನ ಬರುವ ಶುಕ್ರವಾರ (ಶ್ರಾವಣ ಶುಕ್ರವಾರ) ಪ್ರಾತಃಕಾಲ ಅಥವಾ ಬೆಳಿಗ್ಗೆ ೮ ರಿಂದ ೧೧ ರ ಒಳಗೆ.",
    timingEn: "Friday preceding the Full Moon in the month of Shravana, during auspicious morning Choghadiya.",
    samagriList: [
      {
        id: "lakshmi_mask",
        itemKn: "ವರಮಹಾಲಕ್ಷ್ಮಿ ಮುಖವಾಡ ಅಥವಾ ಚಿನ್ನ/ಬೆಳ್ಳಿಯ ಮೂರ್ತಿ",
        itemEn: "Varamahalakshmi Face Mask or Idol",
        quantityKn: "೧",
        quantityEn: "1",
        importance: "mandatory"
      },
      {
        id: "kalasha_silk",
        itemKn: "ಕಲಶ ಚೊಂಬು, ರೇಷ್ಮೆ ಸೀರೆ/ರವಿಕೆ ವಸ್ತ್ರ, ಮಾವಿನ ಎಲೆಗಳು",
        itemEn: "Kalasha pot, silk cloth, mango leaves",
        quantityKn: "೧ ಸೆಟ್",
        quantityEn: "1 set",
        importance: "mandatory"
      },
      {
        id: "nombu_thread",
        itemKn: "೯ ಎಳೆಯ ನೋಂಪಿಯ ದಾರ (೯ ಗಂಟುಗಳಿರುವ ಅರಿಶಿನ ಸೂತ್ರ)",
        itemEn: "9-strand sacred Dora thread with 9 knots",
        quantityKn: "೧ ಸೂತ್ರ",
        quantityEn: "1 thread",
        importance: "mandatory",
        notesKn: "ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತದ ಪ್ರಮುಖ ಮಂಗಳಸೂತ್ರ."
      },
      {
        id: "lotus_flowers",
        itemKn: "ಕಮಲದ ಹೂವುಗಳು (ತಾವರೆ) & ಸುಗಂಧ ಪುಷ್ಪಗಳು",
        itemEn: "Lotus flowers & fragrant blossoms",
        quantityKn: "೨ ತಾವರೆ + ಮಾಲೆ",
        quantityEn: "2 lotuses + garland",
        importance: "recommended",
        notesKn: "ಮಹಾಲಕ್ಷ್ಮಿಗೆ ಕಮಲ ಅತ್ಯಂತ ಪ್ರಿಯ."
      },
      {
        id: "sweets_nine",
        itemKn: "೯ ಬಗೆಯ ಪಕ್ವಾನ್ನಗಳು ಅಥವಾ ಸಿಹಿ ಹೋಳಿಗೆ/ಪಾಯಸ",
        itemEn: "9 varieties of sweet dishes / Holige / Payasa",
        quantityKn: "ಸಾಕಷ್ಟು",
        quantityEn: "Adequate",
        importance: "recommended"
      },
      {
        id: "bagina_set",
        itemKn: "ಸೌಭಾಗ್ಯ ಬಾಗಿನ ಸಾಮಗ್ರಿಗಳು (ಮೋರ, ಬಳೆ, ಕನ್ನಡಿ, ವಸ್ತ್ರ)",
        itemEn: "Baagina sets for Sumangalis",
        quantityKn: "೨ ಸೆಟ್",
        quantityEn: "2 sets",
        importance: "mandatory"
      }
    ],
    steps: [
      {
        step: 1,
        titleKn: "ಕಲಶ ಅಲಂಕಾರ & ಲಕ್ಷ್ಮೀ ಆವಾಹನೆ",
        titleEn: "Kalasha Decoration & Lakshmi Invocation",
        actionCueKn: "ಕಲಶಕ್ಕೆ ಸೀರೆ ಉಡಿಸಿ, ಮುಖವಾಡವನ್ನು ಶೃಂಗರಿಸಿ, ಅಕ್ಷತೆ-ಪುಷ್ಪಗಳಿಂದ ಲಕ್ಷ್ಮಿಯನ್ನು ಆವಾಹಿಸಿ.",
        actionCueEn: "Drape the sacred pot in silk, fasten the deity face, and invoke Goddess Varamahalakshmi.",
        icon: "🪙",
        mantraSanskrit: `पद्मासने पद्मकरे सर्वलोकैकपूजिते।
नारायणप्रिये देवि सुप्रसन्ना भवार्तिहन्॥
ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद
श्रीं ह्रीं श्रीं ॐ महालक्ष्म्यै नमः॥
वरमहालक्ष्मी देव्यै नमः। ध्यायामि, आवाहयामि॥`,
        mantraL5: {
          kn: `ಪದ್ಮಾಸನೇ ಪದ್ಮಕರೇ ಸರ್ವಲೋಕೈಕಪೂಜಿತೇ।
ನಾರಾಯಣಪ್ರಿಯೇ ದೇವಿ ಸುಪ್ರಸನ್ನಾ ಭವಾರ್ತಿಹನ್॥
ಓಂ ಶ್ರೀಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕಮಲೇ ಕಮಲಾಲಯೇ ಪ್ರಸೀದ ಪ್ರಸೀದ
ಶ್ರೀಂ ಹ್ರೀಂ ಶ್ರೀಂ ಓಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ॥
ವರಮಹಾಲಕ್ಷ್ಮೀ ದೇವ್ಯೈ ನಮಃ। ಧ್ಯಾಯಾಮಿ, ಆವಾಹಯಾಮಿ॥`,
          en: `Padmaasane Padmakare Sarvalokaikapoojite |
Naaraayanapriye Devi Suprasannaa Bhavaartihan ||
Om Shreem Hreem Shreem Kamale Kamalaalaye Praseeda Praseeda
Shreem Hreem Shreem Om Mahaalakshmyai Namah ||
Varamahaalakshmi Devyai Namah ||`,
          hi: `पद्मासने पद्मकरे सर्वलोकैकपूजिते।
नारायणप्रिये देवि सुप्रसन्ना भवार्तिहन्॥
ॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः।`,
          te: `పద్మాసనే పద్మకరే సర్వలోకైకపూజితే।
నారాయణప్రియే దేవి సుప్రసన్నా భవార్తిహన్॥
శ్రీం హ్రీం శ్రీం మహాలక్ష్మ్యై నమః।`,
          ta: `பத்³மாஸனே பத்³மகரே ஸர்வலோகைகபூஜிதே।
நாராயணப்ரியே தே³வி ஸுப்ரஸன்னா ப⁴வார்திஹன்॥
ஓம் மஹாலக்ஷ்ம்யை நம꞉।`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಕಲಶದಲ್ಲಿ ಸಾಕ್ಷಾತ್ ವರಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿಯನ್ನು ಆವಾಹಿಸಿ. ತಾಯಿಯು ಪದ್ಮಾಸನಾರೂಢಳಾಗಿ ನಾರಾಯಣನ ಪ್ರಿಯೆಯಾಗಿದ್ದಾಳೆ.",
            mid: "ಕಮಲದ ಹೂವು ಮತ್ತು ಅಕ್ಷತೆಯಿಂದ ತಾಯಿಯ ಪಾದಗಳನ್ನು ಅರ್ಚಿಸಿ.",
            outro: "ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷವು ತುಂಬಿದೆ."
          },
          en: {
            intro: "Invoke Supreme Mother Varamahalakshmi into the sanctified Kalasha.",
            mid: "Offer pink lotus petals and sacred rice to Her feet.",
            outro: "The aura of golden abundance permeates your sanctuary."
          },
          hi: {
            intro: "कलश में वरमहालक्ष्मी का आह्वान करें।",
            mid: "कमल पुष्प अर्पित करें।",
            outro: "माता का आगमन आपके घर में हुआ।"
          },
          te: {
            intro: "కలశంలో శ్రీ వరమహాలక్ష్మిని ఆవాహన చేయండి.",
            mid: "కమల పుష్పం సమర్పించండి.",
            outro: "లక్ష్మీ కటాక్షం సిద్ధించింది."
          },
          ta: {
            intro: "கலசத்தில் வரமகாலக்ஷ்மியை அழையுங்கள்.",
            mid: "தாமரை மலர் சமர்ப்பியுங்கள்.",
            outro: "லக்ஷ்மி கடாக்ஷம் உங்கள் வீட்டில் நிறைந்தது."
          }
        },
        hiddenPriestInstructionKn: "ಮುಖವಾಡ ಸ್ಥಾಪಿಸುವ ಮುನ್ನ ಕನ್ನಡಿಯ ಮುಖಾಂತರ ದೇವಿಯ ಮುಖವನ್ನು ನೋಡುವುದು ವಾಡಿಕೆ.",
        hiddenPriestInstructionEn: "Reflecting deity's face in a mirror first is a sacred tradition.",
        approxSeconds: 45,
        visualEffect: "kalasha"
      },
      {
        step: 2,
        titleKn: "೯ ಎಳೆಯ ನೋಂಪಿಯ ದಾರ (ದೋರಗ್ರಂಥಿ) ಪೂಜೆ",
        titleEn: "Consecrating 9-Strand Sacred Dora Thread",
        actionCueKn: "೯ ಗಂಟುಗಳಿರುವ ಅರಿಶಿನದ ದಾರಕ್ಕೆ ಒಂದೊಂದು ಗಂಟಿಗೂ ಲಕ್ಷ್ಮಿಯ ನಾಮಗಳನ್ನು ಹೇಳುತ್ತಾ ಹೂವು-ಕುಂಕುಮ ಅರ್ಪಿಸಿ ಬಲಗೈಗೆ ಕಟ್ಟಿಕೊಳ್ಳಿ.",
        actionCueEn: "Worship each of the 9 knots on the sacred turmeric thread with holy names and tie to right wrist.",
        icon: "🎗️",
        mantraSanskrit: `कमलायै नमः प्रथमे ग्रन्थौ पूजयामि।
रमायै नमः द्वितीये ग्रन्थौ पूजयामि।
लोकमात्रे नमः तृतीये ग्रन्थौ पूजयामि।
विश्वजनन्यै नमः चतुर्थे ग्रन्थौ पूजयामि।
महालक्ष्म्यै नमः पञ्चमे ग्रन्थौ पूजयामि।
क्षीराब्धितनयायै नमः षष्ठे ग्रन्थौ पूजयामि।
विश्वसाक्षिण्यै नमः सप्तमे ग्रन्थौ पूजयामि।
चन्द्रसोदर्यै नमः अष्टमे ग्रन्थौ पूजयामि।
श्रीवरमहालक्ष्म्यै नमः नवमे ग्रन्थौ पूजयामि॥
इदं दोरकं शुभ्रं मङ्गलं पापनाशनम्।
धारणात् सर्वकार्याणि सिद्ध्यन्ति वरदायिनि॥`,
        mantraL5: {
          kn: `ಕಮಲಾಯೈ ನಮಃ ಪ್ರಥಮೇ ಗ್ರಂಥೌ ಪೂಜಯಾಮಿ।
ರಮಾಯೈ ನಮಃ ದ್ವಿತೀಯೇ ಗ್ರಂಥೌ ಪೂಜಯಾಮಿ।
ಲೋಕಮಾತ್ರೇ ನಮಃ ತೃತೀಯೇ ಗ್ರಂಥೌ ಪೂಜಯಾಮಿ।
ವಿಶ್ವಜನನ್ಯೈ ನಮಃ ಚತುರ್ಥೇ ಗ್ರಂಥೌ ಪೂಜಯಾಮಿ।
ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ ಪಂಚಮೇ ಗ್ರಂಥೌ ಪೂಜಯಾಮಿ।
ಕ್ಷೀರಾಬ್ಧಿತನಯಾಯೈ ನಮಃ ಷಷ್ಠೇ ಗ್ರಂಥೌ ಪೂಜಯಾಮಿ।
ವಿಶ್ವಸಾಕ್ಷಿಣ್ಯೈ ನಮಃ ಸಪ್ತಮೇ ಗ್ರಂಥೌ ಪೂಜಯಾಮಿ।
ಚಂದ್ರಸೋದರ್ಯೈ ನಮಃ ಅಷ್ಟಮೇ ಗ್ರಂಥೌ ಪೂಜಯಾಮಿ।
ಶ್ರೀವರಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ ನವಮೇ ಗ್ರಂಥೌ ಪೂಜಯಾಮಿ॥
ಇದಂ ದೋರಕಂ ಶುಭ್ರಂ ಮಂಗಳಂ ಪಾಪನಾಶನಮ್।
ಧಾರಣಾತ್ ಸರ್ವಕಾರ್ಯಾಣಿ ಸಿದ್ಧ್ಯಂತಿ ವರದಾಯಿನಿ॥`,
          en: `Kamalaayai Namah Prathame Granthau Poojayaami |
Ramaayai Namah Dwiteeye Granthau Poojayaami |
Lokamaatre Namah Triteeye Granthau Poojayaami |
Mahaalakshmyai Namah Panchame Granthau Poojayaami |
Shri Varamahaalakshmyai Namah Navame Granthau Poojayaami ||
Idam Dorakam Shubhraam Mangalam Paapanaashanam |
Dhaaranaat Sarvakaaryaani Siddhyanti Varadaayini ||`,
          hi: `कमलायै नमः - प्रथमे ग्रन्थौ पूजयामि।
रमायै नमः - द्वितीये ग्रन्थौ पूजयामि।
महालक्ष्म्यै नमः - पञ्चमे ग्रन्थौ पूजयामि।
श्रीवरमहालक्ष्म्यै नमः - नवमे ग्रन्थौ पूजयामि॥
इदं दोरकं शुभ्रं मङ्गलं पापनाशनम्।`,
          te: `కమలాయై నమః - ప్రథమే గ్రంథౌ పూజయామి।
రమాయై నమః - ద్వితీయే గ్రంథౌ పూజయామి।
మహాలక్ష్మ్యై నమః - పంచమే గ్రంథౌ పూజయామి।
శ్రీవరమహాలక్ష్మ్యై నమః - నవమే గ్రంథౌ పూజయామి॥`,
          ta: `கமலாயை நம꞉ - ப்ரத²மே க்³ரந்தௌ² பூஜயாமி।
ரமாயை நம꞉ - த்³விதீயே க்³ரந்தௌ² பூஜயாமி।
மஹாலக்ஷ்ம்யை நம꞉ - பஞ்சமே க்³ரந்தௌ² பூஜயாமி।
ஸ்ரீவரமஹாலக்ஷ்ம்யை நம꞉ - நவமே க்³ரந்தௌ² பூஜயாமி॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತದ ಪರಮ ಪವಿತ್ರವಾದ ಒಂಬತ್ತು ಗಂಟುಗಳ ದೋರವನ್ನು ಪೂಜಿಸಿ.",
            mid: "ಪ್ರತಿ ಗಂಟಿಗೂ ಕುಂಕುಮ-ಹೂವನ್ನು ಅರ್ಪಿಸಿ, ನಂತರ ಬಲಗೈಗೆ ಕಟ್ಟಿಕೊಳ್ಳಿ.",
            outro: "ಈ ದೋರಧಾರಣೆಯಿಂದ ಅಖಂಡ ಸೌಭಾಗ್ಯ ಲಭಿಸುತ್ತದೆ."
          },
          en: {
            intro: "Worship the nine sacred knots on the holy yellow Dora thread.",
            mid: "With each knot, offer kumkuma and fragrant flowers, then tie to right wrist.",
            outro: "This sacred thread protects marital bliss and invites everlasting wealth."
          },
          hi: {
            intro: "नौ गांठों वाले पवित्र डोरक की पूजा करें।",
            mid: "प्रत्येक ग्रंथि पर कुंकुम चढ़ाकर दाहिनी कलाई पर बांधें।",
            outro: "यह अखंड सौभाग्य प्रदायक है।"
          },
          te: {
            intro: "తొమ్మిది ముడుల నోము దారాన్ని పూజించండి.",
            mid: "కుడి చేతికి కట్టుకోండి.",
            outro: "సౌభాగ్యం లభిస్తుంది."
          },
          ta: {
            intro: "ஒன்பது முடிச்சுகள் கொண்ட நோன்பு கயிற்றை பூஜியுங்கள்.",
            mid: "வலது கையில் கட்டிக்கொள்ளுங்கள்.",
            outro: "மங்கல வாழ்வு கிட்டும்."
          }
        },
        hiddenPriestInstructionKn: "ದೋರವನ್ನು ಕಟ್ಟಿಕೊಳ್ಳುವಾಗ ಪತಿಯಿಂದ ಅಥವಾ ಹಿರಿಯ ಸುಮಂಗಲಿಯರಿಂದ ಕಟ್ಟಿಸಿಕೊಳ್ಳುವುದು ಶ್ರೇಷ್ಠ.",
        hiddenPriestInstructionEn: "Tie thread through husband or senior married woman.",
        approxSeconds: 50,
        visualEffect: "namaskara"
      },
      {
        step: 3,
        titleKn: "ಮಂಗಳಾರತಿ & ಸುಮಂಗಲಿ ಬಾಗಿನ ದಾನ",
        titleEn: "Maha Arathi & Baagina Danam",
        actionCueKn: "ಕರ್ಪೂರದ ಮಂಗಳಾರತಿ ಬೆಳಗಿಸಿ, ಮುತ್ತೈದೆಯರಿಗೆ ಅರಿಶಿನ-ಕುಂಕುಮ ನೀಡಿ ಸೌಭಾಗ್ಯ ಬಾಗಿನ ಸಮರ್ಪಿಸಿ.",
        actionCueEn: "Offer camphor Arathi, apply turmeric-kumkum to Sumangalis, and present Baagina moras.",
        icon: "🔥",
        mantraSanskrit: `भाग्यद लक्ष्मी बारम्मा नम्मम्म नी सौभाग्यवाद॥
कनकधारास्तु मे गेहे धनधान्यसमृद्धिदा।
ॐ महालक्ष्म्यै च विद्महे विष्णुपत्नी च धीमहि।
तन्नो लक्ष्मीः प्रचोदयात्॥
इदं भाग्यं प्रदास्यामि गृहाण वरदे शुभे।
सुवासिनीभ्यो नमः, पादारविन्दाय नमो नमः॥`,
        mantraL5: {
          kn: `ಭಾಗ್ಯದ ಲಕ್ಷ್ಮೀ ಬಾರಮ್ಮಾ ನಮ್ಮಮ್ಮ ನೀ ಸೌಭಾಗ್ಯವಾದ॥
ಕನಕಧಾರಾಸ್ತು ಮೇ ಗೇಹೇ ಧನಧಾನ್ಯಸಮೃದ್ಧಿದಾ।
ಓಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ಚ ವಿದ್ಮಹೇ ವಿಷ್ಣುಪತ್ನೀ ಚ ಧೀಮಹಿ।
ತನ್ನೋ ಲಕ್ಷ್ಮೀಃ ಪ್ರಚೋದಯಾತ್॥
ಇದಂ ಭಾಗ್ಯಂ ಪ್ರದಾಸ್ಯಾಮಿ ಗೃಹಾಣ ವರದೇ ಶುಭೇ।
ಸುವಾಸಿನೀಭ್ಯೋ ನಮಃ, ಪಾದಾರವಿಂದಾಯ ನಮೋ ನಮಃ॥`,
          en: `Bhaagyada Lakshmi Baarammaa Nammamma Nee Soubhaagyavaada ||
Kanakadhaaraastu Me Gehe Dhanadhaanya Samriddhidaa |
Om Mahaalakshmyai Cha Vidmahe Vishnupatnee Cha Dheemahi |
Tanno Lakshmeeh Prachodayaat ||
Suvaasineebhyo Namah, Paadaaravindaaya Namo Namah ||`,
          hi: `भाग्यद लक्ष्मी बारम्मा।
ॐ महालक्ष्म्यै च विद्महे विष्णुपत्नी च धीमहि।
तन्नो लक्ष्मीः प्रचोदयात्॥
सुवासिनीभ्यो नमः।`,
          te: `భాగ్యద లక్ష్మీ బారమ్మా।
ఓం మహాలక్ష్మ్యై చ విద్మహే విష్ణుపత్నీ చ ధీమహి।
తన్నో లక్ష్మీః ప్రచోదయాత్॥`,
          ta: `பா⁴க்³யத³ லக்ஷ்மீ பாரம்மா।
ஓம் மஹாலக்ஷ்ம்யை ச வித்³மஹே விஷ்ணுபத்நீ ச தீ⁴மஹி।
தந்நோ லக்ஷ்மீ꞉ ப்ரசோத³யாத்॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಲಕ್ಷ್ಮಿ ದೇವಿಗೆ ಭಕ್ತಿಭಾವದಿಂದ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ.",
            mid: "ತಯಾರಿಸಿಟ್ಟ ಮಂಗಳ ಬಾಗಿನವನ್ನು ಸುಮಂಗಲಿಯರಿಗೆ ನೀಡಿ ಅವರ ಪಾದಗಳಿಗೆ ನಮಸ್ಕರಿಸಿ ಆಶೀರ್ವಾದ ಪಡೆಯಿರಿ.",
            outro: "ನಿಮ್ಮ ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತವು ಸಂಪೂರ್ಣವಾಯಿತು. ಮನೆಯಲ್ಲಿ ಸದಾ ಸೌಭಾಗ್ಯ ನೆಲೆಸಲಿ!"
          },
          en: {
            intro: "Wave the golden camphor flame before Goddess Lakshmi.",
            mid: "Present the auspicious Baagina to married women and bow before their feet.",
            outro: "Your Varamahalakshmi Vrata is completed. May fortune blossom forever in your home!"
          },
          hi: {
            intro: "महालक्ष्मी की भव्य आरती करें।",
            mid: "सुहागिनों को बायना भेंट कर चरण स्पर्श करें।",
            outro: "वरमहालक्ष्मी व्रत संपन्न हुआ। मां की कृपा सदा रहे।"
          },
          te: {
            intro: "లక్ష్మీదేవికి హారతి ఇవ్వండి.",
            mid: "వాయనం సమర్పించి ఆశీస్సులు పొందండి.",
            outro: "వ్రతం ఫలించింది. అష్టైశ్వర్యాలు సిద్ధిస్తాయి."
          },
          ta: {
            intro: "வரமகாலக்ஷ்மிக்கு ஆரத்தி எடுங்கள்.",
            mid: "சுமங்கலிகளுக்கு பாகினம் கொடுத்து ஆசி பெறுங்கள்.",
            outro: "விரதம் இனிதே நிறைவுற்றது. நல்வாழ்வு மலரட்டும்."
          }
        },
        hiddenPriestInstructionKn: "ಬಾಗಿನ ಸ್ವೀಕರಿಸುವ ಸುಮಂಗಲಿಯನ್ನು ಸಾಕ್ಷಾತ್ ಮಹಾಲಕ್ಷ್ಮಿ ಎಂದೇ ಭಾವಿಸಿ ನಮಸ್ಕರಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Revere the recipient of Baagina as the living presence of Goddess Lakshmi.",
        approxSeconds: 60,
        visualEffect: "arathi"
      }
    ]
  },

  // =========================================================================
  // VRATA 4: ಶ್ರೀ ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ಗಣಪತಿ ವ್ರತ
  // Crisis resolution, debt relief, court/career hurdles
  // =========================================================================
  sankashtahara_vrata: {
    key: "sankashtahara_vrata",
    titleKn: "ಶ್ರೀ ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ಗಣಪತಿ ವ್ರತ ಮಹಾವಿಧಿ",
    titleEn: "Sri Sankashtahara Chaturthi Ganapati Vrata",
    subtitleKn: "ಕಠಿಣ ಸಂಕಟ ನಿವಾರಣೆ, ಸಾಲಬಾಧೆ ಮುಕ್ತಿ & ಚಂದ್ರೋದಯ ಕಾಲದ ಅರ್ಘ್ಯ ಪ್ರದಾನ",
    subtitleEn: "Sacred Sankashti Vrata for Crushing Obstacles, Debt Relief & Moonrise Arghya",
    icon: "🐘",
    badgeTextKn: "ಸಂಕಟ ನಿವಾರಕ ವ್ರತ",
    badgeTextEn: "Crisis Dissolution Vrata",
    colorScheme: {
      primary: "#EA580C",
      border: "#FB923C",
      badgeBg: "#FFF7ED",
      gradient: "from-orange-600 via-amber-500 to-red-500"
    },
    purposeKn: "ಜೀವನದಲ್ಲಿ ಎದುರಾಗುವ ಅತಿದೊಡ್ಡ ವಿಪತ್ತುಗಳು, ಕೋರ್ಟ್-ಕಛೇರಿ ವ್ಯಾಜ್ಯಗಳು, ತೀವ್ರ ಸಾಲಬಾಧೆ ಹಾಗೂ ದೀರ್ಘಕಾಲದ ತಡೆಗಳನ್ನು ನಿವಾರಿಸಲು ಆಚರಿಸುವ ಶಕ್ತಿಶಾಲಿ ಗಣಪತಿ ವ್ರತ.",
    purposeEn: "Performed on Krishna Paksha Chaturthi of every lunar month to overcome seemingly insurmountable crises, litigations, debts, and deep-seated personal distress.",
    benefitsKn: "೧. ಎಲ್ಲಾ ಬಗೆಯ ಸಂಕಟಗಳೂ ನಾಶವಾಗುತ್ತವೆ. ೨. ಆರ್ಥಿಕ ಸಾಲಗಳಿಂದ ತ್ವರಿತ ಮುಕ್ತಿ. ೩. ಕೈಗೆತ್ತಿಕೊಂಡ ಕೆಲಸಗಳಲ್ಲಿ ಜಯ. ೪. ಮಾನಸಿಕ ಶಾಂತಿ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸ ವೃದ್ಧಿ.",
    benefitsEn: "1. Total eradication of severe adversities. 2. Liberation from heavy debts and loans. 3. Victory in delayed legal or professional matters. 4. Unshakable peace of mind.",
    idealForKn: "ಸಾಲದ ಸುಳಿಯಲ್ಲಿ ಸಿಲುಕಿದವರು, ಕಠಿಣ ಸಂಕಷ್ಟ ಎದುರಿಸುತ್ತಿರುವವರು, ವಿಪತ್ತು ಮುಕ್ತಿ ಬಯಸುವವರು.",
    idealForEn: "Devotees burdened with debts, facing critical roadblocks, and seeking swift spiritual relief.",
    timingKn: "ಪ್ರತಿ ತಿಂಗಳ ಕೃಷ್ಣ ಪಕ್ಷದ ಚತುರ್ಥಿ ತಿಥಿ. ದಿನವಿಡೀ ಉಪವಾಸವಿದ್ದು, ರಾತ್ರಿ ಚಂದ್ರೋದಯದ ವೇಳೆಯಲ್ಲಿ ಪೂಜೆ ಮತ್ತು ಚಂದ್ರಾರ್ಘ್ಯ ನೀಡುವುದು ವಿಧಿ.",
    timingEn: "Krishna Paksha Chaturthi every month. Fasting through day, worshipping and offering Arghya at Moonrise.",
    samagriList: [
      {
        id: "ganapati_murti",
        itemKn: "ಶ್ರೀ ಗಣೇಶ ಮೂರ್ತಿ ಅಥವಾ ಪಟ",
        itemEn: "Lord Ganesha Idol or Image",
        quantityKn: "೧",
        quantityEn: "1",
        importance: "mandatory"
      },
      {
        id: "durva_grass",
        itemKn: "೨೧ ಗರಿಕೆ ಹುಲ್ಲು (ದೂರ್ವಾ)",
        itemEn: "21 sacred Durva grass blades",
        quantityKn: "೨೧ ಗರಿಕೆ",
        quantityEn: "21 blades",
        importance: "mandatory",
        notesKn: "ಸಂಕಷ್ಟಹರ ಪೂಜೆಗೆ ಗರಿಕೆ ಅತ್ಯಂತ ಮುಖ್ಯ."
      },
      {
        id: "modaka",
        itemKn: "೨೧ ಮೋದಕ ಅಥವಾ ಲಡ್ಡು ನೈವೇದ್ಯ",
        itemEn: "21 sweet Modakas or Laddus",
        quantityKn: "೨೧",
        quantityEn: "21 units",
        importance: "mandatory"
      },
      {
        id: "chandra_arghya_milk",
        itemKn: "ಚಂದ್ರಾರ್ಘ್ಯಕ್ಕೆ ಹಸುವಿನ ಹಾಲು, ಶಂಖ, ಅಕ್ಷತೆ & ನೀರು",
        itemEn: "Cow milk, Shankha, Akshata for Moon Arghya",
        quantityKn: "೧ ಲೋಟ ಹಾಲು",
        quantityEn: "1 cup milk",
        importance: "mandatory"
      },
      {
        id: "red_flowers",
        itemKn: "ಕೆಂಪು ದಾಸವಾಳ ಅಥವಾ ಕೆಂಪು ಹೂವುಗಳು",
        itemEn: "Red Hibiscus or red flowers",
        quantityKn: "೨೧ ಹೂವುಗಳು",
        quantityEn: "21 flowers",
        importance: "mandatory"
      }
    ],
    steps: [
      {
        step: 1,
        titleKn: "ಸಂಕಷ್ಟನಾಶನ ಗಣೇಶ ಸ್ತೋತ್ರ ಪಠಣ",
        titleEn: "Sankata Nashana Stotra Recitation",
        actionCueKn: "ಗಣೇಶನ ಮುಂದೆ ಕೈಮುಗಿದು ನಾರದ ಪುರಾಣೋಕ್ತ ಸಂಕಷ್ಟನಾಶನ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸಿ.",
        actionCueEn: "Fold hands before Lord Ganesha and recite the famous Sankata Nashana Stotra.",
        icon: "🐘",
        mantraSanskrit: `प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम्।
भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये॥
प्रथमं वक्रतुण्डं च एकदन्तं द्वितीयकम्।
तृतीयं कृष्णपिङ्गाक्षं गजवक्त्रं चतुर्थकम्॥
लम्बोदरं पञ्चमं च षष्ठं विकटमेव च।
सप्तमं विघ्नराजेन्द्रं धूम्रवर्णं तथाष्टमम्॥
नवमं भालचन्द्रं च दशमं तु विनायकम्।
एकादशं गणपतिं द्वादशं तु गजाननम्॥
द्वादशैतानि नामानि त्रिसन्ध्यं यः पठेन्नरः।
न च विघ्नभयं तस्य सर्वसिद्धिकरं परम्॥`,
        mantraL5: {
          kn: `ಪ್ರಣಮ್ಯ ಶಿರಸಾ ದೇವಂ ಗೌರೀಪುತ್ರಂ ವಿನಾಯಕಮ್।
ಭಕ್ತಾವಾಸಂ ಸ್ಮರೇನ್ನಿತ್ಯಮಾಯುಃಕಾಮಾರ್ಥಸಿದ್ಧಯೇ॥
ಪ್ರಥಮಂ ವಕ್ರತುಂಡಂ ಚ ಏಕದಂತಂ ದ್ವಿತೀಯಕಮ್।
ತೃತೀಯಂ ಕೃಷ್ಣಪಿಂಗಾಕ್ಷಂ ಗಜವಕ್ತ್ರಂ ಚತುರ್ಥಕಮ್॥
ಲಂಬೋದರಂ ಪಂಚಮಂ ಚ ಷಷ್ಠಂ ವಿಕಟಮೇವ ಚ।
ಸಪ್ತಮಂ ವಿಘ್ನರಾಜೇಂದ್ರಂ ಧೂಮ್ರವರ್ಣಂ ತಥಾಷ್ಟಮಮ್॥
ನವಮಂ ಭಾಲಚಂದ್ರಂ ಚ ದಶಮಂ ತು ವಿನಾಯಕಮ್।
ಏಕಾದಶಂ ಗಣಪತಿಂ ದ್ವಾದಶಂ ತು ಗಜಾನನಮ್॥
ದ್ವಾದಶೈತಾನಿ ನಾಮಾನಿ ತ್ರಿಸಂಧ್ಯಾಂ ಯಃ ಪಠೇನ್ನರಃ।
ನ ಚ ವಿಘ್ನಭಯಂ ತಸ್ಯ ಸರ್ವಸಿದ್ಧಿಕರಂ ಪರಮ್॥`,
          en: `Pranamya Shirasaa Devam Gauriputram Vinaayakam |
Bhaktaavaasam Smaren Nityam Aayuhkaamaartha Siddhaye ||
Prathamam Vakratundam Cha Ekadantam Dwiteeyakam |
Triteeyam Krishnapingaaksham Gajavaktram Chaturthakam ||
Dvadasaitaani Naamaani Trisandhyam Yah Pathen Narah |
Na Cha Vighnabhayam Tasya Sarvasiddhikaram Param ||`,
          hi: `प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम्।
द्वादशैतानि नामानि त्रिसन्ध्यं यः पठेन्नरः।
न च विघ्नभयं तस्य सर्वसिद्धिकरं परम्॥`,
          te: `ప్రణమ్య శిరసా దేవం గౌరీపుత్రం వినాయకమ్।
ద్వాదశైతాని నామాని త్రిసంధ్యం యః పఠేన్నరః।
న చ విఘ్నభయం తస్య సర్వసిద్ధికరం పరమ్॥`,
          ta: `ப்ரணம்ய ஶிரஸா தே³வம்ʼ கௌ³ரீபுத்ரம்ʼ விநாயகम्।
த்³வாத³ஶைதானி நாமானி த்ரிஸந்த்⁴யம்ʼ ய꞉ படே²ந்நர꞉।
ந ச விக்⁴நப⁴யம்ʼ தஸ்ய ஸர்வஸித்³தி⁴கரம்ʼ பரம்॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಗೌರೀಪುತ್ರನಾದ ವಿನಾಯಕನನ್ನು ಶಿರಬಾಗಿ ನಮಸ್ಕರಿಸಿ ೧೨ ದಿವ್ಯ ನಾಮಗಳನ್ನು ಪಠಿಸಿ.",
            mid: "ಕೆಂಪು ಹೂವುಗಳನ್ನು ಗಣಪತಿಯ ಪಾದಗಳಿಗೆ ಅರ್ಪಿಸಿ.",
            outro: "ಈ ಸ್ತೋತ್ರದ ಪ್ರಭಾವದಿಂದ ಸಕಲ ವಿಘ್ನಭಯವೂ ನಷ್ಟವಾಗುತ್ತದೆ."
          },
          en: {
            intro: "Bow your head to Lord Vighneshwara and chant His twelve liberating names.",
            mid: "Offer red flowers at Ganesha's holy feet.",
            outro: "All fears and obstacles melt away before His glory."
          },
          hi: {
            intro: "गौरीपुत्र गणेश के बारह नामों का संकटनाशन स्तोत्र पाठ करें।",
            mid: "लाल फूल अर्पित करें।",
            outro: "समस्त संकटों का निवारण होता है।"
          },
          te: {
            intro: "సంకటనాశన స్తోత్రం పఠించండి.",
            mid: "పుష్పాలు సమర్పించండి.",
            outro: "విఘ్నాలు నశిస్తాయి."
          },
          ta: {
            intro: "சங்கட நாசன ஸ்தோத்திரம் சொல்லுங்கள்.",
            mid: "மலர் இடுங்கள்.",
            outro: "சங்கடங்கள் தீரும்."
          }
        },
        hiddenPriestInstructionKn: "ಸಂಕಷ್ಟಹರ ಸ್ತೋತ್ರವನ್ನು ದಿನಕ್ಕೆ ಮೂರು ಬಾರಿ ಪಠಿಸಿದರೆ ಸಕಲ ಸಿದ್ಧಿಯೂ ಲಭಿಸುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Reciting thrice daily removes all perils.",
        approxSeconds: 60,
        visualEffect: "bell"
      },
      {
        step: 2,
        titleKn: "೨೧ ಗರಿಕೆ (ದೂರ್ವಾ) ಸಮರ್ಪಣೆ",
        titleEn: "Offering 21 Sacred Durva Grass Blades",
        actionCueKn: "ಗಣೇಶನಿಗೆ ೨೧ ಗರಿಕೆ ಹುಲ್ಲನ್ನು ಜೋಡಿಯಾಗಿ ಒಂದೊಂದಾಗಿ ಮಂತ್ರ ಹೇಳುತ್ತಾ ಅರ್ಪಿಸಿ.",
        actionCueEn: "Offer 21 Durva blades in pairs to Lord Ganesha with reverence.",
        icon: "🌿",
        mantraSanskrit: `ॐ गणाधिपाय नमः - दूर्वायुग्मं समर्पयामि।
ॐ उमापुत्राय नमः - दूर्वायुग्मं समर्पयामि।
ॐ विघ्ननाशनाय नमः - दूर्वायुग्मं समर्पयामि।
ॐ विनायकाय नमः - दूर्वायुग्मं समर्पयामि।
ॐ ईशपुत्राय नमः - दूर्वायुग्मं समर्पयामि।
ॐ सर्वसिद्धिप्रदाय नमः - दूर्वायुग्मं समर्पयामि।
ॐ एकदन्ताय नमः - दूर्वायुग्मं समर्पयामि।
ॐ इभवक्त्राय नमः - दूर्वायुग्मं समर्पयामि।
ॐ मूषकवाहनाय नमः - दूर्वायुग्मं समर्पयामि।
ॐ कुमारगुरवे नमः - दूर्वायुग्मं समर्पयामि।
ॐ श्री महागणपतये नमः - एकविंशति दूर्वादलानि समर्पयामि॥`,
        mantraL5: {
          kn: `ಓಂ ಗಣಾಧಿಪಾಯ ನಮಃ - ದೂರ್ವಾಯುಗ್ಮಂ ಸಮರ್ಪಯಾಮಿ।
ಓಂ ಉಮಾಪುತ್ರಾಯ ನಮಃ - ದೂರ್ವಾಯುಗ್ಮಂ ಸಮರ್ಪಯಾಮಿ।
ಓಂ ವಿಘ್ನನಾಶನಾಯ ನಮಃ - ದೂರ್ವಾಯುಗ್ಮಂ ಸಮರ್ಪಯಾಮಿ।
ಓಂ ವಿನಾಯಕಾಯ ನಮಃ - ದೂರ್ವಾಯುಗ್ಮಂ ಸಮರ್ಪಯಾಮಿ।
ಓಂ ಈಶಪುತ್ರಾಯ ನಮಃ - ದೂರ್ವಾಯುಗ್ಮಂ ಸಮರ್ಪಯಾಮಿ।
ಓಂ ಸರ್ವಸಿದ್ಧಿಪ್ರದಾಯ ನಮಃ - ದೂರ್ವಾಯುಗ್ಮಂ ಸಮರ್ಪಯಾಮಿ।
ಓಂ ಏಕದಂತಾಯ ನಮಃ - ದೂರ್ವಾಯುಗ್ಮಂ ಸಮರ್ಪಯಾಮಿ।
ಓಂ ಇಭವಕ್ತ್ರಾಯ ನಮಃ - ದೂರ್ವಾಯುಗ್ಮಂ ಸಮರ್ಪಯಾಮಿ।
ಓಂ ಮೂಷಕವಾಹನಾಯ ನಮಃ - ದೂರ್ವಾಯುಗ್ಮಂ ಸಮರ್ಪಯಾಮಿ।
ಓಂ ಕುಮಾರಗುರವೇ ನಮಃ - ದೂರ್ವಾಯುಗ್ಮಂ ಸಮರ್ಪಯಾಮಿ।
ಓಂ ಶ್ರೀ ಮಹಾಗಣಪತಯೇ ನಮಃ - ಏಕವಿಂಶತಿ ದೂರ್ವಾದಲಾನಿ ಸಮರ್ಪಯಾಮಿ॥`,
          en: `Om Ganaadhipaaya Namah - Doorvaayugmam Samarpayaami |
Om Umaaputraaya Namah - Doorvaayugmam Samarpayaami |
Om Vighnanaashanaaya Namah - Doorvaayugmam Samarpayaami |
Om Vinaayakaaya Namah - Doorvaayugmam Samarpayaami |
Om Sarvasiddhipradaaya Namah - Doorvaayugmam Samarpayaami |
Om Shri Mahaaganapataye Namah - Ekavimshati Doorvaadalaani Samarpayaami ||`,
          hi: `ॐ गणाधिपाय नमः - दूर्वा समर्पयामि।
ॐ विघ्ननाशनाय नमः - दूर्वा समर्पयामि।
ॐ श्री महागणपतये नमः - एकविंशति दूर्वादलानि समर्पयामि॥`,
          te: `ఓం గణాధిపాయ నమః - దూర్వా సమర్పయామి।
ఓం విఘ్ననాశనాయ నమః - దూర్వా సమర్పయామి।
ఓం శ్రీ మహాగణపతయే నమః॥`,
          ta: `ஓம் க³ணாதி⁴பாய நம꞉ - தூ³ர்வா ஸமர்பயாமி।
ஓம் விக்⁴நநாஶநாய நம꞉ - தூ³ர்வா ஸமர்பயாமி।
ஓம் ஸ்ரீ மஹாக³ணபதயே நம꞉॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಗಣೇಶನಿಗೆ ೨೧ ಗರಿಕೆಯನ್ನು ಭಕ್ತಿಯಿಂದ ಅರ್ಪಿಸಿ. ಅನಲಾಸುರನ ತಾಪವನ್ನು ತಣಿಸಿದ ಅಮೃತಮಯ ಗರಿಕೆ ಗಣೇಶನಿಗೆ ಪರಮ ಪ್ರಿಯ.",
            mid: "ಪ್ರತಿ ನಾಮಕ್ಕೂ ಜೋಡಿ ಗರಿಕೆಯನ್ನು ಗಣೇಶನ ತಲೆಯ ಮೇಲೆ ಅಥವಾ ಪಾದಗಳಲ್ಲಿರಿಸಿ.",
            outro: "ನಿಮ್ಮ ಸಮಸ್ತ ಸಂಕಟಗಳೂ ಗರಿಕೆಯ ಸ್ಪರ್ಶದಿಂದ ಶಾಂತವಾಗುತ್ತವೆ."
          },
          en: {
            intro: "Offer 21 paired blades of sacred Durva grass to Lord Ganesha.",
            mid: "With each sacred name, place a pair of green blades gently on the deity.",
            outro: "The cooling nectar of Durva extinguishes all fires of hardship."
          },
          hi: {
            intro: "गणेश जी को २१ दूर्वा दल अर्पित करें।",
            mid: "प्रत्येक नाम के साथ दूर्वा चढ़ाएं।",
            outro: "समस्त ताप और बाधाएं शांत होती हैं।"
          },
          te: {
            intro: "ఇరవై ఒక్క గరికలను విఘ్నేశ్వరునికి సమర్పించండి.",
            mid: "భక్తితో నామాలు జపించండి.",
            outro: "కష్టాలన్నీ తీరిపోతాయి."
          },
          ta: {
            intro: "21 அருகம்புல் இலைகளை விநாயகருக்கு சமர்ப்பியுங்கள்.",
            mid: "அருகம்புல்லை சிரசில் வையுங்கள்.",
            outro: "சகல துன்பங்களும் தணியும்."
          }
        },
        hiddenPriestInstructionKn: "ಗರಿಕೆಯ ತುದಿಗಳು ಹಸಿರಾಗಿರಬೇಕು, ಕತ್ತರಿಸಿದ ಅಥವಾ ಒಣಗಿದ ಗರಿಕೆ ಬಳಸಬಾರದು.",
        hiddenPriestInstructionEn: "Use fresh, unbroken green Durva tips.",
        approxSeconds: 50,
        visualEffect: "tulasi"
      },
      {
        step: 3,
        titleKn: "ಚಂದ್ರೋದಯ ಕಾಲದ ಪವಿತ್ರ ಚಂದ್ರಾರ್ಘ್ಯ ಪ್ರದಾನ",
        titleEn: "Moonrise Consecration & Arghya Offering",
        actionCueKn: "ಚಂದ್ರೋದಯವಾದಾಗ ಶಂಖದಲ್ಲಿ ಅಥವಾ ತಾಮ್ರ ಪಾತ್ರೆಯಲ್ಲಿ ಹಾಲು, ನೀರು, ಅಕ್ಷತೆ ಬೆರೆಸಿ ಚಂದ್ರನಿಗೆ ಮತ್ತು ಗಣೇಶನಿಗೆ ಅರ್ಘ್ಯ ಬಿಡಿ.",
        actionCueEn: "At moonrise, pour milk, water, and flowers from a conch towards the Moon and Lord Ganesha.",
        icon: "🌙",
        mantraSanskrit: `क्षीरोदार्णव सम्भूत अत्रिनेत्र समुद्भव।
गृहाणार्घ्यं शशाङ्केश रोहिण्या सहितो मम॥
ॐ सोमाय नमः, इदमर्घ्यं समर्पयामि।
गजाननाय विद्महे वक्रतुण्डाय धीमहि।
तन्नो दन्तिः प्रचोदयात्॥
अनेन अर्घ्यप्रदानेन भगवान् श्री वरदविनायकः
सुप्रीतो वरदो भवतु॥`,
        mantraL5: {
          kn: `ಕ್ಷೀರೋದಾರ್ಣವ ಸಂಭೂತ ಅತ್ರಿನೇತ್ರ ಸಮುದ್ಭವ।
ಗೃಹಾಣಾರ್ಘ್ಯಂ ಶಶಾಂಕೇಶ ರೋಹಿಣ್ಯಾ ಸಹಿತೋ ಮಮ॥
ಓಂ ಸೋಮಾಯ ನಮಃ, ಇದಮರ್ಘ್ಯಂ ಸಮರ್ಪಯಾಮಿ।
ಗಜಾನನಾಯ ವಿದ್ಮಹೇ ವಕ್ರತುಂಡಾಯ ಧೀಮಹಿ।
ತನ್ನೋ ದಂತಿಃ ಪ್ರಚೋದಯಾತ್॥
ಅನೇನ ಅರ್ಘ್ಯಪ್ರದಾನೇನ ಭಗವಾನ್ ಶ್ರೀ ವರದವಿನಾಯಕಃ
ಸುಪ್ರೀತೋ ವರದೋ ಭವತು॥`,
          en: `Ksheerodaarnava Sambhoota Atrinetra Samudbhava |
Grihaanarghyam Shashaankesha Rohinyaa Sahito Mama ||
Om Somaaya Namah, Idamarghyam Samarpayaami |
Gajaananaaya Vidmahe Vakratundaaya Dheemahi |
Tanno Dantih Prachodayaat ||`,
          hi: `क्षीरोदार्णव सम्भूत अत्रिनेत्र समुद्भव।
गृहाणार्घ्यं शशाङ्केश रोहिण्या सहितो मम॥
ॐ सोमाय नमः, इदमर्घ्यं समर्पयामि।`,
          te: `క్షీరోదార్ణవ సంభూత అత్రినేత్ర సముద్భవ।
గృహాణార్ఘ్యం శశాంకేశ రోహిణ్యా సహితో మమ॥
ఓం సోమాయ నమః, ఇదమర్ఘ్యం సమర్పయామి।`,
          ta: `க்ஷீரோதா³ர்ணவ ஸம்பூ⁴த அத்ரிநேத்ர ஸமுத்³ப⁴வ।
க்³ருʼஹாணார்க්‍⁴யம்ʼ ஶஶாங்கRegion ரோஹிண்யா ஸஹிதோ மம॥
ஓம் ஸோமாய நம꞉, இத³மார்க්‍⁴யம்ʼ ஸமர்பயாமி॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿಯ ಅಂತಿಮ ಮತ್ತು ಪರಮ ಫಲದಾಯಕ ಘಟ್ಟ ಚಂದ್ರಾರ್ಘ್ಯ.",
            mid: "ಚಂದ್ರನನ್ನು ವೀಕ್ಷಿಸಿ, ಶಂಖದಲ್ಲಿ ಹಾಲನ್ನು ತುಂಬಿ ಧಾರೆಯಾಗಿ ಅರ್ಘ್ಯವನ್ನು ಬಿಡಿ.",
            outro: "ನಿಮ್ಮ ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ವ್ರತವು ಸಂಪೂರ್ಣವಾಯಿತು. ಶ್ರೀ ವರದ ಗಣಪತಿಯ ಕೃಪೆಯಿಂದ ಸಕಲ ಸಂಕಷ್ಟಗಳೂ ದೂರವಾಗಿ ಜಯ ಲಭಿಸಲಿ!"
          },
          en: {
            intro: "The crowning culmination of Sankashti is the Moonrise Arghya.",
            mid: "Looking towards the Moon, pour sacred milk and water through a conch onto a clean plate.",
            outro: "Your Sankashtahara Vrata is victoriously fulfilled! May Lord Varada Vinayaka dissolve every grief!"
          },
          hi: {
            intro: "संकष्टी चतुर्थी की पूर्णता चंद्रोदय के अर्घ्य से होती है।",
            mid: "शंख से दूध और जल का अर्घ्य चंद्रदेव और गणेश जी को दें।",
            outro: "व्रत पूर्ण हुआ। विघ्नहर्ता समस्त कष्टों का नाश करें।"
          },
          te: {
            intro: "చంద్రోదయ వేళ పాలు, నీళ్లతో శంఖం ద్వారా అర్ఘ్యం ఇవ్వండి.",
            mid: "చంద్రునికి నమస్కరించండి.",
            outro: "సంకటహర చతుర్థి వ్రతం సంపూర్ణమైంది."
          },
          ta: {
            intro: "சந்திரோதய வேளையில் பாலும் நீரும் சேர்த்து சந்திரனுக்கு அர்க்கியம் கொடுங்கள்.",
            mid: "விநாயகரை வணங்குங்கள்.",
            outro: "விரதம் இனிதே முடிந்தது. சங்கடங்கள் யாவும் பறந்தோடும்."
          }
        },
        hiddenPriestInstructionKn: "ಚಂದ್ರ ಕಾಣದಿದ್ದರೆ ಗಣೇಶನ ಮೂರ್ತಿಗೆ ಚಂದ್ರ ಭಾವನೆಯಿಂದ ಮೂರು ಬಾರಿ ಅರ್ಘ್ಯ ನೀಡಬಹುದು.",
        hiddenPriestInstructionEn: "If clouds obscure Moon, offer Arghya to Ganesha invoking Chandra.",
        approxSeconds: 60,
        visualEffect: "arghya"
      }
    ]
  },

  // =========================================================================
  // VRATA 5: ಶ್ರೀ ಸೋಮವಾರ ಶಿವ ವ್ರತ & ಮಹಾಮೃತ್ಯುಂಜಯ ಮಹಾವಿಧಿ
  // Health, recovery from illness, peace of mind, longevity
  // =========================================================================
  somavara_shiva_vrata: {
    key: "somavara_shiva_vrata",
    titleKn: "ಶ್ರೀ ಸೋಮವಾರ ಶಿವ ವ್ರತ & ಮಹಾಮೃತ್ಯುಂಜಯ ಮಹಾವಿಧಿ",
    titleEn: "Sri Somavara Shiva Vrata & Mahamrityunjaya",
    subtitleKn: "ಆರೋಗ್ಯ ವೃದ್ಧಿ, ದೀರ್ಘಕಾಲದ ರೋಗ ನಿವಾರಣೆ, ಆಯುಷ್ಯ ರಕ್ಷಣೆ & ಶಿವಾನುಗ್ರಹ",
    subtitleEn: "Sacred Somavara Shiva Vrata for Health, Longevity & Mahamrityunjaya Healing",
    icon: "🔱",
    badgeTextKn: "ಆರೋಗ್ಯ ರಕ್ಷಾ ವ್ರತ",
    badgeTextEn: "Healing & Longevity",
    colorScheme: {
      primary: "#0284C7",
      border: "#38BDF8",
      badgeBg: "#F0F9FF",
      gradient: "from-sky-600 via-cyan-500 to-indigo-600"
    },
    purposeKn: "ದೀರ್ಘಕಾಲಿಕ ಶಾರೀರಿಕ-ಮಾನಸಿಕ ರೋಗಗಳು, ಅಪಮೃತ್ಯು ಭೀತಿ, ಸರ್ಪದೋಷ ಮತ್ತು ಜಾತಕದ ಮಾರಕ ದೋಷಗಳನ್ನು ನಿವಾರಿಸಿ, ಉತ್ತಮ ಆರೋಗ್ಯ ಹಾಗೂ ಆಯುಷ್ಯವನ್ನು ಪಡೆಯಲು ಸೋಮವಾರದಂದು ಆಚರಿಸುವ ಶ್ರೇಷ್ಠ ಶಿವ ವ್ರತ.",
    purposeEn: "Dedicated to Lord Someshwara and Mahamrityunjaya on Mondays to alleviate chronic ailments, conquer physical and mental debility, and bestow vigorous health and longevity.",
    benefitsKn: "೧. ದೀರ್ಘಕಾಲಿಕ ರೋಗಗಳಿಂದ ಮುಕ್ತಿ. ೨. ಅಪಮೃತ್ಯು ಮತ್ತು ಅಕಾಲಮೃತ್ಯು ದೋಷ ನಿವಾರಣೆ. ೩. ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆ ಮತ್ತು ದೈಹಿಕ ಶಕ್ತಿ. ೪. ಸಕಲ ಪಾಪನಾಶ ಮತ್ತು ಪರಮ ಮುಕ್ತಿ.",
    benefitsEn: "1. Freedom from chronic illnesses and physical suffering. 2. Annihilation of untimely death (Apamrityu) dosha. 3. Deep mental tranquility and vitality. 4. Divine peace and spiritual liberation.",
    idealForKn: "ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಎದುರಿಸುತ್ತಿರುವವರು, ದೀರ್ಘಾಯುಷ್ಯ ಬಯಸುವವರು, ಮಾನಸಿಕ ಒತ್ತಡದಲ್ಲಿರುವವರು, ಶಿವಭಕ್ತರು.",
    idealForEn: "Anyone suffering from health conditions, wishing for vitality and long life, and seeking Lord Shiva's divine grace.",
    timingKn: "ಕಾರ್ತಿಕ ಅಥವಾ ಶ್ರಾವಣ ಸೋಮವಾರಗಳು, ಯಾವುದೇ ಮಾಸದ ಶುಕ್ಲ ಪಕ್ಷದ ಸೋಮವಾರ, ಪ್ರದೋಷ ಕಾಲ ಅಥವಾ ಪ್ರಾತಃಕಾಲ.",
    timingEn: "Mondays in Shravana or Kartika Masa, Shukla Paksha Mondays, during morning or Pradosha dusk.",
    samagriList: [
      {
        id: "shivalinga",
        itemKn: "ಶಿವಲಿಂಗ ಅಥವಾ ಪಟ",
        itemEn: "Shivalinga or Shiva Image",
        quantityKn: "೧",
        quantityEn: "1",
        importance: "mandatory"
      },
      {
        id: "bilva_patra",
        itemKn: "೧೦೮ ಬಿಲ್ವಪತ್ರೆಗಳು (ಅಖಂಡ ತ್ರಿಗುಣ ಬಿಲ್ವ)",
        itemEn: "108 fresh Bilva leaves",
        quantityKn: "೧೦೮ ಎಲೆಗಳು",
        quantityEn: "108 leaves",
        importance: "mandatory",
        notesKn: "ಬಿಲ್ವಪತ್ರೆಯು ಶಿವನಿಗೆ ಪರಮ ಪ್ರಿಯ."
      },
      {
        id: "bhasma_vibhuti",
        itemKn: "ಶುದ್ಧ ಭಸ್ಮ / ವಿಭೂತಿ & ಗಂಧ",
        itemEn: "Pure Bhasma/Vibhuti & Sandalwood",
        quantityKn: "ಸಾಕಷ್ಟು",
        quantityEn: "Adequate",
        importance: "mandatory"
      },
      {
        id: "panchamrita_ganga",
        itemKn: "ಪಂಚಾಮೃತ & ಶುದ್ಧ ಗಂಗಾಜಲ",
        itemEn: "Panchamrita & Holy Ganga water",
        quantityKn: "೧ ಪಾತ್ರೆ",
        quantityEn: "1 vessel",
        importance: "mandatory"
      },
      {
        id: "rudraksha",
        itemKn: "ರುದ್ರಾಕ್ಷಿ ಮಾಲೆ (ಜಪಕ್ಕೆ)",
        itemEn: "Rudraksha Rosary for Chanting",
        quantityKn: "೧ ಮಾಲೆ",
        quantityEn: "1 rosary",
        importance: "recommended"
      }
    ],
    steps: [
      {
        step: 1,
        titleKn: "ಭಸ್ಮ ಧಾರಣೆ & ಶಿವ ಧ್ಯಾನ",
        titleEn: "Bhasma Dharana & Lord Shiva Dhyana",
        actionCueKn: "ಹಣೆ, ಕಂಠ ಮತ್ತು ಭುಜಗಳಲ್ಲಿ ತ್ರಿಪುಂಡ್ರ ಭಸ್ಮವನ್ನು ಧರಿಸಿ, ಕೈಮುಗಿದು ಸದಾಶಿವನನ್ನು ಧ್ಯಾನಿಸಿ.",
        actionCueEn: "Apply Tripundra sacred ash across forehead, neck, and arms; meditate upon Sada Shiva.",
        icon: "🔱",
        mantraSanskrit: `ॐ त्र्यायुषं जमदग्नेः कश्यपस्य त्र्यायुषम्।
यद्देवेषु त्र्यायुषं तन्नो अस्तु त्र्यायुषम्॥
ध्यायेन्नित्यं महेशं रजतगिरिनिभं चारुचन्द्रावतंसं
रत्नाकल्पोज्ज्वलाङ्गं परशुमृगवराभीतिहस्तं प्रसन्नम्।
पद्मासीनं समन्तात् स्तुतममरगणैर्व्याघ्रकृत्तिं वसानं
विश्वाद्यं विश्वबीजं निखिलभयहरं पञ्चवक्त्रं त्रिनेत्रम्॥
ॐ नमः शिवाय। ध्यायामि, आवाहयामि॥`,
        mantraL5: {
          kn: `ಓಂ ತ್ರ್ಯಾಯುಷಂ ಜಮದಗ್ನೇಃ ಕಶ್ಯಪಸ್ಯ ತ್ರ್ಯಾಯುಷಮ್।
ಯದ್ದೇವೇಷು ತ್ರ್ಯಾಯುಷಂ ತನ್ನೋ ಅಸ್ತು ತ್ರ್ಯಾಯುಷಮ್॥
ಧ್ಯಾಯೇನ್ನಿತ್ಯಂ ಮಹೇಶಂ ರಜತಗಿರಿನಿಭಂ ಚಾರುಚಂದ್ರಾವತಂಸಂ
ರತ್ನಾಕಲ್ಪೋಜ್ಜ್ವಲಾಂಗಂ ಪರಶುಮೃಗವರಾಭೀತಿಹಸ್ತಂ ಪ್ರಸನ್ನಮ್।
ಪದ್ಮಾಸೀನಂ ಸಮಂತಾತ್ ಸ್ತುತಮಮರಗಣೈರ್ವ್ಯಾಘ್ರಕೃತ್ತಿಂ ವಸಾನಂ
ವಿಶ್ವಾದ್ಯಂ ವಿಶ್ವಬೀಜಂ ನಿಖಿಲಭಯಹರಂ ಪಂಚವಕ್ತ್ರಂ ತ್ರಿನೇತ್ರಮ್॥
ಓಂ ನಮಃ ಶಿವಾಯ। ಧ್ಯಾಯಾಮಿ, ಆವಾಹಯಾಮಿ॥`,
          en: `Om Tryaayusham Jamadagneh Kashyapasya Tryaayusham |
Yaddeveshu Tryaayusham Tanno Astu Tryaayusham ||
Dhyaayennityam Mahesham Rajatagirinibham Chaaruchandraavatamsam |
Ratnaakalpojjvalaangam Parashumrigavaraabheetihastam Prasannam ||
Om Namah Shivaaya | Dhyaayaami, Aavaahayaami ||`,
          hi: `ॐ त्र्यायुषं जमदग्नेः कश्यपस्य त्र्यायुषम्।
ध्यायेन्नित्यं महेशं रजतगिरिनिभं चारुचन्द्रावतंसम्।
ॐ नमः शिवाय।`,
          te: `ఓం త్ర్యాయుషం జమదగ్నేః కశ్యపస్య త్ర్యాయుషమ్।
ధ్యాయేన్నిత్యం మహేశం రజతగిరినిభం చారుచంద్రావతంసమ్।
ఓం నమః శివాయ।`,
          ta: `ஓம் த்ர்யாயுஷம்ʼ ஜமத³க்³நே꞉ கஶ்யபஸ்ய த்ர்யாயுஷம்।
த்⁴யாயேந்நித்யம்ʼ மஹேஶம்ʼ ரஜதகி³ரிநிப⁴ம்ʼ சாருசந்த்³ராவதம்ʼஸம்।
ஓம் நம꞉ ஶிவாய।`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಶಿವಾರಾಧನೆಯ ಮೊದಲು ಪವಿತ್ರ ಭಸ್ಮವನ್ನು ತ್ರಿಪುಂಡ್ರವಾಗಿ ಧರಿಸಿ.",
            mid: "ಕೈಲಾಸನಾಥನಾದ ಮಹಾದೇವನನ್ನು ಪ್ರಶಾಂತ ಚಿತ್ತದಿಂದ ಧ್ಯಾನಿಸಿ.",
            outro: "ಶಿವನ ಸಾನ್ನಿಧ್ಯವು ನಿಮ್ಮ ಆಂತರದಲ್ಲಿ ಜಾಗೃತವಾಗಿದೆ."
          },
          en: {
            intro: "Apply consecrated Bhasma in three horizontal lines across your forehead.",
            mid: "Meditate upon peaceful Lord Shiva on Mount Kailasa.",
            outro: "Shiva's luminous consciousness awakens within you."
          },
          hi: {
            intro: "माथे पर त्रिपुंड भस्म धारण करें।",
            mid: "कैलाशपति शिव का ध्यान करें।",
            outro: "महादेव का सामीप्य अनुभव करें।"
          },
          te: {
            intro: "విభూతిని ధరించండి.",
            mid: "శివుని ధ్యానించండి.",
            outro: "శివ సాన్నిధ్యం లభించింది."
          },
          ta: {
            intro: "திருநீறு பூசி தியானியுங்கள்.",
            mid: "ஈசனை வழிபடுங்கள்.",
            outro: "சிவ சக்தி மலர்கிறது."
          }
        },
        hiddenPriestInstructionKn: "ಭಸ್ಮವನ್ನು ಅನಾಮಿಕಾ, ಮಧ್ಯಮಾ ಮತ್ತು ತರ್ಜನೀ ಬೆರಳುಗಳಿಂದ ಹಚ್ಚಬೇಕು.",
        hiddenPriestInstructionEn: "Apply ash with three middle fingers horizontally.",
        approxSeconds: 40,
        visualEffect: "achamana"
      },
      {
        step: 2,
        titleKn: "ಪಂಚಾಮೃತ ಅಭಿಷೇಕ & ಬಿಲ್ವಾರ್ಚನೆ",
        titleEn: "Panchamrita Abhisheka & Bilva Archana",
        actionCueKn: "ಶಿವಲಿಂಗಕ್ಕೆ ಹಾಲು, ಮೊಸರು, ತುಪ್ಪ, ಜೇನು, ಗಂಗಾಜಲದಿಂದ ಅಭಿಷೇಕ ಮಾಡಿ, ತ್ರಿಗುಣ ಬಿಲ್ವಪತ್ರೆಗಳನ್ನು ಅರ್ಪಿಸಿ.",
        actionCueEn: "Perform Abhisheka with milk, ghee, and holy Ganga water, then offer trifoliate Bilva leaves.",
        icon: "🍃",
        mantraSanskrit: `त्रिदलं त्रिगुणाकारं त्रिनेत्रं च त्रियायुधम्।
त्रिजन्मपापसंहारं एकबिल्वं शिवार्पणम्॥
दर्शनं बिल्ववृक्षस्य स्पर्शनं पापनाशनम्।
अघोरपापसंहारं एकबिल्वं शिवार्पणम्॥
ॐ साम्बसदाशिवाय नमः, बिल्वपत्रं समर्पयामि।
महापापसंहारं आरोग्यप्रदं शिवार्पणम्॥`,
        mantraL5: {
          kn: `ತ್ರಿದಲಂ ತ್ರಿಗುಣಾಕಾರಂ ತ್ರಿನೇತ್ರಂ ಚ ತ್ರಿಯಾಯುಧಮ್।
ತ್ರಿಜನ್ಮಪಾಪಸಂಹಾರಂ ಏಕಬಿಲ್ವಂ ಶಿವಾರ್ಪಣಮ್॥
ದರ್ಶನಂ ಬಿಲ್ವವೃಕ್ಷಸ್ಯ ಸ್ಪರ್ಶನಂ ಪಾಪನಾಶನಮ್।
ಅಘೋರಪಾಪಸಂಹಾರಂ ಏಕಬಿಲ್ವಂ ಶಿವಾರ್ಪಣಮ್॥
ಓಂ ಸಾಂಬಸದಾಶಿವಾಯ ನಮಃ, ಬಿಲ್ವಪತ್ರಂ ಸಮರ್ಪಯಾಮಿ।
ಮಹಾಫಾಪಸಂಹಾರಂ ಆರೋಗ್ಯಪ್ರದಂ ಶಿವಾರ್ಪಣಮ್॥`,
          en: `Tridalam Trigunaakaaram Trinetram Cha Triyaayudham |
Trijanmapaapasamhaaram Ekabilvam Shivaarpanam ||
Darshanam Bilvavrikshasya Sparshanam Paapanaashanam |
Aghorapaapasamhaaram Ekabilvam Shivaarpanam ||
Om Saambasadaashivaaya Namah, Bilvapatram Samarpayaami ||`,
          hi: `त्रिदलं त्रिगुणाकारं त्रिनेत्रं च त्रियायुधम्।
त्रिजन्मपापसंहारं एकबिल्वं शिवार्पणम्॥
ॐ साम्बसदाशिवाय नमः, बिल्वपत्रं समर्पयामि।`,
          te: `త్రిదలం త్రిగుణాకారం త్రినేత్రం చ త్రియాయుధమ్।
త్రిజన్మపాపసంహారం ఏకబిల్వం శివార్పణమ్॥
ఓం సాంబసదాశివాయ నమః, బిల్వపత్రం సమర్పయామి।`,
          ta: `த்ரித³லம்ʼ த்ரிகு³ணாகாரம்ʼ த்ரிநேத்ரம்ʼ ச த்ரியாயுத⁴ம்।
த்ரிஜன்மபாபஸம்ʼஹாரம்ʼ ஏகபி³ல்வம்ʼ ஶிவார்பணம்॥
ஓம் ஸாம்ப³ஸதா³ஶிவாய நம꞉, பி³ல்வபத்ரம்ʼ ஸமர்பயாமி॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಶಿವನಿಗೆ ಪಂಚಾಮೃತದಿಂದ ಮತ್ತು ಶುದ್ಧ ಗಂಗಾಜಲದಿಂದ ಅಭಿಷೇಕ ಮಾಡಿ.",
            mid: "ಮೂರು ದಳಗಳುಳ್ಳ ಹಸಿರು ಬಿಲ್ವಪತ್ರೆಯನ್ನು ಉಲ್ಟಾ ಮಾಡಿ ಶಿವಲಿಂಗದ ಮೇಲೆ ಸಮರ್ಪಿಸಿ.",
            outro: "ಒಂದು ಬಿಲ್ವಪತ್ರೆಯ ಅರ್ಪಣೆಯಿಂದ ಮೂರು ಜನ್ಮಗಳ ಪಾಪ ಹಾಗೂ ರೋಗಗಳು ನಷ್ಟವಾಗುತ್ತವೆ."
          },
          en: {
            intro: "Bathe the Shivalinga with Panchamrita and sanctified water.",
            mid: "Place trifoliate green Bilva leaves gently upon the Linga.",
            outro: "Offering a single Bilva leaf wipes out diseases and accumulated sins."
          },
          hi: {
            intro: "शिवलिंग पर गंगाजल और पंचामृत से अभिषेक करें।",
            mid: "त्रिदल बेलपत्र शिवलिंग पर अर्पित करें।",
            outro: "बेलपत्र से समस्त व्याधियां नष्ट होती हैं।"
          },
          te: {
            intro: "పంచామృతంతో అభిషేకం చేయండి.",
            mid: "బిల్వపత్రాలను సమర్పించండి.",
            outro: "రోగాలు నశిస్తాయి."
          },
          ta: {
            intro: "அபிஷேகம் செய்யுங்கள்.",
            mid: "வில்வ இலைகளை சமர்ப்பியுங்கள்.",
            outro: "நோய்கள் யாவும் தீரும்."
          }
        },
        hiddenPriestInstructionKn: "ಬಿಲ್ವಪತ್ರೆಯು ಮುರಿದಿರಬಾರದು. ನಯವಾದ ಭಾಗವು ಶಿವಲಿಂಗಕ್ಕೆ ಸ್ಪರ್ಶಿಸುವಂತೆ ಇಡಬೇಕು.",
        hiddenPriestInstructionEn: "Place smooth side of Bilva leaf touching the Lingam.",
        approxSeconds: 50,
        visualEffect: "bilva"
      },
      {
        step: 3,
        titleKn: "ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಜೀವಿನೀ ಮಂತ್ರ ಜಪ",
        titleEn: "Mahamrityunjaya Sanjeevani Maha Japa",
        actionCueKn: "ಆರೋಗ್ಯ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯದ ಪರಮ ಮಂತ್ರವನ್ನು ರುದ್ರಾಕ್ಷಿ ಮಾಲೆಯಿಂದ ೧೦೮ ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ.",
        actionCueEn: "Chant the Sanjeevani Mahamrityunjaya Mantra 108 times using Rudraksha beads for vibrant health.",
        icon: "📿",
        mantraSanskrit: `ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।
उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥
ॐ हौं जूं सः ॐ भूर्भुवः स्वः।
त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।
उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्।
स्वः भुवः भूः ॐ सः जूं हौं ॐ॥`,
        mantraL5: {
          kn: `ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್।
ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್॥
ಓಂ ಹೌಂ ಜೂಂ ಸಃ ಓಂ ಭೂರ್ಭುವಃ ಸ್ವಃ।
ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್।
ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್।
ಸ್ವಃ ಭುವಃ ಭೂಃ ಓಂ ಸಃ ಜೂಂ ಹೌಂ ಓಂ॥`,
          en: `Om Tryambakam Yajaamahe Sugandhim Pushtivardhanam |
Urvaarukamiva Bandhanaan Mrityor Muksheeya Maamritaat ||
Om Haum Joom Sah Om Bhoorbhuvah Swah |
Tryambakam Yajaamahe Sugandhim Pushtivardhanam |
Urvaarukamiva Bandhanaan Mrityor Muksheeya Maamritaat |
Swah Bhuvah Bhooh Om Sah Joom Haum Om ||`,
          hi: `ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।
उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥`,
          te: `ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్।
ఉర్వారుకమివ బంధనాన్ మృత్యోర్ముక్షీయ మామృతాత్॥`,
          ta: `ஓம் த்ர்யம்ப³கம்ʼ யஜாமஹே ஸுக³ந்தி⁴ம்ʼ புஷ்டிவர்த⁴னம்।
உர்வாருகமிவ ப³ந்த⁴னான் ம்ருʼத்யோர்முக்ஷீய மாம்ருʼதாத்॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಇದು ಸಾವು-ನೋವುಗಳನ್ನು ಗೆಲ್ಲುವ ದಿವ್ಯ ಸಂಜೀವಿನೀ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ. ಆರೋಗ್ಯ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯದ ರಕ್ಷಾ ಕವಚ.",
            mid: "ಪ್ರತಿ ಮಣಿಗೂ ಪೂರ್ಣ ಏಕಾಗ್ರತೆಯಿಂದ ಮಂತ್ರವನ್ನು ಪಠಿಸಿ.",
            outro: "ಮಹಾಮೃತ್ಯುಂಜಯನ ಕೃಪೆಯಿಂದ ಸಕಲ ರೋಗ-ಭಯಗಳೂ ನಾಶವಾಗಿ ಅಮೃತತ್ವ ಲಭಿಸಲಿ."
          },
          en: {
            intro: "This is the supreme Mahamrityunjaya Sanjeevani Mantra, the divine shield conquering all illness and untimely death.",
            mid: "Chant with profound reverence counting 108 beads.",
            outro: "May Lord Mahamrityunjaya bless you with radiant vitality and long life."
          },
          hi: {
            intro: "यह संजीवनी महामृत्युंजय मंत्र है जो समस्त रोगों और मृत्युभय को हरता है।",
            mid: "रुद्राक्ष माला से १०८ बार जप करें।",
            outro: "महादेव की कृपा से दीर्घायु और आरोग्य प्राप्त हो।"
          },
          te: {
            intro: "మహామృత్యుంజయ మంత్రం జపించండి.",
            mid: "రుద్రాక్ష మాలతో 108 సార్లు జపించండి.",
            outro: "ఆరోగ్య ఆయుష్షు లభిస్తాయి."
          },
          ta: {
            intro: "மகா மிருத்யுஞ்சய மந்திரத்தை ஜபியுங்கள்.",
            mid: "108 முறை ஜபம் செய்யுங்கள்.",
            outro: "நீண்ட ஆயுளும் ஆரோக்கியமும் கிட்டும்."
          }
        },
        hiddenPriestInstructionKn: "ಜಪದ ನಂತರ ಒಂದು ಚಮಚ ಅಭಿಷೇಕ ತೀರ್ಥವನ್ನು 'ಅಕಾಲಮೃತ್ಯು ಹರಣಂ' ಎಂದು ಸೇವಿಸಬೇಕು.",
        hiddenPriestInstructionEn: "Consume one spoon of holy Abhisheka Teertha post-japa.",
        japaTarget: 108,
        japaMantra: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥",
        approxSeconds: 120,
        visualEffect: "japa"
      }
    ]
  },

  // =========================================================================
  // VRATA 6: ಶ್ರೀ ವಿದ್ಯಾ ಸರಸ್ವತೀ & ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ವ್ರತ
  // Education, competitive exams, memory power, career breakthrough
  // =========================================================================
  saraswati_medha_vrata: {
    key: "saraswati_medha_vrata",
    titleKn: "ಶ್ರೀ ವಿದ್ಯಾ ಸರಸ್ವತೀ & ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ವ್ರತ",
    titleEn: "Sri Vidya Saraswati & Medha Dakshinamurti Vrata",
    subtitleKn: "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷಾ ಯಶಸ್ಸು, ತೀಕ್ಷ್ಣ ಸ್ಮರಣಶಕ್ತಿ, ಮೇಧಾ ಶಕ್ತಿ & ಉದ್ಯೋಗ ಪ್ರಾಪ್ತಿ",
    subtitleEn: "Sacred Vrata for Exam Success, Sharp Intellect, Memory & Career Advancement",
    icon: "📚",
    badgeTextKn: "ವಿದ್ಯಾ & ಉದ್ಯೋಗ ವ್ರತ",
    badgeTextEn: "Intellect & Education",
    colorScheme: {
      primary: "#4F46E5",
      border: "#818CF8",
      badgeBg: "#EEF2FF",
      gradient: "from-indigo-600 via-blue-500 to-amber-500"
    },
    purposeKn: "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅಗ್ರಶ್ರೇಣಿಯ ಯಶಸ್ಸು, ಐಎಎಸ್/ಕೆಪಿಎಸ್ಸಿ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ವಿಜಯ, ಏಕಾಗ್ರತೆ, ಮರೆಗುಳಿತನ ನಿವಾರಣೆ ಹಾಗೂ ಉದ್ಯೋಗ ಸಂದರ್ಶನದಲ್ಲಿ ಜಯ ಸಾಧಿಸಲು ಆಚರಿಸುವ ಶಾರದೆಯ ವ್ರತ.",
    purposeEn: "Prescribed for students, aspirants of competitive exams (UPSC/GATE/State exams), researchers, and professionals seeking mental brilliance, focus, and career milestones.",
    benefitsKn: "೧. ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಅಂಕಗಳು ಮತ್ತು ಯಶಸ್ಸು. ೨. ಅಸಾಧಾರಣ ಗ್ರಹಣಶಕ್ತಿ ಹಾಗೂ ಸ್ಮರಣಶಕ್ತಿ ವೃದ್ಧಿ. ೩. ವಾಗ್ಮಿತ್ವ, ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಬುದ್ಧಿ ತೇಜಸ್ಸು. ೪. ಅಪೇಕ್ಷಿತ ಉದ್ಯೋಗ ಪ್ರಾಪ್ತಿ.",
    benefitsEn: "1. Outstanding success in academic and competitive examinations. 2. Exceptional memory retention and intellect. 3. Eloquent speech and confidence. 4. Landing prestigious career opportunities.",
    idealForKn: "ವಿದ್ಯಾರ್ಥಿಗಳು, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ ಬರೆಯುತ್ತಿರುವವರು, ಉದ್ಯೋಗಾಕಾಂಕ್ಷಿಗಳು, ಜ್ಞಾನಾಸಕ್ತರು.",
    idealForEn: "Students facing school/university exams, civil service aspirants, job seekers, and scholars.",
    timingKn: "ಗುರುವಾರ ಅಥವಾ ಬುಧವಾರ, ನವರಾತ್ರಿಯ ಮೂಲಾ ನಕ್ಷತ್ರ, ವಸಂತ ಪಂಚಮಿ, ಅಥವಾ ಪರೀಕ್ಷೆಯ ದಿನಗಳಿಗೆ ಮುಂಚಿನ ದಿನಗಳು, ಪ್ರಾತಃಕಾಲ.",
    timingEn: "Thursdays or Wednesdays, Vasant Panchami, Navaratri Saraswati Pooja days, or mornings before exams.",
    samagriList: [
      {
        id: "saraswati_image",
        itemKn: "ಶ್ರೀ ಶಾರದಾಂಬೆ/ಸರಸ್ವತಿ ಪಟ ಅಥವಾ ಮೂರ್ತಿ",
        itemEn: "Goddess Saraswati Image or Idol",
        quantityKn: "೧",
        quantityEn: "1",
        importance: "mandatory"
      },
      {
        id: "books_pens",
        itemKn: "ಪುಸ್ತಕಗಳು, ಲೇಖನಿ (ಪೆನ್) & ಪರೀಕ್ಷಾ ಸಾಮಗ್ರಿಗಳು",
        itemEn: "Textbooks, notebook, pen for blessing",
        quantityKn: "ಪೂಜಾ ಪೀಠದಲ್ಲಿ ಇಡಲು",
        quantityEn: "Placed at altar",
        importance: "mandatory"
      },
      {
        id: "white_flowers",
        itemKn: "ಬಿಳಿ ಮಲ್ಲಿಗೆ, ತಾವರೆ ಅಥವಾ ಬಿಳಿ ಹೂವುಗಳು",
        itemEn: "White Jasmine, white Lotus or white flowers",
        quantityKn: "ಸಾಕಷ್ಟು",
        quantityEn: "Adequate",
        importance: "mandatory",
        notesKn: "ಸರಸ್ವತಿಗೆ ಶ್ವೇತ ವರ್ಣ ಪರಮ ಪ್ರಿಯ."
      },
      {
        id: "kallu_sakkare",
        itemKn: "ಕಲ್ಲುಸಕ್ಕರೆ, ಹಾಲು, ಜೇನುತುಪ್ಪ & ಸಿಹಿ ಹಣ್ಣುಗಳು",
        itemEn: "Rock sugar, milk, honey & fruits",
        quantityKn: "೧ ಬಟ್ಟಲು",
        quantityEn: "1 bowl",
        importance: "mandatory"
      },
      {
        id: "yellow_cloth",
        itemKn: "ಹಳದಿ ಅಥವಾ ಬಿಳಿ ರೇಷ್ಮೆ ವಸ್ತ್ರ",
        itemEn: "Yellow or white consecrated cloth",
        quantityKn: "೧",
        quantityEn: "1",
        importance: "recommended"
      }
    ],
    steps: [
      {
        step: 1,
        titleKn: "ಪುಸ್ತಕ ಪೂಜೆ & ಶಾರದಾ ಧ್ಯಾನ",
        titleEn: "Sanctifying Study Materials & Saraswati Dhyana",
        actionCueKn: "ಪುಸ್ತಕಗಳು ಮತ್ತು ಪೆನ್ನನ್ನು ಪೀಠದಲ್ಲಿರಿಸಿ, ಅಕ್ಷತೆ-ಶ್ವೇತ ಪುಷ್ಪಗಳನ್ನು ಅರ್ಪಿಸಿ ಜ್ಞಾನದೇವತೆಯನ್ನು ಧ್ಯಾನಿಸಿ.",
        actionCueEn: "Place books and exam pens at Mother Saraswati's feet, offering white flowers and sacred rice.",
        icon: "📖",
        mantraSanskrit: `सरस्वति नमस्तुभ्यं वरदे कामरूपिणि।
विद्यारम्भं करिष्यामि सिद्धिर्भवतु मे सदा॥
या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता
या वीणावरदण्डमण्डितकरा या श्वेतपद्मासना।
या ब्रह्माच्युतशङ्करप्रभृतिभिर्देवैः सदा वन्दिता
सा मां पातु सरस्वती भगवती निःशेषजाड्यापहा॥`,
        mantraL5: {
          kn: `ಸರಸ್ವತಿ ನಮಸ್ತುಭ್ಯಂ ವರದೇ ಕಾಮರೂಪಿಣಿ।
ವಿದ್ಯಾರಂಭಂ ಕರಿಷ್ಯಾಮಿ ಸಿದ್ಧಿರ್ಭವತು ಮೇ ಸದಾ॥
ಯಾ ಕುಂದೇಂದುತುಷಾರಹಾರಧವಲಾ ಯಾ ಶುಭ್ರವಸ್ತ್ರಾವೃತಾ
ಯಾ ವೀಣಾವರದಂಡಮಂಡಿತಕರಾ ಯಾ ಶ್ವೇತಪದ್ಮಾಸನಾ।
ಯಾ ಬ್ರಹ್ಮಾಚ್ಯುತಶಂಕರಪ್ರಭೃತಿಭಿರ್ದೇವೈಃ ಸದಾ ವಂದಿತಾ
ಸಾ ಮಾಂ ಪಾತು ಸರಸ್ವತೀ ಭಗವತೀ ನಿಃಶೇಷಜಾಡ್ಯಾಪಹಾ॥`,
          en: `Saraswati Namastubhyam Varade Kaamaroopini |
Vidyaarambham Karishyaami Siddhir Bhavatu Me Sadaa ||
Yaa Kundendu Tushaara Haara Dhavalaa Yaa Shubhra Vastraavritaa
Yaa Veenaa Varadanda Manditakaraa Yaa Shwetapadmaasanaa |
Yaa Brahmaachyuta Shankara Prabhritibhir Devaih Sadaa Vanditaa
Saa Maam Paatu Saraswati Bhagavati Nihshesha Jaadyaapahaa ||`,
          hi: `सरस्वति नमस्तुभ्यं वरदे कामरूपिणि।
विद्यारम्भं करिष्यामि सिद्धिर्भवतु मे सदा॥
या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता।
सा मां पातु सरस्वती भगवती निःशेषजाड्यापहा॥`,
          te: `సరస్వతి నమస్తుభ్యం వరదే కామరూపిణి।
విద్యారంభం కరిష్యామి సిద్ధిర్భవతు మే సదా॥
యా కుందేందుతుషారహారధవలా యా శుభ్రవస్త్రావృతా।
సా మాం పాతు సరస్వతీ భగవతీ నిఃశేషజాడ్యాపహా॥`,
          ta: `ஸரஸ்வதி நமஸ்துப்⁴யம்ʼ வரதே³ காமரூபிணி।
வித்³யாரம்ப⁴ம்ʼ கரிஷ்யாமி ஸித்³தி⁴ர்ப⁴வது மே ஸதா³॥
யா குந்தே³ந்து³துஷாரஹாரத⁴வலா யா ஶுப்⁴ரவஸ்த்ராவ்ருʼதா।
ஸா மாம்ʼ பாது ஸரஸ்வதீ ப⁴க³வதீ நி꞉ஶேஷஜாட்³யாபஹா॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಜ್ಞಾನದ ಅಧಿದೇವತೆಯಾದ ಶ್ರೀ ಸರಸ್ವತಿಯನ್ನು ಶ್ವೇತ ಪದ್ಮದಲ್ಲಿ ಧ್ಯಾನಿಸಿ. ಪರೀಕ್ಷೆಯ ಪುಸ್ತಕ ಮತ್ತು ಲೇಖನಿಯನ್ನು ತಾಯಿಯ ಪಾದಗಳಿಲ್ಲಿರಿಸಿ.",
            mid: "ಬಿಳಿ ಹೂವುಗಳನ್ನು ಅರ್ಪಿಸಿ ನಮಸ್ಕರಿಸಿ.",
            outro: "ನಿಮ್ಮ ಬುದ್ಧಿಯ ಜಡತ್ವವನ್ನು ಕಳೆದು ಶಾರದೆಯು ಜ್ಞಾನದ ಜ್ಯೋತಿಯನ್ನು ಬೆಳಗಿಸುತ್ತಾಳೆ."
          },
          en: {
            intro: "Meditate upon Goddess Saraswati seated on a pure white lotus, holding the veena.",
            mid: "Place your books and pens at Her lotus feet and offer white flowers.",
            outro: "May the Divine Mother dispel all mental darkness and grant sharp brilliance."
          },
          hi: {
            intro: "श्वेत पद्मासना मां सरस्वती का ध्यान करें। पुस्तकें और लेखनी चरणों में रखें।",
            mid: "सफेद पुष्प अर्पित करें।",
            outro: "मां सरस्वती आपकी बुद्धि का विकास करें।"
          },
          te: {
            intro: "సరస్వతీ దేవిని ధ్యానించండి. పుస్తకాలను పూజించండి.",
            mid: "తెల్లటి పువ్వులు సమర్పించండి.",
            outro: "విద్యా బుద్ధులు కలుగుతాయి."
          },
          ta: {
            intro: "சரஸ்வதி தேவியை தியானியுங்கள். புத்தகங்களை பாதம் வையுங்கள்.",
            mid: "வெள்ளை மலர்கள் இடுங்கள்.",
            outro: "கல்வி ஞானம் பெருகும்."
          }
        },
        hiddenPriestInstructionKn: "ಪರೀಕ್ಷಾ ಪೆನ್ನಿಗೆ ತಾಯಿಯ ಕುಂಕುಮ-ಅಕ್ಷತೆ ಸ್ಪರ್ಶಿಸಿ ಆಶೀರ್ವಾದ ಪಡೆಯಬೇಕು.",
        hiddenPriestInstructionEn: "Touch exam pen with blessed kumkuma and akshata.",
        approxSeconds: 45,
        visualEffect: "tulasi"
      },
      {
        step: 2,
        titleKn: "ಮೇಧಾ ಸೂಕ್ತ & ಸರಸ್ವತೀ ಜಪ",
        titleEn: "Medha Sukta & Saraswati Gayatri Japa",
        actionCueKn: "ತೀಕ್ಷ್ಣ ಸ್ಮರಣಶಕ್ತಿ ಮತ್ತು ಪರೀಕ್ಷಾ ಯಶಸ್ಸಿನ ವೈದಿಕ ಮೇಧಾ ಮಂತ್ರವನ್ನು ೨೮ ಅಥವಾ ೧೦೮ ಬಾರಿ ಜಪಿಸಿ.",
        actionCueEn: "Chant the Vedic Medha Sukta / Saraswati Gayatri 28 or 108 times for razor-sharp intellect.",
        icon: "📿",
        mantraSanskrit: `ॐ मेधां मह्यं अङ्गिरा ददातु मेधां सप्तर्षयो ददुः।
मेधां मह्यं प्रजापतिः मेधामग्निर्ददातु मे॥
ॐ ऐं वाग्देव्यै च विद्महे कामराजाय धीमहि।
तन्नो देवी प्रचोदयात्॥
ॐ ऐं सरस्वत्यै नमः।
ॐ दक्षिणामूर्तये नमः, मेधां प्रयच्छ स्वाहा॥`,
        mantraL5: {
          kn: `ಓಂ ಮೇಧಾಂ ಮಹ್ಯಂ ಅಂಗಿರಾ ದದಾತು ಮೇಧಾಂ ಸಪ್ತರ್ಷಯೋ ದದುಃ।
ಮೇಧಾಂ ಮಹ್ಯಂ ಪ್ರಜಾಪತಿಃ ಮೇಧಾಮಗ್ನಿದ್ರ್ದದಾತು ಮೇ॥
ಓಂ ಐಂ ವಾಗ್ದೇವ್ಯೈ ಚ ವಿದ್ಮಹೇ ಕಾಮರಾಜಾಯ ಧೀಮಹಿ।
ತನ್ನೋ ದೇವೀ ಪ್ರಚೋದಯಾತ್॥
ಓಂ ಐಂ ಸರಸ್ವತ್ಯೈ ನಮಃ।
ಓಂ ದಕ್ಷಿಣಾಮೂರ್ತಯೇ ನಮಃ, ಮೇಧಾಂ ಪ್ರಯಚ್ಛ ಸ್ವಾಹಾ॥`,
          en: `Om Medhaam Mahyam Angiraa Dadaatu Medhaam Saptarshayo Daduh |
Medhaam Mahyam Prajaapatih Medhaam Agnirdadaatu Me ||
Om Aim Vaagdevyai Cha Vidmahe Kaamaraajaaya Dheemahi |
Tanno Devi Prachodayaat ||
Om Aim Saraswatyai Namah |
Om Dakshinaamoortaye Namah, Medhaam Prayachha Swaahaa ||`,
          hi: `ॐ मेधां मह्यं अङ्गिरा ददातु मेधां सप्तर्षयो ददुः।
ॐ ऐं सरस्वत्यै नमः।
ॐ दक्षिणामूर्तये नमः, मेधां प्रयच्छ स्वाहा॥`,
          te: `ఓం మేధాం మహ్యం అంగిరా దదాతు మేధాం సప్తర్షయో దదుః।
ఓం ఐం సరస్వత్యై నమః।
ఓం దక్షిణామూర్తయే నమః॥`,
          ta: `ஓம் மேதா⁴ம்ʼ மஹ்யம்ʼ அங்கRegionரா த³தா³து மேதா⁴ம்ʼ ஸப்தர்ஷயோ த³து³꞉।
ஓம் ஐம்ʼ ஸரஸ்வத்யை நம꞉।
ஓம் த³க்ஷிணாமூர்தயே நம꞉॥`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಋಷಿಮುನಿಗಳು ಉಪಾಸನೆ ಮಾಡಿದ ಪರಮ ಪವಿತ್ರ ಮೇಧಾ ಸೂಕ್ತ ಹಾಗೂ ಸರಸ್ವತೀ ಮಂತ್ರವನ್ನು ಜಪಿಸಿ.",
            mid: "ಮನಸ್ಸನ್ನು ಏಕಾಗ್ರಗೊಳಿಸಿ, ಪರೀಕ್ಷಾ ಕೊಠಡಿಯಲ್ಲಿ ಸಕಲ ಉತ್ತರಗಳೂ ಸ್ಫುರಿಸಲಿ ಎಂದು ಪ್ರಾರ್ಥಿಸಿ.",
            outro: "ಶಾರದೆಯ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ಸ್ಮರಣಶಕ್ತಿಯು ಬೆಳಗಲಿ."
          },
          en: {
            intro: "Chant the Vedic Medha Sukta and Saraswati Mantra revealed by ancient seers.",
            mid: "Focus your mind, praying for total recall and composure during tests.",
            outro: "May Mother Sharada infuse your intellect with brilliant mastery."
          },
          hi: {
            intro: "मेधा सूक्त और सरस्वती मंत्र का एकाग्रता से जप करें।",
            mid: "परीक्षा में सफलता की प्रार्थना करें।",
            outro: "बुद्धि और स्मरणशक्ति का विकास हो।"
          },
          te: {
            intro: "మేధా సూక్తం జపించండి.",
            mid: "ఏకాగ్రతతో ప్రార్థించండి.",
            outro: "జ్ఞాన వికాసం కలుగుతుంది."
          },
          ta: {
            intro: "மேதா சூக்தம் மற்றும் சரஸ்வதி மந்திரத்தை ஜபியுங்கள்.",
            mid: "மனதை ஒருமுகப்படுத்துங்கள்.",
            outro: "நினைவாற்றல் கூர்மையாகும்."
          }
        },
        hiddenPriestInstructionKn: "ಪರೀಕ್ಷೆಗೆ ಹೋಗುವ ಮುನ್ನ ಈ ಮಂತ್ರವನ್ನು ಕನಿಷ್ಠ ೧೨ ಬಾರಿ ಸ್ಮರಿಸಿದರೆ ಭಯ ದೂರವಾಗುತ್ತದೆ.",
        hiddenPriestInstructionEn: "Reciting 12 times before exams removes test anxiety.",
        japaTarget: 28,
        japaMantra: "ॐ ऐं वाग्देव्यै च विद्महे कामराजाय धीमಹಿ। तन्नो देवी प्रचोदयात्॥",
        approxSeconds: 60,
        visualEffect: "japa"
      },
      {
        step: 3,
        titleKn: "ಕಲ್ಲುಸಕ್ಕರೆ ನೈವೇದ್ಯ & ಗುರು ಕೃಪಾಶೀರ್ವಾದ",
        titleEn: "Sweet Rock Sugar Offering & Guru Blessings",
        actionCueKn: "ಕಲ್ಲುಸಕ್ಕರೆ ಮತ್ತು ಹಾಲನ್ನು ನೈವೇದ್ಯ ಮಾಡಿ, ಕರ್ಪೂರಾರತಿ ಬೆಳಗಿಸಿ ಶಿರಬಾಗಿ ನಮಸ್ಕರಿಸಿ.",
        actionCueEn: "Offer rock sugar and milk to Goddess Saraswati, wave camphor light and bow deeply.",
        icon: "🔥",
        mantraSanskrit: `ॐ शर्कराक्षीरसम्पन्नं नैवेद्यं प्रतिगृह्यताम्।
विद्यां बुद्धिं यशो देहि पुत्रान् पौत्रांश्च सम्पदः॥
ॐ सरस्वत्यै नमः, कर्पूरारार्तिक्यं समर्पयामि।
अनेन मया कृतेन विद्यासरस्वती व्रतानुष्ठानेन
श्री शारदाम्बा सुप्रीता वरदा भवतु॥`,
        mantraL5: {
          kn: `ಓಂ ಶರ್ಕರಾಕ್ಷೀರಸಂಪನ್ನಂ ನೈವೇದ್ಯಂ ಪ್ರತಿಗೃಹ್ಯತಾಮ್।
ವಿದ್ಯಾಂ ಬುದ್ಧಿಂ ಯಶೋ ದೇಹಿ ಪುತ್ರಾನ್ ಪೌತ್ರಾಂಶ್ಚ ಸಂಪದಃ॥
ಓಂ ಸರಸ್ವತ್ಯೈ ನಮಃ, ಕರ್ಪೂರಾರಾರ್ತಿಕಂ ಸಮರ್ಪಯಾಮಿ।
ಅನೇನ ಮಯಾ ಕೃತೇನ ವಿದ್ಯಾಸರಸ್ವತೀ ವ್ರತಾನುಷ್ಠಾನೇನ
ಶ್ರೀ ಶಾರದಾಂಬಾ ಸುಪ್ರೀತಾ ವರದಾ ಭವತು॥`,
          en: `Om Sharkaraaksheerasampannam Naivedyam Pratigrihyataam |
Vidyaam Buddhim Yasho Dehi Putraan Poutraamshcha Sampadah ||
Om Saraswatyai Namah, Karpooraaraartikyam Samarpayaami |
Shri Shaaradaambaa Supreetaa Varadaa Bhavatu ||`,
          hi: `ॐ शर्कराक्षीरसम्पन्नं नैवेद्यं प्रतिगृह्यताम्।
विद्यां बुद्धिं यशो देहि।
ॐ सरस्वत्यै नमः, कर्पूरारार्तिक्यं समर्पयामि।`,
          te: `ఓం శర్కరాక్షీరసంపన్నం నైవేద్యం ప్రతిగృహ్యతామ్।
విద్యాం బుద్ధిం యశో దేహి।
హారతిం సమర్పయామి।`,
          ta: `ஓம் ஶர்கராக்ஷீரஸம்பன்னம்ʼ நைவேத்³யம்ʼ ப்ரதிக்³ருʼஹ்யதாம்।
வித்³யாம்ʼ பு³த்³தி⁴ம்ʼ யஶோ தே³ஹி।
கற்பூர ஆரத்தி சமர்ப்பயாமி।`
        },
        audioInstructionL5: {
          kn: {
            intro: "ಸರಸ್ವತಿ ದೇವಿಗೆ ಕಲ್ಲುಸಕ್ಕರೆ ಮತ್ತು ಹಾಲನ್ನು ನೈವೇದ್ಯ ಮಾಡಿ.",
            mid: "ಕರ್ಪೂರದ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ ಪ್ರಸಾದವನ್ನು ಸ್ವೀಕರಿಸಿ.",
            outro: "ನಿಮ್ಮ ವಿದ್ಯಾ ಸರಸ್ವತೀ ವ್ರತವು ಪೂರ್ಣವಾಯಿತು. ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಮತ್ತು ಜೀವನದ ಪ್ರತಿಯೊಂದು ಹೆಜ್ಜೆಯಲ್ಲೂ ವಿಜಯಶಾಲಿಯಾಗಿ!"
          },
          en: {
            intro: "Offer sweet rock sugar and milk to Divine Mother Saraswati.",
            mid: "Wave the sacred camphor light and accept the blessed prasada.",
            outro: "Your Vidya Saraswati Vrata is completed. May you emerge victorious in your exams and career!"
          },
          hi: {
            intro: "मिश्री और दूध का भोग लगाएं।",
            mid: "कर्पूर आरती कर प्रसाद ग्रहण करें।",
            outro: "विद्या सरस्वती व्रत पूर्ण हुआ। परीक्षा और जीवन में सदा विजयी हों।"
          },
          te: {
            intro: "మిశ్రీ మరియు పాలు నైవేద్యం పెట్టండి.",
            mid: "హారతి ఇచ్చి ప్రసాదం తీసుకోండి.",
            outro: "వ్రతం ఫలించింది. పరీక్షల్లో విజయం సాధించండి."
          },
          ta: {
            intro: "கற்கண்டு மற்றும் பால் நைவேத்யம் செய்யுங்கள்.",
            mid: "ஆரத்தி காட்டி பிரசாதம் அருந்துங்கள்.",
            outro: "விரதம் இனிதே நிறைவுற்றது. தேர்வுகளில் வெற்றி நிச்சயம்."
          }
        },
        hiddenPriestInstructionKn: "ಪೂಜಿಸಿದ ಲೇಖನಿಯನ್ನು ಪರೀಕ್ಷಾ ದಿನದಂದು ಮಾತ್ರ ಬಳಸಿ ಆರಂಭಿಸುವುದು ಮಂಗಳಕರ.",
        hiddenPriestInstructionEn: "Use the consecrated pen on the exam day for auspicious results.",
        approxSeconds: 50,
        visualEffect: "arathi"
      }
    ]
  }
};

/**
 * Filter vratas by selected keys
 */
export function filterGuidedVratas(keys: string[]): GuidedVrataItem[] {
  if (!keys || keys.length === 0) {
    return GUIDED_VRATA_KEYS.map((k) => GUIDED_VRATAS[k]);
  }
  const items: GuidedVrataItem[] = [];
  for (const k of keys) {
    if (k in GUIDED_VRATAS) {
      items.push(GUIDED_VRATAS[k as GuidedVrataKey]);
    }
  }
  return items.length > 0 ? items : GUIDED_VRATA_KEYS.map((k) => GUIDED_VRATAS[k]);
}
