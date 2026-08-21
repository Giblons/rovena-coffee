'use client';

import React, { useMemo, useState } from 'react';
import {
  Flame,
  Calendar,
  CheckCircle2,
  Play,
  Layers,
  Sparkles,
  Coffee,
  Clock,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { RoastBatch } from '@/types/roast-batch';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface RoastBatchQueueProps {
  orders: Order[];
  batches: any[];
  onStartRoastBatch?: (day: 'Monday' | 'Thursday', assignedOrderIds: string[]) => void;
  onUpdateBatchStatus?: (batchId: string, status: string) => void;
  className?: string;
}

interface BeanRequirement {
  productId: string;
  name: string;
  origin: string;
  roastLevel: string;
  totalGrams: number;
  totalRoastedKg: number;
  requiredGreenKg: number;
  bags250g: number;
  bags500g: number;
  bags1kg: number;
  grindCounts: Record<string, number>;
  orderIds: string[];
}

export const RoastBatchQueue: React.FC<RoastBatchQueueProps> = ({
  orders,
  batches,
  onStartRoastBatch,
  onUpdateBatchStatus,
  className,
}) => {
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Thursday'>('Monday');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // 1. Compute pending orders
  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'Pending');
  }, [orders]);

  // 2. Aggregate roasting requirements by bean varietal across all pending orders
  const aggregatedRequirements = useMemo(() => {
    const map = new Map<string, BeanRequirement>();

    for (const order of pendingOrders) {
      for (const item of order.items) {
        const key = item.productId || item.name;
        if (!map.has(key)) {
          map.set(key, {
            productId: item.productId,
            name: item.name,
            origin: item.origin,
            roastLevel: item.roastLevel,
            totalGrams: 0,
            totalRoastedKg: 0,
            requiredGreenKg: 0,
            bags250g: 0,
            bags500g: 0,
            bags1kg: 0,
            grindCounts: {},
            orderIds: [],
          });
        }

        const req = map.get(key)!;
        const itemGrams = (item.weightGrams || 250) * item.quantity;
        req.totalGrams += itemGrams;

        // Bag counts
        if (item.weight === '250g' || item.weightGrams === 250) {
          req.bags250g += item.quantity;
        } else if (item.weight === '500g' || item.weightGrams === 500) {
          req.bags500g += item.quantity;
        } else if (item.weight === '1kg' || item.weightGrams === 1000) {
          req.bags1kg += item.quantity;
        } else {
          req.bags250g += item.quantity;
        }

        // Grind counts
        const grind = item.grind || 'Whole Bean';
        req.grindCounts[grind] = (req.grindCounts[grind] || 0) + item.quantity;

        // Order tracking
        if (!req.orderIds.includes(order.id)) {
          req.orderIds.push(order.id);
        }
      }
    }

    // Calculate kg and green requirements (15% standard shrinkage)
    const list = Array.from(map.values()).map((req) => {
      const roastedKg = Number((req.totalGrams / 1000).toFixed(2));
      const greenKg = Number((roastedKg / 0.85).toFixed(2));
      return {
        ...req,
        totalRoastedKg: roastedKg,
        requiredGreenKg: greenKg,
      };
    });

    return list;
  }, [pendingOrders]);

  // Total pending roasted kg across all beans
  const totalPendingRoastedKg = useMemo(() => {
    return Number(
      aggregatedRequirements.reduce((sum, r) => sum + r.totalRoastedKg, 0).toFixed(2)
    );
  }, [aggregatedRequirements]);

  const totalPendingGreenKg = useMemo(() => {
    return Number((totalPendingRoastedKg / 0.85).toFixed(2));
  }, [totalPendingRoastedKg]);

  const handleStartBatch = (day: 'Monday' | 'Thursday') => {
    const assignedIds = pendingOrders.map((o) => o.id);
    if (assignedIds.length === 0) return;

    onStartRoastBatch?.(day, assignedIds);
    setSuccessNotice(
      `Roast batch for ${day} triggered! ${assignedIds.length} orders updated from 'Pending' to 'Roasting'.`
    );
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  return (
    <div className={cn('space-y-6 font-sans', className)}>
      {/* Success Notification Banner */}
      {successNotice && (
        <div
          data-testid="batch-success-notice"
          className="p-4 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl flex items-center justify-between gap-4 text-emerald-800 dark:text-emerald-300 animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-semibold">{successNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Roasting Batch Trigger & Aggregated Summary Banner */}
      <div className="bg-surface rounded-xl border border-border-subtle p-6 shadow-card space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-terracotta-500 animate-pulse" />
              <h2 className="font-serif text-xl font-bold text-espresso-950">
                Pending Roasting Demand &amp; Batch Scheduler
              </h2>
            </div>
            <p className="text-xs text-charcoal-500 font-sans mt-1">
              Aggregated roasting weight requirements grouped by single-origin and blend varietals.
            </p>
          </div>

          {/* One-Click Batch Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              data-testid="trigger-monday-batch"
              variant="primary"
              size="md"
              leftIcon={<Play className="w-4 h-4" />}
              disabled={pendingOrders.length === 0}
              onClick={() => handleStartBatch('Monday')}
              className="text-xs"
            >
              Start Monday Roast Batch ({totalPendingRoastedKg} kg)
            </Button>
            <Button
              data-testid="trigger-thursday-batch"
              variant="secondary"
              size="md"
              leftIcon={<Calendar className="w-4 h-4 text-cream-400" />}
              disabled={pendingOrders.length === 0}
              onClick={() => handleStartBatch('Thursday')}
              className="text-xs"
            >
              Start Thursday Roast Batch ({totalPendingRoastedKg} kg)
            </Button>
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-canvas rounded-lg border border-border-subtle">
            <span className="text-[11px] font-bold uppercase text-charcoal-500">
              Pending Orders in Queue
            </span>
            <div className="font-serif text-2xl font-bold text-espresso-950 mt-1">
              {pendingOrders.length}
            </div>
            <p className="text-[10px] text-charcoal-400">Awaiting roastmaster dispatch</p>
          </div>

          <div className="p-3.5 bg-canvas rounded-lg border border-border-subtle">
            <span className="text-[11px] font-bold uppercase text-charcoal-500">
              Total Roasted Yield Needed
            </span>
            <div className="font-serif text-2xl font-bold text-terracotta-600 mt-1">
              {totalPendingRoastedKg} <span className="text-xs font-normal">kg</span>
            </div>
            <p className="text-[10px] text-charcoal-400">Finished roasted beans</p>
          </div>

          <div className="p-3.5 bg-canvas rounded-lg border border-border-subtle">
            <span className="text-[11px] font-bold uppercase text-charcoal-500">
              Raw Green Coffee Required
            </span>
            <div className="font-serif text-2xl font-bold text-olive-700 mt-1">
              {totalPendingGreenKg} <span className="text-xs font-normal">kg</span>
            </div>
            <p className="text-[10px] text-charcoal-400">Includes 15% moisture loss</p>
          </div>

          <div className="p-3.5 bg-canvas rounded-lg border border-border-subtle">
            <span className="text-[11px] font-bold uppercase text-charcoal-500">
              Distinct Micro-Lots
            </span>
            <div className="font-serif text-2xl font-bold text-espresso-950 mt-1">
              {aggregatedRequirements.length}
            </div>
            <p className="text-[10px] text-charcoal-400">Individual roast profiles</p>
          </div>
        </div>
      </div>

      {/* Aggregated Bean Requirements Table */}
      <div className="bg-surface rounded-xl border border-border-subtle shadow-card overflow-hidden">
        <div className="p-4 border-b border-border-subtle bg-canvas/60 flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-espresso-950 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-terracotta-500" /> Aggregated Roasting Requirements by
            Varietal
          </h3>
          <span className="text-xs text-charcoal-500 font-mono">
            {aggregatedRequirements.length} Active Varietals
          </span>
        </div>

        {aggregatedRequirements.length === 0 ? (
          <div className="p-12 text-center text-charcoal-500 font-sans">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-sm text-espresso-900">
              All Orders Roasted &amp; Dispatched!
            </p>
            <p className="text-xs text-charcoal-500 mt-0.5">
              No pending orders are currently awaiting batch scheduling.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs" data-testid="roast-requirements-table">
              <thead>
                <tr className="bg-canvas border-b border-border-subtle text-charcoal-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Coffee Bean &amp; Profile</th>
                  <th className="py-3 px-4">Target Roasted (kg)</th>
                  <th className="py-3 px-4">Green Raw (kg)</th>
                  <th className="py-3 px-4">Bag Breakdown</th>
                  <th className="py-3 px-4">Grind Setting Breakdown</th>
                  <th className="py-3 px-4">Assigned Orders</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-subtle">
                {aggregatedRequirements.map((req) => (
                  <tr
                    key={req.productId}
                    data-testid={`batch-req-${req.productId}`}
                    className="hover:bg-cream-500/40 transition-colors"
                  >
                    {/* Bean & Profile */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-espresso-950">{req.name}</div>
                      <div className="text-[11px] text-charcoal-500">
                        {req.origin} • Roast: {req.roastLevel}
                      </div>
                    </td>

                    {/* Target Roasted */}
                    <td className="py-3.5 px-4 font-mono font-bold text-espresso-950 text-sm whitespace-nowrap">
                      {req.totalRoastedKg} kg
                    </td>

                    {/* Green Raw */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-olive-700 whitespace-nowrap">
                      {req.requiredGreenKg} kg
                    </td>

                    {/* Bags Breakdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                        {req.bags250g > 0 && (
                          <span className="px-1.5 py-0.5 bg-cream-600 text-espresso-900 rounded font-semibold">
                            {req.bags250g}x 250g
                          </span>
                        )}
                        {req.bags500g > 0 && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">
                            {req.bags500g}x 500g
                          </span>
                        )}
                        {req.bags1kg > 0 && (
                          <span className="px-1.5 py-0.5 bg-terracotta-100 text-terracotta-800 rounded font-semibold">
                            {req.bags1kg}x 1kg
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Grind Setting Breakdown */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        {Object.entries(req.grindCounts).map(([grind, count]) => (
                          <div key={grind} className="flex items-center gap-1.5 text-charcoal-700">
                            <span className="font-mono font-bold text-espresso-900">{count}x</span>
                            <span>{grind}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Assigned Order IDs */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {req.orderIds.map((id) => (
                          <span
                            key={id}
                            className="px-1.5 py-0.2 bg-cream-600 text-espresso-900 font-mono text-[10px] rounded border border-border-subtle"
                          >
                            #{id.slice(-4)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active & Scheduled Roast Batches */}
      <div className="bg-surface rounded-xl border border-border-subtle shadow-card overflow-hidden">
        <div className="p-4 border-b border-border-subtle bg-canvas/60 flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-espresso-950 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-terracotta-500" /> Active &amp; Scheduled Roast Batches
          </h3>
          <span className="text-xs text-charcoal-500 font-mono">
            {batches.length} Total Batches
          </span>
        </div>

        <div className="divide-y divide-border-subtle">
          {batches.length === 0 ? (
            <div className="p-8 text-center text-charcoal-500 text-xs">
              No historical roast batches recorded yet.
            </div>
          ) : (
            batches.map((batch: any) => {
              const isRoasting = batch.status === 'Roasting';
              const isCompleted = batch.status === 'Completed';

              return (
                <div
                  key={batch.id}
                  data-testid={`batch-item-${batch.id}`}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-cream-500/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-espresso-950 bg-cream-600 px-2 py-0.5 rounded">
                        {batch.id}
                      </span>
                      <span className="font-semibold text-sm text-espresso-950">
                        {batch.coffeeName}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase px-2 py-0.5 rounded border',
                          isRoasting
                            ? 'bg-orange-100 text-orange-800 border-orange-300 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        )}
                      >
                        {batch.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-600 font-sans">
                      <span>Origin: {batch.origin}</span>
                      <span>•</span>
                      <span>Target: {batch.targetRoastedKg} kg roasted</span>
                      <span>•</span>
                      <span>Green: {batch.requiredGreenKg} kg raw</span>
                      <span>•</span>
                      <span>Date: {batch.scheduledDate}</span>
                    </div>

                    {batch.notes && (
                      <p className="text-[11px] text-charcoal-500 italic">
                        Note: {batch.notes}
                      </p>
                    )}
                  </div>

                  {/* Batch Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {batch.status === 'Scheduled' && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Flame className="w-3.5 h-3.5" />}
                        onClick={() => onUpdateBatchStatus?.(batch.id, 'Roasting')}
                        className="text-xs h-7 px-2.5"
                      >
                        Mark Roasting
                      </Button>
                    )}

                    {batch.status === 'Roasting' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        onClick={() => onUpdateBatchStatus?.(batch.id, 'Completed')}
                        className="text-xs h-7 px-2.5"
                      >
                        Complete Roast &amp; QC
                      </Button>
                    )}

                    {batch.status === 'Completed' && (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Ready for Dispatch
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
