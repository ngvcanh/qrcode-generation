import React from 'react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DownloadStats } from '@/hooks/use-package-info';
import { TrendingUp } from 'lucide-react';

interface DownloadChartProps {
  data: DownloadStats;
  color: string;
}

export function DownloadChart({ data, color }: DownloadChartProps) {
  if (!data || !data.downloads || data.downloads.length === 0) {
    return (
      <div className="p-6 bg-slate-700 rounded-xl border border-slate-600">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-bold text-slate-200">
            Download Statistics
          </h3>
        </div>
        <div className="text-center py-8 text-slate-400">
          No download data available
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.downloads.map(point => ({
    date: point.day,
    downloads: point.downloads,
    formattedDate: new Date(point.day).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  // Format number with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      color: string;
      value: number;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length && label) {
      const data = payload[0];
      return (
        <div className="bg-slate-800 px-3 py-2 rounded-md border border-slate-600 shadow-lg">
          <p className="text-xs text-slate-400 mb-1">
            {new Date(label).toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric'
            })}
          </p>
          <p className="text-sm font-bold text-slate-200">
            {formatNumber(data.value)} downloads
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm font-medium text-slate-300">
            Downloads (30d)
          </h4>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="1 1" 
              stroke="#f1f5f9" 
              className="stroke-slate-600" 
              vertical={false}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ 
                stroke: color, 
                strokeWidth: 1,
                strokeDasharray: 'none'
              }}
            />
            <Area
              type="monotone" 
              dataKey="downloads" 
              stroke={color}
              strokeWidth={1.5}
              fill={color}
              fillOpacity={0.08}
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
