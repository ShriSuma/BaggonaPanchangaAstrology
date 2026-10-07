import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { analytics } from "./analytics";
import { savePdfBlob } from "../utils/pdfGenerator";

export const exportSvgAsDataUrl = async (svgElement: SVGSVGElement): Promise<string> => {
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  const encoded = window.btoa(unescape(encodeURIComponent(source)));
  return `data:image/svg+xml;base64,${encoded}`;
};

export const exportSvgAsPng = async (svgElement: SVGSVGElement, fileName: string): Promise<void> => {
  try {
    const dataUrl = await exportSvgAsDataUrl(svgElement);
    const img = new Image();
    img.src = dataUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Unable to load SVG for export"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = (img.width || 300) * 2;
    canvas.height = (img.height || 300) * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const pngData = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = pngData;
    anchor.download = `${fileName}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch {
    const fallbackRoot = (svgElement.parentElement ?? svgElement) as unknown as HTMLElement;
    const canvas = await html2canvas(fallbackRoot);
    const pngData = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = pngData;
    anchor.download = `${fileName}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
  await analytics.track("chart_exported");
};

export const exportSvgAsPdf = async (svgElement: SVGSVGElement, fileName: string): Promise<void> => {
  try {
    const dataUrl = await exportSvgAsDataUrl(svgElement);
    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Unable to load SVG for export"));
    });
    const canvas = document.createElement("canvas");
    canvas.width = (img.width || 300) * 2;
    canvas.height = (img.height || 300) * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const pngData = canvas.toDataURL("image/jpeg", 0.75);
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 36;
    const drawW = pageW - margin * 2;
    const drawH = (canvas.height * drawW) / canvas.width;
    pdf.addImage(pngData, "JPEG", margin, margin, drawW, drawH);
    savePdfBlob(pdf, fileName);
  } catch {
    const fallbackRoot = (svgElement.parentElement ?? svgElement) as unknown as HTMLElement;
    const canvas = await html2canvas(fallbackRoot);
    const pngData = canvas.toDataURL("image/jpeg", 0.75);
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 36;
    const drawW = pageW - margin * 2;
    const drawH = (canvas.height * drawW) / canvas.width;
    pdf.addImage(pngData, "JPEG", margin, margin, drawW, drawH);
    savePdfBlob(pdf, fileName);
  }
  await analytics.track("chart_exported_pdf");
};

export const exportElementAsPng = async (element: HTMLElement, fileName: string): Promise<void> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fffdf8",
    logging: false
  });
  const pngData = canvas.toDataURL("image/png");
  const anchor = document.createElement("a");
  anchor.style.display = "none";
  anchor.href = pngData;
  anchor.download = `${fileName}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  await analytics.track("chart_exported");
};

export const exportElementAsPdf = async (element: HTMLElement, fileName: string): Promise<void> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fffdf8",
    logging: false
  });
  const pngData = canvas.toDataURL("image/jpeg", 0.75);
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const drawW = pageW - margin * 2;
  const drawH = (canvas.height * drawW) / canvas.width;
  pdf.addImage(pngData, "JPEG", margin, margin, drawW, Math.min(drawH, pageH - margin * 2));
  savePdfBlob(pdf, fileName);
  await analytics.track("chart_exported_pdf");
};

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

async function renderElementToCanvas(el: HTMLElement, bgColor: string = "#ffffff"): Promise<HTMLCanvasElement> {
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "0px";
  wrapper.style.top = "0px";
  wrapper.style.width = "900px";
  wrapper.style.zIndex = "-9999";
  wrapper.style.backgroundColor = bgColor;
  wrapper.style.pointerEvents = "none";
  wrapper.style.opacity = "1";
  wrapper.style.visibility = "visible";
  wrapper.style.overflow = "visible";

  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.display = "block";
  clone.style.width = "900px";
  clone.style.margin = "0";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise((r) => setTimeout(r, 200));

    return await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: bgColor,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 900
    });
  } finally {
    if (wrapper.parentElement) {
      document.body.removeChild(wrapper);
    }
  }
}

function paginateCanvasToPdf(canvas: HTMLCanvasElement, pdf: jsPDF): void {
  const totalHeightMm = (canvas.height * A4_WIDTH_MM) / canvas.width;

  if (totalHeightMm <= A4_HEIGHT_MM) {
    const data = canvas.toDataURL("image/jpeg", 0.95);
    pdf.addPage("a4", "p");
    pdf.addImage(data, "JPEG", 0, 0, A4_WIDTH_MM, totalHeightMm);
    return;
  }

  const pageHeightPx = Math.floor((canvas.width / A4_WIDTH_MM) * A4_HEIGHT_MM);
  const totalHeightPx = canvas.height;
  const ctx = canvas.getContext("2d");

  const findCleanBreakY = (targetY: number, minY: number): number => {
    if (!ctx || targetY >= totalHeightPx) return targetY;
    try {
      const checkWidth = Math.max(1, canvas.width - 200);
      for (let y = targetY; y >= minY; y -= 4) {
        const imgData = ctx.getImageData(100, y, checkWidth, 1).data;
        let isWhite = true;
        for (let p = 0; p < imgData.length; p += 16) {
          if (imgData[p] < 245 || imgData[p + 1] < 245 || imgData[p + 2] < 245) {
            isWhite = false;
            break;
          }
        }
        if (isWhite) return y;
      }
    } catch {
      // Fallback
    }
    return targetY;
  };

  let startY = 0;
  while (startY < totalHeightPx) {
    const remainingPx = totalHeightPx - startY;
    let sliceHeightPx: number;
    if (remainingPx <= pageHeightPx) {
      sliceHeightPx = remainingPx;
    } else {
      const tentativeBreak = startY + pageHeightPx;
      const minBreak = startY + Math.floor(pageHeightPx * 0.75);
      const cleanBreak = findCleanBreakY(tentativeBreak, minBreak);
      sliceHeightPx = cleanBreak - startY;
    }

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = pageHeightPx;
    const pageCtx = pageCanvas.getContext("2d");
    if (pageCtx) {
      pageCtx.fillStyle = "#ffffff";
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageCtx.drawImage(
        canvas,
        0, startY, canvas.width, sliceHeightPx,
        0, 0, canvas.width, sliceHeightPx
      );
    }

    const sliceData = pageCanvas.toDataURL("image/jpeg", 0.95);
    pdf.addPage("a4", "p");
    pdf.addImage(sliceData, "JPEG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

    startY += sliceHeightPx;
  }
}

export const exportPanchangaWithDashaPdf = async (
  panchangaEl: HTMLElement,
  dashaEl: HTMLElement,
  fileName: string,
  autoSave: boolean = true
): Promise<jsPDF> => {
  // Capture Panchanga (Page 1) via isolated wrapper
  const pCanvas = await renderElementToCanvas(panchangaEl, "#ffffff");
  const pData = pCanvas.toDataURL("image/jpeg", 0.95);

  // Initialize PDF with standard A4
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pH = (pCanvas.height * A4_WIDTH_MM) / pCanvas.width;
  const pDrawH = Math.min(pH, A4_HEIGHT_MM);
  const pYOffset = pH < A4_HEIGHT_MM ? (A4_HEIGHT_MM - pH) / 2 : 0;
  pdf.addImage(pData, "JPEG", 0, pYOffset, A4_WIDTH_MM, pDrawH);

  // Capture Dasha (Page 2+) and paginate cleanly into A4 pages
  const dashaPages = Array.from(dashaEl.querySelectorAll(".pdf-page")) as HTMLElement[];
  if (dashaPages.length > 0) {
    for (const pageEl of dashaPages) {
      const pageCanvas = await renderElementToCanvas(pageEl, "#ffffff");
      const pageData = pageCanvas.toDataURL("image/jpeg", 0.95);
      const pageH = (pageCanvas.height * A4_WIDTH_MM) / pageCanvas.width;
      const pageDrawH = Math.min(pageH, A4_HEIGHT_MM);
      const pageYOffset = pageH < A4_HEIGHT_MM ? (A4_HEIGHT_MM - pageH) / 2 : 0;
      pdf.addPage("a4", "p");
      pdf.addImage(pageData, "JPEG", 0, pageYOffset, A4_WIDTH_MM, pageDrawH);
    }
  } else {
    const dCanvas = await renderElementToCanvas(dashaEl, "#ffffff");
    paginateCanvasToPdf(dCanvas, pdf);
  }

  if (autoSave) {
    savePdfBlob(pdf, fileName);
  }
  await analytics.track("chart_exported_pdf_combined");
  return pdf;
};

export const exportDashaPdf = async (dashaEl: HTMLElement, fileName: string): Promise<void> => {
  const dCanvas = await renderElementToCanvas(dashaEl, "#ffffff");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  
  const totalHeightMm = (dCanvas.height * A4_WIDTH_MM) / dCanvas.width;
  if (totalHeightMm <= A4_HEIGHT_MM) {
    const data = dCanvas.toDataURL("image/jpeg", 0.95);
    pdf.addImage(data, "JPEG", 0, 0, A4_WIDTH_MM, totalHeightMm);
  } else {
    // Slicing logic: remove initial empty page if we add pages
    // jsPDF creates page 1 by default, so we can draw first slice on page 1
    const pageHeightPx = Math.floor((dCanvas.width / A4_WIDTH_MM) * A4_HEIGHT_MM);
    const totalHeightPx = dCanvas.height;
    const ctx = dCanvas.getContext("2d");

    const findCleanBreakY = (targetY: number, minY: number): number => {
      if (!ctx || targetY >= totalHeightPx) return targetY;
      try {
        const checkWidth = Math.max(1, dCanvas.width - 200);
        for (let y = targetY; y >= minY; y -= 4) {
          const imgData = ctx.getImageData(100, y, checkWidth, 1).data;
          let isWhite = true;
          for (let p = 0; p < imgData.length; p += 16) {
            if (imgData[p] < 245 || imgData[p + 1] < 245 || imgData[p + 2] < 245) {
              isWhite = false;
              break;
            }
          }
          if (isWhite) return y;
        }
      } catch {
        // Fallback
      }
      return targetY;
    };

    let startY = 0;
    let pageIndex = 0;
    while (startY < totalHeightPx) {
      const remainingPx = totalHeightPx - startY;
      let sliceHeightPx: number;
      if (remainingPx <= pageHeightPx) {
        sliceHeightPx = remainingPx;
      } else {
        const tentativeBreak = startY + pageHeightPx;
        const minBreak = startY + Math.floor(pageHeightPx * 0.75);
        const cleanBreak = findCleanBreakY(tentativeBreak, minBreak);
        sliceHeightPx = cleanBreak - startY;
      }

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = dCanvas.width;
      pageCanvas.height = pageHeightPx;
      const pageCtx = pageCanvas.getContext("2d");
      if (pageCtx) {
        pageCtx.fillStyle = "#ffffff";
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          dCanvas,
          0, startY, dCanvas.width, sliceHeightPx,
          0, 0, dCanvas.width, sliceHeightPx
        );
      }

      const sliceData = pageCanvas.toDataURL("image/jpeg", 0.95);
      if (pageIndex > 0) {
        pdf.addPage("a4", "p");
      }
      pdf.addImage(sliceData, "JPEG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

      startY += sliceHeightPx;
      pageIndex++;
    }
  }

  savePdfBlob(pdf, fileName);
  await analytics.track("chart_exported_pdf");
};

