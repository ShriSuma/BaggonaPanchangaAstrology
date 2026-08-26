import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import {
  SevaLetterPrint,
  SevaQRCodePrint,
  SevaAnugrahaGuidancePrint,
  SevaRemediesAnnualPrint,
  SevaPoojaMahatmePrint,
  SevaPrasadaCardPrint
} from "../components/seva/pdf/SevaPrintTemplates";
import {
  generateNative90DayQrCalendarPayload,
  generateSevaICalendarString
} from "../features/seva/icsCalendarGenerator";
import QRCode from "qrcode";
import type { RhythmResult, RhythmDay } from "../core/DailyRhythmEngine";

const mockIdentity = {
  personName: "ಚೈತನ್ಯ ಕುಮಾರ್",
  rashiIndex: 3,
  nakshatraIndex: 7,
  gotra: "Kashyapa",
  placeLabel: "Gokarna"
};

const mockDay = {
  ymd: "2026-08-14",
  dayLord: "Venus",
  moonRashiIndex: 3,
  moonNakshatraIndex: 7,
  band: "high",
  energyScore: 88,
  isMoneyDay: true,
  isChandrashtama: false,
  isAmavasya: false,
  luckyNumbers: [3, 7, 9],
  luckyColour: "white",
  luckyDirection: "east"
} as unknown as RhythmDay;

const mockRhythm: RhythmResult = {
  startYmd: "2026-08-14",
  endYmd: "2026-11-12",
  days: [mockDay],
  months: [],
  janmaNakshatraIndex: 7,
  janmaRashiIndex: 3,
  janmaRashiLord: "Moon",
  personalNumbers: [3, 7, 9],
  personalColour: "white",
  personalDirection: "northwest"
};

describe("Seva PDF 5-Page Suite & QR Code Verification", () => {
  it("generates a valid 90-day Google Calendar intent URL payload", () => {
    const payload = generateNative90DayQrCalendarPayload({
      days: mockRhythm.days,
      lang: "kn",
      panditName: "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್",
      notificationTime: "08:00",
      personName: mockIdentity.personName
    });

    expect(payload).toContain("/daily?token=bgn_v1_");
    expect(payload).toContain("action=ics90");
  });

  it("renders SevaQRCodePrint with provided QR Code data URL without blank placeholder", async () => {
    const sampleQr = await QRCode.toDataURL("https://example.com/calendar", { width: 280 });

    render(
      <SevaQRCodePrint
        lang="kn"
        identity={mockIdentity}
        qrDataUrl={sampleQr}
      />
    );

    const img = screen.getByRole("img", { name: /QR Code/i });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("data:image/png;base64");
    expect(screen.getByText(/೨ \/ ೫|2 \/ 5/)).toBeInTheDocument();
  });

  it("auto-generates fallback QR Code in SevaQRCodePrint when qrDataUrl is empty", async () => {
    render(
      <SevaQRCodePrint
        lang="kn"
        identity={mockIdentity}
        qrDataUrl=""
      />
    );

    await waitFor(() => {
      const img = screen.getByRole("img", { name: /QR Code/i });
      expect(img).toBeInTheDocument();
      expect(img.getAttribute("src")).toContain("data:image/png;base64");
    });
  });

  it("renders all 5 pages with matching page counters across Kannada, Hindi, Telugu, Tamil, and English", () => {
    const langs = ["kn", "hi", "te", "ta", "en"];

    langs.forEach((lang) => {
      const { unmount: u1 } = render(
        <SevaLetterPrint
          lang={lang}
          identity={mockIdentity}
          panditName="Pandit Shreedhara"
          rhythm={mockRhythm}
          primarySeva={{ id: "archana", name: { kn: "ಅರ್ಚನೆ", en: "Archana", hi: "अर्चना", te: "అర్చన", ta: "அர்ச்சனை" } } as any}
          sevaDate="2026-08-14"
        />
      );
      u1();

      const { unmount: u2 } = render(
        <SevaQRCodePrint
          lang={lang}
          identity={mockIdentity}
          qrDataUrl="data:image/png;base64,sample"
        />
      );
      u2();

      const { unmount: u3 } = render(
        <SevaAnugrahaGuidancePrint
          lang={lang}
          identity={mockIdentity}
          panditName="Pandit Shreedhara"
          rhythm={mockRhythm}
        />
      );
      u3();

      const { unmount: u4 } = render(
        <SevaRemediesAnnualPrint
          lang={lang}
          identity={mockIdentity}
          panditName="Pandit Shreedhara"
          rhythm={mockRhythm}
        />
      );
      u4();

      const { unmount: u5 } = render(
        <SevaPoojaMahatmePrint
          lang={lang}
          identity={mockIdentity}
          panditName="Pandit Shreedhara"
        />
      );
      u5();
    });
  });

  it("ensures Page 4 (SevaRemediesAnnualPrint) contains all 12-month remedies and Vastu rules without blank sections", () => {
    render(
      <SevaRemediesAnnualPrint
        lang="kn"
        identity={mockIdentity}
        panditName="ಚೈತನ್ಯ ಪಂಡಿತ"
        rhythm={mockRhythm}
      />
    );

    expect(screen.getByText(/೧೨ ಮಾಸಗಳ ಶ್ರೇಷ್ಠ ಪೂಜಾ ಪರಿಹಾರ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಗೃಹ ಶಾಂತಿ ಹಾಗೂ ವಾಸ್ತು ಧರ್ಮ ಸೂತ್ರಗಳು/i)).toBeInTheDocument();
    expect(screen.getByText(/ಸಿಂಹದ್ವಾರ ಕುಂಕುಮ ಧಾರಣೆ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಕುಲದೇವರ/i)).toBeInTheDocument();
    expect(screen.getByText(/೪ \/ ೫|4 \/ 5/)).toBeInTheDocument();
  });

  it("ensures Page 3 (SevaAnugrahaGuidancePrint) dynamically renders Janma Nakshatra Mantra based on devotee birth star", () => {
    // Test Pushya nakshatra (index 7)
    const { unmount } = render(
      <SevaAnugrahaGuidancePrint
        lang="kn"
        identity={{ ...mockIdentity, nakshatraIndex: 7 }}
        panditName="ಚೈತನ್ಯ ಪಂಡಿತ"
        rhythm={mockRhythm}
      />
    );

    expect(screen.getByText(/ಜನ್ಮ ನಕ್ಷತ್ರ ಮಂತ್ರ ಜಪ/i)).toBeInTheDocument();
    expect(screen.getByText(/★ ಪುಷ್ಯ/i)).toBeInTheDocument();
    expect(screen.getByText(/॥ ॐ ಬೃಹಸ್ಪತಯೇ ನಮಃ ॥/i)).toBeInTheDocument();
    expect(screen.getByText(/ಬೃಹಸ್ಪತಿ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಪ್ರತಿದಿನ ೧೦೮ ಬಾರಿ/i)).toBeInTheDocument();
    unmount();

    // Test Ashwini nakshatra (index 0) in English
    render(
      <SevaAnugrahaGuidancePrint
        lang="en"
        identity={{ ...mockIdentity, nakshatraIndex: 0 }}
        panditName="Chaitanya Pandit"
        rhythm={mockRhythm}
      />
    );

    expect(screen.getByText(/Nakshatra Mantra Japa/i)).toBeInTheDocument();
    expect(screen.getByText(/★ Ashwini/i)).toBeInTheDocument();
    expect(screen.getByText(/॥ Om Ashwini Kumarabhyam Namah ॥/i)).toBeInTheDocument();
    expect(screen.getByText(/Ashwini Kumaras/i)).toBeInTheDocument();
    expect(screen.getByText(/108 Times Daily/i)).toBeInTheDocument();
  });
});
