import { useEffect, useState } from "react";
import axios from "axios";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("access");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/expenses/",
        config
      );

      setExpenses(response.data);

    } catch (error) {
      console.error(error);
      alert("Please login first.");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Edit Expense
  const editExpense = (expense) => {
    setEditingId(expense.id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(expense.date);
  };

  // Add / Update Expense
  const saveExpense = async (e) => {
    e.preventDefault();

    const expenseData = {
      title,
      amount,
      category,
      date,
    };

    try {
      if (editingId) {

        await axios.put(
          `http://127.0.0.1:8000/api/expenses/${editingId}/`,
          expenseData,
          config
        );

        alert("Expense Updated Successfully");

      } else {

        await axios.post(
          "http://127.0.0.1:8000/api/expenses/",
          expenseData,
          config
        );

        alert("Expense Added Successfully");
      }

      setEditingId(null);
      setTitle("");
      setAmount("");
      setCategory("FOOD");
      setDate("");

      fetchExpenses();

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

  // Delete Expense
  const deleteExpense = async (id) => {

    if (!window.confirm("Delete this expense?")) return;

    try {

      await axios.delete(
        `http://127.0.0.1:8000/api/expenses/${id}/`,
        config
      );

      alert("Expense Deleted Successfully");

      fetchExpenses();

    } catch (error) {

      console.error(error);

      if (error.response) {
        alert(JSON.stringify(error.response.data));
      } else {
        alert(error.message);
      }

    }
  };

  return (
    <div className="container mt-5">

      <h2 className="text-primary mb-4">
        Expense Management
      </h2>

      <form onSubmit={saveExpense}>

        <input
          className="form-control mb-3"
          placeholder="Expense Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          className="form-control mb-3"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select
          className="form-control mb-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="FOOD">Food</option>
          <option value="TRAVEL">Travel</option>
          <option value="SHOPPING">Shopping</option>
          <option value="EDUCATION">Education</option>
          <option value="ENTERTAINMENT">Entertainment</option>
          <option value="HEALTHCARE">Healthcare</option>
          <option value="BILLS">Bills</option>
          <option value="MISCELLANEOUS">Miscellaneous</option>
        </select>

        <input
          type="date"
          className="form-control mb-3"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <button className="btn btn-primary w-100">
          {editingId ? "Update Expense" : "Add Expense"}
        </button>

      </form>

      <hr />

      <h3 className="mb-3">
        Expense List
      </h3>

      <table className="table table-bordered table-hover">

        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <tr key={expense.id}>

                <td>{expense.title}</td>
                <td>₹ {expense.amount}</td>
                <td>{expense.category}</td>
                <td>{expense.date}</td>

                <td>

                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => editExpense(expense)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteExpense(expense.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No Expenses Found
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}

export default Expenses;