import os

content = """import { useState, useEffect } from "react";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";
import { useAppStore } from "../../stores/appStore";
import { translateText } from "../../utils/translator";
import { useTranslation } from "react-i18next";
import { askGeminiBatch } from "../../core/GeminiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { generateBaggonaPredictions, generatePersonalReading } from "../../core/BaggonaPredictionEngine";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";

export type TranslatedPrediction = {
  category: string;
  text: string;
  translatedText: string;
  translatedCategory: string; 
};

const DEEP_INSIGHT_CATEGORIES = [
  { id: "current_phase", label: "Current Phase (Age, Dasha & Gochara)" },
  { id: "next_six_months", label: "Next 6 Months Predictions (Dasha, Bhukti & Gochara)" },
  { id: "lifespan", label: "Lifespan & Health" },
  { id: "marriage", label: "Marriage & Relationships" },
  { id: "children", label: "Children & Progeny" },
  { id: "job", label: "Career & Profession" },
  { id: "family", label: "Family & Wealth" },
];

export function usePredictionEngine() {
  const session = useKundliViewerStore((state) => state.session);
  const language = useAppStore((state) => state.language);
  const geminiApiKey = useAppStore((state) => state.geminiApiKey);
  
  const [predictions, setPredictions] = useState<TranslatedPrediction[]>([]);
  const [currentMindset, setCurrentMindset] = useState<TranslatedPrediction | null>(null);
  
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(t("ramanbhavishya.loadingInitial", "Translating cosmic energies into guidance..."));
  const [ashirvada, setAshirvada] = useState<string>("");

  useEffect(() => {
    async function loadPredictions() {
      if (!session) return;
      setIsLoading(true);

      try {
        const now = new Date();
        const ageYears = ageDecimalYearsAt(
          session.input.birthDate,
          session.input.birthTime,
          session.input.latitude,
          session.input.longitude,
          now
        );
        const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);

        const dashaStr = currentBhuktiData ? currentBhuktiData.maha.planet : "Unknown";
        const bhuktiStr = currentBhuktiData ? currentBhuktiData.bhukti : "Unknown";
        const ageInt = Math.floor(ageYears);
        const genderStr = session.input.gender || "Unknown";

        const traditionalData = calculateTraditionalBaggona(
          session.input.birthDate,
          session.input.birthTime,
          session.input.latitude,
          session.input.longitude,
          "Lahiri"
        );
        
        const baggonaPreds = generateBaggonaPredictions(traditionalData, language);
        const personalPreds = generatePersonalReading(session.result, ageInt, dashaStr, bhuktiStr);

        const contextStr = JSON.stringify({
          lagna: session.result.lagnaRashi?.english || "Unknown",
          moonSign: session.result.moonSign?.english || "Unknown",
          nakshatra: session.result.planets?.find(p => p.name === "Moon")?.nakshatra?.english || "Unknown",
          planets: (session.result.planets || []).map(p => `${p.name} in ${p.rashi?.english} (${p.house} house)`),
          currentAge: ageInt,
          gender: genderStr,
          runningDasha: dashaStr,
          runningBhukti: bhuktiStr,
          traditionalPredictions: baggonaPreds,
          personalReadings: personalPreds
        });

        const translated: TranslatedPrediction[] = [];
        
        setLoadingText(t("ramanbhavishya.loadingDeep", "Consulting the stars and analyzing all life stages in one go..."));

        const languageNames: Record<string, string> = {
          "en": "English",
          "hi": "Hindi",
          "kn": "Kannada",
          "te": "Telugu",
          "ta": "Tamil",
          "ml": "Malayalam"
        };
        const targetLanguage = languageNames[language.split('-')[0]] || "English";
        
        const prompt = `Role & Expertise:
You are an expert astrologer and intuitive psychologist specializing in deep, transformative readings. Your task is to provide an insightful astrological forecast.
Do not use markdown formatting like asterisks or hashtags since your response might be read aloud via text-to-speech.

Here is the user's astrological data computed by our engine, which MUST form the exclusive basis of your predictions:
${contextStr}

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
- CRITICAL LANGUAGE RULE: NEVER mix English letters, Latin characters, acronyms, or Latin numbers into the output. The response values MUST be 100% in the native script of the ${targetLanguage} language. Ensure grammar is flawless and sentences are fully complete without fragmented words or hanging characters.
- For "current_phase", emphasize what is happening right now based on the user's current Age (${ageInt}), their running Dasha (${dashaStr}), Bhukti (${bhuktiStr}), and the current life chapters provided in the personalReadings.
- For "next_six_months", forecast the major events over the next 6 months based on the monthly summaries provided in the engine data.
- For other categories (lifespan, marriage, children, job, family), extract the relevant information from the provided traditionalPredictions and personalReadings.
- For "ashirvada", generate a unique, emotionally resonant Ashirvada (blessing) in the selected language. Write it from the persona of a highly experienced astrologer with 30+ years of experience, offering deep blessings based on their Kundali and current Dasha/Dosha.

Respond EXCLUSIVELY in the ${targetLanguage} language for the values (the keys must remain exactly as specified in English).

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

        const mindsetPrompt = `Role & Expertise:
You are an expert astrologer and intuitive psychologist. 

Based on this user's astrological data:
${contextStr}

Your task is to predict the user's CURRENT MINDSET and immediate life circumstances with shocking accuracy based on their age (${ageInt}), gender (${genderStr}), running Dasha (${dashaStr}), and running Bhukti (${bhuktiStr}).
Write exactly 4 paragraphs:
- Paragraph 1: Precise current situation, what is happening with them today (e.g., buying a new thing, home situation, daily events, professional circumstances).
- Paragraph 2: Core emotions right now (happy, sad, anxious, neutral, specific emotional states).
- Paragraph 3: The underlying psychological reality (subconscious thoughts, hidden fears, unspoken desires).
- Paragraph 4: Actionable advice on what they need to do to come out of this or handle this based on astrological remedies and mindset shifts.

Rules:
- MUST be based strictly on the provided engine data (Dasha, Bhukti, age, scores). Do not invent things from the internet. Use your intelligence to combine the rules and scores to find the accurate prediction.
- It needs to come with beautiful, impressive details. The user should be shocked by the accuracy.
- CRITICAL LANGUAGE RULE: NEVER mix English letters, Latin characters, acronyms, or Latin numbers into the output. The response values MUST be 100% in the native script of the ${targetLanguage} language. Ensure grammar is flawless and sentences are fully complete without fragmented words or hanging characters.

Respond EXCLUSIVELY in the ${targetLanguage} language.
Return ONLY a valid JSON string (no markdown, no backticks, no \`\`\`json) with a single key "mindset" mapping to the 4-paragraph text:
{
  "mindset": "..."
}`;
        
        const mockKeys = [...DEEP_INSIGHT_CATEGORIES.map(c => c.id), "ashirvada"];

        const [jsonResponse, mindsetResponse] = await Promise.all([
          askGeminiBatch(prompt, geminiApiKey, mockKeys),
          askGeminiBatch(mindsetPrompt, geminiApiKey, ["mindset"])
        ]);

        setAshirvada(jsonResponse["ashirvada"] || "");

        const translatedMindsetCategory = await translateText("Current State of Mind & Life (Present Moment)", language, "en");
        setCurrentMindset({
          category: "Current State of Mind & Life (Present Moment)",
          text: mindsetResponse["mindset"] || "No prediction available.",
          translatedCategory: translatedMindsetCategory,
          translatedText: mindsetResponse["mindset"] || "No prediction available."
        });

        for (const cat of DEEP_INSIGHT_CATEGORIES) {
          const translatedCategory = await translateText(cat.label, language, "en");
          let rawText = jsonResponse[cat.id] || "No prediction available for this category.";
          
          translated.push({
            category: cat.label,
            text: rawText,
            translatedCategory,
            translatedText: rawText
          });
        }

        setPredictions(translated);
      } catch (e) {
        console.error("Error generating predictions:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadPredictions();
  }, [session, language, geminiApiKey]);

  return { predictions, currentMindset, isLoading, loadingText, ashirvada };
}
"""

with open("src/components/RamanBhavishya/usePredictionEngine.ts", "w") as f:
    f.write(content)

