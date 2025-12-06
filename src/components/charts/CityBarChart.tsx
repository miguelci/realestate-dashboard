'use client';

import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 12, fill: '#78716C' }} />
            <YAxis
              type="category"
              dataKey="city"
              tick={{ fontSize: 12, fill: '#78716C' }}
              width={100}
            />
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
              radius={[0, 4, 4, 0]}
              onClick={(data) => {
                const entry = data as unknown as { city: string };
                if (entry?.city) handleClick(entry.city);
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
