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

function IncomeExpenseChart({ income, expense }) {
  const data = [
    {
      name: "Overview",
      Income: Number(income || 0),
      Expense: Number(expense || 0),
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "320px",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
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
            dataKey="name"
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
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text)",
            }}
            labelStyle={{
              color: "var(--text)",
              fontWeight: "600",
            }}
          />

          <Legend
            wrapperStyle={{
              color: "var(--text-secondary)",
              fontSize: "13px",
            }}
          />

          <Bar
            dataKey="Expense"
            fill="#ef4444"
            radius={[6, 6, 0, 0]}
            barSize={45}
          />

          <Bar
            dataKey="Income"
            fill="#22c55e"
            radius={[6, 6, 0, 0]}
            barSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default IncomeExpenseChart;