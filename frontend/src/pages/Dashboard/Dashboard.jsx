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
   <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white rounded-2xl p-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold">
            {greeting} 👋
          </h1>

          <p className="text-gray-400 mt-2">
            Welcome back! Here's your financial overview.
          </p>

        </div>

        <button
          onClick={() => navigate("/expenses")}
          className="mt-5 md:mt-0 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 py-3 rounded-xl flex items-center gap-2"
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

      {/* Budget Progress */}

      <div className="bg-slate-800 rounded-2xl p-6 mt-8">

        <div className="flex justify-between mb-3">

          <h2 className="text-xl font-semibold">
            Monthly Budget Usage
          </h2>

          <span className="text-cyan-400">
            {dashboard.total_expense > 0
              ? Math.min(
                  100,
                  Math.round(
                    (dashboard.total_expense /
                      (dashboard.total_income || 1)) *
                      100
                  )
                )
              : 0}
            %
          </span>

        </div>

        <div className="w-full bg-slate-700 rounded-full h-3">

          <div
            className="bg-cyan-400 h-3 rounded-full"
            style={{
              width: `${
                dashboard.total_expense > 0
                  ? Math.min(
                      100,
                      (dashboard.total_expense /
                        (dashboard.total_income || 1)) *
                        100
                    )
                  : 0
              }%`,
            }}
          ></div>

        </div>

      </div>

      {/* Analytics */}

      <div className="bg-slate-800 rounded-2xl p-6 mt-8">

        <div className="flex items-center gap-3 mb-5">

          <FaChartPie className="text-pink-400 text-2xl" />

          <h2 className="text-2xl font-semibold">
            Expense Analytics
          </h2>

        </div>
<ExpenseChart data={categoryData} />

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

        <div className="grid md:grid-cols-4 gap-5">

          <button
            onClick={() => navigate("/expenses")}
            className="bg-cyan-500 hover:bg-cyan-400 rounded-xl py-4 font-semibold text-slate-900"
          >
            Add Expense
          </button>

          <button
            onClick={() => navigate("/income")}
            className="bg-green-500 hover:bg-green-400 rounded-xl py-4 font-semibold text-slate-900"
          >
            Add Income
          </button>

          <button
            onClick={() => navigate("/budget")}
            className="bg-yellow-500 hover:bg-yellow-400 rounded-xl py-4 font-semibold text-slate-900"
          >
            Create Budget
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="bg-pink-500 hover:bg-pink-400 rounded-xl py-4 font-semibold text-slate-900"
          >
            View Reports
          </button>

        </div>

      </div>

    </div>
    //  </DashboardLayout> 
  );
}