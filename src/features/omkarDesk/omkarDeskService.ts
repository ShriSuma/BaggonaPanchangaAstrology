import JSZip from "jszip";

export interface OmkarZipPackageOptions {
  devoteeName: string;
  selectedLang?: string;
  jananaKundliBlob?: Blob | Uint8Array | null;
  bhavishyaV1Blob?: Blob | Uint8Array | null;
  remedyBlob?: Blob | Uint8Array | null;
  onProgress?: (percent: number, stage: string) => void;
}

export interface OmkarZipPackageResult {
  zipBlob: Blob;
  zipFileName: string;
  includedFiles: string[];
}

/**
 * Returns the exact ZIP file name requested:
 * `${cleanDevoteeName}_bhagoda_Pancha_creation.zip`
 * Matching rule: "devoted name underscorebhagoda, Pancha underscorecreation"
 */
export function getOmkarZipFileName(name: string): string {
  const cleanName = (name || "Devotee")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{M}\p{N}_]+/gu, "")
    .replace(/^_+|_+$/g, "");
  return `${cleanName || "Devotee"}_bhagoda_Pancha_creation.zip`;
}

/**
 * Builds the WhatsApp Click-to-Chat URL with pre-filled greeting and file metadata
 */
export function getOmkarWhatsAppShareUrl(options: {
  whatsappNumber: string;
  devoteeName: string;
  zipFileName: string;
  birthDate?: string;
  birthTime?: string;
  place?: string;
  selectedOptions?: string[];
}): string {
  const cleanPhone = (options.whatsappNumber || "").replace(/\D/g, "");
  const selectedListText = (options.selectedOptions && options.selectedOptions.length > 0)
    ? options.selectedOptions.map((opt) => `  • ${opt}`).join("\n")
    : "  • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನನ ಕುಂಡಲಿ\n  • ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ ವರದಿ V1\n  • ದೈವಿಕ ಪರಿಹಾರ ವರದಿ";

  const msg =
    `*॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಪ್ರೀಮಿಯಂ ಜ್ಯೋತಿಷ್ಯ ದಾಖಲೆಗಳು ॥*\n\n` +
    `ನಮಸ್ಕಾರ *${options.devoteeName}*,\n` +
    `ನಿಮ್ಮ ೧೪೦ ವರ್ಷಗಳ ಪರಂಪರೆಯ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರೀಮಿಯಂ ದಾಖಲೆಗಳ ಅಧಿಕೃತ ZIP ಕಡತ (*${options.zipFileName}*) ಸಿದ್ಧವಾಗಿದೆ.\n\n` +
    (options.birthDate ? `• ಜನ್ಮ ವಿವರ: *${options.birthDate} ${options.birthTime || ""}* (${options.place || "Gokarna"})\n` : "") +
    `• ಒಳಗೊಂಡಿರುವ ವರದಿಗಳು:\n${selectedListText}\n\n` +
    `ದಯವಿಟ್ಟು ಲಗತ್ತಿಸಲಾದ ಕಡತವನ್ನು (Attached ZIP File) ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಪರಿಶೀಲಿಸಿ.\n\n` +
    `ಧನ್ಯವಾದಗಳು!\n— ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362)\n॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ ॥`;

  return `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(msg)}`;
}

/**
 * Packages selected PDFs into a single ZIP file using JSZip
 */
export async function packageOmkarPremiumZip(
  options: OmkarZipPackageOptions
): Promise<OmkarZipPackageResult> {
  const { devoteeName, jananaKundliBlob, bhavishyaV1Blob, remedyBlob, onProgress } = options;
  const zip = new JSZip();
  const safeName = (devoteeName || "Devotee")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{M}\p{N}_]+/gu, "")
    .replace(/^_+|_+$/g, "") || "Devotee";

  const zipFileName = getOmkarZipFileName(devoteeName);
  const includedFiles: string[] = [];

  onProgress?.(10, "ಕಡತಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ (Verifying reports)...");

  // Option 1: Baggona Pancha Janana Kundali
  if (jananaKundliBlob) {
    const f1 = `01_${safeName}_Baggona_Janana_Kundali.pdf`;
    zip.file(f1, jananaKundliBlob);
    includedFiles.push(f1);
  }

  // Option 2: Premium Bhavishya V1
  if (bhavishyaV1Blob) {
    const f2 = `02_${safeName}_Baggona_Bhavishya_V1.pdf`;
    zip.file(f2, bhavishyaV1Blob);
    includedFiles.push(f2);
  }

  // Option 3: Remedy PDF
  if (remedyBlob) {
    const f3 = `03_${safeName}_Baggona_Remedy.pdf`;
    zip.file(f3, remedyBlob);
    includedFiles.push(f3);
  }

  if (includedFiles.length === 0) {
    throw new Error("ಯಾವುದೇ ವರದಿ ಆಯ್ಕೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ವರದಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ (Please select at least one report).");
  }

  onProgress?.(80, "ZIP ಕಡತವನ್ನು ಸಂಯೋಜಿಸಲಾಗುತ್ತಿದೆ (Packaging ZIP archive)...");

  const zipBlob = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      onProgress?.(80 + Math.floor(metadata.percent * 0.18), `ZIP ಸಂಯೋಜನೆ: ${Math.floor(metadata.percent)}%`);
    }
  );

  onProgress?.(100, "ZIP ಸಿದ್ಧವಾಗಿದೆ!");

  return {
    zipBlob,
    zipFileName,
    includedFiles
  };
}
