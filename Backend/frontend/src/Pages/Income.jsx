import { useEffect, useState } from "react";

import {
  FaPlus,
  FaWallet,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaTimes,
  FaArrowUp,
} from "react-icons/fa";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import api from "../services/api";


function Income() {

  // =========================================================
  // STATE
  // =========================================================

  const [incomes, setIncomes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingIncome, setEditingIncome] = useState(null);

  const [deleteIncome, setDeleteIncome] = useState(null);

  const [saving, setSaving] = useState(false);


  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    source: "SALARY",
    description: "",
    income_date: "",
  });


  // =========================================================
  // FETCH INCOME
  // =========================================================

  const fetchIncomes = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access");

      const response = await api.get(
        "income/",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setIncomes(response.data);

    } catch (err) {

      console.error(
        "Income fetch error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load income records."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {

    fetchIncomes();

  }, []);


  // =========================================================
  // FORM INPUT
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

    setEditingIncome(null);

    setFormData({
      title: "",
      amount: "",
      source: "SALARY",
      description: "",
      income_date:
        new Date()
          .toISOString()
          .split("T")[0],
    });

    setShowForm(true);

  };


  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const openEditForm = (income) => {

    setEditingIncome(income);

    setFormData({
      title:
        income.title || "",

      amount:
        income.amount || "",

      source:
        income.source || "OTHER",

      description:
        income.description || "",

      income_date:
        income.income_date || "",
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

    setEditingIncome(null);

  };


  // =========================================================
  // ADD / UPDATE INCOME
  // OPTIMISTIC UI
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
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

      source:
        formData.source,

      description:
        formData.description.trim(),

      income_date:
        formData.income_date,

    };


    // =======================================================
    // UPDATE INCOME
    // =======================================================

    if (editingIncome) {

      const oldIncome =
        editingIncome;


      const updatedIncome = {

        ...oldIncome,

        ...data,

      };


      // -------------------------------------------------------
      // UPDATE UI IMMEDIATELY
      // -------------------------------------------------------

      setIncomes((previous) =>
        previous.map(
          (income) =>
            income.id ===
            oldIncome.id
              ? updatedIncome
              : income
        )
      );


      // -------------------------------------------------------
      // CLOSE MODAL IMMEDIATELY
      // -------------------------------------------------------

      setShowForm(false);

      setEditingIncome(null);

      setSaving(false);


      // -------------------------------------------------------
      // SAVE TO BACKEND IN BACKGROUND
      // -------------------------------------------------------

      try {

        const response =
          await api.put(
            `income/${oldIncome.id}/`,
            data,
            config
          );


        // Replace optimistic data
        // with actual backend data.

        if (response.data) {

          setIncomes((previous) =>
            previous.map(
              (income) =>
                income.id ===
                oldIncome.id
                  ? response.data
                  : income
            )
          );

        }

      } catch (err) {

        console.error(
          "Income update error:",
          err
        );


        // -----------------------------------------------------
        // RESTORE OLD DATA IF UPDATE FAILED
        // -----------------------------------------------------

        setIncomes((previous) =>
          previous.map(
            (income) =>
              income.id ===
              oldIncome.id
                ? oldIncome
                : income
          )
        );


        const responseData =
          err.response?.data;


        if (
          responseData &&
          typeof responseData ===
            "object"
        ) {

          const messages =
            Object.entries(
              responseData
            )
              .map(
                ([
                  field,
                  message,
                ]) => {

                  if (
                    Array.isArray(
                      message
                    )
                  ) {

                    return (
                      `${field}: ` +
                      `${message.join(", ")}`
                    );

                  }

                  return (
                    `${field}: ${message}`
                  );

                }
              )
              .join(" | ");


          setError(messages);

        } else {

          setError(
            "Unable to update income."
          );

        }

      }

      return;

    }


    // =======================================================
    // ADD INCOME
    // =======================================================

    const temporaryId =
      `temp-${Date.now()}`;


    const temporaryIncome = {

      id:
        temporaryId,

      title:
        data.title,

      amount:
        data.amount,

      source:
        data.source,

      description:
        data.description,

      income_date:
        data.income_date,

    };


    // -------------------------------------------------------
    // SHOW NEW INCOME IMMEDIATELY
    // -------------------------------------------------------

    setIncomes((previous) => [

      temporaryIncome,

      ...previous,

    ]);


    // -------------------------------------------------------
    // CLOSE MODAL IMMEDIATELY
    // -------------------------------------------------------

    setShowForm(false);

    setEditingIncome(null);

    setSaving(false);


    // -------------------------------------------------------
    // SAVE TO BACKEND IN BACKGROUND
    // -------------------------------------------------------

    try {

      const response =
        await api.post(
          "income/",
          data,
          config
        );


      // Replace temporary item
      // with actual database item.

      if (response.data) {

        setIncomes((previous) =>
          previous.map(
            (income) =>
              income.id ===
              temporaryId
                ? response.data
                : income
          )
        );

      }

    } catch (err) {

      console.error(
        "Income save error:",
        err
      );


      // -----------------------------------------------------
      // REMOVE TEMPORARY ITEM IF SAVE FAILED
      // -----------------------------------------------------

      setIncomes((previous) =>
        previous.filter(
          (income) =>
            income.id !==
            temporaryId
        )
      );


      const responseData =
        err.response?.data;


      if (
        responseData &&
        typeof responseData ===
          "object"
      ) {

        const messages =
          Object.entries(
            responseData
          )
            .map(
              ([
                field,
                message,
              ]) => {

                if (
                  Array.isArray(
                    message
                  )
                ) {

                  return (
                    `${field}: ` +
                    `${message.join(", ")}`
                  );

                }

                return (
                  `${field}: ${message}`
                );

              }
            )
            .join(" | ");


        setError(messages);

      } else {

        setError(
          "Unable to save income."
        );

      }

    }

  };


  // =========================================================
  // DELETE INCOME
  // OPTIMISTIC UI
  // =========================================================

  const confirmDelete = async () => {

    if (
      !deleteIncome ||
      saving
    ) {
      return;
    }


    const incomeToDelete =
      deleteIncome;


    const token =
      localStorage.getItem("access");


    const config = {

      headers: {

        Authorization:
          `Bearer ${token}`,

      },

    };


    // -------------------------------------------------------
    // REMOVE FROM SCREEN IMMEDIATELY
    // -------------------------------------------------------

    setIncomes((previous) =>
      previous.filter(
        (income) =>
          income.id !==
          incomeToDelete.id
      )
    );


    // -------------------------------------------------------
    // CLOSE DELETE DIALOG IMMEDIATELY
    // -------------------------------------------------------

    setDeleteIncome(null);

    setSaving(false);


    // -------------------------------------------------------
    // DELETE FROM BACKEND IN BACKGROUND
    // -------------------------------------------------------

    try {

      await api.delete(
        `income/${incomeToDelete.id}/`,
        config
      );

    } catch (err) {

      console.error(
        "Income delete error:",
        err
      );


      // -----------------------------------------------------
      // RESTORE IF DELETE FAILED
      // -----------------------------------------------------

      setIncomes((previous) => {

        const alreadyExists =
          previous.some(
            (income) =>
              income.id ===
              incomeToDelete.id
          );


        if (alreadyExists) {

          return previous;

        }


        return [

          incomeToDelete,

          ...previous,

        ];

      });


      setError(
        err.response?.data?.detail ||
        "Unable to delete income."
      );

    }

  };


  // =========================================================
  // CALCULATIONS
  // =========================================================

  const totalIncome =
    incomes.reduce(
      (total, income) =>
        total +
        Number(
          income.amount || 0
        ),
      0
    );


  const currentMonth =
    new Date().getMonth();


  const currentYear =
    new Date().getFullYear();


  const thisMonthIncome =
    incomes
      .filter((income) => {

        if (!income.income_date) {

          return false;

        }


        const date =
          new Date(
            income.income_date
          );


        return (

          date.getMonth() ===
            currentMonth &&

          date.getFullYear() ===
            currentYear

        );

      })
      .reduce(
        (total, income) =>
          total +
          Number(
            income.amount || 0
          ),
        0
      );


  // =========================================================
  // SOURCE DISPLAY
  // =========================================================

  const getSourceName = (
    source
  ) => {

    const names = {

      SALARY:
        "Salary",

      POCKET_MONEY:
        "Pocket Money",

      SCHOLARSHIP:
        "Scholarship",

      FREELANCING:
        "Freelancing",

      BUSINESS:
        "Business",

      OTHER:
        "Other",

    };


    return (
      names[source] ||
      source
    );

  };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    dateString
  ) => {

    if (!dateString) {

      return "-";

    }


    const date =
      new Date(
        dateString
      );


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
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (
    amount
  ) => {

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
  // UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-slate-50
        flex
      "
    >

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div
        className="
          w-[280px]
          bg-slate-950
          text-white
          flex-shrink-0
        "
      >

        <Sidebar />

      </div>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <div
        className="
          flex-1
          min-w-0
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
              PAGE HEADER
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
                  text-slate-800
                "
              >

                Income

              </h1>


              <p
                className="
                  text-slate-500
                  mt-2
                "
              >

                Track and manage all your
                income in one place.

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

              Add Income

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
                bg-rose-50
                border
                border-rose-200
                text-rose-700
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

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-6
              mb-8
            "
          >


            {/* TOTAL INCOME */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-slate-100
                shadow-sm
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
                      text-sm
                      text-slate-500
                    "
                  >

                    Total Income

                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-slate-800
                      mt-2
                    "
                  >

                    ₹
                    {formatMoney(
                      totalIncome
                    )}

                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-emerald-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaWallet
                    className="
                      text-emerald-600
                      text-xl
                    "
                  />

                </div>

              </div>

            </div>


            {/* THIS MONTH */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-slate-100
                shadow-sm
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
                      text-sm
                      text-slate-500
                    "
                  >

                    This Month

                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-slate-800
                      mt-2
                    "
                  >

                    ₹
                    {formatMoney(
                      thisMonthIncome
                    )}

                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-indigo-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaCalendarAlt
                    className="
                      text-indigo-600
                      text-xl
                    "
                  />

                </div>

              </div>

            </div>


            {/* ENTRIES */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-slate-100
                shadow-sm
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
                      text-sm
                      text-slate-500
                    "
                  >

                    Income Entries

                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-slate-800
                      mt-2
                    "
                  >

                    {incomes.length}

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
                      text-xl
                    "
                  />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              INCOME TABLE CARD
          ================================================== */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-slate-100
              shadow-sm
              overflow-hidden
            "
          >


            {/* TABLE HEADER */}

            <div
              className="
                p-6
                border-b
                border-slate-100
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                  text-slate-800
                "
              >

                Income Records

              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >

                Your latest income transactions

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
                    border-indigo-200
                    border-t-indigo-600
                    rounded-full
                    animate-spin
                  "
                ></div>


                <p
                  className="
                    text-slate-500
                    mt-4
                  "
                >

                  Loading income records...

                </p>

              </div>

            ) : incomes.length === 0 ? (

              /* EMPTY STATE */

              <div
                className="
                  min-h-[350px]
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
                    w-20
                    h-20
                    rounded-3xl
                    bg-indigo-50
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >

                  <FaWallet
                    className="
                      text-3xl
                      text-indigo-500
                    "
                  />

                </div>


                <h3
                  className="
                    text-xl
                    font-bold
                    text-slate-800
                  "
                >

                  No Income Yet

                </h3>


                <p
                  className="
                    text-slate-500
                    mt-2
                    max-w-md
                  "
                >

                  You haven't added any
                  income records yet.
                  Start by adding your
                  first income.

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

                  Add Your First Income

                </button>

              </div>

            ) : (

              /* TABLE */

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
                        bg-slate-50
                        border-b
                        border-slate-200
                      "
                    >

                      <th
                        className="
                          text-left
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-slate-500
                        "
                      >

                        Income

                      </th>


                      <th
                        className="
                          text-left
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-slate-500
                        "
                      >

                        Source

                      </th>


                      <th
                        className="
                          text-left
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-slate-500
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
                          text-slate-500
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
                          text-slate-500
                        "
                      >

                        Actions

                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {incomes.map(
                      (income) => (

                        <tr
                          key={income.id}
                          className="
                            border-b
                            border-slate-100
                            last:border-0
                            hover:bg-slate-50
                            transition
                          "
                        >


                          {/* TITLE */}

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
                                  bg-emerald-50
                                  flex
                                  items-center
                                  justify-center
                                  flex-shrink-0
                                "
                              >

                                <FaArrowUp
                                  className="
                                    text-emerald-600
                                  "
                                />

                              </div>


                              <div>

                                <p
                                  className="
                                    font-semibold
                                    text-slate-800
                                  "
                                >

                                  {income.title}

                                </p>


                                {income.description && (

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
                                      income.description
                                    }

                                  </p>

                                )}

                              </div>

                            </div>

                          </td>


                          {/* SOURCE */}

                          <td
                            className="
                              px-6
                              py-5
                            "
                          >

                            <span
                              className="
                                inline-flex
                                px-3
                                py-1
                                rounded-full
                                bg-indigo-50
                                text-indigo-700
                                text-xs
                                font-semibold
                              "
                            >

                              {getSourceName(
                                income.source
                              )}

                            </span>

                          </td>


                          {/* DATE */}

                          <td
                            className="
                              px-6
                              py-5
                              text-slate-600
                              text-sm
                            "
                          >

                            {formatDate(
                              income.income_date
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
                                text-emerald-600
                                whitespace-nowrap
                              "
                            >

                              +₹
                              {formatMoney(
                                income.amount
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
                                items-center
                                gap-2
                              "
                            >

                              <button
                                onClick={() =>
                                  openEditForm(
                                    income
                                  )
                                }
                                title="Edit income"
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
                                onClick={() =>
                                  setDeleteIncome(
                                    income
                                  )
                                }
                                title="Delete income"
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

          <div
            className="
              relative
              w-full
              max-w-2xl
              bg-white
              rounded-3xl
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
                border-slate-100
              "
            >

              <div>

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-slate-800
                  "
                >

                  {editingIncome
                    ? "Edit Income"
                    : "Add Income"}

                </h2>


                <p
                  className="
                    text-sm
                    text-slate-500
                    mt-1
                  "
                >

                  {editingIncome
                    ? "Update your income details."
                    : "Add a new income transaction."}

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
              className="
                p-6
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
                      text-slate-700
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
                    placeholder="e.g. Monthly Salary"
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
                      transition
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
                      text-slate-700
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
                        text-slate-500
                        font-semibold
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
                        border
                        border-slate-200
                        focus:outline-none
                        focus:ring-2
                        focus:ring-indigo-500
                        focus:border-transparent
                        transition
                      "
                    />

                  </div>

                </div>


                {/* SOURCE */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      mb-2
                    "
                  >

                    Source

                  </label>


                  <select
                    name="source"
                    value={formData.source}
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
                      transition
                    "
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


                {/* DATE */}

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      mb-2
                    "
                  >

                    Income Date

                  </label>


                  <input
                    type="date"
                    name="income_date"
                    value={
                      formData.income_date
                    }
                    onChange={handleChange}
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
                      transition
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
                      text-slate-700
                      mb-2
                    "
                  >

                    Description

                    <span
                      className="
                        font-normal
                        text-slate-400
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
                    placeholder="Add some details about this income..."
                    rows="4"
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-slate-200
                      resize-none
                      focus:outline-none
                      focus:ring-2
                      focus:ring-indigo-500
                      focus:border-transparent
                      transition
                    "
                  ></textarea>

                </div>

              </div>


              {/* FORM BUTTONS */}

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  mt-7
                  pt-5
                  border-t
                  border-slate-100
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
                    border-slate-200
                    text-slate-600
                    hover:bg-slate-50
                    font-semibold
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
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
                    : editingIncome
                      ? "Update Income"
                      : "Save Income"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {deleteIncome && (

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
              bg-slate-950/60
              backdrop-blur-sm
            "
            onClick={() => {

              if (!saving) {

                setDeleteIncome(null);

              }

            }}
          ></div>


          {/* CONFIRMATION */}

          <div
            className="
              relative
              w-full
              max-w-md
              bg-white
              rounded-3xl
              shadow-2xl
              p-7
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-rose-100
                flex
                items-center
                justify-center
                mb-5
              "
            >

              <FaTrash
                className="
                  text-rose-600
                  text-xl
                "
              />

            </div>


            <h2
              className="
                text-2xl
                font-bold
                text-slate-800
              "
            >

              Delete Income?

            </h2>


            <p
              className="
                text-slate-500
                mt-2
                leading-relaxed
              "
            >

              Are you sure you want to
              delete{" "}

              <span
                className="
                  font-semibold
                  text-slate-700
                "
              >

                "{deleteIncome.title}"

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
                onClick={() =>
                  setDeleteIncome(null)
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
                  disabled:opacity-50
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
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
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


export default Income;