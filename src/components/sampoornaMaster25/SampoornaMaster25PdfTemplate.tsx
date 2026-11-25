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
      {/* SECTION 1: ROYAL MANUSCRIPT COVER HEADER                              */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="cover">
        <div
          style={{
            borderTop: "4px double #b45309",
            borderBottom: "4px double #b45309",
            background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%)",
            borderRadius: "10px",
            padding: "16px 24px",
            textAlign: "center",
            letterSpacing: "normal",
          }}
        >
          <p
            style={{
              margin: "0 0 8px 0",
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <span style={{ width: "80px", height: "1.5px", backgroundColor: "#b45309", opacity: 0.6 }} />
            <span
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: "2px solid #b45309",
                backgroundColor: "#92400e",
                color: "#fef3c7",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 800,
              }}
            >
              {omGlyph}
            </span>
            <span style={{ width: "80px", height: "1.5px", backgroundColor: "#b45309", opacity: 0.6 }} />
          </div>

          <h1
            style={{
              margin: "0 0 6px 0",
              fontSize: "25px",
              fontWeight: 800,
              lineHeight: 1.4,
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
                en: "Sampoorna 25-Chapter Master Horoscope & Destiny Folio",
              },
              lang
            )}
          </h1>

          <p
            style={{
              margin: 0,
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
                te: "పరాశర సిద్ధాంతం • షడంగ పంచాంగం • యోగి-మాంది • అష్టకవర్గ • దశా-గోచార దర్శనం",
                ta: "பராசர சித்தாந்தம் • ஷடங்க பஞ்சாங்கம் • யோகி-மாந்தி • அஷ்டகவர்க்கம் • தசா-கோசார தரிசனம்",
                en: "Parashari Siddhanta • 6-Anga Panchanga • Yogi-Maandi • Ashtakavarga • Live Dasha & Transits",
              },
              lang
            )}
          </p>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 2: COMPLETE 6-ANGA BIRTH PANCHANGA & KUNDLI PROFILE CARD    */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="user-details">
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #d97706",
            borderRadius: "10px",
            padding: "14px 18px",
            letterSpacing: "normal",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "8px",
              marginBottom: "10px",
              borderBottom: "1.5px solid #fcd34d",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#78350f" }}>
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
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 3: EXECUTIVE TABLE OF CONTENTS (5 PILLAR ARCHIVES)           */}
      {/* ==================================================================== */}
      <div className={sectionClass} data-section="executive-index">
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1.5px solid #f59e0b",
            borderRadius: "10px",
            padding: "14px 18px",
            letterSpacing: "normal",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#78350f" }}>
              📖{" "}
              {pick6(
                {
                  kn: "ಸಂಪೂರ್ಣ ೨೫ ಅಧ್ಯಾಯಗಳ ವಿಷಯ ಸೂಚಿ (೫ ಪ್ರಮುಖ ವಿಭಾಗಗಳು)",
                  mr: "संपूर्ण २५ अध्यायांची अनुक्रमणिका (५ प्रमुख विभाग)",
                  hi: "संपूर्ण २५ अध्यायों की विषय-सूची (५ प्रमुख खंड)",
                  te: "సంపూర్ణ 25 అధ్యాయాల విషయ సూచిక (5 ముఖ్య భాగాలు)",
                  ta: "சம்பூர்ண 25 அத்தியாய உள்ளடக்க அட்டவணை (5 பிரிவுகள்)",
                  en: "Complete 25-Chapter Executive Index (5 Sacred Volumes)",
                },
                lang
              )}
            </h3>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
              {data.dominantElement}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.sectionIndexTitles.map((sec) => (
              <div
                key={sec.sectionNumber}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  border: "1px solid #fde68a",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#451a03",
                }}
              >
                <span style={{ maxWidth: "74%", lineHeight: 1.35 }}>{sec.title}</span>
                <span style={{ fontSize: "12px", color: "#b45309", whiteSpace: "nowrap" }}>
                  {sec.chapterRange}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              backgroundColor: "#fef3c7",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
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
                  en: `Saturn Gochara: ${data.shaniTransitRashi} (${data.shaniHouseFromMoon} from Moon)`,
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
                  en: `Jupiter Gochara: ${data.guruTransitRashi} (${data.guruHouseFromMoon} from Moon)`,
                },
                lang
              )}
            </span>
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
          >
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

            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #fcd34d",
                borderRadius: "10px",
                padding: "16px 20px",
                letterSpacing: "normal",
              }}
            >
              <div
                style={{
                  backgroundColor: "#fffbeb",
                  borderLeft: "4px solid #d97706",
                  padding: "9px 14px",
                  borderRadius: "6px",
                  marginBottom: "12px",
                  fontSize: "15.5px",
                  fontWeight: 700,
                  lineHeight: 1.5,
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
                      fontSize: "15px",
                      lineHeight: 1.6,
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
