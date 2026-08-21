'use client';

import React from 'react';
import { Clock, Flame, Truck, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/order';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onStatusChange?: (newStatus: OrderStatus) => void;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Pending: {
    label: 'Pending Roast',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700/60',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  Roasting: {
    label: 'Roasting',
    bg: 'bg-terracotta-50 dark:bg-terracotta-950/40',
    text: 'text-terracotta-700 dark:text-terracotta-300',
    border: 'border-terracotta-300 dark:border-terracotta-700/60',
    dot: 'bg-terracotta-500 animate-pulse',
    icon: Flame,
  },
  Dispatched: {
    label: 'Dispatched',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700/60',
    dot: 'bg-blue-500',
    icon: Truck,
  },
  Delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  Cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700/60',
    dot: 'bg-red-500',
    icon: XCircle,
  },
};

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Roasting', 'Dispatched', 'Delivered', 'Cancelled'];

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'md',
  interactive = false,
  onStatusChange,
  className,
  showIcon = true,
}) => {
  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-xs gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 rounded-sm gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 rounded-md gap-2 font-semibold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  if (interactive && onStatusChange) {
    return (
      <div className={cn('relative inline-flex items-center', className)}>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
          aria-label={`Change order status from ${status}`}
          className={cn(
            'appearance-none cursor-pointer border font-sans tracking-wide transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-1',
            'pr-7 pl-2.5 py-1 rounded-sm text-xs font-semibold shadow-xs',
            config.bg,
            config.text,
            config.border,
            sizeClasses
          )}
        >
          {ALL_STATUSES.map((st) => (
            <option key={st} value={st} className="bg-surface text-espresso-950 font-normal">
              {st}
            </option>
          ))}
        </select>
        <ChevronDown
          className={cn(
            'pointer-events-none absolute right-2 w-3.5 h-3.5',
            config.text,
            'opacity-70'
          )}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <span
      data-testid="order-status-badge"
      className={cn(
        'inline-flex items-center border font-sans tracking-wide transition-colors shadow-xs select-none',
        sizeClasses,
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes, 'shrink-0')} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
};
