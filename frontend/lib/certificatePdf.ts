import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

/**
 * Generates and downloads a high-resolution, certified PDF certificate.
 * Uses native browser SVG foreignObject rendering via html-to-image (supporting modern CSS lab(), oklch() color spaces).
 * Calibrated specifically for A4 Landscape standard dimensions (297mm x 210mm).
 */
export async function exportCertificateToPdf(
  element: HTMLElement,
  certificateTitle: string = "Domain Mastery Certificate",
  recipientName: string = "Learner"
): Promise<boolean> {
  try {
    // Wait for all custom web fonts to be completely ready
    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts.ready;
    }

    let imgData: string;

    try {
      // Primary: html-to-image (native browser engine, 100% support for lab/oklch/Tailwind v4)
      imgData = await htmlToImage.toPng(element, {
        pixelRatio: 2.5,
        backgroundColor: "#ffffff",
        cacheBust: true,
        filter: (node: HTMLElement) => {
          // Exclude any print-hide elements from the capture
          if (node.classList && (node.classList.contains("print-hide") || node.classList.contains("no-print"))) {
            return false;
          }
          return true;
        },
      });
    } catch (htmlToImageErr) {
      console.warn("html-to-image fallback to html2canvas-pro:", htmlToImageErr);
      const html2canvasPro = (await import("html2canvas-pro")).default;
      const canvas = await html2canvasPro(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      imgData = canvas.toDataURL("image/png", 1.0);
    }

    // Determine actual image dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = imgData;
    });

    // Standard A4 Landscape: 297mm width × 210mm height
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = 297;
    const pdfHeight = 210;
    const margin = 6; // 6mm margin for clean diploma framing
    const targetWidth = pdfWidth - margin * 2;
    const targetHeight = pdfHeight - margin * 2;

    const imgRatio = img.width / (img.height || 1);
    const targetRatio = targetWidth / targetHeight;

    let finalWidth = targetWidth;
    let finalHeight = targetHeight;
    let posX = margin;
    let posY = margin;

    if (imgRatio > targetRatio) {
      finalHeight = targetWidth / imgRatio;
      posY = margin + (targetHeight - finalHeight) / 2;
    } else {
      finalWidth = targetHeight * imgRatio;
      posX = margin + (targetWidth - finalWidth) / 2;
    }

    pdf.addImage(imgData, "PNG", posX, posY, finalWidth, finalHeight, undefined, "FAST");

    // Clean, readable filename format: QuestLearn_Grand_Certificate_ben.pdf
    const cleanTitle = (certificateTitle || "Certificate")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 32);
    const cleanName = (recipientName || "Learner")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 24);

    const fileName = `QuestLearn_${cleanTitle}_${cleanName}.pdf`;
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error("Failed to generate certificate PDF:", error);
    return false;
  }
}
