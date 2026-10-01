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
  personName: string;
  gothra?: string;
};

const rashiTKey = (sanskrit: string): string => `rashis.${sanskrit.replace(/\s+/g, "")}`;

const nakSanTKey = (sanskrit: string): string => `nakshatras.${sanskrit.replace(/\s+/g, "")}`;

const southFrameInnerMarkup = (): string => {
  const m = southIndianFrameSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  return m?.[1]?.trim() ?? "";
};

export default function SouthIndianChart({ kundli, personName, gothra }: Props): JSX.Element {
  const { t, i18n } = useTranslation();
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
      {/* Static frame: single SVG asset (inlined for PNG/PDF export) */}
      <g data-testid="south-chart-frame" dangerouslySetInnerHTML={{ __html: frameInner }} />

      {RASHIS.map((rashi) => {
        const cell = getCellForRashiIndex(rashi.index);
        const { x, y } = cellOrigin(cell);
        const isLagna = rashi.index === lagnaIdx;
        const house = houseForSign(lagnaIdx, rashi.index);
        return (
          <g key={rashi.index} data-rashi={rashi.index}>
            <rect
              data-house={house}
              x={x + 2}
              y={y + 2}
              width={cw - 4}
              height={cw - 4}
              fill={isLagna ? "#fff8e1" : "#ffffff"}
              stroke="none"
            />
            <text x={x + 6} y={y + 14} fontSize="9" fill="#7f1d1d" fontWeight="600">
              {t(rashiTKey(rashi.sanskrit) as "rashis.Mesha")}
            </text>
            <text x={x + cw - 6} y={y + cw - 8} fontSize="8" fill="#64748b" textAnchor="end">
              {t("kundli.bhavaBadge", { n: house })}
            </text>
            {/* Removed duplicate Lagna text at y+22 that clashed with planet list */}
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
            <span className="font-semibold">{t("kundli.centerRashi")}:</span> {t(rashiTKey(kundli.moonSign.sanskrit) as "rashis.Mesha")}
          </p>
          <p>
            <span className="font-semibold">{t("kundli.centerNakshatra")}:</span>{" "}
            {moon ? t(nakSanTKey(moon.nakshatra.sanskrit) as "nakshatras.Ashwini") : "—"}
            <span className="text-slate-600">
              {" "}
              · {t("kundli.pada")} {kundli.moonPada}
            </span>
          </p>
          {gothra ? (
            <p>
              <span className="font-semibold">{t("kundli.centerGothra")}:</span> {gothra}
            </p>
          ) : null}
          <p className="mt-1 text-[9px] text-slate-600">
            <span className="font-semibold">{t("kundli.centerLagna")}:</span> {t(rashiTKey(kundli.lagnaRashi.sanskrit) as "rashis.Mesha")}{" "}
            {formatPatrikaNavamsaOnly(kundli.ascendant, i18n.language)}
          </p>
          {kundli.maandi ? (
            <p className="text-[9px] text-red-800 font-semibold">
              <span className="font-bold">{t("kundli.centerMaandi") || t("kundli.maandi")}:</span> {t(rashiTKey(kundli.maandi.rashi.sanskrit) as "rashis.Mesha")}{" "}
              {formatPatrikaNavamsaOnly(kundli.maandi.degree, i18n.language)}
              <span className="block text-[8px] font-normal text-slate-600">({kundli.maandi.windowLabel})</span>
            </p>
          ) : null}
        </div>
      </foreignObject>

      {RASHIS.map((rashi) => {
        const planetsHere = byRashi.get(rashi.index) ?? [];
        const cell = getCellForRashiIndex(rashi.index);
        const { x, y } = cellOrigin(cell);
        const lang = i18n.language;

        interface CellItem {
          text: string;
          isLagna?: boolean;
          isMaandi?: boolean;
        }

        const items: CellItem[] = [];
        if (rashi.index === lagnaIdx) {
          items.push({
            text: `${t("kundli.lagnaPatrika")} ${formatPatrikaNavamsaOnly(kundli.ascendant, lang)}`,
            isLagna: true
          });
        }
        for (const pl of planetsHere) {
          const label = t(`planets.${pl.name}`) + (pl.isRetrograde ? (lang.startsWith("kn") ? " (ವ)" : " (R)") : "");
          items.push({
            text: `${label} ${formatPatrikaNavamsaOnly(pl.degree, lang)}`
          });
        }
        if (kundli.maandi && kundli.maandi.rashi.index === rashi.index) {
          items.push({
            text: `${t("kundli.maandiShort")} ${formatPatrikaNavamsaOnly(kundli.maandi.degree, lang)}`,
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
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}
