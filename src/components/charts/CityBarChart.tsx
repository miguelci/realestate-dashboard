'use client';

import { useRouter } from 'next/navigation';
import { ComponentType } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Recharts types lag React 19; cast container to keep TS happy
const SafeResponsiveContainer = ResponsiveContainer as unknown as ComponentType<any>;
const SafeBarChart = BarChart as unknown as ComponentType<any>;
const SafeBar = Bar as unknown as ComponentType<any>;
const SafeXAxis = XAxis as unknown as ComponentType<any>;
const SafeYAxis = YAxis as unknown as ComponentType<any>;
const SafeTooltip = Tooltip as unknown as ComponentType<any>;
const SafeCell = Cell as unknown as ComponentType<any>;

interface CityBarChartProps {
  data: Record<string, number>;
}

export function CityBarChart({ data }: CityBarChartProps) {
  const router = useRouter();

  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([city, count]) => ({ city, count }));

  const handleClick = (city: string) => {
    router.push(`/?cities=${encodeURIComponent(city)}`);
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium text-text-primary mb-4">Properties by City</h3>
      <div className="h-48">
        <SafeResponsiveContainer width="100%" height="100%">
          <SafeBarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <SafeXAxis type="number" tick={{ fontSize: 12, fill: '#78716C' }} />
            <SafeYAxis
              type="category"
              dataKey="city"
              tick={{ fontSize: 12, fill: '#78716C' }}
              width={100}
            />
            <SafeTooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E7E5E4',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`${value} properties`, 'Count']}
            />
            <SafeBar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              onClick={(data: unknown) => {
                const entry = data as { city?: string };
                if (entry?.city) handleClick(entry.city);
              }}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((_, index) => (
                <SafeCell key={`cell-${index}`} fill="#0D9488" />
              ))}
            </SafeBar>
          </SafeBarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
