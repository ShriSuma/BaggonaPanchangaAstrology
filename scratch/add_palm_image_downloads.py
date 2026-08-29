import os

file_path = 'src/pages/PalmReadingPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_pdf_func_end = '''      const safeName = (devoteeName || "Devotee").replace(/[^\\p{L}\\p{N}]+/gu, "_");
      pdf.save(`Baggona_Palm_Reading_${safeName}_${selectedLang.toUpperCase()}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Error generating PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };'''

new_download_funcs = '''      const safeName = (devoteeName || "Devotee").replace(/[^\\p{L}\\p{N}]+/gu, "_");
      pdf.save(`Baggona_Palm_Reading_${safeName}_${selectedLang.toUpperCase()}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Error generating PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download Palm Photo Image
  const handleDownloadPalmImage = () => {
    if (!imageDataUrl) return;
    const link = document.createElement("a");
    link.href = imageDataUrl;
    const safeName = (devoteeName || "Devotee").replace(/[^\\p{L}\\p{N}]+/gu, "_");
    link.download = `Baggona_Palm_Photo_${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Visual Life Timeline Chart Image
  const handleDownloadChartImage = async () => {
    const container = document.getElementById("palm-timeline-diagram-container");
    if (!container) return;
    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#1c1917"
      });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      const safeName = (devoteeName || "Devotee").replace(/[^\\p{L}\\p{N}]+/gu, "_");
      link.download = `Baggona_Palm_Timeline_Chart_${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Chart image download error:", err);
    }
  };'''

target_button_block = '''          {activeResult && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-900 disabled:opacity-50"
            >
              <span>📄</span>
              <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "ಹಸ್ತ ರೇಖಾ PDF ವರದಿ ಡೌನ್‌ಲೋಡ್" : "Download Palm PDF Report")}</span>
            </button>
          )}'''

new_button_block = '''          {activeResult && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPalmImage}
                className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-100/80 px-3.5 py-2 text-xs font-bold text-amber-950 shadow-sm transition hover:bg-amber-200"
                title={isKn ? "ಹಸ್ತದ ಫೋಟೋ ಸೇವ್ ಮಾಡಿ" : "Save Palm Photo"}
              >
                <span>🖼️</span>
                <span>{isKn ? "ಫೋಟೋ ಸೇವ್" : "Save Photo"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadChartImage}
                className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-100/80 px-3.5 py-2 text-xs font-bold text-amber-950 shadow-sm transition hover:bg-amber-200"
                title={isKn ? "ರೇಖಾ ಚಿತ್ರ ಸೇವ್ ಮಾಡಿ" : "Save Timeline Chart"}
              >
                <span>📈</span>
                <span>{isKn ? "ರೇಖಾ ಚಿತ್ರ ಸೇವ್" : "Save Chart"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-2 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-900 disabled:opacity-50"
              >
                <span>📄</span>
                <span>{isGeneratingPdf ? (isKn ? "⌛ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating...") : (isKn ? "PDF ವರದಿ" : "Download PDF")}</span>
              </button>
            </div>
          )}'''

if target_pdf_func_end in content and target_button_block in content:
    content = content.replace(target_pdf_func_end, new_download_funcs, 1)
    content = content.replace(target_button_block, new_button_block, 1)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("MATCH FAILED")
