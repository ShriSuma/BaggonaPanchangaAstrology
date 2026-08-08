import { useMemo, useState } from "react";
import type { RhythmDay, RhythmResult } from "../../core/DailyRhythmEngine";
import {
  BAND_LABEL_L5,
  T,
  WEEKDAY_SHORT_L5,
  pick,
  type EnergyBand
} from "../../features/seva/sevaLocale";
import {
  BAND_STYLE,
  MARK,
  formatMonthTitle,
  todayYmd
} from "../../features/seva/sevaPresentation";

type Props = {
  rhythm: RhythmResult;
  lang: string;
  selectedYmd: string;
  onSelect: (ymd: string) => void;
};

const Legend = ({ lang }: { lang: string }): JSX.Element => {
  const bands: EnergyBand[] = ["high", "steady", "rest"];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-amber-900/80">
      {bands.map((band) => (
        <span key={band} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm border"
            style={{
              backgroundColor: BAND_STYLE[band].printBg,
              borderColor: BAND_STYLE[band].printBorder
            }}
          />
          {pick(BAND_LABEL_L5[band], lang)}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="text-emerald-700">{MARK.money}</span>
        {pick(T.moneyDayShort!, lang)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="text-amber-700">{MARK.pooja}</span>
        {pick(T.poojaDayShort!, lang)}
      </span>
    </div>
  );
};

export default function SevaCalendar({ rhythm, lang, selectedYmd, onSelect }: Props): JSX.Element {
  const [monthCursor, setMonthCursor] = useState(0);
  const months = rhythm.months;
  const month = months[Math.min(monthCursor, months.length - 1)]!;
  const today = useMemo(() => todayYmd(), []);

  const byDayOfMonth = useMemo(() => {
    const map = new Map<number, RhythmDay>();
    for (const d of month.days) map.set(d.dayOfMonth, d);
    return map;
  }, [month]);

  const daysInMonth = new Date(Date.UTC(month.year, month.monthIndex + 1, 0)).getUTCDate();
  const cells = Array.from({ length: month.leadingBlanks + daysInMonth }, (_, i) =>
    i < month.leadingBlanks ? null : i - month.leadingBlanks + 1
  );

  return (
    <div>
      {/* Month strip */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMonthCursor((c) => Math.max(0, c - 1))}
          disabled={monthCursor === 0}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-800 transition disabled:opacity-30"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-1.5">
            {months.map((m, i) => (
              <button
                key={`${m.year}-${m.monthIndex}`}
                type="button"
                onClick={() => setMonthCursor(i)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  i === monthCursor
                    ? "bg-amber-700 text-amber-50 shadow"
                    : "bg-white/70 text-amber-900 hover:bg-amber-100"
                }`}
              >
                {formatMonthTitle(m.monthIndex, m.year, lang)}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMonthCursor((c) => Math.min(months.length - 1, c + 1))}
          disabled={monthCursor >= months.length - 1}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-800 transition disabled:opacity-30"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-amber-50/60 to-white p-3 shadow-inner">
        <div className="grid grid-cols-7 gap-1 pb-2">
          {WEEKDAY_SHORT_L5.map((w, i) => (
            <div
              key={i}
              className="truncate px-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-amber-800/70"
            >
              {pick(w, lang)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((dayNum, i) => {
            if (dayNum === null) return <div key={`b${i}`} />;

            const day = byDayOfMonth.get(dayNum);
            if (!day) {
              // Day falls outside the six-month window (start or tail month).
              return (
                <div
                  key={`o${dayNum}`}
                  className="flex aspect-square items-start justify-end rounded-lg border border-dashed border-slate-200 p-1 text-[11px] text-slate-300"
                >
                  {dayNum}
                </div>
              );
            }

            const style = BAND_STYLE[day.band];
            const isSelected = day.ymd === selectedYmd;
            const isToday = day.ymd === today;

            return (
              <button
                key={day.ymd}
                type="button"
                onClick={() => onSelect(day.ymd)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border p-0.5 transition ${style.cell} ${
                  isSelected ? "ring-2 ring-amber-600 ring-offset-1" : ""
                } ${isToday ? "font-extrabold" : ""}`}
              >
                <span className="text-[13px] leading-none sm:text-sm">{dayNum}</span>

                <span className="mt-0.5 flex h-2 items-center gap-[2px] text-[8px] leading-none">
                  {day.isMoneyDay && <span className="text-emerald-700">{MARK.money}</span>}
                  {day.isJanmaNakshatraDay ? (
                    <span className="text-rose-600">{MARK.janmaStar}</span>
                  ) : (
                    day.isPoojaDay && <span className="text-amber-700">{MARK.pooja}</span>
                  )}
                </span>

                {isToday && (
                  <span className="absolute inset-x-1 bottom-0.5 h-[2px] rounded-full bg-amber-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Legend lang={lang} />

      {/* Month counters */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-center">
          <div className="text-2xl font-bold text-emerald-800">{month.highCount}</div>
          <div className="mt-0.5 text-[10px] font-medium leading-tight text-emerald-900/80">
            {pick(T.countHigh!, lang)}
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-center">
          <div className="text-2xl font-bold text-amber-800">{month.moneyCount}</div>
          <div className="mt-0.5 text-[10px] font-medium leading-tight text-amber-900/80">
            {pick(T.countMoney!, lang)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
          <div className="text-2xl font-bold text-slate-700">{month.restCount}</div>
          <div className="mt-0.5 text-[10px] font-medium leading-tight text-slate-600">
            {pick(T.countRest!, lang)}
          </div>
        </div>
      </div>
    </div>
  );
}
