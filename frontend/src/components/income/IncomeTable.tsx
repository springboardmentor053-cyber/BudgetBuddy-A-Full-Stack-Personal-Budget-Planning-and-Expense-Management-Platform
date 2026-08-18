import { useEffect, useState } from "react";
import { getIncome, deleteIncome } from "../../services/incomeService";

interface Income {
  id: number;
  title: string;
  amount: number;
  source: string;
  income_date: string;
}

interface Props {
  onEdit: (income: Income) => void;
}

function IncomeTable({ onEdit }: Props) {
  const [income, setIncome] = useState<Income[]>([]);

  async function loadIncome() {
    try {
      const response = await getIncome();
      setIncome(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this income?"
    );

    if (!confirmDelete) return;

    try {
      await deleteIncome(id);
      loadIncome();
    } catch (error) {
      console.log(error);
      alert("Failed to delete income.");
    }
  }

  useEffect(() => {
    loadIncome();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg rounded-xl p-6 mt-8">

      <h2 className="text-2xl font-bold mb-6">
        Income History
      </h2>

      <table className="w-full border-collapse">

        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border border-gray-300 dark:border-gray-600 p-3">Title</th>
            <th className="border border-gray-300 dark:border-gray-600 p-3">Amount</th>
            <th className="border border-gray-300 dark:border-gray-600 p-3">source</th>
            <th className="border border-gray-300 dark:border-gray-600 p-3">Date</th>
            <th className="border border-gray-300 dark:border-gray-600 p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {income.map((item) => (
            <tr key={item.id}>

              <td className="border border-gray-300 dark:border-gray-600 p-3">{item.title}</td>

              <td className="border border-gray-300 dark:border-gray-600 p-3">
                ₹{item.amount}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3">
                {item.source}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3">
                {item.income_date}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3">

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

export default IncomeTable;