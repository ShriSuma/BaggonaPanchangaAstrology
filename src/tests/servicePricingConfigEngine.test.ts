import { describe, it, expect, beforeEach } from "vitest";
import { usePricingConfigStore } from "../features/wallet/pricingConfigStore";
import { useWalletStore } from "../features/wallet/walletStore";
import { SERVICE_COIN_COSTS } from "../features/wallet/walletTypes";

describe("Dynamic Service Coin Pricing Engine & Visual Deduction", () => {
  beforeEach(() => {
    // Reset store state
    usePricingConfigStore.setState({
      pricing: { ...SERVICE_COIN_COSTS },
      isLoading: false,
      isSaving: false,
      error: null,
      successMessage: null
    });
  });

  it("1. Initializes with authentic requested default coin pricing across all modules", () => {
    const { getCoins, getInr, getKannadaName } = usePricingConfigStore.getState();

    // Sankhya Shastra (250 for prashna, 500 for name/degree, 500 for vehicle)
    expect(getCoins("SANKHYA_PRASHNA")).toBe(250);
    expect(getInr("SANKHYA_PRASHNA")).toBe(25);
    expect(getKannadaName("SANKHYA_PRASHNA")).toContain("ಪ್ರಶ್ನಾವಳಿ");

    expect(getCoins("SANKHYA_NAME_SUGGESTION")).toBe(500);
    expect(getInr("SANKHYA_NAME_SUGGESTION")).toBe(50);
    expect(getKannadaName("SANKHYA_NAME_SUGGESTION")).toContain("ಶುಭ ನಾಮ");

    expect(getCoins("SANKHYA_MOBILE_VEHICLE")).toBe(500);
    expect(getInr("SANKHYA_MOBILE_VEHICLE")).toBe(50);

    // Divine Tools (Diksuchi 200, Hindina Janma 200)
    expect(getCoins("KAALA_DIKSUCHI_QUESTION")).toBe(200);
    expect(getInr("KAALA_DIKSUCHI_QUESTION")).toBe(20);

    expect(getCoins("PURVA_JANMA_QUESTION")).toBe(200);
    expect(getInr("PURVA_JANMA_QUESTION")).toBe(20);

    // Muhurtha & Kundli (500)
    expect(getCoins("VAHANA_MUHURTHA")).toBe(500);
    expect(getInr("VAHANA_MUHURTHA")).toBe(50);

    expect(getCoins("KUNDLI_CALCULATION")).toBe(500);
    expect(getCoins("ASTROLOGY_QUESTION")).toBe(500);

    // Reports & Public Kundli
    expect(getCoins("STANDARD_JANANA_KUNDLI_PDF")).toBe(1000);
    expect(getCoins("PREMIUM_KUNDLI_PDF")).toBe(3500);
    expect(getCoins("PUBLIC_KUNDLI_GENERATION")).toBe(500);
    expect(getCoins("PUBLIC_PERSONALITY_UNLOCK")).toBe(1000);
    expect(getInr("PUBLIC_PERSONALITY_UNLOCK")).toBe(100);
    expect(getKannadaName("PUBLIC_PERSONALITY_UNLOCK")).toContain("ವ್ಯಕ್ತಿತ್ವ & ನಿಗೂಢ ರಹಸ್ಯ");
  });

  it("2. Super Admin can update individual service price dynamically", async () => {
    const store = usePricingConfigStore.getState();

    // Update Prashna to 300 coins
    const success = await store.updateSinglePrice("SANKHYA_PRASHNA", 300, "SuperAdmin_Test");
    expect(success).toBe(true);

    const updatedCoins = usePricingConfigStore.getState().getCoins("SANKHYA_PRASHNA");
    const updatedInr = usePricingConfigStore.getState().getInr("SANKHYA_PRASHNA");
    expect(updatedCoins).toBe(300);
    expect(updatedInr).toBe(30);
  });

  it("3. Super Admin can save batch pricing updates and reset to defaults", async () => {
    const store = usePricingConfigStore.getState();
    const current = { ...store.pricing };

    current.KAALA_DIKSUCHI_QUESTION = {
      ...current.KAALA_DIKSUCHI_QUESTION,
      coins: 220,
      inrEquivalent: 22
    };

    current.PURVA_JANMA_QUESTION = {
      ...current.PURVA_JANMA_QUESTION,
      coins: 250,
      inrEquivalent: 25
    };

    const saveRes = await store.saveAllPricing(current, "SuperAdmin_Batch");
    expect(saveRes).toBe(true);
    expect(usePricingConfigStore.getState().getCoins("KAALA_DIKSUCHI_QUESTION")).toBe(220);
    expect(usePricingConfigStore.getState().getCoins("PURVA_JANMA_QUESTION")).toBe(250);

    // Reset to defaults
    const resetRes = await store.resetToDefaults("SuperAdmin_Reset");
    expect(resetRes).toBe(true);
    expect(usePricingConfigStore.getState().getCoins("KAALA_DIKSUCHI_QUESTION")).toBe(200);
    expect(usePricingConfigStore.getState().getCoins("PURVA_JANMA_QUESTION")).toBe(200);
  });

  it("4. Floating deduction animation registers and clears smoothly", async () => {
    const { getOrCreatePriestWallet, directAdminCoinAdjustment } = await import("../db/firestoreDb");
    const initialWallet = await getOrCreatePriestWallet("test_priest_pricing", "Test Priest");
    await directAdminCoinAdjustment("test_priest_pricing", 5000, "Initial test credit");

    // Initialize wallet in store
    await useWalletStore.getState().initWallet("test_priest_pricing", "Test Priest");

    const res = await useWalletStore.getState().deductForService(250, "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ", "Devotee Test");
    expect(res.success).toBe(true);

    const deductions = useWalletStore.getState().recentDeductions;
    expect(deductions.length).toBeGreaterThan(0);
    expect(deductions[0].coins).toBe(250);
    expect(deductions[0].serviceName).toBe("ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ");

    // Clear deduction
    useWalletStore.getState().clearRecentDeduction(deductions[0].id);
    expect(useWalletStore.getState().recentDeductions.length).toBe(0);
  });
});
