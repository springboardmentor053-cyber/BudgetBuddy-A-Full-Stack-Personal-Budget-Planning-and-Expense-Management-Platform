import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function MonthlyExpenseChart({ data }) {
  const chartData = (data || []).map((item) => ({
    month: `${item.month} ${item.year}`,
    expense: Number(item.total_amount || 0),
  }));

  return (
    <div
      style={{
        width: "100%",
        height: "320px",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148, 163, 184, 0.15)"
          />

          <XAxis
            dataKey="month"
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 12,
            }}
            axisLine={{
              stroke: "var(--border)",
            }}
            tickLine={false}
          />

          <YAxis
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
          />

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

          <Line
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{
              r: 4,
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyExpenseChart;