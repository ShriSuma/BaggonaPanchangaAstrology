/**
 * ============================================================================
 * BAGGONA PANCHANGA — SAMPOORNA 25-CHAPTER MASTER HOROSCOPE PDF TEMPLATE
 * ============================================================================
 * Render Rules (Strict A4 Compliance & Zero-Table Parity):
 *  - ZERO <table>, <tr>, <td>, <th> tags (Pure CSS Grid / Flexbox layout)
 *  - Fixed 900px print width (ZERO Tailwind sm:/md:/lg: viewport classes)
 *  - Zero transform -skew-x-12 (html2canvas safe straight royal frames)
 *  - letter-spacing: normal across all Indic typography (zero glyph overlap)
 *  - Complete 6-Anga Birth Panchanga + Lagna/Moon/Dasha/Yogi/Maandi profile
 *  - Preserves #sampoorna-master-25-pdf-container, bg-orange-50, and
 *    [data-section="fifteen-day-calendar-qr"] directly preceding chapter-25.
 * ============================================================================
 */

import React, { forwardRef } from "react";
import {
  toNativeDigits,
  type SampoornaMaster25Payload,
  type Master25Chapter,
} from "../../services/sampoornaMaster25Service";
import { CosmicDashaAuraVisual } from "../RamanBhavishya/CosmicDashaAuraVisual";
import { type SixLang, pick6 } from "../../features/fiveYearPrediction/fiveYearLocale";

interface Props {
  data: SampoornaMaster25Payload;
}

export const SampoornaMaster25PdfTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const lang = data.targetLanguage;
  const n = (val: number | string) => toNativeDigits(val, lang);

  const getFontFamily = (l: SixLang): string => {
    switch (l) {
      case "kn":
        return "'Noto Serif Kannada', 'Noto Sans Kannada', serif";
      case "mr":
      case "hi":
        return "'Noto Sans Devanagari', 'Noto Serif', serif";
      case "te":
        return "'Noto Sans Telugu', serif";
      case "ta":
        return "'Noto Sans Tamil', serif";
      default:
        return "'Outfit', 'Playfair Display', Georgia, serif";
    }
  };

  const activeFontFamily = getFontFamily(lang);
  const sectionClass = "pdf-section px-14 py-8 relative";

  const chapterWord = pick6(
    {
      kn: "ಅಧ್ಯಾಯ",
      mr: "अध्याय",
      hi: "अध्याय",
      te: "అధ్యాయం",
      ta: "அத்தியாயம்",
      en: "Chapter",
    },
    lang
  );
  const questionLabel = pick6(
    {
      kn: "ಪ್ರಶ್ನೆ:",
      mr: "प्रश्न:",
      hi: "प्रश्न:",
      te: "ప్రశ్న:",
      ta: "கேள்வி:",
      en: "Question:",
    },
    lang
  );
  const questionEyebrow = pick6(
    {
      kn: "ದೈವಜ್ಞ ಜನ್ಮ ಕುಂಡಲಿ ವಿಚಾರ & ತತ್ತ್ವ ಚಿಂತನೆ",
      mr: "दैवज्ञ जन्मकुंडली विचार व तत्त्वचिंतन",
      hi: "दैवज्ञ जन्मकुंडली विचार एवं तत्त्व चिंतन",
      te: "దైవజ్ఞ జన్మ కుండలి విచారణ & తత్వ చింతన",
      ta: "தெய்வீக ஜென்ம குண்டலி சிந்தனை & தத்துவம்",
      en: "Vedic Natal Inquiry & Dharma Reflection",
    },
    lang
  );

  const sacredInvocation = pick6(
    {
      kn: "॥ ಓಂ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥",
      mr: "॥ ॐ श्री गणेशाय नमः • श्री क्षेत्र गोकर्ण महाबळेश्वर प्रसन्न ॥",
      hi: "॥ ॐ श्री गणेशाय नमः • श्री क्षेत्र गोकर्ण महाबलेश्वर प्रसन्न ॥",
      te: "॥ ఓం శ్రీ గణేశాయ నమః • శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర ప్రసన్న ॥",
      ta: "✦ ௐ ஸ்ரீ கணேசாய நமஹ • ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் துணை ✦",
      en: "OM SRI GANESHAYA NAMAHA • SRI KSHETRA GOKARNA MAHABALESHWARA BLESSINGS",
    },
    lang
  );

  const runningHeaderFolio = pick6(
    {
      kn: "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥  •  ಸಂಪೂರ್ಣ ೨೫ ಅಧ್ಯಾಯಗಳ ಮಹಾ ಜಾತಕ",
      mr: "॥ बग्गोण पंचांग ॥  •  संपूर्ण २५ अध्यायांचे महा-जन्मपत्रिका विश्लेषण",
      hi: "॥ बग्गोण पंचांग ॥  •  संपूर्ण २५ अध्यायों की महा-जन्मकुंडली",
      te: "॥ బగ్గోణ పంచాంగం ॥  •  సంపూర్ణ 25 అధ్యాయాల మహా జాతకం",
      ta: "✦ பக்கோண பஞ்சாங்கம் ✦  •  சம்பூர்ண 25 அத்தியாய மகா ஜாதகம்",
      en: "BAGGONA PANCHANGA  •  SAMPOORNA 25-CHAPTER MASTER BOOKLET",
    },
    lang
  );

  const cleanChapterTitle = (chapter: Master25Chapter): string =>
    (chapter.title || "")
      .replace(/^(ಅಧ್ಯಾಯ\s*[\d೦-೯]+[:\-\s]*|अध्याय\s*[\d०-९]+[:\-\s]*|అధ్యాయం\s*[\d౦-౯]+[:\-\s]*|அத்தியாயம்\s*[\d௦-௯]+[:\-\s]*|Chapter\s*\d+[:\-\s]*)/i, "")
      .trim();

  const renderChapterBanner = (chapter: Master25Chapter) => {
    const chWord = pick6(
      {
        kn: `ಅಧ್ಯಾಯ ${n(chapter.chapterNumber)}`,
        mr: `अध्याय ${n(chapter.chapterNumber)}`,
        hi: `अध्याय ${n(chapter.chapterNumber)}`,
        te: `అధ్యాయం ${n(chapter.chapterNumber)}`,
        ta: `அத்தியாயம் ${n(chapter.chapterNumber)}`,
        en: `Chapter ${chapter.chapterNumber}`,
      },
      lang
    );

    return (
      <div
        style={{
          borderBottom: "2px solid rgba(180, 83, 9, 0.36)",
          paddingBottom: "7px",
          marginBottom: "10px",
          letterSpacing: "normal",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "5px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "3px 12px",
              backgroundColor: "rgba(180, 83, 9, 0.1)",
              color: "#78350f",
              borderRadius: "9999px",
              border: "1px solid rgba(146, 64, 14, 0.28)",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "normal",
            }}
          >
            <span>{chapter.icon}</span>
            <span>{chWord}</span>
            {chapter.visualSummary?.themeBadge && (
              <>
                <span style={{ opacity: 0.45 }}>•</span>
                <span style={{ color: "#92400e" }}>{chapter.visualSummary.themeBadge}</span>
              </>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13.5px",
              color: "#92400e",
              opacity: 0.72,
            }}
          >
            <span>❖</span>
            <span>✦</span>
          </div>
        </div>
        <h2
          style={{
            fontSize: "22px",
            lineHeight: 1.32,
            fontWeight: 800,
            color: "#451a03",
            margin: 0,
            letterSpacing: "normal",
            wordBreak: "break-word",
          }}
        >
          {cleanChapterTitle(chapter)}
        </h2>
      </div>
    );
  };

  const renderContemplationRibbon = (badge?: string, guidance?: string) => {
    if (!guidance) return null;
    return (
      <div
        style={{
          marginTop: "10px",
          padding: "9px 14px",
          background: "linear-gradient(to right, rgba(254, 243, 199, 0.9), rgba(255, 247, 237, 0.85), rgba(254, 243, 199, 0.9))",
          border: "1px solid rgba(217, 119, 6, 0.35)",
          borderRadius: "8px",
          letterSpacing: "normal",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "15.5px",
            lineHeight: 1.48,
            fontWeight: 700,
            color: "#78350f",
            letterSpacing: "normal",
            wordBreak: "break-word",
          }}
        >
          {badge ? (
            <strong style={{ color: "#9a3412", marginRight: "6px" }}>❖ {badge}:</strong>
          ) : (
            <strong style={{ color: "#9a3412", marginRight: "6px" }}>❖</strong>
          )}
          {guidance}
        </p>
      </div>
    );
  };

  const ageWord = pick6(
    { kn: "ವಯಸ್ಸು", mr: "वय", hi: "आयु", te: "వయస్సు", ta: "வயது", en: "Age" },
    lang
  );
  const yearsWord = pick6(
    { kn: "ವರ್ಷ", mr: "वर्षे", hi: "वर्ष", te: "సం", ta: "வயது", en: "yrs" },
    lang
  );
  const houseWord = pick6(
    { kn: "ಮನೆ", mr: "स्थान", hi: "भाव", te: "స్థానం", ta: "வீடு", en: "House" },
    lang
  );

  const infoCellStyle: React.CSSProperties = {
    backgroundColor: "#fffdf8",
    border: "1px solid #efd5a3",
    borderRadius: "6px",
    padding: "11px 14px",
    letterSpacing: "normal",
  };
  const infoLabelStyle: React.CSSProperties = {
    fontSize: "13.5px",
    fontWeight: 700,
    color: "#92400e",
    marginBottom: "4px",
    letterSpacing: "normal",
  };
  const infoValueStyle: React.CSSProperties = {
    fontSize: "17.5px",
    fontWeight: 700,
    color: "#451a03",
    lineHeight: 1.44,
    letterSpacing: "normal",
    wordBreak: "break-word",
  };

  return (
    <div
      id="sampoorna-master-25-pdf-container"
      ref={ref}
      className="bg-orange-50 text-amber-950 font-serif mx-auto"
      style={{
        width: "900px",
        backgroundColor: "#FFF7ED",
        fontFamily: activeFontFamily,
        letterSpacing: "normal",
        boxSizing: "border-box",
      }}
    >
      {/* RUNNING HEADER STRIP FOR PAGES 2+ (Intentionally outside .pdf-section) */}
      <div
        id="sampoorna-master-25-running-header"
        style={{
          width: "100%",
          backgroundColor: "#FFF7ED",
          color: "#78350f",
          boxSizing: "border-box",
          letterSpacing: "normal",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            width: "100%",
            padding: "5px 10px",
            boxSizing: "border-box",
            fontSize: "12.5px",
            fontWeight: 700,
            letterSpacing: "normal",
          }}
        >
          <span>{runningHeaderFolio}</span>
          <span style={{ whiteSpace: "nowrap" }}>
            {data.devoteeName} • {data.lagnaName}
          </span>
        </div>
      </div>

      {/* RUNNING FOOTER TEXT STRIP IN NATIVE SCRIPT (Captured once outside .pdf-section) */}
      <div
        id="sampoorna-master-25-running-footer"
        style={{
          backgroundColor: "#FFF7ED",
          color: "#78350f",
          letterSpacing: "normal",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "2px 6px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "normal",
          }}
        >
          {data.footerText}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1 (PAGE 1): CLEAN MINIMALIST PREMIUM V1 COVER HEADER         */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="cover">
        <div
          style={{
            boxSizing: "border-box",
            letterSpacing: "normal",
            textAlign: "center",
            padding: "12px 10px 6px 10px",
          }}
        >
          <p
            style={{
              margin: "0 0 12px 0",
              fontSize: "14.5px",
              fontWeight: 700,
              color: "#92400e",
              letterSpacing: "normal",
            }}
          >
            {sacredInvocation}
          </p>

          {/* Grand Stately V1 Royal Banner Heading (Brand + Big Main Heading Unified) */}
          <div
            style={{
              display: "inline-block",
              padding: "16px 52px",
              marginBottom: "12px",
              borderRadius: "10px",
              borderTop: "2.5px solid rgba(180, 83, 9, 0.5)",
              borderBottom: "2.5px solid rgba(180, 83, 9, 0.5)",
              backgroundColor: "rgba(254, 243, 199, 0.32)",
            }}
          >
            <div
              style={{
                fontSize: "19px",
                fontWeight: 800,
                lineHeight: 1.3,
                color: "#92400e",
                marginBottom: "6px",
                letterSpacing: "normal",
              }}
            >
              {data.coverPage.brandBannerTitle}
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "38px",
                fontWeight: 800,
                lineHeight: 1.28,
                color: "#451a03",
                letterSpacing: "normal",
              }}
            >
              {pick6(
                {
                  kn: "ಸಂಪೂರ್ಣ ೨೫ ಅಧ್ಯಾಯಗಳ ಮಹಾ ಜಾತಕ ಗ್ರಂಥ",
                  mr: "संपूर्ण २५ अध्यायांचे महा-जन्मपत्रिका ग्रंथ",
                  hi: "संपूर्ण २५ अध्यायों का महा-जन्मकुंडली ग्रंथ",
                  te: "సంపూర్ణ 25 అధ్యాయాల మహా జాతక గ్రంథం",
                  ta: "சம்பூர்ண 25 அத்தியாய மகா ஜாதக நூல்",
                  en: "Sampoorna 25-Chapter Master Horoscope",
                },
                lang
              )}
            </h1>
          </div>

          <p
            style={{
              margin: "0 auto 14px auto",
              fontSize: "16.5px",
              fontStyle: "italic",
              fontWeight: 600,
              color: "#78350f",
              letterSpacing: "normal",
            }}
          >
            {data.coverPage.kshetraSubtitle}
          </p>

          {/* Hairline V1 Emblem Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "18px",
              marginBottom: "14px",
              opacity: 0.85,
            }}
          >
            <div style={{ width: "100px", borderBottom: "1.5px solid rgba(180, 83, 9, 0.5)" }} />
            <span style={{ fontSize: "19px", fontWeight: 700, color: "#92400e" }}>
              {lang === "ta" ? "✦" : "ॐ"}
            </span>
            <div style={{ width: "100px", borderBottom: "1.5px solid rgba(180, 83, 9, 0.5)" }} />
          </div>

          {/* Borderless Compact Pratah Darshana Accent */}
          <div
            data-cover-element="pratah-prarthana"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              maxWidth: "740px",
              margin: "0 auto",
              padding: "2px 8px",
              textAlign: "left",
            }}
          >
            <img
              src="/daily_posters/poster_1_shiva.jpg"
              alt="Sri Gokarna Mahabaleshwara Pratah Darshana"
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "9999px",
                objectFit: "cover",
                border: "2px solid #d97706",
                flexShrink: 0,
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: 1.48,
                color: "#78350f",
                fontWeight: 600,
                wordBreak: "break-word",
              }}
            >
              <strong style={{ color: "#92400e", marginRight: "6px" }}>
                ❖{" "}
                {pick6(
                  {
                    kn: "ಪ್ರಾತಃ ಪ್ರಾರ್ಥನೆ:",
                    mr: "प्रातः प्रार्थना:",
                    hi: "प्रातः प्रार्थना:",
                    te: "ప్రాతః ప్రార్థన:",
                    ta: "காலைப் பிரார்த்தனை:",
                    en: "Pratah Prarthana:",
                  },
                  lang
                )}
              </strong>
              {pick6(
                {
                  kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತರಿಂದ ಸಮರ್ಪಿತ ಜಾತಕ ಗ್ರಂಥ.",
                  mr: "श्री क्षेत्र गोकर्ण महाबळेश्वर सान्निध्यात वेदमूर्ती चैतन्य पंडित यांनी सादर केलेला जीवनग्रंथ.",
                  hi: "श्री क्षेत्र गोकर्ण महाबलेश्वर सान्निध्य में वेदमूर्ति चैतन्य पंडित द्वारा समर्पित जीवन-ग्रंथ।",
                  te: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధిలో వేదమూర్తి చైతన్య పండిత్ సమర్పించిన జీవన గ్రంథం.",
                  ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதியில் வேதமூர்த்தி சைதன்ய பண்டிதரால் சமர்ப்பிக்கப்பட்ட வாழ்க்கை நூல்.",
                  en: "Sacred astrological guidance consecrated at dawn before Lord Mahabaleshwara by Veda Moorthy Chaitanya Pandit.",
                },
                lang
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Executive Index removed cleanly per user request */}

      {/* ==================================================================== */}
      {/* SECTION 2: CLEAN OPEN V1 PARCHMENT NATAL & 6-ANGA PANCHANGA SUMMARY  */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="user-details">
        <div style={{ boxSizing: "border-box", letterSpacing: "normal" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "10px",
              marginBottom: "16px",
              borderBottom: "2px solid rgba(180, 83, 9, 0.35)",
            }}
          >
            <span style={{ fontSize: "26px", fontWeight: 800, color: "#451a03" }}>
              {pick6(
                {
                  kn: "ಜಾತಕ ಹಾಗೂ ಷಡಂಗ ಪಂಚಾಂಗದ ಮೂಲ ವಿವರ",
                  mr: "जन्मकुंडली व षडांग पंचांग तपशील",
                  hi: "जन्मकुंडली एवं षडांग पंचांग विवरण",
                  te: "జాతక & షడంగ పంచాంగ వివరాలు",
                  ta: "ஜாதக மற்றும் ஷடங்க பஞ்சாங்க விவரம்",
                  en: "Natal Kundli & Complete 6-Anga Birth Panchanga",
                },
                lang
              )}
            </span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#92400e" }}>
              {data.ayanamsha}
            </span>
          </div>

          {/* Premium PDF V1 Unified Open Parchment Grid Card (Clean Balanced 7x2 Grid) */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "14px",
              border: "2px solid rgba(180, 83, 9, 0.45)",
              backgroundColor: "rgba(254, 243, 199, 0.45)",
              padding: "26px 32px",
              boxShadow: "0 2px 8px rgba(120, 53, 15, 0.08)",
            }}
          >
            <span style={{ position: "absolute", top: "12px", left: "16px", fontSize: "12px", color: "rgba(180, 83, 9, 0.42)" }}>❖</span>
            <span style={{ position: "absolute", top: "12px", right: "16px", fontSize: "12px", color: "rgba(180, 83, 9, 0.42)" }}>❖</span>
            <span style={{ position: "absolute", bottom: "12px", left: "16px", fontSize: "12px", color: "rgba(180, 83, 9, 0.42)" }}>❖</span>
            <span style={{ position: "absolute", bottom: "12px", right: "16px", fontSize: "12px", color: "rgba(180, 83, 9, 0.42)" }}>❖</span>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 36px",
              }}
            >
              {/* Row 1 */}
              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಜಾತಕರ ಹೆಸರು & ವಯಸ್ಸು", mr: "जातकाचे नाव व वय", hi: "जातक का नाम एवं आयु", te: "జాతకుని పేరు & వయస్సు", ta: "ஜாதகர் பெயர் & வயது", en: "Devotee Name & Age" }, lang)}
                </div>
                <div style={{ fontSize: "19.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  {data.devoteeName} ({ageWord}: {n(Math.round(data.ageYears))} {yearsWord})
                </div>
              </div>

              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಜನ್ಮ ದಿನಾಂಕ & ಸಮಯ", mr: "जन्म दिनांक व वेळ", hi: "जन्म तिथि एवं समय", te: "పుట్టిన తేదీ & సమయం", ta: "பிறந்த தேதி & நேரம்", en: "Birth Date & Time" }, lang)}
                </div>
                <div style={{ fontSize: "19.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  {n(data.birthDate)} • {n(data.birthTime)}
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಜನ್ಮ ಸ್ಥಳ", mr: "जन्म स्थळ", hi: "जन्म स्थान", te: "జన్మ స్థలం", ta: "பிறந்த இடம்", en: "Birth Place" }, lang)}
                </div>
                <div style={{ fontSize: "19.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42, wordBreak: "break-word" }}>
                  {data.birthPlace}
                </div>
              </div>

              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಜನ್ಮ ಲಗ್ನ & ಲಗ್ನಾಧಿಪತಿ", mr: "जन्म लग्न व स्वामी", hi: "जन्म लग्न एवं स्वामी", te: "జన్మ లగ్నం & అధిపతి", ta: "ஜென்ம லக்னம் & அதிபதி", en: "Janma Lagna & Lord" }, lang)}
                </div>
                <div style={{ fontSize: "19.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  {data.lagnaName} ({data.lagnaLord})
                </div>
              </div>

              {/* Row 3 */}
              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಚಂದ್ರ ರಾಶಿ & ರಾಶ್ಯಾಧಿಪತಿ", mr: "चंद्र राशी व स्वामी", hi: "चंद्र राशि एवं स्वामी", te: "చంద్ర రాశి & అధిపతి", ta: "சந்திர ராசி & அதிபதி", en: "Moon Sign & Lord" }, lang)}
                </div>
                <div style={{ fontSize: "19.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  {data.moonRashi} ({data.moonLord})
                </div>
              </div>

              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಜನ್ಮ ನಕ್ಷತ್ರ", mr: "जन्म नक्षत्र", hi: "जन्म नक्षत्र", te: "జన్మ నక్షత్రం", ta: "ஜென்ம நட்சத்திரம்", en: "Birth Nakshatra" }, lang)}
                </div>
                <div style={{ fontSize: "19.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  {data.nakshatraName}
                </div>
              </div>

              {/* Row 4 */}
              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ತಿಥಿ (ಪಕ್ಷ) & ಜನ್ಮ ವಾರ", mr: "तिथी (पक्ष) व वार", hi: "तिथि (पक्ष) एवं वार", te: "తిథి (పక్షం) & వారం", ta: "திதி (பக்ஷம்) & கிழமை", en: "Tithi (Paksha) & Weekday" }, lang)}
                </div>
                <div style={{ fontSize: "19.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  {data.tithiName.includes(data.pakshaName) ? data.tithiName : `${data.pakshaName} ${data.tithiName}`} • {data.weekdayName}
                </div>
              </div>

              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ನಿತ್ಯ ಯೋಗ & ಕರಣ", mr: "नित्य योग व करण", hi: "नित्य योग एवं करण", te: "నిత్య యోగం & కరణం", ta: "நித்ய யோகம் & கரணம்", en: "Nitya Yoga & Karana" }, lang)}
                </div>
                <div style={{ fontSize: "19.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  {data.yogaName} • {data.karanaName}
                </div>
              </div>

              {/* Row 5 */}
              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಸೂರ್ಯೋದಯ / ಸೂರ್ಯಾಸ್ತ & ಜನ್ಮ ಹೋರಾ", mr: "सूर्योदय / सूर्यास्त व जन्म होरा", hi: "सूर्योदय / सूर्यास्त एवं जन्म होरा", te: "సూర్యోదయం / సూర్యాస్తమయం & హోర", ta: "சூரிய உதயம் / அஸ்தமனம் & ஹோரை", en: "Sunrise / Sunset & Birth Hora" }, lang)}
                </div>
                <div style={{ fontSize: "19.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  {n(data.sunriseTime)} / {n(data.sunsetTime)} • {data.janmaHora}
                </div>
              </div>

              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ – ಅಂತರ್ದಶೆ", mr: "चालू महादशा – अंतर्दशा", hi: "वर्तमान महादशा – अंतर्दशा", te: "ప్రస్తుత మహర్దశ – అంతర్దశ", ta: "நடப்பு மகாதசை – அந்தர்தசை", en: "Active Mahadasha – Bhukti" }, lang)}
                </div>
                <div style={{ fontSize: "19.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  {data.currentMahadasha} – {data.currentBhukti} ({n(data.bhuktiEndDate)})
                </div>
              </div>

              {/* Row 6 */}
              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಜನ್ಮ ದಶಾ ಶೇಷ", mr: "जन्म दशा शिल्लक", hi: "जन्म दशा शेष", te: "జన్మ దశా శేషం", ta: "ஜனன தசா இருப்பு", en: "Janma Dasha Balance" }, lang)}
                </div>
                <div style={{ fontSize: "18.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  {n(data.janmaDashaBalance)}
                </div>
              </div>

              <div style={{ borderBottom: "1px solid rgba(146, 64, 14, 0.22)", paddingBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಯೋಗಿ • ಅವಯೋಗಿ • ಮಾಂದಿ ಸ್ಥಾನ", mr: "योगी • अवयोगी • मांदी स्थान", hi: "योगी • अवयोगी • मांदी स्थिति", te: "యోగి • అవయోగి • మాంది స్థానం", ta: "யோகி • அவயோகி • மாந்தி நிலை", en: "Yogi • Avayogi • Maandi" }, lang)}
                </div>
                <div style={{ fontSize: "18.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.42 }}>
                  ✨ {data.yogiPlanet} • ⚠️ {data.avayogiPlanet} • {houseWord} {n(data.maandiHouse)} ({data.maandiRashi})
                </div>
              </div>

              {/* Row 7: Clean Grid Integration of Tarabala, Element & Principal Kundli Hero */}
              <div style={{ paddingTop: "2px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ತಾರಾಬಲ & ಪ್ರಧಾನ ತತ್ತ್ವ", mr: "ताराबल व मुख्य तत्त्व", hi: "ताराबल एवं प्रमुख तत्त्व", te: "తారాబలం & ప్రధాన తత్త్వం", ta: "தாராபலம் & முக்கிய தத்துவம்", en: "Tarabala & Dominant Element" }, lang)}
                </div>
                <div style={{ fontSize: "17.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.44, wordBreak: "break-word" }}>
                  {data.precisionProfile.liveTarabalaHeadline} • {data.dominantElement}
                </div>
              </div>

              <div style={{ paddingTop: "2px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                  {pick6({ kn: "ಪ್ರಧಾನ ಯೋಗ & ಗ್ರಹ ನಾಯಕ", mr: "प्रमुख योग व मुख्य ग्रह", hi: "प्रमुख योग एवं नायक ग्रह", te: "ప్రధాన యోగాలు & నాయక గ్రహం", ta: "முக்கிய யோகம் & நாயக கிரகம்", en: "Key Yogas & Principal Planet" }, lang)}
                </div>
                <div style={{ fontSize: "17.5px", fontWeight: 800, color: "#451a03", lineHeight: 1.44, wordBreak: "break-word" }}>
                  {data.detectedYogasSummary}
                  {data.heroSummary ? ` • ${data.heroSummary.heroPlanetName} (${data.heroSummary.heroPlanetRashi})` : ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CHAPTERS 1 TO 25 (AND 15-DAY CALENDAR QR RIGHT BEFORE CHAPTER 25)    */}
      {/* ==================================================================== */}
      {data.chapters.map((chapter) => (
        <React.Fragment key={`wrap-chapter-${chapter.chapterNumber}`}>
          {chapter.chapterNumber === 25 && data.calendarQrSection && (
            <div className={sectionClass} data-section="fifteen-day-calendar-qr">
              <div
                style={{
                  padding: "16px 22px",
                  boxSizing: "border-box",
                  letterSpacing: "normal",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "8px",
                      marginBottom: "16px",
                      borderBottom: "1.5px solid #d97706",
                      fontSize: "15.5px",
                      fontWeight: 700,
                      color: "#92400e",
                    }}
                  >
                    <span>{data.calendarQrSection.badge}</span>
                    <span>
                      {data.calendarQrSection.priestName} ({data.calendarQrSection.priestPhoneDisplay})
                    </span>
                  </div>

                  <h2
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "26px",
                      fontWeight: 800,
                      lineHeight: 1.38,
                      color: "#451a03",
                      textAlign: "center",
                    }}
                  >
                    {data.calendarQrSection.title}
                  </h2>
                  <p
                    style={{
                      margin: "0 0 24px 0",
                      fontSize: "18px",
                      lineHeight: 1.6,
                      color: "#78350f",
                      textAlign: "center",
                    }}
                  >
                    {data.calendarQrSection.description}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "270px 1fr",
                      gap: "24px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#fffdf8",
                        border: "1px solid #efd5a3",
                        borderRadius: "8px",
                        padding: "18px",
                        textAlign: "center",
                      }}
                    >
                      <img
                        src={data.calendarQrSection.qrDataUrl}
                        alt="15-Day Daily Darshana Calendar"
                        className="w-52 h-52 mx-auto rounded-lg border-2 border-amber-400 p-1 bg-white"
                        style={{ display: "block", width: "220px", height: "220px", margin: "0 auto" }}
                      />
                      <p
                        style={{
                          margin: "14px 0 8px 0",
                          fontSize: "15.5px",
                          fontWeight: 700,
                          color: "#78350f",
                          lineHeight: 1.48,
                        }}
                      >
                        {data.calendarQrSection.scanInstructions}
                      </p>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#92400e" }}>
                        {data.calendarQrSection.priestName} • {data.calendarQrSection.priestPhoneDisplay}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {data.calendarQrSection.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          style={{
                            borderLeft: "3px solid #d97706",
                            padding: "6px 14px",
                            fontSize: "17px",
                            lineHeight: 1.54,
                            fontWeight: 600,
                            color: "#451a03",
                          }}
                        >
                          {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "24px",
                    paddingTop: "14px",
                    borderTop: "1px solid #d97706",
                  }}
                >
                  <div style={{ fontSize: "17.5px", fontWeight: 800, color: "#78350f", marginBottom: "6px" }}>
                    {data.calendarQrSection.upsellNoticeTitle}
                  </div>
                  <p style={{ margin: 0, fontSize: "16.5px", lineHeight: 1.58, color: "#451a03", fontWeight: 600 }}>
                    "{data.calendarQrSection.upsellNoticeText}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {chapter.chapterNumber === 7 && (
            <div className={sectionClass} data-section="cosmic-aura">
              <CosmicDashaAuraVisual
                lagnaName={data.lagnaName}
                lagnaIndex={data.lagnaRashiIdx ?? 0}
                lagnaLordName={data.lagnaLord}
                moonName={data.moonRashi}
                moonIndex={data.moonRashiIdx ?? 0}
                nakshatraName={data.nakshatraName}
                mahaLord={data.currentMahadasha}
                bhuktiLord={data.currentBhukti}
                mahaLordKey={data.rawMahadashaPlanet}
                bhuktiLordKey={data.rawBhuktiPlanet}
                elementName={data.dominantElement}
                lang={lang === "mr" ? "hi" : lang}
                jupiterTransitHouse={data.chartVisualMetrics?.guruHouseFromMoon}
                saturnTransitHouse={data.chartVisualMetrics?.shaniHouseFromMoon}
              />
            </div>
          )}

          <div
            className={sectionClass}
            data-section={`chapter-${chapter.chapterNumber}`}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                boxSizing: "border-box",
                letterSpacing: "normal",
              }}
            >
              {/* Premium PDF V1 Clean Bold Chapter Heading */}
              <h2
                style={{
                  margin: "0 0 20px 0",
                  paddingBottom: "12px",
                  borderBottom: "2px solid rgba(180, 83, 9, 0.3)",
                  fontSize: "30px",
                  fontWeight: 800,
                  lineHeight: 1.35,
                  color: "#451a03",
                  letterSpacing: "normal",
                  wordBreak: "break-word",
                }}
              >
                {chapterWord} {n(chapter.chapterNumber)}: {chapter.title}
              </h2>

              {/* Premium PDF V1 Warm Amber Gradient Top Inquiry Box */}
              <div
                style={{
                  borderRadius: "12px",
                  border: "2px solid rgba(180, 83, 9, 0.3)",
                  background:
                    "linear-gradient(90deg, rgba(254, 243, 199, 0.92) 0%, rgba(255, 247, 237, 0.85) 50%, rgba(254, 243, 199, 0.92) 100%)",
                  padding: "18px 22px",
                  marginBottom: "22px",
                  boxShadow: "0 1px 3px rgba(120, 53, 15, 0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#92400e",
                    marginBottom: "6px",
                    letterSpacing: "normal",
                  }}
                >
                  ✨ {questionEyebrow}
                </div>
                <div
                  style={{
                    fontSize: "19px",
                    fontWeight: 800,
                    lineHeight: 1.48,
                    color: "#451a03",
                    wordBreak: "break-word",
                    letterSpacing: "normal",
                  }}
                >
                  <span style={{ color: "#b45309", marginRight: "8px" }}>❖</span>
                  <span style={{ marginRight: "6px" }}>{questionLabel}</span>
                  {(chapter.question || "").replace(/^(ಪ್ರಶ್ನೆ|प्रश्न|ప్రశ్న|கேள்வி|ചോദ്യം|Question)\s*:\s*/i, "").trim()}
                </div>
              </div>

              {/* Premium PDF V1 Royal Parchment Story Card with 4-Corner Floret Marks */}
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "16px",
                  border: "2px solid rgba(180, 83, 9, 0.3)",
                  backgroundColor: "rgba(255, 251, 235, 0.85)",
                  padding: "32px 34px",
                  boxShadow: "0 1px 4px rgba(120, 53, 15, 0.07)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "22px",
                }}
              >
                {/* 4 Subtle Corner Ornament Marks matching Premium PDF V1 */}
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "16px",
                    fontSize: "12px",
                    color: "rgba(217, 119, 6, 0.38)",
                    pointerEvents: "none",
                  }}
                >
                  ❖
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "16px",
                    fontSize: "12px",
                    color: "rgba(217, 119, 6, 0.38)",
                    pointerEvents: "none",
                  }}
                >
                  ❖
                </span>
                <span
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "16px",
                    fontSize: "12px",
                    color: "rgba(217, 119, 6, 0.38)",
                    pointerEvents: "none",
                  }}
                >
                  ❖
                </span>
                <span
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "16px",
                    fontSize: "12px",
                    color: "rgba(217, 119, 6, 0.38)",
                    pointerEvents: "none",
                  }}
                >
                  ❖
                </span>

                {chapter.paragraphs.map((para, pIdx) => (
                  <p
                    key={pIdx}
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      lineHeight: 1.72,
                      color: "#1f1206",
                      fontWeight: 500,
                      letterSpacing: "normal",
                      wordBreak: "break-word",
                      textAlign: "left",
                    }}
                  >
                    {para}
                  </p>
                ))}

                {/* Chapter 5: Premium PDF V1 4-Elemental Balance Scorecard */}
                {chapter.chapterNumber === 5 && data.chartVisualMetrics && (
                  <div
                    data-v1-visual="elemental-balance"
                    style={{
                      marginTop: "6px",
                      padding: "16px 18px",
                      borderRadius: "12px",
                      backgroundColor: "#fffdf7",
                      border: "1px solid rgba(180, 83, 9, 0.25)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "#78350f",
                        marginBottom: "12px",
                      }}
                    >
                      ❖{" "}
                      {pick6(
                        {
                          kn: "ಪಂಚಭೂತ ತತ್ತ್ವ ಸಂತುಲನ ಪಟ್ಟಿ",
                          mr: "पंचमहाभूत तत्त्व संतुलन",
                          hi: "पंचमहाभूत तत्त्व संतुलन",
                          te: "పంచభూత తత్వ సమతుల్యత",
                          ta: "பஞ்சபூத தத்துவ சமநிலை",
                          en: "Elemental Balance Matrix",
                        },
                        lang
                      )}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: "10px",
                      }}
                    >
                      {[
                        {
                          key: "fire",
                          label: pick6(
                            { kn: "ಅಗ್ನಿ", mr: "अग्नि", hi: "अग्नि", te: "అగ్ని", ta: "நெருப்பு", en: "Fire" },
                            lang
                          ),
                          pct: data.chartVisualMetrics.elemPercentages.fire,
                          barColor: "#d97706",
                        },
                        {
                          key: "earth",
                          label: pick6(
                            { kn: "ಪೃಥ್ವಿ", mr: "पृथ्वी", hi: "पृथ्वी", te: "భూమి", ta: "நிலம்", en: "Earth" },
                            lang
                          ),
                          pct: data.chartVisualMetrics.elemPercentages.earth,
                          barColor: "#92400e",
                        },
                        {
                          key: "air",
                          label: pick6(
                            { kn: "ವಾಯು", mr: "वायु", hi: "वायु", te: "వాయువు", ta: "காற்று", en: "Air" },
                            lang
                          ),
                          pct: data.chartVisualMetrics.elemPercentages.air,
                          barColor: "#0284c7",
                        },
                        {
                          key: "water",
                          label: pick6(
                            { kn: "ಜಲ", mr: "जल", hi: "जल", te: "జలం", ta: "நீர்", en: "Water" },
                            lang
                          ),
                          pct: data.chartVisualMetrics.elemPercentages.water,
                          barColor: "#0d9488",
                        },
                      ].map((el) => (
                        <div
                          key={el.key}
                          style={{
                            backgroundColor: "#fffbeb",
                            border: "1px solid #fde68a",
                            borderRadius: "8px",
                            padding: "10px 12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "14px",
                              fontWeight: 800,
                              color: "#451a03",
                              marginBottom: "6px",
                            }}
                          >
                            <span>{el.label}</span>
                            <span>{n(el.pct)}%</span>
                          </div>
                          <div
                            style={{
                              height: "6px",
                              borderRadius: "999px",
                              backgroundColor: "#fef3c7",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.max(6, Math.min(100, el.pct))}%`,
                                backgroundColor: el.barColor,
                                borderRadius: "999px",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chapter 8: Premium PDF V1 Shani & Guru Gochara Transit Badges */}
                {chapter.chapterNumber === 8 && data.chartVisualMetrics && (
                  <div
                    data-v1-visual="gochara-transits"
                    style={{
                      marginTop: "6px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#fffdf7",
                        border: "1px solid rgba(180, 83, 9, 0.3)",
                        borderRadius: "10px",
                        padding: "14px 16px",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                        {pick6(
                          { kn: "ಶನಿ ಗೋಚಾರ ಸ್ಥಿತಿ", mr: "शनी गोचर स्थिती", hi: "शनि गोचर स्थिति", te: "శని గోచార స్థితి", ta: "சனி கோசார நிலை", en: "Saturn Transit Position" },
                          lang
                        )}
                      </div>
                      <div style={{ fontSize: "17px", fontWeight: 800, color: "#451a03" }}>
                        {data.shaniTransitRashi} •{" "}
                        {lang === "en"
                          ? `House ${n(data.chartVisualMetrics.shaniHouseFromMoon)}`
                          : `${n(data.chartVisualMetrics.shaniHouseFromMoon)} ${pick6(
                            { kn: "ನೇ ಭಾವ", mr: "वे स्थान", hi: "वाँ भाव", te: "వ స్థానం", ta: "ஆம் வீடு", en: "House" },
                            lang
                          )}`}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: "#fffdf7",
                        border: "1px solid rgba(180, 83, 9, 0.3)",
                        borderRadius: "10px",
                        padding: "14px 16px",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                        {pick6(
                          { kn: "ಗುರು ಗೋಚಾರ ಸ್ಥಿತಿ", mr: "गुरू गोचर स्थिती", hi: "गुरु गोचर स्थिति", te: "గురు గోచార స్థితి", ta: "குரு கோசார நிலை", en: "Jupiter Transit Position" },
                          lang
                        )}
                      </div>
                      <div style={{ fontSize: "17px", fontWeight: 800, color: "#451a03" }}>
                        {data.guruTransitRashi} •{" "}
                        {lang === "en"
                          ? `House ${n(data.chartVisualMetrics.guruHouseFromMoon)}`
                          : `${n(data.chartVisualMetrics.guruHouseFromMoon)} ${pick6(
                            { kn: "ನೇ ಭಾವ", mr: "वे स्थान", hi: "वाँ भाव", te: "వ స్థానం", ta: "ஆம் வீடு", en: "House" },
                            lang
                          )}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chapter 11: Premium PDF V1 Royal Yoga Highlight Card */}
                {chapter.chapterNumber === 11 && (
                  <div
                    data-v1-visual="yoga-highlight"
                    style={{
                      marginTop: "6px",
                      borderRadius: "12px",
                      border: "1.5px solid #d97706",
                      background: "linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)",
                      padding: "16px 20px",
                    }}
                  >
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#92400e", marginBottom: "6px" }}>
                      👑{" "}
                      {pick6(
                        { kn: "ಜಾತಕದ ಪ್ರಧಾನ ರಾಜಯೋಗ & ಶುಭ ಯೋಗಗಳು", mr: "कुंडलीतील प्रमुख राजयोग व शुभ योग", hi: "कुंडली के प्रमुख राजयोग एवं शुभ योग", te: "జాతకంలోని ప్రధాన రాజయోగాలు", ta: "ஜாதகத்தின் முக்கிய ராஜயோகங்கள்", en: "Detected Natal Yogas & Blessings" },
                        lang
                      )}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#451a03", lineHeight: 1.55 }}>
                      {data.detectedYogasSummary}
                    </div>
                  </div>
                )}

                {/* Chapter 23: Premium PDF V1 Rose-Gold Active Dosha & Remedy Cards */}
                {chapter.chapterNumber === 23 && data.activeDoshaProfiles && data.activeDoshaProfiles.length > 0 && (
                  <div
                    data-v1-visual="dosha-remedy-cards"
                    style={{
                      marginTop: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {data.activeDoshaProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        style={{
                          backgroundColor: "#fff1f2",
                          border: "1.5px solid #fda4af",
                          borderRadius: "14px",
                          padding: "18px 22px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "1px solid #fecdd3",
                            paddingBottom: "8px",
                          }}
                        >
                          <span style={{ fontSize: "18px", fontWeight: 800, color: "#881337" }}>
                            ❖ {profile.title}
                          </span>
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "#9f1239" }}>
                            {profile.severityLabel}
                          </span>
                        </div>
                        <div style={{ fontSize: "16.5px", lineHeight: 1.6, color: "#4c0519", fontWeight: 600 }}>
                          {profile.doingNow}
                        </div>
                        <div style={{ fontSize: "16px", lineHeight: 1.55, color: "#881337", fontWeight: 600 }}>
                          {profile.affectingArea}
                        </div>
                        <div
                          style={{
                            backgroundColor: "#fffbeb",
                            border: "1px solid #f59e0b",
                            borderRadius: "10px",
                            padding: "12px 16px",
                            fontSize: "16.5px",
                            lineHeight: 1.58,
                            color: "#78350f",
                            fontWeight: 700,
                          }}
                        >
                          ✨ {profile.exactAction}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtle Single-Line Royal Wisdom Note (replacing pill clutter) */}
                {chapter.practicalGuidance && (
                  <div
                    style={{
                      marginTop: "4px",
                      paddingTop: "14px",
                      borderTop: "1px solid rgba(180, 83, 9, 0.25)",
                      fontSize: "16.5px",
                      lineHeight: 1.55,
                      color: "#78350f",
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: "#b45309", marginRight: "6px" }}>❖</span>
                    {chapter.guidanceBadge ? `${chapter.guidanceBadge} — ` : ""}
                    {chapter.practicalGuidance}
                  </div>
                )}
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* ==================================================================== */}
      {/* FINAL CULMINATION: FAMILY PROTECTION HOOK & CHAITANYA PANDIT CONTACT  */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="family-referral-and-priest">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            padding: "22px 26px",
            boxSizing: "border-box",
            letterSpacing: "normal",
          }}
        >
          <div
            style={{
              borderLeft: "4px solid #b45309",
              padding: "12px 20px",
              letterSpacing: "normal",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                lineHeight: 1.68,
                color: "#451a03",
                wordBreak: "break-word",
              }}
            >
              "{data.familyProtectionHook}"
            </p>
          </div>

          {data.chartVisualMetrics && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                letterSpacing: "normal",
              }}
            >
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6({ kn: "ಶುಭ ವಾರ & ಯೋಗಿ ದಿಕ್ಕು", mr: "शुभ वार व योगी दिशा", hi: "शुभ वार व योगी दिशा", te: "శుభ వారం & యోగి దిశ", ta: "நல்ல நாள் & யோகி திசை", en: "Personal Power Day & Direction" }, lang)}
                </div>
                <div style={infoValueStyle}>
                  {data.yogiDay} • {data.yogiDirection}
                </div>
              </div>
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6({ kn: "ಸುವರ್ಣ ಶಿಖರ & ದೋಷ ಸಾರಾಂಶ", mr: "सुवर्ण काळ व मुख्य कृती", hi: "स्वर्णिम काल व मुख्य संकल्प", te: "సువర్ణ కాలం & పరిహారం", ta: "பொற்காலம் & முக்கிய தீர்வு", en: "Golden Horizon & Priority Focus" }, lang)}
                </div>
                <div style={infoValueStyle}>
                  {n(data.chartVisualMetrics.nowYear + 2)}–{n(data.chartVisualMetrics.nowYear + 4)} • {data.activeDoshaProfiles?.[0]?.title || data.detectedDoshasSummary}
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid #efd5a3",
              borderBottom: "1px solid #efd5a3",
              textAlign: "center",
              letterSpacing: "normal",
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#78350f", marginBottom: "8px" }}>
              {data.coverPage.sealHeading}
            </div>
            <p style={{ margin: 0, fontSize: "17px", lineHeight: 1.62, color: "#451a03", fontWeight: 600 }}>
              {data.coverPage.confidentialFooterNote} • {data.devoteeName} ({data.lagnaName} / {data.moonRashi} / {data.nakshatraName})
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#fffdf8",
              border: "1px solid #efd5a3",
              borderRadius: "8px",
              padding: "22px 24px",
              letterSpacing: "normal",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "23px",
                fontWeight: 800,
                color: "#78350f",
                lineHeight: 1.4,
              }}
            >
              {data.priestBooking.heading}
            </h3>
            <p style={{ margin: "0 0 18px 0", fontSize: "17px", color: "#92400e", fontWeight: 600 }}>
              {data.priestBooking.subheading}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "18px",
                paddingTop: "12px",
                borderTop: "1px solid #efd5a3",
              }}
            >
              <div>
                <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#b45309", marginBottom: "4px" }}>
                  {data.priestBooking.priestTitle}
                </div>
                <div style={{ fontSize: "25px", fontWeight: 800, color: "#451a03", marginBottom: "6px" }}>
                  {data.priestBooking.priestName}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#78350f", lineHeight: 1.45 }}>
                  {data.priestBooking.address}
                </div>
              </div>

              <a
                href={`tel:${data.priestBooking.phone}`}
                style={{
                  backgroundColor: "#92400e",
                  color: "#fef3c7",
                  padding: "14px 22px",
                  borderRadius: "8px",
                  fontSize: "21px",
                  fontWeight: 800,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{data.priestBooking.phoneDisplay}</span>
              </a>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              borderTop: "1.5px solid #d97706",
              paddingTop: "16px",
              fontSize: "16.5px",
              fontWeight: 700,
              color: "#78350f",
              lineHeight: 1.55,
              letterSpacing: "normal",
            }}
          >
            <div>{sacredInvocation}</div>
            <div style={{ marginTop: "6px", fontSize: "15px" }}>{data.footerText}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

SampoornaMaster25PdfTemplate.displayName = "SampoornaMaster25PdfTemplate";
