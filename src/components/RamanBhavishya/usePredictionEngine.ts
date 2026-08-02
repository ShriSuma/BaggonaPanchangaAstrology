import { useState, useEffect } from "react";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";
import { useAppStore } from "../../stores/appStore";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { synthesizePredictions } from "../../core/PredictionSynthesizer";
import type { SynthesizedPrediction } from "../../core/PredictionSynthesizer";
import { PlanetName } from "../../core/AstroTypes";
import { translateText } from "../../utils/translator";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { calculateDynamicLifeStagePredictions } from "../../core/DynamicLifeStageEngine";

export type TranslatedPrediction = SynthesizedPrediction & { 
  translatedText: string;
  translatedCategory: string; 
};

export function usePredictionEngine() {
  const session = useKundliViewerStore((state) => state.session);
  const language = useAppStore((state) => state.language);
  const [predictions, setPredictions] = useState<TranslatedPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadPredictions() {
      if (!session) return;
      setIsLoading(true);

      try {
        const now = new Date();
        const ephemeris = siderealLongitudes(now, "lahiri", "true");

        const getRashiIndex = (degree: number) => Math.floor(degree / 30) % 12;

        const gocharaPositions = [
          { name: PlanetName.Saturn, rashiIndex: getRashiIndex(ephemeris.saturn) },
          { name: PlanetName.Jupiter, rashiIndex: getRashiIndex(ephemeris.jupiter) },
          { name: PlanetName.Rahu, rashiIndex: getRashiIndex(ephemeris.rahu) },
          { name: PlanetName.Ketu, rashiIndex: getRashiIndex(ephemeris.ketu) },
        ];

        // Find active Dasha and Bhukti based on exact age
        const ageYears = ageDecimalYearsAt(
          session.input.birthDate,
          session.input.birthTime,
          session.input.latitude,
          session.input.longitude,
          now
        );

        const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);

        // 1. Raman Engine Predictions
        const ramanPredictions = synthesizePredictions(session.result, currentBhuktiData, gocharaPositions);
        
        // 2. Baggona Engine Predictions
        const baggonaPredictions = calculateDynamicLifeStagePredictions(
          session.result, 
          currentBhuktiData || null, 
          ageYears, 
          session.input.gender || "Male"
        );

        // Combine both engines
        const rawPredictions = [...ramanPredictions, ...baggonaPredictions];

        const translated: TranslatedPrediction[] = await Promise.all(
          rawPredictions.map(async (pred) => {
            const sourceLang = pred.sourceLang || "en";
            // Translate the category (which is always in English in the code)
            const translatedCategory = await translateText(pred.category, language, "en");
            
            // Translate the text based on its native source language
            const translatedText = await translateText(pred.text, language, sourceLang);
            
            return { ...pred, translatedText, translatedCategory };
          })
        );

        setPredictions(translated);
      } catch (e) {
        console.error("Error generating predictions:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadPredictions();
  }, [session, language]);

  return { predictions, isLoading };
}
