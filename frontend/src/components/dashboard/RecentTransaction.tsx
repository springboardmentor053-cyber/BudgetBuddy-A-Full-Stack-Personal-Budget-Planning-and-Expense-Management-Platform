interface Props {
  transactions: any[];
}

function RecentTransactions({ transactions }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 p-6">

      
  <h2 className="text-xl font-semibold mb-5 text-gray-800 dark:text-white">
        Recent Transactions
      </h2>

      {transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No transactions found.
        </p>
      ) : (
        <div className="space-y-4">
          {transactions.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"
            >
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {item.title}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.category}
                </p>
              </div>

              <div className="text-red-600 dark:text-red-400 font-semibold">
                ₹{item.amount}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default RecentTransactions;