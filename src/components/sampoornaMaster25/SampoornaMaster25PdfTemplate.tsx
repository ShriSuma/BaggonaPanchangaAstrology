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
  const sectionClass = "pdf-section px-5 py-2 relative";

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
          borderBottom: "1.5px solid #d97706",
          paddingBottom: "8px",
          marginBottom: "14px",
          letterSpacing: "normal",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#92400e",
            marginBottom: "4px",
            letterSpacing: "normal",
          }}
        >
          {chWord}
        </div>
        <h2
          style={{
            fontSize: "24px",
            lineHeight: 1.36,
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

  const renderContemplationRibbon = (_badge?: string, guidance?: string) => {
    if (!guidance) return null;
    return (
      <div
        style={{
          marginTop: "18px",
          paddingTop: "12px",
          borderTop: "1px solid #d97706",
          letterSpacing: "normal",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "17px",
            lineHeight: 1.58,
            fontWeight: 600,
            color: "#78350f",
            letterSpacing: "normal",
            wordBreak: "break-word",
          }}
        >
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
  const padaWord = pick6(
    { kn: "ಪಾದ", mr: "चरण", hi: "पाद", te: "పాదం", ta: "பாதம்", en: "Pada" },
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
            width: "100%",
            padding: "5px 10px",
            boxSizing: "border-box",
            fontSize: "12.5px",
            fontWeight: 700,
            letterSpacing: "normal",
          }}
        >
          <span>{runningHeaderFolio}</span>
          <span>
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
      {/* SECTION 1 (PAGE 1): CLEAN ROYAL BOOKLET COVER & INTRODUCTION PAGE    */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="cover">
        <div
          style={{
            padding: "20px 24px",
            boxSizing: "border-box",
            letterSpacing: "normal",
          }}
        >
          {/* TOP BRAND HEADER: BAGGONA PANCHANGA */}
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "15.5px",
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
                borderBottom: "3px solid #b45309",
                paddingBottom: "6px",
                marginBottom: "8px",
                fontSize: "31px",
                fontWeight: 800,
                color: "#78350f",
                letterSpacing: "normal",
              }}
            >
              {data.coverPage.brandBannerTitle}
            </div>

            <p
              style={{
                margin: "0 0 14px 0",
                fontSize: "15.5px",
                fontWeight: 700,
                color: "#78350f",
                letterSpacing: "normal",
              }}
            >
              {data.coverPage.kshetraSubtitle}
            </p>

            <h1
              style={{
                margin: "0 0 8px 0",
                fontSize: "33px",
                fontWeight: 800,
                lineHeight: 1.35,
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
                margin: 0,
                fontSize: "16px",
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
          </div>

          {/* PERSONALIZED DEVOTEE DETAILS */}
          <div
            style={{
              backgroundColor: "#fffdf8",
              border: "1px solid #efd5a3",
              borderRadius: "8px",
              padding: "18px 20px",
              marginTop: "20px",
              marginBottom: "20px",
              letterSpacing: "normal",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #efd5a3" }}>
              <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#92400e", marginBottom: "4px" }}>
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
              <div style={{ fontSize: "30px", fontWeight: 800, color: "#451a03", lineHeight: 1.3 }}>
                {data.devoteeName}
              </div>
              <div style={{ fontSize: "15.5px", fontWeight: 600, color: "#78350f", marginTop: "4px" }}>
                {data.coverPage.bookletEditionLine}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px" }}>
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

          {/* PERSONAL EMOTIONAL INTRODUCTION MESSAGE */}
          <div
            style={{
              borderLeft: "3px solid #d97706",
              padding: "6px 18px",
              marginBottom: "24px",
              textAlign: "left",
              letterSpacing: "normal",
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#92400e", marginBottom: "10px" }}>
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
                margin: "0 0 12px 0",
                fontSize: "19.5px",
                lineHeight: 1.66,
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
                fontSize: "19.5px",
                lineHeight: 1.66,
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
              borderTop: "1.5px solid #d97706",
              paddingTop: "14px",
              textAlign: "center",
              letterSpacing: "normal",
            }}
          >
            <div style={{ fontSize: "15.5px", fontWeight: 800, color: "#78350f", marginBottom: "4px" }}>
              {data.coverPage.sealHeading}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#92400e" }}>
              {data.coverPage.confidentialFooterNote}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 2 (PAGE 2): CLEAN CLICKABLE SINGLE-COLUMN TABLE OF CONTENTS  */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="executive-index">
        <div
          style={{
            padding: "12px 20px",
            boxSizing: "border-box",
            letterSpacing: "normal",
          }}
        >
          <div
            style={{
              borderBottom: "1.5px solid #d97706",
              paddingBottom: "8px",
              marginBottom: "10px",
            }}
          >
            <h2 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: 800, color: "#451a03" }}>
              {pick6(
                {
                  kn: "ಪುಸ್ತಕ ವಿಷಯ ಸೂಚಿ (ಅಧ್ಯಾಯ & ಪುಟ ಸಂಖ್ಯೆ)",
                  mr: "पुस्तक अनुक्रमणिका (अध्याय व पृष्ठ क्रमांक)",
                  hi: "पुस्तक विषय-सूची (अध्याय एवं पृष्ठ संख्या)",
                  te: "పుస్తక విషయ సూచిక (అధ్యాయం & పుట సంఖ్య)",
                  ta: "நூல் உள்ளடக்க அட்டவணை (அத்தியாயம் & பக்க எண்)",
                  en: "Booklet Table of Contents (Chapter & Page Guide)",
                },
                lang
              )}
            </h2>
            <div style={{ fontSize: "15.5px", fontWeight: 600, color: "#92400e" }}>
              {pick6(
                {
                  kn: `${data.devoteeName} ರವರ ಜಾತಕ ಗ್ರಂಥ — ಅಧ್ಯಾಯದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ನೇರವಾಗಿ ಆ ಪುಟಕ್ಕೆ ತೆರಳಿ`,
                  mr: `${data.devoteeName} यांचे ग्रंथ — थेट संबंधित पृष्ठावर जाण्यासाठी अध्यायावर क्लिक करा`,
                  hi: `${data.devoteeName} की पुस्तिका — सीधे संबंधित पृष्ठ पर जाने हेतु किसी भी अध्याय पर क्लिक करें`,
                  te: `${data.devoteeName} గారి జాతక గ్రంథం — నేరుగా ఆ పుటకు వెళ్ళడానికి అధ్యాయంపై క్లిక్ చేయండి`,
                  ta: `${data.devoteeName} அவர்களின் ஜாதக நூல் — அந்தப் பக்கத்திற்கு நேராகச் செல்ல அத்தியாயத்தை கிளிக் செய்யவும்`,
                  en: `Personal Edition for ${data.devoteeName} • Click any entry below to jump directly to that page`,
                },
                lang
              )}
            </div>
          </div>

          {/* COLUMN HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 6px",
              borderBottom: "1.5px solid #b45309",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: 800,
              color: "#78350f",
            }}
          >
            <span>
              {pick6(
                { kn: "ವಿಷಯ / ಅಧ್ಯಾಯ", mr: "विषय / अध्याय", hi: "विषय / अध्याय", te: "విషయం / అధ్యాయం", ta: "தலைப்பு / அத்தியாயம்", en: "Section / Chapter" },
                lang
              )}
            </span>
            <span>
              {pick6(
                { kn: "ಪುಟ ಸಂಖ್ಯೆ", mr: "पृष्ठ क्र.", hi: "पृष्ठ संख्या", te: "పుట సంఖ్య", ta: "பக்க எண்", en: "Page" },
                lang
              )}
            </span>
          </div>

          {/* CLEAN CLICKABLE SINGLE-COLUMN BOOK INDEX */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {/* Cover (Page 1) */}
            <div
              data-index-link-target="cover"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "4px 6px",
                borderBottom: "1px dashed #e7cfa0",
                fontSize: "15px",
                fontWeight: 700,
                color: "#78350f",
              }}
            >
              <span style={{ lineHeight: 1.32 }}>
                {pick6(
                  {
                    kn: "ಮುಖಪುಟ — ಜಾತಕರ ವಿವರ & ಆತ್ಮೀಯ ಭರವಸೆಯ ನುಡಿ",
                    mr: "मुखपृष्ठ — जातक तपशील व आश्वासक संदेश",
                    hi: "मुखपृष्ठ — जातक विवरण एवं आत्मीय संदेश",
                    te: "ముఖచిత్రం — జాతక వివరాలు & ఆత్మీయ సందేశం",
                    ta: "முகப்பு பக்கம் — ஜாதகர் விவரம் & நம்பிக்கை மடல்",
                    en: "Cover Page — Personal Dedication & Sanctuary Note",
                  },
                  lang
                )}
              </span>
              <span
                data-index-page-for="cover"
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#92400e",
                  whiteSpace: "nowrap",
                  marginLeft: "14px",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                {formatPageTag6L(1, lang)}
              </span>
            </div>

            {/* Index (Page 2) */}
            <div
              data-index-link-target="executive-index"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "4px 6px",
                borderBottom: "1px dashed #e7cfa0",
                fontSize: "15px",
                fontWeight: 700,
                color: "#78350f",
              }}
            >
              <span style={{ lineHeight: 1.32 }}>
                {pick6(
                  {
                    kn: "ವಿಷಯ ಸೂಚಿ — ಸಂಪೂರ್ಣ ಅಧ್ಯಾಯಗಳ ಪುಟ ಮಾರ್ಗದರ್ಶಿ",
                    mr: "अनुक्रमणिका — संपूर्ण अध्याय पृष्ठ मार्गदर्शक",
                    hi: "विषय-सूची — संपूर्ण अध्याय पृष्ठ मार्गदर्शिका",
                    te: "విషయ సూచిక — అధ్యాయాల పుటల మార్గదర్శి",
                    ta: "உள்ளடக்கம் — அத்தியாய பக்க வழிகாட்டி",
                    en: "Table of Contents — Complete Chapter & Page Directory",
                  },
                  lang
                )}
              </span>
              <span
                data-index-page-for="executive-index"
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#92400e",
                  whiteSpace: "nowrap",
                  marginLeft: "14px",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                {formatPageTag6L(2, lang)}
              </span>
            </div>

            {/* Front Dossier Entry (Page 3) */}
            <div
              data-index-link-target="user-details"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "4px 6px",
                borderBottom: "1px dashed #d97706",
                fontSize: "15px",
                fontWeight: 700,
                color: "#78350f",
              }}
            >
              <span style={{ lineHeight: 1.32 }}>
                {pick6(
                  {
                    kn: "ಪೂರ್ವಭಾವಿ — ಷಡಂಗ ಪಂಚಾಂಗ & ಜಾತಕದ ಮೂಲ ವಿವರ",
                    mr: "पूर्वपीठिका — षडांग पंचांग व जन्मकुंडली तपशील",
                    hi: "प्रारंभिका — षडांग पंचांग एवं जन्मकुंडली विवरण",
                    te: "ప్రారంభం — షడంగ పంచాంగం & జాతక వివరాలు",
                    ta: "முன்னுரை — ஷடங்க பஞ்சாங்கம் & ஜாதக விவரம்",
                    en: "Preliminaries — 6-Anga Birth Panchanga & Kundli Profile",
                  },
                  lang
                )}
              </span>
              <span
                data-index-page-for="user-details"
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#92400e",
                  whiteSpace: "nowrap",
                  marginLeft: "14px",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                {formatPageTag6L(3, lang)}
              </span>
            </div>

            {data.chapters.map((ch) => (
              <div
                key={ch.chapterNumber}
                data-index-link-target={`chapter-${ch.chapterNumber}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "3.5px 6px",
                  borderBottom: "1px dashed #e7cfa0",
                  fontSize: "14.5px",
                  lineHeight: 1.3,
                }}
              >
                <span style={{ color: "#451a03", fontWeight: 600, wordBreak: "break-word" }}>
                  <strong style={{ color: "#92400e", marginRight: "8px" }}>{n(ch.chapterNumber)}.</strong>
                  {cleanChapterTitle(ch)}
                </span>
                <span
                  data-index-page-for={`chapter-${ch.chapterNumber}`}
                  style={{
                    fontSize: "14.5px",
                    fontWeight: 800,
                    color: "#92400e",
                    whiteSpace: "nowrap",
                    marginLeft: "14px",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  {formatPageTag6L(data.initialChapterPages[ch.chapterNumber] ?? ch.chapterNumber + 3, lang)}
                </span>
              </div>
            ))}

            {/* 15-Day Personalized Calendar Row */}
            <div
              data-index-link-target="fifteen-day-calendar-qr"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "4px 6px",
                borderBottom: "1px dashed #d97706",
                fontSize: "15px",
                fontWeight: 700,
                color: "#78350f",
              }}
            >
              <span style={{ lineHeight: 1.32 }}>
                {pick6(
                  {
                    kn: "ವಿಶೇಷ ಸೇರ್ಪಡೆ — ೧೫ ದಿನಗಳ ವೈಯಕ್ತಿಕ ದೈನಂದಿನ ದರ್ಶನ ಕ್ಯಾಲೆಂಡರ್",
                    mr: "विशेष भेट — १५ दिवसांचे वैयक्तिक दैनिक दर्शन कॅलेंडर",
                    hi: "विशेष उपहार — १५-दिवसीय व्यक्तिगत दैनिक दर्शन कैलेंडर",
                    te: "ప్రత్యేక కానుక — 15 రోజుల వ్యక్తిగత దైనిక దర్శన క్యాలెండర్",
                    ta: "சிறப்பு இணைப்பு — 15 நாட்கள் தனிப்பயன் தினசரி தரிசன காலண்டர்",
                    en: "Bonus — 15-Day Personalized Daily Darshana Calendar QR",
                  },
                  lang
                )}
              </span>
              <span
                data-index-page-for="fifteen-day-calendar-qr"
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#92400e",
                  whiteSpace: "nowrap",
                  marginLeft: "14px",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                {formatPageTag6L(data.initialCalendarQrPage, lang)}
              </span>
            </div>

            {/* Family Sanctuary & Chief Priest Contact Row */}
            <div
              data-index-link-target="family-referral-and-priest"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "4px 6px",
                fontSize: "15px",
                fontWeight: 700,
                color: "#78350f",
              }}
            >
              <span style={{ lineHeight: 1.32 }}>
                {pick6(
                  {
                    kn: "ಸಮಾಪನ — ಕುಟುಂಬ ರಕ್ಷಣೆ & ಗೋಕರ್ಣ ಮುಖ್ಯ ಅರ್ಚಕರ ಸಂಪರ್ಕ",
                    mr: "समारोप — कौटुंबिक सुरक्षा व गोकर्ण मुख्य पुरोहित संपर्क",
                    hi: "उपसंहार — पारिवारिक सुरक्षा एवं गोकर्ण मुख्य अर्चक संपर्क",
                    te: "ముగింపు — కుటుంబ రక్షణ & గోకర్ణ ముఖ్య అర్చకుల సంప్రదింపు",
                    ta: "நிறைவு — குடும்ப பாதுகாப்பு & கோகர்ண தலைமை அர்ச்சகர் தொடர்பு",
                    en: "Closing — Family Sanctuary & Sri Gokarna Chief Priest Contact",
                  },
                  lang
                )}
              </span>
              <span
                data-index-page-for="family-referral-and-priest"
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#92400e",
                  whiteSpace: "nowrap",
                  marginLeft: "14px",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                {formatPageTag6L(data.initialFinalBlessingPage, lang)}
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: "10px",
              paddingTop: "8px",
              borderTop: "1px solid #d97706",
              fontSize: "14.5px",
              fontWeight: 600,
              color: "#78350f",
              textAlign: "center",
            }}
          >
            {pick6(
              {
                kn: "ಪ್ರತಿ ಅಧ್ಯಾಯವೂ ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ, ನಕ್ಷತ್ರ, ಯೋಗಿ, ಮಾಂದಿ ಹಾಗೂ ದಶಾ ಗಣಿತದ ಆಧಾರದ ಮೇಲೆ ಪ್ರತ್ಯೇಕವಾಗಿ ರಚಿಸಲ್ಪಟ್ಟಿದೆ.",
                mr: "प्रत्येक अध्याय आपल्या जन्म लग्न, नक्षत्र, योगी, मांदी व दशा गणितावर आधारित आहे.",
                hi: "प्रत्येक अध्याय आपके जन्म लग्न, नक्षत्र, योगी, मांदी एवं दशा गणित पर आधारित है।",
                te: "ప్రతి అధ్యాయం మీ జన్మ లగ్నం, నక్షత్రం, యోగి, మాంది మరియు దశా గణిత ఆధారంగా రూపొందించబడింది.",
                ta: "ஒவ்வொரு அத்தியாயமும் உங்கள் ஜென்ம லக்னம், நட்சத்திரம், யோகி, மாந்தி மற்றும் தசா கணிதப்படி அமைக்கப்பட்டுள்ளது.",
                en: "Every chapter above is individually synthesized from your exact natal lagna, nakshatra, yogi, maandi, and dasha calculations.",
              },
              lang
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 3 (PAGE 3): 6-ANGA BIRTH PANCHANGA & PRECISION KUNDLI DOSSIER */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="user-details">
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
                paddingBottom: "10px",
                marginBottom: "14px",
                borderBottom: "2px solid #d97706",
              }}
            >
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#78350f" }}>
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px 16px",
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
                  {data.tithiName.includes(data.pakshaName) ? data.tithiName : `${data.pakshaName} ${data.tithiName}`} • {data.weekdayName}
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
                marginTop: "14px",
                paddingTop: "12px",
                borderTop: "1.5px solid #fde68a",
              }}
            >
              <div style={{ fontSize: "17px", fontWeight: 800, color: "#92400e", marginBottom: "10px" }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                <div style={infoCellStyle}>
                  <div style={infoLabelStyle}>
                    {pick6({ kn: "ಇಂದಿನ ತಾರಾಬಲ & ಬಲ", mr: "आजचे ताराबल", hi: "आज का ताराबल", te: "నేటి తారాబలం", ta: "இன்றைய தாராபலம்", en: "Today's Live Tarabala" }, lang)}
                  </div>
                  <div style={infoValueStyle}>
                    {data.precisionProfile.liveTarabalaHeadline}
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
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid #d97706",
              fontSize: "16.5px",
              fontWeight: 700,
              color: "#78350f",
              lineHeight: 1.58,
            }}
          >
            <div>
              <span style={{ color: "#92400e" }}>
                {pick6({ kn: "ಪಂಚಭೂತ ತತ್ವ: ", mr: "पंचतत्त्व: ", hi: "पंचभूत तत्त्व: ", te: "పంచభూత తత్వం: ", ta: "பஞ்சபூத தத்துவம்: ", en: "Elemental Matrix: " }, lang)}
              </span>
              {data.dominantElement}
            </div>
            <div style={{ marginTop: "6px" }}>
              <span style={{ color: "#92400e" }}>
                {pick6({ kn: "ಶುಭ ಯೋಗಗಳು: ", mr: "शुभ योग: ", hi: "शुभ योग: ", te: "శుభ యోగాలు: ", ta: "சுப யோகங்கள்: ", en: "Key Yogas: " }, lang)}
              </span>
              {data.detectedYogasSummary}
            </div>
            <div style={{ marginTop: "6px" }}>
              <span style={{ color: "#92400e" }}>
                {pick6({ kn: "ದೋಷ & ಜನ್ಮ ದಶಾ ಶೇಷ: ", mr: "दोष व जन्म दशा शिल्लक: ", hi: "दोष एवं जन्म दशा शेष: ", te: "దోషం & జన్మ దశా శేషం: ", ta: "தோஷம் & ஜனன தசா இருப்பு: ", en: "Diagnostics & Dasha Balance: " }, lang)}
              </span>
              {data.detectedDoshasSummary} • {n(data.janmaDashaBalance)}
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

          <div
            className={sectionClass}
            data-section={`chapter-${chapter.chapterNumber}`}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                padding: "14px 22px",
                boxSizing: "border-box",
                letterSpacing: "normal",
              }}
            >
              {renderChapterBanner(chapter)}

              <div
                style={{
                  borderLeft: "3px solid #d97706",
                  padding: "6px 14px",
                  marginBottom: "16px",
                  fontSize: "19px",
                  fontWeight: 700,
                  lineHeight: 1.48,
                  color: "#78350f",
                  wordBreak: "break-word",
                }}
              >
                {chapter.question}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "13px",
                }}
              >
                {chapter.paragraphs.map((para, pIdx) => (
                  <p
                    key={pIdx}
                    style={{
                      margin: 0,
                      fontSize: "18.5px",
                      lineHeight: 1.66,
                      color: "#1f1206",
                      letterSpacing: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>

              {renderContemplationRibbon(chapter.guidanceBadge, chapter.practicalGuidance)}
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
