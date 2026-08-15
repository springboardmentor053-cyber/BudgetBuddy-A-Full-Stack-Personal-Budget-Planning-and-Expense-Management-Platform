function DashboardCard({
  title,
  value,
  icon,
  color,
  percentage = "+0%",
  subtitle = "Compared to last month",
}) {
  return (
    <div className="bg-white rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6 border border-slate-100">

      <div className="flex justify-between items-start">

        <div>

          <p className="text-slate-500 text-sm font-medium">
            {title}
          </p>

          <h2 className="text-4xl font-bold text-slate-800 mt-4">
            {value}
          </h2>

          <div className="flex items-center gap-2 mt-5">

            <span className="bg-emerald-100 text-emerald-600 text-xs px-3 py-1 rounded-full font-semibold">
              {percentage}
            </span>

            <span className="text-slate-400 text-sm">
              {subtitle}
            </span>

          </div>

        </div>

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl ${color}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

export default DashboardCard;