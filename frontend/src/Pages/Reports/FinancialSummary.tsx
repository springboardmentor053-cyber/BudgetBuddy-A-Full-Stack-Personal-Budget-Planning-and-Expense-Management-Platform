type Props = {
  summary: any;
};

function FinancialSummary({ summary }: Props) {
  if (!summary) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

      <div className="bg-green-100 rounded-xl p-5 shadow">
        <h3 className="text-gray-800 dark:text-white">Total Income</h3>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          ₹{summary.financial_summary.total_income}
        </p>
      </div>

      <div className="bg-red-100 rounded-xl p-5 shadow">
        <h3 className="text-gray-800 dark:text-white">Total Expense</h3>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          ₹{summary.financial_summary.total_expense}
        </p>
      </div>

      <div className="bg-blue-100 rounded-xl p-5 shadow">
        <h3 className="text-gray-800 dark:text-white">Balance</h3>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          ₹{summary.financial_summary.current_balance}
        </p>
      </div>

      <div className="bg-purple-100 rounded-xl p-5 shadow">
        <h3 className="text-gray-800 dark:text-white">Savings</h3>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          ₹{summary.financial_summary.total_savings}
        </p>
      </div>

      <div className="bg-yellow-100 rounded-xl p-5 shadow">
        <h3 className="text-gray-800 dark:text-white">Budget Left</h3>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          ₹{summary.financial_summary.remaining_budget}
        </p>
      </div>

    </div>
  );
}

export default FinancialSummary;