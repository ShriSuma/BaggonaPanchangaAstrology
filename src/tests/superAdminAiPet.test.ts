import { describe, it, expect } from "vitest";
import {
  isSuperAdminAuthorized,
  executeSuperAdminPetQuery,
  type SuperAdminPetContext
} from "../services/superAdminPetEngine";
import { petSpeechService } from "../services/petSpeechService";

describe("SuperAdminAiPet Intelligence & Security Suite", () => {
  it("enforces strict access control: authorized ONLY for Super Admin & Master profiles", () => {
    // Authorized profiles
    expect(isSuperAdminAuthorized("superadmin", "superadmin")).toBe(true);
    expect(isSuperAdminAuthorized("admin", "ShriSuma")).toBe(true);
    expect(isSuperAdminAuthorized("admin", "$hriSuma")).toBe(true);
    expect(isSuperAdminAuthorized("priest", "baggona")).toBe(true);
    expect(isSuperAdminAuthorized(undefined, "superadmin")).toBe(true);

    // Unauthorized profiles (regular priests, devotees, guests)
    expect(isSuperAdminAuthorized("priest", "priest_gokarna_1")).toBe(false);
    expect(isSuperAdminAuthorized("devotee", "devotee_ravi")).toBe(false);
    expect(isSuperAdminAuthorized("admin", "regular_admin")).toBe(false);
    expect(isSuperAdminAuthorized(undefined, null)).toBe(false);
    expect(isSuperAdminAuthorized(undefined, undefined)).toBe(false);
  });

  it("provides comprehensive revenue & monetization blueprints when asked how to earn money", async () => {
    const context: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "kn"
    };

    const res = await executeSuperAdminPetQuery("ಹಣ ಗಳಿಸುವುದು ಹೇಗೆ? (How to earn money)", context);

    expect(res.category).toBe("revenue");
    expect(res.emotion).toBe("excited");
    expect(res.text.kn).toContain("ಆದಾಯ");
    expect(res.text.kn).toContain("೧೦೪ ಪುಟಗಳ ಪಂಚಾಂಗ");
    expect(res.text.kn).toContain("ಗೋಕರ್ಣ");
    expect(res.text.en).toContain("Revenue Blueprints");
    expect(res.spokenText.kn.length).toBeGreaterThan(10);
    expect(res.actions.length).toBeGreaterThanOrEqual(1);
    expect(res.actions.some((a) => a.targetPage === "seva" || a.targetPage === "superadmindashboard")).toBe(true);
  });

  it("provides viral marketing and application growth playbook when asked how to market", async () => {
    const context: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "en"
    };

    const res = await executeSuperAdminPetQuery("How to market my application and get traffic?", context);

    expect(res.category).toBe("marketing");
    expect(res.emotion).toBe("excited");
    expect(res.text.en).toContain("Marketing Playbook");
    expect(res.text.en).toContain("WhatsApp 90-Day Rhythm Calendar");
    expect(res.text.en).toContain("QR Code");
    expect(res.actions.some((a) => a.targetPage === "calendar")).toBe(true);
  });

  it("handles Kundli & Dosha deep scanning and provides Gokarna remedies", async () => {
    // 1. With an active Kundli session
    const mockSession = {
      input: {
        name: "ರಮೇಶ್ ಶರ್ಮಾ",
        dateOfBirth: "1992-05-14",
        timeOfBirth: "06:30",
        placeOfBirth: "Gokarna",
        latitude: 14.54,
        longitude: 74.31,
        timezone: 5.5
      },
      result: {
        ascendant: 1,
        ascendantSign: 1,
        moonSign: 6,
        planets: []
      }
    };

    const contextWithSession: SuperAdminPetContext = {
      activePage: "kundli",
      currentKundliSession: mockSession,
      currentUser: "superadmin",
      selectedLanguage: "kn"
    };

    const resWithSession = await executeSuperAdminPetQuery("ದೋಷ ಪರಿಶೀಲನೆ ಮಾಡು (Check doshas)", contextWithSession);

    expect(resWithSession.category).toBe("kundli");
    expect(resWithSession.emotion).toBe("remedy");
    expect(resWithSession.text.kn).toContain("ರಮೇಶ್ ಶರ್ಮಾ");
    expect(resWithSession.text.kn).toContain("ಗೋಕರ್ಣ");
    expect(resWithSession.actions.some((a) => a.targetPage === "doshas")).toBe(true);

    // 2. Without active session
    const contextNoSession: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "en"
    };

    const resNoSession = await executeSuperAdminPetQuery("Analyze Janma Kundali Doshas", contextNoSession);
    expect(resNoSession.category).toBe("kundli");
    expect(resNoSession.text.en).toContain("Manglik");
    expect(resNoSession.text.en).toContain("Kala Sarpa");
  });

  it("executes autonomous navigation actions on behalf of Super Admin", async () => {
    const context: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "kn"
    };

    // Navigate to Calendar
    const calRes = await executeSuperAdminPetQuery("ಕ್ಯಾಲೆಂಡರ್ ಪುಟಕ್ಕೆ ಹೋಗು (Go to calendar)", context);
    expect(calRes.category).toBe("navigation");
    expect(calRes.actions[0].targetPage).toBe("calendar");

    // Navigate to Seva
    const sevaRes = await executeSuperAdminPetQuery("open seva page", context);
    expect(sevaRes.category).toBe("navigation");
    expect(sevaRes.actions[0].targetPage).toBe("seva");

    // Navigate to Doshas
    const doshaRes = await executeSuperAdminPetQuery("open doshas analysis", context);
    expect(doshaRes.category).toBe("navigation");
    expect(doshaRes.actions[0].targetPage).toBe("doshas");

    // Navigate to Super Admin Dashboard
    const adminRes = await executeSuperAdminPetQuery("take me to superadmin", context);
    expect(adminRes.category).toBe("navigation");
    expect(adminRes.actions[0].targetPage).toBe("superadmindashboard");
  });

  it("runs full system health diagnostics across Panchanga, Astodaya, and Eclipses", async () => {
    const context: SuperAdminPetContext = {
      activePage: "superadmindashboard",
      currentUser: "superadmin",
      selectedLanguage: "kn"
    };

    const diag = await executeSuperAdminPetQuery("ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮಾಡು (Check health)", context);

    expect(diag.category).toBe("diagnostics");
    expect(diag.text.kn).toContain("ಆರೋಗ್ಯ ವರದಿ");
    expect(diag.text.kn).toContain("Panchanga Engine");
    expect(diag.text.kn).toContain("Astodaya");
    expect(diag.text.kn).toContain("Eclipses");
  });

  it("speech service cleans text for smooth TTS audio playback", () => {
    const raw = "👑 **ಪ್ರೀಮಿಯಂ ೧೦೪ ಪುಟಗಳ ಪಂಚಾಂಗ** & https://example.com #1 *ವಿಶೇಷ* ✨";
    const clean = petSpeechService.cleanTextForSpeech(raw);

    expect(clean).not.toContain("https://");
    expect(clean).not.toContain("**");
    expect(clean).not.toContain("✨");
    expect(clean).toContain("ಪ್ರೀಮಿಯಂ ೧೦೪ ಪುಟಗಳ ಪಂಚಾಂಗ");
  });
});
