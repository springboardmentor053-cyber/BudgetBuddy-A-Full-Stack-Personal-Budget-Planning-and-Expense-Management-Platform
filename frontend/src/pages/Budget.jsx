import { useEffect, useState } from "react";
import api from "../api";
import { getErrorMessage } from "../utils/errorHandler";


function Budget() {

  const [budgets, setBudgets] = useState([]);
  const [filteredBudgets, setFilteredBudgets] = useState([]);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");


  // =====================================================
  // FETCH BUDGETS
  // =====================================================

  const fetchBudgets = async () => {

    try {

      const response = await api.get(
        "budgets/"
      );

      setBudgets(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      setFilteredBudgets(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Error fetching budgets:",
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
  // LOAD BUDGETS
  // =====================================================

  useEffect(() => {

    fetchBudgets();

  }, []);


  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {

    const searchText =
      search.toLowerCase().trim();


    const filtered = budgets.filter(
      (budget) =>

        budget.category
          ?.toLowerCase()
          .includes(searchText)

        ||

        budget.month
          ?.toLowerCase()
          .includes(searchText)

        ||

        String(
          budget.year
        ).includes(searchText)

    );


    setFilteredBudgets(
      filtered
    );

  }, [
    search,
    budgets
  ]);


  // =====================================================
  // ADD BUDGET
  // =====================================================

  const addBudget = async (e) => {

    e.preventDefault();


    // ===================================================
    // FRONTEND VALIDATION
    // ===================================================

    if (!category) {

      alert(
        "Please select a budget category."
      );

      return;

    }


    if (
      !budgetAmount ||
      Number(budgetAmount) <= 0
    ) {

      alert(
        "Budget amount must be greater than zero."
      );

      return;

    }


    if (!month) {

      alert(
        "Please select a month."
      );

      return;

    }


    if (!year) {

      alert(
        "Please enter a year."
      );

      return;

    }


    const numericYear =
      Number(year);


    if (
      !Number.isInteger(
        numericYear
      )
    ) {

      alert(
        "Please enter a valid year."
      );

      return;

    }


    if (numericYear < 2000) {

      alert(
        "Please enter a valid year."
      );

      return;

    }


    // ===================================================
    // CHECK DUPLICATE BEFORE API REQUEST
    // ===================================================

    const duplicate =
      budgets.some(
        (budget) =>

          budget.category ===
            category &&

          budget.month ===
            month &&

          Number(
            budget.year
          ) === numericYear

      );


    if (duplicate) {

      alert(

        `A budget already exists for ${category} in ${month} ${numericYear}.`

      );

      return;

    }


    // ===================================================
    // SEND TO BACKEND
    // ===================================================

    try {

      await api.post(

        "budgets/",

        {

          category:

            category,

          budget_amount:

            budgetAmount,

          month:

            month,

          year:

            numericYear,

        }

      );


      alert(
        "Budget Added Successfully"
      );


      // =================================================
      // CLEAR FORM
      // =================================================

      setCategory("");

      setBudgetAmount("");

      setMonth("");

      setYear("");


      // =================================================
      // REFRESH
      // =================================================

      fetchBudgets();

    } catch (error) {

      console.error(
        "Budget add error:",
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
  // DELETE BUDGET
  // =====================================================

  const deleteBudget = async (id) => {

    if (
      !window.confirm(
        "Delete this budget?"
      )
    ) {

      return;

    }


    try {

      await api.delete(

        `budgets/${id}/`

      );


      alert(
        "Budget Deleted Successfully"
      );


      fetchBudgets();

    } catch (error) {

      console.error(
        "Budget delete error:",
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

      <div className="container mt-5">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="card shadow-lg border-0 bg-primary text-white mb-4">

          <div className="card-body">

            <h2>
              📊 Budget Planning
            </h2>

            <p className="mb-0">

              Plan and manage your
              monthly budgets efficiently.

            </p>

          </div>

        </div>


        {/* ================================================= */}
        {/* ADD BUDGET */}
        {/* ================================================= */}

        <div className="card shadow mb-4">

          <div className="card-body">

            <h4 className="mb-4">
              ➕ Add Budget
            </h4>


            <form
              onSubmit={addBudget}
            >


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

                <option value="">
                  Select Category
                </option>

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


              {/* BUDGET AMOUNT */}

              <input

                type="number"

                className="form-control mb-3"

                placeholder="Budget Amount"

                value={budgetAmount}

                onChange={(e) =>
                  setBudgetAmount(
                    e.target.value
                  )
                }

                min="0.01"

                step="0.01"

                required

              />


              {/* MONTH */}

              <select

                className="form-select mb-3"

                value={month}

                onChange={(e) =>
                  setMonth(
                    e.target.value
                  )
                }

                required

              >

                <option value="">
                  Select Month
                </option>

                <option value="January">
                  January
                </option>

                <option value="February">
                  February
                </option>

                <option value="March">
                  March
                </option>

                <option value="April">
                  April
                </option>

                <option value="May">
                  May
                </option>

                <option value="June">
                  June
                </option>

                <option value="July">
                  July
                </option>

                <option value="August">
                  August
                </option>

                <option value="September">
                  September
                </option>

                <option value="October">
                  October
                </option>

                <option value="November">
                  November
                </option>

                <option value="December">
                  December
                </option>

              </select>


              {/* YEAR */}

              <input

                type="number"

                className="form-control mb-3"

                placeholder="Year"

                value={year}

                onChange={(e) =>
                  setYear(
                    e.target.value
                  )
                }

                min="2000"

                max="2100"

                required

              />


              {/* SUBMIT */}

              <button

                type="submit"

                className="btn btn-primary w-100 fw-bold"

              >

                ➕ Add Budget

              </button>

            </form>

          </div>

        </div>


        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <input

          type="text"

          className="form-control mb-3"

          placeholder="🔍 Search Budget"

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

        />


        {/* ================================================= */}
        {/* BUDGET HISTORY */}
        {/* ================================================= */}

        <div className="card shadow">

          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-hover table-striped table-bordered align-middle">


                <thead className="table-dark">

                  <tr>

                    <th>
                      Category
                    </th>

                    <th>
                      Budget
                    </th>

                    <th>
                      Month
                    </th>

                    <th>
                      Year
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredBudgets.length > 0 ? (

                    filteredBudgets.map(
                      (budget) => (

                        <tr
                          key={budget.id}
                        >

                          <td>

                            <span className="badge bg-secondary">

                              {budget.category}

                            </span>

                          </td>


                          <td className="fw-bold">

                            ₹{" "}

                            {Number(
                              budget.budget_amount
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </td>


                          <td>
                            {budget.month}
                          </td>


                          <td>
                            {budget.year}
                          </td>


                          <td>

                            <button

                              type="button"

                              className="btn btn-danger btn-sm"

                              onClick={() =>
                                deleteBudget(
                                  budget.id
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

                          📭 No Budgets Found

                        </h5>


                        <small className="text-muted">

                          Create your first
                          budget to get started.

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


export default Budget;