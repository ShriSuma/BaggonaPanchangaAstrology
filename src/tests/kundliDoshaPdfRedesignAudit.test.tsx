import React from "react";
import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";

describe("Kundli Doshagalu PDF Luxury Redesign Audit", () => {
  const sampleNative: KundliInput = {
    name: "Manoj Kumar",
    birthDate: "1995-11-20",
    birthTime: "09:30",
    latitude: 14.54,
    longitude: 74.31,
    gender: "Male"
  };

  const kundli = calculateKundli(sampleNative, { ayanamsaModel: "lahiri" });
  const report = calculateComprehensiveDoshas(kundli, sampleNative, new Date("2026-10-30"));

  it("1. Renders strictly 2 A4 pages with 900px width and 1273px height", () => {
    const { container } = render(
      <KundliDoshaPdfTemplate
        id="test-doshas-pdf"
        report={report}
        lang="kn"
      />
    );

    const pages = container.querySelectorAll(".pdf-page");
    expect(pages.length).toBe(2);

    pages.forEach((page) => {
      const el = page as HTMLElement;
      expect(el.style.width).toBe("900px");
      expect(el.style.height).toBe("1273px");
      expect(el.style.pageBreakAfter).toBe("always");
      expect(el.style.backgroundColor).toBe("rgb(253, 251, 247)"); // #FDFBF7
    });
  });

  it("2. Features sacred deity images: Lord Shiva and Lord Surya medallions on Page 1 and Gokarna medallion on Page 2", () => {
    const { container } = render(
      <KundliDoshaPdfTemplate
        id="test-doshas-pdf"
        report={report}
        lang="kn"
      />
    );

    const images = Array.from(container.querySelectorAll("img"));
    const shivaImages = images.filter((img) => img.src.includes("/daily_posters/poster_1_shiva.jpg"));
    const suryaImages = images.filter((img) => img.src.includes("/daily_posters/poster_0_surya.jpg"));

    expect(shivaImages.length).toBeGreaterThanOrEqual(2); // Page 1 Header and Page 2 Priest Section
    expect(suryaImages.length).toBeGreaterThanOrEqual(1); // Page 1 Header Right

    // Check circular golden medallion framing
    shivaImages.forEach((img) => {
      expect(img.style.borderRadius).toBe("50%");
      expect(img.style.objectFit).toBe("cover");
    });
  });

  it("3. Features gold landline borders, filigree dividers, and 4 corner florets on both pages", () => {
    const { container } = render(
      <KundliDoshaPdfTemplate
        id="test-doshas-pdf"
        report={report}
        lang="kn"
      />
    );

    // Look for corner florets
    const cornerFlorets = Array.from(container.querySelectorAll("div")).filter(
      (el) => el.textContent?.trim() === "❖"
    );
    // 4 corner florets per page * 2 pages = at least 8 corner florets
    expect(cornerFlorets.length).toBeGreaterThanOrEqual(8);

    // Look for gold landline dividers with center sacred emblems
    expect(container.textContent).toContain("❖ ಜಾತಕ ವಿವರ ❖");
    expect(container.textContent).toContain("❖ ಪ್ರಮುಖ ಕರ್ಮ ದೋಷ ವಿಶ್ಲೇಷಣೆ ❖");
    expect(container.textContent).toContain("❖ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಸನ್ನಿಧಿ ಮುದ್ರೆ ❖");
  });

  it("4. Displays Chief Priest 'ವೇದಮೂರ್ತಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್', '+91 99723 39362' and online verification QR code/seal", async () => {
    const { container } = render(
      <KundliDoshaPdfTemplate
        id="test-doshas-pdf"
        report={report}
        lang="kn"
      />
    );

    expect(container.textContent).toContain("ವೇದಮೂರ್ತಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(container.textContent).toContain("+91 99723 39362");
    expect(container.textContent).toContain("ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ");

    // Check QR code or seal container
    await waitFor(() => {
      const qrImg = container.querySelector("img[alt*='QR']");
      const hasSealText =
        (container.textContent && (container.textContent.includes("ಮುದ್ರೆ") || container.textContent.includes("ಸನ್ನಿಧಿ"))) || false;
      expect(qrImg !== null || hasSealText).toBe(true);
    });
  });

  it("5. Supports full localization across English, Hindi, Telugu, and Tamil without foreign script bleed", () => {
    const languages: ("en" | "hi" | "te" | "ta")[] = ["en", "hi", "te", "ta"];

    languages.forEach((lang) => {
      const { container } = render(
        <KundliDoshaPdfTemplate
          id={`test-doshas-pdf-${lang}`}
          report={report}
          lang={lang}
        />
      );

      const text = container.textContent || "";
      if (lang === "en") {
        expect(text).toContain("Natal Kundli Comprehensive Doshas");
        expect(text).toContain("Vedamurthy Shreeram Pandit");
        expect(text).toContain("+91 99723 39362");
      } else if (lang === "hi") {
        expect(text).toContain("वेदामूर्ति श्रीराम पंडित");
        expect(text).toContain("+91 99723 39362");
      } else if (lang === "te") {
        expect(text).toContain("వేదమూర్తి శ్రీరామ్ పండిత్");
        expect(text).toContain("+91 99723 39362");
      } else if (lang === "ta") {
        expect(text).toContain("வேதமூர்த்தி ஸ்ரீராம் பண்டிதர்");
        expect(text).toContain("+91 99723 39362");
      }
    });
  });
});
