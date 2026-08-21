import {
  CoffeeProduct,
  CatalogFilterState,
  RoastLevel,
  ProcessingMethod,
  CoffeeCategory,
} from '@/types/coffee';

export const DEFAULT_FILTER_STATE: CatalogFilterState = {
  searchQuery: '',
  categories: [],
  roastLevels: [],
  processingMethods: [],
  origins: [],
  flavorNotes: [],
  minScaScore: 80.0,
  maxPrice: 100.0,
  minPrice: 0.0,
  inStockOnly: false,
  sortBy: 'featured',
};

export function filterAndSortCoffees(
  coffees: CoffeeProduct[],
  filterState: CatalogFilterState
): CoffeeProduct[] {
  return coffees
    .filter((coffee) => {
      // 1. Text Search (Fuzzy multi-attribute, case-insensitive)
      const query = filterState.searchQuery ? filterState.searchQuery.trim().toLowerCase() : '';
      if (query.length > 0) {
        const matchesName = coffee.name.toLowerCase().includes(query);
        const matchesCountry = coffee.origin.country.toLowerCase().includes(query);
        const matchesRegion = coffee.origin.region.toLowerCase().includes(query);
        const matchesFarm = coffee.origin.farmOrCoop.toLowerCase().includes(query);
        const matchesProducer = coffee.origin.producer?.toLowerCase().includes(query) ?? false;
        const matchesNotes = coffee.flavorNotes.some((n) => n.toLowerCase().includes(query));
        const matchesVarietal = coffee.varietals.some((v) => v.toLowerCase().includes(query));
        const matchesProcess = coffee.process.toLowerCase().includes(query);
        const matchesTagline = coffee.tagline.toLowerCase().includes(query);
        const matchesPrimaryCategory = coffee.primaryFlavorCategory.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesCountry &&
          !matchesRegion &&
          !matchesFarm &&
          !matchesProducer &&
          !matchesNotes &&
          !matchesVarietal &&
          !matchesProcess &&
          !matchesTagline &&
          !matchesPrimaryCategory
        ) {
          return false;
        }
      }

      // 2. Category Filter
      if (filterState.categories && filterState.categories.length > 0) {
        if (!filterState.categories.includes(coffee.category)) {
          return false;
        }
      }

      // 3. Roast Level Filter
      if (filterState.roastLevels && filterState.roastLevels.length > 0) {
        if (!filterState.roastLevels.includes(coffee.roastLevel)) {
          return false;
        }
      }

      // 4. Processing Method Filter
      if (filterState.processingMethods && filterState.processingMethods.length > 0) {
        if (!filterState.processingMethods.includes(coffee.process)) {
          return false;
        }
      }

      // 5. Origin Country Filter
      if (filterState.origins && filterState.origins.length > 0) {
        if (!filterState.origins.includes(coffee.origin.country)) {
          return false;
        }
      }

      // 6. Flavor Note Tags Filter
      if (filterState.flavorNotes && filterState.flavorNotes.length > 0) {
        const hasMatchingNote = filterState.flavorNotes.some((selectedNote) =>
          coffee.flavorNotes.some((note) => note.toLowerCase() === selectedNote.toLowerCase())
        );
        if (!hasMatchingNote) {
          return false;
        }
      }

      // 7. SCA Cupping Score Filter
      if (typeof filterState.minScaScore === 'number') {
        if (coffee.scaScore < filterState.minScaScore) {
          return false;
        }
      }

      // 8. Price Range Filter
      if (typeof filterState.minPrice === 'number') {
        if (coffee.basePrice250g < filterState.minPrice) {
          return false;
        }
      }
      if (typeof filterState.maxPrice === 'number') {
        if (coffee.basePrice250g > filterState.maxPrice) {
          return false;
        }
      }

      // 9. In Stock Only Toggle
      if (filterState.inStockOnly && coffee.stockStatus === 'out_of_stock') {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filterState.sortBy) {
        case 'sca_desc':
          return b.scaScore - a.scaScore;
        case 'price_asc':
          return a.basePrice250g - b.basePrice250g;
        case 'price_desc':
          return b.basePrice250g - a.basePrice250g;
        case 'newest':
          if (b.isNewHarvest === a.isNewHarvest) {
            return b.scaScore - a.scaScore;
          }
          return (b.isNewHarvest ? 1 : 0) - (a.isNewHarvest ? 1 : 0);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'featured':
        default:
          if (b.isFeatured === a.isFeatured) {
            return b.scaScore - a.scaScore;
          }
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
}

export function getAllOrigins(coffees: CoffeeProduct[]): string[] {
  const origins = Array.from(new Set(coffees.map((c) => c.origin.country)));
  return origins.sort();
}

export function getAllFlavorNotes(coffees: CoffeeProduct[]): string[] {
  const notes = Array.from(new Set(coffees.flatMap((c) => c.flavorNotes)));
  return notes.sort();
}

export function getAllProcesses(coffees: CoffeeProduct[]): ProcessingMethod[] {
  const processes = Array.from(new Set(coffees.map((c) => c.process)));
  return processes;
}

export function getAllRoastLevels(): RoastLevel[] {
  return ['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];
}

export function getAllCategories(): CoffeeCategory[] {
  return ['micro-lot', 'single-origin', 'signature-blend'];
}

export function getPriceBounds(coffees: CoffeeProduct[]): { min: number; max: number } {
  if (coffees.length === 0) return { min: 0, max: 100 };
  const prices = coffees.map((c) => c.basePrice250g);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}
