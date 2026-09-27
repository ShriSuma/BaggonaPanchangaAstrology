/**
 * Official-style sunrise/sunset from sunrise-sunset.org (USNO-backed, widely used).
 * Includes global in-memory and persistent localStorage caching by [lat, lng, ymd].
 */

import type { PanchangOutput } from "./AstroTypes";
import { formatClockAtPlace } from "./placeTime";

type ApiBody = {
  status: string;
  results?: { sunrise: string; sunset: string };
};

export type SunriseSunsetUtc = { sunrise: Date; sunset: Date };

const memCache = new Map<string, SunriseSunsetUtc>();

export const getSunCacheKey = (lat: number, lng: number, ymd: string): string =>
  `${lat.toFixed(3)}_${lng.toFixed(3)}_${ymd}`;

export const getCachedSunriseSunset = (lat: number, lng: number, ymd: string): SunriseSunsetUtc | null => {
  const key = getSunCacheKey(lat, lng, ymd);
  if (memCache.has(key)) return memCache.get(key)!;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = localStorage.getItem(`baggona_sun_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.sunrise && parsed.sunset) {
          const res: SunriseSunsetUtc = {
            sunrise: new Date(parsed.sunrise),
            sunset: new Date(parsed.sunset)
          };
          if (!isNaN(res.sunrise.getTime()) && !isNaN(res.sunset.getTime())) {
            memCache.set(key, res);
            return res;
          }
        }
      }
    } catch {}
  }
  return null;
};

export const setCachedSunriseSunset = (lat: number, lng: number, ymd: string, times: SunriseSunsetUtc): void => {
  const key = getSunCacheKey(lat, lng, ymd);
  memCache.set(key, times);
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(`baggona_sun_${key}`, JSON.stringify({
        sunrise: times.sunrise.toISOString(),
        sunset: times.sunset.toISOString()
      }));
    } catch {}
  }
};

const buildQuery = (lat: number, lng: number, ymd: string): string =>
  new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    date: ymd,
    formatted: "0"
  }).toString();

export const sunriseSunsetRequestUrl = (lat: number, lng: number, ymd: string): string => {
  const q = buildQuery(lat, lng, ymd);
  return `https://api.sunrise-sunset.org/json?${q}`;
};

/** Returns cached or fetched sunrise/sunset from internet API, or null if network fails. */
export const fetchSunriseSunsetUtc = async (
  lat: number,
  lng: number,
  ymd: string
): Promise<SunriseSunsetUtc | null> => {
  const cached = getCachedSunriseSunset(lat, lng, ymd);
  if (cached) return cached;

  const q = buildQuery(lat, lng, ymd);
  const candidateUrls = [
    `https://api.sunrise-sunset.org/json?${q}`,
    `/api/sunrise-sunset?${q}`
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = (await res.json()) as ApiBody;
      if (data.status !== "OK" || !data.results?.sunrise || !data.results?.sunset) continue;
      const sunrise = new Date(data.results.sunrise);
      const sunset = new Date(data.results.sunset);
      if (Number.isNaN(sunrise.getTime()) || Number.isNaN(sunset.getTime())) continue;
      
      const result: SunriseSunsetUtc = { sunrise, sunset };
      setCachedSunriseSunset(lat, lng, ymd, result);
      return result;
    } catch {
      // try next candidate
    }
  }
  return null;
};

/** Overwrite Panchang sunrise/sunset labels using authoritative instants (API or astronomical). */
export const applySunTimesToPanchang = (
  base: PanchangOutput,
  times: { sunrise: Date; sunset: Date },
  locale: string,
  lat: number,
  lng: number,
  pincode = ""
): PanchangOutput => ({
  ...base,
  sunrise: formatClockAtPlace(times.sunrise, locale, lat, lng, pincode),
  sunset: formatClockAtPlace(times.sunset, locale, lat, lng, pincode)
});
