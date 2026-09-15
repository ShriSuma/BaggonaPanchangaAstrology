/**
 * Gokarna Pitru Raksha & Vamsha Vriddhi Kavacha Engine
 * (ಗೋಕರ್ಣ ಪಿತೃ ರಕ್ಷಾ & ವಂಶ ವೃದ್ಧಿ ಕವಚ ಎಂಜಿನ್)
 * 
 * Evaluates ancestral blessings and protective shield generated from
 * Gokarna Kshetra Tarpana, Narayana Bali, and Mahabaleshwara Atmalinga worship.
 * Analyzes the 9th House (Pitru Sthana), Surya (Pitru Karaka), and Guru (Vamsha Raksha).
 */

import type { KundliOutput, PlanetPosition } from "../../core/AstroTypes";
import type { SevaLang } from "./sevaLocale";

export interface GokarnaPitruRakshaInfo {
  score: number;
  badgeTitle: string;
  statusText: string;
  pitruDevata: string;
  kavachaMantra: string;
  dailySadhana: string;
  vamshaProtectionText: string;
}

export function calculateGokarnaPitruRaksha(
  kundli: KundliOutput | null,
  lang: SevaLang = "kn"
): GokarnaPitruRakshaInfo {
  const code = lang || "kn";

  // Find 9th house, Sun, and Jupiter
  const sun = kundli?.planets?.find((p: PlanetPosition) => p.name === "Sun");
  const jupiter = kundli?.planets?.find((p: PlanetPosition) => p.name === "Jupiter");

  const sunHouse = sun?.house || 9;
  const jupiterHouse = jupiter?.house || 5;

  // Base score 86 to 98 based on favorable planetary alignments
  let score = 88;
  if ([1, 4, 5, 7, 9, 10, 11].includes(sunHouse)) score += 4;
  if ([1, 2, 5, 7, 9, 11].includes(jupiterHouse)) score += 4;
  if (score > 98) score = 98;

  if (code === "kn") {
    return {
      score,
      badgeTitle: "ಗೋಕರ್ಣ ಪಿತೃ ರಕ್ಷಾ & ವಂಶ ವೃದ್ಧಿ ಕವಚ",
      statusText: "ಆತ್ಮಲಿಂಗ & ಪಿತೃ ದೇವತಾ ಅಭಯ ಕವಚ ಸಕ್ರಿಯವಾಗಿದೆ ✓",
      pitruDevata: "ಶ್ರೀ ಅರ್ಯಮಾ & ಗೋಕರ್ಣ ಪಿತೃ ದೇವತಾ ಗಣ",
      kavachaMantra: "ॐ ಪಿತೃದೇವತಾಭ್ಯೋ ನಮಃ · ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪಾದಾರವಿಂದಂ ಶರಣಂ ಪ್ರಪದ್ಯೇ",
      dailySadhana: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ಸೂರ್ಯನಿಗೆ ಜಲಾರ್ಘ್ಯ ಅರ್ಪಿಸಿ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸಿ.",
      vamshaProtectionText: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಲ್ಲಿಸಿದ ಪವಿತ್ರ ಸಂಕಲ್ಪ ಹಾಗೂ ತಿಲತರ್ಪಣದ ಫಲವಾಗಿ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಪಿತೃ ದೇವತೆಗಳ ದಿವ್ಯ ಆಶೀರ್ವಾದ ಸದಾ ರಕ್ಷೆಯಾಗಿರುತ್ತದೆ."
    };
  }

  if (code === "hi") {
    return {
      score,
      badgeTitle: "गोकर्ण पितृ रक्षा एवं वंश वृद्धि कवच",
      statusText: "आत्मलिंग व पितृ देवता अभय कवच सक्रिय है ✓",
      pitruDevata: "श्री अर्यमा एवं गोकर्ण पितृ देवता गण",
      kavachaMantra: "ॐ पितृदेवताभ्यो नमः · श्री महाबलेश्वर पादारविन्दं शरणं प्रपद्ये",
      dailySadhana: "प्रतिदिन प्रातः तांबे के पात्र से सूर्य को जलार्घ्य दें एवं गायत्री मंत्र जपें।",
      vamshaProtectionText: "गोकर्ण महाबलेश्वर क्षेत्र में किए गए संकल्प व तर्पण से आपके कुल को पितृ देवताओं का पूर्ण आशीर्वाद व रक्षा प्राप्त है।"
    };
  }

  if (code === "te") {
    return {
      score,
      badgeTitle: "గోకర్ణ పితృ రక్ష & వంశ వృద్ధి కవచం",
      statusText: "ఆత్మలింగ & పితృ దేవతా అభయ కవచం సక్రియం ✓",
      pitruDevata: "శ్రీ అర్యమా & గోకర్ణ పితృ దేవతలు",
      kavachaMantra: "ఓం పితృదేవతాభ్యో నమః · శ్రీ మహాబలేశ్వర పాదారవిందం శరణం ప్రపద్యే",
      dailySadhana: "రోజూ ఉదయం సూర్యునికి జలార్ఘ్యం సమర్పించి గాయత్రీ మంత్రం జపించండి.",
      vamshaProtectionText: "గోకర్ణ క్షేత్రంలో సమర్పించిన తర్పణ సంకల్పం వల్ల మీ వంశానికి పితృ దేవతల రక్షణ లభిస్తుంది."
    };
  }

  if (code === "ta") {
    return {
      score,
      badgeTitle: "கோகர்ண பித்ரு ரக்ஷா & வம்ச விருத்தி கவசம்",
      statusText: "ஆத்மலிங்க & பித்ரு தேவதை பாதுகாப்பு கவசம் செயலில் உள்ளது ✓",
      pitruDevata: "ஸ்ரீ அர்யமா & கோகர்ண பித்ரு கணங்கள்",
      kavachaMantra: "ஓம் பித்ருதேவதாப்யோ நமஹ · ஸ்ரீ மகாபலேஸ்வரர் சரணம்",
      dailySadhana: "தினமும் அதிகாலை சூரியனுக்கு நீரார்க்கியம் சமர்ப்பித்து காயத்ரி மந்திரம் ஜெபிக்கவும்.",
      vamshaProtectionText: "கோகர்ண தலத்தில் செய்த வழிபாட்டின் மூலம் உங்கள் குடும்பத்திற்கு முன்னோர்களின் அருள் எப்போதும் பாதுகாப்பாக இருக்கும்."
    };
  }

  return {
    score,
    badgeTitle: "Gokarna Ancestral Shield & Lineage Blessing",
    statusText: "Atmalinga & Ancestral Protective Shield Active ✓",
    pitruDevata: "Lord Aryama & Gokarna Ancestral Host",
    kavachaMantra: "Om Pitru Devatabhyo Namah · Sri Mahabaleshwaram Sharanam Prapadye",
    dailySadhana: "Offer copper-vessel water Arghya to Lord Surya at sunrise and chant Gayatri mantra.",
    vamshaProtectionText: "The sacred sankalpa offered at Gokarna Kshetra invokes perpetual divine grace and protection for your family lineage."
  };
}

export interface ShraddhaTithiStatus {
  hasRegisteredTithi: boolean;
  tithiLabel: string;
  isToday: boolean;
  isUpcomingIn3Days: boolean;
  daysRemaining: number;
  alertText: string;
}

/**
 * Checks devotee's stored parents' death anniversary (Shraddha) tithi
 * against current day's Panchanga tithi.
 */
export function evaluateShraddhaTithiStatus(
  registeredTithiStr?: string,
  todayTithiName?: string,
  lang: SevaLang = "kn"
): ShraddhaTithiStatus {
  const code = lang || "kn";

  if (!registeredTithiStr || registeredTithiStr.trim().length === 0) {
    return {
      hasRegisteredTithi: false,
      tithiLabel: "",
      isToday: false,
      isUpcomingIn3Days: false,
      daysRemaining: -1,
      alertText: ""
    };
  }

  const cleanReg = registeredTithiStr.trim().toLowerCase();
  const cleanToday = (todayTithiName || "").trim().toLowerCase();

  const isToday = cleanToday.length > 0 && (
    cleanToday.includes(cleanReg) || cleanReg.includes(cleanToday)
  );

  let alertText = "";
  if (isToday) {
    if (code === "kn") {
      alertText = "🙏 ಇಂದು ಪೋಷಕರ ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧ ತಿಥಿ - ಪಿತೃ ತರ್ಪಣ, ತಿಲ-ಜಲ ಅರ್ಪಣೆ ಹಾಗೂ ಗೋ-ದಾನ/ಬ್ರಾಹ್ಮಣ ಭೋಜನಕ್ಕೆ ಪರಮ ಪವಿತ್ರ ದಿನ.";
    } else if (code === "hi") {
      alertText = "🙏 आज माता-पिता की वार्षिक श्राद्ध तिथि है - पितृ तर्पण एवं ब्राह्मण भोजन हेतु अत्यंत पवित्र दिन।";
    } else if (code === "te") {
      alertText = "🙏 నేడు తల్లిదండ్రుల వార్షిక శ్రాద్ధ తిథి - పితృ తర్పణ మరియు దానములకు పవిత్ర దినం.";
    } else if (code === "ta") {
      alertText = "🙏 இன்று பெற்றோரின் திதி நாள் - பித்ரு தர்ப்பணம் மற்றும் தானத்திற்கு உகந்த நாள்.";
    } else {
      alertText = "🙏 Today is the sacred Annual Shraddha Tithi of Parents - ideal for Tarpana, charity and prayers.";
    }
  }

  return {
    hasRegisteredTithi: true,
    tithiLabel: registeredTithiStr,
    isToday,
    isUpcomingIn3Days: false,
    daysRemaining: isToday ? 0 : 30,
    alertText
  };
}
