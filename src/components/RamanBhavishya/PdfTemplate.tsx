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
  theme: "sunrise"; // Kept for backwards compatibility if needed, though hardcoded now
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

  return (
    <div 
      ref={ref}
      style={{ width: '900px', height: 'max-content' }}
      className={`${solidBgClass} ${textColorClass} p-16 font-serif relative overflow-hidden`}
    >
      <div className={`absolute inset-6 border-[3px] ${borderColorClass} pointer-events-none rounded-sm opacity-90`} />
      <div className={`absolute inset-8 border border-dashed ${borderColorClass} pointer-events-none opacity-60`} />

      {/* Header Section */}
      <div className="text-center mt-12 mb-16 relative">
        <h1 className={`text-4xl font-bold mb-6 uppercase ${primaryColorClass} px-10 leading-normal`}>{translations.title}</h1>
        <p className="text-2xl italic opacity-90 mb-8">{translations.subtitle}</p>
        <div className="flex items-center justify-center gap-4 opacity-70">
          <span className="w-20 h-0.5 bg-amber-700"></span>
          <span className="text-2xl text-amber-700">ॐ</span>
          <span className="w-20 h-0.5 bg-amber-700"></span>
        </div>
      </div>

      {/* User Details Box (Clean, Formal Patrika Style) */}
      <div className={`grid grid-cols-2 gap-y-10 gap-x-12 mb-20 p-12 border-[3px] double ${borderColorClass} bg-amber-100/30`}>
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

      {/* Premium Data Section - Characteristics & Dark Secret */}
      {premiumData && (
        <div className="space-y-16 mb-20 relative">
          {/* Characteristics Section */}
          {premiumData.characteristics && premiumData.characteristics.length > 0 && (
            <div className="px-6 relative">
              <div className="flex items-center gap-6 mb-8">
                <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2`}>
                  {translations.characteristicsTitle}
                </h2>
              </div>
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

          {/* Dark Secret Section */}
          {premiumData.darkSecret && premiumData.darkSecret.length > 0 && (
            <div className="px-6 relative mt-16">
              <div className="flex items-center gap-6 mb-8">
                <h2 className={`text-3xl font-bold text-slate-800 leading-normal border-b-2 border-slate-700/30 pb-2`}>
                  {translations.darkSecretTitle}
                </h2>
              </div>
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
        </div>
      )}

      {/* Predictions Section */}
      <div className="space-y-16 mb-20 relative">
        {Object.entries(groupedPredictions).map(([category, preds]) => (
          <div key={category} className="px-6 relative">
            <div className="flex items-center gap-6 mb-8">
              <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2`}>
                {category}
              </h2>
            </div>
            
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
      </div>

      {/* Premium Data Section - Yogas & Doshas */}
      {premiumData && (
        <div className="space-y-16 mb-20 relative">

          {premiumData.yogas && premiumData.yogas.length > 0 && (
            <div className="px-6 relative mt-16">
              <div className="flex items-center gap-6 mb-8">
                <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2`}>
                  {translations.yogasTitle}
                </h2>
              </div>
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

          {premiumData.doshas && premiumData.doshas.length > 0 && (
            <div className="px-6 relative mt-16">
              <div className="flex items-center gap-6 mb-8">
                <h2 className={`text-3xl font-bold text-rose-900 leading-normal border-b-2 border-rose-700/30 pb-2`}>
                  {translations.doshasTitle}
                </h2>
              </div>
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
        </div>
      )}

      {/* Gochara Section */}
      {premiumData?.gochara && premiumData.gochara.length > 0 && (
        <div className="space-y-12 mb-20 px-6 relative mt-16">
          <div className="flex items-center gap-6 mb-10">
            <h2 className={`text-3xl font-bold text-rose-900 leading-normal border-b-2 border-rose-700/30 pb-2`}>
              {translations.gocharaTitle}
            </h2>
          </div>
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

      {/* 6-Month Planetary Timeline */}
      {premiumData?.timeline && premiumData.timeline.length > 0 && (
        <div className="space-y-12 mb-20 px-6 relative mt-16">
          <div className="flex items-center gap-6 mb-10">
            <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2`}>
              {translations.timelineTitle}
            </h2>
          </div>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-amber-700/40 before:to-transparent">
            {premiumData.timeline.map((item, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-amber-100 bg-amber-700 text-amber-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-2 h-2 rounded-full bg-amber-200"></div>
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white/70 border border-amber-900/20 shadow-sm p-6 rounded-lg ml-12 md:ml-0">
                  <div className="flex flex-col space-y-2 mb-3">
                    <span className="text-amber-800 font-bold text-lg bg-amber-100/50 inline-block px-3 py-1 rounded w-fit border border-amber-900/10 shadow-sm">
                      {item.dateRange}
                    </span>
                  </div>
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

      {/* Astrologer's Summary Section */}
      {premiumData?.summary && premiumData.summary.length > 0 && (
        <div className="space-y-12 mb-20 px-6 relative mt-16">
          <div className="flex items-center gap-6 mb-10">
            <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2`}>
              {translations.summaryTitle}
            </h2>
          </div>
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

      {/* Sanskrit Shloka at the End */}
      <div className={`my-16 text-center px-16 py-14 border-y-[3px] border-double ${borderColorClass} bg-amber-100/30`}>
        <p className="text-3xl font-bold leading-loose text-amber-900" style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>
          {shloka}
        </p>
      </div>

      {/* Astrologer's Ashirvada (Blessing) */}
      <div className="mt-16 text-center px-20">
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
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-amber-800 text-base font-bold uppercase pb-8 pt-10 leading-normal border-t border-amber-700/30">
        Baggona Panchanga Creation
      </div>
    </div>
  );
});

PdfTemplate.displayName = 'PdfTemplate';
