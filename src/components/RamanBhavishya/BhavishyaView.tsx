import { useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { usePredictionEngine } from "./usePredictionEngine";
import type { TranslatedPrediction } from "./usePredictionEngine";
import { PdfTemplate, PdfTranslations, PremiumData } from "./PdfTemplate";
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
import type { PlanetName } from "../../core/AstroTypes";
import { PremiumPDFTemplate } from "../pdf/PremiumPDFTemplate";
import { generatePDFFromElement } from "../../utils/pdfGenerator";
import { WEEKDAY_L5 } from "../../features/seva/sevaLocale";
import {
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

const ensureValidSection = async (
  items: any[] | undefined,
  fallbackText: string,
  targetLang: string
): Promise<{ name?: string; impact: string; remedy?: string; dateRange?: string }[]> => {
  const validItems = (items || []).filter(item => (item?.impact || "").trim().length > 10);
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

export default function BhavishyaView() {
  const { predictions, currentMindset, isLoading, loadingText, ashirvada } = usePredictionEngine();
  const { t } = useTranslation();
  const session = useKundliViewerStore((state) => state.session);
  const language = useAppStore((state) => state.language);
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfTranslations, setPdfTranslations] = useState<PdfTranslations | null>(null);
  const [pdfDeepInsights, setPdfDeepInsights] = useState<Record<string, string> | null>(null);
  
  const [isGeneratingPremiumPdf, setIsGeneratingPremiumPdf] = useState(false);
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
        gocharaTitle: await translateText("Current Transit Effects (Gochara)", language),
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

  
  
  const generatePremiumPDF = async () => {
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
      const localisedPredictions: TranslatedPrediction[] = lang === language
        ? sourcePredictions
        : await Promise.all(
            sourcePredictions.map(async (pred) => ({
              ...pred,
              translatedCategory: await translateText(pred.category, lang),
              translatedText: await translateText(pred.text, lang),
            }))
          );
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
        lang
      });
      
      const parseGeminiJSON = (text: string) => {
        try {
          const match = text.match(/\{[\s\S]*\}/);
          return match ? JSON.parse(match[0]) : {};
        } catch(e) {
          console.error("JSON parse error from Gemini:", e);
          return {};
        }
      };

      // Affair indicator detection using B.V. Raman classical rules
      const affairResult = detectAffairIndicators(session.result);
      const affairNote = (affairResult.hasAffairIndicators && affairResult.confidence !== "low")
        ? `The chart carries ${affairResult.confidence}-confidence classical indicators of hidden romantic complexity (${affairResult.indicators.slice(0, 2).join("; ")}). Give this one short paragraph, framed as a karmic soul-pattern in dignified language. Never judgemental.`
        : `This chart shows no confirmed indicator of a secret relationship. Do not raise the subject at all.`;

      // Real transit positions for today, counted from the birth Moon. The old prompt
      // passed the natal chart under a "current transits" label, so every Gochara
      // chapter was written against the wrong sky.
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

      const prompts = buildPremiumPrompts({
        lang,
        runId,
        name: session.input.name,
        ageYears,
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
      // shared wrapper, and the temperature stops repeat downloads reading identically.
      const ask = (label: string, prompt: string) =>
        askGemini(label, prompt, geminiApiKey, lang, { raw: true, temperature: 1 });

      const [resYogas, resDoshas, resCharacteristics, resDarkSecret, resTimeline, resGochara, resSummary] = await Promise.all([
        ask("Generate Premium Yogas", prompts.yogas),
        ask("Generate Premium Doshas", prompts.doshas),
        ask("Generate Characteristics", prompts.characteristics),
        ask("Generate Dark Secret", prompts.darkSecret),
        ask("Generate Planetary Timeline", prompts.timeline),
        ask("Generate Gochara", prompts.gochara),
        ask("Generate Summary", prompts.summary)
      ]);

      const dataYogas = parseGeminiJSON(resYogas);
      const dataDoshas = parseGeminiJSON(resDoshas);
      const dataCharacteristics = parseGeminiJSON(resCharacteristics);
      const dataDarkSecret = parseGeminiJSON(resDarkSecret);
      const dataTimeline = parseGeminiJSON(resTimeline);
      const dataGochara = parseGeminiJSON(resGochara);
      const dataSummary = parseGeminiJSON(resSummary);

      const rawCharFallback = stripJayashreeIntro(`${result.masterSynthesis.overallTone || 'Planetary positions shape a dynamic personality.'}\n\n${result.natalLayer.shadowSelf.bluntTruth || ''}`);
      const rawSecretFallback = `${result.natalLayer.shadowSelf.bluntTruth || 'Inner drive shapes deep character.'}\n\n${result.natalLayer.karmicBaggage.soulPurpose || ''}`;
      const rawSummaryFallback = stripJayashreeIntro(`${result.masterSynthesis.overallTone || 'A balanced planetary outlook for the future.'}\n\n${result.masterSynthesis.career || ''}\n\n${result.masterSynthesis.finance || ''}`);

      const finalCharacteristics = await ensureValidSection(dataCharacteristics.characteristics, rawCharFallback, lang);
      const finalDarkSecret = await ensureValidSection(dataDarkSecret.darkSecret, rawSecretFallback, lang);
      const finalSummary = await ensureValidSection(dataSummary.summary, rawSummaryFallback, lang);

      const rawYogasFallback = await Promise.all(
        (result.aiGeneratedNarrative?.yogas || [{ name: "Dasha Yoga", significance: stripJayashreeIntro(result.masterSynthesis.overallTone) }]).map(async y => ({
          name: await translateText(y.name, lang),
          impact: await translateText(stripJayashreeIntro(asText(y.significance) || result.masterSynthesis.overallTone), lang)
        }))
      );
      const finalYogas = (dataYogas.yogas || []).filter((y: any) => (y?.impact || "").trim().length > 10).length > 0
        ? dataYogas.yogas
        : rawYogasFallback;

      const rawDoshasFallback = await Promise.all(
        (result.aiGeneratedNarrative?.doshas || [{ name: "Karmic Challenge", significance: result.natalLayer.karmicBaggage.description, remedy: result.natalLayer.karmicBaggage.soulPurpose }]).map(async d => ({
          name: await translateText(d.name, lang),
          impact: await translateText(asText(d.significance) || result.natalLayer.karmicBaggage.description, lang),
          remedy: await translateText(d.remedy || result.natalLayer.karmicBaggage.soulPurpose, lang)
        }))
      );
      const finalDoshas = (dataDoshas.doshas || []).filter((d: any) => (d?.impact || "").trim().length > 10).length > 0
        ? dataDoshas.doshas
        : rawDoshasFallback;

      const engineRoadmap6 = result.timingLayer.twelveMonthRoadmap.slice(0, 6);
      const fallbackTimeline = await Promise.all(
        engineRoadmap6.map(async r => ({
          dateRange: await translateText(r.month, lang),
          impact: await translateText(r.prediction, lang)
        }))
      );

      const validTimelineItems = (dataTimeline.timeline || []).filter((t: any) => (t?.impact || "").trim().length > 10);
      const finalTimeline = validTimelineItems.length >= 4
        ? await Promise.all(
            validTimelineItems.map(async (t: any) => ({
              ...t,
              dateRange: await translateText(t.dateRange || "", lang)
            }))
          )
        : fallbackTimeline;

      const rawGocharaFallback = await Promise.all([
        {
          name: await translateText(result.timingLayer.lifeClock.currentPhase || "Current Transit Phase", lang),
          impact: await translateText(result.timingLayer.lifeClock.description || result.masterSynthesis.overallTone, lang),
          remedy: await translateText(result.timingLayer.lifeClock.emotionalValidation || "", lang)
        }
      ]);
      const finalGochara = (dataGochara.gochara || []).filter((g: any) => (g?.impact || "").trim().length > 10).length > 0
        ? dataGochara.gochara
        : rawGocharaFallback;

      const premiumDataPayload = {
        characteristics: finalCharacteristics,
        darkSecret: finalDarkSecret,
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

      setPremiumDataForPdf(premiumDataPayload);
      
      // Wait for React to flush the state to the hidden PdfTemplate component
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!premiumPdfRef.current) throw new Error("Premium PDF ref not found");
      
      // Generate PDF
      const canvas = await html2canvas(premiumPdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
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
        ashirvadaTitle: await tx("Astrologer's Blessing (Ashirvada)", pdfLanguage),
        ashirvadaValue: await tx(ashirvada || "", pdfLanguage),
        yogasTitle: await tx("Special Planetary Combinations (Yogas)", pdfLanguage),
        doshasTitle: await tx("Karmic Challenges (Doshas)", pdfLanguage),
        remedyTitle: await tx("Remedy", pdfLanguage),
        timelineTitle: await tx("Next 6-12 Months Timeline", pdfLanguage),
        gocharaTitle: await tx("Current Planetary Transits (Gochara)", pdfLanguage),
        summaryTitle: await tx("Astrologer's Summary", pdfLanguage),
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

      const parseGeminiJSON = (raw: string): Record<string, unknown> => {
        try {
          const match = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/({[\s\S]*})/);
          return match ? JSON.parse(match[1]) : JSON.parse(raw);
        } catch {
          return {};
        }
      };

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
      const a4PlanetPositions = session.result.planets.map((p: {name: string; house: number; rashi?: {english?: string}}) => `${p.name} in House ${p.house} (${p.rashi?.english || ''})`).join(", ");
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

      const [resYogas, resDoshas, resCharacteristics, resDarkSecret, resTimeline, resGochara, resSummary] = await Promise.all([
        askGemini("Generate Yogas", promptYogas, geminiApiKey, pdfLanguage),
        askGemini("Generate Doshas", promptDoshas, geminiApiKey, pdfLanguage),
        askGemini("Generate Characteristics", promptCharacteristics, geminiApiKey, pdfLanguage),
        askGemini("Generate Dark Secret", promptDarkSecret, geminiApiKey, pdfLanguage),
        askGemini("Generate Timeline", promptTimeline, geminiApiKey, pdfLanguage),
        askGemini("Generate Gochara", promptGochara, geminiApiKey, pdfLanguage),
        askGemini("Generate Summary", promptSummary, geminiApiKey, pdfLanguage)
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
      const finalYogas = (parsedYogas || []).filter((y: any) => (y?.impact || "").trim().length > 10).length > 0 ? parsedYogas : rawYogasFallback;

      const rawDoshasFallback = await Promise.all(
        (result.aiGeneratedNarrative?.doshas || [{ name: "Karmic Challenge", significance: result.natalLayer.karmicBaggage.description, remedy: result.natalLayer.karmicBaggage.soulPurpose }]).map(async d => ({
          name: await translateText(d.name, pdfLanguage),
          impact: await translateText(asText(d.significance) || result.natalLayer.karmicBaggage.description, pdfLanguage),
          remedy: await translateText(d.remedy || result.natalLayer.karmicBaggage.soulPurpose, pdfLanguage)
        }))
      );
      const finalDoshas = (parsedDoshas || []).filter((d: any) => (d?.impact || "").trim().length > 10).length > 0 ? parsedDoshas : rawDoshasFallback;

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

      const rawGocharaFallback = await Promise.all([
        {
          name: await translateText(result.timingLayer.lifeClock.currentPhase || "Current Transit Phase", pdfLanguage),
          impact: await translateText(result.timingLayer.lifeClock.description || result.masterSynthesis.overallTone, pdfLanguage),
          remedy: await translateText(result.timingLayer.lifeClock.emotionalValidation || "", pdfLanguage)
        }
      ]);
      const finalGochara = (parsedGochara || []).filter((g: any) => (g?.impact || "").trim().length > 10).length > 0 ? parsedGochara : rawGocharaFallback;

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

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6 border-b border-amber-200 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-amber-900 mb-3 flex items-center gap-3">
            {t("ramanbhavishya.yourPersonalReading", "Your Personal Reading")}
          </h2>
          <p className="text-base text-amber-700 max-w-2xl leading-relaxed">
            {t("ramanbhavishya.personalReadingDesc", "A deeply empathetic translation of your unique birth chart, your current life chapter, and the present cosmic environment.")}
          </p>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <span className="text-sm font-bold text-indigo-900 uppercase">PDF Language:</span>
            {[
              { code: "en", name: "English" },
              { code: "kn", name: "Kannada" },
              { code: "ta", name: "Tamil" },
              { code: "te", name: "Telugu" },
              { code: "hi", name: "Hindi" }
            ].map(lang => (
              <label key={lang.code} className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="pdfLang" 
                  value={lang.code} 
                  checked={pdfLanguage === lang.code} 
                  onChange={() => {
                    pdfLanguagePicked.current = true;
                    setPdfLanguage(lang.code as "en" | "hi" | "kn" | "te" | "ta");
                  }} 
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-sm font-medium text-slate-700 uppercase">{lang.name}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={generatePDF}
            disabled={isGeneratingPdf || isGeneratingPremiumPdf || isGeneratingA4Pdf}
            className={`group flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_5px_15px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.3)] border border-amber-400 shrink-0 ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
          >
            {isGeneratingPdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            {isGeneratingPdf ? "Generating..." : "Download PDF"}
          </button>

          <button 
            onClick={generatePremiumPDF}
            disabled={isGeneratingPdf || isGeneratingPremiumPdf || isGeneratingA4Pdf}
            className={`group flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_5px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)] border border-indigo-400 shrink-0 ${isGeneratingPremiumPdf ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
          >
            {isGeneratingPremiumPdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-lg">📄✨</span>
            )}
            {isGeneratingPremiumPdf ? "Crafting Premium..." : "Premium PDF"}
          </button>

          <button 
            onClick={generateA4PDF}
            disabled={isGeneratingPdf || isGeneratingPremiumPdf || isGeneratingA4Pdf}
            className={`group flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_5px_15px_rgba(5,150,105,0.3)] hover:shadow-[0_8px_20px_rgba(5,150,105,0.4)] border border-emerald-400 shrink-0 ${isGeneratingA4Pdf ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
          >
            {isGeneratingA4Pdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-lg">📑</span>
            )}
            {isGeneratingA4Pdf ? "Crafting A4 PDF..." : "Premium A4 PDF"}
          </button>
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
      <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none">
        {pdfTranslations && pdfDeepInsights && (
          <PdfTemplate 
            ref={pdfRef} 
            theme="sunrise" 
            session={session} 
            predictions={currentMindset ? [currentMindset, ...predictions] : predictions} 
            translations={pdfTranslations}
            deepInsights={pdfDeepInsights}
          />
        )}
      </div>
      
      
      {/* Hidden Premium PDF Template Container */}
      <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none">
        {pdfTranslations && pdfDeepInsights && premiumDataForPdf && (
          <PdfTemplate 
            ref={premiumPdfRef} 
            theme="sunrise" 
            session={session} 
            predictions={premiumPredictions ?? (currentMindset ? [currentMindset, ...predictions] : predictions)} 
            translations={pdfTranslations}
            deepInsights={pdfDeepInsights}
            premiumData={premiumDataForPdf}
          />
        )}
      </div>

      {/* Hidden A4 Multi-Page Premium PDF Template Container */}
      {/* NOTE: Must use visibility:hidden NOT opacity:0 — html2canvas needs element to be painted */}
      <div id="a4-premium-pdf-container" style={{ position: "fixed", left: "-9999px", top: 0, visibility: "hidden", pointerEvents: "none" }}>
        {a4PdfTranslations && a4PdfDeepInsights && a4PremiumDataForPdf && (
          <PdfTemplate
            ref={a4PdfRef}
            theme="sunrise"
            session={session}
            predictions={currentMindset ? [currentMindset, ...predictions] : predictions}
            translations={a4PdfTranslations}
            deepInsights={a4PdfDeepInsights}
            premiumData={a4PremiumDataForPdf}
          />
        )}
      </div>
    </div>
  );

}
