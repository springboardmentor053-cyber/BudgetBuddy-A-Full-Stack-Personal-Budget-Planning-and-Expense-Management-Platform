import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function ExpensePieChart({ expense, remaining }) {
  const totalExpense = Number(expense || 0);
  const remainingAmount = Number(remaining || 0);

  /*
    A pie chart cannot use negative values.

    If balance/remaining is negative, we only show
    the actual expense amount.
  */

  const data =
    remainingAmount > 0
      ? [
          {
            name: "Expense",
            value: totalExpense,
          },
          {
            name: "Remaining",
            value: remainingAmount,
          },
        ]
      : [
          {
            name: "Expense",
            value: totalExpense,
          },
        ];

  const COLORS = ["#ef4444", "#22c55e"];

  return (
    <div
      style={{
        width: "100%",
        height: "320px",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
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
              `₹${Number(value).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            }
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text)",
            }}
          />

          <Legend
            verticalAlign="bottom"
            wrapperStyle={{
              color: "var(--text-secondary)",
              fontSize: "13px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ExpensePieChart;