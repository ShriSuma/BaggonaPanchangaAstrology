import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import type { PdfTranslations, PremiumData } from "../../components/RamanBhavishya/PdfTemplate";
import type { TranslatedPrediction } from "../../components/RamanBhavishya/usePredictionEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";
import { generateMasterPrediction } from "../../core/MasterPredictionEngine";
import { detectAffairIndicators } from "../../core/layers/NatalLayer";
import { getTransitsForDate } from "../../core/BaggonaPredictionEngine";
import { askGemini } from "../../core/GeminiEngine";
import { translateText } from "../../utils/translator";
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
  buildDynamicTimelineFallback
} from "./dynamicBhavishyaEngine";
import {
  enrichYogaDescription,
  enrichDoshaDescription,
  enrichGocharaDescription,
  hasTwoSubstantialParagraphs,
  localizeYogaName,
  localizeDoshaName,
  localizeGocharaName,
  localizeDoshaRemedy
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
import { WEEKDAY_L5 } from "../seva/sevaLocale";
import {
  buildPremiumPrompts,
  type NatalPlacement,
  type TransitPlacement
} from "./premiumPrompts";
import type { PlanetName } from "../../core/AstroTypes";

const toGraha = (planet: PlanetName | string): GrahaKey => String(planet) as GrahaKey;

const asText = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value.join(" ") : value ?? "";

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
    // CRITICAL: Reject English AI leaks in regional language downloads
    if (isRegional && /[a-zA-Z]{3,}/.test(txt)) return false;
    return true;
  });
  if (validItems.length > 0) {
    return validItems.map(item => ({
      ...item,
      impact: cleanEnglishFromRegionalText(item.impact || item.description || item.trait || "", targetLang),
      name: item.name ? cleanEnglishFromRegionalText(item.name, targetLang) : undefined
    }));
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

  const translatedData: PdfTranslations = {
    title: tp("title", lang),
    subtitle: tp("subtitle", lang),
    nameLabel: tp("nameLabel", lang),
    nameValue: localizedDevoteeName,
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
    ashirvadaValue: tp("ashirvadaValue", lang),
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
    natalPlanets,
    transits,
    mahaLord,
    bhuktiLord,
    bhuktiEndsAtAge: currentBhuktiData?.bhuktiEndAge ?? null,
    engineYogas: result.aiGeneratedNarrative?.yogas ?? [],
    engineDoshas: result.aiGeneratedNarrative?.doshas ?? [],
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

  const callGeminiSafe = async (label: string, prompt: string, temp = 0.3, timeoutMs = 8000, maxAttempts = 5): Promise<string> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const timeoutPromise = new Promise<string>((resolve) =>
          setTimeout(() => {
            console.warn(`[bhavishyaV1Service] AI call for ${label} (attempt ${attempt}/${maxAttempts}) reached ${timeoutMs}ms timeout guard.`);
            resolve("");
          }, timeoutMs)
        );
        const raw = await Promise.race([
          askGemini(label, prompt, geminiApiKey, lang, { raw: true, temperature: temp }),
          timeoutPromise
        ]);
        if (typeof raw === "string" && (raw.includes("Sorry, I encountered an error") || raw.includes("check your API key") || raw.includes("Error:") || raw.includes("GoogleGenerativeAIError"))) {
          console.warn(`[bhavishyaV1Service] Error string detected for ${label} (attempt ${attempt}/${maxAttempts}): ${raw}`);
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, attempt * 350));
            continue;
          }
          return "";
        }
        if (typeof raw === "string" && raw.trim().length > 20) {
          return raw;
        }
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, attempt * 350));
          continue;
        }
        return "";
      } catch (e) {
        console.warn(`[bhavishyaV1Service] AI call failed for ${label} (attempt ${attempt}/${maxAttempts}):`, e);
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, attempt * 350));
          continue;
        }
        return "";
      }
    }
    return "";
  };

  // Batch 1: Characteristics & Dark Secret
  onProgress?.(
    38,
    lang === "kn"
      ? "೩. ಆತ್ಮಾನ್ವೇಷಣೆ ಹಾಗೂ ಜನ್ಮ ಲಗ್ನ ವ್ಯಕ್ತಿತ್ವ ಅಧ್ಯಾಯಗಳ ಸಂಶ್ಲೇಷಣೆ..."
      : lang === "hi"
      ? "3. आत्मा एवं जन्म लग्न व्यक्तित्व अध्यायों का सटीक विश्लेषण..."
      : "3. Synthesizing Soul & Personality Chapters..."
  );
  const [resCharacteristics, resDarkSecret] = await Promise.all([
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

  // Batch 4: Gochara & Summary
  onProgress?.(
    62,
    lang === "kn"
      ? "೬. ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹಗಳು ಹಾಗೂ ದೈವಿಕ ಸಂಕ್ಷಿಪ್ತ ಸಾರಾಂಶ..."
      : lang === "hi"
      ? "6. लाइव गोचर ग्रह एवं ज्योतिषी सारांश..."
      : "6. Calculating Live Transits & Astrologer's Summary..."
  );
  const [resGochara, resSummary] = await Promise.all([
    callGeminiSafe("Generate Gochara", prompts.gochara, 0.4),
    callGeminiSafe("Generate Summary", prompts.summary, 0.3)
  ]);
  await new Promise(r => setTimeout(r, 120));

  // Batch 5: Bhavishya Life Areas
  onProgress?.(
    70,
    lang === "kn"
      ? "೭. ವಿವಾಹ, ಸಂತಾನ, ಉದ್ಯೋಗ, ಆರ್ಥಿಕ ಹಾಗೂ ಆರೋಗ್ಯ ಅಧ್ಯಾಯಗಳ ನಿಖರ ಸಂಶ್ಲೇಷಣೆ..."
      : lang === "hi"
      ? "7. विवाह, संतान, करियर, धन एवं स्वास्थ्य का गहन विश्लेषण..."
      : "7. Synthesizing Marriage, Children, Career, Wealth & Health..."
  );
  let dataBhavishya: any = {};
  if (ageYears < 8) {
    const resBhavishya = await callGeminiSafe("Generate Bhavishya Child Areas", prompts.bhavishya, 0.3);
    dataBhavishya = robustParseGeminiJSON(resBhavishya);
  } else {
    const [resBhavishya1, resBhavishya2] = await Promise.all([
      callGeminiSafe("Generate Marriage & Children", prompts.bhavishyaMarriageChildren || prompts.bhavishya, 0.3),
      callGeminiSafe("Generate Career, Wealth & Health", prompts.bhavishyaCareerWealthHealth || prompts.bhavishya, 0.3)
    ]);
    const dataB1 = robustParseGeminiJSON(resBhavishya1);
    const dataB2 = robustParseGeminiJSON(resBhavishya2);
    dataBhavishya = {
      bhavishya: {
        marriage: dataB1?.bhavishya?.marriage || dataB2?.bhavishya?.marriage,
        children: dataB1?.bhavishya?.children || dataB2?.bhavishya?.children,
        career: dataB2?.bhavishya?.career || dataB1?.bhavishya?.career,
        wealth: dataB2?.bhavishya?.wealth || dataB1?.bhavishya?.wealth,
        health: dataB2?.bhavishya?.health || dataB1?.bhavishya?.health
      }
    };
  }

  onProgress?.(
    80,
    lang === "kn"
      ? "೮. ಸಂಪೂರ್ಣ ೧೦-ಅಧ್ಯಾಯಗಳ ವರದಿ ಪರಿಶೀಲನೆ ಹಾಗೂ ಅಧಿಕೃತ ದೃಗ್ಗಣಿತ ತಾಳೆ..."
      : lang === "hi"
      ? "8. संपूर्ण १०-अध्यायों का सत्यापन एवं शास्त्रीय मिलान..."
      : "8. Verifying 10-Chapter Astrological Integrity & Alignment..."
  );

  const dataCharacteristics = robustParseGeminiJSON(resCharacteristics);
  const dataDarkSecret = robustParseGeminiJSON(resDarkSecret);
  const dataCurrentPhase = robustParseGeminiJSON(resCurrentPhase);
  const dataYogas = robustParseGeminiJSON(resYogas);
  const dataDoshas = robustParseGeminiJSON(resDoshas);
  const dataTimeline = robustParseGeminiJSON(resTimeline);
  const dataGochara = robustParseGeminiJSON(resGochara);
  const dataSummary = robustParseGeminiJSON(resSummary);

  const isSufficientDepth = (text: string | undefined, minParas: number = 2, minChars: number = 380): boolean => {
    if (!text || text.trim().length < minChars) return false;
    const paras = text.split(/\n\n+/).filter(p => p.trim().length > 60);
    return paras.length >= minParas;
  };

  const isChild = ageYears < 8;
  const v1Predictions: TranslatedPrediction[] = [];
  const aiB = dataBhavishya?.bhavishya || {};

  const lagnaIdx = session.result.lagnaRashi?.index ?? 0;
  const lagnaStr = session.result.lagnaRashi ? pick(RASHI_L5[session.result.lagnaRashi.index], lang) : "";
  const moonStr = pick(RASHI_L5[session.result.moonSign.index], lang);
  const dashaName = mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "Dasha";
  const bhuktiName = bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "Bhukti";

  if (isChild) {
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
    const catMar = baseLang === "kn" ? "ಧರ್ಮ ಸಹಚಾರ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ" : baseLang === "hi" ? "दांपत्य सौहार्द एवं पारिवारिक शांति" : baseLang === "te" ? "దాంపత్య సౌఖ్యం మరియు కుటుంబ ప్రశాంతత" : baseLang === "ta" ? "தம்பதியர் நல்லிணக்கம் மற்றும் குடும்ப அமைதி" : "Companionship & Domestic Harmony";
    let textMar = asText(aiB.marriage).trim();
    if (isSufficientDepth(textMar, 2, 380)) {
      const mParas = textMar.split("\n").filter((pText: string) => {
        const pLower = pText.toLowerCase();
        return !pLower.includes("ಸಂತಾನ") && !pLower.includes("ಮಕ್ಕಳ") && !pLower.includes("progeny") && !pLower.includes("children");
      });
      textMar = mParas.join("\n\n").trim() || textMar;
    }
    if (!isSufficientDepth(textMar, 2, 380)) {
      textMar = buildPersonalizedMarriageText(lang, lagnaStr, moonStr, (personalization?.maritalStatus as ("married" | "unmarried" | "general")) || "married", lagnaIdx, dashaName, bhuktiName, userGender as "Male" | "Female", dynamicCtx);
    }
    v1Predictions.push({ category: "Companionship & Domestic Harmony", translatedCategory: catMar, text: textMar, translatedText: textMar });

    const catChd = baseLang === "kn" ? "ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಮೊಮ್ಮಕ್ಕಳ ಸೌಖ್ಯ" : baseLang === "hi" ? "वंश वृद्धि एवं पौत्र-पौत्री सुख" : baseLang === "te" ? "వంశాభివృద్ధి మరియు మనవలు-మనవరాళ్ల సుఖం" : baseLang === "ta" ? "சந்ததி வளர்ச்சி மற்றும் பேரப்பிள்ளைகள் நலம்" : "Family Legacy & Grandchildren";
    const textChd = isSufficientDepth(asText(aiB.children).trim(), 2, 380)
      ? asText(aiB.children).trim()
      : buildPersonalizedChildrenText(lang, (personalization?.childrenStatus as ("general" | "no_children" | "has_children")) || "has_children", lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Family Legacy & Grandchildren", translatedCategory: catChd, text: textChd, translatedText: textChd });

    const catCar = baseLang === "kn" ? "ಧರ್ಮ ಕಾರ್ಯ, ಸಮಾಜ ಸೇವೆ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನ" : baseLang === "hi" ? "धर्मार्थ कार्य एवं सामाजिक मार्गदर्शन" : baseLang === "te" ? "ధర్మ కార్యాలు మరియు సమాజ మార్గదర్శకత్వం" : baseLang === "ta" ? "தர்ம காரியங்கள் மற்றும் சமூக வழிகாட்டுதல்" : "Mentorship & Dharmic Leadership";
    const textCar = isSufficientDepth(asText(aiB.career).trim(), 2, 380)
      ? asText(aiB.career).trim()
      : buildPersonalizedCareerText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Mentorship & Dharmic Leadership", translatedCategory: catCar, text: textCar, translatedText: textCar });

    const catWlh = baseLang === "kn" ? "ಸಂಪತ್ತು ಸಂರಕ್ಷಣೆ ಹಾಗೂ ಕುಟುಂಬ ಸಮೃದ್ಧಿ" : baseLang === "hi" ? "संपत्ति सुरक्षा एवं पारिवारिक समृद्धि" : baseLang === "te" ? "సంపద పరిరక్షణ మరియు కుటుంబ సుఖం" : baseLang === "ta" ? "செல்வப் பாதுகாப்பு மற்றும் குடும்ப சுபிட்சம்" : "Wealth Preservation & Estate Peace";
    const textWlh = isSufficientDepth(asText(aiB.wealth).trim(), 2, 380)
      ? asText(aiB.wealth).trim()
      : buildPersonalizedWealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Wealth Preservation & Estate Peace", translatedCategory: catWlh, text: textWlh, translatedText: textWlh });

    const catHlt = baseLang === "kn" ? "ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಸ್ವಾಸ್ಥ್ಯ ರಕ್ಷಣೆ" : baseLang === "hi" ? "दीर्घायु एवं स्वास्थ्य रक्षा" : baseLang === "te" ? "దీర్ఘాయుష్షు మరియు ఆరోగ్య రక్షణ" : baseLang === "ta" ? "நீண்ட ஆயுள் மற்றும் ஆரோக்கியப் பாதுகாப்பு" : "Longevity & Geriatric Wellness";
    const textHlt = isSufficientDepth(asText(aiB.health).trim(), 2, 380)
      ? asText(aiB.health).trim()
      : buildPersonalizedHealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Longevity & Geriatric Wellness", translatedCategory: catHlt, text: textHlt, translatedText: textHlt });
  } else if (ageYears < 22) {
    const catMar = baseLang === "kn" ? "ವ್ಯಕ್ತಿತ್ವ ನಿರ್ಮಾಣ ಹಾಗೂ ಮಾನಸಿಕ ಏಕಾಗ್ರತೆ" : baseLang === "hi" ? "चरित्र निर्माण एवं मानसिक एकाग्रता" : baseLang === "te" ? "వ్యక్తిత్వ నిర్మాణం మరియు ఏకాగ్రత" : baseLang === "ta" ? "ஆளுமை உருவாக்கம் மற்றும் மன உறுதி" : "Character & Mental Focus";
    const textMar = isSufficientDepth(asText(aiB.marriage).trim(), 2, 380)
      ? asText(aiB.marriage).trim()
      : buildPersonalizedMarriageText(lang, lagnaStr, moonStr, "unmarried", lagnaIdx, dashaName, bhuktiName, userGender as "Male" | "Female", dynamicCtx);
    v1Predictions.push({ category: "Character & Mental Focus", translatedCategory: catMar, text: textMar, translatedText: textMar });

    const catChd = baseLang === "kn" ? "ಉನ್ನತ ಶಿಕ್ಷಣ ಹಾಗೂ ಜ್ಞಾನಾರ್ಜನೆ" : baseLang === "hi" ? "उच्च शिक्षा एवं एकाग्रता" : baseLang === "te" ? "ఉన్నత విద్య మరియు విజ్ఞానం" : baseLang === "ta" ? "உயர்கல்வி மற்றும் ஞானம்" : "Higher Studies & Intellect";
    const textChd = isSufficientDepth(asText(aiB.children).trim(), 2, 380)
      ? asText(aiB.children).trim()
      : buildPersonalizedChildrenText(lang, "no_children", lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Higher Studies & Intellect", translatedCategory: catChd, text: textChd, translatedText: textChd });

    const catCar = baseLang === "kn" ? "ಭವಿಷ್ಯದ ವೃತ್ತಿ ಅಡಿಪಾಯ" : baseLang === "hi" ? "भावी करियर की नींव" : baseLang === "te" ? "భవిష్యత్ కెరీర్ పునాది" : baseLang === "ta" ? "எதிர்கால தொழில் அடித்தளம்" : "Future Career Foundation";
    const textCar = isSufficientDepth(asText(aiB.career).trim(), 2, 380)
      ? asText(aiB.career).trim()
      : buildPersonalizedCareerText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Future Career Foundation", translatedCategory: catCar, text: textCar, translatedText: textCar });

    const catWlh = baseLang === "kn" ? "ಆರ್ಥಿಕ ಶಿಸ್ತು ಹಾಗೂ ಕೌಟುಂಬಿಕ ಮೌಲ್ಯಗಳು" : baseLang === "hi" ? "वित्तीय अनुशासन एवं पारिवारिक मूल्य" : baseLang === "te" ? "ఆర్థిక క్రమశిక్షణ మరియు కుటుంబ విలువలు" : baseLang === "ta" ? "நிதி ஒழுக்கம் மற்றும் குடும்ப விழுமியங்கள்" : "Financial Discipline & Values";
    const textWlh = isSufficientDepth(asText(aiB.wealth).trim(), 2, 380)
      ? asText(aiB.wealth).trim()
      : buildPersonalizedWealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Financial Discipline & Values", translatedCategory: catWlh, text: textWlh, translatedText: textWlh });

    const catHlt = baseLang === "kn" ? "ಯುವ ಚೈತನ್ಯ ಹಾಗೂ ದೈಹಿಕ ದೃಢತೆ" : baseLang === "hi" ? "शारीरिक ऊर्जा एवं स्वास्थ्य संतुलन" : baseLang === "te" ? "శారీరక శక్తి మరియు ఆరోగ్య సమతుల్యత" : baseLang === "ta" ? "உடல் வலிமை மற்றும் ஆரோக்கிய சமநிலை" : "Vitality, Fitness & Screen Balance";
    const textHlt = isSufficientDepth(asText(aiB.health).trim(), 2, 380)
      ? asText(aiB.health).trim()
      : buildPersonalizedHealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Vitality, Fitness & Screen Balance", translatedCategory: catHlt, text: textHlt, translatedText: textHlt });
  } else {
    // Adult
    const catMar = baseLang === "kn" ? "ವಿವಾಹ ಹಾಗೂ ಸಂಬಂಧ" : baseLang === "hi" ? "विवाह एवं संबंध" : baseLang === "te" ? "వివాహం మరియు సంబంధ బాంధవ్యాలు" : baseLang === "ta" ? "திருமணம் மற்றும் இல்லற வாழ்க்கை" : "Marriage & Relationships";
    let textMar = asText(aiB.marriage).trim();
    if (isSufficientDepth(textMar, 2, 380)) {
      const mParas = textMar.split("\n").filter((pText: string) => {
        const pLower = pText.toLowerCase();
        return !pLower.includes("ಸಂತಾನ") && !pLower.includes("ಮಕ್ಕಳ") && !pLower.includes("ಪಂಚಮ ಭಾವ") && !pLower.includes("progeny") && !pLower.includes("children");
      });
      textMar = mParas.join("\n\n").trim() || textMar;
    }
    if (!isSufficientDepth(textMar, 2, 380)) {
      textMar = buildPersonalizedMarriageText(lang, lagnaStr, moonStr, (personalization?.maritalStatus as ("married" | "unmarried" | "general")) || "general", lagnaIdx, dashaName, bhuktiName, userGender as "Male" | "Female", dynamicCtx);
    }
    v1Predictions.push({ category: "Marriage & Relationships", translatedCategory: catMar, text: textMar, translatedText: textMar });

    const catChd = baseLang === "kn" ? "ಸಂತಾನ ಹಾಗೂ ಮಕ್ಕಳು" : baseLang === "hi" ? "संतान एवं बच्चे" : baseLang === "te" ? "సంతానం మరియు పిల్లలు" : baseLang === "ta" ? "சந்ததி மற்றும் குழந்தைகள்" : "Children & Progeny";
    const minChildrenParas = personalization?.childrenStatus === "no_children" ? 3 : 2;
    const minChildrenChars = personalization?.childrenStatus === "no_children" ? 420 : 380;
    const textChd = isSufficientDepth(asText(aiB.children).trim(), minChildrenParas, minChildrenChars)
      ? asText(aiB.children).trim()
      : buildPersonalizedChildrenText(lang, (personalization?.childrenStatus as ("general" | "no_children" | "has_children")) || "general", lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Children & Progeny", translatedCategory: catChd, text: textChd, translatedText: textChd });

    const catCar = baseLang === "kn" ? "ಉದ್ಯೋಗ ಹಾಗೂ ವೃತ್ತಿ ಏಳಿಗೆ" : baseLang === "hi" ? "करियर एवं पदोन्नति योग" : baseLang === "te" ? "ఉద్యోగం మరియు వృత్తి ఎదుగుదల" : baseLang === "ta" ? "தொழில் மற்றும் உத்தியோக முன்னேற்றம்" : "Career & Profession";
    const textCar = isSufficientDepth(asText(aiB.career).trim(), 2, 380)
      ? asText(aiB.career).trim()
      : buildPersonalizedCareerText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Career & Profession", translatedCategory: catCar, text: textCar, translatedText: textCar });

    const catWlh = baseLang === "kn" ? "ಧನ ಆಸ್ತಿ ಹಾಗೂ ಆರ್ಥಿಕ ಯೋಗ" : baseLang === "hi" ? "धन संपत्ति एवं आर्थिक योग" : baseLang === "te" ? "ధన సంపద మరియు ఆర్థిక యోగం" : baseLang === "ta" ? "தன லாபம் மற்றும் பொருளாதார நிலை" : "Wealth & Family Finance";
    const textWlh = isSufficientDepth(asText(aiB.wealth).trim(), 2, 380)
      ? asText(aiB.wealth).trim()
      : buildPersonalizedWealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    v1Predictions.push({ category: "Wealth & Family Finance", translatedCategory: catWlh, text: textWlh, translatedText: textWlh });

    const catHlt = baseLang === "kn" ? "ಆರೋಗ್ಯ ಹಾಗೂ ಚೈತನ್ಯ" : baseLang === "hi" ? "स्वास्थ्य एवं आरोग्य" : baseLang === "te" ? "ఆరోగ్యం మరియు శారీరక దృఢత్వం" : baseLang === "ta" ? "ஆரோக்கியம் மற்றும் உடல் பலம்" : "Health & Vitality";
    const textHlt = isSufficientDepth(asText(aiB.health).trim(), 2, 380)
      ? asText(aiB.health).trim()
      : buildPersonalizedHealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
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

  const finalCharacteristics = await ensureValidSection(dataCharacteristics.characteristics, charFallbackText, lang);
  const finalDarkSecret = isChild ? [] : await ensureValidSection(dataDarkSecret.darkSecret, secretFallbackText, lang);
  const finalCurrentPhase = await ensureValidSection(dataCurrentPhase.currentPhase, currentPhaseFallbackText, lang, 250);
  const finalSummary = await ensureValidSection(dataSummary.summary, rawSummaryFallback, lang, 150);

  const rawYogasFallback = (result.aiGeneratedNarrative?.yogas || [{ name: "Dasha Yoga", significance: result.masterSynthesis.overallTone }]).map((y: any) => ({
    name: localizeYogaName(y.name || "Dasha Yoga", lang),
    impact: enrichYogaDescription(y.name, asText(y.significance) || result.masterSynthesis.overallTone, lang, lagnaStr, moonStr, ageYears, dashaName, bhuktiName)
  }));
  const rawYogasArray = toSafeArray(dataYogas.yogas).filter((y: any) => (y?.impact || "").trim().length > 10).length > 0
    ? dataYogas.yogas
    : rawYogasFallback;
  const finalYogas = (rawYogasArray || []).map((y: any) => ({
    ...y,
    name: localizeYogaName(y.name || y.trait || "", lang),
    impact: enrichYogaDescription(y.name || y.trait || "", y.impact || "", lang, lagnaStr, moonStr, ageYears, dashaName, bhuktiName)
  }));

  const rawDoshasFallback = (result.aiGeneratedNarrative?.doshas || [{ name: "Karmic Challenge", significance: result.natalLayer.karmicBaggage.description, remedy: result.natalLayer.karmicBaggage.soulPurpose }]).map((d: any) => ({
    name: localizeDoshaName(d.name || "Karmic Challenge", lang),
    impact: asText(d.significance) || result.natalLayer.karmicBaggage.description,
    remedy: d.remedy || result.natalLayer.karmicBaggage.soulPurpose
  }));
  const rawDoshasArray = toSafeArray(dataDoshas.doshas).filter((d: any) => (d?.impact || "").trim().length > 10).length > 0
    ? dataDoshas.doshas
    : rawDoshasFallback;
  const finalDoshas = (rawDoshasArray || []).map((d: any) => ({
    ...d,
    name: localizeDoshaName(d.name || "", lang),
    impact: enrichDoshaDescription(d.name || "", d.impact || "", lang, lagnaStr, moonStr, ageYears, dashaName, bhuktiName, parsedKundali.maritalStatus),
    remedy: localizeDoshaRemedy(d.name || "", d.remedy, lang, parsedKundali.maritalStatus)
  }));

  const dynamicTimelineFallback = buildDynamicTimelineFallback(parsedKundali);
  const validTimelineItems = toSafeArray(dataTimeline.timeline).filter((t: any) => (t?.impact || "").trim().length > 40);
  const finalTimeline = validTimelineItems.length >= 4
    ? validTimelineItems.map((t: any) => ({
        dateRange: cleanEnglishFromRegionalText(t.dateRange || t.month || "", lang),
        impact: cleanEnglishFromRegionalText(t.impact || t.prediction || "", lang)
      }))
    : dynamicTimelineFallback;

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
    impact: enrichGocharaDescription(g.name || "", cleanEnglishFromRegionalText(g.impact || "", lang), lang, moonStr, ageYears, dashaName, bhuktiName),
    remedy: g.remedy ? cleanEnglishFromRegionalText(g.remedy, lang) : undefined
  }));

  const premiumDataPayload: PremiumData = {
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
    console.error("[bhavishyaV1Service Quality Audit] Error detected in payload. Healing with dynamic mathematical fallbacks.");
    premiumDataPayload.summary = [{ impact: rawSummaryFallback }];
    premiumDataPayload.characteristics = [{ impact: charFallbackText }];
    premiumDataPayload.darkSecret = [{ impact: secretFallbackText }];
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

export async function captureBhavishyaV1Pdf(
  containerEl: HTMLElement,
  fileName: string,
  autoSave: boolean = true
): Promise<jsPDF> {
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

  if (autoSave) {
    const safeName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    pdf.save(safeName);
  }
  return pdf;
}
