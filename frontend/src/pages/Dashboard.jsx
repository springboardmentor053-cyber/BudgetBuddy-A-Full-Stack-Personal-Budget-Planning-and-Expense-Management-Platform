import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ================= FETCH DASHBOARD DATA =================

  useEffect(() => {
    fetchDashboard();
  }, []);


  const fetchDashboard = async () => {

    try {

      const token = localStorage.getItem("access");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/dashboard/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboard(response.data);

    } catch (error) {

      console.error("Dashboard Error:", error);

      setError("Unable to load dashboard data.");

    } finally {

      setLoading(false);

    }

  };


  // ================= LOADING =================

  if (loading) {

    return (

      <div className="dashboard-message">

        <h2>
          Loading dashboard...
        </h2>

      </div>

    );

  }


  // ================= ERROR =================

  if (error) {

    return (

      <div className="dashboard-message">

        <h2>
          {error}
        </h2>

      </div>

    );

  }


  // ================= DASHBOARD =================

  return (

    <div className="dashboard">


      {/* ================= HEADER ================= */}

      <div className="dashboard-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Here's an overview of your financial activity.
          </p>

        </div>

      </div>


      {/* ================= SUMMARY CARDS ================= */}

      <div className="summary-cards">


        {/* TOTAL INCOME */}

        <div className="summary-card income-card">

          <div className="card-icon">
            💰
          </div>

          <div>

            <p>
              Total Income
            </p>

            <h2>
              ₹{dashboard.total_income}
            </h2>

          </div>

        </div>


        {/* TOTAL EXPENSE */}

        <div className="summary-card expense-card">

          <div className="card-icon">
            💸
          </div>

          <div>

            <p>
              Total Expense
            </p>

            <h2>
              ₹{dashboard.total_expense}
            </h2>

          </div>

        </div>


        {/* CURRENT BALANCE */}

        <div className="summary-card balance-card">

          <div className="card-icon">
            💵
          </div>

          <div>

            <p>
              Current Balance
            </p>

            <h2>
              ₹{dashboard.current_balance}
            </h2>

          </div>

        </div>


        {/* TOTAL BUDGET */}

        <div className="summary-card budget-card">

          <div className="card-icon">
            📊
          </div>

          <div>

            <p>
              Total Budget
            </p>

            <h2>
              ₹{dashboard.total_budget}
            </h2>

          </div>

        </div>

      </div>


      {/* ================= BUDGET + QUICK ACTIONS ================= */}

      <div className="dashboard-grid">


        {/* ================= BUDGET OVERVIEW ================= */}

        <div className="dashboard-panel">

          <h2>
            Budget Overview
          </h2>

          <div className="budget-info">


            {/* REMAINING BUDGET */}

            <div>

              <span>
                Remaining Budget
              </span>

              <strong>
                ₹{dashboard.remaining_budget}
              </strong>

            </div>


            {/* BUDGET STATUS */}

            <div>

              <span>
                Status
              </span>

              <strong
                className={
                  dashboard.budget_status === "Within Budget"
                    ? "status-good"
                    : "status-bad"
                }
              >

                {dashboard.budget_status}

              </strong>

            </div>

          </div>

        </div>


        {/* ================= QUICK ACTIONS ================= */}

        <div className="dashboard-panel">

          <h2>
            Quick Actions
          </h2>

          <div className="quick-actions">


            {/* ADD INCOME */}

            <button
              onClick={() => navigate("/income")}
            >

              + Add Income

            </button>


            {/* ADD EXPENSE */}

            <button
              onClick={() => navigate("/expenses")}
            >

              + Add Expense

            </button>


            {/* CREATE BUDGET */}

            <button
              onClick={() => navigate("/budgets")}
            >

              + Create Budget

            </button>


          </div>

        </div>


      </div>


      {/* ================= RECENT TRANSACTIONS ================= */}

      <div className="dashboard-panel transactions-panel">


        {/* TRANSACTION HEADER */}

        <div className="transactions-header">

          <div>

            <h2>
              Recent Transactions
            </h2>

            <p>
              Your latest income and expenses.
            </p>

          </div>

        </div>


        {/* ================= TRANSACTION LIST ================= */}

        {dashboard.recent_transactions &&
        dashboard.recent_transactions.length > 0 ? (

          <div className="transactions-list">


            {dashboard.recent_transactions.map(
              (transaction, index) => (

                <div
                  className="transaction-item"
                  key={index}
                >


                  {/* TRANSACTION ICON */}

                  <div className="transaction-icon">

                    {transaction.type === "Income"
                      ? "💰"
                      : "💸"}

                  </div>


                  {/* TRANSACTION DETAILS */}

                  <div className="transaction-details">

                    <strong>

                      {transaction.type === "Income"
                        ? transaction.title
                        : transaction.category}

                    </strong>

                    <span>

                      {transaction.type === "Income"
                        ? transaction.source
                        : "Expense"}

                    </span>

                  </div>


                  {/* TRANSACTION AMOUNT */}

                  <div
                    className={
                      transaction.type === "Income"
                        ? "transaction-amount income-amount"
                        : "transaction-amount expense-amount"
                    }
                  >

                    {transaction.type === "Income"
                      ? "+"
                      : "-"}₹{transaction.amount}

                  </div>


                  {/* TRANSACTION DATE */}

                  <div className="transaction-date">

                    {transaction.date}

                  </div>


                </div>

              )
            )}

          </div>

        ) : (


          /* NO TRANSACTIONS */

          <p className="empty-message">

            No recent transactions found.

          </p>

        )}


      </div>


    </div>

  );

}

export default Dashboard;