import { useEffect, useState } from "react";
import api from "../services/api";
import "./Expenses.css";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [category, setCategory] = useState("FOOD");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // FETCH EXPENSES
  // =========================================================

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access");

      if (!token) {
        setError("Please login to view your expenses.");
        return;
      }

      const response = await api.get("expenses/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setExpenses(response.data);
      } else if (response.data?.results) {
        setExpenses(response.data.results);
      } else {
        setExpenses([]);
      }

    } catch (error) {
      console.error("Expense Error:", error);

      if (error.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          error.apiMessage ||
          "Unable to load expense data. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {

    if (!category) {
      setError("Please select an expense category.");
      return false;
    }

    if (!amount || amount.trim() === "") {
      setError("Please enter the expense amount.");
      return false;
    }

    if (Number(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return false;
    }

    if (!expenseDate) {
      setError("Please select the expense date.");
      return false;
    }

    return true;
  };


  // =========================================================
  // FORMAT BACKEND VALIDATION ERRORS
  // =========================================================

  const getBackendErrorMessage = (error) => {

    const data = error.response?.data;

    if (!data) {
      return (
        error.apiMessage ||
        "Unable to save expense. Please try again."
      );
    }

    // Example:
    // { "amount": ["Ensure this value is greater than 0."] }

    if (typeof data === "object") {

      const messages = [];

      Object.entries(data).forEach(
        ([field, fieldErrors]) => {

          if (Array.isArray(fieldErrors)) {

            fieldErrors.forEach((message) => {

              const fieldName =
                field === "amount"
                  ? "Amount"
                  : field === "date"
                  ? "Expense date"
                  : field === "category"
                  ? "Category"
                  : field === "description"
                  ? "Description"
                  : field;

              messages.push(
                `${fieldName}: ${message}`
              );

            });

          } else if (typeof fieldErrors === "string") {

            messages.push(
              `${field}: ${fieldErrors}`
            );

          }

        }
      );

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    return (
      error.apiMessage ||
      "Unable to save expense. Please check your details."
    );
  };


  // =========================================================
  // ADD / UPDATE EXPENSE
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {

      const token = localStorage.getItem("access");

      if (!token) {
        setError(
          "Please login before adding an expense."
        );
        return;
      }

      const expenseData = {
        category,
        amount,
        date: expenseDate,
        description,
      };


      // =====================================================
      // UPDATE EXISTING EXPENSE
      // =====================================================

      if (editingId) {

        const response = await api.put(
          `expenses/${editingId}/`,
          expenseData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setExpenses((current) =>
          current.map((expense) =>
            expense.id === editingId
              ? response.data
              : expense
          )
        );

        setSuccess(
          "Expense updated successfully!"
        );

      }

      // =====================================================
      // CREATE NEW EXPENSE
      // =====================================================

      else {

        const response = await api.post(
          "expenses/",
          expenseData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setExpenses((current) => [
          response.data,
          ...current,
        ]);

        setSuccess(
          "Expense added successfully!"
        );
      }

      resetForm();

    } catch (error) {

      console.error(
        "Save Expense Error:",
        error
      );

      // Authentication error
      if (error.response?.status === 401) {

        setError(
          "Your login session has expired. Please login again."
        );

      }

      // Permission error
      else if (error.response?.status === 403) {

        setError(
          "You do not have permission to save this expense."
        );

      }

      // Validation / bad request
      else if (error.response?.status === 400) {

        setError(
          getBackendErrorMessage(error)
        );

      }

      // Server unavailable
      else if (error.response?.status >= 500) {

        setError(
          "The server is currently unavailable. Your expense was not saved. Please try again later."
        );

      }

      // No response from API
      else if (!error.response) {

        setError(
          "Unable to connect to the server. Please check your connection and try again."
        );

      }

      // Everything else
      else {

        setError(
          error.apiMessage ||
          "Unable to save expense. Please check your details and try again."
        );

      }

    } finally {

      setSubmitting(false);

    }
  };


  // =========================================================
  // DELETE EXPENSE
  // =========================================================

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      setError("");
      setSuccess("");

      const token = localStorage.getItem("access");

      if (!token) {
        setError(
          "Please login before deleting an expense."
        );
        return;
      }

      await api.delete(
        `expenses/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses((current) =>
        current.filter(
          (expense) => expense.id !== id
        )
      );

      setSuccess(
        "Expense deleted successfully!"
      );

    } catch (error) {

      console.error(
        "Delete Expense Error:",
        error
      );

      if (error.response?.status === 401) {

        setError(
          "Your login session has expired. Please login again."
        );

      } else if (error.response?.status === 403) {

        setError(
          "You do not have permission to delete this expense."
        );

      } else if (error.response?.status === 404) {

        setError(
          "This expense could not be found. It may have already been deleted."
        );

      } else if (!error.response) {

        setError(
          "Unable to connect to the server. Please check your connection and try again."
        );

      } else {

        setError(
          error.apiMessage ||
          "Unable to delete expense. Please try again."
        );

      }
    }
  };


  // =========================================================
  // EDIT EXPENSE
  // =========================================================

  const handleEdit = (expense) => {

    setEditingId(expense.id);

    setCategory(expense.category);

    setAmount(expense.amount);

    setExpenseDate(expense.date);

    setDescription(
      expense.description || ""
    );

    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {

    setEditingId(null);

    setCategory("FOOD");

    setAmount("");

    setExpenseDate("");

    setDescription("");

  };


  // =========================================================
  // TOTAL EXPENSE
  // =========================================================

  const totalExpense = expenses.reduce(
    (total, expense) =>
      total +
      Number(expense.amount || 0),
    0
  );


  // =========================================================
  // CATEGORY ICON
  // =========================================================

  const getCategoryIcon = (category) => {

    const icons = {
      FOOD: "🍔",
      TRANSPORT: "🚗",
      EDUCATION: "📚",
      SHOPPING: "🛍️",
      ENTERTAINMENT: "🎬",
      HEALTH: "💊",
      BILLS: "🧾",
      OTHER: "📦",
    };

    return icons[category] || "💸";
  };


  // =========================================================
  // CATEGORY NAME
  // =========================================================

  const getCategoryName = (category) => {

    const names = {
      FOOD: "Food",
      TRANSPORT: "Transport",
      EDUCATION: "Education",
      SHOPPING: "Shopping",
      ENTERTAINMENT: "Entertainment",
      HEALTH: "Health",
      BILLS: "Bills",
      OTHER: "Other",
    };

    return names[category] || category;
  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="expense-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="expense-header">

        <div>

          <span className="expense-badge">
            💳 EXPENSE TRACKER
          </span>

          <h1>
            Expense Management
          </h1>

          <p>
            Track, categorize, and manage your daily
            expenses with ease.
          </p>

        </div>

      </div>


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {success && (

        <div className="expense-alert success-alert">

          <span>✓</span>

          <div>

            <strong>
              Success
            </strong>

            <p>
              {success}
            </p>

          </div>

          <button
            onClick={() => setSuccess("")}
          >
            ×
          </button>

        </div>

      )}


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (

        <div className="expense-alert error-alert">

          <span>⚠</span>

          <div>

            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>

          </div>

          <button
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="expense-summary">

        <div className="expense-summary-card expense-total-card">

          <div className="summary-icon">
            💸
          </div>

          <div className="summary-content">

            <span>
              Total Expenses
            </span>

            <h2>
              ₹
              {totalExpense.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </h2>

            <small>
              Overall spending
            </small>

          </div>

        </div>


        <div className="expense-summary-card transaction-card">

          <div className="summary-icon">
            📊
          </div>

          <div className="summary-content">

            <span>
              Transactions
            </span>

            <h2>
              {expenses.length}
            </h2>

            <small>
              Recorded expenses
            </small>

          </div>

        </div>


        <div className="expense-summary-card tracking-card">

          <div className="summary-icon">
            🎯
          </div>

          <div className="summary-content">

            <span>
              Tracking Status
            </span>

            <h2>
              {expenses.length > 0
                ? "Active"
                : "Ready"}
            </h2>

            <small>
              {expenses.length > 0
                ? "Expenses being tracked"
                : "Add your first expense"}
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          FORM
      ================================================= */}

      <div className="expense-form-panel">

        <div className="form-panel-header">

          <div className="form-heading-icon">
            {editingId ? "✏️" : "➕"}
          </div>

          <div>

            <span className="section-label">

              {editingId
                ? "EDIT TRANSACTION"
                : "NEW TRANSACTION"}

            </span>

            <h2>

              {editingId
                ? "Update Expense"
                : "Add New Expense"}

            </h2>

            <p>

              {editingId
                ? "Update your expense details below."
                : "Record your spending to keep your budget on track."}

            </p>

          </div>

        </div>


        <form
          onSubmit={handleSubmit}
          className="expense-form"
        >

          {/* CATEGORY */}

          <div className="form-group">

            <label>
              Expense Category
            </label>

            <div className="input-container">

              <span className="input-icon">
                {getCategoryIcon(category)}
              </span>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                required
              >

                <option value="FOOD">
                  🍔 Food
                </option>

                <option value="TRANSPORT">
                  🚗 Transport
                </option>

                <option value="EDUCATION">
                  📚 Education
                </option>

                <option value="SHOPPING">
                  🛍️ Shopping
                </option>

                <option value="ENTERTAINMENT">
                  🎬 Entertainment
                </option>

                <option value="HEALTH">
                  💊 Health
                </option>

                <option value="BILLS">
                  🧾 Bills
                </option>

                <option value="OTHER">
                  📦 Other
                </option>

              </select>

            </div>

          </div>


          {/* AMOUNT */}

          <div className="form-group">

            <label>
              Amount
            </label>

            <div className="amount-container">

              <span>
                ₹
              </span>

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

          <div className="form-group">

            <label>
              Expense Date
            </label>

            <input
              className="date-input"
              type="date"
              value={expenseDate}
              onChange={(e) =>
                setExpenseDate(e.target.value)
              }
              required
            />

          </div>


          {/* DESCRIPTION */}

          <div className="form-group description-group">

            <label>
              Description
            </label>

            <textarea
              placeholder="Example: Lunch with friends"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows="3"
            />

            <small>
              Add a short note to remember this expense.
            </small>

          </div>


          {/* BUTTONS */}

          <div className="form-actions">

            <button
              type="submit"
              className="expense-primary-button"
              disabled={submitting}
            >

              {submitting
                ? "Saving..."
                : editingId
                ? "✏️ Update Expense"
                : "+ Add Expense"}

            </button>


            {editingId && (

              <button
                type="button"
                className="expense-secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>

            )}

          </div>

        </form>

      </div>


      {/* =================================================
          TRANSACTION HISTORY
      ================================================= */}

      <div className="expense-list-panel">

        <div className="list-header">

          <div>

            <span className="section-label">
              TRANSACTION HISTORY
            </span>

            <h2>
              Your Expenses
            </h2>

            <p>
              View and manage your recorded expenses.
            </p>

          </div>

          <div className="transaction-count">

            <strong>
              {expenses.length}
            </strong>

            <span>
              Transactions
            </span>

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="expense-empty-state">

            <div className="loading-spinner"></div>

            <h3>
              Loading expenses...
            </h3>

            <p>
              Please wait while we fetch your transactions.
            </p>

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          expenses.length === 0 && (

            <div className="expense-empty-state">

              <div className="empty-expense-icon">
                💸
              </div>

              <h3>
                No expenses yet
              </h3>

              <p>
                Start tracking your spending by
                adding your first expense above.
              </p>

            </div>

          )}


        {/* =================================================
            LIST
        ================================================= */}

        {!loading &&
          expenses.length > 0 && (

            <div className="expense-list">

              {expenses.map((expense) => (

                <div
                  className="expense-item"
                  key={expense.id}
                >

                  <div className="expense-icon">

                    {getCategoryIcon(
                      expense.category
                    )}

                  </div>


                  <div className="expense-details">

                    <h3>

                      {getCategoryName(
                        expense.category
                      )}

                    </h3>

                    <p>

                      {expense.description ||
                        "No description"}

                    </p>

                  </div>


                  <div className="expense-date">

                    <span>
                      Date
                    </span>

                    <strong>
                      {expense.date}
                    </strong>

                  </div>


                  <div className="expense-amount">

                    <strong>

                      -₹
                      {Number(
                        expense.amount
                      ).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}

                    </strong>

                  </div>


                  <div className="expense-actions">

                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(expense)
                      }
                      title="Edit Expense"
                    >
                      ✏️
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(
                          expense.id
                        )
                      }
                      title="Delete Expense"
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

export default Expenses;
