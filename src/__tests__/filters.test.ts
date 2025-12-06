import { applyFilters, filtersToUrlParams, urlParamsToFilters } from '@/lib/filters';
import { defaultFilters, FilterState, Property } from '@/types';

const baseProperty: Property = {
  id: 'p1',
  agencyId: 'a1',
  url: 'http://example.com/p1',
  title: 'Test Home',
  listingType: 'sale',
  price: 400000,
  priceDisplay: '€400,000',
  sqm: 100,
  bedrooms: 3,
  location: { city: 'Amsterdam' },
  images: [],
  features: [],
  firstSeen: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  hash: 'hash1',
};

function buildFilters(overrides: Partial<FilterState>): FilterState {
  return { ...defaultFilters, ...overrides };
}

describe('filters', () => {
  it('filters by listing type', () => {
    const properties = [
      baseProperty,
      { ...baseProperty, id: 'rent1', listingType: 'rent', price: 1500, priceDisplay: '€1,500' },
    ];
    const result = applyFilters(properties, buildFilters({ listingType: 'rent' }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('rent1');
  });

  it('filters by city and bedrooms', () => {
    const properties = [
      baseProperty,
      { ...baseProperty, id: 'p2', location: { city: 'Rotterdam' }, bedrooms: 2 },
    ];
    const result = applyFilters(properties, buildFilters({ cities: ['Rotterdam'], bedrooms: [2] }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p2');
  });

  it('filters by price range', () => {
    const properties = [
      { ...baseProperty, id: 'low', price: 200000, priceDisplay: '€200,000' },
      { ...baseProperty, id: 'mid', price: 400000, priceDisplay: '€400,000' },
      { ...baseProperty, id: 'high', price: 800000, priceDisplay: '€800,000' },
    ];
    const result = applyFilters(properties, buildFilters({ priceMin: 300000, priceMax: 500000 }));
    expect(result.map(p => p.id)).toEqual(['mid']);
  });

  it('round-trips url params', () => {
    const filters = buildFilters({
      listingType: 'rent',
      priceMin: 1000,
      priceMax: 2000,
      bedrooms: [2, 3],
      cities: ['Amsterdam', 'Rotterdam'],
      agencies: ['a1'],
      sortBy: 'price-asc',
      newTodayOnly: true,
    });
    const params = filtersToUrlParams(filters);
    const parsed = { ...defaultFilters, ...urlParamsToFilters(params) };
    expect(parsed).toEqual(filters);
  });

  it('sorts newest first by default', () => {
    const now = Date.now();
    const properties = [
      { ...baseProperty, id: 'old', firstSeen: new Date(now - 86400000).toISOString() },
      { ...baseProperty, id: 'new', firstSeen: new Date(now).toISOString() },
    ];
    const result = applyFilters(properties, defaultFilters);
    expect(result[0].id).toBe('new');
  });
});
