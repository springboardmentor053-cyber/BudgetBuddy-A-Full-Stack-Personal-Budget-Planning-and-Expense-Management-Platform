import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";

export default function Expenses() {
  const expenses = [
    {
      id: 1,
      title: "Groceries",
      category: "Food",
      amount: 1200,
      date: "03 Jul 2026",
    },
    {
      id: 2,
      title: "Petrol",
      category: "Travel",
      amount: 1800,
      date: "02 Jul 2026",
    },
    {
      id: 3,
      title: "Netflix",
      category: "Entertainment",
      amount: 649,
      date: "01 Jul 2026",
    },
    {
      id: 4,
      title: "Shopping",
      category: "Shopping",
      amount: 2500,
      date: "29 Jun 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            Expenses
          </h1>

          <p className="text-gray-400 mt-2">
            Manage and track all your expenses.
          </p>
        </div>

        <button className="mt-4 md:mt-0 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
          <FaPlus />
          Add Expense
        </button>

      </div>

      {/* Search & Filter */}

      <div className="grid md:grid-cols-2 gap-6 mb-8">

        <div className="relative">

          <FaSearch className="absolute left-4 top-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search expenses..."
            className="w-full pl-12 p-3 rounded-xl bg-slate-800 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />

        </div>

        <select className="bg-slate-800 border border-slate-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
          <option>All Categories</option>
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Entertainment</option>
          <option>Education</option>
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

            {expenses.map((expense) => (

              <tr
                key={expense.id}
                className="border-b border-slate-700 hover:bg-slate-700"
              >

                <td className="p-4">
                  {expense.title}
                </td>

                <td className="p-4">
                  {expense.category}
                </td>

                <td className="p-4 text-red-400 font-semibold">
                  ₹ {expense.amount}
                </td>

                <td className="p-4">
                  {expense.date}
                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-4">

                    <button className="text-cyan-400 hover:text-cyan-300">
                      <FaEdit />
                    </button>

                    <button className="text-red-400 hover:text-red-300">
                      <FaTrash />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Summary Cards */}

      <div className="grid md:grid-cols-3 gap-6 mt-10">

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Total Expenses
          </h3>

          <h2 className="text-3xl font-bold text-red-400 mt-2">
            ₹ 6,149
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Highest Category
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            Shopping
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Transactions
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            4
          </h2>

        </div>

      </div>

    </div>
  );
}