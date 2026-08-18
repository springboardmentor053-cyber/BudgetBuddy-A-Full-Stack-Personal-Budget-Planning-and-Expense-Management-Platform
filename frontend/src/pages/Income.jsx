import { useEffect, useState } from "react";
import api from "../api";
import { getErrorMessage } from "../utils/errorHandler";


function Income() {

  const [incomeList, setIncomeList] = useState([]);
  const [filteredIncome, setFilteredIncome] = useState([]);

  const [title, setTitle] = useState("");
  const [source, setSource] = useState("SALARY");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");


  // =====================================================
  // FETCH INCOME WHEN PAGE LOADS
  // =====================================================

  useEffect(() => {

    fetchIncome();

  }, []);


  // =====================================================
  // SEARCH FILTER
  // =====================================================

  useEffect(() => {

    const filtered = incomeList.filter((income) =>

      income.title
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      income.source
        .toLowerCase()
        .includes(search.toLowerCase())

    );

    setFilteredIncome(filtered);

  }, [search, incomeList]);


  // =====================================================
  // GET INCOME
  // =====================================================

  const fetchIncome = async () => {

    try {

      const response = await api.get(
        "income/"
      );

      setIncomeList(response.data);

      setFilteredIncome(response.data);

    } catch (error) {

      console.error(
        "Error fetching income:",
        error
      );

      // Don't show session error here because
      // api.js should normally handle authentication.

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
  // EDIT INCOME
  // =====================================================

  const editIncome = (income) => {

    setEditingId(income.id);

    setTitle(income.title);

    setSource(income.source);

    setDescription(
      income.description || ""
    );

    setAmount(income.amount);

    setIncomeDate(
      income.income_date
    );

    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };


  // =====================================================
  // ADD / UPDATE INCOME
  // =====================================================

  const saveIncome = async (e) => {

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


    if (!source) {

      alert(
        "Income source is required."
      );

      return;

    }


    if (!incomeDate) {

      alert(
        "Income date is required."
      );

      return;

    }


    // ===================================================
    // INCOME DATA
    // ===================================================

    const incomeData = {

      title: title.trim(),

      amount: amount,

      source: source,

      description: description,

      income_date: incomeDate,

    };


    try {

      // =================================================
      // UPDATE
      // =================================================

      if (editingId) {

        await api.put(

          `income/${editingId}/`,

          incomeData

        );

        alert(
          "Income Updated Successfully"
        );

      }


      // =================================================
      // CREATE
      // =================================================

      else {

        await api.post(

          "income/",

          incomeData

        );

        alert(
          "Income Added Successfully"
        );

      }


      // =================================================
      // CLEAR FORM
      // =================================================

      setEditingId(null);

      setTitle("");

      setSource("SALARY");

      setDescription("");

      setAmount("");

      setIncomeDate("");


      // =================================================
      // REFRESH LIST
      // =================================================

      fetchIncome();

    } catch (error) {

      console.error(
        "Income save error:",
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
  // DELETE INCOME
  // =====================================================

  const deleteIncome = async (id) => {

    if (
      !window.confirm(
        "Delete this income?"
      )
    ) {

      return;

    }


    try {

      await api.delete(

        `income/${id}/`

      );


      alert(
        "Income Deleted Successfully"
      );


      fetchIncome();

    } catch (error) {

      console.error(
        "Income delete error:",
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
  // UI
  // =====================================================

  return (

    <>

      <div className="container mt-4">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="card shadow-lg border-0 bg-success text-white mb-4">

          <div className="card-body">

            <h2>
              💰 Income Management
            </h2>

            <p className="mb-0">

              Add, update and manage all
              your income sources.

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
                ? "✏ Update Income"
                : "➕ Add Income"}

            </h4>


            <form
              onSubmit={saveIncome}
            >


              {/* TITLE */}

              <input

                className="form-control mb-3"

                placeholder="Income Title"

                value={title}

                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }

                required

              />


              {/* SOURCE */}

              <select

                className="form-select mb-3"

                value={source}

                onChange={(e) =>
                  setSource(
                    e.target.value
                  )
                }

                required

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


              {/* DESCRIPTION */}

              <textarea

                className="form-control mb-3"

                placeholder="Description"

                value={description}

                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }

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


              {/* DATE */}

              <input

                type="date"

                className="form-control mb-3"

                value={incomeDate}

                onChange={(e) =>
                  setIncomeDate(
                    e.target.value
                  )
                }

                required

              />


              {/* SUBMIT */}

              <button

                type="submit"

                className="btn btn-success w-100 fw-bold"

              >

                {editingId
                  ? "✏ Update Income"
                  : "➕ Add Income"}

              </button>


              {/* CANCEL EDIT */}

              {editingId && (

                <button

                  type="button"

                  className="btn btn-secondary w-100 mt-2"

                  onClick={() => {

                    setEditingId(null);

                    setTitle("");

                    setSource("SALARY");

                    setDescription("");

                    setAmount("");

                    setIncomeDate("");

                  }}

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

          placeholder="🔍 Search Income..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

        />


        {/* ================================================= */}
        {/* INCOME HISTORY */}
        {/* ================================================= */}

        <div className="card shadow">

          <div className="card-header bg-dark text-white">

            <h4 className="mb-0">

              📋 Income History

            </h4>

          </div>


          <div className="card-body">

            <table className="table table-hover table-striped table-bordered align-middle">


              <thead className="table-success">

                <tr>

                  <th>
                    Title
                  </th>

                  <th>
                    Source
                  </th>

                  <th>
                    Amount
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

                {filteredIncome.length > 0 ? (

                  filteredIncome.map(
                    (income) => (

                      <tr
                        key={income.id}
                      >

                        <td>
                          {income.title}
                        </td>


                        <td>
                          {income.source}
                        </td>


                        <td className="text-success fw-bold">

                          ₹{" "}

                          {Number(
                            income.amount
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        <td>
                          {income.income_date}
                        </td>


                        <td>


                          {/* EDIT */}

                          <button

                            type="button"

                            className="btn btn-warning btn-sm me-2"

                            onClick={() =>
                              editIncome(
                                income
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
                              deleteIncome(
                                income.id
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

                        📭 No Income Records Found

                      </h5>


                      <small className="text-muted">

                        Add your first income
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

    </>

  );

}


export default Income;