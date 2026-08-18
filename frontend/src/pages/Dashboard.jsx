import { useEffect, useState } from "react";
import api from "../api";

import IncomeExpenseChart from "../components/IncomeExpenseChart";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import CategoryExpenseChart from "../components/CategoryExpenseChart";
import BudgetUtilizationChart from "../components/BudgetUtilizationChart";
import SavingsProgressChart from "../components/SavingsProgressChart"


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

      const response = await api.get(
        "dashboard/"
      );

      console.log(
        "Dashboard API Response:",
        response.data
      );


      setDashboard({

        financial_summary:
          response.data.financial_summary || {
            total_income: 0,
            total_expense: 0,
            current_balance: 0,
            total_budget: 0,
            remaining_budget: 0,
            total_savings: 0,
          },


        category_analysis:
          Array.isArray(
            response.data.category_analysis
          )
            ? response.data.category_analysis
            : [],


        monthly_trend:
          Array.isArray(
            response.data.monthly_trend
          )
            ? response.data.monthly_trend
            : [],


        active_savings_goals:
          Array.isArray(
            response.data.active_savings_goals
          )
            ? response.data.active_savings_goals
            : [],


        latest_notifications:
          Array.isArray(
            response.data.latest_notifications
          )
            ? response.data.latest_notifications
            : [],


        recent_income:
          Array.isArray(
            response.data.recent_income
          )
            ? response.data.recent_income
            : [],


        recent_transactions:
          Array.isArray(
            response.data.recent_transactions
          )
            ? response.data.recent_transactions
            : [],

      });


    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        alert(
          "Session expired. Please login again."
        );

        localStorage.removeItem(
          "access"
        );

        localStorage.removeItem(
          "refresh"
        );

        window.location.href =
          "/login";

      }

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {

    fetchDashboard();

  }, []);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="container-fluid mt-5">

        <div className="text-center">

          <div
            className="spinner-border text-primary"
            role="status"
          >
          </div>

          <p className="mt-3">
            Loading Dashboard...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // VARIABLES
  // =====================================================

  const summary =
    dashboard.financial_summary;


  const budgetPercentage =
    summary.total_budget > 0
      ? Math.min(
          (
            summary.total_expense /
            summary.total_budget
          ) * 100,
          100
        )
      : 0;


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="container-fluid">


      {/* ================================================= */}
      {/* WELCOME */}
      {/* ================================================= */}

      <div className="card shadow-lg border-0 bg-primary text-white mb-4">

        <div className="card-body">

          <h2>
            👋 Welcome to BudgetBuddy
          </h2>

          <p className="mb-0">
            Here's your complete financial overview.
          </p>

        </div>

      </div>


      {/* ================================================= */}
      {/* TITLE */}
      {/* ================================================= */}

      <h2 className="text-center fw-bold mb-4">

        Financial Dashboard

      </h2>


      {/* ================================================= */}
      {/* SUMMARY CARDS */}
      {/* ================================================= */}

      <div className="row">


        {/* TOTAL INCOME */}

        <div className="col-xl-3 col-md-6 mb-4">

          <div className="card shadow border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>

                  <h6 className="text-muted">
                    TOTAL INCOME
                  </h6>

                  <h3 className="text-success fw-bold">

                    ₹ {summary.total_income}

                  </h3>

                </div>

                <div className="fs-1">
                  💰
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* TOTAL EXPENSE */}

        <div className="col-xl-3 col-md-6 mb-4">

          <div className="card shadow border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>

                  <h6 className="text-muted">
                    TOTAL EXPENSE
                  </h6>

                  <h3 className="text-danger fw-bold">

                    ₹ {summary.total_expense}

                  </h3>

                </div>

                <div className="fs-1">
                  💸
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* CURRENT BALANCE */}

        <div className="col-xl-3 col-md-6 mb-4">

          <div className="card shadow border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>

                  <h6 className="text-muted">
                    CURRENT BALANCE
                  </h6>

                  <h3
                    className={
                      summary.current_balance >= 0
                        ? "text-primary fw-bold"
                        : "text-danger fw-bold"
                    }
                  >

                    ₹ {summary.current_balance}

                  </h3>

                </div>

                <div className="fs-1">
                  🏦
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* TOTAL SAVINGS */}

        <div className="col-xl-3 col-md-6 mb-4">

          <div className="card shadow border-0 h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>

                  <h6 className="text-muted">
                    TOTAL SAVINGS
                  </h6>

                  <h3 className="text-success fw-bold">

                    ₹ {summary.total_savings}

                  </h3>

                </div>

                <div className="fs-1">
                  🎯
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* BUDGET USAGE */}
      {/* ================================================= */}

      <div className="card shadow border-0 mb-4">

        <div className="card-body">

          <div className="d-flex justify-content-between">

            <h4>
              📊 Budget Usage
            </h4>

            <strong>
              {budgetPercentage.toFixed(0)}%
            </strong>

          </div>


          <div
            className="progress mt-3"
            style={{ height: "28px" }}
          >

            <div

              className={
                budgetPercentage < 70
                  ? "progress-bar bg-success"
                  : budgetPercentage < 90
                  ? "progress-bar bg-warning"
                  : "progress-bar bg-danger"
              }

              role="progressbar"

              style={{
                width: `${budgetPercentage}%`,
              }}

            >

              {budgetPercentage.toFixed(0)}%

            </div>

          </div>


          <div className="d-flex justify-content-between mt-2">

            <small className="text-muted">

              Spent: ₹{" "}
              {summary.total_expense}

            </small>

            <small className="text-muted">

              Budget: ₹{" "}
              {summary.total_budget}

            </small>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* ANALYTICS CHARTS */}
      {/* ================================================= */}

      <div className="row mb-4">


        {/* INCOME VS EXPENSE */}

        <div className="col-lg-4 mb-4">

          <IncomeExpenseChart

            income={
              summary.total_income
            }

            expense={
              summary.total_expense
            }

          />

        </div>


        {/* CATEGORY EXPENSE */}

        <div className="col-lg-4 mb-4">

          <CategoryExpenseChart

            data={
              dashboard.category_analysis
            }

          />

        </div>


        {/* BUDGET UTILIZATION */}

        <div className="col-lg-4 mb-4">

          <BudgetUtilizationChart

            totalBudget={
              summary.total_budget
            }

            totalExpense={
              summary.total_expense
            }

          />

        </div>

      </div>


      {/* ================================================= */}
      {/* SIX MONTH FINANCIAL TREND */}
      {/* ================================================= */}

      <div className="row mb-4">

        <div className="col-12">

          <MonthlyTrendChart

            data={
              dashboard.monthly_trend
            }

          />

        </div>

      </div>


      {/* ================================================= */}
{/* SAVINGS PROGRESS + SAVINGS GOALS */}
{/* ================================================= */}

<div className="row mb-4">


  {/* ================================================= */}
  {/* OVERALL SAVINGS PROGRESS CHART */}
  {/* ================================================= */}

  <div className="col-lg-6 mb-4">

    <SavingsProgressChart
      goals={dashboard.active_savings_goals}
    />

  </div>


  {/* ================================================= */}
  {/* INDIVIDUAL SAVINGS GOALS */}
  {/* ================================================= */}

  <div className="col-lg-6 mb-4">

    <div className="card shadow border-0 h-100">

      <div className="card-body">

        <h4 className="mb-4">
          🎯 Savings Goals
        </h4>


        {dashboard.active_savings_goals.length > 0 ? (

          dashboard.active_savings_goals.map(
            (goal, index) => (

              <div
                key={`${goal.goal_name}-${index}`}
                className="mb-4"
              >

                <div className="d-flex justify-content-between">

                  <strong>
                    {goal.goal_name}
                  </strong>

                  <span>
                    {goal.progress_percentage}%
                  </span>

                </div>


                <div
                  className="progress mt-2"
                  style={{
                    height: "18px",
                  }}
                >

                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{
                      width: `${Math.min(
                        Number(
                          goal.progress_percentage
                        ) || 0,
                        100
                      )}%`,
                    }}
                  />

                </div>


                <div className="d-flex justify-content-between mt-2">

                  <small className="text-muted">

                    Saved: ₹{" "}
                    {Number(
                      goal.saved_amount
                    ).toLocaleString("en-IN")}

                  </small>


                  <small className="text-muted">

                    Target: ₹{" "}
                    {Number(
                      goal.target_amount
                    ).toLocaleString("en-IN")}

                  </small>

                </div>


                <small className="text-muted">

                  📅 Target: {goal.target_date}

                </small>

              </div>

            )

          )

        ) : (

          <div className="text-center text-muted py-4">

            <div
              style={{
                fontSize: "40px",
              }}
            >
              🎯
            </div>

            <h5 className="mt-2">
              No Savings Goals
            </h5>

            <p className="mb-0">
              Create a savings goal to
              track your progress.
            </p>

          </div>

        )}

      </div>

    </div>

  </div>

</div>


{/* ================================================= */}
{/* LATEST NOTIFICATIONS */}
{/* ================================================= */}

<div className="row mb-4">

  <div className="col-12">

    <div className="card shadow border-0">

      <div className="card-body">

        <h4 className="mb-4">
          🔔 Latest Notifications
        </h4>


        {dashboard.latest_notifications.length > 0 ? (

          dashboard.latest_notifications.map(
            (notification, index) => (

              <div
                key={`${notification.title}-${notification.created_at}-${index}`}
                className="border-bottom pb-3 mb-3"
              >

                <div className="d-flex justify-content-between">

                  <strong>
                    {notification.title}
                  </strong>


                  <span
                    className={
                      notification.priority === "high"
                        ? "badge bg-danger"
                        : notification.priority === "medium"
                        ? "badge bg-warning text-dark"
                        : "badge bg-secondary"
                    }
                  >

                    {notification.priority}

                  </span>

                </div>


                <p className="mb-1 mt-2">

                  {notification.message}

                </p>


                <small className="text-muted">

                  {new Date(
                    notification.created_at
                  ).toLocaleString()}

                </small>

              </div>

            )

          )

        ) : (

          <div className="text-center text-muted py-4">

            <h5>
              🔔 No Notifications
            </h5>

            <p className="mb-0">
              You're all caught up.
            </p>

          </div>

        )}

      </div>

    </div>

  </div>

</div>


      {/* ================================================= */}
      {/* RECENT INCOME */}
      {/* ================================================= */}

      <div className="card shadow border-0 mb-4">

        <div className="card-header bg-success text-white">

          <h4 className="mb-0">

            💰 Recent Income

          </h4>

        </div>


        <div className="card-body">

          {dashboard.recent_income.length > 0 ? (

            <div className="table-responsive">

              <table className="table table-hover table-bordered align-middle">

                <thead className="table-success">

                  <tr>

                    <th>
                      Title
                    </th>

                    <th>
                      Source
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {dashboard.recent_income.map(
                    (income, index) => (

                      <tr
                        key={`${income.id ?? income.title}-${index}`}
                      >

                        <td>
                          {income.title}
                        </td>

                        <td>
                          {income.source}
                        </td>

                        <td className="text-success fw-bold">

                          ₹ {income.amount}

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

            <p className="text-center text-muted">

              No recent income.

            </p>

          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* RECENT EXPENSES */}
      {/* ================================================= */}

      <div className="card shadow border-0 mb-5">

        <div className="card-header bg-danger text-white">

          <h4 className="mb-0">

            💸 Recent Expenses

          </h4>

        </div>


        <div className="card-body">

          {dashboard.recent_transactions.length > 0 ? (

            <div className="table-responsive">

              <table className="table table-hover table-bordered align-middle">

                <thead className="table-danger">

                  <tr>

                    <th>
                      Title
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {dashboard.recent_transactions.map(
                    (expense, index) => (

                      <tr
                        key={`${expense.id ?? expense.title}-${index}`}
                      >

                        <td>
                          {expense.title}
                        </td>

                        <td>
                          {expense.category}
                        </td>

                        <td className="text-danger fw-bold">

                          ₹ {expense.amount}

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

            <p className="text-center text-muted">

              No recent expenses.

            </p>

          )}

        </div>

      </div>


    </div>

  );

}


export default Dashboard;