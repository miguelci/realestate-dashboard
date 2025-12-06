'use client';

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Property, FilterState, defaultFilters } from '@/types';
import { loadListings, getUniqueValues, getStats } from '@/lib/data';
import { applyFilters, urlParamsToFilters, filtersToUrlParams } from '@/lib/filters';
import { Header } from '@/components/Header';
import { QuickStats } from '@/components/QuickStats';
import { FilterPanel } from '@/components/FilterPanel';
import { PropertyList } from '@/components/PropertyList';
import { PropertyDetailModal } from '@/components/PropertyDetailModal';
import { MapViewWrapper } from '@/components/MapViewWrapper';

type ViewMode = 'list' | 'map';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showCoordsOnly, setShowCoordsOnly] = useState(false);

  // Load properties on mount
  useEffect(() => {
    loadListings().then(data => {
      setProperties(data);
      setLoading(false);
    });
  }, []);

  // Initialize filters from URL
  useEffect(() => {
    const urlFilters = urlParamsToFilters(searchParams);
    setFilters({ ...defaultFilters, ...urlFilters });
  }, [searchParams]);

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    const params = filtersToUrlParams(newFilters);
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/', { scroll: false });
  }, [router]);

  // Compute derived values
  const { cities, agencies, bedroomCounts } = useMemo(
    () => getUniqueValues(properties),
    [properties]
  );

  const stats = useMemo(() => getStats(properties), [properties]);

  const filteredProperties = useMemo(
    () => applyFilters(properties, filters),
    [properties, filters]
  );

  const viewProperties = useMemo(() => {
    if (!showCoordsOnly) return filteredProperties;
    return filteredProperties.filter(
      p => p.location?.coordinates?.lat && p.location?.coordinates?.lon
    );
  }, [filteredProperties, showCoordsOnly]);

  // Get top city for quick stats
  const topCity = useMemo(() => {
    const entries = Object.entries(stats.byCity);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return { name: entries[0][0], count: entries[0][1] };
  }, [stats.byCity]);

  // Handle quick stat clicks
  const handleQuickStatClick = (filter: { listingType?: 'sale' | 'rent'; cities?: string[]; newTodayOnly?: boolean }) => {
    const newFilters = { ...defaultFilters, ...filter };
    updateFilters(newFilters);
  };

  // Handle property click
  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  // Determine active filter for highlighting
  const activeFilter = useMemo(() => {
    if (filters.newTodayOnly) return 'new';
    if (filters.listingType === 'sale') return 'sale';
    if (filters.listingType === 'rent') return 'rent';
    if (filters.cities.length === 1) return filters.cities[0];
    return undefined;
  }, [filters]);

  // Get last updated time from most recent property
  const lastUpdated = useMemo(() => {
    if (properties.length === 0) return undefined;
    const dates = properties.map(p => new Date(p.lastUpdated || p.firstSeen).getTime());
    return new Date(Math.max(...dates)).toISOString();
  }, [properties]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header totalCount={properties.length} lastUpdated={lastUpdated} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <QuickStats
          forSale={stats.forSale}
          forRent={stats.forRent}
          newToday={stats.newToday}
          topCity={topCity}
          onFilterClick={handleQuickStatClick}
          activeFilter={activeFilter}
        />

        <FilterPanel
          filters={filters}
          onChange={updateFilters}
          cities={cities}
          agencies={agencies}
          bedroomOptions={bedroomCounts}
          totalCount={properties.length}
          filteredCount={filteredProperties.length}
          cityCounts={stats.byCity}
          agencyCounts={stats.byAgency}
        />

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-hover rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'map'
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map
            </button>
          </div>
          <span className="text-sm text-text-secondary">
            {filteredProperties.length} properties
          </span>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'list' ? (
          <PropertyList properties={viewProperties} onPropertyClick={handlePropertyClick} />
        ) : (
          <MapViewWrapper
            properties={filteredProperties}
            onPropertyClick={handlePropertyClick}
            showCoordsOnly={showCoordsOnly}
            onToggleCoordsOnly={setShowCoordsOnly}
            totalCount={filteredProperties.length}
          />
        )}
      </main>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
