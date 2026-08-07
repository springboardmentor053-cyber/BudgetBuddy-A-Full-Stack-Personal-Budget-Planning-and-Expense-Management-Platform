import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function MonthlyTrendChart({ data = [] }) {
  const normalizedData = data.map((item) => ({
    month: item.month || item.name || "N/A",
    income: Number(item.income ?? item.total_income ?? 0),
    expense: Number(item.expense ?? item.total_expense ?? item.expenses ?? 0),
  }));

  if (normalizedData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400">
        No monthly trend data available
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={normalizedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
          />
          <Legend />
          <Bar dataKey="income" fill="#10B981" name="Income" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" fill="#EF4444" name="Expenses" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}