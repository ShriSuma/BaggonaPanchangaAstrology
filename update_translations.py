import json

with open("src/utils/localTranslations.ts", "r") as f:
    content = f.read()

# We will just rewrite the whole thing since it's easy
new_content = """export const localTranslations: Record<string, Record<string, string>> = {
  kn: {
    // Categories
    "Auspicious Indications": "ಶುಭ ಸೂಚನೆಗಳು",
    "Current Challenges": "ಪ್ರಸ್ತುತ ಸವಾಲುಗಳು",
    "Core Life Lesson": "ಜೀವನದ ಪಾಠ",
    "Education & Growth": "ವಿದ್ಯಾಭ್ಯಾಸ ಮತ್ತು ಪ್ರಗತಿ",
    "Marriage & Relationships": "ಮದುವೆ ಮತ್ತು ಸಂಬಂಧಗಳು",
    "Career & Profession": "ವೃತ್ತಿ ಜೀವನ",
    "Longevity & Wisdom": "ಆರೋಗ್ಯ ಮತ್ತು ಆಯುಷ್ಯ",
    "Life Stability & Wealth": "ಆಸ್ತಿ ಮತ್ತು ಸಂಪತ್ತು",
    "Current Dasha Bhukti": "ಪ್ರಸ್ತುತ ದಶಾ ಮತ್ತು ಭುಕ್ತಿ",

    // Zodiac Signs
    "Aries": "ಮೇಷ", "Mesha": "ಮೇಷ",
    "Taurus": "ವೃಷಭ", "Vrishabha": "ವೃಷಭ",
    "Gemini": "ಮಿಥುನ", "Mithuna": "ಮಿಥುನ",
    "Cancer": "ಕರ್ಕಾಟಕ", "Karka": "ಕರ್ಕಾಟಕ",
    "Leo": "ಸಿಂಹ", "Simha": "ಸಿಂಹ",
    "Virgo": "ಕನ್ಯಾ", "Kanya": "ಕನ್ಯಾ",
    "Libra": "ತುಲಾ", "Tula": "ತುಲಾ",
    "Scorpio": "ವೃಶ್ಚಿಕ", "Vrishchika": "ವೃಶ್ಚಿಕ",
    "Sagittarius": "ಧನುಸ್ಸು", "Dhanu": "ಧನುಸ್ಸು",
    "Capricorn": "ಮಕರ", "Makara": "ಮಕರ",
    "Aquarius": "ಕುಂಭ", "Kumbha": "ಕುಂಭ",
    "Pisces": "ಮೀನ", "Meena": "ಮೀನ",

    // Planets
    "Sun": "ಸೂರ್ಯ",
    "Moon": "ಚಂದ್ರ",
    "Mars": "ಕುಜ",
    "Mercury": "ಬುಧ",
    "Jupiter": "ಗುರು",
    "Venus": "ಶುಕ್ರ",
    "Saturn": "ಶನಿ",
    "Rahu": "ರಾಹು",
    "Ketu": "ಕೇತು",

    // Nakshatras
    "Ashwini": "ಅಶ್ವಿನಿ", "Bharani": "ಭರಣಿ", "Krittika": "ಕೃತ್ತಿಕಾ", "Rohini": "ರೋಹಿಣಿ",
    "Mrigashira": "ಮೃಗಶಿರ", "Ardra": "ಆರ್ದ್ರಾ", "Punarvasu": "ಪುನರ್ವಸು", "Pushya": "ಪುಷ್ಯ",
    "Ashlesha": "ಆಶ್ಲೇಷಾ", "Magha": "ಮಘಾ", "Purva Phalguni": "ಪೂರ್ವ ಫಲ್ಗುಣಿ",
    "Uttara Phalguni": "ಉತ್ತರ ಫಲ್ಗುಣಿ", "Hasta": "ಹಸ್ತ", "Chitra": "ಚಿತ್ರಾ",
    "Swati": "ಸ್ವಾತಿ", "Vishakha": "ವಿಶಾಖಾ", "Anuradha": "ಅನುರಾಧಾ", "Jyeshtha": "ಜ್ಯೇಷ್ಠಾ",
    "Mula": "ಮೂಲ", "Purva Ashadha": "ಪೂರ್ವಾಷಾಢ", "Uttara Ashadha": "ಉತ್ತರಾಷಾಢ",
    "Shravana": "ಶ್ರವಣ", "Dhanishta": "ಧನಿಷ್ಠಾ", "Shatabhisha": "ಶತಭಿಷಾ",
    "Purva Bhadrapada": "ಪೂರ್ವ ಭಾದ್ರಪದ", "Uttara Bhadrapada": "ಉತ್ತರ ಭಾದ್ರಪದ", "Revati": "ರೇವತಿ",

    // PDF Headers
    "Baggona Panchanga": "ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ",
    "Baggona Panchanga Prediction": "ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಭವಿಷ್ಯ",
    "Detailed Astrology Reading": "ವಿವರವಾದ ಭವಿಷ್ಯ ದರ್ಪಣ",
    "Personalized Cosmic Reading": "ವೈಯಕ್ತಿಕ ಭವಿಷ್ಯ ದರ್ಪಣ",
    "Name": "ಹೆಸರು",
    "Birth Details": "ಜನನದ ವಿವರಗಳು",
    "Birth Lagna (Ascendant)": "ಜನ್ಮ ಲಗ್ನ",
    "Moon Sign (Rashi)": "ಜನ್ಮ ರಾಶಿ",
    "Nakshatra": "ಜನ್ಮ ನಕ್ಷತ್ರ",
    "Current Cosmic Era": "ಪ್ರಸ್ತುತ ದಶಾ ಮತ್ತು ಭುಕ್ತಿ",
    "Dasha": "ಮಹಾದಶೆ",
    "Bhukti": "ಭುಕ್ತಿ",
    "Astrologer's Blessing (Ashirvada)": "ಜ್ಯೋತಿಷಿಗಳ ಆಶೀರ್ವಾದ",
    "Generated gracefully by Baggona Panchanga Astrology Engine": "ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಆಸ್ಟ್ರಾಲಜಿ ಎಂಜಿನ್ ನಿಂದ ರಚಿಸಲಾಗಿದೆ",
    "Special Planetary Combinations (Yogas)": "ವಿಶೇಷ ಗ್ರಹ ಯೋಗಗಳು",
    "Karmic Challenges (Doshas)": "ಕರ್ಮದೋಷಗಳು",
    "Recommended Remedy:": "ಸೂಚಿಸಲಾದ ಪರಿಹಾರ:",
    "Characteristics (Vyaktitva)": "ವ್ಯಕ್ತಿತ್ವ",
    "The Dark Secret (Nigoodha Satya)": "ನಿಗೂಢ ಸತ್ಯ"
  },
  te: {
    "Auspicious Indications": "శుభ సూచనలు",
    "Current Challenges": "ప్రస్తుత సవాళ్లు",
    "Core Life Lesson": "జీవిత పాఠం",
    "Education & Growth": "విద్య మరియు పురోగతి",
    "Marriage & Relationships": "వివాహం మరియు సంబంధాలు",
    "Career & Profession": "వృత్తి జీవితం",
    "Longevity & Wisdom": "ఆరోగ్యం మరియు ఆయుష్షు",
    "Life Stability & Wealth": "స్థిరత్వం మరియు సంపద",
    "Current Dasha Bhukti": "ప్రస్తుత దశ మరియు భుక్తి",
    "Aries": "మేష", "Mesha": "మేష",
    "Taurus": "వృషభ", "Vrishabha": "వృషభ",
    "Gemini": "మిథున", "Mithuna": "మిథున",
    "Cancer": "కర్కాటక", "Karka": "కర్కాటక",
    "Leo": "సింహ", "Simha": "సింహ",
    "Virgo": "కన్య", "Kanya": "కన్య",
    "Libra": "తులా", "Tula": "తులా",
    "Scorpio": "వృశ్చిక", "Vrishchika": "వృశ్చిక",
    "Sagittarius": "ధనుస్సు", "Dhanu": "ధనుస్సు",
    "Capricorn": "మకర", "Makara": "మకర",
    "Aquarius": "కుంభ", "Kumbha": "కుంభ",
    "Pisces": "మీన", "Meena": "మీన",
    "Sun": "సూర్య", "Moon": "చంద్ర", "Mars": "కుజ", "Mercury": "బుధ", "Jupiter": "గురు", "Venus": "శుక్ర", "Saturn": "శని", "Rahu": "రాహు", "Ketu": "కేతు",
    "Ashwini": "అశ్విని", "Bharani": "భరణి", "Krittika": "కృత్తికా", "Rohini": "రోహిణి", "Mrigashira": "మృగశిర", "Ardra": "ఆరుద్ర", "Punarvasu": "పునర్వసు", "Pushya": "పుష్యమి", "Ashlesha": "ఆశ్లేష", "Magha": "మఘ", "Purva Phalguni": "పూర్వ ఫల్గుణి", "Uttara Phalguni": "ఉత్తర ఫల్గుణి", "Hasta": "హస్త", "Chitra": "చిత్త", "Swati": "స్వాతి", "Vishakha": "విశాఖ", "Anuradha": "అనూరాధ", "Jyeshtha": "జ్యేష్ఠ", "Mula": "మూల", "Purva Ashadha": "పూర్వాషాఢ", "Uttara Ashadha": "ఉత్తరాషాఢ", "Shravana": "శ్రవణ", "Dhanishta": "ధనిష్ఠ", "Shatabhisha": "శతభిషం", "Purva Bhadrapada": "పూర్వాభాద్ర", "Uttara Bhadrapada": "ఉత్తరాభాద్ర", "Revati": "రేవతి",
    "Baggona Panchanga": "బగ్గోన పంచాంగం",
    "Baggona Panchanga Prediction": "బగ్గోన పంచాంగ భవిష్యత్తు",
    "Detailed Astrology Reading": "వివరణాత్మక జ్యోతిష్య పఠనం",
    "Personalized Cosmic Reading": "వ్యక్తిగత భవిష్యత్తు చదవడం",
    "Name": "పేరు",
    "Birth Details": "జనన వివరాలు",
    "Birth Lagna (Ascendant)": "జన్మ లగ్నం",
    "Moon Sign (Rashi)": "జన్మ రాశి",
    "Nakshatra": "జన్మ నక్షత్రం",
    "Current Cosmic Era": "ప్రస్తుత దశ మరియు భుక్తి",
    "Dasha": "మహాదశ",
    "Bhukti": "భుక్తి",
    "Astrologer's Blessing (Ashirvada)": "జ్యోతిష్కుని ఆశీర్వాదం (ఆశీర్వచనం)",
    "Generated gracefully by Baggona Panchanga Astrology Engine": "బగ్గోన పంచాంగ ఆస్ట్రాలజీ ఇంజిన్ ద్వారా రూపొందించబడింది",
    "Special Planetary Combinations (Yogas)": "ప్రత్యేక గ్రహ యోగాలు",
    "Karmic Challenges (Doshas)": "కర్మ సంబంధ దోషాలు",
    "Recommended Remedy:": "సూచించిన పరిహారం:",
    "Characteristics (Vyaktitva)": "వ్యక్తిత్వం",
    "The Dark Secret (Nigoodha Satya)": "నిగూఢ సత్యం"
  },
  ta: {
    "Auspicious Indications": "மங்களகரமான அறிகுறிகள்",
    "Current Challenges": "தற்போதைய சவால்கள்",
    "Core Life Lesson": "வாழ்க்கை பாடம்",
    "Education & Growth": "கல்வி மற்றும் வளர்ச்சி",
    "Marriage & Relationships": "திருமணம் மற்றும் உறவுகள்",
    "Career & Profession": "தொழில் மற்றும் வேலை",
    "Longevity & Wisdom": "ஆரோக்கியம் மற்றும் ஆயுள்",
    "Life Stability & Wealth": "ஸ்திரத்தன்மை மற்றும் செல்வம்",
    "Current Dasha Bhukti": "தற்போதைய தசை மற்றும் புக்தி",
    "Aries": "மேஷம்", "Mesha": "மேஷம்",
    "Taurus": "ரிஷபம்", "Vrishabha": "ரிஷபம்",
    "Gemini": "மிதுனம்", "Mithuna": "மிதுனம்",
    "Cancer": "கடகம்", "Karka": "கடகம்",
    "Leo": "சிம்மம்", "Simha": "சிம்மம்",
    "Virgo": "கன்னி", "Kanya": "கன்னி",
    "Libra": "துலாம்", "Tula": "துலாம்",
    "Scorpio": "விருச்சிகம்", "Vrishchika": "விருச்சிகம்",
    "Sagittarius": "தனுசு", "Dhanu": "தனுசு",
    "Capricorn": "மகரம்", "Makara": "மகரம்",
    "Aquarius": "கும்பம்", "Kumbha": "கும்பம்",
    "Pisces": "மீனம்", "Meena": "மீனம்",
    "Sun": "சூரியன்", "Moon": "சந்திரன்", "Mars": "செவ்வாய்", "Mercury": "புதன்", "Jupiter": "குரு", "Venus": "சுக்கிரன்", "Saturn": "சனி", "Rahu": "ராகு", "Ketu": "கேது",
    "Ashwini": "அஸ்வினி", "Bharani": "பரணி", "Krittika": "கிருத்திகை", "Rohini": "ரோகிணி", "Mrigashira": "மிருகசீரிஷம்", "Ardra": "திருவாதிரை", "Punarvasu": "புனர்பூசம்", "Pushya": "பூசம்", "Ashlesha": "ஆயில்யம்", "Magha": "மகம்", "Purva Phalguni": "பூரம்", "Uttara Phalguni": "உத்திரம்", "Hasta": "அஸ்தம்", "Chitra": "சித்திரை", "Swati": "சுவாதி", "Vishakha": "விசாகம்", "Anuradha": "அனுஷம்", "Jyeshtha": "கேட்டை", "Mula": "மூலம்", "Purva Ashadha": "பூராடம்", "Uttara Ashadha": "உத்திராடம்", "Shravana": "திருவோணம்", "Dhanishta": "அவிட்டம்", "Shatabhisha": "சதயம்", "Purva Bhadrapada": "பூரட்டாதி", "Uttara Bhadrapada": "உத்திரட்டாதி", "Revati": "ரேவதி",
    "Baggona Panchanga": "பக்கோன பஞ்சாங்கம்",
    "Baggona Panchanga Prediction": "பக்கோன பஞ்சாங்க பலன்கள்",
    "Detailed Astrology Reading": "விரிவான ஜோதிட வாசிப்பு",
    "Personalized Cosmic Reading": "தனிப்பயனாக்கப்பட்ட ஜோதிட வாசிப்பு",
    "Name": "பெயர்",
    "Birth Details": "பிறப்பு விவரங்கள்",
    "Birth Lagna (Ascendant)": "பிறப்பு லக்னம்",
    "Moon Sign (Rashi)": "ஜன்ம ராசி",
    "Nakshatra": "நட்சத்திரம்",
    "Current Cosmic Era": "தற்போதைய தசை மற்றும் புக்தி",
    "Dasha": "மகா தசை",
    "Bhukti": "புக்தி",
    "Astrologer's Blessing (Ashirvada)": "ஜோதிடரின் ஆசிர்வாதம்",
    "Generated gracefully by Baggona Panchanga Astrology Engine": "பக்கோன பஞ்சாங்க ஜோதிட மென்பொருளால் உருவாக்கப்பட்டது",
    "Special Planetary Combinations (Yogas)": "சிறப்பு கிரக யோகங்கள்",
    "Karmic Challenges (Doshas)": "கர்ம தோஷங்கள்",
    "Recommended Remedy:": "பரிந்துரைக்கப்பட்ட பரிகாரம்:",
    "Characteristics (Vyaktitva)": "குணாதிசயங்கள்",
    "The Dark Secret (Nigoodha Satya)": "ரகசிய உண்மை"
  }
};

/**
 * Helper function to safely get local translations for specific astrology keywords,
 * avoiding weird hallucinations by third-party translation APIs for single words.
 */
export function getLocalAstrologyTerm(term: string, language: string): string {
  if (localTranslations[language] && localTranslations[language][term]) {
    return localTranslations[language][term];
  }
  return term;
}
"""

with open("src/utils/localTranslations.ts", "w") as f:
    f.write(new_content)
