/**
 * Baggona Panchanga - 20-Minute Consultation Session PDF Exporter
 *
 * Captures #consultation-session-pdf-container in the Premium PDF V1 / Sampoorna 25
 * Royal Ivory (#FFF7ED) + Double Antique Gold (#B45309) design system.
 *
 * Layout Guard Compliance:
 *  - Temporarily places parent wrapper at fixed (left: 0, top: 0) width 900px
 *  - Captures each .pdf-section cleanly with html2canvas at scale 2
 *  - Packs sections vertically onto A4-proportioned pages without mid-section clipping
 *  - Draws #FFF7ED ivory fill and double #B45309 gold borders LAST
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { savePdfBlob } from "../../utils/pdfGenerator";

async function captureSectionToCanvas(sectionEl: HTMLElement): Promise<HTMLCanvasElement> {
  sectionEl.querySelectorAll("*").forEach((node) => {
    const htmlNode = node as HTMLElement;
    if (htmlNode.style) {
      htmlNode.style.letterSpacing = "normal";
      if (htmlNode.style.filter && htmlNode.style.filter.includes("drop-shadow")) {
        htmlNode.style.filter = "none";
      }
    }
  });

  return html2canvas(sectionEl, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#FFF7ED",
    logging: false,
    width: 900,
    windowWidth: 900,
    scrollX: 0,
    scrollY: 0,
    imageTimeout: 10000
  });
}

export async function captureConsultationSessionPdf(
  containerEl: HTMLElement,
  fileName: string = "Baggona_Panchanga_Consultation.pdf",
  autoSave: boolean = true
): Promise<jsPDF> {
  const parentEl = containerEl.parentElement;
  const originalParentStyle = parentEl?.getAttribute("style") || "";
  const originalContainerStyle = containerEl.getAttribute("style") || "";

  const pdfWidthMm = 210;
  const a4HeightMm = 297;
  const borderClearanceMm = 10;
  const contentXMm = 8;
  const contentWidthMm = 194;
  const maxPageContentMm = a4HeightMm - borderClearanceMm * 2;

  try {
    if (parentEl) {
      parentEl.setAttribute(
        "style",
        "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; height: auto; overflow: visible; background-color: #FFF7ED;"
      );
    }
    containerEl.setAttribute(
      "style",
      `${originalContainerStyle ? originalContainerStyle + ";" : ""} width: 900px; height: auto; opacity: 1; visibility: visible; background-color: #FFF7ED;`
    );

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const pendingImages = Array.from(containerEl.querySelectorAll("img"))
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, 2000);
            img.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
            img.addEventListener("error", () => { clearTimeout(timer); resolve(); }, { once: true });
          })
      );
    if (pendingImages.length > 0) {
      await Promise.all(pendingImages);
    }
    await new Promise((resolve) => setTimeout(resolve, 300));

    const rawSections = Array.from(containerEl.querySelectorAll(".pdf-section")) as HTMLElement[];
    const sections = rawSections.filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.height > 0 && el.style.display !== "none" && el.style.visibility !== "hidden";
    });

    if (sections.length === 0) {
      throw new Error("No visible .pdf-section elements found inside consultation PDF container.");
    }

    interface CapturedSection {
      imgData: string;
      heightMm: number;
    }

    const renderedSections: CapturedSection[] = [];
    for (const sectionEl of sections) {
      const canvas = await captureSectionToCanvas(sectionEl);
      if (!canvas || canvas.width === 0 || canvas.height === 0) continue;

      const heightMm = (canvas.height * contentWidthMm) / canvas.width;
      let imgData = "";
      try {
        imgData = canvas.toDataURL("image/jpeg", 0.94);
      } catch {
        imgData = canvas.toDataURL("image/png");
      }

      renderedSections.push({ imgData, heightMm });
      canvas.width = 0;
      canvas.height = 0;
    }

    if (renderedSections.length === 0) {
      throw new Error("Consultation PDF section capture yielded zero valid frames.");
    }

    // Group sections into crisp A4 pages (auto-expanding single extra-tall Q&A blocks so nothing is clipped)
    const pages: Array<{ sections: CapturedSection[]; contentHeightMm: number }> = [];
    let currentSections: CapturedSection[] = [];
    let currentHeightMm = 0;

    for (const sec of renderedSections) {
      if (currentSections.length > 0 && currentHeightMm + sec.heightMm > maxPageContentMm) {
        pages.push({ sections: currentSections, contentHeightMm: currentHeightMm });
        currentSections = [sec];
        currentHeightMm = sec.heightMm;
      } else {
        currentSections.push(sec);
        currentHeightMm += sec.heightMm;
      }
    }
    if (currentSections.length > 0) {
      pages.push({ sections: currentSections, contentHeightMm: currentHeightMm });
    }

    const firstPageH = Math.max(a4HeightMm, pages[0].contentHeightMm + borderClearanceMm * 2);
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [pdfWidthMm, firstPageH],
      compress: true
    });

    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const page = pages[pIdx];
      const pageHeightMm = Math.max(a4HeightMm, page.contentHeightMm + borderClearanceMm * 2);
      if (pIdx > 0) {
        pdf.addPage([pdfWidthMm, pageHeightMm], "p");
      }

      // 1. Royal Ivory Background (#FFF7ED) matching Premium PDF V1 / Sampoorna 25
      pdf.setFillColor(255, 247, 237);
      pdf.rect(0, 0, pdfWidthMm, pageHeightMm, "F");

      // 2. Stack captured sections vertically top-to-bottom cleanly
      let yMm = borderClearanceMm;
      for (const sec of page.sections) {
        pdf.addImage(sec.imgData, "JPEG", contentXMm, yMm, contentWidthMm, sec.heightMm, undefined, "FAST");
        yMm += sec.heightMm;
      }

      // 3. Draw Outer & Inner Antique Gold Double Borders LAST (Sampoorna 25 Standard)
      pdf.setDrawColor(180, 83, 9);
      pdf.setLineWidth(0.75);
      pdf.rect(4, 4, pdfWidthMm - 8, pageHeightMm - 8, "S");

      pdf.setDrawColor(180, 83, 9);
      pdf.setLineWidth(0.25);
      pdf.rect(6, 6, pdfWidthMm - 12, pageHeightMm - 12, "S");
    }

    if (autoSave) {
      savePdfBlob(pdf, fileName);
    }

    return pdf;
  } finally {
    if (originalContainerStyle) {
      containerEl.setAttribute("style", originalContainerStyle);
    } else {
      containerEl.removeAttribute("style");
    }
    if (parentEl) {
      if (originalParentStyle) {
        parentEl.setAttribute("style", originalParentStyle);
      } else {
        parentEl.removeAttribute("style");
      }
    }
  }
}
