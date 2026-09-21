import { isRoughIndiaRegion } from "./placeTime";

/**
 * Converts birth calendar wall clock at the birthplace to a UTC instant.
 * Indian births: wall clock is interpreted as Asia/Kolkata (IST), matching common desktop software.
 * Elsewhere: interpreted as UTC until a timezone picker is added.
 */
export const inferBirthTimezoneIana = (
  lat: number,
  lng: number,
  pincode = "",
  explicitTz?: string
): string => {
  if (explicitTz) return explicitTz;
  if (/^[1-9]\d{5}$/.test(pincode.trim())) return "Asia/Kolkata";
  if (isRoughIndiaRegion(lat, lng)) return "Asia/Kolkata";

  // High-accuracy geographic timezone inference:
  // Hawaii (USA)
  if (lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154) return "Pacific/Honolulu";
  // Alaska (USA)
  if (lat >= 51 && lat <= 72 && lng >= -170 && lng <= -130) return "America/Anchorage";
  // US/Canada Pacific (CA, WA, OR, NV, BC)
  if (lat >= 30 && lat <= 55 && lng >= -126 && lng <= -114) return "America/Los_Angeles";
  // US Mountain (AZ, UT, CO, NM, MT, WY, ID)
  if (lat >= 30 && lat <= 55 && lng > -114 && lng <= -102) {
    return lat >= 31 && lat <= 37 && lng >= -115 && lng <= -109 ? "America/Phoenix" : "America/Denver";
  }
  // US/Canada Central (TX, IL, MO, MN, WI, MB)
  if (lat >= 25 && lat <= 55 && lng > -102 && lng <= -85) return "America/Chicago";
  // US/Canada Eastern (NY, MA, PA, FL, DC, GA, ON, QC)
  if (lat >= 24 && lat <= 55 && lng > -85 && lng <= -65) return "America/New_York";
  // UK & Ireland
  if (lat >= 49 && lat <= 60 && lng >= -11 && lng <= 2) return "Europe/London";
  // Western/Central Europe (France, Spain, Germany, Italy, Netherlands, Belgium, Switzerland)
  if (lat >= 35 && lat <= 55 && lng > -10 && lng <= 16) return "Europe/Paris";
  // Southern & Eastern Europe (Serbia, Greece, Poland, Romania)
  if (lat >= 35 && lat <= 55 && lng > 16 && lng <= 26) return "Europe/Belgrade";
  // UAE & Gulf
  if (lat >= 22 && lat <= 27 && lng >= 50 && lng <= 57) return "Asia/Dubai";
  // Singapore & Malaysia
  if (lat >= 1 && lat <= 7 && lng >= 100 && lng <= 105) return "Asia/Singapore";
  // Japan
  if (lat >= 30 && lat <= 46 && lng >= 128 && lng <= 146) return "Asia/Tokyo";
  // Australia (Sydney / Melbourne)
  if (lat >= -44 && lat <= -28 && lng >= 140 && lng <= 154) return "Australia/Sydney";

  return "Etc/UTC";
};

/**
 * Converts birth calendar wall clock at the birthplace to a UTC instant.
 * Accurately accounts for regional IANA timezones and historical Daylight Saving Time (DST).
 *
 * @param birthDate YYYY-MM-DD
 * @param birthTime HH:mm (24h)
 */
export const wallClockBirthToUtc = (
  birthDate: string,
  birthTime: string,
  lat: number,
  lng: number,
  pincode = "",
  explicitTz?: string,
  explicitOffsetMinutes?: number
): Date => {
  if (typeof explicitOffsetMinutes === "number") {
    const [y, m, d] = birthDate.split("-").map(Number);
    const [h, min] = birthTime.split(":").map(Number);
    const utcMs = Date.UTC(y, m - 1, d, h, min) - explicitOffsetMinutes * 60 * 1000;
    return new Date(utcMs);
  }

  const tz = inferBirthTimezoneIana(lat, lng, pincode, explicitTz);
  if (tz === "Asia/Kolkata") {
    return new Date(`${birthDate}T${birthTime}:00+05:30`);
  }
  if (tz === "Etc/UTC" || !tz) {
    return new Date(`${birthDate}T${birthTime}:00Z`);
  }

  try {
    const [y, m, d] = birthDate.split("-").map(Number);
    const [h, min] = birthTime.split(":").map(Number);
    const guessUtc = new Date(Date.UTC(y, m - 1, d, h, min));
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    const parts = dtf.formatToParts(guessUtc);
    const pMap: Record<string, number> = {};
    for (const p of parts) {
      if (p.type !== "literal") pMap[p.type] = Number(p.value);
    }
    const tzWallClockMs = Date.UTC(pMap.year, pMap.month - 1, pMap.day, pMap.hour % 24, pMap.minute);
    const offsetMs = tzWallClockMs - guessUtc.getTime();
    const targetWallClockMs = Date.UTC(y, m - 1, d, h, min);
    return new Date(targetWallClockMs - offsetMs);
  } catch {
    return new Date(`${birthDate}T${birthTime}:00Z`);
  }
};

/** Calendar YYYY-MM-DD from a DatePicker value (browser local calendar day). */
export const formatPickerDateLocalYmd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** HH:mm from a time picker (browser local). */
export const formatPickerTimeLocalHm = (d: Date): string => {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

/** Build HH:mm from explicit hour/minute (avoids browser timezone shifting birth place clock). */
export const formatWallClockHm = (hour: number, minute: number): string =>
  `${String(Math.min(23, Math.max(0, hour))).padStart(2, "0")}:${String(Math.min(59, Math.max(0, minute))).padStart(2, "0")}`;

/** Parse HH:mm wall clock at birthplace (for dropdown time pickers). */
export const parseWallClockHm = (hm: string): { hour: number; minute: number } | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
};

/** Age in decimal years at `atUtc` from birth wall clock at birthplace. */
export const ageDecimalYearsAt = (
  birthDate: string,
  birthTime: string,
  lat: number,
  lng: number,
  atUtc: Date
): number => {
  const birth = wallClockBirthToUtc(birthDate, birthTime, lat, lng);
  const ms = Math.max(0, atUtc.getTime() - birth.getTime());
  return ms / (365.2425 * 24 * 60 * 60 * 1000);
};
