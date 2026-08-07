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
    model: "gemini-1.5-flash",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  const prompt = `Role & Expertise:
You are an expert astrologer and intuitive psychologist. 

Based on this user's astrological data:
{"lagna":"Aries","moonSign":"Taurus","nakshatra":"Rohini","planets":[],"currentAge":30,"gender":"male","runningDasha":"Venus","runningBhukti":"Sun","traditionalPredictions":[],"personalReadings":[]}

Your task is to predict the user's CURRENT MINDSET and immediate life circumstances with shocking accuracy based on their age (30), gender (male), running Dasha (Venus), and running Bhukti (Sun).
Write exactly 4 paragraphs:
- Paragraph 1: Precise current situation, what is happening with them today (e.g., buying a new thing, home situation, daily events, professional circumstances).
- Paragraph 2: Core emotions right now (happy, sad, anxious, neutral, specific emotional states).
- Paragraph 3: The underlying psychological reality (subconscious thoughts, hidden fears, unspoken desires).
- Paragraph 4: Actionable advice on what they need to do to come out of this or handle this based on astrological remedies and mindset shifts.

Rules:
- MUST be based strictly on the provided engine data (Dasha, Bhukti, age, scores). Do not invent things from the internet. Use your intelligence to combine the rules and scores to find the accurate prediction.
- It needs to come with beautiful, impressive details. The user should be shocked by the accuracy.
- CRITICAL LANGUAGE RULE: NEVER mix English letters, Latin characters, acronyms, or Latin numbers into the output. The response values MUST be 100% in the native script of the Kannada language. Ensure grammar is flawless and sentences are fully complete without fragmented words or hanging characters.

Respond EXCLUSIVELY in the Kannada language.
Return ONLY a valid JSON string (no markdown, no backticks, no \`\`\`json) with a single key "mindset" mapping to the 4-paragraph text:
{
  "mindset": "..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text().trim();
    console.log("Raw Response:", rawText);
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
