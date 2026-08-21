'use client';

import React from 'react';
import { FlavorRadarProfile } from '@/types/coffee';

interface FlavorRadarChartProps {
  profile: FlavorRadarProfile;
  className?: string;
}

export const FlavorRadarChart: React.FC<FlavorRadarChartProps> = ({ profile, className = '' }) => {
  const axes = [
    { label: 'Acidity', value: profile.acidity },
    { label: 'Sweetness', value: profile.sweetness },
    { label: 'Body', value: profile.body },
    { label: 'Bitterness', value: profile.bitterness },
    { label: 'Aroma', value: profile.aroma },
    { label: 'Finish', value: profile.finish },
  ];

  const size = 260;
  const center = size / 2;
  const radius = 90;
  const maxScore = 5;

  // Calculate coordinates on hexagon
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    const r = (value / maxScore) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points
  const points = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.value);
      return `${x},${y}`;
    })
    .join(' ');

  const accessibleLabel = axes
    .map((a) => `${a.label}: ${a.value.toFixed(1)} out of 5`)
    .join(', ');

  return (
    <div
      className={`flex flex-col items-center p-4 rounded-xl bg-surface border border-subtle ${className}`}
      data-testid="flavor-radar-chart"
      aria-label={`Flavor Radar Profile: ${accessibleLabel}`}
    >
      <span className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
        Sensory Flavor Balance
      </span>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Concentric Grid Rings */}
        {[1, 2, 3, 4, 5].map((level) => {
          const ringPoints = axes
            .map((_, i) => {
              const { x, y } = getCoordinates(i, level);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={level}
              points={ringPoints}
              fill="transparent"
              stroke="currentColor"
              className="text-border-subtle stroke-1"
            />
          );
        })}

        {/* Axis Lines */}
        {axes.map((_, i) => {
          const { x, y } = getCoordinates(i, maxScore);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-border-subtle stroke-1"
            />
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={points}
          fill="rgba(217, 83, 47, 0.25)"
          stroke="#d9532f"
          strokeWidth="2.5"
          className="transition-all duration-500"
        />

        {/* Data Vertices / Dots */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(i, axis.value);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#d9532f"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="hover:r-6 transition-all"
            />
          );
        })}

        {/* Axis Labels */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(i, maxScore + 0.8);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[11px] font-bold fill-current text-primary"
            >
              {axis.label} ({axis.value})
            </text>
          );
        })}
      </svg>
    </div>
  );
};
