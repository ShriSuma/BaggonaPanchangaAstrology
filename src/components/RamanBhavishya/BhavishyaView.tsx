import { useState, useRef } from "react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { usePredictionEngine } from "./usePredictionEngine";
import type { TranslatedPrediction } from "./usePredictionEngine";
import { PdfTemplate, PdfTranslations } from "./PdfTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";
import { useAppStore } from "../../stores/appStore";
import { translateText } from "../../utils/translator";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";

export default function BhavishyaView() {
  const { predictions, isLoading } = usePredictionEngine();
  const { t } = useTranslation();
  const session = useKundliViewerStore((state) => state.session);
  const language = useAppStore((state) => state.language);
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfTranslations, setPdfTranslations] = useState<PdfTranslations | null>(null);
  
  const pdfRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    
    try {
      if (!session) throw new Error("No session");

      const moonPlanet = session.result.planets.find(p => p.name === 'Moon');
      const baseNakshatra = moonPlanet ? (moonPlanet.nakshatra.sanskrit || moonPlanet.nakshatra.english) : 'Unknown';
      
      const ashirvadaText = `Based on your planetary alignments and current cosmic era, may the divine forces grant you strength, clarity, and peace. Trust in your inner resilience and allow the universe to guide your path.`;

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
      };
      
      setPdfTranslations(translatedData);

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-amber-700 font-medium tracking-wide animate-pulse">
          Translating cosmic energies into guidance...
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
        
        <button 
          onClick={generatePDF}
          disabled={isGeneratingPdf}
          className={`group flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.4)] border border-amber-400 shrink-0 ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
        >
          {isGeneratingPdf ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {isGeneratingPdf ? "Generating..." : "Download PDF"}
        </button>
      </div>

      {isGeneratingPdf && (
        <div className="absolute inset-0 bg-amber-50/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl animate-fade-in">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6 shadow-xl"></div>
          <p className="text-2xl text-amber-900 font-serif font-bold tracking-wide animate-pulse">
            Crafting your Patrika PDF...
          </p>
          <p className="text-amber-700 mt-2 font-medium">This may take a few moments</p>
        </div>
      )}

      <div className="relative z-10 space-y-12">
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
                  
                  <div className="relative z-10">
                    <p className="text-slate-700 leading-relaxed text-[17px] font-medium whitespace-pre-line">
                      {pred.translatedText}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hidden PDF Template Container */}
      <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none">
        {pdfTranslations && (
          <PdfTemplate 
            ref={pdfRef} 
            theme="sunrise" 
            session={session} 
            predictions={predictions} 
            translations={pdfTranslations}
          />
        )}
      </div>
    </div>
  );
}
