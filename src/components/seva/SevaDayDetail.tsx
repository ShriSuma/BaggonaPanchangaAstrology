import type { RhythmDay } from "../../core/DailyRhythmEngine";
import {
  BAND_LABEL_L5,
  COLOUR_HEX,
  GRAHA_MANTRA_SANSKRIT,
  T,
  pick
} from "../../features/seva/sevaLocale";
import {
  BAND_STYLE,
  MARK,
  bandGuide,
  colourName,
  dayExplanation,
  directionName,
  formatLongDate,
  grahaName,
  nakshatraName,
  rashiName,
  tithiLabel,
  weekdayName
} from "../../features/seva/sevaPresentation";

type Props = {
  day: RhythmDay;
  lang: string;
};

const Fact = ({ label, value }: { label: string; value: string }): JSX.Element => (
  <div className="rounded-lg bg-white/70 px-3 py-2">
    <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-800/60">{label}</div>
    <div className="mt-0.5 text-sm font-medium text-amber-950">{value}</div>
  </div>
);

export default function SevaDayDetail({ day, lang }: Props): JSX.Element {
  const style = BAND_STYLE[day.band];

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/50 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-100 bg-white/60 px-4 py-3">
        <div>
          <div className="font-serif text-lg font-semibold text-amber-950">
            {formatLongDate(day, lang)}
          </div>
          <div className="text-xs text-amber-800/70">
            {weekdayName(day, lang)} · {tithiLabel(day, lang)}
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.chip}`}>
          {pick(BAND_LABEL_L5[day.band], lang)}
        </span>
      </div>

      <div className="space-y-4 p-4">
        {/* Energy bar */}
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${day.energyScore}%`,
                backgroundColor: style.printBorder
              }}
            />
          </div>
        </div>

        {/* Alerts */}
        {day.isChandrashtama && (
          <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
            {MARK.chandrashtama} {pick(T.chandrashtama!, lang)}
          </div>
        )}
        {day.isMoneyDay && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            {MARK.money} {pick(T.moneyDay!, lang)}
          </div>
        )}

        {/* Guidance */}
        <div>
          <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-amber-800/70">
            {pick(T.whatToDo!, lang)}
          </h4>
          <p className="text-sm leading-relaxed text-amber-950">{bandGuide(day, lang)}</p>
        </div>

        {/* Lucky trio */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-amber-200 bg-white/80 p-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-800/60">
              {pick(T.luckyNumber!, lang)}
            </div>
            <div className="mt-1 font-serif text-2xl font-bold text-amber-900">
              {day.luckyNumbers.join(" · ")}
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-white/80 p-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-800/60">
              {pick(T.luckyColour!, lang)}
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-1.5">
              <span
                className="inline-block h-4 w-4 rounded-full border border-amber-300 shadow-sm"
                style={{ backgroundColor: COLOUR_HEX[day.luckyColour] }}
              />
              <span className="text-xs font-medium text-amber-900">{colourName(day, lang)}</span>
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-white/80 p-3 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-800/60">
              {pick(T.luckyDirection!, lang)}
            </div>
            <div className="mt-1.5 text-xs font-medium text-amber-900">
              {directionName(day, lang)}
            </div>
          </div>
        </div>

        {/* Panchanga facts */}
        <div className="grid grid-cols-2 gap-2">
          <Fact label={pick(T.labelNakshatra!, lang)} value={nakshatraName(day.moonNakshatraIndex, lang)} />
          <Fact label={pick(T.labelMoonSign!, lang)} value={rashiName(day.moonRashiIndex, lang)} />
          <Fact label={pick(T.labelVara!, lang)} value={grahaName(day.dayLord, lang)} />
          {day.bhuktiLord && (
            <Fact label={pick(T.labelDasha!, lang)} value={grahaName(day.bhuktiLord, lang)} />
          )}
        </div>

        {/* Why */}
        <div>
          <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-amber-800/70">
            {pick(T.whyThisDay!, lang)}
          </h4>
          <ul className="space-y-1.5">
            {dayExplanation(day, lang).map((line, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-amber-950/90">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mantra — Sanskrit in every language */}
        <div className="rounded-xl border border-amber-300/70 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800/70">
            {pick(T.dailyMantra!, lang)}
          </div>
          <p
            className="mt-2 text-center text-base font-medium leading-relaxed text-amber-900"
            lang="sa"
          >
            {GRAHA_MANTRA_SANSKRIT[day.dayLord]}
          </p>
          <p className="mt-2 text-center text-[11px] text-amber-800/70">
            {pick(T.chantCount!, lang)}
          </p>
        </div>
      </div>
    </div>
  );
}
