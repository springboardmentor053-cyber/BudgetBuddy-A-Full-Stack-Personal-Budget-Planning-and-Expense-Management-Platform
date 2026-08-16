import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/income.css";

function Income() {
  const [incomes, setIncomes] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    source: "POCKET_MONEY",
    description: "",
    income_date: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getTokenConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
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

      Object.entries(data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          value.forEach((message) => {
            messages.push(`${field}: ${message}`);
          });
        } else if (value) {
          messages.push(`${field}: ${value}`);
        }
      });

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    return fallback;
  };

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "incomes/incomes/",
        getTokenConfig()
      );

      const incomeData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setIncomes(incomeData);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load income records."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

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
      source: "POCKET_MONEY",
      description: "",
      income_date: "",
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
      setError("Income title is required.");
      return;
    }

    if (!formData.amount) {
      setError("Income amount is required.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError(
        "Income amount must be greater than 0."
      );
      return;
    }

    if (!formData.income_date) {
      setError("Income date is required.");
      return;
    }

    const dataToSend = {
      ...formData,
      title,
      amount: formData.amount,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `incomes/incomes/${editingId}/`,
          dataToSend,
          getTokenConfig()
        );
      } else {
        await api.post(
          "incomes/incomes/",
          dataToSend,
          getTokenConfig()
        );
      }

      resetForm();
      await fetchIncomes();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save income."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (income) => {
    setEditingId(income.id);

    setFormData({
      title: income.title || "",
      amount: income.amount || "",
      source: income.source || "OTHER",
      description: income.description || "",
      income_date: income.income_date || "",
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this income?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `incomes/incomes/${id}/`,
        getTokenConfig()
      );

      if (editingId === id) {
        resetForm();
      }

      await fetchIncomes();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete income."
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

  const formatSource = (source) => {
    if (!source) {
      return "Other";
    }

    return source
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="income-main">
        <header className="income-header">
          <div>
            <p className="dashboard-eyebrow">
              Income management
            </p>

            <h1>Manage Your Income</h1>

            <p>
              Add, edit, and track all your income
              sources.
            </p>
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="income-grid">
          <div className="income-form-card">
            <h2>
              {editingId
                ? "Update Income"
                : "Add Income"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="income-title">
                Title
              </label>

              <input
                id="income-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Monthly pocket money"
                maxLength={100}
              />

              <label htmlFor="income-amount">
                Amount
              </label>

              <input
                id="income-amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
              />

              <label htmlFor="income-source">
                Source
              </label>

              <select
                id="income-source"
                name="source"
                value={formData.source}
                onChange={handleChange}
              >
                <option value="SALARY">
                  Salary
                </option>

                <option value="POCKET_MONEY">
                  Pocket Money
                </option>

                <option value="SCHOLARSHIP">
                  Scholarship
                </option>

                <option value="FREELANCING">
                  Freelancing
                </option>

                <option value="BUSINESS">
                  Business
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>

              <label htmlFor="income-date">
                Income Date
              </label>

              <input
                id="income-date"
                type="date"
                name="income_date"
                value={formData.income_date}
                onChange={handleChange}
              />

              <label htmlFor="income-description">
                Description
              </label>

              <textarea
                id="income-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add a note"
                rows="4"
              />

              <div className="income-form-actions">
                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Income"
                    : "Add Income"}
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

          <div className="income-list-card">
            <div className="income-list-header">
              <div>
                <h2>Income Records</h2>

                <p>
                  Your saved income entries
                </p>
              </div>

              <span>
                {incomes.length} records
              </span>
            </div>

            {loading ? (
              <p className="income-state">
                Loading income records...
              </p>
            ) : incomes.length === 0 ? (
              <p className="income-state">
                No income records yet.
              </p>
            ) : (
              <div className="income-table-wrapper">
                <table className="income-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Source</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {incomes.map((income) => (
                      <tr key={income.id}>
                        <td>
                          {income.title}
                        </td>

                        <td>
                          {formatSource(
                            income.source
                          )}
                        </td>

                        <td>
                          {income.income_date}
                        </td>

                        <td className="income-amount">
                          ₹
                          {formatAmount(
                            income.amount
                          )}
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                handleEdit(
                                  income
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
                                  income.id
                                )
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

export default Income;