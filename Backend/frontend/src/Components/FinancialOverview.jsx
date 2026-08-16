import {
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaPiggyBank,
} from "react-icons/fa6";


function FinancialOverview({
  totalIncome = 0,
  totalExpense = 0,
  currentBalance = 0,
}) {

  const income =
    Number(totalIncome) || 0;

  const expense =
    Number(totalExpense) || 0;

  const savings =
    Number(currentBalance) || 0;


  /*
  ========================================================
  REAL CALCULATIONS FROM DASHBOARD DATA
  ========================================================
  */

  const expensePercentage =
    income > 0
      ? Math.min(
          (expense / income) * 100,
          100
        )
      : 0;


  const savingsPercentage =
    income > 0
      ? Math.min(
          (savings / income) * 100,
          100
        )
      : 0;


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

      <div className="mb-8">

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
          Monthly Financial Overview
        </h2>


        <p
          className="mt-1"
          style={{
            color: "#6F665B",
          }}
        >
          Your financial performance this month
        </p>

      </div>


      {/* =================================================
          INCOME
      ================================================= */}

      <div className="mb-8">

        <div className="flex justify-between items-center mb-3">

          <div className="flex items-center gap-3">

            {/* Icon */}

            <div
              className="
                w-9
                h-9
                rounded-xl
                flex
                items-center
                justify-center
                border
              "
              style={{
                backgroundColor:
                  "rgba(146,100,62,0.08)",
                borderColor:
                  "rgba(146,100,62,0.20)",
              }}
            >

              <FaArrowTrendUp
                style={{
                  color: "#92643E",
                }}
              />

            </div>


            <span
              className="font-medium"
              style={{
                color: "#101C2E",
              }}
            >
              Income
            </span>

          </div>


          <span
            className="font-semibold"
            style={{
              color: "#92643E",
            }}
          >
            ₹{income.toLocaleString("en-IN")}
          </span>

        </div>


        {/* Progress background */}

        <div
          className="
            w-full
            h-3
            rounded-full
            overflow-hidden
          "
          style={{
            backgroundColor: "#EDE5D9",
          }}
        >

          <div
            className="
              h-3
              rounded-full
              transition-all
              duration-700
            "
            style={{
              width: "100%",
              backgroundColor: "#92643E",
            }}
          />

        </div>

      </div>


      {/* =================================================
          EXPENSE
      ================================================= */}

      <div className="mb-8">

        <div className="flex justify-between items-center mb-3">

          <div className="flex items-center gap-3">

            {/* Icon */}

            <div
              className="
                w-9
                h-9
                rounded-xl
                flex
                items-center
                justify-center
                border
              "
              style={{
                backgroundColor:
                  "rgba(86,6,29,0.06)",
                borderColor:
                  "rgba(86,6,29,0.15)",
              }}
            >

              <FaArrowTrendDown
                style={{
                  color: "#56061D",
                }}
              />

            </div>


            <span
              className="font-medium"
              style={{
                color: "#101C2E",
              }}
            >
              Expense
            </span>

          </div>


          <span
            className="font-semibold"
            style={{
              color: "#56061D",
            }}
          >
            ₹{expense.toLocaleString("en-IN")}
          </span>

        </div>


        {/* Progress */}

        <div
          className="
            w-full
            h-3
            rounded-full
            overflow-hidden
          "
          style={{
            backgroundColor: "#EDE5D9",
          }}
        >

          <div
            className="
              h-3
              rounded-full
              transition-all
              duration-700
            "
            style={{
              width: `${expensePercentage}%`,
              backgroundColor: "#56061D",
            }}
          />

        </div>


        <p
          className="text-xs mt-2"
          style={{
            color: "#8B8175",
          }}
        >
          {expensePercentage.toFixed(0)}% of your income
        </p>

      </div>


      {/* =================================================
          SAVINGS
      ================================================= */}

      <div>

        <div className="flex justify-between items-center mb-3">

          <div className="flex items-center gap-3">

            {/* Icon */}

            <div
              className="
                w-9
                h-9
                rounded-xl
                flex
                items-center
                justify-center
                border
              "
              style={{
                backgroundColor:
                  "rgba(146,100,62,0.08)",
                borderColor:
                  "rgba(146,100,62,0.20)",
              }}
            >

              <FaPiggyBank
                style={{
                  color: "#92643E",
                }}
              />

            </div>


            <span
              className="font-medium"
              style={{
                color: "#101C2E",
              }}
            >
              Savings
            </span>

          </div>


          <span
            className="font-semibold"
            style={{
              color: "#92643E",
            }}
          >
            ₹{savings.toLocaleString("en-IN")}
          </span>

        </div>


        {/* Progress */}

        <div
          className="
            w-full
            h-3
            rounded-full
            overflow-hidden
          "
          style={{
            backgroundColor: "#EDE5D9",
          }}
        >

          <div
            className="
              h-3
              rounded-full
              transition-all
              duration-700
            "
            style={{
              width: `${savingsPercentage}%`,
              backgroundColor: "#92643E",
            }}
          />

        </div>


        <p
          className="text-xs mt-2"
          style={{
            color: "#8B8175",
          }}
        >
          {savingsPercentage.toFixed(0)}% of your income
        </p>

      </div>

    </div>
  );
}

export default FinancialOverview;