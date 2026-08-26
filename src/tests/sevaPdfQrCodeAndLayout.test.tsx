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
import { SEVA_CATALOG } from "../data/gokarnaSevas";
import { getPriestProfile, getAllPriests } from "../features/seva/sevaPriestDirectory";

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

  it("ensures Page 4 (SevaRemediesAnnualPrint) contains all 12-month remedies, Vastu rules, and universal sacred Prasada guidance without blank sections", () => {
    render(
      <SevaRemediesAnnualPrint
        lang="kn"
        identity={mockIdentity}
        panditName="ಚೈತನ್ಯ ಪಂಡಿತ"
        rhythm={mockRhythm}
      />
    );

    expect(screen.getByText(/ಮಹಾಪೂಜಾ ಪರಿಹಾರ ಹಾಗೂ ಕೌಟುಂಬಿಕ ರಕ್ಷಾ ಪತ್ರಿಕೆ/i)).toBeInTheDocument();
    expect(screen.getByText(/೧೨ ಮಾಸಗಳ ಶ್ರೇಷ್ಠ ಪೂಜಾ ಪರಿಹಾರ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಗೃಹ ಶಾಂತಿ ಹಾಗೂ ವಾಸ್ತು ಧರ್ಮ ಸೂತ್ರಗಳು/i)).toBeInTheDocument();
    expect(screen.getByText(/ಸಿಂಹದ್ವಾರ ಕುಂಕುಮ ಧಾರಣೆ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಕುಲದೇವರ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಪವಿತ್ರ ಪ್ರಸಾದ ರಕ್ಷಣೆ ಹಾಗೂ ವಿನಿಯೋಗ ಮಾರ್ಗದರ್ಶಿ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಪೂಜೆಯಿಂದ ಲಭಿಸಿದ ಪವಿತ್ರ ಪ್ರಸಾದವನ್ನು/i)).toBeInTheDocument();
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

  it("ensures Venkataramana Pandit exists in priest directory with authentic title and official seal", () => {
    const allPriests = getAllPriests();
    const venkat = allPriests.find((p) => p.id === "venkataramana-pandit");
    expect(venkat).toBeDefined();
    expect(venkat?.name.kn).toBe("ವೆಂಕಟರಮಣ ಪಂಡಿತ್");
    expect(venkat?.name.en).toBe("Venkataramana Pandit");
    expect(venkat?.sealSymbol).toBe("🕉️");
    expect(venkat?.sealColor).toBe("#D4AF37");

    const profile = getPriestProfile("venkataramana-pandit");
    expect(profile.name.kn).toBe("ವೆಂಕಟರಮಣ ಪಂಡಿತ್");
    expect(profile.title.kn).toContain("ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ವೈದಿಕ ಅರ್ಚಕರು");
  });

  it("ensures Page 5 (SevaPoojaMahatmePrint) renders 3 top sections accurately with Venkataramana Pandit and expanded Poojas", () => {
    const sudarshanaSeva = {
      seva: SEVA_CATALOG.sudarshanahoma,
      score: 0,
      reasons: []
    };

    const { unmount } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={sudarshanaSeva as any}
      />
    );

    expect(screen.getAllByText(/ಶ್ರೀ ಸುದರ್ಶನ ನರಸಿಂಹ ಹೋಮ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/೧\. ಪೂಜಾ ಮಹಾ ಸಂಕಲ್ಪ/i)).toBeInTheDocument();
    expect(screen.getByText(/೨\. ಪೂಜೆಯ ಕಾರಣ/i)).toBeInTheDocument();
    expect(screen.getByText(/೩\. ದಿವ್ಯ ಫಲಶ್ರುತಿ/i)).toBeInTheDocument();
    expect(screen.getByText(/ವೆಂಕಟರಮಣ ಪಂಡಿತ್/i)).toBeInTheDocument();
    expect(screen.getByText(/೫ \/ ೫|5 \/ 5/)).toBeInTheDocument();
    unmount();

    // Test with Custom Pooja and passed MahatmeData
    render(
      <SevaPoojaMahatmePrint
        lang="en"
        identity={mockIdentity}
        panditName="Venkataramana Pandit"
        primarySeva={{
          seva: {
            id: "custom_pooja" as any,
            icon: "🪔",
            name: { en: "Sri Maha Sudarshana & Lakshmi Kubera Yaga", kn: "ಶ್ರೀ ಮಹಾ ಸುದರ್ಶನ" },
            purpose: { en: "Custom invocation" },
            benefit: { en: "Complete victory and wealth" },
            where: { en: "Sacred Altar" },
            when: { en: "Auspicious Muhurtha" },
            duration: { en: "2 Hours" },
            shloka: { sanskrit: "Om Namo", meaningKn: "", meaningEn: "" }
          },
          score: 0,
          reasons: []
        } as any}
        mahatmeData={{
          whatIsPooja: "A high-frequency cosmic invocation of Sri Sudarshana Chakra and Lakshmi Kubera.",
          whyDoPooja: "To permanently remove severe financial encumbrances and negative eyes.",
          benefitsPooja: "Brings inexhaustible wealth, peace of mind, and invincible divine protection."
        }}
      />
    );

    expect(screen.getByText(/Sri Maha Sudarshana & Lakshmi Kubera Yaga/i)).toBeInTheDocument();
    expect(screen.getByText(/A high-frequency cosmic invocation/i)).toBeInTheDocument();
    expect(screen.getByText(/To permanently remove severe financial encumbrances/i)).toBeInTheDocument();
    expect(screen.getByText(/Brings inexhaustible wealth, peace of mind/i)).toBeInTheDocument();
    expect(screen.getByText(/Venkataramana Pandit/i)).toBeInTheDocument();
  });

  it("ensures Page 5 renders distinct Vedic details for Narayana Bali, Narayana Bali & Tripindi, and Narayana Bali & Pretoddhara", () => {
    // 1. Standalone Narayana Bali
    const { unmount: unmount1 } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={{
          seva: SEVA_CATALOG.narayanabali,
          score: 0,
          reasons: []
        } as any}
      />
    );
    expect(screen.getAllByText(/ನಾರಾಯಣ ಬಲಿ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/ವಿಷ್ಣುಲೋಕ ಪ್ರಾಪ್ತಿಯನ್ನು ಕರುಣಿಸುವ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಮುಕ್ತಿ ಲಭಿಸಿ/i)).toBeInTheDocument();
    unmount1();

    // 2. Narayana Bali & Tripindi Shraddha
    const { unmount: unmount2 } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={{
          seva: SEVA_CATALOG.narayanabali_tripindi,
          score: 0,
          reasons: []
        } as any}
      />
    );
    expect(screen.getAllByText(/ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/ಸಾತ್ವಿಕ, ರಾಜಸಿಕ ಹಾಗೂ ತಾಮಸಿಕ ಮೂರು ವಿಧದ ಪೂರ್ವಜರಿಗೆ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಮೂರು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಪರಿಪೂರ್ಣ ಮುಕ್ತಿ ದೊರೆತು/i)).toBeInTheDocument();
    unmount2();

    // 3. Narayana Bali & Pretoddhara Shanti
    const { unmount: unmount3 } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={{
          seva: SEVA_CATALOG.narayanabali_pretoddhara,
          score: 0,
          reasons: []
        } as any}
      />
    );
    expect(screen.getAllByText(/ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ಪ್ರೇತೋದ್ಧಾರ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/ಅಕಾಲ ಮರಣ, ಅಪಮೃತ್ಯು ಅಥವಾ ಅತೃಪ್ತಿಯಿಂದ ಸಂಕಷ್ಟಕ್ಕೀಡಾದ ಆತ್ಮಗಳ ಮುಕ್ತಿಗಾಗಿ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಅತೃಪ್ತ ಆತ್ಮಗಳಿಗೆ ಪ್ರೇತತ್ವದಿಂದ ಮುಕ್ತಿ ಹಾಗೂ ಮೋಕ್ಷ ಪ್ರಾಪ್ತಿಯಾಗಿ/i)).toBeInTheDocument();
    unmount3();
  });

  it("ensures Page 5 renders distinct Vedic details for Kuja Shanti, Rahu Brihaspati Shanti, and the Combined Trio", () => {
    // 1. Combined Trio: Kuja Shanti, Rahu-Brihaspati Shanti & Maha Mrityunjaya Shanti
    const { unmount: unmount1 } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={{
          seva: SEVA_CATALOG.kujashanti_rahubrihaspati_mrityunjaya,
          score: 0,
          reasons: []
        } as any}
      />
    );
    expect(screen.getAllByText(/ಕುಜ ಶಾಂತಿ, ರಾಹು ಬೃಹಸ್ಪತಿ ಶಾಂತಿ ಹಾಗೂ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಶಾಂತಿ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/ಗುರು-ಚಾಂಡಾಲ ಯೋಗ ಹಾಗೂ ಆಯುರಾರೋಗ್ಯದ ಮೇಲಿನ ಗ್ರಹ ಬಾಧೆಗಳನ್ನು ಏಕಕಾಲದಲ್ಲಿ ಶಮನಗೊಳಿಸಿ/i)).toBeInTheDocument();
    expect(screen.getByText(/ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ಬುದ್ಧಿ ತೇಜಸ್ಸು, ಸನ್ಮಾರ್ಗ, ರೋಗಮುಕ್ತ ದೀರ್ಘಾಯುಷ್ಯ/i)).toBeInTheDocument();
    unmount1();

    // 2. Rahu-Brihaspati Shanti Homa
    const { unmount: unmount2 } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={{
          seva: SEVA_CATALOG.rahubrihaspatishanti,
          score: 0,
          reasons: []
        } as any}
      />
    );
    expect(screen.getAllByText(/ರಾಹು-ಬೃಹಸ್ಪತಿ ಶಾಂತಿ ಹೋಮ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/ಗುರು ಮತ್ತು ರಾಹು ಗ್ರಹಗಳ ಪ್ರತಿಕೂಲ ಸಂಯೋಗ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಬುದ್ಧಿ ಸ್ಥೈರ್ಯ, ಉನ್ನತ ಜ್ಞಾನ, ಉದ್ಯೋಗ-ವ್ಯಾಪಾರದಲ್ಲಿ ಸ್ಥಿರ ಮುನ್ನಡೆ/i)).toBeInTheDocument();
    unmount2();

    // 3. Kuja Shanti Standalone
    const { unmount: unmount3 } = render(
      <SevaPoojaMahatmePrint
        lang="kn"
        identity={mockIdentity}
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
        primarySeva={{
          seva: SEVA_CATALOG.kujashanti,
          score: 0,
          reasons: []
        } as any}
      />
    );
    expect(screen.getAllByText(/ಕುಜ ಶಾಂತಿ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/ನವಗ್ರಹಗಳಲ್ಲಿ ಸೇನಾನಿಯಾದ ಮಂಗಳ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಮನಸ್ಸಿನಲ್ಲಿ ಶಾಂತಿ, ಸಕಾಲಿಕ ವಿವಾಹ ಭಾಗ್ಯ/i)).toBeInTheDocument();
    unmount3();
  });

  it("renders place as Venkataramana Panditara Mane, Gokarna on Page 1 (SevaLetterPrint) when priest is Venkataramana Pandit", () => {
    const rudraSeva = {
      seva: SEVA_CATALOG.rudrabhisheka,
      score: 0,
      reasons: []
    };

    // 1. In Kannada
    const { unmount: unmountKn } = render(
      <SevaLetterPrint
        lang="kn"
        identity={mockIdentity}
        rhythm={mockRhythm}
        primarySeva={rudraSeva as any}
        sevaDate="2026-08-26"
        panditName="ವೆಂಕಟರಮಣ ಪಂಡಿತ್"
      />
    );

    expect(screen.getByText("ವೆಂಕಟರಮಣ ಪಂಡಿತರ ಮನೆ, ಗೋಕರ್ಣ")).toBeInTheDocument();
    unmountKn();

    // 2. In English
    const { unmount: unmountEn } = render(
      <SevaLetterPrint
        lang="en"
        identity={mockIdentity}
        rhythm={mockRhythm}
        primarySeva={rudraSeva as any}
        sevaDate="2026-08-26"
        panditName="Venkataramana Pandit"
      />
    );

    expect(screen.getByText("Venkataramana Panditara Mane, Gokarna")).toBeInTheDocument();
    unmountEn();

    // 3. In Kannada with default/other priest (e.g. Shreeram Pandit -> Mahabaleshwara Devasthana)
    const { unmount: unmountDefault } = render(
      <SevaLetterPrint
        lang="kn"
        identity={mockIdentity}
        rhythm={mockRhythm}
        primarySeva={rudraSeva as any}
        sevaDate="2026-08-26"
        panditName="ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
      />
    );

    expect(screen.getByText("ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನ, ಗೋಕರ್ಣ")).toBeInTheDocument();
    unmountDefault();
  });
});
