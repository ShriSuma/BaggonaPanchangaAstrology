/**
 * Vivaha Guna Melameli (Marriage Compatibility / ವಿವಾಹ ಗುಣ ಮೇಳಾಮೇಳಿ)
 * 5-Language Locale Dictionary (kn, en, hi, te, ta)
 *
 * Covers:
 * - UI Headers, Subtitles, Romance Pills, Form Fields, Location selectors
 * - Consecrated Loader Modal steps and sacred Mangala Shlokas
 * - Ashta Kuta & Dashakoota names, descriptions, and classical cancellation notes
 * - Kuja Dosha (Manglik) from Lagna, Moon, Venus and cancellation exceptions
 * - Papa Samya (Malefic Balance) points and analysis
 * - Dasha Sandhi transitions and alerts
 * - Gokarna Kshetra Vivaha Shanti Homas and Chief Priest endorsements
 */

export type MelameliLanguage = "kn" | "en" | "hi" | "te" | "ta";

export interface MelameliLocaleItem {
  kn: string;
  en: string;
  hi: string;
  te: string;
  ta: string;
}

export const T_MELAMELI: Record<string, MelameliLocaleItem> = {
  // Page Title & Header
  pageTitle: {
    kn: "ವಿವಾಹ ಗುಣ ಮೇಳಾಮೇಳಿ ಹಾಗೂ ಜಾತಕ ಹೊಂದಾಣಿಕೆ",
    en: "Vivaha Guna Melameli & Horoscope Matching",
    hi: "विवाह गुण मेलापक एवं कुंडली मिलान",
    te: "వివాహ గుణ మేళాపకం మరియు జాతక పొంతన",
    ta: "திருமண குணப் பொருத்தம் மற்றும் ஜாதகப் பொருத்தம்"
  },
  pageSubtitle: {
    kn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಅಷ್ಟಕೂಟ (೩೬ ಗುಣ), ದಶಕೂಟ, ಕುಜ ದೋಷ, ಪಾಪ ಸಾಮ್ಯ ಹಾಗೂ ದಶಾ ಸಂಧಿ ಆಧಾರಿತ ಅಧಿಕೃತ ದಾಂಪತ್ಯ ಹೊಂದಾಣಿಕೆ ವಿಶ್ಲೇಷಣೆ",
    en: "Authentic Vedic Marriage Matching via Ashta Kuta (36 Pts), Dasha Kuta, Kuja Dosha, Papa Samya & Dasha Sandhi",
    hi: "बग्गोण पंचांग अष्टकूट (36 गुण), दशकूट, कुज दोष, पाप साम्य एवं दशा संधि आधारित प्रामाणिक वैवाहिक मिलान",
    te: "బగ్గోణ పంచాంగ అష్టకూట (36 గుణాలు), దశకూట, కుజ దోషం, పాప సామ్యం మరియు దశా సంధి ప్రామాణిక విశ్లేషణ",
    ta: "பக்கோண பஞ்சாங்க அஷ்டகூடம் (36 குணங்கள்), தசகூடம், செவ்வாய் தோஷம், பாப சாம்யம் மற்றும் தசா சந்தி பொருத்தம்"
  },
  disclaimer: {
    kn: "ಸಂಪೂರ್ಣ ಲಾಹಿರಿ ಅಯನಾಂಶ ಗಣಿತ ಮತ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪರಂಪರೆಯ ವಿವಾಹ ನಿಯಮಾವಳಿಗಳ ಆಧಾರದ ಮೇಲೆ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.",
    en: "Computed using Lahiri Ayanamsa and traditional Gokarna Kshetra marriage compatibility rules.",
    hi: "लाहिरी अयनांश एवं श्री क्षेत्र गोकर्ण महाबलेश्वर परंपरा के वैवाहिक नियमों पर आधारित।",
    te: "లాహిరి అయనాంశ మరియు శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సంప్రదాయ వివాహ నియమాల ప్రకారం సిద్ధం చేయబడింది.",
    ta: "லாஹிரி அயனாம்சம் மற்றும் ஸ்ரீ க்ஷேத்திர கோகர்ண மகாபலேஸ்வரர் பாரம்பரிய திருமண விதிகளின்படி கணிக்கப்பட்டது."
  },

  // Boy & Girl Form Cards
  boyHeader: {
    kn: "ವರನ ಜನ್ಮ ವಿವರಗಳು (Groom / Boy)",
    en: "Groom's Birth Details",
    hi: "वर के जन्म का विवरण",
    te: "వరుని జన్మ వివరాలు",
    ta: "மணமகனின் பிறப்பு விவரங்கள்"
  },
  girlHeader: {
    kn: "ವಧುವಿನ ಜನ್ಮ ವಿವರಗಳು (Bride / Girl)",
    en: "Bride's Birth Details",
    hi: "वधू के जन्म का विवरण",
    te: "వధువు జన్మ వివరాలు",
    ta: "மணமகளின் பிறப்பு விவரங்கள்"
  },
  namePlaceholderBoy: {
    kn: "ವರನ ಪೂರ್ಣ ಹೆಸರು (ಉದಾ: ರಮೇಶ್ ಹೆಗಡೆ)",
    en: "Groom's Full Name (e.g., Ramesh Hegde)",
    hi: "वर का पूरा नाम",
    te: "వరుని పూర్తి పేరు",
    ta: "மணமகனின் முழுப் பெயர்"
  },
  namePlaceholderGirl: {
    kn: "ವಧುವಿನ ಪೂರ್ಣ ಹೆಸರು (ಉದಾ: ಸೌಮ್ಯಾ ಭಟ್)",
    en: "Bride's Full Name (e.g., Soumya Bhat)",
    hi: "वधू का पूरा नाम",
    te: "వధువు పూర్తి పేరు",
    ta: "மணமகளின் முழுப் பெயர்"
  },
  birthDateLabel: {
    kn: "ಜನ್ಮ ದಿನಾಂಕ (Date of Birth)",
    en: "Date of Birth",
    hi: "जन्म तिथि",
    te: "పుట్టిన తేదీ",
    ta: "பிறந்த தேதி"
  },
  birthTimeLabel: {
    kn: "ಜನ್ಮ ಸಮಯ (Time of Birth)",
    en: "Time of Birth",
    hi: "जन्म समय",
    te: "పుట్టిన సమయం",
    ta: "பிறந்த நேரம்"
  },
  birthPlaceLabel: {
    kn: "ಜನ್ಮ ಸ್ಥಳ / ಪಿನ್‌ಕೋಡ್ (Birth Place / Pincode)",
    en: "Birth Place / Pincode",
    hi: "जन्म स्थान / पिनकोड",
    te: "పుట్టిన స్థలం / పిన్‌కోడ్",
    ta: "பிறந்த இடம் / அஞ்சல் குறியீடு"
  },
  matchBtn: {
    kn: "ವಿವಾಹ ಮೇಳಾಮೇಳಿ ಗಣನೆ ಮಾಡಿ",
    en: "Calculate Vivaha Melameli",
    hi: "विवाह गुण मिलान की गणना करें",
    te: "వివాహ గుణ మేళాపకం గణించండి",
    ta: "திருமண பொருத்தத்தை கணக்கிடுக"
  },
  requiredError: {
    kn: "ದಯವಿಟ್ಟು ವರ ಮತ್ತು ವಧು ಇಬ್ಬರ ಜನ್ಮ ದಿನಾಂಕ ಹಾಗೂ ಸಮಯವನ್ನು ನಮೂದಿಸಿ.",
    en: "Please enter Birth Date and Time for both Groom and Bride.",
    hi: "कृपया वर एवं वधू दोनों की जन्म तिथि एवं समय दर्ज करें।",
    te: "దయచేసి వరుడు మరియు వధువు ఇద్దరి పుట్టిన తేదీ మరియు సమయాన్ని నమోదు చేయండి.",
    ta: "தயவுசெய்து மணமகன் மற்றும் மணமகள் இருவரின் பிறந்த தேதி மற்றும் நேரத்தை உள்ளிடவும்."
  },
  pincodeError: {
    kn: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 6 ಅಂಕಿಗಳ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ.",
    en: "Please enter a valid 6-digit Pincode.",
    hi: "कृपया मान्य 6 अंकों का पिनकोड दर्ज करें।",
    te: "దయచేసి సరైన 6 అంకెల పిన్‌కోడ్ నమోదు చేయండి.",
    ta: "தயவுசெய்து சரியான 6 இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும்."
  },

  // Loader Modal & Steps
  loaderTitle: {
    kn: "॥ ಶುಭ ವಿವಾಹ ಗುಣ ಮೇಳಾಪಕ ಸಂಸ್ಕಾರ ಗಣನೆ ॥",
    en: "Sacred Vivaha Melameli Computation",
    hi: "॥ शुभ विवाह गुण मेलापक संस्कार गणना ॥",
    te: "॥ శుభ వివాహ గుణ మేళాపక సంస్కార గణన ॥",
    ta: "॥ சுப திருமண குணப் பொருத்த கணக்கீடு ॥"
  },
  loaderShloka: {
    kn: "ಮಂಗಲಂ ಭಗವಾನ್ ವಿಷ್ಣುಃ ಮಂಗಲಂ ಗರುಡಧ್ವಜಃ । ಮಂಗಲಂ ಪುಂಡರೀಕಾಕ್ಷಃ ಮಂಗಲಾಯ ತನೋ ಹರಿಃ ॥",
    en: "Mangalam Bhagavan Vishnuh Mangalam Garudadhvajah | Mangalam Pundarikakshah Mangalaya Tano Harih ||",
    hi: "मंगलं भगवान विष्णुः मंगलं गरुडध्वजः । मंगलं पुण्डरीकाक्षः मंगलाय तनो हरिः ॥",
    te: "మంగళం భగవాన్ విష్ణుః మంగళం గరుడధ్వజః । మంగళం పుండరీకాక్షః మంగళాయ తనో హరిః ॥",
    ta: "மங்களம் பகவான் விஷ்ணு மங்களம் கருடத்வஜ: | மங்களம் புண்டரீகாக்ஷ: மங்களாய தனோ ஹரி: ||"
  },
  step1: {
    kn: "ವರ ಮತ್ತು ವಧುವಿನ ಲಗ್ನ, ಚಂದ್ರ ರಾಶಿ, ನಕ್ಷತ್ರ ಹಾಗೂ ಪಾದ ಗಣನೆ...",
    en: "Computing Boy & Girl Lagna, Moon Sign, Nakshatra & Pada...",
    hi: "वर एवं वधू के लग्न, चंद्र राशि, नक्षत्र एवं चरण की गणना...",
    te: "వరుడు మరియు వధువు లగ్నం, రాశి, నక్షత్రం మరియు పాదం లెక్కింపు...",
    ta: "மணமகன் & மணமகளின் லக்னம், ராசி, நட்சத்திரம் மற்றும் பாதம் கணக்கீடு..."
  },
  step2: {
    kn: "೩೬ ಗುಣಗಳ ಅಷ್ಟಕೂಟ ಹಾಗೂ ದೋಷ ನಿವೃತ್ತಿ ನಿಯಮಗಳ ಪರಿಶೀಲನೆ...",
    en: "Evaluating 36-Point Ashta Kuta & Classical Dosha Cancellations...",
    hi: "36 गुणों के अष्टकूट एवं दोष परिहार नियमों का परीक्षण...",
    te: "36 గుణాల అష్టకూట మరియు దోష నివృత్తి నియమాల పరిశీలన...",
    ta: "36 குணங்கள் அஷ்டகூடம் மற்றும் தோஷ நிவர்த்தி விதிகள் ஆய்வு..."
  },
  step3: {
    kn: "ಕುಜ (ಮಾಂಗ್ಲಿಕ್) ದೋಷ, ಪಾಪ ಸಾಮ್ಯ ಹಾಗೂ ದಶಾ ಸಂಧಿ ಶೋಧನೆ...",
    en: "Analyzing Tri-Lagna Kuja Dosha, Papa Samya & Dasha Sandhi...",
    hi: "कुज (मांगलिक) दोष, पाप साम्य एवं दशा संधि विश्लेषण...",
    te: "కుజ (మాంగ్లిక్) దోషం, పాప సామ్యం మరియు దశా సంధి విశ్లేషణ...",
    ta: "செவ்வாய் தோஷம், பாப சாம்யம் மற்றும் தசா சந்தி ஆய்வு..."
  },
  step4: {
    kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕಲ್ಯಾಣ ಸೇವಾ ಆಶೀರ್ವಾದ ಹಾಗೂ ಮಹಾ ವರದಿ ಸಂಶ್ಲೇಷಣೆ...",
    en: "Synthesizing Gokarna Kshetra Kalyana Blessings & Royal Report...",
    hi: "श्री क्षेत्र गोकर्ण कल्याण सेवा आशीर्वाद एवं विस्तृत रिपोर्ट का निर्माण...",
    te: "శ్రీ క్షేత్ర గోకర్ణ కల్యాణ సేవా ఆశీర్వాదం & సమగ్ర నివేదిక రూపకల్పన...",
    ta: "ஸ்ரீ க்ஷேத்திர கோகர்ண கல்யாண சேவை ஆசீர்வாதம் & அறிக்கை உருவாக்கம்..."
  },

  // Tabs
  tabAshtakoota: {
    kn: "ಅಷ್ಟಕೂಟ ವಿವರಣೆ (36 ಗುಣ)",
    en: "Ashta Kuta (36 Pts)",
    hi: "अष्टकूट विवरण (36 गुण)",
    te: "అష్టకూట వివరణ (36 గుణాలు)",
    ta: "அஷ்டகூட விளக்கம் (36)"
  },
  tabDashakoota: {
    kn: "ದಶಕೂಟ & ರಜ್ಜು/ವೇಧ",
    en: "Dashakoota & Rajju/Vedha",
    hi: "दशकूट एवं रज्जु/वेध",
    te: "దశకూట & రజ్జు/వేధ",
    ta: "தசகூடம் & ரஜ்ஜு/வேதை"
  },
  tabKujaAndPapa: {
    kn: "ಕುಜ ದೋಷ & ಪಾಪ ಸಾಮ್ಯ",
    en: "Kuja Dosha & Papa Samya",
    hi: "कुज दोष एवं पाप साम्य",
    te: "కుజ దోషం & పాప సామ్యం",
    ta: "செவ்வாய் & பாப சாம்யம்"
  },
  tabDashaAndSeva: {
    kn: "ದಶಾ ಸಂಧಿ & ಗೋಕರ್ಣ ಸೇವೆಗಳು",
    en: "Dasha Sandhi & Gokarna Sevas",
    hi: "दशा संधि एवं गोकर्ण सेवाएं",
    te: "దశా సంధి & గోకర్ణ సేవలు",
    ta: "தசா சந்தி & கோகர்ண சேவைகள்"
  },

  // Score Banner & Verdicts
  scoreLabel: {
    kn: "ಒಟ್ಟು ಗುಣ ಮೇಳಾಪಕ ಅಂಕಗಳು",
    en: "Total Compatibility Score",
    hi: "कुल गुण मेलापक अंक",
    te: "మొత్తం గుణ మేళాపక మార్కులు",
    ta: "மொத்த பொருத்த மதிப்பெண்"
  },
  verdictExcellent: {
    kn: "ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ (ಉತ್ತಮ ದಾಂಪತ್ಯ ಯೋಗ - ನಿರ್ದೋಷ)",
    en: "Excellent Compatibility (Highly Auspicious Match)",
    hi: "उत्कृष्ट मिलान (अत्यंत शुभ वैवाहिक योग)",
    te: "అత్యుత్తమ పొంతన (చాలా శుభప్రదమైన దాంపత్యం)",
    ta: "மிகச்சிறந்த பொருத்தம் (மங்களகரமான இல்லறம்)"
  },
  verdictGood: {
    kn: "ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ (ಸುಖಮಯ ದಾಂಪತ್ಯ ಜೀವನ)",
    en: "Good Compatibility (Blissful & Prosperous)",
    hi: "उत्तम मिलान (सुखमय वैवाहिक जीवन)",
    te: "మంచి పొంతన (సుఖమయ దాంపత్య జీవితం)",
    ta: "நல்ல பொருத்தம் (மகிழ்ச்சியான வாழ்க்கை)"
  },
  verdictAverage: {
    kn: "ಮಧ್ಯಮ ಹೊಂದಾಣಿಕೆ (ಶಾಂತಿ ಪರಿಹಾರಗಳೊಂದಿಗೆ ವಿವಾಹ ಮಾಡಬಹುದು)",
    en: "Average Compatibility (Acceptable with Prescribed Remedies)",
    hi: "मध्यम मिलान (शांति अनुष्ठान उपरांत विवाह योग्य)",
    te: "మధ్యమ పొంతన (శాంతి పూజలతో వివాహం చేసుకోవచ్చు)",
    ta: "மத்தியம பொருத்தம் (பரிகாரங்களுடன் செய்யலாம்)"
  },
  verdictInauspicious: {
    kn: "ಅನುಚಿತ / ವರ್ಜ್ಯ ಹೊಂದಾಣಿಕೆ (ಗಂಭೀರ ದೋಷಗಳು ಕಂಡುಬಂದಿವೆ)",
    en: "Inauspicious / Major Afflictions Detected (Consult Priest)",
    hi: "अशुभ / वर्जित मिलान (गंभीर दोष उपस्थित - परामर्श आवश्यक)",
    te: "అశుభ పొంతన (తీవ్రమైన దోషాలు ఉన్నాయి)",
    ta: "பொருத்தமற்றது (தீவிர தோஷங்கள் உள்ளன)"
  },
  pdfDownloadBtn: {
    kn: "ವಿವಾಹ ಮೇಳಾಮೇಳಿ 3-ಪುಟಗಳ ಮಹಾ ವರದಿ (PDF ಡೌನ್‌ಲೋಡ್)",
    en: "Download 3-Page Vivaha Melameli PDF Report",
    hi: "3-पृष्ठीय विवाह मेलापक महा रिपोर्ट डाउनलोड करें",
    te: "3-పేజీల వివాహ మేళాపక మహా నివేదిక డౌన్‌లోడ్",
    ta: "3-பக்க திருமண பொருத்த PDF அறிக்கையை பதிவிறக்குக"
  },
  priestContact: {
    kn: "ಪ್ರಧಾನ ಅರ್ಚಕರು: ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ದೂರವಾಣಿ: +91 99723 39362)",
    en: "Chief Priest: Sri Shreeram Pandit (Phone: +91 99723 39362)",
    hi: "प्रधान अर्चक: श्री श्रीराम पंडित (फोन: +91 99723 39362)",
    te: "ప్రధాన అర్చకులు: శ్రీ శ్రీరామ్ పండిత్ (ఫోన్: +91 99723 39362)",
    ta: "தலைமை அர்ச்சகர்: ஸ்ரீ ஸ்ரீராம் பண்டிட் (தொலைபேசி: +91 99723 39362)"
  }
};

/**
 * Helper to fetch localized string
 */
export function getMelameliText(key: string, lang: MelameliLanguage = "kn"): string {
  const item = T_MELAMELI[key];
  if (!item) return key;
  return item[lang] || item.kn || item.en || key;
}
