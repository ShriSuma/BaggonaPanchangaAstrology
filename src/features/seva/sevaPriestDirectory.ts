/**
 * Baggona Seva Priest Directory & Multi-Language Pooja Vidhi Master Registry
 * 
 * Provides:
 * 1. 7 Pre-defined Gokarna Priests + Dynamic Custom Priest Addition
 * 2. Dynamic seals/stamps, titles, and Benedictory Shlokas per Priest
 * 3. Structured Multi-Language (kn, en, hi, te, ta) Pooja Vidhi Details for all 13 Gokarna Sevas
 */

import type { L5 } from "./sevaLocale";
import { SEVA_CATALOG, type SevaId } from "../../data/gokarnaSevas";

export interface PriestProfile {
  id: string;
  name: L5;
  title: L5;
  sealText: L5;
  sealSymbol: string;
  sealColor: string;
  phone?: string;
  shloka: {
    sanskrit: string;
    meaningKn: string;
    meaningEn: string;
    meaningHi: string;
    meaningTe: string;
    meaningTa: string;
  };
  isCustom?: boolean;
}

export const PREDEFINED_PRIESTS: PriestProfile[] = [
  {
    id: "shreeram-pandit",
    name: {
      kn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      en: "Shreeram Pandit",
      hi: "श्रीराम पंडित",
      te: "శ్రీరామ్ పండితులు",
      ta: "ஸ்ரீராம் பண்டிதர்"
    },
    title: {
      kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು",
      en: "Gokarna Kshetra Chief Panchanga Archaka",
      hi: "गोकर्ण क्षेत्र प्रधान पंचांग अर्चक",
      te: "గోకర్ణ క్షేత్ర ప్రధాన పంచాంగ అర్చకులు",
      ta: "கோகர்ண க்ஷேத்திர முதன்மை பஞ்சாங்க அர்ச்சகர்"
    },
    sealText: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಅಧಿಕೃತ ಮುದ್ರೆ",
      en: "Sri Mahabaleshwara Sanctum Official Seal",
      hi: "श्री महाबलेश्वर सन्निधि आधिकारिक मुद्रा",
      te: "శ్రీ మహాబలేశ్వర సన్నిధి అధికారిక ముద్ర",
      ta: "ஸ்ரீ மகாபலேஸ்வரர் சன்னதி அதிகாரப்பூர்வ முத்திரை"
    },
    sealSymbol: "🕉️",
    sealColor: "#D4AF37",
    shloka: {
      sanskrit: "ॐ ತ್ರಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ | ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ||",
      meaningKn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ನೇತೃತ್ವದಲ್ಲಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಿಂದ ಸಕಲ ಭಕ್ತರಿಗೂ ಸುಖ, ಶಾಂತಿ, ಆಯುರಾರೋಗ್ಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
      meaningEn: "Under the guidance of Shreeram Pandit from Gokarna Mahabaleshwara Sanctum, may all devotees be blessed with peace, longevity, and health.",
      meaningHi: "श्रीराम पंडित जी के सानिध्य में गोकर्ण महाबलेश्वर क्षेत्र से सभी भक्तों को सुख, शांति व आरोग्य प्राप्त हो।",
      meaningTe: "శ్రీరామ్ పండితులు గారి ఆధ్వర్యంలో గోకర్ణ క్షేత్రం నుండి భక్తులందరికీ ఆయురారోగ్యాలు, సుఖశాంతులు కలుగుగాక.",
      meaningTa: "ஸ்ரீராம் பண்டிதர் அவர்களின் தலைமையில் கோகர்ண க்ஷேத்திரத்திலிருந்து அனைத்து பக்தர்களுக்கும் சுகமும் ஆரோக்கியமும் பெருகட்டும்."
    }
  },
  {
    id: "chaitanya-pandit",
    name: {
      kn: "ಚೈತನ್ಯ ಪಂಡಿತ್",
      en: "Chaitanya Pandit",
      hi: "चैतन्य पंडित",
      te: "చైతన్య పండిత్",
      ta: "சைதன்யா பண்டிட்"
    },
    title: {
      kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರು",
      en: "Gokarna Kshetra Chief Archaka",
      hi: "गोकर्ण क्षेत्र प्रधान अर्चक",
      te: "గోకర్ణ క్షేత్ర ప్రధాన అర్చకులు",
      ta: "கோகர்ண க்ஷேத்திர முதன்மை அர்ச்சகர்"
    },
    sealText: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಅಧಿಕೃತ ಮುದ್ರೆ",
      en: "Sri Mahabaleshwara Sanctum Official Seal",
      hi: "श्री महाबलेश्वर सन्निधि आधिकारिक मुद्रा",
      te: "శ్రీ మహాబలేశ్వర సన్నిధి అధికారిక ముద్ర",
      ta: "ஸ்ரீ மகாபலேஸ்வரர் சன்னதி அதிகாரப்பூர்வ முத்திரை"
    },
    sealSymbol: "🕉️",
    sealColor: "#D4AF37",
    shloka: {
      sanskrit: "ॐ ತ್ರಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ | ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ||",
      meaningKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಕೃಪೆಯಿಂದ ಸಕಲ ಭಕ್ತರಿಗೂ ದೀರ್ಘಾಯುಷ್ಯ, ಆಯುರಾರೋಗ್ಯ ಮತ್ತು ಮೃತ್ಯುಂಜಯ ರಕ್ಷೆ ದೊರೆಯಲಿ.",
      meaningEn: "By the grace of Lord Gokarna Mahabaleshwara, may all devotees be blessed with longevity, health, and protection.",
      meaningHi: "भगवान गोकर्ण महाबलेश्वर की कृपा से सभी भक्तों को दीर्घायु, उत्तम स्वास्थ्य और सुरक्षा प्राप्त हो।",
      meaningTe: "గోకర్ణ మహాబలేశ్వరుని కృపతో భక్తులందరికీ ఆయురారోగ్యాలు, క్షేమం లభించుగాక.",
      meaningTa: "கோகர்ண மகாபலேஸ்வரரின் அருளால் அனைத்து பக்தர்களுக்கும் நீண்ட ஆயுளும் ஆரோக்கியமும் கிடைப்பதாக."
    }
  },
  {
    id: "dileep-shadakshari",
    name: {
      kn: "ದಿಲೀಪ್ ಶಡಕ್ಷರಿ",
      en: "Dileep Shadakshari",
      hi: "दिलीप षडक्षरी",
      te: "దిలీప్ షడక్షరి",
      ta: "திலீப் ஷடக்ஷரி"
    },
    title: {
      kn: "ಷಡಕ್ಷರೀ ವೇದಪೀಠ ಪ್ರಧಾನ ಅರ್ಚಕರು",
      en: "Shadakshari Veda Peetha Chief Priest",
      hi: "षडक्षरी वेदपीठ प्रधान अर्चक",
      te: "షడక్షరీ వేదపీఠ ప్రధాన అర్చకులు",
      ta: "ஷடக்ஷரி வேதபீட முதன்மை அர்ச்சகர்"
    },
    sealText: {
      kn: "ಷಡಕ್ಷರೀ ಶಿವಪೀಠ ದಿವ್ಯ ಮುದ್ರೆ",
      en: "Shadakshari Shiva Peetha Divine Seal",
      hi: "षडक्षरी शिवपीठ दिव्य मुद्रा",
      te: "షడక్షరీ శివపీఠ దివ్య ముద్ర",
      ta: "ஷடக்ஷரி சிவபீட திவ்ய முத்திரை"
    },
    sealSymbol: "🔱",
    sealColor: "#B91C1C",
    shloka: {
      sanskrit: "ॐ ನಮಃ ಶಿವಾಯ ಶಾಂ ತಾಯ ಪಂಚಪಾತಕನಾಶಿನೇ | ನಮಾಮಿ ಶಿವಮೇಕಾನಂದಂ ಶಾಶ್ವತಂ ಪಾಲಕಂ ಪ್ರಭುಮ್ ||",
      meaningKn: "ಷಡಕ್ಷರಿ ಮಂತ್ರದ ಪ್ರಭಾವದಿಂದ ಪಾಪಗಳೆಲ್ಲವೂ ನಾಶವಾಗಿ ಸಕಲ ಶ್ರೇಯಸ್ಸು ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
      meaningEn: "Through the sacred Shadakshari mantra, may all sins be dissolved and eternal peace granted.",
      meaningHi: "षडक्षरी मंत्र के प्रभाव से समस्त पापों का नाश हो और शाश्वत शांति प्राप्त हो।",
      meaningTe: "షడక్షరీ మంత్ర ప్రభావంతో సమస్త పాపాలు తొలగి శాశ్వత ఆనందం కలుగుగాక.",
      meaningTa: "ஷடக்ஷரி மந்திரத்தின் மகிமையால் பாவங்கள் நீங்கி நித்திய அமைதி உண்டாகட்டும்."
    }
  },
  {
    id: "ganapati-marigodi",
    name: {
      kn: "ಗಣಪತಿ ಮಾರಿಗೋಡಿ",
      en: "Ganapati Marigodi",
      hi: "गणपति मारिगोडी",
      te: "గణపతి మారిగోడి",
      ta: "கணபதி மரிகோடி"
    },
    title: {
      kn: "ಮಾರಿಗೋಡಿ ಸನ್ನಿಧಿ ಹಿರಿಯ ಅರ್ಚಕರು",
      en: "Marigodi Sanctum Senior Archaka",
      hi: "मारिगोडी सन्निधि वरिष्ठ अर्चक",
      te: "మారిగోడి సన్నిధి విధి అర్చకులు",
      ta: "மரிகோடி சன்னதி மூத்த அர்ச்சகர்"
    },
    sealText: {
      kn: "ಶ್ರೀ ಸಿದ್ಧಿ ವಿನಾಯಕ ಮಾರಿಗೋಡಿ ಪ್ರಸಾದ ಮುದ್ರೆ",
      en: "Sri Siddhi Vinayaka Marigodi Prasada Seal",
      hi: "श्री सिद्धि विनायक मारिगोडी प्रसाद मुद्रा",
      te: "శ్రీ సిద్ధి వినాయక మారిగోడి ప్రసాద ముద్ర",
      ta: "ஸ்ரீ சித்தி விநாயக மரிகோடி பிரசாத முத்திரை"
    },
    sealSymbol: "🚩",
    sealColor: "#C2410C",
    shloka: {
      sanskrit: "ವಕ್ರತುಂಡ ಮಹಾಕಾಯ ಸೂರ್ಯಕೋಟಿ ಸಮಪ್ರಭ | ನಿರ್ವಿಘ್ನಂ ಕುರು ಮೇ ದೇವ ಸರ್ವಕಾರ್ಯೇಷು ಸರ್ವದಾ ||",
      meaningKn: "ವಿಘ್ನವಿನಾಶಕ ಶ್ರೀ ಗಣಪತಿಯ ಕೃಪೆಯಿಂದ ಸಕಲ ಶುಭ ಕಾರ್ಯಗಳ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗಲಿ.",
      meaningEn: "May Lord Ganesha remove all obstacles and bless every endeavor with supreme success.",
      meaningHi: "विघ्नहर्ता श्री गणेश की कृपा से आपके सभी कार्यों के विघ्न दूर हों।",
      meaningTe: "విఘ్ననాశకుడు శ్రీ గణపతి కృపతో అన్ని శుభకార్యాలు దిగ్విజయంగా పూర్తికావాలి.",
      meaningTa: "விக்ன விநாயகரின் அருளால் காரியத் தடைகள் அனைத்தும் விலகி வெற்றி உண்டாகட்டும்."
    }
  },
  {
    id: "ganapati-uppunda",
    name: {
      kn: "ಗಣಪತಿ ಉಪ್ಪುಂದ",
      en: "Ganapati Uppunda",
      hi: "गणपति उप्पुंडा",
      te: "గణపతి ఉప్పుండా",
      ta: "கணபதி உப்புண்டா"
    },
    title: {
      kn: "ಉಪ್ಪುಂದ ಕ್ಷೇತ್ರ ವೈದಿಕ ಪಂಡಿತರು",
      en: "Uppunda Kshetra Vaidika Scholar",
      hi: "उप्पुंडा क्षेत्र वैदिक पंडित",
      te: "ఉప్పుండా క్షేత్ర వైదిక పండితులు",
      ta: "உப்புண்டா க்ஷேத்திர வைதிக பண்டிதர்"
    },
    sealText: {
      kn: "ಉಪ್ಪುಂದ ವೈದಿಕ ಸಭಾ ಅನುಗ್ರಹ ಮುದ್ರೆ",
      en: "Uppunda Vaidika Sabha Blessing Seal",
      hi: "उप्पुंडा वैदिक सभा अनुग्रह मुद्रा",
      te: "ఉప్పుండా వైదిక సభా అనుగ్రహ ముద్ర",
      ta: "உப்புண்டா வைதிக சபா அனுக்ரஹ முத்திரை"
    },
    sealSymbol: "🔔",
    sealColor: "#7C2D12",
    shloka: {
      sanskrit: "ಗಜಾನನಂ ಭೂತಗಣಾದಿ ಸೇವಿತಂ ಕಪಿತ್ಥ ಜಂಬೂಫಲ ಸಾರಭಕ್ಷಿತಮ್ | ಉಮಾಸುತಂ ಶೋಕವಿನಾಶಕಾರಣಂ ನಮಾಮಿ ವಿಘ್ನೇಶ್ವರ ಪಾದಪಂಕಜಮ್ ||",
      meaningKn: "ಶ್ರೀ ಗಣಪತಿ ಉಪ್ಪುಂದ ಅರ್ಚಕರ ಪ್ರಾರ್ಥನೆಯಿಂದ ನಿಮ್ಮ ಕುಲಕ್ಕೆ ಸಕಲ ಕಲ್ಯಾಣವೂ ಶೋಕನಾಶವೂ ಸಿಗಲಿ.",
      meaningEn: "With prayers from Uppunda Archaka, may peace and prosperity envelope your family.",
      meaningHi: "उप्पुंडा अर्चक की प्रार्थना से आपके कुल में सुख, शांति और समृद्धि का वास हो।",
      meaningTe: "ఉప్పుండా అర్చకుల ప్రార్థనలతో మీ కుటుంబానికి సకల శుభాలు కలుగుగాక.",
      meaningTa: "உப்புண்டா அர்ச்சகரின் பிரார்த்தனையால் உங்கள் குடும்பத்தில் மங்களம் நிலைக்கட்டும்."
    }
  },
  {
    id: "parameshwar-jambe",
    name: {
      kn: "ಪರಮೇಶ್ವರ ಜಂಬೆ",
      en: "Parameshwar Jambe",
      hi: "परमेश्वर जंबे",
      te: "పరమేశ్వర జంబె",
      ta: "பரமேஸ்வர ஜம்பே"
    },
    title: {
      kn: "ಜಂಬೆ ವೈದಿಕ ವೇದ ಶಾಸ್ತ್ರೀ",
      en: "Jambe Vaidika Veda Shastri",
      hi: "जंबे वैदिक वेद शास्त्री",
      te: "జంబె వైదిక వేద శాస్త్రి",
      ta: "ஜம்பே வைதிக வேத சாஸ்திரி"
    },
    sealText: {
      kn: "ಶ್ರೀ ಮಹಾರುದ್ರ ಜಂಬೆ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
      en: "Sri Maharudra Jambe Sanctum Seal",
      hi: "श्री महारुद्र जंबे सन्निधि मुद्रा",
      te: "శ్రీ మహారుద్ర జంబె సన్నిధి ముద్ర",
      ta: "ஸ்ரீ மகாரூத்ர ஜம்பே சன்னதி முத்திரை"
    },
    sealSymbol: "🌸",
    sealColor: "#047857",
    shloka: {
      sanskrit: "ನಮಸ್ತೇ ಅಸ್ತು ಭಗವನ್ ವಿಶ್ವೇಶ್ವರಾಯ ಮಹಾದೇವಾಯ ತ್ರಯಂಬಕಾಯ ತ್ರಿಪುರಾಂತಕಾಯ ತ್ರಿಕಾಗ್ನಿಕಾಲಾಯ ಕಾಲಾಗ್ನಿರುದ್ರಾಯ ನೀಲಕಂಠಾಯ ಮೃತ್ಯುಂಜಯಾಯ ಮಹಾದೇವಾಯ ನಮಃ ||",
      meaningKn: "ಪರಮೇಶ್ವರ ಜಂಬೆ ಅವರ ನೇತೃತ್ವದ ರುದ್ರಾಭಿಷೇಕದ ಫಲವಾಗಿ ನಿಮ್ಮ ಸಂಸಾರಕ್ಕೆ ಆಯುರಾರೋಗ್ಯ ಸೌಭಾಗ್ಯ ದೊರೆಯಲಿ.",
      meaningEn: "Through the Maharudra Seva conducted by Parameshwar Jambe, may abundant divine protection be yours.",
      meaningHi: "परमेश्वर जंबे के सानिध्य में संपन्न महारुद्र सेवा से आपके परिवार को दिव्य सुरक्षा मिले।",
      meaningTe: "పరమేశ్వర జంబె గారి ఆధ్వర్యంలో జరిగిన రుద్రాభిషేక ఫలంగా మీ కుటుంబానికి ఆయురారోగ్యాలు సిద్ధించుగాక.",
      meaningTa: "பரமேஸ்வர ஜம்பே நடத்திய ருத்ராபிஷேக பலனால் உங்கள் குடும்பத்திற்கு தீர்க்காயுள் உண்டாகட்டும்."
    }
  },
  {
    id: "ravi-jambe",
    name: {
      kn: "ರವಿ ಜಂಬೆ",
      en: "Ravi Jambe",
      hi: "रवि जंबे",
      te: "ರವಿ ಜಂಬೆ",
      ta: "ரவி ஜம்பே"
    },
    title: {
      kn: "ಜಂಬೆ ಜ್ಯೋತಿಷ್ಯ ಸನ್ನಿಧಿ ಅರ್ಚಕರು",
      en: "Jambe Jyotishya Sanctum Priest",
      hi: "जंबे ज्योतिष सन्निधि अर्चक",
      te: "జంబె జ్యోతిష్య సన్నిధి అర్చకులు",
      ta: "ஜம்பே ஜோதிட சன்னதி அர்ச்சகர்"
    },
    sealText: {
      kn: "ಶ್ರೀ ಸೂರ್ಯ ನಾರಾಯಣ ಜಂಬೆ ದಿವ್ಯ ಮುದ್ರೆ",
      en: "Sri Surya Narayana Jambe Divine Seal",
      hi: "श्री सूर्य नारायण जंबे दिव्य मुद्रा",
      te: "శ్రీ సూర్య నారాయణ జంబె దివ్య ముద్ర",
      ta: "ஸ்ரீ சூரிய நாராயண ஜம்பே திவ்ய முத்திரை"
    },
    sealSymbol: "☀️",
    sealColor: "#D97706",
    shloka: {
      sanskrit: "ಆದಿತ್ಯಸ್ಯ ನಮಸ್ಕಾರಾನ್ ಯೇ ಕುರ್ವಂತಿ ದಿನೇ ದಿನೇ | ಜನ್ಮಾಂತರಸಹಸ್ರೇಷು ದಾರಿದ್ರ್ಯಂ ನೋಪಜಾಯತೇ ||",
      meaningKn: "ರವಿ ಜಂಬೆ ಅವರ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮತ್ತು ಮಂತ್ರಾಕ್ಷತೆಯಿಂದ ತೇಜಸ್ಸು ಹಾಗೂ ನವಗ್ರಹ ದೋಷ ಶಾಂತಿ ಲಭಿಸಲಿ.",
      meaningEn: "Through the sun-salutation blessings of Ravi Jambe, may radiance and success illuminate your life.",
      meaningHi: "रवि जंबे के सूर्य नमस्कार एवं आशीर्वचन से जीवन में तेजस्विता और नवग्रह शांति प्राप्त हो।",
      meaningTe: "రవి జంబె గారి సూర్యనమస్కార ఆశీస్సులతో జీవితంలో కాంతి, నవగ్రహ శాంతి కలుగుగాక.",
      meaningTa: "ரவி ஜம்பே அவர்களின் சூரிய நமஸ்கார ஆசியால் வாழ்வில் ஒளியும் நன்மையும் பெருகட்டும்."
    }
  },
  {
    id: "gopala-jambe",
    name: {
      kn: "ಗೋಪಾಲ ಜಂಬೆ",
      en: "Gopala Jambe",
      hi: "गोपाल जंबे",
      te: "ಗೋపాల ಜಂಬೆ",
      ta: "கோபால ஜம்பே"
    },
    title: {
      kn: "ಜಂಬೆ ಪಂಚಾಂಗ ಸೇವಾ ತಜ್ಞರು",
      en: "Jambe Panchanga Seva Expert",
      hi: "जंबे पंचांग सेवा विशेषज्ञ",
      te: "జంబె పంచాంగ సేవా నిపుణులు",
      ta: "ஜம்பே பஞ்சாங்க சேவை நிபுணர்"
    },
    sealText: {
      kn: "ಶ್ರೀ ಕೃಷ್ಣ ಗೋಪಾಲ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
      en: "Sri Krishna Gopala Sanctum Seal",
      hi: "श्री कृष्ण गोपाल सन्निधि मुद्रा",
      te: "శ్రీ కృష్ణ గోపాల సన్నిధి ముద్ర",
      ta: "ஸ்ரீ கிருஷ்ண கோபால சன்னதி முத்திரை"
    },
    sealSymbol: "🪶",
    sealColor: "#2563EB",
    shloka: {
      sanskrit: "ಕೃಷ್ಣಾಯ ವಾಸುದೇವಾಯ ಹರಯೇ ಪರಮಾತ್ಮನೇ | ಪ್ರಣತಕ್ಲೇಶನಾಶಾಯ ಗೋವಿಂದಾಯ ನಮೋ ನಮಃ ||",
      meaningKn: "ಗೋಪಾಲ ಜಂಬೆ ಅವರ ಅನುಗ್ರಹ ಮಂತ್ರಾಕ್ಷತೆಯಿಂದ ಕುಟುಂಬದಲ್ಲಿ ಶಾಂತಿ, ಸಮೃದ್ಧಿ ಮತ್ತು ಕ್ಲೇಶನಾಶ ಉಂಟಾಗಲಿ.",
      meaningEn: "May Lord Gopala's divine grace through Gopala Jambe remove all distress and bestow joy.",
      meaningHi: "गोपाल जंबे के अनुग्रह मंत्र से परिवार में शांति, समृद्धि और कष्टों का निवारण हो।",
      meaningTe: "గోపాల జంబె గారి అనుగ్రహ మంత్రాలతో కుటుంబంలో శాంతి, సమృద్ధి నెలకొనుగాక.",
      meaningTa: "கோபால ஜம்பே அவர்களின் அனுக்ரஹத்தால் குடும்பத்தில் நிம்மதியும் செல்வமும் பெருகட்டும்."
    }
  }
];

const LOCAL_STORAGE_KEY = "baggona_custom_priests_v2";

/** Reads all custom priests stored in LocalStorage */
export function getCustomPriests(): PriestProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PriestProfile[];
  } catch (err) {
    console.error("Failed to parse stored custom priests:", err);
    return [];
  }
}

/** Get full combined array of predefined and custom priests */
export function getAllPriests(): PriestProfile[] {
  const custom = getCustomPriests();
  return [...PREDEFINED_PRIESTS, ...custom];
}

/** Add a new custom priest and save to LocalStorage */
export function addCustomPriest(nameInput: string, phoneInput?: string): PriestProfile {
  const cleanName = nameInput.trim();
  const id = `custom-${cleanName.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}-${Date.now()}`;
  
  const newPriest: PriestProfile = {
    id,
    name: {
      kn: cleanName,
      en: cleanName,
      hi: cleanName,
      te: cleanName,
      ta: cleanName
    },
    title: {
      kn: "ವೇದಮೂರ್ತಿ ವೈದಿಕ ಅರ್ಚಕರು",
      en: "Veda Murthy Archaka",
      hi: "वेदमूर्ति वैदिक अर्चक",
      te: "వేదమూర్తి వైదిక అర్చకులు",
      ta: "வேதமூர்த்தி வைதிக அர்ச்சகர்"
    },
    sealText: {
      kn: "ಗೋಕರ್ಣ ಧರ್ಮಸಭಾ ಅಧಿಕೃತ ಮುದ್ರೆ",
      en: "Gokarna Dharma Sabha Official Seal",
      hi: "गोकर्ण धर्मसभा आधिकारिक मुद्रा",
      te: "గోకర్ణ ధర్మసభా అధికారిక ముద్ర",
      ta: "கோகர்ண தர்மசபா அதிகாரப்பூர்வ முத்திரை"
    },
    sealSymbol: "🪔",
    sealColor: "#B91C1C",
    shloka: {
      sanskrit: "ॐ ಸ್ವಸ್ತಿ ಪ್ರಜಾಭ್ಯಃ ಪರಿಪಾಲಯಂತಾಂ ನ್ಯಾಯೇನ ಮಾರ್ಗೇಣ ಮಹೀಂ ಮಹೀಶಾಃ | ಗೋಬ್ರಾಹ್ಮಣೇಭ್ಯಃ ಶುಭಮಸ್ತು ನಿತ್ಯಂ ಲೋಕಾಃ ಸಮಸ್ತಾಃ ಸುಖಿನೋ ಭವಂತು ||",
      meaningKn: "ಅರ್ಚಕರ ವೇದ ಮಂತ್ರ ಘೋಷ ಹಾಗೂ ಆಶೀರ್ವಾದದ ಫಲವಾಗಿ ಸಕಲ ಭಕ್ತರಿಗೂ ಮಂಗಲವುಂಟಾಗಲಿ.",
      meaningEn: "Through sacred Vedic chants and priestly benedictions, may peace and prosperity reign.",
      meaningHi: "वैदिक मन्त्रों एवं अर्चक के आशीर्वाद से आपके जीवन में सुख और मंगल का वास हो।",
      meaningTe: "వైదిక మంత్రాలు, అర్చకుల ఆశీస్సుల ఫలితంగా సకల శుభాలు సిద్ధించుగాక.",
      meaningTa: "வேத மந்திரங்கள் மற்றும் அர்ச்சகரின் ஆசியால் வாழ்வில் மங்களம் பொங்கட்டும்."
    },
    isCustom: true
  };

  const existing = getCustomPriests();
  const updated = [...existing, newPriest];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save custom priest:", e);
    }
  }
  return newPriest;
}

/** Looks up a PriestProfile by ID or Name (fuzzy case-insensitive) */
export function getPriestProfile(idOrName?: string | null): PriestProfile {
  if (!idOrName || !idOrName.trim()) return PREDEFINED_PRIESTS[0];
  const query = idOrName.trim().toLowerCase();
  const all = getAllPriests();

  const found = all.find(p => 
    p.id.toLowerCase() === query ||
    Object.values(p.name).some(val => val.toLowerCase() === query) ||
    p.name.en.toLowerCase().includes(query) ||
    p.name.kn.toLowerCase().includes(query)
  );

  if (found) return found;

  // Fallback: If dynamically passed name not in list, create a virtual PriestProfile on the fly
  return {
    id: `virtual-${query}`,
    name: {
      kn: idOrName.trim(),
      en: idOrName.trim(),
      hi: idOrName.trim(),
      te: idOrName.trim(),
      ta: idOrName.trim()
    },
    title: {
      kn: "ಗೋಕರ್ಣ ವೈದಿಕ ಅರ್ಚಕರು",
      en: "Gokarna Vaidika Archaka",
      hi: "गोकर्ण वैदिक अर्चक",
      te: "గోకర్ణ వైదిక అర్చకులు",
      ta: "கோகர்ண வைதிக அர்ச்சகர்"
    },
    sealText: {
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಅನುಗ್ರಹ ಮುದ್ರೆ",
      en: "Sri Kshetra Gokarna Blessing Seal",
      hi: "श्री क्षेत्र गोकर्ण अनुग्रह मुद्रा",
      te: "శ్రీ క్షేత్ర గోకర్ణ అనుగ్రహ ముద్ర",
      ta: "ஸ்ரீ க்ஷேத்திரம் கோகர்ண அனுக்ரஹ முத்திரை"
    },
    sealSymbol: "🕉️",
    sealColor: "#D4AF37",
    shloka: PREDEFINED_PRIESTS[0].shloka
  };
}

/** Structured Hardcoded Pooja Vidhi Details for all 13 Gokarna Sevas across 5 Languages */
export interface PoojaVidhiDetail {
  sevaId: SevaId;
  steps: {
    kn: string[];
    en: string[];
    hi: string[];
    te: string[];
    ta: string[];
  };
  auspiciousTime: L5;
  requiredItems: L5;
  fruit: L5;
}

export const HARDCODED_POOJA_VIDHI_TABLE: Record<SevaId, PoojaVidhiDetail> = {
  rudrabhisheka: {
    sevaId: "rudrabhisheka",
    steps: {
      kn: [
        "1. ಪಂಚಾಮೃತ ಸ್ನಾನ & ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಸಂಕಲ್ಪ",
        "2. ಏಕಾದಶ ರುದ್ರ ಪಠಣ ಹಾಗೂ ತೀರ್ಥ ಧಾರೆ",
        "3. ಬಿಲ್ವಪತ್ರೆ ಹಾಗೂ ರುದ್ರಾಕ್ಷಿ ಅರ್ಪಣೆ",
        "4. ಮಹಾ ನೈವೇದ್ಯ ಹಾಗೂ ಧೂಪ-ದೀಪ ಆರತಿ",
        "5. ತೀರ್ಥ ಪ್ರಸಾದ ಹಾಗೂ ಮಂತ್ರಾಕ್ಷತೆ ಸ್ವೀಕಾರ"
      ],
      en: [
        "1. Panchamrita Holy Bath & Gokarna Atmalinga Sankalpa",
        "2. Recitation of Ekadasa Rudra Parayana with sacred water stream",
        "3. Sacred Bilva Leaves & Rudraksha Offering",
        "4. Maha Naivedya & Incense Light Arati",
        "5. Distribution of Teertha Prasada & Blessed Rice (Mantrakshate)"
      ],
      hi: [
        "1. पंचामृत स्नान एवं श्री महाबलेश्वर आत्मलिंग संकल्प",
        "2. एकादश रुद्र पाठ एवं पवित्र धारा",
        "3. बिल्वपत्र एवं रुद्राक्ष अर्पण",
        "4. महा नैवेद्य एवं धूप-दीप आरती",
        "5. तीर्थ प्रसाद एवं मंत्राक्षत ग्रहण"
      ],
      te: [
        "1. పంచామృత స్నానం మరియు ఆత్మలింగ సంకల్పం",
        "2. ఏకాదశ రుద్ర పారాయణం మరియు తీర్థ ధార",
        "3. బిల్వపత్ర మరియు రుద్రాక్ష సమర్పణ",
        "4. మహా నైవేద్యం మరియు ధూప-దీప హారతి",
        "5. తీర్థ ప్రసాదం మరియు మంత్రాక్షతలు స్వీకారం"
      ],
      ta: [
        "1. பஞ்சாமிர்த அபிஷேகம் மற்றும் ஆத்மலிங்க சங்கல்பம்",
        "2. ஏகாதச ருத்ர பாராயணம் மற்றும் தீர்த்த தாரை",
        "3. வில்வ இலை மற்றும் ருத்ராட்ச சமர்ப்பணம்",
        "4. மகா நைவேத்தியம் மற்றும் தூப-தீப ஆரத்தி",
        "5. தீர்த்த பிரசாதம் மற்றும் மந்திராட்சதை பெறுதல்"
      ]
    },
    auspiciousTime: {
      kn: "ಬೆಳಗ್ಗೆ 6:00 ರಿಂದ 11:30 ರವರೆಗೆ",
      en: "Morning 6:00 AM to 11:30 AM",
      hi: "प्रातः 6:00 बजे से 11:30 बजे तक",
      te: "ఉదయం 6:00 నుండి 11:30 వరకు",
      ta: "காலை 6:00 மணி முதல் 11:30 மணி வரை"
    },
    requiredItems: {
      kn: "ಬಿಲ್ವಪತ್ರೆ, ಹಾಲು, ಮೊಸರು, ತುಪ್ಪ, ಜೇನುತುಪ್ಪ, ಗಂಗಾಜಲ",
      en: "Bilva Leaves, Milk, Curd, Ghee, Honey, Holy Water",
      hi: "बिल्वपत्र, दूध, दही, घी, शहद, गंगाजल",
      te: "బిల్వపత్రాలు, పాలు, పెరుగు, నెయ్యి, తేనె, గంగోదకం",
      ta: "வில்வ இலை, பால், தயிர், நெய், தேன், புனித நீர்"
    },
    fruit: {
      kn: "ಪಾಪನಿವಾರಣೆ, ಆಯುರಾರೋಗ್ಯ ಮತ್ತು ಮನಃಶಾಂತಿ",
      en: "Dissolution of karmic burdens, longevity and mental peace",
      hi: "पाप मुक्ति, उत्तम स्वास्थ्य और मानसिक शांति",
      te: "పాప నివారణ, ఆయురారోగ్యాలు మరియు మానసిక ప్రశాంతత",
      ta: "பாவ விமோசனம், ஆரோக்கியம் மற்றும் மன அமைதி"
    }
  },
  pindapradana: {
    sevaId: "pindapradana",
    steps: {
      kn: [
        "1. ಕೋಟಿ ತೀರ್ಥದಲ್ಲಿ ಸ್ನಾನ ಹಾಗೂ ಸಂಕಲ್ಪ",
        "2. ಎಳ್ಳು, ಅಕ್ಕಿ ಹಾಗೂ ದರ್ಭೆಯಿಂದ ಪಿಂದ ನಿರ್ಮಾಣ",
        "3. ಪಿತೃದೇವತೆಗಳ ಆವಾಹನೆ ಹಾಗೂ ತರ್ಪಣ",
        "4. ಕಾಗೆಗೆ ಅನ್ನ ಬಲಿ ಹಾಗೂ ಜಲ ತರ್ಪಣ",
        "5. ದಾನ ಮತ್ತು ಬ್ರಾಹ್ಮಣ ಮಂತ್ರಾಕ್ಷತೆ"
      ],
      en: [
        "1. Holy bath at Koti Teertha & Ancestral Sankalpa",
        "2. Preparation of Pinda using Sesame, Rice, and Darbha grass",
        "3. Ancestral Invocation & Tarpana offerings",
        "4. Sacred Anna Bali offering for Crows & Water Tarpana",
        "5. Dakshina Donation & Priestly Blessings"
      ],
      hi: [
        "1. कोटि तीर्थ में स्नान एवं पितृ संकल्प",
        "2. तिल, चावल एवं दर्भा से पिंड निर्माण",
        "3. पितृदेवों का आवाहन एवं तर्पण",
        "4. काग बलि एवं जल तर्पण",
        "5. दान एवं ब्राह्मण मंत्राक्षत"
      ],
      te: [
        "1. కోటి తీర్థ స్నానం మరియు పితృ సంకల్పం",
        "2. నువ్వులు, బియ్యం, దర్భలతో పిండ ప్రదానం",
        "3. పితృదేవతల ఆవాహన మరియు తర్పణం",
        "4. కాక బలి మరియు జల తర్పణం",
        "5. దానము మరియు బ్రాహ్మణ ఆశీస్సులు"
      ],
      ta: [
        "1. கோடி தீர்த்த நீராடல் மற்றும் பித்ரு சங்கல்பம்",
        "2. எள், அரிசி மற்றும் தர்பையால் பிண்டம் செய்தல்",
        "3. பித்ரு தேவதைகள் ஆவாஹனம் மற்றும் தர்ப்பணம்",
        "4. காக பலி மற்றும் ஜல தர்ப்பணம்",
        "5. தானம் மற்றும் பிராமண ஆசீர்வாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಬೆಳಗ್ಗೆ 7:00 ರಿಂದ ಮಧ್ಯಾಹ್ನ 1:00 ರವರೆಗೆ (ಅಪರಾಹ್ನ ಕಾಲ)",
      en: "Morning 7:00 AM to 1:00 PM (Aparahna Kaala)",
      hi: "प्रातः 7:00 बजे से दोपहर 1:00 बजे तक (अपरान्ह काल)",
      te: "ఉదయం 7:00 నుండి మధ్యాహ్నం 1:00 వరకు",
      ta: "காலை 7:00 மணி முதல் மதியம் 1:00 மணி வரை"
    },
    requiredItems: {
      kn: "ಎಳ್ಳು, ದರ್ಭೆ, ಅಕ್ಕಿಹಿಟ್ಟು, ತುಳಸಿ, ಗಂಗಾಜಲ",
      en: "Black Sesame, Darbha grass, Rice flour, Tulsi, Holy water",
      hi: "काला तिल, दर्भा, चावल का आटा, तुलसी, गंगाजल",
      te: "నల్ల నువ్వులు, దర్భలు, బియ్యప్పిండి, తులసి, గంగోదకం",
      ta: "கருப்பு எள், தர்பை, அரிசி மாவு, துளசி, புனித நீர்"
    },
    fruit: {
      kn: "ಪಿತೃದೋಷ ಶಮನ, ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಕುಟುಂಬ ಶಾಂತಿ",
      en: "Release from Pitru Dosha and lineage prosperity",
      hi: "पितृदोष शांति, वंश वृद्धि एवं पारिवारिक शांति",
      te: "పితృదోష నివారణ, వంశాభివృద్ధి మరియు కుటుంబ శాంతి",
      ta: "பித்ரு தோஷ நிவர்த்தி மற்றும் வம்ச விருத்தி"
    }
  },
  narayanabali: {
    sevaId: "narayanabali",
    steps: {
      kn: [
        "1. ವಿಷ್ಣು ಪೂಜೆ ಹಾಗೂ ಹಿರಣ್ಮಯ ಪ್ರೇತ ಪ್ರತಿಮೆ ಸ್ಥಾಪನೆ",
        "2. ನಾರಾಯಣ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಬಲಿ ಪೂಜನ",
        "3. ಪಂಚಕಲಶ ಸ್ಥಾಪನೆ ಹಾಗೂ ಹವನ",
        "4. ಶ್ರಾದ್ಧ ವಿಧಿ ಹಾಗೂ ಪಿಂಡ ಪ್ರದಾನ",
        "5. ಬ್ರಾಹ್ಮಣ ಭೋಜನ ಹಾಗೂ ಮಂತ್ರಾಕ್ಷತೆ"
      ],
      en: [
        "1. Lord Vishnu Puja & Hiranmaya Preta Pratishtha",
        "2. Narayana Mantra Chanting & Sacred Offerings",
        "3. Pancha Kalasha Sthapana & Sacred Homa",
        "4. Ancestral Shraddha & Pinda offering",
        "5. Priestly Feast & Divine Blessings"
      ],
      hi: [
        "1. विष्णु पूजा एवं हिरण्मय प्रेत प्रतिमा स्थापना",
        "2. नारायण मंत्र जप एवं बलि पूजन",
        "3. पंचकलश स्थापना एवं हवन",
        "4. श्राद्ध विधि एवं पिंड प्रदान",
        "5. ब्राह्मण भोजन एवं आशीर्वाद"
      ],
      te: [
        "1. విష్ణు పూజ మరియు ప్రతిమా స్థాపన",
        "2. నారాయణ మంత్ర జపం మరియు బలి పూజ",
        "3. పంచకలశ స్థాపన మరియు హోమం",
        "4. శ్రాద్ధ విధి మరియు పిండ ప్రదానం",
        "5. బ్రాహ్మణ భోజనం మరియు ఆశీస్సులు"
      ],
      ta: [
        "1. விஷ்ணு பூஜை மற்றும் பிரதிஷ்டை",
        "2. நாராயண மந்திர ஜபம் மற்றும் பலி பூஜை",
        "3. பஞ்சகலச ஸ்தாபனம் மற்றும் ஹோமம்",
        "4. ஸ்ராத்த விதி மற்றும் பிண்ட பிரதானம்",
        "5. பிராமண போஜனம் மற்றும் ஆசீர்வாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಬೆಳಗ್ಗೆ 8:00 ರಿಂದ ಮಧ್ಯಾಹ್ನ 2:00 (ಪೂರ್ಣ ದಿನದ ವಿಧಿ)",
      en: "Morning 8:00 AM to 2:00 PM (Full Day Vidhi)",
      hi: "प्रातः 8:00 बजे से दोपहर 2:00 बजे तक",
      te: "ఉదయం 8:00 నుండి మధ్యాహ్నం 2:00 వరకు",
      ta: "காலை 8:00 மணி முதல் மதியம் 2:00 மணி வரை"
    },
    requiredItems: {
      kn: "ವಿಷ್ಣು ಪ್ರತಿಮೆ, ಪಂಚರತ್ನ, ಎಳ್ಳು, ತುಪ್ಪ, ನ ಸಮಿಧೆಗಳು",
      en: "Vishnu Idol, Pancharatna, Sesame, Ghee, Sacred Samidha",
      hi: "विष्णु प्रतिमा, पंचरत्न, तिल, घी, समिधा",
      te: "విష్ణు ప్రతిమ, పంచరత్నాలు, నువ్వులు, నెయ్యి, సమిధలు",
      ta: "விஷ்ணு சிலை, பஞ்சரத்னம், எள், நெய், சமித்து"
    },
    fruit: {
      kn: "ಅಪಮೃತ್ಯು ನಿವಾರಣೆ, ಅತೃಪ್ತ ಆತ್ಮಗಳ ಮುಕ್ತಿ ಹಾಗೂ ಸಂಪದಭಿವೃದ್ಧಿ",
      en: "Liberation of unfulfilled departed souls & family welfare",
      hi: "अतृप्त आत्माओं की मुक्ति एवं पारिवारिक समृद्धि",
      te: "అతృప్త ఆత్మల ముక్తి మరియు వంశ క్షేమం",
      ta: "ஆத்மாக்களுக்கு முக்தி மற்றும் குடும்ப நன்மை"
    }
  },
  tripindi: {
    sevaId: "tripindi",
    steps: {
      kn: [
        "1. ತ್ರಿಮೂರ್ತಿ (ಬ್ರಹ್ಮ, ವಿಷ್ಣು, ರುದ್ರ) ಆವಾಹನೆ",
        "2. ಮೂರು ಪಿಂಡಗಳ ನಿರ್ಮಾಣ (ಸತ್ವ, ರಜಸ್, ತಮಸ್)",
        "3. ಧೂಪ-ದೀಪ ಹಾಗೂ ಮಂತ್ರ ಜಪ",
        "4. ತರ್ಪಣ ಹಾಗೂ ಜಲ ವಿಸರ್ಜನೆ",
        "5. ಆಶೀರ್ವಾದ ಪಡೆದು ಪ್ರಸಾದ ವಿತರಣೆ"
      ],
      en: [
        "1. Invocation of Trinity (Brahma, Vishnu, Rudra)",
        "2. Preparation of 3 Pindas (Satva, Rajas, Tamas)",
        "3. Incense Lamp offerings & Sacred Chanting",
        "4. Water Tarpana & Sacred Water Visarjana",
        "5. Receiving Priestly Blessing & Prasada"
      ],
      hi: [
        "1. त्रिदेव (ब्रह्मा, विष्णु, रुद्र) का आवाहन",
        "2. तीन पिंडों का निर्माण (सत्व, रजस, तमस)",
        "3. धूप-दीप एवं मंत्र जप",
        "4. तर्पण एवं जल विसर्जन",
        "5. आशीर्वाद एवं प्रसाद वितरण"
      ],
      te: [
        "1. త్రిమూర్తుల (బ్రహ్మ, విష్ణు, రుద్ర) ఆవాహన",
        "2. మూడు పిండాల తయారీ",
        "3. ధూప-దీప పూజ మరియు మంత్ర జపం",
        "4. తర్పణం మరియు జల విసర్జన",
        "5. ఆశీర్వాదం మరియు ప్రసాద స్వీకారం"
      ],
      ta: [
        "1. மும்மூர்த்திகள் (பிரம்மா, விஷ்ணு, ருத்ரன்) ஆவாஹனம்",
        "2. மூன்று பிண்டங்கள் செய்தல்",
        "3. தூப-தீப பூஜை மற்றும் மந்திர ஜபம்",
        "4. தர்ப்பணம் மற்றும் ஜல விசர்ஜனம்",
        "5. ஆசீர்வாதம் மற்றும் பிரசாதம் பெறுதல்"
      ]
    },
    auspiciousTime: {
      kn: "ಬೆಳಗ್ಗೆ 7:30 ರಿಂದ 12:00 ರವರೆಗೆ",
      en: "Morning 7:30 AM to 12:00 PM",
      hi: "प्रातः 7:30 बजे से 12:00 बजे तक",
      te: "ఉదయం 7:30 నుండి 12:00 వరకు",
      ta: "காலை 7:30 மணி முதல் 12:00 மணி வரை"
    },
    requiredItems: {
      kn: "ಸಕ್ಕರೆ, ಗೋಧಿಹಿಟ್ಟು, ಅಕ್ಕಿಹಿಟ್ಟು, ಎಳ್ಳು, ತುಳಸಿ",
      en: "Sugar, Wheat flour, Rice flour, Sesame, Tulsi",
      hi: "शक्कर, गेहूं का आटा, चावल का आटा, तिल, तुलसी",
      te: "చక్కెర, గోధుమపిండి, బియ్యప్పిండి, నువ్వులు, తులసి",
      ta: "சர்க்கரை, கோதுமை மாவு, அரிசி மாவு, எள், துளசி"
    },
    fruit: {
      kn: "ಮೂರು ತಲೆಮಾರಿನ ಪಿತೃದೋಷ ಶಾಂತಿ ಹಾಗೂ ಸಂತಾನ ಯೋಗ",
      en: "Peace for 3 generations of ancestors & progeny blessings",
      hi: "तीन पीढ़ियों के पितृदोष की शांति एवं संतान प्राप्ति",
      te: "మూడు తరాల పితృదోష నివారణ మరియు సంతాన ప్రాప్తి",
      ta: "மூன்று தலைமுறை பித்ரு தோஷ நிவர்த்தி"
    }
  },
  sarpasamskara: {
    sevaId: "sarpasamskara",
    steps: {
      kn: [
        "1. ನಾಗ ಪ್ರತಿಮೆ ಸ್ಥಾಪನೆ ಹಾಗೂ ನಾಗಪೂಜೆ",
        "2. ಸುಬ್ರಹ್ಮಣ್ಯ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಸರ್ಪ ಸಂಸ್ಕಾರ ಹವನ",
        "3. ನಾಗ ಪಿಂಡ ಪ್ರದಾನ ಹಾಗೂ ಕ್ಷಮಾ ಪ್ರಾರ್ಥನೆ",
        "4. ಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ದಕ್ಷಿಣೆ",
        "5. ನಾಗ ಪ್ರಸಾದ ಹಾಗೂ ಅಭಯ ಹಸ್ತ ಅನುಗ್ರಹ"
      ],
      en: [
        "1. Naga Idol Sthapana & Serpent Worship",
        "2. Subramanya Mantra Chanting & Naga Samskara Homa",
        "3. Naga Pinda Offering & Forgiveness Prayer",
        "4. Poornahuti & Priestly Dakshina",
        "5. Sacred Naga Prasada & Divine Protection"
      ],
      hi: [
        "1. नाग प्रतिमा स्थापना एवं नाग पूजा",
        "2. सुब्रमण्यम मंत्र जप एवं सर्प संस्कार हवन",
        "3. नाग पिंड प्रदान एवं क्षमा प्रार्थना",
        "4. पूर्णाहुति एवं ब्राह्मण दक्षिणा",
        "5. नाग प्रसाद एवं अभय हस्त अनुग्रह"
      ],
      te: [
        "1. నాగ ప్రతిమ స్థాపన మరియు పూజ",
        "2. సుబ్రహ్మణ్య మంత్ర జపం మరియు సర్ప సంస్కార హోమం",
        "3. నాగ పిండ ప్రదానం మరియు క్షమా ప్రార్థన",
        "4. పూర్ణాహుతి మరియు దక్షిణ",
        "5. నాగ ప్రసాదం మరియు ఆశీస్సులు"
      ],
      ta: [
        "1. நாக சிலை ஸ்தாபனம் மற்றும் பூஜை",
        "2. சுப்ரமண்ய மந்திர ஜபம் மற்றும் சர்ப்ப சம்ஸ்கார ஹோமம்",
        "3. நாக பிண்ட பிரதானம் மற்றும் மன்னிப்பு பிரார்த்தனை",
        "4. பூர்ணாஹுதி மற்றும் தட்சிணை",
        "5. நாக பிரசாதம் மற்றும் ஆசீர்வாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಬೆಳಗ್ಗೆ 6:30 ರಿಂದ 11:30 ರವರೆಗೆ",
      en: "Morning 6:30 AM to 11:30 AM",
      hi: "प्रातः 6:30 बजे से 11:30 बजे तक",
      te: "ఉదయం 6:30 నుండి 11:30 వరకు",
      ta: "காலை 6:30 மணி முதல் 11:30 மணி வரை"
    },
    requiredItems: {
      kn: "ರಜತ ನಾಗ ಪ್ರತಿಮೆ, ಹಾಲು, ಅರಿಶಿನ, ಕಬ್ಬಿನ ಹಾಲು, ಹೂವು",
      en: "Silver Naga Idol, Milk, Turmeric, Sugarcane juice, Flowers",
      hi: "चांदी की नाग प्रतिमा, दूध, हल्दी, गन्ने का रस, फूल",
      te: "వెండి నాగ ప్రతిమ, పాలు, పసుపు, చెరకు రసం, పువ్వులు",
      ta: "வெள்ளி நாக சிலை, பால், மஞ்சள், கரும்பு சாறு, மலர்கள்"
    },
    fruit: {
      kn: "ಸರ್ಪದೋಷ ಶಮನ, ಚರ್ಮರೋಗ ನಿವಾರಣೆ ಹಾಗೂ ಸಂತಾನ ಭಾಗ್ಯ",
      en: "Alleviation of Sarpa Dosha & blessings of children",
      hi: "सर्पदोष शांति, चर्म रोग निवारण एवं संतान भाग्य",
      te: "సర్పదోష నివారణ, చర్మరోగ నివారణ మరియు సంతాన ప్రాప్తి",
      ta: "சர்ப்ப தோஷ நிவர்த்தி மற்றும் சந்தான பாக்கியம்"
    }
  },
  ganapatihoma: {
    sevaId: "ganapatihoma",
    steps: {
      kn: [
        "1. ಗಣಪತಿ ಆವಾಹನೆ ಹಾಗೂ ಶೋಡಶೋಪಚಾರ ಪೂಜೆ",
        "2. ಅಷ್ಟದ್ರವ್ಯ (ಕೊಬ್ಬರಿ, ಬೆಲ್ಲ, ಕಬ್ಬು, ಎಳ್ಳು, ಮೋದಕ ಇತ್ಯಾದಿ) ಸಮರ್ಪಣೆ",
        "3. ಗಣೇಶ ಅಥರ್ವಶೀರ್ಷ ಪಾರಾಯಣ ಹವನ",
        "4. ಮಹಾಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ಆರತಿ",
        "5. ರಕ್ಷಾ ತಿಲಕ ಧಾರಣೆ ಹಾಗೂ ಪ್ರಸಾದ ನೀಡಿಕೆ"
      ],
      en: [
        "1. Ganesha Invocation & Shodashopachara Puja",
        "2. Ashta-Dravya offerings (Coconut, Jaggery, Sugarcane, Modaka)",
        "3. Ganesha Atharvashirsha Parayana Homa",
        "4. Maha Poornahuti & Mangalarati",
        "5. Sacred Tilaka application & Prasada distribution"
      ],
      hi: [
        "1. गणपति आवाहन एवं षोडशोपचार पूजा",
        "2. अष्टद्रव्य (नारियल, गुड़, गन्ना, मोदक आदि) अर्पण",
        "3. गणेश अथर्वशीर्ष परायण हवन",
        "4. महापूर्णाहुति एवं आरती",
        "5. रक्षा तिलक एवं प्रसाद ग्रहण"
      ],
      te: [
        "1. గణపతి ఆవాహన మరియు షోడశోపచార పూజ",
        "2. అష్టద్రవ్య సమర్పణ (కొబ్బరి, బెల్లం, మోదకాలు)",
        "3. గణేశ అథర్వశీర్ష హోమం",
        "4. మహాపూర్ణాహుతి మరియు హారతి",
        "5. రక్షా తిలకం మరియు ప్రసాద స్వీకారం"
      ],
      ta: [
        "1. கணபதி ஆவாஹனம் மற்றும் சோடசோபசார பூஜை",
        "2. அஷ்டதிரவிய சமர்ப்பணம் (தேங்காய், வெல்லம், மோதகம்)",
        "3. கணேச அதர்வசீர்ஷ ஹோமம்",
        "4. மகா பூர்ணாஹுதி மற்றும் ஆரத்தி",
        "5. ரக்ஷா திலகம் மற்றும் பிரசாதம் பெறுதல்"
      ]
    },
    auspiciousTime: {
      kn: "ಬೆಳಗ್ಗೆ 6:00 ರಿಂದ 9:00 (ಸೂರ್ಯೋದಯ ಕಾಲ)",
      en: "Morning 6:00 AM to 9:00 AM (Sunrise window)",
      hi: "प्रातः 6:00 बजे से 9:00 बजे तक (सूर्योदय काल)",
      te: "ఉదయం 6:00 నుండి 9:00 వరకు",
      ta: "காலை 6:00 மணி முதல் 9:00 மணி வரை"
    },
    requiredItems: {
      kn: "ಕೊಬ್ಬರಿ, ಬೆಲ್ಲ, ಕಬ್ಬು, ಮೋದಕ, ದೂರ್ವಾ (ಗರಿಕೆ), ತುಪ್ಪ",
      en: "Coconut, Jaggery, Sugarcane, Modaka, Durva grass, Ghee",
      hi: "नारियल, गुड़, गन्ना, मोदक, दुर्वा, घी",
      te: "కొబ్బరి, బెల్లం, చెరకు, మోదకాలు, గరిక, నెయ్యి",
      ta: "தேங்காய், வெல்லம், கரும்பு, மோதகம், அருகம்புல், நெய்"
    },
    fruit: {
      kn: "ಕಾರ್ಯಸಿದ್ಧಿ, ವಿಘ್ನನಿವಾರಣೆ ಹಾಗೂ ವ್ಯಾಪಾರ ವೃದ್ಧಿ",
      en: "Removal of all obstacles and commercial prosperity",
      hi: "कार्य सिद्धि, विघ्न निवारण एवं व्यापार वृद्धि",
      te: "కార్యసిద్ధి, విఘ్న నివారణ మరియు వ్యాపార అభివృద్ధి",
      ta: "காரிய சித்தி, தடைகள் நீக்கம் மற்றும் வியாபார விருத்தி"
    }
  },
  chandihoma: {
    sevaId: "chandihoma",
    steps: {
      kn: [
        "1. ನವಚಂಡೀ ಕಲಾಶ ಸ್ಥಾಪನೆ ಹಾಗೂ ದುರ್ಗಾ ಆವಾಹನೆ",
        "2. ಸಪ್ತಶತೀ ಚಂಡೀ ಪಾರಾಯಣ (13 ಅಧ್ಯಾಯಗಳು)",
        "3. ಮಹಾ ಯಜ್ಞ ಕುಂಡದಲ್ಲಿ ಹೋಮದ್ರವ್ಯ ಸಮರ್ಪಣೆ",
        "4. ಕನ್ಯಾಪೂಜೆ, ಮಂಗಲ ದ್ರವ್ಯ ದಾನ ಹಾಗೂ ಪೂರ್ಣಾಹುತಿ",
        "5. ಚಂಡೀ ಅಭಯ ಮಂತ್ರಾಕ್ಷತೆ ಹಾಗೂ ಪ್ರಸಾದ"
      ],
      en: [
        "1. Nava Chandi Kalasha Sthapana & Goddess Durga Invocation",
        "2. Recitation of Durga Saptashati Chandi Parayana (13 Chapters)",
        "3. Offering Sacred Homa Dravya in Yajna Kunda",
        "4. Kanya Puja, Mangala Donation & Poornahuti",
        "5. Chandi Blessings, Sacred Tilaka & Prasada"
      ],
      hi: [
        "1. नवचंडी कलश स्थापना एवं दुर्गा आवाहन",
        "2. सप्तशती चंडी परायण (13 अध्याय)",
        "3. महायज्ञ कुंड में होमद्रव्य अर्पण",
        "4. कन्या पूजन, मंगल दान एवं पूर्णाहुति",
        "5. चंडी आशीर्वाद एवं प्रसाद वितरण"
      ],
      te: [
        "1. నవచండీ కలశ స్థాపన మరియు దుర్గా ఆవాహన",
        "2. సప్తశతీ చండీ పారాయణం (13 అధ్యాయాలు)",
        "3. యజ్ఞ కుండంలో హోమద్రవ్య సమర్పణ",
        "4. కన్యా పూజ మరియు పూర్ణాహుతి",
        "5. చండీ ఆశీస్సులు మరియు ప్రసాద స్వీకారం"
      ],
      ta: [
        "1. நவசண்டி கலச ஸ்தாபனம் மற்றும் துர்க்கை ஆவாஹனம்",
        "2. சப்தசதி சண்டி பாராயணம் (13 அத்தியாயங்கள்)",
        "3. யாக குண்டத்தில் ஹோம திரவிய சமர்ப்பணம்",
        "4. கன்யா பூஜை மற்றும் பூர்ணாஹுதி",
        "5. சண்டி ஆசீர்வாதம் மற்றும் பிரசாதம் பெறுதல்"
      ]
    },
    auspiciousTime: {
      kn: "ಬೆಳಗ್ಗೆ 7:00 ರಿಂದ ಮಧ್ಯಾಹ್ನ 1:00 (ವಿಶೇಷ ಚಂಡೀ ಮುಹೂರ್ತ)",
      en: "Morning 7:00 AM to 1:00 PM (Special Chandi Muhurtha)",
      hi: "प्रातः 7:00 बजे से दोपहर 1:00 बजे तक",
      te: "ఉదయం 7:00 నుండి మధ్యాహ్నం 1:00 వరకు",
      ta: "காலை 7:00 மணி முதல் மதியம் 1:00 மணி வரை"
    },
    requiredItems: {
      kn: "ಕುಂಕುಮ, ರೇಷ್ಮೆ ಸೀರೆ, ಕಮಲದ ಹೂವು, ಸೌಭಾಗ್ಯ ದ್ರವ್ಯ, ತುಪ್ಪ",
      en: "Kumkum, Silk Saree, Lotus flowers, Saubhagya items, Ghee",
      hi: "कुमकुम, रेशमी साड़ी, कमल पुष्प, सौभाग्य द्रव्य, घी",
      te: "కుంకుమ, పట్టు చీర, తామర పువ్వులు, సౌభాగ్య ద్రవ్యాలు, నెయ్యి",
      ta: "குங்குமம், பட்டுப் புடவை, தாமரை மலர்கள், சௌபாக்கிய பொருட்கள், நெய்"
    },
    fruit: {
      kn: "ಶತ್ರುನಾಶ, ಭಯ ನಿವಾರಣೆ, ಐಶ್ವರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ರಾಜಯೋಗ",
      en: "Triumph over adversity, courage, wealth & royal success",
      hi: "शत्रु नाश, भय निवारण, ऐश्वर्य सिद्धि एवं राजयोग",
      te: "శత్రు నాశనం, భయ నివారణ, ఐశ్వర్య సిద్ధి",
      ta: "எதிரி பயம் நீக்கம், ஐஸ்வர்ய சித்தி மற்றும் வெற்றி"
    }
  },
  mrityunjaya: {
    sevaId: "mrityunjaya",
    steps: {
      kn: [
        "1. ಶ್ರೀ ಮೃತ್ಯುಂಜಯ ರುದ್ರ ಪೂಜೆ ಹಾಗೂ ಕಳಸ ಸ್ಥಾಪನೆ",
        "2. ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ (108/1008 ಬಾರಿ)",
        "3. ಅಮೃತ ಬಳ್ಳಿ ಹಾಗೂ ದೂರ್ವಾ ಹೋಮದ್ರವ್ಯ ಅರ್ಪಣೆ",
        "4. ಆಯುಷ್ಯ ಸೂಕ್ತ ಪಾರಾಯಣ ಹಾಗೂ ಪೂರ್ಣಾಹುತಿ",
        "5. ರಕ್ಷಾ ಸೂತ್ರ ಬಂಧನ ಹಾಗೂ ಪ್ರಸಾದ ಸ್ವೀಕಾರ"
      ],
      en: [
        "1. Lord Mrityunjaya Puja & Sacred Kalasha Sthapana",
        "2. Maha Mrityunjaya Mantra Chanting (108/1008 times)",
        "3. Offering Amrita Valli & Durva in sacred fire",
        "4. Ayushya Sukta Parayana & Poornahuti",
        "5. Sacred Protection Thread tying & Prasada"
      ],
      hi: [
        "1. श्री मृत्युंजय रुद्र पूजा एवं कलश स्थापना",
        "2. महा मृत्युंजय मंत्र जप (108/1008 बार)",
        "3. अमृता वल्ली एवं दुर्वा होमद्रव्य अर्पण",
        "4. आयुष्य सूक्त परायण एवं पूर्णाहुति",
        "5. रक्षा सूत्र बंधन एवं प्रसाद"
      ],
      te: [
        "1. శ్రీ మృత్యుంజయ పూజ మరియు కలశ స్థాపన",
        "2. మహా మృత్యుంజయ మంత్ర జపం",
        "3. అమృత వల్లి, గరిక హోమద్రవ్య సమర్పణ",
        "4. ఆయుష్య సూక్త పారాయణం మరియు పూర్ణాహుతి",
        "5. రక్షా సూత్ర బంధనం మరియు ప్రసాదం"
      ],
      ta: [
        "1. ஸ்ரீ மிருத்யுஞ்சய பூஜை மற்றும் கலச ஸ்தாபனம்",
        "2. மகா மிருத்யுஞ்சய மந்திர ஜபம்",
        "3. அமிர்த வல்லி மற்றும் அருகம்புல் ஹோம திரவியம்",
        "4. ஆயுஷ்ய சூக்த பாராயணம் மற்றும் பூர்ணாஹுதி",
        "5. ரக்ஷா சூத்திரம் கட்டுதல் மற்றும் பிரசாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಬೆಳಗ್ಗೆ 6:00 ರಿಂದ 10:30 (ಬ್ರಾಹ್ಮೀ ಅಥವಾ ಪ್ರಾತಃಕಾಲ)",
      en: "Morning 6:00 AM to 10:30 AM (Brahma Muhurtha)",
      hi: "प्रातः 6:00 बजे से 10:30 बजे तक",
      te: "ఉదయం 6:00 నుండి 10:30 వరకు",
      ta: "காலை 6:00 மணி முதல் 10:30 மணி வரை"
    },
    requiredItems: {
      kn: "ಅಮೃತ ಬಳ್ಳಿ, ಹಾಲು, ಎಳ್ಳು, ಗರಿಕೆ, ತುಪ್ಪ, ರುದ್ರಾಕ್ಷಿ",
      en: "Amrita Valli, Milk, Sesame, Durva grass, Ghee, Rudraksha",
      hi: "अमृता वल्ली, दूध, तिल, दुर्वा, घी, रुद्राक्ष",
      te: "అమృత వల్లి, పాలు, నువ్వులు, గరిక, నెయ్యి, రుద్రాక్షలు",
      ta: "அமிர்த வல்லி, பால், எள், அருகம்புல், நெய், ருத்ராட்சம்"
    },
    fruit: {
      kn: "ಅಪಮೃತ್ಯು ದೋಷ ನಿವಾರಣೆ, ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಆರೋಗ್ಯ ವೃದ್ಧಿ",
      en: "Protection from health crises, vitality & long life",
      hi: "अकाल मृत्यु दोष निवारण, दीर्घायु एवं आरोग्य वृद्धि",
      te: "అపమృత్యు దోష నివారణ, దీర్ఘాయువు మరియు ఆరోగ్య ప్రాప్తి",
      ta: "அபமிருத்யு தோஷ நிவர்த்தி மற்றும் ஆரோக்கியம்"
    }
  },
  navagrahashanti: {
    sevaId: "navagrahashanti",
    steps: {
      kn: [
        "1. ನವಗ್ರಹ ಮಂಡಲ ಲೇಖನ ಹಾಗೂ 9 ಗ್ರಹಗಳ ಆವಾಹನೆ",
        "2. ಸೂರ್ಯಾದಿ ನವಗ್ರಹ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಜಪಮಾಲಾ ಅರ್ಪಣೆ",
        "3. 9 ಧಾನ್ಯಗಳು (ನವಧಾನ್ಯ) ಹಾಗೂ ಸಮಿಧೆಗಳಿಂದ ಹೋಮ",
        "4. ಗ್ರಹಪೀಡಾ ನಿವಾರಣಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ನವಗ್ರಹ ರಕ್ಷಾ ಭಸ್ಮ ಹಾಗೂ ತೀರ್ಥ ಪ್ರಸಾದ"
      ],
      en: [
        "1. Navagraha Mandala Layout & Invocation of 9 Planets",
        "2. Chanting of Surya & Navagraha Mantras",
        "3. Offering 9 Grains (Navadhanya) & Sacred Wood in Homa",
        "4. Graha Peeda Nivaran Poornahuti",
        "5. Distribution of Sacred Bhasma & Prasada"
      ],
      hi: [
        "1. नवग्रह मंडल लेखन एवं 9 ग्रहों का आवाहन",
        "2. सूर्यादि नवग्रह मंत्र जप",
        "3. 9 अनाज (नवधान्य) एवं समिधा से हवन",
        "4. ग्रह पीड़ा निवारण पूर्णाहुति",
        "5. नवग्रह रक्षा भस्म एवं प्रसाद"
      ],
      te: [
        "1. నవగ్రహ మండలం మరియు 9 గ్రహాల ఆవాహన",
        "2. నవగ్రహ మంత్ర జపం",
        "3. నవధాన్యాలు మరియు హోమం",
        "4. గ్రహపీడా నివారణ పూర్ణాహుతి",
        "5. నవగ్రహ భస్మం మరియు ప్రసాదం"
      ],
      ta: [
        "1. நவக்கிரக மண்டலம் மற்றும் 9 கிரகங்கள் ஆவாஹனம்",
        "2. நவக்கிரக மந்திர ஜபம்",
        "3. நவதானியம் மற்றும் ஹோமம்",
        "4. கிரக பீடா நிவர்த்தி பூர்ணாஹுதி",
        "5. நவக்கிரக பஸ்மம் மற்றும் பிரசாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಬೆಳಗ್ಗೆ 7:00 ರಿಂದ 11:00 (ಗ್ರಹ ಹಂಸ ಮುಹೂರ್ತ)",
      en: "Morning 7:00 AM to 11:00 AM",
      hi: "प्रातः 7:00 बजे से 11:00 बजे तक",
      te: "ఉదయం 7:00 నుండి 11:00 వరకు",
      ta: "காலை 7:00 மணி முதல் 11:00 மணி வரை"
    },
    requiredItems: {
      kn: "ನವಧಾನ್ಯ, 9 ಬಣ್ಣದ ವಸ್ತ್ರ, ಸಮಿಧೆ, ಎಳ್ಳು, ತುಪ್ಪ",
      en: "Navadhanya, 9 Coloured Cloths, Samidha, Sesame, Ghee",
      hi: "नवधान्य, 9 रंग के वस्त्र, समिधा, तिल, घी",
      te: "నవధాన్యాలు, 9 రంగుల వస్త్రాలు, సమిధలు, నువ్వులు, నెయ్యి",
      ta: "நவதானியம், 9 வண்ண ஆடைகள், சமித்து, எள், நெய்"
    },
    fruit: {
      kn: "ಗ್ರಹ ದೋಷ ಶಾಂತಿ, ಉದ್ಯೋಗ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಸ್ಥಿರತೆ",
      en: "Neutralization of planetary doshas & stability in life",
      hi: "ग्रह दोष शांति, नौकरी एवं परिवार में स्थिरता",
      te: "గ్రహ దోష శాంతి, ఉద్యోగం మరియు కుటుంబంలో స్థిరత్వం",
      ta: "கிரக தோஷ சாந்தி மற்றும் குடும்ப ஸ்திரத்தன்மை"
    }
  },
  kujashanti: {
    sevaId: "kujashanti",
    steps: {
      kn: [
        "1. ಸುಬ್ರಹ್ಮಣ್ಯ & ಮಂಗಳ ಗ್ರಹ ಕಳಸ ಸ್ಥಾಪನೆ",
        "2. ಅಂಗಾರಕ ಮಂತ್ರ ಜಪ (108 ಬಾರಿ)",
        "3. ತೊಗರಿಬೇಳೆ ಹಾಗೂ ಕೆಂಪು ವಸ್ತ್ರ ಹೋಮದ್ರವ್ಯ ಅರ್ಪಣೆ",
        "4. ರಕ್ತಚಂದನ ಮತ್ತು ಕೆಂಪು ಹೂವಿನ ಅರ್ಚನೆ",
        "5. ಕುಜದೋಷ ನಿವಾರಣಾ ಮಂತ್ರಾಕ್ಷತೆ ಹಾಗೂ ಪ್ರಸಾದ"
      ],
      en: [
        "1. Subramanya & Kuja (Mars) Kalasha Sthapana",
        "2. Angaraka Mantra Chanting (108 times)",
        "3. Offering Red Gram (Toor Dal) & Red Cloth in Homa",
        "4. Rakta Chandana & Red Flower Archana",
        "5. Kuja Dosha Relief Blessings & Prasada"
      ],
      hi: [
        "1. सुब्रमण्यम एवं मंगल ग्रह कलश स्थापना",
        "2. अंगारक मंत्र जप (108 बार)",
        "3. तुअर दाल एवं लाल वस्त्र होमद्रव्य अर्पण",
        "4. रक्त चंदन एवं लाल पुष्प अर्चना",
        "5. कुजदोष निवारण मंत्राक्षत एवं प्रसाद"
      ],
      te: [
        "1. సుబ్రహ్మణ్య మరియు అంగారక కలశ స్థాపన",
        "2. అంగారక మంత్ర జపం",
        "3. కందులు మరియు ఎర్రటి వస్త్ర సమర్పణ",
        "4. రక్తచందనం మరియు ఎర్రటి పువ్వుల అర్చన",
        "5. కుజదోష నివారణ ఆశీస్సులు"
      ],
      ta: [
        "1. சுப்ரமண்ய மற்றும் அங்காரக கலச ஸ்தாபனம்",
        "2. அங்காரக மந்திர ஜபம்",
        "3. துவரம்பருப்பு மற்றும் சிவப்பு ஆடை ஹோமம்",
        "4. ரத்தசந்தனம் மற்றும் சிவப்பு மலர் அர்ச்சனை",
        "5. குஜ தோஷ நிவர்த்தி ஆசீர்வாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಮಂಗಳವಾರ ಬೆಳಗ್ಗೆ 7:30 ರಿಂದ 10:30 ರವರೆಗೆ",
      en: "Tuesday Morning 7:30 AM to 10:30 AM",
      hi: "मंगलवार प्रातः 7:30 बजे से 10:30 बजे तक",
      te: "మంగళవారం ఉదయం 7:30 నుండి 10:30 వరకు",
      ta: "செவ்வாய்க்கிழமை காலை 7:30 மணி முதல் 10:30 மணி வரை"
    },
    requiredItems: {
      kn: "ತೊಗರಿಬೇಳೆ, ಕೆಂಪು ವಸ್ತ್ರ, ಕೆಂಪು ಚಂದನ, ಕೆಂಪು ಕನಕಾಂಬರ ಹೂವು",
      en: "Toor Dal, Red Cloth, Red Sandalwood, Red Flowers",
      hi: "तुअर दाल, लाल कपड़ा, लाल चंदन, लाल फूल",
      te: "కందులు, ఎర్రటి వస్త్రం, ఎర్ర చందనం, ఎర్ర పువ్వులు",
      ta: "துவரம்பருப்பு, சிவப்பு ஆடை, செஞ்சந்தனம், சிவப்பு மலர்"
    },
    fruit: {
      kn: "ಮಂಗಳ/ಕುಜ ದೋಷ ನಿವಾರಣೆ, ವಿವಾಹ ತಡೆ ನಿವಾರಣೆ ಹಾಗೂ ಭೂಲಾಭ",
      en: "Removal of Manglik Dosha, timely marriage & land gains",
      hi: "मांगलिक दोष निवारण, शीघ्र विवाह एवं भूमि लाभ",
      te: "మాంగళిక దోష నివారణ, శీఘ్ర వివాహం మరియు భూ లాభం",
      ta: "மாங்கல்ய தோஷ நிவர்த்தி மற்றும் திருமண பாக்கியம்"
    }
  },
  shanitilahoma: {
    sevaId: "shanitilahoma",
    steps: {
      kn: [
        "1. ಶನೀಶ್ವರ & ಹನುಮಂತ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ತೈಲಾಭಿಷೇಕ",
        "2. ಶನೈಶ್ಚರ ಮಂತ್ರ ಹಾಗೂ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಾರಾಯಣ",
        "3. ಕಪ್ಪು ಎಳ್ಳು ಹಾಗೂ ಎಳ್ಳಣ್ಣ ಧಾರೆ ಯಜ್ಞ ಕುಂಡದಲ್ಲಿ ಅರ್ಪಣೆ",
        "4. ಶನಿ ಪೀಡಾ ನಿವಾರಣಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ಕಪ್ಪು ಎಳ್ಳು ಪ್ರಸಾದ ಹಾಗೂ ಶನಿ ರಕ್ಷಾ ದಾರ"
      ],
      en: [
        "1. Lord Shanieshwara & Hanuman Invocation & Oil Abhisheka",
        "2. Shanaishchara Mantra & Hanuman Chalisa Chanting",
        "3. Offering Black Sesame & Sesame Oil in Homa fire",
        "4. Shani Peeda Nivaran Poornahuti",
        "5. Black Sesame Prasada & Sacred Shani Protection Thread"
      ],
      hi: [
        "1. शनैश्चर एवं हनुमान प्रार्थना तथा तैलाभिलाष",
        "2. शनैश्चर मंत्र एवं हनुमान चालीसा पाठ",
        "3. काला तिल एवं तिल का तेल हवन कुंड में अर्पण",
        "4. शनि पीड़ा निवारण पूर्णाहुति",
        "5. काला तिल प्रसाद एवं शनि रक्षा सूत्र"
      ],
      te: [
        "1. శనీశ్వర మరియు హనుమాన్ ప్రార్థన",
        "2. శనైశ్చర మంత్రం మరియు హనుమాన్ చాలీసా పారాయణం",
        "3. నల్ల నువ్వులు మరియు నువ్వుల నూనె హోమం",
        "4. శని పీడా నివారణ పూర్ణాహుతి",
        "5. నల్ల నువ్వుల ప్రసాదం మరియు రక్షా సూత్రం"
      ],
      ta: [
        "1. சனீஸ்வரர் மற்றும் ஹனுமான் பிரார்த்தனை",
        "2. சனீஸ்வர மந்திரம் மற்றும் ஹனுமான் சாலிசா பாராயணம்",
        "3. கருப்பு எள் மற்றும் நல்லெண்ணெய் ஹோமம்",
        "4. சனி பீடா நிவர்த்தி பூர்ணாஹுதி",
        "5. கருப்பு எள் பிரசாதம் மற்றும் ரக்ஷா சூத்திரம்"
      ]
    },
    auspiciousTime: {
      kn: "ಶನಿವಾರ ಬೆಳಗ್ಗೆ 8:00 ರಿಂದ 11:30 ರವರೆಗೆ",
      en: "Saturday Morning 8:00 AM to 11:30 AM",
      hi: "शनिवार प्रातः 8:00 बजे से 11:30 बजे तक",
      te: "శనివారం ఉదయం 8:00 నుండి 11:30 వరకు",
      ta: "சனிக்கிழமை காலை 8:00 மணி முதல் 11:30 மணி வரை"
    },
    requiredItems: {
      kn: "ಕಪ್ಪು ಎಳ್ಳು, ಎಳ್ಳಣ್ಣೆ, ಕಪ್ಪು ವಸ್ತ್ರ, ನೀಲಿ ಹೂವು, ಕಬ್ಬಿಣದ ದೀಪ",
      en: "Black Sesame, Sesame Oil, Black Cloth, Blue Flowers, Iron Lamp",
      hi: "काला तिल, तिल का तेल, काला कपड़ा, नीले फूल, लोहे का दीपक",
      te: "నల్ల నువ్వులు, నువ్వుల నూనె, నల్లటి వస్త్రం, నీలం పువ్వులు",
      ta: "கருப்பு எள், நல்லெண்ணெய், கருப்பு ஆடை, நீல மலர்கள்"
    },
    fruit: {
      kn: "ಸಾಡೇಸಾತಿ (ಏಳೂವರೆ ಶನಿ) ಶಮನ, ಸಾಲ ಮುಕ್ತಿ ಹಾಗೂ ನ್ಯಾಯ ಜಯ",
      en: "Relief from Sade Sati, debt clearance & legal victory",
      hi: "साढ़े साती शांति, ऋण मुक्ति एवं कानूनी विजय",
      te: "సాడే సతి శని నివారణ, రుణ ముక్తి మరియు విజయం",
      ta: "ஏழரை சனி தோஷ நிவர்த்தி மற்றும் கடன் நிவர்த்தி"
    }
  },
  satyanarayana: {
    sevaId: "satyanarayana",
    steps: {
      kn: [
        "1. ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ ಮಂಡಲ ಸ್ಥಾಪನೆ",
        "2. ಪಂಚಾಧ್ಯಾಯೀ ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಕಥಾ ಶ್ರವಣ",
        "3. ತುಳಸಿಪತ್ರೆ, ಮಾವಿನ ಎಲೆ ಹಾಗೂ ಫಲ ಸಮರ್ಪಣೆ",
        "4. ಸಪಾದ ಭಕ್ಷ್ಯ (ರವೆ ಶೀರಾ) ಮಹಾ ನೈವೇದ್ಯ ಹಾಗೂ ಆರತಿ",
        "5. ತೀರ್ಥ ಪ್ರಸಾದ ಸ್ವೀಕಾರ ಹಾಗೂ ಮಂತ್ರಾಕ್ಷತೆ"
      ],
      en: [
        "1. Lord Satyanarayana Mandala Sthapana",
        "2. Recitation & Listening of 5-Chapter Satyanarayana Katha",
        "3. Tulsi leaves, Mango leaves & Fruit offering",
        "4. Sacred Sapada Bhakshya (Rava Sheera) Naivedya & Arati",
        "5. Distribution of Teertha Prasada & Blessed Rice"
      ],
      hi: [
        "1. श्री सत्यनारायण स्वामी मंडल स्थापना",
        "2. पंचाध्यायी श्री सत्यनारायण कथा श्रवण",
        "3. तुलसीदल, आम के पत्ते एवं फल अर्पण",
        "4. सपाद भक्ष्य (रवा शीरा) महा नैवेद्य एवं आरती",
        "5. तीर्थ प्रसाद ग्रहण एवं मंत्राक्षत"
      ],
      te: [
        "1. శ్రీ సత్యనారాయణ స్వామి మండప స్థాపన",
        "2. సత్యనారాయణ వ్రత కథల శ్రవణం (5 అధ్యాయాలు)",
        "3. తులసి దళాలు, పండ్లు సమర్పణ",
        "4. రవ్వ కేసరి మహా నైవేద్యం మరియు హారతి",
        "5. తీర్థ ప్రసాదం మరియు ఆశీస్సులు"
      ],
      ta: [
        "1. ஸ்ரீ சத்தியநாராயண சுவாமி மண்டல ஸ்தாபனம்",
        "2. சத்தியநாராயண விரத கதை கேட்டல் (5 அத்தியாயங்கள்)",
        "3. துளசி, பழங்கள் சமர்ப்பணம்",
        "4. ரவா கேசரி மகா நைவேத்தியம் மற்றும் ஆரத்தி",
        "5. தீர்த்த பிரசாதம் மற்றும் ஆசீர்வாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಪೂರ್ಣಿಮೆ ಅಥವಾ ಶನಿವಾರ ಸಂಜೆ/ಬೆಳಗ್ಗೆ 9:00",
      en: "Purnima or Morning/Evening 9:00 AM",
      hi: "पूर्णिमा अथवा प्रातः/सायं 9:00 बजे",
      te: "పౌర్ణమి లేదా ఉదయం 9:00 గంటలకు",
      ta: "பௌர்ணமி அல்லது காலை 9:00 மணிக்கு"
    },
    requiredItems: {
      kn: "ರವೆ, ಸಕ್ಕರೆ, ತುಪ್ಪ, ಹಾಲು, ಬಾಳೆಹಣ್ಣು, ತುಳಸಿ, ಮಾವಿನ ತೋರಣ",
      en: "Semolina, Sugar, Ghee, Milk, Banana, Tulsi, Mango leaves",
      hi: "रवा, शक्कर, घी, दूध, केला, तुलसी, आम के पत्ते",
      te: "రవ్వ, చక్కెర, నెయ్యి, పాలు, అరటిపండ్లు, తులసి",
      ta: "ரவை, சர்க்கரை, நெய், பால், வாழைப்பழம், துளசி"
    },
    fruit: {
      kn: "ಸತ್ಯ, ಧರ್ಮ, ಸುಖ-ಸಮೃದ್ಧಿ ಹಾಗೂ ಸರ್ವ ಸಂಕಷ್ಟ ನಿವಾರಣೆ",
      en: "Universal prosperity, domestic harmony & fulfillment",
      hi: "सुख-समृद्धि, सत्य धर्म रक्षा एवं संकट निवारण",
      te: "సుఖ-సమృద్ధి, కుటుంబ శాంతి మరియు సంకట నివారణ",
      ta: "குடும்ப சுபிட்சம் மற்றும் சகல நன்மைகள்"
    }
  },
  ayushyahoma: {
    sevaId: "ayushyahoma",
    steps: {
      kn: [
        "1. ಆಯುರ್ದೇವತೆಗಳ (ಚಿರಂಜೀವಿಗಳ) ಆವಾಹನೆ",
        "2. ಆಯುಷ್ಯ ಸೂಕ್ತ ಹಾಗೂ ಚಿರಂಜೀವಿ ಮಂತ್ರ ಜಪ",
        "3. ಬೆಲ್ಲ, ತುಪ್ಪ, ಚರು ಹಾಗೂ ಕಷಾಯ ಸಮಿಧೆ ಹೋಮ",
        "4. ಆಯುಷ್ಯ ರಕ್ಷಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ಆಯುಷ್ಯ ಮಂತ್ರಾಕ್ಷತೆ ಹಾಗೂ ಮಂಗಲ ಪ್ರಸಾದ"
      ],
      en: [
        "1. Invocation of Ayur Devas (Chiranjivis)",
        "2. Recitation of Ayushya Sukta & Chiranjivi Mantras",
        "3. Offering Jaggery, Ghee, Charu & Medicinal Wood in fire",
        "4. Ayushya Raksha Poornahuti",
        "5. Blessed Mantrakshate for longevity & Prasada"
      ],
      hi: [
        "1. आयुरदेवों (चिरंजीवियों) का आवाहन",
        "2. आयुष्य सूक्त एवं चिरंजीवी मंत्र जप",
        "3. गुड़, घी, चरु एवं औषधीय समिधा हवन",
        "4. आयुष्य रक्षा पूर्णाहुति",
        "5. आयुष्य मंत्राक्षत एवं मंगल प्रसाद"
      ],
      te: [
        "1. ఆయుర్దేవతల ఆవాహన",
        "2. ఆయుష్య సూక్త పారాయణం మరియు మంత్ర జపం",
        "3. బెల్లం, నెయ్యి మరియు హోమద్రవ్య సమర్పణ",
        "4. ఆయుష్య రక్షా పూర్ణాహుతి",
        "5. ఆయుష్య ఆశీస్సులు మరియు ప్రసాదం"
      ],
      ta: [
        "1. ஆயுர்தேவதைகள் ஆவாஹனம்",
        "2. ஆயுஷ்ய சூக்த பாராயணம் மற்றும் மந்திர ஜபம்",
        "3. வெல்லம், நெய் மற்றும் ஓம திரவியம்",
        "4. ஆயுஷ்ய ரக்ஷா பூர்ணாஹுதி",
        "5. ஆயுஷ்ய ஆசீர்வாதம் மற்றும் பிரசாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಜನನದಿನ ಅಥವಾ ಹುಟ್ಟುಹಬ್ಬದ ಬೆಳಗ್ಗೆ 7:00",
      en: "Birthday Morning 7:00 AM",
      hi: "जन्मदिन अथवा शुभ मुहूर्त प्रातः 7:00 बजे",
      te: "జన్మదినం ఉదయం 7:00 గంటలకు",
      ta: "பிறந்தநாள் காலை 7:00 மணிக்கு"
    },
    requiredItems: {
      kn: "ಬೆಲ್ಲ, ತುಪ್ಪ, ಹಾಲು, ಚರು, ಆಯುಷ್ಯ ಸಮಿಧೆ, ಹೂವು",
      en: "Jaggery, Ghee, Milk, Charu, Ayushya Samidha, Flowers",
      hi: "गुड़, घी, दूध, चरु, समिधा, फूल",
      te: "బెల్లం, నెయ్యి, పాలు, సమిధలు, పువ్వులు",
      ta: "வெல்லம், நெய், பால், சமித்து, மலர்கள்"
    },
    fruit: {
      kn: "ದೀರ್ಘಾಯುಷ್ಯ, ಆಯುರಾರೋಗ್ಯ ವೃದ್ಧಿ ಹಾಗೂ ನವ ಚೈತನ್ಯ",
      en: "Vibrant health, long life & rejuvenation",
      hi: "दीर्घायु, उत्तम आरोग्य एवं नव चेतना",
      te: "దీర్ఘాయువు, ఆయురారోగ్యాలు మరియు నవ చైతన్యం",
      ta: "நீண்ட ஆயுள், ஆரோக்கியம் மற்றும் புத்துணர்ச்சி"
    }
  }
};

/** Retrieves hardcoded Pooja Vidhi details table formatted for display in the current language */
export function getHardcodedPoojaVidhiDetails(sevaId: SevaId, lang: string, priestIdOrName?: string) {
  const detail = HARDCODED_POOJA_VIDHI_TABLE[sevaId] || HARDCODED_POOJA_VIDHI_TABLE["rudrabhisheka"];
  const priest = getPriestProfile(priestIdOrName);
  const l = (lang.startsWith("kn") ? "kn" : lang.startsWith("hi") ? "hi" : lang.startsWith("te") ? "te" : lang.startsWith("ta") ? "ta" : "en") as keyof typeof detail.steps;
  const item = SEVA_CATALOG[sevaId];
  const poojaName = item ? (item.name[l] || item.name.en) : sevaId;

  return {
    sevaId,
    poojaName,
    priest,
    steps: detail.steps[l] || detail.steps.en,
    auspiciousTime: detail.auspiciousTime[l] || detail.auspiciousTime.en,
    requiredItems: detail.requiredItems[l] || detail.requiredItems.en,
    fruit: detail.fruit[l] || detail.fruit.en
  };
}
