import { create } from "zustand";
import {
  type ServiceCost,
  type ServiceCategory,
  SERVICE_COIN_COSTS
} from "./walletTypes";
import {
  subscribeServicePricingConfig,
  saveServicePricingConfig,
  LOCAL_STORAGE_SERVICE_PRICING_KEY
} from "../../db/firestoreDb";

export interface PricingConfigState {
  pricing: Record<string, ServiceCost>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
  unsub: (() => void) | null;

  // Getters
  getCoins: (key: string, fallback?: number) => number;
  getCost: (key: string) => ServiceCost;
  getInr: (key: string, fallback?: number) => number;
  getKannadaName: (key: string) => string;

  // Actions
  initSubscription: () => () => void;
  updateSinglePrice: (key: string, coins: number, adminId?: string) => Promise<boolean>;
  saveAllPricing: (newPricing: Record<string, ServiceCost>, adminId?: string) => Promise<boolean>;
  resetToDefaults: (adminId?: string) => Promise<boolean>;
  clearMessages: () => void;
}

function loadInitialPricing(): Record<string, ServiceCost> {
  if (typeof window === "undefined") {
    return { ...SERVICE_COIN_COSTS };
  }
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_SERVICE_PRICING_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
        // Merge with defaults to ensure any new keys exist
        return {
          ...SERVICE_COIN_COSTS,
          ...parsed
        };
      }
    }
  } catch (err) {
    console.warn("[PricingConfigStore] Error reading localStorage cache:", err);
  }
  return { ...SERVICE_COIN_COSTS };
}

export const usePricingConfigStore = create<PricingConfigState>((set, get) => ({
  pricing: loadInitialPricing(),
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
  unsub: null,

  getCoins: (key: string, fallback?: number): number => {
    const item = get().pricing[key] || SERVICE_COIN_COSTS[key];
    if (item && typeof item.coins === "number") {
      return item.coins;
    }
    return fallback ?? 250;
  },

  getCost: (key: string): ServiceCost => {
    return (
      get().pricing[key] ||
      SERVICE_COIN_COSTS[key] || {
        key,
        name: key,
        kannadaName: key,
        coins: 250,
        inrEquivalent: 25,
        description: "",
        category: "sankhyashastra"
      }
    );
  },

  getInr: (key: string, fallback?: number): number => {
    const coins = get().getCoins(key, fallback);
    return Math.round(coins / 10);
  },

  getKannadaName: (key: string): string => {
    const item = get().pricing[key] || SERVICE_COIN_COSTS[key];
    return item?.kannadaName || item?.name || key;
  },

  initSubscription: () => {
    const existingUnsub = get().unsub;
    if (existingUnsub) existingUnsub();

    const unsub = subscribeServicePricingConfig((cloudMap) => {
      if (cloudMap && Object.keys(cloudMap).length > 0) {
        set((state) => ({
          pricing: {
            ...state.pricing,
            ...SERVICE_COIN_COSTS,
            ...cloudMap
          }
        }));
      }
    });

    set({ unsub });
    return unsub;
  },

  updateSinglePrice: async (key: string, coins: number, adminId = "superadmin") => {
    const current = get().pricing;
    const existingItem = current[key] || SERVICE_COIN_COSTS[key];
    if (!existingItem) return false;

    const updatedItem: ServiceCost = {
      ...existingItem,
      coins,
      inrEquivalent: Math.round(coins / 10)
    };

    const newPricing = {
      ...current,
      [key]: updatedItem
    };

    set({ isSaving: true, error: null, successMessage: null });
    const res = await saveServicePricingConfig(newPricing, adminId);
    if (res.success) {
      set({
        pricing: newPricing,
        isSaving: false,
        successMessage: `✅ ಬೆಲೆ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ (${existingItem.kannadaName}: ${coins} ನಾಣ್ಯಗಳು)`
      });
      return true;
    } else {
      set({
        isSaving: false,
        error: res.error || "Failed to update price"
      });
      return false;
    }
  },

  saveAllPricing: async (newPricing: Record<string, ServiceCost>, adminId = "superadmin") => {
    set({ isSaving: true, error: null, successMessage: null });
    const res = await saveServicePricingConfig(newPricing, adminId);
    if (res.success) {
      set({
        pricing: newPricing,
        isSaving: false,
        successMessage: "✅ ಎಲ್ಲಾ ಸೇವಾ ಶುಲ್ಕಗಳ ನಾಣ್ಯ ಬೆಲೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!"
      });
      return true;
    } else {
      set({
        isSaving: false,
        error: res.error || "Failed to save pricing"
      });
      return false;
    }
  },

  resetToDefaults: async (adminId = "superadmin") => {
    set({ isSaving: true, error: null, successMessage: null });
    const defaults = { ...SERVICE_COIN_COSTS };
    const res = await saveServicePricingConfig(defaults, adminId);
    if (res.success) {
      set({
        pricing: defaults,
        isSaving: false,
        successMessage: "✅ ಎಲ್ಲಾ ಸೇವಾ ಶುಲ್ಕಗಳನ್ನು ಮೂಲ ದರಗಳಿಗೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ!"
      });
      return true;
    } else {
      set({
        isSaving: false,
        error: res.error || "Failed to reset pricing"
      });
      return false;
    }
  },

  clearMessages: () => set({ error: null, successMessage: null })
}));

// Initialize subscription on module load in client environments
if (typeof window !== "undefined") {
  usePricingConfigStore.getState().initSubscription();
}
