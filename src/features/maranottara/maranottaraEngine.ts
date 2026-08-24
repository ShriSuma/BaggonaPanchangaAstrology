import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";

export type MasikaDurationYears = 1 | 2 | 3 | 4 | 5;

export type MaranottaraInput = {
  personName: string;
  demiseDate: string; // YYYY-MM-DD
  demiseTime?: string; // HH:mm
  location?: string;
  yearsCount: MasikaDurationYears;
  lang?: string;
};

export type MasikaScheduleItem = {
  monthIndex: number;
  masikaName: Record<string, string>;
  tithiName: Record<string, string>;
  gregorianDate: string; // Formatted YYYY-MM-DD
  formattedDateStr: Record<string, string>; // e.g. "24 Sep 2026"
  dayOfWeek: Record<string, string>;
  paksha: Record<string, string>;
  isVarshikaShraddha: boolean;
  ritualNotes: Record<string, string>;
};

export type PoojaRemedyItem = {
  title: Record<string, string>;
  description: Record<string, string>;
  danaItems: Record<string, string>;
};

export type DoshaAnalysisResult = {
  hasPanchakaDosha: boolean;
  panchakaType?: Record<string, string>;
  hasNakshatraDosha: boolean;
  nakshatraDoshaType?: Record<string, string>;
  hasSandhyaRatriDosha: boolean;
  doshaSummary: Record<string, string>;
  recommendedPoojas: PoojaRemedyItem[];
};

export type MaranottaraResult = {
  personName: string;
  demiseDate: string;
  demiseTime?: string;
  location: string;
  yearsCount: MasikaDurationYears;
  demiseTithi: Record<string, string>;
  demiseNakshatra: Record<string, string>;
  demisePaksha: Record<string, string>;
  masikaSchedule: MasikaScheduleItem[];
  doshaAnalysis: DoshaAnalysisResult;
  aiConsolationText?: string;
  generatedAt: string;
};

const TITHI_NAMES_KN: Record<number, string> = {
  1: "ಪ್ರಥಮಾ (Prathama)",
  2: "ದ್ವಿತೀಯಾ (Dwitiya)",
  3: "ತೃತೀಯಾ (Tritiya)",
  4: "ಚತುರ್ಥಿ (Chaturthi)",
  5: "ಪಂಚಮಿ (Panchami)",
  6: "ಷಷ್ಠಿ (Shashti)",
  7: "ಸಪ್ತಮಿ (Saptami)",
  8: "ಅಷ್ಟಮಿ (Ashtami)",
  9: "ನವಮಿ (Navami)",
  10: "ದಶಮಿ (Dashami)",
  11: "ಏಕಾದಶಿ (Ekadashi)",
  12: "ದ್ವಾದಶಿ (Dwadashi)",
  13: "ತ್ರಯೋದಶಿ (Trayodashi)",
  14: "ಚತುರ್ದಶಿ (Chaturdashi)",
  15: "ಪೂರ್ಣಿಮೆ / ಅಮಾವಾಸ್ಯೆ (Full/New Moon)"
};

const WEEKDAYS_5LANG: Record<number, Record<string, string>> = {
  0: { kn: "ಭಾನುವಾರ", en: "Sunday", hi: "रविवार", te: "ఆదివారం", ta: "ஞாயிறு" },
  1: { kn: "ಸೋಮವಾರ", en: "Monday", hi: "सोमवार", te: "సోమవారం", ta: "திங்கள்" },
  2: { kn: "ಮಂಗಳವಾರ", en: "Tuesday", hi: "मंगलवार", te: "మంగళవారం", ta: "செவ்வாய்" },
  3: { kn: "ಬುಧವಾರ", en: "Wednesday", hi: "बुधवार", te: "బుధవారం", ta: "புதன்" },
  4: { kn: "ಗುರುವಾರ", en: "Thursday", hi: "गुरुवार", te: "గురువారం", ta: "வியாழன்" },
  5: { kn: "ಶುಕ್ರವಾರ", en: "Friday", hi: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளி" },
  6: { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", te: "శనివారం", ta: "சனி" }
};

/** Format Gregorian Date to clean display string */
function formatDateDisplay(d: Date, lang: string = "kn"): string {
  const monthsKn = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
  const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  if (lang === "kn") {
    return `${day} ${monthsKn[monthIdx]} ${year}`;
  }
  return `${day} ${monthsEn[monthIdx]} ${year}`;
}

/** Execute complete Maranottara & Masika Tithi Calculations */
export function executeMaranottaraCalculation(input: MaranottaraInput): MaranottaraResult {
  const { personName, demiseDate, demiseTime, location = "Gokarna, Karnataka", yearsCount = 1 } = input;
  
  const demiseD = new Date(demiseDate + (demiseTime ? `T${demiseTime}` : "T12:00:00"));
  
  // Calculate demise date astrological parameters using TraditionalBaggonaEngine
  const engineResult = calculateTraditionalBaggona(
    demiseDate,
    demiseTime || "12:00",
    14.5479,
    74.3188,
    "lahiri"
  );

  const demiseTithiNum = engineResult?.tithiGhati || 2;
  const tithiNameStr = engineResult?.tithiKn || "ದ್ವಿತೀಯಾ";
  const nakshatraNameStr = engineResult?.moonNakshatraKn || "ಅನುರಾಧಾ";
  const pakshaStr = engineResult?.pakshaKn || "ಶುಕ್ಲ ಪಕ್ಷ";

  const demiseTithiObj: Record<string, string> = {
    kn: tithiNameStr,
    en: engineResult?.tithi || "Tithi",
    hi: tithiNameStr,
    te: tithiNameStr,
    ta: tithiNameStr
  };

  const demiseNakshatraObj: Record<string, string> = {
    kn: nakshatraNameStr,
    en: engineResult?.moonNakshatra || "Nakshatra",
    hi: nakshatraNameStr,
    te: nakshatraNameStr,
    ta: nakshatraNameStr
  };

  const demisePakshaObj: Record<string, string> = {
    kn: pakshaStr,
    en: engineResult?.paksha || "Shukla Paksha",
    hi: pakshaStr,
    te: pakshaStr,
    ta: pakshaStr
  };

  // Generate Monthly Masika Dates for chosen duration (12, 24, 36, 48, 60 months)
  const totalMonths = yearsCount * 12;
  const masikaSchedule: MasikaScheduleItem[] = [];

  const baseTime = demiseD.getTime();
  const approxSynodicMonthMs = 29.530588 * 24 * 60 * 60 * 1000; // ~29.53 days per lunar month

  for (let m = 1; m <= totalMonths; m++) {
    // Target date estimate for m-th lunar month
    const targetMs = baseTime + m * approxSynodicMonthMs;
    const calcDate = new Date(targetMs);
    
    // Day of week
    const dayOfWeekIdx = calcDate.getDay();
    const dayOfWeekObj = WEEKDAYS_5LANG[dayOfWeekIdx] || WEEKDAYS_5LANG[0];

    const isVarshika = m % 12 === 0;
    const yearNumber = Math.ceil(m / 12);
    const monthInYear = m % 12 === 0 ? 12 : m % 12;

    let masikaTitleKn = `${m} ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ`;
    let masikaTitleEn = `Month ${m} Masika Shraddha`;

    if (monthInYear === 1) {
      masikaTitleKn = `೧ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ (ಪ್ರಥಮ ಮಾಸಿಕ)`;
      masikaTitleEn = `1st Month Masika (Prathama Masika)`;
    } else if (monthInYear === 3) {
      masikaTitleKn = `೩ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ (ತ್ರೈಮಾಸಿಕ)`;
      masikaTitleEn = `3rd Month Masika (Traimasika)`;
    } else if (monthInYear === 6) {
      masikaTitleKn = `೬ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ (ಷಣ್ಮಾಸಿಕ)`;
      masikaTitleEn = `6th Month Masika (Shanmasika)`;
    } else if (isVarshika) {
      masikaTitleKn = `🌟 ${yearNumber} ನೇ ವರ್ಷದ ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧ (Varshika Shraddha)`;
      masikaTitleEn = `🌟 Year ${yearNumber} Varshika Shraddha`;
    }

    const ritualNotesObj: Record<string, string> = {
      kn: isVarshika
        ? `ಮೃತರ ಪುಣ್ಯತಿಥಿ · ವಾರ್ಷಿಕ ಮಹಾ ಶ್ರಾದ್ಧ, ಸಪಿಂಡೀಕರಣ & ಬ್ರಾಹ್ಮಣ ಭೋಜನ.`
        : `ಮಾಸಿಕ ತರ್ಪಣ & ದಾನ ಧರ್ಮ ಕರ್ಮ.`,
      en: isVarshika
        ? `Annual Sacred Varshika Shraddha, Pinda Pradana & Brahmana Bhojana.`
        : `Monthly Pitru Tarpana & Sacred Offerings.`
    };

    masikaSchedule.push({
      monthIndex: m,
      masikaName: { kn: masikaTitleKn, en: masikaTitleEn, hi: masikaTitleKn, te: masikaTitleKn, ta: masikaTitleKn },
      tithiName: demiseTithiObj,
      gregorianDate: calcDate.toISOString().split("T")[0],
      formattedDateStr: {
        kn: formatDateDisplay(calcDate, "kn"),
        en: formatDateDisplay(calcDate, "en")
      },
      dayOfWeek: dayOfWeekObj,
      paksha: demisePakshaObj,
      isVarshikaShraddha: isVarshika,
      ritualNotes: ritualNotesObj
    });
  }

  // Calculate Demise Time Dosha & Recommended Gokarna Shanti Poojas
  const hour = demiseTime ? parseInt(demiseTime.split(":")[0], 10) : 12;
  const isNight = hour < 6 || hour >= 18;

  // Nakshatra Panchaka Dosha Check (Dhanishta, Shatabhisha, Purvabhadra, Uttarabhadra, Revati)
  const nakshatraNameLower = nakshatraNameStr.toLowerCase();
  const isTripadaNakshatra =
    nakshatraNameLower.includes("dhanishta") ||
    nakshatraNameLower.includes("shatabhisha") ||
    nakshatraNameLower.includes("bhadra") ||
    nakshatraNameLower.includes("revati") ||
    nakshatraNameLower.includes("ಧನಿಷ್ಠಾ") ||
    nakshatraNameLower.includes("ಶತಭಿಷಾ") ||
    nakshatraNameLower.includes("ರೇವತಿ");

  const hasPanchaka = isTripadaNakshatra || demiseTithiNum === 4 || demiseTithiNum === 9 || demiseTithiNum === 14;

  const doshaSummaryObj: Record<string, string> = {
    kn: hasPanchaka
      ? `ಮರಣ ಹೊಂದಿದ ನಕ್ಷತ್ರ/ತಿಥಿಯ ಅನುಸಾರ 'ಪಂಚಕ ನಕ್ಷತ್ರ ದೋಷ' ಸೂಚಿತವಾಗಿದೆ. ಕುಲಶ್ರೇಯಸ್ಸಿಗೆ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಪಂಚ ಶಾಂತಿ ಪೂಜೆ ಅವಶ್ಯಕ.`
      : `ಮರಣ ಸಮಯವು ಸಾಮಾನ್ಯ ಸನ್ಮಂಗಲಕರವಾಗಿದೆ. ನಿಯಮಿತ ಮಾಸಿಕ ಶ್ರಾದ್ಧ ಹಾಗೂ ಪಿಂಡ ಪ್ರದಾನ ಕರ್ಮಗಳನ್ನು ನೆರವೇರಿಸಿ.`,
    en: hasPanchaka
      ? `Panchaka Nakshatra Dosha indicated based on demise timing. Gokarna Pancha Shanti Pooja recommended for family peace.`
      : `No severe demise doshas. Perform regular monthly Masika & Pitru Tarpana rituals diligently.`
  };

  const poojas: PoojaRemedyItem[] = [
    {
      title: { kn: "🪔 ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪಂಚಕ ಶಾಂತಿ & ಸರ್ಪಾಹುತಿ", en: "Gokarna Panchaka Shanti & Sarpahuti" },
      description: {
        kn: "ಮರಣ ದೋಷ ನಿವಾರಣೆಗಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ತ್ರಿಪಾದ/ಪಂಚಕ ಶಾಂತಿ ಹೋಮ ಹಾಗೂ ರುದ್ರಾಭಿಷೇಕ.",
        en: "Panchaka Shanti Homa & Rudrabhishekam at Gokarna Mahabaleshwara for soul liberation."
      },
      danaItems: { kn: "ತಿಲ ದಾನ, ವಸ್ತ್ರ ದಾನ, ತಾಮ್ರ ಪಾತ್ರೆ & ದಕ್ಷಿಣೆ", en: "Sesame (Tila), Cloth, Copper Vessel & Dakshina" }
    },
    {
      title: { kn: "🥛 ಪ್ರಥಮ ವರ್ಷ ತಿಲ ತರ್ಪಣ & ಬ್ರಾಹ್ಮಣ ಭೋಜನ", en: "First Year Tila Tarpana & Brahmana Bhojana" },
      description: {
        kn: "ಪ್ರತಿಯೊಂದು ಮಾಸಿಕ ತಿಥಿಯಂದು ಬೆಳಿಗ್ಗೆ ಸೂರ್ಯೋದಯ ನಂತರ ಪಿತೃಗಳಿಗೆ ಎಳ್ಳು-ನೀರಿನ ತರ್ಪಣ ನೀಡಬೇಕು.",
        en: "Offer Tila (Sesame) water tarpana to ancestors on every monthly Masika date after sunrise."
      },
      danaItems: { kn: "ಅನ್ನದಾನ, ಜಲಪಾತ್ರೆ ದಾನ", en: "Food donation & Sacred Water Vessel" }
    }
  ];

  const doshaAnalysis: DoshaAnalysisResult = {
    hasPanchakaDosha: hasPanchaka,
    panchakaType: { kn: hasPanchaka ? "ತ್ರಿಪಾದ / ಪಂಚಕ ಮರಣ ದೋಷ" : "ಸಾಮಾನ್ಯ", en: hasPanchaka ? "Tripada / Panchaka Demise Dosha" : "Normal" },
    hasNakshatraDosha: isTripadaNakshatra,
    nakshatraDoshaType: { kn: isTripadaNakshatra ? `${nakshatraNameStr} (ತ್ರಿಪಾದ ನಕ್ಷತ್ರ)` : "ಸಾಮಾನ್ಯ", en: isTripadaNakshatra ? `${nakshatraNameStr} (Tripada)` : "Normal" },
    hasSandhyaRatriDosha: isNight,
    doshaSummary: doshaSummaryObj,
    recommendedPoojas: poojas
  };

  return {
    personName,
    demiseDate,
    demiseTime,
    location,
    yearsCount,
    demiseTithi: demiseTithiObj,
    demiseNakshatra: demiseNakshatraObj,
    demisePaksha: demisePakshaObj,
    masikaSchedule,
    doshaAnalysis,
    generatedAt: new Date().toLocaleString()
  };
}

/** Generate AI Spiritual Consolation & Vedic Guidance using Gemini 3.5 Flash Lite */
export async function generateMaranottaraAIConsolation(
  result: MaranottaraResult,
  lang: string = "kn",
  apiKey?: string
): Promise<string> {
  const langCode = (lang || "kn").slice(0, 2);

  const fallbackText: Record<string, string> = {
    kn: `ಓಂ ಶಾಂತಿಃ. ದಿವಂಗತ ${result.personName} ಅವರ ದಿವ್ಯಾತ್ಮಕ್ಕೆ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಿಂದ ಸದ್ಗತಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.\n\nಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸೂಚಿಸಲಾದ ${result.yearsCount} ವರ್ಷಗಳ ಮಾಸಿಕ ಶ್ರಾದ್ಧ ಹಾಗೂ ಪಿತೃ ತರ್ಪಣ ದಿನಾಂಕಗಳಲ್ಲಿ ಭಕ್ತಿಯಿಂದ ಎಳ್ಳು-ನೀರು ತರ್ಪಣ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಭೋಜನ ನೆರವೇರಿಸುವುದರಿಂದ ಪಿತೃ ದೇವತೆಗಳು ತೃಪ್ತರಾಗಿ ಕುಲಕ್ಕೆ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ಸಂತಾನ ಸಮೃದ್ಧಿಯನ್ನು ಕರುಣಿಸುತ್ತಾರೆ.`,
    en: `Om Shanti. May the departed soul of ${result.personName} attain eternal peace and Moksha at the feet of Sri Gokarna Mahabaleshwara.\n\nPerforming the calculated ${result.yearsCount}-year Masika Shraddha & Pitru Tarpana rituals with devotion brings deep ancestral blessings, family peace, and spiritual harmony.`,
    hi: `ॐ शांति। गोकर्ण महाबलेश्वर स्वामी के चरणों में दिवंगत ${result.personName} की आत्मा की शांति हेतु प्रार्थना।`,
    te: `ఓం శాంతి. శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి సన్నిధిలో ${result.personName} దివ్యాత్మకు సద్గతి కలుగుగాక.`,
    ta: `ஓம் சாந்தி. ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் பாதங்களில் ${result.personName} ஆத்மா சாந்தி அடையட்டும்.`
  };

  if (!apiKey) {
    return fallbackText[langCode] || fallbackText.en;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    const prompt = `
You are Sri Shreeram Pandit, Chief Priest of Gokarna Mahabaleshwara Kshetra.
Provide a sacred, comforting, authentic Vedic spiritual consolation and guidance message for the family of the deceased person:
- Deceased Name: ${result.personName}
- Demise Date: ${result.demiseDate} (Tithi: ${result.demiseTithi[langCode] || result.demiseTithi.kn})
- Demise Nakshatra: ${result.demiseNakshatra[langCode] || result.demiseNakshatra.kn}
- Scheduled Masika Duration: ${result.yearsCount} Year(s)

Guidelines:
1. Write with deep dignity, compassion, and authentic Vedic wisdom.
2. Explain the spiritual importance of performing monthly Masika Shraddha, Pinda Pradana, and Tila Tarpana for ancestral liberation (Pitru Rinam).
3. Write EXCLUSIVELY in the requested script: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
4. Do NOT use Latin/English script words mixed into native language.
`;

    const res = await model.generateContent(prompt);
    const text = (await res.response).text();
    return text || fallbackText[langCode] || fallbackText.en;
  } catch (err) {
    console.error("Gemini Maranottara AI error:", err);
    return fallbackText[langCode] || fallbackText.en;
  }
}
