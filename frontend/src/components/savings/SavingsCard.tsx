interface Props {
  goal: any;
  onEdit: (goal: any) => void;
  onDelete: (id: number) => void;
}

function SavingsCard({
  goal,
  onEdit,
  onDelete,
}: Props) {

  const target = Number(goal.target_amount);
  const saved = Number(goal.saved_amount);

  const progress =
    target > 0 ? (saved / target) * 100 : 0;

  const remaining = Math.max(target - saved, 0);

  const completed = saved >= target;

  return (

    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition">
      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-2xl font-bold">
            {goal.goal_name}
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
               Target Date: {goal.target_date}
          </p>

          <p className="text-sm mt-2">

             {goal.days_left > 0 && (
                <span className="text-green-600 font-medium">
            🗓   {goal.days_left} Days Left
              </span>
              )}

    {goal.days_left === 0 && (
        <span className="text-yellow-600 font-medium">
            🎯 Due Today
        </span>
    )}

    {goal.days_left < 0 && (
        <span className="text-red-600 font-medium">
            ⚠ Overdue by {Math.abs(goal.days_left)} Days
        </span>
    )}

</p>

        </div>

        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            completed
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
          }`}
        >
          {completed ? "Completed" : "Active"}
        </span>

      </div>

      <div className="mt-6 space-y-3">

        <div className="flex justify-between">

          <span className="font-medium">
            Saved
          </span>

          <span>
            ₹{saved.toFixed(2)} / ₹{target.toFixed(2)}
          </span>

        </div>

        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">

          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress < 30
                ? "bg-red-500"
                : progress < 70
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <div className="flex justify-between text-sm">

          <span>
            {progress.toFixed(1)}%
          </span>

          <span>
            Remaining ₹{remaining.toFixed(2)}
          </span>

        </div>

      </div>

      <div className="flex gap-4 mt-8">

        <button
          onClick={() => onEdit(goal)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(goal.id)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl"
        >
          Delete
        </button>

      </div>

    </div>

  );

}

export default SavingsCard;