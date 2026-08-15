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
  const income = Number(totalIncome) || 0;
  const expense = Number(totalExpense) || 0;
  const savings = Number(currentBalance) || 0;

  // Calculate expense percentage relative to income
  const expensePercentage =
    income > 0
      ? Math.min((expense / income) * 100, 100)
      : 0;

  // Calculate savings percentage relative to income
  const savingsPercentage =
    income > 0
      ? Math.min((savings / income) * 100, 100)
      : 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

      {/* Header */}

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-slate-800">
          Monthly Financial Overview
        </h2>

        <p className="text-slate-500 mt-1">
          Your financial performance this month
        </p>

      </div>


      {/* Income */}

      <div className="mb-8">

        <div className="flex justify-between items-center mb-3">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">

              <FaArrowTrendUp className="text-indigo-600" />

            </div>

            <span className="font-semibold text-slate-700">
              Income
            </span>

          </div>

          <span className="font-bold text-slate-800">
            ₹{income.toLocaleString("en-IN")}
          </span>

        </div>

        <div className="w-full h-3 rounded-full bg-slate-100">

          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-700"
            style={{ width: "100%" }}
          ></div>

        </div>

      </div>


      {/* Expense */}

      <div className="mb-8">

        <div className="flex justify-between items-center mb-3">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">

              <FaArrowTrendDown className="text-purple-600" />

            </div>

            <span className="font-semibold text-slate-700">
              Expense
            </span>

          </div>

          <span className="font-bold text-slate-800">
            ₹{expense.toLocaleString("en-IN")}
          </span>

        </div>

        <div className="w-full h-3 rounded-full bg-slate-100">

          <div
            className="bg-purple-600 h-3 rounded-full transition-all duration-700"
            style={{
              width: `${expensePercentage}%`,
            }}
          ></div>

        </div>

        <p className="text-xs text-slate-400 mt-2">
          {expensePercentage.toFixed(0)}% of your income
        </p>

      </div>


      {/* Savings */}

      <div>

        <div className="flex justify-between items-center mb-3">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">

              <FaPiggyBank className="text-violet-600" />

            </div>

            <span className="font-semibold text-slate-700">
              Savings
            </span>

          </div>

          <span className="font-bold text-slate-800">
            ₹{savings.toLocaleString("en-IN")}
          </span>

        </div>

        <div className="w-full h-3 rounded-full bg-slate-100">

          <div
            className="bg-violet-500 h-3 rounded-full transition-all duration-700"
            style={{
              width: `${savingsPercentage}%`,
            }}
          ></div>

        </div>

        <p className="text-xs text-slate-400 mt-2">
          {savingsPercentage.toFixed(0)}% of your income
        </p>

      </div>

    </div>
  );
}

export default FinancialOverview;