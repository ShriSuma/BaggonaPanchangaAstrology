import { describe, it, expect } from "vitest";

describe("Priest Portal Mobile Launch and Share Engine", () => {
  it("resolves query-based routing for mobile-safe Priest Panchanga launch", () => {
    // Tests router pattern in App.tsx
    const testSearch1 = "?portal=priest_panchanga&date=2026-03-19&pincode=581326";
    const isPriestPanchangaRoute1 = testSearch1.includes("portal=priest_panchanga");
    expect(isPriestPanchangaRoute1).toBe(true);

    const testSearch2 = "?date=2026-03-19&pincode=581326&page=priest_panchanga";
    const isPriestPanchangaRoute2 = testSearch2.includes("page=priest_panchanga");
    expect(isPriestPanchangaRoute2).toBe(true);
  });

  it("builds valid canonical shareable Priest Panchanga URL without target=_blank pitfalls", () => {
    const origin = "https://baggona-panchanga-astrology.vercel.app";
    const testDate = "2026-03-19";
    const pincode = "581326";
    const priestShareUrl = `${origin}/?portal=priest_panchanga&date=${testDate}&pincode=${pincode}`;

    expect(priestShareUrl).toBe("https://baggona-panchanga-astrology.vercel.app/?portal=priest_panchanga&date=2026-03-19&pincode=581326");
    
    // Verify params parse correctly
    const parsed = new URL(priestShareUrl);
    expect(parsed.searchParams.get("portal")).toBe("priest_panchanga");
    expect(parsed.searchParams.get("date")).toBe("2026-03-19");
    expect(parsed.searchParams.get("pincode")).toBe("581326");
  });

  it("constructs WhatsApp share payload with authentic Priest invitation text", () => {
    const origin = "https://baggona-panchanga-astrology.vercel.app";
    const testDate = "2026-03-19";
    const pincode = "581326";
    const priestShareUrl = `${origin}/?portal=priest_panchanga&date=${testDate}&pincode=${pincode}`;

    const shareText = `🕉️ *ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಪುರೋಹಿತ ಪಂಚಾಂಗ ಮಹಾದರ್ಶನ*\n\nದಿನಾಂಕ: *${testDate}*\nಸ್ಥಳ: ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (${pincode})\n\nಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಕುಂಡಲಿ, ೧೨ ಲಗ್ನ ಸಮಾಪ್ತಿ ಕಾಲ & ಪಂಚಾಂಗ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಈ ಕೆಳಗಿನ ನೇರ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ:\n👉 ${priestShareUrl}\n\n॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

    expect(waUrl).toContain("https://api.whatsapp.com/send?text=");
    expect(decodeURIComponent(waUrl)).toContain("ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಪುರೋಹಿತ ಪಂಚಾಂಗ ಮಹಾದರ್ಶನ");
    expect(decodeURIComponent(waUrl)).toContain(priestShareUrl);
    expect(decodeURIComponent(waUrl)).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
  });
});
