import { useEffect, useState } from "react";
import axios from "axios";

function Expenses() {

  // =========================
  // STATE
  // =========================

  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // Form states
  const [category, setCategory] = useState("FOOD");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  const [submitting, setSubmitting] = useState(false);


  // =========================
  // FETCH EXPENSES
  // =========================

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

      const response = await axios.get(
        "http://127.0.0.1:8000/api/expenses/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle different possible API response formats
      if (Array.isArray(response.data)) {

        setExpenses(response.data);

      } else if (response.data.results) {

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
          "Unable to load expense data."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // =========================
  // ADD / UPDATE EXPENSE
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setSubmitting(true);

    setError("");

    setSuccess("");


    try {

      const token = localStorage.getItem("access");

      if (!token) {

        setError(
          "Please login before adding an expense."
        );

        return;

      }


      const expenseData = {

        category: category,

        amount: amount,

        expense_date: expenseDate,

        description: description,

      };


      // =========================
      // UPDATE EXPENSE
      // =========================

      if (editingId) {

        const response = await axios.put(

          `http://127.0.0.1:8000/api/expenses/${editingId}/`,

          expenseData,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }

        );


        setExpenses(

          expenses.map((expense) =>

            expense.id === editingId

              ? response.data

              : expense

          )

        );


        setSuccess(
          "Expense updated successfully!"
        );


      }

      // =========================
      // ADD EXPENSE
      // =========================

      else {

        const response = await axios.post(

          "http://127.0.0.1:8000/api/expenses/",

          expenseData,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }

        );


        setExpenses([

          response.data,

          ...expenses,

        ]);


        setSuccess(
          "Expense added successfully!"
        );

      }


      // Clear form

      resetForm();


    } catch (error) {

      console.error(
        "Save Expense Error:",
        error
      );


      if (error.response?.data) {

        console.log(
          "Backend Error:",
          error.response.data
        );

      }


      setError(
        "Unable to save expense. Please check your details."
      );

    } finally {

      setSubmitting(false);

    }

  };


  // =========================
  // DELETE EXPENSE
  // =========================

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(

      "Are you sure you want to delete this expense?"

    );


    if (!confirmDelete) {

      return;

    }


    try {

      const token = localStorage.getItem("access");


      await axios.delete(

        `http://127.0.0.1:8000/api/expenses/${id}/`,

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );


      setExpenses(

        expenses.filter(

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


      setError(

        "Unable to delete expense."

      );

    }

  };


  // =========================
  // EDIT EXPENSE
  // =========================

  const handleEdit = (expense) => {

    setEditingId(expense.id);

    setCategory(expense.category);

    setAmount(expense.amount);

    setExpenseDate(expense.expense_date);

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


  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {

    setEditingId(null);

    setCategory("FOOD");

    setAmount("");

    setExpenseDate("");

    setDescription("");

  };


  // =========================
  // CALCULATE TOTAL
  // =========================

  const totalExpense = expenses.reduce(

    (total, expense) =>

      total + Number(expense.amount || 0),

    0

  );


  // =========================
  // CATEGORY ICON
  // =========================

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


  // =========================
  // CATEGORY NAME
  // =========================

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


  // =========================
  // UI
  // =========================

  return (

    <div className="expense-page">


      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-header">

        <div>

          <span className="page-badge">

            💳 EXPENSE TRACKER

          </span>

          <h1>

            Expense Management

          </h1>

          <p>

            Track, categorize, and manage your
            daily expenses.

          </p>

        </div>

      </div>


      {/* =========================
          SUCCESS MESSAGE
      ========================= */}

      {success && (

        <div className="success-message">

          ✅ {success}

        </div>

      )}


      {/* =========================
          ERROR MESSAGE
      ========================= */}

      {error && (

        <div className="error-message">

          ⚠️ {error}

          <button
            onClick={fetchExpenses}
          >

            Try Again

          </button>

        </div>

      )}


      {/* =========================
          SUMMARY
      ========================= */}

      <div className="expense-summary">

        <div className="expense-summary-card">

          <div className="summary-icon">

            💸

          </div>

          <div>

            <span>
              Total Expenses
            </span>

            <h2>

              ₹{totalExpense.toFixed(2)}

            </h2>

          </div>

        </div>


        <div className="expense-summary-card">

          <div className="summary-icon">

            📊

          </div>

          <div>

            <span>
              Transactions
            </span>

            <h2>

              {expenses.length}

            </h2>

          </div>

        </div>

      </div>


      {/* =========================
          ADD / EDIT FORM
      ========================= */}

      <div className="expense-form-panel">

        <div className="form-panel-header">

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

            <div className="select-wrapper">

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

            <div className="amount-input">

              <span>

                ₹

              </span>

              <input

                type="number"

                min="0"

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

              type="date"

              value={expenseDate}

              onChange={(e) =>
                setExpenseDate(e.target.value)
              }

              required

            />

          </div>


          {/* DESCRIPTION */}

          <div className="form-group full-width">

            <label>

              Description

            </label>

            <textarea

              placeholder="Example: Lunch with friends"

              value={description}

              onChange={(e) =>
                setDescription(e.target.value)
              }

              rows="4"

            />

          </div>


          {/* BUTTONS */}

          <div className="form-actions">

            <button

              type="submit"

              className="primary-button"

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

                className="secondary-button"

                onClick={resetForm}

              >

                Cancel

              </button>

            )}

          </div>


        </form>

      </div>


      {/* =========================
          EXPENSE LIST
      ========================= */}

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

            {expenses.length}

            <span>

              Transactions

            </span>

          </div>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="empty-state">

            <div className="loading-icon">

              ⏳

            </div>

            <h3>

              Loading expenses...

            </h3>

            <p>

              Please wait while we fetch your transactions.

            </p>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          expenses.length === 0 && (

            <div className="empty-state">

              <div className="empty-icon">

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


        {/* EXPENSES */}

        {!loading &&
          expenses.length > 0 && (

            <div className="expense-list">

              {expenses.map((expense) => (

                <div

                  className="expense-item"

                  key={expense.id}

                >


                  {/* ICON */}

                  <div className="expense-icon">

                    {getCategoryIcon(
                      expense.category
                    )}

                  </div>


                  {/* DETAILS */}

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


                  {/* DATE */}

                  <div className="expense-date">

                    <span>

                      Date

                    </span>

                    <strong>

                      {expense.expense_date}

                    </strong>

                  </div>


                  {/* AMOUNT */}

                  <div className="expense-amount">

                    <strong>

                      -₹{Number(
                        expense.amount
                      ).toFixed(2)}

                    </strong>

                  </div>


                  {/* ACTIONS */}

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