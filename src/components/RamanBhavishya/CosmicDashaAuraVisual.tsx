import React from 'react';

export interface CosmicDashaAuraProps {
  lagnaName: string;
  lagnaIndex: number;
  lagnaLordName?: string;
  moonName: string;
  moonIndex: number;
  nakshatraName: string;
  pada?: number | string;
  mahaLord: string;
  bhuktiLord: string;
  mahaLordKey?: string;
  bhuktiLordKey?: string;
  elementName?: string;
  lang?: string;
  jupiterTransitHouse?: number;
  saturnTransitHouse?: number;
}

interface GrahaAuraTheme {
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  accentBg: string;
  borderGold: string;
  beejaMantraKn: string;
  beejaMantraHi: string;
  beejaMantraTe: string;
  beejaMantraTa: string;
  beejaMantraEn: string;
  symbol: string;
  shortNameKn: string;
  shortNameHi: string;
  shortNameTe: string;
  shortNameTa: string;
  shortNameEn: string;
  kannadaName: string;
  hindiName: string;
  teluguName: string;
  tamilName: string;
  englishName: string;
  divineArchetypeKn: string;
  divineArchetypeHi: string;
  divineArchetypeTe: string;
  divineArchetypeTa: string;
  divineArchetypeEn: string;
}

const GRAHA_AURA_THEMES: Record<string, GrahaAuraTheme> = {
  Jupiter: {
    primaryColor: "#D97706", // Amber Gold
    secondaryColor: "#FEF3C7",
    glowColor: "rgba(217, 119, 6, 0.4)",
    accentBg: "bg-amber-100/80",
    borderGold: "border-amber-600",
    beejaMantraKn: "॥ ಓಂ ಬೃಹಸ್ಪತಯೇ ನಮಃ ॥",
    beejaMantraHi: "॥ ॐ बृहस्पतये नमः ॥",
    beejaMantraTe: "॥ ఓం బృహస్పతయే నమః ॥",
    beejaMantraTa: "॥ ஓம் பிரஹஸ்பதயே நமஹ ॥",
    beejaMantraEn: "॥ Om Brihaspataye Namaha ॥",
    symbol: "♃",
    shortNameKn: "ಗುರು",
    shortNameHi: "गुरु",
    shortNameTe: "గురు",
    shortNameTa: "குரு",
    shortNameEn: "JUPITER",
    kannadaName: "ಗುರು (ಬೃಹಸ್ಪತಿ)",
    hindiName: "बृहस्पति (गुरु)",
    teluguName: "గురుడు (బృహస్పతి)",
    tamilName: "குரு (வியாழன்)",
    englishName: "Jupiter (Brihaspati)",
    divineArchetypeKn: "ದೈವಿಕ ಜ್ಞಾನ, ಧರ್ಮ ರಕ್ಷಣೆ ಹಾಗೂ ಸಕಲ ಸೌಭಾಗ್ಯ ಕಾರಕ",
    divineArchetypeHi: "दैवीय ज्ञान, धर्म रक्षा एवं सर्व सौभाग्य कारक",
    divineArchetypeTe: "దైవిక జ్ఞానం, ధర్మ రక్షణ మరియు సకల సౌభాగ్య కారకుడు",
    divineArchetypeTa: "தெய்வீக ஞானம், தர்ம பாதுகாப்பு மற்றும் சகல சௌபாக்கிய காரகன்",
    divineArchetypeEn: "Bestower of Wisdom, Dharmic Expansion & Divine Grace"
  },
  Saturn: {
    primaryColor: "#1E3A8A", // Deep Royal Indigo/Blue
    secondaryColor: "#DBEAFE",
    glowColor: "rgba(30, 58, 138, 0.4)",
    accentBg: "bg-blue-100/80",
    borderGold: "border-blue-700",
    beejaMantraKn: "॥ ಓಂ ಶಂ ಶನೈಶ್ಚರಾಯ ನಮಃ ॥",
    beejaMantraHi: "॥ ॐ शं शनैश्चराय नमः ॥",
    beejaMantraTe: "॥ ఓం శం శనైశ్చరాయ నమః ॥",
    beejaMantraTa: "॥ ஓம் சனீஸ்வராய நமஹ ॥",
    beejaMantraEn: "॥ Om Sham Shanaishcharaya Namaha ॥",
    symbol: "♄",
    shortNameKn: "ಶನಿ",
    shortNameHi: "शनि",
    shortNameTe: "శని",
    shortNameTa: "சனி",
    shortNameEn: "SATURN",
    kannadaName: "ಶನಿ ದೇವ (ಕರ್ಮಕಾರಕ)",
    hindiName: "शनि देव (कर्मकारक)",
    teluguName: "శని దేవుడు (కర్మకారకుడు)",
    tamilName: "சனி பகவான் (கர்மகாரகன்)",
    englishName: "Saturn (Shani Deva)",
    divineArchetypeKn: "ನ್ಯಾಯ, ಕರ್ಮ ಪರಿಪಕ್ವತೆ, ಆತ್ಮಶಿಕ್ಷೆ ಹಾಗೂ ದೃಢ ಅಡಿಪಾಯ",
    divineArchetypeHi: "न्याय, कर्म शुद्धि, आत्म-संयम एवं दृढ़ आधार",
    divineArchetypeTe: "న్యాయం, కర్మ పరిపక్వత, ఆత్మశిక్షణ మరియు స్థిర పునాది",
    divineArchetypeTa: "நீதி, கர்ம பரிபக்குவம், சுய கட்டுப்பாடு மற்றும் உறுதியான அடித்தளம்",
    divineArchetypeEn: "Lord of Karmic Discipline, Endurance & Sovereign Foundations"
  },
  Mercury: {
    primaryColor: "#059669", // Emerald Green
    secondaryColor: "#D1FAE5",
    glowColor: "rgba(5, 150, 105, 0.4)",
    accentBg: "bg-emerald-100/80",
    borderGold: "border-emerald-600",
    beejaMantraKn: "॥ ಓಂ ಬುಂ ಬುಧಾಯ ನಮಃ ॥",
    beejaMantraHi: "॥ ॐ बुं बुधाय नमः ॥",
    beejaMantraTe: "॥ ఓం బుం బుధాయ నమః ॥",
    beejaMantraTa: "॥ ஓம் புதாய நமஹ ॥",
    beejaMantraEn: "॥ Om Bum Budhaya Namaha ॥",
    symbol: "☿",
    shortNameKn: "ಬುಧ",
    shortNameHi: "बुध",
    shortNameTe: "బుధ",
    shortNameTa: "புதன்",
    shortNameEn: "MERCURY",
    kannadaName: "ಬುಧ ದೇವ (ಬುದ್ಧಿಕಾರಕ)",
    hindiName: "बुध देव (बुद्धिकारक)",
    teluguName: "బుధ దేవుడు (జ్ఞానకారకుడు)",
    tamilName: "புதன் பகவான் (அறிவுகாரகன்)",
    englishName: "Mercury (Budha)",
    divineArchetypeKn: "ಉನ್ನತ ಬುದ್ಧಿಶಕ್ತಿ, ವ್ಯಾಪಾರ ವಿವೇಕ ಹಾಗೂ ವಾಗ್ಚಾತುರ್ಯ",
    divineArchetypeHi: "उच्च बौद्धिक विवेक, व्यापार कुशलता एवं वाकचातुर्य",
    divineArchetypeTe: "ఉన్నత బుద్ధి బలం, వ్యాపార వివేకం మరియు వాక్చాతుర్యం",
    divineArchetypeTa: "உயர்ந்த அறிவுத்திறன், வியாபார சாதுரியம் மற்றும் வாக்கு வன்மை",
    divineArchetypeEn: "Bestower of Discernment, Commercial Acumen & Intellect"
  },
  Venus: {
    primaryColor: "#BE185D", // Rose Diamond
    secondaryColor: "#FCE7F3",
    glowColor: "rgba(190, 24, 93, 0.4)",
    accentBg: "bg-pink-100/80",
    borderGold: "border-pink-600",
    beejaMantraKn: "॥ ಓಂ ಶುಂ ಶುಕ್ರಾಯ ನಮಃ ॥",
    beejaMantraHi: "॥ ॐ शुं शुक्राय नमः ॥",
    beejaMantraTe: "॥ ఓం శుం శుక్రాయ నమః ॥",
    beejaMantraTa: "॥ ஓம் சுக்ராய நமஹ ॥",
    beejaMantraEn: "॥ Om Shum Shukraya Namaha ॥",
    symbol: "♀",
    shortNameKn: "ಶುಕ್ರ",
    shortNameHi: "शुक्र",
    shortNameTe: "శుక్ర",
    shortNameTa: "சுக்ரன்",
    shortNameEn: "VENUS",
    kannadaName: "ಶುಕ್ರ ದೇವ (ಸೌಂದರ್ಯಕಾರಕ)",
    hindiName: "शुक्र देव (सौंदर्यकारक)",
    teluguName: "శుక్ర దేవుడు (సౌఖ్యకారకుడు)",
    tamilName: "சுக்கிர பகவான் (சுகபோககாரகன்)",
    englishName: "Venus (Shukra)",
    divineArchetypeKn: "ದಾಂಪತ್ಯ ಸುಖ, ಸೌಂದರ್ಯ, ಕಲಾತ್ಮಕ ಸಮೃದ್ಧಿ ಹಾಗೂ ಲಕ್ಷ್ಮಿ ಕೃಪೆ",
    divineArchetypeHi: "दांपत्य सौख्य, कलात्मक समृद्धि एवं महालक्ष्मी कृपा",
    divineArchetypeTe: "దాంపత్య సుఖం, సౌందర్యం, కళా సమృద్ధి మరియు లక్ష్మీ కటాక్షం",
    divineArchetypeTa: "இல்லற சுகம், அழகு, கலை வளம் மற்றும் மகாலட்சுமி அருள்",
    divineArchetypeEn: "Harbinger of Harmony, Aesthetics, Affluence & Lakshmi Grace"
  },
  Sun: {
    primaryColor: "#B45309", // Royal Solar Amber
    secondaryColor: "#FEF3C7",
    glowColor: "rgba(180, 83, 9, 0.45)",
    accentBg: "bg-amber-100/90",
    borderGold: "border-amber-700",
    beejaMantraKn: "॥ ಓಂ ಸೂರ್ಯಾಯ ನಮಃ ॥",
    beejaMantraHi: "॥ ॐ सूर्याय नमः ॥",
    beejaMantraTe: "॥ ఓం సూర్యాయ నమః ॥",
    beejaMantraTa: "॥ ஓம் சூர்யாய நமஹ ॥",
    beejaMantraEn: "॥ Om Suryaya Namaha ॥",
    symbol: "☀️",
    shortNameKn: "ರವಿ",
    shortNameHi: "सूर्य",
    shortNameTe: "సూర్య",
    shortNameTa: "சூரியன்",
    shortNameEn: "SUN",
    kannadaName: "ಸೂರ್ಯ ನಾರಾಯಣ (ಆತ್ಮಕಾರಕ)",
    hindiName: "सूर्य नारायण (आत्मकारक)",
    teluguName: "సూర్య భగవానుడు (ఆత్మకారకుడు)",
    tamilName: "சூரிய பகவான் (ஆத்மகாரகன்)",
    englishName: "Sun (Surya Narayana)",
    divineArchetypeKn: "ಆತ್ಮ ತೇಜಸ್ಸು, ಆರೋಗ್ಯ, ಅಧಿಕಾರ ಹಾಗೂ ನಾಯಕತ್ವ ಶಕ್ತಿ",
    divineArchetypeHi: "आत्म तेज, उत्तम स्वास्थ्य, अधिकार एवं नेतृत्व शक्ति",
    divineArchetypeTe: "ఆత్మ తేజస్సు, ఆరోగ్యం, అధికారం మరియు నాయకత్వ శక్తి",
    divineArchetypeTa: "ஆன்ம ஒளி, ஆரோக்கியம், அதிகாரம் மற்றும் தலைமைத்துவ ஆற்றல்",
    divineArchetypeEn: "Sovereign Source of Vitality, Soul Radiance & Authority"
  },
  Moon: {
    primaryColor: "#0284C7", // Celestial Silver Blue
    secondaryColor: "#E0F2FE",
    glowColor: "rgba(2, 132, 199, 0.4)",
    accentBg: "bg-sky-100/80",
    borderGold: "border-sky-600",
    beejaMantraKn: "॥ ಓಂ ಸೋಮಾಯ ನಮಃ ॥",
    beejaMantraHi: "॥ ॐ सोमाय नमः ॥",
    beejaMantraTe: "॥ ఓం సోమాయ నమః ॥",
    beejaMantraTa: "॥ ஓம் சந்திராய நமஹ ॥",
    beejaMantraEn: "॥ Om Somaya Namaha ॥",
    symbol: "🌙",
    shortNameKn: "ಚಂದ್ರ",
    shortNameHi: "चंद्र",
    shortNameTe: "చంద్ర",
    shortNameTa: "சந்திரன்",
    shortNameEn: "MOON",
    kannadaName: "ಚಂದ್ರ ದೇವ (ಮನಃಕಾರಕ)",
    hindiName: "चंद्र देव (मनःकारक)",
    teluguName: "చంద్ర దేవుడు (మనఃకారకుడు)",
    tamilName: "சந்திர பகவான் (மனோகாரகன்)",
    englishName: "Moon (Chandra)",
    divineArchetypeKn: "ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆ, ಅಂತಃಪ್ರಜ್ಞೆ, ತಾಯಿಯ ವಾತ್ಸಲ್ಯ ಹಾಗೂ ಚೇತನ",
    divineArchetypeHi: "मानसिक शांति, अंतर्ज्ञान, मातृ वात्सल्य एवं चेतन शक्ति",
    divineArchetypeTe: "మానసిక ప్రశాంతత, అంతర్ దృష్టి, మాతృ వాత్సల్యం మరియు చైతన్యం",
    divineArchetypeTa: "மன அமைதி, உள்ளுணர்வு, தாய் பாசம் மற்றும் ஜீவ சக்தி",
    divineArchetypeEn: "Guardian of Lunar Equanimity, Intuition & Psychic Clarity"
  },
  Mars: {
    primaryColor: "#DC2626", // Radiant Crimson
    secondaryColor: "#FEE2E2",
    glowColor: "rgba(220, 38, 38, 0.4)",
    accentBg: "bg-red-100/80",
    borderGold: "border-red-600",
    beejaMantraKn: "॥ ಓಂ ಭೌಮಾಯ ನಮಃ ॥",
    beejaMantraHi: "॥ ॐ भौमाय नमः ॥",
    beejaMantraTe: "॥ ఓం భౌమాయ నమః ॥",
    beejaMantraTa: "॥ ஓம் செவ்வாயே நமஹ ॥",
    beejaMantraEn: "॥ Om Bhaumaya Namaha ॥",
    symbol: "♂",
    shortNameKn: "ಕುಜ",
    shortNameHi: "मंगल",
    shortNameTe: "కుజ",
    shortNameTa: "செவ்வாய்",
    shortNameEn: "MARS",
    kannadaName: "ಕುಜ ದೇವ (ಧೈರ್ಯಕಾರಕ)",
    hindiName: "मंगल देव (धैर्यकारक)",
    teluguName: "కుజ దేవుడు (ధైర్యకారకుడు)",
    tamilName: "செவ்வாய் பகவான் (வீரியகாரகன்)",
    englishName: "Mars (Mangala)",
    divineArchetypeKn: "ಅಪ್ರತಿಮ ಶೌರ್ಯ, ರಕ್ಷಣಾ ಕವಚ, ಶಕ್ತಿ ಹಾಗೂ ಭೂಮಿ ಲಾಭ",
    divineArchetypeHi: "अदम्य शौर्य, रक्षा कवच, शक्ति एवं भूमि लाभ",
    divineArchetypeTe: "అప్రతిహత ధైర్యం, రక్షా కవచం, శక్తి మరియు భూ లాభం",
    divineArchetypeTa: "வீரம், பாதுகாப்பு கவசம், ஆற்றல் மற்றும் பூமி யோகம்",
    divineArchetypeEn: "Cosmic Protector of Valor, Decisive Action & Physical Fire"
  },
  Rahu: {
    primaryColor: "#4B5563", // Mystic Slate
    secondaryColor: "#F3F4F6",
    glowColor: "rgba(75, 85, 99, 0.4)",
    accentBg: "bg-slate-100/80",
    borderGold: "border-slate-600",
    beejaMantraKn: "॥ ಓಂ ರಾಹವೇ ನಮಃ ॥",
    beejaMantraHi: "॥ ॐ राहवे नमः ॥",
    beejaMantraTe: "॥ ఓం రాహవే నమః ॥",
    beejaMantraTa: "॥ ஓம் ராகவே நமஹ ॥",
    beejaMantraEn: "॥ Om Rahave Namaha ॥",
    symbol: "☊",
    shortNameKn: "ರಾಹು",
    shortNameHi: "राहु",
    shortNameTe: "రాహు",
    shortNameTa: "ராகு",
    shortNameEn: "RAHU",
    kannadaName: "ರಾಹು ಗ್ರಹ (ಕೌಶಲ್ಯಕಾರಕ)",
    hindiName: "राहु ग्रह (कौशलकारक)",
    teluguName: "రాహు గ్రహం (యుక్తికారకుడు)",
    tamilName: "ராகு பகவான் (தந்திரகாரகன்)",
    englishName: "Rahu (North Lunar Node)",
    divineArchetypeKn: "ಅಂತಾರಾಷ್ಟ್ರೀಯ ಯೋಗ, ಕ್ರಾಂತಿಕಾರಿ ಯಶಸ್ಸು ಹಾಗೂ ತಾಂತ್ರಿಕ ಪ್ರಜ್ಞೆ",
    divineArchetypeHi: "दूरगामी विस्तार, युक्ति एवं अप्रत्याशित सफलता",
    divineArchetypeTe: "విస్తరణ, యుక్తి, విదేశీ యోగం మరియు అద్భుత విజయం",
    divineArchetypeTa: "தொழில்நுட்ப அறிவு, வெளிநாட்டு யோகம் மற்றும் அபார வெற்றி",
    divineArchetypeEn: "Catalyst of Quantum Leaps, Ambition & Karmic Breakthroughs"
  },
  Ketu: {
    primaryColor: "#78350F", // Sacred Ochre Sandal
    secondaryColor: "#FEF3C7",
    glowColor: "rgba(120, 53, 15, 0.4)",
    accentBg: "bg-amber-100/80",
    borderGold: "border-amber-700",
    beejaMantraKn: "॥ ಓಂ ಕೇತವೇ ನಮಃ ॥",
    beejaMantraHi: "॥ ॐ केतवे नमः ॥",
    beejaMantraTe: "॥ ఓం కేతవే నమః ॥",
    beejaMantraTa: "॥ ஓம் கேதுவே நமஹ ॥",
    beejaMantraEn: "॥ Om Ketave Namaha ॥",
    symbol: "☋",
    shortNameKn: "ಕೇತು",
    shortNameHi: "केतु",
    shortNameTe: "కేతు",
    shortNameTa: "கேது",
    shortNameEn: "KETU",
    kannadaName: "ಕೇತು ಗ್ರಹ (ಮೋಕ್ಷಕಾರಕ)",
    hindiName: "केतु ग्रह (मोक्षकारक)",
    teluguName: "కేతు గ్రహం (మోక్షకారకుడు)",
    tamilName: "கேது பகவான் (ஞானகாரகன்)",
    englishName: "Ketu (South Lunar Node)",
    divineArchetypeKn: "ಆಧ್ಯಾತ್ಮಿಕ ಮುಕ್ತಿ, ನಿಗೂಢ ಜ್ಞಾನ, ಧ್ಯಾನ ಹಾಗೂ ಪರಮ ಸತ್ಯ",
    divineArchetypeHi: "आध्यात्मिक मुक्ति, सूक्ष्म ज्ञान, ध्यान एवं आत्मसाक्षात्कार",
    divineArchetypeTe: "ఆధ్యాత్మిక ముక్తి, నిగూఢ జ్ఞానం, ధ్యానం మరియు ఆత్మసాక్షాత్కారం",
    divineArchetypeTa: "ஆன்மீக முக்தி, ஞானம், தியானம் மற்றும் பரம உண்மை",
    divineArchetypeEn: "Lord of Spiritual Liberation, Mystical Insight & Higher Truth"
  }
};

const ZODIAC_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

function resolveGrahaKey(keyOrName?: string): string {
  if (!keyOrName) return "Jupiter";
  const s = keyOrName.trim().toLowerCase();
  if (s.includes("jup") || s.includes("guru") || s.includes("ಗುರು") || s.includes("ಬೃಹಸ್ಪತಿ") || s.includes("बृहस्पति") || s.includes("బృహస్పతి") || s.includes("குரு") || s.includes("வியாழன்")) return "Jupiter";
  if (s.includes("sat") || s.includes("shani") || s.includes("ಶನಿ") || s.includes("शनि") || s.includes("శని") || s.includes("சனி")) return "Saturn";
  if (s.includes("mer") || s.includes("budh") || s.includes("ಬುಧ") || s.includes("बुध") || s.includes("బుధ") || s.includes("புதன்")) return "Mercury";
  if (s.includes("ven") || s.includes("shuk") || s.includes("ಶುಕ್ರ") || s.includes("शुक्र") || s.includes("శుక్ర") || s.includes("சுக்கிரன்")) return "Venus";
  if (s.includes("sun") || s.includes("sury") || s.includes("ರವಿ") || s.includes("ಸೂರ್ಯ") || s.includes("सूर्य") || s.includes("సూర్య") || s.includes("சூரியன்")) return "Sun";
  if (s.includes("moon") || s.includes("chan") || s.includes("ಚಂದ್ರ") || s.includes("ಸೋಮ") || s.includes("चंद्र") || s.includes("చంద్ర") || s.includes("சந்திரன்")) return "Moon";
  if (s.includes("mar") || s.includes("kuj") || s.includes("mang") || s.includes("ಕುಜ") || s.includes("ಮಂಗಳ") || s.includes("मंगल") || s.includes("కుజ") || s.includes("செவ்வாய்")) return "Mars";
  if (s.includes("rah") || s.includes("ರಾಹು") || s.includes("राहु") || s.includes("రాహు") || s.includes("ராகு")) return "Rahu";
  if (s.includes("ket") || s.includes("ಕೇತು") || s.includes("केतु") || s.includes("కేతు") || s.includes("கேது")) return "Ketu";
  return "Jupiter";
}

function getLagnaElement(idx: number, lang: string): string {
  const normIdx = ((idx % 12) + 12) % 12;
  const isFire = normIdx === 0 || normIdx === 4 || normIdx === 8;
  const isEarth = normIdx === 1 || normIdx === 5 || normIdx === 9;
  const isAir = normIdx === 2 || normIdx === 6 || normIdx === 10;
  // Water: 3, 7, 11

  if (lang === "kn") {
    if (isFire) return "ಅಗ್ನಿ ತತ್ವ (ತೇಜಸ್ಸು)";
    if (isEarth) return "ಪೃಥ್ವಿ ತತ್ವ (ಸ್ಥಿರತೆ)";
    if (isAir) return "ವಾಯು ತತ್ವ (ಬುದ್ಧಿಶಕ್ತಿ)";
    return "ಜಲ ತತ್ವ (ಭಾವಶಕ್ತಿ & ಅಂತಃಪ್ರಜ್ಞೆ)";
  }
  if (lang === "hi") {
    if (isFire) return "अग्नि तत्व (तेजस्विता)";
    if (isEarth) return "पृथ्वी तत्व (स्थिरता)";
    if (isAir) return "वायु तत्व (बौद्धिक विवेक)";
    return "जल तत्व (भावुकता एवं अंतर्ज्ञान)";
  }
  if (lang === "te") {
    if (isFire) return "అగ్ని తత్త్వం (తేజస్సు)";
    if (isEarth) return "పృథ్వీ తత్త్వం (స్థిరత్వం)";
    if (isAir) return "వాయు తత్త్వం (జ్ఞానశక్తి)";
    return "జల తత్త్వం (భావోద్వేగం)";
  }
  if (lang === "ta") {
    if (isFire) return "நெருப்பு தத்துவம் (வீரியம்)";
    if (isEarth) return "பூமி தத்துவம் (நிலைத்தன்மை)";
    if (isAir) return "காற்று தத்துவம் (அறிவுத்திறன்)";
    return "நீர் தத்துவம் (உணர்வுப்பலம்)";
  }
  if (isFire) return "Fire Element (Radiance)";
  if (isEarth) return "Earth Element (Stability)";
  if (isAir) return "Air Element (Intellect)";
  return "Water Element (Intuition)";
}


// ── Authentic Atmospheric Planetary Globe Renderer ─────────────────────────
const renderAtmosphericPlanet = (
  grahaKey: string,
  theme: GrahaAuraTheme,
  dashaLordShortName: string,
  indicFontFamily: string
) => {
  switch (grahaKey) {
    case "Jupiter":
      return (
        <g id="jupiterAtmosphericPlanet">
          <defs>
            <radialGradient id="jupCore" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="25%" stopColor="#FDE68A" />
              <stop offset="55%" stopColor="#D97706" />
              <stop offset="85%" stopColor="#92400E" />
              <stop offset="100%" stopColor="#451A03" />
            </radialGradient>
            <linearGradient id="jupRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0.4" />
            </linearGradient>
            <clipPath id="jupSphereClip">
              <circle cx="200" cy="200" r="48" />
            </clipPath>
          </defs>

          {/* Luminous Outer Atmosphere Ring */}
          <ellipse
            cx="200"
            cy="200"
            rx="68"
            ry="18"
            transform="rotate(-15 200 200)"
            fill="none"
            stroke="url(#jupRingGrad)"
            strokeWidth="3.5"
            opacity="0.85"
            style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.6))" }}
          />
          <ellipse
            cx="200"
            cy="200"
            rx="64"
            ry="16"
            transform="rotate(-15 200 200)"
            fill="none"
            stroke="#FFFBEB"
            strokeWidth="1"
            strokeDasharray="4,2"
            opacity="0.7"
          />

          {/* Planet Sphere with Atmospheric Cloud Bands */}
          <g clipPath="url(#jupSphereClip)">
            <circle cx="200" cy="200" r="48" fill="url(#jupCore)" />
            <rect x="145" y="160" width="110" height="7" fill="#92400E" opacity="0.75" />
            <rect x="145" y="169" width="110" height="5" fill="#FEF3C7" opacity="0.6" />
            <rect x="145" y="176" width="110" height="9" fill="#78350F" opacity="0.8" />
            <rect x="145" y="187" width="110" height="7" fill="#FFFBEB" opacity="0.75" />
            <rect x="145" y="196" width="110" height="10" fill="#92400E" opacity="0.85" />
            <rect x="145" y="208" width="110" height="7" fill="#FEF3C7" opacity="0.6" />
            <rect x="145" y="217" width="110" height="8" fill="#78350F" opacity="0.75" />
            <rect x="145" y="227" width="110" height="6" fill="#451A03" opacity="0.8" />

            {/* Great Red Spot Storm Vortex */}
            <ellipse cx="218" cy="202" rx="9" ry="5.5" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
            <ellipse cx="218" cy="202" rx="5" ry="3" fill="#EF4444" />
            <circle cx="217" cy="201" r="1.5" fill="#FEF2F2" />

            {/* 3D Spherical Specular Highlight & Terminator Shadow */}
            <circle cx="185" cy="185" r="48" fill="#FFFFFF" opacity="0.18" />
            <ellipse cx="225" cy="225" rx="30" ry="25" fill="#000000" opacity="0.35" />
          </g>

          <circle cx="200" cy="200" r="48" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.9" />

          {/* Foreground Passing Segment of Ring */}
          <path
            d="M 134 200 A 68 18 0 0 0 266 200"
            transform="rotate(-15 200 200)"
            fill="none"
            stroke="url(#jupRingGrad)"
            strokeWidth="3.5"
            opacity="0.95"
          />

          {/* Elegant Center Golden Pill for Sigil & Name */}
          <rect
            x="158"
            y="222"
            width="84"
            height="22"
            rx="11"
            fill="rgba(30,15,5,0.88)"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          <text
            x="200"
            y="237"
            textAnchor="middle"
            fill="#FEF3C7"
            fontSize="12"
            fontWeight="bold"
            style={{
              fontFamily: indicFontFamily,
              letterSpacing: "normal"
            }}
          >
            ♃ {dashaLordShortName}
          </text>
        </g>
      );

    case "Saturn":
      return (
        <g id="saturnAtmosphericPlanet">
          <defs>
            <radialGradient id="satCore" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="35%" stopColor="#EAB308" />
              <stop offset="65%" stopColor="#A16207" />
              <stop offset="100%" stopColor="#365314" />
            </radialGradient>
            <linearGradient id="satRingA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CA8A04" />
              <stop offset="50%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#713F12" />
            </linearGradient>
            <clipPath id="satSphereClip">
              <circle cx="200" cy="200" r="40" />
            </clipPath>
          </defs>

          {/* Background Ring Behind Saturn */}
          <path
            d="M 122 200 A 78 22 0 0 1 278 200"
            transform="rotate(-26 200 200)"
            fill="none"
            stroke="url(#satRingA)"
            strokeWidth="14"
            opacity="0.95"
            style={{ filter: "drop-shadow(0 0 6px rgba(202,138,4,0.5))" }}
          />
          <path
            d="M 122 200 A 78 22 0 0 1 278 200"
            transform="rotate(-26 200 200)"
            fill="none"
            stroke="#1E293B"
            strokeWidth="2"
            opacity="0.9"
          />

          {/* Globe */}
          <g clipPath="url(#satSphereClip)">
            <circle cx="200" cy="200" r="40" fill="url(#satCore)" />
            <rect x="155" y="172" width="90" height="6" fill="#713F12" opacity="0.6" />
            <rect x="155" y="182" width="90" height="5" fill="#FEF08A" opacity="0.5" />
            <rect x="155" y="191" width="90" height="8" fill="#854D0E" opacity="0.7" />
            <rect x="155" y="203" width="90" height="6" fill="#FEF08A" opacity="0.5" />
            <rect x="155" y="213" width="90" height="7" fill="#713F12" opacity="0.6" />
            {/* Ring Shadow on Globe */}
            <path
              d="M 160 196 Q 200 202 240 196"
              fill="none"
              stroke="rgba(15,23,42,0.6)"
              strokeWidth="6"
            />
            <circle cx="188" cy="188" r="40" fill="#FFFFFF" opacity="0.18" />
            <ellipse cx="220" cy="220" rx="25" ry="20" fill="#000000" opacity="0.4" />
          </g>

          <circle cx="200" cy="200" r="40" fill="none" stroke="#EAB308" strokeWidth="2" opacity="0.9" />

          {/* Foreground Ring In Front of Saturn */}
          <path
            d="M 278 200 A 78 22 0 0 1 122 200"
            transform="rotate(-26 200 200)"
            fill="none"
            stroke="url(#satRingA)"
            strokeWidth="14"
            opacity="0.95"
          />
          <path
            d="M 278 200 A 78 22 0 0 1 122 200"
            transform="rotate(-26 200 200)"
            fill="none"
            stroke="#1E293B"
            strokeWidth="2"
            opacity="0.9"
          />

          <rect
            x="158"
            y="222"
            width="84"
            height="22"
            rx="11"
            fill="rgba(15,23,42,0.88)"
            stroke="#EAB308"
            strokeWidth="1.5"
          />
          <text
            x="200"
            y="237"
            textAnchor="middle"
            fill="#FEF08A"
            fontSize="12"
            fontWeight="bold"
            style={{
              fontFamily: indicFontFamily,
              letterSpacing: "normal"
            }}
          >
            ♄ {dashaLordShortName}
          </text>
        </g>
      );

    case "Sun":
      return (
        <g id="sunAtmosphericPlanet">
          <defs>
            <radialGradient id="sunCore" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="20%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#991B1B" />
            </radialGradient>
            <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#DC2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Corona and Prominences */}
          <circle cx="200" cy="200" r="66" fill="url(#sunCorona)" />
          {Array.from({ length: 16 }).map((_, i) => {
            const rad = (i * 22.5) * (Math.PI / 180);
            const x1 = 200 + 48 * Math.cos(rad);
            const y1 = 200 + 48 * Math.sin(rad);
            const x2 = 200 + (64 + (i % 2 === 0 ? 8 : 4)) * Math.cos(rad);
            const y2 = 200 + (64 + (i % 2 === 0 ? 8 : 4)) * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FBBF24"
                strokeWidth={i % 2 === 0 ? "2.5" : "1.5"}
                strokeLinecap="round"
                opacity="0.85"
              />
            );
          })}

          <path d="M 166 166 Q 155 155 174 158" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 234 166 Q 248 158 238 178" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 200 248 Q 206 260 216 246" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />

          <circle cx="200" cy="200" r="48" fill="url(#sunCore)" />
          <circle cx="200" cy="200" r="48" fill="none" stroke="#FEF08A" strokeWidth="2" opacity="0.9" />

          <rect
            x="158"
            y="222"
            width="84"
            height="22"
            rx="11"
            fill="rgba(69,26,3,0.88)"
            stroke="#F59E0B"
            strokeWidth="1.5"
          />
          <text
            x="200"
            y="237"
            textAnchor="middle"
            fill="#FEF08A"
            fontSize="12"
            fontWeight="bold"
            style={{
              fontFamily: indicFontFamily,
              letterSpacing: "normal"
            }}
          >
            ☉ {dashaLordShortName}
          </text>
        </g>
      );

    case "Moon":
      return (
        <g id="moonAtmosphericPlanet">
          <defs>
            <radialGradient id="moonCore" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#E2E8F0" />
              <stop offset="70%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>
            <clipPath id="moonSphereClip">
              <circle cx="200" cy="200" r="48" />
            </clipPath>
          </defs>

          <circle
            cx="200"
            cy="200"
            r="62"
            fill="none"
            stroke="rgba(226,232,240,0.6)"
            strokeWidth="2.5"
            strokeDasharray="4,2"
            style={{ filter: "drop-shadow(0 0 8px rgba(186,230,253,0.6))" }}
          />

          <g clipPath="url(#moonSphereClip)">
            <circle cx="200" cy="200" r="48" fill="url(#moonCore)" />
            <ellipse cx="188" cy="185" rx="14" ry="10" fill="#475569" opacity="0.55" />
            <ellipse cx="212" cy="192" rx="12" ry="8" fill="#475569" opacity="0.5" />
            <ellipse cx="195" cy="214" rx="16" ry="9" fill="#334155" opacity="0.6" />
            <ellipse cx="178" cy="205" rx="9" ry="7" fill="#475569" opacity="0.45" />

            <circle cx="208" cy="224" r="3.5" fill="#FFFFFF" />
            <line x1="208" y1="224" x2="190" y2="210" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
            <line x1="208" y1="224" x2="228" y2="212" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
            <line x1="208" y1="224" x2="214" y2="242" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />

            <circle cx="185" cy="185" r="48" fill="#FFFFFF" opacity="0.25" />
            <ellipse cx="225" cy="225" rx="30" ry="25" fill="#0F172A" opacity="0.35" />
          </g>

          <circle cx="200" cy="200" r="48" fill="none" stroke="#E2E8F0" strokeWidth="2" opacity="0.9" />

          <rect
            x="158"
            y="222"
            width="84"
            height="22"
            rx="11"
            fill="rgba(15,23,42,0.88)"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          <text
            x="200"
            y="237"
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="12"
            fontWeight="bold"
            style={{
              fontFamily: indicFontFamily,
              letterSpacing: "normal"
            }}
          >
            ☽ {dashaLordShortName}
          </text>
        </g>
      );

    case "Mars":
      return (
        <g id="marsAtmosphericPlanet">
          <defs>
            <radialGradient id="marsCore" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="35%" stopColor="#EF4444" />
              <stop offset="70%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#450A0A" />
            </radialGradient>
            <clipPath id="marsSphereClip">
              <circle cx="200" cy="200" r="48" />
            </clipPath>
          </defs>

          <ellipse
            cx="200"
            cy="200"
            rx="66"
            ry="18"
            transform="rotate(18 200 200)"
            fill="none"
            stroke="#F87171"
            strokeWidth="2.5"
            opacity="0.8"
            style={{ filter: "drop-shadow(0 0 6px rgba(220,38,38,0.6))" }}
          />

          <g clipPath="url(#marsSphereClip)">
            <circle cx="200" cy="200" r="48" fill="url(#marsCore)" />
            <ellipse cx="200" cy="156" rx="14" ry="5" fill="#FFFFFF" opacity="0.95" />
            <ellipse cx="200" cy="157" rx="16" ry="6" fill="#BFDBFE" opacity="0.4" />

            <path
              d="M 185 180 Q 200 175 215 188 Q 205 205 185 195 Z"
              fill="#7F1D1D"
              opacity="0.7"
            />
            <path
              d="M 170 210 Q 195 215 225 208 Q 215 224 175 220 Z"
              fill="#450A0A"
              opacity="0.65"
            />
            <path d="M 178 198 Q 205 202 228 196" fill="none" stroke="#450A0A" strokeWidth="2" opacity="0.8" />

            <circle cx="185" cy="185" r="48" fill="#FFFFFF" opacity="0.18" />
            <ellipse cx="225" cy="225" rx="30" ry="25" fill="#000000" opacity="0.4" />
          </g>

          <circle cx="200" cy="200" r="48" fill="none" stroke="#EF4444" strokeWidth="2" opacity="0.9" />

          <rect
            x="158"
            y="222"
            width="84"
            height="22"
            rx="11"
            fill="rgba(69,10,10,0.88)"
            stroke="#EF4444"
            strokeWidth="1.5"
          />
          <text
            x="200"
            y="237"
            textAnchor="middle"
            fill="#FEE2E2"
            fontSize="12"
            fontWeight="bold"
            style={{
              fontFamily: indicFontFamily,
              letterSpacing: "normal"
            }}
          >
            ♂ {dashaLordShortName}
          </text>
        </g>
      );

    case "Mercury":
      return (
        <g id="mercuryAtmosphericPlanet">
          <defs>
            <radialGradient id="mercCore" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#F5D0FE" />
              <stop offset="35%" stopColor="#C084FC" />
              <stop offset="70%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#3B0764" />
            </radialGradient>
            <clipPath id="mercSphereClip">
              <circle cx="200" cy="200" r="46" />
            </clipPath>
          </defs>

          <ellipse
            cx="200"
            cy="200"
            rx="64"
            ry="16"
            transform="rotate(-12 200 200)"
            fill="none"
            stroke="#C084FC"
            strokeWidth="2.5"
            opacity="0.8"
            style={{ filter: "drop-shadow(0 0 6px rgba(168,85,247,0.5))" }}
          />

          <g clipPath="url(#mercSphereClip)">
            <circle cx="200" cy="200" r="46" fill="url(#mercCore)" />
            <circle cx="188" cy="188" r="6" fill="#581C87" opacity="0.6" stroke="#E9D5FF" strokeWidth="1" />
            <circle cx="214" cy="198" r="8" fill="#581C87" opacity="0.5" stroke="#E9D5FF" strokeWidth="1" />
            <circle cx="198" cy="216" r="5" fill="#3B0764" opacity="0.7" stroke="#E9D5FF" strokeWidth="0.8" />
            <circle cx="180" cy="208" r="4" fill="#3B0764" opacity="0.6" />

            <circle cx="185" cy="185" r="46" fill="#FFFFFF" opacity="0.2" />
            <ellipse cx="225" cy="225" rx="28" ry="24" fill="#000000" opacity="0.4" />
          </g>

          <circle cx="200" cy="200" r="46" fill="none" stroke="#C084FC" strokeWidth="2" opacity="0.9" />

          <rect
            x="158"
            y="222"
            width="84"
            height="22"
            rx="11"
            fill="rgba(59,7,100,0.88)"
            stroke="#C084FC"
            strokeWidth="1.5"
          />
          <text
            x="200"
            y="237"
            textAnchor="middle"
            fill="#F3E8FF"
            fontSize="12"
            fontWeight="bold"
            style={{
              fontFamily: indicFontFamily,
              letterSpacing: "normal"
            }}
          >
            ☿ {dashaLordShortName}
          </text>
        </g>
      );

    case "Venus":
      return (
        <g id="venusAtmosphericPlanet">
          <defs>
            <radialGradient id="venCore" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#FDE68A" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>
            <clipPath id="venSphereClip">
              <circle cx="200" cy="200" r="48" />
            </clipPath>
          </defs>

          <ellipse
            cx="200"
            cy="200"
            rx="66"
            ry="18"
            transform="rotate(20 200 200)"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="3"
            opacity="0.9"
            style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.6))" }}
          />

          <g clipPath="url(#venSphereClip)">
            <circle cx="200" cy="200" r="48" fill="url(#venCore)" />
            <path d="M 160 178 Q 200 186 240 178" fill="none" stroke="#FBBF24" strokeWidth="6" opacity="0.6" />
            <path d="M 155 194 Q 200 204 245 194" fill="none" stroke="#FFFFFF" strokeWidth="7" opacity="0.75" />
            <path d="M 158 210 Q 200 220 242 210" fill="none" stroke="#D97706" strokeWidth="6" opacity="0.6" />

            <circle cx="185" cy="185" r="48" fill="#FFFFFF" opacity="0.3" />
            <ellipse cx="225" cy="225" rx="30" ry="25" fill="#451A03" opacity="0.3" />
          </g>

          <circle cx="200" cy="200" r="48" fill="none" stroke="#FDE68A" strokeWidth="2" opacity="0.9" />

          <rect
            x="158"
            y="222"
            width="84"
            height="22"
            rx="11"
            fill="rgba(69,26,3,0.88)"
            stroke="#FDE68A"
            strokeWidth="1.5"
          />
          <text
            x="200"
            y="237"
            textAnchor="middle"
            fill="#FFFBEB"
            fontSize="12"
            fontWeight="bold"
            style={{
              fontFamily: indicFontFamily,
              letterSpacing: "normal"
            }}
          >
            ♀ {dashaLordShortName}
          </text>
        </g>
      );

    case "Rahu":
      return (
        <g id="rahuAtmosphericPlanet">
          <defs>
            <radialGradient id="rahuCore" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#312E81" />
              <stop offset="50%" stopColor="#1E1B4B" />
              <stop offset="85%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <clipPath id="rahuSphereClip">
              <circle cx="200" cy="200" r="48" />
            </clipPath>
          </defs>

          <circle
            cx="200"
            cy="200"
            r="54"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            opacity="0.8"
            style={{ filter: "drop-shadow(0 0 10px rgba(56,189,248,0.7))" }}
          />
          <circle cx="236" cy="164" r="5" fill="#FFFFFF" style={{ filter: "drop-shadow(0 0 8px #FFFFFF)" }} />

          <g clipPath="url(#rahuSphereClip)">
            <circle cx="200" cy="200" r="48" fill="url(#rahuCore)" />
            <ellipse cx="190" cy="190" rx="20" ry="12" fill="#4338CA" opacity="0.4" />
            <ellipse cx="215" cy="210" rx="18" ry="10" fill="#06B6D4" opacity="0.3" />
          </g>

          <circle cx="200" cy="200" r="48" fill="none" stroke="#6366F1" strokeWidth="2" opacity="0.85" />

          <rect
            x="158"
            y="222"
            width="84"
            height="22"
            rx="11"
            fill="rgba(2,6,23,0.88)"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />
          <text
            x="200"
            y="237"
            textAnchor="middle"
            fill="#E0F2FE"
            fontSize="12"
            fontWeight="bold"
            style={{
              fontFamily: indicFontFamily,
              letterSpacing: "normal"
            }}
          >
            ☊ {dashaLordShortName}
          </text>
        </g>
      );

    case "Ketu":
    default:
      return (
        <g id="ketuAtmosphericPlanet">
          <defs>
            <radialGradient id="ketuCore" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="35%" stopColor="#EA580C" />
              <stop offset="70%" stopColor="#991B1B" />
              <stop offset="100%" stopColor="#450A0A" />
            </radialGradient>
            <clipPath id="ketuSphereClip">
              <circle cx="200" cy="200" r="46" />
            </clipPath>
          </defs>

          <ellipse
            cx="200"
            cy="200"
            rx="66"
            ry="18"
            transform="rotate(-25 200 200)"
            fill="none"
            stroke="#F97316"
            strokeWidth="3"
            opacity="0.85"
            style={{ filter: "drop-shadow(0 0 8px rgba(234,88,12,0.6))" }}
          />

          <g clipPath="url(#ketuSphereClip)">
            <circle cx="200" cy="200" r="46" fill="url(#ketuCore)" />
            <path d="M 160 180 Q 200 170 235 185" fill="none" stroke="#FEF08A" strokeWidth="4" opacity="0.7" />
            <path d="M 165 200 Q 200 195 240 205" fill="none" stroke="#EA580C" strokeWidth="5" opacity="0.8" />
            <path d="M 170 218 Q 200 215 235 222" fill="none" stroke="#7F1D1D" strokeWidth="4" opacity="0.8" />
          </g>

          <circle cx="200" cy="200" r="46" fill="none" stroke="#F97316" strokeWidth="2" opacity="0.9" />

          <rect
            x="158"
            y="222"
            width="84"
            height="22"
            rx="11"
            fill="rgba(69,10,10,0.88)"
            stroke="#F97316"
            strokeWidth="1.5"
          />
          <text
            x="200"
            y="237"
            textAnchor="middle"
            fill="#FEF3C7"
            fontSize="12"
            fontWeight="bold"
            style={{
              fontFamily: indicFontFamily,
              letterSpacing: "normal"
            }}
          >
            ☋ {dashaLordShortName}
          </text>
        </g>
      );
  }
};

export const CosmicDashaAuraVisual: React.FC<CosmicDashaAuraProps> = ({
  lagnaName,
  lagnaIndex,
  lagnaLordName,
  moonName,
  moonIndex,
  nakshatraName,
  pada,
  mahaLord,
  bhuktiLord,
  mahaLordKey,
  bhuktiLordKey,
  elementName,
  lang = "kn"
}) => {
  const baseLang = (lang || "en").split("-")[0];
  const effectiveMahaKey = resolveGrahaKey(mahaLordKey || mahaLord);
  const theme = GRAHA_AURA_THEMES[effectiveMahaKey] || GRAHA_AURA_THEMES.Jupiter;

  const beejaMantra = baseLang === "kn"
    ? theme.beejaMantraKn
    : baseLang === "hi"
    ? theme.beejaMantraHi
    : baseLang === "te"
    ? theme.beejaMantraTe
    : baseLang === "ta"
    ? theme.beejaMantraTa
    : theme.beejaMantraEn;

  const dashaLordDisplayName = baseLang === "kn"
    ? theme.kannadaName
    : baseLang === "hi"
    ? theme.hindiName
    : baseLang === "te"
    ? theme.teluguName
    : baseLang === "ta"
    ? theme.tamilName
    : theme.englishName;

  const dashaLordShortName = baseLang === "kn"
    ? theme.shortNameKn
    : baseLang === "hi"
    ? theme.shortNameHi
    : baseLang === "te"
    ? theme.shortNameTe
    : baseLang === "ta"
    ? theme.shortNameTa
    : theme.shortNameEn;

  const divineArchetype = baseLang === "kn"
    ? theme.divineArchetypeKn
    : baseLang === "hi"
    ? theme.divineArchetypeHi
    : baseLang === "te"
    ? theme.divineArchetypeTe
    : baseLang === "ta"
    ? theme.divineArchetypeTa
    : theme.divineArchetypeEn;

  const authenticLagnaElement = getLagnaElement(lagnaIndex, baseLang);

  // Calculate live Gochara houses relative to devotee's Moon
  // Transit Jupiter currently in Taurus (Index 1) or Gemini (Index 2)
  // Transit Saturn currently in Aquarius (Index 10) or Pisces (Index 11)
  const normMoonIdx = ((moonIndex % 12) + 12) % 12;
  const jupiterTransitHouse = ((1 - normMoonIdx + 12) % 12) + 1;
  const saturnTransitHouse = ((10 - normMoonIdx + 12) % 12) + 1;

  // Font family with complete Unicode Indic shaping
  const indicFontFamily = baseLang === "kn"
    ? "'Noto Serif Kannada', 'Noto Sans Kannada', serif"
    : baseLang === "hi"
    ? "'Noto Sans Devanagari', 'Noto Serif Devanagari', serif"
    : baseLang === "te"
    ? "'Noto Sans Telugu', serif"
    : baseLang === "ta"
    ? "'Noto Sans Tamil', serif"
    : "'Outfit', 'Cinzel', sans-serif";

  return (
    <div
      style={{
        fontFamily: indicFontFamily,
        letterSpacing: "normal"
      }}
      className="w-full rounded-2xl border-2 border-amber-700/50 bg-gradient-to-b from-amber-50 via-amber-100/40 to-amber-50 p-6 md:p-8 shadow-md relative overflow-hidden"
    >
      {/* Decorative Golden Corner Accents */}
      <div className="absolute top-2 left-2 text-amber-700 text-lg opacity-40 select-none">❖</div>
      <div className="absolute top-2 right-2 text-amber-700 text-lg opacity-40 select-none">❖</div>
      <div className="absolute bottom-2 left-2 text-amber-700 text-lg opacity-40 select-none">❖</div>
      <div className="absolute bottom-2 right-2 text-amber-700 text-lg opacity-40 select-none">❖</div>

      {/* Header Banner */}
      <div className="text-center pb-5 mb-5 border-b border-amber-700/30">
        <div
          style={{ letterSpacing: "normal" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-800/10 border border-amber-700/30 text-amber-950 text-sm font-bold mb-2"
        >
          <span>✧</span>
          <span>
            {baseLang === "kn"
              ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ & ಪ್ರಸ್ತುತ ಗ್ರಹ ಬಲದ ದರ್ಶನ"
              : baseLang === "hi"
              ? "जन्म कुंडली एवं वर्तमान ग्रह शक्ति दर्शन"
              : baseLang === "te"
              ? "జన్మ కుండలి & ప్రస్తుత గ్రహ శక్తి దర్శనం"
              : baseLang === "ta"
              ? "ஜென்ம ஜாதகம் & தற்போதைய கிரக பல தரிசனம்"
              : "Janma Kundali & Active Planetary Energy"}
          </span>
          <span>✧</span>
        </div>
        <h3
          style={{ letterSpacing: "normal" }}
          className="text-2xl md:text-3xl font-extrabold text-amber-950 leading-relaxed"
        >
          {baseLang === "kn"
            ? `ಪ್ರಸ್ತುತ ನಿಮ್ಮನ್ನು ಮುನ್ನಡೆಸುತ್ತಿರುವ ಪ್ರಧಾನ ಗ್ರಹ: ${dashaLordDisplayName}`
            : baseLang === "hi"
            ? `वर्तमान में आपको संचालित करने वाले प्रमुख ग्रह: ${dashaLordDisplayName}`
            : baseLang === "te"
            ? `ప్రస్తుతం మిమ్మల్ని నడిపిస్తున్న ప్రధాన గ్రహం: ${dashaLordDisplayName}`
            : baseLang === "ta"
            ? `தற்போது உங்களை வழிநடத்தும் முதன்மை கிரகம்: ${dashaLordDisplayName}`
            : `Your Active Ruling Mahadasha Lord: ${dashaLordDisplayName}`}
        </h3>
        <p
          style={{ letterSpacing: "normal" }}
          className="text-base font-semibold text-amber-800 mt-1 leading-normal"
        >
          {divineArchetype}
        </p>
      </div>

      {/* Visual Significance & Purpose Explanation Card */}
      <div className="bg-white/85 border border-amber-700/30 rounded-xl p-4 md:p-5 mb-6 shadow-sm text-left">
        <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-sm md:text-base border-b border-amber-600/20 pb-1.5">
          <span>✦</span>
          <span>
            {baseLang === "kn"
              ? "ಈ ವಿಭಾಗ ಹಾಗೂ ಚಿತ್ರದ ಮಹತ್ವ (Significance of this Section)"
              : baseLang === "hi"
              ? "इस अनुभाग एवं दिव्य मंडल का महत्व (Significance of this Section)"
              : baseLang === "te"
              ? "ఈ విభాగం మరియు దివ్య చిత్రం యొక్క ప్రాముఖ్యత (Significance of this Section)"
              : baseLang === "ta"
              ? "இப்பகுதி மற்றும் தெய்வீகப் படத்தின் முக்கியத்துவம் (Significance of this Section)"
              : "Significance of this Section & Celestial Mandala"}
          </span>
        </div>
        <p className="text-xs md:text-sm text-amber-950/90 leading-relaxed font-medium">
          {baseLang === "kn"
            ? "ಪ್ರತಿಯೊಬ್ಬರ ಜೀವನದಲ್ಲೂ ಜನ್ಮ ಲಗ್ನ ಮತ್ತು ಚಂದ್ರ ರಾಶಿಯ ಜೊತೆಗೆ, ಪ್ರಸ್ತುತ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಒಬ್ಬ ಪ್ರಮುಖ ಗ್ರಹವು ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಜೀವನವನ್ನು (ಆರೋಗ್ಯ, ವೃತ್ತಿ, ಬುದ್ಧಿ ಮತ್ತು ಮನಸ್ಸು) ಮುನ್ನಡೆಸುತ್ತಿರುತ್ತದೆ. ಇದನ್ನೇ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ 'ಮಹಾದಶಾಧಿಪತಿ' ಎನ್ನಲಾಗುತ್ತದೆ. ಮೇಲಿನ ದೈವಿಕ ಮಂಡಲ ಚಿತ್ರದಲ್ಲಿ, ನಿಮ್ಮನ್ನು ಪ್ರಸ್ತುತ ರಕ್ಷಿಸಿ ಮುನ್ನಡೆಸುತ್ತಿರುವ ಪ್ರಧಾನ ಗ್ರಹವನ್ನು ಕೇಂದ್ರದಲ್ಲೂ, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ ಹಾಗೂ ರಾಶಿಯ ಶಕ್ತಿಗಳನ್ನು ಸುತ್ತಲೂ ಚಿತ್ರಿಸಲಾಗಿದೆ. ಈ ಗ್ರಹದ ಮಂತ್ರ ಮತ್ತು ಸತ್ಕರ್ಮಗಳನ್ನು ಅನುಸರಿಸುವುದರಿಂದ ದೋಷಗಳು ದೂರವಾಗಿ, ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಕಾಲವು ಸದಾ ಶುಭದಾಯಕವೂ ಸುರಕ್ಷಿತವೂ ಆಗಿರುತ್ತದೆ."
            : baseLang === "hi"
            ? "वैदिक ज्योतिष में जन्म लग्न और चंद्र राशि के साथ-साथ, वर्तमान जीवन काल को एक प्रमुख ग्रह संचालित करता है जिसे 'महादशाधिपति' कहा जाता है। ऊपर दिए गए दिव्य चित्र में आपके वर्तमान मार्गदर्शक ग्रह को केंद्र में तथा आपके लग्न व राशि की शक्तियों को चारों ओर दर्शाया गया है। इस ग्रह के बीज मंत्र का स्मरण एवं सत्कर्म आपके जीवन के समस्त कष्टों को दूर कर सर्वत्र रक्षा प्रदान करते हैं।"
            : baseLang === "te"
            ? "వైదిక జ్యోతిషంలో జన్మ లగ్నం మరియు చంద్ర రాశితో పాటు, ప్రస్తుత మీ జీవిత కాలాన్ని ఒక ప్రధాన గ్రహం నడిపిస్తుంది, దీనినే 'మహాదశాధిపతి' అంటారు. పై దివ్య చిత్రంలో మీ ప్రస్తుత మార్గదర్శక గ్రహాన్ని మధ్యలోను, మీ లగ్న మరియు రాశి శక్తులను చుట్టూ దర్శింపజేయబడింది. ఈ గ్రహ మంత్ర జపం మరియు సత్కర్మల ద్వారా దోషాలు తొలగి, జీవితంలో సంపూర్ణ రక్షణ మరియు శుభ ఫలితాలు లభిస్తాయి."
            : baseLang === "ta"
            ? "வேத ஜோதிடத்தில் உங்கள் ஜென்ம லக்னம் மற்றும் சந்திர ராசியுடன், உங்கள் தற்போதைய வாழ்க்கைப் பாதையை இயக்கும் முதன்மை கிரகம் 'மகாதிசா நாதர்' ஆவார். மேலே உள்ள தெய்வீகப் படத்தில் உங்களை வழிநடத்தும் தலைமை கிரகம் மையத்திலும், உங்கள் லக்னம் மற்றும் ராசியின் ஆற்றல்கள் சுற்றிலும் சித்தரிக்கப்பட்டுள்ளன. இந்த கிரகத்தின் மூல மந்திரத்தை உச்சரித்து நற்செயல்களைச் செய்வதன் மூலம் தடைகள் நீங்கி, வாழ்வில் தெய்வீகப் பாதுகாப்பு நிலைத்திருக்கும்."
            : "In Vedic astrology, beyond your birth ascendant and moon sign, your current life phase is directly governed and steered by a primary planetary ruler known as the Mahadasha Lord. The celestial mandala visual above reveals your active ruling planet at the core, enveloped by your natal ascendant (Lagna) and emotional core (Moon). Honoring this governing planet through its sacred Beeja Mantra and dharmic conduct dissipates afflictions and sustains lifelong protection."}
        </p>
      </div>

      {/* Central Astral Mandala Visual (High-DPI SVG with Golden Vectors) */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-72 h-72 md:w-88 md:h-88 flex items-center justify-center">
          {/* Subtle Ambient Glow Behind Mandala */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-50 pointer-events-none"
            style={{ backgroundColor: theme.glowColor }}
          />

          <svg
            className="w-full h-full relative z-10 drop-shadow-xl"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="celestialSpaceVoid" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.9" />
                <stop offset="55%" stopColor="#0F172A" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#020617" stopOpacity="1" />
              </radialGradient>
              <radialGradient id="celestialAtmosphereGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={theme.glowColor} stopOpacity="0.45" />
                <stop offset="65%" stopColor={theme.primaryColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="goldOrbitBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>

            {/* Deep Cosmic Aperture Portal (Sauramandala Celestial Space) */}
            <circle cx="200" cy="200" r="185" fill="url(#celestialSpaceVoid)" stroke="url(#goldOrbitBorder)" strokeWidth="2.5" />
            <circle cx="200" cy="200" r="185" fill="url(#celestialAtmosphereGlow)" />

            {/* Subtle Starfield & Celestial Dust */}
            <circle cx="95" cy="85" r="1.2" fill="#FFFFFF" opacity="0.8" />
            <circle cx="310" cy="90" r="1.5" fill="#FEF08A" opacity="0.85" />
            <circle cx="70" cy="210" r="1" fill="#FFFFFF" opacity="0.6" />
            <circle cx="330" cy="230" r="1.3" fill="#BAE6FD" opacity="0.75" />
            <circle cx="110" cy="300" r="1.2" fill="#FFFFFF" opacity="0.65" />
            <circle cx="290" cy="310" r="1" fill="#FEF08A" opacity="0.7" />
            <circle cx="160" cy="60" r="0.8" fill="#FFFFFF" opacity="0.5" />
            <circle cx="240" cy="55" r="1" fill="#FFFFFF" opacity="0.6" />
            <circle cx="150" cy="340" r="0.9" fill="#FFFFFF" opacity="0.5" />
            <circle cx="250" cy="345" r="1.2" fill="#BAE6FD" opacity="0.7" />

            {/* Elegant Outer Orbit Guide */}
            <circle cx="200" cy="200" r="172" fill="none" stroke="#D97706" strokeWidth="1" strokeDasharray="4,4" opacity="0.45" />

            {/* 3D Atmospheric Planet Visual (Sauramandala Style, Scaled & Centered, Zero Mandala Geometry) */}
            <g transform="translate(200, 200) scale(1.65) translate(-200, -200)">
              {renderAtmosphericPlanet(effectiveMahaKey, theme, dashaLordShortName, indicFontFamily)}
            </g>
          </svg>
        </div>

        {/* Sacred Beeja Mantra Shloka Banner */}
        <div
          style={{ letterSpacing: "normal" }}
          className="mt-4 px-6 py-2.5 rounded-full bg-amber-900/10 border border-amber-800/30 text-center"
        >
          <p
            style={{
              fontFamily: indicFontFamily,
              letterSpacing: "normal"
            }}
            className="text-xl md:text-2xl font-bold text-amber-950 leading-relaxed"
          >
            {beejaMantra}
          </p>
        </div>
      </div>

      {/* 4 Indic Sacred Cosmic Alignment Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Badge 1: Lagna Guardian & Element */}
        <div className="bg-white/85 border border-amber-800/20 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center shrink-0 text-xl">
            🛡️
          </div>
          <div style={{ letterSpacing: "normal" }}>
            <span
              style={{ letterSpacing: "normal" }}
              className="text-xs font-bold text-amber-800 block"
            >
              {baseLang === "kn"
                ? "೧. ಜನ್ಮ ಲಗ್ನ ಚೈತನ್ಯ ಕವಚ"
                : baseLang === "hi"
                ? "१. जन्म लग्न चैतन्य कवच"
                : baseLang === "te"
                ? "1. జన్మ లగ్న చైతన్య కవచం"
                : baseLang === "ta"
                ? "1. ஜென்ம லக்ன ஜீவக் கவசம்"
                : "1. Natal Ascendant Cosmic Shield"}
            </span>
            <p
              style={{ letterSpacing: "normal" }}
              className="text-base font-extrabold text-amber-950 leading-normal mt-0.5"
            >
              {lagnaName} • {authenticLagnaElement}
              {lagnaLordName ? ` (${baseLang === "kn" ? "ಲಗ್ನಾಧಿಪತಿ: " : baseLang === "hi" ? "लग्नेश: " : baseLang === "te" ? "లగ్నాధిపతి: " : baseLang === "ta" ? "லக்னாதிபதி: " : "Lord: "}${lagnaLordName})` : ""}
            </p>
            <p
              style={{ letterSpacing: "normal" }}
              className="text-xs text-amber-900/80 mt-1 leading-relaxed"
            >
              {baseLang === "kn"
                ? "ದೈಹಿಕ ರಕ್ಷಾ ಕವಚ ಹಾಗೂ ನೈಸರ್ಗಿಕ ರೋಗನಿರೋಧಕ ಸಾಮರ್ಥ್ಯವನ್ನು ಸದಾ ರಕ್ಷಿಸುತ್ತದೆ."
                : baseLang === "hi"
                ? "प्राकृतिक शारीरिक प्रतिरोधक क्षमता एवं जीवनी शक्ति का संवर्धन करता है।"
                : baseLang === "te"
                ? "శారీరక రక్షా కవచం మరియు సహజ రోగనిరోధక శక్తిని నిరంతరం కాపాడుతుంది."
                : baseLang === "ta"
                ? "உடலின் நோய் எதிர்ப்புச் சக்தியையும் ஆயுள் பலத்தையும் எப்போதும் பாதுகாக்கிறது."
                : "Anchors physiological immunity, vital resistance and foundational life stamina."}
            </p>
          </div>
        </div>

        {/* Badge 2: Moon Sign & Nakshatra */}
        <div className="bg-white/85 border border-amber-800/20 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center shrink-0 text-xl">
            🌙
          </div>
          <div style={{ letterSpacing: "normal" }}>
            <span
              style={{ letterSpacing: "normal" }}
              className="text-xs font-bold text-amber-800 block"
            >
              {baseLang === "kn"
                ? "೨. ಚಂದ್ರ ರಾಶಿ & ನಕ್ಷತ್ರ ಚೇತನ"
                : baseLang === "hi"
                ? "२. चंद्र राशि एवं नक्षत्र चेतना"
                : baseLang === "te"
                ? "2. చంద్ర రాశి మరియు నక్షత్ర చేతన"
                : baseLang === "ta"
                ? "2. சந்திர ராசி & நட்சத்திர ஜீவன்"
                : "2. Lunar Consciousness & Nakshatra"}
            </span>
            <p
              style={{ letterSpacing: "normal" }}
              className="text-base font-extrabold text-amber-950 leading-normal mt-0.5"
            >
              {moonName} • {nakshatraName}{pada ? ` (${baseLang === "kn" ? "ಪಾದ " : baseLang === "hi" ? "चरण " : baseLang === "te" ? "పాదం " : baseLang === "ta" ? "பாதம் " : "Pada "}${pada})` : ""}
            </p>
            <p
              style={{ letterSpacing: "normal" }}
              className="text-xs text-amber-900/80 mt-1 leading-relaxed"
            >
              {baseLang === "kn"
                ? "ಮಾನಸಿಕ ಧೈರ್ಯ, ಅಂತಃಪ್ರಜ್ಞೆ ಹಾಗೂ ಭಾವನಾತ್ಮಕ ಸಮತೋಲನದ ದಿವ್ಯ ಆಧಾರ."
                : baseLang === "hi"
                ? "मानसिक संतुलन, अंतर्ज्ञान एवं भावनात्मक स्थिरता का पवित्र आधार।"
                : baseLang === "te"
                ? "మానసిక స్థైర్యం, అంతర్ దృష్టి మరియు భావోద్వేగ సమతుల్యతకు మూలస్తంభం."
                : baseLang === "ta"
                ? "மன அமைதி, உள்ளுணர்வு மற்றும் உணர்ச்சி சமநிலையின் புனித அடித்தளம்."
                : "Harmonizes emotional equanimity, psychological depth and intuitive clarity."}
            </p>
          </div>
        </div>

        {/* Badge 3: Running Dasha-Bhukti */}
        <div className="bg-white/85 border border-amber-800/20 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center shrink-0 text-xl">
            ☸
          </div>
          <div style={{ letterSpacing: "normal" }}>
            <span
              style={{ letterSpacing: "normal" }}
              className="text-xs font-bold text-amber-800 block"
            >
              {baseLang === "kn"
                ? "೩. ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ದೈವಿಕ ಸಂಕೇತ"
                : baseLang === "hi"
                ? "३. वर्तमान दशा-भुक्ति दैवीय संकेत"
                : baseLang === "te"
                ? "3. ప్రస్తుత దశా-భుక్తి దైవిక సంకేతం"
                : baseLang === "ta"
                ? "3. தற்போதைய தசா-புக்தி வழிகாட்டி"
                : "3. Active Dasha-Bhukti Cosmic Vector"}
            </span>
            <p
              style={{ letterSpacing: "normal" }}
              className="text-base font-extrabold text-amber-950 leading-normal mt-0.5"
            >
              {baseLang === "kn"
                ? `${mahaLord} ಮಹಾದಶಾ / ${bhuktiLord} ಭುಕ್ತಿ`
                : baseLang === "hi"
                ? `${mahaLord} महादशा / ${bhuktiLord} भुक्ति`
                : baseLang === "te"
                ? `${mahaLord} మహాదశ / ${bhuktiLord} భుక్తి`
                : baseLang === "ta"
                ? `${mahaLord} மகாதிசை / ${bhuktiLord} புக்தி`
                : `${mahaLord} Mahadasha / ${bhuktiLord} Bhukti`}
            </p>
            <p
              style={{ letterSpacing: "normal" }}
              className="text-xs text-amber-900/80 mt-1 leading-relaxed"
            >
              {baseLang === "kn"
                ? `${dashaLordDisplayName} ಅಧಿಪತ್ಯದಲ್ಲಿ ಕರ್ಮದ ಪ್ರಮುಖ ತಿರುವು ಮತ್ತು ಹೊಸ ಅವಕಾಶಗಳ ಪ್ರಾಪ್ತಿ.`
                : baseLang === "hi"
                ? `${dashaLordDisplayName} के आधिपत्य में कर्म की नई दिशा एवं सुअवसरों का मार्ग प्रशस्त।`
                : baseLang === "te"
                ? `${dashaLordDisplayName} ఆధిపత్యంలో కర్మ యొక్క ముఖ్యమైన మలుపు మరియు అవకాశాల ప్రాప్తి.`
                : baseLang === "ta"
                ? `${dashaLordDisplayName} ஆதிக்கத்தில் வாழ்வின் முக்கிய திருப்பங்களும் புதிய வாய்ப்புகளும் கூடிவரும்.`
                : `Governed by ${dashaLordDisplayName}, unlocking major karmic milestones.`}
            </p>
          </div>
        </div>

        {/* Badge 4: Gochara Transit Alignment */}
        <div className="bg-white/85 border border-amber-800/20 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center shrink-0 text-xl">
            ✨
          </div>
          <div style={{ letterSpacing: "normal" }}>
            <span
              style={{ letterSpacing: "normal" }}
              className="text-xs font-bold text-amber-800 block"
            >
              {baseLang === "kn"
                ? "೪. ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರ ಅನುಗ್ರಹ"
                : baseLang === "hi"
                ? "४. गोचर ग्रह संचरण अनुग्रह"
                : baseLang === "te"
                ? "4. గోచార గ్రహ సంచార అనుగ్రహం"
                : baseLang === "ta"
                ? "4. கோசார கிரக சஞ்சார அருள்"
                : "4. Auspicious Transit Protective Alignment"}
            </span>
            <p
              style={{ letterSpacing: "normal" }}
              className="text-base font-extrabold text-amber-950 leading-normal mt-0.5"
            >
              {baseLang === "kn"
                ? `ಗೋಚಾರ ಗುರು: ${jupiterTransitHouse}ನೇ ಭಾವ • ಗೋಚಾರ ಶನಿ: ${saturnTransitHouse}ನೇ ಭಾವ`
                : baseLang === "hi"
                ? `गोचर गुरु: ${jupiterTransitHouse}वां भाव • गोचर शनि: ${saturnTransitHouse}वां भाव`
                : baseLang === "te"
                ? `గోచార గురుడు: ${jupiterTransitHouse}వ భావం • గోచార శని: ${saturnTransitHouse}వ భావం`
                : baseLang === "ta"
                ? `கோசார குரு: ${jupiterTransitHouse}-ம் பாவம் • கோசார சனி: ${saturnTransitHouse}-ம் பாவம்`
                : `Transit Jupiter: ${jupiterTransitHouse}th House • Transit Saturn: ${saturnTransitHouse}th House`}
            </p>
            <p
              style={{ letterSpacing: "normal" }}
              className="text-xs text-amber-900/80 mt-1 leading-relaxed"
            >
              {baseLang === "kn"
                ? "ಕಂಟಕ ನಿವಾರಣೆ, ಶಾಂತಿ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮುಖ್ಯಪ್ರಾಣ ದೇವರ ಸದಾ ಜಾಗೃತ ರಕ್ಷೆ."
                : baseLang === "hi"
                ? "कंटक निवारण, सुख-शांति एवं श्री क्षेत्र गोकर्ण की सतत सुरक्षा।"
                : baseLang === "te"
                ? "కష్ట నివారణ, శాంతి మరియు శ్రీ క్షేత్ర గోకర్ణ ముఖ్యప్రాణ దేవుని నిరంతర రక్షణ."
                : baseLang === "ta"
                ? "துன்பங்கள் நீங்கி, அமைதியும் ஸ்ரீ கோகர்ண ஆஞ்சநேயரின் நிரந்தர பாதுகாப்பும் கிடைக்கும்."
                : "Deflects obstacles, bestowing peace and divine sanctuary."}
            </p>
          </div>
        </div>
      </div>

      {/* Divine Upasana Blessing Note */}
      <div
        style={{ letterSpacing: "normal" }}
        className="mt-5 p-4 rounded-xl bg-amber-900/10 border border-amber-800/20 text-center"
      >
        <p
          style={{
            fontFamily: indicFontFamily,
            letterSpacing: "normal"
          }}
          className="text-sm md:text-base font-bold text-amber-950 leading-relaxed"
        >
          {baseLang === "kn"
            ? "॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಹಾಗೂ ಮುಖ್ಯಪ್ರಾಣ ದೇವರ ಸದಾ ಜಾಗೃತ ಕೃಪಾಕಟಾಕ್ಷವು ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸಿ, ಪ್ರಸ್ತುತ ದಶಾ ಕಾಲದಲ್ಲಿ ಸಕಲ ಸನ್ಮಂಗಳಗಳನ್ನು ಕರುಣಿಸಲಿ ॥"
            : baseLang === "hi"
            ? "॥ श्री क्षेत्र गोकर्ण के महाबलेश्वर एवं मुख्यप्राण भगवान की कृपा आपके समस्त ग्रह दोषों को शांत कर जीवन में सुख, शांति एवं विजय प्रदान करे ॥"
            : baseLang === "te"
            ? "॥ శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర మరియు ముఖ్యప్రాణ దేవుని కృపాకటాక్షం మీ జన్మ కుండలిలోని సమస్త దోషాలను తొలగించి, సర్వ శుభాలను ప్రసాదించుగాక ॥"
            : baseLang === "ta"
            ? "॥ ஸ்ரீ க்ஷேத்திர கோகர்ண மஹாபலேஸ்வரர் மற்றும் முக்கியப்ராண தேவரின் தெய்வீக அருள் உங்கள் ஜாதக தோஷங்களை நீக்கி, இந்த தசா காலத்தில் சகல மங்களங்களையும் தந்தருளட்டும் ॥"
            : "May the divine grace of Lord Mahabaleshwara and Mukhyaprana of Sri Kshetra Gokarna pacify all planetary afflictions and illuminate your path with triumph and peace."}
        </p>
      </div>
    </div>
  );
};
