import { useEffect, useState } from "react";

import {
  FaPlus,
  FaWallet,
  FaChartPie,
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCalendarAlt,
} from "react-icons/fa";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import api from "../services/api";


function Budget() {

  // =========================================================
  // STATE
  // =========================================================

  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingBudget, setEditingBudget] = useState(null);

  const [deleteBudget, setDeleteBudget] = useState(null);

  const [saving, setSaving] = useState(false);


  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    category: "Food",
    budget_amount: "",
    month: "January",
    year: new Date().getFullYear(),
  });


  // =========================================================
  // FETCH BUDGETS
  // =========================================================

  const fetchBudgets = async () => {

    try {

      setLoading(true);

      setError("");

      const token = localStorage.getItem("access");

      const response = await api.get(
        "budgets/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBudgets(response.data);

    } catch (err) {

      console.error("Budget fetch error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load budgets."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // LOAD BUDGETS
  // =========================================================

  useEffect(() => {

    fetchBudgets();

  }, []);


  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddForm = () => {

    setEditingBudget(null);

    setFormData({
      category: "Food",
      budget_amount: "",
      month: "August",
      year: new Date().getFullYear(),
    });

    setShowForm(true);

  };


  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const openEditForm = (budget) => {

    setEditingBudget(budget);

    setFormData({
      category: budget.category || "Food",
      budget_amount: budget.budget_amount || "",
      month: budget.month || "January",
      year: budget.year || new Date().getFullYear(),
    });

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

    setEditingBudget(null);

  };


  // =========================================================
  // ADD / UPDATE BUDGET
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setSaving(true);

    setError("");

    try {

      const token = localStorage.getItem("access");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };


      const data = {
        category: formData.category,
        budget_amount: formData.budget_amount,
        month: formData.month,
        year: Number(formData.year),
      };


      // UPDATE

      if (editingBudget) {

        await api.put(
          `budgets/${editingBudget.id}/`,
          data,
          config
        );

      }

      // CREATE

      else {

        await api.post(
          "budgets/",
          data,
          config
        );

      }


      await fetchBudgets();

      setShowForm(false);

      setEditingBudget(null);

    } catch (err) {

      console.error("Budget save error:", err);

      const responseData = err.response?.data;

      if (responseData) {

        if (typeof responseData === "object") {

          const messages = Object.entries(responseData)
            .map(([field, message]) => {

              if (Array.isArray(message)) {
                return `${field}: ${message.join(", ")}`;
              }

              return `${field}: ${message}`;

            })
            .join(" | ");

          setError(messages);

        } else {

          setError(String(responseData));

        }

      } else {

        setError("Unable to save budget.");

      }

    } finally {

      setSaving(false);

    }
  };


  // =========================================================
  // DELETE BUDGET
  // =========================================================

  const confirmDelete = async () => {

    if (!deleteBudget) {
      return;
    }

    try {

      setSaving(true);

      const token = localStorage.getItem("access");

      await api.delete(
        `budgets/${deleteBudget.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDeleteBudget(null);

      await fetchBudgets();

    } catch (err) {

      console.error("Budget delete error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to delete budget."
      );

    } finally {

      setSaving(false);

    }
  };


  // =========================================================
  // MONEY FORMAT
  // =========================================================

  const formatMoney = (amount) => {

    return Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );

  };


  // =========================================================
  // TOTAL BUDGET
  // =========================================================

  const totalBudget = budgets.reduce(
    (total, budget) =>
      total + Number(budget.budget_amount || 0),
    0
  );


  // =========================================================
  // CURRENT MONTH
  // =========================================================

  const currentMonthName = new Date().toLocaleString(
    "en-US",
    {
      month: "long",
    }
  );


  const currentYear = new Date().getFullYear();


  const currentMonthBudgets = budgets.filter(
    (budget) =>
      budget.month === currentMonthName &&
      Number(budget.year) === currentYear
  );


  const currentMonthTotal = currentMonthBudgets.reduce(
    (total, budget) =>
      total + Number(budget.budget_amount || 0),
    0
  );


  // =========================================================
  // CATEGORY STYLE
  // =========================================================

  const getCategoryStyle = (category) => {

    const styles = {

      Food:
        "bg-orange-50 text-orange-700",

      Transport:
        "bg-blue-50 text-blue-700",

      Shopping:
        "bg-pink-50 text-pink-700",

      Bills:
        "bg-yellow-50 text-yellow-700",

      Health:
        "bg-red-50 text-red-700",

      Education:
        "bg-indigo-50 text-indigo-700",

      Entertainment:
        "bg-purple-50 text-purple-700",

      Travel:
        "bg-cyan-50 text-cyan-700",

      Investment:
        "bg-emerald-50 text-emerald-700",

      Other:
        "bg-slate-100 text-slate-700",

    };

    return (
      styles[category] ||
      "bg-slate-100 text-slate-700"
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

                Budgets

              </h1>

              <p className="text-slate-500 mt-2">

                Plan and manage your spending limits.

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

              Add Budget

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
                  onClick={() => setError("")}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">


            {/* TOTAL BUDGET */}

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Total Budget
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">

                    ₹{formatMoney(totalBudget)}

                  </h2>

                </div>


                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">

                  <FaWallet className="text-indigo-600 text-xl" />

                </div>

              </div>

            </div>


            {/* THIS MONTH */}

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    This Month
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">

                    ₹{formatMoney(currentMonthTotal)}

                  </h2>

                </div>


                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">

                  <FaCalendarAlt className="text-violet-600 text-xl" />

                </div>

              </div>

            </div>


            {/* NUMBER OF BUDGETS */}

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Active Budgets
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">

                    {budgets.length}

                  </h2>

                </div>


                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">

                  <FaChartPie className="text-emerald-600 text-xl" />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              BUDGET LIST
          ================================================== */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">


            <div className="p-6 border-b border-slate-100">

              <h2 className="text-2xl font-bold text-slate-800">

                Your Budgets

              </h2>

              <p className="text-sm text-slate-500 mt-1">

                Manage your category-wise spending limits.

              </p>

            </div>


            {/* LOADING */}

            {loading ? (

              <div className="min-h-[300px] flex flex-col items-center justify-center">

                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>

                <p className="text-slate-500 mt-4">

                  Loading budgets...

                </p>

              </div>

            ) : budgets.length === 0 ? (

              /* EMPTY */

              <div className="min-h-[350px] flex flex-col items-center justify-center text-center p-8">

                <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-5">

                  <FaWallet className="text-3xl text-indigo-500" />

                </div>

                <h3 className="text-xl font-bold text-slate-800">

                  No Budgets Yet

                </h3>

                <p className="text-slate-500 mt-2 max-w-md">

                  Create your first budget to start managing your spending.

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

                  Create Budget

                </button>

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {budgets.map((budget) => (

                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onEdit={openEditForm}
                    onDelete={setDeleteBudget}
                    getCategoryStyle={getCategoryStyle}
                    formatMoney={formatMoney}
                  />

                ))}

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


          {/* BACKDROP */}

          <div
            className="
              absolute
              inset-0
              bg-slate-950/60
              backdrop-blur-sm
            "
            onClick={closeForm}
          ></div>


          {/* MODAL */}

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">


            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">

              <div>

                <h2 className="text-2xl font-bold text-slate-800">

                  {editingBudget
                    ? "Edit Budget"
                    : "Add Budget"}

                </h2>

                <p className="text-sm text-slate-500 mt-1">

                  {editingBudget
                    ? "Update your budget details."
                    : "Set a spending limit for a category."}

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


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                {/* CATEGORY */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">

                    Category

                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-indigo-500
                      focus:border-transparent
                    "
                  >

                    <option value="Food">
                      Food
                    </option>

                    <option value="Transport">
                      Transport
                    </option>

                    <option value="Shopping">
                      Shopping
                    </option>

                    <option value="Bills">
                      Bills
                    </option>

                    <option value="Health">
                      Health
                    </option>

                    <option value="Education">
                      Education
                    </option>

                    <option value="Entertainment">
                      Entertainment
                    </option>

                    <option value="Travel">
                      Travel
                    </option>

                    <option value="Investment">
                      Investment
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                {/* AMOUNT */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">

                    Budget Amount

                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">

                      ₹

                    </span>

                    <input
                      type="number"
                      name="budget_amount"
                      value={formData.budget_amount}
                      onChange={handleChange}
                      placeholder="0.00"
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


                {/* MONTH */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">

                    Month

                  </label>

                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-indigo-500
                    "
                  >

                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>

                  </select>

                </div>


                {/* YEAR */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">

                    Year

                  </label>

                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="2020"
                    max="2100"
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
                  "
                >

                  {saving
                    ? "Saving..."
                    : editingBudget
                      ? "Update Budget"
                      : "Save Budget"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {deleteBudget && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">


          {/* BACKDROP */}

          <div
            className="
              absolute
              inset-0
              bg-slate-950/60
              backdrop-blur-sm
            "
            onClick={() => {

              if (!saving) {
                setDeleteBudget(null);
              }

            }}
          ></div>


          {/* DIALOG */}

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-7">

            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mb-5">

              <FaTrash className="text-rose-600 text-xl" />

            </div>


            <h2 className="text-2xl font-bold text-slate-800">

              Delete Budget?

            </h2>


            <p className="text-slate-500 mt-2 leading-relaxed">

              Are you sure you want to delete the{" "}

              <span className="font-semibold text-slate-700">

                {deleteBudget.category}

              </span>{" "}

              budget?

              <br />

              This action cannot be undone.

            </p>


            <div className="flex justify-end gap-3 mt-7">

              <button
                onClick={() => setDeleteBudget(null)}
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
                "
              >

                Cancel

              </button>


              <button
                onClick={confirmDelete}
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
// BUDGET CARD
// =========================================================

function BudgetCard({
  budget,
  onEdit,
  onDelete,
  getCategoryStyle,
  formatMoney,
}) {

  const [summary, setSummary] = useState({
    budget_amount: Number(budget.budget_amount || 0),
    total_expense: 0,
    remaining_budget: Number(budget.budget_amount || 0),
    overspent_amount: 0,
  });


  const [loadingSummary, setLoadingSummary] = useState(true);


  useEffect(() => {

    const fetchSummary = async () => {

      try {

        const token = localStorage.getItem("access");

        const response = await api.get(
          `budgets/summary/${budget.id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSummary(response.data);

      } catch (error) {

        console.error(
          "Budget summary error:",
          error
        );

      } finally {

        setLoadingSummary(false);

      }

    };


    fetchSummary();

  }, [budget.id]);


  const budgetAmount =
    Number(summary.budget_amount || 0);


  const spent =
    Number(summary.total_expense || 0);


  const remaining =
    Number(summary.remaining_budget || 0);


  const overspent =
    Number(summary.overspent_amount || 0);


  let percentage = 0;

  if (budgetAmount > 0) {

    percentage =
      (spent / budgetAmount) * 100;

  }


  const progressWidth =
    Math.min(percentage, 100);


  let progressColor =
    "bg-indigo-600";


  if (percentage >= 100) {

    progressColor = "bg-rose-600";

  } else if (percentage >= 80) {

    progressColor = "bg-orange-500";

  } else {

    progressColor = "bg-emerald-500";

  }


  return (

    <div className="p-6 hover:bg-slate-50 transition">


      {/* TOP */}

      <div className="flex flex-col lg:flex-row lg:items-center gap-6">


        {/* CATEGORY */}

        <div className="flex items-center gap-4 lg:w-[260px]">

          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">

            <FaWallet className="text-indigo-600" />

          </div>


          <div>

            <span
              className={`
                inline-flex
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                ${getCategoryStyle(budget.category)}
              `}
            >

              {budget.category}

            </span>

            <p className="text-sm text-slate-500 mt-1">

              {budget.month} {budget.year}

            </p>

          </div>

        </div>


        {/* PROGRESS */}

        <div className="flex-1">

          <div className="flex justify-between items-center mb-2">

            <div>

              <span className="text-sm text-slate-500">

                Spent

              </span>

              <span className="ml-2 font-semibold text-slate-800">

                ₹{formatMoney(spent)}

              </span>

            </div>


            <span className="text-sm font-semibold text-slate-600">

              {Math.round(percentage)}%

            </span>

          </div>


          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

            <div
              className={`
                h-full
                rounded-full
                transition-all
                duration-500
                ${progressColor}
              `}
              style={{
                width: `${progressWidth}%`,
              }}
            ></div>

          </div>


          <div className="flex justify-between mt-2 text-xs text-slate-500">

            <span>
              Budget: ₹{formatMoney(budgetAmount)}
            </span>

            {overspent > 0 ? (

              <span className="text-rose-600 font-semibold">

                Overspent: ₹{formatMoney(overspent)}

              </span>

            ) : (

              <span className="text-emerald-600 font-semibold">

                Remaining: ₹{formatMoney(remaining)}

              </span>

            )}

          </div>

        </div>


        {/* ACTIONS */}

        <div className="flex items-center justify-end gap-2 lg:w-[100px]">


          <button
            onClick={() => onEdit(budget)}
            title="Edit budget"
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


          <button
            onClick={() => onDelete(budget)}
            title="Delete budget"
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


export default Budget;