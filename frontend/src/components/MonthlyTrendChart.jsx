import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function MonthlyTrendChart({ data = [] }) {

  return (

    <div className="card shadow border-0 h-100">

      <div className="card-body">

        <h4 className="mb-4">
          📈 Six-Month Financial Trend
        </h4>

        {data.length > 0 ? (

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
              />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  `₹ ${Number(value).toLocaleString("en-IN")}`
                }
              />

              <Legend />

              {/* Income */}

              <Line
                type="monotone"
                dataKey="income"
                stroke="#198754"
                strokeWidth={3}
                name="Income"
                dot={{ r: 4 }}
              />

              {/* Expense */}

              <Line
                type="monotone"
                dataKey="expense"
                stroke="#dc3545"
                strokeWidth={3}
                name="Expense"
                dot={{ r: 4 }}
              />

              {/* Balance */}

              <Line
                type="monotone"
                dataKey="balance"
                stroke="#0d6efd"
                strokeWidth={3}
                name="Balance"
                dot={{ r: 4 }}
              />

            </LineChart>

          </ResponsiveContainer>

        ) : (

          <div className="text-center text-muted py-5">

            <h5>
              📭 No Financial Data
            </h5>

            <p className="mb-0">
              Add income and expenses to see your trend.
            </p>

          </div>

        )}

      </div>

    </div>

  );
}

export default MonthlyTrendChart;