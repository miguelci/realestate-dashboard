'use client';

import { useEffect, useState, useMemo } from 'react';
import { Property } from '@/types';
import { loadListings, getStats } from '@/lib/data';
import { Header } from '@/components/Header';
import { TypeDonutChart } from '@/components/charts/TypeDonutChart';
import { CityBarChart } from '@/components/charts/CityBarChart';
import { AgencyBarChart } from '@/components/charts/AgencyBarChart';
import { PriceHistogram } from '@/components/charts/PriceHistogram';
import { TimelineChart } from '@/components/charts/TimelineChart';

export default function StatsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings().then(data => {
      setProperties(data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => getStats(properties), [properties]);

  // Calculate additional statistics
  const avgPrice = useMemo(() => {
    if (properties.length === 0) return { sale: 0, rent: 0 };
    const sales = properties.filter(p => p.listingType === 'sale');
    const rentals = properties.filter(p => p.listingType === 'rent');
    return {
      sale: sales.length > 0 ? Math.round(sales.reduce((sum, p) => sum + p.price, 0) / sales.length) : 0,
      rent: rentals.length > 0 ? Math.round(rentals.reduce((sum, p) => sum + p.price, 0) / rentals.length) : 0,
    };
  }, [properties]);

  const avgSqm = useMemo(() => {
    const withSqm = properties.filter(p => p.sqm);
    if (withSqm.length === 0) return 0;
    return Math.round(withSqm.reduce((sum, p) => sum + (p.sqm || 0), 0) / withSqm.length);
  }, [properties]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header totalCount={properties.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6">Statistics Overview</h2>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
            <div className="text-sm text-text-secondary">Total Properties</div>
          </div>
          <div className="bg-surface rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-text-primary">
              €{avgPrice.sale.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">Avg Sale Price</div>
          </div>
          <div className="bg-surface rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-text-primary">
              €{avgPrice.rent.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">Avg Rent/month</div>
          </div>
          <div className="bg-surface rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-text-primary">{avgSqm} m²</div>
            <div className="text-sm text-text-secondary">Avg Size</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TypeDonutChart forSale={stats.forSale} forRent={stats.forRent} />
          <CityBarChart data={stats.byCity} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <PriceHistogram properties={properties} listingType="all" />
          <AgencyBarChart data={stats.byAgency} />
        </div>

        {/* Timeline - Full Width */}
        <TimelineChart properties={properties} />

        {/* Tip */}
        <p className="text-sm text-text-secondary text-center mt-6">
          Click on any chart element to filter the property list
        </p>
      </main>
    </div>
  );
}
