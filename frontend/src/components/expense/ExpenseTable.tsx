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
  expense_date: string;
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
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mt-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">

      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Expense History
      </h2>

      <table className="w-full border-collapse">

        <thead>

          <tr className="bg-gray-100 dark:bg-gray-700">

            <th className="border border-gray-300 dark:border-gray-600 p-3 text-gray-800 dark:text-white">Title</th>

            <th className="border border-gray-300 dark:border-gray-600 p-3 text-gray-800 dark:text-white">Amount</th>

            <th className="border border-gray-300 dark:border-gray-600 p-3 text-gray-800 dark:text-white">Category</th>

            <th className="border border-gray-300 dark:border-gray-600 p-3 text-gray-800 dark:text-white">Date</th>

            <th className="border border-gray-300 dark:border-gray-600 p-3 text-gray-800 dark:text-white">Actions</th>

          </tr>

        </thead>

        <tbody>

          {expense.map((item) => (

            <tr
  key={item.id}
  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
>

              <td className="border border-gray-300 dark:border-gray-600 p-3 text-gray-800 dark:text-gray-200">
                {item.title}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3 text-gray-800 dark:text-gray-200">
                ₹{item.amount}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3 text-gray-800 dark:text-gray-200">
                {item.category}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3 text-gray-800 dark:text-gray-200">
                {item.expense_date}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3 text-gray-800 dark:text-gray-200">

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