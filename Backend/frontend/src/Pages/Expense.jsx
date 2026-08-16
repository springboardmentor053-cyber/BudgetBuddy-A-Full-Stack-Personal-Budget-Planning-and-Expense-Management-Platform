import { useEffect, useState } from "react";

import {
  FaPlus,
  FaWallet,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaTimes,
  FaArrowDown,
} from "react-icons/fa";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import api from "../services/api";

function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteExpense, setDeleteExpense] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    description: "",
    expense_date: "",
  });


  // =========================================================
  // FETCH EXPENSES
  // =========================================================

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access");

      const response = await api.get("expenses/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setExpenses(data);
    } catch (err) {
      console.error("Expense fetch error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load expense records."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    fetchExpenses();
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
    setEditingExpense(null);
    setError("");

    setFormData({
      title: "",
      amount: "",
      category: "Food",
      description: "",
      expense_date: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowForm(true);
  };


  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const openEditForm = (expense) => {
    setEditingExpense(expense);
    setError("");

    setFormData({
      title: expense.title || "",
      amount: expense.amount || "",
      category: expense.category || "Food",
      description: expense.description || "",
      expense_date: expense.expense_date || "",
    });

    setShowForm(true);
  };


  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    setShowForm(false);
    setEditingExpense(null);

    setFormData({
      title: "",
      amount: "",
      category: "Food",
      description: "",
      expense_date: "",
    });
  };


  // =========================================================
  // ADD / UPDATE EXPENSE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("access");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const data = {
      title: formData.title.trim(),
      amount: formData.amount,
      category: formData.category,
      description: formData.description.trim(),
      expense_date: formData.expense_date,
    };


    // =======================================================
    // UPDATE
    // =======================================================

    if (editingExpense) {
      const oldExpenses = [...expenses];

      const updatedExpense = {
        ...editingExpense,
        ...data,
      };

      setExpenses((previous) =>
        previous.map((expense) =>
          expense.id === editingExpense.id
            ? updatedExpense
            : expense
        )
      );

      closeForm();

      try {
        const response = await api.put(
          `expenses/${editingExpense.id}/`,
          data,
          config
        );

        setExpenses((previous) =>
          previous.map((expense) =>
            expense.id === editingExpense.id
              ? response.data
              : expense
          )
        );
      } catch (err) {
        console.error("Expense update error:", err);

        setExpenses(oldExpenses);

        setError(
          err.response?.data?.detail ||
            "Unable to update expense."
        );
      }

      return;
    }


    // =======================================================
    // CREATE
    // =======================================================

    const temporaryId = `temporary-${Date.now()}`;

    const temporaryExpense = {
      id: temporaryId,
      title: data.title,
      amount: data.amount,
      category: data.category,
      description: data.description,
      expense_date: data.expense_date,
    };

    setExpenses((previous) => [
      temporaryExpense,
      ...previous,
    ]);

    closeForm();

    try {
      const response = await api.post(
        "expenses/",
        data,
        config
      );

      setExpenses((previous) =>
        previous.map((expense) =>
          expense.id === temporaryId
            ? response.data
            : expense
        )
      );
    } catch (err) {
      console.error(
        "Expense creation error:",
        err
      );

      setExpenses((previous) =>
        previous.filter(
          (expense) =>
            expense.id !== temporaryId
        )
      );

      setError(
        err.response?.data?.detail ||
          "Unable to add expense."
      );
    }
  };


  // =========================================================
  // DELETE EXPENSE
  // =========================================================

  const confirmDelete = async () => {
    if (!deleteExpense) return;

    const expenseToDelete = deleteExpense;
    const oldExpenses = [...expenses];

    setExpenses((previous) =>
      previous.filter(
        (expense) =>
          expense.id !== expenseToDelete.id
      )
    );

    setDeleteExpense(null);

    try {
      const token =
        localStorage.getItem("access");

      await api.delete(
        `expenses/${expenseToDelete.id}/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error(
        "Expense delete error:",
        err
      );

      setExpenses(oldExpenses);

      setError(
        err.response?.data?.detail ||
          "Unable to delete expense."
      );
    }
  };


  // =========================================================
  // TOTAL EXPENSE
  // =========================================================

  const totalExpense = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );


  // =========================================================
  // THIS MONTH EXPENSE
  // =========================================================

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const thisMonthExpense = expenses
    .filter((expense) => {
      if (!expense.expense_date) {
        return false;
      }

      const expenseDate = new Date(
        expense.expense_date
      );

      return (
        expenseDate.getMonth() ===
          currentMonth &&
        expenseDate.getFullYear() ===
          currentYear
      );
    })
    .reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );


  // =========================================================
  // FORMAT MONEY
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
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

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
  // CATEGORY STYLE
  // =========================================================

  const getCategoryStyle = (category) => {
    const styles = {
      Food:
        "bg-[#92643E]/10 text-[#92643E] border border-[#92643E]/25",

      Transport:
        "bg-[#F3F0EA] text-[#6F665B] border border-[#D8C8B4]",

      Shopping:
        "bg-[#56061D]/10 text-[#7A263D] border border-[#56061D]/25",

      Bills:
        "bg-[#92643E]/10 text-[#92643E] border border-[#92643E]/25",

      Health:
        "bg-[#56061D]/10 text-[#7A263D] border border-[#56061D]/25",

      Education:
        "bg-[#F3F0EA] text-[#6F665B] border border-[#D8C8B4]",

      Entertainment:
        "bg-[#56061D]/10 text-[#7A263D] border border-[#56061D]/25",

      Travel:
        "bg-[#92643E]/10 text-[#92643E] border border-[#92643E]/25",

      Investment:
        "bg-[#92643E]/10 text-[#92643E] border border-[#92643E]/25",

      Other:
        "bg-[#F3F0EA] text-[#6F665B] border border-[#D8C8B4]",
    };

    return (
      styles[category] ||
      "bg-[#F3F0EA] text-[#6F665B] border border-[#D8C8B4]"
    );
  };


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex overflow-x-hidden">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div className="w-0 lg:w-[280px] flex-shrink-0">
        <Sidebar />
      </div>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="flex-1 min-w-0 w-full">

        <Topbar />

        <main className="p-4 sm:p-6 md:p-8 w-full max-w-full">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

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
                  text-4xl
                  font-bold
                  text-[#101C2E]
                "
              >
                Expenses
              </h1>

              <p
                className="
                  text-[#6F665B]
                  mt-2
                "
              >
                Track and manage your spending in one place.
              </p>

            </div>


            {/* ADD EXPENSE */}

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
                hover:bg-[#6E0A28]
                text-[#F3EBDD]
                font-semibold
                transition-all
                duration-300
                shadow-[0_8px_20px_rgba(86,6,29,0.12)]
                w-full
                md:w-auto
              "
            >

              <FaPlus />

              Add Expense

            </button>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

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
              {error}
            </div>
          )}


          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-6
              mb-8
            "
          >

            {/* TOTAL EXPENSE */}

            <div
              className="
                bg-white
                rounded-3xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_10px_30px_rgba(16,28,46,0.08)]
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[#6F665B] text-sm">
                    Total Expenses
                  </p>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                    "
                  >
                    ₹{formatMoney(totalExpense)}
                  </h2>

                  <p className="text-xs text-[#92643E] mt-2">
                    All recorded expenses
                  </p>

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
                    shadow-lg
                  "
                >
                  <FaWallet className="text-xl text-[#F3EBDD]" />
                </div>

              </div>

            </div>


            {/* THIS MONTH */}

            <div
              className="
                bg-white
                rounded-3xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_10px_30px_rgba(16,28,46,0.08)]
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[#6F665B] text-sm">
                    This Month
                  </p>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                    "
                  >
                    ₹{formatMoney(thisMonthExpense)}
                  </h2>

                  <p className="text-xs text-[#92643E] mt-2">
                    Expense received this month
                  </p>

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
                    shadow-lg
                  "
                >
                  <FaCalendarAlt className="text-xl text-[#F3EBDD]" />
                </div>

              </div>

            </div>


            {/* EXPENSE ENTRIES */}

            <div
              className="
                bg-white
                rounded-3xl
                p-6
                border
                border-[#E5DDD2]
                shadow-[0_10px_30px_rgba(16,28,46,0.08)]
                hover:-translate-y-1
                transition-all
                duration-300
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[#6F665B] text-sm">
                    Expense Entries
                  </p>

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                    "
                  >
                    {expenses.length}
                  </h2>

                  <p className="text-xs text-[#92643E] mt-2">
                    Recorded transactions
                  </p>

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
                    shadow-lg
                  "
                >
                  <FaMoneyBillWave className="text-xl text-[#F3EBDD]" />
                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              EXPENSE RECORDS
          ================================================= */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-[#E5DDD2]
              overflow-hidden
              shadow-[0_10px_30px_rgba(16,28,46,0.08)]
              w-full
            "
          >

            <div
              className="
                p-6
                border-b
                border-[#D8C8B4]
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                  text-[#101C2E]
                "
              >
                Expense Records
              </h2>

              <p
                className="
                  text-sm
                  text-[#6F665B]
                  mt-1
                "
              >
                Your latest spending activity
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
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    border-4
                    border-[#E5DDD2]
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
                  Loading expense records...
                </p>

              </div>

            ) : expenses.length === 0 ? (

              /* EMPTY */

              <div
                className="
                  min-h-[300px]
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  p-8
                "
              >

                <div
                  className="
                    w-16
                    h-16
                    rounded-2xl
                    bg-[#56061D]/10
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >
                  <FaWallet className="text-2xl text-[#7A263D]" />
                </div>

                <h3
                  className="
                    text-xl
                    font-bold
                    text-[#101C2E]
                  "
                >
                  No Expenses Yet
                </h3>

                <p
                  className="
                    text-[#6F665B]
                    mt-2
                  "
                >
                  Start by adding your first expense.
                </p>

                <button
                  onClick={openAddForm}
                  className="
                    cursor-pointer
                    mt-6
                    px-5
                    py-3
                    rounded-xl
                    bg-[#56061D]
                    hover:bg-[#6E0A28]
                    text-[#F3EBDD]
                    font-semibold
                    transition
                  "
                >
                  <FaPlus className="inline mr-2" />
                  Add Expense
                </button>

              </div>

            ) : (

              /* TABLE */

              <div className="overflow-x-auto">

                <table className="w-full min-w-[750px]">

                  <thead>

                    <tr
                      className="
                        border-b
                        border-[#D8C8B4]
                        bg-[#F8F5EF]
                      "
                    >

                      <th
                        className="
                          text-left
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-[#6F665B]
                        "
                      >
                        Expense
                      </th>

                      <th
                        className="
                          text-left
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-[#6F665B]
                        "
                      >
                        Category
                      </th>

                      <th
                        className="
                          text-left
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-[#6F665B]
                        "
                      >
                        Date
                      </th>

                      <th
                        className="
                          text-right
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-[#6F665B]
                        "
                      >
                        Amount
                      </th>

                      <th
                        className="
                          text-right
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-[#6F665B]
                        "
                      >
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {expenses.map((expense) => (

                      <tr
                        key={expense.id}
                        className="
                          border-b
                          border-[#E5DDD2]
                          hover:bg-[#F8F5EF]
                          transition
                        "
                      >

                        {/* EXPENSE */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div
                              className="
                                w-11
                                h-11
                                rounded-xl
                                bg-[#56061D]/10
                                border
                                border-[#56061D]/25
                                flex
                                items-center
                                justify-center
                                shrink-0
                              "
                            >
                              <FaArrowDown className="text-[#7A263D]" />
                            </div>

                            <div className="min-w-0">

                              <p
                                className="
                                  font-semibold
                                  text-[#101C2E]
                                  truncate
                                  max-w-[250px]
                                "
                              >
                                {expense.title}
                              </p>

                              {expense.description && (
                                <p
                                  className="
                                    text-xs
                                    text-[#8B8175]
                                    mt-1
                                    max-w-[250px]
                                    truncate
                                  "
                                >
                                  {expense.description}
                                </p>
                              )}

                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td className="px-6 py-5">

                          <span
                            className={`
                              inline-flex
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              font-semibold
                              ${getCategoryStyle(
                                expense.category
                              )}
                            `}
                          >
                            {expense.category || "Other"}
                          </span>

                        </td>


                        {/* DATE */}

                        <td
                          className="
                            px-6
                            py-5
                            text-sm
                            text-[#6F665B]
                          "
                        >
                          {formatDate(
                            expense.expense_date
                          )}
                        </td>


                        {/* AMOUNT */}

                        <td
                          className="
                            px-6
                            py-5
                            text-right
                          "
                        >

                          <span
                            className="
                              font-bold
                              text-[#7A263D]
                              whitespace-nowrap
                            "
                          >
                            -₹
                            {formatMoney(
                              expense.amount
                            )}
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-6 py-5">

                          <div
                            className="
                              flex
                              justify-end
                              gap-2
                            "
                          >

                            {/* EDIT */}

                            <button
                              onClick={() =>
                                openEditForm(expense)
                              }
                              title="Edit expense"
                              className="
                                cursor-pointer
                                w-9
                                h-9
                                rounded-lg
                                bg-[#92643E]/10
                                border
                                border-[#92643E]/25
                                text-[#92643E]
                                hover:bg-[#92643E]
                                hover:text-[#F3EBDD]
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
                                setDeleteExpense(expense)
                              }
                              title="Delete expense"
                              className="
                                cursor-pointer
                                w-9
                                h-9
                                rounded-lg
                                bg-[#56061D]/10
                                border
                                border-[#56061D]/25
                                text-[#7A263D]
                                hover:bg-[#56061D]
                                hover:text-[#F3EBDD]
                                flex
                                items-center
                                justify-center
                                transition
                              "
                            >
                              <FaTrash />
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

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

          <div
            className="
              absolute
              inset-0
              bg-[#101C2E]/55
              backdrop-blur-sm
            "
            onClick={closeForm}
          />


          <div
            className="
              relative
              w-full
              max-w-2xl
              max-h-[90vh]
              bg-white
              rounded-3xl
              border
              border-[#D8C8B4]
              shadow-2xl
              overflow-y-auto
            "
          >

            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                px-6
                py-5
                border-b
                border-[#D8C8B4]
                sticky
                top-0
                bg-white
                z-10
              "
            >

              <div>

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-[#101C2E]
                  "
                >
                  {editingExpense
                    ? "Edit Expense"
                    : "Add Expense"}
                </h2>

                <p
                  className="
                    text-sm
                    text-[#6F665B]
                    mt-1
                  "
                >
                  {editingExpense
                    ? "Update your expense details."
                    : "Add a new expense transaction."}
                </p>

              </div>


              <button
                type="button"
                onClick={closeForm}
                className="
                  cursor-pointer
                  w-10
                  h-10
                  rounded-xl
                  bg-[#F3EBDD]
                  hover:bg-[#E8DCC8]
                  text-[#6F665B]
                  flex
                  items-center
                  justify-center
                  transition
                  shrink-0
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

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                "
              >

                {/* TITLE */}

                <div className="md:col-span-2">

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#6F665B]
                      mb-2
                    "
                  >
                    Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Grocery Shopping"
                    required
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-white
                      border
                      border-[#D8C8B4]
                      text-[#101C2E]
                      placeholder:text-[#A99F91]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#92643E]
                    "
                  />

                </div>


                {/* AMOUNT */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#6F665B]
                      mb-2
                    "
                  >
                    Amount
                  </label>

                  <div className="relative">

                    <span
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#92643E]
                      "
                    >
                      ₹
                    </span>

                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
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
                        bg-white
                        border
                        border-[#D8C8B4]
                        text-[#101C2E]
                        placeholder:text-[#A99F91]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#92643E]
                      "
                    />

                  </div>

                </div>


                {/* CATEGORY */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#6F665B]
                      mb-2
                    "
                  >
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
                      bg-white
                      border
                      border-[#D8C8B4]
                      text-[#101C2E]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#92643E]
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


                {/* DATE */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#6F665B]
                      mb-2
                    "
                  >
                    Expense Date
                  </label>

                  <input
                    type="date"
                    name="expense_date"
                    value={formData.expense_date}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-white
                      border
                      border-[#D8C8B4]
                      text-[#101C2E]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#92643E]
                    "
                  />

                </div>


                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-[#6F665B]
                      mb-2
                    "
                  >
                    Description

                    <span
                      className="
                        font-normal
                        text-[#8B8175]
                      "
                    >
                      {" "}
                      (Optional)
                    </span>

                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add some details about this expense..."
                    rows="4"
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-white
                      border
                      border-[#D8C8B4]
                      text-[#101C2E]
                      placeholder:text-[#A99F91]
                      resize-none
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#92643E]
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
                  border-[#D8C8B4]
                "
              >

                <button
                  type="button"
                  onClick={closeForm}
                  className="
                    cursor-pointer
                    px-5
                    py-3
                    rounded-xl
                    bg-[#F3EBDD]
                    hover:bg-[#E8DCC8]
                    text-[#6F665B]
                    font-semibold
                    transition
                    w-full
                    sm:w-auto
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="
                    cursor-pointer
                    px-6
                    py-3
                    rounded-xl
                    bg-[#56061D]
                    hover:bg-[#6E0A28]
                    text-[#F3EBDD]
                    font-semibold
                    transition
                    shadow-lg
                    w-full
                    sm:w-auto
                  "
                >
                  {editingExpense
                    ? "Update Expense"
                    : "Save Expense"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {deleteExpense && (

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

          <div
            className="
              absolute
              inset-0
              bg-[#101C2E]/55
              backdrop-blur-sm
            "
            onClick={() =>
              setDeleteExpense(null)
            }
          />


          <div
            className="
              relative
              w-full
              max-w-md
              bg-white
              rounded-3xl
              border
              border-[#D8C8B4]
              shadow-2xl
              p-6
              sm:p-7
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-[#56061D]/10
                border
                border-[#56061D]/25
                flex
                items-center
                justify-center
                mb-5
              "
            >
              <FaTrash className="text-[#7A263D] text-xl" />
            </div>


            <h2
              className="
                text-2xl
                font-bold
                text-[#101C2E]
              "
            >
              Delete Expense?
            </h2>


            <p
              className="
                text-[#6F665B]
                mt-3
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
                "{deleteExpense.title}"
              </span>

              ? This action cannot be undone.
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
                type="button"
                onClick={() =>
                  setDeleteExpense(null)
                }
                className="
                  cursor-pointer
                  px-5
                  py-3
                  rounded-xl
                  bg-[#F3EBDD]
                  hover:bg-[#E8DCC8]
                  text-[#6F665B]
                  font-semibold
                  transition
                  w-full
                  sm:w-auto
                "
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={confirmDelete}
                className="
                  cursor-pointer
                  px-5
                  py-3
                  rounded-xl
                  bg-[#56061D]
                  hover:bg-[#6E0A28]
                  text-[#F3EBDD]
                  font-semibold
                  transition
                  w-full
                  sm:w-auto
                "
              >
                Yes, Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Expense;