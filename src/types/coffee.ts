export type RoastLevel = 
  | 'Light'
  | 'Medium-Light'
  | 'Medium'
  | 'Medium-Dark'
  | 'Dark';

export type ProcessingMethod = 
  | 'Washed'
  | 'Natural'
  | 'Anaerobic Fermentation'
  | 'Honey / Pulped Natural'
  | 'Thermal Shock'
  | 'Wet Hulled (Giling Basah)';

export type CoffeeCategory = 
  | 'micro-lot'
  | 'single-origin'
  | 'signature-blend';

export type GrindOption = 
  | 'whole_bean'
  | 'espresso'
  | 'v60_drip'
  | 'aeropress'
  | 'french_press'
  | 'cold_brew';

export type PackageWeight = '200g' | '250g' | '500g' | '1kg';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';

export type BrewMethod = 
  | 'v60'
  | 'aeropress'
  | 'espresso'
  | 'french_press'
  | 'chemex'
  | 'cold_brew'
  | 'moka_pot';

export interface FlavorRadarProfile {
  acidity: number;     // 1 to 5 scale
  sweetness: number;   // 1 to 5 scale
  body: number;        // 1 to 5 scale
  bitterness: number;  // 1 to 5 scale
  aroma: number;       // 1 to 5 scale
  finish: number;      // 1 to 5 scale
}

export interface OriginDetails {
  country: string;
  region: string;
  farmOrCoop: string;
  producer?: string;
  altitudeMasl: {
    min: number;
    max: number;
  };
  harvestSeason?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DirectTradeTransparency {
  fobPricePerPoundUsd: number;          // FOB export price paid
  cMarketBenchmarkUsd: number;          // Base New York C-Market benchmark
  premiumAboveFairTradePercent: number; // e.g. +145%
  lotSizeBags: number;                  // 60kg jute bags imported
  farmPartnershipYears: number;         // Continuity
  socialImpactInitiative?: string;      // e.g. "Clean water reservoir in Chelbesa"
}

export interface WeightOptionConfig {
  weight: PackageWeight;
  grams: number;
  priceMultiplier: number;
  isAvailable: boolean;
  savingsPercentage?: number;
}

export interface CoffeeProduct {
  id: string;                      // slug e.g. 'ethiopia-yirgacheffe-chelbesa'
  name: string;                    // 'Ethiopia Yirgacheffe Chelbesa'
  tagline: string;                 // 'Peach Blossoms, Bergamot & Wild Honey'
  category: CoffeeCategory;
  origin: OriginDetails;
  varietals: string[];             // e.g. ['Heirloom', '74110', '74112']
  process: ProcessingMethod;
  processDescription: string;      // detailed explanation of the fermentation
  scaScore: number;                // 80.0 to 95.0
  roastLevel: RoastLevel;
  agtronRoastNumber?: number;      // e.g. 74
  flavorNotes: string[];           // ['Peach', 'Bergamot', 'Jasmine', 'Earl Grey']
  primaryFlavorCategory: 'Floral' | 'Fruity' | 'Citrus' | 'Sweet / Chocolate' | 'Nutty / Earthy' | 'Spiced / Winey';
  flavorRadar: FlavorRadarProfile;
  roastScheduleDays: ('Monday' | 'Thursday')[];
  recommendedBrewMethods: BrewMethod[];
  story: string;                   // in-depth terroir narrative
  basePrice250g: number;           // base price in USD
  weightOptions: WeightOptionConfig[];
  stockStatus: StockStatus;
  stockQuantityKg: number;
  isFeatured: boolean;
  isNewHarvest: boolean;
  rating: number;                  // e.g. 4.92
  reviewCount: number;             // e.g. 48
  image: string;                   // featured photo
  galleryImages: string[];
  recommendedDegasDays: {
    filter: number;                // e.g. 7 days
    espresso: number;              // e.g. 14 days
  };
}

export interface CatalogFilterState {
  searchQuery: string;
  categories: CoffeeCategory[];
  roastLevels: RoastLevel[];
  processingMethods: ProcessingMethod[];
  origins: string[];
  flavorNotes: string[];
  minScaScore: number;
  maxPrice: number;
  minPrice: number;
  inStockOnly: boolean;
  sortBy: CatalogSortOption;
}

export type CatalogSortOption = 
  | 'featured'
  | 'sca_desc'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'name_asc';

export const getWeightMultiplier = (weight: PackageWeight): number => {
  switch (weight) {
    case '200g':
      return 0.85;
    case '250g':
      return 1.0;
    case '500g':
      return 1.85;
    case '1kg':
      return 3.4;
    default:
      return 1.0;
  }
};
