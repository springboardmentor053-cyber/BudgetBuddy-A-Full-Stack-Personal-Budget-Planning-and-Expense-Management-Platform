import { useEffect, useState } from "react";
import api from "../api";
import { getErrorMessage } from "../utils/errorHandler";


function Expenses() {

  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [date, setDate] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");


  // =====================================================
  // FETCH EXPENSES WHEN PAGE LOADS
  // =====================================================

  useEffect(() => {

    fetchExpenses();

  }, []);


  // =====================================================
  // SEARCH FILTER
  // =====================================================

  useEffect(() => {

    const filtered = expenses.filter((expense) =>

      expense.title
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      expense.category
        .toLowerCase()
        .includes(search.toLowerCase())

    );

    setFilteredExpenses(filtered);

  }, [search, expenses]);


  // =====================================================
  // GET EXPENSES
  // =====================================================

  const fetchExpenses = async () => {

    try {

      const response = await api.get(
        "expenses/"
      );

      setExpenses(response.data);

      setFilteredExpenses(
        response.data
      );

    } catch (error) {

      console.error(
        "Error fetching expenses:",
        error
      );


      // 401 is handled by api.js

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
  // EDIT EXPENSE
  // =====================================================

  const editExpense = (expense) => {

    setEditingId(expense.id);

    setTitle(expense.title);

    setAmount(expense.amount);

    setCategory(expense.category);

    setDate(expense.date);


    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };


  // =====================================================
  // ADD / UPDATE EXPENSE
  // =====================================================

  const saveExpense = async (e) => {

    e.preventDefault();


    // ===================================================
    // FRONTEND VALIDATION
    // ===================================================

    if (!title.trim()) {

      alert(
        "Title cannot be empty."
      );

      return;

    }


    if (!amount || Number(amount) <= 0) {

      alert(
        "Amount must be greater than zero."
      );

      return;

    }


    if (!category) {

      alert(
        "Expense category is required."
      );

      return;

    }


    if (!date) {

      alert(
        "Expense date is required."
      );

      return;

    }


    // ===================================================
    // EXPENSE DATA
    // ===================================================

    const expenseData = {

      title: title.trim(),

      amount: amount,

      category: category,

      date: date,

    };


    try {

      // =================================================
      // UPDATE
      // =================================================

      if (editingId) {

        await api.put(

          `expenses/${editingId}/`,

          expenseData

        );

        alert(
          "Expense Updated Successfully"
        );

      }


      // =================================================
      // CREATE
      // =================================================

      else {

        await api.post(

          "expenses/",

          expenseData

        );

        alert(
          "Expense Added Successfully"
        );

      }


      // =================================================
      // CLEAR FORM
      // =================================================

      setEditingId(null);

      setTitle("");

      setAmount("");

      setCategory("FOOD");

      setDate("");


      // =================================================
      // REFRESH LIST
      // =================================================

      fetchExpenses();

    } catch (error) {

      console.error(
        "Expense save error:",
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
  // DELETE EXPENSE
  // =====================================================

  const deleteExpense = async (id) => {

    if (
      !window.confirm(
        "Delete this expense?"
      )
    ) {

      return;

    }


    try {

      await api.delete(

        `expenses/${id}/`

      );


      alert(
        "Expense Deleted Successfully"
      );


      fetchExpenses();

    } catch (error) {

      console.error(
        "Expense delete error:",
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

    setTitle("");

    setAmount("");

    setCategory("FOOD");

    setDate("");

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <>

      <div className="container mt-4">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="card shadow-lg border-0 bg-danger text-white mb-4">

          <div className="card-body">

            <h2>
              💸 Expense Management
            </h2>

            <p className="mb-0">

              Track and manage all your
              expenses efficiently.

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
                ? "✏ Update Expense"
                : "➕ Add Expense"}

            </h4>


            <form
              onSubmit={saveExpense}
            >


              {/* TITLE */}

              <input

                className="form-control mb-3"

                placeholder="Expense Title"

                value={title}

                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }

                required

              />


              {/* AMOUNT */}

              <input

                type="number"

                className="form-control mb-3"

                placeholder="Amount"

                value={amount}

                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }

                min="0.01"

                step="0.01"

                required

              />


              {/* CATEGORY */}

              <select

                className="form-select mb-3"

                value={category}

                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }

                required

              >

                <option value="FOOD">
                  Food
                </option>

                <option value="TRAVEL">
                  Travel
                </option>

                <option value="SHOPPING">
                  Shopping
                </option>

                <option value="EDUCATION">
                  Education
                </option>

                <option value="ENTERTAINMENT">
                  Entertainment
                </option>

                <option value="HEALTHCARE">
                  Healthcare
                </option>

                <option value="BILLS">
                  Bills
                </option>

                <option value="MISCELLANEOUS">
                  Miscellaneous
                </option>

              </select>


              {/* DATE */}

              <input

                type="date"

                className="form-control mb-3"

                value={date}

                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }

                required

              />


              {/* SUBMIT */}

              <button

                type="submit"

                className="btn btn-danger w-100 fw-bold"

              >

                {editingId
                  ? "✏ Update Expense"
                  : "➕ Add Expense"}

              </button>


              {/* CANCEL EDIT */}

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
        {/* SEARCH */}
        {/* ================================================= */}

        <input

          type="text"

          className="form-control mb-4"

          placeholder="🔍 Search Expenses..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

        />


        {/* ================================================= */}
        {/* EXPENSE HISTORY */}
        {/* ================================================= */}

        <div className="card shadow">

          <div className="card-header bg-dark text-white">

            <h4 className="mb-0">

              📋 Expense History

            </h4>

          </div>


          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-hover table-striped table-bordered align-middle">


                <thead className="table-danger">

                  <tr>

                    <th>
                      Title
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Date
                    </th>

                    <th width="170">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredExpenses.length > 0 ? (

                    filteredExpenses.map(
                      (expense) => (

                        <tr
                          key={expense.id}
                        >

                          <td>
                            {expense.title}
                          </td>


                          <td className="text-danger fw-bold">

                            ₹{" "}

                            {Number(
                              expense.amount
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </td>


                          <td>

                            <span className="badge bg-secondary">

                              {expense.category}

                            </span>

                          </td>


                          <td>
                            {expense.date}
                          </td>


                          <td>


                            {/* EDIT */}

                            <button

                              type="button"

                              className="btn btn-warning btn-sm me-2"

                              onClick={() =>
                                editExpense(
                                  expense
                                )
                              }

                            >

                              ✏ Edit

                            </button>


                            {/* DELETE */}

                            <button

                              type="button"

                              className="btn btn-danger btn-sm"

                              onClick={() =>
                                deleteExpense(
                                  expense.id
                                )
                              }

                            >

                              🗑 Delete

                            </button>


                          </td>

                        </tr>

                      )

                    )

                  ) : (

                    <tr>

                      <td

                        colSpan="5"

                        className="text-center py-4"

                      >

                        <h5 className="text-secondary">

                          📭 No Expense Records Found

                        </h5>


                        <small className="text-muted">

                          Add your first expense
                          to get started.

                        </small>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>


      </div>

    </>

  );

}


export default Expenses;