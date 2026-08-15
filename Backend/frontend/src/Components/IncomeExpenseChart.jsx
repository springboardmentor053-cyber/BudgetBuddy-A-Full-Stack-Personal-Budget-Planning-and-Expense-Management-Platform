import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

function IncomeExpenseChart({ data = [] }) {

  const chartData = data.map((item) => ({
    name: item.name,
    amount: Number(item.amount) || 0,
  }));


  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">

      {/* Header */}

      <div className="mb-2">

        <h2 className="text-2xl font-bold text-slate-800">
          Income vs Expense
        </h2>

        <p className="text-slate-500">
          Monthly financial comparison
        </p>

      </div>


      {/* Chart */}

      {chartData.length === 0 ? (

        <div className="h-[320px] flex flex-col items-center justify-center">

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">

            <span className="text-2xl">
              📈
            </span>

          </div>

          <h3 className="font-semibold text-slate-700">
            No Financial Data
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            Add income or expenses to see the comparison.
          </p>

        </div>

      ) : (

        <ResponsiveContainer width="100%" height={320}>

          <BarChart
            data={chartData}
            margin={{
              top: 15,
              right: 10,
              left: 0,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748B",
                fontSize: 14,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748B",
                fontSize: 13,
              }}
              tickFormatter={(value) =>
                `₹${value.toLocaleString("en-IN")}`
              }
            />

            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              formatter={(value) =>
                `₹${Number(value).toLocaleString("en-IN")}`
              }
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 15px rgba(15, 23, 42, 0.08)",
              }}
            />

            <Bar
              dataKey="amount"
              radius={[12, 12, 4, 4]}
              barSize={75}
            >

              {chartData.map((entry, index) => (

                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.name === "Income"
                      ? "#10B981"
                      : "#8B5CF6"
                  }
                />

              ))}

            </Bar>

          </BarChart>

        </ResponsiveContainer>

      )}


      {/* Legend */}

      {chartData.length > 0 && (

        <div className="flex justify-center gap-8 mt-1">

          <div className="flex items-center gap-2">

            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>

            <span className="text-sm text-slate-600">
              Income
            </span>

          </div>

          <div className="flex items-center gap-2">

            <span className="w-3 h-3 rounded-full bg-violet-500"></span>

            <span className="text-sm text-slate-600">
              Expense
            </span>

          </div>

        </div>

      )}

    </div>
  );
}

export default IncomeExpenseChart;