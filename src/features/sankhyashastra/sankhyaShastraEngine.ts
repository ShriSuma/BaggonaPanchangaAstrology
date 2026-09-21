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
  4: { kn: "ರವಿ", en: "Sun (Ravi)", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" },
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
    ruler: { kn: "ರವಿ", en: "Sun (Ravi)", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" },
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

export type QuestionSubIntent =
  | "money_lent_recovery"
  | "loan_approval"
  | "investment_speculation"
  | "job_promotion"
  | "job_interview_new"
  | "business_new_venture"
  | "marriage_timing"
  | "marriage_proposal_match"
  | "lost_item_theft"
  | "property_purchase"
  | "foreign_travel"
  | "health_recovery"
  | "court_legal_dispute"
  | "education_exam"
  | "general_matter";

export interface DetailedQuestionContext {
  category: QuestionCategory;
  subIntent: QuestionSubIntent;
  karyaBhava: number;
  extractedAmount?: { kn: string; en: string };
  targetPerson?: { kn: string; en: string };
  actionTopic: { kn: string; en: string };
}

/** Extract monetary or commodity amount from question text */
export function extractAmountFromQuestion(query: string): { kn: string; en: string } | undefined {
  const text = (query || "").toLowerCase();

  // Crores
  const crMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores|ಕೋಟಿ)/i);
  if (crMatch && crMatch[1]) {
    const val = crMatch[1];
    return { kn: `${val} ಕೋಟಿ`, en: `${val} crore(s)` };
  }

  // Lakhs
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|ಲಕ್ಷ)/i);
  if (lakhMatch && lakhMatch[1]) {
    const val = lakhMatch[1];
    return { kn: `${val} ಲಕ್ಷ`, en: `${val} lakh(s)` };
  }

  // Currency
  const rupeeMatch = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rs|rupees|₹|ರೂ|ರೂಪಾಯಿ)/i);
  if (rupeeMatch && rupeeMatch[1]) {
    const val = rupeeMatch[1];
    return { kn: `₹${val}`, en: `₹${val}` };
  }

  // Gold / Jewelry
  if (/gold|chain|ring|necklace|bangle|jewel|ಚಿನ್ನ|ಬಂಗಾರ|ಆಭರಣ|ಒಡವೆ|ಉಂಗುರ/i.test(text)) {
    return { kn: "ಚಿನ್ನಾಭರಣ / ಬೆಲೆಬಾಳುವ ವಸ್ತು", en: "gold / valuable jewelry" };
  }

  return undefined;
}

/** Extract counterparty or relationship context from question text */
export function extractPersonFromQuestion(query: string): { kn: string; en: string } {
  const text = (query || "").toLowerCase();
  if (/friend|friends|ಗೆಳೆಯ|ಸ್ನೇಹಿತ|ಮಿತ್ರ/i.test(text)) {
    return { kn: "ಸ್ನೇಹಿತ", en: "friend" };
  }
  if (/partner|partnership|ಪಾಲುದಾರ|ಜೊತೆಗಾರ/i.test(text)) {
    return { kn: "ವ್ಯಾವಹಾರಿಕ ಪಾಲುದಾರ", en: "business partner" };
  }
  if (/relative|relatives|ಸಂಬಂಧಿ|ನೆಂಟ|ಬಂಧು/i.test(text)) {
    return { kn: "ಸಂಬಂಧಿಕರು", en: "relative" };
  }
  if (/borrower|debtor|ಸಾಲಗಾರ|ಸಾಲ ಪಡೆದವರು/i.test(text)) {
    return { kn: "ಸಾಲ ಪಡೆದ ವ್ಯಕ್ತಿ", en: "borrower" };
  }
  if (/boss|manager|employer|company|ಮಾಲೀಕ|ಬಾಸ್|ಕಂಪನಿ/i.test(text)) {
    return { kn: "ಉದ್ಯೋಗದಾತ / ಕಂಪನಿ", en: "employer / company" };
  }
  if (/husband|wife|spouse|ಗಂಡ|ಹೆಂಡತಿ|ಪತಿ|ಪತ್ನಿ/i.test(text)) {
    return { kn: "ಜೀವನ ಸಂಗಾತಿ", en: "spouse" };
  }
  return { kn: "ಸಂಬಂಧಪಟ್ಟ ವ್ಯಕ್ತಿ", en: "concerned person" };
}

/** Deep Intent & Entity Extraction for 100% Dynamic Up-To-Point Answering */
export function extractDetailedQuestionContext(query: string): DetailedQuestionContext {
  const text = (query || "").toLowerCase();
  const extractedAmount = extractAmountFromQuestion(query);
  const targetPerson = extractPersonFromQuestion(query);

  // 1. Money Lent / Debt Recovery (Matches: "given 2 crores to friend did he give me back")
  if (
    /lent|gave.*money|give.*back|given.*money|return.*money|money.*back|recover.*money|repay|repayment|ಕೊಟ್ಟ.*ಹಣ|ಹಣ.*ಕೊಟ್ಟ|ಹಣ.*ವಾಪಸ್|ವಾಪಸ್.*ಕೊಡುವ|ಬರಬೇಕಾದ.*ಹಣ|ಸಾಲ.*ಕೊಟ್ಟ|ಹಣ.*ಮರಳಿ|ಉದ್ದರಿ|ಬಾಕಿ|ಮರಳಿಸುವ/i.test(
      text
    )
  ) {
    return {
      category: "wealth_finance",
      subIntent: "money_lent_recovery",
      karyaBhava: 11,
      extractedAmount,
      targetPerson,
      actionTopic: { kn: "ನೀಡಿದ ಸಾಲ ಅಥವಾ ಹಣದ ವಾಪಸಾತಿ", en: "recovery of lent funds" }
    };
  }

  // 2. Bank Loan Approval / Sanction
  if (/apply.*loan|sanction|bank.*loan|ಸಾಲ.*ಸಿಗುವುದೇ|ಬ್ಯಾಂಕ್.*ಲೋನ್|ಸಾಲ.*ಮಂಜೂರು/i.test(text)) {
    return {
      category: "wealth_finance",
      subIntent: "loan_approval",
      karyaBhava: 11,
      extractedAmount,
      targetPerson,
      actionTopic: { kn: "ಬ್ಯಾಂಕ್ ಸಾಲ ಮಂಜೂರಾತಿ", en: "bank loan approval" }
    };
  }

  // 3. Investment / Stock Market / Trading
  if (/invest|stock|share|crypto|mutual.*fund|trading|ಹೂಡಿಕೆ|ಷೇರು|ಮಾರುಕಟ್ಟೆ|ಟ್ರೇಡಿಂಗ್/i.test(text)) {
    return {
      category: "wealth_finance",
      subIntent: "investment_speculation",
      karyaBhava: 5,
      extractedAmount,
      targetPerson,
      actionTopic: { kn: "ಹೂಡಿಕೆ ಮತ್ತು ಷೇರು ಮಾರುಕಟ್ಟೆ ಲಾಭ", en: "investment & stock returns" }
    };
  }

  // 4. Job Promotion & Salary Appraisal
  if (/promot|hike|appraisal|position|ಬಡ್ತಿ|ಸಂಬಳ.*ಹೆಚ್ಚಳ|ಪ್ರಮೋಷನ್|ಉನ್ನತ.*ಸ್ಥಾನ/i.test(text)) {
    return {
      category: "career_business",
      subIntent: "job_promotion",
      karyaBhava: 10,
      targetPerson,
      actionTopic: { kn: "ಉದ್ಯೋಗ ಬಡ್ತಿ ಮತ್ತು ವೇತನ ಹೆಚ್ಚಳ", en: "career promotion & salary hike" }
    };
  }

  // 5. Job Interview / New Job Offer
  if (/interview|new.*job|offer|selection|change.*job|ಇಂಟರ್ವ್ಯೂ|ಹೊಸ.*ಕೆಲಸ|ನೇಮಕಾತಿ|ಆಫರ್/i.test(text)) {
    return {
      category: "career_business",
      subIntent: "job_interview_new",
      karyaBhava: 10,
      targetPerson,
      actionTopic: { kn: "ಹೊಸ ಉದ್ಯೋಗ ಸಂದರ್ಶನ ಮತ್ತು ಆಫರ್", en: "new job interview & offer" }
    };
  }

  // 6. Starting New Business / Venture
  if (/start.*business|new.*shop|startup|partnership|ಹೊಸ.*ವ್ಯಾಪಾರ|ಅಂಗಡಿ|ಉದ್ದಿಮೆ|ಸ್ಟಾರ್ಟಪ್|ಪಾಲುದಾರಿಕೆ/i.test(text)) {
    return {
      category: "career_business",
      subIntent: "business_new_venture",
      karyaBhava: 10,
      targetPerson,
      actionTopic: { kn: "ಹೊಸ ವ್ಯಾಪಾರ ಮತ್ತು ಉದ್ದಿಮೆ ಆರಂಭ", en: "new business venture & startup" }
    };
  }

  // 7. Marriage Proposal / Alliance Suitability
  if (/proposal|match|alliance|boy.*good|girl.*good|ಈ.*ಸಂಬಂಧ|ವರ.*ಸೂಕ್ತವೇ|ವಧು.*ಸೂಕ್ತವೇ|ಜಾತಕ.*ಹೊಂದಾಣಿಕೆ/i.test(text)) {
    return {
      category: "marriage_love",
      subIntent: "marriage_proposal_match",
      karyaBhava: 7,
      targetPerson,
      actionTopic: { kn: "ವಿವಾಹ ಸಂಬಂಧ ಮತ್ತು ಹೊಂದಾಣಿಕೆ", en: "marriage alliance suitability" }
    };
  }

  // 8. Marriage Timing & General Marriage
  if (/marry|marriage|wedding|groom|bride|when.*marry|ಮದುವೆ|ವಿವಾಹ|ಕಂಕಣ|ಕಲ್ಯಾಣ/i.test(text)) {
    return {
      category: "marriage_love",
      subIntent: "marriage_timing",
      karyaBhava: 7,
      targetPerson,
      actionTopic: { kn: "ವಿವಾಹ ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರುವ ಕಾಲ", en: "timing of marriage" }
    };
  }

  // 9. Theft / Lost / Misplaced Article
  if (/theft|steal|stolen|stole|rob|thief|lost|miss|missing|dropped|misplaced|keys|ಕಳ್ಳ|ಕಳ್ಳತನ|ಕಳವು|ಕಳೆದು|ಚೋರ|ದಾಖಲೆ.*ಕಳೆದು|ಕಳೆದುಕೊಂಡ|ಚೋರತನ|चोरी|खो/i.test(text)) {
    return {
      category: "theft_lost_item",
      subIntent: "lost_item_theft",
      karyaBhava: 2,
      extractedAmount,
      targetPerson,
      actionTopic: { kn: "ಕಳೆದುಹೋದ ವಸ್ತು ಅಥವಾ ಕಳ್ಳತನ ಶೋಧನೆ", en: "search for lost or stolen article" }
    };
  }

  // 10. Property / Land / House Purchase
  if (/house|home|land|property|flat|site|car|vehicle|buy|purchase|construct|ಆಸ್ತಿ|ಮನೆ|ವಾಹನ|ಖರೀದಿ|ಸ್ಥಳ|ಸೈಟ್|ಮನೆಕಟ್ಟ/i.test(text)) {
    return {
      category: "wealth_finance",
      subIntent: "property_purchase",
      karyaBhava: 4,
      extractedAmount,
      targetPerson,
      actionTopic: { kn: "ಮನೆ, ನಿವೇಶನ ಅಥವಾ ಆಸ್ತಿ ಖರೀದಿ", en: "purchase of property or home" }
    };
  }

  // 11. Foreign Travel / Visa
  if (/foreign|abroad|visa|travel|passport|flight|country|settle|ವಿದೇಶ|ಪ್ರಯಾಣ|ವೀಸಾ|ಪಾಸ್‌ಪೋರ್ಟ್|ವಿದೇಶಯಾನ/i.test(text)) {
    return {
      category: "foreign_travel",
      subIntent: "foreign_travel",
      karyaBhava: 12,
      targetPerson,
      actionTopic: { kn: "ವಿದೇಶ ಪ್ರಯಾಣ ಮತ್ತು ವೀಸಾ ಅನುಮೋದನೆ", en: "foreign travel & visa clearance" }
    };
  }

  // 12. Health & Medical Recovery
  if (/health|disease|cure|doctor|hospital|pain|dispute|operation|surgery|ಆರೋಗ್ಯ|ರೋಗ|ಆಸ್ಪತ್ರೆ|ನೋವು|ಚಿಕಿತ್ಸೆ|ಗುಣ|ಅನಾರೋಗ್ಯ/i.test(text)) {
    return {
      category: "health_legal",
      subIntent: "health_recovery",
      karyaBhava: 6,
      targetPerson,
      actionTopic: { kn: "ಆರೋಗ್ಯ ಸುಧಾರಣೆ ಮತ್ತು ರೋಗ ನಿವಾರಣೆ", en: "health recovery & vitality" }
    };
  }

  // 13. Court Case & Legal Disputes
  if (/court|case|legal|judge|dispute|lawsuit|ಕೋರ್ಟ್|ಕೇಸ್|ವ್ಯಾಜ್ಯ|ಸಾಧನೆ|ನ್ಯಾಯಾಲಯ|ತೀರ್ಪು/i.test(text)) {
    return {
      category: "health_legal",
      subIntent: "court_legal_dispute",
      karyaBhava: 6,
      targetPerson,
      actionTopic: { kn: "ಕೋರ್ಟ್ ಕೇಸ್ ಮತ್ತು ಕಾನೂನು ವ್ಯಾಜ್ಯ ಜಯ", en: "court litigation & dispute outcome" }
    };
  }

  // 14. Education & Exam Success
  if (/exam|study|educat|college|degree|mark|rank|pass|score|school|admission|ಪರೀಕ್ಷೆ|ಶಿಕ್ಷಣ|ಅಂಕ|ರ‍್ಯಾಂಕ್|ಓದು|ಶಾಲೆ|ಕಾಲೇಜು|ಫಲಿತಾಂಶ/i.test(text)) {
    return {
      category: "education_study",
      subIntent: "education_exam",
      karyaBhava: 5,
      targetPerson,
      actionTopic: { kn: "ಪರೀಕ್ಷಾ ಯಶಸ್ಸು ಮತ್ತು ಶಿಕ್ಷಣ ಪ್ರಗತಿ", en: "examination success & academics" }
    };
  }

  // 15. General Wealth, Debt Relief & Financial Gains
  if (/wealth|finance|debt|profit|income|money|ಧನ|ಸಾಲ|ಹಣಕಾಸು|ಲಾಭ|ಸಂಪತ್ತು|ಆದಾಯ|ಐಶ್ವರ್ಯ|ಶ್ರೀಮಂತ/i.test(text)) {
    return {
      category: "wealth_finance",
      subIntent: "money_lent_recovery",
      karyaBhava: 11,
      extractedAmount,
      targetPerson,
      actionTopic: { kn: "ಧನ ಲಾಭ ಮತ್ತು ಸಾಲ ನಿವಾರಣೆ", en: "wealth gain and debt relief" }
    };
  }

  // Fallback: General Question
  return {
    category: "general_life",
    subIntent: "general_matter",
    karyaBhava: 1,
    extractedAmount,
    targetPerson,
    actionTopic: { kn: "ಪ್ರಶ್ನಿತ ಕಾರ್ಯ ಸಿದ್ಧಿ", en: "fulfillment of stated objective" }
  };
}

/** Keyword Intent Classification for Question Category & Karya Bhava */
export function detectQuestionCategoryAndKaryaBhava(query: string): {
  category: QuestionCategory;
  karyaBhava: number;
} {
  const ctx = extractDetailedQuestionContext(query);
  return { category: ctx.category, karyaBhava: ctx.karyaBhava };
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
// 100% DYNAMIC UP-TO-POINT 4-STEP PRASHNA READING ENGINE
// ----------------------------------------------------------------------

export function buildDynamicUpToPointReading(params: {
  rawQuestion: string;
  userNumber: number;
  rootNum: number;
  rootData: { ruler: Record<string, string>; deity: Record<string, string> };
  houseNum: number;
  lagnaName: Record<string, string>;
  lagnaLord: Record<string, string>;
  mobility: SignMobility;
  mobilityLabel: Record<string, string>;
  karyaLabel: Record<string, string>;
  dirInfo: { labels: Record<string, string>; environmentalMarker: Record<string, string> };
  objSuspectInfo: { objectMobility: Record<string, string>; suspectProfile: Record<string, string> };
  finalScore: number;
  verdictCat: "high_success" | "moderate_success" | "delay_with_effort" | "caution_rest";
  verdictLabels: Record<string, Record<string, string>>;
  timeHorizonLabels: Record<SignMobility, Record<string, string>>;
  remedyLabels: Record<number, Record<string, string>>;
  langCode: string;
}): string {
  const {
    rawQuestion,
    rootNum,
    mobility,
    objSuspectInfo,
    dirInfo,
    verdictCat,
    timeHorizonLabels,
    remedyLabels,
    langCode
  } = params;

  const isKn = langCode === "kn";
  const ctx = extractDetailedQuestionContext(rawQuestion);
  const amountStrKn = ctx.extractedAmount ? ctx.extractedAmount.kn : "";
  const amountStrEn = ctx.extractedAmount ? ctx.extractedAmount.en : "";
  const personKn = ctx.targetPerson?.kn || "ಸಂಬಂಧಪಟ್ಟ ವ್ಯಕ್ತಿ";
  const personEn = ctx.targetPerson?.en || "concerned person";

  // Section 1: Direct Verdict & Reality
  // Section 2: Why? (Cause)
  // Section 3: When? (Timeline)
  // Section 4: Remedies & Practical Real-World Action Steps
  let section1Kn = "";
  let section1En = "";
  let section2Kn = "";
  let section2En = "";
  let section3Kn = "";
  let section3En = "";
  let section4Kn = "";
  let section4En = "";

  if (ctx.subIntent === "money_lent_recovery") {
    const isAffirmative = verdictCat === "high_success";
    if (isAffirmative) {
      section1Kn = `ಹೌದು, ನೀವು ನೀಡಿದ ${amountStrKn || "ಹಣ"}ವು ನಿಶ್ಚಿತವಾಗಿ ವಾಪಸ್ ಸಿಗಲಿದೆ. ಆ ${personKn} ಹಣವನ್ನು ಹಿಂದಿರುಗಿಸಲು ಸಕಾರಾತ್ಮಕ ಪ್ರಯತ್ನ ಮಾಡುತ್ತಿದ್ದು, ಸಣ್ಣ ಕಾಲಾವಕಾಶದ ನಂತರ ಪೂರ್ಣ ಹಣ ನಿಮ್ಮ ಕೈಸೇರಲಿದೆ.`;
      section1En = `Yes, the ${amountStrEn || "money"} you lent will definitely be returned. That ${personEn} is making sincere efforts to arrange the funds, and aside from a brief procedural delay, the amount will be restored to you.`;
    } else {
      section1Kn = `ಇಲ್ಲ, ಸದ್ಯಕ್ಕೆ ನೀವು ನೀಡಿದ ${amountStrKn || "ಹಣ"}ವು ತಕ್ಷಣ ವಾಪಸ್ ಸಿಗುವುದಿಲ್ಲ. ಆ ${personKn} ನಿಮ್ಮ ಹಣವನ್ನು ಬೇರೊಂದು ಕಡೆ (ಮತ್ತೊಂದು ಹೂಡಿಕೆ, ವ್ಯಾಪಾರ ಅಥವಾ ತುರ್ತು ಹೊಣೆಗಾರಿಕೆಯಲ್ಲಿ) ತೊಡಗಿಸಿದ್ದು, ಪ್ರಸ್ತುತ ಆರ್ಥಿಕ ಸಂಕಷ್ಟ ಅಥವಾ ನಗದು ಮುಗ್ಗಟ್ಟನ್ನು ಎದುರಿಸುತ್ತಿದ್ದಾರೆ. ಹಣ ಖಂಡಿತವಾಗಿ ವಾಪಸ್ ಸಿಗಲಿದೆ, ಆದರೆ ನಿರೀಕ್ಷಿತ ಸಮಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಕಾಲಾವಕಾಶ ತೆಗೆದುಕೊಳ್ಳಲಿದೆ.`;
      section1En = `No, currently the ${amountStrEn || "amount"} you gave will not be returned immediately. That ${personEn} has already committed those funds elsewhere (into another investment, trade, or emergency liability) and is currently facing financial losses or liquidity stress. They will definitely return it, but it will take considerable time.`;
    }

    section2Kn = `ಇದಕ್ಕೆ ಶಾಸ್ತ್ರೀಯ ಹಾಗೂ ವಾಸ್ತವಿಕ ಕಾರಣವೇನೆಂದರೆ: ಪ್ರಸ್ತುತ ಪ್ರಶ್ನಾ ಕುಂಡಲಿಯಲ್ಲಿ ಸಾಲ, ನಿರ್ಬಂಧಿತ ದ್ರವ್ಯ ಹಾಗೂ ವಿಳಂಬವನ್ನು ಸೂಚಿಸುವ ೬ನೇ ಮತ್ತು ೮ನೇ ಸ್ಥಾನಗಳ ಪ್ರಭಾವವಿದೆ. ವಾಸ್ತವಿಕವಾಗಿ ಆ ${personKn} ನಿಮ್ಮ ಹಣವನ್ನು ದುರುದ್ದೇಶದಿಂದ ಮುಚ್ಚಿಡುತ್ತಿಲ್ಲ; ಅವರ ಇತರ ಹಣಕಾಸು ವ್ಯವಹಾರಗಳು ತಾತ್ಕಾಲಿಕವಾಗಿ ಸ್ಥಗಿತಗೊಂಡಿರುವುದರಿಂದ ಅಥವಾ ನಷ್ಟ ಅನುಭವಿಸುತ್ತಿರುವುದರಿಂದ ಅವರ ಬಳಿ ತಕ್ಷಣ ನೀಡಲು ನಗದು ಲಭ್ಯವಿಲ್ಲ. ಆದರೆ ೧೧ನೇ ಲಾಭ ಸ್ಥಾನದ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಅಸಲು ಮೊತ್ತವನ್ನು ಶಾಶ್ವತವಾಗಿ ನಷ್ಟವಾಗದಂತೆ ರಕ್ಷಿಸುತ್ತಿದೆ.`;
    section2En = `The astrological and ground reality behind this is: The Prashna chart indicates temporary affliction on the 6th (debts/liabilities) and 8th (blocked capital) houses. In reality, that ${personEn} is not intentionally defrauding you; their other financial inflows are stalled or undergoing losses, leaving them without ready cash. However, benefic aspects on the 11th house of recovery safeguard your principal from being permanently lost.`;

    section3Kn = `ಈ ಹಣಕಾಸಿನ ಸ್ಥಿತಿ ಸುಧಾರಿಸಲು ${timeHorizonLabels[mobility].kn}. ಗ್ರಹಗಳ ಗೋಚಾರ ಬಲದಲ್ಲಿ ಅನುಕೂಲಕರ ಬದಲಾವಣೆಯಾದಾಗ, ಅವರ ವ್ಯಾಪಾರ ಅಥವಾ ಹೂಡಿಕೆಯ ಮೂಲಗಳಿಂದ ನಗದು ಹರಿದುಬರಲು ಆರಂಭವಾಗುತ್ತದೆ. ಆಗ ನಿಮ್ಮ ಹಣವನ್ನು ಒಂದೇ ಬಾರಿಗೆ ಪೂರ್ಣವಾಗಿ ಪಡೆಯುವ ಬದಲು, ಹಂತ-ಹಂತವಾಗಿ ಕಂತುಗಳಲ್ಲಿ (tranches) ಮರಳಿ ಪಡೆಯಲು ಕಾಲ ಕೂಡಿಬರಲಿದೆ.`;
    section3En = `A concrete turnaround will begin within ${timeHorizonLabels[mobility].en}. When key planetary transits shift, their pending receivables or trade will restart, opening the window for you to recover the funds in structured partial installments.`;

    section4Kn = `ದೈವಿಕ ಪರಿಹಾರ: ${remedyLabels[rootNum]?.kn || remedyLabels[1]!.kn} ಪ್ರತಿದಿನ ಮುಂಜಾನೆ 'ಋಣವಿಮೋಚಕ ನೃಸಿಂಹ ಸ್ತೋತ್ರ' ಅಥವಾ 'ಓಂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ.
ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮ: ಅವರ ಮೇಲೆ ಸಿಟ್ಟಾಗದೆ ಅಥವಾ ಆಕ್ರಮಣಕಾರಿ ಸಂಘರ್ಷಕ್ಕೆ ಇಳಿಯದೆ, ಸೌಮ್ಯವಾಗಿ ಮುಖಾಮುಖಿ ಭೇಟಿಯಾಗಿ ಅವರ ಸದ್ಯದ ವ್ಯವಹಾರಿಕ ಸ್ಥಿತಿಯನ್ನು ನೇರವಾಗಿ ತಿಳಿದುಕೊಳ್ಳಿ. ಹಣವನ್ನು ಒಟ್ಟಿಗೆ ನೀಡಲು ಒತ್ತಾಯಿಸುವ ಬದಲು, ಹಂತ-ಹಂತದ ಕಂತುಗಳಲ್ಲಿ ಮರುಪಾವತಿಸಲು ಕಾಲಾವಧಿ ನಿಗದಿಪಡಿಸಿ ಲಿಖಿತ ಒಪ್ಪಂದ (promissory note ಅಥವಾ ಭದ್ರತಾ ದಾಖಲೆ) ಮಾಡಿಕೊಳ್ಳಿ.`;
    section4En = `Sacred Remedy: ${remedyLabels[rootNum]?.en || remedyLabels[1]!.en} Chant the Runa Vimochana Nrisimha Stotram or "Om Namah Shivaya" 108 times daily.
Practical Real-World Steps: Connect directly and peacefully with them in person to understand their ground business reality. Rather than initiating aggressive confrontation, establish a structured installment repayment schedule and secure formal written documentation or promissory notes.`;
  } else if (ctx.subIntent === "job_promotion" || ctx.subIntent === "job_interview_new") {
    const isAffirmative = verdictCat === "high_success" || verdictCat === "moderate_success";
    if (isAffirmative) {
      section1Kn = `ಹೌದು, ಈ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ, ಪ್ರಗತಿ ಹಾಗೂ ಅಧಿಕಾರ ವಿಸ್ತರಣೆಯ ಯೋಗ ದೃಢವಾಗಿದೆ. ಆಡಳಿತ ಮಂಡಳಿಯು ನಿಮ್ಮ ಪರಿಶ್ರಮವನ್ನು ಗುರುತಿಸಿ ಸೂಕ್ತ ಮನ್ನಣೆ ನೀಡಲಿದೆ.`;
      section1En = `Yes, favorable planetary indications confirm career promotion, salary appraisal, and expanded responsibilities. Management will acknowledge your dedicated contributions.`;
    } else {
      section1Kn = `ಇಲ್ಲ, ಸದ್ಯಕ್ಕೆ ಬಡ್ತಿಯು ತಕ್ಷಣ ಕೈಗೂಡುವುದಿಲ್ಲ. ಸಂಸ್ಥೆಯ ಆಂತರಿಕ ಆಡಳಿತ ಪ್ರಕ್ರಿಯೆ, ಬಜೆಟ್ ಅನುಮೋದನೆ ಹಾಗೂ ಇಲಾಖಾ ಮರುಹೊಂದಾಣಿಕೆಯ ವಿಳಂಬದಿಂದಾಗಿ ನೀವು ನಿರೀಕ್ಷೆಗಿಂತ ಹೆಚ್ಚು ಕಾಲ ಕಾಯಬೇಕಾಗುತ್ತದೆ.`;
      section1En = `No, promotion will not materialize immediately. Internal corporate restructuring, budget reallocations, and delayed departmental approvals mean it will take more time than expected.`;
    }

    section2Kn = `ಇದಕ್ಕೆ ಕಾರಣವೇನೆಂದರೆ: ೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲೆ ಗ್ರಹಗಳ ಮಂದಗತಿಯ ಸಂಚಾರವಿದ್ದು, ಆಡಳಿತಾತ್ಮಕ ಅನುಮೋದನೆಗಳು ನಿಧಾನಗತಿಯಲ್ಲಿ ಸಾಗುತ್ತಿವೆ. ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯದಲ್ಲಿ ಯಾವುದೇ ಕೊರತೆಯಿಲ್ಲದಿದ್ದರೂ, ಮೇಲಧಿಕಾರಿಗಳ ಹಂತದಲ್ಲಿ ಹಿರಿಯರ ನಡುವಿನ ಆಂತರಿಕ ಚರ್ಚೆಗಳು ನಡೆಯುತ್ತಿವೆ.`;
    section2En = `The reason for this: Slow planetary transit over the 10th Karma house causes procedural sluggishness. While your competency is strong, internal deliberations among upper management are pacing slowly.`;

    section3Kn = `ಈ ಉದ್ಯೋಗ ಫಲ ಸಿದ್ಧಿಯು ${timeHorizonLabels[mobility].kn} ಅವಧಿಯಲ್ಲಿ ಸ್ಪಷ್ಟ ರೂಪ ಪಡೆಯಲಿದೆ.`;
    section3En = `This career development will crystallize within ${timeHorizonLabels[mobility].en}.`;

    section4Kn = `ದೈವಿಕ ಪರಿಹಾರ: ${remedyLabels[rootNum]?.kn || remedyLabels[1]!.kn} ಆದಿತ್ಯ ಹ್ರದಯ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಯಿಂದ ಪಠಿಸಿ.
ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮ: ಮೇಲಧಿಕಾರಿಗಳೊಂದಿಗೆ ಶಾಂತರಾಗಿ ಮುಖಾಮುಖಿ ವೃತ್ತಿಪರ ಸಮಾಲೋಚನೆ (1-on-1 meeting) ನಡೆಸಿ, ನಿಮ್ಮ ಸಾಧನೆಗಳ ದಾಖಲೆಯನ್ನು ಸೌಮ್ಯವಾಗಿ ಮುಂದಿಟ್ಟು ಅಧಿಕೃತ ಮೌಲ್ಯಮಾಪನ ಕೋರಿ.`;
    section4En = `Sacred Remedy: ${remedyLabels[rootNum]?.en || remedyLabels[1]!.en} Recite Aditya Hrudayam Stotram daily.
Practical Real-World Steps: Schedule a calm 1-on-1 review with your reporting manager, present documented performance metrics without emotional friction, and formally confirm your promotion pathway.`;
  } else if (ctx.subIntent === "marriage_timing" || ctx.subIntent === "marriage_proposal_match") {
    const isAffirmative = verdictCat === "high_success" || verdictCat === "moderate_success";
    if (isAffirmative) {
      section1Kn = `ಹೌದು, ಈ ವಿವಾಹ ಪ್ರಸ್ತಾವ ಹಾಗೂ ಕಂಕಣ ಭಾಗ್ಯಕ್ಕೆ ಕಾಲವು ಅತ್ಯಂತ ಅನುಕೂಲಕರವಾಗಿದೆ. ಸಂಬಂಧವು ಕುಟುಂಬಕ್ಕೆ ಶುಭ ತರಲಿದ್ದು, ಮುನ್ನಡೆಯಲು ಶಾಸ್ತ್ರ ಸಮ್ಮತವಿದೆ.`;
      section1En = `Yes, timing is highly favorable for marriage alignment and this alliance. Cosmic energies favor domestic harmony and alliance finalization.`;
    } else {
      section1Kn = `ಸದ್ಯಕ್ಕೆ ಈ ವಿವಾಹ ವಿಷಯದಲ್ಲಿ ತಕ್ಷಣದ ನಿರ್ಧಾರ ಬೇಡ; ಹೊಂದಾಣಿಕೆ, ಕುಟುಂಬದ ಹಿರಿಯರ ಆಲೋಚನೆ ಹಾಗೂ ಹಿನ್ನೆಲೆಯ ವಿಚಾರದಲ್ಲಿ ಕೆಲವು ಗೊಂದಲಗಳಿದ್ದು ಇನ್ನಷ್ಟು ತಾಳ್ಮೆ ಅಗತ್ಯ.`;
      section1En = `Hold off on an immediate marriage decision; lingering hesitations regarding horoscope compatibility, family elder expectations, and background require patient review.`;
    }

    section2Kn = `ಇದಕ್ಕೆ ಕಾರಣವೇನೆಂದರೆ: ೭ನೇ ಕಳತ್ರ ಭಾವ ಹಾಗೂ ಶುಕ್ರ-ಗುರು ಗ್ರಹಗಳ ಸಂಚಾರವು ಹಿರಿಯರ ನಡುವೆ ಪೂರ್ಣ ಮಟ್ಟದ ಒಮ್ಮತ ಮೂಡಲು ಸ್ವಲ್ಪ ಸಮಯವನ್ನು ನಿರೀಕ್ಷಿಸುತ್ತಿದೆ.`;
    section2En = `The astrological reason: Transits affecting the 7th Kalatra house indicate that complete consensus between family elders needs a little more time to mature.`;

    section3Kn = `ವಿವಾಹ ಸಂಕಲ್ಪದ ಫಲಿತಾಂಶವು ${timeHorizonLabels[mobility].kn} ಅವಧಿಯಲ್ಲಿ ಪೂರ್ಣ ಸ್ಪಷ್ಟತೆ ಪಡೆಯಲಿದೆ.`;
    section3En = `Complete clarity and decisive movement on this marriage matter will emerge within ${timeHorizonLabels[mobility].en}.`;

    section4Kn = `ದೈವಿಕ ಪರಿಹಾರ: ${remedyLabels[rootNum]?.kn || remedyLabels[1]!.kn} ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಅಥವಾ ಮಂಗಳ ಗೌರಿ ದೇವಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ/ಪೂಜೆ ಸಲ್ಲಿಸಿ.
ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮ: ಎರಡೂ ಕುಟುಂಬಗಳ ಹಿರಿಯರು ಮುಖಾಮುಖಿ ಕುಳಿತು ಮುಕ್ತವಾಗಿ ಸೌಹಾರ್ದಯುತ ಮಾತುಕತೆ ನಡೆಸಿ, ಯಾವುದೇ ಮಧ್ಯವರ್ತಿಗಳ ಊಹಾಪೋಹಗಳಿಗೆ ಕಿವಿಗೊಡದೆ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳಿ.`;
    section4En = `Sacred Remedy: ${remedyLabels[rootNum]?.en || remedyLabels[1]!.en} Offer prayers to Goddess Mahalakshmi or Mangala Gowri on Fridays.
Practical Real-World Steps: Arrange a direct, cordial meeting between family elders without relying solely on intermediaries, verifying all expectations transparently.`;
  } else if (ctx.subIntent === "lost_item_theft") {
    const isAffirmative = verdictCat === "high_success" || verdictCat === "moderate_success";
    if (isAffirmative) {
      section1Kn = `ಹೌದು, ನಿಮ್ಮ ${amountStrKn || "ಕಳೆದುಹೋದ ವಸ್ತು"}ವು ನಿಶ್ಚಿತವಾಗಿ ಪತ್ತೆಯಾಗಲಿದೆ. ವಸ್ತುವು ನಾಶವಾಗಿಲ್ಲ; ${objSuspectInfo.objectMobility.kn}`;
      section1En = `Yes, your ${amountStrEn || "lost article"} will definitely be recovered. It is intact; ${objSuspectInfo.objectMobility.en}`;
    } else {
      section1Kn = `ಸದ್ಯಕ್ಕೆ ${amountStrKn || "ವಸ್ತು"}ವು ಸುಲಭವಾಗಿ ಕಣ್ಣಿಗೆ ಬೀಳುತ್ತಿಲ್ಲ. ${objSuspectInfo.objectMobility.kn} ಇದು ಕಳುವಾಗಿರುವ ಬದಲು ಮರೆತು ಇರಿಸಲ್ಪಟ್ಟ ಅಥವಾ ಮುಚ್ಚಿಹೋದ ಸಾಧ್ಯತೆಯೇ ಅಧಿಕವಾಗಿದೆ.`;
      section1En = `The ${amountStrEn || "item"} is not immediately visible. ${objSuspectInfo.objectMobility.en} It is more likely safely displaced or concealed under belongings rather than permanently stolen.`;
    }

    section2Kn = `ಇದಕ್ಕೆ ಕಾರಣ ಮತ್ತು ಶೋಧನಾ ಸ್ಥಳ: ${dirInfo.labels.kn}. ${dirInfo.environmentalMarker.kn} ${objSuspectInfo.suspectProfile.kn}`;
    section2En = `Search direction and location markers: ${dirInfo.labels.en}. ${dirInfo.environmentalMarker.en} ${objSuspectInfo.suspectProfile.en}`;

    section3Kn = `ವಸ್ತು ಲಭ್ಯತೆಯ ಕಾಲಾವಧಿ: ${timeHorizonLabels[mobility].kn}.`;
    section3En = `Recovery timeframe: ${timeHorizonLabels[mobility].en}.`;

    section4Kn = `ದೈವಿಕ ಪರಿಹಾರ: ${remedyLabels[rootNum]?.kn || remedyLabels[1]!.kn} ಶ್ರೀ ಸಂಕಷ್ಟಹರ ಗಣಪತಿಗೆ ಗರಿಕಾರ್ಚನೆ ಸಲ್ಲಿಸಿ.
ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮ: ಆತಂಕಪಡದೆ, ಸೂಚಿತ ದಿಕ್ಕಿನಲ್ಲಿರುವ ಕಪಾಟು, ಬ್ಯಾಗ್, ವಾಹನ ಅಥವಾ ಪೀಠೋಪಕರಣಗಳ ಕೆಳಭಾಗವನ್ನು ಸಮಾಧಾನಚಿತ್ತದಿಂದ ಶೋಧಿಸಿ; ಆಪ್ತರ ಮೇಲೆ ತಕ್ಷಣ ನೇರ ಆರೋಪ ಮಾಡಬೇಡಿ.`;
    section4En = `Sacred Remedy: ${remedyLabels[rootNum]?.en || remedyLabels[1]!.en} Pray to Lord Sankashtahara Ganapati with Garika grass.
Practical Real-World Steps: Search methodically without panic in the indicated directional quadrant, examining bags, elevated shelves, vehicle crevices, or behind furniture without accusatory confrontations.`;
  } else if (ctx.subIntent === "property_purchase") {
    const isAffirmative = verdictCat === "high_success" || verdictCat === "moderate_success";
    if (isAffirmative) {
      section1Kn = `ಹೌದು, ಈ ${amountStrKn || "ಆಸ್ತಿ ಅಥವಾ ಮನೆ"} ಖರೀದಿ ನಿರ್ಧಾರವು ಭವಿಷ್ಯಕ್ಕೆ ಅತ್ಯಂತ ಶುಭದಾಯಕವಾಗಿದೆ ಮತ್ತು ಆಸ್ತಿಯು ನಿಮ್ಮ ಕೈವಶವಾಗಲಿದೆ.`;
      section1En = `Yes, this ${amountStrEn || "property / home"} purchase is astrologically favorable and will bring long-term security and appreciation.`;
    } else {
      section1Kn = `ಸದ್ಯಕ್ಕೆ ಆಸ್ತಿ ಖರೀದಿಯಲ್ಲಿ ಆತುರದ ನಿರ್ಧಾರ ಬೇಡ; ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ, ದರ ಹೊಂದಾಣಿಕೆ ಅಥವಾ ಕಾನೂನು ಒಪ್ಪಿಗೆಗಳಲ್ಲಿ ಕೆಲವು ಸೂಕ್ಷ್ಮ ಸಮಸ್ಯೆಗಳಿದ್ದು ತಾಳ್ಮೆ ವಹಿಸಬೇಕು.`;
      section1En = `Exercise caution before finalizing this property transaction; subtleties in title deeds, pricing alignment, or municipal clearances require thorough scrutiny.`;
    }

    section2Kn = `ಇದಕ್ಕೆ ಕಾರಣವೇನೆಂದರೆ: ೪ನೇ ಗೃಹ-ಭೂಮಿ ಸ್ಥಾನದ ಮೇಲೆ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ನಿಷ್ಪಕ್ಷಪಾತ ತನಿಖೆಯನ್ನು ಕೋರುತ್ತಿದೆ. ಆಸ್ತಿಯು ಉತ್ತಮವಾಗಿದ್ದರೂ, ಮೂಲ ದಾಖಲೆಗಳ (parent deeds) ಸ್ಪಷ್ಟತೆ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳುವುದು ಅನಿವಾರ್ಯ.`;
    section2En = `Astrological reasoning: Planetary influences on the 4th Sukha house demand rigorous due diligence. While the property holds merit, legal clarity on parent documents is vital.`;

    section3Kn = `ಖರೀದಿ ಪ್ರಕ್ರಿಯೆಯು ${timeHorizonLabels[mobility].kn} ಅವಧಿಯಲ್ಲಿ ಸುಗಮ ಹಂತಕ್ಕೆ ಬರಲಿದೆ.`;
    section3En = `The transaction process will stabilize into an auspicious phase within ${timeHorizonLabels[mobility].en}.`;

    section4Kn = `ದೈವಿಕ ಪರಿಹಾರ: ${remedyLabels[rootNum]?.kn || remedyLabels[1]!.kn} ಭೂಮಿ ಸೂಕ್ತ ಪಠಣೆ ಅಥವಾ ವಾಸ್ತು ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.
ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮ: ಪರಿಣಿತ ವಕೀಲರಿಂದ ಎನ್‌ಕಂಬರೆನ್ಸ್ ಸರ್ಟಿಫಿಕೇಟ್ (EC), ಖಾತಾ ಹಾಗೂ ಮೂಲ ದಾಖಲೆಗಳನ್ನು ಮರುಪರಿಶೀಲಿಸಿ, ಯಾವುದೇ ಕಚ್ಚಾ ಒಪ್ಪಂದಕ್ಕೆ ಮುಂಗಡ ಹಣ ನೀಡಬೇಡಿ.`;
    section4En = `Sacred Remedy: ${remedyLabels[rootNum]?.en || remedyLabels[1]!.en} Perform Bhoomi Suktam or Vastu prayer.
Practical Real-World Steps: Have an independent legal advocate verify the Encumbrance Certificate (EC), municipal approvals, and parent title chain before releasing substantial advances.`;
  } else {
    // General fallback
    const isAffirmative = verdictCat === "high_success" || verdictCat === "moderate_success";
    if (isAffirmative) {
      section1Kn = `ಹೌದು, ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ (${rawQuestion}) ಶಾಸ್ತ್ರೀಯವಾಗಿ ಸಕಾರಾತ್ಮಕ ಉತ್ತರ ಲಭಿಸಿದ್ದು, ಈ ಕಾರ್ಯವು ನಿಶ್ಚಿತವಾಗಿ ಸಿದ್ಧಿಯಾಗಲಿದೆ.`;
      section1En = `Yes, your query (${rawQuestion}) receives an astrologically affirmative indication, confirming the successful realization of your objective.`;
    } else {
      section1Kn = `ಇಲ್ಲ, ಸದ್ಯಕ್ಕೆ ಈ ಕಾರ್ಯವು ತಕ್ಷಣ ಸಿದ್ಧಿಯಾಗುವುದಿಲ್ಲ; ಕಾಲಾವಕಾಶ ಹಾಗೂ ತಾಳ್ಮೆಯ ಅಗತ್ಯವಿದ್ದು, ಸದ್ಯದ ಅಡೆತಡೆಗಳು ತಾತ್ಕಾಲಿಕವಾಗಿವೆ.`;
      section1En = `No, this matter will not resolve immediately; patience and persistent navigation are required, and current hurdles are temporary.`;
    }

    section2Kn = `ಇದಕ್ಕೆ ಕಾರಣವೇನೆಂದರೆ: ಪ್ರಸ್ತುತ ಪ್ರಶ್ನಾ ಕುಂಡಲಿಯಲ್ಲಿ ಗ್ರಹಗಳ ಸಂಚಾರವು ಕಾರ್ಯ ಸ್ಥಾನದಲ್ಲಿ ಹಂತ-ಹಂತದ ಬೆಳವಣಿಗೆಯನ್ನು ಸೂಚಿಸುತ್ತಿದ್ದು, ಆತುರದ ಹೆಜ್ಜೆಯು ಹಿನ್ನಡೆ ತರಬಹುದು.`;
    section2En = `Astrological reasoning: Transits influencing the relevant house indicate gradual phased progression; hasty actions could trigger avoidable friction.`;

    section3Kn = `ಕಾರ್ಯ ಸಿದ್ಧಿಯ ನಿಖರ ಕಾಲಾವಧಿ: ${timeHorizonLabels[mobility].kn}.`;
    section3En = `Expected realization horizon: ${timeHorizonLabels[mobility].en}.`;

    section4Kn = `ದೈವಿಕ ಪರಿಹಾರ: ${remedyLabels[rootNum]?.kn || remedyLabels[1]!.kn} ಪ್ರತಿದಿನ ಮುಂಜಾನೆ 'ಓಂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ.
ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮ: ಯಾವುದೇ ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಅಪ್ರಮಾಣಿಕ ಮಾತುಗಳಿಗೆ ಕಿವಿಗೊಡದೆ, ಸಂಬಂಧಪಟ್ಟವರೊಂದಿಗೆ ನೇರ ಸಂವಾದ ನಡೆಸಿ ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ವ್ಯವಸ್ಥಿತವಾಗಿ ನಿರ್ವಹಿಸಿ ಮುನ್ನಡೆಯಿರಿ.`;
    section4En = `Sacred Remedy: ${remedyLabels[rootNum]?.en || remedyLabels[1]!.en} Chant "Om Namah Shivaya" 108 times daily.
Practical Real-World Steps: Avoid hearsay and third-party rumors; engage directly with the primary stakeholders and maintain organized records.`;
  }

  if (isKn) {
    return `೧. ನೇರ ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ & ಸದ್ಯದ ವಾಸ್ತವಿಕ ಸ್ಥಿತಿ:
${section1Kn}

೨. ಇದಕ್ಕೆ ಕಾರಣವೇನು? ಗ್ರಹಸ್ಥಿತಿ & ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ:
${section2Kn}

೩. ನಿಖರ ಕಾಲಾವಧಿ & ಫಲ ಬದಲಾವಣೆಯ ಸಮಯ:
${section3Kn}

೪. ದೈವಿಕ ಪರಿಹಾರ & ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮಗಳು:
${section4Kn}`;
  }

  return `1. DIRECT ASTROLOGICAL VERDICT & GROUND REALITY:
${section1En}

2. WHY? PLANETARY ROOT CAUSE & SITUATIONAL ANALYSIS:
${section2En}

3. CONCRETE TIMELINE & TURNING POINT:
${section3En}

4. SACRED REMEDIES & REAL-WORLD PRACTICAL NEXT STEPS:
${section4En}`;
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
    { key: "sun", name: { kn: "ರವಿ", en: "Sun (Ravi)", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" }, isBenefic: false },
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

  // 8. 100% Dynamic, Up-To-Point 4-Step Prashna Reading Builder (Zero filler, Direct Verdict FIRST)
  const buildFallbackReading = (): string => {
    return buildDynamicUpToPointReading({
      rawQuestion,
      userNumber,
      rootNum,
      rootData,
      houseNum,
      lagnaName,
      lagnaLord,
      mobility,
      mobilityLabel,
      karyaLabel,
      dirInfo,
      objSuspectInfo,
      finalScore,
      verdictCat,
      verdictLabels,
      timeHorizonLabels,
      remedyLabels,
      langCode
    });
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

  // 10. Gemini AI Prompt Enforcing 4-Step Up-To-Point Direct Reading Without Filler
  const isKn = langCode === "kn";
  const narrationPrompt = `
You are revered Chief Priest Sri Shreeram Pandit from Gokarna-Baggona Kshetra.

USER'S ABSOLUTE ZERO-TOLERANCE RULES:
1. STRICTLY NO GREETINGS OR META INTROS:
   DO NOT write 'ನಮಸ್ಕಾರ', 'ಸ್ವಾಗತ', 'ನಾನು ಜ್ಯೋತಿಷಿ', 'ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪಂಡಿತ್', 'ನೋಡಿ ಭಕ್ತರೇ ಕುಂಡಲಿ ಸ್ಕ್ರೀನ್ ಮೇಲೆ ನೋಡುತ್ತಿದ್ದೇನೆ' or 'Welcome devotee' anywhere!
2. COME DIRECTLY TO THE POINT IN THE OPENING SENTENCE:
   The very first sentence MUST state the direct answer / verdict to the devotee's specific question: "${rawQuestion}".
   Example (if asked: "I have given 2 crores to my friend, did he give me back those amount?"):
   Start immediately with:
   "ಇಲ್ಲ, ಸದ್ಯಕ್ಕೆ ಆ ೨ ಕೋಟಿ ಹಣ ತಕ್ಷಣ ನಿಮ್ಮ ಕೈಸೇರುವುದಿಲ್ಲ. ಆ ಸ್ನೇಹಿತನು ನಿಮ್ಮ ಹಣವನ್ನು ಬೇರೊಂದು ಕಡೆ ತೊಡಗಿಸಿದ್ದು, ಪ್ರಸ್ತುತ ಆರ್ಥಿಕ ನಷ್ಟ ಅಥವಾ ನಗದು ಮುಗ್ಗಟ್ಟನ್ನು ಎದುರಿಸುತ್ತಿದ್ದಾನೆ. ಹಣ ಖಂಡಿತವಾಗಿ ವಾಪಸ್ ಸಿಗಲಿದೆ, ಆದರೆ ನಿರೀಕ್ಷಿತ ಸಮಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಕಾಲಾವಕಾಶ ತೆಗೆದುಕೊಳ್ಳಲಿದೆ."
3. STRICTLY STRUCTURE YOUR RESPONSE INTO EXACTLY FOUR (4) NUMBERED SECTIONS WITH THESE EXACT HEADINGS:
   ${isKn ? `
   ೧. ನೇರ ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ & ಸದ್ಯದ ವಾಸ್ತವಿಕ ಸ್ಥಿತಿ:
   (Give the direct conclusion in sentence 1, then explain the counterparty's ground reality)
   
   ೨. ಇದಕ್ಕೆ ಕಾರಣವೇನು? ಗ್ರಹಸ್ಥಿತಿ & ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ:
   (Explain the specific planetary forces and real-world factors causing this situation)
   
   ೩. ನಿಖರ ಕಾಲಾವಧಿ & ಫಲ ಬದಲಾವಣೆಯ ಸಮಯ:
   (State the clear timeline and turning point: ${timeHorizonLabels[mobility].kn})
   
   ೪. ದೈವಿಕ ಪರಿಹಾರ & ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮಗಳು:
   (Give the sacred mantra/puja remedy, AND give concrete real-world next steps: e.g., "connect with them directly and peacefully in person to understand their ground reality, avoid aggressive conflict, and secure written acknowledgment or structured installments")
   ` : `
   1. DIRECT ASTROLOGICAL VERDICT & GROUND REALITY:
   (State the direct answer in sentence 1, then explain the ground reality of the matter/counterparty)
   
   2. WHY? PLANETARY ROOT CAUSE & SITUATIONAL ANALYSIS:
   (Explain the planetary transits and situational realities causing this)
   
   3. CONCRETE TIMELINE & TURNING POINT:
   (State the timeline: ${timeHorizonLabels[mobility].en})
   
   4. SACRED REMEDIES & REAL-WORLD PRACTICAL NEXT STEPS:
   (State the mantra/remedy, and give practical real-world steps like connecting in person peacefully to review details without conflict)
   `}
4. WRITE EXCLUSIVELY IN ${isKn ? "pure Kannada script without any English words" : langCode}.
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
      aiPrediction = buildFallbackReading();
    }
  } else {
    aiPrediction = buildFallbackReading();
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
