import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Daily Darshana All 6 Tabs Header & Script Audit", () => {
  const filePath = path.join(__dirname, "../pages/DailyDarshanaPage.tsx");
  const fileContent = fs.readFileSync(filePath, "utf8");

  const languages = ["kn", "te", "ta", "hi", "en"] as const;
  const tabs = [
    { key: "darshana", index: "1/6", icon: "🛕", ariaKey: "tabDarshanaAria", headingKey: "darshanaTabHeading" },
    { key: "bhavishya", index: "2/6", icon: "🔮", ariaKey: "tabBhavishyaAria", headingKey: "bhavishyaTabHeading" },
    { key: "pooja", index: "3/6", icon: "🪔", ariaKey: "tabPoojaAria", headingKey: "poojaTabHeading" },
    { key: "lucky", index: "4/6", icon: "💎", ariaKey: "tabLuckyAria", headingKey: "luckyTabHeading" },
    { key: "whatsapp", index: "5/6", icon: "💬", ariaKey: "tabWhatsappAria", headingKey: "whatsappTabHeading" },
    { key: "details", index: "6/6", icon: "📜", ariaKey: "tabDetailsAria", headingKey: "detailsTabHeading" },
  ];

  it("verifies all 6 tabs define non-empty ariaKey and headingKey in DARSHANA_LABELS for all 5 languages", () => {
    for (const lang of languages) {
      // Find each language section
      const langSectionRegex = new RegExp(`\\b${lang}:\\s*{([\\s\\S]*?)}\\s*,?\\s*(?:en:|hi:|te:|ta:|kn:|};)`, "m");
      const langMatch = fileContent.match(langSectionRegex);
      expect(langMatch, `Expected dictionary for lang '${lang}'`).toBeTruthy();

      const langDict = langMatch![1];
      for (const tab of tabs) {
        expect(langDict).toContain(`${tab.ariaKey}:`);
        expect(langDict).toContain(`${tab.headingKey}:`);
      }
    }
  });

  it("ensures Telugu labels contain pure Telugu script for all 6 tabs", () => {
    const teRegex = /\bte:\s*{([\s\S]*?)}\s*,?\s*(?:ta:|};)/m;
    const match = fileContent.match(teRegex);
    expect(match).toBeTruthy();
    const teDict = match![1];

    for (const tab of tabs) {
      const ariaMatch = teDict.match(new RegExp(`${tab.ariaKey}:\\s*"([^"]+)"`));
      expect(ariaMatch, `Missing ${tab.ariaKey} in Telugu`).toBeTruthy();
      const text = ariaMatch![1];
      expect(/[\u0C00-\u0C7F]/.test(text), `${tab.ariaKey} should contain Telugu characters: ${text}`).toBe(true);

      const headingMatch = teDict.match(new RegExp(`${tab.headingKey}:\\s*"([^"]+)"`));
      expect(headingMatch, `Missing ${tab.headingKey} in Telugu`).toBeTruthy();
      const heading = headingMatch![1];
      expect(/[\u0C00-\u0C7F]/.test(heading), `${tab.headingKey} should contain Telugu characters: ${heading}`).toBe(true);
    }
  });

  it("ensures Kannada labels contain pure Kannada script for all 6 tabs", () => {
    const knRegex = /\bkn:\s*{([\s\S]*?)}\s*,?\s*en:/m;
    const match = fileContent.match(knRegex);
    expect(match).toBeTruthy();
    const knDict = match![1];

    for (const tab of tabs) {
      const ariaMatch = knDict.match(new RegExp(`${tab.ariaKey}:\\s*"([^"]+)"`));
      expect(ariaMatch, `Missing ${tab.ariaKey} in Kannada`).toBeTruthy();
      const text = ariaMatch![1];
      expect(/[\u0C80-\u0CFF]/.test(text), `${tab.ariaKey} should contain Kannada characters: ${text}`).toBe(true);

      const headingMatch = knDict.match(new RegExp(`${tab.headingKey}:\\s*"([^"]+)"`));
      expect(headingMatch, `Missing ${tab.headingKey} in Kannada`).toBeTruthy();
      const heading = headingMatch![1];
      expect(/[\u0C80-\u0CFF]/.test(heading), `${tab.headingKey} should contain Kannada characters: ${heading}`).toBe(true);
    }
  });

  it("ensures the active tab indicator pill renders all 6 tabs with icons and fallbacks", () => {
    expect(fileContent).toContain('activeTab === "darshana"');
    expect(fileContent).toContain('activeTab === "bhavishya"');
    expect(fileContent).toContain('activeTab === "pooja"');
    expect(fileContent).toContain('activeTab === "lucky"');
    expect(fileContent).toContain('activeTab === "whatsapp"');
    expect(fileContent).toContain('1/6');
    expect(fileContent).toContain('2/6');
    expect(fileContent).toContain('3/6');
    expect(fileContent).toContain('4/6');
    expect(fileContent).toContain('5/6');
    expect(fileContent).toContain('6/6');

    // Tab 1 now has its Header Banner matching tabs 2-6
    expect(fileContent).toContain('🛕 {dict.darshanaTabHeading');
    expect(fileContent).toContain('🔮 {dict.bhavishyaTabHeading');
    expect(fileContent).toContain('🪔 {dict.poojaTabHeading');
    expect(fileContent).toContain('💎 {dict.luckyTabHeading');
    expect(fileContent).toContain('💬 {dict.whatsappTabHeading');
    expect(fileContent).toContain('📜 {dict.detailsTabHeading');
  });
});
