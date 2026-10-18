/**
 * Baggona Panchanga - Authentic Karnataka Vedic Sandhyavandana Types
 * Covers Trikaala Sandhyavandana (Pratah, Madhyahna, Sayam) in Gokarna / Uttara Kannada tradition.
 */

export type SandhyaPeriod = "pratah" | "madhyahna" | "sayam";

export interface SandhyaPeriodMeta {
  period: SandhyaPeriod;
  titleKn: string;
  titleEn: string;
  timeRangeKn: string;
  timeRangeEn: string;
  arghyaCount: number;
  arghyaDirectionKn: string;
  arghyaDirectionEn: string;
  color: string;
  icon: string;
}

export interface SandhyaStep {
  id: string;
  stepNumber: number;
  category: "purification" | "bhasma" | "sankalpa" | "pranayama" | "marjana" | "arghya" | "japa" | "upasthana" | "abhivadana" | "samarpana";
  titleKn: string;
  titleEn: string;
  actionCueKn: string; // Physical gesture (ಕೈಕರಣ / ಮುದ್ರೆ / ಭಂಗಿ)
  actionCueEn: string;
  applicablePeriods: SandhyaPeriod[];
  mantraSanskrit: string;
  mantraKannada: string;
  meaningKn: string;
  meaningEn: string;
  priestSpokenInstructionKn: string;
  priestSpokenInstructionEn: string;
  kaikaranaNotesKn: string; // Deep ritual notes for beginner
  approxSeconds: number;
  icon: string;
}

export interface GotraItem {
  id: string;
  nameKn: string;
  nameEn: string;
  pravaraTypeKn: string; // e.g. "ತ್ರಯಾರ್ಷೇಯ" | "ಪಂಚಾರ್ಷೇಯ" | "ಏಕಾರ್ಷೇಯ"
  pravaraRishisKn: string; // e.g. "ವಸಿಷ್ಠ, ಮೈತ್ರಾವರುಣ, ಕೌಂಡಿನ್ಯ"
  pravaraRishisEn: string;
  formulaKn: string; // e.g. "ವಸಿಷ್ಠ ಮೈತ್ರಾವರುಣ ಕೌಂಡಿನ್ಯೇತಿ ತ್ರಯಾರ್ಷೇಯ ಪ್ರವರಾನ್ವಿತ..."
  formulaEn: string;
}

export interface FeaturedMantraItem {
  id: "gayatri" | "panchakshari" | "ashtakshari" | "gotra_pravara";
  titleKn: string;
  titleEn: string;
  deityKn: string;
  deityEn: string;
  mantraSanskrit: string;
  mantraKannada: string;
  meaningKn: string;
  meaningEn: string;
  significanceKn: string;
  japaOptions: number[]; // e.g. [1, 3, 11, 28, 108]
  icon: string;
}

export interface SandhyavandanaSession {
  id: string;
  token: string;
  devoteeName: string;
  devoteePhone?: string;
  devoteeGotraId?: string;
  sharmaName?: string;
  createdAt: string; // ISO string
  expiresAt: string; // Exactly 90 days (3 months) from creation
  preferredPeriod: SandhyaPeriod;
  lastActivePeriod?: SandhyaPeriod;
  completedSteps?: number;
  completedRounds: number;
  japaCountCompleted?: number;
  shareableUrl?: string;
  lastPracticedAt?: string;
  notes?: string;
}

export interface CreateSandhyavandanaInput {
  devoteeName: string;
  devoteePhone?: string;
  devoteeGotraId?: string;
  sharmaName?: string;
  preferredPeriod?: SandhyaPeriod;
  lastActivePeriod?: SandhyaPeriod;
  completedSteps?: number;
  japaCountCompleted?: number;
  notes?: string;
}
