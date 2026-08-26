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
    ta: "🕉️ முன் ஜென்ம ரகசியம் & கர்ம கண்ணாroll"
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
    kn: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು (Full Name):",
    en: "Your Full Name:",
    hi: "आपका पूरा नाम:",
    te: "మీ పూర్తి పేరు:",
    ta: "உங்கள் முழுப் பெயர்:"
  },
  formDob: {
    kn: "ಜನ್ಮ ದಿನಾಂಕ (Date of Birth): *",
    en: "Date of Birth: *",
    hi: "जन्म तिथि: *",
    te: "పుట్టిన తేదీ: *",
    ta: "பிறந்த தேதி: *"
  },
  formTob: {
    kn: "ಜನ್ಮ ಸಮಯ (Time of Birth - ಐಚ್ಛಿಕ):",
    en: "Time of Birth (Optional):",
    hi: "जन्म समय (वैकल्पिक):",
    te: "పుట్టిన సమయం (ఐచ్ఛికం):",
    ta: "பிறந்த நேரம் (விருப்பத்தேர்வு):"
  },
  formPlace: {
    kn: "ಜನ್ಮ ಸ್ಥಳ / ಪಿನ್ ಕೋಡ್:",
    en: "Birth Place / Pincode:",
    hi: "जन्म स्थान / पिनकोड:",
    te: "పుట్టిన స్థలం / పిన్‌కోడ్:",
    ta: "பிறந்த இடம் / பின்கோடு:"
  },
  formBirthMark: {
    kn: "ದೇಹದ ಪ್ರಮುಖ ಮಚ್ಚೆ / ಲಕ್ಷಣವಿರುವ ಭಾಗ:",
    en: "Prominent Birthmark / Mole Location:",
    hi: "शरीर पर प्रमुख तिल/मस्सा का स्थान:",
    te: "శరీరంలో ప్రధాన పుట్టుమచ్చ ఉన్న భాగం:",
    ta: "உடலில் மச்சம் / அடையாளம் உள்ள பகுதி:"
  },
  formAffinity: {
    kn: "ವಿವರಿಸಲಾಗದ ಸಹಜ ಆಕರ್ಷಣೆ / ಸೆಳೆತ (Soul Affinity):",
    en: "Inexplicable Innate Soul Affinity:",
    hi: "अकारण स्वाभाविक आकर्षण (Soul Affinity):",
    te: "అకారణ సహజ ఆకర్షణ (Soul Affinity):",
    ta: "விவரிக்க முடியாத உள்ளுணர்வு ஈர்ப்பு:"
  },
  formPhobia: {
    kn: "ಬಾಲ್ಯದಿಂದ ಕಾಡುವ ಅಕಾರಣ ಭಯ (Innate Phobia):",
    en: "Childhood Inexplicable Phobia:",
    hi: "बचपन से अकारण भय (Innate Phobia):",
    te: "చిన్నప్పటి నుండి ఉన్న అకారణ భయం:",
    ta: "சிறுவயது முதல் இருக்கும் அகாரண பயம்:"
  },
  formQuestion: {
    kn: "ನಿಮ್ಮ ಹಿಂದಿನ ಜನ್ಮದ ಬಗ್ಗೆ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ (ಧ್ವನಿ ಮೂಲಕವೂ ಕೇಳಬಹುದು):",
    en: "Specific Past-Life Question (You can also speak via Mic):",
    hi: "पूर्व जन्म से संबंधित विशिष्ट प्रश्न (माइक द्वारा बोलें):",
    te: "పూర్వ జన్మ గురించి నిర్దిష్ట ప్రశ్న (మైక్ ద్వారా మాట్లాడండి):",
    ta: "முன் ஜென்மம் குறித்த கேள்வி (மைக் மூலம் பேசலாம்):"
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
