import { Property } from '@/types';

// Agency name mapping
const agencyNames: Record<string, string> = {
  makelaarsland: 'Makelaarsland',
  bnv: 'BNV Makelaars',
  keizerskroon: 'Keizerskroon Makelaars',
  housingnet: 'HousingNet',
  newcurb: 'NEWCURB Makelaars',
  amstelland: 'Amstelland Makelaars',
  parkerwilliams: 'Parker & Williams',
  hoekstra: 'Hoekstra en van Eck',
  stadenland: 'Stad en Land Makelaars',
  saen: 'Saen Garantiemakelaars',
  brantjes: 'Brantjes Makelaars',
  relomakelaars: 'Relo Makelaars',
  homeoforange: 'Home of Orange',
};

export function getAgencyName(agencyId: string): string {
  return agencyNames[agencyId] || agencyId;
}

export async function loadListings(): Promise<Property[]> {
  const sources = [
    // Primary: explicit remote URL for static hosting (GitHub Pages/raw JSON)
    process.env.NEXT_PUBLIC_LISTINGS_URL,
    // Fallbacks: API route (when running in monorepo dev) then static file
    '/api/listings',
    '/listings.json'
  ].filter(Boolean) as string[];

  for (const url of sources) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      return await res.json();
    } catch (error) {
      console.error(`Error loading listings from ${url}:`, error);
    }
  }

  return [];
}

export function getUniqueValues(properties: Property[]) {
  const cities = [...new Set(properties.map(p => p.location.city))].sort();
  const agencies = [...new Set(properties.map(p => p.agencyId))].sort();
  const bedroomCounts = [...new Set(properties.map(p => p.bedrooms).filter(Boolean) as number[])].sort((a, b) => a - b);

  return { cities, agencies, bedroomCounts };
}

export function getStats(properties: Property[]) {
  const total = properties.length;
  const forSale = properties.filter(p => p.listingType === 'sale').length;
  const forRent = properties.filter(p => p.listingType === 'rent').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newToday = properties.filter(p => new Date(p.firstSeen) >= today).length;

  const byCity: Record<string, number> = {};
  const byAgency: Record<string, number> = {};

  properties.forEach(p => {
    byCity[p.location.city] = (byCity[p.location.city] || 0) + 1;
    byAgency[p.agencyId] = (byAgency[p.agencyId] || 0) + 1;
  });

  return { total, forSale, forRent, newToday, byCity, byAgency };
}

export function isNewProperty(property: Property): boolean {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  return new Date(property.firstSeen) > oneDayAgo;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
