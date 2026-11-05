/**
 * Baggona Panchanga Astrology - Comprehensive City & Pincode Resolution Audit
 * Audits 200+ distinct Indian cities/pincodes across Karnataka, Maharashtra,
 * Telangana, Tamil Nadu, and Pan-India, plus 100+ International cities/postal codes.
 *
 * Verifies:
 * 1. Coordinates resolve accurately within exact regional bounding boxes.
 * 2. Crucial cities (e.g. Mumbai, Pune, Chennai, Hyderabad, Bengaluru) NEVER fallback to Gokarna.
 * 3. International cities (London, New York, Dubai, Singapore, Tokyo, Sydney) resolve with high precision.
 * 4. Multi-language devotee name script detection and auto-conversion behavior.
 */

import { describe, it, expect } from "vitest";
import {
  resolvePlaceOrPincode,
  getCoordinates,
  resolvePincodeCoordinatesSync
} from "../services/locationApi";
import {
  detectScript,
  convertTextIfLanguageDiffers,
  isScriptMatchingLanguage,
  transliterateName
} from "../utils/transliterator";
import { OFFLINE_INDIAN_CITIES, findOfflineIndianCityOrPin } from "../data/offlineCityPincodeDb";
import { OFFLINE_INTERNATIONAL_CITIES, findOfflineInternationalCity } from "../data/internationalCitiesDb";

describe("City & Pincode Resolution Audit - National & International", () => {
  // =========================================================================
  // SECTION 1: 200+ Indian Cities & Pincodes Audit (KA, MH, TG, TN, Pan-India)
  // =========================================================================
  describe("1. 200+ Indian Cities & Pincodes Resolution", () => {
    // 1A. Karnataka (KA) Cities & Taluks (60+ items)
    const karnatakaCases = [
      { q: "Gokarna", pin: "581326", minLat: 14.4, maxLat: 14.7, minLng: 74.2, maxLng: 74.5 },
      { q: "Kumta", pin: "581343", minLat: 14.3, maxLat: 14.6, minLng: 74.3, maxLng: 74.6 },
      { q: "Karwar", pin: "581301", minLat: 14.7, maxLat: 15.0, minLng: 74.0, maxLng: 74.3 },
      { q: "Sirsi", pin: "581401", minLat: 14.5, maxLat: 14.8, minLng: 74.7, maxLng: 75.0 },
      { q: "Honnavar", pin: "581334", minLat: 14.1, maxLat: 14.4, minLng: 74.3, maxLng: 74.6 },
      { q: "Bhatkal", pin: "581320", minLat: 13.8, maxLat: 14.1, minLng: 74.4, maxLng: 74.7 },
      { q: "Ankola", pin: "581314", minLat: 14.5, maxLat: 14.8, minLng: 74.2, maxLng: 74.4 },
      { q: "Dandeli", pin: "581325", minLat: 15.1, maxLat: 15.4, minLng: 74.5, maxLng: 74.8 },
      { q: "Yellapur", pin: "581359", minLat: 14.8, maxLat: 15.1, minLng: 74.5, maxLng: 74.9 },
      { q: "Haliyal", pin: "581329", minLat: 15.2, maxLat: 15.5, minLng: 74.6, maxLng: 74.9 },
      { q: "Siddapur", pin: "581355", minLat: 14.2, maxLat: 14.5, minLng: 74.7, maxLng: 75.0 },
      { q: "Mundgod", pin: "581349", minLat: 14.8, maxLat: 15.1, minLng: 74.9, maxLng: 75.2 },
      { q: "Bengaluru", pin: "560001", minLat: 12.8, maxLat: 13.2, minLng: 77.4, maxLng: 77.8 },
      { q: "Bangalore", pin: "560001", minLat: 12.8, maxLat: 13.2, minLng: 77.4, maxLng: 77.8 },
      { q: "Whitefield", pin: "560066", minLat: 12.8, maxLat: 13.1, minLng: 77.6, maxLng: 77.9 },
      { q: "Electronic City", pin: "560100", minLat: 12.7, maxLat: 13.0, minLng: 77.5, maxLng: 77.8 },
      { q: "Indiranagar", pin: "560038", minLat: 12.8, maxLat: 13.1, minLng: 77.5, maxLng: 77.8 },
      { q: "Jayanagar", pin: "560011", minLat: 12.8, maxLat: 13.1, minLng: 77.4, maxLng: 77.7 },
      { q: "Koramangala", pin: "560034", minLat: 12.8, maxLat: 13.1, minLng: 77.5, maxLng: 77.8 },
      { q: "Malleshwaram", pin: "560003", minLat: 12.9, maxLat: 13.2, minLng: 77.4, maxLng: 77.7 },
      { q: "Rajajinagar", pin: "560010", minLat: 12.8, maxLat: 13.1, minLng: 77.4, maxLng: 77.7 },
      { q: "Basavanagudi", pin: "560004", minLat: 12.8, maxLat: 13.1, minLng: 77.4, maxLng: 77.7 },
      { q: "Yelahanka", pin: "560064", minLat: 13.0, maxLat: 13.3, minLng: 77.4, maxLng: 77.8 },
      { q: "Kengeri", pin: "560060", minLat: 12.8, maxLat: 13.1, minLng: 77.3, maxLng: 77.6 },
      { q: "Anekal", pin: "562106", minLat: 12.6, maxLat: 12.9, minLng: 77.5, maxLng: 77.8 },
      { q: "Doddaballapura", pin: "561203", minLat: 13.1, maxLat: 13.4, minLng: 77.4, maxLng: 77.7 },
      { q: "Devanahalli", pin: "562110", minLat: 13.1, maxLat: 13.4, minLng: 77.5, maxLng: 77.9 },
      { q: "Nelamangala", pin: "562123", minLat: 12.9, maxLat: 13.3, minLng: 77.2, maxLng: 77.5 },
      { q: "Hosakote", pin: "562114", minLat: 12.9, maxLat: 13.2, minLng: 77.6, maxLng: 78.0 },
      { q: "Mysuru", pin: "570001", minLat: 12.1, maxLat: 12.5, minLng: 76.5, maxLng: 76.8 },
      { q: "Mysore", pin: "570001", minLat: 12.1, maxLat: 12.5, minLng: 76.5, maxLng: 76.8 },
      { q: "Nanjangud", pin: "571301", minLat: 12.0, maxLat: 12.3, minLng: 76.5, maxLng: 76.8 },
      { q: "Hunsur", pin: "571105", minLat: 12.1, maxLat: 12.5, minLng: 76.1, maxLng: 76.5 },
      { q: "Mandya", pin: "571401", minLat: 12.4, maxLat: 12.7, minLng: 76.7, maxLng: 77.1 },
      { q: "Srirangapatna", pin: "571438", minLat: 12.3, maxLat: 12.6, minLng: 76.5, maxLng: 76.8 },
      { q: "Maddur", pin: "571428", minLat: 12.4, maxLat: 12.7, minLng: 76.9, maxLng: 77.2 },
      { q: "Chamarajanagar", pin: "571313", minLat: 11.7, maxLat: 12.1, minLng: 76.7, maxLng: 77.1 },
      { q: "Kollegal", pin: "571440", minLat: 12.0, maxLat: 12.3, minLng: 77.0, maxLng: 77.3 },
      { q: "Mangaluru", pin: "575001", minLat: 12.7, maxLat: 13.1, minLng: 74.7, maxLng: 75.0 },
      { q: "Mangalore", pin: "575001", minLat: 12.7, maxLat: 13.1, minLng: 74.7, maxLng: 75.0 },
      { q: "Udupi", pin: "576101", minLat: 13.2, maxLat: 13.5, minLng: 74.6, maxLng: 74.9 },
      { q: "Kundapura", pin: "576201", minLat: 13.5, maxLat: 13.8, minLng: 74.5, maxLng: 74.8 },
      { q: "Karkala", pin: "574104", minLat: 13.1, maxLat: 13.4, minLng: 74.8, maxLng: 75.2 },
      { q: "Puttur", pin: "574201", minLat: 12.6, maxLat: 12.9, minLng: 75.0, maxLng: 75.4 },
      { q: "Belthangady", pin: "574214", minLat: 12.8, maxLat: 13.2, minLng: 75.1, maxLng: 75.4 },
      { q: "Hubballi", pin: "580020", minLat: 15.2, maxLat: 15.5, minLng: 75.0, maxLng: 75.3 },
      { q: "Hubli", pin: "580020", minLat: 15.2, maxLat: 15.5, minLng: 75.0, maxLng: 75.3 },
      { q: "Dharwad", pin: "580001", minLat: 15.3, maxLat: 15.6, minLng: 74.8, maxLng: 75.2 },
      { q: "Belagavi", pin: "590001", minLat: 15.7, maxLat: 16.0, minLng: 74.3, maxLng: 74.7 },
      { q: "Belgaum", pin: "590001", minLat: 15.7, maxLat: 16.0, minLng: 74.3, maxLng: 74.7 },
      { q: "Kalaburagi", pin: "585101", minLat: 17.1, maxLat: 17.5, minLng: 76.6, maxLng: 77.0 },
      { q: "Gulbarga", pin: "585101", minLat: 17.1, maxLat: 17.5, minLng: 76.6, maxLng: 77.0 },
      { q: "Ballari", pin: "583101", minLat: 15.0, maxLat: 15.3, minLng: 76.7, maxLng: 77.1 },
      { q: "Bellary", pin: "583101", minLat: 15.0, maxLat: 15.3, minLng: 76.7, maxLng: 77.1 },
      { q: "Hosapete", pin: "583201", minLat: 15.1, maxLat: 15.4, minLng: 76.2, maxLng: 76.6 },
      { q: "Davanagere", pin: "577001", minLat: 14.3, maxLat: 14.6, minLng: 75.7, maxLng: 76.1 },
      { q: "Shivamogga", pin: "577201", minLat: 13.8, maxLat: 14.1, minLng: 75.4, maxLng: 75.7 },
      { q: "Shimoga", pin: "577201", minLat: 13.8, maxLat: 14.1, minLng: 75.4, maxLng: 75.7 },
      { q: "Tumakuru", pin: "572101", minLat: 13.2, maxLat: 13.5, minLng: 76.9, maxLng: 77.3 },
      { q: "Hassan", pin: "573201", minLat: 12.8, maxLat: 13.2, minLng: 75.9, maxLng: 76.3 },
      { q: "Chikkamagaluru", pin: "577101", minLat: 13.1, maxLat: 13.5, minLng: 75.6, maxLng: 76.0 },
      { q: "Madikeri", pin: "571201", minLat: 12.2, maxLat: 12.6, minLng: 75.5, maxLng: 75.9 },
      { q: "Coorg", pin: "571201", minLat: 12.2, maxLat: 12.6, minLng: 75.5, maxLng: 75.9 },
      { q: "Bidar", pin: "585401", minLat: 17.7, maxLat: 18.1, minLng: 77.3, maxLng: 77.7 },
      { q: "Raichur", pin: "584101", minLat: 16.0, maxLat: 16.4, minLng: 77.1, maxLng: 77.5 },
      { q: "Bagalkot", pin: "587101", minLat: 16.0, maxLat: 16.4, minLng: 75.5, maxLng: 75.9 },
      { q: "Vijayapura", pin: "586101", minLat: 16.6, maxLat: 17.0, minLng: 75.5, maxLng: 75.9 },
      { q: "Bijapur", pin: "586101", minLat: 16.6, maxLat: 17.0, minLng: 75.5, maxLng: 75.9 },
      { q: "Chitradurga", pin: "577501", minLat: 14.0, maxLat: 14.4, minLng: 76.2, maxLng: 76.6 },
      { q: "Haveri", pin: "581110", minLat: 14.6, maxLat: 15.0, minLng: 75.2, maxLng: 75.6 },
      { q: "Kolar", pin: "563101", minLat: 13.0, maxLat: 13.3, minLng: 77.9, maxLng: 78.3 },
      { q: "Ramanagara", pin: "562159", minLat: 12.5, maxLat: 12.9, minLng: 77.1, maxLng: 77.4 }
    ];

    for (const c of karnatakaCases) {
      it(`KA: resolves "${c.q}" (${c.pin}) accurately`, async () => {
        const byName = await resolvePlaceOrPincode(c.q);
        expect(byName.lat).toBeGreaterThanOrEqual(c.minLat);
        expect(byName.lat).toBeLessThanOrEqual(c.maxLat);
        expect(byName.lng).toBeGreaterThanOrEqual(c.minLng);
        expect(byName.lng).toBeLessThanOrEqual(c.maxLng);

        // Also test PIN code lookup
        const byPin = await resolvePlaceOrPincode(c.pin);
        expect(byPin.lat).toBeGreaterThanOrEqual(c.minLat - 0.5);
        expect(byPin.lat).toBeLessThanOrEqual(c.maxLat + 0.5);
        expect(byPin.lng).toBeGreaterThanOrEqual(c.minLng - 0.5);
        expect(byPin.lng).toBeLessThanOrEqual(c.maxLng + 0.5);

        // Synchronous PIN resolver must also succeed
        const syncPin = resolvePincodeCoordinatesSync(c.pin);
        expect(syncPin.lat).toBeGreaterThan(11.0);
        expect(syncPin.lng).toBeGreaterThan(73.0);
      });
    }

    // 1B. Maharashtra (MH) Cities & Districts (50+ items)
    const maharashtraCases = [
      { q: "Mumbai", pin: "400001", minLat: 18.8, maxLat: 19.3, minLng: 72.7, maxLng: 73.1 },
      { q: "Bombay", pin: "400001", minLat: 18.8, maxLat: 19.3, minLng: 72.7, maxLng: 73.1 },
      { q: "Bandra", pin: "400050", minLat: 18.9, maxLat: 19.2, minLng: 72.7, maxLng: 73.0 },
      { q: "Andheri", pin: "400058", minLat: 19.0, maxLat: 19.3, minLng: 72.7, maxLng: 73.0 },
      { q: "Borivali", pin: "400092", minLat: 19.1, maxLat: 19.4, minLng: 72.7, maxLng: 73.0 },
      { q: "Dadar", pin: "400014", minLat: 18.9, maxLat: 19.2, minLng: 72.7, maxLng: 73.0 },
      { q: "Colaba", pin: "400005", minLat: 18.8, maxLat: 19.1, minLng: 72.7, maxLng: 73.0 },
      { q: "Thane", pin: "400601", minLat: 19.1, maxLat: 19.4, minLng: 72.8, maxLng: 73.1 },
      { q: "Navi Mumbai", pin: "400703", minLat: 18.9, maxLat: 19.2, minLng: 72.9, maxLng: 73.2 },
      { q: "Panvel", pin: "410206", minLat: 18.8, maxLat: 19.1, minLng: 73.0, maxLng: 73.3 },
      { q: "Kalyan", pin: "421301", minLat: 19.1, maxLat: 19.4, minLng: 73.0, maxLng: 73.3 },
      { q: "Dombivli", pin: "421201", minLat: 19.1, maxLat: 19.4, minLng: 73.0, maxLng: 73.2 },
      { q: "Mira-Bhayandar", pin: "401107", minLat: 19.1, maxLat: 19.4, minLng: 72.7, maxLng: 73.0 },
      { q: "Vasai", pin: "401201", minLat: 19.2, maxLat: 19.5, minLng: 72.7, maxLng: 73.0 },
      { q: "Virar", pin: "401303", minLat: 19.3, maxLat: 19.6, minLng: 72.7, maxLng: 73.0 },
      { q: "Palghar", pin: "401404", minLat: 19.5, maxLat: 19.8, minLng: 72.6, maxLng: 72.9 },
      { q: "Pune", pin: "411001", minLat: 18.3, maxLat: 18.7, minLng: 73.7, maxLng: 74.0 },
      { q: "Poona", pin: "411001", minLat: 18.3, maxLat: 18.7, minLng: 73.7, maxLng: 74.0 },
      { q: "Kothrud", pin: "411038", minLat: 18.3, maxLat: 18.7, minLng: 73.7, maxLng: 74.0 },
      { q: "Hinjawadi", pin: "411057", minLat: 18.4, maxLat: 18.8, minLng: 73.6, maxLng: 73.9 },
      { q: "Pimpri-Chinchwad", pin: "411017", minLat: 18.5, maxLat: 18.8, minLng: 73.6, maxLng: 74.0 },
      { q: "Lonavala", pin: "410401", minLat: 18.6, maxLat: 18.9, minLng: 73.2, maxLng: 73.6 },
      { q: "Nagpur", pin: "440001", minLat: 21.0, maxLat: 21.3, minLng: 78.9, maxLng: 79.3 },
      { q: "Nashik", pin: "422001", minLat: 19.8, maxLat: 20.2, minLng: 73.6, maxLng: 74.0 },
      { q: "Trimbakeshwar", pin: "422212", minLat: 19.8, maxLat: 20.1, minLng: 73.4, maxLng: 73.7 },
      { q: "Chhatrapati Sambhajinagar", pin: "431001", minLat: 19.7, maxLat: 20.0, minLng: 75.1, maxLng: 75.5 },
      { q: "Aurangabad", pin: "431001", minLat: 19.7, maxLat: 20.0, minLng: 75.1, maxLng: 75.5 },
      { q: "Solapur", pin: "413001", minLat: 17.5, maxLat: 17.8, minLng: 75.7, maxLng: 76.1 },
      { q: "Pandharpur", pin: "413304", minLat: 17.5, maxLat: 17.8, minLng: 75.1, maxLng: 75.5 },
      { q: "Kolhapur", pin: "416001", minLat: 16.5, maxLat: 16.9, minLng: 74.0, maxLng: 74.4 },
      { q: "Amravati", pin: "444601", minLat: 20.8, maxLat: 21.1, minLng: 77.6, maxLng: 78.0 },
      { q: "Nanded", pin: "431601", minLat: 19.0, maxLat: 19.3, minLng: 77.1, maxLng: 77.5 },
      { q: "Jalgaon", pin: "425001", minLat: 20.8, maxLat: 21.2, minLng: 75.4, maxLng: 75.8 },
      { q: "Akola", pin: "444001", minLat: 20.5, maxLat: 20.9, minLng: 76.8, maxLng: 77.2 },
      { q: "Latur", pin: "413512", minLat: 18.2, maxLat: 18.6, minLng: 76.4, maxLng: 76.8 },
      { q: "Dhule", pin: "424001", minLat: 20.7, maxLat: 21.1, minLng: 74.6, maxLng: 75.0 },
      { q: "Ahilyanagar", pin: "414001", minLat: 18.9, maxLat: 19.3, minLng: 74.5, maxLng: 74.9 },
      { q: "Ahmednagar", pin: "414001", minLat: 18.9, maxLat: 19.3, minLng: 74.5, maxLng: 74.9 },
      { q: "Shirdi", pin: "423109", minLat: 19.6, maxLat: 19.9, minLng: 74.3, maxLng: 74.7 },
      { q: "Chandrapur", pin: "442401", minLat: 19.8, maxLat: 20.1, minLng: 79.1, maxLng: 79.5 },
      { q: "Parbhani", pin: "431401", minLat: 19.1, maxLat: 19.4, minLng: 76.6, maxLng: 77.0 },
      { q: "Jalna", pin: "431203", minLat: 19.6, maxLat: 20.0, minLng: 75.7, maxLng: 76.1 },
      { q: "Satara", pin: "415001", minLat: 17.5, maxLat: 17.8, minLng: 73.8, maxLng: 74.2 },
      { q: "Mahabaleshwar", pin: "412806", minLat: 17.7, maxLat: 18.1, minLng: 73.5, maxLng: 73.8 },
      { q: "Sangli", pin: "416416", minLat: 16.7, maxLat: 17.0, minLng: 74.4, maxLng: 74.8 },
      { q: "Ratnagiri", pin: "415612", minLat: 16.8, maxLat: 17.2, minLng: 73.1, maxLng: 73.5 },
      { q: "Sindhudurg", pin: "416812", minLat: 15.9, maxLat: 16.3, minLng: 73.5, maxLng: 73.9 },
      { q: "Alibag", pin: "402201", minLat: 18.5, maxLat: 18.8, minLng: 72.7, maxLng: 73.0 },
      { q: "Wardha", pin: "442001", minLat: 20.5, maxLat: 20.9, minLng: 78.4, maxLng: 78.8 },
      { q: "Buldhana", pin: "443001", minLat: 20.3, maxLat: 20.7, minLng: 76.0, maxLng: 76.4 },
      { q: "Dharashiv", pin: "413501", minLat: 18.0, maxLat: 18.3, minLng: 75.8, maxLng: 76.2 },
      { q: "Osmanabad", pin: "413501", minLat: 18.0, maxLat: 18.3, minLng: 75.8, maxLng: 76.2 },
      { q: "Beed", pin: "431122", minLat: 18.8, maxLat: 19.2, minLng: 75.6, maxLng: 76.0 }
    ];

    for (const c of maharashtraCases) {
      it(`MH: resolves "${c.q}" (${c.pin}) accurately (CRITICAL: never falls back to Gokarna)`, async () => {
        const byName = await resolvePlaceOrPincode(c.q);
        expect(byName.lat).toBeGreaterThanOrEqual(c.minLat);
        expect(byName.lat).toBeLessThanOrEqual(c.maxLat);
        expect(byName.lng).toBeGreaterThanOrEqual(c.minLng);
        expect(byName.lng).toBeLessThanOrEqual(c.maxLng);

        // Explicit check: Mumbai/Pune must NEVER return Gokarna coordinates
        expect(Math.abs(byName.lat - 14.5479)).toBeGreaterThan(1.0);

        const byPin = await resolvePlaceOrPincode(c.pin);
        expect(byPin.lat).toBeGreaterThanOrEqual(c.minLat - 0.5);
        expect(byPin.lat).toBeLessThanOrEqual(c.maxLat + 0.5);
      });
    }

    // 1C. Telangana (TG) Cities & Districts (40+ items)
    const telanganaCases = [
      { q: "Hyderabad", pin: "500001", minLat: 17.2, maxLat: 17.6, minLng: 78.3, maxLng: 78.7 },
      { q: "Secunderabad", pin: "500003", minLat: 17.3, maxLat: 17.6, minLng: 78.3, maxLng: 78.7 },
      { q: "Banjara Hills", pin: "500034", minLat: 17.3, maxLat: 17.5, minLng: 78.3, maxLng: 78.6 },
      { q: "Hitec City", pin: "500081", minLat: 17.3, maxLat: 17.6, minLng: 78.2, maxLng: 78.5 },
      { q: "Gachibowli", pin: "500032", minLat: 17.3, maxLat: 17.6, minLng: 78.2, maxLng: 78.5 },
      { q: "Kukatpally", pin: "500072", minLat: 17.3, maxLat: 17.6, minLng: 78.2, maxLng: 78.5 },
      { q: "Dilsukhnagar", pin: "500060", minLat: 17.2, maxLat: 17.5, minLng: 78.4, maxLng: 78.7 },
      { q: "Warangal", pin: "506001", minLat: 17.8, maxLat: 18.1, minLng: 79.4, maxLng: 79.8 },
      { q: "Nizamabad", pin: "503001", minLat: 18.5, maxLat: 18.8, minLng: 77.9, maxLng: 78.3 },
      { q: "Karimnagar", pin: "505001", minLat: 18.3, maxLat: 18.6, minLng: 79.0, maxLng: 79.3 },
      { q: "Ramagundam", pin: "505208", minLat: 18.6, maxLat: 18.9, minLng: 79.3, maxLng: 79.7 },
      { q: "Khammam", pin: "507001", minLat: 17.1, maxLat: 17.4, minLng: 80.0, maxLng: 80.3 },
      { q: "Mahabubnagar", pin: "509001", minLat: 16.6, maxLat: 16.9, minLng: 77.8, maxLng: 78.2 },
      { q: "Nalgonda", pin: "508001", minLat: 16.9, maxLat: 17.2, minLng: 79.1, maxLng: 79.4 },
      { q: "Miryalaguda", pin: "508207", minLat: 16.7, maxLat: 17.0, minLng: 79.4, maxLng: 79.7 },
      { q: "Suryapet", pin: "508213", minLat: 17.0, maxLat: 17.3, minLng: 79.4, maxLng: 79.8 },
      { q: "Siddipet", pin: "502103", minLat: 17.9, maxLat: 18.3, minLng: 78.7, maxLng: 79.0 },
      { q: "Adilabad", pin: "504001", minLat: 19.5, maxLat: 19.8, minLng: 78.3, maxLng: 78.7 },
      { q: "Nirmal", pin: "504106", minLat: 18.9, maxLat: 19.3, minLng: 78.1, maxLng: 78.5 },
      { q: "Mancherial", pin: "504208", minLat: 18.7, maxLat: 19.0, minLng: 79.3, maxLng: 79.6 },
      { q: "Jagtial", pin: "505327", minLat: 18.6, maxLat: 19.0, minLng: 78.7, maxLng: 79.1 },
      { q: "Kamareddy", pin: "503111", minLat: 18.1, maxLat: 18.5, minLng: 78.1, maxLng: 78.5 },
      { q: "Sircilla", pin: "505301", minLat: 18.2, maxLat: 18.5, minLng: 78.6, maxLng: 79.0 },
      { q: "Sangareddy", pin: "502001", minLat: 17.4, maxLat: 17.8, minLng: 77.9, maxLng: 78.3 },
      { q: "Medak", pin: "502110", minLat: 17.9, maxLat: 18.2, minLng: 78.1, maxLng: 78.4 },
      { q: "Vikarabad", pin: "501101", minLat: 17.1, maxLat: 17.5, minLng: 77.7, maxLng: 78.1 },
      { q: "Gadwal", pin: "509125", minLat: 16.1, maxLat: 16.4, minLng: 77.6, maxLng: 78.0 },
      { q: "Wanaparthy", pin: "509103", minLat: 16.2, maxLat: 16.5, minLng: 77.9, maxLng: 78.2 },
      { q: "Nagarkurnool", pin: "509209", minLat: 16.3, maxLat: 16.6, minLng: 78.1, maxLng: 78.5 },
      { q: "Narayanpet", pin: "509210", minLat: 16.5, maxLat: 16.9, minLng: 77.3, maxLng: 77.7 },
      { q: "Bhadradri Kothagudem", pin: "507101", minLat: 17.4, maxLat: 17.7, minLng: 80.4, maxLng: 80.8 },
      { q: "Yadadri Bhuvanagiri", pin: "508116", minLat: 17.3, maxLat: 17.7, minLng: 78.7, maxLng: 79.1 },
      { q: "Bhongir", pin: "508116", minLat: 17.3, maxLat: 17.7, minLng: 78.7, maxLng: 79.1 },
      { q: "Jangaon", pin: "506167", minLat: 17.5, maxLat: 17.9, minLng: 79.0, maxLng: 79.3 }
    ];

    for (const c of telanganaCases) {
      it(`TG: resolves "${c.q}" (${c.pin}) accurately`, async () => {
        const byName = await resolvePlaceOrPincode(c.q);
        expect(byName.lat).toBeGreaterThanOrEqual(c.minLat);
        expect(byName.lat).toBeLessThanOrEqual(c.maxLat);
        expect(byName.lng).toBeGreaterThanOrEqual(c.minLng);
        expect(byName.lng).toBeLessThanOrEqual(c.maxLng);

        const byPin = await resolvePlaceOrPincode(c.pin);
        expect(byPin.lat).toBeGreaterThanOrEqual(c.minLat - 0.5);
        expect(byPin.lat).toBeLessThanOrEqual(c.maxLat + 0.5);
      });
    }

    // 1D. Tamil Nadu (TN) Cities & Districts (40+ items)
    const tamilNaduCases = [
      { q: "Chennai", pin: "600001", minLat: 12.9, maxLat: 13.3, minLng: 80.1, maxLng: 80.4 },
      { q: "Madras", pin: "600001", minLat: 12.9, maxLat: 13.3, minLng: 80.1, maxLng: 80.4 },
      { q: "T Nagar", pin: "600017", minLat: 12.9, maxLat: 13.2, minLng: 80.1, maxLng: 80.4 },
      { q: "Mylapore", pin: "600004", minLat: 12.9, maxLat: 13.2, minLng: 80.1, maxLng: 80.4 },
      { q: "Tambaram", pin: "600045", minLat: 12.8, maxLat: 13.1, minLng: 79.9, maxLng: 80.3 },
      { q: "Velachery", pin: "600042", minLat: 12.8, maxLat: 13.1, minLng: 80.1, maxLng: 80.3 },
      { q: "Coimbatore", pin: "641001", minLat: 10.8, maxLat: 11.2, minLng: 76.8, maxLng: 77.1 },
      { q: "Kovai", pin: "641001", minLat: 10.8, maxLat: 11.2, minLng: 76.8, maxLng: 77.1 },
      { q: "Pollachi", pin: "642001", minLat: 10.5, maxLat: 10.8, minLng: 76.8, maxLng: 77.2 },
      { q: "Madurai", pin: "625001", minLat: 9.7, maxLat: 10.1, minLng: 78.0, maxLng: 78.3 },
      { q: "Tiruchirappalli", pin: "620001", minLat: 10.6, maxLat: 11.0, minLng: 78.5, maxLng: 78.9 },
      { q: "Trichy", pin: "620001", minLat: 10.6, maxLat: 11.0, minLng: 78.5, maxLng: 78.9 },
      { q: "Salem", pin: "636001", minLat: 11.5, maxLat: 11.8, minLng: 78.0, maxLng: 78.3 },
      { q: "Tirunelveli", pin: "627001", minLat: 8.5, maxLat: 8.9, minLng: 77.6, maxLng: 77.9 },
      { q: "Tiruppur", pin: "641601", minLat: 11.0, maxLat: 11.3, minLng: 77.2, maxLng: 77.5 },
      { q: "Vellore", pin: "632001", minLat: 12.7, maxLat: 13.1, minLng: 79.0, maxLng: 79.3 },
      { q: "Erode", pin: "638001", minLat: 11.2, maxLat: 11.5, minLng: 77.5, maxLng: 77.9 },
      { q: "Thoothukudi", pin: "628001", minLat: 8.6, maxLat: 8.9, minLng: 78.0, maxLng: 78.3 },
      { q: "Tuticorin", pin: "628001", minLat: 8.6, maxLat: 8.9, minLng: 78.0, maxLng: 78.3 },
      { q: "Tiruchendur", pin: "628215", minLat: 8.3, maxLat: 8.6, minLng: 78.0, maxLng: 78.3 },
      { q: "Dindigul", pin: "624001", minLat: 10.2, maxLat: 10.5, minLng: 77.8, maxLng: 78.1 },
      { q: "Palani", pin: "624601", minLat: 10.3, maxLat: 10.6, minLng: 77.3, maxLng: 77.7 },
      { q: "Kodaikanal", pin: "624101", minLat: 10.1, maxLat: 10.4, minLng: 77.3, maxLng: 77.6 },
      { q: "Thanjavur", pin: "613001", minLat: 10.6, maxLat: 11.0, minLng: 79.0, maxLng: 79.3 },
      { q: "Tanjore", pin: "613001", minLat: 10.6, maxLat: 11.0, minLng: 79.0, maxLng: 79.3 },
      { q: "Kumbakonam", pin: "612001", minLat: 10.8, maxLat: 11.1, minLng: 79.2, maxLng: 79.5 },
      { q: "Ranipet", pin: "632401", minLat: 12.8, maxLat: 13.1, minLng: 79.1, maxLng: 79.5 },
      { q: "Sivakasi", pin: "626123", minLat: 9.3, maxLat: 9.6, minLng: 77.6, maxLng: 78.0 },
      { q: "Karur", pin: "639001", minLat: 10.8, maxLat: 11.1, minLng: 77.9, maxLng: 78.2 },
      { q: "Udhagamandalam", pin: "643001", minLat: 11.2, maxLat: 11.6, minLng: 76.5, maxLng: 76.9 },
      { q: "Ooty", pin: "643001", minLat: 11.2, maxLat: 11.6, minLng: 76.5, maxLng: 76.9 },
      { q: "Kanchipuram", pin: "631501", minLat: 12.7, maxLat: 13.0, minLng: 79.5, maxLng: 79.9 },
      { q: "Chengalpattu", pin: "603001", minLat: 12.5, maxLat: 12.8, minLng: 79.8, maxLng: 80.1 },
      { q: "Mahabalipuram", pin: "603104", minLat: 12.5, maxLat: 12.8, minLng: 80.0, maxLng: 80.3 },
      { q: "Tiruvallur", pin: "631201", minLat: 13.0, maxLat: 13.3, minLng: 79.7, maxLng: 80.1 },
      { q: "Gummidipoondi", pin: "601201", minLat: 13.2, maxLat: 13.6, minLng: 79.9, maxLng: 80.3 },
      { q: "Krishnagiri", pin: "635001", minLat: 12.4, maxLat: 12.7, minLng: 78.0, maxLng: 78.4 },
      { q: "Hosur", pin: "635109", minLat: 12.6, maxLat: 12.9, minLng: 77.6, maxLng: 78.0 },
      { q: "Cuddalore", pin: "607001", minLat: 11.6, maxLat: 11.9, minLng: 79.6, maxLng: 79.9 },
      { q: "Chidambaram", pin: "608001", minLat: 11.2, maxLat: 11.5, minLng: 79.5, maxLng: 79.8 },
      { q: "Nagapattinam", pin: "611001", minLat: 10.6, maxLat: 10.9, minLng: 79.7, maxLng: 80.0 },
      { q: "Kanyakumari", pin: "629702", minLat: 7.9, maxLat: 8.3, minLng: 77.3, maxLng: 77.7 },
      { q: "Nagercoil", pin: "629001", minLat: 8.0, maxLat: 8.3, minLng: 77.2, maxLng: 77.6 },
      { q: "Rameswaram", pin: "623526", minLat: 9.1, maxLat: 9.4, minLng: 79.1, maxLng: 79.5 },
      { q: "Tiruvannamalai", pin: "606601", minLat: 12.0, maxLat: 12.4, minLng: 78.9, maxLng: 79.2 },
      { q: "Dharmapuri", pin: "636701", minLat: 11.9, maxLat: 12.3, minLng: 78.0, maxLng: 78.3 },
      { q: "Namakkal", pin: "637001", minLat: 11.0, maxLat: 11.4, minLng: 78.0, maxLng: 78.3 }
    ];

    for (const c of tamilNaduCases) {
      it(`TN: resolves "${c.q}" (${c.pin}) accurately`, async () => {
        const byName = await resolvePlaceOrPincode(c.q);
        expect(byName.lat).toBeGreaterThanOrEqual(c.minLat);
        expect(byName.lat).toBeLessThanOrEqual(c.maxLat);
        expect(byName.lng).toBeGreaterThanOrEqual(c.minLng);
        expect(byName.lng).toBeLessThanOrEqual(c.maxLng);

        const byPin = await resolvePlaceOrPincode(c.pin);
        expect(byPin.lat).toBeGreaterThanOrEqual(c.minLat - 0.5);
        expect(byPin.lat).toBeLessThanOrEqual(c.maxLat + 0.5);
      });
    }

    // 1E. Pan-India Capitals & Major Cultural Hubs (30+ items)
    const panIndiaCases = [
      { q: "Delhi", pin: "110001", minLat: 28.4, maxLat: 28.8, minLng: 77.0, maxLng: 77.4 },
      { q: "New Delhi", pin: "110001", minLat: 28.4, maxLat: 28.8, minLng: 77.0, maxLng: 77.4 },
      { q: "Noida", pin: "201301", minLat: 28.3, maxLat: 28.7, minLng: 77.2, maxLng: 77.5 },
      { q: "Gurugram", pin: "122001", minLat: 28.3, maxLat: 28.6, minLng: 76.9, maxLng: 77.2 },
      { q: "Gurgaon", pin: "122001", minLat: 28.3, maxLat: 28.6, minLng: 76.9, maxLng: 77.2 },
      { q: "Chandigarh", pin: "160017", minLat: 30.5, maxLat: 30.9, minLng: 76.6, maxLng: 77.0 },
      { q: "Kolkata", pin: "700001", minLat: 22.4, maxLat: 22.8, minLng: 88.2, maxLng: 88.5 },
      { q: "Calcutta", pin: "700001", minLat: 22.4, maxLat: 22.8, minLng: 88.2, maxLng: 88.5 },
      { q: "Ahmedabad", pin: "380001", minLat: 22.8, maxLat: 23.2, minLng: 72.4, maxLng: 72.7 },
      { q: "Surat", pin: "395001", minLat: 21.0, maxLat: 21.3, minLng: 72.6, maxLng: 73.0 },
      { q: "Vadodara", pin: "390001", minLat: 22.1, maxLat: 22.5, minLng: 73.0, maxLng: 73.4 },
      { q: "Jaipur", pin: "302001", minLat: 26.7, maxLat: 27.1, minLng: 75.6, maxLng: 76.0 },
      { q: "Jodhpur", pin: "342001", minLat: 26.1, maxLat: 26.4, minLng: 72.8, maxLng: 73.2 },
      { q: "Udaipur", pin: "313001", minLat: 24.4, maxLat: 24.8, minLng: 73.5, maxLng: 73.9 },
      { q: "Lucknow", pin: "226001", minLat: 26.6, maxLat: 27.0, minLng: 80.7, maxLng: 81.1 },
      { q: "Kanpur", pin: "208001", minLat: 26.3, maxLat: 26.6, minLng: 80.1, maxLng: 80.5 },
      { q: "Varanasi", pin: "221001", minLat: 25.1, maxLat: 25.5, minLng: 82.8, maxLng: 83.1 },
      { q: "Kashi", pin: "221001", minLat: 25.1, maxLat: 25.5, minLng: 82.8, maxLng: 83.1 },
      { q: "Ayodhya", pin: "224123", minLat: 26.6, maxLat: 27.0, minLng: 82.0, maxLng: 82.4 },
      { q: "Mathura", pin: "281001", minLat: 27.3, maxLat: 27.6, minLng: 77.5, maxLng: 77.8 },
      { q: "Prayagraj", pin: "211001", minLat: 25.2, maxLat: 25.6, minLng: 81.6, maxLng: 82.0 },
      { q: "Agra", pin: "282001", minLat: 27.0, maxLat: 27.3, minLng: 77.8, maxLng: 78.2 },
      { q: "Patna", pin: "800001", minLat: 25.4, maxLat: 25.8, minLng: 85.0, maxLng: 85.3 },
      { q: "Gaya", pin: "823001", minLat: 24.6, maxLat: 25.0, minLng: 84.8, maxLng: 85.2 },
      { q: "Bhopal", pin: "462001", minLat: 23.1, maxLat: 23.4, minLng: 77.2, maxLng: 77.6 },
      { q: "Indore", pin: "452001", minLat: 22.5, maxLat: 22.9, minLng: 75.7, maxLng: 76.0 },
      { q: "Ujjain", pin: "456001", minLat: 23.0, maxLat: 23.3, minLng: 75.6, maxLng: 76.0 },
      { q: "Raipur", pin: "492001", minLat: 21.1, maxLat: 21.4, minLng: 81.4, maxLng: 81.8 },
      { q: "Bhubaneswar", pin: "751001", minLat: 20.1, maxLat: 20.5, minLng: 85.6, maxLng: 86.0 },
      { q: "Puri", pin: "752001", minLat: 19.6, maxLat: 20.0, minLng: 85.6, maxLng: 86.0 },
      { q: "Ranchi", pin: "834001", minLat: 23.1, maxLat: 23.5, minLng: 85.1, maxLng: 85.5 },
      { q: "Dehradun", pin: "248001", minLat: 30.1, maxLat: 30.5, minLng: 77.8, maxLng: 78.2 },
      { q: "Haridwar", pin: "249401", minLat: 29.8, maxLat: 30.1, minLng: 78.0, maxLng: 78.3 },
      { q: "Rishikesh", pin: "249201", minLat: 29.9, maxLat: 30.2, minLng: 78.1, maxLng: 78.4 },
      { q: "Shimla", pin: "171001", minLat: 30.9, maxLat: 31.3, minLng: 77.0, maxLng: 77.3 },
      { q: "Amritsar", pin: "143001", minLat: 31.4, maxLat: 31.8, minLng: 74.7, maxLng: 75.0 },
      { q: "Srinagar", pin: "190001", minLat: 33.9, maxLat: 34.3, minLng: 74.6, maxLng: 75.0 },
      { q: "Jammu", pin: "180001", minLat: 32.5, maxLat: 32.9, minLng: 74.7, maxLng: 75.0 },
      { q: "Guwahati", pin: "781001", minLat: 26.0, maxLat: 26.3, minLng: 91.5, maxLng: 91.9 },
      { q: "Panaji", pin: "403001", minLat: 15.3, maxLat: 15.6, minLng: 73.6, maxLng: 74.0 },
      { q: "Kochi", pin: "682001", minLat: 9.8, maxLat: 10.1, minLng: 76.1, maxLng: 76.4 },
      { q: "Thiruvananthapuram", pin: "695001", minLat: 8.3, maxLat: 8.7, minLng: 76.8, maxLng: 77.1 },
      { q: "Visakhapatnam", pin: "530001", minLat: 17.5, maxLat: 17.8, minLng: 83.0, maxLng: 83.4 },
      { q: "Vijayawada", pin: "520001", minLat: 16.3, maxLat: 16.7, minLng: 80.4, maxLng: 80.8 },
      { q: "Tirupati", pin: "517501", minLat: 13.5, maxLat: 13.8, minLng: 79.2, maxLng: 79.6 }
    ];

    for (const c of panIndiaCases) {
      it(`Pan-India: resolves "${c.q}" (${c.pin}) accurately`, async () => {
        const byName = await resolvePlaceOrPincode(c.q);
        expect(byName.lat).toBeGreaterThanOrEqual(c.minLat);
        expect(byName.lat).toBeLessThanOrEqual(c.maxLat);
        expect(byName.lng).toBeGreaterThanOrEqual(c.minLng);
        expect(byName.lng).toBeLessThanOrEqual(c.maxLng);

        const byPin = await resolvePlaceOrPincode(c.pin);
        expect(byPin.lat).toBeGreaterThanOrEqual(c.minLat - 0.5);
        expect(byPin.lat).toBeLessThanOrEqual(c.maxLat + 0.5);
      });
    }
  });

  // =========================================================================
  // SECTION 2: 100+ International Cities & Postal Codes Audit
  // =========================================================================
  describe("2. 100+ International Cities & Postal Codes Resolution", () => {
    const internationalCases = [
      // USA (24 cities)
      { q: "New York", country: "United States", minLat: 40.5, maxLat: 40.9, minLng: -74.2, maxLng: -73.8 },
      { q: "NYC", country: "United States", minLat: 40.5, maxLat: 40.9, minLng: -74.2, maxLng: -73.8 },
      { q: "Los Angeles", country: "United States", minLat: 33.8, maxLat: 34.3, minLng: -118.5, maxLng: -118.0 },
      { q: "Chicago", country: "United States", minLat: 41.6, maxLat: 42.1, minLng: -87.8, maxLng: -87.4 },
      { q: "Houston", country: "United States", minLat: 29.5, maxLat: 30.0, minLng: -95.6, maxLng: -95.1 },
      { q: "San Francisco", country: "United States", minLat: 37.5, maxLat: 37.9, minLng: -122.6, maxLng: -122.2 },
      { q: "San Jose", country: "United States", minLat: 37.1, maxLat: 37.5, minLng: -122.1, maxLng: -121.7 },
      { q: "Seattle", country: "United States", minLat: 47.4, maxLat: 47.8, minLng: -122.5, maxLng: -122.1 },
      { q: "Boston", country: "United States", minLat: 42.1, maxLat: 42.5, minLng: -71.2, maxLng: -70.9 },
      { q: "Dallas", country: "United States", minLat: 32.5, maxLat: 33.0, minLng: -97.0, maxLng: -96.6 },
      { q: "Austin", country: "United States", minLat: 30.0, maxLat: 30.5, minLng: -97.9, maxLng: -97.5 },
      { q: "Atlanta", country: "United States", minLat: 33.5, maxLat: 33.9, minLng: -84.6, maxLng: -84.2 },
      { q: "Miami", country: "United States", minLat: 25.5, maxLat: 25.9, minLng: -80.4, maxLng: -80.0 },
      { q: "Washington DC", country: "United States", minLat: 38.7, maxLat: 39.1, minLng: -77.2, maxLng: -76.8 },
      { q: "Philadelphia", country: "United States", minLat: 39.7, maxLat: 40.1, minLng: -75.3, maxLng: -75.0 },
      { q: "Phoenix", country: "United States", minLat: 33.2, maxLat: 33.6, minLng: -112.3, maxLng: -111.9 },
      { q: "San Diego", country: "United States", minLat: 32.5, maxLat: 32.9, minLng: -117.3, maxLng: -117.0 },
      { q: "Denver", country: "United States", minLat: 39.5, maxLat: 39.9, minLng: -105.1, maxLng: -104.8 },
      { q: "Detroit", country: "United States", minLat: 42.1, maxLat: 42.5, minLng: -83.2, maxLng: -82.9 },
      { q: "Minneapolis", country: "United States", minLat: 44.8, maxLat: 45.1, minLng: -93.4, maxLng: -93.1 },
      { q: "Jersey City", country: "United States", minLat: 40.5, maxLat: 40.9, minLng: -74.2, maxLng: -73.9 },
      { q: "Fremont", country: "United States", minLat: 37.3, maxLat: 37.7, minLng: -122.1, maxLng: -121.8 },
      { q: "Portland", country: "United States", minLat: 45.3, maxLat: 45.7, minLng: -122.8, maxLng: -122.5 },
      { q: "Charlotte", country: "United States", minLat: 35.0, maxLat: 35.4, minLng: -81.0, maxLng: -80.7 },

      // UK (12 cities)
      { q: "London", country: "United Kingdom", minLat: 51.3, maxLat: 51.7, minLng: -0.3, maxLng: 0.1 },
      { q: "Birmingham", country: "United Kingdom", minLat: 52.3, maxLat: 52.6, minLng: -2.1, maxLng: -1.7 },
      { q: "Manchester", country: "United Kingdom", minLat: 53.3, maxLat: 53.6, minLng: -2.4, maxLng: -2.1 },
      { q: "Glasgow", country: "United Kingdom", minLat: 55.7, maxLat: 56.0, minLng: -4.4, maxLng: -4.1 },
      { q: "Edinburgh", country: "United Kingdom", minLat: 55.8, maxLat: 56.1, minLng: -3.3, maxLng: -3.0 },
      { q: "Leeds", country: "United Kingdom", minLat: 53.6, maxLat: 54.0, minLng: -1.7, maxLng: -1.4 },
      { q: "Liverpool", country: "United Kingdom", minLat: 53.2, maxLat: 53.6, minLng: -3.1, maxLng: -2.8 },
      { q: "Leicester", country: "United Kingdom", minLat: 52.5, maxLat: 52.8, minLng: -1.3, maxLng: -1.0 },
      { q: "Bristol", country: "United Kingdom", minLat: 51.3, maxLat: 51.6, minLng: -2.7, maxLng: -2.4 },
      { q: "Newcastle", country: "United Kingdom", minLat: 54.8, maxLat: 55.1, minLng: -1.8, maxLng: -1.4 },
      { q: "Cardiff", country: "United Kingdom", minLat: 51.3, maxLat: 51.6, minLng: -3.3, maxLng: -3.0 },
      { q: "Belfast", country: "United Kingdom", minLat: 54.4, maxLat: 54.7, minLng: -6.1, maxLng: -5.7 },

      // UAE & Middle East (12 cities)
      { q: "Dubai", country: "United Arab Emirates", minLat: 25.0, maxLat: 25.4, minLng: 55.1, maxLng: 55.4 },
      { q: "Abu Dhabi", country: "United Arab Emirates", minLat: 24.3, maxLat: 24.6, minLng: 54.2, maxLng: 54.5 },
      { q: "Sharjah", country: "United Arab Emirates", minLat: 25.2, maxLat: 25.5, minLng: 55.3, maxLng: 55.6 },
      { q: "Ajman", country: "United Arab Emirates", minLat: 25.3, maxLat: 25.5, minLng: 55.4, maxLng: 55.6 },
      { q: "Ras Al Khaimah", country: "United Arab Emirates", minLat: 25.6, maxLat: 25.9, minLng: 55.8, maxLng: 56.1 },
      { q: "Doha", country: "Qatar", minLat: 25.1, maxLat: 25.4, minLng: 51.4, maxLng: 51.7 },
      { q: "Riyadh", country: "Saudi Arabia", minLat: 24.5, maxLat: 24.9, minLng: 46.5, maxLng: 46.8 },
      { q: "Jeddah", country: "Saudi Arabia", minLat: 21.3, maxLat: 21.6, minLng: 39.0, maxLng: 39.4 },
      { q: "Dammam", country: "Saudi Arabia", minLat: 26.2, maxLat: 26.6, minLng: 49.9, maxLng: 50.3 },
      { q: "Kuwait City", country: "Kuwait", minLat: 29.2, maxLat: 29.5, minLng: 47.8, maxLng: 48.1 },
      { q: "Muscat", country: "Oman", minLat: 23.4, maxLat: 23.7, minLng: 58.2, maxLng: 58.5 },
      { q: "Manama", country: "Bahrain", minLat: 26.1, maxLat: 26.4, minLng: 50.4, maxLng: 50.7 },

      // Canada (7 cities)
      { q: "Toronto", country: "Canada", minLat: 43.4, maxLat: 43.8, minLng: -79.6, maxLng: -79.2 },
      { q: "Vancouver", country: "Canada", minLat: 49.1, maxLat: 49.4, minLng: -123.3, maxLng: -122.9 },
      { q: "Montreal", country: "Canada", minLat: 45.3, maxLat: 45.7, minLng: -73.7, maxLng: -73.4 },
      { q: "Calgary", country: "Canada", minLat: 50.8, maxLat: 51.2, minLng: -114.2, maxLng: -113.9 },
      { q: "Ottawa", country: "Canada", minLat: 45.2, maxLat: 45.6, minLng: -75.8, maxLng: -75.5 },
      { q: "Edmonton", country: "Canada", minLat: 53.3, maxLat: 53.7, minLng: -113.6, maxLng: -113.3 },
      { q: "Winnipeg", country: "Canada", minLat: 49.7, maxLat: 50.0, minLng: -97.3, maxLng: -96.9 },

      // Europe (22 cities)
      { q: "Paris", country: "France", minLat: 48.6, maxLat: 49.0, minLng: 2.1, maxLng: 2.5 },
      { q: "Amsterdam", country: "Netherlands", minLat: 52.2, maxLat: 52.5, minLng: 4.7, maxLng: 5.1 },
      { q: "Rotterdam", country: "Netherlands", minLat: 51.7, maxLat: 52.1, minLng: 4.3, maxLng: 4.6 },
      { q: "The Hague", country: "Netherlands", minLat: 51.9, maxLat: 52.2, minLng: 4.1, maxLng: 4.4 },
      { q: "Zurich", country: "Switzerland", minLat: 47.2, maxLat: 47.5, minLng: 8.3, maxLng: 8.7 },
      { q: "Geneva", country: "Switzerland", minLat: 46.0, maxLat: 46.4, minLng: 5.9, maxLng: 6.3 },
      { q: "Basel", country: "Switzerland", minLat: 47.4, maxLat: 47.7, minLng: 7.4, maxLng: 7.7 },
      { q: "Dublin", country: "Ireland", minLat: 53.1, maxLat: 53.5, minLng: -6.4, maxLng: -6.1 },
      { q: "Rome", country: "Italy", minLat: 41.7, maxLat: 42.1, minLng: 12.3, maxLng: 12.6 },
      { q: "Milan", country: "Italy", minLat: 45.3, maxLat: 45.6, minLng: 9.0, maxLng: 9.3 },
      { q: "Madrid", country: "Spain", minLat: 40.2, maxLat: 40.6, minLng: -3.9, maxLng: -3.5 },
      { q: "Barcelona", country: "Spain", minLat: 41.2, maxLat: 41.5, minLng: 2.0, maxLng: 2.3 },
      { q: "Vienna", country: "Austria", minLat: 48.0, maxLat: 48.3, minLng: 16.2, maxLng: 16.5 },
      { q: "Brussels", country: "Belgium", minLat: 50.7, maxLat: 51.0, minLng: 4.2, maxLng: 4.5 },
      { q: "Stockholm", country: "Sweden", minLat: 59.1, maxLat: 59.5, minLng: 17.9, maxLng: 18.2 },
      { q: "Oslo", country: "Norway", minLat: 59.7, maxLat: 60.1, minLng: 10.6, maxLng: 10.9 },
      { q: "Copenhagen", country: "Denmark", minLat: 55.5, maxLat: 55.8, minLng: 12.4, maxLng: 12.7 },
      { q: "Helsinki", country: "Finland", minLat: 60.0, maxLat: 60.3, minLng: 24.8, maxLng: 25.1 },
      { q: "Warsaw", country: "Poland", minLat: 52.0, maxLat: 52.4, minLng: 20.8, maxLng: 21.2 },
      { q: "Prague", country: "Czech Republic", minLat: 49.9, maxLat: 50.2, minLng: 14.2, maxLng: 14.6 },
      { q: "Athens", country: "Greece", minLat: 37.8, maxLat: 38.1, minLng: 23.5, maxLng: 23.9 },
      { q: "Lisbon", country: "Portugal", minLat: 38.5, maxLat: 38.9, minLng: -9.3, maxLng: -9.0 },

      // Asia-Pacific & Australia (20 cities)
      { q: "Singapore", country: "Singapore", minLat: 1.2, maxLat: 1.5, minLng: 103.6, maxLng: 104.0 },
      { q: "Kuala Lumpur", country: "Malaysia", minLat: 3.0, maxLat: 3.3, minLng: 101.5, maxLng: 101.8 },
      { q: "Bangkok", country: "Thailand", minLat: 13.6, maxLat: 13.9, minLng: 100.3, maxLng: 100.7 },
      { q: "Tokyo", country: "Japan", minLat: 35.5, maxLat: 35.8, minLng: 139.5, maxLng: 139.8 },
      { q: "Osaka", country: "Japan", minLat: 34.5, maxLat: 34.8, minLng: 135.3, maxLng: 135.7 },
      { q: "Seoul", country: "South Korea", minLat: 37.4, maxLat: 37.7, minLng: 126.8, maxLng: 127.1 },
      { q: "Hong Kong", country: "Hong Kong", minLat: 22.1, maxLat: 22.5, minLng: 114.0, maxLng: 114.3 },
      { q: "Taipei", country: "Taiwan", minLat: 24.8, maxLat: 25.2, minLng: 121.4, maxLng: 121.7 },
      { q: "Jakarta", country: "Indonesia", minLat: -6.4, maxLat: -6.0, minLng: 106.6, maxLng: 107.0 },
      { q: "Bali", country: "Indonesia", minLat: -8.6, maxLat: -8.2, minLng: 115.0, maxLng: 115.4 },
      { q: "Manila", country: "Philippines", minLat: 14.4, maxLat: 14.8, minLng: 120.8, maxLng: 121.2 },
      { q: "Sydney", country: "Australia", minLat: -34.0, maxLat: -33.6, minLng: 151.0, maxLng: 151.4 },
      { q: "Melbourne", country: "Australia", minLat: -38.0, maxLat: -37.6, minLng: 144.8, maxLng: 145.1 },
      { q: "Brisbane", country: "Australia", minLat: -27.6, maxLat: -27.3, minLng: 152.8, maxLng: 153.2 },
      { q: "Perth", country: "Australia", minLat: -32.1, maxLat: -31.7, minLng: 115.7, maxLng: 116.0 },
      { q: "Adelaide", country: "Australia", minLat: -35.1, maxLat: -34.7, minLng: 138.4, maxLng: 138.8 },
      { q: "Canberra", country: "Australia", minLat: -35.4, maxLat: -35.1, minLng: 149.0, maxLng: 149.3 },
      { q: "Auckland", country: "New Zealand", minLat: -37.0, maxLat: -36.6, minLng: 174.6, maxLng: 174.9 },
      { q: "Wellington", country: "New Zealand", minLat: -41.4, maxLat: -41.1, minLng: 174.6, maxLng: 174.9 },
      { q: "Christchurch", country: "New Zealand", minLat: -43.7, maxLat: -43.3, minLng: 172.4, maxLng: 172.8 },

      // Africa & Others (9 cities)
      { q: "Johannesburg", country: "South Africa", minLat: -26.4, maxLat: -26.0, minLng: 27.9, maxLng: 28.2 },
      { q: "Cape Town", country: "South Africa", minLat: -34.1, maxLat: -33.7, minLng: 18.2, maxLng: 18.6 },
      { q: "Durban", country: "South Africa", minLat: -30.0, maxLat: -29.6, minLng: 30.8, maxLng: 31.2 },
      { q: "Nairobi", country: "Kenya", minLat: -1.5, maxLat: -1.1, minLng: 36.6, maxLng: 37.0 },
      { q: "Port Louis", country: "Mauritius", minLat: -20.3, maxLat: -20.0, minLng: 57.3, maxLng: 57.7 },
      { q: "Cairo", country: "Egypt", minLat: 29.8, maxLat: 30.2, minLng: 31.0, maxLng: 31.4 },
      { q: "Istanbul", country: "Turkey", minLat: 40.8, maxLat: 41.2, minLng: 28.8, maxLng: 29.2 },
      { q: "Colombo", country: "Sri Lanka", minLat: 6.7, maxLat: 7.1, minLng: 79.7, maxLng: 80.0 },
      { q: "Kathmandu", country: "Nepal", minLat: 27.5, maxLat: 27.9, minLng: 85.1, maxLng: 85.5 }
    ];

    for (const c of internationalCases) {
      it(`Intl: resolves "${c.q}" (${c.country}) accurately`, async () => {
        const res = await resolvePlaceOrPincode(c.q);
        expect(res.lat).toBeGreaterThanOrEqual(c.minLat);
        expect(res.lat).toBeLessThanOrEqual(c.maxLat);
        expect(res.lng).toBeGreaterThanOrEqual(c.minLng);
        expect(res.lng).toBeLessThanOrEqual(c.maxLng);

        // Direct getCoordinates should also return the exact coordinates
        const coords = await getCoordinates(c.q);
        expect(coords.lat).toBeGreaterThanOrEqual(c.minLat);
        expect(coords.lat).toBeLessThanOrEqual(c.maxLat);
      });
    }
  });

  // =========================================================================
  // SECTION 3: Multi-Language Script Detection & Devotee Name Transliteration
  // =========================================================================
  describe("3. Devotee Name Script Detection & 5-Language Transliteration", () => {
    it("detects Kannada script accurately", () => {
      expect(detectScript("ಪ್ರಮೋದ್ ಕೊಡಗಿ")).toBe("kn");
      expect(detectScript("ಶ್ರೀರಾಮ ಪಂಡಿತ್")).toBe("kn");
      expect(detectScript("ವಿನಾಯಕ್")).toBe("kn");
    });

    it("detects Devanagari / Hindi script accurately", () => {
      expect(detectScript("प्रमोद कोडगी")).toBe("hi");
      expect(detectScript("श्रीराम पंडित")).toBe("hi");
      expect(detectScript("विनायक")).toBe("hi");
    });

    it("detects Telugu script accurately", () => {
      expect(detectScript("ప్రమోద్")).toBe("te");
      expect(detectScript("శ్రీరామ్ పండిట్")).toBe("te");
    });

    it("detects Tamil script accurately", () => {
      expect(detectScript("பிரமோத்")).toBe("ta");
      expect(detectScript("ஸ்ரீராம் பண்டிட்")).toBe("ta");
    });

    it("detects English / Latin script accurately", () => {
      expect(detectScript("Pramod Kodagi")).toBe("en");
      expect(detectScript("Shreeram Pandit")).toBe("en");
      expect(detectScript("Vinayaka")).toBe("en");
    });

    it("does not convert name if script already matches target language", () => {
      const knName = "ಪ್ರಮೋದ್ ಕೊಡಗಿ";
      expect(isScriptMatchingLanguage(knName, "kn")).toBe(true);
      expect(convertTextIfLanguageDiffers(knName, "kn")).toBe("ಪ್ರಮೋದ್ ಕೊಡಗಿ");

      const hiName = "प्रमोद कोडगी";
      expect(isScriptMatchingLanguage(hiName, "hi")).toBe(true);
      expect(convertTextIfLanguageDiffers(hiName, "hi")).toBe("प्रमोद कोडगी");

      const enName = "Pramod Kodagi";
      expect(isScriptMatchingLanguage(enName, "en")).toBe(true);
      expect(convertTextIfLanguageDiffers(enName, "en")).toBe("Pramod Kodagi");
    });

    it("converts name accurately when script differs from target language", () => {
      // English to Kannada
      expect(convertTextIfLanguageDiffers("Pramod Kodgi", "kn")).toBe("ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ");
      expect(convertTextIfLanguageDiffers("Vinayak", "kn")).toBe("ವಿನಾಯಕ್");
      expect(convertTextIfLanguageDiffers("Shreeram Pandit", "kn")).toBe("ಶ್ರೀರಾಮ ಪಂಡಿತ್");

      // English to Hindi
      expect(convertTextIfLanguageDiffers("Vinayak", "hi")).toBe("विनायक");
      expect(convertTextIfLanguageDiffers("Shreeram Pandit", "hi")).toBe("श्रीराम पंडित");

      // English to Telugu
      expect(convertTextIfLanguageDiffers("Vinayak", "te")).toBe("వినాయక్");

      // English to Tamil
      expect(convertTextIfLanguageDiffers("Vinayak", "ta")).toBe("விநாயக");

      // Kannada to English
      const enResult = convertTextIfLanguageDiffers("ಶ್ರೀರಾಮ ಪಂಡಿತ್", "en");
      expect(enResult.toLowerCase()).toContain("shreeram");
    });
  });
});

