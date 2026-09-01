/**
 * 365-Day Vedic Daily Inspiration, Shloka & Good Karma Almanac Database
 * (ಬಗ್ಗೋಣ ಪಂಚಾಂಗ - ೩೬೫ ದಿನಗಳ ನಿತ್ಯ ಶುಭೋದಯ ಸಂದೇಶ, ಶ್ಲೋಕ & ಸತ್ಕಾರ್ಯ ಸಂಕಲ್ಪ)
 * 
 * Provides deterministic, rich daily inspiration for all 365/366 days of the year:
 * 1. Good Morning Positive Vibration (ಶುಭೋದಯ ಸಂದೇಶ)
 * 2. Daily Vedic Shloka with Meaning (ಇಂದಿನ ದೈವಿಕ ಶ್ಲೋಕ & ಭಾವಾರ್ಥ)
 * 3. Daily Good Karma Deed (ಇಂದಿನ ಪುಣ್ಯ ಕಾರ್ಯ / ಸತ್ಕಾರ್ಯ)
 * 4. Life Elevation & Motivational Quote (ದಿನದ ಸ್ಫೂರ್ತಿದಾಯಕ ಚಿಂತನೆ)
 * 5. Sacred Theme & Color Palette
 * 
 * Fully localized in Kannada (kn), English (en), Hindi (hi), Telugu (te), and Tamil (ta).
 */

export type SupportedLang = "kn" | "en" | "hi" | "te" | "ta";

export interface DailyInspirationData {
  dayOfYear: number;
  monthDay: string; // "MM-DD"
  deitySource: string;
  theme: {
    name: string;
    bgGradient: string;
    accentColor: string;
    borderGold: string;
    textColor: string;
    icon: string;
  };
  goodMorningVibe: Record<SupportedLang, string>;
  shlokaText: {
    kn: string;
    sa: string;
    transliteration: string;
  };
  shlokaMeaning: Record<SupportedLang, string>;
  goodDeedOfTheDay: Record<SupportedLang, string>;
  motivationalQuote: Record<SupportedLang, string>;
}

// 24 Curated Sacred Themes for Rotating Aesthetics across 365 Days
const SACRED_THEMES = [
  {
    name: "Surya Tejas (ಸೂರ್ಯ ತೇಜಸ್ಸು)",
    bgGradient: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #1C0A00 100%)",
    accentColor: "#F59E0B",
    borderGold: "#FBBF24",
    textColor: "#FFFDF7",
    icon: "☀️"
  },
  {
    name: "Maha Ganapati Kripa (ಗಣೇಶ ಕೃಪೆ)",
    bgGradient: "linear-gradient(135deg, #7C2D12 0%, #9A3412 50%, #431407 100%)",
    accentColor: "#FB923C",
    borderGold: "#FDE047",
    textColor: "#FFFDF7",
    icon: "🐘"
  },
  {
    name: "Gokarna Shankara Dhama (ಶಿವ ಸಾನ್ನಿಧ್ಯ)",
    bgGradient: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #020617 100%)",
    accentColor: "#38BDF8",
    borderGold: "#E2E8F0",
    textColor: "#F8FAFC",
    icon: "🔱"
  },
  {
    name: "Sri Mahalakshmi Anugraha (ಮಹಾಲಕ್ಷ್ಮಿ ಅನುಗ್ರಹ)",
    bgGradient: "linear-gradient(135deg, #581C87 0%, #7E22CE 50%, #3B0764 100%)",
    accentColor: "#C084FC",
    borderGold: "#FACC15",
    textColor: "#FAF5FF",
    icon: "🪷"
  },
  {
    name: "Sri Dhanvantari Sanjeevini (ಆರೋಗ್ಯ ಸಂಜೀವಿನಿ)",
    bgGradient: "linear-gradient(135deg, #064E3B 0%, #047857 50%, #022C22 100%)",
    accentColor: "#34D399",
    borderGold: "#A7F3D0",
    textColor: "#ECFDF5",
    icon: "🌿"
  },
  {
    name: "Gayatri Brahmathejas (ಗಾಯತ್ರಿ ಬ್ರಹ್ಮತೇಜಸ್ಸು)",
    bgGradient: "linear-gradient(135deg, #831843 0%, #9D174D 50%, #500724 100%)",
    accentColor: "#F472B6",
    borderGold: "#FDE68A",
    textColor: "#FDF2F8",
    icon: "🪔"
  }
];

// Rich Vedic Shlokas & Insights Repository
interface SeedInspiration {
  deitySource: string;
  shlokaSa: string;
  shlokaKn: string;
  shlokaTranslit: string;
  shlokaMeaningKn: string;
  shlokaMeaningEn: string;
  shlokaMeaningHi: string;
  shlokaMeaningTe: string;
  shlokaMeaningTa: string;
  goodMorningKn: string;
  goodMorningEn: string;
  goodMorningHi: string;
  goodMorningTe: string;
  goodMorningTa: string;
  goodDeedKn: string;
  goodDeedEn: string;
  goodDeedHi: string;
  goodDeedTe: string;
  goodDeedTa: string;
  quoteKn: string;
  quoteEn: string;
  quoteHi: string;
  quoteTe: string;
  quoteTa: string;
}

const SEED_INSPIRATIONS: SeedInspiration[] = [
  {
    deitySource: "ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸ್ತೋತ್ರ",
    shlokaSa: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
    shlokaKn: "ವಕ್ರತುಂಡ ಮಹಾಕಾಯ ಸೂರ್ಯಕೋಟಿ ಸಮಪ್ರಭ। ನಿರ್ವಿಘ್ನಂ ಕುರು ಮೇ ದೇವ ಸರ್ವಕಾರ್ಯೇಷು ಸರ್ವದಾ॥",
    shlokaTranslit: "Vakratunda Mahakaya Suryakoti Samaprabha | Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada ||",
    shlokaMeaningKn: "ವಕ್ರವಾದ ಶುಂಡಿಲವುಳ್ಳ, ಬೃಹದಾಕಾರದ, ಕೋಟಿ ಸೂರ್ಯರ ತೇಜಸ್ಸನ್ನು ಹೊಂದಿರುವ ಎಲೈ ಮಹಾಗಣಪತಿಯೇ, ನನ್ನ ಸಕಲ ಸತ್ಕಾರ್ಯಗಳಿಗೂ ಸದಾಕಾಲ ನಿರ್ವಿಘ್ನತೆ ಮತ್ತು ವಿಜಯವನ್ನು ದಯಪಾಲಿಸು.",
    shlokaMeaningEn: "O Lord Ganesha with a curved trunk and colossal form, radiating the brilliance of a million suns, always remove all obstacles from every noble task I undertake.",
    shlokaMeaningHi: "हे वक्रतुण्ड, विशाल शरीर वाले, करोड़ों सूर्यों के समान तेजस्वी देव! मेरे सभी शुभ कार्यों को सदैव निर्विघ्न संपन्न करें।",
    shlokaMeaningTe: "వక్రతుండ మహాకాయ సూర్యకోటి సమప్రభ, నా సర్వ శుభకార్యములను ఎల్లప్పుడూ విఘ్నాలు లేకుండా విజయవంతం చేయుము.",
    shlokaMeaningTa: "வளைந்த தும்பிக்கையும், கோடி சூரிய பிரகாசமும் கொண்ட விநாயகப் பெருமானே, எனது அனைத்து நற்காரியங்களையும் தடையின்றி நிறைவேற்றித் தருவீராக.",
    goodMorningKn: "ಶುಭೋದಯ! ಇಂದಿನ ಪ್ರಶಾಂತ ಮುಂಜಾನೆ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ನವಚೈತನ್ಯ, ಅಚಲ ಧೈರ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಶಾಂತಿಯನ್ನು ತುಂಬಲಿ.",
    goodMorningEn: "Subhodaya! May this serene morning infuse your mind with fresh enthusiasm, unshakeable courage, and inner peace.",
    goodMorningHi: "सुप्रभात! यह शांत सुबह आपके मन में नई ऊर्जा, अडिग साहस और असीम शांति का संचार करे।",
    goodMorningTe: "శుభోదయం! ఈ ప్రశాంతమైన ఉదయం మీ మనస్సులో నూతనోత్సాహం, ధైర్యం మరియు ప్రశాంతతను నింపాలి.",
    goodMorningTa: "இனிய காலை வணக்கம்! இந்த அமைதியான காலைப் பொழுது உங்கள் மனதில் புத்துணர்ச்சியையும் அமைதியையும் தரட்டும்.",
    goodDeedKn: "ಇಂದು ತುಳಸಿ ಗಿಡಕ್ಕೆ ಅಥವಾ ಮನೆ ಮುಂದಿನ ಮರಗಿಡಗಳಿಗೆ ಭಕ್ತಿಯಿಂದ ನೀರುಣಿಸಿ, ಪರಿಸರವನ್ನು ಪ್ರೀತಿಸಿ.",
    goodDeedEn: "Water a sacred Tulasi plant or green trees with devotion, nurturing Mother Nature today.",
    goodDeedHi: "आज तुलसी या किसी वृक्ष को जल अर्पित करें और प्रकृति के प्रति कृतज्ञता व्यक्त करें।",
    goodDeedTe: "ఈరోజు తులసి మొక్కకు లేదా పచ్చని చెట్లకు నీరు పోసి ప్రకృతికి కృతజ్ఞతలు చెప్పండి.",
    goodDeedTa: "இன்று துளசி செடிக்கோ அல்லது மரங்களுக்கோ நீர் ஊற்றி இயற்கையை போற்றுங்கள்.",
    quoteKn: "ಸಕಾರಾತ್ಮಕ ಚಿಂತನೆ ಹಾಗೂ ಶಾಂತ ಮನಸ್ಸಿನಿಂದ ಆರಂಭವಾಗುವ ದಿನವು ಎಂತಹ ಕಠಿಣ ಸವಾಲುಗಳನ್ನೂ ಸುಲಭವಾಗಿ ಜಯಿಸುತ್ತದೆ.",
    quoteEn: "A day begun with calm optimism and a pure heart turns the toughest challenges into stepping stones of success.",
    quoteHi: "सकारात्मक सोच और शांत मन से शुरू हुआ दिन हर कठिन चुनौती को सरल बना देता है।",
    quoteTe: "ప్రశాంతమైన మనస్సుతో ప్రారంభమయ్యే ప్రతి రోజు విజయానికి గొప్ప బాట వేస్తుంది.",
    quoteTa: "நேர்மறை எண்ணத்துடன் தொடங்கும் நாள் எந்த ஒரு சவாலையும் வெற்றியாக மாற்றும்."
  },
  {
    deitySource: "ಶ್ರೀ ಗಾಯತ್ರಿ ಮಹಾಮಂತ್ರ",
    shlokaSa: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
    shlokaKn: "ಓಂ ಭೂರ್ಭುವಃ ಸ್ವಃ ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ ಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್॥",
    shlokaTranslit: "Om Bhur Bhuvah Svah Tat Savitur Varenyam Bhargo Devasya Dheemahi Dhiyo Yo Nah Prachodayat ||",
    shlokaMeaningKn: "ಭೂಮಿ, ಅಂತರಿಕ್ಷ ಮತ್ತು ಸ್ವರ್ಗಗಳನ್ನು ಬೆಳಗುತ್ತಿರುವ ದಿವ್ಯ ಸೂರ್ಯದೇವನ ಜ್ಯೋತಿಯನ್ನು ನಾವು ಧ್ಯಾನಿಸುತ್ತೇವೆ. ಆ ಪರಂಜ್ಯೋತಿಯು ನಮ್ಮ ಬುದ್ಧಿ-ವಿವೇಕಗಳನ್ನು ಧರ್ಮಮಾರ್ಗದಲ್ಲಿ ಪ್ರಚೋದಿಸಲಿ.",
    shlokaMeaningEn: "We meditate on the supreme transcendental radiance of the divine Sun who illuminates all realms. May that sacred light illuminate and guide our intellect toward truth.",
    shlokaMeaningHi: "हम उस प्राणस्वरूप, तेजस्वी परमात्मा का ध्यान करते हैं जो हमारी बुद्धि को सन्मार्ग पर प्रेरित करे।",
    shlokaMeaningTe: "సమస్త లోకాలను ప్రకాశింపజేసే దివ్య సవితృ తేజాన్ని ధ్యానిస్తున్నాము. అది మన బుద్ధిని సన్మార్గంలో నడిపించుగాక.",
    shlokaMeaningTa: "அனைத்து உலகங்களையும் இயக்கும் அந்தப் பரம்பொருளின் திவ்ய ஒளியைத் தியானிக்கிறோம். அது நம் அறிவை நல்வழியில் செலுத்தட்டும்.",
    goodMorningKn: "ಶುಭೋದಯ! ದೈವಿಕ ಬೆಳಕು ನಿಮ್ಮ ಇಂದಿನ ಪ್ರತಿಯೊಂದು ನಿರ್ಧಾರದಲ್ಲೂ ಜ್ಞಾನ, ವಿವೇಕ ಮತ್ತು ಸಾರ್ಥಕತೆಯನ್ನು ಮೂಡಿಸಲಿ.",
    goodMorningEn: "Good Morning! May the divine sunlight illuminate your thoughts, filling every decision with wisdom and joy.",
    goodMorningHi: "सुप्रभात! ईश्वर का दिव्य प्रकाश आपके हर निर्णय को ज्ञान, विवेक और सफलता से भर दे।",
    goodMorningTe: "శుభోదయం! దైవ కాంతి మీ ఆలోచనలను జ్ఞానంతో మరియు సానుకూలతతో ప్రకాశింపజేయాలి.",
    goodMorningTa: "இனிய காலை வணக்கம்! இறைவனின் அருள் உங்கள் எண்ணங்களை ஞானத்தாலும் வெற்றியாலும் நிரப்பட்டும்.",
    goodDeedKn: "ಮನೆಯ ಹಿರಿಯರಿಗೆ ಅಥವಾ ತಂದೆ-ತಾಯಿಯರಿಗೆ ಪ್ರೀತಿಯಿಂದ ನಮಸ್ಕರಿಸಿ, ಅವರ ಆಶೀರ್ವಾದ ಪಡೆದುಕೊಳ್ಳಿ.",
    goodDeedEn: "Offer a warm greeting and respectful touch of feet to your parents or family elders today.",
    goodDeedHi: "आज अपने माता-पिता और बुजुर्गों के चरण स्पर्श कर उनका स्नेहपूर्ण आशीर्वाद लें।",
    goodDeedTe: "ఈరోజు మీ తల్లిదండ్రులు లేదా పెద్దలకు నమస్కరించి వారి ఆశీస్సులు అందుకోండి.",
    goodDeedTa: "இன்று உங்கள் பெற்றோர் மற்றும் பெரியவர்களை வணங்கி அவர்களின் ஆசியைப் பெறுங்கள்.",
    quoteKn: "ಶಾಂತಿಯುತ ಚಿತ್ತವೇ ಪರಮ ಶಕ್ತಿ; ಕೋಪವನ್ನು ಸಂಯಮದಿಂದ ಮತ್ತು ದ್ವೇಷವನ್ನು ಪ್ರೀತಿಯಿಂದ ಗೆಲ್ಲಿ.",
    quoteEn: "Peace of mind is the ultimate strength; conquer anger with patience and negativity with compassion.",
    quoteHi: "शांत मन ही सबसे बड़ी शक्ति है; क्रोध को धैर्य से और नकारात्मकता को प्रेम से जीतें।",
    quoteTe: "ప్రశాంతతే పరమ శక్తి; కోపాన్ని ఓర్పుతో మరియు ద్వేషాన్ని ప్రేమతో జయించండి.",
    quoteTa: "அமைதியான மனமே சிறந்த பலம்; கோபத்தைப் பொறுமையாலும் பகையை அன்பாலும் வெல்லுங்கள்."
  },
  {
    deitySource: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ (ಶಿವ ಪಂಚಾಕ್ಷರ)",
    shlokaSa: "नागेन्द्रहाराय त्रिलोचनाय भस्माङ्गरागाय महेश्वराय। नित्याय शुद्धाय दिगम्बराय तस्मै नकाराय नमः शिवाय॥",
    shlokaKn: "ನಾಗೇಂದ್ರಹಾರಾಯ ತ್ರಿಲೋಚನಾಯ ಭಸ್ಮಾಂಗರಾಗಾಯ ಮಹೇಶ್ವರಾಯ। ನಿತ್ಯಾಯ ಶುದ್ಧಾಯ ದಿಗಂಬರಾಯ ತಸ್ಮೈ ನಕಾರಾಯ ನಮಃ ಶಿವಾಯ॥",
    shlokaTranslit: "Nagendraharaya Trilochanaya Bhasmangaragaya Maheshwaraya | Nityaya Shuddhaya Digambaraya Tasmai Nakaraya Namah Shivaya ||",
    shlokaMeaningKn: "ಸರ್ಪರಾಜನನ್ನೇ ಹಾರವಾಗಿ ಧರಿಸಿರುವ, ತ್ರಿನೇತ್ರನಾದ, ಪವಿತ್ರ ಭಸ್ಮಾಲಂಕೃತನಾದ, ನಿತ್ಯನೂ ಪರಮಶುದ್ಧನೂ ಆದ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾದೇವನಿಗೆ ಭಕ್ತಿಪೂರ್ವಕ ನಮನಗಳು.",
    shlokaMeaningEn: "Salutations to Lord Shiva, adorned with the serpent king as garland, having three eyes, smeared with sacred ash, eternal, purely divine, and the supreme protector.",
    shlokaMeaningHi: "सर्पों का हार धारण करने वाले, त्रिनेत्रधारी, भस्म से सुशोभित, नित्य और पवित्र देवाधिदेव महादेव को नमन।",
    shlokaMeaningTe: "నాగేంద్రుని హారముగా ధరించిన, ముక్కంటి అయిన, భస్మధారియైన పరమ పవిత్ర శ్రీ మహాబలేశ్వరునికి ప్రణామాలు.",
    shlokaMeaningTa: "நாகத்தை மாலையாக அணிந்த, முக்கண்ணனான, திருநீறு பூசிய, நித்தியமான சிவபெருமானுக்கு என் வணக்கங்கள்.",
    goodMorningKn: "ಶುಭೋದಯ! ಶಿವನ ಅನುಗ್ರಹದಿಂದ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಸಮಸ್ತ ಆತಂಕಗಳು ಕರಗಿ, ಆಳವಾದ ಶಾಂತಿ ಮತ್ತು ನೆಮ್ಮದಿ ನೆಲಸಲಿ.",
    goodMorningEn: "Subhodaya! May Lord Shiva dissolve all worries, blessing your heart with deep serenity and clarity.",
    goodMorningHi: "सुप्रभात! भगवान शिव की कृपा से आपकी समस्त चिंताएं दूर हों और जीवन में सुख-शांति का वास हो।",
    goodMorningTe: "శుభోదయం! శివానుగ్రహంతో మీ ఆందోళనలు తొలగి, హృదయం ప్రశాంతంగా ఉండాలి.",
    goodMorningTa: "இனிய காலை வணக்கம்! சிவபெருமானின் அருளால் உங்கள் கவலைகள் நீங்கி அமைதி நிலவட்டும்.",
    goodDeedKn: "ಪಕ್ಷಿಗಳಿಗೆ ಅಥವಾ ಬೀದಿ ಪ್ರಾಣಿಗಳಿಗೆ ಸ್ವಲ್ಪ ಶುದ್ಧ ನೀರು ಮತ್ತು ಧಾನ್ಯವನ್ನು ಇರಿಸಿ ಜೀವದಯೆ ಮೆರೆಯಿರಿ.",
    goodDeedEn: "Place a bowl of fresh water and grains for birds or animals around your home today.",
    goodDeedHi: "आज पक्षियों के लिए जल और दाना रखें, बेजुबान जीवों के प्रति दयालुता दिखाएं।",
    goodDeedTe: "పక్షులకు స్వచ్ఛమైన నీరు మరియు ధాన్యాలు అందించి జీవకారుణ్యం చూపండి.",
    goodDeedTa: "இன்று பறவைகளுக்கும் வாயில்லா ஜீவன்களுக்கும் தூய நீரும் தானியமும் வையுங்கள்.",
    quoteKn: "ಸಂಕಷ್ಟಗಳು ನಮ್ಮನ್ನು ಬಗ್ಗಿಸಲು ಬರುವುದಿಲ್ಲ; ನಮ್ಮ ಆಂತರಿಕ ಧೈರ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸಲು ಬರುತ್ತವೆ.",
    quoteEn: "Hardships do not come to break you; they arrive to awaken your dormant inner strength and resilience.",
    quoteHi: "विपत्तियां हमें तोड़ने नहीं, बल्कि हमारे भीतर के असीम सामर्थ्य को जगाने आती हैं।",
    quoteTe: "కష్టాలు మనల్ని అణచివేయడానికి రావు; మనలోని ఆత్మవిశ్వాసాన్ని మేల్కొలపడానికి వస్తాయి.",
    quoteTa: "துன்பங்கள் நம்மை அழிக்க வருவதில்லை; நமது உள்மன வலிமையை வெளிக்கொணரவே வருகின்றன."
  },
  {
    deitySource: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಅಷ್ಟಕಂ",
    shlokaSa: "नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते। शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते॥",
    shlokaKn: "ನಮಸ್ತೇಽಸ್ತು ಮಹಾಮಾಯೇ ಶ್ರೀಪೀಠೇ ಸುರಪೂಜಿತೇ। ಶಂಖಚಕ್ರಗದಾಹಸ್ತೇ ಮಹಾಲಕ್ಷ್ಮಿ ನಮೋಽಸ್ತು ತೇ॥",
    shlokaTranslit: "Namastestu Mahamaye Shreepithe Surapoojite | Shankhachakragadahaste Mahalakshmi Namostu Te ||",
    shlokaMeaningKn: "ಶ್ರೀಪೀಠದಲ್ಲಿ ನೆಲೆಸಿರುವ, ದೇವತೆಗಳಿಂದ ಪೂಜಿಸಲ್ಪಡುವ, ಶಂಖ-ಚಕ್ರ-ಗದೆಗಳನ್ನು ಧರಿಸಿರುವ ಮಹಾಮಾಯೆಯಾದ ಹೇ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ, ನಿನಗೆ ಅನಂತ ಪ್ರಣಾಮಗಳು.",
    shlokaMeaningEn: "Salutations to Goddess Mahalakshmi, the supreme divine mother enthroned in the holy sanctum, worshipped by celestials, holding the conch, discus, and mace.",
    shlokaMeaningHi: "श्रीपीठ पर विराजित, देवताओं द्वारा पूजित, शंख-चक्र-गदा धारिणी भगवती महालक्ष्मी को कोटि-कोटि प्रणाम।",
    shlokaMeaningTe: "శ్రీపీఠమున వెలసిన, దేవతలచే పూజింపబడే, శంఖ-చక్ర-గదాధారిణి అయిన శ్రీ మహాలక్ష్మికి ప్రణామాలు.",
    shlokaMeaningTa: "ஸ்ரீபீடத்தில் வீற்றிருக்கும், தேவர்களால் வணங்கப்படும், சங்கு சக்கர கதையை ஏந்திய மகாலட்சுமியே போற்றி.",
    goodMorningKn: "ಶುಭೋದಯ! ಮಹಾಲಕ್ಷ್ಮಿಯ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಸಕಲ ಶುಭಗಳು, ಆರೋಗ್ಯ ಮತ್ತು ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ ಸದಾ ತುಂಬಿರಲಿ.",
    goodMorningEn: "Good Morning! May Goddess Mahalakshmi bless your family with enduring prosperity, health, and auspiciousness.",
    goodMorningHi: "सुप्रभात! माँ महालक्ष्मी की कृपा से आपके घर में सुख, समृद्धि और आरोग्य की वर्षा हो।",
    goodMorningTe: "శుభోదయం! లక్ష్మీదేవి కటాక్షంతో మీ ఇంట సిరిసంపదలు, ఆరోగ్యం వర్ధిల్లాలి.",
    goodMorningTa: "இனிய காலை வணக்கம்! மகாலட்சுமியின் அருளால் உங்கள் இல்லத்தில் நல்வாழ்வும் செல்வமும் பெருகட்டும்.",
    goodDeedKn: "ಅಗತ್ಯವಿರುವ ವ್ಯಕ್ತಿಗೆ ಅಥವಾ ಬಡವರಿಗೆ ಪ್ರೀತಿಯಿಂದ ಊಟ ಅಥವಾ ಸಹಾಯವನ್ನು ನೀಡಿ ಪುಣ್ಯ ಗಳಿಸಿ.",
    goodDeedEn: "Offer a nourishing meal or supportive help to someone in need with a generous heart.",
    goodDeedHi: "आज किसी जरूरतमंद व्यक्ति को आदरपूर्वक भोजन कराएं या यथायोग्य सहायता करें।",
    goodDeedTe: "పేదవారికి లేదా ఆకలితో ఉన్నవారికి అన్నదానం చేసి పుణ్యం సంపాదించండి.",
    goodDeedTa: "இன்று பசியோடு இருப்பவர்களுக்கு அன்புடன் உணவளித்து புண்ணியம் பெறுங்கள்.",
    quoteKn: "ಪರರ ಕಷ್ಟಕ್ಕೆ ಸ್ಪಂದಿಸುವ ಹೃದಯವೇ ಈ ಜಗತ್ತಿನಲ್ಲಿ ಅತ್ಯಂತ ಪವಿತ್ರವಾದ ಮಂದಿರ.",
    quoteEn: "A compassionate heart that genuinely uplifts others is the truest and most sacred temple.",
    quoteHi: "दूसरों के दुख को समझकर सहायता करने वाला हृदय ही संसार का सबसे पवित्र मंदिर है।",
    quoteTe: "తోటివారి కష్టాన్ని అర్థం చేసుకుని ఆదుకునే హృదయమే ఈ సృష్టిలో అత్యంత పవిత్రమైన ఆలయం.",
    quoteTa: "பிறர் துன்பத்தில் கைகொடுக்கும் அன்பான இதயமே இறைவனின் உண்மையான ஆலயம்."
  },
  {
    deitySource: "ಶ್ರೀ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಂತ್ರ",
    shlokaSa: "ध्येयः सदा सवितृमण्डल मध्यवर्ती नारायणः सरसिजासन सन्निविष्टः। केयूरवान् मकरकुण्डलवान् किरीटी हारी हिरण्मयवपुर्धृतशङ्खचक्रः॥",
    shlokaKn: "ಧ್ಯೇಯಃ ಸದಾ ಸವಿತೃಮಂಡಲ ಮಧ್ಯವರ್ತೀ ನಾರಾಯಣಃ ಸರಸಿಜಾಸನ ಸನ್ನಿವಿಷ್ಟಃ। ಕೇಯೂರವಾನ್ ಮಕರಕುಂಡಲವಾನ್ ಕಿರೀಟೀ ಹಾರೀ ಹಿರಣ್ಮಯವಪುರ್ಧೃತಶಂಖಚಕ್ರಃ॥",
    shlokaTranslit: "Dhyeyah Sada Savitrumandala Madhyavarti Narayanah Sarasijasana Sannivishtah | Keyuravan Makarakundalavan Kireeti Haari Hiranmayavapur Dhritashankhachakrah ||",
    shlokaMeaningKn: "ಸೂರ್ಯಮಂಡಲದ ಮಧ್ಯದಲ್ಲಿ ಕಮಲದ ಮೇಲೆ ಆಸೀನನಾಗಿರುವ, ಸುವರ್ಣ ತೇಜಸ್ಸಿನ ಶಂಖ-ಚಕ್ರಧಾರಿ ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣನನ್ನು ನಾವು ಸದಾ ನಮಸ್ಕರಿಸುತ್ತೇವೆ.",
    shlokaMeaningEn: "We constantly meditate on Lord Suryanarayana seated upon the lotus in the heart of the solar sphere, radiating golden brilliance with conch and discus.",
    shlokaMeaningHi: "सूर्यमंडल के केंद्र में कमल पर विराजमान, स्वर्ण के समान कांतियुक्त श्री सूर्यनारायण का हम सदैव ध्यान करते हैं।",
    shlokaMeaningTe: "సూర్యమండల మధ్యంలో పద్మాసనంలో కొలువుదీరిన సువర్ణ తేజస్సు గల సూర్యనారాయణునికి నమస్కారాలు.",
    shlokaMeaningTa: "சூரிய மண்டலத்தின் நடுவே தாமரையில் வீற்றிருக்கும் பொன்மயமான சூரிய நாராயணனை வணங்குகிறோம்.",
    goodMorningKn: "ಶುಭೋದಯ! ಉದಯಿಸುತ್ತಿರುವ ಸೂರ್ಯನ ಕಿರಣಗಳಂತೆ ನಿಮ್ಮ ಬಾಳಿನಲ್ಲಿ ಹೊಸ ಆಶಾಕಿರಣಗಳು ಪ್ರಕಾಶಿಸಲಿ.",
    goodMorningEn: "Subhodaya! Like the rising dawn, may brilliant rays of hope, health, and vitality light up your life.",
    goodMorningHi: "सुप्रभात! उगते सूर्य की स्वर्णिम किरणों की तरह आपका जीवन नई आशाओं और ऊर्जा से भर जाए।",
    goodMorningTe: "శుభోదయం! ఉదయ భానుని కిరణాల వలె మీ జీవితంలో సరికొత్త ఆశలు చిగురించాలి.",
    goodMorningTa: "இனிய காலை வணக்கம்! உதிக்கும் சூரியனைப் போல உங்கள் வாழ்வில் புதிய நம்பிக்கைகள் ஒளிரட்டும்.",
    goodDeedKn: "ನಿಮ್ಮ ಸಹೋದ್ಯೋಗಿ ಅಥವಾ ಸ್ನೇಹಿತರಿಗೆ ಕೃತಜ್ಞತೆಯ ಒಂದು ಪ್ರೋತ್ಸಾಹದಾಯಕ ಸಂದೇಶ ಕಳುಹಿಸಿ.",
    goodDeedEn: "Send a sincere, encouraging message of gratitude to a friend, colleague, or student.",
    goodDeedHi: "आज अपने किसी मित्र या सहयोगी को प्रोत्साहन और कृतज्ञता का संदेश भेजें।",
    goodDeedTe: "మీ స్నేహితునికి లేదా తోటి ఉద్యోగికి ప్రోత్సాహకరమైన సందేశం పంపి వారిలో ఉత్సాహం నింపండి.",
    goodDeedTa: "நண்பருக்கோ சக பணியாளருக்கோ ஊக்கமளிக்கும் நன்றியுணர்வை வெளிப்படுத்துங்கள்.",
    quoteKn: "ಪ್ರತಿ ದಿನವೂ ನಮಗೆ ದೇವರು ನೀಡುವ ಹೊಸ ಅವಕಾಶ; ನಿನ್ನೆಯ ತಪ್ಪುಗಳನ್ನು ಮರೆತು ಇಂದಿನಿಂದ ಹೊಸ ಇತಿಹಾಸ ಬರೆಯಿರಿ.",
    quoteEn: "Every sunrise is an unwritten page gifted by the divine; learn from yesterday and script triumph today.",
    quoteHi: "हर नया दिन ईश्वर का दिया हुआ एक अनुपम उपहार है; अतीत को भूलकर आज नया अध्याय लिखें।",
    quoteTe: "ప్రతి ఉదయం భగవంతుడిచ్చిన గొప్ప వరం; నిన్నటి పొరపాట్లను విడనాడి నేడు కొత్త చరిత్ర రాయండి.",
    quoteTa: "ஒவ்வொரு விடியலும் புதிய வாய்ப்பு; நேற்றைய கவலைகளை மறந்து இன்றைய நாளை அழகாக்குங்கள்."
  },
  {
    deitySource: "ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಸ್ತೋತ್ರ",
    shlokaSa: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्। लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥",
    shlokaKn: "ಶಾಂತಾಕಾರಂ ಭುಜಗಶಯನಂ ಪದ್ಮನಾಭಂ ಸುರೇಶಂ ವಿಶ್ವಾಧಾರಂ ಗಗನಸದೃಶಂ ಮೇಘವರ್ಣಂ ಶುಭಾಂಗಮ್। ಲಕ್ಷ್ಮೀಕಾಂತಂ ಕಮಲನಯನಂ ಯೋಗಿಭಿರ್ಧ್ವಾನಗಮ್ಯಂ ವಂದೇ ವಿಷ್ಣುಂ ಭವಭಯಹರಂ ಸರ್ವಲೋಕೈಕನಾಥಮ್॥",
    shlokaTranslit: "Shantakaram Bhujagashayanam Padmanabham Suresham Vishwadharam Gaganasadrisham Meghavarnam Shubhangam | Lakshmikantam Kamalanayanam Yogibhirdhyanagamyam Vande Vishnum Bhavabhayaharam Sarvalokaikanatham ||",
    shlokaMeaningKn: "ಪರಮ ಶಾಂತ ಸ್ವರೂಪನಾದ, ಶೇಷಶಯನನಾದ, ಸರ್ವಲೋಕಗಳ ನಾಥನಾದ ಶ್ರೀ ಮಹಾವಿಷ್ಣುವಿಗೆ ವಂದನೆಗಳು. ಆತನು ಭವಭಯಗಳನ್ನು ನಿವಾರಿಸಿ ಸಕಲರಿಗೂ ಮಂಗಲವನ್ನು ಕರುಣಿಸಲಿ.",
    shlokaMeaningEn: "Salutations to Lord Vishnu, the serene sustainer resting upon the serpent Adisesha, the cosmic foundation, who dispels all worldly fears and protects all realms.",
    shlokaMeaningHi: "शांत स्वरूप, शेषनाग पर शयन करने वाले, सर्वलोकों के स्वामी भगवान विष्णु को प्रणाम, जो समस्त भयों का हरण करते हैं।",
    shlokaMeaningTe: "ప్రశాంత స్వరూపుడు, విశ్వానికి ఆధారమైన శ్రీ మహావిష్ణువుకు నమస్కారాలు. ఆయన మన భయాలను పోగొట్టుగాక.",
    shlokaMeaningTa: "அமைதியான உருவமும், ஆதிசேஷன் மேல் பள்ளிகொண்டவருமான உலக ரட்சகர் மகாவிஷ்ணுவை வணங்குகிறோம்.",
    goodMorningKn: "ಶುಭೋದಯ! ಮಹಾವಿಷ್ಣುವಿನ ಸದಾ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ಕುಟುಂಬದಲ್ಲಿ ಸುಖ, ಸೌಹಾರ್ದತೆ ಮತ್ತು ನೆಮ್ಮದಿ ನೆಲೆಸಲಿ.",
    goodMorningEn: "Good Morning! May Lord Vishnu's benevolent grace safeguard your home with peace, unity, and bliss.",
    goodMorningHi: "सुप्रभात! भगवान नारायण की कृपा से आपके परिवार में सदा प्रेम, एकता और शांति बनी रहे।",
    goodMorningTe: "శుభోదయం! శ్రీమహావిష్ణువు అనుగ్రహంతో మీ కుటుంబంలో సంతోషం, ఐక్యమత్యం నిండాలి.",
    goodMorningTa: "இனிய காலை வணக்கம்! மகாவிஷ்ணுவின் அருளால் உங்கள் குடும்பத்தில் மகிழ்ச்சியும் அன்பும் நிறைக.",
    goodDeedKn: "ಮನಸ್ಸಿನಲ್ಲಿರುವ ಅಸಮಾಧಾನ, ದ್ವೇಷಗಳನ್ನು ತ್ಯಜಿಸಿ, ಒಬ್ಬರನ್ನು ಮನಃಪೂರ್ವಕವಾಗಿ ಕ್ಷಮಿಸಿ ನೆಮ್ಮದಿ ಪಡೆಯಿರಿ.",
    goodDeedEn: "Let go of past resentment and grant wholehearted forgiveness to someone today.",
    goodDeedHi: "आज मन के द्वेष को त्यागकर किसी को सच्चे दिल से क्षमा करें और असीम शांति महसूस करें।",
    goodDeedTe: "మనసులోని కోపాన్ని విడిచిపెట్టి, ఒకరిని హృదయపూర్వకంగా క్షమించి ప్రశాంతత పొందండి.",
    goodDeedTa: "மனக்கசப்புகளை மறந்து ஒருவரை முழுமனதுடன் மன்னித்து மன அமைதி பெறுங்கள்.",
    quoteKn: "ಕ್ಷಮಾಗುಣ ಮತ್ತು ಸತ್ಯನಿಷ್ಠೆಯೇ ಮನುಷ್ಯನಿಗೆ ಅತಿ ದೊಡ್ಡ ಆಭರಣ; ಅದು ಮುಖಕ್ಕೆ ದೈವಿಕ ಕಳೆಯನ್ನು ನೀಡುತ್ತದೆ.",
    quoteEn: "Forgiveness and integrity are a soul's greatest ornaments, bestowing divine charisma upon one's life.",
    quoteHi: "क्षमा और सत्यनिष्ठा ही मनुष्य के सच्चे आभूषण हैं जो जीवन को अलौकिक तेज प्रदान करते हैं।",
    quoteTe: "క్షమ మరియు నిజాయితీలే మనిషికి గొప్ప అలంకారాలు; అవి జీవితానికి దైవిక కాంతినిస్తాయి.",
    quoteTa: "மன்னிப்பும் வாய்மையுமே சிறந்த ஆபரணங்கள்; அவை நம் முகத்தில் தெய்வீக அழகைத் தரும்."
  },
  {
    deitySource: "ಶ್ರೀ ಧನ್ವಂತರಿ ಆರೋಗ್ಯ ಮಂತ್ರ",
    shlokaSa: "ॐ नमो भगवते महासुदर्शनाय वासुदेवाय धन्वन्तरये अमृतकलशहस्ताय सर्वभयविनाशाय सर्वरोगनिवारणाय त्रैलोक्यपतये त्रैलोक्यनिधये श्रीमहाविष्णुस्वरूप श्रीधन्वन्तरि स्वरूप श्री श्री श्री औषधचक्र नारायणाय नमः॥",
    shlokaKn: "ಓಂ ನಮೋ ಭಗವತೇ ಮಹಾಸುದರ್ಶನಾಯ ವಾಸುದೇವಾಯ ಧನ್ವಂತರಯೇ ಅಮೃತಕಲಶಹಸ್ತಾಯ ಸರ್ವಭಯವಿನಾಶಾಯ ಸರ್ವರೋಗನಿವಾರಣಾಯ ತ್ರೈಲೋಕ್ಯಪತಯೇ ತ್ರೈಲೋಕ್ಯನಿಧಯೇ ಶ್ರೀಮಹಾವಿಷ್ಣುಸ್ವರೂಪ ಶ್ರೀಧನ್ವಂತರಿ ಸ್ವರೂಪ ನಮಃ॥",
    shlokaTranslit: "Om Namo Bhagavate Vasudevaya Dhanvantaraye Amritakalashahastaya Sarvabhayanashanaya Sarvaroganivaranaya Namah ||",
    shlokaMeaningKn: "ಅಮೃತಕಲಶವನ್ನು ಕೈಯಲ್ಲಿ ಹಿಡಿದಿರುವ, ಸಕಲ ರೋಗ-ರುಜಿನಗಳನ್ನು ಮತ್ತು ಭಯವನ್ನು ನಿವಾರಿಸುವ ದೈವಿಕ ವೈದ್ಯ ಶ್ರೀ ಧನ್ವಂತರಿ ಭಗವಂತನಿಗೆ ಅನಂತ ನಮನಗಳು.",
    shlokaMeaningEn: "Salutations to Lord Dhanvantari, holding the vessel of celestial nectar, the divine healer who destroys all ailments and dispels all disease and fear.",
    shlokaMeaningHi: "हाथ में अमृत कलश धारण करने वाले, समस्त रोगों और भयों का नाश करने वाले भगवान धन्वंतरि को नमन।",
    shlokaMeaningTe: "అమృత కలశాన్ని ధరించిన, సమస్త రోగాలను మరియు భయాలను నివారించే శ్రీ ధన్వంతరి స్వామికి ప్రణామాలు.",
    shlokaMeaningTa: "அமிர்த கலசம் ஏந்திய, நோய்களைப் போக்கும் திவ்ய மருத்துவர் தன்வந்திரி பகவானைப் பணிகிறோம்.",
    goodMorningKn: "ಶುಭೋದಯ! ನಿಮ್ಮ ತನು-ಮನಗಳು ಸದಾ ಆರೋಗ್ಯ, ಚೈತನ್ಯ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯದಿಂದ ಕೂಡಿರಲಿ ಎಂದು ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ.",
    goodMorningEn: "Subhodaya! Wishing you radiant health, vibrant vitality, and long prosperous life on this blessed day.",
    goodMorningHi: "सुप्रभात! आप और आपका परिवार सदैव उत्तम स्वास्थ्य, दीर्घायु और ऊर्जावान जीवन का आनंद लें।",
    goodMorningTe: "శుభోదయం! మీరు ఎల్లప్పుడూ ఆయురారోగ్యాలతో, ఉత్సాహంతో వర్ధిల్లాలని కోరుకుంటున్నాము.",
    goodMorningTa: "இனிய காலை வணக்கம்! நீங்கள் எப்போதும் பூரண உடல் நலத்தோடும் நீண்ட ஆயுளோடும் வாழ வாழ்த்துகிறோம்.",
    goodDeedKn: "ಇಂದು ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ ೧೫ ನಿಮಿಷ ನಡಿಗೆ, ಪ್ರಾಣಾಯಾಮ ಮಾಡಿ ಮತ್ತು ಶುದ್ಧ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವಿಸಿ.",
    goodDeedEn: "Dedicate 15 minutes to deep breathing, gentle yoga, and partake in pure nourishing food today.",
    goodDeedHi: "आज अपने स्वास्थ्य के लिए 15 मिनट प्राणायाम करें और शुद्ध सात्विक आहार ग्रहण करें।",
    goodDeedTe: "ఈరోజు మీ ఆరోగ్యం కోసం 15 నిమిషాలు ప్రాణాయామం చేసి సాత్విక ఆహారం తీసుకోండి.",
    goodDeedTa: "இன்று 15 நிமிடங்கள் பிராணாயாமம் செய்து சாத்வீக உணவை உட்கொள்ளுங்கள்.",
    quoteKn: "ಆರೋಗ್ಯವೇ ಪರಮ ಭಾಗ್ಯ; ಪ್ರಶಾಂತ ಮನಸ್ಸು ಮತ್ತು ಸಕಾರಾತ್ಮಕ ಯೋಚನೆಗಳು ರೋಗನಿರೋಧಕ ದಿವ್ಯ ಔಷಧಗಳು.",
    quoteEn: "Health is the supreme wealth; a serene mind and wholesome thoughts are life's purest medicines.",
    quoteHi: "स्वास्थ्य ही सबसे बड़ा धन है; शांत मन और सकारात्मक विचार ही सर्वोत्तम औषधि हैं।",
    quoteTe: "ఆరోగ్యమే మహాభాగ్యం; ప్రశాంతమైన మనస్సు మరియు మంచి ఆలోచనలే అసలైన ఔషధం.",
    quoteTa: "உடல் நலமே சிறந்த செல்வம்; அமைதியான மனமும் நல்லெண்ணமுமே நோயற்ற வாழ்வின் ரகசியம்."
  }
];

/**
 * Calculates deterministic Day of Year (1 - 366) from given Date
 */
export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Retrieves the 365-Day Daily Inspiration record deterministically for any date
 */
export function getDailyInspiration(date: Date = new Date()): DailyInspirationData {
  const dayOfYear = getDayOfYear(date);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const monthDay = `${month}-${day}`;

  const seedIndex = (dayOfYear - 1) % SEED_INSPIRATIONS.length;
  const themeIndex = (dayOfYear - 1) % SACRED_THEMES.length;

  const seed = SEED_INSPIRATIONS[seedIndex];
  const theme = SACRED_THEMES[themeIndex];

  return {
    dayOfYear,
    monthDay,
    deitySource: seed.deitySource,
    theme,
    goodMorningVibe: {
      kn: seed.goodMorningKn,
      en: seed.goodMorningEn,
      hi: seed.goodMorningHi,
      te: seed.goodMorningTe,
      ta: seed.goodMorningTa
    },
    shlokaText: {
      kn: seed.shlokaKn,
      sa: seed.shlokaSa,
      transliteration: seed.shlokaTranslit
    },
    shlokaMeaning: {
      kn: seed.shlokaMeaningKn,
      en: seed.shlokaMeaningEn,
      hi: seed.shlokaMeaningHi,
      te: seed.shlokaMeaningTe,
      ta: seed.shlokaMeaningTa
    },
    goodDeedOfTheDay: {
      kn: seed.goodDeedKn,
      en: seed.goodDeedEn,
      hi: seed.goodDeedHi,
      te: seed.goodDeedTe,
      ta: seed.goodDeedTa
    },
    motivationalQuote: {
      kn: seed.quoteKn,
      en: seed.quoteEn,
      hi: seed.quoteHi,
      te: seed.quoteTe,
      ta: seed.quoteTa
    }
  };
}

/**
 * Builds a clean, viral WhatsApp shareable text without exposing private/internal URLs
 */
export function buildCleanDailyWhatsAppShareText(
  dateStr: string,
  lang: SupportedLang = "kn",
  tithiStr?: string,
  nakshatraStr?: string
): string {
  let targetDate = new Date();
  try {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0])) {
      targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
    }
  } catch {}
  const insp = getDailyInspiration(targetDate);
  const morning = insp.goodMorningVibe[lang] || insp.goodMorningVibe.kn;
  const shloka = insp.shlokaText.kn;
  const meaning = insp.shlokaMeaning[lang] || insp.shlokaMeaning.kn;
  const deed = insp.goodDeedOfTheDay[lang] || insp.goodDeedOfTheDay.kn;
  const quote = insp.motivationalQuote[lang] || insp.motivationalQuote.kn;

  if (lang === "en") {
    return `🕉️ *Good Morning! Daily Baggona Panchanga Blessings*\n` +
      `📅 *Date:* ${dateStr} ${tithiStr ? `· ${tithiStr}` : ""} ${nakshatraStr ? `· ${nakshatraStr}` : ""}\n\n` +
      `✨ *Morning Vibe:*\n${morning}\n\n` +
      `📜 *Sacred Shloka (${insp.deitySource}):*\n"${shloka}"\n_${meaning}_\n\n` +
      `🌱 *Today's Good Karma Action:*\n👉 ${deed}\n\n` +
      `💡 *Daily Inspiration:*\n"${quote}"\n\n` +
      `॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕ್ಷೇತ್ರ • ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥\n` +
      `🙏 May this day bring immense peace, good health & prosperity!`;
  }

  return `🕉️ *ಶುಭೋದಯ! ಇಂದಿನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಿಕ ಆಶೀರ್ವಾದ*\n` +
    `📅 *ದಿನಾಂಕ:* ${dateStr} ${tithiStr ? `· ${tithiStr}` : ""} ${nakshatraStr ? `· ${nakshatraStr}` : ""}\n\n` +
    `✨ *ಇಂದಿನ ಶುಭೋದಯ ಸಂದೇಶ:*\n${morning}\n\n` +
    `📜 *ಇಂದಿನ ದೈವಿಕ ಶ್ಲೋಕ (${insp.deitySource}):*\n${shloka}\n\n` +
    `📖 *ಶ್ಲೋಕ ಭಾವಾರ್ಥ:*\n${meaning}\n\n` +
    `🌱 *ಇಂದಿನ ಪುಣ್ಯ ಸಂಕಲ್ಪ (Good Karma Deed):*\n👉 ${deed}\n\n` +
    `💡 *ಸ್ಫೂರ್ತಿದಾಯಕ ಚಿಂತನೆ:*\n"${quote}"\n\n` +
    `॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕ್ಷೇತ್ರ • ಗೋಕರ್ಣ ಸಾನ್ನಿಧ್ಯ ॥\n` +
    `🙏 ನಿಮ್ಮ ಇಂದಿನ ದಿನವು ಸರ್ವ ಸಿದ್ಧಿ, ಸುಖ-ಶಾಂತಿ ಹಾಗೂ ಯಶಸ್ಸಿನಿಂದ ಕೂಡಿರಲಿ!`;
}
