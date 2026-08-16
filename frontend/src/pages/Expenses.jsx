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
  const [saving, setSaving] = useState(false);

  const getTokenConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem(
        "access"
      )}`,
    },
  });

  const getErrorMessage = (err, fallback) => {
    const data = err.response?.data;

    if (!data) {
      return fallback;
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.error) {
      return data.error;
    }

    if (typeof data === "object") {
      const messages = [];

      Object.entries(data).forEach(
        ([field, value]) => {
          if (Array.isArray(value)) {
            value.forEach((message) => {
              messages.push(
                `${field}: ${message}`
              );
            });
          } else if (value) {
            messages.push(
              `${field}: ${value}`
            );
          }
        }
      );

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    return fallback;
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "expenses/expenses/",
        getTokenConfig()
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setExpenses(data);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load expense records."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
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
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const title = formData.title.trim();
    const amount = Number(formData.amount);

    if (!title) {
      setError(
        "Expense title is required."
      );
      return;
    }

    if (!formData.amount) {
      setError(
        "Expense amount is required."
      );
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError(
        "Expense amount must be greater than 0."
      );
      return;
    }

    if (!formData.date) {
      setError(
        "Expense date is required."
      );
      return;
    }

    const dataToSend = {
      ...formData,
      title,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `expenses/expenses/${editingId}/`,
          dataToSend,
          getTokenConfig()
        );
      } else {
        await api.post(
          "expenses/expenses/",
          dataToSend,
          getTokenConfig()
        );
      }

      resetForm();

      await fetchExpenses();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save expense."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setFormData({
      title: expense.title || "",
      amount: expense.amount || "",
      category:
        expense.category || "Miscellaneous",
      date: expense.date || "",
      description:
        expense.description || "",
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `expenses/expenses/${id}/`,
        getTokenConfig()
      );

      if (editingId === id) {
        resetForm();
      }

      await fetchExpenses();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete expense."
        )
      );
    }
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
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
              {editingId
                ? "Update Expense"
                : "Add Expense"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="expense-title">
                Title
              </label>

              <input
                id="expense-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Lunch at college"
                maxLength={100}
              />

              <label htmlFor="expense-amount">
                Amount
              </label>

              <input
                id="expense-amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
              />

              <label htmlFor="expense-category">
                Category
              </label>

              <select
                id="expense-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Food">
                  Food
                </option>

                <option value="Travel">
                  Travel
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Education">
                  Education
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Healthcare">
                  Healthcare
                </option>

                <option value="Bills">
                  Bills
                </option>

                <option value="Miscellaneous">
                  Miscellaneous
                </option>
              </select>

              <label htmlFor="expense-date">
                Expense Date
              </label>

              <input
                id="expense-date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />

              <label htmlFor="expense-description">
                Description
              </label>

              <textarea
                id="expense-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add a note"
                rows="4"
              />

              <div className="expenses-form-actions">
                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Expense"
                    : "Add Expense"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={resetForm}
                    disabled={saving}
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

                <p>
                  Your saved expense entries
                </p>
              </div>

              <span>
                {expenses.length} records
              </span>
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
                    {expenses.map(
                      (expense) => (
                        <tr key={expense.id}>
                          <td>
                            {expense.title}
                          </td>

                          <td>
                            {expense.category}
                          </td>

                          <td>
                            {expense.date}
                          </td>

                          <td className="expense-amount">
                            ₹
                            {formatAmount(
                              expense.amount
                            )}
                          </td>

                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                  handleEdit(
                                    expense
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() =>
                                  handleDelete(
                                    expense.id
                                  )
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
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