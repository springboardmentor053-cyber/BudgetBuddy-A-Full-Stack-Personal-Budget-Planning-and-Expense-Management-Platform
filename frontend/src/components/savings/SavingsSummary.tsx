import { useEffect, useState } from "react";
import { getSavingsDashboard } from "../../services/savingsServices";

function SavingsSummary() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await getSavingsDashboard();
      setSummary(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!summary) return null;

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">

      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-gray-500 dark:text-gray-400">Total Goals</h3>
        <h1 className="text-3xl font-bold">
          {summary.total_goals}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-gray-500 dark:text-gray-400">Completed</h3>
        <h1 className="text-3xl text-green-600 font-bold">
          {summary.completed}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-gray-500 dark:text-gray-400">Active</h3>
        <h1 className="text-3xl text-yellow-600 font-bold">
          {summary.active}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-gray-500 dark:text-gray-400">
          Total Saved
        </h3>

        <h1 className="text-3xl text-indigo-600 font-bold">
          ₹{summary.total_saved}
        </h1>

      </div>

    </div>
  );
}

export default SavingsSummary;