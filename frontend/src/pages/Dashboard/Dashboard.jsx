import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaPlus,
  FaFileInvoiceDollar,
  FaChartPie,
} from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-10">

        <div>
          <h1 className="text-4xl font-bold">
            Dashboard
          </h1>

          <p className="text-gray-400 mt-2">
            Welcome back! Here's your financial overview.
          </p>
        </div>

        <button className="mt-5 md:mt-0 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 py-3 rounded-xl flex items-center gap-2">
          <FaPlus />
          Add Transaction
        </button>

      </div>

      {/* Statistics */}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

          <FaWallet className="text-cyan-400 text-4xl mb-4" />

          <h3 className="text-gray-400">
            Total Balance
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            ₹75,000
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

          <FaArrowUp className="text-green-400 text-4xl mb-4" />

          <h3 className="text-gray-400">
            Monthly Income
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            ₹45,000
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

          <FaArrowDown className="text-red-400 text-4xl mb-4" />

          <h3 className="text-gray-400">
            Monthly Expenses
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            ₹18,500
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

          <FaPiggyBank className="text-yellow-400 text-4xl mb-4" />

          <h3 className="text-gray-400">
            Savings
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            ₹26,500
          </h2>

        </div>

      </div>

      {/* Recent Transactions */}

      <div className="mt-10 grid lg:grid-cols-2 gap-8">

        <div className="bg-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-5">

            <FaFileInvoiceDollar className="text-cyan-400 text-2xl" />

            <h2 className="text-2xl font-semibold">
              Recent Transactions
            </h2>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between border-b border-slate-700 pb-3">
              <span>🍔 Food</span>
              <span className="text-red-400">
                - ₹450
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-700 pb-3">
              <span>💼 Salary</span>
              <span className="text-green-400">
                + ₹45,000
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-700 pb-3">
              <span>🛒 Shopping</span>
              <span className="text-red-400">
                - ₹1,250
              </span>
            </div>

            <div className="flex justify-between">
              <span>🚗 Travel</span>
              <span className="text-red-400">
                - ₹800
              </span>
            </div>

          </div>

        </div>

        {/* Analytics */}

        <div className="bg-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-5">

            <FaChartPie className="text-pink-400 text-2xl" />

            <h2 className="text-2xl font-semibold">
              Analytics
            </h2>

          </div>

          <div className="h-72 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center text-gray-500 text-lg">

            Charts will appear here

          </div>

        </div>

      </div>

      {/* Quick Actions */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-6">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-4 gap-5">

          <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-xl py-4">
            Add Expense
          </button>

          <button className="bg-green-500 hover:bg-green-400 text-slate-900 font-semibold rounded-xl py-4">
            Add Income
          </button>

          <button className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold rounded-xl py-4">
            Create Budget
          </button>

          <button className="bg-pink-500 hover:bg-pink-400 text-slate-900 font-semibold rounded-xl py-4">
            View Reports
          </button>

        </div>

      </div>

    </div>
  );
}