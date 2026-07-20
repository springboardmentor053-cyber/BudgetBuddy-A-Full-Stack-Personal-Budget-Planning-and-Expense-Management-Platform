import { useEffect, useState } from "react";
import axios from "axios";

function Income() {
  const [incomeList, setIncomeList] = useState([]);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("SALARY");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState("");
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("access");
  console.log("Access Token:", token);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch Income
  const fetchIncome = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/income/",
        config
      );

      setIncomeList(response.data);
    } catch (error) {
      console.error(error);
      alert("Please login first.");
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  // Edit
  const editIncome = (income) => {
    setEditingId(income.id);
    setTitle(income.title);
    setSource(income.source);
    setDescription(income.description);
    setAmount(income.amount);
    setIncomeDate(income.income_date);
  };

  // Add / Update
  const saveIncome = async (e) => {
    e.preventDefault();

    const incomeData = {
      title,
      amount,
      source,
      description,
      income_date: incomeDate,
    };

    try {
      if (editingId) {
        await axios.put(
          `http://127.0.0.1:8000/api/income/${editingId}/`,
          incomeData,
          config
        );

        alert("Income Updated Successfully");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/income/",
          incomeData,
          config
        );

        alert("Income Added Successfully");
      }

      setEditingId(null);
      setTitle("");
      setAmount("");
      setSource("SALARY");
      setDescription("");
      setIncomeDate("");

      fetchIncome();

    } catch (error) {
  console.error(error);

  if (error.response) {
    console.log("Backend Error:", error.response.data);
    alert(JSON.stringify(error.response.data));
  } else {
    alert(error.message);
  }
}
  };

  // Delete
  const deleteIncome = async (id) => {
    if (!window.confirm("Delete this income?")) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/income/${id}/`,
        config
      );

      alert("Income Deleted Successfully");

      fetchIncome();

    } catch (error) {
  console.error(error);

  if (error.response) {
    console.log(error.response.data);
    alert(JSON.stringify(error.response.data));
  } else {
    alert(error.message);
  }
}
  };

  return (
    <div className="container mt-5">

      <h2 className="text-success mb-4">
        Income Management
      </h2>

      <form onSubmit={saveIncome}>

        <input
          className="form-control mb-3"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select
          className="form-control mb-3"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="SALARY">Salary</option>
          <option value="POCKET_MONEY">Pocket Money</option>
          <option value="SCHOLARSHIP">Scholarship</option>
          <option value="FREELANCING">Freelancing</option>
          <option value="BUSINESS">Business</option>
          <option value="OTHER">Other</option>
        </select>

        <textarea
          className="form-control mb-3"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          className="form-control mb-3"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <input
          type="date"
          className="form-control mb-3"
          value={incomeDate}
          onChange={(e) => setIncomeDate(e.target.value)}
          required
        />

        <button className="btn btn-success w-100">
          {editingId ? "Update Income" : "Add Income"}
        </button>

      </form>

      <hr />

      <h3>Income History</h3>

      <table className="table table-bordered table-hover">

        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Source</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {incomeList.length > 0 ? (
            incomeList.map((income) => (
              <tr key={income.id}>

                <td>{income.title}</td>
                <td>{income.source}</td>
                <td>₹ {income.amount}</td>
                <td>{income.income_date}</td>

                <td>

                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => editIncome(income)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteIncome(income.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No Income Found
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}

export default Income;