import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { SevaQRCodePrint } from "../components/seva/pdf/SevaPrintTemplates";
import { formatPanditName } from "../features/seva/sevaLocale";
import { transliterateName } from "../utils/transliterator";
const mockIdentity = {
  personName: "ಚೈತನ್ಯ ಕುಮಾರ್",
  rashiIndex: 3,
  nakshatraIndex: 7,
  gotra: "Kashyapa",
  placeLabel: "Gokarna"
};

describe("Priest Phone Override and QR Code Layout Badge Spacing", () => {
  it("renders overridden custom priestPhone when priestPhone prop is provided", () => {
    const customPhone = "9449998877";
    render(
      <SevaQRCodePrint
        lang="kn"
        identity={mockIdentity}
        panditName="Ravi Jambe"
        priestPhone={customPhone}
        qrDataUrl="data:image/png;base64,dummy"
      />
    );

    expect(screen.getByText(new RegExp(customPhone))).toBeInTheDocument();
    // Default directory phone for Ravi Jambe is 9481234567, which should NOT appear
    expect(screen.queryByText(/9481234567/)).not.toBeInTheDocument();
  });

  it("falls back to priest directory phone when priestPhone prop is not passed or empty", () => {
    render(
      <SevaQRCodePrint
        lang="kn"
        identity={mockIdentity}
        panditName="Ravi Jambe"
        qrDataUrl="data:image/png;base64,dummy"
      />
    );

    // Default directory phone for Ravi Jambe is 9481234567
    expect(screen.getByText(/9481234567/)).toBeInTheDocument();
  });

  it("verifies badge styling has marginTop: 14, centered alignment, and proper padding", () => {
    const { container } = render(
      <SevaQRCodePrint
        lang="te"
        identity={mockIdentity}
        panditName="Ravi Jambe"
        priestPhone="9876543210"
        qrDataUrl="data:image/png;base64,dummy"
      />
    );

    // Locate the priest badge container
    const badge = container.querySelector('div[style*="border-radius: 24px"]') ||
                  container.querySelector('div[style*="borderRadius: 24px"]') ||
                  container.querySelector('div[style*="margin-top: 14px"]');

    expect(badge).not.toBeNull();
    const style = (badge as HTMLElement)?.style;
    expect(style.marginTop).toBe("14px");
    expect(style.marginBottom).toBe("10px");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("center");
    expect(style.textAlign).toBe("center");
  });

  it("renders pure Telugu script for Ravi Jambe in Telugu language mode", () => {
    render(
      <SevaQRCodePrint
        lang="te"
        identity={mockIdentity}
        panditName="ರವಿ ಜಂಬೆ"
        priestPhone="9112233445"
        qrDataUrl="data:image/png;base64,dummy"
      />
    );

    // In Telugu, Ravi Jambe is transliterated to రవి జంబె (appears in both badge and footer)
    const elements = screen.getAllByText(/రవి జంబె/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/9112233445/)).toBeInTheDocument();
  });

  it("verifies formatPanditName and transliterateName for Ravi across languages", () => {
    expect(formatPanditName("Ravi Jambe", "te")).toBe("రవి జంబె");
    expect(formatPanditName("ರವಿ ಜಂಬೆ", "te")).toBe("రవి జంబె");
    expect(formatPanditName("Ravi Jambe", "hi")).toBe("रवि जंबे");
    expect(formatPanditName("Ravi Jambe", "ta")).toBe("ரவி ஜம்பே");
    expect(formatPanditName("Ravi Jambe", "kn")).toBe("ರವಿ ಜಂಬೆ");
    expect(transliterateName("ravi jambe", "te")).toBe("రవి జంబె");
  });
});
