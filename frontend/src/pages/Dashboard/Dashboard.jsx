import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseChart from "../../components/charts/ExpenseChart";
import { getExpenseCategories } from "../../api/categoryApi";
import { getIncome } from "../../api/incomeApi";
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaPlus,
  FaChartPie,
} from "react-icons/fa";

import { getDashboard } from "../../api/dashboardApi";

import StatCard from "../../components/cards/StatCard";
import RecentTransactions from "../../components/common/RecentTransactions";
// import DashboardLayout from "../../layouts/DashboardLayout";
export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
  total_income: 0,
  total_expense: 0,
  current_balance: 0,
  total_budget: 0,
  remaining_budget: 0,
  recent_transactions: [],
  recent_income: [],
  recent_expenses: [],
});
const [income,setIncome] = useState([]);

useEffect(()=>{
  getIncome()
   .then(res=>{
      setIncome(res.data);
   })
},[]);
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
useEffect(() => {
  loadDashboard();
  loadCategories();
}, []);

  const loadDashboard = async () => {
    try {
      const response = await getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const loadCategories = async () => {
  try {
    const response = await getExpenseCategories();
    setCategoryData(response.data);
  } catch (error) {
    console.error(error);
  }
};

  const hour = new Date().getHours();

const greeting =
  hour < 11
    ? "Good Morning"
    : hour < 16
    ? "Good Afternoon"
    : "Good Evening";

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white">
        <h1 className="text-2xl font-bold">
          Loading Dashboard...
        </h1>
      </div>
    );
  }

  return (
      // <DashboardLayout>
  <div className="space-y-8">

      {/* Header */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

  <div>

    <p className="text-slate-500 text-sm">
      {new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </p>

    <h1 className="text-4xl font-bold text-white">
      {greeting} 👋
    </h1>

    <p className="text-slate-500 mt-2">
      Here's an overview of your finances today.
    </p>

  </div>

  <button
    onClick={() => navigate("/expenses")}
    className="
      flex
      items-center
      gap-2
      rounded-2xl
      bg-blue-600
      hover:bg-blue-700
      px-6
      py-3
      text-white
      font-semibold
      shadow-md
      transition
    "
  >
    <FaPlus />
    Add Expense
  </button>

</div>

      {/* Stats */}

     <div className="grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 gap-6 mt-8">
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
          amount={dashboard.current_balance}
          icon={<FaPiggyBank />}
          color="text-yellow-400"
        />

      </div>
<div className="grid xl:grid-cols-3 gap-6 mt-8">

  {/* Expense Analytics */}
  <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">

    <div className="flex items-center gap-3 mb-5">
      <FaChartPie className="text-pink-500 text-2xl" />
       <h2 className="text-2xl font-bold text-slate-900">
        Expense Analytics
    </h2>

    <p className="text-sm text-slate-500 mt-1">
        Track your spending across different categories.
    </p>
    </div>

    <ExpenseChart data={categoryData} />

  </div>


{/* Monthly Budget */}
<div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">

  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
    Monthly Budget
  </h2>

  <div className="space-y-5">

    <div className="flex justify-between">
      <span className="text-slate-500 dark:text-slate-400">
        Total Budget
      </span>
      <span className="font-bold text-slate-900 dark:text-white">
        ₹{Number(dashboard.total_budget).toLocaleString("en-IN")}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-slate-500 dark:text-slate-400">
        Spent
      </span>
      <span className="font-bold text-red-600">
        ₹{Number(dashboard.total_expense).toLocaleString("en-IN")}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-slate-500 dark:text-slate-400">
        Remaining
      </span>
      <span className="font-bold text-green-600">
        ₹{Number(dashboard.remaining_budget).toLocaleString("en-IN")}
      </span>
    </div>

    <div className="pt-2">

      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-500 dark:text-slate-400">
          Usage
        </span>

        <span className="font-semibold text-blue-600">
          {dashboard.total_budget > 0
            ? Math.round(
                (dashboard.total_expense /
                  dashboard.total_budget) *
                  100
              )
            : 0}
          %
        </span>
      </div>

      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">

        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
          style={{
            width: `${
              dashboard.total_budget > 0
                ? Math.min(
                    100,
                    (dashboard.total_expense /
                      dashboard.total_budget) *
                      100
                  )
                : 0
            }%`,
          }}
        />

      </div>

    </div>

  </div>

</div>
</div>
      {/* Recent Transactions */}

      <RecentTransactions
        income={dashboard.recent_income}
        expenses={dashboard.recent_expenses}
      />

      {/* Quick Actions */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-5">

          Quick Actions

        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

  <button
    onClick={() => navigate("/expenses")}
    className="bg-white border border-slate-200 rounded-3xl p-6 text-left shadow-sm hover:shadow-lg transition"
  >
    <FaPlus className="text-3xl text-red-500 mb-4" />

    <h3 className="font-bold text-slate-900">
      Add Expense
    </h3>

    <p className="text-sm text-slate-500 mt-2">
      Record a new expense.
    </p>
  </button>

  <button
    onClick={() => navigate("/income")}
    className="bg-white border border-slate-200 rounded-3xl p-6 text-left shadow-sm hover:shadow-lg transition"
  >
    <FaArrowUp className="text-3xl text-green-500 mb-4" />

    <h3 className="font-bold text-slate-900">
      Add Income
    </h3>

    <p className="text-sm text-slate-500 mt-2">
      Add a new income source.
    </p>
  </button>

  <button
    onClick={() => navigate("/budget")}
    className="bg-white border border-slate-200 rounded-3xl p-6 text-left shadow-sm hover:shadow-lg transition"
  >
    <FaWallet className="text-3xl text-blue-500 mb-4" />

    <h3 className="font-bold text-slate-900">
      Create Budget
    </h3>

    <p className="text-sm text-slate-500 mt-2">
      Set monthly spending limits.
    </p>
  </button>

  <button
    onClick={() => navigate("/reports")}
    className="bg-white border border-slate-200 rounded-3xl p-6 text-left shadow-sm hover:shadow-lg transition"
  >
    <FaChartPie className="text-3xl text-purple-500 mb-4" />

    <h3 className="font-bold text-slate-900">
      View Reports
    </h3>

    <p className="text-sm text-slate-500 mt-2">
      Analyze your financial reports.
    </p>
  </button>

</div>
      </div>

    </div>
    //  </DashboardLayout> 
  );
}