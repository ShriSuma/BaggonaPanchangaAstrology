import { useState } from "react";
import type { SevaRecommendation } from "../../core/GokarnaSevaEngine";
import { T, pick } from "../../features/seva/sevaLocale";

type Props = {
  recommendations: SevaRecommendation[];
  lang: string;
};

const DetailRow = ({ label, value }: { label: string; value: string }): JSX.Element => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
    <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-amber-800/60 sm:w-24 sm:pt-0.5">
      {label}
    </span>
    <span className="text-sm text-amber-950/90">{value}</span>
  </div>
);

const SevaCard = ({
  rec,
  lang,
  primary
}: {
  rec: SevaRecommendation;
  lang: string;
  primary: boolean;
}): JSX.Element => {
  const [open, setOpen] = useState(primary);
  const seva = rec.seva;

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition ${
        primary
          ? "border-amber-400 bg-gradient-to-br from-amber-50 via-white to-orange-50/60 shadow-md"
          : "border-amber-200 bg-white/70"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${
            primary ? "bg-amber-700 text-amber-50" : "bg-amber-100 text-amber-800"
          }`}
          aria-hidden
        >
          {seva.icon}
        </span>

        <span className="min-w-0 flex-1">
          {primary && (
            <span className="mb-1 inline-block rounded-full bg-amber-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-50">
              {pick(T.sevaPrimary!, lang)}
            </span>
          )}
          <span className="block font-serif text-lg font-semibold leading-tight text-amber-950">
            {pick(seva.name, lang)}
          </span>
          <span className="mt-1 block text-sm leading-snug text-amber-900/75">
            {pick(seva.purpose, lang)}
          </span>
        </span>

        <span
          className={`mt-1 shrink-0 text-amber-700 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ⌄
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-amber-200/70 bg-white/50 px-4 py-4">
          {rec.reasons.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-800/70">
                {pick(T.sevaWhy!, lang)}
              </h4>
              <ul className="space-y-1.5">
                {rec.reasons.map((reason, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-amber-950/90">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                    <span>{pick(reason, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <DetailRow label={pick(T.sevaBenefit!, lang)} value={pick(seva.benefit, lang)} />
            <DetailRow label={pick(T.sevaWhere!, lang)} value={pick(seva.where, lang)} />
            <DetailRow label={pick(T.sevaWhen!, lang)} value={pick(seva.when, lang)} />
            <DetailRow label={pick(T.sevaDuration!, lang)} value={pick(seva.duration, lang)} />
          </div>

          <div className="rounded-xl border border-amber-300/60 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800/70">
              {pick(T.shlokaLabel!, lang)}
            </div>
            <p
              className="mt-2 whitespace-pre-line text-center font-medium leading-relaxed text-amber-900"
              lang="sa"
            >
              {seva.shloka.sanskrit}
            </p>
            <div className="mt-3 border-t border-amber-200/70 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800/60">
                {pick(T.shlokaMeaning!, lang)}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-amber-900/85">
                {pick(seva.shloka.meaning, lang)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SevaRecommendations({ recommendations, lang }: Props): JSX.Element {
  const [primary, ...rest] = recommendations;
  const others = rest.slice(0, 4);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-xl font-semibold text-amber-950">
          {pick(T.sevaHeading!, lang)}
        </h3>
      </div>

      {primary && <SevaCard rec={primary} lang={lang} primary />}

      {others.length > 0 && (
        <>
          <h4 className="pt-2 text-xs font-bold uppercase tracking-widest text-amber-800/60">
            {pick(T.sevaAlso!, lang)}
          </h4>
          <div className="space-y-3">
            {others.map((rec) => (
              <SevaCard key={rec.seva.id} rec={rec} lang={lang} primary={false} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
