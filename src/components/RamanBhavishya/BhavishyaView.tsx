import { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { usePredictionEngine } from "./usePredictionEngine";
import type { TranslatedPrediction } from "./usePredictionEngine";
import { PdfTemplate, PdfTranslations, PremiumData } from "./PdfTemplate";
import { SummaryPdfTemplate, type SummaryPdfData } from "./SummaryPdfTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";
import { useAppStore } from "../../stores/appStore";
import { translateText } from "../../utils/translator";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { generateMasterPrediction } from "../../core/MasterPredictionEngine";
import { detectAffairIndicators } from "../../core/layers/NatalLayer";
import { askGemini } from "../../core/GeminiEngine";
import { getTransitsForDate } from "../../core/BaggonaPredictionEngine";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";
import {
  analyzeKundali,
  buildDynamicMarriageFallback,
  buildDynamicChildrenFallback,
  buildDynamicCareerFallback,
  buildDynamicWealthFallback,
  buildDynamicHealthFallback,
  buildDynamicChildEducationFallback,
  buildDynamicChildActivitiesFallback,
  buildDynamicChildFoundationFallback,
  buildDynamicChildFamilyFallback,
  buildDynamicChildPediatricHealthFallback,
  buildDynamicCharacteristicsFallback,
  buildDynamicDarkSecretFallback,
  buildDynamicCurrentPhaseFallback,
  buildDynamicGocharaFallback,
  buildDynamicSummaryFallback
} from "../../features/premiumPdf/dynamicBhavishyaEngine";
import type { PlanetName } from "../../core/AstroTypes";
import { PremiumPDFTemplate } from "../pdf/PremiumPDFTemplate";
import { generatePDFFromElement } from "../../utils/pdfGenerator";
import { WEEKDAY_L5 } from "../../features/seva/sevaLocale";
import {
  cleanEnglishFromRegionalText,
  type GrahaKey,
  tp,
  pick,
  GRAHA_L5,
  RASHI_L5,
  NAKSHATRA_L5,
  formatBirthLine,
  greetingLine,
  runningPeriodSentence,
  buildComprehensiveIntro,
  newRunId,
  stripJayashreeIntro
} from "../../features/premiumPdf/premiumPdfLocale";
import {
  buildPremiumPrompts,
  type NatalPlacement,
  type TransitPlacement
} from "../../features/premiumPdf/premiumPrompts";

/** `PlanetName` is a string enum, so it needs a nudge to become the locale key. */
const toGraha = (planet: PlanetName | string): GrahaKey => String(planet) as GrahaKey;

const asText = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value.join(" ") : value ?? "";

export const toSafeArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(item => {
      if (typeof item === "string") return { impact: item };
      if (item && typeof item === "object") {
        return {
          ...item,
          impact: item.impact || item.summary || item.description || item.trait || item.text || ""
        };
      }
      return item;
    });
  }
  if (typeof val === "string") return [{ impact: val }];
  if (typeof val === "object") {
    return [{
      ...val,
      impact: val.impact || val.summary || val.description || val.trait || val.text || ""
    }];
  }
  return [];
};

const ensureValidSection = async (
  items: any,
  fallbackText: string,
  targetLang: string,
  minChars: number = 10
): Promise<{ name?: string; impact: string; remedy?: string; dateRange?: string }[]> => {
  const safeItems = toSafeArray(items);
  const validItems = safeItems.filter(item => item && (item.impact || item.description || item.trait || "").trim().length >= minChars);
  if (validItems.length > 0) {
    return validItems;
  }
  const translatedFallback = await translateText(fallbackText, targetLang);
  return [{ impact: translatedFallback }];
};


const DEEP_INSIGHT_CATEGORIES = [
  { id: "lifespan", label: "Lifespan & Health" },
  { id: "marriage", label: "Marriage & Relationships" },
  { id: "children", label: "Children & Progeny" },
  { id: "job", label: "Career & Profession" },
  { id: "family", label: "Family & Wealth" },
];

const QUESTION_TOPICS = [
  { id: "general", label: { en: "General Overview", kn: "ಸಾಮಾನ್ಯ ಜೀವನ ಒಳನೋಟ", te: "సాధారణ అవలోకనం", ta: "பொதுவான பார்வை", hi: "सामान्य अवलोकन" } },
  { id: "marriage", label: { en: "Marriage & Relationships", kn: "ವಿವಾಹ ಮತ್ತು ವೈವಾಹಿಕ ಜೀವನ", te: "వివాహం మరియు దాంపత్యం", ta: "திருமணம் மற்றும் உறவுகள்", hi: "विवाह एवं वैवाहिक जीवन" } },
  { id: "job", label: { en: "Job & Career", kn: "ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿ ಭವಿಷ್ಯ", te: "ఉద్యోగం మరియు కెరీర్", ta: "வேலை மற்றும் தொழில்", hi: "नौकरी और करियर" } },
  { id: "education", label: { en: "Education & Studies", kn: "ಶಿಕ್ಷಣ ಮತ್ತು ವಿದ್ಯಾಭ್ಯಾಸ", te: "విద్య మరియు చదువు", ta: "கல்வி மற்றும் படிப்பு", hi: "शिक्षा और अध्ययन" } },
  { id: "children", label: { en: "Children & Progeny", kn: "ಸಂತಾನ ಹಾಗೂ ಮಕ್ಕಳ ಯೋಗ", te: "సంతానం మరియు పిల్లలు", ta: "குழந்தைகள் மற்றும் சந்ததி", hi: "संतान एवं बच्चे" } },
  { id: "family", label: { en: "Family & Home", kn: "ಕುಟುಂಬ ಮತ್ತು ಗೃಹ ಸೌಖ್ಯ", te: "కుటుంబం మరియు గృహ సౌఖ్యం", ta: "குடும்பம் மற்றும் வீடு", hi: "परिवार और गृह सुख" } },
  { id: "wealth", label: { en: "Wealth & Money", kn: "ಧನ ಸಂಪತ್ತು ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿತಿ", te: "ధన సంపద మరియు ఆర్థిక స్థితి", ta: "செல்வம் மற்றும் பணம்", hi: "धन संपत्ति और आर्थिक स्थिति" } },
  { id: "travel", label: { en: "Foreign Travel & Relocation", kn: "ವಿದೇಶ ಪ್ರಯಾಣ ಹಾಗೂ ಸ್ಥಳಾಂತರ", te: "విదేశీ ప్రయాణం మరియు స్థలాంతరం", ta: "வெளிநாட்டுப் பயணம் மற்றும் இடமாற்றம்", hi: "विदेश यात्रा और स्थानांतरण" } },
  { id: "health", label: { en: "Health & Longevity", kn: "ಆರೋಗ್ಯ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯ", te: "ఆరోగ్యం మరియు దీర్ఘాయుష్షు", ta: "ஆரோக்கியம் ಮತ್ತು ஆயுள்", hi: "स्वास्थ्य और दीर्घायु" } },
];

const RASHI_LORDS_L5: Record<string, Record<number, string>> = {
  kn: { 0: "ಕುಜ (ಮಂಗಳ)", 1: "ಶುಕ್ರ", 2: "ಬುಧ", 3: "ಚಂದ್ರ", 4: "ರವಿ", 5: "ಬುಧ", 6: "ಶುಕ್ರ", 7: "ಕುಜ (ಮಂಗಳ)", 8: "ಗುರು (ಬೃಹಸ್ಪತಿ)", 9: "ಶನಿ", 10: "ಶನಿ", 11: "ಗುರು (ಬೃಹಸ್ಪತಿ)" },
  hi: { 0: "मंगल", 1: "शुक्र", 2: "बुध", 3: "चंद्रमा", 4: "सूर्य", 5: "बुध", 6: "शुक्र", 7: "मंगल", 8: "गुरु (बृहस्पति)", 9: "शनि", 10: "शनि", 11: "गुरु (बृहस्पति)" },
  te: { 0: "కుజుడు", 1: "శుక్రుడు", 2: "బుధుడు", 3: "చంద్రుడు", 4: "సూర్యుడు", 5: "బుధుడు", 6: "శుక్రుడు", 7: "కుజుడు", 8: "గురుడు", 9: "శని", 10: "శని", 11: "గురుడు" },
  ta: { 0: "செவ்வாய்", 1: "சுக்கிரன்", 2: "புதன்", 3: "சந்திரன்", 4: "சூரியன்", 5: "புதன்", 6: "சுக்கிரன்", 7: "செவ்வாய்", 8: "குரு", 9: "சனி", 10: "சனி", 11: "குரு" },
  en: { 0: "Mars (Kuja)", 1: "Venus (Shukra)", 2: "Mercury (Budha)", 3: "Moon (Chandra)", 4: "Sun (Surya)", 5: "Mercury (Budha)", 6: "Venus (Shukra)", 7: "Mars (Kuja)", 8: "Jupiter (Guru)", 9: "Saturn (Shani)", 10: "Saturn (Shani)", 11: "Jupiter (Guru)" }
};

export interface DynamicChartContext {
  name?: string;
  maritalStatus?: string;
  hasChildren?: string;
  planets: Array<{
    name: string;
    house: number;
    rashiIndex: number;
    isExalted?: boolean;
    isDebilitated?: boolean;
    isRetrograde?: boolean;
  }>;
  transits?: TransitPlacement[];
  moonRashiIndex?: number;
  ageYears?: number;
  gender?: "Male" | "Female";
}

export function robustParseGeminiJSON(text: string): Record<string, any> {
  if (!text || typeof text !== "string") return {};
  try {
    let clean = text.trim();
    const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      clean = codeBlockMatch[1].trim();
    }
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    const jsonStr = jsonMatch[0];

    try {
      return JSON.parse(jsonStr);
    } catch {
      let sanitized = "";
      let inString = false;
      let escaped = false;
      for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr[i];
        if (char === '"' && !escaped) {
          inString = !inString;
          sanitized += char;
        } else if (inString) {
          if (char === '\n') {
            sanitized += '\\n';
          } else if (char === '\r') {
            sanitized += '\\r';
          } else if (char === '\t') {
            sanitized += '\\t';
          } else {
            sanitized += char;
          }
        } else {
          sanitized += char;
        }
        escaped = (char === '\\' && !escaped);
      }
      return JSON.parse(sanitized);
    }
  } catch (e) {
    console.error("robustParseGeminiJSON fallback failed:", e);
    return {};
  }
}

export function buildPersonalizedMarriageText(
  lang: string,
  lagnaStr: string,
  moonStr: string,
  status: "unmarried" | "married" | "general",
  lagnaIndex: number = 0,
  dashaStr: string = "Running Dasha",
  bhuktiStr: string = "Sub Dasha",
  gender: "Male" | "Female" = "Male",
  context?: DynamicChartContext
): string {
  const baseLang = (lang || "en").split("-")[0];
  const lDict = RASHI_LORDS_L5[baseLang] || RASHI_LORDS_L5.en;

  const house7SignIdx = (lagnaIndex + 6) % 12;
  const house7Lord = lDict[house7SignIdx] || lDict[0];

  const natalPlanets: NatalPlacement[] = (context && context.planets && context.planets.length > 0)
    ? context.planets.map(p => ({
        graha: toGraha(p.name),
        rashiIndex: p.rashiIndex,
        house: p.house,
        exalted: p.isExalted,
        debilitated: p.isDebilitated,
        retrograde: p.isRetrograde
      }))
    : [
        { graha: "Sun", rashiIndex: lagnaIndex, house: 1 },
        { graha: "Moon", rashiIndex: context?.moonRashiIndex ?? ((lagnaIndex + 3) % 12), house: 4 },
        { graha: "Mars", rashiIndex: (lagnaIndex + 1) % 12, house: 2 },
        { graha: "Mercury", rashiIndex: (lagnaIndex + 2) % 12, house: 3 },
        { graha: "Jupiter", rashiIndex: (lagnaIndex + 8) % 12, house: 9 },
        { graha: "Venus", rashiIndex: (lagnaIndex + 3) % 12, house: 4 },
        { graha: "Saturn", rashiIndex: (lagnaIndex + 9) % 12, house: 10 },
        { graha: "Rahu", rashiIndex: (lagnaIndex + 10) % 12, house: 11 },
        { graha: "Ketu", rashiIndex: (lagnaIndex + 4) % 12, house: 5 }
      ];

  const chart = analyzeKundali({
    lagnaRashiIndex: lagnaIndex,
    moonRashiIndex: context?.moonRashiIndex ?? ((lagnaIndex + 3) % 12),
    natalPlanets,
    transits: context?.transits,
    gender,
    ageYears: context?.ageYears ?? 30,
    lang: baseLang
  });
  if (context?.name) chart.name = context.name;
  if (context?.maritalStatus) chart.maritalStatus = context.maritalStatus;
  if (context?.hasChildren) chart.hasChildren = context.hasChildren;
  chart.lagnaSignName = lagnaStr || chart.lagnaSignName;
  chart.moonSignName = moonStr || chart.moonSignName;
  if (dashaStr && dashaStr !== "Running Dasha") chart.mahaLordName = dashaStr;
  if (bhuktiStr && bhuktiStr !== "Sub Dasha") chart.bhuktiLordName = bhuktiStr;
  chart.houses[7].lordName = house7Lord;

  return buildDynamicMarriageFallback(chart, status);
}

export function buildPersonalizedChildrenText(
  lang: string,
  status: "no_children" | "has_children" | "general",
  lagnaIndex: number = 0,
  dashaStr: string = "Running Dasha",
  bhuktiStr: string = "Sub Dasha",
  context?: DynamicChartContext
): string {
  const baseLang = (lang || "en").split("-")[0];
  const lDict = RASHI_LORDS_L5[baseLang] || RASHI_LORDS_L5.en;

  const house5SignIdx = (lagnaIndex + 4) % 12;
  const house5Lord = lDict[house5SignIdx] || lDict[0];

  const natalPlanets: NatalPlacement[] = (context && context.planets && context.planets.length > 0)
    ? context.planets.map(p => ({
        graha: toGraha(p.name),
        rashiIndex: p.rashiIndex,
        house: p.house,
        exalted: p.isExalted,
        debilitated: p.isDebilitated,
        retrograde: p.isRetrograde
      }))
    : [
        { graha: "Sun", rashiIndex: lagnaIndex, house: 1 },
        { graha: "Moon", rashiIndex: context?.moonRashiIndex ?? ((lagnaIndex + 3) % 12), house: 4 },
        { graha: "Mars", rashiIndex: (lagnaIndex + 1) % 12, house: 2 },
        { graha: "Mercury", rashiIndex: (lagnaIndex + 2) % 12, house: 3 },
        { graha: "Jupiter", rashiIndex: (lagnaIndex + 8) % 12, house: 9 },
        { graha: "Venus", rashiIndex: (lagnaIndex + 3) % 12, house: 4 },
        { graha: "Saturn", rashiIndex: (lagnaIndex + 9) % 12, house: 10 },
        { graha: "Rahu", rashiIndex: (lagnaIndex + 10) % 12, house: 11 },
        { graha: "Ketu", rashiIndex: (lagnaIndex + 4) % 12, house: 5 }
      ];

  const chart = analyzeKundali({
    lagnaRashiIndex: lagnaIndex,
    moonRashiIndex: context?.moonRashiIndex ?? ((lagnaIndex + 3) % 12),
    natalPlanets,
    transits: context?.transits,
    gender: context?.gender ?? "Male",
    ageYears: context?.ageYears ?? 30,
    lang: baseLang
  });
  if (context?.name) chart.name = context.name;
  if (context?.maritalStatus) chart.maritalStatus = context.maritalStatus;
  if (context?.hasChildren) chart.hasChildren = context.hasChildren;
  if (dashaStr && dashaStr !== "Running Dasha") chart.mahaLordName = dashaStr;
  if (bhuktiStr && bhuktiStr !== "Sub Dasha") chart.bhuktiLordName = bhuktiStr;
  chart.houses[5].lordName = house5Lord;

  return buildDynamicChildrenFallback(chart, status);
}

import PdfPersonalizationModal, { PersonalizationState } from "./PdfPersonalizationModal";
import { MultiQuestionPdfTemplate, MultiQuestionItem } from "./MultiQuestionPdfTemplate";

const MULTI_QUESTION_TOPICS = [
  { id: "career", label: { en: "💼 Career & Promotion", kn: "💼 ಉದ್ಯೋಗ ಹಾಗೂ ಬಡ್ತಿ", te: "💼 ఉద్యోగం మరియు పదోన్నతి", ta: "💼 வேலை மற்றும் உயர்வு", hi: "💼 करियर और पदोन्नति" }, defaultQ: { en: "When will I get a job promotion or career growth?", kn: "ನನಗೆ ಯಾವಾಗ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಹಾಗೂ ವೃತ್ತಿ ಏಳಿಗೆ ದೊರೆಯಲಿದೆ?", te: "నాకు ఎప్పుడు ఉద్యోగంలో పదోన్నతి లభిస్తుంది?", ta: "எனக்கு எப்போது வேலையில் உயர்வு கிடைக்கும்?", hi: "मुझे करियर में पदोन्नति कब मिलेगी?" } },
  { id: "marriage", label: { en: "💍 Marriage & Timing", kn: "💍 ವಿವಾಹ ಹಾಗೂ ಸಂಬಂಧ", te: "💍 వివాహం మరియు సమయం", ta: "💍 திருமணம் மற்றும் காலம்", hi: "💍 विवाह और समय" }, defaultQ: { en: "What is the exact marriage timing window and spouse nature?", kn: "ನನ್ನ ಕಲ್ಯಾಣ ಯೋಗದ ನಿಖರ ಸಮಯ ಹಾಗೂ ಸಂಗಾತಿಯ ಗುಣಲಕ್ಷಣಗಳೇನು?", te: "నా వివాహ సమయం మరియు భాగస్వామి స్వభావం ఎలా ఉంటుంది?", ta: "என் திருமண காலம் மற்றும் வரனின் சுபாவம் எப்படி இருக்கும்?", hi: "विवाह का सटीक समय और जीवनसाथी का स्वभाव कैसा होगा?" } },
  { id: "finance", label: { en: "💰 Wealth & Investment", kn: "💰 ಧನ ಲಾಭ ಹಾಗೂ ಸಂಪತ್ತು", te: "💰 ధన లాభం మరియు సంపద", ta: "💰 தன லாபம் மற்றும் செல்வம்", hi: "💰 धन लाभ और संपत्ति" }, defaultQ: { en: "How will my financial growth and property gains be?", kn: "ನನ್ನ ಆರ್ಥಿಕ ಸ್ಥಿತಿ ಹಾಗೂ ಆಸ್ತಿ ಗಳಿಕೆ ಹೇಗೆ ಇರಲಿದೆ?", te: "నా ఆర్థిక స్థితి మరియు ఆస్తి సమకూరుట ఎలా ఉంటుంది?", ta: "என் நிதி நிலையும் சொத்து சேர்க்கையும் எப்படி இருக்கும்?", hi: "मेरी वित्तीय स्थिति और संपत्ति लाभ कैसा रहेगा?" } },
  { id: "travel", label: { en: "✈️ Foreign Travel & Visa", kn: "✈️ ವಿದೇಶ ಪ್ರಯಾಣ ಹಾಗೂ ವೀಸಾ", te: "✈️ విదేశీ ప్రయాణం మరియు వీసా", ta: "✈️ வெளிநாட்டுப் பயணம் மற்றும் விசா", hi: "✈️ विदेश यात्रा और वीजा" }, defaultQ: { en: "Is foreign settlement or overseas job travel indicated?", kn: "ನನಗೆ ವಿದೇಶಿ ಯೋಗ ಹಾಗೂ ಸ್ಥಳಾಂತರ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆಯೇ?", te: "నాకు విదేశీ ప్రయాణం మరియు ఉద్యోగ యోగం ఉందా?", ta: "எனக்கு வெளிநாட்டு வேலை வாய்ப்பு யோகம் உள்ளதா?", hi: "क्या मुझे विदेश यात्रा और वहां बसने का योग है?" } },
  { id: "health", label: { en: "🩺 Health & Wellbeing", kn: "🩺 ಆರೋಗ್ಯ ಹಾಗೂ ಆಯುಷ್ಯ", te: "🩺 ఆరోగ్యం మరియు ఆయుష్షు", ta: "🩺 ஆரோக்கியம் மற்றும் ஆயுள்", hi: "🩺 स्वास्थ्य और दीर्घायु" }, defaultQ: { en: "What remedies are needed for health stability and peace?", kn: "ನನ್ನ ಆರೋಗ್ಯ ಸುಧಾರಣೆಗೆ ಯಾವ ಧಾರ್ಮಿಕ ಶಮನ ಪರಿಹಾರಗಳು ಅಗತ್ಯ?", te: "నా ఆరోగ్య శ్రేయస్సుకు ఏ పరిహారాలు చేయాలి?", ta: "என் ஆரோக்கியத்திற்கு என்ன பரிகாரங்கள் செய்ய வேண்டும்?", hi: "स्वास्थ्य स्थिरता के लिए क्या उपाय करने चाहिए?" } },
  { id: "children", label: { en: "👶 Children & Progeny", kn: "👶 ಸಂತಾನ ಹಾಗೂ ಮಕ್ಕಳು", te: "👶 సంతానం మరియు పిల్లలు", ta: "👶 சந்ததி மற்றும் குழந்தைகள்", hi: "👶 संतान और बच्चे" }, defaultQ: { en: "What is the progeny blessing timing and children progress?", kn: "ನನ್ನ ಸಂತಾನ ಭಾಗ್ಯದ ಸಮಯ ಹಾಗೂ ಮಕ್ಕಳ ಭವಿಷ್ಯ ಹೇಗಿರಲಿದೆ?", te: "నా సంతాన ప్రాప్తి సమయం మరియు పిల్లల భవిష్యత్తు ఎలా ఉంటుంది?", ta: "என் குழந்தை பாக்கிய யோகமும் குழந்தைகளின் எதிர்காலமும் எப்படி இருக்கும்?", hi: "संतान प्राप्ति का समय और बच्चों का भविष्य कैसा रहेगा?" } },
  { id: "property", label: { en: "🏠 House & Vehicle Purchase", kn: "🏠 ಮನೆ ಹಾಗೂ ವಾಹನ ಖರೀದಿ", te: "🏠 ఇల్లు మరియు వాహన కొనుగోలు", ta: "🏠 வீடு மற்றும் வாகனம் வாங்குதல்", hi: "🏠 मकान और वाहन खरीद" }, defaultQ: { en: "When will I purchase my own house or vehicle?", kn: "ನಾನು ಸ್ವಂತ ಮನೆ ಹಾಗೂ ವಾಹನವನ್ನು ಯಾವಾಗ ಖರೀದಿಸಲಿದ್ದೇನೆ?", te: "నేను సొంత ఇల్లు మరియు వాహనాన్ని ఎప్పుడు కొనుగోలు చేస్తాను?", ta: "நான் சொந்த வீடும் வாகனமும் எப்போது வாங்குவேன்?", hi: "मैं अपना घर और वाहन कब खरीद पाऊंगा?" } }
];

export function buildPersonalizedCareerText(
  lang: string,
  lagnaIndex: number = 0,
  dashaStr: string = "Running Dasha",
  bhuktiStr: string = "Sub Dasha",
  context?: DynamicChartContext
): string {
  const chart = analyzeKundali({
    lagnaRashiIndex: lagnaIndex,
    moonRashiIndex: context?.moonRashiIndex ?? 0,
    natalPlanets: (context?.planets || []).map(p => ({
      graha: toGraha(p.name),
      rashiIndex: p.rashiIndex,
      house: p.house,
      exalted: p.isExalted,
      debilitated: p.isDebilitated,
      retrograde: p.isRetrograde
    })),
    transits: context?.transits,
    gender: context?.gender ?? "Male",
    ageYears: context?.ageYears ?? 30,
    lang
  });
  if (dashaStr && dashaStr !== "Running Dasha") chart.mahaLordName = dashaStr;
  if (bhuktiStr && bhuktiStr !== "Sub Dasha") chart.bhuktiLordName = bhuktiStr;
  return buildDynamicCareerFallback(chart);
}

export function buildPersonalizedWealthText(
  lang: string,
  lagnaIndex: number = 0,
  dashaStr: string = "Running Dasha",
  bhuktiStr: string = "Sub Dasha",
  context?: DynamicChartContext
): string {
  const chart = analyzeKundali({
    lagnaRashiIndex: lagnaIndex,
    moonRashiIndex: context?.moonRashiIndex ?? 0,
    natalPlanets: (context?.planets || []).map(p => ({
      graha: toGraha(p.name),
      rashiIndex: p.rashiIndex,
      house: p.house,
      exalted: p.isExalted,
      debilitated: p.isDebilitated,
      retrograde: p.isRetrograde
    })),
    transits: context?.transits,
    gender: context?.gender ?? "Male",
    ageYears: context?.ageYears ?? 30,
    lang
  });
  if (dashaStr && dashaStr !== "Running Dasha") chart.mahaLordName = dashaStr;
  if (bhuktiStr && bhuktiStr !== "Sub Dasha") chart.bhuktiLordName = bhuktiStr;
  return buildDynamicWealthFallback(chart);
}

export function buildPersonalizedHealthText(
  lang: string,
  lagnaIndex: number = 0,
  dashaStr: string = "Running Dasha",
  bhuktiStr: string = "Sub Dasha",
  context?: DynamicChartContext
): string {
  const chart = analyzeKundali({
    lagnaRashiIndex: lagnaIndex,
    moonRashiIndex: context?.moonRashiIndex ?? 0,
    natalPlanets: (context?.planets || []).map(p => ({
      graha: toGraha(p.name),
      rashiIndex: p.rashiIndex,
      house: p.house,
      exalted: p.isExalted,
      debilitated: p.isDebilitated,
      retrograde: p.isRetrograde
    })),
    transits: context?.transits,
    gender: context?.gender ?? "Male",
    ageYears: context?.ageYears ?? 30,
    lang
  });
  if (dashaStr && dashaStr !== "Running Dasha") chart.mahaLordName = dashaStr;
  if (bhuktiStr && bhuktiStr !== "Sub Dasha") chart.bhuktiLordName = bhuktiStr;
  return buildDynamicHealthFallback(chart);
}

export function buildKundaliCurrentPhaseFallback(
  lang: string,
  lagnaStr: string,
  moonStr: string,
  dashaName: string,
  bhuktiName: string,
  name?: string,
  ageYears: number = 30,
  _gender: string = "Male"
): string {
  const baseLang = (lang || "en").split("-")[0];
  const isSenior = ageYears >= 60;
  const isYouth = ageYears < 23;
  const ageNum = Math.floor(ageYears);

  if (baseLang === "kn") {
    const nameSalutation = name ? `${name} ಅವರೇ, ` : "";
    const p1 = isSenior
      ? `${nameSalutation}ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${lagnaStr}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${moonStr}) ಆಧಾರದ ಮೇಲೆ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaName} ಮಹಾದಶಾ ಹಾಗೂ ${bhuktiName} ಭುಕ್ತಿ ಅವಧಿಯು ನಿಮ್ಮ ${ageNum} ವರ್ಷಗಳ ಜೀವಿತಾವಧಿಯಲ್ಲಿ ಅತ್ಯಂತ ಗೌರವಾನ್ವಿತ ಹಾಗೂ ಮಹತ್ವದ ಕಾಲಘಟ್ಟವಾಗಿದೆ. ಈ ವಯೋಮಾನದಲ್ಲಿ ಪ್ರಾಪಂಚಿಕ ಪೈಪೋಟಿಗಿಂತ ಕುಟುಂಬದ ಸುಭದ್ರತೆ, ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಮತ್ತು ಮನಸ್ಸಿನ ಶಾಂತಿಯೇ ನಿಮ್ಮ ದೈನಂದಿನ ಮುಖ್ಯ ಆದ್ಯತೆಯಾಗಿದೆ.`
      : isYouth
      ? `${nameSalutation}ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${lagnaStr}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${moonStr}) ಆಧಾರದ ಮೇಲೆ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaName} ಮಹಾದಶಾ ಹಾಗೂ ${bhuktiName} ಭುಕ್ತಿ ಅವಧಿಯು ನಿಮ್ಮ ${ageNum} ವರ್ಷಗಳ ಯೌವನಾವಸ್ಥೆಯಲ್ಲಿ ಶಿಕ್ಷಣ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ಭವಿಷ್ಯದ ವೃತ್ತಿ ಬುನಾದಿಯನ್ನು ನಿರ್ಮಿಸುವ ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ ಕಾಲಘಟ್ಟವಾಗಿದೆ.`
      : `${nameSalutation}ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${lagnaStr}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${moonStr}) ಆಧಾರದ ಮೇಲೆ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaName} ಮಹಾದಶಾ ಹಾಗೂ ${bhuktiName} ಭುಕ್ತಿ ಕಾಲಘಟ್ಟವು ನಿಮ್ಮ ${ageNum} ವರ್ಷಗಳ ಪ್ರೌಢ ಜೀವನದಲ್ಲಿ ವೃತ್ತಿಪರ ಜವಾಬ್ದಾರಿಗಳು, ಆರ್ಥಿಕ ನಿರ್ವಹಣೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮತೋಲನದ ಮಹತ್ವದ ಹಂತವನ್ನು ಸೃಷ್ಟಿಸಿದೆ.`;

    const p2 = `ಭಾವನಾತ್ಮಕವಾಗಿ, ಪ್ರಸ್ತುತ ಗ್ರಹಗಳ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ಸಹನೆ ಮತ್ತು ಆಂತರಿಕ ನಿಗ್ರಹ ಶಕ್ತಿಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದೆ. ಕಠಿಣ ಶ್ರಮಕ್ಕೆ ತಕ್ಷಣವೇ ಪ್ರತಿಫಲ ಸಿಗುತ್ತಿಲ್ಲವೆಂಬ ಸಣ್ಣಪುಟ್ಟ ಆತಂಕ ಮೂಡಿದರೂ, ದೇವಗುರು ಹಾಗೂ ಶನಿ ಭಗವಾನರ ಅನುಗ್ರಹವು ನಿಮಗೆ ಧೈರ್ಯ ಮತ್ತು ಸ್ಥಿರತೆಯನ್ನು ಕರುಣಿಸಲಿದೆ.`;
    const p3 = `ಅಂತರಂಗದ ಮಟ್ಟದಲ್ಲಿ, ನೀವು ಭವಿಷ್ಯದ ಭದ್ರತೆ, ಸಾಲ-ಹೊಣೆಗಾರಿಕೆಗಳ ನಿವಾರಣೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಅಭ್ಯುದಯದ ಕುರಿತು ಆಳವಾಗಿ ಆಲೋಚಿಸುತ್ತಿದ್ದೀರಿ. ಹಳೆಯ ಸಮಸ್ಯೆಗಳನ್ನು ಬಗೆಹರಿಸಿ ಶಾಂತಿಯುತ ಹೊಸ ಆರಂಭವನ್ನು ಮಾಡಲು ನಿಮ್ಮ ಸುಪ್ತ ಮನಸ್ಸು ಸಿದ್ಧವಾಗುತ್ತಿದೆ.`;
    const p4 = `ಸತ್ಕರ್ಮಗಳ ಪಾಲನೆ, ನಿತ್ಯ ಮುಂಜಾನೆ ಸೂರ್ಯ ನಮಸ್ಕಾರ, ಸಂಜೆ ದೇವರ ಕೋಣೆಯಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸುವುದು ಹಾಗೂ ಗುರು-ಹಿರಿಯರ ಆಶೀರ್ವಾದವನ್ನು ಪಡೆಯುವುದರಿಂದ ಈ ಪ್ರಸ್ತುತ ಕಾಲಘಟ್ಟದ ಸಕಲ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗಿ ನಿರಂತರ ಸಿದ್ಧಿ ಲಭಿಸಲಿದೆ. ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದ ಶ್ರೀ ಮುಖ್ಯಪ್ರಾಣ ದೇವರ ದಿವ್ಯ ಆಶೀರ್ವಾದವು ಸದಾ ನಿಮ್ಮ ರಕ್ಷಣೆಗೆ ನಿಂತಿದೆ.`;
    return `${p1}\n\n${p2}\n\n${p3}\n\n${p4}`;
  }
  if (baseLang === "hi") {
    const nameSalutation = name ? `${name} जी, ` : "";
    const p1 = isSenior
      ? `${nameSalutation}आपकी जन्म लग्न (${lagnaStr}) एवं चंद्र राशि (${moonStr}) के आधार पर, वर्तमान ${dashaName} महादशा एवं ${bhuktiName} भुक्ति आपके ${ageNum} वर्षों के जीवन का एक अत्यंत गरिमामयी और निर्णायक समय है। इस अवस्था में परिवार की स्थिरता और स्वास्थ्य रक्षा ही मुख्य ध्येय है।`
      : isYouth
      ? `${nameSalutation}आपकी जन्म लग्न (${lagnaStr}) एवं चंद्र राशि (${moonStr}) के आधार पर, वर्तमान ${dashaName} महादशा एवं ${bhuktiName} भुक्ति आपके ${ageNum} वर्षों के युवा काल में शिक्षा एवं करियर की सुदृढ़ नींव रखने का काल है।`
      : `${nameSalutation}आपकी जन्म लग्न (${lagnaStr}) एवं चंद्र राशि (${moonStr}) के आधार पर, वर्तमान ${dashaName} महादशा एवं ${bhuktiName} भुक्ति का प्रभाव आपके ${ageNum} वर्षों के प्रौढ़ जीवन में महत्वपूर्ण सकारात्मक परिवर्तन और नए दायित्व ला रहा है।`;

    const p2 = `इस समय मानसिक रूप से कभी-कभी अधीरता या चिंता का अनुभव हो सकता है। परंतु गुरु एवं शनि के गोचर प्रभाव से आपको धैर्य, आत्मबल और मानसिक स्पष्टता प्राप्त होगी।`;
    const p3 = `आंतरिक स्तर पर, आप भविष्य की सुरक्षा एवं पारिवारिक उन्नति के विषय में गंभीर विचार कर रहे हैं। पुरानी समस्याओं को सुलझाकर नए क्षितिज की ओर बढ़ने की दिशा बन रही है।`;
    const p4 = `नित्य पूजन, धर्म पालन एवं बड़ों के आशीर्वाद से वर्तमान समय की समस्त बाधाएं दूर होकर पूर्ण सफलता सिद्ध होगी। बग्गोण क्षेत्र का दिव्य आशीर्वाद सदैव आपकी रक्षा करेगा।`;
    return `${p1}\n\n${p2}\n\n${p3}\n\n${p4}`;
  }
  const nameSalutation = name ? `Dear ${name}, ` : "";
  const p1 = isSenior
    ? `${nameSalutation}based on your birth Lagna (${lagnaStr}) and Moon sign (${moonStr}), your running ${dashaName} Mahadasha and ${bhuktiName} Bhukti represent an honorable, reflective milestone in your ${ageNum} years of life, focusing energy on health maintenance and family harmony.`
    : isYouth
    ? `${nameSalutation}based on your birth Lagna (${lagnaStr}) and Moon sign (${moonStr}), your running ${dashaName} Mahadasha and ${bhuktiName} Bhukti represent a foundational interval in your ${ageNum} years of youth, centering on academic excellence and vocational clarity.`
    : `${nameSalutation}based on your birth Lagna (${lagnaStr}) and Moon sign (${moonStr}), your running ${dashaName} Mahadasha and ${bhuktiName} Bhukti activate significant developments in personal and vocational spheres during this ${ageNum}-year phase.`;

  const p2 = `Mentally, you may experience transient moments of impatience or fatigue regarding your efforts. Favorable aspects from Jupiter and Saturn foster internal resilience and strategic clarity.`;
  const p3 = `At a subconscious level, your primary focus revolves around long-term stability and family prosperity. Your inner self is preparing to resolve lingering issues and embrace constructive new beginnings.`;
  const p4 = `Consistent spiritual practices, disciplined action, and honoring mentors will neutralize minor planetary friction and ensure steady success during this phase. May the sacred grace of Baggona Kshetra continually guide and protect you.`;
  return `${p1}\n\n${p2}\n\n${p3}\n\n${p4}`;
}

export function enrichYogaDescription(
  name: string,
  impact: string,
  lang: string,
  lagnaStr: string = "Lagna",
  moonStr: string = "Moon Sign"
): string {
  const cleanImpact = (impact || "").trim();
  if (cleanImpact.length >= 100) return cleanImpact;

  const baseLang = (lang || "en").split("-")[0];
  const lowerName = (name || "").toLowerCase();

  if (lowerName.includes("gajakesari") || lowerName.includes("ಗಜಕೇಸರಿ") || lowerName.includes("गजकेसरी") || lowerName.includes("గజకేసరి") || lowerName.includes("கஜகேசரி")) {
    if (baseLang === "kn") return `${cleanImpact} ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗುರು ಹಾಗೂ ಚಂದ್ರರ ಪರಸ್ಪರ ಕೇಂದ್ರ ಸ್ಥಿತಿಯಿಂದ ಶ್ರೀ ಗಜಕೇಸರಿ ರಾಜಯೋಗ ಉಂಟಾಗಿದೆ. ಈ ಯೋಗದ ಶುಭ ಪ್ರಭಾವದಿಂದ ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಗೌರವ, ಬುದ್ಧಿವಂತಿಕೆ, ಸ್ಥಿರ ಸಂಪತ್ತು ಹಾಗೂ ಸಕಲ ಸೌಭಾಗ್ಯಗಳು ಪ್ರಾಪ್ತಿಯಾಗಲಿವೆ. ಪ್ರಸ್ತುತ ಗ್ರಹಗಳ ಶುಭ ಬಲದಿಂದ ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ರಾಜಮಾನ ಮರ್ಯಾದೆ ದೊರೆಯಲಿದೆ.`;
    if (baseLang === "hi") return `${cleanImpact} आपकी कुंडली में गुरु एवं चंद्रमा के केंद्र स्थिति में होने से गजकेसरी राजयोग बना है। इसके शुभ प्रभाव से समाज में उच्च सम्मान, ज्ञान, स्थायी संपत्ति और सुख-समृद्धि की प्राप्ति होगी। वर्तमान ग्रह स्थिति से आपको कार्यक्षेत्र में विशेष सफलता मिलेगी।`;
    if (baseLang === "te") return `${cleanImpact} మీ జాతకంలో గురుడు మరియు చంద్రుడు కేంద్ర స్థానంలో ఉండటం వల్ల గజకేసరి రాజయోగం ఏర్పడింది. దీని ప్రభావంతో సమాజంలో గౌరవం, బుద్ధికుశలత, స్థిరాస్తి మరియు సకల సౌఖ్యాలు లభిస్తాయి.`;
    if (baseLang === "ta") return `${cleanImpact} உங்கள் ஜாதகத்தில் குரு மற்றும் சந்திரன் கேந்திரத்தில் இருப்பதன் மூலம் கஜகேசரி யோகம் உண்டாகிறது. இதனால் சமூகத்தில் மரியாதை, புத்தி கூர்மை, செல்வம் மற்றும் சகல சௌபாக்கியங்களும் கிடைக்கும்.`;
    return `${cleanImpact} The auspicious alignment of Jupiter and Moon forms Gajakesari Yoga in your birth chart. This grants high social status, wisdom, financial stability, and long-term prosperity.`;
  }

  if (lowerName.includes("obhayachari") || lowerName.includes("ubhaya") || lowerName.includes("ಉಭಯಚಾರಿ") || lowerName.includes("उभयचारी") || lowerName.includes("ఉభయచారి") || lowerName.includes("உபயசாரி")) {
    if (baseLang === "kn") return `${cleanImpact} ಸೂರ್ಯನ ಎರಡೂ ಪಾರ್ಶ್ವಗಳಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳು ನೆಲೆಸಿರುವುದರಿಂದ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪ್ರಬಲ ಉಭಯಚಾರಿ ಯೋಗ ಸಿದ್ಧಿಸಿದೆ. ಈ ಯೋಗದ ಶುಭ ಪ್ರಭಾವದಿಂದ ನೀವು ಸದಾ ಸತ್ಯನಿಷ್ಠೆ, ಪರೋಪಕಾರ ಹಾಗೂ ಸಮಾಜಿಕ ಕೀರ್ತಿಯನ್ನು ಪಡೆಯುವಿರಿ. ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ನಿರ್ಧಾರಗಳು ಕುಟುಂಬಕ್ಕೆ ಯಶಸ್ಸು ತರಲಿವೆ.`;
    if (baseLang === "hi") return `${cleanImpact} सूर्य के दोनों ओर शुभ ग्रहों की उपस्थिति से आपकी कुंडली में उभयचारी योग बना है। इसके प्रभाव से आप समाज में उच्च प्रतिष्ठा, परोपकारी स्वभाव और राजा के समान मान-सम्मान प्राप्त करेंगे।`;
    if (baseLang === "te") return `${cleanImpact} సూర్యునికి ఇరువైపులా శుభ గ్రహాలు ఉండటం వల్ల మీ జాతకంలో ఉభయచారి యోగం ఏర్పడింది. దీని వలన సమాజంలో మంచి పేరు, దయాగుణం మరియు సముచిత గౌరవం లభిస్తాయి.`;
    if (baseLang === "ta") return `${cleanImpact} சூரியனின் இருபுறமும் சுப கிரகங்கள் இருப்பதால் உங்கள் ஜாதகத்தில் உபயசாரி யோகம் உண்டாகிறது. இதனால் புகழ், கருணை மற்றும் உயர்ந்த அந்தஸ்து கிடைக்கும்.`;
    return `${cleanImpact} Benefic planets flanking the Sun create Obhayachari Yoga in your chart. This grants eloquent speech, royal status, charitable disposition, and enduring fame.`;
  }

  if (lowerName.includes("lakshmi") || lowerName.includes("ಲಕ್ಷ್ಮಿ") || lowerName.includes("लक्ष्मी") || lowerName.includes("లక్ష్మి") || lowerName.includes("லக்ஷ்மி")) {
    if (baseLang === "kn") return `${cleanImpact} ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ನವಮಾಧಿಪತಿಯ ಪರಸ್ಪರ ಶುಭ ಯೋಗದಿಂದ ಲಕ್ಷ್ಮಿ ಯೋಗ ಸಿದ್ಧಿಸಿದೆ. ಇದರ ಪ್ರಭಾವದಿಂದ ಅಪಾರ ಧನ ಲಾಭ, ಸುಂದರ ನೋಟ, ಆಸ್ತಿ ಗಳಿಕೆ ಹಾಗೂ ಶ್ರೀಮಂತರ ಸೌಹಾರ್ದತೆ ಲಭಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ದಶಾ ಕಾಲವು ನಿರಂತರ ಸಂಪದಭಿವೃದ್ಧಿಯನ್ನು ಸೂಚಿಸುತ್ತಿದೆ.`;
    if (baseLang === "hi") return `${cleanImpact} लग्नेश और नवमेश की शुभ स्थिति से आपकी कुंडली में महालक्ष्मी योग बना है। इसके प्रभाव से अपार धन-संपत्ति, वाहन सुख, और समाज में प्रतिष्ठित लोगों से सम्मान प्राप्त होगा।`;
    if (baseLang === "te") return `${cleanImpact} లగ్నాధిపతి మరియు నవమాధిపతి శుభ యోగం వల్ల మహాలక్ష్మి యోగం సిద్ధించింది. దీని వలన ధన లాభం, వాహన యోగం మరియు సమాజంలో ఉన్నత గౌరవం లభిస్తాయి.`;
    if (baseLang === "ta") return `${cleanImpact} லக்னாதிபதியும் நவமாதிபதியும் சுப யோகத்தில் இருப்பதால் மகாலக்ஷ்மி யோகம் உண்டாகிறது. இதனால் அபரிமிதமான செல்வம், வாகன யோகம் மற்றும் மரியாதை கிடைக்கும்.`;
    return `${cleanImpact} The harmonious placement of the 1st and 9th house lords creates Mahalakshmi Yoga. This guarantees financial abundance, property gains, refined grace, and lifelong wealth.`;
  }

  if (baseLang === "kn") {
    return `${cleanImpact} ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${lagnaStr}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${moonStr}) ಆಧಾರದ ಮೇಲೆ ಈ ಗ್ರಹ ಯೋಗವು ಅತ್ಯಂತ ಪ್ರಭಾವಶಾಲಿಯಾಗಿದೆ. ಈ ಯೋಗದ ಶುಭ ಬಲದಿಂದ ಜೀವನದ ವಿವಿಧ ಹಂತಗಳಲ್ಲಿ ಬರುವ ಅಡೆತಡೆಗಳು ಶಮನವಾಗಿ, ದೀರ್ಘಾವಧಿ ಯಶಸ್ಸು ಹಾಗೂ ಧನ-ಆರೋಗ್ಯ ವೃದ್ಧಿ ಸಿದ್ಧಿಸಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `${cleanImpact} आपकी लग्न (${lagnaStr}) एवं चंद्र राशि (${moonStr}) के आधार पर यह ग्रह योग अत्यधिक फलदायी है। इसके शुभ प्रभाव से जीवन की कठिनाइयां दूर होंगी तथा दीर्घकालिक सफलता एवं धन-आरोग्य की वृद्धि होगी।`;
  }
  if (baseLang === "te") {
    return `${cleanImpact} మీ లగ్నం మరియు చంద్ర రాశి ఆధారంగా ఈ గ్రహ యోగం అత్యంత ప్రభావవంతమైనది. దీని శుభ బలంతో అడ్డంకులు తొలగి, సుదీర్ఘకాల విజయం మరియు ధన-ఆరోగ్య వృద్ధి లభిస్తాయి.`;
  }
  if (baseLang === "ta") {
    return `${cleanImpact} உங்கள் லக்னம் மற்றும் சந்திர ராசி அடிப்படையில் இந்த யோகம் மிக சக்தி வாய்ந்தது. இதன் சுப பலனால் தடைகள் நீங்கி, நீண்டகால வெற்றியும் செல்வ ஆரோக்கியமும் கிடைக்கும்.`;
  }
  return `${cleanImpact} Based on your Ascendant (${lagnaStr}) and Moon Sign (${moonStr}), this planetary combination exerts a potent benefic influence. It neutralizes obstacles and guarantees long-term success, prosperity, and peace.`;
}

export function generateSmartQuestionHeader(questionText: string, lang: string): string {
  const q = questionText.toLowerCase();
  const isKn = lang === "kn";
  const isTe = lang === "te";
  const isTa = lang === "ta";
  const isHi = lang === "hi";

  if (q.includes("house") || q.includes("property") || q.includes("home") || q.includes("land") || q.includes("flat") || q.includes(" site") || q.includes("ಮನೆ") || q.includes("ಆಸ್ತಿ") || q.includes("ಇಲ್ಲು")) {
    return isKn ? "🏠 ಗೃಹ ಹಾಗೂ ಆಸ್ತಿ ಯೋಗ (House & Property)" : isTe ? "🏠 గృహ మరియు ఆస్తి యోగం (House & Property)" : isTa ? "🏠 வீடு மற்றும் சொத்து யோகம் (House & Property)" : isHi ? "🏠 गृह एवं संपत्ति योग (House & Property)" : "🏠 House, Property & Land Acquisition";
  }
  if (q.includes("job") || q.includes("career") || q.includes("promote") || q.includes("promotion") || q.includes("salary") || q.includes("work") || q.includes("ಉದ್ಯೋಗ") || q.includes("ಬಡ್ತಿ") || q.includes("ವೃತ್ತಿ")) {
    return isKn ? "💼 ಉದ್ಯೋಗ ಹಾಗೂ ವೃತ್ತಿ ಏಳಿಗೆ (Career & Promotion)" : isTe ? "💼 ఉద్యోగం మరియు పదోన్నతి (Career & Promotion)" : isTa ? "💼 வேலை மற்றும் தொழில் உயர்வு (Career & Promotion)" : isHi ? "💼 करियर एवं पदोन्नति योग (Career & Promotion)" : "💼 Career Growth & Job Promotion Timing";
  }
  if (q.includes("marri") || q.includes("wedding") || q.includes("spouse") || q.includes("wife") || q.includes("husband") || q.includes("ವಿವಾಹ") || q.includes("ಮದುವೆ") || q.includes("వివాహం")) {
    return isKn ? "💍 ವಿವಾಹ ಯೋಗ ಹಾಗೂ ಸಂಗಾತಿ (Marriage Timing)" : isTe ? "💍 వివాహ యోగం మరియు భాగస్వామి (Marriage Timing)" : isTa ? "💍 திருமண யோகம் மற்றும் வரன் (Marriage Timing)" : isHi ? "💍 विवाह योग एवं जीवनसाथी (Marriage Timing)" : "💍 Marriage Timing & Spouse Nature";
  }
  if (q.includes("money") || q.includes("wealth") || q.includes("finance") || q.includes("invest") || q.includes("ಧನ") || q.includes("ಸಂಪತ್ತು") || q.includes("ಹಣ")) {
    return isKn ? "💰 ಧನ ಆಸ್ತಿ ಹಾಗೂ ಆರ್ಥಿಕ ಯೋಗ (Wealth & Finance)" : isTe ? "💰 ధన సంపద మరియు ఆర్థిక యోగం (Wealth & Finance)" : isTa ? "💰 தன லாபம் மற்றும் செல்வம் (Wealth & Finance)" : isHi ? "💰 धन संपत्ति एवं आर्थिक योग (Wealth & Finance)" : "💰 Wealth, Finance & Investment Gains";
  }
  if (q.includes("child") || q.includes("baby") || q.includes("progeny") || q.includes("son") || q.includes("daughter") || q.includes("ಸಂತಾನ") || q.includes("ಮಕ್ಕಳು")) {
    return isKn ? "👶 ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಮಕ್ಕಳ ಭವಿಷ್ಯ (Progeny Blessings)" : isTe ? "👶 సంతాన ప్రాప్తి మరియు పిల్లలు (Progeny Blessings)" : isTa ? "👶 சந்ததி யோகம் மற்றும் குழந்தைகள் (Progeny Blessings)" : isHi ? "👶 संतान योग एवं बच्चों का भविष्य (Progeny Blessings)" : "👶 Progeny Timing & Children Wellbeing";
  }
  if (q.includes("foreign") || q.includes("visa") || q.includes("travel") || q.includes("abroad") || q.includes("ವಿದೇಶ") || q.includes("ಸ್ಥಳಾಂತರ")) {
    return isKn ? "✈️ ವಿದೇಶ ಯೋಗ ಹಾಗೂ ಸ್ಥಳಾಂತರ (Foreign Travel & Visa)" : isTe ? "✈️ విదేశీ ప్రయాణం మరియు వీసా (Foreign Travel & Visa)" : isTa ? "✈️ வெளிநாட்டுப் பயணம் (Foreign Travel & Visa)" : isHi ? "✈️ विदेश यात्रा एवं स्थानांतरण (Foreign Travel & Visa)" : "✈️ Foreign Travel, Visa & Relocation";
  }
  if (q.includes("health") || q.includes("disease") || q.includes("cure") || q.includes("ಆರೋಗ್ಯ")) {
    return isKn ? "🩺 ಆರೋಗ್ಯ ಹಾಗೂ ಆಯುಷ್ಯ ಶಮನ (Health & Wellbeing)" : isTe ? "🩺 ఆరోగ్యం మరియు ఆయుష్షు (Health & Wellbeing)" : isTa ? "🩺 ஆரோக்கியம் மற்றும் ஆயுள் (Health & Wellbeing)" : isHi ? "🩺 स्वास्थ्य एवं आरोग्य (Health & Wellbeing)" : "🩺 Health Stability & Vedic Remedies";
  }
  return isKn ? "✦ ವೈಯಕ್ತಿಕ ಜಾತಕ ಪ್ರಶ್ನೆ (Personalized Query)" : isTe ? "✦ వ్యక్తిగత ప్రశ్న (Personalized Query)" : isTa ? "✦ தனிப்பட்ட கேள்வி (Personalized Query)" : isHi ? "✦ व्यक्तिगत प्रश्न (Personalized Query)" : "✦ Personalized Astrological Inquiry";
}

export default function BhavishyaView() {
  const { predictions, currentMindset, isLoading, loadingText, ashirvada } = usePredictionEngine();
  const { t } = useTranslation();
  const session = useKundliViewerStore((state) => state.session);
  const language = useAppStore((state) => state.language);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfTranslations, setPdfTranslations] = useState<PdfTranslations | null>(null);
  const [pdfDeepInsights, setPdfDeepInsights] = useState<Record<string, string> | null>(null);

  const [isGeneratingPremiumPdf, setIsGeneratingPremiumPdf] = useState(false);
  const [isGeneratingPremiumPdfV1, setIsGeneratingPremiumPdfV1] = useState(false);
  const [v1PdfProgress, setV1PdfProgress] = useState(10);
  const [v1PdfStageText, setV1PdfStageText] = useState("");
  const [modalTriggerSource, setModalTriggerSource] = useState<"regular" | "v1">("regular");
  const [isPersonalizationModalOpen, setIsPersonalizationModalOpen] = useState(false);
  const [pdfLanguage, setPdfLanguage] = useState(language);
  const [premiumDataForPdf, setPremiumDataForPdf] = useState<PremiumData | null>(null);
  const [premiumPredictions, setPremiumPredictions] = useState<TranslatedPrediction[] | null>(null);
  const geminiApiKey = useAppStore((state) => state.geminiApiKey);
  const ayanamsaModel = useAppStore((state) => state.ayanamsaModel);

  // Follow the app language until the reader picks a PDF language of their own,
  // then leave their choice alone.
  const pdfLanguagePicked = useRef(false);
  useEffect(() => {
    if (!pdfLanguagePicked.current) setPdfLanguage(language);
  }, [language]);

  const pdfRef = useRef<HTMLDivElement>(null);
  const premiumPdfRef = useRef<HTMLDivElement>(null);
  const a4PdfRef = useRef<HTMLDivElement>(null);

  const [isGeneratingA4Pdf, setIsGeneratingA4Pdf] = useState(false);
  const [a4PremiumDataForPdf, setA4PremiumDataForPdf] = useState<PremiumData | null>(null);
  const [a4PdfTranslations, setA4PdfTranslations] = useState<PdfTranslations | null>(null);
  const [a4PdfDeepInsights, setA4PdfDeepInsights] = useState<Record<string, string> | null>(null);

  const [isGeneratingSummaryPdf, setIsGeneratingSummaryPdf] = useState(false);
  const [multiQuestions, setMultiQuestions] = useState<MultiQuestionItem[]>([]);
  const [mqTopic, setMqTopic] = useState<string>("career");
  const [mqInputText, setMqInputText] = useState<string>("");
  const [isListeningMQ, setIsListeningMQ] = useState<boolean>(false);
  const [isGeneratingMultiAnswers, setIsGeneratingMultiAnswers] = useState<boolean>(false);
  const [isGeneratingMultiPdf, setIsGeneratingMultiPdf] = useState<boolean>(false);
  const [multiPdfTranslations, setMultiPdfTranslations] = useState<PdfTranslations | null>(null);
  const multiPdfRef = useRef<HTMLDivElement>(null);
  const [summaryDataForPdf, setSummaryDataForPdf] = useState<SummaryPdfData | null>(null);
  const [summaryPdfTranslations, setSummaryPdfTranslations] = useState<PdfTranslations | null>(null);
  const summaryPdfRef = useRef<HTMLDivElement>(null);

  const [qTopic, setQTopic] = useState("general");
  const [qText, setQText] = useState("");
  const [isListeningQ, setIsListeningQ] = useState(false);

  const toggleQVoiceInput = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    if (isListeningQ) {
      setIsListeningQ(false);
      return;
    }
    try {
      const recognition = new SpeechRecognitionClass();
      const speechLangMap: Record<string, string> = { kn: "kn-IN", te: "te-IN", ta: "ta-IN", hi: "hi-IN", en: "en-IN" };
      recognition.lang = speechLangMap[pdfLanguage] || "en-IN";
      recognition.interimResults = false;
      recognition.onstart = () => setIsListeningQ(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) setQText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListeningQ(false);
      };
      recognition.onerror = () => setIsListeningQ(false);
      recognition.onend = () => setIsListeningQ(false);
      recognition.start();
    } catch {
      setIsListeningQ(false);
    }
  };

  const generateQuestionPDF = async () => {
    if (!session || isGeneratingSummaryPdf) return;
    setIsGeneratingSummaryPdf(true);

    try {
      const lang = pdfLanguage;
      const moonPlanet = session.result.planets.find(p => p.name === 'Moon');
      const now = new Date();
      const ageYears = ageDecimalYearsAt(
        session.input.birthDate,
        session.input.birthTime,
        session.input.latitude,
        session.input.longitude,
        now
      );
      const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);
      const mahaLord = currentBhuktiData ? toGraha(currentBhuktiData.maha.planet) : null;
      const bhuktiLord = currentBhuktiData ? toGraha(currentBhuktiData.bhukti) : null;

      const categoryObj = QUESTION_TOPICS.find(t => t.id === qTopic) || QUESTION_TOPICS[0];
      const topicLabel = categoryObj.label[lang as keyof typeof categoryObj.label] || categoryObj.label.en;
      const customQuery = qText.trim();
      const questionTitle = customQuery ? customQuery : topicLabel;
      const userPromptQuery = customQuery ? `[${topicLabel}] ${customQuery}` : topicLabel;

      const liveTransits = getTransitsForDate(session.result.moonSign.index, now, ayanamsaModel);
      const transitSummary = Object.entries(liveTransits).map(([planet, pos]) => `${planet} in House ${pos.house} from Moon`).join("; ");
      const planetPositions = session.result.planets.map(p => `${p.name} in House ${p.house} (${p.rashi.english})`).join(', ');

      const translatedData: PdfTranslations = {
        title: tp("title", lang),
        subtitle: questionTitle,
        nameLabel: tp("nameLabel", lang),
        nameValue: session.input.name,
        dobLabel: tp("dobLabel", lang),
        dobValue: formatBirthLine(lang, session.input.birthDate, session.input.birthTime),
        lagnaLabel: tp("lagnaLabel", lang),
        lagnaValue: session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "",
        moonLabel: tp("moonLabel", lang),
        moonValue: pick(RASHI_L5[session.result.moonSign.index], lang),
        nakshatraLabel: tp("nakshatraLabel", lang),
        nakshatraValue: moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : "",
        eraLabel: tp("eraLabel", lang),
        dashaLabel: tp("dashaLabel", lang),
        bhuktiLabel: tp("bhuktiLabel", lang),
        dashaPlanetValue: mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "",
        bhuktiPlanetValue: bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "",
        ashirvadaTitle: tp("ashirvadaTitle", lang),
        ashirvadaValue: await translateText("May divine wisdom guide your decisions and bring success.", lang),
        footer: tp("footer", lang),
        yogasTitle: tp("yogasTitle", lang),
        doshasTitle: tp("doshasTitle", lang),
        remedyTitle: tp("remedyTitle", lang),
        characteristicsTitle: tp("characteristicsTitle", lang),
        darkSecretTitle: tp("darkSecretTitle", lang),
        currentPhaseTitle: tp("currentPhaseTitle", lang),
        currentPhaseGuidanceTitle: tp("currentPhaseGuidanceTitle", lang),
        timelineTitle: tp("timelineTitle", lang),
        gocharaTitle: tp("gocharaTitle", lang),
        summaryTitle: tp("summaryTitle", lang),
        introTitle: tp("introTitle", lang),
        introGreeting: greetingLine(lang, session.input.name),
      };

      setSummaryPdfTranslations(translatedData);

      const qPrompt = `You are a world-class Vedic Astrologer. Generate a comprehensive 4-PARAGRAPH answer tailored EXCLUSIVELY to the user's specific query topic: "${userPromptQuery}".
OUTPUT LANGUAGE: ${lang}.${lang === 'kn' ? ' Write ONLY in Kannada script.' : lang === 'te' ? ' Write ONLY in Telugu script.' : lang === 'ta' ? ' Write ONLY in Tamil script.' : lang === 'hi' ? ' Write ONLY in Hindi (Devanagari).' : ' Write in clear English.'}

EXACT COMPUTED ASTROLOGICAL DATA:
- Name: ${session.input.name}
- Ascendant (Lagna): ${session.result.lagnaRashi?.english || 'Unknown'}
- Moon Sign: ${session.result.moonSign.english}
- Nakshatra: ${moonPlanet?.nakshatra.english || 'Unknown'}
- Running Dasha/Bhukti: ${currentBhuktiData ? currentBhuktiData.maha.planet + ' - ' + currentBhuktiData.bhukti : 'Current Dasha'}
- Planetary Placements: ${planetPositions}
- Live Transit Positions: ${transitSummary}

4-PARAGRAPH STRUCTURE REQUIRED:
PARAGRAPH 1 (Kundali House Analysis): Analyze the relevant natal houses and planetary placements for ${topicLabel}.
PARAGRAPH 2 (Dasha & Transit Influence): Analyze how current Dasha-Bhukti and live transits impact this specific topic right now.
PARAGRAPH 3 (Specific Predictions & Timing): Provide clear predictions, expected timing, and outcomes regarding their question.
PARAGRAPH 4 (Remedial Guidance & Blessing): Provide 2 specific remedies (Parihara/Mantra) and an encouraging astrologer's blessing.

Return ONLY this JSON format:
{
  "paragraph1": "...",
  "paragraph2": "...",
  "paragraph3": "...",
  "paragraph4": "..."
}`;

      let parsedSummary: SummaryPdfData | null = null;
      try {
        const rawRes = await askGemini(`Generate Question PDF: ${topicLabel}`, qPrompt, geminiApiKey, lang, { raw: true, temperature: 0.7 });
        const jsonMatch = rawRes.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsedSummary = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn("Question PDF AI generation failed, using fallback", e);
      }

      if (!parsedSummary || !parsedSummary.paragraph1 || parsedSummary.paragraph1.length < 100) {
        const p1 = await translateText(
          `According to the timeless principles of Vedic astrology and your personal Janma Kundali, the domain of ${topicLabel} is governed by your natal Lagna (${session.result.lagnaRashi?.english || "Ascendant"}), Moon sign (${session.result.moonSign.english}), and their ruling planetary lords. The alignment of your primary Kendra and Trikona houses establishes a clear karmic rhythm, indicating that your past efforts and intrinsic virtues are now converging to create focused opportunities and necessary transformations in this area of life. Recognizing your natural planetary dispositions will allow you to navigate upcoming situations with poise and clarity.`,
          lang
        );
        const p2 = await translateText(
          `Your running Dasha-Bhukti cycle, combined with the live Gochara transits of Saturn and Jupiter across your natal chart, activates a dynamic 12 to 18-month window of profound development. These planetary movements bring latent issues to the surface, demanding decisive yet balanced action while dismantling previous stagnation. Rather than being passive, this phase calls for strategic foresight, meticulous planning, and the courage to adapt to evolving family or professional circumstances.`,
          lang
        );
        const p3 = await translateText(
          `To extract the most auspicious outcomes regarding ${topicLabel}, you must anchor yourself in ethical discipline, patience, and deliberate execution. Avoid impulsive choices driven by momentary pressure, and instead consult trusted mentors or family elders before finalizing critical commitments. Channeling your creative energies consistently toward productive goals will turn apparent challenges into permanent stepping stones for long-term security, prosperity, and peace of mind.`,
          lang
        );
        const p4 = await translateText(
          `Recommended Vedic Remedy: Recite your Ishta Devata mantra and the Navagraha Stotram 108 times daily during morning Brahmi Muhurtha. Light a pure cow ghee or sesame oil lamp facing East in your household altar, offer yellow flowers or sweet offerings on auspicious days, and engage in selfless service (Seva) to cows or the needy. May the divine grace of Baggona Kshetra bestow peace, protection, and auspicious victory upon your path.`,
          lang
        );
        parsedSummary = { paragraph1: p1, paragraph2: p2, paragraph3: p3, paragraph4: p4 };
      }

      setSummaryDataForPdf(parsedSummary);
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!summaryPdfRef.current) throw new Error("Summary PDF ref not found");

      const containerEl = summaryPdfRef.current;
      const parentEl = containerEl.parentElement;
      const originalStyle = parentEl?.getAttribute("style") || "";
      if (parentEl) {
        parentEl.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; background-color: #FFFFFF;");
      }

      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 400));

      const canvas = await html2canvas(containerEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        allowTaint: true
      });

      if (parentEl) {
        parentEl.setAttribute("style", originalStyle);
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.75);
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: [pdfWidth, pdfHeight], compress: true });
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const langNames: Record<string, string> = { kn: "Kannada", ta: "Tamil", te: "Telugu", hi: "Hindi", en: "English" };
      const langName = langNames[pdfLanguage] || "English";
      pdf.save(`Baggona_Question_${qTopic}_${langName}_${session.input.name.replace(/\s+/g, '_')}.pdf`);

    } catch (err: any) {
      console.error("Error generating Question PDF:", err);
      alert(err.message || "Failed to generate Question PDF. Please try again.");
    } finally {
      setIsGeneratingSummaryPdf(false);
      setSummaryDataForPdf(null);
    }
  };

  const toggleMQVoiceInput = () => {
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechClass) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    try {
      const rec = new SpeechClass();
      const langMap: Record<string, string> = { kn: "kn-IN", te: "te-IN", ta: "ta-IN", hi: "hi-IN", en: "en-IN" };
      rec.lang = langMap[pdfLanguage] || "en-IN";
      rec.interimResults = false;
      rec.onstart = () => setIsListeningMQ(true);
      rec.onresult = (e: any) => {
        const transcript = e.results[0]?.[0]?.transcript;
        if (transcript) setMqInputText(transcript);
      };
      rec.onerror = () => setIsListeningMQ(false);
      rec.onend = () => setIsListeningMQ(false);
      rec.start();
    } catch {
      setIsListeningMQ(false);
    }
  };

  const handleAddMultiQuestion = (customQ?: string, topicId?: string) => {
    const customText = (customQ || mqInputText).trim();
    const isCustomTextProvided = Boolean(customText);

    if (isCustomTextProvided) {
      // User typed in the text box -> IGNORE dropdown completely!
      const smartHeader = generateSmartQuestionHeader(customText, pdfLanguage);
      setMultiQuestions(prev => [
        ...prev,
        {
          id: "mq_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
          topicId: "custom",
          topicLabel: smartHeader,
          smartHeader: smartHeader,
          isCustomQuestion: true,
          questionText: customText
        }
      ]);
    } else {
      // No custom text -> Use dropdown selection
      const targetTopicId = topicId || mqTopic;
      const topicObj = MULTI_QUESTION_TOPICS.find(t => t.id === targetTopicId) || MULTI_QUESTION_TOPICS[0];
      const topicLabel = topicObj.label[pdfLanguage as keyof typeof topicObj.label] || topicObj.label.en;
      const defaultText = topicObj.defaultQ[pdfLanguage as keyof typeof topicObj.defaultQ] || topicObj.defaultQ.en;

      setMultiQuestions(prev => [
        ...prev,
        {
          id: "mq_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
          topicId: targetTopicId,
          topicLabel: topicLabel,
          smartHeader: topicLabel,
          isCustomQuestion: false,
          questionText: defaultText
        }
      ]);
    }

    setMqInputText("");
  };

  const handleRemoveMultiQuestion = (id: string) => {
    setMultiQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleGenerateMultiAnswers = async () => {
    if (!session || multiQuestions.length === 0 || isGeneratingMultiAnswers) return;
    setIsGeneratingMultiAnswers(true);

    const lang = pdfLanguage;
    const moonPlanet = session.result.planets.find(p => p.name === 'Moon');
    const now = new Date();
    const ageYears = ageDecimalYearsAt(session.input.birthDate, session.input.birthTime, session.input.latitude, session.input.longitude, now);
    const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);

    const updatedList = [...multiQuestions];

    for (let i = 0; i < updatedList.length; i++) {
      const q = updatedList[i];

      if (q.isCustomQuestion) {
        q.smartHeader = generateSmartQuestionHeader(q.questionText, lang);
        q.topicLabel = q.smartHeader;
      } else {
        const topicObj = MULTI_QUESTION_TOPICS.find(t => t.id === q.topicId);
        if (topicObj) {
          q.topicLabel = topicObj.label[lang as keyof typeof topicObj.label] || topicObj.label.en;
          q.smartHeader = q.topicLabel;
        }
      }

      // Compute Master Engine house analysis for the question
      const planetPositions = session.result.planets.map(p => `${p.name} in House ${p.house} (${p.rashi.english})`).join(', ');
      const lagnaLord = RASHI_LORDS_L5[lang]?.[session.result.lagnaRashi?.index ?? 0] || 'Lagna Lord';
      const house10Lord = RASHI_LORDS_L5[lang]?.[((session.result.lagnaRashi?.index ?? 0) + 9) % 12] || '10th Lord';
      const house7Lord = RASHI_LORDS_L5[lang]?.[((session.result.lagnaRashi?.index ?? 0) + 6) % 12] || '7th Lord';
      const house5Lord = RASHI_LORDS_L5[lang]?.[((session.result.lagnaRashi?.index ?? 0) + 4) % 12] || '5th Lord';
      const house4Lord = RASHI_LORDS_L5[lang]?.[((session.result.lagnaRashi?.index ?? 0) + 3) % 12] || '4th Lord';
      const house2Lord = RASHI_LORDS_L5[lang]?.[((session.result.lagnaRashi?.index ?? 0) + 1) % 12] || '2nd Lord';

      const qPrompt = `You are a world-class Vedic Astrologer. Generate a comprehensive, 4-PARAGRAPH answer tailored EXCLUSIVELY to the user's query: "${q.questionText}" (Header: ${q.smartHeader || q.topicLabel}).
CRITICAL LANGUAGE MANDATE:
- OUTPUT LANGUAGE: ${lang}.
- ${lang === 'kn' ? 'Write ONLY in Kannada script. Zero English words.' : lang === 'te' ? 'Write ONLY in Telugu script. Zero English words.' : lang === 'ta' ? 'Write ONLY in Tamil script. Zero English words.' : lang === 'hi' ? 'Write ONLY in Hindi (Devanagari script). Zero English words.' : 'Write in clear English.'}

MASTER ENGINE COMPUTED KUNDALI DATA:
- Name: ${session.input.name}
- Lagna: ${session.result.lagnaRashi?.english || 'Unknown'} (Lord: ${lagnaLord})
- Moon Sign: ${session.result.moonSign.english} (${pick(RASHI_L5[session.result.moonSign.index], lang)})
- Nakshatra: ${moonPlanet?.nakshatra.english || 'Unknown'} (${moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : ''})
- Key House Lords: 10th Lord (Career): ${house10Lord}, 7th Lord (Marriage): ${house7Lord}, 5th Lord (Progeny): ${house5Lord}, 4th Lord (Property): ${house4Lord}, 2nd Lord (Wealth): ${house2Lord}
- Planetary Placements: ${planetPositions}
- Running Dasha/Bhukti: ${currentBhuktiData ? currentBhuktiData.maha.planet + ' - ' + currentBhuktiData.bhukti : 'Current Dasha'}
- Current Age: ${ageYears.toFixed(1)} years

REQUIRED 4-PARAGRAPH STRUCTURE:
PARAGRAPH 1 (Natal House Analysis): Analyze the relevant natal houses, house lords, and planetary placements from the chart for this specific query (at least 5-6 lines).
PARAGRAPH 2 (Dasha & Gochara Transits): Analyze how current Dasha-Bhukti and live transits (Saturn, Jupiter, Rahu/Ketu) impact this specific topic (at least 5-6 lines).
PARAGRAPH 3 (Specific Predictions & Timing Window): Provide clear predictions, expected timing, and specific outcomes regarding their query (at least 5-6 lines).
PARAGRAPH 4 (Parihara & Recommended Remedies): Provide 2 specific remedies (Parihara/Mantra/Charity) and an encouraging astrologer's blessing.

Return ONLY this JSON format:
{
  "p1": "...",
  "p2": "...",
  "p3": "...",
  "remedy": "..."
}`;

      try {
        const rawRes = await askGemini(`Generate Multi Question: ${q.topicLabel}`, qPrompt, geminiApiKey, lang, { raw: true, temperature: 0.7 });
        const jsonMatch = rawRes.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          updatedList[i].answer = {
            paragraph1: parsed.p1 || parsed.paragraph1 || "",
            paragraph2: parsed.p2 || parsed.paragraph2 || "",
            paragraph3: parsed.p3 || parsed.paragraph3 || "",
            paragraph4: parsed.remedy || parsed.p4 || parsed.paragraph4 || ""
          };
        }
      } catch (e) {
        console.warn("Error generating answer for question", q.id, e);
      }
      const currentAns = updatedList[i].answer;
      if (!currentAns || !currentAns.paragraph1 || currentAns.paragraph1.trim().length < 100) {
        const p1 = await translateText(
          `Analyzing your personal Janma Kundali regarding ${q.topicLabel}, the planetary dispositions of your Lagna (${session.result.lagnaRashi?.english || "Ascendant"}) and Moon sign (${session.result.moonSign.english}) generate concentrated cosmic momentum. The lords governing your key Kendra and Trikona houses are currently directing their planetary rays toward this specific life facet, highlighting both inherent karmic strengths and areas requiring refined focus. This configuration indicates that you are entering a pivotal phase of growth and clarity.`,
          lang
        );
        const p2 = await translateText(
          `The cosmic backdrop of your active Dasha-Bhukti period, synchronized with the pivotal Gochara transits of Devaguru Jupiter and Karmakaraka Saturn, will trigger significant developments over the next 12 to 18 months. During this timeline, subtle opportunities will present themselves to resolve lingering uncertainties, stabilize your trajectory, and establish firmer ground. Paying attention to timing and maintaining steady perseverance will unlock doors that previously appeared closed.`,
          lang
        );
        const p3 = await translateText(
          `Achieving maximum success in this sector requires disciplined execution, measured speech, and harmonious coordination with those around you. Steer clear of unvetted shortcuts or hasty decisions; enduring progress is forged through methodical steps and adherence to righteous principles (Dharma). Balancing ambition with inner calm will ensure that any temporary obstacles are smoothly navigated, leaving you with lasting fulfillment and tangible rewards.`,
          lang
        );
        const p4 = await translateText(
          `Recommended Vedic Remedy: Perform morning prayer facing East, recite the Gayatri Mantra or core planetary Beeja Mantras 108 times with focused devotion, and maintain an oil lamp at your altar at twilight. Practicing charity by feeding birds or offering grain to the deserving on Saturdays strengthens positive planetary vibrations. May divine blessings guide your journey toward auspicious fulfillment and total peace.`,
          lang
        );
        updatedList[i].answer = { paragraph1: p1, paragraph2: p2, paragraph3: p3, paragraph4: p4 };
      }
    }

    setMultiQuestions(updatedList);
    setIsGeneratingMultiAnswers(false);
  };

  const generateMultiQuestionPDF = async () => {
    if (!session || multiQuestions.length === 0 || isGeneratingMultiPdf) return;

    if (multiQuestions.some(q => !q.answer)) {
      await handleGenerateMultiAnswers();
    }

    setIsGeneratingMultiPdf(true);

    try {
      const lang = pdfLanguage;
      const moonPlanet = session.result.planets.find(p => p.name === 'Moon');
      const now = new Date();
      const ageYears = ageDecimalYearsAt(session.input.birthDate, session.input.birthTime, session.input.latitude, session.input.longitude, now);
      const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);
      const mahaLord = currentBhuktiData ? toGraha(currentBhuktiData.maha.planet) : null;
      const bhuktiLord = currentBhuktiData ? toGraha(currentBhuktiData.bhukti) : null;

      const ashirvadaSource = ashirvada || "May the divine forces grant you strength, clarity and peace.";

      // Strictly translate Name if target language is non-English
      let translatedName = session.input.name;
      if (lang !== "en") {
        try {
          translatedName = await translateText(session.input.name, lang);
        } catch {
          translatedName = session.input.name;
        }
      }

      const translatedData: PdfTranslations = {
        title: tp("title", lang),
        subtitle: await translateText("Special Multi-Question Astrological Predictions & Remedies Report", lang),
        nameLabel: tp("nameLabel", lang),
        nameValue: translatedName,
        dobLabel: tp("dobLabel", lang),
        dobValue: formatBirthLine(lang, session.input.birthDate, session.input.birthTime),
        lagnaLabel: tp("lagnaLabel", lang),
        lagnaValue: session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "",
        moonLabel: tp("moonLabel", lang),
        moonValue: pick(RASHI_L5[session.result.moonSign.index], lang),
        nakshatraLabel: tp("nakshatraLabel", lang),
        nakshatraValue: moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : "",
        eraLabel: tp("eraLabel", lang),
        dashaLabel: tp("dashaLabel", lang),
        bhuktiLabel: tp("bhuktiLabel", lang),
        dashaPlanetValue: mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "",
        bhuktiPlanetValue: bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "",
        ashirvadaTitle: tp("ashirvadaTitle", lang),
        ashirvadaValue: await translateText(ashirvadaSource, lang),
        footer: tp("footer", lang),
        yogasTitle: tp("yogasTitle", lang),
        doshasTitle: tp("doshasTitle", lang),
        remedyTitle: tp("remedyTitle", lang),
        characteristicsTitle: tp("characteristicsTitle", lang),
        darkSecretTitle: tp("darkSecretTitle", lang),
        timelineTitle: tp("timelineTitle", lang),
        gocharaTitle: tp("gocharaTitle", lang),
        summaryTitle: tp("summaryTitle", lang),
        introTitle: tp("introTitle", lang),
        introGreeting: greetingLine(lang, session.input.name),
      };

      setMultiPdfTranslations(translatedData);

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!multiPdfRef.current) throw new Error("Multi PDF ref not found");

      const containerEl = multiPdfRef.current;
      const parentEl = containerEl.parentElement;
      const originalStyle = parentEl?.getAttribute("style") || "";
      if (parentEl) {
        parentEl.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; background-color: #FFFFFF;");
      }

      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 400));

      const canvas = await html2canvas(containerEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        allowTaint: true
      });

      if (parentEl) {
        parentEl.setAttribute("style", originalStyle);
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.75);
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: [pdfWidth, pdfHeight], compress: true });
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const langNames: Record<string, string> = { kn: "Kannada", ta: "Tamil", te: "Telugu", hi: "Hindi", en: "English" };
      const langName = langNames[pdfLanguage] || "English";
      pdf.save(`Baggona_Multi_Question_${langName}_${session.input.name.replace(/\s+/g, '_')}.pdf`);

    } catch (err: any) {
      console.error("Error generating Multi-Question PDF:", err);
      alert(err.message || "Failed to generate Multi-Question PDF. Please try again.");
    } finally {
      setIsGeneratingMultiPdf(false);
    }
  };

  const generateSummaryPDF = async () => {
    if (!session || isGeneratingSummaryPdf) return;
    setIsGeneratingSummaryPdf(true);

    try {
      const lang = pdfLanguage;
      const moonPlanet = session.result.planets.find(p => p.name === 'Moon');
      const now = new Date();
      const ageYears = ageDecimalYearsAt(
        session.input.birthDate,
        session.input.birthTime,
        session.input.latitude,
        session.input.longitude,
        now
      );
      const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);
      const mahaLord = currentBhuktiData ? toGraha(currentBhuktiData.maha.planet) : null;
      const bhuktiLord = currentBhuktiData ? toGraha(currentBhuktiData.bhukti) : null;

      const ashirvadaSource = ashirvada || "May the divine forces grant you strength, clarity and peace.";

      const translatedData: PdfTranslations = {
        title: tp("title", lang),
        subtitle: "",
        nameLabel: tp("nameLabel", lang),
        nameValue: session.input.name,
        dobLabel: tp("dobLabel", lang),
        dobValue: formatBirthLine(lang, session.input.birthDate, session.input.birthTime),
        lagnaLabel: tp("lagnaLabel", lang),
        lagnaValue: session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "",
        moonLabel: tp("moonLabel", lang),
        moonValue: pick(RASHI_L5[session.result.moonSign.index], lang),
        nakshatraLabel: tp("nakshatraLabel", lang),
        nakshatraValue: moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : "",
        eraLabel: tp("eraLabel", lang),
        dashaLabel: tp("dashaLabel", lang),
        bhuktiLabel: tp("bhuktiLabel", lang),
        dashaPlanetValue: mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "",
        bhuktiPlanetValue: bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "",
        ashirvadaTitle: tp("ashirvadaTitle", lang),
        ashirvadaValue: await translateText(ashirvadaSource, lang),
        footer: tp("footer", lang),
        yogasTitle: tp("yogasTitle", lang),
        doshasTitle: tp("doshasTitle", lang),
        remedyTitle: tp("remedyTitle", lang),
        characteristicsTitle: tp("characteristicsTitle", lang),
        darkSecretTitle: tp("darkSecretTitle", lang),
        timelineTitle: tp("timelineTitle", lang),
        gocharaTitle: tp("gocharaTitle", lang),
        summaryTitle: tp("summaryTitle", lang),
        introTitle: tp("introTitle", lang),
        introGreeting: greetingLine(lang, session.input.name),
      };

      setSummaryPdfTranslations(translatedData);

      const userGender = (session.input as any).gender || "Male";

      const summaryPrompt = `You are a world-class Vedic Astrologer. Generate a deeply personal 4-paragraph comprehensive summary focusing ON WHAT IS CURRENTLY HAPPENING IN THIS PERSON'S LIFE based on their natal chart and live transits.
OUTPUT LANGUAGE: ${lang}.${lang === 'kn' ? ' Write ONLY in Kannada script.' : lang === 'te' ? ' Write ONLY in Telugu script.' : lang === 'ta' ? ' Write ONLY in Tamil script.' : lang === 'hi' ? ' Write ONLY in Hindi (Devanagari).' : ' Write in clear English.'}

USER PROFILE & CHART DETAILS:
- Devotee Name: ${session.input.name}
- Current Age: ${ageYears.toFixed(1)} years (${ageYears >= 60 ? "Senior Citizen - Focus on health, family unity, grandchildren, peace, letting go of worldly race" : ageYears < 23 ? "Youth / Student - Focus on education, vocational clarity, exams, emotional stability" : "Working Adult - Focus on career stability, family responsibilities, finances, domestic harmony"})
- Ascendant (Lagna): ${session.result.lagnaRashi?.english || 'Unknown'}
- Moon Sign: ${session.result.moonSign.english}
- Nakshatra: ${moonPlanet?.nakshatra.english || 'Unknown'}
- Current Running Dasha & Bhukti: ${currentBhuktiData ? currentBhuktiData.maha.planet + ' - ' + currentBhuktiData.bhukti : 'Current Dasha'}

CRITICAL PERSONALIZATION RULES:
1. Address ${session.input.name} directly with deep reverence, warmth, and intimacy. Speak to their immediate lived reality.
2. Mirror what is actually happening in their day-to-day life at age ${Math.floor(ageYears)} right now under this Dasha-Bhukti and live transits.
3. No textbook house numbers or dry academic jargon.

REQUIRED 4 PARAGRAPHS STRUCTURE:
PARAGRAPH 1 (Current Living Reality & Dasha-Bhukti State): Address ${session.input.name} directly. Detail the core planetary theme and current psychological/life chapter governed by ${currentBhuktiData?.maha.planet} Mahadasha and ${currentBhuktiData?.bhukti} Bhukti right now.
PARAGRAPH 2 (Gochara Planetary Transits): Detail how current major transits (Gochara - Saturn, Jupiter, Rahu/Ketu) are influencing their Moon sign and birth planets currently.
PARAGRAPH 3 (Immediate Life Outlook & Timing): Describe what is currently manifesting in their immediate life (career/finance/family/health) during this exact phase. Give key timing advice tailored to their life stage.
PARAGRAPH 4 (Remedial Guidance & Blessing): Provide 2 practical remedies (Parihara/Mantra/Charity) and an encouraging Baggona Kshetra blessing for their current phase.

Return ONLY this JSON format:
{
  "paragraph1": "...",
  "paragraph2": "...",
  "paragraph3": "...",
  "paragraph4": "..."
}`;

      let parsedSummary: SummaryPdfData | null = null;
      try {
        const rawRes = await askGemini("Generate Current Summary PDF", summaryPrompt, geminiApiKey, lang, { raw: true, temperature: 0.7 });
        const jsonMatch = rawRes.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedSummary = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn("AI summary generation failed, using structured fallback", e);
      }

      if (!parsedSummary || !parsedSummary.paragraph1 || parsedSummary.paragraph1.length < 100) {
        const fallbackCurrentPhase = buildKundaliCurrentPhaseFallback(
          lang,
          session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "",
          pick(RASHI_L5[session.result.moonSign.index], lang),
          mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "Dasha",
          bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "Bhukti",
          session.input.name,
          ageYears,
          userGender
        );
        const paras = fallbackCurrentPhase.split("\n\n").filter(p => p.trim().length > 0);
        parsedSummary = {
          paragraph1: paras[0] || fallbackCurrentPhase,
          paragraph2: paras[1] || "",
          paragraph3: paras[2] || "",
          paragraph4: paras[3] || ""
        };
      }

      setSummaryDataForPdf(parsedSummary);

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!summaryPdfRef.current) throw new Error("Summary PDF ref not found");

      const containerEl = summaryPdfRef.current;
      const parentEl = containerEl.parentElement;
      const originalStyle = parentEl?.getAttribute("style") || "";
      if (parentEl) {
        parentEl.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; background-color: #FFFFFF;");
      }

      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 400));

      const canvas = await html2canvas(containerEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        allowTaint: true
      });

      if (parentEl) {
        parentEl.setAttribute("style", originalStyle);
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.75);
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: [pdfWidth, pdfHeight], compress: true });
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const langNames: Record<string, string> = { "kn": "Kannada", "ta": "Tamil", "te": "Telugu", "hi": "Hindi", "en": "English" };
      const langName = langNames[pdfLanguage] || "English";
      pdf.save(`Baggona_Current_Summary_${langName}_${session.input.name.replace(/\s+/g, '_')}.pdf`);

    } catch (err: any) {
      console.error("Error generating Summary PDF:", err);
      alert(err.message || "Failed to generate 4-Paragraph Summary PDF. Please try again.");
    } finally {
      setIsGeneratingSummaryPdf(false);
      setSummaryDataForPdf(null);
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPdf(true);

    try {
      if (!session) throw new Error("No session");

      const moonPlanet = session.result.planets.find(p => p.name === 'Moon');
      const baseNakshatra = moonPlanet ? (moonPlanet.nakshatra.sanskrit || moonPlanet.nakshatra.english) : 'Unknown';

      const ashirvadaText = ashirvada || `Based on your planetary alignments and current cosmic era, may the divine forces grant you strength, clarity, and peace. Trust in your inner resilience and allow the universe to guide your path.`;

      // Get current Dasha/Bhukti
      const now = new Date();
      const ageYears = ageDecimalYearsAt(
        session.input.birthDate,
        session.input.birthTime,
        session.input.latitude,
        session.input.longitude,
        now
      );
      const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);

      let dashaPlanetValue = "";
      let bhuktiPlanetValue = "";

      if (currentBhuktiData) {
        dashaPlanetValue = await translateText(currentBhuktiData.maha.planet, language);
        bhuktiPlanetValue = await translateText(currentBhuktiData.bhukti, language);
      }

      // Format DOB
      let formattedDob = "";
      try {
        const dobDate = parseISO(session.input.birthDate);
        formattedDob = format(dobDate, "dd MMM yyyy");
      } catch (e) {
        formattedDob = session.input.birthDate;
      }

      // Combine Date and Time
      const dobWithTime = `${formattedDob}, ${session.input.birthTime}`;

      // 1. Fetch exact translations for the PDF headers and values to guarantee full language consistency
      const translatedData: PdfTranslations = {
        title: await translateText("Baggona Panchanga Prediction", language),
        subtitle: await translateText("Personalized Cosmic Reading", language),

        nameLabel: await translateText("Name", language),
        nameValue: await translateText(session.input.name, language),

        dobLabel: await translateText("Birth Details", language),
        dobValue: await translateText(dobWithTime, language), // Translates the whole "25 Mar 1990, 10:30" string naturally

        lagnaLabel: await translateText("Birth Lagna (Ascendant)", language),
        lagnaValue: await translateText(session.result.lagnaRashi?.sanskrit || 'Unknown', language),

        moonLabel: await translateText("Moon Sign (Rashi)", language),
        moonValue: await translateText(session.result.moonSign.sanskrit, language),

        nakshatraLabel: await translateText("Nakshatra", language),
        nakshatraValue: await translateText(baseNakshatra, language),

        eraLabel: await translateText("Current Cosmic Era", language),
        dashaLabel: await translateText("Dasha", language),
        bhuktiLabel: await translateText("Bhukti", language),

        dashaPlanetValue,
        bhuktiPlanetValue,

        ashirvadaTitle: await translateText("Astrologer's Blessing (Ashirvada)", language),
        ashirvadaValue: await translateText(ashirvadaText, language),
        footer: await translateText("Generated gracefully by Baggona Panchanga Astrology Engine", language),
        yogasTitle: await translateText("Special Planetary Combinations (Yogas)", language),
        doshasTitle: await translateText("Karmic Challenges (Doshas)", language),
        remedyTitle: await translateText("Recommended Remedy:", language),
        characteristicsTitle: await translateText("Characteristics (Vyaktitva)", language),
        darkSecretTitle: await translateText("The Dark Secret (Nigoodha Satya)", language),
        timelineTitle: await translateText("6-Month Planetary Timeline", language),
        gocharaTitle: tp("gocharaTitle", language),
        summaryTitle: await translateText("Astrologer's Summary", language),
      };

      setPdfTranslations(translatedData);

      // Generate deep insights
      const deepInsights: Record<string, string> = {};
      for (const pred of predictions) {
        deepInsights[pred.translatedCategory] = pred.translatedText;
      }
      setPdfDeepInsights(deepInsights);

      // 2. Wait for React to flush the state to the hidden PdfTemplate component
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!pdfRef.current) throw new Error("PDF ref not found");

      // 3. Generate PDF
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.75);

      // Fixed width in mm (A4 width = 210)
      const pdfWidth = 210;
      // Calculate dynamic height based on the canvas aspect ratio
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Create a PDF with a CUSTOM page height so it NEVER cuts off the content across multiple pages!
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: [pdfWidth, pdfHeight], compress: true });

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Baggona_Prediction_${session?.input.name.replace(/\s+/g, '_') || 'Reading'}.pdf`);

    } catch (error: any) {
      console.error("Error generating PDF:", error);
      alert(error.message || "Failed to generate complete PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };



  function buildKundaliCharacteristicsFallback(lang: string, lagnaStr: string, moonStr: string, dashaStr: string, bhuktiStr: string): string {
    const baseLang = (lang || "en").split("-")[0];
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${lagnaStr}), ಚಂದ್ರ ರಾಶಿ (${moonStr}) ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaStr} ಮಹಾದಶೆಯ ಶುಭ ಪ್ರಭಾವವು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ವಿಶಿಷ್ಟವಾದ ತೇಜಸ್ಸು ಹಾಗೂ ಬಲವನ್ನು ತುಂಬುತ್ತದೆ. ನೀವು ಸ್ವಾಭಾವಿಕವಾಗಿಯೇ ಉನ್ನತ ತರ್ಕಜ್ಞಾನ, ದೃಢ ಮನೋಬಲ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಅತ್ಯಂತ ಶಿಸ್ತಿನಿಂದ ನಿರ್ವಹಿಸುವ ನಾಯಕತ್ವ ಗುಣಗಳನ್ನು ಹೊಂದಿದ್ದೀರಿ. ಗ್ರಹಗಳ ಬಲವಾದ ಸ್ಥಿತಿಯಿಂದಾಗಿ ನಿಮ್ಮ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಸ್ಪಷ್ಟತೆ ಹಾಗೂ ಭವಿಷ್ಯದ ಯೋಜನೆಗಳಲ್ಲಿ ದೂರದರ್ಶಿತ್ವ ಎದ್ದು ಕಾಣುತ್ತದೆ. ಸಮಾಜದಲ್ಲಿ ಧಾರ್ಮಿಕ ಗೌರವ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಮೌಲ್ಯಗಳನ್ನು ಕಾಯ್ದುಕೊಂಡು ನಡೆಯುವುದು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ಮುಖ್ಯ ಲಕ್ಷಣವಾಗಿದೆ.\n\nಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${bhuktiStr} ಭುಕ್ತಿ ಕಾಲವು ನಿಮ್ಮ ಆಂತರಿಕ ಚೇತನವನ್ನು ಮತ್ತಷ್ಟು ಜಾಗೃತಗೊಳಿಸಲಿದೆ. ಈ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ನವೀನ ಆಲೋಚನೆಗಳು ಮೂಡಿಬರಲಿದ್ದು, ಕೈಗೊಂಡ ಕಾರ್ಯಗಳಲ್ಲಿ ಸತತ ಪ್ರಯತ್ನ ಹಾಗೂ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಶ್ರೇಷ್ಠ ಗೌರವ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಗ್ರಹಗಳ ಅನುಕೂಲಕರ ಸಂಚಾರವು ನಿಮ್ಮ ಉದ್ಯೋಗ, ವೈಯಕ್ತಿಕ ಸಂಬಂಧಗಳು ಹಾಗೂ ಸಾಮಾಜಿಕ ಸಂಪರ್ಕಗಳಲ್ಲಿ ಹೊಸ ಉತ್ಸಾಹ ಹಾಗೂ ಸ್ಥಿರತೆಯನ್ನು ತರಲಿದೆ. ನಿಮ್ಮ ಮಾತಿನ ವೈಖರಿ ಹಾಗೂ ಸೌಮ್ಯ ಸ್ವಭಾವವು ಎಲ್ಲರ ಮೆಚ್ಚುಗೆಗೆ ಪಾತ್ರವಾಗಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी जन्म लग्न (${lagnaStr}), चंद्र राशि (${moonStr}) और वर्तमान ${dashaStr} महादशा का प्रभाव आपके व्यक्तित्व को अत्यंत प्रभावशाली और दूरदर्शी बनाता है। आप प्राकृतिक रूप से उच्च तार्किक क्षमता, दृढ इच्छाशक्ति और पारिवारिक उत्तरदायित्वों को निष्ठापूर्वक निभाने वाले गुणों से संपन्न हैं। ग्रहों के इस शुभ प्रभाव से आपके निर्णयों में स्पष्टता और जीवन में दीर्घकालिक लक्ष्यों के प्रति अटूट समर्पण दिखाई देता है।\n\nवर्तमान ${bhuktiStr} भुक्ति का प्रभाव आपकी आंतरिक ऊर्जा को और मजबूत करेगा। इस समय आपके मन में नए विचार और योजनाएं आकार लेंगी, जिससे आपके करियर और सामाजिक जीवन में सम्मान और सफलता की प्राप्ति होगी। ग्रहों का गोचर आपके व्यक्तिगत संबंधों और पेशेवर क्षेत्र में नई ऊर्जा का संचार करेगा। आपका सौम्य व्यवहार और बुद्धिमत्ता आपको हर क्षेत्र में आगे बढ़ाएगी।`;
    }
    if (baseLang === "te") {
      return `మీ జన్మ లగ్నం (${lagnaStr}), చంద్ర రాశి (${moonStr}) మరియు ప్రస్తుత ${dashaStr} మహాతశ ప్రభావం మీ వ్యక్తిత్వానికి విశేషమైన తేజస్సును మరియు మానసిక బలాన్ని అందిస్తాయి. మీరు సహజంగానే అత్యున్నత తార్కిక జ్ఞానం, స్థిరమైన సంకల్ప బలం మరియు కుటుంబ బాధ్యతలను క్రమశిక్షణతో నిర్వహించే నాయకత్వ లక్షణాలను కలిగి ఉన్నారు. గ్రహాల అనుకూలత వలన మీ నిర్ణయాలలో స్పష్టత కనిపిస్తుంది.\n\nప్రస్తుత ${bhuktiStr} భుక్తి కాలం మీ అంతర్గత చైతన్యాన్ని మరింత నింపుతుంది. ఈ సమయంలో మీ ఆలోచనలు సత్ఫలితాలను ఇస్తాయి, అలాగే మీ శ్రమకు తగిన గౌరవం మరియు గుర్తింపు లభిస్తాయి. గ్రహాల గోచార బలం మీ ఉద్యోగం మరియు వ్యక్తిగత జీవితంలో నూతన ఉత్సాహాన్ని మరియు స్థిరత్వాన్ని తీసుకువస్తుంది. మీ సౌమ్య స్వభావం అందరి ఆదరాభిమానాలను పొందుతుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் லக்னம் (${lagnaStr}), சந்திர ராசி (${moonStr}) மற்றும் தற்போதைய ${dashaStr} தசா காலம் உங்கள் ஆளுமைக்கு மிகுந்த வலிமையையும் நற்பெயரையும் தருகிறது. நீங்கள் இயற்கையாகவே சிறந்த அறிவாற்றலும், தெளிவான சிந்தனையும், குடும்பப் பொறுப்புகளை சீராக நிறைவேற்றும் நற்பண்புகளையும் கொண்டவர். கிரகங்களின் சுப பலத்தால் உங்கள் முடிவுகள் தெளிவுடனும் தொலைநோக்குப் பார்வையுடனும் இருக்கும்.\n\nதற்போதைய ${bhuktiStr} புக்தி காலம் உங்கள் உள்மன ஆற்றலை மேலும் உயர்த்தும். இந்த காலத்தில் உங்கள் முயற்சிகளுக்கு ஏற்ற பலனும் சமூகத்தில் நன்மதிப்பும் கிடைக்கும். கிரகங்களின் சுப பெயர்ச்சி உங்கள் தொழில் மற்றும் தனிப்பட்ட வாழ்க்கையில் புதிய புத்துணர்ச்சியையும் நிலையான வளர்ச்சியையும் தரும்.`;
    }
    return `Based on your birth Lagna (${lagnaStr}), Moon sign (${moonStr}), and running ${dashaStr} Mahadasha, your personality is imbued with strong intellect, resilience, and natural leadership capabilities. You possess a sharp analytical mind and a deeply rooted sense of responsibility toward your family and professional pursuits. The planetary strength endows you with strategic clarity, enabling you to navigate complex life situations with grace and determination.\n\nYour current ${bhuktiStr} Bhukti sub-period further activates your inner drive and psychological expansion. During this cosmic phase, creative thoughts and long-term aspirations take tangible shape. Benefic planetary transits foster meaningful connections, professional recognition, and personal fulfillment, ensuring that your actions inspire respect and harmony among your peers.`;
  }

  function buildKundaliDarkSecretFallback(lang: string, lagnaStr: string, moonStr: string, dashaStr: string, bhuktiStr: string): string {
    const baseLang = (lang || "en").split("-")[0];
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದ ಅಷ್ಟಮ ಹಾಗೂ ದ್ವಾದಶ ಭಾವಗಳ ಕರ್ಮಿಕ ಸಂರಚನೆ, ರಾಹು-ಕೇತುಗಳ ಸ್ಥಿತಿ ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaStr} ದಶೆಯ ಆಂತರಿಕ ಪ್ರಭಾವವು ನಿಮ್ಮ ಆತ್ಮದ ಆಳದಲ್ಲಿ ಅಡಗಿರುವ ಗೂಢ ರಹಸ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ನೀವು ಹೊರನೋಟಕ್ಕೆ ಅತ್ಯಂತ ಶಾಂತ ಹಾಗೂ ಧೈರ್ಯಶಾಲಿಯಾಗಿ ಕಂಡುಬಂದರೂ, ಒಳಗಿನ ಮನಸ್ಸಿನಲ್ಲಿ ಹಳೆಯ ಘಟನೆಗಳ ಕಲ್ಪನೆ, ಅನಗತ್ಯ ಭೀತಿ ಅಥವಾ ಭಾವನಾತ್ಮಕ ಒಂಟಿತನದ ಅನಿಸಿಕೆಗಳು ಒಮ್ಮೊಮ್ಮೆ ಬಾಧಿಸಬಹುದು. ಇತರರಿಗೆ ಸಹಾಯ ಮಾಡುವ ಗುಣವಿದ್ದರೂ, ನಿಮ್ಮ ಸ್ವಂತ ನೋವುಗಳನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳದೆ ಒಳಗಡೆಯೇ ಮುಚ್ಚಿಡುವ ಪ್ರವೃತ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ.\n\nಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${bhuktiStr} ಭುಕ್ತಿ ಕಾಲವು ಈ ಕರ್ಮಿಕ ಮಾನಸಿಕ ಸಂಕೋಲೆಗಳಿಂದ ಮುಕ್ತಿ ಪಡೆಯುವ ಸುಸಮಯವಾಗಿದೆ. ನಿಮ್ಮ ಆಂತರಿಕ ಭಯಗಳನ್ನು ನಿವಾರಿಸಿಕೊಳ್ಳಲು ನಿತ್ಯವೂ ಧ್ಯಾನ, ನವಗ್ರಹ ಸ್ತೋತ್ರ ಪಠಣ ಹಾಗೂ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಶಮನ ಪರಿಹಾರವಾಗಿದೆ. ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಅರಿವು ಜಾಗೃತಗೊಂಡಾಗ, ಈ ಮಾನಸಿಕ ಸಂಕಟಗಳು ದೂರವಾಗಿ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅಪಾರ ಆತ್ಮಶಾಂತಿ ಹಾಗೂ ಶಾಶ್ವತ ಸಿದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली के अष्टम और द्वादश भाव का कर्मिक प्रभाव, राहू-केतु की स्थिति तथा वर्तमान ${dashaStr} महादशा आपके भीतर एक गहरे आध्यात्मिक और रहस्यात्मक अनुभव का संकेत देती है। बाहर से शांत और सुदृढ़ दिखने के बावजूद, आपके मन के भीतर कभी-कभी अतीत की स्मृतियां, अज्ञात चिंताएं या भावनात्मक अकेलापन महसूस हो सकता है। आप अपने दुखों को दूसरों से साझा किए बिना स्वयं के भीतर समेटने की प्रवृत्ति रखते हैं।\n\nवर्तमान ${bhuktiStr} भुक्ति का समय इस कर्मिक दबाव को दूर कर आत्म-साक्षात्कार प्राप्त करने का दिव्य अवसर है। प्रतिदिन ध्यान, नवग्रह पाठ और गोकर्ण क्षेत्र में महामृत्युंजय जाप कराने से यह आंतरिक चिंताएं समाप्त होंगी। जैसे-जैसे आपकी आध्यात्मिक चेतना बढ़ेगी, आपको असीम मानसिक शांति और सर्वतोमुखी प्रगति की प्राप्ति होगी।`;
    }
    if (baseLang === "te") {
      return `మీ జాతకంలో 8వ మరియు 12వ భావాల కర్మియా ప్రభావం, రాహు-కేతువుల స్థానం మరియు ప్రస్తుత ${dashaStr} మహాతశ మీ అంతరంగంలో దాగివున్న లోతైన ఆత్మ సంకేతాన్ని తెలియజేస్తున్నాయి. పైకి ఎంతో శాంతంగా కనిపించినప్పటికీ, అంతరంగంలో గత సంఘటనల భావనలు లేదా అనవసరమైన ఆందోళనలు బాధించవచ్చు. మీ బాధలను ఇతరులతో పంచుకోకుండా మీలోనే ఉంచుకునే స్వభావం ఉంటుంది.\n\nప్రస్తుత ${bhuktiStr} భుక్తి కాలం ఈ రకమైన మానసిక భారాల నుండి విముక్తి పొందడానికి అనుకూలమైనది. రోజూ ధ్యానం చేయడం, నవగ్రహ ప్రార్థనలు మరియు గోకర్ణ క్షేత్రంలో మహా మృత్యుంజయ జపం జరిపించడం వలన మానసిక ప్రశాంతత చేకూరుతుంది. ఆధ్యాత్మిక మార్గంలో ప్రయాణించడం ద్వారా శాశ్వత ఆనందం లభిస్తుంది.`;
    }
    if (baseLang === "ta") {
      return `உங்கள் ஜாதகத்தின் 8 மற்றும் 12 ஆம் இடங்களின் கர்ம வினைகள், ராகு-கேது அமைப்புகள் மற்றும் தற்போதைய ${dashaStr} தசா காலம் உங்கள் மனதின் ஆழத்தில் மறைந்துள்ள ஆன்மீக இரகசியத்தை உணர்த்துகிறது. வெளியில் அமைதியாகத் தெரிந்தாலும், மனதிற்குள் சில பழைய நினைவுகளும் தேவையற்ற கவலைகளும் அவ்வப்போது எழக்கூடும். உங்கள் துன்பங்களை பிறரிடம் கூறாமல் மனதிற்குள்ளேயே வைத்துக்கொள்ளும் குணம் உண்டு.\n\nதற்போதைய ${bhuktiStr} புக்தி காலம் இந்த மன அழுத்தங்களில் இருந்து விடுபட சிறந்த காலமாகும். தினமும் தியானம் செய்வது, நவகிரக வழிபாடு மற்றும் கோகர்ண க்ஷேத்திரத்தில் மகா மிருத்யுஞ்சய ஜெபம் செய்வது மன அமைதியையும் ஆன்மீக வளர்ச்சியையும் தரும்.`;
    }
    return `The karmic alignment of your 8th and 12th houses, the nodal axis of Rahu-Ketu, and your running ${dashaStr} Mahadasha point to a deep, transformative soul pattern—the Niguda Rahasya. Externally, you present an unshakeable poise and fortitude; however, internally, you periodically grapple with unspoken emotional vulnerabilities, residual past impressions, or a silent feeling of psychological isolation. You tend to bear heavy personal burdens internally without leaning on others.\n\nYour current ${bhuktiStr} Bhukti provides a potent astrological window for karmic resolution and emotional liberation. Engaging in daily meditation, chanting the Navagraha Stotram, and sponsoring a Maha Mrityunjaya Japa at Gokarna Kshetra will dissolve underlying anxieties. Transmuting these hidden emotional patterns into spiritual wisdom will unlock profound inner serenity and enduring peace of mind.`;
  }


  const generatePremiumPDF = async (personalization?: PersonalizationState) => {
    if (!session || isGeneratingPremiumPdf) return;
    setIsGeneratingPremiumPdf(true);

    try {
      if (!session) throw new Error("No session");

      // Everything below follows the PDF language radio button, never the app language.
      const lang = pdfLanguage;
      const runId = newRunId();

      const moonPlanet = session.result.planets.find(p => p.name === 'Moon');

      const now = new Date();
      const ageYears = ageDecimalYearsAt(
        session.input.birthDate,
        session.input.birthTime,
        session.input.latitude,
        session.input.longitude,
        now
      );
      const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);
      const mahaLord = currentBhuktiData ? toGraha(currentBhuktiData.maha.planet) : null;
      const bhuktiLord = currentBhuktiData ? toGraha(currentBhuktiData.bhukti) : null;
      const panchanga = calculateTraditionalBaggona(session.birthDateYmd, session.birthTimeHm, session.input.latitude, session.input.longitude);

      const ashirvadaSource = ashirvada
        || "May the divine forces grant you strength, clarity and peace, and may you trust your own resilience.";

      const translatedData: PdfTranslations = {
        title: tp("title", lang),
        subtitle: tp("subtitle", lang),
        nameLabel: tp("nameLabel", lang),
        nameValue: session.input.name, // a person's name is never put through a translator
        dobLabel: tp("dobLabel", lang),
        dobValue: formatBirthLine(lang, session.input.birthDate, session.input.birthTime),
        lagnaLabel: tp("lagnaLabel", lang),
        lagnaValue: session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "",
        moonLabel: tp("moonLabel", lang),
        moonValue: pick(RASHI_L5[session.result.moonSign.index], lang),
        nakshatraLabel: tp("nakshatraLabel", lang),
        nakshatraValue: moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : "",
        eraLabel: tp("eraLabel", lang),
        dashaLabel: tp("dashaLabel", lang),
        bhuktiLabel: tp("bhuktiLabel", lang),
        dashaPlanetValue: mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "",
        bhuktiPlanetValue: bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "",
        ashirvadaTitle: tp("ashirvadaTitle", lang),
        ashirvadaValue: await translateText(ashirvadaSource, lang),
        footer: tp("footer", lang),
        yogasTitle: tp("yogasTitle", lang),
        doshasTitle: tp("doshasTitle", lang),
        remedyTitle: tp("remedyTitle", lang),
        characteristicsTitle: tp("characteristicsTitle", lang),
        darkSecretTitle: tp("darkSecretTitle", lang),
        currentPhaseTitle: tp("currentPhaseTitle", lang),
        currentPhaseGuidanceTitle: tp("currentPhaseGuidanceTitle", lang),
        timelineTitle: tp("timelineTitle", lang),
        gocharaTitle: tp("gocharaTitle", lang),
        summaryTitle: tp("summaryTitle", lang),
        introTitle: tp("introTitle", lang),
        introGreeting: greetingLine(lang, session.input.name),
        introPrepared: buildComprehensiveIntro(lang, {
          name: session.input.name,
          lagna: session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "",
          moonSign: pick(RASHI_L5[session.result.moonSign.index], lang),
          nakshatra: moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : "",
          birthWeekday: pick(WEEKDAY_L5[panchanga.weekdayIndex], lang),
          birthDateFormatted: formatBirthLine(lang, session.input.birthDate, session.input.birthTime).split(",")[0],
          birthTime: session.input.birthTime,
          mahaLord: mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "",
          bhuktiLord: bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : ""
        }),
        introRunning: mahaLord && bhuktiLord ? runningPeriodSentence(lang, mahaLord, bhuktiLord) : "",
        introBegin: tp("introBegin", lang),
      };

      setPdfTranslations(translatedData);

      // The life-stage cards were written for the app language. If the reader asked for a
      // different one, carry them across so the finished book is in a single language.
      const sourcePredictions = currentMindset ? [currentMindset, ...predictions] : predictions;
      let localisedPredictions: TranslatedPrediction[] = lang === language
        ? sourcePredictions
        : await Promise.all(
          sourcePredictions.map(async (pred) => ({
            ...pred,
            translatedCategory: await translateText(pred.category, lang),
            translatedText: await translateText(pred.text, lang),
          }))
        );

      // Real transit positions for today, counted from the birth Moon.
      const liveTransits = getTransitsForDate(session.result.moonSign.index, now, ayanamsaModel);
      const transits: TransitPlacement[] = Object.entries(liveTransits).map(([planet, pos]) => ({
        graha: toGraha(planet),
        rashiIndex: pos.rashiIndex,
        houseFromMoon: pos.house
      }));

      const natalPlanets: NatalPlacement[] = session.result.planets.map(p => ({
        graha: toGraha(p.name),
        rashiIndex: p.rashi.index,
        house: p.house,
        retrograde: p.isRetrograde,
        debilitated: p.isDebilitated,
        exalted: p.isExalted
      }));

      const dynamicCtx: DynamicChartContext = {
        name: session.input?.name,
        maritalStatus: personalization?.maritalStatus,
        hasChildren: personalization?.childrenStatus,
        planets: session.result.planets.map(p => ({
          name: p.name,
          house: p.house,
          rashiIndex: p.rashi.index,
          isExalted: p.isExalted,
          isDebilitated: p.isDebilitated,
          isRetrograde: p.isRetrograde
        })),
        transits,
        moonRashiIndex: session.result.moonSign.index,
        ageYears,
        gender: (((session.input as any)?.gender || "Male") as "Male" | "Female")
      };

      setV1PdfProgress(38);
      setV1PdfStageText(
        pdfLanguage === "kn"
          ? "೨. ವಿವಾಹ, ಸಂತಾನ, ಉದ್ಯೋಗ, ಆರ್ಥಿಕ ಹಾಗೂ ಆರೋಗ್ಯ ಅಧ್ಯಾಯಗಳ ನಿಖರ ಸಂಶ್ಲೇಷಣೆ..."
          : pdfLanguage === "hi"
          ? "2. विवाह, संतान, करियर, धन एवं स्वास्थ्य का विश्लेषण..."
          : "2. Synthesizing Dynamic Marriage, Children, Career, Wealth & Health..."
      );

      // Inject personalized targeted deep predictions if requested (Adults only, age >= 8)
      if (personalization && ageYears >= 8) {
        const isKn = lang === "kn";
        const baseLang = (lang || "en").split("-")[0];
        const lagnaStr = session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "";
        const moonStr = pick(RASHI_L5[session.result.moonSign.index], lang);

        const lagnaIdx = session.result.lagnaRashi?.index ?? 0;
        const dashaName = mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "Dasha";
        const bhuktiName = bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "Bhukti";

        if (personalization.maritalStatus) {
          const userGender = (session.input as any).gender || "Male";
          const marriageText = buildPersonalizedMarriageText(lang, lagnaStr, moonStr, personalization.maritalStatus, lagnaIdx, dashaName, bhuktiName, userGender as "Male" | "Female", dynamicCtx);

          const existingIdx = localisedPredictions.findIndex(p => {
            const cat = `${p.translatedCategory || ''} ${p.category || ''}`.toLowerCase();
            return cat.includes("marriage") || cat.includes("ಮದುವೆ") || cat.includes("ವಿವಾಹ") || cat.includes("ವಿवाह") || cat.includes("വിవాహ") || cat.includes("திருಮணம்");
          });
          if (existingIdx >= 0) {
            localisedPredictions[existingIdx].text = marriageText;
            localisedPredictions[existingIdx].translatedText = marriageText;
          } else {
            localisedPredictions.push({
              category: "Marriage & Relationships",
              text: marriageText,
              translatedCategory: await translateText("Marriage & Relationships", lang),
              translatedText: marriageText
            });
          }
        }

        if (personalization.childrenStatus) {
          const childrenText = buildPersonalizedChildrenText(lang, personalization.childrenStatus, lagnaIdx, dashaName, bhuktiName, dynamicCtx);

          const existingIdx = localisedPredictions.findIndex(p => {
            const cat = `${p.translatedCategory || ''} ${p.category || ''}`.toLowerCase();
            return cat.includes("children") || cat.includes("ಸಂತಾನ") || cat.includes("ಮಕ್ಕಳು") || cat.includes("संतान") || cat.includes("ಸಂತಾನ") || cat.includes("குழந்தை");
          });
          if (existingIdx >= 0) {
            localisedPredictions[existingIdx].text = childrenText;
            localisedPredictions[existingIdx].translatedText = childrenText;
          } else {
            localisedPredictions.push({
              category: "Children & Progeny",
              text: childrenText,
              translatedCategory: await translateText("Children & Progeny", lang),
              translatedText: childrenText
            });
          }
        }
      }

      if (ageYears < 8) {
        localisedPredictions = localisedPredictions.filter(p => {
          const cat = `${p.translatedCategory || ''} ${p.category || ''}`.toLowerCase();
          const isAdult = cat.includes("marriage") || cat.includes("ಮದುವೆ") || cat.includes("ವಿವಾಹ") || cat.includes("ವಿवाह") || cat.includes("विवाह") || cat.includes("వివాహ") || cat.includes("திருಮணம்") ||
                          cat.includes("children") || cat.includes("ಸಂತಾನ") || cat.includes("ಮಕ್ಕಳು") || cat.includes("संतान") || cat.includes("ಸಂತಾನ") || cat.includes("குழந்தை");
          return !isAdult;
        });
      }

      setPremiumPredictions(localisedPredictions);

      const deepInsights: Record<string, string> = {};
      for (const pred of localisedPredictions) {
        deepInsights[pred.translatedCategory] = pred.translatedText;
      }
      setPdfDeepInsights(deepInsights);

      const result = await generateMasterPrediction(session.result, {
        name: session.input.name,
        birthDate: session.input.birthDate,
        birthTime: session.input.birthTime,
        latitude: session.input.latitude,
        longitude: session.input.longitude,
        lang,
        isMarried: personalization?.maritalStatus === "married" ? true : personalization?.maritalStatus === "unmarried" ? false : undefined,
        hasChildren: personalization?.childrenStatus === "has_children" ? true : personalization?.childrenStatus === "no_children" ? false : undefined
      });

      const parseGeminiJSON = robustParseGeminiJSON;

      // Affair indicator detection using B.V. Raman classical rules
      const affairResult = detectAffairIndicators(session.result);
      const affairNote = (affairResult.hasAffairIndicators && affairResult.confidence !== "low")
        ? `The chart carries ${affairResult.confidence}-confidence classical indicators of hidden romantic complexity (${affairResult.indicators.slice(0, 2).join("; ")}). Give this one short paragraph, framed as a karmic soul-pattern in dignified language. Never judgemental.`
        : `This chart shows no confirmed indicator of a secret relationship. Do not raise the subject at all.`;

      const userGender = (session.input as any).gender || "Male";
      const prompts = buildPremiumPrompts({
        lang,
        runId,
        name: session.input.name,
        gender: userGender as "Male" | "Female",
        ageYears,
        maritalStatus: personalization?.maritalStatus || "general",
        hasChildren: personalization?.childrenStatus || "general",
        lagnaRashiIndex: session.result.lagnaRashi?.index ?? null,
        moonRashiIndex: session.result.moonSign.index,
        moonNakshatraIndex: moonPlanet?.nakshatra.index ?? null,
        sunRashiIndex: session.result.sunSign?.index ?? null,
        natalPlanets,
        transits,
        mahaLord,
        bhuktiLord,
        bhuktiEndsAtAge: currentBhuktiData?.bhuktiEndAge ?? null,
        engineYogas: result.aiGeneratedNarrative?.yogas ?? [],
        engineDoshas: result.aiGeneratedNarrative?.doshas ?? [],
        pariharas: (result.pariharas ?? []).map(
          p => `${p.doshaName}: ${p.poojaName} (${p.whenToDo}, ${p.whereToDo})`
        ),
        shadowSelf: result.natalLayer.shadowSelf.bluntTruth,
        karmicBaggage: result.natalLayer.karmicBaggage.soulPurpose,
        lifePhase: result.timingLayer.lifeClock.currentPhase,
        overallTone: stripJayashreeIntro(result.masterSynthesis.overallTone),
        careerNote: result.masterSynthesis.career,
        financeNote: result.masterSynthesis.finance,
        roadmap: result.timingLayer.twelveMonthRoadmap,
        affairNote
      });

      // `raw` keeps each chapter's own persona intact instead of burying it under the
      const safeAsk = async (label: string, prompt: string, temp = 0.3) => {
        try {
          const raw = await askGemini(label, prompt, geminiApiKey, lang, { raw: true, temperature: temp });
          if (typeof raw === "string" && (raw.includes("Sorry, I encountered an error") || raw.includes("check your API key") || raw.includes("Error"))) {
            console.warn(`[PDF Generation] Error string detected in AI response for ${label}, ignoring error text.`);
            return "";
          }
          return raw;
        } catch (e) {
          console.warn(`[PDF Generation] AI call failed for ${label}, using engine fallback`, e);
          return "";
        }
      };

      console.log("[PDF Generation] Initiating Batch 1 AI calls (Soul & Personality)...");
      const [resCharacteristics, resDarkSecret, resCurrentPhase, resYogas, resDoshas] = await Promise.all([
        safeAsk("Generate Characteristics", prompts.characteristics, 0.3),
        ageYears < 8 ? Promise.resolve('{"darkSecret":[]}') : safeAsk("Generate Dark Secret", prompts.darkSecret, 0.3),
        safeAsk("Generate Current Phase", prompts.currentPhase, 0.3),
        safeAsk("Generate Premium Yogas", prompts.yogas, 0.4),
        safeAsk("Generate Premium Doshas", prompts.doshas, 0.4),
      ]);
      console.log("[PDF Generation] Batch 1 AI calls completed successfully.");

      await new Promise(r => setTimeout(r, 400));

      console.log("[PDF Generation] Initiating Batch 2 AI calls (Timeline & Transits)...");
      const [resTimeline, resGochara, resSummary, resBhavishya] = await Promise.all([
        safeAsk("Generate Planetary Timeline", prompts.timeline, 0.4),
        safeAsk("Generate Gochara", prompts.gochara, 0.4),
        safeAsk("Generate Summary", prompts.summary, 0.3),
        safeAsk("Generate Bhavishya Life Areas", prompts.bhavishya, 0.3)
      ]);
      console.log("[PDF Generation] Batch 2 AI calls completed successfully.");

      const dataYogas = parseGeminiJSON(resYogas);
      const dataDoshas = parseGeminiJSON(resDoshas);
      const dataCharacteristics = parseGeminiJSON(resCharacteristics);
      const dataDarkSecret = parseGeminiJSON(resDarkSecret);
      const dataCurrentPhase = parseGeminiJSON(resCurrentPhase);
      const dataTimeline = parseGeminiJSON(resTimeline);
      const dataGochara = parseGeminiJSON(resGochara);
      const dataSummary = parseGeminiJSON(resSummary);
      const dataBhavishya = parseGeminiJSON(resBhavishya);

      // If AI returned fresh personalized Bhavishya readings for Chapter V, override localisedPredictions
      if (dataBhavishya?.bhavishya) {
        const aiB = dataBhavishya.bhavishya;
        localisedPredictions = localisedPredictions.map(p => {
          const cat = (p.translatedCategory || p.category || "").toLowerCase();
          if ((cat.includes("marriage") || cat.includes("ಮದುವೆ") || cat.includes("ವಿವಾಹ") || cat.includes("विवाह") || cat.includes("వివాహ") || cat.includes("திருமணம்")) && (aiB.marriage || "").trim().length > 20) {
            // Strip any accidental children paragraphs from Marriage text
            const mParas = (aiB.marriage || "").split("\n").filter((pText: string) => {
              const pLower = pText.toLowerCase();
              return !pLower.includes("ಸಂತಾನ") && !pLower.includes("ಮಕ್ಕಳ") && !pLower.includes("ಪಂಚಮ ಭಾವ") && !pLower.includes("progeny") && !pLower.includes("children");
            });
            const cleanM = mParas.join("\n\n").trim() || aiB.marriage;
            return { ...p, text: cleanM, translatedText: cleanM };
          }
          if ((cat.includes("children") || cat.includes("ಸಂತಾನ") || cat.includes("ಮಕ್ಕಳು") || cat.includes("संतान") || cat.includes("సంతాన") || cat.includes("குழந்தை")) && (aiB.children || "").trim().length > 20) {
            return { ...p, text: aiB.children, translatedText: aiB.children };
          }
          if ((cat.includes("career") || cat.includes("ಉದ್ಯೋಗ") || cat.includes("ವೃತ್ತಿ") || cat.includes("करियर")) && (aiB.career || "").trim().length > 20) {
            return { ...p, text: aiB.career, translatedText: aiB.career };
          }
          if ((cat.includes("wealth") || cat.includes("ಸಂಪತ್ತು") || cat.includes("ಧನ") || cat.includes("धन")) && (aiB.wealth || "").trim().length > 20) {
            return { ...p, text: aiB.wealth, translatedText: aiB.wealth };
          }
          if ((cat.includes("health") || cat.includes("ಆರೋಗ್ಯ") || cat.includes("स्वास्थ्य")) && (aiB.health || "").trim().length > 20) {
            return { ...p, text: aiB.health, translatedText: aiB.health };
          }
          return p;
        });

        // Update deep insights map
        const updatedDeepInsights: Record<string, string> = {};
        for (const pred of localisedPredictions) {
          updatedDeepInsights[pred.translatedCategory] = pred.translatedText;
        }
        localisedPredictions = localisedPredictions.map(p => ({
          ...p,
          translatedText: cleanEnglishFromRegionalText(p.translatedText, lang)
        }));
        setPdfDeepInsights(updatedDeepInsights);
        setPremiumPredictions(localisedPredictions);
      }

      const lagnaStr = session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "";
      const moonStr = pick(RASHI_L5[session.result.moonSign.index], lang);
      const dashaName = mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "Dasha";
      const bhuktiName = bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "Bhukti";

      const charFallbackText = buildKundaliCharacteristicsFallback(lang, lagnaStr, moonStr, dashaName, bhuktiName);
      const secretFallbackText = buildKundaliDarkSecretFallback(lang, lagnaStr, moonStr, dashaName, bhuktiName);
      const currentPhaseFallbackText = buildKundaliCurrentPhaseFallback(lang, lagnaStr, moonStr, dashaName, bhuktiName, session.input.name, ageYears, userGender);
      const rawSummaryFallback = buildDynamicSummaryFallback({
        ...({} as any),
        lang,
        name: session.input.name,
        lagnaName: lagnaStr,
        moonRashiName: moonStr,
        runningDashaName: dashaName,
        runningBhuktiName: bhuktiName,
        ageYears
      });

      const finalCharacteristics = await ensureValidSection(dataCharacteristics.characteristics, charFallbackText, lang);
      const finalDarkSecret = await ensureValidSection(dataDarkSecret.darkSecret, secretFallbackText, lang);
      const finalCurrentPhase = await ensureValidSection(dataCurrentPhase.currentPhase, currentPhaseFallbackText, lang, 250);
      const finalSummary = await ensureValidSection(dataSummary.summary, rawSummaryFallback, lang, 150);

      const rawYogasFallback = await Promise.all(
        (result.aiGeneratedNarrative?.yogas || [{ name: "Dasha Yoga", significance: stripJayashreeIntro(result.masterSynthesis.overallTone) }]).map(async y => ({
          name: await translateText(y.name, lang),
          impact: await translateText(stripJayashreeIntro(asText(y.significance) || result.masterSynthesis.overallTone), lang)
        }))
      );
      const rawYogasArray = toSafeArray(dataYogas.yogas).filter((y: any) => (y?.impact || "").trim().length > 10).length > 0
        ? dataYogas.yogas
        : rawYogasFallback;

      const finalYogas = (rawYogasArray || []).map((y: any) => ({
        ...y,
        impact: enrichYogaDescription(y.name || y.trait || "", y.impact || "", lang, lagnaStr, moonStr)
      }));

      const rawDoshasFallback = await Promise.all(
        (result.aiGeneratedNarrative?.doshas || [{ name: "Karmic Challenge", significance: result.natalLayer.karmicBaggage.description, remedy: result.natalLayer.karmicBaggage.soulPurpose }]).map(async d => ({
          name: await translateText(d.name, lang),
          impact: await translateText(asText(d.significance) || result.natalLayer.karmicBaggage.description, lang),
          remedy: await translateText(d.remedy || result.natalLayer.karmicBaggage.soulPurpose, lang)
        }))
      );
      const finalDoshas = toSafeArray(dataDoshas.doshas).filter((d: any) => (d?.impact || "").trim().length > 10).length > 0
        ? dataDoshas.doshas
        : rawDoshasFallback;

      const engineRoadmap6 = result.timingLayer.twelveMonthRoadmap.slice(0, 6);
      const fallbackTimeline = await Promise.all(
        engineRoadmap6.map(async r => ({
          dateRange: await translateText(r.month, lang),
          impact: await translateText(r.prediction, lang)
        }))
      );

      const validTimelineItems = toSafeArray(dataTimeline.timeline).filter((t: any) => (t?.impact || "").trim().length > 10);
      const finalTimeline = validTimelineItems.length >= 4
        ? await Promise.all(
          validTimelineItems.map(async (t: any) => ({
            ...t,
            dateRange: await translateText(t.dateRange || "", lang)
          }))
        )
        : fallbackTimeline;

      const v2ParsedKundali = analyzeKundali({
        lang,
        name: session.input.name,
        gender: userGender as "Male" | "Female",
        ageYears,
        maritalStatus: personalization?.maritalStatus || "general",
        hasChildren: personalization?.childrenStatus || "general",
        lagnaRashiIndex: session.result.lagnaRashi?.index ?? 0,
        moonRashiIndex: session.result.moonSign.index,
        moonNakshatraIndex: moonPlanet?.nakshatra.index ?? null,
        natalPlanets,
        transits,
        mahaLord,
        bhuktiLord
      });
      const rawGocharaFallback = buildDynamicGocharaFallback(v2ParsedKundali);
      const isSufficientGocharaDepth = (txt: string) => {
        if (!txt) return false;
        const trimmed = txt.trim();
        const lines = trimmed.split("\n").filter(l => l.trim().length > 0);
        return lines.length >= 2 && trimmed.length >= 140;
      };

      const aiGocharaValid = toSafeArray(dataGochara.gochara).filter((g: any) => {
        const impact = (g?.impact || "").trim();
        if (lang !== "en" && /[a-zA-Z]{3,}/.test(impact)) return false;
        return isSufficientGocharaDepth(impact);
      }).length >= 2;

      let finalGochara = aiGocharaValid ? dataGochara.gochara : rawGocharaFallback;
      finalGochara = finalGochara.map((g: any) => ({
        name: cleanEnglishFromRegionalText(g.name || "", lang),
        impact: cleanEnglishFromRegionalText(g.impact || "", lang),
        remedy: g.remedy ? cleanEnglishFromRegionalText(g.remedy, lang) : undefined
      }));

      const premiumDataPayload = {
        characteristics: finalCharacteristics,
        darkSecret: finalDarkSecret,
        currentPhase: finalCurrentPhase,
        yogas: finalYogas,
        doshas: finalDoshas,
        timeline: finalTimeline,
        gochara: finalGochara,
        summary: finalSummary
      };

      // Strict Audit Guard: Verify all 7 sections have valid text content
      const requiredSections = [
        { name: "Characteristics", items: finalCharacteristics },
        { name: "Dark Secret", items: finalDarkSecret },
        { name: "Yogas", items: finalYogas },
        { name: "Doshas", items: finalDoshas },
        { name: "Timeline", items: finalTimeline },
        { name: "Gochara", items: finalGochara },
        { name: "Summary", items: finalSummary }
      ];

      const emptyOrInvalid = requiredSections.filter(sec => !sec.items || sec.items.length === 0 || !sec.items.some((i: any) => (i.impact || "").trim().length > 10));

      if (emptyOrInvalid.length > 0) {
        console.warn("[PDF Generation Guard] Using fallbacks for missing sections:", emptyOrInvalid.map(e => e.name));
      }

      // Strict Pre-Download Quality Audit Guard: Ensure ZERO error strings leak into PDF
      const payloadAuditStr = JSON.stringify(premiumDataPayload).toLowerCase();
      if (payloadAuditStr.includes("sorry, i encountered an error") || payloadAuditStr.includes("check your api key")) {
        console.error("[PDF Quality Audit Rejection] Error string detected in payload. Healing with Master Engine fallbacks.");
        premiumDataPayload.summary = [{ impact: rawSummaryFallback }];
        premiumDataPayload.characteristics = [{ impact: charFallbackText }];
        premiumDataPayload.darkSecret = [{ impact: secretFallbackText }];
      }

      setPremiumDataForPdf(premiumDataPayload);

      // Wait for React to flush the state to the hidden PdfTemplate component
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!premiumPdfRef.current) throw new Error("Premium PDF ref not found");

      const containerEl = premiumPdfRef.current;
      const parentEl = containerEl.parentElement;
      const originalStyle = parentEl?.getAttribute("style") || "";
      if (parentEl) {
        parentEl.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; background-color: #FFFFFF;");
      }

      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 400));

      const domHeight = containerEl.scrollHeight || containerEl.offsetHeight;
      const safeScale = domHeight > 0 ? Math.min(2, Math.max(1, 30000 / domHeight)) : 2;

      // Generate PDF
      const canvas = await html2canvas(containerEl, {
        scale: safeScale,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        allowTaint: true
      });

      if (parentEl) {
        parentEl.setAttribute("style", originalStyle);
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.75);

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: [pdfWidth, pdfHeight], compress: true });

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      const langNames: Record<string, string> = { "kn": "Kannada", "ta": "Tamil", "te": "Telugu", "hi": "Hindi", "en": "English" };
      const langName = langNames[pdfLanguage] || "English";
      pdf.save(`Baggona_Panchanga_Prediction_${langName}_${session?.input.name.replace(/\s+/g, '_') || 'Reading'}.pdf`);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate Premium PDF. Please try again.");
    } finally {
      setIsGeneratingPremiumPdf(false);
      setPremiumDataForPdf(null); // Cleanup
      setPremiumPredictions(null);
    }
  };

  // 100% Mathematically Grounded & AI-First Premium PDF V1 Engine
  const generatePremiumPDFV1 = async (personalization?: PersonalizationState) => {
    if (!session || isGeneratingPremiumPdfV1) return;
    setIsGeneratingPremiumPdfV1(true);
    setV1PdfProgress(15);
    setV1PdfStageText(
      pdfLanguage === "kn"
        ? "೧. ಜನ್ಮ ಲಗ್ನ, ನವಾಂಶ ಮತ್ತು ಗ್ರಹಗಳ ಗಣನೆ..."
        : pdfLanguage === "hi"
        ? "1. जन्म लग्न, नवांश एवं ग्रह गणना..."
        : "1. Calculating Natal Lagna, Bhavas & Navamsha..."
    );

    try {
      if (!session) throw new Error("No session");

      const lang = pdfLanguage;
      const baseLang = (lang || "en").split("-")[0];
      const runId = newRunId();

      const moonPlanet = session.result.planets.find(p => p.name === 'Moon');
      const now = new Date();
      const ageYears = ageDecimalYearsAt(
        session.input.birthDate,
        session.input.birthTime,
        session.input.latitude,
        session.input.longitude,
        now
      );
      const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);
      const mahaLord = currentBhuktiData ? toGraha(currentBhuktiData.maha.planet) : null;
      const bhuktiLord = currentBhuktiData ? toGraha(currentBhuktiData.bhukti) : null;
      const panchanga = calculateTraditionalBaggona(session.birthDateYmd, session.birthTimeHm, session.input.latitude, session.input.longitude);

      const ashirvadaSource = ashirvada
        || "May the divine forces grant you strength, clarity and peace, and may you trust your own resilience.";

      const translatedData: PdfTranslations = {
        title: tp("title", lang),
        subtitle: tp("subtitle", lang),
        nameLabel: tp("nameLabel", lang),
        nameValue: session.input.name,
        dobLabel: tp("dobLabel", lang),
        dobValue: formatBirthLine(lang, session.input.birthDate, session.input.birthTime),
        lagnaLabel: tp("lagnaLabel", lang),
        lagnaValue: session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "",
        moonLabel: tp("moonLabel", lang),
        moonValue: pick(RASHI_L5[session.result.moonSign.index], lang),
        nakshatraLabel: tp("nakshatraLabel", lang),
        nakshatraValue: moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : "",
        eraLabel: tp("eraLabel", lang),
        dashaLabel: tp("dashaLabel", lang),
        bhuktiLabel: tp("bhuktiLabel", lang),
        dashaPlanetValue: mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "",
        bhuktiPlanetValue: bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "",
        ashirvadaTitle: tp("ashirvadaTitle", lang),
        ashirvadaValue: await translateText(ashirvadaSource, lang),
        footer: tp("footer", lang),
        yogasTitle: tp("yogasTitle", lang),
        doshasTitle: tp("doshasTitle", lang),
        remedyTitle: tp("remedyTitle", lang),
        characteristicsTitle: tp("characteristicsTitle", lang),
        darkSecretTitle: tp("darkSecretTitle", lang),
        currentPhaseTitle: tp("currentPhaseTitle", lang),
        currentPhaseGuidanceTitle: tp("currentPhaseGuidanceTitle", lang),
        timelineTitle: tp("timelineTitle", lang),
        gocharaTitle: tp("gocharaTitle", lang),
        summaryTitle: tp("summaryTitle", lang),
        introTitle: tp("introTitle", lang),
        introGreeting: greetingLine(lang, session.input.name),
        introPrepared: buildComprehensiveIntro(lang, {
          name: session.input.name,
          lagna: session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "",
          moonSign: pick(RASHI_L5[session.result.moonSign.index], lang),
          nakshatra: moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : "",
          birthWeekday: pick(WEEKDAY_L5[panchanga.weekdayIndex], lang),
          birthDateFormatted: formatBirthLine(lang, session.input.birthDate, session.input.birthTime).split(",")[0],
          birthTime: session.input.birthTime,
          mahaLord: mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "",
          bhuktiLord: bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : ""
        }),
        introRunning: mahaLord && bhuktiLord ? runningPeriodSentence(lang, mahaLord, bhuktiLord) : "",
        introBegin: tp("introBegin", lang),
      };

      setPdfTranslations(translatedData);

      // Real transit positions for today, counted from birth Moon
      const liveTransits = getTransitsForDate(session.result.moonSign.index, now, ayanamsaModel);
      const transits: TransitPlacement[] = Object.entries(liveTransits).map(([planet, pos]) => ({
        graha: toGraha(planet),
        rashiIndex: pos.rashiIndex,
        houseFromMoon: pos.house
      }));

      const natalPlanets: NatalPlacement[] = session.result.planets.map(p => ({
        graha: toGraha(p.name),
        rashiIndex: p.rashi.index,
        house: p.house,
        retrograde: p.isRetrograde,
        debilitated: p.isDebilitated,
        exalted: p.isExalted
      }));

      const userGender = (session.input as any).gender || "Male";
      const parsedKundali = analyzeKundali({
        lagnaRashiIndex: session.result.lagnaRashi?.index ?? 0,
        moonRashiIndex: session.result.moonSign.index,
        moonNakshatraIndex: moonPlanet?.nakshatra.index ?? null,
        natalPlanets,
        transits,
        mahaLord,
        bhuktiLord,
        gender: userGender as "Male" | "Female",
        ageYears,
        lang,
        name: session.input.name,
        maritalStatus: personalization?.maritalStatus || "general",
        hasChildren: personalization?.childrenStatus || "general"
      });

      const dynamicCtx: DynamicChartContext = {
        name: session.input.name,
        maritalStatus: personalization?.maritalStatus,
        hasChildren: personalization?.childrenStatus,
        planets: session.result.planets.map(p => ({
          name: p.name,
          house: p.house,
          rashiIndex: p.rashi.index,
          isExalted: p.isExalted,
          isDebilitated: p.isDebilitated,
          isRetrograde: p.isRetrograde
        })),
        transits,
        moonRashiIndex: session.result.moonSign.index,
        ageYears,
        gender: ((userGender || "Male") as "Male" | "Female")
      };

      setV1PdfProgress(38);
      setV1PdfStageText(
        pdfLanguage === "kn"
          ? "೨. ವಿವಾಹ, ಸಂತಾನ, ಉದ್ಯೋಗ, ಆರ್ಥಿಕ ಹಾಗೂ ಆರೋಗ್ಯ ಅಧ್ಯಾಯಗಳ ನಿಖರ ಸಂಶ್ಲೇಷಣೆ..."
          : pdfLanguage === "hi"
          ? "2. विवाह, संतान, करियर, धन एवं स्वास्थ्य का विश्लेषण..."
          : "2. Synthesizing Dynamic Marriage, Children, Career, Wealth & Health..."
      );

      const result = await generateMasterPrediction(session.result, {
        name: session.input.name,
        birthDate: session.input.birthDate,
        birthTime: session.input.birthTime,
        latitude: session.input.latitude,
        longitude: session.input.longitude,
        lang,
        isMarried: personalization?.maritalStatus === "married" ? true : personalization?.maritalStatus === "unmarried" ? false : undefined,
        hasChildren: personalization?.childrenStatus === "has_children" ? true : personalization?.childrenStatus === "no_children" ? false : undefined
      });

      const parseGeminiJSON = robustParseGeminiJSON;

      const affairResult = detectAffairIndicators(session.result);
      const affairNote = (affairResult.hasAffairIndicators && affairResult.confidence !== "low")
        ? `The chart carries ${affairResult.confidence}-confidence classical indicators of hidden romantic complexity (${affairResult.indicators.slice(0, 2).join("; ")}). Give this one short paragraph, framed as a karmic soul-pattern in dignified language. Never judgemental.`
        : `This chart shows no confirmed indicator of a secret relationship. Do not raise the subject at all.`;

      const prompts = buildPremiumPrompts({
        lang,
        runId,
        name: session.input.name,
        gender: userGender as "Male" | "Female",
        ageYears,
        maritalStatus: personalization?.maritalStatus || "general",
        hasChildren: personalization?.childrenStatus || "general",
        lagnaRashiIndex: session.result.lagnaRashi?.index ?? null,
        moonRashiIndex: session.result.moonSign.index,
        moonNakshatraIndex: moonPlanet?.nakshatra.index ?? null,
        sunRashiIndex: session.result.sunSign?.index ?? null,
        natalPlanets,
        transits,
        mahaLord,
        bhuktiLord,
        bhuktiEndsAtAge: currentBhuktiData?.bhuktiEndAge ?? null,
        engineYogas: result.aiGeneratedNarrative?.yogas ?? [],
        engineDoshas: result.aiGeneratedNarrative?.doshas ?? [],
        pariharas: (result.pariharas ?? []).map(
          p => `${p.doshaName}: ${p.poojaName} (${p.whenToDo}, ${p.whereToDo})`
        ),
        shadowSelf: result.natalLayer.shadowSelf.bluntTruth,
        karmicBaggage: result.natalLayer.karmicBaggage.soulPurpose,
        lifePhase: result.timingLayer.lifeClock.currentPhase,
        overallTone: stripJayashreeIntro(result.masterSynthesis.overallTone),
        careerNote: result.masterSynthesis.career,
        financeNote: result.masterSynthesis.finance,
        roadmap: result.timingLayer.twelveMonthRoadmap,
        affairNote
      });

      // 3-retry mechanism with exponential backoff for guaranteed resilience
      const callGeminiWithRetry = async (label: string, prompt: string, temp = 0.3, maxRetries = 3): Promise<string> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const raw = await askGemini(label, prompt, geminiApiKey, lang, { raw: true, temperature: temp });
            if (typeof raw === "string" && (raw.includes("Sorry, I encountered an error") || raw.includes("check your API key") || raw.includes("Error:"))) {
              console.warn(`[V1 AI Attempt ${attempt}/${maxRetries}] Error string detected for ${label}, retrying...`);
              if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, attempt * 1000));
                continue;
              }
              return "";
            }
            if (typeof raw === "string" && raw.trim().length > 20) {
              return raw;
            }
          } catch (e) {
            console.warn(`[V1 AI Attempt ${attempt}/${maxRetries}] AI call failed for ${label}:`, e);
            if (attempt < maxRetries) {
              await new Promise(r => setTimeout(r, attempt * 1000));
              continue;
            }
            return "";
          }
        }
        return "";
      };

      // Controlled Batching: 2 calls per batch with 500ms delay to eliminate rate limits
      console.log("[V1 PDF] Batch 1: Characteristics & Dark Secret...");
      const [resCharacteristics, resDarkSecret] = await Promise.all([
        callGeminiWithRetry("Generate Characteristics", prompts.characteristics, 0.3),
        ageYears < 8 ? Promise.resolve('{"darkSecret":[]}') : callGeminiWithRetry("Generate Dark Secret", prompts.darkSecret, 0.3)
      ]);
      await new Promise(r => setTimeout(r, 500));

      console.log("[V1 PDF] Batch 2: Current Phase & Yogas...");
      const [resCurrentPhase, resYogas] = await Promise.all([
        callGeminiWithRetry("Generate Current Phase", prompts.currentPhase, 0.3),
        callGeminiWithRetry("Generate Premium Yogas", prompts.yogas, 0.4)
      ]);
      await new Promise(r => setTimeout(r, 500));

      console.log("[V1 PDF] Batch 3: Doshas & Timeline...");
      const [resDoshas, resTimeline] = await Promise.all([
        callGeminiWithRetry("Generate Premium Doshas", prompts.doshas, 0.4),
        callGeminiWithRetry("Generate Planetary Timeline", prompts.timeline, 0.4)
      ]);
      await new Promise(r => setTimeout(r, 500));

      console.log("[V1 PDF] Batch 4: Gochara & Summary...");
      const [resGochara, resSummary] = await Promise.all([
        callGeminiWithRetry("Generate Gochara", prompts.gochara, 0.4),
        callGeminiWithRetry("Generate Summary", prompts.summary, 0.3)
      ]);
      await new Promise(r => setTimeout(r, 500));

      console.log("[V1 PDF] Batch 5: Bhavishya Life Areas...");
      const resBhavishya = await callGeminiWithRetry("Generate Bhavishya Life Areas", prompts.bhavishya, 0.3);

      const dataCharacteristics = parseGeminiJSON(resCharacteristics);
      const dataDarkSecret = parseGeminiJSON(resDarkSecret);
      const dataCurrentPhase = parseGeminiJSON(resCurrentPhase);
      const dataYogas = parseGeminiJSON(resYogas);
      const dataDoshas = parseGeminiJSON(resDoshas);
      const dataTimeline = parseGeminiJSON(resTimeline);
      const dataGochara = parseGeminiJSON(resGochara);
      const dataSummary = parseGeminiJSON(resSummary);
      const dataBhavishya = parseGeminiJSON(resBhavishya);

      // Helper to strictly ensure at least 2 substantial paragraphs of 5-6 lines
      const isSufficientDepth = (text: string | undefined, minParas: number = 2, minChars: number = 260): boolean => {
        if (!text || text.trim().length < minChars) return false;
        const paras = text.split(/\n\n+/).filter(p => p.trim().length > 35);
        return paras.length >= minParas;
      };

      // Cleanly Assemble Chapter V (Life Stage Predictions) - STRICTLY DEDUPLICATED
      const isChild = ageYears < 8;
      const v1Predictions: TranslatedPrediction[] = [];
      const aiB = dataBhavishya?.bhavishya || {};

      const lagnaIdx = session.result.lagnaRashi?.index ?? 0;
      const lagnaStr = session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "";
      const moonStr = pick(RASHI_L5[session.result.moonSign.index], lang);
      const dashaName = mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "Dasha";
      const bhuktiName = bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "Bhukti";

      if (isChild) {
        // Child (< 8 Years): 5 Dedicated Non-Adult Pedagogical Categories
        const catEd = baseLang === "kn" ? "ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಬುದ್ಧಿಶಕ್ತಿ" : baseLang === "hi" ? "शिक्षा एवं बौद्धिक विकास" : baseLang === "te" ? "విద్యాభ్యాసం మరియు మేధో వికాసం" : baseLang === "ta" ? "கல்வி மற்றும் அறிவு வளர்ச்சி" : "Education & Early Intellect";
        const textEd = isSufficientDepth(asText(aiB.marriage), 2, 240) ? asText(aiB.marriage) : buildDynamicChildEducationFallback(parsedKundali);
        v1Predictions.push({ category: "Education & Early Intellect", translatedCategory: catEd, text: textEd, translatedText: textEd });

        const catAct = baseLang === "kn" ? "ಪ್ರತಿಭೆ, ಕ್ರೀಡೆ ಹಾಗೂ ಸೃಜನಶೀಲತೆ" : baseLang === "hi" ? "प्रतिभा, खेल एवं रचनात्मकता" : baseLang === "te" ? "ప్రతిభ, క్రీడలు మరియు సృజనాత్మకత" : baseLang === "ta" ? "திறமை, விளையாட்டு மற்றும் படைப்பாற்றல்" : "Talents, Activities & Sports";
        const textAct = isSufficientDepth(asText(aiB.children), 2, 240) ? asText(aiB.children) : buildDynamicChildActivitiesFallback(parsedKundali);
        v1Predictions.push({ category: "Talents, Activities & Sports", translatedCategory: catAct, text: textAct, translatedText: textAct });

        const catFdn = baseLang === "kn" ? "ವ್ಯಕ್ತಿತ್ವ ವಿಕಾಸ ಹಾಗೂ ಸಂಸ್ಕಾರ" : baseLang === "hi" ? "चरित्र निर्माण एवं संस्कार" : baseLang === "te" ? "వ్యక్తిత్వ వికాసం మరియు సంస్కారం" : baseLang === "ta" ? "ஆளுமை வளர்ச்சி மற்றும் நற்பண்புகள்" : "Future Foundation & Character";
        const textFdn = isSufficientDepth(asText(aiB.career), 2, 240) ? asText(aiB.career) : buildDynamicChildFoundationFallback(parsedKundali);
        v1Predictions.push({ category: "Future Foundation & Character", translatedCategory: catFdn, text: textFdn, translatedText: textFdn });

        const catFam = baseLang === "kn" ? "ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ ಹಾಗೂ ಪೋಷಣೆ" : baseLang === "hi" ? "पारिवारिक वातावरण एवं लालन-पालन" : baseLang === "te" ? "కుటుంబ ప్రేమ మరియు లాలన" : baseLang === "ta" ? "குடும்ப பாசம் மற்றும் வளர்ப்பு" : "Family Environment & Upbringing";
        const textFam = isSufficientDepth(asText(aiB.wealth), 2, 240) ? asText(aiB.wealth) : buildDynamicChildFamilyFallback(parsedKundali);
        v1Predictions.push({ category: "Family Environment & Upbringing", translatedCategory: catFam, text: textFam, translatedText: textFam });

        const catHlt = baseLang === "kn" ? "ಬಾಲ ಆರೋಗ್ಯ ಹಾಗೂ ಚೈತನ್ಯ" : baseLang === "hi" ? "बाल स्वास्थ्य एवं रोग प्रतिरोधक क्षमता" : baseLang === "te" ? "బాల ఆరోగ్యం మరియు రక్షణ" : baseLang === "ta" ? "குழந்தை நலம் மற்றும் ஆரோக்கியம்" : "Pediatric Health & Vitality";
        const textHlt = isSufficientDepth(asText(aiB.health), 2, 240) ? asText(aiB.health) : buildDynamicChildPediatricHealthFallback(parsedKundali);
        v1Predictions.push({ category: "Pediatric Health & Vitality", translatedCategory: catHlt, text: textHlt, translatedText: textHlt });
      } else if (ageYears >= 60) {
        // Senior Devotees (60+ Years): Dedicated Companionship, Legacy, Mentorship, Asset Peace & Geriatric Health
        // 1. Companionship & Domestic Serenity
        const catMar = baseLang === "kn" ? "ಧರ್ಮ ಸಹಚಾರ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ" : baseLang === "hi" ? "दांपत्य सौहार्द एवं पारिवारिक शांति" : baseLang === "te" ? "దాంపత్య సౌఖ్యం మరియు కుటుంబ ప్రశాంతత" : baseLang === "ta" ? "தம்பதியர் நல்லிணக்கம் மற்றும் குடும்ப அமைதி" : "Companionship & Domestic Harmony";
        let textMar = asText(aiB.marriage).trim();
        if (isSufficientDepth(textMar, 2, 280)) {
          const mParas = textMar.split("\n").filter((pText: string) => {
            const pLower = pText.toLowerCase();
            return !pLower.includes("ಸಂತಾನ") && !pLower.includes("ಮಕ್ಕಳ") && !pLower.includes("progeny") && !pLower.includes("children");
          });
          textMar = mParas.join("\n\n").trim() || textMar;
        }
        if (!isSufficientDepth(textMar, 2, 280)) {
          textMar = buildPersonalizedMarriageText(lang, lagnaStr, moonStr, personalization?.maritalStatus || "married", lagnaIdx, dashaName, bhuktiName, userGender as "Male" | "Female", dynamicCtx);
        }
        v1Predictions.push({ category: "Companionship & Domestic Harmony", translatedCategory: catMar, text: textMar, translatedText: textMar });

        // 2. Family Legacy & Grandchildren
        const catChd = baseLang === "kn" ? "ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಮೊಮ್ಮಕ್ಕಳ ಸೌಖ್ಯ" : baseLang === "hi" ? "वंश वृद्धि एवं पौत्र-पौत्री सुख" : baseLang === "te" ? "వంశాభివృద్ధి మరియు మనవలు-మనవరాళ్ల సుఖం" : baseLang === "ta" ? "சந்ததி வளர்ச்சி மற்றும் பேரப்பிள்ளைகள் நலம்" : "Family Legacy & Grandchildren";
        const textChd = isSufficientDepth(asText(aiB.children).trim(), 2, 260)
          ? asText(aiB.children).trim()
          : buildPersonalizedChildrenText(lang, personalization?.childrenStatus || "has_children", lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Family Legacy & Grandchildren", translatedCategory: catChd, text: textChd, translatedText: textChd });

        // 3. Mentorship & Dharmic Leadership
        const catCar = baseLang === "kn" ? "ಧರ್ಮ ಕಾರ್ಯ, ಸಮಾಜ ಸೇವೆ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನ" : baseLang === "hi" ? "धर्मार्थ कार्य एवं सामाजिक मार्गदर्शन" : baseLang === "te" ? "ధర్మ కార్యాలు మరియు సమాజ మార్గదర్శకత్వం" : baseLang === "ta" ? "தர்ம காரியங்கள் மற்றும் சமூக வழிகாட்டுதல்" : "Mentorship & Dharmic Leadership";
        const textCar = isSufficientDepth(asText(aiB.career).trim(), 2, 260)
          ? asText(aiB.career).trim()
          : buildPersonalizedCareerText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Mentorship & Dharmic Leadership", translatedCategory: catCar, text: textCar, translatedText: textCar });

        // 4. Wealth Preservation & Estate Peace
        const catWlh = baseLang === "kn" ? "ಸಂಪತ್ತು ಸಂರಕ್ಷಣೆ ಹಾಗೂ ಕುಟುಂಬ ಸಮೃದ್ಧಿ" : baseLang === "hi" ? "संपत्ति सुरक्षा एवं पारिवारिक समृद्धि" : baseLang === "te" ? "సంపద పరిరక్షణ మరియు కుటుంబ సుఖం" : baseLang === "ta" ? "செல்வப் பாதுகாப்பு மற்றும் குடும்ப சுபிட்சம்" : "Wealth Preservation & Estate Peace";
        const textWlh = isSufficientDepth(asText(aiB.wealth).trim(), 2, 260)
          ? asText(aiB.wealth).trim()
          : buildPersonalizedWealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Wealth Preservation & Estate Peace", translatedCategory: catWlh, text: textWlh, translatedText: textWlh });

        // 5. Longevity & Geriatric Wellness
        const catHlt = baseLang === "kn" ? "ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಸ್ವಾಸ್ಥ್ಯ ರಕ್ಷಣೆ" : baseLang === "hi" ? "दीर्घायु एवं स्वास्थ्य रक्षा" : baseLang === "te" ? "దీర్ఘాయుష్షు మరియు ఆరోగ్య రక్షణ" : baseLang === "ta" ? "நீண்ட ஆயுள் மற்றும் ஆரோக்கியப் பாதுகாப்பு" : "Longevity & Geriatric Wellness";
        const textHlt = isSufficientDepth(asText(aiB.health).trim(), 2, 260)
          ? asText(aiB.health).trim()
          : buildPersonalizedHealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Longevity & Geriatric Wellness", translatedCategory: catHlt, text: textHlt, translatedText: textHlt });
      } else if (ageYears < 22) {
        // Youth / Students (12 to 21 Years): Study, Character, Future Career, Financial Literacy & Vitality
        // 1. Character & Emotional Poise
        const catMar = baseLang === "kn" ? "ವ್ಯಕ್ತಿತ್ವ ನಿರ್ಮಾಣ ಹಾಗೂ ಮಾನಸಿಕ ಏಕಾಗ್ರತೆ" : baseLang === "hi" ? "चरित्र निर्माण एवं मानसिक एकाग्रता" : baseLang === "te" ? "వ్యక్తిత్వ నిర్మాణం మరియు ఏకాగ్రత" : baseLang === "ta" ? "ஆளுமை உருவாக்கம் மற்றும் மன உறுதி" : "Character & Mental Focus";
        const textMar = isSufficientDepth(asText(aiB.marriage).trim(), 2, 280)
          ? asText(aiB.marriage).trim()
          : buildPersonalizedMarriageText(lang, lagnaStr, moonStr, "unmarried", lagnaIdx, dashaName, bhuktiName, userGender as "Male" | "Female", dynamicCtx);
        v1Predictions.push({ category: "Character & Mental Focus", translatedCategory: catMar, text: textMar, translatedText: textMar });

        // 2. Higher Studies & Intellect
        const catChd = baseLang === "kn" ? "ಉನ್ನತ ಶಿಕ್ಷಣ ಹಾಗೂ ಜ್ಞಾನಾರ್ಜನೆ" : baseLang === "hi" ? "उच्च शिक्षा एवं एकाग्रता" : baseLang === "te" ? "ఉన్నత విద్య మరియు విజ్ఞానం" : baseLang === "ta" ? "உயர்கல்வி மற்றும் ஞானம்" : "Higher Studies & Intellect";
        const textChd = isSufficientDepth(asText(aiB.children).trim(), 2, 260)
          ? asText(aiB.children).trim()
          : buildPersonalizedChildrenText(lang, "no_children", lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Higher Studies & Intellect", translatedCategory: catChd, text: textChd, translatedText: textChd });

        // 3. Future Career Foundation
        const catCar = baseLang === "kn" ? "ಭವಿಷ್ಯದ ವೃತ್ತಿ ಅಡಿಪಾಯ" : baseLang === "hi" ? "भावी करियर की नींव" : baseLang === "te" ? "భవిష్యత్ కెరీర్ పునాది" : baseLang === "ta" ? "எதிர்கால தொழில் அடித்தளம்" : "Future Career Foundation";
        const textCar = isSufficientDepth(asText(aiB.career).trim(), 2, 260)
          ? asText(aiB.career).trim()
          : buildPersonalizedCareerText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Future Career Foundation", translatedCategory: catCar, text: textCar, translatedText: textCar });

        // 4. Financial Discipline & Values
        const catWlh = baseLang === "kn" ? "ಆರ್ಥಿಕ ಶಿಸ್ತು ಹಾಗೂ ಕೌಟುಂಬಿಕ ಮೌಲ್ಯಗಳು" : baseLang === "hi" ? "वित्तीय अनुशासन एवं पारिवारिक मूल्य" : baseLang === "te" ? "ఆర్థిక క్రమశిక్షణ మరియు కుటుంబ విలువలు" : baseLang === "ta" ? "நிதி ஒழுக்கம் மற்றும் குடும்ப விழுமியங்கள்" : "Financial Discipline & Values";
        const textWlh = isSufficientDepth(asText(aiB.wealth).trim(), 2, 260)
          ? asText(aiB.wealth).trim()
          : buildPersonalizedWealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Financial Discipline & Values", translatedCategory: catWlh, text: textWlh, translatedText: textWlh });

        // 5. Vitality & Fitness
        const catHlt = baseLang === "kn" ? "ಯುವ ಚೈತನ್ಯ ಹಾಗೂ ದೈಹಿಕ ದೃಢತೆ" : baseLang === "hi" ? "शारीरिक ऊर्जा एवं स्वास्थ्य संतुलन" : baseLang === "te" ? "శారీరక శక్తి మరియు ఆరోగ్య సమతుల్యత" : baseLang === "ta" ? "உடல் வலிமை மற்றும் ஆரோக்கிய சமநிலை" : "Vitality, Fitness & Screen Balance";
        const textHlt = isSufficientDepth(asText(aiB.health).trim(), 2, 260)
          ? asText(aiB.health).trim()
          : buildPersonalizedHealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Vitality, Fitness & Screen Balance", translatedCategory: catHlt, text: textHlt, translatedText: textHlt });
      } else {
        // Adult: Exactly 5 Dedicated Core Categories (Strict 2-3 Paras, 5-6 Lines Each)
        // 1. Marriage & Relationships
        const catMar = baseLang === "kn" ? "ವಿವಾಹ ಹಾಗೂ ಸಂಬಂಧ" : baseLang === "hi" ? "विवाह एवं संबंध" : baseLang === "te" ? "వివాహం మరియు సంబంధ బాంధవ్యాలు" : baseLang === "ta" ? "திருமணம் மற்றும் இல்லற வாழ்க்கை" : "Marriage & Relationships";
        let textMar = asText(aiB.marriage).trim();
        if (isSufficientDepth(textMar, 2, 280)) {
          const mParas = textMar.split("\n").filter((pText: string) => {
            const pLower = pText.toLowerCase();
            return !pLower.includes("ಸಂತಾನ") && !pLower.includes("ಮಕ್ಕಳ") && !pLower.includes("ಪಂಚಮ ಭಾವ") && !pLower.includes("progeny") && !pLower.includes("children");
          });
          textMar = mParas.join("\n\n").trim() || textMar;
        }
        if (!isSufficientDepth(textMar, 2, 280)) {
          textMar = buildPersonalizedMarriageText(lang, lagnaStr, moonStr, personalization?.maritalStatus || "general", lagnaIdx, dashaName, bhuktiName, userGender as "Male" | "Female", dynamicCtx);
        }
        v1Predictions.push({ category: "Marriage & Relationships", translatedCategory: catMar, text: textMar, translatedText: textMar });

        // 2. Children & Progeny
        const catChd = baseLang === "kn" ? "ಸಂತಾನ ಹಾಗೂ ಮಕ್ಕಳು" : baseLang === "hi" ? "संतान एवं बच्चे" : baseLang === "te" ? "సంతానం మరియు పిల్లలు" : baseLang === "ta" ? "சந்ததி மற்றும் குழந்தைகள்" : "Children & Progeny";
        const minChildrenParas = personalization?.childrenStatus === "no_children" ? 3 : 2;
        const minChildrenChars = personalization?.childrenStatus === "no_children" ? 320 : 260;
        const textChd = isSufficientDepth(asText(aiB.children).trim(), minChildrenParas, minChildrenChars)
          ? asText(aiB.children).trim()
          : buildPersonalizedChildrenText(lang, personalization?.childrenStatus || "general", lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Children & Progeny", translatedCategory: catChd, text: textChd, translatedText: textChd });

        // 3. Career & Profession
        const catCar = baseLang === "kn" ? "ಉದ್ಯೋಗ ಹಾಗೂ ವೃತ್ತಿ ಏಳಿಗೆ" : baseLang === "hi" ? "करियर एवं पदोन्नति योग" : baseLang === "te" ? "ఉద్యోగం మరియు వృత్తి ఎదుగుదల" : baseLang === "ta" ? "தொழில் மற்றும் உத்தியோக முன்னேற்றம்" : "Career & Profession";
        const textCar = isSufficientDepth(asText(aiB.career).trim(), 2, 260)
          ? asText(aiB.career).trim()
          : buildPersonalizedCareerText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Career & Profession", translatedCategory: catCar, text: textCar, translatedText: textCar });

        // 4. Wealth & Family Finance
        const catWlh = baseLang === "kn" ? "ಧನ ಆಸ್ತಿ ಹಾಗೂ ಆರ್ಥಿಕ ಯೋಗ" : baseLang === "hi" ? "धन संपत्ति एवं आर्थिक योग" : baseLang === "te" ? "ధన సంపద మరియు ఆర్థిక యోగం" : baseLang === "ta" ? "தன லாபம் மற்றும் பொருளாதார நிலை" : "Wealth & Family Finance";
        const textWlh = isSufficientDepth(asText(aiB.wealth).trim(), 2, 260)
          ? asText(aiB.wealth).trim()
          : buildPersonalizedWealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Wealth & Family Finance", translatedCategory: catWlh, text: textWlh, translatedText: textWlh });

        // 5. Health & Vitality
        const catHlt = baseLang === "kn" ? "ಆರೋಗ್ಯ ಹಾಗೂ ಚೈತನ್ಯ" : baseLang === "hi" ? "स्वास्थ्य एवं आरोग्य" : baseLang === "te" ? "ఆరోగ్యం మరియు శారీరక దృఢత్వం" : baseLang === "ta" ? "ஆரோக்கியம் மற்றும் உடல் பலம்" : "Health & Vitality";
        const textHlt = isSufficientDepth(asText(aiB.health).trim(), 2, 260)
          ? asText(aiB.health).trim()
          : buildPersonalizedHealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
        v1Predictions.push({ category: "Health & Vitality", translatedCategory: catHlt, text: textHlt, translatedText: textHlt });
      }

      // Clean English leaks from regional scripts
      const cleanedV1Predictions = v1Predictions.map(p => ({
        ...p,
        translatedText: cleanEnglishFromRegionalText(p.translatedText, lang)
      }));

      setPremiumPredictions(cleanedV1Predictions);
      const deepInsights: Record<string, string> = {};
      for (const pred of cleanedV1Predictions) {
        deepInsights[pred.translatedCategory] = pred.translatedText;
      }
      setPdfDeepInsights(deepInsights);

      // Chapters II, III, IV, VII, VIII, IX Fallbacks
      const charFallbackText = buildDynamicCharacteristicsFallback(parsedKundali);
      const secretFallbackText = buildDynamicDarkSecretFallback(parsedKundali);
      const currentPhaseFallbackText = buildDynamicCurrentPhaseFallback(parsedKundali);
      const rawSummaryFallback = buildDynamicSummaryFallback(parsedKundali);

      const finalCharacteristics = await ensureValidSection(dataCharacteristics.characteristics, charFallbackText, lang);
      const finalDarkSecret = isChild ? [] : await ensureValidSection(dataDarkSecret.darkSecret, secretFallbackText, lang);
      const finalCurrentPhase = await ensureValidSection(dataCurrentPhase.currentPhase, currentPhaseFallbackText, lang, 250);
      const finalSummary = await ensureValidSection(dataSummary.summary, rawSummaryFallback, lang, 150);

      setV1PdfProgress(65);
      setV1PdfStageText(
        pdfLanguage === "kn"
          ? "೩. ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ಮತ್ತು ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹಗಳ ಸಮನ್ವಯ..."
          : pdfLanguage === "hi"
          ? "3. विंशोत्तरी दशा-भुक्ति एवं लाइव गोचर समन्वय..."
          : "3. Harmonizing Vimshottari Dasha-Bhukti & Live Planetary Transits..."
      );

      const rawYogasFallback = (result.aiGeneratedNarrative?.yogas || [{ name: "Dasha Yoga", significance: result.masterSynthesis.overallTone }]).map(y => ({
        name: y.name,
        impact: enrichYogaDescription(y.name, asText(y.significance) || result.masterSynthesis.overallTone, lang, lagnaStr, moonStr)
      }));
      const rawYogasArray = toSafeArray(dataYogas.yogas).filter((y: any) => (y?.impact || "").trim().length > 10).length > 0
        ? dataYogas.yogas
        : rawYogasFallback;
      const finalYogas = (rawYogasArray || []).map((y: any) => ({
        ...y,
        impact: enrichYogaDescription(y.name || y.trait || "", y.impact || "", lang, lagnaStr, moonStr)
      }));

      const rawDoshasFallback = (result.aiGeneratedNarrative?.doshas || [{ name: "Karmic Challenge", significance: result.natalLayer.karmicBaggage.description, remedy: result.natalLayer.karmicBaggage.soulPurpose }]).map(d => ({
        name: d.name,
        impact: asText(d.significance) || result.natalLayer.karmicBaggage.description,
        remedy: d.remedy || result.natalLayer.karmicBaggage.soulPurpose
      }));
      const finalDoshas = toSafeArray(dataDoshas.doshas).filter((d: any) => (d?.impact || "").trim().length > 10).length > 0
        ? dataDoshas.doshas
        : rawDoshasFallback;

      const engineRoadmap6 = result.timingLayer.twelveMonthRoadmap.slice(0, 6);
      const fallbackTimeline = engineRoadmap6.map(r => ({
        dateRange: r.month,
        impact: r.prediction
      }));
      const validTimelineItems = toSafeArray(dataTimeline.timeline).filter((t: any) => (t?.impact || "").trim().length > 10);
      const finalTimeline = validTimelineItems.length >= 4 ? validTimelineItems : fallbackTimeline;

      const rawGocharaFallback = buildDynamicGocharaFallback(parsedKundali);
      const isSufficientGocharaDepth = (txt: string) => {
        if (!txt) return false;
        const trimmed = txt.trim();
        const lines = trimmed.split("\n").filter(l => l.trim().length > 0);
        return lines.length >= 2 && trimmed.length >= 140;
      };

      const aiGocharaValid = toSafeArray(dataGochara.gochara).filter((g: any) => {
        const impact = (g?.impact || "").trim();
        if (lang !== "en" && /[a-zA-Z]{3,}/.test(impact)) return false;
        return isSufficientGocharaDepth(impact);
      }).length >= 2;

      let finalGochara = aiGocharaValid ? dataGochara.gochara : rawGocharaFallback;
      finalGochara = finalGochara.map((g: any) => ({
        name: cleanEnglishFromRegionalText(g.name || "", lang),
        impact: cleanEnglishFromRegionalText(g.impact || "", lang),
        remedy: g.remedy ? cleanEnglishFromRegionalText(g.remedy, lang) : undefined
      }));

      const premiumDataPayload = {
        characteristics: finalCharacteristics,
        darkSecret: finalDarkSecret,
        currentPhase: finalCurrentPhase,
        yogas: finalYogas,
        doshas: finalDoshas,
        timeline: finalTimeline,
        gochara: finalGochara,
        summary: finalSummary
      };

      const payloadAuditStr = JSON.stringify(premiumDataPayload).toLowerCase();
      if (payloadAuditStr.includes("sorry, i encountered an error") || payloadAuditStr.includes("check your api key")) {
        console.error("[V1 PDF Quality Audit] Error detected in payload. Healing with dynamic mathematical fallbacks.");
        premiumDataPayload.summary = [{ impact: rawSummaryFallback }];
        premiumDataPayload.characteristics = [{ impact: charFallbackText }];
        premiumDataPayload.darkSecret = [{ impact: secretFallbackText }];
      }

      setPremiumDataForPdf(premiumDataPayload);

      setV1PdfProgress(85);
      setV1PdfStageText(
        pdfLanguage === "kn"
          ? "೪. ಉನ್ನತ ರೆಸಲ್ಯೂಷನ್ ಅಧಿಕೃತ ಬಗ್ಗೋಣ ಪಿಡಿಎಫ್ ಮುದ್ರಣ ಸಿದ್ಧತೆ..."
          : pdfLanguage === "hi"
          ? "4. उच्च-रिज़ॉल्यूशन आधिकारिक बग्गोण पीडीएफ मुद्रण तैयारी..."
          : "4. Assembling High-Resolution Official Baggona PDF Document..."
      );

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!premiumPdfRef.current) throw new Error("Premium PDF ref not found");

      const containerEl = premiumPdfRef.current;
      const parentEl = containerEl.parentElement;
      const originalStyle = parentEl?.getAttribute("style") || "";
      if (parentEl) {
        parentEl.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; background-color: #FFFFFF;");
      }

      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 400));

      const domHeight = containerEl.scrollHeight || containerEl.offsetHeight;
      const safeScale = domHeight > 0 ? Math.min(2, Math.max(1, 30000 / domHeight)) : 2;

      const canvas = await html2canvas(containerEl, {
        scale: safeScale,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        allowTaint: true
      });

      if (parentEl) {
        parentEl.setAttribute("style", originalStyle);
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.75);
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: [pdfWidth, pdfHeight], compress: true });
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      const langNames: Record<string, string> = { "kn": "Kannada", "ta": "Tamil", "te": "Telugu", "hi": "Hindi", "en": "English" };
      const langName = langNames[pdfLanguage] || "English";
      pdf.save(`Baggona_Panchanga_Prediction_V1_${langName}_${session?.input.name.replace(/\s+/g, '_') || 'Reading'}.pdf`);

    } catch (err: any) {
      console.error("[V1 PDF Generation Error]", err);
      alert(err.message || "Failed to generate Premium PDF V1. Please try again.");
    } finally {
      setIsGeneratingPremiumPdfV1(false);
      setV1PdfProgress(0);
      setV1PdfStageText("");
      setPremiumDataForPdf(null);
      setPremiumPredictions(null);
    }
  };

  // A4 Multi-Page PDF: same content as Premium, split into proper A4 pages
  const generateA4PDF = async () => {
    setIsGeneratingA4Pdf(true);
    try {
      if (!session) throw new Error("No session");

      // Reuse the same heavy data-fetch as generatePremiumPDF
      const now = new Date();
      const ageYears = ageDecimalYearsAt(
        session.input.birthDate,
        session.input.birthTime,
        session.input.latitude,
        session.input.longitude,
        now
      );
      const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);
      const a4MoonPlanet = session.result.planets.find(p => p.name === "Moon");
      const a4Panchanga = calculateTraditionalBaggona(session.birthDateYmd, session.birthTimeHm, session.input.latitude, session.input.longitude);

      let formattedDob = "";
      try {
        const { parseISO, format: dateFnsFormat } = await import("date-fns");
        formattedDob = dateFnsFormat(parseISO(session.input.birthDate), "dd MMM yyyy");
      } catch {
        formattedDob = session.input.birthDate;
      }
      const dobWithTime = `${formattedDob}, ${session.input.birthTime}`;

      const { translateText: tx } = await import("../../utils/translator");
      const translatedData: PdfTranslations = {
        title: await tx("Baggona Panchanga Prediction", pdfLanguage),
        subtitle: await tx("Personalized Cosmic Reading", pdfLanguage),
        nameLabel: await tx("Name", pdfLanguage),
        nameValue: session.input.name,
        dobLabel: await tx("Birth Details", pdfLanguage),
        dobValue: await tx(dobWithTime, pdfLanguage),
        lagnaLabel: await tx("Birth Lagna (Ascendant)", pdfLanguage),
        lagnaValue: await tx(session.result.lagnaRashi?.sanskrit || "Unknown", pdfLanguage),
        moonLabel: await tx("Moon Sign (Rashi)", pdfLanguage),
        moonValue: await tx(session.result.moonSign?.sanskrit || "Unknown", pdfLanguage),
        nakshatraLabel: await tx("Nakshatra", pdfLanguage),
        nakshatraValue: await tx(
          session.result.planets.find(p => p.name === "Moon")?.nakshatra?.sanskrit || "Unknown",
          pdfLanguage
        ),
        eraLabel: await tx("Current Cosmic Era", pdfLanguage),
        dashaLabel: await tx("Dasha", pdfLanguage),
        bhuktiLabel: await tx("Bhukti", pdfLanguage),
        dashaPlanetValue: currentBhuktiData ? await tx(currentBhuktiData.maha.planet, pdfLanguage) : "",
        bhuktiPlanetValue: currentBhuktiData ? await tx(currentBhuktiData.bhukti, pdfLanguage) : "",
        characteristicsTitle: await tx("Characteristics of the Person", pdfLanguage),
        darkSecretTitle: await tx("The Dark Secret", pdfLanguage),
        currentPhaseTitle: tp("currentPhaseTitle", pdfLanguage),
        currentPhaseGuidanceTitle: tp("currentPhaseGuidanceTitle", pdfLanguage),
        ashirvadaTitle: await tx("Astrologer's Blessing (Ashirvada)", pdfLanguage),
        ashirvadaValue: await tx(ashirvada || "", pdfLanguage),
        yogasTitle: tp("yogasTitle", pdfLanguage),
        doshasTitle: tp("doshasTitle", pdfLanguage),
        remedyTitle: tp("remedyTitle", pdfLanguage),
        timelineTitle: tp("timelineTitle", pdfLanguage),
        gocharaTitle: tp("gocharaTitle", pdfLanguage),
        summaryTitle: tp("summaryTitle", pdfLanguage),
        footer: await tx("Generated gracefully by Baggona Panchanga Astrology Engine", pdfLanguage),
        introTitle: tp("introTitle", pdfLanguage),
        introGreeting: greetingLine(pdfLanguage, session.input.name),
        introPrepared: buildComprehensiveIntro(pdfLanguage, {
          name: session.input.name,
          lagna: session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], pdfLanguage) : "",
          moonSign: pick(RASHI_L5[session.result.moonSign.index], pdfLanguage),
          nakshatra: a4MoonPlanet ? pick(NAKSHATRA_L5[a4MoonPlanet.nakshatra.index], pdfLanguage) : "",
          birthWeekday: pick(WEEKDAY_L5[a4Panchanga.weekdayIndex], pdfLanguage),
          birthDateFormatted: formatBirthLine(pdfLanguage, session.input.birthDate, session.input.birthTime).split(",")[0],
          birthTime: session.input.birthTime,
          mahaLord: currentBhuktiData ? pick(GRAHA_L5[toGraha(currentBhuktiData.maha.planet)], pdfLanguage) : "",
          bhuktiLord: currentBhuktiData ? pick(GRAHA_L5[toGraha(currentBhuktiData.bhukti)], pdfLanguage) : ""
        }),
        introRunning: currentBhuktiData ? runningPeriodSentence(pdfLanguage, toGraha(currentBhuktiData.maha.planet), toGraha(currentBhuktiData.bhukti)) : "",
        introBegin: tp("introBegin", pdfLanguage),
      };

      const deepInsightsArr = await Promise.all(
        DEEP_INSIGHT_CATEGORIES.map(async cat => {
          const pred = predictions.find(p =>
            p.translatedCategory?.toLowerCase().includes(cat.id) ||
            p.category?.toLowerCase().includes(cat.id)
          );
          return [
            cat.id,
            await tx(pred?.text || `No ${cat.label} insights available.`, pdfLanguage)
          ];
        })
      );
      const deepInsights = Object.fromEntries(deepInsightsArr);

      setA4PdfTranslations(translatedData);
      setA4PdfDeepInsights(deepInsights);

      // Also fetch Premium AI content
      const result = await generateMasterPrediction(
        session.result,
        {
          name: session.input.name,
          birthDate: session.input.birthDate,
          birthTime: session.input.birthTime,
          latitude: session.input.latitude,
          longitude: session.input.longitude,
          lang: pdfLanguage
        }
      );

      const parseGeminiJSON = robustParseGeminiJSON;

      const ashirvadaText = ashirvada || "May the stars guide your path.";
      const promptYogas = `You are an expert Vedic astrologer. Based on the provided data, generate 4-6 Yogas (planetary combinations) in JSON format. Language: ${pdfLanguage}. Data: ${JSON.stringify(result.aiGeneratedNarrative?.yogas || [])}. Return { "yogas": [{ "name": "", "impact": "", "remedy": "" }] }.`;
      const promptDoshas = `You are an expert Vedic astrologer. Based on the provided data, generate 3-4 Doshas in JSON format. Language: ${pdfLanguage}. Data: ${JSON.stringify(result.aiGeneratedNarrative?.doshas || [])}. Return { "doshas": [{ "name": "", "impact": "", "remedy": "" }] }.`;
      const promptCharacteristics = `You are an expert Vedic astrologer. Based on this Kundli, generate 5-7 core personality characteristics. Language: ${pdfLanguage}. Data: ${JSON.stringify(result.aiGeneratedNarrative)}. Return { "characteristics": [{ "trait": "", "description": "" }] }.`;
      // Affair indicator detection for A4 PDF (B.V. Raman classical rules)
      const a4AffairResult = detectAffairIndicators(session.result);
      const a4AffairSection = (a4AffairResult.hasAffairIndicators && a4AffairResult.confidence !== "low")
        ? `SPECIAL INSTRUCTION: This chart contains ${a4AffairResult.confidence}-confidence secret relationship indicators (B.V. Raman): ${a4AffairResult.indicators.join("; ")}. Add ONE paragraph about this — framed respectfully as a karmic soul-pattern, using dignified astrological language. Never judgemental, always compassionate.`
        : `DO NOT include any affair/secret relationship content — the kundali does not confirm such indicators.`;
      const a4StyleSeeds = [
        "Use a mystical, prophetic tone — as if reading an ancient palm leaf.",
        "Use a compassionate but unflinching elder's voice.",
        "Use rich metaphors from nature, fire, water, and shadow.",
        "Use a direct, unvarnished, piercing clarity.",
        "Use a spiritual karma-and-past-life framing throughout.",
        "Use cinematic tension — build suspense, then reveal.",
        "Use an empathetic, healing-focused voice.",
        "Use a psychological, introspective, counsellor-like tone.",
        "Use a dramatic story-like narration.",
        "Use scholarly Vedic references while remaining personal."
      ];
      const a4DarkSecretSeed = a4StyleSeeds[Math.floor(Math.random() * a4StyleSeeds.length)];
      const a4PlanetPositions = session.result.planets.map((p: { name: string; house: number; rashi?: { english?: string } }) => `${p.name} in House ${p.house} (${p.rashi?.english || ''})`).join(", ");
      const promptDarkSecret = `You are a wise astrologer who can see the deepest hidden truth about this person — the truth they carry silently inside, never speak about to family or society, but feel in every quiet moment. This is their NIGUDA RAHASYA.

OUTPUT LANGUAGE: ${pdfLanguage}.${pdfLanguage === 'kn' ? ' Write ONLY in Kannada script. Every single word must be pure Kannada. No English, no transliteration.' : pdfLanguage === 'te' ? ' Write ONLY in Telugu script. Every word must be pure Telugu.' : pdfLanguage === 'ta' ? ' Write ONLY in Tamil script. Every word must be pure Tamil.' : pdfLanguage === 'hi' ? ' Write ONLY in Hindi (Devanagari). Every word must be pure Hindi.' : ' Write in clear, simple English.'}

THIS PERSON'S HIDDEN TRUTH (use all of this as the foundation):
- Shadow pattern: ${result.natalLayer.shadowSelf.bluntTruth}
- Hidden wound: ${result.natalLayer.shadowSelf.description}
- Soul wound: ${result.natalLayer.karmicBaggage.description}
- What they keep avoiding: ${result.natalLayer.karmicBaggage.soulPurpose}
- Lagna: ${session.result.lagnaRashi?.sanskrit || session.result.lagnaRashi?.english || 'Unknown'}, Moon: ${session.result.moonSign?.sanskrit || 'Unknown'}
- Key Planet Placements: ${a4PlanetPositions}
- Running Dasha / Bhukti: ${result.metadata.runningMahadasha} / ${result.metadata.runningBhukti}
${a4AffairSection}

STRICT WRITING RULES — FOLLOW EVERY RULE WITHOUT EXCEPTION:
1. Write EXACTLY 2 paragraphs. Both paragraphs must be FULLY COMPLETE — no sentence may be cut in the middle.
2. PARAGRAPH 1 — THE SECRET THEY CARRY: Reveal the one deep truth this person hides from everyone. The private pain, fear, or wound they guard carefully from family, friends, and society. Base it on the shadow data above. Speak directly to them using "you". Be specific, emotionally honest. It must feel like a private revelation that shocks because it is TRUE — not because it is dramatic.
3. PARAGRAPH 2 — HOW IT SHAPES THEIR LIFE: Show how this hidden truth silently controls their relationships, choices, and happiness — without them realising it. Name the pattern that keeps repeating. End with one powerful, compassionate sentence that tells them: it is time to face this.
4. Use SIMPLE words that any person can read and feel. No astrological jargon in the output paragraphs. No planet names in the body text.
5. Every sentence must be grammatically complete. Never cut a sentence mid-thought.
6. Tone: like a private, confidential letter from someone who truly sees their soul — shocking, intimate, and compassionate.

Return ONLY this JSON (no extra text before or after):
{"darkSecret":[{"impact":"COMPLETE PARAGRAPH 1\\nCOMPLETE PARAGRAPH 2"}]}`;
      const promptGochara = `You are an expert Vedic astrologer. Analyze 3-4 key current planetary transits. Language: ${pdfLanguage}. Data: ${JSON.stringify(result.timingLayer?.twelveMonthRoadmap?.slice(0, 3) || [])}. Return { "gochara": [{ "planet": "", "transit": "", "impact": "" }] }.`;
      const promptSummary = `You are an expert Vedic astrologer. Write a 2-3 paragraph final summary blending Yogas, Doshas, and Timeline. Language: ${pdfLanguage}. Data - Yogas: ${JSON.stringify(result.aiGeneratedNarrative?.yogas || [])}. Return { "summary": [{ "impact": "" }] }.`;
      const promptTimeline = `You are an expert Vedic astrologer. Generate a 6-Month Planetary Influence Timeline. Language: ${pdfLanguage}. Data: ${JSON.stringify(result.timingLayer?.twelveMonthRoadmap?.slice(0, 6) || [])}. Return { "timeline": [{ "dateRange": "", "impact": "" }] }.`;

      const safeAskA4 = async (label: string, prompt: string, temp = 0.3) => {
        try {
          return await askGemini(label, prompt, geminiApiKey, pdfLanguage, { raw: true, temperature: temp });
        } catch (e) {
          console.warn(`[A4 PDF Generation] AI call failed for ${label}, using engine fallback`, e);
          return "";
        }
      };

      console.log("[A4 PDF Generation] Initiating Batch 1 AI calls (Characteristics, Secret, Yogas)...");
      const [resCharacteristics, resDarkSecret, resYogas] = await Promise.all([
        safeAskA4("Generate Characteristics", promptCharacteristics, 0.3),
        ageYears < 8 ? Promise.resolve('{"darkSecret":[]}') : safeAskA4("Generate Dark Secret", promptDarkSecret, 0.3),
        safeAskA4("Generate Yogas", promptYogas, 0.4)
      ]);

      await new Promise(r => setTimeout(r, 400));

      console.log("[A4 PDF Generation] Initiating Batch 2 AI calls (Doshas, Timeline, Gochara, Summary)...");
      const [resDoshas, resTimeline, resGochara, resSummary] = await Promise.all([
        safeAskA4("Generate Doshas", promptDoshas, 0.4),
        safeAskA4("Generate Timeline", promptTimeline, 0.4),
        safeAskA4("Generate Gochara", promptGochara, 0.4),
        safeAskA4("Generate Summary", promptSummary, 0.3)
      ]);

      const parsedChar = parseGeminiJSON(resCharacteristics).characteristics as PremiumData["characteristics"];
      const parsedSecret = parseGeminiJSON(resDarkSecret).darkSecret as PremiumData["darkSecret"];
      const parsedYogas = parseGeminiJSON(resYogas).yogas as PremiumData["yogas"];
      const parsedDoshas = parseGeminiJSON(resDoshas).doshas as PremiumData["doshas"];
      const parsedTimeline = parseGeminiJSON(resTimeline).timeline as PremiumData["timeline"];
      const parsedGochara = parseGeminiJSON(resGochara).gochara as PremiumData["gochara"];
      const parsedSummary = parseGeminiJSON(resSummary).summary as PremiumData["summary"];

      const rawCharFallback = `${result.masterSynthesis.overallTone || 'Planetary positions shape a dynamic personality.'}\n\n${result.natalLayer.shadowSelf.bluntTruth || ''}`;
      const rawSecretFallback = `${result.natalLayer.shadowSelf.bluntTruth || 'Inner drive shapes deep character.'}\n\n${result.natalLayer.karmicBaggage.soulPurpose || ''}`;
      const rawSummaryFallback = `${result.masterSynthesis.overallTone || 'A balanced planetary outlook for the future.'}\n\n${result.masterSynthesis.career || ''}\n\n${result.masterSynthesis.finance || ''}`;

      const finalChar = await ensureValidSection(parsedChar, rawCharFallback, pdfLanguage);
      const finalSecret = await ensureValidSection(parsedSecret, rawSecretFallback, pdfLanguage);
      const finalSum = await ensureValidSection(parsedSummary, rawSummaryFallback, pdfLanguage);

      const rawYogasFallback = await Promise.all(
        (result.aiGeneratedNarrative?.yogas || [{ name: "Dasha Yoga", significance: result.masterSynthesis.overallTone }]).map(async y => ({
          name: await translateText(y.name, pdfLanguage),
          impact: await translateText(asText(y.significance) || result.masterSynthesis.overallTone, pdfLanguage)
        }))
      );
      const finalYogas = toSafeArray(parsedYogas).filter((y: any) => (y?.impact || "").trim().length > 10).length > 0 ? parsedYogas : rawYogasFallback;

      const rawDoshasFallback = await Promise.all(
        (result.aiGeneratedNarrative?.doshas || [{ name: "Karmic Challenge", significance: result.natalLayer.karmicBaggage.description, remedy: result.natalLayer.karmicBaggage.soulPurpose }]).map(async d => ({
          name: await translateText(d.name, pdfLanguage),
          impact: await translateText(asText(d.significance) || result.natalLayer.karmicBaggage.description, pdfLanguage),
          remedy: await translateText(d.remedy || result.natalLayer.karmicBaggage.soulPurpose, pdfLanguage)
        }))
      );
      const finalDoshas = toSafeArray(parsedDoshas).filter((d: any) => (d?.impact || "").trim().length > 10).length > 0 ? parsedDoshas : rawDoshasFallback;

      const engineRoadmap6 = result.timingLayer.twelveMonthRoadmap.slice(0, 6);
      const fallbackTimeline = await Promise.all(
        engineRoadmap6.map(async r => ({
          dateRange: await translateText(r.month, pdfLanguage),
          impact: await translateText(r.prediction, pdfLanguage)
        }))
      );
      const validTimelineItems = (parsedTimeline || []).filter((t: any) => (t?.impact || "").trim().length > 10);
      const finalTimeline = validTimelineItems.length >= 4
        ? await Promise.all(validTimelineItems.map(async (t: any) => ({ ...t, dateRange: await translateText(t.dateRange || "", pdfLanguage) })))
        : fallbackTimeline;

      const a4LiveTransits = getTransitsForDate(session.result.moonSign.index, now, ayanamsaModel);
      const a4Transits: TransitPlacement[] = Object.entries(a4LiveTransits).map(([planet, pos]) => ({
        graha: toGraha(planet),
        rashiIndex: pos.rashiIndex,
        houseFromMoon: pos.house
      }));
      const a4NatalPlanets: NatalPlacement[] = session.result.planets.map(p => ({
        graha: toGraha(p.name),
        rashiIndex: p.rashi.index,
        house: p.house,
        retrograde: p.isRetrograde,
        debilitated: p.isDebilitated,
        exalted: p.isExalted
      }));
      const a4MahaLord = currentBhuktiData?.maha ? toGraha(currentBhuktiData.maha.planet) : null;
      const a4BhuktiLord = currentBhuktiData?.bhukti ? toGraha(currentBhuktiData.bhukti) : null;

      const a4ParsedKundali = analyzeKundali({
        lang: pdfLanguage,
        name: session.input.name,
        gender: (((session.input as any)?.gender || "Male") as "Male" | "Female"),
        ageYears,
        maritalStatus: "general",
        hasChildren: "general",
        lagnaRashiIndex: session.result.lagnaRashi?.index ?? 0,
        moonRashiIndex: session.result.moonSign.index,
        moonNakshatraIndex: a4MoonPlanet?.nakshatra.index ?? null,
        natalPlanets: a4NatalPlanets,
        transits: a4Transits,
        mahaLord: a4MahaLord,
        bhuktiLord: a4BhuktiLord
      });

      const rawGocharaFallback = buildDynamicGocharaFallback(a4ParsedKundali);
      const isSufficientGocharaDepth = (txt: string) => {
        if (!txt) return false;
        const trimmed = txt.trim();
        const lines = trimmed.split("\n").filter(l => l.trim().length > 0);
        return lines.length >= 2 && trimmed.length >= 140;
      };

      const aiGocharaValid = toSafeArray(parsedGochara).filter((g: any) => {
        const impact = (g?.impact || "").trim();
        if (pdfLanguage !== "en" && /[a-zA-Z]{3,}/.test(impact)) return false;
        return isSufficientGocharaDepth(impact);
      }).length >= 2;

      const safeGocharaSource = (aiGocharaValid && parsedGochara) ? parsedGochara : rawGocharaFallback;
      const finalGochara = safeGocharaSource.map((g: any) => ({
        name: cleanEnglishFromRegionalText(g.name || "", pdfLanguage),
        impact: cleanEnglishFromRegionalText(g.impact || "", pdfLanguage),
        remedy: g.remedy ? cleanEnglishFromRegionalText(g.remedy, pdfLanguage) : undefined
      }));

      const premiumDataPayload: PremiumData = {
        characteristics: finalChar,
        darkSecret: finalSecret,
        yogas: finalYogas,
        doshas: finalDoshas,
        timeline: finalTimeline,
        gochara: finalGochara,
        summary: finalSum
      };

      setA4PremiumDataForPdf(premiumDataPayload);

      // Wait for React to fully render the hidden template (fonts, Kundli chart, etc.)
      await new Promise(resolve => setTimeout(resolve, 2500));

      if (!a4PdfRef.current) throw new Error("A4 PDF ref not found");

      const langNames: Record<string, string> = { "kn": "Kannada", "ta": "Tamil", "te": "Telugu", "hi": "Hindi", "en": "English" };
      const langName = langNames[pdfLanguage] || "English";
      await generatePDFFromElement(
        "a4-premium-pdf-container",
        `Baggona_A4_Premium_${langName}_${session.input.name.replace(/\s+/g, "_")}.pdf`
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate A4 PDF. Please try again.");
    } finally {
      setIsGeneratingA4Pdf(false);
      setA4PremiumDataForPdf(null);
      setA4PdfTranslations(null);
      setA4PdfDeepInsights(null);
    }
  };



  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-amber-700 font-medium tracking-wide animate-pulse">
          {loadingText}
        </p>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="p-8 text-center text-amber-700 bg-amber-50/50 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200">
        <p>No predictions available for the current configuration.</p>
      </div>
    );
  }

  const groupedPredictions = predictions.reduce((acc, pred) => {
    if (!acc[pred.translatedCategory]) {
      acc[pred.translatedCategory] = [];
    }
    acc[pred.translatedCategory].push(pred);
    return acc;
  }, {} as Record<string, TranslatedPrediction[]>);

  const getIconForCategory = (category: string) => {
    if (category.toLowerCase().includes("lesson")) return "👁️";
    if (category.toLowerCase().includes("blessing")) return "✨";
    if (category.toLowerCase().includes("challenge")) return "🌑";
    return "🌌";
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in bg-amber-50 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] border border-amber-200 relative overflow-hidden">

      {/* Decorative animated moving background elements for Golden Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-amber-300/20 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-300/20 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
      </div>

      <div className="relative z-10 flex flex-col mb-12 gap-6 border-b border-amber-200 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-amber-900 mb-3 flex items-center gap-3">
            {t("ramanbhavishya.yourPersonalReading", "Your Personal Reading")}
          </h2>
          <p className="text-base text-amber-700 max-w-3xl leading-relaxed">
            {t("ramanbhavishya.personalReadingDesc", "A deeply empathetic translation of your unique birth chart, your current life chapter, and the present cosmic environment.")}
          </p>
        </div>

        <div className="flex flex-col gap-5 bg-amber-100/60 border border-amber-200/80 p-5 rounded-2xl shadow-inner">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">PDF Language:</span>
            {[
              { code: "en", name: "English" },
              { code: "kn", name: "Kannada" },
              { code: "ta", name: "Tamil" },
              { code: "te", name: "Telugu" },
              { code: "hi", name: "Hindi" }
            ].map(lang => (
              <label key={lang.code} className="flex items-center gap-1.5 cursor-pointer bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-white transition-colors">
                <input
                  type="radio"
                  name="pdfLang"
                  value={lang.code}
                  checked={pdfLanguage === lang.code}
                  onChange={() => {
                    pdfLanguagePicked.current = true;
                    setPdfLanguage(lang.code as "en" | "hi" | "kn" | "te" | "ta");
                  }}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                />
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">{lang.name}</span>
              </label>
            ))}
          </div>

          {/* Dedicated Executive Feature Card: 100% Dynamic Premium PDF V1 Engine (Separated from standard PDF buttons) */}
          <div className="w-full bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-400/90 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden mb-4 ring-2 ring-amber-400/20">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 px-3 py-0.5 rounded-full text-[10px] font-extrabold text-amber-300 uppercase tracking-widest">
                  <span>✨ ಅಧಿಕೃತ V1 ಪ್ರಕಾಶನ • 100% Dynamic Engine</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-amber-100 font-serif tracking-wide">
                  {pdfLanguage === "kn"
                    ? "ಸಂಪೂರ್ಣ ೧೦-ಅಧ್ಯಾಯಗಳ ವಿಸ್ತೃತ ಜೀವಮಾನ ಭವಿಷ್ಯವಾಣಿ (V1 Engine)"
                    : pdfLanguage === "hi"
                    ? "सम्पूर्ण १०-अध्यायों का विस्तृत जीवन भविष्यफल (V1 Engine)"
                    : "Comprehensive 10-Chapter Astrological Life Forecast (V1 Engine)"}
                </h4>
                <p className="text-xs text-amber-200/80 font-sans max-w-2xl leading-relaxed">
                  {pdfLanguage === "kn"
                    ? "ನಿಖರ ಜನ್ಮ ಕುಂಡಲಿ, ಸಪ್ತಮ/ಪಂಚಮ ಭಾವ, ನವಾಂಶ, ದಶಾ-ಭುಕ್ತಿ ಮತ್ತು ನೈಜ ಸಮಯದ ಗ್ರಹ ಗೋಚಾರದ ಆಧಾರದಲ್ಲಿ ರಚಿಸಲಾಗುವ ಪರಿಪೂರ್ಣ ಭವಿಷ್ಯ ವರದಿ. ಕನಿಷ್ಠ ೨-೩ ವಿಸ್ತೃತ ಪರಿಚ್ಛೇದಗಳೊಂದಿಗೆ ೧೦೦% ಗಣಿತಾಧಾರಿತ ನಿರೂಪಣೆ."
                    : pdfLanguage === "hi"
                    ? "सटीक जन्म कुंडली, सप्तम/पंचम भाव, नवांश, दशा-भुक्ति एवं लाइव गोचर पर आधारित संपूर्ण भविष्यफल रिपोर्ट। प्रत्येक अध्याय में विस्तृत २-३ पैराग्राफ।"
                    : "100% mathematically calculated from your exact birth chart, 7th/5th house lords, Navamsha, Vimshottari Dasha, and live transits. Every chapter features minimum 2-3 substantial paragraphs with strict 5-6 lines."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalTriggerSource("v1");
                  setIsPersonalizationModalOpen(true);
                }}
                disabled={isGeneratingPdf || isGeneratingPremiumPdf || isGeneratingPremiumPdfV1 || isGeneratingA4Pdf || isGeneratingSummaryPdf}
                className={`shrink-0 flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:via-yellow-400 hover:to-orange-400 text-slate-950 px-5 py-3.5 rounded-xl font-black text-sm transition-all duration-300 shadow-xl border-2 border-yellow-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  isGeneratingPremiumPdfV1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-xl animate-pulse">📜✨</span>
                <span>{isGeneratingPremiumPdfV1 ? "Crafting V1 Report..." : "Generate Premium PDF V1"}</span>
              </button>
            </div>
          </div>

          {/* Standard 4-Button PDF Generation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <button
              onClick={generatePDF}
              disabled={isGeneratingPdf || isGeneratingPremiumPdf || isGeneratingPremiumPdfV1 || isGeneratingA4Pdf || isGeneratingSummaryPdf}
              className={`group flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg border border-amber-400 w-full ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {isGeneratingPdf ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              <span>{isGeneratingPdf ? "Generating..." : "Download PDF"}</span>
            </button>

            <button
              onClick={() => {
                setModalTriggerSource("regular");
                setIsPersonalizationModalOpen(true);
              }}
              disabled={isGeneratingPdf || isGeneratingPremiumPdf || isGeneratingPremiumPdfV1 || isGeneratingA4Pdf || isGeneratingSummaryPdf}
              className={`group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg border border-indigo-400 w-full ${isGeneratingPremiumPdf ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {isGeneratingPremiumPdf ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-base">📄✨</span>
              )}
              <span>{isGeneratingPremiumPdf ? "Crafting..." : "Premium PDF"}</span>
            </button>

            <button
              onClick={generateA4PDF}
              disabled={isGeneratingPdf || isGeneratingPremiumPdf || isGeneratingPremiumPdfV1 || isGeneratingA4Pdf || isGeneratingSummaryPdf}
              className={`group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg border border-emerald-400 w-full ${isGeneratingA4Pdf ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {isGeneratingA4Pdf ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-base">📑</span>
              )}
              <span>{isGeneratingA4Pdf ? "Crafting A4..." : "Premium A4 PDF"}</span>
            </button>

            <button
              onClick={generateSummaryPDF}
              disabled={isGeneratingPdf || isGeneratingPremiumPdf || isGeneratingPremiumPdfV1 || isGeneratingA4Pdf || isGeneratingSummaryPdf}
              className={`group flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg border border-amber-400 w-full ${isGeneratingSummaryPdf ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {isGeneratingSummaryPdf ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-base">📜</span>
              )}
              <span>{isGeneratingSummaryPdf ? "Crafting..." : "4-Paragraph Summary"}</span>
            </button>
          </div>

          {/* Multi-Question Custom Prediction & PDF Generator Section */}
          <div className="flex flex-col gap-5 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-yellow-500/15 border-2 border-amber-400/90 p-6 rounded-3xl shadow-md mt-6">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-amber-300/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-amber-600 text-white p-2 rounded-2xl shadow-sm">🔮</span>
                <div>
                  <h3 className="font-bold text-amber-950 text-lg sm:text-xl font-sans">
                    {t("Multi-Question Custom Prediction & PDF Generator", "Multi-Question Custom Prediction & PDF Generator")}
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800 font-sans leading-relaxed">
                    {t("Add multiple custom questions via suggested topic chips, text, or microphone voice input. Generate 3 detailed prediction paragraphs + 1 remedy paragraph for each question and download a combined PDF.", "Add multiple custom questions via suggested topic chips, text, or microphone voice input. Generate 3 detailed prediction paragraphs + 1 remedy paragraph for each question and download a combined PDF.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Suggested Topic Quick Add Chips */}
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-2 font-sans">
                💡 {t("Quick Add Suggested Questions:", "Quick Add Suggested Questions:")}
              </span>
              <div className="flex flex-wrap gap-2">
                {MULTI_QUESTION_TOPICS.map(tObj => (
                  <button
                    key={tObj.id}
                    type="button"
                    onClick={() => handleAddMultiQuestion(undefined, tObj.id)}
                    className="bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm hover:-translate-y-0.5 font-sans"
                  >
                    ➕ {tObj.label[pdfLanguage as keyof typeof tObj.label] || tObj.label.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Question Input Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white/80 p-3 rounded-2xl border border-amber-300/80 shadow-sm">
              <div className="md:col-span-4">
                <select
                  value={mqTopic}
                  onChange={(e) => setMqTopic(e.target.value)}
                  className="w-full bg-amber-50 border-2 border-amber-300 text-amber-950 font-bold rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 font-sans cursor-pointer"
                >
                  {MULTI_QUESTION_TOPICS.map(tObj => (
                    <option key={tObj.id} value={tObj.id}>
                      {tObj.label[pdfLanguage as keyof typeof tObj.label] || tObj.label.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-5 relative">
                <input
                  type="text"
                  value={mqInputText}
                  onChange={(e) => setMqInputText(e.target.value)}
                  placeholder={t("Type your custom question or use mic...", "Type your custom question or use mic...")}
                  className="w-full bg-white border-2 border-amber-300 text-amber-950 font-medium rounded-xl pl-3 pr-10 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                />
                <button
                  type="button"
                  onClick={toggleMQVoiceInput}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListeningMQ ? "bg-red-500 text-white animate-pulse" : "text-amber-700 hover:text-amber-900"
                    }`}
                  title="Speak question via microphone"
                >
                  🎙️
                </button>
              </div>

              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={() => handleAddMultiQuestion()}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all border border-amber-400 hover:-translate-y-0.5"
                >
                  <span>➕</span>
                  <span>{t("Add Question", "Add Question")}</span>
                </button>
              </div>
            </div>

            {/* Questions List & Interactive Preview */}
            {multiQuestions.length > 0 && (
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between border-b border-amber-300/60 pb-2">
                  <h4 className="font-bold text-amber-950 text-base font-sans flex items-center gap-2">
                    <span>📋</span>
                    <span>{t("Added Questions List", "Added Questions List")} ({multiQuestions.length})</span>
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateMultiAnswers}
                      disabled={isGeneratingMultiAnswers}
                      className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-sm"
                    >
                      {isGeneratingMultiAnswers ? "Generating..." : "⚡ Generate Answers"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMultiQuestions([])}
                      className="text-xs font-semibold text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {multiQuestions.map((qObj, idx) => (
                    <div key={qObj.id} className="bg-white border-2 border-amber-200 rounded-2xl p-4 shadow-sm relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white font-extrabold text-xs shrink-0 mt-0.5">
                            Q{idx + 1}
                          </span>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block font-sans">
                              {qObj.topicLabel}
                            </span>
                            <h5 className="font-bold text-amber-950 text-sm md:text-base font-sans">
                              "{qObj.questionText}"
                            </h5>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMultiQuestion(qObj.id)}
                          className="text-red-500 hover:text-red-700 p-1 font-bold text-base"
                          title="Remove Question"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Accordion / Answers Preview */}
                      {qObj.answer && (
                        <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-2.5 text-xs sm:text-sm font-sans text-amber-950">
                          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                            <span className="font-bold text-amber-900 block mb-1">
                              {pdfLanguage === "kn" ? "1️⃣ ೧. ಭಾವ ಹಾಗೂ ಜನ್ಮ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ವಿಶ್ಲೇಷಣೆ" : pdfLanguage === "te" ? "1️⃣ 1. భావ మరియు జన్మ గ్రహాల స్థితి విశ్లేషణ" : pdfLanguage === "ta" ? "1️⃣ 1. பாவம் மற்றும் பிறப்பு கிரகங்களின் நிலை" : pdfLanguage === "hi" ? "1️⃣ 1. भाव एवं जन्म ग्रहों की स्थिति विश्लेषण" : "1️⃣ 1. Natal House & Planetary Placement Analysis"}
                            </span>
                            <p className="leading-relaxed">{qObj.answer.paragraph1}</p>
                          </div>
                          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                            <span className="font-bold text-amber-900 block mb-1">
                              {pdfLanguage === "kn" ? "2️⃣ ೨. ದಶಾಕಾಲ ಹಾಗೂ ಗ್ರಹ ಗೋಚಾರ ಫಲ" : pdfLanguage === "te" ? "2️⃣ 2. దశాకాలం మరియు గ్రహ గోచార ఫలం" : pdfLanguage === "ta" ? "2️⃣ 2. தசா காலம் மற்றும் கிரக கோச்சார பலன்" : pdfLanguage === "hi" ? "2️⃣ 2. दशा काल एवं ग्रह गोचर फल" : "2️⃣ 2. Running Dasha & Live Planetary Transits"}
                            </span>
                            <p className="leading-relaxed">{qObj.answer.paragraph2}</p>
                          </div>
                          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                            <span className="font-bold text-amber-900 block mb-1">
                              {pdfLanguage === "kn" ? "3️⃣ ೩. ನಿಖರ ಭವಿಷ್ಯಫಲ ಹಾಗೂ ಸಮಯ ಸಿದ್ಧಿ" : pdfLanguage === "te" ? "3️⃣ 3. ఖచ్చిత భవిష్యత్తు మరియు సమయ సిద్ధత" : pdfLanguage === "ta" ? "3️⃣ 3. துல்லியமான எதிர்கால பலன் மற்றும் காலம்" : pdfLanguage === "hi" ? "3️⃣ 3. सटीक भविष्यफल एवं समय सिद्धि" : "3️⃣ 3. Accurate Predictions & Timing Window"}
                            </span>
                            <p className="leading-relaxed">{qObj.answer.paragraph3}</p>
                          </div>
                          <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 p-3.5 rounded-xl border border-amber-400/80 shadow-sm">
                            <span className="font-bold text-amber-950 block mb-1">
                              📿 {pdfLanguage === "kn" ? "೪. ವೈದಿಕ ಶಮನ ಪರಿಹಾರ ಹಾಗೂ ಪ್ರಾರ್ಥನೆ" : pdfLanguage === "te" ? "4. వైదిక శమన పరిహారం మరియు ప్రార్థన" : pdfLanguage === "ta" ? "4. வைதிக சாந்தி பரிகாரம் மற்றும் பிரார்த்தனை" : pdfLanguage === "hi" ? "4. वैदिक समाधान, उपाय एवं प्रार्थना" : "4. Recommended Vedic Remedies & Parihara"}
                            </span>
                            <p className="font-medium leading-relaxed">{qObj.answer.paragraph4}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Download Multi-Question PDF Button */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={generateMultiQuestionPDF}
                    disabled={isGeneratingMultiPdf || isGeneratingMultiAnswers}
                    className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-800 via-orange-700 to-yellow-800 hover:from-amber-900 hover:to-orange-800 text-white px-6 py-4 rounded-2xl font-bold text-base shadow-lg transition-all border-2 border-amber-400 ${isGeneratingMultiPdf ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"
                      }`}
                  >
                    <span className="text-xl">📄✨</span>
                    <span>
                      {isGeneratingMultiPdf
                        ? "Crafting Multi-Question PDF..."
                        : t("Download Multi-Question Bhavishya PDF (3-Para + 1-Remedy per Q)", "Download Multi-Question Bhavishya PDF (3-Para + 1-Remedy per Q)")}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Questionary & Custom 4-Paragraph Question PDF Download Panel */}
          <div className="flex flex-col gap-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-300/80 p-5 rounded-2xl shadow-sm mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔮</span>
              <h3 className="font-bold text-amber-950 text-base font-sans">
                {t("Ask Specific Question & Download 4-Paragraph PDF", "Ask Specific Question & Download 4-Paragraph PDF")}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 font-sans leading-relaxed">
              {t("Select a topic from the dropdown, type your question or click the mic to speak, then download a customized 4-paragraph PDF for that question alone.", "Select a topic from the dropdown, type your question or click the mic to speak, then download a customized 4-paragraph PDF for that question alone.")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Topic Select */}
              <div className="md:col-span-4">
                <select
                  value={qTopic}
                  onChange={(e) => setQTopic(e.target.value)}
                  className="w-full bg-white border-2 border-amber-300 text-amber-950 font-bold rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 font-sans cursor-pointer"
                >
                  {QUESTION_TOPICS.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.label[pdfLanguage as keyof typeof t.label] || t.label.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Question + Mic */}
              <div className="md:col-span-5 relative">
                <input
                  type="text"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder={t("Type question or speak...", "Type question or speak...")}
                  className="w-full bg-white border-2 border-amber-300 text-amber-950 font-medium rounded-xl pl-3 pr-9 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                />
                <button
                  type="button"
                  onClick={toggleQVoiceInput}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListeningQ ? "bg-red-500 text-white animate-pulse" : "text-amber-700 hover:text-amber-900"
                    }`}
                  title="Speak question via microphone"
                >
                  🎙️
                </button>
              </div>

              {/* Download Question PDF Button */}
              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={generateQuestionPDF}
                  disabled={isGeneratingSummaryPdf || isGeneratingPdf || isGeneratingPremiumPdf || isGeneratingA4Pdf}
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 hover:from-amber-800 hover:to-orange-700 text-white px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all border border-amber-400 ${isGeneratingSummaryPdf ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"
                    }`}
                >
                  <span>📜✨</span>
                  <span>{isGeneratingSummaryPdf ? "Crafting..." : "Download Question PDF"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-900 font-bold text-lg">Preparing your PDF...</p>
            <p className="text-slate-500 text-sm mt-2">This may take a few moments.</p>
          </div>
        </div>
      )}

      {isGeneratingA4Pdf && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-emerald-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-2xl border-4 border-emerald-500 max-w-xs w-full mx-4 text-center">
            <div className="relative w-32 h-32 mb-6 overflow-hidden rounded-full bg-sky-100 border-4 border-emerald-200 shadow-inner flex items-end justify-center">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-emerald-600/20 rounded-t-full" />
              <div className="w-16 h-16 bg-gradient-to-t from-emerald-400 to-teal-300 rounded-full animate-[rise_3s_ease-in-out_infinite] shadow-[0_0_30px_rgba(52,211,153,0.8)]" />
              <style>{`
                @keyframes rise {
                  0% { transform: translateY(40px) scale(0.8); opacity: 0.5; }
                  50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
                  100% { transform: translateY(40px) scale(0.8); opacity: 0.5; }
                }
              `}</style>
            </div>
            <h3 className="text-xl font-bold text-indigo-950 mb-2">Generating A4 Blueprint...</h3>
            <p className="text-xs text-slate-600 font-medium animate-pulse">Composing multi-page A4 document...</p>
          </div>
        </div>
      )}

      {/* Full-Screen Centered Loader Overlay for Multi-Question PDF Generation */}
      {(isGeneratingMultiPdf || isGeneratingMultiAnswers) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-indigo-950/80 backdrop-blur-md">
          <div className="flex flex-col items-center p-8 bg-gradient-to-b from-amber-50 to-white rounded-3xl shadow-2xl border-4 border-amber-500 max-w-sm w-full mx-4 text-center">
            {/* Animated Golden Spinning Yantra SVG Loader */}
            <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
              <svg className="w-full h-full animate-spin text-amber-600" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" strokeDasharray="280" strokeDashoffset="80" strokeLinecap="round" />
                <polygon points="50,15 80,75 20,75" fill="none" stroke="currentColor" strokeWidth="3" />
                <polygon points="50,85 80,25 20,25" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="50" cy="50" r="8" fill="currentColor" />
              </svg>
              <span className="absolute text-2xl animate-pulse">🔮</span>
            </div>
            <h3 className="text-xl font-bold text-amber-950 mb-2 font-sans">
              {pdfLanguage === "kn" ? "ಬಹುಪ್ರಶ್ನೆ ಜಾತಕ ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ..." : "Generating Multi-Question Astrological Blueprint..."}
            </h3>
            <p className="text-xs text-amber-800 font-medium animate-pulse font-sans leading-relaxed">
              {pdfLanguage === "kn"
                ? "ಗ್ರಹ ಸ್ಥಿತಿ, ದಶಾಕಾಲ ಹಾಗೂ ಪ್ರತ್ಯೇಕ ೩-ಪ್ಯಾರಾಗ್ರಾಫ್ ಭವಿಷ್ಯಫಲ ಮತ್ತು ಶಮನ ಪರಿಹಾರ ಲೇಖನ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ. ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ..."
                : "Analyzing natal houses, Dasha periods, and composing 3 prediction paragraphs + 1 Parihara per question. Please wait..."}
            </p>
          </div>
        </div>
      )}

      {/* Full-Screen Centered Loader Overlay for Premium PDF Generation */}
      {isGeneratingPremiumPdf && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-indigo-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-2xl border-4 border-amber-500 max-w-xs w-full mx-4 text-center">
            {/* Rising Sun Animation */}
            <div className="relative w-32 h-32 mb-6 overflow-hidden rounded-full bg-sky-200 border-4 border-amber-200 shadow-inner flex items-end justify-center">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-amber-600/20 rounded-t-full" />
              <div className="w-16 h-16 bg-gradient-to-t from-amber-400 to-yellow-300 rounded-full animate-[rise_3s_ease-in-out_infinite] shadow-[0_0_30px_rgba(251,191,36,0.8)]" />
              <style>{`
                @keyframes rise {
                  0% { transform: translateY(40px) scale(0.8); opacity: 0.5; }
                  50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
                  100% { transform: translateY(40px) scale(0.8); opacity: 0.5; }
                }
              `}</style>
            </div>
            <h3 className="text-xl font-bold text-indigo-950 mb-2">
              Generating Blueprint...
            </h3>
            <p className="text-xs text-slate-600 font-medium animate-pulse">
              Please wait. Analyzing cosmic alignments...
            </p>
          </div>
        </div>
      )}

      {/* Detailed predictions hidden for now as per user request */}
      {/* 
      <div className="relative z-10 space-y-12">
        {currentMindset && (
          <div className="mb-12">
            <h2 className="text-3xl font-serif text-amber-900 mb-8 text-center flex items-center justify-center gap-4">
              <span className="w-12 h-[2px] bg-amber-200"></span>
              <span className="tracking-wide font-bold">{currentMindset.translatedCategory}</span>
              <span className="w-12 h-[2px] bg-amber-200"></span>
            </h2>
            <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-amber-100 hover:border-amber-300 transition-all duration-500 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-200/50 transition-colors"></div>
              <div className="relative z-10 space-y-4">
                {currentMindset.translatedText.split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-slate-700 leading-relaxed text-[17px] font-medium whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {Object.entries(groupedPredictions).map(([category, preds]) => (
          <div className="break-inside-avoid" key={category}>
            <h3 className="text-2xl font-serif text-amber-900 mb-6 flex items-center gap-3 border-b border-amber-200 pb-2 inline-flex">
              <span className="text-2xl bg-amber-100 p-2 rounded-xl border border-amber-200 shadow-sm">{getIconForCategory(category)}</span> 
              <span className="tracking-wide font-bold">{category}</span>
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {preds.map((pred, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-amber-100 hover:border-amber-300 transition-all duration-500 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl group-hover:bg-amber-200/50 transition-colors pointer-events-none"></div>
                  
                  <div className="relative z-10 space-y-4">
                    {pred.translatedText.split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-slate-700 leading-relaxed text-[17px] font-medium whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {ashirvada && (
          <div className="break-inside-avoid mt-8">
            <div className="text-center mb-4">
              <span className="text-5xl text-amber-600 drop-shadow-sm opacity-90 font-serif">ॐ</span>
            </div>
            <h3 className="text-2xl font-serif text-amber-900 mb-6 flex items-center justify-center gap-3 border-b border-amber-200 pb-2 inline-flex w-full">
              <span className="tracking-wide font-bold">{t("ramanbhavishya.ashirvada", "Astrologer's Blessing")}</span>
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-amber-100 hover:border-amber-300 transition-all duration-500 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl group-hover:bg-amber-200/50 transition-colors pointer-events-none"></div>
                <div className="relative z-10 space-y-4">
                  <p className="text-slate-700 leading-relaxed text-[17px] font-medium whitespace-pre-line italic">
                    {ashirvada}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      */
      }

      {/* Hidden PDF Template Container */}
      <div id="standard-pdf-container" style={{ position: "fixed", left: "-9999px", top: 0, width: "900px", visibility: "hidden", pointerEvents: "none" }}>
        {pdfTranslations && pdfDeepInsights && (
          <PdfTemplate
            ref={pdfRef}
            theme="sunrise"
            session={session}
            predictions={(currentMindset ? [currentMindset, ...predictions] : predictions).filter(p => p && p.category !== "Error" && p.translatedCategory !== "Error" && !(p.text || "").includes("Sorry, I encountered an error"))}
            translations={pdfTranslations}
            deepInsights={pdfDeepInsights}
          />
        )}
      </div>

      {/* Hidden Premium PDF Template Container */}
      <div id="premium-pdf-container" style={{ position: "fixed", left: "-9999px", top: 0, width: "900px", visibility: "hidden", pointerEvents: "none" }}>
        {premiumDataForPdf && pdfTranslations && (
          <PdfTemplate
            ref={premiumPdfRef}
            theme="sunrise"
            session={session}
            predictions={(premiumPredictions ?? (currentMindset ? [currentMindset, ...predictions] : predictions)).filter(p => p && p.category !== "Error" && p.translatedCategory !== "Error" && !(p.text || "").includes("Sorry, I encountered an error"))}
            translations={pdfTranslations}
            deepInsights={pdfDeepInsights || {}}
            premiumData={premiumDataForPdf}
          />
        )}
      </div>

      {/* Hidden A4 Multi-Page Premium PDF Template Container */}
      <div id="a4-premium-pdf-container" style={{ position: "fixed", left: "-9999px", top: 0, width: "900px", visibility: "hidden", pointerEvents: "none" }}>
        {a4PdfTranslations && a4PdfDeepInsights && a4PremiumDataForPdf && (
          <PdfTemplate
            ref={a4PdfRef}
            theme="sunrise"
            session={session}
            predictions={(currentMindset ? [currentMindset, ...predictions] : predictions).filter(p => p && p.category !== "Error" && p.translatedCategory !== "Error" && !(p.text || "").includes("Sorry, I encountered an error"))}
            translations={a4PdfTranslations}
            deepInsights={a4PdfDeepInsights}
            premiumData={a4PremiumDataForPdf}
          />
        )}
      </div>

      {/* Hidden Multi-Question PDF Template Container */}
      <div id="multi-pdf-container" style={{ position: "fixed", left: "-9999px", top: 0, width: "900px", visibility: "hidden", pointerEvents: "none" }}>
        {multiPdfTranslations && multiQuestions.length > 0 && (
          <MultiQuestionPdfTemplate
            ref={multiPdfRef}
            session={session}
            translations={multiPdfTranslations}
            questionsData={multiQuestions}
            lang={pdfLanguage}
          />
        )}
      </div>

      {/* Hidden 4-Paragraph Summary PDF Template Container */}
      <div id="summary-pdf-container" style={{ position: "fixed", left: "-9999px", top: 0, width: "900px", visibility: "hidden", pointerEvents: "none" }}>
        {summaryPdfTranslations && summaryDataForPdf && (
          <SummaryPdfTemplate
            ref={summaryPdfRef}
            session={session}
            translations={summaryPdfTranslations}
            summaryData={summaryDataForPdf}
          />
        )}
      </div>

      {/* Interactive PDF Personalization Modal */}
      <PdfPersonalizationModal
        isOpen={isPersonalizationModalOpen}
        lang={pdfLanguage}
        onClose={() => setIsPersonalizationModalOpen(false)}
        onConfirm={(personalization) => {
          setIsPersonalizationModalOpen(false);
          if (modalTriggerSource === "v1") {
            generatePremiumPDFV1(personalization);
          } else {
            generatePremiumPDF(personalization);
          }
        }}
      />

      {/* Full-Screen Luxury Blocking Loader for Premium PDF V1 */}
      {isGeneratingPremiumPdfV1 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn select-none cursor-wait">
          {/* Central Sacred Card */}
          <div className="relative w-full max-w-lg bg-[#0c0a09]/95 border-4 border-amber-500/80 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(245,158,11,0.35)] text-amber-100 font-serif overflow-hidden ring-4 ring-amber-400/30">
            {/* Ambient gold glow elements */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Decorative Heritage Corner Marks */}
            <div className="absolute top-3 left-4 text-xl text-amber-400/70 select-none">卐</div>
            <div className="absolute top-3 right-4 text-xl text-amber-400/70 select-none">卐</div>
            <div className="absolute bottom-3 left-4 text-xl text-amber-400/70 select-none">🕉️</div>
            <div className="absolute bottom-3 right-4 text-xl text-amber-400/70 select-none">🕉️</div>

            {/* Header Invocations */}
            <div className="text-center space-y-1.5 pb-4 border-b border-amber-500/30">
              <div className="text-xs font-bold tracking-widest text-amber-400 uppercase font-sans">
                ॥ ಶ್ರೀ ಕುಲದೇವತಾ ಪ್ರಸನ್ನ ॥
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-amber-200 tracking-wider font-serif">
                ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥
              </h3>
              <div className="text-xs font-semibold text-amber-300/90 font-sans">
                {pdfLanguage === "kn"
                  ? "ಸಂಪೂರ್ಣ ೧೦-ಅಧ್ಯಾಯಗಳ ವಿಸ್ತೃತ ಜೀವಮಾನ ಭವಿಷ್ಯವಾಣಿ (V1 Engine)"
                  : pdfLanguage === "hi"
                  ? "सम्पूर्ण १०-अध्यायों का विस्तृत जीवन भविष्यफल (V1 Engine)"
                  : "10-Chapter Comprehensive Astrological Life Forecast (V1)"}
              </div>
            </div>

            {/* Sacred Rotating Graha Mandala Animation */}
            <div className="my-6 flex flex-col items-center justify-center relative">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer spinning celestial mandala */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-400/60 animate-[spin_8s_linear_infinite]" />
                {/* Middle counter-rotating ring */}
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-orange-400/50 animate-[spin_6s_linear_infinite_reverse]" />
                {/* Pulsing inner glow ring */}
                <div className="absolute inset-4 rounded-full border border-yellow-300/40 animate-ping" />
                {/* Center sacred Jyoti / Diya */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg border-2 border-amber-300 shadow-amber-500/50">
                  <span className="text-3xl animate-bounce">🪔</span>
                </div>
              </div>

              {/* Real-time Percentage Counter */}
              <div className="mt-3 text-center">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 font-mono tracking-wider">
                  {v1PdfProgress}%
                </span>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mt-0.5 font-sans">
                  {pdfLanguage === "kn" ? "ಗಣಿತಾಧಾರಿತ ಸಂಶ್ಲೇಷಣೆ ಚಾಲ್ತಿಯಲ್ಲಿದೆ..." : "Vedic Synthesis in Progress..."}
                </div>
              </div>
            </div>

            {/* Dynamic Stage Progress Bar & Description */}
            <div className="space-y-3 bg-amber-950/60 p-4 rounded-2xl border border-amber-500/40 shadow-inner font-sans">
              <div className="flex justify-between items-center text-xs font-bold text-amber-200">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>{pdfLanguage === "kn" ? "ಲೈವ್ ಪ್ರಗತಿ (Live Pipeline):" : "Live Processing Pipeline:"}</span>
                </span>
                <span className="font-mono text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-500/40 text-[11px]">
                  {v1PdfProgress >= 90 ? "ಹಂತ ೪/೪ (Step 4/4)" : v1PdfProgress >= 60 ? "ಹಂತ ೩/೪ (Step 3/4)" : v1PdfProgress >= 30 ? "ಹಂತ ೨/೪ (Step 2/4)" : "ಹಂತ ೧/೪ (Step 1/4)"}
                </span>
              </div>

              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-amber-500/50">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${Math.max(v1PdfProgress, 8)}%` }}
                />
              </div>

              <p className="text-xs text-amber-200/90 font-medium text-center italic min-h-[2.5em] flex items-center justify-center px-2 leading-relaxed">
                {v1PdfStageText || (pdfLanguage === "kn" ? "ನಿಖರ ಜನ್ಮ ಕುಂಡಲಿ ಹಾಗೂ ಗ್ರಹ ಸ್ಥಿತಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." : "Synthesizing 100% accurate mathematical Kundali and transit positions...")}
              </p>
            </div>

            {/* Bottom Heritage Seal & Sanskrit Shanti Mantra */}
            <div className="mt-4 pt-3 border-t border-amber-500/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-amber-300/80 font-sans gap-2">
              <span className="italic">॥ ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ ॥</span>
              <span className="font-bold text-amber-400">ಗೋಕರ್ಣ ದೃಗ್ಗಣಿತ • ಶ್ರೀ ರಾಮ ಪಂಡಿತ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
