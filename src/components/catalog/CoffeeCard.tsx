'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { CoffeeProduct } from '@/types/coffee';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { CuppingScoreBadge } from './CuppingScoreBadge';
import { RoastLevelMeter } from './RoastLevelMeter';
import { TastingNotesTags } from './TastingNotesTags';
import { usePreferences } from '@/context/PreferencesContext';
import { Mountain, ArrowRight } from 'lucide-react';

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
  const cardRef = useRef<HTMLDivElement>(null);

  const flag = COUNTRY_FLAGS[coffee.origin.country] || '☕';
  const isOutOfStock = coffee.stockStatus === 'out_of_stock';
  const isLowStock = coffee.stockStatus === 'low_stock';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-2px)`;
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = '';
  };

  return (
    <Card
      ref={cardRef}
      hoverEffect={false}
      className={`group relative flex flex-col justify-between overflow-hidden border border-subtle bg-surface rounded-2xl transition-shadow duration-300 hover:shadow-elevated hover:border-bronze-300/50 ${className || ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div>
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-espresso-900">
          <div className="absolute inset-0 bg-gradient-to-br from-espresso-800 via-espresso-900 to-espresso-950" />

          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            <CuppingScoreBadge score={coffee.scaScore} size="sm" />
            {coffee.isNewHarvest && (
              <span className="inline-flex text-[10px] font-bold uppercase tracking-wider bg-bronze-500 text-white px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 z-10">
            {isOutOfStock ? (
              <Badge variant="outline" className="bg-espresso-950/80 text-cream-400 text-xs">
                Sold Out
              </Badge>
            ) : isLowStock ? (
              <Badge variant="terracotta" className="text-xs">
                {coffee.stockQuantityKg}kg left
              </Badge>
            ) : null}
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
            <span className="text-3xl mb-1">{flag}</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bronze-300">
              {coffee.origin.country}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-[11px] text-cream-400">
            <span className="bg-espresso-950/70 px-2 py-1 rounded-md border border-espresso-800">
              {coffee.process}
            </span>
            <span className="inline-flex items-center gap-1 bg-espresso-950/70 px-2 py-1 rounded-md border border-espresso-800 font-mono">
              <Mountain className="w-3 h-3 text-bronze-400" />
              {coffee.origin.altitudeMasl.min}–{coffee.origin.altitudeMasl.max}m
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <Link
              href={`/coffee/${coffee.id}`}
              className="block font-serif text-lg font-bold text-espresso-950 hover:text-bronze-600 transition-colors line-clamp-1"
            >
              {coffee.name}
            </Link>
            <p className="text-xs text-charcoal-500 line-clamp-1 mt-0.5">{coffee.tagline}</p>
          </div>

          <div className="flex items-center justify-between border-y border-subtle/60 py-2">
            <span className="text-[11px] text-charcoal-500">Roast</span>
            <RoastLevelMeter level={coffee.roastLevel} size="sm" />
          </div>

          <TastingNotesTags
            notes={coffee.flavorNotes}
            primaryCategory={coffee.primaryFlavorCategory}
            limit={3}
            size="sm"
            onTagClick={onTagClick}
          />
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-charcoal-400 block">{t('cta.from')} 250g</span>
          <span className="font-serif text-lg font-bold text-espresso-950">
            <Price amount={coffee.basePrice250g} />
          </span>
        </div>
        <Link
          href={`/coffee/${coffee.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-bronze-600 text-white hover:bg-bronze-700 active:scale-[0.97] transition-all"
        >
          View
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};
