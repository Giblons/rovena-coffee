'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type OrganicCurvePosition = 'left' | 'right' | 'bottom';

export interface OrganicCurvesProps {
  position?: OrganicCurvePosition;
  className?: string;
  opacity?: number;
}

export const OrganicCurves: React.FC<OrganicCurvesProps> = ({
  position = 'left',
  className,
  opacity = 0.55,
}) => {
  const transforms: Record<OrganicCurvePosition, string> = {
    left: '',
    right: 'scale-x-[-1]',
    bottom: 'rotate-90 translate-x-[-20%]',
  };

  return (
    <div
      className={cn('pointer-events-none absolute overflow-hidden', className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 600"
        className={cn('h-full w-auto', transforms[position])}
        style={{ opacity }}
        preserveAspectRatio="xMinYMid slice"
      >
        <path
          fill="#F5EFE0"
          d="M-40 60 Q120 20 200 140 T360 80 V620 H-40 Z"
        />
        <path
          fill="#FAF6F0"
          d="M-60 280 Q140 220 260 380 T420 300 V620 H-60 Z"
          opacity="0.75"
        />
        <path
          fill="none"
          stroke="#E8DFD0"
          strokeWidth="2.5"
          d="M20 40 Q140 120 80 260 Q40 400 180 480"
        />
      </svg>
    </div>
  );
};
