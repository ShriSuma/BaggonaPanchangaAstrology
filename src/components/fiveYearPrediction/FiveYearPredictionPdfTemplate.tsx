import React, { forwardRef } from "react";
import type { FiveYearPredictionPayload } from "../../features/fiveYearPrediction/fiveYearPredictionEngine";
import {
  type SixLang,
  pick6,
  FIVE_YEAR_TEXT_6L,
  formatNumber6L
} from "../../features/fiveYearPrediction/fiveYearLocale";

interface Props {
  data: FiveYearPredictionPayload | null;
}

export const FiveYearPredictionPdfTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  if (!data) return null;

  const lang = data.targetLanguage;
  const isKn = lang === "kn";
  const isMr = lang === "mr";
  const isHi = lang === "hi";
  const isTe = lang === "te";
  const isTa = lang === "ta";

  const getFontFamily = (l: SixLang): string => {
    switch (l) {
      case "kn":
        return `'Noto Serif Kannada', 'Noto Sans Kannada', serif, sans-serif`;
      case "mr":
      case "hi":
        return `'Noto Sans Devanagari', 'Noto Serif Devanagari', serif, sans-serif`;
      case "te":
        return `'Noto Sans Telugu', serif, sans-serif`;
      case "ta":
        return `'Noto Sans Tamil', serif, sans-serif`;
      case "en":
      default:
        return `'Outfit', 'Cinzel', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    }
  };

  const activeFontFamily = getFontFamily(lang);
  const t = (key: string) => pick6(FIVE_YEAR_TEXT_6L[key], lang);

  // Styling Constants matching Premium PDF V1 (PdfTemplate.tsx)
  const solidBgClass = "bg-orange-50";
  const textColorClass = "text-amber-950";
  const borderColorClass = "border-amber-700/40";
  const primaryColorClass = "text-amber-800";
  const sectionClass = "pdf-section px-12 py-5 relative";

  // Traditional Sacred Invocations
  const sacredInvocation = isKn
    ? "॥ ಶ್ರೀ ಮಹಾಗಣಪತಯೇ ನಮಃ • ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ • ಶ್ರೀ ಕುಲದೇವತಾಯೈ ನಮಃ ॥"
    : isMr
      ? "॥ श्री महागणपतये नमः • श्री गोकर्ण महाबळेश्वराय नमः • श्री कुलदेवतायै नमः ॥"
      : isHi
        ? "॥ श्री महागणपतये नमः • श्री गोकर्ण महाबलेश्वर स्वामी नमो नमः • श्री कुलदेवतायै नमः ॥"
        : isTe
          ? "॥ శ్రీ మహాగణపతయే నమః • శ్రీ గోకర్ణ మహాబలేశ్వరాయ నమః ॥"
          : isTa
            ? "॥ ஸ்ரீ மகா கணபதியே நமஹ • ஸ்ரீ கோகர்ண மகாபலேஸ்வராய நமஹ ॥"
            : "|| OM SRI MAHAGANAPATAYE NAMAHA • SRI GOKARNA MAHABALESHWARAYA NAMAHA ||";

  // Chapter Header & Inquest Helpers matching Premium PDF V1
  const getChapterHeaderData = (
    chapterNum: number,
    defaultKnTitle: string,
    defaultEnTitle: string,
    currentTitle?: string
  ) => {
    const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯", "೧೦", "೧೧", "೧೨"];
    const hiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९", "१०", "११", "१२"];
    const teDigits = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯", "౧౦", "౧౧", "౧౨"];
    const taDigits = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯", "௰", "௰௧", "௰௨"];
    let badgeText = "";
    if (isKn) badgeText = `ಅಧ್ಯಾಯ ${knDigits[chapterNum] || chapterNum}`;
    else if (isMr || isHi) badgeText = `अध्याय ${hiDigits[chapterNum] || chapterNum}`;
    else if (isTe) badgeText = `అధ్యాయం ${teDigits[chapterNum] || chapterNum}`;
    else if (isTa) badgeText = `அத்தியாயம் ${taDigits[chapterNum] || chapterNum}`;
    else badgeText = `Chapter ${chapterNum}`;

    const rawTitle = (currentTitle || (isKn ? defaultKnTitle : defaultEnTitle)).trim();
    const cleanedTitle = rawTitle.replace(/^(ಅಧ್ಯಾಯ|अध्याय|అధ్యాయం|அத்தியாயம்|Chapter)\s*[\d೦-೯०-९IIVX]+[\s:,\.\-–—|]+/iu, "").trim();

    return {
      badge: badgeText,
      fullTitle: `${badgeText}: ${cleanedTitle || rawTitle}`
    };
  };

  const renderChapterBanner = (
    chapterNum: number,
    icon: string,
    defaultKn: string,
    defaultEn: string,
    currentTitle?: string
  ) => {
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
            <span className="h-px w-12 bg-amber-700/30" />
            <span>ॐ</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-amber-950 font-serif tracking-normal leading-relaxed">
          {fullTitle}
        </h2>
      </div>
    );
  };

  const renderContemplationRibbon = (
    icon: string,
    labelKn: string,
    labelEn: string,
    questionText?: string,
    labelMr?: string,
    labelHi?: string,
    labelTe?: string,
    labelTa?: string
  ) => {
    if (!questionText) return null;
    let label = labelEn;
    if (isKn) label = labelKn;
    else if (isMr) label = labelMr || labelKn;
    else if (isHi) label = labelHi || labelKn;
    else if (isTe) label = labelTe || labelKn;
    else if (isTa) label = labelTa || labelKn;

    return (
      <div className="rounded-xl border-2 border-amber-700/30 bg-gradient-to-r from-amber-100/90 via-orange-50/80 to-amber-100/90 p-5 mb-8 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 text-amber-900 text-xs font-black tracking-widest uppercase">
          <span className="text-amber-800">{icon}</span>
          <span>{label}</span>
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
      id="five-year-prediction-pdf-container"
      style={{
        width: "900px",
        height: "max-content",
        fontFamily: activeFontFamily,
        letterSpacing: "normal"
      }}
      className={`${solidBgClass} ${textColorClass} font-serif leading-relaxed select-none relative overflow-hidden`}
    >
      {/* ── Ornate Continuous Double Border Frame (Matching Premium PDF V1) ── */}
      <div className={`absolute inset-6 border-[3px] ${borderColorClass} pointer-events-none rounded-sm opacity-90`} />
      <div className={`absolute inset-8 border border-dashed ${borderColorClass} pointer-events-none opacity-60`} />

      {/* ── COVER / HEADER SECTION ────────────────────────────────────────── */}
      <div data-section="cover" className="pdf-section text-center mt-4 mb-4 px-12 pt-4 pb-2 relative z-10">
        <p className="text-xs font-semibold text-amber-900/80 tracking-widest uppercase mb-3">
          {sacredInvocation}
        </p>

        <div className="inline-block relative px-12 py-3 mb-4">
          <div className="absolute inset-0 border-y border-amber-700/40 transform -skew-x-12 pointer-events-none" />
          <h1 className={`text-4xl font-extrabold ${primaryColorClass} leading-relaxed tracking-normal font-serif`}>
            {t("docTitle")}
          </h1>
        </div>

        <p className="text-2xl italic font-serif text-amber-900/90 tracking-normal leading-relaxed mb-6">
          {t("docSubtitle")}
        </p>

        <div className="flex items-center justify-center gap-6 opacity-80 mb-5">
          <div className="w-24 border-b-2 border-amber-700/60" />
          <span className="text-2xl text-amber-800 font-serif">ॐ</span>
          <div className="w-24 border-b-2 border-amber-700/60" />
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-bold text-amber-900">
          <span className="bg-amber-100/90 px-4 py-1.5 rounded-full border border-amber-700/30 shadow-xs">
            🗓️ {formatNumber6L(data.startYear, lang)} – {formatNumber6L(data.endYear, lang)} ({formatNumber6L(5, lang)} {isKn ? "ವರ್ಷಗಳ ಮಹಾ ಭವಿಷ್ಯ ನಕ್ಷೆ" : isMr ? "वर्षांचा महा भविष्य आराखडा" : isHi ? "वर्षीय महा भविष्य खाका" : "Years Sovereign Roadmap"})
          </span>
          <span className="bg-amber-100/90 px-4 py-1.5 rounded-full border border-amber-700/30 shadow-xs">
            🏛️ {isKn ? "ಅಧಿಕೃತ ಜ್ಯೋತಿಷ್ಯ ಮುದ್ರಣ ಪ್ರಕಾಶನ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ" : isMr ? "अधिकृत ज्योतिष मुद्रण आवृत्ती • श्री क्षेत्र गोकर्ण" : isHi ? "आधिकारिक ज्योतिष मुद्रण संस्करण • श्री क्षेत्र गोकर्ण" : isTe ? "అధికారిక జ్యోతిష్య ముద్రణ ప్రచురణ • శ్రీ క్షేత్ర గోకర్ణ" : isTa ? "அதிகாரப்பூர்வ ஜோதிட வெளியீடு • ஸ்ரீ கோகர்ண க்ஷேத்திரம்" : "Official Consecrated Publication • Sri Kshetra Gokarna"}
          </span>
        </div>
      </div>

      {/* ── USER DETAILS BOX (Ultra-Premium Royal Gold Parchment Card) ──────── */}
      <div data-section="user-details" className="pdf-section w-full px-12 mb-5 relative z-10">
        <div className="relative rounded-xl border-2 border-amber-600/60 bg-amber-100/50 p-6 shadow-md overflow-hidden">
          {/* Ornate Inner Frame */}
          <div className="absolute inset-2 border border-amber-700/30 rounded-lg pointer-events-none" />
          <div className="absolute inset-3 border border-dashed border-amber-700/20 rounded-lg pointer-events-none" />

          {/* Decorative corner emblems */}
          <div className="absolute top-4 left-4 text-sm text-amber-800/50 font-serif">❖</div>
          <div className="absolute top-4 right-4 text-sm text-amber-800/50 font-serif">❖</div>
          <div className="absolute bottom-4 left-4 text-sm text-amber-800/50 font-serif">❖</div>
          <div className="absolute bottom-4 right-4 text-sm text-amber-800/50 font-serif">❖</div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-10 relative z-10 px-4 py-2">
            {/* Devotee Name & Age */}
            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {isKn ? "ಜಾತಕರ ಹೆಸರು" : isMr ? "नाव" : isHi ? "नाम" : isTe ? "పేరు" : isTa ? "பெயர்" : "Devotee Name"}
              </span>
              <span className="text-2xl font-black text-amber-950 font-serif tracking-normal leading-relaxed">
                {data.devoteeName}
              </span>
            </div>

            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {isKn ? "ವಯಸ್ಸು & ಜನ್ಮ ವಿವರ" : isMr ? "वय व जन्म तपशील" : isHi ? "आयु एवं जन्म विवरण" : isTe ? "వయస్సు & జన్మ వివరాలు" : isTa ? "வயது & பிறப்பு விவரம்" : "Age & Birth Window"}
              </span>
              <span className="text-2xl font-bold text-amber-950 font-serif tracking-normal leading-relaxed">
                {formatNumber6L(Math.round(data.ageYears), lang)} {isKn ? "ವರ್ಷ" : isMr ? "वर्षे" : isHi ? "वर्ष" : "Yrs"} ({data.birthDateFormatted} • {data.birthTimeFormatted})
              </span>
            </div>

            {/* Janma Lagna & Moon Sign */}
            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {isKn ? "ಜನ್ಮ ಲಗ್ನ" : isMr ? "जन्म लग्न" : isHi ? "जन्म लग्न" : isTe ? "జన్మ లగ్నం" : isTa ? "ஜென்ம லக்னம்" : "Natal Lagna"}
              </span>
              <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
                {data.lagnaRashi} ({isKn ? "ಲಗ್ನಾಧಿಪತಿ" : isMr ? "लग्नेश" : isHi ? "लग्नेश" : isTe ? "లగ్నాధిపతి" : isTa ? "லக்னாதிபதி" : "Lagna Lord"}: {data.lagnaLord})
              </span>
            </div>

            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {isKn ? "ಚಂದ್ರ ರಾಶಿ" : isMr ? "चंद्र राशी" : isHi ? "चन्द्र राशि" : isTe ? "చంద్ర రాశి" : isTa ? "சந்திர ராசி" : "Moon Sign (Rashi)"}
              </span>
              <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
                {data.moonRashi} ({isKn ? "ರಾಶ್ಯಾಧಿಪತಿ" : isMr ? "राशीश" : isHi ? "राशीश" : isTe ? "రాశ్యాధిపతి" : isTa ? "ராசியாதிபதி" : "Rashi Lord"}: {data.moonLord})
              </span>
            </div>

            {/* Janma Nakshatra & Pada */}
            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {isKn ? "ಜನ್ಮ ನಕ್ಷತ್ರ & ಪಾದ" : isMr ? "जन्म नक्षत्र व चरण" : isHi ? "जन्म नक्षत्र एवं चरण" : isTe ? "జన్మ నక్షత్రం & పాదం" : isTa ? "ஜென்ம நட்சத்திரம் & பாதம்" : "Nakshatra & Pada"}
              </span>
              <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
                {data.nakshatra} ({data.padaWord || (isKn ? "ಪಾದ" : isMr ? "चरण" : isHi ? "पाद" : isTe ? "పాదం" : isTa ? "பாதம்" : "Pada")} {data.nakshatraPada})
              </span>
            </div>

            {/* Janana Tithi & Vaara */}
            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {isKn ? "ಜನ್ಮ ತಿಥಿ & ವಾರ" : isMr ? "जन्म तिथी व वार" : isHi ? "जन्म तिथि एवं वार" : isTe ? "జన్మ తిథి & వారం" : isTa ? "ஜென்ம திதி & வாரம்" : "Birth Tithi & Weekday"}
              </span>
              <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
                {[data.jananaPanchanga?.tithi, data.birthWeekday].filter(Boolean).join(" • ") || "—"}
              </span>
            </div>

            {/* Nitya Yoga & Karana */}
            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {isKn ? "ನಿತ್ಯ ಯೋಗ & ಕರಣ" : isMr ? "नित्य योग व करण" : isHi ? "नित्य योग एवं करण" : isTe ? "నిత్య యోగం & కరణం" : isTa ? "நித்ய யோகம் & கரணம்" : "Nitya Yoga & Karana"}
              </span>
              <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
                {[data.jananaPanchanga?.yoga, data.jananaPanchanga?.karana].filter(Boolean).join(" • ") || "—"}
              </span>
            </div>

            {/* Janma Hora & Ayanamsha */}
            <div className="flex flex-col border-b border-amber-800/20 pb-3">
              <span className="text-sm font-extrabold tracking-normal text-amber-900/80 mb-1">
                {isKn ? "ಜನ್ಮ ಹೋರೆ & ಅಯನಾಂಶ" : isMr ? "जन्म होरा व अयनांश" : isHi ? "जन्म होरा एवं अयनांश" : isTe ? "జన్మ హోర & అయనాంశ" : isTa ? "ஜென்ம ஓரை & அயனாம்சம்" : "Birth Hora & Ayanamsa"}
              </span>
              <span className="text-2xl font-bold leading-relaxed text-amber-950 font-serif tracking-normal">
                {[data.janmaHora, data.jananaPanchanga?.ayanamsha].filter(Boolean).join(" • ") || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CHAPTER 1: SOVEREIGN 5-YEAR DESTINY TRAJECTORY & PIVOTAL TURNING POINT ── */}
      <div data-section="macro-destiny" className={sectionClass}>
        {renderChapterBanner(
          1,
          "🌟",
          "೫ ವರ್ಷಗಳ ದೈವಿಕ ರೇಖೆ ಹಾಗೂ ಸುವರ್ಣ ಮಹಾ ತಿರುವು",
          "Sovereign 5-Year Destiny Trajectory & Pivotal Golden Turning Point",
          data.macroSummary.pivotalTurningPointTitle
        )}

        {renderContemplationRibbon(
          "✨",
          "ಪಂಚವರ್ಷದ ದೈವಿಕ ಧ್ಯೇಯವಾಕ್ಯ",
          "Guiding Destiny Axiom",
          data.macroSummary.destinyTheme,
          "५ वर्षांचे प्रेरणादायी जीवनसूत्र",
          "५-वर्षीय प्रेरक जीवन सूत्र",
          "5 సంవత్సరాల దివ్య జీవన సూత్రం",
          "5 ஆண்டுகளின் தெய்வீக வழிகாட்டும் தாரக மந்திரம்"
        )}

        <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
          {/* Substantive Paragraph 1: Macro Overview */}
          <p className="text-lg text-amber-950 font-serif leading-relaxed text-left">
            {data.macroSummary.overview}
          </p>

          {/* Substantive Paragraph 2: Macro Trend & Consolidation */}
          <p className="text-lg text-amber-950 font-serif leading-relaxed text-left">
            {data.macroSummary.macroTrend}
          </p>

          {/* Substantive Paragraph 3: Turning Point Impact */}
          {data.macroSummary.pivotalTurningPointImpact && (
            <p className="text-lg text-amber-950 font-serif leading-relaxed text-left">
              {data.macroSummary.pivotalTurningPointImpact}
            </p>
          )}

          {/* Golden Highlight Peak & Caution Windows */}
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="rounded-xl border-2 border-amber-600/70 bg-gradient-to-br from-amber-100/90 to-yellow-50/80 p-5 shadow-xs">
              <span className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-2 mb-2">
                <span>⭐</span>
                <span>{isKn ? "ಸುವರ್ಣ ಭಾಗ್ಯೋದಯ ಪರ್ವ" : isMr ? "सुवर्ण भाग्योदय पर्व" : isHi ? "स्वर्णिम भाग्योदय काल" : "Golden Peak Opportunity Window"}</span>
              </span>
              <p className="text-xl font-black text-amber-950 font-serif mb-2">{data.macroSummary.peakGoldenYear}</p>
              <p className="text-sm text-amber-900/90 font-serif leading-relaxed">
                {isKn
                  ? "ಈ ಅವಧಿಯಲ್ಲಿ ಗುರುಬಲ ಹಾಗೂ ದಶಾ-ಭುಕ್ತಿ ಅನುಕೂಲತೆಯಿಂದ ನೂತನ ಉದ್ಯೋಗ, ಗೃಹಪ್ರವೇಶ, ಹೂಡಿಕೆಯಲ್ಲಿ ಗರಿಷ್ಠ ಲಾಭ ಹಾಗೂ ಸಾಮಾಜಿಕ ಗೌರವ ಲಭಿಸಲಿದೆ."
                  : isMr
                    ? "या काळात गुरूचे पाठबळ व दशा-भुक्तीच्या शुभ प्रभावाने मोठे यश, घर खरेदी व आर्थिक समृद्धीचे योग आहेत."
                    : isHi
                      ? "इस कालखंड में गुरु बल एवं शुभ दशा प्रभाव से कार्यसिद्धि, वाहन-भवन क्रय एवं धनलाभ के सर्वोत्तम योग बनेंगे।"
                      : "Peak alignment of Jovian grace and favorable Dasha sub-periods yielding major breakthroughs."}
              </p>
            </div>

            <div className="rounded-xl border-2 border-orange-600/60 bg-gradient-to-br from-orange-100/80 to-amber-50/80 p-5 shadow-xs">
              <span className="text-xs font-black text-orange-950 uppercase tracking-widest flex items-center gap-2 mb-2">
                <span>🛡️</span>
                <span>{isKn ? "ತಾಳ್ಮೆ ಹಾಗೂ ಎಚ್ಚರಿಕೆಯ ಅವಧಿ" : isMr ? "संयम व सावधगिरीचा काळ" : isHi ? "धैर्य एवं सावधानी का काल" : "Patience & Deliberation Window"}</span>
              </span>
              <p className="text-xl font-black text-amber-950 font-serif mb-2">{data.macroSummary.cautionPeriodYear}</p>
              <p className="text-sm text-amber-900/90 font-serif leading-relaxed">
                {isKn
                  ? "ಶನಿ ಗೋಚಾರದ ಪ್ರಭಾವವಿರುವುದರಿಂದ ಆತುರದ ಹೂಡಿಕೆ ನಿರ್ಧಾರಗಳನ್ನು ತಪ್ಪಿಸಿ, ಹಿರಿಯರ ಸಲಹೆ ಪಡೆದು ವಿವೇಕದಿಂದ ಹೆಜ್ಜೆ ಇಡುವುದು ಕ್ಷೇಮಕರ."
                  : isMr
                    ? "शनि गोचराचा प्रभाव असल्याने घाईघाईने मोठे आर्थिक निर्णय घेणे टाळावे व शांततेने विचार करून पाऊल उचलावे."
                    : isHi
                      ? "शनि गोचर प्रभाव के कारण अनावश्यक जोखिम न लें एवं स्वास्थ्य तथा धन संचय पर पूर्ण ध्यान दें।"
                      : "Saturnine transits advise disciplined deliberation; avoid speculative commitments."}
              </p>
            </div>
          </div>

          {/* 5-Year High-Confidence Milestone Matrix */}
          {data.milestoneMatrix && data.milestoneMatrix.length > 0 && (
            <div className="pt-6 border-t border-amber-700/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-amber-950 font-serif flex items-center gap-2">
                  <span>🏆</span>
                  <span>{t("milestoneMatrixTitle")}</span>
                </h3>
                <span className="text-xs font-black bg-amber-900 text-amber-100 px-3 py-1 rounded-full shadow-xs">
                  {isKn ? "೧೦೦% ಶಾಸ್ತ್ರೋಕ್ತ ಗಣನೆ" : isMr ? "१००% अचूक भाकीत" : isHi ? "१००% सटीक फलादेश" : "100% Deterministic"}
                </span>
              </div>
              <p className="text-sm text-amber-800 font-serif italic">
                {t("milestoneMatrixSubtitle")}
              </p>

              <div className="border border-amber-700/40 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse font-serif">
                  <thead>
                    <tr className="bg-amber-900 text-amber-100 text-xs uppercase tracking-wider font-bold">
                      <th className="p-3 border-r border-amber-800/60 w-[24%]">{t("colDimension")}</th>
                      <th className="p-3 border-r border-amber-800/60 w-[18%]">{t("colWindow")}</th>
                      <th className="p-3 border-r border-amber-800/60 w-[20%]">{t("colCatalyst")}</th>
                      <th className="p-3 border-r border-amber-800/60 w-[12%] text-center">{t("colProbability")}</th>
                      <th className="p-3 w-[26%]">{t("colAdvice")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200">
                    {data.milestoneMatrix.map((m, mIdx) => (
                      <tr key={`milestone-${m.id || mIdx}`} className={mIdx % 2 === 0 ? "bg-amber-50/40" : "bg-white"}>
                        <td className="p-3 font-black text-amber-950 border-r border-amber-200 text-sm">
                          {m.dimensionTitle}
                        </td>
                        <td className="p-3 font-bold text-amber-900 border-r border-amber-200">
                          <span className="bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">
                            {m.timingWindow}
                          </span>
                        </td>
                        <td className="p-3 text-amber-900 border-r border-amber-200 leading-snug">
                          {m.planetaryCatalyst}
                        </td>
                        <td className="p-3 text-center border-r border-amber-200">
                          <span className="font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                            {m.probabilityScore}
                          </span>
                        </td>
                        <td className="p-3 text-amber-950 leading-relaxed">
                          {m.actionAdvice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CHAPTERS 2 TO 5: AGE-ADAPTIVE 5-YEAR LIFE CHAPTERS ────────────── */}
      {data.chapters.map((ch, chIdx) => (
        <div key={`life-chapter-${ch.id || chIdx}`} data-section={`chapter-${ch.id}`} className={sectionClass}>
          {renderChapterBanner(
            2 + chIdx,
            ch.icon,
            ch.title,
            ch.title,
            ch.title
          )}

          {ch.contemplationInquest && renderContemplationRibbon(
            "❖",
            "ಆತ್ಮ ಚಿಂತನೆ",
            "Contemplation Inquest",
            ch.contemplationInquest,
            "आत्म चिंतन",
            "आत्म चिंतन",
            "ఆత్మ చింతన",
            "ஆத்ம சிந்தனை"
          )}

          <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
            {/* Subtitle / Planetary Driver */}
            <div className="border-b border-amber-700/20 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-amber-800 block mb-1">
                {isKn ? "ಗ್ರಹ ದೃಷ್ಟಿ ಹಾಗೂ ಪ್ರಭಾವ" : isMr ? "ग्रह दृष्टी व प्रभाव" : isHi ? "ग्रह दृष्टि एवं प्रभाव" : "Planetary Influence & Driving Axis"}
              </span>
              <p className="text-base font-bold text-amber-900 font-serif italic">
                {ch.subtitle}
              </p>
            </div>

            {/* Substantive Paragraphs (2 to 3 paragraphs) */}
            <div className="space-y-4">
              {ch.paragraphs.map((p, pIdx) => (
                <p
                  key={`chap-p-${chIdx}-${pIdx}`}
                  className="text-lg text-amber-950 font-serif leading-relaxed text-left"
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Key Guidance Shield */}
            <div className="rounded-xl border border-amber-800/30 bg-gradient-to-r from-amber-100/90 to-orange-100/70 p-5 mt-6 flex items-start gap-3 shadow-xs">
              <span className="text-2xl text-amber-800 leading-none pt-0.5">💡</span>
              <div className="flex-1">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-1">
                  {isKn ? "ಪಂಚವರ್ಷದ ಶಾಸ್ತ್ರೋಕ್ತ ಸಲಹೆ" : isMr ? "५ वर्षांचा शास्त्रोक्त सल्ला" : isHi ? "पंचवर्षीय शास्त्रोक्त परामर्श" : "Sovereign Remedial Counsel"}
                </span>
                <p className="text-base font-bold text-amber-950 font-serif leading-relaxed">
                  {ch.keyAdvice}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ── CHAPTER 6: KUNDLI DOSHA DIAGNOSTICS & 5-YEAR PROTECTIVE SHIELD ── */}
      {data.doshaAnalysis && (
        <div data-section="chapter-doshas" className={sectionClass}>
          {renderChapterBanner(
            2 + data.chapters.length, // Chapter 6
            "🛡️",
            "ಜನ್ಮ ಕುಂಡಲಿ ದೋಷಗಳು ಹಾಗೂ ೫ ವರ್ಷಗಳ ಶಮನ ರಕ್ಷಾ ಕವಚ",
            "Kundli Doshas & 5-Year Protection Shield",
            isKn ? "ಜನ್ಮ ಕುಂಡಲಿ ದೋಷಗಳು ಹಾಗೂ ೫ ವರ್ಷಗಳ ಶಮನ ರಕ್ಷಾ ಕವಚ"
              : isMr ? "जन्म कुंडलीतील दोष व ५ वर्षांचे शमन रक्षा कवच"
                : isHi ? "जन्म कुंडली के दोष एवं ५-वर्षीय शमन रक्षा कवच"
                  : isTe ? "జన్మ కుండలి దోషాలు & 5 సంవత్సరాల శమన రక్షా కవచం"
                    : isTa ? "ஜென்ம ஜாதக தோஷங்கள் & 5 ஆண்டுகளின் பரிகார ரக்ஷா கவசம்"
                      : "Kundli Dosha Diagnostics & 5-Year Protective Shield"
          )}

          {renderContemplationRibbon(
            "❖",
            "ದೋಷ & ಶಾಂತಿ ಚಿಂತನೆ",
            "Dosha Diagnostics & Spiritual Inquest",
            data.doshaAnalysis.inquestQuestion,
            "दोष व शांती चिंतन",
            "दोष एवं शांति चिंतन",
            "దోష & శాంతి చింతన",
            "தோஷ & சாந்தி சிந்தனை"
          )}

          <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
            {/* Status Ribbon */}
            <div className="flex items-center justify-between border-b border-amber-700/20 pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-800 block mb-1">
                  {isKn ? "ಕುಂಡಲಿ ಕರ್ಮ ಸ್ಥಿತಿ" : isMr ? "कुंडली कर्म स्थिती" : isHi ? "कुंडली कर्म स्थिति" : "Karmic Dosha Disposition"}
                </span>
                <p className="text-base font-bold text-amber-900 font-serif italic">
                  {isKn ? "ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರೋಕ್ತ ದೋಷ ಪರೀಕ್ಷೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ"
                    : isMr ? "बृहत् पराशर शास्त्रोक्त दोष परीक्षण व गोकर्ण शांती"
                      : isHi ? "पाराशर शास्त्र सम्मत दोष परीक्षण एवं गोकर्ण शांति"
                        : "Parashari Dosha Evaluation & Gokarna Shanti Shield"}
                </p>
              </div>
              <span className="bg-amber-900 text-amber-100 font-black text-xs px-3.5 py-1.5 rounded-full shadow-xs">
                {data.doshaAnalysis.overallDoshaScore}
              </span>
            </div>

            {/* 3 Substantive Paragraphs */}
            <div className="space-y-4">
              {data.doshaAnalysis.paragraphs.map((p, pIdx) => (
                <p
                  key={`dosha-p-${pIdx}`}
                  className="text-lg text-amber-950 font-serif leading-relaxed text-left"
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Diagnostic Summary Table */}
            {data.doshaAnalysis.detectedDoshas && data.doshaAnalysis.detectedDoshas.length > 0 && (
              <div className="pt-4 space-y-3 border-t border-amber-700/20">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛡️</span>
                  <h4 className="text-base font-black text-amber-950 font-serif">
                    {isKn ? "ಕುಂಡಲಿ ದೋಷಗಳು, ೫ ವರ್ಷಗಳ ಪ್ರಭಾವ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಸೂಚಿ"
                      : isMr ? "कुंडलीतील दोष, ५ वर्षांचा प्रभाव व गोकर्ण शांती पूजा"
                        : isHi ? "कुंडली दोष, ५-वर्षीय प्रभाव एवं गोकर्ण शांति विधान"
                          : isTe ? "కుండలి దోషాలు, 5 సంవత్సరాల ప్రభావం & గోకర్ణ శాంతి పూజ"
                            : isTa ? "ஜாதக தோஷங்கள், 5 ஆண்டுகளின் தாக்கம் & கோகர்ண சாந்தி"
                              : "Dosha Diagnostics, 5-Year Manifestation & Gokarna Parihara"}
                  </h4>
                </div>

                <div className="border border-amber-700/40 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse font-serif">
                    <thead>
                      <tr className="bg-amber-900 text-amber-100 text-xs uppercase tracking-wider font-bold">
                        <th className="p-3 border-r border-amber-800/60 w-[20%]">{isKn ? "ದೋಷ ನಾಮ" : isMr ? "दोषाचे नाव" : isHi ? "दोष नाम" : "Dosha"}</th>
                        <th className="p-3 border-r border-amber-800/60 w-[16%] text-center">{isKn ? "ತೀವ್ರತೆ / ಸ್ಥಿತಿ" : isMr ? "तीव्रता / स्थिती" : isHi ? "तीव्रता / स्थिति" : "Severity"}</th>
                        <th className="p-3 border-r border-amber-800/60 w-[34%]">{isKn ? "ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಪ್ರಭಾವ" : isMr ? "पुढील ५ वर्षांतील प्रभाव" : isHi ? "आगामी ५ वर्षों में प्रभाव" : "5-Year Impact"}</th>
                        <th className="p-3 w-[30%]">{isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ಗೋಕರ್ಣ ಸೇವೆ & ಮಂತ್ರ" : isMr ? "गोकर्ण शांती सेवा व मंत्र" : isHi ? "गोकर्ण शांति सेवा एवं मंत्र" : "Gokarna Seva & Mantra"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200 text-xs">
                      {data.doshaAnalysis.detectedDoshas.map((item, dIdx) => (
                        <tr key={`dosha-${item.id || dIdx}`} className={dIdx % 2 === 0 ? "bg-amber-50/40" : "bg-white"}>
                          <td className="p-3 font-black text-amber-950 border-r border-amber-200 text-sm">
                            {item.name}
                          </td>
                          <td className="p-3 text-center border-r border-amber-200">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${item.severity === "critical" ? "bg-red-100 text-red-950 border border-red-300"
                              : item.severity === "high" ? "bg-orange-100 text-orange-950 border border-orange-300"
                                : item.severity === "moderate" ? "bg-amber-100 text-amber-950 border border-amber-300"
                                  : "bg-emerald-100 text-emerald-950 border border-emerald-300"
                              }`}>
                              {item.severityBadge}
                            </span>
                          </td>
                          <td className="p-3 text-amber-950 border-r border-amber-200 leading-relaxed font-serif">
                            {item.manifestationIn5Years}
                          </td>
                          <td className="p-3 text-amber-900 leading-relaxed font-serif space-y-1">
                            <p className="font-bold text-amber-950">{item.pariharaGokarna}</p>
                            <p className="text-[11px] text-amber-800 font-mono italic">🕉️ {item.mantra}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Key Guidance Shield */}
            <div className="rounded-xl border border-amber-800/30 bg-gradient-to-r from-amber-100/90 to-orange-100/70 p-5 mt-4 flex items-start gap-3 shadow-xs">
              <span className="text-2xl text-amber-800 leading-none pt-0.5">🛡️</span>
              <div className="flex-1">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-1">
                  {isKn ? "ಪಂಚವರ್ಷದ ದೋಷ ಶಮನ ರಕ್ಷಾ ಕವಚ" : isMr ? "५ वर्षांचे दोष शमन रक्षा कवच" : isHi ? "५-वर्षीय दोष शमन रक्षा कवच" : "5-Year Protective Shield Summary"}
                </span>
                <p className="text-base font-bold text-amber-950 font-serif leading-relaxed">
                  {data.doshaAnalysis.remedyShieldSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHAPTERS 7 TO 11: CHRONOLOGICAL 5 YEARS (ANNUAL FORECASTS) ─────── */}
      {data.years.map((yr, idx) => {
        const chapterNum = 2 + data.chapters.length + 1 + idx; // Chapters 7, 8, 9, 10, 11
        const yrTitle = `${yr.gregorianRange} (${isKn ? yr.samvatsaraKn : isMr ? `${yr.samvatsaraKn} संवत्सर` : yr.samvatsaraEn})`;

        return (
          <div key={`annual-year-${yr.yearIndex ?? idx}`} data-section={`year-${idx + 1}`} className={sectionClass}>
            {renderChapterBanner(
              chapterNum,
              "🗓️",
              `ವರ್ಷ ${idx + 1}: ${yrTitle}`,
              `Year ${idx + 1}: ${yrTitle}`,
              `ವರ್ಷ ${idx + 1}: ${yrTitle}`
            )}

            {renderContemplationRibbon(
              "❖",
              "ವರ್ಷದ ಪ್ರಮುಖ ಪ್ರಶ್ನೆ",
              "Annual Destiny Inquest",
              yr.questionInquest || (
                isKn ? `ಈ ${yr.gregorianRange} ವರ್ಷದಲ್ಲಿ ನನ್ನ ಜೀವನದ ಪ್ರಮುಖ ತಿರುವು, ಸುವರ್ಣಾವಕಾಶಗಳು ಮತ್ತು ಜಾಗರೂಕತೆ ವಹಿಸಬೇಕಾದ ಅಂಶಗಳು ಯಾವುವು?`
                  : isMr ? `या ${yr.gregorianRange} वर्षात माझ्या जीवनातील महत्त्वाचे वळण, सुवर्णसंधी व कोणती दक्षता घ्यावी लागेल?`
                    : isHi ? `इस ${yr.gregorianRange} वर्ष में मेरे जीवन का मुख्य मोड़, स्वर्णिम अवसर एवं कौन सी सावधानियां रखनी होंगी?`
                      : isTe ? `ఈ ${yr.gregorianRange} సంవత్సరంలో నా జీవితంలో ముఖ్యమైన మలుపు, సువర్ణావకాశాలు మరియు తీసుకోవాల్సిన జాగ్రత్తలు ఏమిటి?`
                        : isTa ? `இந்த ${yr.gregorianRange} ஆண்டில் எனது வாழ்க்கையின் முக்கிய திருப்புமுனை, பொற்கால வாய்ப்புகள் மற்றும் எச்சரிக்கைகள் யாவை?`
                          : `What are the defining turning points, golden opportunity windows, and vital cautions for the ${yr.gregorianRange} cycle?`
              ),
              "वर्षातील मुख्य प्रश्न",
              "वर्ष का मुख्य प्रश्न",
              "సంవత్సరపు ప్రధాన ప్రశ్న",
              "ஆண்டின் முக்கிய கேள்வி"
            )}

            {/* Astronomical Ribbon: Dasha, Muntha, Moorthy Nirnaya, SAV */}
            <div className="rounded-xl border border-amber-700/30 bg-amber-100/60 p-5 mb-8 shadow-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-serif">
                <div>
                  <span className="text-amber-800 font-extrabold uppercase text-[10px] tracking-wider block">
                    {isKn ? "ಸಂವತ್ಸರ & ಶಕ" : isMr ? "संवत्सर व शक" : isHi ? "संवत्सर एवं शक" : "Samvatsara & Shaka"}
                  </span>
                  <p className="font-black text-amber-950 text-sm mt-0.5">
                    {isKn ? yr.samvatsaraKn : isMr ? yr.samvatsaraKn : yr.samvatsaraEn} ({formatNumber6L(yr.shakaYear, lang)})
                  </p>
                </div>

                <div>
                  <span className="text-amber-800 font-extrabold uppercase text-[10px] tracking-wider block">
                    {isKn ? "ದಶಾ & ಭುಕ್ತಿ" : isMr ? "दशा व भुक्ती" : isHi ? "दशा एवं भुक्ति" : "Active Dasha"}
                  </span>
                  <p className="font-black text-amber-950 text-sm mt-0.5">
                    {yr.activeDashaPeriodText}
                  </p>
                </div>

                <div>
                  <span className="text-amber-800 font-extrabold uppercase text-[10px] tracking-wider block">
                    {t("munthaBadge")}
                  </span>
                  <p className="font-black text-amber-950 text-sm mt-0.5">
                    {yr.munthaHouse ? `${formatNumber6L(yr.munthaHouse, lang)}ನೇ ಭಾವ (${yr.munthaRashi || ""})` : "—"}
                  </p>
                </div>

                <div>
                  <span className="text-amber-800 font-extrabold uppercase text-[10px] tracking-wider block">
                    {isKn ? "ಮೂರ್ತಿ & ಸರ್ವಾಷ್ಟಕವರ್ಗ" : isMr ? "मूर्ती व SAV गुण" : isHi ? "मूर्ति एवं SAV अंक" : "Moorthy & SAV"}
                  </span>
                  <p className="font-black text-amber-950 text-sm mt-0.5">
                    {yr.savPoints !== undefined
                      ? typeof yr.savPoints === "number"
                        ? `${formatNumber6L(yr.savPoints, lang)}/೫೬ SAV`
                        : `${formatNumber6L(yr.savPoints.saturnHousePoints, lang)}/೫೬ SAV`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Narrative Card for the Year */}
            <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
              {/* Gochara Confluence Strip */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-amber-700/20 text-sm font-serif">
                <div className="space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span>🪐</span>
                    <span>{isKn ? "ಶನಿ ಮಹಾರಾಜರ ಗೋಚಾರ:" : isMr ? "शनि महाराजांचे गोचर:" : isHi ? "शनि देव का गोचर:" : "Saturn Transit:"}</span>
                  </span>
                  <p className="text-amber-950 font-medium">{yr.shaniGocharaText}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span>✨</span>
                    <span>{isKn ? "ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಗೋಚಾರ:" : isMr ? "देवगुरूंचे गोचर:" : isHi ? "देवगुरु बृहस्पति गोचर:" : "Jupiter Transit:"}</span>
                  </span>
                  <p className="text-amber-950 font-medium">{yr.guruGocharaText}</p>
                </div>
              </div>

              {/* Substantive Paragraphs: 3 Detailed Paragraphs */}
              <div className="space-y-4">
                {yr.paragraphs && yr.paragraphs.length > 0 ? (
                  yr.paragraphs.map((p, pIdx) => (
                    <p
                      key={`yr-${idx}-p-${pIdx}`}
                      className="text-lg text-amber-950 font-serif leading-relaxed text-left"
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="text-lg text-amber-950 font-serif leading-relaxed text-left">
                      {yr.headline}
                    </p>
                    {yr.whatToExpect && yr.whatToExpect.length > 0 && (
                      <p className="text-lg text-amber-950 font-serif leading-relaxed text-left">
                        {yr.whatToExpect.join(" ")}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* 4 Quarterly Seasons Matrix (for future timing curiosity) */}
              {yr.seasons && yr.seasons.length > 0 && (
                <div className="pt-6 border-t border-amber-700/20 space-y-4">
                  <span className="text-base font-black text-amber-950 font-serif flex items-center gap-2">
                    <span>🌸</span>
                    <span>{t("quarterlyForecastHeader")}</span>
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    {yr.seasons.map((q, qIdx) => (
                      <div
                        key={`season-${idx}-${q.quarterIndex ?? qIdx}`}
                        className="rounded-xl border border-amber-700/30 bg-amber-100/40 p-4 space-y-2 shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-amber-700/20 pb-1 mb-2">
                            <span className="font-black text-amber-950 text-sm">{q.seasonName}</span>
                            <span className="text-xs font-bold text-amber-900">{q.gregorianMonths}</span>
                          </div>
                          <p className="text-xs text-amber-950 leading-relaxed font-serif">
                            {q.predictedOutcome}
                          </p>
                        </div>
                        <div className="pt-2">
                          <span className="inline-block bg-amber-200/80 text-amber-950 font-bold px-2.5 py-0.5 rounded text-xs border border-amber-400/60">
                            ✨ {q.opportunityBadge}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Turning Point, Opportunity & Caution Cards */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-amber-700/20 text-xs font-serif">
                <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300">
                  <span className="font-black text-amber-950 block mb-1">🔄 {t("turningPointLabel")}</span>
                  <p className="text-amber-900 leading-normal">{yr.turningPointSeason}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-100/60 border border-emerald-300">
                  <span className="font-black text-emerald-950 block mb-1">✨ {t("goldenWindowLabel")}</span>
                  <p className="text-emerald-900 leading-normal">{yr.goldenOpportunityWindow}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-orange-100/60 border border-orange-300">
                  <span className="font-black text-orange-950 block mb-1">🛡️ {t("cautionLabel")}</span>
                  <p className="text-orange-900 leading-normal">{yr.cautionAndGuidance}</p>
                </div>
              </div>

              {/* Annual Remedial Shield */}
              <div className="rounded-xl border border-amber-800/30 bg-gradient-to-r from-amber-100/90 to-orange-100/70 p-4 flex items-start gap-3 shadow-xs">
                <span className="text-xl text-amber-800 leading-none pt-0.5">🛕</span>
                <div className="flex-1">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-0.5">
                    {isKn ? "ವಾರ್ಷಿಕ ಪರಿಹಾರ ಹಾಗೂ ಅನುಷ್ಠಾನ" : isMr ? "वार्षिक उपाय व अनुष्ठान" : isHi ? "वार्षिक परिहार एवं अनुष्ठान" : "Annual Remedial Shield"}
                  </span>
                  <p className="text-sm font-bold text-amber-950 font-serif leading-relaxed">
                    {yr.cautionAndGuidance}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── CHAPTER 12: AUSPICIOUS MUHURTAS, SACRED STOTRA & ANNUAL GOKARNA PARIHARA ── */}
      <div data-section="stotra-remedies" className={sectionClass}>
        {renderChapterBanner(
          2 + data.chapters.length + 1 + data.years.length, // Chapter 12
          "🪔",
          "ಪವಿತ್ರ ಸ್ತೋತ್ರ, ವಾರ್ಷಿಕ ಗೋಕರ್ಣ ಪರಿಹಾರ ಹಾಗೂ ದಿವ್ಯ ಮುಹೂರ್ತಗಳು",
          "Sacred Stotra, Annual Gokarna Worship & Auspicious Muhurtas"
        )}

        {/* Part A: Auspicious Decision Muhurtas & Financial Roadmap */}
        {data.muhurtaWindows && data.muhurtaWindows.length > 0 && (
          <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6 mb-8">
            <div className="flex items-center justify-between border-b border-amber-700/20 pb-3">
              <h3 className="text-xl font-black text-amber-950 font-serif flex items-center gap-2">
                <span>🗓️</span>
                <span>{t("muhurtaSectionTitle")}</span>
              </h3>
              <span className="text-xs font-bold text-amber-800 italic">
                {isKn ? "ಗೃಹಪ್ರವೇಶ, ಆಸ್ತಿ, ವಾಹನ, ವಿವಾಹ ಹಾಗೂ ವಾಣಿಜ್ಯ ಆರಂಭಕ್ಕೆ ಶಾಸ್ತ್ರೋಕ್ತ ಕಾಲಾವಧಿಗಳು"
                  : isMr ? "गृहप्रवेश, मालमत्ता, वाहन, विवाह व व्यवसायासाठी शुभ मुहूर्त"
                    : isHi ? "गृह प्रवेश, संपत्ति, वाहन, विवाह एवं व्यापार शुभारंभ हेतु शुभ मुहूर्त"
                      : "Auspicious Timing Windows for Major Life Decisions"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-serif">
              {data.muhurtaWindows.map((m, idx) => (
                <div key={`muhurta-${idx}`} className="p-4 rounded-xl bg-amber-100/50 border border-amber-300 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
                      <span>{m.icon}</span>
                      <span>{m.category}</span>
                    </span>
                    <span className="bg-amber-200 text-amber-950 font-black px-2.5 py-0.5 rounded text-xs border border-amber-400">
                      {m.timingWindow}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Financial Roadmap Table */}
            {data.financialRoadmap && data.financialRoadmap.length > 0 && (
              <div className="pt-4 space-y-3 border-t border-amber-700/20">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <h4 className="text-base font-black text-amber-950 font-serif">
                    {t("financialRoadmapTitle")}
                  </h4>
                </div>

                <div className="border border-amber-700/40 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse font-serif">
                    <thead>
                      <tr className="bg-amber-900 text-amber-100 text-xs uppercase tracking-wider font-bold">
                        <th className="p-3 border-r border-amber-800/60 w-[18%]">{isKn ? "ವರ್ಷಾವಧಿ" : isMr ? "कालावधी" : isHi ? "कालावधि" : "Year"}</th>
                        <th className="p-3 border-r border-amber-800/60 w-[24%]">{isKn ? "ಆರ್ಥಿಕ ನಿಲುವು" : isMr ? "आर्थिक स्थिती" : isHi ? "आर्थिक स्थिति" : "Stance"}</th>
                        <th className="p-3 border-r border-amber-800/60 w-[30%]">{isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ" : isMr ? "प्रमुख कृती" : isHi ? "प्रमुख कार्य" : "Key Action"}</th>
                        <th className="p-3 w-[28%]">{isKn ? "ಅನುಕೂಲಕರ ವಲಯಗಳು" : isMr ? "अनुकूल क्षेत्रे" : isHi ? "अनुकूल क्षेत्र" : "Sectors"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200 text-xs">
                      {data.financialRoadmap.map((row, rIdx) => (
                        <tr key={`fin-${rIdx}`} className={rIdx % 2 === 0 ? "bg-amber-50/40" : "bg-white"}>
                          <td className="p-3 font-black text-amber-950 border-r border-amber-200">{row.yearRange}</td>
                          <td className="p-3 font-bold text-amber-900 border-r border-amber-200">{row.financialStance}</td>
                          <td className="p-3 text-amber-950 border-r border-amber-200 leading-snug">{row.keyAction}</td>
                          <td className="p-3 font-bold text-emerald-900">{row.targetSectors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Part B: Prescribed Classical Stotra Card */}
        <div className="rounded-2xl border-2 border-amber-700/40 bg-amber-50/90 p-8 shadow-sm relative overflow-hidden space-y-6 mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-amber-700/20">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-800 block">
                {isKn
                  ? "ಪಂಚವರ್ಷ ರಕ್ಷಾ ಸ್ತೋತ್ರ"
                  : isMr
                    ? "५ वर्षे महा रक्षा स्तोत्र"
                    : isHi
                      ? "पंचवर्षीय महा रक्षा स्तोत्र"
                      : "5-Year Prescribed Shield"}
              </span>
              <h3 className="text-2xl font-black text-amber-950 font-serif mt-1">
                {data.prescribedStotra.stotraName}
              </h3>
              <p className="text-sm text-amber-800 font-serif italic mt-0.5">
                {isKn ? "ಅಧಿಷ್ಠಾನ ದೇವತೆ: " : isMr ? "अधिष्ठान देवता: " : isHi ? "अधिष्ठाता देव: " : "Presiding Deity: "}
                {data.prescribedStotra.deityName}
              </p>
            </div>

            <span className="bg-amber-900 text-amber-100 text-sm font-black px-4 py-1.5 rounded-full shadow-xs">
              📿 {formatNumber6L(data.prescribedStotra.chantingRounds, lang)} {isKn ? "ಆವರ್ತಿ ಜಪ" : isMr ? "वेळा जप" : isHi ? "बार पाठ" : "Rounds Daily"}
            </span>
          </div>

          {/* Sanskrit Verse in Dignified Display */}
          <div className="p-6 rounded-xl bg-amber-100/70 border-2 border-amber-600/50 text-center space-y-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
              {isKn ? "॥ ಮೂಲ ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ಲೋಕ ॥" : isMr ? "॥ मूळ शास्त्रोक्त श्लोक ॥" : isHi ? "॥ मूल शास्त्रोक्त श्लोक ॥" : "|| Sacred Scriptural Shloka ||"}
            </span>
            <p
              style={{ fontFamily: `'Noto Serif Devanagari', 'Noto Sans Devanagari', serif` }}
              className="text-lg font-bold text-amber-950 leading-relaxed italic"
            >
              {data.prescribedStotra.sanskritVerse}
            </p>
          </div>

          {/* Native Script Meaning */}
          <div className="space-y-1">
            <span className="font-extrabold text-amber-950 text-sm block">
              📖 {isKn ? "ಶ್ಲೋಕದ ದಿವ್ಯ ಭಾವಾರ್ಥ:" : isMr ? "श्लोकाचा दिव्य भावार्थ:" : isHi ? "श्लोक का दिव्य भावार्थ:" : "Sacred Meaning:"}
            </span>
            <p className="text-base text-amber-950 font-serif leading-relaxed bg-amber-100/40 p-4 rounded-xl border border-amber-200">
              {data.prescribedStotra.meaningNative}
            </p>
          </div>

          {/* Chanting Protocol */}
          <div className="grid grid-cols-3 gap-4 pt-2 text-xs font-serif">
            <div className="p-3.5 rounded-xl bg-amber-100/60 border border-amber-300">
              <span className="font-black text-amber-950 block mb-0.5">⏰ {isKn ? "ಪಾರಾಯಣ ಸಮಯ:" : isMr ? "पठणाची वेळ:" : isHi ? "पाठ का समय:" : "Best Time:"}</span>
              <p className="text-amber-900">{data.prescribedStotra.bestTimeOfDay}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-100/60 border border-amber-300">
              <span className="font-black text-amber-950 block mb-0.5">🧭 {isKn ? "ಕುಳಿತುಕೊಳ್ಳುವ ದಿಕ್ಕು:" : isMr ? "बसण्याची दिशा:" : isHi ? "मुख की दिशा:" : "Facing Direction:"}</span>
              <p className="text-amber-900">{data.prescribedStotra.facingDirection}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-100/60 border border-amber-300">
              <span className="font-black text-amber-950 block mb-0.5">🪔 {isKn ? "ವಿಶೇಷ ಸಮರ್ಪಣೆ:" : isMr ? "विशेष उपाय:" : isHi ? "विशेष समर्पण:" : "Special Offering:"}</span>
              <p className="text-amber-900">{data.prescribedStotra.specialOffering}</p>
            </div>
          </div>
        </div>

        {/* Part C: Sri Gokarna Parihara, Gemstone & Year-Specific Remedies */}
        <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
          <div className="grid grid-cols-2 gap-6 text-sm font-serif">
            <div className="p-5 rounded-xl bg-amber-100/50 border border-amber-300 space-y-2">
              <span className="font-black text-amber-950 text-base flex items-center gap-2">
                <span>🛕</span>
                <span>{isKn ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾ ಸಂಕಲ್ಪ" : isMr ? "श्री गोकर्ण क्षेत्र महा संकल्प" : isHi ? "श्री गोकर्ण क्षेत्र महा संकल्प" : "Gokarna Kshetra Shanti Sankalpa"}</span>
              </span>
              <p className="text-amber-900 leading-relaxed font-serif">
                {data.remedies.gokarnaParihara}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-amber-100/50 border border-amber-300 space-y-2">
              <span className="font-black text-amber-950 text-base flex items-center gap-2">
                <span>💎</span>
                <span>{t("luckyGemLabel")}</span>
              </span>
              <p className="text-amber-950 font-black text-lg">{data.remedies.gemstoneRecommendation}</p>
              <p className="text-xs text-amber-800 italic leading-normal border-t border-amber-300/60 pt-2">
                ⚠️ {data.remedies.gemstoneCaveat}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-amber-100/50 border border-amber-300 space-y-1.5">
              <span className="font-black text-amber-950 text-base flex items-center gap-2">
                <span>📿</span>
                <span>{t("rudrakshaLabel")}</span>
              </span>
              <p className="text-amber-950 font-bold">{data.remedies.rudrakshaRecommendation}</p>
            </div>

            <div className="p-5 rounded-xl bg-amber-100/50 border border-amber-300 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-amber-900 text-xs block">{t("luckyColorLabel")}</span>
                  <p className="text-amber-950 font-bold mt-1">{data.remedies.luckyColors}</p>
                </div>
                <div>
                  <span className="font-bold text-amber-900 text-xs block">{t("luckyNumberLabel")}</span>
                  <p className="text-amber-950 font-black text-base mt-1">{data.remedies.luckyNumbers}</p>
                </div>
              </div>
            </div>

            {/* Year-Specific Gokarna Remedies Table */}
            {data.yearSpecificRemedies && data.yearSpecificRemedies.length > 0 && (
              <div className="col-span-2 pt-4 space-y-3 border-t border-amber-700/20">
                <span className="font-black text-amber-950 text-base flex items-center gap-2">
                  <span>🔱</span>
                  <span>{isKn ? "೫ ವರ್ಷಗಳ ನಿರ್ದಿಷ್ಟ ಗೋಕರ್ಣ ಪರಿಹಾರಗಳ ಕಾರ್ಯಕ್ರಮ" : isMr ? "५ वर्षांचे विशिष्ट गोकर्ण उपाय व सेवा" : isHi ? "५-वर्षीय विशिष्ट गोकर्ण परिहार एवं सेवा" : "Year-Specific Gokarna Shanti Remedies"}</span>
                </span>
                <div className="border border-amber-700/40 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse font-serif">
                    <thead>
                      <tr className="bg-amber-900 text-amber-100 text-xs uppercase tracking-wider font-bold">
                        <th className="p-2.5 border-r border-amber-800/60 w-[18%]">{isKn ? "ವರ್ಷಾವಧಿ" : isMr ? "कालावधी" : isHi ? "कालावधि" : "Year"}</th>
                        <th className="p-2.5 border-r border-amber-800/60 w-[28%]">{isKn ? "ಗ್ರಹ ಪ್ರಭಾವ / ಸವಾಲು" : isMr ? "ग्रह प्रभाव / आव्हान" : isHi ? "ग्रह प्रभाव / चुनौती" : "Transit Challenge"}</th>
                        <th className="p-2.5 border-r border-amber-800/60 w-[34%]">{isKn ? "ಗೋಕರ್ಣ ಸೇವಾ ಸಂಕಲ್ಪ" : isMr ? "गोकर्ण सेवा संकल्प" : isHi ? "गोकर्ण सेवा संकल्प" : "Gokarna Seva"}</th>
                        <th className="p-2.5 w-[20%]">{isKn ? "ಮಂತ್ರ" : isMr ? "मंत्र" : isHi ? "मंत्र" : "Mantra"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200">
                      {data.yearSpecificRemedies.map((yrRem, yrIdx) => (
                        <tr key={`rem-${yrIdx}`} className={yrIdx % 2 === 0 ? "bg-amber-50/40" : "bg-white"}>
                          <td className="p-2.5 font-black text-amber-950 border-r border-amber-200">{yrRem.gregorianRange}</td>
                          <td className="p-2.5 font-bold text-amber-900 border-r border-amber-200">{yrRem.transitChallenge}</td>
                          <td className="p-2.5 text-amber-950 border-r border-amber-200 leading-snug">{yrRem.gokarnaSeva}</td>
                          <td className="p-2.5 text-amber-950 font-bold">{yrRem.mantra}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Nakshatra Sacred Tree (Vriksha Aradhana) */}
            {data.nakshatraVriksha && (
              <div className="col-span-2 p-5 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-2 shadow-2xs font-serif">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-950 text-sm flex items-center gap-2">
                    <span>🌳</span>
                    <span>{isKn ? `ಜನ್ಮ ನಕ್ಷತ್ರ ಪವಿತ್ರ ವೃಕ್ಷ ಆರಾಧನೆ (${data.nakshatra} ನಕ್ಷತ್ರ):` : isMr ? `जन्म नक्षत्र पवित्र वृक्ष आराधना:` : isHi ? `जन्म नक्षत्र पवित्र वृक्ष आराधना:` : `Nakshatra Sacred Tree Worship:`}</span>
                  </span>
                  <span className="bg-emerald-200 text-emerald-950 font-black text-xs px-3 py-1 rounded border border-emerald-400">
                    {data.nakshatraVriksha.vrikshaName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-emerald-900 font-bold block">{isKn ? "ವೃಕ್ಷ ಬೀಜ ಮಂತ್ರ:" : isMr ? "वृक्ष बीज मंत्र:" : isHi ? "वृक्ष बीज मंत्र:" : "Bija Mantra:"}</span>
                    <p className="text-emerald-950 font-bold mt-0.5">{data.nakshatraVriksha.bijaMantra}</p>
                  </div>
                  <div>
                    <span className="text-emerald-900 font-bold block">{isKn ? "ಆರಾಧನಾ ವಿಧಿ:" : isMr ? "आराधना पद्धती:" : isHi ? "आराधना विधि:" : "Protocol:"}</span>
                    <p className="text-emerald-950 mt-0.5 leading-relaxed">{data.nakshatraVriksha.aradhanaProtocol}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CHAPTER 13: FAMILY DESTINY INTERLOCKING ── */}
      <div data-section="family-seal" className={sectionClass}>
        {renderChapterBanner(
          2 + data.chapters.length + 1 + data.years.length + 1, // Chapter 13
          "🛡️",
          "ಕುಟುಂಬ ರಕ್ಷಾ ಪಂಚವರ್ಷ ಬಂಧ ಹಾಗೂ ಸಮನ್ವಯ",
          "Family Destiny Interlocking & Collective Wellbeing"
        )}

        <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
          {/* Family Destiny Interlocking Cards */}
          {data.familyDestinyInterlocking && (
            <div className="space-y-4">
              <div className="border-b border-amber-700/20 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-amber-800 block mb-1">
                  {t("familyInterlockTitle")}
                </span>
                <p className="text-sm font-bold text-amber-900 font-serif italic">
                  {isKn ? "ಕುಟುಂಬದ ಸದಸ್ಯರ ಜಾತಕ ಹಾಗೂ ದಶಾ-ಗೋಚಾರಗಳ ಪರಸ್ಪರ ಸಮನ್ವಯದ ವಿಶ್ಲೇಷಣೆ"
                    : isMr ? "कुटुंबातील सदस्यांच्या पत्रिका व ग्रहगोचराचा सुंदर संगम"
                      : isHi ? "पारिवारिक सदस्यों की कुंडलियों एवं ग्रह गोचर का सामंजस्य"
                        : "Interlocking Destiny Bonds of Spouse, Children & Parents"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-serif">
                <div className="p-4 rounded-xl bg-amber-100/60 border border-amber-300 space-y-1.5 shadow-2xs">
                  <span className="font-black text-amber-950 block text-sm">💑 {isKn ? "ಸಂಗಾತಿಯ ಭಾಗ್ಯೋದಯ:" : isMr ? "जोडीदाराचा भाग्योदय:" : isHi ? "जीवनसाथी का भाग्योदय:" : "Spouse Destiny:"}</span>
                  <p className="text-amber-900 leading-relaxed font-serif">{data.familyDestinyInterlocking.impactOnSpouse}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-100/60 border border-amber-300 space-y-1.5 shadow-2xs">
                  <span className="font-black text-amber-950 block text-sm">👶 {isKn ? "ಸಂತಾನ & ಮಕ್ಕಳ ಭವಿಷ್ಯ:" : isMr ? "संतती व मुलांचे भविष्य:" : isHi ? "संतान एवं बच्चों का भविष्य:" : "Children's Grace:"}</span>
                  <p className="text-amber-900 leading-relaxed font-serif">{data.familyDestinyInterlocking.impactOnChildren}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-100/60 border border-amber-300 space-y-1.5 shadow-2xs">
                  <span className="font-black text-amber-950 block text-sm">👵 {isKn ? "ತಂದೆ-ತಾಯಿಯ ಆಯುರಾರೋಗ್ಯ:" : isMr ? "आई-वडिलांचे आरोग्य:" : isHi ? "माता-पिता का स्वास्थ्य:" : "Parental Wellbeing:"}</span>
                  <p className="text-amber-900 leading-relaxed font-serif">{data.familyDestinyInterlocking.impactOnParents}</p>
                </div>
              </div>

              {/* Dignified Family Astrological Harmony Guidance Note */}
              <div className="rounded-xl border border-amber-600/50 bg-amber-100/80 p-5 shadow-xs font-serif space-y-2 mt-4">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <span>✨</span>
                  <span>{isKn ? "ಕುಟುಂಬದ ಸಾಮರಸ್ಯ ಹಾಗೂ ಸಾಮೂಹಿಕ ಶುಭ ಸಂಕಲ್ಪ" : isMr ? "कौटुंबिक समन्वय व सामूहिक शुभ संकल्प" : isHi ? "पारिवारिक सामंजस्य एवं सामूहिक शुभ संकल्प" : "Family Collective Auspicious Guidance"}</span>
                </span>
                <p className="text-sm text-amber-950 leading-relaxed text-left">
                  {data.familyDestinyInterlocking.familyBundleCta}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CHAPTER 14: DAIVAJNA MASTER JYOTISH SUMMARY ── */}
      {data.daivajnaSummary && (
        <div data-section="daivajna-summary" className={sectionClass}>
          {renderChapterBanner(
            2 + data.chapters.length + 1 + data.years.length + 2, // Chapter 14
            "🔮",
            data.daivajnaSummary.titleKn || "ದೈವಜ್ಞ ಮಹಾದರ್ಶನ ಸಮಗ್ರ ಸಾರಾಂಶ",
            data.daivajnaSummary.titleEn || "Daivajna Master Jyotish Synthesis"
          )}

          <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
            <div className="border-b border-amber-700/20 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-amber-800 block mb-1">
                {isKn ? "೫ ವರ್ಷಗಳ ಸಮಗ್ರ ಕರ್ಮಗತಿ, ಸುವರ್ಣ ತಿರುವು ಹಾಗೂ ಮಾರ್ಗದರ್ಶನ"
                  : isMr ? "५ वर्षांचा समग्र कर्मप्रवास, सुवर्ण संधी व जीवन मार्गदर्शन"
                    : isHi ? "५ वर्षों का समग्र कर्मप्रवाह, स्वर्णिम अवसर एवं जीवन मार्गदर्शन"
                      : "5-Year Holistic Karmic Arc, Golden Era & Astrological Guidance"}
              </span>
              <p className="text-sm font-bold text-amber-900 font-serif italic">
                {isKn ? "ವೇದ ಕಾಲಾತೀತ ದೈವಜ್ಞ ಅನುಭಾವದ ಆಧಾರದ ಮೇಲೆ ರಚಿತವಾದ ಅಂತಿಮ ಸಾರಾಂಶ"
                  : isMr ? "वैदिक ज्योतिष सिद्धांतांवर आधारित अंतिम समग्र फलकथन"
                    : isHi ? "वैदिक ज्योतिषीय सिद्धांतों पर आधारित अंतिम प्रामाणिक निष्कर्ष"
                      : "Synthesized through Parashari, Jaimini, and Tajika Wisdom by Chief Astrologer"}
              </p>
            </div>

            {/* 3 Rich Synthesizing Paragraphs (5-6 lines each) */}
            <div className="space-y-4">
              <p className="text-lg text-amber-950 font-serif leading-relaxed text-left">
                {data.daivajnaSummary.p1KarmicJourney}
              </p>
              <p className="text-lg text-amber-950 font-serif leading-relaxed text-left">
                {data.daivajnaSummary.p2PeakGoldenEra}
              </p>
              <p className="text-lg text-amber-950 font-serif leading-relaxed text-left">
                {data.daivajnaSummary.p3AttentionPointsAndSolace}
              </p>
            </div>

            {/* 4 Sacred Wisdom Life Anchors */}
            <div className="pt-6 border-t border-amber-700/20 space-y-4">
              <span className="text-base font-black text-amber-950 font-serif flex items-center gap-2">
                <span>🧭</span>
                <span>
                  {isKn ? "ದೈವಜ್ಞ ಚತುರ್ವಿಧ ಜೀವನ ರಕ್ಷಾ ಸೂತ್ರಗಳು"
                    : isMr ? "दैवज्ञ चार जीवन आधारस्तंभ"
                      : isHi ? "दैवज्ञ चतुर्विध जीवन सुरक्षा सूत्र"
                        : "4 Daivajna Wisdom Life Anchors"}
                </span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif">
                <div className="rounded-xl border border-amber-700/30 bg-amber-100/60 p-4 space-y-1.5 shadow-2xs">
                  <span className="font-black text-amber-950 block text-sm flex items-center gap-1.5">
                    <span>💼</span>
                    <span>{isKn ? "ವೃತ್ತಿ & ಆರ್ಥಿಕ ತಿರುವು:" : isMr ? "करिअर व आर्थिक वळण:" : isHi ? "करियर एवं आर्थिक मोड़:" : "Career & Financial Pivot:"}</span>
                  </span>
                  <p className="text-amber-900 leading-relaxed font-serif text-left">
                    {data.daivajnaSummary.careerFinancialPivot}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-700/30 bg-amber-100/60 p-4 space-y-1.5 shadow-2xs">
                  <span className="font-black text-amber-950 block text-sm flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>{isKn ? "ಆರೋಗ್ಯ & ಪ್ರಾಣಶಕ್ತಿ ಕವಚ:" : isMr ? "आरोग्य व ऊर्जा कवच:" : isHi ? "स्वास्थ्य एवं प्राणशक्ति कवच:" : "Health & Vitality Shield:"}</span>
                  </span>
                  <p className="text-amber-900 leading-relaxed font-serif text-left">
                    {data.daivajnaSummary.healthVitalityShield}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-700/30 bg-amber-100/60 p-4 space-y-1.5 shadow-2xs">
                  <span className="font-black text-amber-950 block text-sm flex items-center gap-1.5">
                    <span>🕉️</span>
                    <span>{isKn ? "ಆಧ್ಯಾತ್ಮಿಕ ಪರಿಹಾರ ಸಾಧನೆ:" : isMr ? "आध्यात्मिक उपाय व साधना:" : isHi ? "आध्यात्मिक उपाय एवं साधना:" : "Spiritual Remedy Fulfillment:"}</span>
                  </span>
                  <p className="text-amber-900 leading-relaxed font-serif text-left">
                    {data.daivajnaSummary.spiritualRemedyFulfillment}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-700/30 bg-amber-100/60 p-4 space-y-1.5 shadow-2xs">
                  <span className="font-black text-amber-950 block text-sm flex items-center gap-1.5">
                    <span>💖</span>
                    <span>{isKn ? "ಸಂಬಂಧ & ಕೌಟುಂಬಿಕ ಸಾಮರಸ್ಯ:" : isMr ? "कौटुंबिक सौख्य व नातेसंबंध:" : isHi ? "पारिवारिक सौहार्द एवं संबंध:" : "Family & Relationship Harmony:"}</span>
                  </span>
                  <p className="text-amber-900 leading-relaxed font-serif text-left">
                    {data.daivajnaSummary.relationshipFamilyHarmony}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHAPTER 15: SACRED DEITY PORTRAIT & 100% DYNAMIC DEVOTEE SHLOKA ── */}
      {data.sacredDeityImage && data.personalizedDynamicShloka && (
        <div data-section="deity-shloka" className={sectionClass}>
          {renderChapterBanner(
            2 + data.chapters.length + 1 + data.years.length + 3, // Chapter 15
            "🕉️",
            isKn ? "ದೈವ ಕೃಪಾ ಕವಚ & ಜನ್ಮ ಕುಂಡಲಿ ವೈಯಕ್ತಿಕ ಶ್ಲೋಕ"
              : isMr ? "दैवी कृपा कवच व जन्मकुंडली वैयक्तिक श्लोक"
                : isHi ? "दैवीय कृपा कवच एवं जन्म कुंडली व्यक्तिगत श्लोक"
                  : "Sacred Deity Grace & Personalized Devotee Shloka",
            "Sacred Deity Grace & Personalized Devotee Shloka"
          )}

          <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-8">
            {/* Sacred Deity Portrait */}
            <div className="text-center space-y-4">
              <div className="inline-block relative p-2 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200 rounded-2xl border-2 border-amber-600/70 shadow-md">
                <img
                  src={data.sacredDeityImage.imagePath}
                  alt={data.sacredDeityImage.deityName}
                  crossOrigin="anonymous"
                  className="w-48 sm:w-56 h-auto max-h-72 object-contain rounded-xl mx-auto block shadow-xs"
                />
              </div>

              <div className="space-y-1 font-serif">
                <h3 className="text-2xl font-black text-amber-950 tracking-normal">
                  {data.sacredDeityImage.deityName}
                </h3>
                <p className="text-sm font-bold text-amber-800 italic">
                  {data.sacredDeityImage.deityTitle}
                </p>
                <p className="text-xs text-amber-900/80 max-w-lg mx-auto leading-relaxed">
                  {data.sacredDeityImage.blessingsSubtitle}
                </p>
              </div>
            </div>

            {/* 100% Dynamic Devotee Shloka Card */}
            <div className="rounded-xl border-2 border-amber-600/60 bg-gradient-to-br from-amber-100/95 via-yellow-50/90 to-amber-100/95 p-6 shadow-sm font-serif space-y-5">
              <div className="text-center border-b border-amber-700/20 pb-4 space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-amber-800">
                  {isKn ? "॥ ಜನ್ಮ ಜಾತಕಾನುಸಾರ ಸಿದ್ಧಪಡಿಸಿದ ಪಾವನ ಮಂತ್ರ ॥"
                    : isMr ? "॥ जन्मपत्रिकेनुसार सिद्ध केलेला पवित्र मंत्र ॥"
                      : isHi ? "॥ जन्म कुंडली अनुसार सिद्ध किया गया पावन मंत्र ॥"
                        : "॥ Sacred Devotional Shloka for Your Birth Chart ॥"}
                </span>

                {/* Sanskrit Devanagari */}
                <div className="p-3 bg-amber-900/90 text-amber-50 rounded-xl shadow-xs">
                  <p className="text-lg font-bold tracking-wide leading-relaxed font-serif whitespace-pre-line">
                    {data.personalizedDynamicShloka.shlokaSanskrit}
                  </p>
                </div>

                {/* Regional Script Transliteration */}
                {!isHi && data.personalizedDynamicShloka.shlokaRegional && (
                  <p className="text-base font-bold text-amber-950 leading-relaxed italic pt-1 whitespace-pre-line">
                    {data.personalizedDynamicShloka.shlokaRegional}
                  </p>
                )}
              </div>

              {/* Devotional Meaning in Devotee Language */}
              <div className="space-y-2 text-left">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <span>📖</span>
                  <span>{isKn ? "ಪಾವನ ಮಂತ್ರದ ತಾತ್ಪರ್ಯ & ದೈವಾನುಗ್ರಹ:" : isMr ? "मंत्राचा भावार्थ व कृपाशीर्वाद:" : isHi ? "मंत्र का भावार्थ एवं कृपाशीर्वाद:" : "Sacred Meaning & Divine Grace:"}</span>
                </span>
                <p className="text-sm text-amber-950 leading-relaxed font-serif text-left">
                  {data.personalizedDynamicShloka.meaning}
                </p>
              </div>

              {/* Chanting Protocols Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-amber-700/20">
                <div className="p-3 rounded-lg bg-amber-200/50 border border-amber-400/50 text-left">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    {isKn ? "ಜಪ ಸಂಖ್ಯೆ" : isMr ? "जप संख्या" : isHi ? "जप संख्या" : "Chant Count"}
                  </span>
                  <span className="font-black text-amber-950 mt-0.5 block">
                    📿 {data.personalizedDynamicShloka.chantCount}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-amber-200/50 border border-amber-400/50 text-left">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    {isKn ? "ಶುಭ ಸಮಯ" : isMr ? "शुभ वेळ" : isHi ? "शुभ समय" : "Auspicious Time"}
                  </span>
                  <span className="font-black text-amber-950 mt-0.5 block">
                    🌅 {data.personalizedDynamicShloka.auspiciousTime}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-amber-200/50 border border-amber-400/50 text-left">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    {isKn ? "ಶುಭ ದಿಕ್ಕು" : isMr ? "शुभ दिशा" : isHi ? "शुभ दिशा" : "Auspicious Direction"}
                  </span>
                  <span className="font-black text-amber-950 mt-0.5 block">
                    🧭 {data.personalizedDynamicShloka.auspiciousDirection}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-amber-200/50 border border-amber-400/50 text-left">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    {isKn ? "ಸಿದ್ಧಿ ಫಲ" : isMr ? "सिद्धि फल" : isHi ? "सिद्धि फल" : "Spiritual Fruit"}
                  </span>
                  <span className="font-black text-amber-950 mt-0.5 block">
                    🌺 {data.personalizedDynamicShloka.spiritualFruit}
                  </span>
                </div>
              </div>

              {/* Kundli Selection Rationale */}
              <div className="p-3.5 rounded-lg bg-amber-950/5 border border-amber-700/20 text-xs text-amber-900 leading-relaxed font-serif text-left">
                <span className="font-black text-amber-950 block mb-1">
                  ✨ {isKn ? "ಜ್ಯೋತಿಷ್ಯ ಆಯ್ಕೆಯ ಆಧಾರ:" : isMr ? "ज्योतिषशास्त्रीय निवडीचा आधार:" : isHi ? "ज्योतिषीय चयन का आधार:" : "Astrological Selection Basis:"}
                </span>
                {data.personalizedDynamicShloka.deityRationale}
              </div>
            </div>

            {/* Official Astrologer Benedictory Seal */}
            <div className="pt-6 border-t border-amber-700/20 text-center space-y-4 font-serif">
              <div className="inline-block p-2 bg-amber-100 rounded-full border border-amber-400 shadow-2xs">
                <span className="text-3xl">🕉️</span>
              </div>

              <h3 className="text-base font-black text-amber-950 uppercase tracking-widest font-serif">
                {t("blessingHeader")}
              </h3>

              <p className="text-base text-amber-950 leading-relaxed font-serif italic max-w-2xl mx-auto text-left sm:text-center">
                {data.astrologerBlessing}
              </p>

              <div className="pt-4 border-t border-amber-700/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-900 font-semibold font-serif">
                <div className="text-left space-y-0.5">
                  <p className="font-black text-amber-950 text-sm">
                    {isKn
                      ? "ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ"
                      : isMr
                        ? "बागगोण पंचांग ज्योतिष कार्यालय"
                        : isHi
                          ? "बागगोण पंचांग ज्योतिष कार्यालय"
                          : isTe
                            ? "బాగ్‌గోణ పంచాంగ జ్యోతిష్య కార్యాలయం"
                            : isTa
                              ? "பக்கோண பஞ்சாங்க ஜோதிட நிலையம்"
                              : "Baggona Panchanga Astrology Sansthan"}
                  </p>
                  <p className="text-amber-800">
                    {isKn ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ, ಕರ್ನಾಟಕ" : isMr ? "श्री क्षेत्र गोकर्ण, कर्नाटक" : isHi ? "श्री क्षेत्र गोकर्ण, कर्नाटक" : "Sri Kshetra Gokarna, Karnataka"}
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <p className="font-black text-amber-950 text-sm">
                    {isKn ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" : isMr ? "श्रीराम पंडित" : isHi ? "श्रीराम पंडित" : isTe ? "శ్రీరామ్ పండిత్" : isTa ? "ஸ்ரீராம் பண்டிட்" : "Shreeram Pandit"}
                  </p>
                  <p className="text-amber-800">
                    {isKn ? "ಮುಖ್ಯ ಜ್ಯೋತಿಷಿ • ಮೊ: ೯೯೭೨೩೩೯೩೬೨" : isMr ? "मुख्य ज्योतिषी • मो: ९९७२३३९३६२" : isHi ? "मुख्य ज्योतिषी • मो: ९९७२३३९३६२" : "Chief Astrologer • Ph: 9972339362"}
                  </p>
                </div>
              </div>

              {/* Sacred Shanti Shloka & Publication Tag */}
              <div className="pt-3 border-t border-amber-700/20 text-center space-y-1 font-serif">
                <p className="text-xs text-amber-900 font-bold italic">
                  ॥ ತ್ವದೀಯಂ ವಸ್ತು ಗೋವಿಂದ ತುಭ್ಯಮೇವ ಸಮರ್ಪಯೇ । ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ ॥
                </p>
                <p className="text-[11px] text-amber-800/80 font-bold tracking-wider">
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರಕಾಶನ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ॥
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

FiveYearPredictionPdfTemplate.displayName = "FiveYearPredictionPdfTemplate";
