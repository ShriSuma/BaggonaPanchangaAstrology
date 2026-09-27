import { describe, it, expect } from "vitest";
import {
  generateSevaICalendarString,
  generateGoogleCalendarUrl,
  calculateDeterministicRhythmDay
} from "../features/seva/icsCalendarGenerator";

describe("Calendar Clean Single Clickable URL & Non-Google Calendar Compatibility Audit", () => {
  const sampleDay = calculateDeterministicRhythmDay("2026-09-27", 18, 8, "2026-09-27");

  it("ensures .ics event DESCRIPTION has NO raw HTML <a> tags and only ONE sanctumUrl", () => {
    const ics = generateSevaICalendarString({
      days: [sampleDay],
      lang: "kn",
      personName: "Devotee Test",
      panditName: "Shreeram Pandit",
      locationName: "Gokarna",
      pincode: "581326"
    });

    // Extract the DESCRIPTION section
    const descMatch = ics.match(/DESCRIPTION:([\s\S]*?)X-ALT-DESC/);
    expect(descMatch).not.toBeNull();
    const descriptionContent = descMatch ? descMatch[1] : "";

    // Must NOT contain raw HTML <a> tags in plain text description (which disturbs Apple/Outlook formatting)
    expect(descriptionContent).not.toContain("<a href=");
    expect(descriptionContent).not.toContain("</a>");

    // Must contain the prominent red click item
    expect(descriptionContent).toContain("🔴");
    expect(descriptionContent).toContain("🔴 [");

    // Count how many times the sanctumUrl appears in the plain text DESCRIPTION
    const urlMatches = descriptionContent.match(/https:\/\/[^\s\\]+/g) || [];
    // Exactly 1 clean URL in DESCRIPTION
    expect(urlMatches.length).toBe(1);
  });

  it("ensures LOCATION is the sacred Kshetra name and NEVER a duplicate raw URL", () => {
    const ics = generateSevaICalendarString({
      days: [sampleDay],
      lang: "kn",
      personName: "Devotee Test",
      panditName: "Shreeram Pandit",
      locationName: "Gokarna",
      pincode: "581326"
    });

    // LOCATION should contain Kshetra title and village, not a URL
    expect(ics).not.toContain("LOCATION:https://");
    expect(ics).toContain("LOCATION:ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ · Gokarna");
  });

  it("ensures X-ALT-DESC text/html contains a prominent red button with red border and no duplicate hyperlinks", () => {
    const ics = generateSevaICalendarString({
      days: [sampleDay],
      lang: "kn",
      personName: "Devotee Test",
      panditName: "Shreeram Pandit"
    });

    const altDescMatch = ics.match(/X-ALT-DESC;FMTTYPE=text\/html:([\s\S]*?)ATTACH/);
    expect(altDescMatch).not.toBeNull();
    const htmlContent = altDescMatch ? altDescMatch[1] : "";

    // Contains red button and red border styling
    expect(htmlContent).toContain("#dc2626"); // Red gradient
    expect(htmlContent).toContain("border:2px solid #ef4444"); // Red border
    expect(htmlContent).toContain("🔴");

    // Only 1 <a> hyperlink tag in the entire HTML description
    const aTagMatches = htmlContent.match(/<a /g) || [];
    expect(aTagMatches.length).toBe(1);
  });

  it("ensures Google Calendar Web Intent details has NO raw HTML <a> tags and location is sacred Kshetra", () => {
    const gCalUrl = generateGoogleCalendarUrl({
      day: sampleDay,
      lang: "kn",
      panditName: "Shreeram Pandit",
      locationName: "Gokarna"
    });

    const parsed = new URL(gCalUrl);
    const details = parsed.searchParams.get("details") || "";
    const location = parsed.searchParams.get("location") || "";

    // No raw HTML tags in details
    expect(details).not.toContain("<a href=");
    expect(details).toContain("🔴");
    expect(details).toContain("https://");

    // Location is sacred kshetra, not URL
    expect(location).not.toContain("https://");
    expect(location).toContain("ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ · Gokarna");
  });

  it("ensures multi-language red click items exist for kn, te, hi, ta, en", () => {
    const langs = ["kn", "te", "hi", "ta", "en"] as const;
    for (const l of langs) {
      const ics = generateSevaICalendarString({
        days: [sampleDay],
        lang: l,
        personName: "Devotee Test",
        panditName: "Shreeram Pandit"
      });
      expect(ics).toContain("🔴");
      expect(ics).toContain("URL;VALUE=URI:https://");
      expect(ics).not.toContain("LOCATION:https://");
    }
  });

  it("ensures both .ics and Google Calendar include 4 Actionable Guidance points (🚗, 💰, 🧠, 🪔)", () => {
    const ics = generateSevaICalendarString({
      days: [sampleDay],
      lang: "kn",
      personName: "Devotee Test",
      panditName: "Shreeram Pandit"
    });

    expect(ics).toContain("🚗");
    expect(ics).toContain("💰");
    expect(ics).toContain("🧠");
    expect(ics).toContain("🪔");
    expect(ics).toContain("ಭವಿಷ್ಯದ ಪ್ರಮುಖ ೪ ಮಾರ್ಗದರ್ಶನಗಳು");

    const gCalUrl = generateGoogleCalendarUrl({
      day: sampleDay,
      lang: "kn",
      panditName: "Shreeram Pandit",
      locationName: "Gokarna"
    });

    const parsed = new URL(gCalUrl);
    const details = parsed.searchParams.get("details") || "";

    expect(details).toContain("🚗");
    expect(details).toContain("💰");
    expect(details).toContain("🧠");
    expect(details).toContain("🪔");
    expect(details).toContain("ಭವಿಷ್ಯದ ಪ್ರಮುಖ ೪ ಮಾರ್ಗದರ್ಶನಗಳು");
  });

  it("ensures sanctumUrl is isolated by newlines in both .ics and Google Calendar for seamless 1-tap mobile clicks", () => {
    const ics = generateSevaICalendarString({
      days: [sampleDay],
      lang: "kn",
      personName: "Devotee Test",
      panditName: "Shreeram Pandit"
    });

    // In ICS text, newlines are escaped as \n. Ensure the URL has empty line before and after
    expect(ics).toMatch(/\\n\\nhttps:\/\/[^\s\\]+\\n\\n/);

    const gCalUrl = generateGoogleCalendarUrl({
      day: sampleDay,
      lang: "kn",
      panditName: "Shreeram Pandit",
      locationName: "Gokarna"
    });

    const parsed = new URL(gCalUrl);
    const details = parsed.searchParams.get("details") || "";

    // In Google Calendar URL details, the URL is isolated with \n\n before and \n\n after
    expect(details).toMatch(/\n\nhttps:\/\/[^\s]+\n\n/);
    expect(details).toContain("tab=bhavishya");
  });

  it("ensures Google Calendar URL displays priest phone override in details when overrideCalendarPhone is active", () => {
    const customPriest = "ವೇ.ಮೂ. ಶ್ರೀ ಕೃಷ್ಣ ಭಟ್";
    const customPhone = "9845123456";

    const gCalUrl = generateGoogleCalendarUrl({
      day: sampleDay,
      lang: "kn",
      panditName: customPriest,
      priestPhone: customPhone,
      overrideCalendarPhone: true
    });

    const parsed = new URL(gCalUrl);
    const details = parsed.searchParams.get("details") || "";

    expect(details).toContain(customPhone);
    expect(details).toContain(`(📞 ${customPhone})`);
  });
});
