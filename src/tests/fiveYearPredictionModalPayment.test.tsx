import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { FiveYearPredictionModal } from "../components/fiveYearPrediction/FiveYearPredictionModal";
import type { KundliViewerSession } from "../stores/kundliViewerStore";
import { PlanetName } from "../core/AstroTypes";
import { useWalletStore } from "../features/wallet/walletStore";
import { useAuthStore } from "../features/auth/authStore";

describe("FiveYearPredictionModal Payment Gateway & Verification Guard Audit", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockSession: KundliViewerSession = {
    input: {
      name: "Shreesuma Upadhyaya",
      birthDate: "1994-06-15",
      birthTime: "10:30",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Male"
    },
    birthDateYmd: "1994-06-15",
    birthTimeHm: "10:30",
    homePlaceName: "Gokarna",
    placeLabel: "Gokarna",
    dasha: [],
    dailyPrediction: "",
    result: {
      planets: [
        { name: PlanetName.Sun, degree: 45, rashi: { index: 1, english: "Taurus", sanskrit: "Vrishabha" }, nakshatra: { index: 3, english: "Rohini", sanskrit: "Rohini", deity: "Brahma" }, house: 1 },
        { name: PlanetName.Moon, degree: 140, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 10, english: "Magha", sanskrit: "Magha", deity: "Pitris" }, house: 4 },
        { name: PlanetName.Mars, degree: 15, rashi: { index: 0, english: "Aries", sanskrit: "Mesha" }, nakshatra: { index: 1, english: "Ashwini", sanskrit: "Ashwini", deity: "Ashwins" }, house: 1 },
        { name: PlanetName.Mercury, degree: 60, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 5, english: "Mrigashira", sanskrit: "Mrigashira", deity: "Soma" }, house: 2 },
        { name: PlanetName.Jupiter, degree: 120, rashi: { index: 3, english: "Cancer", sanskrit: "Karka" }, nakshatra: { index: 8, english: "Pushya", sanskrit: "Pushya", deity: "Brihaspati" }, house: 3 },
        { name: PlanetName.Venus, degree: 90, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 6, english: "Ardra", sanskrit: "Ardra", deity: "Rudra" }, house: 2 },
        { name: PlanetName.Saturn, degree: 210, rashi: { index: 7, english: "Scorpio", sanskrit: "Vrischika" }, nakshatra: { index: 16, english: "Vishakha", sanskrit: "Vishakha", deity: "Indragni" }, house: 7 },
        { name: PlanetName.Rahu, degree: 330, rashi: { index: 10, english: "Aquarius", sanskrit: "Kumbha" }, nakshatra: { index: 24, english: "Shatabhisha", sanskrit: "Shatabhisha", deity: "Varuna" }, house: 10 },
        { name: PlanetName.Ketu, degree: 150, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 11, english: "Purva Phalguni", sanskrit: "Purva Phalguni", deity: "Bhaga" }, house: 4 }
      ],
      houses: Array.from({ length: 12 }, (_, i) => i * 30),
      ascendant: 15,
      lagnaRashi: { index: 0, english: "Aries", sanskrit: "Mesha" },
      moonSign: { index: 4, english: "Leo", sanskrit: "Simha" },
      sunSign: { index: 1, english: "Taurus", sanskrit: "Vrishabha" },
      moonPada: 4
    } as any
  };

  it("renders modal with priest UPI ID 9108135387@ybl, ₹350 standard vs ₹450 remedy package, and locks download button until payment verification", async () => {
    const onDownloadPdf = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <FiveYearPredictionModal
        isOpen={true}
        onClose={onClose}
        session={mockSession}
        onDownloadPdf={onDownloadPdf}
        isGeneratingPdf={false}
        pdfProgress={0}
        pdfStageText=""
      />
    );

    // Verify Priest Details & Package Tiers
    expect(screen.getByText(/Shreeram Pandit/i)).toBeInTheDocument();
    expect(screen.getByText(/9108135387@ybl/i)).toBeInTheDocument();
    
    // Check both package prices are visible
    const matches350 = screen.getAllByText(/350|೩೫೦/i);
    expect(matches350.length).toBeGreaterThanOrEqual(1);

    const matches450 = screen.getAllByText(/450|೪೫೦/i);
    expect(matches450.length).toBeGreaterThanOrEqual(1);

    // Verify Download Button is Disabled & Shows Lock
    const downloadBtn = screen.getByRole("button", { name: /🔒/i });
    expect(downloadBtn).toBeInTheDocument();
    expect(downloadBtn).toBeDisabled();

    // Clicking when locked does not trigger download
    fireEvent.click(downloadBtn);
    expect(onDownloadPdf).not.toHaveBeenCalled();
  });

  it("unlocks download button when valid UTR is verified", async () => {
    const onDownloadPdf = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <FiveYearPredictionModal
        isOpen={true}
        onClose={onClose}
        session={mockSession}
        onDownloadPdf={onDownloadPdf}
        isGeneratingPdf={false}
        pdfProgress={0}
        pdfStageText=""
      />
    );

    // Input UTR Number
    const utrInput = screen.getByPlaceholderText(/412389123456/i);
    fireEvent.change(utrInput, { target: { value: "412389776655" } });

    // Click Verify Button (exact button text "ದೃಢೀಕರಿಸಿ")
    const verifyBtn = screen.getByRole("button", { name: /^ದೃಢೀಕರಿಸಿ$/i });
    fireEvent.click(verifyBtn);

    // Verify Payment Verified State
    await waitFor(() => {
      expect(screen.getByText(/ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢಪಟ್ಟಿದೆ/i)).toBeInTheDocument();
    });

    // Check Download button is now unlocked
    const unlockedDownloadBtn = screen.getByRole("button", { name: /ದೃಢಪಟ್ಟಿದೆ/i });
    expect(unlockedDownloadBtn).not.toBeDisabled();

    // Clicking unlocked download button triggers download
    fireEvent.click(unlockedDownloadBtn);
    await waitFor(() => {
      expect(onDownloadPdf).toHaveBeenCalledTimes(1);
      expect(onDownloadPdf).toHaveBeenCalledWith("kn");
    });
  });

  it("supports Wallet Coins payment deduction (3,500 coins for Standard, 4,500 coins for Remedy package)", async () => {
    // Set wallet store balance
    useWalletStore.setState({
      wallet: {
        id: "wallet_1",
        userId: "user_1",
        priestName: "Shreeram Pandit",
        coinBalance: 10000,
        totalRechargedInr: 1000,
        totalCoinsCredited: 10000,
        totalCoinsSpent: 0,
        updatedAt: new Date().toISOString()
      } as any
    });

    const onDownloadPdf = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <FiveYearPredictionModal
        isOpen={true}
        onClose={onClose}
        session={mockSession}
        onDownloadPdf={onDownloadPdf}
        isGeneratingPdf={false}
        pdfProgress={0}
        pdfStageText=""
      />
    );

    // Switch to Wallet Tab (find button containing "ವ್ಯಾಲೆಟ್")
    const buttons = screen.getAllByRole("button");
    const walletTabBtn = buttons.find(b => b.textContent?.includes("ವ್ಯಾಲೆಟ್"));
    expect(walletTabBtn).toBeDefined();
    fireEvent.click(walletTabBtn!);

    // Check coin deduction button for Standard package (3,500 coins -> ೩೫೦೦)
    const deductBtn = screen.getByRole("button", { name: /೩೫೦೦ ನಾಣ್ಯಗಳನ್ನು ಕಡಿತಗೊಳಿಸಿ/i });
    expect(deductBtn).toBeInTheDocument();

    fireEvent.click(deductBtn);

    // Verify Payment Verified State
    await waitFor(() => {
      expect(screen.getByText(/ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢಪಟ್ಟಿದೆ/i)).toBeInTheDocument();
      expect(screen.getByText(/3,500 Coins Deducted/i)).toBeInTheDocument();
    });

    // Verify Download Button unlocked
    const unlockedDownloadBtn = screen.getByRole("button", { name: /ದೃಢಪಟ್ಟಿದೆ/i });
    expect(unlockedDownloadBtn).not.toBeDisabled();
  });

  it("provides Super Admin unrestricted VIP access without requiring payment verification or coin deductions", async () => {
    // Authenticate as Super Admin
    useAuthStore.setState({
      currentUser: "ShriSuma",
      role: "superadmin",
      isAuthenticated: true
    });

    const onDownloadPdf = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <FiveYearPredictionModal
        isOpen={true}
        onClose={onClose}
        session={mockSession}
        onDownloadPdf={onDownloadPdf}
        isGeneratingPdf={false}
        pdfProgress={0}
        pdfStageText=""
      />
    );

    // Verify Super Admin VIP Banner is displayed
    expect(screen.getByText(/ಸೂಪರ್ ಅಡ್ಮಿನ್ ವಿಶೇಷ ಪ್ರವೇಶ/i)).toBeInTheDocument();
    expect(screen.getByText(/ಅನಿಯಮಿತ ಉಚಿತ ಡೌನ್‌ಲೋಡ್/i)).toBeInTheDocument();

    // Verify Download Button is immediately unlocked (with 👑 icon and instant download text)
    const vipDownloadBtn = screen.getByRole("button", { name: /👑/i });
    expect(vipDownloadBtn).toBeInTheDocument();
    expect(vipDownloadBtn).not.toBeDisabled();

    // Clicking downloads immediately with zero barriers
    fireEvent.click(vipDownloadBtn);
    await waitFor(() => {
      expect(onDownloadPdf).toHaveBeenCalledTimes(1);
      expect(onDownloadPdf).toHaveBeenCalledWith("kn");
    });

    // Reset Auth Store
    useAuthStore.setState({ currentUser: "baggona", role: "priest", isAuthenticated: true });
  });
});
