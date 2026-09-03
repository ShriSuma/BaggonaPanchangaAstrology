import React, { useState, useMemo } from "react";
import {
  BAGGONA_KNOWN_SAMVATSARAS,
  getSamvatsaraMetadata,
  calculateNavanayakagalu,
  generateUniversal104PageBook,
  type UniversalBookPageResponse,
  type SamvatsaraMetadata
} from "../../core/BaggonaUniversalBookEngine";
import {
  validateBaggonaBook,
  type BookValidationReport
} from "../../core/BaggonaBookValidationEngine";
import { BaggonaBookLoaderModal } from "../../components/admin/BaggonaBookLoaderModal";
import { UniversalBaggonaPageRenderer } from "../../components/admin/BaggonaBookPageTemplates";
import { KN_SAMVATSARAS } from "../../core/VedicCalculations";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const BaggonaBookPublisherDashboard: React.FC = () => {
  const [selectedShaka, setSelectedShaka] = useState<number>(1948); // Parabhava (2026-27) by default
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("all");
  const [viewingPageNumber, setViewingPageNumber] = useState<number>(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [showLoaderModal, setShowLoaderModal] = useState<boolean>(false);

  // Metadata & Validation
  const currentMeta: SamvatsaraMetadata = useMemo(() => {
    return getSamvatsaraMetadata(selectedShaka);
  }, [selectedShaka]);

  const navanayakagalu = useMemo(() => {
    return calculateNavanayakagalu(selectedShaka);
  }, [selectedShaka]);

  const validationReport: BookValidationReport = useMemo(() => {
    return validateBaggonaBook(selectedShaka);
  }, [selectedShaka]);

  const allPages: UniversalBookPageResponse[] = useMemo(() => {
    return generateUniversal104PageBook(selectedShaka);
  }, [selectedShaka]);

  // Filtered pages for grid
  const filteredPages = useMemo(() => {
    if (selectedSectionFilter === "all") return allPages;
    return allPages.filter((p) => p.sectionCategory === selectedSectionFilter);
  }, [allPages, selectedSectionFilter]);

  const currentPage = useMemo(() => {
    return allPages.find((p) => p.pageNumber === viewingPageNumber) || allPages[0];
  }, [allPages, viewingPageNumber]);

  // 60-Samvatsara Jovian Cycle mapping
  const ALL_60_SAMVATSARAS = useMemo(() => {
    return KN_SAMVATSARAS.map((kn, idx) => {
      // Current cycle: Prabhava is index 0 -> Shaka 1909 (1987) to Akshaya index 59 -> Shaka 1968 (2046)
      const shaka = 1909 + idx;
      const gregStart = shaka + 78;
      return {
        index: idx,
        shaka,
        nameKn: kn,
        label: `${idx + 1}. ಶ್ರೀ ${kn} ಸಂವತ್ಸರ (ಶಕ ${shaka} / ${gregStart}–${gregStart + 1})`
      };
    });
  }, []);

  // Single-Page High-Resolution PDF Download
  const handleDownloadSinglePagePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const pageEl = document.querySelector("#baggona-live-preview-page .pdf-page-a4") as HTMLElement;
      if (!pageEl) return;

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFDF7"
      });

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
      doc.save(`Baggona_Panchanga_${currentMeta.samvatsaraEn}_Page_${currentPage.pageNumber}.pdf`);
    } catch (err) {
      console.error("Single page PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Full 104-Page Press-Ready PDF Download (via HTML2Canvas, zero mojibake)
  const handleDownloadPressReadyPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const hiddenHost = document.getElementById("baggona-offscreen-render-host");
      if (!hiddenHost) throw new Error("Offscreen PDF container missing");

      const pageElements = hiddenHost.querySelectorAll(".pdf-page-a4");
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: "#FFFDF7"
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        if (i > 0) doc.addPage();
        doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      doc.save(`Baggona_Panchanga_${currentMeta.samvatsaraEn}_Shaka_${currentMeta.shakaYear}_104_Pages_Press_Ready.pdf`);
    } catch (err) {
      console.error("104-page PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
      setShowLoaderModal(false);
    }
  };

  return (
    <div className="bg-[#FFFDF7] border-3 border-amber-500/90 rounded-3xl p-6 shadow-2xl space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-2xl p-6 text-amber-50 border-2 border-amber-500/80 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">📖</span>
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Super Admin Exclusive • Master Publisher
              </span>
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% Pure Kannada
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-amber-100">
              ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ೧೦೪-ಪುಟಗಳ ಸಾರ್ವತ್ರಿಕ ಪ್ರಕಾಶನ ಎಂಜಿನ್
            </h1>
            <p className="text-sm text-amber-200/90 mt-1 max-w-3xl">
              ಯಾವುದೇ ಸಂವತ್ಸರದ ಬಗ್ಗೋಣ ಪಂಚಾಂಗವನ್ನು ೧ ರಿಂದ ೧೦೪ ಪುಟಗಳವರೆಗೆ ಕಟ್ಟುನಿಟ್ಟಾದ ದೃಗ್ಗಣಿತ ನಿಯಮಗಳೊಂದಿಗೆ, ಶೂನ್ಯ ಇಂಗ್ಲಿಷ್ ಸೋರಿಕೆಯೊಂದಿಗೆ ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಮುದ್ರಣ ಸಿದ್ಧಗೊಳಿಸುವ ತಂತ್ರಜ್ಞಾನ.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowLoaderModal(true)}
              disabled={isGeneratingPdf}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-xl flex items-center justify-center gap-2 border border-emerald-300/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <span>{isGeneratingPdf ? "⏳" : "📥"}</span>
              <span>{isGeneratingPdf ? "ಪಿಡಿಎಫ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "೧೦೪-ಪುಟಗಳ ಮುದ್ರಣ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Samvatsara Selector Bar (All 60 Samvatsaras + Custom Shaka Input) */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-black text-amber-950">ಸಂವತ್ಸರ ಮತ್ತು ಶಕ ವರ್ಷ ಆಯ್ಕೆ:</span>
            <select
              value={selectedShaka}
              onChange={(e) => {
                setSelectedShaka(Number(e.target.value));
                setViewingPageNumber(1);
              }}
              className="px-4 py-2.5 rounded-xl bg-white border-2 border-amber-400 font-bold text-amber-950 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500 max-w-md"
            >
              <optgroup label="ಅಧಿಕೃತ ಆವೃತ್ತಿಗಳು (Benchmark Editions)">
                <option value={1948}>೩೯. ಶ್ರೀ ಪರಾಭವ ಸಂವತ್ಸರ (೨೦೨೬–೨೦೨೭, ಶಕ ೧೯೪೮) • ಅಧಿಕ ಜ್ಯೇಷ್ಠ [13 ಮಾಸಗಳು]</option>
                <option value={1947}>೩೮. ಶ್ರೀ ವಿಶ್ವಾವಸು ಸಂವತ್ಸರ (೨೦೨೫–೨೦೨೬, ಶಕ ೧೯೪೭) • ಸಾಮಾನ್ಯ ವರ್ಷ [12 ಮಾಸಗಳು]</option>
                <option value={1946}>೩೭. ಶ್ರೀ ಕ್ರೋಧಿ ಸಂವತ್ಸರ (೨೦೨೪–೨೦೨೫, ಶಕ ೧೯೪೬) • ಸಾಮಾನ್ಯ ವರ್ಷ [12 ಮಾಸಗಳು]</option>
                <option value={1949}>೪೦. ಶ್ರೀ ಪ್ಲವಂಗ ಸಂವತ್ಸರ (೨೦೨೭–೨೦೨೮, ಶಕ ೧೯೪೯) • ಸಾಮಾನ್ಯ ವರ್ಷ [12 ಮಾಸಗಳು]</option>
              </optgroup>
              <optgroup label="ಸಂಪೂರ್ಣ ೬೦ ಸಂವತ್ಸರಗಳ ಚಕ್ರ (All 60 Samvatsaras Cycle)">
                {ALL_60_SAMVATSARAS.map((s) => (
                  <option key={s.shaka} value={s.shaka}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            </select>

            {/* Custom Shaka Year Input */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300">
              <span className="text-xs font-black text-amber-900">ಶಕ ವರ್ಷ:</span>
              <input
                type="number"
                value={selectedShaka}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val > 1000 && val < 3000) {
                    setSelectedShaka(val);
                    setViewingPageNumber(1);
                  }
                }}
                className="w-20 px-2 py-1 text-xs font-mono font-black border border-amber-300 rounded bg-amber-50 text-amber-950 focus:outline-none"
              />
              <span className="text-[11px] font-semibold text-slate-500">
                ({currentMeta.gregorianYears} CE)
              </span>
            </div>
          </div>

          {/* Verification Badge */}
          {validationReport.isGreenHighlighted && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-emerald-950 shadow-sm animate-pulse">
              <span className="text-xl">✅</span>
              <div>
                <div className="text-xs font-black uppercase text-emerald-800">ದೃಗ್ಗಣಿತ ಗುಣಮಟ್ಟ ಪ್ರಮಾಣೀಕೃತ</div>
                <div className="text-sm font-black text-emerald-950">೧೦೦% ಪರಿಶೀಲಿತ & ಮುದ್ರಣ ಸಿದ್ಧ (100% Verified)</div>
              </div>
            </div>
          )}
        </div>

        {/* Astronomical Quick Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-amber-200/80">
          <div className="bg-white p-2.5 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">ಶಕ ವರ್ಷ</span>
            <span className="text-sm font-black text-amber-950">{currentMeta.shakaYear}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">ಸಂವತ್ಸರ</span>
            <span className="text-sm font-black text-amber-950">ಶ್ರೀ {currentMeta.samvatsaraKn}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">ಗತ ಕಲ್ಯಾಬ್ದ</span>
            <span className="text-sm font-black text-amber-950">{currentMeta.gataKalyabda}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">ಕಲ್ಯಾದ್ಯಹರ್ಗಣ</span>
            <span className="text-sm font-black text-amber-950">{currentMeta.kalyadyahargana.toLocaleString()}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">ರಾಜ / ಮಂತ್ರಿ</span>
            <span className="text-sm font-black text-amber-950">
              {navanayakagalu.raja.lordKn} / {navanayakagalu.mantri.lordKn}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">ಮಾಸಗಳ ಸಂಖ್ಯೆ</span>
            <span className="text-sm font-black text-emerald-800">
              {currentMeta.hasAdhikaMasa ? "೧೩ (ಅಧಿಕ ಸಹಿತ)" : "೧೨ (ಸಾಮಾನ್ಯ)"}
            </span>
          </div>
        </div>
      </div>

      {/* Automated Validation & Quality Guard Report Card */}
      <div
        className={`rounded-2xl p-6 border-3 transition-all ${
          validationReport.isGreenHighlighted
            ? "bg-gradient-to-br from-emerald-50 via-emerald-100/40 to-green-50 border-emerald-500 shadow-xl ring-4 ring-emerald-400/20"
            : "bg-red-50 border-red-400"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{validationReport.isGreenHighlighted ? "🛡️" : "⚠️"}</span>
              <h2 className="text-lg font-black text-emerald-950">
                {validationReport.isGreenHighlighted
                  ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ೧೦೪-ಪುಟಗಳ ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ (100% Passed)"
                  : "ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ ಅಪೂರ್ಣ"}
              </h2>
            </div>
            <p className="text-xs text-emerald-900 font-medium mt-0.5">
              ೪ ಅಧಿಕೃತ ಪಂಚಾಂಗಗಳ (ಕ್ರೋಧಿ, ವಿಶ್ವಾವಸು, ಪರಾಭವ, ಪ್ಲವಂಗ) ನೈಜ ದತ್ತಾಂಶ ಹಾಗೂ ವಿನ್ಯಾಸಕ್ಕೆ ಅನುಗುಣವಾಗಿ ತಪಾಸಣೆ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-800">ಒಟ್ಟು ಅಂಕಗಳು:</span>
            <span className="text-xl font-black font-mono text-emerald-950 bg-white px-3 py-1 rounded-xl border border-emerald-400 shadow-sm">
              {validationReport.scorePercentage} / 100
            </span>
          </div>
        </div>

        {/* 9 Validation Check Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {validationReport.checks.map((chk) => (
            <div
              key={chk.id}
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                chk.passed
                  ? "bg-white/90 border-emerald-300 text-emerald-950 shadow-xs"
                  : "bg-red-100 border-red-300 text-red-950"
              }`}
            >
              <span className="text-base">{chk.passed ? "✅" : "❌"}</span>
              <div className="space-y-0.5">
                <div className="text-xs font-black">{chk.nameKn}</div>
                <div className="text-[11px] text-slate-600 leading-tight">{chk.detailsKn}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 104-Page Grid & Navigation */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-amber-950">
              ಪುಟಗಳ ಸೂಚಿ ಮತ್ತು ಪೂರ್ವವೀಕ್ಷಣೆ (Page Directory & Preview)
            </h2>
            <p className="text-xs text-amber-800">
              ೧ ರಿಂದ ೧೦೪ ಪುಟಗಳಲ್ಲಿ ಯಾವುದೇ ಪುಟವನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ನೈಜ ವಿನ್ಯಾಸ ವೀಕ್ಷಿಸಿ.
            </p>
          </div>

          {/* Section Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs font-bold">
            {[
              { id: "all", label: "ಎಲ್ಲಾ ಪುಟಗಳು (104)" },
              { id: "front_matter", label: "ಮುಖಪುಟ (1-10)" },
              { id: "astronomy_forecast", label: "ಫಲಶ್ರುತಿ/ಗ್ರಹಣ (11-19)" },
              { id: "rashi_bhavishya", label: "ವರ್ಷಭವಿಷ್ಯ (20-25)" },
              { id: "classical_rituals", label: "ಆಶೌಚ/ಮುಹೂರ್ತ (26-39)" },
              { id: "daily_panchanga", label: "ದೈನಂದಿನ ಪಂಚಾಂಗ (40-91)" },
              { id: "back_matter", label: "ಅಂತಿಮ ಕೋಷ್ಟಕಗಳು (92-104)" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedSectionFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedSectionFilter === f.id
                    ? "bg-amber-800 text-white shadow-sm"
                    : "bg-amber-100 text-amber-950 hover:bg-amber-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Page Number Matrix */}
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-inner max-h-48 overflow-y-auto">
          <div className="grid grid-cols-8 sm:grid-cols-13 gap-1.5 text-xs text-center font-bold">
            {filteredPages.map((p) => {
              const isSelected = p.pageNumber === viewingPageNumber;
              return (
                <button
                  key={p.pageNumber}
                  onClick={() => setViewingPageNumber(p.pageNumber)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-amber-900 text-white border-amber-950 ring-2 ring-amber-500 scale-105"
                      : "bg-white text-amber-900 border-amber-200 hover:bg-amber-100"
                  }`}
                  title={`${p.pageNumber}. ${p.titleKn}`}
                >
                  <span className="block font-mono text-[11px] font-black">{p.pageNumber}</span>
                  <span className="block text-[8px] truncate font-medium">{p.layoutTemplateId.substring(0, 4)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Page Preview Frame (Actual High-Fidelity Baggona Print Frame) */}
      <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-amber-800/30 gap-2">
          <div>
            <span className="text-xs font-black uppercase text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
              ಪುಟ {currentPage.pageNumber} / 104 • {currentPage.sectionCategory}
            </span>
            <h3 className="text-xl font-black text-amber-950 mt-1">{currentPage.titleKn}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSinglePagePdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <span>📄</span>
              <span>ಪುಟ {currentPage.pageNumber} ಮಾತ್ರ ಡೌನ್‌ಲೋಡ್ (High-Res PDF)</span>
            </button>
          </div>
        </div>

        {/* Live Authentic Render of Current Page */}
        <div className="flex justify-center items-center py-4 bg-amber-950/20 rounded-2xl overflow-x-auto shadow-inner p-2">
          <div id="baggona-live-preview-page" className="scale-90 sm:scale-100 origin-top shadow-2xl">
            <UniversalBaggonaPageRenderer page={currentPage} meta={currentMeta} />
          </div>
        </div>

        {/* Page Navigation Footer */}
        <div className="pt-4 border-t-2 border-amber-800/40 flex items-center justify-between text-xs font-bold text-amber-900">
          <button
            onClick={() => setViewingPageNumber((prev) => Math.max(1, prev - 1))}
            disabled={viewingPageNumber <= 1}
            className="px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300 rounded-lg disabled:opacity-40"
          >
            ← ಹಿಂದಿನ ಪುಟ ({viewingPageNumber - 1})
          </button>

          <span className="font-mono font-black text-amber-950">
            ಪುಟ {viewingPageNumber} / 104
          </span>

          <button
            onClick={() => setViewingPageNumber((prev) => Math.min(104, prev + 1))}
            disabled={viewingPageNumber >= 104}
            className="px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300 rounded-lg disabled:opacity-40"
          >
            ಮುಂದಿನ ಪುಟ ({viewingPageNumber + 1}) →
          </button>
        </div>
      </div>

      {/* Offscreen Container for HTML2Canvas PDF Rendering (Conforms strictly to baggona-pdf-layout-guard) */}
      <div
        id="baggona-offscreen-render-host"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 794,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
          height: 0
        }}
      >
        {allPages.map((p) => (
          <div key={p.pageNumber} className="pdf-page-a4">
            <UniversalBaggonaPageRenderer page={p} meta={currentMeta} />
          </div>
        ))}
      </div>

      {/* Interactive Baggona Front Cover Loader Modal */}
      <BaggonaBookLoaderModal
        isOpen={showLoaderModal}
        samvatsaraKn={currentMeta.samvatsaraKn}
        samvatsaraEn={currentMeta.samvatsaraEn}
        shakaYear={currentMeta.shakaYear}
        gregorianYears={currentMeta.gregorianYears}
        onComplete={async () => {
          await handleDownloadPressReadyPdf();
          setShowLoaderModal(false);
        }}
        onClose={() => setShowLoaderModal(false)}
      />
    </div>
  );
};
