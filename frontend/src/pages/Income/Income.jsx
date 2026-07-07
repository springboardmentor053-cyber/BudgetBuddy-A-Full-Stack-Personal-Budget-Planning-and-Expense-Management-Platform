import { FaPlus, FaSearch, FaMoneyBillWave } from "react-icons/fa";

export default function Income() {
  const incomes = [
    {
      id: 1,
      source: "Salary",
      amount: 45000,
      date: "01 Jul 2026",
    },
    {
      id: 2,
      source: "Freelancing",
      amount: 8000,
      date: "28 Jun 2026",
    },
    {
      id: 3,
      source: "Part-Time Job",
      amount: 12000,
      date: "20 Jun 2026",
    },
    {
      id: 4,
      source: "Bonus",
      amount: 5000,
      date: "15 Jun 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            Income
          </h1>

          <p className="text-gray-400 mt-2">
            Manage all your income sources.
          </p>
        </div>

        <button className="mt-4 md:mt-0 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
          <FaPlus />
          Add Income
        </button>

      </div>

      {/* Search */}

      <div className="relative mb-8">

        <FaSearch className="absolute left-4 top-4 text-gray-400" />

        <input
          type="text"
          placeholder="Search income..."
          className="w-full pl-12 p-3 rounded-xl bg-slate-800 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />

      </div>

      {/* Income Table */}

      <div className="overflow-x-auto bg-slate-800 rounded-2xl">

        <table className="w-full">

          <thead className="bg-slate-700">

            <tr>
              <th className="p-4 text-left">Source</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Date</th>
            </tr>

          </thead>

          <tbody>

            {incomes.map((income) => (

              <tr
                key={income.id}
                className="border-b border-slate-700 hover:bg-slate-700"
              >

                <td className="p-4">
                  {income.source}
                </td>

                <td className="p-4 text-green-400 font-semibold">
                  ₹ {income.amount}
                </td>

                <td className="p-4">
                  {income.date}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Summary */}

      <div className="grid md:grid-cols-3 gap-6 mt-10">

        <div className="bg-slate-800 rounded-2xl p-6">

          <FaMoneyBillWave className="text-green-400 text-4xl mb-4"/>

          <h3 className="text-gray-400">
            Total Income
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            ₹70,000
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Main Source
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            Salary
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Income Records
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            4
          </h2>

        </div>

      </div>

    </div>
  );
}