import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { PlanetName } from "../../core/AstroTypes";
import {
  generateBhuktisInMahadasha,
  generateDashaTimeline,
  evaluatePlanetQuality
} from "../../core/DashaBhuktiEngine";
import { parseISO, addDays, format, differenceInDays } from "date-fns";

type Props = {
  session: KundliViewerSession;
  maxAge?: number;
};

function formatDateFromAge(birthDateStr: string, ageInYears: number): string {
  try {
    const dob = parseISO(birthDateStr);
    const daysToAdd = Math.round(ageInYears * 365.2425);
    const targetDate = addDays(dob, daysToAdd);
    return format(targetDate, "dd MMM yyyy");
  } catch {
    return `${ageInYears.toFixed(2)} Yrs`;
  }
}

export function DashaVisualization({ session, maxAge = 120 }: Props): JSX.Element {
  const { t } = useTranslation();
  const timeline = generateDashaTimeline(session.result, maxAge);
  const birthDateStr = session.input.birthDate;
  
  // Calculate current age
  const today = new Date();
  const dob = parseISO(birthDateStr);
  const currentAgeInYears = differenceInDays(today, dob) / 365.2425;

  const futureTimeline = timeline.filter(maha => maha.endAge > currentAgeInYears);

  // We can track the active Mahadasha to show its Bhuktis
  const [activeMaha, setActiveMaha] = useState<PlanetName | null>(
    futureTimeline.length > 0 ? futureTimeline[0].planet : null
  );

  const getQualityColor = (quality: "good" | "bad" | "neutral") => {
    switch (quality) {
      case "good": return "bg-emerald-500 text-emerald-950 border-emerald-600";
      case "bad": return "bg-red-500 text-red-950 border-red-600";
      default: return "bg-slate-300 text-slate-800 border-slate-400"; // neutral
    }
  };

  const getQualityLabel = (quality: "good" | "bad" | "neutral") => {
    switch (quality) {
      case "good": return t("app.good", "Favorable");
      case "bad": return t("app.bad", "Challenging");
      default: return t("app.neutral", "Neutral");
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{t("kundli.dashaVisualTitle", "Interactive Timeline")}</h3>
        <p className="text-sm text-slate-500 mb-6">
          {t("kundli.dashaVisualHint", "Select a Mahadasha below to view its Bhuktis. Colors indicate astrological favorability.")}
        </p>

        {/* Legend */}
        <div className="flex gap-4 mb-8 text-xs font-bold uppercase tracking-wider text-slate-600">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600"></span> {t("app.good", "Favorable")}</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500 border border-red-600"></span> {t("app.bad", "Challenging")}</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-300 border border-slate-400"></span> {t("app.neutral", "Neutral")}</div>
        </div>

        {/* Mahadasha Graph / Blocks */}
        <div className="space-y-3 mb-8">
          {futureTimeline.map(maha => {
            const quality = evaluatePlanetQuality(maha.planet, session.result);
            const isActive = activeMaha === maha.planet;
            
            return (
              <div 
                key={maha.planet}
                onClick={() => setActiveMaha(isActive ? null : maha.planet)}
                className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${getQualityColor(quality)} ${isActive ? 'ring-4 ring-indigo-500/30 scale-[1.01]' : 'hover:opacity-90 opacity-80'}`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <span className="text-xl font-black">{t(`planets.${maha.planet}`)}</span>
                  <span className="text-xs bg-white/50 px-2 py-1 rounded font-bold">{getQualityLabel(quality)}</span>
                </div>
                <div className="text-right relative z-10">
                   <p className="font-mono text-sm font-bold opacity-80 bg-white/40 px-2 rounded">
                     {formatDateFromAge(birthDateStr, Math.max(maha.startAge, currentAgeInYears))} - {formatDateFromAge(birthDateStr, maha.endAge)}
                   </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expanded Bhuktis for selected Mahadasha */}
        {activeMaha && (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in">
            <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              {t(`planets.${activeMaha}`)} Bhuktis
            </h4>
            
            {/* Horizontal Segmented Bar for Bhuktis */}
            <div className="w-full flex h-14 rounded-xl overflow-hidden border-2 border-slate-300 shadow-inner mb-6">
              {(() => {
                const mahaInfo = futureTimeline.find(m => m.planet === activeMaha);
                if (!mahaInfo) return null;

                const bhuktis = generateBhuktisInMahadasha(mahaInfo.planet, mahaInfo.durationYears);
                let cAge = mahaInfo.startAge;
                
                const currentBhuktis = bhuktis.map(b => {
                  const bStart = cAge;
                  const bEnd = cAge + b.years;
                  cAge = bEnd;
                  return { ...b, bStart, bEnd };
                }).filter(b => b.bEnd > currentAgeInYears);

                const totalFutureDuration = currentBhuktis.reduce((sum, b) => sum + (b.bEnd - Math.max(b.bStart, currentAgeInYears)), 0);

                return currentBhuktis.map((bhukti, i) => {
                  const bQuality = evaluatePlanetQuality(bhukti.planet, session.result);
                  const effectiveStart = Math.max(bhukti.bStart, currentAgeInYears);
                  const duration = bhukti.bEnd - effectiveStart;
                  const widthPct = (duration / totalFutureDuration) * 100;

                  return (
                    <div 
                      key={bhukti.planet}
                      title={`${t(`planets.${bhukti.planet}`)}: ${formatDateFromAge(birthDateStr, effectiveStart)} - ${formatDateFromAge(birthDateStr, bhukti.bEnd)}`}
                      style={{ width: `${widthPct}%` }}
                      className={`h-full border-r border-white/50 last:border-r-0 flex items-center justify-center text-xs font-black transition-all hover:brightness-110 cursor-help ${getQualityColor(bQuality)}`}
                    >
                      {widthPct > 8 ? t(`planets.${bhukti.planet}`).substring(0, 3) : ''}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Detail Grid for Bhuktis */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(() => {
                const mahaInfo = futureTimeline.find(m => m.planet === activeMaha);
                if (!mahaInfo) return null;

                const bhuktis = generateBhuktisInMahadasha(mahaInfo.planet, mahaInfo.durationYears);
                let cAge = mahaInfo.startAge;
                
                return bhuktis.map(b => {
                  const bStart = cAge;
                  const bEnd = cAge + b.years;
                  cAge = bEnd;
                  return { ...b, bStart, bEnd };
                })
                .filter(b => b.bEnd > currentAgeInYears)
                .map((bhukti) => {
                  const bQuality = evaluatePlanetQuality(bhukti.planet, session.result);
                  const effectiveStart = Math.max(bhukti.bStart, currentAgeInYears);
                  
                  return (
                    <div key={bhukti.planet} className={`p-3 rounded-lg border-l-4 shadow-sm bg-white border-slate-200`} style={{ borderLeftColor: bQuality === 'good' ? '#10b981' : bQuality === 'bad' ? '#ef4444' : '#cbd5e1' }}>
                       <p className="font-bold text-slate-800 text-sm">{t(`planets.${bhukti.planet}`)}</p>
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 mb-1 font-bold">{getQualityLabel(bQuality)}</p>
                       <p className="text-[11px] font-mono text-slate-700 bg-slate-50 p-1 rounded">
                         {formatDateFromAge(birthDateStr, effectiveStart)} <br/> - {formatDateFromAge(birthDateStr, bhukti.bEnd)}
                       </p>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
