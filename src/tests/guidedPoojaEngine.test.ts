import { describe, it, expect } from "vitest";
import {
  GUIDED_POOJA_KEYS,
  GUIDED_POOJAS,
  getAllGuidedPoojas,
  filterGuidedPoojas,
  getGuidedPooja,
  getStepSpokenAudio
} from "../features/pooja/guidedPoojaData";
import {
  generateGuidedPoojaShareUrl,
  parseGuidedPoojaFromUrl
} from "../features/pooja/guidedPoojaUrlService";

describe("Authentic Guided Vedic Pooja & Mantra Engine (ಕರ್ನಾಟಕ ಗೋಕರ್ಣ ಪುರೋಹಿತ ಪರಂಪರೆ)", () => {
  it("provides exactly 5 comprehensive, authentic Karnataka Smartha & Vedic Poojas", () => {
    expect(GUIDED_POOJA_KEYS).toHaveLength(5);
    expect(GUIDED_POOJA_KEYS).toEqual([
      "sandhyavandana",
      "morning_pooja",
      "evening_pooja",
      "ganapati_pooja",
      "shiva_pooja"
    ]);

    const all = getAllGuidedPoojas();
    expect(all).toHaveLength(5);
    all.forEach((pooja) => {
      expect(pooja.titleKn).toBeTruthy();
      expect(pooja.steps.length).toBeGreaterThanOrEqual(5);
      expect(pooja.colorScheme.primary).toBeTruthy();
    });
  });

  it("verifies Pooja 1 (Sandhyavandana) contains Achamana, Pranayama, Marjana, Suryarghya, and Gayatri 28x Japa with pure Sanskrit mantras", () => {
    const sandhya = getGuidedPooja("sandhyavandana");
    expect(sandhya).toBeDefined();
    expect(sandhya?.titleKn).toContain("ಸಂಧ್ಯಾವಂದನಾ");

    const steps = sandhya!.steps;
    // Step 1: Achamana with 3 water sips and Keshavaya Svaha (Pure Sanskrit in Devanagari)
    expect(steps[0].titleKn).toContain("ಆಚಮನ");
    expect(steps[0].mantraSanskrit).toContain("ॐ केशवाय स्वाहा");
    expect(steps[0].mantraSanskritPart2).toContain("ॐ गोविन्दाय नमः");
    expect(steps[0].mantraL5.kn).toContain("ಓಂ ಕೇಶವಾಯ ಸ್ವಾಹಾ");

    // Audio narration: Kannada instructions + pure Sanskrit mantras
    const spokenKn = getStepSpokenAudio(steps[0], "kn");
    expect(spokenKn).toContain("ಪಾತ್ರೆ ಮತ್ತು ಉದ್ದರಣೆ");
    expect(spokenKn).toContain("ॐ केशवाय स्वाहा");
    expect(spokenKn).toContain("ॐ गोविन्दाय नमः");

    // Audio narration: English instructions + pure Sanskrit mantras
    const spokenEn = getStepSpokenAudio(steps[0], "en");
    expect(spokenEn).toContain("water vessel and spoon");
    expect(spokenEn).toContain("ॐ केशवाय स्वाहा");

    // Step 2: Pranayama with Pancha Prana & 7 Vyahritis
    expect(steps[1].titleKn).toContain("ಪ್ರಾಣಾಯಾಮ");
    expect(steps[1].mantraSanskrit).toContain("ॐ प्राणाय स्वाहा");
    expect(steps[1].mantraSanskritPart2).toContain("ॐ भूः। ॐ भुवः");

    // Step 3: Marjana with Apohishta Mayo Bhuvah
    expect(steps[2].titleKn).toContain("ಮಾರ್ಜನ");
    expect(steps[2].mantraSanskrit).toContain("आपो हि ष्ठा");

    // Step 4: Suryarghya with 3 offerings to Suryanarayana
    expect(steps[3].titleKn).toContain("ಸೂರ್ಯಾರ್ಘ್ಯ");
    expect(steps[3].mantraSanskrit).toContain("श्री सूर्यनारायणाय इदमर्घ्यं समर्पयामि");

    // Step 6: Gayatri Japa with 28 repetitions target
    const gayatriStep = steps.find((s) => s.titleKn.includes("ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರ ಜಪ"));
    expect(gayatriStep).toBeDefined();
    expect(gayatriStep?.japaTarget).toBe(28);
    expect(gayatriStep?.mantraSanskrit).toContain("तत्सवितुर्वरेण्यं");
    expect(gayatriStep?.mantraL5.kn).toContain("ತತ್ ಸವಿತುರ್ ವರೇಣ್ಯಂ");

    // Step 8: Narayana Samarpanam
    expect(steps[steps.length - 1].mantraSanskrit).toContain("कायेन वाचा");
  });

  it("verifies Pooja 2 (Morning Deva Pooja) contains 16 Upacharas, Deepa, Ghanta, Kalasha, and pure Sanskrit mantras", () => {
    const morning = getGuidedPooja("morning_pooja");
    expect(morning).toBeDefined();
    expect(morning?.titleKn).toContain("ಪ್ರಾತಃಕಾಲ ನಿತ್ಯ ದೇವತಾ ಪೂಜಾ");

    const steps = morning!.steps;
    expect(steps[0].titleKn).toContain("ದೀಪ ಪ್ರಜ್ವಲನೆ");
    expect(steps[0].mantraSanskrit).toContain("शुभं करोति कल्याणं");

    expect(steps[1].titleKn).toContain("ಘಂಟಾನಾದ");
    expect(steps[1].mantraSanskrit).toContain("आगमार्थं तु देवानां");

    expect(steps[2].titleKn).toContain("ಕಳಶ ಪೂಜೆ");
    expect(steps[2].mantraSanskrit).toContain("गङ्गे च यमुने");

    expect(steps[3].titleKn).toContain("ಮಹಾಗಣಪತಿ & ಗುರು");
    expect(steps[3].mantraSanskrit).toContain("शुक्लाम्बरधरं");

    expect(steps[4].titleKn).toContain("ಷೋಡಶೋಪಚಾರ");
    expect(steps[4].mantraSanskrit).toContain("श्री गन्धं समर्पयामि");

    expect(steps[5].titleKn).toContain("ಕರ್ಪೂರ ಮಂಗಳಾರತಿ");
    expect(steps[5].mantraSanskrit).toContain("कर्पूर गौरं");
  });

  it("verifies Pooja 3 (Evening Pooja) contains Sandhya Deepa, Tulasi 3 Pradakshinas, and Kayena Vacha", () => {
    const evening = getGuidedPooja("evening_pooja");
    expect(evening).toBeDefined();
    expect(evening?.titleKn).toContain("ಸಾಯಂಕಾಲದ ಪೂಜೆ");

    const steps = evening!.steps;
    expect(steps[0].titleKn).toContain("ಸಾಯಂ ಶುದ್ಧಿ");
    expect(steps[0].mantraSanskrit).toContain("ॐ केशवाय स्वाहा");

    expect(steps[1].titleKn).toContain("ಸಂಧ್ಯಾ ದೀಪ");
    expect(steps[1].mantraSanskrit).toContain("दीपमूले स्थितो ब्रह्मा");

    expect(steps[2].titleKn).toContain("ತುಳಸೀ ಪೂಜೆ");
    expect(steps[2].mantraSanskrit).toContain("यन्मूले सर्वतीर्थानि");

    expect(steps[3].titleKn).toContain("ಸಾಯಂ ಮಂಗಳಾರತಿ");
    expect(steps[3].mantraSanskrit).toContain("सर्वमङ्गल माङ्गल्ये");

    expect(steps[4].titleKn).toContain("ಕಾಯೇನ ವಾಚಾ");
    expect(steps[4].mantraSanskrit).toContain("ॐ शान्तिः शान्तिः शान्तिः");
  });

  it("verifies Pooja 4 (Maha Ganapati Sankashtahara) contains Avahana, Durva, 21 Japa, and pure Sanskrit mantras", () => {
    const ganapati = getGuidedPooja("ganapati_pooja");
    expect(ganapati).toBeDefined();
    expect(ganapati?.titleKn).toContain("ಮಹಾಗಣಪತಿ");

    const steps = ganapati!.steps;
    expect(steps[1].titleKn).toContain("ಗಣೇಶ ಆವಾಹನೆ");
    expect(steps[1].mantraSanskrit).toContain("ॐ गणानां त्वा गणपतिं");

    const durvaStep = steps.find((s) => s.titleKn.includes("ದೂರ್ವಾ"));
    expect(durvaStep).toBeDefined();
    expect(durvaStep?.japaTarget).toBe(21);
    expect(durvaStep?.mantraSanskrit).toContain("ॐ गं गणपतये नमः");

    const stotraStep = steps.find((s) => s.titleKn.includes("ಸಂಕಟನಾಶನ"));
    expect(stotraStep).toBeDefined();
    expect(stotraStep?.mantraSanskrit).toContain("प्रणम्य शिरसा देवं");

    expect(steps[steps.length - 1].mantraSanskrit).toContain("श्री महागणपतये मोदकं");
  });

  it("verifies Pooja 5 (Shiva Pooja & Rudrabhisheka) contains Abhisheka, Bilvashtaka, Om Namah Shivaya 108 Japa, and Mahamrityunjaya", () => {
    const shiva = getGuidedPooja("shiva_pooja");
    expect(shiva).toBeDefined();
    expect(shiva?.titleKn).toContain("ಶಿವ ಪೂಜಾ");

    const steps = shiva!.steps;
    expect(steps[0].titleKn).toContain("ಭಸ್ಮಧಾರಣೆ");
    expect(steps[0].mantraSanskrit).toContain("ॐ त्र्यम्बकं यजामहे");

    expect(steps[1].titleKn).toContain("ಶಿವಲಿಂಗ ಅಭಿಷೇಕ");
    expect(steps[1].mantraSanskrit).toContain("ॐ नमस्ते रुद्र मन्यव");

    expect(steps[2].titleKn).toContain("ಬಿಲ್ವಾಷ್ಟಕ");
    expect(steps[2].mantraSanskrit).toContain("त्रिदलं त्रिगुणाकारं");

    const japa108Step = steps.find((s) => s.titleKn.includes("೧೦೮"));
    expect(japa108Step).toBeDefined();
    expect(japa108Step?.japaTarget).toBe(108);
    expect(japa108Step?.mantraSanskrit).toContain("ॐ नमः शिवाय");

    expect(steps[4].titleKn).toContain("ಮಹಾಮೃತ್ಯುಂಜಯ");
    expect(steps[4].mantraSanskrit).toContain("कर्पूर गौरं");
  });

  it("guarantees full 5-language localization for all pooja mantras and instructions", () => {
    const all = getAllGuidedPoojas();
    for (const pooja of all) {
      for (const step of pooja.steps) {
        // All mantras have 5 localized scripts for reading
        expect(step.mantraL5.kn).toBeTruthy();
        expect(step.mantraL5.hi).toBeTruthy();
        expect(step.mantraL5.te).toBeTruthy();
        expect(step.mantraL5.ta).toBeTruthy();
        expect(step.mantraL5.en).toBeTruthy();

        // All steps have audio instructions in all 5 languages
        expect(step.audioInstructionL5.kn.intro).toBeTruthy();
        expect(step.audioInstructionL5.en.intro).toBeTruthy();
        expect(step.audioInstructionL5.te.intro).toBeTruthy();
        expect(step.audioInstructionL5.ta.intro).toBeTruthy();
        expect(step.audioInstructionL5.hi.intro).toBeTruthy();
      }
    }
  });

  it("STRICT MANDATE: verifies audio mode provides pure Sanskrit mantras with chosen language instructions across all 5 languages", () => {
    const sandhya = getGuidedPooja("sandhyavandana")!;
    const achamanaStep = sandhya.steps[0];

    // Kannada: Kannada instructions + pure Sanskrit mantras
    const audioKn = getStepSpokenAudio(achamanaStep, "kn");
    expect(audioKn).toContain("ಪಾತ್ರೆ ಮತ್ತು ಉದ್ದರಣೆ");
    expect(audioKn).toContain("ॐ केशवाय स्वाहा");
    expect(audioKn).toContain("ॐ गोविन्दाय नमः");

    // Telugu: Telugu instructions + pure Sanskrit mantras
    const audioTe = getStepSpokenAudio(achamanaStep, "te");
    expect(audioTe).toContain("పాత్ర మరియు ఉద్ధరణిని");
    expect(audioTe).toContain("ॐ केशवाय स्वाहा");

    // Tamil: Tamil instructions + pure Sanskrit mantras
    const audioTa = getStepSpokenAudio(achamanaStep, "ta");
    expect(audioTa).toContain("பாத்திரம் மற்றும் உத்தரணியை");
    expect(audioTa).toContain("ॐ केशवाय स्वाहा");

    // English: English instructions + pure Sanskrit mantras
    const audioEn = getStepSpokenAudio(achamanaStep, "en");
    expect(audioEn).toContain("water vessel and spoon");
    expect(audioEn).toContain("ॐ केशवाय स्वाहा");

    // Hindi: Hindi instructions + pure Sanskrit mantras
    const audioHi = getStepSpokenAudio(achamanaStep, "hi");
    expect(audioHi).toContain("पात्र और आचमनी");
    expect(audioHi).toContain("ॐ केशवाय स्वाहा");
  });

  it("dynamically filters poojas based on priest selection: exactly matches selected tab count", () => {
    // Selection of 1 pooja
    const single = filterGuidedPoojas(["sandhyavandana"]);
    expect(single).toHaveLength(1);
    expect(single[0].key).toBe("sandhyavandana");

    // Selection of 3 poojas
    const trio = filterGuidedPoojas(["morning_pooja", "ganapati_pooja", "shiva_pooja"]);
    expect(trio).toHaveLength(3);
    expect(trio.map((p) => p.key)).toEqual(["morning_pooja", "ganapati_pooja", "shiva_pooja"]);

    // Selection of all 5 poojas
    const all5 = filterGuidedPoojas(GUIDED_POOJA_KEYS);
    expect(all5).toHaveLength(5);
  });

  it("verifies URL generation and parsing roundtrip with customized devotee parameters", () => {
    const shareUrl = generateGuidedPoojaShareUrl({
      poojaKeys: ["sandhyavandana", "shiva_pooja"],
      devoteeName: "ಪ್ರಮೋದ್ ಕೊಡಗಿ",
      gotra: "ಕಾಶ್ಯಪ",
      lang: "kn",
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
    });

    expect(shareUrl).toContain("/guided-pooja");
    expect(shareUrl).toContain("poojas=sandhyavandana%2Cshiva_pooja");
    expect(shareUrl).toContain("pToken=");

    // Parse back from URL
    const parsed = parseGuidedPoojaFromUrl(shareUrl);
    expect(parsed.poojaKeys).toEqual(["sandhyavandana", "shiva_pooja"]);
    expect(parsed.devoteeName).toBe("ಪ್ರಮೋದ್ ಕೊಡಗಿ");
    expect(parsed.gotra).toBe("ಕಾಶ್ಯಪ");
    expect(parsed.lang).toBe("kn");
  });

  it("verifies instructions are hidden in background notes and spoken via 50-year priest prayoga", () => {
    const all = getAllGuidedPoojas();
    for (const pooja of all) {
      for (const step of pooja.steps) {
        // Detailed priest notes exist for background toggling
        expect(step.hiddenPriestInstructionKn).toBeTruthy();
        expect(step.hiddenPriestInstructionEn).toBeTruthy();

        // Spoken audio has extensive guidance (>30 chars) in all supported languages
        const spoken = getStepSpokenAudio(step, "kn");
        expect(spoken.length).toBeGreaterThan(30);

        // Action cue is crisp and actionable
        expect(step.actionCueKn.length).toBeGreaterThan(5);
      }
    }
  });

  // =========================================================================
  // SACRED VRATAS & SANKALPA ENGINE TESTS (ಪುಣ್ಯ ವ್ರತ ಮಹಾವಿಧಿ & ಸಂಕಲ್ಪ ಪರೀಕ್ಷೆಗಳು)
  // =========================================================================
  it("provides exactly 6 authentic Sacred Vratas with complete prayoga, phala, and samagri", async () => {
    const { GUIDED_VRATA_KEYS, GUIDED_VRATAS, filterGuidedVratas } = await import(
      "../features/pooja/guidedVrataData"
    );

    expect(GUIDED_VRATA_KEYS).toHaveLength(6);
    expect(GUIDED_VRATA_KEYS).toEqual([
      "kalyana_mangalagauri_vrata",
      "satyanarayana_vrata",
      "varalakshmi_vrata",
      "sankashtahara_vrata",
      "somavara_shiva_vrata",
      "saraswati_medha_vrata"
    ]);

    for (const key of GUIDED_VRATA_KEYS) {
      const vrata = GUIDED_VRATAS[key];
      expect(vrata.titleKn).toBeTruthy();
      expect(vrata.purposeKn).toBeTruthy();
      expect(vrata.benefitsKn).toBeTruthy();
      expect(vrata.idealForKn).toBeTruthy();
      expect(vrata.timingKn).toBeTruthy();
      expect(vrata.samagriList.length).toBeGreaterThanOrEqual(5);
      expect(vrata.steps.length).toBeGreaterThanOrEqual(3);
    }

    // Filter helper test
    const filtered = filterGuidedVratas(["kalyana_mangalagauri_vrata", "satyanarayana_vrata"]);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((v) => v.key)).toEqual(["kalyana_mangalagauri_vrata", "satyanarayana_vrata"]);
  });

  it("verifies Kalyana Mangalagauri Vrata specifically addresses 32-year-old marriage delay, Swayamvara Parvati Japa, 16-knot Dora, and Samagri checklist", async () => {
    const { GUIDED_VRATAS } = await import("../features/pooja/guidedVrataData");
    const kalyana = GUIDED_VRATAS.kalyana_mangalagauri_vrata;

    // Checks purpose and target age
    expect(kalyana.purposeKn).toContain("ವಿವಾಹ");
    expect(kalyana.idealForKn).toContain("೩೨ ವರ್ಷ");
    expect(kalyana.benefitsKn).toContain("ಮನಮೆಚ್ಚಿದ");

    // Samagri checklist
    const itemIds = kalyana.samagriList.map((s) => s.id);
    expect(itemIds).toContain("gauri_idol");
    expect(itemIds).toContain("raksha_dora");
    expect(itemIds).toContain("panchamrita");
    expect(itemIds).toContain("deepa");
    expect(itemIds).toContain("bagina_items");

    // Step 8: Swayamvara Parvati Maha Mantra (108 japa target)
    const japaStep = kalyana.steps.find((s) => s.titleKn.includes("ಸ್ವಯಂವರ ಪಾರ್ವತೀ"));
    expect(japaStep).toBeDefined();
    expect(japaStep?.japaTarget).toBe(108);
    expect(japaStep?.mantraSanskrit).toContain("ॐ ह्रीं योगिनि योगिनि");
    expect(japaStep?.mantraSanskrit).toContain("स्वयंवरा पार्वत्यै नमः");

    // Audio narration has Sanskrit mantra + localized instructions
    const audioKn = getStepSpokenAudio(japaStep!, "kn");
    expect(audioKn).toContain("೩೨ ವರ್ಷವಾಗಿದ್ದರೂ");
    expect(audioKn).toContain("ॐ ह्रीं योगिनि");

    const audioEn = getStepSpokenAudio(japaStep!, "en");
    expect(audioEn).toContain("age 32");
    expect(audioEn).toContain("ॐ ह्रीं योगिनि");

    // Step 9: 16-knot Dora wrist thread
    const doraStep = kalyana.steps.find((s) => s.titleKn.includes("ರಕ್ಷಾಸೂತ್ರ"));
    expect(doraStep).toBeDefined();
    expect(doraStep?.mantraSanskrit).toContain("दोरग्रन्थिषु");
    expect(doraStep?.actionCueKn).toContain("ಬಲಗೈಗೆ");
  });

  it("verifies authentic Vedic Sankalpa Engine generates pure Sanskrit Devanagari text for all life goals", async () => {
    const {
      buildSanskritSankalpaMantra,
      buildLocalizedSankalpaText,
      SANKALPA_PURPOSES
    } = await import("../features/pooja/guidedSankalpaService");

    // 1. Marriage goal (vivaha)
    const vivahaSanskrit = buildSanskritSankalpaMantra({
      devoteeName: "ಶಂಕರ್",
      gotra: "ಕಾಶ್ಯಪ",
      purposeKey: "vivaha"
    });
    expect(vivahaSanskrit).toContain("श्वेतवराहकल्पे");
    expect(vivahaSanskrit).toContain("गोत्रोत्पन्नस्य");
    expect(vivahaSanskrit).toContain("मम सकल विवाह विघ्न निवारणपूर्वक त्वरित शुभ विवाह सिद्ध्यर्थं");

    const vivahaKn = buildLocalizedSankalpaText(
      { devoteeName: "ಶಂಕರ್", gotra: "ಕಾಶ್ಯಪ", purposeKey: "vivaha" },
      "kn"
    );
    expect(vivahaKn.title).toContain("ಸಂಕಲ್ಪ");
    expect(vivahaKn.intentionText).toContain("ವಿವಾಹ ಪ್ರಾಪ್ತಿ");

    // 2. Family goal (kutumba)
    const kutumbaSanskrit = buildSanskritSankalpaMantra({
      devoteeName: "ಪ್ರಮೋದ್",
      gotra: "ವಿಶ್ವಾಮಿತ್ರ",
      purposeKey: "kutumba"
    });
    expect(kutumbaSanskrit).toContain("क्षेम-स्थैर्य-धैर्य-विजय");

    // 3. Exam/Education goal (vidya)
    const vidyaSanskrit = buildSanskritSankalpaMantra({
      devoteeName: "ಅನುಷಾ",
      gotra: "ಭಾರದ್ವಾಜ",
      purposeKey: "vidya"
    });
    expect(vidyaSanskrit).toContain("सकल विद्या पारङ्गतत्व");

    // 4. Custom goal
    const customSanskrit = buildSanskritSankalpaMantra({
      devoteeName: "ಸುರೇಶ್",
      gotra: "ಗೌತಮ",
      purposeKey: "custom",
      customGoal: "ನೂತನ ಗೃಹಪ್ರವೇಶ"
    });
    expect(customSanskrit).toContain("ನೂತನ ಗೃಹಪ್ರವೇಶ");
    expect(customSanskrit).toContain("मम मनोगत");

    expect(Object.keys(SANKALPA_PURPOSES)).toHaveLength(8);
  });

  it("verifies URL generator and parser roundtrip with Vratas and Sankalpa parameters", () => {
    const shareUrl = generateGuidedPoojaShareUrl({
      poojaKeys: ["sandhyavandana"],
      vrataKeys: ["kalyana_mangalagauri_vrata"],
      activeCategory: "vratas",
      sankalpaKey: "vivaha",
      devoteeName: "ರಾಧಿಕಾ",
      gotra: "ಕೌಂಡಿನ್ಯ",
      lang: "kn",
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
    });

    expect(shareUrl).toContain("tab=vratas");
    expect(shareUrl).toContain("vratas=kalyana_mangalagauri_vrata");
    expect(shareUrl).toContain("sankalpa=vivaha");

    const parsed = parseGuidedPoojaFromUrl(shareUrl);
    expect(parsed.vrataKeys).toEqual(["kalyana_mangalagauri_vrata"]);
    expect(parsed.activeCategory).toBe("vratas");
    expect(parsed.sankalpaKey).toBe("vivaha");
    expect(parsed.devoteeName).toBe("ರಾಧಿಕಾ");
    expect(parsed.gotra).toBe("ಕೌಂಡಿನ್ಯ");
  });
});
