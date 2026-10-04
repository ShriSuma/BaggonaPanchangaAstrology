import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DevoteeMessage {
  id: string;
  sender: "user" | "pet";
  text: string;
  timestamp: string;
  workflowResult?: {
    reportType?: string;
    fileName?: string;
    status?: string;
    [key: string]: any;
  };
}

export interface DevoteeReportRecord {
  reportType: string;
  title: string;
  fileName: string;
  downloadedAt: string;
}

export interface DevoteeRecord {
  id: string; // e.g. "DEV-RAMESH-8472"
  name: string;
  birthDate: string;
  birthTime: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  rawText?: string;
  customQuestions?: string[];
  createdAt: string;
  lastAccessedAt: string;
  consultationCount: number;
  messages: DevoteeMessage[];
  reports: DevoteeReportRecord[];
}

interface DevoteeHistoryState {
  records: DevoteeRecord[];
  activeDevoteeId: string | null;

  // Actions
  upsertDevotee: (data: {
    name: string;
    birthDate?: string;
    birthTime?: string;
    city?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    rawText?: string;
    customQuestions?: string[];
    id?: string;
  }) => DevoteeRecord;

  appendMessage: (
    devoteeId: string,
    message: { sender: "user" | "pet"; text: string; workflowResult?: any }
  ) => void;

  appendReport: (
    devoteeId: string,
    report: { reportType: string; title: string; fileName: string }
  ) => void;

  getDevoteeByIdOrName: (query: string) => DevoteeRecord | null;
  getDevoteeById: (id: string) => DevoteeRecord | null;
  setActiveDevoteeId: (id: string | null) => void;
  deleteDevotee: (id: string) => void;
  clearAll: () => void;
}

// Convert common Kannada names or Unicode to clean ASCII uppercase slug
export function slugifyDevoteeName(name: string): string {
  if (!name) return "BHAKTA";
  
  const trimmed = name.trim();
  // If latin characters are present
  const latinMatches = trimmed.match(/[a-zA-Z0-9]+/g);
  if (latinMatches && latinMatches.join("").length >= 2) {
    return latinMatches.join("").toUpperCase().slice(0, 10);
  }

  // Kannada common transliteration dictionary
  const knMap: Record<string, string> = {
    "ಶ್ರೀರಾಮ್": "SHRIRAM",
    "ರಾಮ್": "RAM",
    "ರಮೇಶ್": "RAMESH",
    "ಸುರೇಶ್": "SURESH",
    "ಮಹೇಶ್": "MAHESH",
    "ಪ್ರಮೋದ್": "PRAMOD",
    "ಪ್ರಶಾಂತ್": "PRASHANTH",
    "ಸತೀಶ್": "SATISH",
    "ಗಣೇಶ್": "GANESH",
    "ದತ್ತಾತ್ರೇಯ": "DATTATREYA",
    "ವೆಂಕಟೇಶ್": "VENKATESH",
    "ವಿಷ್ಣು": "VISHNU",
    "ಶಿವ": "SHIVA",
    "ಕೃಷ್ಣ": "KRISHNA",
    "ಲಕ್ಷ್ಮಿ": "LAKSHMI",
    "ಪಾರ್ವತಿ": "PARVATI",
    "ಅರ್ಚಕ": "ARCHAKA",
    "ಪಂಡಿತ್": "PANDIT"
  };

  for (const [kn, en] of Object.entries(knMap)) {
    if (trimmed.includes(kn)) {
      return en;
    }
  }

  // Fallback: simple numeric hash from char codes
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) & 0xffffff;
  }
  return `DEV${Math.abs(hash).toString(36).toUpperCase().slice(0, 5)}`;
}

export function generateDevoteeId(name: string): string {
  const slug = slugifyDevoteeName(name);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `DEV-${slug}-${randomSuffix}`;
}

export const useDevoteeHistoryStore = create<DevoteeHistoryState>()(
  persist(
    (set, get) => ({
      records: [],
      activeDevoteeId: null,

      upsertDevotee: (data) => {
        const state = get();
        const nowIso = new Date().toISOString();

        // 1. Try to match by explicit id if provided
        let existing = data.id ? state.records.find((r) => r.id === data.id) : null;

        // 2. Or match by matching Name (case-insensitive) and BirthDate (if available)
        if (!existing && data.name) {
          const normName = data.name.trim().toLowerCase();
          existing = state.records.find((r) => {
            const rName = r.name.trim().toLowerCase();
            const nameMatches = rName === normName || (normName.length > 3 && (rName.includes(normName) || normName.includes(rName)));
            if (data.birthDate && r.birthDate) {
              return nameMatches && r.birthDate === data.birthDate;
            }
            return nameMatches;
          }) || null;
        }

        if (existing) {
          const updated: DevoteeRecord = {
            ...existing,
            name: data.name || existing.name,
            birthDate: data.birthDate || existing.birthDate,
            birthTime: data.birthTime || existing.birthTime,
            city: data.city || existing.city,
            pincode: data.pincode || existing.pincode,
            latitude: data.latitude ?? existing.latitude,
            longitude: data.longitude ?? existing.longitude,
            rawText: data.rawText || existing.rawText,
            customQuestions: data.customQuestions || existing.customQuestions,
            lastAccessedAt: nowIso,
            consultationCount: existing.consultationCount + 1
          };

          set((s) => ({
            records: s.records.map((r) => (r.id === updated.id ? updated : r)),
            activeDevoteeId: updated.id
          }));

          return updated;
        }

        // Create new record
        const newId = data.id || generateDevoteeId(data.name);
        const newRecord: DevoteeRecord = {
          id: newId,
          name: data.name.trim(),
          birthDate: data.birthDate || "",
          birthTime: data.birthTime || "",
          city: data.city || "Bengaluru",
          pincode: data.pincode || "560001",
          latitude: data.latitude,
          longitude: data.longitude,
          rawText: data.rawText || "",
          customQuestions: data.customQuestions || [],
          createdAt: nowIso,
          lastAccessedAt: nowIso,
          consultationCount: 1,
          messages: [],
          reports: []
        };

        set((s) => ({
          records: [newRecord, ...s.records],
          activeDevoteeId: newRecord.id
        }));

        return newRecord;
      },

      appendMessage: (devoteeId, message) => {
        if (!devoteeId) return;
        const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const nowIso = new Date().toISOString();

        set((s) => ({
          records: s.records.map((r) => {
            if (r.id !== devoteeId) return r;
            return {
              ...r,
              lastAccessedAt: nowIso,
              messages: [
                ...r.messages,
                {
                  id: msgId,
                  sender: message.sender,
                  text: message.text,
                  timestamp: nowIso,
                  workflowResult: message.workflowResult
                }
              ]
            };
          })
        }));
      },

      appendReport: (devoteeId, report) => {
        if (!devoteeId) return;
        const nowIso = new Date().toISOString();

        set((s) => ({
          records: s.records.map((r) => {
            if (r.id !== devoteeId) return r;
            return {
              ...r,
              lastAccessedAt: nowIso,
              reports: [
                ...r.reports,
                {
                  reportType: report.reportType,
                  title: report.title,
                  fileName: report.fileName,
                  downloadedAt: nowIso
                }
              ]
            };
          })
        }));
      },

      getDevoteeByIdOrName: (query: string) => {
        if (!query) return null;
        const q = query.trim().toLowerCase();
        const records = get().records;

        // 1. Exact or partial Devotee ID match (e.g. "DEV-RAMESH-8472" or "RAMESH-8472" or "8472")
        const idMatch = records.find(
          (r) =>
            r.id.toLowerCase() === q ||
            r.id.toLowerCase().includes(q) ||
            q.includes(r.id.toLowerCase())
        );
        if (idMatch) return idMatch;

        // 2. Name match (case-insensitive substring)
        const nameMatch = records.find((r) => {
          const rName = r.name.toLowerCase();
          return rName === q || rName.includes(q) || q.includes(rName);
        });
        if (nameMatch) return nameMatch;

        return null;
      },

      getDevoteeById: (id: string) => {
        if (!id) return null;
        return get().records.find((r) => r.id === id) || null;
      },

      setActiveDevoteeId: (id) => {
        set({ activeDevoteeId: id });
      },

      deleteDevotee: (id) => {
        set((s) => ({
          records: s.records.filter((r) => r.id !== id),
          activeDevoteeId: s.activeDevoteeId === id ? null : s.activeDevoteeId
        }));
      },

      clearAll: () => {
        set({ records: [], activeDevoteeId: null });
      }
    }),
    {
      name: "baggona_devotee_consultation_history"
    }
  )
);
