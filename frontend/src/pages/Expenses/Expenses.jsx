import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaReceipt,
  FaChartPie,
  FaExchangeAlt,
} from "react-icons/fa";
import ExpenseModal from "../../components/forms/ExpenseModal";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../../api/expenseApi";
import { useSettings } from "../../context/SettingsContext"; // Using context for dynamic currency formatting

export default function Expenses() {
  // 1. Get the global money formatting function
  const { formatMoney } = useSettings();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [editingExpense, setEditingExpense] = useState(null);

  const loadExpenses = async () => {
    try {
      const response = await getExpenses();
      setExpenses(response.data || []);
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleAddExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
        setEditingExpense(null);
      } else {
        await addExpense(expenseData);
      }
      setOpenModal(false);
      loadExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setOpenModal(true);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const titleMatch = expense.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const categoryMatch =
        category === "All Categories" || expense.category === category;

      return titleMatch && categoryMatch;
    });
  }, [expenses, search, category]);

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    const cat = expense.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  const highestCategory =
    Object.keys(categoryTotals).length > 0
      ? Object.keys(categoryTotals).reduce((a, b) =>
          categoryTotals[a] > categoryTotals[b] ? a : b
        )
      : "N/A";

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white">
        <h1 className="text-2xl font-bold animate-pulse">Loading Expenses...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
           <h1 className="text-4xl font-bold text-white">
            Expenses Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage and track all your expenses in one place.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingExpense(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-semibold shadow-md transition self-start lg:self-auto"
        >
          <FaPlus />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid xl:grid-cols-3 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
            {/* 2. Dynamic Currency Formatting for Total */}
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {formatMoney(totalExpenses)}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500">
            <FaReceipt className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Highest Category</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {highestCategory}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-500">
            <FaChartPie className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Transactions</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {filteredExpenses.length}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-500">
            <FaExchangeAlt className="text-2xl" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid md:grid-cols-2 gap-6 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative">
          <FaSearch className="absolute left-4 top-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>All Categories</option>
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Entertainment</option>
          <option>Education</option>
          <option>Healthcare</option>
          <option>Bills</option>
          <option>Miscellaneous</option>
          <option>Other</option>
        </select>
      </div>

      {/* Expense Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 uppercase text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-800 dark:text-slate-200 text-sm">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <p className="text-base font-semibold">No Expenses Found</p>
                    <p className="text-xs mt-1">Start tracking your spending.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="p-4 pl-6 font-medium text-slate-900 dark:text-white">
                      {expense.title}
                    </td>

                    <td className="p-4">
                      <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
                        {expense.category}
                      </span>
                    </td>

                    {/* 3. Dynamic Currency Formatting for Row Item */}
                    <td className="p-4 font-bold text-red-600 dark:text-red-400">
                      {formatMoney(expense.amount)}
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {expense.expense_date}
                    </td>

                    <td className="p-4 pr-6">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Rendered Outside Main Layout Wrapper */}
      <ExpenseModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingExpense(null);
        }}
        onSave={handleAddExpense}
        expense={editingExpense}
      />
    </div>
  );
}