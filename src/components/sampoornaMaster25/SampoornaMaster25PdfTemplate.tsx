/**
 * BAGGONA PANCHANGA — 25-CHAPTER SAMPOORNA MASTER PDF TEMPLATE
 * 
 * 100% Visual Parity with Premium PDF V1:
 * Warm ivory background (#FFF7ED / bg-orange-50), double gold borders,
 * clean serif/native-script typography, soft Q&A callout ribbons (ಪ್ರಶ್ನೆ: ...),
 * ZERO cluttered tables, sacred Gokarna footer, and Chaitanya Pandit booking block.
 */

import React, { forwardRef } from "react";
import type { SampoornaMaster25Payload, Master25Chapter } from "../../services/sampoornaMaster25Service";
import { type SixLang, pick6 } from "../../features/fiveYearPrediction/fiveYearLocale";

interface Props {
  data: SampoornaMaster25Payload | null;
}

export const SampoornaMaster25PdfTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
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

  // Exact Premium PDF V1 Styling Classes
  const solidBgClass = "bg-orange-50";
  const textColorClass = "text-amber-950";
  const borderColorClass = "border-amber-700/40";
  const primaryColorClass = "text-amber-800";
  const sectionClass = "pdf-section px-14 py-8 relative";

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

  // Chapter Header Helper
  const renderChapterBanner = (chapter: Master25Chapter) => {
    const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯", "೧೦", "೧೧", "೧೨", "೧೩", "೧೪", "೧೫", "೧೬", "೧೭", "೧೮", "೧೯", "೨೦", "೨೧", "೨೨", "೨೩", "೨೪", "೨೫"];
    const hiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९", "१०", "११", "१२", "१३", "१४", "१५", "१६", "१७", "१८", "१९", "२०", "२१", "२२", "२३", "२४", "२५"];
    const teDigits = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯", "౧౦", "౧౧", "౧౨", "౧౩", "౧౪", "౧౫", "౧౬", "౧౭", "౧౮", "౧౯", "౨౦", "౨౧", "౨౨", "౨౩", "౨౪", "౨౫"];
    const taDigits = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯", "௰", "௰௧", "௰௨", "௰௩", "௰௪", "௰௫", "௰௬", "௰௭", "௰௮", "௰௯", "௨௰", "௨௧", "௨௨", "௨௩", "௨௪", "௨௫"];

    let badgeText = "";
    if (isKn) badgeText = `ಅಧ್ಯಾಯ ${knDigits[chapter.chapterNumber] || chapter.chapterNumber}`;
    else if (isMr || isHi) badgeText = `अध्याय ${hiDigits[chapter.chapterNumber] || chapter.chapterNumber}`;
    else if (isTe) badgeText = `అధ్యాయం ${teDigits[chapter.chapterNumber] || chapter.chapterNumber}`;
    else if (isTa) badgeText = `அத்தியாயம் ${taDigits[chapter.chapterNumber] || chapter.chapterNumber}`;
    else badgeText = `Chapter ${chapter.chapterNumber}`;

    return (
      <div className="border-b-2 border-amber-700/40 pb-4 mb-6 relative">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-800/10 text-amber-900 rounded-full border border-amber-800/30">
            <span className="text-amber-800 text-sm">{chapter.icon}</span>
            <span className="text-xs font-black tracking-widest uppercase">
              {badgeText}
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-800/60 text-sm font-serif">
            <span>❖</span>
            <span className="h-px w-12 bg-amber-700/30" />
            <span>ॐ</span>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-serif tracking-normal leading-relaxed">
          {badgeText}: {chapter.title}
        </h2>
      </div>
    );
  };

  // Contemplation Question Ribbon (Exact V1 Style)
  const renderContemplationRibbon = (questionText: string) => {
    return (
      <div className="rounded-xl border-2 border-amber-700/30 bg-gradient-to-r from-amber-100/90 via-orange-50/80 to-amber-100/90 p-5 mb-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 text-amber-900 text-xs font-black tracking-widest uppercase">
          <span className="text-amber-800">❖</span>
          <span>{isKn ? "ಆತ್ಮ ಪ್ರಶ್ನೆ & ದೈವಿಕ ದರ್ಶನ" : isMr ? "आत्म प्रश्न व चिंतन" : isHi ? "आत्म प्रश्न एवं चिंतन" : isTe ? "ఆత్మ ప్రశ్న & చింతన" : isTa ? "ஆத்ம கேள்வி & சிந்தனை" : "Soul Contemplation Inquest"}</span>
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
      id="sampoorna-master-25-pdf-container"
      style={{
        width: "900px",
        height: "max-content",
        fontFamily: activeFontFamily,
        letterSpacing: "normal"
      }}
      className={`${solidBgClass} ${textColorClass} relative overflow-hidden selection:bg-amber-200 font-serif`}
    >
      {/* Exact Premium PDF V1 Double Decorative Border Frames */}
      <div className={`absolute inset-6 border-[3px] ${borderColorClass} pointer-events-none rounded-sm opacity-90`} />
      <div className={`absolute inset-8 border border-dashed ${borderColorClass} pointer-events-none opacity-60`} />

      {/* Decorative Corner Ornaments */}
      <div className="absolute top-9 left-9 text-base text-amber-800/40 pointer-events-none font-serif">❖</div>
      <div className="absolute top-9 right-9 text-base text-amber-800/40 pointer-events-none font-serif">❖</div>
      <div className="absolute bottom-9 left-9 text-base text-amber-800/40 pointer-events-none font-serif">❖</div>
      <div className="absolute bottom-9 right-9 text-base text-amber-800/40 pointer-events-none font-serif">❖</div>

      {/* ── COVER & HEADER SECTION ────────────────────────────────────────── */}
      <div data-section="cover" className="pdf-section text-center mt-10 mb-6 px-16 pt-8 pb-4 relative z-10">
        <p className="text-sm font-bold tracking-widest text-amber-800 uppercase mb-3">
          {sacredInvocation}
        </p>

        <div className="inline-block relative px-12 py-3 mb-3">
          <div className="absolute inset-0 border-y border-amber-700/40 transform -skew-x-12 pointer-events-none" />
          <h1 className={`text-4xl font-extrabold ${primaryColorClass} leading-relaxed tracking-normal font-serif`}>
            {isKn ? "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ೨೫ ಅಧ್ಯಾಯಗಳ ಸಂಪೂರ್ಣ ಮಹಾ ಜಾತಕ ॥"
              : isMr ? "॥ बग्गोण पंचांग — २५ अध्यायांचे संपूर्ण महा भविष्य ॥"
              : isHi ? "॥ बग्गोण पंचांग — २५ अध्यायों का संपूर्ण महा फलादेश ॥"
              : isTe ? "॥ బగ్గోణ పంచాంగం — 25 అధ్యాయాల సంపూర్ణ మహా జాతకం ॥"
              : isTa ? "॥ பக்கோண பஞ்சாங்கம் — 25 அத்தியாயங்கள் கொண்ட முழுமையான ஜாதகம் ॥"
              : "|| Baggona Panchanga — 25-Chapter Sampoorna Master Report ||"}
          </h1>
        </div>

        <p className="text-xl italic font-serif text-amber-900/90 tracking-normal leading-relaxed mb-4">
          {isKn ? "ವರ್ತಮಾನ ವಾಸ್ತವ & ಮುಂಬರುವ ೫ ವರ್ಷಗಳ ಸುವರ್ಣ ಭವಿಷ್ಯ ಮಾರ್ಗದರ್ಶಿ (ಸಂಪೂರ್ಣ ಹಸ್ತಪ್ರತಿ ಆವೃತ್ತಿ)"
            : isMr ? "सध्याचे यथार्थ व पुढील ५ वर्षांचे सुवर्ण भविष्य क्षितिज (अधिकृत आवृत्ती)"
            : isHi ? "वर्तमान यथार्थ एवं आगामी ५ वर्षों का स्वर्णिम भविष्य क्षितिज (प्रामाणिक संस्करण)"
            : isTe ? "ప్రస్తుత వాస్తవం & రాబోయే 5 సంవత్సరాల స్వర్ణ భవిష్యత్ మార్గదర్శి"
            : isTa ? "தற்போதைய நிலை & அடுத்த 5 ஆண்டுகளுக்கான பொற்கால வழிகாட்டல்"
            : "Present Living Reality & Next 5-Year Golden Destiny Horizon (Master Edition)"}
        </p>

        <div className="flex items-center justify-center gap-6 opacity-80 mb-6">
          <div className="w-24 border-b-2 border-amber-700/60" />
          <span className="text-2xl text-amber-800 font-serif">ॐ</span>
          <div className="w-24 border-b-2 border-amber-700/60" />
        </div>
      </div>

      {/* ── DEVOTEE DETAILS PARCHMENT CARD (Exact V1 Style) ───────────────── */}
      <div data-section="user-details" className="pdf-section w-full px-14 mb-8 relative z-10">
        <div className="relative rounded-xl border-2 border-amber-600/60 bg-amber-100/50 p-8 shadow-md overflow-hidden">
          <div className="absolute inset-2 border border-amber-700/30 rounded-lg pointer-events-none" />
          <div className="absolute inset-3 border border-dashed border-amber-700/20 rounded-lg pointer-events-none" />

          <div className="grid grid-cols-2 gap-y-5 gap-x-8 relative z-10 px-4 py-2 text-sm">
            {/* Row 1: Devotee Name & Birth Date/Time */}
            <div className="flex flex-col border-b border-amber-800/20 pb-2.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                {isKn ? "ಜಾತಕರ ಶುಭ ನಾಮ" : isMr ? "जातकाचे नाव" : isHi ? "जातक का नाम" : isTe ? "జాతుకుని పేరు" : isTa ? "ஜாதகரின் பெயர்" : "Devotee Name"}
              </span>
              <span className="text-2xl font-black text-amber-950 font-serif leading-relaxed">
                {data.devoteeName}
              </span>
            </div>

            <div className="flex flex-col border-b border-amber-800/20 pb-2.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                {isKn ? "ಜನ್ಮ ದಿನಾಂಕ & ಸಮಯ" : isMr ? "जन्म तारीख व वेळ" : isHi ? "जन्म तिथि एवं समय" : "Birth Date & Time"}
              </span>
              <span className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {data.birthDate} • {data.birthTime}
              </span>
            </div>

            {/* Row 2: Lagna & Moon Rashi */}
            <div className="flex flex-col border-b border-amber-800/20 pb-2.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                {isKn ? "ಜನ್ಮ ಲಗ್ನ & ಅಧಿಪತಿ" : isMr ? "जन्म लग्न व स्वामी" : isHi ? "जन्म लग्न एवं स्वामी" : "Janma Lagna & Lord"}
              </span>
              <span className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {data.lagnaName} ({data.lagnaLord})
              </span>
            </div>

            <div className="flex flex-col border-b border-amber-800/20 pb-2.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                {isKn ? "ಚಂದ್ರ ರಾಶಿ & ಅಧಿಪತಿ" : isMr ? "चंद्र रास व स्वामी" : isHi ? "चंद्र राशि एवं स्वामी" : "Moon Sign & Lord"}
              </span>
              <span className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {data.moonRashi} ({data.moonLord})
              </span>
            </div>

            {/* Row 3: Nakshatra & Current Dasha-Bhukti */}
            <div className="flex flex-col border-b border-amber-800/20 pb-2.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                {isKn ? "ಜನ್ಮ ನಕ್ಷತ್ರ & ಪಾದ" : isMr ? "जन्म नक्षत्र व चरण" : isHi ? "जन्म नक्षत्र एवं पाद" : "Nakshatra & Pada"}
              </span>
              <span className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {data.nakshatraName} ({isKn ? "ಪಾದ" : "Pada"} {data.nakshatraPada})
              </span>
            </div>

            <div className="flex flex-col border-b border-amber-800/20 pb-2.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                {isKn ? "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ - ಭುಕ್ತಿ" : isMr ? "सध्याची महादशा - भुक्ती" : isHi ? "वर्तमान महादशा - भुक्ति" : "Current Mahadasha - Bhukti"}
              </span>
              <span className="text-xl font-bold text-amber-950 font-serif leading-relaxed">
                {data.currentMahadasha} - {data.currentBhukti}
              </span>
            </div>

            {/* Row 4: Secret Accuracy Highlights (Yogi & Avayogi) */}
            <div className="flex flex-col border-b border-amber-800/20 pb-2.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                {isKn ? "ಧನ ಪ್ರದಾಯಕ ಯೋಗಿ ಗ್ರಹ" : isMr ? "धन प्रदाता योगी ग्रह" : isHi ? "धन प्रदाता योगी ग्रह" : "Lucky Yogi Wealth Planet"}
              </span>
              <span className="text-lg font-bold text-amber-950 font-serif leading-relaxed text-amber-900">
                ✨ {data.yogiPlanet} ({data.yogiRashi})
              </span>
            </div>

            <div className="flex flex-col border-b border-amber-800/20 pb-2.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                {isKn ? "ಅವಯೋಗಿ ಎಚ್ಚರಿಕೆ ಗ್ರಹ" : isMr ? "अवयोगी सावधान ग्रह" : isHi ? "अवयोगी चेतावनी ग्रह" : "Avayogi Obstacle Planet"}
              </span>
              <span className="text-lg font-bold text-amber-950 font-serif leading-relaxed text-red-900">
                ⚠️ {data.avayogiPlanet} ({data.avayogiRashi})
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-700/20 text-center text-xs font-serif italic text-amber-900/80">
            {isKn ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಪ್ರಾಚೀನ ದೈವಜ್ಞ ಪರಂಪರೆಯಂತೆ ೧೦೦% ನಿಖರ ಗಣಿತದಿಂದ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ."
              : isMr ? "श्री क्षेत्र गोकर्ण महाबळेश्वर सानिध्याच्या प्राचीन ज्योतिषी परंपरेनुसार १००% अचूक गणितावर आधारित."
              : isHi ? "श्री क्षेत्र गोकर्ण महाबलेश्वर सान्निध्य की प्रामाणिक दैवज्ञ परंपरा अनुसार १००% सटीक गणना आधारित।"
              : "Prepared in accordance with the 100% deterministic Sri Kshetra Gokarna Jyotishya tradition."}
          </div>
        </div>
      </div>

      {/* ── 25 CHAPTERS (HOOK-FIRST PRIORITY ORDER) ────────────────────────── */}
      {data.chapters.map((chapter) => (
        <div
          key={`chapter-${chapter.chapterNumber}`}
          data-section={`chapter-${chapter.chapterNumber}`}
          className={`${sectionClass} mb-6 z-10`}
        >
          {/* Section Sub-Header Pill when Section changes */}
          {(chapter.chapterNumber === 1 ||
            chapter.chapterNumber === 7 ||
            chapter.chapterNumber === 12 ||
            chapter.chapterNumber === 17 ||
            chapter.chapterNumber === 23) && (
            <div className="mb-6 pb-2 border-b border-amber-800/20 flex items-center justify-between">
              <span className="text-xs font-black tracking-widest uppercase text-amber-800 bg-amber-200/50 px-3 py-1 rounded-full border border-amber-700/20">
                {chapter.sectionTitle}
              </span>
              <span className="text-xs text-amber-700/70 font-serif">
                {isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಅಧಿಕೃತ ಹಸ್ತಪ್ರತಿ" : "Baggona Panchanga Master Folio"}
              </span>
            </div>
          )}

          {/* Chapter Banner */}
          {renderChapterBanner(chapter)}

          {/* Contemplation Ribbon */}
          {renderContemplationRibbon(chapter.question)}

          {/* Chapter Narrative Paragraphs in Luxury Parchment Card (ZERO Tables) */}
          <div className="p-6 rounded-xl border border-amber-700/30 bg-amber-100/30 space-y-4 shadow-xs">
            {chapter.paragraphs.map((p, pIdx) => (
              <p
                key={pIdx}
                className="text-lg leading-relaxed text-amber-950 font-serif text-justify"
              >
                {p}
              </p>
            ))}

            {/* Optional Practical Guidance Card */}
            {chapter.practicalGuidance && (
              <div className="mt-4 p-4 rounded-lg border border-amber-600/30 bg-amber-50/80 shadow-2xs space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>{isKn ? "ಆಚರಣಾ ಮಾರ್ಗದರ್ಶನ" : "Practical Guidance"}</span>
                </span>
                <p className="text-sm font-serif text-amber-950 leading-relaxed italic">
                  {chapter.practicalGuidance}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ── CHAPTER 25 CULMINATION: FAMILY HOOK & PRIEST BOOKING ──────────── */}
      <div data-section="family-referral-and-priest" className="pdf-section w-full px-14 pt-4 pb-20 relative z-10">
        {/* Family Protection Hook Box */}
        <div className="rounded-2xl border-2 border-amber-700/50 bg-gradient-to-br from-amber-100/95 via-orange-50/90 to-amber-100/95 p-6 shadow-md mb-8 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-extrabold text-base">
            <span className="text-xl">🛡️</span>
            <span>{isKn ? "ಕುಟುಂಬ ರಕ್ಷಾ ದೈವಿಕ ಸಂದೇಶ" : isMr ? "कौटुंबिक संरक्षण संदेश" : isHi ? "पारिवारिक रक्षा दिव्य संदेश" : "Family Protection Cosmic Hook"}</span>
          </div>
          <p className="text-base text-amber-950 font-serif leading-relaxed text-justify font-medium">
            "{data.familyProtectionHook}"
          </p>
        </div>

        {/* Dosha Parihara & Seva Booking Contact Block (PINNED TO CHAITANYA PANDIT) */}
        <div className="rounded-2xl border-2 border-amber-700/60 bg-amber-900 text-amber-50 p-8 shadow-xl relative overflow-hidden text-center sm:text-left">
          <div className="absolute top-3 right-4 text-xs font-black text-amber-300 uppercase tracking-widest">
            {isKn ? "ಅಧಿಕೃತ ಸೇವಾ ಸನ್ನಿಧಾನ" : "Official Sanctuary Contact"}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-100 font-serif mb-1">
                {data.priestBooking.heading}
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 font-serif">
                {data.priestBooking.subheading}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-amber-300 uppercase tracking-widest block font-bold">
                  {data.priestBooking.priestTitle}
                </span>
                <span className="text-2xl font-black text-amber-50 font-serif tracking-normal">
                  {data.priestBooking.priestName}
                </span>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  📍 {data.priestBooking.address}
                </p>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <span className="text-[11px] uppercase tracking-wider text-amber-300 block font-bold mb-1">
                  {isKn ? "ನೇರ ಕರೆ / ವಾಟ್ಸಾಪ್ ಬುಕಿಂಗ್" : "Direct Call / WhatsApp"}
                </span>
                <a
                  href={`tel:${data.priestBooking.phone}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-lg tracking-wider shadow-md hover:scale-105 transition-transform"
                >
                  <span>📞</span>
                  <span>{data.priestBooking.phoneDisplay}</span>
                </a>
              </div>
            </div>

            <p className="text-xs text-amber-200/70 italic text-center pt-2">
              {isKn ? "ಗಮನಿಸಿ: ನಿಮ್ಮ ಹೆಸರು, ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ಗೋತ್ರವನ್ನು ತಿಳಿಸಿ ನೇರವಾಗಿ ಮುಖ್ಯ ಅರ್ಚಕರೊಂದಿಗೆ ಸಂಕಲ್ಪ ಪೂಜೆ ಕಾಯ್ದಿರಿಸಿ."
                : isMr ? "टीप: आपले नाव, नक्षत्र व गोत्र सांगून थेट मुख्य पुरोहितांशी पूजा संकल्प निश्चित करा."
                : isHi ? "सूचना: अपना नाम, नक्षत्र एवं गोत्र बताकर सीधे मुख्य अर्चक से संकल्प पूजा सुनिश्चित करें।"
                : "Note: Quote your birth star and Gotra to confirm authentic Sankalpa Puja with the Chief Priest."}
            </p>
          </div>
        </div>

        {/* Sacred Sanskrit Benediction & Gokarna Footer */}
        <div className="mt-12 text-center text-amber-900 space-y-3 pb-8 border-t border-amber-700/30 pt-6">
          <p className="text-2xl font-bold font-serif text-amber-950">
            {isKn ? "॥ ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು • ಸಮಸ್ತ ಸನ್ಮಂಗಳಾನಿ ಭವಂತು ॥"
              : isMr ? "॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥"
              : isHi ? "॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥"
              : "|| Sarve Bhavantu Sukhinah Sarve Santu Niramayah ||"}
          </p>
          <p className="text-sm font-bold uppercase tracking-wider text-amber-800">
            {data.footerText}
          </p>
        </div>
      </div>
    </div>
  );
});

SampoornaMaster25PdfTemplate.displayName = "SampoornaMaster25PdfTemplate";
