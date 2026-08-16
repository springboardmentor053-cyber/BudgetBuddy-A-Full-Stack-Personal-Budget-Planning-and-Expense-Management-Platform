import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/reports.css";

const chartColors = [
  "#2563eb",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#22c55e",
  "#64748b",
];

function Reports() {
  const [report, setReport] = useState(null);

  const [filter, setFilter] =
    useState("current_month");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [downloading, setDownloading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // TOKEN CONFIG
  // =========================================================

  const getTokenConfig = () => {
    const token =
      localStorage.getItem("access");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // =========================================================
  // FETCH REPORT
  // =========================================================

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access");

      if (!token) {
        setError(
          "Please log in to view reports."
        );

        setLoading(false);

        return;
      }

      let url =
  `reports/financial-summary-report/?filter=${filter}`;

      // -----------------------------------------------------
      // CUSTOM DATE RANGE
      // -----------------------------------------------------

      if (filter === "custom") {
        if (!startDate || !endDate) {
          setError(
            "Please select both start date and end date."
          );

          setLoading(false);

          return;
        }

        url +=
          `&start_date=${startDate}` +
          `&end_date=${endDate}`;
      }

      const response =
        await api.get(
          url,
          getTokenConfig()
        );

      setReport(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Unable to load report information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL REPORT LOAD
  // =========================================================

  useEffect(() => {
    fetchReport();
  }, []);

  // =========================================================
  // APPLY FILTER
  // =========================================================

  const handleApplyFilter = () => {
    fetchReport();
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      setError("");

      const token =
        localStorage.getItem("access");

      if (!token) {
        setError(
          "Please log in to download the report."
        );

        return;
      }

      let url =
  `reports/report/pdf/?filter=${filter}`;

      // -----------------------------------------------------
      // CUSTOM DATE RANGE
      // -----------------------------------------------------

      if (filter === "custom") {
        if (!startDate || !endDate) {
          setError(
            "Please select both start date and end date."
          );

          return;
        }

        url +=
          `&start_date=${startDate}` +
          `&end_date=${endDate}`;
      }

      const response =
        await api.get(
          url,
          {
            ...getTokenConfig(),
            responseType: "blob",
          }
        );

      const blob =
        new Blob(
          [response.data],
          {
            type: "application/pdf",
          }
        );

      const downloadUrl =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href =
        downloadUrl;

      link.download =
        "financial_report.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        downloadUrl
      );
    } catch (err) {
      setError(
        "Unable to download the PDF report."
      );
    } finally {
      setDownloading(false);
    }
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================================================
  // FORMAT CHART AXIS VALUES
  // =========================================================

  const formatChartCurrency = (value) => {
    const number =
      Number(value || 0);

    return `₹${number.toLocaleString(
      "en-IN"
    )}`;
  };

  // =========================================================
  // CATEGORY DATA
  // =========================================================

  const categoryData = useMemo(() => {
    if (
      !report?.expense_summary
        ?.category_breakdown
    ) {
      return [];
    }

    return report
      .expense_summary
      .category_breakdown
      .map((item) => ({
        name:
          item.category ||
          "Other",

        value: Number(
          item.total ??
            item.amount ??
            0
        ),
      }));
  }, [report]);

  // =========================================================
  // HIGHEST CATEGORY
  // =========================================================

  const highestCategory =
    useMemo(() => {
      if (
        categoryData.length === 0
      ) {
        return "No data";
      }

      return categoryData.reduce(
        (highest, category) =>
          category.value >
          highest.value
            ? category
            : highest
      ).name;
    }, [categoryData]);

  // =========================================================
  // INCOME VS EXPENSE DATA
  // =========================================================

  const incomeExpenseData =
    useMemo(() => {
      if (!report) {
        return [];
      }

      return [
        {
          name:
            "Financial Summary",

          Income: Number(
            report
              .financial_summary
              ?.total_income ||
              0
          ),

          Expenses: Number(
            report
              .financial_summary
              ?.total_expense ||
              0
          ),

          Balance: Number(
            report
              .financial_summary
              ?.current_balance ||
              0
          ),
        },
      ];
    }, [report]);

  // =========================================================
  // FILTER LABEL
  // =========================================================

  const filterLabel = () => {
    if (!report?.report) {
      return "";
    }

    if (
      report.report.filter ===
      "current_month"
    ) {
      return "Current Month";
    }

    if (
      report.report.filter ===
      "previous_month"
    ) {
      return "Previous Month";
    }

    return "Custom Date Range";
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN REPORTS AREA
      ===================================================== */}

      <main className="reports-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="reports-header">

          <p className="dashboard-eyebrow">
            Financial reports
          </p>

          <h1>
            Reports & Analytics
          </h1>

          <p>
            Understand your income,
            expenses, budget, savings,
            and financial performance.
          </p>

        </header>

        {/* ===================================================
            FILTER SECTION
        =================================================== */}

        <section className="reports-filter-card">

          <div className="filter-heading">

            <div>

              <h2>
                Report Period
              </h2>

              <p>
                Select the period you want
                to analyze.
              </p>

            </div>

          </div>

          <div className="filter-controls">

            {/* -------------------------------------------------
                PERIOD SELECT
            ------------------------------------------------- */}

            <div className="filter-field">

              <label
                htmlFor="report-filter"
              >
                Period
              </label>

              <select
                id="report-filter"
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value
                  )
                }
              >

                <option
                  value="current_month"
                >
                  Current Month
                </option>

                <option
                  value="previous_month"
                >
                  Previous Month
                </option>

                <option
                  value="custom"
                >
                  Custom Date Range
                </option>

              </select>

            </div>

            {/* -------------------------------------------------
                CUSTOM START DATE
            ------------------------------------------------- */}

            {filter === "custom" && (
              <>

                <div className="filter-field">

                  <label
                    htmlFor="start-date"
                  >
                    Start Date
                  </label>

                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* -------------------------------------------------
                    CUSTOM END DATE
                ------------------------------------------------- */}

                <div className="filter-field">

                  <label
                    htmlFor="end-date"
                  >
                    End Date
                  </label>

                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      setEndDate(
                        e.target.value
                      )
                    }
                  />

                </div>

              </>
            )}

            {/* -------------------------------------------------
                APPLY FILTER BUTTON
            ------------------------------------------------- */}

            <button
              className="apply-filter-btn"
              onClick={
                handleApplyFilter
              }
              disabled={loading}
            >

              {loading
                ? "Loading..."
                : "Apply Filter"}

            </button>

            {/* -------------------------------------------------
                DOWNLOAD PDF BUTTON
            ------------------------------------------------- */}

            <button
              className="download-report-btn"
              onClick={
                handleDownloadPDF
              }
              disabled={downloading}
            >

              {downloading
                ? "Downloading..."
                : "Download PDF"}

            </button>

          </div>

        </section>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && !report ? (

          <div className="dashboard-loading">
            Loading reports...
          </div>

        ) : report ? (

          <>

            {/* ===============================================
                ACTIVE REPORT PERIOD
            =============================================== */}

            <div className="active-report-period">

              <div>

                <span>
                  Showing
                </span>

                <strong>
                  {filterLabel()}
                </strong>

              </div>

              <div>

                <span>
                  Period
                </span>

                <strong>
                  {report.report.start_date}

                  {" → "}

                  {report.report.end_date}
                </strong>

              </div>

            </div>

            {/* ===============================================
                SUMMARY CARDS
            =============================================== */}

            <section className="report-summary-grid">

              {/* ------------------------------------------------
                  TOTAL INCOME
              ------------------------------------------------ */}

              <div className="report-summary-card">

                <span>
                  Total Income
                </span>

                <strong
                  className="report-income"
                >
                  {formatCurrency(
                    report
                      .financial_summary
                      ?.total_income
                  )}
                </strong>

              </div>

              {/* ------------------------------------------------
                  TOTAL EXPENSE
              ------------------------------------------------ */}

              <div className="report-summary-card">

                <span>
                  Total Expenses
                </span>

                <strong
                  className="report-expense"
                >
                  {formatCurrency(
                    report
                      .financial_summary
                      ?.total_expense
                  )}
                </strong>

              </div>

              {/* ------------------------------------------------
                  CURRENT BALANCE
              ------------------------------------------------ */}

              <div className="report-summary-card">

                <span>
                  Current Balance
                </span>

                <strong
                  className="report-balance"
                >
                  {formatCurrency(
                    report
                      .financial_summary
                      ?.current_balance
                  )}
                </strong>

              </div>

              {/* ------------------------------------------------
                  TOP CATEGORY
              ------------------------------------------------ */}

              <div className="report-summary-card">

                <span>
                  Top Category
                </span>

                <strong>
                  {highestCategory}
                </strong>

              </div>

            </section>

            {/* ===============================================
                CHART GRID
            =============================================== */}

            <section className="reports-chart-grid">

              {/* =============================================
                  INCOME VS EXPENSES
              ============================================= */}

              <div className="report-chart-card">

                <div className="report-card-header">

                  <h2>
                    Income vs Expenses
                  </h2>

                  <p>
                    Financial comparison
                    for the selected period
                  </p>

                </div>

                <div className="chart-container">

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
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                      />

                      {/* =================================================
                          Y-AXIS RUPEE FORMAT
                      ================================================= */}

                      <YAxis
                        tickFormatter={
                          formatChartCurrency
                        }
                      />

                      {/* =================================================
                          TOOLTIP
                      ================================================= */}

                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(
                            value
                          )
                        }
                      />

                      <Legend />

                      {/* -------------------------------------------------
                          INCOME BAR
                      ------------------------------------------------- */}

                      <Bar
                        dataKey="Income"
                        fill="#22c55e"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                      {/* -------------------------------------------------
                          EXPENSE BAR
                      ------------------------------------------------- */}

                      <Bar
                        dataKey="Expenses"
                        fill="#ef4444"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                      {/* -------------------------------------------------
                          BALANCE BAR
                      ------------------------------------------------- */}

                      <Bar
                        dataKey="Balance"
                        fill="#2563eb"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

              {/* =============================================
                  EXPENSE CATEGORY
              ============================================= */}

              <div className="report-chart-card">

                <div className="report-card-header">

                  <h2>
                    Expenses by Category
                  </h2>

                  <p>
                    Where your money was
                    spent
                  </p>

                </div>

                {categoryData.length ===
                0 ? (

                  <div className="report-empty-state">

                    No expense data
                    available for this
                    period.

                  </div>

                ) : (

                  <div className="chart-container">

                    <ResponsiveContainer
                      width="100%"
                      height={320}
                    >

                      <PieChart>

                        <Pie
                          data={
                            categoryData
                          }
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={105}
                          label={({
                            name,
                            percent,
                          }) =>
                            `${name} ${(
                              percent *
                              100
                            ).toFixed(
                              0
                            )}%`
                          }
                        >

                          {categoryData.map(
                            (
                              entry,
                              index
                            ) => (

                              <Cell
                                key={
                                  entry.name
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
                          formatter={(
                            value
                          ) =>
                            formatCurrency(
                              value
                            )
                          }
                        />

                        <Legend />

                      </PieChart>

                    </ResponsiveContainer>

                  </div>

                )}

              </div>

              {/* =============================================
                  BUDGET SUMMARY
              ============================================= */}

              <div className="report-chart-card">

                <div className="report-card-header">

                  <h2>
                    Budget Summary
                  </h2>

                  <p>
                    Budget performance
                    for this report
                    period
                  </p>

                </div>

                <div className="budget-report-content">

                  {/* -------------------------------------------------
                      TOTAL BUDGET
                  ------------------------------------------------- */}

                  <div className="budget-report-row">

                    <span>
                      Total Budget
                    </span>

                    <strong>
                      {formatCurrency(
                        report
                          .budget_summary
                          ?.total_budget
                      )}
                    </strong>

                  </div>

                  {/* -------------------------------------------------
                      AMOUNT SPENT
                  ------------------------------------------------- */}

                  <div className="budget-report-row">

                    <span>
                      Amount Spent
                    </span>

                    <strong
                      className="report-expense"
                    >
                      {formatCurrency(
                        report
                          .budget_summary
                          ?.spent
                      )}
                    </strong>

                  </div>

                  {/* -------------------------------------------------
                      REMAINING BUDGET
                  ------------------------------------------------- */}

                  <div className="budget-report-row">

                    <span>
                      Remaining Budget
                    </span>

                    <strong
                      className="report-income"
                    >
                      {formatCurrency(
                        report
                          .budget_summary
                          ?.remaining_budget
                      )}
                    </strong>

                  </div>

                  {/* -------------------------------------------------
                      BUDGET PROGRESS
                  ------------------------------------------------- */}

                  <div className="budget-progress-wrapper">

                    <div className="budget-progress-header">

                      <span>
                        Budget Usage
                      </span>

                      <strong>
                        {
                          report
                            .budget_summary
                            ?.usage_percentage
                        }
                        %
                      </strong>

                    </div>

                    <div className="budget-progress-bar">

                      <div
                        className={`budget-progress-fill ${
                          report
                            .budget_summary
                            ?.status ===
                          "OVER_BUDGET"
                            ? "over-budget"
                            : ""
                        }`}
                        style={{
                          width: `${Math.min(
                            Number(
                              report
                                .budget_summary
                                ?.usage_percentage ||
                                0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* -------------------------------------------------
                      BUDGET STATUS
                  ------------------------------------------------- */}

                  <div className="budget-status">

                    <span>
                      Status
                    </span>

                    <strong
                      className={`status-${String(
                        report
                          .budget_summary
                          ?.status ||
                          ""
                      ).toLowerCase()}`}
                    >
                      {String(
                        report
                          .budget_summary
                          ?.status ||
                          "NO_BUDGET"
                      ).replace(
                        "_",
                        " "
                      )}
                    </strong>

                  </div>

                </div>

              </div>

              {/* =============================================
                  SAVINGS SUMMARY
              ============================================= */}

              <div className="report-chart-card">

                <div className="report-card-header">

                  <h2>
                    Savings Summary
                  </h2>

                  <p>
                    Overview of your savings
                    goals
                  </p>

                </div>

                <div className="savings-report-content">

                  {/* -------------------------------------------------
                      TOTAL TARGET
                  ------------------------------------------------- */}

                  <div className="savings-report-item">

                    <span>
                      Total Target
                    </span>

                    <strong>
                      {formatCurrency(
                        report
                          .savings_summary
                          ?.total_target
                      )}
                    </strong>

                  </div>

                  {/* -------------------------------------------------
                      TOTAL SAVED
                  ------------------------------------------------- */}

                  <div className="savings-report-item">

                    <span>
                      Total Saved
                    </span>

                    <strong
                      className="report-income"
                    >
                      {formatCurrency(
                        report
                          .savings_summary
                          ?.total_saved
                      )}
                    </strong>

                  </div>

                  {/* -------------------------------------------------
                      REMAINING
                  ------------------------------------------------- */}

                  <div className="savings-report-item">

                    <span>
                      Remaining
                    </span>

                    <strong>
                      {formatCurrency(
                        report
                          .savings_summary
                          ?.remaining_amount
                      )}
                    </strong>

                  </div>

                  {/* -------------------------------------------------
                      SAVINGS PROGRESS
                  ------------------------------------------------- */}

                  <div className="savings-progress-wrapper">

                    <div className="savings-progress-header">

                      <span>
                        Progress
                      </span>

                      <strong>
                        {
                          report
                            .savings_summary
                            ?.progress_percentage
                        }
                        %
                      </strong>

                    </div>

                    <div className="savings-progress-bar">

                      <div
                        className="savings-progress-fill"
                        style={{
                          width: `${Math.min(
                            Number(
                              report
                                .savings_summary
                                ?.progress_percentage ||
                                0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* =============================================
                  FINANCIAL INSIGHTS
              ============================================= */}

              <div className="report-chart-card insights-card">

                <div className="report-card-header">

                  <h2>
                    Financial Insights
                  </h2>

                  <p>
                    Quick highlights from
                    your report
                  </p>

                </div>

                <div className="insights-list">

                  {/* -------------------------------------------------
                      INCOME
                  ------------------------------------------------- */}

                  <div className="insight-item">

                    <div className="insight-icon income-insight">
                      ↗
                    </div>

                    <div>

                      <span>
                        Income
                      </span>

                      <strong>
                        {formatCurrency(
                          report
                            .income_summary
                            ?.total_income
                        )}
                      </strong>

                    </div>

                  </div>

                  {/* -------------------------------------------------
                      EXPENSE
                  ------------------------------------------------- */}

                  <div className="insight-item">

                    <div className="insight-icon expense-insight">
                      ↘
                    </div>

                    <div>

                      <span>
                        Expenses
                      </span>

                      <strong>
                        {formatCurrency(
                          report
                            .expense_summary
                            ?.total_expense
                        )}
                      </strong>

                    </div>

                  </div>

                  {/* -------------------------------------------------
                      TOP CATEGORY
                  ------------------------------------------------- */}

                  <div className="insight-item">

                    <div className="insight-icon category-insight">
                      ◎
                    </div>

                    <div>

                      <span>
                        Top Spending
                        Category
                      </span>

                      <strong>
                        {highestCategory}
                      </strong>

                    </div>

                  </div>

                  {/* -------------------------------------------------
                      BALANCE
                  ------------------------------------------------- */}

                  <div className="insight-item">

                    <div className="insight-icon balance-insight">
                      ₹
                    </div>

                    <div>

                      <span>
                        Balance
                      </span>

                      <strong>
                        {formatCurrency(
                          report
                            .financial_summary
                            ?.current_balance
                        )}
                      </strong>

                    </div>

                  </div>

                  {/* -------------------------------------------------
                      BUDGET STATUS
                  ------------------------------------------------- */}

                  <div className="insight-item">

                    <div className="insight-icon budget-insight">
                      %
                    </div>

                    <div>

                      <span>
                        Budget Status
                      </span>

                      <strong>
                        {String(
                          report
                            .budget_summary
                            ?.status ||
                            "NO_BUDGET"
                        ).replace(
                          "_",
                          " "
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

              </div>

              {/* =============================================
                  LATEST NOTIFICATIONS
              ============================================= */}

              <div className="report-chart-card">

                <div className="report-card-header">

                  <h2>
                    Latest Notifications
                  </h2>

                  <p>
                    Recent financial alerts
                  </p>

                </div>

                {report
                  .latest_notifications
                  ?.length > 0 ? (

                  <div className="report-notifications">

                    {report
                      .latest_notifications
                      .map(
                        (
                          notification
                        ) => (

                          <div
                            className="report-notification"
                            key={
                              notification.id
                            }
                          >

                            <strong>
                              {
                                notification.title
                              }
                            </strong>

                            <span>
                              {
                                notification.message
                              }
                            </span>

                          </div>

                        )
                      )}

                  </div>

                ) : (

                  <div className="report-empty-state">

                    No notifications.

                  </div>

                )}

              </div>

            </section>

          </>

        ) : null}

      </main>
    </>
  );
}

export default Reports;