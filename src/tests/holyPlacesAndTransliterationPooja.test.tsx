import { describe, it, expect } from "vitest";
import {
  GOKARNA_HOLY_PLACES,
  getHolyPlaceById,
  getHolyPlaceName,
  findHolyPlacePresetByText
} from "../features/seva/holyPlaces";
import {
  detectScript,
  isScriptMatchingLanguage,
  convertTextIfLanguageDiffers,
  transliterateName
} from "../utils/transliterator";
import { formatPoojaName } from "../features/seva/formatPoojaName";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SevaLetterPrint, SevaQRCodePrint } from "../components/seva/pdf/SevaPrintTemplates";

describe("Gokarna Holy Places & Syllabic Transliteration Engine", () => {
  it("contains all required holy place presets in Gokarna Kshetra", () => {
    const ids = GOKARNA_HOLY_PLACES.map((p) => p.id);
    expect(ids).toContain("kotiteertha");
    expect(ids).toContain("devasthana");
    expect(ids).toContain("muktimantapa");
    expect(ids).toContain("gokarna_kshetra");
    expect(ids).toContain("gokarna_kotiteertha_sannidhi");
    expect(ids).toContain("custom");
  });

  it("provides accurate 5-language native typography for holy places", () => {
    const kt = getHolyPlaceById("kotiteertha")!;
    expect(kt.name.kn).toContain("ಕೋಟಿತೀರ್ಥ");
    expect(kt.name.te).toContain("కోటితీర్థం");
    expect(kt.name.ta).toContain("கோடிதீர்த்தம்");
    expect(kt.name.hi).toContain("कोटितीर्थ");
    expect(kt.name.en).toContain("Kotiteertha");

    const mm = getHolyPlaceById("muktimantapa")!;
    expect(mm.name.kn).toContain("ಮುಕ್ತಿಮಂಟಪ");
    expect(mm.name.te).toContain("ముక్తిమంటపం");
    expect(mm.name.ta).toContain("முக்திமண்டபம்");
    expect(mm.name.hi).toContain("मुक्तिमंडप");
    expect(mm.name.en).toContain("Muktimantapa");
  });

  it("finds holy place presets by partial or localized text", () => {
    const match1 = findHolyPlacePresetByText("ಕೋಟಿತೀರ್ಥ");
    expect(match1?.id).toBe("kotiteertha");

    const match2 = findHolyPlacePresetByText("Muktimantapa");
    expect(match2?.id).toBe("muktimantapa");

    const match3 = findHolyPlacePresetByText("ಮಹಾಬಲೇಶ್ವರ");
    expect(match3?.id).toBe("devasthana");
  });

  it("detects script accurately", () => {
    expect(detectScript("ದರ್ಶನ್")).toBe("kn");
    expect(detectScript("కోటితీర్థం")).toBe("te");
    expect(detectScript("கோகர்ணம்")).toBe("ta");
    expect(detectScript("महाबलेश्वर")).toBe("hi");
    expect(detectScript("Kotiteertha")).toBe("en");
  });

  it("checks script before converting (does not modify if already in target language)", () => {
    const knText = "ಶ್ರೀ ಮಹಾಗಣಪತಿ ಪೂಜೆ";
    // Target is Kannada, source is Kannada: MUST return exact original string untouched!
    expect(convertTextIfLanguageDiffers(knText, "kn")).toBe(knText);

    const teText = "శ్రీ మహాబలేశ్వర పూజ";
    expect(convertTextIfLanguageDiffers(teText, "te")).toBe(teText);

    const enText = "Kotiteertha Gokarna";
    expect(convertTextIfLanguageDiffers(enText, "en")).toBe(enText);
  });

  it("converts Kannada custom pooja cleanly to Telugu, Tamil, Hindi, and English without garbling", () => {
    const poojaKn = "ಸಂಕಷ್ಟಹರ ಗಣಪತಿ ಪೂಜೆ";

    const poojaTe = convertTextIfLanguageDiffers(poojaKn, "te");
    expect(detectScript(poojaTe)).toBe("te");
    expect(poojaTe).toContain("గణపతి");

    const poojaHi = convertTextIfLanguageDiffers(poojaKn, "hi");
    expect(detectScript(poojaHi)).toBe("hi");
    expect(poojaHi).toContain("गणपति");

    const poojaTa = convertTextIfLanguageDiffers(poojaKn, "ta");
    expect(detectScript(poojaTa)).toBe("ta");

    const poojaEn = convertTextIfLanguageDiffers(poojaKn, "en");
    expect(detectScript(poojaEn)).toBe("en");
    expect(poojaEn.toLowerCase()).toContain("ganapati");
  });

  it("formats custom pooja name using formatPoojaName across languages", () => {
    const customName = "ನವಗ್ರಹ ಶಾಂತಿ ಪೂಜೆ";
    const knRes = formatPoojaName(customName, "kn");
    expect(knRes).toBe(customName);

    const teRes = formatPoojaName(customName, "te");
    expect(detectScript(teRes)).toBe("te");

    const hiRes = formatPoojaName(customName, "hi");
    expect(detectScript(hiRes)).toBe("hi");
  });

  it("renders selected holy place on Page 1 (SevaLetterPrint)", () => {
    const mockIdentity = {
      personName: "ರಮೇಶ್ ಕುಮಾರ್",
      rashiIndex: 0,
      nakshatraIndex: 0,
      gotra: "ವಿಶ್ವಾಮಿತ್ರ",
      placeLabel: "Gokarna"
    };

    const mockRhythm = {
      startYmd: "2026-08-14",
      endYmd: "2026-11-12",
      days: [],
      months: [],
      janmaNakshatraIndex: 0,
      janmaRashiIndex: 0,
      highEnergyCount: 0,
      moneyDayCount: 0,
      cautionDayCount: 0
    } as any;

    const { unmount } = render(
      <SevaLetterPrint
        lang="kn"
        identity={mockIdentity}
        rhythm={mockRhythm}
        sevaDate="2026-08-26"
        panditName="ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
        place="ಕೋಟಿತೀರ್ಥ, ಗೋಕರ್ಣ"
      />
    );

    expect(screen.getByText("ಕೋಟಿತೀರ್ಥ, ಗೋಕರ್ಣ")).toBeInTheDocument();
    unmount();
  });

  it("renders priest name and contact prominently on Page 2 (SevaQRCodePrint)", () => {
    const mockIdentity = {
      personName: "ರಮೇಶ್ ಕುಮಾರ್",
      rashiIndex: 0,
      nakshatraIndex: 0,
      gotra: "ವಿಶ್ವಾಮಿತ್ರ",
      placeLabel: "Gokarna"
    };

    const { unmount } = render(
      <SevaQRCodePrint
        lang="kn"
        identity={mockIdentity}
        qrDataUrl="data:image/png;base64,sample"
        panditName="ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
      />
    );

    const priestMatches = screen.getAllByText(/ಶ್ರೀರಾಮ್ ಪಂಡಿತ್|ಶ್ರೀರಾಮ ಪಂಡಿತ್/);
    expect(priestMatches.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/9972339362/)).toBeInTheDocument();
    unmount();
  });
});
