import React, { forwardRef } from 'react';
import type { TranslatedPrediction } from './usePredictionEngine';
import type { KundliViewerSession } from '../../stores/kundliViewerStore';
import { CosmicDashaAuraVisual } from './CosmicDashaAuraVisual';
import { cleanEnglishFromRegionalText } from '../../features/premiumPdf/premiumPdfLocale';
import { cleanDegreesFromText, cleanPunctuationArtifacts } from '../../features/premiumPdf/yogaDoshaGocharaEnricher';
import { ensureNamePresence, ensureCompleteSentences, getLocalizedDevoteeName } from '../../features/premiumPdf/dynamicBhavishyaEngine';

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
  neckWearLabel?: string;
  prohibitedGemsLabel?: string;
  rudrakshaLabel?: string;
  ishtaDevataLabel?: string;
  luckyColorsLabel?: string;
  avoidColorsLabel?: string;
  consecrationMuhurthaLabel?: string;
  luckyDaysLabel?: string;
  luckyNumbersLabel?: string;
  luckyDirectionLabel?: string;
  soulMirrorTitle?: string;
  elementalBalanceTitle?: string;
  cosmicShieldTitle?: string;
  mindVitalityTitle?: string;
  bhavishyaTitle?: string;
  characteristicsTitle: string;
  characteristicsQuestion?: string;
  darkSecretTitle: string;
  darkSecretQuestion?: string;
  currentPhaseTitle?: string;
  currentPhaseGuidanceTitle?: string;
  currentPhaseQuestion?: string;
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
    neckWear?: string;
    prohibitedGems?: string;
    avoidColors?: string;
    consecrationMuhurtha?: string;
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
        return `'Noto Serif Kannada', 'Noto Sans Kannada', serif, sans-serif`;
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

  const rawDevoteeName = session?.input?.name || translations.nameValue || "";
  const localizedDevoteeName = getLocalizedDevoteeName(rawDevoteeName, langKey);

  const cleanPara = (text: string, weaveName: boolean = false): string => {
    if (!text) return "";
    let s = text;
    if (weaveName && localizedDevoteeName) {
      s = ensureNamePresence(s, localizedDevoteeName, langKey);
    }
    s = langKey === "en" ? s : cleanEnglishFromRegionalText(s, langKey);
    s = cleanDegreesFromText(s);
    s = cleanPunctuationArtifacts(s);
    s = ensureCompleteSentences(s, langKey);
    return s;
  };

  /**
   * Cleans an entire multi-paragraph section narrative as a single cohesive unit.
   * Ensures devotee's name is woven respectfully ONCE in paragraph 0, collapses stacked
   * duplicate greetings, strips redundant greetings from subsequent paragraphs,
   * expands single-letter abbreviations (e.g. "ಮ, "), and prevents dangling cutoff endings.
   */
  const cleanSectionNarrative = (rawText: string, options?: { weaveName?: boolean }): string[] => {
    if (!rawText) return [];
    let s = rawText;
    const shouldWeave = options?.weaveName !== false;
    if (shouldWeave && localizedDevoteeName) {
      s = ensureNamePresence(s, localizedDevoteeName, langKey);
    }
    s = langKey === "en" ? s : cleanEnglishFromRegionalText(s, langKey);
    s = cleanDegreesFromText(s);
    s = cleanPunctuationArtifacts(s);
    s = ensureCompleteSentences(s, langKey);

    return s
      .split('\n')
      .map(p => p.replace(/^[\s:,\.\-–—×*•~|]+(?=[^\s:,\.\-–—×*•~|])/gu, "").replace(/^[\s:,\.\-–—×*•~|]+/gu, "").trim())
      .filter(p => p.length > 0);
  };

  // ─── 10-Chapter Sovereign Header & Inquest Helpers ──────────────────────────
  const getChapterHeaderData = (
    chapterNum: number,
    defaultKnTitle: string,
    defaultEnTitle: string,
    currentTitle?: string
  ) => {
    const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯", "೧೦"];
    let badgeText = "";
    if (langKey === "kn") badgeText = `ಅಧ್ಯಾಯ ${knDigits[chapterNum] || chapterNum}`;
    else if (langKey === "hi") badgeText = `अध्याय ${knDigits[chapterNum] || chapterNum}`;
    else if (langKey === "te") badgeText = `అధ్యాయం ${chapterNum}`;
    else if (langKey === "ta") badgeText = `அத்தியாயம் ${chapterNum}`;
    else badgeText = `Chapter ${chapterNum}`;

    let rawTitle = (currentTitle || (langKey === "kn" ? defaultKnTitle : defaultEnTitle)).trim();
    // Clean any leading duplicate chapter prefix from rawTitle so we don't get "ಅಧ್ಯಾಯ ೨: ಅಧ್ಯಾಯ ೨"
    const cleanedTitle = rawTitle.replace(/^(ಅಧ್ಯಾಯ|अध्याय|అధ్యాయం|அத்தியாயம்|Chapter)\s*[\d೦-೯०-९IIVX]+[\s:,\.\-–—|]+/iu, "").trim();

    return {
      badge: badgeText,
      fullTitle: `${badgeText}: ${cleanedTitle || rawTitle}`
    };
  };

  const renderChapterBanner = (chapterNum: number, icon: string, defaultKn: string, defaultEn: string, currentTitle?: string) => {
    const { badge, fullTitle } = getChapterHeaderData(chapterNum, defaultKn, defaultEn, currentTitle);
    return (
      <div className="border-b-2 border-amber-700/40 pb-4 mb-8 relative">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-800/10 text-amber-900 rounded-full border border-amber-800/30">
            <span className="text-amber-800 text-sm">{icon}</span>
            <span className="text-xs font-black tracking-widest uppercase">
              {badge}
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-800/60 text-sm font-serif">
            <span>❖</span>
            <span className="h-px w-12 bg-amber-700/30"></span>
            <span>ॐ</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-amber-950 font-serif tracking-normal leading-relaxed">
          {fullTitle}
        </h2>
      </div>
    );
  };

  const renderDashboardBanner = (icon: string, badgeKn: string, badgeEn: string, title: string) => {
    const badgeText = langKey === "kn" ? badgeKn : badgeEn;
    return (
      <div className="border-b-2 border-amber-700/40 pb-4 mb-6 relative">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-800/10 text-amber-900 rounded-full border border-amber-800/30">
            <span className="text-amber-800 text-sm">{icon}</span>
            <span className="text-xs font-black tracking-widest uppercase">
              {badgeText}
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-800/60 text-sm font-serif">
            <span>❖</span>
            <span className="h-px w-12 bg-amber-700/30"></span>
            <span>ॐ</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-amber-950 font-serif leading-relaxed">
          {title}
        </h2>
      </div>
    );
  };

  const renderContemplationRibbon = (icon: string, labelKn: string, labelEn: string, questionText?: string) => {
    if (!questionText) return null;
    return (
      <div className="rounded-xl border-2 border-amber-700/30 bg-gradient-to-r from-amber-100/90 via-orange-50/80 to-amber-100/90 p-5 mb-8 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 text-amber-900 text-xs font-black tracking-widest uppercase">
          <span className="text-amber-800">{icon}</span>
          <span>{langKey === "kn" ? labelKn : labelEn}</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl text-amber-800 leading-none pt-0.5">❖</span>
          <p className="text-lg font-bold text-amber-950 leading-relaxed font-serif italic">
            {questionText}
          </p>
        </div>
      </div>
    );
  };

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
          {renderChapterBanner(
            1,
            "✦",
            "ಅಂತರಂಗದ ತ್ರಿವಿಧ ಸತ್ಯಗಳು ಹಾಗೂ ಪಂಚಭೂತ ಚೇತನ ಶಕ್ತಿ",
            "The Sacred Soul Mirror & Cosmic Elemental Vitality",
            translations.soulMirrorTitle
          )}

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
        {renderDashboardBanner(
          "🪐",
          "ಕುಂಡಲಿ ರಕ್ಷಾ ಕವಚ & ದಶಾಧಿಪತಿ ದರ್ಶನ",
          "NATAL PROTECTIVE SHIELD & RULING PLANET AURA",
          translations.cosmicAuraTitle || (langKey === 'kn' ? "ಪ್ರಸ್ತುತ ನಿಮ್ಮನ್ನು ನಡೆಸುತ್ತಿರುವ ದಶಾಧಿಪತಿ ಗ್ರಹ ಹಾಗೂ ಜನ್ಮ ಕುಂಡಲಿ ರಕ್ಷಾ ಕವಚ" : "Your Active Ruling Mahadasha Planet & Natal Protective Shield")
        )}
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

      {/* ── Chapter 2: Characteristics Section ────────────────────────────── */}
      {hasContent(premiumData?.characteristics) && (
        <div data-section="characteristics" className={sectionClass}>
          {renderChapterBanner(
            2,
            "👑",
            "ಜನ್ಮ ಲಗ್ನ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ನೈಜ ಗುಣಲಕ್ಷಣಗಳು",
            "Natal Personality & Inherent Characteristics",
            translations.characteristicsTitle
          )}
          {renderContemplationRibbon(
            "✨",
            "ದೈವಜ್ಞ ಜನ್ಮ ಕುಂಡಲಿ ವಿಚಾರ & ತತ್ತ್ವ ಚಿಂತನೆ",
            "Sacred Astrological Inquest & Contemplation",
            translations.characteristicsQuestion
          )}
          <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
            <div className="absolute top-3 left-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute top-3 right-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute bottom-3 left-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute bottom-3 right-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>

            {premiumData!.characteristics!.map((char, idx) => (
              <div key={idx} className="space-y-6" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                {cleanSectionNarrative(char.impact || "").map((cleaned, pIdx) => {
                  const trimmed = cleaned.trim();
                  const isShield = trimmed.startsWith('【') || trimmed.startsWith('[');
                  if (isShield) {
                    return (
                      <div
                        key={pIdx}
                        className="bg-amber-100/90 border-2 border-amber-600/60 rounded-xl text-amber-950 p-6 shadow-sm text-xl leading-relaxed text-left font-medium break-words whitespace-pre-wrap"
                      >
                        {cleaned}
                      </div>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-xl leading-relaxed text-amber-950 text-justify font-medium break-words whitespace-pre-wrap">
                      {cleaned}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chapter 3: Dark Secret Section (Niguda Rahasya) ───────────────── */}
      {!isChildUnder8 && hasContent(premiumData?.darkSecret) && (
        <div data-section="dark-secret" className={sectionClass}>
          {renderChapterBanner(
            3,
            "🔮",
            "ಅಂತರಂಗದ ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಕರ್ಮ ಸತ್ಯ",
            "Soul Pattern & Inner Truth (Niguda Rahasya)",
            translations.darkSecretTitle
          )}
          {renderContemplationRibbon(
            "🔮",
            "ಅಂತರಂಗದ ನಿಗೂಢ ಸತ್ಯ & ಸುಪ್ತಪ್ರಜ್ಞೆ ವಿಚಾರ",
            "Niguda Rahasya: Subconscious Reality & Karmic Inquest",
            translations.darkSecretQuestion
          )}
          <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
            <div className="absolute top-3 left-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute top-3 right-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute bottom-3 left-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute bottom-3 right-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>

            {premiumData!.darkSecret!.map((ds, idx) => (
              <div key={idx} className="space-y-6" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                {cleanSectionNarrative(ds.impact || "").map((cleaned, pIdx) => {
                  const trimmed = cleaned.trim();
                  const isShield = trimmed.startsWith('【') || trimmed.startsWith('[');
                  if (isShield) {
                    return (
                      <div
                        key={pIdx}
                        className="bg-amber-100/90 border-2 border-amber-600/60 rounded-xl text-amber-950 p-6 shadow-sm text-xl leading-relaxed text-left font-medium break-words whitespace-pre-wrap"
                      >
                        {cleaned}
                      </div>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-xl leading-relaxed text-amber-950 text-justify font-medium break-words whitespace-pre-wrap">
                      {cleaned}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chapter 4: Present Planetary Influence & Divine Guidance ──────── */}
      {hasContent(premiumData?.currentPhase) && (
        <div data-section="current-phase" className={sectionClass}>
          {renderChapterBanner(
            4,
            "⏳",
            "ಪ್ರಸ್ತುತ ದಶಾ ಫಲ ಹಾಗೂ ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ",
            "Present Planetary Influence & Divine Guidance",
            translations.currentPhaseGuidanceTitle || translations.currentPhaseTitle
          )}
          {renderContemplationRibbon(
            "⏳",
            "ವರ್ತಮಾನ ಕಾಲ ಸ್ಥಿತಿಗತಿ & ಗ್ರಹ ಸಂಚಾರ ವಿಚಾರ",
            "Current Planetary Inquest & Living Reality",
            translations.currentPhaseQuestion
          )}
          <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
            <div className="absolute top-3 left-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute top-3 right-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute bottom-3 left-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute bottom-3 right-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>

            {premiumData!.currentPhase!.map((cp, idx) => (
              <div key={idx} className="space-y-6" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                {cleanSectionNarrative(cp.impact || "").map((cleaned, pIdx) => {
                  const trimmed = cleaned.trim();
                  const isShield = trimmed.startsWith('【') || trimmed.startsWith('[');
                  if (isShield) {
                    return (
                      <div
                        key={pIdx}
                        className="bg-amber-100/90 border-2 border-amber-600/60 rounded-xl text-amber-950 p-6 shadow-sm text-xl leading-relaxed text-left font-medium break-words whitespace-pre-wrap"
                      >
                        {cleaned}
                      </div>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-xl leading-relaxed text-amber-950 text-justify font-medium break-words whitespace-pre-wrap">
                      {cleaned}
                    </p>
                  );
                })}
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

      {/* ── Chapter 5: Life Stage Predictions ────────────────────────────── */}
      {Object.entries(groupedPredictions).map(([category, preds], catIdx) => (
        <div data-section="life-predictions" key={category} className={sectionClass}>
          {catIdx === 0 && (
            <div className="mb-6">
              {renderChapterBanner(
                5,
                "🏛️",
                "ಪಂಚಮುಖ ಜೀವಮಾನ ಭವಿಷ್ಯ",
                "Five Core Life Stage Predictions",
                translations.bhavishyaTitle || (langKey === 'kn' ? "ಪಂಚಮುಖ ಜೀವಮಾನ ಭವಿಷ್ಯ (೫ ಪ್ರಮುಖ ಆಯಾಮಗಳು)" : "Five Core Life Stage Predictions")
              )}
            </div>
          )}
          <div className="flex items-center gap-3 border-b-2 border-amber-700/30 pb-3 mb-6">
            <span className="text-2xl text-amber-800">❖</span>
            <h2 className={`text-3xl font-bold ${primaryColorClass} leading-normal`}>
              {category}
            </h2>
          </div>
          <div className="space-y-8">
            {preds.map((pred, idx) => (
              <div key={idx} className="space-y-5">
                {pred.question && renderContemplationRibbon(
                  "✨",
                  "ದೈವಜ್ಞ ಪ್ರಶ್ನೋತ್ತರ ವಿಚಾರ & ಮಾರ್ಗದರ್ಶನ",
                  "Devotee Inquest & Sacred Astrological Guidance",
                  pred.question
                )}
                {cleanSectionNarrative(pred.translatedText || "").map((cleaned, pIdx) => {
                  const trimmed = cleaned.trim();
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
                        {cleaned}
                      </div>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                      {cleaned}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ── Chapter 6: Yogas Section ────────────────────────────────────────── */}
      {hasContent(premiumData?.yogas) && (
        <div data-section="yogas" className={sectionClass}>
          {renderChapterBanner(
            6,
            "👑",
            "ಶುಭ ರಾಜಯೋಗಗಳು ಹಾಗೂ ಜನ್ಮ ಕುಂಡಲಿ ಶಕ್ತಿ",
            "Auspicious Natal Yogas & Planetary Combinations",
            translations.yogasTitle
          )}
          <div className="space-y-8">
            {premiumData!.yogas!.map((yoga, idx) => (
              <div key={idx} className="rounded-xl border border-amber-700/30 bg-amber-50/70 p-6 shadow-sm space-y-4" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                <div className="flex items-center gap-2 border-b border-amber-700/20 pb-2">
                  <span className="text-xl text-amber-800">👑</span>
                  <h3 className="text-2xl font-bold text-amber-950 font-serif">
                    {cleanPara(yoga.name.replace(/^[\s:,\.\-–—×*•~|]+/gu, ""))}
                  </h3>
                </div>
                {cleanSectionNarrative(yoga.impact || "").map((cleaned, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {cleaned}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chapter 7: Doshas Section ───────────────────────────────────────── */}
      {hasContent(premiumData?.doshas) && (
        <div data-section="doshas" className={sectionClass}>
          {renderChapterBanner(
            7,
            "🛡️",
            "ಕರ್ಮ ಸವಾಲುಗಳು ಹಾಗೂ ದೋಷ ಪರಿಹಾರ ಮಾರ್ಗ",
            "Karmic Doshas, Life Obstacles & Sacred Remedies",
            translations.doshasTitle
          )}
          <div className="space-y-8">
            {premiumData!.doshas!.map((dosha, idx) => (
              <div key={idx} className="rounded-xl border border-rose-300/80 bg-rose-50/70 p-6 shadow-sm space-y-4" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                <div className="flex items-center gap-2 border-b border-rose-200 pb-2">
                  <span className="text-xl text-rose-800">🛡️</span>
                  <h3 className="text-2xl font-bold text-rose-950 font-serif">{cleanPara(dosha.name)}</h3>
                </div>
                {cleanSectionNarrative(dosha.impact || "").map((cleaned, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {cleaned}
                  </p>
                ))}
                {dosha.remedy && (
                  <div className="mt-4 pt-4 border-t border-rose-200 bg-amber-50/80 -mx-6 -mb-6 p-6 rounded-b-xl border-t border-amber-300">
                    <h4 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <span>✨</span>
                      <span>{translations.remedyTitle}</span>
                    </h4>
                    <p className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                      {cleanPara(dosha.remedy)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chapter 8: Gochara (Current Planetary Transits) Section ─────────── */}
      {hasContent(premiumData?.gochara) && (
        <div data-section="gochara" className={sectionClass}>
          {renderChapterBanner(
            8,
            "🪐",
            "ಪ್ರಸ್ತುತ ಗ್ರಹ ಸಂಚಾರ ಹಾಗೂ ಗೋಚಾರ ಫಲ",
            "Current Planetary Transits (Gochara Phala)",
            translations.gocharaTitle
          )}
          <div className="space-y-8">
            {premiumData!.gochara!.map((gochara, idx) => (
              <div key={idx} className="rounded-xl border border-amber-700/30 bg-amber-50/70 p-6 shadow-sm space-y-4" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                <div className="flex items-center gap-2 border-b border-amber-700/20 pb-2">
                  <span className="text-xl text-amber-800">🪐</span>
                  <h3 className="text-2xl font-bold text-amber-950 font-serif">{cleanPara(gochara.name)}</h3>
                </div>
                {cleanSectionNarrative(gochara.impact || "").map((cleaned, pIdx) => (
                  <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                    {cleaned}
                  </p>
                ))}
                {gochara.remedy && (
                  <div className="mt-4 pt-4 border-t border-amber-700/20 bg-amber-100/50 -mx-6 -mb-6 p-6 rounded-b-xl">
                    <h4 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <span>✨</span>
                      <span>{translations.remedyTitle}</span>
                    </h4>
                    <p className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                      {cleanPara(gochara.remedy)}
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
              <div className="text-xs font-bold tracking-normal leading-normal text-amber-800 mb-1.5" style={{ letterSpacing: 'normal' }}>
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
              <div className="text-xs font-bold tracking-normal leading-normal text-amber-800 mb-1.5" style={{ letterSpacing: 'normal' }}>
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
              <div className="text-xs font-bold tracking-normal leading-normal text-amber-800 mb-1.5" style={{ letterSpacing: 'normal' }}>
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
              <div className="text-xs font-bold tracking-normal leading-normal text-amber-900 mb-1.5" style={{ letterSpacing: 'normal' }}>
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

      {/* ── Chapter 9: 6-Month Planetary Journey Map ────────────────────────── */}
      {hasContent(premiumData?.timeline) && (
        <div data-section="timeline" className={sectionClass}>
          {renderChapterBanner(
            9,
            "📅",
            "ಮುಂದಿನ ೬ ತಿಂಗಳ ಭವಿಷ್ಯ ಕಾಲಚಕ್ರ ನಕ್ಷೆ",
            "6-Month Planetary Timeline & Journey Map",
            translations.timelineTitle
          )}
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
                <div className="flex-1 bg-white/80 border border-amber-900/20 shadow-sm p-6 rounded-xl mb-2">
                  <span className="text-amber-900 font-bold text-lg bg-amber-100/80 inline-block px-3 py-1 rounded w-fit border border-amber-900/10 shadow-sm mb-3 block font-serif">
                    {item.dateRange}
                  </span>
                  {cleanSectionNarrative(item.impact || "").map((cleaned, pIdx) => (
                    <p key={pIdx} className="text-xl leading-relaxed text-amber-950 font-medium text-left break-words whitespace-pre-wrap">
                      {cleaned}
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
                {cleanSectionNarrative(item.impact || "").map((cleaned, pIdx) => {
                  const trimmed = cleaned.trim();
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

      {/* ── Chapter 10: Astrologer's Summary ───────────────────────────────── */}
      {hasContent(premiumData?.summary) && (
        <div data-section="summary" id="pdf-section-summary" className={sectionClass}>
          {renderChapterBanner(
            10,
            "📜",
            "ದೈವಜ್ಞ ಸಾರಾಂಶ ಹಾಗೂ ಅಂತಿಮ ಮಾರ್ಗದರ್ಶನ",
            "Astrologer's Master Summary & Spiritual Synthesis",
            translations.summaryTitle
          )}
          <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
            <div className="absolute top-3 left-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute top-3 right-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute bottom-3 left-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>
            <div className="absolute bottom-3 right-3 text-xs text-amber-800/40 font-serif pointer-events-none">❖</div>

            {(() => {
              // Deduplicate paragraphs across all summary items to guarantee zero repeated paragraphs
              const allParas: string[] = [];
              const normPrefix = (s: string) => s.replace(/[\s\p{P}]+/gu, "").slice(0, 35);

              (premiumData?.summary || []).forEach((sum) => {
                const cleanedParas = cleanSectionNarrative(sum.impact || "");
                cleanedParas.forEach((cleaned) => {
                  if (!cleaned || cleaned.length < 15) return;
                  const np = normPrefix(cleaned);
                  const exists = allParas.some((existing) => {
                    const ep = normPrefix(existing);
                    return ep === np || existing.includes(cleaned) || cleaned.includes(existing);
                  });
                  if (!exists) {
                    allParas.push(cleaned);
                  }
                });
              });

              return (
                <div className="space-y-6">
                  {allParas.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-xl leading-loose text-amber-950 text-left font-medium break-words whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                </div>
              );
            })()}
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
            {/* 1. Lucky Gemstone (Primary Ring) */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">💎</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.gemstoneLabel || "Lucky Gemstone"}
                </span>
              </div>
              <p className="text-base font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.gemstone}
              </p>
            </div>

            {/* 2. Sacred Neck Wear (Nakshatra Deity & Rudraksha) */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">📿</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.neckWearLabel || "Sacred Neck Wear & Kavacha"}
                </span>
              </div>
              <p className="text-base font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.neckWear || premiumData.prescriptions.rudraksha}
              </p>
            </div>

            {/* 3. Sacred Rudraksha */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">📿</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.rudrakshaLabel || "Sacred Rudraksha"}
                </span>
              </div>
              <p className="text-base font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.rudraksha}
              </p>
            </div>

            {/* 4. Ishta Devata */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">🔱</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.ishtaDevataLabel || "Ishta Devata"}
                </span>
              </div>
              <p className="text-base font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.ishtaDevata}
              </p>
            </div>

            {/* 5. Auspicious Colors */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">🎨</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.luckyColorsLabel || "Auspicious Colors"}
                </span>
              </div>
              <p className="text-base font-bold text-emerald-900 font-serif leading-relaxed">
                {premiumData.prescriptions.luckyColors}
              </p>
            </div>

            {/* 6. Strict Prohibited Colors to Avoid */}
            <div className="bg-red-50/70 border border-red-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-red-700">🚫</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-red-900/80">
                  {translations.avoidColorsLabel || "Strict Avoid Colors"}
                </span>
              </div>
              <p className="text-base font-bold text-red-950 font-serif leading-relaxed">
                {premiumData.prescriptions.avoidColors || "—"}
              </p>
            </div>

            {/* 7. Auspicious Days, Numbers & Direction */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">🧭</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.luckyDaysLabel || "Auspicious Days"} &amp; {translations.luckyDirectionLabel || "Direction"}
                </span>
              </div>
              <p className="text-base font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.luckyDays} • {translations.luckyNumbersLabel || "Numbers"}: {premiumData.prescriptions.luckyNumbers} • {premiumData.prescriptions.luckyDirection}
              </p>
            </div>

            {/* 8. Consecration Muhurtha & Activation */}
            <div className="bg-white/80 border border-amber-900/20 p-5 rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-amber-800">⏳</span>
                <span className="text-sm font-extrabold tracking-normal leading-normal text-amber-900/80">
                  {translations.consecrationMuhurthaLabel || "Consecration & Activation Muhurtha"}
                </span>
              </div>
              <p className="text-base font-bold text-amber-950 font-serif leading-relaxed">
                {premiumData.prescriptions.consecrationMuhurtha || "—"}
              </p>
            </div>
          </div>

          {/* Strictly Prohibited Gemstones Alert Banner */}
          {premiumData.prescriptions.prohibitedGems && (
            <div className="mt-4 bg-gradient-to-r from-red-50 via-amber-50 to-red-50 border-2 border-red-700/40 p-5 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl text-red-700">⚠️</span>
                <span className="text-base font-black tracking-normal leading-normal text-red-900 uppercase">
                  {translations.prohibitedGemsLabel || "Strictly Prohibited Gemstones Alert"}
                </span>
              </div>
              <p className="text-base font-bold text-red-950 font-serif leading-relaxed">
                {premiumData.prescriptions.prohibitedGems}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Sanskrit Shloka & Sacred Astrologer's Ashirvada Blessing ──────── */}
      <div data-section="ashirvada" className="pdf-section w-full px-14 pt-8 pb-32 text-center relative">
        {/* Sacred Sanskrit Shloka */}
        <div className={`text-center px-16 py-10 mb-8 border-y-[3px] border-double ${borderColorClass} bg-amber-100/30`}>
          <p className="text-3xl font-bold leading-loose text-amber-900" style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>
            {shloka}
          </p>
        </div>

        {/* Sacred ॐ Emblem */}
        <div className="text-6xl text-amber-600 mb-6 opacity-90" style={{ fontFamily: 'Noto Sans Devanagari, serif' }}>ॐ</div>
        
        {/* Ashirvada Title */}
        <h3 className={`text-3xl font-bold mb-6 italic ${primaryColorClass} leading-normal`}>
          {translations.ashirvadaTitle}
        </h3>
        
        {/* Personalized Dynamic Ashirvada Blessing */}
        <p className="text-2xl leading-loose font-medium text-amber-950 text-center max-w-3xl mx-auto px-4">
          "{translations.ashirvadaValue}"
        </p>

        {/* Official Priest Seal */}
        {translations.priestSeal && (
          <div 
            className="mt-8 mx-auto max-w-4xl px-8 py-3 rounded-full border border-amber-600/40 bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-500/10 text-amber-950 font-bold text-sm tracking-normal shadow-xs flex items-center justify-center gap-3"
            style={{ letterSpacing: 'normal' }}
          >
            <span className="text-amber-600 text-base flex-shrink-0">✦</span>
            <span className="tracking-normal leading-relaxed text-center" style={{ letterSpacing: 'normal' }}>
              {translations.priestSeal}
            </span>
            <span className="text-amber-600 text-base flex-shrink-0">✦</span>
          </div>
        )}

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-6 opacity-80 mt-10 mb-8">
          <span className="text-3xl text-amber-700">✧</span>
        </div>

        {/* Publication Footer with Generous Bottom Clearance */}
        <div className="mt-6 text-center text-amber-800 text-base font-bold uppercase pb-12 pt-6 leading-normal border-t border-amber-700/30">
          {translations.footer || "Baggona Panchanga Publication"}
        </div>
      </div>
    </div>
  );
});

PdfTemplate.displayName = 'PdfTemplate';
