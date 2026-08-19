import { useEffect, useState } from "react";
import axios from "axios";
import "./Reports.css";

function Reports() {

  const token = localStorage.getItem("access");

  const [monthly, setMonthly] = useState({});
  const [expense, setExpense] = useState({});
  const [savings, setSavings] = useState([]);
  const [summary, setSummary] = useState({});

  const [analytics, setAnalytics] = useState({
    category_analysis: [],
    monthly_trend: [],
    budget_status: [],
    recent_transactions: [],
    expense_highlights: {},
    financial_summary: {},
  });

  // NEW: monthly expense history calculated from expenses API
  const [monthlyExpenseHistory, setMonthlyExpenseHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // FETCH REPORT DATA
  // =====================================================

  useEffect(() => {
    fetchReports();
  }, []);


  const fetchReports = async () => {

    if (!token) {
      setError("Please login to view your financial reports.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {

      const [
        monthlyRes,
        expenseRes,
        savingsRes,
        summaryRes,
        analyticsRes,
        expensesListRes, // NEW
      ] = await Promise.all([

        axios.get(
          "https://budgetbuddy-backend-l9tv.onrender.com/api/reports/monthly-report/?month=8&year=2026",
          { headers }
        ),

        axios.get(
          "https://budgetbuddy-backend-l9tv.onrender.com/api/reports/expense-report/?filter=current_month",
          { headers }
        ),

        axios.get(
          "https://budgetbuddy-backend-l9tv.onrender.com/api/reports/savings-report/",
          { headers }
        ),

        axios.get(
          "https://budgetbuddy-backend-l9tv.onrender.com/api/reports/financial-summary-report/",
          { headers }
        ),

        axios.get(
          "https://budgetbuddy-backend-l9tv.onrender.com/api/analytics/dashboard/",
          { headers }
        ),

        // NEW: Get ALL expenses
        axios.get(
          "https://budgetbuddy-backend-l9tv.onrender.com/api/expenses/",
          { headers }
        ),

      ]);


      setMonthly(monthlyRes.data);

      setExpense(expenseRes.data);

      setSavings(savingsRes.data);

      setSummary(summaryRes.data);

      setAnalytics(analyticsRes.data);


      // =====================================================
      // CALCULATE MONTHLY EXPENSE HISTORY
      // =====================================================

      const expensesData = expensesListRes.data;

      // Handle both possible API formats:
      // [ ...expenses ]
      // OR { results: [ ...expenses ] }

      const expensesArray = Array.isArray(expensesData)
        ? expensesData
        : expensesData.results || [];


      const monthlyMap = {};


      expensesArray.forEach((expenseItem) => {

        if (!expenseItem.date) {
          return;
        }

        const date = new Date(expenseItem.date);

        const year = date.getFullYear();

        const monthNumber = date.getMonth();

        const monthName = date.toLocaleString(
          "en-US",
          {
            month: "short",
          }
        );

        const monthKey =
          `${year}-${String(monthNumber + 1).padStart(2, "0")}`;


        if (!monthlyMap[monthKey]) {

          monthlyMap[monthKey] = {
            month: `${monthName} ${year}`,
            total_expense: 0,
          };

        }


        monthlyMap[monthKey].total_expense +=
          Number(expenseItem.amount || 0);

      });


      const history = Object.values(monthlyMap)
        .sort((a, b) => {

          return a.month.localeCompare(
            b.month
          );

        });


      setMonthlyExpenseHistory(history);


    } catch (err) {

      console.error("Reports Error:", err);

      if (err.response?.status === 401) {

        setError(
          "Your session has expired. Please login again."
        );

      } else {

        setError(
          "Unable to load your financial reports."
        );

      }

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // DATA
  // =====================================================

  const financialSummary =
    summary.financial_summary || {};


  const categoryData =
    analytics.category_analysis || [];


  const budgetData =
    analytics.budget_status || [];


  const expenseHighlights =
    analytics.expense_highlights || {};


  const topCategory =
    analytics.top_category || null;


  const savingsSummary =
    analytics.savings_summary || {};


  // =====================================================
  // HELPERS
  // =====================================================

  const formatMoney = (value) => {

    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  };


  const formatPercentage = (value) => {

    return Number(value || 0).toFixed(2);

  };


  const getCategoryIcon = (category) => {

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

    return icons[
      category?.toUpperCase()
    ] || "📊";

  };


  const getCategoryName = (category) => {

    if (!category) {
      return "Other";
    }

    return category
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) => letter.toUpperCase()
      );

  };


  const getBudgetStatusClass = (status) => {

    switch (status) {

      case "EXCEEDED":
        return "report-status-exceeded";

      case "HIGH":
        return "report-status-high";

      case "WARNING":
        return "report-status-warning";

      default:
        return "report-status-safe";

    }

  };


  // =====================================================
  // DOWNLOAD CSV
  // =====================================================

  const downloadCSV = () => {

    const rows = [
      ["FINANCIAL REPORT"],
      [],

      ["FINANCIAL SUMMARY"],
      [
        "Total Income",
        financialSummary.total_income || 0
      ],
      [
        "Total Expense",
        financialSummary.total_expense || 0
      ],
      [
        "Current Balance",
        financialSummary.current_balance || 0
      ],
      [
        "Total Savings",
        financialSummary.total_savings || 0
      ],
      [
        "Remaining Budget",
        financialSummary.remaining_budget || 0
      ],

      [
        "Highest Expense Month",
        financialSummary.highest_expense_month || ""
      ],

      [
        "Highest Expense Amount",
        financialSummary.highest_expense_amount || 0
      ],

      [],

      ["EXPENSE REPORT"],
      [
        "Total Records",
        expense.total_records || 0
      ],

      [],

      ["CATEGORY EXPENSES"],
      ["Category", "Amount", "Percentage"],

      ...categoryData.map((item) => [
        item.category,
        item.total_spending,
        item.percentage || 0,
      ]),

      [],

      ["MONTHLY EXPENSE HISTORY"],
      ["Month", "Expense"],

      ...monthlyExpenseHistory.map((item) => [
        item.month,
        item.total_expense,
      ]),

      [],

      ["BUDGET REPORT"],
      [
        "Category",
        "Month",
        "Budget",
        "Spent",
        "Remaining",
        "Utilization",
        "Status",
      ],

      ...budgetData.map((item) => [
        item.category,
        `${item.month} ${item.year}`,
        item.budget_amount,
        item.spent_amount,
        item.remaining_amount,
        `${item.utilization_percentage}%`,
        item.status,
      ]),

      [],

      ["SAVINGS GOALS"],
      [
        "Goal",
        "Target",
        "Saved",
        "Remaining",
        "Progress",
        "Status"
      ],

      ...savings.map((goal) => [
        goal.goal_name,
        goal.target_amount,
        goal.saved_amount,
        goal.remaining_amount,
        `${goal.progress_percentage}%`,
        goal.status,
      ]),
    ];


    const csvContent =
      rows
        .map((row) =>
          row
            .map((cell) =>
              `"${String(cell ?? "").replace(/"/g, '""')}"`
            )
            .join(",")
        )
        .join("\n");


    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;


    link.download =
      "financial-report.csv";


    link.click();


    URL.revokeObjectURL(url);

  };


  // =====================================================
  // PRINT / PDF
  // =====================================================

  const printReport = () => {
    window.print();
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="reports-page">

        <div className="reports-loading">

          <div className="reports-spinner"></div>

          <h2>
            Preparing your financial report...
          </h2>

          <p>
            Collecting your latest financial information.
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

      <div className="reports-page">

        <div className="reports-error">

          <div className="reports-error-icon">
            ⚠️
          </div>

          <h2>
            Unable to load reports
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={fetchReports}
          >
            Try Again
          </button>

        </div>

      </div>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="reports-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="reports-header">

        <div>

          <span className="reports-eyebrow">
            📄 FINANCIAL REPORTING
          </span>

          <h1>
            Financial Reports
          </h1>

          <p>
            A detailed view of your income,
            expenses, budgets, savings, and
            financial performance.
          </p>

        </div>


        <div className="reports-actions">

          <button
            className="report-action secondary"
            onClick={fetchReports}
          >
            ↻ Refresh
          </button>

          <button
            className="report-action secondary"
            onClick={printReport}
          >
            🖨️ Print
          </button>

          <button
            className="report-action primary"
            onClick={downloadCSV}
          >
            📥 Download CSV
          </button>

        </div>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="report-summary-grid">

        <div className="report-summary-card income">

          <div className="report-summary-icon">
            💰
          </div>

          <div>

            <span>
              Total Income
            </span>

            <h2>
              ₹{formatMoney(
                financialSummary.total_income
              )}
            </h2>

            <small>
              Total money received
            </small>

          </div>

        </div>


        <div className="report-summary-card expense">

          <div className="report-summary-icon">
            💸
          </div>

          <div>

            <span>
              Total Expenses
            </span>

            <h2>
              ₹{formatMoney(
                financialSummary.total_expense
              )}
            </h2>

            <small>
              Total money spent
            </small>

          </div>

        </div>


        <div className="report-summary-card balance">

          <div className="report-summary-icon">
            💵
          </div>

          <div>

            <span>
              Current Balance
            </span>

            <h2>
              ₹{formatMoney(
                financialSummary.current_balance
              )}
            </h2>

            <small>
              Available balance
            </small>

          </div>

        </div>


        <div className="report-summary-card savings">

          <div className="report-summary-icon">
            🎯
          </div>

          <div>

            <span>
              Total Savings
            </span>

            <h2>
              ₹{formatMoney(
                financialSummary.total_savings
              )}
            </h2>

            <small>
              Saved toward goals
            </small>

          </div>

        </div>


        <div className="report-summary-card budget">

          <div className="report-summary-icon">
            📊
          </div>

          <div>

            <span>
              Remaining Budget
            </span>

            <h2
              className={
                Number(
                  financialSummary.remaining_budget || 0
                ) < 0
                  ? "negative-report-value"
                  : ""
              }
            >
              ₹{formatMoney(
                financialSummary.remaining_budget
              )}
            </h2>

            <small>
              Available budget
            </small>

          </div>

        </div>


        {/* HIGHEST EXPENSE MONTH */}

        <div className="report-summary-card expense">

          <div className="report-summary-icon">
            🔥
          </div>

          <div>

            <span>
              Highest Expense Month
            </span>

            <h2>
              {financialSummary.highest_expense_month ||
                "No data"}
            </h2>

            <small>
              ₹{formatMoney(
                financialSummary.highest_expense_amount
              )} spent
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          MONTHLY REPORT
      ================================================= */}

      <div className="report-section">

        <div className="section-heading">

          <div>

            <span>
              MONTHLY PERFORMANCE
            </span>

            <h2>
              📅 Monthly Financial Report
            </h2>

            <p>
              Your financial performance for
              the selected month.
            </p>

          </div>

        </div>


        <div className="monthly-report-card">

          <div className="monthly-stat income-stat">

            <span>
              Income
            </span>

            <strong>
              ₹{formatMoney(
                monthly.total_income
              )}
            </strong>

          </div>


          <div className="monthly-stat expense-stat">

            <span>
              Expenses
            </span>

            <strong>
              ₹{formatMoney(
                monthly.total_expense
              )}
            </strong>

          </div>


          <div className="monthly-stat balance-stat">

            <span>
              Balance
            </span>

            <strong>
              ₹{formatMoney(
                monthly.current_balance
              )}
            </strong>

          </div>


          <div className="monthly-stat savings-stat">

            <span>
              Savings
            </span>

            <strong>
              ₹{formatMoney(
                monthly.total_savings
              )}
            </strong>

          </div>


          <div className="monthly-stat budget-stat">

            <span>
              Remaining Budget
            </span>

            <strong
              className={
                Number(
                  monthly.remaining_budget || 0
                ) < 0
                  ? "negative-report-value"
                  : ""
              }
            >
              ₹{formatMoney(
                monthly.remaining_budget
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          EXPENSE + CATEGORY
      ================================================= */}

      <div className="reports-two-column">


        <div className="report-panel">

          <div className="panel-heading">

            <div>

              <span>
                EXPENSE REPORT
              </span>

              <h2>
                💸 Spending Overview
              </h2>

            </div>

            <div className="panel-icon">
              💸
            </div>

          </div>


          <div className="expense-total-box">

            <span>
              Total expense records
            </span>

            <strong>
              {expense.total_records || 0}
            </strong>

          </div>


          {expenseHighlights.highest_expense && (

            <div className="highlight-expense">

              <div className="highlight-icon">
                🔥
              </div>

              <div>

                <span>
                  Highest Expense
                </span>

                <strong>
                  ₹{formatMoney(
                    expenseHighlights.highest_expense.amount
                  )}
                </strong>

                <small>
                  {getCategoryName(
                    expenseHighlights.highest_expense.category
                  )}
                  {" • "}
                  {expenseHighlights.highest_expense.date}
                </small>

              </div>

            </div>

          )}

        </div>


        <div className="report-panel">

          <div className="panel-heading">

            <div>

              <span>
                EXPENSE BREAKDOWN
              </span>

              <h2>
                📂 Category Spending
              </h2>

            </div>

            <div className="panel-icon">
              📊
            </div>

          </div>


          {categoryData.length > 0 ? (

            <div className="category-report-list">

              {categoryData.map(
                (item, index) => {

                  const percentage =
                    Number(
                      item.percentage ??
                      (
                        Number(
                          financialSummary.total_expense || 0
                        ) > 0
                          ? (
                              Number(
                                item.total_spending || 0
                              ) /
                              Number(
                                financialSummary.total_expense || 1
                              )
                            ) * 100
                          : 0
                      )
                    );

                  return (

                    <div
                      className="category-report-item"
                      key={index}
                    >

                      <div className="category-report-top">

                        <div>

                          <span className="category-report-icon">
                            {getCategoryIcon(
                              item.category
                            )}
                          </span>

                          <strong>
                            {getCategoryName(
                              item.category
                            )}
                          </strong>

                        </div>

                        <strong>
                          ₹{formatMoney(
                            item.total_spending
                          )}
                        </strong>

                      </div>


                      <div className="category-progress">

                        <div
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />

                      </div>


                      <div className="category-report-bottom">

                        <span>
                          {percentage.toFixed(2)}%
                          {" "}of expenses
                        </span>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          ) : (

            <div className="report-empty">
              No category expense data available.
            </div>

          )}

        </div>

      </div>


      {/* =================================================
          BUDGET REPORT
      ================================================= */}

      <div className="report-section">

        <div className="section-heading">

          <div>

            <span>
              BUDGET MONITORING
            </span>

            <h2>
              💳 Budget Report
            </h2>

            <p>
              Track how much of each budget has
              been used.
            </p>

          </div>

        </div>


        <div className="budget-report-list">

          {budgetData.length > 0 ? (

            budgetData.map((budget) => (

              <div
                className="budget-report-card"
                key={budget.id}
              >

                <div className="budget-report-header">

                  <div>

                    <div className="budget-report-title">

                      <span>
                        {getCategoryIcon(
                          budget.category
                        )}
                      </span>

                      <strong>
                        {getCategoryName(
                          budget.category
                        )}
                      </strong>

                    </div>

                    <small>
                      {budget.month} {budget.year}
                    </small>

                  </div>


                  <span
                    className={`report-status ${getBudgetStatusClass(
                      budget.status
                    )}`}
                  >
                    {budget.status}
                  </span>

                </div>


                <div className="budget-report-amounts">

                  <div>

                    <span>
                      Budget
                    </span>

                    <strong>
                      ₹{formatMoney(
                        budget.budget_amount
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Spent
                    </span>

                    <strong className="expense-text">
                      ₹{formatMoney(
                        budget.spent_amount
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Remaining
                    </span>

                    <strong
                      className={
                        Number(
                          budget.remaining_amount
                        ) < 0
                          ? "negative-report-value"
                          : "positive-report-value"
                      }
                    >
                      ₹{formatMoney(
                        budget.remaining_amount
                      )}
                    </strong>

                  </div>

                </div>


                <div className="budget-report-progress">

                  <div className="budget-report-progress-header">

                    <span>
                      Utilization
                    </span>

                    <strong>
                      {formatPercentage(
                        budget.utilization_percentage
                      )}%
                    </strong>

                  </div>

                  <div className="budget-report-progress-track">

                    <div
                      className={getBudgetStatusClass(
                        budget.status
                      )}
                      style={{
                        width: `${Math.min(
                          Number(
                            budget.utilization_percentage || 0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            ))

          ) : (

            <div className="report-empty">
              No budgets available.
            </div>

          )}

        </div>

      </div>


      {/* =================================================
          MONTHLY EXPENSE HISTORY
      ================================================= */}

      <div className="report-section">

        <div className="section-heading">

          <div>

            <span>
              SPENDING HISTORY
            </span>

            <h2>
              📈 Monthly Expense History
            </h2>

            <p>
              Review how your expenses changed
              over time.
            </p>

          </div>

        </div>


        <div className="monthly-history">

          {monthlyExpenseHistory.length > 0 ? (

            monthlyExpenseHistory.map(
              (item, index) => {

                const maxExpense =
                  Math.max(
                    ...monthlyExpenseHistory.map(
                      (month) =>
                        Number(
                          month.total_expense || 0
                        )
                    ),
                    1
                  );


                const percentage =
                  (
                    Number(
                      item.total_expense || 0
                    ) /
                    maxExpense
                  ) * 100;


                const isHighest =
                  Number(item.total_expense || 0) ===
                  Number(
                    financialSummary.highest_expense_amount || 0
                  );


                return (

                  <div
                    className="monthly-history-item"
                    key={index}
                  >

                    <div className="monthly-history-label">

                      <strong>

                        {item.month}

                        {isHighest && (
                          <span>
                            {" "}🔥
                          </span>
                        )}

                      </strong>

                      <span>
                        ₹{formatMoney(
                          item.total_expense
                        )}
                      </span>

                    </div>


                    <div className="monthly-history-track">

                      <div
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>

                );

              }
            )

          ) : (

            <div className="report-empty">
              No monthly expense history available.
            </div>

          )}

        </div>

      </div>


      {/* =================================================
          SAVINGS GOALS
      ================================================= */}

      <div className="report-section">

        <div className="section-heading">

          <div>

            <span>
              SAVINGS PROGRESS
            </span>

            <h2>
              🎯 Savings Goals Report
            </h2>

            <p>
              Track progress toward your financial goals.
            </p>

          </div>

          <div className="savings-count">

            <strong>
              {savingsSummary.active_goals ??
                savings.filter(
                  (goal) =>
                    goal.status === "ACTIVE"
                ).length}
            </strong>

            <span>
              Active Goals
            </span>

          </div>

        </div>


        {savings.length > 0 ? (

          <div className="savings-report-grid">

            {savings.map(
              (goal, index) => (

                <div
                  className="savings-goal-report"
                  key={index}
                >

                  <div className="savings-goal-header">

                    <div className="savings-goal-icon">
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


                  <div className="savings-goal-money">

                    <strong>
                      ₹{formatMoney(
                        goal.saved_amount
                      )}
                    </strong>

                    <span>
                      of ₹{formatMoney(
                        goal.target_amount
                      )}
                    </span>

                  </div>


                  <div className="savings-goal-progress">

                    <div
                      style={{
                        width: `${Math.min(
                          Number(
                            goal.progress_percentage || 0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>


                  <div className="savings-goal-footer">

                    <span>
                      {formatPercentage(
                        goal.progress_percentage
                      )}% complete
                    </span>

                    <span>
                      {Number(
                        goal.remaining_amount || 0
                      ) > 0
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

          <div className="report-empty large-empty">
            🎯 No savings goals available yet.
          </div>

        )}

      </div>


      {/* =================================================
          REPORT FOOTER
      ================================================= */}

      <div className="reports-footer">

        <div>

          <span>
            FINANCIAL REPORT
          </span>

          <strong>
            Generated from your latest financial data
          </strong>

        </div>

        <div className="footer-actions">

          <button
            onClick={printReport}
          >
            🖨️ Print / Save PDF
          </button>

          <button
            onClick={downloadCSV}
          >
            📥 Download CSV
          </button>

        </div>

      </div>


    </div>

  );

}

export default Reports;
