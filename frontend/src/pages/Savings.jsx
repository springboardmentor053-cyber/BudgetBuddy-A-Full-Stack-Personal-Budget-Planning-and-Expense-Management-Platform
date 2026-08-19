import { useEffect, useState } from "react";
import axios from "axios";
import "./Savings.css";

function Savings() {

  // =====================================================
  // API
  // =====================================================

  const API = "https://budgetbuddy-backend-l9tv.onrender.com/api/savings/";

  // =====================================================
  // STATE
  // =====================================================

  const [goals, setGoals] = useState([]);

  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [editingGoal, setEditingGoal] = useState(null);

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

  const getHeaders = () => {
    return {
      Authorization: `Bearer ${getToken()}`,
    };
  };

  // =====================================================
  // FETCH GOALS
  // =====================================================

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {

    try {

      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login to view your savings goals.");
        return;
      }

      const response = await axios.get(
        API,
        {
          headers: getHeaders(),
        }
      );

      if (Array.isArray(response.data)) {

        setGoals(response.data);

      } else if (response.data.results) {

        setGoals(response.data.results);

      } else {

        setGoals([]);

      }

    } catch (err) {

      console.error(
        "Savings Fetch Error:",
        err
      );

      if (err.response?.status === 401) {

        setError(
          "Your login session has expired. Please login again."
        );

      } else {

        setError(
          "Unable to load your savings goals."
        );

      }

    } finally {

      setLoading(false);

    }

  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setGoalName("");
    setTargetAmount("");
    setSavedAmount("");
    setTargetDate("");

    setEditingGoal(null);

    setError("");
  };

  // =====================================================
  // BACKEND ERROR MESSAGE
  // =====================================================

  const getBackendError = (err) => {

    if (!err.response?.data) {

      return "Something went wrong. Please try again.";

    }

    const data = err.response.data;

    if (typeof data === "string") {

      return data;

    }

    if (data.detail) {

      return data.detail;

    }

    const messages = Object.values(data)
      .flat()
      .filter(Boolean);

    if (messages.length > 0) {

      return messages.join(" ");

    }

    return "Please check your details and try again.";

  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {

    const target = Number(targetAmount);
    const saved = Number(savedAmount);

    if (!goalName.trim()) {

      setError("Please enter a savings goal name.");

      return false;

    }

    if (target <= 0) {

      setError(
        "Target amount must be greater than ₹0."
      );

      return false;

    }

    if (saved < 0) {

      setError(
        "Saved amount cannot be negative."
      );

      return false;

    }

    if (saved > target) {

      setError(
        "Saved amount cannot be greater than the target amount."
      );

      return false;

    }

    if (!targetDate) {

      setError(
        "Please select a target date."
      );

      return false;

    }

    return true;

  };

  // =====================================================
  // CREATE / UPDATE GOAL
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {

      return;

    }

    try {

      setSubmitting(true);

      const data = {
        goal_name: goalName.trim(),
        target_amount: targetAmount,
        saved_amount: savedAmount,
        target_date: targetDate,
      };

      // =================================================
      // UPDATE
      // =================================================

      if (editingGoal) {

        const response = await axios.put(

          `${API}${editingGoal.id}/`,

          data,

          {
            headers: getHeaders(),
          }

        );

        setGoals(

          goals.map((goal) =>

            goal.id === editingGoal.id
              ? response.data
              : goal

          )

        );

        setSuccess(
          "Savings goal updated successfully!"
        );

      }

      // =================================================
      // CREATE
      // =================================================

      else {

        const response = await axios.post(

          API,

          data,

          {
            headers: getHeaders(),
          }

        );

        setGoals([

          response.data,

          ...goals,

        ]);

        setSuccess(
          "Savings goal created successfully!"
        );

      }

      resetForm();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {

      console.error(
        "Savings Submit Error:",
        err
      );

      setError(
        getBackendError(err)
      );

    } finally {

      setSubmitting(false);

    }

  };

  // =====================================================
  // EDIT GOAL
  // =====================================================

  const handleEdit = (goal) => {

    setEditingGoal(goal);

    setGoalName(
      goal.goal_name || ""
    );

    setTargetAmount(
      goal.target_amount || ""
    );

    setSavedAmount(
      goal.saved_amount || ""
    );

    setTargetDate(
      goal.target_date || ""
    );

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  // =====================================================
  // DELETE GOAL
  // =====================================================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this savings goal?"
    );

    if (!confirmed) {

      return;

    }

    try {

      setError("");
      setSuccess("");

      await axios.delete(

        `${API}${id}/`,

        {
          headers: getHeaders(),
        }

      );

      setGoals(

        goals.filter(
          (goal) => goal.id !== id
        )

      );

      if (
        editingGoal &&
        editingGoal.id === id
      ) {

        resetForm();

      }

      setSuccess(
        "Savings goal deleted successfully!"
      );

    } catch (err) {

      console.error(
        "Savings Delete Error:",
        err
      );

      setError(
        getBackendError(err)
      );

    }

  };

  // =====================================================
  // CATEGORY / GOAL ICON
  // =====================================================

  const getGoalIcon = (name) => {

    const text =
      name?.toLowerCase() || "";

    if (
      text.includes("laptop") ||
      text.includes("computer") ||
      text.includes("phone") ||
      text.includes("mobile")
    ) {
      return "💻";
    }

    if (
      text.includes("car") ||
      text.includes("bike") ||
      text.includes("vehicle")
    ) {
      return "🚗";
    }

    if (
      text.includes("travel") ||
      text.includes("trip") ||
      text.includes("vacation")
    ) {
      return "✈️";
    }

    if (
      text.includes("home") ||
      text.includes("house")
    ) {
      return "🏠";
    }

    if (
      text.includes("education") ||
      text.includes("college") ||
      text.includes("course")
    ) {
      return "🎓";
    }

    if (
      text.includes("emergency")
    ) {
      return "🛡️";
    }

    if (
      text.includes("wedding") ||
      text.includes("marriage")
    ) {
      return "💍";
    }

    return "🎯";

  };

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (value) => {

    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {

      return "No target date";

    }

    const parsedDate =
      new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {

      return date;

    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const totalTarget = goals.reduce(

    (total, goal) =>

      total +
      Number(goal.target_amount || 0),

    0

  );

  const totalSaved = goals.reduce(

    (total, goal) =>

      total +
      Number(goal.saved_amount || 0),

    0

  );

  const totalRemaining = goals.reduce(

    (total, goal) =>

      total +
      Number(
        goal.remaining_amount ??
        Math.max(
          Number(goal.target_amount || 0) -
          Number(goal.saved_amount || 0),
          0
        )
      ),

    0

  );

  const overallProgress =
    totalTarget > 0
      ? Math.min(
          (totalSaved / totalTarget) * 100,
          100
        )
      : 0;

  const completedGoals =
    goals.filter(
      (goal) =>
        goal.status === "COMPLETED"
    ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="savings-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="savings-header">

        <div>

          <span className="savings-eyebrow">
            🎯 SAVINGS PLANNER
          </span>

          <h1>
            Savings Goals
          </h1>

          <p>
            Set financial goals, track your progress,
            and turn your plans into reality.
          </p>

        </div>

      </div>


      {/* =================================================
          ALERTS
      ================================================= */}

      {success && (

        <div className="savings-alert success-alert">

          <span>✅</span>

          <p>
            {success}
          </p>

        </div>

      )}


      {error && (

        <div className="savings-alert error-alert">

          <span>⚠️</span>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={fetchGoals}
          >
            Try Again
          </button>

        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="savings-summary">

        <div className="savings-summary-card">

          <div className="summary-icon purple">
            🎯
          </div>

          <div>

            <span>
              Total Goals
            </span>

            <h2>
              {goals.length}
            </h2>

            <small>
              Financial goals
            </small>

          </div>

        </div>


        <div className="savings-summary-card">

          <div className="summary-icon blue">
            🏦
          </div>

          <div>

            <span>
              Total Target
            </span>

            <h2>
              ₹{formatMoney(totalTarget)}
            </h2>

            <small>
              Planned savings
            </small>

          </div>

        </div>


        <div className="savings-summary-card">

          <div className="summary-icon green">
            💰
          </div>

          <div>

            <span>
              Total Saved
            </span>

            <h2>
              ₹{formatMoney(totalSaved)}
            </h2>

            <small>
              Amount saved
            </small>

          </div>

        </div>


        <div className="savings-summary-card">

          <div className="summary-icon orange">
            📈
          </div>

          <div>

            <span>
              Overall Progress
            </span>

            <h2>
              {overallProgress.toFixed(0)}%
            </h2>

            <small>
              {completedGoals} completed
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          CREATE / EDIT FORM
      ================================================= */}

      <div className="savings-form-panel">

        <div className="savings-form-header">

          <div>

            <span className="section-label">
              {editingGoal
                ? "EDIT GOAL"
                : "NEW SAVINGS GOAL"}
            </span>

            <h2>
              {editingGoal
                ? "Update Savings Goal"
                : "Create Savings Goal"}
            </h2>

            <p>
              {editingGoal
                ? "Update your goal details and keep your savings plan on track."
                : "Define a target and start building your savings."}
            </p>

          </div>

          <div className="form-header-icon">
            {editingGoal ? "✏️" : "🎯"}
          </div>

        </div>


        <form
          className="savings-form"
          onSubmit={handleSubmit}
        >

          {/* GOAL NAME */}

          <div className="savings-form-group">

            <label>
              Goal Name
            </label>

            <input
              type="text"
              placeholder="Example: New Laptop"
              value={goalName}
              onChange={(e) =>
                setGoalName(e.target.value)
              }
              maxLength="100"
              required
            />

          </div>


          {/* TARGET AMOUNT */}

          <div className="savings-form-group">

            <label>
              Target Amount
            </label>

            <div className="money-input">

              <span>
                ₹
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter target amount"
                value={targetAmount}
                onChange={(e) =>
                  setTargetAmount(e.target.value)
                }
                required
              />

            </div>

          </div>


          {/* SAVED AMOUNT */}

          <div className="savings-form-group">

            <label>
              Current Saved Amount
            </label>

            <div className="money-input">

              <span>
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter saved amount"
                value={savedAmount}
                onChange={(e) =>
                  setSavedAmount(e.target.value)
                }
                required
              />

            </div>

          </div>


          {/* TARGET DATE */}

          <div className="savings-form-group">

            <label>
              Target Date
            </label>

            <input
              type="date"
              value={targetDate}
              onChange={(e) =>
                setTargetDate(e.target.value)
              }
              required
            />

          </div>


          {/* BUTTONS */}

          <div className="savings-form-actions">

            <button
              type="submit"
              className="save-goal-button"
              disabled={submitting}
            >

              {submitting

                ? "Saving..."

                : editingGoal
                ? "✏️ Update Goal"
                : "＋ Create Goal"}

            </button>


            {editingGoal && (

              <button
                type="button"
                className="cancel-goal-button"
                onClick={resetForm}
              >
                Cancel
              </button>

            )}

          </div>

        </form>

      </div>


      {/* =================================================
          GOALS LIST
      ================================================= */}

      <div className="savings-list-panel">

        <div className="savings-list-header">

          <div>

            <span className="section-label">
              SAVINGS OVERVIEW
            </span>

            <h2>
              Your Savings Goals
            </h2>

            <p>
              Monitor your progress toward every financial goal.
            </p>

          </div>

          <div className="goal-count">

            <strong>
              {goals.length}
            </strong>

            <span>
              {goals.length === 1
                ? "Goal"
                : "Goals"}
            </span>

          </div>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="savings-empty-state">

            <div className="savings-spinner"></div>

            <h3>
              Loading savings goals...
            </h3>

            <p>
              Fetching your financial goals.
            </p>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          goals.length === 0 && (

            <div className="savings-empty-state">

              <div className="empty-goal-icon">
                🎯
              </div>

              <h3>
                No savings goals yet
              </h3>

              <p>
                Create your first savings goal above
                and start working toward it.
              </p>

            </div>

          )}


        {/* GOALS */}

        {!loading &&
          goals.length > 0 && (

            <div className="savings-goal-list">

              {goals.map((goal) => {

                const target =
                  Number(
                    goal.target_amount || 0
                  );

                const saved =
                  Number(
                    goal.saved_amount || 0
                  );

                const remaining =
                  Number(
                    goal.remaining_amount ??
                    Math.max(
                      target - saved,
                      0
                    )
                  );

                const progress =
                  Number(
                    goal.progress_percentage ??
                    (
                      target > 0
                        ? (saved / target) * 100
                        : 0
                    )
                  );

                const safeProgress =
                  Math.min(
                    Math.max(progress, 0),
                    100
                  );

                const isCompleted =
                  goal.status === "COMPLETED" ||
                  safeProgress >= 100;

                return (

                  <div
                    className="savings-goal-card"
                    key={goal.id}
                  >

                    {/* TOP */}

                    <div className="goal-card-top">

                      <div className="goal-title-area">

                        <div className="goal-icon">
                          {getGoalIcon(
                            goal.goal_name
                          )}
                        </div>

                        <div>

                          <h3>
                            {goal.goal_name}
                          </h3>

                          <p>
                            Target date:{" "}
                            <strong>
                              {formatDate(
                                goal.target_date
                              )}
                            </strong>
                          </p>

                        </div>

                      </div>


                      <div className="goal-actions">

                        <span
                          className={
                            `goal-status ${
                              isCompleted
                                ? "completed-status"
                                : "active-status"
                            }`
                          }
                        >

                          {isCompleted
                            ? "Completed"
                            : "Active"}

                        </span>


                        <button
                          type="button"
                          className="edit-goal-button"
                          onClick={() =>
                            handleEdit(goal)
                          }
                          title="Edit Goal"
                        >
                          ✏️
                        </button>


                        <button
                          type="button"
                          className="delete-goal-button"
                          onClick={() =>
                            handleDelete(
                              goal.id
                            )
                          }
                          title="Delete Goal"
                        >
                          🗑️
                        </button>

                      </div>

                    </div>


                    {/* AMOUNTS */}

                    <div className="goal-amount-row">

                      <div>

                        <span>
                          Target
                        </span>

                        <strong>
                          ₹{formatMoney(target)}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Saved
                        </span>

                        <strong className="saved-value">
                          ₹{formatMoney(saved)}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Remaining
                        </span>

                        <strong className="remaining-value">
                          ₹{formatMoney(remaining)}
                        </strong>

                      </div>

                    </div>


                    {/* PROGRESS */}

                    <div className="goal-progress-section">

                      <div className="goal-progress-header">

                        <span>
                          Savings progress
                        </span>

                        <strong>
                          {safeProgress.toFixed(0)}%
                        </strong>

                      </div>


                      <div className="goal-progress">

                        <div
                          className={
                            `goal-progress-fill ${
                              isCompleted
                                ? "completed-progress"
                                : ""
                            }`
                          }
                          style={{
                            width:
                              `${safeProgress}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* FOOTER */}

                    <div className="goal-footer">

                      <span>
                        {isCompleted
                          ? "🎉 Goal achieved!"
                          : `₹${formatMoney(
                              remaining
                            )} left to reach your goal`}
                      </span>

                      <span>
                        {formatDate(
                          goal.target_date
                        )}
                      </span>

                    </div>

                  </div>

                );

              })}

            </div>

          )}

      </div>

    </div>

  );

}

export default Savings;
