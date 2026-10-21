import React from "react";
import type { FrictionNode } from "./karmaMandalaTypes";
import type { SupportedLanguage } from "../../stores/appStore";

interface CosmicRadarChartProps {
  nodes: FrictionNode[];
  activePillarId: string;
  onSelectNode: (node: FrictionNode) => void;
  showPostRemedy: boolean;
  language: SupportedLanguage;
}

export const CosmicRadarChart: React.FC<CosmicRadarChartProps> = ({
  nodes,
  activePillarId,
  onSelectNode,
  showPostRemedy,
  language
}) => {
  // SVG Canvas configuration
  const size = 380;
  const center = size / 2;
  const radius = 140;

  // 5 axes: angles at -90deg (top), -18deg, 54deg, 126deg, 198deg
  const angleStep = (2 * Math.PI) / nodes.length;
  const startAngle = -Math.PI / 2; // start at top (12 o'clock)

  // Compute point coordinates for an axis at given percentage (0-100)
  const getCoordinates = (index: number, score: number) => {
    const angle = startAngle + index * angleStep;
    const r = (score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric polygon points (25%, 50%, 75%, 100%)
  const concentricLevels = [25, 50, 75, 100];
  const gridPolygons = concentricLevels.map((lvl) => {
    return nodes
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl);
        return `${x},${y}`;
      })
      .join(" ");
  });

  // Dynamic polygon for Current Friction vs Post-Remedial Harmony
  const dynamicPolygonPoints = nodes
    .map((node, i) => {
      const score = showPostRemedy ? node.reliefScore : node.frictionScore;
      const { x, y } = getCoordinates(i, score);
      return `${x},${y}`;
    })
    .join(" ");

  // Color schemes
  const strokeColor = showPostRemedy ? "#10b981" : "#ef4444";
  const fillColor = showPostRemedy ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.32)";
  const glowFilterId = showPostRemedy ? "emerald-glow" : "crimson-glow";

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[380px] h-auto drop-shadow-[0_12px_36px_rgba(0,0,0,0.8)]"
        aria-label="Cosmic Friction Radar Chart"
      >
        <defs>
          {/* Radial Gold Backdrop Glow */}
          <radialGradient id="celestialBackdrop" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1538" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#0d091e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06040d" stopOpacity="1" />
          </radialGradient>

          {/* Crimson Friction Glow */}
          <filter id="crimson-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Emerald Relief Glow */}
          <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Deep Celestial Circular Background */}
        <circle cx={center} cy={center} r={radius + 35} fill="url(#celestialBackdrop)" />

        {/* Outer Sacred Gold Border Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 32}
          fill="none"
          stroke="url(#goldRingGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          className="animate-spin-slow origin-center opacity-60"
        />

        {/* Concentric Parashari Grid Polygons */}
        {gridPolygons.map((poly, idx) => (
          <polygon
            key={`grid-${idx}`}
            points={poly}
            fill="none"
            stroke="rgba(245, 158, 11, 0.22)"
            strokeWidth={idx === 3 ? "1.5" : "0.75"}
            strokeDasharray={idx < 3 ? "3 3" : undefined}
          />
        ))}

        {/* 5 Radial Spoke Lines */}
        {nodes.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(245, 158, 11, 0.3)"
              strokeWidth="1"
            />
          );
        })}

        {/* Dynamic Morphing Radar Area */}
        <polygon
          points={dynamicPolygonPoints}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2.5"
          filter={`url(#${glowFilterId})`}
          className="transition-all duration-700 ease-in-out cursor-pointer"
        />

        {/* Interactive Node Markers */}
        {nodes.map((node, i) => {
          const score = showPostRemedy ? node.reliefScore : node.frictionScore;
          const { x, y } = getCoordinates(i, score);
          const outer = getCoordinates(i, 100);
          const isSelected = node.id === activePillarId;

          // Label position slightly beyond outer ring
          const labelDist = radius + 22;
          const labelAngle = startAngle + i * angleStep;
          const lx = center + labelDist * Math.cos(labelAngle);
          const ly = center + labelDist * Math.sin(labelAngle);

          return (
            <g key={`node-${node.id}`} onClick={() => onSelectNode(node)} className="cursor-pointer group">
              {/* Pulsing ring on active node */}
              {isSelected && (
                <circle
                  cx={x}
                  cy={y}
                  r="14"
                  fill="none"
                  stroke={showPostRemedy ? "#34d399" : "#f87171"}
                  strokeWidth="2"
                  className="animate-ping opacity-75"
                />
              )}

              {/* Node Circle */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? "9" : "6.5"}
                fill={showPostRemedy ? "#10b981" : node.frictionScore >= 75 ? "#ef4444" : "#f59e0b"}
                stroke="#fff"
                strokeWidth={isSelected ? "2.5" : "1.5"}
                className="transition-all duration-300 hover:scale-125"
              />

              {/* Score text inside node */}
              <text
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="#ffffff"
                className="pointer-events-none"
              >
                {score}
              </text>

              {/* Outer Label */}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                fontSize={isSelected ? "11.5" : "10"}
                fontWeight={isSelected ? "bold" : "500"}
                fill={isSelected ? "#fbbf24" : "#e2e8f0"}
                className="transition-colors duration-200"
              >
                {node.title[language] || node.title.kn}
              </text>
            </g>
          );
        })}

        {/* Center Sacred Bindu */}
        <circle cx={center} cy={center} r="4" fill="#fbbf24" />
        <circle cx={center} cy={center} r="8" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.6" />
      </svg>
    </div>
  );
};
