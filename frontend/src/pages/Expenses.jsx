import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/expenses.css";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getTokenConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("expenses/", getTokenConfig());
      setExpenses(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load expense records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      category: "Food",
      date: "",
      description: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.title || !formData.amount || !formData.date) {
      setError("Please fill in title, amount, and expense date.");
      return;
    }

    try {
      if (editingId) {
        await api.put(
          `expenses/${editingId}/`,
          formData,
          getTokenConfig()
        );
      } else {
        await api.post(
          "expenses/",
          formData,
          getTokenConfig()
        );
      }

      resetForm();
      fetchExpenses();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to save expense."
      );
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `expenses/${id}/`,
        getTokenConfig()
      );

      fetchExpenses();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete expense."
      );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="expenses-main">
        <header className="expenses-header">
          <div>
            <p className="dashboard-eyebrow">
              Expense management
            </p>

            <h1>Manage Your Expenses</h1>

            <p>
              Add, edit, and track all your spending.
            </p>
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="expenses-grid">
          <div className="expenses-form-card">
            <h2>
              {editingId ? "Update Expense" : "Add Expense"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label>Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Lunch at college"
              />

              <label>Amount</label>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />

              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Shopping">Shopping</option>
                <option value="Education">Education</option>
                <option value="Entertainment">
                  Entertainment
                </option>
                <option value="Healthcare">
                  Healthcare
                </option>
                <option value="Bills">Bills</option>
                <option value="Miscellaneous">
                  Miscellaneous
                </option>
              </select>

              <label>Expense Date</label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />

              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add a note"
                rows="4"
              />

              <div className="expenses-form-actions">
                <button type="submit">
                  {editingId
                    ? "Update Expense"
                    : "Add Expense"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="expenses-list-card">
            <div className="expenses-list-header">
              <div>
                <h2>Expense Records</h2>
                <p>Your saved expense entries</p>
              </div>

              <span>{expenses.length} records</span>
            </div>

            {loading ? (
              <p className="expenses-state">
                Loading expense records...
              </p>
            ) : expenses.length === 0 ? (
              <p className="expenses-state">
                No expense records yet.
              </p>
            ) : (
              <div className="expenses-table-wrapper">
                <table className="expenses-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{expense.title}</td>
                        <td>{expense.category}</td>
                        <td>{expense.date}</td>
                        <td className="expense-amount">
                          ₹{expense.amount}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEdit(expense)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDelete(expense.id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Expenses;