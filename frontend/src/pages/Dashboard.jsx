import "./Dashboard.css";

import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";


function Dashboard() {

  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);


  const fetchDashboard = async () => {

    try {

      const token = localStorage.getItem("access");

      if (!token) {
        setError("Please login to view your dashboard.");
        setLoading(false);
        return;
      }

      const response = await api.get(
        "analytics/dashboard/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboard(response.data);

    } catch (error) {

      console.error("Dashboard Error:", error);

      setError(
        error.apiMessage ||
        "Unable to load dashboard data. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="dashboard-message">
        <div className="loading-card">
          <div className="loading-spinner"></div>

          <h2>
            Loading your dashboard...
          </h2>

          <p>
            Preparing your financial overview
          </p>

        </div>
      </div>
    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error || !dashboard) {

    return (
      <div className="dashboard-message">

        <div className="error-card">

          <div className="error-icon">
            ⚠️
          </div>

          <h2>
            {error || "Unable to load dashboard."}
          </h2>

          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>

        </div>

      </div>
    );

  }


  // =====================================================
  // DATA
  // =====================================================

  const summary = dashboard.financial_summary;

  const categoryData =
    dashboard.category_analysis || [];

  const monthlyData =
    dashboard.monthly_trend || [];

  const budgetData =
    dashboard.budget_status || [];

  const transactionData =
    dashboard.recent_transactions || [];

  const savingsGoals =
    dashboard.savings_goals || [];

  const notifications =
    dashboard.notifications || [];


  // =====================================================
  // CALCULATIONS
  // =====================================================

  const totalBudget =
    Number(summary.total_budget || 0);

  const totalExpense =
    Number(summary.total_expense || 0);

  const budgetUsedPercentage =
    totalBudget > 0
      ? Math.min(
          (totalExpense / totalBudget) * 100,
          100
        )
      : 0;


  const activeGoals =
    savingsGoals.filter(
      goal => goal.status === "ACTIVE"
    );


  const completedGoals =
    savingsGoals.filter(
      goal => goal.status === "COMPLETED"
    );


  // =====================================================
  // CATEGORY CHART DATA
  // =====================================================

  const categoryChartData =
    categoryData.map(item => ({
      name: item.category,
      value: Number(item.total_spending || 0),
    }));


  // =====================================================
  // INCOME VS EXPENSE
  // =====================================================

  const incomeExpenseData = [
    {
      name: "Income",
      amount: Number(summary.total_income || 0),
    },
    {
      name: "Expenses",
      amount: Number(summary.total_expense || 0),
    },
  ];


  // =====================================================
  // BUDGET CHART
  // =====================================================

  const budgetChartData =
    budgetData.map(item => ({
      name: `${item.category} - ${item.month}`,
      budget: Number(item.budget_amount || 0),
      spent: Number(item.spent_amount || 0),
    }));


  // =====================================================
  // HELPERS
  // =====================================================

  const formatCurrency = (value) => {

    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  };


  const getBudgetStatusClass = (status) => {

    switch (status) {

      case "EXCEEDED":
        return "status-exceeded";

      case "HIGH":
        return "status-high";

      case "WARNING":
        return "status-warning";

      default:
        return "status-safe";

    }

  };


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (

    <div className="dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>

          <div className="dashboard-eyebrow">
            FINANCIAL OVERVIEW
          </div>

          <h1>
            Dashboard
          </h1>

          <p>
            Here's an overview of your financial activity.
          </p>

        </div>


        <div className="header-actions">

          <button
            className="header-button secondary-button"
            onClick={() => navigate("/income")}
          >
            + Income
          </button>

          <button
            className="header-button primary-button"
            onClick={() => navigate("/expenses")}
          >
            + Expense
          </button>

        </div>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="summary-cards">


        {/* TOTAL INCOME */}

        <div className="summary-card income-card">

          <div className="summary-icon">
            💰
          </div>

          <div className="summary-content">

            <span>
              Total Income
            </span>

            <h2>
              ₹{formatCurrency(summary.total_income)}
            </h2>

            <small>
              Overall income
            </small>

          </div>

        </div>


        {/* TOTAL EXPENSE */}

        <div className="summary-card expense-card">

          <div className="summary-icon">
            💸
          </div>

          <div className="summary-content">

            <span>
              Total Expenses
            </span>

            <h2>
              ₹{formatCurrency(summary.total_expense)}
            </h2>

            <small>
              Overall spending
            </small>

          </div>

        </div>


        {/* BALANCE */}

        <div className="summary-card balance-card">

          <div className="summary-icon">
            💵
          </div>

          <div className="summary-content">

            <span>
              Current Balance
            </span>

            <h2>
              ₹{formatCurrency(summary.current_balance)}
            </h2>

            <small>
              Income − expenses
            </small>

          </div>

        </div>


        {/* SAVINGS */}

        <div className="summary-card savings-card">

          <div className="summary-icon">
            🏦
          </div>

          <div className="summary-content">

            <span>
              Total Savings
            </span>

            <h2>
              ₹{formatCurrency(summary.total_savings)}
            </h2>

            <small>
              Across all goals
            </small>

          </div>

        </div>


        {/* BUDGET */}

        <div className="summary-card budget-card">

          <div className="summary-icon">
            📊
          </div>

          <div className="summary-content">

            <span>
              Remaining Budget
            </span>

            <h2>
              ₹{formatCurrency(summary.remaining_budget)}
            </h2>

            <small>
              Of ₹{formatCurrency(summary.total_budget)}
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <div className="quick-actions-panel">

        <div>

          <h2>
            Quick Actions
          </h2>

          <p>
            Manage your finances quickly.
          </p>

        </div>

        <div className="quick-actions">

          <button
            onClick={() => navigate("/income")}
          >
            <span>💰</span>
            Add Income
          </button>

          <button
            onClick={() => navigate("/expenses")}
          >
            <span>💸</span>
            Add Expense
          </button>

          <button
            onClick={() => navigate("/budgets")}
          >
            <span>📊</span>
            Create Budget
          </button>

          <button
            onClick={() => navigate("/savings")}
          >
            <span>🎯</span>
            Savings Goal
          </button>

        </div>

      </div>


      {/* =================================================
          CHART ROW 1
      ================================================= */}

      <div className="charts-grid">


        {/* CATEGORY PIE CHART */}

        <div className="dashboard-panel chart-panel">

          <div className="panel-header">

            <div>

              <h2>
                Expense by Category
              </h2>

              <p>
                Where your money is going
              </p>

            </div>

            <span className="panel-icon">
              🥧
            </span>

          </div>


          {categoryChartData.length > 0 ? (

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={115}
                    paddingAngle={3}
                    dataKey="value"
                  >

                    {categoryChartData.map(
                      (entry, index) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={[
                            "#6366f1",
                            "#ec4899",
                            "#f59e0b",
                            "#10b981",
                            "#3b82f6",
                            "#8b5cf6",
                            "#ef4444",
                            "#14b8a6",
                          ][index % 8]}
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      `₹${formatCurrency(value)}`
                    }
                  />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="empty-chart">
              No expense category data available.
            </div>

          )}

        </div>


        {/* MONTHLY TREND */}

        <div className="dashboard-panel chart-panel">

          <div className="panel-header">

            <div>

              <h2>
                Monthly Expense Trend
              </h2>

              <p>
                Track your spending over time
              </p>

            </div>

            <span className="panel-icon">
              📈
            </span>

          </div>


          {monthlyData.length > 0 ? (

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      `₹${formatCurrency(value)}`
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="total_expense"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="empty-chart">
              No monthly expense data available.
            </div>

          )}

        </div>

      </div>


      {/* =================================================
          CHART ROW 2
      ================================================= */}

      <div className="charts-grid">


        {/* INCOME VS EXPENSE */}

        <div className="dashboard-panel chart-panel">

          <div className="panel-header">

            <div>

              <h2>
                Income vs Expenses
              </h2>

              <p>
                Compare your earnings and spending
              </p>

            </div>

            <span className="panel-icon">
              ⚖️
            </span>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <BarChart
                data={incomeExpenseData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    `₹${formatCurrency(value)}`
                  }
                />

                <Bar
                  dataKey="amount"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* BUDGET UTILIZATION */}

        <div className="dashboard-panel chart-panel">

          <div className="panel-header">

            <div>

              <h2>
                Budget Utilization
              </h2>

              <p>
                How much of each budget is used
              </p>

            </div>

            <span className="panel-icon">
              📊
            </span>

          </div>


          {budgetChartData.length > 0 ? (

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={budgetChartData}
                  layout="vertical"
                  margin={{
                    left: 20,
                    right: 20,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    type="number"
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                  />

                  <Tooltip
                    formatter={(value) =>
                      `₹${formatCurrency(value)}`
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="budget"
                    name="Budget"
                    fill="#94a3b8"
                    radius={[0, 6, 6, 0]}
                  />

                  <Bar
                    dataKey="spent"
                    name="Spent"
                    fill="#6366f1"
                    radius={[0, 6, 6, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="empty-chart">
              No budget data available.
            </div>

          )}

        </div>

      </div>


      {/* =================================================
          BUDGET STATUS
      ================================================= */}

      <div className="dashboard-panel">

        <div className="panel-header">

          <div>

            <h2>
              Budget Status
            </h2>

            <p>
              Monitor your spending against your budgets.
            </p>

          </div>

          <span className="panel-icon">
            💳
          </span>

        </div>


        <div className="budget-list">

          {budgetData.length > 0 ? (

            budgetData.map((budget) => (

              <div
                className="budget-item"
                key={budget.id}
              >

                <div className="budget-item-top">

                  <div>

                    <strong>
                      {budget.category}
                    </strong>

                    <span>
                      {budget.month} {budget.year}
                    </span>

                  </div>

                  <div
                    className={`budget-status ${getBudgetStatusClass(
                      budget.status
                    )}`}
                  >
                    {budget.status}
                  </div>

                </div>


                <div className="budget-progress">

                  <div
                    className="budget-progress-fill"
                    style={{
                      width: `${Math.min(
                        budget.utilization_percentage,
                        100
                      )}%`,
                    }}
                  ></div>

                </div>


                <div className="budget-item-bottom">

                  <span>
                    ₹{formatCurrency(budget.spent_amount)}
                    {" "}spent
                  </span>

                  <span>
                    ₹{formatCurrency(budget.remaining_amount)}
                    {" "}remaining
                  </span>

                  <strong>
                    {budget.utilization_percentage}%
                  </strong>

                </div>

              </div>

            ))

          ) : (

            <div className="empty-message">
              No budgets available.
            </div>

          )}

        </div>

      </div>


      {/* =================================================
          SAVINGS GOALS
      ================================================= */}

      <div className="dashboard-panel">

        <div className="panel-header">

          <div>

            <h2>
              Savings Goals
            </h2>

            <p>
              Track your progress towards your goals.
            </p>

          </div>

          <span className="panel-icon">
            🎯
          </span>

        </div>


        <div className="goals-grid">

          {savingsGoals.length > 0 ? (

            savingsGoals.map((goal) => (

              <div
                className="goal-card"
                key={goal.id}
              >

                <div className="goal-header">

                  <div className="goal-icon">
                    🎯
                  </div>

                  <div>

                    <h3>
                      {goal.goal_name}
                    </h3>

                    <span>
                      {goal.status}
                    </span>

                  </div>

                </div>


                <div className="goal-amounts">

                  <strong>
                    ₹{formatCurrency(goal.saved_amount)}
                  </strong>

                  <span>
                    of ₹{formatCurrency(goal.target_amount)}
                  </span>

                </div>


                <div className="goal-progress">

                  <div
                    className="goal-progress-fill"
                    style={{
                      width: `${goal.progress_percentage}%`,
                    }}
                  ></div>

                </div>


                <div className="goal-footer">

                  <span>
                    {goal.progress_percentage}% complete
                  </span>

                  <span>
                    {goal.remaining_amount > 0
                      ? `₹${formatCurrency(
                          goal.remaining_amount
                        )} remaining`
                      : "Goal completed 🎉"}
                  </span>

                </div>

              </div>

            ))

          ) : (

            <div className="empty-message">
              No savings goals available.
            </div>

          )}

        </div>

      </div>


      {/* =================================================
          RECENT TRANSACTIONS + NOTIFICATIONS
      ================================================= */}

      <div className="bottom-grid">


        {/* RECENT TRANSACTIONS */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h2>
                Recent Transactions
              </h2>

              <p>
                Your latest expenses.
              </p>

            </div>

            <button
              className="view-button"
              onClick={() => navigate("/expenses")}
            >
              View All
            </button>

          </div>


          <div className="transactions-list">

            {transactionData.length > 0 ? (

              transactionData.map(
                (transaction) => (

                  <div
                    className="transaction-item"
                    key={transaction.id}
                  >

                    <div className="transaction-icon">
                      {transaction.type === "INCOME"
                        ? "💰"
                        : "💸"}
                    </div>


                    <div className="transaction-details">

                      <strong>
                        {transaction.category}
                      </strong>

                      <span>
                        {transaction.description ||
                          "Expense"}
                      </span>

                    </div>


                    <div className="transaction-date">
                      {transaction.date}
                    </div>


                    <div className="transaction-amount expense-amount">
                      -₹
                      {formatCurrency(
                        transaction.amount
                      )}
                    </div>

                  </div>

                )

              )

            ) : (

              <div className="empty-message">
                No recent transactions found.
              </div>

            )}

          </div>

        </div>


        {/* NOTIFICATIONS */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h2>
                Notifications
              </h2>

              <p>
                Recent alerts and updates.
              </p>

            </div>

            <span className="panel-icon">
              🔔
            </span>

          </div>


          <div className="notifications-list">

            {notifications.length > 0 ? (

              notifications.map(
                (notification) => (

                  <div
                    className={`notification-item ${
                      notification.is_read
                        ? "read"
                        : "unread"
                    }`}
                    key={notification.id}
                  >

                    <div className="notification-icon">
                      {notification.priority === "HIGH"
                        ? "⚠️"
                        : "🔔"}
                    </div>


                    <div className="notification-content">

                      <div className="notification-title">

                        <strong>
                          {notification.title}
                        </strong>

                        {!notification.is_read && (
                          <span className="new-badge">
                            NEW
                          </span>
                        )}

                      </div>

                      <p>
                        {notification.message}
                      </p>

                    </div>

                  </div>

                )

              )

            ) : (

              <div className="empty-message">
                No notifications available.
              </div>

            )}

          </div>

        </div>

      </div>


      {/* =================================================
          FINANCIAL SUMMARY
      ================================================= */}

      <div className="financial-summary-banner">

        <div>

          <span>
            Financial Health
          </span>

          <h2>
            {summary.current_balance >= 0
              ? "You're currently in a positive balance."
              : "Your expenses are currently higher than your income."}
          </h2>

        </div>


        <div className="health-stat">

          <span>
            Budget Used
          </span>

          <strong>
            {budgetUsedPercentage.toFixed(1)}%
          </strong>

        </div>


        <div className="health-stat">

          <span>
            Active Goals
          </span>

          <strong>
            {activeGoals.length}
          </strong>

        </div>


        <div className="health-stat">

          <span>
            Completed Goals
          </span>

          <strong>
            {completedGoals.length}
          </strong>

        </div>

      </div>


    </div>

  );

}


export default Dashboard;