import { RASHI_L5, NAKSHATRA_L5, GRAHA_L5, pick } from "../../features/premiumPdf/premiumPdfLocale";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { KundliOutput, PlanetName, PlanetPosition } from "../../core/AstroTypes";
import { RASHIS } from "../../core/AstroTypes";
import { formatChartHouseNumber, formatPatrikaNavamsaOnly } from "../../core/localeNumbers";
import southIndianFrameSvg from "../../assets/south-indian-kundli-frame.svg?raw";
import {
  CHART_LAYOUT,
  cellOrigin,
  centerRect,
  chartViewSize,
  getCellForRashiIndex,
  houseForSign
} from "./southIndianLayout";

type Props = {
  kundli: KundliOutput;
  personName?: string;
  gothra?: string;
  lang?: string;
};

const rashiTKey = (sanskrit: string): string => `rashis.${sanskrit.replace(/\s+/g, "")}`;

const nakSanTKey = (sanskrit: string): string => `nakshatras.${sanskrit.replace(/\s+/g, "")}`;

const southFrameInnerMarkup = (): string => {
  const m = southIndianFrameSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  return m?.[1]?.trim() ?? "";
};

function getSpecialCellBadge(
  isLagna: boolean,
  isMoon: boolean,
  lang?: string
): { badge: string; color: string } | null {
  const l = (lang || "kn").toLowerCase();
  if (isLagna && isMoon) {
    let badge = "✦ Lagna • Rashi (Moon) ✦";
    if (l.startsWith("kn")) badge = "✦ ಲಗ್ನ • ರಾಶಿ (ಚಂ) ✦";
    else if (l.startsWith("hi")) badge = "✦ लग्न • राशि (चं) ✦";
    else if (l.startsWith("te")) badge = "✦ లగ్నం • రాశి (చం) ✦";
    else if (l.startsWith("ta")) badge = "✦ லக்னம் • ராசி (சந்) ✦";
    return { badge, color: "#b45309" };
  }
  if (isLagna) {
    let badge = "✦ Lagna (ASC) ✦";
    if (l.startsWith("kn")) badge = "✦ ಲಗ್ನ (ASC) ✦";
    else if (l.startsWith("hi")) badge = "✦ लग्न (ASC) ✦";
    else if (l.startsWith("te")) badge = "✦ లగ్నం (ASC) ✦";
    else if (l.startsWith("ta")) badge = "✦ லக்னம் (ASC) ✦";
    return { badge, color: "#b45309" };
  }
  if (isMoon) {
    let badge = "☽ Rashi (Moon) ☽";
    if (l.startsWith("kn")) badge = "☽ ರಾಶಿ (ಚಂ) ☽";
    else if (l.startsWith("hi")) badge = "☽ राशि (चं) ☽";
    else if (l.startsWith("te")) badge = "☽ రాశి (చం) ☽";
    else if (l.startsWith("ta")) badge = "☽ ராசி (சந்) ☽";
    return { badge, color: "#1d4ed8" };
  }
  return null;
}

export default function SouthIndianChart({ kundli, personName, gothra, lang: propLang }: Props): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = (propLang || i18n?.language || "kn").toLowerCase();
  const size = chartViewSize();
  const { cell: cw, margin: m } = CHART_LAYOUT;
  const cr = centerRect();
  const moon = kundli.planets.find((p) => p.name === "Moon" as PlanetName);

  const byRashi = useMemo(() => {
    const map = new Map<number, PlanetPosition[]>();
    for (const p of kundli.planets) {
      const arr = map.get(p.rashi.index) ?? [];
      arr.push(p);
      map.set(p.rashi.index, arr);
    }
    return map;
  }, [kundli.planets]);

  const lagnaIdx = kundli.lagnaRashi.index;
  const moonRashiIdx = kundli.moonSign.index;

  const frameInner = useMemo(() => southFrameInnerMarkup(), []);

  return (
    <svg
      data-testid="south-chart"
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto max-h-[min(90vw,420px)] w-full max-w-[420px] bg-[#fffdf8] border border-amber-500/20 shadow-md rounded-xl"
      role="img"
      aria-label={t("kundli.southChartAria")}
      style={{ colorScheme: "light", background: "#fffdf8" }}
    >
      <defs>
        <style>{`
          @keyframes lagnaGlow {
            0%, 100% { fill: #FEF3C7; }
            50% { fill: #FDE68A; }
          }
          @keyframes chandraGlow {
            0%, 100% { fill: #EFF6FF; }
            50% { fill: #DBEAFE; }
          }
          .cell-lagna {
            animation: lagnaGlow 3s ease-in-out infinite;
          }
          .cell-chandra {
            animation: chandraGlow 3s ease-in-out infinite;
          }
          .cell-dual {
            animation: lagnaGlow 2.5s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Static frame: single SVG asset (inlined for PNG/PDF export) */}
      <g data-testid="south-chart-frame" dangerouslySetInnerHTML={{ __html: frameInner }} />

      {RASHIS.map((rashi) => {
        const cell = getCellForRashiIndex(rashi.index);
        const { x, y } = cellOrigin(cell);
        const isLagna = rashi.index === lagnaIdx;
        const isMoon = rashi.index === moonRashiIdx;
        const isDual = isLagna && isMoon;
        const house = houseForSign(lagnaIdx, rashi.index);
        const specialBadge = getSpecialCellBadge(isLagna, isMoon, lang);

        let cellFill = "#ffffff";
        let cellStroke = "none";
        let cellStrokeWidth = 0;
        let animClass = "";

        if (isDual) {
          cellFill = "#FEF3C7";
          cellStroke = "#D97706";
          cellStrokeWidth = 1.5;
          animClass = "cell-dual";
        } else if (isLagna) {
          cellFill = "#FEF3C7";
          cellStroke = "#D97706";
          cellStrokeWidth = 1.5;
          animClass = "cell-lagna";
        } else if (isMoon) {
          cellFill = "#EFF6FF";
          cellStroke = "#2563EB";
          cellStrokeWidth = 1.5;
          animClass = "cell-chandra";
        }

        return (
          <g key={rashi.index} data-rashi={rashi.index}>
            <rect
              data-house={house}
              x={x + 2}
              y={y + 2}
              width={cw - 4}
              height={cw - 4}
              fill={cellFill}
              stroke={cellStroke}
              strokeWidth={cellStrokeWidth}
              className={animClass}
            />
            <text x={x + 6} y={y + 14} fontSize="9" fill="#7f1d1d" fontWeight="600">
              {pick(RASHI_L5[rashi.index], lang)}
            </text>
            {specialBadge && (
              <text
                x={x + cw - 6}
                y={y + 14}
                fontSize="7.5"
                fill={specialBadge.color}
                fontWeight="700"
                textAnchor="end"
              >
                {specialBadge.badge}
              </text>
            )}
            <text x={x + cw - 6} y={y + cw - 8} fontSize="8" fill="#64748b" textAnchor="end">
              {lang.startsWith("kn") ? `${house}ನೇ ಭಾವ` : lang.startsWith("hi") ? `${house}वां भाव` : lang.startsWith("te") ? `${house}వ భావం` : lang.startsWith("ta") ? `${house}-ஆம் பாவம்` : `H${house}`}
            </text>
          </g>
        );
      })}

      <rect
        x={cr.x + 1}
        y={cr.y + 1}
        width={cr.width - 2}
        height={cr.height - 2}
        fill="#fdfaf2"
        stroke="none"
      />
      <foreignObject x={cr.x + 6} y={cr.y + 6} width={cr.width - 12} height={cr.height - 12}>
        <div className="flex h-full flex-col justify-center text-center text-[10px] leading-snug text-indigo-950">
          <p className="font-bold">{personName || "—"}</p>
          <p className="mt-1">
            <span className="font-semibold">{lang === "kn" ? "ರಾಶಿ" : lang === "hi" ? "राशि" : lang === "te" ? "రాశి" : lang === "ta" ? "ராசி" : "Rashi"}:</span> {pick(RASHI_L5[kundli.moonSign.index], lang)}
          </p>
          <p>
            <span className="font-semibold">{lang === "kn" ? "ನಕ್ಷತ್ರ" : lang === "hi" ? "नक्षत्र" : lang === "te" ? "నక్షత్రం" : lang === "ta" ? "நட்சத்திரம்" : "Nakshatra"}:</span>{" "}
            {moon ? pick(NAKSHATRA_L5[moon.nakshatra.index], lang) : "—"}
            <span className="text-slate-600">
              {" "}
              · {lang === "kn" ? "ಪಾದ" : lang === "hi" ? "पाद" : lang === "te" ? "పాదం" : lang === "ta" ? "பாதம்" : "Pada"} {kundli.moonPada}
            </span>
          </p>
          {gothra ? (
            <p>
              <span className="font-semibold">{t("kundli.centerGothra")}:</span> {gothra}
            </p>
          ) : null}
          <p className="mt-1 text-[9px] text-slate-600">
            <span className="font-semibold">{lang === "kn" ? "ಲಗ್ನ" : lang === "hi" ? "लग्न" : lang === "te" ? "లగ్నం" : lang === "ta" ? "லக்னம்" : "Lagna"}:</span> {pick(RASHI_L5[kundli.lagnaRashi.index], lang)}{" "}
            {formatPatrikaNavamsaOnly(kundli.ascendant, lang)}
          </p>
          {kundli.maandi ? (
            <p className="text-[9px] text-red-800 font-semibold">
              <span className="font-bold">{lang === "kn" ? "ಮಾಂದಿ" : lang === "hi" ? "मांदि" : lang === "te" ? "మాంది" : lang === "ta" ? "மாந்தி" : "Maandi"}:</span> {pick(RASHI_L5[kundli.maandi.rashi.index], lang)}{" "}
              {formatPatrikaNavamsaOnly(kundli.maandi.degree, lang)}
              <span className="block text-[8px] font-normal text-slate-600">({kundli.maandi.windowLabel})</span>
            </p>
          ) : null}
        </div>
      </foreignObject>

      {RASHIS.map((rashi) => {
        const planetsHere = byRashi.get(rashi.index) ?? [];
        const cell = getCellForRashiIndex(rashi.index);
        const { x, y } = cellOrigin(cell);
        // lang already resolved above

        interface CellItem {
          text: string;
          retroBadge?: string;
          degreeText?: string;
          isLagna?: boolean;
          isMaandi?: boolean;
          isRetrograde?: boolean;
        }

        const items: CellItem[] = [];
        if (rashi.index === lagnaIdx) {
          const lagnaPrefix = lang.startsWith("kn") ? "ಲಗ್ನ" : lang.startsWith("hi") ? "लग्न" : lang.startsWith("te") ? "లగ్నం" : lang.startsWith("ta") ? "லக்னம்" : "Asc";
          items.push({
            text: `${lagnaPrefix} ${formatPatrikaNavamsaOnly(kundli.ascendant, lang)}`,
            isLagna: true
          });
        }
        for (const pl of planetsHere) {
          const pName = pick(GRAHA_L5[pl.name as keyof typeof GRAHA_L5], lang) || String(pl.name);
          const deg = formatPatrikaNavamsaOnly(pl.degree, lang);
          if (pl.isRetrograde) {
            const rBadge = lang.startsWith("kn") ? "(ವ)" : lang.startsWith("hi") ? "(व)" : lang.startsWith("te") ? "(వ)" : lang.startsWith("ta") ? "(வ)" : "(R)";
            items.push({
              text: `${pName} `,
              retroBadge: rBadge,
              degreeText: deg,
              isRetrograde: true
            });
          } else {
            items.push({
              text: `${pName} ${deg}`
            });
          }
        }
        if (kundli.maandi && kundli.maandi.rashi.index === rashi.index) {
          items.push({
            text: `${lang.startsWith("kn") ? "ಮಾಂದಿ" : lang.startsWith("hi") ? "मांदि" : lang.startsWith("te") ? "మాంది" : lang.startsWith("ta") ? "மாந்தி" : "Maa"} ${formatPatrikaNavamsaOnly(kundli.maandi.degree, lang)}`,
            isMaandi: true
          });
        }
        if (!items.length) return null;

        const count = items.length;

        // When 4 or more items are in a single house, use a balanced 2-column layout to prevent vertical crowding and overlap
        if (count >= 4) {
          const mid = Math.ceil(count / 2);
          const leftCol = items.slice(0, mid);
          const rightCol = items.slice(mid);

          const fontSize = count >= 6 ? 6.8 : 7.4;
          const dy = count >= 6 ? 9.5 : 11;
          const startY = count >= 6 ? 26 : 28;

          return (
            <g key={`p-${rashi.index}`} data-testid={`south-house-${rashi.index}`}>
              <text
                x={x + cw * 0.28}
                y={y + startY}
                fontSize={fontSize}
                textAnchor="middle"
                fontWeight="600"
              >
                {leftCol.map((item, i) => (
                  <tspan
                    key={`l-${i}`}
                    x={x + cw * 0.28}
                    dy={i === 0 ? 0 : dy}
                    fill={item.isMaandi ? "#b91c1c" : item.isLagna ? "#b45309" : "#1e1b4b"}
                    fontWeight={item.isMaandi || item.isLagna ? "700" : "600"}
                  >
                    {item.text}
                    {item.isRetrograde && (
                      <tspan fill="#dc2626" fontWeight="800">
                        {item.retroBadge}{" "}
                      </tspan>
                    )}
                    {item.degreeText ? item.degreeText : ""}
                  </tspan>
                ))}
              </text>
              <text
                x={x + cw * 0.72}
                y={y + startY}
                fontSize={fontSize}
                textAnchor="middle"
                fontWeight="600"
              >
                {rightCol.map((item, i) => (
                  <tspan
                    key={`r-${i}`}
                    x={x + cw * 0.72}
                    dy={i === 0 ? 0 : dy}
                    fill={item.isMaandi ? "#b91c1c" : item.isLagna ? "#b45309" : "#1e1b4b"}
                    fontWeight={item.isMaandi || item.isLagna ? "700" : "600"}
                  >
                    {item.text}
                    {item.isRetrograde && (
                      <tspan fill="#dc2626" fontWeight="800">
                        {item.retroBadge}{" "}
                      </tspan>
                    )}
                    {item.degreeText ? item.degreeText : ""}
                  </tspan>
                ))}
              </text>
            </g>
          );
        }

        // 1 to 3 items: Single centered column with comfortable spacing
        let fontSize = 9.5;
        let dy = 12;
        let startY = 40;

        if (count === 2) {
          fontSize = 9.0;
          dy = 12.5;
          startY = 33;
        } else if (count === 3) {
          fontSize = 8.2;
          dy = 11;
          startY = 27;
        }

        return (
          <text
            key={`p-${rashi.index}`}
            data-testid={`south-house-${rashi.index}`}
            x={x + cw / 2}
            y={y + startY}
            fontSize={fontSize}
            textAnchor="middle"
            fontWeight="600"
          >
            {items.map((item, i) => (
              <tspan
                key={i}
                x={x + cw / 2}
                dy={i === 0 ? 0 : dy}
                fill={item.isMaandi ? "#b91c1c" : item.isLagna ? "#b45309" : "#1e1b4b"}
                fontWeight={item.isMaandi || item.isLagna ? "700" : "600"}
              >
                {item.text}
                {item.isRetrograde && (
                  <tspan fill="#dc2626" fontWeight="800">
                    {item.retroBadge}{" "}
                  </tspan>
                )}
                {item.degreeText ? item.degreeText : ""}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}
