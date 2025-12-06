'use client';

import { FilterState, defaultFilters } from '@/types';
import { getAgencyName } from '@/lib/data';
import { SearchableMultiSelect, SelectOption } from './ui/SearchableMultiSelect';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  cities: string[];
  agencies: string[];
  bedroomOptions: number[];
  totalCount: number;
  filteredCount: number;
  cityCounts: Record<string, number>;
  agencyCounts: Record<string, number>;
}

export function FilterPanel({
  filters,
  onChange,
  cities,
  agencies,
  bedroomOptions,
  totalCount,
  filteredCount,
  cityCounts,
  agencyCounts,
}: FilterPanelProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.listingType !== 'all' ||
    filters.newTodayOnly ||
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.sqmMin !== null ||
    filters.sqmMax !== null ||
    filters.bedrooms.length > 0 ||
    filters.cities.length > 0 ||
    filters.agencies.length > 0;

  // Build options with counts for cities
  const cityOptions: SelectOption[] = cities.map(city => ({
    value: city,
    label: city,
    count: cityCounts[city] || 0,
  }));

  // Build options with counts for agencies
  const agencyOptions: SelectOption[] = agencies.map(agency => ({
    value: agency,
    label: getAgencyName(agency),
    count: agencyCounts[agency] || 0,
  }));

  return (
    <div className="bg-surface rounded-lg border border-border p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Listing Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Type</label>
          <div className="flex gap-1">
            {(['all', 'sale', 'rent'] as const).map(type => (
              <button
                key={type}
                onClick={() => updateFilter('listingType', type)}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  filters.listingType === type
                    ? 'bg-accent text-white'
                    : 'bg-hover text-text-secondary hover:text-text-primary'
                }`}
              >
                {type === 'all' ? 'All' : type === 'sale' ? 'Sale' : 'Rent'}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin ?? ''}
              onChange={e => updateFilter('priceMin', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax ?? ''}
              onChange={e => updateFilter('priceMax', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Size Range */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Size (m²)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.sqmMin ?? ''}
              onChange={e => updateFilter('sqmMin', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.sqmMax ?? ''}
              onChange={e => updateFilter('sqmMax', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Bedrooms</label>
          <div className="flex flex-wrap gap-1">
            {bedroomOptions.slice(0, 5).map(num => (
              <button
                key={num}
                onClick={() => {
                  const newBedrooms = filters.bedrooms.includes(num)
                    ? filters.bedrooms.filter(b => b !== num)
                    : [...filters.bedrooms, num];
                  updateFilter('bedrooms', newBedrooms);
                }}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  filters.bedrooms.includes(num)
                    ? 'bg-accent text-white'
                    : 'bg-hover text-text-secondary hover:text-text-primary'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* City - New searchable multi-select */}
        <SearchableMultiSelect
          label="City"
          options={cityOptions}
          selected={filters.cities}
          onChange={selected => updateFilter('cities', selected)}
          placeholder="Search cities..."
        />

        {/* Agency - New searchable multi-select */}
        <SearchableMultiSelect
          label="Agency"
          options={agencyOptions}
          selected={filters.agencies}
          onChange={selected => updateFilter('agencies', selected)}
          placeholder="Search agencies..."
        />

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={e => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
            className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="size-desc">Size: Largest First</option>
          </select>
        </div>

        {/* Clear & Count */}
        <div className="flex items-end">
          <div className="flex items-center justify-between w-full gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Clear Filters
              </button>
            )}
            <span className="text-sm text-text-secondary ml-auto">
              Showing {filteredCount} of {totalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
