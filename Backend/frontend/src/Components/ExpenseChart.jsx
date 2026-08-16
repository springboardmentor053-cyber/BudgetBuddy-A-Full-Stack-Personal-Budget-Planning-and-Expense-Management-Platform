import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/*
=========================================================
BUDGETBUDDY LIGHT COLOR PALETTE
=========================================================
*/

const COLORS = [
  "#92643E", // Warm Walnut
  "#56061D", // Burgundy
  "#101C2E", // Navy
  "#B88A63", // Light Walnut
  "#7A263D", // Soft Burgundy
  "#3A4658", // Navy Grey
  "#C9A98A", // Warm Beige
  "#27364A", // Deep Blue
];


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
        backgroundColor: "#FFFFFF",
        borderColor: "#E5DDD2",
      }}
    >

      <p
        className="text-sm font-semibold"
        style={{
          color: "#101C2E",
        }}
      >
        {item.name}
      </p>

      <p
        className="text-sm font-semibold mt-1"
        style={{
          color: "#92643E",
        }}
      >
        ₹{Number(item.value).toLocaleString("en-IN")}
      </p>

    </div>
  );
}


/*
=========================================================
CUSTOM LEGEND
=========================================================
*/

function CustomLegend({ payload }) {

  return (
    <div
      className="
        flex
        flex-wrap
        justify-center
        gap-x-6
        gap-y-3
        mt-3
        px-4
      "
    >

      {payload?.map((entry, index) => (

        <div
          key={`legend-${index}`}
          className="flex items-center gap-2"
        >

          <span
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                entry.color ||
                COLORS[index % COLORS.length],
            }}
          />

          <span
            className="text-xs font-medium"
            style={{
              color: "#6F665B",
            }}
          >
            {entry.value}
          </span>

        </div>

      ))}

    </div>
  );
}


/*
=========================================================
EXPENSE CHART
=========================================================
*/

function ExpenseChart({ transactions = [] }) {

  /*
  -------------------------------------------------------
  GROUP REAL EXPENSES BY CATEGORY
  -------------------------------------------------------
  */

  const categoryTotals = transactions.reduce(
    (acc, transaction) => {

      const category =
        transaction.category || "Other";

      const amount =
        Number(transaction.amount) || 0;

      if (!acc[category]) {
        acc[category] = 0;
      }

      acc[category] += amount;

      return acc;

    },
    {}
  );


  /*
  -------------------------------------------------------
  CONVERT TO RECHARTS DATA
  -------------------------------------------------------
  */

  const data = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);


  /*
  -------------------------------------------------------
  TOTAL EXPENSE
  -------------------------------------------------------
  */

  const totalExpense = data.reduce(
    (sum, item) => sum + item.value,
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
        backgroundColor: "#FFFFFF",
        borderColor: "#E5DDD2",
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
                color: "#101C2E",
              }}
            >
              Expense Analytics
            </h2>

            <p
              className="mt-1"
              style={{
                color: "#6F665B",
              }}
            >
              Category-wise spending
            </p>

          </div>


          {/* TOTAL */}

          {totalExpense > 0 && (

            <div
              className="
                px-3
                py-2
                rounded-xl
                border
              "
              style={{
                backgroundColor: "#F3EBDD",
                borderColor: "#E5DDD2",
              }}
            >

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-wider
                "
                style={{
                  color: "#8B8175",
                }}
              >
                Total
              </p>

              <p
                className="
                  text-sm
                  font-semibold
                  mt-0.5
                "
                style={{
                  color: "#56061D",
                }}
              >
                ₹{totalExpense.toLocaleString("en-IN")}
              </p>

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {data.length === 0 ? (

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
              backgroundColor: "#F3EBDD",
              borderColor: "#E5DDD2",
            }}
          >

            <span className="text-2xl">
              📊
            </span>

          </div>


          <h3
            className="font-semibold"
            style={{
              color: "#101C2E",
            }}
          >
            No Expense Data
          </h3>


          <p
            className="text-sm mt-1"
            style={{
              color: "#8B8175",
            }}
          >
            Add expenses to see your analytics.
          </p>

        </div>

      ) : (

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={105}
              innerRadius={62}
              paddingAngle={3}
              stroke="#FFFFFF"
              strokeWidth={3}
              labelLine={false}
              label={({ percent }) =>
                percent >= 0.08
                  ? `${(percent * 100).toFixed(0)}%`
                  : ""
              }
            >

              {data.map((entry, index) => (

                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[
                      index % COLORS.length
                    ]
                  }
                />

              ))}

            </Pie>


            <Tooltip
              content={<CustomTooltip />}
            />


            <Legend
              content={<CustomLegend />}
              verticalAlign="bottom"
            />

          </PieChart>

        </ResponsiveContainer>

      )}

    </div>
  );
}

export default ExpenseChart;