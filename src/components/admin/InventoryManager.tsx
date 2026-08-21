'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Calculator,
  Flame,
  Leaf,
  Layers,
  CheckCircle,
  Truck,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

export interface InventoryManagerProps {
  inventory: InventoryItem[];
  onRestockGreen?: (productId: string, amountKg: number, lotNumber: string, notes: string) => void;
  onAdjustRoastedStock?: (productId: string, amountKg: number, reason: string) => void;
  className?: string;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  inventory,
  onRestockGreen,
  onAdjustRoastedStock,
  className,
}) => {
  // Restock Modal State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>(
    inventory[0]?.productId || 'ethiopia-yirgacheffe-chelbesa'
  );
  const [restockType, setRestockType] = useState<'green' | 'roasted'>('green');
  const [restockAmount, setRestockAmount] = useState<number>(50);
  const [lotNumber, setLotNumber] = useState<string>('LOT-2026-ETH-9912');
  const [restockNotes, setRestockNotes] = useState<string>(
    'Direct trade micro-lot shipment with phytosanitary clearance.'
  );

  // Shrinkage Calculator State
  const [targetRoastedKg, setTargetRoastedKg] = useState<number>(20);
  const [shrinkageRatePercent, setShrinkageRatePercent] = useState<number>(15.0);

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    return inventory.filter(
      (item) => item.greenStockKg < item.safetyThresholdKg || item.isLowStock
    );
  }, [inventory]);

  // Moisture Calculator Computed Values
  const shrinkageCalculations = useMemo(() => {
    const rate = Math.min(0.4, Math.max(0.05, shrinkageRatePercent / 100));
    const target = Math.max(0.1, targetRoastedKg);
    const requiredGreenKg = Number((target / (1 - rate)).toFixed(2));
    const moistureLossKg = Number((requiredGreenKg - target).toFixed(2));

    const bags250g = Math.floor((target * 1000) / 250);
    const bags500g = Math.floor((target * 1000) / 500);
    const bags1kg = Math.floor((target * 1000) / 1000);

    return {
      target,
      ratePercent: shrinkageRatePercent,
      requiredGreenKg,
      moistureLossKg,
      bags250g,
      bags500g,
      bags1kg,
    };
  }, [targetRoastedKg, shrinkageRatePercent]);

  const handleOpenRestockForBean = (productId: string, type: 'green' | 'roasted' = 'green') => {
    setSelectedProduct(productId);
    setRestockType(type);
    const bean = inventory.find((i) => i.productId === productId);
    const prefix = bean?.origin?.slice(0, 3).toUpperCase() || 'ROAST';
    setLotNumber(`LOT-2026-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsRestockModalOpen(true);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockType === 'green') {
      onRestockGreen?.(selectedProduct, restockAmount, lotNumber, restockNotes);
    } else {
      onAdjustRoastedStock?.(
        selectedProduct,
        restockAmount,
        `Restock lot #${lotNumber}: ${restockNotes}`
      );
    }
    setIsRestockModalOpen(false);
  };

  return (
    <div className={cn('space-y-6 font-sans', className)}>
      {/* Low Stock Warning Banner if any items triggered */}
      {lowStockItems.length > 0 && (
        <div
          data-testid="low-stock-alert-banner"
          className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-amber-900 dark:text-amber-300">
                Green Bean Safety Stock Warning ({lowStockItems.length} Varietal
                {lowStockItems.length > 1 ? 's' : ''} Below Threshold)
              </h3>
              <p className="text-xs text-amber-800/90 dark:text-amber-400 mt-0.5">
                The following green bean micro-lots are below their safe roasting buffer:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockItems.map((item) => (
                  <span
                    key={item.productId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-espresso-900 border border-amber-300 rounded-md text-xs font-semibold text-espresso-950"
                  >
                    <span className="text-amber-600 font-bold">⚠️ {item.beanName || item.name}:</span>
                    <span>{item.greenStockKg} kg</span>
                    <span className="text-[10px] text-charcoal-500">
                      (Min: {item.safetyThresholdKg} kg)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenRestockForBean(item.productId, 'green')}
                      className="ml-1 text-[11px] text-terracotta-600 hover:underline font-bold"
                    >
                      Restock +
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsRestockModalOpen(true)}
            className="shrink-0 text-xs"
          >
            Log Green Restock
          </Button>
        </div>
      )}

      {/* Main Stock Table */}
      <div className="bg-surface rounded-xl border border-border-subtle shadow-card overflow-hidden">
        <div className="p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-canvas/60">
          <div>
            <h3 className="font-serif text-lg font-bold text-espresso-950 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-olive-600" /> Green Coffee & Roasted Bean Inventory
            </h3>
            <p className="text-xs text-charcoal-500 font-sans mt-0.5">
              Live green burlap stock, degassed roasted inventory, and safety threshold alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4 text-espresso-700" />}
              onClick={() => setIsRestockModalOpen(true)}
              className="text-xs"
            >
              Quick Restock
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" data-testid="inventory-table">
            <thead>
              <tr className="bg-canvas border-b border-border-subtle text-charcoal-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Coffee Bean & Origin</th>
                <th className="py-3 px-4">Process & Varietals</th>
                <th className="py-3 px-4">Roast Schedule</th>
                <th className="py-3 px-4 min-w-[200px]">Green Stock vs Safety Threshold</th>
                <th className="py-3 px-4">Roasted Ready (kg)</th>
                <th className="py-3 px-4">Allocated (kg)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-subtle">
              {inventory.map((item) => {
                const isLow = item.greenStockKg < item.safetyThresholdKg;
                const percentOfThreshold = Math.min(
                  100,
                  Math.round((item.greenStockKg / (item.safetyThresholdKg * 2)) * 100)
                );

                return (
                  <tr
                    key={item.productId}
                    data-testid={`inventory-row-${item.productId}`}
                    className="hover:bg-cream-500/40 transition-colors"
                  >
                    {/* Bean & Origin */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-sm text-espresso-950 flex items-center gap-2">
                        <span>{item.beanName || item.name}</span>
                        {isLow && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                            LOW STOCK
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-charcoal-500">Origin: {item.origin}</div>
                    </td>

                    {/* Process & Varietals */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-espresso-900">{item.process}</span>
                      <div className="text-[10px] text-charcoal-400 truncate max-w-[150px]">
                        {item.varietal}
                      </div>
                    </td>

                    {/* Roast Schedule */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-espresso-800">
                        <Flame className="w-3.5 h-3.5 text-terracotta-500" />
                        <span>{item.roastScheduleDays?.join(' & ') || 'Monday'}</span>
                      </div>
                      <span className="text-[10px] text-charcoal-400">
                        Last: {item.lastRoastedDate || 'Recent'}
                      </span>
                    </td>

                    {/* Green Stock Progress Bar vs Threshold */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className={cn(isLow ? 'text-amber-700 font-bold' : 'text-espresso-950')}>
                            {item.greenStockKg} kg green
                          </span>
                          <span className="text-charcoal-500 text-[11px]">
                            Safety: {item.safetyThresholdKg} kg
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2.5 bg-cream-700/60 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full transition-all duration-300 rounded-full',
                              isLow
                                ? 'bg-amber-500 animate-pulse'
                                : item.greenStockKg < item.safetyThresholdKg * 1.5
                                ? 'bg-yellow-500'
                                : 'bg-emerald-600'
                            )}
                            style={{ width: `${percentOfThreshold}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Roasted Ready */}
                    <td className="py-3.5 px-4 font-mono font-bold text-espresso-950 text-sm">
                      {item.roastedStockKg} kg
                    </td>

                    {/* Allocated */}
                    <td className="py-3.5 px-4 font-mono text-charcoal-600">
                      {item.reservedStockKg || item.allocatedKg || 0} kg
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRestockForBean(item.productId, 'green')}
                          className="text-[11px] h-7 px-2"
                        >
                          + Green
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRestockForBean(item.productId, 'roasted')}
                          className="text-[11px] h-7 px-2"
                        >
                          + Roasted
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Green-to-Roasted Moisture Shrinkage Calculator */}
      <div
        data-testid="shrinkage-calculator"
        className="bg-surface rounded-xl border border-border-subtle p-6 shadow-card space-y-5"
      >
        <div className="flex items-start justify-between border-b border-border-subtle pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-espresso-950 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-terracotta-500" /> Green-to-Roasted Moisture
              Shrinkage Calculator
            </h3>
            <p className="text-xs text-charcoal-500 font-sans mt-0.5">
              Calibrate raw green bean charge weight based on roasting moisture loss and target batch
              yield.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-cream-600 rounded-md font-mono text-xs font-bold text-espresso-900">
            Roastmaster Tool
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4 lg:col-span-1 p-4 bg-canvas rounded-lg border border-border-subtle">
            <div>
              <label
                htmlFor="target-roasted-input"
                className="block text-xs font-bold text-espresso-900 uppercase tracking-wider mb-1"
              >
                Target Roasted Output (kg)
              </label>
              <div className="relative">
                <input
                  id="target-roasted-input"
                  type="number"
                  min="1"
                  max="500"
                  step="0.5"
                  value={targetRoastedKg}
                  onChange={(e) => setTargetRoastedKg(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 bg-surface text-espresso-950 font-mono font-bold text-base border border-border-subtle rounded-md focus:ring-2 focus:ring-terracotta-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-charcoal-400">
                  KG
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="shrinkage-rate-slider"
                  className="text-xs font-bold text-espresso-900 uppercase tracking-wider"
                >
                  Moisture Loss / Shrinkage
                </label>
                <span className="text-xs font-mono font-bold text-terracotta-600">
                  {shrinkageRatePercent.toFixed(1)}%
                </span>
              </div>
              <input
                id="shrinkage-rate-slider"
                type="range"
                min="10"
                max="22"
                step="0.5"
                value={shrinkageRatePercent}
                onChange={(e) => setShrinkageRatePercent(parseFloat(e.target.value))}
                className="w-full accent-terracotta-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
                <span>10% (Light)</span>
                <span>15% (Standard)</span>
                <span>22% (Dark Roast)</span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Required Green Bean Charge */}
            <div className="p-4 bg-cream-500 rounded-lg border border-border-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-charcoal-600 font-semibold">
                <span>Required Green Charge</span>
                <Leaf className="w-4 h-4 text-olive-600" />
              </div>
              <div className="my-2">
                <span
                  data-testid="calc-green-required"
                  className="font-serif text-3xl font-bold text-espresso-950"
                >
                  {shrinkageCalculations.requiredGreenKg}
                </span>
                <span className="text-sm font-bold text-charcoal-500 ml-1">kg</span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Raw green beans to weigh for roasting drum.
              </p>
            </div>

            {/* Moisture Loss Weight */}
            <div className="p-4 bg-cream-500 rounded-lg border border-border-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-charcoal-600 font-semibold">
                <span>Moisture Evaporation</span>
                <TrendingDown className="w-4 h-4 text-amber-600" />
              </div>
              <div className="my-2">
                <span
                  data-testid="calc-moisture-loss"
                  className="font-serif text-3xl font-bold text-amber-800"
                >
                  {shrinkageCalculations.moistureLossKg}
                </span>
                <span className="text-sm font-bold text-charcoal-500 ml-1">kg</span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Water weight loss during first & second crack.
              </p>
            </div>

            {/* Packaging Yield Breakdown */}
            <div className="p-4 bg-espresso-950 text-cream-400 rounded-lg border border-espresso-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-cream-500 font-semibold">
                <span>Packaging Yield</span>
                <Layers className="w-4 h-4 text-terracotta-400" />
              </div>
              <div className="space-y-1 my-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span>250g Bags:</span>
                  <strong className="text-white">{shrinkageCalculations.bags250g} bags</strong>
                </div>
                <div className="flex justify-between">
                  <span>500g Bags:</span>
                  <strong className="text-white">{shrinkageCalculations.bags500g} bags</strong>
                </div>
                <div className="flex justify-between">
                  <span>1kg Bags:</span>
                  <strong className="text-white">{shrinkageCalculations.bags1kg} bags</strong>
                </div>
              </div>
              <p className="text-[10px] text-cream-600">
                Estimated packaging bag output at 100% packaging yield.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Restock Modal */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title="Record Inventory Shipment & Restock"
        description="Log new green bean arrivals or roasted batch output into the roastery warehouse."
        size="lg"
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-bold text-espresso-900 mb-1">Select Coffee Micro-Lot</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2.5 border border-border-subtle rounded-md bg-canvas text-espresso-950 font-medium text-xs focus:ring-2 focus:ring-terracotta-500"
            >
              {inventory.map((item) => (
                <option key={item.productId} value={item.productId}>
                  {item.beanName || item.name} ({item.origin}) — Current Green: {item.greenStockKg} kg
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-espresso-900 mb-1">Restock Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRestockType('green')}
                  className={cn(
                    'flex-1 p-2 rounded border text-xs font-semibold flex items-center justify-center gap-1',
                    restockType === 'green'
                      ? 'bg-olive-100 text-olive-800 border-olive-400'
                      : 'bg-canvas text-charcoal-600 border-border-subtle'
                  )}
                >
                  <Leaf className="w-3.5 h-3.5" /> Green Raw
                </button>
                <button
                  type="button"
                  onClick={() => setRestockType('roasted')}
                  className={cn(
                    'flex-1 p-2 rounded border text-xs font-semibold flex items-center justify-center gap-1',
                    restockType === 'roasted'
                      ? 'bg-terracotta-50 text-terracotta-800 border-terracotta-400'
                      : 'bg-canvas text-charcoal-600 border-border-subtle'
                  )}
                >
                  <Flame className="w-3.5 h-3.5" /> Roasted
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="restock-amount-input" className="block font-bold text-espresso-900 mb-1">
                Restock Amount (kg)
              </label>
              <input
                id="restock-amount-input"
                type="number"
                min="1"
                max="5000"
                step="0.5"
                value={restockAmount}
                onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 1)}
                className="w-full p-2 border border-border-subtle rounded-md bg-canvas font-mono font-bold text-espresso-950 focus:ring-2 focus:ring-terracotta-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="lot-number-input" className="block font-bold text-espresso-900 mb-1">
              Shipment Lot Number / Bill of Lading
            </label>
            <input
              id="lot-number-input"
              type="text"
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              className="w-full p-2 border border-border-subtle rounded-md bg-canvas font-mono text-espresso-950 focus:ring-2 focus:ring-terracotta-500"
              required
            />
          </div>

          <div>
            <label htmlFor="restock-notes-input" className="block font-bold text-espresso-900 mb-1">
              Origin &amp; Quality Control Notes
            </label>
            <textarea
              id="restock-notes-input"
              rows={3}
              value={restockNotes}
              onChange={(e) => setRestockNotes(e.target.value)}
              className="w-full p-2 border border-border-subtle rounded-md bg-canvas text-espresso-950 focus:ring-2 focus:ring-terracotta-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRestockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<CheckCircle className="w-4 h-4" />}>
              Save Shipment Lot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
