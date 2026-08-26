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
  residence?: L5;
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
    id: "venkataramana-pandit",
    name: {
      kn: "ವೆಂಕಟರಮಣ ಪಂಡಿತ್",
      en: "Venkataramana Pandit",
      hi: "वेंकटरमण पंडित",
      te: "వెంకటరమణ పండితులు",
      ta: "வேங்கடரமண பண்டிதர்"
    },
    title: {
      kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ವೈದಿಕ ಅರ್ಚಕರು",
      en: "Gokarna Kshetra Chief Vaidika Archaka",
      hi: "गोकर्ण क्षेत्र प्रधान वैदिक अर्चक",
      te: "గోకర్ణ క్షేత్ర ప్రధాన వైదిక అర్చకులు",
      ta: "கோகர்ண க்ஷேத்திர முதன்மை வைதிக அர்ச்சகர்"
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
    residence: {
      kn: "ವೆಂಕಟರಮಣ ಪಂಡಿತರ ಮನೆ, ಗೋಕರ್ಣ",
      en: "Venkataramana Panditara Mane, Gokarna",
      hi: "वेंकटरमण पंडित जी का निवास, गोकर्ण",
      te: "వెంకటరమణ పండితుల నివాసం, గోకర్ణ",
      ta: "வேங்கடரமண பண்டிதர் இல்லம், கோகர்ணம்"
    },
    shloka: {
      sanskrit: "ನಮಃ ಶಂಭವೇ ಚ ಮಯೋಭವೇ ಚ ನಮಃ ಶಂಕರಾಯ ಚ ಮಯಸ್ಕರಾಯ ಚ ನಮಃ ಶಿವಾಯ ಚ ಶಿವತರಾಯ ಚ ||",
      meaningKn: "ವೆಂಕಟರಮಣ ಪಂಡಿತ್ ಅವರ ನೇತೃತ್ವದಲ್ಲಿ ನಡೆದ ಪೂಜಾ ಸಂಕಲ್ಪದಿಂದ ಸಕಲ ಭಕ್ತರಿಗೂ ಮಹಾಬಲೇಶ್ವರನ ದಿವ್ಯ ಅನುಗ್ರಹ, ಸುಖ, ಶಾಂತಿ ಮತ್ತು ಸಕಲ ಕಾರ್ಯಸಿದ್ಧಿ ಲಭಿಸಲಿ.",
      meaningEn: "Under the sacred guidance of Venkataramana Pandit, may all devotees be blessed with Lord Mahabaleshwara's divine grace, peace, and auspicious victory.",
      meaningHi: "वेंकटरमण पंडित जी के मार्गदर्शन में संपन्न पूजा संकल्प से सभी भक्तों को भगवान महाबलेश्वर का दिव्य आशीर्वाद, सुख, शांति एवं सर्व कार्य सिद्धि प्राप्त हो।",
      meaningTe: "వెంకటరమణ పండితులు గారి ఆధ్వర్యంలో జరిగిన పూజా సంకల్పంతో భక్తులందరికీ మహాబలేశ్వరుని దివ్య అనుగ్రహం, సుఖశాంతులు, సర్వకార్యసిద్ధి లభించుగాక.",
      meaningTa: "வேங்கடரமண பண்டிதர் அவர்களின் தலைமையில் நடைபெற்ற பூஜை சங்கல்பத்தால் அனைத்து பக்தர்களுக்கும் மகாபலேஸ்வரரின் அருள், நிம்மதி மற்றும் காரிய சித்தி பெருகட்டும்."
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
  rahubrihaspatishanti: {
    sevaId: "rahubrihaspatishanti",
    steps: {
      kn: [
        "1. ಗುರು ಹಾಗೂ ರಾಹು ಗ್ರಹ ದ್ವಂದ್ವ ಕಲಶ ಸ್ಥಾಪನೆ & ಸಂಕಲ್ಪ",
        "2. ಬೃಹಸ್ಪತಿ ಗಾಯತ್ರಿ ಮತ್ತು ರಾಹು ಬೀಜ ಮಂತ್ರ ಜಪ (108 ಬಾರಿ)",
        "3. ಕಡಲೆಕಾಳು, ಸಾಸಿವೆ, ಹಳದಿ-ಕಪ್ಪು ವಸ್ತ್ರ ಹೋಮದ್ರವ್ಯ ಅರ್ಪಣೆ",
        "4. ಗುರು-ಚಾಂಡಾಲ ಯೋಗ ದೋಷ ಶಮನ ಪೂರ್ಣಾಹುತಿ",
        "5. ಜ್ಞಾನಾಭಿವೃದ್ಧಿ ಮಂತ್ರಾಕ್ಷತೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪ್ರಸಾದ ಸ್ವೀಕಾರ"
      ],
      en: [
        "1. Invocation & Dual Kalasha Sthapana of Guru (Jupiter) and Rahu",
        "2. Brihaspati Gayatri & Rahu Beeja Mantra Chanting (108 times)",
        "3. Oblations of Bengal Gram (Chana Dal), Mustard & Yellow/Black Cloth in Homa",
        "4. Poornahuti for resolving Guru-Chandal Yoga Afflictions",
        "5. Divine Mantrakshate for Wisdom & Gokarna Prasada Distribution"
      ],
      hi: [
        "1. गुरु एवं राहु ग्रह द्वंद्व कलश स्थापना तथा संकल्प",
        "2. बृहस्पति गायत्री एवं राहु बीज मंत्र जप (108 बार)",
        "3. चना दाल, सरसों तथा पीला-काला वस्त्र हवन में अर्पण",
        "4. गुरु-चांडाल योग दोष शमन पूर्णाहुति",
        "5. ज्ञानाभिवृद्धि मंत्राक्षत एवं पावन गोकर्ण प्रसाद ग्रहण"
      ],
      te: [
        "1. గురు మరియు రాహు గ్రహ ద్వంద్వ కలశ స్థాపన మరియు సంకల్పం",
        "2. బృహస్పతి గాయత్రి మరియు రాహు బీజ మంత్ర జపం (108 సార్లు)",
        "3. శనగలు, ఆవాలు మరియు పసుపు-నలుపు వస్త్ర హోమ సమర్పణ",
        "4. గురు-చండాల దోష నివారణ పూర్ణాహుతి",
        "5. జ్ఞానాభివృద్ధి మంత్రాక్షతలు మరియు గోకర్ణ ప్రసాద స్వీకారం"
      ],
      ta: [
        "1. குரு மற்றும் ராகு கிரக த்வந்த கலச ஸ்தாபனம் & சங்கல்பம்",
        "2. பிரகஸ்பதி காயத்ரி மற்றும் ராகு பீஜ மந்திர ஜபம் (108 முறை)",
        "3. கொண்டைக்கடலை, கடுகு மற்றும் மஞ்சள்-கருப்பு ஆடை ஹோமம்",
        "4. குரு-சண்டாள தோஷ நிவர்த்தி பூர்ணாஹுதி",
        "5. ஞானாபிவிருத்தி மந்திராட்சதை மற்றும் கோகர்ண பிரசாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಗುರುವಾರ ಅಥವಾ ಮಂಗಳವಾರ ಬೆಳಗ್ಗೆ 7:30 ರಿಂದ 10:30 ರವರೆಗೆ",
      en: "Thursday or Tuesday Morning 7:30 AM to 10:30 AM",
      hi: "गुरुवार अथवा मंगलवार प्रातः 7:30 बजे से 10:30 बजे तक",
      te: "గురువారం లేదా మంగళవారం ఉదయం 7:30 నుండి 10:30 వరకు",
      ta: "வியாழன் அல்லது செவ்வாய் காலை 7:30 மணி முதல் 10:30 மணி வரை"
    },
    requiredItems: {
      kn: "ಕಡಲೆಕಾಳು, ಸಾಸಿವೆ, ಹಳದಿ ಮತ್ತು ಕಪ್ಪು ವಸ್ತ್ರ, ಹಳದಿ ಪುಷ್ಪ, ಶ್ರೀಗಂಧ",
      en: "Chana Dal, Mustard seeds, Yellow & Black Cloth, Yellow Flowers, Sandalwood",
      hi: "चना दाल, सरसों, पीला व काला कपड़ा, पीले फूल, चंदन",
      te: "శనగలు, ఆవాలు, పసుపు-నలుపు వస్త్రాలు, పసుపు పువ్వులు, చందనం",
      ta: "கொண்டைக்கடலை, கடுகு, மஞ்சள்-கருப்பு ஆடை, மஞ்சள் மலர்கள், சந்தனம்"
    },
    fruit: {
      kn: "ಗುರು-ಚಾಂಡಾಲ ದೋಷ ನಿವಾರಣೆ, ಬುದ್ಧಿ ವಿಕಾಸ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ-ಆರ್ಥಿಕ ಸಿದ್ಧಿ",
      en: "Resolution of Guru-Chandal Yoga, mental clarity & spiritual-financial stability",
      hi: "गुरु-चांडाल दोष निवारण, मानसिक स्पष्टता तथा आध्यात्मिक व आर्थिक समृद्धि",
      te: "గురు-చండాల దోష నివారణ, బుద్ధి వికాసం మరియు ఆధ్యాత్మిక, ఆర్థిక స్థిరత్వం",
      ta: "குரு-சண்டாள தோஷ நிவர்த்தி, மனத்தெளிவு மற்றும் பொருளாதார ஸ்திரத்தன்மை"
    }
  },
  kujashanti_rahubrihaspati_mrityunjaya: {
    sevaId: "kujashanti_rahubrihaspati_mrityunjaya",
    steps: {
      kn: [
        "1. ಕುಜ, ರಾಹು, ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಶ್ರೀ ಮಹಾಮೃತ್ಯುಂಜಯ ಶಿವ ಆವಾಹನೆ & ಮಹಾಸಂಕಲ್ಪ",
        "2. ಅಂಗಾರಕ, ರಾಹು-ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಮಹಾಮೃತ್ಯುಂಜಯ ರುದ್ರ ಸೂಕ್ತ ಮಂತ್ರ ಜಪ",
        "3. ತ್ರಿವಿಧ ದ್ರವ್ಯ (ತೊಗರಿ, ಕಡಲೆ, ಎಳ್ಳು, ತುಪ್ಪ, ಗರಿಕಾರ್ಪಣೆ) ಮಹಾ ಹವನ",
        "4. ಸರ್ವದೋಷ ಶಮನ, ಅಪಮೃತ್ಯು ನಿವಾರಣಾ ಮಹಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ತ್ರಿವಿಧ ರಕ್ಷಾ ಸೂತ್ರ ಧಾರಣೆ, ತೀರ್ಥ ಪ್ರಸಾದ ಹಾಗೂ ಮಹಾಶೀರ್ವಾದ ಸ್ವೀಕಾರ"
      ],
      en: [
        "1. Invocation of Kuja, Rahu, Brihaspati & Maha Mrityunjaya Shiva with Maha Sankalpa",
        "2. Chanting of Angaraka, Rahu-Brihaspati & Maha Mrityunjaya Rudra Sukta Mantras",
        "3. Maha Homa offering Toor Dal, Chana Dal, Sesame, Ghee & sacred Durva grass",
        "4. Supreme Poornahuti for all-dosha pacification & longevity protection",
        "5. Tying of Tri-fold Protection Thread, Teertha Prasada & Grand Priestly Benediction"
      ],
      hi: [
        "1. कुज, राहु, बृहस्पति एवं महा मृत्युंजय शिव आवाहन तथा महासंकल्प",
        "2. अंगारक, राहु-बृहस्पति तथा महामृत्युंजय रुद्र सूक्त मंत्र जप",
        "3. त्रिविध द्रव्य (तुअर, चना, तिल, घृत, दूर्वा) महा हवन",
        "4. सर्वदोष निवारण एवं अपमृत्यु रक्षा महा पूर्णाहुति",
        "5. त्रिविध रक्षा सूत्र धारण, तीर्थ प्रसाद एवं मुख्य अर्चक आशीर्वाद"
      ],
      te: [
        "1. కుజ, రాహు, బృహస్పతి మరియు మహా మృత్యుంజయ శివ ఆవాహన & మహా సంకల్పం",
        "2. అంగారక, రాహు-బృహస్పతి మరియు మహామృత్యుంజయ రుద్ర సూక్త మంత్ర జపం",
        "3. త్రివిధ ద్రవ్య (కందులు, శనగలు, నువ్వులు, నెయ్యి, దూర్వా) మహా హోమం",
        "4. సర్వదోష నివారణ మరియు ఆయురారోగ్య రక్షా మహా పూర్ణాహుతి",
        "5. త్రివిధ రక్షా సూత్రం, తీర్థ ప్రసాదం మరియు దివ్య ఆశీస్సులు"
      ],
      ta: [
        "1. செவ்வாய், ராகு, பிரகஸ்பதி & மகா மிருத்யுஞ்சய சிவ ஆவாஹனம் & மகா சங்கல்பம்",
        "2. அங்காரக, ராகு-பிரகஸ்பதி & மகா மிருத்யுஞ்சய ருத்ர சூக்த மந்திர ஜபம்",
        "3. துவரம்பருப்பு, கொண்டைக்கடலை, எள், நெய், அருகம்புல் மகா ஹோமம்",
        "4. சர்வதோஷ நிவர்த்தி & ஆயுள் ரக்ஷா மகா பூர்ணாஹுதி",
        "5. த்ரிவித ரக்ஷா சூத்திரம், தீர்த்த பிரசாதம் & திவ்ய ஆசீர்வாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಮಂಗಳವಾರ, ಗುರುವಾರ ಅಥವಾ ಪ್ರದೋಷ ಕಾಲ ಬೆಳಗ್ಗೆ 7:00 ರಿಂದ 11:30 ರವರೆಗೆ",
      en: "Tuesday, Thursday, or Pradosha Morning 7:00 AM to 11:30 AM",
      hi: "मंगलवार, गुरुवार अथवा प्रदोष काल प्रातः 7:00 बजे से 11:30 बजे तक",
      te: "మంగళవారం, గురువారం లేదా ప్రదోష కాలంలో ఉదయం 7:00 నుండి 11:30 వరకు",
      ta: "செவ்வாய், வியாழன் அல்லது பிரதோஷ காலை 7:00 மணி முதல் 11:30 மணி வரை"
    },
    requiredItems: {
      kn: "ತೊಗರಿಬೇಳೆ, ಕಡಲೆಕಾಳು, ಎಳ್ಳು, ಕೆಂಪು-ಹಳದಿ-ಬಿಳಿ ವಸ್ತ್ರ, ಬಿಲ್ವಪತ್ರೆ, ತುಪ್ಪ, ಜೇನುತುಪ್ಪ",
      en: "Toor Dal, Chana Dal, Sesame, Red/Yellow/White Cloth, Bilva Leaves, Ghee, Honey",
      hi: "तुअर दाल, चना दाल, तिल, लाल-पीला-श्वेत वस्त्र, बिल्वपत्र, घी, शहद",
      te: "కందులు, శనగలు, నువ్వులు, ఎరుపు-పసుపు-తెలుపు వస్త్రాలు, బిల్వపత్రాలు, నెయ్యి, తేనె",
      ta: "துவரம்பருப்பு, கொண்டைக்கடலை, எள், சிவப்பு-மஞ்சள்-வெள்ளை ஆடை, வில்வ இலை, நெய், தேன்"
    },
    fruit: {
      kn: "ವಿವಾಹ ವಿಳಂಬ ನಿವಾರಣೆ, ಗುರು-ಚಾಂಡಾಲ ಶಮನ, ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಸರ್ವ ಸಂಕಷ್ಟ ರಕ್ಷಣಾ ಕವಚ",
      en: "Marital harmony, Guru-Chandal resolution, robust health, longevity & divine shield",
      hi: "विवाह बाधा निवारण, गुरु-चांडाल शांति, दीर्घायु तथा सर्व संकट नाशक दिव्य सुरक्षा",
      te: "వివాహ జాప్య నివారణ, గురు-చండాల శాంతి, దీర్ఘాయువు మరియు సర్వ సంకట రక్షణ",
      ta: "திருமண தடை நீங்குதல், குரு-சண்டாள சாந்தி, நீண்ட ஆயுள் மற்றும் தெய்வீக ரக்ஷை"
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
,
  rahuketushanti: {
    sevaId: "rahuketushanti",
    steps: {
      kn: [
        "1. ನವಗ್ರಹ ಮಂಡಲ ಸ್ಥಾಪನೆ & ರಾಹು-ಕೇತು ಆವಾಹನೆ",
        "2. ರಾಹು-ಕೇತು ಗಾಯತ್ರಿ ಜಪ ಹಾಗೂ ತಿಲ-ಉದ್ದಿನ ಆಹುತಿ",
        "3. ಸರ್ಪ ದೋಷ ಶಾಂತಿ ಪ್ರಾರ್ಥನೆ & ದೂರ್ವಾರ್ಪಣೆ",
        "4. ಮಹಾ ಪೂರ್ಣಾಹುತಿ & ಧೂಪ-ದೀಪ ಆರತಿ",
        "5. ರಕ್ಷಾ ಸೂತ್ರ ಧಾರಣೆ & ಮಂತ್ರಾಕ್ಷತೆ ಆಶೀರ್ವಾದ"
      ],
      en: [
        "1. Navagraha Mandala consecration & Rahu-Ketu Avahana",
        "2. Rahu-Ketu Gayatri chanting & Sesame/Black gram oblations",
        "3. Sarpa Dosha Shanti prayer & Sacred Durva offerings",
        "4. Maha Poornahuti & Incense Light Arati",
        "5. Sacred protective thread tying & Mantrakshate blessing"
      ],
      hi: [
        "1. नवग्रह मंडल स्थापना एवं राहु-केतु आवाहन",
        "2. राहु-केतु गायत्री जप एवं तिल-उड़द आहुति",
        "3. सर्प दोष शांति प्रार्थना एवं दूर्वा अर्पण",
        "4. महा पूर्णाहुति एवं धूप-दीप आरती",
        "5. रक्षा सूत्र बंधन एवं मंत्राक्षत आशीर्वाद"
      ],
      te: [
        "1. నవగ్రహ మండప స్థాపన మరియు రాహు-కేతు ఆవాహన",
        "2. రాహు-కేతు గాయత్రీ జపం మరియు తిల హోమం",
        "3. సర్ప దోష శాంతి ప్రార్థన మరియు దూర్వా సమర్పణ",
        "4. మహా పూర్ణాహుతి మరియు మంగళ హారతి",
        "5. రక్షా సూత్ర ధారణ మరియు మంత్రాక్షతలు"
      ],
      ta: [
        "1. நவகிரக மண்டல ஸ்தாபனம் மற்றும் ராகு-கேது ஆவாஹனம்",
        "2. ராகு-கேது காயத்ரி ஜபமும் எள் ஹோம திரவியமும்",
        "3. சர்ப்ப தோஷ சாந்தி பிரார்த்தனையும் அருகம்புல் சமர்ப்பணமும்",
        "4. மகா பூர்ணாஹுதியும் மங்கள ஆரத்தியும்",
        "5. ரக்ஷா தாரணமும் மந்திராட்சதை ஆசியும்"
      ]
    },
    auspiciousTime: {
      kn: "ಮಂಗಳವಾರ ಅಥವಾ ಶನಿವಾರ ರಾಹು ಕಾಲ",
      en: "Tuesday or Saturday during Rahu Kaala",
      hi: "मंगलवार अथवा शनिवार राहु काल",
      te: "మంగళవారం లేదా శనివారం రాహు కాలం",
      ta: "செவ்வாய் அல்லது சனிக்கிழமை ராகு காலம்"
    },
    requiredItems: {
      kn: "ಕಪ್ಪು ಎಳ್ಳು, ಉದ್ದು, ಸಾಸಿವೆ, ದೂರ್ವೆ, ನಾಗ ಪ್ರತಿಮೆ",
      en: "Black Sesame, Urad Dal, Mustard, Durva grass, Naga idol",
      hi: "काले तिल, उड़द, सरसों, दूर्वा, नाग प्रतिमा",
      te: "నల్ల నువ్వులు, మినుములు, ఆవాలు, గరిక, నాగ ప్రతిమ",
      ta: "கருப்பு எள், உளுந்து, கடுகு, அருகம்புல், நாகர் விக்கிரகம்"
    },
    fruit: {
      kn: "ಸರ್ಪ ದೋಷ ನಿವಾರಣೆ, ಆಕಸ್ಮಿಕ ಸಂಕಷ್ಟ ಶಮನ ಹಾಗೂ ಮಾನಸಿಕ ನೆಮ್ಮದಿ",
      en: "Dissolution of Sarpa Dosha, protection from sudden perils, and inner peace",
      hi: "सर्प दोष निवारण, आकस्मिक बाधा शांति एवं मानसिक शांति",
      te: "సర్ప దోష నివారణ, ఆకస్మిక ఇబ్బందుల శమనం మరియు మానసిక ప్రశాంతత",
      ta: "சர்ப்ப தோஷ நிவர்த்தி மற்றும் மன அமைதி"
    }
  },

  kalasarpashanti: {
    sevaId: "kalasarpashanti",
    steps: {
      kn: [
        "1. ಅಷ್ಟ ನಾಗ ಮಂಡಲ ರಚನೆ & ಪ್ರಾಣ ಪ್ರತಿಷ್ಠಾಪನೆ",
        "2. ಕಾಲಸರ್ಪ ನಿವಾರಕ ಮಹಾಮಂತ್ರ ಜಪ ಹಾಗೂ ಕ್ಷೀರಾಭಿಷೇಕ",
        "3. ನವನಾಗ ಸ್ತೋತ್ರ ಪಾರಾಯಣ & ತುಪ್ಪದ ಆಹುತಿ",
        "4. ಮಹಾ ಪೂರ್ಣಾಹುತಿ & ಸುವರ್ಣ-ರಜತ ನಾಗ ದಾನ",
        "5. ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ & ದಿವ್ಯ ರಕ್ಷಾ ಮಂತ್ರಾಕ್ಷತೆ"
      ],
      en: [
        "1. Ashta Naga Mandala consecration & Prana Pratishtha",
        "2. Kala Sarpa Nivaran Maha Mantra Japa & Milk Abhishekam",
        "3. Navanaga Stotra Parayana & Ghee oblations",
        "4. Maha Poornahuti & Gold/Silver Naga Danam",
        "5. Holy water sprinkling & Divine protective Mantrakshate"
      ],
      hi: [
        "1. अष्टनाग मंडल रचना एवं प्राण प्रतिष्ठा",
        "2. कालसर्प निवारक महामंत्र जप एवं दुग्धाभिषेक",
        "3. नवनाग स्तोत्र पाठ एवं घृत आहुति",
        "4. महा पूर्णाहुति एवं नाग दान",
        "5. तीर्थ मार्जन एवं रक्षा मंत्राक्षत"
      ],
      te: [
        "1. అష్ట నాగ మండల స్థాపన మరియు ప్రాణ ప్రతిష్ఠ",
        "2. కాలసర్ప నివారక మహామంత్ర జపం మరియు క్షీరాభిషేకం",
        "3. నవనాగ స్తోత్ర పారాయణం మరియు నెయ్యి హోమం",
        "4. మహా పూర్ణాహుతి మరియు నాగ దానం",
        "5. తీర్థ ప్రసాదం మరియు మంత్రాక్షతలు"
      ],
      ta: [
        "1. அஷ்ட நாக மண்டல ஸ்தாபனம் மற்றும் பிராண பிரதிஷ்டை",
        "2. காலசர்ப்ப நிவாரண மந்திர ஜபமும் பாலாபிஷேகமும்",
        "3. நவநாக ஸ்தோத்திர பாராயணமும் நெய் ஹோமமும்",
        "4. மகா பூர்ணாஹுதியும் நாக தானமும்",
        "5. புனித தீர்த்த தெளிப்பும் மந்திராட்சதை ஆசியும்"
      ]
    },
    auspiciousTime: {
      kn: "ನಾಗ ಪಂಚಮಿ ಅಥವಾ ಶುಭ ಮುಹೂರ್ತ ಬೆಳಗ್ಗೆ 8:00",
      en: "Naga Panchami or Morning 8:00 AM",
      hi: "नाग पंचमी अथवा शुभ मुहूर्त प्रातः 8:00 बजे",
      te: "నాగ పంచమి లేదా ఉదయం 8:00 గంటలకు",
      ta: "நாக பஞ்சமி அல்லது காலை 8:00 மணிக்கு"
    },
    requiredItems: {
      kn: "ಹಾಲು, ತುಪ್ಪ, ಬೆಳ್ಳಿ ನಾಗರ ಜೋಡಿ, ಪಂಚಾಮೃತ, ಹೂವು",
      en: "Milk, Ghee, Silver Naga pair, Panchamrita, Flowers",
      hi: "दूध, घी, चांदी का नाग जोड़ा, पंचामृत, फूल",
      te: "పాలు, నెయ్యి, వెండి నాగ జంట, పంచామృతం, పూలు",
      ta: "பால், நெய், வெள்ளி நாக ஜோடி, பஞ்சாமிர்தம், மலர்கள்"
    },
    fruit: {
      kn: "ಕಾಲಸರ್ಪ ಯೋಗದ ಸಂಪೂರ್ಣ ಶಾಂತಿ, ವೃತ್ತಿ-ವ್ಯವಹಾರದಲ್ಲಿ ಭಾಗ್ಯೋದಯ",
      en: "Complete pacification of Kala Sarpa Yoga & career prosperity",
      hi: "कालसर्प योग की पूर्ण शांति एवं आजीविका में भाग्योदय",
      te: "కాలసర్ప దోష సంపూర్ణ శాంతి మరియు వృత్తి-వ్యాపారాలలో భాగ్యోదయం",
      ta: "காலசர்ப்ப யோக சாந்தி மற்றும் தொழில் முன்னேற்றம்"
    }
  },

  sudarshanahoma: {
    sevaId: "sudarshanahoma",
    steps: {
      kn: [
        "1. ಸುದರ್ಶನ ನರಸಿಂಹ ಯಂತ್ರಾರಾಧನೆ & ಸಂಕಲ್ಪ",
        "2. ಸುದರ್ಶನ ಮೂಲ ಮಂತ್ರ ಹಾಗೂ ನರಸಿಂಹ ಗಾಯತ್ರಿ ಜಪ",
        "3. ತುಳಸಿ, ತುಪ್ಪ ಹಾಗೂ ಸಸ್ಯೌಷಧ ಹೋಮ ದ್ರವ್ಯಾರ್ಪಣೆ",
        "4. ಜ್ವಾಲಾ ನರಸಿಂಹ ಮಹಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ಸುದರ್ಶನ ರಕ್ಷಾ ರಕ್ಷಾದಾನ & ಮಂತ್ರಾಕ್ಷತೆ"
      ],
      en: [
        "1. Sudarshana Narasimha Yantra Puja & Sankalpa",
        "2. Recitation of Sudarshana Moola Mantra & Narasimha Gayatri",
        "3. Sacred Tulasi, Ghee, and herbal Homa offerings",
        "4. Jwala Narasimha Maha Poornahuti",
        "5. Consecrated Sudarshana Raksha shield distribution"
      ],
      hi: [
        "1. सुदर्शन नृसिंह यंत्र पूजन एवं संकल्प",
        "2. सुदर्शन मूल मंत्र एवं नृसिंह गायत्री जप",
        "3. तुलसी, घृत एवं दिव्य औषधीय आहुति",
        "4. ज्वाला नृसिंह महा पूर्णाहुति",
        "5. सुदर्शन रक्षा सूत्र एवं मंत्राक्षत"
      ],
      te: [
        "1. సుదర్శన నరసింహ యంత్ర పూజ మరియు సంకల్పం",
        "2. సుదర్శన మూల మంత్రం మరియు నరసింహ గాయత్రీ జపం",
        "3. తులసి, నెయ్యి మరియు హోమ ద్రవ్య సమర్పణ",
        "4. జ్వాలా నరసింహ మహా పూర్ణాహుతి",
        "5. సుదర్శన రక్షా ప్రసాదం మరియు మంత్రాక్షతలు"
      ],
      ta: [
        "1. சுதர்சன நரசிம்ம யந்திர பூஜையும் சங்கல்பமும்",
        "2. சுதர்சன மூல மந்திரமும் நரசிம்ம காயத்ரி ஜபமும்",
        "3. துளசி, நெய் மற்றும் மூலிகை திரவிய சமர்ப்பணம்",
        "4. ஜ்வாலா நரசிம்ம மகா பூர்ணாஹுதி",
        "5. சுதர்சன ரக்ஷா பிரசாதமும் மந்திராட்சதையும்"
      ]
    },
    auspiciousTime: {
      kn: "ಬುಧವಾರ, ಶನಿವಾರ ಅಥವಾ ಏಕಾದಶಿ ಬೆಳಗ್ಗೆ",
      en: "Wednesday, Saturday or Ekadashi Morning",
      hi: "बुधवार, शनिवार अथवा एकादशी प्रातःकाल",
      te: "బుధవారం, శనివారం లేదా ఏకాదశి ఉదయం",
      ta: "புதன், சனிக்கிழமை அல்லது ஏகாதசி காலை"
    },
    requiredItems: {
      kn: "ತುಳಸಿ ಮಾಲೆ, ತುಪ್ಪ, ಚಂದನ, ಕುಂಕುಮ, ನೈವೇದ್ಯ",
      en: "Tulasi garland, Ghee, Sandalwood paste, Kumkuma, Sweet offerings",
      hi: "तुलसी माला, घी, चंदन, कुमकुम, नैवेद्य",
      te: "తులసి మాల, నెయ్యి, చందనం, కుంకుమ, నైవేద్యం",
      ta: "துளசி மாலை, நெய், சந்தனம், குங்குமம், நைவேத்தியம்"
    },
    fruit: {
      kn: "ಸಕಲ ಶತ್ರು ನಾಶ, ದುಷ್ಟ ದೃಷ್ಟಿ ನಿವಾರಣೆ ಹಾಗೂ ಅಭೇದ್ಯ ದೈವಿಕ ರಕ್ಷಣೆ",
      en: "Destruction of obstacles/evil eye and impenetrable divine protection",
      hi: "सर्व शत्रु बाधा नाश, कुदृष्टि निवारण एवं अभेद्य दैवीय सुरक्षा",
      te: "శత్రు బాధల నాశనం, దిష్టి దోషాల నివారణ మరియు దివ్య రక్షణ",
      ta: "சத்ரு பயம் மற்றும் கண் திருஷ்டி நீங்கி பூரண பாதுகாப்பு"
    }
  },

  dhanvantarihoma: {
    sevaId: "dhanvantarihoma",
    steps: {
      kn: [
        "1. ಅಮೃತ ಕಲಶ ಸ್ಥಾಪನೆ & ಧನ್ವಂತರಿ ಆವಾಹನೆ",
        "2. ಧನ್ವಂತರಿ ಮೂಲ ಮಂತ್ರ ಹಾಗೂ ಅಮೃತ ಸೂಕ್ತ ಜಪ",
        "3. ದಿವ್ಯ ಆಯುರ್ವೇದ ಸಸ್ಯೌಷಧ ಹಾಗೂ ತುಪ್ಪದ ಆಹುತಿ",
        "4. ಅಮೃತ ಆರೋಗ್ಯ ಮಹಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ಧನ್ವಂತರಿ ತೀರ್ಥ ಪ್ರಸಾದ ಸ್ವೀಕಾರ"
      ],
      en: [
        "1. Amrita Kalasha installation & Dhanvantari Avahana",
        "2. Dhanvantari Moola Mantra & Amrita Sukta recitation",
        "3. Sacred Ayurvedic medicinal herbs & Ghee offerings",
        "4. Amrita Arogya Maha Poornahuti",
        "5. Consecrated Dhanvantari healing water distribution"
      ],
      hi: [
        "1. अमृत कलश स्थापना एवं धन्वंतरि आवाहन",
        "2. धन्वंतरि मूल मंत्र एवं अमृत सूक्त जप",
        "3. दिव्य आयुर्वेदिक औषधियां एवं घृत आहुति",
        "4. अमृत आरोग्य महा पूर्णाहुति",
        "5. धन्वंतरि पावन तीर्थ प्रसाद ग्रहण"
      ],
      te: [
        "1. అమృత కలశ స్థాపన మరియు ధన్వంతరి ఆవాహన",
        "2. ధన్వంతరి మూల మంత్రం మరియు అమృత సూక్త జపం",
        "3. ఆయుర్వేద మూలికలు మరియు నెయ్యి హోమ సమర్పణ",
        "4. అమృత ఆరోగ్య మహా పూర్ణాహుతి",
        "5. ధన్వంతరి తీర్థ ప్రసాద స్వీకారం"
      ],
      ta: [
        "1. அமிர்த கலச ஸ்தாபனம் மற்றும் தன்வந்திரி ஆவாஹனம்",
        "2. தன்வந்திரி மூல மந்திரமும் அமிர்த சூக்த ஜபமும்",
        "3. ஆயுர்வேத மூலிகைகளும் நெய் ஹோம திரவியமும்",
        "4. அமிர்த ஆரோக்கிய மகா பூர்ணாஹுதி",
        "5. தன்வந்திரி தீர்த்த பிரசாதம் பெறுதல்"
      ]
    },
    auspiciousTime: {
      kn: "ಭಾನುವಾರ ಅಥವಾ ತ್ರಯೋದಶಿ ಬೆಳಗ್ಗೆ 7:30",
      en: "Sunday or Trayodashi Morning 7:30 AM",
      hi: "रविवार अथवा त्रयोदशी प्रातः 7:30 बजे",
      te: "ఆదివారం లేదా త్రయోదశి ఉదయం 7:30 గంటలకు",
      ta: "ஞாயிறு அல்லது திரயோதசி காலை 7:30 மணிக்கு"
    },
    requiredItems: {
      kn: "ತುಳಸಿ, ಅಮೃತ ಬಳ್ಳಿ, ಚೂರ್ಣ, ಜೇನುತುಪ್ಪ, ಹಸುವಿನ ತುಪ್ಪ",
      en: "Tulasi, Giloy herbs, Medicinal churnas, Honey, Pure Cow Ghee",
      hi: "तुलसी, गिलोय, औषधीय चूर्ण, शहद, गाय का घी",
      te: "తులసి, తిప్పతీగ, ఔషధ చూర్ణం, తేనె, ఆవు నెయ్యి",
      ta: "துளசி, சீந்தில் கொடி, மூலிகை சூரணம், தேன், பசு நெய்"
    },
    fruit: {
      kn: "ದೀರ್ಘ ರೋಗ ನಿವಾರಣೆ, ಶಾರೀರಿಕ ಚೈತನ್ಯ ಹಾಗೂ ಅಮೃತ ಆಯುರಾರೋಗ್ಯ",
      en: "Cure of chronic illness, physical stamina, and longevity",
      hi: "दीर्घ रोगों से मुक्ति, शारीरिक ऊर्जा एवं उत्तम आरोग्य",
      te: "దీర్ಘ అనారోగ్య నివారణ, శారీరక బలం మరియు సంపూర్ణ ఆయురారోగ్యాలు",
      ta: "தீராத நோய் நீங்கி தேக ஆரோக்கியம் மற்றும் நீண்ட ஆயுள்"
    }
  },

  pitrudoshashanti: {
    sevaId: "pitrudoshashanti",
    steps: {
      kn: [
        "1. ಪವಿತ್ರ ತೀರ್ಥ ಸಂಕಲ್ಪ & ಪಿತೃ ತರ್ಪಣ",
        "2. ತಿಲ ಹೋಮ & ಪಿತೃ ಗಾಯತ್ರಿ ಪಠಣ",
        "3. ಪಿಂಡ ಸಮರ್ಪಣೆ & ವಾಸೋದಕ ದಾನ",
        "4. ಮಹಾ ಪಿತೃ ತೃಪ್ತಿ ಪೂರ್ಣಾಹುತಿ",
        "5. ಅನ್ನದಾನ & ಪಿತೃ ಕೃಪಾಶೀರ್ವಾದ"
      ],
      en: [
        "1. Sacred Tirtha Sankalpa & Pitru Tarpanam",
        "2. Tila Homa & Pitru Gayatri recitation",
        "3. Pinda offering & Sacred water libations",
        "4. Maha Pitru Trupti Poornahuti",
        "5. Anna Danam & Ancestral blessing reception"
      ],
      hi: [
        "1. पावन तीर्थ संकल्प एवं पितृ तर्पण",
        "2. तिल होम एवं पितृ गायत्री पाठ",
        "3. पिंड अर्पण एवं तिलोदक दान",
        "4. महा पितृ तृप्ति पूर्णाहुति",
        "5. अन्नदान एवं पितृ आशीर्वाद"
      ],
      te: [
        "1. పవిత్ర తీర్థ సంకల్పం మరియు పితృ తర్పణం",
        "2. తిల హోమం మరియు పితృ గాయత్రీ పారాయణం",
        "3. పిండ ప్రదానం మరియు తిలోదక సమర్పణ",
        "4. మహా పితృ తృప్తి పూర్ణాహుతి",
        "5. అన్నదానం మరియు పితృ ఆశీస్సులు"
      ],
      ta: [
        "1. புனித தீர்த்த சங்கல்பமும் பித்ரு தர்பணமும்",
        "2. எள் ஹோமமும் பித்ரு காயத்ரி பாராயணமும்",
        "3. பிண்ட சமர்ப்பணமும் திலோதக தானமும்",
        "4. மகா பித்ரு திருப்தி பூர்ணாஹுதி",
        "5. அன்னதானமும் பித்ரு ஆசீர்வாதமும்"
      ]
    },
    auspiciousTime: {
      kn: "ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಪಿತೃ ಪಕ್ಷ ಮಧ್ಯಾಹ್ನ 11:30",
      en: "Amavasya or Pitru Paksha 11:30 AM",
      hi: "अमावस्या अथवा पितृ पक्ष दोपहर 11:30 बजे",
      te: "అమావాస్య లేదా పితృ పక్షం మధ్యాహ్నం 11:30 గంటలకు",
      ta: "அமாவாசை அல்லது பித்ரு பட்சம் நண்பகல் 11:30 மணிக்கு"
    },
    requiredItems: {
      kn: "ಕಪ್ಪು ಎಳ್ಳು, ದರ್ಭೆ, ಅಕ್ಕಿಹಿಟ್ಟು, ತುಪ್ಪ, ಜವೆಗೋಧಿ",
      en: "Black sesame, Darbha grass, Rice flour, Ghee, Barley",
      hi: "काले तिल, कुशा, चावल का आटा, घी, जौ",
      te: "నల్ల నువ్వులు, దర్భలు, బియ్యపు పిండి, నెయ్యి, యవలు",
      ta: "கருப்பு எள், தர்பை புல், அரிசி மாவு, நெய், பார்லி"
    },
    fruit: {
      kn: "ಪಿತೃ ಶಾಂತಿ, ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ",
      en: "Ancestral peace, lineage growth, and family prosperity",
      hi: "पितरों को शांति, वंश वृद्धि एवं पारिवारिक समृद्धि",
      te: "పితృ శాంతి, వంశాభివృద్ధి మరియు కుటుంబ సౌఖ్యం",
      ta: "பித்ருக்களுக்கு சாந்தியும் வம்ச சுபிட்சமும் உண்டாகும்"
    }
  },

  vastushanti: {
    sevaId: "vastushanti",
    steps: {
      kn: [
        "1. ವಾಸ್ತು ಪುರುಷ ಮಂಡಲ ರಚನೆ & ದಿಕ್ಪಾಲಕ ಪೂಜೆ",
        "2. ನವಗ್ರಹ & ವಾಸ್ತು ಸೂಕ್ತ ಪಾರಾಯಣ",
        "3. ನವಧಾನ್ಯ ಹಾಗೂ ಕ್ಷೀರ-ತುಪ್ಪದ ಹೋಮಾರ್ಪಣೆ",
        "4. ವಾಸ್ತು ಪೂರ್ಣಾಹುತಿ & ದಿಕ್ಬಲಿ ಪ್ರದಾನ",
        "5. ಕಲಶೋದಕ ಗೃಹ ಪ್ರೋಕ್ಷಣೆ & ಮಂಗಲಾರತಿ"
      ],
      en: [
        "1. Vastu Purusha Mandala formation & Dikpalaka Puja",
        "2. Navagraha & Vastu Sukta chanting",
        "3. Navadhanya, Milk, and Ghee Homa offerings",
        "4. Vastu Poornahuti & Sacred Dikbali offerings",
        "5. Sanctified Kalasha water home purification & Mangalarati"
      ],
      hi: [
        "1. वास्तु पुरुष मंडल रचना एवं दिक्पालक पूजन",
        "2. नवग्रह एवं वास्तु सूक्त पाठ",
        "3. नवधान्य, दुग्ध एवं घृत आहुति",
        "4. वास्तु पूर्णाहुति एवं बलि अर्पण",
        "5. कलश जल गृह मार्जन एवं मंगल आरती"
      ],
      te: [
        "1. వాస్తు పురుష మండల నిర్మాణం మరియు దిక్పాలకుల పూజ",
        "2. నవగ్రహ మరియు వాస్తు సూక్త పారాయణం",
        "3. నవధాన్యాలు, పాలు మరియు నెయ్యి హోమం",
        "4. వాస్తు పూర్ణాహుతి మరియు బలి సమర్పణ",
        "5. కలశోదక గృహ ప్రోక్షణ మరియు మంగళ హారతి"
      ],
      ta: [
        "1. வாஸ்து புருஷ மண்டல பூஜையும் திக்பாலகர் வழிபாடும்",
        "2. நவகிரக மற்றும் வாஸ்து சூக்த பாராயணம்",
        "3. நவதானியம், பால் மற்றும் நெய் ஹோம திரவியம்",
        "4. வாஸ்து பூர்ணாஹுதியும் திக்பலி சமர்ப்பணமும்",
        "5. கலச தீர்த்த இல்ல புனிதம் மற்றும் மங்கள ஆரத்தி"
      ]
    },
    auspiciousTime: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷ ಶುಭ ಮುಹೂರ್ತ ಬೆಳಗ್ಗೆ 6:30",
      en: "Shukla Paksha Auspicious Muhurtha 6:30 AM",
      hi: "शुक्ल पक्ष शुभ मुहूर्त प्रातः 6:30 बजे",
      te: "శుక్ల పక్ష శుభ ముహూర్తం ఉదయం 6:30 గంటలకు",
      ta: "சுக்ல பட்ச சுப முகூர்த்தம் காலை 6:30 மணிக்கு"
    },
    requiredItems: {
      kn: "ನವಧಾನ್ಯ, ಪಂಚಲೋಹ, ತುಪ್ಪ, ಹಾಲು, ಕುಂಬಳಕಾಯಿ",
      en: "Navadhanya, Panchaloha metal, Ghee, Milk, Ash Gourd",
      hi: "नवधान्य, पंचधातु, घी, दूध, पेठा (कुम्हड़ा)",
      te: "నవధాన్యాలు, పంచలోహాలు, నెయ్యి, పాలు, బూడిద గుమ్మడి",
      ta: "நவதானியங்கள், பஞ்சலோகம், நெய், பால், பூசணிக்காய்"
    },
    fruit: {
      kn: "ಗೃಹ ಶಾಂತಿ, ವಾಸ್ತು ದೋಷ ಶಮನ ಹಾಗೂ ನಿರಂತರ ಧನಾಗಮನ",
      en: "Harmonious domestic life, Vastu clearance, and prosperity",
      hi: "गृह शांति, वास्तु दोष निवारण एवं धन-वैभव की वृद्धि",
      te: "గృహ శాంతి, వాస్తు దోష నివారణ మరియు సంపద పెరుగుదల",
      ta: "இல்லத்தில் அமைதி, வாஸ்து தோஷ நிவர்த்தி மற்றும் தன வரவு"
    }
  },

  mahalakshmihoma: {
    sevaId: "mahalakshmihoma",
    steps: {
      kn: [
        "1. ಶ್ರೀ ಚಕ್ರ & ಮಹಾಲಕ್ಷ್ಮೀ ಆವಾಹನೆ",
        "2. ಶ್ರೀ ಸೂಕ್ತ & ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಜಪ",
        "3. ಕಮಲದ ಹೂವು, ಕಲ್ಲುಸಕ್ಕರೆ, ತುಪ್ಪ ಹಾಗೂ ಪಾಯಸಾರ್ಪಣೆ",
        "4. ಮಹಾಲಕ್ಷ್ಮೀ ಸೌಭಾಗ್ಯ ಪೂರ್ಣಾಹುತಿ",
        "5. ಕುಂಕುಮಾರ್ಚನೆ ಪ್ರಸಾದ & ಶ್ರೀ ಫಲ ದಾನ"
      ],
      en: [
        "1. Sri Chakra & Mahalakshmi Avahana",
        "2. Sri Sukta & Kanakadhara Stotra chanting",
        "3. Lotus flowers, Sugar candy, Ghee & Sweet Payasam offerings",
        "4. Mahalakshmi Saubhagya Poornahuti",
        "5. Kumkuma Archana Prasada & Coconut blessing distribution"
      ],
      hi: [
        "1. श्री चक्र एवं महालक्ष्मी आवाहन",
        "2. श्री सूक्त एवं कनकधारा स्तोत्र पाठ",
        "3. कमल पुष्प, मिश्री, घृत एवं खीर की आहुति",
        "4. महालक्ष्मी सौभाग्य पूर्णाहुति",
        "5. कुमकुम अर्चन प्रसाद एवं श्रीफल वितरण"
      ],
      te: [
        "1. శ్రీ చక్ర మరియు మహాలక్ష్మీ ఆవాహన",
        "2. శ్రీ సూక్తం మరియు కనకధారా స్తోత్ర పారాయణం",
        "3. తామర పువ్వులు, కలకండ, నెయ్యి మరియు పాయస హోమం",
        "4. మహాలక్ష్మీ సౌభాగ్య పూర్ణాహుతి",
        "5. కుంకుమార్చన ప్రసాదం మరియు శ్రీఫల దానం"
      ],
      ta: [
        "1. ஸ்ரீ சக்கர மற்றும் மகாலக்ஷ்மி ஆவாஹனம்",
        "2. ஸ்ரீ சூக்தம் மற்றும் கனகதாரா ஸ்தோத்திர ஜபம்",
        "3. தாமரை மலர்கள், கற்கண்டு, நெய் மற்றும் பாயச ஹோமம்",
        "4. மகாலக்ஷ்மி சௌபாக்கிய பூர்ணாஹுதி",
        "5. குங்கும அர்ச்சனை பிரசாதமும் ஸ்ரீபல தானமும்"
      ]
    },
    auspiciousTime: {
      kn: "ಶುಕ್ರವಾರ ಅಥವಾ ಹುಣ್ಣಿಮೆ ಸಂಜೆ 5:30",
      en: "Friday or Purnima Evening 5:30 PM",
      hi: "शुक्रवार अथवा पूर्णिमा सायं 5:30 बजे",
      te: "శుక్రవారం లేదా పౌర్ణమి సాయంత్రం 5:30 గంటలకు",
      ta: "வெள்ளிக்கிழமை அல்லது பௌர்ணமி மாலை 5:30 மணிக்கு"
    },
    requiredItems: {
      kn: "ಕಮಲದ ಹೂವು, ತುಪ್ಪ, ಜೇನುತುಪ್ಪ, ಕುಂಕುಮ, ನಾಣ್ಯಗಳು",
      en: "Lotus flowers, Ghee, Honey, Kumkuma, Gold/Silver coins",
      hi: "कमल पुष्प, घी, शहद, कुमकुम, सिक्के",
      te: "తామర పువ్వులు, నెయ్యి, తేనె, కుంకుమ, నాణేలు",
      ta: "தாமரை மலர்கள், நெய், தேன், குங்குமம், நாணயங்கள்"
    },
    fruit: {
      kn: "ಅಷ್ಟಲಕ್ಷ್ಮೀ ಕೃಪೆ, ವ್ಯಾಪಾರಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಅಖಂಡ ಧನ-ಸಂಪತ್ತು",
      en: "Ashtalakshmi grace, commercial growth, and unbroken abundance",
      hi: "अष्टलक्ष्मी कृपा, व्यापार वृद्धि एवं अखंड धन-संपत्ति",
      te: "అష్టలక్ష్మి కృప, వ్యాపారాభివృద్ధి మరియు అఖండ ఐశ్వర్యం",
      ta: "அஷ்டலக்ஷ்மி அருளால் தொழில் வளர்ச்சி மற்றும் தன லாபம்"
    }
  },

  santangopalahoma: {
    sevaId: "santangopalahoma",
    steps: {
      kn: [
        "1. ಬಾಲಕೃಷ್ಣ ಕಲಶ ಸ್ಥಾಪನೆ & ಸಂಕಲ್ಪ",
        "2. ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರ ಜಪ (೧೦೮ ಬಾರಿ)",
        "3. ಬೆಣ್ಣೆ, ಹಾಲು, ತುಪ್ಪ ಹಾಗೂ ತುಳಸಿ ಆಹುತಿ",
        "4. ಸಂತಾನ ಪ್ರಾಪ್ತಿ ಮಹಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ಫಲ ಮಂತ್ರಾಕ್ಷತೆ ಪ್ರಸಾದ ಸ್ವೀಕಾರ"
      ],
      en: [
        "1. Bala Krishna Kalasha installation & Sankalpa",
        "2. Santana Gopala Mantra Japa (108 chants)",
        "3. Butter, Milk, Ghee, and Tulasi offerings",
        "4. Santana Prapti Maha Poornahuti",
        "5. Consecrated fruit & Mantrakshate blessing reception"
      ],
      hi: [
        "1. बालकृष्ण कलश स्थापना एवं संकल्प",
        "2. संतान गोपाल मंत्र जप (१०८ पाठ)",
        "3. माखन, दूध, घी एवं तुलसी आहुति",
        "4. संतान प्राप्ति महा पूर्णाहुति",
        "5. पावन फल एवं रक्षा मंत्राक्षत"
      ],
      te: [
        "1. బాలకృష్ణ కలశ స్థాపన మరియు సంకల్పం",
        "2. సంతాన గోపాల మంత్ర జపం (108 సార్లు)",
        "3. వెన్న, పాలు, నెయ్యి మరియు తులసి హోమం",
        "4. సంతాన ప్రాప్తి మహా పూర్ణాహుతి",
        "5. ఫల ప్రసాదం మరియు మంత్రాక్షతలు"
      ],
      ta: [
        "1. பாலகிருஷ்ண கலச ஸ்தாபனம் மற்றும் சங்கல்பம்",
        "2. சந்தான கோபால மந்திர ஜபம் (108 முறை)",
        "3. வெண்ணெய், பால், நெய் மற்றும் துளசி சமர்ப்பணம்",
        "4. சந்தான பிராப்தி மகா பூர்ணாஹுதி",
        "5. புனித பழ பிரசாதமும் மந்திராட்சதையும்"
      ]
    },
    auspiciousTime: {
      kn: "ಗುರುವಾರ ಅಥವಾ ರೋಹಿಣಿ ನಕ್ಷತ್ರ ಬೆಳಗ್ಗೆ 8:00",
      en: "Thursday or Rohini Nakshatra Morning 8:00 AM",
      hi: "गुरुवार अथवा रोहिणी नक्षत्र प्रातः 8:00 बजे",
      te: "గురువారం లేదా రోహిణి నక్షత్రం ఉదయం 8:00 గంటలకు",
      ta: "வியாழன் அல்லது ரோகிணி நட்சத்திரம் காலை 8:00 மணிக்கு"
    },
    requiredItems: {
      kn: "ಬೆಣ್ಣೆ, ತುಪ್ಪ, ಹಾಲು, ತುಳಸಿ, ಹಳದಿ ಹೂವು, ಹಣ್ಣುಗಳು",
      en: "Fresh Butter, Ghee, Milk, Tulasi, Yellow flowers, Fruits",
      hi: "माखन, घी, दूध, तुलसी, पीले फूल, फल",
      te: "వెన్న, నెయ్యి, పాలు, తులసి, పసుపు పూలు, పండ్లు",
      ta: "வெண்ணெய், நெய், பால், துளசி, மஞ்சள் மலர்கள், பழங்கள்"
    },
    fruit: {
      kn: "ಸಂತಾನ ಭಾಗ್ಯ ಪ್ರಾಪ್ತಿ, ಗರ್ಭರಕ್ಷೆ ಹಾಗೂ ಸುಂದರ ಸತ್ಸಂತಾನ",
      en: "Blessed progeny, safe pregnancy, and radiant healthy child",
      hi: "संतान सुख प्राप्ति, गर्भ रक्षा एवं तेजस्वी संतान",
      te: "సంతాన ప్రాప్తి, గర్భ రక్షణ మరియు తేజోవంతమైన సంతానం",
      ta: "நற்குழந்தை பாக்கியம், கர்ப்ப ரக்ஷை மற்றும் குடும்ப சுபிட்சம்"
    }
  },

  swayamvaraparvati: {
    sevaId: "swayamvaraparvati",
    steps: {
      kn: [
        "1. ಪಾರ್ವತಿ ಪರಮೇಶ್ವರ ಕಲ್ಯಾಣ ಮಂಡಲ ಆರಾಧನೆ",
        "2. ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಮಹಾಮಂತ್ರ ಜಪ",
        "3. ಕೆಂಪು ಹೂವು, ಕಸ್ತೂರಿ, ಜೇನುತುಪ್ಪ ಹಾಗೂ ತುಪ್ಪದ ಹೋಮ",
        "4. ಕಲ್ಯಾಣ ಸಿದ್ಧಿ ಮಹಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ಸೌಭಾಗ್ಯ ಕುಂಕುಮ & ಕಂಕಣ ಪ್ರಸಾದ ಸ್ವೀಕಾರ"
      ],
      en: [
        "1. Parvati Parameshwara Kalyana Mandala Puja",
        "2. Swayamvara Parvati Maha Mantra recitation",
        "3. Red flowers, Musk, Honey & Ghee offerings",
        "4. Kalyana Siddhi Maha Poornahuti",
        "5. Blessed Saubhagya Kumkuma & Raksha thread reception"
      ],
      hi: [
        "1. पार्वती परमेश्वर कल्याण मंडल पूजन",
        "2. स्वयंवर पार्वती महामंत्र जप",
        "3. लाल पुष्प, कस्तूरी, शहद एवं घृत आहुति",
        "4. विवाह कल्याण सिद्धि महा पूर्णाहुति",
        "5. सौभाग्य कुमकुम एवं कंगन प्रसाद"
      ],
      te: [
        "1. పార్వతీ పరమేశ్వర కళ్యాణ మండల పూజ",
        "2. స్వయంవర పార్వతీ మహామంత్ర జపం",
        "3. ఎరుపు పువ్వులు, కస్తూరి, తేనె మరియు నెయ్యి హోమం",
        "4. వివాహ కళ్యాణ సిద్ధి మహా పూర్ణాహుతి",
        "5. సౌభాగ్య కుంకుమ మరియు కంకణ ప్రసాదం"
      ],
      ta: [
        "1. பார்வதி பரமேஸ்வர கல்யாண மண்டல பூஜை",
        "2. சுயம்வர பார்வதி மகா மந்திர ஜபம்",
        "3. சிவப்பு மலர்கள், கஸ்தூரி, தேன் மற்றும் நெய் ஹோம திரவியம்",
        "4. கல்யாண சித்தி மகா பூர்ணாஹுதி",
        "5. சௌபாக்கிய குங்குமமும் கங்கண பிரசாதமும்"
      ]
    },
    auspiciousTime: {
      kn: "ಶುಕ್ರವಾರ ಅಥವಾ ಪಂಚಮಿ ತಿಥಿ ಬೆಳಗ್ಗೆ 8:30",
      en: "Friday or Panchami Tithi Morning 8:30 AM",
      hi: "शुक्रवार अथवा पंचमी तिथि प्रातः 8:30 बजे",
      te: "శుక్రవారం లేదా పంచమి తిథి ఉదయం 8:30 గంటలకు",
      ta: "வெள்ளிக்கிழமை அல்லது பஞ்சமி திதி காலை 8:30 மணிக்கு"
    },
    requiredItems: {
      kn: "ಕೆಂಪು ಹೂವು, ಮಾಂಗಲ್ಯ ಸೂತ್ರ, ಕುಂಕುಮ, ಅರಿಶಿನ, ಬಳೆಗಳು",
      en: "Red flowers, Sacred Mangalya thread, Kumkuma, Turmeric, Bangles",
      hi: "लाल पुष्प, मंगल सूत्र, कुमकुम, हल्दी, चूड़ियां",
      te: "ఎరుపు పూలు, మంగళ సూత్రం, కుంకుమ, పసుపు, గాజులు",
      ta: "சிவப்பு மலர்கள், மாங்கல்ய கயிறு, குங்குமம், மஞ்சள், வளையல்கள்"
    },
    fruit: {
      kn: "ಶೀಘ್ರ ವಿವಾಹ ಯೋಗ, ಉತ್ತಮ ಜೀವನ ಸಂಗಾತಿ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಅನ್ಯೋನ್ಯ ದಾಂಪತ್ಯ",
      en: "Early marriage, ideal life partner, and harmonious wedded bliss",
      hi: "शीघ्र विवाह योग, योग्य जीवनसाथी की प्राप्ति एवं सुखमय दांपत्य",
      te: "శీఘ్ర వివాహ యోగం, ఉత్తమ భాగస్వామి ప్రాప్తి మరియు దాంపత్య సౌఖ్యం",
      ta: "விரைவில் திருமண யோகம், நற்குண துணை மற்றும் இல்லற இன்பம்"
    }
  }
,
  custom_pooja: {
    sevaId: "custom_pooja",
    steps: {
      kn: [
        "1. ಗಣಪತಿ ಪೂಜೆ & ಪುಣ್ಯಾಹವಾಚನ",
        "2. ಸಂಕಲ್ಪ & ಪವಿತ್ರ ಮಂಡಲ ಸ್ಥಾಪನೆ",
        "3. ಪ್ರಧಾನ ದೇವತಾ ಆವಾಹನೆ & ಮಹಾ ಮಂತ್ರ ಜಪ",
        "4. ಪವಿತ್ರ ದ್ರವ್ಯಾರ್ಪಣೆ & ಮಹಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ತೀರ್ಥ ಪ್ರಸಾದ & ರಕ್ಷಾ ಮಂತ್ರಾಕ್ಷತೆ"
      ],
      en: [
        "1. Ganapati Puja & Punyahavachana",
        "2. Sankalpa & Sacred Mandala installation",
        "3. Pradhana Devata Avahana & Maha Mantra Japa",
        "4. Sacred offerings & Maha Poornahuti",
        "5. Consecrated Prasada & Mantrakshate blessing"
      ],
      hi: [
        "1. गणपति पूजन एवं पुण्याहवाचन",
        "2. संकल्प एवं पावन मंडल स्थापना",
        "3. प्रधान देवता आवाहन एवं महामंत्र जप",
        "4. दिव्य आहुतियां एवं महा पूर्णाहुति",
        "5. तीर्थ प्रसाद एवं रक्षा मंत्राक्षत"
      ],
      te: [
        "1. గణపతి పూజ మరియు పుణ్యాహవాచనం",
        "2. సంకల్పం మరియు పవిత్ర మండల స్థాపన",
        "3. ప్రధాన దేవతా ఆవాహన మరియు మహామంత్ర జపం",
        "4. హోమ ద్రవ్య సమర్పణ మరియు మహా పూర్ణాహుతి",
        "5. తీర్థ ప్రసాదం మరియు మంత్రాక్షతలు"
      ],
      ta: [
        "1. கணபதி பூஜை மற்றும் புண்யாஹவாசனம்",
        "2. சங்கல்பம் மற்றும் புனித மண்டல ஸ்தாபனம்",
        "3. பிரதான தேவதா ஆவாஹனம் மற்றும் மந்திர ஜபம்",
        "4. ஹோம திரவிய சமர்ப்பணமும் மகா பூர்ணாஹுதியும்",
        "5. தீர்த்த பிரசாதமும் மந்திராட்சதையும்"
      ]
    },
    auspiciousTime: {
      kn: "ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ",
      en: "Auspicious Muhurtha",
      hi: "शुभ मुहूर्त में",
      te: "శుభ ముహూర్తంలో",
      ta: "சுப முகூர்த்தத்தில்"
    },
    requiredItems: {
      kn: "ತುಪ್ಪ, ಹೂವು, ಹಣ್ಣು, ವೀಳ್ಯದೆಲೆ, ನೈವೇದ್ಯ",
      en: "Pure Ghee, Flowers, Fruits, Betel leaves, Sweet offerings",
      hi: "शुद्ध घी, फूल, फल, पान, नैवेद्य",
      te: "నెయ్యి, పూలు, పండ్లు, తమలపాకులు, నైవేద్యం",
      ta: "நெய், மலர்கள், பழங்கள், வெற்றிலை, நைவேத்தியம்"
    },
    fruit: {
      kn: "ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ, ದೈವಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖ-ಶಾಂತಿ",
      en: "Fulfillment of desires, divine protection & family peace",
      hi: "सर्व मनोकामना पूर्ति, दैवीय सुरक्षा एवं पारिवारिक शांति",
      te: "సకల కోరికల ఈడేరిక, దివ్య రక్షణ మరియు కుటుంబ శాంతి",
      ta: "சகல காரிய சித்தி, தெய்வீக பாதுகாப்பு மற்றும் குடும்ப அமைதி"
    }
  }
,
  narayanabali_tripindi: {
    sevaId: "narayanabali_tripindi",
    steps: {
      kn: [
        "1. ಪವಿತ್ರ ತೀರ್ಥ ಸ್ನಾನ & ನಾರಾಯಣ ಬಲಿ ಮಹಾ ಸಂಕಲ್ಪ",
        "2. ಬ್ರಹ್ಮ, ವಿಷ್ಣು, ರುದ್ರ, ಯಮ, ಪ್ರೇತ ಕಲಶ ಸ್ಥಾಪನೆ & ಆರಾಧನೆ",
        "3. ಸಾತ್ವಿಕ, ರಾಜಸಿಕ, ತಾಮಸಿಕ ಮೂರು ವಿಧದ ತ್ರಿಪಿಂಡಿ ಪ್ರದಾನ",
        "4. ನಾರಾಯಣ ಪ್ರಸನ್ನತಾ ಮಹಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ಗೋಪ್ರದಾನ, ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ಪಿತೃ ಮುಕ್ತಿ ಆಶೀರ್ವಾದ"
      ],
      en: [
        "1. Sacred Tirtha bath & Narayana Bali Maha Sankalpa",
        "2. Brahma, Vishnu, Rudra, Yama, Preta Kalasha consecration",
        "3. Triple Pinda offerings for Satvika, Rajasika, Tamasika ancestors",
        "4. Narayana Prasannata Maha Poornahuti",
        "5. Go-Danam, Brahmana Bhojanam & Ancestral liberation blessing"
      ],
      hi: [
        "1. पावन तीर्थ स्नान एवं नारायण बलि महा संकल्प",
        "2. ब्रह्मा, विष्णु, रुद्र, यम, प्रेत कलश स्थापना एवं पूजन",
        "3. सात्विक, राजसिक व तामसिक त्रिपिंडी प्रदान",
        "4. नारायण प्रसन्नता महा पूर्णाहुति",
        "5. गोदान, ब्राह्मण भोजन एवं पितृ मुक्ति आशीर्वाद"
      ],
      te: [
        "1. పవిత్ర తీర్థ స్నానం మరియు నారాయణ బలి మహా సంకల్పం",
        "2. బ్రహ్మ, విష్ణు, రుద్ర, యమ, ప్రేత కలశ స్థాపన మరియు పూజ",
        "3. సాత్విక, రాజసిక, తామసిక త్రిపిండి ప్రదానం",
        "4. నారాయణ ప్రసన్నతా మహా పూర్ణాహుతి",
        "5. గోదానం, బ్రాహ్మణ భోజనం మరియు పితృ ముక్తి ఆశీస్సులు"
      ],
      ta: [
        "1. புனித தீர்த்த நீராடலும் நாராயண பலி மகா சங்கல்பமும்",
        "2. பிரம்மா, விஷ்ணு, ருத்ர, யம, பிரேத கலச ஸ்தாபன பூஜை",
        "3. சாத்விக, ராஜஸ, தாமஸ திரிபிண்டி சமர்ப்பணம்",
        "4. நாராயண பிரசன்னதா மகா பூர்ணாஹுதி",
        "5. கோதானம், அன்னதானம் மற்றும் பித்ரு முக்தி ஆசீர்வாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಏಕಾದಶಿ ಬೆಳಗ್ಗೆ 9:00",
      en: "Amavasya or Ekadashi Morning 9:00 AM",
      hi: "अमावस्या अथवा एकादशी प्रातः 9:00 बजे",
      te: "అమావాస్య లేదా ఏకాదశి ఉదయం 9:00 గంటలకు",
      ta: "அமாவாசை அல்லது ஏகாதசி காலை 9:00 மணிக்கு"
    },
    requiredItems: {
      kn: "ಕಪ್ಪು ಎಳ್ಳು, ತುಪ್ಪ, ಅಕ್ಕಿ ಹಿಟ್ಟು, ದರ್ಭೆ, ಜವೆಗೋಧಿ, ಪಂಚರತ್ನ",
      en: "Black sesame, Pure Ghee, Rice flour, Darbha, Barley, Pancharatna",
      hi: "काले तिल, शुद्ध घी, चावल का आटा, कुशा, जौ, पंचरत्न",
      te: "నల్ల నువ్వులు, స్వచ్ఛమైన నెయ్యి, బియ్యపు పిండి, దర్భలు, యవలు, పంచరత్నాలు",
      ta: "கருப்பு எள், நெய், அரிசி மாவு, தர்பை புல், பார்லி, பஞ்சரத்னம்"
    },
    fruit: {
      kn: "ತ್ರಿವಿಧ ಪಿತೃ ದೋಷ ಮುಕ್ತಿ, ವಂಶಾಭಿವೃದ್ಧಿ, ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ",
      en: "Relief from 3-generation Pitru Dosha, progeny blessing & family abundance",
      hi: "त्रिविध पितृ दोष मुक्ति, वंश वृद्धि, संतान सुख एवं पारिवारिक समृद्धि",
      te: "త్రివిధ పితృ దోష విముక్తి, వంశాభివృద్ధి, సంతాన సౌభాగ్యం మరియు సమృద్ధి",
      ta: "பித்ரு தோஷ நிவர்த்தி, வம்ச விருத்தி, சந்தான பாக்கியம் மற்றும் குடும்ப சுபிட்சம்"
    }
  },
  narayanabali_pretoddhara: {
    sevaId: "narayanabali_pretoddhara",
    steps: {
      kn: [
        "1. ಪ್ರೇತ ಮೋಕ್ಷ ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ & ನಾರಾಯಣ ಪೂಜೆ",
        "2. ಷೋಡಶ ಶ್ರಾದ್ಧ & ಅಪಮೃತ್ಯು ನಿವಾರಕ ಹೋಮ",
        "3. ವಿಷ್ಣು ಪಾದೋದಕ ತರ್ಪಣ & ಪ್ರೇತೋದ್ಧಾರ ಪಿಂಡ ಪ್ರದಾನ",
        "4. ಮುಕ್ತಿ ದಾಯಕ ಮಹಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ, ದೀಪ ದಾನ & ರಕ್ಷಾ ಕವಚ ಮಂತ್ರಾಕ್ಷತೆ"
      ],
      en: [
        "1. Preta Moksha expiation Sankalpa & Lord Narayana Puja",
        "2. Shodasha Shraddha & Apamrityu Nivaran Homa",
        "3. Vishnu Padodaka Tarpanam & Pretoddhara Pinda offerings",
        "4. Mukti Dayaka Maha Poornahuti",
        "5. Holy water sprinkling, Deepa Danam & Protective Mantrakshate"
      ],
      hi: [
        "1. प्रेत मोक्ष प्रायश्चित्त संकल्प एवं नारायण पूजन",
        "2. षोडश श्राद्ध एवं अपमृत्यु निवारक हवन",
        "3. विष्णु पादोदक तर्पण एवं प्रेतोद्धार पिंड दान",
        "4. मुक्तिदायक महा पूर्णाहुति",
        "5. तीर्थ मार्जन, दीप दान एवं रक्षा कवच मंत्राक्षत"
      ],
      te: [
        "1. ప్రేత మోక్ష ప్రాయశ్చిత్త సంకల్పం మరియు నారాయణ పూజ",
        "2. షోడశ శ్రాద్ధం మరియు అపమృత్యు నివారక హోమం",
        "3. విష్ణు పాదోదక తర్పణం మరియు ప్రేతోద్ధార పిండ ప్రదానం",
        "4. ముక్తిదాయక మహా పూర్ణాహుతి",
        "5. తీర్థ ప్రోక్షణ, దీప దానం మరియు రక్షా మంత్రాక్షతలు"
      ],
      ta: [
        "1. பிரேத மோட்ச சங்கல்பமும் நாராயண பூஜையும்",
        "2. சோடச சிரார்த்தமும் துர்மரண நிவாரண ஹோமமும்",
        "3. விஷ்ணு பாத தீர்த்த தர்பணமும் பிரேதோத்தார பிண்ட தானமும்",
        "4. முக்தி தாயக மகா பூர்ணாஹுதி",
        "5. புனித தீர்த்த தெளிப்பு, தீப தானம் மற்றும் ரக்ஷா மந்திராட்சதை"
      ]
    },
    auspiciousTime: {
      kn: "ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಪುಣ್ಯ ತಿಥಿ ಮಧ್ಯಾಹ್ನ 11:00",
      en: "Amavasya or Sacred Punya Tithi 11:00 AM",
      hi: "अमावस्या अथवा पुण्य तिथि दोपहर 11:00 बजे",
      te: "అమావాస్య లేదా పుణ్య తిథి ఉదయం 11:00 గంటలకు",
      ta: "அமாவாசை அல்லது புண்ணிய திதி நண்பகல் 11:00 மணிக்கு"
    },
    requiredItems: {
      kn: "ಕಪ್ಪು ಎಳ್ಳು, ತುಪ್ಪ, ಪಂಚಗವ್ಯ, ದರ್ಭೆ, ನಾರಾಯಣ ಪ್ರತಿಮೆ, ದೀಪ",
      en: "Black sesame, Ghee, Panchagavya, Darbha, Narayana idol, Deepa",
      hi: "काले तिल, घी, पंचगव्य, कुशा, नारायण प्रतिमा, दीप",
      te: "నల్ల నువ్వులు, నెయ్యి, పంచగవ్యాలు, దర్భలు, నారాయణ విగ్రహం, దీపం",
      ta: "கருப்பு எள், நெய், பஞ்சகவ்யம், தர்பை, நாராயணர் விக்கிரகம், தீபம்"
    },
    fruit: {
      kn: "ಪ್ರೇತತ್ವ ಮುಕ್ತಿ, ಆಕಸ್ಮಿಕ ಭಯ-ದುಃಸ್ವಪ್ನ ನಿವಾರಣೆ ಹಾಗೂ ವಂಶಕ್ಕೆ ಅಭೇದ್ಯ ದೈವಿಕ ರಕ್ಷಣೆ",
      en: "Moksha for departed souls, eradication of fear/nightmares & family protection",
      hi: "प्रेतत्व से मुक्ति, भय व बुरे स्वप्नों का निवारण तथा परिवार की दैवीय रक्षा",
      te: "ప్రేతత్వ విముక్తి, భయాల నివారణ మరియు కుటుంబానికి అఖండ దివ్య రక్షణ",
      ta: "பிரேத தோஷ நிவர்த்தி, பயமின்மை மற்றும் குடும்பத்திற்கு தெய்வீக பாதுகாப்பு"
    }
  }
};

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