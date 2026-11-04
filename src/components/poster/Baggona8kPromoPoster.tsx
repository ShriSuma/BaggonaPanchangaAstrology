import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface Baggona8kPromoPosterProps {
  initialMode?: "cashier_poster" | "table_tent";
  onClose?: () => void;
}

export const Baggona8kPromoPoster: React.FC<Baggona8kPromoPosterProps> = ({
  initialMode = "cashier_poster",
  onClose
}) => {
  const [viewMode, setViewMode] = useState<"cashier_poster" | "table_tent">(initialMode);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState("");
  const posterRef = useRef<HTMLDivElement>(null);
  const tableTentRef = useRef<HTMLDivElement>(null);

  // High-Resolution 8K Print / PDF Export Handler
  const handleDownloadPdf = async () => {
    const targetElement = viewMode === "cashier_poster" ? posterRef.current : tableTentRef.current;
    if (!targetElement) return;

    try {
      setIsExporting(true);
      setExportStage("Generating 8K Ultra-HD Master Canvas (300+ DPI)...");

      const canvas = await html2canvas(targetElement, {
        scale: 3, // Ultra-high 300+ DPI rendering for ultra-crisp text
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFDF8",
        logging: false
      });

      setExportStage("Compiling Press-Ready A4 PDF Document...");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");

      const fileName =
        viewMode === "cashier_poster"
          ? "Baggona_Panchanga_Cashier_Poster_8K_A4.pdf"
          : "Baggona_Panchanga_Table_Tent_Fold_8K_A4.pdf";

      pdf.save(fileName);
    } catch (err) {
      console.error("[BaggonaPoster] PDF Export Error:", err);
      alert("Failed to export poster. You can use browser print (Ctrl+P / Cmd+P).");
    } finally {
      setIsExporting(false);
      setExportStage("");
    }
  };

  const handleDownloadImage = async () => {
    const targetElement = viewMode === "cashier_poster" ? posterRef.current : tableTentRef.current;
    if (!targetElement) return;

    try {
      setIsExporting(true);
      setExportStage("Rendering 8K PNG Image for Printing Press...");

      const canvas = await html2canvas(targetElement, {
        scale: 4, // 8K print quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFDF8",
        logging: false
      });

      const link = document.createElement("a");
      link.download =
        viewMode === "cashier_poster"
          ? "Baggona_Cashier_Poster_8K_UltraHD.png"
          : "Baggona_Table_Tent_8K_UltraHD.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("[BaggonaPoster] Image Export Error:", err);
      alert("Image generation failed.");
    } finally {
      setIsExporting(false);
      setExportStage("");
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-3 sm:p-6 text-slate-100 flex flex-col items-center">
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div className="w-full max-w-5xl mb-6 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪔</span>
            <h1 className="text-lg sm:text-xl font-black text-amber-300 font-serif">
              ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — 8K ಪ್ರಚಾರ ಪೋಸ್ಟರ್ & ಟೇಬಲ್ ಸ್ಟ್ಯಾಂಡ್
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            140+ Years Heritage · Bilingual (ಕನ್ನಡ & English) · Ready for Cashier Desk & Table Tents
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-amber-500/30 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode("cashier_poster")}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === "cashier_poster"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-amber-200 hover:text-white"
            }`}
          >
            📋 ಕ್ಯಾಷಿಯರ್ ಡೆಸ್ಕ್ ಪೋಸ್ಟರ್ (A4 Wall/Desk)
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table_tent")}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === "table_tent"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-amber-200 hover:text-white"
            }`}
          >
            ⛺ ಡೈನಿಂಗ್ ಟೇಬಲ್ ಫೋಲ್ಡ್ (Table Tent Stand)
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleBrowserPrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/40 text-xs font-extrabold flex items-center gap-1.5 transition shadow"
          >
            <span>🖨️</span>
            <span>A4 Print</span>
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPdf}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-lg disabled:opacity-50"
          >
            <span>📄</span>
            <span>{isExporting ? exportStage || "Exporting..." : "Download A4 PDF"}</span>
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadImage}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow-lg disabled:opacity-50"
          >
            <span>🖼️</span>
            <span>8K PNG</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold transition"
            >
              ✕ ಮುಚ್ಚಿ (Close)
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* MODE 1: CASHIER DESK FULL A4 POSTER (FLAT LAMINATED SHEET)             */}
      {/* ====================================================================== */}
      {viewMode === "cashier_poster" && (
        <div className="w-full flex justify-center overflow-x-auto pb-12">
          {/* A4 Proportion Container (210mm x 297mm @ 900px x 1273px) */}
          <div
            id="baggona-cashier-8k-poster"
            ref={posterRef}
            className="poster-print-container"
            style={{
              width: "900px",
              minWidth: "900px",
              maxWidth: "900px",
              height: "1273px",
              minHeight: "1273px",
              maxHeight: "1273px",
              padding: "16px 20px",
              boxSizing: "border-box",
              position: "relative",
              overflow: "hidden",
              background: "#FFFDF8",
              fontFamily: "'Cinzel', 'Playfair Display', 'Noto Serif Kannada', 'Noto Serif', serif, sans-serif",
              color: "#1C1917",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
            }}
          >
            {/* Outer Gold Border Box */}
            <div
              style={{
                width: "100%",
                height: "1241px",
                maxHeight: "1241px",
                border: "3px solid #B45309",
                borderRadius: "16px",
                padding: "12px 16px",
                boxSizing: "border-box",
                background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 35%, #FFFBEB 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* 4 Corner Florets */}
              <div style={{ position: "absolute", top: "10px", left: "14px", color: "#B45309", fontSize: "14px", lineHeight: 1 }}>❖</div>
              <div style={{ position: "absolute", top: "10px", right: "14px", color: "#B45309", fontSize: "14px", lineHeight: 1 }}>❖</div>
              <div style={{ position: "absolute", bottom: "10px", left: "14px", color: "#B45309", fontSize: "14px", lineHeight: 1 }}>❖</div>
              <div style={{ position: "absolute", bottom: "10px", right: "14px", color: "#B45309", fontSize: "14px", lineHeight: 1 }}>❖</div>

              {/* ============================================================== */}
              {/* 1. TOP HEADER: 140+ YEAR SACRED HERITAGE                       */}
              {/* ============================================================== */}
              <div
                style={{
                  textAlign: "center",
                  background: "linear-gradient(135deg, #450A0A 0%, #780206 50%, #450A0A 100%)",
                  borderRadius: "12px",
                  padding: "9px 18px",
                  color: "#FFFFFF",
                  border: "2px solid #F59E0B",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  flexShrink: 0
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "1px" }}>
                  ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ ॥
                </div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px", lineHeight: 1.25 }}>
                  ೧೪೦+ ವರ್ಷಗಳ ಪವಿತ್ರ ಪರಾಶರೀ ಸಿದ್ಧಾಂತ ಜ್ಯೋತಿಷ್ಯ ಪರಂಪರೆ
                </div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#FBBF24", marginTop: "1px", letterSpacing: "0.5px" }}>
                  BAGGONA PANCHANGA — 140+ YEARS OF SACRED VEDIC HERITAGE
                </div>
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: "rgba(254, 243, 199, 0.15)",
                    border: "1px solid #F59E0B",
                    borderRadius: "20px",
                    padding: "2px 14px",
                    marginTop: "4px",
                    fontSize: "11px",
                    color: "#FEF08A",
                    fontWeight: 700
                  }}
                >
                  ⚡ ನಿಮ್ಮ ಊಟದ ಸಿದ್ಧತೆಯ ನಡುವೆ, ನಿಮ್ಮ ಜೀವಿತದ ಭವಿಷ್ಯ ತಿಳಿಯಿರಿ! | Discover Your Life's Destiny While You Wait!
                </div>
              </div>

              {/* ============================================================== */}
              {/* 2. DUAL PRICING OFFERS (NO NOVEMBER MENTION - DIRECT SAVINGS)  */}
              {/* ============================================================== */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", flexShrink: 0, marginTop: "6px" }}>
                {/* OFFER 1: STANDARD PACKAGE (₹330) */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "2px solid #D97706",
                    borderRadius: "12px",
                    padding: "9px 12px",
                    boxShadow: "0 3px 8px rgba(180, 83, 9, 0.08)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      background: "linear-gradient(135deg, #B45309 0%, #D97706 100%)",
                      color: "#FFFFFF",
                      fontSize: "9.5px",
                      fontWeight: 900,
                      padding: "2px 10px",
                      borderBottomLeftRadius: "8px",
                      letterSpacing: "0.5px"
                    }}
                  >
                    POPULAR CHOICE
                  </div>

                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309" }}>
                    ⭐ ಕೊಡುಗೆ ೧ · OFFER 1
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 900, color: "#780206", lineHeight: 1.25 }}>
                    ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ ದರ್ಶನ V1 + ಜನ್ಮ ಕುಂಡಲಿ
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#451A03" }}>
                    Premium Life Bhavishya V1 (40+ Pgs) + South Indian Kundali
                  </div>

                  {/* Price Block */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "5px" }}>
                    <span style={{ fontSize: "13px", color: "#6B7280", textDecoration: "line-through", fontWeight: 700 }}>
                      ₹500
                    </span>
                    <span style={{ fontSize: "24px", color: "#B45309", fontWeight: 900, lineHeight: 1 }}>
                      ₹330
                    </span>
                    <span
                      style={{
                        backgroundColor: "#DCFCE7",
                        color: "#166534",
                        border: "1px solid #86EFAC",
                        fontSize: "10px",
                        fontWeight: 900,
                        padding: "1px 6px",
                        borderRadius: "6px"
                      }}
                    >
                      SAVE ₹170! (ರಿಯಾಯಿತಿ)
                    </span>
                  </div>

                  <div style={{ fontSize: "10px", color: "#78350F", marginTop: "4px", lineHeight: 1.35 }}>
                    ✓ ದಕ್ಷಿಣ ಭಾರತೀಯ ಶೈಲಿಯ ಜನ್ಮ ಕುಂಡಲಿ (Lagna & Maandi Placements)<br />
                    ✓ ೪೦+ ಪುಟಗಳ ೧೦ ಅಧ್ಯಾಯಗಳ ಸಮಗ್ರ ಜೀವನ ಭವಿಷ್ಯ (10 Full Chapters)<br />
                    ✓ ೧೨೦ ವರ್ಷಗಳ ವಿಂಶೋತ್ತರೀ ಮಹಾದಶಾ-ಭುಕ್ತಿ ರೋಡ್‌ಮ್ಯಾಪ್ (120-Yr Dasha)
                  </div>
                </div>

                {/* OFFER 2: COMPLETE SACRED PACKAGE WITH REMEDY (₹430) */}
                <div
                  style={{
                    backgroundColor: "#FEFCE8",
                    border: "2.5px solid #780206",
                    borderRadius: "12px",
                    padding: "9px 12px",
                    boxShadow: "0 4px 12px rgba(120, 2, 6, 0.12)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      background: "linear-gradient(135deg, #780206 0%, #991B1B 100%)",
                      color: "#FFFFFF",
                      fontSize: "9.5px",
                      fontWeight: 900,
                      padding: "2px 10px",
                      borderBottomLeftRadius: "8px",
                      letterSpacing: "0.5px"
                    }}
                  >
                    👑 ALL-IN-ONE MASTER
                  </div>

                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#991B1B" }}>
                    🔱 ಕೊಡುಗೆ ೨ · COMPLETE SACRED PACKAGE
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 900, color: "#780206", lineHeight: 1.25 }}>
                    ಕುಂಡಲಿ + ಭವಿಷ್ಯ V1 + ದೈವಿಕ ಪರಿಹಾರ ವರದಿ
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#451A03" }}>
                    Kundali + Bhavishya V1 + Daivika Parihara (Remedy Report)
                  </div>

                  {/* Price Block */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "5px" }}>
                    <span style={{ fontSize: "13px", color: "#6B7280", textDecoration: "line-through", fontWeight: 700 }}>
                      ₹700
                    </span>
                    <span style={{ fontSize: "24px", color: "#780206", fontWeight: 900, lineHeight: 1 }}>
                      ₹430
                    </span>
                    <span
                      style={{
                        backgroundColor: "#FEE2E2",
                        color: "#991B1B",
                        border: "1px solid #FCA5A5",
                        fontSize: "10px",
                        fontWeight: 900,
                        padding: "1px 6px",
                        borderRadius: "6px"
                      }}
                    >
                      SAVE ₹270! (ಅತ್ಯುತ್ತಮ ಮೌಲ್ಯ)
                    </span>
                  </div>

                  <div style={{ fontSize: "10px", color: "#78350F", marginTop: "4px", lineHeight: 1.35 }}>
                    ✓ ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ V1 & ಜನ್ಮ ಕುಂಡಲಿಯ ಸಕಲ ವಿವರಗಳು<br />
                    ✓ ಕಾಲಸರ್ಪ, ಪಿತೃ, ಕುಜ, ಅಂಗಾರಕ ದೋಷ ನಿರ್ಣಯ & ಗೋಕರ್ಣ ಸೇವೆಗಳು<br />
                    ✓ ೪೫-ದಿನಗಳ ಮಂಡಲ ವ್ರತ ಸಾಧನೆ, ತುರ್ತು ಮಂತ್ರಗಳು & ಅರ್ಚಕರ ಆಶೀರ್ವಾದ
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* 3. DETAILED BREAKDOWN OF THE THREE INCLUDED MASTER REPORTS       */}
              {/* ============================================================== */}
              <div style={{ display: "flex", flexDirection: "column", gap: "7px", flexShrink: 0, marginTop: "6px" }}>
                {/* REPORT A: SOUTH INDIAN JANANA KUNDALI */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #FDE68A",
                    borderRadius: "10px",
                    padding: "7px 11px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "12px", fontWeight: 900, color: "#780206" }}>
                      🏛️ ೧. ದಕ್ಷಿಣ ಭಾರತೀಯ ಶೈಲಿಯ ಜನ್ಮ ಕುಂಡಲಿ (South Indian Janana Kundali)
                    </div>
                    <span style={{ fontSize: "9.5px", background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>
                      AUTHENTIC CHART
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10px", color: "#451A03", marginTop: "3px", lineHeight: 1.4 }}>
                    <div>
                      • <strong>ದಕ್ಷಿಣ ಭಾರತೀಯ ಚಾರ್ಟ್:</strong> ಲಗ್ನ, ಚಂದ್ರ ರಾಶಿ, ನಕ್ಷತ್ರ ಪಾದ ಹಾಗೂ ನವಗ್ರಹಗಳ ನಿಖರ ಡಿಗ್ರಿ ಮತ್ತು ಭಾವ ಸ್ಥಾನಗಳು.<br />
                      • <strong>South Indian Grid:</strong> Authentic layout with exact degree, minutes & bhava positions of all 9 planets.
                    </div>
                    <div>
                      • <strong>ಮಾಂದಿ & ಗುಳಿಕ ಸ್ಥಾನ:</strong> ಅಗೋಚರ ದೋಷ ಹಾಗೂ ಕರ್ಮ ಬಂಧನಗಳನ್ನು ಶೋಧಿಸುವ ಮಾಂದಿ-ಗುಳಿಕ ಸ್ಫುಟಗಳು.<br />
                      • <strong>Maandi / Gulika:</strong> Exact calculation of subtle karmic afflictions and ascendant degree balance.
                    </div>
                  </div>
                </div>

                {/* REPORT B: PREMIUM BHAVISHYA V1 (10 FULL CHAPTERS) */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #FDE68A",
                    borderRadius: "10px",
                    padding: "7px 11px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "12px", fontWeight: 900, color: "#780206" }}>
                      📜 ೨. ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ ದರ್ಶನ V1 (೪೦+ ಪುಟಗಳ ಸಮಗ್ರ ೧೦ ಅಧ್ಯಾಯಗಳು)
                    </div>
                    <span style={{ fontSize: "9.5px", background: "#DCFCE7", color: "#166534", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>
                      40+ PAGES · 10 CHAPTERS
                    </span>
                  </div>

                  {/* 10 Chapters Compact Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px", fontSize: "9.5px", color: "#451A03", marginTop: "4px", lineHeight: 1.35 }}>
                    <div>
                      • <strong>ಅಧ್ಯಾಯ ೧ (Ch 1):</strong> ಜಾತಕ ದರ್ಪಣ & ವ್ಯಕ್ತಿತ್ವ (Core Temperament & Nature)<br />
                      • <strong>ಅಧ್ಯಾಯ ೨ (Ch 2):</strong> ಧನ-ಧಾನ್ಯ, ಕುಟುಂಬ & ಆರ್ಥಿಕ ಯೋಗಗಳು (Wealth & Family)<br />
                      • <strong>ಅಧ್ಯಾಯ ೩ (Ch 3):</strong> ವಿದ್ಯಾಭ್ಯಾಸ, ಬುದ್ಧಿ & ಸಂತಾನ ಭಾಗ್ಯ (Intellect & Progeny)<br />
                      • <strong>ಅಧ್ಯಾಯ ೪ (Ch 4):</strong> ಆರೋಗ್ಯ, ಋಣ ನಿವಾರಣೆ & ಶತ್ರು ಜಯ (Health & Debt Relief)<br />
                      • <strong>ಅಧ್ಯಾಯ ೫ (Ch 5):</strong> ವಿವಾಹ, ಕಳತ್ರ ಭಾಗ್ಯ & ದಾಂಪತ್ಯ ಸುಖ (Marriage & Harmony)
                    </div>
                    <div>
                      • <strong>ಅಧ್ಯಾಯ ೬ (Ch 6):</strong> ಆಯುಷ್ಯ, ಗಂಡಾಂತರ & ರಕ್ಷಾ ಕವಚ (Longevity & Hazard Shield)<br />
                      • <strong>ಅಧ್ಯಾಯ ೭ (Ch 7):</strong> ಭಾಗ್ಯೋದಯ, ಧರ್ಮ & ತೀರ್ಥಯಾತ್ರೆ (Destiny & Spiritual Grace)<br />
                      • <strong>ಅಧ್ಯಾಯ ೮ (Ch 8):</strong> ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ & ರಾಜಯೋಗ (Career, Business & Status)<br />
                      • <strong>ಅಧ್ಯಾಯ ೯ (Ch 9):</strong> ಲಾಭ, ಐಶ್ವರ್ಯ & ಸಕಲ ಸಿದ್ಧಿಗಳು (Gains & Material Inflows)<br />
                      • <strong>ಅಧ್ಯಾಯ ೧೦ (Ch 10):</strong> ೧೨೦ ವರ್ಷಗಳ ವಿಂಶೋತ್ತರೀ ಮಹಾದಶಾ-ಭುಕ್ತಿ & ೧೦-ವರ್ಷ ರೋಡ್‌ಮ್ಯಾಪ್
                    </div>
                  </div>
                </div>

                {/* REPORT C: DAIVIKA PARIHARA / REMEDY DOSSIER */}
                <div
                  style={{
                    backgroundColor: "#FFFDF8",
                    border: "1.5px solid #FCD34D",
                    borderRadius: "10px",
                    padding: "7px 11px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "12px", fontWeight: 900, color: "#780206" }}>
                      🪔 ೩. ದೈವಿಕ ಪರಿಹಾರ & ದೋಷ ಮುಕ್ತಿ ವರದಿ (Daivika Parihara Dossier)
                    </div>
                    <span style={{ fontSize: "9.5px", background: "#FEE2E2", color: "#991B1B", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>
                      INCLUDED IN ₹430 PACKAGE
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "9.5px", color: "#451A03", marginTop: "3px", lineHeight: 1.35 }}>
                    <div>
                      • <strong>ದೋಷ ನಿರ್ಣಯ:</strong> ಕಾಲಸರ್ಪ, ಪಿತೃ ದೋಷ, ಕುಜ ದೋಷ, ಬಾಧಕ ಗ್ರಹ ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರ ಶಾಂತಿ ಪರಿಹಾರಗಳು.<br />
                      • <strong>Dosha Diagnostics:</strong> Root-cause analysis for Kaal Sarp, Pitru, Kuja & ancestral karma.
                    </div>
                    <div>
                      • <strong>೪೫-ದಿನಗಳ ಸಾಧನೆ:</strong> ಮಂಡಲ ವ್ರತ ಸಾಧನಾ ಪತ್ರಿಕೆ, ತುರ್ತು ಮಂತ್ರಗಳು, ರುದ್ರಾಕ್ಷಿ-ರತ್ನ ಹಾಗೂ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಸೇವೆಗಳು.<br />
                      • <strong>Mandala Sadhana:</strong> 45-day discipline, daily stotras, Gokarna temple sevas & priest blessing.
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* 4. SPEED & DELIVERY CALL-OUT (5 MINUTES ON WHATSAPP / EMAIL)   */}
              {/* ============================================================== */}
              <div
                style={{
                  backgroundColor: "#FEF3C7",
                  border: "2px dashed #B45309",
                  borderRadius: "12px",
                  padding: "9px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                  marginTop: "6px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ fontSize: "32px", lineHeight: 1 }}>⚡</div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "#780206", lineHeight: 1.2 }}>
                      ಕೇವಲ ೫ ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ! · Delivered within 5 Minutes!
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#78350F", fontWeight: 700, marginTop: "1px" }}>
                      ಎಲ್ಲಾ ವರದಿಗಳು ಸುರಕ್ಷಿತ <strong>ZIP ಕಡತದಲ್ಲಿ</strong> ನಿಮ್ಮ <strong>WhatsApp</strong> ಅಥವಾ <strong>Email</strong> ಗೆ ನೇರವಾಗಿ ರವಾನೆಯಾಗುತ್ತವೆ.
                    </div>
                    <div style={{ fontSize: "10px", color: "#92400E" }}>
                      Instant delivery as an official compressed ZIP package directly to your phone.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#166534",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    textAlign: "center",
                    fontWeight: 900,
                    fontSize: "11px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    flexShrink: 0
                  }}
                >
                  <div>5 MINS 🚀</div>
                  <div style={{ fontSize: "9px", opacity: 0.9 }}>FAST DELIVERY</div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* 5. HOW TO ORDER & CASHIER DESK CALL-TO-ACTION                  */}
              {/* ============================================================== */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1C1917 0%, #292524 50%, #1C1917 100%)",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  color: "#FFFFFF",
                  border: "2px solid #F59E0B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                  marginTop: "6px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "18px" }}>🛎️</span>
                    <span style={{ fontSize: "15px", fontWeight: 900, color: "#FDE68A" }}>
                      ಪಡೆಯಲು ದಯವಿಟ್ಟು ಕ್ಯಾಷಿಯರ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
                    FOR BOOKING & DETAILS, PLEASE CONTACT THE CASHIER DESK
                  </div>
                  <div style={{ fontSize: "10px", color: "#D6D3D1", marginTop: "2px" }}>
                    ಕೇವಲ ೪ ವಿವರಗಳನ್ನು ನೀಡಿ: <strong>ಹೆಸರು (Name) · ಜನ್ಮ ದಿನಾಂಕ (DOB) · ಜನನ ಸಮಯ (Birth Time) · ಹುಟ್ಟಿದ ಊರು (Place)</strong>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#F59E0B",
                    color: "#1C1917",
                    borderRadius: "10px",
                    padding: "7px 14px",
                    textAlign: "center",
                    fontWeight: 900,
                    fontSize: "12px",
                    boxShadow: "0 2px 6px rgba(245, 158, 11, 0.4)",
                    flexShrink: 0
                  }}
                >
                  <div>ORDER NOW</div>
                  <div style={{ fontSize: "9px", fontWeight: 800 }}>ಕ್ಯಾಷಿಯರ್ ಕೌಂಟರ್</div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* 6. SACRED FOOTER & PRIEST ENDORSEMENT                          */}
              {/* ============================================================== */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "10px",
                  color: "#78350F",
                  fontWeight: 800,
                  borderTop: "1.5px dashed #D97706",
                  paddingTop: "6px",
                  marginTop: "4px",
                  flexShrink: 0
                }}
              >
                <div>
                  🙏 ಪ್ರಧಾನ ಅರ್ಚಕರು: <strong>ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್</strong> (+91 94821 09844) · ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ
                </div>
                <div>
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ · ೧೪೦+ ವರ್ಷಗಳ ಅಧಿಕೃತ ಮುದ್ರೆ ॥
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODE 2: DINING TABLE TENT FOLD (BI-FOLD A4 STAND FOR RESTAURANT TABLES)*/}
      {/* ====================================================================== */}
      {viewMode === "table_tent" && (
        <div className="w-full flex justify-center overflow-x-auto pb-12">
          {/* A4 Proportion (210mm x 297mm @ 900px x 1273px) with Central Fold Line */}
          <div
            id="baggona-table-tent-8k-poster"
            ref={tableTentRef}
            className="poster-print-container"
            style={{
              width: "900px",
              minWidth: "900px",
              maxWidth: "900px",
              height: "1273px",
              minHeight: "1273px",
              maxHeight: "1273px",
              padding: "14px 16px",
              boxSizing: "border-box",
              position: "relative",
              overflow: "hidden",
              background: "#FFFDF8",
              fontFamily: "'Cinzel', 'Playfair Display', 'Noto Serif Kannada', 'Noto Serif', serif, sans-serif",
              color: "#1C1917",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            {/* SIDE A: TOP HALF (FOLD OVER FOR DINER 1) */}
            <div
              style={{
                height: "595px",
                border: "2px solid #B45309",
                borderRadius: "14px",
                padding: "10px 14px",
                boxSizing: "border-box",
                background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF8 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative"
              }}
            >
              {/* Side A Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #450A0A 0%, #780206 100%)",
                  borderRadius: "10px",
                  padding: "7px 12px",
                  color: "#FFFFFF",
                  border: "1.5px solid #F59E0B",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 800 }}>
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ೧೪೦+ ವರ್ಷಗಳ ಪವಿತ್ರ ಸಿದ್ಧಾಂತ ಪರಂಪರೆ ॥
                </div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#FFFFFF", marginTop: "1px" }}>
                  ನಿಮ್ಮ ಊಟದ ನಿರೀಕ್ಷೆಯ ನಡುವೆ, ನಿಮ್ಮ ಭವಿಷ್ಯ ತಿಳಿಯಿರಿ!
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#FBBF24" }}>
                  Discover Your Destiny While Waiting For Your Food!
                </div>
              </div>

              {/* Side A Dual Price Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
                <div style={{ backgroundColor: "#FFFFFF", border: "2px solid #D97706", borderRadius: "10px", padding: "8px 10px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#B45309" }}>⭐ OFFER 1: KUNDALI + BHAVISHYA V1</div>
                  <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#780206" }}>ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ V1 + ಜನ್ಮ ಕುಂಡಲಿ</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                    <span style={{ fontSize: "11.5px", color: "#6B7280", textDecoration: "line-through" }}>₹500</span>
                    <span style={{ fontSize: "20px", color: "#B45309", fontWeight: 900 }}>₹330</span>
                    <span style={{ fontSize: "9.5px", background: "#DCFCE7", color: "#166534", padding: "1px 5px", borderRadius: "4px", fontWeight: 800 }}>SAVE ₹170</span>
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#78350F", marginTop: "3px", lineHeight: 1.3 }}>
                    • ದಕ್ಷಿಣ ಭಾರತೀಯ ಕುಂಡಲಿ (Lagna & Maandi)<br />
                    • ೪೦+ ಪುಟಗಳ ೧೦ ಅಧ್ಯಾಯಗಳ ವರದಿ<br />
                    • ೧೨೦-ವರ್ಷ ವಿಂಶೋತ್ತರೀ ಮಹಾದಶಾ ಭವಿಷ್ಯ
                  </div>
                </div>

                <div style={{ backgroundColor: "#FEFCE8", border: "2px solid #780206", borderRadius: "10px", padding: "8px 10px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#991B1B" }}>🔱 OFFER 2: COMPLETE REMEDY PACK</div>
                  <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#780206" }}>ಕುಂಡಲಿ + ಭವಿಷ್ಯ + ಪರಿಹಾರ ವರದಿ</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                    <span style={{ fontSize: "11.5px", color: "#6B7280", textDecoration: "line-through" }}>₹700</span>
                    <span style={{ fontSize: "20px", color: "#780206", fontWeight: 900 }}>₹430</span>
                    <span style={{ fontSize: "9.5px", background: "#FEE2E2", color: "#991B1B", padding: "1px 5px", borderRadius: "4px", fontWeight: 800 }}>SAVE ₹270</span>
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#78350F", marginTop: "3px", lineHeight: 1.3 }}>
                    • ಭವಿಷ್ಯ V1 & ಜನ್ಮ ಕುಂಡಲಿ ಸಂಪೂರ್ಣ ವಿವರ<br />
                    • ಕಾಲಸರ್ಪ, ಪಿತೃ, ಕುಜ ದೋಷ ಶಾಂತಿ ಪರಿಹಾರ<br />
                    • ೪೫-ದಿನ ಮಂಡಲ ವ್ರತ & ಗೋಕರ್ಣ ಸೇವೆಗಳು
                  </div>
                </div>
              </div>

              {/* Side A 5-Min Delivery Banner */}
              <div style={{ background: "#FEF3C7", border: "1.5px dashed #B45309", borderRadius: "8px", padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#780206" }}>
                  ⚡ ಕೇವಲ ೫ ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ WhatsApp ಅಥವಾ Email ಗೆ ZIP ಫೈಲ್ ರವಾನೆ!
                </div>
                <span style={{ fontSize: "10px", background: "#166534", color: "#FFFFFF", padding: "2px 8px", borderRadius: "6px", fontWeight: 900 }}>
                  5 MINS 🚀
                </span>
              </div>

              {/* Side A Cashier Call to Action */}
              <div style={{ background: "#1C1917", borderRadius: "8px", padding: "7px 12px", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 900, color: "#FDE68A" }}>
                    🛎️ ಪಡೆಯಲು ದಯವಿಟ್ಟು ಕ್ಯಾಷಿಯರ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ | Contact Cashier
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#D6D3D1" }}>
                    ನೀಡಿ: ಹೆಸರು (Name) · ಜನ್ಮ ದಿನಾಂಕ (DOB) · ಸಮಯ (Birth Time) · ಹುಟ್ಟಿದ ಊರು (Place)
                  </div>
                </div>
                <div style={{ background: "#F59E0B", color: "#1C1917", padding: "4px 10px", borderRadius: "6px", fontWeight: 900, fontSize: "10.5px" }}>
                  ORDER AT CASHIER
                </div>
              </div>
            </div>

            {/* DOTTED FOLD LINE IN THE CENTER (A4 BI-FOLD GUIDE) */}
            <div
              style={{
                width: "100%",
                height: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative"
              }}
            >
              <div style={{ position: "absolute", width: "100%", borderBottom: "1.5px dashed #B45309", opacity: 0.6 }}></div>
              <span style={{ position: "relative", backgroundColor: "#FFFDF8", padding: "0 12px", fontSize: "9px", color: "#92400E", fontWeight: 800, letterSpacing: "1px" }}>
                ✂️ ಮಡಚುವ ಗೆರೆ · FOLD HERE FOR TABLE TENT STANDEE ✂️
              </span>
            </div>

            {/* SIDE B: BOTTOM HALF (FACING OPPOSITE DINER / COMPREHENSIVE CHAPTERS) */}
            <div
              style={{
                height: "595px",
                border: "2px solid #B45309",
                borderRadius: "14px",
                padding: "10px 14px",
                boxSizing: "border-box",
                background: "linear-gradient(180deg, #FFFDF8 0%, #FFFFFF 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative"
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #1C1917 0%, #292524 100%)",
                  borderRadius: "10px",
                  padding: "6px 12px",
                  color: "#FFFFFF",
                  border: "1.5px solid #F59E0B",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 800 }}>
                  📜 ವರದಿಯಲ್ಲಿ ಒಳಗೊಂಡಿರುವ ೧೦ ಅಧ್ಯಾಯಗಳು & ದೈವಿಕ ರಕ್ಷೆ
                </div>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF" }}>
                  10 Full Life Chapters + South Indian Kundali + Daivika Parihara
                </div>
              </div>

              {/* South Indian Chart & Maandi Specs */}
              <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "8px", padding: "6px 10px", marginTop: "4px" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#780206" }}>
                  🏛️ ದಕ್ಷಿಣ ಭಾರತೀಯ ಜನ್ಮ ಕುಂಡಲಿ & ಮಾಂದಿ ಸ್ಥಾನ (South Indian Kundali & Maandi)
                </div>
                <div style={{ fontSize: "9.5px", color: "#451A03", marginTop: "2px", lineHeight: 1.35 }}>
                  ದಕ್ಷಿಣ ಭಾರತೀಯ ಶೈಲಿಯ ಸ್ಪಷ್ಟ ಚಾರ್ಟ್ · ಲಗ್ನ, ನವಗ್ರಹಗಳ ನಿಖರ ಡಿಗ್ರಿ, ನಕ್ಷತ್ರ ಪಾದ, ಚಂದ್ರ ರಾಶಿ ಹಾಗೂ ಅಗೋಚರ ದೋಷ ನಿವಾರಿಸುವ ಮಾಂದಿ-ಗುಳಿಕ ಸ್ಥಾನ ನಿರ್ಣಯ.
                </div>
              </div>

              {/* 10 Chapters Listing */}
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #FDE68A", borderRadius: "8px", padding: "6px 10px", marginTop: "4px" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#780206", marginBottom: "3px" }}>
                  📖 ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ V1 — ೪೦+ ಪುಟಗಳ ೧೦ ಅಧ್ಯಾಯಗಳ ಸಾರಾಂಶ:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px", fontSize: "9px", color: "#451A03", lineHeight: 1.35 }}>
                  <div>
                    • <strong>ಅಧ್ಯಾಯ ೧:</strong> ಜಾತಕ ದರ್ಪಣ (Personality & Temperament)<br />
                    • <strong>ಅಧ್ಯಾಯ ೨:</strong> ಧನ-ಧಾನ್ಯ, ಕುಟುಂಬ & ಆರ್ಥಿಕ ಯೋಗ (Wealth)<br />
                    • <strong>ಅಧ್ಯಾಯ ೩:</strong> ವಿದ್ಯಾಭ್ಯಾಸ, ಬುದ್ಧಿ & ಸಂತಾನ (Education)<br />
                    • <strong>ಅಧ್ಯಾಯ ೪:</strong> ಆರೋಗ್ಯ, ಋಣ ನಿವಾರಣೆ & ಶತ್ರು ಜಯ (Health)<br />
                    • <strong>ಅಧ್ಯಾಯ ೫:</strong> ವಿವಾಹ, ಕಳತ್ರ & ದಾಂಪತ್ಯ ಸುಖ (Marriage)
                  </div>
                  <div>
                    • <strong>ಅಧ್ಯಾಯ ೬:</strong> ಆಯುಷ್ಯ, ಗಂಡಾಂತರ & ರಕ್ಷಾ ಕವಚ (Longevity)<br />
                    • <strong>ಅಧ್ಯಾಯ ೭:</strong> ಭಾಗ್ಯೋದಯ & ತೀರ್ಥಯಾತ್ರೆ (Destiny & Grace)<br />
                    • <strong>ಅಧ್ಯಾಯ ೮:</strong> ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ & ರಾಜಯೋಗ (Career)<br />
                    • <strong>ಅಧ್ಯಾಯ ೯:</strong> ಲಾಭ, ಐಶ್ವರ್ಯ & ಸಕಲ ಸಿದ್ಧಿಗಳು (Gains)<br />
                    • <strong>ಅಧ್ಯಾಯ ೧೦:</strong> ೧೨೦-ವರ್ಷ ದಶಾ-ಭುಕ್ತಿ & ೧೦-ವರ್ಷ ರೋಡ್‌ಮ್ಯಾಪ್
                  </div>
                </div>
              </div>

              {/* Daivika Parihara Bullet */}
              <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "6px 10px", marginTop: "4px" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#991B1B" }}>
                  🪔 ದೈವಿಕ ಪರಿಹಾರ ವರದಿ (Daivika Parihara — Included in ₹430 Pack):
                </div>
                <div style={{ fontSize: "9px", color: "#7F1D1D", marginTop: "2px", lineHeight: 1.35 }}>
                  ಕಾಲಸರ್ಪ, ಪಿತೃ, ಕುಜ, ಅಂಗಾರಕ ದೋಷ ನಿವಾರಣೆ · ೪೫-ದಿನಗಳ ಮಂಡಲ ವ್ರತ ಸಾಧನೆ · ತುರ್ತು ಬೀಜ ಮಂತ್ರಗಳು, ವೈಯಕ್ತಿಕ ಸ್ತೋತ್ರಗಳು, ರುದ್ರಾಕ್ಷಿ-ರತ್ನ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಸೇವೆಗಳು.
                </div>
              </div>

              {/* Side B Order Callout */}
              <div style={{ background: "#780206", color: "#FFFFFF", borderRadius: "8px", padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                <div style={{ fontSize: "10.5px", fontWeight: 800 }}>
                  🛎️ ಬುಕಿಂಗ್‌ಗಾಗಿ ಕ್ಯಾಷಿಯರ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ | Contact Cashier for Instant Delivery
                </div>
                <div style={{ background: "#F59E0B", color: "#1C1917", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 900 }}>
                  ₹330 / ₹430
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Baggona8kPromoPoster;
