/**
 * Classical Vedic Sankhya Shastra & Prashna Mathematical Engine.
 * 
 * Implements 100% offline mathematical calculations for:
 * 1. Prashna Lagna (House 1..12, Rashi 0..11, Lagna Lord, Sign Mobility)
 * 2. Digital Root Numerology (1..9, Ruler, Element, Friend/Enemy Numbers)
 * 3. Compound Number Decomposition & Symbolism
 * 4. Automatic Karya Sthana (Primary & Secondary Bhava) Keyword Detection
 * 5. Live Ephemeris Transit Planetary Placements & House Offsets
 * 6. Mathematical Prashna Bala Score (0..100%)
 * 7. Deterministic Fulfillment Time Horizon (Days/Weeks/Months)
 * 8. Pure Multi-Language Formatting (kn, en, hi, te, ta)
 * 9. Gemini AI used ONLY for final linguistic narration & chat polishing!
 */

import { siderealLongitudes } from "../../core/EphemerisEngine";
import { askGemini } from "../../core/GeminiEngine";

export type SignMobility = "chara" | "sthira" | "dwiswabhava";

export type SankhyaShastraResult = {
  rawQuestion: string;
  formattedQuestion: string;
  userNumber: number;
  
  // Prashna Lagna Details
  prashnaLagnaHouse: number; // 1..12
  prashnaLagnaIndex: number; // 0..11 (0=Mesha, 11=Meena)
  prashnaLagnaName: Record<string, string>;
  prashnaLagnaLord: Record<string, string>;
  signMobility: SignMobility;
  signMobilityLabel: Record<string, string>;

  // Numerology Details
  rootNumber: number; // 1..9
  rootRulerName: Record<string, string>;
  rootDeity: Record<string, string>;
  compoundAnalysis: Record<string, string>;

  // Karya Sthana (Question Intent Bhava)
  primaryKaryaBhava: number; // 1..12
  primaryKaryaLabel: Record<string, string>;

  // Ephemeris Transits
  transitPlanets: Array<{
    planetKey: string;
    planetName: Record<string, string>;
    rashiIndex: number;
    rashiName: Record<string, string>;
    houseFromLagna: number;
    isBenefic: boolean;
  }>;

  // Mathematical Calculations
  prashnaBalaScore: number; // 0..100%
  verdictCategory: "high_success" | "moderate_success" | "delay_with_effort" | "caution_rest";
  verdictLabel: Record<string, string>;
  timeHorizonLabel: Record<string, string>;
  remedyRecommendation: Record<string, string>;

  // Final Narration
  aiPrediction: string;
  generatedAt: string;
};

// ----------------------------------------------------------------------
// 5-LANGUAGE LOCALIZED DICTIONARIES
// ----------------------------------------------------------------------

const RASHI_L5: Record<number, Record<string, string>> = {
  0: { kn: "ಮೇಷ", en: "Mesha (Aries)", hi: "मेष", te: "మేషం", ta: "மேஷம்" },
  1: { kn: "ವೃಷಭ", en: "Vrishabha (Taurus)", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்" },
  2: { kn: "ಮಿಥುನ", en: "Mithuna (Gemini)", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்" },
  3: { kn: "ಕರ್ಕಾಟಕ", en: "Karkataka (Cancer)", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்" },
  4: { kn: "ಸಿಂಹ", en: "Simha (Leo)", hi: "सिंह", te: "సింహం", ta: "சிம்மம்" },
  5: { kn: "ಕನ್ಯಾ", en: "Kanya (Virgo)", hi: "कन्या", te: "కన్య", ta: "கன்னி" },
  6: { kn: "ತುಲಾ", en: "Tula (Libra)", hi: "तुला", te: "తులా", ta: "துலாம்" },
  7: { kn: "ವೃಶ್ಚಿಕ", en: "Vrischika (Scorpio)", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்" },
  8: { kn: "ಧನಸ್ಸು", en: "Dhanus (Sagittarius)", hi: "धनु", te: "ధనస్సు", ta: "தனுசு" },
  9: { kn: "ಮಕರ", en: "Makara (Capricorn)", hi: "मकर", te: "మకరం", ta: "மகரம்" },
  10: { kn: "ಕುಂಭ", en: "Kumbha (Aquarius)", hi: "कुंभ", te: "కుంభం", ta: "கும்பம்" },
  11: { kn: "ಮೀನ", en: "Meena (Pisces)", hi: "मीन", te: "మీనం", ta: "மீனம்" }
};

const RASHI_LORDS_L5: Record<number, Record<string, string>> = {
  0: { kn: "ಮಂಗಳ", en: "Mars (Mangala)", hi: "मंगल", te: "కుజుడు", ta: "செவ்வாய்" },
  1: { kn: "ಶುಕ್ರ", en: "Venus (Shukra)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
  2: { kn: "ಬುಧ", en: "Mercury (Budha)", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
  3: { kn: "ಚಂದ್ರ", en: "Moon (Chandra)", hi: "चंद्र", te: "చంద్రుడు", ta: "சந்திரன்" },
  4: { kn: "ಸೂರ್ಯ", en: "Sun (Surya)", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" },
  5: { kn: "ಬುಧ", en: "Mercury (Budha)", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
  6: { kn: "ಶುಕ್ರ", en: "Venus (Shukra)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
  7: { kn: "ಮಂಗಳ", en: "Mars (Mangala)", hi: "मंगल", te: "కుజుడు", ta: "செவ்வாய்" },
  8: { kn: "ಗುರು", en: "Jupiter (Guru)", hi: "गुरु", te: "గురుడు", ta: "குரு" },
  9: { kn: "ಶನಿ", en: "Saturn (Shani)", hi: "शनि", te: "శని", ta: "சனி" },
  10: { kn: "ಶನಿ", en: "Saturn (Shani)", hi: "शनि", te: "శని", ta: "சனி" },
  11: { kn: "ಗುರು", en: "Jupiter (Guru)", hi: "गुरु", te: "గురుడు", ta: "குரு" }
};

const MOBILITY_L5: Record<SignMobility, Record<string, string>> = {
  chara: {
    kn: "ಚರ ರಾಶಿ (ವೇಗದ ಚಲನೆ & ತ್ವರಿತ ಸಿದ್ಧಿ)",
    en: "Chara Sign (Movable - Fast Action & Quick Results)",
    hi: "चर राशि (शीघ्र सफलता व तीव्र परिणाम)",
    te: "చర రాశి (వేగవంతమైన ఫలితాలు)",
    ta: "சர ராசி (விரைவு வெற்றி & நகர்வு)"
  },
  sthira: {
    kn: "ಸ್ಥಿರ ರಾಶಿ (ಸ್ಥಿರತೆ & ತಾಳ್ಮೆಯ ಫಲ)",
    en: "Sthira Sign (Fixed - Stability & Gradual Realization)",
    hi: "स्थिर राशि (स्थायित्व एवं धैर्य से सफलता)",
    te: "స్థిర రాశి (స్థిరత్వం & సహనం)",
    ta: "ஸ்திர ராசி (நிலையான வெற்றி)"
  },
  dwiswabhava: {
    kn: "ದ್ವಿಸ್ವಭಾವ ರಾಶಿ (ಸಮತೋಲನ & ಮಧ್ಯಮ ಕಾಲ)",
    en: "Dwiswabhava Sign (Dual - Balanced Moderate Horizon)",
    hi: "द्विस्वभाव राशि (संतुलित मध्यम समय)",
    te: "ద్విస్వభావ రాశి (సమతుల్య సమయం)",
    ta: "உபய ராசி (சமநிலை நேரம்)"
  }
};

const ROOT_RULERS_L5: Record<number, { ruler: Record<string, string>; deity: Record<string, string> }> = {
  1: {
    ruler: { kn: "ಸೂರ್ಯ", en: "Sun (Surya)", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" },
    deity: { kn: "ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ", en: "Lord Surya Narayana", hi: "भगवान सूर्यनारायण", te: "శ్రీ సూర్యనారాయణ స్వామి", ta: "ஶ்ரீ சூரியநாராயண சுவாமி" }
  },
  2: {
    ruler: { kn: "ಚಂದ್ರ", en: "Moon (Chandra)", hi: "चंद्र", te: "చంద్రుడు", ta: "சந்திரன்" },
    deity: { kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ & ಚಂದ್ರ ಸ್ವಾಮಿ", en: "Lord Mahabaleshwara & Chandra", hi: "भगवान महाबलेश्वर एवं चंद्र देव", te: "శ్రీ మహాబలేశ్వర & చంద్ర స్వామి", ta: "ஶ்ரீ மகாதேவர் & சந்திர பெருமான்" }
  },
  3: {
    ruler: { kn: "ಗುರು", en: "Jupiter (Guru)", hi: "गुरु", te: "గురుడు", ta: "குரு" },
    deity: { kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ & ಬೃಹಸ್ಪತಿ", en: "Lord Guru & Brihaspati", hi: "भगवान गुरु राघवेंद्र एवं बृहस्पति", te: "శ్రీ గురు రాఘవేంద్ర & బృహస్పతి", ta: "ஶ்ரீ குரு ராகவேந்திரர்" }
  },
  4: {
    ruler: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு" },
    deity: { kn: "ಶ್ರೀ ನರಸಿಂಹ ಸ್ವಾಮಿ & ರಾಹು ದೇವ", en: "Lord Narasimha & Rahu", hi: "भगवान नृसिंह एवं राहु देव", te: "శ్రీ లక్ష్మీ నరసింహ స్వామి", ta: "ஶ்ரீ நரசிம்ம மூர்த்தி" }
  },
  5: {
    ruler: { kn: "ಬುಧ", en: "Mercury (Budha)", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
    deity: { kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ಬುಧ ಸ್ವಾಮಿ", en: "Lord Mahavishnu & Budha", hi: "भगवान महाविष्णु एवं बुध देव", te: "శ్రీ మహావిష్ణువు", ta: "ஶ்ரீ மகாவிஷ்ணு" }
  },
  6: {
    ruler: { kn: "ಶುಕ್ರ", en: "Venus (Shukra)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
    deity: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ", en: "Goddess Mahalakshmi", hi: "माता महालक्ष्मी", te: "శ్రీ మహాలక్ష్మి దేవి", ta: "ஶ்ரீ மகாலக்ஷ்மி தேவி" }
  },
  7: {
    ruler: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது" },
    deity: { kn: "ಶ್ರೀ ಗಣಪತಿ ಸ್ವಾಮಿ", en: "Lord Maha Ganapati", hi: "भगवान महागणपति", te: "శ్రీ మహాగణపతి", ta: "ஶ்ரீ மகாகணபதி" }
  },
  8: {
    ruler: { kn: "ಶನಿ", en: "Saturn (Shani)", hi: "शनि", te: "శని", ta: "சனி" },
    deity: { kn: "ಶ್ರೀ ಹನುಮಂತ & ಶನೈಶ್ಚರ", en: "Lord Hanuman & Shani", hi: "भगवान हनुमान एवं शनैश्चर", te: "శ్రీ హనుమాన్ & శనైశ్చరుడు", ta: "ஶ்ரீ அனுமன் & சனீஸ்வரன்" }
  },
  9: {
    ruler: { kn: "ಮಂಗಳ", en: "Mars (Mangala)", hi: "मंगल", te: "కుజుడు", ta: "செவ்வாய்" },
    deity: { kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ", en: "Lord Subramanya & Kartikeya", hi: "भगवान सुब्रमण्यम", te: "శ్రీ సుబ్రహ్మణ్య స్వామి", ta: "ஶ்ரீ சுப்ரமணிய சுவாமி" }
  }
};

const KARYA_BHAVA_L5: Record<number, Record<string, string>> = {
  1: { kn: "೧ನೇ ಮನೆ - ತನು ಭಾವ (ಆರೋಗ್ಯ, ಆತ್ಮವಿಶ್ವಾಸ & ಸ್ವಂತ ನಿರ್ಧಾರ)", en: "1st House - Tanu Bhava (Health, Self & Personal Identity)", hi: "1म भाव - तनु भाव (स्वास्थ्य व आत्मबल)", te: "1వ ఇల్లు - తను భావం (ఆరోగ్యం & స్వయం)", ta: "1ஆம் இடம் - தனு பாவம் (ஆரோக்கியம் & சுய முடிவு)" },
  2: { kn: "೨ನೇ ಮನೆ - ಧನ ಭಾವ (ಆಸ್ತಿ, ಧನ ಲಾಭ, ಕುಟುಂಬ & ಶೇಖರಣೆ)", en: "2nd House - Dhana Bhava (Wealth, Assets & Family Savings)", hi: "2रा भाव - धन भाव (धन लाभ व संपत्ति)", te: "2వ ఇల్లు - ధన భావం (సంపద & కుటుంబం)", ta: "2ஆம் இடம் - தன பாவம் (செல்வம் & குடும்ப சேமிப்பு)" },
  3: { kn: "೩ನೇ ಮನೆ - ಸಹಜ ಭಾವ (ಧೈರ್ಯ, ಪ್ರಯಾಣ & ಸಹೋದರ)", en: "3rd House - Sahaja Bhava (Courage, Travel & Siblings)", hi: "3रा भाव - सहज भाव (साहस व यात्रा)", te: "3వ ఇల్లు - సహజ భావం (ధైర్యం & ప్రయాణం)", ta: "3ஆம் இடம் - சகஜ பாவம் (துணிவு & பயணம்)" },
  4: { kn: "೪ನೇ ಮನೆ - ಮಾತೃ & ಸುಖ ಭಾವ (ಮನೆ, ಆಸ್ತಿ, ವಾಹನ & ಶಾಂತಿ)", en: "4th House - Sukha Bhava (House Purchase, Property & Vehicle)", hi: "4था भाव - सुख भाव (गृह, संपत्ति व वाहन)", te: "4వ ఇల్లు - సుఖ భావం (ఇల్లు, ఆస్తి & వాహనం)", ta: "4ஆம் இடம் - சுக பாவம் (வீடு, சொத்து & வாகனம்)" },
  5: { kn: "೫ನೇ ಮನೆ - ಪುತ್ರ & ಬುದ್ಧಿ ಭಾವ (ಶಿಕ್ಷಣ, ಸಂತಾನ & ಸೃಜನಶೀಲತೆ)", en: "5th House - Putra Bhava (Education, Children & Creativity)", hi: "5वां भाव - पुत्र भाव (शिक्षा, संतान व ज्ञान)", te: "5వ ఇల్లు - పుత్ర భావం (చదువు, సంతానం & ప్రావీణ్యం)", ta: "5ஆம் இடம் - புத்திர பாவம் (கல்வி, குழந்தை & அறிவு)" },
  6: { kn: "೬ನೇ ಮನೆ - ಶತ್ರು & ರೋಗ ಭಾವ (ಉದ್ಯೋಗ ಪರೀಕ್ಷೆ, ಸಾಲ & ಕೋರ್ಟ್ ಜಯ)", en: "6th House - Satru Bhava (Competition, Debts & Overcoming Hurdles)", hi: "6ठा भाव - शत्रु भाव (प्रतियोगिता, ऋण व विजय)", te: "6వ ఇల్లు - శత్రు భావం (పోటీ పరీక్షలు & ఋణ విముక్తి)", ta: "6ஆம் இடம் - சத்ரு பாவம் (போட்டி, கடன் & வழக்கு வெற்றி)" },
  7: { kn: "೭ನೇ ಮನೆ - ಕಳತ್ರ ಭಾವ (ವಿವಾಹ, ಬಿಸಿನೆಸ್ ಪಾರ್ಟ್‌ನರ್ & ಬಾಂಧವ್ಯ)", en: "7th House - Kalatra Bhava (Marriage, Partnership & Relationships)", hi: "7वां भाव - कलत्र भाव (विवाह व व्यापार साझेदारी)", te: "7వ ఇల్లు - కళత్ర భావం (వివాహం & వ్యాపార భాగస్వామ్యం)", ta: "7ஆம் இடம் - களத்திர பாவம் (திருமணம் & வணிகக் கூட்டு)" },
  8: { kn: "೮ನೇ ಮನೆ - ಆಯುರ್ ಭಾವ (ಅಡಚಣೆ ನಿವಾರಣೆ & ಆಕಸ್ಮಿಕ ಲಾಭ)", en: "8th House - Ayur Bhava (Overcoming Obstacles & Hidden Matters)", hi: "8वां भाव - आयुर भाव (बाधा निवारण व गुप्त लाभ)", te: "8వ ఇల్లు - ఆయుర్ భావం (అంతరాయాల నివారణ)", ta: "8ஆம் இடம் - ஆயுள் பாவம் (தடை நீக்கம் & திடீர் யோகம்)" },
  9: { kn: "೯ನೇ ಮನೆ - ಭಾಗ್ಯ ಭಾವ (ದೈವ ಕೃಪೆ, ಭಾಗ್ಯೋದಯ & ಉನ್ನತ ಶಿಕ್ಷಣ)", en: "9th House - Bhagya Bhava (Fortune, Luck & Higher Studies)", hi: "9वां भाव - भाग्य भाव (भाग्योदय, धर्म व उच्च शिक्षा)", te: "9వ ఇల్లు - భాగ్య భావం (అదృష్టం, ధర్మం & ఉన్నత విద్య)", ta: "9ஆம் இடம் - பாக்கிய பாவம் (அதிர்ஷ்டம் & உயர் கல்வி)" },
  10: { kn: "೧೦ನೇ ಮನೆ - ಕರ್ಮ ಭಾವ (ಉದ್ಯೋಗ ಬಡ್ತಿ, ವೃತ್ತಿ & ಅಧಿಕಾರ)", en: "10th House - Karma Bhava (Career Promotion, Profession & Status)", hi: "10वां भाव - कर्म भाव (करियर पदोन्नति व प्रतिष्ठा)", te: "10వ ఇల్లు - కర్మ భావం (ఉద్యోగ ప్రమోషన్ & వృత్తి)", ta: "10ஆம் இடம் - கர்ம பாவம் (வேலை உயர்வு & தொழில்)" },
  11: { kn: "೧೧ನೇ ಮನೆ - ಲಾಭ ಭಾವ (ಅತ್ಯುತ್ತಮ ಧನ ಲಾಭ & ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ)", en: "11th House - Labha Bhava (High Profits, Gains & Desire Fulfillment)", hi: "11वां भाव - लाभ भाव (अत्युत्तम धन लाभ व सफलता)", te: "11వ ఇల్లు - లాభ భావం (లాభాలు & కోరికల ఈడేర్పు)", ta: "11ஆம் இடம் - லாப பாவம் (தன லாபம் & விருப்பம் நிறைவேறுதல்)" },
  12: { kn: "೧೨ನೇ ಮನೆ - ವ್ಯಯ ಭಾವ (ವಿದೇಶ ಪ್ರಯಾಣ & ವೆಚ್ಚ ನಿಯಂತ್ರಣ)", en: "12th House - Vyaya Bhava (Foreign Travel, Expenses & Retreat)", hi: "12वां भाव - व्यय भाव (विदेश यात्रा व व्यय नियंत्रण)", te: "12వ ఇల్లు - వ్యయ భావం (విదేశీ ప్రయాణం & వ్యయం)", ta: "12ஆம் இடம் - விரய பாவம் (வெளிநாட்டுப் பயணம் & விரயம்)" }
};

// ----------------------------------------------------------------------
// MATHEMATICAL COMPUTATION HELPERS
// ----------------------------------------------------------------------

export function calculateDigitalRoot(n: number): number {
  const absN = Math.abs(Math.floor(n));
  if (absN === 0) return 9;
  const rem = absN % 9;
  return rem === 0 ? 9 : rem;
}

export function calculatePrashnaLagnaHouse(n: number): number {
  const absN = Math.abs(Math.floor(n));
  if (absN === 0) return 12;
  const rem = absN % 12;
  return rem === 0 ? 12 : rem;
}

export function getSignMobility(rashiIndex: number): SignMobility {
  // 0=Aries (Chara), 1=Taurus (Sthira), 2=Gemini (Dwiswabhava), 3=Cancer (Chara)...
  const mod = rashiIndex % 3;
  if (mod === 0) return "chara";
  if (mod === 1) return "sthira";
  return "dwiswabhava";
}

/** Keyword Intent Classification for Karya Sthana Bhava */
export function detectKaryaBhava(query: string): number {
  const text = query.toLowerCase();

  // Career / Job / Promotion
  if (/job|promot|work|career|interview|salary|business|wurk|ವೃತ್ತಿ|ಉದ್ಯೋಗ|ಬಡ್ತಿ|ಕೆಲಸ|ಸಂಬಳ|ವ್ಯಾಪಾರ|नौकरी|करियर|उद्योग|ఉద్యోగం|వృత్తి|வேலை|தொழில்/.test(text)) {
    return 10;
  }
  // House / Property / Land / Vehicle
  if (/house|home|land|property|flat|site|car|vehicle|buy|purchase|ಆಸ್ತಿ|ಮನೆ|ವಾಹನ|ಖರೀದಿ|ಸ್ಥಳ|मकान|भूमि|वाहन|सम्पत्ति|ఇల్లు|ఆస్తి|వాహనం|வீடு|நிலம்|வாகனம்/.test(text)) {
    return 4;
  }
  // Marriage / Relationship / Spouse / Love
  if (/marria|marrige|wedding|match|spouse|husband|wife|love|relationship|ವಿವಾಹ|ಮದುವೆ|ಪತಿ|ಪತ್ನಿ|ಸಂಬಂಧ|ವರ|ವಧು|विवाह|शादी|पति|पत्नी|లగ్నం|పెళ్లి|వివాహం|திருமணம்|கல்யாணம்/.test(text)) {
    return 7;
  }
  // Wealth / Money / Loan / Finance
  if (/money|wealth|cash|finance|profit|debt|loan|ಸಾಲ|ಧನ|ಹಣ|ಲಾಭ|ಸಂಪತ್ತು|धन|पैसा|ऋण|लाभ|ధనం|డబ్బు|ఋణం|தனம்|பணம்|கடன்/.test(text)) {
    return 11;
  }
  // Education / Exam / Higher Studies
  if (/exam|study|educat|college|degree|mark|rank|ಪರೀಕ್ಷೆ|ಶಿಕ್ಷಣ|ಅಂಕ|ರ‍್ಯಾಂಕ್|ಓದು|परीक्षा|शिक्षा|अंक|చదువు|పరీక్ష|தேர்வு|கல்வி/.test(text)) {
    return 5;
  }
  // Health / Court / Legal Competition
  if (/health|disease|court|case|legal|cure|ಆರೋಗ್ಯ|ರೋಗ|ಕೋರ್ಟ್|ವ್ಯಾಜ್ಯ|ಸಾಧನೆ|स्वास्थ्य|रोग|कोर्ट|आरोग्यం|கேஸ்|சிகிச்சை/.test(text)) {
    return 6;
  }
  // Foreign Travel / Visa
  if (/foreign|abroad|visa|travel|passport|ವಿದೇಶ|ಪ್ರಯಾಣ|ವೀಸಾ|विदेश|यात्रा|విదేశీ|வெளிநாடு/.test(text)) {
    return 12;
  }

  // Default to 1st House (General Prosperity)
  return 1;
}

/** Compound Number Mathematical Symbolism */
export function analyzeCompoundNumber(n: number, lang: string): Record<string, string> {
  const digits = String(Math.abs(Math.floor(n))).split("");
  const root = calculateDigitalRoot(n);

  if (digits.length === 1) {
    return {
      kn: `ಏಕ ಸಂಖ್ಯೆ ${n}: ಇದು ಪ್ರತ್ಯಕ್ಷ ${ROOT_RULERS_L5[root]?.ruler.kn} ಗ್ರಹದ ನೇರ ಶಕ್ತಿಯನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ.`,
      en: `Single digit ${n}: Direct concentrated influence of ${ROOT_RULERS_L5[root]?.ruler.en}.`,
      hi: `एकल अंक ${n}: यह सीधे ${ROOT_RULERS_L5[root]?.ruler.hi} ग्रह का प्रभाव दर्शाता है।`,
      te: `ఏక సంఖ్య ${n}: ఇది నేరుగా ${ROOT_RULERS_L5[root]?.ruler.te} శక్తిని సూచిస్తుంది.`,
      ta: `ஒற்றை எண் ${n}: இது நேரடியாக ${ROOT_RULERS_L5[root]?.ruler.ta} கிரகத்தின் ஆற்றலை குறிக்கிறது.`
    };
  }

  const combinationStr = digits.join(" + ");
  return {
    kn: `ಸಂಯುಕ್ತ ಸಂಖ್ಯೆ ${n} (${combinationStr} = ${root}): ಇದು ${digits.map(d => ROOT_RULERS_L5[calculateDigitalRoot(Number(d))]?.ruler.kn).join(" ಹಾಗೂ ")} ಗ್ರಹಗಳ ಸಮ್ಮಿಶ್ರ ಶಕ್ತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.`,
    en: `Compound Number ${n} (${combinationStr} = ${root}): Blended planetary energy of ${digits.map(d => ROOT_RULERS_L5[calculateDigitalRoot(Number(d))]?.ruler.en).join(" and ")}.`,
    hi: `संयुक्त संख्या ${n} (${combinationStr} = ${root}): ${digits.map(d => ROOT_RULERS_L5[calculateDigitalRoot(Number(d))]?.ruler.hi).join(" एवं ")} ग्रहों का मिश्रित प्रभाव।`,
    te: `సంయుక్త సంఖ్య ${n} (${combinationStr} = ${root}): ${digits.map(d => ROOT_RULERS_L5[calculateDigitalRoot(Number(d))]?.ruler.te).join(" మరియు ")} గ్రహాల కలయిక.`,
    ta: `கூட்டு எண் ${n} (${combinationStr} = ${root}): ${digits.map(d => ROOT_RULERS_L5[calculateDigitalRoot(Number(d))]?.ruler.ta).join(" மற்றும் ")} கிரகங்களின் ஒருங்கிணைந்த ஆற்றல்.`
  };
}

// ----------------------------------------------------------------------
// MAIN ENGINE COMPUTATION FUNCTION
// ----------------------------------------------------------------------

export async function executeSankhyaShastraPrashna(
  rawQuestion: string,
  userNumber: number,
  lang: string,
  apiKey: string
): Promise<SankhyaShastraResult> {
  const langCode = (lang || "kn").slice(0, 2);

  // 1. Prashna Lagna House & Rashi Index
  const houseNum = calculatePrashnaLagnaHouse(userNumber);
  const lagnaIndex = (houseNum - 1) % 12;
  const lagnaName = RASHI_L5[lagnaIndex] || RASHI_L5[0]!;
  const lagnaLord = RASHI_LORDS_L5[lagnaIndex] || RASHI_LORDS_L5[0]!;

  const mobility = getSignMobility(lagnaIndex);
  const mobilityLabel = MOBILITY_L5[mobility];

  // 2. Digital Root & Ruling Deity
  const rootNum = calculateDigitalRoot(userNumber);
  const rootData = ROOT_RULERS_L5[rootNum] || ROOT_RULERS_L5[1]!;
  const compoundAnalysis = analyzeCompoundNumber(userNumber, langCode);

  // 3. Detect Karya Sthana Bhava
  const karyaBhava = detectKaryaBhava(rawQuestion);
  const karyaLabel = KARYA_BHAVA_L5[karyaBhava] || KARYA_BHAVA_L5[1]!;

  // 4. Live Ephemeris Planetary Transits
  const now = new Date();
  const longs = siderealLongitudes(now, "lahiri");

  const planetDefs = [
    { key: "sun", name: { kn: "ಸೂರ್ಯ", en: "Sun (Surya)", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" }, isBenefic: false },
    { key: "moon", name: { kn: "ಚಂದ್ರ", en: "Moon (Chandra)", hi: "चंद्र", te: "చంద్రుడు", ta: "சந்திரன்" }, isBenefic: true },
    { key: "mars", name: { kn: "ಮಂಗಳ", en: "Mars (Mangala)", hi: "मंगल", te: "కుజుడు", ta: "செவ்வாய்" }, isBenefic: false },
    { key: "mercury", name: { kn: "ಬುಧ", en: "Mercury (Budha)", hi: "बुध", te: "బుధుడు", ta: "புதன்" }, isBenefic: true },
    { key: "jupiter", name: { kn: "ಗುರು", en: "Jupiter (Guru)", hi: "गुरु", te: "గురుడు", ta: "குரு" }, isBenefic: true },
    { key: "venus", name: { kn: "ಶುಕ್ರ", en: "Venus (Shukra)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" }, isBenefic: true },
    { key: "saturn", name: { kn: "ಶನಿ", en: "Saturn (Shani)", hi: "शनि", te: "శని", ta: "சனி" }, isBenefic: false },
    { key: "rahu", name: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு" }, isBenefic: false },
    { key: "ketu", name: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது" }, isBenefic: false }
  ];

  const transitPlanets = planetDefs.map((p) => {
    const deg = longs[p.key as keyof typeof longs] ?? 0;
    const rIndex = Math.floor(deg / 30) % 12;
    const houseFromLagna = ((rIndex - lagnaIndex + 12) % 12) + 1;
    return {
      planetKey: p.key,
      planetName: p.name,
      rashiIndex: rIndex,
      rashiName: RASHI_L5[rIndex] || RASHI_L5[0]!,
      houseFromLagna,
      isBenefic: p.isBenefic
    };
  });

  // 5. Mathematical Prashna Bala Score Calculation (0..100%)
  let score = 50;

  // Benefics in Kendra/Trikona from Lagna (+20%)
  const beneficsInGoodHouses = transitPlanets.filter(
    (tp) => tp.isBenefic && [1, 4, 5, 7, 9, 10, 11].includes(tp.houseFromLagna)
  ).length;
  score += beneficsInGoodHouses * 8;

  // Malefics in 3, 6, 11 Upachaya Houses (+15%)
  const maleficsInUpachaya = transitPlanets.filter(
    (tp) => !tp.isBenefic && [3, 6, 11].includes(tp.houseFromLagna)
  ).length;
  score += maleficsInUpachaya * 6;

  // Moon Position Strength (+15%)
  const moonTp = transitPlanets.find((tp) => tp.planetKey === "moon");
  if (moonTp && [1, 3, 6, 7, 10, 11].includes(moonTp.houseFromLagna)) {
    score += 15;
  } else if (moonTp && moonTp.houseFromLagna === 8) {
    score -= 15; // Chandrashtama Prashna
  }

  // Root Ruler Compatibility (+10%)
  if ([1, 2, 3, 5, 6, 9].includes(rootNum)) {
    score += 10;
  }

  const finalScore = Math.max(25, Math.min(98, score));

  // 6. Verdict Classification & Time Horizon
  let verdictCat: SankhyaShastraResult["verdictCategory"] = "moderate_success";
  if (finalScore >= 75) verdictCat = "high_success";
  else if (finalScore >= 55) verdictCat = "moderate_success";
  else if (finalScore >= 40) verdictCat = "delay_with_effort";
  else verdictCat = "caution_rest";

  const verdictLabels: Record<SankhyaShastraResult["verdictCategory"], Record<string, string>> = {
    high_success: {
      kn: "🟢 ಅತ್ಯುನ್ನತ ಸಿದ್ಧಿ & ತ್ವರಿತ ಜಯ (High Success & Auspicious Realization)",
      en: "🟢 High Success & Auspicious Realization",
      hi: "🟢 अत्यंत शुभ परिणाम एवं उत्तम सफलता",
      te: "🟢 అత్యున్నత విజయము & అనుకూల ఫలితాలు",
      ta: "🟢 மிகுந்த வெற்றி & சுப பலன்"
    },
    moderate_success: {
      kn: "🟡 ಸಮತೋಲಿತ ಜಯ & ಯತ್ನ ಸಿದ್ಧಿ (Favorable with Steady Effort)",
      en: "🟡 Favorable Progress with Steady Effort",
      hi: "🟡 सतत प्रयास से अनुकूल सफलता",
      te: "🟡 ప్రయత్నంతో అనుకూల విజయం",
      ta: "🟡 இடைவிடா முயற்சியால் வெற்றி"
    },
    delay_with_effort: {
      kn: "🟠 ಕಾಲ ವಿಳಂಬ & ತಾಳ್ಮೆಯ ಅಗತ್ಯ (Progress Expected with Patience)",
      en: "🟠 Progress Expected with Patience & Delay",
      hi: "🟠 धैर्य एवं प्रतीक्षा की आवश्यकता",
      te: "🟠 కొంత సమయం & ఓర్పు అవసరం",
      ta: "🟠 தாமதத்திற்கு பின் வெற்றி"
    },
    caution_rest: {
      kn: "🔴 ಎಚ್ಚರಿಕೆಯ ಹೆಜ್ಜೆ & ದೈವ ಪ್ರಾರ್ಥನೆಗೆ ಸೂಕ್ತ (Caution & Prayer Suggested)",
      en: "🔴 Caution & Divine Prayer Advised",
      hi: "🔴 सावधानी एवं देव प्रार्थना श्रेयस्कर",
      te: "🔴 జాగ్రత్త & దైవ ప్రార్థన అవసరం",
      ta: "🔴 கவனம் & இறை வழிபாடு தேவை"
    }
  };

  const timeHorizonLabels: Record<SignMobility, Record<string, string>> = {
    chara: {
      kn: "⏱️ ಸಮಯ ಸೂಚನೆ: ೩ ರಿಂದ ೭ ದಿನಗಳು ಅಥವಾ ೨ ವಾರಗಳ ಒಳಗೆ ತ್ವರಿತ ಶುಭ ಫಲ",
      en: "⏱️ Time Horizon: Quick results within 3 to 7 Days or 2 Weeks",
      hi: "⏱️ समय अवधि: 3 से 7 दिनों अथवा 2 सप्ताह के भीतर शीघ्र फल",
      te: "⏱️ సమయ సూచన: 3 నుండి 7 రోజులు లేదా 2 వారాలలో వేగవంతమైన ఫలితం",
      ta: "⏱️ நேர அளவு: 3 முதல் 7 நாட்கள் அல்லது 2 வாரத்திற்குள் வெற்றி"
    },
    sthira: {
      kn: "⏱️ ಸಮಯ ಸೂಚನೆ: ೧ ರಿಂದ ೩ ತಿಂಗಳುಗಳ ನಿರಂತರ ಶ್ರಮದ ನಂತರ ಪೂರ್ಣ ಸಿದ್ಧಿ",
      en: "⏱️ Time Horizon: Complete realization in 1 to 3 Months with steady action",
      hi: "⏱️ समय अवधि: 1 से 3 महीनों में निरंतर प्रयास के पश्चात सिद्धि",
      te: "⏱️ సమయ సూచన: 1 నుండి 3 నెలలలో స్థిరమైన ఫలితం",
      ta: "⏱️ நேர அளவு: 1 முதல் 3 மாதத்திற்குள் உறுதியான வெற்றி"
    },
    dwiswabhava: {
      kn: "⏱️ ಸಮಯ ಸೂಚನೆ: ೨ ರಿಂದ ೪ ವಾರಗಳ ಅವಧಿಯಲ್ಲಿ ಯಶಸ್ಸಿನ ಹೆಜ್ಜೆ",
      en: "⏱️ Time Horizon: Favorable progress unfolding in 2 to 4 Weeks",
      hi: "⏱️ समय अवधि: 2 से 4 सप्ताह की अवधि में अनुकूलता",
      te: "⏱️ సమయ సూచన: 2 నుండి 4 వారాలలో ఫలితం",
      ta: "⏱️ நேர அளவு: 2 முதல் 4 வாரங்களுக்குள் முன்னேற்றம்"
    }
  };

  const remedyLabels: Record<number, Record<string, string>> = {
    1: { kn: "ಆದಿತ್ಯ ಹ್ರದಯ ಸ್ತೋತ್ರ ಪಠಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ತುಪ್ಪದ ದೀಪ ನಮಸ್ಕಾರ.", en: "Recite Aditya Hrudayam Stotram & offer ghee lamp at Sri Gokarna Mahabaleshwara." },
    2: { kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ಓಂ ನಮಃ ಶಿವಾಯ ಮಂತ್ರ ಜಪ.", en: "Offer Ksheerabhishekam & chant Om Namah Shivaya." },
    3: { kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಬ್ರಾಹ್ಮಣರಿಗೆ ಹಳದಿ ಧಾನ್ಯ ದಾನ.", en: "Pray to Lord Guru Raghavendra & offer yellow grains." },
    4: { kn: "ಶ್ರೀ ನರಸಿಂಹ ಕವಚ ಪಾರಾಯಣ ಹಾಗೂ ರಾಹು ಕಾಲದಲ್ಲಿ ಬೆಲ್ಲ ಸಮರ್ಪಣೆ.", en: "Recite Sri Narasimha Kavacham & offer jaggery." },
    5: { kn: "ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣೆ ಹಾಗೂ ಗೋವುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು ನೀಡುವುದು.", en: "Chant Sri Vishnu Sahasranamam & feed green grass to cows." },
    6: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಅಷ್ಟೋತ್ತರ ಪಾರಾಯಣ ಹಾಗೂ ಶುಕ್ರವಾರ ಬಿಳಿ ಹೂವಿನ ಪೂಜೆ.", en: "Recite Sri Mahalakshmi Ashtottaram & offer white flowers." },
    7: { kn: "ಶ್ರೀ ಸಂಕಷ್ಟಹರ ಮಹಾಗಣಪತಿ ಪೂಜೆ ಹಾಗೂ ಕಪ್ಪು ಎಳ್ಳಿನ ಗಣಪತಿ ಪ್ರಾರ್ಥನೆ.", en: "Pray to Lord Sankashtahara Maha Ganapati with sesame seeds." },
    8: { kn: "ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣೆ ಹಾಗೂ ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ನಮಸ್ಕಾರ.", en: "Chant Sri Hanuman Chalisa & light sesame oil lamp." },
    9: { kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟೋತ್ತರ ಪಾರಾಯಣ ಹಾಗೂ ಮಂಗಳವಾರ ಕೆಂಪು ಹೂವಿನ ಅರ್ಚನೆ.", en: "Chant Sri Subramanya Ashtottaram & offer red flowers." }
  };

  // 7. Format Clean Deterministic Summary for AI Persona Prompt
  const deterministicSummary = `
================================================================
🕉️ MATHEMATICAL PRASHNA ENGINE DETERMINISTIC CALCULATION REPORT
================================================================
1. Devotee Question: "${rawQuestion}"
2. Chosen Number: ${userNumber}
3. Digital Root Number: ${rootNum} (Ruler: ${rootData.ruler[langCode]}, Deity: ${rootData.deity[langCode]})
4. Prashna Lagna: House ${houseNum} (${lagnaName[langCode]}, Lord: ${lagnaLord[langCode]}, Mobility: ${mobilityLabel[langCode]})
5. Karya Sthana: ${karyaLabel[langCode]}
6. Prashna Score: ${finalScore}% (${verdictLabels[verdictCat][langCode]})
7. Time Horizon: ${timeHorizonLabels[mobility][langCode]}
8. Sacred Remedy: ${remedyLabels[rootNum]?.[langCode as keyof typeof remedyLabels[1]] || remedyLabels[1]!['kn']}
9. Transit Planets relative to Prashna Lagna:
${transitPlanets.map((tp) => `   - ${tp.planetName[langCode as keyof typeof tp.planetName]}: House ${tp.houseFromLagna} (${tp.rashiName[langCode as keyof typeof tp.rashiName]})`).join("\n")}
================================================================
`;

  // 8. Gemini AI Narration (Formatting ONLY)
  const narrationPrompt = `
You are Sri Shreeram Pandit, Chief Astrologer and Sankhya Shastra Master from Gokarna Mahabaleshwara Kshetra.
The mathematical engine has computed 100% of the Prashna calculations above.
Your sole job is to write a compassionate, dignified, clear 5-section reading directly communicating these EXACT engine findings to the devotee.

CRITICAL INSTRUCTIONS:
- Do NOT alter any mathematical values, score, Lagna, or house numbers computed by the engine!
- Section Titles to use (in native script of requested language ${langCode}):
  1. 🔮 **ಪ್ರಶ್ನಾ ಲಗ್ನ ಹಾಗೂ ಸಂಖ್ಯಾ ಶಕ್ತಿ ವಿಶ್ಲೇಷಣೆ (Prashna Lagna & Number Power Analysis)**
  2. 🪐 **ಗೋಚಾರ ಗ್ರಹ ಬಲ & ಕಾರಕತ್ವ (Planetary Transits & House Indications)**
  3. 🎯 **ನಿಖರ ಭವಿಷ್ಯ & ಉತ್ತರ (Direct Clear Answer to the Question)**
  4. ⏰ **ಸಮಯ ಸೂಚನೆ & ಜಯ ಸಾಧನೆಯ ಮಾರ್ಗ (Timing & Actionable Guidance)**
  5. 🪔 **ವಿಶೇಷ ದೈವಿಕ ಪರಿಹಾರ & ಮಂತ್ರ (Sacred Gokarna Remedy & Daily Mantra)**
- Respond EXCLUSIVELY in the requested language script: ${langCode}.
`;

  const aiPrediction = await askGemini(rawQuestion, deterministicSummary + "\n" + narrationPrompt, apiKey, langCode, {
    temperature: 0.5
  });

  return {
    rawQuestion,
    formattedQuestion: rawQuestion,
    userNumber,
    prashnaLagnaHouse: houseNum,
    prashnaLagnaIndex: lagnaIndex,
    prashnaLagnaName: lagnaName,
    prashnaLagnaLord: lagnaLord,
    signMobility: mobility,
    signMobilityLabel: mobilityLabel,
    rootNumber: rootNum,
    rootRulerName: rootData.ruler,
    rootDeity: rootData.deity,
    compoundAnalysis,
    primaryKaryaBhava: karyaBhava,
    primaryKaryaLabel: karyaLabel,
    transitPlanets,
    prashnaBalaScore: finalScore,
    verdictCategory: verdictCat,
    verdictLabel: verdictLabels[verdictCat],
    timeHorizonLabel: timeHorizonLabels[mobility],
    remedyRecommendation: remedyLabels[rootNum] || remedyLabels[1]!,
    aiPrediction,
    generatedAt: now.toLocaleString()
  };
}

/** Execute follow-up question in existing Sankhya Shastra chat thread */
export async function askSankhyaShastraFollowUp(
  previousResult: SankhyaShastraResult,
  followUpQuestion: string,
  lang: string,
  apiKey: string
): Promise<string> {
  const langCode = (lang || "kn").slice(0, 2);

  const contextData = `
================================================================
BAGGONA SANKHYA SHASTRA FOLLOW-UP CONTEXT
================================================================
Original Number: ${previousResult.userNumber} (Root ${previousResult.rootNumber}, Lagna: ${previousResult.prashnaLagnaName.en})
Original Question: "${previousResult.rawQuestion}"
Engine Score: ${previousResult.prashnaBalaScore}% (${previousResult.verdictLabel.en})
Previous Prediction Summary: ${previousResult.aiPrediction.slice(0, 400)}...
================================================================
`;

  const prompt = `
You are Sri Shreeram Pandit from Gokarna Mahabaleshwara Kshetra.
The devotee is asking a follow-up clarification question on their previous Sankhya Shastra reading: "${followUpQuestion}".
Provide a concise, direct, wise, and encouraging answer strictly in the requested language (${langCode}).
`;

  return askGemini(followUpQuestion, contextData + "\n" + prompt, apiKey, langCode, {
    temperature: 0.6
  });
}
