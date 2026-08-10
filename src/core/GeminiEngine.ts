import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export type AskGeminiOptions = {
  /**
   * Send `contextData` to the model exactly as written instead of wrapping it in
   * the generic reading shell below. Callers that build a full prompt of their own
   * need this: the wrapper repeats its persona on every call, and when seven
   * sections share one persona the model returns seven near-identical openings.
   */
  raw?: boolean;
  /** Raised above the default to keep repeat downloads from reading the same. */
  temperature?: number;
};

export async function askGemini(
  question: string,
  contextData: string,
  apiKey: string,
  language: string,
  options: AskGeminiOptions = {}
): Promise<string> {
  const languageNames: Record<string, string> = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "te": "Telugu",
    "ta": "Tamil",
    "ml": "Malayalam"
  };
  
  const targetLanguage = languageNames[language.split('-')[0]] || "English";
  
  const activeKey = (apiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (!activeKey) {
    // Mock Mode for testing without API key
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (targetLanguage === "Kannada") {
      return `ನಮಸ್ಕಾರ. ನೀವು API ಕೀಲಿಯನ್ನು ಒದಗಿಸಿಲ್ಲವಾದ್ದರಿಂದ ನಾನು ಅಣಕು ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ನೀಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಪ್ರಶ್ನೆ: "${question}". ದಯವಿಟ್ಟು ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಜೆಮಿನಿ ಕೀಲಿಯನ್ನು ಹಾಕಿ.`;
    } else {
      return `Hello. Since you have not provided a Gemini API Key in the settings, I am providing a mock response. You asked: "${question}". Please add your API key for real predictions.`;
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      ...(options.temperature !== undefined
        ? { generationConfig: { temperature: options.temperature, topP: 0.95 } }
        : {}),
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

    const prompt = options.raw ? contextData : `
You are a highly knowledgeable Vedic Astrologer providing an empathetic reading.
Do not use markdown formatting like asterisks or hashtags since your response might be read aloud via text-to-speech.

Here is the user's astrological data computed by our engine:
${contextData}

The user's question: "${question}"

Reply to the user combining the data above with your astrological knowledge.
Respond EXCLUSIVELY in the ${targetLanguage} language. 
Use the native script of the requested language (e.g., Kannada script for Kannada). Absolutely do not use English letters (Latin script) to write in local Indian languages.
`;

    let retries = 3;
    let delay = 2000;

    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        if (text) return text;
        throw new Error("Empty response from AI model");
      } catch (error: any) {
        retries--;
        if (retries > 0) {
          console.warn(`[Gemini Retry] Attempt failed (${error.message || error}). Retrying in ${delay}ms... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5;
        } else {
          console.error("Gemini AI Error after 3 retries:", error);
          throw error;
        }
      }
    }
    
    throw new Error("Failed to generate response after 3 retries.");
  } catch (error) {
    console.error("Gemini Engine Initialization Error:", error);
    return "Sorry, I encountered an error while consulting the stars. Please check your API key or try again.";
  }
}

export async function askGeminiBatch(
  prompt: string,
  apiKey: string,
  mockResponseKeys: string[] = []
): Promise<any> {
  const activeKey = (apiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (!activeKey) {
    // Mock Mode for testing without API key
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockJson: any = {};
    for (const key of mockResponseKeys) {
      mockJson[key] = `Mock prediction for ${key}. Please add an API key for real predictions.`;
    }
    return mockJson;
  }

  try {
    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

    let retries = 3;
    let delay = 3000;

    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let rawText = response.text().trim();
        
        // Robustly extract JSON block
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          rawText = jsonMatch[0];
        }

        return JSON.parse(rawText);
      } catch (error: any) {
        if (error.status === 429 && retries > 1) {
          console.warn(`Rate limited by Gemini API. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2;
        } else {
          console.error("Gemini Batch API Error:", error);
          throw new Error("Sorry, I encountered an error while consulting the stars. Please check your API key or try again.");
        }
      }
    }
    
    throw new Error("Sorry, I encountered an error while consulting the stars. Please try again later.");
  } catch (error) {
    console.error("Gemini Batch Engine Initialization Error:", error);
    throw new Error("Sorry, I encountered an error while consulting the stars. Please check your API key or try again.");
  }
}
