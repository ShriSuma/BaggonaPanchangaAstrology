import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { AntarangaLang } from "../../features/hotelSecret/antarangaService";

export type AntarangaLoaderStage =
  | "language_init"       // Initializing selected language portal
  | "language_switch"     // Switching language
  | "antaranga_calc"      // Computing 8th & 12th house mysteries & subconscious secret
  | "package_switch"      // Updating astrological report package
  | "payment_init"        // Launching secure UPI payment gateway
  | "payment_verify"      // Verifying payment in Firebase Firestore ledger
  | "pdf_download_5year"  // Synthesizing 5-Year Master Destiny PDF
  | "pdf_download_kundli" // Assembling Baggona Janma Kundali Multi-Page PDF
  | "pdf_download_remedy" // Compiling Sacred Gokarna Remedy Dossier PDF
  | "pdf_download_all"    // Generating complete Vedic reports package
  | "table_qr_generate"   // Generating high-density dining table QR codes
  | "table_qr_pdf";       // Exporting restaurant table tent cards PDF

export interface AntarangaAstrologicalScreenLoaderProps {
  isOpen: boolean;
  stage: AntarangaLoaderStage;
  lang?: AntarangaLang;
  customTitle?: string;
  customMessage?: string;
  devoteeName?: string;
  progressPercent?: number;
}

interface StageTextConfig {
  title: string;
  subtitle: string;
  mantra: string;
  icon: string;
  badge: string;
  ringColor: string;
  badgeBg: string;
}

const STAGE_LOCALES: Record<AntarangaLoaderStage, Record<AntarangaLang, StageTextConfig>> = {
  language_init: {
    kn: {
      title: "✨ ದೈವಿಕ ಭಾಷಾ ಪ್ರವೇಶದ್ವಾರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
      subtitle: "ಕನ್ನಡದಲ್ಲಿ ಅಂತರಂಗದ ಸತ್ಯ ಹಾಗೂ ಕುಂಡಲಿ ಪೋರ್ಟಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ...",
      mantra: "॥ ಓಂ ಸರಸ್ವತ್ಯೈ ನಮಃ ॥",
      icon: "🌺",
      badge: "ಕನ್ನಡ",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-amber-800"
    },
    en: {
      title: "✨ Initializing Sacred Language Portal...",
      subtitle: "Opening the Antarangada Satya & Kundli gateway in English...",
      mantra: "॥ Om Saraswatyai Namah ॥",
      icon: "🌺",
      badge: "English",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-amber-800"
    },
    hi: {
      title: "✨ दिव्य भाषा पोर्टल का शुभारंभ...",
      subtitle: "हिन्दी में अंतरंग का सत्य एवं कुंडली पोर्टल प्रारंभ हो रहा है...",
      mantra: "॥ ॐ सरस्वत्यै नमः ॥",
      icon: "🌺",
      badge: "हिन्दी",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-amber-800"
    },
    te: {
      title: "✨ దైవిక భాషా ద్వారం సిద్ధమవుతోంది...",
      subtitle: "తెలుగులో అంతరంగ సత్యం & కుండలి ద్వారం తెరవబడుతోంది...",
      mantra: "॥ ఓం సరస్వత్యై నమః ॥",
      icon: "🌺",
      badge: "తెలుగు",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-amber-800"
    },
    ta: {
      title: "✨ தெய்வீக மொழி நுழைவாயில் தொடங்குகிறது...",
      subtitle: "தமிழில் அந்தரங்க உண்மை மற்றும் ஜாதக தளம் தொடங்குகிறது...",
      mantra: "॥ ஓம் சரஸ்வத்யை நமஹ ॥",
      icon: "🌺",
      badge: "தமிழ்",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-amber-800"
    },
    ml: {
      title: "✨ ദൈവിക ഭാഷാ കവാടം സജ്ജമാകുന്നു...",
      subtitle: "മലയാളത്തിൽ അന്തരംഗ സത്യവും കുണ്ഡലി പോർട്ടലും ആരംഭിക്കുന്നു...",
      mantra: "॥ ഓം സരസ്വത്യൈ നമഃ ॥",
      icon: "🌺",
      badge: "മലയാളം",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-amber-800"
    },
    mr: {
      title: "✨ दैवी भाषा प्रवेशद्वार सुरू होत आहे...",
      subtitle: "मराठीत अंतरंगाचे सत्य आणि कुंडली पोर्टल सुरू होत आहे...",
      mantra: "॥ ॐ सरस्वत्यै नमः ॥",
      icon: "🌺",
      badge: "मराठी",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-amber-800"
    }
  },
  language_switch: {
    kn: {
      title: "🔄 ಭಾಷೆ ಬದಲಾವಣೆಯಾಗುತ್ತಿದೆ...",
      subtitle: "ಆಯ್ದ ಭಾಷೆಗೆ ಸಂಪೂರ್ಣ ಫಲಾವಳಿಗಳು ರೂಪಾಂತರಗೊಳ್ಳುತ್ತಿವೆ...",
      mantra: "॥ ಓಂ ವಾಕ್ಯಾದೇವ್ಯೈ ನಮಃ ॥",
      icon: "🌐",
      badge: "ಭಾಷೆ",
      ringColor: "border-cyan-400",
      badgeBg: "from-cyan-600 to-blue-800"
    },
    en: {
      title: "🔄 Switching Language Environment...",
      subtitle: "Transforming all predictions and charts into selected locale...",
      mantra: "॥ Om Vakyadevyai Namah ॥",
      icon: "🌐",
      badge: "Language",
      ringColor: "border-cyan-400",
      badgeBg: "from-cyan-600 to-blue-800"
    },
    hi: {
      title: "🔄 भाषा परिवर्तन हो रहा है...",
      subtitle: "चयनित भाषा में संपूर्ण फलित एवं गणनाएं रूपांतरित हो रही हैं...",
      mantra: "॥ ॐ वाक्यदेव्यै नमः ॥",
      icon: "🌐",
      badge: "भाषा",
      ringColor: "border-cyan-400",
      badgeBg: "from-cyan-600 to-blue-800"
    },
    te: {
      title: "🔄 భాష మార్చబడుతోంది...",
      subtitle: "ఎంచుకున్న భాషలో ఫలితాలు మరియు వివరాలు మారుతున్నాయి...",
      mantra: "॥ ఓం వాక్యదేవ్యై నమః ॥",
      icon: "🌐",
      badge: "భాష",
      ringColor: "border-cyan-400",
      badgeBg: "from-cyan-600 to-blue-800"
    },
    ta: {
      title: "🔄 மொழி மாற்றப்படுகிறது...",
      subtitle: "தேர்ந்தெடுக்கப்பட்ட மொழியில் அனைத்தும் மாற்றியமைக்கப்படுகிறது...",
      mantra: "॥ ஓம் வாக்யதேவ்யை நமஹ ॥",
      icon: "🌐",
      badge: "மொழி",
      ringColor: "border-cyan-400",
      badgeBg: "from-cyan-600 to-blue-800"
    },
    ml: {
      title: "🔄 ഭാഷ മാറ്റുന്നു...",
      subtitle: "തിരഞ്ഞെടുത്ത ഭാഷയിലേക്ക് എല്ലാ വിവരങ്ങളും മാറ്റുന്നു...",
      mantra: "॥ ഓം വാക്യദേവ്യൈ നമഃ ॥",
      icon: "🌐",
      badge: "ഭാഷ",
      ringColor: "border-cyan-400",
      badgeBg: "from-cyan-600 to-blue-800"
    },
    mr: {
      title: "🔄 भाषा बदलत आहे...",
      subtitle: "निवडलेल्या भाषेत सर्व अंदाज आणि कुंडली रूपांतरित होत आहे...",
      mantra: "॥ ॐ वाक्यदेव्यै नमः ॥",
      icon: "🌐",
      badge: "भाषा",
      ringColor: "border-cyan-400",
      badgeBg: "from-cyan-600 to-blue-800"
    }
  },
  antaranga_calc: {
    kn: {
      title: "🔮 ಅಂತರಂಗದ ಸತ್ಯ ಹಾಗೂ ಕುಂಡಲಿ ರಹಸ್ಯ ಗಣನೆ...",
      subtitle: "೮ನೇ ಭಾವ (ನಿಗೂಢ ಮನಸ್ಸು), ೧೨ನೇ ಭಾವ (ಅಂತರಾತ್ಮ) ಹಾಗೂ ಚಂದ್ರನ ಅಧಿಪತಿಯ ರಹಸ್ಯ ತರಂಗಗಳ ವಿಶ್ಲೇಷಣೆಯಾಗುತ್ತಿದೆ...",
      mantra: "॥ ಓಂ ನಮಃ ಶಿವಾಯ ॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ",
      icon: "👁️",
      badge: "ಅಂತರಂಗ",
      ringColor: "border-purple-400",
      badgeBg: "from-purple-700 to-amber-700"
    },
    en: {
      title: "🔮 Deciphering Inner Secrets & Natal Mysteries...",
      subtitle: "Calculating 8th house subconscious depths, 12th house hidden karma, and planetary wavelengths...",
      mantra: "॥ Om Namah Shivaya ॥ Sri Kshetra Gokarna",
      icon: "👁️",
      badge: "Secret",
      ringColor: "border-purple-400",
      badgeBg: "from-purple-700 to-amber-700"
    },
    hi: {
      title: "🔮 अंतरंग का सत्य एवं गूढ़ कुंडली विश्लेषण...",
      subtitle: "अष्टम भाव (रहस्यमयी मन), द्वादश भाव (अदृश्य कर्म) एवं चंद्र-लग्न तरंगों की गहन गणना जारी है...",
      mantra: "॥ ॐ नमः शिवाय ॥ श्री क्षेत्र गोकर्ण",
      icon: "👁️",
      badge: "अंतरंग",
      ringColor: "border-purple-400",
      badgeBg: "from-purple-700 to-amber-700"
    },
    te: {
      title: "🔮 అంతరంగ సత్యం & రహస్య కుండలి విశ్లేషణ...",
      subtitle: "8వ భావ అంతర్గత రహస్యాలు, 12వ భావ కర్మ మరియు చంద్రుని మానసిక తరంగాల లెక్కింపు...",
      mantra: "॥ ఓం నమః శివాయ ॥ శ్రీ క్షేత్ర గోకర్ణ",
      icon: "👁️",
      badge: "అంతరంగం",
      ringColor: "border-purple-400",
      badgeBg: "from-purple-700 to-amber-700"
    },
    ta: {
      title: "🔮 அந்தரங்க உண்மை மற்றும் மறைமுக ஜாதக ரகசியங்கள்...",
      subtitle: "8ஆம் பாவக ஆழ்மன ரகசியங்கள், 12ஆம் பாவக கர்மா மற்றும் சந்திரனின் அதிர்வுகள் கணிக்கப்படுகிறது...",
      mantra: "॥ ஓம் நம சிவாய ॥ ஸ்ரீ க்ஷேத்ர கோகர்ணம்",
      icon: "👁️",
      badge: "ரகசியம்",
      ringColor: "border-purple-400",
      badgeBg: "from-purple-700 to-amber-700"
    },
    ml: {
      title: "🔮 അന്തരംഗ സത്യവും ആഴത്തിലുള്ള ജാതക രഹസ്യങ്ങളും...",
      subtitle: "8-ാം ഭാവ രഹസ്യങ്ങൾ, 12-ാം ഭാവ കർമ്മം, മനസ്സിന്റെ ആഴത്തിലുള്ള തരംഗങ്ങൾ ഗണിക്കുന്നു...",
      mantra: "॥ ഓം നമഃ ശിവായ ॥ ശ്രീ ക്ഷേത്ര ഗോകർണ്ണം",
      icon: "👁️",
      badge: "രഹസ്യം",
      ringColor: "border-purple-400",
      badgeBg: "from-purple-700 to-amber-700"
    },
    mr: {
      title: "🔮 अंतरंगाचे सत्य आणि गूढ कुंडली विश्लेषण...",
      subtitle: "अष्टम भाव (सुप्त मन), व्यय भाव (अदृश्य कर्म) आणि चंद्र-लग्न अधिपतींच्या गूढ लहरींची गणना...",
      mantra: "॥ ॐ नमः शिवाय ॥ श्री क्षेत्र गोकर्ण",
      icon: "👁️",
      badge: "अंतरंग",
      ringColor: "border-purple-400",
      badgeBg: "from-purple-700 to-amber-700"
    }
  },
  package_switch: {
    kn: {
      title: "💎 ವರದಿ ಪ್ಯಾಕೇಜ್ ನವೀಕರಣಗೊಳ್ಳುತ್ತಿದೆ...",
      subtitle: "ಆಯ್ದ ವರದಿಗಳು, ಪರಿಹಾರಗಳು ಮತ್ತು ಪಾವತಿ ವಿವರಗಳು ಸಿದ್ಧವಾಗುತ್ತಿವೆ...",
      mantra: "॥ ಶುಭಂ ಭವತು ॥",
      icon: "💎",
      badge: "ಪ್ಯಾಕೇಜ್",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-yellow-700"
    },
    en: {
      title: "💎 Updating Report Package...",
      subtitle: "Configuring report features, remedy add-ons, and payment details...",
      mantra: "॥ Shubham Bhavatu ॥",
      icon: "💎",
      badge: "Package",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-yellow-700"
    },
    hi: {
      title: "💎 रिपोर्ट पैकेज अद्यतन हो रहा है...",
      subtitle: "चयनित रिपोर्ट, उपाय एवं दक्षिणा विवरण तैयार हो रहे हैं...",
      mantra: "॥ शुभं भवतु ॥",
      icon: "💎",
      badge: "पैकेज",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-yellow-700"
    },
    te: {
      title: "💎 రిపోర్ట్ ప్యాకేజ్ నవీకరణ...",
      subtitle: "నివేదికలు, పరిహారాలు మరియు చెల్లింపు వివరాలు సిద్ధమవుతున్నాయి...",
      mantra: "॥ శుభం భవతు ॥",
      icon: "💎",
      badge: "ప్యాకేజ్",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-yellow-700"
    },
    ta: {
      title: "💎 அறிக்கை தொகுப்பு புதுப்பிக்கப்படுகிறது...",
      subtitle: "தேர்ந்தெடுக்கப்பட்ட அறிக்கைகள் மற்றும் கட்டண விபரங்கள் தயாராகின்றன...",
      mantra: "॥ சுபம் பவது ॥",
      icon: "💎",
      badge: "தொகுப்பு",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-yellow-700"
    },
    ml: {
      title: "💎 റിപ്പോർട്ട് പാക്കേജ് അപ്ഡേറ്റ് ചെയ്യുന്നു...",
      subtitle: "തിരഞ്ഞെടുത്ത റിപ്പോർട്ടുകളും പേയ്‌മെന്റ് വിവരങ്ങളും സജ്ജമാകുന്നു...",
      mantra: "॥ ശുഭം ഭവതു ॥",
      icon: "💎",
      badge: "പാക്കേജ്",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-yellow-700"
    },
    mr: {
      title: "💎 अहवाल पॅकेज अपडेट होत आहे...",
      subtitle: "निवडलेले अहवाल, उपाय आणि दक्षिणा तपशील संकलित होत आहेत...",
      mantra: "॥ शुभं भवतु ॥",
      icon: "💎",
      badge: "पॅकेज",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-yellow-700"
    }
  },
  payment_init: {
    kn: {
      title: "📲 UPI ಪಾವತಿ ಆ್ಯಪ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ...",
      subtitle: "PhonePe / Google Pay / Paytm ತೆರೆಯುತ್ತಿದೆ... ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...",
      mantra: "॥ ಓಂ ಶ್ರೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ ॥",
      icon: "🪙",
      badge: "UPI",
      ringColor: "border-emerald-400",
      badgeBg: "from-emerald-700 to-teal-800"
    },
    en: {
      title: "📲 Launching Secure UPI Payment App...",
      subtitle: "Opening PhonePe / Google Pay / Paytm... Please wait a moment...",
      mantra: "॥ Om Shreem Mahalakshmyai Namah ॥",
      icon: "🪙",
      badge: "UPI",
      ringColor: "border-emerald-400",
      badgeBg: "from-emerald-700 to-teal-800"
    },
    hi: {
      title: "📲 सुरक्षित UPI पेमेंट ऐप खोला जा रहा है...",
      subtitle: "PhonePe / Google Pay / Paytm खुल रहा है... कृपया प्रतीक्षा करें...",
      mantra: "॥ ॐ श्रीं महालक्ष्म्यै नमः ॥",
      icon: "🪙",
      badge: "UPI",
      ringColor: "border-emerald-400",
      badgeBg: "from-emerald-700 to-teal-800"
    },
    te: {
      title: "📲 UPI పేమెంట్ యాప్ తెరవబడుతోంది...",
      subtitle: "PhonePe / Google Pay / Paytm తెరుచుకుంటోంది... దయచేసి వేచి ఉండండి...",
      mantra: "॥ ఓం శ్రీం మహాలక్ష్మ్యై నమః ॥",
      icon: "🪙",
      badge: "UPI",
      ringColor: "border-emerald-400",
      badgeBg: "from-emerald-700 to-teal-800"
    },
    ta: {
      title: "📲 பாதுகாப்பான UPI கட்டண செயலி தொடங்குகிறது...",
      subtitle: "PhonePe / Google Pay / Paytm திறக்கப்படுகிறது... காத்திருக்கவும்...",
      mantra: "॥ ஓம் ஸ்ரீம் மஹாலக்ஷ்ம்யை நமஹ ॥",
      icon: "🪙",
      badge: "UPI",
      ringColor: "border-emerald-400",
      badgeBg: "from-emerald-700 to-teal-800"
    },
    ml: {
      title: "📲 UPI പേയ്‌മെന്റ് ആപ്പ് തുറക്കുന്നു...",
      subtitle: "PhonePe / Google Pay / Paytm തുറക്കുന്നു... ദയവായി കാത്തിരിക്കുക...",
      mantra: "॥ ഓം ശ്രീം മഹാലക്ഷ്മ്യൈ നമഃ ॥",
      icon: "🪙",
      badge: "UPI",
      ringColor: "border-emerald-400",
      badgeBg: "from-emerald-700 to-teal-800"
    },
    mr: {
      title: "📲 सुरक्षित UPI पेमेंट ॲप सुरू होत आहे...",
      subtitle: "PhonePe / Google Pay / Paytm उघडत आहे... कृपया प्रतीक्षा करा...",
      mantra: "॥ ॐ श्रीं महालक्ष्म्यै नमः ॥",
      icon: "🪙",
      badge: "UPI",
      ringColor: "border-emerald-400",
      badgeBg: "from-emerald-700 to-teal-800"
    }
  },
  payment_verify: {
    kn: {
      title: "🪙 ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪಾವತಿ ಪರಿಶೀಲನೆ...",
      subtitle: "ಫೈರ್‌ಬೇಸ್ ಡೇಟಾಬೇಸ್ ಮೂಲಕ ಪಾವತಿಯ ದೃಢೀಕರಣ ಹಾಗೂ ರಶೀದಿ ಪರಿಶೀಲನೆಯಾಗುತ್ತಿದೆ...",
      mantra: "॥ ಓಂ ಶ್ರೀಂ ಕ್ಲೀಂ ಧನದಾ ನಮಃ ॥",
      icon: "🔔",
      badge: "ದೃಢೀಕರಣ",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-emerald-800"
    },
    en: {
      title: "🪙 Verifying Sacred Temple Payment via Firebase...",
      subtitle: "Confirming transaction security, banking UTR ledger, and premium access unlocking...",
      mantra: "॥ Om Shreem Kleem Dhanda Namah ॥",
      icon: "🔔",
      badge: "Verifying",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-emerald-800"
    },
    hi: {
      title: "🪙 श्री क्षेत्र गोकर्ण दक्षिणा सत्यापन...",
      subtitle: "फायरबेस डेटाबेस द्वारा भुगतान रिकॉर्ड एवं बैंक पावती की पुष्टि हो रही है...",
      mantra: "॥ ॐ श्रीं क्लीं धनदाय नमः ॥",
      icon: "🔔",
      badge: "सत्यापन",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-emerald-800"
    },
    te: {
      title: "🪙 గోకర్ణ క్షేత్ర చెల్లింపు ధృవీకరణ...",
      subtitle: "ఫైర్‌బేస్ డేటాబేస్ ద్వారా బ్యాంకింగ్ లెడ్జర్ మరియు రసీదు నిర్ధారణ జరుగుతోంది...",
      mantra: "॥ ఓం శ్రీం క్లీం ధనదాయ నమః ॥",
      icon: "🔔",
      badge: "ధృవీకరణ",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-emerald-800"
    },
    ta: {
      title: "🪙 கோகர்ண புண்ணிய ஸ்தல கட்டண சரிபார்ப்பு...",
      subtitle: "ஃபயர்பேஸ் தரவுத்தளத்தில் உங்கள் பரிவர்த்தனை மற்றும் ரசீது சரிபார்க்கப்படுகிறது...",
      mantra: "॥ ஓம் ஸ்ரீம் க்லீம் தனதாய நமஹ ॥",
      icon: "🔔",
      badge: "சரிபார்ப்பு",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-emerald-800"
    },
    ml: {
      title: "🪙 ഗോകർണ്ണ പുണ്യ ക്ഷേത്ര ദക്ഷിണ സ്ഥിരീകരണം...",
      subtitle: "ഫയർബേസ് ഡാറ്റാബേസിൽ നിങ്ങളുടെ ഇടപാട് സുരക്ഷിതമായി പരിശോധിക്കുന്നു...",
      mantra: "॥ ഓം ശ്രീം ക്ലീം ധനദായ നമഃ ॥",
      icon: "🔔",
      badge: "സ്ഥിരീകരണം",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-emerald-800"
    },
    mr: {
      title: "🪙 श्री क्षेत्र गोकर्ण दक्षिणा पडताळणी...",
      subtitle: "फायरबेस डेटाबेस द्वारे व्यवहार आणि बँक पावतीची सुरक्षित पडताळणी सुरू आहे...",
      mantra: "॥ ॐ श्रीं क्लीं धनदाय नमः ॥",
      icon: "🔔",
      badge: "पडताळणी",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-emerald-800"
    }
  },
  pdf_download_5year: {
    kn: {
      title: "📜 ೫-ವರ್ಷಗಳ ಮಹಾ ಭವಿಷ್ಯ PDF ತಯಾರಾಗುತ್ತಿದೆ...",
      subtitle: "೨೦೨೬-೨೦೩೧ ವರೆಗಿನ ವಾರ್ಷಿಕ ಗೋಚಾರ, ದಶಾ ಸಂಧಿ, ವೃತ್ತಿ-ಧನ-ಆರೋಗ್ಯ ಫಲಾವಳಿಗಳು ಮುದ್ರಣಗೊಳ್ಳುತ್ತಿವೆ...",
      mantra: "॥ ಕಾಲಾಯ ನಮಃ ಕಾಲರೂಪಾಯ ನಮಃ ॥",
      icon: "📜",
      badge: "೫ ವರ್ಷ",
      ringColor: "border-indigo-400",
      badgeBg: "from-indigo-600 to-amber-700"
    },
    en: {
      title: "📜 Synthesizing 5-Year Master Destiny PDF...",
      subtitle: "Rendering annual transits, Dasha timeline, career, finance & health forecasts for 2026–2031...",
      mantra: "॥ Kalaya Namah Kalarupaya Namah ॥",
      icon: "📜",
      badge: "5-Year",
      ringColor: "border-indigo-400",
      badgeBg: "from-indigo-600 to-amber-700"
    },
    hi: {
      title: "📜 ५-वर्षीय महा भविष्य PDF तैयार हो रही है...",
      subtitle: "२०२६-२०३१ वार्षिक गोचर, दशा फल, आजीविका एवं स्वास्थ्य भविष्यवाणियां तैयार की जा रही हैं...",
      mantra: "॥ कालाय नमः कालरूपाय नमः ॥",
      icon: "📜",
      badge: "५ वर्ष",
      ringColor: "border-indigo-400",
      badgeBg: "from-indigo-600 to-amber-700"
    },
    te: {
      title: "📜 5-సంవత్సరాల మహా భవిష్యత్తు PDF సిద్ధమవుతోంది...",
      subtitle: "2026-2031 వార్షిక గోచార ఫలితాలు, దశా విశ్లేషణ మరియు సమగ్ర మార్గదర్శకత్వం...",
      mantra: "॥ కాలాయ నమః కాలరూపాయ నమః ॥",
      icon: "📜",
      badge: "5 సం.",
      ringColor: "border-indigo-400",
      badgeBg: "from-indigo-600 to-amber-700"
    },
    ta: {
      title: "📜 5-ஆண்டு மகா எதிர்கால பலன்கள் PDF தயாராகிறது...",
      subtitle: "2026-2031 ஆண்டு கோச்சார பலன்கள், தசா விபரங்கள் மற்றும் வாழ்க்கை வழிகாட்டுதல்...",
      mantra: "॥ காலாய நமஹ காலரூபாய நமஹ ॥",
      icon: "📜",
      badge: "5 ஆண்டு",
      ringColor: "border-indigo-400",
      badgeBg: "from-indigo-600 to-amber-700"
    },
    ml: {
      title: "📜 5-വർഷത്തെ മഹാ ഭവിഷ്യത്ത് PDF തയ്യാറാകുന്നു...",
      subtitle: "2026-2031 വാർഷിക ഗ്രഹസഞ്ചാരം, ദശാപഹാരങ്ങൾ, സമഗ്ര മാർഗ്ഗനിർദ്ദേശങ്ങൾ...",
      mantra: "॥ കാലായ നമഃ കാലരൂപായ നമഃ ॥",
      icon: "📜",
      badge: "5 വർഷം",
      ringColor: "border-indigo-400",
      badgeBg: "from-indigo-600 to-amber-700"
    },
    mr: {
      title: "📜 ५-वर्षीय महा भविष्य PDF तयार होत आहे...",
      subtitle: "२०२६-२०३१ वार्षिक गोचर, दशा फळे, व्यवसाय आणि आरोग्य मार्गदर्शन संकलित होत आहे...",
      mantra: "॥ कालाय नमः कालरूपाय नमः ॥",
      icon: "📜",
      badge: "५ वर्षे",
      ringColor: "border-indigo-400",
      badgeBg: "from-indigo-600 to-amber-700"
    }
  },
  pdf_download_kundli: {
    kn: {
      title: "🌟 ಬಗ್ಗೋಣ ಜನನ ಕುಂಡಲಿ PDF ರಚನೆಯಾಗುತ್ತಿದೆ...",
      subtitle: "ಪಂಚಾಂಗ ತತ್ತ್ವಗಳು, ನವಾಂಶ, ಮಾಂದಿ ಸ್ಥಾನ ಹಾಗೂ ಸಮಗ್ರ ಜಾತಕ ಚಕ್ರಗಳು ಜೋಡಣೆಯಾಗುತ್ತಿವೆ...",
      mantra: "॥ ಓಂ ಬ್ರಹ್ಮಣೇ ನಮಃ ॥ ಜನ್ಮ ಜಾತಕ",
      icon: "🪐",
      badge: "ಕುಂಡಲಿ",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-blue-800"
    },
    en: {
      title: "🌟 Assembling Baggona Janma Kundali Multi-Page PDF...",
      subtitle: "Compiling Panchanga vitals, Navamsha, Maandi chakra, and lifelong astrological charts...",
      mantra: "॥ Om Brahmane Namah ॥ Janma Kundali",
      icon: "🪐",
      badge: "Kundali",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-blue-800"
    },
    hi: {
      title: "🌟 बग्गोण जन्म कुंडली PDF संकलित हो रही है...",
      subtitle: "पंचांग तत्व, नवांश, मांदी स्थिति एवं समग्र जन्म चक्र तैयार किए जा रहे हैं...",
      mantra: "॥ ॐ ब्रह्मणे नमः ॥ जन्म कुंडली",
      icon: "🪐",
      badge: "कुंडली",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-blue-800"
    },
    te: {
      title: "🌟 బగ్గోణ జన్మ కుండలి PDF రూపొందించబడుతోంది...",
      subtitle: "పంచాంగ వివరాలు, నవాంశ, మాంది చక్రాలు మరియు సమగ్ర జాతకం...",
      mantra: "॥ ఓం బ్రహ్మణే నమః ॥ జన్మ కుండలి",
      icon: "🪐",
      badge: "కుండలి",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-blue-800"
    },
    ta: {
      title: "🌟 பக்ககோண ஜெனன ஜாதகம் PDF உருவாகிறது...",
      subtitle: "பஞ்சாங்க விபரங்கள், நவாம்சம், மாந்தி சக்கரங்கள் மற்றும் முழு ஜாதகம்...",
      mantra: "॥ ஓம் பிரம்மணே நமஹ ॥ ஜெனன ஜாதகம்",
      icon: "🪐",
      badge: "ஜாதகம்",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-blue-800"
    },
    ml: {
      title: "🌟 ബഗ്ഗോണ ജനന കുണ്ഡലി PDF നിർമ്മിക്കുന്നു...",
      subtitle: "പഞ്ചാംഗ തത്വങ്ങൾ, നവാംശം, മാന്തി സ്ഥാനം, സമഗ്ര ജാതക ചക്രങ്ങൾ...",
      mantra: "॥ ഓം ബ്രഹ്മണേ നമഃ ॥ ജനന കുണ്ഡലി",
      icon: "🪐",
      badge: "കുണ്ഡലി",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-blue-800"
    },
    mr: {
      title: "🌟 बग्गोण जन्म कुंडली PDF संकलित होत आहे...",
      subtitle: "पंचांग घटक, नवांश, मांदी चक्र आणि संपूर्ण जन्मपत्रिका संकलित होत आहे...",
      mantra: "॥ ॐ ब्रह्मणे नमः ॥ जन्म कुंडली",
      icon: "🪐",
      badge: "कुंडली",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-blue-800"
    }
  },
  pdf_download_remedy: {
    kn: {
      title: "🕉️ ಗೋಕರ್ಣ ದೈವಿಕ ಪರಿಹಾರ & ಜಪ ಮಂತ್ರ ಡಾಕ್ಯುಮೆಂಟ್...",
      subtitle: "ನಕ್ಷತ್ರ-ಗ್ರಹ ದೋಷ ನಿವಾರಣೆ, ಜಪ ಸಂಖ್ಯೆ, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸೇವಾ ಸಂಕಲ್ಪಗಳು ಸಿದ್ಧವಾಗುತ್ತಿವೆ...",
      mantra: "॥ ಓಂ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ ॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ",
      icon: "🪔",
      badge: "ಪರಿಹಾರ",
      ringColor: "border-rose-400",
      badgeBg: "from-rose-600 to-amber-700"
    },
    en: {
      title: "🕉️ Generating Sacred Gokarna Remedy Dossier PDF...",
      subtitle: "Formulating Nakshatra-Graha remedial rituals, Beeja Mantras, and temple Seva guidance...",
      mantra: "॥ Om Mahabaleshwaraya Namah ॥ Sri Kshetra Gokarna",
      icon: "🪔",
      badge: "Remedy",
      ringColor: "border-rose-400",
      badgeBg: "from-rose-600 to-amber-700"
    },
    hi: {
      title: "🕉️ गोकर्ण दैवीय उपाय एवं जप मंत्र दस्तावेज...",
      subtitle: "नक्षत्र-ग्रह दोष निवारण, बीज मंत्र जप एवं श्री क्षेत्र गोकर्ण सेवा संकल्प तैयार हो रहे हैं...",
      mantra: "॥ ॐ महाबलेश्वराय नमः ॥ श्री क्षेत्र गोकर्ण",
      icon: "🪔",
      badge: "उपाय",
      ringColor: "border-rose-400",
      badgeBg: "from-rose-600 to-amber-700"
    },
    te: {
      title: "🕉️ గోకర్ణ దైవిక పరిహారాలు & జప మంత్ర పత్రం...",
      subtitle: "నక్షత్ర-గ్రహ దోష నివారణ, బీజ మంత్రాలు మరియు క్షేత్ర సేవా సంకల్పాలు...",
      mantra: "॥ ఓం మహాబలేశ్వరాయ నమః ॥ శ్రీ క్షేత్ర గోకర్ణ",
      icon: "🪔",
      badge: "పరిహారం",
      ringColor: "border-rose-400",
      badgeBg: "from-rose-600 to-amber-700"
    },
    ta: {
      title: "🕉️ கோகர்ண தெய்வீக பரிகாரம் & ஜப மந்திர ஆவணம்...",
      subtitle: "நட்சத்திர-கிரக தோஷ நிவர்த்தி, பீஜ மந்திரங்கள் மற்றும் ஆலய சேவை வழிகாட்டுதல்...",
      mantra: "॥ ஓம் மஹாபலேஸ்வராய நமஹ ॥ ஸ்ரீ க்ஷேத்ர கோகர்ணம்",
      icon: "🪔",
      badge: "பரிகாரம்",
      ringColor: "border-rose-400",
      badgeBg: "from-rose-600 to-amber-700"
    },
    ml: {
      title: "🕉️ ഗോകർണ്ണ ദൈവിക പരിഹാര & ജപ മന്ത്ര രേഖ...",
      subtitle: "നക്ഷത്ര-ഗ്രഹ ദോഷ നിവാരണം, ബീജ മന്ത്രങ്ങൾ, ക്ഷേത്ര സേവാ നിർദ്ദേശങ്ങൾ...",
      mantra: "॥ ഓം മഹാബലേശ്വരായ നമഃ ॥ ശ്രീ ക്ഷേത്ര ഗോകർണ്ണം",
      icon: "🪔",
      badge: "പരിഹാരം",
      ringColor: "border-rose-400",
      badgeBg: "from-rose-600 to-amber-700"
    },
    mr: {
      title: "🕉️ गोकर्ण दैवी उपाय व जप मंत्र दस्तऐवज...",
      subtitle: "नक्षत्र-ग्रह दोष निवारण, बीज मंत्र आणि श्री क्षेत्र गोकर्ण सेवा संकल्प संकलित होत आहेत...",
      mantra: "॥ ॐ महाबलेश्वराय नमः ॥ श्री क्षेत्र गोकर्ण",
      icon: "🪔",
      badge: "उपाय",
      ringColor: "border-rose-400",
      badgeBg: "from-rose-600 to-amber-700"
    }
  },
  pdf_download_all: {
    kn: {
      title: "📦 ಸಂಪೂರ್ಣ ದೈವಿಕ PDF ಸಂಗ್ರಹ ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
      subtitle: "೫-ವರ್ಷಗಳ ಭವಿಷ್ಯ, ಜನನ ಕುಂಡಲಿ ಹಾಗೂ ಪರಿಹಾರಗಳು ಅನುಕ್ರಮವಾಗಿ ಸಿದ್ಧವಾಗುತ್ತಿವೆ...",
      mantra: "॥ ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು ॥",
      icon: "📚",
      badge: "ಸಮಗ್ರ PDF",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-purple-800"
    },
    en: {
      title: "📦 Bundling All Sacred Astrological PDFs...",
      subtitle: "Rendering and packaging 5-Year Destiny, Janma Kundali & Remedies directly to your device...",
      mantra: "॥ Sarve Janah Sukhino Bhavantu ॥",
      icon: "📚",
      badge: "Bundle",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-purple-800"
    },
    hi: {
      title: "📦 संपूर्ण वैदिक PDF संग्रह डाउनलोड हो रहा है...",
      subtitle: "५-वर्षीय भविष्य, जन्म कुंडली एवं दैवीय उपाय क्रमिक रूप से आपके मोबाइल पर सुरक्षित डाउनलोड हो रहे हैं...",
      mantra: "॥ सर्वे जनाः सुखिनो भवन्तु ॥",
      icon: "📚",
      badge: "समग्र PDF",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-purple-800"
    },
    te: {
      title: "📦 సమగ్ర వైదిక PDFల సేకరణ డౌన్‌లోడ్ అవుతోంది...",
      subtitle: "5-సంవత్సరాల భవిష్యత్తు, జన్మ కుండలి మరియు పరిహారాలు క్రమపద్ధతిలో సిద్ధమవుతున్నాయి...",
      mantra: "॥ సర్వే జనాః సుఖినో భవంతు ॥",
      icon: "📚",
      badge: "సమగ్రం",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-purple-800"
    },
    ta: {
      title: "📦 அனைத்து வேத ஜோதிட PDF தொகுப்பும் பதிவிறங்குகிறது...",
      subtitle: "5-ஆண்டு எதிர்காலம், ஜெனன ஜாதகம் மற்றும் பரிகாரங்கள் வரிசையாக உங்கள் சாதனத்தில் பதிவிறக்கம் செய்யப்படுகின்றன...",
      mantra: "॥ சர்வே ஜனாஃ சுகினோ பவந்து ॥",
      icon: "📚",
      badge: "தொகுப்பு",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-purple-800"
    },
    ml: {
      title: "📦 സമ്പൂർണ്ണ വേദ ജ്യോതിഷ PDF ശേഖരം ഡൗൺലോഡ് ചെയ്യുന്നു...",
      subtitle: "5-വർഷത്തെ ഭവിഷ്യത്ത്, ജനന കുണ്ഡലി, പരിഹാരങ്ങൾ എന്നിവ ക്രമമായി നിങ്ങളുടെ മൊബൈലിലേക്ക് ഡൗൺലോഡ് ആകുന്നു...",
      mantra: "॥ സർവ്വേ ജനാഃ സുഖിനോ ഭവന്തു ॥",
      icon: "📚",
      badge: "സമ്പൂർണ്ണം",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-purple-800"
    },
    mr: {
      title: "📦 संपूर्ण वैदिक PDF संग्रह डाउनलोड होत आहे...",
      subtitle: "५-वर्षीय भविष्य, जन्म कुंडली आणि दैवी उपाय आपल्या मोबाईलवर सुरक्षित डाउनलोड होत आहेत...",
      mantra: "॥ सर्वे जनाः सुखिनो भवन्तु ॥",
      icon: "📚",
      badge: "सर्व PDF",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-purple-800"
    }
  },
  table_qr_generate: {
    kn: {
      title: "📱 ಟೇಬಲ್ QR ಕೋಡ್‌ಗಳು ಸಿದ್ಧವಾಗುತ್ತಿವೆ...",
      subtitle: "ಪಂಡಿತ್ ಪ್ಯಾಲೆಟ್ ಹೊಟೇಲ್ ಟೇಬಲ್ ಕಾರ್ಡ್‌ಗಳ ಅಲ್ಗಾರಿದಮಿಕ್ ರಚನೆ ನಡೆಯುತ್ತಿದೆ...",
      mantra: "॥ ಶ್ರೀ ಶಾರದಾ ಪ್ರಸನ್ನ ॥",
      icon: "🏷️",
      badge: "QR ರಚನೆ",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-stone-800"
    },
    en: {
      title: "📱 Generating Dining Table QR Codes...",
      subtitle: "Encoding collision-free table URLs and branding for Pandit Palette...",
      mantra: "॥ Sri Sharada Prasanna ॥",
      icon: "🏷️",
      badge: "QR Engine",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-stone-800"
    },
    hi: {
      title: "📱 टेबल QR कोड तैयार हो रहे हैं...",
      subtitle: "पंडित पैलेट रेस्तरां के लिए उच्च गुणवत्ता वाले टेबल कार्ड बन रहे हैं...",
      mantra: "॥ श्री शारदा प्रसन्न ॥",
      icon: "🏷️",
      badge: "QR निर्माण",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-stone-800"
    },
    te: {
      title: "📱 టేబుల్ QR కోడ్‌లు సిద్ధమవుతున్నాయి...",
      subtitle: "పండిట్ పాలెట్ హోటల్ కోసం ప్రత్యేక టేబుల్ కార్డ్‌లు తయారవుతున్నాయి...",
      mantra: "॥ శ్రీ శారదా ప్రసన్న ॥",
      icon: "🏷️",
      badge: "QR సృష్టి",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-stone-800"
    },
    ta: {
      title: "📱 டேபிள் QR குறியீடுகள் தயாராகின்றன...",
      subtitle: "பண்டிட் பேலட் உணவகத்திற்கான டேபிள் கார்டுகள் உருவாக்கப்படுகின்றன...",
      mantra: "॥ ஸ்ரீ சாரதா பிரசன்ன ॥",
      icon: "🏷️",
      badge: "QR உருவாக்கம்",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-stone-800"
    },
    ml: {
      title: "📱 ടേബിൾ QR കോഡുകൾ നിർമ്മിക്കുന്നു...",
      subtitle: "പണ്ഡിറ്റ് പാലറ്റ് റെസ്റ്റോറന്റിനായി ടേബിൾ കാർഡുകൾ സജ്ജമാക്കുന്നു...",
      mantra: "॥ ശ്രീ ശാരദാ പ്രസന്ന ॥",
      icon: "🏷️",
      badge: "QR നിർമ്മാണം",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-stone-800"
    },
    mr: {
      title: "📱 टेबल QR कोड तयार होत आहेत...",
      subtitle: "पंडित पॅलेट रेस्टॉरंटसाठी टेबल कार्ड्स अल्गोरिदमद्वारे तयार होत आहेत...",
      mantra: "॥ श्री शारदा प्रसन्न ॥",
      icon: "🏷️",
      badge: "QR निर्मिती",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-stone-800"
    }
  },
  table_qr_pdf: {
    kn: {
      title: "🖨️ ಟೇಬಲ್ ಟೆಂಟ್ ಮುದ್ರಣ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
      subtitle: "ಎಲ್ಲಾ ಟೇಬಲ್‌ಗಳ ಹೈ-ರೆಸಲ್ಯೂಶನ್ A4 ಪ್ರಿಂಟ್ ಶೀಟ್‌ಗಳು ಸಂಕಲನಗೊಳ್ಳುತ್ತಿವೆ...",
      mantra: "॥ ಶುಭ ಲಾಭ ॥",
      icon: "📄",
      badge: "ಮುದ್ರಣ PDF",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-slate-800"
    },
    en: {
      title: "🖨️ Compiling Printable Table Tents PDF...",
      subtitle: "Generating press-ready A4 dining table inserts with scannable QR matrices...",
      mantra: "॥ Shubh Labh ॥",
      icon: "📄",
      badge: "Print PDF",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-slate-800"
    },
    hi: {
      title: "🖨️ टेबल टेंट प्रिंटेबल PDF संकलित हो रही है...",
      subtitle: "सभी टेबलों के लिए उच्च-रिज़ॉल्यूशन A4 प्रिंट शीट तैयार की जा रही हैं...",
      mantra: "॥ शुभ लाभ ॥",
      icon: "📄",
      badge: "प्रिंट PDF",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-slate-800"
    },
    te: {
      title: "🖨️ టేబుల్ టెంట్ ప్రింట్ PDF సిద్ధమవుతోంది...",
      subtitle: "అన్ని టేబుల్‌ల కోసం హై-రెజల్యూషన్ A4 ప్రింట్ షీట్‌లు రూపొందించబడుతున్నాయి...",
      mantra: "॥ శుభ లాభ ॥",
      icon: "📄",
      badge: "ప్రింట్ PDF",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-slate-800"
    },
    ta: {
      title: "🖨️ அச்சிடக்கூடிய டேபிள் கார்டுகள் PDF தயாராகிறது...",
      subtitle: "அனைத்து மேசைகளுக்கும் உயர் தெளிவுத்திறன் கொண்ட A4 தாள்கள் உருவாக்கப்படுகின்றன...",
      mantra: "॥ சுப லாபம் ॥",
      icon: "📄",
      badge: "அச்சு PDF",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-slate-800"
    },
    ml: {
      title: "🖨️ പ്രിന്റ് ചെയ്യാവുന്ന ടേബിൾ ടെന്റുകൾ PDF തയ്യാറാകുന്നു...",
      subtitle: "എല്ലാ മേശകൾക്കുമുള്ള A4 പ്രിന്റ് ഷീറ്റുകൾ തയ്യാറാക്കുന്നു...",
      mantra: "॥ ശുഭ ലാഭം ॥",
      icon: "📄",
      badge: "പ്രിന്റ് PDF",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-slate-800"
    },
    mr: {
      title: "🖨️ टेबल टेंट प्रिंटेबल PDF तयार होत आहे...",
      subtitle: "सर्व टेबलांसाठी हाय-रिझोल्यूशन A4 प्रिंट शीट्स संकलित केल्या जात आहेत...",
      mantra: "॥ शुभ लाभ ॥",
      icon: "📄",
      badge: "प्रिंट PDF",
      ringColor: "border-amber-400",
      badgeBg: "from-amber-600 to-slate-800"
    }
  }
};

const GRAHA_ICONS = [
  { icon: "☀️", name: "Surya", color: "text-amber-400" },
  { icon: "🌙", name: "Chandra", color: "text-slate-100" },
  { icon: "♂️", name: "Kuja", color: "text-red-400" },
  { icon: "☿", name: "Budha", color: "text-emerald-400" },
  { icon: "♃", name: "Guru", color: "text-yellow-300" },
  { icon: "♀", name: "Shukra", color: "text-pink-300" },
  { icon: "♄", name: "Shani", color: "text-blue-400" },
  { icon: "☊", name: "Rahu", color: "text-indigo-400" },
  { icon: "☋", name: "Ketu", color: "text-orange-400" }
];

export const AntarangaAstrologicalScreenLoader: React.FC<AntarangaAstrologicalScreenLoaderProps> = ({
  isOpen,
  stage,
  lang = "kn",
  customTitle,
  customMessage,
  devoteeName,
  progressPercent
}) => {
  const [pulseDegree, setPulseDegree] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPulseDegree((prev) => (prev + 30) % 360);
    }, 400);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const validLang: AntarangaLang = STAGE_LOCALES[stage]?.[lang] ? lang : "kn";
  const stageCfg = STAGE_LOCALES[stage]?.[validLang] || STAGE_LOCALES.antaranga_calc.kn;

  const title = customTitle || stageCfg.title;
  const subtitle = customMessage || stageCfg.subtitle;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999
      }}
      className="fixed inset-0 w-screen h-screen bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden m-0 select-none animate-fadeIn touch-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Vedic Astrological Processing"
    >
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-slate-950 via-amber-950/90 to-slate-950 text-amber-100 shadow-[0_0_70px_rgba(245,158,11,0.4)] max-w-sm sm:max-w-md w-full">
        {/* Divine Ambient Radial Glow Background */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Divine Mantra Ribbon */}
        <div className="mb-3 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 shadow-inner flex items-center gap-1.5">
          <span className="text-xs text-amber-400 animate-spin-slow">☸</span>
          <span className="text-[11px] sm:text-xs font-serif font-black tracking-wider text-amber-200">
            {stageCfg.mantra}
          </span>
          <span className="text-xs text-amber-400 animate-spin-slow">☸</span>
        </div>

        {/* Devotee Name (if provided) */}
        {devoteeName && (
          <div className="text-[11px] font-mono text-amber-300/80 mb-2 font-bold tracking-wide">
            ✦ {devoteeName} ✦
          </div>
        )}

        {/* Central Rotating Astrological Chakra Architecture */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center my-3">
          {/* Pulsing Outer Radiance Aura */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/40 animate-ping opacity-60" />

          {/* Counter-rotating Zodiac Geometry Orbit */}
          <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-amber-300/70 animate-spin-reverse" />

          {/* Rotating Zodiac Wheel with 12 Spoke Divisions */}
          <div className="absolute inset-4 rounded-full border-2 border-amber-500/80 animate-spin-slow">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(245, 158, 11, 0.35)" strokeWidth="1" />
              <polygon
                points="50,6 94,50 50,94 6,50"
                fill="none"
                stroke="rgba(251, 191, 36, 0.4)"
                strokeWidth="1"
              />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="50"
                  y1="3"
                  x2="50"
                  y2="14"
                  stroke="rgba(251, 191, 36, 0.8)"
                  strokeWidth="1.5"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </svg>
          </div>

          {/* Orbiting Navagraha Planets Glyphs */}
          <div className="absolute inset-0 animate-spin-slow">
            {GRAHA_ICONS.map((g, i) => {
              const angle = (i * 360) / GRAHA_ICONS.length;
              const rad = (angle * Math.PI) / 180;
              const radius = 68; // px offset from center
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;

              return (
                <div
                  key={g.name}
                  className="absolute flex items-center justify-center w-7 h-7 -ml-3.5 -mt-3.5 drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(${x}px, ${y}px)`
                  }}
                  title={g.name}
                >
                  <span className="text-sm sm:text-base select-none">{g.icon}</span>
                </div>
              );
            })}
          </div>

          {/* Central Sacred Golden Mandala Core */}
          <div
            className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr ${stageCfg.badgeBg} flex flex-col items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.6)] border-2 border-amber-200 animate-pulse-celestial`}
          >
            <span className="text-2xl sm:text-3xl filter drop-shadow select-none">
              {stageCfg.icon}
            </span>
            <span className="text-[10px] font-mono font-black tracking-widest text-amber-100 uppercase mt-0.5">
              {stageCfg.badge}
            </span>
          </div>
        </div>

        {/* Loading Title */}
        <h3 className="font-serif text-base sm:text-lg font-black text-amber-200 tracking-wide mb-2 leading-tight">
          {title}
        </h3>

        {/* Narrative Subtitle */}
        <p className="text-xs sm:text-sm text-amber-300/90 max-w-xs font-semibold leading-relaxed">
          {subtitle}
        </p>

        {/* Shimmer Gold Progress Bar */}
        <div className="w-full max-w-xs h-2 rounded-full bg-amber-950/90 border border-amber-500/50 overflow-hidden mt-4 relative">
          {progressPercent !== undefined ? (
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
            />
          ) : (
            <div className="h-full w-full shimmer-gold" />
          )}
        </div>

        {/* Percentage Indicator (if provided) */}
        {progressPercent !== undefined && (
          <div className="text-[11px] font-mono font-black text-amber-300 mt-1">
            {Math.round(progressPercent)}%
          </div>
        )}

        {/* Animated Bouncing Navaratna Jewels */}
        <div className="flex gap-2 mt-4">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "450ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "600ms" }} />
        </div>
      </div>
    </div>,
    document.body
  );
};
