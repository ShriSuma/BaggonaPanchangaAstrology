import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
/**
 * Print sheets for the Prasada kit.
 *
 * Everything is styled with inline hex colours rather than utility classes:
 * html2canvas parses inline styles reliably, and it keeps the sheets light on
 * ink so they can be printed at a small shop without draining a cartridge.
 */

import type { RhythmDay, RhythmResult } from "../../../core/DailyRhythmEngine";
import type { SevaRecommendation } from "../../../core/GokarnaSevaEngine";
import {
  COLOUR_HEX,
  COLOUR_L5,
  DIRECTION_L5,
  GRAHA_MANTRA_SANSKRIT,
  LETTER_L5,
  NAKSHATRA_L5,
  RASHI_L5,
  SHLOKA_SHIVA,
  T,
  WEEKDAY_SHORT_L5,
  formatPanditName,
  pick,
  type SevaLang,
  type L5
} from "../../../features/seva/sevaLocale";
import {
  BAND_STYLE,
  MARK,
  formatLongDate,
  formatMonthTitle,
  tithiLabel
} from "../../../features/seva/sevaPresentation";

/* ------------------------------------------------------------------ *
 * Shared palette and primitives
 * ------------------------------------------------------------------ */

const INK = "#3F2A12";
const INK_SOFT = "#7C5A32";
const GOLD = "#B45309";
const GOLD_LIGHT = "#E7C68A";
const PAPER = "#FFFDF7";
const PANEL = "#FDF6E7";

const SEAL_HEADER_DICT: L5 = {
  kn: "✦ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರ ಹಸ್ತದ ಸೀಲು ಹಾಗೂ ನವೀಕರಣ ಮುದ್ರೆ ✦",
  hi: "✦ गोकर्ण महाबलेश्वर क्षेत्र मुख्य अर्चक प्रत्यक्ष सील एवं नवीकरण मुद्रा ✦",
  te: "✦ గోకర్ణ మహాబలేశ్వర క్షేత్ర ప్రధాన అర్చకుల సీలు మరియు నవీకరణ ముద్ర ✦",
  ta: "✦ கோகர்ண மகாபலேஸ்வர க்ஷேத்திர முதன்மை அர்ச்சகர் சீல் மற்றும் புதுப்பித்தல் ✦",
  en: "✦ Chief Archaka Official Seal & Annual Seva Renewal Badge ✦"
};

const SEAL_DESC_DICT: L5 = {
  kn: "ಈ ಪತ್ರಿಕೆಯು ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸಂಕಲ್ಪ ಪತ್ರಿಕೆಯಾಗಿದ್ದು, ಪ್ರತಿವರ್ಷ ಸಂಕಲ್ಪ ನವೀಕರಣಕ್ಕೆ ಹಾಗೂ ಬಂಧು-ಮಿತ್ರರ ಪೂಜಾ ಮಾರ್ಗದರ್ಶನಕ್ಕೆ ಸಂಪರ್ಕಿಸಬಹುದು.",
  hi: "यह पत्र गोकर्ण श्री महाबलेश्वर स्वामी का दिव्य संकल्प पत्र है। प्रतिवर्ष संकल्प नवीकरण तथा परिजनों के पूजन हेतु अर्चक से संपर्क करें।",
  te: "ఈ పత్రం గోకర్ణ శ్రీ మహాబలేశ్వర స్వామివారి దివ్య సంకల్ప పత్రం. ప్రతి సంవత్సరం సంకల్ప నవీకరణ మరియు బంధువుల పూజల కొరకు సంప్రదించండి.",
  ta: "இந்த அட்டை கோகர்ண ஸ்ரீ மகாபலேஸ்வர சுவாமியின் திவ்ய சங்கல்ப அட்டையாகும். வருடாந்திர புதுப்பித்தல் மற்றும் பூஜைகளுக்கு அர்ச்சகரைத் தொடர்புகொள்ளலாம்.",
  en: "This document is an authentic spiritual covenant from Shri Mahabaleshwara Gokarna Kshetra. Retain for annual Seva renewal and referral."
};

const PAGE_W = 900;
const PAGE_H = 1273;

const pageStyle: React.CSSProperties = {
  width: PAGE_W,
  minHeight: PAGE_H,
  backgroundColor: PAPER,
  boxSizing: "border-box",
  padding: "38px 42px",
  fontFamily: "'Noto Sans', 'Nirmala UI', 'Segoe UI', system-ui, sans-serif",
  color: INK,
  position: "relative"
};

const OrnamentRule = (): JSX.Element => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
    <div style={{ flex: 1, borderBottom: `2px solid ${GOLD_LIGHT}` }} />
    <div style={{ color: GOLD, fontSize: 13, letterSpacing: 4 }}>❖</div>
    <div style={{ flex: 1, borderBottom: `2px solid ${GOLD_LIGHT}` }} />
  </div>
);

type Identity = {
  personName: string;
  gotra: string;
  rashiIndex: number;
  nakshatraIndex: number;
  placeLabel: string;
};

const SheetHeader = ({
  lang,
  title,
  identity
}: {
  lang: string;
  title: string;
  identity: Identity;
}): JSX.Element => (
  <div
    style={{
      border: `2px solid ${GOLD}`,
      borderRadius: 14,
      backgroundColor: PANEL,
      padding: "18px 22px",
      textAlign: "center"
    }}
  >
    <div style={{ fontSize: 11, letterSpacing: 5, color: GOLD, textTransform: "uppercase" }}>
      {pick(T.preparedBy!, lang)}
    </div>
    <div style={{ marginTop: 7, fontSize: 27, fontWeight: 700, color: INK }}>{title}</div>
    <div style={{ marginTop: 3, fontSize: 13, color: INK_SOFT }}>
      {pick(LETTER_L5.signature!, lang)}
    </div>

    <div
      style={{
        marginTop: 15,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 10
      }}
    >
      {[
        [pick(T.labelName!, lang), identity.personName],
        [pick(T.labelRashi!, lang), pick(RASHI_L5[identity.rashiIndex]!, lang)],
        [pick(T.labelNakshatra!, lang), pick(NAKSHATRA_L5[identity.nakshatraIndex]!, lang)],
        ...(identity.gotra ? [[pick(T.labelGotra!, lang), identity.gotra]] : [])
      ].map(([label, value]) => (
        <div
          key={label}
          style={{
            border: `1px solid ${GOLD_LIGHT}`,
            borderRadius: 9,
            backgroundColor: "#FFFFFF",
            padding: "6px 14px",
            minWidth: 130
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: 1.4, color: INK_SOFT, textTransform: "uppercase" }}>
            {label}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginTop: 2 }}>{value}</div>
        </div>
      ))}
    </div>
  </div>
);

const LegendRow = ({ lang }: { lang: string }): JSX.Element => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      color: INK_SOFT
    }}
  >
    {(["high", "steady", "rest"] as const).map((band) => (
      <span key={band} style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span
          style={{
            width: 13,
            height: 13,
            borderRadius: 3,
            backgroundColor: BAND_STYLE[band].printBg,
            border: `1px solid ${BAND_STYLE[band].printBorder}`,
            display: "inline-block"
          }}
        />
        {pick(
          band === "high"
            ? { en: "High Energy", kn: "ಹೆಚ್ಚಿನ ಶಕ್ತಿ", te: "అధిక శక్తి", ta: "உயர் ஆற்றல்", hi: "उच्च ऊर्जा" }
            : band === "steady"
              ? { en: "Steady", kn: "ಸಮತೋಲನ", te: "సమతుల్యం", ta: "சமநிலை", hi: "संतुलित" }
              : { en: "Rest and Pray", kn: "ವಿಶ್ರಾಂತಿ", te: "విశ్రాంతి", ta: "ஓய்வு", hi: "विश्राम" },
          lang
        )}
      </span>
    ))}
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ color: "#047857", fontSize: 13 }}>{MARK.money}</span>
      {pick(T.moneyDayShort!, lang)}
    </span>
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ color: GOLD, fontSize: 13 }}>{MARK.pooja}</span>
      {pick(T.poojaDayShort!, lang)}
    </span>
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ color: "#BE123C", fontSize: 13 }}>{MARK.janmaStar}</span>
      {pick(T.labelNakshatra!, lang)}
    </span>
  </div>
);

/* ------------------------------------------------------------------ *
 * Month block
 * ------------------------------------------------------------------ */

const MonthBlock = ({
  month,
  lang
}: {
  month: RhythmResult["months"][number];
  lang: string;
}): JSX.Element => {
  const byDay = new Map<number, RhythmDay>();
  for (const d of month.days) byDay.set(d.dayOfMonth, d);

  const daysInMonth = new Date(Date.UTC(month.year, month.monthIndex + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: month.leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          borderBottom: `1.5px solid ${GOLD_LIGHT}`,
          paddingBottom: 4,
          marginBottom: 6
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: GOLD }}>
          {formatMonthTitle(month.monthIndex, month.year, lang)}
        </div>
        <div style={{ fontSize: 10, color: INK_SOFT }}>
          {pick(T.countHigh!, lang)}: {month.highCount} · {pick(T.countMoney!, lang)}:{" "}
          {month.moneyCount} · {pick(T.countRest!, lang)}: {month.restCount}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {WEEKDAY_SHORT_L5.map((w, i) => (
          <div
            key={`h${i}`}
            style={{
              textAlign: "center",
              fontSize: 9,
              fontWeight: 700,
              color: INK_SOFT,
              paddingBottom: 2,
              overflow: "hidden",
              whiteSpace: "nowrap"
            }}
          >
            {pick(w, lang)}
          </div>
        ))}

        {cells.map((dayNum, i) => {
          if (dayNum === null) return <div key={`b${i}`} style={{ height: 42 }} />;

          const day = byDay.get(dayNum);
          if (!day) {
            return (
              <div
                key={`o${i}`}
                style={{
                  height: 42,
                  border: "1px dashed #E5E7EB",
                  borderRadius: 5,
                  color: "#D1D5DB",
                  fontSize: 10,
                  padding: 3,
                  boxSizing: "border-box"
                }}
              >
                {dayNum}
              </div>
            );
          }

          const style = BAND_STYLE[day.band];
          return (
            <div
              key={day.ymd}
              style={{
                height: 42,
                boxSizing: "border-box",
                border: `1px solid ${style.printBorder}`,
                backgroundColor: style.printBg,
                borderRadius: 5,
                padding: "3px 4px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: style.printText, lineHeight: 1 }}>
                  {dayNum}
                </span>
                <span style={{ fontSize: 9, color: style.printText, lineHeight: 1 }}>
                  {day.luckyNumbers[0]}
                </span>
              </div>
              <div style={{ display: "flex", gap: 3, fontSize: 9, lineHeight: 1 }}>
                {day.isMoneyDay && <span style={{ color: "#047857" }}>{MARK.money}</span>}
                {day.isJanmaNakshatraDay ? (
                  <span style={{ color: "#BE123C" }}>{MARK.janmaStar}</span>
                ) : (
                  day.isPoojaDay && <span style={{ color: GOLD }}>{MARK.pooja}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Sheet 1 & 2 — the six-month calendar
 * ------------------------------------------------------------------ */

export type CalendarPrintProps = {
  rhythm: RhythmResult;
  lang: string;
  identity: Identity;
};

export const SevaCalendarPrint = ({ rhythm, lang, identity }: CalendarPrintProps): JSX.Element => {
  const firstHalf = rhythm.months.slice(0, 3);
  const secondHalf = rhythm.months.slice(3, 7);

  return (
    <div>
      {/* Page 1 */}
      <div className="pdf-page" style={pageStyle}>
        <SheetHeader lang={lang} title={pick(T.calendarTitle!, lang)} identity={identity} />
        <div style={{ marginTop: 12 }}>
          <LegendRow lang={lang} />
        </div>
        {firstHalf.map((m) => (
          <MonthBlock key={`${m.year}-${m.monthIndex}`} month={m} lang={lang} />
        ))}
        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: 42,
            right: 42,
            textAlign: "center",
            fontSize: 10,
            color: INK_SOFT
          }}
        >
          {pick(LETTER_L5.signature!, lang)} · 1 / 2
        </div>
      </div>

      {/* Page 2 */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ marginTop: 4 }}>
          <LegendRow lang={lang} />
        </div>
        {secondHalf.map((m) => (
          <MonthBlock key={`${m.year}-${m.monthIndex}`} month={m} lang={lang} />
        ))}

        <div
          style={{
            marginTop: 22,
            border: `1.5px solid ${GOLD_LIGHT}`,
            borderRadius: 12,
            backgroundColor: PANEL,
            padding: "16px 20px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 3, color: GOLD, textTransform: "uppercase" }}>
            {pick(T.shlokaLabel!, lang)}
          </div>
          <div
            lang="sa"
            style={{
              marginTop: 8,
              fontSize: 15,
              lineHeight: 1.8,
              color: INK,
              whiteSpace: "pre-line"
            }}
          >
            {SHLOKA_SHIVA.sanskrit}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: INK_SOFT, lineHeight: 1.6 }}>
            {pick(SHLOKA_SHIVA.meaning, lang)}
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 9.5,
            lineHeight: 1.6,
            color: INK_SOFT,
            textAlign: "center"
          }}
        >
          {pick(T.disclaimer!, lang)}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: 42,
            right: 42,
            textAlign: "center",
            fontSize: 10,
            color: INK_SOFT
          }}
        >
          {pick(LETTER_L5.signature!, lang)} · 2 / 2
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Sheet 3 — the blessing letter
 * ------------------------------------------------------------------ */

export type LetterPrintProps = {
  lang: string;
  identity: Identity;
  primarySeva: SevaRecommendation | undefined;
  sevaDate: string;
  rhythm: RhythmResult;
  panditName?: string;
  qrDataUrl?: string;
};

export const SevaLetterPrint = ({
  lang,
  identity,
  primarySeva,
  sevaDate,
  rhythm,
  panditName,
  qrDataUrl
}: LetterPrintProps): JSX.Element => {
  const safePanditName = formatPanditName(panditName, lang);

  const paragraph: React.CSSProperties = {
    fontSize: 13.5,
    lineHeight: 1.9,
    letterSpacing: "normal",
    color: INK,
    marginTop: 12,
    textAlign: "left"
  };

  return (
    <div className="pdf-page" style={pageStyle}>
      {/* Royal Gold Dual Decorative Frame */}
      <div
        style={{
          border: `3px double ${GOLD}`,
          borderRadius: 16,
          padding: "30px 36px",
          minHeight: PAGE_H - 76,
          boxSizing: "border-box",
          backgroundColor: PAPER,
          position: "relative"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, color: GOLD, letterSpacing: 2 }} lang="sa">
            ॐ
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              letterSpacing: "normal",
              color: GOLD,
              fontWeight: 700,
              lineHeight: 1.5
            }}
          >
            {pick(T.preparedBy!, lang)}
          </div>
          <div style={{ marginTop: 6, fontSize: 25, fontWeight: 700, letterSpacing: "normal", lineHeight: 1.5, color: INK }}>
            {pick(T.letterTitle!, lang)}
          </div>
        </div>

        <OrnamentRule />

        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6, color: INK }}>
          {pick(LETTER_L5.salutation!, lang)} {identity.personName},
        </div>

        <p style={paragraph}>{pick(LETTER_L5.opening!, lang)}</p>

        {/* Seva Record Details */}
        <div
          style={{
            marginTop: 14,
            border: `1.5px solid ${GOLD_LIGHT}`,
            borderRadius: 12,
            backgroundColor: PANEL,
            padding: "14px 18px"
          }}
        >
          {[
            [pick(T.sevaPerformed!, lang), primarySeva ? pick(primarySeva.seva.name, lang) : "—"],
            [pick(T.sevaDate!, lang), sevaDate || "—"],
            [pick(T.sevaPlace!, lang), primarySeva ? pick(primarySeva.seva.where, lang) : "—"],
            [pick(T.labelRashi!, lang), pick(RASHI_L5[identity.rashiIndex]!, lang)],
            [pick(T.labelNakshatra!, lang), pick(NAKSHATRA_L5[identity.nakshatraIndex]!, lang)]
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "8px 4px",
                minHeight: 32,
                borderBottom: `1px solid ${GOLD_LIGHT}66`,
                boxSizing: "border-box"
              }}
            >
              <div style={{ width: 210, fontSize: 11.5, color: INK_SOFT, textTransform: "uppercase", letterSpacing: "normal", lineHeight: 1.6 }}>
                {label}
              </div>
              <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: INK, lineHeight: 1.6, letterSpacing: "normal" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Priest Ashirvachana Blessing Box */}
        <div
          style={{
            marginTop: 16,
            backgroundColor: PANEL,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 12,
            padding: "18px 22px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: GOLD, marginBottom: 8 }}>
            ✦ {pick(LETTER_L5.ashirvachanaHeading!, lang)} ✦
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 12, backgroundColor: GOLD_LIGHT + "33", padding: "6px 16px", borderRadius: 20, display: "inline-block", border: `1px solid ${GOLD_LIGHT}` }}>
            {safePanditName ? `${pick(LETTER_L5.priestBlessingPrefix!, lang)} ${safePanditName}` : "ಅರ್ಚಕರು"}
          </div>

          <div style={{ fontSize: 13.5, margin: 0, lineHeight: 1.9, textAlign: "left", color: INK, whiteSpace: "pre-line" }}>
            {pick(LETTER_L5.priestBlessingBody!, lang)}
          </div>
        </div>

        <OrnamentRule />

        <div
          style={{
            textAlign: "center",
            backgroundColor: PANEL,
            border: `1px solid ${GOLD_LIGHT}`,
            borderRadius: 12,
            padding: "14px 18px"
          }}
        >
          <div
            lang="sa"
            style={{ fontSize: 14.5, lineHeight: 1.8, whiteSpace: "pre-line", color: INK }}
          >
            {(primarySeva?.seva.shloka ?? SHLOKA_SHIVA).sanskrit}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: INK_SOFT, lineHeight: 1.6 }}>
            {pick((primarySeva?.seva.shloka ?? SHLOKA_SHIVA).meaning, lang)}
          </div>
        </div>

        <p style={{ ...paragraph, textAlign: "center", fontWeight: 600, marginTop: 14 }}>
          {pick(LETTER_L5.closing!, lang)}
        </p>

        {/* Priest Signature Block */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "flex-end", borderTop: `1.5px solid ${GOLD_LIGHT}`, paddingTop: 14 }}>
          <div style={{ textAlign: "right", marginLeft: "auto" }}>
            <div style={{ fontSize: 12, color: INK_SOFT }}>
              {pick(LETTER_L5.namaskaraSubtitle!, lang)}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: GOLD, marginTop: 2 }}>
              {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"}
            </div>
            <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 2 }}>
              {rhythm?.startYmd || ""} — {rhythm?.endYmd || ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Sheet 4 — the QR Code Sync Instructions Card
 * ------------------------------------------------------------------ */

export const SevaQRCodePrint = ({
  lang,
  identity,
  qrDataUrl
}: {
  lang: string;
  identity: Identity;
  qrDataUrl?: string;
}): JSX.Element => {
  const [internalQr, setInternalQr] = useState<string>(qrDataUrl || "");

  useEffect(() => {
    if (qrDataUrl) {
      setInternalQr(qrDataUrl);
      return;
    }
    // Guaranteed fallback QR code generation if qrDataUrl prop is empty
    const fallbackPayload = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("[Baggona] 90-Day Panchanga Astrology Gokarna")}&details=${encodeURIComponent("Baggona Panchanga Gokarna Mahabaleshwara Kshetra Blessings")}`;
    QRCode.toDataURL(fallbackPayload, {
      margin: 2,
      width: 280,
      color: { dark: "#78350F", light: "#FFFFFF" }
    })
      .then((url) => setInternalQr(url))
      .catch((e) => console.error("Error generating fallback QR:", e));
  }, [qrDataUrl]);

  const displayQr = qrDataUrl || internalQr;

  return (
    <div className="pdf-page" style={pageStyle}>
      <div
        style={{
          border: `3px double ${GOLD}`,
          borderRadius: 16,
          padding: "36px 40px",
          minHeight: PAGE_H - 76,
          boxSizing: "border-box",
          backgroundColor: PAPER,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "center",
          position: "relative"
        }}
      >
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: INK, marginBottom: 10, lineHeight: 1.4 }}>
            {pick(T.qrPrintHeader!, lang)}
          </div>
          <div style={{ fontSize: 13.5, color: INK_SOFT, marginBottom: 16, maxWidth: 680, lineHeight: 1.65 }}>
            {pick(T.scanQrDesc!, lang)}
          </div>
        </div>

        <div
          style={{
            padding: 16,
            backgroundColor: "#FFFFFF",
            border: `2px solid ${GOLD_LIGHT}`,
            borderRadius: 16,
            display: "inline-block",
            marginBottom: 16,
            boxShadow: "0 8px 24px rgba(180, 83, 9, 0.12)"
          }}
        >
          {displayQr ? (
            <img src={displayQr} alt="Baggona Panchanga 90-Day Sync QR Code" style={{ width: 260, height: 260, display: "block" }} />
          ) : (
            <div style={{ width: 260, height: 260, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: PANEL, color: GOLD, fontSize: 14, fontWeight: 700 }}>
              QR Code Consecrating...
            </div>
          )}
        </div>

        <div style={{ textAlign: "left", width: "100%", maxWidth: 660, backgroundColor: PANEL, padding: "22px 28px", borderRadius: 16, border: `1.5px solid ${GOLD_LIGHT}`, boxSizing: "border-box" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: GOLD, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>
            {pick(T.scanQrTitle!, lang)}
          </div>
          <div style={{ fontSize: 14.5, color: INK, lineHeight: 1.9 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>📱</span> {pick(T.qrPrintStep1!, lang)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>📷</span> {pick(T.qrPrintStep2!, lang)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>🔗</span> {pick(T.qrPrintStep3!, lang)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>✅</span> {pick(T.qrPrintStep4!, lang)}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            marginBottom: 10,
            fontSize: 12,
            color: INK_SOFT,
            fontWeight: 600
          }}
        >
          🕉️ {pick({ kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಕೃಪಾಕಟಾಕ್ಷ ಸದಾ ನಿಮ್ಮೊಂದಿಗಿರಲಿ", hi: "श्री गोकर्ण महाबलेश्वर स्वामी की दिव्य कृपा सदैव आप पर बनी रहे", te: "శ్రీ గోకర్ణ మహాబలేశ్వర స్వామివారి దివ్య కృపాకటాక్షాలు సదా మీతో ఉండుగాక", ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வர சுவாமியின் திவ்ய கிருபை எப்போதும் உங்களுடன் இருப்பதாக", en: "May the divine grace of Shri Gokarna Mahabaleshwara always protect you" }, lang)}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 42,
            right: 42,
            textAlign: "center",
            fontSize: 10,
            color: INK_SOFT
          }}
        >
          {pick(LETTER_L5.signature!, lang)} · 2 / 5
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Sheet 5 — the prasada card that travels inside the packet
 * ------------------------------------------------------------------ */

export type PrasadaCardPrintProps = {
  lang: string;
  identity: Identity;
  rhythm: RhythmResult;
  today?: RhythmDay;
  bestDays?: RhythmDay[];
  moneyDays?: RhythmDay[];
  panditName?: string;
  qrDataUrl?: string;
};

export const SevaPrasadaCardPrint = ({
  lang,
  identity,
  rhythm,
  today,
  bestDays = [],
  moneyDays = [],
  panditName,
  qrDataUrl
}: PrasadaCardPrintProps): JSX.Element => {
  const activeToday = today || rhythm?.days?.[0];
  const colourKey = (rhythm?.personalColour && COLOUR_HEX[rhythm.personalColour]) ? rhythm.personalColour : "yellow";
  const directionKey = (rhythm?.personalDirection && DIRECTION_L5[rhythm.personalDirection]) ? rhythm.personalDirection : "east";
  const personalNumStr = rhythm?.personalNumbers?.length ? rhythm.personalNumbers.join(" · ") : "3";

  const listBox = (title: string, days: RhythmDay[], accent: string): JSX.Element => (
    <div
      style={{
        flex: 1,
        border: `1px solid ${GOLD_LIGHT}`,
        borderRadius: 11,
        backgroundColor: "#FFFFFF",
        padding: "12px 14px"
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: 1.4,
          color: accent,
          textTransform: "uppercase",
          fontWeight: 700
        }}
      >
        {title}
      </div>
      <div style={{ marginTop: 7 }}>
        {days.length === 0 && <div style={{ fontSize: 11, color: INK_SOFT }}>—</div>}
        {days.map((d) => (
          <div
            key={d.ymd}
            style={{
              fontSize: 12,
              color: INK,
              padding: "3px 0",
              borderBottom: `1px solid ${GOLD_LIGHT}33`
            }}
          >
            {formatLongDate(d, lang)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pdf-page" style={pageStyle}>
      <SheetHeader lang={lang} title={pick(T.prasadaCardTitle!, lang)} identity={identity} />

      {/* Standing personal signs */}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <div
          style={{
            flex: 1,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 12,
            backgroundColor: PANEL,
            padding: "16px 12px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 1.4, color: INK_SOFT, textTransform: "uppercase" }}>
            {pick(T.luckyNumber!, lang)}
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: GOLD, marginTop: 4 }}>
            {personalNumStr}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 12,
            backgroundColor: PANEL,
            padding: "16px 12px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 1.4, color: INK_SOFT, textTransform: "uppercase" }}>
            {pick(T.luckyColour!, lang)}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 10
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: COLOUR_HEX[colourKey],
                border: `1px solid ${GOLD_LIGHT}`,
                display: "inline-block"
              }}
            />
            <span style={{ fontSize: 17, fontWeight: 600, color: INK }}>
              {pick(COLOUR_L5[colourKey], lang)}
            </span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 12,
            backgroundColor: PANEL,
            padding: "16px 12px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 1.4, color: INK_SOFT, textTransform: "uppercase" }}>
            {pick(T.luckyDirection!, lang)}
          </div>
          <div style={{ fontSize: 19, fontWeight: 600, color: INK, marginTop: 12 }}>
            {pick(DIRECTION_L5[directionKey], lang)}
          </div>
        </div>
      </div>

      {/* Today snapshot */}
      <div
        style={{
          marginTop: 18,
          border: `1px solid ${GOLD_LIGHT}`,
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
          padding: "14px 18px"
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: 1.4, color: GOLD, textTransform: "uppercase", fontWeight: 700 }}>
          {pick(T.today!, lang)}
        </div>
        <div style={{ marginTop: 5, fontSize: 15, fontWeight: 600 }}>
          {activeToday ? `${formatLongDate(activeToday, lang)} · ${tithiLabel(activeToday, lang)}` : "—"}
        </div>
      </div>

      {/* Highlight lists */}
      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        {listBox(pick(T.bestDays!, lang), bestDays.slice(0, 6), "#047857")}
        {listBox(pick(T.moneyDays!, lang), moneyDays.slice(0, 6), GOLD)}
      </div>

      {/* Mantra */}
      <div
        style={{
          marginTop: 20,
          border: `1.5px solid ${GOLD}`,
          borderRadius: 12,
          backgroundColor: PANEL,
          padding: "18px 20px",
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: 3, color: GOLD, textTransform: "uppercase" }}>
          {pick(T.dailyMantra!, lang)}
        </div>
        <div lang="sa" style={{ marginTop: 9, fontSize: 19, fontWeight: 600, color: INK }}>
          {GRAHA_MANTRA_SANSKRIT[rhythm.janmaRashiLord]}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: INK_SOFT }}>
          {pick(T.chantCount!, lang)}
        </div>
      </div>

      {qrDataUrl && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, border: `1.5px solid ${GOLD_LIGHT}`, borderRadius: 12, backgroundColor: "#FFFFFF", padding: "10px 16px" }}>
          <img
            src={qrDataUrl}
            alt="Calendar Sync QR Code"
            style={{ width: 72, height: 72, borderRadius: 6, border: `1px solid ${GOLD_LIGHT}`, padding: 3 }}
          />
          <div style={{ textAlign: "left", fontSize: 10, color: INK_SOFT, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, color: GOLD, fontSize: 11 }}>📲 {pick(T.scanQrTitle!, lang)}</div>
            <div>{pick(T.scanQrDesc!, lang)}</div>
            {panditName && <div style={{ fontWeight: 600, color: INK, marginTop: 2 }}>{pick(T.namaskaraHeader!, lang)} {panditName}</div>}
          </div>
        </div>
      )}

      <OrnamentRule />

      <div style={{ fontSize: 9.5, lineHeight: 1.6, color: INK_SOFT, textAlign: "center" }}>
        {pick(T.disclaimer!, lang)}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: 42,
          right: 42,
          textAlign: "center",
          fontSize: 10,
          color: GOLD,
          letterSpacing: 2
        }}
      >
        {panditName ? `${pick(T.namaskaraHeader!, lang)} ${panditName} · ${pick(LETTER_L5.signature!, lang)}` : pick(LETTER_L5.signature!, lang)}
      </div>
    </div>
  );
};


/* ------------------------------------------------------------------ *
 * Sheet 6 — Page 3: Spiritual Guidance & Yearly Anugraha Sheet (100% Full Page & Larger Fonts)
 * ------------------------------------------------------------------ */

export const SevaAnugrahaGuidancePrint = ({
  lang,
  identity,
  panditName,
  rhythm
}: {
  lang: string;
  identity: Identity;
  panditName?: string;
  rhythm?: RhythmResult;
}): JSX.Element => {
  const safePanditName = formatPanditName(panditName, lang);

  const TITLE_DICT: L5 = {
    kn: "✦ ಧಾರ್ಮಿಕ ಅನುಷ್ಠಾನ ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ವಾರ್ಷಿಕ ಅನುಗ್ರಹ ಪತ್ರಿಕೆ ✦",
    hi: "✦ धार्मिक अनुष्ठान मार्गदर्शन एवं वार्षिक अनुग्रह पत्र ✦",
    te: "✦ ధార్మిక అనుష్ఠాన మార్గదర్శనం మరియు వార్షిక అనుగ్రహ పత్రం ✦",
    ta: "✦ ஆன்மீக அனுஷ்டான வழிகாட்டல் மற்றும் வருடாந்திர அனுக்ரஹ அட்டை ✦",
    en: "✦ Devotee's Sacred Spiritual Rules & Yearly Anugraha Guidance Sheet ✦"
  };

  const SUBTITLE_DICT: L5 = {
    kn: "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸನ್ನಿಧಿಯಿಂದ ಅರ್ಚಕರು ಸೂಚಿಸಿದ ನಿತ್ಯ ನಿಯಮಗಳು, ದೈನಂದಿನ ಸ್ತೋತ್ರ ಜಪ ಹಾಗೂ ವಾರ್ಷಿಕ ಪೂಜಾ ಮಾರ್ಗದರ್ಶಿ",
    hi: "गोकर्ण श्री महाबलेश्वर स्वामी के पावन सान्निध्य से अर्चक द्वारा निर्दिष्ट नित्य नियम, दैनिक स्तोत्र जप एवं वार्षिक पूजा मार्गदर्शिका",
    te: "గోకర్ణ శ్రీ మహాబలేశ్వర స్వామివారి దివ్య సన్నిధి నుండి అర్చకులు సూచించిన నిత్య నియమాలు, దైనిక స్తోత్ర జపం మరియు వార్షిక పూజా మార్గదర్శి",
    ta: "கோகர்ண ஸ்ரீ மகாபலேஸ்வர சுவாமியின் திவ்ய சன்னதியிலிருந்து அர்ச்சகர் கூறிய நித்ய விதிகளும், தினசரி தோத்திர ஜபமும், விசேஷ பூஜை வழிகாட்டியும்",
    en: "Sacred daily spiritual commandments, stotra recitation discipline, and auspicious worship guide recommended by Archaka from Gokarna Kshetra"
  };

  const RULES_TITLE_DICT: L5 = {
    kn: "✦ ಅರ್ಚಕರು ಸೂಚಿಸಿದ ೪ ನಿತ್ಯ ಧಾರ್ಮಿಕ ನಿಯಮಗಳು ✦",
    hi: "✦ अर्चक द्वारा निर्दिष्ट ४ नित्य धार्मिक नियम ✦",
    te: "✦ అర్చకులు సూచించిన ౪ నిత్య ధార్మిక నియమాలు ✦",
    ta: "✦ அர்ச்சகர் கூறிய 4 நித்ய ஆன்மீக விதிகள் ✦",
    en: "✦ Archaka's 4 Sacred Daily Commandments ✦"
  };

  const RULES_LIST: { title: L5; desc: L5 }[] = [
    {
      title: { kn: "☀️ ಸೂರ್ಯೋದಯ ದೀಪಾರಾಧನೆ", hi: "☀️ सूर्योदय दीपाराधन", te: "☀️ సూర్యోదయ దీపారాధన", ta: "☀️ சூரியோதய தீபாராதனை", en: "☀️ Sunrise Lamp & Chanting" },
      desc: {
        kn: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸ್ನಾನಾನಂತರ ಮನೆಯ ದೇವರ ಮನೆಯಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ, ಪೂರ್ವಾಭಿಮುಖವಾಗಿ ಕುಳಿತು 108 ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸುವುದು. ಇದು ನಿತ್ಯ ಮಾನಸಿಕ ಉತ್ಸಾಹ, ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಹಾಗೂ ಸರ್ವ ಗ್ರಹ ಅನುಕೂಲತೆಯನ್ನು ತರುತ್ತದೆ.",
        hi: "प्रतिदिन प्रातः स्नान के पश्चात पूजा घर में शुद्ध घी का दीपक जलाकर पूर्व दिशा की ओर बैठकर 108 बार 'ॐ नमः शिवाय' का जाप करें। यह नित्य मानसिक उत्साह, सकारात्मक ऊर्जा और समस्त ग्रहों की अनुकूलता प्रदान करता है।",
        te: "ప్రతిరోజూ ఉదయం స్నానానంతరం పూజాగదిలో నెయ్యి దీపం వెలిగించి, తూర్పు ముఖంగా కూర్చుని 108 సార్లు 'ఓం నమః శివాయ' జపించండి. ఇది మానసిక ఉత్సాహం, ధనాత్మక శక్తి మరియు సర్వ గ్రహ అనుకూలతను కలిగిస్తుంది.",
        ta: "தினமும் காலையில் குளித்தபின் பூஜை அறையில் நெய் தீபம் ஏற்றி, கிழக்கு நோக்கி அமர்ந்து 108 முறை 'ஓம் நம சிவாய' ஜபிக்கவும். இது மன உற்சாகம், நேர்மறை ஆற்றல் மற்றும் கிரக தோஷ நிவர்த்தி தரும்.",
        en: "Every morning after bath, light a pure ghee lamp facing East and chant 108 times 'Om Namah Shivaya'. This attracts radiant solar vital energy, mental clarity, and dissolves daily planetary obstacles."
      }
    },
    {
      title: { kn: "🥛 ಸೋಮವಾರ ಕ್ಷೀರಾಭಿಷೇಕ", hi: "🥛 सोमवार दुग्धाभिषेक", te: "🥛 సోమవారం క్షీరాభిషేకం", ta: "🥛 திங்கள்கிழமை பாலாபிஷேகம்", en: "🥛 Monday Milk Archana" },
      desc: {
        kn: "ಪ್ರತಿ ಸೋಮವಾರ ಅಥವಾ ಪ್ರದೋಷ ತಿಥಿಯಂದು ಶಿವಲಿಂಗಕ್ಕೆ ಶುದ್ಧ ಹಾಲಿನ ಅಭಿಷೇಕ ಮಾಡಿಸಿ ಬಿಲ್ವಪತ್ರೆ ಸಮರ್ಪಿಸುವುದು. ಇದರಿಂದ ಚಂದ್ರ ದೋಷ ಶಮನವಾಗಿ ಮನಃಶಾಂತಿ, ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದ ಹಾಗೂ ಉತ್ತಮ ರೋಗನಿರೋಧಕ ಆರೋಗ್ಯ ಸಿದ್ಧಿಸುತ್ತದೆ.",
        hi: "प्रत्येक सोमवार या प्रदोष तिथि को शिवलिंग पर शुद्ध दूध से अभिषेक कर बिल्वपत्र अर्पित करें। इससे चंद्र दोष शांत होकर मानसिक शांति, पारिवारिक सौहार्द और उत्तम स्वास्थ्य प्राप्त होता है।",
        te: "ప్రతి సోమవారం లేదా ప్రదోష తిథినాడు శివలింగానికి పాలుతో అభిషేకం చేసి బిల్వపత్రం సమర్పించండి. దీనివలన చంద్ర దోషం శమించి మనఃశాంతి, కుటుంబ సౌఖ్యం మరియు ఆరోగ్యం లభిస్తాయి.",
        ta: "ஒவ்வொரு திங்கள்கிழமை அல்லது பிரதோஷ திதியில் சிவலிங்கத்திற்கு பாலாபிஷேகம் செய்து வில்வபத்திரம் சாற்றவும். இதனால் சந்திர தோஷம் நீங்கி மன அமைதியும் குடும்ப யோகமும் ஆரோக்கியமும் கிட்டும்.",
        en: "Offering pure milk abhishekam and fresh Bilva leaves to Lord Shiva on Mondays or Pradosha tithi alleviates lunar mind distress, bestowing emotional peace, domestic warmth, and robust health."
      }
    },
    {
      title: { kn: "🌾 ಗೋಸೇವೆ ಹಾಗೂ ಅನ್ನದಾನ", hi: "🌾 गोसेवा एवं अन्नदान", te: "🌾 గోసేవ మరియు అన్నదానం", ta: "🌾 பசு சேவை மற்றும் அன்னதானம்", en: "🌾 Cow Service & Charity" },
      desc: {
        kn: "ಪ್ರತಿ ಶನಿವಾರ ಅಥವಾ ಏಕಾದಶಿಯ ದಿನದಂದು ದೇಶಿಯ ಗೋವುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು ನೀಡುವುದು ಮತ್ತು ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡುವುದು. ಇದು ಪಿತೃ ದೋಷ, ಕುಜ ದೋಷ ಹಾಗೂ ನಿವಾರಿಸಲಾಗದ ಗ್ರಹ ಪೀಡೆಗಳನ್ನು ಸಂಪೂರ್ಣ ಶಾಂತಿಗೊಳಿಸುತ್ತದೆ.",
        hi: "प्रत्येक शनिवार या एकादशी को देसी गायों को हरा चारा खिलाएं तथा निर्धनों को अन्नदान करें। यह पितृ दोष, कुज दोष तथा कठिन ग्रह बाधाओं को पूर्णतः शांत करता है।",
        te: "ప్రతి శనివారం లేదా ఏకాదశి నాడు ఆవులకు పచ్చగడ్డి తినిపించడం మరియు పేదలకు అన్నదానం చేయడం చేయండి. ఇది పితృ దోషం, కుజ దోషం మరియు తీవ్ర గ్రహ పీడలను తొలగిస్తుంది.",
        ta: "ஒவ்வொரு சனிக்கிழமை அல்லது ஏகாதசியன்று பசுக்களுக்கு அகத்திக்கீரை வழங்குவதும் எளியோர்க்கு அன்னதானமும் செய்வது பித்ரு தோஷம், குஜ தோஷம் மற்றும் தீராத கிரக பிணிகளை நீக்கும்.",
        en: "Feeding fresh green fodder to indigenous cows on Saturdays or Ekadashi and supporting food charity neutralizes severe Pitru (ancestral) karmas, Mars afflictions, and chronic financial strains."
      }
    },
    {
      title: { kn: "📿 ಜನ್ಮ ನಕ್ಷತ್ರ ಮಂತ್ರ ಸಂಕಲ್ಪ", hi: "📿 जन्म नक्षत्र मंत्र संकल्प", te: "📿 జన్మ నక్షత్ర మంత్ర సంకల్పం", ta: "📿 ஜன்ம நட்சத்திர மந்திர சங்கல்பம்", en: "📿 Nakshatra Beeja Discipline" },
      desc: {
        kn: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಅಧಿಪತಿ ಗ್ರಹದ ಮೂಲ ಬೀಜಮಂತ್ರವನ್ನು ಪ್ರತಿದಿನ 108 ಬಾರಿ ನಿಷ್ಠೆಯಿಂದ ಜಪಿಸುವುದು. ಇದು ನಿಮ್ಮ ಕಾರ್ಯ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹತ್ತರ ಯಶಸ್ಸು, ಶತ್ರು ಜಯ ಹಾಗೂ ಅಪಾರ ಯಶಸ್ಸನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
        hi: "अपने जन्म नक्षत्र के स्वामी ग्रह के मूल बीज मंत्र का प्रतिदिन 108 बार निष्ठापूर्वक जाप करें। यह आपके कार्यक्षेत्र में महान सफलता, शत्रु विजय और निरंतर उन्नति प्रदान करता है।",
        te: "మీ జన్మ నಕ್ಷత్రాధిపతి గ్రహ మూల బీజమంత్రాన్ని ప్రతిరోజూ 108 సార్లు నిష్ఠతో జపించండి. ఇది మీ ఉద్యోగ వ్యాపారాలలో గొప్ప విజయం, శత్రు జయం మరియు అభివృద్ధిని ప్రసాదిస్తుంది.",
        ta: "உங்கள் ஜன்ம நட்சத்திர அதிபதியின் பீஜ மந்திரத்தை தினமும் 108 முறை ஜபித்து வரவும். இது தொழில், வியாபாரத்தில் பெரும் வெற்றி, எதிரி ஜெயம் மற்றும் தொடர் முன்னேற்றம் தரும்.",
        en: "Chanting the sacred root beeja mantra of your birth star's ruling planet 108 times daily activates personal talent, ensures professional success, and protects against hidden adversity."
      }
    }
  ];

  const TITHI_TITLE_DICT: L5 = {
    kn: "✦ ಮಾಸಿಕ ಪೂಜಾ ಹಾಗೂ ಸಂಕಲ್ಪ ದಿನಸೂಚಿ ಮಾರ್ಗದರ್ಶಿ ✦",
    hi: "✦ मासिक पूजा एवं संकल्प तिथिसूची मार्गदर्शिका ✦",
    te: "✦ మాసిక పూజా మరియు సంకల్ప దినసూచి మార్గదర్శి ✦",
    ta: "✦ மாதாந்திர பூஜை மற்றும் சங்கல்ப நாட்காட்டி வழிகாட்டி ✦",
    en: "✦ Monthly Auspicious Tithi Worship Guide ✦"
  };

  const TITHI_GUIDE: { name: L5; desc: L5 }[] = [
    {
      name: { kn: "ಪ್ರದೋಷ ಶಿವಾರಾತ್ರಿ", hi: "प्रदोष शिवरात्रि", te: "ప్రదోష శివరాత్రి", ta: "பிரதோஷ சிவராத்திரி", en: "Pradosha Shivaratri" },
      desc: {
        kn: "ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ ಶಿವನಿಗೆ ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ಸಂಜೆಯ ದೀಪಾರಾಧನೆ ಮಾಡುವುದರಿಂದ ಮಾನಸಿಕ ಒತ್ತಡ, ಸಾಲ ಬಾಧೆ ಹಾಗೂ ನಿರಂತರ ಅಡೆತಡೆಗಳು ಸಂಪೂರ್ಣ ಶಮನಗೊಳ್ಳುತ್ತವೆ.",
        hi: "प्रदोष काल में शिवजी को बिल्वार्चन तथा सायं दीपाराधन करने से मानसिक तनाव, ऋण बाधा तथा निरंतर रुकावटें पूर्णतः शांत होती हैं।",
        te: "ప్రదోష కాలంలో శివునికి బిల్వార్చన మరియు సాయంత్రం దీపారాధన చేయడం వలన మానసిక ఒత్తిడి, అప్పుల బాధలు మరియు అడ్డంకులు తొలగిపోతాయి.",
        ta: "பிரதோஷ காலத்தில் சிவனுக்கு வில்வார்ச்சனையும் மாலை தீபாராதனையும் செய்வது மன அழுத்தம், கடன் தொல்லை மற்றும் தடைகளை முற்றுமாக நீக்கும்.",
        en: "Worshipping Shiva with Bilva leaves during evening Pradosha window eliminates anxiety, financial debt burdens, and recurring setbacks."
      }
    },
    {
      name: { kn: "ಸಂಕಷ್ಟ ಚತುರ್ಥಿ", hi: "संकष्टी चतुर्थी", te: "సంకష్ట చతుర్థి", ta: "சங்கடஹர சதுர்த்தி", en: "Sankashti Chaturthi" },
      desc: {
        kn: "ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿಯಂದು ಗಣಪತಿಗೆ ದೂರ್ವಾ (ಗರಿಕೆ) ಅರ್ಚನೆ ಮಾಡುವುದರಿಂದ ವ್ಯಾಪಾರ, ಉದ್ಯೋಗ ಹಾಗೂ ನೂತನ ಕಾರ್ಯಗಳಲ್ಲಿ ಎದುರಾಗುವ ಸಕಲ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ.",
        hi: "संकष्टी चतुर्थी पर गणपति को दुर्वा (दूब) अर्पित करने से व्यापार, नौकरी तथा नए कार्यों में आने वाले समस्त विघ्न दूर होते हैं।",
        te: "సంకష్ట చతుర్థి నాడు గణపతికి దూర్వా (గరికే) అర్చన చేయడం వలన వ్యాపారం, ఉద్యోగం మరియు నూతన కార్యములలో విఘ్నాలు తొలగిపోతాయి.",
        ta: "சங்கடஹர சதுர்த்தியன்று கணபதிக்கு அருகம்புல் அர்ச்சனை செய்வது வியாபாரம், வேலை மற்றும் புதிய காரியங்களில் வரும் விக்னங்களை அகற்றும்.",
        en: "Offering Durva grass to Lord Ganesha on Sankashti Chaturthi clears career roadblocks, business hindrances, and ensures project victory."
      }
    },
    {
      name: { kn: "ಏಕಾದಶಿ ವ್ರತ", hi: "एकादशी व्रत", te: "ఏకాదశి వ్రతం", ta: "ஏகாதசி விரதம்", en: "Ekadashi Vrata" },
      desc: {
        kn: "ಏಕಾದಶಿಯಂದು ಉಪವಾಸವಿದ್ದು ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸುವುದರಿಂದ ಶರೀರ ಶೋಧನೆ, ದೀರ್ಘ ಆಯುಷ್ಯ, ಕೌಟುಂಬಿಕ ಸುಖ ಹಾಗೂ ಅಖಂಡ ಲಕ್ಷ್ಮೀ ಕೃಪೆ ಲಭಿಸುತ್ತದೆ.",
        hi: "एकादशी पर उपवास रखकर विष्णु सहस्रनाम पाठ करने से शरीर शुद्धि, दीर्घ आयु, पारिवारिक सुख तथा अखंड लक्ष्मी कृपा प्राप्त होती है।",
        te: "ఏకాదశి నాడు ఉపవాసముండి విష్ణు సహస్రనామం పఠించడం వలన శరీర శుద్ధి, ఆయుష్షు, కుటుంబ సౌఖ్యం మరియు లక్ష్మీ కటాక్షం లభిస్తాయి.",
        ta: "ஏகாதசியன்று உபவாசம் இருந்து விஷ்ணு சகஸ்ரநாமம் ஜபிப்பது உடல் சுத்தி, நீண்ட ஆயுள், குடும்ப சுகம் மற்றும் அஷ்டலக்ஷ்மி கடாட்சம் தரும்.",
        en: "Observing sacred Ekadashi fast and reciting Vishnu Sahasranama purifies bio-energies, grants longevity, and stabilizes household wealth."
      }
    },
    {
      name: { kn: "ಹುಣ್ಣಿಮೆ / ಅಮಾವಾಸ್ಯೆ", hi: "पूर्णिमा / अमावस्या", te: "పౌర్ణమి / అమావాస్య", ta: "பௌர்ணமி / அமாவாசை", en: "Purnima / Amavasya" },
      desc: {
        kn: "ಹುಣ್ಣಿಮೆಯಂದು ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ ಹಾಗೂ ಅಮಾವಾಸ್ಯೆಯಂದು ಪಿತೃ ತರ್ಪಣ, ಗ್ರಹ ಶಾಂತಿ ಮತ್ತು ಗೋಕರ್ಣ ಆತ್ಮಾಲಿಂಗ ಸ್ಮರಣೆಯು ಮನೆಗೆ ದಿವ್ಯ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.",
        hi: "पूर्णिमा को सत्यनारायण पूजा तथा अमावस्या को पितृ तर्पण, ग्रह शांति एवं गोकर्ण आत्मालिंग स्मरण घर को दिव्य सुरक्षा प्रदान करता है।",
        te: "పౌర్ణమినాడు సత్యనారాయణ పూజ మరియు అమావాస్య నాడు పితృ తర్పణం, గ్రహ శాంతి, ఆత్మలింగ స్మరణ ఇంట దివ్య రక్షణను ఇస్తాయి.",
        ta: "பௌர்ணமியில் சத்தியநாராயண பூஜையும் அமாவாசையில் பித்ரு தர்பணம், கிரக சாந்தியும் செய்வது குடும்பத்திற்கு திவ்ய பாதுகாப்பு தரும்.",
        en: "Performing Satyanarayan Pooja on Purnima and Ancestral Tarpanam / Graha Shanti on Amavasya invokes powerful family lineage protection."
      }
    }
  ];

  const KSHETRA_TITLE_DICT: L5 = {
    kn: "✦ ಗೋಕರ್ಣ ಆತ್ಮಾಲಿಂಗ ದರ್ಶನ ಹಾಗೂ ಯಾತ್ರಾ ನಿಯಮಗಳು ✦",
    hi: "✦ गोकर्ण आत्मालिंग दर्शन एवं यात्रा नियम ✦",
    te: "✦ గోకర్ణ ఆత్మలింగ దర్శనం మరియు యాత్రా నియమాలు ✦",
    ta: "✦ கோகர்ண ஆத்மலிங்க தரிசனம் மற்றும் யாத்திரை விதிகள் ✦",
    en: "✦ Gokarna Kshetra Pilgrimage & Darshana Guidelines ✦"
  };

  const KSHETRA_RULES: { title: L5; desc: L5 }[] = [
    {
      title: { kn: "🌿 ಶಂಖ ಹಾಗೂ ಕೋಟಿ ತೀರ್ಥ ಸ್ನಾನ", hi: "🌿 शंख एवं कोटि तीर्थ स्नान", te: "🌿 శంఖ మరియు కోటి తీర్థ స్నానం", ta: "🌿 சங்கு & கோடி தீர்த்த ஸ்நானம்", en: "🌿 Sacred Teertha Ablution" },
      desc: {
        kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರವೇಶದ ನಂತರ ಮಹಾಬಲೇಶ್ವರ ದರ್ಶನಕ್ಕೆ ಮುನ್ನ ಕೋಟಿ ತೀರ್ಥದಲ್ಲಿ ಅಥವಾ ಸಮುದ್ರ ಸ್ನಾನ ಮಾಡಿ ಪವಿತ್ರ ಜಲದಲ್ಲಿ ಆಚಮನ ಮಾಡುವುದು ಕಾಯಿಕ ಹಾಗೂ ಮಾನಸಿಕ ಶುದ್ಧಿಗೆ ಅತ್ಯಗತ್ಯ.",
        hi: "गोकर्ण क्षेत्र प्रवेश के पश्चात महाबलेश्वर दर्शन से पूर्व कोटि तीर्थ या समुद्र स्नान कर पवित्र जल से आचमन करना कायिक एवं मानसिक शुद्धि के लिए अनिवार्य है।",
        te: "గోకర్ణ క్షేత్ర ప్రవేశం తర్వాత మహాబలేశ్వర దర్శనానికి ముందు కోటి తీర్థంలో లేదా సముద్ర స్నానం చేసి ఆచమనం చేయడం శారీరక, మానసిక శుద్ధికి ముఖ్యం.",
        ta: "கோகர்ண க்ஷேத்திர பிரவேசத்திற்கு பின் தரிசனத்திற்கு முன் கோடி தீர்த்தம் அல்லது கடலில் ஸ்நானம் செய்து ஆசமனம் செய்வது உடல், மன சுத்திக்கு அவசியம்.",
        en: "Upon entering Gokarna Kshetra, take sacred immersion at Koti Teertha or Ocean followed by holy Achamana to purify physical and subtle aura before Darshana."
      }
    },
    {
      title: { kn: "🕉️ ಆತ್ಮಾಲಿಂಗ ಸ್ಪರ್ಶ ಮರ್ಯಾದೆ", hi: "🕉️ आत्मालिंग स्पर्श मर्यादा", te: "🕉️ ఆత్మలింగ స్పర్శ మర్యాద", ta: "🕉️ ஆத்மலிங்க ஸ்பர்ச மரியாதை", en: "🕉️ Atmalinga Touch Reverence" },
      desc: {
        kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರತ್ಯಕ್ಷ ಆತ್ಮಾಲಿಂಗ ಸ್ಪರ್ಶ ಮಾಡುವಾಗ ಅತ್ಯಂತ ನಿಷ್ಠೆ, ಶುದ್ಧ ವಸ್ತ್ರ, ಸಾತ್ವಿಕ ಭಾವ ಹಾಗೂ ಸ್ವ-ಗೋತ್ರ ಸಂಕಲ್ಪದಿಂದ ಪೂಜಿಸಿ ಶಿವ ಕೃಪೆಗೆ ಪಾತ್ರರಾಗಬೇಕು.",
        hi: "श्री महाबलेश्वर प्रत्यक्ष आत्मालिंग का स्पर्श करते समय परम निष्ठा, पवित्र वस्त्र, सात्विक भाव और गोत्र संकल्प से पूजन कर शिव कृपा प्राप्त करें।",
        te: "శ్రీ మహాబలేశ్వర ప్రత్యక్ష ఆత్మలింగ స్పర్శ చేసేటప్పుడు అత్యంత నిష్ఠ, శౌచం, సాత్విక భావం మరియు స్వగోత్ర సంకల్పంతో పూజించి శివానుగ్రహం పొందాలి.",
        ta: "ஸ்ரீ மகாபலேஸ்வர ஆத்மலிங்க ஸ்பர்சம் செய்யும்போது மிகுந்த பக்தி, தூய ஆடை, சாத்விக பாவம் மற்றும் கோத்ர சங்கல்பத்துடன் பூஜிக்க வேண்டும்.",
        en: "When reverently touching Lord Shiva's original Atmalinga at Gokarna, offer heart-felt prayers with clean attire, Gotra sankalpa, and pure devotion."
      }
    },
    {
      title: { kn: "🌺 ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ರುದ್ರಾಭಿಷೇಕ", hi: "🌺 बिल्वार्चन एवं रुद्राभिषेक", te: "🌺 బిల్వార్చన మరియు రుద్రాభిషేకం", ta: "🌺 பில்வார்ச்சனை மற்றும் ருத்ராபிஷேகம்", en: "🌺 Bilva & Rudrabhishekam" },
      desc: {
        kn: "ತ್ರಿಪತ್ರ ಬಿಲ್ವಪತ್ರೆಯಿಂದ ಅಷ್ಟೋತ್ತರ ಅರ್ಚನೆ ಹಾಗೂ ಪಂಚಾಮೃತ ಸಮೇತ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದರಿಂದ ಸಮಸ್ತ ಜನ್ಮಾಂತರ ಪಾಪಗಳು ಕ್ಷಯವಾಗಿ ಸಂಸಾರ ಸುಖ ಲಭಿಸುತ್ತದೆ.",
        hi: "त्रिदल बिल्वपत्र से अष्टोत्तर अर्चन तथा पंचामृत सहित महा रुद्राभिषेक कराने से समस्त जन्मांतर पाप नष्ट होकर संसार सुख प्राप्त होता है।",
        te: "త్రిపత్ర బిల్వపత్రంతో అష్టోత్తర అర్చన మరియు పంచామృత రుద్రాభిషేకం చేయించడం వలన సర్వ పాపాలు నశించి కుటుంబ సౌఖ్యం సిద్ధిస్తుంది.",
        ta: "முப்பத்திர பில்வபத்திரத்தால் அஷ்டோத்தர அர்ச்சனையும் பஞ்சாமிர்த ருத்ராபிஷேகமும் செய்வது ஜென்மாந்தர பாவங்களை நீக்கி குடும்ப யோகம் தரும்.",
        en: "Sponsoring Ashtottara Bilvarchana and Panchamrita Mahabhishekam at Gokarna dissolves accumulated karmic heavy debts and brings lifelong prosperity."
      }
    }
  ];

  const STOTRA_TITLE_DICT: L5 = {
    kn: "✦ ಚತುರ್ಕಾಲ ಧಾರ್ಮಿಕ ಸ್ತೋತ್ರ ಜಪ ಹಾಗೂ ನಿತ್ಯ ದೇವತಾ ಪ್ರಾರ್ಥನೆ ✦",
    hi: "✦ चतुष्काल धार्मिक स्तोत्र जप एवं नित्य देवता प्रार्थना ✦",
    te: "✦ చతుర్కాల ధార్మిక స్తోత్ర జపం మరియు నిత్య దేవతా ప్రార్థన ✦",
    ta: "✦ நாற்கால ஆன்மீக தோத்திர ஜபமும் நித்ய தேவதா பிரார்த்தனையும் ✦",
    en: "✦ 4-Time Daily Stotra Recitation & Sacred Deity Discipline ✦"
  };

  const STOTRA_LIST: { title: L5; desc: L5 }[] = [
    {
      title: { kn: "🌅 ಪ್ರಾತಃಕಾಲ: ಶಿವ ಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರ", hi: "🌅 प्रातःकाल: शिव पंचाक्षरी स्तोत्र", te: "🌅 ప్రాతఃకాలం: శివ పంచాక్షరీ స్తోత్రం", ta: "🌅 காலை: சிவ பஞ்சாட்சரி தோத்திரம்", en: "🌅 Morning: Shiva Panchakshari Stotra" },
      desc: {
        kn: "ಉದಯಕಾಲದಲ್ಲಿ 'ನಾಮಃ ಶಿವಾಯ' ಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರವನ್ನು ೧೧ ಬಾರಿ ಪಠಿಸುವುದರಿಂದ ಇಡೀ ದಿನ ಮನಸ್ಸಿನಲ್ಲಿ ಉಲ್ಲಾಸ, ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಧೈರ್ಯ ಹಾಗೂ ಆತ್ಮಾಭಿಮಾನ ಹೆಚ್ಚುತ್ತದೆ.",
        hi: "प्रातःकाल में 'नमः शिवाय' पंचाक्षरी स्तोत्र का ११ बार पाठ करने से दिनभर मन में उत्साह, कार्यक्षेत्र में धैर्य एवं आत्मविश्वास बढ़ता है।",
        te: "ఉదయం 'నమః శివాయ' పంచాక్షరీ స్తోత్రమును 11 సార్లు పఠించడం వలన రోజంతా మనస్సులో ఉత్సాహం, ధైర్యం మరియు ఆత్మవిశ్వాసం పెరుగుతాయి.",
        ta: "காலையில் 'நம சிவாய' பஞ்சாட்சரி தோத்திரத்தை 11 முறை ஜபிப்பது நாள் முழுவதும் மன அமைதி, தைரியம் மற்றும் தன்னம்பிக்கை தரும்.",
        en: "Reciting Shiva Panchakshari Stotra 11 times at dawn fills your mind with invincible courage, positive focus, and radiant vitality throughout the day."
      }
    },
    {
      title: { kn: "☀️ ಮಧ್ಯಾಹ್ನ: ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಸ್ಮರಣೆ", hi: "☀️ मध्याह्न: विष्णु सहस्रनाम स्मरण", te: "☀️ మధ్యాహ్నం: విష్ణు సహస్రనామ స్మరణ", ta: "☀️ நண்பகல்: விஷ்ணு சகஸ்ரநாம ஸ்மரணம்", en: "☀️ Noon: Vishnu Sahasranama Remembrances" },
      desc: {
        kn: "ಮಧ್ಯಾಹ್ನದ ಸಮಯ ಅಥವಾ ಆಹಾರ ನೈವೇದ್ಯಕ್ಕೆ ಮುನ್ನ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಅಥವಾ ಗಾಯತ್ರಿ ಧ್ಯಾನ ಮಾಡುವುದರಿಂದ ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ, ಸದ್ಬುದ್ಧಿ ಹಾಗೂ ವ್ಯಾಪಾರ ವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
        hi: "मध्याह्न काल या भोजन से पूर्व विष्णु सहस्रनाम या गायत्री ध्यान करने से आर्थिक समृद्धि, सद्बुद्धि एवं व्यापार में निरंतर वृद्धि होती है।",
        te: "మధ్యాహ్నం లేదా భోజనానికి ముందు విష్ణు సహస్రనామం లేదా గాయత్రీ ధ్యానం చేయడం వలన ఆర్థిక సమృద్ధి, సద్బుద్ధి మరియు వ్యాపార అభివృద్ధి లభిస్తాయి.",
        ta: "நண்பகலில் அல்லது உணவுக்கு முன் விஷ்ணு சகஸ்ரநாமம் அல்லது காயத்ரி தியானம் செய்வது பொருளாதார வளர்ச்சி, நல்புத்தி தரும்.",
        en: "Reciting Vishnu Sahasranama or Gayatri Dhyana around noon magnetizes steady financial influx, sharp intellect, and commercial growth."
      }
    },
    {
      title: { kn: "<ctrl42> ಸಾಯಂಕಾಲ: ಪ್ರದೋಷ ದೀಪಾರಾಧನೆ", hi: "<ctrl42> सायं: प्रदोष दीपाराधन एवं जप", te: "<ctrl42> సాయంత్రం: ప్రదోష దీపారాధన", ta: "<ctrl42> மாலை: பிரதோஷ தீபாராதனை", en: "<ctrl42> Evening: Pradosha Lamp & Mantra" },
      desc: {
        kn: "ಸೂರ್ಯಾಸ್ತಮಯದ ನಂತರ ಮನೆಯ ದೇವರ ಮನೆಯಲ್ಲಿ ದೀಪ ಬೆಳಗಿಸಿ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಿಸುವುದು ಕೌಟುಂಬಿಕ ದೋಷಗಳನ್ನು ನಿವಾರಿಸಿ ದಿವ್ಯ ಕವಚವನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.",
        hi: "सूर्यास्त के पश्चात पूजा घर में दीपक जलाकर मृत्युंजय मंत्र का पाठ करने से पारिवारिक दोष दूर होते हैं तथा दिव्य सुरक्षा कवच बनता है।",
        te: "సాయంత్రం పూజాగదిలో దీపం వెలిగించి మృత్యుంజయ మంత్రం జపించడం వలన కుటుంబ దోషాలు తొలగి ఇంట దివ్య కవచం ఏర్పడుతుంది.",
        ta: "மாலையில் பூஜை அறையில் தீபம் ஏற்றி மிருத்யுஞ்சய மந்திரம் ஜபிப்பது குடும்ப தோஷங்களை அகற்றி திவ்ய பாதுகாப்பு கவசம் அமைக்கும்.",
        en: "Lighting an evening oil lamp and chanting Maha Mrityunjaya Mantra establishes a protective spiritual aura shielding your home against negativity."
      }
    },
    {
      title: { kn: "🌙 ರಾತ್ರಿ: ಕ್ಷಮಾ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಶಾಂತಿ", hi: "🌙 रात्रि: क्षमा प्रार्थना एवं शांति", te: "🌙 రాత్రి: క్షమా ప్రార్థన మరియు శాంతి", ta: "🌙 இரவு: க்ஷமா பிரார்த்தனை & அமைதி", en: "🌙 Night: Peace & Forgiveness Prayer" },
      desc: {
        kn: "ನಿಿದ್ರೆಗಿಂತ ಮುನ್ನ ಗೋಕರ್ಣ ಆತ್ಮಾಲಿಂಗವನ್ನು ಸ್ಮರಿಸಿ 'ಶಂಭೋ ಮಹಾದೇವ' ಎಂದು ೯ ಬಾರಿ ಜಪಿಸುವುದು ಪ್ರಶಾಂತ ನಿದ್ರೆ ಹಾಗೂ ದಿವ್ಯ ಸ್ವಪ್ನ ಶಾಂತಿಯನ್ನು ನೀಡುತ್ತದೆ.",
        hi: "शयन से पूर्व गोकर्ण आत्मालिंग का स्मरण कर 'शंभो महादेव' ९ बार बोलने से शांतिदायक निद्रा एवं दुःस्वप्न निवारण होता है।",
        te: "నిద్రకు ముందు గోకర్ణ ఆత్మలింగాన్ని స్మరించి 'శంభో మహాదేవ' అని 9 సార్లు జపించడం ప్రశాంత నిద్రను, దుస్వప్న నివారణను ఇస్తుంది.",
        ta: "இரவில் உறங்கும் முன் கோகர்ண ஆத்மலிங்கத்தை ஸ்மரித்து 'சம்போ மகாதேவா' என 9 முறை ஜபிப்பது நிம்மதியான தூக்கமும் மன அமைதியும் தரும்.",
        en: "Before retiring at night, remembering Gokarna Atmalinga and mentally whispering 'Shambho Mahadeva' 9 times induces deep restful sleep and peace."
      }
    }
  ];

  const MANTHRA_DESC_DICT: L5 = {
    kn: "ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಣವು ನಿಮ್ಮ ಹಾಗೂ ನಿಮ್ಮ ಸಕಲ ಕೌಟುಂಬಿಕ ಸದಸ್ಯರ ಆಯುಷ್ಯ, ನಿರೋಗಿ ಆರೋಗ್ಯ, ಶತ್ರು ಭಯ ನಿವಾರಣೆ ಹಾಗೂ ರಕ್ಷಣೆಗೆ ದಿವ್ಯ ಶಿವ ಕವಚವಾಗಿದೆ.",
    hi: "महामृत्युंजय मंत्र का पाठ आपके और आपके समस्त परिवार के लिए आयु, आरोग्य, भय निवारण और सुरक्षा का दिव्य शिव कवच है।",
    te: "మహా మృత్యుంజయ మంత్ర జపం మీ మరియు మీ కుటుంబ సభ్యుల ఆయుష్షు, నిరోగి ఆరోగ్యం, భయ నివారణ మరియు రక్షణకు దివ్య శివ కవచం.",
    ta: "மகா மிருத்யுஞ்சய மந்திர ஜபம் உங்கள் குடும்பத்தின் ஆயுள், ஆரோக்கியம், பய நிவர்த்தி மற்றும் பாதுகாப்புக்கு திவ்ய சிவ கவசம்.",
    en: "Reciting the sacred Maha Mrityunjaya Mantra serves as an invincible cosmic armor shielding your family with supreme health, longevity, and divine resilience."
  };

  const SANKALPA_TITLE_DICT: L5 = {
    kn: "✦ ನಿತ್ಯ ಪೂಜಾ ಸಂಕಲ್ಪ ಹಾಗೂ ಗ್ರಹ ಶಮನ ಜಪ ವಿಧಾನ ✦",
    hi: "✦ नित्य पूजा संकल्प एवं ग्रह शांति जप विधान ✦",
    te: "✦ నిత్య పూజా సంకల్పం మరియు గ్రహ శాంతి జప విధానం ✦",
    ta: "✦ நித்ய பூஜை சங்கல்பம் மற்றும் கிரக சாந்தி ஜப முறை ✦",
    en: "✦ Sacred Daily Pooja Sankalpa & Navagraha Shanti Guide ✦"
  };

  const SANKALPA_DESC_DICT: L5 = {
    kn: "ಪ್ರತಿದಿನ ಸಂಜೆ ಮನೆಯ ದೇವರ ಮನೆಯಲ್ಲಿ ಈಶ್ವರ ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರ ದೇವತೆಯನ್ನು ಸ್ಮರಿಸಿ ಶುದ್ಧ ಜಲದಿಂದ ಅರ್ಘ್ಯ ನೀಡುವುದು, ಧೂಪ-ದೀಪ ಬೆಳಗುವುದು ಮತ್ತು 108 ಬಾರಿ ಮೂಲಮಂತ್ರ ಪಠಿಸುವುದು ಸಮಸ್ತ ಕುಟುಂಬಕ್ಕೆ ಸುಕ್ಷೇಮ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಆಯುಷ್ಯ ವೃದ್ಧಿಯನ್ನು ತರುತ್ತದೆ.",
    hi: "प्रतिदिन सायं पूजा घर में भगवान शिव एवं जन्म नक्षत्र देवता का स्मरण कर जल से अर्घ्य दें, धूप-दीप जलाएं तथा 108 बार मूल मंत्र का पाठ करें। यह समस्त परिवार को सुख-समृद्धि, आर्थिक स्थिरता एवं दीर्घायु प्रदान करता है।",
    te: "ప్రతిరోజూ సాయంత్రం పూజాగదిలో ఈశ్వరుని మరియు జన్మ నక్షత్ర దేవతను స్మరించి అర్ఘ్యం ఇవ్వడం, ధూప-దీపాలు వెలిగించి 108 సార్లు మూలమంత్రం జపించడం కుటుంబానికి శుభం, ఆర్థిక స్థిరత్వం ఇస్తుంది.",
    ta: "தினமும் மாலையில் பூஜை அறையில் ஈஸ்வரனையும் நட்சத்திர தேவதையையும் ஸ்மரித்து அர்க்யம் கொடுத்து, தூப-தீபம் ஏற்றி 108 முறை மூலமந்திரம் ஜபிப்பது குடும்பத்திற்கு க்ஷேமமும் பொருளாதார ஸ்திரத்தன்மையும் தரும்.",
    en: "Offering daily evening Arghya, lighting dhoopa-deepa, and chanting 108 times the planetary beeja mantra brings enduring prosperity, financial stability, protection, and mental serenity."
  };

  const ARCHAKA_HEADER_DICT: L5 = {
    kn: "✦ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ ಅರ್ಚಕ ನೇರ ಸಂಪರ್ಕ ಹಾಗೂ ಪ್ರಸಾದ ಸೇವೆ ✦",
    hi: "✦ गोकर्ण महाबलेश्वर क्षेत्र अर्चक प्रत्यक्ष संपर्क एवं प्रसाद सेवा ✦",
    te: "✦ గోకర్ణ మహాబలేశ్వర క్షేత్ర అర్చక నేర సంపర్కం మరియు ప్రసాద సేవ ✦",
    ta: "✦ கோகர்ண மகாபலேஸ்வர க்ஷேத்திர அர்ச்சகர் நேரிடை தொடர்பு மற்றும் பிரசாத சேவை ✦",
    en: "✦ Gokarna Kshetra Archaka Direct Contact & Seva Assistance ✦"
  };

  const ARCHAKA_ROLE_DICT: L5 = {
    kn: "ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ",
    hi: "मुख्य अर्चक, गोकर्ण महाबलेश्वर क्षेत्र",
    te: "ముఖ్య అర్చకులు, గోకర్ణ మహాబలేశ్వర క్షేత్రం",
    ta: "முதன்மை அர்ச்சகர், கோகர்ண மகாபலேஸ்வர க்ஷேத்திரம்",
    en: "Chief Archaka, Gokarna Mahabaleshwara Kshetra"
  };

  const ARCHAKA_DESC_DICT: L5 = {
    kn: "ವಿಶೇಷ ಗೋತ್ರ ಸಂಕಲ್ಪ ಸೇವೆ, ಮಹಾಪೂಜೆ, ನವಗ್ರಹ ದೋಷ ಶಾಂತಿ ಹಾಗೂ ಗೋಕರ್ಣ ಪ್ರಸಾದವನ್ನು ಮನೆಗೆ ತಲುಪಿಸಲು ಅರ್ಚಕರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಬಹುದು. ವರ್ಷದ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ವಿಶೇಷ ಸಂಕಲ್ಪ ಪೂಜೆ ಕಾಯ್ದಿರಿಸಬಹುದು.",
    hi: "विशेष गोत्र संकल्प सेवा, महापूजा, नवग्रह दोष शांति तथा गोकर्ण प्रसाद घर मंगाने हेतु अर्चक से प्रत्यक्ष संपर्क करें। वर्ष में किसी भी समय विशेष संकल्प पूजा बुक कर सकते हैं।",
    te: "విశేష గోత్ర సంకల్ప సేవ, మహాపూజ, నవగ్రహ దోష శాంతి మరియు గోకర్ణ ప్రసాదాన్ని ఇంటికి తెప్పించుకోవడానికి అర్చకులను నేరుగా సంప్రదించవచ్చు. సంవత్సరంలో ఏ సమయంలోనైనా పూజలు బుక్ చేసుకోవచ్చు.",
    ta: "விசேஷ கோத்ர சங்கல்ப சேவை, மகாபூஜை, நவகிரக தோஷ சாந்தி மற்றும் பிரசாதம் பெற அர்ச்சகரை நேரில் தொடர்புகொள்ளலாம். வருடத்தின் எந்த நேரத்திலும் விசேஷ சங்கல்ப பூஜைகளை முன்பதிவு செய்யலாம்.",
    en: "For special Gotra Sankalpa Seva, Mahapooja, Navagraha Shanti, and doorstep home delivery of Mahabaleshwara Sacred Prasada, consult the Archaka directly at any time of the year."
  };

  return (
    <div className="pdf-page" style={pageStyle}>
      <div
        style={{
          border: `3px double ${GOLD}`,
          borderRadius: 16,
          padding: "20px 24px",
          minHeight: PAGE_H - 76,
          boxSizing: "border-box",
          backgroundColor: PAPER,
          position: "relative"
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, color: GOLD, letterSpacing: 2 }}>❖</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: INK, marginTop: 2, lineHeight: 1.5 }}>
            {pick(TITLE_DICT, lang)}
          </div>
          <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 3, lineHeight: 1.6, maxWidth: 740, margin: "3px auto 0" }}>
            {pick(SUBTITLE_DICT, lang)}
          </div>
        </div>

        <OrnamentRule />

        {/* Section 1: Devotee Commandments */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 7, textTransform: "uppercase", textAlign: "center" }}>
            {pick(RULES_TITLE_DICT, lang)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {RULES_LIST.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  border: `1.5px solid ${GOLD_LIGHT}`,
                  borderRadius: 9,
                  backgroundColor: PANEL,
                  padding: "10px 14px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 4, lineHeight: 1.4 }}>
                  {pick(rule.title, lang)}
                </div>
                <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.65 }}>
                  {pick(rule.desc, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Monthly Tithi Guide */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 7, textTransform: "uppercase", textAlign: "center" }}>
            {pick(TITHI_TITLE_DICT, lang)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {TITHI_GUIDE.map((tg, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 9,
                  backgroundColor: "#FFFFFF",
                  padding: "9px 8px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, lineHeight: 1.4 }}>{pick(tg.name, lang)}</div>
                <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 3, lineHeight: 1.6 }}>
                  {pick(tg.desc, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Gokarna Kshetra Darshana Rules */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 7, textTransform: "uppercase", textAlign: "center" }}>
            {pick(KSHETRA_TITLE_DICT, lang)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
            {KSHETRA_RULES.map((kr, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 9,
                  backgroundColor: PANEL,
                  padding: "9px 12px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, marginBottom: 3, lineHeight: 1.4 }}>
                  {pick(kr.title, lang)}
                </div>
                <div style={{ fontSize: 10, color: INK_SOFT, lineHeight: 1.6 }}>
                  {pick(kr.desc, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: 4-Time Daily Stotra Recitation Guide */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 7, textTransform: "uppercase", textAlign: "center" }}>
            {pick(STOTRA_TITLE_DICT, lang)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {STOTRA_LIST.map((st, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 9,
                  backgroundColor: "#FFFFFF",
                  padding: "9px 12px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, marginBottom: 3, lineHeight: 1.4 }}>
                  {pick(st.title, lang)}
                </div>
                <div style={{ fontSize: 10, color: INK_SOFT, lineHeight: 1.6 }}>
                  {pick(st.desc, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Maha Mrityunjaya & Gotra Blessing Banner */}
        <div
          style={{
            marginTop: 12,
            backgroundColor: "#FFFFFF",
            border: `1.5px solid ${GOLD_LIGHT}`,
            borderRadius: 10,
            padding: "10px 14px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: GOLD, letterSpacing: 1.2, textTransform: "uppercase" }}>
            ॐ ತ್ರಯ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವර්ධನಮ್ | ಉರ್ವಾರಕಮಿವ ಬಂಧನಾನ್ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ||
          </div>
          <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 3, lineHeight: 1.6 }}>
            {pick(MANTHRA_DESC_DICT, lang)}
          </div>
        </div>

        {/* Section 6: Daily Pooja Sankalpa & Shanti Guide */}
        <div
          style={{
            marginTop: 12,
            backgroundColor: PANEL,
            border: `1px solid ${GOLD_LIGHT}`,
            borderRadius: 10,
            padding: "10px 14px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 3 }}>
            {pick(SANKALPA_TITLE_DICT, lang)}
          </div>
          <div style={{ fontSize: 10, color: INK_SOFT, lineHeight: 1.6 }}>
            {pick(SANKALPA_DESC_DICT, lang)}
          </div>
        </div>

        {/* Section 7: Priest Direct Consultation Card & Seal */}
        <div
          style={{
            marginTop: 12,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 11,
            backgroundColor: "#FFFFFF",
            padding: "10px 16px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 3 }}>
            {pick(ARCHAKA_HEADER_DICT, lang)}
          </div>
          <div style={{ fontSize: 11.5, color: INK, fontWeight: 700, marginTop: 1 }}>
            {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"} — {pick(ARCHAKA_ROLE_DICT, lang)}
          </div>
          <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 3, lineHeight: 1.6, maxWidth: 700, margin: "3px auto 0" }}>
            {pick(ARCHAKA_DESC_DICT, lang)}
          </div>
        </div>

        {/* Page Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 36,
            right: 36,
            textAlign: "center",
            fontSize: 9.5,
            color: INK_SOFT
          }}
        >
          {pick(LETTER_L5.signature!, lang)} · 3 / 5
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Sheet 7 — Page 4: Remedial Puja & Family Lineage Protection Sheet (100% Full Page & Larger Fonts)
 * ------------------------------------------------------------------ */

export const SevaRemediesAnnualPrint = ({
  lang,
  identity,
  panditName,
  rhythm
}: {
  lang: string;
  identity: Identity;
  panditName?: string;
  rhythm?: RhythmResult;
}): JSX.Element => {
  const safePanditName = formatPanditName(panditName, lang);

  const TITLE_DICT: L5 = {
    kn: "✦ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮಹಾಪೂಜಾ ಪರಿಹಾರ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಅಭ್ಯುದಯ ರಕ್ಷಾ ಪತ್ರಿಕೆ ✦",
    hi: "✦ गोकर्ण क्षेत्र महापूजा उपचार एवं पारिवारिक अभ्युदय रक्षा पत्र ✦",
    te: "✦ గోకర్ణ క్షేత్ర మహాపూజా నివారణ మరియు కుటుంబ అభ్యుదయ రక్షా పత్రం ✦",
    ta: "✦ கோகர்ண க்ஷேத்திரம் மகாபூஜை பரிகாரம் மற்றும் குடும்ப அபிவிருத்தி ரக்ஷா அட்டை ✦",
    en: "✦ Gokarna Kshetra Sacred Remedial Puja & Family Lineage Protection Sheet ✦"
  };

  const SUBTITLE_DICT: L5 = {
    kn: "೧೨ ಮಾಸಗಳ ಗ್ರಹ ದೋಷ ಶಮನ, ನಾಲ್ಕು ದಿಕ್ಕುಗಳ ವಾಸ್ತು ಧರ್ಮ ಸೂತ್ರಗಳು ಹಾಗೂ ಕುಲದೇವರ ಪಿತೃ ಆಶೀರ್ವಾದ ಮಾರ್ಗದರ್ಶಿ",
    hi: "१२ मासों के ग्रह दोष निवारण, चारों दिशाओं के वास्तु धर्म सूत्र तथा कुलदेवता एवं पितृ आशीर्वाद मार्गदर्शिका",
    te: "໑௨ మాసముల గ్రహ దోష నివారణ, నలుగు దిక్కుల వాస్తు ధర్మ సూత్రాలు మరియు కులదేవత పితృ ఆశీర్వాద మార్గదర్శి",
    ta: "12 மாதங்களின் கிரக தோஷ நிவர்த்தி, நான்கு திசைகளின் வாஸ்து தர்ம சூத்திரங்கள் மற்றும் குலதெய்வ பித்ரு ஆசீர்வாத வழிகாட்டி",
    en: "Comprehensive 12-month planetary remedial cycle, 4-corner domestic Vastu rules, and ancestral lineage peace guidelines"
  };

  const CYCLE_TITLE_DICT: L5 = {
    kn: "✦ ೧೨ ಮಾಸಗಳ ಶ್ರೇಷ್ಠ ಪೂಜಾ ಪರಿಹಾರ ದಿನಸೂಚಿ ✦",
    hi: "✦ १२ मासों की श्रेष्ठ पूजा उपचार तिथिसूची ✦",
    te: "✦ ໑௨ మాసముల శ్రేష్ఠ పూజా నివారణ దినసూచి ✦",
    ta: "✦ 12 மாதங்களின் விசேஷ பூஜை பரிகார நாட்காட்டி ✦",
    en: "✦ 12 Auspicious Monthly Remedial Vrata Cycle ✦"
  };

  const CYCLE_LIST: { title: L5; desc: L5 }[] = [
    {
      title: {
        kn: "🌸 ಚೈತ್ರ - ವೈಶಾಖ: ನವರಾತ್ರಿ ಹಾಗೂ ಸೂರ್ಯ ಆರಾಧನೆ",
        hi: "🌸 चैत्र - वैशाख: नवरात्रि एवं सूर्य आराधना",
        te: "🌸 చైత్ర - వైశాఖ: నవరాత్రి మరియు సూర్య ఆరాధన",
        ta: "🌸 சித்திரை - வைகாசி: நவராத்திரி மற்றும் சூரிய ஆராதனை",
        en: "🌸 Chaitra - Vaisakha: Solar & Navaratri Worship"
      },
      desc: {
        kn: "ಉದ್ಯೋಗಾಭಿವೃದ್ಧಿ, ಹೊಸ ಉದ್ದಿಮೆ ಹಾಗೂ ಶಾರೀರಿಕ ಆರೋಗ್ಯ ವೃದ್ಧಿಗೆ ವಸಂತ ನವರಾತ್ರಿ ಶ್ರೀ ಸೂಕ್ತ ಮಹಾಪೂಜೆ, ಅಕ್ಷಯ ತದಿಗೆ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಸೂರ್ಯಾಭಿಷೇಕ ಸೇವೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.",
        hi: "व्यापार वृद्धि, नए उद्योग तथा शारीरिक आरोग्य हेतु वसंत नवरात्रि श्री सूक्त महापूजा, अक्षय तृतीया एवं महाबलेश्वर सूर्याभिषेक सेवा सर्वश्रेष्ठ है।",
        te: "ఉద్యోగాభివృద్ధి, నూతన వ్యాపారం మరియు ఆరోగ్యం కొరకు వసంత నవరాత్రి శ్రీ సూక్త మహాపూజ, అక్షయ తృతీయ మరియు సూర్యాభిషేకం శ్రేష్ఠం.",
        ta: "தொழில் வளர்ச்சி, புதிய முயற்சி மற்றும் ஆரோக்கியத்திற்கு வசந்த நவராத்திரி ஸ்ரீ சூக்த பூஜையும் அக்ஷய திருதியையும் சூரியாபிஷேகமும் சிறந்தது.",
        en: "Spring Navaratri Sri Sukta Pooja, Akshaya Tritiya, and Surya Abhishekam at Gokarna catalyze professional expansion and vital vitality."
      }
    },
    {
      title: {
        kn: "🌊 ಆಷಾಢ - ಶ್ರಾವಣ: ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನಾಗಬಲಿ ಶಾಂತಿ",
        hi: "🌊 आषाढ़ - श्रावण: रुद्राभिषेक एवं नागबलि शांति",
        te: "🌊 ఆషాఢ - శ్రావణ: రుద్రాభిషేకం మరియు నాగబలి శాంతి",
        ta: "🌊 ஆடி - ஆவணி: ருத்ராபிஷேகம் மற்றும் நாகதோஷ சாந்தி",
        en: "🌊 Ashadha - Shravana: Rudrabhishekam & Serpent Remedies"
      },
      desc: {
        kn: "ಕುಜ ದೋಷ, ಸರ್ಪ (ರಾಹು-ಕೇತು) ದೋಷ ಹಾಗೂ ಸಂತಾನ ತಡೆ ನಿವಾರಣೆಗೆ ಪವಿತ್ರ ಶ್ರಾವಣ ಸೋಮವಾರ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಾಲಿಂಗಕ್ಕೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನಾಗಪ್ರತಿಷ್ಠೆ ಸೇವೆ ಸಿದ್ಧಿಸುತ್ತದೆ.",
        hi: "कुज दोष, सर्प (राहु-केतु) दोष तथा संतान बाधा निवारण हेतु श्रावण सोमवार को महाबलेश्वर आत्मालिंग पर रुद्राभिषेक तथा नागप्रतिष्ठा सेवा कराएं।",
        te: "కుజ దోషం, సర్ప (రాహు-కేతు) దోషం మరియు సంతాన నివారణకు పవిత్ర శ్రావణ సోమవారం మహాబలేశ్వర ఆత్మలింగానికి రుద్రాభిషేకం మరియు నాగప్రతిష్ఠ చేయడం.",
        ta: "செவ்வாய் தோஷம், நாக தோஷம் மற்றும் புத்திர தடையை நீக்க ஆடி/ஆவணி சோமவார ஆத்மலிங்க ருத்ராபிஷேகமும் நாக பிரதிஷ்டையும் சிறந்தது.",
        en: "Holy Shravana Mondays Rudrabhishekam on Gokarna Atmalinga and Naga Shanti effectively dissolve Kuja (Mars) and Rahu-Ketu marital impediments."
      }
    },
    {
      title: {
        kn: "🌾 ಭಾದ್ರಪದ - ಆಶ್ವಯುಜ: ಪಿತೃ ಪಕ್ಷ ತರ್ಪಣ ಹಾಗೂ ಮಹಾಪೂಜೆ",
        hi: "🌾 भाद्रपद - आश्विन: पितृ पक्ष तर्पण एवं महापूजा",
        te: "🌾 భాద్రపద - ఆశ్వయుజ: పితృ పక్ష తర్పణం మరియు మహాపూజ",
        ta: "🌾 புரட்டாசி - ஐப்பசி: பித்ரு பக்ஷ தர்பணம் மற்றும் மகாபூஜை",
        en: "🌾 Bhadrapada - Ashvayuja: Pitru Tarpanam & Ancestral Grace"
      },
      desc: {
        kn: "ಪಿತೃ ದೋಷ ಶಾಂತಿಗೆ ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆಯಂದು ಗೋಕರ್ಣ ರುದ್ರಪಾದ ತೀರ್ಥದಲ್ಲಿ ಪಿತೃ ತರ್ಪಣ, ಶ್ರಾದ್ಧ ಹಾಗೂ ಅನ್ನದಾನ ಮಾಡುವುದರಿಂದ ವಂಶ ವೃದ್ಧಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖ ಲಭಿಸುತ್ತದೆ.",
        hi: "पितृ दोष शांति हेतु महालया अमावस्या पर गोकर्ण रुद्रपाद तीर्थ में तर्पण, श्राद्ध एवं अन्नदान करने से वंश वृद्धि तथा पारिवारिक सुख मिलता है।",
        te: "పితృ దోష శాంతికి మహాలయ అమావాస్య నాడు గోకర్ణ రుద్రపాద తీర్థంలో తర్పణం, శ్రాద్ధం మరియు అన్నదానం చేయడం వలన వంశాభివృద్ధి లభిస్తుంది.",
        ta: "பித்ரு தோஷ சாந்திக்கு மகாளய அமாவாசையன்று கோகர்ண ருத்ரபாத தீர்த்தத்தில் தர்பணமும் அன்னதானமும் செய்வது வம்ச சுபிட்சமும் தரும்.",
        en: "Performing Mahalaya Pitru Tarpanam and Shradha at Gokarna's sacred Rudrapada Teertha guarantees ancestral liberation and prospers descendants."
      }
    },
    {
      title: {
        kn: "🪔 ಕಾರ್ತಿಕ - ಮಾಘ: ದೀಪೋತ್ಸವ ಹಾಗೂ ಆತ್ಮಾಲಿಂಗ ದರ್ಶನ",
        hi: "🪔 कार्तिक - माघ: दीपोत्सव एवं आत्मालिंग दर्शन",
        te: "🪔 కార్తీక - మాఘ: దీపోత్సవం మరియు ఆత్మలింగ దర్శనం",
        ta: "🪔 கார்த்திகை - மாசி: தீபோற்சவம் மற்றும் ஆத்மலிங்க தரிசனம்",
        en: "🪔 Kartika - Magha: Festival of Lights & Atmalinga Grace"
      },
      desc: {
        kn: "ಕಾರ್ತಿಕ ಸೋಮವಾರ ಕೋಟಿ ದೀಪೋತ್ಸವ ಹಾಗೂ ಮಹಾ ಶಿವರಾತ್ರಿಯಂದು ಪ್ರತ್ಯಕ್ಷ ಆತ್ಮಾಲಿಂಗ ಸ್ಪರ್ಶ ಪೂಜೆ ಮಾಡಿಸುವುದರಿಂದ ಸಮಸ್ತ ಜನ್ಮಾಂತರ ಪಾಪ ಕ್ಷಯವಾಗಿ ಸಕಲ ಸಂಪತ್ತು ವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
        hi: "कार्तिक सोमवार दीपदान तथा महाशिवरात्रि पर प्रत्यक्ष आत्मालिंग स्पर्श पूजन कराने से समस्त जन्मांतर पाप नष्ट होकर अपार संपत्ति और सुख मिलता है।",
        te: "కార్తీక సోమవారం దీపారాధన మరియు మహా శివరాత్రి నాడు ప్రత్యక్ష ఆత్మలింగ స్పర్శ పూజ చేయించడం వలన పాపాలు నశించి అష్టైశ్వర్యాలు సిద్ధిస్తాయి.",
        ta: "கார்த்திகை சோமவார தீப வழிபாடும் மகா சிவராத்திரி ஆத்மலிங்க ஸ்பர்ச தரிசனமும் ஜென்ம பாவங்களை நீக்கி அஷ்டலக்ஷ்மி கடாட்சம் தரும்.",
        en: "Lighting lamps during Kartika month and performing Atmalinga touch worship on Maha Shivaratri invokes supreme fortune and unshakeable prosperity."
      }
    }
  ];

  const VASTU_TITLE_DICT: L5 = {
    kn: "✦ ಗೃಹ ಶಾಂತಿ ಹಾಗೂ ವಾಸ್ತು ದೋಷ ಶಮನ ಯಂತ್ರ ಧರ್ಮ ಸೂತ್ರಗಳು ✦",
    hi: "✦ गृह शांति एवं वास्तु दोष निवारण धर्म सूत्र ✦",
    te: "✦ గృహ శాంతి మరియు వాస్తు దోష నివారణ ధర్మ సూత్రాలు ✦",
    ta: "✦ கிரக சாந்தி மற்றும் வாஸ்து தோஷ நிவர்த்தி தர்ம சூத்திரங்கள் ✦",
    en: "✦ Sacred Domestic Vastu & Wealth Energy Rules ✦"
  };

  const VASTU_RULES: { title: L5; desc: L5 }[] = [
    {
      title: { kn: "🚪 ಸಿಂಹದ್ವಾರ ಕುಂಕುಮ ಧಾರಣೆ", hi: "🚪 सिंहद्वार कुमकुम धारण", te: "🚪 సింహద్వారం కుంకుమ ధారణ", ta: "🚪 தலைவாசல் குங்கும திலகம்", en: "🚪 Main Entrance Sanctity" },
      desc: {
        kn: "ಮನೆಯ ಮುಖ್ಯ ದ್ವಾರದಲ್ಲಿ ಪ್ರತಿದಿನ ಗೋಕರ್ಣ ಪ್ರಸಾದದ ಪವಿತ್ರ ಅರಿಶಿನ-ಕುಂಕುಮ ಇಡುವುದರಿಂದ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಹಾಗೂ ದುಷ್ಟ ದೃಷ್ಟಿ ಬಾಧೆ ಸಂಪೂರ್ಣ ಶಮನವಾಗುತ್ತದೆ.",
        hi: "घर के मुख्य द्वार पर प्रतिदिन गोकर्ण प्रसाद का पवित्र हल्दी-कुमकुम लगाने से नकारात्मक ऊर्जा तथा कुदृष्टि बाधा पूर्णतः दूर होती है।",
        te: "ఇంటి ముఖ్య ద్వారానికి ప్రతిరోజూ గోకర్ణ ప్రసాదం పసుపు-కుంకుమ అద్దడం వలన నకారాత్మక శక్తి మరియు దిష్టి దోషాలు తొలగిపోతాయి.",
        ta: "வீட்டின் தலைவாசலில் தினமும் கோகர்ண பிரசாத மஞ்சள்-குங்குமம் வைப்பது துஷ்ட சக்திகளையும் கண் திருஷ்டியையும் முற்றுமாக விலக்கும்.",
        en: "Applying sacred Gokarna Kumkuma at the main entrance shields the home from negative subtle energy, evil eye, and environmental toxins."
      }
    },
    {
      title: { kn: "🪔 ಪೂರ್ವ-ಈಶಾನ್ಯ ದೇವತಾ ಸ್ಥಾನ", hi: "🪔 पूर्व-ईशान देवता स्थान", te: "🪔 తూర్పు-ఈశాన్యం దేవతా స్థానం", ta: "🪔 கிழக்கு-ஈசானியம் பூஜை பீடம்", en: "🪔 North-East Altar Sanctuary" },
      desc: {
        kn: "ದೇವರ ಮನೆಯನ್ನು ಮನೆಯ ಈಶಾನ್ಯ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕಿನಲ್ಲಿರಿಸಿ ಪೂರ್ವಾಭಿಮುಖವಾಗಿ ಪೂಜೆ ಮಾಡುವುದು ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದ ಹಾಗೂ ಧನ ವೃದ್ಧಿಗೆ ಅತ್ಯಂತ ಮಂಗಳಕರ.",
        hi: "पूजा घर को पूर्व या ईशान कोण में स्थापित कर पूर्व दिशा की ओर मुख करके पूजन करना पारिवारिक सौहार्द एवं धन वृद्धि के लिए परम शुभ है।",
        te: "పూజాగదిని ఈశాన్యం లేదా తూర్పు దిశలో ఉంచి తూర్పు ముఖంగా పూజించడం కుటుంబ సౌఖ్యం మరియు ధనాభివృద్ధికి అత్యంత శుభకరం.",
        ta: "பூஜை அறையை ஈசானியம் அல்லது கிழக்கில் அமைத்து கிழக்கு நோக்கி பூஜிப்பது குடும்ப அமைதியும் செல்வ வளர்ச்சியும் அளிக்கும்.",
        en: "Positioning the sacred altar in the North-East or East window ensures clean divine vibrations, emotional harmony, and financial steadiness."
      }
    },
    {
      title: { kn: "🌿 ಕರ್ಪೂರ ನೈವೇದ್ಯ ಧೂಪ", hi: "🌿 कर्पूर नैवेद्य धूप", te: "🌿 కర్పూర నైవేద్య ధూపం", ta: "🌿 கற்பூர ஆராதனை தூபம்", en: "🌿 Camphor Aarti & Incense Cleansing" },
      desc: {
        kn: "ಪ್ರತಿದಿನ ಸಂಜೆ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ಮರಣೆಯೊಂದಿಗೆ ಶುದ್ಧ ಕರ್ಪೂರ ಆರತಿ ಬೆಳಗುವುದರಿಂದ ಮನೆಯ ಗೃಹ ಕಲಹಗಳು ಹಾಗೂ ಮಾನಸಿಕ ಕಲ್ಮಷಗಳು ತಕ್ಷಣ ನಿವಾರಣೆಯಾಗುತ್ತವೆ.",
        hi: "प्रतिदिन सायं श्री महाबलेश्वर स्मरण के साथ शुद्ध कर्पूर आरती करने से घर के कलह तथा मानसिक क्लेश तुरंत दूर होते हैं।",
        te: "ప్రతిరోజూ సాయంత్రం శివ స్మరణతో కర్పూర హారతి వెలిగించడం వలన గృహ కలహాలు మరియు మనశ్చింతలు నివారించబడతాయి.",
        ta: "தினமும் மாலையில் சிவ ஸ்மரணத்துடன் கற்பூர ஆரத்தி செய்வது குடும்ப சண்டைகளையும் மனக் கவலைகளையும் உடனே நீக்கும்.",
        en: "Lighting pure camphor Aarti every evening purifies domestic subtle channels and resolves interpersonal stress among family members."
      }
    }
  ];

  const CORNER_TITLE_DICT: L5 = {
    kn: "✦ ಚತುರ್ದಿಕ್ ವಾಸ್ತು ದೋಷ ಪರಿಹಾರ ಹಾಗೂ ಲಕ್ಷಣ ನಿಯಮಗಳು ✦",
    hi: "✦ चतुर्दिक् वास्तु दोष निवारण एवं लक्षण नियम ✦",
    te: "✦ చతుర్దిక్ వాస్తు దోష నివారణ మరియు లక్షణ నియమాలు ✦",
    ta: "✦ நான்கு திசைகளின் வாஸ்து தோஷ பரிகார விதிகள் ✦",
    en: "✦ 4-Corner Domestic Vastu Harmony & Prosperity Rules ✦"
  };

  const CORNER_LIST: { title: L5; desc: L5 }[] = [
    {
      title: { kn: "🌅 ಈಶಾನ್ಯ (North-East): ಜಲ ಹಾಗೂ ದೇವ ಸ್ಥಾನ", hi: "🌅 ईशान: जल एवं देव स्थान", te: "🌅 ఈశాన్యం: జలం మరియు దేవుని స్థానం", ta: "🌅 ஈசானியம்: ஜலம் மற்றும் தெய்வ ஸ்தானம்", en: "🌅 North-East (Ishanya): Water & Deity Altar" },
      desc: {
        kn: "ಈಶಾನ್ಯ ಮೂಲೆಯನ್ನು ಸದಾ ಪವಿತ್ರವಾಗಿ, ಸ್ವಚ್ಛವಾಗಿ ಹಾಗೂ ಭಾರವಿಲ್ಲದೆ ಇಡಬೇಕು. ಇಲ್ಲಿ ಕುಡಿಯುವ ನೀರು ಹಾಗೂ ಪೂಜಾ ಸ್ಥಾಪನೆ ಮಾಡುವುದು ಬುದ್ಧಿ ವೃದ್ಧಿ ನೀಡುತ್ತದೆ.",
        hi: "ईशान कोण को सदैव पवित्र, स्वच्छ तथा हल्का रखना चाहिए। यहाँ पीने का पानी तथा पूजा घर स्थापित करना बुद्धि एवं ज्ञान बढ़ाता है।",
        te: "ఈశాన్య మూలను సదా పవిత్రంగా, శుభ్రంగా ఉంచాలి. ఇక్కడ మంచి నీరు మరియు పూజా స్థానం ఏర్పాటు చేయడం సద్బుద్ధిని ఇస్తుంది.",
        ta: "ஈசானிய மூலையை எப்போதும் தூய்மையாகவும் எடையில்லாமலும் வைக்க வேண்டும். இங்கு குடிநீரும் பூஜையும் அமைப்பது புத்தி கூர்மை தரும்.",
        en: "Keep the North-East zone pristine, bright, and unburdened. Installing holy water or altar here boosts intellectual focus and peace."
      }
    },
    {
      title: { kn: "☀️ ಆಗ್ನೇಯ (South-East): ಅಗ್ನಿ ಹಾಗೂ ಪಾಕಶಾಲೆ", hi: "☀️ आग्नेय: अग्नि एवं पाकशाला", te: "☀️ ఆగ్నేయం: అగ్ని మరియు వంటగది", ta: "☀️ ஆக்னேயம்: அக்னி மற்றும் சமையலறை", en: "☀️ South-East (Agneya): Kitchen Fire & Energy" },
      desc: {
        kn: "ಆಗ್ನೇಯ ಮೂಲೆಯಲ್ಲಿ ಅಡಿಗೆ ಮನೆ ಅಥವಾ ದೀಪ ಸ್ಥಾನವಿರುವುದು ಉತ್ತಮ. ಇದು ಗೃಹಿಣಿಯರ ಆರೋಗ್ಯ, ಜಠರಾಗ್ನಿ ಉತ್ತೇಜನ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಉತ್ಸಾಹವನ್ನು ಕಾಯುತ್ತದೆ.",
        hi: "आग्नेय कोण में रसोईघर अथवा दीप स्थान होना उत्तम है। यह गृहलक्ष्मी के स्वास्थ्य, पाचन शक्ति तथा घर में ऊर्जा बनाए रखता है।",
        te: "ఆగ్నేయ మూలలో వంటగది లేదా దీప స్థానం ఉండటం శ్రేష్ఠం. ఇది గృహిణి ఆరోగ్యం మరియు ఇంట్లో ఉత్సాహాన్ని కాపాడుతుంది.",
        ta: "ஆக்னேய மூலையில் சமையலறை அல்லது தீப ஸ்தானம் அமைவது நல்லது. இது இல்லத்தரசியின் ஆரோக்கியத்தையும் சுபிட்சத்தையும் காக்கும்.",
        en: "Locating kitchen or lamp altar in the South-East corner enhances digestive fire, female family vitality, and dynamic energy."
      }
    },
    {
      title: { kn: "🌾 ನೈಋತ್ಯ (South-West): ಸ್ಥಿರತೆ ಹಾಗೂ ಮಾಲೀಕ ಸ್ಥಾನ", hi: "🌾 नैऋत्य: स्थिरता एवं स्वामी स्थान", te: "🌾 నైరుతి: స్థిరత్వం మరియు యజమాని స్థానం", ta: "🌾 நைருதி: ஸ்திரத்தன்மை & எஜமானர் ஸ்தானம்", en: "🌾 South-West (Nirruthi): Master Bedroom & Stability" },
      desc: {
        kn: "ನೈಋತ್ಯ ಮೂಲೆಯು ಮನೆಯಲ್ಲಿ ಅತ್ಯಂತ ಭಾರವಾಗಿರಬೇಕು. ಇಲ್ಲಿ ಗೃಹಯಜಮಾನರ ಮಲಗುವ ಕೋಣೆ ಹಾಗೂ ಧನ ಸಂಗ್ರಹವಿರುವುದು ಕೌಟುಂಬಿಕ ಸ್ಥಿರತೆ ನೀಡುತ್ತದೆ.",
        hi: "नैऋत्य कोण घर में सबसे भारी होना चाहिए। यहाँ गृहस्वामी का शयनकक्ष तथा तिजोरी होना पारिवारिक स्थायित्व एवं समृद्धि प्रदान करता है।",
        te: "నైరుతి మూల ఇంట్లో అత్యంత బరువుగా ఉండాలి. ఇక్కడ యజమాని పడుకునే గది మరియు బీరువా ఉండటం కుటుంబ స్థిరత్వాన్ని ఇస్తుంది.",
        ta: "நைருதி மூலை வீட்டின் அதிக எடையுள்ள பகுதியாக இருக்க வேண்டும். இங்கு தலைவரின் அறையும் பணப்பெட்டியும் அமைவது நிலைத்தன்மை தரும்.",
        en: "The South-West zone should be solid and heavy. Master bedroom and wealth vault here ground family stability and authority."
      }
    },
    {
      title: { kn: "🌬️ ವಾಯುವ್ಯ (North-West): ವಾಯು ಹಾಗೂ ಆವಕ ಸ್ಥಾನ", hi: "🌬️ वायव्य: वायु एवं धन आगमन स्थान", te: "🌬️ వాయువ్యం: వాయువు మరియు ధనాగమన స్థానం", ta: "🌬️ வாயுக் கோணம்: காற்று மற்றும் வரவு ஸ்தானம்", en: "🌬️ North-West (Vayavya): Air Flow & Financial Influx" },
      desc: {
        kn: "ವಾಯುವ್ಯ ಮೂಲೆಯನ್ನು ಚಲನಶೀಲವಾಗಿ ಹಾಗೂ ವಾತಾಯನ ಯುಕ್ತವಾಗಿಡಬೇಕು. ಇದು ಹೊಸ ಉದ್ಯೋಗ ಅವಕಾಶಗಳು, ಅತಿಥಿ ಸತ್ಕಾರ ಹಾಗೂ ಸಕಾಲಿಕ ಆವಕವನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ.",
        hi: "वायव्य कोण को गतिशील तथा वायु प्रवाह युक्त रखना चाहिए। यह नए रोजगार के अवसर, अतिथि सत्कार तथा धन के समय पर आगमन को बढ़ाता है।",
        te: "వాయువ్య మూలను గాలి ప్రసరించేలా ఉంచాలి. ఇది నూతన ఉద్యోగ అవకాశాలు, అతిథి సత్కారం మరియు ధనాగమనాన్ని ప్రోత్సహిస్తుంది.",
        ta: "வாயுக் கோணத்தை காற்று வீசும் வகையில் அமைக்க வேண்டும். இது புதிய வாய்ப்புகள், விருந்தோம்பல் மற்றும் பண வரவை தூண்டும்.",
        en: "Keep the North-West zone well-ventilated and dynamic. It accelerates financial turnover, guest hospitality, and career mobility."
      }
    }
  ];

  const PITRU_TITLE_DICT: L5 = {
    kn: "✦ ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಕುಲದೇವರ ಪೂರ್ಣ ಆಶೀರ್ವಾದ ಫಲವೃಕ್ಷ ✦",
    hi: "✦ पितृ तर्पण एवं कुलदेवता पूर्ण आशीर्वाद फलवृक्ष ✦",
    te: "✦ పితృ తర్పణం మరియు కులదేవత పూర్ణ ఆశీర్వాద ఫలవృక్షం ✦",
    ta: "✦ பித்ரு தர்பணம் மற்றும் குலதெய்வ பரிபூரண ஆசீர்வாதம் ✦",
    en: "✦ Ancestral Peace & Clan Deity Grace Guidelines ✦"
  };

  const PITRU_DESC_DICT: L5 = {
    kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರವು ಪರಮ ಪವಿತ್ರ ರುದ್ರಪಾದ ಕ್ಷೇತ್ರವಾಗಿದ್ದು, ಇಲ್ಲಿ ಪಿತೃ ಶ್ರಾದ್ಧ, ಬಲಿ ಹಾಗೂ ಸಂಪ್ರೋಕ್ಷಣ ಸೇವೆ ನೆರವೇರಿಸುವುದರಿಂದ ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಮುಕ್ತಿ ದೊರೆತು, ಸಂತತಿ ಹಾಗೂ ಧನ-ಧಾನ್ಯ ಸಮೃದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
    hi: "गोकर्ण क्षेत्र परम पवित्र रुद्रपाद तीर्थ है, यहाँ पितृ श्राद्ध, बलि एवं तर्पण कराने से सात पीढ़ियों के पितरों को सद्गति मिलती है तथा वंश एवं धन-धान्य समृद्धि प्राप्त होती है।",
    te: "గోకర్ణ క్షేత్రం పరమ పవిత్ర రుద్రపాద క్షేత్రం, ఇక్కడ పితృ శ్రాద్ధం మరియు తర్పణం చేయడం వలన ఏడు తరాల పితృదేవతలకు ముక్తి లభించి వంశాభివృద్ధి జరుగుతుంది.",
    ta: "கோகர்ண க்ஷேத்திரம் ருத்ரபாத தீர்த்தமாகும். இங்கு பித்ரு சிரார்த்தமும் தர்பணமும் செய்வது 7 தலைமுறை பித்ருக்களுக்கு முக்தியும் வம்ச சுபிட்சமும் தரும்.",
    en: "Gokarna is the ancient, highly sacred Rudrapada Kshetra. Performing ancestral rites here guarantees liberation to 7 ancestral generations and bestows lineage prosperity."
  };

  const PRASADA_USE_TITLE_DICT: L5 = {
    kn: "✦ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ನಿತ್ಯ ವಿನಿಯೋಗ ಹಾಗೂ ಸಂರಕ್ಷಣೆ ✦",
    hi: "✦ गोकर्ण महाबलेश्वर प्रसाद नित्य उपयोग एवं संरक्षण ✦",
    te: "✦ గోకర్ణ మహాబలేశ్వర ప్రసాదం నిత్య వినియోగం మరియు సంరక్షణ ✦",
    ta: "✦ கோகர்ண மகாபலேஸ்வர பிரசாத உபயோகம் மற்றும் பாதுகாப்பு ✦",
    en: "✦ Gokarna Mahabaleshwara Sacred Prasada Preservation & Use ✦"
  };

  const PRASADA_USE_DESC_DICT: L5 = {
    kn: "ಲಭಿಸಿದ ಪವಿತ್ರ ವಿಭೂತಿ, ಕುಂಕುಮ ಹಾಗೂ ನಾಣ್ಯ ಪ್ರಸಾದವನ್ನು ಮನೆಯ ದೇವರ ಪೆಟ್ಟಿಗೆ ಅಥವಾ ಧನ ತಿಜೋರಿಯಲ್ಲಿ ಸ್ಥಾಪಿಸಿ. ಶುಭ ಕಾರ್ಯಗಳಿಗೆ ತೆರಳುವಾಗ ವಿಭೂತಿ ಧರಿಸುವುದರಿಂದ ಸಮಸ್ತ ಕಾರ್ಯಗಳಲ್ಲಿ ನಿರಂತರ ಜಯ ಲಭಿಸುತ್ತದೆ.",
    hi: "प्राप्त पवित्र विभूति, कुमकुम तथा प्रसाद सिक्के को पूजा घर अथवा धन तिजोरी में स्थापित करें। शुभ कार्य हेतु निकलते समय विभूति धारण करने से सर्व कार्यों में निरंतर विजय मिलती है।",
    te: "లభించిన విభూతి, కుంకుమ మరియు ప్రసాద నాణేన్ని పూజాగదిలో లేదా బీరువాలో ఉంచండి. శుభ కార్యాలకు వెళ్ళేటప్పుడు విభూతి ధరించడం వలన విజయం లభిస్తుంది.",
    ta: "பெற்ற விபூதி, குங்குமம் மற்றும் பிரசாத நாணயத்தை பூஜை பெட்டியில் வைக்கவும். சுப காரியங்களுக்குச் செல்லும்போது விபூதி அணிவது வெற்றி தரும்.",
    en: "Store sacred Gokarna Vibhuti, Kumkuma, and blessed Prasada coin in your family altar or safe. Applying Vibhuti before journeys ensures divine protection and success."
  };

  return (
    <div className="pdf-page" style={pageStyle}>
      <div
        style={{
          border: `3px double ${GOLD}`,
          borderRadius: 16,
          padding: "24px 28px",
          minHeight: PAGE_H - 76,
          boxSizing: "border-box",
          backgroundColor: PAPER,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, color: GOLD, letterSpacing: 2 }}>❖</div>
            <div style={{ fontSize: 17.5, fontWeight: 700, color: INK, marginTop: 2, lineHeight: 1.5 }}>
              {pick(TITLE_DICT, lang)}
            </div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 4, lineHeight: 1.65, maxWidth: 740, margin: "4px auto 0" }}>
              {pick(SUBTITLE_DICT, lang)}
            </div>
          </div>

          <OrnamentRule />

          {/* Section 1: 12-Month Remedial Cycle */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 8, textTransform: "uppercase", textAlign: "center" }}>
              {pick(CYCLE_TITLE_DICT, lang)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {CYCLE_LIST.map((cy, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1.5px solid ${GOLD_LIGHT}`,
                    borderRadius: 10,
                    backgroundColor: PANEL,
                    padding: "12px 16px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, marginBottom: 4, lineHeight: 1.45 }}>
                    {pick(cy.title, lang)}
                  </div>
                  <div style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.7 }}>
                    {pick(cy.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Vastu & Wealth Energy Rules */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 8, textTransform: "uppercase", textAlign: "center" }}>
              {pick(VASTU_TITLE_DICT, lang)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 11 }}>
              {VASTU_RULES.map((vr, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: 10,
                    backgroundColor: "#FFFFFF",
                    padding: "12px 14px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 4, lineHeight: 1.45 }}>
                    {pick(vr.title, lang)}
                  </div>
                  <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.65 }}>
                    {pick(vr.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: 4-Corner Domestic Vastu Harmony Rules */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 8, textTransform: "uppercase", textAlign: "center" }}>
              {pick(CORNER_TITLE_DICT, lang)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {CORNER_LIST.map((cr, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: 10,
                    backgroundColor: PANEL,
                    padding: "12px 16px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 4, lineHeight: 1.45 }}>
                    {pick(cr.title, lang)}
                  </div>
                  <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.65 }}>
                    {pick(cr.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Pitru Tarpanam & Ancestral Grace */}
          <div
            style={{
              marginTop: 14,
              backgroundColor: "#FFFFFF",
              border: `1.5px solid ${GOLD_LIGHT}`,
              borderRadius: 10,
              padding: "12px 16px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 4 }}>
              {pick(PITRU_TITLE_DICT, lang)}
            </div>
            <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.65 }}>
              {pick(PITRU_DESC_DICT, lang)}
            </div>
          </div>

          {/* Section 5: Gokarna Mahabaleshwara Prasada Preservation */}
          <div
            style={{
              marginTop: 14,
              backgroundColor: PANEL,
              border: `1.5px solid ${GOLD_LIGHT}`,
              borderRadius: 10,
              padding: "12px 16px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 4 }}>
              {pick(PRASADA_USE_TITLE_DICT, lang)}
            </div>
            <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.65 }}>
              {pick(PRASADA_USE_DESC_DICT, lang)}
            </div>
          </div>
        </div>

        {/* Section 6: Chief Archaka Official Seal Badge */}
        <div
          style={{
            marginTop: 16,
            marginBottom: 20,
            border: `2px solid ${GOLD}`,
            borderRadius: 12,
            backgroundColor: "#FFFFFF",
            padding: "14px 20px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16
          }}
        >
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 4 }}>
              {pick(SEAL_HEADER_DICT, lang)}
            </div>
            <div style={{ fontSize: 12.5, color: INK, fontWeight: 700 }}>
              {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"} — {pick({ kn: "ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ", hi: "मुख्य अर्चक, गोकर्ण महाबलेश्वर क्षेत्र", te: "ముఖ్య అర్చకులు, గోకర్ణ మహాబలేశ్వర క్షేత్రం", ta: "முதன்மை அர்ச்சகர், கோகர்ண மகாபலேஸ்வர க்ஷேத்திரம்", en: "Chief Archaka, Gokarna Mahabaleshwara Kshetra" }, lang)}
            </div>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 4, lineHeight: 1.65 }}>
              {pick(SEAL_DESC_DICT, lang)}
            </div>
          </div>

          {/* Luxury Archaka Golden Stamp Emblem */}
          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: 43,
              border: `2.5px double ${GOLD}`,
              backgroundColor: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 12px rgba(180, 140, 60, 0.25)`
            }}
          >
            <div style={{ fontSize: 18, color: GOLD }}>🕉️</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: INK, textTransform: "uppercase", marginTop: 2, textAlign: "center" }}>
              GOKARNA
            </div>
            <div style={{ fontSize: 7, color: GOLD, textTransform: "uppercase" }}>
              CHIEF ARCHAKA
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 36,
            right: 36,
            textAlign: "center",
            fontSize: 10,
            color: INK_SOFT
          }}
        >
          {pick(LETTER_L5.signature!, lang)} · 4 / 5
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Sheet 8 — Page 5: Gokarna Panchanga Divine Mandala & Graha Details (100% Full Page & Larger Fonts)
 * ------------------------------------------------------------------ */

export type PoojaMahatmeData = {
  whatIsPooja: string;
  whyDoPooja: string;
  benefitsPooja: string;
};

export const SevaPoojaMahatmePrint = ({
  lang,
  identity,
  panditName,
  primarySeva,
  mahatmeData
}: {
  lang: string;
  identity: Identity;
  panditName?: string;
  primarySeva?: SevaRecommendation;
  mahatmeData?: PoojaMahatmeData;
}): JSX.Element => {
  const safePanditName = formatPanditName(panditName, lang);
  const sevaTitle = primarySeva?.seva ? pick(primarySeva.seva.name, lang) : pick({ kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಪೂಜೆ", hi: "श्री गोकर्ण महापूजा", te: "శ్రీ గోకర్ణ మహాపూజ", ta: "ஸ்ரீ கோகர்ண மகாபூஜை", en: "Shri Gokarna Maha Seva" }, lang);

  // Fallback Mahatme generator for offline/error handling across all 5 languages
  const defaultMahatme = (() => {
    const isGanapati = sevaTitle.toLowerCase().includes("ganapati") || sevaTitle.includes("ಗಣಪತಿ") || sevaTitle.includes("गणपति") || sevaTitle.includes("గణపతి") || sevaTitle.includes("கணபதி");
    const isRudra = sevaTitle.toLowerCase().includes("rudra") || sevaTitle.includes("ರುದ್ರ") || sevaTitle.includes("रुद्र") || sevaTitle.includes("రుద్ర") || sevaTitle.includes("ருத்ர");
    const isMrityunjaya = sevaTitle.toLowerCase().includes("mrityunjaya") || sevaTitle.includes("ಮೃತ್ಯುಂಜಯ") || sevaTitle.includes("मृत्युंजय") || sevaTitle.includes("మృత్యుంజయ") || sevaTitle.includes("மிருத்யுஞ்ஜய");

    if (isGanapati) {
      return {
        whatIsPooja: pick({
          kn: "ಗಣಪತಿ ಹೋಮವು ಸಕಲ ವಿಘ್ನನಿವಾರಕನಾದ ಶ್ರೀ ಮಹಾಗಣಪತಿಯನ್ನು ಪ್ರಸನ್ನಗೊಳಿಸುವ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ವೈದಿಕ ಯಜ್ಞವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಯಜ್ಞದಲ್ಲಿ ಧರ್ಮ ಗ್ರಂಥೋಕ್ತ ಮಂತ್ರಪೂರ್ವಕವಾಗಿ ಪವಿತ್ರ ದ್ರವ್ಯಗಳು, ದೂರ್ವಾ (ಗರಿಕೆ), ನಾರಿಕೇಳ ಹಾಗೂ ಮಧುರಾನ್ನಗಳನ್ನು ಅಗ್ನಿದೇವನಿಗೆ ಅರ್ಪಿಸಿ ಪೂಜಿಸಲಾಗುತ್ತದೆ.",
          hi: "गणपति होम समस्त विघ्नविनाशक श्री महागणपति को प्रसन्न करने वाला अत्यंत श्रेष्ठ वैदिक यज्ञ है। इस पवित्र यज्ञ में शास्त्रोक्त मन्त्रोच्चार के साथ पावन द्रव्यों एवं आहुतियों द्वारा भगवान गणेश का पूजन किया जाता है।",
          te: "గణపతి హోమం సమస్త విఘ్నవినాశకుడైన శ్రీ మహాగణపతిని ప్రసన్నం చేసుకునే అత్యుత్తమ వైదిక యజ్ఞం. ఈ పవిత్ర హోమంలో శాస్త్రోక్త మంత్రాలతో పవిత్ర ద్రవ్యాలను సమర్పించి పూజిస్తారు.",
          ta: "கணபதி ஹோமம் சகல விக்னங்களை போக்கும் ஸ்ரீ மகா கணபதியை திருப்திப்படுத்தும் மிகச் சிறந்த வைதீக யாகமாகும். இதில் புனித திரவியங்கள் அக்னி தேவனுக்கு அர்ப்பணிக்கப்படுகின்றன.",
          en: "Ganapati Homa is a sacred Vedic fire ritual performed to invoke Lord Ganesha, the remover of all obstacles. Pure oblations, Modaka, and Durva grass are offered with powerful Vedic mantras."
        }, lang),
        whyDoPooja: pick({
          kn: "ಜೀವನದಲ್ಲಿ ಹೊಸ ಕಾರ್ಯಗಳಾರಂಭ, ನೂತನ ಗೃಹಪ್ರವೇಶ, ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ನಿರಂತರ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಜಾತಕದಲ್ಲಿರುವ ಕೇತು ಹಾಗೂ ಇತರ ಗ್ರಹಗಳ ಅಡಚಣೆಗಳನ್ನು ನಿವಾರಿಸಲು ಈ ಪವಿತ್ರ ಹೋಮವನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "जीवन में नवीन कार्यों के शुभारंभ, व्यापार में वृद्धि तथा कुण्डली में स्थित केतु एवं अन्य प्रतिकूल ग्रहों के कुप्रभावों के निवारण हेतु यह पावन होम किया जाता है।",
          te: "జీవితంలో నూతన కార్యారంభం, వ్యాపారాభివృద్ధి మరియు జాతకంలోని కేతువు మరియు ఇతర గ్రహ దోషాల నివారణకు ఈ హోమం చేయబడుతుంది.",
          ta: "வாழ்க்கையில் புதிய தொடக்கம், வியாபார வளர்ச்சி மற்றும் கிரக தோஷ நிவர்த்திக்காக இந்த ஹோமம் செய்யப்படுகிறது.",
          en: "This Homa is performed before starting new ventures, entering a new home, expanding business, or removing Ketu afflictions and unseen karmic hurdles in life."
        }, lang),
        benefitsPooja: pick({
          kn: "ಈ ಮಹಾ ಪೂಜೆಯ ಸಿದ್ಧ ಪ್ರಭಾವದಿಂದಾಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ಧನಾತ್ಮಕ ಚೇತನ ಜಾಗೃತಗೊಂಡು, ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ನಿರಂತರ ಜಯ, ಧನ ಸಂಪತ್ತಿನ ವೃದ್ಧಿ, ಬುದ್ಧಿವಂತಿಕೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ ಲಭಿಸುತ್ತದೆ.",
          hi: "इस महापूजन के प्रभाव से मन में सकारात्मक ऊर्जा का संचार होता है, समस्त कार्यों में सफलता, धन-समृद्धि, सद्बुद्धि एवं पारिवारिक सुख-शांति प्राप्त होती है।",
          te: "ఈ మహా పూజ వల్ల మనస్సులో సకల ధనాత్మక శక్తి కలిగి, సమస్త కార్యాలలో విజయం, ధన సమృద్ధి మరియు కుటుంబ సౌఖ్యం కలుగుతుంది.",
          ta: "இந்த மகா பூஜையால் மனதில் நேர்மறை ஆற்றல் பெருகி, சகல காரிய வெற்றி, தன தானிய பெருக்கம் மற்றும் குடும்ப சௌக்கியம் கிடைக்கும்.",
          en: "Performing this Homa bestows razor-sharp intellect, guarantees success in all endeavors, eliminates financial blockages, and fills the home with divine harmony."
        }, lang)
      };
    }

    if (isRudra || isMrityunjaya) {
      return {
        whatIsPooja: pick({
          kn: "ರುದ್ರ ಅಭಿಷೇಕ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಹೋಮವು ಸನಾತನ ಧರ್ಮದ ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ಶಿವ ಆರಾಧನೆಯಾಗಿದೆ. ಮಹಾದೇವನ ಆತ್ಮಲಿಂಗ ಸ್ವರೂಪಕ್ಕೆ ಪಂಚಾಮೃತ ಹಾಗೂ ಗಂಗಾಜಲದಿಂದ ಅಭಿಷೇಕ ನೆರವೇರಿಸಿ, ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರಪೂರ್ವಕವಾಗಿ ಹೋಮ ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "रुद्र अभिषेक एवं महामृत्युंजय होम सनातन धर्म की अत्यंत शक्तिशाली शिव आराधना है। भगवान शिव के आत्मलिंग स्वरूप पर पंचामृत एवं गंगाजल से अभिषेक कर महामृत्युंजय मन्त्र से होम किया जाता है।",
          te: "రుద్ర అభిషేకం మరియు మృత్యుంజయ హోమం సనాతన ధర్మంలో అత్యంత శక్తివంతమైన శివ ఆరాధన. స్వామివారికి పంచామృతాలతో అభిషేకం మరియు మృత్యుంజయ మంత్ర హోమం నిర్వహిస్తారు.",
          ta: "ருத்ர அபிஷேகம் மற்றும் ருத்ர ஹோமம் மிகவும் சக்திவாய்ந்த சிவ ஆராதனையாகும். சிவலிங்கத்திற்கு பஞ்சாமிர்த அபிஷேகம் மற்றும் மகா மிருத்யுஞ்ஜய ஹோமம் செய்யப்படுகிறது.",
          en: "Rudra Abhisheka & Maha Mrityunjaya Homa is a supreme Shiva ritual. The sacred Lingam is consecrated with Panchamrita and Ganga water while chanting the powerful Maha Mrityunjaya mantra."
        }, lang),
        whyDoPooja: pick({
          kn: "ಅಕಾಲಿಕ ಗಂಡಾಂತರ, ದೀರ್ಘಕಾಲದ ಅನಾರೋಗ್ಯ, ಶನಿ-ರಾಹು ದೋಷಗಳ ತೀವ್ರತೆ ಹಾಗೂ ಮಾನಸಿಕ ಸಂಕಟಗಳನ್ನು ನಿವಾರಿಸಿ ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಶಾಂತಿಯನ್ನು ಪಡೆಯಲು ಈ ಪವಿತ್ರ ಸೇವೆಯನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "अकाल मृत्यु भय, दीर्घकालिक व्याधियों, शनि-राहु दोषों तथा मानसिक संताप के निवारण एवं दीर्घायु तथा आंतरिक शांति हेतु यह परम सेवा संपन्न की जाती है।",
          te: "అకాల మృత్యు భయం, దీర్ఘకాలిక అనారోగ్యం, శని-రాహు దోషాల నివారణ మరియు దీర్ఘాయువు, మానసిక ప్రశాంతత కోసం ఈ సేవ చేయబడుతుంది.",
          ta: "அகால பயம், தீராத நோய்கள், சனி-ராகு தோஷ நிவர்த்தி மற்றும் நீண்ட ஆயுள் பெற இந்த பூஜை செய்யப்படுகிறது.",
          en: "This Seva is performed to overcome chronic illness, eliminate Rahu/Saturn afflictions, neutralize negative energies, and grant longevity and inner strength."
        }, lang),
        benefitsPooja: pick({
          kn: "ಈ ದಿವ್ಯ ಸೇವೆಯಿಂದಾಗಿ ಸಕಲ ರೋಗ-ರುಜಿನಗಳು ಶಮನವಾಗಿ, ದೈಹಿಕ ಕಾಂತಿ, ಅಖಂಡ ಕವಚ ರಕ್ಷಣೆ, ನಿರಂತರ ಆಯುರಾರೋಗ್ಯ ಹಾಗೂ ಸಕಲ ಪಾಪನಾಶದ ಫಲಶ್ರುತಿ ಲಭಿಸುತ್ತದೆ.",
          hi: "इस दिव्य सेवा से समस्त रोगों का शमन होता है, शारीरिक कांति, अखंड सुरक्षा कवच, उत्तम स्वास्थ्य एवं पापों से मुक्ति प्राप्त होती है।",
          te: "ఈ దివ్య సేవ వల్ల సకల రోగాలు నివారణై, శారీరక ఆరోగ్యం, రక్షణ కవచం మరియు సకల పాపక్షయం కలుగుతుంది.",
          ta: "இந்த திவ்ய சேவையால் நோய்கள் நீங்கி, உடல் ஆரோக்கியம், தெய்வீக பாதுகாப்பு கவசம் மற்றும் சகல பாவ நிவர்த்தி கிடைக்கும்.",
          en: "Grants absolute health shield, dissolves karmic debts, rejuvenates physical vitality, and fills the devotee with divine peace and spiritual aura."
        }, lang)
      };
    }

    return {
      whatIsPooja: pick({
        kn: "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೆರವೇರಿಸಲಾದ ಈ ಪವಿತ್ರ ಸೇವೆಯು ಜನ್ಮ ನಕ್ಷತ್ರ ಹಾಗೂ ರಾಶಿ ಗ್ರಹಗಳ ಪ್ರಸನ್ನತೆಗೆ ಅತ್ಯಂತ ಸಿದ್ಧಾತ್ಮಕವಾದ ದೈವಿಕ ಆರಾಧನೆಯಾಗಿದೆ.",
        hi: "गोकर्ण श्री महाबलेश्वर क्षेत्र में संपन्न यह पवित्र सेवा जन्म नक्षत्र एवं राशि ग्रहों की प्रसन्नता हेतु अत्यंत प्रभावकारी वैदिक आराधना है।",
        te: "గోకర్ణ శ్రీ మహాబలేశ్వర క్షేత్రంలో నిర్వహించిన ఈ పవిత్ర సేవ జన్మ నక్షత్రం మరియు రాశి గ్రహాల ప్రసన్నతకు అత్యంత ప్రభావవంతమైన ఆరాధన.",
        ta: "கோகர்ண ஸ்ரீ மகாபலேஸ்வர க்ஷேத்திரத்தில் செய்யப்பட்ட இந்த பூஜை ஜன்ம நட்சத்திர மற்றும் ராசி கிரகங்களின் திருப்திக்காக செய்யப்பட்டது.",
        en: "Performed at the holy Gokarna Mahabaleshwara Kshetra, this sacred Seva is an auspicious Vedic consecration tailored to your birth chart."
      }, lang),
      whyDoPooja: pick({
        kn: "ಜಾತಕದಲ್ಲಿರುವ ನವಗ್ರಹ ದೋಷಗಳ ಶಮನ, ಕೌಟುಂಬಿಕ ಅಭ್ಯುದಯ, ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಅನಗತ್ಯ ಮನಃಕ್ಲೇಶಗಳನ್ನು ದೂರಮಾಡಲು ಈ ಸೇವೆಯನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ.",
        hi: "कुण्डली में स्थित नवग्रह दोषों के शमन, पारिवारिक उन्नति, व्यापार एवं आजीविका में वृद्धि तथा मानसिक क्लेशों के निवारण हेतु यह सेवा अर्पित की जाती है।",
        te: "జాతకంలోని నవగ్రహ దోషాల నివారణ, కుటుంబ అభ్యుదయం, ఉద్యోగ వ్యాపారాలలో ప్రగతి మరియు మానసిక ప్రశాంతత కోసం ఈ సేవ సమర్పించబడుతుంది.",
        ta: "ஜாதக கிரக தோஷ நிவர்த்தி, குடும்ப வளர்ச்சி, தொழில் முன்னேற்றம் மற்றும் மன அமைதிக்காக இந்த சேவை செய்யப்படுகிறது.",
        en: "Designed to neutralize planetary imbalances, enhance career growth, foster domestic peace, and clear financial and personal blockages."
      }, lang),
      benefitsPooja: pick({
        kn: "ಈ ಸೇವೆಯ ಫಲವಾಗಿ ನಿರಂತರ ಕೌಟುಂಬಿಕ ಭಾಗ್ಯೋದಯ, ಧನ ಕನಕ ವಸ್ತು ಸಮೃದ್ಧಿ, ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ರಾಜಮಾನ ಮರ್ಯಾದೆ ಹಾಗೂ ಪರಮ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
        hi: "इस सेवा के फलस्वरुप निरंतर पारिवारिक भाग्योदय, धन-धान्य समृद्धि, समाज में उच्च प्रतिष्ठा एवं शाश्वत शांति प्राप्त होती है।",
        te: "ఈ సేవ వల్ల నిరంతర కుటుంబ భాగ్యోదయం, ధన ధాన్య సమృద్ధి, సమాజంలో గౌరవ ప్రతిష్ఠలు కలుగుతాయి.",
        ta: "இந்த சேவையின் பலனாக குடும்ப பாக்கியம், தன தானிய பெருக்கம், சமூக மதிப்பு மற்றும் சாஸ்வத சாந்தி கிடைக்கும்.",
        en: "Bestows enduring family prosperity, continuous financial stability, elevated social respect, and permanent divine grace."
      }, lang)
    };
  })();

  const wPooja = mahatmeData?.whatIsPooja || defaultMahatme.whatIsPooja;
  const yPooja = mahatmeData?.whyDoPooja || defaultMahatme.whyDoPooja;
  const bPooja = mahatmeData?.benefitsPooja || defaultMahatme.benefitsPooja;

  // 4 Primary Graha Position Cards (Group 1)
  const GRAHA_GROUP_1: { name: L5; role: L5; desc: L5 }[] = [
    {
      name: { kn: "☀️ ಸೂರ್ಯ ಹಾಗೂ ಚಂದ್ರ (Surya & Chandra)", hi: "☀️ सूर्य एवं चंद्र (Surya & Chandra)", te: "☀️ సూర్యుడు మరియు చంద్రుడు", ta: "☀️ சூரியன் & சந்திரன்", en: "☀️ Surya & Chandra (Sun & Moon)" },
      role: { kn: "ಆತ್ಮಕಾರಕ ಹಾಗೂ ಮನಃಕಾರಕ", hi: "आत्मकारक एवं मनःकारक", te: "ఆత్మకారకుడు మరియు మనఃకారకుడు", ta: "ஆத்மகாரகர் & மனோகாரகர்", en: "Soul, Vitality & Emotional Mind" },
      desc: {
        kn: "ಸೂರ್ಯನು ಪಿತೃ, ಆರೋಗ್ಯ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸದ ಅಧಿಪತಿ. ಚಂದ್ರನು ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆ, ಕೌಟುಂಬಿಕ ಸುಖ ಹಾಗೂ ಪ್ರೀತಿಯ ಕಾರಕ. ಗೋಕರ್ಣ ಪೂಜೆಯಿಂದ ಸೂರ್ಯ-ಚಂದ್ರರ ಪ್ರಸನ್ನತೆ ಲಭಿಸುತ್ತದೆ.",
        hi: "सूर्य पिता, स्वास्थ्य तथा आत्मविश्वास के स्वामी हैं। चंद्र मानसिक शांति तथा पारिवारिक सुख के कारक हैं। गोकर्ण पूजन से दोनों की कृपा मिलती है।",
        te: "సూర్యుడు ఆరోగ్యం, ఆత్మవిశ్వాసానికి అధిపతి. చంద్రుడు మనఃశాంతి, కుటుంబ సౌఖ్యానికి కారకుడు. గోకర్ణ పూజతో వీరి అనుగ్రహం లభిస్తుంది.",
        ta: "சூரியன் ஆரோக்கியம், தன்னம்பிக்கை அதிபதி. சந்திரன் மன அமைதி, குடும்ப சுக காரகர். கோகர்ண பூஜையால் இருவரின் அருள் கிட்டும்.",
        en: "Surya governs soul vitality, authority, and immunity. Chandra rules mind peace, domestic joy, and emotional stability."
      }
    },
    {
      name: { kn: "⚔️ ಕುಜ ಹಾಗೂ ಬುಧ (Kuja & Budha)", hi: "⚔️ कुज एवं बुध (Kuja & Budha)", te: "⚔️ కుజుడు మరియు బుధుడు", ta: "⚔️ செவ்வாய் & புதன்", en: "⚔️ Kuja & Budha (Mars & Mercury)" },
      role: { kn: "ಧೈರ್ಯ ಹಾಗೂ ಬುದ್ಧಿಕಾರಕ", hi: "धैर्य एवं बुद्धिकारक", te: "ధైర్యం మరియు బుద్ధికారకుడు", ta: "தைரியம் & புத்தி காரகர்", en: "Courage, Intellect & Speech" },
      desc: {
        kn: "ಕುಜನು ಧೈರ್ಯ, ಆಸ್ತಿ ಹಾಗೂ ರಕ್ತಬಲದ ಕಾರಕ. ಬುಧನು ವ್ಯಾಪಾರ, ಶಿಕ್ಷಣ, ಗಣಿತ ಹಾಗೂ ವಾಗ್ಮಿತ್ವದ ಅಧಿಪತಿ. ಈ ಇಬ್ಬರು ಗ್ರಹಗಳ ಬಲದಿಂದ ಕಾರ್ಯ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ.",
        hi: "कुज साहस, भूमि तथा शक्ति के कारक हैं। बुध व्यापार, शिक्षा तथा वाणी के स्वामी हैं। इन दोनों के बल से कार्यों में महान सफलता मिलती है।",
        te: "కుజుడు ధైర్యం, భూమికి కారకుడు. బుధుడు వ్యాపారం, విద్య, వాక్చాతుర్యానికి అధిపతి. వీరి బలంతో సమస్త కార్యజయం లభిస్తుంది.",
        ta: "செவ்வாய் தைரியம், பூமி காரகர். புதன் வியாபாரம், கல்வி, வாக்கு அதிபதி. இருவரின் பலத்தால் காரிய வெற்றி நிச்சயம்.",
        en: "Kuja injects enterprise, property luck, and physical drive. Budha bestows analytical intellect, eloquence, and commercial success."
      }
    },
    {
      name: { kn: "📿 ಗುರು ಹಾಗೂ ಶುಕ್ರ (Guru & Shukra)", hi: "📿 गुरु एवं शुक्र (Guru & Shukra)", te: "📿 గురుడు మరియు శుక్రుడు", ta: "📿 குரு & சுக்கிரன்", en: "📿 Guru & Shukra (Jupiter & Venus)" },
      role: { kn: "ಜ್ಞಾನ ಹಾಗೂ ಭಾಗ್ಯಕಾರಕ", hi: "ज्ञान एवं भाग्यकारक", te: "జ్ఞానం మరియు భాగ్యకారకుడు", ta: "ஞானம் & பாக்ய காரகர்", en: "Wisdom, Wealth & Marriage" },
      desc: {
        kn: "ಬೃಹಸ್ಪತಿಯು ಧರ್ಮ, ಸಂತಾನ, ಜ್ಞಾನ ಹಾಗೂ ಧನ ಭಾಗ್ಯದ ಅಧಿಪತಿ. ಶುಕ್ರನು ಕಳತ್ರ (ವಿವಾಹ), ಸೌಂದರ್ಯ ಹಾಗೂ ಸರ್ವ ಭೋಗದ ಕಾರಕ. ಈ ಪೂಜೆಯು ಗುರು-ಶುಕ್ರರ ಸಿದ್ಧಿ ನೀಡುತ್ತದೆ.",
        hi: "बृहस्पति धर्म, संतान, ज्ञान तथा धन भाग्योदय के स्वामी हैं। शुक्र विवाह, सौंदर्य तथा समस्त सुखों के कारक हैं। पूजन से दोनों की सिद्धि होती है।",
        te: "గురుడు ధర్మం, సంతానం, ధన భాగ్యానికి అధిపతి. శుక్రుడు వివాహం, భోగభాగ్యాలకు కారకుడు. పూజ ద్వారా వీరి కృపాకటాక్షం లభిస్తుంది.",
        ta: "குரு தர்மம், புத்திர பாக்கியம், தன அதிபதி. சுக்கிரன் திருமணம், போக பாக்கிய காரகர். பூஜையால் இருவரின் சித்தி கிடைக்கும்.",
        en: "Guru bestows spiritual wisdom, progeny luck, and fortune. Shukra activates marital harmony, luxury, and artistic creativity."
      }
    },
    {
      name: { kn: "🪐 ಶನಿ, ರಾಹು ಹಾಗೂ ಕೇತು (Shani, Rahu, Ketu)", hi: "🪐 शनि, राहु एवं केतु (Shani, Rahu, Ketu)", te: "🪐 శని, రాహువు మరియు కేతువు", ta: "🪐 சனி, ராகு & கேது", en: "🪐 Shani, Rahu & Ketu (Karmic Lords)" },
      role: { kn: "ಕರ್ಮ ಹಾಗೂ ನ್ಯಾಯಕಾರಕ", hi: "कर्म एवं न्यायकारक", te: "కర్మ మరియు న్యాయకారకుడు", ta: "கர்மா & நியாய காரகர்", en: "Lifespan, Career Karma & Obstacle Resolution" },
      desc: {
        kn: "ಶನಿಯು ಆಯುಷ್ಯ, ಕರ್ಮ ಹಾಗೂ ನ್ಯಾಯದ ಅಧಿಪತಿ. ರಾಹು-ಕೇತುಗಳು ಜನ್ಮಾಂತರ ವೈರ, ಸರ್ಪ ದೋಷ ಹಾಗೂ ಅಡೆತಡೆಗಳ ಶಮನಕಾರಕ. ಶಿವ ಪೂಜೆಯು ಈ ಗ್ರಹಗಳನ್ನು ಶಾಂತಿಗೊಳಿಸುತ್ತದೆ.",
        hi: "शनि आयु, कर्म तथा न्याय के स्वामी हैं। राहु-केतु पूर्वजन्म बाधाओं तथा सर्प दोष के निवारक हैं। शिव पूजा से ये ग्रह शांत होते हैं।",
        te: "శని ఆయుష్షు, కర్మాధిపతి. రాహు-కేతువులు పూర్వజన్మ దోషాలు, సర్ప దోష నివారకులు. శివ పూజతో ఈ గ్రహాలు శాంతిస్తాయి.",
        ta: "சனி ஆயுள், கர்மாதிபதி. ராகு-கேது பூர்வஜென்ம தோஷ அகற்றுபவர்கள். சிவ பூஜையால் இவர்கள் சாந்தமடைவர்.",
        en: "Shani guides career karma and lifespan. Rahu-Ketu govern past-life karmic knots; Gokarna Shiva Pooja completely neutralizes their harsh transits."
      }
    }
  ];

  // 4 Graha Beeja Mantras & Consecration Protocol (Group 2)
  const GRAHA_GROUP_2: { title: L5; mantra: string; desc: L5 }[] = [
    {
      title: { kn: "☀️ ೧. ಸೂರ್ಯ ಗ್ರಹ ಬೀಜ ಮಂತ್ರ ಜಪ", hi: "☀️ १. सूर्य ग्रह बीज मंत्र जप", te: "☀️ ౧. సూర్య గ్రహ బీజ మంత్ర జపం", ta: "☀️ 1. சூரிய கிரக பீஜ மந்திர ஜபம்", en: "☀️ 1. Surya Beeja Mantra Consecration" },
      mantra: "ॐ ह्रां ह्रीं सः सूर्याय नमः (Om Hram Hrim Sah Suryaya Namah)",
      desc: {
        kn: "ಪ್ರತಿದಿನ ರವಿವಾರ ಪ್ರಾತಃಕಾಲ ೧೦೮ ಬಾರಿ ಸೂರ್ಯ ಬೀಜಮಂತ್ರ ಜಪಿಸುವುದರಿಂದ ಶಾರೀರಿಕ ತೇಜಸ್ಸು, ಕಣ್ಣಿನ ದೃಷ್ಟಿ ಹಾಗೂ ರಾಜಕೀಯ ರಕ್ಷಣೆ ಸಿದ್ಧಿಸುತ್ತದೆ.",
        hi: "प्रतिदिन रविवार प्रातः १०८ बार सूर्य बीजमंत्र का पाठ करने से शरीर में तेज, नेत्र ज्योति तथा राजकीय सफलता मिलती है।",
        te: "ప్రతిరోజూ ఆదివారం ఉదయం 108 సార్లు సూర్య బీజమంత్రం జపించడం వలన శరీర తేజస్సు, ఆరోగ్య రక్షణ లభిస్తాయి.",
        ta: "ஞாயிறுதோறும் 108 முறை சூரிய பீஜ மந்திரம் ஜபிப்பது உடல் பிரகாசம், கண் பார்வை மற்றும் அரச காரிய வெற்றி தரும்.",
        en: "Chanting Surya Beeja Mantra 108 times on Sunday mornings boosts immunity, vital radiance, and professional recognition."
      }
    },
    {
      title: { kn: "🕉️ ೨. ಮಹಾದೇವ ರುದ್ರ ಗಾಯತ್ರೀ ಜಪ", hi: "🕉️ २. महादेव रुद्र गायत्री जप", te: "🕉️ ౨. మహదేవ రుద్ర గాయత్రీ జపం", ta: "🕉️ 2. மகாதேவ ருத்ர காயத்ரி ஜபம்", en: "🕉️ 2. Shiva Rudra Gayatri Mantra" },
      mantra: "ॐ तत्पुरुषाय विद्महे महादेवाय धीमहि तन्नो रुद्रः प्रचोदयात्",
      desc: {
        kn: "ರುದ್ರ ಗಾಯತ್ರೀ ಮಂತ್ರ ಪಠಣವು ಸಕಲ ದುಷ್ಟ ಗ್ರಹಗಳ ಬಾಧೆ, ಭ್ರಮೆ ಹಾಗೂ ನಕಾರಾತ್ಮಕ ಚಿಂತನೆಗಳನ್ನು ತಕ್ಷಣ ಭಸ್ಮೀಭೂತಗೊಳಿಸಿ ಜ್ಞಾನ ನೀಡುತ್ತದೆ.",
        hi: "रुद्र गायत्री मंत्र का पाठ समस्त दुष्ट ग्रहों की बाधा, भ्रम तथा नकारात्मक विचारों को तुरंत भस्म कर ज्ञान प्रदान करता है।",
        te: "రుద్ర గాయత్రీ మంత్ర పఠనం దుష్ట గ్రహ పీడలు, భ్రమలను తొలగించి జ్ఞానాన్ని ప్రసాదిస్తుంది.",
        ta: "ருத்ர காயத்ரி மந்திர ஜபம் துஷ்ட கிரக பீடைகளை எரித்து ஞானத்தையும் அமைதியையும் தரும்.",
        en: "Reciting Rudra Gayatri Mantra purifies mind channels, burns negative planetary vibrations, and brings spiritual illumination."
      }
    },
    {
      title: { kn: "🪔 ೩. ಮಹಾಲಕ್ಷ್ಮೀ ಕೃಪಾ ಮೂಲ ಮಂತ್ರ", hi: "🪔 ३. महालक्ष्मी कृपा मूल मंत्र", te: "🪔 ౩. మహాలక్ష్మీ కృపా మూల మంత్రం", ta: "🪔 3. மகாலக்ஷ்மி கிருபா மூல மந்திரம்", en: "🪔 3. Mahalakshmi Wealth Seed Mantra" },
      mantra: "ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ತ್ರಿಭುವನ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ಅಸ್ಮಾಕಂ ದಾರಿದ್ರ್ಯ ನಾಶಯ",
      desc: {
        kn: "ಶುಕ್ರವಾರ ಸಂಜೆ ಮಹಾಲಕ್ಷ್ಮೀ ಮಂತ್ರ ಜಪ ಮಾಡುವುದರಿಂದ ವ್ಯಾಪಾರದಲ್ಲಿ ಸ್ಥಿರ ಧನಾಗಮನ ಹಾಗೂ ಮನೆಯಲ್ಲಿ ಅಖಂಡ ಅನ್ನ-ವಸ್ತ್ರ ಸಮೃದ್ಧಿ ಸಿದ್ಧಿಸುತ್ತದೆ.",
        hi: "शुक्रवार सायं महालक्ष्मी मंत्र का जप करने से व्यापार में अखंड धन आगमन तथा घर में अन्न-वस्त्र समृद्धि की प्राप्ति होती है।",
        te: "శుక్రవారం సాయంత్రం మహాలక్ష్మీ మంత్రం జపించడం వలన వ్యాపారంలో నిరంతర ధనాగమనం మరియు కుటుంబ సమృద్ధి కలుగుతాయి.",
        ta: "வெள்ளிக்கிழமை மாலையில் மகாலக்ஷ்மி மந்திரம் ஜபிப்பது வியாபார தன வரவையும் குடும்ப சுபிட்சத்தையும் தரும்.",
        en: "Chanting Mahalakshmi Mantra on Friday evenings invokes unbroken financial abundance and domestic wealth stability."
      }
    },
    {
      title: { kn: "🛡️ ೪. ಶ್ರೀ ಕಾಲಭೈರವ ರಕ್ಷಾ ಕವಚ ಸ್ತೋತ್ರ", hi: "🛡️ ४. श्री कालभैरव रक्षा कवच स्तोत्र", te: "🛡️ ౪. శ్రీ కాలభైరవ రక్షా కవచ స్తోత్రం", ta: "🛡️ 4. ஸ்ரீ காலபைரவர் ரக்ஷா கவசம்", en: "🛡️ 4. Kaalabhairava Protection Shield" },
      mantra: "ॐ ಭ್ರಂ ಕಾಲಭೈರವಾಯ ನಮಃ (Om Bhram Kaalabhairavaya Namah)",
      desc: {
        kn: "ಕಾಲಭೈರವ ಮಂತ್ರ ಜಪವು ಶತ್ರು ಬಾಧೆ, ಆಪತ್ತುಗಳು, ಕಳ್ಳಕಾಕರ ಭಯ ಹಾಗೂ ದುಷ್ಟ ದೃಷ್ಟಿ ಪ್ರಭಾವಗಳನ್ನು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಧ್ವಂಸಗೊಳಿಸಿ ಅಭಯ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.",
        hi: "कालभैरव मंत्र जप शत्रु बाधा, दुर्घटना भय तथा कुदृष्टि के प्रभाव को नष्ट कर अभय रक्षा प्रदान करता है।",
        te: "కాలభైరవ మంత్ర జపం శత్రు బాధలు, ఆపదలు మరియు దిష్టి దోషాలను పోగొట్టి అభయ రక్షణ ఇస్తుంది.",
        ta: "காலபைரவர் மந்திர ஜபம் சத்ரு பயம், விபத்துக்கள் மற்றும் கண் திருஷ்டியை அழித்து பூரண பாதுகாப்பு தரும்.",
        en: "Chanting Kaalabhairava Mantra shatters enemy plots, accidental hazards, and psychic distress, providing an impenetrable energy shield."
      }
    }
  ];

  return (
    <div className="pdf-page" style={pageStyle}>
      <div
        style={{
          border: `3px double ${GOLD}`,
          borderRadius: 16,
          padding: "24px 28px",
          minHeight: PAGE_H - 76,
          boxSizing: "border-box",
          backgroundColor: PAPER,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, color: GOLD, letterSpacing: 2 }}>❖</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: INK, marginTop: 2, lineHeight: 1.5 }}>
              ✦ {sevaTitle} — {pick({ kn: "ಮಹಾಪೂಜಾ ಮಹಿಮೆ ಹಾಗೂ ದಿವ್ಯ ಫಲಶ್ರುತಿ", hi: "महापूजा महिमा एवं दिव्य फलश्रुति", te: "మహాపూజా మహిమ మరియు దివ్య ఫలశ్రుతి", ta: "மகாபூஜை மகிமை மற்றும் திவ்ய பலன்கள்", en: "Sacred Pooja Significance & Divine Blessings" }, lang)} ✦
            </div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 4, lineHeight: 1.65 }}>
              {pick({ kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನೆರವೇರಿದ ಪೂಜೆಯ ವಿಸ್ತಾರ ವಿವರ ಹಾಗೂ ನವಗ್ರಹ ಫಲಾವಳಿ", hi: "श्री क्षेत्र गोकर्ण महाबलेश्वर सन्निधि में संपन्न पूजा का विस्तृत विवरण एवं नवग्रह फलादेश", te: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధిలో నిర్వహించిన పూజ విశేషాలు మరియు నవగ్రహ ఫలాలు", ta: "ஸ்ரீ க்ஷேத்திர கோகர்ண மகாபலேஸ்வர சந்நிதியில் நடைபெற்ற பூஜையின் விவரங்கள் மற்றும் நவகிரக பலன்கள்", en: "Detailed spiritual exposition, planetary blessings, and divine fruits of the sacred Gokarna Seva" }, lang)}
            </div>
          </div>

          <OrnamentRule />

          {/* Section 1: 3 Core Pooja Mahatme Summary Blocks */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div
                style={{
                  border: `1.5px solid ${GOLD_LIGHT}`,
                  borderRadius: 10,
                  backgroundColor: PANEL,
                  padding: "14px 16px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 6, lineHeight: 1.45 }}>
                  {pick({ kn: "೧. ಪೂಜಾ ಮಹಾ ಸಂಕಲ್ಪ", hi: "१. पूजा महा संकल्प", te: "౧. పూజా మహా సంకల్పం", ta: "1. பூஜை மகா சங்கல்பம்", en: "1. What is this Sacred Seva?" }, lang)}
                </div>
                <div style={{ fontSize: 11, color: INK, lineHeight: 1.7, textAlign: "justify" }}>
                  {wPooja}
                </div>
              </div>

              <div
                style={{
                  border: `1.5px solid ${GOLD_LIGHT}`,
                  borderRadius: 10,
                  backgroundColor: "#FFFFFF",
                  padding: "14px 16px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 6, lineHeight: 1.45 }}>
                  {pick({ kn: "೨. ಪೂಜೆಯ ಪರಮ ಕಾರಣ", hi: "२. पूजा का परम कारण", te: "౨. పూజకు పరమ కారణం", ta: "2. பூஜையின் முக்கிய காரணம்", en: "2. Why is this Seva Performed?" }, lang)}
                </div>
                <div style={{ fontSize: 11, color: INK, lineHeight: 1.7, textAlign: "justify" }}>
                  {yPooja}
                </div>
              </div>

              <div
                style={{
                  border: `1.5px solid ${GOLD_LIGHT}`,
                  borderRadius: 10,
                  backgroundColor: PANEL,
                  padding: "14px 16px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 6, lineHeight: 1.45 }}>
                  {pick({ kn: "೩. ದಿವ್ಯ ಫಲಶ್ರುತಿ", hi: "३. दिव्य फलश्रुति", te: "౩. దివ్య ఫలశ్రుతి", ta: "3. திவ்ய பலன்கள்", en: "3. Sacred Fruits & Benefits" }, lang)}
                </div>
                <div style={{ fontSize: 11, color: INK, lineHeight: 1.7, textAlign: "justify" }}>
                  {bPooja}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 4 Primary Graha Position Cards (Group 1 - 4 Cards) */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 8, textTransform: "uppercase", textAlign: "center" }}>
              ✦ ೪ ಮೂಲ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಹಾಗೂ ಗೋಕರ್ಣ ಪೂಜಾ ಪ್ರಭಾವ (Graha Group 1: 4 Cards) ✦
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {GRAHA_GROUP_1.map((gr, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: 10,
                    backgroundColor: "#FFFFFF",
                    padding: "12px 16px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, marginBottom: 2, lineHeight: 1.45 }}>
                    {pick(gr.name, lang)}
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: GOLD, marginBottom: 3 }}>
                    {pick(gr.role, lang)}
                  </div>
                  <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.65 }}>
                    {pick(gr.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: 4 Graha Beeja Mantras & Consecration Protocol (Group 2 - 4 Cards) */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 8, textTransform: "uppercase", textAlign: "center" }}>
              ✦ ೪ ಗ್ರಹ ಬೀಜ ಮಂತ್ರ ಜಪ ಹಾಗೂ ದಿವ್ಯ ಕವಚ ವಿಧಾನ (Graha Group 2: 4 Cards) ✦
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {GRAHA_GROUP_2.map((gm, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: 10,
                    backgroundColor: PANEL,
                    padding: "12px 16px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, marginBottom: 2, lineHeight: 1.45 }}>
                    {pick(gm.title, lang)}
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: GOLD, letterSpacing: 0.5, marginBottom: 3 }}>
                    {gm.mantra}
                  </div>
                  <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.65 }}>
                    {pick(gm.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Chief Archaka Official Seal Badge & Royal Gold Emblem */}
        <div
          style={{
            marginTop: 16,
            marginBottom: 20,
            border: `2px solid ${GOLD}`,
            borderRadius: 12,
            backgroundColor: "#FFFFFF",
            padding: "14px 20px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16
          }}
        >
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 4 }}>
              {pick(SEAL_HEADER_DICT, lang)}
            </div>
            <div style={{ fontSize: 12.5, color: INK, fontWeight: 700 }}>
              {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"} — {pick({ kn: "ಪ್ರಧಾನ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ", hi: "प्रधान अर्चक, गोकर्ण क्षेत्र", te: "ప్రధాన అర్చకులు, గోకర్ణ క్షేత్రం", ta: "பிரதான அர்ச்சகர், கோகர்ண க்ஷேத்திரம்", en: "Pradhana Archaka, Gokarna Kshetra" }, lang)}
            </div>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 4, lineHeight: 1.65 }}>
              {pick(SEAL_DESC_DICT, lang)}
            </div>
          </div>

          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: 43,
              border: `2.5px double ${GOLD}`,
              backgroundColor: PANEL,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 12px rgba(180, 140, 60, 0.25)`
            }}
          >
            <div style={{ fontSize: 18, color: GOLD }}>🕉️</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: INK, textTransform: "uppercase", marginTop: 2, textAlign: "center" }}>
              GOKARNA
            </div>
            <div style={{ fontSize: 7, color: GOLD, textTransform: "uppercase" }}>
              CHIEF ARCHAKA
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 36,
            right: 36,
            textAlign: "center",
            fontSize: 10,
            color: INK_SOFT
          }}
        >
          {pick(LETTER_L5.signature!, lang)} · 5 / 5
        </div>
      </div>
    </div>
  );
};
