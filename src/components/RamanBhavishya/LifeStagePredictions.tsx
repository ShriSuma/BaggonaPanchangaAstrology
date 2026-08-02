import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { differenceInYears, parseISO } from "date-fns";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { useAppStore } from "../../stores/appStore";
import { translateText } from "../../utils/translator";
import { rashiIndexInHouse, signLord } from "../../core/KundliInsightsEngine";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";

type Props = {
  session: KundliViewerSession;
};

type StageInfo = {
  areaKey: string;
  houseNum: number;
  translatedTitle: string;
  translatedText: string;
  icon: string;
};

export default function LifeStagePredictions({ session }: Props): JSX.Element {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);

  const [isLoading, setIsLoading] = useState(true);
  const [stageInfos, setStageInfos] = useState<StageInfo[]>([]);

  const { age, stageTitle, focusAreas } = useMemo(() => {
    let currentAge = 0;
    try {
      const birthDate = parseISO(session.birthDateYmd);
      currentAge = differenceInYears(new Date(), birthDate);
    } catch {
      currentAge = 25; // fallback
    }

    let stageTitle = "";
    let focusAreas: { key: string; name: string; house: number; icon: string }[] = [];

    if (currentAge < 20) {
      stageTitle = "Formative Years (Age < 20)";
      focusAreas = [{ key: "education", name: "Education and Intellect", house: 5, icon: "🎓" }];
    } else if (currentAge >= 20 && currentAge < 40) {
      stageTitle = "Partnership and Growth (Age 20 - 40)";
      focusAreas = [
        { key: "marriage", name: "Marriage and Relationships", house: 7, icon: "💍" },
        { key: "children", name: "Children and Family", house: 5, icon: "👶" }
      ];
    } else if (currentAge >= 40 && currentAge < 60) {
      stageTitle = "Stability and Career (Age 40 - 60)";
      focusAreas = [
        { key: "career", name: "Career and Profession", house: 10, icon: "🏢" },
        { key: "health", name: "Health and Mind", house: 6, icon: "🧘" }
      ];
    } else {
      stageTitle = "Legacy and Reflection (Age > 60)";
      focusAreas = [
        { key: "longevity", name: "Longevity and Life", house: 8, icon: "🌅" },
        { key: "spirituality", name: "Spirituality and Peace", house: 12, icon: "🕉️" }
      ];
    }

    return { age: currentAge, stageTitle, focusAreas };
  }, [session.birthDateYmd]);

  useEffect(() => {
    async function evaluateAndTranslate() {
      setIsLoading(true);

      const lagnaIdx = session.result.lagnaRashi.index;
      const now = new Date();
      const ageYears = ageDecimalYearsAt(
        session.input.birthDate, session.input.birthTime, session.input.latitude, session.input.longitude, now
      );
      const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);

      const infos: StageInfo[] = [];

      for (const area of focusAreas) {
        const signIdx = rashiIndexInHouse(lagnaIdx, area.house);
        const lord = signLord(signIdx);
        const lordPlanet = session.result.planets.find(p => p.name === lord);
        
        // Use extremely simple, direct English so the translation to Kannada is flawless without weird idioms.
        let good = "";
        let bad = "";

        if (lordPlanet) {
          if ([1, 4, 7, 10, 5, 9, 2, 11].includes(lordPlanet.house)) {
            good = `The planets are offering strong support and blessings for your ${area.name}. This brings natural growth and happiness in this area of your life.`;
            bad = `However, good luck still needs your hard work. You must continue to put in effort to see the best results.`;
          } else if ([6, 8, 12].includes(lordPlanet.house)) {
            good = `The planets indicate that your ${area.name} requires patience and deep inner strength right now. You have the power to overcome these obstacles.`;
            bad = `There may be some delays or challenges. Do not lose hope, as these difficulties are meant to make you stronger and wiser.`;
          } else {
            good = `Your ${area.name} is stable and peaceful right now. You have the quiet strength to maintain balance in this area.`;
            bad = `There might be minor changes, but you can easily handle them with a calm mind.`;
          }
        }

        let feeling = "";
        if (currentBhuktiData) {
          if (currentBhuktiData.maha.planet === lord || currentBhuktiData.bhukti === lord) {
            feeling = `Because you are currently in the Dasha period of this planet, this area of your life is very active and important right now.`;
          } else {
            feeling = `While your main focus is on other things right now, this area remains stable and peaceful in the background.`;
          }
        }

        const fullText = `${good}\n\n${bad}\n\n${feeling}`;
        const translatedTitle = await translateText(area.name, language);
        const translatedText = await translateText(fullText, language);

        infos.push({
          areaKey: area.key,
          houseNum: area.house,
          translatedTitle,
          translatedText,
          icon: area.icon
        });
      }

      setStageInfos(infos);
      setIsLoading(false);
    }

    evaluateAndTranslate();
  }, [focusAreas, language, session]);

  const [translatedStageTitle, setTranslatedStageTitle] = useState("");
  useEffect(() => {
    translateText(stageTitle, language).then(setTranslatedStageTitle);
  }, [stageTitle, language]);

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      {/* Golden & White Theme Header */}
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-8 shadow-[0_10px_40px_rgba(251,191,36,0.15)] relative overflow-hidden flex items-center justify-between">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-serif font-bold text-amber-800 mb-2 flex items-center gap-3">
            <span className="text-4xl animate-bounce">⏳</span> 
            {translatedStageTitle || stageTitle}
          </h2>
          <p className="text-lg text-amber-700/80 font-medium ml-12">
            {t("ramanbhavishya.calculatedAge", "Calculated Age")}: {age} {t("common.years", "years")}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center p-16 space-y-4">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin shadow-lg"></div>
          <p className="text-amber-700 font-medium animate-pulse">Translating cosmic insights...</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2">
          {stageInfos.map((info) => (
            <div key={info.areaKey} className="rounded-3xl border border-amber-100 bg-white p-8 shadow-xl relative overflow-hidden group hover:border-amber-300 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all duration-500 pointer-events-none"></div>
              
              <h3 className="mb-6 text-2xl font-serif font-bold text-amber-900 border-b-2 border-amber-100 pb-4 relative z-10 flex items-center gap-4">
                <span className="text-4xl bg-amber-50 p-3 rounded-2xl shadow-sm border border-amber-100 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {info.icon}
                </span>
                {info.translatedTitle}
              </h3>
              
              <p className="text-slate-700 leading-relaxed text-[16px] whitespace-pre-wrap relative z-10 font-medium">
                {info.translatedText}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
