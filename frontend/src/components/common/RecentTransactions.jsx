import { FaArrowDown, FaArrowUp } from "react-icons/fa";

export default function RecentTransactions({
  income = [],
  expenses = [],
}) {
  const TransactionCard = ({
    title,
    data,
    type,
    color,
    bg,
    icon,
    subtitleKey,
  }) => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 h-[430px] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${color}`}>
            {title}
          </h2>

          <p className="text-sm text-slate-500">
            {data.length} Transaction{data.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3">

        {data.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-slate-400">
            <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center mb-3`}>
              {icon}
            </div>

            <p>No transactions found.</p>
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all duration-200"
            >
              <div>

                <h3 className="font-semibold text-slate-800">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-500">
                  {item[subtitleKey]}
                </p>

              </div>

              <div className="text-right">

                <p className={`font-bold text-lg ${color}`}>
                  ₹ {Number(item.amount).toLocaleString("en-IN")}
                </p>

                <p className="text-xs text-slate-400">
                  Today
                </p>

              </div>
            </div>
          ))
        )}

      </div>

    </div>
  );

  return (
    <div className="grid xl:grid-cols-2 gap-6 mt-8">

      <TransactionCard
        title="Recent Expenses"
        data={expenses}
        color="text-red-600"
        bg="bg-red-100"
        subtitleKey="category"
        icon={<FaArrowDown className="text-red-600 text-xl" />}
      />

      <TransactionCard
        title="Recent Income"
        data={income}
        color="text-green-600"
        bg="bg-green-100"
        subtitleKey="source"
        icon={<FaArrowUp className="text-green-600 text-xl" />}
      />

    </div>
  );
}