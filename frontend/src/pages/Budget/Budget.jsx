import {
  FaPlus,
  FaWallet,
  FaMoneyBillWave,
  FaPiggyBank,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { useEffect, useState } from "react";

import {
  getBudgets,
  createBudget,
  deleteBudget,
  updateBudget,
} from "../../services/budgetService";

import { getExpenses } from "../../services/expenseService";

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    monthly_limit: "",
    month: "",
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const budgetData = await getBudgets();
      const expenseData = await getExpenses();

      setBudgets(budgetData);
      setExpenses(expenseData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSave = async () => {
  try {

    if (editingId) {
      await updateBudget(editingId, formData);
    } else {
      await createBudget(formData);
    }

    setEditingId(null);

    setShowModal(false);

    setFormData({
      category: "",
      monthly_limit: "",
      month: "",
      year: new Date().getFullYear(),
    });

    fetchData();

  } catch (error) {
    console.log(error);
    alert("Something went wrong.");
  }
};
const handleEdit = (budget) => {
  setEditingId(budget.id);

  setFormData({
    category: budget.category,
    monthly_limit: budget.monthly_limit,
    month: budget.month,
    year: budget.year,
  });

  setShowModal(true);
};
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?"))
      return;

    try {
      await deleteBudget(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete budget.");
    }
  };

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + Number(budget.monthly_limit),
    0
  );

  const totalSpent = budgets.reduce((sum, budget) => {
  const spent = expenses
    .filter(
      (expense) =>
        expense.category === budget.category &&
        new Date(expense.expense_date).getMonth() + 1 === Number(budget.month) &&
        new Date(expense.expense_date).getFullYear() === Number(budget.year)
    )
    .reduce((total, expense) => total + Number(expense.amount), 0);

  return sum + spent;
}, 0);

  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">

  {/* Header */}
  <div className="flex flex-col md:flex-row justify-between items-center mb-8">

    <div>
      <h1 className="text-4xl font-bold">
        Budget Planner
      </h1>

      <p className="text-gray-400 mt-2">
        Monitor your monthly spending limits.
      </p>
    </div>

    <button
  onClick={() => {
    setEditingId(null);

    setFormData({
      category: "",
      monthly_limit: "",
      month: "",
      year: new Date().getFullYear(),
    });

    setShowModal(true);
  }}
  className="mt-4 md:mt-0 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
>
  <FaPlus />
  Create Budget
</button>
  </div>

  {/* Summary Cards */}

  <div className="grid md:grid-cols-3 gap-6 mb-10">

    <div className="bg-slate-800 rounded-2xl p-6">
      <FaWallet className="text-cyan-400 text-4xl mb-4" />

      <h3 className="text-gray-400">
        Total Budget
      </h3>

      <h2 className="text-3xl font-bold mt-2">
        ₹{Number(totalBudget).toLocaleString()}
      </h2>
    </div>

    <div className="bg-slate-800 rounded-2xl p-6">
      <FaMoneyBillWave className="text-red-400 text-4xl mb-4" />

      <h3 className="text-gray-400">
        Total Spent
      </h3>

      <h2 className="text-3xl font-bold text-red-400 mt-2">
        ₹ {Number(totalSpent).toLocaleString()}
      </h2>
    </div>

    <div className="bg-slate-800 rounded-2xl p-6">
      <FaPiggyBank className="text-green-400 text-4xl mb-4" />

      <h3 className="text-gray-400">
        Remaining Budget
      </h3>

      <h2 className="text-3xl font-bold text-green-400 mt-2">
        ₹ {Number(remainingBudget).toLocaleString()}
      </h2>
    </div>

  </div>

  {/* Budget Cards */}

  <div className="grid md:grid-cols-2 gap-6">

    {budgets.length > 0 ? (

      budgets.map((budget) => {

       const spent = expenses
  .filter(
    (expense) =>
      expense.category === budget.category &&
      new Date(expense.expense_date).getMonth() + 1 === Number(budget.month) &&
new Date(expense.expense_date).getFullYear() === Number(budget.year)
  )
  .reduce((sum, expense) => sum + Number(expense.amount), 0);

        const remaining =
          Number(budget.monthly_limit) - spent;

        const percentage =
          Number(budget.monthly_limit) > 0
            ? Math.min(
                (spent / Number(budget.monthly_limit)) * 100,
                100
              )
            : 0;

        return (

          <div
            key={budget.id}
            className="bg-slate-800 rounded-2xl p-6"
          >

           <div className="flex justify-between items-center mb-4">

  <div>
    <h2 className="text-xl font-semibold">
      {budget.category}
    </h2>

    <p className="text-cyan-400 font-semibold">
      ₹ {budget.monthly_limit}
    </p>
  </div>

  <div className="flex gap-3">
    <button
      onClick={() => handleEdit(budget)}
      className="text-cyan-400 hover:text-cyan-300"
      title="Edit Budget"
    >
    <FaEdit size={20} />
    </button>

    <button
      onClick={() => handleDelete(budget.id)}
      className="text-red-500 hover:text-red-400"
      title="Delete Budget"
    >
      <FaTrash size={20} />
    </button>
  </div>

</div>
            <p className="text-gray-400">
              Month: {budget.month}
            </p>

            <p className="text-gray-400">
              Year: {budget.year}
            </p>

            <div className="mt-4">

              <p>
                Spent:
                <span className="text-red-400 ml-2">
                  ₹ {spent}
                </span>
              </p>

              <p>
                Remaining:
                <span className="text-green-400 ml-2">
                  ₹ {Number(remaining).toLocaleString()}
                </span>
              </p>

              <div className="w-full bg-slate-700 rounded-full h-3 mt-4">

                <div
                  className={`h-3 rounded-full ${
                    percentage >= 100
                      ? "bg-red-500"
                      : percentage >= 80
                      ? "bg-yellow-400"
                      : "bg-cyan-400"
                  }`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

              <p className="text-sm text-gray-400 mt-2">
                {percentage.toFixed(0)}% Used
              </p>

            </div>

          </div>

        );
      })

    ) : (

      <div className="col-span-2 text-center text-gray-400">
        No budgets found.
      </div>

    )}

  </div>
        {/* Create Budget Modal */}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">

            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "Edit Budget" : "Create Budget"}
            </h2>

            <div className="space-y-4">

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600"
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Shopping">Shopping</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Bills">Bills</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>

              <input
                type="number"
                name="monthly_limit"
                placeholder="Monthly Limit"
                value={formData.monthly_limit}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600"
              />

              <input
                type="number"
                name="month"
                min="1"
                max="12"
                placeholder="Month (1-12)"
                value={formData.month}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600"
              />

              <input
                type="number"
                name="year"
                placeholder="Year"
                value={formData.year}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600"
              />

            </div>

            <div className="flex justify-end gap-3 mt-6">

             <button
  onClick={() => {
    setShowModal(false);
    setEditingId(null);

    setFormData({
      category: "",
      monthly_limit: "",
      month: "",
      year: new Date().getFullYear(),
    });
  }}
  className="px-5 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
>
  Cancel
</button>

              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold"
              >
                {editingId ? "Update Budget" : "Save Budget"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}