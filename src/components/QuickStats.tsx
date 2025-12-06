'use client';

interface QuickStatsProps {
  forSale: number;
  forRent: number;
  newToday: number;
  topCity: { name: string; count: number } | null;
  onFilterClick: (filter: { listingType?: 'sale' | 'rent'; cities?: string[]; newTodayOnly?: boolean }) => void;
  activeFilter?: string;
}

export function QuickStats({
  forSale,
  forRent,
  newToday,
  topCity,
  onFilterClick,
  activeFilter,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <button
        onClick={() => onFilterClick({ listingType: 'sale' })}
        className={`p-4 rounded-lg border text-left transition-all ${
          activeFilter === 'sale'
            ? 'border-badge-sale bg-red-50'
            : 'border-border bg-surface hover:bg-hover'
        }`}
      >
        <div className="text-2xl font-bold text-text-primary">{forSale}</div>
        <div className="text-sm text-text-secondary">🏠 For Sale</div>
      </button>

      <button
        onClick={() => onFilterClick({ listingType: 'rent' })}
        className={`p-4 rounded-lg border text-left transition-all ${
          activeFilter === 'rent'
            ? 'border-badge-rent bg-green-50'
            : 'border-border bg-surface hover:bg-hover'
        }`}
      >
        <div className="text-2xl font-bold text-text-primary">{forRent}</div>
        <div className="text-sm text-text-secondary">🔑 For Rent</div>
      </button>

      <button
        onClick={() => onFilterClick({ newTodayOnly: true })}
        className={`p-4 rounded-lg border text-left transition-all ${
          activeFilter === 'new'
            ? 'border-accent bg-teal-50'
            : 'border-border bg-surface hover:bg-hover'
        }`}
      >
        <div className="text-2xl font-bold text-text-primary">{newToday}</div>
        <div className="text-sm text-text-secondary">🆕 New Today</div>
      </button>

      {topCity && (
        <button
          onClick={() => onFilterClick({ cities: [topCity.name] })}
          className={`p-4 rounded-lg border text-left transition-all ${
            activeFilter === topCity.name
              ? 'border-accent bg-teal-50'
              : 'border-border bg-surface hover:bg-hover'
          }`}
        >
          <div className="text-2xl font-bold text-text-primary">{topCity.count}</div>
          <div className="text-sm text-text-secondary">📍 {topCity.name}</div>
        </button>
      )}
    </div>
  );
}
