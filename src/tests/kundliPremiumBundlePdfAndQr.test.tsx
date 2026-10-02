import React from "react";
import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Kundli30DayQrCard, type KundliQrProfile } from "../components/kundli/Kundli30DayQrCard";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import { generateQrPayloadByTarget, calculateDeterministicRhythmDay } from "../features/seva/icsCalendarGenerator";
import type { KundliInput } from "../core/AstroTypes";

describe("Kundli Premium Bundle PDF & QR Code Audit", () => {
  const sampleInput: KundliInput = {
    name: "Suresh Bhat",
    birthDate: "1990-06-15",
    birthTime: "09:30",
    latitude: 14.54,
    longitude: 74.31,
    gender: "Male"
  };

  const sampleProfile: KundliQrProfile = {
    name: "Suresh Bhat",
    birthDate: "1990-06-15",
    birthTime: "09:30",
    lagnaSign: "ಕರ್ಕ",
    lagnaSanskrit: "Karka",
    moonSign: "ಕುಂಭ",
    moonSanskrit: "Kumbha",
    moonNakshatra: "ಶತಭಿಷಾ",
    moonPada: "ಪಾದ 2",
    currentMahadasha: "Rahu",
    currentBhukti: "Jupiter",
    moonNakshatraIndex: 23,
    moonRashiIndex: 10
  };

  describe("Item 5: 30-Day Auspicious Calendar QR Card", () => {
    it("generates a valid QR payload pointing to /daily with action=ics90 and priest details", () => {
      const rhythmDays = Array.from({ length: 30 }, (_, i) => {
        const d = new Date("2026-10-02");
        d.setDate(d.getDate() + i);
        const ymd = d.toISOString().slice(0, 10);
        return calculateDeterministicRhythmDay(ymd, sampleProfile.moonNakshatraIndex!, sampleProfile.moonRashiIndex!);
      });

      expect(rhythmDays.length).toBe(30);
      expect(rhythmDays[0].ymd).toBe("2026-10-02");
      expect(typeof rhythmDays[0].tara?.tara).toBe("number");

      const payload = generateQrPayloadByTarget("google", {
        days: rhythmDays,
        lang: "kn",
        panditName: "Shreeram Pandit",
        priestPhone: "9972339362",
        overrideCalendarPhone: true,
        notificationTime: "07:00",
        personName: sampleProfile.name,
        pincode: "581326",
        lat: 14.54,
        lng: 74.31,
        locationName: "Gokarna",
        dob: sampleProfile.birthDate,
        tob: sampleProfile.birthTime,
        birthNakshatraIndex: sampleProfile.moonNakshatraIndex,
        birthRashiIndex: sampleProfile.moonRashiIndex
      });

      // Must direct to /daily?token=...&action=ics90...
      expect(payload).toContain("/daily?token=");
      expect(payload).toContain("action=ics90");
      expect(payload).toContain("priestPhone=9972339362");
    });

    it("renders pre-generated QR code image without 'Generating QR...' placeholder", () => {
      const dummyQrDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const { container } = render(
        <Kundli30DayQrCard
          profile={sampleProfile}
          lang="kn"
          panditName="Shreeram Pandit"
          priestPhone="9972339362"
          qrDataUrl={dummyQrDataUrl}
        />
      );

      const img = container.querySelector("img[alt='30-Day Baggona Panchanga Google Calendar QR']");
      expect(img).not.toBeNull();
      expect(img?.getAttribute("src")).toBe(dummyQrDataUrl);
      expect(container.textContent).not.toContain("Generating QR...");
    });

    it("enforces 900px width on .pdf-page per baggona-pdf-layout-guard", () => {
      const { container } = render(
        <Kundli30DayQrCard
          profile={sampleProfile}
          lang="kn"
          panditName="Shreeram Pandit"
          priestPhone="9972339362"
        />
      );

      const page = container.querySelector(".pdf-page") as HTMLElement;
      expect(page).not.toBeNull();
      expect(page.style.width).toBe("900px");
      expect(page.style.minHeight).toBe("1273px");
    });
  });

  describe("Item 4: Kundli Comprehensive Doshas Report PDF (Doshagalu)", () => {
    it("renders all pages with exact 900px width and 1273px height", () => {
      const kundli = calculateKundli(sampleInput, { ayanamsaModel: "lahiri" });
      const report = calculateComprehensiveDoshas(kundli, sampleInput, new Date("2026-10-02"));

      const { container } = render(
        <KundliDoshaPdfTemplate
          id="test-doshas"
          report={report}
          lang="kn"
        />
      );

      const pages = container.querySelectorAll(".pdf-page") as NodeListOf<HTMLElement>;
      expect(pages.length).toBe(3);

      pages.forEach((p) => {
        expect(p.style.width).toBe("900px");
        expect(p.style.height).toBe("1273px");
      });
    });
  });

  describe("Item 2: Kundli Remedy Report PDF (Daivika Parihara)", () => {
    it("renders all pages with exact 900px width and 1273px height", () => {
      const kundli = calculateKundli(sampleInput, { ayanamsaModel: "lahiri" });
      const remedy = generateKundliRemedyReport(kundli, sampleInput);

      const { container } = render(
        <KundliRemedyPdfTemplate
          diagnosis={remedy}
          lang="kn"
        />
      );

      const pages = container.querySelectorAll(".pdf-page") as NodeListOf<HTMLElement>;
      expect(pages.length).toBe(3);

      pages.forEach((p) => {
        expect(p.style.width).toBe("900px");
        expect(p.style.height).toBe("1273px");
      });
    });
  });
});
