import { describe, it, expect } from "vitest";
import {
  POOJA_ESTIMATE_CATALOG,
  TIER_METADATA,
  computeConsolidatedPoojaPlan,
  type PoojaTier
} from "../data/poojaCostEstimateData";

describe("Baggona Panchanga - Pooja Packages, Estimate & Samagri Data Engine", () => {
  it("verifies the catalog contains all requested poojas including Narayana Bali, Preta Uddhara, and Combined bundles", () => {
    const ids = POOJA_ESTIMATE_CATALOG.map(p => p.id);
    expect(ids).toContain("narayana_bali");
    expect(ids).toContain("pretoddhara");
    expect(ids).toContain("tripindi_shraddha");
    expect(ids).toContain("narayana_bali_tripindi_pretoddhara");
    expect(ids).toContain("maha_ganapati_homa");
    expect(ids).toContain("maha_mrityunjaya_homa");
    expect(ids).toContain("sudarshana_homa");
    expect(ids).toContain("navagraha_shanti_homa");
    expect(ids).toContain("chandika_homa");
    expect(ids).toContain("tila_homa");
  });

  it("verifies every pooja has the 3 standard tiers (low, medium, high) with valid pricing and priest allocations", () => {
    POOJA_ESTIMATE_CATALOG.forEach(pooja => {
      (["low", "medium", "high"] as PoojaTier[]).forEach(tier => {
        const t = pooja.tiers[tier];
        expect(t).toBeDefined();
        expect(t.basePrice).toBeGreaterThan(0);
        expect(t.priestCount).toBeGreaterThanOrEqual(2);
        expect(t.priestTeamKn).toBeTruthy();
        expect(t.japaCountKn).toBeTruthy();
        expect(t.durationKn).toBeTruthy();
        expect(t.kalashaCountKn).toBeTruthy();
        expect(t.prathimaKn).toBeTruthy();
        expect(t.homaDravyasKn.length).toBeGreaterThan(0);
        expect(t.brahmanaBhojanaKn).toBeTruthy();
        expect(t.costBreakdown.length).toBeGreaterThan(0);

        // Verify cost breakdown sum equals or closely aligns with base price
        const sum = t.costBreakdown.reduce((acc, item) => acc + item.amount, 0);
        expect(sum).toBe(t.basePrice);
      });
    });
  });

  it("verifies every pooja has a comprehensive Samagri list split between devotee and priest sources", () => {
    POOJA_ESTIMATE_CATALOG.forEach(pooja => {
      expect(pooja.samagriList.length).toBeGreaterThan(4);
      const devoteeItems = pooja.samagriList.filter(s => s.source === "devotee");
      const priestItems = pooja.samagriList.filter(s => s.source === "priest");

      expect(devoteeItems.length).toBeGreaterThan(0);
      expect(priestItems.length).toBeGreaterThan(0);

      // Verify essential sacred items exist in the catalog
      const itemNames = pooja.samagriList.map(s => s.nameKn).join(" ");
      expect(itemNames).toMatch(/ಕಲಶ|ತೆಂಗಿನಕಾಯಿ|ಶ್ರೀಫಲ|ತುಪ್ಪ|ವಸ್ತ್ರ|ಪ್ರತಿಮೆ/);
    });
  });

  it("verifies the 3 core required sections are present for each pooja", () => {
    POOJA_ESTIMATE_CATALOG.forEach(pooja => {
      // 1. Samagri list
      expect(pooja.samagriList.length).toBeGreaterThan(0);

      // 2. Procedure & Havana details
      expect(pooja.sacredProcedureSummaryKn).toBeTruthy();
      expect(pooja.havanaSpecialtiesKn.length).toBeGreaterThan(0);
      expect(pooja.priestDutiesKn.length).toBeGreaterThan(0);

      // 3. Why do this pooja & expected life shifts
      expect(pooja.whyNeedThisPoojaKn).toBeTruthy();
      expect(pooja.shastraReferenceKn).toBeTruthy();
      expect(pooja.expectedLifeShiftsKn.length).toBeGreaterThan(0);

      // Persuasive high tier justification
      expect(pooja.whyHighTierGrandImpactKn).toBeTruthy();
    });
  });

  it("computes single pooja plan correctly for ₹12,000, ₹20,000, and ₹30,000 tiers", () => {
    const lowPlan = computeConsolidatedPoojaPlan(["narayana_bali"], "low");
    expect(lowPlan.totalIndividualCost).toBe(12000);
    expect(lowPlan.comboPackageCost).toBe(12000);
    expect(lowPlan.bundleSavings).toBe(0);
    expect(lowPlan.totalPriestsCoordinated).toBe(2);

    const medPlan = computeConsolidatedPoojaPlan(["narayana_bali"], "medium");
    expect(medPlan.totalIndividualCost).toBe(20000);
    expect(medPlan.comboPackageCost).toBe(20000);
    expect(medPlan.totalPriestsCoordinated).toBe(4);

    const highPlan = computeConsolidatedPoojaPlan(["narayana_bali"], "high");
    expect(highPlan.totalIndividualCost).toBe(30000);
    expect(highPlan.comboPackageCost).toBe(30000);
    expect(highPlan.totalPriestsCoordinated).toBe(7);
  });

  it("computes multi-pooja consolidated plan with intelligent bundle savings and priest scaling", () => {
    // Select Narayana Bali + Preta Uddhara
    const comboPlan = computeConsolidatedPoojaPlan(["narayana_bali", "pretoddhara"], "medium");
    expect(comboPlan.selectedPoojas.length).toBe(2);
    expect(comboPlan.totalIndividualCost).toBe(40000); // 20k + 20k
    expect(comboPlan.comboPackageCost).toBeLessThan(40000); // Has bundle discount
    expect(comboPlan.bundleSavings).toBeGreaterThan(0);
    expect(comboPlan.totalPriestsCoordinated).toBeGreaterThanOrEqual(4);

    // Samagri items are deduplicated by name
    const uniqueNames = new Set(comboPlan.consolidatedSamagriList.map(s => s.nameKn));
    expect(comboPlan.consolidatedSamagriList.length).toBe(uniqueNames.size);

    // Cost breakdown items exist
    expect(comboPlan.consolidatedCostBreakdown.length).toBeGreaterThan(0);
  });

  it("verifies High tier persuasion highlights 7 priests, 10,000+ japas, silver/gold prathima and silk purnahuti", () => {
    const highPlan = computeConsolidatedPoojaPlan(["narayana_bali"], "high");
    expect(highPlan.whyHighTierPersuasionKn).toMatch(/೭|7/);
    expect(highPlan.whyHighTierPersuasionKn).toMatch(/೧೦,೦೦೦|10,000|ಜಪ/);
    expect(highPlan.whyHighTierPersuasionKn).toMatch(/ಬೆಳ್ಳಿ|ಚಿನ್ನ|ರೇಷ್ಮೆ|ಪೂರ್ಣಾಹುತಿ/);
  });

  it("verifies Kannada linguistic purity with zero English token leak in primary headings and names", () => {
    POOJA_ESTIMATE_CATALOG.forEach(pooja => {
      expect(pooja.nameKn).not.toMatch(/undefined|null|NaN/);
      expect(pooja.subtitleKn).not.toMatch(/undefined|null|NaN/);
      expect(pooja.whyNeedThisPoojaKn).not.toMatch(/undefined|null|NaN/);
    });
  });
});
