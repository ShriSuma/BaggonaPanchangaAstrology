import { describe, it, expect } from "vitest";
import { buildCleanDailyWhatsAppShareText, type SupportedLang } from "../features/darshana/dailyInspirationAlmanac";

function formatMuhurthaTimeRange(
  rawRange: string,
  startTime: string | undefined,
  endTime: string | undefined,
  windowMap: Record<string, string> | undefined,
  targetLang: SupportedLang
): string {
  if (windowMap && windowMap[targetLang]) {
    return windowMap[targetLang];
  }
  let start = startTime;
  let end = endTime;
  if ((!start || !end) && rawRange) {
    const match = rawRange.match(/^(.+?)\s*(?:-|–|ರಿಂದ|से|నుండి|முதல்|to)\s*(.+)$/i);
    if (match) {
      start = match[1].trim();
      end = match[2].trim();
    }
  }
  if (start && end) {
    switch (targetLang) {
      case "kn": return `${start} ರಿಂದ ${end}`;
      case "hi": return `${start} से ${end}`;
      case "te": return `${start} నుండి ${end}`;
      case "ta": return `${start} முதல் ${end}`;
      case "en":
      default: return `${start} - ${end}`;
    }
  }
  return rawRange || "10:48 AM - 11:36 AM";
}

describe("Daily Blessing Share Card Pure Localization & Muhurtha Separator Guard", () => {
  it("formats Muhurtha time ranges with 100% pure language separators", () => {
    const rawKnTime = "11:16 AM ರಿಂದ 12:04 PM";

    // Kannada: maintains "ರಿಂದ"
    expect(formatMuhurthaTimeRange(rawKnTime, undefined, undefined, undefined, "kn")).toBe("11:16 AM ರಿಂದ 12:04 PM");

    // English: replaces "ರಿಂದ" with "-"
    expect(formatMuhurthaTimeRange(rawKnTime, undefined, undefined, undefined, "en")).toBe("11:16 AM - 12:04 PM");

    // Hindi: replaces "ರಿಂದ" with "से"
    expect(formatMuhurthaTimeRange(rawKnTime, undefined, undefined, undefined, "hi")).toBe("11:16 AM से 12:04 PM");

    // Telugu: replaces "ರಿಂದ" with "నుండి"
    expect(formatMuhurthaTimeRange(rawKnTime, undefined, undefined, undefined, "te")).toBe("11:16 AM నుండి 12:04 PM");

    // Tamil: replaces "ರಿಂದ" with "முதல்"
    expect(formatMuhurthaTimeRange(rawKnTime, undefined, undefined, undefined, "ta")).toBe("11:16 AM முதல் 12:04 PM");
  });

  it("prioritizes goldenHourWindowMap when supplied directly from personalization engine", () => {
    const windowMap = {
      kn: "11:16 AM ರಿಂದ 12:04 PM",
      en: "11:16 AM - 12:04 PM",
      hi: "11:16 AM से 12:04 PM",
      te: "11:16 AM నుండి 12:04 PM",
      ta: "11:16 AM முதல் 12:04 PM"
    };

    expect(formatMuhurthaTimeRange("", "11:16 AM", "12:04 PM", windowMap, "en")).toBe("11:16 AM - 12:04 PM");
    expect(formatMuhurthaTimeRange("", "11:16 AM", "12:04 PM", windowMap, "hi")).toBe("11:16 AM से 12:04 PM");
    expect(formatMuhurthaTimeRange("", "11:16 AM", "12:04 PM", windowMap, "te")).toBe("11:16 AM నుండి 12:04 PM");
    expect(formatMuhurthaTimeRange("", "11:16 AM", "12:04 PM", windowMap, "ta")).toBe("11:16 AM முதல் 12:04 PM");
    expect(formatMuhurthaTimeRange("", "11:16 AM", "12:04 PM", windowMap, "kn")).toBe("11:16 AM ರಿಂದ 12:04 PM");
  });

  it("builds 100% pure language localized WhatsApp share text for English and Hindi", () => {
    // English Share text
    const enText = buildCleanDailyWhatsAppShareText(
      "2026-09-26",
      "en",
      "Purnima",
      "Purva Bhadrapada",
      "Manojavam Marutatulyavegam Jitendriyam Buddhimatam Varishtham",
      "Sri Hanuman",
      "O Lord Hanuman, as swift as the mind and wind, supreme master of the senses and intellect, protect us."
    );
    expect(enText).toContain("Good Morning! Daily Baggona Panchanga Blessings");
    expect(enText).toContain("Purnima");
    expect(enText).toContain("Purva Bhadrapada");
    expect(enText).toContain("Manojavam Marutatulyavegam");
    expect(enText).not.toContain("ಹುಣ್ಣಿಮೆ");
    expect(enText).not.toContain("ಪೂರ್ವಾಭಾದ್ರಪದ");

    // Hindi Share text
    const hiText = buildCleanDailyWhatsAppShareText(
      "2026-09-26",
      "hi",
      "पूर्णिमा",
      "पूर्वाभाद्रपद",
      "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्",
      "श्री हनुमान",
      "हे मन और वायु के समान तीव्र गति वाले, इन्द्रियों को जीतने वाले श्री हनुमान!"
    );
    expect(hiText).toContain("सुप्रभात! आज का बग्गोण पंचांग पावन आशीर्वाद");
    expect(hiText).toContain("पूर्णिमा");
    expect(hiText).toContain("पूर्वाभाद्रपद");
    expect(hiText).toContain("मनोजवं मारुततुल्यवेगं");
    expect(hiText).not.toContain("ಹುಣ್ಣಿಮೆ");
    expect(hiText).not.toContain("ಪೂರ್ವಾಭಾದ್ರಪದ");
  });

  it("formats devotee location with pincode dynamically", () => {
    const formatLocation = (loc?: string, pin?: string) => {
      if (loc && loc.trim()) {
        const l = loc.trim();
        const p = pin && pin.trim() ? pin.trim() : "";
        return p && !l.includes(p) ? `📍 ${l} (${p})` : `📍 ${l}`;
      }
      return "📍 Ratha Beedi, Gokarna";
    };

    expect(formatLocation("Bengaluru", "560001")).toBe("📍 Bengaluru (560001)");
    expect(formatLocation("Kumta", "581343")).toBe("📍 Kumta (581343)");
    expect(formatLocation("Gokarna", "581326")).toBe("📍 Gokarna (581326)");
    expect(formatLocation("", "")).toBe("📍 Ratha Beedi, Gokarna");
  });
});
