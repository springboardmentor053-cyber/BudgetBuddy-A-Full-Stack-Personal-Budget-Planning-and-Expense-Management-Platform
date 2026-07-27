import { useEffect, useState } from "react";
import {
  getExpense,
  deleteExpense,
} from "../../services/expenseService";

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface Props {
  onEdit: (expense: Expense) => void;
}

function ExpenseTable({ onEdit }: Props) {
  const [expense, setExpense] = useState<Expense[]>([]);

  async function loadExpense() {
    try {
      const response = await getExpense();
      setExpense(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    try {
      await deleteExpense(id);
      loadExpense();
    } catch (error) {
      console.log(error);
      alert("Failed to delete expense.");
    }
  }

  useEffect(() => {
    loadExpense();
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mt-8">

      <h2 className="text-2xl font-bold mb-6">
        Expense History
      </h2>

      <table className="w-full border-collapse">

        <thead>

          <tr className="bg-gray-100">

            <th className="border p-3">Title</th>

            <th className="border p-3">Amount</th>

            <th className="border p-3">Category</th>

            <th className="border p-3">Date</th>

            <th className="border p-3">Actions</th>

          </tr>

        </thead>

        <tbody>

          {expense.map((item) => (

            <tr key={item.id}>

              <td className="border p-3">
                {item.title}
              </td>

              <td className="border p-3">
                ₹{item.amount}
              </td>

              <td className="border p-3">
                {item.category}
              </td>

              <td className="border p-3">
                {item.date}
              </td>

              <td className="border p-3">

                <button
                  onClick={() => onEdit(item)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default ExpenseTable;