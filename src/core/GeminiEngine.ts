import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { recordAiCallUsage } from "../features/ai/aiTelemetryService";

function inferFeatureFromContext(question: string, contextData: string): "prashna" | "bhavishya" | "diksuchi" | "purvaJanma" | "ayurSanjeevini" | "maranottara" | "other" {
  const combined = (question + " " + contextData).toLowerCase();
  if (combined.includes("prashna") || combined.includes("ಸಂಖ್ಯಾಶಾಸ್ತ್ರ") || combined.includes("ಪ್ರಶ್ನ") || combined.includes("question")) return "prashna";
  if (combined.includes("diksuchi") || combined.includes("ದಿಕ್ಸೂಚಿ")) return "diksuchi";
  if (combined.includes("purva") || combined.includes("ಪೂರ್ವ ಜನ್ಮ") || combined.includes("hindina")) return "purvaJanma";
  if (combined.includes("ayur") || combined.includes("ಆಯುರ್") || combined.includes("health")) return "ayurSanjeevini";
  if (combined.includes("maranottara") || combined.includes("ಮರಣೋತ್ತರ")) return "maranottara";
  if (combined.includes("bhavishya") || combined.includes("ಜಾತಕ") || combined.includes("kundli")) return "bhavishya";
  return "other";
}

export type AskGeminiChatTurn = {
  role?: "user" | "model" | "assistant" | "pet";
  sender?: "user" | "model" | "assistant" | "pet";
  text: string;
};

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
  /** Custom retry count (defaults to 3) */
  retries?: number;
  /** Custom retry initial delay in ms (defaults to 2000) */
  retryDelay?: number;
  /** Multi-turn conversation history for seamless continuity across text and voice modes */
  conversationHistory?: AskGeminiChatTurn[];
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

    let retries = options.retries !== undefined ? options.retries : 3;
    let delay = options.retryDelay !== undefined ? options.retryDelay : 2000;

    while (retries > 0) {
      try {
        let result;
        if (options.conversationHistory && options.conversationHistory.length > 0) {
          const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
          let lastRole = "";
          for (const turn of options.conversationHistory) {
            const tText = turn.text?.trim();
            if (!tText) continue;
            const r: "user" | "model" =
              turn.role === "assistant" ||
              turn.role === "model" ||
              turn.role === "pet" ||
              turn.sender === "pet" ||
              turn.sender === "assistant" ||
              turn.sender === "model"
                ? "model"
                : "user";
            if (r === lastRole && contents.length > 0) {
              contents[contents.length - 1].parts[0].text += `\n${tText}`;
            } else {
              contents.push({ role: r, parts: [{ text: tText }] });
              lastRole = r;
            }
          }
          if (contents.length > 0 && contents[contents.length - 1].role === "user") {
            contents[contents.length - 1].parts[0].text += `\n\n${prompt}`;
          } else {
            contents.push({ role: "user", parts: [{ text: prompt }] });
          }
          result = await model.generateContent({ contents });
        } else {
          result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text().trim();
        if (text) {
          void recordAiCallUsage({
            feature: inferFeatureFromContext(question, contextData),
            model: "gemini-3.5-flash-lite"
          });
          return text;
        }
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
    throw error;
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
        
        void recordAiCallUsage({
          feature: "bhavishya",
          model: "gemini-3.5-flash-lite"
        });

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
