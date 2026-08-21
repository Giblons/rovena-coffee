import React from 'react';
import { cn } from '@/lib/utils';
import { Award, Sparkles } from 'lucide-react';

export interface CuppingScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CuppingScoreBadge: React.FC<CuppingScoreBadgeProps> = ({
  score,
  showLabel = true,
  size = 'md',
  className,
}) => {
  const isPresidential = score >= 90.0;
  const isExemplary = score >= 87.0 && score < 90.0;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3.5 py-1.5 gap-2',
  };

  const badgeStyles = isPresidential
    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-espresso-950 border border-amber-300 shadow-sm font-bold'
    : isExemplary
    ? 'bg-emerald-100 text-olive-700 border border-emerald-300/80 font-semibold'
    : 'bg-cream-700 text-espresso-900 border border-cream-800 font-medium';

  const tierLabel = isPresidential
    ? '90+ Micro-lot'
    : isExemplary
    ? 'Exemplary 87+'
    : 'Specialty 85+';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full tracking-wide transition-all select-none',
        sizeClasses[size],
        badgeStyles,
        className
      )}
      title={`Specialty Coffee Association (SCA) Cupping Score: ${score.toFixed(1)} / 100`}
      aria-label={`SCA Cupping Score: ${score.toFixed(1)}`}
    >
      {isPresidential ? (
        <Sparkles className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5', 'text-espresso-950 animate-pulse')} />
      ) : (
        <Award className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5', isExemplary ? 'text-olive-600' : 'text-espresso-700')} />
      )}
      <span>SCA {score.toFixed(1)}</span>
      {showLabel && <span className="opacity-80 font-normal">| {tierLabel}</span>}
    </span>
  );
};
