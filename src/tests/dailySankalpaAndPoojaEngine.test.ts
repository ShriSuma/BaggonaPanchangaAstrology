import { describe, it, expect, beforeEach } from "vitest";
import { useSankalpaStore, SANKALPA_PRESETS } from "../features/sankalpa/sankalpaStore";
import { buildDailyPoojaSteps } from "../features/seva/dailySankalpaPoojaEngine";
import { db } from "../db/indexedDb";

describe("3-5 Minute Daily Vedic Sankalpa & Deva Pooja Engine", () => {
  beforeEach(async () => {
    await db.userSankalpas.clear();
  });

  const testParams = {
    devoteeName: "ಶ್ರೀಸುಮಾ",
    gotra: "ಕಾಶ್ಯಪ",
    rashiName: "ಧನು",
    nakshatraName: "ಮೂಲ",
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    samvatsara: "ಪರಾಭವ",
    ayana: "ದಕ್ಷಿಣಾಯನ",
    ritu: "ವರ್ಷ ಋತು",
    masa: "ಶ್ರಾವಣ ಮಾಸ",
    paksha: "ಶುಕ್ಲ ಪಕ್ಷ",
    tithi: "ಏಕಾದಶೀ",
    vasara: "ಭೃಗುವಾಸರ",
    nakshatra: "ಮೂಲಾ",
    lang: "kn" as const
  };

  it("generates exactly 5 authentic Vedic Pooja steps totaling 3 to 5 minutes", () => {
    const steps = buildDailyPoojaSteps(testParams);
    expect(steps).toHaveLength(5);

    const totalSeconds = steps.reduce((acc, curr) => acc + curr.approxSeconds, 0);
    // Approx 285s = 4.75 mins (within 3 to 5 minutes)
    expect(totalSeconds).toBeGreaterThanOrEqual(180);
    expect(totalSeconds).toBeLessThanOrEqual(300);

    // Verify key step identifiers
    expect(steps[0].key).toBe("deepa_achamana");
    expect(steps[1].key).toBe("guru_ganapati");
    expect(steps[2].key).toBe("maha_sankalpa");
    expect(steps[3].key).toBe("sankalpa_samarpana");
    expect(steps[4].key).toBe("deeparadhana_namaskara");
  });

  it("dynamically embeds live Desha-Kaala, devotee details, and user sankalpas in Step 3", () => {
    const customSankalpa = {
      id: "s1",
      userId: "shreesuma",
      category: "aarogya" as const,
      title: "ಕುಟುಂಬದ ದೀರ್ಘಾಯುಷ್ಯ",
      description: "ಆರೋಗ್ಯ ಮತ್ತು ರಕ್ಷಣೆ",
      sanskritPhrasing: "ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಸಿದ್ಧ್ಯರ್ಥಂ",
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const steps = buildDailyPoojaSteps({
      ...testParams,
      activeSankalpas: [customSankalpa]
    });

    const sankalpaStep = steps.find((s) => s.step === 3);
    expect(sankalpaStep).toBeDefined();

    // Verify Desha-Kaala in Sanskrit Mantra
    expect(sankalpaStep?.sanskritMantra).toContain("ಪರಾಭವ");
    expect(sankalpaStep?.sanskritMantra).toContain("ಶ್ರಾವಣ ಮಾಸ");
    expect(sankalpaStep?.sanskritMantra).toContain("ಶುಕ್ಲ ಪಕ್ಷ");
    expect(sankalpaStep?.sanskritMantra).toContain("ಏಕಾದಶೀ");
    expect(sankalpaStep?.sanskritMantra).toContain("ಭೃಗುವಾಸರ");

    // Verify Devotee Janma Credentials
    expect(sankalpaStep?.sanskritMantra).toContain("ಶ್ರೀಸುಮಾ");
    expect(sankalpaStep?.sanskritMantra).toContain("ಕಾಶ್ಯಪ");
    expect(sankalpaStep?.sanskritMantra).toContain("ಧನು");
    expect(sankalpaStep?.sanskritMantra).toContain("ಮೂಲ");

    // Verify User's Personal Sankalpa Injection
    expect(sankalpaStep?.sanskritMantra).toContain("ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಸಿದ್ಧ್ಯರ್ಥಂ");
    expect(sankalpaStep?.narrationText.kn).toContain("ಕುಟುಂಬದ ದೀರ್ಘಾಯುಷ್ಯ");
  });

  it("supports all 5 language translations across all steps", () => {
    const steps = buildDailyPoojaSteps(testParams);
    const languages = ["kn", "hi", "te", "ta", "en"] as const;

    steps.forEach((step) => {
      languages.forEach((lang) => {
        expect(step.narrationText[lang]).toBeTruthy();
        expect(step.actionGuide[lang]).toBeTruthy();
        expect(step.spiritualSignificance[lang]).toBeTruthy();
      });
    });
  });
});

describe("Personal Devotee Sankalpa Management & CRUD Engine", () => {
  beforeEach(async () => {
    await db.userSankalpas.clear();
  });

  it("seeds 3 authentic Vedic default Sankalpas for a new user", async () => {
    const store = useSankalpaStore.getState();
    const records = await store.loadSankalpas("devotee_shreesuma", "ಶ್ರೀಸುಮಾ");
    expect(records.length).toBeGreaterThanOrEqual(3);
    expect(records[0].category).toBe("aarogya");
    expect(records[0].isActive).toBe(true);
  });

  it("performs complete CRUD (Create, Read, Update, Toggle, Delete) for user Sankalpas", async () => {
    const store = useSankalpaStore.getState();
    const userId = "devotee_test_crud";

    // 1. Create
    const created = await store.createSankalpa(userId, {
      category: "vidya",
      title: "ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸ & ಏಕಾಗ್ರತೆ",
      description: "ಪರೀಕ್ಷೆಯಲ್ಲಿ ಉತ್ತಮ ಯಶಸ್ಸು",
      sanskritPhrasing: "ಸದ್ವಿದ್ಯಾ ಬುದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
      isActive: true,
      devoteeName: "ಶ್ರೀಸುಮಾ"
    });
    expect(created.id).toBeDefined();
    expect(created.title).toBe("ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸ & ಏಕಾಗ್ರತೆ");

    // 2. Read
    const list = await store.loadSankalpas(userId);
    expect(list.some((s) => s.id === created.id)).toBe(true);

    // 3. Update
    const updated = await store.updateSankalpa(created.id, {
      title: "ಮಕ್ಕಳ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ & ವಿಜ್ಞಾನ ಸಾಧನೆ"
    });
    expect(updated).toBe(true);
    const current = useSankalpaStore.getState().sankalpas.find((s) => s.id === created.id);
    expect(current?.title).toBe("ಮಕ್ಕಳ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ & ವಿಜ್ಞಾನ ಸಾಧನೆ");

    // 4. Toggle Active
    await store.toggleSankalpaActive(created.id);
    expect(useSankalpaStore.getState().sankalpas.find((s) => s.id === created.id)?.isActive).toBe(false);

    await store.toggleSankalpaActive(created.id);
    expect(useSankalpaStore.getState().sankalpas.find((s) => s.id === created.id)?.isActive).toBe(true);

    // 5. Delete
    await store.deleteSankalpa(created.id);
    expect(useSankalpaStore.getState().sankalpas.some((s) => s.id === created.id)).toBe(false);
  });

  it("provides comprehensive presets across 8 Vedic categories", () => {
    expect(SANKALPA_PRESETS.length).toBe(8);
    const categories = SANKALPA_PRESETS.map((p) => p.category);
    expect(categories).toContain("aarogya");
    expect(categories).toContain("shanti");
    expect(categories).toContain("vidya");
    expect(categories).toContain("udyoga");
    expect(categories).toContain("santana");
    expect(categories).toContain("vivaha");
    expect(categories).toContain("dhana");
    expect(categories).toContain("custom");
  });
});
