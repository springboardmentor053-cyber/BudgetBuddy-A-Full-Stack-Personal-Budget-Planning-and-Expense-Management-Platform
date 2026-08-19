import { useEffect, useState } from "react";
import api from "../api";

import IncomeExpenseChart from "../components/IncomeExpenseChart";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import CategoryExpenseChart from "../components/CategoryExpenseChart";
import BudgetUtilizationChart from "../components/BudgetUtilizationChart";
import SavingsProgressChart from "../components/SavingsProgressChart";

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    financial_summary: {
      total_income: 0,
      total_expense: 0,
      current_balance: 0,
      total_budget: 0,
      remaining_budget: 0,
      total_savings: 0,
    },
    category_analysis: [],
    monthly_trend: [],
    active_savings_goals: [],
    latest_notifications: [],
    recent_income: [],
    recent_transactions: [],
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      const response = await api.get("dashboard/");

      console.log("Dashboard API Response:", response.data);

      setDashboard({
        financial_summary: response.data.financial_summary || {
          total_income: 0,
          total_expense: 0,
          current_balance: 0,
          total_budget: 0,
          remaining_budget: 0,
          total_savings: 0,
        },

        category_analysis: Array.isArray(
          response.data.category_analysis
        )
          ? response.data.category_analysis
          : [],

        monthly_trend: Array.isArray(
          response.data.monthly_trend
        )
          ? response.data.monthly_trend
          : [],

        active_savings_goals: Array.isArray(
          response.data.active_savings_goals
        )
          ? response.data.active_savings_goals
          : [],

        latest_notifications: Array.isArray(
          response.data.latest_notifications
        )
          ? response.data.latest_notifications
          : [],

        recent_income: Array.isArray(
          response.data.recent_income
        )
          ? response.data.recent_income
          : [],

        recent_transactions: Array.isArray(
          response.data.recent_transactions
        )
          ? response.data.recent_transactions
          : [],
      });
    } catch (error) {
      console.error("Dashboard error:", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading-page">
        <div className="dashboard-loader">
          <div className="dashboard-spinner"></div>
          <p>Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // VARIABLES
  // =====================================================

  const summary = dashboard.financial_summary;

  const budgetPercentage =
    summary.total_budget > 0
      ? Math.min(
          (summary.total_expense / summary.total_budget) * 100,
          100
        )
      : 0;

  const remainingBudget = Math.max(
    Number(summary.remaining_budget) || 0,
    0
  );

  const budgetStatus =
    budgetPercentage < 70
      ? "Healthy"
      : budgetPercentage < 90
      ? "Attention"
      : "Critical";

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN");

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            PERSONAL FINANCE
          </span>

          <h1>Financial Dashboard</h1>

          <p>
            Track your income, expenses, budgets and savings
            in one place.
          </p>
        </div>

        <div className="dashboard-header-badge">
          <span className="status-dot"></span>
          <span>Financial overview</span>
        </div>
      </section>


      {/* =================================================
          WELCOME CARD
      ================================================= */}

      <section className="dashboard-welcome">

        <div className="welcome-content">
          <span className="welcome-label">
            WELCOME BACK
          </span>

          <h2>
            👋 Welcome to BudgetBuddy
          </h2>

          <p>
            Here's your complete financial overview.
            Stay on top of your money and reach your goals.
          </p>
        </div>

        <div className="welcome-icon">
          💰
        </div>

      </section>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Financial Overview</h2>
            <p>Your current financial snapshot</p>
          </div>
        </div>

        <div className="summary-grid">

          {/* INCOME */}

          <div className="summary-card income-card">

            <div className="summary-card-top">
              <div className="summary-icon">
                💰
              </div>

              <span className="summary-tag positive">
                Income
              </span>
            </div>

            <div className="summary-label">
              TOTAL INCOME
            </div>

            <div className="summary-value">
              ₹ {formatAmount(summary.total_income)}
            </div>

            <div className="summary-footer">
              <span>All recorded income</span>
            </div>

          </div>


          {/* EXPENSE */}

          <div className="summary-card expense-card">

            <div className="summary-card-top">
              <div className="summary-icon">
                💸
              </div>

              <span className="summary-tag negative">
                Expense
              </span>
            </div>

            <div className="summary-label">
              TOTAL EXPENSE
            </div>

            <div className="summary-value">
              ₹ {formatAmount(summary.total_expense)}
            </div>

            <div className="summary-footer">
              <span>All recorded expenses</span>
            </div>

          </div>


          {/* BALANCE */}

          <div className="summary-card balance-card">

            <div className="summary-card-top">
              <div className="summary-icon">
                🏦
              </div>

              <span className="summary-tag neutral">
                Balance
              </span>
            </div>

            <div className="summary-label">
              CURRENT BALANCE
            </div>

            <div
              className={`summary-value ${
                Number(summary.current_balance) >= 0
                  ? "value-positive"
                  : "value-negative"
              }`}
            >
              ₹ {formatAmount(summary.current_balance)}
            </div>

            <div className="summary-footer">
              <span>Income minus expenses</span>
            </div>

          </div>


          {/* SAVINGS */}

          <div className="summary-card savings-card">

            <div className="summary-card-top">
              <div className="summary-icon">
                🎯
              </div>

              <span className="summary-tag savings">
                Savings
              </span>
            </div>

            <div className="summary-label">
              TOTAL SAVINGS
            </div>

            <div className="summary-value">
              ₹ {formatAmount(summary.total_savings)}
            </div>

            <div className="summary-footer">
              <span>Current savings progress</span>
            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          BUDGET OVERVIEW
      ================================================= */}

      <section className="budget-overview-card">

        <div className="budget-header">

          <div className="budget-title">

            <div className="budget-icon">
              📊
            </div>

            <div>
              <h2>Budget Usage</h2>

              <p>
                Monitor your spending against your budget
              </p>
            </div>

          </div>

          <div
            className={`budget-status ${budgetStatus
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {budgetStatus}
          </div>

        </div>


        <div className="budget-main">

          <div className="budget-percentage">
            {budgetPercentage.toFixed(0)}
            <span>%</span>
          </div>

          <div className="budget-details">

            <div className="budget-progress-track">

              <div
                className={`budget-progress-fill ${
                  budgetPercentage < 70
                    ? "healthy"
                    : budgetPercentage < 90
                    ? "warning"
                    : "danger"
                }`}
                style={{
                  width: `${budgetPercentage}%`,
                }}
              ></div>

            </div>

            <div className="budget-numbers">

              <span>
                Spent:
                <strong>
                  ₹ {formatAmount(summary.total_expense)}
                </strong>
              </span>

              <span>
                Budget:
                <strong>
                  ₹ {formatAmount(summary.total_budget)}
                </strong>
              </span>

              <span>
                Remaining:
                <strong>
                  ₹ {formatAmount(remainingBudget)}
                </strong>
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          ANALYTICS
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Financial Analytics</h2>
            <p>Understand your financial patterns</p>
          </div>
        </div>


        <div className="analytics-grid">

          <div className="chart-card">
            <div className="chart-card-heading">
              <div>
                <h3>Income vs Expenses</h3>
                <p>Overall financial comparison</p>
              </div>

              <span className="chart-badge blue">
                Overview
              </span>
            </div>

            <IncomeExpenseChart
              income={summary.total_income}
              expense={summary.total_expense}
            />
          </div>


          <div className="chart-card">
            <div className="chart-card-heading">
              <div>
                <h3>Expense Categories</h3>
                <p>Where your money is going</p>
              </div>

              <span className="chart-badge purple">
                Categories
              </span>
            </div>

            <CategoryExpenseChart
              data={dashboard.category_analysis}
            />
          </div>


          <div className="chart-card">
            <div className="chart-card-heading">
              <div>
                <h3>Budget Utilization</h3>
                <p>Spending compared with your budget</p>
              </div>

              <span className="chart-badge green">
                Budget
              </span>
            </div>

            <BudgetUtilizationChart
              totalBudget={summary.total_budget}
              totalExpense={summary.total_expense}
            />
          </div>

        </div>

      </section>


      {/* =================================================
          MONTHLY TREND
      ================================================= */}

      <section className="chart-card chart-card-wide">

        <div className="chart-card-heading">

          <div>
            <h3>Monthly Financial Trend</h3>

            <p>
              Track your income and expenses over time
            </p>
          </div>

          <span className="chart-badge blue">
            6 Months
          </span>

        </div>

        <MonthlyTrendChart
          data={dashboard.monthly_trend}
        />

      </section>


      {/* =================================================
          SAVINGS + GOALS
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Savings & Goals</h2>
            <p>Track progress towards your financial goals</p>
          </div>
        </div>


        <div className="two-column-grid">

          {/* SAVINGS CHART */}

          <div className="chart-card">

            <div className="chart-card-heading">

              <div>
                <h3>Savings Progress</h3>
                <p>Overall progress across active goals</p>
              </div>

              <span className="chart-badge green">
                Goals
              </span>

            </div>

            <SavingsProgressChart
              goals={dashboard.active_savings_goals}
            />

          </div>


          {/* SAVINGS GOALS */}

          <div className="professional-card">

            <div className="card-title-row">

              <div>
                <h3>Savings Goals</h3>
                <p>Active financial targets</p>
              </div>

              <div className="card-title-icon">
                🎯
              </div>

            </div>


            {dashboard.active_savings_goals.length > 0 ? (

              <div className="goals-list">

                {dashboard.active_savings_goals.map(
                  (goal, index) => {

                    const progress = Math.min(
                      Number(goal.progress_percentage) || 0,
                      100
                    );

                    return (
                      <div
                        className="goal-item"
                        key={`${goal.id ?? goal.goal_name}-${index}`}
                      >

                        <div className="goal-top">

                          <div>
                            <strong>
                              {goal.goal_name}
                            </strong>

                            <span>
                              Target: ₹{" "}
                              {formatAmount(
                                goal.target_amount
                              )}
                            </span>
                          </div>

                          <strong className="goal-percent">
                            {goal.progress_percentage}%
                          </strong>

                        </div>


                        <div className="goal-progress">

                          <div
                            className="goal-progress-fill"
                            style={{
                              width: `${progress}%`,
                            }}
                          ></div>

                        </div>


                        <div className="goal-bottom">

                          <span>
                            Saved ₹{" "}
                            {formatAmount(
                              goal.saved_amount
                            )}
                          </span>

                          <span>
                            📅 {goal.target_date}
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div className="empty-state">

                <div className="empty-icon">
                  🎯
                </div>

                <h4>No Savings Goals</h4>

                <p>
                  Create a savings goal to start
                  tracking your progress.
                </p>

              </div>

            )}

          </div>

        </div>

      </section>


      {/* =================================================
          NOTIFICATIONS
      ================================================= */}

      <section className="professional-card notifications-card">

        <div className="card-title-row">

          <div>
            <h3>Latest Notifications</h3>
            <p>Your most recent financial updates</p>
          </div>

          <div className="card-title-icon">
            🔔
          </div>

        </div>


        {dashboard.latest_notifications.length > 0 ? (

          <div className="notifications-list">

            {dashboard.latest_notifications.map(
              (notification, index) => {

                const priority =
                  notification.priority || "low";

                return (
                  <div
                    className="notification-item"
                    key={`${notification.id ?? notification.title}-${index}`}
                  >

                    <div className="notification-icon">
                      {priority === "high"
                        ? "⚠️"
                        : priority === "medium"
                        ? "🔔"
                        : "ℹ️"}
                    </div>


                    <div className="notification-content">

                      <div className="notification-top">

                        <strong>
                          {notification.title}
                        </strong>

                        <span
                          className={`priority-badge ${priority}`}
                        >
                          {priority}
                        </span>

                      </div>

                      <p>
                        {notification.message}
                      </p>

                      <small>
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </small>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        ) : (

          <div className="empty-state compact">

            <div className="empty-icon">
              🔔
            </div>

            <h4>No Notifications</h4>

            <p>
              You're all caught up.
            </p>

          </div>

        )}

      </section>


      {/* =================================================
          RECENT TRANSACTIONS
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <h2>Recent Transactions</h2>
            <p>Your latest income and expenses</p>
          </div>

        </div>


        <div className="transactions-grid">

          {/* RECENT INCOME */}

          <div className="professional-card">

            <div className="card-title-row">

              <div>
                <h3>Recent Income</h3>
                <p>Latest money received</p>
              </div>

              <div className="transaction-icon income">
                💰
              </div>

            </div>


            {dashboard.recent_income.length > 0 ? (

              <div className="table-wrapper">

                <table className="professional-table">

                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Source</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>

                    {dashboard.recent_income.map(
                      (income, index) => (
                        <tr
                          key={`${income.id ?? income.title}-${index}`}
                        >

                          <td>
                            <strong>
                              {income.title}
                            </strong>
                          </td>

                          <td>
                            {income.source}
                          </td>

                          <td className="amount-income">
                            ₹ {formatAmount(income.amount)}
                          </td>

                          <td>
                            {income.income_date}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="empty-state compact">
                <div className="empty-icon">
                  💰
                </div>

                <h4>No Recent Income</h4>

                <p>
                  Your recent income will appear here.
                </p>
              </div>

            )}

          </div>


          {/* RECENT EXPENSES */}

          <div className="professional-card">

            <div className="card-title-row">

              <div>
                <h3>Recent Expenses</h3>
                <p>Latest money spent</p>
              </div>

              <div className="transaction-icon expense">
                💸
              </div>

            </div>


            {dashboard.recent_transactions.length > 0 ? (

              <div className="table-wrapper">

                <table className="professional-table">

                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>

                    {dashboard.recent_transactions.map(
                      (expense, index) => (
                        <tr
                          key={`${expense.id ?? expense.title}-${index}`}
                        >

                          <td>
                            <strong>
                              {expense.title}
                            </strong>
                          </td>

                          <td>
                            {expense.category}
                          </td>

                          <td className="amount-expense">
                            ₹ {formatAmount(expense.amount)}
                          </td>

                          <td>
                            {expense.date}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="empty-state compact">

                <div className="empty-icon">
                  💸
                </div>

                <h4>No Recent Expenses</h4>

                <p>
                  Your recent expenses will appear here.
                </p>

              </div>

            )}

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;