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
import { transliterateName } from "../../../utils/transliterator";
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
  position: "relative",
  lineHeight: 1.8,
  letterSpacing: "normal"
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
        [pick(T.labelName!, lang), (identity as any).aiTransliteratedName || transliterateName(identity.personName, lang)],
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
              lineHeight: 2.4,
              color: INK
            }}
          >
            {SHLOKA_SHIVA.sanskrit.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: INK_SOFT, lineHeight: 1.8 }}>
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
          {pick(LETTER_L5.salutation!, lang)} {(identity as any).aiTransliteratedName || transliterateName(identity.personName, lang)},
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
            [pick(T.sevaPerformed!, lang), (primarySeva?.seva?.name ? pick(primarySeva.seva.name, lang) : (primarySeva as any)?.name ? pick((primarySeva as any).name, lang) : "—")],
            [pick(T.sevaDate!, lang), sevaDate || "—"],
            [pick(T.sevaPlace!, lang), (primarySeva?.seva?.where ? pick(primarySeva.seva.where, lang) : (primarySeva as any)?.where ? pick((primarySeva as any).where, lang) : "—")],
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
            style={{ fontSize: 14.5, lineHeight: 2.4, color: INK }}
          >
            {(primarySeva?.seva?.shloka ?? (primarySeva as any)?.shloka ?? SHLOKA_SHIVA).sanskrit.split('\n').map((line: string, i: number) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: INK_SOFT, lineHeight: 1.8 }}>
            {pick((primarySeva?.seva?.shloka ?? (primarySeva as any)?.shloka ?? SHLOKA_SHIVA).meaning, lang)}
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
  qrDataUrl,
  target = "google"
}: {
  lang: string;
  identity: Identity;
  qrDataUrl?: string;
  target?: "google" | "webcal" | "sanctum";
}): JSX.Element => {
  const [internalQr, setInternalQr] = useState<string>(qrDataUrl || "");

  useEffect(() => {
    if (qrDataUrl) {
      setInternalQr(qrDataUrl);
      return;
    }
    // Guaranteed fallback QR code generation if qrDataUrl prop is empty
    const fallbackPayload = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Baggona 90-Day Panchanga Calendar")}&details=${encodeURIComponent("Baggona Panchanga Astrology - Gokarna Kshetra")}`;
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
          padding: "24px 30px",
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
          <div style={{ fontSize: 22, fontWeight: 700, color: INK, marginBottom: 6 }}>
            {pick(T.qrPrintHeader!, lang)}
          </div>
          <div style={{ fontSize: 13, color: INK_SOFT, marginBottom: 12, maxWidth: 660 }}>
            {pick(T.scanQrDesc!, lang)}
          </div>
        </div>

        <div
          style={{
            padding: 12,
            backgroundColor: "#FFFFFF",
            border: `2px solid ${GOLD_LIGHT}`,
            borderRadius: 14,
            display: "inline-block",
            marginBottom: 12,
            boxShadow: "0 6px 20px rgba(180, 83, 9, 0.10)"
          }}
        >
          {displayQr ? (
            <img src={displayQr} alt="Baggona Panchanga 90-Day Sync QR Code" style={{ width: 240, height: 240, display: "block" }} />
          ) : (
            <div style={{ width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: PANEL, color: GOLD, fontSize: 13, fontWeight: 700 }}>
              QR Code Consecrating...
            </div>
          )}
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginTop: 8 }}>
            {target === "google"
              ? (lang.startsWith("kn") ? "🌟 ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್ 90-ದಿನಗಳ ನೇರ ಸಿಂಕ್" : "🌟 Google Calendar 90-Day Live Sync")
              : target === "webcal"
                ? (lang.startsWith("kn") ? "🍎 ಆಪಲ್ / ಔಟ್‌ಲುಕ್ .ics ಕ್ಯಾಲೆಂಡರ್ ಫೀಡ್" : "🍎 Apple & Outlook .ics Calendar Feed")
                : (lang.startsWith("kn") ? "🕉️ ಬಗ್ಗೋಣ ದೈನಿಕ ದರ್ಶನ ಗರ್ಭಗುಡಿ ವೆಬ್ ಆಪ್" : "🕉️ Baggona Daily Darshana Sanctum PWA")}
          </div>

        </div>

        <div style={{ textAlign: "left", width: "100%", maxWidth: 640, backgroundColor: PANEL, padding: "16px 22px", borderRadius: 14, border: `1.5px solid ${GOLD_LIGHT}`, boxSizing: "border-box" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: GOLD, marginBottom: 10, textTransform: "uppercase", textAlign: "center" }}>
            {pick(T.scanQrTitle!, lang)}
          </div>
          <div style={{ fontSize: 13.5, color: INK }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>📱</span> {pick(T.qrPrintStep1!, lang)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>📷</span> {pick(T.qrPrintStep2!, lang)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🔗</span> {pick(T.qrPrintStep3!, lang)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>✅</span> {pick(T.qrPrintStep4!, lang)}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            marginBottom: 20,
            fontSize: 12,
            color: INK_SOFT,
            fontWeight: 600,
            lineHeight: 1.6
          }}
        >
          🕉️ {pick({ kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಕೃಪೆ ಸದಾ ನಿಮ್ಮೊಂದಿಗಿರಲಿ", hi: "श्री गोकर्ण महाबलेश्वर स्वामी की दिव्य कृपा सदैव आप पर बनी रहे", te: "శ్రీ గోకర్ణ మహాబలేశ్వర స్వామివారి దివ్య కృపాకటాక్షాలు సదా మీతో ఉండుగాక", ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வர சுவாமியின் திவ்ய கிருபை எப்போதும் உங்களுடன் இருப்பதாக", en: "May the divine grace of Shri Gokarna Mahabaleshwara always protect you" }, lang)}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 40,
            right: 40,
            textAlign: "center",
            fontSize: 9.5,
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
    kn: "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸನ್ನಿಧಿಯಿಂದ ಅರ್ಚಕರು ಸೂಚಿಸಿದ ನಿತ್ಯ ಧರ್ಮ ಸೂತ್ರಗಳು ಹಾಗೂ ಪೂಜಾ ಮಾರ್ಗದರ್ಶಿ",
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
        kn: "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಸ್ನಾನದ ನಂತರ ದೇವರ ಮನೆಯಲ್ಲಿ ದೀಪ ಹಚ್ಚಿ, ಪೂರ್ವಾಭಿಮುಖವಾಗಿ ಕುಳಿತು ೧೦೮ ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸುವುದು ಮಾನಸಿಕ ಶಾಂತಿ ಹಾಗೂ ಧನಾತ್ಮಕ ಶಕ್ತಿ ನೀಡುತ್ತದೆ.",
        hi: "प्रतिदिन प्रातः स्नान के पश्चात पूजा घर में दीपक जलाकर पूर्व दिशा की ओर बैठकर १०८ बार 'ॐ नमः शिवाय' का जाप करें। यह मानसिक शांति एवं सकारात्मक ऊर्जा देता है।",
        te: "ప్రతిరోజూ ఉదయం స్నానానంతరం పూజాగదిలో దీపం వెలిగించి, తూర్పు ముఖంగా కూర్చుని 108 సార్లు 'ఓం నమః శివాయ' జపించండి. ఇది మనశ్శాంతిని ఇస్తుంది.",
        ta: "தினமும் காலையில் குளித்தபின் பூஜை அறையில் தீபம் ஏற்றி, கிழக்கு நோக்கி அமர்ந்து 108 முறை 'ஓம் நம சிவாய' ஜபிக்கவும். இது மன அமைதி தரும்.",
        en: "Every morning after bath, light a pure lamp facing East and chant 108 times 'Om Namah Shivaya' to attract mental peace and positive energy."
      }
    },
    {
      title: { kn: "🥛 ಸೋಮವಾರ ಕ್ಷೀರಾಭಿಷೇಕ", hi: "🥛 सोमवार दुग्धाभिषेक", te: "🥛 సోమవారం క్షీరాభిషేకం", ta: "🥛 திங்கள்கிழமை பாலாபிஷேகம்", en: "🥛 Monday Milk Archana" },
      desc: {
        kn: "ಪ್ರತಿ ಸೋಮವಾರ ಶಿವಲಿಂಗಕ್ಕೆ ಹಾಲಿನ ಅಭಿಷೇಕ ಮಾಡಿ ಬಿಲ್ವಪತ್ರೆ ಸಮರ್ಪಿಸುವುದರಿಂದ ಚಂದ್ರ ದೋಷ ನಿವಾರಣೆಯಾಗಿ ಮನಃಶಾಂತಿ, ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ ಹಾಗೂ ಉತ್ತಮ ಆರೋಗ್ಯ ಲಭಿಸುತ್ತದೆ.",
        hi: "प्रत्येक सोमवार शिवलिंग पर दूध से अभिषेक कर बिल्वपत्र अर्पित करें। इससे चंद्र दोष शांत होकर मानसिक शांति, पारिवारिक सौहार्द और उत्तम स्वास्थ्य मिलता है।",
        te: "ప్రతి సోమవారం శివలింగానికి పాలతో అభిషేకం చేసి బిల్వపత్రం సమర్పించండి. దీనివలన చంద్ర దోషం శమించి కుటుంబ సౌఖ్యం మరియు ఆరోగ్యం లభిస్తాయి.",
        ta: "ஒவ்வொரு திங்கள்கிழமையும் சிவலிங்கத்திற்கு பாலாபிஷேகம் செய்து வில்வபத்திரம் சாற்றவும். இதனால் குடும்ப யோகமும் ஆரோக்கியமும் கிட்டும்.",
        en: "Offering milk abhishekam and Bilva leaves to Lord Shiva on Mondays relieves mental stress and brings family harmony and vibrant health."
      }
    },
    {
      title: { kn: "🌾 ಗೋಸೇವೆ ಹಾಗೂ ಅನ್ನದಾನ", hi: "🌾 गोसेवा एवं अन्नदान", te: "🌾 గోసేవ మరియు అన్నదానం", ta: "🌾 பசு சேவை மற்றும் அன்னதானம்", en: "🌾 Cow Service & Charity" },
      desc: {
        kn: "ಶನಿವಾರ ಅಥವಾ ಏಕಾದಶಿಯಂದು ಗೋವುಗಳಿಗೆ ಮೇವು ನೀಡುವುದು ಮತ್ತು ಅನ್ನದಾನ ಮಾಡುವುದು ಪಿತೃ ದೋಷ, ಗ್ರಹ ದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸಿ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ನೀಡುತ್ತದೆ.",
        hi: "शनिवार या एकादशी को गायों को हरा चारा खिलाएं तथा अन्नदान करें। यह पितृ दोष एवं ग्रह दोषों को शांत कर पारिवारिक शांति प्रदान करता है।",
        te: "శనివారం లేదా ఏకాదశి నాడు ఆవులకు గడ్డి తినిపించడం మరియు అన్నదానం చేయడం వలన పితృ దోషాలు, గ్రహ దోషాలు తొలగిపోతాయి.",
        ta: "சனிக்கிழமை அல்லது ஏகாதசியன்று பசுக்களுக்கு புல் வழங்குவதும் அன்னதானமும் செய்வது பித்ரு தோஷங்களை நீக்கும்.",
        en: "Feeding cows and offering food charity on Saturdays or Ekadashi neutralizes ancestral and planetary afflictions, restoring family peace."
      }
    },
    {
      title: { kn: "📿 ಜನ್ಮ ನಕ್ಷತ್ರ ಮಂತ್ರ ಜಪ", hi: "📿 जन्म नक्षत्र मंत्र जप", te: "📿 జన్మ నక్షత్ర మంత్ర జపం", ta: "📿 ஜன்ம நட்சத்திர மந்திர ஜபம்", en: "📿 Nakshatra Beeja Discipline" },
      desc: {
        kn: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಅಧಿಪತಿ ಮಂತ್ರವನ್ನು ಪ್ರತಿದಿನ ೧೦೮ ಬಾರಿ ನಿಷ್ಠೆಯಿಂದ ಜಪಿಸುವುದು ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಯಶಸ್ಸು, ಆತ್ಮವಿಶ್ವಾಸ ಹಾಗೂ ನಿರಂತರ ಅಭಿವೃದ್ಧಿಯನ್ನು ತರುತ್ತದೆ.",
        hi: "अपने जन्म नक्षत्र के स्वामी मंत्र का प्रतिदिन १०८ बार निष्ठापूर्वक जाप करें। यह कार्यक्षेत्र में सफलता, आत्मविश्वास और निरंतर उन्नति प्रदान करता है।",
        te: "మీ జన్మ నక్షత్రాధిపతి మంత్రాన్ని ప్రతిరోజూ 108 సార్లు జపించండి. ఇది ఉద్యోగ వ్యాపారాలలో విజయం మరియు ఆత్మవిశ్వాసాన్ని ఇస్తుంది.",
        ta: "உங்கள் ஜன்ம நட்சத்திர அதிபதியின் மந்திரத்தை தினமும் 108 முறை ஜபித்து வரவும். இது தொழில், வியாபாரத்தில் வெற்றி தரும்.",
        en: "Chanting your birth star's ruling planet mantra 108 times daily activates inner confidence, professional growth, and protection."
      }
    }
  ];

  const TITHI_TITLE_DICT: L5 = {
    kn: "✦ ಮಾಸಿಕ ಮುಖ್ಯ ಪೂಜಾ ದಿನಸೂಚಿ ✦",
    hi: "✦ मासिक मुख्य पूजा तिथिसूची ✦",
    te: "✦ మాసిక ముఖ్య పూజా దినసూచి ✦",
    ta: "✦ மாதாந்திர விசேஷ பூஜை நாட்காட்டி ✦",
    en: "✦ Monthly Auspicious Tithi Worship Guide ✦"
  };

  const TITHI_GUIDE: { name: L5; desc: L5 }[] = [
    {
      name: { kn: "ಪ್ರದೋಷ ಪೂಜೆ", hi: "प्रदोष पूजा", te: "ప్రదోష పూజ", ta: "பிரதோஷ பூஜை", en: "Pradosha Pooja" },
      desc: {
        kn: "ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ ಶಿವನಿಗೆ ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ದೀಪಾರಾಧನೆ ಮಾಡುವುದರಿಂದ ಮಾನಸಿಕ ಒತ್ತಡ, ಸಾಲ ಬಾಧೆ ಹಾಗೂ ಅಡೆತಡೆಗಳು ಶಮನಗೊಳ್ಳುತ್ತವೆ.",
        hi: "प्रदोष काल में शिवजी को बिल्वार्चन एवं दीपाराधन करने से मानसिक तनाव, ऋण बाधा तथा रुकावटें दूर होती हैं।",
        te: "ప్రదోష కాలంలో శివునికి బిల్వార్చన చేయడం వలన మానసిక ఒత్తిడి, అప్పుల బాధలు తొలగిపోతాయి.",
        ta: "பிரதோஷ காலத்தில் சிவனுக்கு வில்வார்ச்சனை செய்வது மன அழுத்தம் மற்றும் கடன் தொல்லைகளை நீக்கும்.",
        en: "Worshipping Shiva with Bilva leaves during evening Pradosha eliminates stress and financial debt burdens."
      }
    },
    {
      name: { kn: "ಸಂಕಷ್ಟ ಚತುರ್ಥಿ", hi: "संकष्टी चतुर्थी", te: "సంకష్ట చతుర్థి", ta: "சங்கடஹர சதுர்த்தி", en: "Sankashti Chaturthi" },
      desc: {
        kn: "ಸಂಕಷ್ಟ ಚತುರ್ಥಿಯಂದು ಗಣಪತಿಗೆ ಗರಿಕೆ ಅರ್ಚನೆ ಮಾಡುವುದರಿಂದ ವ್ಯಾಪಾರ, ಉದ್ಯೋಗ ಹಾಗೂ ನೂತನ ಕೆಲಸಗಳಲ್ಲಿ ಬರುವ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ.",
        hi: "संकष्टी चतुर्थी पर गणपति को दुर्वा अर्पित करने से व्यापार, नौकरी तथा नए कार्यों के विघ्न दूर होते हैं।",
        te: "సంకష్ట చతుర్థి నాడు గణపతికి గరికే అర్చన చేయడం వలన వ్యాపారం, ఉద్యోగాలలో విఘ్నాలు తొలగిపోతాయి.",
        ta: "சங்கடஹர சதுர்த்தியன்று கணபதிக்கு அருகம்புல் அர்ச்சனை செய்வது தொழிலில் வரும் தடைகளை அகற்றும்.",
        en: "Offering Durva grass to Lord Ganesha on Sankashti Chaturthi clears career roadblocks and ensures success."
      }
    },
    {
      name: { kn: "ಏಕಾದಶಿ ವ್ರತ", hi: "एकादशी व्रत", te: "ఏకాదశి వ్రతం", ta: "ஏகாதசி விரதம்", en: "Ekadashi Vrata" },
      desc: {
        kn: "ಏಕಾದಶಿಯಂದು ಉಪವಾಸವಿದ್ದು ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸುವುದರಿಂದ ಶರೀರ ಆರೋಗ್ಯ, ದೀರ್ಘ ಆಯುಷ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖ ಲಭಿಸುತ್ತದೆ.",
        hi: "एकादशी पर उपवास रखकर विष्णु सहस्रनाम पाठ करने से उत्तम स्वास्थ्य, दीर्घ आयु तथा पारिवारिक सुख मिलता है।",
        te: "ఏకాదశి నాడు విష్ణు సహస్రనామం పఠించడం వలన ఆరోగ్యం, ఆయుష్షు మరియు కుటుంబ సౌఖ్యం లభిస్తాయి.",
        ta: "ஏகாதசியன்று விஷ்ணு சகஸ்ரநாமம் ஜபிப்பது நல்ல ஆரோக்கியம், நீண்ட ஆயுள் மற்றும் குடும்ப சுகம் தரும்.",
        en: "Observing Ekadashi and reciting Vishnu Sahasranama purifies health, grants longevity, and stabilizes home peace."
      }
    },
    {
      name: { kn: "ಹುಣ್ಣಿಮೆ / ಅಮಾವಾಸ್ಯೆ", hi: "पूर्णिमा / अमावस्या", te: "పౌర్ణమి / అమావాస్య", ta: "பௌர்ணமி / அமாவாசை", en: "Purnima / Amavasya" },
      desc: {
        kn: "ಹುಣ್ಣಿಮೆಯಂದು ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ ಹಾಗೂ ಅಮಾವಾಸ್ಯೆಯಂದು ಪಿತೃ ತರ್ಪಣ ಮತ್ತು ಶಿವ ಸ್ಮರಣೆಯು ಮನೆಗೆ ದಿವ್ಯ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.",
        hi: "पूर्णिमा को सत्यनारायण पूजा तथा अमावस्या को पितृ तर्पण एवं शिव स्मरण घर को दिव्य सुरक्षा प्रदान करता है।",
        te: "పౌర్ణమినాడు సత్యనారాయణ పూజ మరియు అమావాస్య నాడు పితృ తర్పణం ఇంట దివ్య రక్షణను ఇస్తాయి.",
        ta: "பௌர்ணமியில் சத்தியநாராயண பூஜையும் அமாவாசையில் பித்ரு தர்பணமும் செய்வது குடும்பத்திற்கு பாதுகாப்பு தரும்.",
        en: "Satyanarayan Pooja on Purnima and Ancestral Tarpanam on Amavasya invokes powerful family protection."
      }
    }
  ];

  const STOTRA_TITLE_DICT: L5 = {
    kn: "✦ ಚತುಷ್ಕಾಲ ಸ್ತೋತ್ರ ಜಪ ಹಾಗೂ ನಿತ್ಯ ಪ್ರಾರ್ಥನೆ ✦",
    hi: "✦ चतुष्काल स्तोत्र जप एवं नित्य प्रार्थना ✦",
    te: "✦ చతుష్కాల స్తోత్ర జపం మరియు నిత్య ప్రార్థన ✦",
    ta: "✦ நாற்கால தோத்திர ஜபமும் நித்ய பிரார்த்தனையும் ✦",
    en: "✦ 4-Time Daily Stotra Recitation & Prayer ✦"
  };

  const STOTRA_LIST: { title: L5; desc: L5 }[] = [
    {
      title: { kn: "🌅 ಪ್ರಾತಃಕಾಲ: ಶಿವ ಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರ", hi: "🌅 प्रातःकाल: शिव पंचाक्षरी स्तोत्र", te: "🌅 ప్రాతఃకాలం: శివ పంచాక్షరీ స్తోత్రం", ta: "🌅 காலை: சிவ பஞ்சாட்சரி தோத்திரம்", en: "🌅 Morning: Shiva Panchakshari Stotra" },
      desc: {
        kn: "ಉದಯಕಾಲದಲ್ಲಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರವನ್ನು ೧೧ ಬಾರಿ ಪಠಿಸುವುದು ಮನಸ್ಸಿಗೆ ಉಲ್ಲಾಸ ಹಾಗೂ ದಿನವಿಡೀ ಉತ್ಸಾಹ ನೀಡುತ್ತದೆ.",
        hi: "प्रातःकाल में 'नमः शिवाय' पंचाक्षरी स्तोत्र का ११ बार पाठ करने से दिनभर मन में उत्साह एवं आत्मविश्वास बढ़ता है।",
        te: "ఉదయం 'నమః శివాయ' పంచాక్షరీ స్తోత్రమును 11 సార్లు పఠించడం వలన రోజంతా మనస్సులో ఉత్సాహం పెరుగుతుంది.",
        ta: "காலையில் 'நம சிவாய' பஞ்சாட்சரி தோத்திரத்தை 11 முறை ஜபிப்பது நாள் முழுவதும் மன அமைதி மற்றும் தைரியம் தரும்.",
        en: "Reciting Shiva Panchakshari Stotra 11 times at dawn fills your mind with courage and positive focus all day."
      }
    },
    {
      title: { kn: "☀️ ಮಧ್ಯಾಹ್ನ: ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಸ್ಮರಣೆ", hi: "☀️ मध्याह्न: विष्णु सहस्रनाम स्मरण", te: "☀️ మధ్యాహ్నం: విష్ణు సహస్రనామ స్మరణ", ta: "☀️ நண்பகல்: விஷ்ணு சகஸ்ரநாம ஸ்மரணம்", en: "☀️ Noon: Vishnu Sahasranama" },
      desc: {
        kn: "ಮಧ್ಯಾಹ್ನದ ವೇಳೆ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಅಥವಾ ಗಾಯತ್ರಿ ಧ್ಯಾನ ಮಾಡುವುದರಿಂದ ಸದ್ಬುದ್ಧಿ ಹಾಗೂ ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ಅಭಿವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
        hi: "मध्याह्न काल में विष्णु सहस्रनाम या गायत्री ध्यान करने से सद्बुद्धि एवं व्यापार में निरंतर वृद्धि होती है।",
        te: "మధ్యాహ్నం విష్ణు సహస్రనామం లేదా గాయత్రీ ధ్యానం చేయడం వలన సద్బుద్ధి మరియు వ్యాపార అభివృద్ధి లభిస్తాయి.",
        ta: "நண்பகலில் விஷ்ணு சகஸ்ரநாமம் அல்லது காயத்ரி தியானம் செய்வது நல்புத்தி மற்றும் தொழில் வளர்ச்சி தரும்.",
        en: "Reciting Vishnu Sahasranama or Gayatri Dhyana around noon enhances intellect and commercial growth."
      }
    },
    {
      title: { kn: "🪔 ಸಾಯಂಕಾಲ: ಪ್ರದೋಷ ದೀಪಾರಾಧನೆ", hi: "🪔 सायं: प्रदोष दीपाराधन एवं जप", te: "🪔 సాయంత్రం: ప్రదోష దీపారాధన", ta: "🪔 மாலை: பிரதோஷ தீபாராதனை", en: "🪔 Evening: Pradosha Lamp & Mantra" },
      desc: {
        kn: "ಸೂರ್ಯಾಸ್ತದ ನಂತರ ದೇವರ ಮನೆಯಲ್ಲಿ ದೀಪ ಬೆಳಗಿಸಿ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಿಸುವುದು ಕೌಟುಂಬಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಶಾಂತಿ ತರುತ್ತದೆ.",
        hi: "सूर्यास्त के पश्चात पूजा घर में दीपक जलाकर मृत्युंजय मंत्र का पाठ करने से परिवार में सुरक्षा और शांति आती है।",
        te: "సాయంత్రం పూజాగదిలో దీపం వెలిగించి మృత్యుంజయ మంత్రం జపించడం వలన కుటుంబ రక్షణ మరియు శాంతి కలుగుతాయి.",
        ta: "மாலையில் பூஜை அறையில் தீபம் ஏற்றி மிருத்யுஞ்சய மந்திரம் ஜபிப்பது குடும்ப பாதுகாப்பும் அமைதியும் தரும்.",
        en: "Lighting an evening oil lamp and chanting Maha Mrityunjaya Mantra brings a protective spiritual shield."
      }
    },
    {
      title: { kn: "🌙 ರಾತ್ರಿ: ಶಾಂತಿ ಪ್ರಾರ್ಥನೆ", hi: "🌙 रात्रि: शांति प्रार्थना", te: "🌙 రాత్రి: శాంతి ప్రార్థన", ta: "🌙 இரவு: அமைதி பிரார்த்தனை", en: "🌙 Night: Peace Prayer" },
      desc: {
        kn: "ನಿದ್ರೆಗಿಂತ ಮುನ್ನ ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗವನ್ನು ಸ್ಮರಿಸಿ 'ಶಂಭೋ ಮಹಾದೇವ' ಎಂದು ೯ ಬಾರಿ ಜಪಿಸುವುದು ಪ್ರಶಾಂತ ನಿದ್ರೆ ಹಾಗೂ ನೆಮ್ಮದಿ ನೀಡುತ್ತದೆ.",
        hi: "शयन से पूर्व गोकर्ण आत्मलिंग का स्मरण कर 'शंभो महादेव' ९ बार बोलने से शांतिदायक निद्रा प्राप्त होती है।",
        te: "నిద్రకు ముందు గోకర్ణ ఆత్మలింగాన్ని స్మరించి 'శంభో మహాదేవ' అని 9 సార్లు జపించడం ప్రశాంత నిద్రను ఇస్తుంది.",
        ta: "இரவில் உறங்கும் முன் கோகர்ண ஆத்மலிங்கத்தை நினைத்து 'சம்போ மகாதேவா' என 9 முறை ஜபிப்பது நிம்மதியான தூக்கம் தரும்.",
        en: "Before sleep, remembering Gokarna Atmalinga and mentally saying 'Shambho Mahadeva' 9 times brings restful sleep."
      }
    }
  ];

  const MANTHRA_DESC_DICT: L5 = {
    kn: "ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಣವು ನಿಮ್ಮ ಹಾಗೂ ನಿಮ್ಮ ಕುಟುಂಬದ ಸದಸ್ಯರಿಗೆ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ದಿವ್ಯ ರಕ್ಷಣೆ ನೀಡುವ ಶಿವ ಕವಚವಾಗಿದೆ.",
    hi: "महामृत्युंजय मंत्र का पाठ आपके और आपके परिवार के लिए उत्तम स्वास्थ्य, दीर्घायु एवं सुरक्षा का दिव्य शिव कवच है।",
    te: "మహా మృత్యుంజయ మంత్ర జపం మీ మరియు మీ కుటుంబ సభ్యుల ఆయుష్షు, ఆరోగ్యం మరియు రక్షణకు దివ్య శివ కవచం.",
    ta: "மகா மிருத்யுஞ்சய மந்திர ஜபம் உங்கள் குடும்பத்தின் ஆயுள், ஆரோக்கியம் மற்றும் பாதுகாப்புக்கு திவ்ய சிவ கவசம்.",
    en: "Reciting the sacred Maha Mrityunjaya Mantra serves as a divine shield granting longevity, health, and resilience."
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
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, color: GOLD, letterSpacing: 2 }}>❖</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: INK, marginTop: 2, lineHeight: 1.45 }}>
              {pick(TITLE_DICT, lang)}
            </div>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 3, lineHeight: 1.6, maxWidth: 720, margin: "3px auto 0" }}>
              {pick(SUBTITLE_DICT, lang)}
            </div>
          </div>

          <OrnamentRule />

          {/* Section 1: Devotee Commandments */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
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
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 3, lineHeight: 1.4 }}>
                    {pick(rule.title, lang)}
                  </div>
                  <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.6 }}>
                    {pick(rule.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Monthly Tithi Guide */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
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
                    padding: "8px 10px",
                    textAlign: "center",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, lineHeight: 1.4 }}>{pick(tg.name, lang)}</div>
                  <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 3, lineHeight: 1.55 }}>
                    {pick(tg.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: 4-Time Daily Stotra Recitation Guide */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
              {pick(STOTRA_TITLE_DICT, lang)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {STOTRA_LIST.map((st, idx) => (
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
                    {pick(st.title, lang)}
                  </div>
                  <div style={{ fontSize: 10, color: INK_SOFT, lineHeight: 1.55 }}>
                    {pick(st.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Maha Mrityunjaya Mantra Banner */}
          <div
            style={{
              marginTop: 10,
              backgroundColor: "#FFFFFF",
              border: `1.5px solid ${GOLD_LIGHT}`,
              borderRadius: 10,
              padding: "10px 14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 11.5, color: GOLD, letterSpacing: "normal" }}>
              <div>ॐ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ |</div>
              <div>ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ||</div>
            </div>
            <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 3, lineHeight: 1.55 }}>
              {pick(MANTHRA_DESC_DICT, lang)}
            </div>
          </div>

        {/* Section 5: Priest Direct Consultation Card & Seal */}
        <div
          style={{
            marginTop: 12,
            marginBottom: 16,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 11,
            backgroundColor: "#FFFFFF",
            padding: "10px 16px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 2 }}>
            ✦ {pick({ kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ ಅರ್ಚಕರ ಆಶೀರ್ವಾದ", hi: "गोकर्ण महाबलेश्वर क्षेत्र अर्चक आशीर्वाद", te: "గోకర్ణ మహాబలేశ్వర క్షేత్ర అర్చకుల ఆశీర్వాదం", ta: "கோகர்ண மகாபலேஸ்வர க்ஷேத்திர அர்ச்சகர் ஆசீர்வாதம்", en: "Gokarna Kshetra Archaka Benediction" }, lang)} ✦
          </div>
          <div style={{ fontSize: 11.5, color: INK, fontWeight: 700, marginTop: 1 }}>
            {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"} — {pick({ kn: "ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ", hi: "मुख्य अर्चक, गोकर्ण क्षेत्र", te: "ముఖ్య అర్చకులు, గోకర్ణ క్షేత్రం", ta: "முதன்மை அர்ச்சகர், கோகர்ண க்ஷேத்திரம்", en: "Chief Archaka, Gokarna Kshetra" }, lang)}
          </div>
          <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 2, lineHeight: 1.55 }}>
            {pick({ kn: "ವಿಶೇಷ ಗೋತ್ರ ಸಂಕಲ್ಪ ಸೇವೆ, ನವಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಗೋಕರ್ಣ ಪ್ರಸಾದ ಸೇವೆಗಾಗಿ ಅರ್ಚಕರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಬಹುದು.", hi: "विशेष गोत्र संकल्प पूजा, नवग्रह शांति एवं गोकर्ण प्रसाद सेवा हेतु अर्चक से संपर्क कर सकते हैं।", te: "విశేష గోత్ర సంకల్ప పూజ, నవగ్రహ శాంతి మరియు ప్రసాద సేవల కొరకు అర్చకులను సంప్రదించవచ్చు.", ta: "விசேஷ சங்கல்ப பூஜை, நவகிரக சாந்தி மற்றும் பிரசாத சேவைக்கு அர்ச்சகரை தொடர்புகொள்ளலாம்.", en: "For special Gotra Sankalpa Seva, Navagraha Shanti, and sacred Mahabaleshwara Prasada, consult the Archaka directly." }, lang)}
          </div>
        </div>

        {/* Page Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
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
    kn: "✦ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮಹಾಪೂಜಾ ಪರಿಹಾರ ಹಾಗೂ ಕೌಟುಂಬಿಕ ರಕ್ಷಾ ಪತ್ರಿಕೆ ✦",
    hi: "✦ गोकर्ण क्षेत्र महापूजा उपचार एवं पारिवारिक रक्षा पत्र ✦",
    te: "✦ గోకర్ణ క్షేత్ర మహాపూజా నివారణ మరియు కుటుంబ రక్షా పత్రం ✦",
    ta: "✦ கோகர்ண க்ஷேத்திரம் மகாபூஜை பரிகாரம் மற்றும் குடும்ப ரக்ஷா அட்டை ✦",
    en: "✦ Gokarna Kshetra Sacred Remedial Puja & Family Protection Sheet ✦"
  };

  const SUBTITLE_DICT: L5 = {
    kn: "೧೨ ಮಾಸಗಳ ಗ್ರಹ ದೋಷ ಶಮನ, ವಾಸ್ತು ಧರ್ಮ ಸೂತ್ರಗಳು ಹಾಗೂ ಕುಲದೇವರ ಪಿತೃ ಆಶೀರ್ವಾದ ಮಾರ್ಗದರ್ಶಿ",
    hi: "१२ मासों के ग्रह दोष निवारण, वास्तु धर्म सूत्र तथा कुलदेवता एवं पितृ आशीर्वाद मार्गदर्शिका",
    te: "໑௨ మాసముల గ్రహ దోష నివారణ, వాస్తు ధర్మ సూత్రాలు మరియు కులదేవత పితృ ఆశీర్వాద మార్గదర్శి",
    ta: "12 மாதங்களின் கிரக தோஷ நிவர்த்தி, வாஸ்து தர்ம சூத்திரங்கள் மற்றும் குலதெய்வ பித்ரு ஆசீர்வாத வழிகாட்டி",
    en: "Comprehensive 12-month planetary remedial cycle, domestic Vastu rules, and ancestral lineage peace guidelines"
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
        kn: "🌸 ಚೈತ್ರ - ವೈಶಾಖ: ಸೂರ್ಯ ಆರಾಧನೆ",
        hi: "🌸 चैत्र - वैशाख: सूर्य आराधना",
        te: "🌸 చైత్ర - వైశాఖ: సూర్య ఆరాధన",
        ta: "🌸 சித்திரை - வைகாசி: சூரிய ஆராதனை",
        en: "🌸 Chaitra - Vaisakha: Solar & Navaratri Worship"
      },
      desc: {
        kn: "ಉದ್ಯೋಗಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಶಾರೀರಿಕ ಆರೋಗ್ಯ ವೃದ್ಧಿಗೆ ವಸಂತ ನವರಾತ್ರಿ ಶ್ರೀ ಸೂಕ್ತ ಪೂಜೆ, ಅಕ್ಷಯ ತದಿಗೆ ಹಾಗೂ ಸೂರ್ಯಾಭಿಷೇಕ ಸೇವೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.",
        hi: "व्यापार वृद्धि एवं उत्तम स्वास्थ्य हेतु वसंत नवरात्रि श्री सूक्त पूजा, अक्षय तृतीया एवं सूर्याभिषेक सेवा सर्वश्रेष्ठ है।",
        te: "ఉద్యోగాభివృద్ధి మరియు ఆరోగ్యం కొరకు వసంత నవరాత్రి శ్రీ సూక్త పూజ, అక్షయ తృతీయ మరియు సూర్యాభిషేకం శ్రేష్ఠం.",
        ta: "தொழில் வளர்ச்சி மற்றும் ஆரோக்கியத்திற்கு வசந்த நவராத்திரி ஸ்ரீ சூக்த பூஜையும் அக்ஷய திருதியையும் சூரியாபிஷேகமும் சிறந்தது.",
        en: "Spring Navaratri Sri Sukta Pooja, Akshaya Tritiya, and Surya Abhishekam catalyze professional expansion and vitality."
      }
    },
    {
      title: {
        kn: "🌊 ಆಷಾಢ - ಶ್ರಾವಣ: ರುದ್ರಾಭಿಷೇಕ ಶಾಂತಿ",
        hi: "🌊 आषाढ़ - श्रावण: रुद्राभिषेक शांति",
        te: "🌊 ఆషాఢ - శ్రావణ: రుద్రాభిషేకం",
        ta: "🌊 ஆடி - ஆவணி: ருத்ராபிஷேகம்",
        en: "🌊 Ashadha - Shravana: Rudrabhishekam & Serpent Remedies"
      },
      desc: {
        kn: "ಕುಜ ದೋಷ, ಸರ್ಪ ದೋಷ ಹಾಗೂ ಸಂತಾನ ಅಡಚಣೆ ನಿವಾರಣೆಗೆ ಶ್ರಾವಣ ಸೋಮವಾರ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನಾಗಪ್ರತಿಷ್ಠೆ ಸೇವೆ ಶ್ರೇಷ್ಠ.",
        hi: "कुज दोष, सर्प दोष तथा संतान बाधा निवारण हेतु श्रावण सोमवार को महाबलेश्वर आत्मलिंग पर रुद्राभिषेक एवं नाग शांति कराएं।",
        te: "కుజ దోషం, సర్ప దోషం నివారణకు శ్రావణ సోమవారం మహాబలేశ్వర ఆత్మలింగానికి రుద్రాభిషేకం మరియు నాగపూజ శ్రేష్ఠం.",
        ta: "செவ்வாய் தோஷம், நாக தோஷத்தை நீக்க ஆடி/ஆவணி சோமவார ஆத்மலிங்க ருத்ராபிஷேகம் சிறந்தது.",
        en: "Holy Shravana Mondays Rudrabhishekam on Gokarna Atmalinga effectively dissolves Kuja and Rahu-Ketu impediments."
      }
    },
    {
      title: {
        kn: "🌾 ಭಾದ್ರಪದ - ಆಶ್ವಯುಜ: ಪಿತೃ ತರ್ಪಣ",
        hi: "🌾 भाद्रपद - आश्विन: पितृ तर्पण",
        te: "🌾 భాద్రపద - ఆశ్వయుజ: పితృ తర్పణం",
        ta: "🌾 புரட்டாசி - ஐப்பசி: பித்ரு தர்பணம்",
        en: "🌾 Bhadrapada - Ashvayuja: Pitru Tarpanam & Ancestral Grace"
      },
      desc: {
        kn: "ಪಿತೃ ದೋಷ ಶಾಂತಿಗೆ ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆಯಂದು ಗೋಕರ್ಣ ರುದ್ರಪಾದ ತೀರ್ಥದಲ್ಲಿ ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಅನ್ನದಾನ ಮಾಡುವುದು ವಂಶ ವೃದ್ಧಿ ನೀಡುತ್ತದೆ.",
        hi: "पितृ दोष शांति हेतु महालया अमावस्या पर गोकर्ण रुद्रपाद तीर्थ में तर्पण एवं अन्नदान करने से वंश वृद्धि एवं सुख मिलता है।",
        te: "పితృ దోష శాంతికి మహాలయ అమావాస్య నాడు గోకర్ణ రుద్రపాద తీర్థంలో తర్పణం మరియు అన్నదానం చేయడం వలన వంశాభివృద్ధి లభిస్తుంది.",
        ta: "பித்ரு தோஷ சாந்திக்கு மகாளய அமாவாசையன்று கோகர்ண ருத்ரபாத தீர்த்தத்தில் தர்பணமும் அன்னதானமும் செய்வது வம்ச சுபிட்சம் தரும்.",
        en: "Performing Mahalaya Pitru Tarpanam and Shradha at Gokarna guarantees ancestral peace and prospers descendants."
      }
    },
    {
      title: {
        kn: "🪔 ಕಾರ್ತಿಕ - ಮಾಘ: ದೀಪೋತ್ಸವ ದರ್ಶನ",
        hi: "🪔 कार्तिक - माघ: दीपोत्सव दर्शन",
        te: "🪔 కార్తీక - మాఘ: దీపోత్సవం",
        ta: "🪔 கார்த்திகை - மாசி: தீபோற்சவம்",
        en: "🪔 Kartika - Magha: Festival of Lights & Atmalinga Grace"
      },
      desc: {
        kn: "ಕಾರ್ತಿಕ ಸೋಮವಾರ ದೀಪೋತ್ಸವ ಹಾಗೂ ಮಹಾ ಶಿವರಾತ್ರಿಯಂದು ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಪೂಜೆ ಮಾಡಿಸುವುದರಿಂದ ಸಮಸ್ತ ಪಾಪ ಕ್ಷಯವಾಗಿ ಸಂಪತ್ತು ವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
        hi: "कार्तिक सोमवार दीपदान तथा महाशिवरात्रि पर आत्मलिंग स्पर्श पूजन कराने से पाप नष्ट होकर अपार सुख और समृद्धि मिलती है।",
        te: "కార్తీక సోమవారం దీపారాధన మరియు మహా శివరాత్రి నాడు ఆత్మలింగ స్పర్శ పూజ చేయించడం వలన అష్టైశ్వర్యాలు సిద్ధిస్తాయి.",
        ta: "கார்த்திகை சோமவார தீப வழிபாடும் மகா சிவராத்திரி ஆத்மலிங்க தரிசனமும் அஷ்டலக்ஷ்மி கடாட்சம் தரும்.",
        en: "Lighting lamps during Kartika month and performing Atmalinga touch worship on Shivaratri invokes supreme fortune."
      }
    }
  ];

  const VASTU_TITLE_DICT: L5 = {
    kn: "✦ ಗೃಹ ಶಾಂತಿ ಹಾಗೂ ವಾಸ್ತು ಧರ್ಮ ಸೂತ್ರಗಳು ✦",
    hi: "✦ गृह शांति एवं वास्तु धर्म सूत्र ✦",
    te: "✦ గృహ శాంతి మరియు వాస్తు ధర్మ సూత్రాలు ✦",
    ta: "✦ கிரக சாந்தி மற்றும் வாஸ்து தர்ம சூத்திரங்கள் ✦",
    en: "✦ Sacred Domestic Vastu & Wealth Energy Rules ✦"
  };

  const VASTU_RULES: { title: L5; desc: L5 }[] = [
    {
      title: { kn: "🚪 ಸಿಂಹದ್ವಾರ ಕುಂಕುಮ ಧಾರಣೆ", hi: "🚪 सिंहद्वार कुमकुम धारण", te: "🚪 సింహద్వారం కుంకుమ ధారణ", ta: "🚪 தலைவாசல் குங்கும திலகம்", en: "🚪 Main Entrance Sanctity" },
      desc: {
        kn: "ಮನೆಯ ಮುಖ್ಯ ದ್ವಾರದಲ್ಲಿ ಪ್ರತಿದಿನ ಗೋಕರ್ಣ ಪ್ರಸಾದದ ಅರಿಶಿನ-ಕುಂಕುಮ ಇಡುವುದರಿಂದ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಹಾಗೂ ದುಷ್ಟ ದೃಷ್ಟಿ ಬಾಧೆ ಶಮನವಾಗುತ್ತದೆ.",
        hi: "घर के मुख्य द्वार पर प्रतिदिन गोकर्ण प्रसाद का हल्दी-कुमकुम लगाने से नकारात्मक ऊर्जा तथा कुदृष्टि दूर होती है।",
        te: "ఇంటి ముఖ్య ద్వారానికి ప్రతిరోజూ గోకర్ణ ప్రసాదం పసుపు-కుంకుమ అద్దడం వలన దిష్టి దోషాలు తొలగిపోతాయి.",
        ta: "வீட்டின் தலைவாசலில் தினமும் கோகர்ண பிரசாத மஞ்சள்-குங்குமம் வைப்பது கண் திருஷ்டியை விலக்கும்.",
        en: "Applying sacred Gokarna Kumkuma at the main entrance shields the home from negative energy and evil eye."
      }
    },
    {
      title: { kn: "🪔 ಪೂರ್ವ-ಈಶಾನ್ಯ ದೇವತಾ ಸ್ಥಾನ", hi: "🪔 पूर्व-ईशान देवता स्थान", te: "🪔 తూర్పు-ఈశాన్యం దేవతా స్థానం", ta: "🪔 கிழக்கு-ஈசானியம் பூஜை பீடம்", en: "🪔 North-East Altar Sanctuary" },
      desc: {
        kn: "ದೇವರ ಮನೆಯನ್ನು ಈಶಾನ್ಯ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕಿನಲ್ಲಿರಿಸಿ ಪೂರ್ವಾಭಿಮುಖವಾಗಿ ಪೂಜೆ ಮಾಡುವುದು ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದ ಹಾಗೂ ಧನ ವೃದ್ಧಿಗೆ ಮಂಗಳಕರ.",
        hi: "पूजा घर को पूर्व या ईशान कोण में स्थापित कर पूर्व दिशा की ओर मुख करके पूजन करना पारिवारिक सौहार्द के लिए शुभ है।",
        te: "పూజాగదిని ఈశాన్యం లేదా తూర్పు దిశలో ఉంచి తూర్పు ముఖంగా పూజించడం కుటుంబ సౌఖ్యానికి అత్యంత శుభకరం.",
        ta: "பூஜை அறையை ஈசானியம் அல்லது கிழக்கில் அமைத்து கிழக்கு நோக்கி பூஜிப்பது குடும்ப அமைதி அளிக்கும்.",
        en: "Positioning the sacred altar in the North-East or East ensures emotional harmony and financial steadiness."
      }
    },
    {
      title: { kn: "🌿 ಕರ್ಪೂರ ನೈವೇದ್ಯ ಧೂಪ", hi: "🌿 कर्पूर नैवेद्य धूप", te: "🌿 కర్పూర నైవేద్య ధూపం", ta: "🌿 கற்பூர ஆராதனை தூபம்", en: "🌿 Camphor Aarti & Cleansing" },
      desc: {
        kn: "ಪ್ರತಿದಿನ ಸಂಜೆ ಶಿವ ಸ್ಮರಣೆಯೊಂದಿಗೆ ಶುದ್ಧ ಕರ್ಪೂರ ಆರತಿ ಬೆಳಗುವುದರಿಂದ ಮನೆಯ ಕಲಹಗಳು ಹಾಗೂ ಮಾನಸಿಕ ಚಿಂತೆಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ.",
        hi: "प्रतिदिन सायं शिव स्मरण के साथ शुद्ध कर्पूर आरती करने से घर के कलह तथा मानसिक क्लेश दूर होते हैं।",
        te: "ప్రతిరోజూ సాయంత్రం శివ స్మరణతో కర్పూర హారతి వెలిగించడం వలన గృహ కలహాలు నివారించబడతాయి.",
        ta: "தினமும் மாலையில் சிவ ஸ்மரணத்துடன் கற்பூர ஆரத்தி செய்வது குடும்ப சண்டைகளை நீக்கும்.",
        en: "Lighting pure camphor Aarti every evening purifies domestic energy and resolves stress among family members."
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
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, color: GOLD, letterSpacing: "normal" }}>❖</div>
            <div style={{ fontSize: 18.5, fontWeight: 700, color: INK, marginTop: 3, lineHeight: 1.6, letterSpacing: "normal" }}>
              {pick(TITLE_DICT, lang)}
            </div>
            <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 4, lineHeight: 1.8, maxWidth: 760, margin: "4px auto 0", letterSpacing: "normal" }}>
              {pick(SUBTITLE_DICT, lang)}
            </div>
          </div>

          <OrnamentRule />

          {/* Section 1: 12-Month Remedial Cycle */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
              {pick(CYCLE_TITLE_DICT, lang)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {CYCLE_LIST.map((cy, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1.5px solid ${GOLD_LIGHT}`,
                    borderRadius: 9,
                    backgroundColor: PANEL,
                    padding: "12px 16px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 4, lineHeight: 1.5, letterSpacing: "normal" }}>
                    {pick(cy.title, lang)}
                  </div>
                  <div style={{ fontSize: 11.5, color: INK_SOFT, lineHeight: 1.8, letterSpacing: "normal" }}>
                    {pick(cy.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Vastu & Wealth Energy Rules */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
              {pick(VASTU_TITLE_DICT, lang)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {VASTU_RULES.map((vr, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: 9,
                    backgroundColor: "#FFFFFF",
                    padding: "12px 14px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, marginBottom: 4, lineHeight: 1.5, letterSpacing: "normal" }}>
                    {pick(vr.title, lang)}
                  </div>
                  <div style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.75, letterSpacing: "normal" }}>
                    {pick(vr.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Pitru Tarpanam & Ancestral Grace */}
          <div
            style={{
              marginTop: 10,
              backgroundColor: PANEL,
              border: `1.5px solid ${GOLD_LIGHT}`,
              borderRadius: 9,
              padding: "10px 14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 3 }}>
              ✦ {pick({ kn: "ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಕುಲದೇವರ ಆಶೀರ್ವಾದ", hi: "पितृ तर्पण एवं कुलदेवता आशीर्वाद", te: "పితృ తర్పణం మరియు కులదేవత ఆశీర్వాదం", ta: "பித்ரு தர்பணம் & குலதெய்வ ஆசீர்வாதம்", en: "Ancestral Peace & Clan Deity Grace Guidelines" }, lang)} ✦
            </div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, lineHeight: 1.8, letterSpacing: "normal" }}>
              {pick({ kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರವು ಪರಮ ಪವಿತ್ರ ರುದ್ರಪಾದ ಕ್ಷೇತ್ರವಾಗಿದ್ದು, ಇಲ್ಲಿ ಪಿತೃ ಶ್ರಾದ್ಧ, ತರ್ಪಣ ಮಾಡುವುದರಿಂದ ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಮುಕ್ತಿ ದೊರೆತು, ಸಂತತಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ ಲಭಿಸುತ್ತದೆ.", hi: "गोकर्ण क्षेत्र परम पवित्र रुद्रपाद तीर्थ है, यहाँ पितृ तर्पण कराने से सात पीढ़ियों के पितरों को सद्गति मिलती है तथा वंश समृद्धि प्राप्त होती है।", te: "గోకర్ణ క్షేత్రం పరమ పవిత్ర రుద్రపాద క్షేత్రం, ఇక్కడ పితృ తర్పణం చేయడం వలన ఏడు తరాల పితృదేవతలకు ముక్తి లభించి వంశాభివృద్ధి జరుగుతుంది.", ta: "கோகர்ண க்ஷேத்திரம் ருத்ரபாத தீர்த்தமாகும். இங்கு பித்ரு தர்பணம் செய்வது 7 தலைமுறை பித்ருக்களுக்கு முக்தியும் வம்ச சுபிட்சமும் தரும்.", en: "Gokarna is the highly sacred Rudrapada Kshetra. Performing ancestral rites here guarantees liberation to 7 generations and bestows family prosperity." }, lang)}
            </div>
          </div>

          {/* Section 4: Gokarna Prasada Preservation */}
          <div
            style={{
              marginTop: 10,
              backgroundColor: "#FFFFFF",
              border: `1.5px solid ${GOLD_LIGHT}`,
              borderRadius: 9,
              padding: "10px 14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 3 }}>
              ✦ {pick({ kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ರಕ್ಷಣೆ ಹಾಗೂ ವಿನಿಯೋಗ", hi: "गोकर्ण महाबलेश्वर प्रसाद उपयोग एवं संरक्षण", te: "గోకర్ణ మహాబలేశ్వర ప్రసాదం వినియోగం మరియు సంరక్షణ", ta: "கோகர்ண மகாபலேஸ்வர பிரசாத உபயோகம் & பாதுகாப்பு", en: "Gokarna Mahabaleshwara Sacred Prasada Preservation" }, lang)} ✦
            </div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, lineHeight: 1.8, letterSpacing: "normal" }}>
              {pick({ kn: "ಲಭಿಸಿದ ಪವಿತ್ರ ವಿಭೂತಿ, ಕುಂಕುಮ ಹಾಗೂ ನಾಣ್ಯ ಪ್ರಸಾದವನ್ನು ಮನೆಯ ದೇವರ ಮನೆಯಲ್ಲಿ ಅಥವಾ ತಿಜೋರಿಯಲ್ಲಿ ಸ್ಥಾಪಿಸಿ. ಶುಭ ಕಾರ್ಯಗಳಿಗೆ ತೆರಳುವಾಗ ವಿಭೂತಿ ಧರಿಸುವುದು ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ಜಯ ನೀಡುತ್ತದೆ.", hi: "प्राप्त पवित्र विभूति, कुमकुम तथा प्रसाद सिक्के को पूजा घर अथवा तिजोरी में रखें। शुभ कार्य हेतु निकलते समय विभूति धारण करने से सर्व कार्यों में विजय मिलती है।", te: "లభించిన విభూతి, కుంకుమ మరియు ప్రసాద నాణేన్ని పూజాగదిలో ఉంచండి. శుభ కార్యాలకు వెళ్ళేటప్పుడు విభూతి ధరించడం వలన విజయం లభిస్తుంది.", ta: "பெற்ற விபூதி, குங்குமம் மற்றும் பிரசாத நாணயத்தை பூஜை அறையில் வைக்கவும். சுப காரியங்களுக்குச் செல்லும்போது விபூதி அணிவது வெற்றி தரும்.", en: "Store sacred Gokarna Vibhuti, Kumkuma, and blessed Prasada coin in your altar. Applying Vibhuti before journeys ensures divine protection and success." }, lang)}
            </div>
          </div>

        {/* Section 5: Chief Archaka Official Seal Badge */}
        <div
          style={{
            marginTop: 12,
            marginBottom: 16,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 11,
            backgroundColor: "#FFFFFF",
            padding: "10px 16px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14
          }}
        >
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 3, letterSpacing: "normal", lineHeight: 1.5 }}>
              {pick({ kn: "✦ ಮುಖ್ಯ ಅರ್ಚಕರ ಅಧಿಕೃತ ಮುದ್ರೆ ಹಾಗೂ ಆಶೀರ್ವಾದ ✦", hi: "✦ मुख्य अर्चक आधिकारिक मुहर एवं आशीर्वाद ✦", te: "✦ ముఖ్య అర్చకుల అధికారిక ముద్ర మరియు ఆశీర్వాదం ✦", ta: "✦ முதன்மை அர்ச்சகர் அதிகாரப்பூர்வ முத்திரை & ஆசீர்வாதம் ✦", en: "✦ Chief Archaka Official Seal & Benediction ✦" }, lang)}
            </div>
            <div style={{ fontSize: 12, color: INK, fontWeight: 700, lineHeight: 1.6, letterSpacing: "normal" }}>
              {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"} — {pick({ kn: "ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ", hi: "मुख्य अर्चक, गोकर्ण महाबलेश्वर क्षेत्र", te: "ముఖ్య అర్చకులు, గోకర్ణ మహాబలేశ్వర క్షేత్రం", ta: "முதன்மை அர்ச்சகர், கோகர்ண மகாபலேஸ்வர க்ஷேத்திரம்", en: "Chief Archaka, Gokarna Mahabaleshwara Kshetra" }, lang)}
            </div>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 3, lineHeight: 1.75, letterSpacing: "normal" }}>
              {pick({ kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಕೃಪೆಯು ನಿಮ್ಮ ಸಮಸ್ತ ಕುಟುಂಬಕ್ಕೆ ಸದಾ ರಕ್ಷಣೆ, ಸುಖ-ಸಂತೋಷ ಹಾಗೂ ನಿರಂತರ ಆಯುರಾರೋಗ್ಯವನ್ನು ಕರುಣಿಸಲಿ ಎಂದು ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ.", hi: "श्री महाबलेश्वर स्वामी की दिव्य कृपा आपके संपूर्ण परिवार को सदा सुख, शांति एवं उत्तम स्वास्थ्य प्रदान करे।", te: "శ్రీ మహాబలేశ్వర స్వామివారి దివ్య కృప మీ కుటుంబానికి సదా ఆయురారోగ్యాలు, సుఖశాంతులను ప్రసాదించుగాక.", ta: "ஸ்ரீ மகாபலேஸ்வர சுவாமியின் திவ்ய அருள் உங்கள் குடும்பத்திற்கு எந்நாளும் நல்வாழ்வும் ஆரோக்கியமும் தரட்டும்.", en: "May the divine grace of Shri Mahabaleshwara always protect your family with enduring peace, joy, and vitality." }, lang)}
            </div>
          </div>

          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              border: `2px double ${GOLD}`,
              backgroundColor: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 10px rgba(180, 140, 60, 0.2)`
            }}
          >
            <div style={{ fontSize: 16, color: GOLD }}>🕉️</div>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: INK, textTransform: "uppercase", marginTop: 1, textAlign: "center" }}>
              GOKARNA
            </div>
            <div style={{ fontSize: 6.5, color: GOLD, textTransform: "uppercase" }}>
              ARCHAKA
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
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
          kn: "ಗಣಪತಿ ಹೋಮವು ಸಕಲ ವಿಘ್ನನಿವಾರಕನಾದ ಶ್ರೀ ಮಹಾಗಣಪತಿಯನ್ನು ಪ್ರಸನ್ನಗೊಳಿಸುವ ಶ್ರೇಷ್ಠ ವೈದಿಕ ಯಜ್ಞವಾಗಿದೆ. ಈ ಪವಿತ್ರ ಯಜ್ಞದಲ್ಲಿ ಮಂತ್ರಪೂರ್ವಕವಾಗಿ ಗರಿಕೆ, ತುಪ್ಪ, ಕೊಬ್ಬರಿ ಹಾಗೂ ಮೋದಕಗಳನ್ನು ಅರ್ಪಿಸಿ ಪೂಜಿಸಲಾಗುತ್ತದೆ.",
          hi: "गणपति होम समस्त विघ्नविनाशक श्री महागणपति को प्रसन्न करने वाला श्रेष्ठ वैदिक यज्ञ है। इसमें मंत्रोच्चार के साथ पावन आहुतियों द्वारा भगवान गणेश का पूजन किया जाता है।",
          te: "గణపతి హోమం సమస్త విఘ్నవినాశకుడైన శ్రీ మహాగణపతిని ప్రసన్నం చేసుకునే ఉత్తమ వైదిక యజ్ఞం. పవిత్ర ద్రవ్యాలను సమర్పించి పూజిస్తారు.",
          ta: "கணபதி ஹோமம் சகல விக்னங்களை போக்கும் ஸ்ரீ மகா கணபதியை திருப்திப்படுத்தும் வைதீக யாகமாகும்.",
          en: "Ganapati Homa is a sacred Vedic fire ritual performed to invoke Lord Ganesha, the remover of all obstacles."
        }, lang),
        whyDoPooja: pick({
          kn: "ಹೊಸ ಕೆಲಸಗಳ ಆರಂಭ, ಗೃಹಪ್ರವೇಶ, ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಜಾತಕದಲ್ಲಿರುವ ಕೇತು ದೋಷ ಮತ್ತು ಅಡಚಣೆಗಳನ್ನು ನಿವಾರಿಸಲು ಈ ಹೋಮವನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "नवीन कार्यों के शुभारंभ, व्यापार में वृद्धि तथा कुण्डली में स्थित केतु दोष निवारण हेतु यह होम किया जाता है।",
          te: "నూతన కార్యారంభం, వ్యాపారాభివృద్ధి మరియు జాతకంలోని కేతు దోషాల నివారణకు ఈ హోమం చేయబడుతుంది.",
          ta: "புதிய தொடக்கம், வியாபார வளர்ச்சி மற்றும் கிரக தோஷ நிவர்த்திக்காக இந்த ஹோமம் செய்யப்படுகிறது.",
          en: "This Homa is performed before starting new ventures, expanding business, or removing Ketu afflictions and hurdles."
        }, lang),
        benefitsPooja: pick({
          kn: "ಈ ಪೂಜೆಯ ಪ್ರಭಾವದಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಉತ್ಸಾಹ ಮೂಡಿ, ಸಕಲ ಕೆಲಸಗಳಲ್ಲಿ ಜಯ, ಧನ ಸಂಪತ್ತಿನ ವೃದ್ಧಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖ-ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
          hi: "इस पूजन के प्रभाव से सकारात्मक ऊर्जा का संचार होता है, कार्यों में सफलता, धन-समृद्धि एवं पारिवारिक सुख-शांति मिलती है।",
          te: "ఈ పూజ వల్ల మనస్సులో ధనాత్మక శక్తి కలిగి, సమస్త కార్యాలలో విజయం మరియు కుటుంబ సౌఖ్యం కలుగుతుంది.",
          ta: "இந்த பூஜையால் மனதில் நேர்மறை ஆற்றல் பெருகி, சகல காரிய வெற்றி மற்றும் குடும்ப சௌக்கியம் கிடைக்கும்.",
          en: "Performing this Homa bestows sharp intellect, guarantees success in endeavors, and fills the home with harmony."
        }, lang)
      };
    }

    if (isRudra || isMrityunjaya) {
      return {
        whatIsPooja: pick({
          kn: "ರುದ್ರ ಅಭಿಷೇಕ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಹೋಮವು ಸನಾತನ ಧರ್ಮದ ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ಶಿವ ಆರಾಧನೆಯಾಗಿದೆ. ಮಹಾದೇವನ ಆತ್ಮಲಿಂಗ ಸ್ವರೂಪಕ್ಕೆ ಪಂಚಾಮೃತ ಅಭಿಷೇಕ ನೆರವೇರಿಸಿ, ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರದಿಂದ ಹೋಮ ಮಾಡಲಾಗುತ್ತದೆ.",
          hi: "रुद्र अभिषेक एवं महामृत्युंजय होम अत्यंत शक्तिशाली शिव आराधना है। भगवान शिव के आत्मलिंग स्वरूप पर पंचामृत अभिषेक कर महामृत्युंजय मन्त्र से होम किया जाता है।",
          te: "రుద్ర అభిషేకం మరియు మృత్యుంజయ హోమం అత్యంత శక్తివంతమైన శివ ఆరాధన. స్వామివారికి పంచామృతాలతో అభిషేకం మరియు మంత్ర హోమం నిర్వహిస్తారు.",
          ta: "ருத்ர அபிஷேகம் மற்றும் ருத்ர ஹோமம் மிகவும் சக்திவாய்ந்த சிவ ஆராதனையாகும். சிவலிங்கத்திற்கு பஞ்சாமிர்த அபிஷேகம் செய்யப்படுகிறது.",
          en: "Rudra Abhisheka & Maha Mrityunjaya Homa is a supreme Shiva ritual consecrated with Panchamrita and Vedic mantras."
        }, lang),
        whyDoPooja: pick({
          kn: "ದೀರ್ಘಕಾಲದ ಅನಾರೋಗ್ಯ, ಶನಿ-ರಾಹು ದೋಷಗಳ ತೀವ್ರತೆ ಹಾಗೂ ಮಾನಸಿಕ ಚಿಂತೆಗಳನ್ನು ನಿವಾರಿಸಿ ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಶಾಂತಿ ಪಡೆಯಲು ಈ ಸೇವೆಯನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "दीर्घकालिक व्याधियों, शनि-राहु दोषों तथा मानसिक संताप के निवारण एवं दीर्घायु तथा आंतरिक शांति हेतु यह सेवा की जाती है।",
          te: "దీర్ఘకాలిక అనారోగ్యం, శని-రాహు దోషాల నివారణ మరియు దీర్ఘాయువు, మానసిక ప్రశాంతత కోసం ఈ సేవ చేయబడుతుంది.",
          ta: "தீராத நோய்கள், சனி-ராகு தோஷ நிவர்த்தி மற்றும் நீண்ட ஆயுள் பெற இந்த பூஜை செய்யப்படுகிறது.",
          en: "This Seva is performed to overcome chronic illness, eliminate Rahu/Saturn afflictions, and grant longevity."
        }, lang),
        benefitsPooja: pick({
          kn: "ಈ ಸೇವೆಯಿಂದ ಸಕಲ ರೋಗ-ಬಾಧೆಗಳು ಶಮನವಾಗಿ, ದೈಹಿಕ ಕಾಂತಿ, ರಕ್ಷಣಾ ಕವಚ, ನಿರಂತರ ಆಯುರಾರೋಗ್ಯ ಹಾಗೂ ಸಕಲ ಪಾಪನಾಶದ ಫಲ ಲಭಿಸುತ್ತದೆ.",
          hi: "इस सेवा से समस्त रोगों का शमन होता है, शारीरिक कांति, सुरक्षा कवच, उत्तम स्वास्थ्य एवं पापों से मुक्ति मिलती है।",
          te: "ఈ సేవ వల్ల రోగాలు నివారణై, శారీరక ఆరోగ్యం, రక్షణ కవచం మరియు సకల పాపక్షయం కలుగుతుంది.",
          ta: "இந்த சேவையால் நோய்கள் நீங்கி, உடல் ஆரோக்கியம், தெய்வீக பாதுகாப்பு கவசம் கிடைக்கும்.",
          en: "Grants health protection shield, dissolves karmic debts, and fills the devotee with divine peace."
        }, lang)
      };
    }

    return {
      whatIsPooja: pick({
        kn: "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೆರವೇರಿಸಲಾದ ಈ ಪವಿತ್ರ ಸೇವೆಯು ಜನ್ಮ ನಕ್ಷತ್ರ ಹಾಗೂ ರಾಶಿ ಗ್ರಹಗಳ ಪ್ರಸನ್ನತೆಗೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾದ ದೈವಿಕ ಆರಾಧನೆಯಾಗಿದೆ.",
        hi: "गोकर्ण श्री महाबलेश्वर क्षेत्र में संपन्न यह पवित्र सेवा जन्म नक्षत्र एवं राशि ग्रहों की प्रसन्नता हेतु प्रभावकारी वैदिक आराधना है।",
        te: "గోకర్ణ శ్రీ మహాబలేశ్వర క్షేత్రంలో నిర్వహించిన ఈ పవిత్ర సేవ జన్మ నక్షత్రం మరియు రాశి గ్రహాల ప్రసన్నతకు శ్రేష్ఠమైన ఆరాధన.",
        ta: "கோகர்ண ஸ்ரீ மகாபலேஸ்வர க்ஷேத்திரத்தில் செய்யப்பட்ட இந்த பூஜை ஜன்ம நட்சத்திர மற்றும் ராசி கிரகங்களின் திருப்திக்காக செய்யப்பட்டது.",
        en: "Performed at holy Gokarna Mahabaleshwara Kshetra, this sacred Seva is an auspicious consecration tailored to your birth chart."
      }, lang),
      whyDoPooja: pick({
        kn: "ಜಾತಕದಲ್ಲಿರುವ ನವಗ್ರಹ ದೋಷಗಳ ಶಮನ, ಕೌಟುಂಬಿಕ ಅಭ್ಯುದಯ, ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಮಾನಸಿಕ ನೆಮ್ಮದಿಗಾಗಿ ಈ ಸೇವೆಯನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ.",
        hi: "कुण्डली में स्थित नवग्रह दोषों के शमन, पारिवारिक उन्नति, व्यापार में वृद्धि तथा मानसिक शांति हेतु यह सेवा अर्पित की जाती है।",
        te: "జాతకంలోని నవగ్రహ దోషాల నివారణ, కుటుంబ అభ్యుదయం, ఉద్యోగ వ్యాపారాలలో ప్రగతి కోసం ఈ సేవ సమర్పించబడుతుంది.",
        ta: "ஜாதக கிரக தோஷ நிவர்த்தி, குடும்ப வளர்ச்சி, தொழில் முன்னேற்றம் மற்றும் மன அமைதிக்காக இந்த சேவை செய்யப்படுகிறது.",
        en: "Designed to neutralize planetary imbalances, enhance career growth, foster domestic peace, and clear obstacles."
      }, lang),
      benefitsPooja: pick({
        kn: "ಈ ಸೇವೆಯ ಫಲವಾಗಿ ನಿರಂತರ ಕೌಟುಂಬಿಕ ಭಾಗ್ಯೋದಯ, ಧನ-ಧಾನ್ಯ ಸಮೃದ್ಧಿ, ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ಮನಃಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
        hi: "इस सेवा के फलस्वरुप निरंतर पारिवारिक भाग्योदय, धन-धान्य समृद्धि, समाज में सम्मान एवं शांति प्राप्त होती है।",
        te: "ఈ సేవ వల్ల నిరంతర కుటుంబ భాగ్యోదయం, ధన ధాన్య సమృద్ధి మరియు సమాజంలో గౌరవ ప్రతిష్ఠలు కలుగుతాయి.",
        ta: "இந்த சேவையின் பலனாக குடும்ப பாக்கியம், தன தானிய பெருக்கம், சமூக மதிப்பு மற்றும் சாந்தி கிடைக்கும்.",
        en: "Bestows enduring family prosperity, continuous financial stability, elevated social respect, and divine grace."
      }, lang)
    };
  })();

  const wPooja = mahatmeData?.whatIsPooja || defaultMahatme.whatIsPooja;
  const yPooja = mahatmeData?.whyDoPooja || defaultMahatme.whyDoPooja;
  const bPooja = mahatmeData?.benefitsPooja || defaultMahatme.benefitsPooja;

  // 4 Primary Graha Position Cards
  const GRAHA_GROUP_1: { name: L5; role: L5; desc: L5 }[] = [
    {
      name: { kn: "☀️ ಸೂರ್ಯ ಹಾಗೂ ಚಂದ್ರ", hi: "☀️ सूर्य एवं चंद्र", te: "☀️ సూర్యుడు మరియు చంద్రుడు", ta: "☀️ சூரியன் & சந்திரன்", en: "☀️ Surya & Chandra (Sun & Moon)" },
      role: { kn: "ಆತ್ಮಕಾರಕ ಹಾಗೂ ಮನಃಕಾರಕ", hi: "आत्मकारक एवं मनःकारक", te: "ఆత్మకారకుడు మరియు మనఃకారకుడు", ta: "ஆத்மகாரகர் & மனோகாரகர்", en: "Soul, Vitality & Emotional Mind" },
      desc: {
        kn: "ಸೂರ್ಯನು ಆರೋಗ್ಯ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸದ ಅಧಿಪತಿ. ಚಂದ್ರನು ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖದ ಕಾರಕ. ಶಿವ ಪೂಜೆಯಿಂದ ಇಬ್ಬರ ಅನುಗ್ರಹ ಲಭಿಸುತ್ತದೆ.",
        hi: "सूर्य स्वास्थ्य तथा आत्मविश्वास के स्वामी हैं। चंद्र मानसिक शांति एवं पारिवारिक सुख के कारक हैं। शिव पूजन से दोनों की कृपा मिलती है।",
        te: "సూర్యుడు ఆరోగ్యం, ఆత్మవిశ్వాసానికి అధిపతి. చంద్రుడు మనఃశాంతి, కుటుంబ సౌఖ్యానికి కారకుడు. శివ పూజతో వీరి అనుగ్రహం లభిస్తుంది.",
        ta: "சூரியன் ஆரோக்கியம், தன்னம்பிக்கை அதிபதி. சந்திரன் மன அமைதி, குடும்ப சுக காரகர். சிவ பூஜையால் இருவரின் அருள் கிட்டும்.",
        en: "Surya governs vitality and confidence. Chandra rules mental peace and domestic joy. Shiva Pooja blesses both."
      }
    },
    {
      name: { kn: "⚔️ ಕುಜ ಹಾಗೂ ಬುಧ", hi: "⚔️ कुज एवं बुध", te: "⚔️ కుజుడు మరియు బుధుడు", ta: "⚔️ செவ்வாய் & புதன்", en: "⚔️ Kuja & Budha (Mars & Mercury)" },
      role: { kn: "ಧೈರ್ಯ ಹಾಗೂ ಬುದ್ಧಿಕಾರಕ", hi: "धैर्य एवं बुद्धिकारक", te: "ధైర్యం మరియు బుద్ధికారకుడు", ta: "தைரியம் & புத்தி காரகர்", en: "Courage, Intellect & Speech" },
      desc: {
        kn: "ಕುಜನು ಧೈರ್ಯ ಹಾಗೂ ಆಸ್ತಿಯ ಕಾರಕ. ಬುಧನು ವ್ಯಾಪಾರ, ಶಿಕ್ಷಣ ಹಾಗೂ ಬುದ್ಧಿವಂತಿಕೆಯ ಅಧಿಪತಿ. ಈ ಗ್ರಹಗಳ ಬಲದಿಂದ ಕೆಲಸಗಳಲ್ಲಿ ಯಶಸ್ಸು ಸಿಗುತ್ತದೆ.",
        hi: "कुज साहस तथा भूमि के कारक हैं। बुध व्यापार, शिक्षा तथा बुद्धि के स्वामी हैं। इनके बल से कार्यों में सफलता मिलती है।",
        te: "కుజుడు ధైర్యం, భూమికి కారకుడు. బుధుడు వ్యాపారం, విద్యకు అధిపతి. వీరి బలంతో సమస్త కార్యజయం లభిస్తుంది.",
        ta: "செவ்வாய் தைரியம், பூமி காரகர். புதன் வியாபாரம், கல்வி அதிபதி. இருவரின் பலத்தால் காரிய வெற்றி நிச்சயம்.",
        en: "Kuja injects enterprise and property luck. Budha bestows intellect and commercial success."
      }
    },
    {
      name: { kn: "📿 ಗುರು ಹಾಗೂ ಶುಕ್ರ", hi: "📿 गुरु एवं शुक्र", te: "📿 గురుడు మరియు శుక్రుడు", ta: "📿 குரு & சுக்கிரன்", en: "📿 Guru & Shukra (Jupiter & Venus)" },
      role: { kn: "ಜ್ಞಾನ ಹಾಗೂ ಭಾಗ್ಯಕಾರಕ", hi: "ज्ञान एवं भाग्यकारक", te: "జ్ఞానం మరియు భాగ్యకారకుడు", ta: "ஞானம் & பாக்ய காரகர்", en: "Wisdom, Wealth & Marriage" },
      desc: {
        kn: "ಗುರುವು ಧರ್ಮ, ಜ್ಞಾನ ಹಾಗೂ ಧನ ಭಾಗ್ಯದ ಅಧಿಪತಿ. ಶುಕ್ರನು ವಿವಾಹ, ಸೌಂದರ್ಯ ಹಾಗೂ ಸುಖ ಭೋಗದ ಕಾರಕ. ಈ ಪೂಜೆಯು ಇವರ ಸಿದ್ಧಿ ನೀಡುತ್ತದೆ.",
        hi: "गुरु धर्म, ज्ञान तथा धन भाग्योदय के स्वामी हैं। शुक्र विवाह तथा समस्त सुखों के कारक हैं। पूजन से दोनों की सिद्धि होती है।",
        te: "గురుడు ధర్మం, జ్ఞానం, ధన భాగ్యానికి అధిపతి. శుక్రుడు వివాహం, సుఖాలకు కారకుడు. పూజ ద్వారా వీరి కృప లభిస్తుంది.",
        ta: "குரு தர்மம், ஞானம், தன அதிபதி. சுக்கிரன் திருமணம், சுக பாக்கிய காரகர். பூஜையால் இருவரின் அருள் கிடைக்கும்.",
        en: "Guru bestows spiritual wisdom and fortune. Shukra activates marital harmony and prosperity."
      }
    },
    {
      name: { kn: "🪐 ಶನಿ, ರಾಹು ಹಾಗೂ ಕೇತು", hi: "🪐 शनि, राहु एवं केतु", te: "🪐 శని, రాహువు మరియు కేతువు", ta: "🪐 சனி, ராகு & கேது", en: "🪐 Shani, Rahu & Ketu (Karmic Lords)" },
      role: { kn: "ಕರ್ಮ ಹಾಗೂ ನ್ಯಾಯಕಾರಕ", hi: "कर्म एवं न्यायकारक", te: "కర్మ మరియు న్యాయకారకుడు", ta: "கர்மா & நியாய காரகர்", en: "Lifespan, Career Karma & Obstacle Resolution" },
      desc: {
        kn: "ಶನಿಯು ಆಯುಷ್ಯ ಹಾಗೂ ಕರ್ಮದ ಅಧಿಪತಿ. ರಾಹು-ಕೇತುಗಳು ಸರ್ಪ ದೋಷ ಹಾಗೂ ಅಡೆತಡೆಗಳ ಶಮನಕಾರಕ. ಗೋಕರ್ಣ ಶಿವ ಪೂಜೆಯು ಇವರನ್ನು ಶಾಂತಿಗೊಳಿಸುತ್ತದೆ.",
        hi: "शनि आयु तथा कर्म के स्वामी हैं। राहु-केतु पूर्वजन्म बाधाओं तथा सर्प दोष के निवारक हैं। शिव पूजा से ये शांत होते हैं।",
        te: "శని ఆయుష్షు, కర్మాధిపతి. రాహు-కేతువులు సర్ప దోష నివారకులు. శివ పూజతో ఈ గ్రహాలు శాంతిస్తాయి.",
        ta: "சனி ஆயுள், கர்மாதிபதி. ராகு-கேது தோஷ அகற்றுபவர்கள். சிவ பூஜையால் இவர்கள் சாந்தமடைவர்.",
        en: "Shani guides karma and lifespan. Rahu-Ketu govern karmic knots; Gokarna Shiva Pooja neutralizes their afflictions."
      }
    }
  ];

  // 4 Graha Beeja Mantras
  const GRAHA_GROUP_2: { title: L5; mantra: string; desc: L5 }[] = [
    {
      title: { kn: "☀️ ೧. ಸೂರ್ಯ ಗ್ರಹ ಬೀಜ ಮಂತ್ರ", hi: "☀️ १. सूर्य ग्रह बीज मंत्र", te: "☀️ ౧. సూర్య గ్రహ బీజ మంత్రం", ta: "☀️ 1. சூரிய கிரக பீஜ மந்திரம்", en: "☀️ 1. Surya Beeja Mantra" },
      mantra: "ॐ ಹ್ರಾಂ ಹ್ರೀಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ",
      desc: {
        kn: "ಭಾನುವಾರ ಬೆಳಿಗ್ಗೆ ೧೦೮ ಬಾರಿ ಸೂರ್ಯ ಬೀಜಮಂತ್ರ ಜಪಿಸುವುದರಿಂದ ಆರೋಗ್ಯ, ಕಣ್ಣಿನ ತೇಜಸ್ಸು ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸ ಹೆಚ್ಚುತ್ತದೆ.",
        hi: "रविवार प्रातः १०८ बार सूर्य बीजमंत्र का पाठ करने से उत्तम स्वास्थ्य तथा आत्मविश्वास बढ़ता है।",
        te: "ఆదివారం ఉదయం 108 సార్లు సూర్య బీజమంత్రం జపించడం వలన ఆరోగ్య రక్షణ లభిస్తుంది.",
        ta: "ஞாயிறுதோறும் 108 முறை சூரிய பீஜ மந்திரம் ஜபிப்பது உடல் பிரகாசம் மற்றும் தன்னம்பிக்கை தரும்.",
        en: "Chanting Surya Beeja Mantra 108 times on Sunday mornings boosts health, vitality, and confidence."
      }
    },
    {
      title: { kn: "🕉️ ೨. ಮಹಾದೇವ ರುದ್ರ ಗಾಯತ್ರಿ", hi: "🕉️ २. महादेव रुद्र गायत्री", te: "🕉️ ౨. మహదేవ రుద్ర గాయత్రి", ta: "🕉️ 2. மகாதேவ ருத்ர காயத்ரி", en: "🕉️ 2. Shiva Rudra Gayatri Mantra" },
      mantra: "ॐ ತತ್ಪುರುಷಾಯ ವಿದ್ಮಹೇ ಮಹಾದೇವಾಯ ಧೀಮಹಿ ತನ್ನೋ ರುದ್ರಃ ಪ್ರಚೋದಯಾತ್",
      desc: {
        kn: "ರುದ್ರ ಗಾಯತ್ರಿ ಮಂತ್ರ ಪಠಣವು ದುಷ್ಟ ಗ್ರಹಗಳ ಬಾಧೆ, ಭ್ರಮೆ ಹಾಗೂ ನಕಾರಾತ್ಮಕ ಚಿಂತನೆಗಳನ್ನು ನಿವಾರಿಸಿ ಶಾಂತಿ ನೀಡುತ್ತದೆ.",
        hi: "रुद्र गायत्री मंत्र का पाठ समस्त ग्रहों की बाधा एवं नकारात्मक विचारों को दूर कर ज्ञान प्रदान करता है।",
        te: "రుద్ర గాయత్రీ మంత్ర పఠనం గ్రహ పీడలు, భ్రమలను తొలగించి జ్ఞానాన్ని ప్రసాదిస్తుంది.",
        ta: "ருத்ர காயத்ரி மந்திர ஜபம் கிரக பீடைகளை நீக்கி ஞானத்தையும் அமைதியையும் தரும்.",
        en: "Reciting Rudra Gayatri Mantra purifies mind channels and brings spiritual peace and wisdom."
      }
    },
    {
      title: { kn: "🪔 ೩. ಮಹಾಲಕ್ಷ್ಮೀ ಕೃಪಾ ಮೂಲ ಮಂತ್ರ", hi: "🪔 ३. महालक्ष्मी कृपा मूल मंत्र", te: "🪔 ౩. మహాలక్ష్మీ కృపా మూల మంత్రం", ta: "🪔 3. மகாலக்ஷ்மி கிருபா மூல மந்திரம்", en: "🪔 3. Mahalakshmi Wealth Seed Mantra" },
      mantra: "ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ",
      desc: {
        kn: "ಶುಕ್ರವಾರ ಸಂಜೆ ಮಹಾಲಕ್ಷ್ಮೀ ಮಂತ್ರ ಜಪ ಮಾಡುವುದರಿಂದ ವ್ಯಾಪಾರದಲ್ಲಿ ಧನಾಗಮನ ಹಾಗೂ ಮನೆಯಲ್ಲಿ ಸುಖ-ಸಮೃದ್ಧಿ ನೆಲೆಸುತ್ತದೆ.",
        hi: "शुक्रवार सायं महालक्ष्मी मंत्र का जप करने से व्यापार में धन आगमन तथा घर में सुख-समृद्धि आती है।",
        te: "శుక్రవారం సాయంత్రం మహాలక్ష్మీ మంత్రం జపించడం వలన వ్యాపారంలో ధనాగమనం మరియు కుటుంబ సమృద్ధి కలుగుతాయి.",
        ta: "வெள்ளிக்கிழமை மாலையில் மகாலக்ஷ்மி மந்திரம் ஜபிப்பது தன வரவையும் குடும்ப சுபிட்சத்தையும் தரும்.",
        en: "Chanting Mahalakshmi Mantra on Friday evenings invokes unbroken financial abundance and home peace."
      }
    },
    {
      title: { kn: "🛡️ ೪. ಶ್ರೀ ಕಾಲಭೈರವ ರಕ್ಷಾ ಮಂತ್ರ", hi: "🛡️ ४. श्री कालभैरव रक्षा मंत्र", te: "🛡️ ౪. శ్రీ కాలభైరవ రక్షా మంత్రం", ta: "🛡️ 4. ஸ்ரீ காலபைரவர் ரக்ஷா மந்திரம்", en: "🛡️ 4. Kaalabhairava Protection Shield" },
      mantra: "ॐ ಭ್ರಂ ಕಾಲಭೈರವಾಯ ನಮಃ",
      desc: {
        kn: "ಕಾಲಭೈರವ ಮಂತ್ರ ಜಪವು ಶತ್ರು ಬಾಧೆ, ಆಪತ್ತುಗಳು ಹಾಗೂ ದುಷ್ಟ ದೃಷ್ಟಿ ಪ್ರಭಾವಗಳನ್ನು ದೂರಮಾಡಿ ಅಭಯ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.",
        hi: "कालभैरव मंत्र जप शत्रु बाधा, भय तथा कुदृष्टि के प्रभाव को नष्ट कर अभय रक्षा प्रदान करता है।",
        te: "కాలభైరవ మంత్ర జపం శత్రు బాధలు, ఆపదలు మరియు దిష్టి దోషాలను పోగొట్టి అభయ రక్షణ ఇస్తుంది.",
        ta: "காலபைரவர் மந்திர ஜபம் சத்ரு பயம் மற்றும் கண் திருஷ்டியை நீக்கி பூரண பாதுகாப்பு தரும்.",
        en: "Chanting Kaalabhairava Mantra eliminates fear, hazards, and psychic distress, granting divine protection."
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
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, color: GOLD, letterSpacing: "normal" }}>❖</div>
            <div style={{ fontSize: 18.5, fontWeight: 700, color: INK, marginTop: 3, lineHeight: 1.6, letterSpacing: "normal" }}>
              ✦ {sevaTitle} — {pick({ kn: "ಮಹಾಪೂಜಾ ಮಹಿಮೆ ಹಾಗೂ ದಿವ್ಯ ಫಲಶ್ರುತಿ", hi: "महापूजा महिमा एवं दिव्य फलश्रुति", te: "మహాపూజా మహిమ మరియు దివ్య ఫలశ్రుతి", ta: "மகாபூஜை மகிமை மற்றும் திவ்ய பலன்கள்", en: "Sacred Pooja Significance & Divine Blessings" }, lang)} ✦
            </div>
            <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 4, lineHeight: 1.8, maxWidth: 760, margin: "4px auto 0", letterSpacing: "normal" }}>
              {pick({ kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನೆರವೇರಿದ ಪೂಜೆಯ ವಿಸ್ತಾರ ವಿವರ ಹಾಗೂ ನವಗ್ರಹ ಫಲಾವಳಿ", hi: "श्री क्षेत्र गोकर्ण महाबलेश्वर सन्निधि में संपन्न पूजा का विस्तृत विवरण एवं नवग्रह फलादेश", te: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధిలో నిర్వహించిన పూజ విశేషాలు మరియు నవగ్రహ ఫలాలు", ta: "ஸ்ரீ க்ஷேத்திர கோகர்ண மகாபலேஸ்வர சந்நிதியில் நடைபெற்ற பூஜையின் விவரங்கள் மற்றும் நவகிரக பலன்கள்", en: "Detailed spiritual exposition, planetary blessings, and divine fruits of the sacred Gokarna Seva" }, lang)}
            </div>
          </div>

          <OrnamentRule />

          {/* Section 1: 3 Core Pooja Mahatme Summary Blocks */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div
                style={{
                  border: `1.5px solid ${GOLD_LIGHT}`,
                  borderRadius: 9,
                  backgroundColor: PANEL,
                  padding: "12px 14px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 4, lineHeight: 1.5, letterSpacing: "normal" }}>
                  {pick({ kn: "೧. ಪೂಜಾ ಮಹಾ ಸಂಕಲ್ಪ", hi: "१. पूजा महा संकल्प", te: "౧. పూజా మహా సంకల్పం", ta: "1. பூஜை மகா சங்கல்பம்", en: "1. What is this Sacred Seva?" }, lang)}
                </div>
                <div style={{ fontSize: 11, color: INK, lineHeight: 1.75, letterSpacing: "normal" }}>
                  {wPooja}
                </div>
              </div>

              <div
                style={{
                  border: `1.5px solid ${GOLD_LIGHT}`,
                  borderRadius: 9,
                  backgroundColor: "#FFFFFF",
                  padding: "12px 14px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 4, lineHeight: 1.5, letterSpacing: "normal" }}>
                  {pick({ kn: "೨. ಪೂಜೆಯ ಕಾರಣ", hi: "२. पूजा का कारण", te: "౨. పూజకు కారణం", ta: "2. பூஜையின் முக்கிய காரணம்", en: "2. Why is this Seva Performed?" }, lang)}
                </div>
                <div style={{ fontSize: 11, color: INK, lineHeight: 1.75, letterSpacing: "normal" }}>
                  {yPooja}
                </div>
              </div>

              <div
                style={{
                  border: `1.5px solid ${GOLD_LIGHT}`,
                  borderRadius: 9,
                  backgroundColor: PANEL,
                  padding: "12px 14px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 4, lineHeight: 1.5, letterSpacing: "normal" }}>
                  {pick({ kn: "೩. ದಿವ್ಯ ಫಲಶ್ರುತಿ", hi: "३. दिव्य फलश्रुति", te: "౩. దివ్య ఫలశ్రుతి", ta: "3. திவ்ய பலன்கள்", en: "3. Sacred Fruits & Benefits" }, lang)}
                </div>
                <div style={{ fontSize: 11, color: INK, lineHeight: 1.75, letterSpacing: "normal" }}>
                  {bPooja}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 4 Primary Graha Position Cards */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
              ✦ {pick({ kn: "೪ ಮೂಲ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಹಾಗೂ ಗೋಕರ್ಣ ಪೂಜಾ ಪ್ರಭಾವ", hi: "४ मूल ग्रहों की स्थिति एवं गोकर्ण पूजा प्रभाव", te: "౪ మూల గ్రహాల స్థితి మరియు గోకర్ణ పూజా ప్రభావం", ta: "4 மூல கிரகங்களின் நிலையும் கோகர்ண பூஜை பலனும்", en: "4 Primary Planetary Positions & Gokarna Pooja Grace" }, lang)} ✦
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {GRAHA_GROUP_1.map((gr, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: 9,
                    backgroundColor: "#FFFFFF",
                    padding: "10px 14px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 3, lineHeight: 1.5, letterSpacing: "normal" }}>
                    {pick(gr.name, lang)}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 3, lineHeight: 1.5, letterSpacing: "normal" }}>
                    {pick(gr.role, lang)}
                  </div>
                  <div style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.75, letterSpacing: "normal" }}>
                    {pick(gr.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: 4 Graha Beeja Mantras */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
              ✦ {pick({ kn: "೪ ಗ್ರಹ ರಕ್ಷಾ ಬೀಜ ಮಂತ್ರ ಜಪ ಹಾಗೂ ದಿವ್ಯ ಕವಚ", hi: "४ ग्रह रक्षा बीज मंत्र जप एवं दिव्य कवच", te: "౪ గ్రహ రక్షా బీజ మంత్ర జపం మరియు దివ్య కవచం", ta: "4 கிரக ரக்ஷா பீஜ மந்திர ஜபமும் திவ்ய கவசமும்", en: "4 Protective Planetary Beeja Mantras & Spiritual Shield" }, lang)} ✦
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {GRAHA_GROUP_2.map((gm, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: 9,
                    backgroundColor: PANEL,
                    padding: "10px 14px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 3, lineHeight: 1.5, letterSpacing: "normal" }}>
                    {pick(gm.title, lang)}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 3, lineHeight: 1.5, letterSpacing: "normal" }}>
                    {gm.mantra}
                  </div>
                  <div style={{ fontSize: 11, color: INK_SOFT, lineHeight: 1.75, letterSpacing: "normal" }}>
                    {pick(gm.desc, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* Section 4: Chief Archaka Official Seal Badge */}
        <div
          style={{
            marginTop: 12,
            marginBottom: 16,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 11,
            backgroundColor: "#FFFFFF",
            padding: "10px 16px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14
          }}
        >
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: GOLD, marginBottom: 3, letterSpacing: "normal", lineHeight: 1.5 }}>
              {pick({ kn: "✦ ಪ್ರಧಾನ ಅರ್ಚಕರ ಅಧಿಕೃತ ಮುದ್ರೆ ಹಾಗೂ ಆಶೀರ್ವಾದ ✦", hi: "✦ प्रधान अर्चक आधिकारिक मुहर एवं आशीर्वाद ✦", te: "✦ ప్రధాన అర్చకుల అధికారిక ముద్ర మరియు ఆశీర్వాదం ✦", ta: "✦ பிரதான அர்ச்சகர் அதிகாரப்பூர்வ முத்திரை & ஆசீர்வாதம் ✦", en: "✦ Chief Archaka Official Seal & Benediction ✦" }, lang)}
            </div>
            <div style={{ fontSize: 12, color: INK, fontWeight: 700, lineHeight: 1.6, letterSpacing: "normal" }}>
              {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"} — {pick({ kn: "ಪ್ರಧಾನ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ", hi: "प्रधान अर्चक, गोकर्ण क्षेत्र", te: "ప్రధాన అర్చకులు, గోకర్ణ క్షేత్రం", ta: "பிரதான அர்ச்சகர், கோகர்ண க்ஷேத்திரம்", en: "Pradhana Archaka, Gokarna Kshetra" }, lang)}
            </div>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 3, lineHeight: 1.75, letterSpacing: "normal" }}>
              {pick({ kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಕೃಪೆಯು ನಿಮ್ಮ ಸಮಸ್ತ ಕುಟುಂಬಕ್ಕೆ ಸದಾ ರಕ್ಷಣೆ, ಸುಖ-ಸಂತೋಷ ಹಾಗೂ ನಿರಂತರ ಆಯುರಾರೋಗ್ಯವನ್ನು ಕರುಣಿಸಲಿ ಎಂದು ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ.", hi: "श्री महाबलेश्वर स्वामी की दिव्य कृपा आपके संपूर्ण परिवार को सदा सुख, शांति एवं उत्तम स्वास्थ्य प्रदान करे।", te: "శ్రీ మహాబలేశ్వర స్వామివారి దివ్య కృప మీ కుటుంబానికి సదా ఆయురారోగ్యాలు, సుఖశాంతులను ప్రసాదించుగాక.", ta: "ஸ்ரீ மகாபலேஸ்வர சுவாமியின் திவ்ய அருள் உங்கள் குடும்பத்திற்கு எந்நாளும் நல்வாழ்வும் ஆரோக்கியமும் தரட்டும்.", en: "May the divine grace of Shri Mahabaleshwara always protect your family with enduring peace, joy, and vitality." }, lang)}
            </div>
          </div>

          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              border: `2px double ${GOLD}`,
              backgroundColor: PANEL,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 10px rgba(180, 140, 60, 0.2)`
            }}
          >
            <div style={{ fontSize: 16, color: GOLD }}>🕉️</div>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: INK, textTransform: "uppercase", marginTop: 1, textAlign: "center" }}>
              GOKARNA
            </div>
            <div style={{ fontSize: 6.5, color: GOLD, textTransform: "uppercase" }}>
              ARCHAKA
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
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
