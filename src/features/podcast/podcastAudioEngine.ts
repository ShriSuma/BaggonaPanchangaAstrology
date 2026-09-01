/**
 * Phala Jyotishya Dual-Voice Podcast Audio Engine
 * (ದ್ವಿದ್ವನಿ ಫಲಜ್ಯೋತಿಷ್ಯ ಪೋಡ್‌ಕ್ಯಾಸ್ಟ್ ಆಡಿಯೋ ಎಂಜಿನ್)
 * 
 * Manages:
 * - Natural 2-speaker speech synthesis (Female Host vs Male Astrologer)
 * - Automatic voice selection, pitch/rate modulation, and sentence queuing
 * - Real-time line index synchronization for live transcript highlighting
 * - Ambient temple drone (Tanpura/Flute) Web Audio oscillator
 */

import { startNewAudioSession, stopAllAudioGlobal } from "../audio/globalAudioManager";
import { type PhalaJyotishyaEpisode, type PodcastDialogueTurn } from "./phalaJyotishyaPodcastData";

export type PlaybackState = "stopped" | "playing" | "paused";

export interface PodcastAudioState {
  currentEpisodeNumber: number;
  currentLineIndex: number;
  totalLines: number;
  playbackState: PlaybackState;
  playbackSpeed: number; // 0.75, 1.0, 1.25, 1.5
  ambientAudioEnabled: boolean;
  activeSpeaker: "host_female" | "scholar_male" | null;
}

export type StateChangeCallback = (state: PodcastAudioState) => void;

class PodcastAudioEngine {
  private state: PodcastAudioState = {
    currentEpisodeNumber: 1,
    currentLineIndex: 0,
    totalLines: 0,
    playbackState: "stopped",
    playbackSpeed: 1.0,
    ambientAudioEnabled: false,
    activeSpeaker: null
  };

  private currentEpisode: PhalaJyotishyaEpisode | null = null;
  private listeners: Set<StateChangeCallback> = new Set();
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private ambientContext: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private isSynthesizing: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      };
    }
  }

  public subscribe(cb: StateChangeCallback): () => void {
    this.listeners.add(cb);
    cb({ ...this.state });
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((cb) => cb(copy));
  }

  public getState(): PodcastAudioState {
    return { ...this.state };
  }

  public loadEpisode(episode: PhalaJyotishyaEpisode, autoPlay: boolean = false) {
    this.stop();
    this.currentEpisode = episode;
    this.state.currentEpisodeNumber = episode.houseNumber;
    this.state.currentLineIndex = 0;
    this.state.totalLines = episode.dialogue.length;
    this.state.activeSpeaker = episode.dialogue[0]?.speaker || null;
    this.notify();

    if (autoPlay) {
      void this.playLine(0);
    }
  }

  public setSpeed(speed: number) {
    this.state.playbackSpeed = speed;
    this.notify();
    if (this.state.playbackState === "playing") {
      // Re-play current line with new speed
      void this.playLine(this.state.currentLineIndex);
    }
  }

  public toggleAmbientMusic() {
    this.state.ambientAudioEnabled = !this.state.ambientAudioEnabled;
    if (this.state.ambientAudioEnabled) {
      this.startAmbientTanpura();
    } else {
      this.stopAmbientTanpura();
    }
    this.notify();
  }

  public async play() {
    if (!this.currentEpisode) return;

    if (this.state.playbackState === "paused") {
      if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.state.playbackState = "playing";
        this.notify();
        return;
      }
    }

    await this.playLine(this.state.currentLineIndex);
  }

  public pause() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
    this.state.playbackState = "paused";
    this.notify();
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.isSynthesizing = false;
    this.state.playbackState = "stopped";
    this.state.activeSpeaker = null;
    this.stopAmbientTanpura();
    this.notify();
  }

  public async playLine(index: number) {
    if (!this.currentEpisode || index < 0 || index >= this.currentEpisode.dialogue.length) {
      this.stop();
      return;
    }

    // Stop any current speech and coordinate across tabs
    if (typeof window !== "undefined") {
      startNewAudioSession();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }

    const turn: PodcastDialogueTurn = this.currentEpisode.dialogue[index];
    this.state.currentLineIndex = index;
    this.state.playbackState = "playing";
    this.state.activeSpeaker = turn.speaker;
    this.notify();

    if (this.state.ambientAudioEnabled) {
      this.startAmbientTanpura();
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      // Mock playback in test environment
      return;
    }

    const utterance = new SpeechSynthesisUtterance(turn.textKn);
    this.currentUtterance = utterance;

    // Pick best Kannada voice or fallback
    const voices = window.speechSynthesis.getVoices() || [];
    const knVoice = voices.find((v) => v.lang.includes("kn") || v.name.toLowerCase().includes("kannada")) ||
                    voices.find((v) => v.lang.includes("hi-IN") || v.lang.includes("en-IN")) ||
                    null;

    if (knVoice) {
      utterance.voice = knVoice;
    }
    utterance.lang = "kn-IN";

    // Dual-Speaker Natural Voice Modulation (Distinct Host vs Scholar personas)
    if (turn.speaker === "host_female") {
      // Vidushi Shruti: Higher, melodious, lively host pitch
      utterance.pitch = 1.22;
      utterance.rate = 0.98 * this.state.playbackSpeed;
    } else {
      // Vidwan Kaushik: Deep, resonant guru cadence
      utterance.pitch = 0.88;
      utterance.rate = 0.92 * this.state.playbackSpeed;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (this.state.playbackState === "playing") {
        const nextIdx = index + 1;
        if (this.currentEpisode && nextIdx < this.currentEpisode.dialogue.length) {
          setTimeout(() => {
            void this.playLine(nextIdx);
          }, 350); // Natural conversational breath pause
        } else {
          // Completed episode
          this.state.playbackState = "stopped";
          this.state.currentLineIndex = 0;
          this.state.activeSpeaker = null;
          this.notify();
        }
      }
    };

    utterance.onerror = (err) => {
      console.warn("[PodcastAudioEngine] Utterance error:", err);
      this.state.playbackState = "stopped";
      this.notify();
    };

    window.speechSynthesis.speak(utterance);
  }

  public nextLine() {
    if (!this.currentEpisode) return;
    const nextIdx = Math.min(this.currentEpisode.dialogue.length - 1, this.state.currentLineIndex + 1);
    void this.playLine(nextIdx);
  }

  public previousLine() {
    if (!this.currentEpisode) return;
    const prevIdx = Math.max(0, this.state.currentLineIndex - 1);
    void this.playLine(prevIdx);
  }

  // --- Ambient Temple Drone (Tanpura 108Hz / 136.1Hz Om Frequency) ---
  private startAmbientTanpura() {
    try {
      if (this.ambientContext) return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      this.ambientContext = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.04, ctx.currentTime); // Subtle background drone
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      // 136.1 Hz Cosmic Om Fundamental (Sa)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(136.1, ctx.currentTime);

      // 204.15 Hz Perfect Fifth (Pa)
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(204.15, ctx.currentTime);

      // Soft low-pass warmth filter
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      osc1.start();
      osc2.start();
    } catch {}
  }

  private stopAmbientTanpura() {
    try {
      if (this.ambientContext) {
        void this.ambientContext.close();
        this.ambientContext = null;
        this.ambientGain = null;
      }
    } catch {}
  }
}

export const podcastAudioEngine = new PodcastAudioEngine();
