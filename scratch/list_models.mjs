import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envLocal = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const activeKey = envLocal.split('\n').find(l => l.startsWith('VITE_GEMINI_API_KEY=')).split('=')[1];

async function run() {
  const genAI = new GoogleGenerativeAI(activeKey);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name).join('\n'));
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
