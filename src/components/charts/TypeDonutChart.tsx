'use client';

import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TypeDonutChartProps {
  forSale: number;
  forRent: number;
}

const COLORS = {
  sale: '#DC2626',
  rent: '#059669',
};

export function TypeDonutChart({ forSale, forRent }: TypeDonutChartProps) {
  const router = useRouter();
  const total = forSale + forRent;

  const data = [
    { name: 'For Sale', value: forSale, type: 'sale' },
    { name: 'For Rent', value: forRent, type: 'rent' },
  ];

  const handleClick = (entry: { type: string }) => {
    router.push(`/?type=${entry.type}`);
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium text-text-primary mb-4">Properties by Type</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              onClick={(_, index) => handleClick(data[index])}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.type as keyof typeof COLORS]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E7E5E4',
                borderRadius: '6px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-2">
        {data.map(item => (
          <button
            key={item.type}
            onClick={() => handleClick(item)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[item.type as keyof typeof COLORS] }}
            />
            {item.name}: {item.value}
          </button>
        ))}
      </div>
    </div>
  );
}
