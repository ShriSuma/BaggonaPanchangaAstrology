import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashaPdfTemplate } from "../components/kundli/DashaPdfTemplate";
import type { KundliViewerSession } from "../stores/kundliViewerStore";
import { PlanetName } from "../core/AstroTypes";

const mockSession: KundliViewerSession = {
  input: {
    name: "Sri Pandit",
    birthDate: "1990-01-01",
    birthTime: "06:00",
    latitude: 14.54,
    longitude: 74.31,
  },
  result: {
    ascendant: 240,
    planets: [
      {
        name: PlanetName.Sun,
        degree: 250,
        house: 9,
        rashi: { index: 8, sanskrit: "Dhanu", english: "Sagittarius" },
        nakshatra: { index: 19, sanskrit: "Purva Ashadha", english: "Purva Ashadha", deity: "Apas" },
        isRetrograde: false,
      },
      {
        name: PlanetName.Moon,
        degree: 320,
        house: 11,
        rashi: { index: 10, sanskrit: "Kumbha", english: "Aquarius" },
        nakshatra: { index: 24, sanskrit: "Purva Bhadrapada", english: "Purva Bhadrapada", deity: "Aja Ekapada" },
        isRetrograde: false,
      },
    ],
    lagnaDegree: 240,
    lagnaRashi: { index: 7, sanskrit: "Vrishchika", english: "Scorpio" },
    moonSign: { index: 10, sanskrit: "Kumbha", english: "Aquarius" },
    sunSign: { index: 8, sanskrit: "Dhanu", english: "Sagittarius" },
    nakshatra: { index: 24, sanskrit: "Purva Bhadrapada", english: "Purva Bhadrapada", deity: "Aja Ekapada" },
    moonPada: 1,
    nakshatraDegreeInPada: 2.5,
    ayanamsha: 23.7,
    houseSystem: "Equal",
    houses: [240, 270, 300, 330, 0, 30, 60, 90, 120, 150, 180, 210],
  },
} as any;

describe("DashaPdfTemplate Multilingual Support", () => {
  it("renders English titles and labels when pdfLanguage is 'en'", () => {
    render(<DashaPdfTemplate session={mockSession} pdfLanguage="en" />);
    expect(screen.getByText("Vimshottari Dasha Bhukti")).toBeInTheDocument();
    expect(screen.getByText(/Name:/)).toBeInTheDocument();
    expect(screen.getByText(/Lagna:/)).toBeInTheDocument();
    expect(screen.getByText(/Rashi:/)).toBeInTheDocument();
    expect(screen.getByText("Baggona Panchanga Author")).toBeInTheDocument();
  });

  it("renders Kannada titles and labels when pdfLanguage is 'kn'", () => {
    render(<DashaPdfTemplate session={mockSession} pdfLanguage="kn" />);
    expect(screen.getByText("ವಿಂಶೋತ್ತರಿ ದಶಾ ಭುಕ್ತಿ")).toBeInTheDocument();
    expect(screen.getByText(/ಹೆಸರು:/)).toBeInTheDocument();
    expect(screen.getByText(/ಲಗ್ನ:/)).toBeInTheDocument();
    expect(screen.getByText(/ರಾಶಿ:/)).toBeInTheDocument();
    expect(screen.getByText("ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರು")).toBeInTheDocument();
  });

  it("renders Telugu titles and labels when pdfLanguage is 'te'", () => {
    render(<DashaPdfTemplate session={mockSession} pdfLanguage="te" />);
    expect(screen.getByText("వింశోత్తరి దశ భుక్తి")).toBeInTheDocument();
    expect(screen.getByText(/పేరు:/)).toBeInTheDocument();
    expect(screen.getByText(/లగ్నం:/)).toBeInTheDocument();
    expect(screen.getByText(/రాశి:/)).toBeInTheDocument();
    expect(screen.getByText("బగ్గోణ పంచాంగ కర్తలు")).toBeInTheDocument();
  });

  it("renders Tamil titles and labels when pdfLanguage is 'ta'", () => {
    render(<DashaPdfTemplate session={mockSession} pdfLanguage="ta" />);
    expect(screen.getByText("விம்சோத்தரி தசை புக்தி")).toBeInTheDocument();
    expect(screen.getByText(/பெயர்:/)).toBeInTheDocument();
    expect(screen.getByText(/லக்னம்:/)).toBeInTheDocument();
    expect(screen.getByText(/ராசி:/)).toBeInTheDocument();
    expect(screen.getByText("பக்கோன பஞ்சாங்கம் கர்த்தா")).toBeInTheDocument();
  });

  it("renders Hindi titles and labels when pdfLanguage is 'hi'", () => {
    render(<DashaPdfTemplate session={mockSession} pdfLanguage="hi" />);
    expect(screen.getByText("विंशोत्तरी दशा भुक्ति")).toBeInTheDocument();
    expect(screen.getByText(/नाम:/)).toBeInTheDocument();
    expect(screen.getByText(/लग्न:/)).toBeInTheDocument();
    expect(screen.getByText(/राशि:/)).toBeInTheDocument();
    expect(screen.getByText("बग्गोण पंचांग कर्ता")).toBeInTheDocument();
  });
});
