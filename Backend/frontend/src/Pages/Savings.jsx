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

      setLoading(true);

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


        const updatedGoal =
          prepareGoal(
            response.data
          );


        setGoals((previousGoals) =>
          previousGoals.map(
            (goal) =>
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
      // CLOSE FORM
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
                    Array.isArray(message)
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

    <div
      className="
        min-h-screen
        bg-[#F5F2EC]
        flex
        overflow-x-hidden
      "
    >

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div
        className="
          w-0
          lg:w-[280px]
          flex-shrink-0
        "
      >

        <Sidebar />

      </div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          flex-1
          min-w-0
          w-full
        "
      >

        <Topbar />


        <main
          className="
            p-4
            sm:p-6
            md:p-8
            w-full
            max-w-full
          "
        >


          {/* =================================================
              HEADER
          ================================================== */}

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
              mb-8
            "
          >

            <div>

              <h1
                className="
                  text-3xl
                  md:text-4xl
                  font-bold
                  text-[#101C2E]
                "
              >
                Savings Goals
              </h1>


              <p
                className="
                  text-[#6F665B]
                  mt-2
                "
              >
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
                bg-[#56061D]
                hover:bg-[#6F0A27]
                text-white
                font-semibold
                shadow-md
                hover:shadow-lg
                transition-all
                duration-300
                w-full
                md:w-auto
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

            <div
              className="
                mb-6
                p-4
                rounded-xl
                bg-[#56061D]/10
                border
                border-[#56061D]/30
                text-[#56061D]
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <p
                  className="
                    text-sm
                    font-medium
                  "
                >
                  {error}
                </p>


                <button
                  onClick={() =>
                    setError("")
                  }
                  className="
                    cursor-pointer
                    text-[#7A263D]
                    hover:text-[#56061D]
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

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4
              gap-6
              mb-8
            "
          >

            {/* TOTAL TARGET */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div className="min-w-0">

                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                    "
                  >
                    Total Target
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                      break-words
                    "
                  >
                    ₹{formatMoney(
                      totalTarget
                    )}
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-[#92643E]
                    flex
                    items-center
                    justify-center
                    shadow-sm
                    shrink-0
                  "
                >

                  <FaBullseye
                    className="
                      text-white
                      text-xl
                    "
                  />

                </div>

              </div>

            </div>


            {/* TOTAL SAVED */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div className="min-w-0">

                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                    "
                  >
                    Total Saved
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                      break-words
                    "
                  >
                    ₹{formatMoney(
                      totalSaved
                    )}
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-[#92643E]
                    flex
                    items-center
                    justify-center
                    shadow-sm
                    shrink-0
                  "
                >

                  <FaPiggyBank
                    className="
                      text-white
                      text-xl
                    "
                  />

                </div>

              </div>

            </div>


            {/* REMAINING */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div className="min-w-0">

                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                    "
                  >
                    Remaining
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                      break-words
                    "
                  >
                    ₹{formatMoney(
                      totalRemaining
                    )}
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-[#56061D]
                    flex
                    items-center
                    justify-center
                    shadow-sm
                    shrink-0
                  "
                >

                  <FaCalendarAlt
                    className="
                      text-white
                      text-xl
                    "
                  />

                </div>

              </div>

            </div>


            {/* OVERALL PROGRESS */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div className="min-w-0">

                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                    "
                  >
                    Overall Progress
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                    "
                  >
                    {overallProgress.toFixed(2)}%
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-[#92643E]
                    flex
                    items-center
                    justify-center
                    shadow-sm
                    shrink-0
                  "
                >

                  <FaCheckCircle
                    className="
                      text-white
                      text-xl
                    "
                  />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              OVERALL PROGRESS BAR
          ================================================== */}

          {goals.length > 0 && (

            <div
              className="
                bg-white
                rounded-3xl
                border
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
                p-6
                mb-8
              "
            >

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:justify-between
                  sm:items-center
                  gap-3
                  mb-3
                "
              >

                <div>

                  <h2
                    className="
                      text-xl
                      font-bold
                      text-[#101C2E]
                    "
                  >
                    Overall Savings Progress
                  </h2>


                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                      mt-1
                    "
                  >
                    {completedGoals} of{" "}
                    {goals.length} goals completed
                  </p>

                </div>


                <span
                  className="
                    font-bold
                    text-[#56061D]
                  "
                >
                  {overallProgress.toFixed(2)}%
                </span>

              </div>


              <div
                className="
                  w-full
                  h-4
                  bg-[#F3EBDD]
                  rounded-full
                  overflow-hidden
                "
              >

                <div
                  className="
                    h-full
                    rounded-full
                    bg-[#92643E]
                    transition-all
                    duration-700
                  "
                  style={{
                    width:
                      `${overallProgress}%`,
                  }}
                />

              </div>

            </div>

          )}


          {/* =================================================
              SAVINGS GOALS
          ================================================== */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-[#E5DDD2]
              shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              overflow-hidden
              w-full
            "
          >

            {/* SECTION HEADER */}

            <div
              className="
                p-6
                border-b
                border-[#E5DDD2]
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                  text-[#101C2E]
                "
              >
                Your Savings Goals
              </h2>


              <p
                className="
                  text-sm
                  text-[#6F665B]
                  mt-1
                "
              >
                Track each goal and see how
                close you are to achieving it.
              </p>

            </div>


            {/* LOADING */}

            {loading ? (

              <div
                className="
                  min-h-[300px]
                  flex
                  flex-col
                  items-center
                  justify-center
                  bg-white
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    border-4
                    border-[#92643E]/30
                    border-t-[#92643E]
                    rounded-full
                    animate-spin
                  "
                />

                <p
                  className="
                    text-[#6F665B]
                    mt-4
                  "
                >
                  Loading savings goals...
                </p>

              </div>

            ) : goals.length === 0 ? (

              <div
                className="
                  min-h-[350px]
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  p-8
                  bg-white
                "
              >

                <div
                  className="
                    w-20
                    h-20
                    rounded-3xl
                    bg-[#92643E]/10
                    border
                    border-[#92643E]/20
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >

                  <FaBullseye
                    className="
                      text-3xl
                      text-[#92643E]
                    "
                  />

                </div>


                <h3
                  className="
                    text-xl
                    font-bold
                    text-[#101C2E]
                  "
                >
                  No Savings Goals Yet
                </h3>


                <p
                  className="
                    text-[#6F665B]
                    mt-2
                    max-w-md
                  "
                >
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
                    justify-center
                    gap-2
                    px-5
                    py-3
                    rounded-xl
                    bg-[#56061D]
                    hover:bg-[#6F0A27]
                    text-white
                    font-semibold
                    transition
                    w-full
                    sm:w-auto
                  "
                >

                  <FaPlus />

                  Create First Goal

                </button>

              </div>

            ) : (

              <div
                className="
                  divide-y
                  divide-[#E5DDD2]
                "
              >

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

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            p-4
          "
        >

          {/* BACKDROP */}

          <div
            className="
              absolute
              inset-0
              bg-[#101C2E]/50
              backdrop-blur-sm
            "
            onClick={closeForm}
          />


          {/* MODAL */}

          <div
            className="
              relative
              w-full
              max-w-2xl
              max-h-[90vh]
              bg-white
              rounded-3xl
              shadow-2xl
              overflow-y-auto
              border
              border-[#E5DDD2]
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                px-5
                sm:px-6
                py-5
                border-b
                border-[#E5DDD2]
                sticky
                top-0
                bg-white
                z-10
                gap-4
              "
            >

              <div className="min-w-0">

                <h2
                  className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    text-[#101C2E]
                  "
                >
                  {editingGoal
                    ? "Edit Savings Goal"
                    : "Add Savings Goal"}
                </h2>


                <p
                  className="
                    text-sm
                    text-[#6F665B]
                    mt-1
                  "
                >
                  {editingGoal
                    ? "Update your savings goal."
                    : "Create a new goal to start saving."}
                </p>

              </div>


              <button
                onClick={closeForm}
                disabled={saving}
                className="
                  cursor-pointer
                  w-10
                  h-10
                  rounded-xl
                  bg-[#F3EBDD]
                  hover:bg-[#E5DDD2]
                  text-[#6F665B]
                  flex
                  items-center
                  justify-center
                  transition
                  disabled:opacity-50
                  shrink-0
                "
              >

                <FaTimes />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="
                p-5
                sm:p-6
              "
            >

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                "
              >

                {/* GOAL NAME */}

                <div className="md:col-span-2">

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#101C2E]
                      mb-2
                    "
                  >
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
                      border-[#D8C8B4]
                      bg-white
                      text-[#101C2E]
                      placeholder:text-[#9A9085]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#56061D]
                      focus:border-transparent
                    "
                  />

                </div>


                {/* TARGET */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#101C2E]
                      mb-2
                    "
                  >
                    Target Amount
                  </label>


                  <div className="relative">

                    <span
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#6F665B]
                        font-semibold
                      "
                    >
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
                        border-[#D8C8B4]
                        bg-white
                        text-[#101C2E]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#56061D]
                        focus:border-transparent
                      "
                    />

                  </div>

                </div>


                {/* SAVED */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#101C2E]
                      mb-2
                    "
                  >
                    Already Saved
                  </label>


                  <div className="relative">

                    <span
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#6F665B]
                        font-semibold
                      "
                    >
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
                        border-[#D8C8B4]
                        bg-white
                        text-[#101C2E]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#56061D]
                        focus:border-transparent
                      "
                    />

                  </div>

                </div>


                {/* DEADLINE */}

                <div className="md:col-span-2">

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#101C2E]
                      mb-2
                    "
                  >
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
                      border-[#D8C8B4]
                      bg-white
                      text-[#101C2E]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#56061D]
                      focus:border-transparent
                    "
                  />

                </div>

              </div>


              {/* BUTTONS */}

              <div
                className="
                  flex
                  flex-col-reverse
                  sm:flex-row
                  sm:justify-end
                  gap-3
                  mt-7
                  pt-5
                  border-t
                  border-[#E5DDD2]
                "
              >

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
                    border-[#D8C8B4]
                    text-[#6F665B]
                    hover:bg-[#F3EBDD]
                    font-semibold
                    transition
                    disabled:opacity-50
                    w-full
                    sm:w-auto
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
                    bg-[#56061D]
                    hover:bg-[#6F0A27]
                    text-white
                    font-semibold
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    w-full
                    sm:w-auto
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

        <div
          className="
            fixed
            inset-0
            z-[60]
            flex
            items-center
            justify-center
            p-4
          "
        >

          {/* BACKDROP */}

          <div
            className="
              absolute
              inset-0
              bg-[#101C2E]/50
              backdrop-blur-sm
            "
            onClick={() => {

              if (!saving) {
                setDeleteGoal(null);
              }

            }}
          />


          {/* DIALOG */}

          <div
            className="
              relative
              w-full
              max-w-md
              bg-white
              rounded-3xl
              shadow-2xl
              p-6
              sm:p-7
              border
              border-[#E5DDD2]
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-[#56061D]/10
                flex
                items-center
                justify-center
                mb-5
              "
            >

              <FaTrash
                className="
                  text-[#7A263D]
                  text-xl
                "
              />

            </div>


            <h2
              className="
                text-2xl
                font-bold
                text-[#101C2E]
              "
            >
              Delete Savings Goal?
            </h2>


            <p
              className="
                text-[#6F665B]
                mt-2
                leading-relaxed
              "
            >
              Are you sure you want to delete{" "}

              <span
                className="
                  font-semibold
                  text-[#101C2E]
                "
              >
                "{deleteGoal.goal_name}"
              </span>

              ?

              <br />

              This action cannot be undone.
            </p>


            <div
              className="
                flex
                flex-col-reverse
                sm:flex-row
                sm:justify-end
                gap-3
                mt-7
              "
            >

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
                  border-[#D8C8B4]
                  text-[#6F665B]
                  hover:bg-[#F3EBDD]
                  font-semibold
                  transition
                  w-full
                  sm:w-auto
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
                  bg-[#56061D]
                  hover:bg-[#6F0A27]
                  text-white
                  font-semibold
                  transition
                  disabled:opacity-50
                  w-full
                  sm:w-auto
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


/* =========================================================
   SAVINGS GOAL CARD
========================================================= */

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


  // =========================================================
  // REAL PROGRESS
  // =========================================================

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
    "bg-[#8FB39B]";


  if (completed) {

    progressColor =
      "bg-[#92643E]";

  } else if (progress >= 80) {

    progressColor =
      "bg-[#B4774D]";

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
    "text-[#6F665B]";


  if (completed) {

    deadlineText =
      "Goal completed";

    deadlineClass =
      "text-[#5F8069] font-semibold";

  } else if (
    daysRemaining < 0
  ) {

    deadlineText =
      "Deadline passed";

    deadlineClass =
      "text-[#7A263D] font-semibold";

  } else if (
    daysRemaining <= 30
  ) {

    deadlineText =
      `${daysRemaining} days remaining`;

    deadlineClass =
      "text-[#92643E] font-semibold";

  }


  // =========================================================
  // CARD
  // =========================================================

  return (

    <div
      className="
        p-5
        sm:p-6
        bg-white
        hover:bg-[#FAF8F4]
        transition
      "
    >

      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          gap-6
        "
      >


        {/* =================================================
            GOAL
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-4
            lg:w-[280px]
            shrink-0
            min-w-0
          "
        >

          <div
            className="
              w-12
              h-12
              rounded-xl
              bg-[#92643E]/10
              border
              border-[#92643E]/20
              flex
              items-center
              justify-center
              flex-shrink-0
            "
          >

            {completed ? (

              <FaCheckCircle
                className="
                  text-[#92643E]
                  text-xl
                "
              />

            ) : (

              <FaBullseye
                className="
                  text-[#92643E]
                  text-xl
                "
              />

            )}

          </div>


          <div
            className="
              min-w-0
            "
          >

            <h3
              className="
                font-bold
                text-[#101C2E]
                truncate
              "
            >
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


        {/* =================================================
            PROGRESS
        ================================================= */}

        <div
          className="
            flex-1
            min-w-0
          "
        >

          <div
            className="
              flex
              justify-between
              items-center
              gap-3
              mb-2
            "
          >

            <div
              className="
                min-w-0
                text-sm
              "
            >

              <span
                className="
                  text-[#6F665B]
                "
              >
                Saved
              </span>


              <span
                className="
                  ml-2
                  font-semibold
                  text-[#101C2E]
                "
              >
                ₹{formatMoney(
                  saved
                )}
              </span>


              <span
                className="
                  text-[#9A9085]
                "
              >
                {" "}of ₹
                {formatMoney(
                  target
                )}
              </span>

            </div>


            <span
              className="
                text-sm
                font-semibold
                text-[#101C2E]
                shrink-0
              "
            >
              {progress.toFixed(2)}%
            </span>

          </div>


          {/* PROGRESS BAR */}

          <div
            className="
              w-full
              h-3
              bg-[#F3EBDD]
              rounded-full
              overflow-hidden
            "
          >

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
            />

          </div>


          {/* BOTTOM INFORMATION */}

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:justify-between
              gap-1
              mt-2
              text-xs
            "
          >

            <span
              className="
                text-[#6F665B]
              "
            >
              Remaining:
              {" "}
              ₹{formatMoney(
                remaining
              )}
            </span>


            {completed ? (

              <span
                className="
                  text-[#5F8069]
                  font-semibold
                "
              >
                Goal Achieved ✓
              </span>

            ) : (

              <span
                className="
                  text-[#9A9085]
                "
              >
                Deadline:
                {" "}
                {formatDate(
                  goal.deadline
                )}
              </span>

            )}

          </div>

        </div>


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-2
            lg:w-[100px]
            shrink-0
          "
        >

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
              bg-[#92643E]/10
              border
              border-[#92643E]/20
              text-[#92643E]
              hover:bg-[#92643E]
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
              bg-[#56061D]/10
              border
              border-[#56061D]/20
              text-[#7A263D]
              hover:bg-[#56061D]
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