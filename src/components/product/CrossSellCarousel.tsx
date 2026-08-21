'use client';

import React from 'react';
import Link from 'next/link';
import { CoffeeProduct } from '@/types/coffee';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight, Coffee, Sparkles } from 'lucide-react';

interface CrossSellCarouselProps {
  currentCoffeeId: string;
  allCoffees: CoffeeProduct[];
  className?: string;
}

export const CrossSellCarousel: React.FC<CrossSellCarouselProps> = ({
  currentCoffeeId,
  allCoffees,
  className = '',
}) => {
  // Pick up to 3 complementary coffees
  const recommendations = allCoffees
    .filter((c) => c.id !== currentCoffeeId)
    .slice(0, 3);

  if (recommendations.length === 0) return null;

  return (
    <div className={`space-y-6 ${className}`} data-testid="cross-sell-carousel">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-serif font-bold text-primary">You May Also Like</h3>
          <p className="text-xs text-muted">
            Explore other exceptional micro-lots and artisan roastery favorites
          </p>
        </div>

        <Link
          href="/catalog"
          className="text-xs font-bold text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 flex items-center gap-1 group"
        >
          View Full Catalog
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.map((item) => (
          <Link
            key={item.id}
            href={`/coffee/${item.id}`}
            className="group block rounded-2xl bg-surface border border-subtle p-5 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
          >
            {/* Visual Header */}
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-surface-muted mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-espresso-800 to-espresso-950 flex flex-col items-center justify-center p-4 text-white text-center">
                <Coffee className="w-8 h-8 text-cream-400 mb-1 opacity-80" />
                <span className="text-[11px] font-bold text-cream-300 uppercase tracking-wider">
                  {item.origin.country}
                </span>
                <span className="text-sm font-serif font-bold text-white line-clamp-1">
                  {item.name}
                </span>
              </div>

              <div className="absolute top-2.5 left-2.5">
                <Badge variant="sca" scaScore={item.scaScore} />
              </div>

              {item.isNewHarvest && (
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-terracotta-500 text-white flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Fresh
                  </span>
                </div>
              )}
            </div>

            {/* Content info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="process" process={item.process} />
                <Badge variant="roast" roastLevel={item.roastLevel} />
              </div>

              <h4 className="text-base font-serif font-bold text-primary group-hover:text-terracotta-600 transition-colors line-clamp-1">
                {item.name}
              </h4>

              <p className="text-xs text-muted line-clamp-1">{item.tagline}</p>

              {/* Flavor tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {item.flavorNotes.slice(0, 3).map((note) => (
                  <span
                    key={note}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-muted text-secondary"
                  >
                    {note}
                  </span>
                ))}
              </div>

              {/* Price Row */}
              <div className="flex items-center justify-between pt-3 border-t border-subtle text-xs">
                <span className="text-muted">From 250g</span>
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(item.basePrice250g)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
