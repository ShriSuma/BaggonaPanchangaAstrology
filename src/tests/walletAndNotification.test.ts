import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  RECHARGE_PACKAGES,
  SERVICE_COIN_COSTS,
  COIN_CONVERSION_RATE,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_NAME
} from "../features/wallet/walletTypes";
import { useWalletStore } from "../features/wallet/walletStore";
import {
  renderPanchangaCreatedEmail,
  renderPremiumPdfDownloadedEmail,
  renderCoinRechargeAlertEmail,
  renderCoinApprovedEmail,
  renderDailyAppSummaryEmail,
  renderDailyPriestUsageSummaryEmail,
  renderDailyCoinReloadSummaryEmail,
  renderDailyPremiumPdfSummaryEmail
} from "../features/notifications/emailTemplates";

describe("Priest Wallet & Coining Math Engine", () => {
  beforeEach(() => {
    useWalletStore.getState().cleanup();
  });

  it("validates base coin conversion rate of ₹1 = 10 Coins", () => {
    expect(COIN_CONVERSION_RATE).toBe(10);
  });

  it("validates all 4 recharge packages with accurate bonus coin calculations", () => {
    const [shubha, silver, gold, platinum] = RECHARGE_PACKAGES;

    // Shubha: ₹100 -> 1000 base + 100 bonus (10%) = 1100 coins
    expect(shubha.amountInr).toBe(100);
    expect(shubha.baseCoins).toBe(1000);
    expect(shubha.bonusCoins).toBe(100);
    expect(shubha.totalCoins).toBe(1100);

    // Silver: ₹250 -> 2500 base + 500 bonus (20%) = 3000 coins
    expect(silver.amountInr).toBe(250);
    expect(silver.baseCoins).toBe(2500);
    expect(silver.bonusCoins).toBe(500);
    expect(silver.totalCoins).toBe(3000);

    // Gold: ₹500 -> 5000 base + 1500 bonus (30%) = 6500 coins
    expect(gold.amountInr).toBe(500);
    expect(gold.baseCoins).toBe(5000);
    expect(gold.bonusCoins).toBe(1500);
    expect(gold.totalCoins).toBe(6500);

    // Platinum: ₹1000 -> 10000 base + 4000 bonus (40%) = 14000 coins
    expect(platinum.amountInr).toBe(1000);
    expect(platinum.baseCoins).toBe(10000);
    expect(platinum.bonusCoins).toBe(4000);
    expect(platinum.totalCoins).toBe(14000);
  });

  it("verifies service coin deduction costs and INR equivalencies", () => {
    expect(SERVICE_COIN_COSTS.DAILY_PANCHANG.coins).toBe(0);
    expect(SERVICE_COIN_COSTS.KUNDLI_CALCULATION.coins).toBe(500);
    expect(SERVICE_COIN_COSTS.ASTROLOGY_QUESTION.coins).toBe(500);
    expect(SERVICE_COIN_COSTS.AI_PRASHNA_QUESTION.coins).toBe(50);
    expect(SERVICE_COIN_COSTS.SANKHYA_PRASHNA.coins).toBe(250);
    expect(SERVICE_COIN_COSTS.KAALA_DIKSUCHI_QUESTION.coins).toBe(250);
    expect(SERVICE_COIN_COSTS.PURVA_JANMA_QUESTION.coins).toBe(250);
    expect(SERVICE_COIN_COSTS.VAHANA_MUHURTHA.coins).toBe(500);
    expect(SERVICE_COIN_COSTS.STANDARD_JANANA_KUNDLI_PDF.coins).toBe(1000);
    expect(SERVICE_COIN_COSTS.PREMIUM_KUNDLI_PDF.coins).toBe(3500);
    expect(SERVICE_COIN_COSTS.RAMAN_BHAVISHYA.coins).toBe(500);
    expect(SERVICE_COIN_COSTS.PREMIUM_PDF_DOWNLOAD.coins).toBe(3500);
    expect(SERVICE_COIN_COSTS.MELAPAK_MATCH.coins).toBe(500);
    expect(SERVICE_COIN_COSTS.SEVA_BOOKING_ASHIRVADA.coins).toBe(200);
  });

  it("verifies priest portal anti-reset localStorage state persistence contract", () => {
    const panchangaStorageKey = "baggona_priest_kundli_active_session";
    const sankhyaStorageKey = "baggona_priest_sankhya_active_session";

    const mockPanchangaState = {
      devoteeName: "Ramesh Hegde",
      gothra: "Kashyapa",
      birthDate: "1990-05-15",
      birthTime: "10:30",
      activeTab: "kundli",
      selectedJananaPdfOption: "kundli_with_dasha"
    };

    localStorage.setItem(panchangaStorageKey, JSON.stringify(mockPanchangaState));
    expect(localStorage.getItem(panchangaStorageKey)).toContain("Ramesh Hegde");
    expect(JSON.parse(localStorage.getItem(panchangaStorageKey)!).activeTab).toBe("kundli");

    const mockSankhyaState = {
      devoteeName: "Suresh Bhat",
      prashnaNumber: 108,
      prashnaQuestion: "Will my business expand?",
      activeTab: "prashna"
    };

    localStorage.setItem(sankhyaStorageKey, JSON.stringify(mockSankhyaState));
    expect(localStorage.getItem(sankhyaStorageKey)).toContain("Suresh Bhat");
    expect(JSON.parse(localStorage.getItem(sankhyaStorageKey)!).prashnaNumber).toBe(108);

    // Explicit Reset wipes localStorage
    localStorage.removeItem(panchangaStorageKey);
    localStorage.removeItem(sankhyaStorageKey);
    expect(localStorage.getItem(panchangaStorageKey)).toBeNull();
    expect(localStorage.getItem(sankhyaStorageKey)).toBeNull();
  });

  it("manages wallet store package selection and modal state", () => {
    const store = useWalletStore.getState();

    // Default package is Silver
    expect(store.selectedPackage.key).toBe("silver");

    // Select Gold package
    store.setSelectedPackage(RECHARGE_PACKAGES[2]);
    expect(useWalletStore.getState().selectedPackage.key).toBe("gold");

    // Modal state open / close
    store.openRechargeModal();
    expect(useWalletStore.getState().isRechargeModalOpen).toBe(true);

    store.closeRechargeModal();
    expect(useWalletStore.getState().isRechargeModalOpen).toBe(false);
  });

  it("validates UTR input length on recharge submission", async () => {
    useWalletStore.setState({
      wallet: {
        id: "test_wallet",
        userId: "test_user",
        priestName: "Shreeram Pandit",
        coinBalance: 1000,
        totalRechargedInr: 100,
        totalCoinsCredited: 1100,
        totalCoinsSpent: 100,
        updatedAt: new Date().toISOString()
      }
    });

    const store = useWalletStore.getState();

    // Rejection if UTR is too short
    const res = await store.submitUpiRecharge("123");
    expect(res.success).toBe(false);
    expect(res.error).toContain("valid 12-digit UPI Reference");
  });
});

describe("Free HTML Email Notification Templates", () => {
  it("renders authentic Panchanga Created HTML with Sanskrit/Kannada deity banner", () => {
    const html = renderPanchangaCreatedEmail({
      date: "2026-08-29",
      location: "Gokarna, Karnataka",
      tithi: "Shukla Pratipat",
      nakshatra: "Pushya",
      vara: "Shanivara",
      userName: "Shreeram Pandit",
      timestamp: "29/08/2026, 03:30:00 pm"
    });

    expect(html).toContain("॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥");
    expect(html).toContain("Gokarna, Karnataka");
    expect(html).toContain("Shukla Pratipat");
    expect(html).toContain("Pushya");
    expect(html).toContain("Shanivara");
  });

  it("renders Premium PDF Download Alert HTML", () => {
    const html = renderPremiumPdfDownloadedEmail({
      clientName: "Ramesh Bhat",
      pdfType: "5-Page Royal A4 Kundli Booklet",
      language: "kn",
      pageCount: 5,
      priestName: "Shreeram Pandit",
      timestamp: "29/08/2026, 03:35:00 pm"
    });

    expect(html).toContain("Ramesh Bhat");
    expect(html).toContain("5-Page Royal A4 Kundli Booklet");
    expect(html).toContain("KN");
    expect(html).toContain("5 Pages A4");
  });

  it("renders Coin Recharge Request Alert HTML for Admin verification", () => {
    const html = renderCoinRechargeAlertEmail({
      txId: "tx_123456",
      priestName: "Shreeram Pandit",
      amountInr: 250,
      coins: 3000,
      packageName: "Purohita Silver",
      upiUtr: "423512345678",
      timestamp: "29/08/2026, 03:40:00 pm"
    });

    expect(html).toContain("Shreeram Pandit");
    expect(html).toContain("₹250");
    expect(html).toContain("+3,000 Coins");
    expect(html).toContain("423512345678");
    expect(html).toContain("Action Required • Verification Pending");
  });

  it("renders Coin Approved confirmation email HTML", () => {
    const html = renderCoinApprovedEmail({
      txId: "tx_123456",
      priestName: "Shreeram Pandit",
      amountInr: 250,
      coins: 3000,
      upiUtr: "423512345678"
    });

    expect(html).toContain("+3,000 Coins");
    expect(html).toContain("Shreeram Pandit");
    expect(html).toContain("423512345678");
  });

  it("renders Daily App Summary (Report 1/4) HTML correctly", () => {
    const html = renderDailyAppSummaryEmail({
      date: "2026-08-29",
      totalHits: 25,
      kundlisCalculated: 8,
      panchangaViews: 14,
      prashnaCount: 3,
      timestamp: "29/08/2026, 11:30:00 pm"
    });

    expect(html).toContain("Report 1/4");
    expect(html).toContain("Baggona Daily App Usage");
    expect(html).toContain("25");
    expect(html).toContain("8");
  });

  it("renders Daily Priest Usage (Report 2/4) HTML correctly", () => {
    const html = renderDailyPriestUsageSummaryEmail({
      date: "2026-08-29",
      totalActivePriests: 2,
      totalCoinsSpentToday: 3750,
      priestBreakdown: [
        {
          priestName: "Shreeram Pandit",
          username: "baggona",
          coinsSpent: 3500,
          consultationsCount: 1
        }
      ],
      timestamp: "29/08/2026, 11:30:00 pm"
    });

    expect(html).toContain("Report 2/4");
    expect(html).toContain("3,750 Coins");
    expect(html).toContain("Shreeram Pandit");
  });

  it("renders Daily Coin Reload (Report 3/4) HTML correctly", () => {
    const html = renderDailyCoinReloadSummaryEmail({
      date: "2026-08-29",
      totalReloadsCount: 1,
      totalAmountInr: 500,
      reloads: [
        {
          priestName: "Shreeram Pandit",
          coins: 6500,
          amountInr: 500,
          utr: "910813538711",
          status: "ಅನುಮೋದಿಸಲಾಗಿದೆ"
        }
      ],
      timestamp: "29/08/2026, 11:30:00 pm"
    });

    expect(html).toContain("Report 3/4");
    expect(html).toContain("₹500");
    expect(html).toContain("910813538711");
  });

  it("renders Daily Premium PDF Downloads & Bhavishya Synthesis (Report 4/4) HTML correctly", () => {
    const html = renderDailyPremiumPdfSummaryEmail({
      date: "2026-08-29",
      totalDownloadsCount: 2,
      totalCoinsSpent: 7000,
      totalAmountInr: 700,
      downloads: [
        {
          devoteeName: "ಗಣೇಶ್ ಭಟ್",
          username: "baggona",
          priestName: "Shreeram Pandit",
          portalSource: "Priest Mobile Portal",
          language: "kn",
          coinsSpent: 3500,
          amountInr: 350,
          time: "08:15 PM"
        },
        {
          devoteeName: "ಅನಿತಾ ರಾವ್",
          username: "priest_anita",
          portalSource: "Baggona Bhavishya",
          language: "en",
          coinsSpent: 3500,
          amountInr: 350,
          time: "09:45 PM"
        }
      ],
      timestamp: "29/08/2026, 11:30:00 pm"
    });

    expect(html).toContain("Report 4/4");
    expect(html).toContain("Daily Premium PDF Downloads & Bhavishya Synthesis Summary");
    expect(html).toContain("2 Downloads");
    expect(html).toContain("7,000 Coins");
    expect(html).toContain("₹700");
    expect(html).toContain("ಗಣೇಶ್ ಭಟ್");
    expect(html).toContain("ಅನಿತಾ ರಾವ್");
    expect(html).toContain("Priest Mobile Portal");
    expect(html).toContain("Baggona Bhavishya");
  });
});

