import { useEffect, useState } from "react";

import {
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaPiggyBank,
  FaFileAlt,
  FaMoneyBillWave,
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
          bg-[#F5F2EC]
          flex
          overflow-x-hidden
        "
      >

        {/* SIDEBAR */}

        <div
          className="
            w-0
            lg:w-[280px]
            flex-shrink-0
          "
        >

          <Sidebar />

        </div>


        {/* MAIN */}

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
          bg-[#F5F2EC]
          flex
          overflow-x-hidden
        "
      >

        {/* SIDEBAR */}

        <div
          className="
            w-0
            lg:w-[280px]
            flex-shrink-0
          "
        >

          <Sidebar />

        </div>


        {/* MAIN */}

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
                Unable to Load Report
              </h2>


              <p
                className="
                  text-[#6F665B]
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


  // =========================================================
  // CHART COLORS
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
                  Financial Reports
                </h1>


                <p
                  className="
                    text-[#6F665B]
                    mt-1
                  "
                >
                  Understand your income,
                  expenses and savings.
                </p>

              </div>

            </div>


            {/* =================================================
                GENERATE REPORT
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

                <div
                  className="
                    min-w-0
                  "
                >

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
                      report.total_income
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


              <p
                className="
                  text-xs
                  text-[#9A9085]
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

                <div
                  className="
                    min-w-0
                  "
                >

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
                      report.total_expense
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


              <p
                className="
                  text-xs
                  text-[#9A9085]
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

                <div
                  className="
                    min-w-0
                  "
                >

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
                      report.total_savings
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


              <p
                className="
                  text-xs
                  text-[#9A9085]
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

                <div
                  className="
                    min-w-0
                  "
                >

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
                      report.total_savings
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


              <p
                className="
                  text-xs
                  text-[#9A9085]
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

            {/* =================================================
                EXPENSE CATEGORY
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
                Compare your financial inflow and outflow.
              </p>


              <div
                className="
                  w-full
                  overflow-hidden
                "
              >

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
                      left: 0,
                      bottom: 10,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5DDD2"
                    />


                    <XAxis
                      dataKey="name"
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
                      fill="#56061D"
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

            {/* =================================================
                RECENT INCOME
            ================================================== */}

            <div
              className="
                bg-white
                rounded-3xl
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
                overflow-hidden
                min-w-0
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


                  <div
                    className="
                      min-w-0
                    "
                  >

                    <h2
                      className="
                        text-xl
                        font-bold
                        text-[#101C2E]
                      "
                    >
                      Recent Income
                    </h2>


                    <p
                      className="
                        text-sm
                        text-[#6F665B]
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
                    text-[#6F665B]
                  "
                >
                  No income transactions found.
                </div>

              ) : (

                <div
                  className="
                    divide-y
                    divide-[#E5DDD2]
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
                          flex-col
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                          gap-3
                          hover:bg-[#FAF8F4]
                          transition
                        "
                      >

                        <div
                          className="
                            min-w-0
                          "
                        >

                          <h3
                            className="
                              font-semibold
                              text-[#101C2E]
                              break-words
                            "
                          >
                            {income.title}
                          </h3>


                          <p
                            className="
                              text-xs
                              text-[#9A9085]
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
                            text-[#92643E]
                            whitespace-nowrap
                            self-start
                            sm:self-auto
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


            {/* =================================================
                RECENT EXPENSES
            ================================================== */}

            <div
              className="
                bg-white
                rounded-3xl
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
                overflow-hidden
                min-w-0
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
                      shrink-0
                    "
                  >

                    <FaArrowDown
                      className="
                        text-[#7A263D]
                      "
                    />

                  </div>


                  <div
                    className="
                      min-w-0
                    "
                  >

                    <h2
                      className="
                        text-xl
                        font-bold
                        text-[#101C2E]
                      "
                    >
                      Recent Expenses
                    </h2>


                    <p
                      className="
                        text-sm
                        text-[#6F665B]
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
                    text-[#6F665B]
                  "
                >
                  No expense transactions found.
                </div>

              ) : (

                <div
                  className="
                    divide-y
                    divide-[#E5DDD2]
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
                          flex-col
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                          gap-3
                          hover:bg-[#FAF8F4]
                          transition
                        "
                      >

                        <div
                          className="
                            min-w-0
                          "
                        >

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

          </div>

        </main>

      </div>

    </div>

  );

}


export default Reports;