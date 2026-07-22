import { FaEdit, FaTrash } from "react-icons/fa";

export default function ExpenseTable({
  expenses,
  onDelete,
  onEdit,
}) {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-700">

            <tr>

              <th className="p-4 text-left">Title</th>

              <th className="p-4 text-left">Category</th>

              <th className="p-4 text-left">Amount</th>

              <th className="p-4 text-left">Date</th>

              <th className="p-4 text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {expenses.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  className="text-center py-10 text-gray-400"
                >
                  No expenses found.
                </td>

              </tr>

            ) : (

              expenses.map((expense) => (

                <tr
                  key={expense.id}
                  className="border-b border-slate-700 hover:bg-slate-700"
                >

                  <td className="p-4">
                    {expense.title}
                  </td>

                  <td className="p-4">
                    {expense.category}
                  </td>

                  <td className="p-4 text-red-400">
                    ₹ {expense.amount}
                  </td>

                  <td className="p-4">
                    {expense.expense_date}
                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-4">

                      <button
                        onClick={() => onEdit(expense)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => onDelete(expense.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}