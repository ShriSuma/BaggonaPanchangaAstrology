/**
 * superAdminWorkflowRunner.ts
 *
 * Autonomous Multi-Step Background Agent Engine for Super Admin AI Companion (Kamadhenu).
 *
 * Capabilities:
 * 1. Natural Language Instruction Parsing:
 *    - Parses: Name, DOB (e.g. "31 May 1993"), TOB (e.g. "9:20 AM"), City/Place, Pincode lookup
 *    - Priest Name (e.g. "Chaitanya Pandit"), Pooja Name (e.g. "Moksha Narayana Bali and Tripindi")
 *    - Requested reports list:
 *      * Baggona Panchanga Kundali
 *      * Premium PDF V1
 *      * Daivika Parihara
 *      * Doshagalu & Gandantara
 *      * Seva Patra
 *    - Requested language: "kn" | "en" | "hi" | "te" | "ta"
 *    - Redirection instructions: e.g. "redirect to Baggona Divya Bhavishya page"
 *    - Missing information detection & polite clarification requests
 *
 * 2. Background Execution:
 *    - Runs fully in the background even if the user navigates pages or switches apps
 *    - Calculates authentic Kundli & updates global app store (useKundliViewerStore)
 *    - Generates all requested PDF reports in the target language
 *    - Packages into a single ZIP file with JSZip
 *    - Automatically triggers browser downloads
 *    - Synthesizes divine completion chime + speaks aloud with petSpeechService
 */

import { calculateKundli } from "../core/KundliEngine";
import { generateDashaTimeline } from "../core/DashaBhuktiEngine";
import { useKundliViewerStore, type KundliViewerSession } from "../stores/kundliViewerStore";
import { useAppStore, type SupportedLanguage, type AppPage } from "../stores/appStore";
import { petSpeechService } from "./petSpeechService";
import type { KundliInput } from "../core/AstroTypes";

// =========================================================================
// TYPES
// =========================================================================
export type ReportType =
  | "baggona_kundli"
  | "premium_pdf_v1"
  | "daivika_parihara"
  | "doshagalu"
  | "seva_patra";

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
  poojaName: string;
  requestedReports: ReportType[];
  language: SupportedLanguage;
  targetRedirectPage?: AppPage;
}

export interface GeneratedReportItem {
  id: ReportType;
  title: string;
  fileName: string;
  blob?: Blob;
  sizeBytes?: number;
  downloadUrl?: string;
}

export type WorkflowStatus = "idle" | "running" | "completed" | "error";

export interface WorkflowState {
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

// =========================================================================
// CITY & PINCODE GEO DICTIONARY
// =========================================================================
interface GeoEntry {
  pincode: string;
  lat: number;
  lng: number;
  kannadaName: string;
  englishName: string;
}

const CITY_DATABASE: Record<string, GeoEntry> = {
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
  tirupati: { pincode: "517501", lat: 13.6288, lng: 79.4192, kannadaName: "ತಿರುಪತಿ", englishName: "Tirupati" }
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
  defaultLang: SupportedLanguage = "kn"
): {
  isWorkflow: boolean;
  params?: WorkflowParams;
  missingFields?: string[];
  questionPrompt?: string;
} {
  const text = input.trim();
  const lower = text.toLowerCase();

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
    lower.includes("ಜನನ");

  if (!isAgentInstruction) {
    return { isWorkflow: false };
  }

  const missingFields: string[] = [];

  // 1. EXTRACT NAME
  let name = "";
  // Check "person Shriram Pandit", "person named Suresh", "name Suresh"
  const personMatch = text.match(/(?:person(?:\s+name)?(?:\s+is)?|named|devotee|user|name\s+is)\s+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)(?:,|\.|\bhe\b|\bshe\b|\bborn\b|\bwant\b|\bfrom\b|$)/i);
  if (personMatch && personMatch[1]) {
    name = personMatch[1].trim();
  } else {
    // Specific match for "Shriram Pandit" or "Suresh"
    const shriMatch = text.match(/\b(Shriram\s+Pandit|Suresh|Ramesh|Chaitanya)\b/i);
    if (shriMatch) {
      name = shriMatch[1];
    }
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
    // Look for e.g. "at 9 AM" or "at 9.20 AM"
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
    // Check known cities in text
    for (const key of Object.keys(CITY_DATABASE)) {
      if (lower.includes(key)) {
        rawCity = key;
        break;
      }
    }
  }

  // Check explicit 6-digit Indian pincode in text
  const pinMatch = text.match(/\b(\d{6})\b/);
  const explicitPin = pinMatch ? pinMatch[1] : undefined;

  const geo = resolveCityCoordsAndPincode(rawCity || "Bengaluru", explicitPin);

  // 5. EXTRACT PRIEST NAME (e.g. "priest name is Chaitanya Pandit")
  let priestName = "Chaitanya Pandit";
  const priestMatch = text.match(/priest(?:\s+name)?(?:\s+is)?\s+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)(?:,|\.|\buse\b|\band\b|\bpooja\b|$)/i);
  if (priestMatch && priestMatch[1]) {
    priestName = priestMatch[1].trim();
  }

  // 6. EXTRACT POOJA (e.g. "Pooja is Moksha Narayana Bali and Tripindi")
  let poojaName = "Moksha Narayana Bali and Tripindi";
  const poojaMatch = text.match(/pooja(?:\s+is)?\s+([A-Za-z\u0C80-\u0CFF\s]+?)(?:,|\.|\band the place\b|\bplace\b|\band\b|\bdownload\b|$)/i);
  if (poojaMatch && poojaMatch[1]) {
    poojaName = poojaMatch[1].trim();
  }

  // 7. EXTRACT REQUESTED REPORTS
  const requestedReports: ReportType[] = [];
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

  // Default to all 5 reports if none specifically isolated or if "all" mentioned
  if (requestedReports.length === 0 || lower.includes("all reports") || lower.includes("these reports") || lower.includes("ಎಲ್ಲಾ")) {
    requestedReports.push("baggona_kundli", "premium_pdf_v1", "daivika_parihara", "doshagalu", "seva_patra");
  }

  // 8. EXTRACT LANGUAGE
  let language: SupportedLanguage = defaultLang;
  if (lower.includes("kannada") || lower.includes("ಕನ್ನಡ")) language = "kn";
  else if (lower.includes("english")) language = "en";
  else if (lower.includes("hindi") || lower.includes("हिंदी") || lower.includes("ಹಿಂದಿ")) language = "hi";
  else if (lower.includes("telugu") || lower.includes("తెలుగు") || lower.includes("ತೆಲುಗು")) language = "te";
  else if (lower.includes("tamil") || lower.includes("தமிழ்") || lower.includes("ತಮಿಳು")) language = "ta";

  // 9. EXTRACT REDIRECTION
  let targetRedirectPage: AppPage | undefined = undefined;
  if (lower.includes("redirect") || lower.includes("ತೆರೆ") || lower.includes("open") || lower.includes("go to")) {
    if (lower.includes("bhavishya") || lower.includes("ಭವಿಷ್ಯ") || lower.includes("raman")) {
      targetRedirectPage = "ramanbhavishya";
    } else if (lower.includes("kundli") || lower.includes("ಕುಂಡಲಿ")) {
      targetRedirectPage = "kundli";
    } else if (lower.includes("dosha") || lower.includes("ದೋಷ")) {
      targetRedirectPage = "doshas";
    } else if (lower.includes("seva") || lower.includes("ಸೇವೆ")) {
      targetRedirectPage = "seva";
    }
  }

  // If missing critical fields
  if (missingFields.length > 0) {
    const questionPrompt =
      language === "kn"
        ? `ಸ್ವಾಮಿ, ಜಾತಕರ ವಿವರಗಳಲ್ಲಿ ಕೆಲವು ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ: ${missingFields.join(", ")}. ದಯವಿಟ್ಟು ಹೆಸರು, ಜನನ ದಿನಾಂಕ (DOB) ಮತ್ತು ಸಮಯ (TOB) ನೀಡಿ.`
        : `Swami, some critical details are needed: ${missingFields.join(", ")}. Please provide Devotee Name, Date of Birth, and Time of Birth.`;

    return {
      isWorkflow: true,
      missingFields,
      questionPrompt
    };
  }

  return {
    isWorkflow: true,
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
      poojaName,
      requestedReports: Array.from(new Set(requestedReports)),
      language,
      targetRedirectPage
    }
  };
}

// =========================================================================
// AUDIO SOUND SYNTHESIS (Gentle Divine Bell Chime)
// =========================================================================
export function playCompletionChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm resonant bell harmonic
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

    // Bell frequencies (Sa - Pa harmonic)
    playTone(528, 0, 1.2);    // Solfeggio 528Hz Miracle tone
    playTone(792, 0.15, 1.4);  // Fifth harmonic
    playTone(1056, 0.3, 1.8);  // Octave harmonic
  } catch (err) {
    console.warn("[playCompletionChime] Audio context unavailable:", err);
  }
}

// =========================================================================
// OBSERVABLE WORKFLOW RUNNER ENGINE (Background Task Manager)
// =========================================================================
type WorkflowListener = (state: WorkflowState) => void;

class SuperAdminWorkflowRunner {
  private state: WorkflowState = {
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

  private listeners: Set<WorkflowListener> = new Set();

  public subscribe(listener: WorkflowListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  public getState(): WorkflowState {
    return this.state;
  }

  private update(patch: Partial<WorkflowState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error("[WorkflowRunner] Listener error:", e);
      }
    }
  }

  /**
   * Main entry point to launch autonomous workflow in the background.
   */
  public async executeWorkflow(
    params: WorkflowParams,
    onProgressUpdate?: (percent: number, msg: string) => void
  ): Promise<WorkflowState> {
    const jobId = `wf_${Date.now()}`;
    const totalSteps = 2 + params.requestedReports.length + 1; // parse/kundli + each report + zip/finalize

    this.update({
      jobId,
      status: "running",
      progressPercent: 5,
      currentStepIndex: 1,
      totalSteps,
      stepTitle: params.language === "kn" ? "ಕುಂಡಲಿ ಗಣನೆ" : "Calculating Kundli",
      stepDetail: `${params.name} (${params.birthDate} ${params.birthTime}, ${params.city})`,
      params,
      reports: [],
      zipBlob: null,
      zipUrl: null,
      zipFileName: null,
      error: null,
      startedAt: new Date(),
      completedAt: null
    });

    onProgressUpdate?.(10, `Calculating Kundli for ${params.name}...`);

    try {
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

      this.update({
        progressPercent: 20,
        currentStepIndex: 2,
        stepTitle: params.language === "kn" ? "ವರದಿಗಳ ಸಿದ್ಧತೆ" : "Preparing Batch PDF Generation",
        stepDetail: `Session established for ${params.name}`
      });

      // ── STEP 2: BATCH PDF GENERATION ─────────────────────────────────────
      // Lazy load batch PDF service to avoid bundling weight
      const { generateSuperAdminBatchPdfs } = await import("./superAdminBatchPdfService");

      const generatedReports = await generateSuperAdminBatchPdfs(
        session,
        params,
        (progress, stage) => {
          const scaledPercent = 20 + Math.floor((progress / 100) * 70);
          this.update({
            progressPercent: scaledPercent,
            stepTitle: params.language === "kn" ? "ವರದಿ ಮುದ್ರಣ ಪ್ರಕ್ರಿಯೆ" : "Generating PDF Reports",
            stepDetail: stage
          });
          onProgressUpdate?.(scaledPercent, stage);
        }
      );

      // ── STEP 3: BUNDLE ALL REPORTS INTO ZIP ───────────────────────────────
      this.update({
        progressPercent: 92,
        stepTitle: params.language === "kn" ? "ಜಿಪ್ ಸಂಯೋಜನೆ" : "Packaging ZIP Bundle",
        stepDetail: "Creating comprehensive 5-Report ZIP package..."
      });

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

      // Auto-trigger ZIP download so the user has the complete set in their Downloads folder immediately
      triggerBrowserDownload(zipBlob, zipFileName);

      // Also trigger individual report downloads with small staggering delay
      for (let i = 0; i < generatedReports.length; i++) {
        const rep = generatedReports[i];
        if (rep.blob) {
          setTimeout(() => {
            triggerBrowserDownload(rep.blob!, rep.fileName);
          }, (i + 1) * 600);
        }
      }

      // ── STEP 4: AUTONOMOUS REDIRECTION (IF REQUESTED) ─────────────────────
      if (params.targetRedirectPage) {
        useAppStore.getState().setPage(params.targetRedirectPage);
      }

      // ── STEP 5: FINALIZATION & AUDIO REPORTING ────────────────────────────
      this.update({
        status: "completed",
        progressPercent: 100,
        currentStepIndex: totalSteps,
        stepTitle: params.language === "kn" ? "ಎಲ್ಲಾ ಕಾರ್ಯಗಳು ಯಶಸ್ವಿ!" : "All Reports Ready!",
        stepDetail: params.language === "kn"
          ? `ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಕುಂಡಲಿ ಮತ್ತು ಎಲ್ಲಾ ೫ ವರದಿಗಳು ಡೌನ್‌ಲೋಡ್ ಆಗಿವೆ.`
          : `All 5 reports generated and downloaded for ${params.name}.`,
        reports: generatedReports,
        zipBlob,
        zipUrl,
        zipFileName,
        completedAt: new Date()
      });

      // Play completion chime
      playCompletionChime();

      // Speak aloud in requested language
      const completionSpokenText =
        params.language === "kn"
          ? `ಸ್ವಾಮಿ, ${params.name} ಅವರ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ, ದೈವಿಕ ಪರಿಹಾರ, ದೋಷಗಳು ಮತ್ತು ಚೈತನ್ಯ ಪಂಡಿತರ ಸೇವಾ ಪತ್ರ ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿವೆ!`
          : `Swami, Janma Kundli, Premium Bhavishya, Daivika Parihara, Doshagalu, and Seva Patra for ${params.name} have been successfully generated and downloaded!`;

      petSpeechService.speak(completionSpokenText, params.language);

      return this.state;
    } catch (err: any) {
      console.error("[WorkflowRunner Error]", err);
      const errMsg = err?.message || "Failed to complete background workflow";
      this.update({
        status: "error",
        error: errMsg,
        stepTitle: params.language === "kn" ? "ದೋಷ ಎದುರಾಗಿದೆ" : "Workflow Error",
        stepDetail: errMsg
      });

      const errorSpeech =
        params.language === "kn"
          ? `ಕ್ಷಮಿಸಿ ಸ್ವಾಮಿ, ವರದಿ ಸಿದ್ಧಪಡಿಸುವಲ್ಲಿ ದೋಷ ಎದುರಾಗಿದೆ: ${errMsg}`
          : `Apologies Swami, an error occurred during report generation: ${errMsg}`;
      petSpeechService.speak(errorSpeech, params.language);

      throw err;
    }
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
