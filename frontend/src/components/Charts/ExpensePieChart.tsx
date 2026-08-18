import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

type ExpenseData = {
  name: string;
  value: number;
};

type Props = {
  data: ExpenseData[];
};

function ExpensePieChart({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">

      <h2 className="text-xl font-semibold mb-6">
        Expense Breakdown
      </h2>

      <ResponsiveContainer
        width="100%"
        height={350}
      >
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />

        </PieChart>
      </ResponsiveContainer>

    </div>
  );
}

export default ExpensePieChart;