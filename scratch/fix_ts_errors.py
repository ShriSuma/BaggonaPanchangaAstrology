# 1. Update sevaPriestDirectory.ts
file_priests = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/features/seva/sevaPriestDirectory.ts"
with open(file_priests, "r", encoding="utf-8") as f:
    content_priests = f.read()

custom_pooja_vidhi = """,
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
};"""

target_end_str = """    fruit: {
      kn: "ಶೀಘ್ರ ವಿವಾಹ ಯೋಗ, ಉತ್ತಮ ಜೀವನ ಸಂಗಾತಿ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಅನ್ಯೋನ್ಯ ದಾಂಪತ್ಯ",
      en: "Early marriage, ideal life partner, and harmonious wedded bliss",
      hi: "शीघ्र विवाह योग, योग्य जीवनसाथी की प्राप्ति एवं सुखमय दांपत्य",
      te: "శీఘ్ర వివాహ యోగం, ఉత్తమ భాగస్వామి ప్రాప్తి మరియు దాంపత్య సౌఖ్యం",
      ta: "விரைவில் திருமண யோகம், நற்குண துணை மற்றும் இல்லற இன்பம்"
    }
  }
};"""

if "custom_pooja:" not in content_priests:
    content_priests = content_priests.replace(target_end_str, target_end_str[:-2] + custom_pooja_vidhi)
    with open(file_priests, "w", encoding="utf-8") as f:
        f.write(content_priests)

# 2. Update PrasadaKit.tsx
file_kit = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/components/seva/PrasadaKit.tsx"
with open(file_kit, "r", encoding="utf-8") as f:
    content_kit = f.read()

content_kit = content_kit.replace('import type { SevaId } from "../../data/gokarnaSevas";', '')
content_kit = content_kit.replace('import { SEVA_CATALOG } from "../../data/gokarnaSevas";', 'import { SEVA_CATALOG, SHLOKA_SHANTI, type SevaId } from "../../data/gokarnaSevas";')

with open(file_kit, "w", encoding="utf-8") as f:
    f.write(content_kit)

print("Fixed imports and added custom_pooja to sevaPriestDirectory.ts successfully!")
