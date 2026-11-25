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
import { formatPageTag6L } from "../../services/sampoornaMaster25BookletEngine";
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
  const sectionClass = "pdf-section px-7 py-4 relative";
  const omGlyph = lang === "ta" ? "ௐ" : "ॐ";

  const sacredInvocation = pick6(
    {
      kn: "॥ ಓಂ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥",
      mr: "॥ ॐ श्री गणेशाय नमः • श्री क्षेत्र गोकर्ण महाबळेश्वर प्रसन्न ॥",
      hi: "॥ ॐ श्री गणेशाय नमः • श्री क्षेत्र गोकर्ण महाबलेश्वर प्रसन्न ॥",
      te: "॥ ఓం శ్రీ గణేశాయ నమః • శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర ప్రసన్న ॥",
      ta: "✦ ௐ ஸ்ரீ கணேசாய நமஹ • ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் துணை ✦",
      en: "❖ OM SRI GANESHAYA NAMAHA • SRI KSHETRA GOKARNA MAHABALESHWARA BLESSINGS ❖",
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
      en: "BAGGONA PANCHANGA  •  SAMPOORNA 25-CHAPTER MASTER FOLIO",
    },
    lang
  );

  const folioCornerLabel = pick6(
    {
      kn: "ಬಗ್ಗೋಣ ಮಹಾ ಜಾತಕ",
      mr: "बग्गोण महा-पत्रिका",
      hi: "बग्गोण महा-कुंडली",
      te: "బగ్గోణ మహా జాతకం",
      ta: "பக்கோண மகா ஜாதகம்",
      en: "Baggona Master Folio",
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
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fffbeb 100%)",
          border: "1.5px solid #d97706",
          borderRadius: "10px",
          padding: "12px 18px",
          marginBottom: "12px",
          letterSpacing: "normal",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              backgroundColor: "#92400e",
              color: "#fef3c7",
              padding: "3px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "normal",
            }}
          >
            {chapter.icon} {chWord}
          </span>
          <span
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "#d97706",
              opacity: 0.45,
              marginLeft: "12px",
              marginRight: "12px",
            }}
          />
          <span style={{ fontSize: "14px", color: "#b45309", fontWeight: 700 }}>❖ {omGlyph} ❖</span>
        </div>

        <h2
          style={{
            fontSize: "21px",
            lineHeight: 1.42,
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
    if (!badge && !guidance) return null;
    return (
      <div
        style={{
          marginTop: "12px",
          padding: "12px 16px",
          backgroundColor: "#fffbeb",
          border: "1.5px solid #f59e0b",
          borderLeft: "5px solid #b45309",
          borderRadius: "8px",
          letterSpacing: "normal",
        }}
      >
        {badge && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span style={{ fontSize: "14px" }}>🪔</span>
            <span
              style={{
                fontSize: "12.5px",
                fontWeight: 800,
                color: "#92400e",
                letterSpacing: "normal",
              }}
            >
              {badge}
            </span>
          </div>
        )}
        {guidance && (
          <p
            style={{
              margin: 0,
              fontSize: "14.5px",
              lineHeight: 1.55,
              fontWeight: 600,
              color: "#451a03",
              letterSpacing: "normal",
              wordBreak: "break-word",
            }}
          >
            {guidance}
          </p>
        )}
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
  const padaWord = pick6(
    { kn: "ಪಾದ", mr: "चरण", hi: "पाद", te: "పాదం", ta: "பாதம்", en: "Pada" },
    lang
  );
  const houseWord = pick6(
    { kn: "ಮನೆ", mr: "स्थान", hi: "भाव", te: "స్థానం", ta: "வீடு", en: "House" },
    lang
  );

  const infoCellStyle: React.CSSProperties = {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "6px",
    padding: "8px 12px",
    letterSpacing: "normal",
  };
  const infoLabelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    color: "#92400e",
    marginBottom: "2px",
    letterSpacing: "normal",
  };
  const infoValueStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 700,
    color: "#451a03",
    lineHeight: 1.4,
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px 28px",
          backgroundColor: "#FFF7ED",
          color: "#78350f",
          fontSize: "11.5px",
          fontWeight: 700,
          letterSpacing: "normal",
        }}
      >
        <span>{runningHeaderFolio}</span>
        <span>
          {data.devoteeName} • {data.lagnaName}
        </span>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1 (PAGE 1): DEDICATED ROYAL BOOKLET COVER PAGE               */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="cover">
        <div
          style={{
            minHeight: "1050px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "linear-gradient(160deg, #fffbeb 0%, #fef3c7 48%, #fffbeb 100%)",
            border: "2.5px solid #b45309",
            borderRadius: "14px",
            padding: "24px 28px",
            boxSizing: "border-box",
            letterSpacing: "normal",
          }}
        >
          {/* TOP BRAND CREST: BAGGONA PANCHANGA + GOKARNA INVOCATION */}
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#92400e",
                letterSpacing: "normal",
              }}
            >
              {sacredInvocation}
            </p>

            <div
              style={{
                display: "inline-block",
                backgroundColor: "#78350f",
                color: "#fef3c7",
                border: "2px solid #f59e0b",
                borderRadius: "999px",
                padding: "7px 26px",
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "normal",
                marginBottom: "8px",
              }}
            >
              {data.coverPage.brandBannerTitle}
            </div>

            <p
              style={{
                margin: "0 0 14px 0",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#78350f",
                letterSpacing: "normal",
              }}
            >
              {data.coverPage.kshetraSubtitle}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                marginBottom: "14px",
              }}
            >
              <span style={{ width: "120px", height: "1.5px", backgroundColor: "#b45309", opacity: 0.65 }} />
              <span
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  border: "2px solid #b45309",
                  backgroundColor: "#92400e",
                  color: "#fef3c7",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                {omGlyph}
              </span>
              <span style={{ width: "120px", height: "1.5px", backgroundColor: "#b45309", opacity: 0.65 }} />
            </div>

            <h1
              style={{
                margin: "0 0 8px 0",
                fontSize: "27px",
                fontWeight: 800,
                lineHeight: 1.38,
                color: "#451a03",
                letterSpacing: "normal",
              }}
            >
              {pick6(
                {
                  kn: "ಸಂಪೂರ್ಣ ೨೫ ಅಧ್ಯಾಯಗಳ ಮಹಾ ಜಾತಕ ಹಾಗೂ ಭವಿಷ್ಯ ಗ್ರಂಥ",
                  mr: "संपूर्ण २५ अध्यायांचे महा-जन्मपत्रिका व भविष्य ग्रंथ",
                  hi: "संपूर्ण २५ अध्यायों का महा-जन्मकुंडली एवं भविष्य ग्रंथ",
                  te: "సంపూర్ణ 25 అధ్యాయాల మహా జాతక & భవిష్యత్ గ్రంథం",
                  ta: "சம்பூர்ண 25 அத்தியாய மகா ஜாதகம் மற்றும் எதிர்கால நூல்",
                  en: "Sampoorna 25-Chapter Master Horoscope & Destiny Booklet",
                },
                lang
              )}
            </h1>

            <p
              style={{
                margin: "0 0 12px 0",
                fontSize: "13px",
                fontWeight: 600,
                color: "#78350f",
                letterSpacing: "normal",
              }}
            >
              {pick6(
                {
                  kn: "ಪರಾಶರ ಸಿದ್ಧಾಂತ • ಷಡಂಗ ಪಂಚಾಂಗ • ಯೋಗಿ-ಮಾಂದಿ • ಅಷ್ಟಕವರ್ಗ • ದಶಾ-ಗೋಚಾರ ಸಮಗ್ರ ದರ್ಶನ",
                  mr: "पाराशर सिद्धांत • षडांग पंचांग • योगी-मांदी • अष्टकवर्ग • दशा-गोचर समग्र दर्शन",
                  hi: "पाराशर सिद्धांत • षडांग पंचांग • योगी-मांदी • अष्टकवर्ग • दशा-गोचर समग्र दर्शन",
                  te: "పరాశర సిద్ధాంతం • షడంగ పంచాంగం • యோగి-మాంది • అష్టకవర్గ • దశా-గోచార దర్శనం",
                  ta: "பராசர சித்தாந்தம் • ஷடங்க பஞ்சாங்கம் • யோகி-மாந்தி • அஷ்டகவர்க்கம் • தசா-கோசார தரிசனம்",
                  en: "Parashari Siddhanta • 6-Anga Panchanga • Yogi-Maandi • Ashtakavarga • Live Dasha & Transits",
                },
                lang
              )}
            </p>

            <div
              style={{
                display: "inline-block",
                backgroundColor: "#fef3c7",
                border: "1.5px solid #d97706",
                borderRadius: "8px",
                padding: "5px 16px",
                fontSize: "12px",
                fontWeight: 800,
                color: "#92400e",
                letterSpacing: "normal",
              }}
            >
              ✦ {data.coverPage.exclusiveForTag} ✦
            </div>
          </div>

          {/* PERSONALIZED DEVOTEE IDENTITY PLATE */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #d97706",
              borderRadius: "12px",
              padding: "16px 20px",
              marginTop: "14px",
              marginBottom: "14px",
              letterSpacing: "normal",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "12px", paddingBottom: "10px", borderBottom: "1.5px solid #fde68a" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#92400e", marginBottom: "4px" }}>
                {pick6(
                  {
                    kn: "ಈ ಜಾತಕ ಗ್ರಂಥವನ್ನು ವಿಶೇಷವಾಗಿ ಸಮರ್ಪಿಸಿರುವ ಜಾತಕರು",
                    mr: "ही वैयक्तिक पुस्तिका विशेष समर्पित असलेले जातक",
                    hi: "यह पवित्र पुस्तिका विशेष रूप से समर्पित जातक",
                    te: "ఈ పవిత్ర గ్రంథం ప్రత్యేకంగా రూపొందించబడిన జాతకులు",
                    ta: "இந்தப் புனித ஜாதக நூல் பிரத்யேகமாக வழங்கப்படும் ஜாதகர்",
                    en: "Prepared & Consecrated Exclusively For",
                  },
                  lang
                )}
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#451a03", lineHeight: 1.3 }}>
                {data.devoteeName}
              </div>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#78350f", marginTop: "3px" }}>
                {data.coverPage.bookletEditionLine}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6({ kn: "ಜನ್ಮ ದಿನಾಂಕ", mr: "जन्म दिनांक", hi: "जन्म तिथि", te: "పుట్టిన తేదీ", ta: "பிறந்த தேதி", en: "Birth Date" }, lang)}
                </div>
                <div style={infoValueStyle}>{n(data.birthDate)}</div>
              </div>
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6({ kn: "ಜನ್ಮ ಸಮಯ", mr: "जन्म वेळ", hi: "जन्म समय", te: "జన్మ సమయం", ta: "பிறந்த நேரம்", en: "Birth Time" }, lang)}
                </div>
                <div style={infoValueStyle}>{n(data.birthTime)}</div>
              </div>
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6({ kn: "ಜನ್ಮ ಸ್ಥಳ", mr: "जन्म स्थळ", hi: "जन्म स्थान", te: "జన్మ స్థలం", ta: "பிறந்த இடம்", en: "Birth Place" }, lang)}
                </div>
                <div style={infoValueStyle}>{data.birthPlace}</div>
              </div>
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6({ kn: "ಜನ್ಮ ಲಗ್ನ", mr: "जन्म लग्न", hi: "जन्म लग्न", te: "జన్మ లగ్నం", ta: "ஜென்ம லக்னம்", en: "Janma Lagna" }, lang)}
                </div>
                <div style={infoValueStyle}>{data.lagnaName} ({data.lagnaLord})</div>
              </div>
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6({ kn: "ಚಂದ್ರ ರಾಶಿ", mr: "चंद्र राशी", hi: "चंद्र राशि", te: "చంద్ర రాశి", ta: "சந்திர ராசி", en: "Moon Sign" }, lang)}
                </div>
                <div style={infoValueStyle}>{data.moonRashi} ({data.moonLord})</div>
              </div>
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6({ kn: "ಜನ್ಮ ನಕ್ಷತ್ರ", mr: "जन्म नक्षत्र", hi: "जन्म नक्षत्र", te: "జన్మ నక్షత్రం", ta: "பிறந்த நட்சத்திரம்", en: "Nakshatra" }, lang)}
                </div>
                <div style={infoValueStyle}>{data.nakshatraName} ({padaWord} {n(data.nakshatraPada)})</div>
              </div>
            </div>
          </div>

          {/* EMOTIONAL PERSONAL DEDICATION & REASSURANCE MESSAGE */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1.5px solid #f59e0b",
              borderLeft: "5px solid #b45309",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "14px",
              textAlign: "left",
              letterSpacing: "normal",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "8px" }}>
              🪔{" "}
              {pick6(
                {
                  kn: "ಆತ್ಮೀಯ ಭರವಸೆಯ ನುಡಿ (ಕೇವಲ ನಿಮಗಾಗಿ ಬರೆದ ಪವಿತ್ರ ಪತ್ರ)",
                  mr: "आत्मीय आश्वासक संदेश (केवळ आपल्यासाठी लिहिलेले पत्र)",
                  hi: "आत्मीय आश्वासन संदेश (केवल आपके लिए लिखा पावन पत्र)",
                  te: "ఆత్మీయ భరోసా సందేశం (కేవలం మీ కోసం రాసిన పవిత్ర లేఖ)",
                  ta: "அன்பான நம்பிக்கை மடல் (உங்களுக்காக மட்டுமே எழுதப்பட்ட வாழ்த்து)",
                  en: "A Personal Sanctuary Note Written Solely For You",
                },
                lang
              )}
            </div>
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: "13.8px",
                lineHeight: 1.62,
                color: "#291808",
                letterSpacing: "normal",
                wordBreak: "break-word",
              }}
            >
              {data.coverPage.personalAssurancePara1}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "13.8px",
                lineHeight: 1.62,
                color: "#451a03",
                fontWeight: 600,
                letterSpacing: "normal",
                wordBreak: "break-word",
              }}
            >
              {data.coverPage.personalAssurancePara2}
            </p>
          </div>

          {/* BOTTOM COVER SEAL STRIP */}
          <div
            style={{
              borderTop: "2px solid #d97706",
              paddingTop: "10px",
              textAlign: "center",
              letterSpacing: "normal",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350f", marginBottom: "3px" }}>
              🔱 {data.coverPage.sealHeading}
            </div>
            <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#92400e" }}>
              {data.coverPage.confidentialFooterNote}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 2 (PAGE 2): COMPLETE 25-CHAPTER BOOKLET INDEX (WITH PAGES!)   */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="executive-index">
        <div
          style={{
            minHeight: "980px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#fffbeb",
            border: "2px solid #d97706",
            borderRadius: "12px",
            padding: "16px 18px",
            boxSizing: "border-box",
            letterSpacing: "normal",
          }}
        >
          {/* INDEX HEADER BANNER */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #f59e0b",
                paddingBottom: "8px",
                marginBottom: "10px",
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 2px 0", fontSize: "18px", fontWeight: 800, color: "#451a03" }}>
                  📖{" "}
                  {pick6(
                    {
                      kn: "ಸಂಪೂರ್ಣ ೨೫ ಅಧ್ಯಾಯಗಳ ಪುಸ್ತಕ ವಿಷಯ ಸೂಚಿ (ಅಧ್ಯಾಯ & ಪುಟ ಸಂಖ್ಯೆ)",
                      mr: "संपूर्ण २५ अध्यायांची अनुक्रमणिका (अध्याय व पृष्ठ क्रमांक)",
                      hi: "संपूर्ण २५ अध्यायों की पुस्तक विषय-सूची (अध्याय एवं पृष्ठ संख्या)",
                      te: "సంపూర్ణ 25 అధ్యాయాల పుస్తక విషయ సూచిక (అధ్యాయం & పుట సంఖ్య)",
                      ta: "சம்பூர்ண 25 அத்தியாய நூல் உள்ளடக்க அட்டவணை (பக்க எண் வழிகாட்டி)",
                      en: "Sampoorna 25-Chapter Booklet Directory (Chapter & Page Guide)",
                    },
                    lang
                  )}
                </h2>
                <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#92400e" }}>
                  {pick6(
                    {
                      kn: `${data.devoteeName} ರವರ ಜಾತಕ ಪುಸ್ತಕ — ನಿಮಗೆ ಬೇಕಾದ ಅಧ್ಯಾಯವನ್ನು ನೇರವಾಗಿ ಆಯಾ ಪುಟದಲ್ಲಿ ಓದಿರಿ`,
                      mr: `${data.devoteeName} यांचे ग्रंथ — इच्छित अध्याय वाचण्यासाठी खालील पृष्ठ क्रमांक पहा`,
                      hi: `${data.devoteeName} की पुस्तिका — किसी भी अध्याय को पढ़ने हेतु संबंधित पृष्ठ संख्या देखें`,
                      te: `${data.devoteeName} గారి జాతక గ్రంథం — కావలసిన అధ్యాయాన్ని ఆయా పుటలలో నేరుగా చదవండి`,
                      ta: `${data.devoteeName} அவர்களின் ஜாதக நூல் — ஒவ்வொரு அத்தியாயத்திற்கும் உரிய பக்க எண்ணை பார்க்கவும்`,
                      en: `Personal Edition for ${data.devoteeName} • Turn directly to any chapter's verified page number below`,
                    },
                    lang
                  )}
                </div>
              </div>
              <span
                style={{
                  backgroundColor: "#92400e",
                  color: "#fef3c7",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {data.dominantElement}
              </span>
            </div>

            {/* 2-COLUMN COMPLETE 25-CHAPTER TOC GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                alignItems: "start",
              }}
            >
              {/* LEFT COLUMN: VOLUMES 1 & 2 (CHAPTERS 1–11) + FRONT PROFILE ENTRY */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {/* Front Dossier Entry (Page 3) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #d97706",
                    borderRadius: "6px",
                    padding: "5px 8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#78350f",
                  }}
                >
                  <span>
                    📜{" "}
                    {pick6(
                      {
                        kn: "ಷಡಂಗ ಪಂಚಾಂಗ & ಜಾತಕದ ಮೂಲ ವಿವರ",
                        mr: "षडांग पंचांग व जन्मकुंडली तपशील",
                        hi: "षडांग पंचांग एवं जन्मकुंडली विवरण",
                        te: "షడంగ పంచాంగం & జాతక వివరాలు",
                        ta: "ஷடங்க பஞ்சாங்கம் & ஜாதக விவரம்",
                        en: "6-Anga Panchanga & Precision Kundli Dossier",
                      },
                      lang
                    )}
                  </span>
                  <span
                    data-index-page-for="user-details"
                    style={{
                      minWidth: "52px",
                      textAlign: "right",
                      fontWeight: 800,
                      color: "#92400e",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatPageTag6L(3, lang)}
                  </span>
                </div>

                {data.sectionIndexTitles.slice(0, 2).map((sec) => {
                  const secChapters = data.chapters.filter((c) => c.sectionNumber === sec.sectionNumber);
                  return (
                    <div key={sec.sectionNumber} style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "2px" }}>
                      <div
                        style={{
                          backgroundColor: "#78350f",
                          color: "#fef3c7",
                          borderRadius: "5px",
                          padding: "4px 8px",
                          fontSize: "10.8px",
                          fontWeight: 800,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ maxWidth: "82%", lineHeight: 1.3 }}>{sec.title}</span>
                        <span style={{ fontSize: "10px", opacity: 0.9, whiteSpace: "nowrap" }}>{sec.chapterRange}</span>
                      </div>
                      {secChapters.map((ch) => (
                        <div
                          key={ch.chapterNumber}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #fde68a",
                            borderRadius: "5px",
                            padding: "4px 7px",
                          }}
                        >
                          <span
                            style={{
                              minWidth: "22px",
                              height: "20px",
                              borderRadius: "4px",
                              backgroundColor: "#fef3c7",
                              color: "#92400e",
                              fontSize: "10px",
                              fontWeight: 800,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {n(ch.chapterNumber)}
                          </span>
                          <span
                            style={{
                              flex: 1,
                              fontSize: "10.5px",
                              fontWeight: 600,
                              lineHeight: 1.32,
                              color: "#451a03",
                              wordBreak: "break-word",
                            }}
                          >
                            {cleanChapterTitle(ch)}
                          </span>
                          <span
                            data-index-page-for={`chapter-${ch.chapterNumber}`}
                            style={{
                              minWidth: "52px",
                              textAlign: "right",
                              fontSize: "10px",
                              fontWeight: 800,
                              color: "#92400e",
                              backgroundColor: "#fffbeb",
                              border: "1px solid #fcd34d",
                              borderRadius: "4px",
                              padding: "1px 5px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatPageTag6L(data.initialChapterPages[ch.chapterNumber] ?? ch.chapterNumber + 3, lang)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Compact Precision Summary Box to balance Left & Right Index Columns */}
                <div
                  style={{
                    marginTop: "4px",
                    backgroundColor: "#ffffff",
                    border: "1.5px solid #f59e0b",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "11px",
                    color: "#451a03",
                    lineHeight: 1.48,
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                    🧭{" "}
                    {pick6(
                      {
                        kn: "ಇಂದಿನ ಲೈವ್ ಜ್ಯೋತಿಷ್ಯ ಸಂಕೇತಗಳು",
                        mr: "आजचे थेट ज्योतिष संकेत",
                        hi: "आज के प्रत्यक्ष ज्योतिषीय संकेत",
                        te: "నేటి ప్రత్యక్ష జ్యోతిష సంకేతాలు",
                        ta: "இன்றைய நேரடி ஜோதிட குறியீடுகள்",
                        en: "Live Celestial Anchor Matrix",
                      },
                      lang
                    )}
                  </div>
                  <div>✨ <strong>{data.yogiPlanet}</strong> • ⚠️ <strong>{data.avayogiPlanet}</strong></div>
                  <div>🌟 {data.precisionProfile.liveTarabalaHeadline}</div>
                  <div>🪐 {data.currentMahadasha} – {data.currentBhukti}</div>
                </div>
              </div>

              {/* RIGHT COLUMN: VOLUMES 3, 4 & 5 (CHAPTERS 12–25) + CALENDAR QR & SANCTUARY */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {data.sectionIndexTitles.slice(2).map((sec) => {
                  const secChapters = data.chapters.filter((c) => c.sectionNumber === sec.sectionNumber);
                  return (
                    <div key={sec.sectionNumber} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div
                        style={{
                          backgroundColor: "#78350f",
                          color: "#fef3c7",
                          borderRadius: "5px",
                          padding: "4px 8px",
                          fontSize: "10.8px",
                          fontWeight: 800,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ maxWidth: "82%", lineHeight: 1.3 }}>{sec.title}</span>
                        <span style={{ fontSize: "10px", opacity: 0.9, whiteSpace: "nowrap" }}>{sec.chapterRange}</span>
                      </div>
                      {secChapters.map((ch) => (
                        <div
                          key={ch.chapterNumber}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #fde68a",
                            borderRadius: "5px",
                            padding: "4px 7px",
                          }}
                        >
                          <span
                            style={{
                              minWidth: "22px",
                              height: "20px",
                              borderRadius: "4px",
                              backgroundColor: "#fef3c7",
                              color: "#92400e",
                              fontSize: "10px",
                              fontWeight: 800,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {n(ch.chapterNumber)}
                          </span>
                          <span
                            style={{
                              flex: 1,
                              fontSize: "10.5px",
                              fontWeight: 600,
                              lineHeight: 1.32,
                              color: "#451a03",
                              wordBreak: "break-word",
                            }}
                          >
                            {cleanChapterTitle(ch)}
                          </span>
                          <span
                            data-index-page-for={`chapter-${ch.chapterNumber}`}
                            style={{
                              minWidth: "52px",
                              textAlign: "right",
                              fontSize: "10px",
                              fontWeight: 800,
                              color: "#92400e",
                              backgroundColor: "#fffbeb",
                              border: "1px solid #fcd34d",
                              borderRadius: "4px",
                              padding: "1px 5px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatPageTag6L(data.initialChapterPages[ch.chapterNumber] ?? ch.chapterNumber + 3, lang)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Bonus Calendar QR & Priest Sanctuary Rows */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #d97706",
                    borderRadius: "5px",
                    padding: "4px 8px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "#78350f",
                  }}
                >
                  <span>
                    📅{" "}
                    {pick6(
                      {
                        kn: "೧೫ ದಿನಗಳ ವೈಯಕ್ತಿಕ ಕ್ಯಾಲೆಂಡರ್ QR",
                        mr: "१५ दिवसांचे वैयक्तिक कॅलेंडर QR",
                        hi: "१५-दिवसीय व्यक्तिगत कैलेंडर QR",
                        te: "15 రోజుల వ్యక్తిగత క్యాలెండర్ QR",
                        ta: "15 நாட்கள் தனிப்பயன் காலண்டர் QR",
                        en: "15-Day Personalized Calendar QR Bonus",
                      },
                      lang
                    )}
                  </span>
                  <span
                    data-index-page-for="fifteen-day-calendar-qr"
                    style={{ minWidth: "52px", textAlign: "right", fontWeight: 800, color: "#92400e", whiteSpace: "nowrap" }}
                  >
                    {formatPageTag6L(data.initialCalendarQrPage, lang)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #d97706",
                    borderRadius: "5px",
                    padding: "4px 8px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "#78350f",
                  }}
                >
                  <span>
                    🕉️{" "}
                    {pick6(
                      {
                        kn: "ಕುಟುಂಬ ರಕ್ಷಣೆ & ಮುಖ್ಯ ಅರ್ಚಕರ ಸಂಪರ್ಕ",
                        mr: "कौटुंबिक सुरक्षा व मुख्य पुरोहित संपर्क",
                        hi: "पारिवारिक सुरक्षा एवं मुख्य अर्चक संपर्क",
                        te: "కుటుంబ రక్షణ & ముఖ్య అర్చకుల సంప్రదింపు",
                        ta: "குடும்ப பாதுகாப்பு & தலைமை அர்ச்சகர் தொடர்பு",
                        en: "Family Sanctuary & Gokarna Chief Priest",
                      },
                      lang
                    )}
                  </span>
                  <span
                    data-index-page-for="family-referral-and-priest"
                    style={{ minWidth: "52px", textAlign: "right", fontWeight: 800, color: "#92400e", whiteSpace: "nowrap" }}
                  >
                    {formatPageTag6L(data.initialFinalBlessingPage, lang)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM TRANSIT STATUS BAR INSIDE INDEX PAGE */}
          <div
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              backgroundColor: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "6px",
              fontSize: "11.5px",
              fontWeight: 700,
              color: "#78350f",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              {pick6(
                {
                  kn: `ಶನಿ ಗೋಚಾರ: ${data.shaniTransitRashi} (ಚಂದ್ರನಿಂದ ${n(data.shaniHouseFromMoon)})`,
                  mr: `शनी गोचर: ${data.shaniTransitRashi} (चंद्रापासून ${n(data.shaniHouseFromMoon)})`,
                  hi: `शनि गोचर: ${data.shaniTransitRashi} (चंद्र से ${n(data.shaniHouseFromMoon)})`,
                  te: `శని గోచారం: ${data.shaniTransitRashi} (చంద్రుని నుండి ${n(data.shaniHouseFromMoon)})`,
                  ta: `சனி கோசாரம்: ${data.shaniTransitRashi} (ராசியிலிருந்து ${n(data.shaniHouseFromMoon)})`,
                  en: `Saturn Gochara: ${data.shaniTransitRashi} (H${data.shaniHouseFromMoon} from Moon)`,
                },
                lang
              )}
            </span>
            <span>
              {pick6(
                {
                  kn: `ಗುರು ಗೋಚಾರ: ${data.guruTransitRashi} (ಚಂದ್ರನಿಂದ ${n(data.guruHouseFromMoon)})`,
                  mr: `गुरु गोचर: ${data.guruTransitRashi} (चंद्रापासून ${n(data.guruHouseFromMoon)})`,
                  hi: `गुरु गोचर: ${data.guruTransitRashi} (चंद्र से ${n(data.guruHouseFromMoon)})`,
                  te: `గురు గోచారం: ${data.guruTransitRashi} (చంద్రుని నుండి ${n(data.guruHouseFromMoon)})`,
                  ta: `குரு கோசாரம்: ${data.guruTransitRashi} (ராசியிலிருந்து ${n(data.guruHouseFromMoon)})`,
                  en: `Jupiter Gochara: ${data.guruTransitRashi} (H${data.guruHouseFromMoon} from Moon)`,
                },
                lang
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 3 (PAGE 3): 6-ANGA BIRTH PANCHANGA & PRECISION KUNDLI DOSSIER */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="user-details">
        <div
          style={{
            minHeight: "940px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
            border: "2px solid #d97706",
            borderRadius: "12px",
            padding: "18px 20px",
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
                paddingBottom: "10px",
                marginBottom: "12px",
                borderBottom: "2px solid #fcd34d",
              }}
            >
              <span style={{ fontSize: "17px", fontWeight: 800, color: "#78350f" }}>
                📜{" "}
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
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                {data.ayanamsha}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 14px",
              }}
            >
              {/* Row 1 */}
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ಜಾತಕರ ಹೆಸರು", mr: "जातकाचे नाव", hi: "जातक का नाम", te: "జాతకుని పేరు", ta: "ஜாதகர் பெயர்", en: "Devotee Name" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>{data.devoteeName}</div>
              </div>

              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ಜನ್ಮ ದಿನಾಂಕ, ಸಮಯ & ವಯಸ್ಸು", mr: "जन्म दिनांक, वेळ व वय", hi: "जन्म तिथि, समय एवं आयु", te: "పుట్టిన తేదీ, సమయం & వయస్సు", ta: "பிறந்த தேதி, நேரம் & வயது", en: "Birth Date, Time & Age" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>
                  {n(data.birthDate)} • {n(data.birthTime)} ({ageWord}: {n(Math.round(data.ageYears))} {yearsWord})
                </div>
              </div>

              {/* Row 2 */}
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ಜನ್ಮ ಸ್ಥಳ", mr: "जन्म स्थळ", hi: "जन्म स्थान", te: "జన్మ స్థలం", ta: "பிறந்த இடம்", en: "Birth Place" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>{data.birthPlace}</div>
              </div>

              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ಜನ್ಮ ಲಗ್ನ & ಲಗ್ನಾಧಿಪತಿ", mr: "जन्म लग्न व स्वामी", hi: "जन्म लग्न एवं स्वामी", te: "జన్మ లగ్నం & అధిపతి", ta: "ஜென்ம லக்னம் & அதிபதி", en: "Janma Lagna & Lord" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>
                  {data.lagnaName} ({data.lagnaLord})
                </div>
              </div>

              {/* Row 3 */}
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ಚಂದ್ರ ರಾಶಿ & ರಾಶ್ಯಾಧಿಪತಿ", mr: "चंद्र राशी व स्वामी", hi: "चंद्र राशि एवं स्वामी", te: "చంద్ర రాశి & అధిపతి", ta: "சந்திர ராசி & அதிபதி", en: "Moon Sign & Lord" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>
                  {data.moonRashi} ({data.moonLord})
                </div>
              </div>

              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ಜನ್ಮ ನಕ್ಷತ್ರ & ಪಾದ", mr: "जन्म नक्षत्र व चरण", hi: "जन्म नक्षत्र एवं पाद", te: "జన్మ నక్షత్రం & పాదం", ta: "ஜென்ம நட்சத்திரம் & பாதம்", en: "Birth Nakshatra & Pada" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>
                  {data.nakshatraName} ({padaWord} {n(data.nakshatraPada)})
                </div>
              </div>

              {/* Row 4 — Tithi / Paksha / Vaara + Yoga / Karana */}
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ತಿಥಿ (ಪಕ್ಷ) & ಜನ್ಮ ವಾರ", mr: "तिथी (पक्ष) व वार", hi: "तिथि (पक्ष) एवं वार", te: "తిథి (పక్షం) & వారం", ta: "திதி (பக்ஷம்) & கிழமை", en: "Tithi (Paksha) & Weekday" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>
                  {data.pakshaName} {data.tithiName} • {data.weekdayName}
                </div>
              </div>

              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ನಿತ್ಯ ಯೋಗ & ಕರಣ", mr: "नित्य योग व करण", hi: "नित्य योग एवं करण", te: "నిత్య యోగం & కరణం", ta: "நித்ய யோகம் & கரணம்", en: "Nitya Yoga & Karana" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>
                  {data.yogaName} • {data.karanaName}
                </div>
              </div>

              {/* Row 5 — Sunrise/Sunset & True Birth Hora + Dasha-Bhukti */}
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ಸೂರ್ಯೋದಯ / ಸೂರ್ಯಾಸ್ತ & ಜನ್ಮ ಹೋರಾ", mr: "सूर्योदय / सूर्यास्त व जन्म होरा", hi: "सूर्योदय / सूर्यास्त एवं जन्म होरा", te: "సూర్యోదయం / సూర్యాస్తమయం & హోర", ta: "சூரிய உதயம் / அஸ்தமனம் & ஹோரை", en: "Sunrise / Sunset & Birth Hora" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>
                  {n(data.sunriseTime)} / {n(data.sunsetTime)} • {data.janmaHora}
                </div>
              </div>

              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ – ಅಂತರ್ದಶೆ", mr: "चालू महादशा – अंतर्दशा", hi: "वर्तमान महादशा – अंतर्दशा", te: "ప్రస్తుత మహర్దశ – అంతర్దశ", ta: "நடப்பு மகாதசை – அந்தர்தசை", en: "Active Mahadasha – Bhukti" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>
                  {data.currentMahadasha} – {data.currentBhukti} ({n(data.bhuktiEndDate)})
                </div>
              </div>

              {/* Row 6 — Yogi Magnet & Avayogi / Maandi */}
              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    {
                      kn: "ಧನ ಪ್ರದಾತ ಯೋಗಿ ಗ್ರಹ",
                      mr: "धनप्रद योगी ग्रह",
                      hi: "धन प्रदाता योगी ग्रह",
                      te: "ధన ప్రదాత యోగి గ్రహం",
                      ta: "செல்வ யோகி கிரகம்",
                      en: "Wealth Yogi Planet",
                    },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>
                  ✨ {data.yogiPlanet} ({data.yogiRashi})
                </div>
              </div>

              <div style={infoCellStyle}>
                <div style={infoLabelStyle}>
                  {pick6(
                    { kn: "ಅವಯೋಗಿ & ಮಾಂದಿ ಸ್ಥಾನ", mr: "अवयोगी व मांदी स्थान", hi: "अवयोगी एवं मांदी स्थिति", te: "అవయోగి & మాంది స్థానం", ta: "அவயோகி & மாந்தி நிலை", en: "Avayogi & Maandi Knot" },
                    lang
                  )}
                </div>
                <div style={infoValueStyle}>
                  ⚠️ {data.avayogiPlanet} ({data.avayogiRashi}) • {houseWord} {n(data.maandiHouse)} ({data.maandiRashi})
                </div>
              </div>
            </div>

            {/* EXTENDED PARASHARI & SOUTH INDIAN PRECISION GATES SUMMARY */}
            <div
              style={{
                marginTop: "12px",
                paddingTop: "10px",
                borderTop: "1.5px solid #fde68a",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", marginBottom: "8px" }}>
                🔭{" "}
                {pick6(
                  {
                    kn: "ವಿಶೇಷ ಜ್ಯೋತಿಷ್ಯ ನಿಖರತಾ ನಿಯಮಗಳ ಸಾರಾಂಶ (ಪರಾಶರ-ತಾಜಿಕ ತಪಾಸಣೆ)",
                    mr: "विशेष अचूकता तक्ता व ग्रहबल परीक्षण",
                    hi: "विशिष्ट पाराशरी-ताजिक सटीकता परीक्षण विवरण",
                    te: "ప్రత్యేక జ్యోతిష ఖచ్చితత్వ నియమాల సారాంశం",
                    ta: "சிறப்பு பராசர துல்லிய கணித சாராம்சம்",
                    en: "Extended Parashari & Tajika Precision Diagnostics",
                  },
                  lang
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px" }}>
                <div style={infoCellStyle}>
                  <div style={infoLabelStyle}>
                    {pick6({ kn: "ಇಂದಿನ ತಾರಾಬಲ & ಬಲ", mr: "आजचे ताराबल", hi: "आज का ताराबल", te: "నేటి తారాబలం", ta: "இன்றைய தாராபலம்", en: "Today's Live Tarabala" }, lang)}
                  </div>
                  <div style={infoValueStyle}>
                    🌟 {data.precisionProfile.liveTarabalaHeadline}
                    {data.precisionProfile.chandrashtamaWarning ? ` • ${data.precisionProfile.chandrashtamaWarning}` : ""}
                  </div>
                </div>

                <div style={infoCellStyle}>
                  <div style={infoLabelStyle}>
                    {pick6({ kn: "ದಶಾ ನಾಥರ ಲಗ್ನ ಮೈತ್ರಿ", mr: "महादशा लग्न मैत्री", hi: "दशा स्वामी लग्न मैत्री", te: "దశానాథుని లగ్న మైత్రి", ta: "தசாநாதர் லக்ன நட்பு", en: "Dasha Lord Functional Nature" }, lang)}
                  </div>
                  <div style={infoValueStyle}>{data.currentMahadasha}: {data.precisionProfile.mahaFunctionalStatus}</div>
                </div>

                <div style={infoCellStyle}>
                  <div style={infoLabelStyle}>
                    {pick6({ kn: "ಸರ್ವಾಷ್ಟಕವರ್ಗ ಭಾವ ಬಲ", mr: "सर्वाष्टकवर्ग स्थान बळ", hi: "सर्वाष्टकवर्ग भाव बल", te: "సర్వాష్టకవర్గ భావ బలం", ta: "சர்வாஷ்டகவர்க்க பாவ பலம்", en: "Domain Sarvashtakavarga Strength" }, lang)}
                  </div>
                  <div style={infoValueStyle}>{data.precisionProfile.savSummaryText}</div>
                </div>

                <div style={infoCellStyle}>
                  <div style={infoLabelStyle}>
                    {pick6({ kn: "ಬಾಧಕ ಸ್ಥಾನ & ಬೃಗು ಬಿಂದು", mr: "बाधक स्थान व भृगु बिंदू", hi: "बाधक स्थान एवं भृगु बिंदु", te: "బాధక స్థానం & భృగు బిందువు", ta: "பாதக ஸ்தானம் & பிருகு பிந்து", en: "Badhaka Sthana & Bhrigu Bindu" }, lang)}
                  </div>
                  <div style={infoValueStyle}>
                    {data.precisionProfile.badhakaSummary} • {data.bhriguBinduRashi} ({n(data.bhriguBinduDegreeFormatted)})
                  </div>
                </div>

                <div style={infoCellStyle}>
                  <div style={infoLabelStyle}>
                    {pick6({ kn: "ಗ್ರಹ ಸ್ಥಾನ ಬಲ & ರಾಜಯೋಗ", mr: "उच्च-स्वगृही ग्रह व राजयोग", hi: "ग्रह प्रतिष्ठा एवं राजयोग", te: "గ్రహ బలం & రాజయోగాలు", ta: "கிரக வலிமை & ராஜயோகம்", en: "Planetary Dignity & Yogas" }, lang)}
                  </div>
                  <div style={infoValueStyle}>{data.precisionProfile.dignifiedSummary}</div>
                </div>

                <div style={infoCellStyle}>
                  <div style={infoLabelStyle}>
                    {pick6({ kn: "ವಕ್ರ / ಅಸ್ತ / ಗಂಡಾಂತ ತಪಾಸಣೆ", mr: "वक्री / अस्त / गंडांत तपासणी", hi: "वक्री / अस्त / गंडांत परीक्षण", te: "వక్ర / అస్తంగత / గండాంత", ta: "வக்ர / அஸ்தம் / கண்டாந்தம்", en: "Retrograde, Combustion & Cusps" }, lang)}
                  </div>
                  <div style={infoValueStyle}>
                    {data.precisionProfile.retroCombustSummary}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "10px",
              padding: "10px 14px",
              backgroundColor: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#78350f",
              lineHeight: 1.5,
            }}
          >
            <div>👑 {data.detectedYogasSummary}</div>
            <div>🪔 {data.detectedDoshasSummary} • 🕰️ {n(data.janmaDashaBalance)}</div>
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
                  backgroundColor: "#ffffff",
                  border: "2px solid #d97706",
                  borderRadius: "12px",
                  padding: "18px 22px",
                  letterSpacing: "normal",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "8px",
                    marginBottom: "12px",
                    borderBottom: "1.5px solid #fde68a",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#92400e",
                  }}
                >
                  <span>📅 {data.calendarQrSection.badge}</span>
                  <span>
                    {data.calendarQrSection.priestName} ({data.calendarQrSection.priestPhoneDisplay})
                  </span>
                </div>

                <h2
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "21px",
                    fontWeight: 800,
                    lineHeight: 1.4,
                    color: "#451a03",
                    textAlign: "center",
                  }}
                >
                  {data.calendarQrSection.title}
                </h2>
                <p
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "14px",
                    lineHeight: 1.55,
                    color: "#78350f",
                    textAlign: "center",
                  }}
                >
                  {data.calendarQrSection.description}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "230px 1fr",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#fffbeb",
                      border: "1.5px solid #f59e0b",
                      borderRadius: "10px",
                      padding: "14px",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={data.calendarQrSection.qrDataUrl}
                      alt="15-Day Daily Darshana Google Calendar QR"
                      className="w-48 h-48 mx-auto rounded-lg border-2 border-amber-400 p-1 bg-white"
                      style={{ display: "block", width: "180px", height: "180px", margin: "0 auto" }}
                    />
                    <p
                      style={{
                        margin: "10px 0 4px 0",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "#78350f",
                      }}
                    >
                      📷 {data.calendarQrSection.scanInstructions}
                    </p>
                    <p style={{ margin: 0, fontSize: "11.5px", fontWeight: 700, color: "#92400e" }}>
                      {data.calendarQrSection.priestName} • {data.calendarQrSection.priestPhoneDisplay}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                      {data.calendarQrSection.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          style={{
                            backgroundColor: "#fffbeb",
                            borderLeft: "4px solid #d97706",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            fontSize: "13.5px",
                            lineHeight: 1.45,
                            fontWeight: 600,
                            color: "#451a03",
                          }}
                        >
                          ✦ {feat}
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        backgroundColor: "#fef3c7",
                        border: "1.5px solid #b45309",
                        borderRadius: "8px",
                        padding: "10px 14px",
                      }}
                    >
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350f", marginBottom: "3px" }}>
                        {data.calendarQrSection.upsellNoticeTitle}
                      </div>
                      <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.5, color: "#451a03" }}>
                        "{data.calendarQrSection.upsellNoticeText}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className={sectionClass}
            data-section={`chapter-${chapter.chapterNumber}`}
            style={{
              minHeight: "930px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <div>
              {/* Clean Localized Section Header Pill */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: "4px solid #b45309",
                  paddingLeft: "10px",
                  marginBottom: "8px",
                  letterSpacing: "normal",
                }}
              >
                <span
                  style={{
                    maxWidth: "68%",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#92400e",
                    lineHeight: 1.35,
                  }}
                >
                  {chapter.sectionTitle}
                </span>
                <span
                  style={{
                    maxWidth: "30%",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "#b45309",
                    textAlign: "right",
                  }}
                >
                  {folioCornerLabel}
                </span>
              </div>

              {renderChapterBanner(chapter)}

              {chapter.precisionAnchors && chapter.precisionAnchors.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginBottom: "10px",
                    letterSpacing: "normal",
                  }}
                >
                  {chapter.precisionAnchors.map((anchor, aIdx) => (
                    <span
                      key={aIdx}
                      style={{
                        backgroundColor: "#fef3c7",
                        border: "1px solid #f59e0b",
                        borderRadius: "6px",
                        padding: "3px 9px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#78350f",
                        letterSpacing: "normal",
                      }}
                    >
                      ✦ {anchor}
                    </span>
                  ))}
                </div>
              )}

              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #fcd34d",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  letterSpacing: "normal",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    borderLeft: "4px solid #d97706",
                    padding: "9px 14px",
                    borderRadius: "6px",
                    marginBottom: "11px",
                    fontSize: "15px",
                    fontWeight: 700,
                    lineHeight: 1.48,
                    color: "#78350f",
                    wordBreak: "break-word",
                  }}
                >
                  {chapter.question}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {chapter.paragraphs.map((para, pIdx) => (
                    <p
                      key={pIdx}
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        lineHeight: 1.56,
                        color: "#291808",
                        letterSpacing: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {renderContemplationRibbon(chapter.guidanceBadge, chapter.practicalGuidance)}
          </div>
        </React.Fragment>
      ))}

      {/* ==================================================================== */}
      {/* FINAL CULMINATION: FAMILY PROTECTION HOOK & CHAITANYA PANDIT CONTACT  */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="family-referral-and-priest">
        <div
          style={{
            background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            border: "2px solid #b45309",
            borderRadius: "12px",
            padding: "16px 22px",
            marginBottom: "14px",
            textAlign: "center",
            letterSpacing: "normal",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 700,
              lineHeight: 1.6,
              color: "#451a03",
              wordBreak: "break-word",
            }}
          >
            "{data.familyProtectionHook}"
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "2px solid #d97706",
            borderRadius: "12px",
            padding: "18px 22px",
            marginBottom: "12px",
            letterSpacing: "normal",
          }}
        >
          <h3
            style={{
              margin: "0 0 4px 0",
              fontSize: "17px",
              fontWeight: 800,
              color: "#78350f",
            }}
          >
            🕉️ {data.priestBooking.heading}
          </h3>
          <p style={{ margin: "0 0 12px 0", fontSize: "13.5px", color: "#92400e", fontWeight: 600 }}>
            {data.priestBooking.subheading}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              backgroundColor: "#fffbeb",
              border: "1.5px solid #f59e0b",
              borderRadius: "10px",
              padding: "14px 18px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#b45309", marginBottom: "2px" }}>
                {data.priestBooking.priestTitle}
              </div>
              <div style={{ fontSize: "19px", fontWeight: 800, color: "#451a03", marginBottom: "4px" }}>
                {data.priestBooking.priestName}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#78350f" }}>
                📍 {data.priestBooking.address}
              </div>
            </div>

            <a
              href={`tel:${data.priestBooking.phone}`}
              style={{
                backgroundColor: "#92400e",
                color: "#fef3c7",
                padding: "10px 18px",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: 800,
                textDecoration: "none",
                whiteSpace: "nowrap",
                border: "1.5px solid #d97706",
              }}
            >
              📞 <span>{data.priestBooking.phoneDisplay}</span>
            </a>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "8px 16px",
            fontSize: "12.5px",
            fontWeight: 700,
            color: "#78350f",
            letterSpacing: "normal",
          }}
        >
          {data.footerText}
        </div>
      </div>
    </div>
  );
});

SampoornaMaster25PdfTemplate.displayName = "SampoornaMaster25PdfTemplate";
