import { useEffect, useState } from "react";

import {
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaPiggyBank,
  FaFileAlt,
  FaMoneyBillWave,
  FaBullseye,
  FaChartLine,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import api from "../services/api";


function Reports() {

  // =========================================================
  // STATE
  // =========================================================

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingReport, setGeneratingReport] =
    useState(false);
  const [reportMessage, setReportMessage] = useState("");


  // =========================================================
  // FETCH REAL ANALYTICS DATA
  // =========================================================

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access");

      if (!token) {
        setError("Please login again to view your analytics.");
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

      setReport(response.data);

    } catch (err) {
      console.error("Analytics dashboard error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load financial analytics."
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // GENERATE MONTHLY REPORT
  // =========================================================

  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      setReportMessage("");
      setError("");

      const token = localStorage.getItem("access");

      if (!token) {
        setError("Please login again to generate a report.");
        return;
      }

      const response = await api.post(
        "reports/generate/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReportMessage(
        response.data?.message ||
        "Monthly report generated successfully."
      );

      // Refresh real analytics after report generation.
      await fetchReport();

    } catch (err) {
      console.error(
        "Report generation error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to generate report."
      );

    } finally {
      setGeneratingReport(false);
    }
  };


  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  useEffect(() => {
    fetchReport();
  }, []);


  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (value) => {
    const amount = Number(value) || 0;

    return amount.toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    );
  };


  const formatNumber = (value) => {
    return (
      Number(value) || 0
    ).toLocaleString("en-IN");
  };


  const formatPercentage = (value) => {
    const percentage = Number(value) || 0;

    return `${percentage.toFixed(2)}%`;
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          bg-[#F5F2EC]
          flex
          overflow-x-hidden
        "
      >
        <div
          className="
            w-0
            lg:w-[280px]
            flex-shrink-0
          "
        >
          <Sidebar />
        </div>

        <div
          className="
            flex-1
            min-w-0
            w-full
          "
        >
          <Topbar />

          <div
            className="
              min-h-[70vh]
              flex
              flex-col
              items-center
              justify-center
              p-6
            "
          >
            <div
              className="
                w-12
                h-12
                border-4
                border-[#92643E]/25
                border-t-[#56061D]
                rounded-full
                animate-spin
              "
            />

            <p
              className="
                text-[#6F665B]
                mt-4
                text-center
              "
            >
              Preparing your financial analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error || !report) {
    return (
      <div
        className="
          min-h-screen
          bg-[#F5F2EC]
          flex
          overflow-x-hidden
        "
      >
        <div
          className="
            w-0
            lg:w-[280px]
            flex-shrink-0
          "
        >
          <Sidebar />
        </div>

        <div
          className="
            flex-1
            min-w-0
            w-full
          "
        >
          <Topbar />

          <div
            className="
              p-4
              sm:p-6
              md:p-8
            "
          >
            <div
              className="
                bg-white
                rounded-3xl
                border
                border-[#E5DDD2]
                p-6
                sm:p-8
                text-center
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >
              <div
                className="
                  w-16
                  h-16
                  mx-auto
                  rounded-2xl
                  bg-[#56061D]/10
                  flex
                  items-center
                  justify-center
                  mb-5
                "
              >
                <FaChartBar
                  className="
                    text-[#56061D]
                    text-2xl
                  "
                />
              </div>

              <h2
                className="
                  text-2xl
                  font-bold
                  text-[#101C2E]
                "
              >
                Unable to Load Analytics
              </h2>

              <p
                className="
                  text-[#6F665B]
                  mt-2
                "
              >
                {error ||
                  "No analytics data available."}
              </p>

              <button
                onClick={fetchReport}
                className="
                  cursor-pointer
                  mt-6
                  px-5
                  py-3
                  rounded-xl
                  bg-[#56061D]
                  hover:bg-[#6F0A27]
                  text-white
                  font-semibold
                  transition
                "
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // =========================================================
  // REAL BACKEND DATA
  // =========================================================

  const summary =
    report.summary || {};

  const categoryExpenses =
    report.category_expenses || [];

  const monthlyExpenses =
    report.monthly_expenses || [];

  const incomeVsExpense =
    report.income_vs_expense || [];

  const budgetUtilization =
    report.budget_utilization || [];

  const savingsGoals =
    report.savings_goals || [];

  const recentTransactions =
    report.recent_transactions || [];


  // =========================================================
  // CATEGORY CHART DATA
  // =========================================================

  const expenseData =
    categoryExpenses.map((item) => ({
      name: item.category,
      value: Number(
        item.total_expense
      ) || 0,
    }));


  // =========================================================
  // MONTHLY EXPENSE CHART DATA
  // =========================================================

  const monthlyExpenseData =
    monthlyExpenses.map((item) => ({
      month: item.month,
      amount: Number(
        item.amount
      ) || 0,
    }));


  // =========================================================
  // INCOME VS EXPENSE CHART DATA
  // =========================================================

  const incomeExpenseData =
    incomeVsExpense.map((item) => ({
      month: item.month,
      income: Number(
        item.income
      ) || 0,
      expense: Number(
        item.expense
      ) || 0,
    }));


  // =========================================================
  // COLORS
  // =========================================================

  const COLORS = [
    "#56061D",
    "#92643E",
    "#7A263D",
    "#B4774D",
    "#8FB39B",
    "#6F665B",
    "#A67C5B",
    "#934B5F",
    "#C49A6C",
    "#101C2E",
  ];


  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#F5F2EC]
        flex
        overflow-x-hidden
      "
    >

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div
        className="
          w-0
          lg:w-[280px]
          flex-shrink-0
        "
      >
        <Sidebar />
      </div>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <div
        className="
          flex-1
          min-w-0
          w-full
        "
      >

        <Topbar />


        <main
          className="
            p-4
            sm:p-6
            md:p-8
            w-full
            max-w-full
          "
        >

          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
              mb-8
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
                min-w-0
              "
            >

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-[#56061D]
                  flex
                  items-center
                  justify-center
                  shrink-0
                  shadow-sm
                "
              >
                <FaChartBar
                  className="
                    text-[#F3EBDD]
                    text-2xl
                  "
                />
              </div>


              <div
                className="
                  min-w-0
                "
              >

                <h1
                  className="
                    text-3xl
                    md:text-4xl
                    font-bold
                    text-[#101C2E]
                  "
                >
                  Financial Analytics
                </h1>

                <p
                  className="
                    text-[#6F665B]
                    mt-1
                  "
                >
                  Understand your income,
                  expenses, budgets and savings.
                </p>

              </div>

            </div>


            {/* =================================================
                GENERATE REPORT
            ================================================== */}

            <button
              type="button"
              onClick={generateReport}
              disabled={generatingReport}
              className="
                cursor-pointer
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-xl
                bg-[#56061D]
                hover:bg-[#6F0A27]
                text-white
                font-semibold
                shadow-md
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
                w-full
                md:w-auto
              "
            >
              <FaFileAlt />

              {generatingReport
                ? "Generating..."
                : "Generate Report"}
            </button>

          </div>


          {/* =================================================
              REPORT MESSAGE
          ================================================== */}

          {reportMessage && (
            <div
              className="
                mb-6
                px-5
                py-4
                rounded-xl
                bg-[#8FB39B]/15
                border
                border-[#8FB39B]/30
                text-[#5F8069]
                font-medium
              "
            >
              {reportMessage}
            </div>
          )}


          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div
              className="
                mb-6
                px-5
                py-4
                rounded-xl
                bg-[#56061D]/10
                border
                border-[#56061D]/20
                text-[#7A263D]
                font-medium
              "
            >
              {error}
            </div>
          )}


          {/* =================================================
              SUMMARY CARDS
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-4
              gap-6
              mb-8
            "
          >

            {/* TOTAL INCOME */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div className="min-w-0">

                  <p
                    className="
                      text-sm
                      font-medium
                      text-[#6F665B]
                    "
                  >
                    Total Income
                  </p>

                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                      break-words
                    "
                  >
                    {formatCurrency(
                      summary.total_income
                    )}
                  </h2>

                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-[#92643E]/10
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <FaArrowUp
                    className="
                      text-[#92643E]
                    "
                  />
                </div>

              </div>
            </div>


            {/* TOTAL EXPENSE */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div className="min-w-0">

                  <p
                    className="
                      text-sm
                      font-medium
                      text-[#6F665B]
                    "
                  >
                    Total Expenses
                  </p>

                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                      break-words
                    "
                  >
                    {formatCurrency(
                      summary.total_expense
                    )}
                  </h2>

                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-[#56061D]/10
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <FaArrowDown
                    className="
                      text-[#7A263D]
                    "
                  />
                </div>

              </div>
            </div>


            {/* SAVINGS */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div className="min-w-0">

                  <p
                    className="
                      text-sm
                      font-medium
                      text-[#6F665B]
                    "
                  >
                    Total Savings
                  </p>

                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                      break-words
                    "
                  >
                    {formatCurrency(
                      summary.total_savings
                    )}
                  </h2>

                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-[#8FB39B]/20
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <FaPiggyBank
                    className="
                      text-[#5F8069]
                    "
                  />
                </div>

              </div>
            </div>


            {/* BALANCE */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div className="min-w-0">

                  <p
                    className="
                      text-sm
                      font-medium
                      text-[#6F665B]
                    "
                  >
                    Current Balance
                  </p>

                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                      break-words
                    "
                  >
                    {formatCurrency(
                      summary.current_balance
                    )}
                  </h2>

                </div>

                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-[#92643E]/10
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <FaWallet
                    className="
                      text-[#92643E]
                    "
                  />
                </div>

              </div>
            </div>

          </div>


          {/* =================================================
              EXTRA FINANCIAL SUMMARY
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-6
              mb-8
            "
          >

            <div
              className="
                bg-white
                rounded-2xl
                p-5
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >
              <p
                className="
                  text-sm
                  font-medium
                  text-[#6F665B]
                "
              >
                Total Budget
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-[#101C2E]
                  mt-2
                "
              >
                {formatCurrency(
                  summary.total_budget
                )}
              </p>
            </div>

            <div
              className="
                bg-white
                rounded-2xl
                p-5
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >
              <p
                className="
                  text-sm
                  font-medium
                  text-[#6F665B]
                "
              >
                Remaining Budget
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-[#101C2E]
                  mt-2
                "
              >
                {formatCurrency(
                  summary.remaining_budget
                )}
              </p>
            </div>

          </div>


          {/* =================================================
              CHARTS ROW 1
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-2
              gap-6
              mb-8
            "
          >

            {/* EXPENSE CATEGORY */}

            <div
              className="
                bg-white
                rounded-3xl
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
                p-5
                sm:p-6
                min-w-0
              "
            >

              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-bold
                  text-[#101C2E]
                "
              >
                Expense by Category
              </h2>

              <p
                className="
                  text-[#6F665B]
                  text-sm
                  mt-1
                  mb-5
                "
              >
                Where your money is being spent.
              </p>

              {expenseData.length === 0 ? (

                <div
                  className="
                    h-[320px]
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
                  <FaMoneyBillWave
                    className="
                      text-4xl
                      text-[#D8C8B4]
                    "
                  />

                  <p
                    className="
                      text-[#6F665B]
                      mt-4
                    "
                  >
                    No expense data available.
                  </p>
                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height={340}
                >
                  <PieChart>

                    <Pie
                      data={expenseData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={110}
                      innerRadius={55}
                      paddingAngle={3}
                    >
                      {expenseData.map(
                        (entry, index) => (
                          <Cell
                            key={
                              `${entry.name}-${index}`
                            }
                            fill={
                              COLORS[
                                index %
                                COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                    />

                    <Legend
                      verticalAlign="bottom"
                    />

                  </PieChart>
                </ResponsiveContainer>

              )}

            </div>


            {/* MONTHLY EXPENSE TREND */}

            <div
              className="
                bg-white
                rounded-3xl
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
                p-5
                sm:p-6
                min-w-0
              "
            >

              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-bold
                  text-[#101C2E]
                "
              >
                Monthly Expense Trend
              </h2>

              <p
                className="
                  text-[#6F665B]
                  text-sm
                  mt-1
                  mb-5
                "
              >
                Track how your spending changes over time.
              </p>

              {monthlyExpenseData.length === 0 ? (

                <div
                  className="
                    h-[320px]
                    flex
                    items-center
                    justify-center
                    text-[#6F665B]
                  "
                >
                  No monthly expense data available.
                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height={340}
                >
                  <LineChart
                    data={monthlyExpenseData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5DDD2"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#6F665B",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      tick={{
                        fill: "#6F665B",
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#56061D"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />

                  </LineChart>
                </ResponsiveContainer>

              )}

            </div>

          </div>


          {/* =================================================
              INCOME VS EXPENSE
          ================================================== */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-[#E5DDD2]
              shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              p-5
              sm:p-6
              min-w-0
              mb-8
            "
          >

            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-[#101C2E]
              "
            >
              Income vs Expense
            </h2>

            <p
              className="
                text-[#6F665B]
                text-sm
                mt-1
                mb-5
              "
            >
              Compare your financial inflow and outflow by month.
            </p>

            {incomeExpenseData.length === 0 ? (

              <div
                className="
                  h-[340px]
                  flex
                  items-center
                  justify-center
                  text-[#6F665B]
                "
              >
                No income or expense trend data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={360}
              >
                <BarChart
                  data={incomeExpenseData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5DDD2"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fill: "#6F665B",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: "#6F665B",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#92643E"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#56061D"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                  />

                </BarChart>
              </ResponsiveContainer>

            )}

          </div>


          {/* =================================================
              BUDGET UTILIZATION
          ================================================== */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-[#E5DDD2]
              shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              p-5
              sm:p-6
              mb-8
            "
          >

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
                mb-6
              "
            >

              <div>

                <h2
                  className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    text-[#101C2E]
                  "
                >
                  Budget Utilization
                </h2>

                <p
                  className="
                    text-[#6F665B]
                    text-sm
                    mt-1
                  "
                >
                  See the actual percentage of each budget that has been used.
                </p>

              </div>

              <FaChartLine
                className="
                  text-[#56061D]
                  text-2xl
                "
              />

            </div>


            {budgetUtilization.length === 0 ? (

              <div
                className="
                  py-12
                  text-center
                  text-[#6F665B]
                "
              >
                No budget data available.
              </div>

            ) : (

              <div className="space-y-5">

                {budgetUtilization.map(
                  (budget) => {

                    const percentage =
                      Math.min(
                        Number(
                          budget.utilization_percentage
                        ) || 0,
                        100
                      );

                    return (
                      <div
                        key={budget.id}
                        className="
                          border-b
                          border-[#E5DDD2]
                          pb-5
                          last:border-b-0
                          last:pb-0
                        "
                      >

                        <div
                          className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-2
                            mb-2
                          "
                        >

                          <div>

                            <p
                              className="
                                font-semibold
                                text-[#101C2E]
                              "
                            >
                              {budget.category}
                            </p>

                            <p
                              className="
                                text-xs
                                text-[#9A9085]
                                mt-1
                              "
                            >
                              {budget.month} {budget.year}
                            </p>

                          </div>

                          <div
                            className="
                              text-sm
                              font-semibold
                              text-[#56061D]
                            "
                          >
                            {formatPercentage(
                              budget.utilization_percentage
                            )}
                          </div>

                        </div>


                        <div
                          className="
                            h-3
                            w-full
                            rounded-full
                            bg-[#EDE6DD]
                            overflow-hidden
                          "
                        >
                          <div
                            className="
                              h-full
                              rounded-full
                              bg-[#56061D]
                              transition-all
                            "
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />
                        </div>


                        <div
                          className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:justify-between
                            gap-1
                            mt-2
                            text-xs
                            text-[#6F665B]
                          "
                        >
                          <span>
                            Spent:{" "}
                            {formatCurrency(
                              budget.spent_amount
                            )}
                          </span>

                          <span>
                            Budget:{" "}
                            {formatCurrency(
                              budget.budget_amount
                            )}
                          </span>

                          <span>
                            Remaining:{" "}
                            {formatCurrency(
                              budget.remaining_amount
                            )}
                          </span>
                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>


          {/* =================================================
              SAVINGS GOAL PROGRESS
          ================================================== */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-[#E5DDD2]
              shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              p-5
              sm:p-6
              mb-8
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                mb-6
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-[#8FB39B]/20
                  flex
                  items-center
                  justify-center
                "
              >
                <FaBullseye
                  className="
                    text-[#5F8069]
                  "
                />
              </div>

              <div>

                <h2
                  className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    text-[#101C2E]
                  "
                >
                  Savings Goal Progress
                </h2>

                <p
                  className="
                    text-[#6F665B]
                    text-sm
                    mt-1
                  "
                >
                  Track your real progress toward every savings target.
                </p>

              </div>

            </div>


            {savingsGoals.length === 0 ? (

              <div
                className="
                  py-12
                  text-center
                  text-[#6F665B]
                "
              >
                No savings goals available.
              </div>

            ) : (

              <div
                className="
                  grid
                  grid-cols-1
                  lg:grid-cols-2
                  gap-5
                "
              >

                {savingsGoals.map(
                  (goal) => {

                    const percentage =
                      Math.min(
                        Number(
                          goal.progress_percentage
                        ) || 0,
                        100
                      );

                    const completed =
                      goal.status === "COMPLETED";

                    return (
                      <div
                        key={goal.id}
                        className="
                          rounded-2xl
                          border
                          border-[#E5DDD2]
                          p-5
                          bg-[#FAF8F4]
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-4
                          "
                        >

                          <div className="min-w-0">

                            <h3
                              className="
                                font-bold
                                text-[#101C2E]
                                break-words
                              "
                            >
                              {goal.goal_name}
                            </h3>

                            <p
                              className="
                                text-xs
                                text-[#9A9085]
                                mt-1
                              "
                            >
                              {goal.deadline
                                ? `Deadline: ${goal.deadline}`
                                : "No deadline"}
                            </p>

                          </div>

                          <span
                            className={`
                              shrink-0
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              font-semibold
                              ${
                                completed
                                  ? "bg-[#8FB39B]/20 text-[#5F8069]"
                                  : "bg-[#92643E]/10 text-[#92643E]"
                              }
                            `}
                          >
                            {completed
                              ? "Completed"
                              : "In Progress"}
                          </span>

                        </div>


                        <div className="mt-5">

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              text-sm
                              mb-2
                            "
                          >

                            <span
                              className="
                                text-[#6F665B]
                              "
                            >
                              Progress
                            </span>

                            <span
                              className="
                                font-bold
                                text-[#56061D]
                              "
                            >
                              {formatPercentage(
                                goal.progress_percentage
                              )}
                            </span>

                          </div>


                          <div
                            className="
                              h-3
                              w-full
                              rounded-full
                              bg-[#E5DDD2]
                              overflow-hidden
                            "
                          >
                            <div
                              className="
                                h-full
                                rounded-full
                                bg-[#56061D]
                                transition-all
                              "
                              style={{
                                width:
                                  `${percentage}%`,
                              }}
                            />
                          </div>

                        </div>


                        <div
                          className="
                            grid
                            grid-cols-1
                            sm:grid-cols-3
                            gap-3
                            mt-5
                          "
                        >

                          <div>

                            <p
                              className="
                                text-xs
                                text-[#9A9085]
                              "
                            >
                              Saved
                            </p>

                            <p
                              className="
                                text-sm
                                font-semibold
                                text-[#101C2E]
                                mt-1
                              "
                            >
                              {formatCurrency(
                                goal.saved_amount
                              )}
                            </p>

                          </div>


                          <div>

                            <p
                              className="
                                text-xs
                                text-[#9A9085]
                              "
                            >
                              Target
                            </p>

                            <p
                              className="
                                text-sm
                                font-semibold
                                text-[#101C2E]
                                mt-1
                              "
                            >
                              {formatCurrency(
                                goal.target_amount
                              )}
                            </p>

                          </div>


                          <div>

                            <p
                              className="
                                text-xs
                                text-[#9A9085]
                              "
                            >
                              Remaining
                            </p>

                            <p
                              className="
                                text-sm
                                font-semibold
                                text-[#101C2E]
                                mt-1
                              "
                            >
                              {formatCurrency(
                                goal.remaining_amount
                              )}
                            </p>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>


          {/* =================================================
              RECENT TRANSACTIONS
          ================================================== */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-[#E5DDD2]
              shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              overflow-hidden
            "
          >

            <div
              className="
                p-5
                sm:p-6
                border-b
                border-[#E5DDD2]
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-[#56061D]/10
                    flex
                    items-center
                    justify-center
                  "
                >
                  <FaArrowDown
                    className="
                      text-[#7A263D]
                    "
                  />
                </div>

                <div>

                  <h2
                    className="
                      text-xl
                      font-bold
                      text-[#101C2E]
                    "
                  >
                    Recent Transactions
                  </h2>

                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                    "
                  >
                    Your latest expense activity.
                  </p>

                </div>

              </div>

            </div>


            {recentTransactions.length === 0 ? (

              <div
                className="
                  p-8
                  text-center
                  text-[#6F665B]
                "
              >
                No recent transactions found.
              </div>

            ) : (

              <div
                className="
                  divide-y
                  divide-[#E5DDD2]
                "
              >

                {recentTransactions.map(
                  (expense) => (

                    <div
                      key={expense.id}
                      className="
                        p-5
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-3
                        hover:bg-[#FAF8F4]
                        transition
                      "
                    >

                      <div className="min-w-0">

                        <h3
                          className="
                            font-semibold
                            text-[#101C2E]
                            break-words
                          "
                        >
                          {expense.title}
                        </h3>

                        <p
                          className="
                            text-xs
                            text-[#9A9085]
                            mt-1
                          "
                        >
                          {expense.category}
                          {" • "}
                          {expense.expense_date}
                        </p>

                      </div>

                      <span
                        className="
                          font-bold
                          text-[#7A263D]
                          whitespace-nowrap
                          self-start
                          sm:self-auto
                        "
                      >
                        -
                        {" "}
                        {formatCurrency(
                          expense.amount
                        )}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


        </main>

      </div>

    </div>
  );
}


export default Reports;