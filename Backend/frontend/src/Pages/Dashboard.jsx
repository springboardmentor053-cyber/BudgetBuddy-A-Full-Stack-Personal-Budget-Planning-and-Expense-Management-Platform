import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import DashboardCard from "../Components/DashboardCard";
import ExpenseChart from "../Components/ExpenseChart";
import IncomeExpenseChart from "../Components/IncomeExpenseChart";
import RecentTransactions from "../Components/RecentTransactions";
import FinancialOverview from "../Components/FinancialOverview";
import WelcomeBanner from "../Components/WelcomeBanner";

import { useEffect, useState } from "react";
import api from "../services/api";

import {
  FaWallet,
  FaMoneyBillWave,
  FaChartLine,
  FaPiggyBank,
} from "react-icons/fa";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    total_income: 0,
    total_expense: 0,
    current_balance: 0,
    total_budget: 0,
    remaining_budget: 0,
    recent_transactions: [],
    income_vs_expense: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("access");

        const response = await api.get(
          "budgets/dashboard/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDashboardData(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================================
          FIXED SIDEBAR
      ========================================= */}
      <Sidebar />


      {/* =========================================
          MAIN AREA
          253px reserved for fixed sidebar
      ========================================= */}
      <div className="ml-[253px] min-h-screen">

        {/* =========================================
            TOPBAR
        ========================================= */}
        <Topbar />


        {/* =========================================
            DASHBOARD CONTENT
        ========================================= */}
        <main className="p-6 md:p-8">

          {/* =====================================
              WELCOME BANNER
          ===================================== */}
          <WelcomeBanner
            userName="Peehal"
            currentBalance={dashboardData.current_balance}
            totalIncome={dashboardData.total_income}
            totalExpense={dashboardData.total_expense}
          />


          {/* =====================================
              DASHBOARD CARDS
          ===================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">

            {/* TOTAL INCOME */}
            <DashboardCard
              title="Total Income"
              value={
                loading
                  ? "Loading..."
                  : `₹${dashboardData.total_income}`
              }
              percentage="+18%"
              icon={<FaWallet />}
              color="bg-emerald-500"
            />


            {/* TOTAL EXPENSE */}
            <DashboardCard
              title="Total Expense"
              value={
                loading
                  ? "Loading..."
                  : `₹${dashboardData.total_expense}`
              }
              percentage="+7%"
              icon={<FaMoneyBillWave />}
              color="bg-rose-500"
            />


            {/* CURRENT BALANCE */}
            <DashboardCard
              title="Current Balance"
              value={
                loading
                  ? "Loading..."
                  : `₹${dashboardData.current_balance}`
              }
              percentage="+12%"
              icon={<FaChartLine />}
              color="bg-indigo-500"
            />


            {/* REMAINING BUDGET */}
            <DashboardCard
              title="Remaining Budget"
              value={
                loading
                  ? "Loading..."
                  : `₹${dashboardData.remaining_budget}`
              }
              percentage="-3%"
              icon={<FaPiggyBank />}
              color="bg-amber-500"
            />

          </div>


          {/* =====================================
              CHARTS
          ===================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

            {/* EXPENSE CHART */}
            <ExpenseChart
              transactions={
                dashboardData.recent_transactions
              }
            />


            {/* INCOME VS EXPENSE */}
            <IncomeExpenseChart
              data={
                dashboardData.income_vs_expense
              }
            />

          </div>


          {/* =====================================
              BOTTOM SECTION
          ===================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

            {/* RECENT TRANSACTIONS */}
            <RecentTransactions
              transactions={
                dashboardData.recent_transactions
              }
            />


            {/* FINANCIAL OVERVIEW */}
            <FinancialOverview
              totalIncome={
                dashboardData.total_income
              }
              totalExpense={
                dashboardData.total_expense
              }
              currentBalance={
                dashboardData.current_balance
              }
            />

          </div>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;