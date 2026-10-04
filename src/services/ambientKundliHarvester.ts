import { useKundliViewerStore, type KundliViewerSession } from "../stores/kundliViewerStore";
import type { KundliOutput, KundliInput, PlanetPosition, Rashi } from "../core/AstroTypes";
import type { DashaEntry } from "../core/DashaBhuktiEngine";
import { resolveCityCoordsAndPincode } from "./superAdminWorkflowRunner";

export interface AmbientKundliProfile {
  hasData: boolean;
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  gender?: string;
  maritalStatus?: string;
  gothra?: string;
  kundli?: KundliOutput;
  dasha?: DashaEntry[];
  dailyPrediction?: string;
  lagnaName?: string;
  moonSignName?: string;
  nakshatraName?: string;
  source: "session" | "draft" | "localStorage" | "dom" | "none";
}

/**
 * Normalizes YYYY-MM-DD dates from various strings
 */
function normalizeDateString(val?: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2].padStart(2, "0")}-${ymdMatch[3].padStart(2, "0")}`;
  }
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[1].padStart(2, "0")}`;
  }
  return trimmed;
}

/**
 * Normalizes HH:mm time from various strings
 */
function normalizeTimeString(val?: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  const timeMatch = trimmed.match(/^(\d{1,2})[:.](\d{2})(?:\s*(am|pm|AM|PM))?$/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2];
    const meridiem = (timeMatch[3] || "").toLowerCase();
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  }
  return trimmed;
}

/**
 * Reads the room to harvest active Kundli details across:
 * 1. Zustand useKundliViewerStore active session (if user generated or loaded chart)
 * 2. Zustand useKundliViewerStore draftInput (if user filled inputs)
 * 3. Browser localStorage ("baggona_kundli_session", "baggona_kundli_viewer_store")
 * 4. DOM form inputs on active page (KundliPage inputs)
 */
export function harvestAmbientKundliContext(
  explicitSession?: KundliViewerSession | null
): AmbientKundliProfile {
  let name = "";
  let birthDate = "";
  let birthTime = "";
  let city = "";
  let pincode = "";
  let latitude = 12.9716;
  let longitude = 77.5946;
  let gender = "Male";
  let maritalStatus: string | undefined = undefined;
  let gothra: string | undefined = undefined;
  let kundli: KundliOutput | undefined = undefined;
  let dasha: DashaEntry[] | undefined = undefined;
  let dailyPrediction: string | undefined = undefined;
  let source: AmbientKundliProfile["source"] = "none";

  // 1. Check Explicit or Zustand Store Active Session
  const session = explicitSession !== undefined ? explicitSession : useKundliViewerStore.getState().session;
  if (session) {
    name = (session.input?.name || "").trim();
    birthDate = normalizeDateString(session.birthDateYmd || session.input?.birthDate);
    birthTime = normalizeTimeString(session.birthTimeHm || session.input?.birthTime);
    city = (session.homePlaceName || session.placeLabel || "").split("·")[0].trim() || "Bengaluru";
    pincode = session.input?.pincode || "560001";
    if (session.input?.latitude) latitude = session.input.latitude;
    if (session.input?.longitude) longitude = session.input.longitude;
    gender = session.input?.gender || "Male";
    maritalStatus = session.input?.maritalStatus;
    gothra = session.input?.gothra;
    kundli = session.result;
    dasha = session.dasha;
    dailyPrediction = session.dailyPrediction;
    source = "session";
  }

  // 2. Check Zustand Store Draft Input if details missing
  if (!name || !birthDate || !birthTime) {
    const draft = useKundliViewerStore.getState().draftInput;
    if (draft) {
      if (!name && draft.input?.name) name = draft.input.name.trim();
      if (!birthDate && (draft.birthDateYmd || draft.input?.birthDate)) {
        birthDate = normalizeDateString(draft.birthDateYmd || draft.input?.birthDate);
      }
      if (!birthTime && (draft.birthTimeHm || draft.input?.birthTime)) {
        birthTime = normalizeTimeString(draft.birthTimeHm || draft.input?.birthTime);
      }
      if (!city && (draft.homePlaceName || draft.placeLabel)) {
        city = (draft.homePlaceName || draft.placeLabel || "").split("·")[0].trim();
      }
      if (!pincode && draft.input?.pincode) pincode = draft.input.pincode;
      if (source === "none" && (name || birthDate)) source = "draft";
    }
  }

  // 3. Check Browser LocalStorage ("baggona_kundli_session")
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    if (!name || !birthDate || !birthTime) {
      try {
        const rawLocal = localStorage.getItem("baggona_kundli_session");
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (!name && parsed.name) name = parsed.name.trim();
          if (!birthDate && parsed.birthDate) birthDate = normalizeDateString(parsed.birthDate);
          if (!birthTime && parsed.birthTime) birthTime = normalizeTimeString(parsed.birthTime);
          if (!pincode && parsed.pincode) pincode = parsed.pincode;
          if (parsed.latitude) latitude = parsed.latitude;
          if (parsed.longitude) longitude = parsed.longitude;
          if (parsed.gender) gender = parsed.gender;
          if (parsed.maritalStatus) maritalStatus = parsed.maritalStatus;
          if (source === "none" && (name || birthDate)) source = "localStorage";
        }
      } catch {}
    }

    // Also inspect Zustand persist store in localStorage if still missing
    if (!name || !birthDate || !birthTime) {
      try {
        const rawStore = localStorage.getItem("baggona_kundli_viewer_store");
        if (rawStore) {
          const parsed = JSON.parse(rawStore);
          const s = parsed?.state?.session;
          if (s) {
            if (!name && s.input?.name) name = s.input.name.trim();
            if (!birthDate && (s.birthDateYmd || s.input?.birthDate)) {
              birthDate = normalizeDateString(s.birthDateYmd || s.input?.birthDate);
            }
            if (!birthTime && (s.birthTimeHm || s.input?.birthTime)) {
              birthTime = normalizeTimeString(s.birthTimeHm || s.input?.birthTime);
            }
            if (!kundli && s.result) kundli = s.result;
            if (!dasha && s.dasha) dasha = s.dasha;
            if (source === "none" && (name || birthDate)) source = "localStorage";
          }
        }
      } catch {}
    }

    // 4. In-Browser DOM Inspection: Read inputs directly from the page
    if (typeof document !== "undefined") {
      if (!name) {
        const nameInput = document.querySelector('input[name="name"], input#name') as HTMLInputElement | null;
        if (nameInput && nameInput.value.trim()) {
          name = nameInput.value.trim();
          if (source === "none") source = "dom";
        } else {
          // Check heading displaying devotee name on Kundli page
          const heading = document.querySelector('h2.text-indigo-900, h3.text-indigo-950') as HTMLElement | null;
          if (heading && heading.textContent && heading.textContent.trim().length > 2) {
            const hText = heading.textContent.trim();
            if (!["kundli", "ಕುಂಡಲಿ", "dashboard", "ವರದಿ"].some(k => hText.toLowerCase().includes(k))) {
              name = hText;
              if (source === "none") source = "dom";
            }
          }
        }
      }

      if (!birthDate) {
        const dateInput = document.querySelector('input[type="date"], input[name="birthDate"], #birthDate') as HTMLInputElement | null;
        if (dateInput && dateInput.value.trim()) {
          birthDate = normalizeDateString(dateInput.value.trim());
          if (source === "none") source = "dom";
        }
      }

      if (!birthTime) {
        const timeInput = document.querySelector('input[type="time"], input[name="birthTime"], #birthTime') as HTMLInputElement | null;
        if (timeInput && timeInput.value.trim()) {
          birthTime = normalizeTimeString(timeInput.value.trim());
          if (source === "none") source = "dom";
        }
      }

      if (!pincode) {
        const pinInput = document.querySelector('input[name="pincode"], #pincode') as HTMLInputElement | null;
        if (pinInput && pinInput.value.trim()) {
          pincode = pinInput.value.trim();
        }
      }
    }
  }

  // Fallback defaults if place is missing but we have coordinates
  if (!city) city = "Bengaluru";
  if (!pincode) pincode = "560001";

  // Re-resolve geocoordinates if city exists
  if (city) {
    const geo = resolveCityCoordsAndPincode(city);
    if (!latitude || latitude === 12.9716) latitude = geo.lat;
    if (!longitude || longitude === 77.5946) longitude = geo.lng;
    if (!pincode || pincode === "560001") pincode = geo.pincode;
  }

  // Derive Rashi & Nakshatra names if Kundli is available
  let lagnaName: string | undefined = undefined;
  let moonSignName: string | undefined = undefined;
  let nakshatraName: string | undefined = undefined;

  if (kundli) {
    lagnaName = kundli.lagnaRashi?.english || kundli.lagnaRashi?.sanskrit;
    moonSignName = kundli.moonSign?.english || kundli.moonSign?.sanskrit;
    const moon = kundli.planets.find(p => p.name === "Moon");
    nakshatraName = moon?.nakshatra?.english || moon?.nakshatra?.sanskrit;
  }

  // We consider ambient context valid if we have at least a Name or a BirthDate
  const hasData = Boolean(name.trim() || birthDate.trim() || kundli);

  return {
    hasData,
    name: name.trim() || (hasData ? "ಜಾತಕರು" : ""),
    birthDate: birthDate || (hasData ? "1993-05-31" : ""),
    birthTime: birthTime || (hasData ? "09:20" : ""),
    city: city || "Bengaluru",
    pincode: pincode || "560001",
    latitude,
    longitude,
    gender,
    maritalStatus,
    gothra,
    kundli,
    dasha,
    dailyPrediction,
    lagnaName,
    moonSignName,
    nakshatraName,
    source
  };
}
