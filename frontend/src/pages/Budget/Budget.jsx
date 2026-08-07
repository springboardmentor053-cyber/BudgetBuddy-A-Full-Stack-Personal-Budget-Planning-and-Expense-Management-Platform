import { useEffect, useState } from "react";
import {
  FaPlus,
  FaWallet,
  FaMoneyBillWave,
  FaPiggyBank,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

import {
  getBudgets,
  createBudget,
  deleteBudget,
  updateBudget,
} from "../../services/budgetService";

import { getExpenses } from "../../services/expenseService";
import { useSettings } from "../../context/SettingsContext"; // Dynamic currency context

export default function Budget() {
  // Extract global currency formatting function & current currency code
  const { formatMoney, currency } = useSettings();

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

      setBudgets(budgetData || []);
      setExpenses(expenseData || []);
    } catch (error) {
      console.error("Error fetching budget data:", error);
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
      console.error(error);
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
    (sum, budget) => sum + Number(budget.monthly_limit || 0),
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
      .reduce((total, expense) => total + Number(expense.amount || 0), 0);

    return sum + spent;
  }, 0);

  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Budget Planner
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Monitor and manage your monthly spending limits.
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
          className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-semibold shadow-md transition self-start lg:self-auto"
        >
          <FaPlus />
          Create Budget
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid xl:grid-cols-3 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Budget</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {formatMoney(totalBudget)}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500">
            <FaWallet className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Spent</p>
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {formatMoney(totalSpent)}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500">
            <FaMoneyBillWave className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Remaining Budget</p>
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {formatMoney(remainingBudget)}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 text-green-500">
            <FaPiggyBank className="text-2xl" />
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
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
              .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

            const remaining = Number(budget.monthly_limit) - spent;

            const percentage =
              Number(budget.monthly_limit) > 0
                ? Math.min((spent / Number(budget.monthly_limit)) * 100, 100)
                : 0;

            return (
              <div
                key={budget.id}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {budget.category}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Period: {budget.month}/{budget.year}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      title="Edit Budget"
                    >
                      <FaEdit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                      title="Delete Budget"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Limit: <span className="font-bold text-slate-900 dark:text-white">{formatMoney(budget.monthly_limit)}</span>
                  </span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {percentage.toFixed(0)}% Used
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      percentage >= 100
                        ? "bg-red-500"
                        : percentage >= 80
                        ? "bg-yellow-500"
                        : "bg-gradient-to-r from-blue-500 to-cyan-400"
                    }`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-sm pt-1">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Spent: </span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {formatMoney(spent)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Remaining: </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatMoney(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-12 border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
            <p className="text-lg font-semibold">No Budgets Created</p>
            <p className="text-xs mt-1">Click 'Create Budget' above to establish monthly spending goals.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Budget" : "Create Budget"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Monthly Limit ({currency || "USD"})
                </label>
                <input
                  type="number"
                  name="monthly_limit"
                  placeholder="e.g. 5000"
                  value={formData.monthly_limit}
                  onChange={handleChange}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Month (1-12)
                  </label>
                  <input
                    type="number"
                    name="month"
                    min="1"
                    max="12"
                    placeholder="Month"
                    value={formData.month}
                    onChange={handleChange}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    placeholder="Year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
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
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold transition text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition text-sm shadow-md"
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