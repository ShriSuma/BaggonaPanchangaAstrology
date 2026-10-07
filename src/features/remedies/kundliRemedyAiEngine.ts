import type { KundliInput, KundliOutput } from "../../core/AstroTypes";
import {
  type KundliRemedyDiagnosis,
  type SupportedLanguage,
  generateKundliRemedyReport
} from "./kundliRemedyEngine";
import { askGemini } from "../../core/GeminiEngine";
import { useAppStore } from "../../stores/appStore";
import { recordAiCallUsage } from "../ai/aiTelemetryService";

/**
 * Standard localized fallback notice when AI generation fails after 10 attempts.
 * Conforms to exact audio requirement:
 * "This is not an AI generated one, it got failed and I have went with the normal"
 */
export const REMEDY_AI_FALLBACK_MESSAGES: Record<SupportedLanguage, string> = {
  kn: "⚠️ ಗಮನಿಸಿ: ಇದು AI ರಚಿಸಿದ ನಿರೂಪಣೆಯಲ್ಲ. ೧೦ ಬಾರಿ ಪ್ರಯತ್ನಿಸಿದರೂ AI ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದ್ದರಿಂದ ಸಾಮಾನ್ಯ ಶಾಸ್ತ್ರೀಯ ಗಣನೆಯನ್ನು ಬಳಸಲಾಗಿದೆ.",
  en: "⚠️ Notice: This is not an AI-generated narration. AI generation failed (attempted with 10 retries) and standard classical calculations were used as normal.",
  hi: "⚠️ ध्यान दें: यह AI जनित विवरण नहीं है। 10 प्रयासों के बाद भी AI विफल होने के कारण सामान्य शास्त्रीय वैदिक गणना का उपयोग किया गया है।",
  te: "⚠️ గమనిక: ఇది AI ద్వారా రూపొందించిన వివరణ కాదు. 10 సార్లు ప్రయత్నించిన తర్వాత కూడా AI విఫలమైనందున సాధారణ శాస్త్రీయ వైదిక గణనను ఉపయోగించాము.",
  ta: "⚠️ குறிப்பு: இது AI உருவாக்கிய உரை அல்ல. 10 முயற்சிகளுக்குப் பிறகும் AI தோல்வியடைந்ததால் வழக்கமான சாஸ்திர ரீதியான கணக்கீடு பயன்படுத்தப்பட்டுள்ளது."
};

export type GenerateRemedyAiOptions = {
  kundli: KundliOutput;
  input: KundliInput;
  lang: string;
  apiKey?: string;
  baseDiagnosis?: KundliRemedyDiagnosis | null;
  maxAttempts?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  onAttempt?: (attempt: number, maxAttempts: number) => void;
};

/**
 * Builds a highly customized astrological prompt for gemini-3.5-flash-lite
 * strictly incorporating the devotee's natal chart, afflictions, and remedial prescriptions.
 */
function buildRemedyAiPrompt(diagnosis: KundliRemedyDiagnosis, lang: string): string {
  const normLang = (lang || "kn").slice(0, 2).toLowerCase();
  const langNames: Record<string, string> = {
    kn: "Kannada",
    te: "Telugu",
    ta: "Tamil",
    hi: "Hindi",
    en: "English"
  };
  const targetLanguage = langNames[normLang] || "Kannada";

  const lagnaStr = diagnosis.lagnaName[normLang] || diagnosis.lagnaName.kn;
  const rashiStr = diagnosis.rashiName[normLang] || diagnosis.rashiName.kn;
  const nakshatraStr = diagnosis.nakshatraName[normLang] || diagnosis.nakshatraName.kn;
  const struggleTitle = diagnosis.primaryStruggle.title[normLang] || diagnosis.primaryStruggle.title.kn;
  const struggleDesc = diagnosis.primaryStruggle.description[normLang] || diagnosis.primaryStruggle.description.kn;
  const dashaStr = `${diagnosis.dashaBhuktiAnalysis.mahaDashaLabel[normLang] || diagnosis.dashaBhuktiAnalysis.mahaDashaLabel.kn} / ${diagnosis.dashaBhuktiAnalysis.bhuktiLabel[normLang] || diagnosis.dashaBhuktiAnalysis.bhuktiLabel.kn}`;
  const prescribedSeva = diagnosis.gokarnaTempleRemedies.prescribedSeva.name[normLang] || diagnosis.gokarnaTempleRemedies.prescribedSeva.name.kn;
  const sacredTree = diagnosis.panchangaRemedies.nakshatraRemedy.sacredTree.kannada;
  const stotraTitle = diagnosis.personalizedStotras[0]?.title[normLang] || diagnosis.personalizedStotras[0]?.title.kn;

  const gotraMention = diagnosis.gotra?.trim()
    ? (normLang === "kn" ? `(ಗೋತ್ರ: ${diagnosis.gotra.trim()})` : `(Gotra: ${diagnosis.gotra.trim()})`)
    : "";

  return `
You are the venerable Head Acharya & Vedic Astrologer at Sri Gokarna Mahabaleshwara Sannidhana and the chief master of Baggona Panchanga.
You are delivering a 100% personalized, compassionate Daivika Parihara (divine astrological remedy) narration for this specific devotee:

DEVOTEE CHART PARTICULARS:
- Name: ${diagnosis.devoteeName} ${gotraMention}
- Marital Status: ${diagnosis.maritalStatus === "married" ? "Married (ವಿವಾಹಿತರು) - Focus STRICTLY on marital harmony (ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ), spouse relationship, and domestic peace. NEVER advise on marriage delay, finding a spouse, or getting married!" : "Unmarried"}
- Birth Date & Time: ${diagnosis.birthDate} ${diagnosis.birthTime}
- Natal Lagna: ${lagnaStr}
- Chandra Rashi (Moon Sign): ${rashiStr}
- Janma Nakshatra: ${nakshatraStr}
- Active Vimshottari Period: ${dashaStr}
- Primary Astrological Diagnosis: ${struggleTitle} (${struggleDesc})
- Prescribed Sacred Tree & Deity: ${sacredTree} / ${diagnosis.panchangaRemedies.nakshatraRemedy.rulingDeity[normLang] || diagnosis.panchangaRemedies.nakshatraRemedy.rulingDeity.kn}
- Designated Daily Stotra: ${stotraTitle}
- Sacred Gokarna Temple Seva: ${prescribedSeva}

STRICT INSTRUCTIONS:
1. Write 2 to 3 cohesive, compassionate, deeply spiritual paragraphs in EXCLUSIVELY ${targetLanguage} language.
2. If ${targetLanguage} is an Indian language (Kannada, Telugu, Tamil, Hindi), use ONLY native script. Do NOT use English/Latin letters anywhere.
3. Tailor the advice directly to the devotee's specific planetary alignment, active Dasha, and diagnosed struggle.
4. Explain clearly why chanting the designated stotra, performing the instant pacification protocol, and offering seva at Gokarna Mahabaleshwara will neutralize karmic afflictions and bring mental peace.
5. Maintain a holy, encouraging, and authoritative Vedic priest persona. Do not include markdown headers (###) or bullet points.
6. If the devotee is married, DO NOT mention marriage delay, finding a match, kankana bala, or getting married under any circumstances. Focus strictly on mutual respect, marital harmony, and family bliss.
`.trim();
}

/**
 * Generates personalized Kundli Remedy Diagnosis with GenAI narration (`gemini-3.5-flash-lite`).
 * Implements a strict 10-retry loop with backoff.
 * If all 10 attempts fail, falls back to the classical mathematical engine
 * and attaches a prominent fallback warning message.
 */
export async function generateKundliRemedyWithAi(
  options: GenerateRemedyAiOptions
): Promise<KundliRemedyDiagnosis> {
  const {
    kundli,
    input,
    lang,
    apiKey,
    baseDiagnosis,
    maxAttempts = 10,
    retryDelayMs,
    timeoutMs,
    onAttempt
  } = options;

  const targetLang = (lang || "kn").slice(0, 2).toLowerCase() as SupportedLanguage;

  // 1. Prepare base mathematical diagnosis
  const diagnosis: KundliRemedyDiagnosis =
    baseDiagnosis || generateKundliRemedyReport(kundli, input);

  // If already generated for this language, return existing
  if (diagnosis.isAiGenerated && diagnosis.aiNarrationText?.[targetLang]) {
    return diagnosis;
  }

  const activeKey = (
    apiKey ||
    useAppStore.getState().geminiApiKey ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
    ""
  ).trim();

  // If no valid API key is present at all, immediately set fallback
  if (!activeKey || activeKey.startsWith("AQ.")) {
    diagnosis.isAiGenerated = false;
    diagnosis.aiFallbackMessage = REMEDY_AI_FALLBACK_MESSAGES;
    return diagnosis;
  }

  const prompt = buildRemedyAiPrompt(diagnosis, targetLang);

  // 2. Strict 10-Retry Loop with Exponential Backoff
  let aiSuccess = false;
  let narrationResult = "";
  const isTest = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
  const perAttemptTimeout = timeoutMs ?? (isTest ? 4000 : 10000);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    onAttempt?.(attempt, maxAttempts);
    try {
      // Per-attempt timeout guard
      const timeoutPromise = new Promise<string>((resolve) =>
        setTimeout(() => {
          console.warn(
            `[kundliRemedyAiEngine] Attempt ${attempt}/${maxAttempts} timed out.`
          );
          resolve("");
        }, perAttemptTimeout)
      );

      const raw = await Promise.race([
        askGemini(
          "Personalized Kundli Remedy Narration",
          prompt,
          activeKey,
          targetLang,
          { raw: true, temperature: 0.35, retries: 1 }
        ),
        timeoutPromise
      ]);

      if (typeof raw === "string" && (raw.includes("check your API key") || raw.includes("API_KEY_INVALID"))) {
        console.warn(`[kundliRemedyAiEngine] Invalid API key detected on attempt ${attempt}. Halting retries immediately.`);
        break;
      }

      if (raw === "") {
        console.warn(`[kundliRemedyAiEngine] Attempt ${attempt}/${maxAttempts} timed out. Halting retries.`);
        break;
      }

      if (
        typeof raw === "string" &&
        raw.trim().length > 50 &&
        !raw.includes("Sorry, I encountered an error") &&
        !raw.includes("check your API key") &&
        !raw.includes("GoogleGenerativeAIError") &&
        !raw.includes("Resource has been exhausted")
      ) {
        narrationResult = raw
          .replace(/\r\n/g, "\n")
          .replace(/[#*`_~]/g, "")
          .replace(/[ \t]{2,}/g, " ")
          .replace(/\n\s*\n\s*\n+/g, "\n\n")
          .trim();
        aiSuccess = true;
        void recordAiCallUsage({
          feature: "remedy" as any,
          model: "gemini-3.5-flash-lite"
        });
        break;
      }

      console.warn(
        `[kundliRemedyAiEngine] Attempt ${attempt}/${maxAttempts} returned unsatisfactory response.`
      );
    } catch (err) {
      console.warn(
        `[kundliRemedyAiEngine] Attempt ${attempt}/${maxAttempts} failed with error:`,
        err
      );
    }

    if (attempt < maxAttempts) {
      // Backoff delay between attempts
      const backoff =
        retryDelayMs !== undefined
          ? retryDelayMs
          : isTest
          ? 0
          : Math.min(350 * attempt, 2000);
      if (backoff > 0) {
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  // 3. Process outcome
  if (aiSuccess && narrationResult) {
    diagnosis.isAiGenerated = true;
    diagnosis.aiNarration = narrationResult;
    diagnosis.aiNarrationText = {
      ...(diagnosis.aiNarrationText || {}),
      [targetLang]: narrationResult
    };
    diagnosis.aiFallbackMessage = undefined;
  } else {
    // 10 retries failed: fall back to normal with clear notification
    diagnosis.isAiGenerated = false;
    diagnosis.aiFallbackMessage = REMEDY_AI_FALLBACK_MESSAGES;
  }

  return diagnosis;
}
