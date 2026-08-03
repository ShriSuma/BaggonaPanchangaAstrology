import { useState, useEffect } from "react";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";
import { useAppStore } from "../../stores/appStore";
import { translateText } from "../../utils/translator";
import { askGemini } from "../../core/GeminiEngine";

export type TranslatedPrediction = {
  category: string;
  text: string;
  translatedText: string;
  translatedCategory: string; 
};

const DEEP_INSIGHT_CATEGORIES = [
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Translating cosmic energies into guidance...");

  useEffect(() => {
    async function loadPredictions() {
      if (!session) return;
      setIsLoading(true);

      try {
        const contextStr = JSON.stringify({
          lagna: session.result.lagnaRashi?.english || "Unknown",
          moonSign: session.result.moonSign?.english || "Unknown",
          nakshatra: session.result.planets?.find(p => p.name === "Moon")?.nakshatra?.english || "Unknown",
          planets: (session.result.planets || []).map(p => `${p.name} in ${p.rashi?.english} (${p.house} house)`)
        });

        const translated: TranslatedPrediction[] = [];

        for (const cat of DEEP_INSIGHT_CATEGORIES) {
          const translatedCategory = await translateText(cat.label, language, "en");
          setLoadingText(`Consulting the stars for ${translatedCategory}...`);

          const prompt = `Give a highly detailed, deeply insightful, and comprehensive personalized Vedic astrology reading specifically for the domain of ${cat.label} based on the given chart. Since this is a premium reading, provide exact predictions, thorough analysis of the planetary combinations, and long, descriptive explanations. Write at least 3 to 4 substantial paragraphs. Maintain a very simple, easy-to-understand, conversational style without using confusing astrological jargon or big technical words. If you are writing in Kannada, use a traditional Brahmin Kannada dialect (Havyaka/Madhwa/Smartha style) and strictly write in Kannada script (ಕನ್ನಡ ಲಿಪಿ) - do NOT use English letters or Kanglish. Highlight both the blessings and challenging aspects gently but accurately.`;
          
          const rawText = await askGemini(prompt, contextStr, geminiApiKey, language);
          
          translated.push({
            category: cat.label,
            text: rawText,
            translatedCategory,
            translatedText: rawText // Already translated by Gemini
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

  return { predictions, isLoading, loadingText };
}
