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
  return (
    <div className="pdf-page" style={pageStyle}>
      <div
        style={{
          border: `3px solid ${GOLD}`,
          borderRadius: 16,
          padding: "36px 40px",
          minHeight: PAGE_H - 76,
          boxSizing: "border-box",
          backgroundColor: PAPER,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative"
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, color: INK, marginBottom: 10 }}>
          {pick(T.qrPrintHeader!, lang)}
        </div>
        <div style={{ fontSize: 13.5, color: INK_SOFT, marginBottom: 28, maxWidth: 680, lineHeight: 1.6 }}>
          {pick(T.scanQrDesc!, lang)}
        </div>

        {qrDataUrl && (
          <div
            style={{
              padding: 16,
              backgroundColor: "#FFFFFF",
              border: `2px solid ${GOLD_LIGHT}`,
              borderRadius: 16,
              display: "inline-block",
              marginBottom: 30,
              boxShadow: "0 8px 20px rgba(0,0,0,0.04)"
            }}
          >
            <img src={qrDataUrl} alt="QR Code" style={{ width: 260, height: 260 }} />
          </div>
        )}

        <div style={{ textAlign: "left", width: "100%", maxWidth: 640, backgroundColor: PANEL, padding: "22px 28px", borderRadius: 16, border: `1px solid ${GOLD_LIGHT}`, boxSizing: "border-box" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>
            {pick(T.scanQrTitle!, lang)}
          </div>
          <div style={{ fontSize: 15, color: INK, lineHeight: 1.9 }}>
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
            position: "absolute",
            bottom: 22,
            left: 42,
            right: 42,
            textAlign: "center",
            fontSize: 10,
            color: INK_SOFT
          }}
        >
          {pick(LETTER_L5.signature!, lang)} · 2 / 3
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
 * Sheet 6 — Page 3: Spiritual Guidance & Yearly Anugraha Sheet
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
  const baseLang = (lang || "en").split("-")[0] as SevaLang;
  const pickL5 = (dict: Record<string, L5>, key: string): string => pick(dict[key], lang);

  const TITLE_DICT: L5 = {
    kn: "✦ ಧಾರ್ಮಿಕ ಅನುಷ್ಠಾನ ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ವಾರ್ಷಿಕ ಅನುಗ್ರಹ ಪತ್ರಿಕೆ ✦",
    hi: "✦ धार्मिक अनुष्ठान मार्गदर्शन एवं वार्षिक अनुग्रह पत्र ✦",
    te: "✦ ధార్మిక అనుష్ఠాన మార్గదర్శనం మరియు వార్షిక అనుగ్రహ పత్రం ✦",
    ta: "✦ ஆன்மீக அனுஷ்டான வழிகாட்டல் மற்றும் வருடாந்திர அனுக்ரஹ அட்டை ✦",
    en: "✦ Devotee's Sacred Spiritual Rules & Yearly Anugraha Guidance Sheet ✦"
  };

  const SUBTITLE_DICT: L5 = {
    kn: "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸನ್ನಿಧಿಯಿಂದ ಅರ್ಚಕರು ಸೂಚಿಸಿದ ನಿತ್ಯ ನಿಯಮಗಳು ಹಾಗೂ ವಿಶೇಷ ಪೂಜಾ ಮಾರ್ಗದರ್ಶಿ",
    hi: "गोकर्ण श्री महाबलेश्वर स्वामी के पावन सान्निध्य से अर्चक द्वारा निर्दिष्ट नित्य नियम एवं विशेष पूजा मार्गदर्शिका",
    te: "గోకర్ణ శ్రీ మహాబలేశ్వర స్వామివారి దివ్య సన్నిధి నుండి అర్చకులు సూచించిన నిత్య నియమాలు మరియు విశేష పూజా మార్గదర్శి",
    ta: "கோகர்ண ஸ்ரீ மகாபலேஸ்வர சுவாமியின் திவ்ய சன்னதியிலிருந்து அர்ச்சகர் கூறிய நித்ய விதிகளும் விசேஷ பூஜை வழிகாட்டியும்",
    en: "Sacred daily spiritual commandments and auspicious worship guide recommended by Archaka from Gokarna Kshetra"
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
        kn: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸ್ನಾನಾನಂತರ ಮನೆಯ ದೇವರ ಮನೆಯಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ, ಪೂರ್ವಾಭಿಮುಖವಾಗಿ 108 ಬಾರಿ ಓಂ ನಮಃ ಶಿವಾಯ ಜಪಿಸುವುದು.",
        hi: "प्रतिदिन प्रातः स्नान के पश्चात पूजा घर में शुद्ध घी का दीपक जलाकर पूर्व दिशा की ओर 108 बार ॐ नमः शिवाय का जाप करें।",
        te: "ప్రతిరోజూ ఉదయం స్నానానంతరం పూజాగదిలో నెయ్యి దీపం వెలిగించి, తూర్పు ముఖంగా 108 సార్లు ఓం నమః శివాయ జపించండి.",
        ta: "தினமும் காலையில் குளித்தபின் பூஜை அறையில் நெய் தீபம் ஏற்றி, கிழக்கு நோக்கி 108 முறை ஓம் நம சிவாய ஜபிக்கவும்.",
        en: "Every morning after bath, light a pure ghee lamp facing East and chant 108 times 'Om Namah Shivaya'."
      }
    },
    {
      title: { kn: "🥛 ಸೋಮವಾರ ಕ್ಷೀರಾಭಿಷೇಕ", hi: "🥛 सोमवार दुग्धाभिषेक", te: "🥛 సోమవారం క్షీరాభిషేకం", ta: "🥛 திங்கள்கிழமை பாலாபிஷேகம்", en: "🥛 Monday Milk Archana" },
      desc: {
        kn: "ಪ್ರತಿ ಸೋಮವಾರ ಅಥವಾ ಪ್ರದೋಷ ತಿಥಿಯಂದು ಶಿವಲಿಂಗಕ್ಕೆ ಶುದ್ಧ ಹಾಲಿನ ಅಭಿಷೇಕ ಮಾಡಿಸುವುದರಿಂದ ಮನಃಶಾಂತಿ ಹಾಗೂ ಆರೋಗ್ಯ ದೊರೆಯುತ್ತದೆ.",
        hi: "प्रत्येक सोमवार या प्रदोष तिथि को शिवलिंग पर शुद्ध दूध से अभिषेक करने से मानसिक शांति और उत्तम स्वास्थ्य प्राप्त होता है।",
        te: "ప్రతి సోమవారం లేదా ప్రదోష తిథినాడు శివలింగానికి పాలుతో అభిషేకం చేయడం వలన మనఃశాంతి మరియు ఆరోగ్యం లభిస్తాయి.",
        ta: "ஒவ்வொரு திங்கள்கிழமை அல்லது பிரதோஷ திதியில் சிவலிங்கத்திற்கு பாலாபிஷேகம் செய்வது மன அமைதியும் ஆரோக்கியமும் தரும்.",
        en: "Offering milk abhishekam to Lord Shiva on Mondays or Pradosha tithi grants deep emotional peace and health resilience."
      }
    },
    {
      title: { kn: "🌾 ಗೋಸೇವೆ ಹಾಗೂ ಅನ್ನದಾನ", hi: "🌾 गोसेवा एवं अन्नदान", te: "🌾 గోసేవ మరియు అన్నదానం", ta: "🌾 பசு சேவை மற்றும் அன்னதானம்", en: "🌾 Cow Service & Charity" },
      desc: {
        kn: "ಪ್ರತಿ ಶನಿವಾರ ಅಥವಾ ಏಕಾದಶಿಯ ದಿನದಂದು ಗೋವುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು ನೀಡುವುದು ಮತ್ತು ಅನ್ನದಾನ ಮಾಡುವುದರಿಂದ ದೋಷಗಳು ಶಾಂತಿಯಾಗುತ್ತದೆ.",
        hi: "प्रत्येक शनिवार या एकादशी को गायों को हरा चारा खिलाने तथा अन्नदान करने से समस्त ग्रह दोष शांत होते हैं।",
        te: "ప్రతి శనివారం లేదా ఏకాదశి నాడు గోవులకు పచ్చగడ్డి తినిపించడం మరియు అన్నదానం చేయడం వలన గ్రహ దోషాలు తొలగిపోతాయి.",
        ta: "ஒவ்வொரு சனிக்கிழமை அல்லது ஏகாதசியன்று பசுக்களுக்கு அகத்திக்கீரை வழங்குவதும் அன்னதானமும் கிரக தோஷங்களை நீக்கும்.",
        en: "Feeding green grass to cows on Saturdays or Ekadashi neutralizes Pitru (ancestral) and Kuja doshas."
      }
    },
    {
      title: { kn: "📿 ಜನ್ಮ ನಕ್ಷತ್ರ ಮಂತ್ರ ಸಂಕಲ್ಪ", hi: "📿 जन्म नक्षत्र मंत्र संकल्प", te: "📿 జన్మ నక్షత్ర మంత్ర సంకల్పం", ta: "📿 ஜன்ம நட்சத்திர மந்திர சங்கல்பம்", en: "📿 Nakshatra Mantra Discipline" },
      desc: {
        kn: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಅಧಿಪತಿ ಗ್ರಹದ ಬೀಜಮಂತ್ರವನ್ನು ಪ್ರತಿದಿನ 108 ಬಾರಿ ನಿಷ್ಠೆಯಿಂದ ಜಪಿಸುವುದು ಸಕಲ ಕಾರ್ಯ ಜಯಕ್ಕೆ ಕಾರಣವಾಗುತ್ತದೆ.",
        hi: "अपने जन्म नक्षत्र के स्वामी ग्रह के बीज मंत्र का प्रतिदिन 108 बार निष्ठापूर्वक जाप करने से कार्यों में सफलता मिलती है।",
        te: "మీ జన్మ నక్షత్రాధిపతి గ్రహ బీజమంత్రాన్ని ప్రతిరోజూ 108 సార్లు జపించడం వలన సర్వకార్య జయం లభిస్తుంది.",
        ta: "உங்கள் ஜன்ம நட்சத்திர அதிபதியின் பீஜ மந்திரத்தை தினமும் 108 முறை ஜபிப்பது சகல காரியங்களிலும் வெற்றி தரும்.",
        en: "Chanting the beeja mantra of your birth star lord 108 times daily ensures victory in all legitimate endeavors."
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
        kn: "ಮಾನಸಿಕ ಒತ್ತಡ, ಸಾಲ ಬಾಧೆ ಹಾಗೂ ಅಡೆತಡೆಗಳ ನಿವಾರಣೆಗೆ ಶ್ರೇಷ್ಠ.",
        hi: "मानसिक तनाव, ऋण बाधा तथा रुकावटों के निवारण हेतु सर्वश्रेष्ठ।",
        te: "మానసిక ఒత్తిడి, అప్పుల బాధలు మరియు అడ్డంకుల నివారణకు శ్రేష్ఠం.",
        ta: "மன அழுத்தம், கடன் தொல்லை மற்றும் தடைகளை நீக்க சிறந்தது.",
        en: "Dissolves mental burdens, financial hurdles, and chronic ailments."
      }
    },
    {
      name: { kn: "ಸಂಕಷ್ಟ ಚತುರ್ಥಿ", hi: "संकष्टी चतुर्थी", te: "సంకష్ట చతుర్థి", ta: "சங்கடஹர சதுர்த்தி", en: "Sankashti Chaturthi" },
      desc: {
        kn: "ವ್ಯಾಪಾರ, ಉದ್ಯೋಗ ಹಾಗೂ ಹೊಸ ಕಾರ್ಯಗಳ ಯಶಸ್ಸಿಗೆ ಗಣಪತಿ ಪೂಜೆ.",
        hi: "व्यापार, नौकरी और नए कार्यों की सफलता हेतु गणपति पूजा।",
        te: "వ్యాపారం, ఉద్యోగం మరియు నూతన కార్యముల విజయానికి గణపతి పూజ.",
        ta: "வியாபாரம், வேலை மற்றும் புதிய காரிய வெற்றிக்கு கணபதி பூஜை.",
        en: "Removes work, business obstacles, and unlocks prosperity."
      }
    },
    {
      name: { kn: "ಏಕಾದಶಿ ವ್ರತ", hi: "एकादशी व्रत", te: "ఏకాదశి వ్రతం", ta: "ஏகாதசி விரதம்", en: "Ekadashi Vrata" },
      desc: {
        kn: "ಆರೋಗ್ಯ, ಆಯುಷ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿಗೆ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ.",
        hi: "स्वास्थ्य, आयु और पारिवारिक सुख हेतु विष्णु सहस्रनाम पाठ।",
        te: "ఆరోగ్యం, ఆయుష్షు మరియు కుటుంబ శాంతికి విష్ణు సహస్రనామం.",
        ta: "ஆரோக்கியம், ஆயுள் மற்றும் குடும்ப அமைதிக்கு விஷ்ணு சகஸ்ரநாமம்.",
        en: "Enhances health, longevity, and family emotional cohesion."
      }
    },
    {
      name: { kn: "ಹುಣ್ಣಿಮೆ / ಅಮಾವಾಸ್ಯೆ", hi: "पूर्णिमा / अमावस्या", te: "పౌర్ణమి / అమావాస్య", ta: "பௌர்ணமி / அமாவாசை", en: "Purnima / Amavasya" },
      desc: {
        kn: "ಪಿತೃ ತರ್ಪಣ, ಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಾಲಿಂಗ ದರ್ಶನ.",
        hi: "पितृ तर्पण, ग्रह शांति तथा महाबलेश्वर आत्मालिंग दर्शन।",
        te: "పితృ తర్పణం, గ్రహ శాంతి మరియు మహాబలేశ్వర ఆత్మలింగ దర్శనం.",
        ta: "பித்ரு தர்பணம், கிரக சாந்தி மற்றும் மகாபலேஸ்வர ஆத்மலிங்க தரிசனம்.",
        en: "Pitra Tarpanam, Graha Shanti, and Mahabaleshwara blessings."
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
      title: { kn: "🌿 ಶಂಖ ತೀರ್ಥ ಸ್ನಾನ", hi: "🌿 शंख तीर्थ स्नान", te: "🌿 శంఖ తీర్థ స్నానం", ta: "🌿 சங்கு தீர்த்த ஸ்நானம்", en: "🌿 Sacred Teertha Ablution" },
      desc: {
        kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರವೇಶದ ನಂತರ ಸನ್ನಿಧಿ ದರ್ಶನಕ್ಕೆ ಮುನ್ನ ಪವಿತ್ರ ಜಲದಲ್ಲಿ ಆಚಮನ ಅಥವಾ ಸ್ನಾನ ಮಾಡುವುದು ಶುದ್ಧಿಗೆ ಮುಖ್ಯ.",
        hi: "गोकर्ण क्षेत्र में प्रवेश के बाद दर्शन से पूर्व पवित्र जल से आचमन या स्नान करना आत्मशुद्धि के लिए आवश्यक है।",
        te: "గోకర్ణ క్షేత్ర ప్రవేశం తర్వాత దర్శనానికి ముందు పవిత్ర జలంలో ఆచమనం లేదా స్నానం చేయడం శుద్ధికి ముఖ్యం.",
        ta: "கோகர்ண க்ஷேத்திர பிரவேசத்திற்கு பின் தரிசனத்திற்கு முன் புனித தீர்த்தத்தில் ஆசமனம் செய்வது அவசியம்.",
        en: "Perform reverent ablution at Gokarna teertha before worshipping the sacred Atmalinga for inner purification."
      }
    },
    {
      title: { kn: "🕉️ ಆತ್ಮಾಲಿಂಗ ಸ್ಪರ್ಶ ಮರ್ಯಾದೆ", hi: "🕉️ आत्मालिंग स्पर्श मर्यादा", te: "🕉️ ఆత్మలింగ స్పర్శ మర్యాద", ta: "🕉️ ஆத்மலிங்க ஸ்பர்ச மரியாதை", en: "🕉️ Atmalinga Touch Reverence" },
      desc: {
        kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಾಲಿಂಗ ಸ್ಪರ್ಶ ಮಾಡುವಾಗ ಅತ್ಯಂತ ಭಕ್ತಿ, ಸ್ವಚ್ಛತೆ ಹಾಗೂ ಶಿವ ಸಂಕಲ್ಪದಿಂದ ಪೂಜಿಸಬೇಕು.",
        hi: "श्री महाबलेश्वर आत्मालिंग का स्पर्श करते समय परम भक्ति, पवित्रता और शिव संकल्प से पूजन करें।",
        te: "శ్రీ మహాబలేశ్వర ఆత్మలింగ స్పర్శ చేసేటప్పుడు అత్యంత భక్తి, శౌచం మరియు శివ సంకల్పంతో పూజించాలి.",
        ta: "ஸ்ரீ மகாபலேஸ்வர ஆத்மலிங்க ஸ்பர்சம் செய்யும்போது மிகுந்த பக்தி, சுத்தம் மற்றும் சிவ சங்கல்பத்துடன் பூஜிக்கவும்.",
        en: "Offer prayers at the holy feet of Shri Mahabaleshwara Atmalinga with utter devotion, clean mind, and Gotra sankalpa."
      }
    },
    {
      title: { kn: "🌺 ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ರುದ್ರಾಭಿಷೇಕ", hi: "🌺 बिल्वार्चन एवं रुद्राभिषेक", te: "🌺 బిల్వార్చన మరియు రుద్రాభిషేకం", ta: "🌺 பில்வார்ச்சனை மற்றும் ருத்ராபிஷேகம்", en: "🌺 Bilva & Rudrabhishekam" },
      desc: {
        kn: "ತ್ರಿಪತ್ರ ಬಿಲ್ವಪತ್ರೆಯಿಂದ ಅಷ್ಟೋತ್ತರ ಪೂಜೆ ಮಾಡಿಸುವುದರಿಂದ ಸರ್ವ ಪಾಪ ನಿವಾರಣೆಯಾಗಿ ಸಂಸಾರ ಸಿದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
        hi: "त्रिदल बिल्वपत्र से अष्टोत्तर पूजा कराने से समस्त पापों का क्षय होकर पारिवारिक समृद्धि प्राप्त होती है।",
        te: "త్రిపత్ర బిల్వపత్రంతో అష్టోత్తర పూజ చేయించడం వలన సర్వ పాప నివారణ జరిగి కుటుంబ సౌఖ్యం లభిస్తుంది.",
        ta: "முப்பத்திர பில்வபத்திரத்தால் அஷ்டோத்தர பூஜை செய்வது சர்வதோஷ நிவர்த்தியும் குடும்ப யோகமும் தரும்.",
        en: "Offering fresh Bilva leaves during Rudrabhishekam dissolves karmic afflictions and grants domestic harmony."
      }
    }
  ];

  const MANTHRA_DESC_DICT: L5 = {
    kn: "ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಣವು ನಿಮ್ಮ ಹಾಗೂ ನಿಮ್ಮ ಸಕಲ ಕೌಟುಂಬಿಕ ಸದಸ್ಯರ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ರಕ್ಷಣೆಗೆ ದಿವ್ಯ ಕವಚವಾಗಿದೆ.",
    hi: "महामृत्युंजय मंत्र का पाठ आपके और आपके समस्त परिवार के लिए आयु, आरोग्य और सुरक्षा का दिव्य कवच है।",
    te: "మహా మృత్యుంజయ మంత్ర జపం మీ మరియు మీ కుటుంబ సభ్యుల ఆయుష్షు, ఆరోగ్యం మరియు రక్షణకు దివ్య కవచం.",
    ta: "மகா மிருத்யுஞ்சய மந்திர ஜபம் உங்கள் குடும்பத்தின் ஆயுள், ஆரோக்கியம் மற்றும் பாதுகாப்புக்கு திவ்ய கவசம்.",
    en: "Reciting the Maha Mrityunjaya Mantra serves as a cosmic armor shielding your family with health, peace, and divine resilience."
  };

  const SANKALPA_TITLE_DICT: L5 = {
    kn: "✦ ನಿತ್ಯ ಪೂಜಾ ಸಂಕಲ್ಪ ಹಾಗೂ ಗ್ರಹ ಶಮನ ಜಪ ವಿಧಾನ ✦",
    hi: "✦ नित्य पूजा संकल्प एवं ग्रह शांति जप विधान ✦",
    te: "✦ నిత్య పూజా సంకల్పం మరియు గ్రహ శాంతి జప విధానం ✦",
    ta: "✦ நித்ய பூஜை சங்கல்பம் மற்றும் கிரக சாந்தி ஜப முறை ✦",
    en: "✦ Sacred Daily Pooja Sankalpa & Navagraha Shanti Guide ✦"
  };

  const SANKALPA_DESC_DICT: L5 = {
    kn: "ಪ್ರತಿದಿನ ಸಂಜೆ ಮನೆಯ ದೇವರ ಮನೆಯಲ್ಲಿ ಈಶ್ವರ ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರ ದೇವತೆಯನ್ನು ಸ್ಮರಿಸಿ ಅರ್ಘ್ಯ ನೀಡುವುದು ಮತ್ತು 108 ಬಾರಿ ಮೂಲಮಂತ್ರ ಪಠಿಸುವುದು ಸಮಸ್ತ ಕುಟುಂಬಕ್ಕೆ ಸುಕ್ಷೇಮ ತರುತ್ತದೆ.",
    hi: "प्रतिदिन सायं पूजा घर में भगवान शिव एवं जन्म नक्षत्र देवता का स्मरण कर अर्घ्य दें तथा 108 बार मूल मंत्र का पाठ करें।",
    te: "ప్రతిరోజూ సాయంత్రం పూజాగదిలో ఈశ్వరుని మరియు జన్మ నక్షత్ర దేవతను స్మరించి అర్ఘ్యం ఇవ్వడం, 108 సార్లు మూలమంత్రం జపించడం కుటుంబానికి శుభకరం.",
    ta: "தினமும் மாலையில் பூஜை அறையில் ஈஸ்வரனையும் நட்சத்திர தேவதையையும் ஸ்மரித்து அர்க்யம் கொடுப்பது குடும்பத்திற்கு க்ஷேமம் தரும்.",
    en: "Offering daily evening Arghya and chanting 108 times the beeja mantra brings enduring prosperity, protection, and mental peace."
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
    kn: "ವಿಶೇಷ ಗೋತ್ರ ಸಂಕಲ್ಪ ಸೇವೆ, ಮಹಾಪೂಜೆ, ನವಗ್ರಹ ದೋಷ ಶಾಂತಿ ಹಾಗೂ ಗೋಕರ್ಣ ಪ್ರಸಾದವನ್ನು ಮನೆಗೆ ತಲುಪಿಸಲು ಅರ್ಚಕರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಬಹುದು.",
    hi: "विशेष गोत्र संकल्प सेवा, महापूजा, नवग्रह दोष शांति तथा गोकर्ण प्रसाद घर मंगाने हेतु अर्चक से प्रत्यक्ष संपर्क करें।",
    te: "విశేష గోత్ర సంకల్ప సేవ, మహాపూజ, నవగ్రహ దోష శాంతి మరియు గోకర్ణ ప్రసాదాన్ని ఇంటికి తెప్పించుకోవడానికి అర్చకులను నేరుగా సంప్రదించవచ్చు.",
    ta: "விசேஷ கோத்ர சங்கல்ப சேவை, மகாபூஜை, நவகிரக தோஷ சாந்தி மற்றும் பிரசாதம் பெற அர்ச்சகரை நேரில் தொடர்புகொள்ளலாம்.",
    en: "For special Gotra Sankalpa Seva, Mahapooja, Navagraha Shanti, and home delivery of Mahabaleshwara Prasada, consult the Archaka directly."
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
          <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginTop: 2, lineHeight: 1.6 }}>
            {pick(TITLE_DICT, lang)}
          </div>
          <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 2, lineHeight: 1.6, maxWidth: 700, margin: "2px auto 0" }}>
            {pick(SUBTITLE_DICT, lang)}
          </div>
        </div>

        <OrnamentRule />

        {/* Section 1: Devotee Commandments */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
            {pick(RULES_TITLE_DICT, lang)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {RULES_LIST.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  border: `1.5px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: PANEL,
                  padding: "8px 12px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, marginBottom: 2, lineHeight: 1.5 }}>
                  {pick(rule.title, lang)}
                </div>
                <div style={{ fontSize: 9.5, color: INK_SOFT, lineHeight: 1.6 }}>
                  {pick(rule.desc, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Monthly Tithi Guide */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
            {pick(TITHI_TITLE_DICT, lang)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
            {TITHI_GUIDE.map((tg, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "7px 6px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 700, color: GOLD, lineHeight: 1.5 }}>{pick(tg.name, lang)}</div>
                <div style={{ fontSize: 9, color: INK_SOFT, marginTop: 2, lineHeight: 1.5 }}>
                  {pick(tg.desc, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Gokarna Kshetra Darshana Rules */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
            {pick(KSHETRA_TITLE_DICT, lang)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {KSHETRA_RULES.map((kr, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: PANEL,
                  padding: "8px 10px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 700, color: INK, marginBottom: 2, lineHeight: 1.5 }}>
                  {pick(kr.title, lang)}
                </div>
                <div style={{ fontSize: 9, color: INK_SOFT, lineHeight: 1.6 }}>
                  {pick(kr.desc, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Maha Mrityunjaya & Gotra Blessing Banner */}
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
          <div style={{ fontSize: 9.5, fontWeight: 700, color: GOLD, letterSpacing: 1.5, textTransform: "uppercase" }}>
            ॐ ತ್ರಯ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ | ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ||
          </div>
          <div style={{ fontSize: 9.5, color: INK_SOFT, marginTop: 3, lineHeight: 1.6 }}>
            {pick(MANTHRA_DESC_DICT, lang)}
          </div>
        </div>

        {/* Section 5: Daily Pooja Sankalpa & Shanti Guide */}
        <div
          style={{
            marginTop: 10,
            backgroundColor: PANEL,
            border: `1px solid ${GOLD_LIGHT}`,
            borderRadius: 10,
            padding: "10px 14px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: GOLD, marginBottom: 2 }}>
            {pick(SANKALPA_TITLE_DICT, lang)}
          </div>
          <div style={{ fontSize: 9.5, color: INK_SOFT, lineHeight: 1.6 }}>
            {pick(SANKALPA_DESC_DICT, lang)}
          </div>
        </div>

        {/* Section 6: Priest Direct Consultation Card */}
        <div
          style={{
            marginTop: 10,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 10,
            backgroundColor: "#FFFFFF",
            padding: "10px 16px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 2 }}>
            {pick(ARCHAKA_HEADER_DICT, lang)}
          </div>
          <div style={{ fontSize: 11, color: INK, fontWeight: 700, marginTop: 1 }}>
            {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"} — {pick(ARCHAKA_ROLE_DICT, lang)}
          </div>
          <div style={{ fontSize: 9.5, color: INK_SOFT, marginTop: 2, lineHeight: 1.6, maxWidth: 680, margin: "2px auto 0" }}>
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
            fontSize: 9,
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
 * Sheet 7 — Page 4: Remedial Puja & Family Lineage Protection Sheet
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
    kn: "೧೨ ಮಾಸಗಳ ಗ್ರಹ ದೋಷ ಶಮನ, ವಾಸ್ತು ಧರ್ಮ ಸೂತ್ರಗಳು ಹಾಗೂ ಕುಲದೇವರ ಪಿತೃ ಆಶೀರ್ವಾದ ಮಾರ್ಗದರ್ಶಿ",
    hi: "१२ मासों के ग्रह दोष निवारण, वास्तु धर्म सूत्र तथा कुलदेवता एवं पितृ आशीर्वाद मार्गदर्शिका",
    te: "໑௨ మాసముల గ్రహ దోష నివారణ, వాస్తు ధర్మ సూత్రాలు మరియు కులదేవత పితృ ఆశీర్వాద మార్గదర్శి",
    ta: "12 மாதங்களின் கிரக தோஷ நிவர்த்தி, வாஸ்து தர்ம சூத்திரங்கள் மற்றும் குலதெய்வ பித்ரு ஆசீர்வாத வழிகாட்டி",
    en: "Comprehensive 12-month planetary remedial cycle, domestic Vastu guidelines, and ancestral peace rules"
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
        kn: "ಉದ್ಯೋಗಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಆರೋಗ್ಯ ವೃದ್ಧಿಗೆ ವಸಂತ ನವರಾತ್ರಿ ಶ್ರೀ ಸೂಕ್ತ ಪೂಜೆ ಹಾಗೂ ಸೂರ್ಯಾಭಿಷೇಕ ಶ್ರೇಷ್ಠ.",
        hi: "व्यापार वृद्धि और आरोग्य हेतु वसंत नवरात्रि श्री सूक्त पूजन तथा सूर्याभिषेक सर्वश्रेष्ठ है।",
        te: "ఉద్యోగాభివృద్ధి మరియు ఆరోగ్యం కొరకు వసంత నవరాత్రి శ్రీ సూక్త పూజ మరియు సూర్యాభిషేకం శ్రేష్ఠం.",
        ta: "தொழில் வளர்ச்சி மற்றும் ஆரோக்கியத்திற்கு வசந்த நவராத்திரி ஸ்ரீ சூக்த பூஜையும் சூரியாபிஷேகமும் சிறந்தது.",
        en: "Spring Navaratri Lakshmi worship and Surya abhishekam boost professional growth and vitality."
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
        kn: "ಕುಜ ದೋಷ, ಸರ್ಪ ದೋಷ ಹಾಗೂ ಸಂತಾನ ತಡೆ ನಿವಾರಣೆಗೆ ಪವಿತ್ರ ಶ್ರಾವಣ ಸೋಮವಾರ ರುದ್ರಾಭಿಷೇಕ.",
        hi: "कुज दोष, सर्प दोष तथा संतान बाधा निवारण हेतु श्रावण सोमवार को रुद्राभिषेक कराएं।",
        te: "కుజ దోషం, సర్ప దోషం మరియు సంతాన నివారణకు పవిత్ర శ్రావణ సోమవారం రుద్రాభిషేకం.",
        ta: "செவ்வாய் தோஷம், நாக தோஷம் மற்றும் புத்திர தடையை நீக்க ஆடி/ஆவணி சோமவார ருத்ராபிஷேகம்.",
        en: "Holy Shravana Mondays Rudrabhishekam dissolves Kuja (Mars) and Sarpa (Ketu) marital impediments."
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
        kn: "ಪಿತೃ ದೋಷ ಶಮನಕ್ಕೆ ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆಯಂದು ಗೋಕರ್ಣ ತೀರ್ಥದಲ್ಲಿ ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಅನ್ನದಾನ ಮಾಡುವುದು.",
        hi: "पितृ दोष शांति हेतु महालया अमावस्या पर गोकर्ण तीर्थ में तर्पण एवं अन्नदान करें।",
        te: "పితృ దోష శాంతికి మహాలయ అమావాస్య నాడు గోకర్ణ తీర్థంలో తర్పణం మరియు అన్నదానం చేయడం.",
        ta: "பித்ரு தோஷ சாந்திக்கு மகாளய அமாவாசையன்று கோகர்ண தீர்த்தத்தில் தர்பணமும் அன்னதானமும் செய்யவும்.",
        en: "Performing Mahalaya Pitru Tarpanam at Gokarna Teertha invokes eternal blessings of departed ancestors."
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
        kn: "ಕಾರ್ತಿಕ ಸೋಮವಾರ ಲಕ್ಷ ದೀಪೋತ್ಸವ ಹಾಗೂ ಮಹಾ ಶಿವರಾತ್ರಿಯಂದು ಆತ್ಮಾಲಿಂಗ ಸ್ಪರ್ಶ ಪೂಜೆಯಿಂದ ಐಶ್ವರ್ಯ ವೃದ್ಧಿ.",
        hi: "कार्तिक सोमवार दीपदान तथा महाशिवरात्रि पर आत्मालिंग स्पर्श पूजन से सर्व समृद्धि मिलती है।",
        te: "కార్తీక సోమవారం దీపారాధన మరియు మహా శివరాత్రి నాడు ఆత్మలింగ స్పర్శ పూజతో సర్వ సమృద్ధి.",
        ta: "கார்த்திகை சோமவார தீப வழிபாடும் மகா சிவராத்திரி ஆத்மலிங்க தரிசனமும் ஐஸ்வர்யத்தை அளிக்கும்.",
        en: "Lighting lamps during Kartika and visiting Gokarna on Maha Shivaratri opens gates of unshakeable prosperity."
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
        kn: "ಮನೆಯ ಮುಖ್ಯ ದ್ವಾರದಲ್ಲಿ ಪ್ರತಿದಿನ ಗೋಕರ್ಣ ಪ್ರಸಾದದ ಅರಿಶಿನ-ಕುಂಕುಮ ಇಡುವುದರಿಂದ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಬಾಧೆ ಶಮನವಾಗುತ್ತದೆ.",
        hi: "घर के मुख्य द्वार पर प्रतिदिन गोकर्ण प्रसाद का हल्दी-कुमकुम लगाने से नकारात्मक ऊर्जा दूर होती है।",
        te: "ఇంటి ముఖ్య ద్వారానికి ప్రతిరోజూ గోకర్ణ ప్రసాదం పసుపు-కుంకుమ అద్దడం వలన నకారాత్మక శక్తి తొలగిపోతుంది.",
        ta: "வீட்டின் தலைவாசலில் தினமும் கோகர்ண பிரசாத மஞ்சள்-குங்குமம் வைப்பது துஷ்ட சக்திகளை விலக்கும்.",
        en: "Applying sacred Gokarna Kumkuma at the main entrance shields the home from negative energy and evil eye."
      }
    },
    {
      title: { kn: "🪔 ಪೂರ್ವ ದಿಕ್ಕು ದೇವತಾ ಸ್ಥಾನ", hi: "🪔 पूर्व दिशा देवता स्थान", te: "🪔 తూర్పు దిక్కు దేవతా స్థానం", ta: "🪔 கிழக்கு திசை பூஜை பீடம்", en: "🪔 East Facing Altar Alignment" },
      desc: {
        kn: "ದೇವರ ಮನೆಯನ್ನು ಮನೆಯ ಈಶಾನ್ಯ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕಿನಲ್ಲಿರಿಸಿ ಪೂರ್ವಾಭಿಮುಖವಾಗಿ ಪೂಜೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಮಂಗಳಕರ.",
        hi: "पूजा घर को पूर्व या ईशान कोण में स्थापित कर पूर्व दिशा की ओर मुख करके पूजन करना परम शुभ है।",
        te: "పూజాగదిని ఈశాన్యం లేదా తూర్పు దిశలో ఉంచి తూర్పు ముఖంగా పూజించడం అత్యంత శుభకరం.",
        ta: "பூஜை அறையை ஈசானியம் அல்லது கிழக்கில் அமைத்து கிழக்கு நோக்கி பூஜிப்பது மிக மங்கலமானது.",
        en: "Positioning the family altar in North-East or East direction ensures divine vibrations and inner tranquility."
      }
    },
    {
      title: { kn: "🌿 ಕರ್ಪೂರ ನೈವೇದ್ಯ ಧೂಪ", hi: "🌿 कर्पूर नैवेद्य धूप", te: "🌿 కర్పూర నైవేద్య ధూపం", ta: "🌿 கற்பூர ஆராதனை தூபம்", en: "🌿 Camphor Aarti & Incense Purification" },
      desc: {
        kn: "ಪ್ರತಿದಿನ ಸಂಜೆ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ಮರಣೆಯೊಂದಿಗೆ ಕರ್ಪೂರ ಆರತಿ ಬೆಳಗುವುದರಿಂದ ಕೌಟುಂಬಿಕ ಕಲಹಗಳು ಶಾಂತಿಯಾಗುತ್ತದೆ.",
        hi: "प्रतिदिन सायं श्री महाबलेश्वर स्मरण के साथ कर्पूर आरती करने से पारिवारिक कलह शांत होते हैं।",
        te: "ప్రతిరోజూ సాయంత్రం శివ స్మరణతో కర్పూర హారతి వెలిగించడం వలన కుటుంబ కలహాలు శమిస్తాయి.",
        ta: "தினமும் மாலையில் சிவ ஸ்மரணத்துடன் கற்பூர ஆரத்தி செய்வது குடும்ப சண்டைகளை நீக்கி அமைதி தரும்.",
        en: "Lighting pure camphor every evening purifies domestic aura and resolves subtle interpersonal friction."
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
    kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರವು ರುದ್ರಪಾದ ಕ್ಷೇತ್ರವಾಗಿದ್ದು, ಇಲ್ಲಿ ಪಿತೃ ಶ್ರಾದ್ಧ ಹಾಗೂ ಸಂಪ್ರೋಕ್ಷಣ ಸೇವೆ ನೆರವೇರಿಸುವುದರಿಂದ ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಮುಕ್ತಿ ದೊರೆತು, ಸಂತತಿ ಹಾಗೂ ಧನ ವೃದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
    hi: "गोकर्ण क्षेत्र रुद्रपाद तीर्थ है, यहाँ पितृ श्राद्ध एवं तर्पण सेवा कराने से सात पीढ़ियों के पितरों को सद्गति मिलती है तथा वंश वृद्धि होती है।",
    te: "గోకర్ణ క్షేత్రం రుద్రపాద క్షేత్రం, ఇక్కడ పితృ శ్రాద్ధం మరియు తర్పణ సేవ చేయడం వలన ఏడు తరాల పితృదేవతలకు ముక్తి లభించి వంశాభివృద్ధి జరుగుతుంది.",
    ta: "கோகர்ண க்ஷேத்திரம் ருத்ரபாத தீர்த்தமாகும். இங்கு பித்ரு சிரார்த்தமும் தர்பணமும் செய்வது 7 தலைமுறை பித்ருக்களுக்கு முக்தியும் வம்ச விருத்தியும் தரும்.",
    en: "Gokarna is the revered Rudrapada Kshetra; performing ancestral rites here guarantees liberation to 7 generations and prospers children."
  };

  const PRASADA_USE_TITLE_DICT: L5 = {
    kn: "✦ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ನಿತ್ಯ ವಿನಿಯೋಗ ಹಾಗೂ ಸಂರಕ್ಷಣೆ ✦",
    hi: "✦ गोकर्ण महाबलेश्वर प्रसाद नित्य उपयोग एवं संरक्षण ✦",
    te: "✦ గోకర్ణ మహాబలేశ్వర ప్రసాదం నిత్య వినియోగం మరియు సంరక్షణ ✦",
    ta: "✦ கோகர்ண மகாபலேஸ்வர பிரசாத உபயோகம் மற்றும் பாதுகாப்பு ✦",
    en: "✦ Gokarna Mahabaleshwara Sacred Prasada Preservation & Use ✦"
  };

  const PRASADA_USE_DESC_DICT: L5 = {
    kn: "ಲಭಿಸಿದ ವಿಭೂತಿ ಹಾಗೂ ನಾಣ್ಯ ಪ್ರಸಾದವನ್ನು ಮನೆಯ ದೇವರ ಪೆಟ್ಟಿಗೆಯಲ್ಲಿರಿಸಿ, ಮುಖ್ಯ ಕಾರ್ಯಗಳಿಗೆ ತೆರಳುವಾಗ ವಿಭೂತಿಯನ್ನು ಹಣೆಗೆ ಧರಿಸುವುದು ನಿರಂತರ ಜಯವನ್ನು ನೀಡುತ್ತದೆ.",
    hi: "प्राप्त विभूति तथा प्रसाद सिक्के को पूजा घर अथवा तिजोरी में रखें। महत्वपूर्ण कार्य हेतु निकलते समय विभूति धारण करने से विजय मिलती है।",
    te: "లభించిన విభూతి మరియు ప్రసాద నాణేన్ని పూజాగదిలో లేదా బీరువాలో ఉంచండి. ముఖ్యమైన పనులకు వెళ్ళేటప్పుడు విభూతి ధరించడం వలన విజయం లభిస్తుంది.",
    ta: "பெற்ற விபூதி மற்றும் பிரசாத நாணயத்தை பூஜை பெட்டியில் வைக்கவும். முக்கிய காரியங்களுக்குச் செல்லும்போது விபூதி அணிவது வெற்றி தரும்.",
    en: "Keep sacred Gokarna Vibhuti and blessed coins in your home locker/altar. Applying Vibhuti before journeys ensures divine protection."
  };

  const SEAL_HEADER_DICT: L5 = {
    kn: "✦ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರ ಹಸ್ತದ ಸೀಲು ಹಾಗೂ ನವೀಕರಣ ಮುದ್ರೆ ✦",
    hi: "✦ गोकर्ण महाबलेश्वर क्षेत्र मुख्य अर्चक प्रत्यक्ष सील एवं नवीकरण मुद्रा ✦",
    te: "✦ గోకర్ణ మహాబలేశ్వర క్షేత్ర ప్రధాన అర్చకుల సాలు మరియు నవీకరణ ముద్ర ✦",
    ta: "✦ கோகர்ண மகாபலேஸ்வர க்ஷேத்திர முதன்மை அர்ச்சகர் சீல் மற்றும் புதுப்பித்தல் ✦",
    en: "✦ Chief Archaka Official Seal & Annual Seva Renewal Badge ✦"
  };

  const SEAL_DESC_DICT: L5 = {
    kn: "ಈ ಪತ್ರಿಕೆಯು ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸಂಕಲ್ಪ ಪತ್ರಿಕೆಯಾಗಿದ್ದು, ಪ್ರತivarಷ ಸಂಕಲ್ಪ ನವೀಕರಣಕ್ಕೆ ಹಾಗೂ ಬಂಧು-ಮಿತ್ರರ ಪೂಜಾ ಮಾರ್ಗದರ್ಶನಕ್ಕೆ ಸಂಪರ್ಕಿಸಬಹುದು.",
    hi: "यह पत्र गोकर्ण श्री महाबलेश्वर स्वामी का दिव्य संकल्प पत्र है। प्रतिवर्ष संकल्प नवीकरण तथा परिजनों के पूजन हेतु अर्चक से संपर्क करें।",
    te: "ఈ పత్రం గోకర్ణ శ్రీ మహాబలేశ్వర స్వామివారి దివ్య సంకల్ప పత్రం. ప్రతి సంవత్సరం సంకల్ప నవీకరణ మరియు బంధువుల పూజల కొరకు సంప్రదించండి.",
    ta: "இந்த அட்டை கோகர்ண ஸ்ரீ மகாபலேஸ்வர சுவாமியின் திவ்ய சங்கல்ப அட்டையாகும். வருடாந்திர புதுப்பித்தல் மற்றும் பூஜைகளுக்கு அர்ச்சகரைத் தொடர்புகொள்ளலாம்.",
    en: "This document is an authentic spiritual covenant from Shri Mahabaleshwara Gokarna Kshetra. Retain for annual Seva renewal and referral."
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
          <div style={{ fontSize: 15.5, fontWeight: 700, color: INK, marginTop: 2, lineHeight: 1.6 }}>
            {pick(TITLE_DICT, lang)}
          </div>
          <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 2, lineHeight: 1.6, maxWidth: 700, margin: "2px auto 0" }}>
            {pick(SUBTITLE_DICT, lang)}
          </div>
        </div>

        <OrnamentRule />

        {/* Section 1: 12-Month Remedial Cycle */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
            {pick(CYCLE_TITLE_DICT, lang)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {CYCLE_LIST.map((cy, idx) => (
              <div
                key={idx}
                style={{
                  border: `1.5px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: PANEL,
                  padding: "8px 12px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: INK, marginBottom: 2, lineHeight: 1.5 }}>
                  {pick(cy.title, lang)}
                </div>
                <div style={{ fontSize: 9.5, color: INK_SOFT, lineHeight: 1.6 }}>
                  {pick(cy.desc, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Vastu & Wealth Energy Rules */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", textAlign: "center" }}>
            {pick(VASTU_TITLE_DICT, lang)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {VASTU_RULES.map((vr, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "8px 10px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 700, color: INK, marginBottom: 2, lineHeight: 1.5 }}>
                  {pick(vr.title, lang)}
                </div>
                <div style={{ fontSize: 9, color: INK_SOFT, lineHeight: 1.6 }}>
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
            border: `1px solid ${GOLD_LIGHT}`,
            borderRadius: 10,
            padding: "10px 14px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: GOLD, marginBottom: 2 }}>
            {pick(PITRU_TITLE_DICT, lang)}
          </div>
          <div style={{ fontSize: 9.5, color: INK_SOFT, lineHeight: 1.6 }}>
            {pick(PITRU_DESC_DICT, lang)}
          </div>
        </div>

        {/* Section 4: Gokarna Mahabaleshwara Prasada Preservation */}
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
          <div style={{ fontSize: 10.5, fontWeight: 700, color: GOLD, marginBottom: 2 }}>
            {pick(PRASADA_USE_TITLE_DICT, lang)}
          </div>
          <div style={{ fontSize: 9.5, color: INK_SOFT, lineHeight: 1.6 }}>
            {pick(PRASADA_USE_DESC_DICT, lang)}
          </div>
        </div>

        {/* Section 5: Chief Archaka Official Seal Badge */}
        <div
          style={{
            marginTop: 10,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 10,
            backgroundColor: PANEL,
            padding: "10px 16px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16
          }}
        >
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 2 }}>
              {pick(SEAL_HEADER_DICT, lang)}
            </div>
            <div style={{ fontSize: 10.5, color: INK, fontWeight: 700 }}>
              {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"} — {pick({ kn: "ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ", hi: "मुख्य अर्चक, गोकर्ण महाबलेश्वर क्षेत्र", te: "ముఖ్య అర్చకులు, గోకర్ణ మహాబలేశ్వర క్షేత్రం", ta: "முதன்மை அர்ச்சகர், கோகர்ண மகாபலேஸ்வர க்ஷேத்திரம்", en: "Chief Archaka, Gokarna Mahabaleshwara Kshetra" }, lang)}
            </div>
            <div style={{ fontSize: 9, color: INK_SOFT, marginTop: 2, lineHeight: 1.6 }}>
              {pick(SEAL_DESC_DICT, lang)}
            </div>
          </div>

          {/* Luxury Archaka Golden Stamp Emblem */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
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
            <div style={{ fontSize: 7.5, fontWeight: 700, color: INK, textTransform: "uppercase", marginTop: 2, textAlign: "center" }}>
              GOKARNA
            </div>
            <div style={{ fontSize: 6.5, color: GOLD, textTransform: "uppercase" }}>
              CHIEF ARCHAKA
            </div>
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
            fontSize: 9,
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
 * Sheet 8 — Page 5: Gokarna Panchanga Divine Mandala & Visual Blueprint
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
    const isLakshmi = sevaTitle.toLowerCase().includes("lakshmi") || sevaTitle.includes("ಲಕ್ಷ್ಮಿ") || sevaTitle.includes("लक्ष्मी") || sevaTitle.includes("లక్ష్మి") || sevaTitle.includes("லட்சுமி");

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
            <div style={{ fontSize: 20, fontWeight: 800, color: INK, marginTop: 4, lineHeight: 1.5 }}>
              {sevaTitle} — {pick({ kn: "ಪವಿತ್ರ ಮಹಾತ್ಮೆಯ ಹಾಗೂ ಫಲಶ್ರುತಿ ಪತ್ರ", hi: "पवित्र माहात्म्य एवं फलश्रुति पत्र", te: "పవిత్ర మాహాత్మ్యం మరియు ఫలశ్రుతి పత్రం", ta: "புனித மகாத்மியம் மற்றும் பலன் பத்திரம்", en: "Sacred Significance & Divine Blessing Consecration" }, lang)}
            </div>
            <div style={{ fontSize: 13, color: INK_SOFT, marginTop: 4, lineHeight: 1.6 }}>
              {pick({ kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದ ಮುಖ್ಯ ಅರ್ಚಕರ ಅಧಿಕೃತ ಪೂಜಾ ವಿವರಣೆ ಹಾಗೂ ಪ್ರಸಾದ ಮಹಾತ್ಮೆ", hi: "श्री गोकर्ण महाबलेश्वर क्षेत्र के मुख्य अर्चक का आधिकारिक पूजन विवरण", te: "శ్రీ గోకర్ణ మహాబలేశ్వర క్షేత్ర ప్రధాన అర్చకుల అధికారిక పూజా వివరణ", ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வர க்ஷேத்திர முதன்மை அர்ச்சகரின் அதிகாரப்பூர்வ பூஜை விவரம்", en: "Official Temple Consecration & Spiritual Significance Narrated by Pradhana Archaka" }, lang)}
            </div>
          </div>

          <OrnamentRule />

          {/* Section 1: What is this Pooja */}
          <div
            style={{
              marginTop: 18,
              backgroundColor: PANEL,
              border: `1.5px solid ${GOLD}`,
              borderRadius: 12,
              padding: "18px 24px"
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: GOLD, marginBottom: 8 }}>
              ೧. {pick({ kn: "ಈ ಪೂಜೆಯ ಪವಿತ್ರ ಹಿನ್ನೆಲೆ ಹಾಗೂ ಮಹತ್ವ", hi: "१. इस पूजा का पवित्र महात्म्य एवं पृष्ठभूमि", te: "౧. ఈ పూజ యొక్క పవిత్ర నేపథ్యం మరియు ప్రాముఖ్యత", ta: "1. இந்த பூஜையின் புனித வரலாறு மற்றும் முக்கியத்துவம்", en: "1. Sacred Vedic Origin & Significance of this Pooja" }, lang)}
            </div>
            <div style={{ fontSize: 14, color: INK, lineHeight: 1.85, textAlign: "justify" }}>
              {wPooja}
            </div>
          </div>

          {/* Section 2: Why do this Pooja */}
          <div
            style={{
              marginTop: 20,
              backgroundColor: "#FFFFFF",
              border: `1.5px solid ${GOLD_LIGHT}`,
              borderRadius: 12,
              padding: "18px 24px"
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: GOLD, marginBottom: 8 }}>
              ೨. {pick({ kn: "ಪೂಜೆ ಸಲ್ಲಿಸುವ ಮುಖ್ಯ ಉದ್ದೇಶ ಹಾಗೂ ಪ್ರಭಾವ", hi: "२. पूजा का मुख्य उद्देश्य एवं ग्रह शांति प्रभाव", te: "౨. పూజ సమర్పించు ముఖ్య ఉద్దేశం మరియు ప్రభావం", ta: "2. பூஜை செய்வதன் முக்கிய நோக்கம் மற்றும் தாக்கம்", en: "2. Purpose of the Seva & Planetary Protection" }, lang)}
            </div>
            <div style={{ fontSize: 14, color: INK, lineHeight: 1.85, textAlign: "justify" }}>
              {yPooja}
            </div>
          </div>

          {/* Section 3: Divine Benefits & Blessings */}
          <div
            style={{
              marginTop: 20,
              backgroundColor: PANEL,
              border: `1.5px solid ${GOLD}`,
              borderRadius: 12,
              padding: "18px 24px"
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: "#047857", marginBottom: 8 }}>
              ೩. {pick({ kn: "ದೈವಿಕ ಅನುಗ್ರಹ ಹಾಗೂ ಲಭಿಸುವ ಸಕಲ ಫಲಶ್ರುತಿಗಳು", hi: "३. दैवीय अनुग्रह एवं प्राप्य फलश्रुति", te: "౩. దైవిక అనుగ్రహం మరియు లభించు సకల ఫలశ్రుతి", ta: "3. தெய்வீக அருள் மற்றும் கிடைக்கும் பலன்கள்", en: "3. Divine Blessings & Long-Term Spiritual Benefits" }, lang)}
            </div>
            <div style={{ fontSize: 14, color: INK, lineHeight: 1.85, textAlign: "justify" }}>
              {bPooja}
            </div>
          </div>
        </div>

        {/* Section 4: Chief Archaka Official Seal Badge */}
        <div
          style={{
            marginTop: 24,
            border: `2px solid ${GOLD}`,
            borderRadius: 14,
            backgroundColor: "#FFFFFF",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20
          }}
        >
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 2 }}>
              {pick(SEAL_HEADER_DICT, lang)}
            </div>
            <div style={{ fontSize: 15, color: INK, fontWeight: 800 }}>
              {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"} — {pick({ kn: "ಪ್ರಧಾನ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ", hi: "प्रधान अर्चक, गोकर्ण क्षेत्र", te: "ప్రధాన అర్చకులు, గోకర్ణ క్షేత్రం", ta: "பிரதான அர்ச்சகர், கோகர்ண க்ஷேத்திரம்", en: "Pradhana Archaka, Gokarna Kshetra" }, lang)}
            </div>
            <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 4, lineHeight: 1.6 }}>
              {pick(SEAL_DESC_DICT, lang)}
            </div>
          </div>

          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              border: `2px double ${GOLD}`,
              backgroundColor: PANEL,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 12px rgba(180, 140, 60, 0.25)`
            }}
          >
            <div style={{ fontSize: 20, color: GOLD }}>🕉️</div>
            <div style={{ fontSize: 8.5, fontWeight: 800, color: INK, textTransform: "uppercase", marginTop: 2, textAlign: "center" }}>
              GOKARNA
            </div>
            <div style={{ fontSize: 7, color: GOLD, textTransform: "uppercase" }}>
              CHIEF ARCHAKA
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: 11, color: INK_SOFT, marginTop: 10 }}>
          {pick(LETTER_L5.signature!, lang)} · 5 / 5
        </div>
      </div>
    </div>
  );
};
