import { describe, it, expect } from "vitest";
import {
  SANDHYA_PERIODS,
  SANDHYAVANDANA_STEPS,
  GOTRA_CATALOG,
  FEATURED_MANTRA_SUITE,
  detectCurrentSandhyaPeriod,
  buildPersonalizedAbhivadana
} from "../features/sandhyavandana/sandhyavandanaData";
import {
  encodeSecureSandhyavandanaToken,
  decodeSecureSandhyavandanaToken,
  createSandhyavandanaSession,
  getSandhyavandanaSession,
  updateSandhyavandanaProgress
} from "../features/sandhyavandana/sandhyavandanaDbService";

describe("Authentic Karnataka Vedic Sandhyavandana Master Engine", () => {
  describe("1. Trikaala Period Detection & Metadata", () => {
    it("should have all 3 Sandhya periods configured with authentic metadata", () => {
      expect(Object.keys(SANDHYA_PERIODS)).toHaveLength(3);
      const pratah = SANDHYA_PERIODS.pratah;
      const madhyahna = SANDHYA_PERIODS.madhyahna;
      const sayam = SANDHYA_PERIODS.sayam;

      expect(pratah).toBeDefined();
      expect(pratah.titleKn).toContain("ಪ್ರಾತಃ ಸಂಧ್ಯಾವಂದನೆ");
      expect(pratah.arghyaCount).toBe(3);
      expect(pratah.arghyaDirectionKn).toContain("ಪೂರ್ವ");

      expect(madhyahna).toBeDefined();
      expect(madhyahna.titleKn).toContain("ಮಾಧ್ಯಾಹ್ನಿಕ");
      expect(madhyahna.arghyaCount).toBe(3);
      expect(madhyahna.arghyaDirectionKn).toContain("ಸೂರ್ಯ");

      expect(sayam).toBeDefined();
      expect(sayam.titleKn).toContain("ಸಾಯಂ ಸಂಧ್ಯಾವಂದನೆ");
      expect(sayam.arghyaCount).toBe(3);
      expect(sayam.arghyaDirectionKn).toContain("ಪಶ್ಚಿಮ");
    });

    it("detectCurrentSandhyaPeriod should return pratah during morning hours", () => {
      const morningDate = new Date(2026, 9, 18, 6, 30, 0); // 6:30 AM
      expect(detectCurrentSandhyaPeriod(morningDate)).toBe("pratah");
    });

    it("detectCurrentSandhyaPeriod should return madhyahna during noon hours", () => {
      const noonDate = new Date(2026, 9, 18, 12, 15, 0); // 12:15 PM
      expect(detectCurrentSandhyaPeriod(noonDate)).toBe("madhyahna");
    });

    it("detectCurrentSandhyaPeriod should return sayam during evening hours", () => {
      const eveningDate = new Date(2026, 9, 18, 18, 45, 0); // 6:45 PM
      expect(detectCurrentSandhyaPeriod(eveningDate)).toBe("sayam");
    });
  });

  describe("2. Step-by-Step Sandhyavandana Ritual & Exact Karnataka Mantras", () => {
    it("should contain all 14 sequential steps with detailed Kaikarana instructions", () => {
      expect(SANDHYAVANDANA_STEPS.length).toBeGreaterThanOrEqual(14);
      SANDHYAVANDANA_STEPS.forEach((step, idx) => {
        expect(step.stepNumber).toBe(idx + 1);
        expect(step.titleKn).toBeTruthy();
        expect(step.actionCueKn).toBeTruthy();
        expect(step.mantraKannada).toBeTruthy();
        expect(step.priestSpokenInstructionKn).toBeTruthy();
      });
    });

    it("Step 1 (Aachamana) strictly contains the exact user-specified Veda sip mantras", () => {
      const achamana = SANDHYAVANDANA_STEPS.find((s) => s.id === "achamana");
      expect(achamana).toBeDefined();
      expect(achamana?.mantraKannada).toContain("ಓಂ ಭೂಃ ಋಗ್ವೇದಾಯ ಸ್ವಾಹಾ");
      expect(achamana?.mantraKannada).toContain("ಓಂ ಭುವಃ ಯಜುರ್ವೇದಾಯ ಸ್ವಾಹಾ");
      expect(achamana?.mantraKannada).toContain("ಓಂ ಸ್ವಃ ಸಾಮವೇದಾಯ ಸ್ವಾಹಾ");
      expect(achamana?.mantraKannada).toContain("ಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ ಕರಂ ಪ್ರಕ್ಷಾಲ್ಯ");
      expect(achamana?.actionCueKn).toContain("ಬಲ ಅಂಗೈ");
    });

    it("Step 2 (Bhasma Dharana) strictly contains Pranava Parabrahma Rishi and Agniriti Bhasma", () => {
      const bhasma = SANDHYAVANDANA_STEPS.find((s) => s.id === "bhasma_dharana");
      expect(bhasma).toBeDefined();
      expect(bhasma?.mantraKannada).toContain("ಪ್ರಣವಸ್ಯ ಪರಬ್ರಹ್ಮ ಋಷಿಃ");
      expect(bhasma?.mantraKannada).toContain("ಅಗ್ನಿರಿತಿ ಭಸ್ಮ");
      expect(bhasma?.mantraKannada).toContain("ವಾಯುರಿತಿ ಭಸ್ಮ");
      expect(bhasma?.mantraKannada).toContain("ಜಲಮಿತಿ ಭಸ್ಮ");
      expect(bhasma?.mantraKannada).toContain("ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ");
      expect(bhasma?.actionCueKn).toContain("ತ್ರಿಪುಂಡ್ರ");
    });

    it("Step 8 (Arghya Pradana) contains time-specific arghya counts and instructions", () => {
      const arghya = SANDHYAVANDANA_STEPS.find((s) => s.id === "arghya_pradana");
      expect(arghya).toBeDefined();
      expect(arghya?.mantraKannada).toContain("ಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ");
      expect(arghya?.actionCueKn).toContain("ಅಂಜಲಿ");
    });

    it("Step 10 (Gayatri Japa) provides finger-joint (Karamaala) guidance", () => {
      const japa = SANDHYAVANDANA_STEPS.find((s) => s.id === "gayatri_japa");
      expect(japa).toBeDefined();
      expect(japa?.kaikaranaNotesKn).toContain("ಕರಮಾಲಾ");
      expect(japa?.mantraKannada).toContain("ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ");
    });
  });

  describe("3. Gotra Pravara Engine & Personalized Abhivadana", () => {
    it("should include 16+ authentic Vedic Gotras in the catalog", () => {
      expect(GOTRA_CATALOG.length).toBeGreaterThanOrEqual(16);
      const gotraIds = GOTRA_CATALOG.map((g) => g.id);
      expect(gotraIds).toContain("vashishta_traya");
      expect(gotraIds).toContain("vishvamitra");
      expect(gotraIds).toContain("kashyapa");
      expect(gotraIds).toContain("bharadvaja");
      expect(gotraIds).toContain("gautama");
      expect(gotraIds).toContain("jamadagni");
    });

    it("Vashishta Gotra Pravara strictly produces the exact mantra recited in user audio", () => {
      const abhivadana = buildPersonalizedAbhivadana("vashishta_traya", "ಶ್ರೀರಾಮ");
      expect(abhivadana.kn).toContain("ವಸಿಷ್ಠ");
      expect(abhivadana.kn).toContain("ಮೈತ್ರಾವರುಣ");
      expect(abhivadana.kn).toContain("ಕೌಂಡಿನ್ಯೇತಿ");
      expect(abhivadana.kn).toContain("ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ");
      expect(abhivadana.kn).toContain("ವಸಿಷ್ಠ ಗೋತ್ರೋತ್ಪನ್ನಃ");
      expect(abhivadana.kn).toContain("ಶ್ರೀರಾಮ ಶರ್ಮ");
      expect(abhivadana.kn).toContain("ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ");
    });

    it("Correctly handles custom name fallback when name is omitted or whitespace", () => {
      const abhivadana = buildPersonalizedAbhivadana("kashyapa", "");
      expect(abhivadana.kn).toContain("ಶರ್ಮ");
      expect(abhivadana.kn).toContain("ಅಹಮಸ್ಮಿ ಭೋ ಅಭಿವಾದಯೇ");
      expect(abhivadana.kn).toContain("ಕಶ್ಯಪ");
    });
  });

  describe("4. 4 Sacred Mahamantras Suite", () => {
    it("should feature all 4 sacred Mahamantras requested by user", () => {
      expect(FEATURED_MANTRA_SUITE).toHaveLength(4);
      const ids = FEATURED_MANTRA_SUITE.map((m) => m.id);
      expect(ids).toContain("gayatri");
      expect(ids).toContain("panchakshari");
      expect(ids).toContain("ashtakshari");
      expect(ids).toContain("gotra_pravara");
    });

    it("Gayatri Mahamantra contains authentic Rishi, Chhandas, and Gayatri text", () => {
      const gayatri = FEATURED_MANTRA_SUITE.find((m) => m.id === "gayatri");
      expect(gayatri).toBeDefined();
      expect(gayatri?.mantraKannada).toContain("ಓಂ ಭೂರ್ಭುವಸ್ಸುವಃ");
      expect(gayatri?.mantraKannada).toContain("ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ");
      expect(gayatri?.mantraKannada).toContain("ಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್");
    });

    it("Om Namah Shivaya Panchakshari and Om Namo Narayanaya Ashtakshari are present", () => {
      const shiva = FEATURED_MANTRA_SUITE.find((m) => m.id === "panchakshari");
      const vishnu = FEATURED_MANTRA_SUITE.find((m) => m.id === "ashtakshari");

      expect(shiva?.mantraKannada).toContain("ಓಂ ನಮಃ ಶಿವಾಯ");
      expect(vishnu?.mantraKannada).toContain("ಓಂ ನಮೋ ನಾರಾಯಣಾಯ");
    });
  });

  describe("5. 3-Month Shareable Link Generator & Database Security", () => {
    it("encodes and decodes secure URL-safe tokens with HMAC checksum", () => {
      const sessionId = "sv_test_session_123";
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      const token = encodeSecureSandhyavandanaToken(sessionId, expiresAt);

      expect(token).toMatch(/^bgn_sv_/);

      const decoded = decodeSecureSandhyavandanaToken(token);
      expect(decoded.isValid).toBe(true);
      expect(decoded.sessionId).toBe(sessionId);
      expect(decoded.isExpired).toBe(false);
      expect(decoded.expiresAt).toBe(expiresAt);
    });

    it("rejects tampered tokens with invalid signature", () => {
      const sessionId = "sv_test_session_123";
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      const token = encodeSecureSandhyavandanaToken(sessionId, expiresAt);

      // Tamper with signature
      const tampered = token.slice(0, -3) + "xyz";
      const decoded = decodeSecureSandhyavandanaToken(tampered);
      expect(decoded.isValid).toBe(false);
      expect(decoded.sessionId).toBeNull();
    });

    it("flags expired tokens when expiry date has passed 3 months", () => {
      const sessionId = "sv_old_session";
      // Past date (4 months ago)
      const pastExpiresAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const token = encodeSecureSandhyavandanaToken(sessionId, pastExpiresAt);

      const decoded = decodeSecureSandhyavandanaToken(token);
      expect(decoded.isValid).toBe(true);
      expect(decoded.isExpired).toBe(true);
    });

    it("createSandhyavandanaSession sets strict 90-day (3-month) expiration", async () => {
      const session = await createSandhyavandanaSession({
        devoteeName: "ರಾಮ ಶರ್ಮಾ",
        devoteePhone: "9972339362",
        devoteeGotraId: "vashishta_traya",
        preferredPeriod: "pratah"
      });

      expect(session).toBeDefined();
      expect(session.id).toMatch(/^bgn_sv_/);
      expect(session.devoteeName).toBe("ರಾಮ ಶರ್ಮಾ");
      expect(session.devoteeGotraId).toBe("vashishta_traya");
      expect(session.shareableUrl).toBeDefined();
      expect(session.shareableUrl).toContain("token=");

      const createdTime = new Date(session.createdAt).getTime();
      const expiryTime = new Date(session.expiresAt).getTime();
      const diffDays = Math.round((expiryTime - createdTime) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(90); // Exactly 90 days (3 months)
    });

    it("tracks and updates progress in session store", async () => {
      const session = await createSandhyavandanaSession({
        devoteeName: "ಶಿವ ಶರ್ಮಾ",
        devoteeGotraId: "vishvamitra"
      });

      const updated = await updateSandhyavandanaProgress(session.id, {
        completedSteps: 5,
        japaCountCompleted: 28
      });
      expect(updated).toBeDefined();
      expect(updated?.completedSteps).toBe(5);
      expect(updated?.japaCountCompleted).toBe(28);

      const retrieved = await getSandhyavandanaSession(session.id);
      expect(retrieved?.completedSteps).toBe(5);
      expect(retrieved?.japaCountCompleted).toBe(28);
    });
  });
});
