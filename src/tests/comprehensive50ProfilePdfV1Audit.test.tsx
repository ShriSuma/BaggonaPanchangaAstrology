import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { calculateKundli } from "../core/KundliEngine";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { PlanetName, type KundliInput } from "../core/AstroTypes";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";
import { BENCHMARK_50_PROFILES, type BenchmarkProfile50 } from "../data/benchmarkProfiles50";
import { prepareBhavishyaV1Data } from "../features/premiumPdf/bhavishyaV1Service";
import { PdfTemplate } from "../components/RamanBhavishya/PdfTemplate";
import type { KundliViewerSession } from "../stores/kundliViewerStore";

describe("Comprehensive 50 Real-World Profiles Premium PDF V1 Audit Across 5 Languages", () => {
  it("verifies all 50 benchmark profiles have verified Rodden Rating AA/A and balanced 5-language allocation", () => {
    expect(BENCHMARK_50_PROFILES).toHaveLength(50);

    const langCounts: Record<string, number> = { kn: 0, en: 0, hi: 0, te: 0, ta: 0 };
    for (const p of BENCHMARK_50_PROFILES) {
      expect(["AA", "A"]).toContain(p.roddenRating);
      expect(p.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.birthTime).toMatch(/^\d{2}:\d{2}$/);
      expect(p.latitude).toBeDefined();
      expect(p.longitude).toBeDefined();
      expect(p.assignedLanguage).toBeDefined();
      langCounts[p.assignedLanguage] = (langCounts[p.assignedLanguage] || 0) + 1;
    }

    // Exactly 10 profiles per language
    expect(langCounts.kn).toBe(10);
    expect(langCounts.en).toBe(10);
    expect(langCounts.hi).toBe(10);
    expect(langCounts.te).toBe(10);
    expect(langCounts.ta).toBe(10);
  });

  // Audit all 50 profiles sequentially
  BENCHMARK_50_PROFILES.forEach((profile: BenchmarkProfile50, index: number) => {
    const lang = profile.assignedLanguage;

    it(`[Profile ${index + 1}/50][${lang.toUpperCase()}] Audits ${profile.name} (${profile.ageBracket}, ~${profile.approxAgeIn2026}y, ${profile.gender})`, async () => {
      // 1. Calculate Natal Kundli
      const devoteeInput: KundliInput = {
        name: profile.name,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        latitude: profile.latitude,
        longitude: profile.longitude,
        gender: profile.gender
      };

      const kundli = calculateKundli(devoteeInput, { ayanamsaModel: "lahiri" });
      expect(kundli).toBeDefined();
      expect(kundli.lagnaRashi).toBeDefined();
      expect(kundli.moonSign).toBeDefined();

      const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
      expect(moon).toBeDefined();
      const nakIndex = moon!.nakshatra.index;
      expect(nakIndex).toBeGreaterThanOrEqual(0);
      expect(nakIndex).toBeLessThan(27);

      // 2. Calculate Traditional Panchanga including Birth Hora (Kora)
      const panchanga = calculateTraditionalBaggona(
        profile.birthDate,
        profile.birthTime,
        profile.latitude,
        profile.longitude,
        "lahiri"
      );

      expect(panchanga).toBeDefined();
      expect(panchanga.tithi).toBeTruthy();
      expect(panchanga.weekday).toBeTruthy();
      expect(panchanga.yoga).toBeTruthy();
      expect(panchanga.karana).toBeTruthy();
      expect(panchanga.horaLord).toBeTruthy();
      expect(["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]).toContain(panchanga.horaLord);
      expect(panchanga.horaNumber).toBeGreaterThanOrEqual(1);
      expect(panchanga.horaNumber).toBeLessThanOrEqual(24);

      // 3. Generate 5-Anga Synthesis & Prescriptions
      const synthesis = generatePanchangaAngaSynthesis(kundli, {
        devoteeName: profile.name,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        latitude: profile.latitude,
        longitude: profile.longitude,
        gender: profile.gender,
        devoteeAge: profile.approxAgeIn2026,
        maritalStatus: profile.maritalStatus,
        hasChildren: profile.hasChildren,
        lang
      });

      expect(synthesis).toBeDefined();
      expect(synthesis.prescriptions).toBeDefined();
      const { gemstoneRing } = synthesis.prescriptions;

      // 4. Audit Vajra (Diamond) vs Hawala (Red Coral) Classical Parashari Logic
      const lagnaRashiIdx = kundli.lagnaRashi.index;
      const mars = kundli.planets.find((p) => p.name === PlanetName.Mars);
      const marsRashiIdx = mars ? mars.rashi.index : 0;
      const marsHouseFromLagna = ((marsRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
      const isMarsDusthana = [6, 8, 12].includes(marsHouseFromLagna);
      const isMarsBeneficLagna = [0, 3, 4, 7, 8, 11].includes(lagnaRashiIdx);
      const isKujaNakshatra = (nakIndex % 9) === 4; // Mrigashira, Chitra, Dhanishta
      const expectedHavala = isKujaNakshatra || (isMarsBeneficLagna && !isMarsDusthana);

      expect(gemstoneRing.isHavalaRecommended).toBe(expectedHavala);

      // 5. Prepare Premium PDF V1 Payload
      const session = {
        input: devoteeInput,
        result: kundli,
        birthDateYmd: devoteeInput.birthDate,
        birthTimeHm: devoteeInput.birthTime
      } as unknown as KundliViewerSession;

      const payload = await prepareBhavishyaV1Data(
        session,
        lang,
        "", // offline Vedic mathematical engine
        {
          maritalStatus: profile.maritalStatus,
          childrenStatus: profile.hasChildren ? "has_children" : "no_children"
        }
      );

      expect(payload).toBeDefined();
      expect(payload.translations).toBeDefined();
      const td = payload.translations;

      // Audit Header Parameters in PDF Translations
      expect(td.nameValue).toBeTruthy();
      expect(td.dobValue).toBeTruthy();
      expect(td.lagnaValue).toBeTruthy();
      expect(td.moonValue).toBeTruthy();
      expect(td.nakshatraValue).toBeTruthy();
      expect(td.tithiValue).toBeTruthy();
      expect(td.weekdayValue).toBeTruthy();
      expect(td.yogaValue).toBeTruthy();
      expect(td.karanaValue).toBeTruthy();
      expect(td.horaValue).toBeTruthy();

      // 6. Render Full PDF Template DOM & Perform Word-by-Word Inspection
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

      const clone = container.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("style, script, svg defs style").forEach(el => el.remove());
      const allText = clone.textContent || "";
      expect(allText.length).toBeGreaterThan(1000);

      // Check for unreplaced template placeholders
      const placeholderRegex = /\{[a-zA-Z0-9_]+\}/g;
      const unreplacedPlaceholders = allText.match(placeholderRegex) || [];
      expect(unreplacedPlaceholders).toHaveLength(0);

      // Check for corrupt tokens
      for (const forbidden of ["undefined", "NaN", "null", "[object Object]"]) {
        expect(allText).not.toContain(forbidden);
      }

      // Check life stage consistency
      const age = profile.approxAgeIn2026;
      if (age <= 12) {
        expect(allText).not.toContain("ಕಳತ್ರ");
        expect(allText).not.toContain("ದಾಂಪತ್ಯ ಸುಖ");
        expect(allText).not.toContain("ವೈವಾಹಿಕ ಸುಖ");
      }

      // Verify Birth Hora is displayed in DOM
      expect(allText).toContain(td.horaValue);
    });
  });
});
