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
  /**
   * Opening greeting. Optional so the older non-premium exports, which do not
   * build one, keep working unchanged.
   */
  introTitle?: string;
  introGreeting?: string;
  introPrepared?: string;
  introRunning?: string;
  introBegin?: string;
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

  const validPredictions = predictions.filter(p => {
    const text = (p.translatedText || "").trim().toLowerCase();
    return text.length > 0 && !text.includes("no prediction available") && !text.includes("ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ");
  });

  const groupedPredictions = validPredictions.reduce((acc, pred) => {
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

  const hasContent = (items?: { impact?: string }[]) => {
    if (!items || items.length === 0) return false;
    return items.some(item => (item.impact || "").trim().length > 10);
  };

  // Section padding shared across all sections for consistency
  // px-14 = 56px horizontal clearance from edge — keeps all content well inside the border lines
  const sectionClass = "pdf-section px-14 py-10 relative";

  return (
    <div 
      ref={ref}
      style={{ width: '900px', height: 'max-content' }}
      className={`${solidBgClass} ${textColorClass} font-serif relative overflow-hidden`}
    >
      <div className={`absolute inset-6 border-[3px] ${borderColorClass} pointer-events-none rounded-sm opacity-90`} />
      <div className={`absolute inset-8 border border-dashed ${borderColorClass} pointer-events-none opacity-60`} />

      {/* ── Cover / Header Section ────────────────────────────────────────── */}
      <div className="pdf-section text-center mt-10 mb-6 px-16 pt-8 pb-4">
        <div className="inline-block relative px-12 py-3 mb-4">
          <div className="absolute inset-0 border-y border-amber-700/40 transform -skew-x-12 pointer-events-none" />
          <h1 className={`text-4xl font-extrabold ${primaryColorClass} leading-relaxed tracking-normal`}>
            {translations.title}
          </h1>
        </div>
        <p className="text-2xl italic font-serif text-amber-900/90 tracking-normal leading-relaxed mb-6">
          {translations.subtitle}
        </p>
        <div className="flex items-center justify-center gap-6 opacity-80">
          <span className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-700 to-transparent"></span>
          <span className="text-2xl text-amber-800 font-serif">ॐ</span>
          <span className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-700 to-transparent"></span>
        </div>
      </div>

      {/* ── User Details Box (Ultra-Premium Royal Gold Parchment Card) ──────── */}
      <div className="pdf-section mx-14 mb-8 relative rounded-xl border-2 border-amber-600/60 bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-100/80 p-8 shadow-md overflow-hidden">
        {/* Ornate Inner Frame */}
        <div className="absolute inset-2 border border-amber-700/30 rounded-lg pointer-events-none" />
        <div className="absolute inset-3 border border-dashed border-amber-700/20 rounded-lg pointer-events-none" />

        {/* Decorative corner emblems */}
        <div className="absolute top-4 left-4 text-sm text-amber-800/50 font-serif">❖</div>
        <div className="absolute top-4 right-4 text-sm text-amber-800/50 font-serif">❖</div>
        <div className="absolute bottom-4 left-4 text-sm text-amber-800/50 font-serif">❖</div>
        <div className="absolute bottom-4 right-4 text-sm text-amber-800/50 font-serif">❖</div>

        <div className="grid grid-cols-2 gap-y-7 gap-x-10 relative z-10 px-4 py-2">
          <div className="flex flex-col border-b border-amber-800/20 pb-3">
            <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
              {translations.nameLabel}
            </span>
            <span className="text-2xl font-black text-amber-950 font-serif tracking-normal leading-relaxed">
              {translations.nameValue}
            </span>
          </div>

          <div className="flex flex-col border-b border-amber-800/20 pb-3">
            <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
              {translations.dobLabel}
            </span>
            <span className="text-2xl font-bold text-amber-950 font-serif tracking-normal leading-relaxed">
              {translations.dobValue}
            </span>
          </div>

          <div className="flex flex-col border-b border-amber-800/20 pb-3">
            <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
              {translations.lagnaLabel}
            </span>
            <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
              {translations.lagnaValue}
            </span>
          </div>

          <div className="flex flex-col border-b border-amber-800/20 pb-3">
            <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
              {translations.moonLabel}
            </span>
            <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
              {translations.moonValue}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
              {translations.nakshatraLabel}
            </span>
            <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
              {translations.nakshatraValue}
            </span>
          </div>

          {translations.dashaPlanetValue && translations.bhuktiPlanetValue && (
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {translations.eraLabel}
              </span>
              <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
                {translations.dashaPlanetValue} {translations.dashaLabel} / {translations.bhuktiPlanetValue} {translations.bhuktiLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Introduction Block ─────────────────────────────────────────────── */}
      {translations.introPrepared && (
        <div className={`${sectionClass} mx-14 mt-4 mb-6 p-10 rounded-lg border border-amber-800/30 bg-amber-100/30 relative`}>
          {translations.introGreeting && (
            <h2 className="text-3xl font-extrabold text-amber-900 mb-6 tracking-normal leading-relaxed font-sans">
              {translations.introGreeting}
            </h2>
          )}
          <div className="space-y-5">
            <p className="text-xl leading-relaxed text-amber-950 font-medium break-words">
              {translations.introPrepared}
            </p>
            {translations.introBegin && (
              <p className="text-xl leading-relaxed text-amber-900 font-bold italic break-words">
                {translations.introBegin}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Characteristics Section ───────────────────────────────────────── */}
      {hasContent(premiumData?.characteristics) && (
        <div className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-8`}>
            {translations.characteristicsTitle}
          </h2>
          <div className="space-y-10">
            {premiumData!.characteristics!.map((char, idx) => (
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
      {hasContent(premiumData?.darkSecret) && (
        <div className={sectionClass}>
          <h2 className="text-3xl font-bold text-slate-800 leading-normal border-b-2 border-slate-700/30 pb-2 mb-8">
            {translations.darkSecretTitle}
          </h2>
          <div className="space-y-10">
            {premiumData!.darkSecret!.map((ds, idx) => (
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
      {hasContent(premiumData?.yogas) && (
        <div className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-8`}>
            {translations.yogasTitle}
          </h2>
          <div className="space-y-10">
            {premiumData!.yogas!.map((yoga, idx) => (
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
      {hasContent(premiumData?.doshas) && (
        <div className={sectionClass}>
          <h2 className="text-3xl font-bold text-rose-900 leading-normal border-b-2 border-rose-700/30 pb-2 mb-8">
            {translations.doshasTitle}
          </h2>
          <div className="space-y-10">
            {premiumData!.doshas!.map((dosha, idx) => (
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
      {hasContent(premiumData?.gochara) && (
        <div className={sectionClass}>
          <h2 className="text-3xl font-bold text-rose-900 leading-normal border-b-2 border-rose-700/30 pb-2 mb-8">
            {translations.gocharaTitle}
          </h2>
          <div className="space-y-10">
            {premiumData!.gochara!.map((gochara, idx) => (
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
      {hasContent(premiumData?.timeline) && (
        <div className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-10`}>
            {translations.timelineTitle}
          </h2>
          <div className="space-y-8">
            {premiumData!.timeline!.map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                {/* Timeline dot & line */}
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <div className="w-4 h-4 rounded-full bg-amber-700 border-4 border-amber-100 shadow z-10" />
                  {idx < premiumData!.timeline!.length - 1 && (
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
      {hasContent(premiumData?.summary) && (
        <div className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-8`}>
            {translations.summaryTitle}
          </h2>
          <div className="space-y-6">
            {premiumData!.summary!.map((sum, idx) => (
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
      <div className={`pdf-section my-4 text-center mx-16 px-20 py-14 border-y-[3px] border-double ${borderColorClass} bg-amber-100/30`}>
        <p className="text-3xl font-bold leading-loose text-amber-900" style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>
          {shloka}
        </p>
      </div>

      {/* ── Astrologer's Blessing ─────────────────────────────────────────── */}
      <div className="pdf-section mt-4 text-center px-20 pb-20">
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
