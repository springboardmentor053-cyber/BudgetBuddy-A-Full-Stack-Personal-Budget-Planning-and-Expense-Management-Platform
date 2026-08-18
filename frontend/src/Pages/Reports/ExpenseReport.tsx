type Props = {
  expenses: any[];
};

function ExpenseReport({ expenses }: Props) {

  if (expenses.length === 0)
    return <p>No Expense Records</p>;

  return (

    <table className="w-full text-gray-800 dark:text-gray-200">

      <thead>

        <tr className="bg-gray-100 dark:bg-gray-700">

          <th className="border border-gray-200 dark:border-gray-600 p-3">Title</th>
          <th className="border border-gray-200 dark:border-gray-600 p-3">Category</th>
          <th className="border border-gray-200 dark:border-gray-600 p-3">Amount</th>
          <th className="border border-gray-200 dark:border-gray-600 p-3">Date</th>

        </tr>

      </thead>

      <tbody>

        {expenses.map((expense, index) => (

          <tr key={index}>

            <td className="border border-gray-200 dark:border-gray-600 p-3">{expense.title}</td>
            <td className="border border-gray-200 dark:border-gray-600 p-3">{expense.category}</td>
            <td className="border border-gray-200 dark:border-gray-600 p-3">₹{expense.amount}</td>
            <td className="border border-gray-200 dark:border-gray-600 p-3">{expense.date}</td>

          </tr>

        ))}

      </tbody>

    </table>

  );
}

export default ExpenseReport;