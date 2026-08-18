import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

interface Props {
  data: {
    name: string;
    value: number;
  }[];
}

function ExpensePieChart({ data }: Props) {
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
      
  return (
     <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 mt-8 transition-colors duration-300">

      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
        Expense Categories
      </h2>

      <p className="text-gray-500 dark:text-gray-400 mb-6">
        See where your money is going.
      </p>

      <ResponsiveContainer
        width="100%"
        height={350}
      >
        <PieChart>

          <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={4}
              labelLine={false}
              label={({ percent }) =>
                `${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

          <Tooltip
            formatter={(value) => [`₹${value}`, "Amount"]}
            contentStyle={{
              backgroundColor: isDark? "#1F2937": "#FFFFFF",
              border: `1px solid ${gridColor}`,
              borderRadius: "8px",
              color: textColor,
            }}
            itemStyle={{
              color: textColor,
            }}
            labelStyle={{
              color: textColor,
            }}
           />

          <Legend 
          wrapperStyle={{
              color: textColor,
            }}/>

        </PieChart>

      </ResponsiveContainer>

    </div>
  );
}

export default ExpensePieChart;