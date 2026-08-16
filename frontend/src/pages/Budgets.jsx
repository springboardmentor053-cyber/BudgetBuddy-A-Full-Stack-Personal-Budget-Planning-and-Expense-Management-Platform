import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/budgets.css";

const categories = [
  "Food",
  "Travel",
  "Shopping",
  "Education",
  "Entertainment",
  "Healthcare",
  "Bills",
  "Miscellaneous",
];

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [formData, setFormData] = useState({
    category: "Food",
    amount: "",
    month: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getTokenConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [budgetResponse, expenseResponse] = await Promise.all([
        api.get("budgets/budgets/", getTokenConfig()),
        api.get("expenses/expenses/", getTokenConfig()),
      ]);

      const budgetData = Array.isArray(budgetResponse.data)
        ? budgetResponse.data
        : budgetResponse.data?.results || [];

      const expenseData = Array.isArray(expenseResponse.data)
        ? expenseResponse.data
        : expenseResponse.data?.results || [];

      setBudgets(budgetData);
      setExpenses(expenseData);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load budget information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      category: "Food",
      amount: "",
      month: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.amount || !formData.month) {
      setError("Please enter the budget amount and month.");
      return;
    }

    try {
      if (editingId) {
        await api.put(
          `budgets/budgets/${editingId}/`,
          formData,
          getTokenConfig()
        );
      } else {
        await api.post(
          "budgets/budgets/",
          formData,
          getTokenConfig()
        );
      }

      resetForm();
      fetchData();
    } catch (err) {
      const backendData = err.response?.data;

      setError(
        typeof backendData === "string"
          ? backendData
          : backendData?.detail ||
              backendData?.non_field_errors?.[0] ||
              "Unable to save budget."
      );
    }
  };

  const handleEdit = (budget) => {
    setEditingId(budget.id);

    setFormData({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `budgets/budgets/${id}/`,
        getTokenConfig()
      );

      fetchData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete budget."
      );
    }
  };

  const budgetDetails = useMemo(() => {
  return budgets.map((budget) => {
    const budgetMonth = String(
      budget.month || ""
    )
      .trim()
      .toLowerCase();

    const spent = expenses
      .filter((expense) => {
        if (!expense.date) return false;

        const expenseDate = new Date(
          `${expense.date}T00:00:00`
        );

        const expenseMonth = expenseDate
          .toLocaleString("en-US", {
            month: "long",
          })
          .toLowerCase();

        const expenseYear = expenseDate.getFullYear();

        const expenseMonthYear =
          `${expenseMonth} ${expenseYear}`;

        // Supports both:
        // "August"
        // "August 2026"
        const monthMatches =
          budgetMonth === expenseMonth ||
          budgetMonth === expenseMonthYear;

        return (
          expense.category === budget.category &&
          monthMatches
        );
      })
      .reduce(
        (total, expense) =>
          total + Number(expense.amount),
        0
      );

    const amount = Number(budget.amount);

    const remaining = amount - spent;

    const percentage =
      amount > 0
        ? Math.min(
            (spent / amount) * 100,
            100
          )
        : 0;

    let status = "On Track";

    if (spent > amount) {
      status = "Exceeded";
    } else if (percentage >= 75) {
      status = "Warning";
    }

    return {
      ...budget,
      spent,
      remaining,
      percentage,
      status,
    };
  });
}, [budgets, expenses]);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="budgets-main">
        <header className="budgets-header">
          <p className="dashboard-eyebrow">
            Budget management
          </p>

          <h1>Plan Your Monthly Budget</h1>

          <p>
            Set spending limits and track how much you have used.
          </p>
        </header>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="budgets-grid">
          <div className="budget-form-card">
            <h2>
              {editingId
                ? "Update Budget"
                : "Create Budget"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>

              <label>Budget Amount</label>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter budget amount"
                min="0"
                step="0.01"
              />

              <label>Month</label>

              <input
                type="text"
                name="month"
                value={formData.month}
                onChange={handleChange}
                placeholder="Example: July 2026"
              />

              <div className="budget-form-actions">
                <button type="submit">
                  {editingId
                    ? "Update Budget"
                    : "Create Budget"}
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

          <div className="budget-overview-card">
            <div className="budget-overview-header">
              <div>
                <h2>Budget Overview</h2>

                <p>
                  Your category-wise budget progress
                </p>
              </div>

              <span>
                {budgets.length} budgets
              </span>
            </div>

            {loading ? (
              <p className="budget-state">
                Loading budgets...
              </p>
            ) : budgetDetails.length === 0 ? (
              <p className="budget-state">
                No budgets created yet.
              </p>
            ) : (
              <div className="budget-card-list">
                {budgetDetails.map((budget) => (
                  <article
                    className="budget-item-card"
                    key={budget.id}
                  >
                    <div className="budget-item-top">
                      <div>
                        <h3>
                          {budget.category}
                        </h3>

                        <p>
                          {budget.month}
                        </p>
                      </div>

                      <span
                        className={`budget-status ${budget.status
                          .toLowerCase()
                          .replace(
                            " ",
                            "-"
                          )}`}
                      >
                        {budget.status}
                      </span>
                    </div>

                    <div className="budget-numbers">
                      <div>
                        <span>Budget</span>

                        <strong>
                          ₹
                          {Number(
                            budget.amount
                          ).toFixed(2)}
                        </strong>
                      </div>

                      <div>
                        <span>Spent</span>

                        <strong>
                          ₹
                          {budget.spent.toFixed(
                            2
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Remaining</span>

                        <strong
                          className={
                            budget.remaining <
                            0
                              ? "negative-remaining"
                              : ""
                          }
                        >
                          ₹
                          {budget.remaining.toFixed(
                            2
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="progress-row">
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${budget.status
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )}`}
                          style={{
                            width: `${budget.percentage}%`,
                          }}
                        />
                      </div>

                      <span>
                        {budget.percentage.toFixed(
                          0
                        )}
                        %
                      </span>
                    </div>

                    <div className="budget-item-actions">
                      <button
                        className="edit-button"
                        onClick={() =>
                          handleEdit(
                            budget
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(
                            budget.id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Budgets;