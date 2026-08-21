'use client';

import React from 'react';
import Link from 'next/link';
import { CoffeeProduct } from '@/types/coffee';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { CuppingScoreBadge } from './CuppingScoreBadge';
import { RoastLevelMeter } from './RoastLevelMeter';
import { TastingNotesTags } from './TastingNotesTags';
import { usePreferences } from '@/context/PreferencesContext';
import { Mountain, Flame, ArrowRight, Eye } from 'lucide-react';

export interface CoffeeCardProps {
  coffee: CoffeeProduct;
  className?: string;
  onTagClick?: (tag: string) => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Ethiopia: '🇪🇹',
  Colombia: '🇨🇴',
  Kenya: '🇰🇪',
  'Costa Rica': '🇨🇷',
  Guatemala: '🇬🇹',
  Indonesia: '🇮🇩',
  'Multi-Origin Blend': '🌍',
};

export const CoffeeCard: React.FC<CoffeeCardProps> = ({
  coffee,
  className,
  onTagClick,
}) => {
  const { t } = usePreferences();

  const flag = COUNTRY_FLAGS[coffee.origin.country] || '☕';
  const isOutOfStock = coffee.stockStatus === 'out_of_stock';
  const isLowStock = coffee.stockStatus === 'low_stock';

  return (
    <Card
      hoverEffect
      className={`group relative flex flex-col justify-between overflow-hidden border border-subtle bg-surface transition-all duration-300 hover:border-terracotta-300 hover:shadow-elevated rounded-2xl ${className || ''}`}
    >
      <div>
        {/* Top Image / Visual Terroir Banner */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-espresso-900 flex items-center justify-center">
          {/* Decorative Terroir Ambient Background */}
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-900/60 to-transparent z-10 opacity-90" />
          
          {/* Subtle Organic Pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e47556_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Floating Badges (SCA Score & Badges) */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
            <CuppingScoreBadge score={coffee.scaScore} size="sm" />
            {coffee.isNewHarvest && (
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-olive-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                New Harvest
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 z-20">
            {isOutOfStock ? (
              <Badge variant="outline" className="bg-espresso-950/80 text-cream-400 border-espresso-700 text-xs">
                Sold Out
              </Badge>
            ) : isLowStock ? (
              <Badge variant="terracotta" className="text-xs">
                Only {coffee.stockQuantityKg}kg Left
              </Badge>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cream-500/90 text-espresso-900 backdrop-blur-sm">
                {coffee.category === 'micro-lot'
                  ? 'Micro-Lot'
                  : coffee.category === 'signature-blend'
                  ? 'Signature Blend'
                  : 'Single Origin'}
              </span>
            )}
          </div>

          {/* Center Title Graphic in Image Area */}
          <div className="relative z-20 px-6 text-center">
            <span className="text-3xl mb-1 block filter drop-shadow">{flag}</span>
            <span className="text-xs font-mono tracking-widest uppercase text-terracotta-300">
              {coffee.origin.country}
            </span>
          </div>

          {/* Bottom Processing Badge & Elevation */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-xs text-cream-300">
            <span className="inline-flex items-center gap-1 font-medium bg-espresso-950/75 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-espresso-800">
              {coffee.process}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-espresso-950/75 px-2 py-1 rounded-lg backdrop-blur-sm border border-espresso-800">
              <Mountain className="w-3 h-3 text-terracotta-400" />
              {coffee.origin.altitudeMasl.min} - {coffee.origin.altitudeMasl.max}m
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Title & Tagline */}
          <div className="space-y-1">
            <Link
              href={`/coffee/${coffee.id}`}
              className="block font-serif text-lg sm:text-xl font-bold text-espresso-950 hover:text-terracotta-600 transition-colors line-clamp-1"
            >
              {coffee.name}
            </Link>
            <p className="text-xs text-charcoal-500 font-sans italic line-clamp-1">
              {coffee.tagline}
            </p>
          </div>

          {/* Roast Meter */}
          <div className="flex items-center justify-between border-y border-subtle/60 py-2.5">
            <span className="text-xs text-charcoal-500 font-medium">Roast Profile</span>
            <RoastLevelMeter level={coffee.roastLevel} size="sm" />
          </div>

          {/* Tasting Note Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider block">
              Sensory Notes
            </span>
            <TastingNotesTags
              notes={coffee.flavorNotes}
              primaryCategory={coffee.primaryFlavorCategory}
              limit={3}
              size="sm"
              onTagClick={onTagClick}
            />
          </div>

          {/* Varietal and Region Snippet */}
          <div className="text-xs text-charcoal-600 space-y-0.5 pt-1">
            <p className="truncate">
              <span className="font-semibold text-espresso-900">Terroir:</span> {coffee.origin.region}
            </p>
            <p className="truncate">
              <span className="font-semibold text-espresso-900">Varietal:</span> {coffee.varietals.slice(0, 2).join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer: Price & CTA */}
      <div className="p-5 sm:p-6 pt-0 border-t border-subtle/40 bg-surface flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-charcoal-400 block font-medium">{t('cta.from')} (250g)</span>
          <span className="font-serif text-lg sm:text-xl font-bold text-espresso-950">
            <Price amount={coffee.basePrice250g} />
          </span>
        </div>

        <Link
          href={`/coffee/${coffee.id}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-terracotta-500 text-white hover:bg-terracotta-600 active:scale-95 transition-all shadow-subtle group-hover:shadow-md"
        >
          <span>View Bean</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
};
