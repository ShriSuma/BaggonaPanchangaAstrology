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
    // Clean up just in case Gemini adds quotes
    return result.replace(/['"]/g, '').trim() || englishName;
  } catch (err) {
    console.error("Transliteration failed:", err);
    return englishName;
  }
}

/**
 * Fetches dynamic details about a specific Pooja or Homa from Gemini.
 * Generates What it is, Why it's done, and Benefits.
 */
export async function fetchPoojaDetailsWithAI(poojaName: string, lang: string, apiKey?: string): Promise<{ what: string; why: string; benefit: string; }> {
  const prompt = `You are a Vedic expert priest at Gokarna Mahabaleshwara temple.
Describe the following Pooja/Homa: "${poojaName}".

Provide exactly THREE short paragraphs in the requested language.
Paragraph 1: What is this pooja? (A brief description of the ritual itself).
Paragraph 2: Why is this pooja performed? (The astrological or spiritual reasons).
Paragraph 3: What are the benefits the devotee will receive?

Do not use bold text, asterisks, or headings. Just return the three paragraphs separated by a double newline.

Language: ${lang}`;

  try {
    const result = await askGemini("Pooja Details", prompt, apiKey || "", lang, { raw: true, temperature: 0.7 });
    const parts = result.split('\n').filter(p => p.trim().length > 0);
    
    return {
      what: parts[0]?.trim() || "A sacred offering for divine blessings.",
      why: parts[1]?.trim() || "To seek divine grace and spiritual upliftment.",
      benefit: parts[2]?.trim() || "Brings peace, prosperity, and harmony."
    };
  } catch (err) {
    console.error("Pooja details fetch failed:", err);
    return {
      what: "A sacred offering for divine blessings.",
      why: "To seek divine grace and spiritual upliftment.",
      benefit: "Brings peace, prosperity, and harmony."
    };
  }
}
