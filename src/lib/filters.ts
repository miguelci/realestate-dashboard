import { Property, FilterState } from '@/types';

export function applyFilters(properties: Property[], filters: FilterState): Property[] {
  let result = [...properties];

  // Filter for properties first seen today
  if (filters.newTodayOnly) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    result = result.filter(p => new Date(p.firstSeen) >= today);
  }

  // Filter by listing type
  if (filters.listingType !== 'all') {
    result = result.filter(p => p.listingType === filters.listingType);
  }

  // Filter by price range
  if (filters.priceMin !== null) {
    result = result.filter(p => p.price >= filters.priceMin!);
  }
  if (filters.priceMax !== null) {
    result = result.filter(p => p.price <= filters.priceMax!);
  }

  // Filter by size range
  if (filters.sqmMin !== null) {
    result = result.filter(p => p.sqm && p.sqm >= filters.sqmMin!);
  }
  if (filters.sqmMax !== null) {
    result = result.filter(p => p.sqm && p.sqm <= filters.sqmMax!);
  }

  // Filter by bedrooms
  if (filters.bedrooms.length > 0) {
    result = result.filter(p => p.bedrooms && filters.bedrooms.includes(p.bedrooms));
  }

  // Filter by cities
  if (filters.cities.length > 0) {
    result = result.filter(p => filters.cities.includes(p.location.city));
  }

  // Filter by agencies
  if (filters.agencies.length > 0) {
    result = result.filter(p => filters.agencies.includes(p.agencyId));
  }

  // Sort
  result = sortProperties(result, filters.sortBy);

  return result;
}

export function sortProperties(properties: Property[], sortBy: FilterState['sortBy']): Property[] {
  const sorted = [...properties];

  switch (sortBy) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime());
      break;
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'size-desc':
      sorted.sort((a, b) => (b.sqm || 0) - (a.sqm || 0));
      break;
  }

  return sorted;
}

export function filtersToUrlParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.listingType !== 'all') params.set('type', filters.listingType);
  if (filters.newTodayOnly) params.set('new', '1');
  if (filters.priceMin !== null) params.set('priceMin', filters.priceMin.toString());
  if (filters.priceMax !== null) params.set('priceMax', filters.priceMax.toString());
  if (filters.sqmMin !== null) params.set('sqmMin', filters.sqmMin.toString());
  if (filters.sqmMax !== null) params.set('sqmMax', filters.sqmMax.toString());
  if (filters.bedrooms.length > 0) params.set('bedrooms', filters.bedrooms.join(','));
  if (filters.cities.length > 0) params.set('cities', filters.cities.join(','));
  if (filters.agencies.length > 0) params.set('agencies', filters.agencies.join(','));
  if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy);

  return params;
}

export function urlParamsToFilters(params: URLSearchParams): Partial<FilterState> {
  const filters: Partial<FilterState> = {};

  const type = params.get('type');
  if (type === 'sale' || type === 'rent') filters.listingType = type;

  if (params.get('new') === '1') {
    filters.newTodayOnly = true;
  }

  const priceMin = params.get('priceMin');
  if (priceMin) filters.priceMin = parseInt(priceMin);

  const priceMax = params.get('priceMax');
  if (priceMax) filters.priceMax = parseInt(priceMax);

  const sqmMin = params.get('sqmMin');
  if (sqmMin) filters.sqmMin = parseInt(sqmMin);

  const sqmMax = params.get('sqmMax');
  if (sqmMax) filters.sqmMax = parseInt(sqmMax);

  const bedrooms = params.get('bedrooms');
  if (bedrooms) filters.bedrooms = bedrooms.split(',').map(Number);

  const cities = params.get('cities');
  if (cities) filters.cities = cities.split(',');

  const agencies = params.get('agencies');
  if (agencies) filters.agencies = agencies.split(',');

  const sort = params.get('sort');
  if (sort === 'price-asc' || sort === 'price-desc' || sort === 'size-desc') {
    filters.sortBy = sort;
  }

  return filters;
}
