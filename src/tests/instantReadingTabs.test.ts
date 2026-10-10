import { describe, expect, it } from "vitest";
import {
  INSTANT_READING_TABS,
  PRIMARY_TAB_KEYS,
  type InstantReadingTabKey
} from "../pages/InstantReadingPage";

describe("Instant Reading Tabbed Redesign", () => {
  it("exports all 8 primary sections plus the 'all' view tab", () => {
    expect(INSTANT_READING_TABS).toHaveLength(9);
    expect(PRIMARY_TAB_KEYS).toHaveLength(8);

    const expectedKeys: InstantReadingTabKey[] = [
      "dossier",
      "current_phase",
      "dasha_roadmap",
      "career_education",
      "marriage_destiny",
      "personality",
      "destiny_remedies",
      "client_qa"
    ];

    expect(PRIMARY_TAB_KEYS).toEqual(expectedKeys);
  });

  it("each tab has valid icons, Kannada labels, English labels, and badges", () => {
    for (const tab of INSTANT_READING_TABS) {
      expect(tab.id).toBeDefined();
      expect(tab.icon.length).toBeGreaterThan(0);
      expect(tab.labelKn.length).toBeGreaterThan(0);
      expect(tab.labelEn.length).toBeGreaterThan(0);
      expect(tab.descKn.length).toBeGreaterThan(0);
      expect(tab.descEn.length).toBeGreaterThan(0);
      expect(tab.badgeKn.length).toBeGreaterThan(0);
      expect(tab.badgeEn.length).toBeGreaterThan(0);
    }
  });

  it("provides correct navigation order from first to last tab", () => {
    // First tab is 'dossier'
    expect(PRIMARY_TAB_KEYS[0]).toBe("dossier");
    // Next is 'current_phase'
    expect(PRIMARY_TAB_KEYS[1]).toBe("current_phase");
    // Last is 'client_qa'
    expect(PRIMARY_TAB_KEYS[7]).toBe("client_qa");

    const getNextTab = (current: InstantReadingTabKey) => {
      const idx = PRIMARY_TAB_KEYS.indexOf(current);
      return idx >= 0 && idx < PRIMARY_TAB_KEYS.length - 1 ? PRIMARY_TAB_KEYS[idx + 1] : null;
    };

    const getPrevTab = (current: InstantReadingTabKey) => {
      const idx = PRIMARY_TAB_KEYS.indexOf(current);
      return idx > 0 ? PRIMARY_TAB_KEYS[idx - 1] : null;
    };

    expect(getPrevTab("dossier")).toBeNull();
    expect(getNextTab("dossier")).toBe("current_phase");
    expect(getPrevTab("client_qa")).toBe("destiny_remedies");
    expect(getNextTab("client_qa")).toBeNull();
  });
});
