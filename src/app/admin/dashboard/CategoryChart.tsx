'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChartItem {
  name: string;
  count: number;
}

const COLORS = [
  '#E31E24', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
];

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm">
      <p className="text-white/60 mb-0.5">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} productos</p>
    </div>
  );
}

export default function CategoryChart({ data }: { data: ChartItem[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        Sin datos de categorías
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 160)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
