import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/savingsGoals.css";

function SavingsGoals() {
  const [goals, setGoals] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    target_amount: "",
    saved_amount: "",
    target_date: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getTokenConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });

  // ============================================================
  // FETCH SAVINGS GOALS
  // ============================================================

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "budgets/savings-goals/",
        getTokenConfig()
      );

      setGoals(response.data);
    } catch (err) {
      console.error("Error fetching savings goals:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load savings goals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // ============================================================
  // HANDLE FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setFormData({
      title: "",
      target_amount: "",
      saved_amount: "",
      target_date: "",
      description: "",
    });

    setEditingId(null);
  };

  // ============================================================
  // CREATE / UPDATE SAVINGS GOAL
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.title || !formData.target_amount) {
      setError(
        "Please enter a goal title and target amount."
      );
      return;
    }

    const payload = {
      ...formData,
      saved_amount: formData.saved_amount || "0.00",
      target_date: formData.target_date || null,
    };

    try {
      if (editingId) {
        await api.put(
          `budgets/savings-goals/${editingId}/`,
          payload,
          getTokenConfig()
        );
      } else {
        await api.post(
          "budgets/savings-goals/",
          payload,
          getTokenConfig()
        );
      }

      resetForm();
      fetchGoals();
    } catch (err) {
      console.error("Error saving savings goal:", err);

      const backendData = err.response?.data;

      setError(
        backendData?.detail ||
          backendData?.message ||
          backendData?.title?.[0] ||
          backendData?.target_amount?.[0] ||
          "Unable to save savings goal."
      );
    }
  };

  // ============================================================
  // EDIT SAVINGS GOAL
  // ============================================================

  const handleEdit = (goal) => {
    setEditingId(goal.id);

    setFormData({
      title: goal.title || "",
      target_amount: goal.target_amount || "",
      saved_amount: goal.saved_amount || "",
      target_date: goal.target_date || "",
      description: goal.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // DELETE SAVINGS GOAL
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this savings goal?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `budgets/savings-goals/${id}/`,
        getTokenConfig()
      );

      fetchGoals();
    } catch (err) {
      console.error("Error deleting savings goal:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete savings goal."
      );
    }
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="savings-main">
        <header className="savings-header">
          <p className="dashboard-eyebrow">
            Savings goals
          </p>

          <h1>Build Your Financial Future</h1>

          <p>
            Create goals, track your progress, and stay motivated.
          </p>
        </header>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="savings-grid">

          {/* ==================================================
              CREATE / UPDATE FORM
          ================================================== */}

          <div className="savings-form-card">
            <h2>
              {editingId
                ? "Update Goal"
                : "Create Savings Goal"}
            </h2>

            <form onSubmit={handleSubmit}>

              <label>Goal Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: New laptop"
              />

              <label>Target Amount</label>

              <input
                type="number"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                placeholder="Enter target amount"
                min="0"
                step="0.01"
              />

              <label>Amount Saved</label>

              <input
                type="number"
                name="saved_amount"
                value={formData.saved_amount}
                onChange={handleChange}
                placeholder="Enter amount saved"
                min="0"
                step="0.01"
              />

              <label>Target Date</label>

              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
              />

              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add a note about your goal"
                rows="4"
              />

              <div className="savings-form-actions">

                <button type="submit">
                  {editingId
                    ? "Update Goal"
                    : "Create Goal"}
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

          {/* ==================================================
              SAVINGS GOALS LIST
          ================================================== */}

          <div className="savings-list-card">

            <div className="savings-list-header">

              <div>
                <h2>Your Savings Goals</h2>

                <p>
                  Track progress toward your targets
                </p>
              </div>

              <span>
                {goals.length} goals
              </span>

            </div>

            {loading ? (

              <p className="savings-state">
                Loading savings goals...
              </p>

            ) : goals.length === 0 ? (

              <p className="savings-state">
                No savings goals created yet.
              </p>

            ) : (

              <div className="goal-card-list">

                {goals.map((goal) => {

                  const progress = Number(
                    goal.progress_percentage || 0
                  );

                  return (
                    <article
                      className="goal-card"
                      key={goal.id}
                    >

                      {/* GOAL HEADER */}

                      <div className="goal-card-top">

                        <div>

                          <h3>
                            {goal.title}
                          </h3>

                          <p>
                            {goal.target_date
                              ? `Target: ${goal.target_date}`
                              : "No target date"}
                          </p>

                        </div>

                        <span className="goal-percentage">
                          {progress.toFixed(0)}%
                        </span>

                      </div>

                      {/* AMOUNTS */}

                      <div className="goal-amounts">

                        <div>
                          <span>Saved</span>

                          <strong>
                            ₹
                            {Number(
                              goal.saved_amount
                            ).toFixed(2)}
                          </strong>
                        </div>

                        <div>
                          <span>Target</span>

                          <strong>
                            ₹
                            {Number(
                              goal.target_amount
                            ).toFixed(2)}
                          </strong>
                        </div>

                        <div>
                          <span>Remaining</span>

                          <strong>
                            ₹
                            {Number(
                              goal.remaining_amount
                            ).toFixed(2)}
                          </strong>
                        </div>

                      </div>

                      {/* PROGRESS BAR */}

                      <div className="goal-progress-track">

                        <div
                          className="goal-progress-fill"
                          style={{
                            width: `${Math.min(
                              progress,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                      {/* DESCRIPTION */}

                      {goal.description && (
                        <p className="goal-description">
                          {goal.description}
                        </p>
                      )}

                      {/* ACTION BUTTONS */}

                      <div className="goal-actions">

                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(goal)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(goal.id)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}

export default SavingsGoals;