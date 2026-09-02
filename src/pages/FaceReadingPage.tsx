import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Card from "../components/ui/Card";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import {
  executeFaceReading,
  askFaceReadingFollowUp,
  type FaceReadingResult
} from "../features/facereading/faceReadingEngine";
import { validateFaceImage } from "../features/facereading/faceValidator";
import { FaceFeaturesTab } from "../components/facereading/FaceFeaturesTab";
import { FaceChronologyTab } from "../components/facereading/FaceChronologyTab";
import { FaceMolesTab } from "../components/facereading/FaceMolesTab";
import { FaceReadingPdfTemplate } from "../components/facereading/FaceReadingPdfTemplate";
import { FaceScannerLoader } from "../components/facereading/FaceScannerLoader";
import { sanitizeAIText } from "../utils/textFormatter";
import { vimshottariBalanceAtBirth } from "../core/DashaBhuktiEngine";
import { PLANET_NAMES_L5 } from "../features/palmreading/samudrikaKnowledge";
import { PlanetName } from "../core/AstroTypes";

type ChatMessage = {
  id: string;
  sender: "user" | "priest";
  text: string;
  timestamp: string;
  result?: FaceReadingResult;
};

type ActiveTab = "reading" | "features" | "chronology" | "moles";

const FACE_PAGE_DICT: Record<string, Record<string, string>> = {
  sanctumTitle: {
    kn: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ॥",
    en: "॥ SRI GOKARNA MAHABALESHWARA SANCTUM ॥",
    hi: "॥ श्री गोकर्ण महाबलेश्वर सन्निधि ॥",
    te: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధి ॥",
    ta: "॥ ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி ॥"
  },
  headerTitle: {
    kn: "ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ",
    en: "Vedic Face Reading (Physiognomy)",
    hi: "वैदिक मुख सामुद्रिक शास्त्र",
    te: "వైదిక ముఖ సాముద్రిక శాస్త్రం",
    ta: "வேத முக சாமுத்ரிகா சாஸ்திரம்"
  },
  headerSubtitle: {
    kn: "ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು, ಕುಬೇರ ನಾಸಿಕ ಧನಯೋಗ, ಆಜ್ಞಾ ಚಕ್ರ ತೇಜಸ್ಸು ಹಾಗೂ ೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರದ ಪ್ರಾಚೀನ ಸಾಮುದ್ರಿಕ ಫಲ.",
    en: "Authentic Vedic Physiognomy: 7 Facial Features, Nose Bridge Wealth Vault, Ajna Chakra Tejas & 100-Year Life Chronology.",
    hi: "सप्त मुख लक्षण, कुबेर नासिका धन योग, आज्ञा चक्र तेज व 100-वर्षीय मुख कालचक्र का प्रामाणिक सामुद्रिक फलादेश।",
    te: "సప్త ముఖ లక్షణాలు, కుబేర నాసిక ధన యోగం, ఆజ్ఞా చక్ర వర్చస్సు & 100-సంవత్సరాల ముఖ కాలచక్ర ప్రామాణిక ఫలం.",
    ta: "ஏழு முக லட்சணங்கள், குபேர நாசிகா தன யோகம், ஆக்ஞா சக்கர தேஜஸ் & 100-ஆண்டு முக காலச்சக்கர வேத சாமுத்ரிகா பலன்."
  },
  devoteePlaceholder: {
    kn: "ಭಕ್ತರ ಹೆಸರು",
    en: "Devotee Name",
    hi: "जातक का नाम",
    te: "భక్తుల పేరు",
    ta: "பக்தர் பெயர்"
  },
  tabReading: {
    kn: "ಮುಖ ಸ್ಕ್ಯಾನರ್ & ಫಲ",
    en: "Face Scanner & Reading",
    hi: "मुख स्कैनर व फल",
    te: "ముఖ స్కానర్ & ఫలం",
    ta: "முக ஸ்கேனர் & பலன்"
  },
  tabFeatures: {
    kn: "ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು",
    en: "7 Facial Features",
    hi: "सप्त मुख लक्षण",
    te: "సప్త ముఖ లక్షణాలు",
    ta: "ஏழு முக லட்சணங்கள்"
  },
  tabChronology: {
    kn: "೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರ",
    en: "100-Year Age Map",
    hi: "100-वर्षीय मुख कालचक्र",
    te: "100-సంవత్సరాల ముఖ కాలచక్రం",
    ta: "100-ஆண்டு முக காலச்சக்கரம்"
  },
  tabMoles: {
    kn: "ಮಚ್ಚೆ ಶಾಸ್ತ್ರ & ಪರಿಹಾರ",
    en: "Moles & Remedies",
    hi: "तिल शास्त्र व उपाय",
    te: "మచ్చల శాస్త్రం & పరిహారాలు",
    ta: "மச்ச சாஸ்திரம் & பரிகாரங்கள்"
  },
  tabLockedHelp: {
    kn: "ಮುಖದ ಛಾಯಾಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಫಲಿತಾಂಶ ಪಡೆಯಿರಿ' ಕ್ಲಿಕ್ ಮಾಡಿದ ನಂತರ ಎಲ್ಲಾ ವಿಶ್ಲೇಷಣಾ ಟ್ಯಾಬ್‌ಗಳು ತೆರೆಯಲ್ಪಡುತ್ತವೆ.",
    en: "Upload your face photo and generate reading to unlock the 7 Features, 100-Year Age Map, and Moles analysis tabs.",
    hi: "अपनी मुख छवि अपलोड कर फलादेश प्राप्त करें, जिससे सप्त लक्षण, 100-वर्षीय कालचक्र व तिल शास्त्र टैब खुल जाएंगे।",
    te: "ముఖ చిత్రాన్ని అప్‌లోడ్ చేసి ఫలం పొందిన తరువాత సప్త లక్షణాలు, 100-సంవత్సరాల కాలచక్రం & మచ్చల ట్యాబ్‌లు అన్‌లాక్ అవుతాయి.",
    ta: "முக புகைப்படத்தை பதிவேற்றி பலன் பெற்றவுடன் ஏழு லட்சணங்கள், 100-ஆண்டு காலச்சக்கரம் மற்றும் மச்ச சாஸ்திர பகுதிகள் திறக்கப்படும்."
  },
  tabUnlockedSuccess: {
    kn: "ಮುಖ ಸಾಮುದ್ರಿಕ ಫಲ ಸಿದ್ಧವಾಗಿದೆ! ಮೇಲಿನ ಎಲ್ಲಾ ಟ್ಯಾಬ್‌ಗಳು ಈಗ ತೆರೆದಿವೆ (Unlocked).",
    en: "Face reading analysis is complete! All tabs above are now unlocked.",
    hi: "मुख सामुद्रिक फलादेश तैयार है! ऊपर के सभी टैब अब अनलॉक हैं।",
    te: "ముఖ సాముద్రిక ఫలం సిద్ధమైంది! పై అన్ని ట్యాబ్‌లు ఇప్పుడు అన్‌లాక్ చేయబడ్డాయి.",
    ta: "முக சாமுத்ரிகா பலன் தயார்! மேலே உள்ள அனைத்து பகுதிகளும் இப்போது திறக்கப்பட்டுள்ளன."
  },
  tabsActiveCount: {
    kn: "೪ / ೪ ಟ್ಯಾಬ್ ಸಕ್ರಿಯ",
    en: "4 / 4 Tabs Active",
    hi: "4 / 4 टैब सक्रिय",
    te: "4 / 4 ట్యాబ్‌లు సక్రియం",
    ta: "4 / 4 பகுதிகள் தயார்"
  },
  uploadTitle: {
    kn: "ಮುಖದ ಛಾಯಾಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಅಥವಾ ಕ್ಯಾಮೆರಾ",
    en: "Upload or Capture Front Face Photo",
    hi: "मुख छवि अपलोड अथवा कैमरा",
    te: "ముఖ చిత్రం అప్‌లోడ్ లేదా కెమెరా",
    ta: "முக புகைப்படம் பதிவேற்றம் அல்லது கேமரா"
  },
  uploadSubtitle: {
    kn: "ಉತ್ತಮ ಬೆಳಕಿನಲ್ಲಿ ನಿಮ್ಮ ಮುಖದ ಮುಂಭಾಗದ ಚಿತ್ರವನ್ನು ತೆಗೆಯಿರಿ. ಹಣೆ, ಕಣ್ಣುಗಳು, ಮೂಗು ಹಾಗೂ ಗಡ್ಡ ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣುವಂತೆ ಹಿಡಿಯಿರಿ.",
    en: "Capture or upload a clear, front-facing portrait photo in bright natural light with all facial features visible.",
    hi: "अच्छे प्रकाश में अपने मुख के सामने की छवि लें। ललाट, नेत्र, नासिका एवं चिबुक स्पष्ट रूप से दिखाई देने चाहिए।",
    te: "మంచి వెలుతురులో మీ ముఖం ముందు భాగాన్ని ఫోటో తీయండి. లలాటం, నేత్రాలు, నాసిక & చిబుకం స్పష్టంగా కనిపించాలి.",
    ta: "நல்ல வெளிச்சத்தில் உங்கள் முகத்தின் நேர் தோற்றத்தை படம் பிடிக்கவும். நெற்றி, கண்கள், மூக்கு மற்றும் தாடை தெளிவாக தெரிய வேண்டும்."
  },
  verifiedBadge: {
    kn: "✅ ೧೦೦% ಸಫಲ (ಪರಿಶೀಲಿತ)",
    en: "✅ 100% Authentic (Verified)",
    hi: "✅ 100% प्रामाणिक (सत्यापित)",
    te: "✅ 100% ప్రామాణికం (ధృవీకరించబడింది)",
    ta: "✅ 100% உண்மையானது (சரிபார்க்கப்பட்டது)"
  },
  takePhotoBtn: {
    kn: "ಕ್ಯಾಮೆರಾದಿಂದ ತೆಗೆಯಿರಿ",
    en: "Take Photo (Camera)",
    hi: "कैमरे से फोटो लें",
    te: "కెమెరాతో ఫోటో తీయండి",
    ta: "கேமராவில் படம் எடுக்கவும்"
  },
  uploadPhotoBtn: {
    kn: "ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    en: "Upload Face Photo",
    hi: "फोटो अपलोड करें",
    te: "ఫోటో అప్‌లోడ్ చేయండి",
    ta: "புகைப்படம் பதிவேற்றவும்"
  },
  validatingText: {
    kn: "ಮುಖದ ಚಿತ್ರದ ಗುಣಮಟ್ಟ & ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    en: "Validating facial clarity and features...",
    hi: "मुख छवि की गुणवत्ता व लक्षणों की जांच हो रही है...",
    te: "ముఖ చిత్ర నాణ్యత & లక్షణాలను పరిశీలిస్తున్నారు...",
    ta: "முக படத்தின் தெளிவு மற்றும் லட்சணங்கள் பரிசீலிக்கப்படுகின்றன..."
  },
  removePhoto: {
    kn: "ತೆಗೆದುಹಾಕಿ",
    en: "Remove",
    hi: "हटाएं",
    te: "తొలగించు",
    ta: "நீக்கு"
  },
  generateReadingBtn: {
    kn: "ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ ಫಲ ಪಡೆಯಿರಿ (Generate Face Reading)",
    en: "Generate Vedic Face Reading",
    hi: "वैदिक मुख सामुद्रिक फल प्राप्त करें",
    te: "వైదిక ముఖ సాముద్రిక ఫలం పొందండి",
    ta: "வேத முக சாமுத்ரிகா பலன் பெறுக"
  },
  chatTitle: {
    kn: "ಗೋಕರ್ಣ ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ ಸಂವಾದ",
    en: "Gokarna Face Reading Guidance & Chat",
    hi: "गोकर्ण मुख सामुद्रिक शास्त्र संवाद",
    te: "గోకర్ణ ముఖ సాముద్రిక శాస్త్ర సంవాదం",
    ta: "கோகர்ண முக சாமுத்ரிகா சாஸ்திர உரையாடல்"
  },
  tejasLabel: {
    kn: "ತೇಜಸ್ಸು:",
    en: "Tejas:",
    hi: "तेज:",
    te: "వర్చస్సు:",
    ta: "தேஜஸ்:"
  },
  ageLabel: {
    kn: "ವಯಸ್ಸು:",
    en: "Age:",
    hi: "आयु:",
    te: "వయస్సు:",
    ta: "வயது:"
  },
  yearsSuffix: {
    kn: "ವರ್ಷಗಳು",
    en: "Years",
    hi: "वर्ष",
    te: "సంవత్సరాలు",
    ta: "ஆண்டுகள்"
  },
  elementLabel: {
    kn: "ಪಂಚಭೂತ ತತ್ತ್ವ:",
    en: "Element Constitution:",
    hi: "पंचमहाभूत तत्व:",
    te: "పంచభూత తత్త్వం:",
    ta: "பஞ்சபூத தத்துவம்:"
  },
  doshaLabel: {
    kn: "ದೋಷ:",
    en: "Dosha:",
    hi: "दोष:",
    te: "దోషం:",
    ta: "தோஷம்:"
  },
  downloadPdf: {
    kn: "PDF ಡೌನ್‌ಲೋಡ್",
    en: "Download PDF",
    hi: "PDF डाउनलोड",
    te: "PDF డౌన్‌లోడ్",
    ta: "PDF பதிவிறக்கம்"
  },
  priestName: {
    kn: "🕉️ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗೋಕರ್ಣ ಮುಖ್ಯ ಅರ್ಚಕರು)",
    en: "🕉️ Sri Shreeram Pandit (Gokarna Priest)",
    hi: "🕉️ श्रीराम पंडित (गोकर्ण मुख्य अर्चक)",
    te: "🕉️ శ్రీరామ్ పండిట్ (గోకర్ణ ప్రధాన అర్చకులు)",
    ta: "🕉️ ஸ்ரீராம் பண்டிட் (கோகர்ண தலைமை அர்ச்சகர்)"
  },
  contoursHeading: {
    kn: "👁️ ಸಪ್ತ ಮುಖ ಲಕ್ಷಣ ವಿಶ್ಲೇಷಣೆ (7 Facial Contours):",
    en: "👁️ 7 Facial Contours Analysis:",
    hi: "👁️ सप्त मुख लक्षण विश्लेषण (7 Facial Contours):",
    te: "👁️ సప్త ముఖ లక్షణాల విశ్లేషణ (7 Facial Contours):",
    ta: "👁️ ஏழு முக லட்சண பகுப்பாய்வு (7 Facial Contours):"
  },
  guidanceHeading: {
    kn: "📜 ಪೂರ್ಣ ಮುಖ ಸಾಮುದ್ರಿಕ ಭವಿಷ್ಯ (Vedic Guidance):",
    en: "📜 Complete Vedic Face Reading Guidance:",
    hi: "📜 संपूर्ण मुख सामुद्रिक मार्गदर्शन (Vedic Guidance):",
    te: "📜 సంపూర్ణ ముఖ సాముద్రిక మార్గదర్శకత్వం:",
    ta: "📜 முழுமையான வேத முக சாமுத்ரிகா வழிகாட்டல்:"
  },
  remedyHeading: {
    kn: "🪔 ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ (Sacred Remedy):",
    en: "🪔 Sacred Gokarna Mahabaleshwara Remedy:",
    hi: "🪔 श्री गोकर्ण महाबलेश्वर दिव्य उपाय:",
    te: "🪔 శ్రీ గోకర్ణ మహాబలేశ్వర దివ్య పరిహారం:",
    ta: "🪔 ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் திவ்ய பரிகாரம்:"
  },
  inputPlaceholder: {
    kn: "ಮುಖ ಲಕ್ಷಣಗಳ ಕುರಿತು ಪೂರಕ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಅಥವಾ ಮೈಕ್ ಬಳಸಿ)...",
    en: "Ask a follow-up question regarding face reading (or use mic)...",
    hi: "मुख लक्षणों के बारे में अनुवर्ती प्रश्न पूछें (या माइक का उपयोग करें)...",
    te: "ముఖ లక్షణాల గురించి ప్రశ్న అడగండి (లేదా మైక్ ఉపయోగించండి)...",
    ta: "முக லட்சணங்கள் குறித்து தொடர் கேள்விகள் கேளுங்கள் (அல்லது மைக் பயன்படுத்தவும்)..."
  },
  voiceTitle: {
    kn: "ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ (Voice Input)",
    en: "Ask by voice (Voice Input)",
    hi: "ध्वनि द्वारा प्रश्न पूछें (Voice Input)",
    te: "ధ్వని ద్వారా అడగండి (Voice Input)",
    ta: "குரல் மூலம் கேட்கவும் (Voice Input)"
  },
  askBtn: {
    kn: "ಕೇಳಿ",
    en: "Ask",
    hi: "पूछें",
    te: "అడగండి",
    ta: "கேட்க"
  },
  tabLockedBadge: {
    kn: "ಲಾಕ್",
    en: "Locked",
    hi: "बंद",
    te: "లాక్",
    ta: "பூட்டு"
  }
};

function t(key: string, lang: string): string {
  return FACE_PAGE_DICT[key]?.[lang] || FACE_PAGE_DICT[key]?.kn || FACE_PAGE_DICT[key]?.en || "";
}

export default function FaceReadingPage(): JSX.Element {
  const selectedLang = useAppStore((state) => state.language) || "kn";
  const isKn = selectedLang === "kn";
  const geminiApiKey = useAppStore((state) => state.geminiApiKey) || "";

  const session = useKundliViewerStore((state) => state.session);

  // Devotee Name
  const [devoteeName, setDevoteeName] = useState<string>(() => {
    return session?.input?.name || (isKn ? "ಶ್ರೀಯುತ ಭಕ್ತರು" : "Devotee");
  });

  // State for Face Image & Validation
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean | null; message: string }>({
    isValid: null,
    message: ""
  });

  // Processing & Chat
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("reading");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeResult, setActiveResult] = useState<FaceReadingResult | null>(null);
  const [followUpInput, setFollowUpInput] = useState<string>("");
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Speech Recognition (Voice Input Mic for Follow-up Prashna)
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        selectedLang === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ (Voice Input) ಅನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಬರೆದು ಟೈಪ್ ಮಾಡಿ."
          : "Voice input is not supported in this browser. Please type your question."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang =
        selectedLang === "kn"
          ? "kn-IN"
          : selectedLang === "hi"
          ? "hi-IN"
          : selectedLang === "te"
          ? "te-IN"
          : selectedLang === "ta"
          ? "ta-IN"
          : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setFollowUpInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Face speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Refs for upload
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle Photo File Upload / Capture
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImageDataUrl(dataUrl);

      // Perform Real-Time Face Validation
      setIsValidating(true);
      setValidationResult({ isValid: null, message: isKn ? "ಮುಖದ ಚಿತ್ರ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "Validating face frame..." });

      try {
        const res = await validateFaceImage(dataUrl, geminiApiKey, selectedLang);
        setValidationResult({
          isValid: res.isValid,
          message: isKn ? res.messageKn : res.messageEn
        });
      } catch (err) {
        console.error("Validation error:", err);
        setValidationResult({
          isValid: true,
          message: isKn ? "ಮುಖದ ಚಿತ್ರ ಸ್ವೀಕೃತವಾಗಿದೆ." : "Face image accepted."
        });
      } finally {
        setIsValidating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute Face Reading
  const handleExecuteReading = async () => {
    if (!imageDataUrl) return;

    setIsProcessing(true);
    try {
      let attachedKundli: FaceReadingResult["kundliData"] = undefined;
      if (session?.result) {
        const k = session.result;
        const dashaBal = vimshottariBalanceAtBirth(k);
        const dashaPlanetName = String(dashaBal.lord);
        const dashaLord = PLANET_NAMES_L5[dashaPlanetName]?.[selectedLang] || PLANET_NAMES_L5[dashaPlanetName]?.kn || dashaPlanetName;
        const moonPos = k.planets.find((p) => p.name === PlanetName.Moon);

        attachedKundli = {
          lagna: k.lagnaRashi?.sanskrit || "ಮೇಷ",
          rashi: k.moonSign?.sanskrit || "ಮೇಷ",
          nakshatra: moonPos?.nakshatra?.sanskrit || "ಅಶ್ವಿನಿ",
          maandi: k.maandi?.rashi?.sanskrit || "ಧನಸ್ಸು",
          dasha: dashaLord
        };
      }

      const result = await executeFaceReading(
        imageDataUrl,
        devoteeName,
        selectedLang,
        geminiApiKey,
        attachedKundli
      );

      setActiveResult(result);
      const priestMsg: ChatMessage = {
        id: "priest-" + Date.now(),
        sender: "priest",
        text: result.aiPrediction,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        result
      };

      setMessages((prev) => [...prev, priestMsg]);
      setActiveTab("reading");
    } catch (err) {
      console.error("Face reading error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Follow-up question
  const handleSendFollowUp = async () => {
    if (!followUpInput.trim() || !activeResult || isAnswering) return;

    const userText = followUpInput.trim();
    setFollowUpInput("");

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAnswering(true);

    try {
      const answer = await askFaceReadingFollowUp(
        activeResult,
        userText,
        selectedLang,
        geminiApiKey
      );

      const priestMsg: ChatMessage = {
        id: "priest-ans-" + Date.now(),
        sender: "priest",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, priestMsg]);
    } catch (err) {
      console.error("Follow-up error:", err);
    } finally {
      setIsAnswering(false);
    }
  };

  // Download A4 Printable PDF Report
  const handleDownloadPdf = async () => {
    if (!activeResult || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const container = document.getElementById("face-reading-pdf-container") || document.getElementById("facereading-pdf-printable");
      if (!container) throw new Error("PDF container not found");

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFDF7"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const safeName = (devoteeName || "Devotee").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`Baggona_Face_Reading_${safeName}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Top Header Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl filter drop-shadow">👤</span>
            <div>
              <div className="text-[11px] font-extrabold tracking-widest text-amber-800 uppercase">
                {t("sanctumTitle", selectedLang)}
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-amber-950">
                {t("headerTitle", selectedLang)}
              </h1>
              <p className="text-xs text-amber-900/90 leading-relaxed font-medium mt-0.5">
                {t("headerSubtitle", selectedLang)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={devoteeName}
              onChange={(e) => setDevoteeName(e.target.value)}
              placeholder={t("devoteePlaceholder", selectedLang)}
              className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-950 focus:border-amber-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>
      </Card>

      {/* 4 Interactive Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-amber-300 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("reading")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
            activeTab === "reading"
              ? "bg-amber-800 text-amber-50 shadow"
              : "bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          <span>👤</span>
          <span>{t("tabReading", selectedLang)}</span>
        </button>

        <button
          type="button"
          disabled={!activeResult}
          onClick={() => activeResult && setActiveTab("features")}
          title={!activeResult ? t("tabLockedHelp", selectedLang) : ""}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
            activeTab === "features"
              ? "bg-amber-800 text-amber-50 shadow"
              : activeResult
              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
              : "bg-slate-100 text-slate-400 border border-dashed border-slate-300 opacity-60 cursor-not-allowed"
          }`}
        >
          <span>{activeResult ? "👁️" : "🔒"}</span>
          <span>{t("tabFeatures", selectedLang)}</span>
          {!activeResult && (
            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">
              {t("tabLockedBadge", selectedLang)}
            </span>
          )}
        </button>

        <button
          type="button"
          disabled={!activeResult}
          onClick={() => activeResult && setActiveTab("chronology")}
          title={!activeResult ? t("tabLockedHelp", selectedLang) : ""}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
            activeTab === "chronology"
              ? "bg-amber-800 text-amber-50 shadow"
              : activeResult
              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
              : "bg-slate-100 text-slate-400 border border-dashed border-slate-300 opacity-60 cursor-not-allowed"
          }`}
        >
          <span>{activeResult ? "⏳" : "🔒"}</span>
          <span>{t("tabChronology", selectedLang)}</span>
          {!activeResult && (
            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">
              {t("tabLockedBadge", selectedLang)}
            </span>
          )}
        </button>

        <button
          type="button"
          disabled={!activeResult}
          onClick={() => activeResult && setActiveTab("moles")}
          title={!activeResult ? t("tabLockedHelp", selectedLang) : ""}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
            activeTab === "moles"
              ? "bg-amber-800 text-amber-50 shadow"
              : activeResult
              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
              : "bg-slate-100 text-slate-400 border border-dashed border-slate-300 opacity-60 cursor-not-allowed"
          }`}
        >
          <span>{activeResult ? "🪔" : "🔒"}</span>
          <span>{t("tabMoles", selectedLang)}</span>
          {!activeResult && (
            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">
              {t("tabLockedBadge", selectedLang)}
            </span>
          )}
        </button>
      </div>

      {/* Helper Banner when tabs are locked */}
      {!activeResult && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs text-amber-900 flex items-center gap-2">
          <span>ℹ️</span>
          <span>{t("tabLockedHelp", selectedLang)}</span>
        </div>
      )}

      {/* Success Notification when results are generated and tabs unlocked */}
      {activeResult && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-3.5 py-2 text-xs text-emerald-900 flex items-center justify-between gap-2 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <span>✨</span>
            <span>{t("tabUnlockedSuccess", selectedLang)}</span>
          </div>
          <span className="text-[10px] bg-emerald-200 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full">
            {t("tabsActiveCount", selectedLang)}
          </span>
        </div>
      )}

      {/* TAB 1: Face Scanner & Reading */}
      {activeTab === "reading" && (
        <div className="space-y-6">
          {/* Capture / Upload & Sequential Validation Card */}
          <Card className="border-2 border-amber-300 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>📸</span>
                <span>{t("uploadTitle", selectedLang)}</span>
              </span>
              {validationResult.isValid === true && (
                <span className="text-xs bg-emerald-100 text-emerald-900 font-extrabold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1 shadow-sm">
                  {t("verifiedBadge", selectedLang)}
                </span>
              )}
            </div>

            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {t("uploadSubtitle", selectedLang)}
            </p>

            {/* Hidden File Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />

            {/* Upload / Camera Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 min-w-[140px] rounded-xl bg-amber-100 border border-amber-300 hover:bg-amber-200 py-2.5 text-xs font-bold text-amber-950 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>📸</span>
                <span>{t("takePhotoBtn", selectedLang)}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-w-[140px] rounded-xl bg-white border border-amber-300 hover:bg-amber-50 py-2.5 text-xs font-bold text-amber-950 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>📁</span>
                <span>{t("uploadPhotoBtn", selectedLang)}</span>
              </button>
            </div>

            {/* Validation Message Badge */}
            {isValidating && (
              <div className="rounded-xl border border-amber-300 bg-amber-100/70 p-3 text-xs text-amber-950 font-bold flex items-center gap-2 animate-pulse">
                <span>⌛</span>
                <span>{t("validatingText", selectedLang)}</span>
              </div>
            )}

            {!isValidating && validationResult.message && (
              <div
                className={`rounded-xl p-3 text-xs font-bold border flex items-center gap-2 ${
                  validationResult.isValid === true
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-rose-50 border-rose-300 text-rose-900"
                }`}
              >
                <span>{validationResult.isValid === true ? "✅" : "⚠️"}</span>
                <span>{validationResult.message}</span>
              </div>
            )}

            {/* Image Preview */}
            {imageDataUrl && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 max-w-sm mx-auto shadow-md">
                <img
                  src={imageDataUrl}
                  alt="Devotee Face"
                  className="w-full h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageDataUrl(null);
                    setValidationResult({ isValid: null, message: "" });
                  }}
                  className="absolute top-2 right-2 bg-rose-600 text-white text-[11px] px-2.5 py-1 rounded-lg font-bold shadow hover:bg-rose-700"
                >
                  {t("removePhoto", selectedLang)}
                </button>
              </div>
            )}

            {/* Generate Reading Button (Unlocked only when Valid) */}
            {imageDataUrl && validationResult.isValid === true && (
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecuteReading}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 py-3.5 text-sm font-extrabold text-amber-50 shadow-lg hover:from-amber-800 hover:to-amber-950 flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50"
                >
                  <span>🔮</span>
                  <span>{t("generateReadingBtn", selectedLang)}</span>
                </button>
              </div>
            )}
          </Card>

          {/* Full-Screen Animated Golden Face Scanner Overlay */}
          {isProcessing && <FaceScannerLoader lang={selectedLang} isKn={isKn} />}

          {/* Reading Results & Chat View */}
          {messages.length > 0 && (
            <Card className="border border-amber-300/80 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
                <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                  <span>💬</span>
                  <span>{t("chatTitle", selectedLang)}</span>
                </h3>
                {activeResult && (
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                      {t("tejasLabel", selectedLang)} {activeResult.overallTejasScore}% · {t("ageLabel", selectedLang)} ~{activeResult.estimatedAge} {t("yearsSuffix", selectedLang)}
                    </div>
                    <button
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={handleDownloadPdf}
                      className="rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <span>📥</span>
                      <span>{isGeneratingPdf ? "..." : t("downloadPdf", selectedLang)}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 mb-1 px-1">
                      <span>{msg.sender === "user" ? `👤 ${devoteeName}` : t("priestName", selectedLang)}</span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed max-w-[90%] shadow-sm ${
                        msg.sender === "user"
                          ? "bg-amber-800 text-amber-50 rounded-br-none"
                          : "bg-amber-50/90 border border-amber-300 text-amber-950 rounded-bl-none font-medium whitespace-pre-wrap"
                      }`}
                    >
                      {msg.result ? (
                        <div className="space-y-4">
                          {/* Verdict Banner */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-extrabold text-amber-950">
                                {msg.result.verdictTitle[selectedLang] || msg.result.verdictTitle.kn}
                              </div>
                              <div className="text-xs text-amber-800 font-semibold mt-0.5">
                                {t("elementLabel", selectedLang)}{" "}
                                <span className="font-bold text-amber-950">
                                  {msg.result.facialConstitution.primaryElement[selectedLang] || msg.result.facialConstitution.primaryElement.kn}
                                </span>{" "}
                                · {t("doshaLabel", selectedLang)}{" "}
                                <span className="font-bold text-amber-950">
                                  {msg.result.facialConstitution.ayurvedicDosha[selectedLang] || msg.result.facialConstitution.ayurvedicDosha.kn}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs font-black px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                              {t("tejasLabel", selectedLang)} {msg.result.overallTejasScore}%
                            </div>
                          </div>

                          {/* 7 Facial Features Summary Matrix */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                            <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                              {t("contoursHeading", selectedLang)}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {msg.result.features.map((f, i) => (
                                <div key={i} className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                                  <div className="font-bold text-amber-900">
                                    {f.name[selectedLang] || f.name.kn} ({f.planetaryRuler[selectedLang] || f.planetaryRuler.kn}):
                                  </div>
                                  <div className="text-amber-950">{f.vedicIndication[selectedLang] || f.vedicIndication.kn}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Detailed AI Prediction */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                            <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                              {t("guidanceHeading", selectedLang)}
                            </div>
                            <div className="text-xs text-amber-950 leading-relaxed font-medium">
                              {sanitizeAIText(msg.text)}
                            </div>
                          </div>

                          {/* Sacred Remedy */}
                          <div className="rounded-xl border border-amber-300 bg-amber-100/60 p-3.5 shadow-sm space-y-1">
                            <div className="text-xs font-bold text-amber-950">
                              {t("remedyHeading", selectedLang)}
                            </div>
                            <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                              {msg.result.remedyRecommendation[selectedLang] || msg.result.remedyRecommendation.kn}
                            </p>
                          </div>
                        </div>
                      ) : (
                        sanitizeAIText(msg.text)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Follow-up question input */}
              <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendFollowUp()}
                  placeholder={t("inputPlaceholder", selectedLang)}
                  className="flex-1 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-medium text-amber-950 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  title={t("voiceTitle", selectedLang)}
                  className={`p-2 rounded-xl border transition shadow-sm flex items-center justify-center ${
                    isListening
                      ? "bg-red-500 border-red-600 text-white animate-pulse"
                      : "bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200"
                  }`}
                >
                  <span className="text-sm">🎙️</span>
                </button>
                <button
                  type="button"
                  disabled={isAnswering || !followUpInput.trim()}
                  onClick={handleSendFollowUp}
                  className="rounded-xl bg-amber-800 px-5 py-2 text-xs font-bold text-white hover:bg-amber-900 disabled:opacity-50 shadow"
                >
                  {isAnswering ? "..." : t("askBtn", selectedLang)}
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: 7 Facial Features */}
      {activeTab === "features" && (
        <FaceFeaturesTab result={activeResult} features={activeResult?.features} lang={selectedLang} />
      )}

      {/* TAB 3: 100-Year Age Chronology Map */}
      {activeTab === "chronology" && (
        <FaceChronologyTab
          milestones={activeResult?.ageMilestones}
          lang={selectedLang}
          estimatedAge={activeResult?.estimatedAge}
        />
      )}

      {/* TAB 4: Moles & Remedies */}
      {activeTab === "moles" && (
        <FaceMolesTab moles={activeResult?.moles} lang={selectedLang} />
      )}

      {/* Hidden Container for PDF Export */}
      {activeResult && (
        <div id="face-reading-pdf-container" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <FaceReadingPdfTemplate
            result={activeResult}
            devoteeName={devoteeName}
            personName={devoteeName}
            lang={selectedLang}
            messages={messages}
          />
        </div>
      )}
    </div>
  );
}
