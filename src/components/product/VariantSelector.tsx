'use client';

import React, { useState, useMemo } from 'react';
import { CoffeeProduct, PackageWeight, GrindOption } from '@/types/coffee';
import { SubscriptionFrequency } from '@/types/cart';
import { calculateItemUnitPrice, WEIGHT_OPTIONS, SUBSCRIPTION_DISCOUNT_PERCENT } from '@/lib/pricing';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  ShoppingBag,
  MessageCircle,
  Plus,
  Minus,
  Check,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

interface VariantSelectorProps {
  coffee: CoffeeProduct;
  className?: string;
}

export const GRIND_OPTIONS: Array<{
  id: GrindOption;
  label: string;
  particleSize: string;
  bestFor: string;
}> = [
  {
    id: 'whole_bean',
    label: 'Whole Bean',
    particleSize: 'Unprocessed beans',
    bestFor: 'Home burr grinders & maximum freshness',
  },
  {
    id: 'espresso',
    label: 'Espresso',
    particleSize: '200 – 300 µm',
    bestFor: '9-bar espresso machines & Flair',
  },
  {
    id: 'v60_drip',
    label: 'Pour Over / V60',
    particleSize: '450 – 600 µm',
    bestFor: 'Hario V60, Kalita Wave, Chemex & Batch',
  },
  {
    id: 'aeropress',
    label: 'AeroPress',
    particleSize: '350 – 500 µm',
    bestFor: 'AeroPress (Inverted & Standard recipes)',
  },
  {
    id: 'french_press',
    label: 'French Press',
    particleSize: '850 – 1000 µm',
    bestFor: 'Immersion French Press & Clever Dripper',
  },
  {
    id: 'cold_brew',
    label: 'Cold Brew',
    particleSize: '1100 – 1300 µm',
    bestFor: 'Toddy, Mason Jar & 16-18h cold infusion',
  },
];

export const VariantSelector: React.FC<VariantSelectorProps> = ({ coffee, className = '' }) => {
  const { addItem, toggleCart } = useCart();
  const { toast } = useToast();

  const [selectedWeight, setSelectedWeight] = useState<PackageWeight>('250g');
  const [selectedGrind, setSelectedGrind] = useState<GrindOption>('whole_bean');
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<SubscriptionFrequency>('biweekly');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Dynamic price computations
  const unitPrice = useMemo(() => {
    return calculateItemUnitPrice(coffee.basePrice250g, selectedWeight, isSubscription);
  }, [coffee.basePrice250g, selectedWeight, isSubscription]);

  const oneTimeUnitPrice = useMemo(() => {
    return calculateItemUnitPrice(coffee.basePrice250g, selectedWeight, false);
  }, [coffee.basePrice250g, selectedWeight]);

  const totalVariantPrice = useMemo(() => {
    return Math.round(unitPrice * quantity * 100) / 100;
  }, [unitPrice, quantity]);

  const selectedWeightConfig = useMemo(() => {
    return (
      WEIGHT_OPTIONS.find((w) => w.weight === selectedWeight) || {
        weightGrams: 250,
        weight: '250g' as PackageWeight,
        label: '250g Standard',
        multiplier: 1.0,
        savingsPercentage: 0,
      }
    );
  }, [selectedWeight]);

  const pricePerGram = useMemo(() => {
    return (unitPrice / selectedWeightConfig.weightGrams).toFixed(3);
  }, [unitPrice, selectedWeightConfig.weightGrams]);

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (coffee.stockStatus === 'out_of_stock') return;

    setIsAdding(true);
    addItem({
      productId: coffee.id,
      slug: coffee.id,
      name: coffee.name,
      origin: coffee.origin.country,
      roastLevel: coffee.roastLevel,
      imageUrl: coffee.image,
      weight: selectedWeight,
      weightGrams: selectedWeightConfig.weightGrams,
      grind: selectedGrind,
      basePrice250g: coffee.basePrice250g,
      quantity,
      isSubscription,
      subscriptionFrequency: isSubscription ? frequency : undefined,
    });

    toast.success(
      'Added to Cart',
      `${coffee.name} (${selectedWeight}, ${GRIND_OPTIONS.find((g) => g.id === selectedGrind)?.label})`
    );

    setTimeout(() => {
      setIsAdding(false);
      toggleCart();
    }, 400);
  };

  // Handle WhatsApp Direct Order
  const handleWhatsAppOrder = () => {
    const grindLabel = GRIND_OPTIONS.find((g) => g.id === selectedGrind)?.label || selectedGrind;
    const frequencyLabel =
      frequency === 'weekly'
        ? 'Weekly'
        : frequency === 'biweekly'
        ? 'Bi-Weekly'
        : 'Monthly';

    const waDetails = {
      orderId: `WA-${Date.now().toString().slice(-6)}`,
      customerName: '',
      items: [
        {
          productTitle: coffee.name,
          weightGrams: selectedWeightConfig.weightGrams,
          grindOption: grindLabel,
          quantity,
          unitPrice,
          isSubscription,
          frequency: isSubscription ? frequencyLabel : undefined,
        },
      ],
      subtotal: totalVariantPrice,
      shipping: totalVariantPrice >= 50 ? 0 : 5.0,
      total: totalVariantPrice >= 50 ? totalVariantPrice : totalVariantPrice + 5.0,
      specialInstructions: `Inquiry from Product Detail: ${coffee.name}`,
    };

    const waUrl = generateWhatsAppOrderUrl(waDetails);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`space-y-6 rounded-2xl bg-surface p-6 sm:p-8 border border-subtle shadow-card ${className}`}
      data-testid="variant-selector"
    >
      {/* 1. Dynamic Live Price Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-subtle pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-muted">
            Selected Price
          </span>
          <div className="flex items-baseline gap-2.5">
            <span
              className="text-3xl sm:text-4xl font-serif font-bold text-primary"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatCurrency(unitPrice)}
            </span>
            {isSubscription && (
              <span className="text-base text-muted line-through">
                {formatCurrency(oneTimeUnitPrice)}
              </span>
            )}
            <span className="text-xs font-mono text-secondary bg-surface-muted px-2 py-0.5 rounded">
              ${pricePerGram}/g
            </span>
          </div>
        </div>

        {/* Savings / Subscriber Benefit Badges */}
        <div className="flex flex-col items-end gap-1">
          {isSubscription && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-terracotta-100 text-terracotta-800 border border-terracotta-300 dark:bg-terracotta-900/30 dark:text-terracotta-300">
              <Sparkles className="w-3 h-3 text-terracotta-600" />
              {SUBSCRIPTION_DISCOUNT_PERCENT}% Off Subscribed
            </span>
          )}
          {selectedWeightConfig.savingsPercentage > 0 && (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Save {selectedWeightConfig.savingsPercentage}% vs 250g
            </span>
          )}
        </div>
      </div>

      {/* 2. Package Weight Tier Selector */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-primary flex items-center gap-1.5">
            Package Size (Net Weight)
          </label>
          <span className="text-xs text-muted">Nitrogen-flushed valved pouch</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="radiogroup" aria-label="Package Size">
          {WEIGHT_OPTIONS.map((opt) => {
            const isSelected = selectedWeight === opt.weight;
            const itemPrice = calculateItemUnitPrice(coffee.basePrice250g, opt.weight, isSubscription);
            const isAvailable = coffee.weightOptions.find((w) => w.weight === opt.weight)?.isAvailable ?? true;

            return (
              <button
                key={opt.weight}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!isAvailable}
                onClick={() => isAvailable && setSelectedWeight(opt.weight)}
                className={`relative flex flex-col items-start justify-between p-3.5 rounded-xl border text-left transition-all focus-visible:ring-2 focus-visible:ring-terracotta-500 ${
                  isSelected
                    ? 'border-terracotta-500 bg-terracotta-50/50 dark:bg-terracotta-950/20 shadow-sm ring-1 ring-terracotta-500'
                    : isAvailable
                    ? 'border-subtle bg-surface hover:border-medium hover:bg-surface-elevated'
                    : 'border-subtle bg-surface-muted opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="w-full flex justify-between items-start">
                  <span className={`text-base font-bold ${isSelected ? 'text-terracotta-900 dark:text-terracotta-200' : 'text-primary'}`}>
                    {opt.weight}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-terracotta-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-secondary mt-1">
                  {formatCurrency(itemPrice)}
                </span>

                {opt.savingsPercentage > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    Save {opt.savingsPercentage}%
                  </span>
                )}

                {!isAvailable && (
                  <span className="text-[10px] text-muted uppercase font-semibold mt-1">
                    Sold Out
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Grind Option Selector */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-primary flex items-center gap-1.5">
            Grind Specification
          </label>
          <span className="text-xs text-muted flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Freshly ground on Mahlkönig EK43
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Grind Specification">
          {GRIND_OPTIONS.map((grind) => {
            const isSelected = selectedGrind === grind.id;

            return (
              <button
                key={grind.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedGrind(grind.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all focus-visible:ring-2 focus-visible:ring-terracotta-500 ${
                  isSelected
                    ? 'border-terracotta-500 bg-terracotta-50/40 dark:bg-terracotta-950/20 ring-1 ring-terracotta-500'
                    : 'border-subtle bg-surface hover:border-medium hover:bg-surface-elevated'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-terracotta-500 bg-terracotta-500 text-white' : 'border-medium bg-surface'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </div>

                <div className="space-y-0.5">
                  <p className={`text-sm font-bold leading-none ${isSelected ? 'text-terracotta-900 dark:text-terracotta-200' : 'text-primary'}`}>
                    {grind.label}
                  </p>
                  <p className="text-xs text-secondary font-medium">{grind.bestFor}</p>
                  <p className="text-[11px] text-muted font-mono">{grind.particleSize}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. One-Time vs Recurring Subscription Selector */}
      <div className="space-y-3 pt-2">
        <label className="text-sm font-bold text-primary">Purchase Option</label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* One-Time Radio */}
          <button
            type="button"
            onClick={() => setIsSubscription(false)}
            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
              !isSubscription
                ? 'border-terracotta-500 bg-terracotta-50/30 dark:bg-terracotta-950/20 ring-1 ring-terracotta-500'
                : 'border-subtle bg-surface hover:border-medium'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                !isSubscription ? 'border-terracotta-500 bg-terracotta-500 text-white' : 'border-medium bg-surface'
              }`}
            >
              {!isSubscription && <Check className="w-2.5 h-2.5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-primary">One-Time Order</p>
              <p className="text-xs text-muted">Single artisan roast batch</p>
              <p className="text-sm font-semibold text-primary mt-1">
                {formatCurrency(oneTimeUnitPrice)}
              </p>
            </div>
          </button>

          {/* Subscription Radio */}
          <button
            type="button"
            onClick={() => setIsSubscription(true)}
            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all relative ${
              isSubscription
                ? 'border-terracotta-500 bg-terracotta-50/50 dark:bg-terracotta-950/20 ring-1 ring-terracotta-500'
                : 'border-subtle bg-surface hover:border-medium'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                isSubscription ? 'border-terracotta-500 bg-terracotta-500 text-white' : 'border-medium bg-surface'
              }`}
            >
              {isSubscription && <Check className="w-2.5 h-2.5" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-primary">Subscribe & Save</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-terracotta-500 text-white">
                  10% OFF
                </span>
              </div>
              <p className="text-xs text-muted">Never run out of fresh roast</p>
              <p className="text-sm font-semibold text-terracotta-600 dark:text-terracotta-400">
                {formatCurrency(calculateItemUnitPrice(coffee.basePrice250g, selectedWeight, true))} / order
              </p>
            </div>
          </button>
        </div>

        {/* Subscription Frequency Dropdown / Pill Group */}
        {isSubscription && (
          <div className="p-4 rounded-xl bg-surface-muted border border-subtle space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-semibold text-primary">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-terracotta-500" />
                Delivery Frequency
              </span>
              <span className="text-muted">Pause, skip, or cancel anytime</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {(
                [
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'biweekly', label: 'Bi-Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                ] as const
              ).map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setFrequency(freq.id)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    frequency === freq.id
                      ? 'bg-terracotta-500 text-white border-terracotta-600 shadow-xs'
                      : 'bg-surface text-secondary border-subtle hover:border-medium'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Quantity Stepper & Dual Action Buttons */}
      <div className="space-y-4 pt-2 border-t border-subtle">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-primary">Quantity</span>
          <div className="flex items-center border border-medium rounded-lg bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="p-2.5 text-secondary hover:bg-surface-elevated disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span
              className="w-12 text-center text-sm font-bold text-primary"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              disabled={quantity >= 20}
              aria-label="Increase quantity"
              className="p-2.5 text-secondary hover:bg-surface-elevated disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Add to Cart CTA */}
          <Button
            type="button"
            variant="primary"
            size="lg"
            isLoading={isAdding}
            disabled={coffee.stockStatus === 'out_of_stock'}
            onClick={handleAddToCart}
            leftIcon={<ShoppingBag className="w-5 h-5" />}
            className="w-full justify-center shadow-elevated"
          >
            {coffee.stockStatus === 'out_of_stock'
              ? 'Sold Out'
              : `Add to Bag • ${formatCurrency(totalVariantPrice)}`}
          </Button>

          {/* WhatsApp Direct Order Button */}
          <Button
            type="button"
            variant="whatsapp"
            size="lg"
            onClick={handleWhatsAppOrder}
            leftIcon={<MessageCircle className="w-5 h-5" />}
            className="w-full justify-center text-white"
          >
            Order via WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};
