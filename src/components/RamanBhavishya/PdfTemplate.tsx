import React, { forwardRef } from 'react';
import type { TranslatedPrediction } from './usePredictionEngine';
import type { KundliViewerSession } from '../../stores/kundliViewerStore';

export type PdfTranslations = {
  title: string;
  subtitle: string;
  nameLabel: string;
  nameValue: string;
  dobLabel: string;
  dobValue: string;
  lagnaLabel: string;
  moonLabel: string;
  nakshatraLabel: string;
  eraLabel: string;
  dashaLabel: string;
  bhuktiLabel: string;
  lagnaValue: string;
  moonValue: string;
  nakshatraValue: string;
  dashaPlanetValue: string;
  bhuktiPlanetValue: string;
  characteristicsTitle: string;
  darkSecretTitle: string;
  ashirvadaTitle: string;
  ashirvadaValue: string;
  yogasTitle: string;
  doshasTitle: string;
  remedyTitle: string;
  timelineTitle: string;
  gocharaTitle: string;
  summaryTitle: string;
  footer: string;
};

export type PremiumData = {
  characteristics?: { impact: string }[];
  darkSecret?: { impact: string }[];
  yogas: { name: string; impact: string }[];
  doshas: { name: string; impact: string; remedy?: string }[];
  timeline?: { dateRange: string; impact: string }[];
  gochara?: { name: string; impact: string; remedy?: string }[];
  summary?: { impact: string }[];
};

interface Props {
  theme: "sunrise";
  session: KundliViewerSession | null;
  predictions: TranslatedPrediction[];
  translations: PdfTranslations;
  deepInsights?: Record<string, string>;
  premiumData?: PremiumData;
}

export const PdfTemplate = forwardRef<HTMLDivElement, Props>(({ session, predictions, translations, deepInsights, premiumData }, ref) => {
  if (!session) return null;

  const groupedPredictions = predictions.reduce((acc, pred) => {
    if (!acc[pred.translatedCategory]) {
      acc[pred.translatedCategory] = [];
    }
    acc[pred.translatedCategory].push(pred);
    return acc;
  }, {} as Record<string, TranslatedPrediction[]>);

  // Old Time Patrika Style Config
  const solidBgClass = "bg-orange-50"; 
  const textColorClass = "text-amber-950"; 
  const borderColorClass = "border-amber-700/40"; 
  const primaryColorClass = "text-amber-800";
  const shloka = "असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय॥";

  // Section padding shared across all sections for consistency
  const sectionClass = "pdf-section px-6 py-10 relative";

  return (
    <div 
      ref={ref}
      style={{ width: '900px', height: 'max-content' }}
      className={`${solidBgClass} ${textColorClass} font-serif relative overflow-hidden`}
    >
      <div className={`absolute inset-6 border-[3px] ${borderColorClass} pointer-events-none rounded-sm opacity-90`} />
      <div className={`absolute inset-8 border border-dashed ${borderColorClass} pointer-events-none opacity-60`} />

      {/* ── Cover / Header Section ────────────────────────────────────────── */}
      <div className="pdf-section text-center mt-12 mb-8 px-16 pt-10 pb-8">
        <h1 className={`text-4xl font-bold mb-6 uppercase ${primaryColorClass} px-10 leading-normal`}>{translations.title}</h1>
        <p className="text-2xl italic opacity-90 mb-8">{translations.subtitle}</p>
        <div className="flex items-center justify-center gap-4 opacity-70">
          <span className="w-20 h-0.5 bg-amber-700"></span>
          <span className="text-2xl text-amber-700">ॐ</span>
          <span className="w-20 h-0.5 bg-amber-700"></span>
        </div>
      </div>

      {/* ── User Details Box ──────────────────────────────────────────────── */}
      <div className={`pdf-section grid grid-cols-2 gap-y-10 gap-x-12 mb-4 mx-12 p-12 border-[3px] double ${borderColorClass} bg-amber-100/30`}>
        <div className="flex flex-col border-b border-dashed border-amber-900/20 pb-4">
          <span className={`text-xl uppercase font-bold opacity-80 mb-2 ${primaryColorClass}`}>{translations.nameLabel}</span>
          <span className="text-2xl font-bold text-amber-950">{translations.nameValue}</span>
        </div>
        <div className="flex flex-col border-b border-dashed border-amber-900/20 pb-4">
          <span className={`text-xl uppercase font-bold opacity-80 mb-2 ${primaryColorClass}`}>{translations.dobLabel}</span>
          <span className="text-2xl font-bold text-amber-950">{translations.dobValue}</span>
        </div>
        <div className="flex flex-col border-b border-dashed border-amber-900/20 pb-4">
          <span className={`text-xl uppercase font-bold opacity-80 mb-2 ${primaryColorClass}`}>{translations.lagnaLabel}</span>
          <span className="text-2xl font-bold leading-normal text-amber-950">{translations.lagnaValue}</span>
        </div>
        <div className="flex flex-col border-b border-dashed border-amber-900/20 pb-4">
          <span className={`text-xl uppercase font-bold opacity-80 mb-2 ${primaryColorClass}`}>{translations.moonLabel}</span>
          <span className="text-2xl font-bold leading-normal text-amber-950">{translations.moonValue}</span>
        </div>
        <div className="flex flex-col">
          <span className={`text-xl uppercase font-bold opacity-80 mb-2 ${primaryColorClass}`}>{translations.nakshatraLabel}</span>
          <span className="text-2xl font-bold leading-normal text-amber-950">{translations.nakshatraValue}</span>
        </div>
        {translations.dashaPlanetValue && translations.bhuktiPlanetValue && (
          <div className="flex flex-col">
            <span className={`text-xl uppercase font-bold opacity-80 mb-2 ${primaryColorClass}`}>{translations.eraLabel}</span>
            <span className="text-2xl font-bold leading-normal text-amber-950">
              {translations.dashaPlanetValue} {translations.dashaLabel} / {translations.bhuktiPlanetValue} {translations.bhuktiLabel}
            </span>
          </div>
        )}
      </div>

      {/* ── Characteristics Section ───────────────────────────────────────── */}
      {premiumData?.characteristics && premiumData.characteristics.length > 0 && (
        <div className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-8`}>
            {translations.characteristicsTitle}
          </h2>
          <div className="space-y-10">
            {premiumData.characteristics.map((char, idx) => (
              <div key={idx} className="space-y-6">
                {(char.impact || "").split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Dark Secret Section ───────────────────────────────────────────── */}
      {premiumData?.darkSecret && premiumData.darkSecret.length > 0 && (
        <div className={sectionClass}>
          <h2 className="text-3xl font-bold text-slate-800 leading-normal border-b-2 border-slate-700/30 pb-2 mb-8">
            {translations.darkSecretTitle}
          </h2>
          <div className="space-y-10">
            {premiumData.darkSecret.map((ds, idx) => (
              <div key={idx} className="space-y-6">
                {(ds.impact || "").split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Life Stage Predictions ────────────────────────────────────────── */}
      {Object.entries(groupedPredictions).map(([category, preds]) => (
        <div key={category} className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-8`}>
            {category}
          </h2>
          <div className="space-y-10">
            {preds.map((pred, idx) => (
              <div key={idx} className="space-y-6">
                {(pred.translatedText || "").split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ── Yogas Section ────────────────────────────────────────────────── */}
      {premiumData?.yogas && premiumData.yogas.length > 0 && (
        <div className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-8`}>
            {translations.yogasTitle}
          </h2>
          <div className="space-y-10">
            {premiumData.yogas.map((yoga, idx) => (
              <div key={idx} className="space-y-6">
                <h3 className="text-2xl font-bold text-amber-900 mb-2 bg-amber-200/60 inline-block px-3 py-1 rounded shadow-sm">{yoga.name}</h3>
                {(yoga.impact || "").split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Doshas Section ───────────────────────────────────────────────── */}
      {premiumData?.doshas && premiumData.doshas.length > 0 && (
        <div className={sectionClass}>
          <h2 className="text-3xl font-bold text-rose-900 leading-normal border-b-2 border-rose-700/30 pb-2 mb-8">
            {translations.doshasTitle}
          </h2>
          <div className="space-y-10">
            {premiumData.doshas.map((dosha, idx) => (
              <div key={idx} className="space-y-6">
                <h3 className="text-2xl font-bold text-rose-900 mb-2">{dosha.name}</h3>
                {(dosha.impact || "").split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
                {dosha.remedy && (
                  <div className="mt-4 pt-4 border-t border-rose-200/40">
                    <h4 className="text-xl font-bold text-rose-800 mb-2">{translations.remedyTitle}</h4>
                    <p className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                      {dosha.remedy}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gochara (Current Planetary Transits) Section ─────────────────── */}
      {premiumData?.gochara && premiumData.gochara.length > 0 && (
        <div className={sectionClass}>
          <h2 className="text-3xl font-bold text-rose-900 leading-normal border-b-2 border-rose-700/30 pb-2 mb-8">
            {translations.gocharaTitle}
          </h2>
          <div className="space-y-10">
            {premiumData.gochara.map((gochara, idx) => (
              <div key={idx} className="space-y-6">
                <h3 className="text-2xl font-bold text-rose-900 mb-2 bg-rose-100/60 inline-block px-3 py-1 rounded shadow-sm">{gochara.name}</h3>
                {(gochara.impact || "").split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
                {gochara.remedy && (
                  <div className="mt-4 pt-4 border-t border-rose-200/40">
                    <h4 className="text-xl font-bold text-rose-800 mb-2">{translations.remedyTitle}</h4>
                    <p className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                      {gochara.remedy}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6-Month Planetary Journey Map ────────────────────────────────── */}
      {premiumData?.timeline && premiumData.timeline.length > 0 && (
        <div className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-10`}>
            {translations.timelineTitle}
          </h2>
          <div className="space-y-8">
            {premiumData.timeline.map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                {/* Timeline dot & line */}
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <div className="w-4 h-4 rounded-full bg-amber-700 border-4 border-amber-100 shadow z-10" />
                  {idx < premiumData.timeline!.length - 1 && (
                    <div className="w-0.5 flex-1 bg-amber-300/60 mt-1" style={{ minHeight: '40px' }} />
                  )}
                </div>
                {/* Card */}
                <div className="flex-1 bg-white/70 border border-amber-900/20 shadow-sm p-6 rounded-lg mb-2">
                  <span className="text-amber-800 font-bold text-lg bg-amber-100/50 inline-block px-3 py-1 rounded w-fit border border-amber-900/10 shadow-sm mb-3 block">
                    {item.dateRange}
                  </span>
                  {(item.impact || "").split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-xl leading-relaxed text-amber-950 font-medium text-left break-words whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Astrologer's Summary ──────────────────────────────────────────── */}
      {premiumData?.summary && premiumData.summary.length > 0 && (
        <div className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-8`}>
            {translations.summaryTitle}
          </h2>
          <div className="space-y-6">
            {premiumData.summary.map((sum, idx) => (
              <div key={idx} className="space-y-6">
                {(sum.impact || "").split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sanskrit Shloka ───────────────────────────────────────────────── */}
      <div className={`pdf-section my-4 text-center mx-12 px-16 py-14 border-y-[3px] border-double ${borderColorClass} bg-amber-100/30`}>
        <p className="text-3xl font-bold leading-loose text-amber-900" style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>
          {shloka}
        </p>
      </div>

      {/* ── Astrologer's Blessing ─────────────────────────────────────────── */}
      <div className="pdf-section mt-4 text-center px-20 pb-16">
        <div className="text-6xl text-amber-600 mb-6 drop-shadow-md opacity-90" style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>ॐ</div>
        <h3 className={`text-3xl font-bold mb-8 italic ${primaryColorClass} leading-normal`}>
          {translations.ashirvadaTitle}
        </h3>
        <p className="text-2xl leading-loose font-medium text-amber-950 text-center">
          "{translations.ashirvadaValue}"
        </p>
        <div className="flex items-center justify-center gap-6 opacity-80 mt-16 mb-12">
          <span className="text-3xl text-amber-700">✧</span>
        </div>
        <div className="mt-12 text-center text-amber-800 text-base font-bold uppercase pb-8 pt-10 leading-normal border-t border-amber-700/30">
          Baggona Panchanga Creation
        </div>
      </div>
    </div>
  );
});

PdfTemplate.displayName = 'PdfTemplate';
