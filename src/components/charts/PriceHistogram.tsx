'use client';

import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Property } from '@/types';

interface PriceHistogramProps {
  properties: Property[];
  listingType: 'all' | 'sale' | 'rent';
}

function getBuckets(properties: Property[], listingType: 'all' | 'sale' | 'rent') {
  const filtered =
    listingType === 'all'
      ? properties
      : properties.filter(p => p.listingType === listingType);

  if (filtered.length === 0) return [];

  // Determine if mostly rentals or sales
  const rentCount = filtered.filter(p => p.listingType === 'rent').length;
  const isRental = rentCount > filtered.length / 2;

  // Define price ranges based on type
  const ranges = isRental
    ? [
        { min: 0, max: 1000, label: '< €1k' },
        { min: 1000, max: 1500, label: '€1-1.5k' },
        { min: 1500, max: 2000, label: '€1.5-2k' },
        { min: 2000, max: 2500, label: '€2-2.5k' },
        { min: 2500, max: 3000, label: '€2.5-3k' },
        { min: 3000, max: Infinity, label: '> €3k' },
      ]
    : [
        { min: 0, max: 200000, label: '< €200k' },
        { min: 200000, max: 300000, label: '€200-300k' },
        { min: 300000, max: 400000, label: '€300-400k' },
        { min: 400000, max: 500000, label: '€400-500k' },
        { min: 500000, max: 750000, label: '€500-750k' },
        { min: 750000, max: Infinity, label: '> €750k' },
      ];

  return ranges.map(range => ({
    ...range,
    count: filtered.filter(p => p.price >= range.min && p.price < range.max).length,
  }));
}

export function PriceHistogram({ properties, listingType }: PriceHistogramProps) {
  const router = useRouter();
  const chartData = getBuckets(properties, listingType);

  const handleClick = (min: number, max: number) => {
    const params = new URLSearchParams();
    params.set('priceMin', min.toString());
    if (max !== Infinity) params.set('priceMax', max.toString());
    if (listingType !== 'all') params.set('type', listingType);
    router.push(`/?${params.toString()}`);
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">Price Distribution</h3>
        <div className="h-48 flex items-center justify-center text-text-secondary">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium text-text-primary mb-4">Price Distribution</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ bottom: 20 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#78716C' }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={50}
            />
            <YAxis tick={{ fontSize: 12, fill: '#78716C' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E7E5E4',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`${value} properties`, 'Count']}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              onClick={(data) => {
                const entry = data as unknown as { min: number; max: number };
                if (entry?.min !== undefined) handleClick(entry.min, entry.max);
              }}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill="#0D9488" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
