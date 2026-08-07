import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Generates a multi-page A4 PDF from an element.
 *
 * Strategy (in priority order):
 * 1. If the element has `.pdf-section` divs → capture each section individually,
 *    then PACK them into A4 pages without ever splitting a section mid-text.
 * 2. If the element has `.pdf-page` divs → each div = one PDF page.
 * 3. Fallback: capture the whole element and slice vertically into A4 chunks.
 */
export async function generatePDFFromElement(elementId: string, fileName: string): Promise<void> {
  const container = document.getElementById(elementId);
  if (!container) throw new Error(`Element with ID ${elementId} not found.`);

  // Temporarily move element fully on-screen so html2canvas paints it.
  // opacity:0 / visibility:hidden / far-off position all produce blank canvases.
  const originalStyle = container.getAttribute("style") || "";
  container.setAttribute(
    "style",
    "position:fixed; left:0; top:0; z-index:-9999; pointer-events:none; opacity:1; visibility:visible; width:900px;"
  );

  await document.fonts.ready;
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(resolve => setTimeout(resolve, 400));

  try {
    const sectionDivs = Array.from(container.querySelectorAll(".pdf-section")) as HTMLElement[];
    const pageDivs    = Array.from(container.querySelectorAll(".pdf-page"))    as HTMLElement[];

    if (sectionDivs.length > 0) {
      // ── Strategy 1: Smart section packing ────────────────────────────────
      // Capture every section as its own canvas image first.
      const sectionImages: { dataUrl: string; heightMm: number }[] = [];

      for (const section of sectionDivs) {
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#fefce8",
          allowTaint: true,
        });
        const dataUrl   = canvas.toDataURL("image/jpeg", 0.75);
        const heightMm  = (canvas.height / canvas.width) * A4_WIDTH_MM;
        sectionImages.push({ dataUrl, heightMm });
      }

      // Pack sections into A4 pages without splitting any section.
      // If a single section is taller than A4, it gets its own page anyway.
      // Use a wrapper object so TypeScript can track the mutation inside the closure.
      const state: {
        pdf: jsPDF | null;
        currentPageHeight: number;
        currentPageImages: { dataUrl: string; heightMm: number; yMm: number }[];
      } = { pdf: null, currentPageHeight: 0, currentPageImages: [] };

      const flushPage = () => {
        if (state.currentPageImages.length === 0) return;

        const pageH = Math.max(state.currentPageHeight, 10); // never 0
        if (!state.pdf) {
          state.pdf = new jsPDF({ orientation: "p", unit: "mm", format: [A4_WIDTH_MM, pageH], compress: true });
        } else {
          state.pdf.addPage([A4_WIDTH_MM, pageH], "p");
        }
        for (const img of state.currentPageImages) {
          state.pdf.addImage(img.dataUrl, "JPEG", 0, img.yMm, A4_WIDTH_MM, img.heightMm);
        }
        state.currentPageImages = [];
        state.currentPageHeight = 0;
      };

      for (const img of sectionImages) {
        const sectionH = img.heightMm;

        if (state.currentPageHeight + sectionH > A4_HEIGHT_MM && state.currentPageImages.length > 0) {
          // This section doesn't fit on the current page → flush and start a new page
          flushPage();
        }

        state.currentPageImages.push({ dataUrl: img.dataUrl, heightMm: sectionH, yMm: state.currentPageHeight });
        state.currentPageHeight += sectionH;
      }
      flushPage(); // flush the last page

      state.pdf?.save(fileName);

    } else if (pageDivs.length > 0) {
      // ── Strategy 2: Explicit .pdf-page divs → one div per page ───────────
      let pdf: jsPDF | null = null;

      for (const pageEl of pageDivs) {
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          allowTaint: true,
        });
        const imgData   = canvas.toDataURL("image/jpeg", 0.75);
        const heightMm  = (canvas.height / canvas.width) * A4_WIDTH_MM;

        if (!pdf) {
          pdf = new jsPDF({ orientation: "p", unit: "mm", format: [A4_WIDTH_MM, heightMm], compress: true });
        } else {
          pdf.addPage([A4_WIDTH_MM, heightMm], "p");
        }
        pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, heightMm);
      }
      pdf?.save(fileName);

    } else {
      // ── Strategy 3: Single long scroll → slice into A4 chunks ─────────────
      const fullCanvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#fefce8",
        allowTaint: true,
      });

      const pxPerMm      = fullCanvas.width / A4_WIDTH_MM;
      const pageHeightPx = Math.floor(pxPerMm * A4_HEIGHT_MM);
      const totalHeight  = fullCanvas.height;
      const pageCount    = Math.ceil(totalHeight / pageHeightPx);

      let pdf: jsPDF | null = null;

      for (let i = 0; i < pageCount; i++) {
        const srcY   = i * pageHeightPx;
        const srcH   = Math.min(pageHeightPx, totalHeight - srcY);

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width  = fullCanvas.width;
        sliceCanvas.height = srcH;

        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) continue;

        ctx.fillStyle = "#fefce8";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(fullCanvas, 0, srcY, fullCanvas.width, srcH, 0, 0, fullCanvas.width, srcH);

        const imgData      = sliceCanvas.toDataURL("image/jpeg", 0.75);
        const sliceHeightMm = (srcH / fullCanvas.width) * A4_WIDTH_MM;
        const pageH        = Math.max(sliceHeightMm, A4_HEIGHT_MM);

        if (!pdf) {
          pdf = new jsPDF({ orientation: "p", unit: "mm", format: [A4_WIDTH_MM, pageH], compress: true });
        } else {
          pdf.addPage([A4_WIDTH_MM, pageH], "p");
        }
        pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, sliceHeightMm);
      }
      pdf?.save(fileName);
    }
  } finally {
    container.setAttribute("style", originalStyle);
  }
}
