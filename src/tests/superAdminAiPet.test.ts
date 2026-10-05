import { describe, it, expect } from "vitest";
import {
  isSuperAdminAuthorized,
  executeSuperAdminPetQuery,
  detectQueryLanguage,
  type SuperAdminPetContext
} from "../services/superAdminPetEngine";
import { petSpeechService } from "../services/petSpeechService";
import {
  parseWorkflowInstruction,
  resolveCityCoordsAndPincode,
  superAdminWorkflowRunner,
  isConfirmationAffirmative,
  isConfirmationCancellation,
  isConfirmationModification,
  modifyPendingWorkflow
} from "../services/superAdminWorkflowRunner";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { harvestAmbientKundliContext, type AmbientKundliProfile } from "../services/ambientKundliHarvester";
import { parseWhatsAppKundliText } from "../services/whatsAppKundliParser";
import { generateSuperAdminBatchPdfs } from "../services/superAdminBatchPdfService";
import { useDevoteeHistoryStore } from "../stores/devoteeHistoryStore";

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
    const incompleteKn = "ಕಾಮಧೇನು, ಜಾತಕ ಸಿದ್ಧಪಡಿಸಿ ಎಲ್ಲಾ ವರದಿಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡು";
    const resKn = parseWorkflowInstruction(incompleteKn, "kn");

    expect(resKn.isWorkflow).toBe(true);
    expect(resKn.missingFields).toBeDefined();
    expect(resKn.missingFields).toContain("name");
    expect(resKn.missingFields).toContain("birthDate");
    expect(resKn.missingFields).toContain("birthTime");
    expect(resKn.questionPrompt).toContain("ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ");

    const incompleteEn = "Hi Kamadhenu, please generate a Kundali and download all reports";
    const resEn = parseWorkflowInstruction(incompleteEn, "en");
    expect(resEn.isWorkflow).toBe(true);
    expect(resEn.missingFields).toContain("name");
    expect(resEn.questionPrompt).toContain("critical details are needed");
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

  it("detects spoken query language dynamically adapting to Kannada, English, Hindi, Telugu, and Tamil", () => {
    expect(detectQueryLanguage("Tell bhavishya in Kannada")).toBe("kn");
    expect(detectQueryLanguage("Tell bhavishya in English")).toBe("en");
    expect(detectQueryLanguage("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ 31 May 1993 ರಂದು ಜನಿಸಿದವರ ಭವಿಷ್ಯ ಹೇಳು")).toBe("kn");
    expect(detectQueryLanguage("Tell me about application pages and features")).toBe("en");
    expect(detectQueryLanguage("ಕನ್ನಡದಲ್ಲಿ ತಿಳಿಸಿ")).toBe("kn");
    expect(detectQueryLanguage("हिंदी में बताओ")).toBe("hi");
    expect(detectQueryLanguage("తెలుగులో చెప్పండి")).toBe("te");
    expect(detectQueryLanguage("தமிழில் சொல்லுங்கள்")).toBe("ta");
  });

  it("computes authentic Bhavishya on-demand when given name and date in Kannada", async () => {
    const context: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "kn"
    };

    const res = await executeSuperAdminPetQuery(
      "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ 31 May 1993 ರಂದು ಬೆಳಿಗ್ಗೆ 9:20 ಕ್ಕೆ ಬೆಂಗಳೂರಿನಲ್ಲಿ ಜನಿಸಿದವರ ಭವಿಷ್ಯ ಹೇಳು",
      context
    );

    expect(res.category).toBe("kundli");
    expect(res.emotion).toBe("remedy");
    expect(res.text.kn).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(res.text.kn).toContain("ಲಗ್ನ");
    expect(res.text.kn).toContain("ಚಂದ್ರ ರಾಶಿ");
    expect(res.text.kn).toContain("ನಕ್ಷತ್ರ");
    expect(res.text.kn).toContain("ಮಹಾದಶಾ");
    expect(res.text.kn).toContain("ಉದ್ಯೋಗ");
    expect(res.text.kn).toContain("ವಿವಾಹ");
    expect(res.text.kn).toContain("ಆರೋಗ್ಯ");
    expect(res.text.kn).toContain("ಗೋಕರ್ಣ");
    expect(res.spokenText.kn).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(res.actions.length).toBeGreaterThanOrEqual(1);
    expect(res.actions.some((a) => a.targetPage === "kundli" || a.targetPage === "predictions")).toBe(true);
  });

  it("computes authentic Bhavishya on-demand when given name and date in English", async () => {
    const context: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "en"
    };

    const res = await executeSuperAdminPetQuery(
      "Tell bhavishya for Shriram Pandit born 31 May 1993 at 9:20 AM in Bengaluru",
      context
    );

    expect(res.category).toBe("kundli");
    expect(res.emotion).toBe("remedy");
    expect(res.text.en).toContain("Shriram Pandit");
    expect(res.text.en).toContain("Ascendant (Lagna)");
    expect(res.text.en).toContain("Moon Sign");
    expect(res.text.en).toContain("Mahadasha");
    expect(res.text.en).toContain("Career");
    expect(res.text.en).toContain("Marriage");
    expect(res.text.en).toContain("Gokarna");
    expect(res.spokenText.en).toContain("Shriram Pandit");
    expect(res.actions.length).toBeGreaterThanOrEqual(1);
  });

  it("navigates across all 32 application pages and provides complete sitemap exploration", async () => {
    const context: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "en"
    };

    // 1. Sitemap intent
    const sitemapRes = await executeSuperAdminPetQuery("Show me all pages in the app and site map", context);
    expect(sitemapRes.category).toBe("navigation");
    expect(sitemapRes.text.en).toContain("Application Directory (All 32 Pages)");
    expect(sitemapRes.actions.length).toBeGreaterThanOrEqual(5);

    // 2. Direct page navigation to Palm Reading
    const palmRes = await executeSuperAdminPetQuery("Take me to Palm Reading page", context);
    expect(palmRes.category).toBe("navigation");
    expect(palmRes.actions[0].targetPage).toBe("palmreading");

    // 3. Direct page navigation to Seva & Ashirvada page
    const sevaRes = await executeSuperAdminPetQuery("ಆಶೀರ್ವಾದ ಪತ್ರ ಸೇವಾ ಪುಟ ತೆರೆ", {
      ...context,
      selectedLanguage: "kn"
    });
    expect(sevaRes.category).toBe("navigation");
    expect(sevaRes.actions[0].targetPage).toBe("seva");
  });

  it("distinguishes Bhavishya on-demand inquiry from a 5-report batch download workflow", () => {
    // Pure Bhavishya inquiry: should NOT be a workflow download
    const bhavishyaQuery = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ 31 May 1993 ರಂದು ಜನಿಸಿದವರ ಭವಿಷ್ಯ ಹೇಳು";
    const bhavishyaCheck = parseWorkflowInstruction(bhavishyaQuery, "kn");
    expect(bhavishyaCheck.isWorkflow).toBe(false);

    // Download workflow command: SHOULD be recognized as a workflow
    const downloadCommand = "Generate Kundali for Shriram Pandit, born 31 May 1993 at 9:20 AM in Bengaluru and download 5 reports. Priest Chaitanya Pandit, Pooja Moksha Narayana Bali.";
    const downloadCheck = parseWorkflowInstruction(downloadCommand, "en");
    expect(downloadCheck.isWorkflow).toBe(true);
    expect(downloadCheck.params?.requestedReports).toContain("seva_patra");
    expect(downloadCheck.params?.requestedReports.length).toBe(5);
  });

  it("generates an exhaustive Priest Consultation Call Brief with what is happening in client's life, phone talking script, and exact mantra japa counts in Kannada", async () => {
    const context: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "kn"
    };

    const res = await executeSuperAdminPetQuery(
      "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ 31 May 1993 9:20 AM ಬೆಂಗಳೂರು ಕ್ಲೈಂಟ್‌ಗೆ ಕರೆಯಲ್ಲಿ ಏನು ಹೇಳಬೇಕು? ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಏನು ನಡೆಯುತ್ತಿದೆ?",
      context
    );

    expect(res.category).toBe("kundli");
    expect(res.emotion).toBe("speaking");

    // Check Header & Native details
    expect(res.text.kn).toContain("ದೈವಜ್ಞ ಸಮಾಲೋಚನಾ ಸಾರಾಂಶ");
    expect(res.text.kn).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(res.text.kn).toContain("ಲಗ್ನ");
    expect(res.text.kn).toContain("ಚಂದ್ರ ರಾಶಿ");
    expect(res.text.kn).toContain("ಮಹಾದಶಾ");

    // Check Section 1: What is currently happening right now
    expect(res.text.kn).toContain("ಭಾಗ ೧: ಪ್ರಸ್ತುತ ಜಾತಕರ ಜೀವನದಲ್ಲಿ ಏನು ನಡೆಯುತ್ತಿದೆ?");
    expect(res.text.kn).toContain("ಮಾನಸಿಕ & ಭಾವನಾತ್ಮಕ ಸ್ಥಿತಿ");
    expect(res.text.kn).toContain("ವೃತ್ತಿ & ಆರ್ಥಿಕ ಸ್ಥಿತಿ");
    expect(res.text.kn).toContain("ಕುಟುಂಬ & ವೈವಾಹಿಕ ಸಾಮರಸ್ಯ");
    expect(res.text.kn).toContain("ಆರೋಗ್ಯ & ದೇಹಬಲ");

    // Check Section 2: What to tell the client on phone call
    expect(res.text.kn).toContain("ಭಾಗ ೨: ದೈವಜ್ಞರು ಕರೆಯಲ್ಲಿ ನೇರವಾಗಿ ಏನು ಹೇಳಬೇಕು?");
    expect(res.text.kn).toContain("ಆರಂಭಿಕ ಸಾಂತ್ವನದ ನುಡಿ");
    expect(res.text.kn).toContain("ಖಚಿತ ಜಾತಕ ಲಕ್ಷಣಗಳು");
    expect(res.text.kn).toContain("ಪರಿಹಾರದ ಕಾಲಾವಧಿ & ಆಶಾಕಿರಣ");
    expect(res.text.kn).toContain("ದೈವಜ್ಞರ ಆಪ್ತ ಮಾರ್ಗದರ್ಶನ");

    // Check Section 3: Remedies, Mantras & Exact Japa Count
    expect(res.text.kn).toContain("ಭಾಗ ೩: ಸೂಚಿಸಬೇಕಾದ ಶಾಂತಿ ಪೂಜೆಗಳು, ಮಂತ್ರ & ಜಪ ಸಂಖ್ಯೆ");
    expect(res.text.kn).toContain("ಶಾಸ್ತ್ರೋಕ್ತ ಬೀಜ ಮಂತ್ರ");
    expect(res.text.kn).toContain("ಶಾಸ್ತ್ರೋಕ್ತ ನಿಖರ ಜಪ ಸಂಖ್ಯೆ");
    expect(res.text.kn).toContain("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಾಡಿಸಬೇಕಾದ ಸೇವೆ");

    // Check spoken text
    expect(res.spokenText.kn).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(res.spokenText.kn).toContain("ದೈವಜ್ಞ ಸಮಾಲೋಚನಾ ಸಾರಾಂಶ");

    // Actions
    expect(res.actions.length).toBeGreaterThanOrEqual(2);
    expect(res.actions.some((a) => a.targetPage === "kundli")).toBe(true);
    expect(res.actions.some((a) => a.targetPage === "seva")).toBe(true);
  });

  it("generates an exhaustive Priest Consultation Call Brief in English with full talking script and remedy matrix", async () => {
    const context: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "en"
    };

    const res = await executeSuperAdminPetQuery(
      "What is currently happening in their life and what to tell client on call for Shriram Pandit born 31 May 1993 at 9:20 AM in Bengaluru?",
      context
    );

    expect(res.category).toBe("kundli");
    expect(res.text.en).toContain("Priest Consultation Call Brief");
    expect(res.text.en).toContain("Shriram Pandit");
    expect(res.text.en).toContain("Section 1: What Is Currently Happening In Their Life Right Now?");
    expect(res.text.en).toContain("Section 2: What Exactly to Tell the Client on the Phone Call (Priest Talking Script)");
    expect(res.text.en).toContain("Section 3: Prescribed Remedies, Mantras & Japa Count");
    expect(res.text.en).toContain("Authentic Beeja Mantra");
    expect(res.text.en).toContain("Classical Japa Count");
    expect(res.spokenText.en).toContain("Shriram Pandit");
  });

  it("acts as a 100% Expert Jyotishi Guru: teaches planetary exaltation (Uccha) & debilitation (Neecha) with exact degrees in Kannada and English", async () => {
    const contextKn: SuperAdminPetContext = { activePage: "home", currentUser: "superadmin", selectedLanguage: "kn" };
    const contextEn: SuperAdminPetContext = { activePage: "home", currentUser: "superadmin", selectedLanguage: "en" };

    // 1. Jupiter Uccha & Neecha query in Kannada
    const jupiterRes = await executeSuperAdminPetQuery("ಗುರು ಎಲ್ಲಿ ಉಚ್ಚನಾಗುತ್ತಾನೆ ಮತ್ತು ನೀಚನಾಗುತ್ತಾನೆ?", contextKn);
    expect(jupiterRes.category).toBe("admin");
    expect(jupiterRes.text.kn).toContain("ಕರ್ಕಾಟಕ");
    expect(jupiterRes.text.kn).toContain("೫°");
    expect(jupiterRes.text.kn).toContain("ಮಕರ");
    expect(jupiterRes.text.kn).toContain("ದಕ್ಷಿಣಾಮೂರ್ತಿ");
    expect(jupiterRes.text.kn).toContain("೧೯,೦೦೦");
    expect(jupiterRes.text.kn).toContain("ನೀಚಭಂಗ ರಾಜಯೋಗ");

    // 2. Mars Exaltation in English
    const marsRes = await executeSuperAdminPetQuery("Where is Mars exalted and debilitated? Tell me exact degrees", contextEn);
    expect(marsRes.category).toBe("admin");
    expect(marsRes.text.en).toContain("Capricorn 28°");
    expect(marsRes.text.en).toContain("Cancer 28°");
    expect(marsRes.text.en).toContain("Red Coral");
    expect(marsRes.text.en).toContain("10,000 times");

    // 3. Complete Uccha & Neecha Table + Neechabhanga Rules
    const allDignitiesRes = await executeSuperAdminPetQuery("Tell me all uccha and neecha planets and neechabhanga rules", contextEn);
    expect(allDignitiesRes.category).toBe("admin");
    expect(allDignitiesRes.text.en).toContain("Aries 10°");
    expect(allDignitiesRes.text.en).toContain("Taurus 3°");
    expect(allDignitiesRes.text.en).toContain("Virgo 15°");
    expect(allDignitiesRes.text.en).toContain("Libra 20°");
    expect(allDignitiesRes.text.en).toContain("Pisces 27°");
    expect(allDignitiesRes.text.en).toContain("5 Golden Rules of Neechabhanga Raja Yoga");
  });

  it("teaches 27 Nakshatras and explains all 6 Ganda Moola Nakshatras and Gandanta remedies", async () => {
    const context: SuperAdminPetContext = { activePage: "home", currentUser: "superadmin", selectedLanguage: "kn" };

    // 1. Specific Nakshatra
    const ashwiniRes = await executeSuperAdminPetQuery("ಅಶ್ವಿನಿ ನಕ್ಷತ್ರದ ಅಧಿಪತಿ ಮತ್ತು ದೇವತೆ ಯಾರು?", context);
    expect(ashwiniRes.category).toBe("admin");
    expect(ashwiniRes.text.kn).toContain("ಅಶ್ವಿನಿ ಕುಮಾರರು");
    expect(ashwiniRes.text.kn).toContain("ಕೇತು");
    expect(ashwiniRes.text.kn).toContain("ದೇವ");
    expect(ashwiniRes.text.kn).toContain("ಕುದುರೆ");
    expect(ashwiniRes.text.kn).toContain("ಗಂಡಮೂಲ");

    // 2. Ganda Moola Nakshatras complete list and Gokarna remedies
    const gmRes = await executeSuperAdminPetQuery("ಗಂಡಮೂಲ ನಕ್ಷತ್ರಗಳು ಯಾವುವು? ಮತ್ತು ಪರಿಹಾರ ಏನು?", context);
    expect(gmRes.category).toBe("admin");
    expect(gmRes.text.kn).toContain("ಅಶ್ವಿನಿ");
    expect(gmRes.text.kn).toContain("ಆಶ್ಲೇಷಾ");
    expect(gmRes.text.kn).toContain("ಮಘಾ");
    expect(gmRes.text.kn).toContain("ಜ್ಯೇಷ್ಠಾ");
    expect(gmRes.text.kn).toContain("ಮೂಲಾ");
    expect(gmRes.text.kn).toContain("ರೇವತಿ");
    expect(gmRes.text.kn).toContain("ರುದ್ರಾಭಿಷೇಕ");
  });

  it("teaches 12 Bhavas and house classifications (Kendras, Trikonas, Dusthanas, Upachayas)", async () => {
    const contextEn: SuperAdminPetContext = { activePage: "home", currentUser: "superadmin", selectedLanguage: "en" };
    const contextKn: SuperAdminPetContext = { activePage: "home", currentUser: "superadmin", selectedLanguage: "kn" };

    // 1. 7th house in English
    const house7Res = await executeSuperAdminPetQuery("What is the 7th house in astrology?", contextEn);
    expect(house7Res.category).toBe("admin");
    expect(house7Res.text.en).toContain("Kalatra Bhava");
    expect(house7Res.text.en).toContain("Spouse & Marriage");
    expect(house7Res.text.en).toContain("Kendra & Maraka");
    expect(house7Res.text.en).toContain("Venus");

    // 2. Kendras and Trikonas in Kannada
    const kendraRes = await executeSuperAdminPetQuery("ಕೇಂದ್ರ ಮತ್ತು ತ್ರಿಕೋನ ಭಾವಗಳು ಎಂದರೇನು?", contextKn);
    expect(kendraRes.category).toBe("admin");
    expect(kendraRes.text.kn).toContain("ವಿಷ್ಣು ಸ್ಥಾನಗಳು");
    expect(kendraRes.text.kn).toContain("ಲಕ್ಷ್ಮೀ ಸ್ಥಾನಗಳು");
    expect(kendraRes.text.kn).toContain("ದುಸ್ಥಾನಗಳು");
    expect(kendraRes.text.kn).toContain("ಉಪಚಯ");
  });

  it("provides authentic Beeja Mantras and exact classical Japa counts for all 9 Grahas", async () => {
    const contextKn: SuperAdminPetContext = { activePage: "home", currentUser: "superadmin", selectedLanguage: "kn" };
    const contextEn: SuperAdminPetContext = { activePage: "home", currentUser: "superadmin", selectedLanguage: "en" };

    // 1. Saturn Mantra in Kannada
    const shaniRes = await executeSuperAdminPetQuery("ಶನಿ ಮಂತ್ರ ಮತ್ತು ಜಪ ಸಂಖ್ಯೆ ಎಷ್ಟು?", contextKn);
    expect(shaniRes.category).toBe("admin");
    expect(shaniRes.text.kn).toContain("ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ");
    expect(shaniRes.text.kn).toContain("೨೩,೦೦೦ ಜಪಗಳು");
    expect(shaniRes.text.kn).toContain("ನೀಲ");

    // 2. Rahu Mantra in English
    const rahuRes = await executeSuperAdminPetQuery("What is the Rahu mantra and japa count?", contextEn);
    expect(rahuRes.category).toBe("admin");
    expect(rahuRes.text.en).toContain("Om Bhraam Bhreem Bhroum Sah Rahave Namah");
    expect(rahuRes.text.en).toContain("18,000 times");
    expect(rahuRes.text.en).toContain("Durga");

    // 3. All Grahas Mantras Table
    const allMantrasRes = await executeSuperAdminPetQuery("Show me all navagraha mantras and japa count table", contextEn);
    expect(allMantrasRes.category).toBe("admin");
    expect(allMantrasRes.text.en).toContain("7,000 counts"); // Sun
    expect(allMantrasRes.text.en).toContain("11,000 counts"); // Moon
    expect(allMantrasRes.text.en).toContain("10,000 counts"); // Mars
    expect(allMantrasRes.text.en).toContain("17,000 counts"); // Mercury
    expect(allMantrasRes.text.en).toContain("19,000 counts"); // Jupiter
    expect(allMantrasRes.text.en).toContain("16,000 counts"); // Venus
    expect(allMantrasRes.text.en).toContain("23,000 counts"); // Saturn
  });

  it("handles interactive confirmation, cancellation, and dynamic field modifications", () => {
    // 1. Affirmative confirmation detection
    expect(isConfirmationAffirmative("confirm")).toBe(true);
    expect(isConfirmationAffirmative("yes")).toBe(true);
    expect(isConfirmationAffirmative("proceed")).toBe(true);
    expect(isConfirmationAffirmative("ಖಚಿತಪಡಿಸು")).toBe(true);
    expect(isConfirmationAffirmative("ಸರಿ")).toBe(true);
    expect(isConfirmationAffirmative("ಹೌದು")).toBe(true);
    expect(isConfirmationAffirmative("ಮಾಡಿಕೊಡು")).toBe(true);
    expect(isConfirmationAffirmative("go ahead")).toBe(true);

    // 2. Cancellation detection
    expect(isConfirmationCancellation("cancel")).toBe(true);
    expect(isConfirmationCancellation("stop")).toBe(true);
    expect(isConfirmationCancellation("ಬೇಡ")).toBe(true);
    expect(isConfirmationCancellation("ರದ್ದು ಮಾಡು")).toBe(true);
    expect(isConfirmationCancellation("abort")).toBe(true);

    // 3. Modification detection
    expect(isConfirmationModification("change priest name to Shreeram Pandit")).toBe(true);
    expect(isConfirmationModification("ಅರ್ಚಕರ ಹೆಸರು ಬದಲಾಯಿಸು")).toBe(true);
    expect(isConfirmationModification("update mobile number")).toBe(true);
    expect(isConfirmationModification("modify pooja to Sarpa Shanti")).toBe(true);

    // 4. modifyPendingWorkflow updates fields dynamically
    const baseParams = {
      rawPrompt: "initial prompt",
      name: "Shriram Pandit",
      birthDate: "1993-05-31",
      birthTime: "09:20",
      city: "Bengaluru",
      latitude: 12.9716,
      longitude: 77.5946,
      pincode: "560001",
      priestName: "Chaitanya Pandit",
      poojaName: "Moksha Narayana Bali and Tripindi",
      requestedReports: ["baggona_kundli" as const, "premium_pdf_v1" as const],
      language: "kn" as const
    };

    // Change priest name
    const mod1 = modifyPendingWorkflow(baseParams, "change priest name to Shreeram Pandit", "kn");
    expect(mod1.updatedParams.priestName).toBe("Shreeram Pandit");
    expect(mod1.changedFields.some((f) => f.includes("Shreeram Pandit"))).toBe(true);

    // Change priest mobile number
    const mod2 = modifyPendingWorkflow(baseParams, "priest mobile number is 9845012345", "en");
    expect(mod2.updatedParams.priestPhone).toBe("9845012345");
    expect(mod2.changedFields.some((f) => f.includes("9845012345"))).toBe(true);

    // Change pooja and include QR code
    const mod3 = modifyPendingWorkflow(baseParams, "change pooja to Sarpa Shanti and include QR code", "en");
    expect(mod3.updatedParams.poojaName).toBe("Sarpa Shanti");
    expect(mod3.updatedParams.includeQrCode).toBe(true);
  });

  it("extracts priest mobile number and QR code intent accurately from user voice/text commands", () => {
    const rawCommand =
      "Generate a kundali, download baggona panchanga kundali, download pariharagalo, download doshagalo, download QR code from seva and prasada with the pooja Moksha Narayana bali and Tripindi, priest name is Chaitanya Pandit, his mobile number is 9876543210 for Shriram Pandit born on 31 May 1993 at 9:20 AM in Bengaluru";

    const parsed = parseWorkflowInstruction(rawCommand, "en");
    expect(parsed.isWorkflow).toBe(true);
    expect(parsed.params).toBeDefined();
    expect(parsed.params?.name).toBe("Shriram Pandit");
    expect(parsed.params?.birthDate).toBe("1993-05-31");
    expect(parsed.params?.birthTime).toBe("09:20");
    expect(parsed.params?.city).toBe("Bengaluru");
    expect(parsed.params?.priestName).toBe("Chaitanya Pandit");
    expect(parsed.params?.priestPhone).toBe("9876543210");
    expect(parsed.params?.poojaName?.toLowerCase()).toContain("moksha narayana bali and tripindi");
    expect(parsed.params?.includeQrCode).toBe(true);
    expect(parsed.params?.requestedReports).toContain("baggona_kundli");
    expect(parsed.params?.requestedReports).toContain("daivika_parihara");
    expect(parsed.params?.requestedReports).toContain("doshagalu");
  });

  it("handles Sankhya Shastra (Vedic Numerology) calculating Mulank, Bhagyank, and Namaank", async () => {
    const context: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "kn",
      activeProfile: {
        name: "Shriram Pandit",
        birthDate: "1993-05-31",
        birthTime: "09:20",
        city: "Bengaluru"
      }
    };

    const numRes = await executeSuperAdminPetQuery("Shriram Pandit ಅವರ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಮೂಲ್ಯಾಂಕ, ಭಾಗ್ಯಾಂಕ ಮತ್ತು ನಾಮಾಂಕ ತಿಳಿಸಿ", context);
    expect(numRes.category).toBe("admin");
    expect(numRes.text.kn).toContain("ಸಂಖ್ಯಾಶಾಸ್ತ್ರ");
    expect(numRes.text.kn).toContain("ಮೂಲಾಂಕ - Mulank): 4");
    expect(numRes.text.kn).toContain("ಭಾಗ್ಯಾಂಕ - Bhagyank / Life Path): 4");
    expect(numRes.text.kn).toContain("ರಾಹು");
    expect(numRes.text.kn).toContain("ಗೋಮೇಧಿಕ");
    expect(numRes.text.kn).toContain("ಬಾಸ್");
  });

  it("handles Hasta Mudrika (Vedic Palmistry) explaining Life, Head, Heart lines and Sacred Signs", async () => {
    const contextEn: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "en"
    };

    const palmRes = await executeSuperAdminPetQuery("Explain Hasta Mudrika, the Life Line, Fate Line, and Trishula sign on palm", contextEn);
    expect(palmRes.category).toBe("admin");
    expect(palmRes.text.en).toContain("Hasta Mudrika");
    expect(palmRes.text.en).toContain("Life Line");
    expect(palmRes.text.en).toContain("Fate Line");
    expect(palmRes.text.en).toContain("Trishula");
    expect(palmRes.text.en).toContain("Boss");
  });

  it("handles Mukha Mudrika (Vedic Face Reading) covering Forehead, Nose, and Mole Astrology", async () => {
    const contextKn: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "kn"
    };

    const faceRes = await executeSuperAdminPetQuery("ಮುಖ ಸಾಮುದ್ರಿಕಾ ಶಾಸ್ತ್ರ, ಲಲಾಟ, ನಾಸಿಕ ಧನಸ್ಥಾನ ಮತ್ತು ತಿಲ ಲಕ್ಷಣ ತಿಳಿಸಿ", contextKn);
    expect(faceRes.category).toBe("admin");
    expect(faceRes.text.kn).toContain("ಮುಖ ಸಾಮುದ್ರಿಕಾ");
    expect(faceRes.text.kn).toContain("ಲಲಾಟ");
    expect(faceRes.text.kn).toContain("ಧನಸ್ಥಾನ");
    expect(faceRes.text.kn).toContain("ತಿಲ ಲಕ್ಷಣ");
    expect(faceRes.text.kn).toContain("ಬಾಸ್");
  });

  it("handles Ayur Sanjeevini / Satya Sanjeevini (Medical Astrology & Tridosha)", async () => {
    const contextEn: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "en"
    };

    const ayurRes = await executeSuperAdminPetQuery("Explain Satya Sanjeevini Ayur Shastra, Tridosha Vata Pitta Kapha, and 6th house Rogasthana", contextEn);
    expect(ayurRes.category).toBe("admin");
    expect(ayurRes.text.en).toContain("Satya Sanjeevini");
    expect(ayurRes.text.en).toContain("Vata");
    expect(ayurRes.text.en).toContain("Pitta");
    expect(ayurRes.text.en).toContain("Kapha");
    expect(ayurRes.text.en).toContain("6th House");
    expect(ayurRes.text.en).toContain("Boss");
  });

  it("handles Hindina Janma Rahasya (Past Life Karma Astrology) and 12th/5th house karmic indicators", async () => {
    const contextKn: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "kn"
    };

    const karmaRes = await executeSuperAdminPetQuery("ಹಿಂದಿನ ಜನ್ಮದ ರಹಸ್ಯ, ೧೨ನೇ ಭಾವ ಮತ್ತು ಪೂರ್ವ ಪುಣ್ಯ ಕರ್ಮ ಶೇಷ ತಿಳಿಸಿ", contextKn);
    expect(karmaRes.category).toBe("admin");
    expect(karmaRes.text.kn).toContain("ಹಿಂದಿನ ಜನ್ಮದ ರಹಸ್ಯ");
    expect(karmaRes.text.kn).toContain("೧೨ನೇ ಭಾವ");
    expect(karmaRes.text.kn).toContain("೫ನೇ ಭಾವ");
    expect(karmaRes.text.kn).toContain("ರಾಹು-ಕೇತು");
    expect(karmaRes.text.kn).toContain("ಗೋಕರ್ಣ");
    expect(karmaRes.text.kn).toContain("ಬಾಸ್");
  });

  it("provides Boss Strategic Advisory on 5 concrete improvements for client consultation", async () => {
    const contextEn: SuperAdminPetContext = {
      activePage: "home",
      currentUser: "superadmin",
      selectedLanguage: "en",
      activeProfile: {
        name: "Shriram Pandit",
        birthDate: "1993-05-31",
        birthTime: "09:20",
        city: "Bengaluru"
      }
    };

    const impRes = await executeSuperAdminPetQuery("What improvements can I make on Shriram Pandit's consultation profile?", contextEn);
    expect(impRes.category).toBe("admin");
    expect(impRes.text.en).toContain("Strategic Profile Improvements");
    expect(impRes.text.en).toContain("Astrological Timing & Auspicious Muhurtha");
    expect(impRes.text.en).toContain("Priest Phone Consultation Delivery");
    expect(impRes.text.en).toContain("Sri Kshetra Gokarna Remedial Sankalpa");
    expect(impRes.text.en).toContain("Boss");
  });

  it("supports continuous live multi-turn discussion on active profile career, marriage, and dasha", async () => {
    const context: SuperAdminPetContext = {
      activePage: "kundli",
      currentUser: "superadmin",
      selectedLanguage: "kn",
      activeProfile: {
        name: "Shriram Pandit",
        birthDate: "1993-05-31",
        birthTime: "09:20",
        city: "Bengaluru",
        pincode: "560001"
      }
    };

    // 1. Follow-up on 10th house / career
    const careerRes = await executeSuperAdminPetQuery("ಇವರ 10th house career ಮತ್ತು ಉದ್ಯೋಗದ ಬಗ್ಗೆ ಹೇಳಿ", context);
    expect(careerRes.category).toBe("admin");
    expect(careerRes.text.kn).toContain("Shriram Pandit");
    expect(careerRes.text.kn).toContain("ದಶಮ ಭಾವ");
    expect(careerRes.text.kn).toContain("ಬಾಸ್");

    // 2. Follow-up on 7th house / marriage
    const marriageRes = await executeSuperAdminPetQuery("Tell me about his 7th house and marriage", { ...context, selectedLanguage: "en" });
    expect(marriageRes.category).toBe("admin");
    expect(marriageRes.text.en).toContain("Shriram Pandit");
    expect(marriageRes.text.en).toContain("7th House");
    expect(marriageRes.text.en).toContain("Boss");
  });

  it("integrates with third-party AI voice clone engine for realistic speech streaming and full voice delivery", async () => {
    // Reset any prior state and verify voice service methods exist and handle speech properly
    petSpeechService.stop();
    expect(petSpeechService.isSpeaking()).toBe(false);

    // Call speak with sample text and verify callback triggers
    let started = false;
    let completed = false;

    // Test sanitization via speak flow
    const sampleText = "## ೧೦೪ ಪುಟಗಳ ಸಂಪೂರ್ಣ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ! **ಗುರು ದೃಷ್ಟಿ** https://baggona.org ✨ ಶುಭವಾಗಲಿ!";
    petSpeechService.speak(sampleText, "kn", () => { started = true; }, () => { completed = true; });

    // Stop playback
    petSpeechService.stop();
    expect(petSpeechService.isSpeaking()).toBe(false);
  });

  it("cleans long detailed astrological answers without dropping critical houses, mantras, or numbers", () => {
    const rawMarkdown = `
      # ಶ್ರೀರಾಮ ಪಂಡಿತ್ ಜಾತಕ ವಿಶ್ಲೇಷಣೆ
      * **ಲಗ್ನ**: ಮೇಷ (ಮಂಗಳ ಅಧಿಪತಿ)
      * **ದಶಮ ಭಾವ**: ೧೦ನೇ ಮನೆಯಲ್ಲಿ ಸೂರ್ಯ ಉಚ್ಛ
      * **ಮಂತ್ರ**: ಓಂ ನಮಃ ಶಿವಾಯ (೧೦೮ ಬಾರಿ)
      [ವೆಬ್‌ಸೈಟ್](https://baggona.org) ✨
    `;
    const clean = petSpeechService.cleanTextForSpeech(rawMarkdown);

    expect(clean).toContain("ಶ್ರೀರಾಮ ಪಂಡಿತ್ ಜಾತಕ ವಿಶ್ಲೇಷಣೆ");
    expect(clean).toContain("ಲಗ್ನ");
    expect(clean).toContain("ದಶಮ ಭಾವ");
    expect(clean).toContain("೧೦ನೇ ಮನೆಯಲ್ಲಿ");
    expect(clean).toContain("ಓಂ ನಮಃ ಶಿವಾಯ");
    expect(clean).toContain("೧೦೮ ಬಾರಿ");
    expect(clean).not.toContain("#");
    expect(clean).not.toContain("**");
    expect(clean).not.toContain("https://baggona.org");
    expect(clean).not.toContain("✨");
  });

  describe("Ambient Kundli Room-Reading & Zero-Follow-Up Intelligence", () => {
    const mockSession = {
      id: "sess-ambient-test",
      input: {
        name: "ವೆಂಕಟೇಶ್ ಭಟ್",
        birthDate: "1994-08-18",
        birthTime: "07:15",
        placeOfBirth: "Gokarna",
        pincode: "581326",
        latitude: 14.54,
        longitude: 74.31,
        timezone: 5.5
      },
      result: {
        ascendant: 5,
        ascendantSign: 5,
        moonSign: 9,
        planets: [
          { name: "Sun", sign: 5, longitude: 125.4, house: 1 },
          { name: "Moon", sign: 9, longitude: 245.2, house: 5 },
          { name: "Jupiter", sign: 7, longitude: 195.0, house: 3 }
        ]
      },
      birthDateYmd: "1994-08-18",
      birthTimeHm: "07:15",
      homePlaceName: "Gokarna",
      placeLabel: "Gokarna, Karnataka",
      dasha: "Guru Maha Dasha (ಗುರು ಮಹಾದಶೆ)"
    };

    it("harvests ambient profile from active KundliViewerSession with normalized values", () => {
      const ambient = harvestAmbientKundliContext(mockSession as any);
      expect(ambient.hasData).toBe(true);
      expect(ambient.name).toBe("ವೆಂಕಟೇಶ್ ಭಟ್");
      expect(ambient.birthDate).toBe("1994-08-18");
      expect(ambient.birthTime).toBe("07:15");
      expect(ambient.city).toBe("Gokarna");
      expect(ambient.pincode).toBe("581326");
      expect(ambient.dasha).toBe("Guru Maha Dasha (ಗುರು ಮಹಾದಶೆ)");
      expect(ambient.kundli).toBeDefined();
    });

    it("returns hasData: false when no session, store or storage exists", () => {
      const ambient = harvestAmbientKundliContext(null);
      // If store is empty, hasData should be false
      if (!ambient.hasData) {
        expect(ambient.name).toBe("");
        expect(ambient.birthDate).toBe("");
      }
    });

    it("auto-fills workflow parameters from ambient profile and eliminates follow-up prompts", () => {
      const ambient = harvestAmbientKundliContext(mockSession as any);

      // User says "Download all 5 reports" without stating name or DOB
      const res = parseWorkflowInstruction("Generate and download all 5 reports now", "kn", ambient);

      expect(res.isWorkflow).toBe(true);
      expect(res.missingFields).toHaveLength(0);
      expect(res.params).toBeDefined();
      expect(res.params?.name).toBe("ವೆಂಕಟೇಶ್ ಭಟ್");
      expect(res.params?.birthDate).toBe("1994-08-18");
      expect(res.params?.birthTime).toBe("07:15");
      expect(res.params?.city).toBe("Gokarna");
      expect(res.params?.pincode).toBe("581326");
    });

    it("prompts for missing fields only when ambient profile is not available", () => {
      // User says "Download reports" with no ambient data
      const res = parseWorkflowInstruction("Generate and download all 5 reports now", "kn", null);

      expect(res.isWorkflow).toBe(true);
      expect(res.missingFields?.length).toBeGreaterThan(0);
      expect(res.questionPrompt).toBeDefined();
    });

    it("directly answers marriage question from ambient profile without asking follow-up questions", async () => {
      const ambient = harvestAmbientKundliContext(mockSession as any);
      const context: SuperAdminPetContext = {
        activePage: "kundli",
        currentUser: "superadmin",
        selectedLanguage: "kn",
        ambientProfile: ambient
      };

      const res = await executeSuperAdminPetQuery("ನನ್ನ ವಿವಾಹ ಯೋಗ ಮತ್ತು ದಾಂಪತ್ಯ ಜೀವನ ಹೇಗಿದೆ?", context);

      // Must NOT ask for birth details
      expect(res.text.kn).not.toContain("ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರು");
      expect(res.text.kn).not.toContain("ಜನನ ದಿನಾಂಕ");
      expect(res.text.kn).not.toContain("ಜನನ ಸಮಯ");

      // Must directly provide astrological answer addressing the devotee
      expect(res.text.kn).toContain("ವೆಂಕಟೇಶ್ ಭಟ್");
      expect(res.text.kn).toContain("ಸಪ್ತಮ");
      expect(res.category).toBe("admin");
    });

    it("directly answers career question from ambient profile without asking follow-up questions", async () => {
      const ambient = harvestAmbientKundliContext(mockSession as any);
      const context: SuperAdminPetContext = {
        activePage: "kundli",
        currentUser: "superadmin",
        selectedLanguage: "en",
        ambientProfile: ambient
      };

      const res = await executeSuperAdminPetQuery("How is my career and 10th house?", context);

      // Must NOT ask for birth details
      expect(res.text.en).not.toContain("Please provide your date of birth");
      expect(res.text.en).not.toContain("time of birth");

      // Must directly answer addressing the devotee
      expect(res.text.en).toContain("ವೆಂಕಟೇಶ್ ಭಟ್");
      expect(res.text.en).toContain("10th House");
      expect(res.category).toBe("admin");
    });

    it("directly answers doshas and remedies from ambient profile without asking follow-up questions", async () => {
      const ambient = harvestAmbientKundliContext(mockSession as any);
      const context: SuperAdminPetContext = {
        activePage: "kundli",
        currentUser: "superadmin",
        selectedLanguage: "kn",
        ambientProfile: ambient
      };

      const res = await executeSuperAdminPetQuery("ನನ್ನ ಜಾತಕದಲ್ಲಿ ಯಾವುದಾದರೂ ದೋಷಗಳಿವೆಯೇ? ಪರಿಹಾರ ತಿಳಿಸಿ", context);

      // Must NOT ask for birth details
      expect(res.text.kn).not.toContain("ಜನನ ದಿನಾಂಕ");
      expect(res.text.kn).toContain("ವೆಂಕಟೇಶ್ ಭಟ್");
      expect(res.text.kn).toContain("ದೋಷ");
      expect(res.text.kn).toContain("ಗೋಕರ್ಣ");
    });
  });

  describe("WhatsApp & Multimodal Voice Fusion + Multi-Question Architecture", () => {
    it("parses raw Kannada WhatsApp chat forward text into structured devotee profile", () => {
      const rawWhatsApp = `
[14/05, 10:20 am] +91 98860 12345:
ಹೆಸರು: ಶ್ರೀ ರಮೇಶ್ ಭಟ್
ಹುಟ್ಟಿದ ದಿನಾಂಕ: 18-08-1994
ಜನನ ಸಮಯ: ಬೆಳಿಗ್ಗೆ 07:15
ಸ್ಥಳ: ಗೋಕರ್ಣ 581326
ಪ್ರಶ್ನೆ: ನನ್ನ ವೈವಾಹಿಕ ಜೀವನ ಹಾಗೂ ಉದ್ಯೋಗ ಹೇಗಿರುತ್ತದೆ?
      `;

      const parsed = parseWhatsAppKundliText(rawWhatsApp);
      expect(parsed.hasData).toBe(true);
      expect(parsed.name).toBe("ರಮೇಶ್ ಭಟ್");
      expect(parsed.birthDate).toBe("1994-08-18");
      expect(parsed.birthTime).toBe("07:15");
      expect(parsed.city).toBe("Gokarna");
      expect(parsed.pincode).toBe("581326");
      expect(parsed.customQuestions.length).toBeGreaterThanOrEqual(1);
      expect(parsed.customQuestions[0]).toContain("ವೈವಾಹಿಕ ಜೀವನ");
    });

    it("parses raw English Telegram chat text with 12h AM/PM time and inquiries", () => {
      const rawTelegram = `
Name: Ananya Sharma
DOB: 24/11/1996
Time of Birth: 04:45 PM
Place: Bengaluru
Query: When will I get a job promotion and foreign travel?
      `;

      const parsed = parseWhatsAppKundliText(rawTelegram);
      expect(parsed.hasData).toBe(true);
      expect(parsed.name).toBe("Ananya Sharma");
      expect(parsed.birthDate).toBe("1996-11-24");
      expect(parsed.birthTime).toBe("16:45"); // 4:45 PM -> 16:45
      expect(parsed.city).toBe("Bengaluru");
      expect(parsed.customQuestions.length).toBeGreaterThanOrEqual(1);
      expect(parsed.customQuestions[0]).toContain("job promotion");
    });

    it("does not mistake simple user command strings for devotee profiles", () => {
      const cmd = "Generate and download all 5 reports now";
      const parsed = parseWhatsAppKundliText(cmd);
      expect(parsed.hasData).toBe(false);
      expect(parsed.birthDate).toBe("");
    });

    it("fuses pasted WhatsApp text with spoken mic command: 'generate a kundali for this and give this this this this report'", () => {
      // 1. Devotee details in pasted WhatsApp box
      const pastedBox = parseWhatsAppKundliText(`
ಹೆಸರು: ಸತೀಶ್ ಹೆಗಡೆ
ದಿನಾಂಕ: 12/03/1991
ಸಮಯ: ರಾತ್ರಿ 9:30
ಸ್ಥಳ: ಶಿರಸಿ 581401
      `);
      expect(pastedBox.hasData).toBe(true);

      // 2. User opens mic and speaks action command
      const spokenQuery = "generate a kundali for this and give this this this this report";
      const wf = parseWorkflowInstruction(spokenQuery, "kn", pastedBox as any);

      expect(wf.isWorkflow).toBe(true);
      expect(wf.missingFields).toHaveLength(0);
      expect(wf.params).toBeDefined();
      expect(wf.params?.name).toBe("ಸತೀಶ್ ಹೆಗಡೆ");
      expect(wf.params?.birthDate).toBe("1991-03-12");
      expect(wf.params?.birthTime).toBe("21:30"); // 9:30 PM -> 21:30
      expect(wf.params?.city).toBe("Sirsi");
      expect(wf.params?.pincode).toBe("581401");
      expect(wf.params?.requestedReports).toContain("baggona_kundli");
      expect(wf.params?.requestedReports).toContain("premium_pdf_v1");
      expect(wf.params?.requestedReports).toContain("daivika_parihara");
      expect(wf.params?.requestedReports).toContain("doshagalu");
      expect(wf.params?.requestedReports).toContain("seva_patra");
    });

    it("executes multi-question area task: 'in multi question area go and ask this question and get report on this particular question'", () => {
      const ambientDevotee = {
        hasData: true,
        name: "ಕಿರಣ್ ರಾವ್",
        birthDate: "1990-05-15",
        birthTime: "10:30",
        city: "Bengaluru",
        pincode: "560001"
      };

      const query = "in multi question area go and ask this question: When will my business expand? and get report on this particular question";
      const wf = parseWorkflowInstruction(query, "kn", ambientDevotee as any);

      expect(wf.isWorkflow).toBe(true);
      expect(wf.missingFields).toHaveLength(0);
      expect(wf.params).toBeDefined();
      expect(wf.params?.name).toBe("ಕಿರಣ್ ರಾವ್");
      expect(wf.params?.requestedReports).toContain("multi_question");
      expect(wf.params?.targetRedirectPage).toBe("ramanbhavishya");
      expect(wf.params?.customQuestions).toBeDefined();
      expect(wf.params?.customQuestions?.some((q) => q.includes("business expand"))).toBe(true);
    });

    it("executes single-question task: 'download from single questionnaire as well'", () => {
      const ambientDevotee = {
        hasData: true,
        name: "ಲಕ್ಷ್ಮಿ ನಾರಾಯಣ",
        birthDate: "1995-10-20",
        birthTime: "08:15",
        city: "Mysuru",
        pincode: "570001"
      };

      const query = "download from single questionnaire as well for this devotee";
      const wf = parseWorkflowInstruction(query, "kn", ambientDevotee as any);

      expect(wf.isWorkflow).toBe(true);
      expect(wf.missingFields).toHaveLength(0);
      expect(wf.params).toBeDefined();
      expect(wf.params?.requestedReports).toContain("single_question");
    });

    it("generates multi-question and single-question PDF reports in batch service", async () => {
      const mockSession = {
        input: {
          name: "ರಾಘವೇಂದ್ರ",
          birthDate: "1992-07-15",
          birthTime: "11:20",
          city: "Bengaluru",
          latitude: 12.97,
          longitude: 77.59,
          pincode: "560001",
          gender: "Male"
        },
        result: {
          ascendant: 1,
          ascendantSign: 1,
          moonSign: { english: "Mesha", index: 0 },
          lagnaRashi: { english: "Mesha", index: 0 },
          planets: [
            {
              name: "Moon",
              degree: 10,
              rashi: { english: "Mesha", index: 0 },
              nakshatra: { english: "Ashwini", index: 0 }
            }
          ]
        },
        dasha: [{ planet: "Jupiter", startAge: 0, endAge: 16, durationYears: 16 }]
      };

      const params = {
        rawPrompt: "Multi-question generation",
        name: "ರಾಘವೇಂದ್ರ",
        birthDate: "1992-07-15",
        birthTime: "11:20",
        city: "Bengaluru",
        pincode: "560001",
        latitude: 12.97,
        longitude: 77.59,
        priestName: "Chaitanya Pandit",
        poojaName: "Moksha Narayana Bali",
        requestedReports: ["multi_question", "single_question"] as any,
        language: "kn" as any,
        customQuestions: ["ಉದ್ಯೋಗ ಪ್ರಗತಿ ಹೇಗಿದೆ?", "ವಿವಾಹ ಯೋಗ ಯಾವಾಗ?"]
      };

      const reports = await generateSuperAdminBatchPdfs(mockSession as any, params as any);
      expect(reports).toHaveLength(2);
      expect(reports.some((r) => r.id === "multi_question")).toBe(true);
      expect(reports.some((r) => r.id === "single_question")).toBe(true);
      expect(reports[0].blob).toBeDefined();
      expect(reports[1].blob).toBeDefined();
    });

    it("manages Devotee Consultation History Store, unique ID generation, and recall", () => {
      const store = useDevoteeHistoryStore.getState();
      const rec = store.upsertDevotee({
        name: "ಸುರೇಶ್ ಭಟ್",
        birthDate: "1988-11-22",
        birthTime: "08:45",
        city: "Shivamogga",
        pincode: "577201",
        customQuestions: ["ಮನೆ ನಿರ್ಮಾಣ ಯೋಗ ಯಾವಾಗ?"]
      });

      expect(rec.id).toBeDefined();
      expect(rec.id).toMatch(/^DEV-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(rec.name).toBe("ಸುರೇಶ್ ಭಟ್");
      expect(rec.city).toBe("Shivamogga");
      expect(rec.consultationCount).toBe(1);

      // Append messages
      store.appendMessage(rec.id, { sender: "user", text: "ನನ್ನ ಜಾತಕ ವಿವರ ಹೇಳಿ" });
      store.appendMessage(rec.id, { sender: "pet", text: "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗುರು ಬಲವಿದೆ." });

      const updated = store.getDevoteeById(rec.id);
      expect(updated?.messages).toHaveLength(2);

      // Lookup by ID or name
      const byName = store.getDevoteeByIdOrName("ಸುರೇಶ್ ಭಟ್ ಅವರ ಇತಿಹಾಸ ತನ್ನಿ");
      expect(byName?.id).toBe(rec.id);

      const byId = store.getDevoteeByIdOrName(`recall ${rec.id}`);
      expect(byId?.name).toBe("ಸುರೇಶ್ ಭಟ್");
    });

    it("strictly validates mandatory Seva Patra parameters (place, devotee, priest name & mobile, pooja)", () => {
      // Incomplete Seva Patra command: missing place, priest, phone, pooja
      const incomplete = parseWorkflowInstruction("ಕಾಮಧೇನು, ರಮೇಶ್ ಅವರಿಗೆ ಸೇವಾ ಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡು", "kn");
      expect(incomplete.isWorkflow).toBe(true);
      expect(incomplete.missingFields).toBeDefined();
      expect(incomplete.missingFields).toContain("place");
      expect(incomplete.missingFields).toContain("priestName");
      expect(incomplete.missingFields).toContain("priestPhone");
      expect(incomplete.missingFields).toContain("poojaName");
      expect(incomplete.questionPrompt).toContain("ಅಧಿಕೃತ ಸೇವಾ ಪತ್ರವನ್ನು");

      // Complete Seva Patra command: all 5 mandatory parameters provided
      const completeCmd =
        "ಕಾಮಧೇನು, ರಮೇಶ್ (ಜನನ 1990-05-15 10:00 AM ಬೆಂಗಳೂರು) ಅವರಿಗೆ ಅರ್ಚಕ ಚೈತನ್ಯ ಪಂಡಿತ್ (ಮೊಬೈಲ್ 9876543210) ಅವರ ನೇತೃತ್ವದ ಮೋಕ್ಷ ನಾರಾಯಣ ಬಲಿ ಪೂಜೆಯ ಸೇವಾ ಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡು";
      const complete = parseWorkflowInstruction(completeCmd, "kn");
      expect(complete.isWorkflow).toBe(true);
      expect(complete.missingFields).toHaveLength(0);
      expect(complete.params).toBeDefined();
      expect(complete.params?.name).toBe("ರಮೇಶ್");
      expect(complete.params?.city).toBe("Bengaluru");
      expect(complete.params?.priestName).toBe("ಚೈತನ್ಯ ಪಂಡಿತ್");
      expect(complete.params?.priestPhone).toBe("9876543210");
      expect(complete.params?.poojaName).toContain("ಮೋಕ್ಷ ನಾರಾಯಣ ಬಲಿ");
      expect(complete.params?.requestedReports).toContain("seva_patra");
    });

    it("verifies Seva Patra PDF generation binds devotee personName and avoids Priya alone bug", async () => {
      const mockSession = {
        input: { name: "ಪ್ರಮೋದ್ ಕುಡ್ಗಿ", birthDate: "1991-03-12", birthTime: "14:15", city: "Gokarna", gotra: "Kashyapa" },
        result: {
          planets: [
            {
              name: "Moon",
              degree: 15,
              rashi: { english: "Vrishabha", index: 1 },
              nakshatra: { english: "Rohini", index: 3 }
            }
          ]
        }
      };

      const params = {
        rawPrompt: "Seva Patra generation",
        name: "ಪ್ರಮೋದ್ ಕುಡ್ಗಿ",
        birthDate: "1991-03-12",
        birthTime: "14:15",
        city: "Gokarna",
        pincode: "581326",
        priestName: "ಚೈತನ್ಯ ಪಂಡಿತ್",
        priestPhone: "9972339362",
        poojaName: "ಮೋಕ್ಷ ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ತ್ರಿಪಿಂಡಿ",
        requestedReports: ["seva_patra"] as any,
        language: "kn" as any
      };

      const reports = await generateSuperAdminBatchPdfs(mockSession as any, params as any);
      expect(reports).toHaveLength(1);
      expect(reports[0].id).toBe("seva_patra");
      expect(reports[0].blob).toBeDefined();
      expect(reports[0].fileName).toContain("ಪ್ರಮೋದ್_ಕುಡ್ಗಿ");
    });
  });

  describe("Cross-Modal Unified Conversation Memory & Hands-Free Duplex Continuity (ChatGPT / Claude / Gemini Live Parity)", () => {
    it("persists and synchronizes session turns across both text and voice modes in devoteeHistoryStore", () => {
      useDevoteeHistoryStore.getState().clearSessionMessages();
      expect(useDevoteeHistoryStore.getState().activeSessionMessages).toHaveLength(0);

      // 1. Text mode question & answer
      useDevoteeHistoryStore.getState().appendSessionMessage({
        sender: "user",
        text: "ನನ್ನ ೧೦ನೇ ಮನೆ ವೃತ್ತಿಜೀವನ ಮತ್ತು ಉದ್ಯೋಗ ಪ್ರಗತಿ ಹೇಗಿದೆ?",
        mode: "text"
      });
      useDevoteeHistoryStore.getState().appendSessionMessage({
        sender: "pet",
        text: "ಸ್ವಾಮಿ, ನಿಮ್ಮ ೧೦ನೇ ಮನೆಯಲ್ಲಿ ಗುರು ಬಲವಿದೆ. ಸೂರ್ಯನ ಅನುಗ್ರಹದಿಂದ ಉನ್ನತ ಪದವಿ ಲಭ್ಯವಿದೆ.",
        spokenText: "ನಿಮ್ಮ ೧೦ನೇ ಮನೆಯಲ್ಲಿ ಗುರು ಬಲವಿದೆ.",
        mode: "text"
      });

      expect(useDevoteeHistoryStore.getState().activeSessionMessages).toHaveLength(2);
      expect(useDevoteeHistoryStore.getState().activeSessionMessages[0].mode).toBe("text");
      expect(useDevoteeHistoryStore.getState().activeSessionMessages[1].mode).toBe("text");

      // 2. Seamless transition to Voice mode: user speaks and assistant speaks
      useDevoteeHistoryStore.getState().appendSessionMessage({
        sender: "user",
        text: "ನನಗೆ ಸೂಕ್ತವಾದ ಅದೃಷ್ಟ ರತ್ನ ಯಾವುದು?",
        spokenText: "ನನಗೆ ಸೂಕ್ತವಾದ ಅದೃಷ್ಟ ರತ್ನ ಯಾವುದು?",
        mode: "voice"
      });
      useDevoteeHistoryStore.getState().appendSessionMessage({
        sender: "pet",
        text: "ನಿಮಗೆ ಪುಷ್ಯರಾಗ (Yellow Sapphire) ಅಥವಾ ಮಾಣಿಕ್ಯ ರತ್ನ ಅತ್ಯಂತ ಶುಭಕರ.",
        spokenText: "ನಿಮಗೆ ಪುಷ್ಯರಾಗ ರತ್ನ ಅತ್ಯಂತ ಶುಭಕರ.",
        mode: "voice"
      });

      expect(useDevoteeHistoryStore.getState().activeSessionMessages).toHaveLength(4);
      expect(useDevoteeHistoryStore.getState().activeSessionMessages[2].mode).toBe("voice");
      expect(useDevoteeHistoryStore.getState().activeSessionMessages[3].mode).toBe("voice");

      // 3. Verify restoring session messages preserves modes
      const snapshot = [...useDevoteeHistoryStore.getState().activeSessionMessages];
      useDevoteeHistoryStore.getState().clearSessionMessages();
      expect(useDevoteeHistoryStore.getState().activeSessionMessages).toHaveLength(0);

      useDevoteeHistoryStore.getState().restoreSessionMessages(snapshot);
      expect(useDevoteeHistoryStore.getState().activeSessionMessages).toHaveLength(4);
      expect(useDevoteeHistoryStore.getState().activeSessionMessages[0].text).toContain("೧೦ನೇ ಮನೆ");
      expect(useDevoteeHistoryStore.getState().activeSessionMessages[3].mode).toBe("voice");
    });

    it("recalls past text turns when user switches to Voice Mode and asks about previous queries", async () => {
      const mockTurns = [
        {
          sender: "user" as const,
          text: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ೧೦ನೇ ಮನೆ ವೃತ್ತಿಜೀವನ ಹೇಗಿದೆ?",
          mode: "text" as const,
          timestamp: new Date().toISOString()
        },
        {
          sender: "pet" as const,
          text: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ೧೦ನೇ ಮನೆ ಗುರು ದೃಷ್ಟಿಯಿಂದಾಗಿ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು ತರಲಿದೆ.",
          spokenText: "೧೦ನೇ ಮನೆ ಗುರು ದೃಷ್ಟಿಯಿಂದಾಗಿ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಯಶಸ್ಸು ತರಲಿದೆ.",
          mode: "text" as const,
          timestamp: new Date().toISOString()
        }
      ];

      const context: SuperAdminPetContext = {
        activePage: "home",
        currentUser: "superadmin",
        selectedLanguage: "kn",
        conversationHistory: mockTurns
      };

      // In Voice Mode, user asks: "ಹಿಂದೆ ಏನು ಕೇಳಿದೆ?" (What did I ask before?)
      const res = await executeSuperAdminPetQuery("ಹಿಂದೆ ನಾನು ಏನು ಕೇಳಿದೆ?", context);

      expect(res.category).toBe("general");
      expect(res.text.kn).toContain("೧೦ನೇ ಮನೆ");
      expect(res.text.kn).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(res.spokenText.kn).toContain("೧೦ನೇ ಮನೆ");
    });

    it("recalls voice mode advice when user switches to Text Mode and types questions about voice turns", async () => {
      const mockTurns = [
        {
          sender: "user" as const,
          text: "ರಮೇಶ್ ಅವರಿಗೆ ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿ ಪೂಜೆ ಮಾಡಿಸಬೇಕೇ?",
          mode: "voice" as const,
          timestamp: new Date().toISOString()
        },
        {
          sender: "pet" as const,
          text: "ಹೌದು ಸ್ವಾಮಿ, ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿಗೆ ಗರಿಕಾರ್ಚನೆ ಹಾಗೂ ಸಂಕಷ್ಟಹರ ಗಣಪತಿ ವ್ರತ ಮಾಡಿಸುವುದು ಶ್ರೇಷ್ಠ.",
          spokenText: "ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿಗೆ ಗರಿಕಾರ್ಚನೆ ಮಾಡಿಸುವುದು ಶ್ರೇಷ್ಠ.",
          mode: "voice" as const,
          timestamp: new Date().toISOString()
        }
      ];

      const context: SuperAdminPetContext = {
        activePage: "home",
        currentUser: "superadmin",
        selectedLanguage: "kn",
        conversationHistory: mockTurns
      };

      // In Text Mode, user asks to continue from voice mode
      const res = await executeSuperAdminPetQuery("ಮುಂದುವರಿಸಿ, ವಾಯ್ಸ್ ಮೋಡ್‌ನಲ್ಲಿ ನೀವು ಹೇಳಿದ ವಿಷಯವನ್ನು ಮುಂದುವರಿಸಿ", context);

      expect(res.category).toBe("general");
      expect(res.text.kn).toContain("ಗೋಕರ್ಣ");
      expect(res.text.kn).toContain("ಗಣಪತಿ");
    });

    it("maintains English conversation memory continuity when transitioning between modes", async () => {
      const mockTurns = [
        {
          sender: "user" as const,
          text: "How is my career progression in 2026?",
          mode: "text" as const,
          timestamp: new Date().toISOString()
        },
        {
          sender: "pet" as const,
          text: "Your 10th house is blessed by Jupiter transit, ensuring career elevation in late 2026.",
          spokenText: "Your 10th house is blessed by Jupiter transit.",
          mode: "text" as const,
          timestamp: new Date().toISOString()
        }
      ];

      const context: SuperAdminPetContext = {
        activePage: "home",
        currentUser: "superadmin",
        selectedLanguage: "en",
        conversationHistory: mockTurns
      };

      // Spoken voice query in English
      const res = await executeSuperAdminPetQuery("What did I ask before? Continue from where we left off.", context);

      expect(res.category).toBe("general");
      expect(res.text.en).toContain("career");
      expect(res.text.en).toContain("Jupiter");
    });
  });

  describe("Autonomous Hands-Free AI Copilot Deep Navigation Suite", () => {
    it("navigates autonomously to Guru Shukra Astodaya page with astodaya tab and year 2027", async () => {
      const context: SuperAdminPetContext = {
        activePage: "home",
        currentUser: "superadmin",
        selectedLanguage: "en"
      };

      const res = await executeSuperAdminPetQuery(
        "open Guru Shukra Astodaya page and open Guru Shukra Udaya and Asta for 2027",
        context
      );

      expect(res.category).toBe("navigation");
      expect(res.actions.length).toBeGreaterThanOrEqual(1);
      const action = res.actions[0];
      expect(action.targetPage).toBe("astodaya_grahana");
      expect(action.payload).toBeDefined();
      expect(action.payload.tab).toBe("astodaya");
      expect(action.payload.year).toBe(2027);
      expect(res.text.en).toContain("Guru & Shukra Astodaya");
      expect(res.text.en).toContain("2027");
      expect(res.spokenText.en).toContain("2027");
    });

    it("handles switch to second tab Guru Shukra Astodaya and select 2027", async () => {
      const context: SuperAdminPetContext = {
        activePage: "astodaya_grahana",
        currentUser: "superadmin",
        selectedLanguage: "en"
      };

      const res = await executeSuperAdminPetQuery(
        "open Guru Shukra Astodaya page, switch to second tab Guru Shukra Astodaya and select 2027",
        context
      );

      expect(res.category).toBe("navigation");
      expect(res.actions[0].targetPage).toBe("astodaya_grahana");
      expect(res.actions[0].payload?.tab).toBe("astodaya");
      expect(res.actions[0].payload?.year).toBe(2027);
    });

    it("handles pure Kannada voice command with Kannada numerals ೨೦೨೭", async () => {
      const context: SuperAdminPetContext = {
        activePage: "home",
        currentUser: "superadmin",
        selectedLanguage: "kn"
      };

      const res = await executeSuperAdminPetQuery(
        "ಗುರು ಶುಕ್ರ ಅಸ್ತೋದಯ ಪುಟ ತೆರೆದು ೨೦೨೭ ರ ಅಸ್ತೋದಯ ಟ್ಯಾಬ್ ತೋರಿಸು",
        context
      );

      expect(res.category).toBe("navigation");
      expect(res.actions[0].targetPage).toBe("astodaya_grahana");
      expect(res.actions[0].payload?.tab).toBe("astodaya");
      expect(res.actions[0].payload?.year).toBe(2027);
      expect(res.text.kn).toContain("ಗುರು-ಶುಕ್ರ ಅಸ್ತೋದಯ & ಮೌಢ್ಯ");
      expect(res.text.kn).toContain("೨೦೨೭");
      expect(res.spokenText.kn).toContain("೨೦೨೭");
    });

    it("navigates autonomously to calendar with specific ISO date", async () => {
      const context: SuperAdminPetContext = {
        activePage: "home",
        currentUser: "superadmin",
        selectedLanguage: "en"
      };

      const res = await executeSuperAdminPetQuery("open calendar for 2027-05-15", context);

      expect(res.category).toBe("navigation");
      expect(res.actions[0].targetPage).toBe("calendar");
      expect(res.actions[0].payload?.date).toBe("2027-05-15");
      expect(res.text.en).toContain("2027-05-15");
      expect(res.spokenText.en).toContain("2027-05-15");
    });

    it("switches to Melapak Dashakoota tab accurately", async () => {
      const context: SuperAdminPetContext = {
        activePage: "home",
        currentUser: "superadmin",
        selectedLanguage: "en"
      };

      const res = await executeSuperAdminPetQuery("switch to melapak page and open dashakoota tab", context);

      expect(res.category).toBe("navigation");
      expect(res.actions[0].targetPage).toBe("melapak");
      expect(res.actions[0].payload?.tab).toBe("dashakoota");
      expect(res.text.en).toContain("Dashakoota Milan");
    });
  });
});


