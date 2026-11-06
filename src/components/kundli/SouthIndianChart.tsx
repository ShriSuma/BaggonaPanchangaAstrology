import { RASHI_L5, NAKSHATRA_L5, GRAHA_L5, pick } from "../../features/premiumPdf/premiumPdfLocale";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { KundliOutput, PlanetName, PlanetPosition } from "../../core/AstroTypes";
import { RASHIS } from "../../core/AstroTypes";
import { formatChartHouseNumber, patrikaNavamshaFromDegree } from "../../core/localeNumbers";
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

const southFrameInnerMarkup = (): string => {
  const m = southIndianFrameSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  return m?.[1]?.trim() ?? "";
};

export default function SouthIndianChart({ kundli, personName, gothra, lang: propLang }: Props): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = (propLang || i18n?.language || "kn").toLowerCase();
  const size = chartViewSize();
  const { cell: cw, margin: m } = CHART_LAYOUT;
  const cr = centerRect();
  const moon = kundli.planets.find((p) => p.name === ("Moon" as PlanetName));

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

  // Pure locale labels for center box
  const labelGotra = lang.startsWith("kn") ? "ಗೋತ್ರ" : lang.startsWith("hi") ? "गोत्र" : lang.startsWith("te") ? "గోత్రం" : lang.startsWith("ta") ? "கோத்திரம்" : "Gotra";
  const labelRashi = lang.startsWith("kn") ? "ರಾಶಿ" : lang.startsWith("hi") ? "राशि" : lang.startsWith("te") ? "రాశి" : lang.startsWith("ta") ? "ராசி" : "Rashi";
  const labelNakshatra = lang.startsWith("kn") ? "ನಕ್ಷತ್ರ" : lang.startsWith("hi") ? "नक्षत्र" : lang.startsWith("te") ? "నక్షత్రం" : lang.startsWith("ta") ? "நட்சத்திரம்" : "Nakshatra";
  const labelPada = lang.startsWith("kn") ? "ಪಾದ" : lang.startsWith("hi") ? "पाद" : lang.startsWith("te") ? "పాదం" : lang.startsWith("ta") ? "பாதம்" : "Pada";
  const labelLagna = lang.startsWith("kn") ? "ಲಗ್ನ" : lang.startsWith("hi") ? "लग्न" : lang.startsWith("te") ? "లగ్నం" : lang.startsWith("ta") ? "லக்னம்" : "Lagna";
  const labelMaandi = lang.startsWith("kn") ? "ಮಾಂದಿ" : lang.startsWith("hi") ? "मांदि" : lang.startsWith("te") ? "మాంది" : lang.startsWith("ta") ? "மாந்தி" : "Maandi";
  const defaultDevoteeLabel = lang.startsWith("kn") ? "ಜಾತಕರು" : lang.startsWith("hi") ? "जातक" : lang.startsWith("te") ? "జాతకుడు" : lang.startsWith("ta") ? "ஜாதகர்" : "Devotee";

  return (
    <svg
      data-testid="south-chart"
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto max-h-[min(90vw,420px)] w-full max-w-[420px] bg-[#fffdf8] border border-amber-500/20 shadow-md rounded-xl"
      role="img"
      aria-label={t("kundli.southChartAria", "Sacred South Indian Natal Chart")}
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

      {/* 12 Rashi Cells: Pure Background Tint and Sign Title */}
      {RASHIS.map((rashi) => {
        const cell = getCellForRashiIndex(rashi.index);
        const { x, y } = cellOrigin(cell);
        const isLagna = rashi.index === lagnaIdx;
        const isMoon = rashi.index === moonRashiIdx;
        const isDual = isLagna && isMoon;
        const house = houseForSign(lagnaIdx, rashi.index);

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
            {/* Top-Left: Pure Rashi Name in native locale (100% parity with Janana Kundali) */}
            <text x={x + 6} y={y + 14} fontSize="9" fill="#7f1d1d" fontWeight="700">
              {pick(RASHI_L5[rashi.index], lang)}
            </text>
          </g>
        );
      })}

      {/* Center 2x2 Merged Box: Authentic Sacred Devotee Details */}
      <rect
        x={cr.x + 1}
        y={cr.y + 1}
        width={cr.width - 2}
        height={cr.height - 2}
        fill="#fdfaf2"
        stroke="#d97706"
        strokeWidth="1"
        rx="4"
      />
      <foreignObject x={cr.x + 5} y={cr.y + 5} width={cr.width - 10} height={cr.height - 10}>
        <div className="flex h-full flex-col justify-center px-1 text-[9.5px] leading-tight text-indigo-950 font-serif">
          {/* Devotee Name Heading */}
          <div className="text-center font-black text-amber-950 text-[11px] pb-1 border-b border-amber-800/30 mb-1 truncate">
            {personName || defaultDevoteeLabel}
          </div>
          {/* Exact Panchanga Kundli Details Matrix */}
          <div className="space-y-0.5">
            <div className="flex justify-between border-b border-amber-900/10 pb-0.5">
              <span className="font-bold text-amber-900/80">{labelGotra}:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[85px]">{gothra && gothra !== "—" ? gothra : "—"}</span>
            </div>
            <div className="flex justify-between border-b border-amber-900/10 pb-0.5">
              <span className="font-bold text-amber-900/80">{labelRashi}:</span>
              <span className="font-semibold text-amber-950">{pick(RASHI_L5[kundli.moonSign.index], lang)}</span>
            </div>
            <div className="flex justify-between border-b border-amber-900/10 pb-0.5">
              <span className="font-bold text-amber-900/80">{labelNakshatra}:</span>
              <span className="font-semibold text-amber-950">
                {moon ? pick(NAKSHATRA_L5[moon.nakshatra.index], lang) : "—"} ({formatChartHouseNumber(kundli.moonPada || 1, lang)})
              </span>
            </div>
            <div className="flex justify-between border-b border-amber-900/10 pb-0.5">
              <span className="font-bold text-amber-900/80">{labelLagna}:</span>
              <span className="font-semibold text-amber-900">
                {pick(RASHI_L5[kundli.lagnaRashi.index], lang)} ({formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.ascendant), lang)})
              </span>
            </div>
            {kundli.maandi ? (
              <div className="flex justify-between pt-0.5 text-red-900">
                <span className="font-bold text-red-800">{labelMaandi}:</span>
                <span className="font-semibold">
                  {pick(RASHI_L5[kundli.maandi.rashi.index], lang)} ({formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.maandi.degree), lang)})
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </foreignObject>

      {/* Planetary Placements inside 12 Rashi Cells: Identical Parity with Janana Kundali */}
      {RASHIS.map((rashi) => {
        const planetsHere = byRashi.get(rashi.index) ?? [];
        const cell = getCellForRashiIndex(rashi.index);
        const { x, y } = cellOrigin(cell);

        interface CellItem {
          text: string;
          retroBadge?: string;
          degreeText?: string;
          isLagna?: boolean;
          isMaandi?: boolean;
          isRetrograde?: boolean;
        }

        const items: CellItem[] = [];

        // 1. Lagna Placement
        if (rashi.index === lagnaIdx) {
          const lagnaPrefix = lang.startsWith("kn") ? "ಲಗ್ನ" : lang.startsWith("hi") ? "लग्न" : lang.startsWith("te") ? "లగ్నం" : lang.startsWith("ta") ? "லக்னம்" : "Lagna";
          const deg = formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.ascendant), lang);
          items.push({
            text: `${lagnaPrefix} (${deg})`,
            isLagna: true
          });
        }

        // 2. Graha Placements
        for (const pl of planetsHere) {
          const pName = pick(GRAHA_L5[pl.name as keyof typeof GRAHA_L5], lang) || String(pl.name);
          const deg = formatChartHouseNumber(patrikaNavamshaFromDegree(pl.degree), lang);
          if (pl.isRetrograde) {
            const rBadge = lang.startsWith("kn") ? "(ವ)" : lang.startsWith("hi") ? "(व)" : lang.startsWith("te") ? "(వ)" : lang.startsWith("ta") ? "(வ)" : "(R)";
            items.push({
              text: `${pName} `,
              retroBadge: rBadge,
              degreeText: `(${deg})`,
              isRetrograde: true
            });
          } else {
            items.push({
              text: `${pName} (${deg})`
            });
          }
        }

        // 3. Maandi (Gulika) Placement
        if (kundli.maandi && kundli.maandi.rashi.index === rashi.index) {
          const maandiPrefix = lang.startsWith("kn") ? "ಮಾಂದಿ" : lang.startsWith("hi") ? "मांदि" : lang.startsWith("te") ? "మాంది" : lang.startsWith("ta") ? "மாந்தி" : "Maandi";
          const deg = formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.maandi.degree), lang);
          items.push({
            text: `${maandiPrefix} (${deg})`,
            isMaandi: true
          });
        }

        if (!items.length) return null;

        const count = items.length;

        // When 4 or more items are in a single house, use balanced 2-column layout to prevent vertical crowding
        if (count >= 4) {
          const mid = Math.ceil(count / 2);
          const leftCol = items.slice(0, mid);
          const rightCol = items.slice(mid);

          const fontSize = count >= 6 ? 6.8 : 7.6;
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
        let fontSize = 9.8;
        let dy = 13;
        let startY = 42;

        if (count === 2) {
          fontSize = 9.2;
          dy = 13;
          startY = 35;
        } else if (count === 3) {
          fontSize = 8.5;
          dy = 11.5;
          startY = 29;
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
