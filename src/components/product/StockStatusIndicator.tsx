'use client';

import React from 'react';
import { StockStatus } from '@/types/coffee';
import { Badge } from '@/components/ui/Badge';
import { calculateNextRoastBatch } from '@/lib/roast-schedule';
import { Flame, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface StockStatusIndicatorProps {
  stockStatus: StockStatus;
  stockQuantityKg?: number;
  roastScheduleDays?: ('Monday' | 'Thursday')[];
  className?: string;
}

export const StockStatusIndicator: React.FC<StockStatusIndicatorProps> = ({
  stockStatus,
  stockQuantityKg,
  roastScheduleDays = ['Monday', 'Thursday'],
  className = '',
}) => {
  const roastBatch = calculateNextRoastBatch(new Date(), roastScheduleDays);

  const getStatusContent = () => {
    switch (stockStatus) {
      case 'in_stock':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          label: 'In Stock & Ready to Roast',
          badgeVariant: 'stock' as const,
          description: stockQuantityKg ? `${stockQuantityKg} kg available in current batch` : undefined,
        };
      case 'low_stock':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          label: 'Limited Micro-Lot Reserve',
          badgeVariant: 'stock' as const,
          description: stockQuantityKg ? `Only ${stockQuantityKg} kg remaining in this harvest` : 'Very limited quantity remaining',
        };
      case 'out_of_stock':
        return {
          icon: <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
          label: 'Sold Out / Awaiting Next Harvest',
          badgeVariant: 'stock' as const,
          description: 'Join the waitlist for the next direct-trade shipment',
        };
      case 'pre_order':
      default:
        return {
          icon: <Clock className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" />,
          label: 'Roast to Order (Pre-order)',
          badgeVariant: 'stock' as const,
          description: 'Queued for upcoming artisan roast cycle',
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className={`space-y-2.5 ${className}`} data-testid="stock-status-indicator">
      {/* Primary Status Pill */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={content.badgeVariant} stockStatus={stockStatus} className="py-1 px-3" />
        {stockQuantityKg !== undefined && stockStatus !== 'out_of_stock' && (
          <span className="text-xs text-secondary font-medium">
            ({stockQuantityKg} kg green stock)
          </span>
        )}
      </div>

      {/* Live Roast Schedule & Cutoff Banner */}
      {stockStatus !== 'out_of_stock' && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-muted border border-subtle text-xs">
          <Flame className="w-4 h-4 text-terracotta-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="font-semibold text-primary">
              {roastBatch.cutoffFormattedString}
            </p>
            <p className="text-muted">
              {roastBatch.hoursUntilCutoff > 0
                ? `Order cutoff in ${roastBatch.hoursUntilCutoff} hours for fresh degassing & packaging.`
                : 'Next production batch locking in soon.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
