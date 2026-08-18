import { useEffect, useState } from "react";
import {
  getBudgets,
  deleteBudget,
} from "../../services/budgetServices";

interface Props {
  onEdit: (budget: any) => void;
}

function BudgetTable({ onEdit }: Props) {
  const [budgets, setBudgets] = useState<any[]>([]);

  async function loadBudgets() {
    try {
      const response = await getBudgets();
      setBudgets(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadBudgets();
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this budget?")) return;

    try {
      await deleteBudget(id);
      loadBudgets();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg rounded-xl p-6 mt-8">

      <h2 className="text-2xl font-bold mb-6">
        Budget History
      </h2>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100 dark:bg-gray-700">

            <th className="border border-gray-300 dark:border-gray-600 p-3">Category</th>
            <th className="border border-gray-300 dark:border-gray-600 p-3">Budget</th>
            <th className="border border-gray-300 dark:border-gray-600 p-3">Month</th>
            <th className="border border-gray-300 dark:border-gray-600 p-3">Year</th>
            <th className="border border-gray-300 dark:border-gray-600 p-3">Actions</th>

          </tr>

        </thead>

        <tbody>

          {budgets.map((budget) => (

            <tr key={budget.id}>

              <td className="border border-gray-300 dark:border-gray-600 p-3 p-3">
                {budget.category}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3">
                ₹{budget.budget_amount}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3">
                {budget.month}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3">
                {budget.year}
              </td>

              <td className="border border-gray-300 dark:border-gray-600 p-3">

                <button
                  onClick={() => onEdit(budget)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(budget.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
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

export default BudgetTable;