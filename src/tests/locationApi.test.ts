import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../db/indexedDb";
import { fetchDistricts, fetchStates, fetchVillages, fetchVillagesByPincode, getCoordinates, resolvePlaceFromPincode, resolvePlaceOrPincode } from "../services/locationApi";

describe("locationApi", () => {
  beforeEach(async () => {
    await db.geocodeCache.clear();
  });

  it("fetchStates returns 28+ entries", async () => {
    const states = await fetchStates();
    expect(states.length).toBeGreaterThanOrEqual(28);
  });

  it("fetchDistricts for MH includes Mumbai and Pune", async () => {
    const districts = await fetchDistricts("MH");
    const names = districts.map((district) => district.name);
    expect(names).toContain("Mumbai");
    expect(names).toContain("Pune");
  });

  it("API failure falls back to static village data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));
    const villages = await fetchVillages("MH-PUN", "411005");
    expect(villages.length).toBeGreaterThan(0);
    vi.unstubAllGlobals();
  });

  it("Gokarna PIN 581326 resolves instantly from bundled catalog", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));
    const list = await fetchVillagesByPincode("581326");
    expect(list?.[0]?.name).toBe("Gokarna");
    expect(list?.[0]?.stateCode).toBe("KA");
    const place = await resolvePlaceFromPincode("581326");
    expect(place?.lat).toBeCloseTo(14.5479, 3);
    expect(place?.lng).toBeCloseTo(74.3187, 3);
    vi.unstubAllGlobals();
  });

  it("Nominatim response cached in IndexedDB", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [{ lat: "18.5204", lon: "73.8567" }]
    }));
    vi.stubGlobal("fetch", fetchMock);

    const first = await getCoordinates("Pune");
    const second = await getCoordinates("Pune");
    expect(first.lat).toBe(18.5204);
    expect(second.lng).toBe(73.8567);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("resolves various Indian pincodes and places reliably", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));
    
    // Bangalore PIN 560001
    const bgl = await resolvePlaceFromPincode("560001");
    expect(bgl).not.toBeNull();
    expect(bgl?.lat).toBeGreaterThan(12);
    expect(bgl?.lng).toBeGreaterThan(70);

    // Delhi PIN 110001
    const del = await resolvePlaceFromPincode("110001");
    expect(del).not.toBeNull();
    expect(del?.lat).toBeGreaterThan(25);
    expect(del?.lng).toBeGreaterThan(75);

    // Universal resolver with City name
    const cityRes = await resolvePlaceOrPincode("Bengaluru");
    expect(cityRes.placeName).toBe("Bengaluru");
    expect(cityRes.lat).toBeGreaterThan(0);
    expect(cityRes.lng).toBeGreaterThan(0);

    // PIN 601201 offline fallback to Tamil Nadu centroid (NEVER Gokarna)
    const tnFallback = await resolvePlaceFromPincode("601201");
    expect(tnFallback).not.toBeNull();
    expect(tnFallback?.stateCode).toBe("TN");
    expect(tnFallback?.lat).toBeCloseTo(13.0827, 2);
    expect(tnFallback?.lng).toBeCloseTo(80.2707, 2);
    // Crucial check: must NOT be Gokarna coordinates
    expect(tnFallback?.lat).not.toBeCloseTo(14.5479, 2);

    vi.unstubAllGlobals();
  });

  it("resolves 601201 with exact Gummidipoondi, Tiruvallur place name and coordinates", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes("nominatim.openstreetmap.org/search?postalcode=601201")) {
        return {
          ok: true,
          json: async () => [
            {
              lat: "13.4295847",
              lon: "80.1168189",
              address: {
                county: "Gummidipoondi",
                state_district: "Thiruvallur",
                state: "Tamil Nadu"
              }
            }
          ]
        } as unknown as Response;
      }
      if (urlStr.includes("api.postalpincode.in/pincode/601201")) {
        return {
          ok: true,
          json: async () => [
            {
              Status: "Success",
              PostOffice: [
                {
                  Name: "Gummidipundi",
                  BranchType: "Sub Post Office",
                  District: "Tiruvallur",
                  State: "Tamil Nadu",
                  Pincode: "601201"
                },
                {
                  Name: "Arambakkam",
                  BranchType: "Branch Post Office",
                  District: "Tiruvallur",
                  State: "Tamil Nadu",
                  Pincode: "601201"
                }
              ]
            }
          ]
        } as unknown as Response;
      }
      return { ok: false } as unknown as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const res = await resolvePlaceFromPincode("601201");
    expect(res).not.toBeNull();
    expect(res?.villageName).toBe("Gummidipoondi, Tiruvallur");
    expect(res?.stateCode).toBe("TN");
    expect(res?.districtCode).toBe("TN-TIR");
    expect(res?.lat).toBeCloseTo(13.4296, 3);
    expect(res?.lng).toBeCloseTo(80.1168, 3);

    // Universal resolver formatted output
    const placeRes = await resolvePlaceOrPincode("601201");
    expect(placeRes.placeName).toBe("Gummidipoondi, Tiruvallur (601201)");
    expect(placeRes.lat).toBeCloseTo(13.4296, 3);
    expect(placeRes.lng).toBeCloseTo(80.1168, 3);

    vi.unstubAllGlobals();
  });
});

