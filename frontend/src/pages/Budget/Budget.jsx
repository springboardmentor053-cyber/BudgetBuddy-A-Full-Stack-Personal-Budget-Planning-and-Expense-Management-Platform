import { FaPlus, FaWallet } from "react-icons/fa";

export default function Budget() {
  const budgets = [
    {
      category: "Food",
      limit: 8000,
      spent: 4200,
    },
    {
      category: "Travel",
      limit: 5000,
      spent: 2500,
    },
    {
      category: "Shopping",
      limit: 10000,
      spent: 7800,
    },
    {
      category: "Entertainment",
      limit: 4000,
      spent: 1200,
    },
  ];

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

        <button className="mt-4 md:mt-0 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
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
            ₹27,000
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Total Spent
          </h3>

          <h2 className="text-3xl font-bold text-red-400 mt-2">
            ₹15,700
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Remaining Budget
          </h3>

          <h2 className="text-3xl font-bold text-green-400 mt-2">
            ₹11,300
          </h2>

        </div>

      </div>

      {/* Budget Cards */}

      <div className="grid md:grid-cols-2 gap-6">

        {budgets.map((budget, index) => {

          const progress = (budget.spent / budget.limit) * 100;

          return (

            <div
              key={index}
              className="bg-slate-800 rounded-2xl p-6"
            >

              <div className="flex justify-between mb-4">

                <h2 className="text-xl font-semibold">
                  {budget.category}
                </h2>

                <span className="text-cyan-400">
                  ₹ {budget.limit}
                </span>

              </div>

              <div className="w-full h-4 bg-slate-700 rounded-full">

                <div
                  className="h-4 bg-cyan-400 rounded-full"
                  style={{
                    width: `${progress}%`,
                  }}
                ></div>

              </div>

              <div className="flex justify-between mt-3 text-gray-400">

                <span>
                  Spent: ₹ {budget.spent}
                </span>

                <span>
                  Left: ₹ {budget.limit - budget.spent}
                </span>

              </div>

            </div>

          );
        })}

      </div>

    </div>
  );
}