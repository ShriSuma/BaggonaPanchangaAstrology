import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../features/auth/authStore";
import {
  getOmkarZipFileName,
  getOmkarWhatsAppShareUrl,
  packageOmkarPremiumZip
} from "../features/omkarDesk/omkarDeskService";

describe("Omkar Hotel Reception Desk Operator Auth & Portal Guard", () => {
  beforeEach(async () => {
    const store = useAuthStore.getState();
    await store.logout();
  });

  it("authenticates operator 'omkar' with default password 'Omkar@Baggona2026' without MFA OTP and without force reset", async () => {
    const store = useAuthStore.getState();
    
    // Login as omkar
    const result = await store.login("omkar", "Omkar@Baggona2026");

    expect(result.success).toBe(true);
    expect(result.requiresMfa).toBeFalsy();
    expect(result.requiresPasswordChange).toBeFalsy();

    const updated = useAuthStore.getState();
    expect(updated.isAuthenticated).toBe(true);
    expect(updated.currentUser?.toLowerCase()).toBe("omkar");
    expect(updated.role).toBe("priest");
    expect(updated.step).toBe("credentials");
  });

  it("authenticates operator 'omkar' case-insensitively with 'omkar123' or 'omkar@123'", async () => {
    const store = useAuthStore.getState();

    // Test with omkar123
    const res1 = await store.login("Omkar", "omkar123");
    expect(res1.success).toBe(true);
    expect(res1.requiresMfa).toBeFalsy();

    await store.logout();

    // Test with omkar@123
    const res2 = await store.login("OMKAR", "omkar@123");
    expect(res2.success).toBe(true);
    expect(res2.requiresMfa).toBeFalsy();
  });

  it("rejects invalid password for 'omkar'", async () => {
    const store = useAuthStore.getState();
    const result = await store.login("omkar", "WrongPassword123");

    expect(result.success).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  describe("Omkar Premium ZIP Download & WhatsApp Integration", () => {
    it("generates exact file name: [DevoteeName]_bhagoda_Pancha_creation.zip", () => {
      expect(getOmkarZipFileName("Ramesh Hegde")).toBe("Ramesh_Hegde_bhagoda_Pancha_creation.zip");
      expect(getOmkarZipFileName("Pandit Suresh")).toBe("Pandit_Suresh_bhagoda_Pancha_creation.zip");
      expect(getOmkarZipFileName("")).toBe("Devotee_bhagoda_Pancha_creation.zip");
      expect(getOmkarZipFileName("  ರಮೇಶ್ ಹೆಗಡೆ  ")).toBe("ರಮೇಶ್_ಹೆಗಡೆ_bhagoda_Pancha_creation.zip");
    });

    it("generates WhatsApp share URL with pre-filled message and devotee metadata", () => {
      const url = getOmkarWhatsAppShareUrl({
        whatsappNumber: "9845012345",
        devoteeName: "Ramesh Hegde",
        zipFileName: "Ramesh_Hegde_bhagoda_Pancha_creation.zip",
        birthDate: "1995-05-15",
        birthTime: "10:30",
        place: "Gokarna",
        selectedOptions: [
          "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನನ ಕುಂಡಲಿ",
          "ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ ವರದಿ V1",
          "ದೈವಿಕ ಪರಿಹಾರ ವರದಿ"
        ]
      });

      expect(url).toContain("https://api.whatsapp.com/send?phone=919845012345");
      expect(url).toContain(encodeURIComponent("Ramesh_Hegde_bhagoda_Pancha_creation.zip"));
      expect(url).toContain(encodeURIComponent("9972339362"));
      expect(url).toContain(encodeURIComponent("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"));
    });

    it("packages all 3 selected options (Janana Kundali, Bhavishya V1, Remedy) into ZIP", async () => {
      const dummyBlob1 = new Uint8Array([1, 2, 3]);
      const dummyBlob2 = new Uint8Array([4, 5, 6]);
      const dummyBlob3 = new Uint8Array([7, 8, 9]);

      let progressTriggered = false;
      const res = await packageOmkarPremiumZip({
        devoteeName: "Ramesh Hegde",
        jananaKundliBlob: dummyBlob1,
        bhavishyaV1Blob: dummyBlob2,
        remedyBlob: dummyBlob3,
        onProgress: (pct) => {
          if (pct > 0) progressTriggered = true;
        }
      });

      expect(res.zipFileName).toBe("Ramesh_Hegde_bhagoda_Pancha_creation.zip");
      expect(res.includedFiles).toHaveLength(3);
      expect(res.includedFiles).toContain("01_Ramesh_Hegde_Baggona_Janana_Kundali.pdf");
      expect(res.includedFiles).toContain("02_Ramesh_Hegde_Baggona_Bhavishya_V1.pdf");
      expect(res.includedFiles).toContain("03_Ramesh_Hegde_Baggona_Remedy.pdf");
      expect(res.zipBlob).toBeDefined();
      expect(progressTriggered).toBe(true);
    });

    it("packages only 2 selected options when 1 option is unchecked", async () => {
      const dummyBlob1 = new Uint8Array([1, 2, 3]);
      const dummyBlob3 = new Uint8Array([7, 8, 9]);

      const res = await packageOmkarPremiumZip({
        devoteeName: "Suresh Pai",
        jananaKundliBlob: dummyBlob1,
        bhavishyaV1Blob: null,
        remedyBlob: dummyBlob3
      });

      expect(res.zipFileName).toBe("Suresh_Pai_bhagoda_Pancha_creation.zip");
      expect(res.includedFiles).toHaveLength(2);
      expect(res.includedFiles).toContain("01_Suresh_Pai_Baggona_Janana_Kundali.pdf");
      expect(res.includedFiles).toContain("03_Suresh_Pai_Baggona_Remedy.pdf");
      expect(res.includedFiles).not.toContain("02_Suresh_Pai_Baggona_Bhavishya_V1.pdf");
    });

    it("throws an error when no reports are selected", async () => {
      await expect(
        packageOmkarPremiumZip({
          devoteeName: "Test Devotee",
          jananaKundliBlob: null,
          bhavishyaV1Blob: null,
          remedyBlob: null
        })
      ).rejects.toThrow(/ಯಾವುದೇ ವರದಿ ಆಯ್ಕೆಯಾಗಿಲ್ಲ/);
    });
  });
});
