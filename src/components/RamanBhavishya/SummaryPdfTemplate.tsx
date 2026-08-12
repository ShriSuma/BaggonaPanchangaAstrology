import React, { forwardRef } from 'react';
import type { KundliViewerSession } from '../../stores/kundliViewerStore';
import type { PdfTranslations } from './PdfTemplate';

export type SummaryPdfData = {
  paragraph1: string; // Current Dasha-Bhukti State
  paragraph2: string; // Current Gochara (Transit) Impact
  paragraph3: string; // Immediate Life Outlook & Timing
  paragraph4: string; // Remedies, Guidance & Blessing
};

interface Props {
  session: KundliViewerSession | null;
  translations: PdfTranslations;
  summaryData: SummaryPdfData | null;
}

export const SummaryPdfTemplate = forwardRef<HTMLDivElement, Props>(({ session, translations, summaryData }, ref) => {
  if (!session) return null;

  const solidBgClass = "bg-amber-50"; 
  const textColorClass = "text-amber-950"; 
  const borderColorClass = "border-amber-700/40"; 
  const shloka = "असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय॥";

  const paragraphs = summaryData ? [
    { title: translations.dashaLabel + " & " + translations.bhuktiLabel + " - " + translations.eraLabel, content: summaryData.paragraph1 },
    { title: translations.gocharaTitle || "Current Transits (Gochara)", content: summaryData.paragraph2 },
    { title: translations.summaryTitle || "Life Outlook & Timing", content: summaryData.paragraph3 },
    { title: translations.remedyTitle ? (translations.remedyTitle + " & " + translations.ashirvadaTitle) : "Remedies & Blessing", content: summaryData.paragraph4 },
  ] : [];

  return (
    <div 
      ref={ref}
      style={{ width: '900px', height: 'max-content' }}
      className={`${solidBgClass} ${textColorClass} font-serif relative overflow-hidden`}
    >
      {/* Background Decorative Gold Radial Patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Royal Gold Outer Frame */}
      <div className={`m-6 p-8 border-4 border-double ${borderColorClass} rounded-2xl relative bg-amber-50/90 shadow-2xl`}>
        
        {/* Corner Emblems */}
        <div className="absolute top-2 left-2 text-amber-700/60 text-xl pointer-events-none">❖</div>
        <div className="absolute top-2 right-2 text-amber-700/60 text-xl pointer-events-none">❖</div>
        <div className="absolute bottom-2 left-2 text-amber-700/60 text-xl pointer-events-none">❖</div>
        <div className="absolute bottom-2 right-2 text-amber-700/60 text-xl pointer-events-none">❖</div>

        {/* Header Header Banner */}
        <div className="text-center pb-6 border-b-2 border-amber-600/30 mb-8 relative">
          <div className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-amber-800/80 mb-1">
            {shloka}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 tracking-normal font-sans mb-3 leading-normal drop-shadow-sm">
            {translations.title || "ಭಾಗೋಣ ಪಂಚಾಂಗ"}
          </h1>
          {translations.subtitle && !translations.subtitle.includes("4-Paragraph") && !translations.subtitle.includes("4-ಪ್ಯಾರಾಗ್ರಾಫ್") && (
            <p className="text-base sm:text-lg italic text-amber-800 font-sans tracking-normal leading-normal mt-1">
              {translations.subtitle}
            </p>
          )}
        </div>

        {/* User Kundali Details Card */}
        <div className="bg-amber-100/60 border-2 border-amber-600/40 rounded-xl p-6 mb-8 shadow-sm">
          {translations.introGreeting && (
            <h2 className="text-2xl font-bold text-amber-900 mb-3 font-sans tracking-normal">
              {translations.introGreeting}
            </h2>
          )}

          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm md:text-base font-sans">
            <div>
              <span className="font-bold text-amber-900">{translations.nameLabel}: </span>
              <span className="text-amber-950 font-semibold">{translations.nameValue}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{translations.dobLabel}: </span>
              <span className="text-amber-950">{translations.dobValue}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{translations.lagnaLabel}: </span>
              <span className="text-amber-950">{translations.lagnaValue}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{translations.moonLabel}: </span>
              <span className="text-amber-950">{translations.moonValue}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{translations.nakshatraLabel}: </span>
              <span className="text-amber-950">{translations.nakshatraValue}</span>
            </div>
            <div>
              <span className="font-bold text-amber-900">{translations.dashaLabel} / {translations.bhuktiLabel}: </span>
              <span className="text-amber-950 font-bold">
                {translations.dashaPlanetValue} - {translations.bhuktiPlanetValue}
              </span>
            </div>
          </div>
        </div>

        {/* Main 4 Paragraph Summary Sections */}
        <div className="space-y-6">
          {paragraphs.map((p, idx) => (
            <div 
              key={idx}
              className="bg-white/80 border border-amber-300/60 rounded-xl p-6 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-3 border-b border-amber-200 pb-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-sm">
                  {idx + 1}
                </span>
                <h3 className="text-xl font-bold text-amber-900 font-sans tracking-normal">
                  {p.title}
                </h3>
              </div>
              <p className="text-amber-950 text-base leading-relaxed tracking-normal font-sans whitespace-pre-wrap">
                {p.content}
              </p>
            </div>
          ))}
        </div>

        {/* Ashirvada Blessing Card */}
        {translations.ashirvadaValue && (
          <div className="mt-8 bg-amber-100/70 border-2 border-amber-500/40 rounded-xl p-5 text-center">
            <h4 className="text-sm font-bold text-amber-900 uppercase tracking-normal mb-2 font-sans">
              ✦ {translations.ashirvadaTitle || "ಆಶೀರ್ವಚನ"} ✦
            </h4>
            <p className="text-amber-950 italic text-base leading-relaxed tracking-normal font-serif">
              "{translations.ashirvadaValue}"
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-amber-600/30 text-center text-xs text-amber-800/80 font-sans tracking-normal">
          <p>{translations.footer && translations.footer !== "footer" && !translations.footer.toLowerCase().includes("engine") ? translations.footer : "ಭಾಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ - Baggona Panchanga Astrology"}</p>
        </div>
      </div>
    </div>
  );
});

SummaryPdfTemplate.displayName = "SummaryPdfTemplate";
