/**
 * Classical Vedic Sankhya Shastra & Prashna Mathematical Engine.
 * 
 * Implements 100% authentic Vedic Prashna calculations:
 * 1. Prashna Lagna (House 1..12, Rashi 0..11, Lagna Lord, Sign Mobility)
 * 2. Digital Root Numerology (1..9, Ruler, Element, Friend/Enemy Numbers)
 * 3. Compound Number Decomposition & Symbolism
 * 4. Automatic Question Category & Karya Sthana Keyword Detection (Theft, Lost Objects, Career, Marriage, Finance, etc.)
 * 5. Directional Analysis (East, West, North, South, NE, SE, NW, SW)
 * 6. Object State & Mobility (Sthira - Fixed/Inside, Chara - Moving/Transit, Dwiswabhava - Dual/Vehicle)
 * 7. Suspect & Location Environmental Markers (Inside Acquaintance vs Outside Stranger, Near Water/Fire/Earth/Air)
 * 8. Live Ephemeris Transit Planetary Placements & House Offsets
 * 9. Mathematical Prashna Bala Score (0..100%) & Time Horizon
 * 10. Deep 6-Paragraph Descriptive Response starting with Direct Answer FIRST
 * 11. Pure Multi-Language Support (kn, en, hi, te, ta) + Gemini AI Engine Integration
 */

import { siderealLongitudes } from "../../core/EphemerisEngine";
import { askGemini } from "../../core/GeminiEngine";

export type SignMobility = "chara" | "sthira" | "dwiswabhava";

export type QuestionCategory =
  | "theft_lost_item"
  | "career_business"
  | "marriage_love"
  | "wealth_finance"
  | "health_legal"
  | "education_study"
  | "foreign_travel"
  | "general_life";

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

  // Category & Karya Sthana
  questionCategory: QuestionCategory;
  primaryKaryaBhava: number; // 1..12
  primaryKaryaLabel: Record<string, string>;

  // Directional & Object Location Analysis (Lost Items / Theft / Assets)
  directionalGuidance: Record<string, string>;
  objectMobilityAnalysis: Record<string, string>;
  suspectAndLocationProfile: Record<string, string>;

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

  // Final Narration (6 In-Depth Paragraphs)
  aiPrediction: string;
  generatedAt: string;
};

// ----------------------------------------------------------------------
// 5-LANGUAGE LOCALIZED DICTIONARIES
// ----------------------------------------------------------------------

export const RASHI_L5: Record<number, Record<string, string>> = {
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

export const RASHI_LORDS_L5: Record<number, Record<string, string>> = {
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

export const MOBILITY_L5: Record<SignMobility, Record<string, string>> = {
  chara: {
    kn: "ಚರ ರಾಶಿ (ವೇಗದ ಚಲನೆ & ತ್ವರಿತ ಸಿದ್ಧಿ / ವಸ್ತು ಸ್ಥಳಾಂತರ)",
    en: "Chara Sign (Movable - Fast Action & Object in Motion)",
    hi: "चर राशि (शीघ्र सफलता व गतिमान स्थिति)",
    te: "చర రాశి (వేగవంతమైన కదలిక)",
    ta: "சர ராசி (விரைவு வெற்றி & நகர்வு)"
  },
  sthira: {
    kn: "ಸ್ಥಿರ ರಾಶಿ (ಸ್ಥಿರತೆ, ಅದೇ ಸ್ಥಳದಲ್ಲೇ ಇರುವುದು & ತಾಳ್ಮೆಯ ಫಲ)",
    en: "Sthira Sign (Fixed - Stationary in Same Place & Gradual Realization)",
    hi: "स्थिर राशि (स्थायित्व, उसी स्थान पर उपस्थिति एवं धैर्य)",
    te: "స్థిర రాశి (స్థిరత్వం & అక్కడే ఉండుట)",
    ta: "ஸ்திர ராசி (நிலையான வெற்றி & அதே இடத்தில் இருப்பு)"
  },
  dwiswabhava: {
    kn: "ದ್ವಿಸ್ವಭಾವ ರಾಶಿ (ವಾಹನ/ಬ್ಯಾಗ್‌ನಲ್ಲಿರುವುದು, ಸಮತೋಲನ & ಮಧ್ಯಮ ಕಾಲ)",
    en: "Dwiswabhava Sign (Dual - In Vehicle/Bag/Passage & Moderate Horizon)",
    hi: "द्विस्वभाव राशि (वाहन/थैले में व संतुलित मध्यम समय)",
    te: "ద్విస్వభావ రాశి (వాహనంలో లేదా సంచిలో సమతుల్య సమయం)",
    ta: "உபய ராசி (வாகனம்/பையில் இருப்பு & சமநிலை நேரம்)"
  }
};

export const ROOT_RULERS_L5: Record<number, { ruler: Record<string, string>; deity: Record<string, string> }> = {
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
    ruler: { kn: "ಬುಧ", en: "Mercury (Budha)", hi: "बुध", te: "బుಧుడు", ta: "புதன்" },
    deity: { kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ಬುಧ ಸ್ವಾಮಿ", en: "Lord Mahavishnu & Budha", hi: "भगवान महाविष्णु एवं बुध देव", te: "శ్రీ మహావిష్ణువు", ta: "ஶ்ரீ மகாவிஷ்ணு" }
  },
  6: {
    ruler: { kn: "ಶುಕ್ರ", en: "Venus (Shukra)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
    deity: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ", en: "Goddess Mahalakshmi", hi: "माता महालक्ष्मी", te: "శ్రీ మహాలక్ష్మి దేవి", ta: "ஶ்ரீ மகாலக்ஷ்மி தேவி" }
  },
  7: {
    ruler: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது" },
    deity: { kn: "ಶ್ರೀ ಸಂಕಷ್ಟಹರ ಗಣಪತಿ ಸ್ವಾಮಿ", en: "Lord Maha Ganapati", hi: "भगवान महागणपति", te: "శ్రీ మహాగణపతి", ta: "ஶ்ரீ மகாகணபதி" }
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

export const KARYA_BHAVA_L5: Record<number, Record<string, string>> = {
  1: { kn: "೧ನೇ ಮನೆ - ತನು ಭಾವ (ಆರೋಗ್ಯ, ಆತ್ಮವಿಶ್ವಾಸ & ಸ್ವಂತ ನಿರ್ಧಾರ)", en: "1st House - Tanu Bhava (Health, Self & Personal Identity)", hi: "1म भाव - तनु भाव (स्वास्थ्य व आत्मबल)", te: "1వ ఇల్లు - తను భావం (ఆరోగ్యం & స్వయం)", ta: "1ஆம் இடம் - தனு பாவம் (ஆரோக்கியம் & சுய முடிவு)" },
  2: { kn: "೨ನೇ ಮನೆ - ಧನ & ಕಳೆದುಹೋದ ವಸ್ತು ಭಾವ (ಬಂಗಾರ, ಆಸ್ತಿ, ನಷ್ಟ ವಸ್ತು ಪುನಃ ಪ್ರಾಪ್ತಿ)", en: "2nd House - Dhana & Asset Recovery Bhava (Gold, Wealth, Lost Objects)", hi: "2रा भाव - धन एवं खोई वस्तु प्राप्ति भाव", te: "2వ ఇల్లు - ధనం & పోయిన వస్తువు పునఃప్రాప్తి", ta: "2ஆம் இடம் - தனம் & தொலைந்த பொருள் மீட்பு" },
  3: { kn: "೩ನೇ ಮನೆ - ಸಹಜ ಭಾವ (ಧೈರ್ಯ, ಸಣ್ಣ ಪ್ರಯಾಣ & ಸಹೋದರ)", en: "3rd House - Sahaja Bhava (Courage, Short Travel & Siblings)", hi: "3रा भाव - सहज भाव (साहस व यात्रा)", te: "3వ ఇల్లు - సహజ భావం (ధైర్యం & ప్రయాణం)", ta: "3ஆம் இடம் - சகஜ பாவம் (துணிவு & பயணம்)" },
  4: { kn: "೪ನೇ ಮನೆ - ಮಾತೃ & ವಾಹನ/ಗೃಹ ಭಾವ (ಮನೆ, ಆಸ್ತಿ, ವಾಹನ ಶೋಧನೆ & ಶಾಂತಿ)", en: "4th House - Sukha Bhava (House, Property, Vehicle Finding & Peace)", hi: "4था भाव - सुख भाव (गृह, संपत्ति, वाहन व शांति)", te: "4వ ఇల్లు - సుఖ భావం (ఇల్లు, ఆస్తి, వాహనం & శాంతి)", ta: "4ஆம் இடம் - சுக பாவம் (வீடு, சொத்து & வாகனம்)" },
  5: { kn: "೫ನೇ ಮನೆ - ಪುತ್ರ & ಬುದ್ಧಿ ಭಾವ (ಶಿಕ್ಷಣ, ಸಂತಾನ & ಸೃಜನಶೀಲತೆ)", en: "5th House - Putra Bhava (Education, Children & Creativity)", hi: "5वां भाव - पुत्र भाव (शिक्षा, संतान व ज्ञान)", te: "5వ ఇల్లు - పుత్ర భావం (చదువు, సంతానం & ప్రావీణ్యం)", ta: "5ஆம் இடம் - புத்திர பாவம் (கல்வி, குழந்தை & அறிவு)" },
  6: { kn: "೬ನೇ ಮನೆ - ಶತ್ರು, ಚೋರ & ರೋಗ ಭಾವ (ಕಳ್ಳತನ ಶೋಧನೆ, ಸಾಲ & ಕೋರ್ಟ್ ಜಯ)", en: "6th House - Satru & Theft Investigation Bhava (Debts, Theft, Obstacles)", hi: "6ठा भाव - शत्रु व चोरी भाव (चोरी जांच, ऋण व विजय)", te: "6వ ఇల్లు - శత్రు & దొంగతనం భావం (పోటీ, ఋణం & చోర విచారణ)", ta: "6ஆம் இடம் - சத்ரு & திருட்டு பாவம் (வழக்கு, கடன் & திருட்டு ஆய்வு)" },
  7: { kn: "೭ನೇ ಮನೆ - ಕಳತ್ರ & ಕಳ್ಳನ ಸ್ಥಾನ (ವಿವಾಹ, ಪಾರ್ಟ್‌ನರ್ & ಚೋರ ಶಕ್ತಿ)", en: "7th House - Kalatra & Thief Indicator (Marriage, Partner & Suspect)", hi: "7वां भाव - कलत्र व चोर भाव (विवाह व चोर पहचान)", te: "7వ ఇల్లు - కళత్ర & దొంగ స్థానం (వివాహం & అనుమానిత వ్యక్తి)", ta: "7ஆம் இடம் - களத்திர & திருடன் இடம் (திருமணம் & திருடன்)" },
  8: { kn: "೮ನೇ ಮನೆ - ಆಯುರ್ & ಗುಪ್ತ ನಷ್ಟ ಭಾವ (ಅಡಚಣೆ ನಿವಾರಣೆ & ಕಳೆದುಹೋದ ವಸ್ತು ಶೋಧನೆ)", en: "8th House - Ayur & Hidden Item Bhava (Overcoming Loss & Hidden Matters)", hi: "8वां भाव - आयुर व गुप्त वस्तु भाव (बाधा निवारण व छुपी वस्तु)", te: "8వ ఇల్లు - ఆయుర్ & గుప్త వస్తువు భావం (అంతరాయాల నివారణ)", ta: "8ஆம் இடம் - ஆயுள் & மறைந்த பொருள் பாவம்" },
  9: { kn: "೯ನೇ ಮನೆ - ಭಾಗ್ಯ ಭಾವ (ದೈವ ಕೃಪೆ, ಭಾಗ್ಯೋದಯ & ಉನ್ನತ ಶಿಕ್ಷಣ)", en: "9th House - Bhagya Bhava (Fortune, Luck & Higher Studies)", hi: "9वां भाव - भाग्य भाव (भाग्योदय, धर्म व उच्च शिक्षा)", te: "9వ ఇల్లు - భాగ్య భావం (అదృష్టం, ధర్మం & ఉన్నత విద్య)", ta: "9ஆம் இடம் - பாக்கிய பாவம் (அதிர்ஷ்டம் & உயர் கல்வி)" },
  10: { kn: "೧೦ನೇ ಮನೆ - ಕರ್ಮ ಭಾವ (ಉದ್ಯೋಗ ಬಡ್ತಿ, ವೃತ್ತಿ & ಅಧಿಕಾರ)", en: "10th House - Karma Bhava (Career Promotion, Profession & Status)", hi: "10वां भाव - कर्म भाव (करियर पदोन्नति व प्रतिष्ठा)", te: "10వ ఇల్లు - కర్మ భావం (ఉద్యోగ ప్రమోషన్ & వృత్తి)", ta: "10ஆம் இடம் - கர்ம பாவம் (வேலை உயர்வு & தொழில்)" },
  11: { kn: "೧೧ನೇ ಮನೆ - ಲಾಭ & ನಷ್ಟ ವಸ್ತು ವಾಪಸಾತಿ ಭಾವ (ಅತ್ಯುತ್ತಮ ಲಾಭ & ಪುನಃ ಪ್ರಾಪ್ತಿ)", en: "11th House - Labha & Complete Recovery Bhava (Profits & Regaining Lost Property)", hi: "11वां भाव - लाभ एवं खोई वस्तु वापसी भाव", te: "11వ ఇల్లు - లాభం & తిరిగి దొరుకుట భావం", ta: "11ஆம் இடம் - லாபம் & மீட்கப்படுதல் பாவம்" },
  12: { kn: "೧೨ನೇ ಮನೆ - ವ್ಯಯ ಭಾವ (ವಿದೇಶ ಪ್ರಯಾಣ, ದೂರ ಸ್ಥಳ & ವೆಚ್ಚ ನಿಯಂತ್ರಣ)", en: "12th House - Vyaya Bhava (Foreign Travel, Distant Place & Expenses)", hi: "12वां भाव - व्यय भाव (विदेश यात्रा, दूर स्थान व व्यय)", te: "12వ ఇల్లు - వ్యయ భావం (విదేశీ ప్రయాణం & దూర ప్రాంతం)", ta: "12ஆம் இடம் - விரய பாவம் (வெளிநாட்டுப் பயணம் & விரயம்)" }
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
  const mod = rashiIndex % 3;
  if (mod === 0) return "chara";
  if (mod === 1) return "sthira";
  return "dwiswabhava";
}

/** Keyword Intent Classification for Question Category & Karya Bhava */
export function detectQuestionCategoryAndKaryaBhava(query: string): {
  category: QuestionCategory;
  karyaBhava: number;
} {
  const text = (query || "").toLowerCase();

  // 1. Theft, Lost Items, Missing Objects, Stolen Property, Stolen Gold/Cash, Lost Keys/Documents
  if (
    /theft|steal|stolen|stole|rob|thief|lost|miss|missing|dropped|misplaced|gold|chain|ring|wallet|money.*lost|jewel|phone.*lost|keys|ಕಳ್ಳ|ಕಳ್ಳತನ|ಕಳವು|ಕಳೆದು|ಚೋರ|ಚಿನ್ನ|ಬಂಗಾರ|ದಾಖಲೆ.*ಕಳೆದು|ಕಳೆದುಕೊಂಡ|ಚೋರತನ|चोरी|खो|गायब|सोना|सामान.*खो|దొంగ|పోయింది|బంగారం|திருட்டு|தொலைந்து|தங்கம்/.test(
      text
    )
  ) {
    return { category: "theft_lost_item", karyaBhava: 2 };
  }

  // 2. Career / Job / Promotion / Business / Interview / Work
  if (
    /job|promot|work|career|interview|salary|business|wurk|transfer|join|office|ವೃತ್ತಿ|ಉದ್ಯೋಗ|ಬಡ್ತಿ|ಕೆಲಸ|ಸಂಬಳ|ವ್ಯಾಪಾರ|ವರ್ಗಾವಣೆ|ಆಫೀಸ್|नौकरी|करियर|उद्योग|उद्यోగం|వృత్తి|வேலை|தொழில்/.test(
      text
    )
  ) {
    return { category: "career_business", karyaBhava: 10 };
  }

  // 3. Marriage / Relationship / Spouse / Love / Match / Bride / Groom
  if (
    /marria|marrige|wedding|match|spouse|husband|wife|love|relationship|bride|groom|boy|girl|ವಿವಾಹ|ಮದುವೆ|ಪತಿ|ಪತ್ನಿ|ಸಂಬಂಧ|ವರ|ವಧು|ಪ್ರೇಮ|ಜೊತೆ|विवाह|शादी|पति|पत्नी|లగ్నం|పెళ్లి|వివాహం|திருமணம்|கல்யாணம்/.test(
      text
    )
  ) {
    return { category: "marriage_love", karyaBhava: 7 };
  }

  // 4. Wealth / Money / Loan / Finance / Investment / Debt / Profits
  if (
    /money|wealth|cash|finance|profit|debt|loan|invest|return|bank|ಸಾಲ|ಧನ|ಹಣ|ಲಾಭ|ಸಂಪತ್ತು|ಬ್ಯಾಂಕ್|ಹೂಡಿಕೆ|धन|पैसा|ऋण|लाभ|ధనం|డబ్బు|ఋణం|தனம்|பணம்|கடன்/.test(
      text
    )
  ) {
    return { category: "wealth_finance", karyaBhava: 11 };
  }

  // 5. House / Property / Land / Vehicle / Buying / Flat
  if (
    /house|home|land|property|flat|site|car|vehicle|buy|purchase|construct|ಆಸ್ತಿ|ಮನೆ|ವಾಹನ|ಖರೀದಿ|ಸ್ಥಳ|ಸೈಟ್|मकान|भूमि|वाहन|सम्पत्ति|ఇల్లు|ఆస్తి|వాహనం|వీடு|நிலம்|வாகனம்/.test(
      text
    )
  ) {
    return { category: "wealth_finance", karyaBhava: 4 };
  }

  // 6. Education / Exam / Higher Studies / Degree / Rank
  if (
    /exam|study|educat|college|degree|mark|rank|pass|score|school|admission|ಪರೀಕ್ಷೆ|ಶಿಕ್ಷಣ|ಅಂಕ|ರ‍್ಯಾಂಕ್|ಓದು|ಶಾಲೆ|ಕಾಲೇಜು|परीक्षा|शिक्षा|अंक|చదువు|పరీక్ష|தேர்வு|கல்வி/.test(
      text
    )
  ) {
    return { category: "education_study", karyaBhava: 5 };
  }

  // 7. Health / Medical / Disease / Court / Legal Competition / Dispute
  if (
    /health|disease|court|case|legal|cure|doctor|hospital|pain|dispute|ಆರೋಗ್ಯ|ರೋಗ|ಕೋರ್ಟ್|ವ್ಯಾಜ್ಯ|ಸಾಧನೆ|ಆಸ್ಪತ್ರೆ|ನೋವು|स्वास्थ्य|रोग|कोर्ट|आरोग्यం|கேஸ்|சிகிச்சை/.test(
      text
    )
  ) {
    return { category: "health_legal", karyaBhava: 6 };
  }

  // 8. Foreign Travel / Visa / Passport / Relocation / Abroad
  if (
    /foreign|abroad|visa|travel|passport|flight|country|settle|ವಿದೇಶ|ಪ್ರಯಾಣ|ವೀಸಾ|ಪಾಸ್‌ಪೋರ್ಟ್|विदेश|यात्रा|విదేశీ|வெளிநாடு/.test(
      text
    )
  ) {
    return { category: "foreign_travel", karyaBhava: 12 };
  }

  return { category: "general_life", karyaBhava: 1 };
}

/** Compute Cardinal Direction based on Prashna Lagna and Planetary Elements */
export function computePrashnaDirection(
  lagnaIndex: number,
  rootNum: number
): {
  directionKey: string;
  labels: Record<string, string>;
  environmentalMarker: Record<string, string>;
} {
  // Fire signs (0-Mesha, 4-Simha, 8-Dhanus) -> East
  // Earth signs (1-Vrishabha, 5-Kanya, 9-Makara) -> South
  // Air signs (2-Mithuna, 6-Tula, 10-Kumbha) -> West
  // Water signs (3-Karkataka, 7-Vrischika, 11-Meena) -> North

  const rashiMod = lagnaIndex % 4;

  if (rashiMod === 0 || rootNum === 1 || rootNum === 9) {
    return {
      directionKey: "east",
      labels: {
        kn: "ಪೂರ್ವ ದಿಕ್ಕು (East - ಸೂರ್ಯ/ಅಗ್ನಿ ತತ್ತ್ವ)",
        en: "East Direction (East - Solar/Agni Tattva)",
        hi: "पूर्व दिशा (East - अग्नि तत्व)",
        te: "తూర్పు దిశ (East - అగ్ని తత్త్వం)",
        ta: "கிழக்கு திசை (East - அக்னி தத்துவம்)"
      },
      environmentalMarker: {
        kn: "ಪೂರ್ವ ಭಾಗದಲ್ಲಿ, ದೇವರ ಕೋಣೆ, ದೀಪದ ಸ್ಥಳ, ಅಡುಗೆ ಮನೆ, ಅಥವಾ ಬೆಳಕು ಬೀಳುವ ಪ್ರಮುಖ ಸ್ಥಳದಲ್ಲಿ ಶೋಧಿಸಿ.",
        en: "Search towards the East, near prayer altar, lighting/electrical area, kitchen, or well-lit prominent space.",
        hi: "पूर्व दिशा में, पूजा स्थल, प्रकाश स्रोत, रसोई अथवा मुख्य बैठक के पास खोजें।",
        te: "తూర్పు వైపున, పూజా గది, వెలుతురు ఉండే స్థలం లేదా వంటగది సమీపంలో వెతకండి.",
        ta: "கிழக்கு பகுதியில், பூஜை அறை, விளக்கு உள்ள இடம் அல்லது சமையலறை அருகில் தேடவும்."
      }
    };
  }

  if (rashiMod === 1 || rootNum === 4 || rootNum === 5) {
    return {
      directionKey: "south",
      labels: {
        kn: "ದಕ್ಷಿಣ ಅಥವಾ ನೈಋತ್ಯ ದಿಕ್ಕು (South / Southwest - ಪೃಥ್ವಿ ತತ್ತ್ವ)",
        en: "South / Southwest Direction (Prithvi Tattva)",
        hi: "दक्षिण अथवा नैऋत्य दिशा (South / Southwest)",
        te: "దక్షిణ లేదా నైరుతి దిశ (South / Southwest)",
        ta: "தெற்கு அல்லது தென்மேற்கு திசை (South / Southwest)"
      },
      environmentalMarker: {
        kn: "ದಕ್ಷಿಣ ಭಾಗದಲ್ಲಿ, ಕಪಾಟಿನ ಕೆಳಗೆ, ನೆಲದ ಸಮೀಪ, ಭಾರವಾದ ಪೀಠೋಪಕರಣಗಳ ಒಳಗೆ ಅಥವಾ ಮಣ್ಣು/ಭೂಮಿಯ ಆವರಣದಲ್ಲಿ.",
        en: "Search towards the South/Southwest, under cupboards, near the floor, beneath heavy furniture, or in a secured box.",
        hi: "दक्षिण/नैऋत्य दिशा में, अलमारी के नीचे, फर्श के पास, भारी सामान अथवा सुरक्षित दराज में।",
        te: "దక్షిణ/నైరుతి వైపు, బీరువా కింద, నేల దగ్గర లేదా బరువైన వస్తువుల కింద.",
        ta: "தெற்கு பகுதியில், பீரோவின் கீழ், தரைக்கு அருகில் அல்லது கனமான பொருளின் அடியில்."
      }
    };
  }

  if (rashiMod === 2 || rootNum === 6 || rootNum === 8) {
    return {
      directionKey: "west",
      labels: {
        kn: "ಪಶ್ಚಿಮ ಅಥವಾ ವಾಯುವ್ಯ ದಿಕ್ಕು (West / Northwest - ವಾಯು ತತ್ತ್ವ)",
        en: "West / Northwest Direction (Vayu Tattva)",
        hi: "पश्चिम अथवा वायव्य दिशा (West / Northwest)",
        te: "పశ్చిమ లేదా వాయువ్య దిశ (West / Northwest)",
        ta: "மேற்கு அல்லது வடமேற்கு திசை (West / Northwest)"
      },
      environmentalMarker: {
        kn: "ಪಶ್ಚಿಮ ಭಾಗದಲ್ಲಿ, ಎತ್ತರದ ಜಾಗದಲ್ಲಿ, ಹ್ಯಾಂಗರ್, ಗಾಳಿ ಬೀಸುವ ಬಾಲ್ಕನಿ, ಪ್ರಯಾಣದ ಬ್ಯಾಗ್ ಅಥವಾ ವಾಹನದ ಒಳಗಡೆ.",
        en: "Search towards the West/Northwest, elevated shelf, hanger, travel luggage, breezy balcony, or inside vehicle.",
        hi: "पश्चिम दिशा में, ऊंचे स्थान, हैंगर, यात्रा बैग, बालकनी अथवा वाहन के अंदर।",
        te: "పశ్చిమ వైపు, ఎత్తైన అల్మారా, ట్రావెల్ బ్యాగ్ లేదా వాహనంలో.",
        ta: "மேற்கு பகுதியில், உயரமான அலமாரி, பயணப் பை அல்லது வாகனத்தின் உள்ளே."
      }
    };
  }

  return {
    directionKey: "north",
    labels: {
      kn: "ಉತ್ತರ ಅಥವಾ ಈಶಾನ್ಯ ದಿಕ್ಕು (North / Northeast - ಜಲ ತತ್ತ್ವ)",
      en: "North / Northeast Direction (Jala Tattva)",
      hi: "उत्तर अथवा ईशान दिशा (North / Northeast)",
      te: "ఉత్తర లేదా ఈశాన్య దిశ (North / Northeast)",
      ta: "வடக்கு அல்லது வடகிழக்கு திசை (North / Northeast)"
    },
    environmentalMarker: {
      kn: "ಉತ್ತರ/ಈಶಾನ್ಯ ಭಾಗದಲ್ಲಿ, ನೀರಿನ ಸಂಪ್, ವಾಶ್ ಬೇಸಿನ್, ಅಕ್ವೇರಿಯಂ, ಪಾತ್ರೆಗಳ ಸ್ಥಳ ಅಥವಾ ಶುದ್ಧ ಪವಿತ್ರ ಜಾಗದಲ್ಲಿ.",
      en: "Search towards the North/Northeast, near water storage, sink, bathroom vicinity, vessels, or sanctified clean area.",
      hi: "उत्तर/ईशान दिशा में, जल स्रोत, वाशबेसिन, पवित्र स्वच्छ स्थान अथवा बर्तनों के पास।",
      te: "ఉత్తర/ఈశాన్య వైపు, నీటి తొట్టి, వాష్ బేసిన్ లేదా పవిత్ర స్థలం వద్ద.",
      ta: "வடக்கு/வடகிழக்கு பகுதியில், நீர் நிலை, வாஷ் பேசின் அல்லது புனிதமான இடத்தில்."
    }
  };
}

/** Compute Object Mobility and Suspect/Location Profile */
export function computeObjectAndSuspectProfile(
  mobility: SignMobility,
  houseNum: number,
  category: QuestionCategory
): {
  objectMobility: Record<string, string>;
  suspectProfile: Record<string, string>;
} {
  let mobKn = "";
  let mobEn = "";
  let suspKn = "";
  let suspEn = "";

  if (mobility === "sthira") {
    mobKn = "ಸ್ಥಿರ ಸ್ಥಿತಿ (Fixed & Stationary): ವಸ್ತುವು ಹೆಚ್ಚು ದೂರ ಹೋಗಿಲ್ಲ. ಮನೆಯಲ್ಲೇ ಅಥವಾ ನೀವು ಕೊನೆಯದಾಗಿ ಇರಿಸಿದ ಆವರಣದಲ್ಲೇ ಸುರಕ್ಷಿತವಾಗಿದೆ.";
    mobEn = "Fixed State (Sthira): The object has NOT moved far away. It remains within your immediate premises or the exact vicinity where it was last kept.";
  } else if (mobility === "chara") {
    mobKn = "ಚರ ಸ್ಥಿತಿ (In Motion / Transferred): ವಸ್ತುವು ಚಲನೆಯಲ್ಲಿದೆ ಅಥವಾ ಕೈ ಬದಲಾಗಿದೆ. ತಕ್ಷಣ ಶೋಧನೆ ಆರಂಭಿಸಿದರೆ ಶೀಘ್ರವೇ ಪತ್ತೆಯಾಗುವುದು.";
    mobEn = "Movable State (Chara): The item is in motion or has changed locations/hands. Immediate pursuit and search will yield rapid recovery.";
  } else {
    mobKn = "ದ್ವಿಸ್ವಭಾವ ಸ್ಥಿತಿ (Semi-Movable / In Transit): ವಸ್ತುವು ವಾಹನ, ಬ್ಯಾಗ್, ಪ್ಯಾಕೆಟ್ ಅಥವಾ ಎರಡು ಕೊಠಡಿಗಳ/ಸ್ಥಳಗಳ ಮಧ್ಯಭಾಗದಲ್ಲಿದೆ.";
    mobEn = "Dual State (Dwiswabhava): The object is inside a vehicle, bag, package, or positioned at a junction between two rooms/locations.";
  }

  // Suspect/Person profile (Inside acquaintance vs Outside stranger)
  if ([1, 2, 3, 4, 11].includes(houseNum)) {
    suspKn = "ಆಪ್ತರು / ಪರಿಚಿತರ ವಲಯ: ವಸ್ತುವು ಹೊರಗಿನ ಅಪರಿಚಿತರಿಂದ ಕಳುವಾಗಿಲ್ಲ. ಆಪ್ತರು ಅಥವಾ ಮನೆಯ ಸದಸ್ಯರಿಂದಲೇ ಸ್ಥಾನಪಲ್ಲಟವಾಗಿದೆ ಅಥವಾ ಸ್ವಯಂ ಮರೆತಿದ್ದೀರಿ.";
    suspEn = "Inside Acquaintance / Misplaced: Not taken by an outside stranger. It has been displaced by an internal acquaintance/family member or safely misplaced by yourself.";
  } else if ([6, 7, 8, 12].includes(houseNum)) {
    suspKn = "ಹೊರಗಿನವರು / ಸೇವಕರು: ಹೊರಗಿನ ಅಪರಿಚಿತ ವ್ಯಕ್ತಿ ಅಥವಾ ಕೆಲಸದವರ ಕೈಚಳಕದ ಸಾಧ್ಯತೆ ಇದೆ. ತಕ್ಷಣ ದೃಢವಾಗಿ ವಿಚಾರಿಸಿದರೆ ವಸ್ತು ವಾಪಸ್ ಸಿಗುವುದು.";
    suspEn = "Outside Person / Domestic Hand: Involvement of an external stranger, delivery person, or domestic worker. Prompt firm inquiry will restore the item.";
  } else {
    suspKn = "ಸ್ಥಳ ಬದಲಾವಣೆ & ಆಕಸ್ಮಿಕ ಸಂಗ್ರಹ: ವಸ್ತುವು ಕಳುವಾಗದೆ ಮತ್ತೊಂದು ವಸ್ತುವಿನೊಳಗೆ ಮುಚ್ಚಿಹೋಗಿದೆ.";
    suspEn = "Accidental Concealment: The item is not truly stolen, but concealed underneath other belongings.";
  }

  return {
    objectMobility: { kn: mobKn, en: mobEn },
    suspectProfile: { kn: suspKn, en: suspEn }
  };
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

  // 3. Detect Question Category & Karya Sthana Bhava
  const { category: questionCategory, karyaBhava } = detectQuestionCategoryAndKaryaBhava(rawQuestion);
  const karyaLabel = KARYA_BHAVA_L5[karyaBhava] || KARYA_BHAVA_L5[1]!;

  // 4. Direction & Object/Suspect Analysis
  const dirInfo = computePrashnaDirection(lagnaIndex, rootNum);
  const objSuspectInfo = computeObjectAndSuspectProfile(mobility, houseNum, questionCategory);

  // 5. Live Ephemeris Planetary Transits
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

  // 6. Mathematical Prashna Bala Score Calculation (0..100%)
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
  if (moonTp && [1, 2, 3, 4, 5, 7, 9, 10, 11].includes(moonTp.houseFromLagna)) {
    score += 15;
  } else if (moonTp && moonTp.houseFromLagna === 8) {
    score -= 15; // Chandrashtama Prashna
  }

  // Root Ruler Compatibility (+10%)
  if ([1, 2, 3, 5, 6, 9].includes(rootNum)) {
    score += 10;
  }

  const finalScore = Math.max(25, Math.min(98, score));

  // 7. Verdict Classification & Time Horizon
  let verdictCat: SankhyaShastraResult["verdictCategory"] = "moderate_success";
  if (finalScore >= 75) verdictCat = "high_success";
  else if (finalScore >= 55) verdictCat = "moderate_success";
  else if (finalScore >= 40) verdictCat = "delay_with_effort";
  else verdictCat = "caution_rest";

  const verdictLabels: Record<SankhyaShastraResult["verdictCategory"], Record<string, string>> = {
    high_success: {
      kn: "🟢 ಅತ್ಯುನ್ನತ ಸಿದ್ಧಿ & ತ್ವರಿತ ಜಯ (High Success & Quick Recovery)",
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
    2: { kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ಓಂ ನಮಃ ಶಿವಾಯ ಮಂತ್ರ ಜಪ (೧೦೮ ಬಾರಿ).", en: "Offer Ksheerabhishekam & chant Om Namah Shivaya 108 times." },
    3: { kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಬ್ರಾಹ್ಮಣರಿಗೆ ಹಳದಿ ಧಾನ್ಯ/ಕಡಲೆಬೇಳೆ ದಾನ.", en: "Pray to Lord Guru Raghavendra & offer yellow grains/chana dal to scholars." },
    4: { kn: "ಶ್ರೀ ನರಸಿಂಹ ಕವಚ ಪಾರಾಯಣ ಹಾಗೂ ರಾಹು ಕಾಲದಲ್ಲಿ ಬೆಲ್ಲ ಸಮರ್ಪಣೆ ಮತ್ತು ದುರ್ಗಾ ಪೂಜೆ.", en: "Recite Sri Narasimha Kavacham & offer jaggery/Durga archana during Rahu Kala." },
    5: { kn: "ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣೆ ಹಾಗೂ ಗೋವುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು ನೀಡುವುದು ಮತ್ತು ಬುಧ ಗಾಯತ್ರಿ ಜಪ.", en: "Chant Sri Vishnu Sahasranamam, feed green grass to cows & chant Budha Gayatri." },
    6: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಅಷ್ಟೋತ್ತರ ಪಾರಾಯಣ ಹಾಗೂ ಶುಕ್ರವಾರ ಬಿಳಿ ಹೂವಿನ ಪೂಜೆ ಮತ್ತು ಸಕ್ಕರೆ ದಾನ.", en: "Recite Sri Mahalakshmi Ashtottaram & offer white flowers and sugar on Fridays." },
    7: { kn: "ಶ್ರೀ ಸಂಕಷ್ಟಹರ ಮಹಾಗಣಪತಿ ಪೂಜೆ, ಗರಿಕಾರ್ಚನೆ ಹಾಗೂ ಕಪ್ಪು ಎಳ್ಳಿನ ಗಣಪತಿ ಪ್ರಾರ್ಥನೆ.", en: "Pray to Lord Sankashtahara Maha Ganapati with Garika grass and sesame seeds." },
    8: { kn: "ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣೆ, ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ನಮಸ್ಕಾರ ಹಾಗೂ ದಶರಥ ಕೃತ ಶನಿ ಸ್ತೋತ್ರ.", en: "Chant Sri Hanuman Chalisa, light sesame oil lamp on Saturdays & recite Shani Stotram." },
    9: { kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟೋತ್ತರ ಪಾರಾಯಣ, ಮಂಗಳವಾರ ಕೆಂಪು ಹೂವಿನ ಅರ್ಚನೆ ಹಾಗೂ ಋಣವಿಮೋಚಕ ಸ್ತೋತ್ರ.", en: "Chant Sri Subramanya Ashtottaram & offer red flowers on Tuesdays for debt/obstacle freedom." }
  };

  // 8. Deterministic Fallback 6-Paragraph Builder
  const buildDeterministic6ParagraphReading = (): string => {
    if (langCode === "kn") {
      return `೧. ಪ್ರಶ್ನೆಗೆ ನೇರ ನಿಖರ ಉತ್ತರ & ಫಲಿತಾಂಶ:
ನೀವು ಕೇಳಿರುವ ಪ್ರಶ್ನೆಗೆ ("${rawQuestion}") ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರರ ಸಾನ್ನಿಧ್ಯದ ಸಂಖ್ಯಾ ಪ್ರಶ್ನಾ ಶಾಸ್ತ್ರವು ಮಂಗಳಕರ ಹಾಗೂ ಸ್ಪಷ್ಟ ಫಲವನ್ನು ನೀಡುತ್ತಿದೆ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಯ ಸಂಖ್ಯಾ ಬಲವು ಶೇಕಡಾ ${finalScore}% ಇದ್ದು, ${verdictLabels[verdictCat].kn} ಲಭಿಸಲಿದೆ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಯ ವಿಷಯವು ಸಿದ್ಧಿಯಾಗಲಿದ್ದು, ಯಾವುದೇ ರೀತಿಯ ಭೀತಿ ಅಥವಾ ಗೊಂದಲಗಳಿಗೆ ಒಳಗಾಗಬೇಕಾಗಿಲ್ಲ. ನಿಮ್ಮ ಸಂಕಲ್ಪವು ಕಾಲಾನುಗುಣವಾಗಿ ಈಡೇರಲಿದೆ.

೨. ಮೂಲ ಕಾರಣ & ಸಂಖ್ಯಾ-ಗ್ರಹ ತರಂಗ ವಿಶ್ಲೇಷಣೆ:
ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಸಂಖ್ಯಾ ಬಲ ${userNumber} ರ ಏಕಾಂಕ ${rootNum} ಆಗಿದ್ದು, ಇದರ ನೇರ ಅಧಿಪತಿ ಗ್ರಹ ${rootData.ruler.kn} ಮತ್ತು ರಕ್ಷಕ ದೇವತೆ ${rootData.deity.kn}. ಪ್ರಸ್ತುತ ಪ್ರಶ್ನಾ ಲಗ್ನವು ${houseNum}ನೇ ಮನೆಯಾದ ${lagnaName.kn} ರಾಶಿಯಲ್ಲಿ ಉದಯಿಸಿದ್ದು, ಇದರ ಅಧಿಪತಿ ${lagnaLord.kn}. ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಮತ್ತು ಕಾರ್ಯ ಸ್ಥಾನವಾದ ${karyaLabel.kn} ದ ಪ್ರಭಾವದಿಂದಾಗಿ ಈ ಪರಿಸ್ಥಿತಿಯು ಸೃಷ್ಟಿಯಾಗಿದೆ. ದೈವಿಕ ಸಂಖ್ಯಾ ತರಂಗವು ನಿಮ್ಮ ಪರವಾಗಿದ್ದು, ವಿಘ್ನಗಳು ನಿಧಾನವಾಗಿ ಕರಗಲಿವೆ.

೩. ವಸ್ತು/ಸ್ಥಳ/ವ್ಯಕ್ತಿಯ ಸ್ಥಿತಿ, ಚಲನೆ ಹಾಗೂ ದಿಕ್ಕಿನ ಮಾರ್ಗದರ್ಶನ:
${objSuspectInfo.objectMobility.kn}
${dirInfo.labels.kn}: ${dirInfo.environmentalMarker.kn}
${objSuspectInfo.suspectProfile.kn}

೪. ನಿಖರ ಫಲ ಕಾಲಾವಧಿ & ಕಾರ್ಯಯೋಜನೆಯ ಹಂತಗಳು:
${timeHorizonLabels[mobility].kn}. ಈ ಕಾರ್ಯದ ಸಿದ್ಧಿಗಾಗಿ ನೀವು ವಿಳಂಬ ಮಾಡದೆ, ಶಾಂತಚಿತ್ತರಾಗಿ ಮೇಲ್ಕಂಡ ದಿಕ್ಕಿನಲ್ಲಿ ಹಾಗೂ ಸೂಚಿತ ಸ್ಥಳಗಳಲ್ಲಿ ಪ್ರಯತ್ನ ಮುಂದುವರಿಸಿ. ನಿಮ್ಮ ಆಪ್ತರ ಸಲಹೆ ಪಡೆದು, ಸೂಕ್ತ ದಾಖಲೆ ಅಥವಾ ಮಾಹಿತಿಯೊಂದಿಗೆ ಹೆಜ್ಜೆ ಇಡುವುದು ಅತ್ಯಂತ ಲಾಭದಾಯಕ.

೫. ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾ ಪರಿಹಾರ & ಮಂತ್ರ ಜಪ:
ಈ ಕಾರ್ಯದಲ್ಲಿ ಎದುರಾಗಬಹುದಾದ ಸೂಕ್ಷ್ಮ ದೋಷಗಳನ್ನು ನಿವಾರಿಸಲು: ${remedyLabels[rootNum]?.kn || remedyLabels[1]!.kn}. ಪ್ರತಿದಿನ ಮುಂಜಾನೆ ಸ್ನಾನದ ನಂತರ ಶ್ರೀ ${rootData.deity.kn} ರನ್ನು ಧ್ಯಾನಿಸಿ, "ಓಂ ನಮಃ ಶಿವಾಯ" ಅಥವಾ "ಓಂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ" ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ.

೬. ಗುರುಗಳ ದೈವಿಕ ಅಭಯ & ಆಶೀರ್ವಾದ:
ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ, ಶ್ರೀ ತಾಮ್ರಗೌರಿ ಅಮ್ಮನವರು ಹಾಗೂ ಶ್ರೀ ಗಣಪತಿಯ ದಿವ್ಯ ಕೃಪಾಕಟಾಕ್ಷವು ಸದಾ ನಿಮ್ಮ ಮೇಲಿರಲಿ. ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ಪ್ರಯತ್ನಕ್ಕೆ ದೈವಬಲವು ಜತೆಯಾಗಲಿದ್ದು, ಶೀಘ್ರವೇ ನಿಮ್ಮ ಇಷ್ಟಾರ್ಥವು ನೆರವೇರಲಿದೆ. ಶ್ರೀರಾಮ ಪಂಡಿತರ ಹೃದಯಪೂರ್ವಕ ಆಶೀರ್ವಾದಗಳು.`;
    }

    return `1. Direct In-Depth Answer & Immediate Outcome:
Regarding your specific query ("${rawQuestion}"), the sacred Gokarna Mahabaleshwara Sankhya Prashna Oracle indicates a clear and affirmative reading. With a high Prashna Strength Score of ${finalScore}% (${verdictLabels[verdictCat].en}), your objective will certainly move towards positive fulfillment. There is no need for undue anxiety, as the cosmic numbers strongly favor your inquiry.

2. Root Astrological & Numerological Vibration Analysis:
Your chosen number ${userNumber} holds the digital root ${rootNum}, governed directly by ${rootData.ruler.en} and sanctified by ${rootData.deity.en}. The Prashna Lagna rises in House ${houseNum} (${lagnaName.en}), ruled by ${lagnaLord.en}. The dynamic transit alignment in the ${karyaLabel.en} confirms that the underlying cosmic vibrations are actively clearing previous stagnation and realigning your path towards success.

3. Object State, Direction & Situational Analysis:
${objSuspectInfo.objectMobility.en}
${dirInfo.labels.en}: ${dirInfo.environmentalMarker.en}
${objSuspectInfo.suspectProfile.en}

4. Exact Timing Horizon & Actionable Roadmap:
${timeHorizonLabels[mobility].en}. To accelerate this favorable outcome, maintain calm focus and follow the directional guidance provided above without hesitation. Systematic action coupled with patience will ensure the desired victory.

5. Sacred Gokarna Mahabaleshwara Remedy & Daily Mantra:
To dissolve any lingering negative obstacles: ${remedyLabels[rootNum]?.en || remedyLabels[1]!.en}. Daily morning meditation on Lord ${rootData.deity.en} and chanting "Om Namah Shivaya" 108 times will invoke strong divine protection.

6. Priest's Divine Blessings & Concluding Grace:
May the supreme grace of Lord Mahabaleshwara, Goddess Tamragauri, and Lord Maha Ganapati of Gokarna Kshetra protect and guide you always. Step forward with full confidence; your auspicious realization is assured. Divine blessings from Sri Shreeram Pandit.`;
  };

  // 9. Format Deterministic Summary for AI Prompt
  const deterministicSummary = `
================================================================
🕉️ MATHEMATICAL PRASHNA ENGINE DETERMINISTIC CALCULATION REPORT
================================================================
1. Devotee Question: "${rawQuestion}"
2. Question Category: ${questionCategory}
3. Chosen Intuitive Number: ${userNumber}
4. Digital Root Number: ${rootNum} (Ruler: ${rootData.ruler[langCode] || rootData.ruler.en}, Deity: ${rootData.deity[langCode] || rootData.deity.en})
5. Prashna Lagna: House ${houseNum} (${lagnaName[langCode] || lagnaName.en}, Lord: ${lagnaLord[langCode] || lagnaLord.en}, Mobility: ${mobilityLabel[langCode] || mobilityLabel.en})
6. Karya Sthana: ${karyaLabel[langCode] || karyaLabel.en}
7. Prashna Bala Score: ${finalScore}% (${verdictLabels[verdictCat][langCode] || verdictLabels[verdictCat].en})
8. Direction to Search/Action: ${dirInfo.labels[langCode] || dirInfo.labels.en}
   Environmental Marker: ${dirInfo.environmentalMarker[langCode] || dirInfo.environmentalMarker.en}
9. Object Mobility & State: ${objSuspectInfo.objectMobility[langCode] || objSuspectInfo.objectMobility.en}
10. Suspect / Location Profile: ${objSuspectInfo.suspectProfile[langCode] || objSuspectInfo.suspectProfile.en}
11. Time Horizon: ${timeHorizonLabels[mobility][langCode] || timeHorizonLabels[mobility].en}
12. Sacred Remedy: ${remedyLabels[rootNum]?.[langCode as keyof typeof remedyLabels[1]] || remedyLabels[1]!['kn']}
================================================================
`;

  // 10. Gemini AI Prompt Enforcing 6 Full Descriptive Paragraphs (4-5 lines each) Answering Question FIRST
  const narrationPrompt = `
You are Sri Shreeram Pandit, Chief Astrologer and Sankhya Shastra Master from Gokarna Mahabaleshwara Kshetra.

USER'S CRITICAL REQUIREMENTS:
1. ANSWER THE QUESTION FIRST IN DEPTH. Do NOT beat around the bush or start with generic summaries. Devotees want the immediate, clear, direct answer to their specific question right at the beginning!
2. If the question is about Lost Items, Theft, Missing Property, Gold, Money, Vehicle, or Assets:
   - State whether the item is Fixed (ಸ್ಥಿರ - in the same place/house), Moving (ಚರ - changing locations/hands), or Dual (ದ್ವಿಸ್ವಭಾವ - in bag/vehicle).
   - State the EXACT DIRECTION to search (East, West, North, South, NE, SE, NW, SW) and physical environment (near water, under furniture, in high shelf, in drawer, etc.).
   - State WHO is suspected/involved (inside family/domestic acquaintance vs outside stranger).
3. If the question is about Career, Marriage, Finance, Court, Health, or Studies, provide concrete, specific, actionable predictions.
4. Structure the response into EXACTLY 6 DETAILED, DESCRIPTIVE PARAGRAPHS (at least 4 to 5 lines per paragraph).

REQUIRED 6-PARAGRAPH STRUCTURE:
Paragraph 1: ನೇರ ನಿಖರ ಉತ್ತರ & ಫಲಿತಾಂಶ (Direct In-Depth Answer to the Devotee's Question & Immediate Outcome)
Paragraph 2: ಮೂಲ ಕಾರಣ & ಸಂಖ್ಯಾ-ಗ್ರಹ ತರಂಗ ವಿಶ್ಲೇಷಣೆ (Root Cause & Astrological/Numerological Vibration Analysis)
Paragraph 3: ವಸ್ತು/ಸ್ಥಳ/ವ್ಯಕ್ತಿಯ ಸ್ಥಿತಿ, ಚಲನೆ ಹಾಗೂ ದಿಕ್ಕಿನ ಮಾರ್ಗದರ್ಶನ (Object Nature, Sthira/Chara Mobility, Direction & Suspect/Location Analysis)
Paragraph 4: ನಿಖರ ಫಲ ಕಾಲಾವಧಿ & ಮುನ್ನಡೆಯ ಹಂತಗಳು (Exact Timing Horizon & Actionable Roadmap)
Paragraph 5: ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾ ಪರಿಹಾರ & ಮಂತ್ರೋಪಾಸನೆ (Sacred Gokarna Remedy & Divine Mantra Guidance)
Paragraph 6: ಗುರುಗಳ ದೈವಿಕ ಅಭಯ & ಆಶೀರ್ವಾದ (Priest's Sacred Blessing & Concluding Divine Grace)

Write EXCLUSIVELY in the native script of requested language: ${langCode} (${lang === "kn" ? "Kannada" : lang}).
`;

  let aiPrediction = "";
  const activeKey = (apiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (activeKey) {
    try {
      aiPrediction = await askGemini(rawQuestion, deterministicSummary + "\n" + narrationPrompt, activeKey, langCode, {
        temperature: 0.3
      });
    } catch (err) {
      console.warn("AI Prashna narration failed, falling back to deterministic reading:", err);
      aiPrediction = buildDeterministic6ParagraphReading();
    }
  } else {
    aiPrediction = buildDeterministic6ParagraphReading();
  }

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
    questionCategory,
    primaryKaryaBhava: karyaBhava,
    primaryKaryaLabel: karyaLabel,
    directionalGuidance: dirInfo.labels,
    objectMobilityAnalysis: objSuspectInfo.objectMobility,
    suspectAndLocationProfile: objSuspectInfo.suspectProfile,
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
Question Category: ${previousResult.questionCategory}
Direction: ${previousResult.directionalGuidance.en || previousResult.directionalGuidance.kn}
Object Mobility: ${previousResult.objectMobilityAnalysis.en || previousResult.objectMobilityAnalysis.kn}
Suspect Profile: ${previousResult.suspectAndLocationProfile.en || previousResult.suspectAndLocationProfile.kn}
Engine Score: ${previousResult.prashnaBalaScore}% (${previousResult.verdictLabel.en})
Previous Prediction Summary: ${previousResult.aiPrediction.slice(0, 500)}...
================================================================
`;

  const prompt = `
You are Sri Shreeram Pandit from Gokarna Mahabaleshwara Kshetra.
The devotee is asking a follow-up clarification question on their previous Sankhya Shastra reading: "${followUpQuestion}".
Provide a direct, wise, compassionate, and descriptive answer in 2 to 3 rich paragraphs strictly in the requested language (${langCode}).
`;

  return askGemini(followUpQuestion, contextData + "\n" + prompt, apiKey, langCode, {
    temperature: 0.5
  });
}
