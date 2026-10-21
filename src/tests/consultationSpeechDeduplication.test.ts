import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitizeDuplicateSpeechWords,
  cleanJoin,
  ContinuousSpeechEngine
} from "../features/consultation/consultationSpeechService";

describe("Consultation Speech Service - Anti-Duplication & Deduplication Engine", () => {
  describe("1. sanitizeDuplicateSpeechWords", () => {
    it("deduplicates single-word repetitions in Kannada (user's exact report)", () => {
      const input = "ಅವನು ಅವನು ಅವನು ಅವನು ಅವಳಿಗೆ ಅವಳಿಗೆ ಅವಳಿಗೆ";
      const result = sanitizeDuplicateSpeechWords(input);
      expect(result).toBe("ಅವನು ಅವಳಿಗೆ");
    });

    it("deduplicates single-word repetitions in English and Hindi", () => {
      const en = "when when when will I get promotion promotion";
      expect(sanitizeDuplicateSpeechWords(en)).toBe("when will I get promotion");

      const hi = "मेरी मेरी शादी कब कब होगी";
      expect(sanitizeDuplicateSpeechWords(hi)).toBe("मेरी शादी कब होगी");
    });

    it("deduplicates two-word repeated phrases (acoustic echo loop)", () => {
      const input = "ಯಾವಾಗ ಆಗುತ್ತದೆ ಯಾವಾಗ ಆಗುತ್ತದೆ";
      expect(sanitizeDuplicateSpeechWords(input)).toBe("ಯಾವಾಗ ಆಗುತ್ತದೆ");
    });

    it("deduplicates three-word repeated phrases", () => {
      const input = "ನನಗೆ ಕೆಲಸ ಸಿಗುತ್ತಾ ನನಗೆ ಕೆಲಸ ಸಿಗುತ್ತಾ";
      expect(sanitizeDuplicateSpeechWords(input)).toBe("ನನಗೆ ಕೆಲಸ ಸಿಗುತ್ತಾ");
    });

    it("preserves non-repeated normal sentences perfectly", () => {
      const normal = "ನನ್ನ ಜನ್ಮ ನಕ್ಷತ್ರ ರೋಹಿಣಿ ನನಗೆ ಗುರು ಬಲ ಯಾವಾಗ ಬರುತ್ತದೆ";
      expect(sanitizeDuplicateSpeechWords(normal)).toBe(normal);
    });

    it("handles empty or single-word inputs safely", () => {
      expect(sanitizeDuplicateSpeechWords("")).toBe("");
      expect(sanitizeDuplicateSpeechWords("   ")).toBe("");
      expect(sanitizeDuplicateSpeechWords("ನಮಸ್ಕಾರ")).toBe("ನಮಸ್ಕಾರ");
    });
  });

  describe("2. cleanJoin utility", () => {
    it("joins multiple string parts without duplicate or excessive whitespace", () => {
      expect(cleanJoin("  ನಮಸ್ಕಾರ  ", " ಗುರುಗಳೇ  ", "   ")).toBe("ನಮಸ್ಕಾರ ಗುರುಗಳೇ");
      expect(cleanJoin(undefined, "ಹಲೋ", null, "   ವಿಶ್ವ ")).toBe("ಹಲೋ ವಿಶ್ವ");
    });
  });

  describe("3. ContinuousSpeechEngine Web Speech API onresult Handling", () => {
    let mockRecognition: any;

    beforeEach(() => {
      mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: "",
        maxAlternatives: 1,
        start: vi.fn(),
        stop: vi.fn(),
        onresult: null as any,
        onerror: null as any,
        onend: null as any
      };

      (window as any).SpeechRecognition = vi.fn().mockImplementation(() => mockRecognition);
      (window as any).webkitSpeechRecognition = (window as any).SpeechRecognition;
    });

    it("never duplicates historical final chunks when onresult fires with un-advanced resultIndex", () => {
      const engine = new ContinuousSpeechEngine("kn");
      const transcriptUpdates: string[] = [];

      const started = engine.start("", {
        onTranscriptUpdate: (fullText) => {
          transcriptUpdates.push(fullText);
        }
      });

      expect(started).toBe(true);
      expect(mockRecognition.start).toHaveBeenCalled();

      // Simulate Event 1: result[0] is final ("ಅವನು")
      mockRecognition.onresult({
        resultIndex: 0,
        results: [
          { isFinal: true, 0: { transcript: "ಅವನು" } }
        ]
      });
      expect(transcriptUpdates[transcriptUpdates.length - 1]).toBe("ಅವನು");

      // Simulate Event 2: result[0] is still in results, result[1] is interim ("ಅವಳಿಗೆ"), resultIndex is 0 (WebKit behavior)
      mockRecognition.onresult({
        resultIndex: 0,
        results: [
          { isFinal: true, 0: { transcript: "ಅವನು" } },
          { isFinal: false, 0: { transcript: "ಅವಳಿಗೆ" } }
        ]
      });
      expect(transcriptUpdates[transcriptUpdates.length - 1]).toBe("ಅವನು ಅವಳಿಗೆ");

      // Simulate Event 3: result[1] updates interim ("ಅವಳಿಗೆ ಯಾವಾಗ"), resultIndex is STILL 0
      mockRecognition.onresult({
        resultIndex: 0,
        results: [
          { isFinal: true, 0: { transcript: "ಅವನು" } },
          { isFinal: false, 0: { transcript: "ಅವಳಿಗೆ ಯಾವಾಗ" } }
        ]
      });
      expect(transcriptUpdates[transcriptUpdates.length - 1]).toBe("ಅವನು ಅವಳಿಗೆ ಯಾವಾಗ");

      // Simulate Event 4: result[1] becomes final ("ಅವಳಿಗೆ"), result[2] is interim ("ಯಾವಾಗ"), resultIndex is 0
      mockRecognition.onresult({
        resultIndex: 0,
        results: [
          { isFinal: true, 0: { transcript: "ಅವನು" } },
          { isFinal: true, 0: { transcript: "ಅವಳಿಗೆ" } },
          { isFinal: false, 0: { transcript: "ಯಾವಾಗ" } }
        ]
      });
      expect(transcriptUpdates[transcriptUpdates.length - 1]).toBe("ಅವನು ಅವಳಿಗೆ ಯಾವಾಗ");

      // Stop engine and verify final text is completely clean without ANY repetitions
      const finalText = engine.stop();
      expect(finalText).toBe("ಅವನು ಅವಳಿಗೆ ಯಾವಾಗ");
    });
  });
});
