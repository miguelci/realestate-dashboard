import { getStats, getUniqueValues } from '@/lib/data';
import { Property } from '@/types';

const makeProperty = (overrides: Partial<Property>): Property => ({
  id: 'id',
  agencyId: 'a1',
  url: 'http://example.com',
  title: 'Home',
  listingType: 'sale',
  price: 100,
  priceDisplay: '€100',
  location: { city: 'Amsterdam' },
  images: [],
  features: [],
  firstSeen: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  hash: 'hash',
  ...overrides,
});

describe('data helpers', () => {
  it('computes stats by city/agency and new today', () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const properties: Property[] = [
      makeProperty({ id: 's1', listingType: 'sale', location: { city: 'Amsterdam' }, agencyId: 'a1', firstSeen: today }),
      makeProperty({ id: 'r1', listingType: 'rent', location: { city: 'Rotterdam' }, agencyId: 'a2', firstSeen: yesterday }),
      makeProperty({ id: 's2', listingType: 'sale', location: { city: 'Amsterdam' }, agencyId: 'a1', firstSeen: today }),
    ];
    const stats = getStats(properties);
    expect(stats.total).toBe(3);
    expect(stats.forSale).toBe(2);
    expect(stats.forRent).toBe(1);
    expect(stats.byCity['Amsterdam']).toBe(2);
    expect(stats.byAgency['a1']).toBe(2);
    expect(stats.newToday).toBe(2);
  });

  it('gets unique values', () => {
    const properties: Property[] = [
      makeProperty({ location: { city: 'Amsterdam' }, agencyId: 'a1', bedrooms: 3 }),
      makeProperty({ location: { city: 'Rotterdam' }, agencyId: 'a2', bedrooms: 2 }),
    ];
    const { cities, agencies, bedroomCounts } = getUniqueValues(properties);
    expect(cities).toEqual(['Amsterdam', 'Rotterdam']);
    expect(agencies).toEqual(['a1', 'a2']);
    expect(bedroomCounts).toEqual([2, 3]);
  });
});
