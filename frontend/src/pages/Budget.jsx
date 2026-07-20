import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Budget() {
  const [budgets, setBudgets] = useState([]);

  const [category, setCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const token = localStorage.getItem("access");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/budgets/",
        config
      );

      setBudgets(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const addBudget = async (e) => {
    e.preventDefault();

    try {

      await axios.post(
        "http://127.0.0.1:8000/api/budgets/",
        {
          category,
          budget_amount: budgetAmount,
          month,
          year,
        },
        config
      );

      alert("Budget Added Successfully");

      setCategory("");
      setBudgetAmount("");
      setMonth("");
      setYear("");

      fetchBudgets();

    } catch (error) {

      console.error(error);

      if (error.response) {
        alert(JSON.stringify(error.response.data));
      }
    }
  };

  const deleteBudget = async (id) => {

    if (!window.confirm("Delete this budget?")) return;

    try {

      await axios.delete(
        `http://127.0.0.1:8000/api/budgets/${id}/`,
        config
      );

      alert("Budget Deleted Successfully");

      fetchBudgets();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">

        <h2 className="text-primary mb-4">
          Budget Planning
        </h2>

        <form onSubmit={addBudget}>

          <input
            className="form-control mb-3"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />

          <input
            type="number"
            className="form-control mb-3"
            placeholder="Budget Amount"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            required
          />

          <select
            className="form-control mb-3"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          >
            <option value="">Select Month</option>
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>

          <input
            type="number"
            className="form-control mb-3"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />

          <button className="btn btn-primary w-100">
            Add Budget
          </button>

        </form>

        <hr />

        <h3>Budget List</h3>

        <table className="table table-bordered table-hover">

          <thead className="table-dark">
            <tr>
              <th>Category</th>
              <th>Budget</th>
              <th>Month</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {budgets.length > 0 ? (
              budgets.map((budget) => (
                <tr key={budget.id}>

                  <td>{budget.category}</td>
                  <td>₹ {budget.budget_amount}</td>
                  <td>{budget.month}</td>
                  <td>{budget.year}</td>

                  <td>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteBudget(budget.id)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No Budgets Found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>
    </>
  );
}

export default Budget;