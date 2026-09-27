import { describe, it, expect, beforeEach } from "vitest";
import {
  saveOrUpdatePriestProfile,
  findMatchingPriest,
  getAllPriests,
  getPriestProfile
} from "../features/seva/sevaPriestDirectory";
import {
  saveOrUpdateCustomPooja,
  findMatchingPooja,
  getCustomPoojas
} from "../features/seva/customPoojaRegistry";
import {
  saveOrUpdateCustomHolyPlace,
  findMatchingHolyPlace,
  getAllHolyPlaces
} from "../features/seva/holyPlaces";
import {
  syncSevaDataOnAction
} from "../services/sevaPersistenceService";

describe("Seva & Prasada Data Persistence and Synchronization", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Priest Directory Overrides and Insertion", () => {
    it("should update an existing priest phone number when ID or name matches", async () => {
      // Shreeram Pandit default phone is 9972339362
      const existing = getPriestProfile("shreeram-pandit");
      expect(existing).toBeDefined();

      const updated = await saveOrUpdatePriestProfile({
        id: "shreeram-pandit",
        name: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
        phone: "9880123456",
        lang: "kn"
      });

      expect(updated.action).toBe("updated");
      expect(updated.profile.phone).toBe("9880123456");

      // Verify directory reflects new phone
      const retrieved = getPriestProfile("shreeram-pandit");
      expect(retrieved.phone).toBe("9880123456");

      // In getAllPriests, the phone should also be updated
      const all = getAllPriests();
      const pandit = all.find((p) => p.id === "shreeram-pandit");
      expect(pandit?.phone).toBe("9880123456");
    });

    it("should match existing priest by normalized Kannada or English name and update details", async () => {
      // Match by name "Chaitanya Pandit" / "ಚೈತನ್ಯ ಪಂಡಿತ್"
      const match = findMatchingPriest("ಚೈತನ್ಯ ಪಂಡಿತ್");
      expect(match).toBeDefined();
      expect(match?.id).toBe("chaitanya-pandit");

      const res = await saveOrUpdatePriestProfile({
        name: "ಚೈತನ್ಯ ಪಂಡಿತ್",
        phone: "9448899001",
        lang: "kn"
      });

      expect(res.action).toBe("updated");
      expect(res.profile.id).toBe("chaitanya-pandit");
      expect(res.profile.phone).toBe("9448899001");
    });

    it("should insert a brand-new priest only when no details match", async () => {
      const allBefore = getAllPriests().length;

      const res = await saveOrUpdatePriestProfile({
        name: "ಶ್ರೀ ಗಣೇಶ ಭಟ್ ಬಗ್ಗೋಣ",
        phone: "9480112233",
        lang: "kn"
      });

      expect(res.action).toBe("inserted");
      expect(res.profile.id).toContain("priest_");
      expect(res.profile.phone).toBe("9480112233");
      expect(res.profile.name.kn).toBe("ಶ್ರೀ ಗಣೇಶ ಭಟ್ ಬಗ್ಗೋಣ");

      const allAfter = getAllPriests().length;
      expect(allAfter).toBe(allBefore + 1);

      // Subsequent call with same phone or name should update, NOT create duplicate
      const secondCall = await saveOrUpdatePriestProfile({
        name: "ಶ್ರೀ ಗಣೇಶ ಭಟ್ ಬಗ್ಗೋಣ",
        phone: "9480112233",
        lang: "kn"
      });
      expect(secondCall.action).toBe("updated");
      expect(secondCall.profile.id).toBe(res.profile.id);
      expect(getAllPriests().length).toBe(allAfter);
    });
  });

  describe("Custom & Combination Poojas Database Sync", () => {
    it("should insert new custom combination pooja and make it available in registry", async () => {
      const poojaName = "ಮುಕ್ತಿಮಂಟಪ ನಾರಾಯಣಬಲಿ & ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ";
      const matchBefore = findMatchingPooja(poojaName);
      expect(matchBefore).toBeNull();

      const saved = await saveOrUpdateCustomPooja(poojaName, "kn");
      expect(saved).toBeDefined();
      expect(saved).not.toBeNull();
      expect(saved!.id).toContain("custom_pooja_");
      expect(saved!.name.kn).toBe(poojaName);

      // Check registry
      const allCustom = getCustomPoojas();
      expect(allCustom.some((cp) => cp.name.kn === poojaName)).toBe(true);

      // Check idempotent lookup
      const matchAfter = findMatchingPooja(poojaName);
      expect(matchAfter).toBeDefined();
      expect(matchAfter?.id).toBe(saved!.id);

      // Inserting again should return existing without duplicates
      const savedAgain = await saveOrUpdateCustomPooja(poojaName, "kn");
      expect(savedAgain).not.toBeNull();
      expect(savedAgain!.id).toBe(saved!.id);
    });
  });

  describe("Custom Holy Places Database Sync", () => {
    it("should insert custom holy place (e.g. Mukti Mantapa Koti Teertha Gokarna) and include in getAllHolyPlaces", async () => {
      const placeText = "ಮುಕ್ತಿಮಂಟಪ ಕೋಟಿತೀರ್ಥ ಗೋಕರ್ಣ";
      const matchBefore = findMatchingHolyPlace(placeText);
      expect(matchBefore).toBeUndefined();

      const saved = await saveOrUpdateCustomHolyPlace(placeText, "581326", "kn");
      expect(saved).toBeDefined();
      expect(saved).not.toBeNull();
      expect(saved!.id).toContain("place_");
      expect(saved!.name.kn).toBe(placeText);

      // Should be returned in getAllHolyPlaces
      const allPlaces = getAllHolyPlaces();
      expect(allPlaces.some((p) => p.name.kn === placeText)).toBe(true);

      // Finding place with same/similar text should match
      const matched = findMatchingHolyPlace("Mukti Mantapa Koti Teertha Gokarna");
      expect(matched).toBeDefined();
      expect(matched?.id).toBe(saved!.id);
    });

    it("should match existing Gokarna holy places without duplicating", async () => {
      const matched = findMatchingHolyPlace("Kotiteertha Gokarna");
      expect(matched).toBeDefined();
      expect(matched?.id).toBe("kotiteertha");

      const saved = await saveOrUpdateCustomHolyPlace("ಕೋಟಿತೀರ್ಥ ಗೋಕರ್ಣ", "581326", "kn");
      expect(saved).not.toBeNull();
      expect(saved!.id).toBe("kotiteertha");
    });
  });

  describe("Central syncSevaDataOnAction Orchestrator", () => {
    it("should sync priest update, custom pooja, and custom place in one call", async () => {
      let eventFired = false;
      const listener = () => {
        eventFired = true;
      };
      window.addEventListener("baggona_seva_data_synced", listener);

      const result = await syncSevaDataOnAction({
        priest: {
          id: "shreeram-pandit",
          name: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
          phone: "9876543210",
          lang: "kn"
        },
        pooja: {
          name: "ಶ್ರೀ ರುದ್ರಯಾಗ & ಗಣಪತಿ ಹೋಮ",
          lang: "kn"
        },
        place: {
          name: "ಮೋಕ್ಷಧಾಮ ಹತ್ತಿರ ಸಮುದ್ರ ಗೋಕರ್ಣ",
          pincode: "581326",
          lang: "kn"
        },
        user: {
          name: "ಶ್ರೀಕಾಂತ್ ಶರ್ಮ",
          gotra: "ಕಾಶ್ಯಪ",
          place: "ಗೋಕರ್ಣ"
        }
      });

      expect(result.priest?.phone).toBe("9876543210");
      expect(result.pooja?.name.kn).toBe("ಶ್ರೀ ರುದ್ರಯಾಗ & ಗಣಪತಿ ಹೋಮ");
      expect(result.place?.name.kn).toBe("ಮೋಕ್ಷಧಾಮ ಹತ್ತಿರ ಸಮುದ್ರ ಗೋಕರ್ಣ");
      expect(eventFired).toBe(true);

      window.removeEventListener("baggona_seva_data_synced", listener);
    });
  });
});
