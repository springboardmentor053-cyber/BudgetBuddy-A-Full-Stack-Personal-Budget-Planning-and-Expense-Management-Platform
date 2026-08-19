import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { getErrorMessage } from "../utils/errorHandler";
import "../styles/income.css";

function Income() {
    const [incomeList, setIncomeList] = useState([]);
    const [filteredIncome, setFilteredIncome] = useState([]);

    const [title, setTitle] = useState("");
    const [source, setSource] = useState("SALARY");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [incomeDate, setIncomeDate] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");

    // =====================================================
    // FETCH INCOME
    // =====================================================

    useEffect(() => {
        fetchIncome();
    }, []);

    const fetchIncome = async () => {
        try {
            const response = await api.get("income/");

            setIncomeList(response.data);
            setFilteredIncome(response.data);
        } catch (error) {
            console.error("Error fetching income:", error);

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

        const filtered = incomeList.filter((income) =>
            income.title?.toLowerCase().includes(query) ||
            income.source?.toLowerCase().includes(query) ||
            income.description?.toLowerCase().includes(query)
        );

        setFilteredIncome(filtered);
    }, [search, incomeList]);

    // =====================================================
    // SUMMARY
    // =====================================================

    const totalIncome = useMemo(() => {
        return incomeList.reduce(
            (total, income) =>
                total + Number(income.amount || 0),
            0
        );
    }, [incomeList]);

    const latestIncome = useMemo(() => {
        if (!incomeList.length) return null;

        return [...incomeList].sort(
            (a, b) =>
                new Date(b.income_date) -
                new Date(a.income_date)
        )[0];
    }, [incomeList]);

    // =====================================================
    // SOURCE LABEL
    // =====================================================

    const getSourceLabel = (value) => {
        const labels = {
            SALARY: "Salary",
            POCKET_MONEY: "Pocket Money",
            SCHOLARSHIP: "Scholarship",
            FREELANCING: "Freelancing",
            BUSINESS: "Business",
            OTHER: "Other",
        };

        return labels[value] || value;
    };

    // =====================================================
    // SOURCE ICON
    // =====================================================

    const getSourceIcon = (value) => {
        const icons = {
            SALARY: "bi-wallet2",
            POCKET_MONEY: "bi-cash-coin",
            SCHOLARSHIP: "bi-mortarboard",
            FREELANCING: "bi-laptop",
            BUSINESS: "bi-briefcase",
            OTHER: "bi-three-dots",
        };

        return icons[value] || "bi-wallet2";
    };

    // =====================================================
    // EDIT
    // =====================================================

    const editIncome = (income) => {
        setEditingId(income.id);

        setTitle(income.title);
        setSource(income.source);
        setDescription(income.description || "");
        setAmount(income.amount);
        setIncomeDate(income.income_date);

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
        setSource("SALARY");
        setDescription("");
        setAmount("");
        setIncomeDate("");
    };

    // =====================================================
    // SAVE
    // =====================================================

    const saveIncome = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Title cannot be empty.");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            alert("Amount must be greater than zero.");
            return;
        }

        if (!source) {
            alert("Income source is required.");
            return;
        }

        if (!incomeDate) {
            alert("Income date is required.");
            return;
        }

        const incomeData = {
            title: title.trim(),
            amount,
            source,
            description,
            income_date: incomeDate,
        };

        try {
            if (editingId) {
                await api.put(
                    `income/${editingId}/`,
                    incomeData
                );

                alert("Income Updated Successfully");
            } else {
                await api.post(
                    "income/",
                    incomeData
                );

                alert("Income Added Successfully");
            }

            clearForm();
            fetchIncome();

        } catch (error) {
            console.error(
                "Income save error:",
                error
            );

            if (error.response?.status !== 401) {
                alert(getErrorMessage(error));
            }
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const deleteIncome = async (id) => {
        if (!window.confirm("Delete this income?")) {
            return;
        }

        try {
            await api.delete(`income/${id}/`);

            alert("Income Deleted Successfully");

            fetchIncome();

        } catch (error) {
            console.error(
                "Income delete error:",
                error
            );

            if (error.response?.status !== 401) {
                alert(getErrorMessage(error));
            }
        }
    };

    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="income-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="income-header">

                <div>
                    <div className="income-eyebrow">
                        PERSONAL FINANCE
                    </div>

                    <h1>
                        Income
                    </h1>

                    <p>
                        Track and manage all your income
                        sources in one place.
                    </p>
                </div>

                <div className="income-header-icon">
                    <i className="bi bi-wallet2"></i>
                </div>

            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="income-summary-grid">

                <div className="income-summary-card">

                    <div className="income-summary-icon green">
                        <i className="bi bi-cash-stack"></i>
                    </div>

                    <div>
                        <span>
                            TOTAL INCOME
                        </span>

                        <strong>
                            {formatCurrency(totalIncome)}
                        </strong>

                        <small>
                            All recorded income
                        </small>
                    </div>

                </div>


                <div className="income-summary-card">

                    <div className="income-summary-icon blue">
                        <i className="bi bi-list-check"></i>
                    </div>

                    <div>
                        <span>
                            INCOME RECORDS
                        </span>

                        <strong>
                            {incomeList.length}
                        </strong>

                        <small>
                            Total transactions
                        </small>
                    </div>

                </div>


                <div className="income-summary-card">

                    <div className="income-summary-icon purple">
                        <i className="bi bi-calendar-check"></i>
                    </div>

                    <div>
                        <span>
                            LATEST INCOME
                        </span>

                        <strong>
                            {latestIncome
                                ? formatCurrency(
                                    latestIncome.amount
                                )
                                : "₹0"
                            }
                        </strong>

                        <small>
                            {latestIncome
                                ? getSourceLabel(
                                    latestIncome.source
                                )
                                : "No records yet"
                            }
                        </small>
                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="income-content-grid">

                {/* =================================================
                    FORM
                ================================================= */}

                <section className="income-form-card">

                    <div className="income-card-header">

                        <div>
                            <h2>
                                {editingId
                                    ? "Update Income"
                                    : "Add Income"
                                }
                            </h2>

                            <p>
                                {editingId
                                    ? "Update the selected income record."
                                    : "Add a new source of income."
                                }
                            </p>
                        </div>

                        <div className="income-form-icon">
                            <i className={
                                editingId
                                    ? "bi bi-pencil-square"
                                    : "bi bi-plus-lg"
                            }></i>
                        </div>

                    </div>


                    <form
                        className="income-form"
                        onSubmit={saveIncome}
                    >

                        {/* TITLE */}

                        <div className="income-field">

                            <label>
                                Income Title
                            </label>

                            <div className="income-input-wrapper">

                                <i className="bi bi-card-text"></i>

                                <input
                                    type="text"
                                    placeholder="e.g. Monthly Salary"
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


                        {/* SOURCE */}

                        <div className="income-field">

                            <label>
                                Income Source
                            </label>

                            <div className="income-input-wrapper">

                                <i className="bi bi-tag"></i>

                                <select
                                    value={source}
                                    onChange={(e) =>
                                        setSource(
                                            e.target.value
                                        )
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

                        <div className="income-field">

                            <label>
                                Amount
                            </label>

                            <div className="income-input-wrapper">

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


                        {/* DATE */}

                        <div className="income-field">

                            <label>
                                Income Date
                            </label>

                            <div className="income-input-wrapper">

                                <i className="bi bi-calendar3"></i>

                                <input
                                    type="date"
                                    value={incomeDate}
                                    onChange={(e) =>
                                        setIncomeDate(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="income-field">

                            <label>
                                Description
                                <span>
                                    Optional
                                </span>
                            </label>

                            <textarea
                                placeholder="Add a short description..."
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                rows="4"
                            />

                        </div>


                        {/* ACTIONS */}

                        <div className="income-form-actions">

                            <button
                                type="submit"
                                className="income-primary-btn"
                            >

                                <i className={
                                    editingId
                                        ? "bi bi-check-lg"
                                        : "bi bi-plus-lg"
                                }></i>

                                {editingId
                                    ? "Update Income"
                                    : "Add Income"
                                }

                            </button>


                            {editingId && (
                                <button
                                    type="button"
                                    className="income-secondary-btn"
                                    onClick={clearForm}
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>

                </section>


                {/* =================================================
                    HISTORY
                ================================================= */}

                <section className="income-history-card">

                    <div className="income-history-header">

                        <div>
                            <h2>
                                Income History
                            </h2>

                            <p>
                                Your recent income transactions
                            </p>
                        </div>

                        <span className="income-count">
                            {filteredIncome.length}
                        </span>

                    </div>


                    {/* SEARCH */}

                    <div className="income-search">

                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search income..."
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

                    <div className="income-table-wrapper">

                        {filteredIncome.length > 0 ? (

                            <table className="income-table">

                                <thead>

                                    <tr>

                                        <th>
                                            INCOME
                                        </th>

                                        <th>
                                            SOURCE
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

                                    {filteredIncome.map(
                                        (income) => (

                                            <tr
                                                key={income.id}
                                            >

                                                <td>

                                                    <div className="income-title-cell">

                                                        <div className="income-row-icon">

                                                            <i className={
                                                                `bi ${getSourceIcon(
                                                                    income.source
                                                                )}`
                                                            }></i>

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {income.title}
                                                            </strong>

                                                            {income.description && (
                                                                <small>
                                                                    {
                                                                        income.description
                                                                    }
                                                                </small>
                                                            )}

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span className="income-source-badge">

                                                        {
                                                            getSourceLabel(
                                                                income.source
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <strong className="income-amount">

                                                        {
                                                            formatCurrency(
                                                                income.amount
                                                            )
                                                        }

                                                    </strong>

                                                </td>


                                                <td>

                                                    <span className="income-date">

                                                        <i className="bi bi-calendar3"></i>

                                                        {income.income_date}

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="income-actions">

                                                        <button
                                                            type="button"
                                                            className="income-edit-btn"
                                                            onClick={() =>
                                                                editIncome(
                                                                    income
                                                                )
                                                            }
                                                            title="Edit"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="income-delete-btn"
                                                            onClick={() =>
                                                                deleteIncome(
                                                                    income.id
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

                            <div className="income-empty">

                                <div className="income-empty-icon">
                                    <i className="bi bi-wallet2"></i>
                                </div>

                                <h3>
                                    No Income Records
                                </h3>

                                <p>
                                    {search
                                        ? "No income matches your search."
                                        : "Add your first income to get started."
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

export default Income;