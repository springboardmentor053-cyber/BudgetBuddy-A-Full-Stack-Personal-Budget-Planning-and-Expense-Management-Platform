import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { getErrorMessage } from "../utils/errorHandler";
import "../styles/expenses.css";

function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("FOOD");
    const [date, setDate] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");

    // =====================================================
    // FETCH EXPENSES
    // =====================================================

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await api.get("expenses/");

            setExpenses(response.data);
            setFilteredExpenses(response.data);

        } catch (error) {
            console.error(
                "Error fetching expenses:",
                error
            );

            if (error.response?.status !== 401) {
                alert(getErrorMessage(error));
            }
        }
    };

    // =====================================================
    // SEARCH
    // =====================================================

    useEffect(() => {
        const query = search.toLowerCase().trim();

        const filtered = expenses.filter((expense) =>
            expense.title
                ?.toLowerCase()
                .includes(query) ||

            expense.category
                ?.toLowerCase()
                .includes(query)
        );

        setFilteredExpenses(filtered);

    }, [search, expenses]);

    // =====================================================
    // SUMMARY
    // =====================================================

    const totalExpenses = useMemo(() => {
        return expenses.reduce(
            (total, expense) =>
                total + Number(expense.amount || 0),
            0
        );
    }, [expenses]);

    const topCategory = useMemo(() => {
        if (!expenses.length) {
            return null;
        }

        const categoryTotals = {};

        expenses.forEach((expense) => {
            const category = expense.category || "OTHER";

            categoryTotals[category] =
                (categoryTotals[category] || 0) +
                Number(expense.amount || 0);
        });

        return Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])[0];
    }, [expenses]);

    // =====================================================
    // CATEGORY LABEL
    // =====================================================

    const getCategoryLabel = (value) => {
        const labels = {
            FOOD: "Food",
            TRAVEL: "Travel",
            SHOPPING: "Shopping",
            EDUCATION: "Education",
            ENTERTAINMENT: "Entertainment",
            HEALTHCARE: "Healthcare",
            BILLS: "Bills",
            MISCELLANEOUS: "Miscellaneous",
        };

        return labels[value] || value;
    };

    // =====================================================
    // CATEGORY ICON
    // =====================================================

    const getCategoryIcon = (value) => {
        const icons = {
            FOOD: "bi-cup-hot-fill",
            TRAVEL: "bi-airplane-fill",
            SHOPPING: "bi-bag-fill",
            EDUCATION: "bi-book-fill",
            ENTERTAINMENT: "bi-controller",
            HEALTHCARE: "bi-heart-pulse-fill",
            BILLS: "bi-receipt",
            MISCELLANEOUS: "bi-three-dots",
        };

        return icons[value] || "bi-receipt";
    };

    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    };

    // =====================================================
    // EDIT EXPENSE
    // =====================================================

    const editExpense = (expense) => {
        setEditingId(expense.id);

        setTitle(expense.title);
        setAmount(expense.amount);
        setCategory(expense.category);
        setDate(expense.date);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =====================================================
    // CLEAR FORM
    // =====================================================

    const clearForm = () => {
        setEditingId(null);
        setTitle("");
        setAmount("");
        setCategory("FOOD");
        setDate("");
    };

    // =====================================================
    // SAVE EXPENSE
    // =====================================================

    const saveExpense = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Title cannot be empty.");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            alert("Amount must be greater than zero.");
            return;
        }

        if (!category) {
            alert("Expense category is required.");
            return;
        }

        if (!date) {
            alert("Expense date is required.");
            return;
        }

        const expenseData = {
            title: title.trim(),
            amount,
            category,
            date,
        };

        try {
            if (editingId) {
                await api.put(
                    `expenses/${editingId}/`,
                    expenseData
                );

                alert("Expense Updated Successfully");
            } else {
                await api.post(
                    "expenses/",
                    expenseData
                );

                alert("Expense Added Successfully");
            }

            clearForm();
            fetchExpenses();

        } catch (error) {
            console.error(
                "Expense save error:",
                error
            );

            if (error.response?.status !== 401) {
                alert(getErrorMessage(error));
            }
        }
    };

    // =====================================================
    // DELETE EXPENSE
    // =====================================================

    const deleteExpense = async (id) => {
        if (!window.confirm("Delete this expense?")) {
            return;
        }

        try {
            await api.delete(`expenses/${id}/`);

            alert("Expense Deleted Successfully");

            fetchExpenses();

        } catch (error) {
            console.error(
                "Expense delete error:",
                error
            );

            if (error.response?.status !== 401) {
                alert(getErrorMessage(error));
            }
        }
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="expenses-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="expenses-header">

                <div>
                    <div className="expenses-eyebrow">
                        PERSONAL FINANCE
                    </div>

                    <h1>
                        Expenses
                    </h1>

                    <p>
                        Track and manage your spending
                        in one organized place.
                    </p>
                </div>

                <div className="expenses-header-icon">
                    <i className="bi bi-receipt-cutoff"></i>
                </div>

            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="expenses-summary-grid">

                <div className="expenses-summary-card">

                    <div className="expenses-summary-icon red">
                        <i className="bi bi-credit-card-2-front-fill"></i>
                    </div>

                    <div>
                        <span>
                            TOTAL EXPENSES
                        </span>

                        <strong>
                            {formatCurrency(totalExpenses)}
                        </strong>

                        <small>
                            All recorded expenses
                        </small>
                    </div>

                </div>


                <div className="expenses-summary-card">

                    <div className="expenses-summary-icon blue">
                        <i className="bi bi-list-check"></i>
                    </div>

                    <div>
                        <span>
                            EXPENSE RECORDS
                        </span>

                        <strong>
                            {expenses.length}
                        </strong>

                        <small>
                            Total transactions
                        </small>
                    </div>

                </div>


                <div className="expenses-summary-card">

                    <div className="expenses-summary-icon orange">
                        <i className="bi bi-bar-chart-fill"></i>
                    </div>

                    <div>
                        <span>
                            TOP CATEGORY
                        </span>

                        <strong className="category-summary">
                            {topCategory
                                ? getCategoryLabel(
                                    topCategory[0]
                                )
                                : "No data"
                            }
                        </strong>

                        <small>
                            {topCategory
                                ? formatCurrency(
                                    topCategory[1]
                                )
                                : "Add an expense"
                            }
                        </small>
                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="expenses-content-grid">

                {/* =================================================
                    FORM
                ================================================= */}

                <section className="expenses-form-card">

                    <div className="expenses-card-header">

                        <div>
                            <h2>
                                {editingId
                                    ? "Update Expense"
                                    : "Add Expense"
                                }
                            </h2>

                            <p>
                                {editingId
                                    ? "Update the selected expense."
                                    : "Record a new expense."
                                }
                            </p>
                        </div>

                        <div className="expenses-form-icon">
                            <i className={
                                editingId
                                    ? "bi bi-pencil-square"
                                    : "bi bi-plus-lg"
                            }></i>
                        </div>

                    </div>


                    <form
                        className="expenses-form"
                        onSubmit={saveExpense}
                    >

                        {/* TITLE */}

                        <div className="expenses-field">

                            <label>
                                Expense Title
                            </label>

                            <div className="expenses-input-wrapper">

                                <i className="bi bi-card-text"></i>

                                <input
                                    type="text"
                                    placeholder="e.g. Grocery Shopping"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* AMOUNT */}

                        <div className="expenses-field">

                            <label>
                                Amount
                            </label>

                            <div className="expenses-input-wrapper">

                                <i className="bi bi-currency-rupee"></i>

                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(
                                            e.target.value
                                        )
                                    }
                                    min="0.01"
                                    step="0.01"
                                    required
                                />

                            </div>

                        </div>


                        {/* CATEGORY */}

                        <div className="expenses-field">

                            <label>
                                Category
                            </label>

                            <div className="expenses-input-wrapper">

                                <i className="bi bi-grid"></i>

                                <select
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(
                                            e.target.value
                                        )
                                    }
                                    required
                                >

                                    <option value="FOOD">
                                        Food
                                    </option>

                                    <option value="TRAVEL">
                                        Travel
                                    </option>

                                    <option value="SHOPPING">
                                        Shopping
                                    </option>

                                    <option value="EDUCATION">
                                        Education
                                    </option>

                                    <option value="ENTERTAINMENT">
                                        Entertainment
                                    </option>

                                    <option value="HEALTHCARE">
                                        Healthcare
                                    </option>

                                    <option value="BILLS">
                                        Bills
                                    </option>

                                    <option value="MISCELLANEOUS">
                                        Miscellaneous
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* DATE */}

                        <div className="expenses-field">

                            <label>
                                Expense Date
                            </label>

                            <div className="expenses-input-wrapper">

                                <i className="bi bi-calendar3"></i>

                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) =>
                                        setDate(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="expenses-form-actions">

                            <button
                                type="submit"
                                className="expenses-primary-btn"
                            >

                                <i className={
                                    editingId
                                        ? "bi bi-check-lg"
                                        : "bi bi-plus-lg"
                                }></i>

                                {editingId
                                    ? "Update Expense"
                                    : "Add Expense"
                                }

                            </button>


                            {editingId && (
                                <button
                                    type="button"
                                    className="expenses-secondary-btn"
                                    onClick={clearForm}
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>

                </section>


                {/* =================================================
                    EXPENSE HISTORY
                ================================================= */}

                <section className="expenses-history-card">

                    <div className="expenses-history-header">

                        <div>
                            <h2>
                                Expense History
                            </h2>

                            <p>
                                Your recent spending activity
                            </p>
                        </div>

                        <span className="expenses-count">
                            {filteredExpenses.length}
                        </span>

                    </div>


                    {/* SEARCH */}

                    <div className="expenses-search">

                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        )}

                    </div>


                    {/* TABLE */}

                    <div className="expenses-table-wrapper">

                        {filteredExpenses.length > 0 ? (

                            <table className="expenses-table">

                                <thead>

                                    <tr>

                                        <th>
                                            EXPENSE
                                        </th>

                                        <th>
                                            CATEGORY
                                        </th>

                                        <th>
                                            AMOUNT
                                        </th>

                                        <th>
                                            DATE
                                        </th>

                                        <th>
                                            ACTIONS
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredExpenses.map(
                                        (expense) => (

                                            <tr
                                                key={expense.id}
                                            >

                                                <td>

                                                    <div className="expense-title-cell">

                                                        <div className="expense-row-icon">

                                                            <i className={
                                                                `bi ${getCategoryIcon(
                                                                    expense.category
                                                                )}`
                                                            }></i>

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {expense.title}
                                                            </strong>

                                                            <small>
                                                                {
                                                                    getCategoryLabel(
                                                                        expense.category
                                                                    )
                                                                }
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span className={
                                                        `expense-category-badge category-${expense.category?.toLowerCase()}`
                                                    }>

                                                        <i className={
                                                            `bi ${getCategoryIcon(
                                                                expense.category
                                                            )}`
                                                        }></i>

                                                        {
                                                            getCategoryLabel(
                                                                expense.category
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <strong className="expense-amount">

                                                        {formatCurrency(
                                                            expense.amount
                                                        )}

                                                    </strong>

                                                </td>


                                                <td>

                                                    <span className="expense-date">

                                                        <i className="bi bi-calendar3"></i>

                                                        {expense.date}

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="expense-actions">

                                                        <button
                                                            type="button"
                                                            className="expense-edit-btn"
                                                            onClick={() =>
                                                                editExpense(
                                                                    expense
                                                                )
                                                            }
                                                            title="Edit"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="expense-delete-btn"
                                                            onClick={() =>
                                                                deleteExpense(
                                                                    expense.id
                                                                )
                                                            }
                                                            title="Delete"
                                                        >
                                                            <i className="bi bi-trash3"></i>
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        ) : (

                            <div className="expenses-empty">

                                <div className="expenses-empty-icon">
                                    <i className="bi bi-receipt"></i>
                                </div>

                                <h3>
                                    No Expense Records
                                </h3>

                                <p>
                                    {search
                                        ? "No expenses match your search."
                                        : "Add your first expense to get started."
                                    }
                                </p>

                            </div>

                        )}

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Expenses;