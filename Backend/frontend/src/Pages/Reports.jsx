import { useEffect, useState } from "react";

import {
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaPiggyBank,
  FaFileAlt,
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

  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [generatingReport, setGeneratingReport] =
    useState(false);

  const [reportMessage, setReportMessage] =
    useState("");


  // =========================================================
  // FETCH ANALYTICS
  // =========================================================

  const fetchReport = async () => {

    try {

      setLoading(true);

      setError("");

      const token =
        localStorage.getItem("access");


      const response =
        await api.get(
          "reports/",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      setReport(
        response.data
      );


    } catch (err) {

      console.error(
        "Reports error:",
        err
      );


      setError(
        err.response?.data?.detail ||
        "Unable to load financial report."
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

      setGeneratingReport(
        true
      );

      setReportMessage("");

      setError("");


      const token =
        localStorage.getItem("access");


      const response =
        await api.post(
          "reports/generate/",
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      setReportMessage(
        response.data.message
      );


      // Refresh analytics
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

      setGeneratingReport(
        false
      );

    }

  };


  // =========================================================
  // LOAD REPORT
  // =========================================================

  useEffect(() => {

    fetchReport();

  }, []);


  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (
    value
  ) => {

    const amount =
      Number(value) || 0;


    return amount.toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    );

  };


  const formatNumber = (
    value
  ) => {

    return (
      Number(value) || 0
    ).toLocaleString(
      "en-IN"
    );

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-slate-50
          flex
        "
      >

        <div
          className="
            w-[280px]
            bg-slate-950
            text-white
            flex-shrink-0
          "
        >

          <Sidebar />

        </div>


        <div
          className="
            flex-1
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
            "
          >

            <div
              className="
                w-12
                h-12
                border-4
                border-indigo-200
                border-t-indigo-600
                rounded-full
                animate-spin
              "
            ></div>


            <p
              className="
                text-slate-500
                mt-4
              "
            >
              Preparing your financial report...
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
          bg-slate-50
          flex
        "
      >

        <div
          className="
            w-[280px]
            bg-slate-950
            text-white
            flex-shrink-0
          "
        >

          <Sidebar />

        </div>


        <div
          className="
            flex-1
          "
        >

          <Topbar />


          <div
            className="
              p-8
            "
          >

            <div
              className="
                bg-white
                rounded-2xl
                border
                border-rose-200
                p-8
                text-center
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                  text-slate-800
                "
              >
                Unable to Load Report
              </h2>


              <p
                className="
                  text-slate-500
                  mt-2
                "
              >
                {error ||
                  "No report data available."}
              </p>


              <button
                onClick={
                  fetchReport
                }
                className="
                  cursor-pointer
                  mt-6
                  px-5
                  py-3
                  rounded-xl
                  bg-indigo-600
                  hover:bg-indigo-700
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
  // CHART DATA
  // =========================================================

  const expenseData =
    report.expense_by_category?.map(
      (item) => ({

        name:
          item.category,

        value:
          Number(item.total),

      })
    ) || [];


  const incomeExpenseData =
    report.income_vs_expense?.map(
      (item) => ({

        name:
          item.name,

        amount:
          Number(item.amount),

      })
    ) || [];


  const COLORS = [

    "#4F46E5",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#EC4899",
    "#F97316",
    "#10B981",
    "#06B6D4",
    "#EAB308",
    "#64748B",

  ];


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-slate-50
        flex
      "
    >

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div
        className="
          w-[280px]
          bg-slate-950
          text-white
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
        "
      >

        <Topbar />


        <main
          className="
            p-6
            md:p-8
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
              "
            >

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-indigo-100
                  flex
                  items-center
                  justify-center
                "
              >

                <FaChartBar
                  className="
                    text-indigo-600
                    text-2xl
                  "
                />

              </div>


              <div>

                <h1
                  className="
                    text-3xl
                    md:text-4xl
                    font-bold
                    text-slate-800
                  "
                >
                  Financial Reports
                </h1>


                <p
                  className="
                    text-slate-500
                    mt-1
                  "
                >
                  Understand your income,
                  expenses and savings.
                </p>

              </div>

            </div>


            {/* =================================================
                GENERATE REPORT BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={
                generateReport
              }
              disabled={
                generatingReport
              }
              className="
                cursor-pointer
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-xl
                bg-gradient-to-r
                from-indigo-600
                to-violet-600
                hover:from-indigo-700
                hover:to-violet-700
                text-white
                font-semibold
                shadow-lg
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
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
                bg-emerald-50
                border
                border-emerald-200
                text-emerald-700
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
                bg-rose-50
                border
                border-rose-200
                text-rose-700
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
                border-slate-100
                shadow-sm
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                      text-slate-500
                    "
                  >
                    Total Income
                  </p>


                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-slate-800
                      mt-2
                    "
                  >
                    {formatCurrency(
                      report.total_income
                    )}
                  </h2>

                </div>


                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-indigo-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaArrowUp
                    className="
                      text-indigo-600
                    "
                  />

                </div>

              </div>


              <p
                className="
                  text-xs
                  text-slate-400
                  mt-4
                "
              >

                {formatNumber(
                  report.income_transactions
                )}{" "}

                income transactions

              </p>

            </div>


            {/* TOTAL EXPENSE */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-slate-100
                shadow-sm
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                      text-slate-500
                    "
                  >
                    Total Expenses
                  </p>


                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-slate-800
                      mt-2
                    "
                  >
                    {formatCurrency(
                      report.total_expense
                    )}
                  </h2>

                </div>


                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-purple-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaArrowDown
                    className="
                      text-purple-600
                    "
                  />

                </div>

              </div>


              <p
                className="
                  text-xs
                  text-slate-400
                  mt-4
                "
              >

                {formatNumber(
                  report.expense_transactions
                )}{" "}

                expense transactions

              </p>

            </div>


            {/* SAVINGS */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-slate-100
                shadow-sm
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                      text-slate-500
                    "
                  >
                    Total Savings
                  </p>


                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-slate-800
                      mt-2
                    "
                  >
                    {formatCurrency(
                      report.total_savings
                    )}
                  </h2>

                </div>


                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-emerald-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaPiggyBank
                    className="
                      text-emerald-600
                    "
                  />

                </div>

              </div>


              <p
                className="
                  text-xs
                  text-slate-400
                  mt-4
                "
              >
                Income minus expenses
              </p>

            </div>


            {/* BALANCE */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-slate-100
                shadow-sm
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                      text-slate-500
                    "
                  >
                    Current Balance
                  </p>


                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-slate-800
                      mt-2
                    "
                  >
                    {formatCurrency(
                      report.total_savings
                    )}
                  </h2>

                </div>


                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-cyan-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaWallet
                    className="
                      text-cyan-600
                    "
                  />

                </div>

              </div>


              <p
                className="
                  text-xs
                  text-slate-400
                  mt-4
                "
              >
                Available after expenses
              </p>

            </div>

          </div>


          {/* =================================================
              CHARTS
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
                border-slate-100
                shadow-sm
                p-6
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                  text-slate-800
                "
              >
                Expense by Category
              </h2>


              <p
                className="
                  text-slate-500
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
                      text-slate-300
                    "
                  />


                  <p
                    className="
                      text-slate-500
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
                      data={
                        expenseData
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={110}
                      innerRadius={55}
                      paddingAngle={3}
                    >

                      {expenseData.map(
                        (
                          entry,
                          index
                        ) => (

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
                      formatter={(
                        value
                      ) =>
                        formatCurrency(
                          value
                        )
                      }
                    />


                    <Legend
                      verticalAlign="bottom"
                    />

                  </PieChart>

                </ResponsiveContainer>

              )}

            </div>


            {/* INCOME VS EXPENSE */}

            <div
              className="
                bg-white
                rounded-3xl
                border
                border-slate-100
                shadow-sm
                p-6
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                  text-slate-800
                "
              >
                Income vs Expense
              </h2>


              <p
                className="
                  text-slate-500
                  text-sm
                  mt-1
                  mb-5
                "
              >
                Compare your financial inflow and outflow.
              </p>


              <ResponsiveContainer
                width="100%"
                height={340}
              >

                <BarChart
                  data={
                    incomeExpenseData
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                  />


                  <XAxis
                    dataKey="name"
                  />


                  <YAxis />


                  <Tooltip
                    formatter={(
                      value
                    ) =>
                      formatCurrency(
                        value
                      )
                    }
                  />


                  <Bar
                    dataKey="amount"
                    fill="#4F46E5"
                    radius={[
                      10,
                      10,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* =================================================
              TRANSACTION SUMMARY
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-2
              gap-6
            "
          >

            {/* RECENT INCOME */}

            <div
              className="
                bg-white
                rounded-3xl
                border
                border-slate-100
                shadow-sm
                overflow-hidden
              "
            >

              <div
                className="
                  p-6
                  border-b
                  border-slate-100
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
                      bg-indigo-100
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <FaArrowUp
                      className="
                        text-indigo-600
                      "
                    />

                  </div>


                  <div>

                    <h2
                      className="
                        text-xl
                        font-bold
                        text-slate-800
                      "
                    >
                      Recent Income
                    </h2>


                    <p
                      className="
                        text-sm
                        text-slate-500
                      "
                    >
                      Your latest income entries.
                    </p>

                  </div>

                </div>

              </div>


              {report.recent_income?.length === 0 ? (

                <div
                  className="
                    p-8
                    text-center
                    text-slate-500
                  "
                >
                  No income transactions found.
                </div>

              ) : (

                <div
                  className="
                    divide-y
                    divide-slate-100
                  "
                >

                  {report.recent_income.map(
                    (income) => (

                      <div
                        key={
                          income.id
                        }
                        className="
                          p-5
                          flex
                          items-center
                          justify-between
                          hover:bg-slate-50
                          transition
                        "
                      >

                        <div>

                          <h3
                            className="
                              font-semibold
                              text-slate-800
                            "
                          >
                            {income.title}
                          </h3>


                          <p
                            className="
                              text-xs
                              text-slate-400
                              mt-1
                            "
                          >

                            {income.source}
                            {" • "}
                            {income.income_date}

                          </p>

                        </div>


                        <span
                          className="
                            font-bold
                            text-indigo-600
                          "
                        >

                          +
                          {" "}
                          {formatCurrency(
                            income.amount
                          )}

                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* RECENT EXPENSES */}

            <div
              className="
                bg-white
                rounded-3xl
                border
                border-slate-100
                shadow-sm
                overflow-hidden
              "
            >

              <div
                className="
                  p-6
                  border-b
                  border-slate-100
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
                      bg-purple-100
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <FaArrowDown
                      className="
                        text-purple-600
                      "
                    />

                  </div>


                  <div>

                    <h2
                      className="
                        text-xl
                        font-bold
                        text-slate-800
                      "
                    >
                      Recent Expenses
                    </h2>


                    <p
                      className="
                        text-sm
                        text-slate-500
                      "
                    >
                      Your latest spending activity.
                    </p>

                  </div>

                </div>

              </div>


              {report.recent_expenses?.length === 0 ? (

                <div
                  className="
                    p-8
                    text-center
                    text-slate-500
                  "
                >
                  No expense transactions found.
                </div>

              ) : (

                <div
                  className="
                    divide-y
                    divide-slate-100
                  "
                >

                  {report.recent_expenses.map(
                    (expense) => (

                      <div
                        key={
                          expense.id
                        }
                        className="
                          p-5
                          flex
                          items-center
                          justify-between
                          hover:bg-slate-50
                          transition
                        "
                      >

                        <div>

                          <h3
                            className="
                              font-semibold
                              text-slate-800
                            "
                          >
                            {expense.title}
                          </h3>


                          <p
                            className="
                              text-xs
                              text-slate-400
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
                            text-purple-600
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

          </div>

        </main>

      </div>

    </div>

  );

}


export default Reports;