import { describe, it, expect, beforeEach } from "vitest";
import {
  PHALA_JYOTISHYA_EPISODES,
  getPodcastEpisode
} from "../features/podcast/phalaJyotishyaPodcastData";
import { podcastAudioEngine } from "../features/podcast/podcastAudioEngine";

describe("Phala Jyotishya 12-House Audio Podcast Engine", () => {
  beforeEach(() => {
    podcastAudioEngine.stop();
  });

  it("contains exactly 12 full episodes covering all 12 Vedic Houses", () => {
    expect(PHALA_JYOTISHYA_EPISODES).toHaveLength(12);
    PHALA_JYOTISHYA_EPISODES.forEach((ep, idx) => {
      expect(ep.houseNumber).toBe(idx + 1);
      expect(ep.houseNameKn).toBeTruthy();
      expect(ep.sanskritName).toBeTruthy();
      expect(ep.primaryKarakatwasKn.length).toBeGreaterThanOrEqual(3);
      expect(ep.karakaPlanetKn).toBeTruthy();
      expect(ep.captainStatusKn).toBeTruthy();
      expect(ep.slaveStatusKn).toBeTruthy();
      expect(ep.ramanGoldenRulesKn.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("contains dual-speaker alternating Kannada dialogues in every episode", () => {
    PHALA_JYOTISHYA_EPISODES.forEach((ep) => {
      expect(ep.dialogue.length).toBeGreaterThanOrEqual(2);
      const speakers = ep.dialogue.map((d) => d.speaker);
      expect(speakers).toContain("host_female");
      expect(speakers).toContain("scholar_male");

      ep.dialogue.forEach((turn) => {
        expect(turn.textKn.length).toBeGreaterThan(10);
        expect(turn.speakerNameKn).toBeTruthy();
      });
    });
  });

  it("fetches individual house episodes accurately via getPodcastEpisode", () => {
    const ep1 = getPodcastEpisode(1);
    expect(ep1.houseNumber).toBe(1);
    expect(ep1.sanskritName).toContain("ತನು");

    const ep10 = getPodcastEpisode(10);
    expect(ep10.houseNumber).toBe(10);
    expect(ep10.sanskritName).toContain("ಕರ್ಮ");

    const ep12 = getPodcastEpisode(12);
    expect(ep12.houseNumber).toBe(12);
    expect(ep12.sanskritName).toContain("ಮೋಕ್ಷ");
  });

  it("manages podcast audio state and speed adjustments cleanly", () => {
    const ep = getPodcastEpisode(1);
    podcastAudioEngine.loadEpisode(ep, false);

    const st1 = podcastAudioEngine.getState();
    expect(st1.currentEpisodeNumber).toBe(1);
    expect(st1.totalLines).toBe(ep.dialogue.length);

    podcastAudioEngine.setSpeed(1.25);
    expect(podcastAudioEngine.getState().playbackSpeed).toBe(1.25);

    podcastAudioEngine.toggleAmbientMusic();
    expect(podcastAudioEngine.getState().ambientAudioEnabled).toBe(true);

    podcastAudioEngine.toggleAmbientMusic();
    expect(podcastAudioEngine.getState().ambientAudioEnabled).toBe(false);

    podcastAudioEngine.stop();
    expect(podcastAudioEngine.getState().playbackState).toBe("stopped");
  });
});
