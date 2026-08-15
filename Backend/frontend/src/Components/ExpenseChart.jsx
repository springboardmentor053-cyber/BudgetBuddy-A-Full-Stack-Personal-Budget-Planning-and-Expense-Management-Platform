import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#4F46E5",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#7C3AED",
  "#9333EA",
  "#6D28D9",
  "#5B21B6",
];

function ExpenseChart({ transactions = [] }) {

  // Group expenses by category
  const categoryTotals = transactions.reduce((acc, transaction) => {

    const category = transaction.category || "Other";

    const amount = Number(transaction.amount) || 0;

    if (!acc[category]) {
      acc[category] = 0;
    }

    acc[category] += amount;

    return acc;

  }, {});


  const data = Object.entries(categoryTotals).map(
    ([name, value]) => ({
      name,
      value,
    })
  );


  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

      {/* Header */}

      <div className="mb-2">

        <h2 className="text-2xl font-bold text-slate-800">
          Expense Analytics
        </h2>

        <p className="text-slate-500">
          Category-wise spending
        </p>

      </div>


      {/* Empty State */}

      {data.length === 0 ? (

        <div className="h-[320px] flex flex-col items-center justify-center">

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">

            <span className="text-2xl">
              📊
            </span>

          </div>

          <h3 className="font-semibold text-slate-700">
            No Expense Data
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            Add expenses to see your analytics.
          </p>

        </div>

      ) : (

        <ResponsiveContainer width="100%" height={320}>

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={105}
              innerRadius={60}
              paddingAngle={4}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >

              {data.map((entry, index) => (

                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />

              ))}

            </Pie>

            <Tooltip
              formatter={(value) =>
                `₹${Number(value).toLocaleString("en-IN")}`
              }
            />

            <Legend
              verticalAlign="bottom"
              height={36}
            />

          </PieChart>

        </ResponsiveContainer>

      )}

    </div>
  );
}

export default ExpenseChart;