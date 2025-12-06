'use client';

import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getAgencyName } from '@/lib/data';

interface AgencyBarChartProps {
  data: Record<string, number>;
}

export function AgencyBarChart({ data }: AgencyBarChartProps) {
  const router = useRouter();

  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([agencyId, count]) => ({
      agencyId,
      name: getAgencyName(agencyId),
      count,
    }));

  const handleClick = (agencyId: string) => {
    router.push(`/?agencies=${encodeURIComponent(agencyId)}`);
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium text-text-primary mb-4">Properties by Agency</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 12, fill: '#78716C' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#78716C' }}
              width={120}
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
                const entry = data as unknown as { agencyId: string };
                if (entry?.agencyId) handleClick(entry.agencyId);
              }}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill="#78716C" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
