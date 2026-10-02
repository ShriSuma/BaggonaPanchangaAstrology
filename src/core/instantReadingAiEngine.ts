import { askGemini } from "./GeminiEngine";
import type { CurrentLifeSituationDiagnosis } from "./CurrentLifeAndCareerDiagnosticEngine";
import {
  sanitizeAstrologyKannadaText,
  toKannadaRashi,
  toKannadaPlanet,
  toKannadaNakshatra
} from "../utils/kannadaAstrologyTerms";

export interface GenerateAiLifeSituationParams {
  session: {
    input?: {
      name?: string;
      gender?: string;
      birthDate?: string;
      birthTime?: string;
      maritalStatus?: string;
      latitude?: number;
      longitude?: number;
    };
    result: {
      lagnaRashi: { english: string; index?: number };
      moonSign: { english: string; index?: number };
      planets: Array<{
        name: string;
        house: number;
        nakshatra?: { english: string };
      }>;
    };
  };
  currentDiagnosis: any;
  cls?: CurrentLifeSituationDiagnosis;
  apiKey?: string;
  lang?: string;
}

/**
 * Generates an authoritative, deeply resonant Current Life Situation diagnosis and impressive header using Gemini AI
 * (strictly 'gemini-3.5-flash-lite' per baggona-astrology-master skill).
 *
 * Implements a strict 10-retry loop with exponential backoff.
 * If all 10 attempts fail, or if AI output is invalid, cleanly falls back to the deterministic classical diagnosis
 * without ever showing error banners or retry warnings to the user or PDF template.
 */
export async function generateCurrentLifeSituationWithAi(
  params: GenerateAiLifeSituationParams
): Promise<CurrentLifeSituationDiagnosis | null> {
  const { session, currentDiagnosis, cls, apiKey, lang = "kn" } = params;
  if (!cls) return null;

  const isKn = lang.startsWith("kn");
  const devoteeName = session.input?.name || (isKn ? "ಭಕ್ತರೇ" : "Devotee");
  const isFemale = session.input?.gender === "Female";
  const lagnaEng = session.result.lagnaRashi.english;
  const lagnaKn = toKannadaRashi(lagnaEng);
  const moonEng = session.result.moonSign.english;
  const moonKn = toKannadaRashi(moonEng);
  const moonNak = session.result.planets.find((p) => p.name === "Moon")?.nakshatra?.english || "Ashwini";
  const moonNakKn = toKannadaNakshatra(moonNak);

  const runningDasha = currentDiagnosis?.prasthuthaSthiti?.runningDashaSummary || "";
  const primaryChallenge = currentDiagnosis?.primaryLifeChallenge?.description || "";
  const prof = currentDiagnosis?.accurateProfession;

  const prompt = `
Vedic Astrologer Profile & Task:
You are an authoritative, deeply intuitive Vedic Master Astrologer examining a devotee's birth chart face-to-face.
Your task is to generate the devotee's ACUTE CURRENT LIFE REALITY (ಹಾಲಿ ವಾಸ್ತವ ಜೀವನ ಸ್ಥಿತಿ & ಆಂತರಿಕ ಮನಸ್ಥಿತಿ) and an IMPRESSIVE, PRESTIGIOUS HEADER in 100% natural, elegant, respectful ${isKn ? "Kannada" : "English"}.

Devotee Context:
- Name: ${devoteeName}
- Gender: ${session.input?.gender || "Not specified"} (${isFemale ? "Female" : "Male"})
- Lagna: ${lagnaKn} (${lagnaEng})
- Moon Sign: ${moonKn} (${moonEng})
- Nakshatra: ${moonNakKn} (${moonNak})
- Running Dasha & Gochara: ${runningDasha}
- Primary Life Area: ${currentDiagnosis?.primaryLifeChallenge?.area || "Life Focus"} (${cls.category})
- Classical Headline Reference: ${cls.headlineKn} / ${cls.headlineEn}
- Key Profession Potential: ${prof?.titleKn || ""} (${prof?.titleEn || ""})

CRITICAL MANDATES FOR THE HEADER & NARRATIVE:
1. IMPRESSIVE, AUTHORITATIVE & PRESTIGIOUS HEADLINE (ಮುಖ್ಯ ಶೀರ್ಷಿಕೆ):
   - Make the headline deeply impressive, resonant, and dignified.
   - For creative, public-facing, media, 10th house, or career ambition charts:
     * Focus on public recognition, prestige, and fame ("ಕೀರ್ತಿ"), strategic & creative vision ("ಕಲಾತ್ಮಕ ಯೋಜನೆ"), wanting talent and dedication to be spotlighted and highlighted before the public/management, seeking career elevation, and demanding deserved appreciation for their hard work.
     * Example Header: "ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ, ಕೀರ್ತಿ, ಕಲಾತ್ಮಕ ಯೋಜನೆ & ವೃತ್ತಿ ಗೌರವ ಪ್ರಾಪ್ತಿ"
     * NEVER assume cheap, superficial "social media reels/influencer" tropes unless the person explicitly works in social media. Elevate the tone to artistic brilliance, public prestige, strategic vision, and career honor.
   - For marriage, financial, or academic charts, make the headline equally prestigious, authoritative, and deeply resonant.

2. DETAILED REALITY & HAPPENINGS (ಪ್ರಸ್ತುತ ಜೀವನದ ನೈಜ ವಾಸ್ತವ ಸಂಗತಿಗಳು):
   - 2 to 3 dense sentences on the exact external real-world situations, career crossroads, and family responsibilities they are navigating right now.

3. INTERNAL MINDSET & PSYCHOLOGICAL WEATHER (ಆಂತರಿಕ ಮನಸ್ಥಿತಿ & ಯೋಚನಾ ಲಹರಿ):
   - 2 to 3 dense sentences on what is going on in their mind at night: the drive for self-reliance, the desire for recognition/honor, silent sacrifices, and plans for the next breakthrough.

4. 3 TO 5 DAILY SYMPTOMS (ದೈನಂದಿನ ಜೀವನದ ನೈಜ ಅನುಭವಗಳು):
   - Specific real-world symptoms they feel in daily routine.

5. SCRIPT & DIGIT RULES:
   - In Kannada text, use 100% PURE Kannada script. Absolutely ZERO English words or Latin alphabet.
   - All numbers must be in ENGLISH DIGITS (1, 2, 3, 10, etc.).
   - Do NOT use markdown bold asterisks (no ** or *).

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this exact schema:
{
  "headlineKn": "Impressive Kannada headline e.g. ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ, ಕೀರ್ತಿ, ಕಲಾತ್ಮಕ ಯೋಜನೆ & ವೃತ್ತಿ ಗೌರವ ಪ್ರಾಪ್ತಿ",
  "headlineEn": "Impressive English headline",
  "detailedRealityKn": "2-3 dense sentences in pure Kannada",
  "detailedRealityEn": "2-3 dense sentences in English",
  "externalLifeRealityKn": "2-3 dense sentences in pure Kannada on external happenings",
  "externalLifeRealityEn": "2-3 dense sentences in English on external happenings",
  "internalMindsetKn": "2-3 dense sentences in pure Kannada on internal thoughts",
  "internalMindsetEn": "2-3 dense sentences in English on internal thoughts",
  "planetaryCulpritKn": "Planetary root cause in pure Kannada",
  "planetaryCulpritEn": "Planetary root cause in English",
  "symptomsChecklistKn": [
    "Symptom 1 in pure Kannada",
    "Symptom 2 in pure Kannada",
    "Symptom 3 in pure Kannada"
  ],
  "symptomsChecklistEn": [
    "Symptom 1 in English",
    "Symptom 2 in English",
    "Symptom 3 in English"
  ]
}
`;

  const MAX_ATTEMPTS = 10;
  let attempt = 0;
  let lastError: any = null;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    try {
      const rawResponse = await askGemini(
        "Generate Acute Current Life Reality Diagnosis and Impressive Header",
        prompt,
        apiKey || "",
        isKn ? "kn" : "en",
        {
          raw: true,
          temperature: 0.3,
          retries: 1 // Single attempt for inner askGemini; our outer loop handles the 10 attempts
        }
      );

      if (rawResponse) {
        const cleanJson = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        if (parsed.headlineKn && (parsed.detailedRealityKn || parsed.externalLifeRealityKn)) {
          return {
            ...cls,
            headlineKn: sanitizeAstrologyKannadaText(parsed.headlineKn),
            headlineEn: parsed.headlineEn ? sanitizeAstrologyKannadaText(parsed.headlineEn) : cls.headlineEn,
            detailedRealityKn: sanitizeAstrologyKannadaText(parsed.detailedRealityKn || cls.detailedRealityKn),
            detailedRealityEn: parsed.detailedRealityEn ? sanitizeAstrologyKannadaText(parsed.detailedRealityEn) : cls.detailedRealityEn,
            externalLifeRealityKn: sanitizeAstrologyKannadaText(parsed.externalLifeRealityKn || parsed.detailedRealityKn || cls.externalLifeRealityKn || cls.detailedRealityKn),
            externalLifeRealityEn: parsed.externalLifeRealityEn ? sanitizeAstrologyKannadaText(parsed.externalLifeRealityEn) : (cls.externalLifeRealityEn || cls.detailedRealityEn),
            internalMindsetKn: sanitizeAstrologyKannadaText(parsed.internalMindsetKn || cls.internalMindsetKn || ""),
            internalMindsetEn: parsed.internalMindsetEn ? sanitizeAstrologyKannadaText(parsed.internalMindsetEn) : (cls.internalMindsetEn || ""),
            planetaryCulpritKn: parsed.planetaryCulpritKn ? sanitizeAstrologyKannadaText(parsed.planetaryCulpritKn) : cls.planetaryCulpritKn,
            planetaryCulpritEn: parsed.planetaryCulpritEn ? sanitizeAstrologyKannadaText(parsed.planetaryCulpritEn) : cls.planetaryCulpritEn,
            symptomsChecklistKn: Array.isArray(parsed.symptomsChecklistKn) && parsed.symptomsChecklistKn.length > 0
              ? parsed.symptomsChecklistKn.map((s: string) => sanitizeAstrologyKannadaText(s))
              : cls.symptomsChecklistKn,
            symptomsChecklistEn: Array.isArray(parsed.symptomsChecklistEn) && parsed.symptomsChecklistEn.length > 0
              ? parsed.symptomsChecklistEn.map((s: string) => sanitizeAstrologyKannadaText(s))
              : cls.symptomsChecklistEn
          };
        }
      }
      throw new Error("Empty or invalid structured output from AI model");
    } catch (err: any) {
      lastError = err;
      if (attempt < MAX_ATTEMPTS) {
        const delayMs = Math.min(250 * Math.pow(1.3, attempt), 2000);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // If all 10 attempts fail, cleanly fall back to deterministic diagnosis
  console.warn(
    `[InstantReadingAiEngine] 10 attempts exhausted (${lastError?.message || lastError}). Cleanly falling back to classical deterministic diagnosis.`
  );
  return cls;
}
