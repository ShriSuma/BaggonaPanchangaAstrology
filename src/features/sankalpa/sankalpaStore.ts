/**
 * Devotee Personal Sankalpa State & CRUD Engine (ದೈವಿಕ ಸಂಕಲ್ಪ ನಿರ್ವಹಣಾ ತಂತ್ರಾಂಶ)
 * 
 * Allows devotees to maintain their custom list of sacred prayer intentions (Sankalpas),
 * choose from authentic Vedic presets, toggle active prayers for the day, and dynamically
 * inject these intentions into the 3-to-5 Minute Daily Deva Pooja Vedic Mantra.
 */

import { create } from "zustand";
import { db, type UserSankalpaRecord, type SankalpaCategory } from "../../db/indexedDb";
import { syncDevoteeSankalpaToCloud, getDevoteeSankalpasFromCloud, deleteDevoteeSankalpaFromCloud } from "../../db/firestoreDb";

export interface SankalpaPreset {
  category: SankalpaCategory;
  icon: string;
  titleKn: string;
  titleEn: string;
  descriptionKn: string;
  descriptionEn: string;
  sanskritPhrasing: string;
}

export const SANKALPA_PRESETS: SankalpaPreset[] = [
  {
    category: "aarogya",
    icon: "🌿",
    titleKn: "ಆರೋಗ್ಯ & ಆಯುರ್ವೃದ್ಧಿ",
    titleEn: "Good Health & Longevity",
    descriptionKn: "ಕುಟುಂಬದ ಸಮಸ್ತ ಸದಸ್ಯರಿಗೆ ಸಕಲ ದೈಹಿಕ, ಮಾನಸಿಕ ಆರೋಗ್ಯ, ಧೈರ್ಯ ಹಾಗೂ ಆಯುರ್ವೃದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
    descriptionEn: "Divine blessings for radiant health, mental peace, vitality, and longevity for all family members.",
    sanskritPhrasing: "ಮಮ ಕುಟುಂಬಸ್ಯ ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ"
  },
  {
    category: "shanti",
    icon: "🕊️",
    titleKn: "ಮನಶ್ಶಾಂತಿ & ಗೃಹಶಾಂತಿ",
    titleEn: "Inner Peace & Domestic Harmony",
    descriptionKn: "ಮನೆಯಲ್ಲಿ ಸದಾ ಸುಖ, ಶಾಂತಿ, ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ನೆಲೆಸಿ, ಸರ್ವ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ನಿವಾರಣೆಯಾಗಲಿ.",
    descriptionEn: "Removal of all negative influences, blessing our home with peace, affection, and mutual harmony.",
    sanskritPhrasing: "ಸರ್ವ ಮನಃಶಾಂತಿ, ಗೃಹಶಾಂತಿ, ಧನಧಾನ್ಯ ಸಮೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ"
  },
  {
    category: "vidya",
    icon: "📚",
    titleKn: "ವಿದ್ಯಾಭ್ಯಾಸ, ಜ್ಞಾನ & ಏಕಾಗ್ರತೆ",
    titleEn: "Education, Wisdom & Focus",
    descriptionKn: "ಮಕ್ಕಳಿಗೆ ಮತ್ತು ಸಾಧಕರಿಗೆ ಸದ್ವಿದ್ಯೆ, ಉತ್ತಮ ಜ್ಞಾನ, ನೆನಪಿನ ಶಕ್ತಿ ಹಾಗೂ ಏಕಾಗ್ರತೆ ಸಿದ್ಧಿಸಲಿ.",
    descriptionEn: "Divine grace for sharp intellect, supreme memory, focus, and excellence in academic pursuits.",
    sanskritPhrasing: "ಸಕಲ ಸದ್ವಿದ್ಯಾ, ಬುದ್ಧಿ, ಜ್ಞಾನ, ಏಕಾಗ್ರತಾ ಸಿದ್ಧ್ಯರ್ಥಂ"
  },
  {
    category: "udyoga",
    icon: "💼",
    titleKn: "ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ & ಕೀರ್ತಿ",
    titleEn: "Career, Business & Success",
    descriptionKn: "ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಉನ್ನತಿ, ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ, ಸಮಾಜದಲ್ಲಿ ಸತ್ಕೀರ್ತಿ ಹಾಗೂ ಯಶಸ್ಸು ದೊರೆಯಲಿ.",
    descriptionEn: "Flourishing growth in professional career, business profitability, and respectable societal standing.",
    sanskritPhrasing: "ಸತ್ ಉದ್ಯೋಗ, ವ್ಯಾಪಾರಾಭಿವೃದ್ಧಿ, ಕೀರ್ತಿ-ಯಶೋವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ"
  },
  {
    category: "santana",
    icon: "👶",
    titleKn: "ಸಂತಾನ ಭಾಗ್ಯ & ಕಲ್ಯಾಣ",
    titleEn: "Progeny & Family Flourishing",
    descriptionKn: "ಉತ್ತಮ ಸತ್ಸಂತಾನ ಭಾಗ್ಯ, ಮಕ್ಕಳ ಶ್ರೇಯೋಭಿವೃದ್ಧಿ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
    descriptionEn: "Blessings for healthy progeny, children's holistic well-being, and family continuity.",
    sanskritPhrasing: "ಸತ್ಸಂತಾನ ಪ್ರಾಪ್ತಿ, ಸಂತಾನ ಶ್ರೇಯೋಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ"
  },
  {
    category: "vivaha",
    icon: "💍",
    titleKn: "ಮಂಗಳ ವಿವಾಹ & ಸುಖ ದಾಂಪತ್ಯ",
    titleEn: "Auspicious Marriage & Matrimony",
    descriptionKn: "ಶೀಘ್ರ ಸುಯೋಗ್ಯ ಕಂಕಣ ಭಾಗ್ಯ, ಸತ್ಸಂಬಂಧ ಹಾಗೂ ಆನಂದದಾಯಕ ಸುಖ ದಾಂಪತ್ಯ ಸಿದ್ಧಿಸಲಿ.",
    descriptionEn: "Removal of marital delays, finding a righteous partner, and enjoying blissful married life.",
    sanskritPhrasing: "ಶೀಘ್ರ ಮಂಗಳ ವಿವಾಹ ಸಿದ್ಧಿ, ಅನ್ಯೋನ್ಯ ಸುಖ ದಾಂಪತ್ಯ ಸಿದ್ಧ್ಯರ್ಥಂ"
  },
  {
    category: "dhana",
    icon: "🪙",
    titleKn: "ಧನ-ಧಾನ್ಯ, ಋಣಮುಕ್ತಿ & ಸಮೃದ್ಧಿ",
    titleEn: "Prosperity, Wealth & Debt Relief",
    descriptionKn: "ಸಮಸ್ತ ಸಾಲ-ಋಣ ಬಾಧೆಗಳಿಂದ ಮುಕ್ತಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಮಹಾಲಕ್ಷ್ಮಿಯ ಕೃಪಾಕಟಾಕ್ಷ ಲಭಿಸಲಿ.",
    descriptionEn: "Complete freedom from financial debts, monetary abundance, and Goddess Mahalakshmi's graceful benevolence.",
    sanskritPhrasing: "ಸಮಸ್ತ ಋಣಮುಕ್ತಿ, ಧನ-ಧಾನ್ಯ ಸಮೃದ್ಧಿ, ಲಕ್ಷ್ಮೀ ಕೃಪಾಕಟಾಕ್ಷ ಸಿದ್ಧ್ಯರ್ಥಂ"
  },
  {
    category: "custom",
    icon: "✨",
    titleKn: "ವಿಶೇಷ ವೈಯಕ್ತಿಕ ಪ್ರಾರ್ಥನೆ",
    titleEn: "Custom Personal Devotional Prayer",
    descriptionKn: "ನನ್ನ ಮನಸ್ಸಿನ ಇಷ್ಟಾರ್ಥಗಳು ಶ್ರೀ ದೇವತಾ ಅನುಗ್ರಹದಿಂದ ಸಫಲವಾಗಲಿ.",
    descriptionEn: "May all pure, heartfelt aspirations be fulfilled with the divine blessings of Almighty.",
    sanskritPhrasing: "ಸಮಸ್ತ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ, ಸಕಲ ಸತ್ಕಾರ್ಯ ಜಯಸಿದ್ಧ್ಯರ್ಥಂ"
  }
];

export function getDefaultSankalpas(userId: string, devoteeName: string = "ಭಕ್ತ"): UserSankalpaRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: `sankalpa_def_1_${userId}`,
      userId,
      devoteeName,
      category: "aarogya",
      title: "ಆರೋಗ್ಯ & ಆಯುರ್ವೃದ್ಧಿ (Good Health & Vitality)",
      description: "ನನ್ನ ಕುಟುಂಬದ ಸಮಸ್ತ ಸದಸ್ಯರಿಗೆ ಸಕಲ ದೈಹಿಕ, ಮಾನಸಿಕ ಆರೋಗ್ಯ, ಧೈರ್ಯ ಹಾಗೂ ಆಯುರ್ವೃದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
      sanskritPhrasing: "ಮಮ ಕುಟುಂಬಸ್ಯ ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
      isActive: true,
      createdAt: now
    },
    {
      id: `sankalpa_def_2_${userId}`,
      userId,
      devoteeName,
      category: "shanti",
      title: "ಮನಶ್ಶಾಂತಿ & ಗೃಹಶಾಂತಿ (Peace & Domestic Harmony)",
      description: "ಮನೆಯಲ್ಲಿ ಸದಾ ಸುಖ, ಶಾಂತಿ, ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ನೆಲೆಸಿ, ಸರ್ವ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ನಿವಾರಣೆಯಾಗಲಿ.",
      sanskritPhrasing: "ಸರ್ವ ಮನಃಶಾಂತಿ, ಗೃಹಶಾಂತಿ, ಧನಧಾನ್ಯ ಸಮೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
      isActive: true,
      createdAt: now
    },
    {
      id: `sankalpa_def_3_${userId}`,
      userId,
      devoteeName,
      category: "udyoga",
      title: "ಸಕಲ ಸತ್ಕಾರ್ಯ ಜಯಸಿದ್ಧಿ (Success in Noble Pursuits)",
      description: "ಕೈಗೆತ್ತಿಕೊಂಡ ಸಕಲ ಶುಭ ಕಾರ್ಯಗಳು, ಉದ್ಯೋಗ, ವಿದ್ಯಾಭ್ಯಾಸಗಳು ವಿಘ್ನವಿಲ್ಲದೆ ಸುಗಮವಾಗಿ ನೆರವೇರಲಿ.",
      sanskritPhrasing: "ಸರ್ವಾಭೀಷ್ಟ ಕಾರ್ಯಸಿದ್ಧ್ಯರ್ಥಂ, ಸಮಸ್ತ ದುರಿತಕ್ಷಯದ್ವಾರಾ ಶ್ರೀ ದೇವತಾ ಪ್ರೀತ್ಯರ್ಥಂ",
      isActive: true,
      createdAt: now
    }
  ];
}

interface SankalpaStoreState {
  sankalpas: UserSankalpaRecord[];
  isLoading: boolean;
  activeUserId: string;
  loadSankalpas: (userId: string, devoteeName?: string) => Promise<UserSankalpaRecord[]>;
  createSankalpa: (
    userId: string,
    data: {
      category: SankalpaCategory;
      title: string;
      description: string;
      sanskritPhrasing?: string;
      isActive?: boolean;
      devoteeName?: string;
    }
  ) => Promise<UserSankalpaRecord>;
  updateSankalpa: (id: string, updates: Partial<UserSankalpaRecord>) => Promise<boolean>;
  deleteSankalpa: (id: string) => Promise<boolean>;
  toggleSankalpaActive: (id: string) => Promise<boolean>;
  getActiveSankalpasText: () => { sanskritText: string; kannadaText: string };
}

export const useSankalpaStore = create<SankalpaStoreState>((set, get) => ({
  sankalpas: [],
  isLoading: false,
  activeUserId: "devotee_default",

  loadSankalpas: async (userId: string, devoteeName = "ಭಕ್ತ") => {
    const cleanId = (userId || "devotee_default").toLowerCase().trim();
    set({ isLoading: true, activeUserId: cleanId });

    try {
      // 1. Fetch from local IndexedDB
      let records = await db.userSankalpas.where("userId").equals(cleanId).toArray();

      // 2. If empty locally, try fetching from Cloud Firestore
      if (!records || records.length === 0) {
        const cloudDocs = await getDevoteeSankalpasFromCloud(cleanId);
        if (cloudDocs && cloudDocs.length > 0) {
          for (const doc of cloudDocs) {
            await db.userSankalpas.put(doc as UserSankalpaRecord);
          }
          records = cloudDocs as UserSankalpaRecord[];
        }
      }

      // 3. If still empty, seed default authentic Vedic Sankalpas
      if (!records || records.length === 0) {
        const defaults = getDefaultSankalpas(cleanId, devoteeName);
        for (const item of defaults) {
          await db.userSankalpas.put(item);
          void syncDevoteeSankalpaToCloud(item);
        }
        records = defaults;
      }

      set({ sankalpas: records, isLoading: false });
      return records;
    } catch (err) {
      console.warn("[SankalpaStore] loadSankalpas error, using memory defaults:", err);
      const defaults = getDefaultSankalpas(cleanId, devoteeName);
      set({ sankalpas: defaults, isLoading: false });
      return defaults;
    }
  },

  createSankalpa: async (userId, data) => {
    const cleanId = (userId || "devotee_default").toLowerCase().trim();
    const id = `sankalpa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const matchingPreset = SANKALPA_PRESETS.find((p) => p.category === data.category);
    const newRecord: UserSankalpaRecord = {
      id,
      userId: cleanId,
      devoteeName: data.devoteeName || "ಭಕ್ತ",
      category: data.category,
      title: data.title.trim() || matchingPreset?.titleKn || "ವೈಯಕ್ತಿಕ ಸಂಕಲ್ಪ",
      description: data.description.trim() || matchingPreset?.descriptionKn || "",
      sanskritPhrasing: data.sanskritPhrasing?.trim() || matchingPreset?.sanskritPhrasing || "ಸಮಸ್ತ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ",
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now
    };

    try {
      await db.userSankalpas.put(newRecord);
      void syncDevoteeSankalpaToCloud(newRecord);
    } catch (err) {
      console.warn("[SankalpaStore] Error saving to DB:", err);
    }

    set((state) => ({
      sankalpas: [newRecord, ...state.sankalpas]
    }));

    return newRecord;
  },

  updateSankalpa: async (id, updates) => {
    const existing = get().sankalpas.find((s) => s.id === id);
    if (!existing) return false;

    const updatedRecord: UserSankalpaRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    try {
      await db.userSankalpas.update(id, updatedRecord);
      void syncDevoteeSankalpaToCloud(updatedRecord);
    } catch (err) {
      console.warn("[SankalpaStore] Error updating sankalpa in DB:", err);
    }

    set((state) => ({
      sankalpas: state.sankalpas.map((s) => (s.id === id ? updatedRecord : s))
    }));

    return true;
  },

  deleteSankalpa: async (id) => {
    try {
      await db.userSankalpas.delete(id);
      void deleteDevoteeSankalpaFromCloud(id);
    } catch (err) {
      console.warn("[SankalpaStore] Error deleting sankalpa from DB:", err);
    }

    set((state) => ({
      sankalpas: state.sankalpas.filter((s) => s.id !== id)
    }));

    return true;
  },

  toggleSankalpaActive: async (id) => {
    const existing = get().sankalpas.find((s) => s.id === id);
    if (!existing) return false;

    const newActive = !existing.isActive;
    return get().updateSankalpa(id, { isActive: newActive });
  },

  getActiveSankalpasText: () => {
    const active = get().sankalpas.filter((s) => s.isActive);
    if (active.length === 0) {
      return {
        sanskritText: "ಸಮಸ್ತ ದುರಿತಕ್ಷಯದ್ವಾರಾ ಶ್ರೀ ದೇವತಾ ಪ್ರೀತ್ಯರ್ಥಂ, ಸರ್ವಾಭೀಷ್ಟ ಸಿದ್ಧ್ಯರ್ಥಂ",
        kannadaText: "ಕುಟುಂಬದ ಸಕಲ ಕ್ಷೇಮ, ಆರೋಗ್ಯ ಮತ್ತು ಮನಶ್ಶಾಂತಿ ಸಿದ್ಧಿ"
      };
    }

    const sanskritParts = active.map((s) => s.sanskritPhrasing || s.title).join(", ");
    const kannadaParts = active.map((s) => s.title).join(" · ");

    return {
      sanskritText: sanskritParts,
      kannadaText: kannadaParts
    };
  }
}));
