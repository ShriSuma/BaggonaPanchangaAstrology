import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import {
  calculateVivahaMelameli,
  evaluateKujaDosha,
  computePapaSamya,
  computeDashaSandhi
} from "../features/melameli/vivahaMelameliEngine";
import { T_MELAMELI, getMelameliText, type MelameliLanguage } from "../features/melameli/vivahaMelameliLocale";
import VivahaMelameliPdfTemplate from "../components/melameli/VivahaMelameliPdfTemplate";
import type { KundliInput } from "../core/AstroTypes";

describe("Vivaha Guna Melameli Dynamic Overhaul Audit", () => {
  // Test 1: 5-Language Dictionary Integrity
  it("verifies 5-language dictionary completeness across kn, en, hi, te, ta", () => {
    const langs: MelameliLanguage[] = ["kn", "en", "hi", "te", "ta"];
    const keys = Object.keys(T_MELAMELI);
    expect(keys.length).toBeGreaterThan(15);

    for (const key of keys) {
      for (const lang of langs) {
        const text = getMelameliText(key, lang);
        expect(text).toBeTruthy();
        expect(typeof text).toBe("string");
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  // Test 2: Authentic Boy & Girl Kundli and Ashta Kuta Calculation
  it("calculates authentic Ashta Kuta compatibility dynamically from birth parameters", () => {
    const boyInput: KundliInput = {
      name: "Ramesh Hegde",
      birthDate: "1994-05-15",
      birthTime: "08:30",
      latitude: 14.5479,
      longitude: 74.3188,
      pincode: "581326"
    };

    const girlInput: KundliInput = {
      name: "Soumya Bhat",
      birthDate: "1996-09-22",
      birthTime: "14:15",
      latitude: 14.5479,
      longitude: 74.3188,
      pincode: "581326"
    };

    const result = calculateVivahaMelameli(boyInput, girlInput);

    // Verify Kundli details computed
    expect(result.boyKundli).toBeTruthy();
    expect(result.girlKundli).toBeTruthy();
    expect(result.boyKundli.lagnaRashi).toBeDefined();
    expect(result.girlKundli.lagnaRashi).toBeDefined();

    // Verify Total Score and Kootas
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(36);
    expect(result.maxScore).toBe(36);
    expect(result.ashtaKuta.length).toBe(8);

    // Verify individual Koota scores
    const varna = result.ashtaKuta.find((k) => k.id === "varna");
    const vashya = result.ashtaKuta.find((k) => k.id === "vashya");
    const tara = result.ashtaKuta.find((k) => k.id === "tara");
    const yoni = result.ashtaKuta.find((k) => k.id === "yoni");
    const maitri = result.ashtaKuta.find((k) => k.id === "grahaMaitri");
    const gana = result.ashtaKuta.find((k) => k.id === "gana");
    const bhakoot = result.ashtaKuta.find((k) => k.id === "bhakoot");
    const nadi = result.ashtaKuta.find((k) => k.id === "nadi");

    expect(varna?.maxScore).toBe(1);
    expect(vashya?.maxScore).toBe(2);
    expect(tara?.maxScore).toBe(3);
    expect(yoni?.maxScore).toBe(4);
    expect(maitri?.maxScore).toBe(5);
    expect(gana?.maxScore).toBe(6);
    expect(bhakoot?.maxScore).toBe(7);
    expect(nadi?.maxScore).toBe(8);
  });

  // Test 3: South Indian Dashakoota Attributes
  it("evaluates South Indian Dashakoota attributes (Mahendra, Stree Deergha, Rajju, Vedha)", () => {
    const boyInput: KundliInput = {
      name: "Groom",
      birthDate: "1992-03-10",
      birthTime: "06:00",
      latitude: 14.5479,
      longitude: 74.3188,
      pincode: "581326"
    };

    const girlInput: KundliInput = {
      name: "Bride",
      birthDate: "1995-11-20",
      birthTime: "18:45",
      latitude: 14.5479,
      longitude: 74.3188,
      pincode: "581326"
    };

    const result = calculateVivahaMelameli(boyInput, girlInput);

    expect(result.dashaKutaAdditions.mahendra).toBeDefined();
    expect(result.dashaKutaAdditions.streeDeergha).toBeDefined();
    expect(result.dashaKutaAdditions.rajju).toBeDefined();
    expect(result.dashaKutaAdditions.vedha).toBeDefined();
  });

  // Test 4: Kuja Dosha (Manglik) & Papa Samya
  it("evaluates Tri-Lagna Kuja Dosha and Papa Samya balance", () => {
    const boyInput: KundliInput = {
      name: "Groom",
      birthDate: "1990-01-15",
      birthTime: "12:00",
      latitude: 14.5479,
      longitude: 74.3188,
      pincode: "581326"
    };

    const girlInput: KundliInput = {
      name: "Bride",
      birthDate: "1993-07-28",
      birthTime: "22:30",
      latitude: 14.5479,
      longitude: 74.3188,
      pincode: "581326"
    };

    const result = calculateVivahaMelameli(boyInput, girlInput);

    expect(result.kujaDosha.boy).toBeDefined();
    expect(result.kujaDosha.girl).toBeDefined();
    expect(result.papaSamya.boyPapaPoints).toBeGreaterThanOrEqual(0);
    expect(result.papaSamya.girlPapaPoints).toBeGreaterThanOrEqual(0);
    expect(result.dashaSandhi).toBeDefined();
    expect(result.gokarnaSevas.length).toBeGreaterThanOrEqual(1);
  });

  // Test 5: Multi-Page PDF Template Rendering in all 5 languages
  it("renders 3-page printable PDF template across all 5 languages without crashing", () => {
    const boyInput: KundliInput = {
      name: "Anand",
      birthDate: "1994-04-12",
      birthTime: "07:15",
      latitude: 14.5479,
      longitude: 74.3188,
      pincode: "581326"
    };

    const girlInput: KundliInput = {
      name: "Priyanka",
      birthDate: "1997-08-19",
      birthTime: "16:40",
      latitude: 14.5479,
      longitude: 74.3188,
      pincode: "581326"
    };

    const result = calculateVivahaMelameli(boyInput, girlInput);
    const langs: MelameliLanguage[] = ["kn", "en", "hi", "te", "ta"];

    for (const lang of langs) {
      const { container } = render(
        <VivahaMelameliPdfTemplate
          melameliResult={result}
          selectedLang={lang}
          boyName="Anand"
          girlName="Priyanka"
          boyBirthDate="1994-04-12"
          boyBirthTime="07:15"
          girlBirthDate="1997-08-19"
          girlBirthTime="16:40"
        />
      );

      const pages = container.querySelectorAll(".pdf-page");
      expect(pages.length).toBe(3);
    }
  });
});
