# Update sevaGenAI.ts
file_path_genai = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/features/seva/sevaGenAI.ts"

new_genai_code = """import { askGemini } from "../../core/GeminiEngine";

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
  const prompt = `You are an authentic Vedic Pandit scholar and expert priest.
Describe the following Sacred Pooja / Homa ritual in depth: "${poojaName}".

Provide exactly THREE distinct paragraphs in the requested language (${lang}):
Paragraph 1 (Pooja Sankalpa / What is this Pooja): A rich explanation of the sacred ritual and its Vedic significance.
Paragraph 2 (Pooja Karana / Why is it performed): The astrological, spiritual, and dosha-rectification reasons why a devotee should perform this pooja.
Paragraph 3 (Divine Fruits & Benefits / Phalashruti): The spiritual and worldly blessings, health, prosperity, and protection the devotee will receive.

Language: ${lang}
Do not use bold markdown asterisks or headings. Return only the three distinct paragraphs separated by a double newline.`;

  try {
    const result = await askGemini("Pooja Details", prompt, apiKey || "", lang, { raw: true, temperature: 0.3 });
    const parts = result.split('\\n\\n').map(p => p.trim()).filter(p => p.length > 0);
    
    if (parts.length >= 3) {
      return {
        what: parts[0],
        why: parts[1],
        benefit: parts[2]
      };
    }
    
    // Fallback splitting on single newline if double newline not present
    const singleParts = result.split('\\n').map(p => p.trim()).filter(p => p.length > 0);
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
"""

with open(file_path_genai, "w", encoding="utf-8") as f:
    f.write(new_genai_code)

print("Updated sevaGenAI.ts successfully!")
