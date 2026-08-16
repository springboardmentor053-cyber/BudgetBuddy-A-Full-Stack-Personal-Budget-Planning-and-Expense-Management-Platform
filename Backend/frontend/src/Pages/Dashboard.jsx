import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import DashboardCard from "../Components/DashboardCard";
import ExpenseChart from "../Components/ExpenseChart";
import IncomeExpenseChart from "../Components/IncomeExpenseChart";
import RecentTransactions from "../Components/RecentTransactions";
import FinancialOverview from "../Components/FinancialOverview";
import WelcomeBanner from "../Components/WelcomeBanner";

import { useEffect, useMemo, useState } from "react";

import api from "../services/api";

import {
  FaWallet,
  FaMoneyBillWave,
  FaChartLine,
  FaPiggyBank,
  FaBrain,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLightbulb,
  FaShieldAlt,
  FaBullseye,
} from "react-icons/fa";


// =========================================================
// SMART FINANCIAL INSIGHTS
// =========================================================

function SmartFinancialInsights({
  totalIncome,
  totalExpense,
  currentBalance,
  remainingBudget,
  recentTransactions,
  loading,
}) {

  const analysis = useMemo(() => {

    const income =
      Number(totalIncome) || 0;

    const expense =
      Number(totalExpense) || 0;

    const balance =
      Number(currentBalance) || 0;

    const budgetLeft =
      Number(remainingBudget) || 0;


    // =======================================================
    // EXPENSE RATIO
    // =======================================================

    const expenseRatio =
      income > 0
        ? (expense / income) * 100
        : 0;


    // =======================================================
    // FINANCIAL HEALTH SCORE
    // =======================================================

    let score = 50;


    if (income > 0) {

      if (balance > 0) {

        score += 15;

      } else {

        score -= 20;

      }


      if (expenseRatio <= 50) {

        score += 20;

      } else if (
        expenseRatio <= 70
      ) {

        score += 10;

      } else if (
        expenseRatio <= 90
      ) {

        score -= 5;

      } else {

        score -= 20;

      }


      if (budgetLeft > 0) {

        score += 10;

      } else if (
        budgetLeft < 0
      ) {

        score -= 15;

      }

    }


    score = Math.max(
      0,
      Math.min(
        Math.round(score),
        100
      )
    );


    // =======================================================
    // HEALTH LABEL
    // =======================================================

    let healthLabel =
      "Getting Started";


    if (score >= 85) {

      healthLabel =
        "Excellent";

    } else if (score >= 70) {

      healthLabel =
        "Healthy";

    } else if (score >= 50) {

      healthLabel =
        "Moderate";

    } else {

      healthLabel =
        "Needs Attention";

    }


    // =======================================================
    // INSIGHTS
    // =======================================================

    const insights = [];


    // =======================================================
    // BUDGET INSIGHT
    // =======================================================

    if (budgetLeft < 0) {

      insights.push({

        type: "danger",

        icon:
          <FaExclamationTriangle />,

        title:
          "Budget exceeded",

        message:
          `Your spending is ₹${Math.abs(
            budgetLeft
          ).toFixed(
            2
          )} above your remaining budget.`,

      });

    } else if (
      budgetLeft === 0
    ) {

      insights.push({

        type: "warning",

        icon:
          <FaExclamationTriangle />,

        title:
          "Budget fully used",

        message:
          "Your available budget has been completely used. Be careful with additional spending.",

      });

    } else {

      insights.push({

        type: "success",

        icon:
          <FaShieldAlt />,

        title:
          "Budget is under control",

        message:
          `You still have ₹${budgetLeft.toFixed(
            2
          )} remaining in your available budget.`,

      });

    }


    // =======================================================
    // EXPENSE INSIGHT
    // =======================================================

    if (
      income > 0 &&
      expenseRatio >= 80
    ) {

      insights.push({

        type: "danger",

        icon:
          <FaExclamationTriangle />,

        title:
          "High spending rate",

        message:
          `You've already used ${expenseRatio.toFixed(
            0
          )}% of your income on expenses. Consider reducing non-essential spending.`,

      });

    } else if (
      income > 0 &&
      expenseRatio >= 60
    ) {

      insights.push({

        type: "warning",

        icon:
          <FaLightbulb />,

        title:
          "Watch your spending",

        message:
          `Your expenses currently use ${expenseRatio.toFixed(
            0
          )}% of your income. Keeping this below 60% can give you more room to save.`,

      });

    } else if (
      income > 0
    ) {

      insights.push({

        type: "success",

        icon:
          <FaCheckCircle />,

        title:
          "Good expense control",

        message:
          `Your expenses use only ${expenseRatio.toFixed(
            0
          )}% of your income. You're maintaining a healthy balance.`,

      });

    }


    // =======================================================
    // BALANCE INSIGHT
    // =======================================================

    if (balance < 0) {

      insights.push({

        type: "danger",

        icon:
          <FaExclamationTriangle />,

        title:
          "Negative balance",

        message:
          "Your expenses are currently higher than your income. Try to reduce unnecessary spending.",

      });

    } else if (
      balance > 0 &&
      income > 0
    ) {

      const balancePercentage =
        (balance / income) * 100;


      if (
        balancePercentage >= 30
      ) {

        insights.push({

          type: "success",

          icon:
            <FaPiggyBank />,

          title:
            "Strong financial buffer",

          message:
            `You currently retain approximately ${balancePercentage.toFixed(
              0
            )}% of your income after expenses.`,

        });

      } else {

        insights.push({

          type: "info",

          icon:
            <FaWallet />,

          title:
            "Build your financial buffer",

          message:
            "You have a positive balance. Consider moving a portion of it toward your savings goals.",

        });

      }

    }


    // =======================================================
    // RECENT TRANSACTION ANALYSIS
    // =======================================================

    const categoryTotals = {};


    if (
      Array.isArray(
        recentTransactions
      )
    ) {

      recentTransactions.forEach(
        (transaction) => {

          const category =
            transaction.category ||
            transaction.expense_category ||
            "Other";


          const amount =
            Number(
              transaction.amount
            ) || 0;


          if (amount > 0) {

            if (
              !categoryTotals[
                category
              ]
            ) {

              categoryTotals[
                category
              ] = 0;

            }


            categoryTotals[
              category
            ] += amount;

          }

        }
      );

    }


    const categoryEntries =
      Object.entries(
        categoryTotals
      );


    if (
      categoryEntries.length > 0
    ) {

      categoryEntries.sort(
        (a, b) =>
          b[1] - a[1]
      );


      const topCategory =
        categoryEntries[0][0];


      const topCategoryAmount =
        categoryEntries[0][1];


      insights.push({

        type: "info",

        icon:
          <FaChartLine />,

        title:
          `Watch your ${topCategory} spending`,

        message:
          `Your recent transactions show ${topCategory} as your largest spending category, with ₹${topCategoryAmount.toFixed(
            2
          )} recorded.`,

      });

    }


    // =======================================================
    // FALLBACK
    // =======================================================

    if (
      insights.length === 0
    ) {

      insights.push({

        type: "info",

        icon:
          <FaBrain />,

        title:
          "BudgetBuddy is learning",

        message:
          "Keep adding your income, expenses, budgets and savings goals. Your personalized insights will become more useful as your financial history grows.",

      });

    }


    return {

      score,

      healthLabel,

      expenseRatio,

      insights,

    };

  }, [
    totalIncome,
    totalExpense,
    currentBalance,
    remainingBudget,
    recentTransactions,
  ]);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <section className="mt-6">

        <div
          className="
            rounded-3xl
            bg-white
            border
            border-[#E5DDD2]
            p-4
            sm:p-6
            shadow-[0_8px_25px_rgba(16,28,46,0.07)]
          "
        >

          <div
            className="
              animate-pulse
            "
          >

            <div
              className="
                h-6
                w-48
                sm:w-64
                bg-[#EDE5D9]
                rounded
                mb-3
              "
            />


            <div
              className="
                h-4
                w-full
                max-w-96
                bg-[#EDE5D9]
                rounded
                mb-6
              "
            />


            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-4
              "
            >

              <div
                className="
                  h-32
                  bg-[#F3EBDD]
                  rounded-2xl
                "
              />

              <div
                className="
                  h-32
                  bg-[#F3EBDD]
                  rounded-2xl
                "
              />

              <div
                className="
                  h-32
                  bg-[#F3EBDD]
                  rounded-2xl
                "
              />

            </div>

          </div>

        </div>

      </section>

    );

  }


  // =========================================================
  // INSIGHT STYLE
  // =========================================================

  const getInsightStyle =
    (type) => {

      if (
        type === "danger"
      ) {

        return {

          container:
            "bg-[#56061D]/[0.06] border-[#56061D]/20",

          icon:
            "bg-[#56061D] text-[#F3EBDD]",

          title:
            "text-[#56061D]",

        };

      }


      if (
        type === "warning"
      ) {

        return {

          container:
            "bg-[#92643E]/[0.08] border-[#92643E]/25",

          icon:
            "bg-[#92643E] text-[#F3EBDD]",

          title:
            "text-[#7A4D2C]",

        };

      }


      if (
        type === "success"
      ) {

        return {

          container:
            "bg-[#92643E]/[0.06] border-[#92643E]/20",

          icon:
            "bg-[#92643E] text-[#F3EBDD]",

          title:
            "text-[#7A4D2C]",

        };

      }


      return {

        container:
          "bg-[#F3EBDD] border-[#E5DDD2]",

        icon:
          "bg-[#101C2E] text-[#F3EBDD]",

        title:
          "text-[#101C2E]",

      };

    };


  return (

    <section className="mt-6">

      <div
        className="
          rounded-3xl
          bg-white
          border
          border-[#E5DDD2]
          shadow-[0_10px_30px_rgba(16,28,46,0.08)]
          overflow-hidden
        "
      >

        {/* HEADER */}

        <div
          className="
            px-4
            sm:px-6
            py-5
            border-b
            border-[#E5DDD2]
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                min-w-0
              "
            >

              <div
                className="
                  w-11
                  h-11
                  shrink-0
                  rounded-2xl
                  bg-[#F3EBDD]
                  border
                  border-[#E5DDD2]
                  text-[#92643E]
                  flex
                  items-center
                  justify-center
                  text-xl
                "
              >
                <FaBrain />
              </div>


              <div className="min-w-0">

                <h2
                  className="
                    text-xl
                    font-semibold
                    text-[#101C2E]
                  "
                >
                  Smart Financial Insights
                </h2>


                <p
                  className="
                    text-sm
                    text-[#6F665B]
                    mt-1
                  "
                >
                  Personalized analysis based on your actual financial activity.
                </p>

              </div>

            </div>


            {/* HEALTH */}

            <div
              className="
                flex
                items-center
                gap-3
                bg-[#F8F5EF]
                border
                border-[#E5DDD2]
                rounded-2xl
                px-4
                py-3
                w-full
                md:w-auto
              "
            >

              <div
                className="
                  w-14
                  h-14
                  shrink-0
                  rounded-full
                  border-4
                  border-[#92643E]
                  flex
                  items-center
                  justify-center
                "
              >

                <span
                  className="
                    text-sm
                    font-semibold
                    text-[#101C2E]
                  "
                >
                  {analysis.score}
                </span>

              </div>


              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wide
                    text-[#8B8175]
                  "
                >
                  Financial Health
                </p>


                <p
                  className="
                    font-semibold
                    text-[#92643E]
                  "
                >
                  {analysis.healthLabel}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* INSIGHTS */}

        <div
          className="
            p-4
            sm:p-6
          "
        >

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-3
              gap-4
            "
          >

            {analysis.insights
              .slice(0, 3)
              .map(
                (
                  insight,
                  index
                ) => {

                  const style =
                    getInsightStyle(
                      insight.type
                    );


                  return (

                    <div
                      key={index}
                      className={`
                        rounded-2xl
                        border
                        p-5
                        ${style.container}
                      `}
                    >

                      <div
                        className="
                          flex
                          items-start
                          gap-4
                        "
                      >

                        <div
                          className={`
                            w-10
                            h-10
                            shrink-0
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            ${style.icon}
                          `}
                        >
                          {insight.icon}
                        </div>


                        <div className="min-w-0">

                          <h3
                            className={`
                              font-semibold
                              ${style.title}
                            `}
                          >
                            {insight.title}
                          </h3>


                          <p
                            className="
                              text-sm
                              text-[#6F665B]
                              leading-6
                              mt-2
                            "
                          >
                            {insight.message}
                          </p>

                        </div>

                      </div>

                    </div>

                  );

                }
              )}

          </div>


          {/* SNAPSHOT */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              gap-4
              mt-5
            "
          >

            {/* EXPENSE RATE */}

            <div
              className="
                rounded-2xl
                bg-[#F8F5EF]
                border
                border-[#E5DDD2]
                p-4
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
                    w-9
                    h-9
                    shrink-0
                    rounded-xl
                    bg-[#56061D]/10
                    text-[#56061D]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <FaChartLine />
                </div>


                <div>

                  <p
                    className="
                      text-xs
                      text-[#8B8175]
                    "
                  >
                    Expense Rate
                  </p>


                  <p
                    className="
                      text-lg
                      font-semibold
                      text-[#101C2E]
                    "
                  >
                    {analysis.expenseRatio.toFixed(
                      0
                    )}%
                  </p>

                </div>

              </div>

            </div>


            {/* AVAILABLE BALANCE */}

            <div
              className="
                rounded-2xl
                bg-[#F8F5EF]
                border
                border-[#E5DDD2]
                p-4
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
                    w-9
                    h-9
                    shrink-0
                    rounded-xl
                    bg-[#92643E]
                    text-[#F3EBDD]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <FaPiggyBank />
                </div>


                <div className="min-w-0">

                  <p
                    className="
                      text-xs
                      text-[#8B8175]
                    "
                  >
                    Available Balance
                  </p>


                  <p
                    className="
                      text-lg
                      font-semibold
                      text-[#101C2E]
                      truncate
                    "
                  >
                    ₹
                    {Number(
                      currentBalance || 0
                    ).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>

                </div>

              </div>

            </div>


            {/* BUDGET REMAINING */}

            <div
              className="
                rounded-2xl
                bg-[#F8F5EF]
                border
                border-[#E5DDD2]
                p-4
                sm:col-span-2
                md:col-span-1
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
                    w-9
                    h-9
                    shrink-0
                    rounded-xl
                    bg-[#56061D]
                    text-[#F3EBDD]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <FaBullseye />
                </div>


                <div className="min-w-0">

                  <p
                    className="
                      text-xs
                      text-[#8B8175]
                    "
                  >
                    Budget Remaining
                  </p>


                  <p
                    className="
                      text-lg
                      font-semibold
                      text-[#101C2E]
                      truncate
                    "
                  >
                    ₹
                    {Number(
                      remainingBudget || 0
                    ).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* SMART MODE */}

          <div
            className="
              mt-5
              rounded-2xl
              bg-[#F3EBDD]
              border
              border-[#E5DDD2]
              p-5
            "
          >

            <div
              className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-4
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >

                <div
                  className="
                    w-11
                    h-11
                    shrink-0
                    rounded-xl
                    bg-[#101C2E]
                    text-[#F3EBDD]
                    flex
                    items-center
                    justify-center
                    text-lg
                  "
                >
                  <FaBrain />
                </div>


                <div className="min-w-0">

                  <h3
                    className="
                      font-semibold
                      text-[#101C2E]
                    "
                  >
                    BudgetBuddy Smart Mode
                  </h3>


                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                      mt-1
                    "
                  >
                    Your real financial activity is being analyzed to provide personalized recommendations.
                  </p>

                </div>

              </div>


              <div className="shrink-0">

                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-xl
                    bg-white
                    border
                    border-[#92643E]/30
                    text-[#92643E]
                    text-sm
                    font-medium
                  "
                >
                  <FaLightbulb />
                  Smart Mode
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

  );

}


// =========================================================
// MAIN DASHBOARD
// =========================================================

function Dashboard() {

  // =========================================================
  // ACTUAL LOGGED-IN USERNAME
  // =========================================================

  const [
    userName,
    setUserName,
  ] = useState(
    localStorage.getItem(
      "username"
    ) || "User"
  );


  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  const [
    dashboardData,
    setDashboardData,
  ] = useState({

    total_income: 0,

    total_expense: 0,

    current_balance: 0,

    total_budget: 0,

    remaining_budget: 0,

    recent_transactions: [],

    income_vs_expense: [],

  });


  const [
    loading,
    setLoading,
  ] = useState(true);


  // =========================================================
  // FETCH DASHBOARD DATA
  // =========================================================

  useEffect(() => {

    const fetchDashboard =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "access"
            );


          // If username exists in localStorage,
          // use it immediately.

          const storedUsername =
            localStorage.getItem(
              "username"
            );


          if (
            storedUsername
          ) {

            setUserName(
              storedUsername
            );

          }


          const response =
            await api.get(
              "budgets/dashboard/",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          setDashboardData(
            response.data
          );


        } catch (error) {

          console.log(
            "Dashboard error:",
            error
          );


        } finally {

          setLoading(false);

        }

      };


    fetchDashboard();

  }, []);


  // =========================================================
  // REAL DATA CALCULATIONS
  // =========================================================

  const income =
    Number(
      dashboardData.total_income
    ) || 0;


  const expense =
    Number(
      dashboardData.total_expense
    ) || 0;


  const balance =
    Number(
      dashboardData.current_balance
    ) || 0;


  const budget =
    Number(
      dashboardData.total_budget
    ) || 0;


  const remainingBudget =
    Number(
      dashboardData.remaining_budget
    ) || 0;


  // =========================================================
  // PERCENTAGES
  // =========================================================

  const expensePercentage =
    income > 0
      ? (expense / income) * 100
      : 0;


  const balancePercentage =
    income > 0
      ? (balance / income) * 100
      : 0;


  const budgetPercentage =
    budget > 0
      ? (remainingBudget / budget) * 100
      : 0;


  // =========================================================
  // UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#F3F0EA]
        overflow-x-hidden
      "
    >

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />


      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <div
        className="
          ml-0
          lg:ml-[253px]
          min-h-screen
          w-auto
        "
      >

        {/* ===================================================
            TOPBAR
        ==================================================== */}

        <Topbar />


        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main
          className="
            p-4
            sm:p-6
            md:p-8
            max-w-[1920px]
            mx-auto
          "
        >

          {/* =================================================
              WELCOME
          ================================================= */}

          <WelcomeBanner

            userName={
              userName
            }

            currentBalance={
              dashboardData.current_balance
            }

            totalIncome={
              dashboardData.total_income
            }

            totalExpense={
              dashboardData.total_expense
            }

          />


          {/* =================================================
              DASHBOARD CARDS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-4
              gap-4
              sm:gap-6
              mt-5
              sm:mt-6
            "
          >

            {/* TOTAL INCOME */}

            <DashboardCard

              title="Total Income"

              value={
                loading
                  ? "Loading..."
                  : `₹${income.toLocaleString(
                      "en-IN"
                    )}`
              }

              percentage={
                loading
                  ? "..."
                  : "100%"
              }

              subtitle="Total recorded income"

              icon={
                <FaWallet />
              }

              color="bg-[#92643E]"

            />


            {/* TOTAL EXPENSE */}

            <DashboardCard

              title="Total Expense"

              value={
                loading
                  ? "Loading..."
                  : `₹${expense.toLocaleString(
                      "en-IN"
                    )}`
              }

              percentage={
                loading
                  ? "..."
                  : `${expensePercentage.toFixed(
                      0
                    )}%`
              }

              subtitle="Of total income spent"

              icon={
                <FaMoneyBillWave />
              }

              color="bg-[#56061D]"

            />


            {/* CURRENT BALANCE */}

            <DashboardCard

              title="Current Balance"

              value={
                loading
                  ? "Loading..."
                  : `₹${balance.toLocaleString(
                      "en-IN"
                    )}`
              }

              percentage={
                loading
                  ? "..."
                  : `${balancePercentage.toFixed(
                      0
                    )}%`
              }

              subtitle="Income remaining"

              icon={
                <FaChartLine />
              }

              color="bg-[#101C2E]"

            />


            {/* REMAINING BUDGET */}

            <DashboardCard

              title="Remaining Budget"

              value={
                loading
                  ? "Loading..."
                  : `₹${remainingBudget.toLocaleString(
                      "en-IN"
                    )}`
              }

              percentage={
                loading
                  ? "..."
                  : `${Math.max(
                      0,
                      budgetPercentage
                    ).toFixed(
                      0
                    )}%`
              }

              subtitle="Budget still available"

              icon={
                <FaPiggyBank />
              }

              color="bg-[#92643E]"

            />

          </div>


          {/* =================================================
              SMART FINANCIAL INSIGHTS
          ================================================= */}

          <SmartFinancialInsights

            totalIncome={
              dashboardData.total_income
            }

            totalExpense={
              dashboardData.total_expense
            }

            currentBalance={
              dashboardData.current_balance
            }

            remainingBudget={
              dashboardData.remaining_budget
            }

            recentTransactions={
              dashboardData.recent_transactions
            }

            loading={
              loading
            }

          />


          {/* =================================================
              CHARTS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-4
              sm:gap-6
              mt-5
              sm:mt-6
            "
          >

            <div
              className="
                min-w-0
              "
            >

              <ExpenseChart

                transactions={
                  dashboardData.recent_transactions
                }

              />

            </div>


            <div
              className="
                min-w-0
              "
            >

              <IncomeExpenseChart

                data={
                  dashboardData.income_vs_expense
                }

              />

            </div>

          </div>


          {/* =================================================
              BOTTOM SECTION
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-4
              sm:gap-6
              mt-5
              sm:mt-6
            "
          >

            {/* RECENT TRANSACTIONS */}

            <div
              className="
                min-w-0
                overflow-hidden
              "
            >

              <RecentTransactions

                transactions={
                  dashboardData.recent_transactions
                }

              />

            </div>


            {/* FINANCIAL OVERVIEW */}

            <div
              className="
                min-w-0
                overflow-hidden
              "
            >

              <FinancialOverview

                totalIncome={
                  dashboardData.total_income
                }

                totalExpense={
                  dashboardData.total_expense
                }

                currentBalance={
                  dashboardData.current_balance
                }

              />

            </div>

          </div>

        </main>

      </div>

    </div>

  );

}


export default Dashboard;