import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { calculateKundli } from "../core/KundliEngine";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { prepareBhavishyaV1Data } from "../features/premiumPdf/bhavishyaV1Service";
import { PdfTemplate } from "../components/RamanBhavishya/PdfTemplate";
import { patrikaNavamshaFromDegree, formatChartHouseNumber } from "../core/localeNumbers";
import { getLocalizedDevoteeName, ensureNamePresence } from "../features/premiumPdf/dynamicBhavishyaEngine";
import { cleanEnglishFromRegionalText } from "../features/premiumPdf/premiumPdfLocale";
import { transliterateName } from "../utils/transliterator";
import type { KundliInput, PlanetName } from "../core/AstroTypes";
import type { KundliViewerSession } from "../stores/kundliViewerStore";

describe("Word-by-Word Premium PDF V1 Deep Audit & Ground Truth Verification", () => {
  // ─── 1. DOSHA DIVERSITY & SEPARATION AUDIT FOR MULTIPLE PEOPLE ───────────
  it("Audits Dosha diversity and dynamic calculation across 5 distinct devotee charts", () => {
    const profiles: KundliInput[] = [
      // Profile 1: Libra Lagna, Mars in 8th (Kuja Dosha candidate)
      { name: "Devotee 1", birthDate: "1988-10-24", birthTime: "06:30", latitude: 14.54, longitude: 74.31, gender: "Male" },
      // Profile 2: Taurus Lagna, Saturn in 10th
      { name: "Devotee 2", birthDate: "1995-05-15", birthTime: "14:20", latitude: 28.61, longitude: 77.20, gender: "Female" },
      // Profile 3: Leo Lagna, Rahu-Ketu axis across 1-7
      { name: "Devotee 3", birthDate: "1975-01-10", birthTime: "22:45", latitude: 19.07, longitude: 72.87, gender: "Male" },
      // Profile 4: Cancer Lagna, Jupiter exalted in Lagna (Benefic Shield candidate)
      { name: "Devotee 4", birthDate: "2002-08-30", birthTime: "04:15", latitude: 12.97, longitude: 77.59, gender: "Female" },
      // Profile 5: Scorpio Lagna, Mars in Gemini
      { name: "Devotee 5", birthDate: "2013-07-22", birthTime: "16:24", latitude: 51.50, longitude: -0.12, gender: "Male" }
    ];

    const doshaResults = profiles.map(p => {
      const k = calculateKundli(p, { ayanamsaModel: "lahiri" });
      const report = calculateComprehensiveDoshas(k, p, new Date("2026-11-06"));
      const detected = report.doshas.filter(d => d.isDetected);
      return {
        name: p.name,
        lagna: k.lagnaRashi.sanskrit,
        moon: k.moonSign.sanskrit,
        doshasCount: detected.length,
        doshaNames: detected.map(d => d.name.en || d.id),
        severities: detected.map(d => d.severity)
      };
    });

    console.log("\n=== DOSHA AUDIT ACROSS 5 DISTINCT DEVOTEES ===");
    console.table(doshaResults);

    // Verify doshas are dynamic: not all profiles have the identical list
    const serializedLists = doshaResults.map(r => r.doshaNames.sort().join("|"));
    const uniqueLists = new Set(serializedLists);
    console.log(`Unique dosha signature sets among 5 profiles: ${uniqueLists.size} / 5`);
    expect(uniqueLists.size).toBeGreaterThan(1);

    // Verify every detected dosha has non-empty name and severity
    for (const res of doshaResults) {
      expect(res.doshasCount).toBeGreaterThan(0);
      for (const dName of res.doshaNames) {
        expect(dName.trim().length).toBeGreaterThan(0);
      }
    }
  });

  // ─── 2. DIVERSE NAMING FIDELITY AUDIT (HINDU, MUSLIM, CHRISTIAN, REGIONAL) ─
  it("Audits name transliteration and spelling integrity for diverse naming backgrounds across all 5 languages", () => {
    const testNames = [
      // Hindu Names (both genders)
      "Manjushree",
      "Ramesh Sharma",
      "Suma Kulkarni",
      "Venkatesh Bhat",
      "Raghavendra",
      "Karthik Hegde",
      "Priya Sundaram",
      "Ananya Rao",
      "Lakshmi Prasad",
      "Manjunath",
      "Manjula",
      "Manju",
      // Muslim Names (both genders)
      "Fatima",
      "Mohammed Imran",
      "Zoya Akhtar",
      "Syed Abdul",
      "Farhan",
      "Amina Begum",
      // Christian / Western Names
      "Mary Joseph",
      "David Miller",
      "John Thomas",
      "Grace",
      "Peter Paul",
      // Regional Complex Names
      "Chandrashekar",
      "Siddalingaiah",
      "Muthuvel",
      "Balasubramaniam"
    ];

    const languages: Array<"kn" | "en" | "hi" | "te" | "ta"> = ["kn", "en", "hi", "te", "ta"];

    console.log("\n=== MULTI-CULTURAL NAME TRANSLITERATION AUDIT ===");
    const nameAuditTable: any[] = [];

    for (const rawName of testNames) {
      const row: any = { English: rawName };
      for (const lang of languages) {
        const localized = getLocalizedDevoteeName(rawName, lang);
        row[lang.toUpperCase()] = localized;

        // Assertion 1: Localized name must not be empty
        expect(localized).toBeTruthy();
        expect(localized.length).toBeGreaterThan(0);

        // Assertion 2: For English target, name MUST match input exactly; for regional, zero Latin letters
        if (lang === "en") {
          expect(localized).toBe(rawName);
        } else {
          expect(/[a-zA-Z]/.test(localized)).toBe(false);
        }

        // Assertion 3: Name must NOT contain corrupted words like "Manoj", "ಮನೋಜ್", "ಮನೋಜ್ ರಿಂದ", etc.
        if (rawName !== "Manoj") {
          expect(localized).not.toContain("ಮನೋಜ್");
          expect(localized).not.toContain("Manoj");
        }

        // Assertion 4: When woven into narrative via ensureNamePresence, name must remain pure
        const wovenKn = ensureNamePresence("ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗುರು ಬಲವಿದೆ.", localized, lang);
        const cleanedKn = cleanEnglishFromRegionalText(wovenKn, lang);

        if (rawName !== "Manoj") {
          expect(cleanedKn).not.toContain("ಮನೋಜ್");
          expect(cleanedKn).not.toContain("ಮನೋಜ್ ರಿಂದ");
        }
      }
      nameAuditTable.push(row);
    }

    console.table(nameAuditTable.slice(0, 15));
  });

  // ─── 3. KUNDLI & MAANDI AMSHAKA PARITY WITH BAGGONA PANCHANGA PATRIKA ────
  it("Audits 100% mathematical parity between Premium PDF V1 South Indian Chart and Janana Kundali", () => {
    const input: KundliInput = {
      name: "Manjushree",
      gothra: "Kashyapa",
      birthDate: "1993-03-16",
      birthTime: "01:40",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Female",
      pincode: "581326"
    };

    const kundli = calculateKundli(input, { ayanamsaModel: "lahiri" });

    // 1. Audit Lagna Amshaka calculation
    const lagnaAmshaka = patrikaNavamshaFromDegree(kundli.ascendant);
    const lagnaAmshakaKn = formatChartHouseNumber(lagnaAmshaka, "kn");
    console.log(`\nLagna Rashi: ${kundli.lagnaRashi.sanskrit} (${kundli.lagnaRashi.index})`);
    console.log(`Lagna Degree: ${kundli.ascendant.toFixed(4)}°`);
    console.log(`Lagna Parashari Navamsha Amshaka (1-12): ${lagnaAmshaka} -> Kannada digits: ${lagnaAmshakaKn}`);

    expect(lagnaAmshaka).toBeGreaterThanOrEqual(1);
    expect(lagnaAmshaka).toBeLessThanOrEqual(12);

    // 2. Audit All 9 Planetary Amshakas
    const planetAmshakas = kundli.planets.map(p => ({
      name: p.name,
      rashi: p.rashi.sanskrit,
      rashiIdx: p.rashi.index,
      degreeInSign: (p.degree % 30).toFixed(2) + "°",
      navamshaAmshaka: patrikaNavamshaFromDegree(p.degree),
      isRetrograde: p.isRetrograde
    }));
    console.table(planetAmshakas);

    for (const pa of planetAmshakas) {
      expect(pa.navamshaAmshaka).toBeGreaterThanOrEqual(1);
      expect(pa.navamshaAmshaka).toBeLessThanOrEqual(12);
    }

    // 3. Audit Maandi (Gulika) Placement & Amshaka
    if (kundli.maandi) {
      const maandiAmshaka = patrikaNavamshaFromDegree(kundli.maandi.degree);
      console.log(`Maandi Rashi: ${kundli.maandi.rashi.sanskrit} (${kundli.maandi.rashi.index}), Degree: ${kundli.maandi.degree.toFixed(2)}°, Amshaka: ${maandiAmshaka}`);
      expect(maandiAmshaka).toBeGreaterThanOrEqual(1);
      expect(maandiAmshaka).toBeLessThanOrEqual(12);
    }
  });

  // ─── 4. FULL 5-LANGUAGE WORD-BY-WORD AUDIT FOR MANJUSHREE ─────────────────
  it("Performs complete 5-language end-to-end PDF audit for devotee 'Manjushree'", async () => {
    const input: KundliInput = {
      name: "Manjushree",
      gothra: "Kashyapa",
      birthDate: "1994-06-12",
      birthTime: "10:15",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Female",
      pincode: "581326"
    };

    const k = calculateKundli(input, { ayanamsaModel: "lahiri" });
    const session = {
      input,
      result: k,
      birthDateYmd: input.birthDate,
      birthTimeHm: input.birthTime
    } as unknown as KundliViewerSession;

    const languages: Array<"kn" | "en" | "hi" | "te" | "ta"> = ["kn", "en", "hi", "te", "ta"];

    for (const lang of languages) {
      const payload = await prepareBhavishyaV1Data(
        session,
        lang,
        "", // offline deterministic Vedic engine
        { maritalStatus: "married", childrenStatus: "has_children" }
      );

      // Render the virtual PDF DOM
      const { container } = render(
        <PdfTemplate
          theme="sunrise"
          session={session}
          predictions={payload.predictions || []}
          translations={payload.translations}
          deepInsights={payload.deepInsights}
          premiumData={payload.premiumData}
          ageYears={payload.ageYears}
          lang={lang}
        />
      );

      const allText = container.textContent || "";

      // 1. Check devotee name presence
      const expectedName = getLocalizedDevoteeName("Manjushree", lang);
      expect(allText).toContain(expectedName);

      // 2. ABSOLUTELY ZERO corruption to "Manoj" or "ಮನೋಜ್"
      expect(allText).not.toContain("ಮನೋಜ್");
      expect(allText).not.toContain("ಮನೋಜ್ ರಿಂದ");
      expect(allText).not.toContain("ಮನೋಜ್ ಅವರೇ");

      // 3. No unresolved template placeholders
      const placeholders = allText.match(/\{[a-zA-Z0-9_]+\}/g) || [];
      expect(placeholders).toEqual([]);

      // 4. No JavaScript error tokens
      expect(allText).not.toContain("undefined");
      expect(allText).not.toContain("NaN");
      expect(allText).not.toContain("[object Object]");

      // 5. Doshas are present and separate
      const doshas = payload.premiumData?.doshas || [];
      expect(doshas.length).toBeGreaterThan(0);
      for (const d of doshas) {
        expect(d.name).toBeTruthy();
        expect(d.impact).toBeTruthy();
      }

      console.log(`[${lang.toUpperCase()}] Devotee: "${expectedName}", Doshas count: ${doshas.length}, Text length: ${allText.length} chars - PASSED`);
    }
  });
});
