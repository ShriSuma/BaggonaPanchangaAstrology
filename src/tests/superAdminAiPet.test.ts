import { describe, it, expect } from "vitest";
import {
  isSuperAdminAuthorized,
  executeSuperAdminPetQuery,
  type SuperAdminPetContext
} from "../services/superAdminPetEngine";
import { petSpeechService } from "../services/petSpeechService";
import {
  parseWorkflowInstruction,
  resolveCityCoordsAndPincode,
  superAdminWorkflowRunner
} from "../services/superAdminWorkflowRunner";
import { useKundliViewerStore } from "../stores/kundliViewerStore";

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

  it("parses user's exact audio voice command: Shriram Pandit 31 May 1993, 9:20 AM Bengaluru 5 reports", () => {
    const exactVoiceCommand =
      "Hi Kamadhenu, there is a person Shriram Pandit, he born on 31 May 1993 at 9:20 AM in Bengaluru, so get the Bengaluru pin code, add it in, and generate a Kundali for this particular user. After generating it, download Baggona Panchanga Kundali, and also download Premium PDF V1, download Daivika Parihara, download Doshagalu, and also download Seva Patra. The priest name is Chaitanya Pandit, use that priest name, Pooja is Moksha Narayana Bali and Tripindi, and the place is Bangalore, take the Bangalore pincode, and download these reports, and once done let me know. And if you have any questions also let me know.";

    const parsed = parseWorkflowInstruction(exactVoiceCommand, "kn");

    expect(parsed.isWorkflow).toBe(true);
    expect(parsed.params).toBeDefined();

    const p = parsed.params!;
    expect(p.name).toBe("Shriram Pandit");
    expect(p.birthDate).toBe("1993-05-31");
    expect(p.birthTime).toBe("09:20");
    expect(p.city).toBe("Bengaluru");
    expect(p.pincode).toBe("560001");
    expect(p.latitude).toBeCloseTo(12.9716, 2);
    expect(p.longitude).toBeCloseTo(77.5946, 2);
    expect(p.priestName).toBe("Chaitanya Pandit");
    expect(p.poojaName).toContain("Moksha Narayana Bali");
    expect(p.requestedReports).toContain("baggona_kundli");
    expect(p.requestedReports).toContain("premium_pdf_v1");
    expect(p.requestedReports).toContain("daivika_parihara");
    expect(p.requestedReports).toContain("doshagalu");
    expect(p.requestedReports).toContain("seva_patra");
    expect(p.requestedReports.length).toBe(5);
  });

  it("resolves city coordinates and Indian pincodes accurately", () => {
    const b = resolveCityCoordsAndPincode("Bengaluru");
    expect(b.city).toBe("Bengaluru");
    expect(b.pincode).toBe("560001");
    expect(b.lat).toBeCloseTo(12.9716, 2);

    const g = resolveCityCoordsAndPincode("Gokarna");
    expect(g.city).toBe("Gokarna");
    expect(g.pincode).toBe("581326");

    const m = resolveCityCoordsAndPincode("Mumbai");
    expect(m.city).toBe("Mumbai");
    expect(m.pincode).toBe("400001");

    // With explicit pincode
    const custom = resolveCityCoordsAndPincode("Bengaluru", "560034");
    expect(custom.pincode).toBe("560034");
  });

  it("detects missing fields when incomplete command is given and requests clarification", () => {
    const incomplete = "Hi Kamadhenu, please generate a Kundali and download all reports";
    const res = parseWorkflowInstruction(incomplete, "kn");

    expect(res.isWorkflow).toBe(true);
    expect(res.missingFields).toBeDefined();
    expect(res.missingFields).toContain("name");
    expect(res.missingFields).toContain("birthDate");
    expect(res.missingFields).toContain("birthTime");
    expect(res.questionPrompt).toContain("ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ");
  });

  it("executes multi-step background workflow, sets app Kundli session, and packages reports into ZIP", async () => {
    const mockParams = {
      rawPrompt: "Test Shriram Pandit Workflow",
      name: "Shriram Pandit",
      birthDate: "1993-05-31",
      birthTime: "09:20",
      city: "Bengaluru",
      pincode: "560001",
      latitude: 12.9716,
      longitude: 77.5946,
      priestName: "Chaitanya Pandit",
      poojaName: "Moksha Narayana Bali and Tripindi",
      requestedReports: ["baggona_kundli", "daivika_parihara", "doshagalu"] as any[],
      language: "kn" as const
    };

    const finalState = await superAdminWorkflowRunner.executeWorkflow(mockParams);

    expect(finalState.status).toBe("completed");
    expect(finalState.progressPercent).toBe(100);
    expect(finalState.reports.length).toBe(3);
    expect(finalState.zipBlob).toBeDefined();
    expect(finalState.zipFileName).toContain("Shriram_Pandit");

    // Verify global app store session was set
    const currentSession = useKundliViewerStore.getState().session;
    expect(currentSession).toBeDefined();
    expect(currentSession?.input.name).toBe("Shriram Pandit");
    expect(currentSession?.birthDateYmd).toBe("1993-05-31");
    expect(currentSession?.homePlaceName).toBe("Bengaluru");
  });

  it("supports multi-instance concurrent background fleet up to 10 instances (Kamadhenu 1..10)", () => {
    // Clear any previous state
    const runnerState = superAdminWorkflowRunner.getState();
    runnerState.instances.forEach((inst) => superAdminWorkflowRunner.clearJob(inst.instanceId));

    const makeParams = (name: string, index: number) => ({
      rawPrompt: `Test Devotee ${index}`,
      name,
      birthDate: "1993-05-31",
      birthTime: "09:20",
      city: "Bengaluru",
      pincode: "560001",
      latitude: 12.9716,
      longitude: 77.5946,
      priestName: "Chaitanya Pandit",
      poojaName: "Moksha Narayana Bali",
      requestedReports: ["baggona_kundli"] as any[],
      language: "kn" as const
    });

    // Start instance 1 (Kamadhenu 1)
    const inst1 = superAdminWorkflowRunner.startInstance(makeParams("Shriram Pandit", 1));
    expect(inst1.instanceIndex).toBe(1);
    expect(inst1.instanceName).toContain("ಕಾಮಧೇನು ೧");
    expect(inst1.status).toBe("running");

    // Start instance 2 (Kamadhenu 2)
    const inst2 = superAdminWorkflowRunner.startInstance(makeParams("Ravi Kumar", 2));
    expect(inst2.instanceIndex).toBe(2);
    expect(inst2.instanceName).toContain("ಕಾಮಧೇನು ೨");
    expect(inst2.status).toBe("running");

    const state = superAdminWorkflowRunner.getState();
    expect(state.activeCount).toBeGreaterThanOrEqual(2);

    // Clean up
    superAdminWorkflowRunner.killJob(inst1.instanceId);
    superAdminWorkflowRunner.killJob(inst2.instanceId);
    superAdminWorkflowRunner.clearJob(inst1.instanceId);
    superAdminWorkflowRunner.clearJob(inst2.instanceId);
  });

  it("allows immediate termination of any stuck background job via killJob and AbortController", () => {
    const mockParams = {
      rawPrompt: "Kill test",
      name: "Devotee To Kill",
      birthDate: "1990-01-01",
      birthTime: "10:00",
      city: "Gokarna",
      pincode: "581326",
      latitude: 14.54,
      longitude: 74.31,
      priestName: "Chaitanya Pandit",
      poojaName: "Tripindi",
      requestedReports: ["baggona_kundli"] as any[],
      language: "kn" as const
    };

    const inst = superAdminWorkflowRunner.startInstance(mockParams);
    expect(inst.status).toBe("running");
    expect(inst.abortController?.signal.aborted).toBe(false);

    // Immediately kill the job
    superAdminWorkflowRunner.killJob(inst.instanceId);

    const found = superAdminWorkflowRunner.getState().instances.find((i) => i.instanceId === inst.instanceId);
    expect(found?.status).toBe("cancelled");
    expect(found?.abortController?.signal.aborted).toBe(true);
    expect(found?.stepTitle).toContain("ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ");

    // Clear the job
    superAdminWorkflowRunner.clearJob(inst.instanceId);
    const cleared = superAdminWorkflowRunner.getState().instances.find((i) => i.instanceId === inst.instanceId);
    expect(cleared).toBeUndefined();
  });

  it("formats and dismisses on-screen toast notifications cleanly", () => {
    const notifId = `test_notif_${Date.now()}`;
    const testNotif = {
      id: notifId,
      instanceId: "inst_123",
      instanceIndex: 1,
      title: "🎉 ಕಾಮಧೇನು ೧: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      message: "ಕಾಮಧೇನು ೧: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ವಿವರಗಳು ಮತ್ತು ೫ ವರದಿಗಳು ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿವೆ!",
      devoteeName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      timestamp: new Date(),
      reportsCount: 5
    };

    superAdminWorkflowRunner.getState().notifications.push(testNotif);
    expect(superAdminWorkflowRunner.getState().notifications.some((n) => n.id === notifId)).toBe(true);

    superAdminWorkflowRunner.dismissNotification(notifId);
    expect(superAdminWorkflowRunner.getState().notifications.some((n) => n.id === notifId)).toBe(false);
  });
});
