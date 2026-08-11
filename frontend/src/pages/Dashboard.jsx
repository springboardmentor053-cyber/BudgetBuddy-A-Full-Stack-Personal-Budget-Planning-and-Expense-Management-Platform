import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SummaryCard from "../components/SummaryCard";
import IncomeExpenseChart from "../components/charts/IncomeExpenseChart";
import ExpensePieChart from "../components/charts/ExpensePieChart";
import api from "../services/api";
import "../styles/dashboard.css";

function Dashboard() {
  // =====================================================
  // DASHBOARD STATE
  // =====================================================

  const [summary, setSummary] = useState({
    financial_summary: {
      total_income: 0,
      total_expense: 0,
      current_balance: 0,
      total_savings: 0,
      remaining_budget: 0,
    },

    category_analysis: [],
    monthly_trend: [],
    recent_transactions: [],
    latest_notifications: [],
    active_savings_goals: [],
    expense_analysis: {
      highest_expense: null,
      lowest_expense: null,
      latest_expense: null,
      oldest_expense: null,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("access");

        if (!token) {
          setError("Please log in to view your dashboard.");
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

        console.log(
          "Dashboard API response:",
          response.data
        );

        setSummary(response.data);
        setError("");
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // =====================================================
  // CURRENCY FORMATTER
  // =====================================================

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =====================================================
  // DATE FORMATTER
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FINANCIAL SUMMARY
  // =====================================================

  const financial = summary.financial_summary;

  // =====================================================
  // TOTAL BUDGET
  // =====================================================

  const totalBudget =
    Number(financial.total_expense || 0) +
    Number(financial.remaining_budget || 0);

  // =====================================================
  // BUDGET PERCENTAGE
  // =====================================================

  const budgetPercentage =
    totalBudget > 0
      ? Math.min(
          (Number(financial.total_expense || 0) /
            totalBudget) *
            100,
          100
        )
      : 0;

  // =====================================================
  // EXPENSE ANALYSIS
  // =====================================================

  const expenseAnalysis = summary.expense_analysis || {};

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="dashboard-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main">

        {/* =================================================
            HERO
        ================================================= */}

        <div className="dashboard-hero">

          <div>
            <p className="dashboard-eyebrow">
              Financial Overview
            </p>

            <h1>
              Hello, Saiharshitha 👋
            </h1>

            <p className="dashboard-subtitle">
              Welcome back! Here's your financial overview.
            </p>
          </div>

          {/* FINANCIAL HEALTH */}

          <div className="health-card">

            <h3>
              Financial Health
            </h3>

            <div className="health-score">
              {Number(financial.current_balance) >= 0
                ? "85%"
                : "45%"}
            </div>

            <p>
              {Number(financial.current_balance) >= 0
                ? "Your finances are looking healthy."
                : "Your expenses are currently higher than your income."}
            </p>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="dashboard-loading">
            Loading Dashboard...
          </div>

        ) : (

          <>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section className="summary-grid">

              <SummaryCard
                title="Current Balance"
                amount={`₹${formatCurrency(
                  financial.current_balance
                )}`}
                icon="💰"
                type="balance"
              />

              <SummaryCard
                title="Total Income"
                amount={`₹${formatCurrency(
                  financial.total_income
                )}`}
                icon="📈"
                type="income"
              />

              <SummaryCard
                title="Total Expenses"
                amount={`₹${formatCurrency(
                  financial.total_expense
                )}`}
                icon="📉"
                type="expense"
              />

              <SummaryCard
                title="Remaining Budget"
                amount={`₹${formatCurrency(
                  financial.remaining_budget
                )}`}
                icon="🎯"
                type="balance"
              />

            </section>

            {/* =================================================
                EXTRA FINANCIAL INFO
            ================================================= */}

            <section className="dashboard-mini-grid">

              <div className="mini-stat-card">
                <span>💎</span>
                <div>
                  <p>Total Savings</p>
                  <strong>
                    ₹
                    {formatCurrency(
                      financial.total_savings
                    )}
                  </strong>
                </div>
              </div>

              <div className="mini-stat-card">
                <span>💳</span>
                <div>
                  <p>Total Budget</p>
                  <strong>
                    ₹
                    {formatCurrency(totalBudget)}
                  </strong>
                </div>
              </div>

              <div className="mini-stat-card">
                <span>🧾</span>
                <div>
                  <p>Expense Categories</p>
                  <strong>
                    {summary.category_analysis.length}
                  </strong>
                </div>
              </div>

              <div className="mini-stat-card">
                <span>🎯</span>
                <div>
                  <p>Active Goals</p>
                  <strong>
                    {summary.active_savings_goals.length}
                  </strong>
                </div>
              </div>

            </section>

            {/* =================================================
                CHARTS
            ================================================= */}

            <section className="dashboard-charts">

              {/* INCOME VS EXPENSE */}

              <div className="chart-card">

                <div className="chart-header">
                  <div>
                    <h2>
                      Income vs Expense
                    </h2>

                    <p>
                      Compare your overall income and spending
                    </p>
                  </div>
                </div>

                <IncomeExpenseChart
                  income={financial.total_income}
                  expense={financial.total_expense}
                />

              </div>

              {/* EXPENSE DISTRIBUTION */}

              <div className="chart-card">

                <div className="chart-header">
                  <div>
                    <h2>
                      Expense Distribution
                    </h2>

                    <p>
                      Overview of your expense balance
                    </p>
                  </div>
                </div>

                <ExpensePieChart
                  expense={financial.total_expense}
                  remaining={
                    financial.remaining_budget
                  }
                />

              </div>

            </section>

            {/* =================================================
                CATEGORY + MONTHLY TREND
            ================================================= */}

            <section className="dashboard-content-grid">

              {/* CATEGORY ANALYSIS */}

              <div className="dashboard-panel">

                <div className="panel-header">
                  <div>
                    <h2>
                      Category-wise Expenses
                    </h2>

                    <p>
                      See where your money is being spent
                    </p>
                  </div>
                </div>

                {summary.category_analysis.length > 0 ? (

                  <div className="analytics-list">

                    {summary.category_analysis.map(
                      (item, index) => {

                        const percentage =
                          financial.total_expense > 0
                            ? (
                                (Number(
                                  item.total_amount
                                ) /
                                  Number(
                                    financial.total_expense
                                  )) *
                                100
                              )
                            : 0;

                        return (
                          <div
                            className="analytics-row"
                            key={`${item.category}-${index}`}
                          >

                            <div className="analytics-row-top">

                              <span>
                                {item.category}
                              </span>

                              <strong>
                                ₹
                                {formatCurrency(
                                  item.total_amount
                                )}
                              </strong>

                            </div>

                            <div className="analytics-bar">
                              <div
                                className="analytics-bar-fill"
                                style={{
                                  width: `${Math.min(
                                    percentage,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>

                            <small>
                              {percentage.toFixed(1)}%
                              of total expenses
                            </small>

                          </div>
                        );
                      }
                    )}

                  </div>

                ) : (

                  <div className="empty-state">
                    <div className="empty-icon">
                      📊
                    </div>

                    <h3>
                      No Category Data
                    </h3>

                    <p>
                      Expense category information will appear here.
                    </p>
                  </div>

                )}

              </div>

              {/* MONTHLY TREND */}

              <div className="dashboard-panel">

                <div className="panel-header">
                  <div>
                    <h2>
                      Monthly Expense Trend
                    </h2>

                    <p>
                      Track spending month by month
                    </p>
                  </div>
                </div>

                {summary.monthly_trend.length > 0 ? (

                  <div className="monthly-list">

                    {summary.monthly_trend.map(
                      (item, index) => (

                        <div
                          className="monthly-row"
                          key={`${item.year}-${item.month}-${index}`}
                        >

                          <div className="monthly-icon">
                            📅
                          </div>

                          <div className="monthly-info">

                            <strong>
                              {item.month} {item.year}
                            </strong>

                            <span>
                              Monthly expenses
                            </span>

                          </div>

                          <strong className="expense-amount">
                            ₹
                            {formatCurrency(
                              item.total_amount
                            )}
                          </strong>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="empty-state">
                    <div className="empty-icon">
                      📈
                    </div>

                    <h3>
                      No Monthly Data
                    </h3>

                    <p>
                      Monthly expense information will appear here.
                    </p>
                  </div>

                )}

              </div>

            </section>

            {/* =================================================
                RECENT TRANSACTIONS + BUDGET
            ================================================= */}

            <section className="dashboard-content-grid">

              {/* RECENT TRANSACTIONS */}

              <div className="dashboard-panel">

                <div className="panel-header">
                  <div>
                    <h2>
                      Recent Transactions
                    </h2>

                    <p>
                      Your latest financial activity
                    </p>
                  </div>
                </div>

                {summary.recent_transactions.length > 0 ? (

                  <div className="transaction-list">

                    {summary.recent_transactions.map(
                      (transaction, index) => (

                        <div
                          className="transaction-item"
                          key={`${transaction.type}-${transaction.id}-${index}`}
                        >

                          <div className="transaction-left">

                            <div
                              className={`transaction-icon ${
                                transaction.type ===
                                "income"
                                  ? "income-transaction"
                                  : "expense-transaction"
                              }`}
                            >
                              {transaction.type ===
                              "income"
                                ? "↑"
                                : "↓"}
                            </div>

                            <div>

                              <h3>
                                {transaction.title}
                              </h3>

                              <p>
                                {transaction.category ||
                                  transaction.source ||
                                  "Transaction"}
                              </p>

                            </div>

                          </div>

                          <div className="transaction-right">

                            <strong
                              className={
                                transaction.type ===
                                "income"
                                  ? "income-amount"
                                  : "expense-amount"
                              }
                            >
                              {transaction.type ===
                              "income"
                                ? "+"
                                : "-"}

                              ₹
                              {formatCurrency(
                                transaction.amount
                              )}
                            </strong>

                            <span>
                              {formatDate(
                                transaction.date
                              )}
                            </span>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="empty-state">
                    <div className="empty-icon">
                      📋
                    </div>

                    <h3>
                      No Transactions
                    </h3>

                    <p>
                      Add your first income or expense to get started.
                    </p>
                  </div>

                )}

              </div>

              {/* BUDGET SUMMARY */}

              <div className="dashboard-panel">

                <div className="panel-header">
                  <div>
                    <h2>
                      Budget Summary
                    </h2>

                    <p>
                      Track your monthly spending
                    </p>
                  </div>
                </div>

                <div className="budget-overview">

                  <div className="budget-overview-row">
                    <span>
                      Total Budget
                    </span>

                    <strong>
                      ₹
                      {formatCurrency(
                        totalBudget
                      )}
                    </strong>
                  </div>

                  <div className="budget-overview-row">
                    <span>
                      Total Expense
                    </span>

                    <strong>
                      ₹
                      {formatCurrency(
                        financial.total_expense
                      )}
                    </strong>
                  </div>

                  <div className="budget-overview-row">
                    <span>
                      Remaining Budget
                    </span>

                    <strong
                      className={
                        Number(
                          financial.remaining_budget
                        ) < 0
                          ? "expense-amount"
                          : "income-amount"
                      }
                    >
                      ₹
                      {formatCurrency(
                        financial.remaining_budget
                      )}
                    </strong>
                  </div>

                </div>

                <div className="budget-progress">

                  <div className="progress-header">
                    <span>
                      Budget Usage
                    </span>

                    <span>
                      {Math.round(
                        budgetPercentage
                      )}
                      %
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${budgetPercentage}%`,
                      }}
                    />
                  </div>

                </div>

                <div className="quick-actions">

                  <button
                    type="button"
                    className="quick-action income-action"
                  >
                    ➕ Add Income
                  </button>

                  <button
                    type="button"
                    className="quick-action expense-action"
                  >
                    ➖ Add Expense
                  </button>

                  <button
                    type="button"
                    className="quick-action budget-action"
                  >
                    📊 Create Budget
                  </button>

                </div>

              </div>

            </section>

            {/* =================================================
                EXPENSE ANALYSIS
            ================================================= */}

            <section className="dashboard-panel analytics-full-panel">

              <div className="panel-header">
                <div>
                  <h2>
                    Expense Analysis
                  </h2>

                  <p>
                    Highest, lowest, latest and oldest expenses
                  </p>
                </div>
              </div>

              <div className="expense-analysis-grid">

                {/* HIGHEST */}

                <div className="expense-analysis-card highest-card">

                  <div className="analysis-icon">
                    🔥
                  </div>

                  <div>
                    <span>
                      Highest Expense
                    </span>

                    <h3>
                      {expenseAnalysis.highest_expense
                        ? `₹${formatCurrency(
                            expenseAnalysis
                              .highest_expense
                              .amount
                          )}`
                        : "—"}
                    </h3>

                    <p>
                      {expenseAnalysis.highest_expense
                        ?.title || "No data"}
                    </p>

                    <small>
                      {expenseAnalysis.highest_expense
                        ? `${expenseAnalysis.highest_expense.category} • ${formatDate(
                            expenseAnalysis
                              .highest_expense
                              .date
                          )}`
                        : ""}
                    </small>
                  </div>

                </div>

                {/* LOWEST */}

                <div className="expense-analysis-card lowest-card">

                  <div className="analysis-icon">
                    💰
                  </div>

                  <div>
                    <span>
                      Lowest Expense
                    </span>

                    <h3>
                      {expenseAnalysis.lowest_expense
                        ? `₹${formatCurrency(
                            expenseAnalysis
                              .lowest_expense
                              .amount
                          )}`
                        : "—"}
                    </h3>

                    <p>
                      {expenseAnalysis.lowest_expense
                        ?.title || "No data"}
                    </p>

                    <small>
                      {expenseAnalysis.lowest_expense
                        ? `${expenseAnalysis.lowest_expense.category} • ${formatDate(
                            expenseAnalysis
                              .lowest_expense
                              .date
                          )}`
                        : ""}
                    </small>
                  </div>

                </div>

                {/* LATEST */}

                <div className="expense-analysis-card latest-card">

                  <div className="analysis-icon">
                    🕐
                  </div>

                  <div>
                    <span>
                      Latest Expense
                    </span>

                    <h3>
                      {expenseAnalysis.latest_expense
                        ? `₹${formatCurrency(
                            expenseAnalysis
                              .latest_expense
                              .amount
                          )}`
                        : "—"}
                    </h3>

                    <p>
                      {expenseAnalysis.latest_expense
                        ?.title || "No data"}
                    </p>

                    <small>
                      {expenseAnalysis.latest_expense
                        ? `${expenseAnalysis.latest_expense.category} • ${formatDate(
                            expenseAnalysis
                              .latest_expense
                              .date
                          )}`
                        : ""}
                    </small>
                  </div>

                </div>

                {/* OLDEST */}

                <div className="expense-analysis-card oldest-card">

                  <div className="analysis-icon">
                    📅
                  </div>

                  <div>
                    <span>
                      Oldest Expense
                    </span>

                    <h3>
                      {expenseAnalysis.oldest_expense
                        ? `₹${formatCurrency(
                            expenseAnalysis
                              .oldest_expense
                              .amount
                          )}`
                        : "—"}
                    </h3>

                    <p>
                      {expenseAnalysis.oldest_expense
                        ?.title || "No data"}
                    </p>

                    <small>
                      {expenseAnalysis.oldest_expense
                        ? `${expenseAnalysis.oldest_expense.category} • ${formatDate(
                            expenseAnalysis
                              .oldest_expense
                              .date
                          )}`
                        : ""}
                    </small>
                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                NOTIFICATIONS + SAVINGS GOALS
            ================================================= */}

            <section className="dashboard-content-grid">

              {/* NOTIFICATIONS */}

              <div className="dashboard-panel">

                <div className="panel-header">
                  <div>
                    <h2>
                      Latest Notifications
                    </h2>

                    <p>
                      Important updates about your finances
                    </p>
                  </div>
                </div>

                {summary.latest_notifications.length > 0 ? (

                  <div className="notification-list">

                    {summary.latest_notifications.map(
                      (notification) => (

                        <div
                          className={`notification-item ${
                            notification.priority ===
                            "HIGH"
                              ? "notification-high"
                              : ""
                          }`}
                          key={notification.id}
                        >

                          <div className="notification-icon">
                            {notification.notification_type ===
                            "GOAL_COMPLETED"
                              ? "🎉"
                              : notification.notification_type ===
                                "BUDGET_WARNING"
                              ? "⚠️"
                              : "🔔"}
                          </div>

                          <div className="notification-content">

                            <div className="notification-title-row">

                              <h3>
                                {notification.title}
                              </h3>

                              {!notification.is_read && (
                                <span className="unread-dot" />
                              )}

                            </div>

                            <p>
                              {notification.message}
                            </p>

                            <small>
                              {formatDate(
                                notification.created_at
                              )}
                            </small>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="empty-state">
                    <div className="empty-icon">
                      🔔
                    </div>

                    <h3>
                      No Notifications
                    </h3>

                    <p>
                      You are all caught up.
                    </p>
                  </div>

                )}

              </div>

              {/* SAVINGS GOALS */}

              <div className="dashboard-panel">

                <div className="panel-header">
                  <div>
                    <h2>
                      Active Savings Goals
                    </h2>

                    <p>
                      Track your savings progress
                    </p>
                  </div>
                </div>

                {summary.active_savings_goals.length > 0 ? (

                  <div className="goal-list">

                    {summary.active_savings_goals.map(
                      (goal) => (

                        <div
                          className="goal-item"
                          key={goal.id}
                        >

                          <div className="goal-top">

                            <div>
                              <h3>
                                🎯 {goal.title}
                              </h3>

                              {goal.target_date && (
                                <span>
                                  Target:{" "}
                                  {formatDate(
                                    goal.target_date
                                  )}
                                </span>
                              )}
                            </div>

                            <strong>
                              {goal.percentage}%
                            </strong>

                          </div>

                          <div className="goal-progress">
                            <div
                              className="goal-progress-fill"
                              style={{
                                width: `${Math.min(
                                  Number(
                                    goal.percentage || 0
                                  ),
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <div className="goal-bottom">

                            <span>
                              Saved ₹
                              {formatCurrency(
                                goal.saved_amount
                              )}
                            </span>

                            <span>
                              ₹
                              {formatCurrency(
                                goal.target_amount
                              )}
                            </span>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="empty-state">
                    <div className="empty-icon">
                      🎯
                    </div>

                    <h3>
                      No Active Goals
                    </h3>

                    <p>
                      Create a savings goal to start tracking your progress.
                    </p>
                  </div>

                )}

              </div>

            </section>

          </>

        )}

      </main>

    </div>
  );
}

export default Dashboard;