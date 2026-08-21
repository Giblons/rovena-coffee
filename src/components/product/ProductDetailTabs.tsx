'use client';

import React from 'react';
import { CoffeeProduct } from '@/types/coffee';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { BrewGuideCalculator } from './BrewGuideCalculator';
import { AgronomySpecsCard } from './AgronomySpecsCard';
import { ProductReviews } from './ProductReviews';
import { FlavorRadarChart } from './FlavorRadarChart';
import { BookOpen, Coffee, Mountain, MessageSquare, Quote, Award } from 'lucide-react';

interface ProductDetailTabsProps {
  coffee: CoffeeProduct;
  className?: string;
}

export const ProductDetailTabs: React.FC<ProductDetailTabsProps> = ({
  coffee,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`} data-testid="product-detail-tabs">
      <Tabs defaultValue="story" className="w-full">
        {/* Tab Switcher */}
        <div className="border-b border-subtle overflow-x-auto">
          <TabsList variant="underline" className="gap-4 sm:gap-8">
            <TabsTrigger
              value="story"
              variant="underline"
              className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 text-terracotta-500" />
              Overview & Roaster Story
            </TabsTrigger>

            <TabsTrigger
              value="brew"
              variant="underline"
              className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Coffee className="w-4 h-4 text-terracotta-500" />
              Interactive Brew Guide & Timer
            </TabsTrigger>

            <TabsTrigger
              value="agronomy"
              variant="underline"
              className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Mountain className="w-4 h-4 text-terracotta-500" />
              Agronomy & Terroir Sourcing
            </TabsTrigger>

            <TabsTrigger
              value="reviews"
              variant="underline"
              className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4 text-terracotta-500" />
              Cupping Reviews ({coffee.reviewCount})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview & Roaster Story */}
        <TabsContent value="story" className="space-y-8 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Story & Terroir Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl bg-surface border border-subtle p-6 sm:p-8 shadow-card space-y-4">
                <div className="flex items-center gap-2 text-terracotta-600 dark:text-terracotta-400">
                  <Quote className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Roaster Cupping Notes & Narrative
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-primary">
                  The Story Behind {coffee.name}
                </h3>

                <p className="text-sm sm:text-base text-secondary leading-relaxed font-sans">
                  {coffee.story}
                </p>

                <div className="pt-4 border-t border-subtle space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Fermentation & Origin Artistry
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    {coffee.processDescription}
                  </p>
                </div>
              </div>

              {/* Roast Philosophy Spotlight */}
              <div className="p-6 rounded-2xl bg-surface-muted border border-subtle space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Award className="w-4 h-4 text-terracotta-500" />
                  Zero-Emissions Convection Roasting
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Roasted exclusively on our single-pass Loring Smart Roaster. Convection thermodynamics
                  preserve volatile esters, highlighting crisp origin acidity and clean sweetness without
                  conductive scorch or bitter astringency.
                </p>
              </div>
            </div>

            {/* Right: Sensory Radar Chart */}
            <div className="lg:col-span-5 space-y-6">
              <FlavorRadarChart profile={coffee.flavorRadar} />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Interactive Brew Guide & Extraction Timer */}
        <TabsContent value="brew" className="pt-4">
          <BrewGuideCalculator coffee={coffee} />
        </TabsContent>

        {/* Tab 3: Agronomy & Direct-Trade Sourcing */}
        <TabsContent value="agronomy" className="pt-4">
          <AgronomySpecsCard coffee={coffee} />
        </TabsContent>

        {/* Tab 4: Customer Cupping Reviews */}
        <TabsContent value="reviews" className="pt-4">
          <ProductReviews coffee={coffee} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
