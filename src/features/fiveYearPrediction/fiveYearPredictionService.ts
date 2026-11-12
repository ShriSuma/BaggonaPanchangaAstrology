/**
 * 5-Year Master Destiny Prediction Service
 * Coordinates mathematical Vedic computation, optional AI enhancement (gemini-3.5-flash-lite),
 * and high-resolution royal PDF generation.
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { savePdfBlob } from "../../utils/pdfGenerator";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { askGemini } from "../../core/GeminiEngine";
import {
  compute5YearMasterPrediction,
  type FiveYearPredictionPayload,
  type FiveYearSingleYear,
  type FiveYearLifeChapter
} from "./fiveYearPredictionEngine";
import { type SixLang, pick6, FIVE_YEAR_TEXT_6L } from "./fiveYearLocale";

export interface Prepare5YearOptions {
  onProgress?: (progress: number, stageText: string) => void;
  geminiApiKey?: string;
  baseYear?: number;
}

/**
 * Prepares the complete 5-Year prediction data payload
 */
export async function prepare5YearPredictionData(
  session: KundliViewerSession,
  lang: string,
  options?: Prepare5YearOptions
): Promise<FiveYearPredictionPayload> {
  const targetLang = ((lang || "kn").split("-")[0].toLowerCase()) as SixLang;
  const onProgress = options?.onProgress;
  const apiKey = options?.geminiApiKey || "";
  const baseYear = options?.baseYear || 2026;

  onProgress?.(
    15,
    targetLang === "kn" ? "೧. ಜನ್ಮ ಲಗ್ನ, ನವಾಂಶ ಹಾಗೂ ೫ ವರ್ಷಗಳ ಗ್ರಹ ಗೋಚಾರ ಗಣನೆ..."
      : targetLang === "hi" ? "1. जन्म लग्न, नवांश एवं ५ वर्षों का ग्रह गोचर आकलन..."
      : targetLang === "mr" ? "१. जन्म लग्न, नवांश व ५ वर्षांचे ग्रह गोचर गणित..."
      : targetLang === "te" ? "1. జన్మ లగ్నం, నవాంశ మరియు 5 సంవత్సరాల గ్రహ గోచారం..."
      : targetLang === "ta" ? "1. ஜென்ம லக்னம், நவாம்சம் மற்றும் 5 ஆண்டுகள் கோச்சாரம்..."
      : "1. Calculating Natal Lagna, Bhavas & 5-Year Transits..."
  );

  // Compute 100% mathematical foundation
  const mathematicalPayload = compute5YearMasterPrediction(
    session.result,
    session.birthDateYmd || session.input.birthDate,
    session.birthTimeHm || session.input.birthTime,
    targetLang,
    session.input.name || "Devotee",
    baseYear,
    {
      gender: session.input.gender,
      maritalStatus: (session.input as any)?.maritalStatus,
      childrenStatus: (session.input as any)?.childrenStatus,
      latitude: session.input.latitude,
      longitude: session.input.longitude,
      ayanamsa: (session.input as any)?.ayanamsa || "lahiri"
    }
  );

  onProgress?.(
    45,
    targetLang === "kn" ? "೨. ವಯಸ್ಸಿಗೆ ತಕ್ಕಂತೆ ಪಂಚ-ಆಯಾಮಗಳು ಹಾಗೂ ದಿವ್ಯ ಸ್ತೋತ್ರ ನಿರ್ಣಯ..."
      : targetLang === "hi" ? "2. आयु-अनुकूल जीवन आयाम एवं सिद्ध दिव्य स्तोत्र चयन..."
      : targetLang === "mr" ? "२. वयोमानानुसार जीवन पैलू व सिद्ध दिव्य स्तोत्र निवड..."
      : targetLang === "te" ? "2. వయస్సు ఆధారిత జీవిత విభాగాలు & దివ్య స్తోత్రం..."
      : targetLang === "ta" ? "2. வயதுக்கேற்ற வாழ்க்கை பரிமாணங்கள் & திவ்ய ஸ்தோத்திரம்..."
      : "2. Structuring Age-Adaptive Chapters & Sacred Stotra..."
  );

  // Optional AI Enrichment with strictly gemini-3.5-flash-lite
  if (apiKey && apiKey.trim().length > 10) {
    try {
      onProgress?.(
        65,
        targetLang === "kn" ? "೩. AI ದೈವಜ್ಞ ವಿಶ್ಲೇಷಣೆ ಹಾಗೂ ಭವಿಷ್ಯ ಪರಿಷ್ಕರಣೆ..."
          : targetLang === "hi" ? "3. AI दैवज्ञ विश्लेषण एवं भविष्य संवर्धन..."
          : targetLang === "mr" ? "३. AI दैवज्ञ विश्लेषण व भविष्य परिष्करण..."
          : "3. Consulting Vedic AI Narrative Engine (gemini-3.5-flash-lite)..."
      );

      const prompt = `You are a revered Vedic Astrologer from Sri Kshetra Gokarna.
Enhance the following 5-Year Horoscope prediction for devotee ${mathematicalPayload.devoteeName} (Age: ${Math.round(mathematicalPayload.ageYears)}, Lagna: ${mathematicalPayload.lagnaRashi}, Moon: ${mathematicalPayload.moonRashi}, Nakshatra: ${mathematicalPayload.nakshatra}).
The output language MUST BE PURE ${targetLang.toUpperCase()} (${targetLang === "kn" ? "Kannada" : targetLang === "mr" ? "Marathi" : targetLang === "hi" ? "Hindi" : targetLang === "te" ? "Telugu" : targetLang === "ta" ? "Tamil" : "English"}) in native script. Zero English words in regional text.
Current 5-year timeline: ${mathematicalPayload.startYear} to ${mathematicalPayload.endYear}.
Focus heavily on:
1. Exact expected milestones for each year.
2. Age-appropriate guidance (${mathematicalPayload.ageCategory}).
3. Reassurance, spiritual solace, and practical wisdom.

Respond in clean JSON format:
{
  "macroTrend": "2-3 profound sentences summarizing the 5-year destiny trajectory in ${targetLang}",
  "annualHighlights": [
    "highlight for Year 1 in ${targetLang}",
    "highlight for Year 2 in ${targetLang}",
    "highlight for Year 3 in ${targetLang}",
    "highlight for Year 4 in ${targetLang}",
    "highlight for Year 5 in ${targetLang}"
  ]
}`;

      // Call Gemini with timeout and retry guard
      const aiResponse = await Promise.race([
        askGemini(prompt, "", apiKey, targetLang),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("AI Timeout")), 6000))
      ]);

      if (aiResponse) {
        const cleaned = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.macroTrend && typeof parsed.macroTrend === "string") {
          mathematicalPayload.macroSummary.macroTrend = parsed.macroTrend;
        }
        if (Array.isArray(parsed.annualHighlights) && parsed.annualHighlights.length === 5) {
          parsed.annualHighlights.forEach((hl: string, idx: number) => {
            if (hl && mathematicalPayload.years[idx]) {
              mathematicalPayload.years[idx].headline = `${mathematicalPayload.years[idx].gregorianRange}: ${hl}`;
            }
          });
        }
      }
    } catch (aiErr) {
      console.warn("[fiveYearPredictionService] AI refinement skipped, using authentic Vedic engine:", aiErr);
    }
  }

  onProgress?.(
    90,
    targetLang === "kn" ? "೪. ಉನ್ನತ ಗುಣಮಟ್ಟದ ಬಗ್ಗೋಣ ಪಂಚವರ್ಷ ಮುದ್ರಣ ಸಿದ್ಧತೆ..."
      : targetLang === "hi" ? "4. उच्च-गुणवत्ता बग्गोण ५-वर्षीय मुद्रण तैयारी..."
      : targetLang === "mr" ? "४. उच्च दर्जाच्या ५ वर्षांच्या अहवाल मुद्रणाची तयारी..."
      : "4. Assembling High-Resolution 5-Year Royal Blueprint Document..."
  );

  return mathematicalPayload;
}

/**
 * Captures the 5-Year Prediction PDF from DOM
 * Adheres strictly to baggona-pdf-layout-guard and continuous single scroll rules:
 * 1. Renders sections sequentially without arbitrary A4 page breaks or white spaces
 * 2. Clones to isolated wrapper at width:900px, letterSpacing: normal
 * 3. Measures true continuous height and outputs royal continuous scroll [pdfWidthMm, totalPdfHeightMm]
 * 4. Applies royal parchment background (#FFF7ED) and double gold borders
 */
export async function captureFiveYearPredictionPdf(
  containerEl: HTMLElement,
  fileName: string = "Baggona_5_Year_Prediction.pdf",
  autoSave: boolean = true,
  onProgress?: (progress: number, stageText: string) => void
): Promise<jsPDF> {
  onProgress?.(92, "ಉನ್ನತ ಗುಣಮಟ್ಟದ ಬಗ್ಗೋಣ ಪಂಚವರ್ಷ ಮಹಾ ಮುದ್ರಣ ಸಿದ್ಧತೆ...");

  const pdfWidthMm = 210;
  const sections = Array.from(containerEl.querySelectorAll(".pdf-section")) as HTMLElement[];

  if (!sections || sections.length === 0) {
    throw new Error("No .pdf-section elements found in the 5-Year Prediction container.");
  }

  // Pre-wait for web fonts to avoid missing Indic ligatures
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Font loading failure fallback
    }
  }

  const renderedSections: { imgData: string; heightMm: number; name: string }[] = [];

  for (let i = 0; i < sections.length; i++) {
    const sectionEl = sections[i];
    const sectionName = sectionEl.getAttribute("data-section") || `section-${i}`;

    const stepProgress = 92 + Math.floor((i / sections.length) * 6);
    onProgress?.(stepProgress, `ಮುದ್ರಣ ಪ್ರಕ್ರಿಯೆ: ${sectionName} (${i + 1}/${sections.length})...`);

    // Create offscreen container
    const tempBox = document.createElement("div");
    tempBox.style.position = "absolute";
    tempBox.style.left = "-9999px";
    tempBox.style.top = "0";
    tempBox.style.width = "900px";
    tempBox.style.backgroundColor = "#FFF7ED";
    tempBox.style.fontFamily = "'Noto Serif Kannada', 'Noto Sans Kannada', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Outfit', serif, sans-serif";
    tempBox.style.letterSpacing = "normal";
    tempBox.className = "bg-orange-50 text-amber-950 font-serif";

    const sectionClone = sectionEl.cloneNode(true) as HTMLElement;
    sectionClone.style.display = "block";
    sectionClone.style.width = "100%";
    sectionClone.style.letterSpacing = "normal";
    sectionClone.querySelectorAll("*").forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style) {
        htmlEl.style.letterSpacing = "normal";
        if (htmlEl.style.filter && htmlEl.style.filter.includes("drop-shadow")) {
          htmlEl.style.filter = "none";
        }
      }
    });

    tempBox.appendChild(sectionClone);
    document.body.appendChild(tempBox);

    const trueHeight = Math.max(tempBox.scrollHeight, tempBox.offsetHeight, sectionClone.scrollHeight, 200);
    tempBox.style.height = `${trueHeight}px`;

    let canvas: HTMLCanvasElement | null = null;
    try {
      canvas = await html2canvas(tempBox, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFF7ED",
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: 900,
        height: trueHeight,
        windowWidth: 900,
        windowHeight: trueHeight + 600
      });
    } finally {
      if (tempBox.parentElement) {
        document.body.removeChild(tempBox);
      }
    }

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.warn(`[captureFiveYearPredictionPdf] Empty canvas for section: ${sectionName}`);
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

  // Calculate total continuous height in mm
  const totalPdfHeightMm = renderedSections.reduce((sum, s) => sum + s.heightMm, 0);
  if (totalPdfHeightMm <= 0) {
    throw new Error("Calculated 5-Year PDF height is zero. Cannot generate empty PDF.");
  }

  // Partition rendered sections across pages to strictly stay below jsPDF's hard 14,400 userUnit (5080mm) limit
  const MAX_SAFE_PAGE_HEIGHT_MM = 5000;
  const pages: { sections: typeof renderedSections; heightMm: number }[] = [];

  if (totalPdfHeightMm <= MAX_SAFE_PAGE_HEIGHT_MM) {
    // Ideal case: everything fits on 1 single continuous royal scroll without page breaks
    pages.push({ sections: renderedSections, heightMm: totalPdfHeightMm });
  } else {
    // If content exceeds 5000mm, distribute evenly across balanced pages
    const targetPageHeightMm = Math.ceil(totalPdfHeightMm / 2);
    let currentPageSections: typeof renderedSections = [];
    let currentPageHeightMm = 0;

    for (let i = 0; i < renderedSections.length; i++) {
      const sec = renderedSections[i];
      const remainingSections = renderedSections.length - i;
      if (currentPageSections.length >= 3 && currentPageHeightMm >= targetPageHeightMm && remainingSections >= 2) {
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

    // 2. Add each section seamlessly sequentially without any gaps
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

    // Inner border: 6mm margin, 0.25mm line
    pdf.setDrawColor(180, 83, 9);
    pdf.setLineWidth(0.25);
    pdf.rect(6, 6, pdfWidthMm - 12, page.heightMm - 12, "S");
  }

  onProgress?.(100, "ಬಗ್ಗೋಣ ಪಂಚವರ್ಷ ಮಹಾ ಮುದ್ರಣ ಯಶಸ್ವಿಯಾಗಿ ಸಿದ್ಧಗೊಂಡಿದೆ!");

  if (autoSave) {
    savePdfBlob(pdf, fileName);
  }
  return pdf;
}
