  import { useEffect, useState } from "react";
import axios from "axios";

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

import "./Analytics.css";


function Analytics() {

 const API =
  "https://budgetbuddy-backend-l9tv.onrender.com/api/analytics/dashboard/";

  // =====================================================
  // STATE
  // =====================================================

  const [dashboard, setDashboard] = useState({
    financial_summary: {},
    category_analysis: [],
    monthly_trend: [],
    budget_status: [],
    recent_transactions: [],
    savings_goals: [],
    savings_summary: {},
    notifications: [],
    top_category: null,
    expense_highlights: {},
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);


  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {

    return localStorage.getItem("access");

  };


  // =====================================================
  // FETCH ANALYTICS
  // =====================================================

  const fetchDashboard = async (
    showRefresh = false
  ) => {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {

        setError(
          "Please login to view your financial analytics."
        );

        return;

      }


      const response = await axios.get(
        API,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setDashboard(response.data);

    } catch (err) {

      console.error(
        "Analytics Error:",
        err
      );

      if (
        err.response?.status === 401
      ) {

        setError(
          "Your session has expired. Please login again."
        );

      } else {

        setError(
          "Unable to load your financial analytics."
        );

      }

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchDashboard();

  }, []);


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (value) => {

    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  };


  // =====================================================
  // CATEGORY ICON
  // =====================================================

  const getCategoryIcon = (
    category
  ) => {

    const icons = {

      FOOD: "🍔",

      TRANSPORT: "🚗",

      EDUCATION: "📚",

      SHOPPING: "🛍️",

      ENTERTAINMENT: "🎬",

      HEALTH: "💊",

      BILLS: "🧾",

      TRAVEL: "✈️",

      OTHER: "📦",

    };

    return (
      icons[
        category?.toUpperCase()
      ] || "📊"
    );

  };


  // =====================================================
  // CATEGORY NAME
  // =====================================================

  const getCategoryName = (
    category
  ) => {

    if (!category) {
      return "Other";
    }

    return category
      .toLowerCase()
      .replace(
        /_/g,
        " "
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );

  };


  // =====================================================
  // NOTIFICATION ICON
  // =====================================================

  const getNotificationIcon = (
    type
  ) => {

    switch (type) {

      case "BUDGET":
        return "💰";

      case "SAVINGS":
        return "🎯";

      case "REPORT":
        return "📑";

      case "ANALYTICS":
        return "📈";

      default:
        return "🔔";

    }

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="analytics-message">

        <div className="analytics-loading-card">

          <div className="analytics-spinner"></div>

          <h2>
            Loading financial analytics...
          </h2>

          <p>
            Preparing your financial insights.
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <div className="analytics-message">

        <div className="analytics-error-card">

          <div className="analytics-error-icon">
            ⚠️
          </div>

          <h2>
            {error}
          </h2>

          <button
            className="analytics-retry-button"
            onClick={() =>
              fetchDashboard()
            }
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

  const summary =
    dashboard.financial_summary || {};

  const categoryData =
    dashboard.category_analysis || [];

  const monthlyData =
    dashboard.monthly_trend || [];

  const budgetData =
    dashboard.budget_status || [];

  const savingsGoals =
    dashboard.savings_goals || [];

  const notifications =
    dashboard.notifications || [];

  const topCategory =
    dashboard.top_category;

  const savingsSummary =
    dashboard.savings_summary || {};

  const highlights =
    dashboard.expense_highlights || {};

  const highestExpense =
    highlights.highest_expense;

  const latestExpense =
    highlights.latest_expense;


  // =====================================================
  // CHART DATA
  // =====================================================

  const categoryChartData =
    categoryData.map(
      (item) => ({

        name:
          getCategoryName(
            item.category
          ),

        value:
          Number(
            item.total_spending || 0
          ),

      })
    );


  const incomeExpenseData = [

    {
      name: "Income",

    amount:
        Number(
          summary.total_income || 0
        ),
    },

    {
      name: "Expenses",

      amount:
        Number(
          summary.total_expense || 0
        ),
    },

  ];


  const budgetChartData =
    budgetData.map(
      (item) => ({

        name:
          `${getCategoryName(
            item.category
          )} - ${item.month}`,

        budget:
          Number(
            item.budget_amount || 0
          ),

        spent:
          Number(
            item.spent_amount || 0
          ),

      })
    );


  // =====================================================
  // COLORS
  // =====================================================

  const chartColors = [

    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
    "#14b8a6",

  ];


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="analytics-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="analytics-header">

        <div>

          <span className="analytics-eyebrow">
            📈 FINANCIAL INSIGHTS
          </span>

          <h1>
            Financial Analytics
          </h1>

          <p>
            Understand your income, spending,
            savings, and financial progress.
          </p>

        </div>


        <button
          className="analytics-refresh-button"
          onClick={() =>
            fetchDashboard(true)
          }
          disabled={refreshing}
        >

          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}

        </button>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="analytics-summary-grid">


        {/* INCOME */}

        <div className="analytics-summary-card income">

          <div className="analytics-summary-icon">
            💰
          </div>

          <div>

            <span>
              Total Income
            </span>

            <h2>
              ₹
              {formatMoney(
                summary.total_income
              )}
            </h2>

            <small>
              Total money received
            </small>

          </div>

        </div>


        {/* EXPENSE */}

        <div className="analytics-summary-card expense">

          <div className="analytics-summary-icon">
            💸
          </div>

          <div>

            <span>
              Total Expense
            </span>

            <h2>
              ₹
              {formatMoney(
                summary.total_expense
              )}
            </h2>

            <small>
              Total money spent
            </small>

          </div>

        </div>


        {/* BALANCE */}

        <div className="analytics-summary-card balance">

          <div className="analytics-summary-icon">
            💵
          </div>

          <div>

            <span>
              Current Balance
            </span>

            <h2>
              ₹
              {formatMoney(
                summary.current_balance
              )}
            </h2>

            <small>
              Available balance
            </small>

          </div>

        </div>


        {/* SAVINGS */}

        <div className="analytics-summary-card savings">

          <div className="analytics-summary-icon">
            🎯
          </div>

          <div>

            <span>
              Total Savings
            </span>

            <h2>
              ₹
              {formatMoney(
                summary.total_savings
              )}
            </h2>

            <small>
              Money saved toward goals
            </small>

          </div>

        </div>


        {/* BUDGET */}

        <div className="analytics-summary-card budget">

          <div className="analytics-summary-icon">
            📊
          </div>

          <div>

            <span>
              Remaining Budget
            </span>

            <h2>
              ₹
              {formatMoney(
                summary.remaining_budget
              )}
            </h2>

            <small>
              Available budget
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          VISUAL ANALYSIS
      ================================================= */}

      <div className="analytics-section-heading">

        <span>
          VISUAL ANALYSIS
        </span>

        <h2>
          Financial Performance
        </h2>

        <p>
          Visualize your spending, income,
          and budget performance.
        </p>

      </div>


      <div className="analytics-chart-grid">


        {/* =================================================
            PIE CHART
        ================================================= */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h2>
                Expense by Category
              </h2>

              <p>
                Where your money is going
              </p>

            </div>

            <span>
              🥧
            </span>

          </div>


          {categoryChartData.length > 0 ? (

            <div className="analytics-chart">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >

                    {categoryChartData.map(
                      (
                        entry,
                        index
                      ) => (

                        <Cell
                          key={
                            `cell-${index}`
                          }
                          fill={
                            chartColors[
                              index %
                              chartColors.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      `₹${formatMoney(
                        value
                      )}`
                    }
                  />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="analytics-empty-chart">
              No expense category data available.
            </div>

          )}

        </div>


        {/* =================================================
            INCOME VS EXPENSE
        ================================================= */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h2>
                Income vs Expenses
              </h2>

              <p>
                Compare your earnings and spending
              </p>

            </div>

            <span>
              ⚖️
            </span>

          </div>


          <div className="analytics-chart">

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <BarChart
                data={
                  incomeExpenseData
                }
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
                    `₹${formatMoney(
                      value
                    )}`
                  }
                />

                <Bar
                  dataKey="amount"
                  fill="#6366f1"
                  radius={[
                    8,
                    8,
                    0,
                    0
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* =================================================
            MONTHLY TREND
        ================================================= */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h2>
                Monthly Expense Trend
              </h2>

              <p>
                Track your spending over time
              </p>

            </div>

            <span>
              📈
            </span>

          </div>


          {monthlyData.length > 0 ? (

            <div className="analytics-chart">

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
                      `₹${formatMoney(
                        value
                      )}`
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

            <div className="analytics-empty-chart">
              No monthly expense data available.
            </div>

          )}

        </div>


        {/* =================================================
            BUDGET UTILIZATION
        ================================================= */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>

              <h2>
                Budget Utilization
              </h2>

              <p>
                How much of each budget is used
              </p>

            </div>

            <span>
              📊
            </span>

          </div>


          {budgetChartData.length > 0 ? (

            <div className="analytics-chart">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={
                    budgetChartData
                  }
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
                      `₹${formatMoney(
                        value
                      )}`
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="budget"
                    name="Budget"
                    fill="#94a3b8"
                    radius={[
                      0,
                      6,
                      6,
                      0
                    ]}
                  />

                  <Bar
                    dataKey="spent"
                    name="Spent"
                    fill="#6366f1"
                    radius={[
                      0,
                      6,
                      6,
                      0
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="analytics-empty-chart">
              No budget data available.
            </div>

          )}

        </div>

      </div>


      {/* =================================================
          KEY INSIGHTS
      ================================================= */}

      <div className="analytics-section-heading">

        <span>
          KEY INSIGHTS
        </span>

        <h2>
          What Your Numbers Say
        </h2>

        <p>
          A quick interpretation of your current
          financial position.
        </p>

      </div>


      <div className="analytics-insights-grid">


        {/* TOP CATEGORY */}

        <div className="analytics-insight-card">

          <div className="insight-icon">
            🏆
          </div>

          <div>

            <span>
              Top Spending Category
            </span>

            {topCategory ? (

              <>

                <h3>
                  {getCategoryIcon(
                    topCategory.category
                  )}{" "}
                  {getCategoryName(
                    topCategory.category
                  )}
                </h3>

                <p>
                  ₹
                  {formatMoney(
                    topCategory.total_spending
                  )}{" "}
                  ·{" "}
                  {topCategory.percentage}%
                  {" "}of expenses
                </p>

              </>

            ) : (

              <h3>
                No spending data
              </h3>

            )}

          </div>

        </div>


        {/* BUDGET UTILIZATION */}

        <div className="analytics-insight-card">

          <div className="insight-icon">
            💳
          </div>

          <div>

            <span>
              Overall Budget Utilization
            </span>

            <h3>
              {summary.overall_budget_utilization || 0}%
            </h3>

            <p>
              ₹
              {formatMoney(
                summary.total_expense
              )}
              {" "}spent of{" "}
              ₹
              {formatMoney(
                summary.total_budget
              )}
            </p>

          </div>

        </div>


        {/* SAVINGS */}

        <div className="analytics-insight-card">

          <div className="insight-icon">
            🎯
          </div>

          <div>

            <span>
              Savings Goals
            </span>

            <h3>
              {savingsSummary.active_goals || 0}
              {" "}Active
            </h3>

            <p>
              {savingsSummary.completed_goals || 0}
              {" "}completed ·{" "}
              {savingsSummary.total_goals || 0}
              {" "}total goals
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          EXPENSE HIGHLIGHTS
      ================================================= */}

      <div className="analytics-section-heading">

        <span>
          EXPENSE HIGHLIGHTS
        </span>

        <h2>
          Notable Spending
        </h2>

        <p>
          Important details from your expense history.
        </p>

      </div>


      <div className="analytics-highlight-grid">


        {/* HIGHEST */}

        <div className="analytics-highlight-card">

          <div className="highlight-top">

            <span>
              Highest Expense
            </span>

            <strong>
              🔥
            </strong>

          </div>


          {highestExpense ? (

            <>

              <h2>
                ₹
                {formatMoney(
                  highestExpense.amount
                )}
              </h2>

              <p>
                {getCategoryIcon(
                  highestExpense.category
                )}{" "}
                {getCategoryName(
                  highestExpense.category
                )}
              </p>

              <small>
                {highestExpense.description ||
                  "No description"}
              </small>

              <small>
                {highestExpense.date}
              </small>

            </>

          ) : (

            <p>
              No expense data available.
            </p>

          )}

        </div>


        {/* LATEST */}

        <div className="analytics-highlight-card">

          <div className="highlight-top">

            <span>
              Latest Expense
            </span>

            <strong>
              🕐
            </strong>

          </div>


          {latestExpense ? (

            <>

              <h2>
                ₹
                {formatMoney(
                  latestExpense.amount
                )}
              </h2>

              <p>
                {getCategoryIcon(
                  latestExpense.category
                )}{" "}
                {getCategoryName(
                  latestExpense.category
                )}
              </p>

              <small>
                {latestExpense.description ||
                  "No description"}
              </small>

              <small>
                {latestExpense.date}
              </small>

            </>

          ) : (

            <p>
              No recent expenses.
            </p>

          )}

        </div>

      </div>


      {/* =================================================
          CATEGORY BREAKDOWN
      ================================================= */}

      <div className="analytics-panel">

        <div className="analytics-panel-header">

          <div>

            <span className="analytics-section-label">
              SPENDING BREAKDOWN
            </span>

            <h2>
              Category-wise Expenses
            </h2>

            <p>
              See exactly where your money is going.
            </p>

          </div>

          <span>
            📂
          </span>

        </div>


        {categoryData.length > 0 ? (

          <div className="analytics-category-list">

            {categoryData.map(
              (item, index) => (

                <div
                  className="analytics-category-row"
                  key={index}
                >

                  <div className="category-left">

                    <div className="category-icon">
                      {getCategoryIcon(
                        item.category
                      )}
                    </div>

                    <div>

                      <strong>
                        {getCategoryName(
                          item.category
                        )}
                      </strong>

                      <span>
                        {item.percentage}%
                        {" "}of total expenses
                      </span>

                    </div>

                  </div>


                  <strong>
                    ₹
                    {formatMoney(
                      item.total_spending
                    )}
                  </strong>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="analytics-empty-state">
            No expense categories found.
          </div>

        )}

      </div>


      {/* =================================================
          SAVINGS PROGRESS
      ================================================= */}

      <div className="analytics-panel">

        <div className="analytics-panel-header">

          <div>

            <span className="analytics-section-label">
              SAVINGS PROGRESS
            </span>

            <h2>
              Active Savings Goals
            </h2>

            <p>
              Keep track of your financial goals.
            </p>

          </div>

          <span>
            🎯
          </span>

        </div>


        {savingsGoals.length > 0 ? (

          <div className="analytics-goals-grid">

            {savingsGoals.map(
              (goal) => (

                <div
                  className="analytics-goal-card"
                  key={goal.id}
                >

                  <div className="analytics-goal-header">

                    <div className="analytics-goal-icon">
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


                  <div className="analytics-goal-amount">

                    <strong>
                      ₹
                      {formatMoney(
                        goal.saved_amount
                      )}
                    </strong>

                    <span>
                      of ₹
                      {formatMoney(
                        goal.target_amount
                      )}
                    </span>

                  </div>


                  <div className="analytics-goal-progress">

                    <div
                      style={{
                        width:
                          `${Math.min(
                            goal.progress_percentage,
                            100
                          )}%`,
                      }}
                    ></div>

                  </div>


                  <div className="analytics-goal-footer">

                    <span>
                      {goal.progress_percentage}%
                      {" "}complete
                    </span>

                    <span>
                      {goal.remaining_amount > 0
                        ? `₹${formatMoney(
                            goal.remaining_amount
                          )} remaining`
                        : "Goal completed 🎉"}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="analytics-empty-state">

            <div className="analytics-empty-icon">
              🎯
            </div>

            <h3>
              You don't have any active savings goals.
            </h3>

            <p>
              Create a savings goal to start
              tracking your progress.
            </p>

          </div>

        )}

      </div>


      {/* =================================================
          RECENT NOTIFICATIONS
      ================================================= */}

      <div className="analytics-panel">

        <div className="analytics-panel-header">

          <div>

            <span className="analytics-section-label">
              RECENT ACTIVITY
            </span>

            <h2>
              Latest Notifications
            </h2>

            <p>
              Your most recent financial activity.
            </p>

          </div>

          <span>
            🔔
          </span>

        </div>


        {notifications.length > 0 ? (

          <div className="analytics-notification-list">

            {notifications.map(
              (notification) => (

                <div
                  className={`analytics-notification ${
                    notification.is_read
                      ? "read"
                      : "unread"
                  }`}
                  key={
                    notification.id
                  }
                >

                  <div className="analytics-notification-icon">

                    {getNotificationIcon(
                      notification.notification_type
                    )}

                  </div>


                  <div>

                    <div className="analytics-notification-title">

                      <strong>
                        {notification.title}
                      </strong>

                      {!notification.is_read && (

                        <span>
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
            )}

          </div>

        ) : (

          <div className="analytics-empty-state">

            <div className="analytics-empty-icon">
              🔔
            </div>

            <h3>
              No recent notifications.
            </h3>

            <p>
              Your latest financial activity
              will appear here.
            </p>

          </div>

        )}

      </div>


    </div>

  );

}


export default Analytics;
