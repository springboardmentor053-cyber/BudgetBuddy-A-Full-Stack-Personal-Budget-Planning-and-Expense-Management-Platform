import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#64748B", // Slate
];

// Custom Tooltip component
const CustomTooltip = ({ active, payload, totalSum }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = totalSum > 0 ? ((data.value / totalSum) * 100).toFixed(1) : 0;

    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-xl text-white text-xs space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="text-slate-200">{data.name}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 pt-1">
          <span className="text-base font-bold text-white">
            ₹{Number(data.value).toLocaleString("en-IN")}
          </span>
          <span className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
            {percentage}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ data = [] }) {
  // Normalize data and compute total sum
  const normalizedData = useMemo(() => {
    return data
      .map((item) => ({
        name: item.category || item.name || item.category_name || "Uncategorized",
        value: Number(item.amount ?? item.total ?? item.value ?? item.total_amount ?? 0),
      }))
      .filter((item) => item.value > 0);
  }, [data]);

  const totalExpense = useMemo(() => {
    return normalizedData.reduce((acc, curr) => acc + curr.value, 0);
  }, [normalizedData]);

  if (normalizedData.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-700/60 rounded-3xl p-6 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="w-12 h-12 rounded-full bg-slate-200/50 dark:bg-slate-700/50 flex items-center justify-center mb-3">
          📊
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No expense logs found for this period
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6 p-2">
      {/* Donut Chart Container */}
      <div className="relative w-full lg:w-3/5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={4}
              cornerRadius={6}
              dataKey="value"
              nameKey="name"
            >
              {normalizedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-all duration-300 hover:opacity-80 focus:outline-none"
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip totalSum={totalExpense} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
            Total Spent
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            ₹{totalExpense > 99999 ? `${(totalExpense / 1000).toFixed(1)}k` : totalExpense.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Custom Category Legend Breakdown */}
      <div className="w-full lg:w-2/5 max-h-72 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
        {normalizedData.map((entry, index) => {
          const color = COLORS[index % COLORS.length];
          const pct = ((entry.value / totalExpense) * 100).toFixed(0);

          return (
            <div
              key={entry.name}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                  {entry.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  ₹{entry.value.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">{pct}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}