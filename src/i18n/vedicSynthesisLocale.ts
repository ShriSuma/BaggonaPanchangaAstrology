export type SupportedLocale = "kn" | "en" | "te" | "ta" | "hi";

export interface VedicSynthesisDictionary {
  title: string;
  subtitle: string;
  stellarMatrixTitle: string;
  bhavaMatrixTitle: string;
  amshaMatrixTitle: string;
  maandiTitle: string;
  phalitSutrasTitle: string;
  nadiKarmaTitle: string;
  jaiminiTitle: string;
  lalKitabTitle: string;
  medicalPalmistryTitle: string;
  vastuTitle: string;
  rule1Label: string;
  rule2Label: string;
  rule3Label: string;
  rule4Label: string;
  activeStatus: string;
  latentStatus: string;
  redirectedStatus: string;
  paradoxicalStatus: string;
  synergisticStatus: string;
  subLordLabel: string;
  nakshatraLordLabel: string;
  rashmiLabel: string;
  amshaLabel: string;
  gunaLabel: string;
  tatvaLabel: string;
  ganaLabel: string;
  nadiLabel: string;
  deityLabel: string;
  organLabel: string;
  pariharaLabel: string;
  totkeLabel: string;
}

export const VEDIC_SYNTHESIS_I18N: Record<SupportedLocale, VedicSynthesisDictionary> = {
  kn: {
    title: "ನಕ್ಷತ್ರ-ಗ್ರಹ-ಭಾವ ಸಂಶ್ಲೇಷಣಾ ಎಂಜಿನ್",
    subtitle: "ವೈದಿಕ ಕಾಸ್ಮೋಮೆಟ್ರಿ, ಕೆ.ಪಿ ಸಬ್-ಲಾರ್ಡ್, ಅಂಶ ಕೋಷ್ಟಕ ಹಾಗೂ ಫಲಿತ ಸೂತ್ರಗಳ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆ",
    stellarMatrixTitle: "ಗ್ರಹ-ನಕ್ಷತ್ರ ರಶ್ಮಿ ಕೋಷ್ಟಕ",
    bhavaMatrixTitle: "ದ್ವಾದಶ ಭಾವ ಹಾಗೂ ವಾಸ್ತು ಸಂಶ್ಲೇಷಣೆ",
    amshaMatrixTitle: "ನವಾಂಶ-ಸಪ್ತಾಂಶ-ದಶಾಂಶ (D-1, D-9, D-7, D-10) ಅಂಶಗಳು",
    maandiTitle: "ಮಾಂದಿ / ಗುಳಿಕ ಭಾವ ಪ್ರಭಾವ ಹಾಗೂ ಪರಿಹಾರ",
    phalitSutrasTitle: "ಫಲಿತ ಸೂತ್ರ ತರ್ಕ (Phalit Sutra Logic Gates)",
    nadiKarmaTitle: "ಭೃಗು ನಂದಿ ನಾಡಿ - ಪೂರ್ವಜನ್ಮ ಸಂಚಿತ ಕರ್ಮ",
    jaiminiTitle: "ಜೈಮಿನಿ ಆರೂಢ ಪದ್ಧತಿ ಹಾಗೂ ಚರ ಕಾರಕಗಳು",
    lalKitabTitle: "ಲಾಲ್ ಕಿತಾಬ್ ಪಿತೃ ದೋಷ ಹಾಗೂ ವಿಶೇಷ ತೋಟ್ಕೆಗಳು",
    medicalPalmistryTitle: "ವೈದ್ಯಕೀಯ ಜ್ಯೋತಿಷ್ಯ ಹಾಗೂ ಹಸ್ತ ಸಾಮುದ್ರಿಕ ಮುದ್ರೆ",
    vastuTitle: "ಭಾವ-ವಾಸ್ತು ದಿಕ್ಕುಗಳ ಜೋಡಣೆ",
    rule1Label: "ಸೂತ್ರ ೧ (ಗ್ರಹ ಬಲ / ರಶ್ಮಿ ಪ್ರಮಾಣ)",
    rule2Label: "ಸೂತ್ರ ೨ (ಭಾವ ಬಲ ಮರುನಿರ್ದೇಶನ)",
    rule3Label: "ಸೂತ್ರ ೩ (ನಕ್ಷತ್ರಾಧಿಪತಿ vs ಗ್ರಹ ಸ್ವಭಾವ)",
    rule4Label: "ಸೂತ್ರ ೪ (ದಶಾಧಿಪತಿ ಈಡೇರಿಕೆ - TRUE / NULL)",
    activeStatus: "ಸಕ್ರಿಯ ಫಲ (Active / Manifest)",
    latentStatus: "ವಿಳಂಬಿತ / ಸುಪ್ತ ಫಲ (Latent / Delayed)",
    redirectedStatus: "ಮರುನಿರ್ದೇಶಿತ ಫಲ (Redirected)",
    paradoxicalStatus: "ವಿರೋಧಾಭಾಸ ಫಲ (Paradoxical)",
    synergisticStatus: "ಪೂರಕ ಉನ್ನತ ಫಲ (Synergistic)",
    subLordLabel: "ಕೆ.ಪಿ ಉಪಾಧಿಪತಿ (Sub-Lord)",
    nakshatraLordLabel: "ನಕ್ಷತ್ರಾಧಿಪತಿ",
    rashmiLabel: "ಗ್ರಹ ರಶ್ಮಿ",
    amshaLabel: "ಅಂಶ",
    gunaLabel: "ಗುಣ",
    tatvaLabel: "ತತ್ವ",
    ganaLabel: "ಗಣ",
    nadiLabel: "ನಾಡಿ",
    deityLabel: "ದೇವತೆ",
    organLabel: "ಶಾರೀರಿಕ ಅಂಗ",
    pariharaLabel: "ಶಾಂತಿ ಪರಿಹಾರ",
    totkeLabel: "ಲಾಲ್ ಕಿತಾಬ್ ತೋಟ್ಕೆ"
  },
  en: {
    title: "Nakshatra, Graha & Bhava Synthesis Engine",
    subtitle: "Vedic Cosmometry, KP Sub-Lord, Multi-Amsha (D-1/D-9/D-7/D-10) and Phalit Sutra Synthesis",
    stellarMatrixTitle: "Stellar & Planetary Rashmi Matrix",
    bhavaMatrixTitle: "12 Bhavas & Vastu Spatial Synthesis",
    amshaMatrixTitle: "Sub-Divisional Amsha Matrix (D-1, D-9, D-7, D-10)",
    maandiTitle: "Maandi (Gulika) House Diagnostics & Shanti",
    phalitSutrasTitle: "Phalit Sutra Validation Logic Gates",
    nadiKarmaTitle: "Bhrigu Nandi Nadi - Past Life & Pending Karma",
    jaiminiTitle: "Jaimini Arudha System & Chara Karakas",
    lalKitabTitle: "Lal Kitab Pitra Dosha & Curative Totke",
    medicalPalmistryTitle: "Medical Astrology & Palmistry Hardware Check",
    vastuTitle: "Bhava & Vastu Directional Correlation",
    rule1Label: "Rule 1 (Grah Bal / Latency Check)",
    rule2Label: "Rule 2 (Bhav Bal Redirection)",
    rule3Label: "Rule 3 (Nakshatra Lord Contradiction)",
    rule4Label: "Rule 4 (Dasa Activation Gate - TRUE / NULL)",
    activeStatus: "Active / Manifest",
    latentStatus: "Latent / Delayed",
    redirectedStatus: "Redirected",
    paradoxicalStatus: "Paradoxical Synthesis",
    synergisticStatus: "Synergistic Amplification",
    subLordLabel: "KP Sub-Lord",
    nakshatraLordLabel: "Nakshatra Lord",
    rashmiLabel: "Planetary Rays (Rashmi)",
    amshaLabel: "Amsha",
    gunaLabel: "Guna",
    tatvaLabel: "Tatva",
    ganaLabel: "Gana",
    nadiLabel: "Nadi",
    deityLabel: "Deity",
    organLabel: "Physiological Organ",
    pariharaLabel: "Vedic Shanti Remedy",
    totkeLabel: "Lal Kitab Totke"
  },
  te: {
    title: "నక్షత్ర, గ్రహ & భావ సంశ్లేషణ ఇంజిన్",
    subtitle: "వైదిక కాస్మోమెట్రీ, కే.పి సబ్-లార్డ్, అంశ పట్టిక మరియు ఫలిత సూత్రాల సంపూర్ణ విశ్లేషణ",
    stellarMatrixTitle: "గ్రహ-నక్షత్ర రశ్మి పట్టిక",
    bhavaMatrixTitle: "ద్వాదశ భావాలు & వాస్తు సంశ్లేషణ",
    amshaMatrixTitle: "నవాంశ-సప్తాంశ-దశాంశ (D-1, D-9, D-7, D-10) అంశాలు",
    maandiTitle: "మాంది భావ ప్రభావం మరియు శాంతి పరిహారాలు",
    phalitSutrasTitle: "ఫలిత సూత్ర తర్కం (Phalit Sutra Logic)",
    nadiKarmaTitle: "భృగు నంది నాడీ - పూర్వజన్మ సంచిత కర్మ",
    jaiminiTitle: "జైమిని ఆరూఢ పద్ధతి & చర కారకాలు",
    lalKitabTitle: "లాల్ కితాబ్ పితృ దోషం మరియు తోట్కేలు",
    medicalPalmistryTitle: "వైద్య జ్యోతిష్యం & సాముద్రిక ముద్రలు",
    vastuTitle: "భావ-వాస్తు దిశల అమరిక",
    rule1Label: "సూత్రం 1 (గ్రహ బల / రశ్మి ప్రమాణం)",
    rule2Label: "సూత్రం 2 (భావ బల పునర్నిర్దేశం)",
    rule3Label: "సూత్రం 3 (నక్షత్రాధిపతి vs గ్రహ స్వభావం)",
    rule4Label: "సూత్రం 4 (దశాధిపతి ఫలితం - TRUE / NULL)",
    activeStatus: "సక్రియ ఫలితం (Active)",
    latentStatus: "జాప్య ఫలితం (Delayed)",
    redirectedStatus: "మళ్ళించబడిన ఫలితం (Redirected)",
    paradoxicalStatus: "వైరుధ్య ఫలితం (Paradoxical)",
    synergisticStatus: "ఉన్నత ఫలితం (Synergistic)",
    subLordLabel: "కే.పి సబ్-లార్డ్",
    nakshatraLordLabel: "నక్షత్రాధిపతి",
    rashmiLabel: "గ్రహ రశ్మి",
    amshaLabel: "అంశ",
    gunaLabel: "గుణం",
    tatvaLabel: "తత్త్వం",
    ganaLabel: "గణం",
    nadiLabel: "నాడీ",
    deityLabel: "దేవత",
    organLabel: "శరీర భాగం",
    pariharaLabel: "శాంతి పరిహారం",
    totkeLabel: "తోట్కే పరిహారం"
  },
  ta: {
    title: "நட்சத்திர, கிரக & பாவ தொகுப்பு இயந்திரம்",
    subtitle: "வேத ஜோதிட சமன்பாடுகள், கே.பி சப்-லார்டு, அம்சம் மற்றும் பலித சூத்திர ஆய்வு",
    stellarMatrixTitle: "கிரக-நட்சத்திர ரஷ்மி அட்டவணை",
    bhavaMatrixTitle: "12 பாவங்கள் & வாஸ்து இணைப்பு",
    amshaMatrixTitle: "நவாம்சம்-சப்தாம்சம்-தசாம்சம் (D-1, D-9, D-7, D-10) அம்சங்கள்",
    maandiTitle: "மாந்தி பாவ பலன்கள் மற்றும் சாந்தி பரிகாரங்கள்",
    phalitSutrasTitle: "பலித சூத்திர விதிகள் (Phalit Sutras)",
    nadiKarmaTitle: "பிருகு நந்தி நாடி - முற்பிறவி கர்ம வினைகள்",
    jaiminiTitle: "ஜைமினி ஆருட முறை & சர காரகங்கள்",
    lalKitabTitle: "லால் கிதாப் பித்ரு தோஷம் & பரிகாரங்கள்",
    medicalPalmistryTitle: "மருத்துவ ஜோதிடம் & கைரேகை அடையாளங்கள்",
    vastuTitle: "பாவ-வாஸ்து திசை தொடர்பு",
    rule1Label: "விதி 1 (கிரக பலம் / ரஷ்மி)",
    rule2Label: "விதி 2 (பாவ பல மாற்றம்)",
    rule3Label: "விதி 3 (நட்சத்திராதிபதி vs கிரக குணம்)",
    rule4Label: "விதி 4 (தசாதிபதி பலன் - TRUE / NULL)",
    activeStatus: "நேரடி பலன் (Active)",
    latentStatus: "தாமத பலன் (Delayed)",
    redirectedStatus: "மாற்றப்பட்ட பலன் (Redirected)",
    paradoxicalStatus: "முரண்பட்ட பலன் (Paradoxical)",
    synergisticStatus: "உயர்ந்த கூட்டு பலன் (Synergistic)",
    subLordLabel: "கே.பி உப அதிபதி (Sub-Lord)",
    nakshatraLordLabel: "நட்சத்திர அதிபதி",
    rashmiLabel: "கிரக கதிர்கள் (ரஷ்மி)",
    amshaLabel: "அம்சம்",
    gunaLabel: "குணம்",
    tatvaLabel: "தத்துவம்",
    ganaLabel: "கணம்",
    nadiLabel: "நாடி",
    deityLabel: "தெய்வம்",
    organLabel: "உடல் உறுப்பு",
    pariharaLabel: "சாந்தி பரிகாரம்",
    totkeLabel: "லால் கிதாப் பரிகாரம்"
  },
  hi: {
    title: "नक्षत्र, ग्रह एवं भाव संश्लेषण इंजन",
    subtitle: "वैदिक कॉस्मोमेट्री, के.पी. सब-लॉर्ड, सर्वांश चक्र एवं फलित सूत्रों का संपूर्ण विश्लेषण",
    stellarMatrixTitle: "ग्रह-नक्षत्र रश्मि चक्र",
    bhavaMatrixTitle: "द्वादश भाव एवं वास्तु संश्लेषण",
    amshaMatrixTitle: "नवांश-सप्तांश-दशांश (D-1, D-9, D-7, D-10) वर्ग अंश",
    maandiTitle: "मांदि (गुलिक) भाव फल एवं शांति उपाय",
    phalitSutrasTitle: "फलित सूत्र लॉजिक गेट्स",
    nadiKarmaTitle: "भृगु नंदी नाड़ी - पूर्वजन्म संचित कर्म",
    jaiminiTitle: "जैमिनी आरूढ़ पद्धति एवं चर कारक",
    lalKitabTitle: "लाल किताब पितृ दोष एवं चमत्कारी टोटके",
    medicalPalmistryTitle: "चिकित्सा ज्योतिष एवं हस्तरेखा छाप",
    vastuTitle: "भाव एवं वास्तु दिशात्मक संयोजन",
    rule1Label: "सूत्र 1 (ग्रह बल / रश्मि क्षमता)",
    rule2Label: "सूत्र 2 (भाव बल पुनर्दिशा)",
    rule3Label: "सूत्र 3 (नक्षत्राधिपति vs ग्रह स्वभाव)",
    rule4Label: "सूत्र 4 (दशाधिपति सत्यापन - TRUE / NULL)",
    activeStatus: "सक्रिय फल (Active / Manifest)",
    latentStatus: "विलंबित फल (Latent / Delayed)",
    redirectedStatus: "पुनर्निर्देशित फल (Redirected)",
    paradoxicalStatus: "विरोधाभासी फल (Paradoxical)",
    synergisticStatus: "सहक्रियात्मक फल (Synergistic)",
    subLordLabel: "के.पी. उप-स्वामी (Sub-Lord)",
    nakshatraLordLabel: "नक्षत्राधिपति",
    rashmiLabel: "ग्रह रश्मि (किरणें)",
    amshaLabel: "अंश",
    gunaLabel: "गुण",
    tatvaLabel: "तत्व",
    ganaLabel: "गण",
    nadiLabel: "नाड़ी",
    deityLabel: "देवता",
    organLabel: "शारीरिक अंग",
    pariharaLabel: "वैदिक शांति उपाय",
    totkeLabel: "लाल किताब टोटके"
  }
};

export const getVedicSynthesisLocale = (lang?: string): VedicSynthesisDictionary => {
  const code = (lang?.split("-")[0]?.toLowerCase() ?? "en") as SupportedLocale;
  return VEDIC_SYNTHESIS_I18N[code] || VEDIC_SYNTHESIS_I18N.en;
};
