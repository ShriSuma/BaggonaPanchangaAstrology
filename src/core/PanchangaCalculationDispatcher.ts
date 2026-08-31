/**
 * Baggona Panchanga Calculation Dispatcher (ಪಂಚಾಂಗ ಗಣನೆ ನಿಯಂತ್ರಕ)
 * 
 * Dynamically routes daily Panchanga requests to either:
 * 1. Baggona Panchanga Book Engine (`ParabhavaBookEngine.ts`) - 100% authentic print book blueprint (Pages 40-91)
 * 2. Mathematical Drik-Ganita Ephemeris Engine (`TraditionalBaggonaEngine.ts`)
 * 
 * Governed globally by Super Admin configuration stored in Firestore DB (`app_configurations/panchanga_engine_config`).
 */

import {
  getPanchangaEngineConfig,
  savePanchangaEngineConfig,
  subscribePanchangaEngineConfig,
  type PanchangaEngineMode,
  type PanchangaEngineConfigDoc
} from "../db/firestoreDb";
import {
  getParabhavaDayDetails,
  isDateInParabhavaYear,
  type ParabhavaDayRecord
} from "./ParabhavaBookEngine";
import {
  calculateTraditionalBaggona,
  type TraditionalBaggonaPanchanga
} from "./TraditionalBaggonaEngine";
import type { AyanamsaModel } from "./AstroTypes";

// Synchronous local state cache for instant UI rendering
let cachedEngineMode: PanchangaEngineMode = "baggona_book";

// Initialize local cache from localStorage if available
try {
  const local = localStorage.getItem("baggona_panchanga_engine_mode");
  if (local === "baggona_book" || local === "mathematical") {
    cachedEngineMode = local;
  }
} catch (_) {}

// Subscribe to real-time updates from Firestore DB
subscribePanchangaEngineConfig((config) => {
  if (config && config.engineMode) {
    cachedEngineMode = config.engineMode;
  }
});

/**
 * Returns the currently active global engine mode synchronously
 */
export function getActiveEngineMode(): PanchangaEngineMode {
  return cachedEngineMode;
}

/**
 * Updates the global engine mode in Firestore DB and local cache
 */
export async function updateActiveEngineMode(
  mode: PanchangaEngineMode,
  adminUsername = "superadmin"
): Promise<PanchangaEngineConfigDoc> {
  cachedEngineMode = mode;
  return await savePanchangaEngineConfig(mode, adminUsername);
}

/**
 * Unified Panchanga Calculator that respects the Super Admin database toggle:
 * - If "baggona_book" is active and date is within Parabhava Samvatsara (2026-03-19 to 2027-04-07),
 *   it utilizes the exact published 104-page Baggona Panchanga dataset.
 * - Otherwise (or if "mathematical" is toggled), it falls back to high-precision Drik-Ganita math.
 */
export function calculateUnifiedBaggona(
  birthDate: string,
  birthTime = "06:38",
  latitude = 14.5479,
  longitude = 74.3188,
  ayanamsaModel: AyanamsaModel = "lahiri",
  pincode = ""
): TraditionalBaggonaPanchanga {
  const isBookEligible = cachedEngineMode === "baggona_book" && isDateInParabhavaYear(birthDate);

  if (isBookEligible) {
    const bookDay: ParabhavaDayRecord = getParabhavaDayDetails(birthDate);

    // Adapt to standard TraditionalBaggonaPanchanga interface with full fidelity
    return {
      shakaYear: bookDay.shakaYear,
      samvatsara: bookDay.samvatsara,
      samvatsaraKn: bookDay.samvatsaraKn,
      masa: bookDay.chandramanaMasa,
      masaKn: bookDay.chandramanaMasaKn,
      paksha: bookDay.paksha,
      pakshaKn: bookDay.pakshaKn,
      tithi: bookDay.tithi,
      tithiKn: bookDay.tithiKn,
      tithiGhati: parseGhatiNum(bookDay.tithiGhati, 0),
      tithiVighati: parseGhatiNum(bookDay.tithiGhati, 1),
      weekday: bookDay.weekday,
      weekdayKn: bookDay.weekdayKn,
      weekdayIndex: getWeekdayIdx(bookDay.weekday),
      sunNakshatra: bookDay.sunNakshatra,
      sunNakshatraKn: bookDay.sunNakshatraKn,
      sunNakshatraGhati: 0,
      sunNakshatraVighati: 0,
      moonNakshatra: bookDay.nakshatra,
      moonNakshatraKn: bookDay.nakshatraKn,
      moonNakshatraGhati: parseGhatiNum(bookDay.nakshatraGhati, 0),
      moonNakshatraVighati: parseGhatiNum(bookDay.nakshatraGhati, 1),
      yoga: bookDay.yoga,
      yogaKn: bookDay.yogaKn,
      yogaGhati: parseGhatiNum(bookDay.yogaGhati, 0),
      yogaVighati: parseGhatiNum(bookDay.yogaGhati, 1),
      karana: bookDay.karana,
      karanaKn: bookDay.karanaKn,
      karanaGhati: parseGhatiNum(bookDay.karanaGhati, 0),
      karanaVighati: parseGhatiNum(bookDay.karanaGhati, 1),
      vishaGhati: {
        ghati: parseGhatiNum(bookDay.vishaGhati, 0),
        vighati: parseGhatiNum(bookDay.vishaGhati, 1)
      },
      amrithaGhati: {
        ghati: parseGhatiNum(bookDay.amritaGhati, 0),
        vighati: parseGhatiNum(bookDay.amritaGhati, 1)
      },
      divaGhati: {
        ghati: parseGhatiNum(bookDay.dinapramana, 0),
        vighati: parseGhatiNum(bookDay.dinapramana, 1)
      },
      sankrantiSign: bookDay.sauramanaMasa,
      sankrantiSignKn: bookDay.sauramanaMasaKn,
      sankrantiGataDina: bookDay.sauramanaDina,
      paramaGhati: { ghati: 60, vighati: 0 },
      ashayaGhati: { ghati: 0, vighati: 0 },
      ghatadina: { ghati: 30, vighati: 0 },
      suryodhayadgata: { ghati: 0, vighati: 0 },
      sunrise: bookDay.suryodaya,
      sunset: bookDay.suryasta,
      tithiEndTime: bookDay.tithiEndTime
    };
  }

  // Fallback to pure Mathematical Drik-Ganita calculation
  return calculateTraditionalBaggona(
    birthDate,
    birthTime,
    latitude,
    longitude,
    ayanamsaModel,
    pincode
  );
}

function parseGhatiNum(str: string, index: 0 | 1): number {
  if (!str) return 0;
  const parts = str.split("-");
  const val = parseInt(parts[index] || "0", 10);
  return isNaN(val) ? 0 : val;
}

function getWeekdayIdx(weekday: string): number {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const idx = days.findIndex((d) => d.toLowerCase() === (weekday || "").toLowerCase());
  return idx >= 0 ? idx : 4; // default Thursday
}
