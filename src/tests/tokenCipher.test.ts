import { describe, it, expect } from "vitest";
import { encodeDevoteeToken, decodeDevoteeToken, DevoteeTokenPayload } from "../utils/tokenCipher";

describe("tokenCipher Security & Privacy Engine", () => {
  it("encodes and decodes devotee payload accurately", () => {
    const payload: DevoteeTokenPayload = {
      name: "Pramod Bhat",
      nakshatra: 12, // Hasta
      rashi: 5,     // Kanya
      gotra: "Kashyapa",
      pandit: "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್",
      date: "2026-08-14",
      lang: "kn",
      sevaType: "rudrabhisheka",
      platform: "android",
      target: "google"
    };

    const token = encodeDevoteeToken(payload);
    expect(token).toMatch(/^bgn_v1_/);
    // Ensure raw personal strings are NOT plainly visible in the token
    expect(token).not.toContain("Pramod");
    expect(token).not.toContain("Kashyapa");

    const decoded = decodeDevoteeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.name).toBe("Pramod Bhat");
    expect(decoded?.nakshatra).toBe(12);
    expect(decoded?.rashi).toBe(5);
    expect(decoded?.gotra).toBe("Kashyapa");
    expect(decoded?.pandit).toBe("ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್");
    expect(decoded?.date).toBe("2026-08-14");
    expect(decoded?.lang).toBe("kn");
    expect(decoded?.sevaType).toBe("rudrabhisheka");
    expect(decoded?.platform).toBe("android");
    expect(decoded?.target).toBe("google");
  });

  it("handles complex Indic Unicode scripts (Kannada, Telugu, Tamil, Hindi)", () => {
    const payload: DevoteeTokenPayload = {
      name: "ಪ್ರಮೋದ ಕುಮಾರ್ / సురేష్ / ரமேஷ் / अमित",
      gotra: "ಕೌಶಿಕ ಗೋತ್ರ",
      pandit: "ವೇ| ಬ್ರ| ಶ್ರೀ ಸೀತಾರಾಮ ಭಟ್ಟ",
      date: "2026-09-01",
      lang: "kn",
      target: "sanctum"
    };

    const token = encodeDevoteeToken(payload);
    const decoded = decodeDevoteeToken(token);
    expect(decoded?.name).toBe("ಪ್ರಮೋದ ಕುಮಾರ್ / సురేష్ / ரமேஷ் / अमित");
    expect(decoded?.gotra).toBe("ಕೌಶಿಕ ಗೋತ್ರ");
    expect(decoded?.pandit).toBe("ವೇ| ಬ್ರ| ಶ್ರೀ ಸೀತಾರಾಮ ಭಟ್ಟ");
  });

  it("rejects tampered tokens with checksum failure", () => {
    const payload: DevoteeTokenPayload = {
      name: "Devotee User",
      pandit: "Chaitanya Pandit",
      date: "2026-08-14",
      lang: "en"
    };

    const token = encodeDevoteeToken(payload);
    // Tamper with a character in the token body
    const tamperedToken = token.slice(0, -3) + "xyz";
    const decoded = decodeDevoteeToken(tamperedToken);
    expect(decoded).toBeNull();
  });

  it("handles empty or garbage token strings gracefully", () => {
    expect(decodeDevoteeToken("")).toBeNull();
    expect(decodeDevoteeToken("invalid_random_string")).toBeNull();
    expect(decodeDevoteeToken("bgn_v1_broken")).toBeNull();
  });
});
