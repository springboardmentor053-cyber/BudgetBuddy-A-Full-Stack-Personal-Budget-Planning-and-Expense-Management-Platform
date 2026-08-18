type Props = {
  savings: any[];
};

function SavingsReport({ savings }: Props) {

  if (savings.length === 0)
    return <p>No Savings Goals</p>;

  return (

    <table className="w-full text-gray-800 dark:text-gray-200">

      <thead>

        <tr className="bg-gray-100 dark:bg-gray-700">

          <th className="border border-gray-200 dark:border-gray-600 p-3">Goal</th>
          <th className="border border-gray-200 dark:border-gray-600 p-3">Target</th>
          <th className="border border-gray-200 dark:border-gray-600 p-3">Saved</th>

        </tr>

      </thead>

      <tbody>

        {savings.map((goal, index) => (

          <tr key={index}>

            <td className="border border-gray-200 dark:border-gray-600 p-3">{goal.goal_name}</td>
            <td className="border border-gray-200 dark:border-gray-600 p-3">₹{goal.target_amount}</td>
            <td className="border border-gray-200 dark:border-gray-600 p-3">₹{goal.saved_amount}</td>

          </tr>

        ))}

      </tbody>

    </table>

  );
}

export default SavingsReport;