import { useState, useEffect } from "react";
import ExpensePieChart from "../components/dashboard/ExpensePieChart";

import DashboardChart from "../components/dashboard/DashboardChart";
import SummaryCard from "../components/dashboard/SummaryCard";

import { getDashboardSummary } from "../services/dashboardServices";

function Dashboard() {
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    current_balance: 0,
    remaining_budget: 0,
  });

  async function loadDashboard() {
    try {
      const response = await getDashboardSummary();
      setSummary(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);
  
  const expenseData = [
  { name: "Food", value: 6500 },
  { name: "Travel", value: 3200 },
  { name: "Shopping", value: 4800 },
  { name: "Bills", value: 2500 },
  { name: "Healthcare", value: 1200 },
];
  return (
    <div className="p-8">

      <div className="p-8">

        
        {/* Summary Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7 mt-10">

          <SummaryCard
            title="Income"
            amount={`₹${summary.total_income}`}
            color="text-green-600"
          />

          <SummaryCard
            title="Expenses"
            amount={`₹${summary.total_expense}`}
            color="text-red-600"
          />

          <SummaryCard
            title="Current Balance"
            amount={`₹${summary.current_balance}`}
            color="text-blue-600"
          />

          <SummaryCard
            title="Budget Left"
            amount={`₹${summary.remaining_budget}`}
            color="text-purple-600"
          />

        </div>

        {/* Chart */}

        <div className="mt-8">

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mt-10">

          <h2 className="text-2xl font-semibold mb-8">

               Financial Overview

          </h2>

          <DashboardChart
               income={summary.total_income}
               expense={summary.total_expense}
          />
          <ExpensePieChart
          data={expenseData}
          />

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;