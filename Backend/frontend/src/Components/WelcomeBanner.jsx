import { FaHandSparkles } from "react-icons/fa6";

function WelcomeBanner({
  userName = "Peehal",
  currentBalance = 0,
  totalIncome = 0,
  totalExpense = 0,
}) {
  const balance = Number(currentBalance) || 0;
  const income = Number(totalIncome) || 0;
  const expense = Number(totalExpense) || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-7 md:p-8 shadow-lg">

      {/* Decorative background */}

      <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

      <div className="absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-indigo-300/10 blur-2xl" />


      {/* Main Content */}

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">

        {/* Greeting */}

        <div className="min-w-0">

          <div className="flex items-center gap-3">

            <FaHandSparkles className="text-3xl text-yellow-300 shrink-0" />

            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Good Afternoon, {userName}
            </h1>

          </div>

          <div className="flex items-center gap-2 mt-1 ml-10">
            <span className="text-3xl">
              👋
            </span>
          </div>

          <p className="mt-3 text-indigo-100 text-base md:text-lg max-w-2xl leading-relaxed">
            Welcome back to BudgetBuddy. Here's your financial summary for today.
          </p>

        </div>


        {/* Financial Summary */}

        <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:min-w-[430px]">

          {/* Balance */}

          <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 px-4 py-4">

            <p className="text-xs sm:text-sm text-indigo-100">
              Current Balance
            </p>

            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              ₹{balance.toLocaleString("en-IN")}
            </p>

          </div>


          {/* Income */}

          <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 px-4 py-4">

            <p className="text-xs sm:text-sm text-indigo-100">
              Income
            </p>

            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              ₹{income.toLocaleString("en-IN")}
            </p>

          </div>


          {/* Expense */}

          <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 px-4 py-4">

            <p className="text-xs sm:text-sm text-indigo-100">
              Expenses
            </p>

            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              ₹{expense.toLocaleString("en-IN")}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default WelcomeBanner;