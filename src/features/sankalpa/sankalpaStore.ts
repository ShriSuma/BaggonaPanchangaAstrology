/**
 * Devotee Personal Sankalpa State & CRUD Engine (ದೈವಿಕ ಸಂಕಲ್ಪ ನಿರ್ವಹಣಾ ತಂತ್ರಾಂಶ)
 * 
 * Allows devotees to maintain their custom list of sacred prayer intentions (Sankalpas),
 * choose from authentic Vedic presets, toggle active prayers for the day, and dynamically
 * inject these intentions into the 3-to-5 Minute Daily Deva Pooja Vedic Mantra.
 */

import { create } from "zustand";
import { db, type UserSankalpaRecord, type SankalpaCategory } from "../../db/indexedDb";
import { syncDevoteeSankalpaToCloud, getDevoteeSankalpasFromCloud, deleteDevoteeSankalpaFromCloud } from "../../db/firestoreDb";

import type { SevaLang } from "../seva/sevaLocale";

export interface SankalpaPreset {
  category: SankalpaCategory;
  icon: string;
  titleKn: string;
  titleEn: string;
  titleHi?: string;
  titleTe?: string;
  titleTa?: string;
  descriptionKn: string;
  descriptionEn: string;
  descriptionHi?: string;
  descriptionTe?: string;
  descriptionTa?: string;
  sanskritPhrasing: string;
  sanskritPhrasingL5?: Record<SevaLang, string>;
}

export const SANKALPA_PRESETS: SankalpaPreset[] = [
  {
    category: "aarogya",
    icon: "🌿",
    titleKn: "ಆರೋಗ್ಯ & ಆಯುರ್ವೃದ್ಧಿ",
    titleEn: "Good Health & Longevity",
    titleHi: "आरोग्य एवं आयुर्वृद्धि",
    titleTe: "ఆరోగ్యం & ఆయుర్వృద్ధి",
    titleTa: "ஆரோக்கியம் & ஆயுள் விருத்தி",
    descriptionKn: "ಕುಟುಂಬದ ಸಮಸ್ತ ಸದಸ್ಯರಿಗೆ ಸಕಲ ದೈಹಿಕ, ಮಾನಸಿಕ ಆರೋಗ್ಯ, ಧೈರ್ಯ ಹಾಗೂ ಆಯುರ್ವೃದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
    descriptionEn: "Divine blessings for radiant health, mental peace, vitality, and longevity for all family members.",
    descriptionHi: "परिवार के समस्त सदस्यों को उत्तम स्वास्थ्य, मानसिक शांति, स्फूर्ति और दीर्घायु प्राप्त हो।",
    descriptionTe: "కుటుంబ సభ్యులందరికీ సంపూర్ణ శారీరక, మానసిక ఆరోగ్యం, ఉత్సాహం మరియు దీర్ఘాయుష్షు లభించుగాక.",
    descriptionTa: "குடும்பத்தினர் அனைவருக்கும் உடல், மன ஆரோக்கியம் மற்றும் நீண்ட ஆயுள் கிட்ட அருள்புரிக.",
    sanskritPhrasing: "ಮಮ ಕುಟುಂಬಸ್ಯ ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
    sanskritPhrasingL5: {
      kn: "ಮಮ ಕುಟುಂಬಸ್ಯ ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
      hi: "मम कुटुम्बस्य सर्वेषां आयुरारोग्य ऐश्वर्याभिवृद्धि सिद्ध्यर्थं",
      te: "మమ కుటుంబస్య సర్వేషాం ఆయురారోగ్య ఐశ్వర్యాభివృద్ధి సిద్ధ్యర్థం",
      ta: "மம குடும்பஸ்ய சர்வேஷாம் ஆயுராரோக்ய ஐஸ்வர்யாபிவிருத்தி சித்யர்த்தம்",
      en: "Mama kuṭumbasya sarveṣāṁ āyurārogya aiśvaryābhivṛddhi siddhyarthaṁ"
    }
  },
  {
    category: "shanti",
    icon: "🕊️",
    titleKn: "ಮನಶ್ಶಾಂತಿ & ಗೃಹಶಾಂತಿ",
    titleEn: "Inner Peace & Domestic Harmony",
    titleHi: "मनःशांति एवं गृहशांति",
    titleTe: "మనశ్శాంతి & గృహశాంతి",
    titleTa: "மன அமைதி & குடும்ப சாந்தி",
    descriptionKn: "ಮನೆಯಲ್ಲಿ ಸದಾ ಸುಖ, ಶಾಂತಿ, ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ನೆಲೆಸಿ, ಸರ್ವ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ನಿವಾರಣೆಯಾಗಲಿ.",
    descriptionEn: "Removal of all negative influences, blessing our home with peace, affection, and mutual harmony.",
    descriptionHi: "घर में सुख-शांति, प्रेम और सौहार्द रहे तथा समस्त नकारात्मक शक्तियों का शमन हो।",
    descriptionTe: "గృహంలో శాంతి, ఆనందం, పరస్పర అనురాగం వర్ధిల్లి సమస్త ప్రతికూల శక్తులు తొలగిపోవుగాక.",
    descriptionTa: "இல்லத்தில் அமைதி, மகிழ்ச்சி நிலைத்து எதிர்மறை எண்ணங்கள் நீங்க அருள்புரிக.",
    sanskritPhrasing: "ಸರ್ವ ಮನಃಶಾಂತಿ, ಗೃಹಶಾಂತಿ, ಧನಧಾನ್ಯ ಸಮೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
    sanskritPhrasingL5: {
      kn: "ಸರ್ವ ಮನಃಶಾಂತಿ, ಗೃಹಶಾಂತಿ, ಧನಧಾನ್ಯ ಸಮೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
      hi: "सर्व मनःशान्ति, गृहशान्ति, धनधान्य समृद्धि सिद्ध्यर्थं",
      te: "సర్వ మనఃశాంతి, గృహశాంతి, ధనధాన్య సమృద్ధి సిద్ధ్యర్థం",
      ta: "சர்வ மனஃசாந்தி, கிரகசாந்தி, தனதான்ய சம்ருத்தி சித்யர்த்தம்",
      en: "Sarva manaḥśānti, gṛhaśānti, dhanadhānya samṛddhi siddhyarthaṁ"
    }
  },
  {
    category: "vidya",
    icon: "📚",
    titleKn: "ವಿದ್ಯಾಭ್ಯಾಸ, ಜ್ಞಾನ & ಏಕಾಗ್ರತೆ",
    titleEn: "Education, Wisdom & Focus",
    titleHi: "विद्याभ्यास, ज्ञान एवं एकाग्रता",
    titleTe: "విద్యాభ్యాసం, జ్ఞానం & ఏకాగ్రత",
    titleTa: "கல்வி, ஞானம் & கவனக்குவிப்பு",
    descriptionKn: "ಮಕ್ಕಳಿಗೆ ಮತ್ತು ಸಾಧಕರಿಗೆ ಸದ್ವಿದ್ಯೆ, ಉತ್ತಮ ಜ್ಞಾನ, ನೆನಪಿನ ಶಕ್ತಿ ಹಾಗೂ ಏಕಾಗ್ರತೆ ಸಿದ್ಧಿಸಲಿ.",
    descriptionEn: "Divine grace for sharp intellect, supreme memory, focus, and excellence in academic pursuits.",
    descriptionHi: "बच्चों और साधकों को सद्विद्या, उत्तम मेधा, तीव्र स्मरण शक्ति और एकाग्रता मिले।",
    descriptionTe: "పిల్లలకు మరియు సాధకులకు సద్విద్య, మేధస్సు, జ్ఞాపకశక్తి మరియు ఏకాగ్రత లభించుగాక.",
    descriptionTa: "கல்வியில் சிறந்து விளங்க நல்லறிவு, ஞாபகசக்தி மற்றும் ஏகாகிரதை அருள்க.",
    sanskritPhrasing: "ಸಕಲ ಸದ್ವಿದ್ಯಾ, ಬುದ್ಧಿ, ಜ್ಞಾನ, ಏಕಾಗ್ರತಾ ಸಿದ್ಧ್ಯರ್ಥಂ",
    sanskritPhrasingL5: {
      kn: "ಸಕಲ ಸದ್ವಿದ್ಯಾ, ಬುದ್ಧಿ, ಜ್ಞಾನ, ಏಕಾಗ್ರತಾ ಸಿದ್ಧ್ಯರ್ಥಂ",
      hi: "सकल सद्विद्या, बुद्धि, ज्ञान, एकाग्रता सिद्ध्यर्थं",
      te: "సకల సద్విద్యా, బుద్ధి, జ్ఞాన, ఏకాగ్రతా సిద్ధ్యర్థం",
      ta: "சகல சத்வித்யா, புத்தி, ஞான, ஏகாக்ரதா சித்யர்த்தம்",
      en: "Sakala sadvidyā, buddhi, jñāna, ekāgratā siddhyarthaṁ"
    }
  },
  {
    category: "udyoga",
    icon: "💼",
    titleKn: "ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ & ಕೀರ್ತಿ",
    titleEn: "Career, Business & Success",
    titleHi: "रोजगार, व्यापार एवं यश",
    titleTe: "ఉద్యోగం, వ్యాపారం & కీర్తి",
    titleTa: "உத்தியோகம், தொழில் & வெற்றி",
    descriptionKn: "ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಉನ್ನತಿ, ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ, ಸಮಾಜದಲ್ಲಿ ಸತ್ಕೀರ್ತಿ ಹಾಗೂ ಯಶಸ್ಸು ದೊರೆಯಲಿ.",
    descriptionEn: "Flourishing growth in professional career, business profitability, and respectable societal standing.",
    descriptionHi: "करियर में प्रगति, व्यापार में लाभ, समाज में प्रतिष्ठा और यश प्राप्त हो।",
    descriptionTe: "ఉద్యోగంలో పురోగతి, వ్యాపారాభివృద్ధి, సమాజంలో సత్కీర్తి మరియు సాఫల్యం లభించుగాక.",
    descriptionTa: "வேலையில் முன்னேற்றம், தொழிலில் லாபம் மற்றும் சமூகத்தில் நற்பெயர் அருள்க.",
    sanskritPhrasing: "ಸತ್ ಉದ್ಯೋಗ, ವ್ಯಾಪಾರಾಭಿವೃದ್ಧಿ, ಕೀರ್ತಿ-ಯಶೋವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
    sanskritPhrasingL5: {
      kn: "ಸತ್ ಉದ್ಯೋಗ, ವ್ಯಾಪಾರಾಭಿವೃದ್ಧಿ, ಕೀರ್ತಿ-ಯಶೋವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
      hi: "सत् उद्योग, व्यापाराभिवृद्धि, कीर्ति-यशोवृद्धि सिद्ध्यर्थं",
      te: "సత్ ఉద్యోగ, వ్యాపారాభివృద్ధి, కీర్తి-యశోవృద్ధి సిద్ధ్యర్థం",
      ta: "சத் உத்யோக, வியாபாராபிவிருத்தி, கீர்த்தி-யசோவிருத்தி சித்யர்த்தம்",
      en: "Sat udyoga, vyāpārābhivṛddhi, kīrti-yaśovṛddhi siddhyarthaṁ"
    }
  },
  {
    category: "santana",
    icon: "👶",
    titleKn: "ಸಂತಾನ ಭಾಗ್ಯ & ಕಲ್ಯಾಣ",
    titleEn: "Progeny & Family Flourishing",
    titleHi: "संतान सुख एवं पारिवारिक कल्याण",
    titleTe: "సంతాన భాగ్యం & కుటుంబ శ్రేయస్సు",
    titleTa: "சந்தான பாக்கியம் & நலம்",
    descriptionKn: "ಉತ್ತಮ ಸತ್ಸಂತಾನ ಭಾಗ್ಯ, ಮಕ್ಕಳ ಶ್ರೇಯೋಭಿವೃದ್ಧಿ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
    descriptionEn: "Blessings for healthy progeny, children's holistic well-being, and family continuity.",
    descriptionHi: "सत्संतान की प्राप्ति, बच्चों की उन्नति और वंश वृद्धि का आशीर्वाद मिले।",
    descriptionTe: "సత్సంతాన ప్రాప్తి, పిల్లల ఉన్నతి మరియు వంశాభివృద్ధి చేకూరుగాక.",
    descriptionTa: "நல்ல சந்தான பாக்கியம் மற்றும் குழந்தைகளின் நலன் கிட்ட அருள்க.",
    sanskritPhrasing: "ಸತ್ಸಂತಾನ ಪ್ರಾಪ್ತಿ, ಸಂತಾನ ಶ್ರೇಯೋಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
    sanskritPhrasingL5: {
      kn: "ಸತ್ಸಂತಾನ ಪ್ರಾಪ್ತಿ, ಸಂತಾನ ಶ್ರೇಯೋಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
      hi: "सत्सन्तान प्राप्ति, सन्तान श्रेयोभिवृद्धि सिद्ध्यर्थं",
      te: "సత్సంతాన ప్రాప్తి, సంతాన శ్రేయోభివృద్ధి సిద్ధ్యర్థం",
      ta: "சத்சந்தான பிராப்தி, சந்தான ஸ்ரேயோபிவிருத்தி சித்யர்த்தம்",
      en: "Satsantāna prāpti, santāna śreyobhivṛddhi siddhyarthaṁ"
    }
  },
  {
    category: "vivaha",
    icon: "💍",
    titleKn: "ಮಂಗಳ ವಿವಾಹ & ಸುಖ ದಾಂಪತ್ಯ",
    titleEn: "Auspicious Marriage & Matrimony",
    titleHi: "मंगल विवाह एवं सुखद दांपत्य",
    titleTe: "కల్యాణ ప్రాప్తి & సుఖ దాంపత్యం",
    titleTa: "மங்கள விவாகம் & தாம்பத்யம்",
    descriptionKn: "ಶೀಘ್ರ ಸುಯೋಗ್ಯ ಕಂಕಣ ಭಾಗ್ಯ, ಸತ್ಸಂಬಂಧ ಹಾಗೂ ಆನಂದದಾಯಕ ಸುಖ ದಾಂಪತ್ಯ ಸಿದ್ಧಿಸಲಿ.",
    descriptionEn: "Removal of marital delays, finding a righteous partner, and enjoying blissful married life.",
    descriptionHi: "शीघ्र योग्य जीवनसाथी की प्राप्ति, विवाह बाधा निवारण और दांपत्य सुख मिले।",
    descriptionTe: "శీఘ్ర వివాహ సిద్ధి, అనుకూల జీవిత భాగస్వామి మరియు ఆనందకర దాంపత్యం లభించుగాక.",
    descriptionTa: "விரைவில் திருமணம் கைகூடவும், மகிழ்ச்சியான குடும்ப வாழ்க்கை அமையவும் அருள்க.",
    sanskritPhrasing: "ಶೀಘ್ರ ಮಂಗಳ ವಿವಾಹ ಸಿದ್ಧಿ, ಅನ್ಯೋನ್ಯ ಸುಖ ದಾಂಪತ್ಯ ಸಿದ್ಧ್ಯರ್ಥಂ",
    sanskritPhrasingL5: {
      kn: "ಶೀಘ್ರ ಮಂಗಳ ವಿವಾಹ ಸಿದ್ಧಿ, ಅನ್ಯೋನ್ಯ ಸುಖ ದಾಂಪತ್ಯ ಸಿದ್ಧ್ಯರ್ಥಂ",
      hi: "शीघ्र मङ्गल विवाह सिद्धि, अन्योन्य सुख दांपत्य सिद्ध्यर्थं",
      te: "శీఘ్ర మంగళ వివాహ సిద్ధి, అన్యోన్య సుఖ దాంపత్య సిద్ధ్యర్థం",
      ta: "சீக்ர மங்கள விவாஹ சித்தி, அன்யோன்ய சுக தாம்பத்ய சித்யர்த்தம்",
      en: "Śīghra maṅgala vivāha siddhi, anyonya sukha dāṁpatya siddhyarthaṁ"
    }
  },
  {
    category: "dhana",
    icon: "🪙",
    titleKn: "ಧನ-ಧಾನ್ಯ, ಋಣಮುಕ್ತಿ & ಸಮೃದ್ಧಿ",
    titleEn: "Prosperity, Wealth & Debt Relief",
    titleHi: "धन-धान्य, ऋणमुक्ति एवं समृद्धि",
    titleTe: "ధనధాన్యాలు, రుణవిముక్తి & సమృద్ధి",
    titleTa: "தனதான்யம், கடன் நிவாரணம் & வளம்",
    descriptionKn: "ಸಮಸ್ತ ಸಾಲ-ಋಣ ಬಾಧೆಗಳಿಂದ ಮುಕ್ತಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಮಹಾಲಕ್ಷ್ಮಿಯ ಕೃಪಾಕಟಾಕ್ಷ ಲಭಿಸಲಿ.",
    descriptionEn: "Complete freedom from financial debts, monetary abundance, and Goddess Mahalakshmi's graceful benevolence.",
    descriptionHi: "समस्त कर्जों से मुक्ति, आर्थिक स्थिरता और माँ महालक्ष्मी की असीम कृपा प्राप्त हो।",
    descriptionTe: "సకల రుణ విముక్తి, ఆర్థిక స్థిరత్వం మరియు శ్రీ మహాలక్ష్మి అనుగ్రహం లభించుగాక.",
    descriptionTa: "கடன் சுமைகள் நீங்கி, செல்வ செழிப்புடன் வாழ மகாலட்சுமி அருள் கிட்டுக.",
    sanskritPhrasing: "ಸಮಸ್ತ ಋಣಮುಕ್ತಿ, ಧನ-ಧಾನ್ಯ ಸಮೃದ್ಧಿ, ಲಕ್ಷ್ಮೀ ಕೃಪಾಕಟಾಕ್ಷ ಸಿದ್ಧ್ಯರ್ಥಂ",
    sanskritPhrasingL5: {
      kn: "ಸಮಸ್ತ ಋಣಮುಕ್ತಿ, ಧನ-ಧಾನ್ಯ ಸಮೃದ್ಧಿ, ಲಕ್ಷ್ಮೀ ಕೃಪಾಕಟಾಕ್ಷ ಸಿದ್ಧ್ಯರ್ಥಂ",
      hi: "समस्त ऋणमुक्ति, धन-धान्य समृद्धि, लक्ष्मी कृपाकटाक्ष सिद्ध्यर्थं",
      te: "సమస్త రుణముక్తి, ధన-ధాన్య సమృద్ధి, లక్ష్మీ కృపాకటాక్ష సిద్ధ్యర్థం",
      ta: "சமஸ்த ருணமுக்தி, தன-தான்ய சம்ருத்தி, லக்ஷ்மி கிருபாகடாக்ஷ சித்யர்த்தம்",
      en: "Samasta ṛṇamukti, dhana-dhānya samṛddhi, lakṣmī kṛpākaṭākṣa siddhyarthaṁ"
    }
  },
  {
    category: "custom",
    icon: "✨",
    titleKn: "ವಿಶೇಷ ವೈಯಕ್ತಿಕ ಪ್ರಾರ್ಥನೆ",
    titleEn: "Custom Personal Devotional Prayer",
    titleHi: "विशेष व्यक्तिगत प्रार्थना",
    titleTe: "ప్రత్యేక వ్యక్తిగత ప్రార్థన",
    titleTa: "தனிப்பட்ட பிரத்தியேக பிரார்த்தனை",
    descriptionKn: "ನನ್ನ ಮನಸ್ಸಿನ ಇಷ್ಟಾರ್ಥಗಳು ಶ್ರೀ ದೇವತಾ ಅನುಗ್ರಹದಿಂದ ಸಫಲವಾಗಲಿ.",
    descriptionEn: "May all pure, heartfelt aspirations be fulfilled with divine blessings.",
    descriptionHi: "मेरी समस्त सात्त्विक मनोकामनाएं प्रभु कृपा से सफल हों।",
    descriptionTe: "నా మనస్సులోని సత్సంకల్పాలు దైవానుగ్రహంతో నెరవేరుగాక.",
    descriptionTa: "எனது நல் விருப்பங்கள் இறைவன் திருவருளால் நிறைவேறுக.",
    sanskritPhrasing: "ಸಮಸ್ತ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ, ಸಕಲ ಸತ್ಕಾರ್ಯ ಜಯಸಿದ್ಧ್ಯರ್ಥಂ",
    sanskritPhrasingL5: {
      kn: "ಸಮಸ್ತ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ, ಸಕಲ ಸತ್ಕಾರ್ಯ ಜಯಸಿದ್ಧ್ಯರ್ಥಂ",
      hi: "समस्त मनोरथ सिद्ध्यर्थं, सकल सत्कार्य जयसिद्ध्यर्थं",
      te: "సమస్త మనోరథ సిద్ధ్యర్థం, సకల సత్కార్య జయసిద్ధ్యర్థం",
      ta: "சமஸ்த மனோரத சித்யர்த்தம், சகல சத்கார்ய ஜெயசித்யர்த்தம்",
      en: "Samasta manoratha siddhyarthaṁ, sakala satkārya jayasiddhyarthaṁ"
    }
  }
];

export function getPresetTitle(preset: SankalpaPreset, lang: SevaLang = "kn"): string {
  if (lang === "kn") return preset.titleKn;
  if (lang === "en") return preset.titleEn;
  if (lang === "hi") return preset.titleHi || preset.titleEn;
  if (lang === "te") return preset.titleTe || preset.titleEn;
  if (lang === "ta") return preset.titleTa || preset.titleEn;
  return preset.titleEn;
}

export function getPresetDescription(preset: SankalpaPreset, lang: SevaLang = "kn"): string {
  if (lang === "kn") return preset.descriptionKn;
  if (lang === "en") return preset.descriptionEn;
  if (lang === "hi") return preset.descriptionHi || preset.descriptionEn;
  if (lang === "te") return preset.descriptionTe || preset.descriptionEn;
  if (lang === "ta") return preset.descriptionTa || preset.descriptionEn;
  return preset.descriptionEn;
}

export function getPresetSanskritPhrasing(preset: SankalpaPreset, lang: SevaLang = "kn"): string {
  if (preset.sanskritPhrasingL5 && preset.sanskritPhrasingL5[lang]) {
    return preset.sanskritPhrasingL5[lang];
  }
  return preset.sanskritPhrasing;
}

export function getDefaultSankalpas(userId: string, devoteeName: string = "ಭಕ್ತ", lang: SevaLang = "kn"): UserSankalpaRecord[] {
  const now = new Date().toISOString();
  const p1 = SANKALPA_PRESETS[0]!;
  const p2 = SANKALPA_PRESETS[1]!;
  const p4 = SANKALPA_PRESETS[3]!;

  return [
    {
      id: `sankalpa_def_1_${userId}`,
      userId,
      devoteeName,
      category: "aarogya",
      title: getPresetTitle(p1, lang),
      description: getPresetDescription(p1, lang),
      sanskritPhrasing: getPresetSanskritPhrasing(p1, lang),
      isActive: true,
      createdAt: now
    },
    {
      id: `sankalpa_def_2_${userId}`,
      userId,
      devoteeName,
      category: "shanti",
      title: getPresetTitle(p2, lang),
      description: getPresetDescription(p2, lang),
      sanskritPhrasing: getPresetSanskritPhrasing(p2, lang),
      isActive: true,
      createdAt: now
    },
    {
      id: `sankalpa_def_3_${userId}`,
      userId,
      devoteeName,
      category: "udyoga",
      title: getPresetTitle(p4, lang),
      description: getPresetDescription(p4, lang),
      sanskritPhrasing: getPresetSanskritPhrasing(p4, lang),
      isActive: true,
      createdAt: now
    }
  ];
}

interface SankalpaStoreState {
  sankalpas: UserSankalpaRecord[];
  isLoading: boolean;
  activeUserId: string;
  loadSankalpas: (userId: string, devoteeName?: string, lang?: SevaLang) => Promise<UserSankalpaRecord[]>;
  createSankalpa: (
    userId: string,
    data: {
      category: SankalpaCategory;
      title: string;
      description: string;
      sanskritPhrasing?: string;
      isActive?: boolean;
      devoteeName?: string;
    }
  ) => Promise<UserSankalpaRecord>;
  updateSankalpa: (id: string, updates: Partial<UserSankalpaRecord>) => Promise<boolean>;
  deleteSankalpa: (id: string) => Promise<boolean>;
  toggleSankalpaActive: (id: string) => Promise<boolean>;
  getActiveSankalpasText: (lang?: SevaLang) => { sanskritText: string; kannadaText: string; displayLanguageText: string };
}

export const useSankalpaStore = create<SankalpaStoreState>((set, get) => ({
  sankalpas: [],
  isLoading: false,
  activeUserId: "devotee_default",

  loadSankalpas: async (userId: string, devoteeName = "ಭಕ್ತ", lang: SevaLang = "kn") => {
    const cleanId = (userId || "devotee_default").toLowerCase().trim();
    set({ isLoading: true, activeUserId: cleanId });

    try {
      // 1. Fetch from local IndexedDB
      let records = await db.userSankalpas.where("userId").equals(cleanId).toArray();

      // 2. If empty locally, try fetching from Cloud Firestore
      if (!records || records.length === 0) {
        const cloudDocs = await getDevoteeSankalpasFromCloud(cleanId);
        if (cloudDocs && cloudDocs.length > 0) {
          for (const doc of cloudDocs) {
            await db.userSankalpas.put(doc as UserSankalpaRecord);
          }
          records = cloudDocs as UserSankalpaRecord[];
        }
      }

      // 3. If still empty, seed default authentic Vedic Sankalpas in devotee's language
      if (!records || records.length === 0) {
        const defaults = getDefaultSankalpas(cleanId, devoteeName, lang);
        for (const item of defaults) {
          await db.userSankalpas.put(item);
          void syncDevoteeSankalpaToCloud(item);
        }
        records = defaults;
      }

      set({ sankalpas: records, isLoading: false });
      return records;
    } catch (err) {
      console.warn("[SankalpaStore] loadSankalpas error, using memory defaults:", err);
      const defaults = getDefaultSankalpas(cleanId, devoteeName, lang);
      set({ sankalpas: defaults, isLoading: false });
      return defaults;
    }
  },

  createSankalpa: async (userId, data) => {
    const cleanId = (userId || "devotee_default").toLowerCase().trim();
    const id = `sankalpa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const matchingPreset = SANKALPA_PRESETS.find((p) => p.category === data.category);
    const newRecord: UserSankalpaRecord = {
      id,
      userId: cleanId,
      devoteeName: data.devoteeName || "ಭಕ್ತ",
      category: data.category,
      title: data.title.trim() || matchingPreset?.titleKn || "ವೈಯಕ್ತಿಕ ಸಂಕಲ್ಪ",
      description: data.description.trim() || matchingPreset?.descriptionKn || "",
      sanskritPhrasing: data.sanskritPhrasing?.trim() || matchingPreset?.sanskritPhrasing || "ಸಮಸ್ತ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ",
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now
    };

    try {
      await db.userSankalpas.put(newRecord);
      void syncDevoteeSankalpaToCloud(newRecord);
    } catch (err) {
      console.warn("[SankalpaStore] Error saving to DB:", err);
    }

    set((state) => ({
      sankalpas: [newRecord, ...state.sankalpas]
    }));

    return newRecord;
  },

  updateSankalpa: async (id, updates) => {
    const existing = get().sankalpas.find((s) => s.id === id);
    if (!existing) return false;

    const updatedRecord: UserSankalpaRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    try {
      await db.userSankalpas.update(id, updatedRecord);
      void syncDevoteeSankalpaToCloud(updatedRecord);
    } catch (err) {
      console.warn("[SankalpaStore] Error updating sankalpa in DB:", err);
    }

    set((state) => ({
      sankalpas: state.sankalpas.map((s) => (s.id === id ? updatedRecord : s))
    }));

    return true;
  },

  deleteSankalpa: async (id) => {
    try {
      await db.userSankalpas.delete(id);
      void deleteDevoteeSankalpaFromCloud(id);
    } catch (err) {
      console.warn("[SankalpaStore] Error deleting sankalpa from DB:", err);
    }

    set((state) => ({
      sankalpas: state.sankalpas.filter((s) => s.id !== id)
    }));

    return true;
  },

  toggleSankalpaActive: async (id) => {
    const existing = get().sankalpas.find((s) => s.id === id);
    if (!existing) return false;

    const newActive = !existing.isActive;
    return get().updateSankalpa(id, { isActive: newActive });
  },

  getActiveSankalpasText: (lang: SevaLang = "kn") => {
    const active = get().sankalpas.filter((s) => s.isActive);
    if (active.length === 0) {
      const fallbackPhrases: Record<SevaLang, { sanskrit: string; regional: string }> = {
        kn: {
          sanskrit: "ಮಮ ಕುಟುಂಬಸ್ಯ ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ, ಸರ್ವಾಭೀಷ್ಟ ಸಿದ್ಧ್ಯರ್ಥಂ",
          regional: "ಕುಟುಂಬದ ಸಕಲ ಕ್ಷೇಮ, ಆರೋಗ್ಯ ಮತ್ತು ಮನಶ್ಶಾಂತಿ ಸಿದ್ಧಿ"
        },
        hi: {
          sanskrit: "मम कुटुम्बस्य सर्वेषां आयुरारोग्य ऐश्वर्याभिवृद्धि सिद्ध्यर्थं, सर्वाभीष्ट सिद्ध्यर्थं",
          regional: "परिवार का सम्पूर्ण स्वास्थ्य, सुख-शांति एवं कार्यसिद्धि"
        },
        te: {
          sanskrit: "మమ కుటుంబస్య సర్వేషాం ఆయురారోగ్య ఐశ్వర్యాభివృద్ధి సిద్ధ్యర్థం, సర్వాభీష్ట సిద్ధ్యర్థం",
          regional: "కుటుంబ శ్రేయస్సు, ఆరోగ్యం మరియు మనశ్శాంతి ప్రాప్తి"
        },
        ta: {
          sanskrit: "மம குடும்பஸ்ய சர்வேஷாம் ஆயுராரோக்ய ஐஸ்வர்யாபிவிருத்தி சித்யர்த்தம், சர்வாபீஷ்ட சித்யர்த்தம்",
          regional: "குடும்ப நலம், உடல் நலம் மற்றும் மன அமைதி பிராப்தி"
        },
        en: {
          sanskrit: "Mama kuṭumbasya sarveṣāṁ āyurārogya aiśvaryābhivṛddhi siddhyarthaṁ, sarvābhīṣṭa siddhyarthaṁ",
          regional: "Family well-being, radiant health, and divine peace"
        }
      };
      const def = fallbackPhrases[lang] || fallbackPhrases.kn;
      return {
        sanskritText: def.sanskrit,
        kannadaText: def.regional,
        displayLanguageText: def.regional
      };
    }

    const sanskritParts = active.map((s) => {
      const preset = SANKALPA_PRESETS.find((p) => p.category === s.category);
      if (preset) {
        return getPresetSanskritPhrasing(preset, lang);
      }
      return s.sanskritPhrasing || s.title;
    }).join(", ");

    const displayParts = active.map((s) => s.title).join(" · ");

    return {
      sanskritText: sanskritParts,
      kannadaText: displayParts,
      displayLanguageText: displayParts
    };
  }
}));
