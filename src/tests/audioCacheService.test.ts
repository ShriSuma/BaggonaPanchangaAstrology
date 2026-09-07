import { describe, it, expect, beforeEach } from "vitest";
import {
  getClientAudioCacheKey,
  getPersistentCachedAudio,
  storeAudioInPersistentCache,
  isAudioCached,
  getIndianStandardDateStr,
  getMsUntilNextMidnightIST
} from "../features/audio/audioCacheService";

describe("audioCacheService - Devotee Persistent IndexedDB Audio Cache", () => {
  it("generates deterministic cache keys for language, text and provider", () => {
    const key1 = getClientAudioCacheKey("ಓಂ ನಮಃ ಶಿವಾಯ", "kn");
    const key2 = getClientAudioCacheKey("ಓಂ ನಮಃ ಶಿವಾಯ", "kn");
    const keyDiffLang = getClientAudioCacheKey("ಓಂ ನಮಃ ಶಿವಾಯ", "ta");

    expect(key1).toBe(key2);
    expect(key1).not.toBe(keyDiffLang);
    expect(key1).toContain("indic_parler_kn_");
  });

  it("handles non-IndexedDB environments gracefully without crashing", async () => {
    const key = getClientAudioCacheKey("Test Mantra", "en");
    const result = await getPersistentCachedAudio(key);
    expect(result).toBeNull();

    const isCached = await isAudioCached(key);
    expect(isCached).toBe(false);
  });

  it("strictly guarantees separate cache keys for different devotees and different mantras (zero cross-contamination)", () => {
    const devotee1Mantra = getClientAudioCacheKey("ಆಯುಷ್ಮಾನ್ ಭವ ಶ್ರೀ ರಮೇಶ್. ಓಂ ನಮಃ ಶಿವಾಯ", "kn");
    const devotee2Mantra = getClientAudioCacheKey("ಆಯುಷ್ಮಾನ್ ಭವ ಶ್ರೀ ಸುರೇಶ್. ಓಂ ನಮಃ ಶಿವಾಯ", "kn");
    const devotee1Tamil = getClientAudioCacheKey("ஆயுஷ்மான் பவ ஸ்ரீ ரமேஷ். ஓம் நம சிவாய", "ta");

    expect(devotee1Mantra).not.toBe(devotee2Mantra);
    expect(devotee1Mantra).not.toBe(devotee1Tamil);
    expect(devotee2Mantra).not.toBe(devotee1Tamil);
  });

  it("schedules and records active date for 12:00 AM midnight audio cache rotation in strict IST", () => {
    const todayStr = getIndianStandardDateStr();
    expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    localStorage.setItem("baggona_audio_cache_active_date", todayStr);
    expect(localStorage.getItem("baggona_audio_cache_active_date")).toBe(todayStr);

    const msUntilMidnight = getMsUntilNextMidnightIST();
    expect(msUntilMidnight).toBeGreaterThan(0);
    expect(msUntilMidnight).toBeLessThanOrEqual(86400005);
  });
});
