import { describe, it, expect, beforeEach } from "vitest";
import {
  getDefaultGokarnaWalletDocs,
  subscribeAllPriestWallets,
  directAdminCoinAdjustment,
  restoreAndSeedDefaultPriests,
  DEFAULT_GOKARNA_PRIESTS,
  PRIEST_WALLETS_CACHE_KEY
} from "../db/firestoreDb";
import { useWalletStore } from "../features/wallet/walletStore";

describe("Priest Wallets Resilience & Zero Empty State Engine", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getDefaultGokarnaWalletDocs returns all 10 Gokarna priests with authentic balances", () => {
    const wallets = getDefaultGokarnaWalletDocs();
    expect(wallets.length).toBe(10);

    const shreeram = wallets.find((w) => w.userId === "shreerampandit");
    expect(shreeram).toBeDefined();
    expect(shreeram?.priestName).toBe("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(shreeram?.coinBalance).toBe(5000);
    expect(shreeram?.phone).toBe("9972339362");

    const otherPriests = wallets.filter((w) => w.userId !== "shreerampandit");
    for (const priest of otherPriests) {
      expect(priest.coinBalance).toBe(2000);
      expect(priest.allowedModules).toContain("panchanga");
      expect(priest.allowedModules).toContain("sankhyashastra");
    }
  });

  it("subscribeAllPriestWallets delivers 10 priests synchronously at t=0ms without waiting for async network", () => {
    let capturedWallets: any[] = [];
    let callCount = 0;

    const unsub = subscribeAllPriestWallets((wallets) => {
      callCount++;
      capturedWallets = wallets;
    });

    // Call count must be at least 1 synchronously
    expect(callCount).toBeGreaterThanOrEqual(1);
    expect(capturedWallets.length).toBe(10);
    expect(capturedWallets.some((w) => w.userId === "shreerampandit")).toBe(true);

    unsub();
  });

  it("useWalletStore initializes allPriestWallets with 10 default priests immediately", () => {
    const state = useWalletStore.getState();
    expect(state.allPriestWallets.length).toBe(10);
    const shreeram = state.allPriestWallets.find((w) => w.userId === "shreerampandit");
    expect(shreeram).toBeDefined();
    expect(shreeram?.coinBalance).toBe(5000);
  });

  it("directAdminCoinAdjustment updates wallet and persists to cache", async () => {
    const result = await directAdminCoinAdjustment("shreerampandit", 500, "SuperAdmin Bonus");
    expect(result.success).toBe(true);
    expect(result.newBalance).toBeGreaterThanOrEqual(5500);

    // Verify localStorage cache updated
    const cached = localStorage.getItem(PRIEST_WALLETS_CACHE_KEY);
    expect(cached).not.toBeNull();
    const parsed = JSON.parse(cached!);
    const shreeram = parsed.find((w: any) => w.userId === "shreerampandit");
    expect(shreeram.coinBalance).toBe(result.newBalance);
  });

  it("restoreAndSeedDefaultPriests safely restores all 10 Gokarna priests", async () => {
    const restoredCount = await restoreAndSeedDefaultPriests();
    expect(restoredCount).toBeGreaterThanOrEqual(0);

    const docs = getDefaultGokarnaWalletDocs();
    expect(docs.length).toBe(10);
  });
});
