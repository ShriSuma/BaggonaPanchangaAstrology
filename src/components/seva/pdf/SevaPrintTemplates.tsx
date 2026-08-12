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
  pick
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
          <div style={{ marginTop: 6, fontSize: 25, fontWeight: 700, letterSpacing: "normal", lineHeight: 1.3, color: INK }}>
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
              <div style={{ width: 210, fontSize: 11.5, color: INK_SOFT, textTransform: "uppercase", letterSpacing: "normal", lineHeight: 1.4 }}>
                {label}
              </div>
              <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: INK, lineHeight: 1.4, letterSpacing: "normal" }}>
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
          <div style={{ textAlign: "left", fontSize: 10, color: INK_SOFT, lineHeight: 1.4 }}>
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
  const isKn = lang === "kn";
  const baseLang = (lang || "en").split("-")[0];

  const titleText = isKn
    ? "✦ ಧಾರ್ಮಿಕ ಅನುಷ್ಠಾನ ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ವಾರ್ಷಿಕ ಅನುಗ್ರಹ ಪತ್ರಿಕೆ ✦"
    : baseLang === "hi"
      ? "✦ धार्मिक अनुष्ठान मार्गदर्शन एवं वार्षिक अनुग्रह पत्र ✦"
      : baseLang === "te"
        ? "✦ ధార్మిక అనుష్ఠాన మార్గదర్శనం మరియు వార్షిక అనుగ్రహ పత్రం ✦"
        : baseLang === "ta"
          ? "✦ ஆன்மீக அனுஷ்டான வழிகாட்டல் மற்றும் வருடாந்திர அனுக்ரஹ அட்டை ✦"
          : "✦ Devotee's Sacred Spiritual Rules & Yearly Anugraha Guidance Sheet ✦";

  const subtitleText = isKn
    ? "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸನ್ನಿಧಿಯಿಂದ ಅರ್ಚಕರು ಸೂಚಿಸಿದ ನಿತ್ಯ ನಿಯಮಗಳು ಹಾಗೂ ವಿಶೇಷ ಪೂಜಾ ಮಾರ್ಗದರ್ಶಿ"
    : baseLang === "hi"
      ? "गोकर्ण श्री महाबलेश्वर स्वामी के पावन सान्निध्य से अर्चक द्वारा निर्दिष्ट नित्य नियम एवं विशेष पूजा मार्गदर्शिका"
      : baseLang === "te"
        ? "గోకర్ణ శ్రీ మహాబలేశ్వర స్వామివారి దివ్య సన్నిధి నుండి అర్చకులు సూచించిన నిత్య నియమాలు మరియు విశేష పూజా మార్గదర్శి"
        : baseLang === "ta"
          ? "கோகர்ண ஸ்ரீ மகாபலேஸ்வர சுவாமியின் திவ்ய சன்னதியிலிருந்து அர்ச்சகர் கூறிய நித்ய விதிகளும் விசேஷ பூஜை வழிகாட்டியும்"
          : "Sacred daily spiritual commandments and auspicious worship guide recommended by Archaka from Gokarna Kshetra";

  const rulesList = isKn ? [
    { title: "☀️ ಸೂರ್ಯೋದಯ ದೀಪಾರಾಧನೆ", desc: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸ್ನಾನಾನಂತರ ಮನೆಯ ದೇವರ ಮನೆಯಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ, ತೂರ್ಯಾಭಿಮುಖವಾಗಿ 108 ಬಾರಿ ಓಂ ನಮಃ ಶಿವಾಯ ಜಪಿಸುವುದು." },
    { title: "🥛 ಸೋಮವಾರ ಕ್ಷೀರಾಭಿಷೇಕ", desc: "ಪ್ರತಿ ಸೋಮವಾರ ಅಥವಾ ಪ್ರದೋಷ ತಿಥಿಯಂದು ಶಿವಲಿಂಗಕ್ಕೆ ಶುದ್ಧ ಹಾಲಿನ ಅಭಿಷೇಕ ಮಾಡಿಸುವುದರಿಂದ ಮನಃಶಾಂತಿ ಹಾಗೂ ಆರೋಗ್ಯ ಸ್ಥಿರತೆ ದೊರೆಯುತ್ತದೆ." },
    { title: "🌾 ಗೋಸೇವೆ ಹಾಗೂ ಅನ್ನದಾನ", desc: "ಪ್ರತಿ ಶನಿವಾರ ಅಥವಾ ಏಕಾದಶಿಯ ದಿನದಂದು ಗೋವುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು ನೀಡುವುದು ಮತ್ತು ಅನ್ನದಾನ ಮಾಡುವುದರಿಂದ ಪಿತೃ ದೋಷ ಹಾಗೂ ಕುಜ ದೋಷ ಶಾಂತಿಯಾಗುತ್ತದೆ." },
    { title: "📿 ಜನ್ಮ ನಕ್ಷತ್ರ ಮಂತ್ರ ಸಂಕಲ್ಪ", desc: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಅಧಿಪತಿ ಗ್ರಹದ ಬೀಜಮಂತ್ರವನ್ನು ಪ್ರತಿದಿನ 108 ಬಾರಿ ನಿಷ್ಠೆಯಿಂದ ಜಪಿಸುವುದು ಸಕಲ ಕಾರ್ಯ ಜಯಕ್ಕೆ ಕಾರಣವಾಗುತ್ತದೆ." }
  ] : [
    { title: "☀️ Sunrise Lamp & Chanting", desc: "Every morning after bath, light a pure ghee lamp facing East and chant 108 times 'Om Namah Shivaya'." },
    { title: "🥛 Monday Milk Archana", desc: "Offering milk abhishekam to Lord Shiva on Mondays or Pradosha tithi grants deep emotional peace and health resilience." },
    { title: "🌾 Cow Service & Charity", desc: "Feeding green grass to cows on Saturdays or Ekadashi neutralizes Pitru (ancestral) and Kuja doshas." },
    { title: "📿 Nakshatra Mantra Discipline", desc: "Chanting the beeja mantra of your birth star lord 108 times daily ensures victory in all legitimate endeavors." }
  ];

  const tithiGuide = isKn ? [
    { name: "ಪ್ರದೋಷ ಶಿವಾರಾತ್ರಿ", desc: "ಮಾನಸಿಕ ಒತ್ತಡ, ಸಾಲ ಬಾಧೆ ಹಾಗೂ ಅಡೆತಡೆಗಳ ನಿವಾರಣೆಗೆ ಶ್ರೇಷ್ಠ." },
    { name: "ಸಂಕಷ್ಟ ಚತುರ್ಥಿ", desc: "ವ್ಯಾಪಾರ, ಉದ್ಯೋಗ ಹಾಗೂ ಹೊಸ ಕಾರ್ಯಗಳ ಯಶಸ್ಸಿಗೆ ಗಣಪತಿ ಪೂಜೆ." },
    { name: "ಏಕಾದಶಿ ವ್ರತ", desc: "ಆರೋಗ್ಯ, ಆಯುಷ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿಗೆ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ." },
    { name: "ಹುಣ್ಣಿಮೆ / ಅಮಾವಾಸ್ಯೆ", desc: "ಪಿತೃ ತರ್ಪಣ, ಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಾಲಿಂಗ ದರ್ಶನ." }
  ] : [
    { name: "Pradosha Shivaratri", desc: "Dissolves mental burdens, financial hurdles, and chronic ailments." },
    { name: "Sankashti Chaturthi", desc: "Removes work, business obstacles, and unlocks prosperity." },
    { name: "Ekadashi Vrata", desc: "Enhances health, longevity, and family emotional cohesion." },
    { name: "Purnima / Amavasya", desc: "Pitra Tarpanam, Graha Shanti, and Mahabaleshwara blessings." }
  ];

  const kshetraRules = isKn ? [
    { title: "🌿 ಶಂಖ ತೀರ್ಥ ಸ್ನಾನ", desc: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರವೇಶದ ನಂತರ ಸನ್ನಿಧಿ ದರ್ಶನಕ್ಕೆ ಮುನ್ನ ಪವಿತ್ರ ಜಲದಲ್ಲಿ ಆಚಮನ ಅಥವಾ ಸ್ನಾನ ಮಾಡುವುದು ಶುದ್ಧಿಗೆ ಮುಖ್ಯ." },
    { title: "🕉️ ಆತ್ಮಾಲಿಂಗ ಸ್ಪರ್ಶ ಮರ್ಯಾದೆ", desc: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಾಲಿಂಗ ಸ್ಪರ್ಶ ಮಾಡುವಾಗ ಅತ್ಯಂತ ಭಕ್ತಿ, ಸ್ವಚ್ಛತೆ ಹಾಗೂ ಶಿವ ಸಂಕಲ್ಪದಿಂದ ಪೂಜಿಸಬೇಕು." },
    { title: "🌺 ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ರುದ್ರಾಭಿಷೇಕ", desc: "ತ್ರಿಪತ್ರ ಬಿಲ್ವಪತ್ರೆಯಿಂದ ಅಷ್ಟೋತ್ತರ ಪೂಜೆ ಮಾಡಿಸುವುದರಿಂದ ಸರ್ವ ಪಾಪ ನಿವಾರಣೆಯಾಗಿ ಸಂಸಾರ ಸಿದ್ಧಿ ಲಭಿಸುತ್ತದೆ." }
  ] : [
    { title: "🌿 Sacred Teertha Ablution", desc: "Perform reverent ablution at Gokarna teertha before worshipping the sacred Atmalinga for inner purification." },
    { title: "🕉️ Atmalinga Touch Reverence", desc: "Offer prayers at the holy feet of Shri Mahabaleshwara Atmalinga with utter devotion, clean mind, andGotra sankalpa." },
    { title: "🌺 Bilva & Rudrabhishekam", desc: "Offering fresh Bilva leaves during Rudrabhishekam dissolves karmic afflictions and grants domestic harmony." }
  ];

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
          position: "relative"
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, color: GOLD, letterSpacing: 2 }}>❖</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: INK, marginTop: 4, lineHeight: 1.5, letterSpacing: "normal" }}>
            {titleText}
          </div>
          <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 3, lineHeight: 1.5, maxWidth: 700, margin: "4px auto 0", letterSpacing: "normal" }}>
            {subtitleText}
          </div>
        </div>

        <OrnamentRule />

        {/* Section 1: Devotee Commandments */}
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 8, textTransform: "uppercase", letterSpacing: "normal", textAlign: "center" }}>
            {isKn ? "✦ ಅರ್ಚಕರು ಸೂಚಿಸಿದ ೪ ನಿತ್ಯ ಧಾರ್ಮಿಕ ನಿಯಮಗಳು ✦" : "✦ Archaka's 4 Sacred Daily Commandments ✦"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {rulesList.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  border: `1.5px solid ${GOLD_LIGHT}`,
                  borderRadius: 10,
                  backgroundColor: PANEL,
                  padding: "10px 14px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, marginBottom: 3, letterSpacing: "normal", lineHeight: 1.4 }}>
                  {rule.title}
                </div>
                <div style={{ fontSize: 10.5, color: INK_SOFT, lineHeight: 1.5, letterSpacing: "normal" }}>
                  {rule.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Monthly Tithi Guide */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 8, textTransform: "uppercase", letterSpacing: "normal", textAlign: "center" }}>
            {isKn ? "✦ ಮಾಸಿಕ ಪೂಜಾ ಹಾಗೂ ಸಂಕಲ್ಪ ದಿನಸೂಚಿ ಮಾರ್ಗದರ್ಶಿ ✦" : "✦ Monthly Auspicious Tithi Worship Guide ✦"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {tithiGuide.map((tg, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "9px 8px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: "normal", lineHeight: 1.4 }}>{tg.name}</div>
                <div style={{ fontSize: 9.5, color: INK_SOFT, marginTop: 3, lineHeight: 1.4, letterSpacing: "normal" }}>
                  {tg.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Gokarna Kshetra Darshana Rules */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 8, textTransform: "uppercase", letterSpacing: "normal", textAlign: "center" }}>
            {isKn ? "✦ ಗೋಕರ್ಣ ಆತ್ಮಾಲಿಂಗ ದರ್ಶನ ಹಾಗೂ ಯಾತ್ರಾ ನಿಯಮಗಳು ✦" : "✦ Gokarna Kshetra Pilgrimage & Darshana Guidelines ✦"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {kshetraRules.map((kr, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 10,
                  backgroundColor: PANEL,
                  padding: "10px 12px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, marginBottom: 3, letterSpacing: "normal", lineHeight: 1.4 }}>
                  {kr.title}
                </div>
                <div style={{ fontSize: 10, color: INK_SOFT, lineHeight: 1.5, letterSpacing: "normal" }}>
                  {kr.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Maha Mrityunjaya & Gotra Blessing Banner */}
        <div
          style={{
            marginTop: 14,
            backgroundColor: "#FFFFFF",
            border: `1.5px solid ${GOLD_LIGHT}`,
            borderRadius: 12,
            padding: "12px 18px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase" }}>
            ॐ ತ್ರಯ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ | ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ||
          </div>
          <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 4, lineHeight: 1.5 }}>
            {isKn
              ? "ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಣವು ನಿಮ್ಮ ಹಾಗೂ ನಿಮ್ಮ ಸಕಲ ಕೌಟುಂಬಿಕ ಸದಸ್ಯರ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ರಕ್ಷಣೆಗೆ ದಿವ್ಯ ಕವಚವಾಗಿದೆ."
              : "Reciting the Maha Mrityunjaya Mantra serves as a cosmic armor shielding your family with health, peace, and divine resilience."}
          </div>
        </div>

        {/* Section 5: Priest Direct Consultation Card */}
        <div
          style={{
            marginTop: 14,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 12,
            backgroundColor: PANEL,
            padding: "14px 20px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 3, letterSpacing: "normal" }}>
            ✦ {isKn ? "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರ ಅರ್ಚಕ ನೇರ ಸಂಪರ್ಕ ಹಾಗೂ ಪ್ರಸಾದ ಸೇವೆ" : "Gokarna Kshetra Archaka Direct Contact & Seva Assistance"} ✦
          </div>
          <div style={{ fontSize: 11.5, color: INK, fontWeight: 700, marginTop: 2, letterSpacing: "normal" }}>
            {safePanditName || "ಚೈತನ್ಯ ಪಂಡಿತ"} — {isKn ? "ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ" : "Chief Archaka, Gokarna Kshetra"}
          </div>
          <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 4, lineHeight: 1.5, maxWidth: 680, margin: "4px auto 0", letterSpacing: "normal" }}>
            {isKn
              ? "ವಿಶೇಷ ಗೋತ್ರ ಸಂಕಲ್ಪ ಸೇವೆ, ಮಹಾಪೂಜೆ, ನವಗ್ರಹ ದೋಷ ಶಾಂತಿ ಹಾಗೂ ಗೋಕರ್ಣ ಪ್ರಸಾದವನ್ನು ಮನೆಗೆ ತಲುಪಿಸಲು ಅರ್ಚಕರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಬಹುದು."
              : "For special Gotra Sankalpa Seva, Mahapooja, Navagraha Shanti, and home delivery of Mahabaleshwara Prasada, feel free to consult the Archaka directly."}
          </div>
        </div>

        {/* Page Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 36,
            right: 36,
            textAlign: "center",
            fontSize: 9.5,
            color: INK_SOFT
          }}
        >
          {pick(LETTER_L5.signature!, lang)} · 3 / 3
        </div>
      </div>
    </div>
  );
};
