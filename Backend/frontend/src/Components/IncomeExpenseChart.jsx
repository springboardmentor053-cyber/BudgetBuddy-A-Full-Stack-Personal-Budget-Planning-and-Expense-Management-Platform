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


/*
=========================================================
BUDGETBUDDY LIGHT COLORS
=========================================================
*/

const NAVY = "#101C2E";
const WHITE = "#FFFFFF";
const BEIGE = "#F3EBDD";
const LIGHT_BEIGE = "#F8F5EF";
const MUTED = "#6F665B";
const LIGHT_MUTED = "#8B8175";
const BORDER = "#E5DDD2";
const WALNUT = "#92643E";
const BURGUNDY = "#56061D";


/*
=========================================================
CUSTOM TOOLTIP
=========================================================
*/

function CustomTooltip({ active, payload }) {

  if (!active || !payload || !payload.length) {
    return null;
  }

  const item = payload[0];

  const isIncome =
    item.payload.name === "Income";

  return (
    <div
      className="
        rounded-xl
        px-4
        py-3
        shadow-lg
        border
      "
      style={{
        backgroundColor: WHITE,
        borderColor: isIncome
          ? `${WALNUT}40`
          : `${BURGUNDY}30`,
      }}
    >

      <p
        className="
          text-xs
          uppercase
          tracking-wide
        "
        style={{
          color: LIGHT_MUTED,
        }}
      >
        {item.payload.name}
      </p>


      <p
        className="
          text-lg
          font-semibold
          mt-1
        "
        style={{
          color: isIncome
            ? WALNUT
            : BURGUNDY,
        }}
      >
        ₹{Number(item.value).toLocaleString("en-IN")}
      </p>

    </div>
  );
}


/*
=========================================================
INCOME VS EXPENSE CHART
=========================================================
*/

function IncomeExpenseChart({ data = [] }) {

  /*
  -------------------------------------------------------
  USE REAL DATA FROM BACKEND
  -------------------------------------------------------
  */

  const chartData = data.map((item) => ({
    name: item.name,
    amount: Number(item.amount) || 0,
  }));


  /*
  -------------------------------------------------------
  CALCULATE TOTAL
  -------------------------------------------------------
  */

  const total = chartData.reduce(
    (sum, item) => sum + item.amount,
    0
  );


  return (

    <div
      className="
        rounded-[1.5rem]
        p-6
        shadow-[0_10px_30px_rgba(16,28,46,0.08)]
        border
        h-full
      "
      style={{
        backgroundColor: WHITE,
        borderColor: BORDER,
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-2">

        <div className="flex items-center justify-between">

          <div>

            <h2
              className="
                text-2xl
                font-semibold
                tracking-tight
              "
              style={{
                color: NAVY,
              }}
            >
              Income vs Expense
            </h2>

            <p
              className="mt-1"
              style={{
                color: MUTED,
              }}
            >
              Monthly financial comparison
            </p>

          </div>


          {/* Net position */}

          {chartData.length > 0 && (

            <div
              className="
                hidden
                sm:block
                px-3
                py-2
                rounded-xl
                border
              "
              style={{
                backgroundColor: BEIGE,
                borderColor: `${WALNUT}30`,
              }}
            >

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-wider
                "
                style={{
                  color: LIGHT_MUTED,
                }}
              >
                Total Flow
              </p>

              <p
                className="
                  text-sm
                  font-semibold
                  mt-0.5
                "
                style={{
                  color: WALNUT,
                }}
              >
                ₹{total.toLocaleString("en-IN")}
              </p>

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {chartData.length === 0 ? (

        <div
          className="
            h-[320px]
            flex
            flex-col
            items-center
            justify-center
          "
        >

          <div
            className="
              w-16
              h-16
              rounded-2xl
              flex
              items-center
              justify-center
              mb-4
              border
            "
            style={{
              backgroundColor: BEIGE,
              borderColor: BORDER,
            }}
          >

            <span className="text-2xl">
              📈
            </span>

          </div>


          <h3
            className="font-semibold"
            style={{
              color: NAVY,
            }}
          >
            No Financial Data
          </h3>


          <p
            className="text-sm mt-1"
            style={{
              color: LIGHT_MUTED,
            }}
          >
            Add income or expenses to see the comparison.
          </p>

        </div>

      ) : (

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 10,
              left: 5,
              bottom: 10,
            }}
          >

            {/* =================================================
                GRID
            ================================================= */}

            <CartesianGrid
              strokeDasharray="3 5"
              stroke="#EDE5D9"
              vertical={false}
            />


            {/* =================================================
                X AXIS
            ================================================= */}

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: MUTED,
                fontSize: 13,
                fontWeight: 500,
              }}
            />


            {/* =================================================
                Y AXIS
            ================================================= */}

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: LIGHT_MUTED,
                fontSize: 12,
              }}
              tickFormatter={(value) =>
                `₹${Number(value).toLocaleString("en-IN")}`
              }
            />


            {/* =================================================
                TOOLTIP
            ================================================= */}

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "#F3EBDD",
              }}
            />


            {/* =================================================
                BARS
            ================================================= */}

            <Bar
              dataKey="amount"
              radius={[12, 12, 4, 4]}
              barSize={75}
            >

              {chartData.map(
                (entry, index) => (

                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "Income"
                        ? WALNUT
                        : BURGUNDY
                    }
                  />

                )
              )}

            </Bar>

          </BarChart>

        </ResponsiveContainer>

      )}


      {/* =================================================
          CUSTOM LEGEND
      ================================================= */}

      {chartData.length > 0 && (

        <div
          className="
            flex
            justify-center
            gap-8
            mt-1
          "
        >

          {/* Income */}

          <div className="flex items-center gap-2">

            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: WALNUT,
              }}
            />

            <span
              className="text-sm"
              style={{
                color: MUTED,
              }}
            >
              Income
            </span>

          </div>


          {/* Expense */}

          <div className="flex items-center gap-2">

            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: BURGUNDY,
              }}
            />

            <span
              className="text-sm"
              style={{
                color: MUTED,
              }}
            >
              Expense
            </span>

          </div>

        </div>

      )}

    </div>

  );
}

export default IncomeExpenseChart;