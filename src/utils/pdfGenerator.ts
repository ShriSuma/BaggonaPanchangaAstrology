import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePDFFromElement(elementId: string, fileName: string): Promise<void> {
  const container = document.getElementById(elementId);
  if (!container) throw new Error(`Element with ID ${elementId} not found.`);

  await document.fonts.ready;

  const pages = Array.from(container.querySelectorAll(".pdf-page")) as HTMLElement[];
  if (pages.length > 0) {
    let pdf: jsPDF | null = null;
    const pdfWidth = 210;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const canvas = await html2canvas(page, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      
      const canvasRatio = canvas.width / canvas.height;
      const imgHeight = pdfWidth / canvasRatio;

      if (!pdf) {
        pdf = new jsPDF("p", "mm", [pdfWidth, imgHeight]);
      } else {
        pdf.addPage([pdfWidth, imgHeight], "p");
      }

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    }
    
    if (pdf) {
      pdf.save(fileName);
    }
  } else {
    // Fallback if no .pdf-page classes
    const canvas = await html2canvas(container, {
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = 210;
    const canvasRatio = canvas.width / canvas.height;
    const imgHeight = pdfWidth / canvasRatio;
    
    const pdf = new jsPDF("p", "mm", [pdfWidth, imgHeight]);
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    pdf.save(fileName);
  }
}
