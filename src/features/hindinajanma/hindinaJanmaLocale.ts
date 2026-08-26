import type { HindinaJanmaLang } from "./hindinaJanmaTypes";

export function pickL5(map: Record<string, string>, lang: HindinaJanmaLang): string {
  return map[lang] || map.kn || map.en || "";
}

export function pickL5Array(map: Record<string, string[]>, lang: HindinaJanmaLang): string[] {
  return map[lang] || map.kn || map.en || [];
}

export const T_HINDINA_JANMA: Record<string, Record<HindinaJanmaLang, string>> = {
  heroTitle: {
    kn: "🕉️ ಹಿಂದಿನ ಜನ್ಮ ರಹಸ್ಯ & ಪೂರ್ವ ಜನ್ಮ ಕರ್ಮ ದರ್ಪಣ",
    en: "🕉️ Past Life Karma & Reincarnation Mirror",
    hi: "🕉️ पूर्व जन्म रहस्य एवं कर्म दर्पण",
    te: "🕉️ పూర్వ జన్మ రహస్యం & కర్మ దర్పణం",
    ta: "🕉️ முன் ஜென்ம ரகசியம் & கர்ம கண்ணாடி"
  },
  heroSubtitle: {
    kn: "ವೇದ ಜ್ಯೋತಿಷ್ಯದ ಡಿ-೬೦ ಷಷ್ಟ್ಯಂಶ, ರಾಹು-ಕೇತು ಅಕ್ಷ ಹಾಗೂ ಸಾಮುದ್ರಿಕ ಲಕ್ಷಣಗಳ ಮೂಲಕ ನಿಮ್ಮ ಹಿಂದಿನ ಜನ್ಮದ ಗುರುತು, ವೃತ್ತಿ, ಸಂಚಿತ ಕರ್ಮ, ಸುಪ್ತ ಪ್ರತಿಭೆಗಳು ಹಾಗೂ ಗೋಕರ್ಣ ಮೋಕ್ಷ ಪರಿಹಾರಗಳ ಅನಾವರಣ.",
    en: "Unveiling your past life identity, vocation, accumulated Sanchita Karma, innate talents, phobias & sacred Gokarna liberation remedies via Parashara D-60 Shashtiamsha.",
    hi: "वैदिक ज्योतिष के षष्ट्यंश (D-60), राहु-केतु अक्ष एवं सामुद्रिक लक्षणों द्वारा आपके पूर्व जन्म का परिचय, संचित कर्म, सुप्त प्रतिभाएं एवं गोकर्ण मोक्ष उपाय।",
    te: "వేద జ్యోతిష్య డి-60 షష్ట్యంశ, రాహు-కేతు అక్షం ద్వారా మీ పూర్వ జన్మ గుర్తింపు, సంచిత కర్మ, సుప్త ప్రతిభలు & గోకర్ణ మోక్ష పరిహారాలు.",
    ta: "வேத ஜோதிட டி-60 ஷஷ்டியாம்சம், ராகு-கேது அச்சு மூலம் உங்கள் முன் ஜென்ம அடையாளம், சஞ்சித கர்மா, மறைந்திருக்கும் திறமைகள் & மோக்ஷ பரிகாரங்கள்."
  },
  tabIdentity: {
    kn: "👑 ಹಿಂದಿನ ಜನ್ಮದ ಗುರುತು & ಯುಗ",
    en: "👑 Past Life Identity & Era",
    hi: "👑 पूर्व जन्म पहचान एवं युग",
    te: "👑 పూర్వ జన్మ గుర్తింపు & యుగం",
    ta: "👑 முன் ஜென்ம அடையாளம் & காலம்"
  },
  tabKarma: {
    kn: "⚖️ ಸಂಚಿತ ಕರ್ಮ & ಋಣಾನುಬಂಧ",
    en: "⚖️ Sanchita Karma & Debts",
    hi: "⚖️ संचित कर्म एवं ऋणानुबंध",
    te: "⚖️ సంచిత కర్మ & ఋణానుబంధం",
    ta: "⚖️ சஞ்சித கர்மா & கடன்கள்"
  },
  tabTalents: {
    kn: "🌟 ಸುಪ್ತ ಪ್ರತಿಭೆ & ಪೂರ್ವ ವರಗಳು",
    en: "🌟 Innate Talents & Boons",
    hi: "🌟 सुप्त प्रतिभा एवं पूर्व वरदान",
    te: "🌟 సుప్త ప్రతిభ & పూర్వ వరాలు",
    ta: "🌟 மறைந்திருக்கும் திறமை & வரங்கள்"
  },
  tabPhobia: {
    kn: "🐍 ಭಯಗಳು, ಮಚ್ಚೆ & ಡೆಜಾ-ವು",
    en: "🐍 Phobias, Birthmarks & Deja-Vu",
    hi: "🐍 भय, तिल/मस्सा एवं देजा-वू",
    te: "🐍 భయాలు, పుట్టుమచ్చలు & డెజా-వు",
    ta: "🐍 பயங்கள், மச்சம் & டெஜாவூ"
  },
  tabMokshaAxis: {
    kn: "🔄 ರಾಹು-ಕೇತು ಅಕ್ಷ & ಆತ್ಮದ ಗುರಿ",
    en: "🔄 Rahu-Ketu Soul Mission",
    hi: "🔄 राहु-केतु अक्ष एवं आत्मा का लक्ष्य",
    te: "🔄 రాహు-కేతు అక్షం & ఆత్మ లక్ష్యం",
    ta: "🔄 ராகு-கேது ஆன்ம லட்சியம்"
  },
  tabRemedies: {
    kn: "🪔 ಕರ್ಮ ಮುಕ್ತಿ & ಗೋಕರ್ಣ ಪರಿಹಾರ",
    en: "🪔 Karmic Remedies & Gokarna Seva",
    hi: "🪔 कर्म मुक्ति एवं गोकर्ण उपाय",
    te: "🪔 కర్మ ముక్తి & గోకర్ణ పరిహారాలు",
    ta: "🪔 கர்ம முக்தி & கோகர்ண பரிகாரம்"
  },
  tabAiNarrative: {
    kn: "✨ ಗೋಕರ್ಣ ವೇದಜ್ಞರ AI ದಿವ್ಯ ಕಥನ",
    en: "✨ Vedic AI Past Life Chronicle",
    hi: "✨ वैदिक AI पूर्व जन्म गाथा",
    te: "✨ వైదిక AI పూర్వ జన్మ గాథ",
    ta: "✨ வேத AI முன் ஜென்ம வரலாறு"
  },
  formName: {
    kn: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು",
    en: "Full Name",
    hi: "आपका पूरा नाम",
    te: "పూర్తి పేరు",
    ta: "முழுப் பெயர்"
  },
  formDob: {
    kn: "ಜನ್ಮ ದಿನಾಂಕ",
    en: "Date of Birth",
    hi: "जन्म तिथि",
    te: "పుట్టిన తేదీ",
    ta: "பிறந்த தேதி"
  },
  formTob: {
    kn: "ಜನ್ಮ ಸಮಯ",
    en: "Time of Birth",
    hi: "जन्म समय",
    te: "పుట్టిన సమయం",
    ta: "பிறந்த நேரம்"
  },
  formGender: {
    kn: "ಲಿಂಗ",
    en: "Gender",
    hi: "लिंग",
    te: "లింగం",
    ta: "பாலினம்"
  },
  formPlace: {
    kn: "ಜನ್ಮ ಸ್ಥಳ / ಊರು",
    en: "Birth Place / City",
    hi: "जन्म स्थान / शहर",
    te: "పుట్టిన స్థలం / నగరం",
    ta: "பிறந்த இடம் / ஊர்"
  },
  formBirthMark: {
    kn: "ದೇಹದ ಮಚ್ಚೆ / ಲಕ್ಷಣವಿರುವ ಭಾಗ",
    en: "Birthmark / Mole Location",
    hi: "तिल / शारीरिक लक्षण का स्थान",
    te: "పుట్టుమచ్చ / శారీరక లక్షణం",
    ta: "மச்சம் / உடல் அடையாளம்"
  },
  formAffinity: {
    kn: "ಸಹಜ ಆತ್ಮ ಆಕರ್ಷಣೆ / ಸೆಳೆತ",
    en: "Innate Soul Affinity",
    hi: "स्वाभाविक आत्मिक आकर्षण",
    te: "సహజ ఆత్మ ఆకర్షణ",
    ta: "உள்ளுணர்வு ஆன்ம ஈர்ப்பு"
  },
  formPhobia: {
    kn: "ಬಾಲ್ಯದ ಅಕಾರಣ ಭಯ",
    en: "Innate Childhood Phobia",
    hi: "बचपन का अकारण भय",
    te: "చిన్నప్పటి అకారణ భయం",
    ta: "சிறுவயது அகாரண பயம்"
  },
  formQuestion: {
    kn: "ನಿಮ್ಮ ಹಿಂದಿನ ಜನ್ಮದ ಬಗ್ಗೆ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ",
    en: "Specific Past-Life Question",
    hi: "पूर्व जन्म से संबंधित प्रश्न",
    te: "పూర్వ జన్మ గురించి ప్రశ్న",
    ta: "முன் ஜென்மம் குறித்த கேள்வி"
  },
  submitBtn: {
    kn: "🔮 ಹಿಂದಿನ ಜನ್ಮದ ರಹಸ್ಯಗಳನ್ನು ಅನಾವರಣಗೊಳಿಸಿ",
    en: "🔮 Reveal My Past Life Secrets",
    hi: "🔮 मेरे पूर्व जन्म के रहस्य उद्घाटित करें",
    te: "🔮 నా పూర్వ జన్మ రహస్యాలను ఆవిష్కరించండి",
    ta: "🔮 எனது முன் ஜென்ம ரகசியங்களைக் காண்க"
  },
  downloadPdfBtn: {
    kn: "📄 ಹಿಂದಿನ ಜನ್ಮ ದೈವಿಕ ಪತ್ರಿಕೆ ಡೌನ್‌ಲೋಡ್ (PDF)",
    en: "📄 Download Past Life Report (PDF)",
    hi: "📄 पूर्व जन्म दिव्य पत्रिका डाउनलोड (PDF)",
    te: "📄 పూర్వ జన్మ దివ్య పత్రిక డౌన్‌లోడ్ (PDF)",
    ta: "📄 முன் ஜென்ம அறிக்கை பதிவிறக்கம் (PDF)"
  }
};
