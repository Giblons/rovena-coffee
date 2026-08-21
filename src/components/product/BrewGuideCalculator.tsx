'use client';

import React, { useState, useMemo } from 'react';
import { CoffeeProduct, BrewMethod } from '@/types/coffee';
import {
  BREW_METHODS,
  getBrewMethodConfig,
  computeBrewMetrics,
} from '@/lib/brew-calculator';
import { BrewTimer } from './BrewTimer';
import {
  Thermometer,
  Scale,
  Droplet,
  Coffee,
  Clock,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface BrewGuideCalculatorProps {
  coffee: CoffeeProduct;
  className?: string;
}

export const BrewGuideCalculator: React.FC<BrewGuideCalculatorProps> = ({
  coffee,
  className = '',
}) => {
  // Default to coffee's first recommended brew method or v60
  const initialMethod = (coffee.recommendedBrewMethods?.[0] as BrewMethod) || 'v60';
  const [selectedMethod, setSelectedMethod] = useState<BrewMethod>(initialMethod);

  const activeTemplate = useMemo(() => {
    return getBrewMethodConfig(selectedMethod);
  }, [selectedMethod]);

  const [doseGrams, setDoseGrams] = useState<number>(activeTemplate.defaultDoseGrams || 15);
  const [customRatio, setCustomRatio] = useState<number>(activeTemplate.defaultRatio);

  // When method changes, sync defaults
  const handleMethodChange = (method: BrewMethod) => {
    setSelectedMethod(method);
    const tmpl = getBrewMethodConfig(method);
    setDoseGrams(tmpl.defaultDoseGrams);
    setCustomRatio(tmpl.defaultRatio);
  };

  const metrics = useMemo(() => {
    return computeBrewMetrics(activeTemplate, doseGrams, customRatio);
  }, [activeTemplate, doseGrams, customRatio]);

  const availableMethods: BrewMethod[] = [
    'v60',
    'aeropress',
    'french_press',
    'espresso',
    'cold_brew',
    'chemex',
    'moka_pot',
  ];

  return (
    <div className={`space-y-8 ${className}`} data-testid="brew-guide-calculator">
      {/* 1. Brew Method Navigation Tabs */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-bold text-primary flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-terracotta-500" />
            Select Extraction Method
          </label>
          <span className="text-xs text-muted">
            Recommended for {coffee.name}:{' '}
            <strong className="text-terracotta-600 dark:text-terracotta-400">
              {coffee.recommendedBrewMethods.join(', ').toUpperCase()}
            </strong>
          </span>
        </div>

        <div
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
          role="tablist"
          aria-label="Brew Methods"
        >
          {availableMethods.map((method) => {
            const isSelected = selectedMethod === method;
            const isRecommended = coffee.recommendedBrewMethods.includes(method);
            const tmpl = BREW_METHODS[method];

            return (
              <button
                key={method}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleMethodChange(method)}
                className={`relative shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-terracotta-500 ${
                  isSelected
                    ? 'bg-terracotta-500 text-white border-terracotta-600 shadow-sm'
                    : 'bg-surface text-secondary border-subtle hover:border-medium hover:bg-surface-elevated'
                }`}
              >
                <span>{tmpl.name}</span>
                {isRecommended && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-terracotta-500'
                    }`}
                    title="Recommended for this lot"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Recipe Ratio & Dose Customizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 rounded-2xl bg-surface border border-subtle shadow-card">
        {/* Left Col: Dose and Ratio Sliders */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-primary flex items-center gap-2">
              <Sliders className="w-4 h-4 text-terracotta-500" />
              Extraction Parameter Tuner
            </h4>
            <p className="text-xs text-muted">{activeTemplate.overview}</p>
          </div>

          {/* Coffee Dose Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-secondary" />
                Coffee Dose (Dry Grounds)
              </span>
              <span className="font-mono font-bold text-base text-terracotta-600 dark:text-terracotta-400">
                {doseGrams}g
              </span>
            </div>
            <input
              type="range"
              min={selectedMethod === 'espresso' ? 14 : selectedMethod === 'cold_brew' ? 30 : 10}
              max={selectedMethod === 'espresso' ? 22 : selectedMethod === 'cold_brew' ? 150 : 60}
              step={1}
              value={doseGrams}
              onChange={(e) => setDoseGrams(Number(e.target.value))}
              className="w-full accent-terracotta-500 cursor-pointer h-2 bg-surface-muted rounded-lg"
              aria-label="Coffee Dose in grams"
            />
            <div className="flex justify-between text-[10px] text-muted font-mono">
              <span>{selectedMethod === 'espresso' ? '14g (Single/Double)' : '10g (1 Cup)'}</span>
              <span>{selectedMethod === 'espresso' ? '22g (Triple)' : '60g (Carafe)'}</span>
            </div>
          </div>

          {/* Water:Coffee Ratio Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-secondary" />
                Brew Ratio (Coffee : Water)
              </span>
              <span className="font-mono font-bold text-sm text-primary">
                1 : {customRatio.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={activeTemplate.recommendedRatioRange.min}
              max={activeTemplate.recommendedRatioRange.max}
              step={0.1}
              value={customRatio}
              onChange={(e) => setCustomRatio(Number(e.target.value))}
              className="w-full accent-terracotta-500 cursor-pointer h-2 bg-surface-muted rounded-lg"
              aria-label="Brew Ratio"
            />
            <div className="flex justify-between text-[10px] text-muted font-mono">
              <span>Stronger (1:{activeTemplate.recommendedRatioRange.min})</span>
              <span>Lighter (1:{activeTemplate.recommendedRatioRange.max})</span>
            </div>
          </div>

          {/* Equipment Checklist */}
          <div className="space-y-2 pt-2 border-t border-subtle">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-terracotta-500" />
              Gear Checklist
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-secondary">
              {activeTemplate.equipmentNeeded.map((item, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Col: Calculated Extraction Metrics */}
        <div className="md:col-span-6 flex flex-col justify-between p-5 sm:p-6 rounded-xl bg-surface-muted border border-subtle space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Calculated Recipe Outputs
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Water Target */}
            <div className="p-3.5 rounded-lg bg-surface border border-subtle">
              <span className="text-[11px] font-medium text-muted flex items-center gap-1">
                <Droplet className="w-3 h-3 text-blue-500" /> Total Water
              </span>
              <p className="text-2xl font-serif font-bold text-primary mt-1">
                {metrics.totalWaterGrams}g
              </p>
              <span className="text-[10px] text-secondary font-mono">
                {metrics.totalWaterGrams} ml hot water
              </span>
            </div>

            {/* Estimated Beverage Yield */}
            <div className="p-3.5 rounded-lg bg-surface border border-subtle">
              <span className="text-[11px] font-medium text-muted flex items-center gap-1">
                <Coffee className="w-3 h-3 text-terracotta-500" /> Cup Yield
              </span>
              <p className="text-2xl font-serif font-bold text-primary mt-1">
                ~{metrics.estimatedYieldMl}ml
              </p>
              <span className="text-[10px] text-secondary">Post 2x absorption</span>
            </div>

            {/* Water Temperature */}
            <div className="p-3.5 rounded-lg bg-surface border border-subtle">
              <span className="text-[11px] font-medium text-muted flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-500" /> Water Temp
              </span>
              <p className="text-xl font-serif font-bold text-primary mt-1">
                {activeTemplate.waterTempCelsius}°C
              </p>
              <span className="text-[10px] text-muted font-mono">
                ({activeTemplate.waterTempFahrenheit}°F)
              </span>
            </div>

            {/* Bloom Water */}
            <div className="p-3.5 rounded-lg bg-surface border border-subtle">
              <span className="text-[11px] font-medium text-muted flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" /> Bloom Dose
              </span>
              <p className="text-xl font-serif font-bold text-primary mt-1">
                {metrics.bloomWaterGrams > 0 ? `${metrics.bloomWaterGrams}g` : 'N/A (Direct)'}
              </p>
              <span className="text-[10px] text-muted">3x coffee dose</span>
            </div>
          </div>

          {/* Grind Size Guidance */}
          <div className="p-3 rounded-lg bg-surface border border-subtle text-xs space-y-1">
            <div className="flex justify-between font-bold text-primary">
              <span>Grind Size: {activeTemplate.grindSizeLabel}</span>
              <span className="font-mono text-terracotta-600 dark:text-terracotta-400">
                {activeTemplate.grindMicrons}
              </span>
            </div>
            <p className="text-muted text-[11px]">
              Total expected brew duration: ~{Math.floor(activeTemplate.totalTimeSeconds / 60)}:
              {(activeTemplate.totalTimeSeconds % 60).toString().padStart(2, '0')} min
            </p>
          </div>
        </div>
      </div>

      {/* 3. Step Instructions Table */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-primary flex items-center gap-2">
          <Clock className="w-4 h-4 text-terracotta-500" />
          Step-by-Step Pouring Schedule
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metrics.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-4 rounded-xl bg-surface border border-subtle shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary">
                  Step {step.stepNumber}: {step.title}
                </span>
                <span className="font-mono px-2 py-0.5 rounded bg-surface-muted text-secondary font-semibold">
                  {step.timeLabel}
                </span>
              </div>

              <p className="text-xs text-secondary leading-relaxed">{step.actionDescription}</p>

              {step.techniqueTip && (
                <p className="text-[11px] text-muted italic pt-1 border-t border-subtle">
                  💡 {step.techniqueTip}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Interactive Live Brew Timer Module */}
      <BrewTimer
        template={activeTemplate}
        totalWaterGrams={metrics.totalWaterGrams}
        coffeeDoseGrams={metrics.doseGrams}
      />
    </div>
  );
};
