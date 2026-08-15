function RecentTransactions({ transactions = [] }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-bold text-slate-800">
            Recent Transactions
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Your latest financial activity
          </p>

        </div>

        <button className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition">
          View All
        </button>

      </div>


      {/* No Transactions */}

      {transactions.length === 0 ? (

        <div className="min-h-[260px] flex flex-col items-center justify-center text-center">

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">

            <span className="text-2xl">
              💳
            </span>

          </div>

          <h3 className="font-semibold text-slate-700">
            No Transactions Yet
          </h3>

          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Your latest income and expense transactions will appear here.
          </p>

        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-slate-200">

                <th className="text-left pb-3 text-sm font-semibold text-slate-500">
                  Transaction
                </th>

                <th className="text-left pb-3 text-sm font-semibold text-slate-500">
                  Category
                </th>

                <th className="text-right pb-3 text-sm font-semibold text-slate-500">
                  Amount
                </th>

              </tr>

            </thead>

            <tbody>

              {transactions.map((transaction, index) => (

                <tr
                  key={transaction.id || index}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                >

                  {/* Transaction */}

                  <td className="py-4">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">

                        <span className="text-lg">
                          💸
                        </span>

                      </div>

                      <div className="min-w-0">

                        <p className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {transaction.title}
                        </p>

                        <p className="text-xs text-slate-400 mt-0.5">
                          Expense
                        </p>

                      </div>

                    </div>

                  </td>


                  {/* Category */}

                  <td className="py-4">

                    <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {transaction.category || "Other"}
                    </span>

                  </td>


                  {/* Amount */}

                  <td className="py-4 text-right">

                    <span className="font-bold text-rose-600 whitespace-nowrap">
                      -₹{Number(transaction.amount).toLocaleString("en-IN")}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default RecentTransactions;