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

interface Props {
  income: number;
  expense: number;
}

function DashboardChart({ income, expense }: Props) {
  const data = [
    {
      month: "This Month",
      Income: income,
      Expense: expense,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mt-8">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-semibold text-gray-800">
            
          </h2>

          <p className="text-gray-500 mt-1">
            Compare your monthly income and expenses.
          </p>

        </div>

      </div>

      <ResponsiveContainer width="100%" height={350}>

        <BarChart
          data={data}
          barGap={25}
        >

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tick={{ fill: "#6B7280" }}
          />

          <YAxis tick={{ fill: "#6B7280" }} />

          <Tooltip />

          <Legend />

          <Bar
            dataKey="Income"
            fill="#10B981"
            radius={[8, 8, 0, 0]}
          />

          <Bar
            dataKey="Expense"
            fill="#EF4444"
            radius={[8, 8, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default DashboardChart;