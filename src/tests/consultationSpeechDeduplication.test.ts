import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitizeDuplicateSpeechWords,
  collapseConsecutiveTokens,
  mergeSpeechSegments,
  cleanJoin,
  normToken,
  ContinuousSpeechEngine,
  refineSpokenConsultationQuestion
} from "../features/consultation/consultationSpeechService";
import { SpeechRecognitionSession } from "../utils/speechRecognitionHelper";

describe("Consultation Speech Service - Anti-Duplication & Deduplication Engine", () => {
  describe("1. sanitizeDuplicateSpeechWords & collapseConsecutiveTokens", () => {
    it("deduplicates single-word repetitions in Kannada (user's exact report)", () => {
      const input = "ಅವನು ಅವನು ಅವನು ಅವನು ಅವಳಿಗೆ ಅವಳಿಗೆ ಅವಳಿಗೆ";
      const result = sanitizeDuplicateSpeechWords(input);
      expect(result).toBe("ಅವನು ಅವಳಿಗೆ");
    });

    it("collapses single words repeated 10, 20, or 50 times in a single pass (crucial fix)", () => {
      // 10 times repeat
      const tenRepeats = Array(10).fill("ಯಾವಾಗ").join(" ");
      expect(sanitizeDuplicateSpeechWords(tenRepeats)).toBe("ಯಾವಾಗ");

      // 20 times repeat (exact user report: 'Same words are getting repeated 10 or 20 times')
      const twentyRepeats = Array(20).fill("ಯಾವಾಗ").join(" ");
      expect(sanitizeDuplicateSpeechWords(twentyRepeats)).toBe("ಯಾವಾಗ");

      // 50 times repeat
      const fiftyRepeats = Array(50).fill("ಪ್ರಶ್ನೆ").join(" ");
      expect(sanitizeDuplicateSpeechWords(fiftyRepeats)).toBe("ಪ್ರಶ್ನೆ");
    });

    it("collapses repeated phrases repeated multiple times (2-word, 3-word, 4-word)", () => {
      // 2-word phrase repeated 5 times
      const twoWordRepeats = Array(5).fill("ಯಾವಾಗ ಆಗುತ್ತದೆ").join(" ");
      expect(sanitizeDuplicateSpeechWords(twoWordRepeats)).toBe("ಯಾವಾಗ ಆಗುತ್ತದೆ");

      // 3-word phrase repeated 4 times
      const threeWordRepeats = Array(4).fill("ನನಗೆ ಕೆಲಸ ಸಿಗುತ್ತಾ").join(" ");
      expect(sanitizeDuplicateSpeechWords(threeWordRepeats)).toBe("ನನಗೆ ಕೆಲಸ ಸಿಗುತ್ತಾ");

      // 4-word phrase repeated 3 times
      const fourWordRepeats = Array(3).fill("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ").join(" ");
      expect(sanitizeDuplicateSpeechWords(fourWordRepeats)).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ");
    });

    it("deduplicates single-word repetitions in English and Hindi", () => {
      const en = "when when when will will will I get promotion promotion promotion";
      expect(sanitizeDuplicateSpeechWords(en)).toBe("when will I get promotion");

      const hi = "मेरी मेरी मेरी शादी कब कब कब होगी";
      expect(sanitizeDuplicateSpeechWords(hi)).toBe("मेरी शादी कब होगी");
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

    it("deduplicates consecutive identical sentences", () => {
      const doubleSentence = "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ? ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?";
      expect(sanitizeDuplicateSpeechWords(doubleSentence)).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?");
    });
  });

  describe("2. Unicode NFC vs NFD Normalization & Zero-Width Formatting Across All 7 Languages", () => {
    it("matches decomposed NFD and precomposed NFC tokens identically in Kannada", () => {
      const nfc = "ಹಲೋ";
      const nfd = nfc.normalize("NFD");
      // Without normalization, raw string equality fails
      expect(nfc === nfd).toBe(false);
      // normToken must normalize to NFC and match
      expect(normToken(nfc)).toBe(normToken(nfd));

      // Repeated across NFD and NFC forms: must collapse
      const mixed = `${nfd} ${nfc} ${nfd} ${nfc}`;
      expect(sanitizeDuplicateSpeechWords(mixed)).toBe("ಹಲೋ");
    });

    it("matches decomposed NFD and precomposed NFC across Hindi, Telugu, Tamil, Malayalam, Marathi, and English", () => {
      const testCases = [
        { lang: "hi", text: "शादी कब होगी" },
        { lang: "te", text: "నా వివాహం ఎప్పుడు" },
        { lang: "ta", text: "எனக்கு திருமணம் எப்போது" },
        { lang: "ml", text: "എന്റെ വിവാഹം എപ്പോൾ" },
        { lang: "mr", text: "माझे लग्न कधी होईल" },
        { lang: "en", text: "When will I get married" }
      ];

      for (const tc of testCases) {
        const nfc = tc.text.normalize("NFC");
        const nfd = tc.text.normalize("NFD");
        const repeated = `${nfd} ${nfc} ${nfd}`;
        const sanitized = sanitizeDuplicateSpeechWords(repeated);
        expect(sanitized).toBe(nfc);
      }
    });

    it("strips zero-width non-joiner (ZWNJ \\u200C) and zero-width joiner (ZWJ \\u200D)", () => {
      const withZwnj = "ನನ್ನ\u200C ಮದುವೆ";
      const withoutZwnj = "ನನ್ನ ಮದುವೆ";
      expect(normToken(withZwnj)).toBe(normToken(withoutZwnj));

      const repeated = `${withZwnj} ${withoutZwnj} ${withZwnj}`;
      expect(sanitizeDuplicateSpeechWords(repeated)).toBe("ನನ್ನ ಮದುವೆ");
    });

    it("handles Indic dandas (। and ॥) and terminal punctuation deduplication", () => {
      const withDanda = "मेरी शादी कब होगी॥ मेरी शादी कब होगी।";
      expect(sanitizeDuplicateSpeechWords(withDanda)).toBe("मेरी शादी कब होगी॥");

      const knWithDanda = "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ॥ ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?";
      expect(sanitizeDuplicateSpeechWords(knWithDanda)).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ॥");
    });
  });

  describe("3. cleanJoin & mergeSpeechSegments utilities", () => {
    it("joins multiple string parts without duplicate or excessive whitespace", () => {
      expect(cleanJoin("  ನಮಸ್ಕಾರ  ", " ಗುರುಗಳೇ  ", "   ")).toBe("ನಮಸ್ಕಾರ ಗುರುಗಳೇ");
      expect(cleanJoin(undefined, "ಹಲೋ", null, "   ವಿಶ್ವ ")).toBe("ಹಲೋ ವಿಶ್ವ");
    });

    it("merges segments with suffix-prefix overlap without repeating words", () => {
      const merged = mergeSpeechSegments("ನನ್ನ ಮದುವೆ ಯಾವಾಗ", "ಯಾಗಾಗ ಆಗುತ್ತದೆ");
      expect(merged).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಯಾಗಾಗ ಆಗುತ್ತದೆ");

      const mergedOverlap = mergeSpeechSegments("ನನ್ನ ಮದುವೆ ಯಾವಾಗ", "ಯಾವಾಗ ಆಗುತ್ತದೆ");
      expect(mergedOverlap).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ");
    });

    it("never appends incoming segment if incoming segment is already inside baseText", () => {
      const base = "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ ತಿಳಿಸಿ";
      const incoming = "ಯಾವಾಗ";
      // Crucial: 'ಯಾವಾಗ' is inside 'base', must NOT append to end!
      expect(mergeSpeechSegments(base, incoming)).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ ತಿಳಿಸಿ");
    });

    it("returns incoming segment if incoming is an expanded version of baseText", () => {
      const base = "ನನ್ನ ಮದುವೆ ಯಾವಾಗ";
      const incoming = "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ ತಿಳಿಸಿ";
      expect(mergeSpeechSegments(base, incoming)).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ ತಿಳಿಸಿ");
    });

    it("correctly handles Android Chrome cumulative speech recognition stream", () => {
      // Android Chrome Web Speech API frequently streams cumulative interim results
      let current = "";
      const stream = [
        "ನನ್ನ",
        "ನನ್ನ ಮದುವೆ",
        "ನನ್ನ ಮದುವೆ ಯಾವಾಗ",
        "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ"
      ];

      for (const piece of stream) {
        current = mergeSpeechSegments(current, piece);
      }

      expect(current).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ");
    });
  });

  describe("4. ContinuousSpeechEngine Web Speech API onresult Handling", () => {
    let mockRecognition: any;

    beforeEach(() => {
      mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: "",
        maxAlternatives: 1,
        start: vi.fn(),
        stop: vi.fn(),
        abort: vi.fn(),
        onresult: null as any,
        onerror: null as any,
        onend: null as any
      };

      (window as any).SpeechRecognition = vi.fn().mockImplementation(() => mockRecognition);
      (window as any).webkitSpeechRecognition = (window as any).SpeechRecognition;
    });

    it("never duplicates historical final chunks when onresult fires repeatedly", () => {
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

      // Simulate Event 2: result[0] is final ("ಅವನು"), result[1] is interim ("ಅವಳಿಗೆ")
      mockRecognition.onresult({
        resultIndex: 0,
        results: [
          { isFinal: true, 0: { transcript: "ಅವನು" } },
          { isFinal: false, 0: { transcript: "ಅವಳಿಗೆ" } }
        ]
      });
      expect(transcriptUpdates[transcriptUpdates.length - 1]).toBe("ಅವನು ಅವಳಿಗೆ");

      // Simulate Event 3: result[1] updates interim ("ಅವಳಿಗೆ ಯಾವಾಗ")
      mockRecognition.onresult({
        resultIndex: 0,
        results: [
          { isFinal: true, 0: { transcript: "ಅವನು" } },
          { isFinal: false, 0: { transcript: "ಅವಳಿಗೆ ಯಾವಾಗ" } }
        ]
      });
      expect(transcriptUpdates[transcriptUpdates.length - 1]).toBe("ಅವನು ಅವಳಿಗೆ ಯಾವಾಗ");

      // Simulate Event 4: result[1] becomes final ("ಅವಳಿಗೆ"), result[2] is interim ("ಯಾವಾಗ")
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

    it("simulates Android Chrome multi-alternative progressive hypothesis without word duplication", () => {
      const engine = new ContinuousSpeechEngine("kn");
      const transcriptUpdates: string[] = [];

      engine.start("", {
        onTranscriptUpdate: (fullText) => {
          transcriptUpdates.push(fullText);
        }
      });

      // Android Chrome event with multiple cumulative interim phrases
      mockRecognition.onresult({
        resultIndex: 0,
        results: [
          { isFinal: false, 0: { transcript: "ನನ್ನ" } },
          { isFinal: false, 0: { transcript: "ನನ್ನ ಕೆಲಸ" } },
          { isFinal: false, 0: { transcript: "ನನ್ನ ಕೆಲಸ ಯಾವಾಗ" } }
        ]
      });

      const latest = transcriptUpdates[transcriptUpdates.length - 1];
      // Must not be "ನನ್ನ ನನ್ನ ಕೆಲಸ ನನ್ನ ಕೆಲಸ ಯಾವಾಗ"
      expect(latest).toBe("ನನ್ನ ಕೆಲಸ ಯಾವಾಗ");

      const finalText = engine.stop();
      expect(finalText).toBe("ನನ್ನ ಕೆಲಸ ಯಾವಾಗ");
    });
  });

  describe("5. SpeechRecognitionSession in speechRecognitionHelper", () => {
    let mockRecognition: any;

    beforeEach(() => {
      mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: "",
        maxAlternatives: 1,
        start: vi.fn(),
        stop: vi.fn(),
        abort: vi.fn(),
        onresult: null as any,
        onerror: null as any,
        onend: null as any
      };

      (window as any).SpeechRecognition = vi.fn().mockImplementation(() => mockRecognition);
      (window as any).webkitSpeechRecognition = (window as any).SpeechRecognition;
    });

    it("sanitizes cumulative interim speech and prevents 10-20x repeats in general voice input", () => {
      const updates: string[] = [];
      const session = new SpeechRecognitionSession("kn-IN");

      const started = session.startListening((text) => {
        updates.push(text);
      });

      expect(started).toBe(true);

      // Emulate rapid repeated words emitted by microphone feedback or browser stutter
      mockRecognition.onresult({
        resultIndex: 0,
        results: [
          { isFinal: true, 0: { transcript: "ಬೆಂಗಳೂರು ಬೆಂಗಳೂರು ಬೆಂಗಳೂರು" } },
          { isFinal: false, 0: { transcript: "ಕರ್ನಾಟಕ ಕರ್ನಾಟಕ" } }
        ]
      });

      const lastUpdate = updates[updates.length - 1];
      expect(lastUpdate).toBe("ಬೆಂಗಳೂರು ಕರ್ನಾಟಕ");
      session.stopListening();
    });
  });

  describe("6. refineSpokenConsultationQuestion (AI Question Refiner)", () => {
    it("returns clean sanitized text immediately when offline or no API key", async () => {
      const raw = "ನನ್ನ ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಯಾವಾಗ ಆಗತ್ತೆ";
      const refined = await refineSpokenConsultationQuestion({
        spokenQuestion: raw,
        language: "kn",
        apiKey: "" // no key -> instant fallback
      });
      expect(refined).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗತ್ತೆ");
    });

    it("safely handles short or empty questions without crashing", async () => {
      expect(await refineSpokenConsultationQuestion({ spokenQuestion: "", language: "kn" })).toBe("");
      expect(await refineSpokenConsultationQuestion({ spokenQuestion: "ಹಲೋ", language: "kn" })).toBe("ಹಲೋ");
    });
  });
});
