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
    <div style={{ flex: 1, height: 1, backgroundColor: GOLD_LIGHT }} />
    <div style={{ color: GOLD, fontSize: 13, letterSpacing: 4 }}>❖</div>
    <div style={{ flex: 1, height: 1, backgroundColor: GOLD_LIGHT }} />
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
};

export const SevaLetterPrint = ({
  lang,
  identity,
  primarySeva,
  sevaDate,
  rhythm
}: LetterPrintProps): JSX.Element => {
  const paragraph: React.CSSProperties = {
    fontSize: 14,
    lineHeight: 2,
    color: INK,
    marginTop: 14,
    textAlign: "justify"
  };

  return (
    <div className="pdf-page" style={pageStyle}>
      {/* Decorative frame */}
      <div
        style={{
          border: `3px double ${GOLD}`,
          borderRadius: 16,
          padding: "34px 38px",
          minHeight: PAGE_H - 76,
          boxSizing: "border-box",
          backgroundColor: PAPER
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26, color: GOLD, letterSpacing: 2 }} lang="sa">
            ॐ
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 11,
              letterSpacing: 5,
              color: GOLD,
              textTransform: "uppercase"
            }}
          >
            {pick(T.preparedBy!, lang)}
          </div>
          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 700 }}>
            {pick(T.letterTitle!, lang)}
          </div>
        </div>

        <OrnamentRule />

        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>
          {pick(LETTER_L5.salutation!, lang)} {identity.personName},
        </div>

        <p style={paragraph}>{pick(LETTER_L5.opening!, lang)}</p>

        {/* Seva record */}
        <div
          style={{
            marginTop: 18,
            border: `1.5px solid ${GOLD_LIGHT}`,
            borderRadius: 12,
            backgroundColor: PANEL,
            padding: "16px 20px"
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
                gap: 12,
                padding: "5px 0",
                borderBottom: `1px solid ${GOLD_LIGHT}44`
              }}
            >
              <div style={{ width: 190, fontSize: 11, color: INK_SOFT, textTransform: "uppercase", letterSpacing: 1 }}>
                {label}
              </div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        <p style={paragraph}>{pick(LETTER_L5.calendarNote!, lang)}</p>
        <p style={paragraph}>{pick(LETTER_L5.howToRead!, lang)}</p>

        {primarySeva && (
          <div
            style={{
              marginTop: 18,
              borderLeft: `4px solid ${GOLD}`,
              paddingLeft: 16,
              fontSize: 13,
              lineHeight: 1.9,
              color: INK
            }}
          >
            {pick(primarySeva.seva.benefit, lang)}
          </div>
        )}

        <OrnamentRule />

        <div
          style={{
            textAlign: "center",
            backgroundColor: PANEL,
            border: `1px solid ${GOLD_LIGHT}`,
            borderRadius: 12,
            padding: "16px 20px"
          }}
        >
          <div
            lang="sa"
            style={{ fontSize: 15, lineHeight: 1.9, whiteSpace: "pre-line", color: INK }}
          >
            {(primarySeva?.seva.shloka ?? SHLOKA_SHIVA).sanskrit}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: INK_SOFT, lineHeight: 1.7 }}>
            {pick((primarySeva?.seva.shloka ?? SHLOKA_SHIVA).meaning, lang)}
          </div>
        </div>

        <p style={{ ...paragraph, textAlign: "center", fontWeight: 600, marginTop: 20 }}>
          {pick(LETTER_L5.closing!, lang)}
        </p>

        <div style={{ marginTop: 26, textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>
            {pick(LETTER_L5.signature!, lang)}
          </div>
          <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 3 }}>
            {rhythm.startYmd} — {rhythm.endYmd}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Sheet 4 — the prasada card that travels inside the packet
 * ------------------------------------------------------------------ */

export type PrasadaCardPrintProps = {
  lang: string;
  identity: Identity;
  rhythm: RhythmResult;
  today: RhythmDay;
  bestDays: RhythmDay[];
  moneyDays: RhythmDay[];
};

export const SevaPrasadaCardPrint = ({
  lang,
  identity,
  rhythm,
  today,
  bestDays,
  moneyDays
}: PrasadaCardPrintProps): JSX.Element => {
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
            {rhythm.personalNumbers.join(" · ")}
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
                backgroundColor: COLOUR_HEX[rhythm.personalColour],
                border: `1px solid ${GOLD_LIGHT}`,
                display: "inline-block"
              }}
            />
            <span style={{ fontSize: 17, fontWeight: 600, color: INK }}>
              {pick(COLOUR_L5[rhythm.personalColour], lang)}
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
            {pick(DIRECTION_L5[rhythm.personalDirection], lang)}
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
          {formatLongDate(today, lang)} · {tithiLabel(today, lang)}
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
        {pick(LETTER_L5.signature!, lang)}
      </div>
    </div>
  );
};
