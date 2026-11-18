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

  const paragraphSubheadingsKn = [
    "೧. ಪ್ರಮುಖ ಜೀವನ ತಿರುವು ಹಾಗೂ ಕರ್ಮಗತಿ",
    "೨. ವೃತ್ತಿ, ಆರ್ಥಿಕತೆ & ಕೌಟುಂಬಿಕ ಬೆಳವಣಿಗೆ",
    "೩. ದೈವಿಕ ರಕ್ಷಾ ಕವಚ ಹಾಗೂ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ"
  ];
  const paragraphSubheadingsMr = [
    "१. महत्त्वाचे जीवन वळण व कर्मगती",
    "२. व्यवसाय, आर्थिक प्रगती व कौटुंबिक सौख्य",
    "३. दैवी रक्षा कवच व शास्त्रोक्त उपाय"
  ];
  const paragraphSubheadingsHi = [
    "१. प्रमुख जीवन मोड़ एवं कर्मगति",
    "२. कार्यक्षेत्र, आर्थिक प्रगति एवं पारिवारिक सौहार्द",
    "३. दैवीय रक्षा कवच एवं शास्त्रोक्त उपाय"
  ];
  const paragraphSubheadingsTe = [
    "1. ముఖ్యమైన జీవిత మలుపు & కర్మగతి",
    "2. వృత్తి, ఆర్థికాభివృద్ధి & కుటుంబ సౌఖ్యం",
    "3. దైవ రక్షా కవచం & శాస్త్రోక్త పరిహారం"
  ];
  const paragraphSubheadingsTa = [
    "1. முக்கிய வாழ்க்கை திருப்புமுனை & கர்மகதி",
    "2. தொழில், பொருளாதார வளர்ச்சி & குடும்ப அமைதி",
    "3. தெய்வ ரக்ஷா கவசம் & சாஸ்திர பரிகாரம்"
  ];
  const paragraphSubheadingsEn = [
    "1. Major Life Direction Shift & Karmic Arc",
    "2. Career, Wealth & Family Evolution",
    "3. Divine Protection Shield & Remedial Guidance"
  ];

  const getParagraphSubheading = (pIdx: number, l: SixLang): string => {
    switch (l) {
      case "kn": return paragraphSubheadingsKn[pIdx] || "";
      case "mr": return paragraphSubheadingsMr[pIdx] || "";
      case "hi": return paragraphSubheadingsHi[pIdx] || "";
      case "te": return paragraphSubheadingsTe[pIdx] || "";
      case "ta": return paragraphSubheadingsTa[pIdx] || "";
      case "en":
      default:
        return paragraphSubheadingsEn[pIdx] || "";
    }
  };

  const getStatusBadgeClass = (status?: "favorable" | "good" | "moderate" | "caution") => {
    switch (status) {
      case "favorable":
      case "good":
        return "bg-emerald-100 text-emerald-950 border border-emerald-400 font-black";
      case "caution":
        return "bg-rose-100 text-rose-950 border border-rose-400 font-black";
      case "moderate":
      default:
        return "bg-amber-100 text-amber-950 border border-amber-400 font-black";
    }
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

      {/* ── 1. OPENING HOOK & CURRENT PSYCHOLOGICAL SOUL INQUEST ────────────── */}
      {data.openingHook && (
        <div data-section="opening-hook" className="pdf-section w-full px-12 mb-5 relative z-10">
          <div className="relative rounded-2xl border-2 border-amber-600/90 bg-gradient-to-br from-amber-100/95 via-yellow-50/95 to-amber-100/95 p-7 shadow-lg overflow-hidden">
            {/* Ornate double border */}
            <div className="absolute inset-2 border border-amber-700/40 rounded-xl pointer-events-none" />
            <div className="absolute inset-3 border border-dashed border-amber-700/25 rounded-xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Badge & Focus Theme */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-amber-700/30 pb-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-800/20 border border-amber-800/40 rounded-full text-xs font-black text-amber-950 uppercase tracking-widest shadow-2xs">
                  <span className="text-amber-800 text-sm">✨</span>
                  <span>
                    {isKn ? "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಆವರಿಸಿರುವ ಮುಖ್ಯ ಚಿಂತೆ & ಜ್ಯೋತಿಷ್ಯ ದರ್ಶನ"
                      : isMr ? "सध्या आपल्या मनातील मुख्य विचार व ज्योतिषीय दर्शन"
                        : isHi ? "वर्तमान में आपके मन का मुख्य चिंतन एवं ज्योतिषीय दर्शन"
                          : isTe ? "ప్రస్తుతం మీ మనస్సులోని ప్రధాన చింత & జ్యోతిష్య దర్శనం"
                            : isTa ? "தற்போது உங்கள் மனதில் உள்ள முதன்மை சிந்தனை & ஜோதிட தரிசனம்"
                              : "Current Soul Inquest & Astronomical Focus"}
                  </span>
                </div>
                <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-3 py-1 rounded-lg border border-amber-600/40">
                  🎯 {data.openingHook.coreFocusTheme}
                </span>
              </div>

              {/* Mind-Reading Opening Line in Royal Highlight Card */}
              <div className="p-4 rounded-xl bg-amber-900/10 border-2 border-amber-600/60 shadow-xs">
                <p className="text-xl font-black text-amber-950 font-serif italic leading-relaxed text-justify">
                  "{data.openingHook.openingLine}"
                </p>
              </div>

              {/* Beautifully Narrated First Paragraph */}
              <p className="text-base font-medium text-amber-950 font-serif leading-relaxed text-justify indent-6">
                {data.openingHook.firstParagraph}
              </p>

              {/* Emotional Validation & Turnaround Promise Quote */}
              <div className="p-3.5 rounded-xl bg-amber-200/70 border border-amber-500/60 flex items-center gap-3">
                <span className="text-2xl text-amber-800">🪔</span>
                <p className="text-sm font-bold text-amber-950 font-serif italic leading-normal">
                  {data.openingHook.emotionalValidationQuote}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CURRENT LIFE REALITY & LIVE TRANSITS SECTION (ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ & ಗೋಚಾರ ದರ್ಶನ) ── */}
      {data.currentLifeStatus && (
        <div data-section="current-life-status" className={sectionClass}>
          {/* Section Header Banner with Royal Gold Badge */}
          <div className="border-b-2 border-amber-700/40 pb-4 mb-8 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-200/60 border border-amber-500/40 rounded-full text-xs font-bold text-amber-900 uppercase tracking-widest mb-2 shadow-2xs">
              <span className="text-amber-800">⚡</span>
              <span>{data.currentLifeStatus.bannerBadge}</span>
            </div>
            <h2 className={`text-3xl font-extrabold font-serif ${primaryColorClass} tracking-wide flex items-center gap-3`}>
              <span className="text-3xl">🧭</span>
              <span>{data.currentLifeStatus.title}</span>
            </h2>
            <p className="text-sm text-amber-900/80 font-serif italic mt-1 leading-relaxed">
              {data.currentLifeStatus.subtitle}
            </p>
          </div>

          <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50/80 p-8 shadow-sm relative overflow-hidden space-y-6">
            {/* 0. Emotional Empathy & Heart Reassurance Card */}
            {data.currentLifeStatus.emotionalEmpathyHeading && (
              <div className="rounded-xl border-2 border-amber-600/70 bg-gradient-to-r from-amber-100/95 via-yellow-50/90 to-amber-100/95 p-6 shadow-xs font-serif">
                <div className="flex items-center gap-2 mb-2 text-amber-900 text-xs font-black tracking-widest uppercase">
                  <span className="text-amber-800 text-lg">💖</span>
                  <span>{data.currentLifeStatus.emotionalEmpathyHeading}</span>
                </div>
                <p className="text-base font-bold text-amber-950 leading-relaxed italic">
                  "{data.currentLifeStatus.emotionalEmpathyText}"
                </p>
              </div>
            )}

            {/* 0B. 4-Pillars Visual Traffic-Light Dashboard */}
            {data.currentLifeStatus.fourPillarsDashboard && (
              <div className="space-y-3 font-serif">
                <div className="flex items-center justify-between border-b border-amber-700/20 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <span>🚦</span>
                    <span>
                      {isKn ? "ಪ್ರಸ್ತುತ ಜೀವನದ ೪ ಸ್ತಂಭಗಳ ಸ್ಥಿತಿ ದರ್ಶನ"
                        : isMr ? "सध्याच्या जीवनातील ४ आधारस्तंभांची स्थिती"
                          : isHi ? "वर्तमान जीवन के ४ प्रमुख स्तंभों की स्थिति"
                            : isTe ? "ప్రస్తుత జీవిత 4 స్తంభాల స్థితి"
                              : isTa ? "தற்போதைய வாழ்க்கையின் 4 தூண்கள் நிலை"
                                : "Current 4 Pillars Status Dashboard"}
                    </span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 italic">
                    {isKn ? "ಸಾಮಾನ್ಯ ಓದುಗರಿಗೆ ಸರಳ ಅರ್ಥವಿವರಣೆ"
                      : isMr ? "सामान्य वाचकांसाठी सोपे स्पष्टीकरण"
                        : isHi ? "सरल बोधगम्य व्याख्या"
                          : "Clear Plain-Language Insights"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Career */}
                  <div className="p-4 rounded-xl bg-white/85 border border-amber-300 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                        <span>💼</span>
                        <span>{isKn ? "ಉದ್ಯೋಗ & ವೃತ್ತಿ" : isMr ? "नोकरी व व्यवसाय" : isHi ? "कार्यक्षेत्र एवं व्यवसाय" : isTe ? "ఉద్యోగం & వృత్తి" : isTa ? "தொழில் & வேலை" : "Career & Work"}</span>
                      </span>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(data.currentLifeStatus.fourPillarsDashboard.career.status)}`}>
                        {data.currentLifeStatus.fourPillarsDashboard.career.badgeText}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-amber-950 leading-relaxed font-serif">
                      {data.currentLifeStatus.fourPillarsDashboard.career.oneLiner}
                    </p>
                  </div>

                  {/* Wealth */}
                  <div className="p-4 rounded-xl bg-white/85 border border-amber-300 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                        <span>💰</span>
                        <span>{isKn ? "ಆರ್ಥಿಕತೆ & ಹಣಕಾಸು" : isMr ? "आर्थिक स्थिती व वित्त" : isHi ? "धन एवं आर्थिक स्थिति" : isTe ? "ఆర్థికం & నిధులు" : isTa ? "பொருளாதாரம் & சேமிப்பு" : "Wealth & Finance"}</span>
                      </span>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(data.currentLifeStatus.fourPillarsDashboard.wealth.status)}`}>
                        {data.currentLifeStatus.fourPillarsDashboard.wealth.badgeText}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-amber-950 leading-relaxed font-serif">
                      {data.currentLifeStatus.fourPillarsDashboard.wealth.oneLiner}
                    </p>
                  </div>

                  {/* Family */}
                  <div className="p-4 rounded-xl bg-white/85 border border-amber-300 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                        <span>🏡</span>
                        <span>{isKn ? "ಕುಟುಂಬ & ಮನಶ್ಶಾಂತಿ" : isMr ? "कुटुंब व मानसिक शांतता" : isHi ? "परिवार एवं मानसिक शांति" : isTe ? "కుటుంబం & ప్రశాంతత" : isTa ? "குடும்பம் & மன அமைதி" : "Family & Peace"}</span>
                      </span>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(data.currentLifeStatus.fourPillarsDashboard.family.status)}`}>
                        {data.currentLifeStatus.fourPillarsDashboard.family.badgeText}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-amber-950 leading-relaxed font-serif">
                      {data.currentLifeStatus.fourPillarsDashboard.family.oneLiner}
                    </p>
                  </div>

                  {/* Health */}
                  <div className="p-4 rounded-xl bg-white/85 border border-amber-300 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                        <span>🩺</span>
                        <span>{isKn ? "ಆರೋಗ್ಯ & ಪ್ರಾಣಶಕ್ತಿ" : isMr ? "आरोग्य व ऊर्जा" : isHi ? "स्वास्थ्य एवं प्राणशक्ति" : isTe ? "ఆరోగ్యం & శక్తి" : isTa ? "ஆரோக்கியம் & பிராணன்" : "Health & Energy"}</span>
                      </span>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(data.currentLifeStatus.fourPillarsDashboard.health.status)}`}>
                        {data.currentLifeStatus.fourPillarsDashboard.health.badgeText}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-amber-950 leading-relaxed font-serif">
                      {data.currentLifeStatus.fourPillarsDashboard.health.oneLiner}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Grid: Running Dasha-Bhukti vs Real-Time Gochara Transits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Running Dasha & Antardasha Card */}
              <div className="rounded-xl border-2 border-amber-600/60 bg-gradient-to-br from-amber-100/90 to-yellow-50/80 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-amber-700/20 pb-3 mb-3">
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⏳</span>
                      <span>
                        {isKn ? "೧. ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶೆ & ಅಂತರ್ದಶೆ" : isMr ? "१. चालू महादशा व अंतर्दशा" : isHi ? "१. चालू महादशा एवं अंतर्दशा" : isTe ? "1. నడుస్తున్న మహర్దశ & అంతర్దశ" : isTa ? "1. நடப்பு மகாதிசை & புத்தி" : "1. Active Mahadasha & Antardasha"}
                      </span>
                    </span>
                    <span className="bg-amber-900 text-amber-100 font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-2xs">
                      {data.currentLifeStatus.currentAgeFormatted}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3 font-serif">
                    <p className="text-xl font-black text-amber-950">
                      {data.currentLifeStatus.activeMahadasha} • {data.currentLifeStatus.activeBhukti}
                    </p>
                    <p className="text-xs font-bold text-amber-800">
                      {data.currentLifeStatus.activeDashaPeriodText}
                    </p>
                  </div>

                  <p className="text-sm text-amber-950 font-serif leading-relaxed">
                    {data.currentLifeStatus.karmicFlowSummary}
                  </p>
                </div>
              </div>

              {/* 2. Real-Time Live Transits Card (Saturn, Jupiter, Rahu-Ketu) */}
              <div className="rounded-xl border-2 border-amber-600/60 bg-gradient-to-br from-amber-100/90 to-orange-50/80 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-amber-700/20 pb-3 mb-3">
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🪐</span>
                      <span>
                        {isKn ? "೨. ಲೈವ್ ಗ್ರಹ ಗೋಚಾರ ಸ್ಥಿತಿ" : isMr ? "२. थेट ग्रह गोचर स्थिती" : isHi ? "२. लाइव ग्रह गोचर स्थिति" : isTe ? "2. లైవ్ గ్రహ గోచార స్థితి" : isTa ? "2. நேரலை கிரக கோச்சார நிலை" : "2. Real-Time Planetary Transits"}
                      </span>
                    </span>
                    <span className="bg-amber-800/80 text-amber-50 font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-2xs">
                      {isKn ? "ಜನ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ" : isMr ? "चंद्र राशीनुसार" : isHi ? "चन्द्र राशि अनुसार" : "From Natal Moon"}
                    </span>
                  </div>

                  <div className="space-y-3 font-serif text-sm">
                    {/* Saturn Gochara */}
                    <div className="p-2.5 rounded-lg bg-white/70 border border-amber-300">
                      <span className="text-xs font-black text-amber-900 block mb-0.5">
                        🪐 {data.currentLifeStatus.shaniGocharaStatus}
                      </span>
                      <p className="text-xs text-amber-950 leading-relaxed">
                        {data.currentLifeStatus.shaniGocharaImpact}
                      </p>
                    </div>

                    {/* Jupiter Gochara */}
                    <div className="p-2.5 rounded-lg bg-white/70 border border-amber-300">
                      <span className="text-xs font-black text-amber-900 block mb-0.5">
                        ✨ {data.currentLifeStatus.guruGocharaStatus}
                      </span>
                      <p className="text-xs text-amber-950 leading-relaxed">
                        {data.currentLifeStatus.guruGocharaImpact}
                      </p>
                    </div>

                    {/* Rahu-Ketu Axis */}
                    <div className="p-2.5 rounded-lg bg-white/70 border border-amber-300">
                      <span className="text-xs font-black text-amber-900 block mb-0.5">
                        🐉 {data.currentLifeStatus.rahuKetuStatus}
                      </span>
                      <p className="text-xs text-amber-950 leading-relaxed">
                        {data.currentLifeStatus.rahuKetuImpact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chandra Bala & Daily Energy Meter Card */}
            <div className="rounded-xl border border-amber-700/30 bg-white/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 font-serif">
              <div className="flex items-center gap-3">
                <span className="text-3xl text-amber-700">🌙</span>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                    {isKn ? "ಚಂದ್ರಬಲ & ದೈನಂದಿನ ಪ್ರಾಣಶಕ್ತಿ ಮಾನ" : isMr ? "चंद्रबल व दैनंदिन प्राणशक्ती" : isHi ? "चंद्रबल एवं दैनिक प्राणशक्ति" : "Chandra Bala & Daily Prana Shakti"}
                  </span>
                  <p className="text-sm font-bold text-amber-950 mt-0.5">
                    {data.currentLifeStatus.energyDesc}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-center px-4 py-2 rounded-lg bg-amber-100 border border-amber-300">
                <span className="text-xl font-black text-amber-950 block">
                  {formatNumber6L(data.currentLifeStatus.energyScore, lang)}%
                </span>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">
                  {data.currentLifeStatus.energyMeterLabel}
                </span>
              </div>
            </div>

            {/* Turning Point Timeline Card: Exact Date/Season */}
            {data.currentLifeStatus.turningPointTimeline && (
              <div className="rounded-xl border-2 border-amber-600/60 bg-gradient-to-r from-amber-100 via-yellow-100/90 to-amber-100 p-4 font-serif flex items-start gap-3 shadow-2xs">
                <span className="text-2xl text-amber-800 leading-none pt-0.5">⏳</span>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-0.5">
                    {isKn ? "ಗ್ರಹಗಳ ಬದಲಾವಣೆ ಹಾಗೂ ಸುವರ್ಣ ತಿರುವು ಆರಂಭವಾಗುವ ನಿಖರ ಕಾಲಾವಧಿ:"
                      : isMr ? "ग्रह बदल व सुवर्ण वळण सुरू होण्याचा निश्चित काळ:"
                        : isHi ? "ग्रह परिवर्तन एवं स्वर्णिम मोड़ प्रारंभ होने का निश्चित समय:"
                          : isTe ? "గ్రహ మార్పు & సువర్ణ మలుపు ప్రారంభమయ్యే ఖచ్చిత సమయం:"
                            : isTa ? "கிரக மாற்றம் & பொற்கால தொடக்கத்தின் திட்டவட்டமான காலம்:"
                              : "Exact Turning Point Timeline:"}
                  </span>
                  <p className="text-sm font-black text-amber-950 font-serif leading-relaxed">
                    {data.currentLifeStatus.turningPointTimeline}
                  </p>
                </div>
              </div>
            )}

            {/* Immediate 2-Minute Daily Action / Ritual (Zero Cost) */}
            {data.currentLifeStatus.immediateSimpleActionTitle && (
              <div className="rounded-xl border-2 border-amber-600/50 bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-100/90 p-5 font-serif space-y-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl text-amber-800">🪔</span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                    {data.currentLifeStatus.immediateSimpleActionTitle}
                  </span>
                </div>
                <p className="text-sm font-bold text-amber-950 leading-relaxed italic bg-white/70 p-3.5 rounded-lg border border-amber-200">
                  {data.currentLifeStatus.immediateSimpleActionText}
                </p>
              </div>
            )}

            {/* Immediate 6-12 Months Strategic Horizon Grid */}
            <div className="border-t border-amber-700/20 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl text-amber-800">🎯</span>
                <h3 className="text-lg font-black text-amber-950 font-serif">
                  {isKn ? "೩. ಮುಂದಿನ ೬ ರಿಂದ ೧೨ ತಿಂಗಳ ತಕ್ಷಣದ ಜೀವನ ಮುನ್ನೋಟ" : isMr ? "३. आगामी ६ ते १२ महिन्यांचे तात्काळ जीवन चित्र" : isHi ? "३. आगामी ६ से १२ महीनों का तात्कालिक जीवन परिदृश्य" : isTe ? "3. రాబోయే 6 నుండి 12 నెలల తక్షణ జీవిత దృక్పథం" : isTa ? "3. அடுத்த 6 முதல் 12 மாதங்களுக்கான உடனடி வாழ்க்கை நோக்கு" : "3. Immediate 6 to 12-Month Strategic Life Horizon"}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Career */}
                <div className="rounded-xl border border-amber-300 bg-amber-100/50 p-4 font-serif">
                  <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5 mb-1.5">
                    <span>💼</span>
                    <span>{isKn ? "ಉದ್ಯೋಗ & ವೃತ್ತಿ ಮುನ್ನೋಟ" : isMr ? "नोकरी व व्यवसाय" : isHi ? "कार्यक्षेत्र एवं व्यवसाय" : "Career & Profession"}</span>
                  </span>
                  <p className="text-sm text-amber-950 leading-relaxed">{data.currentLifeStatus.careerImmediateFocus}</p>
                </div>

                {/* Wealth */}
                <div className="rounded-xl border border-amber-300 bg-amber-100/50 p-4 font-serif">
                  <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5 mb-1.5">
                    <span>💰</span>
                    <span>{isKn ? "ಆರ್ಥಿಕತೆ & ಉಳಿತಾಯ ಭದ್ರತೆ" : isMr ? "आर्थिक स्थिती व बचत" : isHi ? "धन एवं बचत सुरक्षा" : "Wealth & Asset Prudence"}</span>
                  </span>
                  <p className="text-sm text-amber-950 leading-relaxed">{data.currentLifeStatus.wealthImmediateFocus}</p>
                </div>

                {/* Family */}
                <div className="rounded-xl border border-amber-300 bg-amber-100/50 p-4 font-serif">
                  <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5 mb-1.5">
                    <span>🏡</span>
                    <span>{isKn ? "ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ & ನೆಮ್ಮದಿ" : isMr ? "कौटुंबिक सुख व शांतता" : isHi ? "पारिवारिक सुख एवं शांति" : "Family Harmony & Peace"}</span>
                  </span>
                  <p className="text-sm text-amber-950 leading-relaxed">{data.currentLifeStatus.familyImmediateFocus}</p>
                </div>

                {/* Health */}
                <div className="rounded-xl border border-amber-300 bg-amber-100/50 p-4 font-serif">
                  <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5 mb-1.5">
                    <span>🩺</span>
                    <span>{isKn ? "ಆರೋಗ್ಯ, ಮನೋಬಲ & ವಿಶ್ರಾಂತಿ" : isMr ? "आरोग्य व मनोबल" : isHi ? "स्वास्थ्य एवं मनोबल" : "Health, Vitality & Rest"}</span>
                  </span>
                  <p className="text-sm text-amber-950 leading-relaxed">{data.currentLifeStatus.healthImmediateFocus}</p>
                </div>
              </div>

              {/* Immediate Caution & Peace Mantra */}
              <div className="rounded-xl border-2 border-amber-600/50 bg-gradient-to-r from-amber-100 via-yellow-100/80 to-amber-100 p-5 mt-4 font-serif space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl text-amber-800 leading-none pt-0.5">🛡️</span>
                  <div>
                    <span className="text-xs font-black text-amber-900 uppercase block mb-1">
                      {isKn ? "ಪ್ರಸ್ತುತ ಹಂತದ ದೈನಂದಿನ ಶಾಂತಿ ಮಂತ್ರ & ಸನ್ನಿಧಾನದ ಸೇವೆ" : isMr ? "सध्याच्या काळातील शांती मंत्र व पूजा" : isHi ? "वर्तमान कालखंड का शांति मंत्र एवं पूजा" : "Immediate Peace Routine & Recommended Temple Seva"}
                    </span>
                    <p className="text-base font-bold text-amber-950 leading-relaxed">
                      {data.currentLifeStatus.dailyMantraText}
                    </p>
                    <p className="text-xs text-amber-900 font-semibold mt-1">
                      {data.currentLifeStatus.prescribedSevaText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

          {/* ── 9-GRAHA SPHUTA & BHAVA CALCULATION MATRIX ──────── */}
          {data.planetaryCalculations && data.planetaryCalculations.length > 0 && (
            <div className="mt-6 pt-5 border-t-2 border-amber-800/30 relative z-10 px-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg text-amber-800">🪐</span>
                  <h3 className="text-lg font-black text-amber-950 font-serif tracking-normal">
                    {isKn ? "ಜನ್ಮ ಕುಂಡಲಿ ನವಗ್ರಹ ಸ್ಪಷ್ಟ ಗಣಿತ & ಭಾವ ಲೆಕ್ಕಾಚಾರಗಳು"
                      : isMr ? "जन्म कुंडली नवग्रह स्पष्ट गणित व भाव हिशोब"
                        : isHi ? "जन्म कुंडली नवग्रह स्पष्ट गणित एवं भाव गणना"
                          : isTe ? "జన్మ కుండలి నవగ్రహ స్పష్ట గణితం & భావ లెక్కింపు"
                            : isTa ? "ஜென்ம ஜாதக நவகிரக ஸ்பஷ்ட கணிதம் & பாவக் கணக்கீடு"
                              : "Natal 9-Graha Sphuta & Bhava Calculations Matrix"}
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-900/80 bg-amber-200/60 px-2.5 py-0.5 rounded-md border border-amber-700/30">
                  {data.jananaPanchanga?.ayanamsha || "Lahiri Ayanamsa"}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-amber-700/40 bg-white/70 shadow-xs">
                <table className="w-full text-xs font-serif border-collapse">
                  <thead>
                    <tr className="bg-amber-200/80 text-amber-950 border-b border-amber-700/40 text-left font-bold">
                      <th className="p-2.5 pl-3">{isKn ? "ಗ್ರಹ" : isMr ? "ग्रह" : isHi ? "ग्रह" : isTe ? "గ్రహం" : isTa ? "கிரகம்" : "Graha"}</th>
                      <th className="p-2.5">{isKn ? "ಸ್ಪಷ್ಟಾಂಶ (ಅಂಶ)" : isMr ? "अंश (स्पष्ट)" : isHi ? "अंश (डिग्री)" : isTe ? "అంశలు" : isTa ? "பாகை" : "Degree"}</th>
                      <th className="p-2.5">{isKn ? "ರಾಶಿ" : isMr ? "राशी" : isHi ? "राशि" : isTe ? "రాశి" : isTa ? "ராசி" : "Rashi"}</th>
                      <th className="p-2.5">{isKn ? "ಭಾವ (ಸ್ಥಾನ)" : isMr ? "भाव" : isHi ? "भाव" : isTe ? "భావం" : isTa ? "பாவம்" : "House"}</th>
                      <th className="p-2.5">{isKn ? "ನಕ್ಷತ್ರ & ಪಾದ" : isMr ? "नक्षत्र व चरण" : isHi ? "नक्षत्र एवं पाद" : isTe ? "నక్షత్రం & పాదం" : isTa ? "நட்சத்திரம் & பாதம்" : "Nakshatra & Pada"}</th>
                      <th className="p-2.5 pr-3">{isKn ? "ಅವಸ್ಥೆ & ಬಲ" : isMr ? "अवस्था व बल" : isHi ? "अवस्था एवं बल" : isTe ? "అవస్థ & బలం" : isTa ? "அவஸ்தை & பலம்" : "Dignity"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-700/20 text-amber-950">
                    {data.planetaryCalculations.map((p, pIdx) => (
                      <tr key={p.planetName || pIdx} className={pIdx % 2 === 0 ? "bg-amber-50/40" : "bg-white/50"}>
                        <td className="p-2 pl-3 font-black text-amber-900">{p.localizedName}</td>
                        <td className="p-2 font-mono font-bold">{p.degreeFormatted}</td>
                        <td className="p-2 font-bold">{p.localizedRashi}</td>
                        <td className="p-2 font-bold">{formatNumber6L(p.house, lang)} {isKn ? "ನೇ ಭಾವ" : isMr ? "वे भाव" : isHi ? "वें भाव" : "H"}</td>
                        <td className="p-2">{p.nakshatra}</td>
                        <td className="p-2 pr-3 font-semibold text-amber-900">{p.dignity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── COLLECTION NAGALU & JEWELRY FORECAST (೫ ವರ್ಷಗಳ ಚಿನ್ನಾಭರಣ, ನಗನಾಣ್ಯ & ದ್ರವ್ಯ ಸಂಗ್ರಹ ಯೋಗ) ── */}
      {data.nagaluRoadmap && (
        <div data-section="collection-nagalu" className="pdf-section w-full px-12 mb-6 relative z-10">
          <div className="relative rounded-2xl border-2 border-amber-600/80 bg-gradient-to-br from-amber-100/95 via-yellow-50/90 to-amber-100/95 p-6 shadow-md overflow-hidden">
            {/* Ornate Inner Frame */}
            <div className="absolute inset-2 border border-amber-700/30 rounded-xl pointer-events-none" />
            <div className="absolute inset-3 border border-dashed border-amber-700/20 rounded-xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-amber-700/30 pb-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-800/15 border border-amber-800/30 rounded-full text-xs font-black text-amber-950 uppercase tracking-widest mb-1.5">
                    <span>🪙💍</span>
                    <span>{data.nagaluRoadmap.title}</span>
                  </div>
                  <p className="text-xs text-amber-900/80 font-serif italic">
                    {data.nagaluRoadmap.subtitle}
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-amber-200/80 rounded-xl border border-amber-600/40 text-xs font-black text-amber-950">
                  {data.nagaluRoadmap.favorableGemstoneMetals}
                </div>
              </div>

              {/* Dhana Bhava Narrative Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-serif">
                <div className="p-3.5 rounded-xl bg-white/80 border border-amber-300 shadow-2xs space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                    💎 {isKn ? "ಧನಭಾವ (೨ನೇ ಮನೆ) & ದ್ರವ್ಯ ಸಂಚಯ ಯೋಗ" : isMr ? "द्वितीय भाव व सुवर्ण संचय" : isHi ? "द्वितीय भाव एवं स्वर्ण संचय" : "Dhana Bhava & Treasury Protection"}
                  </span>
                  <p className="text-amber-950 leading-relaxed">
                    {data.nagaluRoadmap.dhanaBhavaDisposition}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/80 border border-amber-300 shadow-2xs space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                    ✨ {isKn ? "೫ ವರ್ಷಗಳ ಒಟ್ಟು ಚಿನ್ನ-ಆಭರಣ ವೃದ್ಧಿ ಮುನ್ನೋಟ" : isMr ? "५ वर्षांचा एकूण सुवर्ण वृद्धी अहवाल" : isHi ? "५ वर्षीय स्वर्ण-आभूषण वृद्धि सारांश" : "5-Year Overall Jewelry Growth"}
                  </span>
                  <p className="text-amber-950 leading-relaxed">
                    {data.nagaluRoadmap.overallYogaSummary}
                  </p>
                </div>
              </div>

              {/* 5-Year Year-by-Year Nagalu Timeline Table */}
              <div className="overflow-x-auto rounded-xl border border-amber-700/40 bg-white/80 shadow-xs">
                <table className="w-full text-xs font-serif border-collapse">
                  <thead>
                    <tr className="bg-amber-200/80 text-amber-950 border-b border-amber-700/40 text-left font-bold">
                      <th className="p-2.5 pl-3">{isKn ? "ವರ್ಷ & ಸಂವತ್ಸರ" : isMr ? "वर्ष व संवत्सर" : isHi ? "वर्ष एवं संवत्सर" : "Year & Samvatsara"}</th>
                      <th className="p-2.5">{isKn ? "ನಗನಾಣ್ಯ ಯೋಗ ಬಲ" : isMr ? "सुवर्ण संचय योग" : isHi ? "स्वर्णिम योग" : "Suitability"}</th>
                      <th className="p-2.5">{isKn ? "ಚಿನ್ನಾಭರಣ ಖರೀದಿ ಭವಿಷ್ಯ & ಮಾರ್ಗದರ್ಶನ" : isMr ? "दागिने खरेदी भविष्य व मार्गदर्शन" : isHi ? "स्वर्ण क्रय फलादेश एवं मार्गदर्शन" : "Gold & Jewelry Forecast"}</th>
                      <th className="p-2.5 pr-3">{isKn ? "ಶುಭ ಮುಹೂರ್ತ & ನಕ್ಷತ್ರ" : isMr ? "शुभ मुहूर्त व नक्षत्र" : isHi ? "शुभ मुहूर्त एवं नक्षत्र" : "Auspicious Muhurta"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-700/20 text-amber-950">
                    {data.nagaluRoadmap.yearlyTimeline.map((yrItem, idx) => (
                      <tr key={yrItem.yearIndex || idx} className={idx % 2 === 0 ? "bg-amber-50/40" : "bg-white/50"}>
                        <td className="p-2.5 pl-3 font-bold text-amber-900 whitespace-nowrap">
                          {yrItem.yearRange}
                          <span className="block text-[10px] text-amber-700 font-normal">{yrItem.samvatsara}</span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="text-amber-600 font-bold">{yrItem.starRating}</span>
                          <span className="ml-1.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900">
                            {formatNumber6L(yrItem.suitabilityScore, lang)}%
                          </span>
                        </td>
                        <td className="p-2.5 leading-relaxed">{yrItem.prediction}</td>
                        <td className="p-2.5 pr-3 font-semibold text-amber-900 whitespace-nowrap">{yrItem.auspiciousMuhurta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EXECUTIVE GOLDEN HERO BOX: 5-YEAR DESTINY AT A GLANCE ────────── */}
      <div data-section="executive-glance" className="pdf-section w-full px-12 mb-6 relative z-10">
        <div className="relative rounded-2xl border-2 border-amber-600/80 bg-gradient-to-br from-amber-100/95 via-yellow-50/90 to-amber-100/95 p-6 shadow-md overflow-hidden">
          {/* Inner decorative border */}
          <div className="absolute inset-2 border border-amber-700/30 rounded-xl pointer-events-none" />
          <div className="absolute inset-3 border border-dashed border-amber-700/20 rounded-xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-amber-700/30 pb-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-800/15 border border-amber-800/30 rounded-full text-xs font-black text-amber-950 uppercase tracking-widest">
                <span>✨</span>
                <span>
                  {isKn ? "೫ ವರ್ಷಗಳ ಜೀವಮಾನದ ಸುವರ್ಣ ತಿರುವು • ತ್ವರಿತ ದರ್ಶನ"
                    : isMr ? "५ वर्षांचे सुवर्ण वळण • संक्षिप्त दृष्टीक्षेप"
                      : isHi ? "५ वर्षों का स्वर्णिम मोड़ • त्वरित दर्शन"
                        : isTe ? "5 సంవత్సరాల సువర్ణ మలుపు • సంక్షిప్త దర్శనం"
                          : isTa ? "5 ஆண்டுகளின் பொற்கால திருப்புமுனை • விரைவுப் பார்வை"
                            : "5-Year Sovereign Turnaround • At A Glance"}
                </span>
              </div>
              <span className="text-xs font-bold text-amber-900 font-serif italic">
                {data.devoteeName} • {formatNumber6L(data.startYear, lang)}–{formatNumber6L(data.endYear, lang)}
              </span>
            </div>

            {/* 4 Golden Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-serif">
              <div className="p-3 rounded-xl bg-white/80 border border-amber-300 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                  🌟 {isKn ? "ಸುವರ್ಣ ಭಾಗ್ಯೋದಯ" : isMr ? "सुवर्ण भाग्योदय" : isHi ? "स्वर्णिम भाग्योदय" : isTe ? "సువర్ణ భాగ్యోదయం" : isTa ? "பொற்கால தொடக்கம்" : "Peak Opportunity"}
                </span>
                <p className="text-base font-black text-amber-950 mt-1 font-serif">
                  {data.macroSummary.peakGoldenYear}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 border border-amber-300 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                  ⚡ {isKn ? "ಪ್ರಾಣಶಕ್ತಿ ಸ್ಕೋರ್" : isMr ? "प्राणशक्ती गुणांक" : isHi ? "प्राणशक्ति गुणांक" : isTe ? "ప్రాణశక్తి స్కోరు" : isTa ? "பிராணசக்தி மதிப்பெண்" : "Vitality Score"}
                </span>
                <p className="text-base font-black text-amber-950 mt-1 font-serif">
                  {data.currentLifeStatus ? `${formatNumber6L(data.currentLifeStatus.energyScore, lang)}%` : "೮೮%"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 border border-amber-300 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                  💎 {isKn ? "ದೈವಿಕ ರಕ್ಷಾ ಕವಚ" : isMr ? "दैवी रक्षा कवच" : isHi ? "दैवीय रक्षा कवच" : isTe ? "రక్షా కవచం" : isTa ? "ரக்ஷா கவசம்" : "Sacred Shield"}
                </span>
                <p className="text-sm font-black text-amber-950 mt-1 font-serif line-clamp-1">
                  {data.remedies.gemstoneRecommendation}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 border border-amber-300 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                  ⏳ {isKn ? "ಮುಖ್ಯ ಪರಿಹಾರ" : isMr ? "मुख्य उपाय" : isHi ? "मुख्य परिहार" : isTe ? "ముఖ్య పరిహారం" : isTa ? "முக்கிய பரிகாரம்" : "Immediate Seva"}
                </span>
                <p className="text-xs font-bold text-amber-950 mt-1 font-serif line-clamp-2">
                  {data.currentLifeStatus?.prescribedSevaText || data.remedies.gokarnaParihara}
                </p>
              </div>
            </div>

            {/* 5-Year Sovereign Guiding Destiny Quote */}
            <div className="p-3.5 rounded-xl bg-amber-200/60 border border-amber-400/80 flex items-start gap-3">
              <span className="text-xl text-amber-800 leading-none pt-0.5">📜</span>
              <div>
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest block mb-0.5">
                  {isKn ? "೫ ವರ್ಷಗಳ ದೈವಿಕ ಧ್ಯೇಯವಾಕ್ಯ" : isMr ? "५ वर्षांचे दिव्य जीवनसूत्र" : isHi ? "५-वर्षीय दिव्य जीवन सूत्र" : isTe ? "5 సంవత్సరాల దివ్య జీవన సూత్రం" : isTa ? "5 ஆண்டுகளின் தெய்வீக தாரக மந்திரம்" : "Sovereign 5-Year Destiny Axiom"}
                </span>
                <p className="text-sm font-bold text-amber-950 font-serif italic leading-relaxed">
                  "{data.macroSummary.destinyTheme}"
                </p>
              </div>
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
                          <span className="font-black px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-950 border border-amber-300">
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
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] ${item.severity === "critical" || item.severity === "high"
                              ? "bg-amber-200/90 text-amber-950 border border-amber-400 font-black shadow-2xs"
                              : "bg-amber-100/70 text-amber-900 border border-amber-300 font-bold"
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
        const knOrdinals = ["ಒಂದು (೧)", "ಎರಡು (೨)", "ಮೂರು (೩)", "ನಾಲ್ಕು (೪)", "ಐದು (೫)"];
        const mrOrdinals = ["पहिले (१)", "दुसरे (२)", "तिसरे (३)", "चौथे (४)", "पाचवे (५)"];
        const hiOrdinals = ["प्रथम (१)", "द्वितीय (२)", "तृतीय (३)", "चतुर्थ (४)", "पंचम (५)"];
        const teOrdinals = ["మొదటి (౧)", "రెండవ (౨)", "మూడవ (౩)", "నాల్గవ (౪)", "ఐదవ (౫)"];
        const taOrdinals = ["முதல் (௧)", "இரண்டாம் (௨)", "மூன்றாம் (௩)", "நான்காம் (௪)", "ஐந்தாம் (௫)"];

        const samvatText = isKn ? yr.samvatsaraKn
          : isMr ? `${yr.samvatsaraKn} संवत्सर`
            : isHi ? `${yr.samvatsaraKn} संवत्सर`
              : isTe ? `${yr.samvatsaraKn || yr.samvatsaraEn} సంవత్సరం`
                : isTa ? `${yr.samvatsaraKn || yr.samvatsaraEn} வருடம்`
                  : yr.samvatsaraEn;

        const resolvedYearTitle = isKn
          ? `ವರ್ಷ ${knOrdinals[idx] || (idx + 1)}: ${yr.gregorianRange} (${samvatText})`
          : isMr
            ? `वर्ष ${mrOrdinals[idx] || (idx + 1)}: ${yr.gregorianRange} (${samvatText})`
            : isHi
              ? `वर्ष ${hiOrdinals[idx] || (idx + 1)}: ${yr.gregorianRange} (${samvatText})`
              : isTe
                ? `సంవత్సరం ${teOrdinals[idx] || (idx + 1)}: ${yr.gregorianRange} (${samvatText})`
                : isTa
                  ? `ஆண்டு ${taOrdinals[idx] || (idx + 1)}: ${yr.gregorianRange} (${samvatText})`
                  : `Year ${idx + 1}: ${yr.gregorianRange} (${samvatText})`;

        return (
          <div key={`annual-year-${yr.yearIndex ?? idx}`} data-section={`year-${idx + 1}`} className={sectionClass}>
            {renderChapterBanner(
              chapterNum,
              "🗓️",
              `ವರ್ಷ ${knOrdinals[idx] || (idx + 1)}: ${yr.gregorianRange} (${samvatText})`,
              `Year ${idx + 1}: ${yr.gregorianRange} (${samvatText})`,
              resolvedYearTitle
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
              {/* Visual Year Dashboard Card: Accessible to Every Reader */}
              <div className="rounded-2xl border-2 border-amber-600/70 bg-gradient-to-br from-amber-100/95 via-yellow-50/90 to-amber-100/90 p-6 shadow-xs font-serif space-y-4">
                {/* Header: Star display + theme badge + vitality */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-amber-700/25 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg tracking-wider" aria-label="Star Rating">
                      {yr.starDisplay || "⭐⭐⭐⭐"}
                    </span>
                    {yr.vitalityScore && (
                      <span className="bg-amber-900 text-amber-100 text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                        {formatNumber6L(yr.vitalityScore, lang)}% {isKn ? "ಭಾಗ್ಯೋದಯ ಬಲ" : isMr ? "भाग्योदय बळ" : isHi ? "भाग्योदय बल" : isTe ? "భాగ్యోదయ బలం" : isTa ? "பாக்யோதய பலம்" : "Auspicious Force"}
                      </span>
                    )}
                  </div>
                  {yr.yearThemeBadge && (
                    <span className="bg-amber-200/90 text-amber-950 font-black text-xs px-3 py-1 rounded-full border border-amber-500/60 shadow-2xs">
                      🌟 {yr.yearThemeBadge}
                    </span>
                  )}
                </div>

                {/* 1-Sentence Crystal Clear Takeaway Quote Callout */}
                {yr.yearTakeawayOneLiner && (
                  <div className="p-4 rounded-xl bg-white/90 border-2 border-amber-500/60 shadow-2xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">
                      💬 {isKn ? "ಈ ವರ್ಷದ ಮುಖ್ಯಾಂಶ (ಏಕವಾಕ್ಯ ಸಾರಾಂಶ)"
                        : isMr ? "या वर्षाचा मुख्य निष्कर्ष (एका ओळीत सारांश)"
                          : isHi ? "इस वर्ष का मुख्य निष्कर्ष (एक पंक्ति में सार)"
                            : isTe ? "ఈ సంవత్సరపు ముఖ్యాంశం (ఒకే వాక్య సారాంశం)"
                              : isTa ? "இந்த ஆண்டின் முக்கிய சுருக்கம் (ஒரே வரி சுருக்கம்)"
                                : "Year's Core Takeaway (One-Line Summary)"}
                    </span>
                    <p className="text-base font-black text-amber-950 leading-relaxed font-serif italic">
                      "{yr.yearTakeawayOneLiner}"
                    </p>
                  </div>
                )}

                {/* 4 Pillars Annual Verdict Pills */}
                {yr.fourPillarsAnnualVerdict && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200 text-center space-y-1">
                      <span className="text-[10px] font-black text-amber-900 uppercase block">
                        💼 {isKn ? "ವೃತ್ತಿ" : isMr ? "व्यवसाय" : isHi ? "कार्यक्षेत्र" : isTe ? "వృత్తి" : isTa ? "தொழில்" : "Career"}
                      </span>
                      <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full ${getStatusBadgeClass(yr.fourPillarsAnnualVerdict.career.status)}`}>
                        {yr.fourPillarsAnnualVerdict.career.text}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200 text-center space-y-1">
                      <span className="text-[10px] font-black text-amber-900 uppercase block">
                        💰 {isKn ? "ಧನ" : isMr ? "वित्त" : isHi ? "धन" : isTe ? "ధనం" : isTa ? "தனம்" : "Wealth"}
                      </span>
                      <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full ${getStatusBadgeClass(yr.fourPillarsAnnualVerdict.wealth.status)}`}>
                        {yr.fourPillarsAnnualVerdict.wealth.text}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200 text-center space-y-1">
                      <span className="text-[10px] font-black text-amber-900 uppercase block">
                        🏡 {isKn ? "ಕುಟುಂಬ" : isMr ? "कुटुंब" : isHi ? "परिवार" : isTe ? "కుటుంబం" : isTa ? "குடும்பம்" : "Family"}
                      </span>
                      <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full ${getStatusBadgeClass(yr.fourPillarsAnnualVerdict.family.status)}`}>
                        {yr.fourPillarsAnnualVerdict.family.text}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200 text-center space-y-1">
                      <span className="text-[10px] font-black text-amber-900 uppercase block">
                        🩺 {isKn ? "ಆರೋಗ್ಯ" : isMr ? "आरोग्य" : isHi ? "स्वास्थ्य" : isTe ? "ఆరోగ్యం" : isTa ? "ஆரோக்கியம்" : "Health"}
                      </span>
                      <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full ${getStatusBadgeClass(yr.fourPillarsAnnualVerdict.health.status)}`}>
                        {yr.fourPillarsAnnualVerdict.health.text}
                      </span>
                    </div>
                  </div>
                )}

                {/* Golden Months & Caution Month Pills */}
                {(yr.goldenMonthsHighlight || yr.cautionMonthHighlight) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                    {yr.goldenMonthsHighlight && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-2">
                        <span className="text-base">🌟</span>
                        <div>
                          <span className="text-[10px] font-black uppercase text-emerald-900 block">
                            {isKn ? "ಸುವರ್ಣ ಫಲಪ್ರದ ತಿಂಗಳುಗಳು" : isMr ? "सुवर्ण फलदायी महिने" : isHi ? "स्वर्णिम फलदायी माह" : isTe ? "సువర్ణ మాసాలు" : isTa ? "பொற்கால மாதங்கள்" : "Golden Months"}
                          </span>
                          <span className="font-black text-emerald-950 text-xs">
                            {yr.goldenMonthsHighlight}
                          </span>
                        </div>
                      </div>
                    )}

                    {yr.cautionMonthHighlight && (
                      <div className="p-2.5 rounded-lg bg-amber-100/80 border border-amber-400 text-amber-950 flex items-center gap-2">
                        <span className="text-base">⚠️</span>
                        <div>
                          <span className="text-[10px] font-black uppercase text-amber-900 block">
                            {isKn ? "ತಾಳ್ಮೆಯ ಎಚ್ಚರಿಕೆಯ ತಿಂಗಳು" : isMr ? "सावधगिरीचा महिना" : isHi ? "सावधानी का माह" : isTe ? "జాగ్రత్త మాసం" : isTa ? "எச்சரிக்கை மாதம்" : "Caution Month"}
                          </span>
                          <span className="font-bold text-amber-950 text-xs">
                            {yr.cautionMonthHighlight}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

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

              {/* Authenticated Classical Vedic Predictive Accuracy: Tara Bala, Gochara Vedha & Jaimini Karaka */}
              {(yr.taraBala || yr.vedhaAnalysis) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-amber-700/20 text-xs font-serif">
                  {yr.taraBala && (
                    <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-300 space-y-1 shadow-2xs">
                      <span className="font-black text-amber-950 block text-xs flex items-center gap-1.5">
                        <span>⭐</span>
                        <span>{isKn ? "ನವತಾರಾ ಬಲ ನಿರ್ಣಯ:" : isMr ? "नवतारा / ताराबळ निर्णय:" : isHi ? "नवतारा बल निर्णय:" : isTe ? "నవతార బలం:" : isTa ? "நவதாரா பலன்:" : "Navatara Bala:"}</span>
                        <span className="text-amber-800 font-bold">({yr.taraBala.taraName})</span>
                      </span>
                      <p className="text-amber-900 leading-relaxed font-serif text-[11px]">{yr.taraBala.analysisText}</p>
                    </div>
                  )}
                  {yr.vedhaAnalysis && (
                    <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-300 space-y-1 shadow-2xs">
                      <span className="font-black text-amber-950 block text-xs flex items-center gap-1.5">
                        <span>🛡️</span>
                        <span>{isKn ? "ಗೋಚಾರ ನಿರ್ವೇಧ ಸ್ಥಿತಿ:" : isMr ? "गोचर वेध निर्णय:" : isHi ? "गोचर वेध निर्णय:" : isTe ? "గోచార వేధ నిర్ణయం:" : isTa ? "கோசார வேத நிலை:" : "Gochara Vedha:"}</span>
                      </span>
                      <p className="text-amber-900 leading-relaxed font-serif text-[11px]">{yr.vedhaAnalysis.vedhaDetails}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Substantive Paragraphs: 3 Detailed Paragraphs with Friendly Subheadings */}
              <div className="space-y-5">
                {yr.paragraphs && yr.paragraphs.length > 0 ? (
                  yr.paragraphs.map((p, pIdx) => {
                    const subhead = getParagraphSubheading(pIdx, lang);
                    return (
                      <div key={`yr-${idx}-p-${pIdx}`} className="space-y-1.5">
                        {subhead && (
                          <h4 className="text-sm font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="text-amber-700">❖</span>
                            <span>{subhead}</span>
                          </h4>
                        )}
                        <p className="text-lg text-amber-950 font-serif leading-relaxed text-left">
                          {p}
                        </p>
                      </div>
                    );
                  })
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
                <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300">
                  <span className="font-black text-amber-950 block mb-1">✨ {t("goldenWindowLabel")}</span>
                  <p className="text-amber-900 leading-normal">{yr.goldenOpportunityWindow}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300">
                  <span className="font-black text-amber-950 block mb-1">🛡️ {t("cautionLabel")}</span>
                  <p className="text-amber-900 leading-normal">{yr.cautionAndGuidance}</p>
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
          "Sacred Stotra, Annual Gokarna Worship & Auspicious Muhurtas",
          isKn ? "ಪವಿತ್ರ ಸ್ತೋತ್ರ, ವಾರ್ಷಿಕ ಗೋಕರ್ಣ ಪರಿಹಾರ ಹಾಗೂ ದಿವ್ಯ ಮುಹೂರ್ತಗಳು"
            : isMr ? "पवित्र स्तोत्र, वार्षिक गोकर्ण पूजा व शुभ मुहूर्त"
              : isHi ? "पवित्र स्तोत्र, वार्षिक गोकर्ण पूजन एवं शुभ मुहूर्त"
                : isTe ? "పవిత్ర స్తోత్రం, వార్షిక గోకర్ణ పరిహారం & శుభ ముహూర్తాలు"
                  : isTa ? "புனித ஸ்தோத்திரம், வருடாந்திர கோகர்ண பரிகாரம் & சுப முகூர்த்தங்கள்"
                    : "Sacred Stotra, Annual Gokarna Worship & Auspicious Muhurtas"
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
                          <td className="p-3 font-bold text-amber-900">{row.targetSectors}</td>
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
          <div className="flex items-center justify-between pb-4 border-b border-amber-700/20 gap-4">
            <div className="flex items-center gap-4">
              {data.sacredDeityImage && (
                <div className="shrink-0 p-1 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200 rounded-xl border border-amber-600/70 shadow-xs">
                  <img
                    src={data.sacredDeityImage.imagePath}
                    alt={data.sacredDeityImage.deityName}
                    crossOrigin="anonymous"
                    className="w-16 h-20 sm:w-20 sm:h-24 object-contain rounded-lg block shadow-2xs"
                  />
                </div>
              )}
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-800 block">
                  {isKn
                    ? "ಪಂಚವರ್ಷ ರಕ್ಷಾ ಸ್ತೋತ್ರ"
                    : isMr
                      ? "५ वर्षे महा रक्षा स्तोत्र"
                      : isHi
                        ? "पंचवर्षीय महा रक्षा स्तोत्र"
                        : isTe
                          ? "5 సంవత్సరాల రక్షా స్తోత్రం"
                          : isTa
                            ? "5 ஆண்டுகளுக்கான மகா ரக்ஷா ஸ்தோத்திரம்"
                            : "5-Year Prescribed Shield"}
                </span>
                <h3 className="text-2xl font-black text-amber-950 font-serif mt-1">
                  {data.prescribedStotra.stotraName}
                </h3>
                <p className="text-sm text-amber-800 font-serif italic mt-0.5">
                  {isKn ? "ಅಧಿಷ್ಠಾನ ದೇವತೆ: " : isMr ? "अधिष्ठान देवता: " : isHi ? "अधिष्ठाता देव: " : isTe ? "అధిష్టాన దేవత: " : isTa ? "அதிஷ்டான தெய்வம்: " : "Presiding Deity: "}
                  {data.prescribedStotra.deityName}
                </p>
              </div>
            </div>

            <span className="bg-amber-900 text-amber-100 text-sm font-black px-4 py-1.5 rounded-full shadow-xs shrink-0">
              📿 {formatNumber6L(data.prescribedStotra.chantingRounds, lang)} {isKn ? "ಆವರ್ತಿ ಜಪ" : isMr ? "वेळा जप" : isHi ? "बार पाठ" : isTe ? "సార్లు పారాయణం" : isTa ? "முறை பாராயணம்" : "Rounds Daily"}
            </span>
          </div>

          {/* Sanskrit Verse in Dignified Display */}
          <div className="p-6 rounded-xl bg-amber-100/70 border-2 border-amber-600/50 text-center space-y-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
              {isKn ? "॥ ಮೂಲ ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ಲೋಕ ॥" : isMr ? "॥ मूळ शास्त्रोक्त श्लोक ॥" : isHi ? "॥ मूल शास्त्रोक्त श्लोक ॥" : "|| Sacred Scriptural Shloka ||"}
            </span>
            <p
              className="text-lg font-bold text-amber-950 leading-relaxed italic"
              style={{ textIndent: 0, letterSpacing: 'normal' }}
            >
              {data.prescribedStotra.verseRegional || data.prescribedStotra.sanskritVerse}
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
              <div className="col-span-2 p-5 rounded-xl bg-amber-100/60 border border-amber-300 space-y-2 shadow-2xs font-serif">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-950 text-sm flex items-center gap-2">
                    <span>🌳</span>
                    <span>{isKn ? `ಜನ್ಮ ನಕ್ಷತ್ರ ಪವಿತ್ರ ವೃಕ್ಷ ಆರಾಧನೆ (${data.nakshatra} ನಕ್ಷತ್ರ):` : isMr ? `जन्म नक्षत्र पवित्र वृक्ष आराधना:` : isHi ? `जन्म नक्षत्र पवित्र वृक्ष आराधना:` : `Nakshatra Sacred Tree Worship:`}</span>
                  </span>
                  <span className="bg-amber-200 text-amber-950 font-black text-xs px-3 py-1 rounded border border-amber-400">
                    {data.nakshatraVriksha.vrikshaName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-amber-900 font-bold block">{isKn ? "ವೃಕ್ಷ ಬೀಜ ಮಂತ್ರ:" : isMr ? "वृक्ष बीज मंत्र:" : isHi ? "वृक्ष बीज मंत्र:" : "Bija Mantra:"}</span>
                    <p className="text-amber-950 font-bold mt-0.5">{data.nakshatraVriksha.bijaMantra}</p>
                  </div>
                  <div>
                    <span className="text-amber-900 font-bold block">{isKn ? "ಆರಾಧನಾ ವಿಧಿ:" : isMr ? "आराधना पद्धती:" : isHi ? "आराधना विधि:" : "Protocol:"}</span>
                    <p className="text-amber-950 mt-0.5 leading-relaxed">{data.nakshatraVriksha.aradhanaProtocol}</p>
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
          "Family Destiny Interlocking & Collective Wellbeing",
          isKn ? "ಕುಟುಂಬ ರಕ್ಷಾ ಪಂಚವರ್ಷ ಬಂಧ ಹಾಗೂ ಸಮನ್ವಯ"
            : isMr ? "कौटुंबिक सुरक्षा पंचवर्षीय बंध व समन्वय"
              : isHi ? "पारिवारिक सुरक्षा पंचवर्षीय समन्वय एवं कल्याण"
                : isTe ? "కుటుంబ రక్షా పంచవర్ష బంధం & సమన్వయం"
                  : isTa ? "குடும்ப பாதுகாப்பு பஞ்சவர்ஷ பிணைப்பு & நல்லிணக்கம்"
                    : "Family Destiny Interlocking & Collective Wellbeing"
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
            data.daivajnaSummary.titleEn || "Daivajna Master Jyotish Synthesis",
            isKn ? (data.daivajnaSummary.titleKn || "ದೈವಜ್ಞ ಮಹಾದರ್ಶನ ಸಮಗ್ರ ಸಾರಾಂಶ")
              : isMr ? "दैवज्ञ महादर्शन समग्र सारांश"
                : isHi ? "दैवज्ञ महादर्शन समग्र सारांश"
                  : isTe ? "దైవజ్ఞ మహాదర్శన సమగ్ర సారాంశం"
                    : isTa ? "தெய்வக்ஞ மகா தரிசன முழுமையான சுருக்கம்"
                      : (data.daivajnaSummary.titleEn || "Daivajna Master Jyotish Synthesis")
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
            "ದೈವ ಕೃಪಾ ಕವಚ & ಜನ್ಮ ಕುಂಡಲಿ ವೈಯಕ್ತಿಕ ಶ್ಲೋಕ",
            "Sacred Deity Grace & Personalized Devotee Shloka",
            isKn ? "ದೈವ ಕೃಪಾ ಕವಚ & ಜನ್ಮ ಕುಂಡಲಿ ವೈಯಕ್ತಿಕ ಶ್ಲೋಕ"
              : isMr ? "दैवी कृपा कवच व जन्मकुंडली वैयक्तिक श्लोक"
                : isHi ? "दैवीय कृपा कवच एवं जन्म कुंडली व्यक्तिगत श्लोक"
                  : isTe ? "దైవ కృపా కవచం & జన్మ కుండలి వ్యక్తిగత శ్లోకం"
                    : isTa ? "தெய்வ கிருபா கவசம் & ஜென்ம ஜாதக தனிப்பயன் ஸ்லோகம்"
                      : "Sacred Deity Grace & Personalized Devotee Shloka"
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

            {/* 100% Dynamic Devotee Shloka Card in Devotee's Selected Script */}
            <div className="rounded-2xl border-2 border-amber-600/50 bg-amber-100/50 p-7 shadow-sm text-center font-serif space-y-5">
              <div className="border-b border-amber-700/20 pb-4 space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-amber-800">
                  {isKn ? "॥ ಜನ್ಮ ಜಾತಕಾನುಸಾರ ಸಿದ್ಧಪಡಿಸಿದ ಪಾವನ ಮಂತ್ರ ॥"
                    : isMr ? "॥ जन्मपत्रिकेनुसार सिद्ध केलेला पवित्र मंत्र ॥"
                      : isHi ? "॥ जन्म कुंडली अनुसार सिद्ध किया गया पावन मंत्र ॥"
                        : isTe ? "॥ జన్మ కుండలి ప్రకారం సిద్ధం చేసిన పవిత్ర మంత్రం ॥"
                          : isTa ? "॥ ஜாதகப்படி அருளப்பெற்ற புனித மந்திரம் ॥"
                            : "॥ Sacred Devotional Shloka for Your Birth Chart ॥"}
                </span>

                {/* Sacred Shloka in User's Selected Script */}
                <div className="px-6 py-5 bg-gradient-to-r from-amber-200/50 via-yellow-100/70 to-amber-200/50 rounded-xl border border-amber-400/60 shadow-xs">
                  <p
                    className="text-2xl font-bold leading-loose text-amber-950 font-serif whitespace-pre-line tracking-normal"
                    style={{ textIndent: 0, letterSpacing: 'normal' }}
                  >
                    {data.personalizedDynamicShloka.shlokaRegional || data.personalizedDynamicShloka.shlokaSanskrit}
                  </p>
                </div>
              </div>

              {/* Devotional Meaning in Devotee Language */}
              <div className="space-y-2 text-left">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <span>📖</span>
                  <span>{isKn ? "ಪಾವನ ಮಂತ್ರದ ತಾತ್ಪರ್ಯ & ದೈವಾನುಗ್ರಹ:" : isMr ? "मंत्राचा भावार्थ व कृपाशीर्वाद:" : isHi ? "मंत्र का भावार्थ एवं कृपाशीर्वाद:" : isTe ? "పవిత్ర మంత్ర తాత్పర్యం & దైవానుగ్రహం:" : isTa ? "புனித மந்திர அர்த்தம் & தெய்வ அருள்:" : "Sacred Meaning & Divine Grace:"}</span>
                </span>
                <p
                  className="text-base text-amber-950 leading-relaxed font-serif text-left break-words"
                  style={{ textIndent: 0, letterSpacing: 'normal' }}
                >
                  {data.personalizedDynamicShloka.meaning}
                </p>
              </div>

              {/* Chanting Protocols Grid in Gold/Amber Styling */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-amber-700/20">
                <div className="p-3 rounded-lg bg-amber-100/70 border border-amber-300 text-left">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    {isKn ? "ಜಪ ಸಂಖ್ಯೆ" : isMr ? "जप संख्या" : isHi ? "जप संख्या" : isTe ? "జప సంఖ్య" : isTa ? "ஜப எண்ணிக்கை" : "Chant Count"}
                  </span>
                  <span className="font-black text-amber-950 mt-0.5 block">
                    📿 {data.personalizedDynamicShloka.chantCount}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-amber-100/70 border border-amber-300 text-left">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    {isKn ? "ಶುಭ ಸಮಯ" : isMr ? "शुभ वेळ" : isHi ? "शुभ समय" : isTe ? "శుభ సమయం" : isTa ? "சுப நேரம்" : "Auspicious Time"}
                  </span>
                  <span className="font-black text-amber-950 mt-0.5 block">
                    🌅 {data.personalizedDynamicShloka.auspiciousTime}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-amber-100/70 border border-amber-300 text-left">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    {isKn ? "ಶುಭ ದಿಕ್ಕು" : isMr ? "शुभ दिशा" : isHi ? "शुभ दिशा" : isTe ? "శుభ దిశ" : isTa ? "சுப திசை" : "Auspicious Direction"}
                  </span>
                  <span className="font-black text-amber-950 mt-0.5 block">
                    🧭 {data.personalizedDynamicShloka.auspiciousDirection}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-amber-100/70 border border-amber-300 text-left">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    {isKn ? "ಸಿದ್ಧಿ ಫಲ" : isMr ? "सिद्धि फल" : isHi ? "सिद्धि फल" : isTe ? "సిద్ధి ఫలం" : isTa ? "சித்தி பலன்" : "Spiritual Fruit"}
                  </span>
                  <span className="font-black text-amber-950 mt-0.5 block">
                    🌺 {data.personalizedDynamicShloka.spiritualFruit}
                  </span>
                </div>
              </div>

              {/* Kundli Selection Rationale */}
              <div className="p-3.5 rounded-lg bg-amber-100/40 border border-amber-300 text-xs text-amber-900 leading-relaxed font-serif text-left">
                <span className="font-black text-amber-950 block mb-1">
                  ✨ {isKn ? "ಜ್ಯೋತಿಷ್ಯ ಆಯ್ಕೆಯ ಆಧಾರ:" : isMr ? "ज्योतिषशास्त्रीय निवडीचा आधार:" : isHi ? "ज्योतिषीय चयन का आधार:" : isTe ? "జ్యోతిష్య ఎంపిక ఆధారం:" : isTa ? "ஜோதிட தேர்வு அடிப்படை:" : "Astrological Selection Basis:"}
                </span>
                {data.personalizedDynamicShloka.deityRationale}
              </div>
            </div>

            {/* Official Astrologer Benedictory Seal & Priest Details (NO QR, NO Artificial Wax Seal, NO Price Details) */}
            <div className="pt-6 border-t border-amber-700/20 text-center space-y-4 font-serif">
              <div className="inline-block p-2 bg-amber-100 rounded-full border border-amber-400 shadow-2xs">
                <span className="text-3xl">🕉️</span>
              </div>

              <h3 className="text-base font-black text-amber-950 uppercase tracking-widest font-serif">
                {t("blessingHeader")}
              </h3>

              <p
                className="text-base text-amber-950 leading-relaxed font-serif italic max-w-2xl mx-auto text-left sm:text-center break-words"
                style={{ textIndent: 0, letterSpacing: 'normal' }}
              >
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
                    {isKn ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ, ಕರ್ನಾಟಕ" : isMr ? "श्री क्षेत्र गोकर्ण, कर्नाटक" : isHi ? "श्री क्षेत्र गोकर्ण, कर्नाटक" : isTe ? "శ్రీ క్షేత్ర గోకర్ణ, కర్ణాటక" : isTa ? "ஸ்ரீ க்ஷேத்ர கோகர்ணம், கர்நாடகா" : "Sri Kshetra Gokarna, Karnataka"}
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <p className="font-black text-amber-950 text-sm">
                    {isKn ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" : isMr ? "श्रीराम पंडित" : isHi ? "श्रीराम पंडित" : isTe ? "శ్రీరామ్ పండిత్" : isTa ? "ஸ்ரீராம் பண்டிட்" : "Shreeram Pandit"}
                  </p>
                  <p className="text-amber-800">
                    {isKn ? "ಮುಖ್ಯ ಜ್ಯೋತಿಷಿ • ಮೊ: ೯೯೭೨೩೩೯೩೬೨" : isMr ? "मुख्य ज्योतिषी • मो: ९९७२३३९३६२" : isHi ? "मुख्य ज्योतिषी • मो: ९९७२३३९३६२" : isTe ? "ప్రధాన జ్యోతిషులు • మొ: 9972339362" : isTa ? "தலைமை ஜோதிடர் • மொ: 9972339362" : "Chief Astrologer • Ph: 9972339362"}
                  </p>
                </div>
              </div>

              {/* Sacred Shanti Shloka & Publication Tag in Devotee's Script */}
              <div className="pt-3 border-t border-amber-700/20 text-center space-y-1 font-serif">
                <p
                  className="text-xs text-amber-900 font-bold italic"
                  style={{ textIndent: 0, letterSpacing: 'normal' }}
                >
                  {isKn
                    ? "॥ ತ್ವದೀಯಂ ವಸ್ತು ಗೋವಿಂದ ತುಭ್ಯಮೇವ ಸಮರ್ಪಯೇ । ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ ॥"
                    : isMr || isHi
                      ? "॥ त्वदीयं वस्तु गोविन्द तुभ्यमेव समर्पये । सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥"
                      : isTe
                        ? "॥ త్వదీయం వస్తు గోవింద తుభ్యమేవ సమర్పయే । సర్వే భవంతు సుఖినః సర్వే సంతు నిరామయాః ॥"
                        : isTa
                          ? "॥ த்வதீயம் வஸ்து கோவிந்த துப்யமேவ சமர்பயே । சர்வே பவந்து சுகினஹ் சர்வே சந்து நிராமயாஹ் ॥"
                          : "॥ Tvadiyam Vastu Govinda Tubhyameva Samarpaye | Sarve Bhavantu Sukhinah Sarve Santu Niramayah ॥"}
                </p>
                <p className="text-[11px] text-amber-800/80 font-bold tracking-wider">
                  {isKn
                    ? "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರಕಾಶನ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ॥"
                    : isMr || isHi
                      ? "॥ बग्गोण पंचांग प्रकाशन • श्री क्षेत्र गोकर्ण ॥"
                      : isTe
                        ? "॥ బగ్గోణ పంచాంగ ప్రచురణ • శ్రీ క్షేత్ర గోకర్ణ ॥"
                        : isTa
                          ? "॥ பக்கோண பஞ்சாங்க வெளியீடு • ஸ்ரீ க்ஷேத்ர கோகர்ண ॥"
                          : "॥ Baggona Panchanga Publication • Sri Kshetra Gokarna ॥"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HOTEL PILGRIMAGE DEVOTEE STAY PRIVILEGE ADVERTISEMENT ─────────── */}
      {data.hotelPrivilegeCard && (
        <div data-section="hotel-hospitality-privilege" className={sectionClass}>
          <div className="relative rounded-2xl border-2 border-amber-600/80 bg-gradient-to-br from-amber-100/90 via-orange-50/90 to-amber-100/90 p-8 shadow-xl overflow-hidden font-serif">
            {/* Ornate Inner Frame */}
            <div className="absolute inset-2 border border-amber-700/40 rounded-xl pointer-events-none" />
            <div className="absolute inset-3 border border-dashed border-amber-700/25 rounded-xl pointer-events-none" />

            {/* Corner Emblems */}
            <div className="absolute top-4 left-4 text-sm text-amber-800/60 font-serif">❖</div>
            <div className="absolute top-4 right-4 text-sm text-amber-800/60 font-serif">❖</div>
            <div className="absolute bottom-4 left-4 text-sm text-amber-800/60 font-serif">❖</div>
            <div className="absolute bottom-4 right-4 text-sm text-amber-800/60 font-serif">❖</div>

            <div className="relative z-10 space-y-6">
              {/* Header Ribbon */}
              <div className="text-center space-y-2 border-b border-amber-700/30 pb-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-600/15 border border-amber-600/40 rounded-full text-xs font-black text-amber-950 uppercase tracking-widest shadow-2xs">
                  <span>🏨</span>
                  <span>{data.hotelPrivilegeCard.bannerTitle}</span>
                </div>
                <h3 className="text-2xl font-black text-amber-950 font-serif tracking-normal mt-2">
                  {data.hotelPrivilegeCard.tagline}
                </h3>
                <p className="text-sm text-amber-900/90 max-w-3xl mx-auto leading-relaxed">
                  {data.hotelPrivilegeCard.description}
                </p>
              </div>

              {/* 15% Devotee Discount Offer Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border-2 border-amber-500/60 text-center shadow-xs">
                <span className="text-base sm:text-lg font-black text-amber-950 tracking-normal block">
                  {data.hotelPrivilegeCard.privilegeOfferBadge}
                </span>
              </div>

              {/* Amenities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {data.hotelPrivilegeCard.amenities.map((item, idx) => (
                  <div key={`hotel-amenity-${idx}`} className="p-4 rounded-xl bg-white/80 border border-amber-300 shadow-2xs flex items-start gap-3">
                    <span className="text-2xl pt-0.5 leading-none">{item.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-black text-amber-950 block">{item.title}</span>
                      <span className="text-xs text-amber-900/90 leading-relaxed block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Proximity & Booking Hotline Card */}
              <div className="rounded-xl border border-amber-700/40 bg-amber-200/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left space-y-1">
                  <p className="text-xs font-black text-amber-950">{data.hotelPrivilegeCard.proximityHighlights}</p>
                  <p className="text-xs text-amber-900 italic">{data.hotelPrivilegeCard.priestSevaAssistance}</p>
                </div>
                <div className="shrink-0 text-center sm:text-right p-3 rounded-lg bg-amber-900 text-amber-50 shadow-xs">
                  <span className="text-[10px] uppercase tracking-widest text-amber-300 block font-bold">
                    {isKn ? "ನೇರ ಮುಂಗಡ ಬುಕಿಂಗ್" : isMr ? "थेट आगाऊ बुकिंग" : isHi ? "सीधा अग्रिम आरक्षण" : "Direct Booking & WhatsApp"}
                  </span>
                  <span className="text-sm sm:text-base font-black text-amber-100 tracking-wider block mt-0.5">
                    📞 9972339362 / 9481389362
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

FiveYearPredictionPdfTemplate.displayName = "FiveYearPredictionPdfTemplate";
