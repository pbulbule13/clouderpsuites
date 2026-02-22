"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartConfig } from "@/lib/types";

const COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#1e40af",
  "#1d4ed8",
  "#6366f1",
  "#818cf8",
  "#a5b4fc",
];

interface ChartRendererProps {
  config: ChartConfig;
  data: Record<string, unknown>[];
}

export function ChartRenderer({ config, data }: ChartRendererProps) {
  const { type, x_axis, y_axis, title } = config;

  return (
    <div className="bg-card border rounded-xl p-4">
      <h4 className="text-sm font-medium mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        {type === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={x_axis} className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey={y_axis} fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={x_axis} className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={y_axis}
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              dataKey={y_axis}
              nameKey={x_axis}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
