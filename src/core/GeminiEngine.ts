import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export async function askGemini(
  question: string,
  contextData: string,
  apiKey: string,
  language: string
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
      model: "gemini-flash-latest",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

    const prompt = `
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
    let delay = 3000;

    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
      } catch (error: any) {
        if (error.status === 429 && retries > 1) {
          console.warn(`Rate limited by Gemini API. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2;
        } else {
          console.error("Gemini AI Error:", error);
          return "Sorry, I encountered an error while consulting the stars. Please check your API key or try again.";
        }
      }
    }
    
    return "Sorry, I encountered an error while consulting the stars. Please try again later.";
  } catch (error) {
    console.error("Gemini Engine Initialization Error:", error);
    return "Sorry, I encountered an error while consulting the stars. Please check your API key or try again.";
  }
}
