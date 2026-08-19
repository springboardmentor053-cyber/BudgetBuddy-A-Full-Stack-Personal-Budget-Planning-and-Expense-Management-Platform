import { useEffect, useState } from "react";
import api from "../services/api";
import "./Budgets.css";

function Budgets() {
  const API = "budgets/";
  const SUMMARY_API = "budgets/summary/";

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({});

  const [category, setCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [editingBudget, setEditingBudget] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("access");
  };

  // =====================================================
  // FETCH DATA
  // =====================================================

  useEffect(() => {
    fetchBudgets();
    fetchSummary();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login to view your budgets.");
        return;
      }

      const response = await api.get(API);

      if (Array.isArray(response.data)) {
        setBudgets(response.data);
      } else if (response.data.results) {
        setBudgets(response.data.results);
      } else {
        setBudgets([]);
      }

    } catch (error) {
      console.error("Budget Fetch Error:", error);

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError("Unable to load your budgets.");
      }

    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await api.get(SUMMARY_API);

      setSummary(response.data);

    } catch (error) {
      console.error(
        "Budget Summary Error:",
        error
      );
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setCategory("");
    setBudgetAmount("");
    setMonth("");
    setYear("");
    setEditingBudget(null);
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateBudget = () => {

    if (!category) {
      return "Please select a budget category.";
    }

    if (!budgetAmount) {
      return "Please enter a budget amount.";
    }

    if (Number(budgetAmount) <= 0) {
      return "Budget amount must be greater than ₹0.";
    }

    if (!month) {
      return "Please select a month.";
    }

    if (!year) {
      return "Please enter a year.";
    }

    const numericYear = Number(year);

    if (
      numericYear < 2020 ||
      numericYear > 2100
    ) {
      return "Please enter a valid year.";
    }

    return "";
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateBudget();

    if (validationError) {
      setError(validationError);
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Please login before managing your budgets."
      );
      return;
    }

    setSubmitting(true);

    const budgetData = {
      category,
      budget_amount: budgetAmount,
      month,
      year,
    };

    try {

      if (editingBudget) {

        const response = await api.put(
          `${API}${editingBudget.id}/`,
          budgetData
        );

        setBudgets((currentBudgets) =>
          currentBudgets.map((budget) =>
            budget.id === editingBudget.id
              ? response.data
              : budget
          )
        );

        setSuccess(
          "Budget updated successfully!"
        );

        resetForm();

        await fetchBudgets();
        await fetchSummary();

      } else {

        await api.post(
          API,
          budgetData
        );

        setSuccess(
          "Budget created successfully!"
        );

        resetForm();

        await fetchBudgets();
        await fetchSummary();
      }

    } catch (error) {

      console.error(
        "Budget Save Error:",
        error
      );

      console.error(
        "Backend Response:",
        error.response?.data
      );

      if (error.response?.status === 400) {

        const backendData =
          error.response.data;

        if (
          typeof backendData ===
          "object"
        ) {

          const messages =
            Object.values(backendData)
              .flat()
              .join(" ");

          setError(
            messages ||
            "Please check your budget details."
          );

        } else {

          setError(
            "Please check your budget details."
          );
        }

      } else if (
        error.response?.status === 401
      ) {

        setError(
          "Your session has expired. Please login again."
        );

      } else if (
        error.response?.status === 404
      ) {

        setError(
          "Budget could not be found."
        );

      } else {

        setError(
          editingBudget
            ? "Unable to update budget."
            : "Unable to create budget."
        );
      }

    } finally {

      setSubmitting(false);

    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (budget) => {

    setEditingBudget(budget);

    setCategory(
      budget.category || ""
    );

    setBudgetAmount(
      budget.budget_amount || ""
    );

    setMonth(
      budget.month || ""
    );

    setYear(
      budget.year || ""
    );

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {

    resetForm();
    setError("");
    setSuccess("");

  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (budget) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete the ${getCategoryName(
          budget.category
        )} budget for ${budget.month} ${budget.year}?`
      );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Please login before deleting a budget."
      );
      return;
    }

    try {

      setError("");
      setSuccess("");

      await api.delete(
        `${API}${budget.id}/`
      );

      setBudgets(
        (currentBudgets) =>
          currentBudgets.filter(
            (item) =>
              item.id !== budget.id
          )
      );

      if (
        editingBudget &&
        editingBudget.id === budget.id
      ) {
        resetForm();
      }

      setSuccess(
        "Budget deleted successfully!"
      );

      await fetchSummary();

    } catch (error) {

      console.error(
        "Budget Delete Error:",
        error
      );

      if (
        error.response?.status === 401
      ) {

        setError(
          "Your session has expired. Please login again."
        );

      } else if (
        error.response?.status === 404
      ) {

        setError(
          "Budget could not be found."
        );

      } else {

        setError(
          "Unable to delete budget."
        );
      }
    }
  };

  // =====================================================
  // CATEGORY ICON
  // =====================================================

  const getCategoryIcon = (
    categoryName
  ) => {

    const icons = {
      FOOD: "🍔",
      TRANSPORT: "🚗",
      EDUCATION: "📚",
      SHOPPING: "🛍️",
      ENTERTAINMENT: "🎬",
      HEALTH: "💊",
      BILLS: "🧾",
      TRAVEL: "✈️",
      OTHER: "📦",
    };

    return (
      icons[
        categoryName?.toUpperCase()
      ] || "📊"
    );
  };

  // =====================================================
  // CATEGORY NAME
  // =====================================================

  const getCategoryName = (
    categoryName
  ) => {

    if (!categoryName) {
      return "Other";
    }

    return categoryName
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // =====================================================
  // MONEY FORMAT
  // =====================================================

  const formatMoney = (value) => {

    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =====================================================
  // BUDGET STATUS
  // =====================================================

  const getBudgetStatus = (
    budget
  ) => {

    const amount = Number(
      budget.budget_amount || 0
    );

    const spent = Number(
      budget.spent || 0
    );

    if (amount <= 0) {

      return {
        text: "No Budget",
        className: "status-neutral",
        icon: "ℹ️",
      };
    }

    const percentage =
      Number(
        budget.utilization_percentage ??
        ((spent / amount) * 100)
      );

    if (percentage >= 100) {

      return {
        text: "Budget Exceeded",
        className: "status-exceeded",
        icon: "🚨",
      };
    }

    if (percentage >= 90) {

      return {
        text: "High Warning",
        className: "status-high",
        icon: "🔶",
      };
    }

    if (percentage >= 80) {

      return {
        text: "Warning",
        className: "status-warning",
        icon: "⚠️",
      };
    }

    return {
      text: "Safe",
      className: "status-safe",
      icon: "✅",
    };
  };

  // =====================================================
  // BUDGET ALERT MESSAGE
  // =====================================================

  const getBudgetAlert = (
    budget
  ) => {

    const amount = Number(
      budget.budget_amount || 0
    );

    const spent = Number(
      budget.spent || 0
    );

    if (amount <= 0) {

      return {
        type: "neutral",
        icon: "ℹ️",
        title: "No budget set",
        message:
          "Set a valid budget amount to monitor your spending.",
      };
    }

    const percentage =
      Number(
        budget.utilization_percentage ??
        ((spent / amount) * 100)
      );

    const categoryName =
      getCategoryName(
        budget.category
      );

    if (percentage >= 100) {

      return {
        type: "exceeded",
        icon: "🚨",
        title: "Budget Exceeded",
        message:
          `Your ${categoryName} budget has been exceeded.`,
      };
    }

    if (percentage >= 90) {

      return {
        type: "high",
        icon: "🔶",
        title: "High Warning",
        message:
          `You have used ${percentage.toFixed(
            0
          )}% of your ${categoryName} budget.`,
      };
    }

    if (percentage >= 80) {

      return {
        type: "warning",
        icon: "⚠️",
        title: "Budget Warning",
        message:
          `You have used ${percentage.toFixed(
            0
          )}% of your monthly ${categoryName} budget.`,
      };
    }

    return {
      type: "safe",
      icon: "✅",
      title: "Budget is on track",
      message:
        "Your spending is currently within the budget limit.",
    };
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="budget-page">

      {/* HEADER */}

      <div className="budget-header">

        <div>

          <span className="budget-eyebrow">
            📊 BUDGET PLANNER
          </span>

          <h1>
            Budget Management
          </h1>

          <p>
            Plan your spending, monitor your limits,
            and stay in control of your finances.
          </p>

        </div>

      </div>

      {/* SUCCESS */}

      {success && (

        <div className="budget-alert success-alert">

          <span>✅</span>

          <p>{success}</p>

        </div>

      )}

      {/* ERROR */}

      {error && (

        <div className="budget-alert error-alert">

          <span>⚠️</span>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => {
              fetchBudgets();
              fetchSummary();
            }}
          >
            Try Again
          </button>

        </div>

      )}

      {/* SUMMARY */}

      <div className="budget-summary">

        <div className="budget-summary-card total-budget-card">

          <div className="budget-summary-icon">
            📊
          </div>

          <div>

            <span>
              Total Budget
            </span>

            <h2>
              ₹
              {formatMoney(
                summary.budget_amount
              )}
            </h2>

            <small>
              Your planned spending
            </small>

          </div>

        </div>

        <div className="budget-summary-card expense-budget-card">

          <div className="budget-summary-icon">
            💸
          </div>

          <div>

            <span>
              Total Expense
            </span>

            <h2>
              ₹
              {formatMoney(
                summary.total_expense
              )}
            </h2>

            <small>
              Total spending
            </small>

          </div>

        </div>

        <div className="budget-summary-card remaining-budget-card">

          <div className="budget-summary-icon">
            💰
          </div>

          <div>

            <span>
              Remaining Budget
            </span>

            <h2
              className={
                Number(
                  summary.remaining_budget || 0
                ) < 0
                  ? "negative-value"
                  : ""
              }
            >
              ₹
              {formatMoney(
                summary.remaining_budget
              )}
            </h2>

            <small>
              Available to spend
            </small>

          </div>

        </div>

        <div className="budget-summary-card overspent-budget-card">

          <div className="budget-summary-icon">
            ⚠️
          </div>

          <div>

            <span>
              Overspent
            </span>

            <h2>
              ₹
              {formatMoney(
                summary.overspent_amount
              )}
            </h2>

            <small>
              Amount over budget
            </small>

          </div>

        </div>

      </div>

      {/* CREATE / EDIT */}

      <div className="budget-form-panel">

        <div className="budget-form-header">

          <div>

            <span className="section-label">

              {editingBudget
                ? "EDIT BUDGET"
                : "NEW BUDGET"}

            </span>

            <h2>

              {editingBudget
                ? "Update Budget"
                : "Create Monthly Budget"}

            </h2>

            <p>

              {editingBudget
                ? "Update your budget details below."
                : "Set a spending limit for a category and keep your expenses under control."}

            </p>

          </div>

          <div className="form-header-icon">

            {editingBudget
              ? "✏️"
              : "🎯"}

          </div>

        </div>

        <form
          className="budget-form"
          onSubmit={handleSubmit}
        >

          {/* CATEGORY */}

          <div className="budget-form-group">

            <label>
              Budget Category
            </label>

            <div className="budget-input-wrapper">

              <span>
                {getCategoryIcon(category)}
              </span>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                required
              >

                <option value="">
                  Select category
                </option>

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

                <option value="TRAVEL">
                  ✈️ Travel
                </option>

                <option value="OTHER">
                  📦 Other
                </option>

              </select>

            </div>

          </div>

          {/* AMOUNT */}

          <div className="budget-form-group">

            <label>
              Budget Amount
            </label>

            <div className="money-input">

              <span>₹</span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter budget amount"
                value={budgetAmount}
                onChange={(e) =>
                  setBudgetAmount(
                    e.target.value
                  )
                }
                required
              />

            </div>

          </div>

          {/* MONTH */}

          <div className="budget-form-group">

            <label>
              Month
            </label>

            <select
              value={month}
              onChange={(e) =>
                setMonth(
                  e.target.value
                )
              }
              required
            >

              <option value="">
                Select month
              </option>

              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map(
                (monthName) => (

                  <option
                    key={monthName}
                    value={monthName}
                  >
                    {monthName}
                  </option>

                )
              )}

            </select>

          </div>

          {/* YEAR */}

          <div className="budget-form-group">

            <label>
              Year
            </label>

            <input
              type="number"
              min="2020"
              max="2100"
              placeholder="2026"
              value={year}
              onChange={(e) =>
                setYear(
                  e.target.value
                )
              }
              required
            />

          </div>

          {/* BUTTONS */}

          <div className="budget-form-actions">

            <button
              type="submit"
              className="create-budget-button"
              disabled={submitting}
            >

              {submitting
                ? "Saving..."
                : editingBudget
                ? "✏️ Update Budget"
                : "＋ Create Budget"}

            </button>

            {editingBudget && (

              <button
                type="button"
                className="cancel-budget-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>

            )}

          </div>

        </form>

      </div>

      {/* BUDGET OVERVIEW */}

      <div className="budgets-list-panel">

        <div className="budgets-list-header">

          <div>

            <span className="section-label">
              BUDGET OVERVIEW
            </span>

            <h2>
              Your Budgets
            </h2>

            <p>
              Monitor how you're using each
              spending limit.
            </p>

          </div>

          <div className="budget-count">

            <strong>
              {budgets.length}
            </strong>

            <span>

              {budgets.length === 1
                ? "Budget"
                : "Budgets"}

            </span>

          </div>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="budget-empty-state">

            <div className="budget-loading-spinner"></div>

            <h3>
              Loading budgets...
            </h3>

            <p>
              Fetching your budget information.
            </p>

          </div>

        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          budgets.length === 0 && (

            <div className="budget-empty-state">

              <div className="budget-empty-icon">
                📊
              </div>

              <h3>
                No budgets yet
              </h3>

              <p>
                Create your first monthly budget
                to start managing your spending.
              </p>

            </div>

          )}

        {/* LIST */}

        {!loading &&
          budgets.length > 0 && (

            <div className="budget-list">

              {budgets.map(
                (budget) => {

                  const budgetValue =
                    Number(
                      budget.budget_amount ||
                      0
                    );

                  const spent =
                    Number(
                      budget.spent || 0
                    );

                  const remaining =
                    Number(
                      budget.remaining ??
                      budgetValue -
                      spent
                    );

                  const utilization =
                    Number(
                      budget.utilization_percentage ??
                      (
                        budgetValue > 0
                          ? (
                            spent /
                            budgetValue
                          ) * 100
                          : 0
                      )
                    );

                  const status =
                    getBudgetStatus(
                      budget
                    );

                  const alert =
                    getBudgetAlert(
                      budget
                    );

                  return (

                    <div
                      className="budget-item"
                      key={budget.id}
                    >

                      {/* TOP */}

                      <div className="budget-item-top">

                        <div className="budget-title">

                          <div className="budget-category-icon">

                            {getCategoryIcon(
                              budget.category
                            )}

                          </div>

                          <div>

                            <h3>

                              {getCategoryName(
                                budget.category
                              )}

                            </h3>

                            <p>

                              {budget.month}{" "}
                              {budget.year}

                            </p>

                          </div>

                        </div>

                        {/* STATUS + ACTIONS */}

                        <div className="budget-item-actions">

                          <span
                            className={`budget-status ${status.className}`}
                          >

                            {status.icon}{" "}
                            {status.text}

                          </span>

                          <button
                            type="button"
                            className="budget-edit-button"
                            onClick={() =>
                              handleEdit(
                                budget
                              )
                            }
                            title="Edit Budget"
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            className="budget-delete-button"
                            onClick={() =>
                              handleDelete(
                                budget
                              )
                            }
                            title="Delete Budget"
                          >
                            🗑️
                          </button>

                        </div>

                      </div>

                      {/* AMOUNTS */}

                      <div className="budget-amount-row">

                        <div>

                          <span>
                            Budget
                          </span>

                          <strong>

                            ₹
                            {formatMoney(
                              budgetValue
                            )}

                          </strong>

                        </div>

                        <div>

                          <span>
                            Spent
                          </span>

                          <strong className="spent-value">

                            ₹
                            {formatMoney(
                              spent
                            )}

                          </strong>

                        </div>

                        <div>

                          <span>
                            Remaining
                          </span>

                          <strong
                            className={
                              remaining < 0
                                ? "negative-value"
                                : "remaining-value"
                            }
                          >

                            ₹
                            {formatMoney(
                              remaining
                            )}

                          </strong>

                        </div>

                      </div>

                      {/* PROGRESS */}

                      <div className="budget-progress-section">

                        <div className="budget-progress-header">

                          <span>
                            Budget utilization
                          </span>

                          <strong>
                            {utilization.toFixed(
                              0
                            )}%
                          </strong>

                        </div>

                        <div className="budget-progress">

                          <div
                            className={`budget-progress-fill ${status.className}`}
                            style={{
                              width: `${Math.min(
                                utilization,
                                100
                              )}%`,
                            }}
                          ></div>

                        </div>

                      </div>

                      {/* BUDGET ALERT */}

                      <div
                        className={`budget-alert-box ${alert.type}`}
                      >

                        <div className="budget-alert-icon">
                          {alert.icon}
                        </div>

                        <div className="budget-alert-content">

                          <strong>
                            {alert.title}
                          </strong>

                          <p>
                            {alert.message}
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>

    </div>
  );
}

export default Budgets;
