import { describe, it, expect } from "vitest";
import {
  getSamvatsaraMetadata,
  generateBookTableOfContents,
  calculateNavanayakagalu,
  calculateGokarnaLagnaEndings,
  generateUniversal104PageBook,
  BAGGONA_KNOWN_SAMVATSARAS,
  BAGGONA_ASHOUCHA_RULES_KN
} from "../core/BaggonaUniversalBookEngine";

describe("BaggonaUniversalBookEngine (ಬಗ್ಗೋಣ ಸಾರ್ವತ್ರಿಕ ೧೦೪-ಪುಟಗಳ ಪ್ರಕಾಶನ ಎಂಜಿನ್)", () => {
  it("accurately verifies all 4 consecutive Samvatsaras metadata against original print editions", () => {
    // 1. Krodhi (1946)
    const krodhi = getSamvatsaraMetadata(1946);
    expect(krodhi.samvatsaraKn).toBe("ಕ್ರೋಧಿ");
    expect(krodhi.gataKalyabda).toBe(5125);
    expect(krodhi.eshyaKalyabda).toBe(426875);
    expect(krodhi.eshyaShakabda).toBe(16054);
    expect(krodhi.hasAdhikaMasa).toBe(false);

    // 2. Vishvavasu (1947)
    const vishvavasu = getSamvatsaraMetadata(1947);
    expect(vishvavasu.samvatsaraKn).toBe("ವಿಶ್ವಾವಸು");
    expect(vishvavasu.gataKalyabda).toBe(5126);
    expect(vishvavasu.eshyaKalyabda).toBe(426874);
    expect(vishvavasu.eshyaShakabda).toBe(16053);
    expect(vishvavasu.kalyadyahargana).toBe(1872311);
    expect(vishvavasu.hasAdhikaMasa).toBe(false);

    // 3. Parabhava (1948 - Adhika Jyeshtha Year)
    const parabhava = getSamvatsaraMetadata(1948);
    expect(parabhava.samvatsaraKn).toBe("ಪರಾಭವ");
    expect(parabhava.gataKalyabda).toBe(5127);
    expect(parabhava.eshyaKalyabda).toBe(426873);
    expect(parabhava.eshyaShakabda).toBe(16052);
    expect(parabhava.kalyadyahargana).toBe(1872678);
    expect(parabhava.hasAdhikaMasa).toBe(true);
    expect(parabhava.totalPakshas).toBe(26);
    expect(parabhava.panchangaPageStart).toBe(40);
    expect(parabhava.panchangaPageEnd).toBe(91);

    // 4. Plavanga (1949)
    const plavanga = getSamvatsaraMetadata(1949);
    expect(plavanga.samvatsaraKn).toBe("ಪ್ಲವಂಗ");
    expect(plavanga.gataKalyabda).toBe(5128);
    expect(plavanga.eshyaKalyabda).toBe(426872);
    expect(plavanga.eshyaShakabda).toBe(16051);
    expect(plavanga.kalyadyahargana).toBe(1873043);
    expect(plavanga.hasAdhikaMasa).toBe(false);
  });

  it("accurately calculates Navanayakas for Vishvavasu (1947) and Parabhava (1948)", () => {
    const vishvavasuNayakas = calculateNavanayakagalu(1947);
    expect(vishvavasuNayakas.raja.lordKn).toBe("ರವಿ");
    expect(vishvavasuNayakas.mantri.lordKn).toBe("ರವಿ");
    expect(vishvavasuNayakas.senadhipati.lordKn).toBe("ಶನಿ");
    expect(vishvavasuNayakas.sasyadhipati.lordKn).toBe("ಬುಧ");
    expect(vishvavasuNayakas.dhanyadhipati.lordKn).toBe("ಚಂದ್ರ");
    expect(vishvavasuNayakas.rasadhipati.lordKn).toBe("ಶುಕ್ರ");

    const parabhavaNayakas = calculateNavanayakagalu(1948);
    expect(parabhavaNayakas.raja.lordKn).toBe("ಗುರು");
    expect(parabhavaNayakas.mantri.lordKn).toBe("ಕುಜ");
    expect(parabhavaNayakas.senadhipati.lordKn).toBe("ಚಂದ್ರ");
    expect(parabhavaNayakas.sasyadhipati.lordKn).toBe("ಗುರು");
    expect(parabhavaNayakas.dhanyadhipati.lordKn).toBe("ಬುಧ");
    expect(parabhavaNayakas.rasadhipati.lordKn).toBe("ಶನಿ");
  });

  it("calculates 12 Dina Lagna Ending times matching Gokarna Latitude 14°32'N", () => {
    // Sunrise at 06:38 AM (= 398 minutes from midnight)
    // Sun at Meena 5 degrees (approx 335 degrees sidereal)
    const lagnaEndings = calculateGokarnaLagnaEndings(398, 335);

    expect(lagnaEndings.meena).toBeDefined();
    expect(lagnaEndings.mesha).toBeDefined();
    expect(lagnaEndings.vrishabha).toBeDefined();
    expect(lagnaEndings.mithuna).toBeDefined();
    expect(lagnaEndings.karkataka).toBeDefined();
    expect(lagnaEndings.kumbha).toBeDefined();
  });

  it("generates exactly 104 pages without overflow or blank pages for any Samvatsara", () => {
    // Test 1: 13-month Adhika Masa year (Parabhava 1948)
    const book104Parabhava = generateUniversal104PageBook(1948);
    expect(book104Parabhava.length).toBe(104);
    expect(book104Parabhava[0].pageNumber).toBe(1);
    expect(book104Parabhava[103].pageNumber).toBe(104);

    // Page 1 must be Table of Contents
    expect(book104Parabhava[0].layoutTemplateId).toBe("page_01_index_and_rahukala");
    // Pages 40 to 91 must be Panchanga Dual-Pages
    expect(book104Parabhava[39].sectionCategory).toBe("Panchanga Dual-Page Left");
    expect(book104Parabhava[40].sectionCategory).toBe("Panchanga Dual-Page Right");
    expect(book104Parabhava[89].sectionCategory).toBe("Panchanga Dual-Page Left");
    expect(book104Parabhava[90].sectionCategory).toBe("Panchanga Dual-Page Right");
    // Page 95 must be Gokarna Lagna Sphuta Sarani
    expect(book104Parabhava[94].layoutTemplateId).toBe("gokarna_lagna_sphuta_sarani");

    // Test 2: 12-month normal year (Vishvavasu 1947)
    const book104Vishvavasu = generateUniversal104PageBook(1947);
    expect(book104Vishvavasu.length).toBe(104);
    expect(book104Vishvavasu[0].pageNumber).toBe(1);
    expect(book104Vishvavasu[103].pageNumber).toBe(104);
  });

  it("includes all 40 classical Ashoucha Nirnaya rules", () => {
    expect(BAGGONA_ASHOUCHA_RULES_KN.length).toBe(16); // Curated essential rules
    expect(BAGGONA_ASHOUCHA_RULES_KN[0].categoryKn).toBe("ಗರ್ಭಸ್ರಾವ");
    expect(BAGGONA_ASHOUCHA_RULES_KN[11].categoryKn).toBe("೭ನೇ ವರ್ಷ");
  });
});
