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

  const getTokenConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("incomes/", getTokenConfig());
      setIncomes(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load income records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
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
      source: "POCKET_MONEY",
      description: "",
      income_date: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.title ||
      !formData.amount ||
      !formData.income_date
    ) {
      setError("Please fill in title, amount, and income date.");
      return;
    }

    try {
      if (editingId) {
        await api.put(
          `incomes/${editingId}/`,
          formData,
          getTokenConfig()
        );
      } else {
        await api.post(
          "incomes/",
          formData,
          getTokenConfig()
        );
      }

      resetForm();
      fetchIncomes();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to save income."
      );
    }
  };

  const handleEdit = (income) => {
    setEditingId(income.id);

    setFormData({
      title: income.title,
      amount: income.amount,
      source: income.source,
      description: income.description || "",
      income_date: income.income_date,
    });

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
      await api.delete(
        `incomes/${id}/`,
        getTokenConfig()
      );

      fetchIncomes();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete income."
      );
    }
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
              Add, edit, and track all your income sources.
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
              {editingId ? "Update Income" : "Add Income"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label>Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Monthly pocket money"
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

              <label>Source</label>

              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
              >
                <option value="SALARY">Salary</option>
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
                <option value="OTHER">Other</option>
              </select>

              <label>Income Date</label>

              <input
                type="date"
                name="income_date"
                value={formData.income_date}
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

              <div className="income-form-actions">
                <button type="submit">
                  {editingId
                    ? "Update Income"
                    : "Add Income"}
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

          <div className="income-list-card">
            <div className="income-list-header">
              <div>
                <h2>Income Records</h2>
                <p>Your saved income entries</p>
              </div>

              <span>{incomes.length} records</span>
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
                        <td>{income.title}</td>
                        <td>
                          {income.source.replaceAll("_", " ")}
                        </td>
                        <td>{income.income_date}</td>
                        <td className="income-amount">
                          ₹{income.amount}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEdit(income)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDelete(income.id)
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