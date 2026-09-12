import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { getErrorMessage } from "../utils/errorHandler";
import "../styles/savings.css";

function Savings() {
    const [goals, setGoals] = useState([]);

    const [goalName, setGoalName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [savedAmount, setSavedAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");

    const [editingId, setEditingId] = useState(null);

    // =====================================================
    // FETCH SAVINGS GOALS
    // =====================================================

    const fetchGoals = async () => {
        try {
            const response = await api.get("savings/");

            setGoals(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error("Error fetching savings:", error);

            if (error.response?.status !== 401) {
                alert(getErrorMessage(error));
            }
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    // =====================================================
    // FORM VALIDATION + CREATE / UPDATE
    // =====================================================

    const saveGoal = async (e) => {
        e.preventDefault();

        if (!goalName.trim()) {
            alert("Goal name cannot be empty.");
            return;
        }

        if (!targetAmount || Number(targetAmount) <= 0) {
            alert("Target amount must be greater than zero.");
            return;
        }

        if (
            savedAmount === "" ||
            Number(savedAmount) < 0
        ) {
            alert("Saved amount cannot be negative.");
            return;
        }

        if (Number(savedAmount) > Number(targetAmount)) {
            alert(
                "Saved amount cannot be greater than the target amount."
            );
            return;
        }

        if (!targetDate) {
            alert("Target date is required.");
            return;
        }

        const selectedDate = new Date(
            `${targetDate}T00:00:00`
        );

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (isNaN(selectedDate.getTime())) {
            alert("Please enter a valid target date.");
            return;
        }

        if (selectedDate < today) {
            alert("Target date cannot be in the past.");
            return;
        }

        const goalData = {
            goal_name: goalName.trim(),
            target_amount: targetAmount,
            saved_amount: savedAmount,
            target_date: targetDate,
        };

        try {
            if (editingId) {
                await api.put(
                    `savings/${editingId}/`,
                    goalData
                );

                alert(
                    "Savings Goal Updated Successfully"
                );
            } else {
                await api.post(
                    "savings/",
                    goalData
                );

                alert(
                    "Savings Goal Added Successfully"
                );
            }

            clearForm();
            fetchGoals();

        } catch (error) {
            console.error(
                "Savings save error:",
                error
            );

            if (error.response?.status !== 401) {
                alert(getErrorMessage(error));
            }
        }
    };

    // =====================================================
    // EDIT
    // =====================================================

    const editGoal = (goal) => {
        setEditingId(goal.id);

        setGoalName(goal.goal_name);
        setTargetAmount(goal.target_amount);
        setSavedAmount(goal.saved_amount);
        setTargetDate(goal.target_date);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =====================================================
    // DELETE
    // =====================================================

    const deleteGoal = async (id) => {
        if (
            !window.confirm(
                "Delete this savings goal?"
            )
        ) {
            return;
        }

        try {
            await api.delete(
                `savings/${id}/`
            );

            alert(
                "Savings Goal Deleted Successfully"
            );

            fetchGoals();

        } catch (error) {
            console.error(
                "Savings delete error:",
                error
            );

            if (error.response?.status !== 401) {
                alert(getErrorMessage(error));
            }
        }
    };

    // =====================================================
    // CLEAR FORM
    // =====================================================

    const clearForm = () => {
        setGoalName("");
        setTargetAmount("");
        setSavedAmount("");
        setTargetDate("");
        setEditingId(null);
    };

    // =====================================================
    // CURRENCY
    // =====================================================

    const formatCurrency = (value) => {
        return `₹${Number(
            value || 0
        ).toLocaleString("en-IN")}`;
    };

    // =====================================================
    // SUMMARY
    // =====================================================

    const totalTarget = useMemo(() => {
        return goals.reduce(
            (total, goal) =>
                total +
                Number(goal.target_amount || 0),
            0
        );
    }, [goals]);

    const totalSaved = useMemo(() => {
        return goals.reduce(
            (total, goal) =>
                total +
                Number(goal.saved_amount || 0),
            0
        );
    }, [goals]);

    const totalRemaining = useMemo(() => {
        return goals.reduce(
            (total, goal) =>
                total +
                Number(goal.remaining_amount || 0),
            0
        );
    }, [goals]);

    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "No date";
        }

        const parsed = new Date(
            `${date}T00:00:00`
        );

        if (isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // PROGRESS
    // =====================================================

    const getProgress = (goal) => {
        return Math.min(
            Math.max(
                Number(
                    goal.progress_percentage || 0
                ),
                0
            ),
            100
        );
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="savings-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="savings-header">

                <div>

                    <div className="savings-eyebrow">
                        PERSONAL FINANCE
                    </div>

                    <h1>
                        Savings Goals
                    </h1>

                    <p>
                        Set goals, track your progress,
                        and build your financial future.
                    </p>

                </div>

                <div className="savings-header-icon">
                    <i className="bi bi-piggy-bank-fill"></i>
                </div>

            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="savings-summary-grid">

                <div className="savings-summary-card">

                    <div className="savings-summary-icon purple">
                        <i className="bi bi-bullseye"></i>
                    </div>

                    <div>

                        <span>
                            TOTAL TARGET
                        </span>

                        <strong>
                            {formatCurrency(totalTarget)}
                        </strong>

                        <small>
                            Across all goals
                        </small>

                    </div>

                </div>


                <div className="savings-summary-card">

                    <div className="savings-summary-icon green">
                        <i className="bi bi-wallet2"></i>
                    </div>

                    <div>

                        <span>
                            TOTAL SAVED
                        </span>

                        <strong>
                            {formatCurrency(totalSaved)}
                        </strong>

                        <small>
                            Amount saved so far
                        </small>

                    </div>

                </div>


                <div className="savings-summary-card">

                    <div className="savings-summary-icon orange">
                        <i className="bi bi-hourglass-split"></i>
                    </div>

                    <div>

                        <span>
                            REMAINING
                        </span>

                        <strong>
                            {formatCurrency(totalRemaining)}
                        </strong>

                        <small>
                            Still to save
                        </small>

                    </div>

                </div>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <section className="savings-form-card">

                <div className="savings-card-header">

                    <div>

                        <h2>
                            {editingId
                                ? "Update Savings Goal"
                                : "Create Savings Goal"}
                        </h2>

                        <p>
                            {editingId
                                ? "Update the details of your savings goal."
                                : "Create a target and start tracking your progress."}
                        </p>

                    </div>

                    <div className="savings-form-icon">
                        <i
                            className={
                                editingId
                                    ? "bi bi-pencil-square"
                                    : "bi bi-plus-lg"
                            }
                        ></i>
                    </div>

                </div>


                <form
                    className="savings-form"
                    onSubmit={saveGoal}
                >

                    {/* GOAL NAME */}

                    <div className="savings-field">

                        <label>
                            Goal Name
                        </label>

                        <div className="savings-input-wrapper">

                            <i className="bi bi-flag"></i>

                            <input
                                type="text"
                                placeholder="e.g. New Laptop"
                                value={goalName}
                                onChange={(e) =>
                                    setGoalName(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>

                    </div>


                    {/* TARGET */}

                    <div className="savings-field">

                        <label>
                            Target Amount
                        </label>

                        <div className="savings-input-wrapper">

                            <i className="bi bi-currency-rupee"></i>

                            <input
                                type="number"
                                placeholder="Enter target amount"
                                value={targetAmount}
                                onChange={(e) =>
                                    setTargetAmount(
                                        e.target.value
                                    )
                                }
                                min="0.01"
                                step="0.01"
                                required
                            />

                        </div>

                    </div>


                    {/* SAVED */}

                    <div className="savings-field">

                        <label>
                            Amount Already Saved
                        </label>

                        <div className="savings-input-wrapper">

                            <i className="bi bi-wallet2"></i>

                            <input
                                type="number"
                                placeholder="Enter saved amount"
                                value={savedAmount}
                                onChange={(e) =>
                                    setSavedAmount(
                                        e.target.value
                                    )
                                }
                                min="0"
                                step="0.01"
                                required
                            />

                        </div>

                    </div>


                    {/* DATE */}

                    <div className="savings-field">

                        <label>
                            Target Date
                        </label>

                        <div className="savings-input-wrapper">

                            <i className="bi bi-calendar3"></i>

                            <input
                                type="date"
                                value={targetDate}
                                onChange={(e) =>
                                    setTargetDate(
                                        e.target.value
                                    )
                                }
                                min={
                                    new Date()
                                        .toISOString()
                                        .split("T")[0]
                                }
                                required
                            />

                        </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="savings-form-actions">

                        <button
                            type="submit"
                            className="savings-primary-btn"
                        >

                            <i
                                className={
                                    editingId
                                        ? "bi bi-check-lg"
                                        : "bi bi-plus-lg"
                                }
                            ></i>

                            {editingId
                                ? "Update Goal"
                                : "Create Goal"}

                        </button>


                        {editingId && (

                            <button
                                type="button"
                                className="savings-cancel-btn"
                                onClick={clearForm}
                            >

                                <i className="bi bi-x-lg"></i>

                                Cancel

                            </button>

                        )}

                    </div>

                </form>

            </section>


            {/* =================================================
                GOALS HEADER
            ================================================= */}

            <div className="savings-goals-heading">

                <div>

                    <h2>
                        Your Goals
                    </h2>

                    <p>
                        {goals.length === 0
                            ? "Create your first savings goal."
                            : `${goals.length} savings ${
                                goals.length === 1
                                    ? "goal"
                                    : "goals"
                            }`}
                    </p>

                </div>

                <div className="savings-goal-count">
                    {goals.length}
                </div>

            </div>


            {/* =================================================
                GOALS
            ================================================= */}

            {goals.length > 0 ? (

                <div className="savings-goals-grid">

                    {goals.map((goal) => {

                        const progress =
                            getProgress(goal);

                        const completed =
                            progress >= 100;

                        return (

                            <article
                                className="savings-goal-card"
                                key={goal.id}
                            >

                                {/* CARD TOP */}

                                <div className="savings-goal-top">

                                    <div className="savings-goal-icon">

                                        <i
                                            className={
                                                completed
                                                    ? "bi bi-check-circle-fill"
                                                    : "bi bi-piggy-bank-fill"
                                            }
                                        ></i>

                                    </div>

                                    <div className="savings-goal-actions">

                                        <button
                                            type="button"
                                            className="savings-edit-btn"
                                            onClick={() =>
                                                editGoal(
                                                    goal
                                                )
                                            }
                                            title="Edit goal"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>

                                        <button
                                            type="button"
                                            className="savings-delete-btn"
                                            onClick={() =>
                                                deleteGoal(
                                                    goal.id
                                                )
                                            }
                                            title="Delete goal"
                                        >
                                            <i className="bi bi-trash3"></i>
                                        </button>

                                    </div>

                                </div>


                                {/* NAME */}

                                <div className="savings-goal-title">

                                    <h3>
                                        {goal.goal_name}
                                    </h3>

                                    <span
                                        className={
                                            completed
                                                ? "savings-status completed"
                                                : "savings-status active"
                                        }
                                    >

                                        <i
                                            className={
                                                completed
                                                    ? "bi bi-check-circle"
                                                    : "bi bi-clock"
                                            }
                                        ></i>

                                        {completed
                                            ? "Completed"
                                            : "In Progress"}

                                    </span>

                                </div>


                                {/* AMOUNTS */}

                                <div className="savings-amount-row">

                                    <div>

                                        <span>
                                            SAVED
                                        </span>

                                        <strong className="saved">
                                            {formatCurrency(
                                                goal.saved_amount
                                            )}
                                        </strong>

                                    </div>


                                    <div className="savings-target-amount">

                                        <span>
                                            TARGET
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                goal.target_amount
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                {/* PROGRESS */}

                                <div className="savings-progress-section">

                                    <div className="savings-progress-header">

                                        <span>
                                            Progress
                                        </span>

                                        <strong>
                                            {Number(
                                                goal.progress_percentage ||
                                                0
                                            ).toFixed(0)}
                                            %
                                        </strong>

                                    </div>

                                    <div className="savings-progress-track">

                                        <div
                                            className={
                                                completed
                                                    ? "savings-progress-fill completed"
                                                    : "savings-progress-fill"
                                            }
                                            style={{
                                                width: `${progress}%`,
                                            }}
                                        ></div>

                                    </div>

                                </div>


                                {/* DETAILS */}

                                <div className="savings-details">

                                    <div>

                                        <span>
                                            <i className="bi bi-calendar3"></i>
                                            Target Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                goal.target_date
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            <i className="bi bi-hourglass-split"></i>
                                            Remaining
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                goal.remaining_amount
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                {/* FOOTER */}

                                <div
                                    className={
                                        completed
                                            ? "savings-goal-footer completed"
                                            : "savings-goal-footer"
                                    }
                                >

                                    <i
                                        className={
                                            completed
                                                ? "bi bi-trophy-fill"
                                                : "bi bi-lightbulb-fill"
                                        }
                                    ></i>

                                    <span>
                                        {completed
                                            ? "Congratulations! You reached your goal."
                                            : "Keep saving — you're making progress."}
                                    </span>

                                </div>

                            </article>

                        );
                    })}

                </div>

            ) : (

                <div className="savings-empty">

                    <div className="savings-empty-icon">
                        <i className="bi bi-piggy-bank"></i>
                    </div>

                    <h3>
                        No Savings Goals Yet
                    </h3>

                    <p>
                        Create your first goal above
                        and start building your savings.
                    </p>

                </div>

            )}

        </div>
    );
}

export default Savings;