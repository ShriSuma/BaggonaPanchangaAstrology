import { describe, it, expect } from "vitest";
import {
  parseSpeechError,
  SANKHYA_QUICK_QUESTIONS_KN,
  SANKHYA_QUICK_QUESTIONS_EN,
  SpeechRecognitionSession
} from "../utils/speechRecognitionHelper";

describe("Speech Recognition Call & Mute Diagnostics", () => {
  it("diagnoses 'audio-capture' error as phone call / audio lock restriction in Kannada", () => {
    const errorInfo = parseSpeechError("audio-capture", "kn");
    expect(errorInfo.code).toBe("audio-capture");
    expect(errorInfo.isCallRelated).toBe(true);
    expect(errorInfo.userFriendlyMessage).toContain("ಮೈಕ್ರೋಫೋನ್ ಆಡಿಯೊ ಲಭ್ಯವಿಲ್ಲ");
    expect(errorInfo.userFriendlyMessage).toContain("Call");
    expect(errorInfo.suggestion).toContain("ಅನ್‌ಮ್ಯೂಟ್");
  });

  it("diagnoses 'audio-capture' error as phone call / audio lock restriction in English", () => {
    const errorInfo = parseSpeechError("audio-capture", "en");
    expect(errorInfo.code).toBe("audio-capture");
    expect(errorInfo.isCallRelated).toBe(true);
    expect(errorInfo.userFriendlyMessage).toContain("Microphone audio unavailable");
    expect(errorInfo.userFriendlyMessage).toContain("active phone call");
    expect(errorInfo.suggestion).toContain("Unmute");
  });

  it("diagnoses 'no-speech' error when muted on call", () => {
    const knError = parseSpeechError("no-speech", "kn");
    expect(knError.code).toBe("no-speech");
    expect(knError.isCallRelated).toBe(true);
    expect(knError.userFriendlyMessage).toContain("ಯಾವುದೇ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ");

    const enError = parseSpeechError("no-speech", "en");
    expect(enError.code).toBe("no-speech");
    expect(enError.isCallRelated).toBe(true);
    expect(enError.userFriendlyMessage).toContain("No speech detected");
  });

  it("diagnoses 'not-allowed' permission errors", () => {
    const knError = parseSpeechError("not-allowed", "kn");
    expect(knError.code).toBe("not-allowed");
    expect(knError.isCallRelated).toBe(true);
    expect(knError.userFriendlyMessage).toContain("ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ");
  });

  it("provides rich quick questions in Kannada and English for 1-tap in-call asking", () => {
    expect(SANKHYA_QUICK_QUESTIONS_KN.length).toBeGreaterThanOrEqual(8);
    expect(SANKHYA_QUICK_QUESTIONS_EN.length).toBeGreaterThanOrEqual(8);

    const careerQ = SANKHYA_QUICK_QUESTIONS_KN.find((q) => q.id === "job");
    expect(careerQ).toBeDefined();
    expect(careerQ?.label).toBe("ಉದ್ಯೋಗ ಬಡ್ತಿ");
    expect(careerQ?.text).toContain("ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ");

    const marriageQ = SANKHYA_QUICK_QUESTIONS_EN.find((q) => q.id === "marriage");
    expect(marriageQ).toBeDefined();
    expect(marriageQ?.label).toBe("Marriage Timing");
    expect(marriageQ?.text).toContain("marriage");
  });

  it("SpeechRecognitionSession handles missing window gracefully", () => {
    const session = new SpeechRecognitionSession("kn-IN");
    expect(session).toBeDefined();
    // In node/vitest environment without window.SpeechRecognition, isAvailable should return false
    expect(session.isAvailable()).toBe(false);

    let caughtError: any = null;
    session.startListening(
      () => {},
      () => {},
      (err) => {
        caughtError = err;
      }
    );
    expect(caughtError).toBeDefined();
  });
});
