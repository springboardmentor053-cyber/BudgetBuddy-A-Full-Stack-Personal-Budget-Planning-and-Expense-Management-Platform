import {
  FaHandSparkles,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

function WelcomeBanner({
  userName,
  currentBalance = 0,
  totalIncome = 0,
  totalExpense = 0,
}) {
  // =========================================================
  // GET ACTUAL USERNAME
  // =========================================================

  const storedUsername =
    localStorage.getItem("username");

  const displayName =
    userName ||
    storedUsername ||
    "User";

  // =========================================================
  // FINANCIAL VALUES
  // =========================================================

  const balance =
    Number(currentBalance) || 0;

  const income =
    Number(totalIncome) || 0;

  const expense =
    Number(totalExpense) || 0;

  // =========================================================
  // SAVINGS RATE
  // =========================================================

  const remainingAfterExpense =
    income - expense;

  const savingsRate =
    income > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (remainingAfterExpense / income) * 100
          )
        )
      : 0;

  // =========================================================
  // GREETING
  // =========================================================

  const hour = new Date().getHours();

  let greeting = "Good Morning";

  if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
  } else if (hour >= 21 || hour < 5) {
    greeting = "Good Night";
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[2rem]
        bg-white
        border
        border-[#E5DDD2]
        p-7
        md:p-8
        shadow-[0_10px_30px_rgba(16,28,46,0.08)]
      "
    >

      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div
        className="
          absolute
          -right-28
          -top-32
          w-96
          h-96
          rounded-full
          bg-[#92643E]/10
          blur-3xl
        "
      />

      <div
        className="
          absolute
          -left-28
          -bottom-36
          w-96
          h-96
          rounded-full
          bg-[#56061D]/[0.06]
          blur-3xl
        "
      />

      <div
        className="
          absolute
          right-1/3
          top-0
          w-64
          h-64
          rounded-full
          bg-[#F3EBDD]/70
          blur-3xl
        "
      />


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          flex
          flex-col
          xl:flex-row
          xl:items-center
          xl:justify-between
          gap-8
        "
      >

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="min-w-0">

          {/* LABEL */}

          <div className="flex items-center gap-3">

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-[#F3EBDD]
                border
                border-[#E5DDD2]
                flex
                items-center
                justify-center
              "
            >

              <FaHandSparkles
                className="
                  text-[#92643E]
                  text-xl
                "
              />

            </div>

            <span
              className="
                text-sm
                font-medium
                tracking-[0.08em]
                text-[#6F665B]
              "
            >
              BUDGETBUDDY • SMART FINANCE
            </span>

          </div>


          {/* =================================================
              GREETING
          ================================================= */}

          <h1
            className="
              text-3xl
              md:text-4xl
              xl:text-5xl
              font-semibold
              text-[#101C2E]
              mt-5
              tracking-tight
            "
          >

            {greeting}, {displayName}

            <span className="ml-2">
              👋
            </span>

          </h1>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p
            className="
              mt-3
              text-[#6F665B]
              text-base
              md:text-lg
              max-w-2xl
              leading-relaxed
            "
          >
            Your financial overview, all in one place.
            Understand your spending, track your goals,
            and make smarter decisions with your money.
          </p>


          {/* =================================================
              MONEY YOU KEEP
          ================================================= */}

          <div className="mt-6 max-w-xl">

            <div
              className="
                flex
                items-center
                justify-between
                mb-2
              "
            >

              <span
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#8B8175]
                "
              >
                Money You Keep
              </span>

              <span
                className="
                  text-sm
                  font-semibold
                  text-[#56061D]
                "
              >
                {savingsRate.toFixed(0)}%
              </span>

            </div>


            <div
              className="
                h-2.5
                bg-[#EDE5D9]
                rounded-full
                overflow-hidden
              "
            >

              <div
                className="
                  h-full
                  bg-gradient-to-r
                  from-[#92643E]
                  to-[#B9855B]
                  rounded-full
                  transition-all
                  duration-700
                "
                style={{
                  width: `${savingsRate}%`,
                }}
              />

            </div>

          </div>

        </div>


        {/* ===================================================
            FINANCIAL SNAPSHOT
        =================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            xl:w-[500px]
            gap-3
          "
        >

          {/* =================================================
              BALANCE
          ================================================= */}

          <div
            className="
              rounded-2xl
              bg-[#F3EBDD]
              border
              border-[#E5DDD2]
              p-4
            "
          >

            <p
              className="
                text-xs
                text-[#6F665B]
                uppercase
                tracking-wide
              "
            >
              Balance
            </p>

            <p
              className="
                text-xl
                md:text-2xl
                font-semibold
                text-[#101C2E]
                mt-2
              "
            >
              ₹{balance.toLocaleString("en-IN")}
            </p>

            <div
              className="
                flex
                items-center
                gap-1
                mt-2
                text-xs
                text-[#92643E]
              "
            >

              <FaArrowUp />

              Available

            </div>

          </div>


          {/* =================================================
              INCOME
          ================================================= */}

          <div
            className="
              rounded-2xl
              bg-[#92643E]/10
              border
              border-[#92643E]/20
              p-4
            "
          >

            <p
              className="
                text-xs
                text-[#6F665B]
                uppercase
                tracking-wide
              "
            >
              Income
            </p>

            <p
              className="
                text-xl
                md:text-2xl
                font-semibold
                text-[#92643E]
                mt-2
              "
            >
              ₹{income.toLocaleString("en-IN")}
            </p>

            <div
              className="
                flex
                items-center
                gap-1
                mt-2
                text-xs
                text-[#92643E]
              "
            >

              <FaArrowUp />

              Inflow

            </div>

          </div>


          {/* =================================================
              EXPENSE
          ================================================= */}

          <div
            className="
              rounded-2xl
              bg-[#56061D]/[0.06]
              border
              border-[#56061D]/15
              p-4
            "
          >

            <p
              className="
                text-xs
                text-[#6F665B]
                uppercase
                tracking-wide
              "
            >
              Expenses
            </p>

            <p
              className="
                text-xl
                md:text-2xl
                font-semibold
                text-[#56061D]
                mt-2
              "
            >
              ₹{expense.toLocaleString("en-IN")}
            </p>

            <div
              className="
                flex
                items-center
                gap-1
                mt-2
                text-xs
                text-[#56061D]
              "
            >

              <FaArrowDown />

              Outflow

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default WelcomeBanner;