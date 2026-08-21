import React from 'react';
import { cn } from '@/lib/utils';
import { FlavorRadarProfile } from '@/types/coffee';

export interface FlavorRadarChartProps {
  profile: FlavorRadarProfile;
  size?: number;
  className?: string;
  showLabels?: boolean;
}

export const FlavorRadarChart: React.FC<FlavorRadarChartProps> = ({
  profile,
  size = 240,
  className,
  showLabels = true,
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.72; // Leave margin for labels
  const maxScore = 5;

  const attributes: Array<{ key: keyof FlavorRadarProfile; label: string; value: number }> = [
    { key: 'acidity', label: 'Acidity', value: profile.acidity },
    { key: 'sweetness', label: 'Sweetness', value: profile.sweetness },
    { key: 'body', label: 'Body', value: profile.body },
    { key: 'finish', label: 'Finish', value: profile.finish },
    { key: 'bitterness', label: 'Bitterness', value: profile.bitterness },
    { key: 'aroma', label: 'Aroma', value: profile.aroma },
  ];

  const numAxes = attributes.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Concentric polygon grid points (levels 1, 2, 3, 4, 5)
  const gridLevels = [1, 2, 3, 4, 5];

  // Helper to get coordinates for axis i at specific score ratio
  const getCoordinates = (index: number, score: number) => {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = (score / maxScore) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Build polygon path for coffee values
  const polygonPoints = attributes
    .map((attr, i) => {
      const { x, y } = getCoordinates(i, attr.value);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={cn('relative flex flex-col items-center select-none', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label={`Sensory Flavor Radar: Acidity ${profile.acidity}/5, Sweetness ${profile.sweetness}/5, Body ${profile.body}/5, Bitterness ${profile.bitterness}/5, Aroma ${profile.aroma}/5, Finish ${profile.finish}/5`}
      >
        {/* Background Concentric Webs */}
        {gridLevels.map((lvl) => {
          const gridPoints = attributes
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={lvl}
              points={gridPoints}
              fill={lvl % 2 === 0 ? 'rgba(43, 24, 16, 0.02)' : 'none'}
              stroke="rgba(43, 24, 16, 0.12)"
              strokeWidth="1"
              strokeDasharray={lvl < 5 ? '3 3' : 'none'}
            />
          );
        })}

        {/* Axis Lines from Center to Edges */}
        {attributes.map((_, i) => {
          const { x, y } = getCoordinates(i, maxScore);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(43, 24, 16, 0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Radar Area */}
        <polygon
          points={polygonPoints}
          fill="rgba(217, 83, 47, 0.22)"
          stroke="#d9532f"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Vertex Dots & Hover Markers */}
        {attributes.map((attr, i) => {
          const { x, y } = getCoordinates(i, attr.value);
          return (
            <g key={attr.key}>
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#d9532f"
                stroke="#ffffff"
                strokeWidth="2"
                className="drop-shadow-sm transition-transform duration-300 hover:scale-125"
              />
            </g>
          );
        })}

        {/* Text Labels along outer rim */}
        {showLabels &&
          attributes.map((attr, i) => {
            const { x, y, angle } = getCoordinates(i, maxScore + 0.85);
            // Determine text anchor based on horizontal angle position
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (Math.cos(angle) > 0.2) textAnchor = 'start';
            else if (Math.cos(angle) < -0.2) textAnchor = 'end';

            return (
              <text
                key={attr.key}
                x={x}
                y={y}
                textAnchor={textAnchor}
                dominantBaseline="central"
                className="text-[11px] font-sans font-semibold fill-espresso-800"
              >
                {attr.label} ({attr.value.toFixed(1)})
              </text>
            );
          })}
      </svg>
    </div>
  );
};
