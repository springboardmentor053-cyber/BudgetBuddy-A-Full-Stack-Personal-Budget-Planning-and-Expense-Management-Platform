import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function ExpensePieChart({ data }) {
  /*
    Convert backend category_analysis data
    into the format required by Recharts.

    Expected backend data:
    [
      {
        category: "Food",
        total_amount: 5000
      },
      {
        category: "Transport",
        total_amount: 3000
      }
    ]
  */

  const chartData = (data || [])
    .map((item) => ({
      name: item.category || "Uncategorized",
      value: Number(item.total_amount || 0),
    }))
    .filter((item) => item.value > 0);

  /*
    If there is no category data,
    show a simple empty message instead of
    rendering an empty chart.
  */

  if (chartData.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "320px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          color: "var(--text-secondary)",
        }}
      >
        <div
          style={{
            fontSize: "42px",
            marginBottom: "10px",
          }}
        >
          📊
        </div>

        <strong
          style={{
            color: "var(--text)",
            fontSize: "16px",
            marginBottom: "5px",
          }}
        >
          No Category Data
        </strong>

        <span
          style={{
            fontSize: "12px",
          }}
        >
          Expense category information will appear here.
        </span>
      </div>
    );
  }

  /*
    Colors for different expense categories.
    Recharts will cycle through these colors
    if there are more categories.
  */

  const COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#64748b",
  ];

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
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
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
              fontSize: "12px",
              paddingTop: "10px",
            }}
          />

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ExpensePieChart;