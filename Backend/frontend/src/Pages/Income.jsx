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

      const token = localStorage.getItem("access");

      const response = await api.get("income/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIncomes(response.data);
    } catch (err) {
      console.error("Income fetch error:", err);

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
    setEditingIncome(null);

    setFormData({
      title: "",
      amount: "",
      source: "SALARY",
      description: "",
      income_date: new Date().toISOString().split("T")[0],
    });

    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const openEditForm = (income) => {
    setEditingIncome(income);

    setFormData({
      title: income.title || "",
      amount: income.amount || "",
      source: income.source || "OTHER",
      description: income.description || "",
      income_date: income.income_date || "",
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
        title: formData.title.trim(),
        amount: formData.amount,
        source: formData.source,
        description: formData.description.trim(),
        income_date: formData.income_date,
      };

      // EDIT
      if (editingIncome) {
        await api.put(
          `income/${editingIncome.id}/`,
          data,
          config
        );
      }

      // ADD
      else {
        await api.post(
          "income/",
          data,
          config
        );
      }

      await fetchIncomes();

      setShowForm(false);
      setEditingIncome(null);
    } catch (err) {
      console.error("Income save error:", err);

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
        setError("Unable to save income.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE INCOME
  // =========================================================

  const confirmDelete = async () => {
    if (!deleteIncome) {
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("access");

      await api.delete(
        `income/${deleteIncome.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDeleteIncome(null);

      await fetchIncomes();
    } catch (err) {
      console.error("Income delete error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete income."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const totalIncome = incomes.reduce(
    (total, income) =>
      total + Number(income.amount || 0),
    0
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthIncome = incomes
    .filter((income) => {
      if (!income.income_date) {
        return false;
      }

      const date = new Date(income.income_date);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce(
      (total, income) =>
        total + Number(income.amount || 0),
      0
    );

  // =========================================================
  // SOURCE DISPLAY
  // =========================================================

  const getSourceName = (source) => {
    const names = {
      SALARY: "Salary",
      POCKET_MONEY: "Pocket Money",
      SCHOLARSHIP: "Scholarship",
      FREELANCING: "Freelancing",
      BUSINESS: "Business",
      OTHER: "Other",
    };

    return names[source] || source;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }

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
  // UI
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

          <div className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-5
            mb-8
          ">

            <div className="min-w-0">

              <h1 className="
                text-3xl
                md:text-4xl
                font-bold
                text-[#101C2E]
              ">
                Income
              </h1>

              <p className="text-[#786E62] mt-2">
                Track and manage all your income in one place.
              </p>

            </div>


            {/* ADD INCOME */}

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
                shadow-md
                hover:shadow-lg
                transition-all
                duration-300
                w-full
                sm:w-auto
                shrink-0
              "
            >
              <FaPlus />

              Add Income
            </button>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="
              mb-6
              p-4
              rounded-xl
              bg-[#56061D]/10
              border
              border-[#56061D]/20
              text-[#56061D]
            ">

              <div className="
                flex
                items-start
                justify-between
                gap-4
              ">

                <p className="text-sm font-medium">
                  {error}
                </p>

                <button
                  onClick={() => setError("")}
                  className="
                    cursor-pointer
                    text-[#56061D]
                    hover:text-[#7A0B2A]
                    shrink-0
                  "
                >
                  <FaTimes />
                </button>

              </div>

            </div>
          )}


          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
            mb-8
          ">

            {/* TOTAL INCOME */}

            <div className="
              bg-white
              rounded-2xl
              p-6
              border
              border-[#E5DDD2]
              shadow-[0_8px_25px_rgba(16,28,46,0.12)]
            ">

              <div className="
                flex
                items-center
                justify-between
                gap-4
              ">

                <div className="min-w-0">

                  <p className="text-sm text-[#6F665B]">
                    Total Income
                  </p>

                  <h2 className="
                    text-3xl
                    font-bold
                    text-[#101C2E]
                    mt-2
                    truncate
                  ">
                    ₹{formatMoney(totalIncome)}
                  </h2>

                  <p className="text-xs text-[#92643E] mt-2">
                    All recorded income
                  </p>

                </div>

                <div className="
                  w-14
                  h-14
                  shrink-0
                  rounded-2xl
                  bg-[#92643E]
                  flex
                  items-center
                  justify-center
                ">

                  <FaWallet className="text-[#F3EBDD] text-xl" />

                </div>

              </div>

            </div>


            {/* THIS MONTH */}

            <div className="
              bg-white
              rounded-2xl
              p-6
              border
              border-[#E5DDD2]
              shadow-[0_8px_25px_rgba(16,28,46,0.12)]
            ">

              <div className="
                flex
                items-center
                justify-between
                gap-4
              ">

                <div className="min-w-0">

                  <p className="text-sm text-[#6F665B]">
                    This Month
                  </p>

                  <h2 className="
                    text-3xl
                    font-bold
                    text-[#101C2E]
                    mt-2
                    truncate
                  ">
                    ₹{formatMoney(thisMonthIncome)}
                  </h2>

                  <p className="text-xs text-[#92643E] mt-2">
                    Income received this month
                  </p>

                </div>

                <div className="
                  w-14
                  h-14
                  shrink-0
                  rounded-2xl
                  bg-[#56061D]
                  flex
                  items-center
                  justify-center
                ">

                  <FaCalendarAlt className="text-[#F3EBDD] text-xl" />

                </div>

              </div>

            </div>


            {/* ENTRIES */}

            <div className="
              bg-white
              rounded-2xl
              p-6
              border
              border-[#E5DDD2]
              shadow-[0_8px_25px_rgba(16,28,46,0.12)]
            ">

              <div className="
                flex
                items-center
                justify-between
                gap-4
              ">

                <div className="min-w-0">

                  <p className="text-sm text-[#6F665B]">
                    Income Entries
                  </p>

                  <h2 className="
                    text-3xl
                    font-bold
                    text-[#101C2E]
                    mt-2
                  ">
                    {incomes.length}
                  </h2>

                  <p className="text-xs text-[#92643E] mt-2">
                    Recorded transactions
                  </p>

                </div>

                <div className="
                  w-14
                  h-14
                  shrink-0
                  rounded-2xl
                  bg-[#92643E]
                  flex
                  items-center
                  justify-center
                ">

                  <FaMoneyBillWave className="text-[#F3EBDD] text-xl" />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              INCOME TABLE
          ================================================= */}

          <div className="
            bg-white
            rounded-3xl
            border
            border-[#E5DDD2]
            shadow-[0_10px_30px_rgba(16,28,46,0.15)]
            overflow-hidden
            w-full
          ">

            {/* TABLE HEADER */}

            <div className="
              p-5
              sm:p-6
              border-b
              border-[#E5DDD2]
            ">

              <h2 className="
                text-2xl
                font-bold
                text-[#101C2E]
              ">
                Income Records
              </h2>

              <p className="text-sm text-[#786E62] mt-1">
                Your latest income transactions
              </p>

            </div>


            {/* LOADING */}

            {loading ? (

              <div className="
                min-h-[300px]
                flex
                flex-col
                items-center
                justify-center
                p-6
              ">

                <div className="
                  w-10
                  h-10
                  border-4
                  border-[#92643E]/30
                  border-t-[#92643E]
                  rounded-full
                  animate-spin
                "></div>

                <p className="text-[#786E62] mt-4">
                  Loading income records...
                </p>

              </div>

            ) : incomes.length === 0 ? (

              /* EMPTY STATE */

              <div className="
                min-h-[350px]
                flex
                flex-col
                items-center
                justify-center
                text-center
                p-8
              ">

                <div className="
                  w-20
                  h-20
                  rounded-3xl
                  bg-[#92643E]/15
                  flex
                  items-center
                  justify-center
                  mb-5
                ">

                  <FaWallet className="text-3xl text-[#92643E]" />

                </div>

                <h3 className="
                  text-xl
                  font-bold
                  text-[#101C2E]
                ">
                  No Income Yet
                </h3>

                <p className="
                  text-[#786E62]
                  mt-2
                  max-w-md
                ">
                  You haven't added any income records yet.
                  Start by adding your first income.
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
                    hover:bg-[#6E0A28]
                    text-[#F3EBDD]
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

              <div className="overflow-x-auto">

                <table className="w-full min-w-[750px]">

                  <thead>

                    <tr className="
                      bg-[#F8F5EF]
                      border-b
                      border-[#E5DDD2]
                    ">

                      <th className="
                        text-left
                        px-6
                        py-4
                        text-sm
                        font-semibold
                        text-[#786E62]
                      ">
                        Income
                      </th>

                      <th className="
                        text-left
                        px-6
                        py-4
                        text-sm
                        font-semibold
                        text-[#786E62]
                      ">
                        Source
                      </th>

                      <th className="
                        text-left
                        px-6
                        py-4
                        text-sm
                        font-semibold
                        text-[#786E62]
                      ">
                        Date
                      </th>

                      <th className="
                        text-right
                        px-6
                        py-4
                        text-sm
                        font-semibold
                        text-[#786E62]
                      ">
                        Amount
                      </th>

                      <th className="
                        text-right
                        px-6
                        py-4
                        text-sm
                        font-semibold
                        text-[#786E62]
                      ">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {incomes.map((income) => (

                      <tr
                        key={income.id}
                        className="
                          border-b
                          border-[#E5DDD2]
                          last:border-0
                          hover:bg-[#F3EBDD]
                          transition
                        "
                      >

                        {/* TITLE */}

                        <td className="px-6 py-5">

                          <div className="
                            flex
                            items-center
                            gap-3
                          ">

                            <div className="
                              w-11
                              h-11
                              rounded-xl
                              bg-[#92643E]/20
                              flex
                              items-center
                              justify-center
                              flex-shrink-0
                            ">

                              <FaArrowUp className="text-[#C79A6B]" />

                            </div>


                            <div className="min-w-0">

                              <p className="
                                font-semibold
                                text-[#101C2E]
                                truncate
                                max-w-[250px]
                              ">
                                {income.title}
                              </p>

                              {income.description && (
                                <p className="
                                  text-xs
                                  text-[#8B8175]
                                  mt-1
                                  max-w-[250px]
                                  truncate
                                ">
                                  {income.description}
                                </p>
                              )}

                            </div>

                          </div>

                        </td>


                        {/* SOURCE */}

                        <td className="px-6 py-5">

                          <span className="
                            inline-flex
                            px-3
                            py-1
                            rounded-full
                            bg-[#92643E]/20
                            text-[#D6B18B]
                            text-xs
                            font-semibold
                          ">
                            {getSourceName(income.source)}
                          </span>

                        </td>


                        {/* DATE */}

                        <td className="
                          px-6
                          py-5
                          text-[#6F665B]
                          text-sm
                        ">

                          {formatDate(income.income_date)}

                        </td>


                        {/* AMOUNT */}

                        <td className="
                          px-6
                          py-5
                          text-right
                        ">

                          <span className="
                            font-bold
                            text-[#C79A6B]
                            whitespace-nowrap
                          ">
                            +₹{formatMoney(income.amount)}
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-6 py-5">

                          <div className="
                            flex
                            justify-end
                            items-center
                            gap-2
                          ">

                            {/* EDIT */}

                            <button
                              onClick={() => openEditForm(income)}
                              title="Edit income"
                              className="
                                cursor-pointer
                                w-9
                                h-9
                                rounded-lg
                                bg-white
                                border
                                border-[#92643E]/40
                                text-[#C79A6B]
                                hover:bg-[#92643E]
                                hover:text-[#101C2E]
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
                              onClick={() => setDeleteIncome(income)}
                              title="Delete income"
                              className="
                                cursor-pointer
                                w-9
                                h-9
                                rounded-lg
                                bg-[#56061D]/30
                                border
                                border-[#56061D]/50
                                text-[#D98A9E]
                                hover:bg-[#56061D]
                                hover:text-[#101C2E]
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

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          p-4
        ">

          {/* BACKDROP */}

          <div
            className="
              absolute
              inset-0
              bg-[#101C2E]/50
              backdrop-blur-sm
            "
            onClick={closeForm}
          ></div>


          {/* MODAL */}

          <div className="
            relative
            w-full
            max-w-2xl
            max-h-[90vh]
            bg-white
            rounded-3xl
            shadow-2xl
            border
            border-[#E5DDD2]
            overflow-hidden
            flex
            flex-col
          ">

            {/* MODAL HEADER */}

            <div className="
              flex
              items-center
              justify-between
              gap-4
              px-5
              sm:px-6
              py-5
              border-b
              border-[#E5DDD2]
              flex-shrink-0
            ">

              <div className="min-w-0">

                <h2 className="
                  text-2xl
                  font-bold
                  text-[#101C2E]
                ">

                  {editingIncome
                    ? "Edit Income"
                    : "Add Income"}

                </h2>

                <p className="
                  text-sm
                  text-[#786E62]
                  mt-1
                ">

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
                  shrink-0
                  rounded-xl
                  bg-[#F3EBDD]
                  hover:bg-[#E8DCC8]
                  text-[#6F665B]
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
              className="p-5 sm:p-6 overflow-y-auto"
            >

              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-5
              ">

                {/* TITLE */}

                <div className="md:col-span-2">

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-[#101C2E]
                    mb-2
                  ">
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
                      border-[#D8C8B4]
                      bg-white
                      text-[#101C2E]
                      placeholder:text-[#A99F91]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#92643E]
                      focus:border-transparent
                      transition
                    "
                  />

                </div>


                {/* AMOUNT */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-[#101C2E]
                    mb-2
                  ">
                    Amount
                  </label>

                  <div className="relative">

                    <span className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#6F665B]
                      font-semibold
                    ">
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
                        border-[#D8C8B4]
                        bg-white
                        text-[#101C2E]
                        placeholder:text-[#A99F91]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#92643E]
                        focus:border-transparent
                        transition
                      "
                    />

                  </div>

                </div>


                {/* SOURCE */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-[#101C2E]
                    mb-2
                  ">
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
                      border-[#D8C8B4]
                      bg-white
                      text-[#101C2E]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#92643E]
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

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-[#101C2E]
                    mb-2
                  ">
                    Income Date
                  </label>

                  <input
                    type="date"
                    name="income_date"
                    value={formData.income_date}
                    onChange={handleChange}
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
                      focus:ring-[#92643E]
                      focus:border-transparent
                      transition
                    "
                  />

                </div>


                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-[#101C2E]
                    mb-2
                  ">

                    Description

                    <span className="
                      font-normal
                      text-[#8F8274]
                    ">
                      {" "} (Optional)
                    </span>

                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add some details about this income..."
                    rows="4"
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-[#D8C8B4]
                      bg-white
                      text-[#101C2E]
                      placeholder:text-[#A99F91]
                      resize-none
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#92643E]
                      focus:border-transparent
                      transition
                    "
                  ></textarea>

                </div>

              </div>


              {/* FORM BUTTONS */}

              <div className="
                flex
                flex-col-reverse
                sm:flex-row
                sm:justify-end
                gap-3
                mt-7
                pt-5
                border-t
                border-[#E5DDD2]
              ">

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
                    bg-[#56061D]
                    hover:bg-[#6E0A28]
                    text-[#F3EBDD]
                    font-semibold
                    transition
                    shadow-lg
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

        <div className="
          fixed
          inset-0
          z-[60]
          flex
          items-center
          justify-center
          p-4
        ">

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
                setDeleteIncome(null);
              }
            }}
          ></div>


          {/* CONFIRMATION */}

          <div className="
            relative
            w-full
            max-w-md
            bg-white
            rounded-3xl
            shadow-2xl
            border
            border-[#E5DDD2]
            p-6
            sm:p-7
          ">

            <div className="
              w-14
              h-14
              rounded-2xl
              bg-[#56061D]/40
              flex
              items-center
              justify-center
              mb-5
            ">

              <FaTrash className="text-[#D98A9E] text-xl" />

            </div>


            <h2 className="
              text-2xl
              font-bold
              text-[#101C2E]
            ">
              Delete Income?
            </h2>


            <p className="
              text-[#786E62]
              mt-2
              leading-relaxed
            ">

              Are you sure you want to delete{" "}

              <span className="
                font-semibold
                text-[#101C2E]
              ">

                "{deleteIncome.title}"

              </span>

              ? This action cannot be undone.

            </p>


            <div className="
              flex
              flex-col-reverse
              sm:flex-row
              sm:justify-end
              gap-3
              mt-7
            ">

              <button
                onClick={() => setDeleteIncome(null)}
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
                  bg-[#56061D]
                  hover:bg-[#6E0A28]
                  text-[#F3EBDD]
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