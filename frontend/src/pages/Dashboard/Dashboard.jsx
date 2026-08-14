import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseChart from "../../components/charts/ExpenseChart";
import { getExpenseCategories } from "../../api/categoryApi";
import { getDashboard } from "../../api/dashboardApi";
import StatCard from "../../components/cards/StatCard";
import RecentTransactions from "../../components/common/RecentTransactions";
import { getBudgets } from "../../services/budgetService";
import { getExpenses } from "../../services/expenseService";
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaPlus,
  FaChartPie,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const START_YEAR = 2026;
const YEARS = Array.from({ length: 5 }, (_, i) => START_YEAR + i);

export default function Dashboard() {
  const navigate = useNavigate();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(START_YEAR);

  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  
  // Added budgets and expenses state declarations
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [dashboard, setDashboard] = useState({
    total_income: 0,
    total_expense: 0,
    current_balance: 0,
    total_savings: 0,
    total_budget: 0,
    remaining_budget: 0,
    recent_transactions: [],
    recent_income: [],
    recent_expenses: [],
  });

  useEffect(() => {
    loadDashboardData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const loadDashboardData = async (month, year) => {
    try {
      setLoading(true);

      const [dashRes, catRes, budgetData, expenseData] = await Promise.all([
        getDashboard({ month, year }),
        getExpenseCategories({ month, year }).catch(() => ({ data: [] })),
        getBudgets().catch(() => []),
        getExpenses().catch(() => []),
      ]);

      setBudgets(budgetData || []);
      setExpenses(expenseData || []);

      const data = dashRes.data || {};
      const summary = data.financial_summary || {};

      const totalIncome = summary.total_income || 0;
      const totalExpense = summary.total_expense || 0;
      const remainingBudget = summary.remaining_budget || 0;
      const totalBudget = remainingBudget + totalExpense;

      setDashboard({
        total_income: totalIncome,
        total_expense: totalExpense,
        current_balance: totalIncome - totalExpense,
        total_savings: summary.total_savings || 0,
        total_budget: totalBudget,
        remaining_budget: remainingBudget,
        recent_income: data.recent_income || [],
        recent_expenses: data.recent_expenses || [],
      });

      setCategoryData(
        catRes.data && catRes.data.length ? catRes.data : data.category_analysis || []
      );
    } catch (error) {
      console.error("Error fetching period data:", error);
    } finally {
      setLoading(false);
    }
  };
const selectedMonthName = MONTHS.find((m) => m.value === Number(selectedMonth))?.label;

  const totalSavings = dashboard.total_savings ?? dashboard.current_balance;

  // Get budgets for the selected month and year
const filteredBudgets = budgets.filter(
  (budget) =>
    Number(budget.month) === Number(selectedMonth) &&
    Number(budget.year) === Number(selectedYear)
);

// Select the budget to display on Dashboard
const activeBudget = filteredBudgets[0] || null;

// Budget limit
const totalBudget = activeBudget
  ? Number(activeBudget.monthly_limit || 0)
  : 0;

// Calculate spending ONLY for the selected budget category
const budgetSpent = activeBudget
  ? expenses
      .filter((expense) => {
        const expDate = new Date(expense.expense_date);

        return (
          expense.category === activeBudget.category &&
          expDate.getMonth() + 1 === Number(selectedMonth) &&
          expDate.getFullYear() === Number(selectedYear)
        );
      })
      .reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
      )
  : 0;

// Remaining amount for this budget
const remainingBudget = totalBudget - budgetSpent;

// Usage percentage
const budgetUsagePercent =
  totalBudget > 0
    ? Math.round((budgetSpent / totalBudget) * 100)
    : 0;

const isOverBudget =
  budgetSpent > totalBudget && totalBudget > 0;

const isNearBudget =
  budgetUsagePercent >= 80 && !isOverBudget;

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">

      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 mt-1">
            Showing records for <span className="text-blue-400 font-semibold">{selectedMonthName} {selectedYear}</span>
          </p>
        </div>

        {/* Month & Year Selection Bar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-2xl shadow-sm">
            <FaCalendarAlt className="text-blue-400" />
            
            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value} className="bg-slate-800 text-white">
                  {m.label}
                </option>
              ))}
            </select>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer border-l border-slate-700 pl-2"
            >
              {YEARS.map((y) => (
                <option key={y} value={y} className="bg-slate-800 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => navigate("/expenses")}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-semibold shadow-md transition"
          >
            <FaPlus />
            Add Expense
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex justify-center items-center">
          <p className="text-slate-400 animate-pulse text-lg">
            Updating metrics for {selectedMonthName} {selectedYear}...
          </p>
        </div>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 gap-6">
            <StatCard
              title="Total Balance"
              amount={dashboard.current_balance}
              icon={<FaWallet />}
              color="text-cyan-400"
            />
            <StatCard
              title="Total Income"
              amount={dashboard.total_income}
              icon={<FaArrowUp />}
              color="text-green-400"
            />
            <StatCard
              title="Total Expense"
              amount={dashboard.total_expense}
              icon={<FaArrowDown />}
              color="text-red-400"
            />
            <StatCard
              title="Savings"
              amount={totalSavings}
              icon={<FaPiggyBank />}
              color="text-yellow-400"
            />
          </div>

          {/* Charts & Budget Card */}
          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <FaChartPie className="text-pink-500 text-2xl" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Expense Analytics
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Category spending ratio for {selectedMonthName} {selectedYear}
                  </p>
                </div>
              </div>

              {categoryData.length > 0 ? (
                <ExpenseChart data={categoryData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  No expense category logs found for {selectedMonthName} {selectedYear}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
    Budget Status
  </h2>

  {activeBudget && (
    <span className="text-sm font-semibold text-blue-500">
      {activeBudget.category}
    </span>
  )}
</div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Limit</span>
                    <span className="font-bold">
                      ₹{totalBudget.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Spent</span>
                    <span className="font-bold text-red-500">
                      ₹{budgetSpent.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Remaining</span>
                    <span className={`font-bold ${remainingBudget < 0 ? "text-red-500" : "text-emerald-500"}`}>
                      ₹{remainingBudget.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="pt-3">
                    <div className="flex justify-between text-sm mb-2 font-semibold">
                      <span>Usage</span>
                      <span className={isOverBudget ? "text-red-500" : isNearBudget ? "text-amber-500" : "text-blue-500"}>
                        {budgetUsagePercent}%
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-700 ${
                          isOverBudget
                            ? "bg-red-500"
                            : isNearBudget
                            ? "bg-amber-500"
                            : "bg-gradient-to-r from-blue-500 to-cyan-400"
                        }`}
                        style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                {isOverBudget ? (
                  <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-xl text-xs font-semibold">
                    <FaExclamationTriangle />
                    <span>Budget exceeded by ₹{Math.abs(remainingBudget).toLocaleString("en-IN")}!</span>
                  </div>
                ) : isNearBudget ? (
                  <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-xl text-xs font-semibold">
                    <FaExclamationTriangle />
                    <span>Warning: You've used over 80% of your budget.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-xl text-xs font-semibold">
                    <FaCheckCircle />
                    <span>You are well within your monthly limit.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transactions */}
          <RecentTransactions
            income={dashboard.recent_income}
            expenses={dashboard.recent_expenses}
          />
        </>
      )}

    </div>
  );
}