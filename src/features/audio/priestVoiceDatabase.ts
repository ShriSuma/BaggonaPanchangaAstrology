/**
 * Baggona Panchanga - Multi-Priest Voice Database & Voice Clone Registry
 * 
 * Provides:
 * 1. Storage of multiple Priest Voice Profiles in IndexedDB / LocalStorage
 * 2. Step-by-step audio clips per profile:
 *    - step_1: Temple Bell & Invocation Mantra (ಆಗಮಾರ್ಥಂ ತು ದೇವಾನಾಂ...)
 *    - step_2: Deepa & Mantrakshate Offering (ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ...)
 *    - step_3: Sacred Vedic Sankalpa (ಅದ್ಯ ಪೂರ್ವೋಕ್ತ...)
 *    - step_4: Chief Priest Benediction (ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ...)
 *    - deity_mantra: Daily Deity Chanting Mantra
 * 3. Support for SuperAdmin voice collection, cloning metadata & selection across
 *    1-Month (30 Days), 3-Months (90 Days), 6-Months (180 Days), 1-Year (365 Days) Seva Patra & QR codes.
 */

export type PriestAudioKey = "step_1" | "step_2" | "step_3" | "step_4" | "deity_mantra";

export interface CustomPriestAudioItem {
  key: PriestAudioKey;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  uploadedAt: string;
  durationSec?: number;
}

export interface PriestVoiceProfile {
  id: string;
  name: string;
  titleKn: string;
  titleEn: string;
  phone?: string;
  isDefault?: boolean;
  voicePitch: number; // e.g. 0.74 (deeper masculine voice)
  voiceRate: number;  // e.g. 0.86 (steady Vedic tempo)
  preferredVoiceLang: string; // "kn-IN", "hi-IN", "en-IN"
  audioClips: Partial<Record<PriestAudioKey, CustomPriestAudioItem>>;
  sampleAudioUrl?: string;
  cloningModel?: "baggona-vedic-v1" | "instant-zero-shot" | "custom-studio";
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "baggona_priest_voice_profiles_v1";

const DEFAULT_PROFILES: PriestVoiceProfile[] = [
  {
    id: "voice_shreeram",
    name: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Pandit Shreeram Pandit)",
    titleKn: "ಪ್ರಧಾನ ಅರ್ಚಕರು - ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ",
    titleEn: "Chief Priest - Gokarna Sri Mahabaleshwara Sanctum",
    phone: "9972339362",
    isDefault: true,
    voicePitch: 0.74,
    voiceRate: 0.86,
    preferredVoiceLang: "kn-IN",
    audioClips: {},
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-31T00:00:00Z"
  },
  {
    id: "voice_shrisuma",
    name: "ಶ್ರೀಸುಮ ಅರ್ಚಕರು ($hriSuma Voice)",
    titleKn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸೂಪರ್ ಅಡ್ಮಿನ್ & ದೈವಜ್ಞರು",
    titleEn: "Baggona Panchanga SuperAdmin & Astrologer",
    phone: "9972339362",
    isDefault: false,
    voicePitch: 0.76,
    voiceRate: 0.88,
    preferredVoiceLang: "kn-IN",
    audioClips: {},
    createdAt: "2026-08-31T00:00:00Z",
    updatedAt: "2026-08-31T00:00:00Z"
  },
  {
    id: "voice_vedic_vidwan",
    name: "ಗೋಕರ್ಣ ವೇದ ವಿದ್ವಾನ್ (Vedic Vidwan)",
    titleKn: "ವೇದ ಪಾರಾಯಣ ಕರ್ತರು & ಶಾಸ್ತ್ರಿಗಳು",
    titleEn: "Senior Rigveda Chanting Scholar",
    isDefault: false,
    voicePitch: 0.72,
    voiceRate: 0.84,
    preferredVoiceLang: "kn-IN",
    audioClips: {},
    createdAt: "2026-08-31T00:00:00Z",
    updatedAt: "2026-08-31T00:00:00Z"
  }
];

/**
 * Returns all Priest Voice Profiles from storage
 */
export function getAllVoiceProfiles(): PriestVoiceProfile[] {
  if (typeof window === "undefined") return DEFAULT_PROFILES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(raw) as PriestVoiceProfile[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_PROFILES;
    }
    return parsed;
  } catch {
    return DEFAULT_PROFILES;
  }
}

/**
 * Gets a voice profile by ID (or default if not found)
 */
export function getVoiceProfileById(id?: string): PriestVoiceProfile {
  const profiles = getAllVoiceProfiles();
  if (id) {
    const found = profiles.find((p) => p.id === id);
    if (found) return found;
  }
  return profiles.find((p) => p.isDefault) || profiles[0] || DEFAULT_PROFILES[0];
}

/**
 * Saves or updates a Priest Voice Profile
 */
export function saveVoiceProfile(profile: PriestVoiceProfile): void {
  if (typeof window === "undefined") return;
  try {
    const profiles = getAllVoiceProfiles();
    const idx = profiles.findIndex((p) => p.id === profile.id);
    profile.updatedAt = new Date().toISOString();

    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.warn("[PriestVoiceDatabase] Error saving profile:", err);
  }
}

/**
 * Deletes a voice profile by ID
 */
export function deleteVoiceProfile(id: string): void {
  if (typeof window === "undefined" || id === "voice_shreeram") return;
  try {
    const profiles = getAllVoiceProfiles().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.warn("[PriestVoiceDatabase] Error deleting profile:", err);
  }
}

/**
 * Saves an uploaded audio clip into a specific Priest Voice Profile
 */
export async function saveClipToVoiceProfile(
  voiceId: string,
  key: PriestAudioKey,
  file: File
): Promise<CustomPriestAudioItem> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;
        const item: CustomPriestAudioItem = {
          key,
          fileName: file.name,
          mimeType: file.type || "audio/mp3",
          dataUrl,
          uploadedAt: new Date().toISOString()
        };

        const profile = getVoiceProfileById(voiceId);
        if (!profile.audioClips) {
          profile.audioClips = {};
        }
        profile.audioClips[key] = item;
        saveVoiceProfile(profile);

        resolve(item);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Removes an audio clip from a voice profile
 */
export function removeClipFromVoiceProfile(voiceId: string, key: PriestAudioKey): void {
  const profile = getVoiceProfileById(voiceId);
  if (profile.audioClips && profile.audioClips[key]) {
    delete profile.audioClips[key];
    saveVoiceProfile(profile);
  }
}
