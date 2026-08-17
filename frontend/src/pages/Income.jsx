import { useEffect, useState } from "react";
import axios from "axios";
import "./Income.css";

function Income() {
  // ================= INCOME DATA =================

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= FORM DATA =================

  const [title, setTitle] = useState("");
  const [source, setSource] = useState("SALARY");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [incomeDate, setIncomeDate] = useState("");

  // ================= EDIT MODE =================

  const [editingIncome, setEditingIncome] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ================= API =================

  const API_URL = "http://127.0.0.1:8000/api/income/";

  // ================= FETCH INCOME =================

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access");

      if (!token) {
        setError("Please login to view your income.");
        return;
      }

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setIncomes(response.data);
      } else if (response.data.results) {
        setIncomes(response.data.results);
      } else {
        setIncomes([]);
      }
    } catch (error) {
      console.error("Income Fetch Error:", error);

      if (error.response?.status === 401) {
        setError("Your login session has expired. Please login again.");
      } else {
        setError("Unable to load income data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= CLEAR FORM =================

  const clearForm = () => {
    setTitle("");
    setSource("SALARY");
    setAmount("");
    setDescription("");
    setIncomeDate("");
    setEditingIncome(null);
  };

  // ================= ADD / UPDATE =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("access");

      if (!token) {
        setError("Please login before managing income.");
        return;
      }

      const incomeData = {
        title,
        source,
        amount,
        description,
        income_date: incomeDate,
      };

      // ================= UPDATE =================

      if (editingIncome) {
        const response = await axios.put(
          `${API_URL}${editingIncome.id}/`,
          incomeData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIncomes(
          incomes.map((income) =>
            income.id === editingIncome.id ? response.data : income
          )
        );

        setSuccess("Income updated successfully!");
      }

      // ================= ADD =================

      else {
        const response = await axios.post(API_URL, incomeData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setIncomes([response.data, ...incomes]);

        setSuccess("Income added successfully!");
      }

      clearForm();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Income Submit Error:", error);

      if (error.response?.data) {
        console.error("Backend Error:", error.response.data);
      }

      setError(
        editingIncome
          ? "Unable to update income. Please check your details."
          : "Unable to add income. Please check your details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================= EDIT =================

  const handleEdit = (income) => {
    setEditingIncome(income);

    setTitle(income.title || "");
    setSource(income.source || "SALARY");
    setAmount(income.amount || "");
    setDescription(income.description || "");
    setIncomeDate(income.income_date || "");

    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= DELETE =================

  const handleDelete = async (incomeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this income?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("access");

      await axios.delete(`${API_URL}${incomeId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIncomes(
        incomes.filter((income) => income.id !== incomeId)
      );

      if (
        editingIncome &&
        editingIncome.id === incomeId
      ) {
        clearForm();
      }

      setSuccess("Income deleted successfully!");
      setError("");
    } catch (error) {
      console.error("Delete Income Error:", error);

      setError("Unable to delete income.");
      setSuccess("");
    }
  };

  // ================= CANCEL EDIT =================

  const handleCancelEdit = () => {
    clearForm();
    setSuccess("");
    setError("");
  };

  // ================= CALCULATIONS =================

  const totalIncome = incomes.reduce(
    (total, income) => total + Number(income.amount || 0),
    0
  );

  const averageIncome =
    incomes.length > 0 ? totalIncome / incomes.length : 0;

  // ================= SOURCE ICON =================

  const getSourceIcon = (source) => {
    const icons = {
      SALARY: "💼",
      POCKET_MONEY: "💰",
      SCHOLARSHIP: "🎓",
      FREELANCING: "💻",
      BUSINESS: "🏢",
      OTHER: "💵",
    };

    return icons[source] || "💰";
  };

  // ================= SOURCE NAME =================

  const getSourceName = (source) => {
    const names = {
      SALARY: "Salary",
      POCKET_MONEY: "Pocket Money",
      SCHOLARSHIP: "Scholarship",
      FREELANCING: "Freelancing",
      BUSINESS: "Business",
      OTHER: "Other",
    };

    return names[source] || source;
  };

  // ================= DATE FORMAT =================

  const formatDate = (date) => {
    if (!date) return "No date";

    const parts = date.split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
  };

  // ================= UI =================

  return (
    <div className="income-page">

      {/* ================= HEADER ================= */}

      <div className="income-header">

        <div>
          <span className="income-eyebrow">
            💰 INCOME TRACKER
          </span>

          <h1>Income Management</h1>

          <p>
            Track, organize, and manage all your income sources
            in one place.
          </p>
        </div>

      </div>


      {/* ================= SUCCESS ================= */}

      {success && (
        <div className="income-alert success-alert">
          <span>✅</span>
          <p>{success}</p>

          <button
            onClick={() => setSuccess("")}
          >
            ×
          </button>
        </div>
      )}


      {/* ================= ERROR ================= */}

      {error && (
        <div className="income-alert error-alert">
          <span>⚠️</span>
          <p>{error}</p>

          <button
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}


      {/* ================= SUMMARY ================= */}

      <div className="income-summary">

        <div className="income-summary-card total-income-card">

          <div className="income-summary-icon">
            💰
          </div>

          <div className="income-summary-content">
            <span>Total Income</span>

            <h2>
              ₹{totalIncome.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>

            <small>
              Across all income records
            </small>
          </div>

        </div>


        <div className="income-summary-card records-card">

          <div className="income-summary-icon">
            📊
          </div>

          <div className="income-summary-content">
            <span>Income Records</span>

            <h2>{incomes.length}</h2>

            <small>
              Total transactions
            </small>
          </div>

        </div>


        <div className="income-summary-card average-card">

          <div className="income-summary-icon">
            📈
          </div>

          <div className="income-summary-content">
            <span>Average Income</span>

            <h2>
              ₹{averageIncome.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>

            <small>
              Per income record
            </small>
          </div>

        </div>

      </div>


      {/* ================= FORM ================= */}

      <div className="income-form-panel">

        <div className="income-form-header">

          <div className="form-title-icon">
            {editingIncome ? "✏️" : "➕"}
          </div>

          <div>
            <span className="section-label">
              {editingIncome
                ? "EDIT TRANSACTION"
                : "NEW TRANSACTION"}
            </span>

            <h2>
              {editingIncome
                ? "Update Income"
                : "Add New Income"}
            </h2>

            <p>
              {editingIncome
                ? "Update the details of your income below."
                : "Record a new source of income to keep your finances organized."}
            </p>
          </div>

        </div>


        <form
          onSubmit={handleSubmit}
          className="income-form"
        >

          {/* TITLE */}

          <div className="income-form-group">

            <label>
              Income Title
            </label>

            <div className="income-input-wrapper">

              <span className="income-input-icon">
                📝
              </span>

              <input
                type="text"
                placeholder="Example: Monthly Salary"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />

            </div>

          </div>


          {/* SOURCE */}

          <div className="income-form-group">

            <label>
              Income Source
            </label>

            <div className="income-input-wrapper">

              <span className="income-input-icon">
                {getSourceIcon(source)}
              </span>

              <select
                value={source}
                onChange={(e) =>
                  setSource(e.target.value)
                }
                required
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

            </div>

          </div>


          {/* AMOUNT */}

          <div className="income-form-group">

            <label>
              Amount
            </label>

            <div className="income-amount-wrapper">

              <span>₹</span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                required
              />

            </div>

          </div>


          {/* DATE */}

          <div className="income-form-group">

            <label>
              Income Date
            </label>

            <input
              className="income-date-input"
              type="date"
              value={incomeDate}
              onChange={(e) =>
                setIncomeDate(e.target.value)
              }
              required
            />

          </div>


          {/* DESCRIPTION */}

          <div className="income-form-group income-full-width">

            <label>
              Description
            </label>

            <textarea
              placeholder="Example: Salary received for August"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows="4"
            />

          </div>


          {/* BUTTONS */}

          <div className="income-form-actions">

            <button
              type="submit"
              className="income-primary-button"
              disabled={submitting}
            >

              {submitting
                ? "⏳ Saving..."
                : editingIncome
                ? "✏️ Update Income"
                : "＋ Add Income"}

            </button>


            {editingIncome && (
              <button
                type="button"
                className="income-cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>

      </div>


      {/* ================= INCOME LIST ================= */}

      <div className="income-list-panel">

        <div className="income-list-header">

          <div>

            <span className="section-label">
              INCOME HISTORY
            </span>

            <h2>
              Your Income
            </h2>

            <p>
              View and manage your recorded income.
            </p>

          </div>


          <div className="income-count">

            <strong>
              {incomes.length}
            </strong>

            <span>
              Records
            </span>

          </div>

        </div>


        {/* ================= LOADING ================= */}

        {loading && (

          <div className="income-empty-state">

            <div className="income-loading-spinner"></div>

            <h3>
              Loading income...
            </h3>

            <p>
              Please wait while we fetch your income records.
            </p>

          </div>

        )}


        {/* ================= ERROR ================= */}

        {!loading && error && (

          <div className="income-empty-state">

            <div className="income-empty-icon">
              ⚠️
            </div>

            <h3>
              Unable to load income
            </h3>

            <p>
              Something went wrong while loading your income.
            </p>

            <button
              className="income-retry-button"
              onClick={fetchIncomes}
            >
              Try Again
            </button>

          </div>

        )}


        {/* ================= EMPTY ================= */}

        {!loading &&
          !error &&
          incomes.length === 0 && (

            <div className="income-empty-state">

              <div className="income-empty-icon">
                💰
              </div>

              <h3>
                No income records yet
              </h3>

              <p>
                Start tracking your finances by adding
                your first income above.
              </p>

            </div>

          )}


        {/* ================= INCOME LIST ================= */}

        {!loading &&
          !error &&
          incomes.length > 0 && (

            <div className="income-list">

              {incomes.map((income) => (

                <div
                  className="income-item"
                  key={income.id}
                >

                  {/* ICON */}

                  <div className="income-item-icon">
                    {getSourceIcon(income.source)}
                  </div>


                  {/* DETAILS */}

                  <div className="income-item-details">

                    <h3>
                      {income.title}
                    </h3>

                    <span className="income-source-badge">
                      {getSourceName(income.source)}
                    </span>

                    {income.description && (
                      <p>
                        {income.description}
                      </p>
                    )}

                  </div>


                  {/* DATE */}

                  <div className="income-item-date">

                    <span>
                      DATE
                    </span>

                    <strong>
                      {formatDate(income.income_date)}
                    </strong>

                  </div>


                  {/* AMOUNT */}

                  <div className="income-item-amount">

                    <span>
                      INCOME
                    </span>

                    <strong>
                      +₹{Number(
                        income.amount
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>

                  </div>


                  {/* ACTIONS */}

                  <div className="income-item-actions">

                    <button
                      type="button"
                      className="income-edit-button"
                      onClick={() =>
                        handleEdit(income)
                      }
                      title="Edit Income"
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      className="income-delete-button"
                      onClick={() =>
                        handleDelete(income.id)
                      }
                      title="Delete Income"
                    >
                      🗑️
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

      </div>

    </div>
  );
}

export default Income;