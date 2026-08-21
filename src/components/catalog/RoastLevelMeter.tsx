import React from 'react';
import { cn } from '@/lib/utils';
import { RoastLevel } from '@/types/coffee';
import { Flame } from 'lucide-react';

export interface RoastLevelMeterProps {
  level: RoastLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ROAST_LEVEL_MAP: Record<RoastLevel, { index: number; colorClass: string; activeBarClass: string }> = {
  Light: {
    index: 1,
    colorClass: 'text-terracotta-500',
    activeBarClass: 'bg-amber-500',
  },
  'Medium-Light': {
    index: 2,
    colorClass: 'text-terracotta-600',
    activeBarClass: 'bg-terracotta-400',
  },
  Medium: {
    index: 3,
    colorClass: 'text-terracotta-700',
    activeBarClass: 'bg-terracotta-500',
  },
  'Medium-Dark': {
    index: 4,
    colorClass: 'text-espresso-700',
    activeBarClass: 'bg-espresso-700',
  },
  Dark: {
    index: 5,
    colorClass: 'text-espresso-950',
    activeBarClass: 'bg-espresso-950',
  },
};

export const RoastLevelMeter: React.FC<RoastLevelMeterProps> = ({
  level,
  showLabel = true,
  size = 'md',
  className,
}) => {
  const current = ROAST_LEVEL_MAP[level] || ROAST_LEVEL_MAP['Medium'];
  const activeCount = current.index;

  const barSizes = {
    sm: 'w-2 h-1.5 rounded-xs',
    md: 'w-3 h-2 rounded-xs',
    lg: 'w-4 h-2.5 rounded-sm',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-xs font-medium',
    lg: 'text-sm font-semibold',
  };

  return (
    <div
      className={cn('inline-flex items-center gap-2 select-none', className)}
      title={`Roast Profile: ${level} (Level ${activeCount}/5)`}
      aria-label={`Roast Level: ${level}`}
    >
      <div className="flex items-center gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => {
          const isActive = step <= activeCount;
          return (
            <span
              key={step}
              className={cn(
                'transition-colors duration-200',
                barSizes[size],
                isActive ? current.activeBarClass : 'bg-cream-700/80 border border-cream-800/40'
              )}
            />
          );
        })}
      </div>
      {showLabel && (
        <span className={cn('text-espresso-800 tracking-tight flex items-center gap-1', textSizes[size])}>
          <Flame className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5', current.colorClass)} />
          {level}
        </span>
      )}
    </div>
  );
};
