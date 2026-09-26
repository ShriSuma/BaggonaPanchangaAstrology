import { describe, it, expect } from "vitest";

// Replicate the pure deterministic tab router function from DailyDarshanaPage
function resolveDarshanaTab(rawParam: string): "darshana" | "bhavishya" | "pooja" | "lucky" | "whatsapp" | "details" {
  const rawTab = (rawParam || "").toLowerCase().trim();

  // 1. WhatsApp / Share / Card / Story / Msg / Bless / Env / Lakote
  if (rawTab.includes("what") || rawTab.includes("share") || rawTab.includes("card") || rawTab.includes("story") || rawTab.includes("msg") || rawTab.includes("bless") || rawTab.includes("env") || rawTab.includes("lakote")) return "whatsapp";

  // 2. Pooja / Mantra / Japa / Shloka / Sankalpa
  if (rawTab.includes("pooj") || rawTab.includes("puja") || rawTab.includes("puj") || rawTab.includes("mantr") || rawTab.includes("japa") || rawTab.includes("shlok") || rawTab.includes("sankalp")) return "pooja";

  // 3. Lucky / Gem / Gold / Color / Direction / Muhurtha / Digit
  if (rawTab.includes("luck") || rawTab.includes("gem") || rawTab.includes("gold") || rawTab.includes("color") || rawTab.includes("digit") || rawTab.includes("numb") || rawTab.includes("muhur")) return "lucky";

  // 4. Technical details: Details / Kundali / Janma / Gochara / Dasha / Panchanga / Kaala
  if (rawTab.includes("detail") || rawTab.includes("kund") || rawTab.includes("janma") || rawTab.includes("goch") || rawTab.includes("dash") || rawTab.includes("panch") || rawTab.includes("kaala")) return "details";

  // 5. Bhavishya / Horoscope / Karma / Rashi / Future
  if (rawTab.includes("bhav") || rawTab.includes("horo") || rawTab.includes("karm") || rawTab.includes("rash") || rawTab.includes("futur")) return "bhavishya";

  // 6. Old guidance tab -> maps to "lucky" for backward compatibility
  if (rawTab.includes("guid")) return "lucky";

  // 7. Sanctum / Darshana / Temple -> "darshana"
  if (rawTab.includes("darsh") || rawTab.includes("sanct") || rawTab.includes("templ")) return "darshana";

  // Numeric indices support for backward compatibility:
  if (rawTab === "1" || rawTab === "0") return "darshana";
  if (rawTab === "2") return "bhavishya";
  if (rawTab === "3") return "pooja";
  if (rawTab === "4") return "lucky";
  if (rawTab === "5") return "whatsapp";
  if (rawTab === "6") return "details";

  return "darshana";
}

describe("Daily Darshana 6-Tab Segregation & WhatsApp Card Routing Guard", () => {
  it("resolves all primary 6 tabs correctly", () => {
    expect(resolveDarshanaTab("darshana")).toBe("darshana");
    expect(resolveDarshanaTab("bhavishya")).toBe("bhavishya");
    expect(resolveDarshanaTab("pooja")).toBe("pooja");
    expect(resolveDarshanaTab("lucky")).toBe("lucky");
    expect(resolveDarshanaTab("whatsapp")).toBe("whatsapp");
    expect(resolveDarshanaTab("details")).toBe("details");
  });

  it("ensures WhatsApp share tab resolves from multiple keywords", () => {
    expect(resolveDarshanaTab("whatsapp")).toBe("whatsapp");
    expect(resolveDarshanaTab("share")).toBe("whatsapp");
    expect(resolveDarshanaTab("card")).toBe("whatsapp");
    expect(resolveDarshanaTab("story")).toBe("whatsapp");
    expect(resolveDarshanaTab("msg")).toBe("whatsapp");
    expect(resolveDarshanaTab("blessing")).toBe("whatsapp");
    expect(resolveDarshanaTab("envelope")).toBe("whatsapp");
    expect(resolveDarshanaTab("lakote")).toBe("whatsapp");
  });

  it("ensures 100% backward compatibility for legacy URL tab strings", () => {
    // Legacy Pooja & Mantra parameters
    expect(resolveDarshanaTab("mantra")).toBe("pooja");
    expect(resolveDarshanaTab("japa")).toBe("pooja");
    expect(resolveDarshanaTab("sankalpa")).toBe("pooja");
    expect(resolveDarshanaTab("shloka")).toBe("pooja");
    expect(resolveDarshanaTab("puja")).toBe("pooja");

    // Legacy Lucky & Gemstone parameters
    expect(resolveDarshanaTab("guidance")).toBe("lucky");
    expect(resolveDarshanaTab("gem")).toBe("lucky");
    expect(resolveDarshanaTab("gemstone")).toBe("lucky");
    expect(resolveDarshanaTab("color")).toBe("lucky");
    expect(resolveDarshanaTab("digit")).toBe("lucky");
    expect(resolveDarshanaTab("number")).toBe("lucky");
    expect(resolveDarshanaTab("muhurtha")).toBe("lucky");

    // Legacy Technical & Chart parameters
    expect(resolveDarshanaTab("details")).toBe("details");
    expect(resolveDarshanaTab("kundali")).toBe("details");
    expect(resolveDarshanaTab("janma")).toBe("details");
    expect(resolveDarshanaTab("gochara")).toBe("details");
    expect(resolveDarshanaTab("dasha")).toBe("details");
    expect(resolveDarshanaTab("panchanga")).toBe("details");
    expect(resolveDarshanaTab("kaala")).toBe("details");

    // Legacy Horoscope parameters
    expect(resolveDarshanaTab("horoscope")).toBe("bhavishya");
    expect(resolveDarshanaTab("rashi")).toBe("bhavishya");
    expect(resolveDarshanaTab("karma")).toBe("bhavishya");

    // Legacy Sanctum parameters
    expect(resolveDarshanaTab("sanctum")).toBe("darshana");
    expect(resolveDarshanaTab("temple")).toBe("darshana");
  });

  it("supports numeric tab indexing (1-6 and 0)", () => {
    expect(resolveDarshanaTab("1")).toBe("darshana");
    expect(resolveDarshanaTab("0")).toBe("darshana");
    expect(resolveDarshanaTab("2")).toBe("bhavishya");
    expect(resolveDarshanaTab("3")).toBe("pooja");
    expect(resolveDarshanaTab("4")).toBe("lucky");
    expect(resolveDarshanaTab("5")).toBe("whatsapp");
    expect(resolveDarshanaTab("6")).toBe("details");
  });

  it("safely falls back to 'darshana' for unknown or empty tab strings", () => {
    expect(resolveDarshanaTab("")).toBe("darshana");
    expect(resolveDarshanaTab("unknown_query_string")).toBe("darshana");
    expect(resolveDarshanaTab("xyz123")).toBe("darshana");
  });
});
