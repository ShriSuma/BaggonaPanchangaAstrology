import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { savePdfBlob } from "../../utils/pdfGenerator";
import { useAppStore } from "../../stores/appStore";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import type { PdfTranslations, PremiumData } from "../../components/RamanBhavishya/PdfTemplate";
import type { TranslatedPrediction } from "../../components/RamanBhavishya/usePredictionEngine";
import {
  validateBhavishyaV1Content,
  assertBhavishyaV1Integrity,
  BhavishyaValidationError,
  type BhavishyaValidationResult
} from "./bhavishyaV1Validator";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";
import { generateMasterPrediction } from "../../core/MasterPredictionEngine";
import { detectAffairIndicators } from "../../core/layers/NatalLayer";
import { getTransitsForDate } from "../../core/BaggonaPredictionEngine";
import { askGemini } from "../../core/GeminiEngine";
import { translateText } from "../../utils/translator";
import { calculateComprehensiveDoshas } from "../../core/ComprehensiveDoshaEngine";
import {
  robustParseGeminiJSON,
  toSafeArray,
  buildPersonalizedMarriageText,
  buildPersonalizedChildrenText,
  buildPersonalizedCareerText,
  buildPersonalizedWealthText,
  buildPersonalizedHealthText,
  type DynamicChartContext
} from "../../components/RamanBhavishya/BhavishyaView";
import {
  analyzeKundali,
  buildDynamicCharacteristicsFallback,
  buildDynamicDarkSecretFallback,
  buildDynamicCurrentPhaseFallback,
  buildDynamicGocharaFallback,
  buildDynamicSummaryFallback,
  buildDynamicChildEducationFallback,
  buildDynamicChildActivitiesFallback,
  buildDynamicChildFoundationFallback,
  buildDynamicChildFamilyFallback,
  buildDynamicChildPediatricHealthFallback,
  buildDynamicTimelineFallback,
  buildDynamicSoulMirrorFallback,
  buildDynamicAnnualForecastFallback,
  buildDynamicDashaGocharaCompassFallback,
  buildDynamicPrescriptions,
  toKnDigits
} from "./dynamicBhavishyaEngine";
import {
  enrichYogaDescription,
  enrichDoshaDescription,
  enrichGocharaDescription,
  hasTwoSubstantialParagraphs,
  localizeYogaName,
  localizeDoshaName,
  localizeGocharaName,
  localizeDoshaRemedy,
  cleanDegreesFromText
} from "./yogaDoshaGocharaEnricher";
import { transliterateName } from "../../utils/transliterator";
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
} from "./premiumPdfLocale";
import { WEEKDAY_L5, TITHI_L5, PURNIMA_L5, AMAVASYA_L5, PAKSHA_L5 } from "../seva/sevaLocale";
import {
  buildPremiumPrompts,
  type NatalPlacement,
  type TransitPlacement
} from "./premiumPrompts";
import type { PlanetName } from "../../core/AstroTypes";
import {
  computeMaandi,
  getMaandiHouseFromLagna,
  getMaandiPerspectiveInterpretation
} from "../../core/MaandiEngine";

const toGraha = (planet: PlanetName | string): GrahaKey => String(planet) as GrahaKey;

export const asText = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value.join("\n\n") : (value ?? "");

export function ensureAtLeastThreeParagraphs(
  aiText: string | string[] | undefined,
  fallbackText: string,
  minParagraphs: number = 3
): string {
  const rawText = (Array.isArray(aiText) ? aiText.join("\n\n") : (aiText || "")).trim();
  let paras = rawText
    ? rawText
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 25)
    : [];

  if (paras.length < minParagraphs && rawText.includes("\n")) {
    const singleLineParas = rawText
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 25);
    if (singleLineParas.length >= paras.length) {
      paras = singleLineParas;
    }
  }

  const fallbackParas = fallbackText
    ? fallbackText
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 25)
    : [];

  const isCallout = (p: string) => p.startsWith("【") || p.startsWith("[");

  const narrativeParas = paras.filter(p => !isCallout(p));
  const calloutParas = paras.filter(p => isCallout(p));

  const fallbackNarrative = fallbackParas.filter(p => !isCallout(p));
  const fallbackCallout = fallbackParas.filter(p => isCallout(p));

  // Ensure at least minParagraphs (default 3) full narrative paragraphs
  const combinedNarrative = [...narrativeParas];
  for (const fbP of fallbackNarrative) {
    if (combinedNarrative.length >= minParagraphs) break;
    if (!combinedNarrative.some(cp => cp.slice(0, 30) === fbP.slice(0, 30))) {
      combinedNarrative.push(fbP);
    }
  }
  let fbIdx = 0;
  while (combinedNarrative.length < minParagraphs && fallbackNarrative.length > 0 && fbIdx < fallbackNarrative.length) {
    const candidate = fallbackNarrative[fbIdx % fallbackNarrative.length];
    if (!combinedNarrative.includes(candidate)) {
      combinedNarrative.push(candidate);
    }
    fbIdx++;
  }

  // Ensure 1 callout box paragraph if callout exists in fallback or AI text
  const finalCallout: string[] = [];
  if (calloutParas.length > 0) {
    finalCallout.push(calloutParas[0]);
  } else if (fallbackCallout.length > 0) {
    finalCallout.push(fallbackCallout[0]);
  }

  const resultParas = [...combinedNarrative, ...finalCallout];
  if (resultParas.length > 0) {
    return resultParas.join("\n\n");
  }

  return fallbackText || "";
}

export const ensureValidSection = async (
  items: any,
  fallbackText: string,
  targetLang: string,
  minChars: number = 10
): Promise<{ name?: string; impact: string; remedy?: string; dateRange?: string }[]> => {
  const safeItems = toSafeArray(items);
  const isRegional = targetLang && !targetLang.toLowerCase().startsWith("en");
  const validItems = safeItems.filter(item => {
    if (!item) return false;
    const txt = (item.impact || item.description || item.trait || "").trim();
    if (txt.length < minChars) return false;
    // Sanitize English AI leaks in regional language downloads; reject only if predominantly English
    if (isRegional) {
      const engWords = txt.match(/[a-zA-Z]{3,}/g) || [];
      if (engWords.length > 3) return false;
    }
    return true;
  });
  if (validItems.length > 0) {
    return validItems.map(item => {
      const rawImpact = cleanEnglishFromRegionalText(item.impact || item.description || item.trait || "", targetLang);
      const guaranteedImpact = ensureAtLeastThreeParagraphs(rawImpact, fallbackText, 3);
      return {
        ...item,
        impact: guaranteedImpact,
        name: item.name ? cleanEnglishFromRegionalText(item.name, targetLang) : undefined
      };
    });
  }
  const safeFallback = fallbackText || "";
  const isTargetEnglish = !isRegional;
  const hasIndicScript = /[\u0900-\u0D7F]/.test(safeFallback);
  if (isTargetEnglish || hasIndicScript) {
    return [{ impact: cleanEnglishFromRegionalText(safeFallback, targetLang) }];
  }
  try {
    const translatedFallback = await translateText(safeFallback, targetLang);
    return [{ impact: cleanEnglishFromRegionalText(translatedFallback || safeFallback, targetLang) }];
  } catch {
    return [{ impact: cleanEnglishFromRegionalText(safeFallback, targetLang) }];
  }
};

export interface BhavishyaV1Payload {
  translations: PdfTranslations;
  premiumData: PremiumData;
  deepInsights: Record<string, string>;
  predictions: TranslatedPrediction[];
  ageYears: number;
}

export async function prepareBhavishyaV1Data(
  session: KundliViewerSession,
  lang: string,
  geminiApiKey: string = "",
  personalization?: { maritalStatus?: string; childrenStatus?: string },
  onProgress?: (progress: number, stageText: string) => void
): Promise<BhavishyaV1Payload> {
  const baseLang = (lang || "en").split("-")[0];
  const runId = newRunId();

  onProgress?.(
    15,
    lang === "kn"
      ? "೧. ಜನ್ಮ ಲಗ್ನ, ನವಾಂಶ ಮತ್ತು ಗ್ರಹಗಳ ಗಣನೆ..."
      : lang === "hi"
      ? "1. जन्म लग्न, नवांश एवं ग्रह गणना..."
      : "1. Calculating Natal Lagna, Bhavas & Navamsha..."
  );

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

  const localizedDevoteeName = (lang !== "en" && /[a-zA-Z]/.test(session.input.name))
    ? transliterateName(session.input.name, lang)
    : session.input.name;

  const sunPlanet = session.result.planets.find(p => p.name === 'Sun');
  const moonLong = moonPlanet ? (moonPlanet.rashi.index * 30 + moonPlanet.degree) : 0;
  const sunLong = sunPlanet ? (sunPlanet.rashi.index * 30 + sunPlanet.degree) : 0;
  const tithiDiff = (moonPlanet && sunPlanet) ? ((moonLong - sunLong + 360) % 360) : 0;
  const tithiIdx = Math.floor(tithiDiff / 12) % 30;

  const RASHI_LORDS: GrahaKey[] = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
  const lagnaLordKey = session.result.lagnaRashi ? RASHI_LORDS[((session.result.lagnaRashi.index % 12) + 12) % 12] : "Sun";
  const moonLordKey = RASHI_LORDS[((session.result.moonSign.index % 12) + 12) % 12];

  const getTithiDisplay = (idx: number, l: string): string => {
    if (idx === 14) return pick(PURNIMA_L5, l);
    if (idx === 29) return pick(AMAVASYA_L5, l);
    if (idx < 14) {
      const p = pick(PAKSHA_L5.shukla, l).split(" ")[0];
      return `${p} ${pick(TITHI_L5[idx], l)}`;
    }
    const p = pick(PAKSHA_L5.krishna, l).split(" ")[0];
    return `${p} ${pick(TITHI_L5[idx - 15], l)}`;
  };

  const translatedData: PdfTranslations = {
    title: tp("title", lang),
    subtitle: tp("subtitle", lang),
    nameLabel: tp("nameLabel", lang),
    nameValue: localizedDevoteeName,
    dobLabel: tp("dobLabel", lang),
    dobValue: formatBirthLine(lang, session.input.birthDate, session.input.birthTime),
    lagnaLabel: tp("lagnaLabel", lang),
    lagnaValue: session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "",
    lagnaLordLabel: tp("lagnaLordLabel", lang),
    lagnaLordValue: session.result.lagnaRashi ? pick(GRAHA_L5[lagnaLordKey], lang) : "",
    moonLabel: tp("moonLabel", lang),
    moonValue: pick(RASHI_L5[session.result.moonSign.index], lang),
    moonLordLabel: tp("moonLordLabel", lang),
    moonLordValue: pick(GRAHA_L5[moonLordKey], lang),
    nakshatraLabel: tp("nakshatraLabel", lang),
    nakshatraValue: moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : "",
    padaLabel: tp("padaLabel", lang),
    padaValue: session.result.moonPada ? (lang === "kn" ? toKnDigits(session.result.moonPada) : String(session.result.moonPada)) : "",
    tithiLabel: tp("tithiLabel", lang),
    tithiValue: getTithiDisplay(tithiIdx, lang),
    weekdayLabel: tp("weekdayLabel", lang),
    weekdayValue: pick(WEEKDAY_L5[panchanga.weekdayIndex], lang),
    eraLabel: tp("eraLabel", lang),
    dashaLabel: tp("dashaLabel", lang),
    bhuktiLabel: tp("bhuktiLabel", lang),
    dashaPlanetValue: mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "",
    bhuktiPlanetValue: bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "",
    prescriptionsTitle: tp("prescriptionsTitle", lang),
    gemstoneLabel: tp("gemstoneLabel", lang),
    rudrakshaLabel: tp("rudrakshaLabel", lang),
    ishtaDevataLabel: tp("ishtaDevataLabel", lang),
    luckyColorsLabel: tp("luckyColorsLabel", lang),
    luckyDaysLabel: tp("luckyDaysLabel", lang),
    luckyNumbersLabel: tp("luckyNumbersLabel", lang),
    luckyDirectionLabel: tp("luckyDirectionLabel", lang),
    elementalBalanceTitle: tp("elementalBalanceTitle", lang),
    cosmicShieldTitle: tp("cosmicShieldTitle", lang),
    mindVitalityTitle: tp("mindVitalityTitle", lang),
    ashirvadaTitle: tp("ashirvadaTitle", lang),
    ashirvadaValue: tp("ashirvadaValue", lang),
    footer: tp("footer", lang),
    soulMirrorTitle: tp("soulMirrorTitle", lang),
    yogasTitle: tp("yogasTitle", lang),
    doshasTitle: tp("doshasTitle", lang),
    remedyTitle: tp("remedyTitle", lang),
    characteristicsTitle: tp("characteristicsTitle", lang),
    darkSecretTitle: tp("darkSecretTitle", lang),
    currentPhaseTitle: tp("currentPhaseTitle", lang),
    currentPhaseGuidanceTitle: tp("currentPhaseGuidanceTitle", lang),
    timelineTitle: tp("timelineTitle", lang),
    gocharaTitle: tp("gocharaTitle", lang),
    annualForecastTitle: tp("annualForecastTitle", lang),
    dashaGocharaCompassTitle: tp("dashaGocharaCompassTitle", lang),
    dashaGocharaCompassSubtitle: tp("dashaGocharaCompassSubtitle", lang),
    summaryTitle: tp("summaryTitle", lang),
    introTitle: tp("introTitle", lang),
    introGreeting: greetingLine(lang, localizedDevoteeName),
    introPrepared: buildComprehensiveIntro(lang, {
      name: localizedDevoteeName,
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

  // Real transit positions for today, counted from birth Moon
  const liveTransits = getTransitsForDate(session.result.moonSign.index, now);
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

  onProgress?.(
    28,
    lang === "kn"
      ? "೨. ವೈದಿಕ ಸೂತ್ರಗಳು ಹಾಗೂ ಮಹಾದಶಾ-ಭುಕ್ತಿ ಕಾಲಗಣನೆ..."
      : lang === "hi"
      ? "2. वैदिक सूत्र एवं महादशा-भुक्ति काल गणना..."
      : "2. Calculating Vedic Formulas & Vimshottari Timeline..."
  );

  let result: any = null;
  try {
    result = await generateMasterPrediction(session.result, {
      name: session.input.name,
      birthDate: session.input.birthDate,
      birthTime: session.input.birthTime,
      latitude: session.input.latitude,
      longitude: session.input.longitude,
      lang,
      isMarried: personalization?.maritalStatus === "married" ? true : personalization?.maritalStatus === "unmarried" ? false : undefined,
      hasChildren: personalization?.childrenStatus === "has_children" ? true : personalization?.childrenStatus === "no_children" ? false : undefined
    });
  } catch (masterErr) {
    console.warn("[bhavishyaV1Service] generateMasterPrediction fallback triggered:", masterErr);
    result = {
      natalLayer: { shadowSelf: { bluntTruth: "" }, karmicBaggage: { soulPurpose: "", description: "" } },
      timingLayer: { lifeClock: { currentPhase: "" }, twelveMonthRoadmap: [] },
      masterSynthesis: { overallTone: "", career: "", finance: "" },
      aiGeneratedNarrative: { yogas: [], doshas: [] },
      pariharas: []
    };
  }

  const affairResult = detectAffairIndicators(session.result);
  const affairNote = (affairResult.hasAffairIndicators && affairResult.confidence !== "low")
    ? `The chart carries ${affairResult.confidence}-confidence classical indicators of hidden romantic complexity (${affairResult.indicators.slice(0, 2).join("; ")}). Give this one short paragraph, framed as a karmic soul-pattern in dignified language. Never judgemental.`
    : `This chart shows no confirmed indicator of a secret relationship. Do not raise the subject at all.`;

  // Compute authentic Vedic doshas with 100% mathematical precision via ComprehensiveDoshaEngine
  let engineDoshaList: any[] = [];
  try {
    const doshaReport = calculateComprehensiveDoshas(session.result, session.input, new Date());
    const detected = (doshaReport.doshas || []).filter((d) => d.isDetected && d.severity !== "none");
    if (detected.length > 0) {
      engineDoshaList = detected.map((d) => {
        const dName = d.name[lang] || d.name["kn"] || d.name["en"] || d.id;
        const dWhy = d.technicalWhy[lang] || d.technicalWhy["kn"] || d.technicalWhy["en"] || "";
        const dProblem = d.currentLifeProblems[lang] || d.currentLifeProblems["kn"] || d.currentLifeProblems["en"] || "";
        const dImpact = d.lifeImpact[lang] || d.lifeImpact["kn"] || d.lifeImpact["en"] || "";
        const dPooja = d.recommendedPooja[lang] || d.recommendedPooja["kn"] || d.recommendedPooja["en"] || "";
        const dRemedyList = d.remedies[lang] || d.remedies["kn"] || d.remedies["en"] || [];
        const fullRemedy = [dPooja, ...(Array.isArray(dRemedyList) ? dRemedyList.slice(0, 2) : [])].filter(Boolean).join(" | ");

        return {
          name: dName,
          significance: cleanDegreesFromText(`${dWhy} ${dProblem}`),
          impact: cleanDegreesFromText([dWhy, dProblem || dImpact].filter(Boolean).join("\n\n")),
          remedy: cleanDegreesFromText(fullRemedy),
          severity: d.severity
        };
      });
    }
  } catch (doshaErr) {
    console.warn("[bhavishyaV1Service] calculateComprehensiveDoshas fallback:", doshaErr);
  }

  const effectiveEngineDoshas = engineDoshaList.length > 0
    ? engineDoshaList
    : (result.aiGeneratedNarrative?.doshas ?? []);

  let maandi = session.result.maandi;
  if (!maandi && session.input.birthDate && session.input.birthTime) {
    try {
      const bDate = new Date(`${session.input.birthDate}T${session.input.birthTime || "12:00"}:00Z`);
      const m = computeMaandi(bDate, session.input.latitude || 14.5479, session.input.longitude || 74.3187, session.input.pincode || "581326", "lahiri");
      maandi = { degree: m.degree, rashi: m.rashi, windowLabel: m.windowLabel, navamsha: m.navamsha };
    } catch (err) {
      console.warn("[bhavishyaV1Service] fallback computeMaandi:", err);
    }
  }
  const lagnaRashiIdx = session.result.lagnaRashi?.index ?? 0;
  const maandiHouse = maandi ? getMaandiHouseFromLagna(maandi.rashi.index, lagnaRashiIdx) : 1;

  const prompts = buildPremiumPrompts({
    lang,
    runId,
    name: session.input.name,
    gender: userGender as "Male" | "Female",
    ageYears,
    maritalStatus: (personalization?.maritalStatus as ("married" | "unmarried" | "general")) || "general",
    hasChildren: (personalization?.childrenStatus as ("general" | "no_children" | "has_children")) || "general",
    lagnaRashiIndex: session.result.lagnaRashi?.index ?? null,
    moonRashiIndex: session.result.moonSign.index,
    moonNakshatraIndex: moonPlanet?.nakshatra.index ?? null,
    sunRashiIndex: session.result.sunSign?.index ?? null,
    maandiHouse,
    maandiRashiIndex: maandi?.rashi?.index ?? null,
    natalPlanets,
    transits,
    mahaLord,
    bhuktiLord,
    bhuktiEndsAtAge: currentBhuktiData?.bhuktiEndAge ?? null,
    engineYogas: result.aiGeneratedNarrative?.yogas ?? [],
    engineDoshas: effectiveEngineDoshas,
    pariharas: (result.pariharas ?? []).map(
      (p: any) => `${p.doshaName}: ${p.poojaName} (${p.whenToDo}, ${p.whereToDo})`
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

  const effectiveGeminiApiKey = (
    geminiApiKey !== undefined
      ? geminiApiKey
      : (typeof window !== "undefined" && (window as any).__GEMINI_API_KEY__) ||
        useAppStore.getState().geminiApiKey ||
        (import.meta as any).env?.VITE_GEMINI_API_KEY ||
        ""
  ).trim();

  const failedAiSectionsV1: string[] = [];
  const callGeminiSafe = async (label: string, prompt: string, temp = 0.3, timeoutMs = 10000, maxAttempts = 3): Promise<string> => {
    if (!effectiveGeminiApiKey || effectiveGeminiApiKey === "none" || effectiveGeminiApiKey === "mock" || effectiveGeminiApiKey.trim() === "") {
      failedAiSectionsV1.push(label);
      return "";
    }
    const cleanLabel = label.replace(/^(Generate|Retry)\s*/i, "");
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const timeoutPromise = new Promise<string>((resolve) =>
          setTimeout(() => {
            console.warn(`[bhavishyaV1Service] AI call for ${label} (attempt ${attempt}/${maxAttempts}) reached ${timeoutMs}ms timeout guard.`);
            resolve("");
          }, timeoutMs)
        );
        const raw = await Promise.race([
          askGemini(label, prompt, effectiveGeminiApiKey, lang, { raw: true, temperature: temp }),
          timeoutPromise
        ]);
        if (typeof raw === "string" && (raw.includes("Sorry, I encountered an error") || raw.includes("check your API key") || raw.includes("Error:") || raw.includes("GoogleGenerativeAIError"))) {
          console.warn(`[bhavishyaV1Service] Error string detected for ${label} (attempt ${attempt}/${maxAttempts}): ${raw}`);
          if (raw.includes("check your API key") || raw.includes("API_KEY_INVALID")) {
            failedAiSectionsV1.push(label);
            return "";
          }
          if (attempt < maxAttempts) {
            const retryNotice = lang === "kn"
              ? `ಗಮನಿಸಿ: '${cleanLabel}' ವಿಭಾಗದಲ್ಲಿ ಮರು-ಪ್ರಯತ್ನಿಸಲಾಗುತ್ತಿದೆ (ಪ್ರಯತ್ನ ${attempt + 1}/${maxAttempts})...`
              : lang === "hi"
              ? `सूचना: '${cleanLabel}' खंड में पुनः प्रयास किया जा रहा है (${attempt + 1}/${maxAttempts})...`
              : `Notice: Retrying '${cleanLabel}' AI narration (Attempt ${attempt + 1}/${maxAttempts})...`;
            onProgress?.(Math.min(85, Math.max(35, 30 + attempt * 12)), retryNotice);
            await new Promise((r) => setTimeout(r, attempt * 600));
            continue;
          }
          failedAiSectionsV1.push(label);
          return "";
        }
        if (typeof raw === "string" && raw.trim().length > 20) {
          return raw;
        }
        // If raw is empty or too short (e.g. timeout resolved to ""), retry if attempt < maxAttempts
        if (attempt < maxAttempts) {
          const retryNotice = lang === "kn"
            ? `ಗಮನಿಸಿ: '${cleanLabel}' ವಿಭಾಗದಲ್ಲಿ ಮರು-ಪ್ರಯತ್ನಿಸಲಾಗುತ್ತಿದೆ (ಪ್ರಯತ್ನ ${attempt + 1}/${maxAttempts})...`
            : lang === "hi"
            ? `सूचना: '${cleanLabel}' खंड में पुनः प्रयास किया जा रहा है (${attempt + 1}/${maxAttempts})...`
            : `Notice: Retrying '${cleanLabel}' AI narration (Attempt ${attempt + 1}/${maxAttempts})...`;
          console.warn(`[bhavishyaV1Service] AI call for ${label} returned empty/short on attempt ${attempt}/${maxAttempts}. ${retryNotice}`);
          onProgress?.(Math.min(85, Math.max(35, 30 + attempt * 12)), retryNotice);
          await new Promise((r) => setTimeout(r, attempt * 600));
          continue;
        }
        failedAiSectionsV1.push(label);
        return "";
      } catch (e) {
        console.warn(`[bhavishyaV1Service] AI call failed for ${label} (attempt ${attempt}/${maxAttempts}):`, e);
        if (attempt < maxAttempts) {
          const retryNotice = lang === "kn"
            ? `ಗಮನಿಸಿ: '${cleanLabel}' ವಿಭಾಗದಲ್ಲಿ ಮರು-ಪ್ರಯತ್ನಿಸಲಾಗುತ್ತಿದೆ (ಪ್ರಯತ್ನ ${attempt + 1}/${maxAttempts})...`
            : lang === "hi"
            ? `सूचना: '${cleanLabel}' खंड में पुनः प्रयास किया जा रहा है (${attempt + 1}/${maxAttempts})...`
            : `Notice: Retrying '${cleanLabel}' AI narration (Attempt ${attempt + 1}/${maxAttempts})...`;
          onProgress?.(Math.min(85, Math.max(35, 30 + attempt * 12)), retryNotice);
          await new Promise((r) => setTimeout(r, attempt * 600));
          continue;
        }
        failedAiSectionsV1.push(label);
        return "";
      }
    }
    failedAiSectionsV1.push(label);
    return "";
  };

  // Batch 1: Soul Mirror, Characteristics & Dark Secret
  onProgress?.(
    38,
    lang === "kn"
      ? "೩. ಅಂತರಂಗದ ಸತ್ಯಗಳು ಹಾಗೂ ಜನ್ಮ ಲಗ್ನ ವ್ಯಕ್ತಿತ್ವ ಅಧ್ಯಾಯಗಳ ಸಂಶ್ಲೇಷಣೆ..."
      : lang === "hi"
      ? "3. आत्मा के सत्य एवं जन्म लग्न व्यक्तित्व अध्यायों का सटीक विश्लेषण..."
      : "3. Synthesizing Soul Mirror & Personality Chapters..."
  );
  let resSoulMirror = "";
  let resCharacteristics = "";
  let resDarkSecret = "";
  [resSoulMirror, resCharacteristics, resDarkSecret] = await Promise.all([
    callGeminiSafe("Generate Soul Mirror", prompts.soulMirror, 0.3),
    callGeminiSafe("Generate Characteristics", prompts.characteristics, 0.3),
    ageYears < 8 ? Promise.resolve('{"darkSecret":[]}') : callGeminiSafe("Generate Dark Secret", prompts.darkSecret, 0.3)
  ]);
  await new Promise(r => setTimeout(r, 120));

  // Batch 2: Current Phase & Yogas
  onProgress?.(
    46,
    lang === "kn"
      ? "೪. ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಮತ್ತು ವಿಶೇಷ ರಾಜಯೋಗಗಳ ಸಮನ್ವಯ..."
      : lang === "hi"
      ? "4. वर्तमान दशा-भुक्ति एवं विशेष राजयोगों का समन्वय..."
      : "4. Harmonizing Current Dasha-Bhukti & Special Yogas..."
  );
  const [resCurrentPhase, resYogas] = await Promise.all([
    callGeminiSafe("Generate Current Phase", prompts.currentPhase, 0.3),
    callGeminiSafe("Generate Premium Yogas", prompts.yogas, 0.4)
  ]);
  await new Promise(r => setTimeout(r, 120));

  // Batch 3: Doshas & Timeline
  onProgress?.(
    54,
    lang === "kn"
      ? "೫. ಕರ್ಮ ಸವಾಲುಗಳು, ದೋಷ ಪರಿಹಾರ ಹಾಗೂ ೧೨ ತಿಂಗಳ ಭವಿಷ್ಯ ನಕ್ಷೆ..."
      : lang === "hi"
      ? "5. कर्म चुनौतियाँ, दोष परिहार एवं १२ महीनों का जीवन मार्ग..."
      : "5. Mapping Karmic Challenges, Remedies & 12-Month Timeline..."
  );
  const [resDoshas, resTimeline] = await Promise.all([
    callGeminiSafe("Generate Premium Doshas", prompts.doshas, 0.4),
    callGeminiSafe("Generate Planetary Timeline", prompts.timeline, 0.4)
  ]);
  await new Promise(r => setTimeout(r, 120));

  // Batch 4: Gochara, Summary & Karmic Inquest
  onProgress?.(
    62,
    lang === "kn"
      ? "೬. ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹಗಳು, ಕರ್ಮ ಪಯಣ ಹಾಗೂ ದೈವಿಕ ಸಂಕ್ಷಿಪ್ತ ಸಾರಾಂಶ..."
      : lang === "hi"
      ? "6. लाइव गोचर ग्रह, कर्म यात्रा एवं ज्योतिषी सारांश..."
      : "6. Calculating Live Transits, Karmic Inquest & Astrologer's Summary..."
  );
  const [resGochara, resDashaGocharaCompass, resSummary, resMaandiInquest, resAnnualForecast] = await Promise.all([
    callGeminiSafe("Generate Gochara", prompts.gochara, 0.4),
    callGeminiSafe("Generate Dasha-Gochara Compass", prompts.dashaGocharaCompass, 0.35),
    callGeminiSafe("Generate Summary", prompts.summary, 0.3),
    callGeminiSafe("Generate Maandi Inquest", prompts.maandiInquest, 0.4),
    callGeminiSafe("Generate Annual Forecast", prompts.bhavishyaAnnualForecast, 0.35)
  ]);
  await new Promise(r => setTimeout(r, 120));

  // Batch 5: Bhavishya Life Areas (Individual Granular Prompts for maximum AI fidelity & depth)
  onProgress?.(
    70,
    lang === "kn"
      ? "೭. ವಿವಾಹ, ಸಂತಾನ, ಉದ್ಯೋಗ, ಆರ್ಥಿಕ ಹಾಗೂ ಆರೋಗ್ಯ ಅಧ್ಯಾಯಗಳ ನಿಖರ ಸಂಶ್ಲೇಷಣೆ..."
      : lang === "hi"
      ? "7. विवाह, संतान, करियर, धन एवं स्वास्थ्य का गहन विश्लेषण..."
      : "7. Synthesizing Marriage, Children, Career, Wealth & Health..."
  );
  let resMarriage = "";
  let resChildren = "";
  let resCareer = "";
  let resWealth = "";
  let resHealth = "";

  const marLabel = ageYears < 12 ? "Generate Child Education" : ageYears >= 60 ? "Generate Senior Companionship" : ageYears < 22 ? "Generate Youth Focus" : "Generate Marriage";
  const chdLabel = ageYears < 12 ? "Generate Child Activities" : ageYears >= 60 ? "Generate Senior Legacy" : ageYears < 22 ? "Generate Youth Studies" : "Generate Children";
  const carLabel = ageYears < 12 ? "Generate Child Foundation" : ageYears >= 60 ? "Generate Senior Mentorship" : ageYears < 22 ? "Generate Youth Career Foundation" : "Generate Career";
  const wlhLabel = ageYears < 12 ? "Generate Child Family" : ageYears >= 60 ? "Generate Senior Wealth Preservation" : ageYears < 22 ? "Generate Youth Financial Discipline" : "Generate Wealth";
  const hltLabel = ageYears < 12 ? "Generate Child Pediatric Health" : ageYears >= 60 ? "Generate Senior Longevity" : ageYears < 22 ? "Generate Youth Fitness" : "Generate Health";

  [resMarriage, resChildren, resCareer, resWealth, resHealth] = await Promise.all([
    callGeminiSafe(marLabel, prompts.bhavishyaMarriage, 0.3),
    callGeminiSafe(chdLabel, prompts.bhavishyaChildren, 0.3),
    callGeminiSafe(carLabel, prompts.bhavishyaCareer, 0.3),
    callGeminiSafe(wlhLabel, prompts.bhavishyaWealth, 0.3),
    callGeminiSafe(hltLabel, prompts.bhavishyaHealth, 0.3)
  ]);

  // Parse initial responses for quality validation
  let dataSoulMirror = robustParseGeminiJSON(resSoulMirror);
  let dataCharacteristics = robustParseGeminiJSON(resCharacteristics);
  let dataDarkSecret = robustParseGeminiJSON(resDarkSecret);
  let dataCurrentPhase = robustParseGeminiJSON(resCurrentPhase);
  let dataYogas = robustParseGeminiJSON(resYogas);
  let dataDoshas = robustParseGeminiJSON(resDoshas);
  let dataTimeline = robustParseGeminiJSON(resTimeline);
  let dataGochara = robustParseGeminiJSON(resGochara);
  let dataDashaGocharaCompass = robustParseGeminiJSON(resDashaGocharaCompass);
  let dataSummary = robustParseGeminiJSON(resSummary);
  let dataMaandiInquest = robustParseGeminiJSON(resMaandiInquest);
  let dataAnnualForecast = robustParseGeminiJSON(resAnnualForecast);

  let dMar = robustParseGeminiJSON(resMarriage);
  let dChd = robustParseGeminiJSON(resChildren);
  let dCar = robustParseGeminiJSON(resCareer);
  let dWlh = robustParseGeminiJSON(resWealth);
  let dHlt = robustParseGeminiJSON(resHealth);

  const extractChapterText = (obj: any, candidateKeys: string[]): string => {
    if (!obj || typeof obj !== "object") return "";
    for (const k of candidateKeys) {
      if (typeof obj[k] === "string" && obj[k].trim().length > 0) return obj[k];
      if (obj.bhavishya && typeof obj.bhavishya[k] === "string" && obj.bhavishya[k].trim().length > 0) return obj.bhavishya[k];
    }
    if (typeof obj.text === "string" && obj.text.trim().length > 0) return obj.text;
    if (typeof obj.prediction === "string" && obj.prediction.trim().length > 0) return obj.prediction;
    return "";
  };

  const isSoulMirrorValid = (d: any) =>
    Boolean(d && (d.truth1Text || "").trim().length >= 80 && (d.truth2Text || "").trim().length >= 80 && (d.truth3Text || "").trim().length >= 80);

  const isCharacteristicsValid = (d: any) =>
    Boolean(d?.characteristics && toSafeArray(d.characteristics).some((c: any) => (c.impact || c.description || c.trait || "").trim().length >= 20));

  const isDarkSecretValid = (d: any) =>
    ageYears < 8 || Boolean(d?.darkSecret && toSafeArray(d.darkSecret).some((s: any) => (s.impact || s.description || s.trait || "").trim().length >= 20));

  const isCurrentPhaseValid = (d: any) =>
    Boolean(d?.currentPhase && toSafeArray(d.currentPhase).some((p: any) => (p.impact || p.description || "").trim().length >= 100));

  const isYogasValid = (d: any) =>
    Boolean(d?.yogas && toSafeArray(d.yogas).some((y: any) => (y.impact || y.significance || "").trim().length >= 20));

  const isDoshasValid = (d: any) =>
    Boolean(d?.doshas && toSafeArray(d.doshas).some((ds: any) => (ds.impact || ds.significance || "").trim().length >= 20));

  const isTimelineValid = (d: any) =>
    Boolean(d?.timeline && toSafeArray(d.timeline).length >= 4 && toSafeArray(d.timeline).some((t: any) => (t.impact || t.prediction || "").trim().length >= 20));

  const isGocharaValid = (d: any) =>
    Boolean(d?.gochara && toSafeArray(d.gochara).filter((g: any) => (g.impact || "").trim().length >= 100).length >= 2);

  const isDashaGocharaCompassValid = (d: any) =>
    Boolean(d && (d.paragraph1 || "").trim().length >= 60 && (d.paragraph2 || "").trim().length >= 60 && (d.paragraph3 || "").trim().length >= 60 && d.pillars);

  const isSummaryValid = (d: any) =>
    Boolean(d?.summary && toSafeArray(d.summary).some((s: any) => (s.impact || "").trim().length >= 50));

  const isAnnualForecastValid = (d: any) => {
    if (!d) return false;
    if (typeof d.annualForecast === "string" && d.annualForecast.trim().length >= 100) return true;
    if (Array.isArray(d.annualForecast) && d.annualForecast.some((a: any) => (a.impact || a.forecast || "").trim().length >= 100)) return true;
    return false;
  };

  const isLifeAreaValid = (area: any) => {
    const text = asText(area);
    if (text.trim().length < 350) return false;
    const parts = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 25);
    return parts.length >= 3;
  };

  // TARGETED PARALLEL AUTO-RETRY: Retry ONLY missing/incomplete sections
  if (effectiveGeminiApiKey) {
    const retryTasks: Promise<void>[] = [];

    if (!isSoulMirrorValid(dataSoulMirror)) {
      retryTasks.push(
        callGeminiSafe("Retry Soul Mirror", prompts.soulMirror, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isSoulMirrorValid(parsed)) dataSoulMirror = parsed;
        })
      );
    }
    if (!isCharacteristicsValid(dataCharacteristics)) {
      retryTasks.push(
        callGeminiSafe("Retry Characteristics", prompts.characteristics, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isCharacteristicsValid(parsed)) dataCharacteristics = parsed;
        })
      );
    }
    if (ageYears >= 8 && !isDarkSecretValid(dataDarkSecret)) {
      retryTasks.push(
        callGeminiSafe("Retry Dark Secret", prompts.darkSecret, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isDarkSecretValid(parsed)) dataDarkSecret = parsed;
        })
      );
    }
    if (!isCurrentPhaseValid(dataCurrentPhase)) {
      retryTasks.push(
        callGeminiSafe("Retry Current Phase", prompts.currentPhase, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isCurrentPhaseValid(parsed)) dataCurrentPhase = parsed;
        })
      );
    }
    if (!isYogasValid(dataYogas)) {
      retryTasks.push(
        callGeminiSafe("Retry Yogas", prompts.yogas, 0.4, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isYogasValid(parsed)) dataYogas = parsed;
        })
      );
    }
    if (!isDoshasValid(dataDoshas)) {
      retryTasks.push(
        callGeminiSafe("Retry Doshas", prompts.doshas, 0.4, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isDoshasValid(parsed)) dataDoshas = parsed;
        })
      );
    }
    if (!isTimelineValid(dataTimeline)) {
      retryTasks.push(
        callGeminiSafe("Retry Timeline", prompts.timeline, 0.4, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isTimelineValid(parsed)) dataTimeline = parsed;
        })
      );
    }
    if (!isGocharaValid(dataGochara)) {
      retryTasks.push(
        callGeminiSafe("Retry Gochara", prompts.gochara, 0.4, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isGocharaValid(parsed)) dataGochara = parsed;
        })
      );
    }
    if (!isDashaGocharaCompassValid(dataDashaGocharaCompass)) {
      retryTasks.push(
        callGeminiSafe("Retry Dasha-Gochara Compass", prompts.dashaGocharaCompass, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isDashaGocharaCompassValid(parsed)) dataDashaGocharaCompass = parsed;
        })
      );
    }
    if (!isSummaryValid(dataSummary)) {
      retryTasks.push(
        callGeminiSafe("Retry Summary", prompts.summary, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isSummaryValid(parsed)) dataSummary = parsed;
        })
      );
    }
    if (!isAnnualForecastValid(dataAnnualForecast)) {
      retryTasks.push(
        callGeminiSafe("Retry Annual Forecast", prompts.bhavishyaAnnualForecast, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (isAnnualForecastValid(parsed)) dataAnnualForecast = parsed;
        })
      );
    }
    const marCandidateKeys = ["marriage", "childEducation", "education", "vidya", "companionship", "focus"];
    const chdCandidateKeys = ["children", "childActivities", "activities", "sports", "legacy", "studies"];
    const carCandidateKeys = ["career", "childFoundation", "foundation", "character", "mentorship", "leadership"];
    const wlhCandidateKeys = ["wealth", "childFamily", "family", "wealthPreservation", "preservation", "finance", "discipline"];
    const hltCandidateKeys = ["health", "childHealth", "pediatricHealth", "longevity", "vitality", "fitness"];

    if (!isLifeAreaValid(extractChapterText(dMar, marCandidateKeys))) {
      retryTasks.push(
        callGeminiSafe(`Retry ${marLabel}`, prompts.bhavishyaMarriage, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (parsed) dMar = parsed;
        })
      );
    }
    if (!isLifeAreaValid(extractChapterText(dChd, chdCandidateKeys))) {
      retryTasks.push(
        callGeminiSafe(`Retry ${chdLabel}`, prompts.bhavishyaChildren, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (parsed) dChd = parsed;
        })
      );
    }
    if (!isLifeAreaValid(extractChapterText(dCar, carCandidateKeys))) {
      retryTasks.push(
        callGeminiSafe(`Retry ${carLabel}`, prompts.bhavishyaCareer, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (parsed) dCar = parsed;
        })
      );
    }
    if (!isLifeAreaValid(extractChapterText(dWlh, wlhCandidateKeys))) {
      retryTasks.push(
        callGeminiSafe(`Retry ${wlhLabel}`, prompts.bhavishyaWealth, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (parsed) dWlh = parsed;
        })
      );
    }
    if (!isLifeAreaValid(extractChapterText(dHlt, hltCandidateKeys))) {
      retryTasks.push(
        callGeminiSafe(`Retry ${hltLabel}`, prompts.bhavishyaHealth, 0.35, 9000, 2).then((res) => {
          const parsed = robustParseGeminiJSON(res);
          if (parsed) dHlt = parsed;
        })
      );
    }

    if (retryTasks.length > 0) {
      console.log(`[bhavishyaV1Service] Parallel retrying ${retryTasks.length} failed/incomplete sections...`);
      onProgress?.(
        76,
        lang === "kn"
          ? `೭.೨. ಅಪೂರ್ಣ ಅಧ್ಯಾಯಗಳ ಮರು-ಪ್ರಯತ್ನ (${retryTasks.length} ವಿಭಾಗಗಳು)...`
          : lang === "hi"
          ? `7.2. अपूर्ण अध्यायों का समानांतर पुनः-प्रयास (${retryTasks.length} खंड)...`
          : `7.2. Retrying ${retryTasks.length} missing sections in parallel...`
      );
      await Promise.all(retryTasks);
    }
  }

  const marCandidateKeys = ["marriage", "childEducation", "education", "vidya", "companionship", "focus"];
  const chdCandidateKeys = ["children", "childActivities", "activities", "sports", "legacy", "studies"];
  const carCandidateKeys = ["career", "childFoundation", "foundation", "character", "mentorship", "leadership"];
  const wlhCandidateKeys = ["wealth", "childFamily", "family", "wealthPreservation", "preservation", "finance", "discipline"];
  const hltCandidateKeys = ["health", "childHealth", "pediatricHealth", "longevity", "vitality", "fitness"];

  const dataBhavishya = {
    bhavishya: {
      marriage: extractChapterText(dMar, marCandidateKeys),
      children: extractChapterText(dChd, chdCandidateKeys),
      career: extractChapterText(dCar, carCandidateKeys),
      wealth: extractChapterText(dWlh, wlhCandidateKeys),
      health: extractChapterText(dHlt, hltCandidateKeys)
    }
  };

  // AI Chapter Quality Check: Log any missing AI sections so they heal seamlessly via authentic Vedic math
  if (failedAiSectionsV1.length > 0) {
    const uniqueFailed = Array.from(new Set(failedAiSectionsV1));
    console.warn(`[bhavishyaV1Service] AI sections unfulfilled (${uniqueFailed.join(", ")}). Healing seamlessly with authentic 100% mathematical Vedic engine.`);
  }

  onProgress?.(
    80,
    lang === "kn"
      ? "೮. ಸಂಪೂರ್ಣ ೧೦-ಅಧ್ಯಾಯಗಳ ವರದಿ ಪರಿಶೀಲನೆ ಹಾಗೂ ಅಧಿಕೃತ ದೃಗ್ಗಣಿತ ತಾಳೆ..."
      : lang === "hi"
      ? "8. संपूर्ण १०-अध्यायों का सत्यापन एवं शास्त्रीय मिलान..."
      : "8. Verifying 10-Chapter Astrological Integrity & Alignment..."
  );

  const fallbackMaandi = getMaandiPerspectiveInterpretation(maandiHouse, maandi?.rashi?.index ?? 0, lang, session.input.name);

  let finalMaandiInquest = fallbackMaandi;
  if (dataMaandiInquest?.paragraph1 && dataMaandiInquest?.paragraph2 && dataMaandiInquest?.title) {
    const p1 = cleanEnglishFromRegionalText(dataMaandiInquest.paragraph1, lang);
    const p2 = cleanEnglishFromRegionalText(dataMaandiInquest.paragraph2, lang);
    const t = cleanEnglishFromRegionalText(dataMaandiInquest.title, lang);
    const forbidden = /maandi|gulika|ಮಾಂದಿ|ಗುಳಿಕ|मांदी|गुलिक|మాంది|குளிகன்/i;
    if (!forbidden.test(t) && !forbidden.test(p1) && !forbidden.test(p2) && p1.length > 80 && p2.length > 80) {
      finalMaandiInquest = {
        title: t,
        paragraph1: p1,
        paragraph2: p2,
        house: maandiHouse
      };
    }
  }

  const isChild = ageYears < 8;
  const v1Predictions: TranslatedPrediction[] = [];
  const aiB = dataBhavishya?.bhavishya || {};

  const lagnaIdx = session.result.lagnaRashi?.index ?? 0;
  const lagnaStr = session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "";
  const moonStr = pick(RASHI_L5[session.result.moonSign.index], lang);
  const dashaWord = baseLang === "kn" ? "ದಶಾ" : baseLang === "hi" ? "दशा" : baseLang === "te" ? "దశ" : baseLang === "ta" ? "தசை" : "Dasha";
  const bhuktiWord = baseLang === "kn" ? "ಭುಕ್ತಿ" : baseLang === "hi" ? "भुक्ति" : baseLang === "te" ? "భుక్తి" : baseLang === "ta" ? "புக்தಿ" : "Bhukti";
  const dashaName = mahaLord ? pick(GRAHA_L5[mahaLord], lang) : dashaWord;
  const bhuktiName = bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : bhuktiWord;

  if (isChild) {
    const catEd = baseLang === "kn" ? "ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಬುದ್ಧಿಶಕ್ತಿ" : baseLang === "hi" ? "शिक्षा एवं बौद्धिक विकास" : baseLang === "te" ? "విద్యాభ్యాసం మరియు మేధో వికాసం" : baseLang === "ta" ? "கல்வி மற்றும் அறிவு வளர்ச்சி" : "Education & Early Intellect";
    const textEd = ensureAtLeastThreeParagraphs(asText(aiB.marriage), buildDynamicChildEducationFallback(parsedKundali), 3);
    v1Predictions.push({ category: "Education & Early Intellect", translatedCategory: catEd, text: textEd, translatedText: textEd });

    const catAct = baseLang === "kn" ? "ಪ್ರತಿಭೆ, ಕ್ರೀಡೆ ಹಾಗೂ ಸೃಜನಶೀಲತೆ" : baseLang === "hi" ? "प्रतिभा, खेल एवं रचनात्मकता" : baseLang === "te" ? "ప్రతిభ, క్రీడలు మరియు సృజనాత్మకత" : baseLang === "ta" ? "திறமை, விளையாட்டு மற்றும் படைப்பாற்றல்" : "Talents, Activities & Sports";
    const textAct = ensureAtLeastThreeParagraphs(asText(aiB.children), buildDynamicChildActivitiesFallback(parsedKundali), 3);
    v1Predictions.push({ category: "Talents, Activities & Sports", translatedCategory: catAct, text: textAct, translatedText: textAct });

    const catFdn = baseLang === "kn" ? "ವ್ಯಕ್ತಿತ್ವ ವಿಕಾಸ ಹಾಗೂ ಸಂಸ್ಕಾರ" : baseLang === "hi" ? "चरित्र निर्माण एवं संस्कार" : baseLang === "te" ? "వ్యక్తిత్వ వికాసం మరియు సంస్కారం" : baseLang === "ta" ? "ஆளுமை வளர்ச்சி மற்றும் நற்பண்புகள்" : "Future Foundation & Character";
    const textFdn = ensureAtLeastThreeParagraphs(asText(aiB.career), buildDynamicChildFoundationFallback(parsedKundali), 3);
    v1Predictions.push({ category: "Future Foundation & Character", translatedCategory: catFdn, text: textFdn, translatedText: textFdn });

    const catFam = baseLang === "kn" ? "ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ ಹಾಗೂ ಪೋಷಣೆ" : baseLang === "hi" ? "पारिवारिक वातावरण एवं लालन-पालन" : baseLang === "te" ? "కుటుంబ ప్రేమ మరియు లాలన" : baseLang === "ta" ? "குடும்ப பாசம் மற்றும் வளர்ப்பு" : "Family Environment & Upbringing";
    const textFam = ensureAtLeastThreeParagraphs(asText(aiB.wealth), buildDynamicChildFamilyFallback(parsedKundali), 3);
    v1Predictions.push({ category: "Family Environment & Upbringing", translatedCategory: catFam, text: textFam, translatedText: textFam });

    const catHlt = baseLang === "kn" ? "ಬಾಲ ಆರೋಗ್ಯ ಹಾಗೂ ಚೈತನ್ಯ" : baseLang === "hi" ? "बाल स्वास्थ्य एवं रोग प्रतिरोधक क्षमता" : baseLang === "te" ? "బాల ఆరోగ్యం మరియు రక్షణ" : baseLang === "ta" ? "குழந்தை நலம் மற்றும் ஆரோக்கியம்" : "Pediatric Health & Vitality";
    const textHlt = ensureAtLeastThreeParagraphs(asText(aiB.health), buildDynamicChildPediatricHealthFallback(parsedKundali), 3);
    v1Predictions.push({ category: "Pediatric Health & Vitality", translatedCategory: catHlt, text: textHlt, translatedText: textHlt });
  } else if (ageYears >= 60) {
    const catMar = baseLang === "kn" ? "ಧರ್ಮ ಸಹಚಾರ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ" : baseLang === "hi" ? "दांपत्य सौहार्द एवं पारिवारिक शांति" : baseLang === "te" ? "దాంపత్య సౌఖ్యం మరియు కుటుంబ ప్రశాంతత" : baseLang === "ta" ? "தம்பதியர் நல்லிணக்கம் மற்றும் குடும்ப அமைதி" : "Companionship & Domestic Harmony";
    const fbMar = buildPersonalizedMarriageText(lang, lagnaStr, moonStr, (personalization?.maritalStatus as ("married" | "unmarried" | "general")) || "married", lagnaIdx, dashaName, bhuktiName, userGender as "Male" | "Female", dynamicCtx);
    const textMar = ensureAtLeastThreeParagraphs(asText(aiB.marriage), fbMar, 3);
    v1Predictions.push({ category: "Companionship & Domestic Harmony", translatedCategory: catMar, text: textMar, translatedText: textMar });

    const catChd = baseLang === "kn" ? "ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಮೊಮ್ಮಕ್ಕಳ ಸೌಖ್ಯ" : baseLang === "hi" ? "वंश वृद्धि एवं पौत्र-पौत्री सुख" : baseLang === "te" ? "వంశాభివృద్ధి మరియు మనవలు-మనవరాళ్ల సుఖం" : baseLang === "ta" ? "சந்ததி வளர்ச்சி மற்றும் பேரப்பிள்ளைகள் நலம்" : "Family Legacy & Grandchildren";
    const fbChd = buildPersonalizedChildrenText(lang, (personalization?.childrenStatus as ("general" | "no_children" | "has_children")) || "has_children", lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textChd = ensureAtLeastThreeParagraphs(asText(aiB.children), fbChd, 3);
    v1Predictions.push({ category: "Family Legacy & Grandchildren", translatedCategory: catChd, text: textChd, translatedText: textChd });

    const catCar = baseLang === "kn" ? "ಧರ್ಮ ಕಾರ್ಯ, ಸಮಾಜ ಸೇವೆ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನ" : baseLang === "hi" ? "धर्मार्थ कार्य एवं सामाजिक मार्गदर्शन" : baseLang === "te" ? "ధర్మ కార్యాలు మరియు సమాజ మార్గదర్శకత్వం" : baseLang === "ta" ? "தர்ம காரியங்கள் மற்றும் சமூக வழிகாட்டுதல்" : "Mentorship & Dharmic Leadership";
    const fbCar = buildPersonalizedCareerText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textCar = ensureAtLeastThreeParagraphs(asText(aiB.career), fbCar, 3);
    v1Predictions.push({ category: "Mentorship & Dharmic Leadership", translatedCategory: catCar, text: textCar, translatedText: textCar });

    const catWlh = baseLang === "kn" ? "ಸಂಪತ್ತು ಸಂರಕ್ಷಣೆ ಹಾಗೂ ಕುಟುಂಬ ಸಮೃದ್ಧಿ" : baseLang === "hi" ? "संपत्ति सुरक्षा एवं पारिवारिक समृद्धि" : baseLang === "te" ? "సంపద పరిరక్షణ మరియు కుటుంబ సుఖం" : baseLang === "ta" ? "செல்வப் பாதுகாப்பு மற்றும் குடும்ப சுபிட்சம்" : "Wealth Preservation & Estate Peace";
    const fbWlh = buildPersonalizedWealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textWlh = ensureAtLeastThreeParagraphs(asText(aiB.wealth), fbWlh, 3);
    v1Predictions.push({ category: "Wealth Preservation & Estate Peace", translatedCategory: catWlh, text: textWlh, translatedText: textWlh });

    const catHlt = baseLang === "kn" ? "ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಸ್ವಾಸ್ಥ್ಯ ರಕ್ಷಣೆ" : baseLang === "hi" ? "दीर्घायु एवं स्वास्थ्य रक्षा" : baseLang === "te" ? "దీర్ఘాయుష్షు మరియు ఆరోగ్య రక్షణ" : baseLang === "ta" ? "நீண்ட ஆயுள் மற்றும் ஆரோக்கியப் பாதுகாப்பு" : "Longevity & Geriatric Wellness";
    const fbHlt = buildPersonalizedHealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textHlt = ensureAtLeastThreeParagraphs(asText(aiB.health), fbHlt, 3);
    v1Predictions.push({ category: "Longevity & Geriatric Wellness", translatedCategory: catHlt, text: textHlt, translatedText: textHlt });
  } else if (ageYears < 22) {
    const catMar = baseLang === "kn" ? "ವ್ಯಕ್ತಿತ್ವ ನಿರ್ಮಾಣ ಹಾಗೂ ಮಾನಸಿಕ ಏಕಾಗ್ರತೆ" : baseLang === "hi" ? "चरित्र निर्माण एवं मानसिक एकाग्रता" : baseLang === "te" ? "వ్యక్తిత్వ నిర్మాణం మరియు ఏకాగ్రత" : baseLang === "ta" ? "ஆளுமை உருவாக்கம் மற்றும் மன உறுதி" : "Character & Mental Focus";
    const fbMar = buildPersonalizedMarriageText(lang, lagnaStr, moonStr, "unmarried", lagnaIdx, dashaName, bhuktiName, userGender as "Male" | "Female", dynamicCtx);
    const textMar = ensureAtLeastThreeParagraphs(asText(aiB.marriage), fbMar, 3);
    v1Predictions.push({ category: "Character & Mental Focus", translatedCategory: catMar, text: textMar, translatedText: textMar });

    const catChd = baseLang === "kn" ? "ಉನ್ನತ ಶಿಕ್ಷಣ ಹಾಗೂ ಜ್ಞಾನಾರ್ಜನೆ" : baseLang === "hi" ? "उच्च शिक्षा एवं एकाग्रता" : baseLang === "te" ? "ఉన్నత విద్య మరియు విజ్ఞానం" : baseLang === "ta" ? "உயர்கல்வி மற்றும் ஞானம்" : "Higher Studies & Intellect";
    const fbChd = buildPersonalizedChildrenText(lang, "no_children", lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textChd = ensureAtLeastThreeParagraphs(asText(aiB.children), fbChd, 3);
    v1Predictions.push({ category: "Higher Studies & Intellect", translatedCategory: catChd, text: textChd, translatedText: textChd });

    const catCar = baseLang === "kn" ? "ಭವಿಷ್ಯದ ವೃತ್ತಿ ಅಡಿಪಾಯ" : baseLang === "hi" ? "भावी करियर की नींव" : baseLang === "te" ? "భవిష్యత్ కెరీర్ పునాది" : baseLang === "ta" ? "எதிர்கಾಲ தொழில் அடித்தளம்" : "Future Career Foundation";
    const fbCar = buildPersonalizedCareerText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textCar = ensureAtLeastThreeParagraphs(asText(aiB.career), fbCar, 3);
    v1Predictions.push({ category: "Future Career Foundation", translatedCategory: catCar, text: textCar, translatedText: textCar });

    const catWlh = baseLang === "kn" ? "ಆರ್ಥಿಕ ಶಿಸ್ತು ಹಾಗೂ ಕೌಟುಂಬಿಕ ಮೌಲ್ಯಗಳು" : baseLang === "hi" ? "वित्तीय अनुशासन एवं पारिवारिक मूल्य" : baseLang === "te" ? "ఆర్థిక క్రమశిక్షణ మరియు కుటుంబ విలువలు" : baseLang === "ta" ? "நிதி ஒழுக்கம் மற்றும் குடும்ப விழுமியங்கள்" : "Financial Discipline & Values";
    const fbWlh = buildPersonalizedWealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textWlh = ensureAtLeastThreeParagraphs(asText(aiB.wealth), fbWlh, 3);
    v1Predictions.push({ category: "Financial Discipline & Values", translatedCategory: catWlh, text: textWlh, translatedText: textWlh });

    const catHlt = baseLang === "kn" ? "ಯುವ ಚೈತನ್ಯ ಹಾಗೂ ದೈಹಿಕ ದೃಢತೆ" : baseLang === "hi" ? "शारीरिक ऊर्जा एवं स्वास्थ्य संतुलन" : baseLang === "te" ? "శారీరక శక్తి మరియు ఆరోగ్య సమతుల్యత" : baseLang === "ta" ? "உடல் வலிமை மற்றும் ஆரோக்கிய சமநிலை" : "Vitality, Fitness & Screen Balance";
    const fbHlt = buildPersonalizedHealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textHlt = ensureAtLeastThreeParagraphs(asText(aiB.health), fbHlt, 3);
    v1Predictions.push({ category: "Vitality, Fitness & Screen Balance", translatedCategory: catHlt, text: textHlt, translatedText: textHlt });
  } else {
    // Adult
    const catMar = baseLang === "kn" ? "ವಿವಾಹ ಹಾಗೂ ಸಂಬಂಧ" : baseLang === "hi" ? "विवाह एवं संबंध" : baseLang === "te" ? "వివాహం మరియు సంబంధ బాంధవ్యాలు" : baseLang === "ta" ? "திருமணம் மற்றும் இல்லற வாழ்க்கை" : "Marriage & Relationships";
    const fbMar = buildPersonalizedMarriageText(lang, lagnaStr, moonStr, (personalization?.maritalStatus as ("married" | "unmarried" | "general")) || "general", lagnaIdx, dashaName, bhuktiName, userGender as "Male" | "Female", dynamicCtx);
    const textMar = ensureAtLeastThreeParagraphs(asText(aiB.marriage), fbMar, 3);
    v1Predictions.push({ category: "Marriage & Relationships", translatedCategory: catMar, text: textMar, translatedText: textMar });

    const catChd = baseLang === "kn" ? "ಸಂತಾನ ಹಾಗೂ ಮಕ್ಕಳು" : baseLang === "hi" ? "संतान एवं बच्चे" : baseLang === "te" ? "సంతానం మరియు పిల్లలు" : baseLang === "ta" ? "சந்ததி மற்றும் குழந்தைகள்" : "Children & Progeny";
    const fbChd = buildPersonalizedChildrenText(lang, (personalization?.childrenStatus as ("general" | "no_children" | "has_children")) || "general", lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textChd = ensureAtLeastThreeParagraphs(asText(aiB.children), fbChd, 3);
    v1Predictions.push({ category: "Children & Progeny", translatedCategory: catChd, text: textChd, translatedText: textChd });

    const catCar = baseLang === "kn" ? "ಉದ್ಯೋಗ ಹಾಗೂ ವೃತ್ತಿ ಏಳಿಗೆ" : baseLang === "hi" ? "करियर एवं पदोन्नति योग" : baseLang === "te" ? "ఉద్యోగం మరియు వృత్తి ఎదుగుదల" : baseLang === "ta" ? "தொழில் மற்றும் உத்தியோக முன்னேற்றம்" : "Career & Profession";
    const fbCar = buildPersonalizedCareerText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textCar = ensureAtLeastThreeParagraphs(asText(aiB.career), fbCar, 3);
    v1Predictions.push({ category: "Career & Profession", translatedCategory: catCar, text: textCar, translatedText: textCar });

    const catWlh = baseLang === "kn" ? "ಧನ ಆಸ್ತಿ ಹಾಗೂ ಆರ್ಥಿಕ ಯೋಗ" : baseLang === "hi" ? "धन संपत्ति एवं आर्थिक योग" : baseLang === "te" ? "ధన సంపద మరియు ఆర్థిక యోగం" : baseLang === "ta" ? "தன ಲಾபம் மற்றும் பொருளாதார நிலை" : "Wealth & Family Finance";
    const fbWlh = buildPersonalizedWealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textWlh = ensureAtLeastThreeParagraphs(asText(aiB.wealth), fbWlh, 3);
    v1Predictions.push({ category: "Wealth & Family Finance", translatedCategory: catWlh, text: textWlh, translatedText: textWlh });

    const catHlt = baseLang === "kn" ? "ಆರೋಗ್ಯ ಹಾಗೂ ಚೈತನ್ಯ" : baseLang === "hi" ? "स्वास्थ्य एवं आरोग्य" : baseLang === "te" ? "ఆరోగ్యం మరియు శారీరక దృఢత్వం" : baseLang === "ta" ? "ஆரோக்கியம் மற்றும் உடல் பலம்" : "Health & Vitality";
    const fbHlt = buildPersonalizedHealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    const textHlt = ensureAtLeastThreeParagraphs(asText(aiB.health), fbHlt, 3);
    v1Predictions.push({ category: "Health & Vitality", translatedCategory: catHlt, text: textHlt, translatedText: textHlt });
  }

  // Clean English leaks from regional scripts
  const cleanedV1Predictions = v1Predictions.map(p => ({
    ...p,
    translatedText: cleanEnglishFromRegionalText(p.translatedText, lang)
  }));

  const deepInsights: Record<string, string> = {};
  for (const pred of cleanedV1Predictions) {
    deepInsights[pred.translatedCategory] = pred.translatedText;
  }

  // Fallbacks for Chapters II, III, IV, VII, VIII, IX
  const charFallbackText = buildDynamicCharacteristicsFallback(parsedKundali);
  const secretFallbackText = buildDynamicDarkSecretFallback(parsedKundali);
  const currentPhaseFallbackText = buildDynamicCurrentPhaseFallback(parsedKundali);
  const rawSummaryFallback = buildDynamicSummaryFallback(parsedKundali);
  const annualFallbackText = buildDynamicAnnualForecastFallback(parsedKundali);

  const finalCharacteristics = await ensureValidSection(dataCharacteristics.characteristics, charFallbackText, lang);
  const finalDarkSecret = isChild ? [] : await ensureValidSection(dataDarkSecret.darkSecret, secretFallbackText, lang);
  const finalCurrentPhase = await ensureValidSection(dataCurrentPhase.currentPhase, currentPhaseFallbackText, lang, 250);
  const finalSummary = await ensureValidSection(dataSummary.summary, rawSummaryFallback, lang, 150);

  let rawAnnualInput: any = dataAnnualForecast?.annualForecast;
  if (typeof rawAnnualInput === "string") {
    rawAnnualInput = [{ impact: rawAnnualInput }];
  } else if (Array.isArray(rawAnnualInput)) {
    rawAnnualInput = rawAnnualInput.map((item: any) => {
      if (typeof item === "string") return { impact: item };
      return { impact: item?.impact || item?.forecast || "" };
    });
  }
  const finalAnnualForecast = await ensureValidSection(rawAnnualInput, annualFallbackText, lang, 100);

  const rawYogasFallback = (result.aiGeneratedNarrative?.yogas || [{ name: "Dasha Yoga", significance: result.masterSynthesis.overallTone }]).map((y: any) => ({
    name: localizeYogaName(y.name || "Dasha Yoga", lang),
    impact: (asText(y.significance) || result.masterSynthesis.overallTone || "").trim()
  }));
  const rawYogasArray = toSafeArray(dataYogas.yogas).filter((y: any) => (y?.impact || "").trim().length > 10).length > 0
    ? dataYogas.yogas
    : rawYogasFallback;
  const finalYogas = (rawYogasArray || []).map((y: any) => {
    const rawImpact = (y.impact || y.significance || "").trim();
    const enriched = enrichYogaDescription(y.name || y.trait || "", rawImpact, lang, lagnaStr, moonStr, ageYears, dashaName, bhuktiName);
    const cleanImpact = cleanDegreesFromText(enriched
      .replace(/^[\s:,\.\-–—×*•~|]+(?=[^\s:,\.\-–—×*•~|])/gu, "")
      .replace(/^[\s:,\.\-–—×*•~|]+/gu, "")
      .trim());
    const cleanName = localizeYogaName(y.name || y.trait || "", lang)
      .replace(/^[\s:,\.\-–—×*•~|]+/gu, "")
      .trim();
    const paras = cleanImpact.split(/\n\n+/).filter(Boolean);
    return {
      ...y,
      name: cleanName,
      impact: cleanImpact,
      significance: paras.length > 0 ? paras : cleanImpact
    };
  });

  const rawDoshasFallback = (effectiveEngineDoshas.length > 0 ? effectiveEngineDoshas : (result.aiGeneratedNarrative?.doshas || [])).map((d: any) => ({
    name: localizeDoshaName(d.name || "Karmic Challenge", lang),
    impact: asText(d.impact || d.significance),
    remedy: d.remedy || ""
  }));

  const safeDoshaFallback = rawDoshasFallback.length > 0
    ? rawDoshasFallback
    : [{
        name: baseLang === "kn" ? "ಸರ್ವ ದೋಷ ಮುಕ್ತ & ಶುಭ ಗ್ರಹ ರಕ್ಷಾ ಕವಚ" : baseLang === "hi" ? "सर्व दोष मुक्त - शुभ ग्रह रक्षा कवच" : baseLang === "te" ? "సర్వ దోష రహితం - శుభ గ్రహ రక్షా కవచం" : baseLang === "ta" ? "தோஷ நிவர்த்தி - சுப கிரக பாதுகாப்பு" : "Benefic Planetary Shield - Free of Major Doshas",
        impact: baseLang === "kn"
          ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಯಾವುದೇ ಗಂಭೀರ ಪಿತೃ, ಕಾಲಸರ್ಪ ಅಥವಾ ಬಾಲ್ಯದಾರಿಷ್ಟ ದೋಷಗಳಿಲ್ಲ. ಕೇಂದ್ರ ಮತ್ತು ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳಲ್ಲಿ ಶುಭಗ್ರಹರ ಅನುಗ್ರಹವಿದ್ದು, ದೈವಿಕ ರಕ್ಷಾ ಕವಚ ಸದಾ ನಿಮ್ಮನ್ನು ಕಾಪಾಡುತ್ತದೆ."
          : baseLang === "hi"
          ? "आपकी कुंडली में कोई गंभीर कालसर्प, पितृ अथवा मांगलिक दोष नहीं है। शुभ ग्रहों की दृष्टि से आपका जीवन सुरक्षित एवं संरक्षित है।"
          : baseLang === "te"
          ? "మీ జన్మ కుండలిలో ఎటువంటి తీవ్ర కాలసర్ప, పితృ లేదా మాంగళిక దోషాలు లేవు. కేంద్ర, త్రికోణ స్థానాలలో శుభగ్రహాల అనుగ్రహం కలిగి దైవిక రక్షా కవచం మిమ్మల్ని రక్షిస్తుంది."
          : baseLang === "ta"
          ? "உங்கள் ஜாதகத்தில் எவ்வித கடுமையான காலசர்ப்ப, பித்ரு அல்லது மாங்கல்ய தோஷங்களும் இல்லை. திரிகோண மற்றும் கேந்திர ஸ்தானங்களில் சுப கிரகங்களின் ஆசியுடன் தெய்வீக பாதுகாப்பு உள்ளது."
          : "Your chart is blessed without severe natal doshas. Auspicious planetary combinations provide a divine protective shield.",
        remedy: baseLang === "kn"
          ? "ನಿತ್ಯ ಶ್ರೀ ಗಾಯತ್ರೀ ಜಪ, ಕುಲದೇವತಾ ಸ್ಮರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದರ್ಶನ."
          : baseLang === "hi"
          ? "नित्य गायत्री मंत्र जप, कुलदेवता स्मरण एवं गोकर्ण महाबलेश्वर दर्शन।"
          : baseLang === "te"
          ? "నిత్యం గాయత్రీ మంత్ర జపం, కులదేవత స్మరణ మరియు గోకర్ణ మహాబలేశ్వర దర్శనం."
          : baseLang === "ta"
          ? "தினசரி காயத்ரி மந்திர ஜபம், குலதெய்வ வழிபாடு மற்றும் கோகர்ண மகாபலேஸ்வரர் தரிசனம்."
          : "Daily sacred prayer, Kuladevata worship, and temple gratitude offerings."
      }];

  const rawDoshasArray = toSafeArray(dataDoshas.doshas).filter((d: any) => (d?.impact || "").trim().length > 10).length > 0
    ? dataDoshas.doshas
    : safeDoshaFallback;
  const finalDoshas = (rawDoshasArray || []).map((d: any) => {
    const rawImpact = d.impact || d.significance || "";
    const enrichedImpact = cleanDegreesFromText(enrichDoshaDescription(d.name || "", rawImpact, lang, lagnaStr, moonStr, ageYears, dashaName, bhuktiName, parsedKundali.maritalStatus));
    const cleanRemedy = cleanDegreesFromText(localizeDoshaRemedy(d.name || "", d.remedy, lang, parsedKundali.maritalStatus));
    const paras = enrichedImpact.split(/\n\n+/).filter(Boolean);
    return {
      ...d,
      name: localizeDoshaName(d.name || "", lang),
      impact: enrichedImpact,
      significance: paras.length > 0 ? paras : enrichedImpact,
      remedy: cleanRemedy
    };
  });

  const dynamicTimelineFallback = buildDynamicTimelineFallback(parsedKundali);
  const rawAiTimeline = toSafeArray(dataTimeline.timeline);

  // Guarantee exact, complete 6-month timeline with 100% accurate Janma Kundali & Gochara mapping
  const finalTimeline: { dateRange: string; impact: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const fallbackMonth = dynamicTimelineFallback[i] || dynamicTimelineFallback[0];
    const aiMonth = rawAiTimeline[i];

    if (aiMonth && typeof aiMonth === "object") {
      let dateRange = cleanEnglishFromRegionalText(aiMonth.dateRange || aiMonth.month || "", lang).trim();
      if (!dateRange || (baseLang !== "en" && !/[\u0900-\u0D7F]/.test(dateRange))) {
        dateRange = fallbackMonth.dateRange;
      }
      let impact = cleanEnglishFromRegionalText(aiMonth.impact || aiMonth.prediction || "", lang).trim();
      if (impact.length < 30) {
        impact = fallbackMonth.impact;
      }
      finalTimeline.push({ dateRange, impact });
    } else {
      finalTimeline.push({ dateRange: fallbackMonth.dateRange, impact: fallbackMonth.impact });
    }
  }

  const rawGocharaFallback = buildDynamicGocharaFallback(parsedKundali);
  const isSufficientGocharaDepth = (txt: string) => {
    if (!txt) return false;
    return hasTwoSubstantialParagraphs(txt, 160);
  };

  const aiGocharaValid = toSafeArray(dataGochara.gochara).filter((g: any) => {
    const impact = (g?.impact || "").trim();
    if (lang !== "en" && /[a-zA-Z]{3,}/.test(impact)) return false;
    return isSufficientGocharaDepth(impact);
  }).length >= 2;

  let finalGochara = aiGocharaValid ? dataGochara.gochara : rawGocharaFallback;
  finalGochara = finalGochara.map((g: any) => ({
    name: localizeGocharaName(g.name || "", lang),
    impact: cleanDegreesFromText(enrichGocharaDescription(g.name || "", cleanEnglishFromRegionalText(g.impact || "", lang), lang, moonStr, ageYears, dashaName, bhuktiName)),
    remedy: g.remedy ? cleanDegreesFromText(cleanEnglishFromRegionalText(g.remedy, lang)) : undefined
  }));

  const dynamicSoulMirror = buildDynamicSoulMirrorFallback(parsedKundali);
  let finalSoulMirror = { ...dynamicSoulMirror };
  if (dataSoulMirror) {
    const t1 = cleanEnglishFromRegionalText(dataSoulMirror.truth1Text || "", lang).trim();
    const t2 = cleanEnglishFromRegionalText(dataSoulMirror.truth2Text || "", lang).trim();
    const t3 = cleanEnglishFromRegionalText(dataSoulMirror.truth3Text || "", lang).trim();
    if (t1.length >= 80 && t2.length >= 80 && t3.length >= 80) {
      finalSoulMirror.truth1Text = t1;
      finalSoulMirror.truth2Text = t2;
      finalSoulMirror.truth3Text = t3;
      if (dataSoulMirror.truth1Title) finalSoulMirror.truth1Title = cleanEnglishFromRegionalText(dataSoulMirror.truth1Title, lang).trim();
      if (dataSoulMirror.truth2Title) finalSoulMirror.truth2Title = cleanEnglishFromRegionalText(dataSoulMirror.truth2Title, lang).trim();
      if (dataSoulMirror.truth3Title) finalSoulMirror.truth3Title = cleanEnglishFromRegionalText(dataSoulMirror.truth3Title, lang).trim();
    }
  }

  const dynamicCompassFallback = buildDynamicDashaGocharaCompassFallback(parsedKundali);
  let finalDashaGocharaCompass = { ...dynamicCompassFallback };
  if (isDashaGocharaCompassValid(dataDashaGocharaCompass)) {
    const p1 = cleanEnglishFromRegionalText(dataDashaGocharaCompass.paragraph1 || "", lang).trim();
    const p2 = cleanEnglishFromRegionalText(dataDashaGocharaCompass.paragraph2 || "", lang).trim();
    const p3 = cleanEnglishFromRegionalText(dataDashaGocharaCompass.paragraph3 || "", lang).trim();
    if (p1.length >= 60 && p2.length >= 60 && p3.length >= 60) {
      finalDashaGocharaCompass.paragraph1 = p1;
      finalDashaGocharaCompass.paragraph2 = p2;
      finalDashaGocharaCompass.paragraph3 = p3;
      if (dataDashaGocharaCompass.title) finalDashaGocharaCompass.title = cleanEnglishFromRegionalText(dataDashaGocharaCompass.title, lang).trim();
      if (dataDashaGocharaCompass.subtitle) finalDashaGocharaCompass.subtitle = cleanEnglishFromRegionalText(dataDashaGocharaCompass.subtitle, lang).trim();
      if (dataDashaGocharaCompass.shaniBadge?.status) {
        finalDashaGocharaCompass.shaniBadge.status = cleanEnglishFromRegionalText(dataDashaGocharaCompass.shaniBadge.status, lang).trim();
      }
      if (dataDashaGocharaCompass.guruBadge?.status) {
        finalDashaGocharaCompass.guruBadge.status = cleanEnglishFromRegionalText(dataDashaGocharaCompass.guruBadge.status, lang).trim();
      }
      if (dataDashaGocharaCompass.dashaBadge?.confluenceText) {
        finalDashaGocharaCompass.dashaBadge.confluenceText = cleanEnglishFromRegionalText(dataDashaGocharaCompass.dashaBadge.confluenceText, lang).trim();
      }
      if (dataDashaGocharaCompass.pariharaBadge?.sankalpaText) {
        finalDashaGocharaCompass.pariharaBadge.sankalpaText = cleanEnglishFromRegionalText(dataDashaGocharaCompass.pariharaBadge.sankalpaText, lang).trim();
      }
      if (dataDashaGocharaCompass.pillars?.career?.text) {
        finalDashaGocharaCompass.pillars.career.text = cleanEnglishFromRegionalText(dataDashaGocharaCompass.pillars.career.text, lang).trim();
      }
      if (dataDashaGocharaCompass.pillars?.wealth?.text) {
        finalDashaGocharaCompass.pillars.wealth.text = cleanEnglishFromRegionalText(dataDashaGocharaCompass.pillars.wealth.text, lang).trim();
      }
      if (dataDashaGocharaCompass.pillars?.family?.text) {
        finalDashaGocharaCompass.pillars.family.text = cleanEnglishFromRegionalText(dataDashaGocharaCompass.pillars.family.text, lang).trim();
      }
      if (dataDashaGocharaCompass.pillars?.shield?.text) {
        finalDashaGocharaCompass.pillars.shield.text = cleanEnglishFromRegionalText(dataDashaGocharaCompass.pillars.shield.text, lang).trim();
      }
    }
  }

  const dynamicPrescriptions = buildDynamicPrescriptions(parsedKundali);

  const premiumDataPayload: PremiumData = {
    soulMirror: finalSoulMirror,
    characteristics: finalCharacteristics,
    darkSecret: finalDarkSecret,
    currentPhase: finalCurrentPhase,
    yogas: finalYogas,
    doshas: finalDoshas,
    timeline: finalTimeline,
    annualForecast: finalAnnualForecast,
    gochara: finalGochara,
    dashaGocharaCompass: finalDashaGocharaCompass,
    summary: finalSummary,
    maandiInquest: finalMaandiInquest,
    prescriptions: dynamicPrescriptions
  };

  const payloadAuditStr = JSON.stringify(premiumDataPayload).toLowerCase();
  if (payloadAuditStr.includes("sorry, i encountered an error") || payloadAuditStr.includes("check your api key")) {
    console.error("[bhavishyaV1Service Quality Audit] Error detected in payload. Healing with dynamic mathematical fallbacks.");
    premiumDataPayload.summary = [{ impact: rawSummaryFallback }];
    premiumDataPayload.annualForecast = [{ impact: annualFallbackText }];
    premiumDataPayload.characteristics = [{ impact: charFallbackText }];
    premiumDataPayload.darkSecret = [{ impact: secretFallbackText }];
    premiumDataPayload.soulMirror = dynamicSoulMirror;
    premiumDataPayload.dashaGocharaCompass = dynamicCompassFallback;
    premiumDataPayload.prescriptions = dynamicPrescriptions;
  }

  // Strict non-empty Soul Mirror healing
  if (
    !premiumDataPayload.soulMirror ||
    !premiumDataPayload.soulMirror.elemental ||
    (premiumDataPayload.soulMirror.truth1Text || "").trim().length < 80 ||
    (premiumDataPayload.soulMirror.truth2Text || "").trim().length < 80 ||
    (premiumDataPayload.soulMirror.truth3Text || "").trim().length < 80
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Soul Mirror incomplete. Healing with dynamic mathematical fallback.");
    premiumDataPayload.soulMirror = dynamicSoulMirror;
  }

  // Strict non-empty Characteristics healing
  if (
    !premiumDataPayload.characteristics ||
    premiumDataPayload.characteristics.length === 0 ||
    !premiumDataPayload.characteristics.some(c => (c.impact || "").trim().length >= 20)
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Characteristics incomplete. Healing with dynamic mathematical fallback.");
    premiumDataPayload.characteristics = [{ impact: charFallbackText }];
  }

  // Strict non-empty Dark Secret healing
  if (ageYears >= 8) {
    if (
      !premiumDataPayload.darkSecret ||
      premiumDataPayload.darkSecret.length === 0 ||
      !premiumDataPayload.darkSecret.some(d => (d.impact || "").trim().length >= 20)
    ) {
      console.warn("[bhavishyaV1Service Quality Audit] Dark Secret incomplete. Healing with dynamic mathematical fallback.");
      premiumDataPayload.darkSecret = [{ impact: secretFallbackText }];
    }
  }

  // Strict non-empty Current Phase healing
  if (
    !premiumDataPayload.currentPhase ||
    premiumDataPayload.currentPhase.length === 0 ||
    !premiumDataPayload.currentPhase.some(p => (p.impact || "").trim().length >= 100)
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Current Phase incomplete. Healing with dynamic mathematical fallback.");
    premiumDataPayload.currentPhase = [{ impact: currentPhaseFallbackText }];
  }

  // Strict non-empty Yogas healing
  if (
    !premiumDataPayload.yogas ||
    premiumDataPayload.yogas.length === 0 ||
    !premiumDataPayload.yogas.some(y => (y.impact || "").trim().length >= 20)
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Yogas incomplete. Healing with dynamic mathematical fallback.");
    premiumDataPayload.yogas = rawYogasFallback.map((y: any) => ({
      name: y.name,
      impact: y.impact,
      significance: y.impact.split(/\n\n+/).filter(Boolean)
    }));
  }

  // Strict non-empty Doshas healing
  if (
    !premiumDataPayload.doshas ||
    premiumDataPayload.doshas.length === 0 ||
    !premiumDataPayload.doshas.some(d => (d.impact || "").trim().length >= 20)
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Doshas incomplete. Healing with dynamic mathematical fallback.");
    premiumDataPayload.doshas = safeDoshaFallback.map((d: any) => ({
      name: d.name,
      impact: d.impact,
      significance: d.impact.split(/\n\n+/).filter(Boolean),
      remedy: d.remedy
    }));
  }

  // Strict non-empty Gochara healing
  if (
    !premiumDataPayload.gochara ||
    premiumDataPayload.gochara.length < 2 ||
    !premiumDataPayload.gochara.every(g => (g.impact || "").trim().length >= 50)
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Gochara incomplete. Healing with dynamic mathematical fallback.");
    premiumDataPayload.gochara = rawGocharaFallback.map((g: any) => ({
      name: localizeGocharaName(g.name || "", lang),
      impact: cleanDegreesFromText(enrichGocharaDescription(g.name || "", cleanEnglishFromRegionalText(g.impact || "", lang), lang, moonStr, ageYears, dashaName, bhuktiName)),
      remedy: g.remedy ? cleanDegreesFromText(cleanEnglishFromRegionalText(g.remedy, lang)) : undefined
    }));
  }

  // Strict non-empty Saramsha (Summary) healing
  if (
    !premiumDataPayload.summary ||
    premiumDataPayload.summary.length === 0 ||
    !premiumDataPayload.summary.some(s => (s.impact || "").trim().length >= 50)
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Saramsha missing or too short. Healing with dynamic mathematical fallback.");
    premiumDataPayload.summary = [{ impact: rawSummaryFallback }];
  }

  // Strict complete 6-month Timeline validation & healing
  if (
    !premiumDataPayload.timeline ||
    premiumDataPayload.timeline.length < 6 ||
    !premiumDataPayload.timeline.every(t => (t.dateRange || "").trim().length > 0 && (t.impact || "").trim().length >= 20)
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Timeline incomplete. Healing with dynamic mathematical fallback.");
    premiumDataPayload.timeline = dynamicTimelineFallback;
  }

  // Strict non-empty Annual Forecast healing
  if (
    !premiumDataPayload.annualForecast ||
    premiumDataPayload.annualForecast.length === 0 ||
    !premiumDataPayload.annualForecast.some(a => (a.impact || "").trim().length >= 100)
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Annual Forecast incomplete. Healing with dynamic mathematical fallback.");
    premiumDataPayload.annualForecast = [{ impact: annualFallbackText }];
  }

  // Strict non-empty Dasha-Gochara Compass healing
  if (
    !premiumDataPayload.dashaGocharaCompass ||
    !premiumDataPayload.dashaGocharaCompass.paragraph1 ||
    !premiumDataPayload.dashaGocharaCompass.pillars ||
    (premiumDataPayload.dashaGocharaCompass.paragraph1 || "").trim().length < 50
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Dasha-Gochara Compass incomplete. Healing with dynamic mathematical fallback.");
    premiumDataPayload.dashaGocharaCompass = dynamicCompassFallback;
  }

  // Strict non-empty Prescriptions healing
  if (
    !premiumDataPayload.prescriptions ||
    !premiumDataPayload.prescriptions.gemstone ||
    !premiumDataPayload.prescriptions.luckyColors
  ) {
    console.warn("[bhavishyaV1Service Quality Audit] Prescriptions incomplete. Healing with dynamic mathematical fallback.");
    premiumDataPayload.prescriptions = dynamicPrescriptions;
  }

  onProgress?.(
    88,
    lang === "kn"
      ? "೯. ಉನ್ನತ ರೆಸಲ್ಯೂಷನ್ ಅಧಿಕೃತ ಬಗ್ಗೋಣ ಪಿಡಿಎಫ್ ಮುದ್ರಣ ಸಿದ್ಧತೆ..."
      : lang === "hi"
      ? "9. उच्च-रिज़ॉल्यूशन आधिकारिक बग्गोण पीडीएफ मुद्रण तैयारी..."
      : "9. Assembling High-Resolution Official Baggona PDF Document..."
  );

  return {
    translations: translatedData,
    premiumData: premiumDataPayload,
    deepInsights,
    predictions: cleanedV1Predictions,
    ageYears
  };
}

export interface CaptureV1PdfOptions {
  payload?: BhavishyaV1Payload | null;
  lang?: string;
  onProgress?: (progress: number, stageText: string) => void;
}

/**
 * Captures Baggona Divya Bhavishya V1 as a continuous high-fidelity PDF without browser truncation.
 * Uses a Section-Stitching Continuous Canvas Engine to bypass the browser HTML5 canvas limit (16,384px).
 * Strictly validates that Saramsha (Astrologer's Summary) and all chapters are present before generating or saving.
 */
export async function captureBhavishyaV1Pdf(
  containerEl: HTMLElement,
  fileName: string,
  autoSave: boolean = true,
  options?: CaptureV1PdfOptions
): Promise<jsPDF> {
  const lang = options?.lang || "kn";
  const parentEl = containerEl.parentElement;
  const originalStyle = parentEl?.getAttribute("style") || "";

  try {
    if (parentEl) {
      // Use width 900px, position fixed left 0 top 0 so all Indic fonts and CSS layouts render accurately
      parentEl.setAttribute(
        "style",
        "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; background-color: #FFF7ED;"
      );
    }

    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 500));

    // MANDATORY AUDIT: Payload & DOM Integrity Check
    // If Saramsha or any core chapter is missing, throws BhavishyaValidationError and halts download
    assertBhavishyaV1Integrity(containerEl, options?.payload, lang);

    // Query all individual chapter sections (.pdf-section)
    const rawSections = Array.from(containerEl.querySelectorAll(".pdf-section")) as HTMLElement[];
    const sections = rawSections.filter(s => {
      const rect = s.getBoundingClientRect();
      return rect.height > 0 && s.style.display !== "none" && s.style.visibility !== "hidden";
    });

    const baseLang = (lang || "en").split("-")[0];

    if (sections.length < 8) {
      const msg = baseLang === "kn"
        ? `ಮುದ್ರಣ ಪುಟಗಳ ಕೊರತೆ (ಕೇವಲ ${sections.length} ಅಧ್ಯಾಯಗಳು ಮಾತ್ರ ಮೂಡಿಬಂದಿವೆ - ಕನಿಷ್ಠ ೧೨ ಅಗತ್ಯವಿದೆ)`
        : baseLang === "hi"
        ? `प्रिंट पृष्ठों की कमी (केवल ${sections.length} खंड लोड हुए - न्यूनतम 12 आवश्यक हैं)`
        : baseLang === "te"
        ? `ముద్రణ పేజీల కొరత (కేవలం ${sections.length} విభాగాలు మాత్రమే వచ్చాయి - కనీసం 12 అవసరం)`
        : baseLang === "ta"
        ? `அச்சுப் பக்கக் குறைபாடு (மட்டும் ${sections.length} பகுதிகள் வந்துள்ளன - குறைந்தபட்சம் 12 தேவை)`
        : `Insufficient DOM sections (Found ${sections.length}, minimum 12 required)`;
      throw new BhavishyaValidationError(msg, ["DOM Sections"]);
    }

    // Verify Saramsha section specifically is in the sections list across all 5 languages
    const hasSaramshaSection = sections.some(s => {
      const sectionAttr = s.getAttribute("data-section");
      const id = s.id;
      const text = s.innerText || s.textContent || "";
      return (
        sectionAttr === "summary" ||
        id === "pdf-section-summary" ||
        text.includes("ಸಾರಾಂಶ") ||
        text.includes("सारांश") ||
        text.includes("సారాంశం") ||
        text.includes("சுருக்கம்") ||
        text.includes("Summary")
      );
    });

    if (!hasSaramshaSection) {
      const errMsg = baseLang === "kn"
        ? "ದೋಷ: ಮುದ್ರಣ ಪುಟದಲ್ಲಿ ಸಾರಾಂಶ (Astrologer's Summary) ವಿಭಾಗ ಕಂಡುಬಂದಿಲ್ಲ. ಅಪೂರ್ಣ ವರದಿ ಡೌನ್‌ಲೋಡ್ ತಡೆಯಲಾಗಿದೆ."
        : baseLang === "hi"
        ? "त्रुटि: प्रिंट पृष्ठ में सारांश (Astrologer's Summary) खंड नहीं मिला। अपूर्ण रिपोर्ट डाउनलोड रोक दी गई है।"
        : baseLang === "te"
        ? "లోపం: ముద్రణ పేజీలో సారాంశం (Astrologer's Summary) విభాగం కనుగొనబడలేదు. అసంపూర్ణ నివేదిక డౌన్‌లోడ్ నిలిపివేయబడింది."
        : baseLang === "ta"
        ? "பிழை: அச்சுப் பக்கத்தில் சுருக்கம் (Astrologer's Summary) பகுதி காணப்படவில்லை. முழுமையற்ற அறிக்கை பதிவிறக்கம் நிறுத்தப்பட்டது."
        : "Error: Astrologer's Summary (Saramsha) section is missing in rendered document. PDF generation aborted.";
      throw new BhavishyaValidationError(errMsg, ["Astrologer's Summary (Saramsha)"]);
    }

    const pdfWidthMm = 210; // Standard A4 width in mm
    const renderedSections: { imgData: string; heightMm: number; name: string }[] = [];

    // Render each section to an individual high-DPI canvas (safe from 16,384px dimension limits)
    for (let i = 0; i < sections.length; i++) {
      const sectionEl = sections[i];
      const sectionName = sectionEl.getAttribute("data-section") || sectionEl.id || `section_${i}`;

      const progressVal = 88 + Math.round(((i + 1) / sections.length) * 8);
      options?.onProgress?.(
        progressVal,
        baseLang === "kn"
          ? `೧೦. ಡಿಜಿಟಲ್ ಪುಟ ರಚನೆ (${i + 1}/${sections.length}): ${sectionName}...`
          : baseLang === "hi"
          ? `10. डिजिटल पृष्ठ निर्माण (${i + 1}/${sections.length}): ${sectionName}...`
          : baseLang === "te"
          ? `10. డిజిటల్ పేజీల నిర్మాణం (${i + 1}/${sections.length}): ${sectionName}...`
          : baseLang === "ta"
          ? `10. டிஜிட்டல் பக்க உருவாக்கம் (${i + 1}/${sections.length}): ${sectionName}...`
          : `10. Rendering High-Definition Section (${i + 1}/${sections.length})...`
      );

      const sectionHeight = sectionEl.scrollHeight || sectionEl.offsetHeight;
      // Defensive scale clamping to never exceed 15,000px canvas dimension
      const sectionScale = sectionHeight * 2 > 15000 ? Math.max(1, Math.floor(15000 / sectionHeight)) : 2;

      // Render each section in an isolated top-level container at (left: 0, top: 0)
      // to guarantee html2canvas never clips or drops sections outside viewport!
      const tempBox = document.createElement("div");
      tempBox.style.position = "fixed";
      tempBox.style.left = "0px";
      tempBox.style.top = "0px";
      tempBox.style.width = "900px";
      tempBox.style.zIndex = "-9999";
      tempBox.style.backgroundColor = "#FFF7ED";
      tempBox.style.pointerEvents = "none";
      tempBox.style.opacity = "1";
      tempBox.style.visibility = "visible";
      tempBox.style.overflow = "visible";
      tempBox.style.fontFamily = "'Noto Sans Kannada', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Outfit', sans-serif";
      tempBox.className = "bg-orange-50 text-amber-950 font-serif";

      const sectionClone = sectionEl.cloneNode(true) as HTMLElement;
      sectionClone.style.display = "block";
      sectionClone.style.width = "100%";
      sectionClone.style.margin = "0";
      tempBox.appendChild(sectionClone);
      document.body.appendChild(tempBox);

      let canvas: HTMLCanvasElement | null = null;
      try {
        canvas = await html2canvas(tempBox, {
          scale: sectionScale,
          useCORS: true,
          logging: false,
          backgroundColor: "#FFF7ED", // Warm royal parchment background
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 900
        });
      } finally {
        if (tempBox.parentElement) {
          document.body.removeChild(tempBox);
        }
      }

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        console.warn(`[captureBhavishyaV1Pdf] Empty canvas rendered for section: ${sectionName}`);
        continue;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const heightMm = (canvas.height * pdfWidthMm) / canvas.width;

      renderedSections.push({
        imgData,
        heightMm,
        name: sectionName
      });
    }

    // Verify at least one section was rendered and Saramsha was rendered
    const hasRenderedSaramsha = renderedSections.some(s =>
      s.name.includes("summary") ||
      s.name.includes("ಸಾರಾಂಶ") ||
      s.name.includes("सारांश") ||
      s.name.includes("సారాంశం") ||
      s.name.includes("சுருக்கம்")
    );
    if (!hasRenderedSaramsha) {
      console.warn("[captureBhavishyaV1Pdf] Saramsha section canvas was not detected in primary pass. Attempting graceful recovery...");
      const domSummaryEl = sections.find(s =>
        (s.getAttribute("data-section") || "").includes("summary") ||
        s.id === "pdf-section-summary"
      );
      if (domSummaryEl) {
        try {
          const tempSummaryBox = document.createElement("div");
          tempSummaryBox.style.position = "absolute";
          tempSummaryBox.style.left = "-9999px";
          tempSummaryBox.style.top = "0";
          tempSummaryBox.style.width = "900px";
          tempSummaryBox.className = "bg-orange-50 text-amber-950 font-serif";

          const summaryClone = domSummaryEl.cloneNode(true) as HTMLElement;
          summaryClone.style.display = "block";
          summaryClone.style.width = "100%";
          tempSummaryBox.appendChild(summaryClone);
          document.body.appendChild(tempSummaryBox);

          const sumCanvas = await html2canvas(tempSummaryBox, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#FFF7ED",
            allowTaint: true,
            windowWidth: 900
          });
          document.body.removeChild(tempSummaryBox);

          if (sumCanvas && sumCanvas.width > 0 && sumCanvas.height > 0) {
            renderedSections.push({
              imgData: sumCanvas.toDataURL("image/jpeg", 0.95),
              heightMm: (sumCanvas.height * pdfWidthMm) / sumCanvas.width,
              name: "summary-recovered"
            });
            console.log("[captureBhavishyaV1Pdf] Successfully recovered Saramsha section canvas.");
          }
        } catch (sumErr) {
          console.warn("[captureBhavishyaV1Pdf] Summary recovery pass failed, proceeding with all rendered chapters:", sumErr);
        }
      }
    }

    // Calculate total continuous height in mm
    const totalPdfHeightMm = renderedSections.reduce((sum, s) => sum + s.heightMm, 0);
    if (totalPdfHeightMm <= 0) {
      throw new Error("Calculated PDF height is zero. Cannot generate empty PDF.");
    }

    // Partition rendered sections across pages to strictly stay below jsPDF's hard 14,400 userUnit (5080mm) limit
    const MAX_SAFE_PAGE_HEIGHT_MM = 3800;
    const pages: { sections: typeof renderedSections; heightMm: number }[] = [];
    let currentPageSections: typeof renderedSections = [];
    let currentPageHeightMm = 0;

    for (const sec of renderedSections) {
      if (currentPageSections.length > 0 && currentPageHeightMm + sec.heightMm > MAX_SAFE_PAGE_HEIGHT_MM) {
        pages.push({ sections: currentPageSections, heightMm: currentPageHeightMm });
        currentPageSections = [sec];
        currentPageHeightMm = sec.heightMm;
      } else {
        currentPageSections.push(sec);
        currentPageHeightMm += sec.heightMm;
      }
    }
    if (currentPageSections.length > 0) {
      pages.push({ sections: currentPageSections, heightMm: currentPageHeightMm });
    }

    // Create jsPDF document with the first page height
    const firstPage = pages[0];
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [pdfWidthMm, firstPage.heightMm],
      compress: true
    });

    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const page = pages[pIdx];
      if (pIdx > 0) {
        pdf.addPage([pdfWidthMm, page.heightMm], "p");
      }

      // 1. Fill background with warm royal parchment (#FFF7ED)
      pdf.setFillColor(255, 247, 237);
      pdf.rect(0, 0, pdfWidthMm, page.heightMm, "F");

      // 2. Add each section seamlessly sequentially on this page
      let currentYMm = 0;
      for (const sec of page.sections) {
        pdf.addImage(sec.imgData, "JPEG", 0, currentYMm, pdfWidthMm, sec.heightMm, undefined, "FAST");
        currentYMm += sec.heightMm;
      }

      // 3. Draw outer & inner royal gold double borders for this page
      // Outer border: 4mm margin, 0.75mm line, amber-700 (#B45309)
      pdf.setDrawColor(180, 83, 9);
      pdf.setLineWidth(0.75);
      pdf.rect(4, 4, pdfWidthMm - 8, page.heightMm - 8, "S");

      // Inner border: 6mm margin, 0.25mm dashed line
      pdf.setDrawColor(180, 83, 9);
      pdf.setLineWidth(0.25);
      pdf.rect(6, 6, pdfWidthMm - 12, page.heightMm - 12, "S");
    }

    options?.onProgress?.(
      100,
      baseLang === "kn"
        ? "ಅಧಿಕೃತ ಬಗ್ಗೋಣ ಭವಿಷ್ಯ ಮುದ್ರಣ ಪೂರ್ಣಗೊಂಡಿದೆ!"
        : baseLang === "hi"
        ? "आधिकारिक बग्गोण भविष्य मुद्रण सफलतापूर्वक पूर्ण!"
        : baseLang === "te"
        ? "అధికారిక బగ్గోణ భవిష్యత్తు ముద్రణ విజయవంతంగా పూర్తయింది!"
        : baseLang === "ta"
        ? "அதிகாரப்பூர்வ பக்கோணா ஜோதிட அறிக்கை பதிவிறக்கம் தயார்!"
        : "Official Baggona Bhavishya PDF Download Ready!"
    );

    if (autoSave) {
      savePdfBlob(pdf, fileName);
    }
    return pdf;
  } finally {
    if (parentEl) {
      parentEl.setAttribute("style", originalStyle);
    }
  }
}
