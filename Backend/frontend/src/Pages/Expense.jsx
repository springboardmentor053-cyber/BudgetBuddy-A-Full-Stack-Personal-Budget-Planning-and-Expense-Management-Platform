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

  // =========================================================
  // STATE
  // =========================================================

  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);

  const [deleteExpense, setDeleteExpense] = useState(null);


  // =========================================================
  // FORM DATA
  // =========================================================

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

      const token =
        localStorage.getItem("access");

      const response = await api.get(
        "expenses/",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

      setExpenses(data);

    } catch (err) {

      console.error(
        "Expense fetch error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load expense records."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    fetchExpenses();

  }, []);


  // =========================================================
  // FORM CHANGE
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

    setEditingExpense(null);

    setError("");

    setFormData({
      title: "",
      amount: "",
      category: "Food",
      description: "",
      expense_date:
        new Date()
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
      category:
        expense.category || "Food",
      description:
        expense.description || "",
      expense_date:
        expense.expense_date || "",
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
  // OPTIMISTIC UI
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");

    const token =
      localStorage.getItem("access");

    const config = {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    };


    const data = {

      title:
        formData.title.trim(),

      amount:
        formData.amount,

      category:
        formData.category,

      description:
        formData.description.trim(),

      expense_date:
        formData.expense_date,

    };


    // =======================================================
    // UPDATE EXPENSE
    // =======================================================

    if (editingExpense) {

      const oldExpenses =
        [...expenses];

      const updatedExpense = {

        ...editingExpense,

        ...data,

      };


      // -----------------------------------------------------
      // UPDATE UI IMMEDIATELY
      // -----------------------------------------------------

      setExpenses((previous) =>
        previous.map(
          (expense) =>
            expense.id ===
            editingExpense.id
              ? updatedExpense
              : expense
        )
      );


      // -----------------------------------------------------
      // CLOSE MODAL IMMEDIATELY
      // -----------------------------------------------------

      setShowForm(false);

      setEditingExpense(null);


      setFormData({
        title: "",
        amount: "",
        category: "Food",
        description: "",
        expense_date: "",
      });


      // -----------------------------------------------------
      // SEND REQUEST IN BACKGROUND
      // -----------------------------------------------------

      try {

        const response =
          await api.put(
            `expenses/${editingExpense.id}/`,
            data,
            config
          );


        // Replace optimistic data
        // with actual backend data.

        setExpenses((previous) =>
          previous.map(
            (expense) =>
              expense.id ===
              editingExpense.id
                ? response.data
                : expense
          )
        );

      } catch (err) {

        console.error(
          "Expense update error:",
          err
        );


        // Restore old data.

        setExpenses(oldExpenses);


        setError(
          err.response?.data?.detail ||
          "Unable to update expense."
        );

      }

      return;

    }


    // =======================================================
    // ADD EXPENSE
    // =======================================================

    const temporaryId =
      `temporary-${Date.now()}`;


    const temporaryExpense = {

      id: temporaryId,

      title:
        data.title,

      amount:
        data.amount,

      category:
        data.category,

      description:
        data.description,

      expense_date:
        data.expense_date,

    };


    // -------------------------------------------------------
    // SHOW NEW EXPENSE IMMEDIATELY
    // -------------------------------------------------------

    setExpenses((previous) => [

      temporaryExpense,

      ...previous,

    ]);


    // -------------------------------------------------------
    // CLOSE MODAL IMMEDIATELY
    // -------------------------------------------------------

    setShowForm(false);

    setEditingExpense(null);


    setFormData({
      title: "",
      amount: "",
      category: "Food",
      description: "",
      expense_date: "",
    });


    // -------------------------------------------------------
    // SEND REQUEST IN BACKGROUND
    // -------------------------------------------------------

    try {

      const response =
        await api.post(
          "expenses/",
          data,
          config
        );


      // Replace temporary record
      // with real backend record.

      setExpenses((previous) =>
        previous.map(
          (expense) =>
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


      // Remove temporary record
      // if backend failed.

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
  // OPTIMISTIC UI
  // =========================================================

  const confirmDelete = async () => {

    if (!deleteExpense) {
      return;
    }


    const expenseToDelete =
      deleteExpense;


    const oldExpenses =
      [...expenses];


    // -------------------------------------------------------
    // REMOVE FROM UI IMMEDIATELY
    // -------------------------------------------------------

    setExpenses((previous) =>
      previous.filter(
        (expense) =>
          expense.id !==
          expenseToDelete.id
      )
    );


    // -------------------------------------------------------
    // CLOSE DELETE MODAL IMMEDIATELY
    // -------------------------------------------------------

    setDeleteExpense(null);


    // -------------------------------------------------------
    // DELETE FROM BACKEND
    // -------------------------------------------------------

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


      // Restore expense if
      // backend request fails.

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

  const totalExpense =
    expenses.reduce(
      (total, expense) =>
        total +
        Number(
          expense.amount || 0
        ),
      0
    );


  // =========================================================
  // CURRENT MONTH EXPENSE
  // =========================================================

  const today =
    new Date();

  const currentMonth =
    today.getMonth();

  const currentYear =
    today.getFullYear();


  const thisMonthExpense =
    expenses
      .filter((expense) => {

        if (!expense.expense_date) {
          return false;
        }

        const expenseDate =
          new Date(
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
          total +
          Number(
            expense.amount || 0
          ),
        0
      );


  // =========================================================
  // FORMAT MONEY
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
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateString) => {

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
  // CATEGORY STYLE
  // =========================================================

  const getCategoryStyle = (
    category
  ) => {

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
  // PAGE
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        flex
      "
    >

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div
        className="
          w-[280px]
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
          bg-slate-950
        "
      >

        <Topbar />


        <main
          className="
            p-6
            md:p-8
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
                  text-4xl
                  font-bold
                  text-white
                "
              >
                Expenses
              </h1>


              <p
                className="
                  text-slate-400
                  mt-2
                "
              >
                Track and manage your
                spending in one place.
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
                bg-violet-600
                hover:bg-violet-700
                text-white
                font-semibold
                transition
              "
            >

              <FaPlus />

              Add Expense

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
                bg-red-950
                border
                border-red-800
                text-red-300
              "
            >

              {error}

            </div>

          )}


          {/* =================================================
              SUMMARY CARDS
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-6
              mb-8
            "
          >

            {/* TOTAL */}

            <div
              className="
                bg-slate-800
                rounded-2xl
                p-6
                border
                border-slate-700
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-slate-400
                    "
                  >
                    Total Expenses
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-white
                      mt-2
                    "
                  >
                    ₹
                    {formatMoney(
                      totalExpense
                    )}
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-rose-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaWallet
                    className="
                      text-rose-600
                    "
                  />

                </div>

              </div>

            </div>


            {/* MONTH */}

            <div
              className="
                bg-slate-800
                rounded-2xl
                p-6
                border
                border-slate-700
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-slate-400
                    "
                  >
                    This Month
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-white
                      mt-2
                    "
                  >
                    ₹
                    {formatMoney(
                      thisMonthExpense
                    )}
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-orange-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaCalendarAlt
                    className="
                      text-orange-600
                    "
                  />

                </div>

              </div>

            </div>


            {/* COUNT */}

            <div
              className="
                bg-slate-800
                rounded-2xl
                p-6
                border
                border-slate-700
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-slate-400
                    "
                  >
                    Expense Entries
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-white
                      mt-2
                    "
                  >
                    {expenses.length}
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-violet-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaMoneyBillWave
                    className="
                      text-violet-600
                    "
                  />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              EXPENSE RECORDS
          ================================================== */}

          <div
            className="
              bg-slate-800
              rounded-3xl
              border
              border-slate-700
              overflow-hidden
            "
          >

            <div
              className="
                p-6
                border-b
                border-slate-700
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Expense Records
              </h2>


              <p
                className="
                  text-sm
                  text-slate-400
                  mt-1
                "
              >
                Your latest spending activity
              </p>

            </div>


            {/* =================================================
                LOADING
            ================================================== */}

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
                    border-slate-600
                    border-t-violet-500
                    rounded-full
                    animate-spin
                  "
                />

                <p
                  className="
                    text-slate-400
                    mt-4
                  "
                >
                  Loading expense records...
                </p>

              </div>

            ) : expenses.length === 0 ? (

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

                <FaWallet
                  className="
                    text-5xl
                    text-slate-600
                    mb-5
                  "
                />


                <h3
                  className="
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  No Expenses Yet
                </h3>


                <p
                  className="
                    text-slate-400
                    mt-2
                  "
                >
                  Start by adding your
                  first expense.
                </p>


                <button
                  onClick={openAddForm}
                  className="
                    cursor-pointer
                    mt-6
                    px-5
                    py-3
                    rounded-xl
                    bg-violet-600
                    hover:bg-violet-700
                    text-white
                    font-semibold
                  "
                >

                  <FaPlus
                    className="
                      inline
                      mr-2
                    "
                  />

                  Add Expense

                </button>

              </div>

            ) : (

              <div
                className="
                  overflow-x-auto
                "
              >

                <table
                  className="
                    w-full
                  "
                >

                  <thead>

                    <tr
                      className="
                        border-b
                        border-slate-700
                      "
                    >

                      <th
                        className="
                          text-left
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-slate-400
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
                          text-slate-400
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
                          text-slate-400
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
                          text-slate-400
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
                          text-slate-400
                        "
                      >
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {expenses.map(
                      (expense) => (

                        <tr
                          key={expense.id}
                          className="
                            border-b
                            border-slate-700
                            hover:bg-slate-750
                            transition
                          "
                        >

                          {/* EXPENSE */}

                          <td
                            className="
                              px-6
                              py-5
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <div
                                className="
                                  w-11
                                  h-11
                                  rounded-xl
                                  bg-rose-100
                                  flex
                                  items-center
                                  justify-center
                                "
                              >

                                <FaArrowDown
                                  className="
                                    text-rose-600
                                  "
                                />

                              </div>


                              <div>

                                <p
                                  className="
                                    font-semibold
                                    text-white
                                  "
                                >
                                  {expense.title}
                                </p>


                                {expense.description && (

                                  <p
                                    className="
                                      text-xs
                                      text-slate-400
                                      mt-1
                                      max-w-[250px]
                                      truncate
                                    "
                                  >
                                    {
                                      expense.description
                                    }
                                  </p>

                                )}

                              </div>

                            </div>

                          </td>


                          {/* CATEGORY */}

                          <td
                            className="
                              px-6
                              py-5
                            "
                          >

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
                              {expense.category}
                            </span>

                          </td>


                          {/* DATE */}

                          <td
                            className="
                              px-6
                              py-5
                              text-sm
                              text-slate-300
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
                                text-rose-500
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

                          <td
                            className="
                              px-6
                              py-5
                            "
                          >

                            <div
                              className="
                                flex
                                justify-end
                                gap-2
                              "
                            >

                              <button
                                onClick={() =>
                                  openEditForm(
                                    expense
                                  )
                                }
                                title="Edit expense"
                                className="
                                  cursor-pointer
                                  w-9
                                  h-9
                                  rounded-lg
                                  bg-violet-900
                                  text-violet-300
                                  hover:bg-violet-600
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
                                onClick={() =>
                                  setDeleteExpense(
                                    expense
                                  )
                                }
                                title="Delete expense"
                                className="
                                  cursor-pointer
                                  w-9
                                  h-9
                                  rounded-lg
                                  bg-rose-950
                                  text-rose-400
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

                          </td>

                        </tr>

                      )
                    )}

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
              bg-black/60
              backdrop-blur-sm
            "
            onClick={closeForm}
          />


          <div
            className="
              relative
              w-full
              max-w-2xl
              bg-slate-800
              rounded-3xl
              border
              border-slate-700
              shadow-2xl
              overflow-hidden
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                px-6
                py-5
                border-b
                border-slate-700
              "
            >

              <div>

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-white
                  "
                >
                  {editingExpense
                    ? "Edit Expense"
                    : "Add Expense"}
                </h2>


                <p
                  className="
                    text-sm
                    text-slate-400
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
                  bg-slate-700
                  hover:bg-slate-600
                  text-slate-300
                  flex
                  items-center
                  justify-center
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

                <div
                  className="
                    md:col-span-2
                  "
                >

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-slate-300
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
                      bg-slate-900
                      border
                      border-slate-600
                      text-white
                      placeholder-slate-500
                      focus:outline-none
                      focus:ring-2
                      focus:ring-violet-500
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
                      text-slate-300
                      mb-2
                    "
                  >
                    Amount
                  </label>


                  <div
                    className="
                      relative
                    "
                  >

                    <span
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
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
                        bg-slate-900
                        border
                        border-slate-600
                        text-white
                        placeholder-slate-500
                        focus:outline-none
                        focus:ring-2
                        focus:ring-violet-500
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
                      text-slate-300
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
                      bg-slate-900
                      border
                      border-slate-600
                      text-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-violet-500
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
                      text-slate-300
                      mb-2
                    "
                  >
                    Expense Date
                  </label>


                  <input
                    type="date"
                    name="expense_date"
                    value={
                      formData.expense_date
                    }
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-slate-900
                      border
                      border-slate-600
                      text-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-violet-500
                    "
                  />

                </div>


                {/* DESCRIPTION */}

                <div
                  className="
                    md:col-span-2
                  "
                >

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-slate-300
                      mb-2
                    "
                  >

                    Description

                    <span
                      className="
                        font-normal
                        text-slate-500
                      "
                    >
                      {" "}
                      (Optional)
                    </span>

                  </label>


                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    placeholder="Add some details about this expense..."
                    rows="4"
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      bg-slate-900
                      border
                      border-slate-600
                      text-white
                      placeholder-slate-500
                      resize-none
                      focus:outline-none
                      focus:ring-2
                      focus:ring-violet-500
                    "
                  />

                </div>

              </div>


              {/* BUTTONS */}

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  mt-7
                  pt-5
                  border-t
                  border-slate-700
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
                    bg-slate-700
                    hover:bg-slate-600
                    text-slate-200
                    font-semibold
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
                    bg-violet-600
                    hover:bg-violet-700
                    text-white
                    font-semibold
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
              bg-black/60
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
              bg-slate-800
              rounded-3xl
              border
              border-slate-700
              shadow-2xl
              p-7
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-rose-950
                flex
                items-center
                justify-center
                mb-5
              "
            >

              <FaTrash
                className="
                  text-rose-500
                  text-xl
                "
              />

            </div>


            <h2
              className="
                text-2xl
                font-bold
                text-white
              "
            >
              Delete Expense?
            </h2>


            <p
              className="
                text-slate-400
                mt-3
                leading-relaxed
              "
            >

              Are you sure you want to
              delete{" "}

              <span
                className="
                  font-semibold
                  text-white
                "
              >
                "{deleteExpense.title}"
              </span>

              ? This action cannot be
              undone.

            </p>


            <div
              className="
                flex
                justify-end
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
                  bg-slate-700
                  hover:bg-slate-600
                  text-slate-200
                  font-semibold
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
                  bg-rose-600
                  hover:bg-rose-700
                  text-white
                  font-semibold
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