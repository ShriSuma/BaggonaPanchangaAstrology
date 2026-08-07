import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envLocal = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const activeKey = envLocal.split('\n').find(l => l.startsWith('VITE_GEMINI_API_KEY=')).split('=')[1];

async function run() {
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

  const prompt = `Role & Expertise:
You are an expert astrologer and intuitive psychologist specializing in deep, transformative readings. Your task is to provide an insightful astrological forecast.
Do not use markdown formatting like asterisks or hashtags since your response might be read aloud via text-to-speech.

Here is the user's astrological data computed by our engine, which MUST form the exclusive basis of your predictions:
{"lagna":"Aries","moonSign":"Taurus","nakshatra":"Rohini","planets":[],"currentAge":30,"gender":"male","runningDasha":"Venus","runningBhukti":"Sun","traditionalPredictions":[],"personalReadings":[]}

Your task is to take the raw predictions from our engine (traditionalPredictions and personalReadings) and ORGANIZE, PARAPHRASE, and EXPAND them.
DO NOT INVENT your own astrological logic. You must STRICTLY base all your predictions on the provided engine data.

Structural Guidelines:
For EACH category, you must strictly follow a 2-paragraph format:

• Paragraph 1 (Astrological Events & Predictions): 
Detail the primary astrological transits, planetary movements, aspects, and concrete external events or real-world manifestations predicted for this area based on the engine data. Keep the tone grounded, specific, and predictive.

• Paragraph 2 (Emotional & Psychological Landscape): 
Explore the internal impact of these events with visceral, evocative language. Describe the person's precise mental state, emotional evolution, underlying fears, subconscious realizations, and inner feelings. Focus on deep emotional resonance and psychological truth.

Tone & Style Rules:
- Please use normal, simple, and easily readable words. Do not use highly complex or archaic literary words. The emotional resonance should come from the meaning, not from difficult vocabulary. Make it sound beautiful yet accessible to everyone.
- Avoid generic horoscope fluff; use evocative, vivid, and highly descriptive imagery.
- Maintain an empathetic yet realistic tone.
- Ensure a seamless contrast between the external narrative (Paragraph 1) and the internal/emotional reality (Paragraph 2).
- If writing in Kannada, use traditional Brahmin Kannada dialect (Havyaka/Madhwa/Smartha) and strictly use Kannada script (ಕನ್ನಡ ಲಿಪಿ). Highlight both blessings and challenging aspects gently.
- CRITICAL LANGUAGE RULE: NEVER mix English letters, Latin characters, acronyms, or Latin numbers into the output. The response values MUST be 100% in the native script of the Kannada language. Ensure grammar is flawless and sentences are fully complete without fragmented words or hanging characters.
- For "current_phase", emphasize what is happening right now based on the user's current Age (30), their running Dasha (Venus), Bhukti (Sun), and the current life chapters provided in the personalReadings.
- For "next_six_months", forecast the major events over the next 6 months based on the monthly summaries provided in the engine data.
- For other categories (lifespan, marriage, children, job, family), extract the relevant information from the provided traditionalPredictions and personalReadings.
- For "ashirvada", generate a unique, emotionally resonant Ashirvada (blessing) in the selected language. Write it from the persona of a highly experienced astrologer with 30+ years of experience, offering deep blessings based on their Kundali and current Dasha/Dosha.

Respond EXCLUSIVELY in the Kannada language for the values (the keys must remain exactly as specified in English).

Return ONLY a valid JSON string (no markdown, no backticks, no \`\`\`json) with the exact following English keys mapping to the detailed text reading for each:
{
  "current_phase": "...",
  "next_six_months": "...",
  "lifespan": "...",
  "marriage": "...",
  "children": "...",
  "job": "...",
  "family": "...",
  "ashirvada": "..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text().trim();
    console.log("Raw text start:", rawText.substring(0, 100));
    console.log("Raw text end:", rawText.substring(rawText.length - 100));
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    }
    const parsed = JSON.parse(rawText);
    console.log("Parsed JSON keys:", Object.keys(parsed));
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
