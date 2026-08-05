import { useState, useRef } from "react";
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
import { askGemini } from "../../core/GeminiEngine";
import { PremiumPDFTemplate } from "../pdf/PremiumPDFTemplate";
import { generatePDFFromElement } from "../../utils/pdfGenerator";


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
  const [premiumDataForPdf, setPremiumDataForPdf] = useState<PremiumData | null>(null);
  const geminiApiKey = useAppStore((state) => state.geminiApiKey);

  const pdfRef = useRef<HTMLDivElement>(null);
  const premiumPdfRef = useRef<HTMLDivElement>(null);

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
      
      const imgData = canvas.toDataURL("image/png");
      
      // Fixed width in mm (A4 width = 210)
      const pdfWidth = 210; 
      // Calculate dynamic height based on the canvas aspect ratio
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Create a PDF with a CUSTOM page height so it NEVER cuts off the content across multiple pages!
      const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Baggona_Prediction_${session?.input.name.replace(/\s+/g, '_') || 'Reading'}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  
  
  const generatePremiumPDF = async () => {
    if (!session || isGeneratingPremiumPdf) return;
    setIsGeneratingPremiumPdf(true);
    
    try {
      if (!session) throw new Error("No session");

      const moonPlanet = session.result.planets.find(p => p.name === 'Moon');
      const baseNakshatra = moonPlanet ? (moonPlanet.nakshatra.sanskrit || moonPlanet.nakshatra.english) : 'Unknown';
      
      const ashirvadaText = ashirvada || `Based on your planetary alignments and current cosmic era, may the divine forces grant you strength, clarity, and peace. Trust in your inner resilience and allow the universe to guide your path.`;

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

      let formattedDob = "";
      try {
        const dobDate = parseISO(session.input.birthDate);
        formattedDob = format(dobDate, "dd MMM yyyy");
      } catch (e) {
        formattedDob = session.input.birthDate;
      }
      const dobWithTime = `${formattedDob}, ${session.input.birthTime}`;

      const translatedData: PdfTranslations = {
        title: await translateText("Baggona Panchanga", language),
        subtitle: await translateText("Detailed Astrology Reading", language),
        nameLabel: await translateText("Name", language),
        nameValue: await translateText(session.input.name, language),
        dobLabel: await translateText("Birth Details", language),
        dobValue: await translateText(dobWithTime, language),
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
      };
      
      setPdfTranslations(translatedData);

      const deepInsights: Record<string, string> = {};
      for (const pred of predictions) {
        deepInsights[pred.translatedCategory] = pred.translatedText;
      }
      setPdfDeepInsights(deepInsights);

      const result = await generateMasterPrediction(session.result, {
        name: session.input.name,
        birthDate: session.input.birthDate,
        birthTime: session.input.birthTime,
        latitude: session.input.latitude,
        longitude: session.input.longitude,
        lang: language
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

      const promptYogas = `
      You are an expert Vedic astrologer. Generate highly engaging narrative in JSON format.
      The output must be strictly valid JSON and MUST be entirely in this language code: ${language}.
      IMPORTANT: If the target language is Kannada (kn), Telugu (te), or Tamil (ta), you MUST use ONLY the native script of that language. Absolutely DO NOT use Devanagari/Hindi/Sanskrit script or English script in the output (e.g., do not write 'गज' for Gaja, write it in the native script). Translate all Yoga names strictly into the requested language script.
      
      Data - Yogas: ${JSON.stringify(result.natalLayer.yogas)}
      
      CRITICAL INSTRUCTION: For each Yoga, you MUST write at least TWO full, highly descriptive paragraphs for the 'impact' field.
      
      Expected JSON Structure:
      {
        "yogas": [
          {
            "name": "Yoga Name",
            "impact": "Write AT LEAST TWO detailed paragraphs explaining how it impacts them emotionally and practically."
          }
        ]
      }
      `;
      
      const promptDoshas = `
      You are an expert Vedic astrologer. Generate highly engaging narrative in JSON format.
      The output must be strictly valid JSON and MUST be entirely in this language code: ${language}.
      IMPORTANT: If the target language is Kannada (kn), Telugu (te), or Tamil (ta), you MUST use ONLY the native script of that language. Absolutely DO NOT use Devanagari/Hindi/Sanskrit script or English script in the output. Translate all Dosha names strictly into the requested language script.
      
      Data - Doshas/Karmic Baggage: ${JSON.stringify(result.natalLayer.karmicBaggage)}
      Data - Shadow Self: ${JSON.stringify(result.natalLayer.shadowSelf)}
      Data - Planets: ${JSON.stringify(session.result.planets)}
      
      CRITICAL INSTRUCTION: Analyze the planetary data and karmic baggage to identify AT LEAST 2 doshas or deep karmic challenges (such as Mangalik, Kala Sarpa, Kemadruma, Rahu/Ketu afflictions, etc). For each Dosha, you MUST write at least TWO full, highly descriptive paragraphs for the 'impact' field. If no traditional dosha is found, identify strong negative planetary influences and frame them as Doshas. YOU MUST RETURN AT LEAST TWO DOSHAS.
      
      Expected JSON Structure:
      {
        "doshas": [
          {
            "name": "Dosha Name",
            "impact": "Write AT LEAST TWO detailed paragraphs explaining how it is causing suffering.",
            "remedy": "Actionable remedy to resolve this."
          }
        ]
      }
      `;

      const promptCharacteristics = `
      You are an expert Vedic astrologer. Generate highly engaging narrative in JSON format.
      The output must be strictly valid JSON and MUST be entirely in this language code: ${language}.
      IMPORTANT: If the target language is Kannada (kn), Telugu (te), or Tamil (ta), you MUST use ONLY the native script of that language. Absolutely DO NOT use Devanagari/Hindi/Sanskrit script or English script in the output.
      
      Data - Core Personality: ${JSON.stringify(predictions.filter(p => p.translatedCategory === "Core Personality" || p.translatedCategory === "Basic Nature" || p.category === "Basic Nature"))}
      Data - Karmic & Shadow: ${JSON.stringify(result.natalLayer)}
      Data - Planets: ${JSON.stringify(session.result.planets)}
      
      CRITICAL INSTRUCTION: Analyze the basic nature and personality deeply. Write EXACTLY 2 paragraphs explaining the deep personality traits, behavior, and true nature of the person based on the above data.
      You MUST explicitly mention if the person has any negative traits, bad influences, addictions (like alcohol, gambling, or bad habits), or a tendency to lie/deceive, based on the karmic and planetary afflictions. Be ruthlessly honest.
      
      Expected JSON Structure:
      {
        "characteristics": [
          {
            "impact": "Write EXACTLY TWO detailed paragraphs (separated by \\n) explaining their personality, including any dark or addictive tendencies."
          }
        ]
      }
      `;

      const promptDarkSecret = `
      You are an expert Vedic astrologer. Generate highly engaging narrative in JSON format.
      The output must be strictly valid JSON and MUST be entirely in this language code: ${language}.
      IMPORTANT: If the target language is Kannada (kn), Telugu (te), or Tamil (ta), you MUST use ONLY the native script of that language. Absolutely DO NOT use Devanagari/Hindi/Sanskrit script or English script in the output.
      
      Data - Shadow Self & Karmic Baggage: ${JSON.stringify(result.natalLayer.shadowSelf)}
      
      CRITICAL INSTRUCTION: Expose the darkest secret, hidden flaws, or karmic baggage of this person. Write EXACTLY 2 paragraphs. Be deep and mystical.
      
      Expected JSON Structure:
      {
        "darkSecret": [
          {
            "impact": "Write EXACTLY TWO detailed paragraphs (separated by \n) explaining their dark secret."
          }
        ]
      }
      `;

      const [resYogas, resDoshas, resCharacteristics, resDarkSecret] = await Promise.all([
        askGemini("Generate Premium Yogas", promptYogas, geminiApiKey, language),
        askGemini("Generate Premium Doshas", promptDoshas, geminiApiKey, language),
        askGemini("Generate Characteristics", promptCharacteristics, geminiApiKey, language),
        askGemini("Generate Dark Secret", promptDarkSecret, geminiApiKey, language)
      ]);

      const dataYogas = parseGeminiJSON(resYogas);
      const dataDoshas = parseGeminiJSON(resDoshas);
      const dataCharacteristics = parseGeminiJSON(resCharacteristics);
      const dataDarkSecret = parseGeminiJSON(resDarkSecret);

      setPremiumDataForPdf({
        characteristics: dataCharacteristics.characteristics || [],
        darkSecret: dataDarkSecret.darkSecret || [],
        yogas: dataYogas.yogas || [],
        doshas: dataDoshas.doshas || []
      });
      
      // Wait for React to flush the state to the hidden PdfTemplate component
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!premiumPdfRef.current) throw new Error("Premium PDF ref not found");
      
      // Generate PDF
      const canvas = await html2canvas(premiumPdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      
      const pdfWidth = 210; 
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Baggona_Premium_${session?.input.name.replace(/\s+/g, '_') || 'Reading'}.pdf`);

    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPremiumPdf(false);
      setPremiumDataForPdf(null); // Cleanup
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
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={generatePDF}
            disabled={isGeneratingPdf || isGeneratingPremiumPdf}
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
            disabled={isGeneratingPdf || isGeneratingPremiumPdf}
            className={`group flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_5px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)] border border-indigo-400 shrink-0 ${isGeneratingPremiumPdf ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
          >
            {isGeneratingPremiumPdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-lg">📄✨</span>
            )}
            {isGeneratingPremiumPdf ? "Crafting Premium..." : "Premium PDF"}
          </button>
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
            predictions={currentMindset ? [currentMindset, ...predictions] : predictions} 
            translations={pdfTranslations}
            deepInsights={pdfDeepInsights}
            premiumData={premiumDataForPdf}
          />
        )}
      </div>
    </div>
  );

}
