import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import ExpenseModal from "../../components/forms/ExpenseModal";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../../api/expenseApi";
export default function Expenses() {
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
      console.error(error);
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
    console.error(error);
  }
};
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (error) {
      console.error(error);
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
      <>
       <ExpenseModal
    isOpen={openModal}
    onClose={() => {
        setOpenModal(false);
        setEditingExpense(null);
    }}
    onSave={handleAddExpense}
    expense={editingExpense}
/>

        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">
          <h1 className="text-2xl font-bold">Loading Expenses...</h1>
        </div>
      </>
    );
  }

  return (
    <>
      <ExpenseModal
        isOpen={openModal}
        onClose={() => {
            setOpenModal(false);
            setEditingExpense(null);
        }}
        onSave={handleAddExpense}
        expense={editingExpense}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Expenses</h1>
            <p className="text-gray-400 mt-2">
              Manage and track all your expenses.
            </p>
          </div>

          <button
            className="mt-4 md:mt-0 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
            onClick={() => {
  setEditingExpense(null);
  setOpenModal(true);
}}
          >
            <FaPlus />
            Add Expense
          </button>
        </div>

        {/* Search */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 p-3 rounded-xl bg-slate-800 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
        <div className="overflow-x-auto bg-slate-800 rounded-2xl shadow-lg">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 text-gray-400"
                  >
                    No expenses found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-slate-700 hover:bg-slate-700 transition"
                  >
                    <td className="p-4">{expense.title}</td>

                    <td className="p-4">
                      <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                        {expense.category}
                      </span>
                    </td>

                    <td className="p-4 text-red-400 font-semibold">
                      ₹ {Number(expense.amount || 0).toLocaleString()}
                    </td>

                    <td className="p-4">{expense.expense_date}</td>

                    <td className="p-4">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-cyan-400 hover:text-cyan-300 transition"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-400 hover:text-red-300 transition"
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

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-gray-400">Total Expenses</h3>
            <h2 className="text-3xl font-bold text-red-400 mt-2">
              ₹ {totalExpenses.toLocaleString()}
            </h2>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-gray-400">Highest Category</h3>
            <h2 className="text-3xl font-bold mt-2">{highestCategory}</h2>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-gray-400">Transactions</h3>
            <h2 className="text-3xl font-bold mt-2">
              {filteredExpenses.length}
            </h2>
          </div>
        </div>
      </div>
    </>
  );
}