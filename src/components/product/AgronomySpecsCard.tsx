'use client';

import React from 'react';
import { CoffeeProduct } from '@/types/coffee';
import { Badge } from '@/components/ui/Badge';
import {
  MapPin,
  Mountain,
  Leaf,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface AgronomySpecsCardProps {
  coffee: CoffeeProduct;
  className?: string;
}

export const AgronomySpecsCard: React.FC<AgronomySpecsCardProps> = ({
  coffee,
  className = '',
}) => {
  const { origin, altitudeMasl, harvestSeason } = {
    origin: coffee.origin,
    altitudeMasl: coffee.origin.altitudeMasl,
    harvestSeason: coffee.origin.harvestSeason || 'Seasonal Direct Crop',
  };

  const avgAltitude = Math.round((altitudeMasl.min + altitudeMasl.max) / 2);
  const altitudeTier =
    avgAltitude >= 1900
      ? 'Ultra-Alpine Micro-Lot (>1,900 MASL)'
      : avgAltitude >= 1600
      ? 'High Altitude Terroir (1,600–1,900 MASL)'
      : 'Mid-High Highlands';

  return (
    <div
      className={`rounded-2xl bg-surface border border-subtle p-6 sm:p-8 shadow-card space-y-8 ${className}`}
      data-testid="agronomy-specs-card"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle pb-4">
        <div>
          <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
            <Mountain className="w-5 h-5 text-terracotta-500" />
            Agronomy & Direct-Trade Sourcing
          </h3>
          <p className="text-xs text-muted">
            100% transparent origin traceability & botanical specifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="process" process={coffee.process} />
          <Badge variant="sca" scaScore={coffee.scaScore} />
        </div>
      </div>

      {/* Primary Agronomy Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 1. Terroir & Origin */}
        <div className="p-4 rounded-xl bg-surface-muted border border-subtle space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
            Terroir & Region
          </span>
          <p className="text-base font-serif font-bold text-primary">
            {origin.region}, {origin.country}
          </p>
          <p className="text-xs text-secondary">{origin.farmOrCoop}</p>
          {origin.producer && (
            <p className="text-xs text-muted">Producer: {origin.producer}</p>
          )}
        </div>

        {/* 2. MASL Elevation Gauge */}
        <div className="p-4 rounded-xl bg-surface-muted border border-subtle space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-olive-600 dark:text-olive-400" />
            Altitude / Elevation
          </span>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-serif font-bold text-primary">
              {altitudeMasl.min.toLocaleString()} – {altitudeMasl.max.toLocaleString()}
            </p>
            <span className="text-xs font-mono font-semibold text-secondary">MASL</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-subtle">
            <div
              className="bg-gradient-to-r from-olive-500 to-terracotta-500 h-full rounded-full"
              style={{
                width: `${Math.min(100, Math.max(20, (avgAltitude / 2300) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-muted font-medium">{altitudeTier}</p>
        </div>

        {/* 3. Botanical Varietals */}
        <div className="p-4 rounded-xl bg-surface-muted border border-subtle space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Botanical Varietals
          </span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {coffee.varietals.map((varietal) => (
              <span
                key={varietal}
                className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-subtle text-primary"
              >
                {varietal}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted">
            Dense high-altitude bean cell structure with high sucrose density
          </p>
        </div>

        {/* 4. Processing Details */}
        <div className="p-4 rounded-xl bg-surface-muted border border-subtle space-y-1.5 sm:col-span-2 lg:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Fermentation & Processing Method
          </span>
          <p className="text-sm font-bold text-primary">{coffee.process}</p>
          <p className="text-xs text-secondary leading-relaxed">{coffee.processDescription}</p>
        </div>

        {/* 5. Harvest Season */}
        <div className="p-4 rounded-xl bg-surface-muted border border-subtle space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            Harvest Timeline
          </span>
          <p className="text-sm font-bold text-primary">{harvestSeason}</p>
          <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            {coffee.isNewHarvest ? 'Fresh New Harvest Arrival' : 'Direct-Shipment In Stock'}
          </div>
        </div>
      </div>

      {/* Sourcing Transparency & Ethical Economics Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-terracotta-50/50 via-cream-500 to-cream-400 dark:from-espresso-900/60 dark:to-espresso-950 border border-terracotta-200 dark:border-espresso-700 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-terracotta-600 dark:text-terracotta-400" />
            <h4 className="text-base font-serif font-bold text-primary">
              Direct-Trade Economics & Transparency
            </h4>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            +160% Above C-Market Benchmark
          </span>
        </div>

        <p className="text-xs text-secondary leading-relaxed">
          We bypass commodity supply chains to work directly with {origin.producer || origin.farmOrCoop}.
          By paying sustainable premium prices ($4.20 – $6.80/lb FOB export), we ensure long-term farm
          resilience, fair living wages for harvest pickers, and ongoing investment in sustainable
          mountain washing stations.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-surface/80 dark:bg-surface-dark border border-subtle">
            <span className="text-[10px] text-muted uppercase font-bold">FOB Price Paid</span>
            <p className="text-base font-bold text-primary mt-0.5">$5.20 / lb</p>
          </div>

          <div className="p-3 rounded-lg bg-surface/80 dark:bg-surface-dark border border-subtle">
            <span className="text-[10px] text-muted uppercase font-bold">C-Market Benchmark</span>
            <p className="text-base font-bold text-muted line-through mt-0.5">$2.10 / lb</p>
          </div>

          <div className="p-3 rounded-lg bg-surface/80 dark:bg-surface-dark border border-subtle">
            <span className="text-[10px] text-muted uppercase font-bold">Community Fund</span>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              2% Revenue
            </p>
          </div>

          <div className="p-3 rounded-lg bg-surface/80 dark:bg-surface-dark border border-subtle">
            <span className="text-[10px] text-muted uppercase font-bold">Roast Profiling</span>
            <p className="text-base font-bold text-primary mt-0.5">
              Agtron #{coffee.agtronRoastNumber || 68}
            </p>
          </div>
        </div>
      </div>

      {/* Degassing & Resting Recommendations */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-muted border border-subtle text-xs">
        <Flame className="w-4 h-4 text-terracotta-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-primary">
            Recommended Degassing Resting Period
          </span>
          <p className="text-secondary">
            Filter brewing: Rest for <strong>{coffee.recommendedDegasDays.filter} days</strong> post-roast date.
            Espresso machine: Rest for <strong>{coffee.recommendedDegasDays.espresso} days</strong> to allow excess
            CO2 to stabilize for optimal crema flow and sweetness.
          </p>
        </div>
      </div>
    </div>
  );
};
