import React from 'react';
import { Sparkles, Flame, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessingMethod, RoastLevel, StockStatus } from '@/types/coffee';

export type BadgeVariant =
  | 'default'
  | 'outline'
  | 'terracotta'
  | 'olive'
  | 'honey'
  | 'berry'
  | 'espresso'
  | 'sca'
  | 'process'
  | 'roast'
  | 'stock';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  scaScore?: number;
  process?: ProcessingMethod;
  roastLevel?: RoastLevel;
  stockStatus?: StockStatus;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  scaScore,
  process,
  roastLevel,
  stockStatus,
  icon,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-xs gap-1',
    md: 'text-xs px-2.5 py-1 font-medium rounded-sm gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-semibold rounded-md gap-2',
  }[size];

  // Specific rendering for SCA Cupping Score Badge
  if (scaScore !== undefined || variant === 'sca') {
    const score = scaScore ?? 85;
    const isPresidential = score >= 90;
    const isExemplary = score >= 87 && score < 90;

    return (
      <span
        className={cn(
          'inline-flex items-center font-sans tracking-wide shadow-xs',
          sizeClasses,
          isPresidential
            ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-espresso-950 font-bold border border-amber-400/60 shadow-amber-300/30'
            : isExemplary
            ? 'bg-olive-100 text-olive-700 border border-olive-400/40'
            : 'bg-cream-600 text-espresso-800 border border-border-subtle',
          className
        )}
        {...props}
      >
        <Sparkles className={cn('w-3.5 h-3.5', isPresidential ? 'text-espresso-950' : 'text-honey-600')} />
        <span>SCA {score.toFixed(1)}</span>
        {isPresidential && <span className="font-semibold text-[10px] uppercase opacity-90">Micro-lot</span>}
      </span>
    );
  }

  // Specific rendering for Processing Method Badge
  if (process !== undefined || variant === 'process') {
    const proc = process ?? 'Washed';
    const processConfig: Record<
      ProcessingMethod,
      { bg: string; text: string; border: string }
    > = {
      Washed: { bg: 'bg-olive-100', text: 'text-olive-700', border: 'border-olive-300' },
      Natural: { bg: 'bg-honey-100', text: 'text-honey-700', border: 'border-honey-300' },
      'Anaerobic Fermentation': { bg: 'bg-berry-100', text: 'text-berry-700', border: 'border-berry-300' },
      'Honey / Pulped Natural': { bg: 'bg-honey-100', text: 'text-honey-700', border: 'border-honey-300' },
      'Thermal Shock': { bg: 'bg-berry-100', text: 'text-berry-700', border: 'border-berry-300' },
      'Wet Hulled (Giling Basah)': { bg: 'bg-cream-700', text: 'text-espresso-800', border: 'border-espresso-300' },
    };

    const style = processConfig[proc] || processConfig['Washed'];

    return (
      <span
        className={cn(
          'inline-flex items-center font-sans border tracking-normal',
          sizeClasses,
          style.bg,
          style.text,
          style.border,
          className
        )}
        {...props}
      >
        {icon}
        <span>{children || proc}</span>
      </span>
    );
  }

  // Specific rendering for Roast Level Badge
  if (roastLevel !== undefined || variant === 'roast') {
    const roast = roastLevel ?? 'Medium';
    const roastConfig: Record<RoastLevel, { bg: string; text: string; border: string }> = {
      Light: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
      'Medium-Light': { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
      Medium: { bg: 'bg-terracotta-50', text: 'text-terracotta-700', border: 'border-terracotta-200' },
      'Medium-Dark': { bg: 'bg-espresso-100', text: 'text-espresso-800', border: 'border-espresso-300' },
      Dark: { bg: 'bg-espresso-900', text: 'text-cream-400', border: 'border-espresso-950' },
    };

    const style = roastConfig[roast] || roastConfig['Medium'];

    return (
      <span
        className={cn(
          'inline-flex items-center font-sans border tracking-normal',
          sizeClasses,
          style.bg,
          style.text,
          style.border,
          className
        )}
        {...props}
      >
        <Flame className={cn('w-3.5 h-3.5', roast === 'Dark' ? 'text-terracotta-400' : 'text-terracotta-500')} />
        <span>{children || roast}</span>
      </span>
    );
  }

  // Specific rendering for Stock Status Badge
  if (stockStatus !== undefined || variant === 'stock') {
    const status = stockStatus ?? 'in_stock';
    const stockConfig: Record<
      StockStatus,
      { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
    > = {
      in_stock: {
        label: 'In Stock',
        bg: 'bg-olive-100',
        text: 'text-olive-700',
        border: 'border-olive-300',
        icon: <CheckCircle className="w-3.5 h-3.5 text-olive-600" />,
      },
      low_stock: {
        label: 'Low Stock',
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
      },
      out_of_stock: {
        label: 'Sold Out',
        bg: 'bg-charcoal-100',
        text: 'text-charcoal-600',
        border: 'border-charcoal-300',
        icon: <XCircle className="w-3.5 h-3.5 text-charcoal-500" />,
      },
      pre_order: {
        label: 'Roast to Order',
        bg: 'bg-terracotta-50',
        text: 'text-terracotta-700',
        border: 'border-terracotta-300',
        icon: <Clock className="w-3.5 h-3.5 text-terracotta-600" />,
      },
    };

    const config = stockConfig[status] || stockConfig['in_stock'];

    return (
      <span
        className={cn(
          'inline-flex items-center font-sans border tracking-normal',
          sizeClasses,
          config.bg,
          config.text,
          config.border,
          className
        )}
        {...props}
      >
        {config.icon}
        <span>{children || config.label}</span>
      </span>
    );
  }

  // General variant styling
  const generalStyles: Record<string, string> = {
    default: 'bg-cream-600 text-espresso-900 border border-border-subtle',
    outline: 'bg-transparent text-espresso-800 border border-border-medium',
    terracotta: 'bg-terracotta-100 text-terracotta-800 border border-terracotta-300',
    olive: 'bg-olive-100 text-olive-700 border border-olive-300',
    honey: 'bg-honey-100 text-honey-700 border border-honey-300',
    berry: 'bg-berry-100 text-berry-700 border border-berry-300',
    espresso: 'bg-espresso-900 text-cream-400 border border-espresso-950',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-sans font-medium',
        sizeClasses,
        generalStyles[variant] || generalStyles.default,
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
};
