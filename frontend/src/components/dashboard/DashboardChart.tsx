import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Cell } from "recharts";
import { useEffect, useState } from "react";

interface Props {
  income: number;
  expense: number;
}
function DashboardChart({ income, expense }: Props) {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
    useEffect(()=>{
      const observer = new MutationObserver(()=>{
        setIsDark(
          document.documentElement.classList.contains("dark")
        );
          });
          observer.observe(document.documentElement,{
            attributes:true,
            attributeFilter:["class"],
  
          });
          return ()=> observer.disconnect();} ,[]);
          const textColor = isDark ? "#E5E7EB": "#374151";
          const gridColor = isDark ? "#374151": "#E5E7EB";
          const data = [
          {
            month:"overview",
            name: "Income",
            amount: income,
          },
          {
            month:"overview",
            name: "Expense",
            amount: expense,
          },
        ];
          

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 mt-8">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Compare your monthly income and expenses.
          </p>

        </div>

      </div>

      <ResponsiveContainer width="100%" height={350}>

        <BarChart data={data}>
  <CartesianGrid
    strokeDasharray="4 4"
    vertical={false}
    stroke={gridColor}
  />

  <XAxis
    dataKey="name"
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
    formatter={(value) => [
      `₹${Number(value).toLocaleString()}`,
      "Amount",
    ]}
    contentStyle={{
      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
      border: `1px solid ${gridColor}`,
      borderRadius: "8px",
    }}
    itemStyle={{
      color: textColor,
    }}
    labelStyle={{
      color: textColor,
    }}
  />

  <Legend />

<Bar dataKey="amount" radius={[12,12,0,0]}>
  <Cell fill="#22C55E" />
  <Cell fill="#EF4444" />
</Bar> 
</BarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default DashboardChart;