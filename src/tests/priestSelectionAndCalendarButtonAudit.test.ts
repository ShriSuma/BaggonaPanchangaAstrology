import { describe, it, expect } from "vitest";
import { getPriestProfile, PREDEFINED_PRIESTS } from "../features/seva/sevaPriestDirectory";
import { getLocalizedPanditName } from "../features/seva/sevaPresentation";
import {
  generateSevaICalendarString,
  generateGoogleCalendarUrl,
  calculateDeterministicRhythmDay
} from "../features/seva/icsCalendarGenerator";

describe("Priest Selection, Telugu Conversion & Single Button Calendar Audit", () => {
  it("verifies Ravi Jambe has authentic Telugu script and dedicated phone number", () => {
    const ravi = getPriestProfile("ravi-jambe");
    expect(ravi.name.te).toBe("రవి జంబె");
    expect(ravi.name.kn).toBe("ರವಿ ಜಂಬೆ");
    expect(ravi.name.ta).toBe("ரவி ஜம்பே");
    expect(ravi.phone).toBe("9481234567");
  });

  it("verifies Gopala Jambe has authentic Telugu script and dedicated phone number", () => {
    const gopala = getPriestProfile("gopala-jambe");
    expect(gopala.name.te).toBe("గోపాల జంబె");
    expect(gopala.name.kn).toBe("ಗೋಪಾಲ ಜಂಬೆ");
    expect(gopala.phone).toBe("9482345678");
  });

  it("converts priest name dynamically across languages", () => {
    expect(getLocalizedPanditName("ravi-jambe", "te")).toBe("రవి జంబె");
    expect(getLocalizedPanditName("ರವಿ ಜಂಬೆ", "te")).toBe("రవి జంబె");
    expect(getLocalizedPanditName("ravi-jambe", "ta")).toBe("ரவி ஜம்பே");
    expect(getLocalizedPanditName("ravi-jambe", "hi")).toBe("रवि जंबे");
    expect(getLocalizedPanditName("ravi-jambe", "kn")).toBe("ರವಿ ಜಂಬೆ");
    expect(getLocalizedPanditName("ravi-jambe", "en")).toBe("Ravi Jambe");
  });

  it("generates calendar event with single URL and exact button text in Kannada and Telugu", () => {
    const day = calculateDeterministicRhythmDay("2026-09-26", 18, 8, "2026-09-26");

    // Kannada
    const icsKn = generateSevaICalendarString({
      days: [day],
      lang: "kn",
      panditName: "ರವಿ ಜಂಬೆ",
      priestPhone: "9481234567",
      notificationTime: "08:00",
      personName: "ಸುರೇಶ್"
    });

    // Check Kannada button text
    expect(icsKn).toContain("ದಿನದ ಸಂಪೂರ್ಣ ಭವಿಷ್ಯವನ್ನು ತಿಳಿದುಕೊಳ್ಳಿ");
    // Verify redirection URL includes priestName
    expect(icsKn).toContain(encodeURIComponent("ರವಿ ಜಂಬೆ"));

    // Telugu
    const icsTe = generateSevaICalendarString({
      days: [day],
      lang: "te",
      panditName: "రవి జంబె",
      priestPhone: "9481234567",
      notificationTime: "08:00",
      personName: "సురేష్"
    });

    // Check Telugu button text
    expect(icsTe).toContain("దిన సంపూర్ణ భవిష్యత్తును తెలుసుకోండి");
    // Verify Telugu priest name is in URL
    expect(icsTe).toContain(encodeURIComponent("రవి జంబె"));

    // Verify alarms are localized in Telugu, NOT hardcoded Kannada
    expect(icsTe).toContain("ఘంటానాదం");
    expect(icsTe).toContain("దైనందిన దర్శనం");
    expect(icsTe).not.toContain("ಮುಂಜಾನೆ ಪಂಚಾಂಗ ಜ್ಞಾಪನೆ");
  });

  it("ensures Google Calendar Web Intent description has ONLY ONE single clickable URL at the top", () => {
    const day = calculateDeterministicRhythmDay("2026-09-26", 18, 8, "2026-09-26");
    const gCalUrl = generateGoogleCalendarUrl({
      day,
      lang: "te",
      panditName: "రవి జంబె",
      priestPhone: "9481234567",
      notificationTime: "08:00",
      personName: "రమేష్"
    });

    const parsed = new URL(gCalUrl);
    const details = parsed.searchParams.get("details") || "";

    // Button label present at top
    expect(details).toContain("దిన సంపూర్ణ భవిష్యత్తును తెలుసుకోండి");
    expect(details).toContain(encodeURIComponent("రవి జంబె"));

    // Count URLs in details
    const urlMatches = details.match(/https?:\/\/[^\s]+/g) || [];
    expect(urlMatches.length).toBe(1);

    // Verify duplicate 90-Day ICS link is removed from event description
    expect(details).not.toContain("90-Day ICS Calendar Import");
  });
});
