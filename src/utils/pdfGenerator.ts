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

  // Create an isolated top-level wrapper directly on document.body
  // This guarantees html2canvas renders with positive coordinates and standard fonts
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "0px";
  wrapper.style.top = "0px";
  wrapper.style.width = "900px";
  wrapper.style.zIndex = "999999";
  wrapper.style.backgroundColor = "#FFFDF7";
  wrapper.style.pointerEvents = "none";
  wrapper.style.opacity = "1";
  wrapper.style.visibility = "visible";
  wrapper.style.overflow = "visible";

  const clone = container.cloneNode(true) as HTMLElement;
  clone.style.position = "static";
  clone.style.left = "auto";
  clone.style.top = "auto";
  clone.style.opacity = "1";
  clone.style.visibility = "visible";
  clone.style.display = "block";
  clone.style.pointerEvents = "none";
  clone.style.width = "900px";

  // ── FIX: Force vertical stacking to prevent "row formation" PDF layout ──
  // Walk every element in the clone and ensure flex/grid containers
  // use column direction so html2canvas captures a proper vertical layout.
  const allElements = clone.querySelectorAll("*") as NodeListOf<HTMLElement>;
  for (const el of allElements) {
    // Force pdf-page divs to stack vertically as block
    if (el.classList.contains("pdf-page")) {
      el.style.display = "block";
      if (!el.style.width || el.style.width === "100%") {
        el.style.width = "794px";
      }
      el.style.pageBreakAfter = "always";
    }
    // Force pdf-section divs to stack vertically as block
    if (el.classList.contains("pdf-section")) {
      el.style.display = "block";
      el.style.width = "100%";
    }
  }

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 350));

    const sectionDivs = Array.from(wrapper.querySelectorAll(".pdf-section")) as HTMLElement[];
    const pageDivs = Array.from(wrapper.querySelectorAll(".pdf-page")) as HTMLElement[];

    const canvasOptions = {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#FFFDF7",
      allowTaint: false,
      imageTimeout: 10000,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 900
    };

    const getCanvasDataUrl = (canvas: HTMLCanvasElement): string => {
      try {
        return canvas.toDataURL("image/jpeg", 0.92);
      } catch {
        return canvas.toDataURL("image/png");
      }
    };

    if (sectionDivs.length > 0) {
      // ── Strategy 1: Smart section packing ────────────────────────────────
      const sectionImages: { dataUrl: string; heightMm: number }[] = [];

      for (const section of sectionDivs) {
        const canvas = await html2canvas(section, canvasOptions);
        const dataUrl = getCanvasDataUrl(canvas);
        const heightMm = (canvas.width > 0 && !isNaN(canvas.height / canvas.width))
          ? (canvas.height / canvas.width) * A4_WIDTH_MM
          : A4_HEIGHT_MM;
        sectionImages.push({ dataUrl, heightMm });
      }

      const state: {
        pdf: jsPDF | null;
        currentPageHeight: number;
        currentPageImages: { dataUrl: string; heightMm: number; yMm: number }[];
      } = { pdf: null, currentPageHeight: 0, currentPageImages: [] };

      const flushPage = () => {
        if (state.currentPageImages.length === 0) return;

        const pageH = Math.max(state.currentPageHeight, 10);
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
          flushPage();
        }

        state.currentPageImages.push({ dataUrl: img.dataUrl, heightMm: sectionH, yMm: state.currentPageHeight });
        state.currentPageHeight += sectionH;
      }
      flushPage();

      if (state.pdf) {
        savePdfBlob(state.pdf, fileName);
      }

    } else if (pageDivs.length > 0) {
      // ── Strategy 2: Explicit .pdf-page divs → one div per page ───────────
      let pdf: jsPDF | null = null;

      for (const pageEl of pageDivs) {
        const canvas = await html2canvas(pageEl, canvasOptions);
        const imgData = getCanvasDataUrl(canvas);
        const heightMm = (canvas.width > 0 && !isNaN(canvas.height / canvas.width))
          ? (canvas.height / canvas.width) * A4_WIDTH_MM
          : A4_HEIGHT_MM;

        if (!pdf) {
          pdf = new jsPDF({ orientation: "p", unit: "mm", format: [A4_WIDTH_MM, heightMm], compress: true });
        } else {
          pdf.addPage([A4_WIDTH_MM, heightMm], "p");
        }
        pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, heightMm);
      }
      if (pdf) {
        savePdfBlob(pdf, fileName);
      }

    } else {
      // ── Strategy 3: Single long scroll → slice into A4 chunks ─────────────
      const fullCanvas = await html2canvas(clone, canvasOptions);

      const pxPerMm = fullCanvas.width / A4_WIDTH_MM;
      const pageHeightPx = Math.floor(pxPerMm * A4_HEIGHT_MM);
      const totalHeight = fullCanvas.height;
      const pageCount = Math.ceil(totalHeight / pageHeightPx) || 1;

      let pdf: jsPDF | null = null;

      for (let i = 0; i < pageCount; i++) {
        const srcY = i * pageHeightPx;
        const srcH = Math.min(pageHeightPx, totalHeight - srcY);

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = fullCanvas.width;
        sliceCanvas.height = Math.max(srcH, 1);

        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) continue;

        ctx.fillStyle = "#FFFDF7";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(fullCanvas, 0, srcY, fullCanvas.width, srcH, 0, 0, fullCanvas.width, srcH);

        const imgData = getCanvasDataUrl(sliceCanvas);
        const sliceHeightMm = (srcH / fullCanvas.width) * A4_WIDTH_MM;
        const pageH = Math.max(sliceHeightMm, A4_HEIGHT_MM);

        if (!pdf) {
          pdf = new jsPDF({ orientation: "p", unit: "mm", format: [A4_WIDTH_MM, pageH], compress: true });
        } else {
          pdf.addPage([A4_WIDTH_MM, pageH], "p");
        }
        pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, sliceHeightMm);
      }
      if (pdf) {
        savePdfBlob(pdf, fileName);
      }
    }
  } catch (renderError) {
    console.error("html2canvas/jsPDF generation failed:", renderError);
    throw renderError;
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
}

function savePdfBlob(pdf: jsPDF, fileName: string): void {
  const safeName = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  try {
    pdf.save(safeName);
  } catch (err) {
    console.warn("Direct pdf.save failed, falling back to Blob download:", err);
    try {
      const blob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = safeName;
      a.setAttribute("download", safeName);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 1500);
    } catch (fallbackErr) {
      console.error("PDF download failed completely:", fallbackErr);
    }
  }
}


