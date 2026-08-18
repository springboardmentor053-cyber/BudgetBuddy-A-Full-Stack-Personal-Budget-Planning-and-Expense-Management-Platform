type SavingsProgressCardProps = {
  title: string;
  target: number;
  saved: number;
  targetDate: string;
};

function SavingsProgressCard({
  title,
  target,
  saved,
  targetDate,
}: SavingsProgressCardProps) {
  const progress = Math.min((saved / target) * 100, 100);

  const progressColor =
    progress < 30
      ? "bg-red-500"
      : progress < 70
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold mb-5">
        {title}
      </h2>

      <div className="flex justify-between text-gray-600 dark:text-gray-300 mb-2">
        <span>Saved</span>

        <span>
          ₹{saved.toLocaleString()} / ₹{target.toLocaleString()}
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">

        <div
          className={`${progressColor} h-4 rounded-full transition-all duration-500`}
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <div className="flex justify-between mt-3">

        <span className="font-semibold">
          {progress.toFixed(0)}%
        </span>

        <span className="text-gray-500 dark:text-gray-400">
          Target: {targetDate}
        </span>

      </div>

    </div>
  );
}

export default SavingsProgressCard;