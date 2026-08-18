import { useState, useEffect } from "react";
import ExpensePieChart from "../components/dashboard/ExpensePieChart";
import DashboardChart from "../components/dashboard/DashboardChart";
import SummaryCard from "../components/dashboard/SummaryCard";
import MonthlyComparisonChart from "../components/Charts/MonthlyComparisonChart";
import { getDashboardAnalytics } from "../services/analyticsServices";
import RecentTransactions from "../components/dashboard/RecentTransaction";
import ActiveSavingsCard from "../components/dashboard/ActiveSavingsCard";

function Dashboard() {
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    current_balance: 0,
    total_savings:0,
    total_budget:0,
    remaining_budget: 0,

  });

  const [expenseData, setExpenseData] = useState<
    { name: string; value: number }[]
  >([]);

  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [activeSavings, setActiveSavings] = useState<any[]>([]);
  async function loadAnalytics() {
    try {
      const response = await getDashboardAnalytics();

      setSummary(response.data.summary);

      setExpenseData(
        response.data.category_analysis.map((item: any) => ({
          name: item.category,
          value: item.amount,
        }))
      );

      setMonthlyTrend(response.data.monthly_trend);

      setNotifications(response.data.notifications);

      setRecentTransactions(response.data.recent_transactions);

      setActiveSavings(response.data.active_savings);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);
  const budgetUsed= 
    summary.remaining_budget<0
      ? 100
      : summary.total_budget >0
        ? ((summary.total_budget - summary.remaining_budget)/ summary.total_budget) * 100
        : 0;
  const budgetProgress = Math.min(100, Math.max(0, budgetUsed));

  const budgetOverrun =
  summary.total_expense > summary.total_budget
    ? summary.total_expense - summary.total_budget
    : 0;

  return (
    <div className="text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-7">

        <SummaryCard
          title="Income"
          amount={`₹${summary.total_income}`}
          color="text-green-600 dark:text-green-400"
        />

        <SummaryCard
          title="Expenses"
          amount={`₹${summary.total_expense}`}
          color="text-red-600 dark:text-red-400"
        />

        <SummaryCard
          title="Current Balance"
          amount={`₹${summary.current_balance}`}
          color="text-blue-600 dark:text-blue-400"
        />

        <SummaryCard
          title="Budget Left"
          amount={`₹${summary.remaining_budget}`}
          color="text-purple-600 dark:text-purple-400"
        />
        <SummaryCard
          title="Total Savings"
          amount={`₹${summary.total_savings}`}
          color="text-green-600 dark:text-green-400"
        />
        <SummaryCard
          title="Total Budget"
          amount={`₹${summary.total_budget}`}
          color="text-orange-600 dark:text-orange-400"
        />

      </div>

      {/* Financial Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 mt-10 transition-colors duration-300">

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-8">
          Financial Overview
        </h2>

        <DashboardChart
          income={summary.total_income}
          expense={summary.total_expense}
        />

        <div className="mt-10">
          <ExpensePieChart data={expenseData} />
        </div>

        <div className="mt-10">
          <MonthlyComparisonChart data={monthlyTrend} />
        </div>

      </div>
      {/* Budget Utilization */}

<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mt-10">

  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
    Budget Utilization
  </h2>

  <div className="flex justify-between mb-2">

    <span className="text-gray-600 dark:text-gray-300">
      Used
    </span>

    <span className="font-semibold text-gray-800 dark:text-white">
      {Math.round(budgetUsed)}%
    </span>

  </div>

  {/* Progress Bar */}

  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">

    <div
      className={`h-full rounded-full transition-all duration-500 ${
        budgetUsed > 100
          ? "bg-red-500"
          : budgetUsed >= 80
          ? "bg-yellow-500"
          : "bg-green-500"
      }`}
      style={{
        width: `${budgetProgress}%`,
      }}
    />

  </div>

  <div className="flex justify-between mt-4 text-sm">

    <span className="text-gray-600 dark:text-gray-300">
      Budget: ₹{summary.total_budget}
    </span>

    <span className="text-gray-600 dark:text-gray-300">
      Spent: ₹{summary.total_expense}
    </span>

  </div>

  {budgetOverrun > 0 ? (

    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">

      ⚠️ Over budget by ₹{budgetOverrun}

    </div>

  ) : (

    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">

      ✅ You are within your budget.

    </div>

  )}

</div>
{/* Savings Goal Progress */}

<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mt-10">

  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
    Savings Goal Progress
  </h2>

  {activeSavings.length === 0 ? (

    <div className="text-center text-gray-500 dark:text-gray-400  py-6">
      No active savings goals.
    </div>

  ) : (

    <div className="space-y-6">

      {activeSavings.map((goal) => {

        const progress =
          goal.target_amount > 0
            ? (goal.saved_amount / goal.target_amount) * 100
            : 0;

        const progressValue = Math.min(
          100,
          Math.max(0, progress)
        );

        return (

          <div key={goal.id}>

            <div className="flex justify-between mb-2">

              <div>

                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {goal.goal_name}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ₹{goal.saved_amount} / ₹{goal.target_amount}
                </p>

              </div>

              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {Math.round(progress)}%
              </span>

            </div>

            {/* Progress Bar */}

            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">

              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: `${progressValue}%`,
                }}
              />

            </div>

            {goal.target_date && (

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Target date: {goal.target_date}
              </p>

            )}

          </div>

        );

      })}

    </div>

  )}

</div>

      {/* Recent Transactions + Active Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 transition-colors duration-300">

          <RecentTransactions
            transactions={recentTransactions}
          />

        </div>

        {/* Active Savings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 transition-colors duration-300">

          <ActiveSavingsCard
            savings={activeSavings}
          />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;