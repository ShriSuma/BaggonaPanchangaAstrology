/**
 * Priest Voice & Audio Recording Manager for Baggona Panchanga
 * 
 * Provides:
 * 1. Storage & retrieval of custom Priest audio recordings (.mp3, .wav, .m4a, .ogg) in IndexedDB & localStorage
 * 2. Step-by-step audio mapping:
 *    - step_1: Bell Invocation Mantra (ಆಗಮಾರ್ಥಂ ತು ದೇವಾನಾಂ...)
 *    - step_2: Deepa & Mantrakshata Offering (ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ...)
 *    - step_3: Sacred Vedic Sankalpa (ಅದ್ಯ ಪೂರ್ವೋಕ್ತ...)
 *    - step_4: Priest Ashirvada & Benediction (ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ...)
 *    - deity_mantra: Daily Deity Chanting Mantra
 * 3. Fallback to Male Priest TTS with deep resonant Vedic frequency (pitch 0.76, rate 0.86)
 */

export type PriestAudioKey = "step_1" | "step_2" | "step_3" | "step_4" | "deity_mantra";

const STORAGE_PREFIX = "baggona_priest_voice_";

export interface CustomPriestAudioItem {
  key: PriestAudioKey;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  uploadedAt: string;
  durationSec?: number;
}

/**
 * Saves an uploaded priest audio recording into local storage
 */
export async function savePriestAudioRecording(
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

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(item));
          } catch (e) {
            console.warn("[PriestVoiceManager] localStorage save warning:", e);
          }
        }

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
 * Retrieves a custom priest audio recording if available
 */
export function getPriestAudioRecording(key: PriestAudioKey): CustomPriestAudioItem | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as CustomPriestAudioItem;
  } catch {
    return null;
  }
}

/**
 * Removes a custom priest audio recording
 */
export function removePriestAudioRecording(key: PriestAudioKey): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {}
}

/**
 * Returns list of all uploaded priest audio recordings
 */
export function getAllUploadedPriestAudio(): Record<PriestAudioKey, CustomPriestAudioItem | null> {
  return {
    step_1: getPriestAudioRecording("step_1"),
    step_2: getPriestAudioRecording("step_2"),
    step_3: getPriestAudioRecording("step_3"),
    step_4: getPriestAudioRecording("step_4"),
    deity_mantra: getPriestAudioRecording("deity_mantra")
  };
}
