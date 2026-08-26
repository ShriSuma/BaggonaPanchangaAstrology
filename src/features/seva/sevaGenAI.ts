import { askGemini } from "../../core/GeminiEngine";

/**
 * Dynamically transliterates an English name into the target Indic language using Gemini.
 * Uses a minimal prompt for speed and accuracy.
 */
export async function transliterateNameWithAI(englishName: string, lang: string, apiKey?: string): Promise<string> {
  if (!englishName || lang.startsWith("en")) return englishName;

  const prompt = `Transliterate the following personal name from English into the specified language's script. 
Only return the transliterated text. Do not add any extra words, punctuation, or explanations.
Language: ${lang}
Name: ${englishName}`;

  try {
    const result = await askGemini("Transliterate", prompt, apiKey || "", lang, { raw: true, temperature: 0.1 });
    return result.replace(/['"]/g, '').trim() || englishName;
  } catch (err) {
    console.error("Transliteration failed:", err);
    return englishName;
  }
}

/**
 * Fetches dynamic details about a specific Pooja or Homa from Gemini across all 5 languages (kn, hi, te, ta, en).
 * Generates What it is (Sankalpa), Why it's done (Karana), and Divine Benefits (Phalashruti).
 */
export async function fetchPoojaDetailsWithAI(poojaName: string, lang: string, apiKey?: string): Promise<{ what: string; why: string; benefit: string; }> {
  const prompt = `You are an authentic Vedic Pandit scholar and expert priest of Gokarna Kshetra.
Describe the following Sacred Pooja / Homa ritual clearly and concisely: "${poojaName}".

Provide exactly THREE short, focused paragraphs in the requested language (${lang}) tailored for an A4 print layout box:
Paragraph 1 (Pooja Sankalpa / What is this Pooja): Exactly 2 to 3 concise sentences describing the sacred ritual, uniting all its components into a sacred synthesis.
Paragraph 2 (Pooja Karana / Why is it performed): Exactly 2 to 3 concise sentences describing the astrological reasons, planetary dosha pacification, and life challenges it rectifies.
Paragraph 3 (Divine Fruits & Benefits / Phalashruti): Exactly 2 to 3 concise sentences describing the blessings, health, longevity, prosperity, and spiritual protection received.

CRITICAL LENGTH CONSTRAINT: Keep each paragraph between 35 and 50 words (under 250 characters) so it fits neatly within the print document card without overflowing.
Language: ${lang}
Do not use bold markdown asterisks or headings. Return only the three distinct paragraphs separated by a double newline.`;

  const cleanText = (t: string) => t.replace(/[*#_~`]/g, '').replace(/^(Paragraph\s*\d+:?|೧|೨|೩|\d+\.|\d+\))\s*/i, '').trim();

  try {
    const result = await askGemini("Pooja Details", prompt, apiKey || "", lang, { raw: true, temperature: 0.3 });
    const parts = result.split('\n\n').map(p => cleanText(p)).filter(p => p.length > 0);
    
    if (parts.length >= 3) {
      return {
        what: parts[0],
        why: parts[1],
        benefit: parts[2]
      };
    }
    
    // Fallback splitting on single newline if double newline not present
    const singleParts = result.split('\n').map(p => cleanText(p)).filter(p => p.length > 0);
    return {
      what: singleParts[0] || "ಪೂಜಾ ಮಹಾ ಸಂಕಲ್ಪವು ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳನ್ನು ಸಿದ್ಧಿಗೊಳಿಸುವ ಪರಮ ಪವಿತ್ರ ಆರಾಧನೆಯಾಗಿದೆ.",
      why: singleParts[1] || singleParts[0] || "ಜಾತಕ ದೋಷಗಳ ಶಮನ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶಾಂತಿ-ಸಮೃದ್ಧಿಗಾಗಿ ಈ ಸೇವೆಯನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ.",
      benefit: singleParts[2] || singleParts[1] || "ದೈವಿಕ ರಕ್ಷಣೆ, ನಿರಂತರ ಆಯುರಾರೋಗ್ಯ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ."
    };
  } catch (err) {
    console.error("Pooja details fetch failed:", err);
    return {
      what: "ಪೂಜಾ ಮಹಾ ಸಂಕಲ್ಪವು ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳನ್ನು ಸಿದ್ಧಿಗೊಳಿಸುವ ಪರಮ ಪವಿತ್ರ ಆರಾಧನೆಯಾಗಿದೆ.",
      why: "ಜಾತಕ ದೋಷಗಳ ಶಮನ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶಾಂತಿ-ಸಮೃದ್ಧಿಗಾಗಿ ಈ ಸೇವೆಯನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ.",
      benefit: "ದೈವಿಕ ರಕ್ಷಣೆ, ನಿರಂತರ ಆಯುರಾರೋಗ್ಯ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ."
    };
  }
}
