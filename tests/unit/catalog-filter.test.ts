import { describe, it, expect } from 'vitest';
import { filterAndSortCoffees, DEFAULT_FILTER_STATE } from '@/lib/catalog-filter';
import { SPECIALTY_COFFEE_PRODUCTS } from '@/lib/data/coffees';
import { CatalogFilterState, CoffeeProduct } from '@/types/coffee';

describe('Catalog Filtering & Sorting Engine — Unit Tests (Tier 1 & Tier 2)', () => {
  const sampleCatalog: CoffeeProduct[] = SPECIALTY_COFFEE_PRODUCTS;

  describe('Tier 1: Multi-Criteria Filtering', () => {
    it('should load all 8 specialty coffee products by default', () => {
      expect(sampleCatalog.length).toBe(8);
    });

    it('should filter by Roast Level (Light)', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        roastLevels: ['Light'],
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((c) => {
        expect(c.roastLevel).toBe('Light');
      });
    });

    it('should filter by Multiple Roast Levels (Light, Medium)', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        roastLevels: ['Light', 'Medium'],
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((c) => {
        expect(['Light', 'Medium']).toContain(c.roastLevel);
      });
    });

    it('should filter by Processing Method (Washed, Honey, Thermal Shock, Wet Hulled)', () => {
      const washedFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        processingMethods: ['Washed'],
      };
      const washedResults = filterAndSortCoffees(sampleCatalog, washedFilter);
      expect(washedResults.length).toBeGreaterThan(0);
      washedResults.forEach((c) => expect(c.process).toBe('Washed'));

      const honeyFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        processingMethods: ['Honey / Pulped Natural'],
      };
      const honeyResults = filterAndSortCoffees(sampleCatalog, honeyFilter);
      expect(honeyResults.length).toBe(1);
      expect(honeyResults[0].id).toBe('costa-rica-tarrazu-mozart-honey');
    });

    it('should filter by Origin Country', () => {
      const ethiopiaFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        origins: ['Ethiopia'],
      };
      const results = filterAndSortCoffees(sampleCatalog, ethiopiaFilter);
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('Chelbesa');
      expect(results[0].origin.country).toBe('Ethiopia');
    });

    it('should filter by SCA Cupping Score (e.g. min 89.0, 90.0+)', () => {
      const score89Filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        minScaScore: 89.0,
      };
      const results89 = filterAndSortCoffees(sampleCatalog, score89Filter);
      expect(results89.length).toBeGreaterThan(0);
      results89.forEach((c) => {
        expect(c.scaScore).toBeGreaterThanOrEqual(89.0);
      });

      const score90Filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        minScaScore: 90.0,
      };
      const results90 = filterAndSortCoffees(sampleCatalog, score90Filter);
      expect(results90.length).toBe(2); // Chelbesa (90.5) and El Paraiso (91.5)
      results90.forEach((c) => {
        expect(c.scaScore).toBeGreaterThanOrEqual(90.0);
      });
    });

    it('should filter by Category (micro-lot, single-origin, signature-blend)', () => {
      const microLotFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        categories: ['micro-lot'],
      };
      const results = filterAndSortCoffees(sampleCatalog, microLotFilter);
      expect(results.length).toBe(2);
      results.forEach((c) => expect(c.category).toBe('micro-lot'));
    });

    it('should filter by Flavor Note tags', () => {
      const noteFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        flavorNotes: ['Bergamot'],
      };
      const results = filterAndSortCoffees(sampleCatalog, noteFilter);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('ethiopia-yirgacheffe-chelbesa');
    });
  });

  describe('Tier 1: Search Query Matching (Multi-Attribute)', () => {
    it('should match search query against coffee name (case-insensitive)', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'chelbesa',
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('ethiopia-yirgacheffe-chelbesa');
    });

    it('should match search query against origin country and region', () => {
      const countryFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'Colombia',
      };
      const countryResults = filterAndSortCoffees(sampleCatalog, countryFilter);
      expect(countryResults.length).toBeGreaterThan(0);
      expect(countryResults.some((c) => c.origin.country === 'Colombia')).toBe(true);

      const regionFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'Tarrazú',
      };
      const regionResults = filterAndSortCoffees(sampleCatalog, regionFilter);
      expect(regionResults.length).toBe(1);
      expect(regionResults[0].origin.region).toContain('Tarrazú');
    });

    it('should match search query against varietals (e.g. SL28, Geisha, Castillo, Heirloom)', () => {
      const varietalFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'SL28',
      };
      const results = filterAndSortCoffees(sampleCatalog, varietalFilter);
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('Kenya');
    });

    it('should match search query against tasting notes (e.g. "Peach", "Caramel", "Lychee")', () => {
      const peachFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'Peach',
      };
      const results = filterAndSortCoffees(sampleCatalog, peachFilter);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.flavorNotes.some((n) => n.toLowerCase().includes('peach')))).toBe(true);
    });
  });

  describe('Tier 1: Sorting Algorithms', () => {
    it('should sort by SCA Score descending (sca_desc)', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        sortBy: 'sca_desc',
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].scaScore).toBeGreaterThanOrEqual(results[i + 1].scaScore);
      }
      expect(results[0].scaScore).toBe(91.5); // El Paraiso
    });

    it('should sort by Price ascending (price_asc)', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        sortBy: 'price_asc',
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].basePrice250g).toBeLessThanOrEqual(results[i + 1].basePrice250g);
      }
      expect(results[0].basePrice250g).toBe(17.0); // Velvet Midnight
    });

    it('should sort by Price descending (price_desc)', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        sortBy: 'price_desc',
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].basePrice250g).toBeGreaterThanOrEqual(results[i + 1].basePrice250g);
      }
      expect(results[0].basePrice250g).toBe(26.0); // El Paraiso
    });

    it('should sort by Newest Harvest (newest)', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        sortBy: 'newest',
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      expect(results[0].isNewHarvest).toBe(true);
    });

    it('should sort by Featured status (featured)', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        sortBy: 'featured',
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      expect(results[0].isFeatured).toBe(true);
    });

    it('should sort alphabetically by Name (name_asc)', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        sortBy: 'name_asc',
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].name.localeCompare(results[i + 1].name)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('Tier 2: Boundary Cases & Complex Interactions', () => {
    it('should return all products when search query is empty or whitespace', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: '   ',
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      expect(results.length).toBe(sampleCatalog.length);
    });

    it('should return an empty array when search query matches nothing', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        searchQuery: 'NonExistentBeanXYZ12345',
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      expect(results).toEqual([]);
    });

    it('should handle simultaneous multi-facet filters (Category + Roast + Origin + Score)', () => {
      const filter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        categories: ['micro-lot'],
        roastLevels: ['Light'],
        origins: ['Ethiopia'],
        minScaScore: 90.0,
      };
      const results = filterAndSortCoffees(sampleCatalog, filter);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('ethiopia-yirgacheffe-chelbesa');
      expect(results[0].scaScore).toBe(90.5);
    });

    it('should filter out of stock items when inStockOnly is true', () => {
      const mockCatalogWithOutOfStock: CoffeeProduct[] = [
        ...sampleCatalog,
        {
          ...sampleCatalog[0],
          id: 'rare-geisha-out-of-stock',
          name: 'Sold Out Panama Geisha',
          stockStatus: 'out_of_stock',
        },
      ];

      const inStockFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        inStockOnly: true,
      };
      const results = filterAndSortCoffees(mockCatalogWithOutOfStock, inStockFilter);
      expect(results.some((c) => c.id === 'rare-geisha-out-of-stock')).toBe(false);
    });

    it('should handle price range filter boundaries (minPrice to maxPrice)', () => {
      const priceFilter: CatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        minPrice: 20.0,
        maxPrice: 24.0,
      };
      const results = filterAndSortCoffees(sampleCatalog, priceFilter);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((c) => {
        expect(c.basePrice250g).toBeGreaterThanOrEqual(20.0);
        expect(c.basePrice250g).toBeLessThanOrEqual(24.0);
      });
    });
  });
});
