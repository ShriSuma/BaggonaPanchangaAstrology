/**
 * superAdminWorkflowRunner.ts
 *
 * Autonomous Multi-Step Background Agent Engine for Super Admin AI Companion (Kamadhenu).
 *
 * Multi-Instance Capabilities (Up to 10 Concurrent Background Instances):
 * 1. Natural Language Instruction Parsing & Confirmation:
 *    - Parses: Name, DOB (e.g. "31 May 1993"), TOB (e.g. "9:20 AM"), City/Place, Pincode lookup
 *    - Priest Name (e.g. "Chaitanya Pandit"), Pooja Name (e.g. "Moksha Narayana Bali and Tripindi")
 *    - Requested reports list:
 *      * Baggona Panchanga Kundali
 *      * Premium PDF V1
 *      * Daivika Parihara
 *      * Doshagalu & Gandantara
 *      * Seva Patra
 *    - Requested language: "kn" | "en" | "hi" | "te" | "ta"
 *    - Confirmation step before execution
 *
 * 2. Multi-Instance Background Execution:
 *    - Allows up to 10 concurrent background instances ("Kamadhenu 1", "Kamadhenu 2", ..., "Kamadhenu 10")
 *    - Non-blocking: foreground is 100% free for user to navigate, interact, or switch apps
 *    - Real-time instance control: query progress, view step details, or KILL / CANCEL stuck jobs
 *    - On completion: synthesizes divine bell chime, speaks aloud, emits on-screen toast notification
 *    - Downloads all 5 PDFs + unified ZIP directly into user's Downloads folder
 */

import { calculateKundli } from "../core/KundliEngine";
import { generateDashaTimeline } from "../core/DashaBhuktiEngine";
import { useKundliViewerStore, type KundliViewerSession } from "../stores/kundliViewerStore";
import { useAppStore, type SupportedLanguage, type AppPage } from "../stores/appStore";
import { petSpeechService } from "./petSpeechService";
import type { KundliInput } from "../core/AstroTypes";
import { parseWhatsAppKundliText } from "./whatsAppKundliParser";

// =========================================================================
// TYPES
// =========================================================================
export type ReportType =
  | "baggona_kundli"
  | "premium_pdf_v1"
  | "daivika_parihara"
  | "doshagalu"
  | "seva_patra"
  | "multi_question"
  | "single_question";

export interface WorkflowParams {
  rawPrompt: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  priestName: string;
  priestPhone?: string;
  poojaName: string;
  requestedReports: ReportType[];
  includeQrCode?: boolean;
  language: SupportedLanguage;
  targetRedirectPage?: AppPage;
  customQuestions?: string[];
  questionCategory?: string;
  pastedRawText?: string;
  devoteeId?: string;
}

export interface GeneratedReportItem {
  id: ReportType;
  title: string;
  fileName: string;
  blob?: Blob;
  sizeBytes?: number;
  downloadUrl?: string;
}

export type InstanceStatus = "pending" | "running" | "completed" | "cancelled" | "error";

export interface BackgroundJobInstance {
  instanceId: string;
  instanceIndex: number; // 1 to 10 ("Kamadhenu 1", "Kamadhenu 2", etc.)
  instanceName: string;  // e.g. "ಕಾಮಧೇನು ೧ (Kamadhenu 1): Shriram Pandit"
  params: WorkflowParams;
  status: InstanceStatus;
  progressPercent: number;
  currentStepIndex: number;
  totalSteps: number;
  stepTitle: string;
  stepDetail: string;
  reports: GeneratedReportItem[];
  zipBlob?: Blob | null;
  zipUrl?: string | null;
  zipFileName?: string | null;
  error?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  abortController?: AbortController;
}

export interface JobNotification {
  id: string;
  instanceId: string;
  instanceIndex: number;
  title: string;
  message: string;
  devoteeName: string;
  timestamp: Date;
  zipBlob?: Blob | null;
  zipFileName?: string | null;
  reportsCount: number;
}

export type WorkflowStatus = "idle" | "running" | "completed" | "error";

export interface RunnerFleetState {
  instances: BackgroundJobInstance[];
  activeCount: number;
  notifications: JobNotification[];
  // Backward compatibility fields for legacy single-runner readers & tests
  jobId: string | null;
  status: WorkflowStatus;
  progressPercent: number;
  currentStepIndex: number;
  totalSteps: number;
  stepTitle: string;
  stepDetail: string;
  params: WorkflowParams | null;
  reports: GeneratedReportItem[];
  zipBlob?: Blob | null;
  zipUrl?: string | null;
  zipFileName?: string | null;
  error?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export type WorkflowState = RunnerFleetState;

// =========================================================================
// CITY & PINCODE GEO DICTIONARY
// =========================================================================
export interface GeoEntry {
  pincode: string;
  lat: number;
  lng: number;
  kannadaName: string;
  englishName: string;
}

export const CITY_DATABASE: Record<string, GeoEntry> = {
  bengaluru: { pincode: "560001", lat: 12.9716, lng: 77.5946, kannadaName: "ಬೆಂಗಳೂರು", englishName: "Bengaluru" },
  bangalore: { pincode: "560001", lat: 12.9716, lng: 77.5946, kannadaName: "ಬೆಂಗಳೂರು", englishName: "Bengaluru" },
  ಬೆಂಗಳೂರು: { pincode: "560001", lat: 12.9716, lng: 77.5946, kannadaName: "ಬೆಂಗಳೂರು", englishName: "Bengaluru" },
  gokarna: { pincode: "581326", lat: 14.5479, lng: 74.3188, kannadaName: "ಗೋಕರ್ಣ", englishName: "Gokarna" },
  ಗೋಕರ್ಣ: { pincode: "581326", lat: 14.5479, lng: 74.3188, kannadaName: "ಗೋಕರ್ಣ", englishName: "Gokarna" },
  mysuru: { pincode: "570001", lat: 12.2958, lng: 76.6394, kannadaName: "ಮೈಸೂರು", englishName: "Mysuru" },
  mysore: { pincode: "570001", lat: 12.2958, lng: 76.6394, kannadaName: "ಮೈಸೂರು", englishName: "Mysuru" },
  ಮೈಸೂರು: { pincode: "570001", lat: 12.2958, lng: 76.6394, kannadaName: "ಮೈಸೂರು", englishName: "Mysuru" },
  mangaluru: { pincode: "575001", lat: 12.9141, lng: 74.8560, kannadaName: "ಮಂಗಳೂರು", englishName: "Mangaluru" },
  mangalore: { pincode: "575001", lat: 12.9141, lng: 74.8560, kannadaName: "ಮಂಗಳೂರು", englishName: "Mangaluru" },
  ಮಂಗಳೂರು: { pincode: "575001", lat: 12.9141, lng: 74.8560, kannadaName: "ಮಂಗಳೂರು", englishName: "Mangaluru" },
  udupi: { pincode: "576101", lat: 13.3409, lng: 74.7421, kannadaName: "ಉಡುಪಿ", englishName: "Udupi" },
  ಉಡುಪಿ: { pincode: "576101", lat: 13.3409, lng: 74.7421, kannadaName: "ಉಡುಪಿ", englishName: "Udupi" },
  hubballi: { pincode: "580020", lat: 15.3647, lng: 75.1240, kannadaName: "ಹುಬ್ಬಳ್ಳಿ", englishName: "Hubballi" },
  hubli: { pincode: "580020", lat: 15.3647, lng: 75.1240, kannadaName: "ಹುಬ್ಬಳ್ಳಿ", englishName: "Hubballi" },
  ಹುಬ್ಬಳ್ಳಿ: { pincode: "580020", lat: 15.3647, lng: 75.1240, kannadaName: "ಹುಬ್ಬಳ್ಳಿ", englishName: "Hubballi" },
  belagavi: { pincode: "590001", lat: 15.8497, lng: 74.4977, kannadaName: "ಬೆಳಗಾವಿ", englishName: "Belagavi" },
  belgaum: { pincode: "590001", lat: 15.8497, lng: 74.4977, kannadaName: "ಬೆಳಗಾವಿ", englishName: "Belagavi" },
  ಬೆಳಗಾವಿ: { pincode: "590001", lat: 15.8497, lng: 74.4977, kannadaName: "ಬೆಳಗಾವಿ", englishName: "Belagavi" },
  shivamogga: { pincode: "577201", lat: 13.9299, lng: 75.5681, kannadaName: "ಶಿವಮೊಗ್ಗ", englishName: "Shivamogga" },
  shimoga: { pincode: "577201", lat: 13.9299, lng: 75.5681, kannadaName: "ಶಿವಮೊಗ್ಗ", englishName: "Shivamogga" },
  ಶಿವಮೊಗ್ಗ: { pincode: "577201", lat: 13.9299, lng: 75.5681, kannadaName: "ಶಿವಮೊಗ್ಗ", englishName: "Shivamogga" },
  mumbai: { pincode: "400001", lat: 19.0760, lng: 72.8777, kannadaName: "ಮುಂಬೈ", englishName: "Mumbai" },
  delhi: { pincode: "110001", lat: 28.6139, lng: 77.2090, kannadaName: "ದೆಹಲಿ", englishName: "Delhi" },
  chennai: { pincode: "600001", lat: 13.0827, lng: 80.2707, kannadaName: "ಚೆನ್ನೈ", englishName: "Chennai" },
  hyderabad: { pincode: "500001", lat: 17.3850, lng: 78.4867, kannadaName: "ಹೈದರಾಬಾದ್", englishName: "Hyderabad" },
  kolkata: { pincode: "700001", lat: 22.5726, lng: 88.3639, kannadaName: "ಕೋಲ್ಕತ್ತಾ", englishName: "Kolkata" },
  pune: { pincode: "411001", lat: 18.5204, lng: 73.8567, kannadaName: "ಪುಣೆ", englishName: "Pune" },
  varanasi: { pincode: "221001", lat: 25.3176, lng: 82.9739, kannadaName: "ವಾರಣಾಸಿ", englishName: "Varanasi" },
  kashi: { pincode: "221001", lat: 25.3176, lng: 82.9739, kannadaName: "ಕಾಶೀ", englishName: "Kashi" },
  tirupati: { pincode: "517501", lat: 13.6288, lng: 79.4192, kannadaName: "ತಿರುಪತಿ", englishName: "Tirupati" },
  sirsi: { pincode: "581401", lat: 14.6195, lng: 74.8354, kannadaName: "ಶಿರಸಿ", englishName: "Sirsi" },
  ಶಿರಸಿ: { pincode: "581401", lat: 14.6195, lng: 74.8354, kannadaName: "ಶಿರಸಿ", englishName: "Sirsi" },
  karwar: { pincode: "581301", lat: 14.8136, lng: 74.1298, kannadaName: "ಕಾರವಾರ", englishName: "Karwar" },
  ಕಾರವಾರ: { pincode: "581301", lat: 14.8136, lng: 74.1298, kannadaName: "ಕಾರವಾರ", englishName: "Karwar" },
  dharwad: { pincode: "580001", lat: 15.4589, lng: 75.0078, kannadaName: "ಧಾರವಾಡ", englishName: "Dharwad" },
  ಧಾರವಾಡ: { pincode: "580001", lat: 15.4589, lng: 75.0078, kannadaName: "ಧಾರವಾಡ", englishName: "Dharwad" },
  tumakuru: { pincode: "572101", lat: 13.3379, lng: 77.1010, kannadaName: "ತುಮಕೂರು", englishName: "Tumakuru" },
  ತುಮಕೂರು: { pincode: "572101", lat: 13.3379, lng: 77.1010, kannadaName: "ತುಮಕೂರು", englishName: "Tumakuru" },
  davanagere: { pincode: "577001", lat: 14.4644, lng: 75.9218, kannadaName: "ದಾವಣಗೆರೆ", englishName: "Davanagere" },
  ದಾವಣಗೆರೆ: { pincode: "577001", lat: 14.4644, lng: 75.9218, kannadaName: "ದಾವಣಗೆರೆ", englishName: "Davanagere" },
  kalaburagi: { pincode: "585101", lat: 17.3297, lng: 76.8343, kannadaName: "ಕಲಬುರಗಿ", englishName: "Kalaburagi" },
  ಕಲಬುರಗಿ: { pincode: "585101", lat: 17.3297, lng: 76.8343, kannadaName: "ಕಲಬುರಗಿ", englishName: "Kalaburagi" }
};

export function resolveCityCoordsAndPincode(
  cityOrPlace: string,
  explicitPincode?: string
): { city: string; pincode: string; lat: number; lng: number } {
  const norm = (cityOrPlace || "").toLowerCase().trim();
  const found = CITY_DATABASE[norm];

  if (found) {
    return {
      city: found.englishName,
      pincode: explicitPincode || found.pincode,
      lat: found.lat,
      lng: found.lng
    };
  }

  // Check partial match
  for (const [key, entry] of Object.entries(CITY_DATABASE)) {
    if (norm.includes(key) || key.includes(norm)) {
      return {
        city: entry.englishName,
        pincode: explicitPincode || entry.pincode,
        lat: entry.lat,
        lng: entry.lng
      };
    }
  }

  // Fallback defaults to Bengaluru
  return {
    city: cityOrPlace.trim() || "Bengaluru",
    pincode: explicitPincode || "560001",
    lat: 12.9716,
    lng: 77.5946
  };
}

// =========================================================================
// NATURAL LANGUAGE COMMAND PARSER
// =========================================================================
const MONTH_MAP: Record<string, string> = {
  jan: "01", january: "01", ಜನವರಿ: "01",
  feb: "02", february: "02", ಫೆಬ್ರವರಿ: "02",
  mar: "03", march: "03", ಮಾರ್ಚ್: "03",
  apr: "04", april: "04", ಏಪ್ರಿಲ್: "04",
  may: "05", ಮೇ: "05",
  jun: "06", june: "06", ಜೂನ್: "06",
  jul: "07", july: "07", ಜುಲೈ: "07",
  aug: "08", august: "08", ಆಗಸ್ಟ್: "08",
  sep: "09", september: "09", ಸೆಪ್ಟೆಂಬರ್: "09",
  oct: "10", october: "10", ಅಕ್ಟೋಬರ್: "10",
  nov: "11", november: "11", ನವೆಂಬರ್: "11",
  dec: "12", december: "12", ಡಿಸೆಂಬರ್: "12"
};

export function parseWorkflowInstruction(
  input: string,
  defaultLang: SupportedLanguage = "kn",
  ambientProfile?: Partial<WorkflowParams> | {
    hasData?: boolean;
    name?: string;
    birthDate?: string;
    birthTime?: string;
    city?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    priestName?: string;
    priestPhone?: string;
    poojaName?: string;
    customQuestions?: string[];
    pastedRawText?: string;
  } | null
): {
  isWorkflow: boolean;
  params?: WorkflowParams;
  missingFields?: string[];
  questionPrompt?: string;
} {
  const text = input.trim();
  const lower = text.toLowerCase();

  // If raw WhatsApp text is provided either in input or in ambientProfile, parse it!
  const waFromInput = parseWhatsAppKundliText(text);
  const waFromAmbient = ambientProfile?.pastedRawText
    ? parseWhatsAppKundliText(ambientProfile.pastedRawText)
    : null;

  // Check if this is an autonomous agent command
  const isAgentInstruction =
    lower.includes("generate") ||
    lower.includes("kundali") ||
    lower.includes("kundli") ||
    lower.includes("ಕುಂಡಲಿ") ||
    lower.includes("download") ||
    lower.includes("ಡೌನ್‌ಲೋಡ್") ||
    lower.includes("born on") ||
    lower.includes("janma") ||
    lower.includes("ಜನನ") ||
    lower.includes("multi-question") ||
    lower.includes("multi question") ||
    lower.includes("multiquestion") ||
    lower.includes("ಬಹುಪ್ರಶ್ನೆ") ||
    lower.includes("ಬಹುವಿಧ") ||
    lower.includes("single question") ||
    lower.includes("ಒಂದೇ ಪ್ರಶ್ನೆ") ||
    lower.includes("questionnaire") ||
    lower.includes("question area") ||
    lower.includes("ask") ||
    lower.includes("ಕೇಳು") ||
    lower.includes("report") ||
    lower.includes("ವರದಿ") ||
    lower.includes("create") ||
    lower.includes("ಮಾಡಿಕೊಡು") ||
    waFromInput.hasData ||
    Boolean((ambientProfile as any)?.hasData || (ambientProfile as any)?.name);

  if (!isAgentInstruction) {
    return { isWorkflow: false };
  }

  // If the user specifically asks to tell bhavishya / life prediction without asking to download,
  // let the dedicated Bhavishya prediction engine handle it!
  const isBhavishyaOnly =
    (lower.includes("bhavishya") || lower.includes("ಭವಿಷ್ಯ") || lower.includes("predict")) &&
    !lower.includes("download") &&
    !lower.includes("ಡೌನ್‌ಲೋಡ್") &&
    !lower.includes("report") &&
    !lower.includes("ವರದಿ") &&
    !lower.includes("multi-question") &&
    !lower.includes("multi question");

  if (isBhavishyaOnly) {
    return { isWorkflow: false };
  }

  const missingFields: string[] = [];

  // 1. EXTRACT NAME
  let name = "";
  const forBornMatch = text.match(/(?:for|devotee|user|person(?:\s+name)?(?:\s+is)?|named|of)\s+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)\s+(?:born\s+on|born|ಜನನ|ಜನಿಸಿದ|who\s+born)/i);
  if (forBornMatch && forBornMatch[1]) {
    name = forBornMatch[1].trim();
  } else {
    const knAvarigeMatch = text.match(/(?:ಕಾಮಧೇನು|ಹಾಯ್|ನಮಸ್ಕಾರ)?[,\s]+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)(?:\s*\((?:ಜನನ|born)|\s+ಅವರಿಗೆ|\s+ಎಂಬ|\s+ಅವರ)/i);
    if (knAvarigeMatch && knAvarigeMatch[1] && !["ಕಾಮಧೇನು", "ಅರ್ಚಕ", "ಪೂಜೆ", "ಶ್ರೀ", "ಅವರ"].includes(knAvarigeMatch[1].trim())) {
      name = knAvarigeMatch[1].trim();
    } else {
      const personMatch = text.match(/(?:(?<!priest\s+)person(?:\s+name)?(?:\s+is)?|(?<!priest\s+)named|devotee|user|(?<!priest\s+)name\s+is)\s+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)(?:,|\.|\bhe\b|\bshe\b|\bborn\b|\bwant\b|\bfrom\b|$)/i);
      if (personMatch && personMatch[1]) {
        name = personMatch[1].trim();
      } else {
        const shriMatch = text.match(/\b(Shriram\s+Pandit|Suresh|Ramesh|Chaitanya|ರಮೇಶ್|ಸುರೇಶ್|ರಾಘವೇಂದ್ರ|ವೆಂಕಟೇಶ್|ವಿನಾಯಕ್|ಶ್ರೀರಾಮ್\s*ಪಂಡಿತ್)\b/i);
        if (shriMatch) {
          name = shriMatch[1];
        }
      }
    }
  }

  // Fallbacks: WhatsApp parsed input -> ambientProfile -> WhatsApp parsed ambient
  if (!name && waFromInput.hasData && waFromInput.name) {
    name = waFromInput.name;
  }
  if (!name && ambientProfile?.name && ambientProfile.name.trim()) {
    name = ambientProfile.name.trim();
  }
  if (!name && waFromAmbient?.hasData && waFromAmbient.name) {
    name = waFromAmbient.name;
  }

  // Guard against priest/devotee name collision when both are specified
  if (name.toLowerCase().includes("chaitanya") && text.toLowerCase().includes("shriram pandit")) {
    name = "Shriram Pandit";
  }

  if (!name) {
    missingFields.push("name");
  }

  // 2. EXTRACT DOB (e.g. "31 May 1993", "31/05/1993", "1993-05-31")
  let birthDate = "";
  const dateMatch1 = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z\u0C80-\u0CFF]+)\s+(\d{4})\b/);
  if (dateMatch1) {
    const day = dateMatch1[1].padStart(2, "0");
    const mStr = dateMatch1[2].toLowerCase();
    const month = MONTH_MAP[mStr] || "01";
    const year = dateMatch1[3];
    birthDate = `${year}-${month}-${day}`;
  } else {
    const dateMatch2 = text.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (dateMatch2) {
      birthDate = `${dateMatch2[1]}-${dateMatch2[2].padStart(2, "0")}-${dateMatch2[3].padStart(2, "0")}`;
    } else {
      const dateMatch3 = text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
      if (dateMatch3) {
        birthDate = `${dateMatch3[3]}-${dateMatch3[2].padStart(2, "0")}-${dateMatch3[1].padStart(2, "0")}`;
      }
    }
  }

  // Fallbacks: WhatsApp parsed input -> ambientProfile -> WhatsApp parsed ambient
  if (!birthDate && waFromInput.hasData && waFromInput.birthDate) {
    birthDate = waFromInput.birthDate;
  }
  if (!birthDate && ambientProfile?.birthDate) {
    birthDate = ambientProfile.birthDate;
  }
  if (!birthDate && waFromAmbient?.hasData && waFromAmbient.birthDate) {
    birthDate = waFromAmbient.birthDate;
  }

  if (!birthDate) {
    missingFields.push("birthDate");
  }

  // 3. EXTRACT TOB (e.g. "9:20 AM", "09:20", "21:30")
  let birthTime = "";
  const timeMatch = text.match(/\b(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?\b/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2];
    const meridiem = (timeMatch[3] || "").toLowerCase();

    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;

    birthTime = `${hour.toString().padStart(2, "0")}:${minute}`;
  } else {
    const dotTimeMatch = text.match(/\b(\d{1,2})\.(\d{2})\s*(am|pm|AM|PM)\b/);
    if (dotTimeMatch) {
      let hour = parseInt(dotTimeMatch[1], 10);
      const minute = dotTimeMatch[2];
      const meridiem = dotTimeMatch[3].toLowerCase();
      if (meridiem === "pm" && hour < 12) hour += 12;
      if (meridiem === "am" && hour === 12) hour = 0;
      birthTime = `${hour.toString().padStart(2, "0")}:${minute}`;
    }
  }

  // Fallbacks: WhatsApp parsed input -> ambientProfile -> WhatsApp parsed ambient
  if (!birthTime && waFromInput.hasData && waFromInput.birthTime) {
    birthTime = waFromInput.birthTime;
  }
  if (!birthTime && ambientProfile?.birthTime) {
    birthTime = ambientProfile.birthTime;
  }
  if (!birthTime && waFromAmbient?.hasData && waFromAmbient.birthTime) {
    birthTime = waFromAmbient.birthTime;
  }

  if (!birthTime) {
    missingFields.push("birthTime");
  }

  // 4. EXTRACT PLACE / CITY & PINCODE
  let rawCity = "";
  const cityMatch = text.match(/(?:in|at|place(?:\s+is)?)\s+([A-Za-z\u0C80-\u0CFF]+)(?:,|\.|\s+so|\s+and|$)/i);
  if (cityMatch && cityMatch[1]) {
    rawCity = cityMatch[1].trim();
  }
  if (!rawCity) {
    for (const key of Object.keys(CITY_DATABASE)) {
      if (lower.includes(key)) {
        rawCity = key;
        break;
      }
    }
  }
  if (!rawCity && waFromInput.hasData && waFromInput.extractedFields.city) {
    rawCity = waFromInput.extractedFields.city;
  }
  if (!rawCity && ambientProfile?.city) {
    rawCity = ambientProfile.city;
  }
  if (!rawCity && waFromAmbient?.hasData && waFromAmbient.extractedFields.city) {
    rawCity = waFromAmbient.extractedFields.city;
  }

  const pinMatch = text.match(/\b(\d{6})\b/);
  const explicitPin = pinMatch
    ? pinMatch[1]
    : ((waFromInput.hasData && waFromInput.extractedFields.pincode) ||
       ambientProfile?.pincode ||
       (waFromAmbient?.hasData && waFromAmbient.extractedFields.pincode) ||
       undefined);
  const geo = resolveCityCoordsAndPincode(rawCity || "Bengaluru", explicitPin);

  // If ambientProfile has exact geocoordinates, honor them
  if (ambientProfile?.latitude && ambientProfile?.longitude) {
    geo.lat = ambientProfile.latitude;
    geo.lng = ambientProfile.longitude;
  }

  // 5. EXTRACT PRIEST NAME (e.g. "priest name is Chaitanya Pandit" or "ಅರ್ಚಕ ಚೈತನ್ಯ ಪಂಡಿತ್")
  let priestName = ambientProfile?.priestName || "Chaitanya Pandit";
  const priestMatch = text.match(/(?:priest(?:\s+name)?(?:\s+is)?|ಅರ್ಚಕ(?:\s+ಹೆಸರು)?(?:\s+ಆದ|ರಾದ|ರು)?)\s+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)(?:,|\.|\buse\b|\band\b|\bpooja\b|\bmobile\b|\bphone\b|\bfor\b|\s*\(|\s+ಅವರ|\s+ನೇತೃತ್ವದ|$)/i);
  if (priestMatch && priestMatch[1]) {
    priestName = priestMatch[1].trim();
  }

  // 5B. EXTRACT PRIEST PHONE / MOBILE NUMBER
  let priestPhone: string | undefined = ambientProfile?.priestPhone;
  const phoneMatch = text.match(/(?:mobile|phone|contact|ನಂಬರ್|ದೂರವಾಣಿ|ಮೊಬೈಲ್)(?:\s+number)?(?:\s+is)?\s*[:=]?\s*(\+?\d[\d\s-]{8,14}\d)/i);
  if (phoneMatch && phoneMatch[1]) {
    priestPhone = phoneMatch[1].trim();
  } else {
    const direct10Digit = text.match(/\b([6-9]\d{9})\b/);
    if (direct10Digit && direct10Digit[1]) {
      priestPhone = direct10Digit[1];
    }
  }

  // 6. EXTRACT POOJA (e.g. "Pooja is Moksha Narayana Bali and Tripindi" or "... ಮೋಕ್ಷ ನಾರಾಯಣ ಬಲಿ ಪೂಜೆಯ")
  let poojaName = ambientProfile?.poojaName || "Moksha Narayana Bali and Tripindi";
  let poojaMatch = text.match(/pooja(?:\s+is)?\s+([A-Za-z\u0C80-\u0CFF\s&]+?)(?:,|\.|\band the place\b|\band the priest\b|\bplace\b|\bdownload\b|\bpriest\b|$)/i);
  if (!poojaMatch) {
    const knPooja = text.match(/([A-Za-z\u0C80-\u0CFF\s&]+?)\s+ಪೂಜೆ(?:ಯ)?/i);
    if (knPooja && knPooja[1]) {
      const cleaned = knPooja[1].replace(/.*(?:ನೇತೃತ್ವದ|ಆದ|ಸೇವೆ|ಮಾಡಿದ|ಕಾರ್ಯಕ್ರಮದ|ಪೂಜೆಯ|ಅವರ|\))\s*/i, "").trim();
      if (cleaned.length > 2) {
        poojaName = cleaned;
        poojaMatch = knPooja;
      }
    }
  } else if (poojaMatch[1]) {
    poojaName = poojaMatch[1].trim();
  }

  // 7. EXTRACT CUSTOM QUESTIONS (Multi-Question / Single-Question Area Tasks)
  const extractedQuestions: string[] = [];
  const qPromptMatch = text.match(/(?:ask\s+this\s+question|ask\s+question|on\s+this\s+particular\s+question|question\s*[:=-]|ಪ್ರಶ್ನೆ\s*[:=-])\s*[:=-]?\s*([^.,\n]+)/i);
  if (qPromptMatch && qPromptMatch[1]) {
    const q = qPromptMatch[1].replace(/(?:and\s+get|and\s+download|download|report).*/i, "").trim();
    if (q.length > 3) extractedQuestions.push(q);
  }

  if (ambientProfile?.customQuestions && Array.isArray(ambientProfile.customQuestions)) {
    for (const q of ambientProfile.customQuestions) {
      if (q && !extractedQuestions.includes(q)) extractedQuestions.push(q);
    }
  }
  if (waFromInput.customQuestions.length > 0) {
    for (const q of waFromInput.customQuestions) {
      if (q && !extractedQuestions.includes(q)) extractedQuestions.push(q);
    }
  }
  if (waFromAmbient?.customQuestions && waFromAmbient.customQuestions.length > 0) {
    for (const q of waFromAmbient.customQuestions) {
      if (q && !extractedQuestions.includes(q)) extractedQuestions.push(q);
    }
  }

  // 8. EXTRACT REQUESTED REPORTS & QR CODE INTENT
  const requestedReports: ReportType[] = [];

  const isMultiQuestionReq =
    lower.includes("multi-question") ||
    lower.includes("multi question") ||
    lower.includes("multiquestion") ||
    lower.includes("ಬಹುಪ್ರಶ್ನೆ") ||
    lower.includes("ಬಹುವಿಧ ಪ್ರಶ್ನೆ") ||
    lower.includes("questionnaire") ||
    lower.includes("question area");

  const isSingleQuestionReq =
    lower.includes("single question") ||
    lower.includes("ಒಂದೇ ಪ್ರಶ್ನೆ") ||
    lower.includes("single-question") ||
    lower.includes("single questionnaire") ||
    lower.includes("ask astrologer") ||
    lower.includes("ಜ್ಯೋತಿಷಿ ಪ್ರಶ್ನೆ");

  if (isMultiQuestionReq) {
    requestedReports.push("multi_question");
  }
  if (isSingleQuestionReq) {
    requestedReports.push("single_question");
  }

  if (lower.includes("baggona") || lower.includes("kundali") || lower.includes("kundli") || lower.includes("ಕುಂಡಲಿ")) {
    requestedReports.push("baggona_kundli");
  }
  if (lower.includes("premium") || lower.includes("v1") || lower.includes("bhavishya") || lower.includes("ಪ್ರೀಮಿಯಂ")) {
    requestedReports.push("premium_pdf_v1");
  }
  if (lower.includes("daivika") || lower.includes("parihara") || lower.includes("ಪರಿಹಾರ") || lower.includes("remedy")) {
    requestedReports.push("daivika_parihara");
  }
  if (lower.includes("dosha") || lower.includes("ದೋಷ") || lower.includes("doshagalu")) {
    requestedReports.push("doshagalu");
  }
  if (lower.includes("seva") || lower.includes("ಸೇವಾ") || lower.includes("patra")) {
    requestedReports.push("seva_patra");
  }

  const includeQrCode =
    lower.includes("qr") ||
    lower.includes("ಕ್ಯೂಆರ್") ||
    lower.includes("seva and prasada") ||
    lower.includes("ಸೇವಾ ಮತ್ತು ಪ್ರಸಾದ");

  const wantsAllClassicReports =
    lower.includes("all reports") ||
    lower.includes("these reports") ||
    lower.includes("this this this this report") ||
    lower.includes("these these reports") ||
    lower.includes("5 reports") ||
    lower.includes("five reports") ||
    lower.includes("೫ ವರದಿ") ||
    lower.includes("5 ವರದಿ") ||
    lower.includes("ಎಲ್ಲಾ") ||
    lower.includes("ಐದು ವರದಿ");

  if (wantsAllClassicReports || (requestedReports.length === 0 && !isMultiQuestionReq && !isSingleQuestionReq)) {
    requestedReports.push("baggona_kundli", "premium_pdf_v1", "daivika_parihara", "doshagalu", "seva_patra");
  }

  // 9. EXTRACT LANGUAGE
  let language: SupportedLanguage = defaultLang;
  if (lower.includes("kannada") || lower.includes("ಕನ್ನಡ")) language = "kn";
  else if (lower.includes("english") || lower.includes("ಆಂಗ್ಲ")) language = "en";
  else if (lower.includes("hindi") || lower.includes("हिंदी") || lower.includes("ಹಿಂದಿ")) language = "hi";
  else if (lower.includes("telugu") || lower.includes("తెలుగు") || lower.includes("ತೆಲುಗು")) language = "te";
  else if (lower.includes("tamil") || lower.includes("தமிழ்") || lower.includes("ತಮಿಳು")) language = "ta";
  else if (!/[\u0C80-\u0CFF]/.test(text) && /[a-zA-Z]{4,}/.test(text)) {
    language = "en";
  }

  // 10. EXTRACT REDIRECTION
  let targetRedirectPage: AppPage | undefined = undefined;
  if (
    lower.includes("redirect") ||
    lower.includes("ತೆರೆ") ||
    lower.includes("open") ||
    lower.includes("go to") ||
    lower.includes("go and ask") ||
    lower.includes("go")
  ) {
    if (
      lower.includes("bhavishya") ||
      lower.includes("ಭವಿಷ್ಯ") ||
      lower.includes("raman") ||
      lower.includes("multi-question") ||
      lower.includes("multi question") ||
      lower.includes("question area") ||
      lower.includes("questionnaire")
    ) {
      targetRedirectPage = "ramanbhavishya";
    } else if (lower.includes("kundli") || lower.includes("ಕುಂಡಲಿ")) {
      targetRedirectPage = "kundli";
    } else if (lower.includes("dosha") || lower.includes("ದೋಷ")) {
      targetRedirectPage = "doshas";
    } else if (lower.includes("seva") || lower.includes("ಸೇವೆ")) {
      targetRedirectPage = "seva";
    }
  }

  // 11. STRICT SEVA PATRA PARAMETER VALIDATION GUARD
  // User Mandate: "when we are doing Seva Patra we are properly selecting the place,
  // properly selecting the devotee name, properly selecting the priest name and number,
  // properly selecting which Pooja we are doing. Without this input parameter, whatever the download comes,
  // that is waste. So make sure all these parameters are filled with that request. If you don't have information then ask for it."
  const isExplicitSevaPatra =
    !wantsAllClassicReports &&
    (lower.includes("seva patra") ||
      lower.includes("ಸೇವಾ ಪತ್ರ") ||
      lower.includes("ಆಶೀರ್ವಾದ ಪತ್ರ") ||
      lower.includes("ashirvada patra") ||
      (lower.includes("seva") && !lower.includes("all reports") && !lower.includes("5 reports") && !lower.includes("ಐದು ವರದಿ") && !lower.includes("these reports")));

  if (isExplicitSevaPatra) {
    if (!name && !missingFields.includes("name")) missingFields.push("devoteeName");
    if (!rawCity && !ambientProfile?.city) missingFields.push("place");
    if (!priestMatch && !text.match(/\b(Chaitanya\s+Pandit|Shreeram\s+Pandit|Shriram\s+Pandit|ಚೈತನ್ಯ\s+ಪಂಡಿತ್|ಶ್ರೀರಾಮ?\s+ಪಂಡಿತ್)\b/i) && !ambientProfile?.priestName) {
      missingFields.push("priestName");
    }
    if (!priestPhone) {
      missingFields.push("priestPhone");
    }
    if (!poojaMatch && !text.toLowerCase().includes("moksha") && !text.toLowerCase().includes("tripindi") && !text.includes("ಮೋಕ್ಷ") && !text.includes("ತ್ರಿಪಿಂಡಿ") && !ambientProfile?.poojaName) {
      missingFields.push("poojaName");
    }
  }

  if (missingFields.length > 0) {
    const fieldLabelsKn: Record<string, string> = {
      name: "ಜಾತಕರ ಹೆಸರು (Devotee Name)",
      devoteeName: "ಭಕ್ತರ ಹೆಸರು (Devotee Name)",
      birthDate: "ಜನನ ದಿನಾಂಕ (DOB)",
      birthTime: "ಜನನ ಸಮಯ (TOB)",
      place: "ಸ್ಥಳ (Place / City)",
      priestName: "ಅರ್ಚಕರ ಹೆಸರು (Priest Name)",
      priestPhone: "ಅರ್ಚಕರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Priest Phone Number)",
      poojaName: "ಪೂಜೆ ಅಥವಾ ಸೇವೆ (Pooja / Seva Name)"
    };
    const fieldLabelsEn: Record<string, string> = {
      name: "Devotee Name",
      devoteeName: "Devotee Name",
      birthDate: "Date of Birth (DOB)",
      birthTime: "Time of Birth (TOB)",
      place: "Place / City",
      priestName: "Priest Name",
      priestPhone: "Priest Phone Number",
      poojaName: "Pooja / Seva Name"
    };

    const labels = missingFields.map((f) => (language === "kn" ? fieldLabelsKn[f] || f : fieldLabelsEn[f] || f));

    const questionPrompt =
      isExplicitSevaPatra
        ? language === "kn"
          ? `ಸ್ವಾಮಿ, ಅಧಿಕೃತ ಸೇವಾ ಪತ್ರವನ್ನು (೫-ಪುಟಗಳ ಆಶೀರ್ವಾದ ಪತ್ರ) ಸಿದ್ಧಪಡಿಸಲು ಈ ಪ್ರಮುಖ ವಿವರಗಳು ಅತ್ಯಗತ್ಯ:\n• ${labels.join("\n• ")}\n\nಈ ವಿವರಗಳಿಲ್ಲದೆ ಸೇವಾ ಪತ್ರ ಅಪೂರ್ಣವಾಗಿರುತ್ತದೆ. ದಯವಿಟ್ಟು ಈ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ನೀಡಿ, ತಕ್ಷಣ ಅಧಿಕೃತ ಆಶೀರ್ವಾದ ಪತ್ರವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತೇನೆ.`
          : `Swami, to generate the official 5-page Seva Patra (Ashirvada Patra), the following required parameters are missing:\n• ${labels.join("\n• ")}\n\nWithout these parameters the report will be incomplete. Please provide these details to proceed.`
        : language === "kn"
        ? `ಸ್ವಾಮಿ, ಜಾತಕರ ವಿವರಗಳಲ್ಲಿ ಕೆಲವು ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ: ${labels.join(", ")}. ದಯವಿಟ್ಟು ಹೆಸರು, ಜನನ ದಿನಾಂಕ (DOB) ಮತ್ತು ಸಮಯ (TOB) ನೀಡಿ ಅಥವಾ ವಾಟ್ಸಾಪ್/ಟೆಲಿಗ್ರಾಮ್ ಸಂದೇಶವನ್ನು ಪೇಸ್ಟ್ ಮಾಡಿ.`
        : `Swami, some critical details are needed: ${labels.join(", ")}. Please provide Devotee Name, Date of Birth, and Time of Birth or paste the WhatsApp/Telegram message.`;

    return {
      isWorkflow: true,
      missingFields,
      questionPrompt
    };
  }

  return {
    isWorkflow: true,
    missingFields: [],
    params: {
      rawPrompt: text,
      name,
      birthDate,
      birthTime,
      city: geo.city,
      pincode: geo.pincode,
      latitude: geo.lat,
      longitude: geo.lng,
      priestName,
      priestPhone,
      poojaName,
      requestedReports: Array.from(new Set(requestedReports)),
      includeQrCode,
      language,
      targetRedirectPage,
      customQuestions: extractedQuestions.length > 0 ? extractedQuestions : undefined,
      pastedRawText: ambientProfile?.pastedRawText || (waFromInput.hasData ? waFromInput.rawText : undefined)
    }
  };
}

// =========================================================================
// CONFIRMATION & INTERACTIVE MODIFICATION INTENT HELPERS
// =========================================================================
export function isConfirmationAffirmative(query: string): boolean {
  const q = query.trim().toLowerCase();
  return (
    q === "confirm" ||
    q === "yes" ||
    q === "ok" ||
    q === "okay" ||
    q === "proceed" ||
    q === "start" ||
    q === "run" ||
    q === "go ahead" ||
    q === "ಮಾಡಿಕೊಡು" ||
    q === "ಹೌದು" ||
    q === "ಖಚಿತ" ||
    q === "ಖಚಿತಪಡಿಸು" ||
    q === "ಪ್ರಾರಂಭಿಸು" ||
    q === "ಸರಿ" ||
    q === "ಆಗಲಿ" ||
    q.startsWith("confirm") ||
    q.startsWith("yes") ||
    q.includes("ಖಚಿತಪಡಿಸು") ||
    q.includes("ಪ್ರಾರಂಭಿಸು") ||
    q.includes("go ahead") ||
    q.includes("proceed")
  );
}

export function isConfirmationCancellation(query: string): boolean {
  const q = query.trim().toLowerCase();
  return (
    q === "cancel" ||
    q === "stop" ||
    q === "abort" ||
    q === "ರದ್ದು" ||
    q === "ರದ್ದುಮಾಡು" ||
    q === "ಬೇಡ" ||
    q === "ನಿಲ್ಲಿಸು" ||
    q.includes("cancel") ||
    q.includes("ರದ್ದು")
  );
}

export function isConfirmationModification(query: string): boolean {
  const q = query.trim().toLowerCase();
  return (
    q.includes("change") ||
    q.includes("update") ||
    q.includes("modify") ||
    q.includes("replace") ||
    q.includes("instead") ||
    q.includes("ಬದಲಾಯಿಸು") ||
    q.includes("ಬದಲು") ||
    q.includes("ತಿದ್ದು") ||
    q.includes("ನವೀಕರಿಸು") ||
    q.includes("ಹಾಕು") ||
    q.includes("ಸೇರಿಸು") ||
    q.includes("ತೆಗೆದುಹಾಕು")
  );
}

/**
 * Modifies an existing pending workflow based on the user's natural language edit command.
 */
export function modifyPendingWorkflow(
  existing: WorkflowParams,
  updatePrompt: string,
  lang: SupportedLanguage = "kn"
): { updatedParams: WorkflowParams; changedFields: string[] } {
  const updated = { ...existing, rawPrompt: `${existing.rawPrompt} | Modified: ${updatePrompt}` };
  const changedFields: string[] = [];
  const text = updatePrompt.trim();
  const lower = text.toLowerCase();

  // 1. Check Priest Name Change
  const priestMatch = text.match(/(?:priest|ಅರ್ಚಕರು?|ಪಂಡಿತರು?)(?:\s+name)?(?:\s+(?:is|to|as))?\s+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)(?:,|\.|\buse\b|\band\b|\bpooja\b|\bmobile\b|$)/i);
  if (priestMatch && priestMatch[1]) {
    updated.priestName = priestMatch[1].trim();
    changedFields.push(lang === "kn" ? `ಅರ್ಚಕರ ಹೆಸರು: ${updated.priestName}` : `Priest Name: ${updated.priestName}`);
  }

  // 2. Check Mobile / Phone Change
  const phoneMatch = text.match(/(?:mobile|phone|contact|ನಂಬರ್|ದೂರವಾಣಿ|ಮೊಬೈಲ್)(?:\s+number)?(?:\s+(?:is|to|as))?\s*[:=]?\s*(\+?\d[\d\s-]{8,14}\d)/i);
  if (phoneMatch && phoneMatch[1]) {
    updated.priestPhone = phoneMatch[1].trim();
    changedFields.push(lang === "kn" ? `ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: ${updated.priestPhone}` : `Mobile Number: ${updated.priestPhone}`);
  } else {
    const direct10Digit = text.match(/\b([6-9]\d{9})\b/);
    if (direct10Digit && direct10Digit[1]) {
      updated.priestPhone = direct10Digit[1];
      changedFields.push(lang === "kn" ? `ಮೊಬೈಲ್ ಸಂಖ್ಯೆ: ${updated.priestPhone}` : `Mobile Number: ${updated.priestPhone}`);
    }
  }

  // 3. Check Pooja Name Change
  const poojaMatch = text.match(/(?:pooja|ಪೂಜೆ|ಸೇವೆ)(?:\s+(?:is|to|as))?\s+([A-Za-z\u0C80-\u0CFF\s]+?)(?:,|\.|\band\b|\bplace\b|$)/i);
  if (poojaMatch && poojaMatch[1]) {
    updated.poojaName = poojaMatch[1].trim();
    changedFields.push(lang === "kn" ? `ಪೂಜೆ / ಸೇವೆ: ${updated.poojaName}` : `Pooja / Seva: ${updated.poojaName}`);
  }

  // 4. Check City / Place Change
  const cityMatch = text.match(/(?:place|city|ಸ್ಥಳ|ಊರು)(?:\s+(?:is|to|as))?\s+([A-Za-z\u0C80-\u0CFF]+)/i);
  if (cityMatch && cityMatch[1]) {
    const newCity = cityMatch[1].trim();
    const geo = resolveCityCoordsAndPincode(newCity);
    updated.city = geo.city;
    updated.pincode = geo.pincode;
    updated.latitude = geo.lat;
    updated.longitude = geo.lng;
    changedFields.push(lang === "kn" ? `ಸ್ಥಳ & ಪಿನ್‌ಕೋಡ್: ${geo.city} (${geo.pincode})` : `Place & Pincode: ${geo.city} (${geo.pincode})`);
  }

  // 5. Check Devotee Name Change
  const nameMatch = text.match(/(?:name|devotee|user|ಜಾತಕರು|ಹೆಸರು)(?:\s+(?:is|to|as))?\s+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)(?:,|\.|\band\b|$)/i);
  if (nameMatch && nameMatch[1]) {
    updated.name = nameMatch[1].trim();
    changedFields.push(lang === "kn" ? `ಜಾತಕರ ಹೆಸರು: ${updated.name}` : `Devotee Name: ${updated.name}`);
  }

  // 6. Check QR Code addition
  if (lower.includes("qr") || lower.includes("ಕ್ಯೂಆರ್") || lower.includes("seva and prasada") || lower.includes("ಸೇವಾ ಮತ್ತು ಪ್ರಸಾದ")) {
    updated.includeQrCode = true;
    changedFields.push(lang === "kn" ? `ಸೇವಾ ಮತ್ತು ಪ್ರಸಾದ QR ಕೋಡ್: ಸೇರಿಸಲಾಗಿದೆ` : `Seva & Prasada QR Code: Included`);
  }

  return { updatedParams: updated, changedFields };
}

// =========================================================================
// AUDIO SOUND SYNTHESIS (Gentle Divine Bell Chime)
// =========================================================================
export function playCompletionChime(): void {
  try {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, startDelay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + startDelay);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + startDelay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startDelay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + duration);
    };

    playTone(528, 0, 1.2);
    playTone(792, 0.15, 1.4);
    playTone(1056, 0.3, 1.8);
  } catch (err) {
    console.warn("[playCompletionChime] Audio context unavailable:", err);
  }
}

// =========================================================================
// MULTI-INSTANCE OBSERVABLE FLEET ENGINE (Up to 10 Simultaneous Background Jobs)
// =========================================================================
type FleetListener = (state: RunnerFleetState) => void;

class SuperAdminWorkflowRunner {
  private fleetState: RunnerFleetState = {
    instances: [],
    activeCount: 0,
    notifications: [],
    // Legacy single-job mirrors
    jobId: null,
    status: "idle",
    progressPercent: 0,
    currentStepIndex: 0,
    totalSteps: 7,
    stepTitle: "",
    stepDetail: "",
    params: null,
    reports: [],
    zipBlob: null,
    zipUrl: null,
    zipFileName: null,
    error: null,
    startedAt: null,
    completedAt: null
  };

  private listeners: Set<FleetListener> = new Set();

  public subscribe(listener: FleetListener): () => void {
    this.listeners.add(listener);
    listener(this.fleetState);
    return () => this.listeners.delete(listener);
  }

  public getState(): RunnerFleetState {
    return this.fleetState;
  }

  private notifyUpdate(): void {
    const active = this.fleetState.instances.filter((i) => i.status === "running").length;
    const latest = this.fleetState.instances[this.fleetState.instances.length - 1];

    this.fleetState = {
      ...this.fleetState,
      activeCount: active,
      jobId: latest?.instanceId || null,
      status: latest?.status === "running" ? "running" : latest?.status === "completed" ? "completed" : latest?.status === "error" ? "error" : "idle",
      progressPercent: latest?.progressPercent || 0,
      currentStepIndex: latest?.currentStepIndex || 0,
      totalSteps: latest?.totalSteps || 7,
      stepTitle: latest?.stepTitle || "",
      stepDetail: latest?.stepDetail || "",
      params: latest?.params || null,
      reports: latest?.reports || [],
      zipBlob: latest?.zipBlob || null,
      zipUrl: latest?.zipUrl || null,
      zipFileName: latest?.zipFileName || null,
      error: latest?.error || null,
      startedAt: latest?.startedAt || null,
      completedAt: latest?.completedAt || null
    };

    for (const listener of this.listeners) {
      try {
        listener(this.fleetState);
      } catch (e) {
        console.error("[WorkflowRunner] Listener error:", e);
      }
    }
  }

  /**
   * Finds the lowest available slot number (1 to 10) for naming (e.g. Kamadhenu 1..10)
   */
  public getNextAvailableSlotIndex(): number {
    const runningIndices = new Set(
      this.fleetState.instances
        .filter((i) => i.status === "running" || i.status === "pending")
        .map((i) => i.instanceIndex)
    );

    for (let slot = 1; slot <= 10; slot++) {
      if (!runningIndices.has(slot)) {
        return slot;
      }
    }
    return 1;
  }

  /**
   * Starts a new concurrent background job instance (up to 10 simultaneous instances).
   */
  public startInstance(params: WorkflowParams): BackgroundJobInstance {
    const runningCount = this.fleetState.instances.filter((i) => i.status === "running").length;
    if (runningCount >= 10) {
      throw new Error("Maximum 10 simultaneous background instances reached. Please wait or cancel an active job.");
    }

    const slotIndex = this.getNextAvailableSlotIndex();
    const instanceId = `inst_${Date.now()}_${slotIndex}`;
    const totalSteps = 2 + params.requestedReports.length + 1;
    const abortController = new AbortController();

    const knNumeral = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯", "೧೦"][slotIndex] || String(slotIndex);
    const instanceName =
      params.language === "kn"
        ? `ಕಾಮಧೇನು ${knNumeral}: ${params.name}`
        : `Kamadhenu ${slotIndex}: ${params.name}`;

    const newInstance: BackgroundJobInstance = {
      instanceId,
      instanceIndex: slotIndex,
      instanceName,
      params,
      status: "running",
      progressPercent: 5,
      currentStepIndex: 1,
      totalSteps,
      stepTitle: params.language === "kn" ? "ಕುಂಡಲಿ ಗಣನೆ" : "Calculating Kundli",
      stepDetail: `${params.name} (${params.birthDate} ${params.birthTime}, ${params.city})`,
      reports: [],
      zipBlob: null,
      zipUrl: null,
      zipFileName: null,
      error: null,
      startedAt: new Date(),
      completedAt: null,
      abortController
    };

    // Remove any previous completed/cancelled instance occupying the same slot number
    const filtered = this.fleetState.instances.filter((i) => !(i.instanceIndex === slotIndex && (i.status === "completed" || i.status === "cancelled")));
    filtered.push(newInstance);
    this.fleetState.instances = filtered;
    this.notifyUpdate();

    // Spawn async background processing without blocking caller!
    this.runInstancePipeline(newInstance);

    return newInstance;
  }

  private async runInstancePipeline(instance: BackgroundJobInstance): Promise<void> {
    const params = instance.params;
    const signal = instance.abortController?.signal;

    try {
      if (signal?.aborted) throw new Error("Job cancelled by user");

      // ── STEP 1: AUTHENTIC KUNDLI CALCULATION ──────────────────────────────
      const kundliInput: KundliInput = {
        name: params.name,
        birthDate: params.birthDate,
        birthTime: params.birthTime,
        latitude: params.latitude,
        longitude: params.longitude,
        pincode: params.pincode,
        gender: "Male"
      };

      const kundliOutput = calculateKundli(kundliInput);
      const dashaTimeline = generateDashaTimeline(kundliOutput);

      const session: KundliViewerSession = {
        result: kundliOutput,
        input: kundliInput,
        birthDateYmd: params.birthDate,
        birthTimeHm: params.birthTime,
        homePlaceName: params.city,
        placeLabel: `${params.city} (${params.pincode})`,
        dasha: dashaTimeline,
        dailyPrediction: `Baggona Panchanga Kundli generated for ${params.name}`
      };

      // Set global session so the entire app reflects this Kundli
      useKundliViewerStore.getState().setSession(session);

      instance.progressPercent = 20;
      instance.currentStepIndex = 2;
      instance.stepTitle = params.language === "kn" ? "ವರದಿಗಳ ಸಿದ್ಧತೆ" : "Preparing Batch PDF Generation";
      instance.stepDetail = `Session established for ${params.name}`;
      this.notifyUpdate();

      if (signal?.aborted) throw new Error("Job cancelled by user");

      // ── STEP 2: BATCH PDF GENERATION ─────────────────────────────────────
      const { generateSuperAdminBatchPdfs } = await import("./superAdminBatchPdfService");

      const generatedReports = await generateSuperAdminBatchPdfs(
        session,
        params,
        (progress, stage) => {
          if (signal?.aborted) return;
          const scaledPercent = 20 + Math.floor((progress / 100) * 70);
          instance.progressPercent = scaledPercent;
          instance.stepTitle = params.language === "kn" ? "ವರದಿ ಮುದ್ರಣ ಪ್ರಕ್ರಿಯೆ" : "Generating PDF Reports";
          instance.stepDetail = stage;
          this.notifyUpdate();
        },
        signal
      );

      if (signal?.aborted) throw new Error("Job cancelled by user");

      // ── STEP 3: BUNDLE ALL REPORTS INTO ZIP ───────────────────────────────
      instance.progressPercent = 92;
      instance.stepTitle = params.language === "kn" ? "ಜಿಪ್ ಸಂಯೋಜನೆ" : "Packaging ZIP Bundle";
      instance.stepDetail = "Creating comprehensive 5-Report ZIP package...";
      this.notifyUpdate();

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const zipFolder = zip.folder(`Baggona_${params.name.replace(/\s+/g, "_")}_Reports`) || zip;

      for (const rep of generatedReports) {
        if (rep.blob) {
          zipFolder.file(rep.fileName, rep.blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const cleanName = params.name.replace(/[^a-zA-Z0-9_\u0C80-\u0CFF]/g, "_") || "Devotee";
      const zipFileName = `Baggona_${cleanName}_All_5_Reports_${params.language.toUpperCase()}.zip`;
      const zipUrl = typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(zipBlob)
        : `blob:mock/${zipFileName}`;

      instance.reports = generatedReports;
      instance.zipBlob = zipBlob;
      instance.zipUrl = zipUrl;
      instance.zipFileName = zipFileName;

      // Auto-trigger ZIP download directly into user's Downloads folder
      triggerBrowserDownload(zipBlob, zipFileName);

      // Auto-trigger individual report downloads with small staggering delay
      for (let i = 0; i < generatedReports.length; i++) {
        const rep = generatedReports[i];
        if (rep.blob) {
          setTimeout(() => {
            triggerBrowserDownload(rep.blob!, rep.fileName);
          }, (i + 1) * 600);
        }
      }

      // ── STEP 4: RECORD TO DEVOTEE CONSULTATION HISTORY STORE ──────────────
      try {
        const { useDevoteeHistoryStore } = await import("../stores/devoteeHistoryStore");
        const historyStore = useDevoteeHistoryStore.getState();
        const devotee = historyStore.upsertDevotee({
          id: params.devoteeId,
          name: params.name,
          birthDate: params.birthDate,
          birthTime: params.birthTime,
          city: params.city,
          pincode: params.pincode,
          latitude: params.latitude,
          longitude: params.longitude,
          customQuestions: params.customQuestions,
          rawText: params.pastedRawText
        });
        for (const rep of generatedReports) {
          historyStore.appendReport(devotee.id, {
            reportType: rep.id,
            title: rep.title,
            fileName: rep.fileName
          });
        }
      } catch (err) {
        console.warn("Devotee history report record failed:", err);
      }

      // ── STEP 5: AUTONOMOUS REDIRECTION (IF REQUESTED) ─────────────────────
      if (params.targetRedirectPage) {
        useAppStore.getState().setPage(params.targetRedirectPage);
      }

      // ── STEP 5: FINALIZATION & TOAST NOTIFICATION ─────────────────────────
      instance.status = "completed";
      instance.progressPercent = 100;
      instance.currentStepIndex = instance.totalSteps;
      instance.stepTitle = params.language === "kn" ? "ಎಲ್ಲಾ ಕಾರ್ಯಗಳು ಯಶಸ್ವಿ!" : "All Reports Ready!";
      instance.stepDetail = params.language === "kn"
        ? `${params.name} ಅವರ ಕುಂಡಲಿ ಮತ್ತು ಎಲ್ಲಾ ೫ ವರದಿಗಳು ಡೌನ್‌ಲೋಡ್ ಆಗಿವೆ.`
        : `All 5 reports generated and downloaded for ${params.name}.`;
      instance.completedAt = new Date();

      // Emit on-screen foreground toast notification
      const notifId = `notif_${Date.now()}`;
      const knNum = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯", "೧೦"][instance.instanceIndex] || String(instance.instanceIndex);
      const notifTitle =
        params.language === "kn"
          ? `🎉 ಕಾಮಧೇನು ${knNum}: ${params.name}`
          : `🎉 Kamadhenu ${instance.instanceIndex}: ${params.name}`;
      const notifMessage =
        params.language === "kn"
          ? `ಕಾಮಧೇನು ${knNum}: ${params.name} ಅವರ ವಿವರಗಳು ಮತ್ತು ೫ ವರದಿಗಳು ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿವೆ!`
          : `Kamadhenu ${instance.instanceIndex}: ${params.name} details and 5 reports have been downloaded successfully!`;

      this.fleetState.notifications = [
        ...this.fleetState.notifications,
        {
          id: notifId,
          instanceId: instance.instanceId,
          instanceIndex: instance.instanceIndex,
          title: notifTitle,
          message: notifMessage,
          devoteeName: params.name,
          timestamp: new Date(),
          zipBlob,
          zipFileName,
          reportsCount: generatedReports.length
        }
      ];

      this.notifyUpdate();

      // Synthesize gentle chime
      playCompletionChime();

      // Announce aloud via speech
      const completionSpeech =
        params.language === "kn"
          ? `ಕಾಮಧೇನು ${knNum}: ${params.name} ಅವರ ವಿವರಗಳು ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿವೆ.`
          : `Kamadhenu ${instance.instanceIndex}: ${params.name} details have been downloaded successfully.`;
      petSpeechService.speak(completionSpeech, params.language);

    } catch (err: any) {
      if (signal?.aborted) {
        instance.status = "cancelled";
        instance.stepTitle = params.language === "kn" ? "ಕಾರ್ಯ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ" : "Job Cancelled";
        instance.stepDetail = "User terminated this background instance.";
        this.notifyUpdate();
        return;
      }

      console.error(`[WorkflowRunner Error on ${instance.instanceName}]`, err);
      instance.status = "error";
      instance.error = err?.message || "Failed to complete background workflow";
      instance.stepTitle = params.language === "kn" ? "ದೋಷ ಎದುರಾಗಿದೆ" : "Workflow Error";
      instance.stepDetail = instance.error || "";
      this.notifyUpdate();

      const errorSpeech =
        params.language === "kn"
          ? `ಕ್ಷಮಿಸಿ ಸ್ವಾಮಿ, ಕಾಮಧೇನು ${instance.instanceIndex} ಕಾರ್ಯದಲ್ಲಿ ದೋಷ ಎದುರಾಗಿದೆ: ${instance.error}`
          : `Apologies Swami, an error occurred in Kamadhenu ${instance.instanceIndex}: ${instance.error}`;
      petSpeechService.speak(errorSpeech, params.language);
    }
  }

  /**
   * Kills / aborts an active background job instantaneously.
   */
  public killJob(instanceId: string): void {
    const inst = this.fleetState.instances.find((i) => i.instanceId === instanceId);
    if (!inst) return;

    if (inst.status === "running") {
      inst.abortController?.abort();
      inst.status = "cancelled";
      inst.stepTitle = inst.params.language === "kn" ? "ಕಾರ್ಯ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ" : "Job Cancelled";
      inst.stepDetail = "Terminated by Super Admin.";
      this.notifyUpdate();

      const killSpeech =
        inst.params.language === "kn"
          ? `ಕಾಮಧೇನು ${inst.instanceIndex} ಕಾರ್ಯವನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.`
          : `Kamadhenu ${inst.instanceIndex} has been cancelled.`;
      petSpeechService.speak(killSpeech, inst.params.language);
    }
  }

  /**
   * Clears a completed or cancelled instance from the list.
   */
  public clearJob(instanceId: string): void {
    this.fleetState.instances = this.fleetState.instances.filter((i) => i.instanceId !== instanceId);
    this.notifyUpdate();
  }

  /**
   * Dismisses a foreground toast notification.
   */
  public dismissNotification(notifId: string): void {
    this.fleetState.notifications = this.fleetState.notifications.filter((n) => n.id !== notifId);
    this.notifyUpdate();
  }

  /**
   * Legacy wrapper for single-job execution and unit tests.
   */
  public async executeWorkflow(
    params: WorkflowParams,
    onProgressUpdate?: (percent: number, msg: string) => void
  ): Promise<RunnerFleetState> {
    const inst = this.startInstance(params);

    // Wait for this specific instance to finish
    await new Promise<void>((resolve, reject) => {
      const check = setInterval(() => {
        const found = this.fleetState.instances.find((i) => i.instanceId === inst.instanceId);
        if (!found) {
          clearInterval(check);
          resolve();
        } else if (found.status === "completed") {
          clearInterval(check);
          resolve();
        } else if (found.status === "cancelled") {
          clearInterval(check);
          reject(new Error("Job cancelled by user"));
        } else if (found.status === "error") {
          clearInterval(check);
          reject(new Error(found.error || "Workflow failed"));
        } else if (found.status === "running") {
          onProgressUpdate?.(found.progressPercent, found.stepDetail);
        }
      }, 250);
    });

    return this.fleetState;
  }
}

// Utility to trigger browser downloads cleanly
export function triggerBrowserDownload(blob: Blob, fileName: string): void {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentElement) document.body.removeChild(a);
      if (typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(url);
    }, 2000);
  } catch (err) {
    console.error("[triggerBrowserDownload] Download failed:", err);
  }
}

export const superAdminWorkflowRunner = new SuperAdminWorkflowRunner();
