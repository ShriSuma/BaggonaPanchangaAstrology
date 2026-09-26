/**
 * Holy places presets in Gokarna Kshetra for Seva & Prasada and Calendar generation.
 * Provides accurate 5-language native typography (Kannada, Telugu, Tamil, Hindi, English).
 */

export interface HolyPlacePreset {
  id: string;
  name: {
    kn: string;
    te: string;
    ta: string;
    hi: string;
    en: string;
  };
  pincode: string;
  lat: number;
  lng: number;
}

export const GOKARNA_HOLY_PLACES: HolyPlacePreset[] = [
  {
    id: "kotiteertha",
    name: {
      kn: "ಕೋಟಿತೀರ್ಥ, ಗೋಕರ್ಣ",
      te: "కోటితీర్థం, గోకర్ణ",
      ta: "கோடிதீர்த்தம், கோகர்ணம்",
      hi: "कोटितीर्थ, गोकर्ण",
      en: "Kotiteertha, Gokarna"
    },
    pincode: "581326",
    lat: 14.5479,
    lng: 74.3187
  },
  {
    id: "devasthana",
    name: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನ, ಗೋಕರ್ಣ",
      te: "శ్రీ మహాబలేశ్వర దేవస్థానం, గోకర్ణ",
      ta: "ஸ்ரீ மகாபலேஸ்வரர் தேவஸ்தானம், கோகர்ணம்",
      hi: "श्री महाबलेश्वर देवस्थान, गोकर्ण",
      en: "Shri Mahabaleshwara Temple, Gokarna"
    },
    pincode: "581326",
    lat: 14.5426,
    lng: 74.3168
  },
  {
    id: "muktimantapa",
    name: {
      kn: "ಮುಕ್ತಿಮಂಟಪ, ಗೋಕರ್ಣ",
      te: "ముక్తిమంటపం, గోకర్ణ",
      ta: "முக்திமண்டபம், கோகர்ணம்",
      hi: "मुक्तिमंडप, गोकर्ण",
      en: "Muktimantapa, Gokarna"
    },
    pincode: "581326",
    lat: 14.5450,
    lng: 74.3175
  },
  {
    id: "gokarna_kshetra",
    name: {
      kn: "ಪವಿತ್ರ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
      te: "పవిత్ర గోకర్ణ క్షేత్రం",
      ta: "புனித கோகர்ண க்ஷேத்திரம்",
      hi: "पवित्र गोकर्ण क्षेत्र",
      en: "Holy Gokarna Kshetra"
    },
    pincode: "581326",
    lat: 14.5479,
    lng: 74.3187
  },
  {
    id: "gokarna_kotiteertha_sannidhi",
    name: {
      kn: "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ಸನ್ನಿಧಿ",
      te: "గోకర్ణ కోటితీర్థ సన్నిధి",
      ta: "கோகர்ண கோடிதீர்த்த சந்நிதி",
      hi: "गोकर्ण कोटितीर्थ सन्निधि",
      en: "Gokarna Kotiteertha Sannidhi"
    },
    pincode: "581326",
    lat: 14.5479,
    lng: 74.3187
  },
  {
    id: "custom",
    name: {
      kn: "ಇತರ ಸ್ಥಳ (ಕಸ್ಟಮ್)...",
      te: "ఇతర స్థలం (కస్టమ్)...",
      ta: "மற்ற இடம் (விருப்பப்படி)...",
      hi: "अन्य स्थान (कस्टम)...",
      en: "Other Location (Custom)..."
    },
    pincode: "581326",
    lat: 14.5479,
    lng: 74.3187
  }
];

export const getHolyPlaceById = (id: string): HolyPlacePreset | undefined => {
  return GOKARNA_HOLY_PLACES.find((p) => p.id === id);
};

export const getHolyPlaceName = (id: string, lang: string): string => {
  const p = getHolyPlaceById(id);
  if (!p) return "";
  const code = (lang || "kn").split("-")[0] as keyof HolyPlacePreset["name"];
  return p.name[code] || p.name.en || p.name.kn;
};

export const findHolyPlacePresetByText = (text: string): HolyPlacePreset | undefined => {
  const clean = text.trim().toLowerCase();
  if (!clean) return undefined;
  return GOKARNA_HOLY_PLACES.find((preset) => {
    if (preset.id === "custom") return false;
    return Object.values(preset.name).some(
      (n) => n.toLowerCase().includes(clean) || clean.includes(n.toLowerCase())
    );
  });
};
