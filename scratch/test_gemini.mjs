import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envLocal = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const apiKey = envLocal.split('\n').find(l => l.startsWith('VITE_GEMINI_API_KEY=')).split('=')[1];

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    const result = await model.generateContent("Hello");
    console.log(await result.response.text());
  } catch (e) {
    console.error(e.message);
  }
}
run();
