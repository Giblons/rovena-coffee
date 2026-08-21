'use client';

import React from 'react';
import { CoffeeProduct } from '@/types/coffee';
import { Star, ShieldCheck, ThumbsUp, MessageSquare } from 'lucide-react';

interface ProductReviewsProps {
  coffee: CoffeeProduct;
  className?: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ coffee, className = '' }) => {
  const reviews = [
    {
      id: 1,
      author: 'Marcus V.',
      rating: 5,
      date: '2 weeks ago',
      verified: true,
      brewMethod: 'V60 Pour Over',
      comment: `Incredible clarity and aroma. The tasting notes of ${coffee.flavorNotes.slice(0, 2).join(' and ')} are crystal clear when brewed at 94°C on a light ratio (1:16.6). Definitely one of the top micro-lots I have tasted this year.`,
    },
    {
      id: 2,
      author: 'Elena R.',
      rating: 5,
      date: '1 month ago',
      verified: true,
      brewMethod: 'AeroPress Inverted',
      comment: `The sweetness on this coffee is unreal. Roasted to perfection with zero bitterness. The degassing advice was spot on—rested it 7 days and the cup opened up with vibrant florals.`,
    },
    {
      id: 3,
      author: 'David K.',
      rating: 4.8,
      date: '1 month ago',
      verified: true,
      brewMethod: 'Espresso (9-bar)',
      comment: `Rich crema and dynamic acidity. Pulls a bright, sweet shot with pleasant fruit lingering on the palate. Highly recommend the recurring subscription!`,
    },
  ];

  return (
    <div
      className={`rounded-2xl bg-surface border border-subtle p-6 sm:p-8 shadow-card space-y-8 ${className}`}
      data-testid="product-reviews"
    >
      {/* Summary Score Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-xl bg-surface-muted border border-subtle">
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-4xl font-serif font-bold text-primary">
              {coffee.rating.toFixed(2)}
            </span>
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-xs text-muted">
            Based on <strong>{coffee.reviewCount}</strong> verified specialty coffee reviews
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-secondary">
          <span className="px-3 py-1.5 rounded-lg bg-surface border border-subtle">
            ☕ 98% Recommend for Filter
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-surface border border-subtle">
            ⭐ 100% Direct-Trade Transparency
          </span>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <h4 className="text-base font-serif font-bold text-primary flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-terracotta-500" />
          Customer Cupping Notes & Feedback
        </h4>

        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-xl bg-surface border border-subtle shadow-xs space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-primary">{rev.author}</span>
                  {rev.verified && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span>{rev.date}</span>
                </div>
              </div>

              <span className="inline-block text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-surface-muted text-secondary">
                Brewed with: {rev.brewMethod}
              </span>

              <p className="text-xs text-secondary leading-relaxed">{rev.comment}</p>

              <div className="flex items-center gap-1.5 text-[11px] text-muted pt-1">
                <ThumbsUp className="w-3 h-3" />
                <span>Helpful review</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
