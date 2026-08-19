import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { getErrorMessage } from "../utils/errorHandler";
import "../styles/budget.css";

function Budget() {
    const [budgets, setBudgets] = useState([]);
    const [filteredBudgets, setFilteredBudgets] = useState([]);

    const [category, setCategory] = useState("FOOD");
    const [amount, setAmount] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());

    const [search, setSearch] = useState("");

    // =====================================================
    // FETCH BUDGETS
    // =====================================================

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const response = await api.get("budgets/");

            setBudgets(response.data);
            setFilteredBudgets(response.data);

        } catch (error) {
            console.error("Error fetching budgets:", error);

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

        if (!query) {
            setFilteredBudgets(budgets);
            return;
        }

        const filtered = budgets.filter((budget) =>
            budget.category
                ?.toLowerCase()
                .includes(query) ||

            String(budget.month)
                .includes(query) ||

            String(budget.year)
                .includes(query)
        );

        setFilteredBudgets(filtered);

    }, [search, budgets]);

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

        return icons[value] || "bi-pie-chart-fill";
    };

    // =====================================================
    // CURRENCY
    // =====================================================

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    };

    // =====================================================
    // SUMMARY
    // =====================================================

    const totalBudget = useMemo(() => {
        return budgets.reduce(
            (total, budget) =>
                total + Number(
                    budget.budget_amount ??
                    budget.amount ??
                    budget.limit ??
                    0
                ),
            0
        );
    }, [budgets]);

    const averageBudget = useMemo(() => {
        if (!budgets.length) {
            return 0;
        }

        return totalBudget / budgets.length;
    }, [budgets, totalBudget]);

    // =====================================================
    // MONTH NAME
    // =====================================================

    const getMonthName = (value) => {
        const monthNumber = Number(value);

        if (!monthNumber) {
            return "Not set";
        }

        return new Date(
            2000,
            monthNumber - 1,
            1
        ).toLocaleString("en-IN", {
            month: "long",
        });
    };

    // =====================================================
    // ADD BUDGET
    // =====================================================

    const addBudget = async (e) => {
        e.preventDefault();

        if (!category) {
            alert("Please select a category.");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            alert("Budget amount must be greater than zero.");
            return;
        }

        if (!month) {
            alert("Please select a month.");
            return;
        }

        if (!year) {
            alert("Please select a year.");
            return;
        }

        const exists = budgets.some(
            (budget) =>
                budget.category === category &&
                Number(budget.month) === Number(month) &&
                Number(budget.year) === Number(year)
        );

        if (exists) {
            alert(
                "A budget already exists for this category and month."
            );
            return;
        }

        try {
            await api.post("budgets/", {
                category,
                amount,
                month: Number(month),
                year: Number(year),
            });

            alert("Budget Created Successfully");

            setAmount("");
            setMonth("");

            fetchBudgets();

        } catch (error) {
            console.error("Budget creation error:", error);

            if (error.response?.status !== 401) {
                alert(getErrorMessage(error));
            }
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const deleteBudget = async (id) => {
        if (!window.confirm("Delete this budget?")) {
            return;
        }

        try {
            await api.delete(`budgets/${id}/`);

            alert("Budget Deleted Successfully");

            fetchBudgets();

        } catch (error) {
            console.error("Budget deletion error:", error);

            if (error.response?.status !== 401) {
                alert(getErrorMessage(error));
            }
        }
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="budget-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="budget-header">

                <div>

                    <div className="budget-eyebrow">
                        PERSONAL FINANCE
                    </div>

                    <h1>
                        Budget Planning
                    </h1>

                    <p>
                        Plan your spending and stay in control
                        of your monthly finances.
                    </p>

                </div>

                <div className="budget-header-icon">
                    <i className="bi bi-pie-chart-fill"></i>
                </div>

            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="budget-summary-grid">

                <div className="budget-summary-card">

                    <div className="budget-summary-icon purple">
                        <i className="bi bi-wallet2"></i>
                    </div>

                    <div>

                        <span>
                            TOTAL BUDGET
                        </span>

                        <strong>
                            {formatCurrency(totalBudget)}
                        </strong>

                        <small>
                            Across all categories
                        </small>

                    </div>

                </div>


                <div className="budget-summary-card">

                    <div className="budget-summary-icon blue">
                        <i className="bi bi-grid-3x3-gap-fill"></i>
                    </div>

                    <div>

                        <span>
                            ACTIVE BUDGETS
                        </span>

                        <strong>
                            {budgets.length}
                        </strong>

                        <small>
                            Budget categories
                        </small>

                    </div>

                </div>


                <div className="budget-summary-card">

                    <div className="budget-summary-icon green">
                        <i className="bi bi-calculator-fill"></i>
                    </div>

                    <div>

                        <span>
                            AVERAGE BUDGET
                        </span>

                        <strong>
                            {formatCurrency(averageBudget)}
                        </strong>

                        <small>
                            Per category
                        </small>

                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="budget-content-grid">

                {/* =================================================
                    CREATE FORM
                ================================================= */}

                <section className="budget-form-card">

                    <div className="budget-card-header">

                        <div>

                            <h2>
                                Create Budget
                            </h2>

                            <p>
                                Set a spending limit for a category.
                            </p>

                        </div>

                        <div className="budget-form-icon">
                            <i className="bi bi-plus-lg"></i>
                        </div>

                    </div>


                    <form
                        className="budget-form"
                        onSubmit={addBudget}
                    >

                        {/* CATEGORY */}

                        <div className="budget-field">

                            <label>
                                Category
                            </label>

                            <div className="budget-input-wrapper">

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


                        {/* AMOUNT */}

                        <div className="budget-field">

                            <label>
                                Budget Amount
                            </label>

                            <div className="budget-input-wrapper">

                                <i className="bi bi-currency-rupee"></i>

                                <input
                                    type="number"
                                    placeholder="Enter budget amount"
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


                        {/* MONTH */}

                        <div className="budget-field">

                            <label>
                                Month
                            </label>

                            <div className="budget-input-wrapper">

                                <i className="bi bi-calendar3"></i>

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

                                    <option value="1">
                                        January
                                    </option>

                                    <option value="2">
                                        February
                                    </option>

                                    <option value="3">
                                        March
                                    </option>

                                    <option value="4">
                                        April
                                    </option>

                                    <option value="5">
                                        May
                                    </option>

                                    <option value="6">
                                        June
                                    </option>

                                    <option value="7">
                                        July
                                    </option>

                                    <option value="8">
                                        August
                                    </option>

                                    <option value="9">
                                        September
                                    </option>

                                    <option value="10">
                                        October
                                    </option>

                                    <option value="11">
                                        November
                                    </option>

                                    <option value="12">
                                        December
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* YEAR */}

                        <div className="budget-field">

                            <label>
                                Year
                            </label>

                            <div className="budget-input-wrapper">

                                <i className="bi bi-calendar-event"></i>

                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) =>
                                        setYear(
                                            e.target.value
                                        )
                                    }
                                    min="2020"
                                    max="2100"
                                    required
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="budget-primary-btn"
                        >

                            <i className="bi bi-plus-lg"></i>

                            Create Budget

                        </button>

                    </form>

                </section>


                {/* =================================================
                    BUDGET OVERVIEW
                ================================================= */}

                <section className="budget-history-card">

                    <div className="budget-card-header">

                        <div>

                            <h2>
                                Budget Overview
                            </h2>

                            <p>
                                Review your planned spending limits.
                            </p>

                        </div>

                        <span className="budget-count">
                            {filteredBudgets.length}
                        </span>

                    </div>


                    {/* SEARCH */}

                    <div className="budget-search">

                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search budgets..."
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


                    {/* BUDGET LIST */}

                    <div className="budget-list">

                        {filteredBudgets.length > 0 ? (

                            filteredBudgets.map(
                                (budget) => (

                                    <div
                                        className="budget-row"
                                        key={budget.id}
                                    >

                                        <div className="budget-row-main">

                                            <div className="budget-category-icon">

                                                <i className={
                                                    `bi ${getCategoryIcon(
                                                        budget.category
                                                    )}`
                                                }></i>

                                            </div>

                                            <div className="budget-row-info">

                                                <strong>
                                                    {
                                                        getCategoryLabel(
                                                            budget.category
                                                        )
                                                    }
                                                </strong>

                                                <span>
                                                    {getMonthName(
                                                        budget.month
                                                    )} {budget.year}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="budget-row-right">

                                            <div className="budget-amount">

                                                <strong>
                                                    {formatCurrency(
                                                        budget.budget_amount ??
                                                        budget.amount ??
                                                        budget.limit ??
                                                        0
                                                    )}
                                                </strong>

                                                <span>
                                                    Monthly limit
                                                </span>

                                            </div>


                                            <button
                                                type="button"
                                                className="budget-delete-btn"
                                                onClick={() =>
                                                    deleteBudget(
                                                        budget.id
                                                    )
                                                }
                                                title="Delete budget"
                                            >

                                                <i className="bi bi-trash3"></i>

                                            </button>

                                        </div>

                                    </div>

                                )
                            )

                        ) : (

                            <div className="budget-empty">

                                <div className="budget-empty-icon">

                                    <i className="bi bi-pie-chart"></i>

                                </div>

                                <h3>
                                    No Budgets Found
                                </h3>

                                <p>
                                    {search
                                        ? "No budgets match your search."
                                        : "Create your first budget to start planning."
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

export default Budget;