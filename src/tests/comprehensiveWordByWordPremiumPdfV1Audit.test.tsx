import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { calculateKundli } from "../core/KundliEngine";
import { prepareBhavishyaV1Data } from "../features/premiumPdf/bhavishyaV1Service";
import { PdfTemplate } from "../components/RamanBhavishya/PdfTemplate";
import type { SupportedLanguage } from "../features/remedies/kundliRemedyEngine";
import type { KundliInput } from "../core/AstroTypes";
import type { KundliViewerSession } from "../stores/kundliViewerStore";

const devoteeInput: KundliInput = {
  name: "Ramesh Sharma",
  gothra: "Kashyapa",
  birthDate: "1988-10-24",
  birthTime: "06:30",
  latitude: 14.5479,
  longitude: 74.3188,
  gender: "Male",
  pincode: "581326"
};

const calculatedKundli = calculateKundli(devoteeInput, { ayanamsaModel: "lahiri" });

const session = {
  input: devoteeInput,
  result: calculatedKundli,
  birthDateYmd: devoteeInput.birthDate,
  birthTimeHm: devoteeInput.birthTime
} as unknown as KundliViewerSession;

describe("Comprehensive Word-by-Word Premium PDF V1 Audit Across All 5 Languages", () => {
  const languages: SupportedLanguage[] = ["kn", "en", "hi", "te", "ta"];

  for (const lang of languages) {
    it(`[${lang.toUpperCase()}] Audits Premium PDF V1 word-by-word for data completeness, leaks and loopholes`, async () => {
      console.log(`\n======================================================`);
      console.log(`AUDITING PREMIUM PDF V1 IN [${lang.toUpperCase()}]`);
      console.log(`======================================================`);

      const payload = await prepareBhavishyaV1Data(
        session,
        lang,
        "", // offline deterministic Vedic engine
        { maritalStatus: "married", childrenStatus: "has_children" }
      );

      // 1. Audit Header Translations
      const td = payload.translations;
      expect(td.title).toBeTruthy();
      expect(td.nameValue).toBeTruthy();
      expect(td.lagnaValue).toBeTruthy();
      expect(td.moonValue).toBeTruthy();
      expect(td.nakshatraValue).toBeTruthy();
      expect(td.padaValue).toBeTruthy();
      expect(td.tithiValue).toBeTruthy();
      expect(td.weekdayValue).toBeTruthy();

      console.log(`\n--- [${lang}] Header Panchanga & Kundli Parameters ---`);
      console.log(`Title: "${td.title}"`);
      console.log(`Devotee: "${td.nameValue}"`);
      console.log(`DOB: "${td.dobValue}"`);
      console.log(`Lagna: "${td.lagnaValue}" (${td.lagnaLordLabel}: "${td.lagnaLordValue}")`);
      console.log(`Moon Sign: "${td.moonValue}" (${td.moonLordLabel}: "${td.moonLordValue}")`);
      console.log(`Nakshatra: "${td.nakshatraValue}" (${td.padaLabel}: "${td.padaValue}")`);
      console.log(`Tithi: "${td.tithiValue}"`);
      console.log(`Weekday: "${td.weekdayValue}"`);
      console.log(`Active Dasha-Bhukti: "${td.dashaPlanetValue}" ${td.dashaLabel} / "${td.bhuktiPlanetValue}" ${td.bhuktiLabel}`);

      // Check if Yoga and Karana exist in translations
      const hasYoga = "yogaValue" in td || "yogaLabel" in td;
      const hasKarana = "karanaValue" in td || "karanaLabel" in td;
      console.log(`[Panchanga Audit] Yoga present in Header: ${hasYoga}`);
      console.log(`[Panchanga Audit] Karana present in Header: ${hasKarana}`);

      // 2. Render Component
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
      console.log(`Rendered DOM text length: ${allText.length} characters`);

      // 3. Check for raw unreplaced placeholders
      const placeholderRegex = /\{[a-zA-Z0-9_]+\}/g;
      const unreplacedPlaceholders = allText.match(placeholderRegex) || [];
      console.log(`Unreplaced placeholders:`, unreplacedPlaceholders);

      // 4. Check for undefined, NaN, null, [object Object]
      const forbiddenTokens = ["undefined", "NaN", "null", "[object Object]"];
      for (const tok of forbiddenTokens) {
        const hasTok = allText.includes(tok);
        if (hasTok) {
          console.warn(`[WARNING] Rendered PDF text contains '${tok}'!`);
        }
      }

      // 5. Audit DOM Sections
      const rawSections = Array.from(container.querySelectorAll(".pdf-section")) as HTMLElement[];
      console.log(`Total .pdf-section divs rendered: ${rawSections.length}`);
      const sectionNames = rawSections.map(s => s.getAttribute("data-section") || s.id || "unnamed");
      console.log(`Sections rendered:`, sectionNames);

      // 6. Language Purity Check: Check for English leaks in Indic languages
      if (lang !== "en") {
        const words = allText.match(/[A-Za-z]{4,}/g) || [];
        const allowedWords = new Set([
          "Baggona", "Panchanga", "Astrology", "WhatsApp", "Email", "Vedic",
          "Kundali", "Kundli", "Rashi", "Lagna", "Shani", "Guru", "Rahu", "Ketu",
          "Manglik", "Dosha", "Yoga", "Gochara", "Dasha", "Bhukti", "Nakshatra",
          "Siddhanta", "Gokarna", "Kshetra", "Mahabaleshwara", "Shiva", "Parashara",
          "Parashari", "Maandi", "Gulika", "Navamsha", "Bhavas", "Dhana", "Raja"
        ]);

        const leakingWords: string[] = [];
        for (const w of words) {
          if (!allowedWords.has(w) && !allowedWords.has(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())) {
            leakingWords.push(w);
          }
        }
        console.log(`[${lang}] Leaking English words count: ${leakingWords.length}`);
        if (leakingWords.length > 0) {
          console.log(`  Sample leaking words (up to 25):`, leakingWords.slice(0, 25));
        }
      }

      // 7. Check for Cross-Indic language leaks (e.g. Kannada script in Tamil or Hindi)
      if (lang === "hi") {
        const knChars = allText.match(/[\u0C80-\u0CFF]/g) || [];
        const teChars = allText.match(/[\u0C00-\u0C7F]/g) || [];
        const taChars = allText.match(/[\u0B80-\u0BFF]/g) || [];
        console.log(`[HI] Cross-script leaks: KN=${knChars.length}, TE=${teChars.length}, TA=${taChars.length}`);
        if (knChars.length > 0) {
          // print unique words
          const knWords = allText.match(/[\u0C80-\u0CFF]+/g) || [];
          console.log(`  Sample KN words in HI (up to 10):`, Array.from(new Set(knWords)).slice(0, 10));
        }
      } else if (lang === "te") {
        const knChars = allText.match(/[\u0C80-\u0CFF]/g) || [];
        const hiChars = allText.match(/[\u0900-\u097F]/g) || [];
        const taChars = allText.match(/[\u0B80-\u0BFF]/g) || [];
        console.log(`[TE] Cross-script leaks: KN=${knChars.length}, HI=${hiChars.length}, TA=${taChars.length}`);
        if (knChars.length > 0) {
          const knWords = allText.match(/[\u0C80-\u0CFF]+/g) || [];
          console.log(`  Sample KN words in TE (up to 10):`, Array.from(new Set(knWords)).slice(0, 10));
        }
      } else if (lang === "ta") {
        const knChars = allText.match(/[\u0C80-\u0CFF]/g) || [];
        const hiChars = allText.match(/[\u0900-\u097F]/g) || [];
        const teChars = allText.match(/[\u0C00-\u0C7F]/g) || [];
        console.log(`[TA] Cross-script leaks: KN=${knChars.length}, HI=${hiChars.length}, TE=${teChars.length}`);
        if (knChars.length > 0) {
          const knWords = allText.match(/[\u0C80-\u0CFF]+/g) || [];
          console.log("  Sample KN words in TA (up to 10):", Array.from(new Set(knWords)).slice(0, 10));
          const idx = allText.search(/[\u0C80-\u0CFF]/);
          console.log("  Context of KN in TA:", JSON.stringify(allText.slice(Math.max(0, idx - 50), idx + 50)));
        }
      } else if (lang === "kn") {
        const hiChars = allText.match(/[\u0900-\u097F]/g) || [];
        const teChars = allText.match(/[\u0C00-\u0C7F]/g) || [];
        const taChars = allText.match(/[\u0B80-\u0BFF]/g) || [];
        console.log(`[KN] Cross-script leaks: HI=${hiChars.length}, TE=${teChars.length}, TA=${taChars.length}`);
      }

      // 8. Parameter Audits: Check what parameters are rendered
      console.log(`\n--- [${lang}] Crucial Astrological Parameter Audit ---`);
      console.log(`1. Tithi present: ${allText.includes(td.tithiValue || "")}`);
      console.log(`2. Vara (Weekday) present: ${allText.includes(td.weekdayValue || "")}`);
      console.log(`3. Nakshatra present: ${allText.includes(td.nakshatraValue || "")}`);
      console.log(`4. Lagna present: ${allText.includes(td.lagnaValue || "")}`);
      console.log(`5. Moon Sign present: ${allText.includes(td.moonValue || "")}`);
      console.log(`6. Dasha Lord present: ${allText.includes(td.dashaPlanetValue || "")}`);
      console.log(`7. Bhukti Lord present: ${allText.includes(td.bhuktiPlanetValue || "")}`);

      // Check Maandi
      const hasMaandi = allText.toLowerCase().includes("maandi") || allText.includes("ಮಾಂದಿ") || allText.includes("మాంది") || allText.includes("மாந்தி") || allText.includes("मांदि") || allText.includes("मांदी");
      console.log(`8. Maandi/Gulika mentioned in PDF: ${hasMaandi}`);

      // Check Visual Chart
      const hasVisualChart = container.querySelector("svg") !== null || container.querySelector("canvas") !== null || container.querySelector(".kundli-grid") !== null || container.querySelector(".chart-grid") !== null;
      console.log(`9. Visual Kundli Chart (D1/D9 SVG/Grid) in PDF: ${hasVisualChart}`);

      // Check Dasha Timeline / 120-year roadmap table
      const hasDashaTable = container.querySelector("table") !== null || allText.includes("ವಿಂಶೋತ್ತರೀ") || allText.includes("Vimshottari") || allText.includes("विंशोत्तरी") || allText.includes("వింశోత్తరి") || allText.includes("விம்சோத்தரி");
      console.log(`10. Vimshottari Dasha details present: ${hasDashaTable}`);
    });
  }
});
