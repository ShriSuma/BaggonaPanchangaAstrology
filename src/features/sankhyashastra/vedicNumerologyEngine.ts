/**
 * Classical Vedic Numerology (Sankhya Shastra / Ank Jyotish) Predictive Architecture Engine.
 * 
 * Codified Rules & Mathematical Matrices:
 * 1. Core Computational Parameters: Digital Root R9(x), Moolank (Psychic), Bhagyank (Destiny), Chaldean Namank (Name).
 * 2. Chaldean Letter Assignment Matrix (1..8, 9 omitted as sacred).
 * 3. Name Sub-Calculations: Soul Urge (SU, Vowels), Personality (Pn, Consonants), Master Numbers (11, 22, 33), Karmic Debts (13, 14, 16, 19).
 * 4. 3x3 Navagraha Vedic Grid Matrix (Thought Plane 3-1-9, Will Plane 6-7-5, Action Plane 2-8-4).
 * 5. Grid Population Rules: Century Exclusion Rule (YY only, zeros omitted), Compound Day Moolank Placement (11-31 excl 10,20,30), Bhagyank Placement (Always).
 * 6. Cell Density & Multiplicity Analysis (Single Balanced, Double Amplified, Triple+ Hyper-Saturated, Missing).
 * 7. Complete 37 Yogas Parser Matrix (Y01 to Y37) with 5-Language Localization.
 * 8. Missing Number Remediation Matrix (1 to 9).
 * 9. Asymmetric Graha Maitri Directional Compatibility Engine (R(A->B) & R(B->A), Weighted Index CI).
 * 10. Nested Temporal Predictive Engine:
 *     - Mahadasha (MD): 45-Year Repeating & 100-Year Sequential Timelines.
 *     - Antardasha (AD): Annual Birthday-to-Birthday cycle with Weekday Index Wv.
 *     - Pratyantardasha (PD): "Rule of 8" (Tp = Pnum * 8 days, 360-day predictive year).
 *     - Real-Time Daily Dasha (DD) and Hourly Dasha (HD).
 *     - Multiplicity Overload vs Positive Smooth Dasha logic with critical exceptions (Double 1, Even 8, Destiny 4 in Dasha 4, Destiny 6 in Dasha 6).
 * 11. Mobile Number and Vehicle Number Numerology Algorithms.
 */

// ----------------------------------------------------------------------
// 1. CORE TYPES & CHALDEAN LETTER MATRIX
// ----------------------------------------------------------------------

export type PlanetKey = "sun" | "moon" | "jupiter" | "rahu" | "mercury" | "venus" | "ketu" | "saturn" | "mars";

export interface PlanetMeta {
  number: number; // 1..9
  key: PlanetKey;
  sanskritName: string;
  name: Record<string, string>;
  plane: "thought" | "will" | "action";
  rulingDeity: Record<string, string>;
  archetype: Record<string, string>;
  element: Record<string, string>;
  direction: Record<string, string>;
  luckyColors: Record<string, string>;
  luckyGems: Record<string, string>;
}

export const NAVAGRAHA_META: Record<number, PlanetMeta> = {
  1: {
    number: 1,
    key: "sun",
    sanskritName: "Surya",
    name: { kn: "ಸೂರ್ಯ (Surya)", en: "Sun (Surya)", hi: "सूर्य (Surya)", te: "సూర్యుడు (Surya)", ta: "சூரியன் (Surya)" },
    plane: "thought",
    rulingDeity: { kn: "ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ", en: "Lord Surya Narayana", hi: "भगवान सूर्यनारायण", te: "శ్రీ సూర్యనారాయణ స్వామి", ta: "ஶ்ரீ சூரியநாராயணர்" },
    archetype: {
      kn: "ಆಡಳಿತ ಶಕ್ತಿ, ನಾಯಕತ್ವ, ಸ್ವಾಭಿಮಾನ ಹಾಗೂ ರಾಜಯೋಗ ತೇಜಸ್ಸು",
      en: "Executive drive, leadership, independence, and royal distinction",
      hi: "नेतृत्व, प्रशासनिक क्षमता, आत्मविश्वास एवं राजयोग",
      te: "నాయకత్వం, కార్యనిర్వాహక శక్తి మరియు రాజయోగం",
      ta: "தலைமைத்துவம், நிர்வாகத் திறன் மற்றும் ராஜயோகம்"
    },
    element: { kn: "ಅಗ್ನಿ (Fire)", en: "Fire", hi: "अग्नि", te: "అగ్ని", ta: "அக்னி" },
    direction: { kn: "ಪೂರ್ವ (East)", en: "East", hi: "पूर्व", te: "తూర్పు", ta: "கிழக்கு" },
    luckyColors: { kn: "ಕೇಸರಿ, ಚಿನ್ನ, ಕೆಂಪು", en: "Saffron, Gold, Ruby Red", hi: "केसरिया, सुनहरा, लाल", te: "కాషాయం, బంగారం", ta: "காவி, தங்கம்" },
    luckyGems: { kn: "ಮಾಣಿಕ್ಯ (Ruby)", en: "Ruby (Manikya)", hi: "माणिक्य (Ruby)", te: "మాణిక్యం", ta: "மாணிக்கம்" }
  },
  2: {
    number: 2,
    key: "moon",
    sanskritName: "Chandra",
    name: { kn: "ಚಂದ್ರ (Chandra)", en: "Moon (Chandra)", hi: "चंद्र (Chandra)", te: "చంద్రుడు (Chandra)", ta: "சந்திரன் (Chandra)" },
    plane: "action",
    rulingDeity: { kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ & ಗೌರೀ ದೇವಿ", en: "Lord Mahabaleshwara & Goddess Parvati", hi: "भगवान शिव एवं माता पार्वती", te: "శ్రీ గౌరీ శంకర స్వామి", ta: "ஶ்ரீ பார்வதி தேவி" },
    archetype: {
      kn: "ಭಾವನಾತ್ಮಕ ಒಳನೋಟ, ಕಲ್ಪನಾ ಶಕ್ತಿ, ಶಾಂತಿ ಹಾಗೂ ಸೌಹಾರ್ದತೆ",
      en: "Emotional intuition, diplomacy, sensitivity, and artistic mind",
      hi: "भावनात्मक अंतर्दृष्टि, संवेदनशीलता, शांति एवं कल्पनाशक्ति",
      te: "భావోద్వేగ అంతర్దృష్టి, ప్రశాంతత మరియు సృజనాత్మకత",
      ta: "உணர்ச்சி நுண்ணறிவு, சாந்தம் மற்றும் கலை உணர்வு"
    },
    element: { kn: "ಜಲ (Water)", en: "Water", hi: "जल", te: "జలం", ta: "நீர்" },
    direction: { kn: "ವಾಯವ್ಯ (Northwest)", en: "Northwest", hi: "वायव्य", te: "వాయువ్యం", ta: "வடமேற்கு" },
    luckyColors: { kn: "ಬಿಳಿ, ಬೆಳ್ಳಿ, ಮುತ್ತಿನ ಬಣ್ಣ", en: "White, Silver, Pearl Cream", hi: "श्वेत, चांदी, मोती", te: "తెలుపు, వెండి", ta: "வெள்ளை, வெள்ளி" },
    luckyGems: { kn: "ಮುತ್ತು (Pearl)", en: "Natural Pearl (Mukta)", hi: "मोती (Pearl)", te: "ముత్యం", ta: "முத்து" }
  },
  3: {
    number: 3,
    key: "jupiter",
    sanskritName: "Guru",
    name: { kn: "ಗುರು (Guru / Brihaspati)", en: "Jupiter (Guru)", hi: "बृहस्पति / गुरु", te: "గురుడు (Guru)", ta: "குரு (Brihaspati)" },
    plane: "thought",
    rulingDeity: { kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ & ಬೃಹಸ್ಪತಿ", en: "Lord Guru Raghavendra & Brihaspati", hi: "भगवान गुरु राघवेंद्र एवं बृहस्पति", te: "శ్రీ గురు రాఘవేంద్ర స్వామి", ta: "ஶ்ரீ குரு பகவான்" },
    archetype: {
      kn: "ಉನ್ನತ ಜ್ಞಾನ, ಮಾರ್ಗದರ್ಶನ, ಧನ ವೃದ್ಧಿ ಹಾಗೂ ಸದಾಚಾರ",
      en: "Higher wisdom, advisory talent, creativity, and spiritual growth",
      hi: "उच्च ज्ञान, परामर्श क्षमता, धन वृद्धि एवं आध्यात्मिकता",
      te: "ఉన్నత జ్ఞానం, సలహా సామర్థ్యం మరియు సంపద వృద్ధి",
      ta: "உயரிய ஞானம், ஆலோசனை திறன் மற்றும் செல்வம்"
    },
    element: { kn: "ಆಕಾಶ / ತೇಜಸ್ಸು (Ether/Fire)", en: "Ether / Fire", hi: "आकाश / अग्नि", te: "ఆకాశం", ta: "ஆகாயம்" },
    direction: { kn: "ಈಶಾನ್ಯ (Northeast)", en: "Northeast", hi: "ईशान", te: "ఈశాన్యం", ta: "வடகிழக்கு" },
    luckyColors: { kn: "ಹಳದಿ, ಕಂದು, ಕೇಸರಿ", en: "Yellow, Saffron, Amber", hi: "पीला, केसरिया", te: "పసుపు, కాషాయం", ta: "மஞ்சள், காவி" },
    luckyGems: { kn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)", en: "Yellow Sapphire (Pushparaga)", hi: "पुखराज (Yellow Sapphire)", te: "పుష్యరాగం", ta: "புஷ்பராகம்" }
  },
  4: {
    number: 4,
    key: "rahu",
    sanskritName: "Rahu",
    name: { kn: "ರಾಹು (Rahu - North Node)", en: "Rahu (North Node)", hi: "राहु (Rahu)", te: "రాహువు (Rahu)", ta: "ராகு (Rahu)" },
    plane: "action",
    rulingDeity: { kn: "ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ & ನರಸಿಂಹ ಸ್ವಾಮಿ", en: "Goddess Durga & Lord Narasimha", hi: "माता दुर्गा एवं भगवान नृसिंह", te: "శ్రీ లక్ష్మీ నరసింహ స్వామి", ta: "ஶ்ரீ துர்க்கை அம்மன்" },
    archetype: {
      kn: "ಕಾರ್ಯತಂತ್ರ, ಅನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು, ತಾಂತ್ರಿಕ ಜಾಣ್ಮೆ ಹಾಗೂ ಕ್ರಾಂತಿಕಾರಿ ಚಿಂತನೆ",
      en: "Strategic depth, unconventional systems, sudden breakthroughs, and technical innovation",
      hi: "रणनीतिक गहराई, अपरंपरागत प्रणालियां, आकस्मिक सफलता एवं तकनीकी बुद्धिमत्ता",
      te: "వ్యూహాత్మక ఆలోచన, ఆకస్మిక విజయం మరియు సాంకేతిక నైపుణ్యం",
      ta: "வியூக சிந்தனை, திடீர் வெற்றி மற்றும் தொழில்நுட்ப திறன்"
    },
    element: { kn: "ವಾಯು (Air)", en: "Air / Shadow", hi: "वायु", te: "వాయువు", ta: "காற்று" },
    direction: { kn: "ನೈಋತ್ಯ (Southwest)", en: "Southwest", hi: "नैऋत्य", te: "నైరుతి", ta: "தென்மேற்கு" },
    luckyColors: { kn: "ನೀಲಿ, ಬೂದು, ಕಡು ಕಂದು", en: "Electric Blue, Grey, Smoke Brown", hi: "नीला, धूसर", te: "నీలం, బూడిద", ta: "நீலம், சாம்பல்" },
    luckyGems: { kn: "ಗೋಮೇಧಿಕ (Hessonite Garnet)", en: "Hessonite Garnet (Gomed)", hi: "गोमेद (Hessonite)", te: "గోమేధికం", ta: "கோமேதகம்" }
  },
  5: {
    number: 5,
    key: "mercury",
    sanskritName: "Budha",
    name: { kn: "ಬುಧ (Budha)", en: "Mercury (Budh)", hi: "बुध (Budh)", te: "బుధుడు (Budha)", ta: "புதன் (Budhan)" },
    plane: "will",
    rulingDeity: { kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ಗಣಪತಿ", en: "Lord Mahavishnu & Lord Ganesha", hi: "भगवान महाविष्णु एवं गणपति", te: "శ్రీ మహావిష్ణువు", ta: "ஶ்ரீ மகாவிஷ்ணு" },
    archetype: {
      kn: "ಸಂವಹನ ಚಾತುರ್ಯ, ವ್ಯಾಪಾರ ಬುದ್ಧಿ, ಹೊಂದಿಕೊಳ್ಳುವಿಕೆ ಹಾಗೂ ವಾಕ್ಸಿದ್ಧಿ",
      en: "Communication agility, commerce, adaptability, and sharp wit",
      hi: "संवाद चातुर्य, व्यापारिक सूझबूझ, अनुकूलनशीलता एवं वाक्पटुता",
      te: "వాక్చాతుర్యం, వాణిజ్య ప్రతిభ మరియు వివేకం",
      ta: "தொடர்புத் திறன், வணிக அறிவு மற்றும் கூர்மையான புத்தி"
    },
    element: { kn: "ಪೃಥ್ವಿ (Earth)", en: "Earth", hi: "पृथ्वी", te: "భూమి", ta: "பூமி" },
    direction: { kn: "ಉತ್ತರ (North)", en: "North", hi: "उत्तर", te: "ఉత్తరం", ta: "வடக்கு" },
    luckyColors: { kn: "ಹಸಿರು, ಪಚ್ಚೆ ಬಣ್ಣ", en: "Emerald Green, Light Green", hi: "हरा, पन्ना हरा", te: "ఆకుపచ్చ", ta: "பச்சை" },
    luckyGems: { kn: "ಪಚ್ಚೆ (Emerald)", en: "Emerald (Panna)", hi: "पन्ना (Emerald)", te: "పచ్చ (మరకతం)", ta: "மரகதம்" }
  },
  6: {
    number: 6,
    key: "venus",
    sanskritName: "Shukra",
    name: { kn: "ಶುಕ್ರ (Shukra)", en: "Venus (Shukra)", hi: "शुक्र (Shukra)", te: "శుక్రుడు (Shukra)", ta: "சுக்கிரன் (Shukran)" },
    plane: "will",
    rulingDeity: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ", en: "Goddess Mahalakshmi", hi: "माता महालक्ष्मी", te: "శ్రీ మహాలక్ష్మి దేవి", ta: "ஶ்ரீ மகாலக்ஷ்மி" },
    archetype: {
      kn: "ಕಲಾತ್ಮಕ ಪರಿಪೂರ್ಣತೆ, ಭೋಗ-ಐಶ್ವರ್ಯ, ವಾಹನ ಯೋಗ ಹಾಗೂ ದಾಂಪತ್ಯ ಸುಖ",
      en: "Artistic refinement, luxury, domestic harmony, charm, and magnetic wealth",
      hi: "कलात्मक सौंदर्य, ऐश्वर्य, विलासिता, पारिवारिक सौहार्द एवं आकर्षण",
      te: "కళా నైపుణ్యం, వైభవం, వాహన యోగం మరియు సౌభాగ్యం",
      ta: "கலை நேர்த்தி, ஆடம்பரம், வாகன யோகம் மற்றும் குடும்ப இன்பம்"
    },
    element: { kn: "ಜಲ (Water)", en: "Water", hi: "जल", te: "జలం", ta: "நீர்" },
    direction: { kn: "ಆಗ್ನೇಯ (Southeast)", en: "Southeast", hi: "आग्नेय", te: "ఆగ్నేయం", ta: "தென்கிழக்கு" },
    luckyColors: { kn: "ಬಿಳಿ, ಗುಲಾಬಿ, ಪಾರದರ್ಶಕ ಹೊಳಪು", en: "Diamond White, Rose Pink, Cream", hi: "श्वेत, गुलाबी, चमकीला", te: "తెలుపు, గులాబీ", ta: "வெள்ளை, இளஞ்சிவப்பு" },
    luckyGems: { kn: "ವಜ್ರ ಅಥವಾ ಬಿಳಿ ನೀಲ (Diamond / White Zircon)", en: "Diamond (Heera) or White Zircon", hi: "हीरा (Diamond)", te: "వజ్రం", ta: "வைரம்" }
  },
  7: {
    number: 7,
    key: "ketu",
    sanskritName: "Ketu",
    name: { kn: "ಕೇತು (Ketu - South Node)", en: "Ketu (South Node)", hi: "केतु (Ketu)", te: "కేతువు (Ketu)", ta: "கேது (Ketu)" },
    plane: "will",
    rulingDeity: { kn: "ಶ್ರೀ ಸಂಕಷ್ಟಹರ ಮಹಾಗಣಪತಿ ಸ್ವಾಮಿ", en: "Lord Sankashtahara Maha Ganapati", hi: "भगवान संकटनाशन महागणपति", te: "శ్రీ సంకష్టహర గణపతి", ta: "ஶ்ரீ விநாயகர்" },
    archetype: {
      kn: "ಆತ್ಮಾವಲೋಕನ, ಸಂಶೋಧನಾ ಜ್ಞಾನ, ಅನಾಸಕ್ತಿ ಹಾಗೂ ಗೂಢ ವಿದ್ಯೆ",
      en: "Introspection, analytical research, detachment, and esoteric depth",
      hi: "आत्मचिंतन, विश्लेषणात्मक शोध, वैराग्य एवं गूढ़ आध्यात्मिक अंतर्दृष्टि",
      te: "ఆత్మపరిశీలన, పరిశోధనా శక్తి మరియు వైరాగ్యం",
      ta: "சுயபரிசீலனை, ஆராய்ச்சி அறிவு மற்றும் ஆன்மீகம்"
    },
    element: { kn: "ಅಗ್ನಿ (Fire / Moksha)", en: "Fire / Moksha", hi: "अग्नि / मोक्ष", te: "అగ్ని", ta: "அக்னி" },
    direction: { kn: "ಈಶಾನ್ಯ / ಅಧೋಮುಖ (Northeast / Downward)", en: "Northeast / Inner Zenith", hi: "ईशान / अंतर्मुखी", te: "ఈశాన్యం", ta: "வடகிழக்கு" },
    luckyColors: { kn: "ಬೆಳ್ಳಿ, ಹೊಗೆ ಬಣ್ಣ, ಕಂದು", en: "Silver, Smoky Grey, Earth Brown", hi: "धूसर, चांदी", te: "వెండి, పొగ రంగు", ta: "வெள்ளி, சாம்பல்" },
    luckyGems: { kn: "ಲಾಸುಣಿಯ ವೈಡೂರ್ಯ (Cat's Eye)", en: "Cat's Eye (Vaidurya)", hi: "लहसुनिया (Cat's Eye)", te: "వైడూర్యం", ta: "வைடூரியம்" }
  },
  8: {
    number: 8,
    key: "saturn",
    sanskritName: "Shani",
    name: { kn: "ಶನಿ (Shani)", en: "Saturn (Shani)", hi: "शनि (Shani)", te: "శనైశ్చరుడు (Shani)", ta: "சனீஸ்வரன் (Shani)" },
    plane: "action",
    rulingDeity: { kn: "ಶ್ರೀ ಹನುಮಂತ & ಶನೈಶ್ಚರ ಸ್ವಾಮಿ", en: "Lord Hanuman & Lord Shani", hi: "भगवान हनुमान एवं शनैश्चर देव", te: "శ్రీ హనుమాన్ & శని దేవుడు", ta: "ஶ்ரீ ஆஞ்சநேயர் & சனீஸ்வரர்" },
    archetype: {
      kn: "ಶಿಸ್ತು, ತಾಳ್ಮೆ, ಕರ್ಮಿಕ ಪರಿಶ್ರಮ ಹಾಗೂ ಶಾಶ್ವತ ಸಾಮ್ರಾಜ್ಯ ನಿರ್ಮಾಣ",
      en: "Material consolidation, patience, karmic labor, and enduring foundations",
      hi: "कड़ा अनुशासन, धैर्य, कर्मिक श्रम एवं स्थायी साम्राज्य निर्माण",
      te: "క్రమశిక్షణ, సహనం, శ్రమ మరియు శాశ్వత పునాది",
      ta: "ஒழுக்கம், பொறுமை, உழைப்பு மற்றும் நிலையான வெற்றி"
    },
    element: { kn: "ವಾಯು (Air)", en: "Air / Metal", hi: "वायु", te: "వాయువు", ta: "காற்று" },
    direction: { kn: "ಪಶ್ಚಿಮ (West)", en: "West", hi: "पश्चिम", te: "పశ్చిమం", ta: "மேற்கு" },
    luckyColors: { kn: "ಕಡು ನೀಲಿ, ಕಪ್ಪು, ನೇರಳೆ", en: "Dark Navy Blue, Black, Deep Violet", hi: "गहरा नीला, काला", te: "నీలం, నలుపు", ta: "நீலம், கருப்பு" },
    luckyGems: { kn: "ನೀಲಂ (Blue Sapphire) ಅಥವಾ ಅಮೆಥಿಸ್ಟ್", en: "Blue Sapphire (Neelam) or Amethyst", hi: "नीलम (Blue Sapphire)", te: "నీలం", ta: "நீலக்கல்" }
  },
  9: {
    number: 9,
    key: "mars",
    sanskritName: "Mangala",
    name: { kn: "ಮಂಗಳ / ಕುಜ (Mangala / Kuja)", en: "Mars (Mangala)", hi: "मंगल / भौम", te: "కుజుడు / అంగారకుడు", ta: "செவ்வாய் (Mangala)" },
    plane: "thought",
    rulingDeity: { kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ & ಕಾಲಭೈರವ ಸ್ವಾಮಿ", en: "Lord Subramanya & Lord Kalabhairava", hi: "भगवान कार्तिकेय / सुब्रमण्यम", te: "శ్రీ సుబ్రహ్మణ్యేశ్వర స్వామి", ta: "ஶ்ரீ முருகப் பெருமான்" },
    archetype: {
      kn: "ಶೌರ್ಯ, ಅಪ್ರತಿಹತ ಸಾಹಸ, ಯೋಧ ಗುಣ ಹಾಗೂ ದೃಢ ಕ್ರಿಯಾಶೀಲತೆ",
      en: "Dynamic drive, martial courage, crisis heroism, and decisive action",
      hi: "शौर्य, अदम्य साहस, युद्ध कौशल एवं निर्णायक क्रियाशीलता",
      te: "ధైర్యం, సాహసం, నాయకత్వం మరియు కార్యాచరణ",
      ta: "வீரம், அஞ்சாமை, உடனடி செயல்பாடு மற்றும் வெற்றி"
    },
    element: { kn: "ಅಗ್ನಿ (Fire)", en: "Fire", hi: "अग्नि", te: "ಅಗ್ನಿ", ta: "அக்னி" },
    direction: { kn: "ದಕ್ಷಿಣ (South)", en: "South", hi: "दक्षिण", te: "దక్షిణం", ta: "தெற்கு" },
    luckyColors: { kn: "ಕೆಂಪು, ಸಿಂಧೂರ, ರಕ್ತವರ್ಣ", en: "Bright Red, Coral Scarlet, Crimson", hi: "लाल, सिंदूरी", te: "ఎరుపు, సింధూరం", ta: "சிவப்பு, குங்குமம்" },
    luckyGems: { kn: "ಹವಳ (Red Coral)", en: "Red Coral (Moonga / Pavazham)", hi: "मूंगा (Red Coral)", te: "పగడం", ta: "பவழம்" }
  }
};

// Chaldean Letter Values (1..8, 9 is omitted)
export const CHALDEAN_MATRIX: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

// ----------------------------------------------------------------------
// 2. MATHEMATICAL CORE FUNCTIONS
// ----------------------------------------------------------------------

/**
 * Digital Root Function R9(x)
 * Every multi-digit sum is reduced to a single-digit integer (1 to 9).
 * Formula: R9(x) = 1 + ((x - 1) % 9)
 */
export function digitalRootR9(x: number): number {
  const abs = Math.abs(Math.floor(x));
  if (abs === 0) return 9;
  return 1 + ((abs - 1) % 9);
}

/**
 * Calculate Moolank (Psychic / Root Number)
 * Governs internal psychology & mindset until age 35.
 * M = R9(D) where D in 1..31
 */
export function calculateMoolank(dayOfBirth: number): {
  moolank: number;
  isCompound: boolean;
  compoundDay: number;
  rulingGraha: PlanetMeta;
} {
  const d = Math.min(31, Math.max(1, Math.floor(dayOfBirth)));
  const m = digitalRootR9(d);
  // Compound day rule: 11..31 excluding milestone zero-days (10, 20, 30)
  const isCompound = d > 10 && d !== 10 && d !== 20 && d !== 30;
  return {
    moolank: m,
    isCompound,
    compoundDay: d,
    rulingGraha: NAVAGRAHA_META[m] || NAVAGRAHA_META[1]
  };
}

/**
 * Calculate Bhagyank (Destiny / Life Path Number)
 * Governs post-35 career vector and life trajectory.
 * Uses full 4-digit year: B = R9(D + Mm + Y)
 */
export function calculateBhagyank(day: number, month: number, fullYear: number): {
  bhagyank: number;
  totalSum: number;
  rulingGraha: PlanetMeta;
} {
  const d = Math.max(1, Math.min(31, Math.floor(day)));
  const m = Math.max(1, Math.min(12, Math.floor(month)));
  const y = Math.floor(fullYear);

  // Sum all digits of date string or numeric components
  const dateStr = `${d}${m}${y}`;
  let sum = 0;
  for (let i = 0; i < dateStr.length; i++) {
    sum += parseInt(dateStr[i], 10) || 0;
  }

  const b = digitalRootR9(sum);
  return {
    bhagyank: b,
    totalSum: sum,
    rulingGraha: NAVAGRAHA_META[b] || NAVAGRAHA_META[1]
  };
}

/**
 * Transliterate Indic Unicode characters (Kannada/Devanagari/Telugu) to Latin for Chaldean summation if no ASCII letters present.
 */
export function transliterateIndicToLatin(text: string): string {
  if (!text) return "";
  if (/[A-Za-z]/.test(text)) return text;

  const indicMap: Record<string, string> = {
    // Vowels
    "ಅ": "A", "ಆ": "AA", "ಇ": "I", "ಈ": "EE", "ಉ": "U", "ಊ": "OO", "ಋ": "RI",
    "ಎ": "E", "ಏ": "E", "ಐ": "AI", "ಒ": "O", "ಓ": "O", "ಔ": "AU",
    "अ": "A", "आ": "AA", "इ": "I", "ई": "EE", "उ": "U", "ऊ": "OO", "ऋ": "RI",
    "ए": "E", "ऐ": "AI", "ओ": "O", "औ": "AU",
    "అ": "A", "ఆ": "AA", "ఇ": "I", "ఈ": "EE", "ఉ": "U", "ఊ": "OO",
    "ఎ": "E", "ఏ": "E", "ఐ": "AI", "ఒ": "O", "ఓ": "O", "ఔ": "AU",
    // Consonants
    "ಕ": "K", "ಖ": "KH", "ಗ": "G", "ಘ": "GH", "ಙ": "NG",
    "ಚ": "CH", "ಛ": "CHH", "ಜ": "J", "ಝ": "JH", "ಞ": "NY",
    "ಟ": "T", "ಠ": "TH", "ಡ": "D", "ಢ": "DH", "ಣ": "N",
    "ತ": "T", "ಥ": "TH", "ದ": "D", "ಧ": "DH", "ನ": "N",
    "ಪ": "P", "ಫ": "PH", "ಬ": "B", "ಭ": "BH", "ಮ": "M",
    "ಯ": "Y", "ರ": "R", "ಲ": "L", "ವ": "V", "ಶ": "SH", "ಷ": "SH", "ಸ": "S", "ಹ": "H", "ಳ": "L",
    "क": "K", "ख": "KH", "ग": "G", "घ": "GH",
    "च": "CH", "छ": "CH", "ज": "J", "झ": "JH",
    "ट": "T", "ठ": "TH", "ड": "D", "ढ": "DH", "ण": "N",
    "त": "T", "थ": "TH", "द": "D", "ध": "DH", "न": "N",
    "प": "P", "फ": "PH", "ब": "B", "भ": "BH", "म": "M",
    "य": "Y", "र": "R", "ल": "L", "व": "V", "श": "SH", "ष": "SH", "स": "S", "ह": "H"
  };

  let out = "";
  for (const ch of text) {
    out += indicMap[ch] || ch;
  }
  return out;
}

/**
 * Calculate Chaldean Namank (Name Number), Soul Urge (SU), Personality (Pn), Master & Karmic Numbers
 */
export function calculateNameNumerology(nameString: string): {
  cleanName: string;
  namankCompound: number;
  namank: number;
  soulUrgeCompound: number;
  soulUrge: number;
  personalityCompound: number;
  personality: number;
  masterNumbers: number[];
  karmicDebts: number[];
  rulingGraha: PlanetMeta;
} {
  const rawTransliterated = transliterateIndicToLatin(nameString || "SHREE");
  let cleanName = rawTransliterated.trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (!cleanName) cleanName = "SHREE";

  const VOWELS = new Set(["A", "E", "I", "O", "U"]);

  let namankSum = 0;
  let vowelSum = 0;
  let consonantSum = 0;

  for (let i = 0; i < cleanName.length; i++) {
    const char = cleanName[i];
    const val = CHALDEAN_MATRIX[char] || 0;
    namankSum += val;
    if (VOWELS.has(char)) {
      vowelSum += val;
    } else {
      consonantSum += val;
    }
  }

  const namank = digitalRootR9(namankSum);
  const soulUrge = digitalRootR9(vowelSum);
  const personality = digitalRootR9(consonantSum);

  // Master Numbers check (11, 22, 33)
  const masterNumbers: number[] = [];
  if ([11, 22, 33].includes(namankSum)) masterNumbers.push(namankSum);
  if ([11, 22, 33].includes(vowelSum) && !masterNumbers.includes(vowelSum)) masterNumbers.push(vowelSum);
  if ([11, 22, 33].includes(consonantSum) && !masterNumbers.includes(consonantSum)) masterNumbers.push(consonantSum);

  // Karmic Debt Identifiers (13, 14, 16, 19)
  const karmicDebts: number[] = [];
  if ([13, 14, 16, 19].includes(namankSum)) karmicDebts.push(namankSum);
  if ([13, 14, 16, 19].includes(vowelSum) && !karmicDebts.includes(vowelSum)) karmicDebts.push(vowelSum);
  if ([13, 14, 16, 19].includes(consonantSum) && !karmicDebts.includes(consonantSum)) karmicDebts.push(consonantSum);

  return {
    cleanName,
    namankCompound: namankSum,
    namank,
    soulUrgeCompound: vowelSum,
    soulUrge,
    personalityCompound: consonantSum,
    personality,
    masterNumbers,
    karmicDebts,
    rulingGraha: NAVAGRAHA_META[namank] || NAVAGRAHA_META[1]
  };
}

// ----------------------------------------------------------------------
// 3. 3x3 VEDIC GRID MATRIX ARCHITECTURE & POPULATION
// ----------------------------------------------------------------------

export type GridDensity = "missing" | "single_balanced" | "double_amplified" | "triple_hyper";

export interface VedicGridCell {
  number: number; // 1..9
  planetKey: PlanetKey;
  count: number;
  density: GridDensity;
  densityLabel: Record<string, string>;
  row: number; // 0..2
  col: number; // 0..2
  plane: "thought" | "will" | "action";
  grahaMeta: PlanetMeta;
}

export interface VedicGridMatrix {
  cells: Record<number, VedicGridCell>;
  rawDigitsProcessed: number[];
  excludedCenturyDigits: number[];
  moolankAdded: number | null;
  bhagyankAdded: number;
  planeScores: {
    thought: number; // 3-1-9
    will: number; // 6-7-5
    action: number; // 2-8-4
  };
  missingNumbers: number[];
}

/**
 * 3x3 Vedic Grid Layout Spatial Coordinates:
 * Row 0: [ 3 (Jupiter), 1 (Sun),    9 (Mars)   ]  <-- Thought / Mental Plane
 * Row 1: [ 6 (Venus),   7 (Ketu),   5 (Mercury)]  <-- Will / Emotional Plane
 * Row 2: [ 2 (Moon),    8 (Saturn), 4 (Rahu)   ]  <-- Action / Practical Plane
 */
export const VEDIC_GRID_SPATIAL_COORDS: Record<number, { row: number; col: number; plane: "thought" | "will" | "action" }> = {
  3: { row: 0, col: 0, plane: "thought" },
  1: { row: 0, col: 1, plane: "thought" },
  9: { row: 0, col: 2, plane: "thought" },
  6: { row: 1, col: 0, plane: "will" },
  7: { row: 1, col: 1, plane: "will" },
  5: { row: 1, col: 2, plane: "will" },
  2: { row: 2, col: 0, plane: "action" },
  8: { row: 2, col: 1, plane: "action" },
  4: { row: 2, col: 2, plane: "action" }
};

/**
 * Generate 3x3 Vedic Grid Matrix with Century Exclusion and Moolank/Bhagyank Placement rules.
 */
export function generateVedicGridMatrix(day: number, month: number, fullYear: number): VedicGridMatrix {
  const d = Math.max(1, Math.min(31, Math.floor(day)));
  const m = Math.max(1, Math.min(12, Math.floor(month)));
  const y = Math.floor(fullYear);

  const yearStr = String(y).padStart(4, "0");
  const centuryDigits = [parseInt(yearStr[0], 10), parseInt(yearStr[1], 10)].filter((n) => !isNaN(n));
  const yyStr = yearStr.slice(-2); // Century Exclusion: last two digits only

  // Extract raw digits from Day, Month, YY (exclude zeros)
  const rawDigits: number[] = [];
  const appendDigits = (str: string) => {
    for (const c of str) {
      const val = parseInt(c, 10);
      if (!isNaN(val) && val > 0) {
        rawDigits.push(val);
      }
    }
  };

  appendDigits(String(d));
  appendDigits(String(m));
  appendDigits(yyStr);

  // Moolank Rule: Add reduced Moolank only for compound birth days (11..31 excl 10,20,30)
  const moolankInfo = calculateMoolank(d);
  let moolankAdded: number | null = null;
  if (moolankInfo.isCompound) {
    moolankAdded = moolankInfo.moolank;
  }

  // Bhagyank Rule: Always add single-digit Bhagyank
  const bhagyankInfo = calculateBhagyank(d, m, y);
  const bhagyankAdded = bhagyankInfo.bhagyank;

  // Initialize frequency map for 1..9
  const frequencies: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  };

  // Add raw digits
  for (const digit of rawDigits) {
    if (digit >= 1 && digit <= 9) {
      frequencies[digit]++;
    }
  }

  // Add Moolank if compound
  if (moolankAdded !== null && moolankAdded >= 1 && moolankAdded <= 9) {
    frequencies[moolankAdded]++;
  }

  // Add Bhagyank
  if (bhagyankAdded >= 1 && bhagyankAdded <= 9) {
    frequencies[bhagyankAdded]++;
  }

  // Construct Cells
  const cells: Record<number, VedicGridCell> = {} as any;
  const missingNumbers: number[] = [];

  for (let num = 1; num <= 9; num++) {
    const count = frequencies[num];
    const spatial = VEDIC_GRID_SPATIAL_COORDS[num];
    let density: GridDensity = "missing";
    let densityLabel: Record<string, string> = {
      kn: "ಅನುಪಸ್ಥಿತ (ಪರಿಹಾರ ಅಗತ್ಯ)",
      en: "Missing Number (Remediation Needed)",
      hi: "अनुपस्थित (उपाय आवश्यक)",
      te: "లోపించిన సంఖ్య (పరిహారం అవసరం)",
      ta: "இல்லாத எண் (பரிகாரம் தேவை)"
    };

    if (count === 1) {
      density = "single_balanced";
      densityLabel = {
        kn: "ಏಕ ಸಂಖ್ಯೆ (ಸಮತೋಲಿತ ಸಹಜ ಶಕ್ತಿ)",
        en: "Single Instance (Balanced Healthy State)",
        hi: "एकल अंक (संतुलित ऊर्जा)",
        te: "ఏక సంఖ్య (సమతుల్య శక్తి)",
        ta: "ஒற்றை எண் (சமநிலை ஆற்றல்)"
      };
    } else if (count === 2) {
      density = "double_amplified";
      densityLabel = {
        kn: "ದ್ವಿ ಸಂಖ್ಯೆ (ಪ್ರಬಲ ವೃದ್ಧಿ & ಸಾಂದ್ರತೆ)",
        en: "Double Instance (Amplified Concentrated Power)",
        hi: "द्वि अंक (प्रबल संकेंद्रित क्षमता)",
        te: "ద్వి సంఖ్య (ప్రబల శక్తి)",
        ta: "இரட்டை எண் (அதிகரித்த ஆற்றல்)"
      };
    } else if (count >= 3) {
      density = "triple_hyper";
      densityLabel = {
        kn: "ತ್ರಿ+ ಸಂಖ್ಯೆ (ಅತಿ-ಸಾಂದ್ರತೆ / ತೀವ್ರ ಒತ್ತಡ)",
        en: "Triple+ Instance (Hyper-Saturated Multiplicity Overload)",
        hi: "त्रि+ अंक (अति-संतृप्त स्थिति)",
        te: "త్రి+ సంఖ్య (అధిక ఒత్తిడి)",
        ta: "மும்மை+ எண் (அதிகரித்த அழுத்தம்)"
      };
    } else {
      missingNumbers.push(num);
    }

    cells[num] = {
      number: num,
      planetKey: NAVAGRAHA_META[num].key,
      count,
      density,
      densityLabel,
      row: spatial.row,
      col: spatial.col,
      plane: spatial.plane,
      grahaMeta: NAVAGRAHA_META[num]
    };
  }

  // Plane scores (how many active digits present in plane)
  const thoughtActive = (cells[3].count > 0 ? 1 : 0) + (cells[1].count > 0 ? 1 : 0) + (cells[9].count > 0 ? 1 : 0);
  const willActive = (cells[6].count > 0 ? 1 : 0) + (cells[7].count > 0 ? 1 : 0) + (cells[5].count > 0 ? 1 : 0);
  const actionActive = (cells[2].count > 0 ? 1 : 0) + (cells[8].count > 0 ? 1 : 0) + (cells[4].count > 0 ? 1 : 0);

  return {
    cells,
    rawDigitsProcessed: rawDigits,
    excludedCenturyDigits: centuryDigits,
    moolankAdded,
    bhagyankAdded,
    planeScores: {
      thought: thoughtActive,
      will: willActive,
      action: actionActive
    },
    missingNumbers
  };
}

// ----------------------------------------------------------------------
// 4. COMPLETE 37 YOGAS PARSER MATRIX (Y01 to Y37)
// ----------------------------------------------------------------------

export interface VedicYogaDef {
  id: string; // "Y01" .. "Y37"
  combination: number[];
  name: Record<string, string>;
  planeOrType: "plane" | "strategic_triad" | "dual_vibration";
  manifestation: Record<string, string>;
  isPositive: boolean;
}

export const VEDIC_37_YOGAS_DATABASE: VedicYogaDef[] = [
  // Full Planes (Y01, Y07, Y06)
  {
    id: "Y01",
    combination: [3, 1, 9],
    name: {
      kn: "ವಿಚಾರ / ಚಿಂತನ ಪೂರ್ಣ ಯೋಗ (Thought Plane 3-1-9)",
      en: "Thought Plane Yoga (3-1-9)",
      hi: "विचार / चिंतन तल योग (3-1-9)",
      te: "ఆలోచనా తల యోగం (3-1-9)",
      ta: "சிந்தனை தளம் யோகம் (3-1-9)"
    },
    planeOrType: "plane",
    manifestation: {
      kn: "ಸಾರ್ವಜನಿಕ ಕೀರ್ತಿ, ಶ್ರೇಷ್ಠ ದೂರದರ್ಶಿ ನಾಯಕತ್ವ, ಆಡಳಿತಾತ್ಮಕ ತೇಜಸ್ಸು ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಒಲವು.",
      en: "Public fame, executive vision, spiritual inclination, and profound strategic mindset.",
      hi: "सार्वजनिक प्रतिष्ठा, दूरदर्शी नेतृत्व, प्रशासनिक क्षमता एवं आध्यात्मिक झुकाव।",
      te: "ప్రజాదరణ, దూరదృష్టి గల నాయకత్వం మరియు ఆధ్యాత్మిక వృద్ధి.",
      ta: "பொது புகழ், தொலைநோக்கு தலைமை மற்றும் ஆன்மீக நாட்டம்."
    },
    isPositive: true
  },
  {
    id: "Y02",
    combination: [3, 7, 4],
    name: {
      kn: "ಕಾಳಸರ್ಪ ಸಿದ್ಧಿ ಯೋಗ (Kalsarp Success 3-7-4)",
      en: "Kalsarp Success Yoga (3-7-4)",
      hi: "कालसर्प सिद्धि योग (3-7-4)",
      te: "కాలసర్ప సిద్ధి యోగం (3-7-4)",
      ta: "காலசர்ப்ப சித்தி யோகம் (3-7-4)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ಉನ್ನತ ಭೌತಿಕ ಸಮೃದ್ಧಿ, ಶಾಶ್ವತ ಧನಲಾಭ ಹಾಗೂ ಹಣಕಾಸಿನ ಹರಿವಿನ ಅಡೆತಡೆಗಳ ಶಾಶ್ವತ ನಿವಾರಣೆ.",
      en: "High material success, steady liquid cash-flow, and elimination of financial stalls.",
      hi: "उत्कृष्ट भौतिक सफलता, निरंतर धन प्रवाह एवं आर्थिक बाधाओं का निवारण।",
      te: "అత్యున్నత సంపద, ఆర్థిక ప్రవాహం మరియు స్థిర విజయం.",
      ta: "உயரிய பொருள் செல்வம், பணப்புழக்கம் மற்றும் தடைகள் நீங்குதல்."
    },
    isPositive: true
  },
  {
    id: "Y03",
    combination: [9, 7, 2],
    name: {
      kn: "ಶೌರ್ಯ ಸಾಹಸ ಯೋಗ (Courage & Crisis Heroism 9-7-2)",
      en: "Courage & Crisis Heroism Yoga (9-7-2)",
      hi: "शौर्य एवं संकट मोचन योग (9-7-2)",
      te: "శౌర్య సాహస యోగం (9-7-2)",
      ta: "வீர சாகச யோகம் (9-7-2)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ನಿರ್ಭೀತ ಮನೋಭಾವ, ಸಂಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ಆಪದ್ಭಾಂದವ ನಾಯಕತ್ವ ಹಾಗೂ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯ ಜಯ.",
      en: "Fearless disposition, crisis heroism, and triumph in sudden emergency situations.",
      hi: "निर्भीक स्वभाव, संकट के समय कुशल नेतृत्व एवं आपातकालीन विजय।",
      te: "భయరహిత మనస్తత్వం, ఆపదలో ధైర్యం మరియు నాయకత్వం.",
      ta: "அஞ்சா நெஞ்சம், அவசர கால தீர செயல் மற்றும் வெற்றி."
    },
    isPositive: true
  },
  {
    id: "Y04",
    combination: [3, 6, 2],
    name: {
      kn: "ವಿದ್ಯಾ ಸರಸ್ವತೀ & ಮಾರ್ಗದರ್ಶನ ಯೋಗ (Education & Advisory 3-6-2)",
      en: "Education & Advisory Intellect Yoga (3-6-2)",
      hi: "विद्या एवं परामर्श योग (3-6-2)",
      te: "విద్యా & సలహా మేధో యోగం (3-6-2)",
      ta: "கல்வி & ஆலோசனை யோகம் (3-6-2)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ಅಸಾಧಾರಣ ಬುದ್ಧಿವಂತಿಕೆ, ಬೋಧನಾ ಪ್ರತಿಭೆ, ಕಾರ್ಯತಂತ್ರ ಕೌಶಲ್ಯ ಹಾಗೂ ಸಲಹಾ ವೃತ್ತಿಯಲ್ಲಿ ಅಗ್ರಸ್ಥಾನ.",
      en: "High intellect, teaching prowess, strategic articulation, and elite advisory talent.",
      hi: "असाधारण बुद्धिमत्ता, शिक्षण प्रतिभा, रणनीतिक कौशल एवं परामर्श में शीर्ष स्थान।",
      te: "అసాధారణ మేధస్సు, బోధనా నైపుణ్యం మరియు సలహా రంగంలో విజయం.",
      ta: "உயரிய அறிவு, பயிற்றுவிக்கும் ஆற்றல் மற்றும் சிறந்த ஆலோசனை திறன்."
    },
    isPositive: true
  },
  {
    id: "Y05",
    combination: [1, 7, 8],
    name: {
      kn: "ಆಧ್ಯಾತ್ಮಿಕ ಸಮಾಜಮುಖಿ ಯೋಗ (Spiritual Socialist 1-7-8)",
      en: "Spiritual Socialist Yoga (1-7-8)",
      hi: "आध्यात्मिक समाजवादी योग (1-7-8)",
      te: "ఆధ్యాత్మిక సమాజహిత యోగం (1-7-8)",
      ta: "ஆன்மீக சமூக யோகம் (1-7-8)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ಬಹುಮುಖ ಆದಾಯ ಮೂಲಗಳು, ಸಮಾಜ ಸೇವೆ ಹಾಗೂ ಲೋಕೋಪಕಾರ ಕಾರ್ಯಗಳಲ್ಲಿ ಯಶಸ್ಸು.",
      en: "Multiple income streams, social welfare success, and dedication to humanitarian causes.",
      hi: "एकाधिक आय स्रोत, समाज सेवा एवं लोक कल्याणकारी कार्यों में सफलता।",
      te: "బహుళ ఆదాయ మార్గాలు, సమాజ సేవ మరియు విశేష పుణ్యఫలం.",
      ta: "பல்வேறு வருமான வழிகள், சமூக சேவை மற்றும் பொது நலம்."
    },
    isPositive: true
  },
  {
    id: "Y06",
    combination: [2, 8, 4],
    name: {
      kn: "ಕ್ರಿಯಾ / ಕಾಯಕ ಪೂರ್ಣ ಯೋಗ (Action Plane 2-8-4)",
      en: "Action Plane Yoga (2-8-4)",
      hi: "क्रिया / कर्म तल योग (2-8-4)",
      te: "క్రియా తల యోగం (2-8-4)",
      ta: "செயல் தளம் யோகம் (2-8-4)"
    },
    planeOrType: "plane",
    manifestation: {
      kn: "ಅಪಾರ ದೈಹಿಕ ಶ್ರಮ, ಕಠಿಣ ಪರಿಶ್ರಮದಿಂದ ಕಾರ್ಯಸಾಧನೆ ಹಾಗೂ ಧೃಢ ಕರ್ಮನಿಷ್ಠೆ.",
      en: "High physical stamina, execution through grueling labor, and resolute perseverance.",
      hi: "कठिन शारीरिक व मानसिक श्रम, लगन से कार्य सिद्धि एवं दृढ़ कर्मठता।",
      te: "అపారమైన శ్రమ, పట్టుదలతో కార్యాచరణ మరియు విజయం.",
      ta: "கடுமையான உழைப்பு, விடாமுயற்சி மற்றும் செயல் வெற்றி."
    },
    isPositive: true
  },
  {
    id: "Y07",
    combination: [6, 7, 5],
    name: {
      kn: "ಇಚ್ಛಾಶಕ್ತಿ & ವ್ಯಾಪಾರ ಪೂರ್ಣ ಯೋಗ (Will / Business Plane 6-7-5)",
      en: "Will & Business Plane Yoga (6-7-5)",
      hi: "इच्छाशक्ति एवं व्यापार तल योग (6-7-5)",
      te: "ఇచ్ఛాశక్తి & వ్యాపార తల యోగం (6-7-5)",
      ta: "மனோபலம் & வணிக தளம் யோகம் (6-7-5)"
    },
    planeOrType: "plane",
    manifestation: {
      kn: "ಅತ್ಯುತ್ತಮ ವಾಣಿಜ್ಯ ಜಾಣ್ಮೆ, ಹಣಕಾಸು ನಿರ್ವಹಣೆ, ಪ್ರೇಮ ವಿವಾಹ ಹಾಗೂ ಸ್ವಂತ ಉದ್ಯಮ ಸಿದ್ಧಿ.",
      en: "Elite commercial acumen, wealth management, love marriage harmony, and entrepreneurial flair.",
      hi: "उत्कृष्ट व्यापारिक समझ, धन प्रबंधन, प्रेम विवाह एवं सफल उद्यमिता।",
      te: "వాణిజ్య ప్రతిభ, ధన నిర్వహణ మరియు వ్యాపార విజయం.",
      ta: "வணிக சாமர்த்தியம், பண மேலாண்மை மற்றும் தொழில் வெற்றி."
    },
    isPositive: true
  },
  {
    id: "Y08",
    combination: [9, 5, 4],
    name: {
      kn: "ಬಂಧನ ಹಾಗೂ ತ್ವರಿತ ಕಾರ್ಯಸಿದ್ಧಿ ಯೋಗ (Bandhan Execution 9-5-4)",
      en: "Bandhan Fast Execution Yoga (9-5-4)",
      hi: "बंधन एवं तीव्र कार्यसिद्धि योग (9-5-4)",
      te: "బంధన & వేగవంతమైన కార్యాచరణ యోగం (9-5-4)",
      ta: "பந்தன துரித செயல் யோகம் (9-5-4)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ಕನಸುಗಳನ್ನು ತ್ವರಿತವಾಗಿ ನನಸು ಮಾಡುವ ವೇಗ; ಆದರೆ ಆಸ್ತಿ ಅಥವಾ ಕಾಗದಪತ್ರಗಳಲ್ಲಿ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ.",
      en: "Rapid execution, turning ambition into reality; requires vigilance against property/contract disputes.",
      hi: "सपनों को तेजी से साकार करने की क्षमता; संपत्ति व अनुबंधों में सावधानी आवश्यक।",
      te: "లక్ష్యాలను వేగంగా సాధించే శక్తి; ఆస్తి వివాదాల్లో జాగ్రత్త అవసరం.",
      ta: "கனவுகளை நனவாக்கும் வேகம்; சொத்து ஆவணங்களில் கவனம் தேவை."
    },
    isPositive: false
  },
  {
    id: "Y09",
    combination: [3, 9, 8],
    name: {
      kn: "ತ್ರಿಕೋಣ ಶ್ರಮ ಸಿದ್ಧಿ ಯೋಗ (Trine Struggle Success 3-9-8)",
      en: "Trine Struggle Success Yoga (3-9-8)",
      hi: "त्रिकोण संघर्ष सिद्धि योग (3-9-8)",
      te: "త్రికోణ శ్రమ విజయ యోగం (3-9-8)",
      ta: "முக்கோண போராட்ட வெற்றி யோகம் (3-9-8)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ಆರಂಭಿಕ ಜೀವನದಲ್ಲಿ ಕೌಟುಂಬಿಕ ಸವಾಲುಗಳು; ಆದರೆ ಕಠಿಣ ಪರಿಶ್ರಮದ ನಂತರ ಮಹೋನ್ನತ ಸಾಧನೆ.",
      en: "Average early family life; major life achievements arrive after intense struggle and determination.",
      hi: "प्रारंभिक जीवन में संघर्ष; परंतु सतत परिश्रम के उपरांत ऐतिहासिक सफलता।",
      te: "ప్రారంభంలో సవాళ్లు; తీవ్ర శ్రమ తర్వాత అద్భుత విజయం.",
      ta: "ஆரம்ப கால போராட்டம்; கடும் உழைப்பிற்கு பின் மாபெரும் சாதனை."
    },
    isPositive: true
  },
  {
    id: "Y10",
    combination: [6, 9, 4],
    name: {
      kn: "ಭೋಗವಿಲಾಸಿ ಸಂಕಲ್ಪ ಯೋಗ (Materialistic Luxury 6-9-4)",
      en: "Materialistic Luxury & Strong Will Yoga (6-9-4)",
      hi: "विलासिता एवं प्रबल इच्छाशक्ति योग (6-9-4)",
      te: "విలాస & ప్రబల సంకల్ప యోగం (6-9-4)",
      ta: "ஆடம்பர இச்சை யோகம் (6-9-4)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ಬಲಿಷ್ಠ ಇಚ್ಛಾಶಕ್ತಿ, ಭೋಗ ವಸ್ತುಗಳು ಹಾಗೂ ಐಷಾರಾಮಿ ಜೀವನದತ್ತ ತೀವ್ರ ಆಕರ್ಷಣೆ.",
      en: "Strong willpower, deep drive for luxury assets, and unconventional relationships potential.",
      hi: "प्रबल इच्छाशक्ति, भौतिक सुख-सुविधाओं के प्रति गहरा आकर्षण।",
      te: "బలమైన సంకల్పం మరియు విలాసవంతమైన జీవితంపై ఆసక్తి.",
      ta: "வலுவான மன உறுதி மற்றும் ஆடம்பர பொருட்கள் மீது நாட்டம்."
    },
    isPositive: false
  },
  {
    id: "Y11",
    combination: [1, 2, 4],
    name: {
      kn: "ವಿದ್ಯಾ ಅಸ್ಥಿರತಾ ಯೋಗ (Unstable Education 1-2-4)",
      en: "Unstable Education & Early Volatility (1-2-4)",
      hi: "शिक्षा अस्थिरता योग (1-2-4)",
      te: "విద్యా అస్థిరత యోగం (1-2-4)",
      ta: "கல்வி தடங்கல் யோகம் (1-2-4)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ಶಿಕ್ಷಣದಲ್ಲಿ ಏರಿಳಿತಗಳು, ಸ್ಥಳ ಬದಲಾವಣೆ ಅಥವಾ ಆರಂಭಿಕ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಬದಲಾವಣೆಗಳು.",
      en: "Disruption in formal education, career shifts, and early restlessness.",
      hi: "औपचारिक शिक्षा में व्यवधान एवं प्रारंभिक करियर में उतार-चढ़ाव।",
      te: "చదువులో అవాంతరాలు మరియు ప్రారంభ కెరీర్‌లో మార్పులు.",
      ta: "கல்வியில் தடைகள் மற்றும் ஆரம்ப கால தொழில் மாற்றங்கள்."
    },
    isPositive: false
  },
  {
    id: "Y12",
    combination: [9, 1, 7],
    name: {
      kn: "ಎಲ್-ಆಕಾರದ ಛಲ ಯೋಗ (L-Shape Willpower 9-1-7)",
      en: "L-Shape Aggressive Willpower Yoga (9-1-7)",
      hi: "एल-आकार प्रबल इच्छाशक्ति योग (9-1-7)",
      te: "ఎల్-ఆకార పట్టుదల యోగం (9-1-7)",
      ta: "L-வடிவ மனோபல யோகம் (9-1-7)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ತೀವ್ರ ಸ್ಪರ್ಧಾತ್ಮಕ ಮನೋಭಾವ, ಅಪ್ರತಿಹತ ಛಲ ಹಾಗೂ ಎದುರಾಳಿಗಳನ್ನು ಹಿಮ್ಮೆಟ್ಟಿಸುವ ಸಾಹಸ.",
      en: "Aggressive competitiveness, indomitable drive, and resolute determination to conquer goals.",
      hi: "तीव्र प्रतिस्पर्धात्मक क्षमता, अटूट लगन एवं विरोधियों पर विजय पाने का जज्बा।",
      te: "తీవ్ర పోటీతత్వం మరియు లక్ష్య సాధనలో అద్భుత పట్టుదల.",
      ta: "போட்டி மனப்பான்மை மற்றும் எதையும் வெல்லும் மன உறுதி."
    },
    isPositive: true
  },
  {
    id: "Y13",
    combination: [1, 3, 6],
    name: {
      kn: "ಮೇಧಾವಿ ಬ್ರಹ್ಮಜ್ಞಾನ ಯೋಗ (Intellectual Guru 1-3-6)",
      en: "Intellectual Guru & Academic Distinction (1-3-6)",
      hi: "मेधावी गुरु योग (1-3-6)",
      te: "మేధావి గురు యోగం (1-3-6)",
      ta: "மேதாவிலாச குரு யோகம் (1-3-6)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ಉನ್ನತ ಶೈಕ್ಷಣಿಕ ಗೌರವ, ಬೋಧನಾ ಅಧಿಕಾರ ಹಾಗೂ ಶಾಸ್ತ್ರೀಯ-ತಾಂತ್ರಿಕ ಪರಿಣತಿ.",
      en: "Elite intellectual, academic, or teaching credentials with high social respect.",
      hi: "उच्च बौद्धिक योग्यता, शिक्षण अधिकार एवं समाज में विशिष्ट सम्मान।",
      te: "ఉన్నత విద్యా అర్హత, బోధనా ప్రతిభ మరియు సమాజ గౌరవం.",
      ta: "உயரிய கல்வித் தகுதி மற்றும் ஆசிரியர் பணி மேன்மை."
    },
    isPositive: true
  },
  {
    id: "Y14",
    combination: [7, 5, 4],
    name: {
      kn: "ಕಾಳಸರ್ಪ ಸಂಘರ್ಷ ಯೋಗ (Kalsarp Struggle 7-5-4)",
      en: "Kalsarp Struggle & Communication Hurdles (7-5-4)",
      hi: "कालसर्प संघर्ष योग (7-5-4)",
      te: "కాలసర్ప సంఘర్షణ యోగం (7-5-4)",
      ta: "காலசர்ப்ப போராட்ட யோகம் (7-5-4)"
    },
    planeOrType: "strategic_triad",
    manifestation: {
      kn: "ಉನ್ನತ ದುಡಿಮೆಯ ಸಾಮರ್ಥ್ಯ; ಆದರೆ ಭಾವನೆಗಳನ್ನು ವ್ಯಕ್ತಪಡಿಸುವಲ್ಲಿ ಅಥವಾ ಸಂವಹನದಲ್ಲಿ ತೊಂದರೆ.",
      en: "High capacity for hard work, but struggles in interpersonal communication and articulation.",
      hi: "कठिन कार्य क्षमता; परंतु संवाद एवं अभिव्यक्ति में चुनौतियां।",
      te: "కష్టపడే తత్వం; అయితే భావవ్యక్తీకరణలో కొన్ని ఇబ్బందులు.",
      ta: "கடும் உழைப்பு; ஆனால் தகவல் பரிமாற்றத்தில் சில தடைகள்."
    },
    isPositive: false
  },
  // Dual Vibrations (Y15 to Y37)
  {
    id: "Y15",
    combination: [6, 7],
    name: { kn: "ವೈರಾಗ್ಯ ಸೌಂದರ್ಯ ಯೋಗ (Aesthetic Detachment 6-7)", en: "Aesthetic Detachment (6-7)", hi: "सौंदर्य वैराग्य योग (6-7)", te: "సౌందర్య వైరాగ్య యోగం (6-7)", ta: "வைராக்கிய யோகம் (6-7)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ವಯಸ್ಸಾದಂತೆ ಭೌತಿಕ ಸುಖ ಅಥವಾ ಭೋಗಾಸಕ್ತಿಗಳಿಂದ ವಿಮುಖವಾಗಿ ಆಧ್ಯಾತ್ಮದತ್ತ ಒಲವು.", en: "Declining interest in material luxury or romantic attachments over time; inward spiritual turn.", hi: "समय के साथ भौतिक विलासिता से वैराग्य एवं आध्यात्मिकता में रुचि।", te: "కాలక్రమేణా విలాసాల పట్ల విరక్తి మరియు ఆధ్యాత్మిక చింతన.", ta: "காலப்போக்கில் உலக ஆசைகளில் பற்றின்மை மற்றும் ஆன்மீகம்." },
    isPositive: true
  },
  {
    id: "Y16",
    combination: [9, 5],
    name: { kn: "ವಿವೇಕಯುತ ಕ್ರಿಯಾ ಯೋಗ (Deliberate Action 9-5)", en: "Deliberate Action (9-5)", hi: "विवेकपूर्ण क्रिया योग (9-5)", te: "వివేక క్రియా యోగం (9-5)", ta: "விவேக செயல் யோகம் (9-5)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಯಾವುದೇ ಕಾರ್ಯಕ್ಕೆ ಕೈಹಾಕುವ ಮುನ್ನ ಆಳವಾಗಿ ಯೋಚಿಸಿ ನಿಖರವಾಗಿ ಅನುಷ್ಠಾನಗೊಳಿಸುವ ಚಾಕಚಕ್ಯತೆ.", en: "Highly motivated; maintains an ideal balance of deep strategic thinking before rapid execution.", hi: "कार्य करने से पूर्व गहन विचार एवं सटीक क्रियान्वयन का संतुलन।", te: "ఆలోచించి నిర్ణయం తీసుకునే సమతుల్యత మరియు కార్యసిద్ధి.", ta: "ஆழ்ந்து சிந்தித்து செயலாற்றும் சமநிலை." },
    isPositive: true
  },
  {
    id: "Y17",
    combination: [8, 4],
    name: { kn: "ಕಠಿಣ ಶ್ರಮ & ಪರಿಶ್ರಮ ಯೋಗ (Hardwork & Obstacle 8-4)", en: "Hardwork & Obstacle (8-4)", hi: "कठिन श्रम एवं बाधा योग (8-4)", te: "కఠిన శ్రమ & అవరోధ యోగం (8-4)", ta: "கடும் உழைப்பு யோகம் (8-4)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಅದ್ಭುತ ಸಂಕಲ್ಪ ಶಕ್ತಿ, ಕಠಿಣ ದುಡಿಮೆಯ ಸಾಮರ್ಥ್ಯ; ಆದರೆ ಕೌಟುಂಬಿಕ ಜೀವನದಲ್ಲಿ ಅಶಾಂತಿ ಅಥವಾ ವಿಳಂಬ.", en: "High determination, capacity for grueling labor; domestic life or results face delays.", hi: "अथक परिश्रम की क्षमता; परंतु पारिवारिक जीवन में तनाव या विलंब।", te: "తీవ్ర శ్రమించే శక్తి; అయితే ఫలితాల్లో కొంత ఆలస్యం.", ta: "கடுமையான உழைப்பு; ஆனால் பலன்களில் தாமதம்." },
    isPositive: false
  },
  {
    id: "Y18",
    combination: [7, 8],
    name: { kn: "ಆಧ್ಯಾತ್ಮಿಕ ಕರ್ಮ ಯೋಗ (Spiritual Karma 7-8)", en: "Spiritual Karma (7-8)", hi: "आध्यात्मिक कर्म योग (7-8)", te: "ఆధ్యాత్మిక కర్మ యోగం (7-8)", ta: "ஆன்மீக கர்ம யோகம் (7-8)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ನಿಸ್ವಾರ್ಥ ಸೇವೆ, ಧಾರ್ಮಿಕ ಕಾರ್ಯಗಳು, ದಾನ-ಧರ್ಮ ಹಾಗೂ ಸತ್ಕರ್ಮಗಳತ್ತ ಜೀವಿತದ ಸೆಳೆತ.", en: "Drives native toward selfless service, esoteric study, and accumulating good karma.", hi: "निःस्वार्थ सेवा, धार्मिक अनुष्ठान एवं परोपकार की ओर स्वाभाविक झुकाव।", te: "నిస్వార్థ సేవ మరియు సత్కర్మల పట్ల ఆసక్తి.", ta: "சுயநலமற்ற சேவை மற்றும் தர்ம காரியங்களில் ஈடுபாடு." },
    isPositive: true
  },
  {
    id: "Y19",
    combination: [7, 5],
    name: { kn: "ತಾರ್ಕಿಕ ನ್ಯಾಯವಾದಿ ಯೋಗ (Argumentative / Legal 7-5)", en: "Argumentative / Legal Intellect (7-5)", hi: "तार्किक न्याय योग (7-5)", te: "తార్కిక న్యాయ యోగం (7-5)", ta: "வாத பிரதிவாத யோகம் (7-5)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ತೀಕ್ಷ್ಣ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಬುದ್ಧಿ, ವಾದ-ವಿವಾದಗಳಲ್ಲಿ ಜಯ ಹಾಗೂ ಕಾನೂನು/ನ್ಯಾಯಾಂಗ ಕ್ಷೇತ್ರಕ್ಕೆ ಪ್ರಶಸ್ತ.", en: "Sharp analytical mind, debate mastery, and high suitability for legal or advisory careers.", hi: "तीक्ष्ण विश्लेषणात्मक बुद्धि, वाद-विवाद में निपुणता एवं विधिक सफलता।", te: "కూర్పైన విశ్లేషణ, వాదనలో ప్రతిభ మరియు న్యాయరంగ విజయం.", ta: "கூர்மையான வாதத் திறன் மற்றும் சட்டத் துறை மேன்மை." },
    isPositive: true
  },
  {
    id: "Y20",
    combination: [1, 9],
    name: { kn: "ಶೌರ್ಯ ನಾಯಕತ್ವ ಯೋಗ (Courageous Leadership 1-9)", en: "Courageous Leadership (1-9)", hi: "शौर्य नेतृत्व योग (1-9)", te: "శౌర్య నాయకత్వ యోగం (1-9)", ta: "தீர தலைமை யோகம் (1-9)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಸೂರ್ಯನ ಆಡಳಿತ ತೇಜಸ್ಸು ಹಾಗೂ ಕುಜನ ಶೌರ್ಯದ ಸಮ್ಮಿಲನ; ಧೀರ ಹಾಗೂ ಪ್ರಭಾವಿ ನಾಯಕತ್ವ.", en: "Combines solar authority with martial valor; bold, confident, and victorious leadership.", hi: "सूर्य का तेज एवं मंगल का पराक्रम; निर्भीक एवं प्रभावशाली नेतृत्व।", te: "సూర్యుని తేజస్సు & కుజుని ధైర్యం; అజేయమైన నాయకత్వం.", ta: "சூரியனின் ஆளுமை & செவ்வாயின் வீரம் கலந்த தலைமை." },
    isPositive: true
  },
  {
    id: "Y21",
    combination: [6, 2],
    name: { kn: "ಕಲಾ ಸೌಂದರ್ಯ ಯೋಗ (Artistic Nature 6-2)", en: "Artistic Nature & Aesthetics (6-2)", hi: "कला सौंदर्य योग (6-2)", te: "కళా సౌందర్య యోగం (6-2)", ta: "கலை ரசனை யோகம் (6-2)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಕಲೆ, ಸಂಗೀತ, ಸಾಹಿತ್ಯ, ಸೌಂದರ್ಯ ಹಾಗೂ ನಿಸರ್ಗದ ಆಳವಾದ ಮೆಚ್ಚುಗೆ.", en: "Deep appreciation for art, music, literature, refined aesthetics, and emotional grace.", hi: "कला, संगीत, साहित्य एवं प्राकृतिक सौंदर्य के प्रति गहरा आकर्षण।", te: "సంగీతం, సాహిత్యం మరియు కళల పట్ల గాఢమైన అనురక్తి.", ta: "கலை, இசை, இலக்கியம் மற்றும் அழகுணர்ச்சி." },
    isPositive: true
  },
  {
    id: "Y22",
    combination: [5, 4],
    name: { kn: "ಕಾರ್ಯತಂತ್ರ ಸಂವಹನ ಯೋಗ (Strategic Communication 5-4)", en: "Strategic Communication (5-4)", hi: "रणनीतिक संवाद योग (5-4)", te: "వ్యూహాత్మక సంభాషణ యోగం (5-4)", ta: "வியூக பேச்சு யோகம் (5-4)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಬುದ್ಧಿಶಕ್ತಿ, ತಾರ್ಕಿಕ ಜಾಣ್ಮೆ ಹಾಗೂ ವ್ಯಾಪಾರ ವಹಿವಾಟಿನಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು.", en: "Verbal agility; merges logical thinking with commercial acumen and strategic foresight.", hi: "वाक्चातुर्य, तार्किक सूझबूझ एवं व्यापारिक सौदों में अप्रत्याशित सफलता।", te: "వాక్చాతుర్యం మరియు వాణిజ్య ఒప్పందాలలో అద్భుత విజయం.", ta: "பேச்சு சாதுரியம் மற்றும் வணிக உத்திகள்." },
    isPositive: true
  },
  {
    id: "Y23",
    combination: [3, 6],
    name: { kn: "ಸಲಹಾ ಧನಾಗಮ ಯೋಗ (Advisory Cash Flow 3-6)", en: "Advisory Cash Flow (3-6)", hi: "परामर्श धनागम योग (3-6)", te: "సలహా ధనాగమ యోగం (3-6)", ta: "ஆலோசனை பணவரவு யோகம் (3-6)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ನಿರಂತರ ಧನಾಗಮ, ಶಿಕ್ಷಣ, ಬೋಧನೆ, ಸಲಹೆ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಅಗ್ರಸ್ಥಾನ.", en: "Steady income stream; highly prosperous in education, advisory, and consulting professions.", hi: "सतत धन प्रवाह; शिक्षण, परामर्श एवं मार्गदर्शन के क्षेत्र में अपार सफलता।", te: "నిరంతర ఆదాయం; బోధన మరియు కన్సల్టింగ్ రంగంలో గుర్తింపు.", ta: "தொடர் வருமானம்; கல்வி மற்றும் ஆலோசனை துறையில் வெற்றி." },
    isPositive: true
  },
  {
    id: "Y24",
    combination: [2, 8],
    name: { kn: "ಮಾನಸಿಕ ಅಸ್ಥಿರತಾ ಯೋಗ (Hesitation / Obstacle 2-8)", en: "Hesitation / Obstacle (2-8)", hi: "संकोच एवं बाधा योग (2-8)", te: "సంకోచ & అవరోధ యోగం (2-8)", ta: "தயக்கம் மற்றும் தடை யோகம் (2-8)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಭಾವನಾತ್ಮಕ ತೊಳಲಾಟ, ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವಲ್ಲಿ ವಿಳಂಬ ಹಾಗೂ ಕಾರ್ಯಗಳಲ್ಲಿ ಆಲಸ್ಯ.", en: "Indecisiveness, emotional mood swings; projects frequently encounter delays.", hi: "अनिर्णय की स्थिति, भावनात्मक उतार-चढ़ाव एवं कार्यों में विलंब।", te: "భావోద్వేగ అస్థిరత మరియు నిర్ణయాల్లో కొంత జాప్యం.", ta: "மன ஊசலாட்டம் மற்றும் முடிவெடுப்பதில் தாமதம்." },
    isPositive: false
  },
  {
    id: "Y25",
    combination: [1, 7],
    name: { kn: "ಪವಿತ್ರ ಹೃದಯ ಸತ್ತ್ವ ಯೋಗ (Pure Heart & Integrity 1-7)", en: "Pure Heart & Integrity (1-7)", hi: "पवित्र हृदय योग (1-7)", te: "పవిత్ర హృదయ యోగం (1-7)", ta: "தூய மன யோகம் (1-7)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಉದಾತ್ತ ಮನಸ್ಸು, ನಿಸ್ವಾರ್ಥ ನಡವಳಿಕೆ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಗೌರವಾನ್ವಿತ ವ್ಯಕ್ತಿತ್ವ.", en: "Noble-hearted, altruistic disposition; acts with high moral integrity and inner purity.", hi: "उदात्त विचार, निःस्वार्थ व्यवहार, सत्यनिष्ठा एवं सम्मानित व्यक्तित्व।", te: "ఉన్నత వ్యక్తిత్వం, సత్యనిష్ఠ మరియు ధర్మ ప్రవర్తన.", ta: "உயர்ந்த பண்பு, நேர்மை மற்றும் நற்பெயர்." },
    isPositive: true
  },
  {
    id: "Y26",
    combination: [2, 4],
    name: { kn: "ದೃಷ್ಟಿ ಸಂಬಂಧ ಕಲಹ ಯೋಗ (Drishti Conflict 2-4)", en: "Drishti Sambandh Conflict (2-4)", hi: "दृष्टि संबंध संघर्ष योग (2-4)", te: "దృష్టి సంబంధ కలహ యోగం (2-4)", ta: "மனக் குழப்ப யோகம் (2-4)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಮಾನಸಿಕ ಒತ್ತಡ, ಕೌಟುಂಬಿಕ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಹಾಗೂ ಫಲಿತಾಂಶಗಳಲ್ಲಿ ವಿಳಂಬ.", en: "Mood swings, emotional volatility, high family tension, and delays in manifestation.", hi: "मानसिक तनाव, पारिवारिक मतभेद एवं परिणामों में अप्रत्याशित विलंब।", te: "మానసిక ఒత్తిడి మరియు కుటుంబంలో అప్పుడప్పుడు కలతలు.", ta: "மன அழுத்தம் மற்றும் முடிவுகளில் தாமதம்." },
    isPositive: false
  },
  {
    id: "Y27",
    combination: [6, 5],
    name: { kn: "ಭೋಗ ವ್ಯಾಪಾರ ಯೋಗ (Material Passion & Commerce 6-5)", en: "Material Passion & Commerce (6-5)", hi: "भोग व्यापार योग (6-5)", te: "భోగ వ్యాపార యోగం (6-5)", ta: "வணிக யோகம் (6-5)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಐಷಾರಾಮಿ ಜೀವನ, ವ್ಯಾಪಾರ, ಪ್ರವಾಸ ಹಾಗೂ ನವೀನ ಆಸ್ತಿಗಳ ಸಂಪಾದನೆಯಲ್ಲಿ ಆಸಕ್ತಿ.", en: "High passion for luxury, physical assets, commercial expansion, and global travel.", hi: "विलासिता, व्यापार विस्तार, यात्रा एवं नवीन परिसंपत्तियों के अर्जन में रुचि।", te: "విలాసవంతమైన జీవితం, వ్యాపార విస్తరణ మరియు ప్రయాణాలు.", ta: "ஆடம்பர வாழ்க்கை, தொழில் வளர்ச்சி மற்றும் பயணங்கள்." },
    isPositive: true
  },
  {
    id: "Y28",
    combination: [9, 4],
    name: { kn: "ಅಪ್ರತಿಹತ ಪ್ರಭಾವ ಯೋಗ (Dominating Willpower 9-4)", en: "Dominating Willpower (9-4)", hi: "प्रचंड प्रभाव योग (9-4)", te: "ప్రచండ ప్రభావ యోగం (9-4)", ta: "அதிகார யோகம் (9-4)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಅತ್ಯುನ್ನತ ಇಚ್ಛಾಶಕ್ತಿ, ಪ್ರಭಾವಿ ಅಧಿಕಾರ ಚಲಾಯಿಸುವ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಯಶಸ್ಸು.", en: "Elite willpower, authoritative disposition, commanding presence, and victory.", hi: "अदम्य इच्छाशक्ति, प्रभावशाली अधिकार एवं प्रशासनिक दृढ़ता।", te: "అత్యున్నత సంకల్పం మరియు అధికార దక్షత.", ta: "அசைக்க முடியாத மன உறுதி மற்றும் அதிகார பலம்." },
    isPositive: true
  },
  {
    id: "Y29",
    combination: [1, 8],
    name: { kn: "ಸೂರ್ಯ-ಶನಿ ಶತ್ರು ಯೋಗ (Sun-Saturn Friction 1-8)", en: "Sun-Saturn Enmity & Volatility (1-8)", hi: "सूर्य-शनि शत्रुता योग (1-8)", te: "సూర్య-శని శత్రుత్వ యోగం (1-8)", ta: "சூரிய-சனி முரண்பாடு (1-8)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಹಣಕಾಸಿನ ಏರಿಳಿತ, ವೃತ್ತಿಯಲ್ಲಿ ಸವಾಲುಗಳು; ವಿನಯ ಹಾಗೂ ನಿರಂತರ ಶ್ರಮದಿಂದ ಮಾತ್ರ ಗೆಲುವು.", en: "Financial friction, professional volatility; requires extreme humility, discipline, and persistence.", hi: "आर्थिक उतार-चढ़ाव एवं कार्यक्षेत्र में चुनौतियां; विनम्रता व संयम अनिवार्य।", te: "ఆర్థిక హెచ్చుతగ్గులు; వినయం మరియు నిరంతర శ్రమ అవసరం.", ta: "பொருளாதார ஏற்றத்தாழ்வு; பணிவு மற்றும் உழைப்பால் வெற்றி." },
    isPositive: false
  },
  {
    id: "Y30",
    combination: [3, 2],
    name: { kn: "ತತ್ತ್ವಜ್ಞಾನ ಪ್ರಜ್ಞಾ ಯೋಗ (Philosophical Wisdom 3-2)", en: "Philosophical Wisdom (3-2)", hi: "तत्वज्ञान प्रज्ञा योग (3-2)", te: "తత్త్వజ్ఞాన ప్రజ్ఞా యోగం (3-2)", ta: "தத்துவ ஞான யோகம் (3-2)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಆಳವಾದ ತತ್ತ್ವಚಿಂತನೆ, ಉನ್ನತ ಬುದ್ಧಿಮತ್ತೆ, ಸಾಹಿತ್ಯ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಒಲವು.", en: "Philosophical outlook, high emotional intelligence, deep academic interest, and wisdom.", hi: "दार्शनिक दृष्टिकोण, उच्च बुद्धिमत्ता, साहित्य एवं विद्या में गहन रुचि।", te: "తాత్విక దృక్పథం, ఉన్నత మేధస్సు మరియు విద్యాసక్తి.", ta: "தத்துவ பார்வை, நுண்ணறிவு மற்றும் கல்வி நாட்டம்." },
    isPositive: true
  },
  {
    id: "Y31",
    combination: [3, 9],
    name: { kn: "ಸಮಾಜ ಕಲ್ಯಾಣ ಧೀಮಂತ ಯೋಗ (Altruistic Analytical 3-9)", en: "Altruistic Analytical (3-9)", hi: "समाज कल्याण विश्लेषक योग (3-9)", te: "సమాజ కళ్యాణ విశ్లేషణ యోగం (3-9)", ta: "சமூக நலம் யோகம் (3-9)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಬಹುಮುಖ ಪ್ರತಿಭೆ, ಅತ್ಯುತ್ತಮ ವಿಶ್ಲೇಷಣಾ ಕೌಶಲ್ಯ ಹಾಗೂ ಸಮಾಜ ಸೇವೆಗೆ ಸಮರ್ಪಣೆ.", en: "Multitalented, sharp analytical skills, and profound dedication to social and philanthropic causes.", hi: "बहुआयामी प्रतिभा, उत्कृष्ट विश्लेषण क्षमता एवं समाज सेवा के प्रति समर्पण।", te: "బహుముఖ ప్రతిభ, విశ్లేషణా నైపుణ్యం మరియు సేవాభావం.", ta: "பன்முகத் திறன், கூரிய பகுப்பாய்வு மற்றும் மக்கள் சேவை." },
    isPositive: true
  },
  {
    id: "Y32",
    combination: [1, 2],
    name: { kn: "ಭಾವನಾತ್ಮಕ ಸಂವೇದನಾ ಯೋಗ (Sensitive Relations 1-2)", en: "Sensitive Relations & Moods (1-2)", hi: "संवेदनशील संबंध योग (1-2)", te: "భావోద్వేగ సంబంధాల యోగం (1-2)", ta: "உணர்ச்சிவசப்படும் யோகம் (1-2)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಭಾವನಾತ್ಮಕ ಸೂಕ್ಷ್ಮತೆ, ತಕ್ಷಣದ ಮುನಿಸು ಹಾಗೂ ಸಂಬಂಧಗಳಲ್ಲಿ ತಾಳ್ಮೆಯ ಅಗತ್ಯ.", en: "Prone to intense emotional sensitivity, mood swings, and vulnerability in relationships.", hi: "अत्यधिक भावुकता, मनोदशा में उतार-चढ़ाव एवं संबंधों में धैर्य की आवश्यकता।", te: "అధిక సున్నితత్వం మరియు సంబంధాలలో ఓర్పు అవసరం.", ta: "உணர்ச்சி மேலிடுதல் மற்றும் உறவுகளில் பொறுமை தேவை." },
    isPositive: false
  },
  {
    id: "Y33",
    combination: [9, 8],
    name: { kn: "ಶ್ರಮ ಮನ್ನಣೆ ಕೊರತೆ ಯೋಗ (Credit Loss 9-8)", en: "Credit Loss in Hardwork (9-8)", hi: "श्रम श्रेय हानि योग (9-8)", te: "శ్రమకు గుర్తింపు లోప యోగం (9-8)", ta: "உழைப்புக்கு பலனின்மை யோகம் (9-8)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ನಿಷ್ಠಾವಂತ ದುಡಿಮೆಗಾರ; ಆದರೆ ಮಾಡಿದ ಕೆಲಸದ ಶ್ರೇಯಸ್ಸು ಇತರರ ಪಾಲಾಗುವ ಸಾಧ್ಯತೆ.", en: "Dedicated, hardworking native, but professional credit is frequently claimed by others.", hi: "अत्यंत परिश्रमी, परंतु किए गए कार्यों का श्रेय दूसरों को मिलने की संभावना।", te: "కష్టపడి పనిచేసే గుణం; అయితే క్రెడిట్ ఇతరులు పొందే అవకాశం.", ta: "கடும் உழைப்பு; ஆனால் புகழ் பிறருக்கு செல்லும் சூழல்." },
    isPositive: false
  },
  {
    id: "Y34",
    combination: [6, 9],
    name: { kn: "ವಿವಾಹ ವಿಳಂಬ ಅಥವಾ ಆಕರ್ಷಣಾ ಯೋಗ (Delayed Relational / High Charm 6-9)", en: "Delayed Relational / Intense Charm (6-9)", hi: "संबंध विलंब / तीव्र आकर्षण योग (6-9)", te: "సంబంధ ఆలస్య యోగం (6-9)", ta: "திருமண தாமத யோகம் (6-9)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ತೀವ್ರ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ; ಆದರೆ ವಿವಾಹದಲ್ಲಿ ವಿಳಂಬ ಅಥವಾ ಸಂಬಂಧಗಳಲ್ಲಿ ಸ್ಥಿರತೆಯ ಕೊರತೆ.", en: "Magnetic attraction; requires patience for marital stability and emotional grounding.", hi: "आकर्षक व्यक्तित्व; परंतु वैवाहिक स्थिरता में विलंब या संबंधों में उतार-चढ़ाव।", te: "ఆకర్షణీయమైన వ్యక్తిత్వం; అయితే వివాహంలో కొంత ఆలస్యం.", ta: "கவர்ச்சிகரமான ஆளுமை; திருமணத்தில் நிதானம் தேவை." },
    isPositive: false
  },
  {
    id: "Y35",
    combination: [3, 8],
    name: { kn: "ಗೂಢಶಾಸ್ತ್ರ ಆಪ್ತಸಲಹಾ ಯೋಗ (Occult Advisory 3-8)", en: "Occult Advisory & Counseling (3-8)", hi: "गूढ़ विद्या परामर्श योग (3-8)", te: "నిగూఢ శాస్త్ర సలహా యోగం (3-8)", ta: "மறைபொருள் ஆலோசனை யோகம் (3-8)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಉತ್ತಮ ಆಪ್ತಸಲಹೆಗಾರ, ಜ್ಯೋತಿಷ್ಯ/ಗೂಢಶಾಸ್ತ್ರದಲ್ಲಿ ಅಪಾರ ಆಸಕ್ತಿ ಹಾಗೂ ಸ್ವಯಾರ್ಜಿತ ಸಿದ್ಧಿ.", en: "Excellent counselor; deep interest in astrology/esoteric sciences with hard-earned success.", hi: "उत्कृष्ट परामर्शदाता; ज्योतिष व गूढ़ विज्ञान में गहरी रुचि एवं अर्जित सफलता।", te: "మంచి కౌన్సెలర్; జ్యోతిష్యం మరియు నిగూఢ శాస్త్రాలలో ప్రావీణ్యం.", ta: "சிறந்த ஆலோசகர்; ஜோதிடம் மற்றும் ஆன்மீகத்தில் ஈடுபாடு." },
    isPositive: true
  },
  {
    id: "Y36",
    combination: [1, 4],
    name: { kn: "ವ್ಯಯ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತ ವ್ಯತ್ಯಾಸ ಯೋಗ (Disruption & Wastage 1-4)", en: "Disruption & Wastage (1-4)", hi: "अस्थिरता एवं व्यय योग (1-4)", te: "వ్యయ & అస్థిరత యోగం (1-4)", ta: "வீண் விரய யோகம் (1-4)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಕುಟುಂಬದೊಂದಿಗೆ ಭಿನ್ನಾಭಿಪ್ರಾಯ, ವೃತ್ತಿ ಅಸ್ಥಿರತೆ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತ ದುಂದುವೆಚ್ಚಗಳ ಎಚ್ಚರಿಕೆ.", en: "Intermittent family tension, professional instability, and need for strict expense control.", hi: "पारिवारिक मतभेद, कार्यक्षेत्र में अस्थिरता एवं व्यर्थ व्यय पर नियंत्रण आवश्यक।", te: "కుటుంబంలో మనస్పర్థలు మరియు వృథా ఖర్చుల నియంత్రణ అవసరం.", ta: "குடும்பத்தில் கருத்து வேறுபாடு மற்றும் வீண் செலவு கட்டுப்பாடு." },
    isPositive: false
  },
  {
    id: "Y37",
    combination: [2, 5],
    name: { kn: "ಆಧ್ಯಾತ್ಮಿಕ ಸಂವೇದನಾ ಯೋಗ (Sensitive Spiritual 2-5)", en: "Sensitive Spiritual & Intuitive (2-5)", hi: "संवेदनशील आध्यात्मिक योग (2-5)", te: "సున్నిత ఆధ్యాత్మిక యోగం (2-5)", ta: "உணர்ச்சிமிக்க ஆன்மீக யோகம் (2-5)" },
    planeOrType: "dual_vibration",
    manifestation: { kn: "ಹೆಚ್ಚಿನ ಭಾವನಾತ್ಮಕ ಸೂಕ್ಷ್ಮತೆ, ಆಧ್ಯಾತ್ಮಿಕ ಜಿಜ್ಞಾಸೆ ಹಾಗೂ ಮಾನಸಿಕ ಶಾಂತಿಯ ಅಗತ್ಯ.", en: "High emotional sensitivity, spiritual inquisitiveness, and seeking inner tranquility.", hi: "उच्च भावनात्मक संवेदनशीलता, आध्यात्मिक जिज्ञासा एवं आत्मिक शांति की खोज।", te: "అధిక సున్నితత్వం మరియు ఆధ్యాత్మిక ప్రశాంతత కోసం అన్వేషణ.", ta: "உயர் உணர்ச்சி நுட்பம் மற்றும் ஆன்மீக அமைதி தேடுதல்." },
    isPositive: true
  }
];

/**
 * Parse all active Yogas from the 3x3 Vedic Grid Matrix
 */
export function parseActiveVedicYogas(grid: VedicGridMatrix): {
  activeYogas: Array<VedicYogaDef & { counts: Record<number, number> }>;
  positiveYogasCount: number;
  challengingYogasCount: number;
} {
  const activeYogas: Array<VedicYogaDef & { counts: Record<number, number> }> = [];
  let positiveCount = 0;
  let challengingCount = 0;

  for (const yoga of VEDIC_37_YOGAS_DATABASE) {
    // Check if ALL required digits are present (count > 0)
    const isPresent = yoga.combination.every((num) => grid.cells[num]?.count > 0);
    if (isPresent) {
      const counts: Record<number, number> = {};
      for (const num of yoga.combination) {
        counts[num] = grid.cells[num]?.count || 0;
      }
      activeYogas.push({
        ...yoga,
        counts
      });
      if (yoga.isPositive) positiveCount++;
      else challengingCount++;
    }
  }

  return {
    activeYogas,
    positiveYogasCount: positiveCount,
    challengingYogasCount: challengingCount
  };
}

// ----------------------------------------------------------------------
// 5. MISSING NUMBER REMEDIATION MATRIX
// ----------------------------------------------------------------------

export interface MissingNumberRemedy {
  number: number;
  planet: PlanetMeta;
  remedyActions: Record<string, string>;
  lifestyleAdjustment: Record<string, string>;
  sacredSymbolOrItem: Record<string, string>;
  mantra: string;
}

export const MISSING_REMEDIATION_MAP: Record<number, MissingNumberRemedy> = {
  1: {
    number: 1,
    planet: NAVAGRAHA_META[1],
    remedyActions: {
      kn: "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯದ ಸಮಯದಲ್ಲಿ ೧೫ ನಿಮಿಷಗಳ ಬಿಸಿಲಿನಲ್ಲಿ ನಿಂತು ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡಿ. ತಂದೆ ಅಥವಾ ಗುರುಹಿರಿಯರಿಗೆ ಗೌರವ ಸಲ್ಲಿಸಿ.",
      en: "Morning sunlight exposure at sunrise for 15 minutes; practice direct, confident speech and respect paternal figures.",
      hi: "प्रतिदिन सूर्योदय के समय सूर्य नमस्कार करें एवं पिता व गुरुजनों का सम्मान करें।",
      te: "రోజూ సూర్యోదయం వేళ సూర్య నమస్కారాలు చేయండి.",
      ta: "தினமும் சூரிய நமஸ்காரம் மற்றும் தந்தையை வணங்குதல்."
    },
    lifestyleAdjustment: {
      kn: "ನೇರವಾದ, ಸ್ಪಷ್ಟವಾದ ಸಂಭಾಷಣೆ ರೂಢಿಸಿಕೊಳ್ಳಿ; ಹಿಂಜರಿಕೆಯನ್ನು ತ್ಯಜಿಸಿ ನಾಯಕತ್ವ ವಹಿಸಿ.",
      en: "Cultivate direct and transparent communication; overcome self-doubt.",
      hi: "स्पष्ट संवाद अपनाएं और संकोच त्यागें।",
      te: "స్పష్టమైన సంభాషణను అలవర్చుకోండి.",
      ta: "தெளிவான மற்றும் தைரியமான பேச்சு."
    },
    sacredSymbolOrItem: {
      kn: "ಸೂರ್ಯಕಾಂತ ಶಿಲೆ (Sunstone) ಧರಿಸುವುದು ಅಥವಾ ಮನೆಯ ಪೂರ್ವ ಭಾಗದಲ್ಲಿ ಸೂರ್ಯ ಯಂತ್ರ ಸ್ಥಾಪನೆ.",
      en: "Sunstone crystal or placing a Copper Surya Yantra in the East.",
      hi: "सूर्यकांत मणि अथवा तांबे का सूर्य यंत्र।",
      te: "సూర్యకాంత రత్నం లేదా రాగి సూర్య యంత్రం.",
      ta: "சூரியகாந்த மணி அல்லது தாமிர சூரிய யந்திரம்."
    },
    mantra: "ಓಂ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ (Om Hram Hreem Hroum Sah Suryaya Namah)"
  },
  2: {
    number: 2,
    planet: NAVAGRAHA_META[2],
    remedyActions: {
      kn: "ಬೆಳ್ಳಿ ಲೋಟದಲ್ಲಿ ನೀರು ಕುಡಿಯುವುದು, ತಾಯಿಯ ಆಶೀರ್ವಾದ ಪಡೆಯುವುದು ಹಾಗೂ ಮನಃಶಾಂತಿಗಾಗಿ ಕೃತಜ್ಞತಾ ದಿನಚರಿ ಬರೆಯುವುದು.",
      en: "Drink water from a pure silver vessel, seek mother's blessings, and maintain a gratitude journal.",
      hi: "चांदी के पात्र से जल पिएं, माता का आशीर्वाद लें एवं कृतज्ञता डायरी लिखें।",
      te: "వెండి పాత్రలో నీరు త్రాగండి మరియు తల్లి ఆశీస్సులు తీసుకోండి.",
      ta: "வெள்ளி டம்ளரில் தண்ணீர் குடித்தல் மற்றும் தாயின் ஆசி."
    },
    lifestyleAdjustment: {
      kn: "ಮನಸ್ಸಿನ ಭಾವನೆಗಳನ್ನು ನಿಗ್ರಹಿಸದೆ ಶಾಂತಚಿತ್ತವಾಗಿ ವ್ಯಕ್ತಪಡಿಸಿ; ಧ್ಯಾನ ರೂಢಿಸಿಕೊಳ್ಳಿ.",
      en: "Express emotions mindfully; practice daily calming meditation.",
      hi: "भावनाओं को शांत चित्त से व्यक्त करें और ध्यान लगाएं।",
      te: "ప్రశాంతంగా ధ్యానం చేయండి.",
      ta: "சாந்தமாக தியானம் பழகுங்கள்."
    },
    sacredSymbolOrItem: {
      kn: "ಬೆಳ್ಳಿಯ ಉಂಗುರ ಅಥವಾ ನೈಸರ್ಗಿಕ ಮುತ್ತು ಧರಿಸುವುದು.",
      en: "Pure silver ring on little finger or natural pearl pendant.",
      hi: "चांदी का छल्ला अथवा प्राकृतिक मोती।",
      te: "వెండి ఉంగరం లేదా ముత్యం.",
      ta: "வெள்ளி மோதிரம் அல்லது முத்து."
    },
    mantra: "ಓಂ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಾಯ ನಮಃ (Om Shram Shreem Shroum Sah Chandraya Namah)"
  },
  3: {
    number: 3,
    planet: NAVAGRAHA_META[3],
    remedyActions: {
      kn: "ಗುರುಹಿರಿಯರು, ಪಂಡಿತರು ಹಾಗೂ ಶಿಕ್ಷಕರಿಗೆ ವಿನಮ್ರ ಗೌರವ ಸಲ್ಲಿಸಿ. ಹಳದಿ ಬಟ್ಟೆ ಅಥವಾ ಕೇಸರಿ ತಿಲಕ ಧರಿಸಿ.",
      en: "Seek structured mentorship, show active respect to teachers, and wear yellow/saffron on Thursdays.",
      hi: "गुरुजनों व शिक्षकों का सम्मान करें तथा गुरुवार को पीला वस्त्र या तिलक धारण करें।",
      te: "గురువులను గౌరవించండి మరియు పసుపు వస్త్రాలు ధరించండి.",
      ta: "குருவை வணங்குதல் மற்றும் மஞ்சள் ஆடை அணிதல்."
    },
    lifestyleAdjustment: {
      kn: "ಸತತ ಜ್ಞಾನಾರ್ಜನೆ, ಪುಸ್ತಕ ಓದುವುದು ಹಾಗೂ ಸದಾಚಾರ ಮಾರ್ಗ ಅನುಸರಿಸುವುದು.",
      en: "Pursue lifelong structured learning, read spiritual books, and uphold ethics.",
      hi: "सद्ग्रंथों का पठन एवं नैतिक मूल्यों का पालन।",
      te: "నిరంతర జ్ఞానార్జన మరియు ధర్మ మార్గం.",
      ta: "தொடர் கல்வி மற்றும் நேர்மை வழி."
    },
    sacredSymbolOrItem: {
      kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಅಥವಾ ಗಣಪತಿ ಪೂಜೆ, ಪುಷ್ಯರಾಗ ರತ್ನ ಅಥವಾ ತುಳಸಿ ಮಾಲೆ.",
      en: "Yellow Sapphire / Citrine or worshipping Lord Guru Raghavendra.",
      hi: "पुखराज, सुनहला अथवा तुलसी माला।",
      te: "పుష్యరాగం లేదా తులసి మాల.",
      ta: "புஷ்பராகம் அல்லது துளசி மாலை."
    },
    mantra: "ಓಂ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ (Om Gram Greem Groum Sah Gurave Namah)"
  },
  4: {
    number: 4,
    planet: NAVAGRAHA_META[4],
    remedyActions: {
      kn: "ದೈನಂದಿನ ಕೆಲಸಗಳನ್ನು ಲಿಖಿತವಾಗಿ ಪಟ್ಟಿ (To-Do List) ಮಾಡಿ ಶಿಸ್ತಿನಿಂದ ಪಾಲಿಸಿ. ಹಸಿರು ಬಣ್ಣದ ಅಂಶಗಳನ್ನು ಜೊತೆಯಲ್ಲಿಡಿ.",
      en: "Keep structured written to-do lists, maintain disciplined routines, and incorporate green elements/stone.",
      hi: "लिखित दैनिक कार्य सूची बनाएं एवं नियमित दिनचर्या का पालन करें।",
      te: "రోజువారీ పనులను రాసుకుని క్రమశిక్షణతో పూర్తి చేయండి.",
      ta: "தினசரி பணிகளை எழுதி வைத்து ஒழுங்குடன் செய்தல்."
    },
    lifestyleAdjustment: {
      kn: "ಆಕಸ್ಮಿಕ ಬದಲಾವಣೆಗಳಿಗೆ ಗೊಂದಲಕ್ಕೊಳಗಾಗದೆ ದೀರ್ಘಕಾಲೀನ ಯೋಜನೆಗಳನ್ನು ರೂಪಿಸಿ.",
      en: "Avoid impulsive decisions; establish structured blueprints for all goals.",
      hi: "जल्दबाजी के निर्णयों से बचें और ठोस योजना बनाएं।",
      te: "ఆతురత తగ్గించుకుని స్పష్టమైన ప్లాన్ వేసుకోండి.",
      ta: "பதற்றமின்றி திட்டமிட்டு செயல்படுதல்."
    },
    sacredSymbolOrItem: {
      kn: "ಶ್ರೀ ದುರ್ಗಾ ಸ್ತೋತ್ರ ಪಠಣ ಅಥವಾ ಗೋಮೇಧಿಕ ರತ್ನ.",
      en: "Gomed / Hessonite or recitation of Sri Durga Kavacham.",
      hi: "गोमेद रत्न अथवा श्री दुर्गा कवच।",
      te: "గోమేధిక రత్నం లేదా దుర్గా స్తోత్రం.",
      ta: "கோமேதகம் அல்லது துர்க்கை வழிபாடு."
    },
    mantra: "ಓಂ ಭ್ರಾಂ ಭ್ರೀಂ ಭ್ರೌಂ ಸಃ ರಾಹವೇ ನಮಃ (Om Bhram Bhreem Bhroum Sah Rahave Namah)"
  },
  5: {
    number: 5,
    planet: NAVAGRAHA_META[5],
    remedyActions: {
      kn: "ಹಸಿರು ಗಿಡಮರಗಳಿರುವ ನಿಸರ್ಗದಲ್ಲಿ ಸಮಯ ಕಳೆಯಿರಿ. ಮನೆಯ ಮಧ್ಯಭಾಗದಲ್ಲಿ (ಬ್ರಹ್ಮಸ್ಥಾನ) ಹಳದಿ ಬೆಳಕು ಅಥವಾ ಸ್ಫಟಿಕದ ಚೆಂಡು ಇರಿಸಿ.",
      en: "Spend time in green natural spaces; place a central yellow light or crystal sphere in living area.",
      hi: "हरियाली में समय बिताएं एवं घर के मध्य भाग में स्वच्छ प्रकाश रखें।",
      te: "పచ్చని ప్రకృతిలో గడపండి మరియు ఇంటి మధ్యలో వెలుతురు ఉండేలా చూసుకోండి.",
      ta: "இயற்கை சூழலில் நேரம் செலவிடுதல் மற்றும் படிக உருண்டை."
    },
    lifestyleAdjustment: {
      kn: "ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ, ವ್ಯವಹಾರದಲ್ಲಿ ಮುಕ್ತ ಸಂವಹನ ನಡೆಸಿ.",
      en: "Practice clear business calculations and dynamic adaptability.",
      hi: "व्यावसायिक संतुलन एवं संवाद कौशल निखारें।",
      te: "వ్యాపార లెక్కల్లో స్పష్టత ఉంచండి.",
      ta: "வணிகத்தில் தெளிவான கணக்கு வழக்கு."
    },
    sacredSymbolOrItem: {
      kn: "ಬುಧ ಯಂತ್ರ ಅಥವಾ ಪಚ್ಚೆ ರತ್ನ (Emerald).",
      en: "Budha Yantra, Emerald, or Green Jade.",
      hi: "बुध यंत्र अथवा पन्ना रत्न।",
      te: "బుధ యంత్రం లేదా పచ్చ రత్నం.",
      ta: "புதன் யந்திரம் அல்லது மரகதம்."
    },
    mantra: "ಓಂ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ (Om Bram Breem Broum Sah Budhaya Namah)"
  },
  6: {
    number: 6,
    planet: NAVAGRAHA_META[6],
    remedyActions: {
      kn: "ಮನೆಯ ವಾಯವ್ಯ/ಪಶ್ಚಿಮದಲ್ಲಿ ೬-ಸರಳುಗಳ ಬಂಗಾರದ ವಿಂಡ್‌ಚೈಮ್ (Windchime) ತೂಗುಹಾಕಿ. ಲೋಹದ ವಾಚ್ ಧರಿಸಿ.",
      en: "Hang a 6-rod golden metal windchime; wear a metallic luxury watch and organize personal living spaces.",
      hi: "घर में 6-रॉड का सुनहरा विंडचाइम लगाएं एवं कलाई में धातु की घड़ी पहनें।",
      te: "6-రాడ్ల గోల్డెన్ విండ్‌చైమ్ వేలాడదీయండి మరియు మెటల్ వాచ్ ధరించండి.",
      ta: "6 கம்பிகள் கொண்ட தங்க நிற விண்சீம் மற்றும் உலோக கடிகாரம்."
    },
    lifestyleAdjustment: {
      kn: "ಶುಚಿತ್ವ, ಸುವಾಸನೆ ಹಾಗೂ ಸೌಂದರ್ಯಯುತ ಪರಿಸರದಲ್ಲಿ ಜೀವಿಸಿ; ಮಹಿಳೆಯರನ್ನು ಗೌರವಿಸಿ.",
      en: "Maintain exquisite hygiene, aromatic cleanliness, and honor women.",
      hi: "स्वच्छता, सुगंध एवं सुरुचिपूर्ण वातावरण बनाए रखें।",
      te: "పరిశుభ్రత మరియు ప్రశాంత వాతావరణం పాటించండి.",
      ta: "சுத்தம், நறுமணம் மற்றும் பெண்களை மதித்தல்."
    },
    sacredSymbolOrItem: {
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಕವಚ, ವಜ್ರ ಅಥವಾ ಬಿಳಿ ಜಿರ್ಕಾನ್.",
      en: "Diamond, White Sapphire, or Sri Mahalakshmi Ashtakam.",
      hi: "हीरा, सफेद पुखराज अथवा श्री महालक्ष्मी स्तोत्र।",
      te: "వజ్రం లేదా శ్రీ లక్ష్మీ స్తోత్రం.",
      ta: "வைரம் அல்லது ஸ்ரீ மகாலக்ஷ்மி அஷ்டகம்."
    },
    mantra: "ಓಂ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ (Om Dram Dreem Droum Sah Shukraya Namah)"
  },
  7: {
    number: 7,
    planet: NAVAGRAHA_META[7],
    remedyActions: {
      kn: "೭-ಸರಳುಗಳ ಬೆಳ್ಳಿಯ ವಿಂಡ್‌ಚೈಮ್ ಬಳಸಿ. ನಿತ್ಯವೂ ೧೫ ನಿಮಿಷಗಳ ಮೌನ ಧ್ಯಾನ ಮಾಡಿ ಹಾಗೂ ಬೆಳ್ಳಿಯ ವಾಚ್ ಧರಿಸಿ.",
      en: "Hang a 7-rod silver windchime; practice 15-minute daily silent meditation and wear silver accessories.",
      hi: "7-रॉड का चांदी का विंडचाइम लगाएं एवं मौन ध्यान का अभ्यास करें।",
      te: "7-రాడ్ల వెండి విండ్‌చైమ్ వాడండి మరియు రోజువారీ మౌన ధ్యానం చేయండి.",
      ta: "7 கம்பிகள் கொண்ட வெள்ளி விண்சீம் மற்றும் மௌன தியானம்."
    },
    lifestyleAdjustment: {
      kn: "ಆಳವಾದ ಆತ್ಮಾವಲೋಕನ ಹಾಗೂ ನಿಸ್ವಾರ್ಥ ಚಿಂತನೆ ಬೆಳೆಸಿಕೊಳ್ಳಿ.",
      en: "Deepen analytical research and mental grounding through meditation.",
      hi: "आत्ममंथन एवं एकाग्रता का विकास करें।",
      te: "ఆత్మపరిశీలన అలవర్చుకోండి.",
      ta: "ஆழ்ந்த சுயபரிசீலனை மற்றும் தியானம்."
    },
    sacredSymbolOrItem: {
      kn: "ಶ್ರೀ ಗಣಪತಿ ಆರಾಧನೆ, ಬೆಳ್ಳಿ ಬಳೆ ಅಥವಾ ವೈಡೂರ್ಯ (Cat's Eye).",
      en: "Cat's Eye (Vaidurya) or worshipping Lord Ganesha with Garika grass.",
      hi: "लहसुनिया रत्न अथवा भगवान गणेश की दूर्वा पूजा।",
      te: "వైడూర్యం లేదా శ్రీ గణపతి పూజ.",
      ta: "வைடூரியம் அல்லது விநாயகர் பூஜை."
    },
    mantra: "ಓಂ ಸ್ರಾಂ ಸ್ರೀಂ ಸ್ರೌಂ ಸಃ ಕೇತವೇ ನಮಃ (Om Sram Sreem Sroum Sah Ketave Namah)"
  },
  8: {
    number: 8,
    planet: NAVAGRAHA_META[8],
    remedyActions: {
      kn: "ದೈನಂದಿನ ಕಾಯಕಜೀವಿಗಳು, ಕೂಲಿ ಕಾರ್ಮಿಕರು ಹಾಗೂ ಸೇವಕರಿಗೆ ಗೌರವಯುತವಾಗಿ ಸಹಾಯ ಮಾಡಿ. ಸಮಯ ಪರಿಪಾಲನೆಗೆ ಕಟ್ಟುನಿಟ್ಟಾಗಿರಿ.",
      en: "Support daily service workers/laborers respectfully; enforce strict time management and discipline.",
      hi: "श्रमिकों व असहायों की सहायता करें एवं कठोर समयपालन सुनिश्चित करें।",
      te: "శ్రామికులకు సహాయం చేయండి మరియు సమయపాలన పాటించండి.",
      ta: "உழைப்பாளிகளுக்கு உதவுதல் மற்றும் நேர மேலாண்மை."
    },
    lifestyleAdjustment: {
      kn: "ತಾಳ್ಮೆಯಿಂದ ನಿರಂತರ ಶ್ರಮವಹಿಸಿ; ಅಡ್ಡದಾರಿಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತ್ಯಜಿಸಿ.",
      en: "Embrace steady, patient perseverance; strictly avoid shortcuts.",
      hi: "धैर्यवान बनें और शॉर्टकट से बचें।",
      te: "సహనంతో ముందుకు సాగండి.",
      ta: "பொறுமையுடன் நேர்வழியில் உழைத்தல்."
    },
    sacredSymbolOrItem: {
      kn: "ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ, ಕಪ್ಪು ಎಳ್ಳು ದಾನ ಅಥವಾ ಅಮೆಥಿಸ್ಟ್ ಶಿಲೆ.",
      en: "Hanuman Chalisa, Blue Sapphire / Amethyst, or Iron Ring.",
      hi: "हनुमान चालीसा, नीलम अथवा लोहे का छल्ला।",
      te: "హనుమాన్ చాలీసా లేదా ఇనుప ఉంగరం.",
      ta: "ஹனுமான் சாலிசா அல்லது நீலக்கல்."
    },
    mantra: "ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ (Om Pram Preem Proum Sah Shanaishcharaya Namah)"
  },
  9: {
    number: 9,
    planet: NAVAGRAHA_META[9],
    remedyActions: {
      kn: "ನಿತ್ಯವೂ ಶಾರೀರಿಕ ವ್ಯಾಯಾಮ ಅಥವಾ ಯೋಗಾಸನ ಮಾಡಿ. ಧೈರ್ಯದಿಂದ ನೇರ ಹಾಗೂ ದಿಟ್ಟ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳಿ.",
      en: "Engage in regular physical exercise or martial yoga; take bold, decisive, action-oriented steps.",
      hi: "नियमित व्यायाम अथवा योगाभ्यास करें एवं साहसिक निर्णय लें।",
      te: "రోజూ వ్యాయామం చేయండి మరియు ధైర్యంగా నిర్ణయాలు తీసుకోండి.",
      ta: "தினசரி உடற்பயிற்சி மற்றும் தைரியமான முடிவுகள்."
    },
    lifestyleAdjustment: {
      kn: "ಕೋಪ ಹಾಗೂ ಆವೇಶವನ್ನು ಸೃಜನಶೀಲ ಕಾರ್ಯಗಳಿಗೆ ಪರಿವರ್ತಿಸಿ.",
      en: "Channel anger or excess martial energy into constructive, heroic execution.",
      hi: "क्रोध को सकारात्मक ऊर्जा में बदलें।",
      te: "కోపాన్ని అదుపులో ఉంచుకుని నిర్మాణాత్మక పనులు చేయండి.",
      ta: "கோபத்தை கட்டுப்படுத்தி நற்பணியில் ஈடுபடுதல்."
    },
    sacredSymbolOrItem: {
      kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಆರಾಧನೆ, ಕೆಂಪು ಹವಳ (Coral) ಅಥವಾ ತಾಮ್ರದ ಪಾತ್ರೆ.",
      en: "Red Coral (Moonga), worshipping Lord Murugan, or Copper vessel.",
      hi: "मूंगा रत्न अथवा भगवान कार्तिकेय पूजा।",
      te: "పగడం లేదా శ్రీ సుబ్రహ్మణ్య స్వామి పూజ.",
      ta: "பவழம் அல்லது முருகப் பெருமான் வழிபாடு."
    },
    mantra: "ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ (Om Kram Kreem Kroum Sah Bhaumaya Namah)"
  }
};

// ----------------------------------------------------------------------
// 6. ASYMMETRIC GRAHA MAITRI COMPATIBILITY ENGINE
// ----------------------------------------------------------------------

export type FriendshipType = "mitra" | "sama" | "shatru";

export interface DirectionalGrahaScore {
  fromNum: number;
  toNum: number;
  score: number; // 100, 60, 20
  type: FriendshipType;
  label: Record<string, string>;
}

/**
 * Asymmetric Directional Planetary Friendship Table R(A -> B):
 * 1 (Sun): Friendly {1,2,3,5,9}=100, Neutral {4,7}=60, Enemy {6,8}=20
 * 2 (Moon): Friendly {1,2,3,5}=100, Neutral {4,7,8,9}=60, Enemy {6}=20
 * 3 (Jupiter): Friendly {1,2,3,7,9}=100, Neutral {5,8}=60, Enemy {4,6}=20
 * 4 (Rahu): Friendly {1,5,6,8}=100, Neutral {3}=60, Enemy {2,9}=20 (4-4 & 4-8 friction)
 * 5 (Mercury): Friendly {1,2,3,5,6,9}=100, Neutral {4,7,8}=60, Enemy None (Universal Adaptor)
 * 6 (Venus): Friendly {1,4,5,6,7}=100, Neutral {2,8,9}=60, Enemy {3}=20
 * 7 (Ketu): Friendly {1,3,4,5,6}=100, Neutral {8,9}=60, Enemy {2}=20
 * 8 (Saturn): Friendly {3,5,6,7}=100, Neutral {9}=60, Enemy {1,2,4,8}=20 (8-8 friction)
 * 9 (Mars): Friendly {1,3,5}=100, Neutral {6,7,8,9}=60, Enemy {2,4}=20
 */
export const ASYMMETRIC_GRAHA_MAITRI_MATRIX: Record<number, { friendly: number[]; neutral: number[]; enemy: number[] }> = {
  1: { friendly: [1, 2, 3, 5, 9], neutral: [4, 7], enemy: [6, 8] },
  2: { friendly: [1, 2, 3, 5], neutral: [4, 7, 8, 9], enemy: [6] },
  3: { friendly: [1, 2, 3, 7, 9], neutral: [5, 8], enemy: [4, 6] },
  4: { friendly: [1, 5, 6, 8], neutral: [3], enemy: [2, 9] },
  5: { friendly: [1, 2, 3, 5, 6, 9], neutral: [4, 7, 8], enemy: [] },
  6: { friendly: [1, 4, 5, 6, 7], neutral: [2, 8, 9], enemy: [3] },
  7: { friendly: [1, 3, 4, 5, 6], neutral: [8, 9], enemy: [2] },
  8: { friendly: [3, 5, 6, 7], neutral: [9], enemy: [1, 2, 4, 8] },
  9: { friendly: [1, 3, 5], neutral: [6, 7, 8, 9], enemy: [2, 4] }
};

export function lookupDirectionalGrahaScore(fromNum: number, toNum: number): DirectionalGrahaScore {
  const from = digitalRootR9(fromNum);
  const to = digitalRootR9(toNum);
  const def = ASYMMETRIC_GRAHA_MAITRI_MATRIX[from] || ASYMMETRIC_GRAHA_MAITRI_MATRIX[1];

  let score = 60;
  let type: FriendshipType = "sama";
  let label: Record<string, string> = {
    kn: "ಸಮ (Neutral / ೬೦ ಅಂಕ)",
    en: "Neutral (Sama - 60 pts)",
    hi: "सम (Neutral - 60 अंक)",
    te: "సమ (Neutral - 60 పాయింట్లు)",
    ta: "சமம் (Neutral - 60 புள்ளிகள்)"
  };

  if (def.friendly.includes(to)) {
    score = 100;
    type = "mitra";
    label = {
      kn: "ಮಿತ್ರ (Friendly - ೧೦೦ ಅಂಕ)",
      en: "Friendly (Mitra - 100 pts)",
      hi: "मित्र (Friendly - 100 अंक)",
      te: "మిత్ర (Friendly - 100 పాయింట్లు)",
      ta: "நட்பு (Friendly - 100 புள்ளிகள்)"
    };
  } else if (def.enemy.includes(to)) {
    score = 20;
    type = "shatru";
    label = {
      kn: "ಶತ್ರು (Enemy / Friction - ೨೦ ಅಂಕ)",
      en: "Enemy (Shatru / Friction - 20 pts)",
      hi: "शत्रु (Enemy / Friction - 20 अंक)",
      te: "శత్రు (Enemy / Friction - 20 పాయింట్లు)",
      ta: "பகை (Enemy / Friction - 20 புள்ளிகள்)"
    };
  }

  return { fromNum: from, toNum: to, score, type, label };
}

export function calculateVedicCompatibility(
  personA: { name: string; day: number; month: number; year: number },
  personB: { name: string; day: number; month: number; year: number }
): {
  moolankA: number;
  bhagyankA: number;
  moolankB: number;
  bhagyankB: number;
  scoreMoolankAB: DirectionalGrahaScore;
  scoreMoolankBA: DirectionalGrahaScore;
  avgMoolankScore: number;
  scoreBhagyankAB: DirectionalGrahaScore;
  scoreBhagyankBA: DirectionalGrahaScore;
  avgBhagyankScore: number;
  compatibilityIndex: number; // 0..100%
  verdictCategory: "high_harmony" | "moderate_harmony" | "challenging_friction";
  verdictLabel: Record<string, string>;
  analysisKn: string;
} {
  const mA = calculateMoolank(personA.day).moolank;
  const bA = calculateBhagyank(personA.day, personA.month, personA.year).bhagyank;
  const mB = calculateMoolank(personB.day).moolank;
  const bB = calculateBhagyank(personB.day, personB.month, personB.year).bhagyank;

  const scoreMoolankAB = lookupDirectionalGrahaScore(mA, mB);
  const scoreMoolankBA = lookupDirectionalGrahaScore(mB, mA);
  const avgMoolankScore = (scoreMoolankAB.score + scoreMoolankBA.score) / 2;

  const scoreBhagyankAB = lookupDirectionalGrahaScore(bA, bB);
  const scoreBhagyankBA = lookupDirectionalGrahaScore(bB, bA);
  const avgBhagyankScore = (scoreBhagyankAB.score + scoreBhagyankBA.score) / 2;

  // Weighted formula: CI = (Sm * 0.60) + (Sb * 0.40)
  const compatibilityIndex = Math.round((avgMoolankScore * 0.60 + avgBhagyankScore * 0.40) * 10) / 10;

  let verdictCategory: "high_harmony" | "moderate_harmony" | "challenging_friction" = "moderate_harmony";
  let verdictLabel: Record<string, string> = {
    kn: "🟡 ಮಧ್ಯಮ ಮೈತ್ರಿ / ಸಮತೋಲಿತ ಹೊಂದಾಣಿಕೆ (50% - 74%)",
    en: "🟡 Moderate Harmony / Neutral Match (50% - 74%)",
    hi: "🟡 मध्यम सामंजस्य / संतुलित मिलान (50% - 74%)",
    te: "🟡 మధ్యమ మైత్రి / సమతుల్య సరిపోలిక (50% - 74%)",
    ta: "🟡 மிதமான பொருத்தம் (50% - 74%)"
  };

  if (compatibilityIndex >= 75) {
    verdictCategory = "high_harmony";
    verdictLabel = {
      kn: "🟢 ಅತ್ಯುನ್ನತ ಸಾಮರಸ್ಯ & ದೈವಿಕ ಮೈತ್ರಿ (75% - 100%)",
      en: "🟢 High Harmony / Auspicious Match (75% - 100%)",
      hi: "🟢 उत्तम सामंजस्य एवं शुभ मिलान (75% - 100%)",
      te: "🟢 అత్యున్నత మైత్రి & శుభ సరిపోలిక (75% - 100%)",
      ta: "🟢 மிகுந்த பொருத்தம் & சுப சேர்க்கை (75% - 100%)"
    };
  } else if (compatibilityIndex < 50) {
    verdictCategory = "challenging_friction";
    verdictLabel = {
      kn: "🔴 ಸಂಘರ್ಷದ ಸಾಧ್ಯತೆ & ಪರಿಹಾರ ಅಗತ್ಯ (< 50%)",
      en: "🔴 Challenging / High Friction (< 50%)",
      hi: "🔴 संघर्ष की संभावना एवं उपाय आवश्यक (< 50%)",
      te: "🔴 సంఘర్షణ అవకాశం & పరిహారం అవసరం (< 50%)",
      ta: "🔴 கருத்து வேறுபாடு வாய்ப்பு (< 50%)"
    };
  }

  const analysisKn = `ವ್ಯಕ್ತಿ 'A' (${personA.name}) ಅವರ ಮೂಲಾಂಕ ${mA} (${NAVAGRAHA_META[mA].name.kn}) ಮತ್ತು ಭಾಗ್ಯಾಂಕ ${bA} (${NAVAGRAHA_META[bA].name.kn}). ವ್ಯಕ್ತಿ 'B' (${personB.name}) ಅವರ ಮೂಲಾಂಕ ${mB} (${NAVAGRAHA_META[mB].name.kn}) ಮತ್ತು ಭಾಗ್ಯಾಂಕ ${bB} (${NAVAGRAHA_META[bB].name.kn}). ಪರಸ್ಪರ ದಿಶಾತ್ಮಕ ಗ್ರಹ ಮೈತ್ರಿ ಸೂಚ್ಯಂಕವು ಶೇ. ${compatibilityIndex}% ಆಗಿದ್ದು, ಇದು ${verdictLabel.kn} ಗುಂಪಿಗೆ ಸೇರುತ್ತದೆ.`;

  return {
    moolankA: mA,
    bhagyankA: bA,
    moolankB: mB,
    bhagyankB: bB,
    scoreMoolankAB,
    scoreMoolankBA,
    avgMoolankScore,
    scoreBhagyankAB,
    scoreBhagyankBA,
    avgBhagyankScore,
    compatibilityIndex,
    verdictCategory,
    verdictLabel,
    analysisKn
  };
}

// ----------------------------------------------------------------------
// 7. NESTED TEMPORAL PREDICTIVE ENGINE (MD, AD, PD, DD, HD)
// ----------------------------------------------------------------------

export interface MahadashaSpan {
  grahaNumber: number;
  grahaMeta: PlanetMeta;
  startAge: number;
  endAge: number;
  durationYears: number;
  startDate: string;
  endDate: string;
}

export interface NestedDashaState {
  targetDate: Date;
  currentAge: number;
  activeMahadasha: {
    grahaNumber: number;
    grahaMeta: PlanetMeta;
    startAge: number;
    endAge: number;
    durationYears: number;
  };
  activeAntardasha: {
    grahaNumber: number;
    grahaMeta: PlanetMeta;
    formulaDetails: string;
  };
  activePratyantardasha: {
    grahaNumber: number;
    grahaMeta: PlanetMeta;
    subPeriodDays: number;
  };
  activeDailyDasha: {
    grahaNumber: number;
    grahaMeta: PlanetMeta;
  };
  activeHourlyDasha: {
    grahaNumber: number;
    grahaMeta: PlanetMeta;
  };
  multiplicityStatus: {
    isOverload: boolean;
    isSmoothPhase: boolean;
    overloadDigits: number[];
    smoothDigits: number[];
    isDoubleOneFame: boolean;
    isEvenEightOpportunity: boolean;
    isDestinyFourPower: boolean;
    isDestinySixLuxury: boolean;
    explanationKn: string;
    explanationEn: string;
  };
  mahadashaTimeline: MahadashaSpan[];
}

/**
 * Weekday Index Wv on birthday:
 * Sun = 1, Mon = 2, Tue = 9, Wed = 5, Thu = 3, Fri = 6, Sat = 8
 */
export const WEEKDAY_INDEX_MAP: Record<number, number> = {
  0: 1, // Sun -> 1
  1: 2, // Mon -> 2
  2: 9, // Tue -> 9
  3: 5, // Wed -> 5
  4: 3, // Thu -> 3
  5: 6, // Fri -> 6
  6: 8  // Sat -> 8
};

/**
 * Calculate Mahadasha 45-Year and 100-Year Timeline
 * Starts with Moolank planet M for M years, then progresses 1..9 sequentially.
 */
export function calculateMahadashaTimeline(
  day: number,
  month: number,
  fullYear: number,
  maxYears: number = 100
): MahadashaSpan[] {
  const moolank = calculateMoolank(day).moolank;
  const birthDate = new Date(fullYear, month - 1, day);

  const timeline: MahadashaSpan[] = [];
  let currentAge = 0;
  let currentGraha = moolank;

  while (currentAge < maxYears) {
    const duration = currentGraha;
    const startAge = currentAge;
    const endAge = currentAge + duration;

    const startDate = new Date(birthDate);
    startDate.setFullYear(startDate.getFullYear() + startAge);

    const endDate = new Date(birthDate);
    endDate.setFullYear(endDate.getFullYear() + endAge);

    timeline.push({
      grahaNumber: currentGraha,
      grahaMeta: NAVAGRAHA_META[currentGraha],
      startAge,
      endAge,
      durationYears: duration,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0]
    });

    currentAge = endAge;
    currentGraha = (currentGraha % 9) + 1;
  }

  return timeline;
}

/**
 * Calculate Annual Antardasha (AD) running birthday-to-birthday
 * Formula: AD = (R9(Dbirth) + R9(Mmonth) + R9(Ycurrent_YY) + Wv) mod 9 (if 0, map to 9)
 */
export function calculateAnnualAntardasha(
  birthDay: number,
  birthMonth: number,
  targetDate: Date
): {
  antardashaNumber: number;
  grahaMeta: PlanetMeta;
  formulaDetails: string;
} {
  const d = Math.max(1, Math.min(31, Math.floor(birthDay)));
  const m = Math.max(1, Math.min(12, Math.floor(birthMonth)));

  const targetYear = targetDate.getFullYear();
  // Target year's birthday date
  const birthdayThisYear = new Date(targetYear, m - 1, d);
  let effectiveYear = targetYear;
  // If targetDate is before this year's birthday, cycle started on previous year's birthday
  if (targetDate < birthdayThisYear) {
    effectiveYear = targetYear - 1;
  }

  const effectiveBirthday = new Date(effectiveYear, m - 1, d);
  const weekdayNum = effectiveBirthday.getDay(); // 0..6
  const wv = WEEKDAY_INDEX_MAP[weekdayNum] || 1;

  const r9D = digitalRootR9(d);
  const r9M = digitalRootR9(m);
  const yy = effectiveYear % 100;
  const r9YY = digitalRootR9(yy);

  const rawSum = r9D + r9M + r9YY + wv;
  let adNum = rawSum % 9;
  if (adNum === 0) adNum = 9;

  const formulaDetails = `Day(${r9D}) + Month(${r9M}) + Year(${yy}➔${r9YY}) + Weekday_Wv(${wv}) = ${rawSum} ➔ AD = ${adNum} (${NAVAGRAHA_META[adNum].sanskritName})`;

  return {
    antardashaNumber: adNum,
    grahaMeta: NAVAGRAHA_META[adNum],
    formulaDetails
  };
}

/**
 * Calculate Complete Nested Dasha State and Multiplicity Overload Analysis for a target date
 */
export function calculateNestedDashaState(
  day: number,
  month: number,
  fullYear: number,
  targetDate: Date = new Date(),
  grid?: VedicGridMatrix
): NestedDashaState {
  const birthDate = new Date(fullYear, month - 1, day);
  const diffMs = targetDate.getTime() - birthDate.getTime();
  const currentAge = Math.max(0, diffMs / (1000 * 60 * 60 * 24 * 365.25));

  // 1. Mahadasha
  const timeline = calculateMahadashaTimeline(day, month, fullYear, 100);
  const activeMD = timeline.find((span) => currentAge >= span.startAge && currentAge < span.endAge) || timeline[0];

  // 2. Antardasha (AD)
  const adResult = calculateAnnualAntardasha(day, month, targetDate);

  // 3. Pratyantardasha (PD) & Rule of 8 (Tp = Pnum * 8 days)
  const pdLord = adResult.antardashaNumber; // Sub-period lord sequence aligns with AD
  const subPeriodDays = pdLord * 8;

  // 4. Daily Dasha (DD): DD = R9(PD_lord + WD_lord)
  const targetDayWv = WEEKDAY_INDEX_MAP[targetDate.getDay()] || 1;
  const ddNum = digitalRootR9(pdLord + targetDayWv);

  // 5. Hourly Dasha (HD): HD = R9(DD + HL_lord)
  const currentHour = targetDate.getHours();
  const hourlyLord = (currentHour % 9) + 1;
  const hdNum = digitalRootR9(ddNum + hourlyLord);

  // 6. Multiplicity Overload vs Smooth Phase analysis against Vedic Grid
  const activeGrid = grid || generateVedicGridMatrix(day, month, fullYear);
  const mdNum = activeMD.grahaNumber;
  const adNum = adResult.antardashaNumber;
  const bhagyank = calculateBhagyank(day, month, fullYear).bhagyank;

  const overloadDigits: number[] = [];
  const smoothDigits: number[] = [];

  // Check MD digit
  if (activeGrid.cells[mdNum].count >= 2) {
    overloadDigits.push(mdNum);
  } else if (activeGrid.cells[mdNum].count === 0) {
    smoothDigits.push(mdNum);
  }

  // Check AD digit
  if (activeGrid.cells[adNum].count >= 2 && !overloadDigits.includes(adNum)) {
    overloadDigits.push(adNum);
  } else if (activeGrid.cells[adNum].count === 0 && !smoothDigits.includes(adNum)) {
    smoothDigits.push(adNum);
  }

  // Critical Exceptions
  const isDoubleOneFame = (mdNum === 1 || adNum === 1) && activeGrid.cells[1].count >= 1;
  const isEvenEightOpportunity = (mdNum === 8 || adNum === 8) && (activeGrid.cells[8].count === 1 || activeGrid.cells[8].count === 2);
  const isDestinyFourPower = bhagyank === 4 && (mdNum === 4 || adNum === 4);
  const isDestinySixLuxury = bhagyank === 6 && (mdNum === 6 || adNum === 6);

  let isOverload = overloadDigits.length > 0;
  let isSmoothPhase = smoothDigits.length > 0 && !isOverload;

  // If positive exception applies, soften or transform overload
  if (isDoubleOneFame || isEvenEightOpportunity || isDestinyFourPower || isDestinySixLuxury) {
    if (isOverload && !isDestinyFourPower && !isDestinySixLuxury) {
      // Keep alert but mark favorable exception
    }
  }

  let expKn = "";
  let expEn = "";

  if (isOverload) {
    expKn = `⚠️ ದಶಾ ಸಾಂದ್ರತೆಯ ಒತ್ತಡ (Multiplicity Overload): ಪ್ರಸ್ತುತ ಮಹಾದಶೆ ${NAVAGRAHA_META[mdNum].name.kn} (${mdNum}) ಹಾಗೂ ಅಂತರ್ದಶೆ ${NAVAGRAHA_META[adNum].name.kn} (${adNum}) ಅಂಕಿಗಳು ನಿಮ್ಮ ಜನ್ಮ ವೇದಿಕ ಗ್ರಿಡ್‌ನಲ್ಲಿ ಈಗಾಗಲೇ ${activeGrid.cells[mdNum].count + activeGrid.cells[adNum].count} ಬಾರಿ ಉಪಸ್ಥಿತವಾಗಿವೆ. ಈ ಗ್ರಹ ತರಂಗಗಳ ಅತಿಯಾದ ಸಾಂದ್ರತೆಯು ತಾತ್ಕಾಲಿಕ ಘರ್ಷಣೆ ಅಥವಾ ಮಾನಸಿಕ ಒತ್ತಡವನ್ನುಂಟುಮಾಡಬಹುದು. ಗ್ರಹ ಪರಿಹಾರಗಳನ್ನು ಪಾಲಿಸುವುದು ಸೂಕ್ತ.`;
    expEn = `⚠️ Multiplicity Overload Warning: Active Mahadasha (${NAVAGRAHA_META[mdNum].sanskritName} - ${mdNum}) and Antardasha (${NAVAGRAHA_META[adNum].sanskritName} - ${adNum}) introduce numbers already densely present in your birth grid. This creates planetary multiplicity pressure requiring balancing remedies.`;
  } else if (isSmoothPhase) {
    expKn = `🟢 ಸೌಮ್ಯತಾ & ಶುಭ ದಶಾ ಕಾಲ (Smooth Phase): ಪ್ರಸ್ತುತ ದಶೆಯು ನಿಮ್ಮ ಜನ್ಮ ಗ್ರಿಡ್‌ನಲ್ಲಿ ಅನುಪಸ್ಥಿತವಾಗಿದ್ದ ಗ್ರಹ ಶಕ್ತಿಗಳನ್ನು (${smoothDigits.map((d) => NAVAGRAHA_META[d].name.kn).join(", ")}) ಸಕ್ರಿಯಗೊಳಿಸುತ್ತಿದ್ದು, ಜೀವನದಲ್ಲಿ ಸಮತೋಲನ ಹಾಗೂ ಹೊಸ ಅವಕಾಶಗಳನ್ನು ತರಲಿದೆ.`;
    expEn = `🟢 Smooth Phase (Saumyata): Active Dasha introduces previously missing planetary numbers (${smoothDigits.map((d) => NAVAGRAHA_META[d].sanskritName).join(", ")}), restoring harmony and unlocking fresh growth avenues.`;
  } else {
    expKn = `🟡 ಸಮತೋಲಿತ ದಶಾ ಕಾಲ: ಪ್ರಸ್ತುತ ದಶೆಯು ಮಧ್ಯಮ ಹಾಗೂ ಸ್ಥಿರ ಫಲಗಳನ್ನು ನೀಡಲಿದೆ.`;
    expEn = `🟡 Balanced Dasha Period: The running cycle provides steady, progressive developments.`;
  }

  if (isDoubleOneFame) {
    expKn += ` (☀️ ಸೂರ್ಯ ದ್ವಿ-ಬಲ: ಅಧಿಕಾರ, ಕೀರ್ತಿ ಹಾಗೂ ಪ್ರಸಿದ್ಧಿ ವೃದ್ಧಿ).`;
    expEn += ` (☀️ Double 1 Exception: Boosts executive authority, prestige, and fame).`;
  }
  if (isEvenEightOpportunity) {
    expKn += ` (⚖️ ಸಮ-೮ ಶನಿ ಯೋಗ: ಸ್ಥಿರ ಆಸ್ತಿ ಹಾಗೂ ಬಲಿಷ್ಠ ವ್ಯವಹಾರಿಕ ಅವಕಾಶಗಳು).`;
    expEn += ` (⚖️ Even 8 Exception: Opens major material and property avenues).`;
  }
  if (isDestinyFourPower) {
    expKn += ` (🌀 ಭಾಗ್ಯಾಂಕ ೪ ರಾಹು ವಿಶೇಷ: ಅನಿರೀಕ್ಷಿತ ಧನ ಸಂಪತ್ತು ಹಾಗೂ ಅಧಿಕಾರದ ಉತ್ತುಂಗ).`;
    expEn += ` (🌀 Destiny 4 in Dasha 4 Exception: Massive surge in financial power and breakthroughs).`;
  }
  if (isDestinySixLuxury) {
    expKn += ` (🌟 ಭಾಗ್ಯಾಂಕ ೬ ಶುಕ್ರ ಯೋಗ: ದಾಂಪತ್ಯ ಸುಖ, ವಾಹನ ಹಾಗೂ ಐಶ್ವರ್ಯ ವೃದ್ಧಿ).`;
    expEn += ` (🌟 Destiny 6 in Dasha 6 Exception: Brings luxury assets without multiplicity friction).`;
  }

  return {
    targetDate,
    currentAge: Math.round(currentAge * 10) / 10,
    activeMahadasha: {
      grahaNumber: activeMD.grahaNumber,
      grahaMeta: activeMD.grahaMeta,
      startAge: activeMD.startAge,
      endAge: activeMD.endAge,
      durationYears: activeMD.durationYears
    },
    activeAntardasha: {
      grahaNumber: adResult.antardashaNumber,
      grahaMeta: adResult.grahaMeta,
      formulaDetails: adResult.formulaDetails
    },
    activePratyantardasha: {
      grahaNumber: pdLord,
      grahaMeta: NAVAGRAHA_META[pdLord],
      subPeriodDays
    },
    activeDailyDasha: {
      grahaNumber: ddNum,
      grahaMeta: NAVAGRAHA_META[ddNum]
    },
    activeHourlyDasha: {
      grahaNumber: hdNum,
      grahaMeta: NAVAGRAHA_META[hdNum]
    },
    multiplicityStatus: {
      isOverload,
      isSmoothPhase,
      overloadDigits,
      smoothDigits,
      isDoubleOneFame,
      isEvenEightOpportunity,
      isDestinyFourPower,
      isDestinySixLuxury,
      explanationKn: expKn,
      explanationEn: expEn
    },
    mahadashaTimeline: timeline
  };
}

// ----------------------------------------------------------------------
// 8. ADVANCED NAME CORRECTION & TARGET NUMBERS
// ----------------------------------------------------------------------

export const OPTIMAL_NAME_TARGETS_BY_DESTINY: Record<number, number[]> = {
  1: [1, 3, 5],
  2: [1, 3, 5, 6],
  3: [1, 3, 5],
  4: [1, 3, 5, 6],
  5: [1, 3, 5, 6],
  6: [1, 5, 6],
  7: [1, 3, 5, 6],
  8: [3, 5, 6],
  9: [1, 3, 5, 6]
};

export const PROHIBITED_NAME_TOTALS = new Set([2, 4, 8]);

// ----------------------------------------------------------------------
// 9. MOBILE & VEHICLE NUMEROLOGY ENGINES
// ----------------------------------------------------------------------

export function calculateMobileNumerology(phoneNumber: string): {
  cleanNumber: string;
  sumDigits: number;
  singleDigit: number;
  lastDigit: number;
  isFavorable: boolean;
  hasProhibitedEnding: boolean;
  verdictKn: string;
  verdictEn: string;
  rulingGraha: PlanetMeta;
} {
  const cleanNumber = (phoneNumber || "").replace(/[^0-9]/g, "");
  let sum = 0;
  for (const c of cleanNumber) {
    sum += parseInt(c, 10) || 0;
  }

  const single = digitalRootR9(sum);
  const lastDigit = cleanNumber.length > 0 ? parseInt(cleanNumber[cleanNumber.length - 1], 10) : 0;

  const isFavorable = [5, 6, 1].includes(single);
  const hasProhibitedEnding = [2, 4, 8].includes(lastDigit);

  let verdictKn = "";
  let verdictEn = "";

  if (isFavorable && !hasProhibitedEnding) {
    verdictKn = `🟢 ಅತ್ಯುನ್ನತ ಶುಭ ದೂರವಾಣಿ ಸಂಖ್ಯೆ (ಒಟ್ಟು ಮೊತ್ತ ${single} - ${NAVAGRAHA_META[single].name.kn}). ವ್ಯಾಪಾರ, ಗೌರವ ಹಾಗೂ ಸಂವಹನಕ್ಕೆ ಅತ್ಯುತ್ತಮ.`;
    verdictEn = `🟢 Auspicious Mobile Number (Sum ${single} - ${NAVAGRAHA_META[single].sanskritName}). Highly favorable for commerce, prestige, and active growth.`;
  } else if (hasProhibitedEnding) {
    verdictKn = `⚠️ ಎಚ್ಚರಿಕೆ: ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯ ಅಂತಿಮ ಅಂಕಿಯು ${lastDigit} ಆಗಿದೆ (೨, ೪ ಅಥವಾ ೮ ಕೊನೆಗೊಳ್ಳುವುದು ಅಡೆತಡೆ ಅಥವಾ ಆರ್ಥಿಕ ಅಸ್ಥಿರತೆಯನ್ನು ತರಬಹುದು).`;
    verdictEn = `⚠️ Caution: Number ends in prohibited digit ${lastDigit} (Ending in 2, 4, or 8 triggers volatility or delays).`;
  } else {
    verdictKn = `🟡 ಮಧ್ಯಮ ಸಂಖ್ಯೆ (ಒಟ್ಟು ಮೊತ್ತ ${single}). ಮೊತ್ತವನ್ನು ೫ (ಬುಧ), ೬ (ಶುಕ್ರ) ಅಥವಾ ೧ (ಸೂರ್ಯ) ಗೆ ತರುವುದು ಶ್ರೇಷ್ಠ.`;
    verdictEn = `🟡 Neutral Number (Sum ${single}). Adjusting total sum towards 5, 6, or 1 is recommended.`;
  }

  return {
    cleanNumber,
    sumDigits: sum,
    singleDigit: single,
    lastDigit,
    isFavorable,
    hasProhibitedEnding,
    verdictKn,
    verdictEn,
    rulingGraha: NAVAGRAHA_META[single] || NAVAGRAHA_META[1]
  };
}

export function calculateVehicleNumerology(
  plateString: string,
  ownerMoolank?: number,
  ownerBhagyank?: number
): {
  cleanDigits: string;
  sumDigits: number;
  singleDigit: number;
  hasFrictionWithMoolank: boolean;
  verdictKn: string;
  verdictEn: string;
  rulingGraha: PlanetMeta;
} {
  const rawStr = (plateString || "").trim();
  // Check if plate has distinct registration digits at end, e.g. "DL 01 AB 1234" -> "1234"
  const trailingMatch = rawStr.match(/(\d{3,4})$/);
  const cleanDigits = trailingMatch ? trailingMatch[1] : rawStr.replace(/[^0-9]/g, "");
  
  let sum = 0;
  for (const c of cleanDigits) {
    sum += parseInt(c, 10) || 0;
  }

  const single = digitalRootR9(sum || 1);
  const m = ownerMoolank ? digitalRootR9(ownerMoolank) : null;
  const b = ownerBhagyank ? digitalRootR9(ownerBhagyank) : null;

  // Friction Rule: Moolank 3 native must never select vehicle sum 6 (Jupiter vs Venus enmity)
  let hasFrictionWithMoolank = false;
  if ((m === 3 || b === 3) && single === 6) {
    hasFrictionWithMoolank = true;
  } else if ((m === 1 || b === 1) && (single === 8 || single === 6)) {
    hasFrictionWithMoolank = true;
  } else if ([4, 8].includes(single)) {
    hasFrictionWithMoolank = true;
  }

  let verdictKn = "";
  let verdictEn = "";

  if (!hasFrictionWithMoolank && [1, 3, 5, 9].includes(single)) {
    verdictKn = `🟢 ಅತ್ಯುನ್ನತ ಸುರಕ್ಷಿತ ವಾಹನ ಸಂಖ್ಯೆ (ಅಂಕಿಗಳ ಮೊತ್ತ ${single} - ${NAVAGRAHA_META[single].name.kn}). ಕ್ಷೇಮ ಪ್ರಯಾಣ, ಗೌರವ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ.`;
    verdictEn = `🟢 Auspicious Vehicle Number (Plate Sum ${single} - ${NAVAGRAHA_META[single].sanskritName}). Bestows travel protection, prestige, and durability.`;
  } else if (hasFrictionWithMoolank) {
    verdictKn = `⚠️ ವಾಹನ ಸಂಖ್ಯಾ ದೋಷ: ವಾಹನ ಮೊತ್ತ ${single} ಮತ್ತು ಮಾಲೀಕರ ಸಂಖ್ಯೆಗಳ ನಡುವೆ ಗ್ರಹ ವೈರತ್ವವಿದೆ (೪, ೮ ಹಾಗೂ ಗುರು-ಶುಕ್ರ ಮುಖಾಮುಖಿ ತ್ಯಜಿಸಿ).`;
    verdictEn = `⚠️ Vehicle Number Friction: Plate sum ${single} carries friction against owner energy (avoid 4, 8, and Jupiter-Venus friction).`;
  } else {
    verdictKn = `🟡 ಸಾಧಾರಣ ವಾಹನ ಸಂಖ್ಯೆ (ಮೊತ್ತ ${single}).`;
    verdictEn = `🟡 Neutral Vehicle Number (Sum ${single}).`;
  }

  return {
    cleanDigits,
    sumDigits: sum,
    singleDigit: single,
    hasFrictionWithMoolank,
    verdictKn,
    verdictEn,
    rulingGraha: NAVAGRAHA_META[single] || NAVAGRAHA_META[1]
  };
}

// ----------------------------------------------------------------------
// 10. COMPREHENSIVE JANMA VEDIC NUMEROLOGY PROFILE ENGINE
// ----------------------------------------------------------------------

export interface CompleteVedicNumerologyProfile {
  devoteeName: string;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  targetDate: Date;

  moolankInfo: ReturnType<typeof calculateMoolank>;
  bhagyankInfo: ReturnType<typeof calculateBhagyank>;
  nameInfo: ReturnType<typeof calculateNameNumerology>;

  gridMatrix: VedicGridMatrix;
  yogasResult: ReturnType<typeof parseActiveVedicYogas>;
  nestedDasha: NestedDashaState;
  missingRemedies: MissingNumberRemedy[];

  optimalNameTargets: number[];
  generatedAt: string;
}

export function buildCompleteVedicNumerologyProfile(
  devoteeName: string,
  birthDay: number,
  birthMonth: number,
  birthYear: number,
  targetDate: Date = new Date()
): CompleteVedicNumerologyProfile {
  const moolankInfo = calculateMoolank(birthDay);
  const bhagyankInfo = calculateBhagyank(birthDay, birthMonth, birthYear);
  const nameInfo = calculateNameNumerology(devoteeName);

  const gridMatrix = generateVedicGridMatrix(birthDay, birthMonth, birthYear);
  const yogasResult = parseActiveVedicYogas(gridMatrix);
  const nestedDasha = calculateNestedDashaState(birthDay, birthMonth, birthYear, targetDate, gridMatrix);

  const missingRemedies = gridMatrix.missingNumbers.map((num) => MISSING_REMEDIATION_MAP[num]).filter(Boolean);
  const optimalNameTargets = OPTIMAL_NAME_TARGETS_BY_DESTINY[bhagyankInfo.bhagyank] || [1, 3, 5, 6];

  return {
    devoteeName: devoteeName.trim() || "ಶ್ರೀಯುತ ಭಕ್ತರು",
    birthDay,
    birthMonth,
    birthYear,
    targetDate,
    moolankInfo,
    bhagyankInfo,
    nameInfo,
    gridMatrix,
    yogasResult,
    nestedDasha,
    missingRemedies,
    optimalNameTargets,
    generatedAt: new Date().toISOString()
  };
}
