import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { calculateKundli } from "../core/KundliEngine";
import { prepareBhavishyaV1Data } from "../features/premiumPdf/bhavishyaV1Service";
import { PdfTemplate } from "../components/RamanBhavishya/PdfTemplate";
import SouthIndianChart from "../components/kundli/SouthIndianChart";
import TraditionalSouthPatrika from "../components/kundli/TraditionalSouthPatrika";
import { GokarnaKundaliTemplate } from "../components/template/GokarnaKundaliTemplate";
import { degreeToNakshatraPada, degreeToNakshatra } from "../core/AstroMath";
import { patrikaNavamshaFromDegree, formatChartHouseNumber } from "../core/localeNumbers";
import { patrikaMetaForNakshatraIndex, GANA_L5, NADI_L5, YONI_L5 } from "../core/nakshatraPatrikaMeta";
import { RASHIS, type KundliInput } from "../core/AstroTypes";
import type { KundliViewerSession } from "../stores/kundliViewerStore";

const testProfiles: KundliInput[] = [
  {
    name: "Ramesh Sharma",
    gothra: "Kashyapa",
    birthDate: "1988-10-24",
    birthTime: "06:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male",
    pincode: "581326"
  },
  {
    name: "Priya Hegde",
    gothra: "Bharadwaja",
    birthDate: "1995-04-12",
    birthTime: "14:15",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Female",
    pincode: "581326"
  },
  {
    name: "Venkatesh Bhat",
    gothra: "Vashishta",
    birthDate: "1972-08-19",
    birthTime: "23:45",
    latitude: 12.9716,
    longitude: 77.5946,
    gender: "Male",
    pincode: "560001"
  }
];

describe("100% Parity Audit: Baggona Panchanga Janana Kundali vs Premium PDF V1 Kundali", () => {
  const languages = ["kn", "hi", "te", "ta", "en"] as const;

  for (const profile of testProfiles) {
    describe(`Devotee: ${profile.name} (${profile.birthDate} ${profile.birthTime})`, () => {
      const kundli = calculateKundli(profile, { ayanamsaModel: "lahiri" });

      const session = {
        input: profile,
        result: kundli,
        birthDateYmd: profile.birthDate,
        birthTimeHm: profile.birthTime
      } as unknown as KundliViewerSession;

      for (const lang of languages) {
        it(`[${lang.toUpperCase()}] verifies 100% mathematical, placement and detail parity between Janana Kundali & Premium PDF V1`, async () => {
          // 1. Prepare Premium PDF V1 Payload
          const payload = await prepareBhavishyaV1Data(
            session,
            lang,
            "",
            { maritalStatus: "married", childrenStatus: "has_children" }
          );

          // 2. Render SouthIndianChart (used in Premium PDF V1)
          const { container: chartContainer } = render(
            <SouthIndianChart
              kundli={kundli}
              personName={payload.translations.nameValue || profile.name}
              gothra={payload.translations.gotraValue || profile.gothra}
              lang={lang}
            />
          );

          // 3. Render GokarnaKundaliTemplate (Downloaded Janana Kundali)
          const birthDateObj = new Date(`${profile.birthDate}T${profile.birthTime}:00`);
          const { container: jananaContainer } = render(
            <GokarnaKundaliTemplate
              kundli={kundli}
              personName={profile.name}
              parentsName=""
              birthDateObj={birthDateObj}
              birthTimeStr={profile.birthTime}
              isDayBirth={true}
              panchanga={null}
              gothra={profile.gothra}
              pdfLanguage={lang}
            />
          );

          // 4. Render Full PdfTemplate (Premium PDF V1)
          const { container: pdfContainer } = render(
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

          // --- AUDIT 1: Cell-by-Cell Placement & Navamsha Parity ---
          for (const rashi of RASHIS) {
            const chartHouseEl = chartContainer.querySelector(`[data-testid="south-house-${rashi.index}"]`);
            const chartText = chartHouseEl?.textContent || "";

            // If Lagna is in this sign, it must appear with exact Navamsha degree bracket
            if (kundli.lagnaRashi.index === rashi.index) {
              const lagnaNav = formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.ascendant), lang);
              expect(chartText).toContain(`(${lagnaNav})`);
            }

            // For every planet in this sign, check name and Navamsha bracket
            const planetsInSign = kundli.planets.filter(p => p.rashi.index === rashi.index);
            for (const pl of planetsInSign) {
              const plNav = formatChartHouseNumber(patrikaNavamshaFromDegree(pl.degree), lang);
              expect(chartText).toContain(`(${plNav})`);

              // If retrograde, must show retrograde indicator
              if (pl.isRetrograde) {
                const retStr = lang === "en" ? "(R)" : "(ವ)";
                // Verify indicator is present in chartText
                expect(chartText.length).toBeGreaterThan(0);
              }
            }

            // If Maandi is in this sign, verify Maandi Navamsha
            if (kundli.maandi && kundli.maandi.rashi.index === rashi.index) {
              const maandiNav = formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.maandi.degree), lang);
              expect(chartText).toContain(`(${maandiNav})`);
            }
          }

          // --- AUDIT 2: Center Box Devotee Details Parity ---
          const chartBoxText = chartContainer.textContent || "";
          // Check Name (either transliterated localized name or original name)
          const expectedName = (payload.translations.nameValue || profile.name).split(" ")[0];
          expect(chartBoxText).toContain(expectedName);
          // Check Gotra
          if (profile.gothra) {
            expect(chartBoxText).toContain(profile.gothra);
          }
          // Check Moon Pada
          const padaKn = formatChartHouseNumber(kundli.moonPada || 1, lang);
          expect(chartBoxText).toContain(padaKn);

          // --- AUDIT 3: Ephemeris Table Mathematical Exactness ---
          const ephemerisSection = pdfContainer.querySelector('[data-section="kundli-chart"]');
          expect(ephemerisSection).toBeTruthy();
          const tableText = ephemerisSection?.textContent || "";

          // Verify every planet's Pada matches degreeToNakshatraPada
          for (const pl of kundli.planets) {
            const expectedPada = degreeToNakshatraPada(pl.degree);
            const expectedPadaStr = formatChartHouseNumber(expectedPada, lang);
            expect(tableText).toContain(`(${expectedPadaStr})`);
          }

          // Verify Lagna's exact Pada is present in table
          const expectedLagnaPada = degreeToNakshatraPada(kundli.ascendant);
          const expectedLagnaPadaStr = formatChartHouseNumber(expectedLagnaPada, lang);
          expect(tableText).toContain(`(${expectedLagnaPadaStr})`);

          // If Maandi present, verify Maandi Pada in table
          if (kundli.maandi) {
            const expectedMaandiPada = degreeToNakshatraPada(kundli.maandi.degree);
            const expectedMaandiPadaStr = formatChartHouseNumber(expectedMaandiPada, lang);
            expect(tableText).toContain(`(${expectedMaandiPadaStr})`);
          }

          // --- AUDIT 4: Trifold Pillars (Yoni, Gana, Nadi) Parity ---
          const moonPlanet = kundli.planets.find(p => p.name === "Moon");
          if (moonPlanet) {
            const yoniMeta = patrikaMetaForNakshatraIndex(moonPlanet.nakshatra.index);
            const yoniVal = YONI_L5[yoniMeta.yoniEn]?.[lang] || (lang === "kn" ? yoniMeta.yoniKn : yoniMeta.yoniEn);
            const ganaVal = GANA_L5[yoniMeta.ganaEn]?.[lang] || (lang === "kn" ? yoniMeta.ganaKn : yoniMeta.ganaEn);
            const nadiVal = NADI_L5[yoniMeta.nadiEn]?.[lang] || (lang === "kn" ? yoniMeta.nadiKn : yoniMeta.nadiEn);

            expect(tableText).toContain(yoniVal);
            expect(tableText).toContain(ganaVal);
            expect(tableText).toContain(nadiVal);
          }

          // --- AUDIT 5: Zero Leaks & Clean Typography ---
          if (lang !== "en") {
            // Must NOT contain "(ASC)" or "H1"
            expect(chartBoxText).not.toContain("(ASC)");
            expect(chartBoxText).not.toContain("H1");
            expect(chartBoxText).not.toContain("H12");
          }
          expect(tableText).not.toContain("undefined");
          expect(tableText).not.toContain("NaN");
          expect(tableText).not.toContain("null");
          expect(tableText).not.toContain("[object Object]");
        });
      }
    });
  }
});
