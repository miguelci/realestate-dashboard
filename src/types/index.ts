export interface Property {
  id: string;
  agencyId: string;
  url: string;
  title: string;
  listingType: 'sale' | 'rent';
  price: number;
  priceDisplay: string;
  sqm?: number;
  bedrooms?: number;
  location: {
    city: string;
    street?: string;
    neighborhood?: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  images: string[];
  description?: string;
  features: string[];
  firstSeen: string;
  lastUpdated: string;
  hash: string;
  lastScraped?: string;
  distanceToPOI?: {
    [poiId: string]: {
      walking?: { meters: number; minutes: number };
      cycling?: { meters: number; minutes: number };
    };
  };
}

export interface FilterState {
  listingType: 'all' | 'sale' | 'rent';
  priceMin: number | null;
  priceMax: number | null;
  sqmMin: number | null;
  sqmMax: number | null;
  bedrooms: number[];
  cities: string[];
  agencies: string[];
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'size-desc';
  newTodayOnly: boolean;
}

export const defaultFilters: FilterState = {
  listingType: 'all',
  priceMin: null,
  priceMax: null,
  sqmMin: null,
  sqmMax: null,
  bedrooms: [],
  cities: [],
  agencies: [],
  sortBy: 'newest',
  newTodayOnly: false,
};
