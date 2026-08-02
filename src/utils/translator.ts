import { getLocalAstrologyTerm } from "./localTranslations";

/**
 * A simple free translation utility using Google Translate's free API endpoint.
 * This does not require an API key and is suitable for development and lightweight usage.
 */
export async function translateText(text: string, targetLanguageCode: string, sourceLang: string = "auto"): Promise<string> {
  if (!text || !targetLanguageCode || targetLanguageCode === sourceLang) {
    return text; // No translation needed
  }

  // 1. Check local exact dictionary match to prevent hallucinations
  const localMatch = getLocalAstrologyTerm(text, targetLanguageCode);
  if (localMatch !== text) {
    return localMatch;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLanguageCode}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Translation API failed:", response.statusText);
      return text;
    }

    const data = await response.json();
    // The response is an array of arrays where the first element of each inner array is the translated segment.
    if (data && Array.isArray(data) && data[0]) {
      const translated = data[0].map((item: any) => item[0]).join("");
      return translated;
    }

    return text; // Fallback
  } catch (error) {
    console.error("Error during translation:", error);
    return text; // Fallback to original text on failure
  }
}
