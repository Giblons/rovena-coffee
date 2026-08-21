import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SPECIALTY_COFFEE_PRODUCTS, getCoffeeById } from '@/lib/data/coffees';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { ProductBreadcrumbs } from '@/components/product/ProductBreadcrumbs';
import { ProductGallery } from '@/components/product/ProductGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { StockStatusIndicator } from '@/components/product/StockStatusIndicator';
import { ProductDetailTabs } from '@/components/product/ProductDetailTabs';
import { CrossSellCarousel } from '@/components/product/CrossSellCarousel';
import { Flame, MapPin, Sparkles, Star, ShieldCheck, Heart } from 'lucide-react';

interface CoffeePageProps {
  params: {
    slug: string;
  };
}

/**
 * Pre-generate static routes for all 8 specialty coffees at build time.
 */
export async function generateStaticParams() {
  return SPECIALTY_COFFEE_PRODUCTS.map((coffee) => ({
    slug: coffee.id,
  }));
}

/**
 * Generate rich dynamic SEO metadata for each specialty coffee product.
 */
export async function generateMetadata({ params }: CoffeePageProps): Promise<Metadata> {
  const coffee = getCoffeeById(params.slug);

  if (!coffee) {
    return {
      title: 'Specialty Coffee Not Found | Lumina Artisan Roasters',
      description: 'The requested specialty coffee micro-lot could not be found.',
    };
  }

  const primaryNotes = coffee.flavorNotes.slice(0, 3).join(', ');
  const originStr = `${coffee.origin.region}, ${coffee.origin.country}`;

  return {
    title: `${coffee.name} (SCA ${coffee.scaScore}) | Lumina Artisan Coffee Roasters`,
    description: `${coffee.tagline}. Freshly roasted single-origin from ${originStr} (${coffee.origin.altitudeMasl.min}-${coffee.origin.altitudeMasl.max} MASL). Tasting notes: ${primaryNotes}.`,
    keywords: [
      coffee.name,
      coffee.origin.country,
      coffee.process,
      coffee.roastLevel,
      'Specialty Coffee',
      'Direct Trade Coffee',
      'Artisan Coffee Roaster',
      ...coffee.flavorNotes,
      ...coffee.varietals,
    ],
    openGraph: {
      title: `${coffee.name} | SCA ${coffee.scaScore} Specialty Coffee`,
      description: coffee.tagline,
      images: [
        {
          url: coffee.image,
          width: 1200,
          height: 630,
          alt: coffee.name,
        },
      ],
      type: 'website',
    },
  };
}

export default function CoffeeDetailPage({ params }: CoffeePageProps) {
  const coffee = getCoffeeById(params.slug);

  if (!coffee) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas py-8 sm:py-12">
      <Container size="xl" className="space-y-12">
        {/* 1. Breadcrumbs Navigation */}
        <ProductBreadcrumbs coffeeName={coffee.name} category={coffee.category} />

        {/* 2. Top Hero: 2-Column Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Gallery, Badges & Sensory Tags */}
          <div className="lg:col-span-6 space-y-6">
            <ProductGallery coffee={coffee} />

            {/* Flavor Notes Tags Box */}
            <div className="p-5 rounded-2xl bg-surface border border-subtle shadow-card space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
                Cupping Flavor Notes & Aromatics
              </span>

              <div className="flex flex-wrap gap-2">
                {coffee.flavorNotes.map((note) => (
                  <span
                    key={note}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-terracotta-50 text-terracotta-800 dark:bg-terracotta-950/40 dark:text-terracotta-300 border border-terracotta-200 dark:border-terracotta-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Title, Specs, Stock Indicator & Variant Selector */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header Specs & Category */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-terracotta-600 dark:text-terracotta-400">
                  {coffee.category.replace('-', ' ')}
                </span>
                <span className="text-xs text-muted">•</span>
                <span className="text-xs font-medium text-secondary flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-secondary" />
                  {coffee.origin.region}, {coffee.origin.country}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-primary tracking-tight">
                {coffee.name}
              </h1>

              <p className="text-base sm:text-lg text-secondary font-sans italic">
                {coffee.tagline}
              </p>

              {/* Badges & Rating Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Badge variant="sca" scaScore={coffee.scaScore} />
                <Badge variant="roast" roastLevel={coffee.roastLevel} />
                <Badge variant="process" process={coffee.process} />

                <div className="flex items-center gap-1 text-xs font-bold text-primary ml-auto">
                  <div className="flex text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span>{coffee.rating.toFixed(2)}</span>
                  <span className="text-muted font-normal">({coffee.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Live Stock & Roast Dispatch Status Indicator */}
            <StockStatusIndicator
              stockStatus={coffee.stockStatus}
              stockQuantityKg={coffee.stockQuantityKg}
              roastScheduleDays={coffee.roastScheduleDays}
            />

            {/* Interactive Package Weight, Grind & Subscription Variant Selector */}
            <VariantSelector coffee={coffee} />
          </div>
        </div>

        {/* 3. Interactive Multi-Tab Deep Dive Section */}
        <div className="pt-8">
          <ProductDetailTabs coffee={coffee} />
        </div>

        {/* 4. Cross-Sell / You May Also Like Section */}
        <div className="pt-10 border-t border-subtle">
          <CrossSellCarousel
            currentCoffeeId={coffee.id}
            allCoffees={SPECIALTY_COFFEE_PRODUCTS}
          />
        </div>
      </Container>
    </div>
  );
}
