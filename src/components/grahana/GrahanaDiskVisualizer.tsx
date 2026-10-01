import React from "react";
import type { GrahanaContactDirections } from "../../core/AstodayaGrahanaEngine";

interface GrahanaDiskVisualizerProps {
  type: "surya" | "chandra";
  subType: "total" | "annular" | "partial" | "penumbral" | "hybrid";
  obscurationPercent: number;
  contactDirections?: GrahanaContactDirections;
  lang?: string;
}

export const GrahanaDiskVisualizer: React.FC<GrahanaDiskVisualizerProps> = ({
  type,
  subType,
  obscurationPercent,
  contactDirections,
  lang = "kn"
}) => {
  const isSolar = type === "surya";
  const sparshaAngle = contactDirections?.coverageVisual?.sparshaAngle ?? (isSolar ? 270 : 90);
  const mokshaAngle = contactDirections?.coverageVisual?.mokshaAngle ?? (isSolar ? 90 : 270);
  const coveragePct = Math.max(15, Math.min(100, obscurationPercent || 75));

  // 8 Directional compass coordinates on r=115
  const cx = 140;
  const cy = 140;
  const diskR = 64;
  const labelR = 108;
  const markerR = 76;

  const directions = [
    { code: "N", labelKn: "ಉತ್ತರ (N)", labelEn: "North", deg: 0 },
    { code: "NE", labelKn: "ಈಶಾನ್ಯ (NE)", labelEn: "North-East", deg: 45 },
    { code: "E", labelKn: "ಪೂರ್ವ (E)", labelEn: "East", deg: 90 },
    { code: "SE", labelKn: "ಆಗ್ನೇಯ (SE)", labelEn: "South-East", deg: 135 },
    { code: "S", labelKn: "ದಕ್ಷಿಣ (S)", labelEn: "South", deg: 180 },
    { code: "SW", labelKn: "ನೈಋತ್ಯ (SW)", labelEn: "South-West", deg: 225 },
    { code: "W", labelKn: "ಪಶ್ಚಿಮ (W)", labelEn: "West", deg: 270 },
    { code: "NW", labelKn: "ವಾಯವ್ಯ (NW)", labelEn: "North-West", deg: 315 },
  ];

  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;

  // Sparsha and Moksha marker coordinates
  const sRad = toRad(sparshaAngle);
  const sx = cx + markerR * Math.cos(sRad);
  const sy = cy + markerR * Math.sin(sRad);

  const mRad = toRad(mokshaAngle);
  const mx = cx + markerR * Math.cos(mRad);
  const my = cy + markerR * Math.sin(mRad);

  // Arrow indicators pointing into disk for Sparsha, out of disk for Moksha
  const sArrowTipX = cx + (diskR - 4) * Math.cos(sRad);
  const sArrowTipY = cy + (diskR - 4) * Math.sin(sRad);
  const sArrowBaseX = cx + (markerR + 10) * Math.cos(sRad);
  const sArrowBaseY = cy + (markerR + 10) * Math.sin(sRad);

  const mArrowBaseX = cx + (diskR - 4) * Math.cos(mRad);
  const mArrowBaseY = cy + (diskR - 4) * Math.sin(mRad);
  const mArrowTipX = cx + (markerR + 12) * Math.cos(mRad);
  const mArrowTipY = cy + (markerR + 12) * Math.sin(mRad);

  const sparshaLabel = contactDirections?.sparshaDikku?.label?.[lang] || contactDirections?.sparshaDikku?.label?.kn || (isSolar ? "ಪಶ್ಚಿಮ (West)" : "ಪೂರ್ವ (East)");
  const mokshaLabel = contactDirections?.mokshaDikku?.label?.[lang] || contactDirections?.mokshaDikku?.label?.kn || (isSolar ? "ಪೂರ್ವ (East)" : "ಪಶ್ಚಿಮ (West)");
  const pathDesc = contactDirections?.pathDescription?.[lang] || contactDirections?.pathDescription?.kn;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-br from-amber-50/70 via-white to-amber-100/40 rounded-2xl border border-amber-300/80 p-3.5 shadow-sm">
      {/* SVG Circular Dial with 8 Directions and Eclipse Graphic */}
      <div className="relative w-72 h-72 flex-shrink-0 flex items-center justify-center select-none">
        <svg
          viewBox="0 0 280 280"
          className="w-full h-full drop-shadow-md"
          aria-label="Eclipse Directional Diagram"
        >
          <defs>
            {/* Sun radiant gradient */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="35%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>

            {/* Moon silver crater gradient */}
            <radialGradient id="moonGlow" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#e2e8f0" />
              <stop offset="80%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>

            {/* Eclipse shadow gradient */}
            <radialGradient id="shadowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.96" />
              <stop offset="85%" stopColor="#1e293b" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.85" />
            </radialGradient>

            {/* Blood Moon total lunar gradient */}
            <radialGradient id="bloodMoon" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="50%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </radialGradient>

            {/* Marker arrow markers */}
            <marker
              id="entryArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#15803d" />
            </marker>

            <marker
              id="exitArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
            </marker>
          </defs>

          {/* Outer Compass Outer Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={labelR + 14}
            fill="none"
            stroke="#b45309"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.35"
          />
          <circle
            cx={cx}
            cy={cy}
            r={labelR + 6}
            fill="none"
            stroke="#b45309"
            strokeWidth="1.2"
            opacity="0.5"
          />

          {/* Cardinal & Inter-cardinal Crosshairs */}
          <line x1={cx} y1={24} x2={cx} y2={cy - diskR - 8} stroke="#d97706" strokeWidth="1" opacity="0.4" />
          <line x1={cx} y1={cy + diskR + 8} x2={cx} y2={256} stroke="#d97706" strokeWidth="1" opacity="0.4" />
          <line x1={24} y1={cy} x2={cx - diskR - 8} y2={cy} stroke="#d97706" strokeWidth="1" opacity="0.4" />
          <line x1={cx + diskR + 8} y1={cy} x2={256} y2={cy} stroke="#d97706" strokeWidth="1" opacity="0.4" />

          {/* 8 Direction Labels */}
          {directions.map((d) => {
            const rad = toRad(d.deg);
            const lx = cx + labelR * Math.cos(rad);
            const ly = cy + labelR * Math.sin(rad);
            const isCardinal = ["N", "E", "S", "W"].includes(d.code);
            return (
              <g key={d.code}>
                <circle
                  cx={lx}
                  cy={ly}
                  r="12"
                  fill="#fffdf8"
                  stroke={isCardinal ? "#b45309" : "#d97706"}
                  strokeWidth={isCardinal ? "1.5" : "1"}
                  className="shadow-xs"
                />
                <text
                  x={lx}
                  y={ly + 3.5}
                  textAnchor="middle"
                  fontSize={isCardinal ? "9" : "8"}
                  fontWeight={isCardinal ? "900" : "700"}
                  fill={isCardinal ? "#78350f" : "#92400e"}
                  fontFamily="sans-serif"
                >
                  {d.code}
                </text>
              </g>
            );
          })}

          {/* Central Celestial Body (Sun or Moon) */}
          {isSolar ? (
            <g>
              {/* Solar corona glow */}
              <circle cx={cx} cy={cy} r={diskR + 6} fill="#fef08a" opacity="0.25" />
              <circle cx={cx} cy={cy} r={diskR} fill="url(#sunGlow)" stroke="#b45309" strokeWidth="2" />
            </g>
          ) : (
            <g>
              {/* Moon disk */}
              <circle cx={cx} cy={cy} r={diskR} fill="url(#moonGlow)" stroke="#475569" strokeWidth="2" />
              {/* Subtle lunar craters/maria */}
              <ellipse cx={cx - 16} cy={cy - 12} rx="12" ry="10" fill="#94a3b8" opacity="0.35" />
              <ellipse cx={cx + 18} cy={cy + 10} rx="16" ry="14" fill="#94a3b8" opacity="0.3" />
              <circle cx={cx - 10} cy={cy + 22} r="8" fill="#94a3b8" opacity="0.25" />
            </g>
          )}

          {/* Eclipse Shadow Overlay based on coverage and type */}
          {subType === "total" && !isSolar ? (
            // Blood Moon Total Lunar Eclipse
            <circle cx={cx} cy={cy} r={diskR} fill="url(#bloodMoon)" opacity="0.92" />
          ) : subType === "annular" && isSolar ? (
            // Annular Solar Eclipse: central dark moon with gold ring
            <g>
              <circle cx={cx} cy={cy} r={diskR - 7} fill="url(#shadowGradient)" />
            </g>
          ) : subType === "total" && isSolar ? (
            // Total Solar Eclipse: completely blocked with corona ring
            <g>
              <circle cx={cx} cy={cy} r={diskR + 3} fill="none" stroke="#fde047" strokeWidth="3" opacity="0.7" />
              <circle cx={cx} cy={cy} r={diskR} fill="url(#shadowGradient)" />
            </g>
          ) : (
            // Partial Eclipse: shadow overlapping from Sparsha to Moksha direction
            <g clipPath={`url(#diskClip_${type}_${subType})`}>
              <clipPath id={`diskClip_${type}_${subType}`}>
                <circle cx={cx} cy={cy} r={diskR} />
              </clipPath>
              <circle
                cx={cx + (1 - coveragePct / 100) * (markerR - 25) * Math.cos(sRad)}
                cy={cy + (1 - coveragePct / 100) * (markerR - 25) * Math.sin(sRad)}
                r={diskR}
                fill="url(#shadowGradient)"
              />
            </g>
          )}

          {/* Dotted Eclipse Trajectory Arc through center */}
          <path
            d={`M ${sx} ${sy} Q ${cx} ${cy} ${mx} ${my}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity="0.8"
          />

          {/* Sparsha (Entry) Arrow & Pulsing Point */}
          <line
            x1={sArrowBaseX}
            y1={sArrowBaseY}
            x2={sArrowTipX}
            y2={sArrowTipY}
            stroke="#15803d"
            strokeWidth="3"
            markerEnd="url(#entryArrow)"
          />
          <circle cx={sx} cy={sy} r="6" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
          <circle cx={sx} cy={sy} r="9" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="2 2" />

          {/* Moksha (Exit) Arrow & Pulsing Point */}
          <line
            x1={mArrowBaseX}
            y1={mArrowBaseY}
            x2={mArrowTipX}
            y2={mArrowTipY}
            stroke="#0284c7"
            strokeWidth="3"
            markerEnd="url(#exitArrow)"
          />
          <circle cx={mx} cy={my} r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
          <circle cx={mx} cy={my} r="9" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />

          {/* Center Badge: Coverage % */}
          <rect
            x={cx - 26}
            y={cy - 10}
            width="52"
            height="20"
            rx="10"
            fill="#0f172a"
            stroke="#f59e0b"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="900"
            fill="#fef08a"
            fontFamily="monospace"
          >
            {coveragePct}%
          </text>
        </svg>
      </div>

      {/* Vedic Directional Summary & Explanations */}
      <div className="flex-1 space-y-2.5 text-xs">
        <div className="border-b border-amber-300/80 pb-1.5 flex items-center justify-between">
          <span className="font-serif font-black text-amber-950 text-sm flex items-center gap-1.5">
            <span>🧭</span>
            <span>ಗ್ರಹಣ ಪ್ರವೇಶ & ಮೋಕ್ಷ ದಿಕ್ಕು (Eclipse Path & Directions)</span>
          </span>
          <span className="rounded-full bg-amber-200/80 text-amber-950 px-2 py-0.5 text-[10px] font-bold">
            {isSolar ? "ಸೂರ್ಯ ಬಿಂಬ" : "ಚಂದ್ರ ಬಿಂಬ"}
          </span>
        </div>

        {/* 2-Column Grid: Entry vs Exit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Sparsha (Entry) */}
          <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-[11px] mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>ಸ್ಪರ್ಶ (ಪ್ರವೇಶ ದಿಕ್ಕು / Entry):</span>
            </div>
            <div className="font-bold text-emerald-950 text-xs pl-4">
              {sparshaLabel}
            </div>
            <p className="text-[10px] text-emerald-800/90 pl-4 mt-0.5 leading-snug">
              {contactDirections?.sparshaDikku?.sanskritName?.[lang] || contactDirections?.sparshaDikku?.sanskritName?.kn}
            </p>
          </div>

          {/* Moksha (Exit) */}
          <div className="p-2.5 rounded-xl border border-sky-300 bg-sky-50/70 shadow-xs">
            <div className="flex items-center gap-1.5 text-sky-900 font-extrabold text-[11px] mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
              <span>ಮೋಕ್ಷ (ನಿರ್ಗಮನ ದಿಕ್ಕು / Exit):</span>
            </div>
            <div className="font-bold text-sky-950 text-xs pl-4">
              {mokshaLabel}
            </div>
            <p className="text-[10px] text-sky-800/90 pl-4 mt-0.5 leading-snug">
              {contactDirections?.mokshaDikku?.sanskritName?.[lang] || contactDirections?.mokshaDikku?.sanskritName?.kn}
            </p>
          </div>
        </div>

        {/* Path Description */}
        {pathDesc && (
          <div className="p-2 rounded-lg bg-amber-100/60 border border-amber-300/70 text-[11px] text-amber-950 leading-relaxed font-medium">
            <span className="font-bold">ಸಿದ್ಧಾಂತ ವಿಧಿ: </span>
            <span>{pathDesc}</span>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-slate-700 pt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>ಸ್ಪರ್ಶ ಬಿಂದು</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>ಮಧ್ಯ ಗ್ರಾಸ</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
            <span>ಮೋಕ್ಷ ಬಿಂದು</span>
          </span>
        </div>
      </div>
    </div>
  );
};
