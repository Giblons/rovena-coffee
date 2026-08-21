'use client';

import React, { useState, useMemo } from 'react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import {
  CoffeeCard,
  CatalogFilters,
  SearchBar,
  CuppingScoreBadge,
} from '@/components/catalog';
import { SPECIALTY_COFFEE_PRODUCTS } from '@/lib/data/coffees';
import {
  filterAndSortCoffees,
  DEFAULT_FILTER_STATE,
  getAllOrigins,
  getAllProcesses,
  getAllRoastLevels,
  getAllCategories,
} from '@/lib/catalog-filter';
import {
  CatalogFilterState,
  CatalogSortOption,
  RoastLevel,
  ProcessingMethod,
  CoffeeCategory,
} from '@/types/coffee';
import {
  SlidersHorizontal,
  X,
  Coffee,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  SearchX,
} from 'lucide-react';

export default function CatalogPage() {
  const [filters, setFilters] = useState<CatalogFilterState>(DEFAULT_FILTER_STATE);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Available facet options extracted dynamically from dataset
  const availableOrigins = useMemo(() => getAllOrigins(SPECIALTY_COFFEE_PRODUCTS), []);
  const availableProcesses = useMemo(() => getAllProcesses(SPECIALTY_COFFEE_PRODUCTS), []);
  const availableRoastLevels = useMemo(() => getAllRoastLevels(), []);
  const availableCategories = useMemo(() => getAllCategories(), []);

  // Filtered and sorted product list
  const filteredCoffees = useMemo(() => {
    return filterAndSortCoffees(SPECIALTY_COFFEE_PRODUCTS, filters);
  }, [filters]);

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.roastLevels.length > 0) count += filters.roastLevels.length;
    if (filters.processingMethods.length > 0) count += filters.processingMethods.length;
    if (filters.origins.length > 0) count += filters.origins.length;
    if (filters.flavorNotes.length > 0) count += filters.flavorNotes.length;
    if (filters.minScaScore > 80.0) count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters]);

  const handleFilterUpdate = (updated: Partial<CatalogFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTER_STATE);
  };

  const handleTagClick = (tag: string) => {
    // If tag already selected, do nothing; else add to flavorNotes or search query
    if (!filters.flavorNotes.includes(tag)) {
      setFilters((prev) => ({
        ...prev,
        flavorNotes: [...prev.flavorNotes, tag],
      }));
    }
  };

  const removeFilterChip = (type: keyof CatalogFilterState, value?: string) => {
    if (type === 'searchQuery') {
      setFilters((prev) => ({ ...prev, searchQuery: '' }));
    } else if (type === 'minScaScore') {
      setFilters((prev) => ({ ...prev, minScaScore: 80.0 }));
    } else if (type === 'inStockOnly') {
      setFilters((prev) => ({ ...prev, inStockOnly: false }));
    } else if (Array.isArray(filters[type]) && value) {
      setFilters((prev) => ({
        ...prev,
        [type]: (prev[type] as string[]).filter((item) => item !== value),
      }));
    }
  };

  return (
    <div className="py-8 sm:py-12 flex flex-col gap-8">
      {/* Page Header */}
      <section>
        <Container size="xl">
          <div className="flex flex-col gap-3 pb-6 border-b border-subtle">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-terracotta-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <Coffee className="w-4 h-4" />
                  <span>Fresh Harvest Catalog</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-espresso-950">
                  Specialty Coffee Collection
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="terracotta" size="md">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  <span>Roast-to-Order Dispatch</span>
                </Badge>
              </div>
            </div>
            <p className="text-sm text-charcoal-600 max-w-2xl">
              Browse single-origin micro-lots, competition-grade varietals, and calibrated house blends. Sourced via direct trade and roasted to order for peak aromatic expression.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Catalog View: Controls & Grid */}
      <section>
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filter Sidebar (1 Column) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <CatalogFilters
                  filters={filters}
                  onFilterChange={handleFilterUpdate}
                  onResetFilters={handleResetFilters}
                  availableOrigins={availableOrigins}
                  availableProcesses={availableProcesses}
                  availableRoastLevels={availableRoastLevels}
                  availableCategories={availableCategories}
                  activeFilterCount={activeFilterCount}
                />
              </div>
            </div>

            {/* Catalog Content (3 Columns) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search & Sort Controls Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-subtle shadow-subtle">
                <div className="flex-1">
                  <SearchBar
                    value={filters.searchQuery}
                    onChange={(searchQuery) => handleFilterUpdate({ searchQuery })}
                    resultCount={filteredCoffees.length}
                  />
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  {/* Mobile Filter Drawer Button */}
                  <Button
                    variant="outline"
                    size="md"
                    className="lg:hidden flex items-center gap-2 border-subtle"
                    onClick={() => setIsMobileDrawerOpen(true)}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-terracotta-500" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-terracotta-500 text-white text-xs font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-charcoal-400 hidden sm:inline" />
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterUpdate({
                          sortBy: e.target.value as CatalogSortOption,
                        })
                      }
                      className="text-xs sm:text-sm font-medium py-2 px-3 rounded-xl bg-surface border border-subtle text-espresso-950 focus:ring-2 focus:ring-terracotta-500 focus:outline-none cursor-pointer"
                      aria-label="Sort coffees by"
                    >
                      <option value="featured">Featured Selection</option>
                      <option value="sca_desc">Cupping Score (High to Low)</option>
                      <option value="price_asc">Price (Low to High)</option>
                      <option value="price_desc">Price (High to Low)</option>
                      <option value="newest">Newest Harvest</option>
                      <option value="name_asc">Name (A – Z)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Removal Chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-charcoal-500 mr-1">
                    Active Filters:
                  </span>

                  {filters.searchQuery.trim() && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-cream-600 text-espresso-950 px-2.5 py-1 rounded-full border border-subtle">
                      Search: &ldquo;{filters.searchQuery}&rdquo;
                      <button
                        type="button"
                        onClick={() => removeFilterChip('searchQuery')}
                        className="hover:text-terracotta-600"
                        aria-label="Remove search filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-terracotta-50 text-terracotta-700 px-2.5 py-1 rounded-full border border-terracotta-200"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeFilterChip('categories', cat)}
                        aria-label={`Remove ${cat} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.roastLevels.map((roast) => (
                    <span
                      key={roast}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200"
                    >
                      Roast: {roast}
                      <button
                        type="button"
                        onClick={() => removeFilterChip('roastLevels', roast)}
                        aria-label={`Remove ${roast} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.processingMethods.map((proc) => (
                    <span
                      key={proc}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-olive-50 text-olive-800 px-2.5 py-1 rounded-full border border-olive-200"
                    >
                      {proc}
                      <button
                        type="button"
                        onClick={() => removeFilterChip('processingMethods', proc)}
                        aria-label={`Remove ${proc} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.origins.map((origin) => (
                    <span
                      key={origin}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-cream-600 text-espresso-950 px-2.5 py-1 rounded-full border border-subtle"
                    >
                      Origin: {origin}
                      <button
                        type="button"
                        onClick={() => removeFilterChip('origins', origin)}
                        aria-label={`Remove ${origin} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.flavorNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-purple-50 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200"
                    >
                      Note: {note}
                      <button
                        type="button"
                        onClick={() => removeFilterChip('flavorNotes', note)}
                        aria-label={`Remove ${note} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.minScaScore > 80.0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-honey-50 text-honey-800 px-2.5 py-1 rounded-full border border-honey-200">
                      Score: &gt;={filters.minScaScore.toFixed(1)}
                      <button
                        type="button"
                        onClick={() => removeFilterChip('minScaScore')}
                        aria-label="Remove score filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.inStockOnly && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                      In-Stock Only
                      <button
                        type="button"
                        onClick={() => removeFilterChip('inStockOnly')}
                        aria-label="Remove in-stock filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-800 underline ml-2 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Product Grid or Empty State */}
              {filteredCoffees.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCoffees.map((coffee) => (
                    <CoffeeCard
                      key={coffee.id}
                      coffee={coffee}
                      onTagClick={handleTagClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-surface rounded-2xl border border-subtle space-y-4">
                  <div className="w-16 h-16 rounded-full bg-cream-600 flex items-center justify-center text-charcoal-400">
                    <SearchX className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="font-serif text-xl font-bold text-espresso-950">
                      No matching micro-lots found
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal-600">
                      Try broadening your search query or resetting active filter facets (roast level, process, or SCA cupping thresholds).
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleResetFilters}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Reset All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Mobile Filter Slide-over Drawer */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Filter Specialty Coffees"
        size="md"
      >
        <div className="p-4">
          <CatalogFilters
            filters={filters}
            onFilterChange={handleFilterUpdate}
            onResetFilters={handleResetFilters}
            availableOrigins={availableOrigins}
            availableProcesses={availableProcesses}
            availableRoastLevels={availableRoastLevels}
            availableCategories={availableCategories}
            activeFilterCount={activeFilterCount}
            isMobileDrawer={true}
            onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
          />
        </div>
      </Drawer>
    </div>
  );
}
