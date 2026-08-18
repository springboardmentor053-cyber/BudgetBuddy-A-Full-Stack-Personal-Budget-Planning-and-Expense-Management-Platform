import { useEffect, useState } from "react";
import api from "../api";
import { getErrorMessage } from "../utils/errorHandler";


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

      const response = await api.get(
        "savings/"
      );

      setGoals(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Error fetching savings:",
        error
      );

      if (
        error.response?.status !== 401
      ) {

        alert(
          getErrorMessage(error)
        );

      }

    }

  };


  // =====================================================
  // LOAD GOALS
  // =====================================================

  useEffect(() => {

    fetchGoals();

  }, []);


  // =====================================================
  // ADD / UPDATE SAVINGS GOAL
  // =====================================================

  const saveGoal = async (e) => {

    e.preventDefault();


    // ===================================================
    // FRONTEND VALIDATION
    // ===================================================

    if (!goalName.trim()) {

      alert(
        "Goal name cannot be empty."
      );

      return;

    }


    if (
      !targetAmount ||
      Number(targetAmount) <= 0
    ) {

      alert(
        "Target amount must be greater than zero."
      );

      return;

    }


    if (
      savedAmount === "" ||
      Number(savedAmount) < 0
    ) {

      alert(
        "Saved amount cannot be negative."
      );

      return;

    }


    if (
      Number(savedAmount) >
      Number(targetAmount)
    ) {

      alert(
        "Saved amount cannot be greater than the target amount."
      );

      return;

    }


    if (!targetDate) {

      alert(
        "Target date is required."
      );

      return;

    }


    // ===================================================
    // DATE VALIDATION
    // ===================================================

    const selectedDate =
      new Date(
        `${targetDate}T00:00:00`
      );

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );


    if (
      isNaN(
        selectedDate.getTime()
      )
    ) {

      alert(
        "Please enter a valid target date."
      );

      return;

    }


    if (
      selectedDate < today
    ) {

      alert(
        "Target date cannot be in the past."
      );

      return;

    }


    // ===================================================
    // DATA
    // ===================================================

    const goalData = {

      goal_name:
        goalName.trim(),

      target_amount:
        targetAmount,

      saved_amount:
        savedAmount,

      target_date:
        targetDate,

    };


    // ===================================================
    // API REQUEST
    // =====================================================

    try {

      // =================================================
      // UPDATE
      // =================================================

      if (editingId) {

        await api.put(

          `savings/${editingId}/`,

          goalData

        );

        alert(
          "Savings Goal Updated Successfully"
        );

      }


      // =================================================
      // CREATE
      // =================================================

      else {

        await api.post(

          "savings/",

          goalData

        );

        alert(
          "Savings Goal Added Successfully"
        );

      }


      // =================================================
      // CLEAR FORM
      // =================================================

      setGoalName("");

      setTargetAmount("");

      setSavedAmount("");

      setTargetDate("");

      setEditingId(null);


      // =================================================
      // REFRESH
      // =================================================

      fetchGoals();

    } catch (error) {

      console.error(
        "Savings save error:",
        error
      );


      if (
        error.response?.status !== 401
      ) {

        alert(
          getErrorMessage(error)
        );

      }

    }

  };


  // =====================================================
  // EDIT SAVINGS GOAL
  // =====================================================

  const editGoal = (goal) => {

    setEditingId(
      goal.id
    );

    setGoalName(
      goal.goal_name
    );

    setTargetAmount(
      goal.target_amount
    );

    setSavedAmount(
      goal.saved_amount
    );

    setTargetDate(
      goal.target_date
    );


    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };


  // =====================================================
  // DELETE SAVINGS GOAL
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


      if (
        error.response?.status !== 401
      ) {

        alert(
          getErrorMessage(error)
        );

      }

    }

  };


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEdit = () => {

    setEditingId(null);

    setGoalName("");

    setTargetAmount("");

    setSavedAmount("");

    setTargetDate("");

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <>

      <div className="container mt-5">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="card shadow-lg border-0 bg-success text-white mb-4">

          <div className="card-body">

            <h2>
              💰 Savings Goal Management
            </h2>

            <p className="mb-0">

              Track your financial goals
              efficiently.

            </p>

          </div>

        </div>


        {/* ================================================= */}
        {/* ADD / UPDATE FORM */}
        {/* ================================================= */}

        <div className="card shadow mb-4">

          <div className="card-body">

            <h4 className="mb-4">

              {editingId
                ? "✏ Update Savings Goal"
                : "➕ Add New Savings Goal"}

            </h4>


            <form
              onSubmit={saveGoal}
            >


              {/* GOAL NAME */}

              <input

                type="text"

                className="form-control mb-3"

                placeholder="Goal Name"

                value={goalName}

                onChange={(e) =>
                  setGoalName(
                    e.target.value
                  )
                }

                required

              />


              {/* TARGET AMOUNT */}

              <input

                type="number"

                className="form-control mb-3"

                placeholder="Target Amount"

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


              {/* SAVED AMOUNT */}

              <input

                type="number"

                className="form-control mb-3"

                placeholder="Saved Amount"

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


              {/* TARGET DATE */}

              <input

                type="date"

                className="form-control mb-3"

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


              {/* SAVE BUTTON */}

              <button

                type="submit"

                className="btn btn-success w-100 fw-bold"

              >

                {editingId
                  ? "✏ Update Goal"
                  : "➕ Add Goal"}

              </button>


              {/* CANCEL */}

              {editingId && (

                <button

                  type="button"

                  className="btn btn-secondary w-100 mt-2"

                  onClick={
                    cancelEdit
                  }

                >

                  Cancel Edit

                </button>

              )}

            </form>

          </div>

        </div>


        {/* ================================================= */}
        {/* SAVINGS GOALS */}
        {/* ================================================= */}

        <div className="row">

          {goals.length > 0 ? (

            goals.map(
              (goal) => (

                <div

                  className="col-md-6 col-lg-4 mb-4"

                  key={goal.id}

                >

                  <div className="card shadow border-0 h-100">

                    <div className="card-body">


                      {/* GOAL NAME */}

                      <h4 className="text-success">

                        {goal.goal_name}

                      </h4>


                      <hr />


                      {/* TARGET */}

                      <p>

                        <strong>
                          🎯 Target:
                        </strong>

                        <br />

                        ₹{" "}

                        {Number(
                          goal.target_amount
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </p>


                      {/* SAVED */}

                      <p>

                        <strong>
                          💰 Saved:
                        </strong>

                        <br />

                        ₹{" "}

                        {Number(
                          goal.saved_amount
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </p>


                      {/* REMAINING */}

                      <p>

                        <strong>
                          💵 Remaining:
                        </strong>

                        <br />

                        ₹{" "}

                        {Number(
                          goal.remaining_amount
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </p>


                      {/* TARGET DATE */}

                      <p>

                        <strong>
                          📅 Target Date:
                        </strong>

                        <br />

                        {goal.target_date}

                      </p>


                      {/* PROGRESS */}

                      <p>

                        <strong>
                          📈 Progress:
                        </strong>

                        <br />

                        {Number(
                          goal.progress_percentage
                        ).toFixed(2)}%

                      </p>


                      {/* PROGRESS BAR */}

                      <div
                        className="progress mb-3"
                        style={{
                          height: "20px",
                        }}
                      >

                        <div

                          className="progress-bar bg-success"

                          role="progressbar"

                          style={{
                            width: `${Math.min(
                              Number(
                                goal.progress_percentage
                              ) || 0,
                              100
                            )}%`,
                          }}

                        >

                          {Number(
                            goal.progress_percentage
                          ).toFixed(0)}%

                        </div>

                      </div>


                      {/* STATUS */}

                      {Number(
                        goal.progress_percentage
                      ) >= 100 ? (

                        <div className="alert alert-success py-2">

                          🎉 Goal Completed!

                        </div>

                      ) : (

                        <div className="alert alert-info py-2">

                          💪 Keep Saving!

                        </div>

                      )}


                      {/* EDIT */}

                      <button

                        type="button"

                        className="btn btn-warning me-2"

                        onClick={() =>
                          editGoal(
                            goal
                          )
                        }

                      >

                        ✏ Edit

                      </button>


                      {/* DELETE */}

                      <button

                        type="button"

                        className="btn btn-danger"

                        onClick={() =>
                          deleteGoal(
                            goal.id
                          )
                        }

                      >

                        🗑 Delete

                      </button>


                    </div>

                  </div>

                </div>

              )

            )

          ) : (

            <div className="col-12">

              <div className="alert alert-info">

                📭 No Savings Goals Found

              </div>

            </div>

          )}

        </div>


      </div>

    </>

  );

}


export default Savings;