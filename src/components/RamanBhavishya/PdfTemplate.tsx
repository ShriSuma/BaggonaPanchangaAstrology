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
  ashirvadaTitle: string;
  ashirvadaValue: string;
  footer: string;
};

interface Props {
  theme: "sunrise"; // Kept for backwards compatibility if needed, though hardcoded now
  session: KundliViewerSession | null;
  predictions: TranslatedPrediction[];
  translations: PdfTranslations;
  deepInsights?: Record<string, string>;
}

export const PdfTemplate = forwardRef<HTMLDivElement, Props>(({ session, predictions, translations, deepInsights }, ref) => {
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
                <p key={idx} className="text-xl leading-loose text-amber-950 text-justify font-medium">
                  {pred.translatedText}
                </p>
              ))}
            </div>
          </div>
        ))}
        
        {deepInsights && Object.entries(deepInsights).map(([category, insightText]) => (
          <div key={category} className="px-6 relative">
            <div className="flex items-center gap-6 mb-8 mt-12">
              <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2`}>
                {category}
              </h2>
            </div>
            
            <div className="space-y-10">
              {insightText.split("\n\n").map((paragraph, idx) => (
                <p key={idx} className="text-xl leading-loose text-amber-950 text-justify font-medium">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sanskrit Shloka at the End */}
      <div className={`my-16 text-center px-16 py-14 border-y-[3px] border-double ${borderColorClass} bg-amber-100/30`}>
        <p className="text-3xl font-bold leading-loose text-amber-900" style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>
          {shloka}
        </p>
      </div>

      {/* Astrologer's Ashirvada (Blessing) */}
      <div className="mt-16 text-center px-20">
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
