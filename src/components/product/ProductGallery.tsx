'use client';

import React, { useState } from 'react';
import { CoffeeProduct } from '@/types/coffee';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Coffee, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  coffee: CoffeeProduct;
  className?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ coffee, className = '' }) => {
  const images = coffee.galleryImages && coffee.galleryImages.length > 0
    ? coffee.galleryImages
    : [coffee.image];

  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };

  const getGradientForCategory = (cat: string) => {
    switch (cat) {
      case 'micro-lot':
        return 'from-amber-700/80 via-terracotta-800 to-espresso-950';
      case 'single-origin':
        return 'from-olive-800 via-espresso-900 to-espresso-950';
      case 'signature-blend':
      default:
        return 'from-espresso-800 via-espresso-900 to-espresso-950';
    }
  };

  return (
    <div className={`space-y-4 ${className}`} data-testid="product-gallery">
      {/* Featured Big View */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden bg-surface-muted border border-subtle group shadow-card">
        {/* Fallback Artwork if image fails or not found */}
        {imageError[activeImageIdx] ? (
          <div
            className={`w-full h-full bg-gradient-to-br ${getGradientForCategory(
              coffee.category
            )} flex flex-col items-center justify-center p-8 text-center text-white relative`}
          >
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-xs border border-white/20">
              <Coffee className="w-12 h-12 text-cream-400" />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-cream-300">
              {coffee.origin.country} • {coffee.origin.region}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              {coffee.name}
            </h3>
            <p className="text-xs text-cream-200 mt-2 max-w-xs">{coffee.tagline}</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[activeImageIdx]}
            alt={`${coffee.name} view ${activeImageIdx + 1}`}
            onError={() => handleImageError(activeImageIdx)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
          <Badge variant="sca" scaScore={coffee.scaScore} />
          <Badge variant="roast" roastLevel={coffee.roastLevel} />
          {coffee.isNewHarvest && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-terracotta-500 text-white shadow-xs">
              <Sparkles className="w-3 h-3" /> New Crop
            </span>
          )}
        </div>

        {/* Category Pill Overlay */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-espresso-950/80 text-cream-400 backdrop-blur-xs border border-white/10">
            {coffee.category.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product Images">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={activeImageIdx === idx}
              onClick={() => setActiveImageIdx(idx)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all focus-visible:ring-2 focus-visible:ring-terracotta-500 ${
                activeImageIdx === idx
                  ? 'border-terracotta-500 shadow-md ring-2 ring-terracotta-500/30'
                  : 'border-subtle opacity-70 hover:opacity-100 hover:border-medium'
              }`}
            >
              {imageError[idx] ? (
                <div
                  className={`w-full h-full bg-gradient-to-br ${getGradientForCategory(
                    coffee.category
                  )} flex items-center justify-center text-white text-[10px] font-bold p-1 text-center`}
                >
                  View {idx + 1}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onError={() => handleImageError(idx)}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
