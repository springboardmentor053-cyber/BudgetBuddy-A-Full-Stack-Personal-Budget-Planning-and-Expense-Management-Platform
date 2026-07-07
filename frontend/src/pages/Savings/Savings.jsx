import { FaPlus, FaPiggyBank } from "react-icons/fa";

export default function Savings() {
  const goals = [
    {
      id: 1,
      goal: "Emergency Fund",
      target: 100000,
      saved: 65000,
      deadline: "Dec 2026",
    },
    {
      id: 2,
      goal: "New Laptop",
      target: 80000,
      saved: 35000,
      deadline: "Oct 2026",
    },
    {
      id: 3,
      goal: "Vacation Trip",
      target: 50000,
      saved: 22000,
      deadline: "Jan 2027",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-10">

        <div>
          <h1 className="text-4xl font-bold">
            Savings Goals
          </h1>

          <p className="text-gray-400 mt-2">
            Keep track of your savings and achieve your financial goals.
          </p>
        </div>

        <button className="mt-4 md:mt-0 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 py-3 rounded-xl flex items-center gap-2">
          <FaPlus />
          Add Goal
        </button>

      </div>

      {/* Summary */}

      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-800 rounded-2xl p-6">

          <FaPiggyBank className="text-yellow-400 text-5xl mb-4" />

          <h3 className="text-gray-400">
            Total Saved
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            ₹1,22,000
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Active Goals
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            3
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6">

          <h3 className="text-gray-400">
            Overall Target
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            ₹2,30,000
          </h2>

        </div>

      </div>

      {/* Goals */}

      <div className="grid lg:grid-cols-2 gap-6">

        {goals.map((goal) => {

          const progress = (goal.saved / goal.target) * 100;

          return (

            <div
              key={goal.id}
              className="bg-slate-800 rounded-2xl p-6 shadow-lg"
            >

              <div className="flex justify-between items-center mb-5">

                <h2 className="text-2xl font-semibold">
                  {goal.goal}
                </h2>

                <span className="text-cyan-400">
                  {progress.toFixed(0)}%
                </span>

              </div>

              <div className="w-full bg-slate-700 h-4 rounded-full">

                <div
                  className="bg-green-400 h-4 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>

              </div>

              <div className="mt-5 space-y-2 text-gray-300">

                <p>
                  <strong>Saved:</strong> ₹ {goal.saved}
                </p>

                <p>
                  <strong>Target:</strong> ₹ {goal.target}
                </p>

                <p>
                  <strong>Remaining:</strong> ₹ {goal.target - goal.saved}
                </p>

                <p>
                  <strong>Deadline:</strong> {goal.deadline}
                </p>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}