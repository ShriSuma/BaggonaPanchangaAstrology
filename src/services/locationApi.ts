import states from "../data/india-states.json";
import districts from "../data/india-districts.json";
import villages from "../data/india-villages.json";
import { staticVillagesByPincode } from "../data/pincodeFallback";
import { cacheGeocode, getGeocode } from "../db/indexedDb";

export type State = {
  code: string;
  name: string;
};

export type District = {
  code: string;
  stateCode: string;
  name: string;
};

export type Village = {
  name: string;
  districtCode: string;
  /** Present when resolved from pincode or derived from district. */
  stateCode?: string;
  lat: number;
  lng: number;
  pincode: string;
};

const REQUEST_TIMEOUT_MS = 8000;
const NOMINATIM_TIMEOUT_MS = 6000;
let lastNominatimCallMs = 0;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchStates = async (): Promise<State[]> => {
  return states as State[];
};

export const fetchDistricts = async (stateCode: string): Promise<District[]> => {
  return (districts as District[]).filter((district) => district.stateCode === stateCode);
};

const normTokens = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const tokenOverlapScore = (a: string, b: string): number => {
  const A = new Set(normTokens(a));
  const B = new Set(normTokens(b));
  let score = 0;
  for (const x of A) {
    if (B.has(x)) score += 1;
  }
  return score;
};

export const stateCodeFromPostalName = (postalStateName: string): string | undefined => {
  const t = postalStateName.trim().toLowerCase();
  for (const s of states as State[]) {
    if (s.name.toLowerCase() === t) return s.code;
  }
  return undefined;
};

/** Map India Post district label to our sparse district list for a state. */
export const findDistrictCodeForPostal = (stateCode: string, postalDistrict: string): string => {
  const dists = (districts as District[]).filter((d) => d.stateCode === stateCode);
  if (!dists.length) return "MH-MUM";

  const pd = postalDistrict.trim().toLowerCase();
  if (stateCode === "KA" && (pd.includes("bangalore") || pd.includes("bengaluru"))) {
    const blr = dists.find((d) => d.code === "KA-BLR");
    if (blr) return blr.code;
  }
  if (
    stateCode === "KA" &&
    (pd.includes("uttara") || pd.includes("karwar") || pd.includes("kumta") || pd.includes("honnavar") || pd.includes("sirsi"))
  ) {
    const ukn = dists.find((d) => d.code === "KA-UKN");
    if (ukn) return ukn.code;
  }
  if (stateCode === "MH" && (pd.includes("mumbai") || pd.includes("thane") || pd.includes("navi mumbai"))) {
    const m = dists.find((d) => d.code === "MH-MUM" || d.name.toLowerCase().includes("mumbai"));
    if (m) return m.code;
  }

  let best = dists[0]!.code;
  let bestScore = 0;
  for (const d of dists) {
    const score = tokenOverlapScore(postalDistrict, d.name);
    if (score > bestScore) {
      bestScore = score;
      best = d.code;
    }
  }
  return best;
};

type PostalPincodeResponse = {
  Status: string;
  PostOffice?: Array<{
    Name: string;
    Pincode: string;
    District?: string;
    State?: string;
    Latitude?: string;
    Longitude?: string;
  }>;
};

/** Bundled villages + offline PIN catalog for a 6-digit PIN. */
export const bundledVillagesByPincode = (pincode: string): Village[] => {
  const fromJson = (villages as Village[]).filter((v) => v.pincode === pincode);
  const fromFallback = staticVillagesByPincode(pincode);
  const merged = new Map<string, Village>();
  for (const v of [...fromJson, ...fromFallback]) {
    merged.set(`${v.name}|${v.pincode}`, v);
  }
  return [...merged.values()];
};

/** When pincode is valid, returns post offices with state/district aligned to local catalog (or null). */
export const fetchVillagesByPincode = async (pincode: string): Promise<Village[] | null> => {
  if (!/^\d{6}$/.test(pincode)) return null;

  const bundled = bundledVillagesByPincode(pincode);
  if (bundled.length) return bundled;

  try {
    const response = await withTimeout(fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`));
    if (!response.ok) throw new Error("Postal API request failed");
    const payload = (await response.json()) as PostalPincodeResponse[];
    const first = payload[0];
    if (first?.Status !== "Success" || !first.PostOffice?.length) {
      return bundled.length ? bundled : null;
    }

    const out: Village[] = [];
    for (const po of first.PostOffice) {
      const stateName = po.State?.trim();
      if (!stateName) continue;
      const stateCode = stateCodeFromPostalName(stateName);
      if (!stateCode) continue;
      const districtLabel = po.District?.trim() || "";
      const districtCode = findDistrictCodeForPostal(stateCode, districtLabel);
      const lat = Number(po.Latitude);
      const lng = Number(po.Longitude);
      const apiLat = Number.isFinite(lat) && lat !== 0 ? lat : 0;
      const apiLng = Number.isFinite(lng) && lng !== 0 ? lng : 0;
      const fb = bundled.find((b) => b.name === po.Name) ?? bundled[0];
      out.push({
        name: po.Name,
        districtCode,
        stateCode,
        lat: apiLat || fb?.lat || 0,
        lng: apiLng || fb?.lng || 0,
        pincode: po.Pincode || pincode
      });
    }
    return out.length ? out : bundled.length ? bundled : null;
  } catch {
    return bundled.length ? bundled : null;
  }
};

export const fetchVillages = async (districtCode: string, pincode?: string): Promise<Village[]> => {
  const stateFromDistrict = districtCode.split("-")[0] ?? "";
  const withState = (list: Village[]): Village[] =>
    list.map((v) => ({ ...v, stateCode: v.stateCode ?? stateFromDistrict }));

  const staticFallback = withState(
    (villages as Village[]).filter(
      (village) => village.districtCode === districtCode && (!pincode || village.pincode === pincode)
    )
  );

  if (pincode && /^\d{6}$/.test(pincode)) {
    const pinList = await fetchVillagesByPincode(pincode);
    if (pinList?.length) {
      const matched = pinList.filter((v) => v.districtCode === districtCode);
      const list = matched.length ? matched : pinList;
      return list.map((v) => {
        if (v.lat && v.lng) return v;
        const fb = staticFallback.find((s) => s.pincode === v.pincode && s.name === v.name) ?? staticFallback[0];
        return fb ? { ...v, lat: fb.lat, lng: fb.lng } : v;
      });
    }
  }

  if (!pincode) {
    return staticFallback;
  }

  try {
    const response = await withTimeout(fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`));
    if (!response.ok) {
      throw new Error("Postal API request failed");
    }

    const payload = (await response.json()) as PostalPincodeResponse[];
    const first = payload[0];
    if (first?.Status !== "Success" || !first.PostOffice?.length) {
      throw new Error("Postal API returned no records");
    }

    return first.PostOffice.map((postOffice) => ({
      name: postOffice.Name,
      districtCode,
      stateCode: stateFromDistrict,
      lat: Number(postOffice.Latitude) || staticFallback[0]?.lat || 19.076,
      lng: Number(postOffice.Longitude) || staticFallback[0]?.lng || 72.8777,
      pincode: postOffice.Pincode
    }));
  } catch {
    return staticFallback;
  }
};

export type ResolvedPinPlace = {
  villageName: string;
  districtCode: string;
  stateCode: string;
  lat: number;
  lng: number;
  pincode: string;
};

export const getPostalRegionCentroid = (pincode: string): { lat: number; lng: number } => {
  const prefix = pincode.trim().slice(0, 2);
  const p1 = pincode.trim().slice(0, 1);
  if (["50", "51", "52", "53"].includes(prefix)) return { lat: 16.5062, lng: 80.6480 };
  if (["56", "57", "58", "59"].includes(prefix)) return { lat: 14.5479, lng: 74.3188 };
  if (["60", "61", "62", "63", "64"].includes(prefix)) return { lat: 13.0827, lng: 80.2707 };
  if (["67", "68", "69"].includes(prefix)) return { lat: 9.9312, lng: 76.2673 };
  if (["40", "41", "42", "43", "44"].includes(prefix)) return { lat: 19.0760, lng: 72.8777 };
  if (["45", "46", "47", "48", "49"].includes(prefix)) return { lat: 23.2599, lng: 77.4126 };
  if (["36", "37", "38", "39"].includes(prefix)) return { lat: 23.0225, lng: 72.5714 };
  if (["30", "31", "32", "33", "34", "35"].includes(prefix)) return { lat: 26.9124, lng: 75.7873 };
  if (["11", "12", "13", "14", "15", "16", "17", "18", "19"].includes(prefix)) return { lat: 28.6139, lng: 77.2090 };
  if (["20", "21", "22", "23", "24", "25", "26", "27", "28"].includes(prefix)) return { lat: 26.8467, lng: 80.9462 };
  if (["70", "71", "72", "73", "74", "75", "76", "77", "78", "79"].includes(prefix)) return { lat: 22.5726, lng: 88.3639 };
  if (["80", "81", "82", "83", "84", "85"].includes(prefix)) return { lat: 25.5941, lng: 85.1376 };
  if (p1 === "5") return { lat: 15.3173, lng: 75.7139 };
  return { lat: 21.1458, lng: 79.0882 };
};

/** Resolve first post office for a PIN to coordinates (bundled catalog, API, or Nominatim). */
export const resolvePlaceFromPincode = async (pincode: string): Promise<ResolvedPinPlace | null> => {
  if (!/^[1-9]\d{5}$/.test(pincode)) return null;
  const list = await fetchVillagesByPincode(pincode);
  const v = list?.[0];
  const districtCode = v?.districtCode ?? "KA-UKN";
  const stateCode = v?.stateCode ?? districtCode.split("-")[0] ?? "KA";
  const villageName = v?.name ?? `Pincode ${pincode}`;

  let lat = v?.lat || 0;
  let lng = v?.lng || 0;

  if (lat && lng) {
    return {
      villageName,
      districtCode,
      stateCode,
      lat,
      lng,
      pincode
    };
  }

  const fb = bundledVillagesByPincode(pincode)[0];
  if (fb?.lat && fb?.lng) {
    lat = fb.lat;
    lng = fb.lng;
    return {
      villageName,
      districtCode,
      stateCode,
      lat,
      lng,
      pincode
    };
  }

  try {
    const districtName =
      (districts as District[]).find((d) => d.code === districtCode)?.name ?? "";
    const query = `${villageName}, ${pincode}, ${districtName}, India`;
    const coords = await withTimeout(getCoordinates(query), NOMINATIM_TIMEOUT_MS);
    lat = coords.lat;
    lng = coords.lng;
  } catch {
    // If Nominatim search fails, fallback to regional postal centroid
    const fallbackCoords = getPostalRegionCentroid(pincode);
    lat = fallbackCoords.lat;
    lng = fallbackCoords.lng;
  }

  if (!lat || !lng) {
    const fallbackCoords = getPostalRegionCentroid(pincode);
    lat = fallbackCoords.lat;
    lng = fallbackCoords.lng;
  }

  return {
    villageName,
    districtCode,
    stateCode,
    lat,
    lng,
    pincode
  };
};

export const getCoordinates = async (placeName: string): Promise<{ lat: number; lng: number }> => {
  const normalized = placeName.trim().toLowerCase();
  const cached = await getGeocode(normalized);
  if (cached) {
    return cached;
  }

  const now = Date.now();
  const elapsed = now - lastNominatimCallMs;
  if (elapsed < 1000) {
    await sleep(1000 - elapsed);
  }
  lastNominatimCallMs = Date.now();

  try {
    // Nominatim usage policy: max 1 req/s; identify app via User-Agent (https://operations.osmfoundation.org/policies/nominatim/)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)},India&format=json&limit=1`;
    const response = await withTimeout(
      fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "BaggonaPanchangaAstrologyPWA/1.0 (offline-first astrology; contact: local-app)"
        }
      })
    );
    if (!response.ok) {
      throw new Error("Unable to fetch coordinates right now");
    }
    const records = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!records.length) {
      throw new Error("Location not found");
    }
    const lat = Number(records[0].lat);
    const lng = Number(records[0].lon);
    await cacheGeocode(normalized, lat, lng);
    return { lat, lng };
  } catch {
    throw new Error("Unable to fetch location coordinates. Please try again.");
  }
};

