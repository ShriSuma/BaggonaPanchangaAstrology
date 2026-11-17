import { describe, it, expect, vi } from "vitest";
import {
  searchOfflineIndianCities,
  searchOnlineIndianCities,
  searchPanIndiaCities,
  type CitySuggestion
} from "../services/citySearchService";

describe("Pan-India City Search & Autocomplete Engine", () => {
  describe("searchOfflineIndianCities (0ms synchronous lookup)", () => {
    it("returns empty array for empty or single-character queries", () => {
      expect(searchOfflineIndianCities("")).toEqual([]);
      expect(searchOfflineIndianCities(" ")).toEqual([]);
      expect(searchOfflineIndianCities("b")).toEqual([]);
      expect(searchOfflineIndianCities("a")).toEqual([]);
    });

    it("matches exact prefix queries for major Indian metro cities", () => {
      const benResults = searchOfflineIndianCities("ben", 5);
      expect(benResults.length).toBeGreaterThan(0);
      expect(benResults.some((c) => c.cityName.toLowerCase().includes("bengaluru"))).toBe(true);

      const mumResults = searchOfflineIndianCities("mum", 5);
      expect(mumResults.length).toBeGreaterThan(0);
      expect(mumResults.some((c) => c.cityName.toLowerCase().includes("mumbai"))).toBe(true);

      const delResults = searchOfflineIndianCities("del", 5);
      expect(delResults.length).toBeGreaterThan(0);
      expect(delResults.some((c) => c.cityName.toLowerCase().includes("delhi"))).toBe(true);

      const hydResults = searchOfflineIndianCities("hyd", 5);
      expect(hydResults.length).toBeGreaterThan(0);
      expect(hydResults.some((c) => c.cityName.toLowerCase().includes("hyderabad"))).toBe(true);

      const kolResults = searchOfflineIndianCities("kol", 5);
      expect(kolResults.length).toBeGreaterThan(0);
      expect(kolResults.some((c) => c.cityName.toLowerCase().includes("kolkata"))).toBe(true);
    });

    it("matches sacred and coastal Karnataka temple towns", () => {
      const gokResults = searchOfflineIndianCities("gok", 5);
      expect(gokResults.length).toBeGreaterThan(0);
      expect(gokResults.some((c) => c.cityName.toLowerCase().includes("gokarna"))).toBe(true);

      const kumResults = searchOfflineIndianCities("kum", 5);
      expect(kumResults.length).toBeGreaterThan(0);
      expect(kumResults.some((c) => c.cityName.toLowerCase().includes("kumta"))).toBe(true);

      const uduResults = searchOfflineIndianCities("udu", 5);
      expect(uduResults.length).toBeGreaterThan(0);
      expect(uduResults.some((c) => c.cityName.toLowerCase().includes("udupi"))).toBe(true);

      const sirResults = searchOfflineIndianCities("sir", 5);
      expect(sirResults.length).toBeGreaterThan(0);
      expect(sirResults.some((c) => c.cityName.toLowerCase().includes("sirsi"))).toBe(true);
    });

    it("resolves historic and popular city aliases seamlessly", () => {
      // Bangalore -> Bengaluru
      const bangalore = searchOfflineIndianCities("bangalore", 5);
      expect(bangalore.some((c) => c.cityName === "Bengaluru")).toBe(true);

      // Bombay -> Mumbai
      const bombay = searchOfflineIndianCities("bombay", 5);
      expect(bombay.some((c) => c.cityName === "Mumbai")).toBe(true);

      // Kashi -> Varanasi
      const kashi = searchOfflineIndianCities("kashi", 5);
      expect(kashi.some((c) => c.cityName === "Varanasi")).toBe(true);

      // Poona -> Pune
      const poona = searchOfflineIndianCities("poona", 5);
      expect(poona.some((c) => c.cityName === "Pune")).toBe(true);

      // Belgaum -> Belagavi
      const belgaum = searchOfflineIndianCities("belgaum", 5);
      expect(belgaum.some((c) => c.cityName === "Belagavi")).toBe(true);

      // Madras -> Chennai
      const madras = searchOfflineIndianCities("madras", 5);
      expect(madras.some((c) => c.cityName === "Chennai")).toBe(true);
    });

    it("resolves Indian pincode prefixes to relevant cities", () => {
      const pin560 = searchOfflineIndianCities("560", 5);
      expect(pin560.length).toBeGreaterThan(0);
      expect(pin560.some((c) => c.cityName === "Bengaluru")).toBe(true);

      const pin581 = searchOfflineIndianCities("581", 5);
      expect(pin581.length).toBeGreaterThan(0);
      expect(pin581.some((c) => c.pincode?.startsWith("581"))).toBe(true);
    });

    it("guarantees valid geographic coordinates for astrological calculations", () => {
      const sampleQueries = ["ben", "gok", "del", "mum", "var", "che", "hyd", "kol"];

      for (const q of sampleQueries) {
        const results = searchOfflineIndianCities(q, 5);
        for (const city of results) {
          expect(typeof city.lat).toBe("number");
          expect(typeof city.lng).toBe("number");
          expect(isNaN(city.lat)).toBe(false);
          expect(isNaN(city.lng)).toBe(false);

          // India bounding box check: Lat 6° to 38° N, Lng 68° to 98° E
          expect(city.lat).toBeGreaterThanOrEqual(6);
          expect(city.lat).toBeLessThanOrEqual(38);
          expect(city.lng).toBeGreaterThanOrEqual(68);
          expect(city.lng).toBeLessThanOrEqual(98);

          expect(city.stateName).toBeTruthy();
          expect(city.displayName).toContain(city.cityName);
        }
      }
    });

    it("respects the limit argument strictly", () => {
      const results3 = searchOfflineIndianCities("a", 3);
      // 'a' has len < 2, so 0
      expect(results3.length).toBe(0);

      const resultsLimit2 = searchOfflineIndianCities("ka", 2);
      expect(resultsLimit2.length).toBeLessThanOrEqual(2);

      const resultsLimit7 = searchOfflineIndianCities("ka", 7);
      expect(resultsLimit7.length).toBeLessThanOrEqual(7);
    });
  });

  describe("searchPanIndiaCities (Dual-Layer Hybrid Integration)", () => {
    it("invokes immediate offline callback for zero perceived latency", async () => {
      let immediateCalled = false;
      let immediateCount = 0;

      const results = await searchPanIndiaCities("Bengaluru", 5, (offline) => {
        immediateCalled = true;
        immediateCount = offline.length;
      });

      expect(immediateCalled).toBe(true);
      expect(immediateCount).toBeGreaterThan(0);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].cityName).toBe("Bengaluru");
    });

    it("deduplicates suggestions properly when merging results", async () => {
      const results = await searchPanIndiaCities("Gokarna", 5);
      const uniqueNames = new Set(results.map((r) => r.cityName.toLowerCase()));
      // Ensure no identical duplicates in the result list
      expect(uniqueNames.size).toBe(results.length);
    });
  });
});
