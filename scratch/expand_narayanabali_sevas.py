# 1. Update src/data/gokarnaSevas.ts
file_sevas = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/data/gokarnaSevas.ts"
with open(file_sevas, "r", encoding="utf-8") as f:
    content_sevas = f.read()

# Update SevaId type
old_seva_id = """export type SevaId =
  | "rudrabhisheka"
  | "pindapradana"
  | "narayanabali"
  | "tripindi"
  | "sarpasamskara"
  | "ganapatihoma"
  | "chandihoma"
  | "mrityunjaya"
  | "navagrahashanti"
  | "kujashanti"
  | "shanitilahoma"
  | "satyanarayana"
  | "ayushyahoma"
  | "rahuketushanti"
  | "kalasarpashanti"
  | "sudarshanahoma"
  | "dhanvantarihoma"
  | "pitrudoshashanti"
  | "vastushanti"
  | "mahalakshmihoma"
  | "santangopalahoma"
  | "swayamvaraparvati"
  | "custom_pooja";"""

new_seva_id = """export type SevaId =
  | "rudrabhisheka"
  | "pindapradana"
  | "narayanabali"
  | "narayanabali_tripindi"
  | "narayanabali_pretoddhara"
  | "tripindi"
  | "sarpasamskara"
  | "ganapatihoma"
  | "chandihoma"
  | "mrityunjaya"
  | "navagrahashanti"
  | "kujashanti"
  | "shanitilahoma"
  | "satyanarayana"
  | "ayushyahoma"
  | "rahuketushanti"
  | "kalasarpashanti"
  | "sudarshanahoma"
  | "dhanvantarihoma"
  | "pitrudoshashanti"
  | "vastushanti"
  | "mahalakshmihoma"
  | "santangopalahoma"
  | "swayamvaraparvati"
  | "custom_pooja";"""

content_sevas = content_sevas.replace(old_seva_id, new_seva_id)

# Add narayanabali_tripindi and narayanabali_pretoddhara to SEVA_CATALOG
combined_narayana_catalog = """,
  narayanabali_tripindi: {
    id: "narayanabali_tripindi",
    icon: "☘",
    name: {
      en: "Narayana Bali & Tripindi Shraddha",
      kn: "ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ",
      te: "నారాయణ బలి మరియు త్రిపిండి శ్రాద్ధం",
      ta: "நாராயண பலி & திரிபிண்டி சிரார்த்தம்",
      hi: "नारायण बलि एवं त्रिपिंडी श्राद्ध"
    },
    purpose: {
      en: "To resolve intense Pitru Dosha and fulfill unperformed Shraddha rites for three generations.",
      kn: "ಪಿತೃ ದೋಷ ನಿವಾರಣೆ, ಅಗಲಿದ ಹಿರಿಯರ ಮುಕ್ತಿ ಹಾಗೂ ಮೂರು ತಲೆಮಾರುಗಳ ಶ್ರಾದ್ಧ ಋಣ ಶಮನಕ್ಕಾಗಿ.",
      te: "పితృ దోష నివారణ, పూర్వీకుల సద్గతి మరియు మూడు తరాల శ్రాద్ధ ఋణ విముక్తి కొరకు.",
      ta: "பித்ரு தோஷ நிவர்த்தி, முன்னோர்களின் முக்தி மற்றும் 3 தலைமுறை சிராத்த கடன் நீங்க.",
      hi: "पितृ दोष निवारण, पूर्वजों की सद्गति एवं तीन पीढ़ियों के श्राद्ध ऋण शमन हेतु।"
    },
    benefit: {
      en: "Bestows ancestral blessings, eliminates marital/progeny obstacles, and brings abundance.",
      kn: "ಪಿತೃಗಳ ಪ್ರಸನ್ನ ಆಶೀರ್ವಾದ, ಸಂತಾನ ಮತ್ತು ವಿವಾಹ ಅಡೆತಡೆಗಳ ಶಮನ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ.",
      te: "పితృదేవతల అనుగ్రహం, వివాహ-సంతాన అడ్డంకుల నివారణ మరియు కుటుంబ సౌభాగ్యం.",
      ta: "முன்னோர்களின் ஆசி, திருமணம் மற்றும் சந்தான தடைகள் நீங்கி குடும்ப சுபிட்சம் உண்டாகும்.",
      hi: "पितरों का दिव्य आशीर्वाद, विवाह व संतान बाधा निवारण तथा पारिवारिक समृद्धि।"
    },
    where: KOTI_TEERTHA,
    when: {
      en: "On Amavasya, Pitru Paksha, or on Ekadashi.",
      kn: "ಅಮಾವಾಸ್ಯೆ, ಮಹಾಲಯ ಪಿತೃ ಪಕ್ಷ ಅಥವಾ ಏಕಾದಶಿಯಂದು.",
      te: "అమావాస్య, పితృ పక్షం లేదా ఏకాదశి రోజున.",
      ta: "அமாவாசை, பித்ரு பட்சம் அல்லது ஏகாதசி நாளில்.",
      hi: "अमावस्या, पितृ पक्ष अथवा एकादशी के दिन।"
    },
    duration: FULL_DAY,
    shloka: SHLOKA_PITRU
  },

  narayanabali_pretoddhara: {
    id: "narayanabali_pretoddhara",
    icon: "☘",
    name: {
      en: "Narayana Bali & Pretoddhara Shanti",
      kn: "ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ಪ್ರೇತೋದ್ಧಾರ",
      te: "నారాయణ బలి మరియు ప్రేతోద్ధార శాంతి",
      ta: "நாராயண பலி & பிரேதோத்தார சாந்தி",
      hi: "नारायण बलि एवं प्रेतोद्धार शांति"
    },
    purpose: {
      en: "Special Vedic ritual performed for unnatural demise, distressed souls, and liberation from Preta badha.",
      kn: "ಅಕಾಲ ಮರಣ, ಅತೃಪ್ತ ಆತ್ಮಗಳ ಸದ್ಗತಿ ಹಾಗೂ ಪ್ರೇತ ಬಾಧಾ ನಿವಾರಣೆಗಾಗಿ ವಿಶೇಷ ಶಾಂತಿ ಕರ್ಮ.",
      te: "అకాల మరణం, అతృప్త ఆత్మల సద్గతి మరియు ప్రేత బాధల నివారణకు విశేష శాంతి పూజ.",
      ta: "துர்மரணம், அதிருப்தி ஆன்மாக்களின் முக்தி மற்றும் பிரேத தோஷ நிவர்த்திக்கான விசேஷ சாந்தி.",
      hi: "अकाल मृत्यु, अतृप्त आत्माओं की सद्गति एवं प्रेत बाधा निवारण हेतु विशेष वैदिक शांति।"
    },
    benefit: {
      en: "Eternal peace & Moksha for departed souls, relief from night terrors/fear, and family protection.",
      kn: "ಆತ್ಮಗಳಿಗೆ ಚಿರಶಾಂತಿ ಮತ್ತು ಮೋಕ್ಷ, ದುಃಸ್ವಪ್ನ-ಭಯ ನಿವಾರಣೆ ಹಾಗೂ ವಂಶ ರಕ್ಷಣೆ.",
      te: "ఆత్మలకు ప్రశాంతత మరియు మోక్షం, భయ విముక్తి మరియు వంశ రక్షణ కలుగుతాయి.",
      ta: "ஆன்மாக்களுக்கு மோட்சம், பயம் மற்றும் கெட்ட கனவுகள் நீங்கி வம்ச பாதுகாப்பு உண்டாகும்.",
      hi: "आत्माओं को शांति व मोक्ष, भय व बुरे स्वप्नों से मुक्ति तथा वंश की दैवीय सुरक्षा।"
    },
    where: KOTI_TEERTHA,
    when: {
      en: "On Amavasya, Eclipse day, or on auspicious Punya Tithis.",
      kn: "ಅಮಾವಾಸ್ಯೆ, ಗ್ರಹಣ ಕಾಲ ಅಥವಾ ವಿಶೇಷ ಪುಣ್ಯ ತಿಥಿಯಂದು.",
      te: "అమావాస్య, గ్రహణ కాలం లేదా విశేష పుణ్య తిథులలో.",
      ta: "அமாவாசை, கிரகண காலம் அல்லது புண்ணிய திதிகளில்.",
      hi: "अमावस्या, ग्रहण काल अथवा पावन पुण्य तिथियों में।"
    },
    duration: FULL_DAY,
    shloka: SHLOKA_PITRU
  }"""

# Insert right after narayanabali entry
target_after_narayanabali = """    duration: FULL_DAY,
    shloka: SHLOKA_PITRU
  },"""

# Note: narayanabali is the first one with FULL_DAY and SHLOKA_PITRU
if "narayanabali_tripindi:" not in content_sevas:
    content_sevas = content_sevas.replace(target_after_narayanabali, target_after_narayanabali + combined_narayana_catalog, 1)

with open(file_sevas, "w", encoding="utf-8") as f:
    f.write(content_sevas)

print("Updated gokarnaSevas.ts with Narayana Bali combinations!")
