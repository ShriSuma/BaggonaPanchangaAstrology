/**
 * whatsAppKundliParser.ts
 *
 * High-Precision Robust Parser for WhatsApp / Telegram Devotee Chat Messages.
 * Extracts:
 * - Devotee Name (Kannada, English, Devanagari)
 * - Date of Birth (DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, Month Names in KN/EN)
 * - Time of Birth (12h AM/PM, 24h, Kannada morning/evening markers)
 * - Place / City & Indian 6-digit Pincode
 * - Custom Questions / Inquiries (for Single or Multi-Question Astrological Reports)
 */

import { resolveCityCoordsAndPincode } from "./superAdminWorkflowRunner";

export interface ParsedWhatsAppKundli {
  rawText: string;
  hasData: boolean;
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm (24h)
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  customQuestions: string[];
  extractedFields: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    city?: string;
    pincode?: string;
    questions?: string[];
  };
}

const MONTH_NAME_MAP: Record<string, string> = {
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

/**
 * Strips WhatsApp / Telegram metadata like forwarded headers, timestamps, and phone numbers.
 */
function cleanRawMessage(raw: string): string {
  let cleaned = raw
    // Remove WhatsApp forward tags e.g. [14/05, 10:20 am] +91 98860 12345:
    .replace(/\[\d{1,2}[/-]\d{1,2}[^\]]*\]\s*[^:]*:\s*/g, " ")
    .replace(/(?:forwarded message|ಫಾರ್ವರ್ಡ್ ಮಾಡಿದ ಸಂದೇಶ)/gi, " ")
    // Remove phone number lines if isolated
    .replace(/^\+?\d{1,3}[-.\s]?\d{10}\s*$/gm, " ")
    // Clean bullet points
    .replace(/^[•*\->]\s*/gm, "");

  return cleaned.trim();
}

/**
 * Parses pasted WhatsApp / Telegram chat text into structured devotee profile & questions.
 */
export function parseWhatsAppKundliText(rawInput: string): ParsedWhatsAppKundli {
  const text = cleanRawMessage(rawInput || "");
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let extractedName = "";
  let extractedBirthDate = "";
  let extractedBirthTime = "";
  let extractedCity = "";
  let extractedPincode = "";
  const extractedQuestions: string[] = [];

  // 1. EXTRACT PINCODE (6-digit Indian PIN)
  const pinMatch = text.match(/\b([1-9][0-9]{5})\b/);
  if (pinMatch) {
    extractedPincode = pinMatch[1];
  }

  // 2. EXTRACT DATE OF BIRTH
  // Priority A: Explicit labeled line (DOB, Date of Birth, ದಿನಾಂಕ, ಜನನ ದಿನಾಂಕ)
  for (const line of lines) {
    const dobLabelMatch = line.match(/(?:dob|date\s+of\s+birth|birth\s+date|date|ಹುಟ್ಟಿದ\s*ದಿನ(?:ಾಂಕ)?|ಜನನ\s*ದಿನ(?:ಾಂಕ)?|ದಿನಾಂಕ)\s*[:=-]?\s*(.+)/i);
    if (dobLabelMatch && dobLabelMatch[1]) {
      const val = dobLabelMatch[1].trim();
      const parsed = parseDateString(val);
      if (parsed) {
        extractedBirthDate = parsed;
        break;
      }
    }
  }

  // Priority B: Pattern anywhere in text if not found yet
  if (!extractedBirthDate) {
    extractedBirthDate = parseDateString(text) || "";
  }

  // 3. EXTRACT TIME OF BIRTH
  // Priority A: Explicit labeled line (Time, TOB, Time of Birth, ಸಮಯ, ಜನನ ಸಮಯ)
  for (const line of lines) {
    const tobLabelMatch = line.match(/(?:tob|time\s+of\s+birth|birth\s+time|time|ಜನನ\s*ಸಮಯ|ಹುಟ್ಟಿದ\s*ಸಮಯ|ಸಮಯ)\s*[:=-]?\s*(.+)/i);
    if (tobLabelMatch && tobLabelMatch[1]) {
      const val = tobLabelMatch[1].trim();
      const parsed = parseTimeString(val);
      if (parsed) {
        extractedBirthTime = parsed;
        break;
      }
    }
  }

  // Priority B: Pattern anywhere in text if not found yet
  if (!extractedBirthTime) {
    extractedBirthTime = parseTimeString(text) || "";
  }

  // 4. EXTRACT PLACE / CITY
  // Priority A: Explicit labeled line (Place, City, POB, ಸ್ಥಳ, ಊರು, ನಗರ)
  for (const line of lines) {
    const placeLabelMatch = line.match(/(?:pob|place\s+of\s+birth|birth\s+place|place|city|ಸ್ಥಳ|ಊರು|ನಗರ)\s*[:=-]?\s*(.+)/i);
    if (placeLabelMatch && placeLabelMatch[1]) {
      let candidate = placeLabelMatch[1].replace(/\b[1-9][0-9]{5}\b/g, "").replace(/[,.-]/g, " ").trim();
      if (candidate && candidate.length >= 2 && !candidate.toLowerCase().includes("question")) {
        extractedCity = candidate;
        break;
      }
    }
  }

  // Priority B: Known cities lookup across text
  if (!extractedCity) {
    const knownCities = [
      "Bengaluru", "Bangalore", "Gokarna", "Hubli", "Hubballi", "Mysore", "Mysuru",
      "Mangalore", "Mangaluru", "Belagavi", "Belgaum", "Sirsi", "Shimoga", "Shivamogga",
      "Udupi", "Dharwad", "Karwar", "Davangere", "Bellary", "Ballari", "Tumakuru", "Tumkur",
      "Kalaburagi", "Gulbarga", "Hassan", "Bidar", "Kolar", "Mandya", "Chitradurga", "Koppal",
      "Delhi", "New Delhi", "Mumbai", "Pune", "Chennai", "Hyderabad", "Kolkata", "Ahmedabad",
      "Kashi", "Varanasi", "Tirupati"
    ];
    for (const city of knownCities) {
      const reg = new RegExp(`\\b${city}\\b`, "i");
      if (reg.test(text)) {
        extractedCity = city;
        break;
      }
    }
  }

  // 5. EXTRACT NAME
  // Priority A: Explicit labeled line (Name, Devotee, Client, ಹೆಸರು, ಜಾತಕರು)
  for (const line of lines) {
    const nameLabelMatch = line.match(/(?:name|devotee|client|person|ಜಾತಕರ\s*ಹೆಸರು|ಹೆಸರು|ನಾಮ|ಶ್ರೀ|ಶ್ರೀಮತಿ)\s*[:=-]?\s*(.+)/i);
    if (nameLabelMatch && nameLabelMatch[1]) {
      let candidate = nameLabelMatch[1]
        .replace(/^(?:mr\.|mrs\.|ms\.|sri|shri|dr\.|ಡಾ\.|ಶ್ರೀ|ಶ್ರೀಮತಿ)\s+/i, "")
        .replace(/[,;].*$/, "")
        .trim();
      if (candidate && !candidate.match(/\d{2,}/) && candidate.length >= 2) {
        extractedName = candidate;
        break;
      }
    }
  }

  // Priority B: First line if it looks like a person's name (letters and spaces, no date/time)
  // Only accept if lines.length > 1 OR there is at least one other field (birthDate, birthTime, city)
  // AND does NOT contain action verbs/commands like generate, download, report, etc.
  if (!extractedName && lines.length > 0 && (lines.length > 1 || extractedBirthDate || extractedBirthTime || extractedCity)) {
    const firstLine = lines[0].replace(/^(?:mr\.|mrs\.|ms\.|sri|shri|dr\.|ಡಾ\.|ಶ್ರೀ|ಶ್ರೀಮತಿ)\s+/i, "").trim();
    const isCommand = /(?:generate|download|report|reports|create|kundli|kundali|bhavishya|please|start|run|tell|show|check|help|open|view|analysis|ಮಾಡಿಕೊಡು|ಡೌನ್‌ಲೋಡ್|ವರದಿ|ಕುಂಡಲಿ|ಭವಿಷ್ಯ|ಹೇಳು|ತೋರಿಸು)/i.test(firstLine);
    if (
      !isCommand &&
      firstLine.length >= 3 &&
      firstLine.length <= 40 &&
      !firstLine.match(/\b\d{4}\b/) &&
      !firstLine.match(/(?:dob|tob|time|date|place|question|query|ಪ್ರಶ್ನೆ|ದಿನಾಂಕ)/i)
    ) {
      extractedName = firstLine;
    }
  }

  // 6. EXTRACT QUESTIONS / INQUIRIES
  for (const line of lines) {
    // Explicit question labels
    const qMatch = line.match(/(?:question(?:s)?|query|ಪ್ರಶ್ನೆ|ವಿಷಯ|ಕೇಳಬೇಕಾದ\s*ಪ್ರಶ್ನೆ|ಡೌಟ್)\s*[:=-]?\s*(.+)/i);
    if (qMatch && qMatch[1]) {
      const qText = qMatch[1].trim();
      if (qText.length > 3) {
        extractedQuestions.push(qText);
      }
    } else if (line.endsWith("?") || (line.includes("?") && line.length > 10)) {
      extractedQuestions.push(line.trim());
    } else if (
      (line.toLowerCase().includes("marriage") || line.toLowerCase().includes("career") || line.toLowerCase().includes("job") || line.toLowerCase().includes("health") || line.toLowerCase().includes("wealth") || line.toLowerCase().includes("education") || line.toLowerCase().includes("foreign") || line.toLowerCase().includes("ವಿದೇಶ") || line.toLowerCase().includes("ವಿವಾಹ") || line.toLowerCase().includes("ಉದ್ಯೋಗ")) &&
      !line.match(/(?:dob|tob|time|date|place|city)/i)
    ) {
      extractedQuestions.push(line.trim());
    }
  }

  // Resolve geocoordinates and pincode defaults
  const city = extractedCity || "Bengaluru";
  const geo = resolveCityCoordsAndPincode(city, extractedPincode || undefined);

  const hasData = Boolean(
    (extractedName && (extractedBirthDate || extractedBirthTime || extractedCity || lines.length > 1)) ||
    extractedBirthDate
  );

  return {
    rawText: rawInput,
    hasData,
    name: extractedName,
    birthDate: extractedBirthDate,
    birthTime: extractedBirthTime || "09:20",
    city: geo.city,
    pincode: geo.pincode,
    latitude: geo.lat,
    longitude: geo.lng,
    customQuestions: extractedQuestions,
    extractedFields: {
      name: extractedName || undefined,
      birthDate: extractedBirthDate || undefined,
      birthTime: extractedBirthTime || undefined,
      city: extractedCity || undefined,
      pincode: extractedPincode || undefined,
      questions: extractedQuestions.length > 0 ? extractedQuestions : undefined
    }
  };
}

/**
 * Parses various date formats into standard YYYY-MM-DD.
 */
function parseDateString(str: string): string | null {
  // Pattern 1: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const m1 = str.match(/\b(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})\b/);
  if (m1) {
    const p1 = parseInt(m1[1], 10);
    const p2 = parseInt(m1[2], 10);
    const year = m1[3];
    // If first number > 12, it must be DD-MM-YYYY
    if (p1 > 12 && p2 <= 12) {
      return `${year}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
    }
    // Standard Indian convention is DD-MM-YYYY
    return `${year}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
  }

  // Pattern 2: YYYY-MM-DD or YYYY/MM/DD
  const m2 = str.match(/\b(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})\b/);
  if (m2) {
    const year = m2[1];
    const month = String(parseInt(m2[2], 10)).padStart(2, "0");
    const day = String(parseInt(m2[3], 10)).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Pattern 3: Named month e.g. "14 May 1992", "31st May 1993", "18 ಆಗಸ್ಟ್ 1994"
  const m3 = str.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z\u0C80-\u0CFF]+)\s+(\d{4})\b/);
  if (m3) {
    const day = String(parseInt(m3[1], 10)).padStart(2, "0");
    const monthKey = m3[2].toLowerCase();
    const month = MONTH_NAME_MAP[monthKey] || "01";
    const year = m3[3];
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Parses 12-hour or 24-hour time strings into standard HH:mm (24h).
 */
function parseTimeString(str: string): string | null {
  // Pattern 1: 12h with AM/PM e.g. "6:30 AM", "09:20 pm", "10:45am"
  const m1 = str.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?m\.?)\b/i);
  if (m1) {
    let hours = parseInt(m1[1], 10);
    const minutes = m1[2];
    const meridian = m1[3].toLowerCase().replace(/\./g, "");
    if (meridian === "pm" && hours < 12) hours += 12;
    if (meridian === "am" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  // Pattern 2: Kannada indicators e.g. "ಬೆಳಿಗ್ಗೆ ೬:೩೦", "ಸಂಜೆ 6:30", "ರಾತ್ರಿ 9:20"
  const mKn = str.match(/(ಬೆಳಿಗ್ಗೆ|ಮುಂಜಾನೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ)\s*(\d{1,2})[:.](\d{2})/);
  if (mKn) {
    const period = mKn[1];
    let hours = parseInt(mKn[2], 10);
    const minutes = mKn[3];
    if ((period === "ಸಂಜೆ" || period === "ರಾತ್ರಿ") && hours < 12) hours += 12;
    if (period === "ಮಧ್ಯಾಹ್ನ" && hours < 12 && hours !== 12) hours += 12;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  // Pattern 3: Standard 24h e.g. "18:30", "06:30"
  const m2 = str.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (m2) {
    return `${String(parseInt(m2[1], 10)).padStart(2, "0")}:${m2[2]}`;
  }

  return null;
}
