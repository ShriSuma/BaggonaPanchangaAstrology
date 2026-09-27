/**
 * Baggona Seva & Prasada Data Persistence Engine
 *
 * Automatically saves and updates:
 * 1. Priest / User details (Name & Phone Number): Updates existing priests in Firestore & LocalStorage
 *    if phone or name differs, or inserts new priest if none matches.
 * 2. Custom & Combination Poojas: Automatically saves new combination poojas to Firestore & LocalStorage.
 * 3. Custom Holy Places / Kshetras: Automatically saves new holy places (e.g. "Kotiteertha Gokarna",
 *    "Mukti Mantapa Koti Teertha Gokarna", "Moksha Dhama near Samudra Gokarna") to Firestore & LocalStorage.
 *
 * Triggered on:
 * - 5-Page A4 PDF download (`seva-print-letter`)
 * - 1-Page Priest QR PDF download (`priest-qr-card-1page`)
 * - 90-Day Calendar & Prasada Card downloads
 * - 8-Page Royal Booklet downloads
 * - QR code sync / .ics universal calendar downloads
 */

import {
  getAllPriests,
  getPriestProfile,
  saveOrUpdatePriestProfile,
  type PriestProfile
} from "../features/seva/sevaPriestDirectory";
import {
  getCustomPoojas,
  saveOrUpdateCustomPooja,
  loadCustomPoojasFromFirestore,
  type CustomPoojaItem
} from "../features/seva/customPoojaRegistry";
import {
  getAllHolyPlaces,
  saveOrUpdateCustomHolyPlace,
  loadCustomHolyPlacesFromFirestore,
  type HolyPlacePreset
} from "../features/seva/holyPlaces";

export interface SevaPersistenceContext {
  // Nested structured parameters
  priest?: {
    id?: string;
    name?: string;
    phone?: string;
    lang?: string;
  };
  pooja?: {
    name?: string;
    lang?: string;
  };
  place?: {
    id?: string;
    name?: string;
    pincode?: string;
    lat?: number;
    lng?: number;
    lang?: string;
  };
  user?: {
    name?: string;
    gotra?: string;
    nakshatraIndex?: number;
    rashiIndex?: number;
    dob?: string;
    tob?: string;
    place?: string;
  };

  // Flat parameters for flexible invocation
  priestId?: string;
  priestName?: string;
  priestPhone?: string;
  overrideContact?: boolean;

  // Pooja / Seva
  sevaId?: string;
  customPoojaName?: string;

  // Holy Place / Kshetra
  placeId?: string;
  placeName?: string;
  pincode?: string;
  lat?: number;
  lng?: number;

  // Language
  lang?: string;
}

export interface SevaPersistenceResult {
  priest?: PriestProfile;
  pooja?: CustomPoojaItem | null;
  place?: HolyPlacePreset | null;
}

/**
 * Main action handler: Called as soon as download or QR generation is triggered.
 * Checks all priest, pooja, and place details:
 * - If data is different for an existing record: updates it in the database.
 * - If data is new: inserts it into the database for future use.
 */
export async function syncSevaDataOnAction(
  context: SevaPersistenceContext
): Promise<SevaPersistenceResult> {
  const result: SevaPersistenceResult = {};

  // 1. Priest / User Sync
  try {
    const rawName = (context.priest?.name || context.priestName || "").trim();
    const rawPhone = (context.priest?.phone || context.priestPhone || "").trim();
    const rawId = context.priest?.id || context.priestId;
    const priestLang = context.priest?.lang || context.lang || "kn";
    const priestId = rawId || (rawName ? undefined : "shreeram-pandit");

    if (rawName || rawPhone || priestId) {
      const priestRes = await saveOrUpdatePriestProfile({
        id: priestId,
        name: rawName,
        phone: rawPhone,
        lang: priestLang
      });
      result.priest = priestRes.profile;
    }
  } catch (err) {
    console.warn("[SevaPersistence] Priest sync warning:", err);
  }

  // 2. Custom & Combination Pooja Sync
  try {
    const customPooja = (context.pooja?.name || context.customPoojaName || "").trim();
    const poojaLang = context.pooja?.lang || context.lang || "kn";
    if (customPooja && customPooja.toLowerCase() !== "custom_pooja" && customPooja.toLowerCase() !== "add_custom") {
      result.pooja = await saveOrUpdateCustomPooja(customPooja, poojaLang);
    }
  } catch (err) {
    console.warn("[SevaPersistence] Pooja sync warning:", err);
  }

  // 3. Holy Place / Kshetra Sync
  try {
    const place = (context.place?.name || context.placeName || "").trim();
    const placePincode = context.place?.pincode || context.pincode || "581326";
    const placeLat = context.place?.lat || context.lat || 14.5479;
    const placeLng = context.place?.lng || context.lng || 74.3187;
    const placeLang = context.place?.lang || context.lang || "kn";

    if (place && place.toLowerCase() !== "custom" && place.toLowerCase() !== "other location") {
      result.place = await saveOrUpdateCustomHolyPlace(
        place,
        placePincode,
        placeLat,
        placeLng,
        placeLang
      );
    }
  } catch (err) {
    console.warn("[SevaPersistence] Holy place sync warning:", err);
  }

  // 4. Devotee / User session persistence
  if (context.user && context.user.name && context.user.name.trim()) {
    try {
      const uName = context.user.name.trim();
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem("baggona_kundli_session");
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem("baggona_kundli_session", JSON.stringify({
          ...parsed,
          name: uName,
          gotra: context.user.gotra || parsed.gotra,
          rashiIndex: context.user.rashiIndex ?? parsed.rashiIndex,
          nakshatraIndex: context.user.nakshatraIndex ?? parsed.nakshatraIndex,
          birthDate: context.user.dob || parsed.birthDate,
          birthTime: context.user.tob || parsed.birthTime,
          placeLabel: context.user.place || parsed.placeLabel
        }));
      }
    } catch (_) {}
  }

  // 5. Notify open components & tabs to refresh their dropdowns
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("baggona_seva_data_synced", { detail: result }));
    } catch (_) {}
  }

  return result;
}

/**
 * Initializer: Pre-loads all saved custom poojas & holy places from Firestore in the background
 */
export async function initializeSevaPersistence(): Promise<void> {
  try {
    await Promise.allSettled([
      loadCustomPoojasFromFirestore(),
      loadCustomHolyPlacesFromFirestore()
    ]);
  } catch (err) {
    console.warn("[SevaPersistence] Initialization warning:", err);
  }
}
