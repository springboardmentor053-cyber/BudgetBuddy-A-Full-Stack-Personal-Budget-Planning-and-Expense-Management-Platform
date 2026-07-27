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
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mt-8">

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Expense Categories
      </h2>

      <p className="text-gray-500 mb-6">
        See where your money is going.
      </p>

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <PieChart>

          <Pie
            data={data}
            innerRadius={70}
            outerRadius={110}
            dataKey="value"
            paddingAngle={3}
          >

            {data.map((entry, index) => (
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