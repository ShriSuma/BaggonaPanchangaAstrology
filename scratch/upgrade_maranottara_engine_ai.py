import re

filepath = "src/features/maranottara/maranottaraEngine.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add GoogleGenerativeAI imports
if "GoogleGenerativeAI" not in content:
    content = 'import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";\n' + content

# Add aiConsolationText to MaranottaraResult type
content = content.replace(
    "  doshaAnalysis: DoshaAnalysisResult;\n  generatedAt: string;",
    "  doshaAnalysis: DoshaAnalysisResult;\n  aiConsolationText?: string;\n  generatedAt: string;"
)

# Add async AI narrative generator function
ai_func_code = '''
/** Generate AI Spiritual Consolation & Vedic Guidance using Gemini 3.5 Flash Lite */
export async function generateMaranottaraAIConsolation(
  result: MaranottaraResult,
  lang: string = "kn",
  apiKey?: string
): Promise<string> {
  const langCode = (lang || "kn").slice(0, 2);

  const fallbackText: Record<string, string> = {
    kn: `ಓಂ ಶಾಂತಿಃ. ದಿವಂಗತ ${result.personName} ಅವರ ದಿವ್ಯಾತ್ಮಕ್ಕೆ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಿಂದ ಸದ್ಗತಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.\\n\\nಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸೂಚಿಸಲಾದ ${result.yearsCount} ವರ್ಷಗಳ ಮಾಸಿಕ ಶ್ರಾದ್ಧ ಹಾಗೂ ಪಿತೃ ತರ್ಪಣ ದಿನಾಂಕಗಳಲ್ಲಿ ಭಕ್ತಿಯಿಂದ ಎಳ್ಳು-ನೀರು ತರ್ಪಣ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಭೋಜನ ನೆರವೇರಿಸುವುದರಿಂದ ಪಿತೃ ದೇವತೆಗಳು ತೃಪ್ತರಾಗಿ ಕುಲಕ್ಕೆ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ಸಂತಾನ ಸಮೃದ್ಧಿಯನ್ನು ಕರುಣಿಸುತ್ತಾರೆ.`,
    en: `Om Shanti. May the departed soul of ${result.personName} attain eternal peace and Moksha at the feet of Sri Gokarna Mahabaleshwara.\\n\\nPerforming the calculated ${result.yearsCount}-year Masika Shraddha & Pitru Tarpana rituals with devotion brings deep ancestral blessings, family peace, and spiritual harmony.`,
    hi: `ॐ शांति। गोकर्ण महाबलेश्वर स्वामी के चरणों में दिवंगत ${result.personName} की आत्मा की शांति हेतु प्रार्थना।`,
    te: `ఓం శాంతి. శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి సన్నిధిలో ${result.personName} దివ్యాత్మకు సద్గతి కలుగుగాక.`,
    ta: `ஓம் சாந்தி. ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் பாதங்களில் ${result.personName} ஆத்மா சாந்தி அடையட்டும்.`
  };

  if (!apiKey) {
    return fallbackText[langCode] || fallbackText.en;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    const prompt = `
You are Sri Shreeram Pandit, Chief Priest of Gokarna Mahabaleshwara Kshetra.
Provide a sacred, comforting, authentic Vedic spiritual consolation and guidance message for the family of the deceased person:
- Deceased Name: ${result.personName}
- Demise Date: ${result.demiseDate} (Tithi: ${result.demiseTithi[langCode] || result.demiseTithi.kn})
- Demise Nakshatra: ${result.demiseNakshatra[langCode] || result.demiseNakshatra.kn}
- Scheduled Masika Duration: ${result.yearsCount} Year(s)

Guidelines:
1. Write with deep dignity, compassion, and authentic Vedic wisdom.
2. Explain the spiritual importance of performing monthly Masika Shraddha, Pinda Pradana, and Tila Tarpana for ancestral liberation (Pitru Rinam).
3. Write EXCLUSIVELY in the requested script: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
4. Do NOT use Latin/English script words mixed into native language.
`;

    const res = await model.generateContent(prompt);
    const text = (await res.response).text();
    return text || fallbackText[langCode] || fallbackText.en;
  } catch (err) {
    console.error("Gemini Maranottara AI error:", err);
    return fallbackText[langCode] || fallbackText.en;
  }
}
'''

content += ai_func_code

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Upgraded maranottaraEngine.ts with Gemini AI Spiritual Consolation narrative.")
