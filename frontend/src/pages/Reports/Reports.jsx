import {
  FaChartPie,
  FaChartLine,
//   FaDownload,
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";

export default function Reports() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-10">

        <div>
          <h1 className="text-4xl font-bold">
            Financial Reports
          </h1>

          <p className="text-gray-400 mt-2">
            Analyze your financial performance and spending habits.
          </p>
        </div>

        <div className="flex gap-4 mt-5 md:mt-0">

          <button className="flex items-center gap-2 bg-red-500 hover:bg-red-400 px-5 py-3 rounded-xl text-white font-semibold">
            <FaFilePdf />
            PDF
          </button>

          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-400 px-5 py-3 rounded-xl text-slate-900 font-semibold">
            <FaFileExcel />
            Excel
          </button>

        </div>

      </div>

      {/* Summary Cards */}

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Total Income
          </h3>

          <h2 className="text-3xl font-bold text-green-400 mt-2">
            ₹70,000
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Total Expenses
          </h3>

          <h2 className="text-3xl font-bold text-red-400 mt-2">
            ₹45,000
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Total Savings
          </h3>

          <h2 className="text-3xl font-bold text-yellow-400 mt-2">
            ₹25,000
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Budget Used
          </h3>

          <h2 className="text-3xl font-bold text-cyan-400 mt-2">
            65%
          </h2>

        </div>

      </div>

      {/* Charts */}

      <div className="grid lg:grid-cols-2 gap-8">

        <div className="bg-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <FaChartLine className="text-green-400 text-2xl" />

            <h2 className="text-2xl font-semibold">
              Income vs Expenses
            </h2>

          </div>

          <div className="h-72 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-gray-500">

            Line Chart Placeholder

          </div>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <FaChartPie className="text-pink-400 text-2xl" />

            <h2 className="text-2xl font-semibold">
              Expense Categories
            </h2>

          </div>

          <div className="h-72 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-gray-500">

            Pie Chart Placeholder

          </div>

        </div>

      </div>

      {/* Monthly Report */}

      <div className="mt-10 bg-slate-800 rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Monthly Report
        </h2>

        <table className="w-full">

          <thead className="border-b border-slate-700">

            <tr>

              <th className="text-left py-3">
                Month
              </th>

              <th className="text-left py-3">
                Income
              </th>

              <th className="text-left py-3">
                Expenses
              </th>

              <th className="text-left py-3">
                Savings
              </th>

            </tr>

          </thead>

          <tbody>

            <tr className="border-b border-slate-700">

              <td className="py-4">
                July
              </td>

              <td className="text-green-400">
                ₹70,000
              </td>

              <td className="text-red-400">
                ₹45,000
              </td>

              <td className="text-yellow-400">
                ₹25,000
              </td>

            </tr>

            <tr>

              <td className="py-4">
                June
              </td>

              <td className="text-green-400">
                ₹65,000
              </td>

              <td className="text-red-400">
                ₹42,000
              </td>

              <td className="text-yellow-400">
                ₹23,000
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}