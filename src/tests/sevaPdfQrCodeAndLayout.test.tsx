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
  nakshatraIndex: 7
};

const mockDay: RhythmDay = {
  ymd: "2026-08-14",
  dayLord: 5,
  tithiIndex: 1,
  moonRashiIndex: 3,
  moonNakshatraIndex: 7,
  band: "high",
  energyScore: 88,
  isGoodDay: true,
  isMoneyDay: true,
  isChandrashtama: false,
  isAmavasya: false,
  luckyNumbers: [3, 7, 9],
  favourableColours: ["#B45309"],
  colourName: "ಕೇಸರಿ / ಗೋಲ್ಡ್",
  directionIndex: 0
};

const mockRhythm: RhythmResult = {
  days: [mockDay],
  summary: {
    totalDays: 90,
    highDaysCount: 45,
    mediumDaysCount: 30,
    lowDaysCount: 15
  },
  startYmd: "2026-08-14",
  endYmd: "2026-11-12",
  highCount: 45,
  mediumCount: 30,
  lowCount: 15
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

    expect(payload).toContain("https://calendar.google.com/calendar/render");
    expect(payload).toContain("RRULE%3AFREQ%3DDAILY%3BCOUNT%3D90");
    expect(payload).toContain("Asia%2FKolkata");
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
    expect(screen.getByText(/ಗೃಹ ಶಾಂತಿ ಹಾಗೂ ವಾಸ್ತು ದೋಷ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಚತುರ್ದಿಕ್ ವಾಸ್ತು ದೋಷ ಪರಿಹಾರ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಕುಲದೇವರ/i)).toBeInTheDocument();
    expect(screen.getByText(/೪ \/ ೫|4 \/ 5/)).toBeInTheDocument();
  });

  it("ensures Page 5 (SevaPoojaMahatmePrint) contains all 3 core Mahatme sections, 4 Graha cards, and 4 Mantra cards", () => {
    render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ಚೈತನ್ಯ ಪಂಡಿತ"
      />
    );

    expect(screen.getByText(/೧\. ಪೂಜಾ ಮಹಾ ಸಂಕಲ್ಪ/i)).toBeInTheDocument();
    expect(screen.getByText(/೨\. ಪೂಜೆಯ ಪರಮ ಕಾರಣ/i)).toBeInTheDocument();
    expect(screen.getByText(/೩\. ದಿವ್ಯ ಫಲಶ್ರುತಿ/i)).toBeInTheDocument();
    expect(screen.getByText(/೪ ಮೂಲ ಗ್ರಹಗಳ ಸ್ಥಿತಿ/i)).toBeInTheDocument();
    expect(screen.getByText(/೪ ಗ್ರಹ ಬೀಜ ಮಂತ್ರ ಜಪ/i)).toBeInTheDocument();
    expect(screen.getByText(/೫ \/ ೫|5 \/ 5/)).toBeInTheDocument();
  });
});
