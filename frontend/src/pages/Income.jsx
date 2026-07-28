import { useEffect, useState } from "react";
import axios from "axios";

function Income() {

  // ================= INCOME DATA =================

  const [incomes, setIncomes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ================= FORM DATA =================

  const [title, setTitle] = useState("");

  const [source, setSource] = useState("SALARY");

  const [amount, setAmount] = useState("");

  const [description, setDescription] = useState("");

  const [incomeDate, setIncomeDate] = useState("");


  // ================= EDIT MODE =================

  const [editingIncome, setEditingIncome] = useState(null);

  const [submitting, setSubmitting] = useState(false);


  // ================= API URL =================

  const API_URL = "http://127.0.0.1:8000/api/income/";


  // ================= FETCH INCOME =================

  useEffect(() => {

    fetchIncomes();

  }, []);


  const fetchIncomes = async () => {

    try {

      setLoading(true);

      setError("");

      const token = localStorage.getItem("access");

      const response = await axios.get(
        API_URL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIncomes(response.data);

    } catch (error) {

      console.error(
        "Income Fetch Error:",
        error
      );

      setError(
        "Unable to load income data."
      );

    } finally {

      setLoading(false);

    }

  };


  // ================= CLEAR FORM =================

  const clearForm = () => {

    setTitle("");

    setSource("SALARY");

    setAmount("");

    setDescription("");

    setIncomeDate("");

    setEditingIncome(null);

  };


  // ================= ADD / UPDATE INCOME =================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSubmitting(true);

      const token =
        localStorage.getItem("access");


      // ================= UPDATE =================

      if (editingIncome) {

        const response = await axios.put(

          `${API_URL}${editingIncome.id}/`,

          {
            title: title,

            source: source,

            amount: amount,

            description: description,

            income_date: incomeDate,
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }

        );


        // Update income in UI

        setIncomes(

          incomes.map((income) =>

            income.id === editingIncome.id

              ? response.data

              : income

          )

        );


        alert(
          "Income updated successfully!"
        );


      }

      // ================= ADD =================

      else {

        const response = await axios.post(

          API_URL,

          {
            title: title,

            source: source,

            amount: amount,

            description: description,

            income_date: incomeDate,
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }

        );


        // Add new income to list

        setIncomes([

          ...incomes,

          response.data

        ]);


        alert(
          "Income added successfully!"
        );

      }


      // Clear form

      clearForm();


    } catch (error) {

      console.error(
        "Income Submit Error:",
        error
      );


      // Show backend error if available

      if (
        error.response &&
        error.response.data
      ) {

        console.error(
          "Backend Error:",
          error.response.data
        );

      }


      alert(
        editingIncome
          ? "Unable to update income."
          : "Unable to add income."
      );


    } finally {

      setSubmitting(false);

    }

  };


  // ================= EDIT INCOME =================

  const handleEdit = (income) => {

    // Store selected income

    setEditingIncome(income);


    // Fill form

    setTitle(
      income.title || ""
    );

    setSource(
      income.source || "SALARY"
    );

    setAmount(
      income.amount || ""
    );

    setDescription(
      income.description || ""
    );

    setIncomeDate(
      income.income_date || ""
    );


    // Scroll to form

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  };


  // ================= DELETE INCOME =================

  const handleDelete = async (incomeId) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this income?"
      );


    if (!confirmDelete) {

      return;

    }


    try {

      const token =
        localStorage.getItem("access");


      await axios.delete(

        `${API_URL}${incomeId}/`,

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

          },

        }

      );


      // Remove deleted income

      setIncomes(

        incomes.filter(

          (income) =>
            income.id !== incomeId

        )

      );


      // If deleting currently edited income

      if (
        editingIncome &&
        editingIncome.id === incomeId
      ) {

        clearForm();

      }


      alert(
        "Income deleted successfully!"
      );


    } catch (error) {

      console.error(
        "Delete Income Error:",
        error
      );


      alert(
        "Unable to delete income."
      );

    }

  };


  // ================= CANCEL EDIT =================

  const handleCancelEdit = () => {

    clearForm();

  };


  // ================= UI =================

  return (

    <div className="income-page">


      {/* ================= HEADER ================= */}

      <div className="page-header">

        <h1>
          Income Management
        </h1>

        <p>
          Track and manage your income sources.
        </p>

      </div>



      {/* ================= ADD / EDIT FORM ================= */}

      <div className="income-form-panel">


        <h2>

          {editingIncome
            ? "Edit Income"
            : "Add New Income"}

        </h2>


        <form
          onSubmit={handleSubmit}
        >


          {/* ================= TITLE ================= */}

          <div className="form-group">

            <label>
              Income Title
            </label>

            <input

              type="text"

              placeholder=
                "Example: Monthly Salary"

              value={title}

              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }

              required

            />

          </div>



          {/* ================= SOURCE ================= */}

          <div className="form-group">

            <label>
              Income Source
            </label>

            <select

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

          </div>



          {/* ================= AMOUNT ================= */}

          <div className="form-group">

            <label>
              Amount
            </label>

            <input

              type="number"

              placeholder=
                "Enter amount"

              value={amount}

              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }

              min="0"

              step="0.01"

              required

            />

          </div>



          {/* ================= DATE ================= */}

          <div className="form-group">

            <label>
              Income Date
            </label>

            <input

              type="date"

              value={incomeDate}

              onChange={(e) =>
                setIncomeDate(
                  e.target.value
                )
              }

              required

            />

          </div>



          {/* ================= DESCRIPTION ================= */}

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea

              placeholder=
                "Enter description"

              value={description}

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

            />

          </div>



          {/* ================= BUTTONS ================= */}

          <div className="form-buttons">


            <button

              type="submit"

              disabled={submitting}

            >

              {submitting

                ? "Please wait..."

                : editingIncome

                ? "✏️ Update Income"

                : "+ Add Income"

              }

            </button>


            {/* CANCEL EDIT */}

            {editingIncome && (

              <button

                type="button"

                onClick={
                  handleCancelEdit
                }

              >

                Cancel Edit

              </button>

            )}


          </div>


        </form>

      </div>



      {/* ================= INCOME LIST ================= */}

      <div className="income-list-panel">


        <h2>
          Your Income
        </h2>



        {/* ================= LOADING ================= */}

        {loading ? (

          <p>
            Loading income...
          </p>


        ) : error ? (


          /* ================= ERROR ================= */

          <p>
            {error}
          </p>


        ) : incomes.length === 0 ? (


          /* ================= EMPTY ================= */

          <p>
            No income records found.
          </p>


        ) : (


          /* ================= INCOME LIST ================= */

          <div className="income-list">


            {incomes.map(
              (income) => (


                <div

                  className="income-item"

                  key={income.id}

                >


                  {/* ================= DETAILS ================= */}

                  <div>

                    <h3>
                      {income.title}
                    </h3>

                    <p>
                      {income.source}
                    </p>

                    {income.description && (

                      <p>
                        {income.description}
                      </p>

                    )}

                  </div>



                  {/* ================= AMOUNT + DATE ================= */}

                  <div>

                    <strong>

                      ₹{income.amount}

                    </strong>

                    <p>

                      {income.income_date}

                    </p>

                  </div>



                  {/* ================= ACTION BUTTONS ================= */}

                  <div className="income-actions">


                    {/* EDIT */}

                    <button

                      type="button"

                      onClick={() =>
                        handleEdit(
                          income
                        )
                      }

                    >

                      ✏️ Edit

                    </button>



                    {/* DELETE */}

                    <button

                      type="button"

                      onClick={() =>
                        handleDelete(
                          income.id
                        )
                      }

                    >

                      🗑️ Delete

                    </button>


                  </div>


                </div>

              )

            )}

          </div>

        )}

      </div>


    </div>

  );

}

export default Income;