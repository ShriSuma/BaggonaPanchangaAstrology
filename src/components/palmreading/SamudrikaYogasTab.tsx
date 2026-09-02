import React from "react";
import Card from "../ui/Card";
import type { PalmReadingResult } from "../../features/palmreading/palmReadingEngine";
import {
  VEDIC_HASTAREKHA_YOGAS_L5,
  VEDIC_MANIBANDHA_WRIST_BRACELETS,
  VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT,
  VEDIC_ANGULI_FINGER_PROPORTIONS,
  VEDIC_SACRED_MARKS
} from "../../features/palmreading/samudrikaKnowledge";

export type SamudrikaYogasTabProps = {
  result?: PalmReadingResult | null;
  lang?: string;
  devoteeName?: string;
};

export const SamudrikaYogasTab: React.FC<SamudrikaYogasTabProps> = ({
  result,
  lang = "kn",
  devoteeName = "Devotee"
}) => {
  type SupportedLang = "kn" | "en" | "hi" | "te" | "ta";
  const langKey: SupportedLang = (["kn", "en", "hi", "te", "ta"].includes(lang) ? lang : "kn") as SupportedLang;
  const isKn = langKey === "kn";

  const tDict: Record<string, Record<string, string>> = {
    shastraHeader: {
      kn: "॥ ವರಾಹಮಿಹಿರ ಬೃಹತ್ ಸಂಹಿತಾ ಹಸ್ತ ಯೋಗ ಶಾಸ್ತ್ರ ॥",
      en: "॥ Classical Brihat Samhita Sacred Palm Yoga Shastra ॥",
      hi: "॥ वराहमिहिर बृहत्संहिता हस्त योग शास्त्र ॥",
      te: "॥ వరాహమిహిర బృహత్సంహిత హస్త యోగ శాస్త్రం ॥",
      ta: "॥ வராகமிஹிர பிருஹத் சம்ஹிதை ஹஸ்த யோக சாஸ்திரம் ॥"
    },
    title: {
      kn: "ಪರಮ ಪವಿತ್ರ ಸಾಮುದ್ರಿಕ ಯೋಗಗಳು & ಮಣಿಬಂಧ ರೇಖೆಗಳು",
      en: "Sacred Samudrika Yogas & Rascette Bracelets",
      hi: "परम पवित्र सामुद्रिक योग एवं मणिबंध रेखाएं",
      te: "పరమ పవిత్ర సాముద్రిక యోగాలు & మణిబంధ రేఖలు",
      ta: "புனித சாமுத்ரிக யோகங்கள் & மணிபந்த ரேகைகள்"
    },
    intro: {
      kn: "ಪೂರ್ವಜನ್ಮದ ತಪಸ್ಸು ಹಾಗೂ ಶುಭ ಕರ್ಮಗಳ ಫಲವಾಗಿ ಹಸ್ತದಲ್ಲಿ ಉದ್ಭವಿಸುವ ಅಪರೂಪದ ಯೋಗಗಳು, ಮಣಿಬಂಧ ರೇಖೆಗಳು ಹಾಗೂ ಧನ ಕೋಶ ತ್ರಿಕೋನಗಳು ಜೀವನದಲ್ಲಿ ಸಾರ್ವಭೌಮ ಯಶಸ್ಸನ್ನು ನೀಡುತ್ತವೆ.",
      en: "Classical Vedic treatises detail how rare yogas, wrist bracelets, and the Great Triangle signify accumulated past merit, sudden fortune, and sovereign destiny.",
      hi: "पूर्वजन्म के तप एवं शुभ कर्मों के फल स्वरूप हथेली में प्रकट होने वाले दुर्लभ योग, मणिबंध रेखाएं और धन त्रिकोण जीवन में संप्रभु सफलता प्रदान करते हैं।",
      te: "పూర్వజన్మ పుణ్యఫలంగా అరచేతిలో ఏర్పడే అరుదైన యోగాలు, మణిబంధ రేఖలు & ధన త్రికోణం జీవితంలో అఖండ విజయాన్ని ప్రసాదిస్తాయి.",
      ta: "பூர்வஜென்ம புண்ணிய பலனாக கையில் தோன்றும் அபூர்வ யோகங்கள், மணிபந்த ரேகைகள் மற்றும் தன திரிகோணம் வாழ்வில் மாபெரும் வெற்றியைத் தரும்."
    },
    yogasSectionTitle: {
      kn: "ಚತುರ್ವಿಧ ಮಹಾ ಹಸ್ತ ಯೋಗಗಳು (4 Sacred Palm Yogas):",
      en: "4 Major Vedic Palm Yogas:",
      hi: "चतुर्विध महा हस्त योग (४ पवित्र योग):",
      te: "చతుర్విధ మహా హస్త యోగాలు (4 పవిత్ర యోగాలు):",
      ta: "நான்கு மகா ஹஸ்த யோகங்கள்:"
    },
    formationLabel: {
      kn: "ರೇಖಾ ಸಂಯೋಜನೆ:",
      en: "Formation:",
      hi: "रेखा संयोजन:",
      te: "రేఖా కలయిక:",
      ta: "ரேகை அமைப்பு:"
    },
    fruitLabel: {
      kn: "ದೈವಿಕ ಫಲ (Vedic Impact):",
      en: "Vedic Impact & Fruit:",
      hi: "दैवीय फल (Vedic Impact):",
      te: "దైవిక ఫలితం:",
      ta: "தெய்வீக பலன்:"
    },
    auspiciousBadge: {
      kn: "ಶಾಸ್ತ್ರೋಕ್ತ",
      en: "Auspicious",
      hi: "शास्त्रोक्त",
      te: "శాస్త్రోక్తం",
      ta: "சுப யோகம்"
    },
    wristTitle: {
      kn: "ಮಣಿಬಂಧ ಚತುರ್ ರೇಖೆಗಳು (4 Wrist Bracelets - Rascettes):",
      en: "4 Wrist Bracelets (Manibandha Rascettes):",
      hi: "मणिबंध चतुर् रेखाएं (४ कलाई कंगन रेखाएं):",
      te: "మణిబంధ చతుర్ రేఖలు (4 కంకణ రేఖలు):",
      ta: "மணிபந்த நான்கு ரேகைகள் (மணிக்கட்டு ரேகைகள்):"
    },
    sacredMarksTitle: {
      kn: "ಹಸ್ತದಲ್ಲಿ ಗೋಚರಿಸಿದ ದೈವಿಕ ಸಾಮುದ್ರಿಕ ಚಿಹ್ನೆಗಳು:",
      en: "Divine Sacred Marks Observed in Palm:",
      hi: "हस्त में परिलक्षित पवित्र सामुद्रिक चिह्न:",
      te: "అరచేతిలో కనిపించే పవిత్ర సాముద్రిక చిహ్నాలు:",
      ta: "உள்ளங்கையில் காணப்படும் தெய்வீக சாமுத்ரிக குறிகள்:"
    },
    mountLocationLabel: {
      kn: "ಪರ್ವತ ಸ್ಥಾನ:",
      en: "Mount Location:",
      hi: "पर्वत स्थान:",
      te: "పర్వత స్థానం:",
      ta: "மேட்டின் அமைவிடம்:"
    },
    statusActive: {
      kn: "ಸಕ್ರಿಯವಾಗಿದೆ (Active)",
      en: "Active & Radiant",
      hi: "सक्रिय (Active)",
      te: "క్రియాశీలక (Active)",
      ta: "செயலில் உள்ளது (Active)"
    },
    statusRising: {
      kn: "ಉದಯಿಸುತ್ತಿದೆ (Rising)",
      en: "Rising Auspiciously",
      hi: "उदयमान (Rising)",
      te: "ఉదయిస్తున్నది (Rising)",
      ta: "வளர்ந்து வருகிறது (Rising)"
    },
    statusProminent: {
      kn: "ಸ್ಪಷ್ಟವಾಗಿದೆ (Prominent)",
      en: "Prominent & Clear",
      hi: "स्पष्ट (Prominent)",
      te: "స్పష్టంగా ఉంది (Prominent)",
      ta: "தெளிவாக உள்ளது (Prominent)"
    }
  };

  const getT = (k: string) => tDict[k]?.[langKey] || tDict[k]?.kn || "";

  // 1. Devotee Observed Sacred Marks (Dynamic from AI result if available, otherwise classical baseline)
  const observedMarks = (result?.specialMarks && result.specialMarks.length > 0)
    ? result.specialMarks.map((sm, i) => ({
        symbol: sm.mark?.en?.toLowerCase().includes("trishul") || sm.mark?.kn?.includes("ತ್ರಿಶೂಲ") ? "🔱" :
                sm.mark?.en?.toLowerCase().includes("fish") || sm.mark?.kn?.includes("ಮತ್ಸ್ಯ") ? "🐟" :
                sm.mark?.en?.toLowerCase().includes("cross") || sm.mark?.kn?.includes("ಕ್ರಾಸ್") ? "✨" :
                sm.mark?.en?.toLowerCase().includes("ring") || sm.mark?.kn?.includes("ಮುದ್ರಿಕಾ") ? "💍" :
                sm.mark?.en?.toLowerCase().includes("lotus") || sm.mark?.kn?.includes("ಪದ್ಮ") ? "🪷" :
                sm.mark?.en?.toLowerCase().includes("temple") || sm.mark?.kn?.includes("ಮಂದಿರ") ? "🏛️" : "🔯",
        name: sm.mark?.[langKey] || sm.mark?.en || sm.mark?.kn || `Sacred Mark #${i + 1}`,
        mount: sm.mountLocation?.[langKey] || sm.mountLocation?.en || sm.mountLocation?.kn || "Palm Mount",
        meaning: sm.meaning?.[langKey] || sm.meaning?.en || sm.meaning?.kn || "",
        status: i % 2 === 0 ? getT("statusActive") : getT("statusProminent")
      }))
    : [
        {
          symbol: "🔱",
          name: isKn ? "ಸಾಮುದ್ರಿಕ ತ್ರಿಶೂಲ ಯೋಗ (Trishula Yoga)" : langKey === "hi" ? "त्रिशूल योग (शिव कृपा)" : langKey === "te" ? "త్రిశూల యోగం" : langKey === "ta" ? "திரிசூல யோகம்" : "Trishula Yoga (Divine Trident)",
          mount: isKn ? "ಗುರು / ಸೂರ್ಯ ಪರ್ವತ" : langKey === "hi" ? "गुरु / सूर्य पर्वत" : langKey === "te" ? "గురు / సూర్య పర్వతం" : langKey === "ta" ? "குரு / சூரிய மேடு" : "Mount of Jupiter / Sun",
          meaning: isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಸಾಕ್ಷಾತ್ ರಕ್ಷಣೆ. ಸಮಾಜದಲ್ಲಿ ಪರಮೋಚ್ಚ ನಾಯಕತ್ವ, ಧಾರ್ಮಿಕ ಅಧಿಕಾರ ಹಾಗೂ ರಾಜ ಸನ್ಮಾನ." :
                   langKey === "hi" ? "श्री गोकर्ण महाबलेश्वर की साक्षात् रक्षा। समाज में सर्वोच्च नेतृत्व, धार्मिक अधिकार एवं राजकीय सम्मान।" :
                   langKey === "te" ? "గోకర్ణ మహాబలేశ్వరుని రక్షణ, సమాజంలో నాయకత్వం & గౌరవం." :
                   langKey === "ta" ? "கோகர்ண மகாபலேஸ்வரரின் பாதுகாப்பு, உயரிய தலைமை மற்றும் அரச மரியாதை." :
                   "Supreme protection from Sri Gokarna Mahabaleshwara. Grants administrative authority, public leadership, and royal honor.",
          status: getT("statusActive")
        },
        {
          symbol: "🐟",
          name: isKn ? "ಸಾಮುದ್ರಿಕ ಮತ್ಸ್ಯ ಯೋಗ (Matsya / Fish Sign)" : langKey === "hi" ? "मत्स्य योग (लक्ष्मी चिह्न)" : langKey === "te" ? "మత్స్య యోగం (ధన ప్రాప్తి)" : langKey === "ta" ? "மச்ச யோகம் (தன லாபம்)" : "Matsya Yoga (Auspicious Fish Sign)",
          mount: isKn ? "ಕೇತು / ಮಣಿಬಂಧ ತಳಭಾಗ" : langKey === "hi" ? "केतु / मणिबंध तल" : langKey === "te" ? "కేతు / మణిబంధ భాగం" : langKey === "ta" ? "கேது / மணிக்கட்டு பகுதி" : "Ketu Mount / Wrist Base",
          meaning: isKn ? "ಅನಿರೀಕ್ಷಿತ ಆಕಸ್ಮಿಕ ಧನಾಗಮನ, ವಿದೇಶ ಪ್ರವಾಸ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಜೀವನದ ದ್ವಿತೀಯಾರ್ಧದಲ್ಲಿ ಅಪಾರ ಸಂಪತ್ತು." :
                   langKey === "hi" ? "आकस्मिक विपुल धन लाभ, विदेश यात्रा, तीर्थाटन एवं जीवन के उत्तरार्ध में अकूत समृद्धि।" :
                   langKey === "te" ? "అనుకోని ధనలాభం, విదేశీ ప్రయాణం, తీర్థయాత్రలు & అపార సంపద." :
                   langKey === "ta" ? "எதிர்பாராத தன லாபம், வெளிநாட்டு பயணம், தீர்த்தயாத்திரை மற்றும் பெரும் செல்வம்." :
                   "Sudden unexpected windfalls, overseas journeys, sacred pilgrimages, and extraordinary late-life prosperity compounding.",
          status: getT("statusRising")
        },
        {
          symbol: "✨",
          name: isKn ? "ರಹಸ್ಯ ಸ್ವಸ್ತಿಕ (Mystic Cross of Intuition)" : langKey === "hi" ? "रहस्य स्वस्तिक (Mystic Cross)" : langKey === "te" ? "రహస్య క్రాస్ (అంతర్దృష్టి)" : langKey === "ta" ? "மறைபொருள் சிலுவை (உள்ளுணர்வு)" : "Mystic Cross (Quadrangle Intuition)",
          mount: isKn ? "ಹೃದಯ-ಬುದ್ಧಿ ರೇಖಾ ಮಧ್ಯ (Quadrangle)" : langKey === "hi" ? "हृदय व मस्तिष्क रेखा के मध्य" : langKey === "te" ? "హృదయ-మస్తిష్క రేఖల మధ్య" : langKey === "ta" ? "இதய-புத்தி ரேகைகளின் நடுவே" : "Between Heart and Head Lines (Quadrangle)",
          meaning: isKn ? "ಪ್ರಬಲ ೬ನೇ ಇಂದ್ರಿಯ, ಅತೀಂದ್ರಿಯ ಅಂತಃಸ್ಫೂರ್ತಿ, ಜ್ಯೋತಿಷ್ಯ-ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ ಹಾಗೂ ದೈವಿಕ ಮುನ್ನೋಟ." :
                   langKey === "hi" ? "प्रबल षष्ठ इन्द्रिय (Sixth Sense), गुप्त आध्यात्मिक सिद्धि, ज्योतिष प्रतिभा एवं दैवीय दूरदृष्टि।" :
                   langKey === "te" ? "తీవ్రమైన 6వ ఇంద్రియ శక్తి, జ్యోతిష్య-ఆధ్యాత్మిక సిద్ధి & భవిష్యత్ దృష్టి." :
                   langKey === "ta" ? "ஆறாவது அறிவு, ஆன்மீக சித்தி, ஜோதிட ஞானம் மற்றும் தீர்க்கதரிசனம்." :
                   "Sharp sixth sense intuition, occult-spiritual mastery, predictive astrological acumen, and prophetic vision.",
          status: getT("statusActive")
        },
        {
          symbol: "💍",
          name: isKn ? "ಗುರು ಮುದ್ರಿಕಾ / ಸಾಲೋಮನ್ ರಿಂಗ್ (Ring of Solomon)" : langKey === "hi" ? "गुरु मुद्रिका (रिंग ऑफ सोलोमन)" : langKey === "te" ? "గురు ముద్రిక (సాలమన్ రింగ్)" : langKey === "ta" ? "குரு முத்ரிகா" : "Ring of Solomon (Guru Mudrika)",
          mount: isKn ? "ಗುರು ಪರ್ವತ (Mount of Jupiter)" : langKey === "hi" ? "गुरु पर्वत" : langKey === "te" ? "గురు పర్వతం" : langKey === "ta" ? "குரு மேடு" : "Mount of Jupiter",
          meaning: isKn ? "ಸಹಜ ಮನೋವೈಜ್ಞಾನಿಕ ಗ್ರಹಣ ಶಕ್ತಿ, ಗುರು ಪದವಿ, ಬೋಧನೆ ಹಾಗೂ ನ್ಯಾಯಪರ ಸಮಾಜ ಗೌರವ." :
                   langKey === "hi" ? "स्वाभाविक मनोवैज्ञानिक समझ, गुरु पदवी, शिक्षण एवं न्यायप्रिय सामाजिक प्रतिष्ठा।" :
                   langKey === "te" ? "సహజ మనస్తత్వ గ్రాహక శక్తి, గురు పదవి, బోధన & సమాజంలో గౌరవం." :
                   langKey === "ta" ? "உளவியல் புரிதல், ஆசிரியர் பதவி, போதனை மற்றும் சமூக மரியாதை." :
                   "Natural psychological depth, mentorship status, scholastic teaching, and esteemed ethical standing.",
          status: getT("statusProminent")
        }
      ];

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none filter drop-shadow">👑</span>
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
              {getT("shastraHeader")}
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {getT("title")}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {getT("intro")}
            </p>
          </div>
        </div>
      </Card>

      {/* 4 Sacred Vedic Hastarekha Yogas */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
            <span>🪷</span>
            <span>{getT("yogasSectionTitle")}</span>
          </h4>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
            Brihat Samhita
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VEDIC_HASTAREKHA_YOGAS_L5.map((y) => (
            <div
              key={y.id}
              className="rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 p-4 shadow-sm space-y-2 hover:border-amber-400 transition"
            >
              <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                <span className="font-serif text-sm font-bold text-amber-950">
                  {y.name[langKey] || y.name.kn}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  {getT("auspiciousBadge")}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-800">
                <div>
                  <strong className="text-amber-900">{getT("formationLabel")}</strong>{" "}
                  <span className="font-medium text-slate-900 leading-relaxed block pt-0.5">
                    {y.formation[langKey] || y.formation.kn}
                  </span>
                </div>
                <div className="rounded-xl bg-amber-100/60 p-2.5 border border-amber-200 mt-1">
                  <strong className="text-amber-950 block text-[11px] mb-0.5">
                    🪔 {getT("fruitLabel")}
                  </strong>
                  <span className="text-amber-900 font-medium leading-relaxed block">
                    {y.fruit[langKey] || y.fruit.kn}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Manibandha Wrist Bracelets (Rascettes) */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
            <span>✨</span>
            <span>{getT("wristTitle")}</span>
          </h4>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
            Garuda Purana
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {VEDIC_MANIBANDHA_WRIST_BRACELETS.map((b) => (
            <div key={b.bracelet} className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span>{isKn ? b.nameKn : b.nameEn}</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-extrabold">
                  #{b.bracelet}
                </span>
              </div>
              <p className="text-amber-900 font-medium leading-relaxed">
                {isKn ? b.meaningKn : b.meaningEn}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Great Triangle & Finger Proportions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Great Triangle */}
        <Card className="border border-amber-300 bg-gradient-to-br from-amber-50/90 to-white p-4 shadow-sm space-y-2">
          <div className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-1.5 flex items-center gap-2">
            <span>🔺</span>
            <span>{isKn ? VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.nameKn : VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.nameEn}</span>
          </div>
          <p className="text-xs text-amber-900 font-medium leading-relaxed">
            {isKn ? VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.meaningKn : VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.meaningEn}
          </p>
        </Card>

        {/* Little Finger Mercury Rule */}
        <Card className="border border-amber-300 bg-gradient-to-br from-amber-50/90 to-white p-4 shadow-sm space-y-2">
          <div className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-1.5 flex items-center gap-2">
            <span>💎</span>
            <span>{isKn ? VEDIC_ANGULI_FINGER_PROPORTIONS.littleFingerMercury.nameKn : VEDIC_ANGULI_FINGER_PROPORTIONS.littleFingerMercury.nameEn}</span>
          </div>
          <p className="text-xs text-amber-900 font-medium leading-relaxed">
            {isKn ? VEDIC_ANGULI_FINGER_PROPORTIONS.littleFingerMercury.meaningKn : VEDIC_ANGULI_FINGER_PROPORTIONS.littleFingerMercury.meaningEn}
          </p>
        </Card>
      </div>

      {/* Sacred Marks Grid */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
            <span>🔯</span>
            <span>{getT("sacredMarksTitle")}</span>
          </h4>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
            Samudrika Lakshana
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {observedMarks.map((y, idx) => (
            <div
              key={idx}
              className="rounded-2xl border-2 border-amber-200/80 bg-white hover:border-amber-400 p-4 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl select-none">{y.symbol}</span>
                  <span className="font-serif text-sm font-bold text-amber-950">
                    {y.name}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  {y.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-amber-900 font-bold">{getT("mountLocationLabel")}</span>
                  <span className="font-semibold text-amber-950">{y.mount}</span>
                </div>

                <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200 mt-2">
                  <span className="font-bold text-amber-950 block mb-0.5">
                    🪔 {getT("fruitLabel")}
                  </span>
                  <span className="text-amber-900 font-medium leading-relaxed block">{y.meaning}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SamudrikaYogasTab;
