import { useEffect, useState } from "react";
import {
  // BarChart,
  // Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  data: {
    month: string;
    income: number;
    expense: number;
  }[];
}

function MonthlyComparisonChart({ data }: Props) {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(
        document.documentElement.classList.contains("dark")
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const textColor = isDark ? "#E5E7EB" : "#374151";
  const gridColor = isDark ? "#374151" : "#E5E7EB";
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">

      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
        Monthly Income vs Expense
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke={gridColor}
          />

          <XAxis
            dataKey="month"
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />

          <YAxis
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />


           <Tooltip
            contentStyle={{
              backgroundColor: isDark
                ? "#1F2937"
                : "#FFFFFF",
              border: `1px solid ${gridColor}`,
              borderRadius: "8px",
            }}
            labelStyle={{
              color: textColor,
            }}
            itemStyle={{
              color: textColor,
            }}
          />

          <Legend
            wrapperStyle={{
              color: textColor,
            }}
          />

          <Line
            type="monotone"
            dataKey="income"
            stroke="#22C55E"
            strokeWidth={4}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />

          <Line
            type="monotone"
            dataKey="expense"
            stroke="#EF4444"
            strokeWidth={4}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default MonthlyComparisonChart;
