import { useEffect, useState } from "react";

import {
  FaPlus,
  FaBullseye,
  FaPiggyBank,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import api from "../services/api";


function Savings() {

  // =========================================================
  // STATE
  // =========================================================

  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingGoal, setEditingGoal] = useState(null);

  const [deleteGoal, setDeleteGoal] = useState(null);

  const [saving, setSaving] = useState(false);


  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    goal_name: "",
    target_amount: "",
    saved_amount: "0",
    deadline: "",
  });


  // =========================================================
  // AUTH CONFIG
  // =========================================================

  const getConfig = () => {

    const token = localStorage.getItem("access");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };


  // =========================================================
  // CALCULATE GOAL PROGRESS
  // =========================================================

  const prepareGoal = (goal) => {

    const target = Number(
      goal.target_amount || 0
    );

    const saved = Number(
      goal.saved_amount || 0
    );

    const remaining = Math.max(
      target - saved,
      0
    );

    const progress =
      target > 0
        ? Math.min(
            (saved / target) * 100,
            100
          )
        : 0;

    const status =
      saved >= target
        ? "COMPLETED"
        : "IN_PROGRESS";

    return {
      ...goal,
      remaining_amount: remaining,
      progress_percentage: progress,
      status: status,
    };
  };


  // =========================================================
  // FETCH GOALS
  // =========================================================

  const fetchGoals = async () => {

    try {

      setError("");

      const response = await api.get(
        "savings/",
        getConfig()
      );

      const savingsGoals =
        Array.isArray(response.data)
          ? response.data
          : [];

      /*
       * IMPORTANT:
       *
       * We no longer make a separate
       * /progress/ request for every goal.
       *
       * Progress is calculated immediately
       * from target_amount and saved_amount.
       */

      const preparedGoals =
        savingsGoals.map(
          prepareGoal
        );

      setGoals(preparedGoals);

    } catch (err) {

      console.error(
        "Savings fetch error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load savings goals."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {

    fetchGoals();

  }, []);


  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddForm = () => {

    setEditingGoal(null);

    setFormData({
      goal_name: "",
      target_amount: "",
      saved_amount: "0",
      deadline: "",
    });

    setError("");

    setShowForm(true);

  };


  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const openEditForm = (goal) => {

    setEditingGoal(goal);

    setFormData({
      goal_name:
        goal.goal_name || "",

      target_amount:
        goal.target_amount || "",

      saved_amount:
        goal.saved_amount ?? "0",

      deadline:
        goal.deadline || "",
    });

    setError("");

    setShowForm(true);

  };


  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {

    if (saving) {
      return;
    }

    setShowForm(false);

    setEditingGoal(null);

    setError("");

  };


  // =========================================================
  // ADD / UPDATE GOAL
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setSaving(true);

    setError("");


    try {

      const data = {

        goal_name:
          formData.goal_name.trim(),

        target_amount:
          formData.target_amount,

        saved_amount:
          formData.saved_amount || "0",

        deadline:
          formData.deadline,

      };


      // =====================================================
      // UPDATE EXISTING GOAL
      // =====================================================

      if (editingGoal) {

        const response =
          await api.put(
            `savings/${editingGoal.id}/`,
            data,
            getConfig()
          );

        /*
         * Update only this goal.
         *
         * DO NOT call fetchGoals().
         */

        const updatedGoal =
          prepareGoal(
            response.data
          );

        setGoals((previousGoals) =>
          previousGoals.map((goal) =>
            goal.id === editingGoal.id
              ? updatedGoal
              : goal
          )
        );

      }


      // =====================================================
      // CREATE NEW GOAL
      // =====================================================

      else {

        const response =
          await api.post(
            "savings/",
            data,
            getConfig()
          );

        /*
         * Add the new goal directly
         * to the existing list.
         */

        const newGoal =
          prepareGoal(
            response.data
          );

        setGoals((previousGoals) => [
          newGoal,
          ...previousGoals,
        ]);

      }


      // =====================================================
      // CLOSE FORM IMMEDIATELY
      // =====================================================

      setShowForm(false);

      setEditingGoal(null);

      setFormData({
        goal_name: "",
        target_amount: "",
        saved_amount: "0",
        deadline: "",
      });

    } catch (err) {

      console.error(
        "Savings save error:",
        err
      );

      const responseData =
        err.response?.data;


      if (responseData) {

        if (
          typeof responseData ===
          "object"
        ) {

          const messages =
            Object.entries(
              responseData
            )
              .map(
                ([field, message]) => {

                  if (
                    Array.isArray(
                      message
                    )
                  ) {

                    return `${field}: ${message.join(
                      ", "
                    )}`;

                  }

                  return `${field}: ${message}`;

                }
              )
              .join(" | ");

          setError(messages);

        } else {

          setError(
            String(responseData)
          );

        }

      } else {

        setError(
          "Unable to save savings goal."
        );

      }

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // DELETE GOAL
  // =========================================================

  const confirmDelete = async () => {

    if (!deleteGoal) {
      return;
    }

    setSaving(true);

    setError("");


    try {

      await api.delete(
        `savings/${deleteGoal.id}/`,
        getConfig()
      );


      /*
       * Remove the goal directly from the UI.
       *
       * DO NOT call fetchGoals().
       */

      setGoals((previousGoals) =>
        previousGoals.filter(
          (goal) =>
            goal.id !== deleteGoal.id
        )
      );


      setDeleteGoal(null);

    } catch (err) {

      console.error(
        "Savings delete error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to delete savings goal."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // MONEY FORMAT
  // =========================================================

  const formatMoney = (amount) => {

    return Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );

  };


  // =========================================================
  // TOTAL TARGET
  // =========================================================

  const totalTarget =
    goals.reduce(
      (total, goal) =>
        total +
        Number(
          goal.target_amount || 0
        ),
      0
    );


  // =========================================================
  // TOTAL SAVED
  // =========================================================

  const totalSaved =
    goals.reduce(
      (total, goal) =>
        total +
        Number(
          goal.saved_amount || 0
        ),
      0
    );


  // =========================================================
  // TOTAL REMAINING
  // =========================================================

  const totalRemaining =
    Math.max(
      totalTarget -
        totalSaved,
      0
    );


  // =========================================================
  // OVERALL PROGRESS
  // =========================================================

  const overallProgress =
    totalTarget > 0
      ? Math.min(
          (
            totalSaved /
            totalTarget
          ) * 100,
          100
        )
      : 0;


  // =========================================================
  // COMPLETED GOALS
  // =========================================================

  const completedGoals =
    goals.filter(
      (goal) =>
        goal.status ===
        "COMPLETED"
    ).length;


  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (
    dateString
  ) => {

    if (!dateString) {
      return "-";
    }

    const date =
      new Date(dateString);

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="min-h-screen bg-slate-50 flex">


      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div className="w-[280px] bg-slate-950 text-white flex-shrink-0">

        <Sidebar />

      </div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 min-w-0">

        <Topbar />


        <main className="p-6 md:p-8">


          {/* =================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

            <div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">

                Savings Goals

              </h1>

              <p className="text-slate-500 mt-2">

                Set goals, track your progress,
                and build your savings.

              </p>

            </div>


            <button
              onClick={openAddForm}
              className="
                cursor-pointer
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-xl
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                font-semibold
                shadow-md
                hover:shadow-lg
                transition-all
                duration-300
              "
            >

              <FaPlus />

              Add Savings Goal

            </button>

          </div>


          {/* =================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">

              <div className="flex items-start justify-between gap-4">

                <p className="text-sm font-medium">

                  {error}

                </p>


                <button
                  onClick={() =>
                    setError("")
                  }
                  className="
                    cursor-pointer
                    text-rose-500
                    hover:text-rose-700
                  "
                >

                  <FaTimes />

                </button>

              </div>

            </div>

          )}


          {/* =================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">


            {/* TOTAL TARGET */}

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">

                    Total Target

                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">

                    ₹{formatMoney(
                      totalTarget
                    )}

                  </h2>

                </div>


                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">

                  <FaBullseye className="text-indigo-600 text-xl" />

                </div>

              </div>

            </div>


            {/* TOTAL SAVED */}

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">

                    Total Saved

                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">

                    ₹{formatMoney(
                      totalSaved
                    )}

                  </h2>

                </div>


                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">

                  <FaPiggyBank className="text-emerald-600 text-xl" />

                </div>

              </div>

            </div>


            {/* REMAINING */}

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">

                    Remaining

                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">

                    ₹{formatMoney(
                      totalRemaining
                    )}

                  </h2>

                </div>


                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">

                  <FaCalendarAlt className="text-violet-600 text-xl" />

                </div>

              </div>

            </div>


            {/* PROGRESS */}

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">

                    Overall Progress

                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">

                    {overallProgress.toFixed(2)}%

                  </h2>

                </div>


                <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center">

                  <FaCheckCircle className="text-cyan-600 text-xl" />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              OVERALL PROGRESS
          ================================================== */}

          {goals.length > 0 && (

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">

              <div className="flex justify-between items-center mb-3">

                <div>

                  <h2 className="text-xl font-bold text-slate-800">

                    Overall Savings Progress

                  </h2>

                  <p className="text-sm text-slate-500 mt-1">

                    {completedGoals} of{" "}
                    {goals.length} goals completed

                  </p>

                </div>


                <span className="font-bold text-indigo-600">

                  {overallProgress.toFixed(2)}%

                </span>

              </div>


              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className="
                    h-full
                    rounded-full
                    bg-indigo-600
                    transition-all
                    duration-700
                  "
                  style={{
                    width:
                      `${overallProgress}%`,
                  }}
                ></div>

              </div>

            </div>

          )}


          {/* =================================================
              SAVINGS GOALS
          ================================================== */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

            <div className="p-6 border-b border-slate-100">

              <h2 className="text-2xl font-bold text-slate-800">

                Your Savings Goals

              </h2>

              <p className="text-sm text-slate-500 mt-1">

                Track each goal and see how
                close you are to achieving it.

              </p>

            </div>


            {/* LOADING */}

            {loading ? (

              <div className="min-h-[300px] flex flex-col items-center justify-center">

                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>

                <p className="text-slate-500 mt-4">

                  Loading savings goals...

                </p>

              </div>

            ) : goals.length === 0 ? (

              <div className="min-h-[350px] flex flex-col items-center justify-center text-center p-8">

                <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-5">

                  <FaBullseye className="text-3xl text-indigo-500" />

                </div>


                <h3 className="text-xl font-bold text-slate-800">

                  No Savings Goals Yet

                </h3>


                <p className="text-slate-500 mt-2 max-w-md">

                  Create your first savings goal
                  and start working toward it.

                </p>


                <button
                  onClick={openAddForm}
                  className="
                    cursor-pointer
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    px-5
                    py-3
                    rounded-xl
                    bg-indigo-600
                    hover:bg-indigo-700
                    text-white
                    font-semibold
                    transition
                  "
                >

                  <FaPlus />

                  Create First Goal

                </button>

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {goals.map(
                  (goal) => (

                    <SavingsGoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={openEditForm}
                      onDelete={setDeleteGoal}
                      formatMoney={formatMoney}
                      formatDate={formatDate}
                    />

                  )
                )}

              </div>

            )}

          </div>

        </main>

      </div>


      {/* =====================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="
              absolute
              inset-0
              bg-slate-950/60
              backdrop-blur-sm
            "
            onClick={closeForm}
          ></div>


          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">

              <div>

                <h2 className="text-2xl font-bold text-slate-800">

                  {editingGoal
                    ? "Edit Savings Goal"
                    : "Add Savings Goal"}

                </h2>

                <p className="text-sm text-slate-500 mt-1">

                  {editingGoal
                    ? "Update your savings goal."
                    : "Create a new goal to start saving."}

                </p>

              </div>


              <button
                onClick={closeForm}
                className="
                  cursor-pointer
                  w-10
                  h-10
                  rounded-xl
                  bg-slate-100
                  hover:bg-slate-200
                  text-slate-500
                  flex
                  items-center
                  justify-center
                  transition
                "
              >

                <FaTimes />

              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                {/* GOAL NAME */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">

                    Goal Name

                  </label>

                  <input
                    type="text"
                    name="goal_name"
                    value={
                      formData.goal_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. New Laptop"
                    required
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-slate-200
                      focus:outline-none
                      focus:ring-2
                      focus:ring-indigo-500
                      focus:border-transparent
                    "
                  />

                </div>


                {/* TARGET */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">

                    Target Amount

                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">

                      ₹

                    </span>

                    <input
                      type="number"
                      name="target_amount"
                      value={
                        formData.target_amount
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="60000"
                      min="0.01"
                      step="0.01"
                      required
                      className="
                        w-full
                        pl-9
                        pr-4
                        py-3
                        rounded-xl
                        border
                        border-slate-200
                        focus:outline-none
                        focus:ring-2
                        focus:ring-indigo-500
                        focus:border-transparent
                      "
                    />

                  </div>

                </div>


                {/* SAVED */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">

                    Already Saved

                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">

                      ₹

                    </span>

                    <input
                      type="number"
                      name="saved_amount"
                      value={
                        formData.saved_amount
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      className="
                        w-full
                        pl-9
                        pr-4
                        py-3
                        rounded-xl
                        border
                        border-slate-200
                        focus:outline-none
                        focus:ring-2
                        focus:ring-indigo-500
                        focus:border-transparent
                      "
                    />

                  </div>

                </div>


                {/* DEADLINE */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">

                    Deadline

                  </label>

                  <input
                    type="date"
                    name="deadline"
                    value={
                      formData.deadline
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-slate-200
                      focus:outline-none
                      focus:ring-2
                      focus:ring-indigo-500
                      focus:border-transparent
                    "
                  />

                </div>

              </div>


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-slate-100">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="
                    cursor-pointer
                    px-5
                    py-3
                    rounded-xl
                    border
                    border-slate-200
                    text-slate-600
                    hover:bg-slate-50
                    font-semibold
                    transition
                  "
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="
                    cursor-pointer
                    px-6
                    py-3
                    rounded-xl
                    bg-indigo-600
                    hover:bg-indigo-700
                    text-white
                    font-semibold
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  {saving
                    ? "Saving..."
                    : editingGoal
                      ? "Update Goal"
                      : "Save Goal"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {deleteGoal && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

          <div
            className="
              absolute
              inset-0
              bg-slate-950/60
              backdrop-blur-sm
            "
            onClick={() => {

              if (!saving) {
                setDeleteGoal(null);
              }

            }}
          ></div>


          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-7">

            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mb-5">

              <FaTrash className="text-rose-600 text-xl" />

            </div>


            <h2 className="text-2xl font-bold text-slate-800">

              Delete Savings Goal?

            </h2>


            <p className="text-slate-500 mt-2 leading-relaxed">

              Are you sure you want to delete{" "}

              <span className="font-semibold text-slate-700">

                "{deleteGoal.goal_name}"

              </span>

              ?

              <br />

              This action cannot be undone.

            </p>


            <div className="flex justify-end gap-3 mt-7">

              <button
                onClick={() =>
                  setDeleteGoal(null)
                }
                disabled={saving}
                className="
                  cursor-pointer
                  px-5
                  py-3
                  rounded-xl
                  border
                  border-slate-200
                  text-slate-600
                  hover:bg-slate-50
                  font-semibold
                  transition
                "
              >

                Cancel

              </button>


              <button
                onClick={
                  confirmDelete
                }
                disabled={saving}
                className="
                  cursor-pointer
                  px-5
                  py-3
                  rounded-xl
                  bg-rose-600
                  hover:bg-rose-700
                  text-white
                  font-semibold
                  transition
                  disabled:opacity-50
                "
              >

                {saving
                  ? "Deleting..."
                  : "Yes, Delete"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


// =========================================================
// SAVINGS GOAL CARD
// =========================================================

function SavingsGoalCard({
  goal,
  onEdit,
  onDelete,
  formatMoney,
  formatDate,
}) {

  const target =
    Number(
      goal.target_amount || 0
    );

  const saved =
    Number(
      goal.saved_amount || 0
    );

  const remaining =
    Math.max(
      target - saved,
      0
    );

  const progress =
    target > 0
      ? Math.min(
          (saved / target) * 100,
          100
        )
      : 0;

  const completed =
    saved >= target;


  // =========================================================
  // PROGRESS COLOR
  // =========================================================

  let progressColor =
    "bg-indigo-600";

  if (completed) {

    progressColor =
      "bg-emerald-500";

  } else if (progress >= 80) {

    progressColor =
      "bg-orange-500";

  }


  // =========================================================
  // DEADLINE
  // =========================================================

  const today =
    new Date();

  const deadline =
    new Date(
      goal.deadline
    );

  const daysRemaining =
    Math.ceil(
      (
        deadline - today
      ) /
      (
        1000 *
        60 *
        60 *
        24
      )
    );


  let deadlineText =
    `Due ${formatDate(
      goal.deadline
    )}`;

  let deadlineClass =
    "text-slate-500";


  if (completed) {

    deadlineText =
      "Goal completed";

    deadlineClass =
      "text-emerald-600 font-semibold";

  } else if (
    daysRemaining < 0
  ) {

    deadlineText =
      "Deadline passed";

    deadlineClass =
      "text-rose-600 font-semibold";

  } else if (
    daysRemaining <= 30
  ) {

    deadlineText =
      `${daysRemaining} days remaining`;

    deadlineClass =
      "text-orange-600 font-semibold";

  }


  // =========================================================
  // CARD
  // =========================================================

  return (

    <div className="p-6 hover:bg-slate-50 transition">

      <div className="flex flex-col lg:flex-row lg:items-center gap-6">


        {/* GOAL */}

        <div className="flex items-center gap-4 lg:w-[280px]">

          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">

            {completed ? (

              <FaCheckCircle className="text-emerald-500 text-xl" />

            ) : (

              <FaBullseye className="text-indigo-600 text-xl" />

            )}

          </div>


          <div className="min-w-0">

            <h3 className="font-bold text-slate-800 truncate">

              {goal.goal_name}

            </h3>

            <p
              className={`
                text-sm
                mt-1
                ${deadlineClass}
              `}
            >

              {deadlineText}

            </p>

          </div>

        </div>


        {/* PROGRESS */}

        <div className="flex-1">

          <div className="flex justify-between items-center mb-2">

            <div>

              <span className="text-sm text-slate-500">

                Saved

              </span>

              <span className="ml-2 font-semibold text-slate-800">

                ₹{formatMoney(
                  saved
                )}

              </span>

              <span className="text-sm text-slate-400">

                {" "}of ₹
                {formatMoney(
                  target
                )}

              </span>

            </div>


            <span className="text-sm font-semibold text-slate-600">

              {progress.toFixed(2)}%

            </span>

          </div>


          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

            <div
              className={`
                h-full
                rounded-full
                transition-all
                duration-700
                ${progressColor}
              `}
              style={{
                width:
                  `${progress}%`,
              }}
            ></div>

          </div>


          <div className="flex justify-between mt-2 text-xs">

            <span className="text-slate-500">

              Remaining:
              {" "}
              ₹{formatMoney(
                remaining
              )}

            </span>


            {completed ? (

              <span className="text-emerald-600 font-semibold">

                Goal Achieved ✓

              </span>

            ) : (

              <span className="text-slate-400">

                Deadline:
                {" "}
                {formatDate(
                  goal.deadline
                )}

              </span>

            )}

          </div>

        </div>


        {/* ACTIONS */}

        <div className="flex items-center justify-end gap-2 lg:w-[100px]">


          {/* EDIT */}

          <button
            onClick={() =>
              onEdit(goal)
            }
            title="Edit savings goal"
            className="
              cursor-pointer
              w-9
              h-9
              rounded-lg
              bg-indigo-50
              text-indigo-600
              hover:bg-indigo-600
              hover:text-white
              flex
              items-center
              justify-center
              transition
            "
          >

            <FaEdit />

          </button>


          {/* DELETE */}

          <button
            onClick={() =>
              onDelete(goal)
            }
            title="Delete savings goal"
            className="
              cursor-pointer
              w-9
              h-9
              rounded-lg
              bg-rose-50
              text-rose-600
              hover:bg-rose-600
              hover:text-white
              flex
              items-center
              justify-center
              transition
            "
          >

            <FaTrash />

          </button>

        </div>

      </div>

    </div>

  );

}


export default Savings;