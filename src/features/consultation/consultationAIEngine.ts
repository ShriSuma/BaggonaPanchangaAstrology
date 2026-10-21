/**
 * Baggona Panchanga - Consultation AI & Astrological Precision Engine
 * Computes deterministic birth chart coordinates, planetary positions, Bhavas,
 * Vimshottari Dasha-Bhukti, Gochara transits, and generates 2-3 paragraphs (5-6 lines each)
 * of 100% accurate Vedic readings strictly in the chosen consultation language.
 *
 * Mandatory Skill Adherence:
 * - Uses gemini-3.5-flash-lite exclusively
 * - 3-attempt exponential retry loop
 * - Supports 7 languages: kn, en, hi, te, ta, ml, mr
 */

import { calculateKundliWithPlaceSun } from "../../core/KundliEngine";
import { type KundliOutput, type PlanetPosition, PlanetName } from "../../core/AstroTypes";
import { askGemini, type AskGeminiChatTurn } from "../../core/GeminiEngine";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { getTransitsForDate } from "../../core/BaggonaPredictionEngine";
import {
  calculateComprehensiveDoshas,
  type ComprehensiveDoshaReport,
  type DetectedDosha
} from "../../core/ComprehensiveDoshaEngine";
import type {
  ConsultationSession,
  ConsultationLanguage,
  ActiveDoshaCardData
} from "./consultationTypes";
import {
  RASHIS_I18N,
  NAKSHATRAS_I18N,
  PLANET_NAMES_I18N
} from "./consultationPanchangaService";
import { useAppStore } from "../../stores/appStore";

export interface ConsultationReadingResult {
  fullText: string;
  paragraphs: string[];
  astrologicalHighlights: {
    lagna: string;
    moonSign: string;
    nakshatra: string;
    currentDasha: string;
    keyInfluences: string[];
  };
  hasDosha: boolean;
  doshaName?: string;
  doshaParihara?: string;
  activeDoshaCard?: ActiveDoshaCardData;
}

/**
 * Maps ConsultationLanguage to target language full name for Gemini
 */
export const CONSULTATION_LANG_NAMES: Record<ConsultationLanguage, string> = {
  kn: "Kannada",
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  ml: "Malayalam",
  mr: "Marathi"
};

export const SIGN_LORDS: PlanetName[] = [
  PlanetName.Mars,     // 0: Mesha / Aries
  PlanetName.Venus,    // 1: Vrishabha / Taurus
  PlanetName.Mercury,  // 2: Mithuna / Gemini
  PlanetName.Moon,     // 3: Karka / Cancer
  PlanetName.Sun,      // 4: Simha / Leo
  PlanetName.Mercury,  // 5: Kanya / Virgo
  PlanetName.Venus,    // 6: Tula / Libra
  PlanetName.Mars,     // 7: Vrishchika / Scorpio
  PlanetName.Jupiter,  // 8: Dhanu / Sagittarius
  PlanetName.Saturn,   // 9: Makara / Capricorn
  PlanetName.Saturn,   // 10: Kumbha / Aquarius
  PlanetName.Jupiter   // 11: Meena / Pisces
];

export interface DevoteeCharacterProfile {
  tatva: string;
  tatvaEn: string;
  gana: string;
  ganaEn: string;
  psychologicalNature: string;
  psychologicalNatureEn: string;
}

export const SIGN_TATVAS: { kn: string; en: string }[] = [
  { kn: "ಅಗ್ನಿ ತತ್ವ (ಧೈರ್ಯ, ನಾಯಕತ್ವ & ಮುನ್ನಡೆ)", en: "Agni Tatva (Fiery, Bold, Pioneer)" },
  { kn: "ಪೃಥ್ವಿ ತತ್ವ (ಸ್ಥಿರತೆ, ತಾಳ್ಮೆ & ಪರಿಶ್ರಮ)", en: "Prithvi Tatva (Earthy, Grounded, Enduring)" },
  { kn: "ವಾಯು ತತ್ವ (ಬುದ್ಧಿಶಕ್ತಿ, ಸಂವಹನ & ಜಿಜ್ಞಾಸೆ)", en: "Vayu Tatva (Airy, Intellectual, Articulate)" },
  { kn: "ಜಲ ತತ್ವ (ಭಾವನಾತ್ಮಕತೆ, ಮಮತೆ & ಅಂತಃಪ್ರೇರಣೆ)", en: "Jala Tatva (Watery, Emotional, Intuitive)" },
  { kn: "ಅಗ್ನಿ ತತ್ವ (ಗಾಂಭೀರ್ಯ, ಸ್ವಾಭಿಮಾನ & ಪ್ರಭುತ್ವ)", en: "Agni Tatva (Fiery, Regal, Commanding)" },
  { kn: "ಪೃಥ್ವಿ ತತ್ವ (ವಿಶ್ಲೇಷಣೆ, ನಿಖರತೆ & ಸೇವಾಭಾವ)", en: "Prithvi Tatva (Earthy, Analytical, Meticulous)" },
  { kn: "ವಾಯು ತತ್ವ (ಸಾಮರಸ್ಯ, ನ್ಯಾಯ & ರಾಜತಾಂತ್ರಿಕತೆ)", en: "Vayu Tatva (Airy, Balanced, Diplomatic)" },
  { kn: "ಜಲ ತತ್ವ (ತೀವ್ರ ಸಂಕಲ್ಪ, ಆಳವಾದ ಒಳನೋಟ & ನಿಷ್ಠೆ)", en: "Jala Tatva (Watery, Intense, Piercing insight)" },
  { kn: "ಅಗ್ನಿ ತತ್ವ (ತತ್ವಜ್ಞಾನ, ಸತ್ಯನಿಷ್ಠೆ & ಆಶಾವಾದ)", en: "Agni Tatva (Fiery, Philosophical, Truth-seeker)" },
  { kn: "ಪೃಥ್ವಿ ತತ್ವ (ಶಿಸ್ತು, ಕರ್ತವ್ಯನಿಷ್ಠೆ & ಅಪಾರ ಸಹಿಷ್ಣುತೆ)", en: "Prithvi Tatva (Earthy, Disciplined, Pragmatic)" },
  { kn: "ವಾಯು ತತ್ವ (ದೂರದೃಷ್ಟಿ, ಸ್ವತಂತ್ರ ಚಿಂತನೆ & ನವೀನತೆ)", en: "Vayu Tatva (Airy, Visionary, Free-thinker)" },
  { kn: "ಜಲ ತತ್ವ (ಕರುಣೆ, ಆಧ್ಯಾತ್ಮಿಕತೆ & ಕಲ್ಪನಾಶಕ್ತಿ)", en: "Jala Tatva (Watery, Compassionate, Spiritual)" }
];

export const NAKSHATRA_GANAS: { kn: string; en: string }[] = [
  { kn: "ದೇವ ಗಣ (ಶಾಂತಪ್ರಿಯ, ಸಾತ್ವಿಕ & ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ)", en: "Deva Gana (Sattvic, Peace-loving, Gentle)" },
  { kn: "ಮನುಷ್ಯ ಗಣ (ವ್ಯಾವಹಾರಿಕ, ಪರಿಶ್ರಮ & ಕೌಟುಂಬಿಕ ಪ್ರೇಮ)", en: "Manushya Gana (Rajasic, Balanced, Family-centric)" },
  { kn: "ರಾಕ್ಷಸ ಗಣ (ತೀವ್ರ ಸಂಕಲ್ಪ, ದಿಟ್ಟತನ & ಹೋರಾಟದ ಗುಣ)", en: "Rakshasa Gana (Fierce resolve, Independent, Resilient)" },
  { kn: "ಮನುಷ್ಯ ಗಣ (ಆಕರ್ಷಕ, ಸೌಂದರ್ಯಪ್ರಿಯ & ಸ್ನೇಹಪರ)", en: "Manushya Gana (Artistic, Loving, Graceful)" },
  { kn: "ದೇವ ಗಣ (ಜಿಜ್ಞಾಸು, ಮೃದು ಸ್ವಭಾವ & ಪರಿಶೋಧಕ)", en: "Deva Gana (Inquisitive, Soft-spoken, Explorer)" },
  { kn: "ಮನುಷ್ಯ ಗಣ (ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ, ಆಳವಾದ ಚಿಂತನೆ)", en: "Manushya Gana (Sharp intellect, Transformative thinker)" },
  { kn: "ದೇವ ಗಣ (ಸದಾಚಾರ, ಧಾರ್ಮಿಕತೆ & ಧಾರಕ ಶಕ್ತಿ)", en: "Deva Gana (Righteous, Benevolent, Restorer)" },
  { kn: "ದೇವ ಗಣ (ಪೋಷಕ, ಭಕ್ತಿಪರಾಯಣ & ಶ್ರದ್ಧಾವಂತ)", en: "Deva Gana (Nurturing, Devout, Guiding light)" },
  { kn: "ರಾಕ್ಷಸ ಗಣ (ರಹಸ್ಯಮಯ, ತೀಕ್ಷ್ಣ ಗ್ರಹಿಕೆ & ಚಾಣಾಕ್ಷ)", en: "Rakshasa Gana (Penetrating mind, Intuitive, Shrewd)" },
  { kn: "ರಾಕ್ಷಸ ಗಣ (ಪಿತೃ ತೇಜಸ್ಸು, ಸ್ವಾಭಿಮಾನ & ಆಡಳಿತ ಗುಣ)", en: "Rakshasa Gana (Regal ancestral pride, Authoritative)" },
  { kn: "ಮನುಷ್ಯ ಗಣ (ಕಲಾಸಕ್ತಿ, ಭೋಗಪ್ರಿಯತೆ & ವಿಶಾಲ ಹೃದಯ)", en: "Manushya Gana (Generous, Sociable, Refined)" },
  { kn: "ಮನುಷ್ಯ ಗಣ (ಸಹಾಯ ಹಸ್ತ, ನಿಯಮಬದ್ಧತೆ & ನಾಯಕತ್ವ)", en: "Manushya Gana (Helpful, Noble patron, Steadfast)" },
  { kn: "ದೇವ ಗಣ (ಕೈಚಳಕ, ಕಲಾತ್ಮಕ & ಚುರುಕಾದ ಕಾರ್ಯದಕ್ಷತೆ)", en: "Deva Gana (Skillful, Creative, Dexterous)" },
  { kn: "ರಾಕ್ಷಸ ಗಣ (ವಿನ್ಯಾಸಕಾರ, ಸೌಂದರ್ಯಪ್ರಜ್ಞೆ & ಸಂಕಲ್ಪ)", en: "Rakshasa Gana (Architectural vision, Bold artisan)" },
  { kn: "ದೇವ ಗಣ (ಸ್ವಾವಲಂಬನೆ, ವಿನಯ & ಸ್ವಾತಂತ್ರ್ಯ ಪ್ರಿಯ)", en: "Deva Gana (Independent, Gentle breeze, Flexible)" },
  { kn: "ರಾಕ್ಷಸ ಗಣ (ಗುರಿ ಕೇಂದ್ರಿತ, ಸವಾಲುಗಳನ್ನು ಗೆಲ್ಲುವ ಛಲ)", en: "Rakshasa Gana (Goal-driven, Ambitious victor)" },
  { kn: "ದೇವ ಗಣ (ನಿಷ್ಠೆ, ಸ್ನೇಹ, ಭಕ್ತಿ & ಸಹಕಾರ)", en: "Deva Gana (Loyal friend, Devoted seeker, Pure heart)" },
  { kn: "ರಾಕ್ಷಸ ಗಣ (ಹಿರಿಯತನ, ಜವಾಬ್ದಾರಿ & ಸಂರಕ್ಷಣಾ ಶಕ್ತಿ)", en: "Rakshasa Gana (Protective senior, Elder wisdom, Staunch)" },
  { kn: "ರಾಕ್ಷಸ ಗಣ (ಮೂಲ ಪರಿಶೋಧನೆ, ನಿರ್ಭೀತ & ಕ್ರಾಂತಿಕಾರಿ)", en: "Rakshasa Gana (Root investigator, Fearless transformer)" },
  { kn: "ಮನುಷ್ಯ ಗಣ (ಅಪರಾಜಿತ ಛಲ, ಆಕರ್ಷಕ & ಧೈರ್ಯವಂತ)", en: "Manushya Gana (Invincible spirit, Persuasive orator)" },
  { kn: "ಮನುಷ್ಯ ಗಣ (ಶಾಶ್ವತ ವಿಜಯ, ವಿನಮ್ರತೆ & ಸತ್ಯಪರ)", en: "Manushya Gana (Enduring victor, Humble leader, Truthful)" },
  { kn: "ದೇವ ಗಣ (ಜ್ಞಾನ ಶ್ರವಣ, ಸಂಸ್ಕಾರ & ವಿದ್ವತ್ಪೂರ್ಣ)", en: "Deva Gana (Scholarly listener, Wisdom preserver, Pure)" },
  { kn: "ರಾಕ್ಷಸ ಗಣ (ಲಯಬದ್ಧತೆ, ನಾಯಕತ್ವ & ಸಮೃದ್ಧಿ)", en: "Rakshasa Gana (Rhythmic leader, Wealth creator, Decisive)" },
  { kn: "ರಾಕ್ಷಸ ಗಣ (ದೂರದರ್ಶಿ, ಸಂಶೋಧಕ & ರಹಸ್ಯ ಚಿಕಿತ್ಸಕ)", en: "Rakshasa Gana (Mystic visionary, Healer, Solitary seeker)" },
  { kn: "ಮನುಷ್ಯ ಗಣ (ತಪಸ್ಸು, ತ್ಯಾಗ ಮನೋಭಾವ & ಆಳವಾದ ನಿಷ್ಠೆ)", en: "Manushya Gana (Spiritual ascetic, Deep passion, Altruistic)" },
  { kn: "ಮನುಷ್ಯ ಗಣ (ಸಮುದ್ರ ಸದೃಶ ಗಾಂಭೀರ್ಯ, ಶಾಂತಿ & ಸತ್ಯ)", en: "Manushya Gana (Serene oceanic depth, Stable philosopher)" },
  { kn: "ದೇವ ಗಣ (ಪೂರ್ಣತೆ, ದೈವ ಕೃಪೆ & ಸಕಲ ಜೀವರಕ್ಷಣೆ)", en: "Deva Gana (Transcendent grace, Compassionate shepherd)" }
];

export const LAGNA_PSYCHOLOGICAL_NATURE: { kn: string; en: string }[] = [
  {
    kn: "ಅಪ್ರತಿಮ ಧೈರ್ಯ, ನೇರ ನುಡಿ, ಮುಂಚೂಣಿಯಲ್ಲಿ ನಿಲ್ಲುವ ನಾಯಕತ್ವ ಗುಣ. ಯಾವುದೇ ಕೆಲಸದಲ್ಲಿ ಆತುರ ಮತ್ತು ವಿಳಂಬವಾದರೆ ಸಹಿಸಲಾಗದ ಪ್ರವೃತ್ತಿ.",
    en: "Courageous, candid, natural pioneer with leadership drive; impatient with delays and micromanagement."
  },
  {
    kn: "ದೃಢತೆ, ಅಗಾಧ ತಾಳ್ಮೆ, ಸೌಂದರ್ಯ ಮತ್ತು ಸ್ಥಿರತೆಯ ಪ್ರಿಯತೆ. ನಿಧಾನವಾಗಿ ಯೋಚಿಸಿ ಹೆಜ್ಜೆಯಿಡುವ, ಯಾವುದೇ ಅನ್ಯಾಯದ ಒತ್ತಾಯಕ್ಕೆ ಮಣಿಯದ ಸ್ವಾಭಿಮಾನಿ ಸ್ವಭಾವ.",
    en: "Steadfast, patient, valuing stability and aesthetics; deliberate in action and deeply self-respecting."
  },
  {
    kn: "ಚುರುಕಾದ ಬುದ್ಧಿಶಕ್ತಿ, ಮಾತುಗಾರಿಕೆ, ಬಹುಮುಖ ಆಸಕ್ತಿಗಳು. ನಿರಂತರ ಹೊಸತನವನ್ನು ಬಯಸುವ, ಏಕತಾನತೆಯನ್ನು ಸಹಿಸದ ಜಿಜ್ಞಾಸು ಮನೋಭಾವ.",
    en: "Intellectually agile, articulate, multi-faceted; curious mindset that detests monotony."
  },
  {
    kn: "ಆಳವಾದ ಭಾವನಾತ್ಮಕತೆ, ಮಮತೆ, ಅದ್ಭುತ ಅಂತಃಪ್ರೇರಣೆ (Intuition). ಕುಟುಂಬದ ರಕ್ಷಣೆ, ನೋವುಗಳನ್ನು ಸುಲಭವಾಗಿ ಮರೆಯದ ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ.",
    en: "Deeply emotional, intuitive, intensely caring towards family; sensitive heart that absorbs surroundings."
  },
  {
    kn: "ಗಾಂಭೀರ್ಯ, ಉದಾರತೆ, ಸಹಜ ನಾಯಕತ್ವ ಮತ್ತು ರಾಜಸಿಕ ಸ್ವಾಭಿಮಾನ. ಅನ್ಯಾಯವನ್ನು ಸಹಿಸದ, ಗೌರವಕ್ಕೆ ಧಕ್ಕೆ ಬಂದರೆ ಸಿಡಿಯುವ ಸಿಂಹ ಸದೃಶ ವ್ಯಕ್ತಿತ್ವ.",
    en: "Regal dignity, magnanimous, commanding presence; fiercely self-respecting and protective of honor."
  },
  {
    kn: "ನಿಖರತೆ, ವಿಶ್ಲೇಷಣಾತ್ಮಕ ದೃಷ್ಟಿ, ಪರಿಶ್ರಮ ಮತ್ತು ಸೇವಾ ಮನೋಭಾವ. ಸೂಕ್ಷ್ಮ ದೋಷಗಳನ್ನೂ ಗುರುತಿಸುವ, ಅತಿಯಾದ ಕಾಳಜಿಯಿಂದ ಚಿಂತೆಗೀಡಾಗುವ ಗುಣ.",
    en: "Meticulous, analytical, hard-working; detail-oriented perfectionist prone to internal overthinking."
  },
  {
    kn: "ನ್ಯಾಯಪ್ರಿಯತೆ, ಸಾಮರಸ್ಯ, ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ರಾಜತಾಂತ್ರಿಕ ನಡೆ. ಸಂಘರ್ಷಗಳನ್ನು ಇಷ್ಟಪಡದ, ನಿರ್ಧಾರಗಳಲ್ಲಿ ತೂಗಿ ನೋಡಿ ಹೆಜ್ಜೆಯಿಡುವ ಜಾಣ್ಮೆ.",
    en: "Justice-seeking, balanced, diplomatic; abhors friction and weighs every decision thoroughly."
  },
  {
    kn: "ತೀವ್ರ ಸಂಕಲ್ಪ, ರಹಸ್ಯಗಳನ್ನು ಭೇದಿಸುವ ಒಳನೋಟ, ಅಚಲ ನಿಷ್ಠೆ. ನೋವುಗಳನ್ನು ಹೊರಹಾಕದೆ ಮನಸ್ಸಿನಲ್ಲೇ ಇಟ್ಟುಕೊಂಡು ಶ್ರಮಿಸುವ ಅಗಾಧ ಶಕ್ತಿ.",
    en: "Unyielding resolve, piercing emotional depth, intense loyalty; keeps feelings private while relentlessly persevering."
  },
  {
    kn: "ತತ್ವಜ್ಞಾನ, ಸತ್ಯನಿಷ್ಠೆ, ಸ್ವಾತಂತ್ರ್ಯ ಪ್ರಿಯತೆ ಮತ್ತು ಆಶಾವಾದ. ನೇರ ನುಡಿ, ಕಪಟವನ್ನು ದ್ವೇಷಿಸುವ ಹಾಗೂ ನಿರಂತರ ಜ್ಞಾನಾರ್ಜನೆಯ ದಾಹ.",
    en: "Philosophical, candid, freedom-loving, optimistic; truth-seeker who despises hypocrisy."
  },
  {
    kn: "ಪ್ರಾಮಾಣಿಕತೆ, ಶಿಸ್ತು, ಕರ್ತವ್ಯನಿಷ್ಠೆ ಮತ್ತು ಅಪಾರ ತಾಳ್ಮೆ. ಕಷ್ಟಗಳನ್ನು ಎದುರಿಸಿ ಹಂತ ಹಂತವಾಗಿ ಶಿಖರವೇರುವ ಅಸಾಧಾರಣ ಸಹಿಷ್ಣುತೆ.",
    en: "Pragmatic, disciplined, duty-bound with immense patience; carries heavy responsibilities with quiet endurance."
  },
  {
    kn: "ದೂರದೃಷ್ಟಿ, ಸ್ವತಂತ್ರ ಆಲೋಚನೆ, ಮಾನವೀಯ ಕಳಕಳಿ. ರೂಢಿಗತ ಕಟ್ಟುಪಾಡುಗಳಿಗೆ ಒಗ್ಗದ, ವಿಶಿಷ್ಟವಾಗಿ ಚಿಂತಿಸುವ ಬೌದ್ಧಿಕ ಚೇತನ.",
    en: "Visionary, unconventional, humanitarian; independent thinker who looks far beyond traditional limitations."
  },
  {
    kn: "ಕರುಣೆ, ಆಧ್ಯಾತ್ಮಿಕ ಒಲವು, ತ್ಯಾಗ ಮನೋಭಾವ ಮತ್ತು ಕಲ್ಪನಾಶಕ್ತಿ. ಪರರ ಕಷ್ಟಗಳಿಗೆ ಮರುಗುವ, ದೈವಭಕ್ತಿ ಹಾಗೂ ಪವಿತ್ರ ಧ್ಯಾನಸ್ಥ ಮನಸ್ಥಿತಿ.",
    en: "Compassionate, spiritual, imaginative; deeply empathetic soul receptive to divine and sacred vibrations."
  }
];

export interface DevoteeKundliComputedData {
  kundli: KundliOutput;
  lagnaName: string;
  lagnaNameEn: string;
  lagnaIdx: number;
  lagnaLord: string;
  lagnaLordHouse: number;
  moonRashi: string;
  moonRashiEn: string;
  rashiIdx: number;
  moonLord: string;
  moonLordHouse: number;
  nakshatra: string;
  nakshatraEn: string;
  pada: number;
  currentDashaText: string;
  currentDashaTextEn: string;
  planetsSummary: string;
  ageYears: number;
  // Deep House Specifics
  house10KarmaSign: string;
  house10KarmaLord: string;
  house10KarmaLordHouse: number;
  house10Planets: string[];
  house6HurdlesSign: string;
  house6HurdlesLord: string;
  house6HurdlesLordHouse: number;
  house6Planets: string[];
  house7MarriageSign: string;
  house7MarriageLord: string;
  house7Planets: string[];
  house8StressSign: string;
  house8StressLord: string;
  house8Planets: string[];
  // 5th House (Santhana / Progeny / Buddhi)
  house5SanthanaSign: string;
  house5SanthanaLord: string;
  house5SanthanaLordHouse: number;
  house5Planets: string[];
  // 4th House (Vidya / Education / Mother)
  house4VidyaSign: string;
  house4VidyaLord: string;
  house4VidyaLordHouse: number;
  house4Planets: string[];
  // Character & Temperament Profile
  characterProfile: DevoteeCharacterProfile;
  isMinorChild: boolean;
  // Transit Shani & Guru from Moon
  shaniTransitHouseFromMoon: number;
  shaniTransitNature: string;
  guruTransitHouseFromMoon: number;
  guruTransitNature: string;
}

/**
 * Calculates full Kundli and astronomical metrics for the devotee
 * Strictly localizes Lagna, Rashi, Nakshatra, Bhavas, and Dasha in the chosen language.
 */
export async function computeDevoteeKundli(
  session: ConsultationSession
): Promise<DevoteeKundliComputedData> {
  const lat = session.lat || 14.5479;
  const lng = session.lng || 74.3188;

  const kundli = await calculateKundliWithPlaceSun(
    {
      name: session.name,
      birthDate: session.dob,
      birthTime: session.tob || "12:00",
      latitude: lat,
      longitude: lng,
      timezoneOffsetMinutes:
        (session.timezone !== undefined ? session.timezone : 5.5) * 60
    },
    {
      ayanamsaModel: "lahiri"
    }
  );

  const lang: ConsultationLanguage = session.language || "kn";
  const pDict = PLANET_NAMES_I18N[lang] || PLANET_NAMES_I18N.kn;

  // 1. Lagna (Ascendant) - Strictly localized according to chosen language
  const lagnaDeg = kundli.ascendant;
  const lagnaIdx = Math.floor((((lagnaDeg % 360) + 360) % 360) / 30) % 12;
  const lagnaName = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[lagnaIdx];
  const lagnaNameEn = RASHIS_I18N.en[lagnaIdx];
  const lagnaLordPlanet = SIGN_LORDS[lagnaIdx];
  const lagnaLord = pDict[lagnaLordPlanet] || lagnaLordPlanet;
  const lagnaLordObj = kundli.planets.find((p) => p.name === lagnaLordPlanet);
  const lagnaLordHouse = lagnaLordObj?.house || 1;

  // 2. Moon Sign (Rashi) - Strictly localized
  const moonPlanet = kundli.planets.find(
    (p: PlanetPosition) => p.name === PlanetName.Moon
  );
  const moonSidereal =
    (((moonPlanet?.degree ?? kundli.ascendant) % 360) + 360) % 360;
  const rashiIdx =
    kundli.moonSign?.index !== undefined
      ? kundli.moonSign.index
      : Math.floor(moonSidereal / 30) % 12;
  const moonRashi = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[rashiIdx];
  const moonRashiEn = RASHIS_I18N.en[rashiIdx];
  const moonLordPlanet = SIGN_LORDS[rashiIdx];
  const moonLord = pDict[moonLordPlanet] || moonLordPlanet;
  const moonLordObj = kundli.planets.find((p) => p.name === moonLordPlanet);
  const moonLordHouse = moonLordObj?.house || 1;

  // 3. Nakshatra & Pada - Strictly localized
  const nakIdx = Math.min(26, Math.floor(moonSidereal / (360 / 27)));
  const nakshatra = (NAKSHATRAS_I18N[lang] || NAKSHATRAS_I18N.kn)[nakIdx];
  const nakshatraEn = NAKSHATRAS_I18N.en[nakIdx];
  const pada =
    kundli.moonPada ||
    Math.min(4, Math.floor((moonSidereal % (360 / 27)) / (360 / 108)) + 1);

  // 4. Age & Dasha Calculation - Strictly localized planet and dasha terms
  const ageYears = ageDecimalYearsAt(
    session.dob,
    session.tob || "12:00",
    lat,
    lng,
    new Date()
  );
  let currentDashaText = "";
  let currentDashaTextEn = "";
  try {
    const bhukti = findBhuktiAtAge(kundli, ageYears);
    if (bhukti) {
      const mahaName = pDict[bhukti.maha.planet] || bhukti.maha.planet;
      const antarName = pDict[bhukti.bhukti] || bhukti.bhukti;
      currentDashaText = `${mahaName} ${pDict.Mahadasha} - ${antarName} ${pDict.Antardasha}`;
      currentDashaTextEn = `${bhukti.maha.planet} Mahadasha - ${bhukti.bhukti} Antardasha`;
    }
  } catch (e) {
    console.warn("[consultationAIEngine] Dasha calculation notice:", e);
  }

  if (!currentDashaText) {
    currentDashaText =
      lang === "kn"
        ? "ಶುಭ ಮಹಾದಶಾ ಕಾಲ"
        : lang === "en"
        ? "Active Planetary Dasha"
        : "शुभ महादशा काल";
    currentDashaTextEn = "Active Planetary Dasha";
  }

  // 5. Planetary Summary text
  const planetsSummary = kundli.planets
    .map(
      (p: PlanetPosition) =>
        `${pDict[p.name] || p.name}: House ${p.house} in ${
          p.rashi.english
        } (${p.degree.toFixed(1)}°)${p.isRetrograde ? " [Retrograde]" : ""}`
    )
    .join(", ");

  // 6. Deep House Calculations
  // 10th House (Karma / Vrutti / Career)
  const house10Idx = (lagnaIdx + 9) % 12;
  const house10KarmaSign = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[house10Idx];
  const house10LordPlanet = SIGN_LORDS[house10Idx];
  const house10KarmaLord = pDict[house10LordPlanet] || house10LordPlanet;
  const house10LordObj = kundli.planets.find((p) => p.name === house10LordPlanet);
  const house10KarmaLordHouse = house10LordObj?.house || 10;
  const house10Planets = kundli.planets
    .filter((p) => p.house === 10)
    .map((p) => pDict[p.name] || p.name);

  // 6th House (Shatru / Roga / Work Hurdles)
  const house6Idx = (lagnaIdx + 5) % 12;
  const house6HurdlesSign = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[house6Idx];
  const house6LordPlanet = SIGN_LORDS[house6Idx];
  const house6HurdlesLord = pDict[house6LordPlanet] || house6LordPlanet;
  const house6LordObj = kundli.planets.find((p) => p.name === house6LordPlanet);
  const house6HurdlesLordHouse = house6LordObj?.house || 6;
  const house6Planets = kundli.planets
    .filter((p) => p.house === 6)
    .map((p) => pDict[p.name] || p.name);

  // 7th House (Kalatra / Marriage / Partner)
  const house7Idx = (lagnaIdx + 6) % 12;
  const house7MarriageSign = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[house7Idx];
  const house7LordPlanet = SIGN_LORDS[house7Idx];
  const house7MarriageLord = pDict[house7LordPlanet] || house7LordPlanet;
  const house7Planets = kundli.planets
    .filter((p) => p.house === 7)
    .map((p) => pDict[p.name] || p.name);

  // 8th House (Randhra / Stress / Obstacles)
  const house8Idx = (lagnaIdx + 7) % 12;
  const house8StressSign = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[house8Idx];
  const house8LordPlanet = SIGN_LORDS[house8Idx];
  const house8StressLord = pDict[house8LordPlanet] || house8LordPlanet;
  const house8Planets = kundli.planets
    .filter((p) => p.house === 8)
    .map((p) => pDict[p.name] || p.name);

  // 7. Shani Gochara (Saturn transit in Aquarius / Kumbha relative to Moon)
  const shaniTransitHouseFromMoon = ((10 - rashiIdx + 12) % 12) + 1;
  let shaniTransitNature = "";
  if (shaniTransitHouseFromMoon === 12) {
    shaniTransitNature =
      lang === "kn"
        ? "ಸಾಡೇ ಸಾತಿ (ಏಳರೆ ಶನಿ - ಮೊದಲ ಹಂತ: ವ್ಯಯ ಶನಿ)"
        : "Sade Sati (Rising Phase - 12th from Moon)";
  } else if (shaniTransitHouseFromMoon === 1) {
    shaniTransitNature =
      lang === "kn"
        ? "ಸಾಡೇ ಸಾತಿ (ಜನ್ಮ ಶನಿ - ಶಿಖರ ಪರೀಕ್ಷಾ ಹಂತ)"
        : "Sade Sati (Peak Janma Phase - on Moon)";
  } else if (shaniTransitHouseFromMoon === 2) {
    shaniTransitNature =
      lang === "kn"
        ? "ಸಾಡೇ ಸಾತಿ (ಅಂತಿಮ ಇಳಿಕೆ ಹಂತ: ಧನ ಶನಿ)"
        : "Sade Sati (Setting Phase - 2nd from Moon)";
  } else if (shaniTransitHouseFromMoon === 4) {
    shaniTransitNature =
      lang === "kn"
        ? "ಕಂಟಕ ಶನಿ (ಅರ್ಧಾಷ್ಟಮ - ೪ನೇ ಮನೆ: ಮಾನಸಿಕ ಆತಂಕ & ವೃತ್ತಿ ಕಷ್ಟ)"
        : "Kantaka Shani (4th from Moon - Career & Mental Strain)";
  } else if (shaniTransitHouseFromMoon === 10) {
    shaniTransitNature =
      lang === "kn"
        ? "ದಶಮ ಕಂಟಕ ಶನಿ (೧೦ನೇ ಮನೆ: ಉದ್ಯೋಗದಲ್ಲಿ ನಿರಂತರ ಒತ್ತಡ & ಕಿರಿಕಿರಿ)"
        : "Kantaka Shani (10th from Moon - Heavy Professional Obstacles & Pressure)";
  } else if (shaniTransitHouseFromMoon === 8) {
    shaniTransitNature =
      lang === "kn"
        ? "ಅಷ್ಟಮ ಶನಿ (೮ನೇ ಮನೆ: ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು & ಕಾರ್ಯವಿಳಂಬ)"
        : "Ashtama Shani (8th from Moon - Unexpected Delays & Roadblocks)";
  } else {
    shaniTransitNature =
      lang === "kn"
        ? `ಗೋಚಾರ ${shaniTransitHouseFromMoon}ನೇ ಮನೆಯ ಶನಿ ಸಂಚಾರ`
        : `Saturn transiting House ${shaniTransitHouseFromMoon} from Moon`;
  }

  // 8. Guru Gochara (Jupiter transit in Taurus / Vrishabha relative to Moon)
  const guruTransitHouseFromMoon = ((1 - rashiIdx + 12) % 12) + 1;
  let guruTransitNature = "";
  if ([2, 5, 7, 9, 11].includes(guruTransitHouseFromMoon)) {
    guruTransitNature =
      lang === "kn"
        ? `ಶುಭ ಗುರುಬಲ (${guruTransitHouseFromMoon}ನೇ ಮನೆ - ದೈವಾನುಗ್ರಹ & ಪರಿಹಾರ)`
        : `Auspicious Guru Transit (House ${guruTransitHouseFromMoon} - Divine Protection)`;
  } else {
    guruTransitNature =
      lang === "kn"
        ? `ಗುರು ಸಂಚಾರ (${guruTransitHouseFromMoon}ನೇ ಮನೆ - ತಾಳ್ಮೆ ಹಾಗೂ ಸತತ ಪ್ರಯತ್ನದ ಕಾಲ)`
        : `Testing Guru Transit (House ${guruTransitHouseFromMoon} - Requires Patience)`;
  }

  // 9. 5th House (Putra / Santhana / Buddhi / Progeny)
  const house5Idx = (lagnaIdx + 4) % 12;
  const house5SanthanaSign = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[house5Idx];
  const house5LordPlanet = SIGN_LORDS[house5Idx];
  const house5SanthanaLord = pDict[house5LordPlanet] || house5LordPlanet;
  const house5LordObj = kundli.planets.find((p) => p.name === house5LordPlanet);
  const house5SanthanaLordHouse = house5LordObj?.house || 5;
  const house5Planets = kundli.planets
    .filter((p) => p.house === 5)
    .map((p) => pDict[p.name] || p.name);

  // 10. 4th House (Vidya / Matru / Education / Mind)
  const house4Idx = (lagnaIdx + 3) % 12;
  const house4VidyaSign = (RASHIS_I18N[lang] || RASHIS_I18N.kn)[house4Idx];
  const house4LordPlanet = SIGN_LORDS[house4Idx];
  const house4VidyaLord = pDict[house4LordPlanet] || house4LordPlanet;
  const house4LordObj = kundli.planets.find((p) => p.name === house4LordPlanet);
  const house4VidyaLordHouse = house4LordObj?.house || 4;
  const house4Planets = kundli.planets
    .filter((p) => p.house === 4)
    .map((p) => pDict[p.name] || p.name);

  // 11. Character & Psychological Temperament Profile
  const tatvaObj = SIGN_TATVAS[lagnaIdx] || SIGN_TATVAS[0];
  const ganaObj = NAKSHATRA_GANAS[nakIdx] || NAKSHATRA_GANAS[0];
  const psychObj = LAGNA_PSYCHOLOGICAL_NATURE[lagnaIdx] || LAGNA_PSYCHOLOGICAL_NATURE[0];
  const isMinorChild = ageYears < 18;

  const characterProfile: DevoteeCharacterProfile = {
    tatva: tatvaObj.kn,
    tatvaEn: tatvaObj.en,
    gana: ganaObj.kn,
    ganaEn: ganaObj.en,
    psychologicalNature: psychObj.kn,
    psychologicalNatureEn: psychObj.en
  };

  return {
    kundli,
    lagnaName,
    lagnaNameEn,
    lagnaIdx,
    lagnaLord,
    lagnaLordHouse,
    moonRashi,
    moonRashiEn,
    rashiIdx,
    moonLord,
    moonLordHouse,
    nakshatra,
    nakshatraEn,
    pada,
    currentDashaText,
    currentDashaTextEn,
    planetsSummary,
    ageYears,
    house10KarmaSign,
    house10KarmaLord,
    house10KarmaLordHouse,
    house10Planets,
    house6HurdlesSign,
    house6HurdlesLord,
    house6HurdlesLordHouse,
    house6Planets,
    house7MarriageSign,
    house7MarriageLord,
    house7Planets,
    house8StressSign,
    house8StressLord,
    house8Planets,
    house5SanthanaSign,
    house5SanthanaLord,
    house5SanthanaLordHouse,
    house5Planets,
    house4VidyaSign,
    house4VidyaLord,
    house4VidyaLordHouse,
    house4Planets,
    characterProfile,
    isMinorChild,
    shaniTransitHouseFromMoon,
    shaniTransitNature,
    guruTransitHouseFromMoon,
    guruTransitNature
  };
}

export interface ActiveDoshaContext {
  hasDosha: boolean;
  doshaId?: string;
  doshaName?: string;
  technicalWhy?: string;
  currentLifeProblems?: string;
  recommendedPooja?: string;
  cardData?: ActiveDoshaCardData;
}

/**
 * Detects whether an active Vedic Dosha is present in the devotee's chart relevant to their question topic
 */
export function detectRelevantQuestionDosha(
  report: ComprehensiveDoshaReport,
  question: string,
  lang: ConsultationLanguage,
  transitInfo?: { shaniHouse?: number; shaniNature?: string; rashiName?: string }
): ActiveDoshaContext {
  const q = question.toLowerCase();

  const isMarriage =
    /ವಿವಾಹ|ಮದುವೆ|ಕಂಕಣ|ವರ|ವಧು|ದಾಂಪತ್ಯ|ಸಂಬಂಧ|ಪತಿ|ಪತ್ನಿ|marriage|marry|wedding|spouse|husband|wife|delay|match|divorce|separation|partner|love|engagement/i.test(
      q
    );
  const isCareerFinance =
    /ವೃತ್ತಿ|ಕೆಲಸ|ಉದ್ಯೋಗ|ವ್ಯಾಪಾರ|ಹಣ|ಸಾಲ|ಆರ್ಥಿಕ|ನಷ್ಟ|ಲಾಭ|ಬಡ್ತಿ|ಕಿರಿಕಿರಿ|ಬೇಸರ|ಹತಾಶೆ|ಸಮಸ್ಯೆ|ಫ್ರಸ್ಟ್ರೇಷನ್|career|job|business|work|promotion|money|wealth|debt|financial|loss|finances|salary|income|frustrat|stagnant/i.test(
      q
    );
  const isHealth =
    /ಆರೋಗ್ಯ|ಕಾಯಿಲೆ|ಖಿನ್ನತೆ|ಮಾನಸಿಕ|ಒತ್ತಡ|ಭಯ|ಶಾಂತಿ|health|illness|disease|depression|stress|anxiety|fear|peace|mental|ailment/i.test(
      q
    );
  const isChildren =
    /ಮಕ್ಕಳು|ಸಂತಾನ|ಪುತ್ರ|ಗರ್ಭ|pregnancy|child|children|progeny|conception|son|daughter|conceive|ಗಂಡು ಮಗು|ಹೆಣ್ಣು ಮಗು|ಮಕ್ಕಳಾಗುತ್ತಿಲ್ಲ|ಸಂತಾನ ವಿಳಂಬ|baby|infant/i.test(
      q
    );

  const detected = report.doshas.filter((d: DetectedDosha) => d.isDetected);

  let matched: DetectedDosha | undefined = undefined;

  if (isMarriage) {
    matched = detected.find(
      (d) =>
        d.id === "kuja_dosha" ||
        d.id === "kala_sarpa_dosha" ||
        d.id === "shrapit_dosha" ||
        d.id === "guru_chandala_dosha" ||
        d.id === "pitru_dosha"
    );
  } else if (isCareerFinance) {
    matched = detected.find(
      (d) =>
        d.id === "gochara_kantaka_shani" ||
        d.id === "gochara_ashtama_shani" ||
        d.id === "gochara_sade_sati" ||
        d.id === "kala_sarpa_dosha" ||
        d.id === "pitru_dosha" ||
        d.id === "shrapit_dosha" ||
        d.id === "guru_chandala_dosha" ||
        d.id === "kemadruma_dosha" ||
        d.id === "dasha_sandhi_dosha"
    );

    // If no specific dosha in report but Saturn transit is critical (Sade Sati, Kantaka, Ashtama)
    if (!matched && transitInfo?.shaniHouse && [12, 1, 2, 4, 8, 10].includes(transitInfo.shaniHouse)) {
      const isSadeSati = [12, 1, 2].includes(transitInfo.shaniHouse);
      const isKantaka = [4, 10].includes(transitInfo.shaniHouse);
      const dName = isSadeSati
        ? lang === "kn"
          ? "ಸಾಡೇ ಸಾತಿ (ಏಳರೆ ಶನಿ) ಪ್ರಭಾವ"
          : "Shani Sade Sati Transit Influence"
        : isKantaka
        ? lang === "kn"
          ? "ದಶಮ / ಕಂಟಕ ಶನಿ ಪ್ರಭಾವ"
          : "Kantaka Shani Transit Influence"
        : lang === "kn"
        ? "ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವ"
        : "Ashtama Shani Transit Influence";

      const tWhy =
        lang === "kn"
          ? `ಜನ್ಮ ರಾಶಿಯಿಂದ ಶನಿ ಗ್ರಹವು ${transitInfo.shaniHouse}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು (${transitInfo.shaniNature || ""}), ಇದು ವೃತ್ತಿ ಹಾಗೂ ಮಾನಸಿಕ ಶಾಂತಿಯ ಮೇಲೆ ತೀವ್ರ ಪರೀಕ್ಷಾ ಪ್ರಭಾವ ಬೀರುತ್ತಿದೆ.`
          : `Saturn's transit in House ${transitInfo.shaniHouse} from Moon (${transitInfo.shaniNature || ""}) casts direct pressure on career, status, and professional stability.`;

      const clp =
        lang === "kn"
          ? "ವೃತ್ತಿಯಲ್ಲಿ ನಿರಂತರ ಕಿರಿಕಿರಿ, ಸಹೋದ್ಯೋಗಿಗಳಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆ, ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ತಡವಾಗುವುದು ಮತ್ತು ಅಸ್ಥಿರತೆಯ ಭಾವನೆ."
          : "Persistent frustration at work, lack of appreciation for hard work, workplace misunderstandings, and financial delays.";

      const pooja =
        lang === "kn"
          ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಎಳ್ಳು ದೀಪಾರಾಧನೆ ಸಹಿತ ಶನಿ ಶಾಂತಿ ಹೋಮ"
          : "Sri Kshetra Gokarna Mahabaleshwara Rudrabhisheka & Sacred Shani Shanti Pooja";

      const cardData: ActiveDoshaCardData = {
        doshaId: "shani_gochara_impact",
        doshaName: dName,
        technicalWhy: tWhy,
        currentLifeProblems: clp,
        recommendedPooja: pooja,
        priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Chief Priest Shreeram Pandit)",
        priestPhone: "9972339362"
      };

      return {
        hasDosha: true,
        doshaId: "shani_gochara_impact",
        doshaName: dName,
        technicalWhy: tWhy,
        currentLifeProblems: clp,
        recommendedPooja: pooja,
        cardData
      };
    }
  } else if (isHealth) {
    matched = detected.find(
      (d) =>
        d.id === "grahan_dosha" ||
        d.id === "balarishta_dosha" ||
        d.id === "kemadruma_dosha" ||
        d.id === "balyagraha_dosha" ||
        d.id === "gochara_ashtama_shani" ||
        d.id === "gochara_sade_sati"
    );
  } else if (isChildren) {
    matched = detected.find(
      (d) =>
        d.id === "pitru_dosha" ||
        d.id === "narayana_bali_dosha" ||
        d.id === "kala_sarpa_dosha" ||
        d.id === "guru_chandala_dosha"
    );

    // If no specific dosha in report, create dedicated Santhana / Progeny obstacle card
    if (!matched) {
      const dName =
        lang === "kn"
          ? "ಸಂತಾನ ತಡೆ ಹಾಗೂ ಪಂಚಮ ಭಾವ ಕರ್ಮ ದೋಷ"
          : lang === "hi"
          ? "संतान बाधा एवं पंचम भाव कर्म दोष"
          : lang === "te"
          ? "సంతాన అడ్డంకి మరియు పంచమ భావ దోషం"
          : lang === "ta"
          ? "சந்தான தடை மற்றும் 5ஆம் பாவ தோஷம்"
          : lang === "ml"
          ? "സന്താന തടസ്സവും പഞ്ചമ ഭാവ ദോഷവും"
          : lang === "mr"
          ? "संतान अडथळा व पंचम भाव दोष"
          : "Santhana Obstacle & 5th House Progeny Constraint";

      const tWhy =
        lang === "kn"
          ? "ಜಾತಕದ ೫ನೇ ಮನೆಯಾದ ಪುತ್ರ/ಸಂತಾನ ಸ್ಥಾನ, ಪಂಚಮಾಧಿಪತಿ ಗ್ರಹ ಹಾಗೂ ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಸ್ಥಿತಿಗತಿಗಳ ಮೇಲೆ ಪಾಪಗ್ರಹಗಳ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಲ್ಲಿ ಕಾಲದ ವಿಳಂಬ ಉಂಟಾಗುತ್ತಿದೆ."
          : lang === "hi"
          ? "कुंडली के 5वें भाव (संतान भाव), पंचमेश एवं पुत्रकारक गुरु पर पापग्रहों के प्रभाव से संतान प्राप्ति में विलंब हो रहा है।"
          : "Testing planetary aspects upon the 5th House of progeny, its ruling lord, or Putrakaraka Jupiter (Guru) causing temporary delays in conception.";

      const clp =
        lang === "kn"
          ? "ವಿವಾಹವಾಗಿ ಹಲವು ಸಮಯ ಕಳೆದರೂ ಸಂತಾನ ಭಾಗ್ಯ ತಡವಾಗುವುದು, ವೈದ್ಯಕೀಯ ವರದಿಗಳು ಸಾಮಾನ್ಯವಾಗಿದ್ದರೂ ಫಲ ಸಿಗದಿರುವುದು ಮತ್ತು ತೀವ್ರ ಮಾನಸಿಕ ಚಿಂತೆ."
          : lang === "hi"
          ? "विवाह के बाद भी संतान प्राप्ति में विलंब, मानसिक तनाव और परिवार में निराशा का वातावरण।"
          : "Persistent delay in conception despite normal medical evaluations, creating deep emotional stress and family anxiety.";

      const pooja =
        lang === "kn"
          ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸಂತಾನ ಗೋಪಾಲ ಮಹಾಹೋಮ ಹಾಗೂ ನಾಗ ಪ್ರತಿಷ್ಠಾ ಸಹಿತ ಮಹಾರುದ್ರಾಭಿಷೇಕ"
          : lang === "hi"
          ? "श्री क्षेत्र गोकर्ण में संतान गोपाल महाहोम एवं नाग प्रतिष्ठा सहित महारुद्राभिषेक"
          : "Sri Kshetra Gokarna Santhana Gopala Maha Homa, Naga Pratishtha & Mahabaleshwara Rudrabhisheka";

      const cardData: ActiveDoshaCardData = {
        doshaId: "santhana_dosha_gokarna",
        doshaName: dName,
        technicalWhy: tWhy,
        currentLifeProblems: clp,
        recommendedPooja: pooja,
        priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Chief Priest Shreeram Pandit)",
        priestPhone: "9972339362"
      };

      return {
        hasDosha: true,
        doshaId: "santhana_dosha_gokarna",
        doshaName: dName,
        technicalWhy: tWhy,
        currentLifeProblems: clp,
        recommendedPooja: pooja,
        cardData
      };
    }
  }

  // If question explicitly asks about doshas or general query with active critical/high severity dosha
  if (!matched && detected.length > 0) {
    const asksAboutDosha =
      /ದೋಷ|ಪರಿಹಾರ|ತೊಂದರೆ|ವಿಳಂಬ|ಯಾಕೆ|ಕಾರಣ|ಅಡೆತಡೆ|ಕಷ್ಟ|ಕರ್ಮ|dosha|curse|parihara|remedy|delay|obstacle|hurdle|why|karma/i.test(
        q
      );
    if (asksAboutDosha || isMarriage || isCareerFinance || isHealth || isChildren) {
      matched =
        detected.find((d) => d.severity === "critical") ||
        detected.find((d) => d.severity === "high") ||
        detected[0];
    }
  }

  if (matched) {
    const langKey = lang as string;
    const dName =
      matched.name[langKey] || matched.name.kn || matched.name.en || matched.id;
    const tWhy =
      matched.technicalWhy[langKey] ||
      matched.technicalWhy.kn ||
      matched.technicalWhy.en ||
      "ಜಾತಕದಲ್ಲಿ ಗ್ರಹಗಳ ಅಶುಭ ಸ್ಥಾನ ಮತ್ತು ದೃಷ್ಟಿ ಯೋಗದಿಂದ ಈ ದೋಷ ಉಂಟಾಗಿದೆ.";
    const clp =
      matched.currentLifeProblems[langKey] ||
      matched.currentLifeProblems.kn ||
      matched.currentLifeProblems.en ||
      "ಕಾರ್ಯಗಳಲ್ಲಿ ನಿರಂತರ ಅಡೆತಡೆ, ವಿಳಂಬ, ಆರ್ಥಿಕ ಹಾಗೂ ಮಾನಸಿಕ ಒತ್ತಡಗಳು ಉಂಟಾಗುತ್ತಿವೆ.";
    const pooja =
      matched.recommendedPooja[langKey] ||
      matched.recommendedPooja.kn ||
      matched.recommendedPooja.en ||
      "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಶಾಂತಿ ಹೋಮ";

    const cardData: ActiveDoshaCardData = {
      doshaId: matched.id,
      doshaName: dName,
      technicalWhy: tWhy,
      currentLifeProblems: clp,
      recommendedPooja: pooja,
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Chief Priest Shreeram Pandit)",
      priestPhone: "9972339362"
    };

    return {
      hasDosha: true,
      doshaId: matched.id,
      doshaName: dName,
      technicalWhy: tWhy,
      currentLifeProblems: clp,
      recommendedPooja: pooja,
      cardData
    };
  }

  return { hasDosha: false };
}

/**
 * Generates an accurate 3 or 4 paragraph Vedic astrological response (5-6 lines per paragraph)
 * in the chosen consultation language using gemini-3.5-flash-lite with retries.
 * Introduces the 4th paragraph exclusively when an active Dosha is identified in the chart.
 */
export async function generateConsultationAnswer(params: {
  session: ConsultationSession;
  userQuestion: string;
  conversationHistory?: AskGeminiChatTurn[];
  apiKey?: string;
  isSubsequentQuestion?: boolean;
  questionIndex?: number;
}): Promise<ConsultationReadingResult> {
  const {
    session,
    userQuestion,
    conversationHistory,
    apiKey,
    isSubsequentQuestion,
    questionIndex
  } = params;

  const isSubsequent = !!isSubsequentQuestion;
  const qNum = (questionIndex !== undefined ? questionIndex : 0) + 1;

  // 1. Astronomical computations
  const astroData = await computeDevoteeKundli(session);
  const {
    kundli,
    lagnaName,
    moonRashi,
    nakshatra,
    pada,
    currentDashaText,
    planetsSummary,
    ageYears,
    house10KarmaSign,
    house10KarmaLord,
    house10KarmaLordHouse,
    house10Planets,
    house6HurdlesSign,
    house6HurdlesLord,
    house6HurdlesLordHouse,
    house6Planets,
    shaniTransitHouseFromMoon,
    shaniTransitNature,
    guruTransitHouseFromMoon,
    guruTransitNature
  } = astroData;

  // 2. Comprehensive Dosha Analysis
  const lat = session.lat || 14.5479;
  const lng = session.lng || 74.3188;
  const timezoneOffsetMinutes =
    (session.timezone !== undefined ? session.timezone : 5.5) * 60;

  let activeDosha: ActiveDoshaContext = { hasDosha: false };
  try {
    const doshaReport = calculateComprehensiveDoshas(
      kundli,
      {
        name: session.name,
        birthDate: session.dob,
        birthTime: session.tob || "12:00",
        latitude: lat,
        longitude: lng,
        timezoneOffsetMinutes
      },
      new Date()
    );
    activeDosha = detectRelevantQuestionDosha(
      doshaReport,
      userQuestion,
      session.language,
      {
        shaniHouse: shaniTransitHouseFromMoon,
        shaniNature: shaniTransitNature,
        rashiName: moonRashi
      }
    );
  } catch (err) {
    console.warn(
      "[consultationAIEngine] ComprehensiveDoshaEngine calculation notice:",
      err
    );
  }

  // 3. Transits (Gochara) for today
  let transitsSummary = `Saturn in Aquarius/Pisces (${shaniTransitNature}), Jupiter in Taurus/Gemini (${guruTransitNature})`;
  try {
    const today = new Date();
    const transits = getTransitsForDate(kundli.moonSign.index, today, "lahiri");
    if (transits) {
      transitsSummary = Object.entries(transits)
        .map(([planet, data]) => `${planet}: House ${data.house} from Moon`)
        .join(", ");
    }
  } catch {
    // Keep fallback
  }

  const targetLang = CONSULTATION_LANG_NAMES[session.language] || "Kannada";

  // 4. Construct Authoritative Vedic Astrological Prompt with Conditional 4th Paragraph
  let doshaSectionPrompt = "";
  if (activeDosha.hasDosha) {
    doshaSectionPrompt = `
ACTIVE DOSHA / KARMIC INFLUENCE IDENTIFIED IN NATIVE'S BIRTH CHART RELEVANT TO QUESTION:
- Identified Dosha/Karma: ${activeDosha.doshaName} (${activeDosha.doshaId})
- Planetary Justification ("Why this Dosha arose in native's chart"): ${activeDosha.technicalWhy}
- Current Real-Life Hardships & Obstacles: ${activeDosha.currentLifeProblems}
- Prescribed Sacred Gokarna Parihara Ritual: ${activeDosha.recommendedPooja}
- Authorized Priest Contact: Sri Shreeram Pandit, Baggona Panchanga, Sri Kshetra Gokarna, Phone: 9972339362 (Direct phone call only, NO WhatsApp).

CRITICAL PARAGRAPH STRUCTURE RULE (EXACTLY 4 PARAGRAPHS - MANDATORY):
Since an active Dosha / Karmic influence is present that directly influences the devotee's question:
You MUST provide EXACTLY 4 well-developed, comprehensive paragraphs.
Each paragraph MUST contain at least 5 to 6 full lines of authentic, deep Vedic astrological analysis.
${
  isSubsequent
    ? `- Paragraph 1: Direct astrological answer addressing THIS NEW QUESTION ("${userQuestion}") based on the specific relevant Bhavas and planetary rulers. ZERO greetings ("ನಮಸ್ಕಾರ / Hello"). ZERO re-reading or mentioning previous questions or older topics. ZERO repeating Lagna, Tatva, Gana, or inborn character profiling. Jump STRAIGHT into the answer!`
    : `- Paragraph 1: Direct astrological answer addressing the devotee's question based on Janma Lagna (${lagnaName}), Moon sign (${moonRashi}), and planetary placements. First connect warmly with fatherly care and mirror their inborn temperament.`
}
- Paragraph 2: In-depth analysis of Bhavas relevant to this question (10th House Karma for career, 7th House for marriage, 5th House for progeny, 6th/8th House for health/hurdles), running Vimshottari Dasha-Bhukti (${currentDashaText}), and Gochara transits (Saturn: ${shaniTransitNature}, Jupiter: ${guruTransitNature}).
- Paragraph 3: Future astrological trajectory, timeline of when hurdles will begin clearing, and practical life advice specifically for "${userQuestion}".
- Paragraph 4 (DEDICATED DOSHA & GOKARNA PARIHARA CHAPTER):
  * State clearly what this ${activeDosha.doshaName} is and explain simply and emotionally why this Dosha has manifested in their birth chart based on planetary positions.
  * Detail what specific hardships, delays, obstacles, and emotional/financial distress this Dosha is causing in their life right now.
  * Explain what sacred Vedic Parihara Pooja must be performed at Sri Kshetra Gokarna (${activeDosha.recommendedPooja}) to neutralize this Dosha.
  * Connect emotionally and reassuringly with the devotee: assure them with absolute certainty that upon performing this sacred Gokarna pooja, they will surely witness genuine relief and positive improvement in their life.
  * Explicitly instruct them to contact chief priest Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and perform this parihara.`;
  } else {
    doshaSectionPrompt = `
CRITICAL PARAGRAPH STRUCTURE RULE (EXACTLY 3 PARAGRAPHS - MANDATORY):
Since NO adverse Dosha is currently obstructing this inquiry:
You MUST provide EXACTLY 3 well-developed, comprehensive paragraphs (at least 5 to 6 full lines each).
${
  isSubsequent
    ? `- Paragraph 1: Direct astrological analysis addressing THIS NEW QUESTION ("${userQuestion}") based on the relevant Bhavas and planetary placements. ZERO greetings ("ನಮಸ್ಕಾರ / Hello"). ZERO re-reading or mentioning previous questions or older topics. ZERO repeating Lagna, Tatva, Gana, or inborn character profiling. Jump straight into the specific answer!`
    : `- Paragraph 1: Direct astrological analysis based on Lagna (${lagnaName}), Moon sign (${moonRashi}), Nakshatra (${nakshatra}), and relevant Bhavas. Connect with fatherly warmth.`
}
- Paragraph 2: In-depth evaluation of the running Vimshottari Dasha-Bhukti (${currentDashaText}) and live Gochara planetary transits (Saturn: ${shaniTransitNature}, Jupiter: ${guruTransitNature}) specifically regarding "${userQuestion}".
- Paragraph 3: Future progression, auspicious timing, and sacred blessings of Sri Mahabaleshwara Gokarna with practical daily spiritual practices (mantras/daana) customized to this question.`;
  }

  const prompt = `You are the revered Senior Head Astrologer & Chief Priest of Sri Baggona Panchanga Jyotishya Sansthana, Sri Kshetra Gokarna (ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಮುಖ್ಯ ದೈವಜ್ಞರು, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ), endowed with over 50 years of tapasya, Vedic chart mastery, and pastoral spiritual guidance.
The devotee is sitting right across from you face-to-face in the sacred sanctum of Gokarna for a private 20-minute spiritual conversation.

========================================================================
CRITICAL MANDATORY INSTRUCTION: 100% EXCLUSIVE FOCUS ON THIS NEW QUESTION
========================================================================
- CURRENT QUESTION TO ANSWER RIGHT NOW: "${userQuestion}"
${
  isSubsequent
    ? `- THIS IS QUESTION #${qNum} IN THE ONGOING CONSULTATION (A SUBSEQUENT QUESTION).
- MANDATORY INSTRUCTION 1 (ZERO RE-READING OR REPEATING OLD QUESTIONS):
  * You MUST NOT re-read, quote, summarize, or reference older questions from earlier turns.
  * NEVER say "ನೀವು ಹಿಂದೆ ಕೇಳಿದಂತೆ...", "As you previously asked...", "Regarding your earlier question...", "In our previous discussion...".
  * Focus 100% of your words on this NEW question: "${userQuestion}".
- MANDATORY INSTRUCTION 2 (ZERO REPEATING INTROS, GREETINGS, OR CHARACTER PROFILING):
  * DO NOT greet ("ನಮಸ್ಕಾರ / ಹಲೋ / Welcome").
  * DO NOT repeat the native's Lagna, Tatva, Gana, Nakshatra, or inborn character description ("ನೀವು ವೃಷಭ ಲಗ್ನ, ರೋಹಿಣಿ ನಕ್ಷತ್ರ, ಪೃಥ್ವಿ ತತ್ವ, ದೇವ ಗಣ..."). The devotee ALREADY heard that in question #1!
  * Jump IMMEDIATELY in Paragraph 1 into the astrological analysis of the specific Bhavas and planetary rulers governing THIS NEW QUESTION!
- MANDATORY INSTRUCTION 3 (ZERO REPEATING OLD TOPICS OR OLD DOSHAS):
  * If the earlier question was about marriage/partner and this question is about career/money/health, DO NOT talk about marriage, partner, or Kuja dosha!
  * Focus exclusively on the domain of "${userQuestion}".`
    : `- THIS IS THE DEVOTEE'S FIRST QUESTION (QUESTION #1).
- Greet them with paternal warmth and briefly mirror their inborn temperament (Tatva: ${astroData.characterProfile.tatva}, Gana: ${astroData.characterProfile.gana}) in Paragraph 1 before directly answering "${userQuestion}".`
}

DEVOTEE BIRTH PROFILE & ASTROLOGICAL COORDINATES (COMPUTED ACCURATELY BY BAGGONA PANCHANGA):
- Name: ${session.name}
- Birth Date & Time: ${session.dob} at ${session.tob}
- Birth Place: ${session.place}
- Current Age: ${Math.floor(ageYears)} years (${astroData.isMinorChild ? "MINOR CHILD - PARENT IS ASKING" : "ADULT DEVOTEE"})
- Native Inborn Temperament & Character Profile (ಕನ್ನಡಿಯಂತಹ ಜನ್ಮ ಸ್ವಭಾವ):
  * Tatva: ${astroData.characterProfile.tatva} (${astroData.characterProfile.tatvaEn})
  * Nakshatra Gana: ${astroData.characterProfile.gana} (${astroData.characterProfile.ganaEn})
  * Astrological Character Disposition: ${astroData.characterProfile.psychologicalNature} (${astroData.characterProfile.psychologicalNatureEn})
- Janma Lagna: ${lagnaName} Lagna (Lord: ${astroData.lagnaLord} in House ${astroData.lagnaLordHouse})
- Janma Rashi (Moon Sign): ${moonRashi} (Lord: ${astroData.moonLord} in House ${astroData.moonLordHouse})
- Janma Nakshatra: ${nakshatra} (Pada ${pada})
- 4th House (Vidya / Matru / Study & Concentration): Sign ${astroData.house4VidyaSign}, Lord ${astroData.house4VidyaLord} placed in House ${astroData.house4VidyaLordHouse}, Planets in 4th: ${astroData.house4Planets.join(", ") || "None"}
- 5th House (Santhana / Buddhi / Poorva Punya / Progeny): Sign ${astroData.house5SanthanaSign}, Lord ${astroData.house5SanthanaLord} placed in House ${astroData.house5SanthanaLordHouse}, Planets in 5th: ${astroData.house5Planets.join(", ") || "None"}
- 10th House (Karma / Career): Sign ${house10KarmaSign}, Lord ${house10KarmaLord} placed in House ${house10KarmaLordHouse}, Planets in 10th: ${house10Planets.join(", ") || "None"}
- 6th House (Shatru / Roga / Hurdles): Sign ${house6HurdlesSign}, Lord ${house6HurdlesLord} placed in House ${house6HurdlesLordHouse}, Planets in 6th: ${house6Planets.join(", ") || "None"}
- Current Running Dasha-Bhukti: ${currentDashaText}
- Live Saturn (Shani) Gochara: House ${shaniTransitHouseFromMoon} from Moon (${shaniTransitNature})
- Live Jupiter (Guru) Gochara: House ${guruTransitHouseFromMoon} from Moon (${guruTransitNature})
- Exact Natal Planetary Placements (Bhavas 1 to 12): ${planetsSummary}
- Live Gochara (Planetary Transits): ${transitsSummary}

DEVOTEE WORDS / QUESTION:
"${userQuestion}"
${doshaSectionPrompt}

SACRED BEHAVIORAL PROTOCOL (THE 50+ YEAR EXPERIENCED GOKARNA MASTER ASTROLOGER - "DAIVA VACHANA"):
1. "DAIVA VACHANA" (HOLY DIVINE WORDS & EMOTIONAL CONNECTION):
   - Your words carry the spiritual aura, comfort, and solemn authority of divine oracle words (ದೈವ ವಚನ).
   - If the devotee is asking about frustration in career (ಉದ್ಯೋಗದಲ್ಲಿ ಕಿರಿಕಿರಿ / ಹತಾಶೆ), delay in marriage, or deep trouble:
     * FIRST, emotionally connect with them. Validate their pain with fatherly love and warmth ("ಮಗುವೇ ${session.name}, ನಿಮ್ಮ ಮನಸ್ಸಿನ ಕಳವಳ ಮತ್ತು ಆತಂಕವನ್ನು ನಾನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬಲ್ಲೆ...").
     * Give the EXACT astrological reason why this is happening (10th house, Dasha, Shani Gochara transit).
     * Clearly tell them what to do to come out of it and the timeline of relief.
     * The devotee should feel a holy reverence, fatherly affection, and complete reassurance that their life is under divine protection.

2. NATIVE'S INBORN CHARACTERISTIC & TEMPERAMENT MIRRORING (ಕನ್ನಡಿಯಂತಹ ಜನ್ಮ ಸ್ವಭಾವ):
${
  isSubsequent
    ? `   - STRICT PROHIBITION: Since this is question #${qNum}, DO NOT repeat the inborn character profiling or Tatva/Gana basics. Go straight into the specific Bhavas and planetary rulers governing "${userQuestion}".`
    : `   - In Paragraph 1, dynamically reflect the native's true inborn character and temperament based on their Lagna Tatva (${astroData.characterProfile.tatva}) and Nakshatra Gana (${astroData.characterProfile.gana}).
   - The native must immediately sense that you are describing their exact inner soul and thought patterns ("ಕನ್ನಡಿಯಂತಹ ನಿಖರ ಸ್ವಭಾವ"), making them feel deeply understood and completely hooked.`
}

3. MINOR CHILD / PARENT INQUIRY PROTOCOL (STRICT MANDATORY RULE):
${astroData.isMinorChild ? `   - CRITICAL: The devotee profile is a MINOR CHILD (${Math.floor(ageYears)} years old, e.g. 12-year-old child)!
   - The person sitting in front of you and asking questions is the CHILD'S PARENT (ತಂದೆ / ತಾಯಿ / ಪೋಷಕರು).
   - YOU MUST ADDRESS THE PARENTS REVERENTLY AND COMPASSIONATELY ("ಆತ್ಮೀಯ ಪೋಷಕರೇ / ಪಾಲಕರೇ...", "Dear Parents...").
   - FOCUS EXCLUSIVELY ON:
     1) 4th House Vidya Sthana (${astroData.house4VidyaSign} ruled by ${astroData.house4VidyaLord}) and 5th House Buddhi (${astroData.house5SanthanaSign} ruled by ${astroData.house5SanthanaLord}): Learning, concentration, memory power, academic exams, and creative potential.
     2) Health, Immunity & Balarishta Protection: Protecting the child from evil eye (ದೃಷ್ಟಿ ದೋಷ), childhood ailments, and blessing them with Medha Sukta and Saraswati Mantra.
     3) Parental Nurturing Guidance: Instruct the parents on how to handle the child's natural temperament (based on their ${astroData.characterProfile.tatva} and ${astroData.characterProfile.gana}) with loving patience rather than harsh scolding or academic pressure.
   - STRICT PROHIBITION: NEVER discuss adult romance, love marriage, romantic partners, or adult career anxieties with or for a minor child!
` : `   - If an adult is asking about their minor child, follow the same parental guidance, education, and health rules without adult romantic content.`}

4. TABOO, SENSITIVE & PRIVATE QUESTIONS (SEXUALITY, BEDROOM HARMONY, LIBIDO, VITALITY):
   - Devotees use this private 20-minute consultation because it offers complete confidentiality for intimate questions they cannot ask in public due to shyness (ನಾಚಿಕೆ / ಭಯ / ಸಂಕೋಚ).
   - If the question touches intimacy, sexual weakness, bed pleasure, libido, or secret guilt:
     * Approach with the utmost paternal purity, Vedic dignity, and Ayurvedic understanding.
     * Explain the role of the 8th House (Vitality & Guptasthana), 7th House (Intimacy), 12th House (Shayana Sukha / Bedroom Peace), and Shukra Dhatu (Venusian vital essence).
     * Remove feelings of guilt or shame ("ಕಾಮವು ಪ್ರಕೃತಿಯ ಸಹಜ ಸೃಷ್ಟಿ ಶಕ್ತಿ, ಇದರಲ್ಲಿ ಅಪರಾಧ ಭಾವ ಅನಗತ್ಯ...").
     * Prescribe Ayurvedic lifestyle (Sattvic food, milk, Ashwagandha, Pranayama) and Sri Gokarna Mahabaleshwara Rudrabhisheka for nervous and hormonal rejuvenation.

5. SANTHANA (PROGENY / CHILDBIRTH / SON) SENSITIVITY:
   - If the devotee is asking about progeny, delay in conceiving, or blessing of a son:
     * Analyze the 5th House (${astroData.house5SanthanaSign} ruled by ${astroData.house5SanthanaLord} in House ${astroData.house5SanthanaLordHouse}), Putrakaraka Jupiter (Guru), and 9th House of Bhagya.
     * Comfort the couple with great compassion; remove despair and provide astrological timelines.
     * Prescribe Sri Kshetra Gokarna Santhana Gopala Maha Homa & Naga Pratishtha, and direct them to contact Shreeram Pandit at 9972339362.

6. 100% ACCURATE ASTROLOGY (STRICTLY ZERO BLUFFING, ZERO HALLUCINATION):
   - Ground every statement in their actual chart data above (Lagna, Rashi, Bhavas, Dasha, Gochara).
   - Do NOT make generic guesses. Use the exact computed planetary positions.

7. LANGUAGE & INSTITUTION INTEGRITY:
   - Always acknowledge Sri Baggona Panchanga (ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ) and Sri Kshetra Gokarna (ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) as the sacred root of this astrological calculation.
   - You MUST respond 100% EXCLUSIVELY in the ${targetLang} language, using its authentic native script (Kannada script for Kannada, Devanagari script for Hindi/Marathi, Telugu script for Telugu, Tamil script for Tamil, Malayalam script for Malayalam, English for English).
   - Absolutely NO Latin transliteration or mixed English tokens when responding in Indian languages.

8. TONE & DELIVERY:
   - Warm, dignified, spiritually authoritative, compassionate, and deeply comforting.
   - DO NOT use markdown symbols like * or # as this text will be read aloud by the priest voice engine.

9. ONGOING CONVERSATION FLOW (NO REPEATED GREETINGS & ZERO RE-READING OLD QUESTIONS):
   - The opening welcome and introduction ("ನಮಸ್ಕಾರ... ನಾನು ಶ್ರೀರಾಮ್ ಪಂಡಿತ್...") have ALREADY been delivered at the start of this 20-minute consultation.
   - Therefore, do NOT repeat greetings like "ನಮಸ್ಕಾರ...", "Hello", "Welcome", or re-introduce yourself in subsequent turns.
   - ABSOLUTE PROHIBITION ON RE-READING OR REPEATING OLD QUESTIONS: Never say "ನೀವು ಹಿಂದೆ ಕೇಳಿದಂತೆ...", "As you previously asked...", "Regarding your earlier question...". Focus 100% on "${userQuestion}".
   - Directly, respectfully, and compassionately answer this specific question as an ongoing, continuous face-to-face dialogue.`;

  let responseText = "";
  // Robust API key resolution: check parameter -> store -> build environment VITE_GEMINI_API_KEY
  const effectiveApiKey = (
    apiKey !== undefined
      ? apiKey
      : useAppStore.getState?.()?.geminiApiKey ||
        (typeof import.meta !== "undefined"
          ? (import.meta as any).env?.VITE_GEMINI_API_KEY
          : "") ||
        ""
  ).trim();

  if (!effectiveApiKey) {
    responseText = generateDeterministicFallbackReading(
      session,
      userQuestion,
      lagnaName,
      moonRashi,
      nakshatra,
      currentDashaText,
      activeDosha,
      astroData,
      isSubsequent,
      params.questionIndex
    );
  } else {
    try {
      responseText = await askGemini(
        userQuestion,
        prompt,
        effectiveApiKey,
        session.language,
        {
          raw: true,
          temperature: 0.3,
          retries: 3,
          retryDelay: 2000,
          conversationHistory
        }
      );
    } catch (err) {
      console.warn(
        "[consultationAIEngine] Gemini API notice, engaging deterministic fallback:",
        err
      );
      responseText = generateDeterministicFallbackReading(
        session,
        userQuestion,
        lagnaName,
        moonRashi,
        nakshatra,
        currentDashaText,
        activeDosha,
        astroData,
        isSubsequent,
        params.questionIndex
      );
    }
  }

  // Clean any markdown formatting artifacts
  const cleaned = responseText
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/[#_]/g, "")
    .trim();

  // Split into paragraphs
  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return {
    fullText: cleaned,
    paragraphs: paragraphs.length > 0 ? paragraphs : [cleaned],
    hasDosha: activeDosha.hasDosha,
    doshaName: activeDosha.doshaName,
    doshaParihara: activeDosha.recommendedPooja,
    activeDoshaCard: activeDosha.cardData,
    astrologicalHighlights: {
      lagna: lagnaName,
      moonSign: moonRashi,
      nakshatra: `${nakshatra} (ಪಾದ ${pada})`,
      currentDasha: currentDashaText,
      keyInfluences: [
        `${lagnaName} ಲಗ್ನ & ${moonRashi} ರಾಶಿ`,
        `ಪ್ರಸ್ತುತ: ${currentDashaText}`,
        activeDosha.hasDosha
          ? `ದೋಷ ಪರಿಹಾರ: ${activeDosha.doshaName}`
          : `ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಣೆ`
      ]
    }
  };
}

/**
 * Deterministic fallback reading ensuring 100% availability even without an API key.
 * Adapts to greetings, conversational questions, career frustration, minor children/parent inquiries,
 * sensitive Santhana questions, intimate taboo queries, and full 3/4-paragraph astrological inquiries.
 */
function generateDeterministicFallbackReading(
  session: ConsultationSession,
  question: string,
  lagna: string,
  rashi: string,
  nakshatra: string,
  dasha: string,
  activeDosha: ActiveDoshaContext,
  astroData?: DevoteeKundliComputedData,
  isSubsequentQuestion?: boolean,
  questionIndex?: number
): string {
  const isSubsequent = !!isSubsequentQuestion || (questionIndex !== undefined && questionIndex > 0);
  const q = question.trim().toLowerCase();
  const isGreeting =
    /^(ನಮಸ್ಕಾರ|ಹಲೋ|ಹೇಗಿದ್ದೀರಿ|ಗುರೂಜಿ|ಸ್ವಾಮಿ|hello|hi|namaste|how are you|pranam|namaskara)/i.test(
      q
    );
  const isCareerFrustration =
    /ವೃತ್ತಿ|ಕೆಲಸ|ಉದ್ಯೋಗ|ವ್ಯಾಪಾರ|ಕಿರಿಕಿರಿ|ಬೇಸರ|ಹತಾಶೆ|ಫ್ರಸ್ಟ್ರೇಷನ್|career|job|work|business|frustrat/i.test(
      q
    );
  const isSanthana =
    /ಸಂತಾನ|ಪುತ್ರ|ಮಕ್ಕಳು|ಗರ್ಭ|pregnancy|child|children|progeny|conception|son|daughter|conceive|ಗಂಡು ಮಗು|ಹೆಣ್ಣು ಮಗು|ಮಕ್ಕಳಾಗುತ್ತಿಲ್ಲ|ಸಂತಾನ ವಿಳಂಬ|baby|infant/i.test(
      q
    );
  const isSecretIntimate =
    /ಸೆಕ್ಸ್|ಕಾಮ|ಲೈಂಗಿಕ|ವೀರ್ಯ|ಶಿಶ್ನ|ಶೀಘ್ರಸ್ಖಲನ|ಅಕ್ರಮ ಸಂಬಂಧ|ಬೇರೊಬ್ಬರ ಮೇಲೆ ಆಕರ್ಷಣೆ|extra[ -]?marital|affair|cheating|sex|libido|intimacy|sexual|erection|premature|bedroom secret/i.test(
      q
    );

  const isMinorChild = !!astroData?.isMinorChild;
  const tatva = astroData?.characterProfile?.tatva || "ಸ್ಥಿರ";
  const tatvaEn = astroData?.characterProfile?.tatvaEn || "Steadfast";
  const gana = astroData?.characterProfile?.gana || "ಮನುಷ್ಯ";
  const ganaEn = astroData?.characterProfile?.ganaEn || "Manushya";
  const psychNature = astroData?.characterProfile?.psychologicalNature || "";
  const psychNatureEn = astroData?.characterProfile?.psychologicalNatureEn || "";
  const house4Sign = astroData?.house4VidyaSign || "೪ನೇ ಮನೆ";
  const house4Lord = astroData?.house4VidyaLord || "ವಿದ್ಯಾಧಿಪತಿ";
  const house5Sign = astroData?.house5SanthanaSign || "೫ನೇ ಮನೆ";
  const house5Lord = astroData?.house5SanthanaLord || "ಪಂಚಮಾಧಿಪತಿ";
  const shaniText = astroData?.shaniTransitNature || "ಗೋಚಾರ ಶನಿ ಪ್ರಭಾವ";
  const karmaLord = astroData?.house10KarmaLord || "ಕರ್ಮಾಧಿಪತಿ";

  // English Locale Fallbacks
  if (session.language === "en") {
    if (isGreeting) {
      if (isSubsequent) {
        return `I am right here with you in this sacred consultation. Please continue with your question or life situation whenever you are ready.`;
      }
      return `Hari Om ${session.name}! May Lord Mahabaleshwara and Lord Ganapati of Sri Kshetra Gokarna bestow their divine grace and blessings upon you and your family.\n\nI am sitting with you here in this sacred 20-minute consultation. Please feel at complete peace. You can open your heart and ask any question regarding your life, career, marriage, health, or family dilemmas.`;
    }

    // Minor Child (< 18 yrs) -> Address Parents Reverently
    if (isMinorChild) {
      const p1Child = isSubsequent
        ? `Regarding your inquiry on "${question}", examining the child's 4th house of education (${house4Sign}) and 5th house of intellect (${house5Sign}) along with ruling planet ${house4Lord}, the chart reveals strong latent potential that will blossom wonderfully with patient, nurturing encouragement.`
        : `Dear Parents, examining the sacred birth chart of your child (${session.name}) calculated with Baggona Panchanga, the child is born in ${lagna} Lagna and ${rashi} Moon sign with ${nakshatra} Nakshatra. The child's natural temperament is shaped by the ${tatvaEn} element and ${ganaEn} Gana: ${psychNatureEn || "curious, perceptive, and sensitive"}. Regarding your inquiry on "${question}", the child's 4th house of education (${house4Sign}) and 5th house of intellect (${house5Sign}) indicate tremendous latent potential that will blossom wonderfully with patient, nurturing encouragement.`;
      const p2Child = `Looking into the child's cognitive focus and memory retention, ruling planet ${house4Lord} governs grasping power and foundational learning. Occasional restlessness, exam anxiety, or playful distraction is a natural expression of this astrological temperament. As mindful parents, avoiding comparative pressure or harsh discipline and instead creating an organized, peaceful study atmosphere will produce remarkable academic excellence. The prevailing period of ${dasha} actively supports cognitive growth.`;
      const p3Child = `For physical immunity, academic sharpness, and protection against the evil eye (drishti dosha), lighting a pure cow-ghee lamp at study time and chanting the sacred Maha Saraswati Gayatri or Medha Sukta is highly auspicious. Offering prayers at Sri Kshetra Gokarna Mahaganapati for the child's well-being will bestow razor-sharp concentration, academic success, and long life.`;

      if (activeDosha.hasDosha) {
        const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: A thorough examination reveals the presence of ${
          activeDosha.doshaName || "Karmic Dosha"
        }. This dosha arose because of specific planetary tensions in the child's chart (${
          activeDosha.technicalWhy || "unfavorable aspect on cardinal houses"
        }), which can manifest as occasional health vulnerability, stubbornness, or exam nervousness. To neutralize these adverse vibrations, our scriptures prescribe the sacred ${
          activeDosha.recommendedPooja ||
          "Sri Kshetra Gokarna Medha Sukta & Maha Saraswati Vidya Pooja"
        }. Performing this sacred pooja will bring peace of mind, sharp memory, and protective blessings to your child. Please directly call chief priest Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and perform this parihara.`;
        return `${p1Child}\n\n${p2Child}\n\n${p3Child}\n\n${p4Dosha}`;
      }
      return `${p1Child}\n\n${p2Child}\n\n${p3Child}`;
    }

    // Santhana / Progeny / Childbirth Query
    if (isSanthana) {
      const p1Santhana = isSubsequent
        ? `Regarding your inquiry on progeny and conception ("${question}"), examining your 5th house of progeny (${house5Sign}) and Putrakaraka Jupiter (Guru), this phase indicates a temporary karmic transit delay that demands emotional calm and mutual harmony alongside medical care.`
        : `My child ${session.name}, I understand the deep yearning, emotional anxiety, and societal questions surrounding progeny and conceiving a child in your marital life. According to your birth chart calculated with Baggona Panchanga (${lagna} Lagna, ${rashi} Moon Sign with ${nakshatra} Nakshatra), your 5th house of progeny (${house5Sign}) and Putrakaraka Jupiter (Guru) are undergoing a karmic testing phase, which explains the temporary delay despite medical normalcy.`;
      const p2Santhana = `Examining the 5th house lord (${house5Lord}) and the current Vimshottari period of ${dasha}, planetary tensions have created energetic friction in conceiving. In Vedic wisdom, conception requires the harmonious union of medical health and celestial grace (Daiva Bala). Shed all despondency and mutual blame. When the appropriate karmic remedies are conducted, the doors of parenthood will surely open wide.`;
      const p3Santhana = `Upcoming planetary transits over the next lunar cycles indicate a fertile and auspicious turning point. Maintain physical vitality through pure sattvic nourishment and mutual affection. For divine blessings of noble progeny, chanting the Sri Santhana Gopala Mantra daily with devotion will dissolve all reproductive anxieties and herald joyous news.`;

      if (activeDosha.hasDosha) {
        const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: A thorough examination of your horoscope reveals the presence of ${
          activeDosha.doshaName || "Santhana Obstacle & 5th House Progeny Constraint"
        }. This dosha arose because of specific planetary tensions in your chart (${
          activeDosha.technicalWhy || "unfavorable placement in 5th house"
        }), which is actively manifesting in your life right now as persistent delays in childbirth. To permanently neutralize these adverse vibrations, our scriptures prescribe the sacred ${
          activeDosha.recommendedPooja ||
          "Sri Kshetra Gokarna Santhana Gopala Maha Homa & Naga Pratishtha"
        }. We reassure you with certainty that performing this sacred pooja with pure devotion will bring noticeable improvement and joyous progeny blessing. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and receive this divine parihara.`;
        return `${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\n${p4Dosha}`;
      }
      return `${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}`;
    }

    // Secret Intimate / Sexuality Query
    if (isSecretIntimate) {
      const p1Intimate = isSubsequent
        ? `Regarding this intimate matter ("${question}"), in Vedic Jyotisha, the placement of Shukra (Venus), the 7th house of harmony, and the 8th house govern these private vital energies. Approaching this with scientific calm rather than guilt is the key to restoration.`
        : `Dear ${session.name}, in the Vedic worldview, Kama (vital desire, healthy intimacy, and conjugal pleasure) is revered as one of the four sacred Purusharthas. In our society, people often feel immense shyness, taboo, or guilt regarding sexual vitality and bedroom discord. Please be at total ease. As an experienced Vedic astrologer, I view this with fatherly compassion and scientific clarity. Your ${lagna} Lagna and the placement of Shukra (Venus) govern your emotional and vital responses.`;
      const p2Intimate = `In your astrological chart, the 8th house governs reproductive vitality, the 7th house rules conjugal harmony, and the 12th house oversees bedroom tranquility (shayana sukha). Under the running period of ${dasha}, mental exhaustion, performance anxiety, and nervous fatigue are causing temporary fluctuation in Shukra Dhatu (vitality). This is strictly a temporary psychosomatic stress imbalance, not a permanent defect. Releasing toxic guilt and adopting an Ayurvedic regimen of Ashwagandha, milk, and pranayama will rejuvenate your vigor.`;
      const p3Intimate = `Over the upcoming transit cycle, emotional bonding with your partner will deepen. Approach intimacy with calm affection rather than pressure. Offering sacred cow-milk prayers to Lord Mahabaleshwara at Sri Kshetra Gokarna will harmonize hormonal balance, bestow peaceful sleep, and restore deep romantic harmony in your relationship.`;

      if (activeDosha.hasDosha) {
        const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: An examination of your chart reveals the presence of ${
          activeDosha.doshaName || "Karmic Dosha"
        } (${activeDosha.technicalWhy || "planetary stress on cardinal houses"}). To restore tranquil intimacy and vitality, our scriptures prescribe the sacred ${
          activeDosha.recommendedPooja ||
          "Sri Kshetra Gokarna Mahabaleshwara Rudrabhisheka"
        }. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) for personal guidance.`;
        return `${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\n${p4Dosha}`;
      }
      return `${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}`;
    }

    if (isCareerFrustration) {
      const p1Career = isSubsequent
        ? `Regarding your career and workplace concerns ("${question}"), the active period of ${dasha} combined with ${shaniText} is currently demanding endurance and perseverance. Examining your 10th house of profession (governed by ${karmaLord}), temporary delays are testing your resolve rather than blocking your long-term success.`
        : `My child ${session.name}, I understand the burden, anxiety, and frustration you are feeling in your career right now. According to your birth chart calculated with Baggona Panchanga (${lagna} Lagna, ${rashi} Moon Sign with ${nakshatra} Nakshatra), your inborn nature is characterized by the ${tatvaEn} element and ${ganaEn} Gana: ${psychNatureEn || "deeply capable and hardworking"}. This difficult phase is a celestial churning. The active period of ${dasha} combined with ${shaniText} is testing your endurance, which explains why workplace recognition has been delayed despite your earnest efforts.`;
      const p2Career = `Examining your 10th house of profession (ruled by ${karmaLord}) and the 6th house of obstacles, the cosmic energies are demanding patience rather than impulsive reactions. Avoid hasty resignations or heated workplace friction. Astrological calculations indicate that the forthcoming planetary movements favor stability, long-term investments, and collaborative harmony. Maintaining mental equilibrium during this cycle will unlock substantial prosperity.`;
      const p3Career = `The planetary transits over the coming lunar cycles indicate a progressive turning point. When Jupiter casts its divine benefic aspect upon your key natal houses, the confusion that clouding your decisions will dissolve into crystalline clarity. Continue your earnest efforts with disciplined patience, for the cosmic timing is aligning to reward your dedication.`;

      if (activeDosha.hasDosha) {
        const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: A thorough examination of your horoscope reveals the presence of ${
          activeDosha.doshaName || "Karmic Dosha"
        }. This dosha arose because of specific planetary tensions in your chart (${
          activeDosha.technicalWhy || "unfavorable placement in cardinal houses"
        }), which is actively manifesting in your life right now as persistent delays, unexpected obstacles, and emotional restlessness. To permanently neutralize these adverse vibrations, our scriptures prescribe the sacred ${
          activeDosha.recommendedPooja ||
          "Sri Kshetra Gokarna Shanti Pooja and Rudrabhisheka"
        }. We reassure you with certainty that performing this sacred pooja with pure devotion will bring noticeable improvement, peace, and auspicious results in your life. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and receive this divine parihara.`;
        return `${p1Career}\n\n${p2Career}\n\n${p3Career}\n\n${p4Dosha}`;
      }
      return `${p1Career}\n\n${p2Career}\n\n${p3Career}`;
    }

    const baseP1 = isSubsequent
      ? `Regarding your inquiry on "${question}", planetary combinations indicate that the current period governed by ${dasha} is bringing pivotal transformations. The ruling planet of your ascendant provides strong foundational resilience, while transiting planetary aspects require calm patience in key decisions.`
      : `Namaste ${session.name}. According to your birth chart calculated with Baggona Panchanga, you are born in ${lagna} Lagna and ${rashi} Moon Sign with ${nakshatra} Nakshatra (${tatvaEn} element, ${ganaEn} Gana). Regarding your question on "${question}", your planetary combinations indicate that the current period governed by ${dasha} is bringing significant pivotal transformations. The ruling planet of your ascendant provides strong foundational resilience, while transiting Jupiter and Saturn require patience in key negotiations.`;
    const baseP2 = `In the realm of your personal and professional endeavors, your chart reveals gradual clearance of previous hurdles. Astrological calculations indicate that the forthcoming planetary movements favor stability, long-term investments, and collaborative harmony. Maintaining mental equilibrium and avoiding hasty impulsive commitments during this cycle will unlock substantial prosperity.`;
    const baseP3 = `The planetary transits over the coming lunar cycles indicate a progressive turning point. When Jupiter casts its divine benefic aspect upon your key natal houses, the confusion that clouding your decisions will dissolve into crystalline clarity. Continue your earnest efforts with disciplined patience, for the cosmic timing is aligning to reward your dedication.`;

    if (activeDosha.hasDosha) {
      const p4Dosha = `VEDIC DOSHA & GOKARNA PARIHARA GUIDANCE: A thorough examination of your horoscope reveals the presence of ${
        activeDosha.doshaName || "Kuja/Manglik Dosha"
      }. This dosha arose because of specific planetary tensions in your chart (${
        activeDosha.technicalWhy || "unfavorable placement in cardinal houses"
      }), which is actively manifesting in your life right now as persistent delays, unexpected obstacles, and emotional restlessness. To permanently neutralize these adverse vibrations, our scriptures prescribe the sacred ${
        activeDosha.recommendedPooja ||
        "Sri Kshetra Gokarna Shanti Pooja and Rudrabhisheka"
      }. We reassure you with certainty that performing this sacred pooja with pure devotion will bring noticeable improvement, peace, and auspicious results in your life. Please directly call chief astrologer Shreeram Pandit at 9972339362 (Sri Kshetra Gokarna) to schedule and receive this divine parihara.`;
      return `${baseP1}\n\n${baseP2}\n\n${baseP3}\n\n${p4Dosha}`;
    }

    return `${baseP1}\n\n${baseP2}\n\nFor divine grace and obstacle removal, it is auspicious to offer prayers to Sri Mahabaleshwara and Lord Ganapati at Sri Kshetra Gokarna. Reciting the sacred Gayatri Mantra and lighting a pure cow-ghee lamp on Mondays or Saturdays will harmonize the prevailing planetary energies and bring peace and success.`;
  }

  // Kannada Default Fallback
  if (isGreeting) {
    if (isSubsequent) {
      return `ಹೌದು, ನಾನು ನಿಮ್ಮೊಂದಿಗೇ ಈ ಸಮಾಲೋಚನಾ ಕೊಠಡಿಯಲ್ಲಿದ್ದೇನೆ. ನಿಮ್ಮ ಮುಂದಿನ ಪ್ರಶ್ನೆ ಅಥವಾ ಗೊಂದಲವನ್ನು ಮುಕ್ತವಾಗಿ ತಿಳಿಸಿ.`;
    }
    return `ಹರಿ ಓಂ ${session.name} ಅವರೇ! ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸಕಲ ಕೃಪಾಕಟಾಕ್ಷ ಆಶೀರ್ವಾದಗಳು ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬದ ಮೇಲೆ ಸದಾ ಇರಲಿ.\n\nನಿಮಗಾಗಿ ನಿಗದಿಪಡಿಸಲಾದ ಈ ೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಕೊಠಡಿಯಲ್ಲಿ ನಾನು ನಿಮ್ಮೊಂದಿಗಿದ್ದೇನೆ. ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಯಾವುದೇ ಗೊಂದಲ, ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ, ವಿವಾಹ, ಕೌಟುಂಬಿಕ ವಿಚಾರ ಅಥವಾ ದೋಷ ಪರಿಹಾರಗಳ ಕುರಿತು ಮುಕ್ತವಾಗಿ ಪ್ರಶ್ನಿಸಿ.`;
  }

  // Minor Child (< 18 yrs) -> Address Parents Reverently
  if (isMinorChild) {
    const p1Child = isSubsequent
      ? `ಮಗುವಿನ "${question}" ಎಂಬ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದಲ್ಲಿ ೪ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ (${house4Sign}) ಹಾಗೂ ೫ನೇ ಬುದ್ಧಿ ಸ್ಥಾನಗಳನ್ನು (${house5Sign}) ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ವಿದ್ಯಾಧಿಪತಿಯಾದ ${house4Lord} ಗ್ರಹದ ಪ್ರಭಾವದಿಂದ ಮಗುವಿನಲ್ಲಿ ಉತ್ತಮ ಕಲಿಯುವ ಆಸಕ್ತಿಯಿದೆ. ತಾಳ್ಮೆಯಿಂದ ಪ್ರೋತ್ಸಾಹಿಸಿದರೆ ಮಗುವು ಶೈಕ್ಷಣಿಕವಾಗಿ ಉತ್ತಮ ಯಶಸ್ಸು ಸಾಧಿಸಲಿದೆ.`
      : `ಆತ್ಮೀಯ ಪೋಷಕರೇ, ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯದ ಶಾಸ್ತ್ರೋಕ್ತ ಗಣಿತದ ಪ್ರಕಾರ ನಿಮ್ಮ ಮಗುವಿನ (${session.name}) ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಮಗುವು ${lagna} ಲಗ್ನ, ${rashi} ರಾಶಿ ಹಾಗೂ ${nakshatra} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನ್ಮತಾಳಿದೆ. ಮಗುವಿನ ಲಗ್ನ ತತ್ವವಾದ ${tatva} ಹಾಗೂ ${gana} ಗಣದ ಪ್ರಭಾವದಿಂದಾಗಿ ಮಗುವಿನಲ್ಲಿ ${psychNature || "ಚುರುಕಾದ ಬುದ್ಧಿಶಕ್ತಿ, ಸಹಜ ಕುತೂಹಲ ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ"} ಎದ್ದು ಕಾಣುತ್ತದೆ. ನಿಮ್ಮ "${question}" ಎಂಬ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಮಗುವಿನ ಜಾತಕದಲ್ಲಿ ೪ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ (${house4Sign}) ಹಾಗೂ ೫ನೇ ಬುದ್ಧಿ ಸ್ಥಾನಗಳು (${house5Sign}) ಅತ್ಯಂತ ಚೇತನವಾಗಿದ್ದು, ಮಗುವಿನ ಅಂತರಂಗದಲ್ಲಿ ಅಪಾರವಾದ ಸುಪ್ತ ಪ್ರತಿಭೆ ಅಡಗಿದೆ.`;
    const p2Child = `ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ಗ್ರಹಣ ಶಕ್ತಿಯ ವಿಚಾರದಲ್ಲಿ ೪ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${house4Lord} ಗ್ರಹದ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸಿದಾಗ, ಮಗುವಿಗೆ ವಿಷಯಗಳನ್ನು ಬೇಗನೆ ಗ್ರಹಿಸುವ ಅದ್ಭುತ ಶಕ್ತಿಯಿದೆ. ಆದರೆ ಮನಸ್ಸು ಒಮ್ಮೊಮ್ಮೆ ಚಂಚಲಗೊಳ್ಳುವುದು, ಆಟದ ಕಡೆಗೆ ಆಕರ್ಷಿತವಾಗುವುದು ಹಾಗೂ ಪೋಷಕರ ಮಾತಿಗೆ ಹಠ ಮಾಡುವುದು ಈ ವಯಸ್ಸಿನ ಸಹಜ ಲಕ್ಷಣ. ಪೋಷಕರಾಗಿ ನೀವು ಮಗುವಿನ ಮೇಲೆ ಅನಗತ್ಯ ಶೈಕ್ಷಣಿಕ ಒತ್ತಡ ಅಥವಾ ಕಠಿಣ ಶಿಕ್ಷೆಗಳನ್ನು ಹೇರದೆ, ಪ್ರೀತಿ, ಸಮಾಧಾನ ಹಾಗೂ ನಿಗದಿತ ಸಮಯದ ದಿನಚರಿಯನ್ನು ರೂಢಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿಯು ಮಗುವಿನ ಬೌದ್ಧಿಕ ವಿಕಾಸಕ್ಕೆ ಉತ್ತಮ ತಳಹದಿ ಹಾಕಲಿದೆ.`;
    const p3Child = `ಮಗುವಿನ ಆರೋಗ್ಯ ರಕ್ಷಣೆ, ದೃಷ್ಟಿ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಏಕಾಗ್ರತೆಗಾಗಿ, ಪ್ರತಿದಿನ ಸಂಜೆ ಮನೆಯಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ ಮಹಾಸರಸ್ವತೀ ಸ್ತೋತ್ರ ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಪಠಿಸಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ಸಂಕಲ್ಪ ಮಾಡಿ ದೂರ್ವಾ ಅರ್ಚನೆ ಮಾಡಿಸುವುದರಿಂದ ಮಗುವಿನ ಜ್ಞಾಪಕ ಶಕ್ತಿ ವೃದ್ಧಿಸಿ, ಶೈಕ್ಷಣಿಕ ವಿಜಯ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯ ಲಭಿಸಲಿದೆ.`;

    if (activeDosha.hasDosha) {
      const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nಮಗುವಿನ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಜಾತಕದಲ್ಲಿ "${
        activeDosha.doshaName || "ಬಾಲ ಸಂಸ್ಕಾರ ಹಾಗೂ ವಿದ್ಯಾ ದೋಷ"
      }" ಕಂಡುಬಂದಿದೆ. ಜಾತಕದಲ್ಲಿ ${
        activeDosha.technicalWhy || "ಗ್ರಹಗಳ ಅಶುಭ ಸ್ಥಾನ ಹಾಗೂ ದೃಷ್ಟಿ ಯೋಗದಿಂದ"
      } ಈ ಪ್ರಭಾವ ಉಂಟಾಗಿದ್ದು, ಇದರಿಂದಾಗಿ "${
        activeDosha.currentLifeProblems || "ಓದಿನಲ್ಲಿ ಚಂಚಲತೆ ಹಾಗೂ ಪರೀಕ್ಷಾ ಆತಂಕ"
      }" ಗೋಚರಿಸುತ್ತದೆ. ಈ ದೋಷವನ್ನು ಶಾಂತಿಗೊಳಿಸಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${
        activeDosha.recommendedPooja || "ಶ್ರೀ ಮಹಾಸರಸ್ವತೀ ಹಾಗೂ ಮೇಧಾ ಸೂಕ್ತ ಶಾಂತಿ ಪೂಜೆ"
      }" ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ. ಈ ಪೂಜೆಯಿಂದ ಮಗುವಿಗೆ ದೈವಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ ಲಭಿಸುವುದು ನಿಶ್ಚಿತ. ಹೆಚ್ಚಿನ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ಪುರೋಹಿತರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
      return `${p1Child}\n\n${p2Child}\n\n${p3Child}\n\n${p4Dosha}`;
    }
    return `${p1Child}\n\n${p2Child}\n\n${p3Child}`;
  }

  // Santhana / Progeny / Childbirth Query
  if (isSanthana) {
    const p1Santhana = isSubsequent
      ? `ಸಂತಾನ ಭಾಗ್ಯದ ಕುರಿತಾದ ನಿಮ್ಮ "${question}" ಎಂಬ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದ ೫ನೇ ಮನೆಯಾದ ಪುತ್ರ/ಸಂತಾನ ಸ್ಥಾನವನ್ನು (${house5Sign}) ಹಾಗೂ ಪಂಚಮಾಧಿಪತಿಯಾದ ${house5Lord} ಗ್ರಹದ ಸ್ಥಿತಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅವಲೋಕಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗೋಚಾರ ಗ್ರಹಗಳು ತಾತ್ಕಾಲಿಕ ವಿಳಂಬವನ್ನು ಉಂಟುಮಾಡುತ್ತಿವೆ. ವೈದ್ಯಕೀಯ ಪ್ರಯತ್ನಗಳ ಜೊತೆಗೆ ಸೂಕ್ತ ದೈವಾನುಗ್ರಹ ಸಿದ್ಧಿಸಿದಾಗ ಸಂತಾನ ಯೋಗವು ಖಂಡಿತ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`
      : `ಮಗುವೇ ${session.name}, ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಪುತ್ರ ಪ್ರಾಪ್ತಿಯ ಕುರಿತು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಆಳವಾದ ಕಳವಳ ಹಾಗೂ ನಿರೀಕ್ಷೆಯನ್ನು ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಾನು ಸಂಪೂರ್ಣವಾಗಿ ಗ್ರಹಿಸಬಲ್ಲೆ. ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಜ್ಯೋತಿಷ್ಯ ಗಣಿತದ ಪ್ರಕಾರ ನೀವು ${lagna} ಲಗ್ನ, ${rashi} ರಾಶಿಯಲ್ಲಿ ಜನಿಸಿದ್ದು, ನಿಮ್ಮ ಸಹಜ ಸ್ವಭಾವವು ${tatva} ತತ್ವ ಹಾಗೂ ${gana} ಗಣದಿಂದ ಕೂಡಿದೆ. ನಿಮ್ಮ ಜಾತಕದ ೫ನೇ ಮನೆಯಾದ ಪುತ್ರ/ಸಂತಾನ ಸ್ಥಾನವನ್ನು (${house5Sign}) ಹಾಗೂ ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಸ್ಥಿತಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅವಲೋಕಿಸಿದಾಗ, ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಲ್ಲಿ ಕಾಲದ ತಾತ್ಕಾಲಿಕ ವಿಳಂಬ ಗೋಚರಿಸುತ್ತಿದೆ.`;
    const p2Santhana = `ನಿಮ್ಮ ಜಾತಕದ ಪಂಚಮಾಧಿಪತಿಯಾದ ${house5Lord} ಗ್ರಹದ ಸ್ಥಿತಿ ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗೋಚಾರ ಗ್ರಹಗಳ ಪರೀಕ್ಷೆಯು ತಾತ್ಕಾಲಿಕ ಅಡೆತಡೆಗಳನ್ನು ಉಂಟುಮಾಡಿದೆ. ವೈದ್ಯಕೀಯ ಪ್ರಯತ್ನಗಳ ಜೊತೆಗೆ ದೈವಬಲವು ಜೋಡಿಯಾದಾಗ ಮಾತ್ರವೇ ಸೃಷ್ಟಿಕಾರಕ ಶಕ್ತಿ ಜಾಗೃತಗೊಳ್ಳುತ್ತದೆ. ನಿಮ್ಮ ಅಥವಾ ನಿಮ್ಮ ಸಂಗಾತಿಯ ಮನಸ್ಸಿನಲ್ಲಿರುವ ನಕಾರಾತ್ಮಕ ನಿರಾಶೆಯನ್ನು ತಕ್ಷಣವೇ ದೂರಮಾಡಿ. ಜಾತಕದಲ್ಲಿರುವ ಕರ್ಮ ತಡೆಗಳನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ನಿವಾರಿಸಿದಾಗ ಸಂತಾನ ಭಾಗ್ಯದ ಬಾಗಿಲು ಖಂಡಿತವಾಗಿಯೂ ತೆರೆಯಲಿದೆ.`;
    const p3Santhana = `ಮುಂದಿನ ಗೋಚಾರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗುರು ಗ್ರಹದ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಸಂತಾನ ಸ್ಥಾನದ ಮೇಲೆ ಬೀಳುವ ಸಂದರ್ಭದಲ್ಲಿ ಗರ್ಭಧಾರಣೆ ಹಾಗೂ ಸಂತಾನ ಯೋಗವು ಪ್ರಬಲವಾಗಿ ಸಿದ್ಧಿಸಲಿದೆ. ದಂಪತಿಗಳಿಬ್ಬರೂ ಪ್ರತಿ ಗುರುವಾರ ಶುದ್ಧ ಹಸುವಿನ ಹಾಲಿನಿಂದ ಮಾಡಿದ ನೈವೇದ್ಯವನ್ನು ಸಮರ್ಪಿಸಿ, ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ. ಮನಸ್ಸಿನಲ್ಲಿ ಧನಾತ್ಮಕ ವಿಶ್ವಾಸವಿರಲಿ.`;

    if (activeDosha.hasDosha) {
      const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ "${
        activeDosha.doshaName || "ಸಂತಾನ ತಡೆ ಹಾಗೂ ಪಂಚಮ ಭಾವ ಕರ್ಮ ದೋಷ"
      }" ದೃಢಪಟ್ಟಿದೆ. ಜಾತಕದಲ್ಲಿ ${
        activeDosha.technicalWhy || "ಪಂಚಮ ಭಾವ ಹಾಗೂ ಗುರುವಿನ ಮೇಲಿನ ಪಾಪಗ್ರಹಗಳ ದೃಷ್ಟಿಯಿಂದ"
      } ಈ ದೋಷ ಉಂಟಾಗಿದ್ದು, ಇದರಿಂದಾಗಿಯೇ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಪ್ರಸ್ತುತ "${
        activeDosha.currentLifeProblems || "ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ಅಡೆತಡೆ ಹಾಗೂ ತೀವ್ರ ಮಾನಸಿಕ ಚಿಂತೆ"
      }" ಎದುರಾಗುತ್ತಿದೆ. ಈ ದೋಷವನ್ನು ಶಾಂತಿಗೊಳಿಸಲು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${
        activeDosha.recommendedPooja ||
        "ಸಂತಾನ ಗೋಪಾಲ ಮಹಾಹೋಮ ಹಾಗೂ ನಾಗ ಪ್ರತಿಷ್ಠಾ ಸಹಿತ ಮಹಾರುದ್ರಾಭಿಷೇಕ"
      }" ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಅನಿವಾರ್ಯವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಪೂಜೆಯನ್ನು ಶ್ರದ್ಧಾ-ಭಕ್ತಿಗಳಿಂದ ನೆರವೇರಿಸಿದ ನಂತರ ನಿಮ್ಮ ದಾಂಪತ್ಯದಲ್ಲಿ ಶೀಘ್ರವೇ ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಾಗುವುದು ನಿಶ್ಚಿತ. ಈ ದೋಷ ಪರಿಹಾರ ಪೂಜೆಯ ಸಂಕಲ್ಪ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
      return `${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}\n\n${p4Dosha}`;
    }
    return `${p1Santhana}\n\n${p2Santhana}\n\n${p3Santhana}`;
  }

  // Secret Intimate / Sexuality Query
  if (isSecretIntimate) {
    const p1Intimate = isSubsequent
      ? `ಅಂತರಂಗದ ಈ ವಿಚಾರಣೆಗೆ ("${question}") ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದ ೮ನೇ ಗುಪ್ತಸ್ಥಾನ, ೭ನೇ ಭಾವ ಹಾಗೂ ಶುಕ್ರ ಗ್ರಹದ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸಿದಾಗ, ಇದು ನೈಸರ್ಗಿಕ ಶಾರೀರಿಕ ಮತ್ತು ಮಾನಸಿಕ ಸಂವೇದನೆಯ ವಿಷಯವಾಗಿದೆ. ಯಾವುದೇ ಅಪರಾಧಿ ಭಾವನೆಗೆ ಒಳಗಾಗದೆ, ಆಯುರ್ವೇದ ಪದ್ಧತಿ ಹಾಗೂ ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿಯಿಂದ ಸಮತೋಲನ ಸಾಧಿಸುವುದು ಮುಖ್ಯ.`
      : `ಆತ್ಮೀಯ ${session.name} ಅವರೇ, ಮನುಷ್ಯನ ಜೀವನದಲ್ಲಿ ಅಂತರಂಗದ ಕಾಮನೆ, ದೈಹಿಕ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಲೈಂಗಿಕ ತೃಪ್ತಿಯು ಅತ್ಯಂತ ನೈಸರ್ಗಿಕವಾದ ಸಂಗತಿಯಾಗಿದೆ. ಇದನ್ನು ಸಮಾಜದಲ್ಲಿ ಯಾರ ಬಳಿಯೂ ಮುಕ್ತವಾಗಿ ಹೇಳಿಕೊಳ್ಳಲಾಗದೆ, ನಾಚಿಕೆ ಅಥವಾ ಅಪರಾಧ ಭಾವನೆಯಿಂದ ಮನಸ್ಸಿನಲ್ಲೇ ಕೊರಗುವುದು ಸಹಜ. ಆದರೆ ನೆನಪಿಡಿ, ಸನಾತನ ವೈದಿಕ ಪರಂಪರೆಯಲ್ಲಿ ಧರ್ಮ-ಅರ್ಥ-ಕಾಮ-ಮೋಕ್ಷ ಎಂಬ ನಾಲ್ಕು ಪುರುಷಾರ್ಥಗಳಲ್ಲಿ ಕಾಮವು ಸೃಷ್ಟಿ ಮತ್ತು ಜೀವನೋತ್ಸಾಹದ ಪವಿತ್ರ ಅಂಗವಾಗಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagna} ಹಾಗೂ ಶುಕ್ರ ಗ್ರಹದ ಸ್ಥಿತಿಯು ನಿಮ್ಮ ಅಂತರಂಗದ ಸಂವೇದನೆಯನ್ನು ನಿರ್ದೇಶಿಸುತ್ತಿದೆ.`;
    const p2Intimate = `ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಜಾತಕದ ೮ನೇ ಮನೆಯಾದ ಗುಪ್ತಸ್ಥಾನ, ೭ನೇ ಕಾಮಸ್ಥಾನ ಹಾಗೂ ೧೨ನೇ ಶಯನ ಸುಖದ ಸ್ಥಾನಗಳನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿಯಲ್ಲಿ ಶಾರೀರಿಕ ಹಾಗೂ ಮಾನಸಿಕ ಒತ್ತಡವು ಶುಕ್ರ ಧಾತುವಿನ ಸಮತೋಲನದ ಮೇಲೆ ತಾತ್ಕಾಲಿಕ ಪ್ರಭಾವ ಬೀರಿದೆ. ಅತಿಯಾದ ಮಾನಸಿಕ ಆತಂಕ, ಅಪರಾಧ ಭಾವ ಅಥವಾ ದಣಿವೇ ಲೈಂಗಿಕ ಶಕ್ತಿ ಕುಗ್ಗಲು ಮುಖ್ಯ ಕಾರಣವೇ ಹೊರತು ಯಾವುದೇ ಶಾಶ್ವತ ಕೊರತೆಯಲ್ಲ. ಆಯುರ್ವೇದ ಪದ್ಧತಿಯಂತೆ ಅಶ್ವಗಂಧ, ಶುದ್ಧ ಹಾಲು, ಸಾತ್ವಿಕ ಆಹಾರ ಮತ್ತು ಪ್ರಾಣಾಯಾಮವು ನಿಮ್ಮ ನರಮಂಡಲಕ್ಕೆ ಹೊಸ ಚೈತನ್ಯವನ್ನು ತುಂಬಲಿದೆ.`;
    const p3Intimate = `ಮನಸ್ಸಿನ ಆತಂಕವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಕಳಚಿಕೊಳ್ಳಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಧ್ಯಾನ ಹಾಗೂ ಸೋಮವಾರದ ರುದ್ರಾಭಿಷೇಕವು ಮನಸ್ಸಿಗೆ ಶಾಂತಿ ನೀಡಿ, ದೈಹಿಕ ಹಾಗೂ ಮಾನಸಿಕ ಚೈತನ್ಯವನ್ನು ಮರಳಿ ತರಲಿದೆ. ನಿಮ್ಮ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ಪ್ರೀತಿ, ಗೌರವ ಮತ್ತು ಮುಕ್ತ ಸಂವಹನವನ್ನು ಹೆಚ್ಚಿಸಿಕೊಳ್ಳಿ.`;

    if (activeDosha.hasDosha) {
      const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಜಾತಕದಲ್ಲಿ "${
        activeDosha.doshaName || "ಶುಕ್ರ ಧಾತು ಹಾಗೂ ಅಂತರಂಗ ಕ್ಲೇಶ ದೋಷ"
      }" ಕಂಡುಬಂದಿದೆ. ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${
        activeDosha.recommendedPooja || "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಆಯುಷ್ಯ-ಆರೋಗ್ಯ ಶಾಂತಿ"
      }" ನೆರವೇರಿಸುವುದರಿಂದ ನರಮಂಡಲವು ಬಲಗೊಂಡು ಮನಸ್ಸಿಗೆ ನಿರಾಳತೆ ಸಿಗಲಿದೆ. ಹೆಚ್ಚಿನ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
      return `${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}\n\n${p4Dosha}`;
    }
    return `${p1Intimate}\n\n${p2Intimate}\n\n${p3Intimate}`;
  }

  if (isCareerFrustration) {
    const p1Career = isSubsequent
      ? `ವೃತ್ತಿಜೀವನ ಹಾಗೂ ಉದ್ಯೋಗದ ಈ ಪ್ರಶ್ನೆಗೆ ("${question}") ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದ ೧೦ನೇ ಕರ್ಮಸ್ಥಾನ (ಅಧಿಪತಿ: ${karmaLord}) ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿಯ ಸಂಯೋಗವನ್ನು ಗಮನಿಸಿದಾಗ, ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ತಾತ್ಕಾಲಿಕ ಒತ್ತಡ ಹಾಗೂ ಮಂಥನ ಕಂಡುಬರುತ್ತಿದೆ. ಇದು ನಿಮ್ಮ ಆಂತರಿಕ ಸಾಮರ್ಥ್ಯವನ್ನು ಸಾಣೆ ಹಿಡಿಯುವ ಸಮಯವೇ ಹೊರತು ಶಾಶ್ವತ ಹಿನ್ನಡೆಯಲ್ಲ.`
      : `ಮಗುವೇ ${session.name}, ನಿಮ್ಮ ಮನಸ್ಸಿನ ಕಳವಳ ಹಾಗೂ ವೃತ್ತಿಜೀವನದಲ್ಲಿ (ಉದ್ಯೋಗ/ವ್ಯಾಪಾರ) ಎದುರಾಗುತ್ತಿರುವ ಕಿರಿಕಿರಿ ಮತ್ತು ಹತಾಶೆಯನ್ನು ಒಬ್ಬ ಹಿರಿಯ ದೈವಜ್ಞನಾಗಿ ನಾನು ಸಂಪೂರ್ಣವಾಗಿ ಗ್ರಹಿಸಬಲ್ಲೆ. ಜೀವನದಲ್ಲಿ ಇಂತಹ ಮಂಥನದ ಹಂತಗಳು ಬಂದಾಗ ಎಂತಹ ಧೀರರೂ ವಿಚಲಿತರಾಗುವುದು ಸಹಜ. ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಜ್ಯೋತಿಷ್ಯ ಗಣಿತದ ಪ್ರಕಾರ ನೀವು ${lagna} ಲಗ್ನ, ${rashi} ರಾಶಿಯಲ್ಲಿ ಜನಿಸಿದ್ದು (${tatva} ತತ್ವ, ${gana} ಗಣ), ನಿಮ್ಮ ಸಹಜ ಗುಣವೇ ${psychNature || "ಶ್ರಮಜೀವಿ ಹಾಗೂ ಸ್ವಾಭಿಮಾನಿ"}. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಕಾಲಘಟ್ಟ ಹಾಗೂ ${shaniText}ಯು ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ತಾಳ್ಮೆ ಹಾಗೂ ಹೊಸ ಆತ್ಮಾವಲೋಕನವನ್ನು ಅಪೇಕ್ಷಿಸುತ್ತಿದೆ.`;
    const p2Career = `ನಿಮ್ಮ ಜಾತಕದ ೧೦ನೇ ಮನೆಯಾದ ಕರ್ಮಸ್ಥಾನದ ಅಧಿಪತಿಯಾದ ${karmaLord} ಗ್ರಹದ ಸ್ಥಿತಿ ಹಾಗೂ ೬ನೇ ಮನೆಯ ಸ್ಥಿತಿಗತಿಗಳನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಅವಲೋಕಿಸಿದಾಗ, ಶನಿ ಹಾಗೂ ಗೋಚಾರ ಗ್ರಹಗಳ ಪ್ರಭಾವದಿಂದಾಗಿ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಅತಿಯಾದ ಒತ್ತಡ, ಸಹೋದ್ಯೋಗಿಗಳಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆ ಹಾಗೂ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ತಡವಾಗುವ ವಾತಾವರಣ ನಿರ್ಮಾಣವಾಗಿದೆ. ಆದರೆ ನೆನಪಿಡಿ, ಈ ಪರೀಕ್ಷೆಯು ನಿಮ್ಮ ಒಳಗಿನ ಸಾಮರ್ಥ್ಯವನ್ನು ಸಾಣೆ ಹಿಡಿಯಲಿಕ್ಕಾಗಿಯೇ ಬಂದಿರುವುದೇ ಹೊರತು ನಿಮ್ಮ ಭವಿಷ್ಯವನ್ನು ಕುಗ್ಗಿಸುವುದಕ್ಕಲ್ಲ. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಕೋಪ ಅಥವಾ ಆತುರದಲ್ಲಿ ರಾಜೀನಾಮೆಯಂತಹ ಅವಸರದ ಹೆಜ್ಜೆಗಳನ್ನು ಇಡಬೇಡಿ.`;
    const p3Career = `ಮುಂದಿನ ಗೋಚಾರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ಪರವಾಗಿ ತಿರುಗಲಿದ್ದು, ಕತ್ತಲೆ ಕರಗಿ ನಿಧಾನವಾಗಿ ಹೊಸ ಅವಕಾಶಗಳ ಬಾಗಿಲು ತೆರೆಯಲಿದೆ. ಅಲ್ಲಿಯವರೆಗೂ ಶಾಂತಚಿತ್ತದಿಂದ ನಿಮ್ಮ ಕಾರ್ಯವನ್ನು ನಿಷ್ಠೆಯಿಂದ ಮುಂದುವರಿಸಿ. ಪ್ರತಿದಿನ ಶಿವಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರ ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ಜಪಿಸಿ, ಪ್ರತಿ ಶನಿವಾರ ಅಥವಾ ಸೋಮವಾರ ತುಪ್ಪದ ದೀಪವನ್ನು ಬೆಳಗಿಸುವುದರಿಂದ ಮಾನಸಿಕ ಧೈರ್ಯ ಹೆಚ್ಚಿ, ಸಕಲ ವಿಘ್ನಗಳೂ ದೂರವಾಗಲಿವೆ.`;

    if (activeDosha.hasDosha) {
      const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ "${
        activeDosha.doshaName || "ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ"
      }" ದೃಢಪಟ್ಟಿದೆ. ಜಾತಕದಲ್ಲಿ ${
        activeDosha.technicalWhy ||
        "ಗ್ರಹಗಳ ಅಶುಭ ಸಂಯೋಜನೆ ಮತ್ತು ದೃಷ್ಟಿ ಯೋಗದಿಂದ"
      } ಈ ದೋಷ ಉಂಟಾಗಿದ್ದು, ಇದರಿಂದಾಗಿಯೇ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಪ್ರಸ್ತುತ "${
        activeDosha.currentLifeProblems ||
        "ಕಾರ್ಯವಿಳಂಬ, ಮಾನಸಿಕ ಅಶಾಂತಿ ಹಾಗೂ ವಿಪರೀತ ಅಡೆತಡೆಗಳು"
      }" ಎದುರಾಗುತ್ತಿವೆ. ಈ ದೋಷವನ್ನು ಶಾಂತಿಗೊಳಿಸಲು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${
        activeDosha.recommendedPooja ||
        "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ದೋಷ ಶಾಂತಿ ಹೋಮ"
      }" ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಅನಿವಾರ್ಯವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಪೂಜೆಯನ್ನು ಶ್ರದ್ಧಾ-ಭಕ್ತಿಗಳಿಂದ ನೆರವೇರಿಸಿದ ನಂತರ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಖಂಡಿತವಾಗಿಯೂ ಧನಾತ್ಮಕ ಸುಧಾರಣೆ ಮತ್ತು ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳ ಸಿದ್ಧಿ ಗೋಚರಿಸುವುದು ನಿಶ್ಚಿತ. ಈ ದೋಷ ಪರಿಹಾರ ಪೂಜೆಯ ಸಂಕಲ್ಪ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
      return `${p1Career}\n\n${p2Career}\n\n${p3Career}\n\n${p4Dosha}`;
    }
    return `${p1Career}\n\n${p2Career}\n\n${p3Career}`;
  }

  const p1 = isSubsequent
    ? `ನೀವು ಕೇಳಿರುವ "${question}" ಎಂಬ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದ ಪ್ರಸ್ತುತ ${dasha} ಅವಧಿ ಹಾಗೂ ಸಂಬಂಧಿಸಿದ ಭಾವಾಧಿಪತಿಯ ಸಂಚಾರವನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಗ್ರಹಸ್ಥಿತಿಗಳು ಸಕಾರಾತ್ಮಕ ಬದಲಾವಣೆಗಳನ್ನು ಸೂಚಿಸುತ್ತಿವೆ. ಲಗ್ನಾಧಿಪತಿಯ ಬಲವು ನಿಮಗೆ ಆತ್ಮಸ್ಥೈರ್ಯ ನೀಡುತ್ತಿದ್ದು, ತಾಳ್ಮೆಯ ನಡೆಯಿಂದ ಉದ್ದೇಶಿತ ಕಾರ್ಯಗಳು ಸಿದ್ಧಿಯಾಗಲಿವೆ.`
    : `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯದ ಶಾಸ್ತ್ರೋಕ್ತ ಗಣಿತದ ಪ್ರಕಾರ ನೀವು ${lagna} ಲಗ್ನ, ${rashi} ರಾಶಿ ಹಾಗೂ ${nakshatra} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನ್ಮತಾಳಿದ್ದೀರಿ (${tatva} ತತ್ವ, ${gana} ಗಣ). ನಿಮ್ಮ "${question}" ಎಂಬ ವಿಚಾರಣೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಜಾತಕದಲ್ಲಿ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dasha} ಅವಧಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಮಹತ್ವದ ತಿರುವು ಮತ್ತು ಹೊಸ ಅವಕಾಶಗಳನ್ನು ನಿರ್ದೇಶಿಸುತ್ತಿದೆ. ಲಗ್ನಾಧಿಪತಿಯ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮಗೆ ಆತ್ಮಸ್ಥೈರ್ಯ ನೀಡುತ್ತಿದ್ದು, ಗೋಚಾರ ಗ್ರಹಗಳಾದ ಗುರು ಮತ್ತು ಶನಿ ಪ್ರಭಾವದಿಂದ ಹಂತ ಹಂತವಾಗಿ ಸಕಲ ಕಾರ್ಯಗಳು ಸಿದ್ಧಿಯಾಗಲಿವೆ.`;

  const p2 = `ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ಭಾವಗಳನ್ನು ಗಮನಿಸಿದಾಗ, ಈ ಹಿಂದೆ ಎದುರಾಗಿದ್ದ ಮಾನಸಿಕ ಆತಂಕಗಳು ಮತ್ತು ಕಾರ್ಯವಿಳಂಬಗಳು ಈಗ ನಿಧಾನವಾಗಿ ಪರಿಹಾರವಾಗುವ ಲಕ್ಷಣಗಳಿವೆ. ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ ಹಾಗೂ ಕುಟುಂಬ ಸೌಖ್ಯದ ವಿಚಾರದಲ್ಲಿ ಧನಾತ್ಮಕ ಫಲಗಳು ಗೋಚರಿಸುತ್ತಿದ್ದು, ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ತಾಳ್ಮೆಯ ನಡೆ ನಿಮಗೆ ಹೆಚ್ಚಿನ ಯಶಸ್ಸನ್ನು ತಂದುಕೊಡುತ್ತದೆ. ಯಾವುದೇ ಅತಿ ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳದೆ, ಗ್ರಹಬಲಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಹೆಜ್ಜೆ ಇಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ.`;

  const p3 = `ಮುಂದಿನ ಗೋಚಾರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಗುರು ಗ್ರಹದ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳಿಗೆ ಬಲವನ್ನು ನೀಡಲಿದ್ದು, ಹೊಸ ಕಾರ್ಯಾರಂಭಕ್ಕೆ ಯೋಗ್ಯ ಕಾಲಾವಕಾಶ ಸೃಷ್ಟಿಯಾಗಲಿದೆ. ತಾಳ್ಮೆ ಮತ್ತು ಸತತ ಪ್ರಯತ್ನಗಳಿಂದ ನಿಮ್ಮ ನಿರೀಕ್ಷಿತ ಗುರಿಗಳನ್ನು ತಲುಪಲು ಸಾಧ್ಯವಾಗಲಿದ್ದು, ದೈವಾನುಗ್ರಹದಿಂದ ನಿಧಾನವಾಗಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸಲಿದೆ. ಯಾವುದೇ ನಕಾರಾತ್ಮಕ ಚಿಂತನೆಗಳಿಗೆ ಎಡೆಕೊಡದೆ ಶುಭ ಸಂಕಲ್ಪದೊಂದಿಗೆ ಹೆಜ್ಜೆಯಿಡಿ.`;

  if (activeDosha.hasDosha) {
    const p4Dosha = `॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ "${
      activeDosha.doshaName || "ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ"
    }" ದೃಢಪಟ್ಟಿದೆ. ಜಾತಕದಲ್ಲಿ ${
      activeDosha.technicalWhy || "ಗ್ರಹಗಳ ಅಶುಭ ಸಂಯೋಜನೆ ಮತ್ತು ದೃಷ್ಟಿ ಯೋಗದಿಂದ"
    } ಈ ದೋಷ ಉಂಟಾಗಿದ್ದು, ಇದರಿಂದಾಗಿಯೇ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಪ್ರಸ್ತುತ "${
      activeDosha.currentLifeProblems ||
      "ಕಾರ್ಯವಿಳಂಬ, ಮಾನಸಿಕ ಅಶಾಂತಿ ಹಾಗೂ ವಿಪರೀತ ಅಡೆತಡೆಗಳು"
    }" ಎದುರಾಗುತ್ತಿವೆ. ಈ ದೋಷವನ್ನು ಶಾಂತಿಗೊಳಿಸಲು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ "${
      activeDosha.recommendedPooja ||
      "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ದೋಷ ಶಾಂತಿ ಹೋಮ"
    }" ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಅನಿವಾರ್ಯವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಪೂಜೆಯನ್ನು ಶ್ರದ್ಧಾ-ಭಕ್ತಿಗಳಿಂದ ನೆರವೇರಿಸಿದ ನಂತರ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಖಂಡಿತವಾಗಿಯೂ ಧನಾತ್ಮಕ ಸುಧಾರಣೆ ಮತ್ತು ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳ ಸಿದ್ಧಿ ಗೋಚರಿಸುವುದು ನಿಶ್ಚಿತ. ಈ ದೋಷ ಪರಿಹಾರ ಪೂಜೆಯ ಸಂಕಲ್ಪ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮುಖ್ಯ ದೈವಜ್ಞರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: 9972339362, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ) ಅವರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.`;
    return `${p1}\n\n${p2}\n\n${p3}\n\n${p4Dosha}`;
  }

  const p3Normal = `ಗ್ರಹದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯಜಯಕ್ಕಾಗಿ, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ. ಪ್ರತಿ ಸೋಮವಾರ ಅಥವಾ ಶನಿವಾರದಂದು ದೀಪಾರಾಧನೆ ಮಾಡಿ ಇಷ್ಟದೇವತಾ ಸ್ಮರಣೆ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಸಮಸ್ತ ಇಷ್ಟಾರ್ಥಗಳು ಶೀಘ್ರವಾಗಿ ಕೈಗೂಡಿ ಸಕಲ ಶುಭವಾಗುತ್ತದೆ.`;
  return `${p1}\n\n${p2}\n\n${p3Normal}`;
}
