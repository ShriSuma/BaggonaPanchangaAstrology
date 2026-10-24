import React, { forwardRef } from 'react';
import type { TranslatedPrediction } from './usePredictionEngine';
import type { KundliViewerSession } from '../../stores/kundliViewerStore';
import { CosmicDashaAuraVisual } from './CosmicDashaAuraVisual';

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
  padaLabel?: string;
  padaValue?: string;
  lagnaLordLabel?: string;
  lagnaLordValue?: string;
  moonLordLabel?: string;
  moonLordValue?: string;
  tithiLabel?: string;
  tithiValue?: string;
  weekdayLabel?: string;
  weekdayValue?: string;
  prescriptionsTitle?: string;
  gemstoneLabel?: string;
  rudrakshaLabel?: string;
  ishtaDevataLabel?: string;
  luckyColorsLabel?: string;
  luckyDaysLabel?: string;
  luckyNumbersLabel?: string;
  luckyDirectionLabel?: string;
  soulMirrorTitle?: string;
  elementalBalanceTitle?: string;
  cosmicShieldTitle?: string;
  mindVitalityTitle?: string;
  characteristicsTitle: string;
  darkSecretTitle: string;
  currentPhaseTitle?: string;
  currentPhaseGuidanceTitle?: string;
  currentPhase?: string;
  ashirvadaTitle: string;
  ashirvadaValue: string;
  yogasTitle: string;
  doshasTitle: string;
  remedyTitle: string;
  timelineTitle: string;
  gocharaTitle: string;
  summaryTitle: string;
  cosmicAuraTitle?: string;
  annualForecastTitle?: string;
  dashaGocharaCompassTitle?: string;
  dashaGocharaCompassSubtitle?: string;
  footer: string;
  priestSeal?: string;
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

export type DashaGocharaCompassData = {
  title: string;
  subtitle: string;
  shaniBadge: {
    title: string;
    status: string;
    houseText: string;
    isAdverse: boolean;
  };
  guruBadge: {
    title: string;
    status: string;
    houseText: string;
    isBenefic: boolean;
  };
  dashaBadge: {
    title: string;
    eraText: string;
    confluenceText: string;
  };
  pariharaBadge: {
    title: string;
    sankalpaText: string;
    templeText: string;
  };
  pillars: {
    career: { title: string; text: string };
    wealth: { title: string; text: string };
    family: { title: string; text: string };
    shield: { title: string; text: string };
  };
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
};

export type PremiumData = {
  soulMirror?: {
    elemental: {
      firePercent: number;
      earthPercent: number;
      airPercent: number;
      waterPercent: number;
      dominantElementKey: "Agni" | "Prithvi" | "Vayu" | "Jala";
      dominantElementName: string;
      dominantElementTrait: string;
      shieldGraha: string;
      shieldGrahaName: string;
      shieldGrahaWhy: string;
      moonPaksha: string;
      moonVitalityTrait: string;
    };
    truth1Title: string;
    truth1Text: string;
    truth2Title: string;
    truth2Text: string;
    truth3Title: string;
    truth3Text: string;
    synthesisTitle?: string;
    synthesisText?: string;
  };
  characteristics?: { impact: string }[];
  darkSecret?: { impact: string }[];
  currentPhase?: { impact: string }[];
  yogas: { name: string; impact: string }[];
  doshas: { name: string; impact: string; remedy?: string }[];
  timeline?: { dateRange: string; impact: string }[];
  annualForecast?: { impact: string }[];
  gochara?: { name: string; impact: string; remedy?: string }[];
  dashaGocharaCompass?: DashaGocharaCompassData;
  summary?: { impact: string }[];
  maandiInquest?: {
    title: string;
    paragraph1: string;
    paragraph2: string;
  };
  prescriptions?: {
    gemstone: string;
    rudraksha: string;
    ishtaDevata: string;
    luckyColors: string;
    luckyDays: string;
    luckyNumbers: string;
    luckyDirection: string;
  };
};

interface Props {
  theme: "sunrise";
  session: KundliViewerSession | null;
  predictions: TranslatedPrediction[];
  translations: PdfTranslations;
  deepInsights?: Record<string, string>;
  premiumData?: PremiumData;
  ageYears?: number;
  lang?: string;
}

export const PdfTemplate = forwardRef<HTMLDivElement, Props>(({ session, predictions, translations, deepInsights, premiumData, ageYears, lang }, ref) => {
  if (!session) return null;

  const langKey = (lang || "kn") as string;
  const getFontFamily = (l: string): string => {
    switch (l) {
      case "kn":
        return `'Tiro Kannada', 'Noto Serif Kannada', 'Noto Sans Kannada', serif, sans-serif`;
      case "te":
        return `'Noto Sans Telugu', serif, sans-serif`;
      case "ta":
        return `'Noto Sans Tamil', serif, sans-serif`;
      case "hi":
        return `'Noto Sans Devanagari', serif, sans-serif`;
      case "en":
      default:
        return `'Outfit', 'Cinzel', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    }
  };
  const activeFontFamily = getFontFamily(langKey);

  const nativeAge = ageYears !== undefined ? ageYears : (() => {
    try {
      const bd = new Date(session.input.birthDate);
      const now = new Date();
      return (now.getTime() - bd.getTime()) / (365.25 * 24 * 3600 * 1000);
    } catch {
      return 30;
    }
  })();
  const isChildUnder8 = nativeAge < 8;

  const validPredictions = predictions.filter(p => {
    const text = (p.translatedText || "").trim().toLowerCase();
    const cat = `${p.translatedCategory || ''} ${p.category || ''}`.toLowerCase();
    // For children below 8 years old, hide adult Marriage and Progeny sections
    if (isChildUnder8) {
      if (cat.includes("marriage") || cat.includes("ಮದುವೆ") || cat.includes("ವಿವಾಹ") || cat.includes("विवाह") || cat.includes("వివాహ") || cat.includes("திருமணம்")) {
        return false;
      }
      if (cat.includes("children") || cat.includes("ಸಂತಾನ") || cat.includes("ಮಕ್ಕಳು") || cat.includes("संतान") || cat.includes("సంతాన") || cat.includes("குழந்தை")) {
        return false;
      }
    }
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
      style={{ width: '900px', height: 'max-content', fontFamily: activeFontFamily, letterSpacing: 'normal' }}
      className={`${solidBgClass} ${textColorClass} relative overflow-hidden`}
    >
      <div className={`absolute inset-6 border-[3px] ${borderColorClass} pointer-events-none rounded-sm opacity-90`} />
      <div className={`absolute inset-8 border border-dashed ${borderColorClass} pointer-events-none opacity-60`} />

      {/* ── Cover / Header Section ────────────────────────────────────────── */}
      <div data-section="cover" className="pdf-section text-center mt-10 mb-6 px-16 pt-8 pb-4">
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
          <div className="w-24 border-b-2 border-amber-700/60" />
          <span className="text-2xl text-amber-800 font-serif">ॐ</span>
          <div className="w-24 border-b-2 border-amber-700/60" />
        </div>
      </div>

      {/* ── User Details Box (Ultra-Premium Royal Gold Parchment Card) ──────── */}
      <div data-section="user-details" className="pdf-section w-full px-14 mb-8">
        <div className="relative rounded-xl border-2 border-amber-600/60 bg-amber-100/50 p-8 shadow-md overflow-hidden">
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
                {translations.lagnaValue} {translations.lagnaLordValue ? `(${translations.lagnaLordLabel || "Lord"}: ${translations.lagnaLordValue})` : ""}
              </span>
            </div>

            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {translations.moonLabel}
              </span>
              <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
                {translations.moonValue} {translations.moonLordValue ? `(${translations.moonLordLabel || "Lord"}: ${translations.moonLordValue})` : ""}
              </span>
            </div>

            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {translations.nakshatraLabel}
              </span>
              <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
                {translations.nakshatraValue} {translations.padaValue ? `(${translations.padaLabel || "Pada"} ${translations.padaValue})` : ""}
              </span>
            </div>

            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {translations.tithiLabel || "Tithi"} / {translations.weekdayLabel || "Vaara"}
              </span>
              <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
                {[translations.tithiValue, translations.weekdayValue].filter(Boolean).join(" • ") || "—"}
              </span>
            </div>

            {translations.dashaPlanetValue && translations.bhuktiPlanetValue && (
              <div className="flex flex-col col-span-2 pt-1">
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
      </div>

      {/* ── Introduction Block ─────────────────────────────────────────────── */}
      {translations.introPrepared && (
        <div data-section="intro" className="pdf-section w-full px-14 mt-4 mb-6">
          <div className="p-10 rounded-lg border border-amber-800/30 bg-amber-100/30 relative">
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
        </div>
      )}

      {/* ── Chapter 1: The Sacred Soul Mirror & Cosmic Elemental Vitality ──────────────── */}
      {premiumData?.soulMirror && (
        <div data-section="soul-mirror" className={sectionClass}>
          {/* Main Chapter Heading */}
          <div className="flex items-center gap-3 border-b-2 border-amber-700/30 pb-3 mb-8">
            <span className="text-3xl text-amber-800">✦</span>
            <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal`}>
              {translations.soulMirrorTitle || (langKey === 'kn' ? "ಅಧ್ಯಾಯ ೧: ಅಂತರಂಗದ ತ್ರಿವಿಧ ಸತ್ಯಗಳು ಹಾಗೂ ಪಂಚಭೂತ ಚೇತನ ಶಕ್ತಿ" : "Chapter 1: The Sacred Soul Mirror & Cosmic Elemental Vitality")}
            </h2>
          </div>

          <div className="space-y-8">
            {/* Part 1: Cosmic Elemental Balance & Mind Vitality Dashboard */}
            {premiumData.soulMirror.elemental && (
              <div className="rounded-xl border-2 border-amber-700/40 bg-amber-100/40 p-6 shadow-sm relative overflow-hidden">
                <div className="border-b border-amber-700/20 pb-4 mb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                      <span>☸</span>
                      <span>{translations.elementalBalanceTitle || (langKey === 'kn' ? "ಪಂಚಭೂತ ತತ್ವ ಸಮತೋಲನ" : "Cosmic Elemental Balance")}</span>
                    </h3>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-800/10 text-amber-950 rounded-full border border-amber-800/30">
                      <span className="text-sm font-semibold opacity-80">
                        {langKey === 'kn' ? "ಪ್ರಮುಖ ತತ್ವ:" : langKey === 'hi' ? "प्रमुख तत्व:" : langKey === 'te' ? "ప్రధాన తత్త్వం:" : langKey === 'ta' ? "முக்கிய தத்துவம்:" : "Dominant Element:"}
                      </span>
                      <span className="text-base font-bold">
                        {premiumData.soulMirror.elemental.dominantElementName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Elemental Meters */}
                <div className="grid grid-cols-4 gap-4 mb-5">
                  {/* Fire */}
                  <div className="bg-amber-50/90 border border-amber-300/80 rounded-lg p-3 text-center shadow-xs">
                    <span className="text-base font-bold text-amber-900 block mb-1.5 leading-normal tracking-normal">
                      {langKey === 'kn' ? "ಬೆಂಕಿ (ಅಗ್ನಿ)" : langKey === 'hi' ? "अग्नि (आग)" : langKey === 'te' ? "అగ్ని (నిప్పు)" : langKey === 'ta' ? "நெருப்பு (அக்னி)" : "Fire (Agni)"}
                    </span>
                    <span className="text-2xl font-extrabold text-amber-950 font-serif block">
                      {premiumData.soulMirror.elemental.firePercent}%
                    </span>
                  </div>
                  {/* Earth */}
                  <div className="bg-amber-50/90 border border-amber-300/80 rounded-lg p-3 text-center shadow-xs">
                    <span className="text-base font-bold text-amber-900 block mb-1.5 leading-normal tracking-normal">
                      {langKey === 'kn' ? "ಭೂಮಿ (ಪೃಥ್ವಿ)" : langKey === 'hi' ? "पृथ्वी (भूमि)" : langKey === 'te' ? "భూమి (పృథ్వి)" : langKey === 'ta' ? "பூமி (நிலம்)" : "Earth (Prithvi)"}
                    </span>
                    <span className="text-2xl font-extrabold text-amber-950 font-serif block">
                      {premiumData.soulMirror.elemental.earthPercent}%
                    </span>
                  </div>
                  {/* Air */}
                  <div className="bg-amber-50/90 border border-amber-300/80 rounded-lg p-3 text-center shadow-xs">
                    <span className="text-base font-bold text-amber-900 block mb-1.5 leading-normal tracking-normal">
                      {langKey === 'kn' ? "ಗಾಳಿ (ವಾಯು)" : langKey === 'hi' ? "वायु (हवा)" : langKey === 'te' ? "వాయువు (గాలి)" : langKey === 'ta' ? "காற்று (வாயு)" : "Air (Vayu)"}
                    </span>
                    <span className="text-2xl font-extrabold text-amber-950 font-serif block">
                      {premiumData.soulMirror.elemental.airPercent}%
                    </span>
                  </div>
                  {/* Water */}
                  <div className="bg-amber-50/90 border border-amber-300/80 rounded-lg p-3 text-center shadow-xs">
                    <span className="text-base font-bold text-amber-900 block mb-1.5 leading-normal tracking-normal">
                      {langKey === 'kn' ? "ನೀರು (ಜಲ)" : langKey === 'hi' ? "जल (पानी)" : langKey === 'te' ? "జలం (నీరు)" : langKey === 'ta' ? "நீர் (ஜலம்)" : "Water (Jala)"}
                    </span>
                    <span className="text-2xl font-extrabold text-amber-950 font-serif block">
                      {premiumData.soulMirror.elemental.waterPercent}%
                    </span>
                  </div>
                </div>

                {/* Dominant Element Trait */}
                <p className="text-lg leading-relaxed text-amber-950 font-medium break-words mb-5 bg-white/60 p-4 rounded-lg border border-amber-700/15">
                  {premiumData.soulMirror.elemental.dominantElementTrait}
                </p>

                {/* 2 Complementary Shield & Vitality Pillars */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-amber-700/20">
                  {/* Shield Graha */}
                  <div className="bg-amber-200/40 border border-amber-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl text-amber-800">🛡️</span>
                      <span className="text-base font-bold text-amber-900">
                        {translations.cosmicShieldTitle || (langKey === 'kn' ? "ಕುಂಡಲಿ ರಕ್ಷಾ ಕವಚ ಗ್ರಹ" : "Cosmic Shield Graha")}:
                      </span>
                      <span className="text-lg font-extrabold text-amber-950 font-serif">
                        {premiumData.soulMirror.elemental.shieldGrahaName}
                      </span>
                    </div>
                    <p className="text-base leading-relaxed text-amber-950 font-medium break-words">
                      {premiumData.soulMirror.elemental.shieldGrahaWhy}
                    </p>
                  </div>

                  {/* Lunar Vitality Meter */}
                  <div className="bg-amber-200/40 border border-amber-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl text-amber-800">🌙</span>
                      <span className="text-base font-bold text-amber-900">
                        {translations.mindVitalityTitle || (langKey === 'kn' ? "ಚೇತನ ಶಕ್ತಿ ಹಾಗೂ ಚಂದ್ರ ಬಲ" : "Mind Vitality")}:
                      </span>
                      <span className="text-lg font-extrabold text-amber-950 font-serif">
                        {premiumData.soulMirror.elemental.moonPaksha}
                      </span>
                    </div>
                    <p className="text-base leading-relaxed text-amber-950 font-medium break-words">
                      {premiumData.soulMirror.elemental.moonVitalityTrait}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Part 2: The 3 Sovereign Truths of Your Soul */}
            <div className="space-y-6">
              {/* Truth 1 Card */}
              {premiumData.soulMirror.truth1Text && (
                <div className="rounded-xl border border-amber-700/30 bg-amber-50/70 p-6 shadow-sm">
                  <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <span className="text-amber-700">①</span>
                    <span>{premiumData.soulMirror.truth1Title}</span>
                  </h3>
                  <div className="space-y-3">
                    {premiumData.soulMirror.truth1Text.split('\n').filter(p => p.trim() !== '').map((para, pIdx) => (
                      <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Truth 2 Card */}
              {premiumData.soulMirror.truth2Text && (
                <div className="rounded-xl border border-amber-700/30 bg-amber-50/70 p-6 shadow-sm">
                  <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <span className="text-amber-700">②</span>
                    <span>{premiumData.soulMirror.truth2Title}</span>
                  </h3>
                  <div className="space-y-3">
                    {premiumData.soulMirror.truth2Text.split('\n').filter(p => p.trim() !== '').map((para, pIdx) => (
                      <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Truth 3 Card */}
              {premiumData.soulMirror.truth3Text && (
                <div className="rounded-xl border border-amber-700/30 bg-amber-50/70 p-6 shadow-sm">
                  <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <span className="text-amber-700">③</span>
                    <span>{premiumData.soulMirror.truth3Title}</span>
                  </h3>
                  <div className="space-y-3">
                    {premiumData.soulMirror.truth3Text.split('\n').filter(p => p.trim() !== '').map((para, pIdx) => (
                      <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sacred Cosmic Dasha-Gochara Aura & Astral Shield ────────────── */}
      <div data-section="cosmic-aura" className={sectionClass}>
        <div className="flex items-center gap-3 border-b-2 border-amber-700/30 pb-3 mb-6">
          <span className="text-3xl text-amber-800">🪐</span>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal`}>
            {translations.cosmicAuraTitle || (langKey === 'kn' ? "ಪ್ರಸ್ತುತ ನಿಮ್ಮನ್ನು ನಡೆಸುತ್ತಿರುವ ದಶಾಧಿಪತಿ ಗ್ರಹ ಹಾಗೂ ಜನ್ಮ ಕುಂಡಲಿ ರಕ್ಷಾ ಕವಚ" : "Your Active Ruling Mahadasha Planet & Natal Protective Shield")}
          </h2>
        </div>
        <CosmicDashaAuraVisual
          lagnaName={translations.lagnaValue}
          lagnaIndex={session.result.lagnaRashi?.index ?? 0}
          lagnaLordName={translations.lagnaLordValue}
          moonName={translations.moonValue}
          moonIndex={session.result.moonSign?.index ?? 0}
          nakshatraName={translations.nakshatraValue}
          pada={translations.padaValue}
          mahaLord={translations.dashaPlanetValue}
          bhuktiLord={translations.bhuktiPlanetValue}
          elementName={premiumData?.soulMirror?.elemental?.dominantElementName}
          lang={langKey}
        />
      </div>

      {/* ── Characteristics Section ───────────────────────────────────────── */}
      {hasContent(premiumData?.characteristics) && (
        <div data-section="characteristics" className={sectionClass}>
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

      {/* ── Dark Secret Section (Hidden for children below 8 years old) ───────────────────────────────────────────── */}
      {!isChildUnder8 && hasContent(premiumData?.darkSecret) && (
        <div data-section="dark-secret" className={sectionClass}>
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

      {/* ── Present Planetary Influence & Divine Guidance Section ───────────────────── */}
      {hasContent(premiumData?.currentPhase) && (
        <div data-section="current-phase" className={sectionClass}>
          <h2 className="text-3xl font-bold text-amber-900 leading-normal border-b-2 border-amber-700/30 pb-2 mb-8">
            {translations.currentPhaseGuidanceTitle || translations.currentPhaseTitle || translations.title || "Present Planetary Influence & Divine Guidance"}
          </h2>
          <div className="space-y-10">
            {premiumData!.currentPhase!.map((cp, idx) => (
              <div key={idx} className="space-y-6">
                {(cp.impact || "").split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sacred Karmic Inquest & Turning Point ─────────────────────────── */}
      {premiumData?.maandiInquest && (
        <div data-section="maandi-inquest" className={sectionClass}>
          <div className="rounded-xl border-2 border-amber-700/60 bg-amber-100/40 p-8 shadow-md relative overflow-hidden">
            <div className="absolute inset-2 border border-dashed border-amber-700/30 rounded-lg pointer-events-none" />
            <div className="flex items-center gap-3 border-b-2 border-amber-700/40 pb-3 mb-6 relative z-10">
              <span className="text-3xl text-amber-800">✧</span>
              <h2 className={`text-3xl font-extrabold ${primaryColorClass} leading-normal tracking-normal`}>
                {premiumData.maandiInquest.title}
              </h2>
            </div>
            <div className="space-y-6 relative z-10">
              <p className="text-xl leading-loose text-amber-950 text-justify font-medium break-words">
                {premiumData.maandiInquest.paragraph1}
              </p>
              <p className="text-xl leading-loose text-amber-950 text-justify font-medium break-words pt-4 border-t border-amber-700/20">
                {premiumData.maandiInquest.paragraph2}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Life Stage Predictions ────────────────────────────────────────── */}
      {Object.entries(groupedPredictions).map(([category, preds]) => (
        <div data-section="life-predictions" key={category} className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-8`}>
            {category}
          </h2>
          <div className="space-y-10">
            {preds.map((pred, idx) => (
              <div key={idx} className="space-y-6">
                {(pred.translatedText || "").split('\n').filter(p => p.trim() !== '').map((paragraph, pIdx) => {
                  const trimmed = paragraph.trim();
                  const isDoshaOrShield = trimmed.startsWith('【') || trimmed.startsWith('[');
                  if (isDoshaOrShield) {
                    const isAffliction = /ದೋಷ|ಅರಿಷ್ಟ|ಪೀಡಾ|ಬಾಧೆ|Dosha|Affliction|Obstacle|Remedy|Dosh|दोष|దోష|தோஷ/i.test(trimmed);
                    const isBenefic = !isAffliction;
                    const boxStyle = isBenefic
                      ? "bg-emerald-50/90 border border-emerald-300/80 rounded-xl text-emerald-950 p-6 shadow-sm text-xl leading-loose text-left font-medium break-words whitespace-pre-wrap"
                      : "bg-rose-50/90 border border-rose-300/80 rounded-xl text-rose-950 p-6 shadow-sm text-xl leading-loose text-left font-medium break-words whitespace-pre-wrap";
                    return (
                      <div
                        key={pIdx}
                        className={boxStyle}
                      >
                        {paragraph}
                      </div>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ── Yogas Section ────────────────────────────────────────────────── */}
      {hasContent(premiumData?.yogas) && (
        <div data-section="yogas" className={sectionClass}>
          <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal border-b-2 border-amber-700/30 pb-2 mb-8`}>
            {translations.yogasTitle}
          </h2>
          <div className="space-y-10">
            {premiumData!.yogas!.map((yoga, idx) => (
              <div key={idx} className="space-y-6">
                <h3 className="text-2xl font-bold text-amber-900 mb-2 bg-amber-200/60 inline-block px-3 py-1 rounded shadow-sm">{yoga.name.replace(/^[\s:,\.\-–—×*•~|]+/gu, "")}</h3>
                {(yoga.impact || "")
                  .split('\n')
                  .map(p => p.replace(/^[\s:,\.\-–—×*•~|]+(?=[^\s:,\.\-–—×*•~|])/gu, "").replace(/^[\s:,\.\-–—×*•~|]+/gu, "").trim())
                  .filter(p => p.length > 0)
                  .map((paragraph, pIdx) => (
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
        <div data-section="doshas" className={sectionClass}>
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
        <div data-section="gochara" className={sectionClass}>
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

      {/* ── Sovereign Dasha-Gochara Synthesis: Shani-Guru Compass & Golden Windows ── */}
      {premiumData?.dashaGocharaCompass && (
        <div data-section="dasha-gochara-compass" className={sectionClass}>
          <div className="border-b-2 border-amber-700/30 pb-3 mb-8">
            <h2 className="text-3xl font-bold text-amber-950 leading-normal flex items-center justify-between">
              <span>{translations.dashaGocharaCompassTitle || premiumData.dashaGocharaCompass.title}</span>
              <span className="text-xl font-normal text-amber-800 bg-amber-100/70 border border-amber-900/10 px-3 py-1 rounded-full shadow-sm">
                {translations.dashaGocharaCompassSubtitle || premiumData.dashaGocharaCompass.subtitle}
              </span>
            </h2>
          </div>

          {/* 4 Cosmic Badges Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Shani Gochara Badge */}
            <div className={`p-4 rounded-xl border ${premiumData.dashaGocharaCompass.shaniBadge.isAdverse ? 'bg-amber-50/90 border-amber-700/30' : 'bg-amber-50/60 border-amber-900/20'} shadow-sm`}>
              <div className="text-xs uppercase tracking-wider font-bold text-amber-800 mb-1">
                {premiumData.dashaGocharaCompass.shaniBadge.title}
              </div>
              <div className="text-2xl font-bold text-amber-950 mb-1">
                {premiumData.dashaGocharaCompass.shaniBadge.status}
              </div>
              <div className="text-sm font-medium text-amber-900/80">
                {premiumData.dashaGocharaCompass.shaniBadge.houseText}
              </div>
            </div>

            {/* Guru Bala Badge */}
            <div className={`p-4 rounded-xl border ${premiumData.dashaGocharaCompass.guruBadge.isBenefic ? 'bg-amber-100/60 border-amber-600/40' : 'bg-stone-50 border-stone-300'} shadow-sm`}>
              <div className="text-xs uppercase tracking-wider font-bold text-amber-800 mb-1">
                {premiumData.dashaGocharaCompass.guruBadge.title}
              </div>
              <div className="text-2xl font-bold text-amber-950 mb-1">
                {premiumData.dashaGocharaCompass.guruBadge.status}
              </div>
              <div className="text-sm font-medium text-amber-900/80">
                {premiumData.dashaGocharaCompass.guruBadge.houseText}
              </div>
            </div>

            {/* Dasha Synergy Badge */}
            <div className="p-4 rounded-xl border border-amber-900/20 bg-amber-50/60 shadow-sm">
              <div className="text-xs uppercase tracking-wider font-bold text-amber-800 mb-1">
                {premiumData.dashaGocharaCompass.dashaBadge.title}
              </div>
              <div className="text-xl font-bold text-amber-950 mb-1">
                {premiumData.dashaGocharaCompass.dashaBadge.eraText}
              </div>
              <div className="text-sm font-medium text-amber-900/80">
                {premiumData.dashaGocharaCompass.dashaBadge.confluenceText}
              </div>
            </div>

            {/* Sri Gokarna Sacred Shield & Parihara Badge */}
            <div className="p-4 rounded-xl border border-amber-700/30 bg-amber-100/40 shadow-sm">
              <div className="text-xs uppercase tracking-wider font-bold text-amber-900 mb-1">
                {premiumData.dashaGocharaCompass.pariharaBadge.title}
              </div>
              <div className="text-xl font-bold text-amber-950 mb-1">
                {premiumData.dashaGocharaCompass.pariharaBadge.sankalpaText}
              </div>
              <div className="text-sm font-medium text-amber-900/80">
                {premiumData.dashaGocharaCompass.pariharaBadge.templeText}
              </div>
            </div>
          </div>

          {/* 4 Golden Life Pillars Grid */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-amber-900/20 bg-white/70 shadow-sm">
                <h4 className="text-lg font-bold text-amber-900 mb-2 border-b border-amber-900/10 pb-1">
                  {premiumData.dashaGocharaCompass.pillars.career.title}
                </h4>
                <p className="text-base leading-relaxed text-amber-950 font-medium">
                  {premiumData.dashaGocharaCompass.pillars.career.text}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-amber-900/20 bg-white/70 shadow-sm">
                <h4 className="text-lg font-bold text-amber-900 mb-2 border-b border-amber-900/10 pb-1">
                  {premiumData.dashaGocharaCompass.pillars.wealth.title}
                </h4>
                <p className="text-base leading-relaxed text-amber-950 font-medium">
                  {premiumData.dashaGocharaCompass.pillars.wealth.text}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-amber-900/20 bg-white/70 shadow-sm">
                <h4 className="text-lg font-bold text-amber-900 mb-2 border-b border-amber-900/10 pb-1">
                  {premiumData.dashaGocharaCompass.pillars.family.title}
                </h4>
                <p className="text-base leading-relaxed text-amber-950 font-medium">
                  {premiumData.dashaGocharaCompass.pillars.family.text}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-amber-900/20 bg-white/70 shadow-sm">
                <h4 className="text-lg font-bold text-amber-900 mb-2 border-b border-amber-900/10 pb-1">
                  {premiumData.dashaGocharaCompass.pillars.shield.title}
                </h4>
                <p className="text-base leading-relaxed text-amber-950 font-medium">
                  {premiumData.dashaGocharaCompass.pillars.shield.text}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Deep Vedic Narrative Paragraphs */}
          <div className="space-y-6">
            <p className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
              {premiumData.dashaGocharaCompass.paragraph1}
            </p>
            <p className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
              {premiumData.dashaGocharaCompass.paragraph2}
            </p>
            <p className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
              {premiumData.dashaGocharaCompass.paragraph3}
            </p>
          </div>
        </div>
      )}

      {/* ── 6-Month Planetary Journey Map ────────────────────────────────── */}
      {hasContent(premiumData?.timeline) && (
        <div data-section="timeline" className={sectionClass}>
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

      {/* ── Next 1-Year Master Forecast & Cosmic Dasha-Gochara Vision ─────── */}
      {hasContent(premiumData?.annualForecast) && (
        <div data-section="annual-forecast" className={sectionClass}>
          <div className="flex items-center gap-3 border-b-2 border-amber-700/30 pb-3 mb-8">
            <span className="text-3xl text-amber-800">✦</span>
            <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal`}>
              {translations.annualForecastTitle || (langKey === 'kn' ? "ಮುಂದಿನ ೧ ವರ್ಷದ ಮಹತ್ವದ ಭವಿಷ್ಯ ಹಾಗೂ ಗೋಚಾರ-ದಶಾಫಲ" : "Next 1-Year Master Forecast & Cosmic Dasha-Gochara Vision")}
            </h2>
          </div>
          <div className="space-y-6">
            {premiumData!.annualForecast!.map((item, idx) => (
              <div key={idx} className="space-y-6">
                {(item.impact || "").split(/\n\n+/).filter(p => p.trim() !== '').map((paragraph, pIdx) => {
                  const trimmed = paragraph.trim();
                  const isHeader = trimmed.startsWith("【") && trimmed.includes("】");
                  if (isHeader) {
                    const headerEnd = trimmed.indexOf("】") + 1;
                    const headerPart = trimmed.substring(0, headerEnd);
                    const restPart = trimmed.substring(headerEnd).trim();
                    return (
                      <div key={pIdx} className="p-6 rounded-xl border-2 border-amber-600/50 bg-gradient-to-br from-amber-100/70 via-orange-50/50 to-amber-100/50 shadow-md relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-amber-900 font-bold text-2xl font-serif">{headerPart}</span>
                        </div>
                        {restPart && (
                          <p className="text-xl leading-loose text-amber-950 font-medium text-left break-words whitespace-pre-wrap">
                            {restPart}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div key={pIdx} className="p-6 rounded-xl border border-amber-800/30 bg-amber-100/30 shadow-sm">
                      <p className="text-xl leading-loose text-amber-950 font-medium text-left break-words whitespace-pre-wrap">
                        {trimmed}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Astrologer's Summary ──────────────────────────────────────────── */}
      {hasContent(premiumData?.summary) && (
        <div data-section="summary" id="pdf-section-summary" className={sectionClass}>
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

      {/* ── Royal Astro-Vedic Prescriptions ─────────────────────────────────── */}
      {premiumData?.prescriptions && (
        <div data-section="prescriptions" className={sectionClass}>
          <div className="flex items-center gap-3 border-b-2 border-amber-700/30 pb-3 mb-8">
            <span className="text-3xl text-amber-700">❖</span>
            <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal`}>
              {translations.prescriptionsTitle || "Royal Astro-Vedic Prescriptions & Sacred Alignments"}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-4">
            {/* Lucky Gemstone */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">💎</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.gemstoneLabel || "Lucky Gemstone"}
                </span>
              </div>
              <p className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.gemstone}
              </p>
            </div>

            {/* Sacred Rudraksha */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">📿</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.rudrakshaLabel || "Sacred Rudraksha"}
                </span>
              </div>
              <p className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.rudraksha}
              </p>
            </div>

            {/* Ishta Devata */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">🔱</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.ishtaDevataLabel || "Ishta Devata"}
                </span>
              </div>
              <p className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.ishtaDevata}
              </p>
            </div>

            {/* Auspicious Colors */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">🎨</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.luckyColorsLabel || "Auspicious Colors"}
                </span>
              </div>
              <p className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.luckyColors}
              </p>
            </div>

            {/* Auspicious Days */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">🗓️</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.luckyDaysLabel || "Auspicious Days"}
                </span>
              </div>
              <p className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.luckyDays}
              </p>
            </div>

            {/* Auspicious Numbers & Direction */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">🧭</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.luckyNumbersLabel || "Auspicious Numbers"} &amp; {translations.luckyDirectionLabel || "Direction"}
                </span>
              </div>
              <p className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.luckyNumbers} • {premiumData.prescriptions.luckyDirection}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Sanskrit Shloka ───────────────────────────────────────────────── */}
      <div data-section="shloka" className="pdf-section w-full px-16 my-4">
        <div className={`text-center px-20 py-14 border-y-[3px] border-double ${borderColorClass} bg-amber-100/30`}>
          <p className="text-3xl font-bold leading-loose text-amber-900" style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>
            {shloka}
          </p>
        </div>
      </div>

      {/* ── Astrologer's Blessing ─────────────────────────────────────────── */}
      <div data-section="ashirvada" className="pdf-section mt-4 text-center px-20 pb-20">
        <div className="text-6xl text-amber-600 mb-6 drop-shadow-md opacity-90" style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>ॐ</div>
        <h3 className={`text-3xl font-bold mb-8 italic ${primaryColorClass} leading-normal`}>
          {translations.ashirvadaTitle}
        </h3>
        <p className="text-2xl leading-loose font-medium text-amber-950 text-center">
          "{translations.ashirvadaValue}"
        </p>
        {translations.priestSeal && (
          <div className="mt-8 mx-auto max-w-3xl px-6 py-2.5 rounded-full border border-amber-600/40 bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-500/10 text-amber-950 font-bold text-sm tracking-wide drop-shadow-sm flex items-center justify-center gap-3">
            <span className="text-amber-600 text-base">✦</span>
            <span>{translations.priestSeal}</span>
            <span className="text-amber-600 text-base">✦</span>
          </div>
        )}
        <div className="flex items-center justify-center gap-6 opacity-80 mt-12 mb-10">
          <span className="text-3xl text-amber-700">✧</span>
        </div>
        <div className="mt-8 text-center text-amber-800 text-base font-bold uppercase pb-8 pt-8 leading-normal border-t border-amber-700/30">
          {translations.footer || "Baggona Panchanga Publication"}
        </div>
      </div>
    </div>
  );
});

PdfTemplate.displayName = 'PdfTemplate';
