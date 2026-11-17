/**
 * Baggona Panchanga Astrology - Pan-India City Search & Autocomplete Service
 * Fast, Google-like instant dropdown search across 390+ curated offline Indian cities,
 * 700+ Indian districts, and live OpenStreetMap Nominatim Pan-India geocoding.
 */

import { OFFLINE_INDIAN_CITIES, type OfflineCityEntry } from "../data/offlineCityPincodeDb";
import districts from "../data/india-districts.json";

export interface CitySuggestion {
  id: string;
  cityName: string;
  displayName: string;
  stateName: string;
  stateCode: string;
  lat: number;
  lng: number;
  pincode?: string;
  district?: string;
  source: "offline" | "district" | "online";
}

const NOMINATIM_TIMEOUT_MS = 3500;

// In-memory cache for API queries to avoid redundant network calls
const API_CACHE = new Map<string, CitySuggestion[]>();

/**
 * Searches offline Indian cities and districts synchronously with 0ms latency.
 * Ranks prefix matches highest (like Google search suggestions).
 */
export function searchOfflineIndianCities(query: string, limit = 8): CitySuggestion[] {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toLowerCase();
  const results: CitySuggestion[] = [];
  const seenKeys = new Set<string>();

  // 1. Check OFFLINE_INDIAN_CITIES
  const exactPrefixMatches: CitySuggestion[] = [];
  const aliasPrefixMatches: CitySuggestion[] = [];
  const substringMatches: CitySuggestion[] = [];

  for (const city of OFFLINE_INDIAN_CITIES) {
    const cityNameLower = city.name.toLowerCase();
    const stateNameLower = city.stateName.toLowerCase();
    const pincode = city.pincode || "";

    const key = `${city.lat.toFixed(3)}_${city.lng.toFixed(3)}`;
    if (seenKeys.has(key)) continue;

    const item: CitySuggestion = {
      id: `offline_${city.name}_${city.stateCode}_${city.pincode}`,
      cityName: city.name,
      displayName: `${city.name}, ${city.stateName}`,
      stateName: city.stateName,
      stateCode: city.stateCode,
      lat: city.lat,
      lng: city.lng,
      pincode: city.pincode,
      district: city.district,
      source: "offline"
    };

    // Exact city name starts with query (Highest priority)
    if (cityNameLower.startsWith(q)) {
      exactPrefixMatches.push(item);
      seenKeys.add(key);
      continue;
    }

    // Check aliases (e.g. Bangalore -> Bengaluru, Bombay -> Mumbai, Kashi -> Varanasi)
    if (city.aliases && city.aliases.some((a) => a.toLowerCase().startsWith(q))) {
      aliasPrefixMatches.push(item);
      seenKeys.add(key);
      continue;
    }

    // Pincode prefix match (e.g. "560" -> Bengaluru, "581" -> Gokarna/Kumta)
    if (pincode && pincode.startsWith(q)) {
      exactPrefixMatches.push(item);
      seenKeys.add(key);
      continue;
    }

    // Substring match in city or state
    if (cityNameLower.includes(q) || stateNameLower.includes(q)) {
      substringMatches.push(item);
      seenKeys.add(key);
      continue;
    }
  }

  // 2. Also check india-districts.json for any districts not directly in OFFLINE_INDIAN_CITIES
  const districtList = districts as Array<{ code: string; stateCode: string; name: string }>;
  const districtMatches: CitySuggestion[] = [];

  for (const dist of districtList) {
    const distLower = dist.name.toLowerCase();
    if (distLower.startsWith(q) || distLower.includes(q)) {
      // Find matching offline city to borrow coordinates if nearby
      const match = OFFLINE_INDIAN_CITIES.find(
        (c) => c.stateCode === dist.stateCode && c.name.toLowerCase().includes(distLower.slice(0, 4))
      );

      if (match) {
        const key = `${match.lat.toFixed(3)}_${match.lng.toFixed(3)}`;
        if (!seenKeys.has(key)) {
          districtMatches.push({
            id: `dist_${dist.code}`,
            cityName: dist.name,
            displayName: `${dist.name}, ${match.stateName}`,
            stateName: match.stateName,
            stateCode: dist.stateCode,
            lat: match.lat,
            lng: match.lng,
            district: dist.name,
            source: "district"
          });
          seenKeys.add(key);
        }
      }
    }
  }

  // Combine results in strict order of relevance:
  // Prefix matches -> Alias matches -> Substring matches -> District matches
  results.push(...exactPrefixMatches, ...aliasPrefixMatches, ...substringMatches, ...districtMatches);

  return results.slice(0, limit);
}

/**
 * Searches Pan-India cities online via OpenStreetMap Nominatim with structured address parsing.
 * Gracefully falls back to empty array if offline or network times out.
 */
export async function searchOnlineIndianCities(query: string, limit = 6): Promise<CitySuggestion[]> {
  const clean = query.trim().replace(/,\s*(india|bharat)$/i, "").trim();
  if (!clean || clean.length < 3) return [];

  const cacheKey = clean.toLowerCase();
  if (API_CACHE.has(cacheKey)) {
    return API_CACHE.get(cacheKey)!;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(clean)}&countrycodes=in&format=json&addressdetails=1&limit=${limit}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);

    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "BaggonaPanchangaAstrologyPWA/1.0 (city-autocomplete; contact: support@baggona.com)"
      }
    });

    clearTimeout(timer);

    if (!resp.ok) return [];

    const data = (await resp.json()) as Array<{
      place_id: number;
      lat: string;
      lon: string;
      display_name: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        suburb?: string;
        county?: string;
        state_district?: string;
        state?: string;
        postcode?: string;
        country?: string;
      };
    }>;

    if (!Array.isArray(data)) return [];

    const suggestions: CitySuggestion[] = [];

    for (const item of data) {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      if (isNaN(lat) || isNaN(lng)) continue;

      const addr = item.address || {};
      const cityName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        item.display_name.split(",")[0].trim();
      const stateName = addr.state || "India";
      const district = addr.county || addr.state_district;

      suggestions.push({
        id: `online_${item.place_id}`,
        cityName,
        displayName: `${cityName}, ${stateName}`,
        stateName,
        stateCode: stateName.slice(0, 2).toUpperCase(),
        lat,
        lng,
        pincode: addr.postcode,
        district,
        source: "online"
      });
    }

    API_CACHE.set(cacheKey, suggestions);
    return suggestions;
  } catch {
    // Network failure or timeout: silently return empty array so offline suggestions remain active
    return [];
  }
}

/**
 * High-performance Dual-Layer Search:
 * 1. Synchronously returns offline suggestions (0ms latency).
 * 2. If online is available, returns merged results with zero duplicates.
 */
export async function searchPanIndiaCities(
  query: string,
  limit = 8,
  onImmediateOffline?: (offlineResults: CitySuggestion[]) => void
): Promise<CitySuggestion[]> {
  const offlineResults = searchOfflineIndianCities(query, limit);

  if (onImmediateOffline && offlineResults.length > 0) {
    onImmediateOffline(offlineResults);
  }

  // If query is short or we already have enough high-confidence prefix matches, return offline results
  if (query.trim().length < 3 || offlineResults.length >= limit) {
    return offlineResults;
  }

  try {
    const onlineResults = await searchOnlineIndianCities(query, limit);
    if (!onlineResults.length) return offlineResults;

    // Merge without duplicates (within 0.05 lat/lng threshold)
    const merged = [...offlineResults];
    for (const onl of onlineResults) {
      const isDuplicate = merged.some(
        (off) =>
          Math.abs(off.lat - onl.lat) < 0.05 && Math.abs(off.lng - onl.lng) < 0.05 ||
          off.cityName.toLowerCase() === onl.cityName.toLowerCase()
      );
      if (!isDuplicate && merged.length < limit) {
        merged.push(onl);
      }
    }
    return merged;
  } catch {
    return offlineResults;
  }
}
