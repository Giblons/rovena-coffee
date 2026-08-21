import React from 'react';
import {
  CatalogFilterState,
  RoastLevel,
  ProcessingMethod,
  CoffeeCategory,
} from '@/types/coffee';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RotateCcw, Filter, Flame, Globe2, Sparkles, Check, SlidersHorizontal, X } from 'lucide-react';

export interface CatalogFiltersProps {
  filters: CatalogFilterState;
  onFilterChange: (updated: Partial<CatalogFilterState>) => void;
  onResetFilters: () => void;
  availableOrigins: string[];
  availableProcesses: ProcessingMethod[];
  availableRoastLevels: RoastLevel[];
  availableCategories: CoffeeCategory[];
  activeFilterCount: number;
  className?: string;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableOrigins,
  availableProcesses,
  availableRoastLevels,
  availableCategories,
  activeFilterCount,
  className = '',
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  // Toggle helpers for multi-select arrays
  const toggleArrayItem = <T,>(currentList: T[], item: T): T[] => {
    return currentList.includes(item)
      ? currentList.filter((i) => i !== item)
      : [...currentList, item];
  };

  const categoryLabels: Record<CoffeeCategory, string> = {
    'micro-lot': 'Presidential Micro-Lots',
    'single-origin': 'Single Origin Estate',
    'signature-blend': 'Signature Roastery Blends',
  };

  return (
    <aside
      className={`flex flex-col gap-6 p-5 sm:p-6 rounded-2xl bg-surface border border-subtle ${
        isMobileDrawer ? 'border-none p-0 shadow-none' : 'shadow-subtle'
      } ${className}`}
    >
      {/* Header & Reset CTA */}
      <div className="flex items-center justify-between pb-4 border-b border-subtle">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-terracotta-500" />
          <h2 className="font-serif text-lg font-bold text-espresso-950">Faceted Filters</h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-terracotta-500 text-white">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-600 hover:text-terracotta-800 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          )}

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-1 rounded-lg hover:bg-cream-600 text-charcoal-500"
              aria-label="Close filter drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
          Lot Category
        </h3>
        <div className="space-y-1.5">
          {availableCategories.map((cat) => {
            const isChecked = filters.categories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 text-xs sm:text-sm text-espresso-900 cursor-pointer hover:text-terracotta-600 select-none py-0.5"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    onFilterChange({
                      categories: toggleArrayItem(filters.categories, cat),
                    })
                  }
                  className="rounded border-medium text-terracotta-500 focus:ring-terracotta-500 h-4 w-4"
                />
                <span>{categoryLabels[cat] || cat}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Roast Level */}
      <div className="space-y-3 pt-3 border-t border-subtle/70">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-terracotta-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
            Roast Profile
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {availableRoastLevels.map((roast) => {
            const isChecked = filters.roastLevels.includes(roast);
            return (
              <label
                key={roast}
                className="flex items-center gap-2.5 text-xs sm:text-sm text-espresso-900 cursor-pointer hover:text-terracotta-600 select-none py-0.5"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    onFilterChange({
                      roastLevels: toggleArrayItem(filters.roastLevels, roast),
                    })
                  }
                  className="rounded border-medium text-terracotta-500 focus:ring-terracotta-500 h-4 w-4"
                />
                <span>{roast}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Processing Method */}
      <div className="space-y-3 pt-3 border-t border-subtle/70">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
          Fermentation & Process
        </h3>
        <div className="space-y-1.5">
          {availableProcesses.map((proc) => {
            const isChecked = filters.processingMethods.includes(proc);
            return (
              <label
                key={proc}
                className="flex items-center gap-2.5 text-xs sm:text-sm text-espresso-900 cursor-pointer hover:text-terracotta-600 select-none py-0.5"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    onFilterChange({
                      processingMethods: toggleArrayItem(filters.processingMethods, proc),
                    })
                  }
                  className="rounded border-medium text-terracotta-500 focus:ring-terracotta-500 h-4 w-4"
                />
                <span className="line-clamp-1">{proc}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Origin Countries */}
      <div className="space-y-3 pt-3 border-t border-subtle/70">
        <div className="flex items-center gap-1.5">
          <Globe2 className="w-3.5 h-3.5 text-olive-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
            Origin Country
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {availableOrigins.map((origin) => {
            const isChecked = filters.origins.includes(origin);
            return (
              <label
                key={origin}
                className="flex items-center gap-2.5 text-xs sm:text-sm text-espresso-900 cursor-pointer hover:text-terracotta-600 select-none py-0.5"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    onFilterChange({
                      origins: toggleArrayItem(filters.origins, origin),
                    })
                  }
                  className="rounded border-medium text-terracotta-500 focus:ring-terracotta-500 h-4 w-4"
                />
                <span>{origin}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. SCA Cupping Score Slider */}
      <div className="space-y-3 pt-3 border-t border-subtle/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-honey-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Min SCA Score
            </h3>
          </div>
          <span className="font-mono text-xs font-bold text-espresso-900 bg-cream-600 px-2 py-0.5 rounded">
            {filters.minScaScore.toFixed(1)}+
          </span>
        </div>

        <input
          type="range"
          min="80"
          max="92"
          step="0.5"
          value={filters.minScaScore}
          onChange={(e) => onFilterChange({ minScaScore: parseFloat(e.target.value) })}
          className="w-full h-2 bg-cream-700 rounded-lg appearance-none cursor-pointer accent-terracotta-500"
          aria-label="Minimum SCA Cupping Score"
        />

        <div className="flex justify-between text-[11px] text-charcoal-400 font-mono">
          <span>80.0</span>
          <span>85.0</span>
          <span>89.0</span>
          <span>92.0+</span>
        </div>
      </div>

      {/* 6. In-Stock Only Switch */}
      <div className="pt-3 border-t border-subtle/70">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-xs sm:text-sm font-medium text-espresso-900">
            In-Stock Lots Only
          </span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            className="rounded border-medium text-terracotta-500 focus:ring-terracotta-500 h-4 w-4"
          />
        </label>
      </div>

      {isMobileDrawer && onCloseMobileDrawer && (
        <div className="pt-4 border-t border-subtle">
          <Button
            variant="primary"
            className="w-full"
            onClick={onCloseMobileDrawer}
          >
            Apply Filters
          </Button>
        </div>
      )}
    </aside>
  );
};
