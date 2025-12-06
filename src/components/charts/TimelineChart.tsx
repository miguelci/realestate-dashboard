'use client';

import { useRouter } from 'next/navigation';
import { ComponentType } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Property } from '@/types';

// Recharts types lag React 19; cast container to keep TS happy
const SafeResponsiveContainer = ResponsiveContainer as unknown as ComponentType<any>;
const SafeAreaChart = AreaChart as unknown as ComponentType<any>;
const SafeArea = Area as unknown as ComponentType<any>;
const SafeXAxis = XAxis as unknown as ComponentType<any>;
const SafeYAxis = YAxis as unknown as ComponentType<any>;
const SafeTooltip = Tooltip as unknown as ComponentType<any>;

interface TimelineChartProps {
  properties: Property[];
}

function getTimelineData(properties: Property[]) {
  const today = new Date();
  const data: { date: string; count: number; fullDate: string }[] = [];

  // Get last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = properties.filter(p => {
      const firstSeen = new Date(p.firstSeen);
      return firstSeen >= date && firstSeen < nextDate;
    }).length;

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      count,
    });
  }

  return data;
}

export function TimelineChart({ properties }: TimelineChartProps) {
  const router = useRouter();
  const chartData = getTimelineData(properties);

  // Note: Clicking on timeline would need date-based filtering
  // For now, just show hover information

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium text-text-primary mb-4">
        New Properties Over Last 30 Days
      </h3>
      <div className="h-48">
        <SafeResponsiveContainer width="100%" height="100%">
          <SafeAreaChart data={chartData} margin={{ left: 0, right: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <SafeXAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#78716C' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <SafeYAxis
              tick={{ fontSize: 12, fill: '#78716C' }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <SafeTooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E7E5E4',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`${value} new properties`, 'Added']}
              labelFormatter={(label: string) => `Date: ${label}`}
            />
            <SafeArea
              type="monotone"
              dataKey="count"
              stroke="#0D9488"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </SafeAreaChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
