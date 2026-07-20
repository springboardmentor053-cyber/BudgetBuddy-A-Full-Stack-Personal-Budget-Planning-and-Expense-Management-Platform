import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Dashboard() {

  const [dashboard, setDashboard] = useState({
    total_income: 0,
    total_expense: 0,
    current_balance: 0,
    total_budget: 0,
    remaining_budget: 0,
    recent_transactions: [],
  });

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

      console.error(error);

      if (error.response?.status === 401) {
        alert("Session Expired. Please login again.");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }

    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">

        <h1 className="text-center text-primary mb-5">
          BudgetBuddy Dashboard
        </h1>

        <div className="row">

          <div className="col-md-4 mb-4">
            <div className="card shadow border-success">
              <div className="card-body text-center">
                <h5>Total Income</h5>
                <h2 className="text-success">
                  ₹ {dashboard.total_income}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card shadow border-danger">
              <div className="card-body text-center">
                <h5>Total Expense</h5>
                <h2 className="text-danger">
                  ₹ {dashboard.total_expense}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card shadow border-primary">
              <div className="card-body text-center">
                <h5>Current Balance</h5>
                <h2 className="text-primary">
                  ₹ {dashboard.current_balance}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card shadow border-info">
              <div className="card-body text-center">
                <h5>Total Budget</h5>
                <h2 className="text-info">
                  ₹ {dashboard.total_budget}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card shadow border-warning">
              <div className="card-body text-center">
                <h5>Remaining Budget</h5>
                <h2 className="text-warning">
                  ₹ {dashboard.remaining_budget}
                </h2>
              </div>
            </div>
          </div>

        </div>

        <div className="card shadow">

          <div className="card-header bg-dark text-white">
            Recent Expenses
          </div>

          <div className="card-body">

            <table className="table table-bordered">

              <thead>

                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>

              </thead>

              <tbody>

                {dashboard.recent_transactions.length > 0 ? (

                  dashboard.recent_transactions.map((item) => (

                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>₹ {item.amount}</td>
                      <td>{item.date}</td>
                    </tr>

                  ))

                ) : (

                  <tr>
                    <td colSpan="4" className="text-center">
                      No Recent Transactions
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </>
  );
}

export default Dashboard;