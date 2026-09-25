import { describe, it, expect } from "vitest";
import { parseSpokenPhoneNumber } from "../utils/speechRecognitionHelper";
import { getPriestProfile } from "../features/seva/sevaPriestDirectory";

describe("Priest Edit & Spoken Voice Recognition Tests", () => {
  describe("parseSpokenPhoneNumber", () => {
    it("parses Kannada spoken digits into clean 10-digit phone number", () => {
      // 9972339362 in Kannada words
      const spoken = "ಒಂಬತ್ತು ಒಂಬತ್ತು ಏಳು ಎರಡು ಮೂರು ಮೂರು ಒಂಬತ್ತು ಮೂರು ಆರು ಎರಡು";
      expect(parseSpokenPhoneNumber(spoken)).toBe("9972339362");
    });

    it("parses English spoken digits into clean 10-digit phone number", () => {
      const spoken = "nine nine seven two three three nine three six two";
      expect(parseSpokenPhoneNumber(spoken)).toBe("9972339362");
    });

    it("parses Hindi spoken digits into clean 10-digit phone number", () => {
      const spoken = "नौ नौ सात दो तीन तीन नौ तीन छह दो";
      expect(parseSpokenPhoneNumber(spoken)).toBe("9972339362");
    });

    it("parses Telugu spoken digits into clean 10-digit phone number", () => {
      const spoken = "తొమ్మిది తొమ్మిది ఏడు రెండు మూడు మూడు తొమ్మిది మూడు ఆరు రెండు";
      expect(parseSpokenPhoneNumber(spoken)).toBe("9972339362");
    });

    it("cleans raw spoken digits with +91 and spaces", () => {
      const spoken = "+91 99723 39362";
      expect(parseSpokenPhoneNumber(spoken)).toBe("9972339362");
    });

    it("returns empty string if no digits are present", () => {
      expect(parseSpokenPhoneNumber("ನಮಸ್ಕಾರ ಶುಭ ದಿನ")).toBe("");
    });
  });

  describe("Priest Default vs Override Determinism", () => {
    const defaultPriest = getPriestProfile("shreeram-pandit");

    it("guarantees default priest is Shreeram Pandit with phone 9972339362", () => {
      expect(defaultPriest.name.kn).toBe("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(defaultPriest.phone).toBe("9972339362");
    });

    it("correctly handles override resolution when user edits details", () => {
      const resolvePriestInfo = (override: boolean, customName: string, customPhone: string) => {
        if (!override) {
          return {
            name: defaultPriest.name.kn,
            phone: "9972339362",
            isOverridden: false
          };
        }
        return {
          name: customName.trim() || defaultPriest.name.kn,
          phone: customPhone.trim() || "9972339362",
          isOverridden: true
        };
      };

      // Test default case
      const def = resolvePriestInfo(false, "ವಿದ್ವಾನ್ ಕೃಷ್ಣ ಶರ್ಮಾ", "9845012345");
      expect(def.name).toBe("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(def.phone).toBe("9972339362");
      expect(def.isOverridden).toBe(false);

      // Test overridden case
      const overridden = resolvePriestInfo(true, "ವಿದ್ವಾನ್ ಕೃಷ್ಣ ಶರ್ಮಾ", "9845012345");
      expect(overridden.name).toBe("ವಿದ್ವಾನ್ ಕೃಷ್ಣ ಶರ್ಮಾ");
      expect(overridden.phone).toBe("9845012345");
      expect(overridden.isOverridden).toBe(true);
    });
  });
});
