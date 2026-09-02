import React, { useState } from "react";
import Card from "../ui/Card";
import type { FacialMoleResult } from "../../features/facereading/faceReadingEngine";
import { VEDIC_12_FACIAL_MOLE_ZONES_L5 } from "../../features/facereading/samudrikaFaceKnowledge";

type Props = {
  moles?: FacialMoleResult[];
  lang: string;
};

const AUSPICIOUS_BADGES: Record<string, string> = {
  kn: "ಶುಭ",
  en: "Auspicious",
  hi: "शुभ",
  te: "శుభం",
  ta: "சுபம்"
};

const NEUTRAL_BADGES: Record<string, string> = {
  kn: "ಸಾಮಾನ್ಯ",
  en: "Neutral",
  hi: "सामान्य",
  te: "సాధారణం",
  ta: "இயல்பு"
};

const PRIEST_CONTACT_LABELS: Record<string, string> = {
  kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಅರ್ಚಕರ ಸನ್ನಿಧಿ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (+91 99723 39362)",
  en: "Priest Contact: Sri Shreeram Pandit (+91 99723 39362)",
  hi: "मुख्य अर्चक संपर्क: श्रीराम पंडित (+91 99723 39362)",
  te: "ప్రధాన అర్చకులు: శ్రీరామ్ పండిట్ (+91 99723 39362)",
  ta: "தலைமை அர்ச்சகர்: ஸ்ரீராம் பண்டிட் (+91 99723 39362)"
};

const INTRO_SUBTITLES: Record<string, string> = {
  kn: "॥ ಬೃಹತ್ ಸಂಹಿತಾ & ಭವಿಷ್ಯ ಪುರಾಣ ಮುಖ ತಿಲಕ ಶಾಸ್ತ್ರ ॥",
  en: "॥ BRIHAT SAMHITA & BHAVISHYA PURANA FACIAL TILAKA SHASTRA ॥",
  hi: "॥ बृहत्संहिता व भविष्य पुराण मुख तिलक शास्त्र ॥",
  te: "॥ బృహత్ సంహిత & భవిష్య పురాణ ముఖ తిలక శాస్త్రం ॥",
  ta: "॥ பிருஹத் சம்ஹிதை முக திலக சாஸ்திரம் ॥"
};

const INTRO_TITLES: Record<string, string> = {
  kn: "ಮುಖ ತಿಲಕ (ಮಚ್ಚೆ) ಶಾಸ್ತ್ರ & ದೈವಿಕ ಫಲ ರಹಸ್ಯ",
  en: "Facial Mole (Tilaka) Astrology & Sacred Destiny",
  hi: "मुख तिल (मस्सा) शास्त्र एवं दिव्य फल रहस्य",
  te: "ముఖ మచ్చల (తిలక) శాస్త్రం & దివ్య భాగ్యం",
  ta: "முக மச்ச சாஸ்திரம் & திவ்ய பலன் ரகசியம்"
};

const INTRO_TEXTS: Record<string, string> = {
  kn: "ಮುಖದ ೧೨ ಪ್ರಧಾನ ಸ್ಥಾನಗಳಲ್ಲಿರುವ ನೈಸರ್ಗಿಕ ಮಚ್ಚೆಗಳು ವ್ಯಕ್ತಿಯ ಪೂರ್ವಜನ್ಮದ ಸುಕೃತ, ಧನಾಗಮನ, ವಿವಾಹ ಕಾಲ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಣೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಸೂಚಿಸುತ್ತವೆ.",
  en: "Classical Vedic texts detail how natural moles across 12 facial coordinates reveal past karmic merit, sudden wealth, marriage timing, and divine protection.",
  hi: "मुख के 12 प्रधान स्थानों पर स्थित प्राकृतिक तिल पूर्वजन्म के पुण्य, धनागमन, विवाह काल एवं दैवीय रक्षा को स्पष्ट रूप से दर्शाते हैं।",
  te: "ముఖంలోని 12 ప్రధాన స్థానాలలోని సహజ మచ్చలు పూర్వజన్మ సుకృతం, ధనలాభం, వివాహ కాలం & దైవిక రక్షణను సూచిస్తాయి.",
  ta: "முகத்தின் 12 முக்கிய இடங்களில் உள்ள மச்சங்கள் பூர்வ புண்ணியம், தன வரவு, திருமண காலம் மற்றும் தெய்வீக பாதுகாப்பைக் குறிக்கின்றன."
};

const EXPLORER_TITLES: Record<string, string> = {
  kn: "ದ್ವಾದಶ ಮುಖ ಸ್ಥಾನಗಳ ಮಚ್ಚೆ ಫಲ (12-Zone Mole Explorer):",
  en: "12-Zone Facial Mole Explorer:",
  hi: "द्वादश मुख स्थानों का तिल फल (12-Zone Mole Explorer):",
  te: "ద్వాదశ ముఖ స్థానాల మచ్చల ఫలం (12-Zone Mole Explorer):",
  ta: "பன்னிரண்டு முக இடங்களின் மச்ச பலன் (12-Zone Mole Explorer):"
};

const SAMHITA_BADGES: Record<string, string> = {
  kn: "ಬೃಹತ್ ಸಂಹಿತಾ ಅಧ್ಯಾ. ೬೮",
  en: "Brihat Samhita Ch. 68",
  hi: "बृहत्संहिता अध्या. 68",
  te: "బృహత్ సంహిత అధ్యాయం 68",
  ta: "பிருஹத் சம்ஹிதை அத்தியாயம் 68"
};

const INDICATION_BADGES: Record<string, string> = {
  kn: "🌟 ಶಾಸ್ತ್ರೋಕ್ತ ಫಲ",
  en: "🌟 Vedic Indication",
  hi: "🌟 शास्त्रोक्त फल",
  te: "🌟 శాస్త్రోక్త ఫలం",
  ta: "🌟 சாஸ்திரோக்த பலன்"
};

const DETECTED_MOLES_TITLES: Record<string, string> = {
  kn: "ನಿಮ್ಮ ಛಾಯಾಚಿತ್ರದಲ್ಲಿ ಗುರುತಿಸಲಾದ ಮಚ್ಚೆಗಳು (Detected Moles):",
  en: "Detected Moles from Your Photo:",
  hi: "आपके चित्र में पहचाने गए तिल (Detected Moles):",
  te: "మీ చిత్రంలో గుర్తించిన మచ్చలు (Detected Moles):",
  ta: "உங்கள் புகைப்படத்தில் கண்டறியப்பட்ட மச்சங்கள்:"
};

const REMEDY_TITLES: Record<string, string> = {
  kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮುಖ ತೇಜಸ್ಸು ವೃದ್ಧಿ ಪರಿಹಾರ",
  en: "Sacred Gokarna Facial Tejas & Peace Remedy",
  hi: "श्री गोकर्ण महाबलेश्वर मुख तेज वृद्धि उपाय",
  te: "శ్రీ గోకర్ణ మహాబలేశ్వర ముఖ వర్చస్సు & శాంతి పరిహారం",
  ta: "ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் முக தேஜஸ் விருத்தி பரிகாரம்"
};

const REMEDY_TEXTS: Record<string, string> = {
  kn: "ಮುಖದಲ್ಲಿ ಸದಾ ಮಂಗಳಕರ ಕಾಂತಿ ಹಾಗೂ ಸಾತ್ವಿಕ ತೇಜಸ್ಸು ನೆಲೆಸಲು, ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲದಲ್ಲಿ ಶುದ್ಧ ಗಂಧ ಅಥವಾ ಕುಂಕುಮ ತಿಲಕವನ್ನು ಆಜ್ಞಾ ಚಕ್ರದಲ್ಲಿ ಧರಿಸಿ, 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸುವುದು ಅತ್ಯುನ್ನತ.",
  en: "To enhance natural facial radiance and inner peace, apply pure sandalwood paste or kumkuma at the Ajna chakra daily while chanting Om Namah Shivaya.",
  hi: "मुख पर सदैव मंगलकारी कांति व सात्विक तेज बनाए रखने के लिए प्रतिदिन प्रातः शुद्ध चंदन या कुंकुम तिलक आज्ञा चक्र पर धारण कर 'ॐ नमः शिवाय' जपें।",
  te: "ముఖంలో సదా మంగళకర వర్చస్సు & సాత్విక తేజస్సు నిలవడానికి, ప్రతిరోజూ ప్రాతఃకాలంలో స్వచ్ఛమైన చందనం లేదా కుంకుమ తిలకాన్ని ఆజ్ఞా చక్రంలో ధరించి 'ఓం నమః శివాయ' జపించండి.",
  ta: "முகத்தில் எப்போதும் மங்களகரமான தேஜஸ் திகழ, தினமும் அதிகாலையில் தூய சந்தனம் அல்லது குங்குமத் திலகத்தை ஆக்ஞா சக்கரத்தில் அணிந்து 'ஓம் நம சிவாய' ஜபிக்கவும்."
};

function formatText(value: Record<string, string> | string | undefined, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.kn || value.en || "";
}

export const FaceMolesTab: React.FC<Props> = ({ moles, lang }) => {
  const [selectedMoleZone, setSelectedMoleZone] = useState<string>("forehead-center");
  const activeZoneData = VEDIC_12_FACIAL_MOLE_ZONES_L5.find((z) => z.id === selectedMoleZone) || VEDIC_12_FACIAL_MOLE_ZONES_L5[0];

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none filter drop-shadow">🪔</span>
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
              {INTRO_SUBTITLES[lang] || INTRO_SUBTITLES.en}
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {INTRO_TITLES[lang] || INTRO_TITLES.en}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {INTRO_TEXTS[lang] || INTRO_TEXTS.en}
            </p>
          </div>
        </div>
      </Card>

      {/* Interactive 12-Zone Facial Mole Finder */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
            <span>📍</span>
            <span>{EXPLORER_TITLES[lang] || EXPLORER_TITLES.en}</span>
          </h4>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
            {SAMHITA_BADGES[lang] || SAMHITA_BADGES.en}
          </span>
        </div>

        {/* Zone Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {VEDIC_12_FACIAL_MOLE_ZONES_L5.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => setSelectedMoleZone(z.id)}
              className={`p-2.5 rounded-xl text-left text-xs font-bold transition border shadow-sm ${
                selectedMoleZone === z.id
                  ? "bg-amber-800 text-amber-50 border-amber-900 shadow-md"
                  : "bg-amber-50/70 border-amber-200 text-amber-950 hover:bg-amber-100"
              }`}
            >
              {formatText(z.location, lang)}
            </button>
          ))}
        </div>

        {/* Selected Zone Deep Dive Display */}
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-4 shadow-sm space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1">
            <span className="font-serif text-sm font-extrabold text-amber-950">
              {formatText(activeZoneData.location, lang)}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              {INDICATION_BADGES[lang] || INDICATION_BADGES.en}
            </span>
          </div>
          <p className="text-xs text-amber-900 font-semibold leading-relaxed pt-1">
            {formatText(activeZoneData.meaning, lang)}
          </p>
        </div>
      </Card>

      {/* Detected Moles from Devotee Image if any */}
      {moles && moles.length > 0 && (
        <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-3">
          <div className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-2 flex items-center gap-2">
            <span>✨</span>
            <span>{DETECTED_MOLES_TITLES[lang] || DETECTED_MOLES_TITLES.en}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {moles.map((m, idx) => (
              <div key={idx} className="rounded-xl bg-amber-50/70 p-3 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-xs text-amber-950">
                  <span>{formatText(m.location, lang)}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-extrabold">
                    {m.isAuspicious
                      ? (AUSPICIOUS_BADGES[lang] || AUSPICIOUS_BADGES.en)
                      : (NEUTRAL_BADGES[lang] || NEUTRAL_BADGES.en)}
                  </span>
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  {formatText(m.significance, lang)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Gokarna Kshetra Sacred Remedy Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md space-y-3">
        <div className="flex items-center gap-2 border-b border-amber-300 pb-2">
          <span className="text-2xl select-none">🔱</span>
          <h4 className="font-serif text-base font-bold text-amber-950">
            {REMEDY_TITLES[lang] || REMEDY_TITLES.en}
          </h4>
        </div>

        <div className="text-xs text-amber-950 leading-relaxed font-medium space-y-2">
          <p>
            {REMEDY_TEXTS[lang] || REMEDY_TEXTS.en}
          </p>
          <div className="rounded-xl bg-white p-3 border border-amber-300 text-amber-900 font-bold">
            🙏 {PRIEST_CONTACT_LABELS[lang] || PRIEST_CONTACT_LABELS.en}
          </div>
        </div>
      </Card>
    </div>
  );
};
