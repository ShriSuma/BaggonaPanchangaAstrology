import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { KundliOutput } from "../../core/AstroTypes";
import { PlanetName } from "../../core/AstroTypes";
import {
  type DashaEntry,
  findBhuktiAtAge,
  generateBhuktisInMahadasha,
  generateDashaTimeline
} from "../../core/DashaBhuktiEngine";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { parseISO, addDays, format, differenceInDays } from "date-fns";

const planetBarColor: Record<PlanetName, string> = {
  [PlanetName.Sun]: "bg-amber-500",
  [PlanetName.Moon]: "bg-slate-400",
  [PlanetName.Mars]: "bg-red-600",
  [PlanetName.Mercury]: "bg-emerald-500",
  [PlanetName.Jupiter]: "bg-orange-400",
  [PlanetName.Venus]: "bg-pink-400",
  [PlanetName.Saturn]: "bg-indigo-700",
  [PlanetName.Rahu]: "bg-violet-600",
  [PlanetName.Ketu]: "bg-teal-600"
};

type BarProps = {
  kundli: KundliOutput;
  maxAge?: number;
};

export function LifetimeDashaBar({ kundli, maxAge = 120 }: BarProps): JSX.Element {
  const { t } = useTranslation();
  const timeline = useMemo(() => generateDashaTimeline(kundli, maxAge), [kundli, maxAge]);
  const span = Math.min(maxAge, timeline.at(-1)?.endAge ?? maxAge) || maxAge;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-indigo-950">{t("kundli.dashaLifetimeTitle")}</p>
      <p className="text-[11px] text-slate-600">{t("kundli.dashaLifetimeHint")}</p>
      <div className="flex h-10 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-inner">
        {timeline.map((e) => {
          const w = Math.max(0.35, ((e.endAge - e.startAge) / span) * 100);
          return (
            <div
              key={`${e.planet}-${e.startAge}`}
              title={`${t(`planets.${e.planet}`)} ${e.startAge.toFixed(2)}–${e.endAge.toFixed(2)} ${t("kundli.dashaYearsUnit")}`}
              className={`${planetBarColor[e.planet]} flex min-w-[2px] items-center justify-center border-r border-white/30 text-[9px] font-bold text-white last:border-r-0`}
              style={{ width: `${w}%` }}
            >
              {w > 5 ? t(`planets.${e.planet}`).charAt(0) : ""}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-700">
        {(Object.keys(planetBarColor) as PlanetName[]).map((p) => (
          <span key={p} className="inline-flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-sm ${planetBarColor[p]}`} />
            {t(`planets.${p}`)}
          </span>
        ))}
      </div>
    </div>
  );
}

type ExplorerProps = {
  session: KundliViewerSession;
  maxAge?: number;
};

const planetColors: Record<PlanetName, { bg: string; border: string; text: string }> = {
  [PlanetName.Sun]: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900" },
  [PlanetName.Moon]: { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-900" },
  [PlanetName.Mars]: { bg: "bg-red-50", border: "border-red-200", text: "text-red-900" },
  [PlanetName.Mercury]: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900" },
  [PlanetName.Jupiter]: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-900" },
  [PlanetName.Venus]: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-900" },
  [PlanetName.Saturn]: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-900" },
  [PlanetName.Rahu]: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-900" },
  [PlanetName.Ketu]: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-900" },
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

export function DashaBhuktiExplorer({ session, maxAge = 120 }: ExplorerProps): JSX.Element {
  const { t } = useTranslation();
  const timeline = useMemo(() => generateDashaTimeline(session.result, maxAge), [session, maxAge]);
  const birthDateStr = session.input.birthDate;

  // Calculate current age
  const today = new Date();
  const dob = parseISO(birthDateStr);
  const currentAgeInYears = differenceInDays(today, dob) / 365.2425;

  // Filter timeline: keep only Mahadashas that end after current age
  const futureTimeline = timeline.filter(maha => maha.endAge > currentAgeInYears);

  return (
    <div className="mt-8 space-y-8">
      {futureTimeline.map((maha) => {
        const bhuktis = generateBhuktisInMahadasha(maha.planet, maha.durationYears);
        const pColors = planetColors[maha.planet] || planetColors[PlanetName.Sun];
        
        // Filter bhuktis: keep only Bhuktis that end after current age
        let currentAge = maha.startAge;
        const futureBhuktis = bhuktis.map(bhukti => {
          const bStart = currentAge;
          const bEnd = currentAge + bhukti.years;
          currentAge = bEnd;
          return { ...bhukti, bStart, bEnd };
        }).filter(b => b.bEnd > currentAgeInYears);

        // If no future bhuktis (e.g. edge case), don't render this mahadasha
        if (futureBhuktis.length === 0) return null;

        return (
          <div 
            key={`${maha.planet}-${maha.startAge}`}
            className={`rounded-2xl border ${pColors.border} ${pColors.bg} shadow-sm overflow-hidden`}
          >
            {/* Mahadasha Header */}
            <div className={`p-4 sm:p-6 border-b ${pColors.border} bg-white/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
              <div>
                <h3 className={`text-2xl font-bold ${pColors.text} flex items-center gap-2`}>
                  <span className={`w-3 h-3 rounded-full ${planetBarColor[maha.planet]}`}></span>
                  {t(`planets.${maha.planet}`)} {t("kundli.dashaMaha", "Mahadasha")}
                </h3>
                <p className="text-sm font-medium text-slate-600 mt-1">
                  {t(`dashas.mahaTheme.${maha.planet}` as "dashas.mahaTheme.Ketu")}
                </p>
              </div>
              <div className="text-right shrink-0 bg-white/80 px-4 py-2 rounded-xl shadow-sm border border-white">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">Duration</p>
                <p className="text-sm font-bold text-slate-800">
                  {formatDateFromAge(birthDateStr, maha.startAge)} <br className="hidden sm:block" /> <span className="sm:hidden">-</span> to <span className="sm:hidden">-</span> <br className="hidden sm:block" /> {formatDateFromAge(birthDateStr, maha.endAge)}
                </p>
              </div>
            </div>

            {/* Bhukti Grid */}
            <div className="p-4 sm:p-6 bg-white/40">
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 opacity-70 ${pColors.text}`}>Bhukti (Sub-Periods)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {futureBhuktis.map((bhukti, i) => {
                  const { bStart, bEnd } = bhukti;

                  return (
                    <div 
                      key={`${bhukti.planet}-${i}`} 
                      className={`flex flex-col p-4 rounded-xl border border-white bg-white/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}
                    >
                      <div className={`absolute top-0 left-0 w-2 h-full ${planetBarColor[bhukti.planet]}`}></div>
                      <div className="pl-3">
                        <p className="font-black text-slate-800 text-lg flex items-center gap-2 mb-2 tracking-tight">
                          {t(`planets.${bhukti.planet}`)}
                        </p>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-slate-700 font-bold bg-slate-100/80 px-2 py-1 rounded w-max">
                            <span className="text-[10px] uppercase text-slate-400 mr-2 tracking-wider">Start</span>
                            {formatDateFromAge(birthDateStr, bStart)}
                          </p>
                          <p className="text-xs text-slate-700 font-bold bg-slate-100/80 px-2 py-1 rounded w-max">
                            <span className="text-[10px] uppercase text-slate-400 mr-2 tracking-wider">End</span>
                            {formatDateFromAge(birthDateStr, bEnd)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
