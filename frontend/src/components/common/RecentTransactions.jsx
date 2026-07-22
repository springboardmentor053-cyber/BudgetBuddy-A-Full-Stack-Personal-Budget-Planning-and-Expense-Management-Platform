import React from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

export default function RecentTransactions({
  income = [],
  expenses = [],
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-8">

      {/* Recent Expenses */}

      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

        <h2 className="text-xl font-semibold mb-5 text-red-400">
          Recent Expenses
        </h2>

        {expenses.length === 0 ? (
          <p className="text-gray-400">
            No expenses found.
          </p>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex justify-between items-center py-3 border-b border-slate-700"
            >
              <div>

                <p className="font-semibold">
                  {expense.title}
                </p>

                <small className="text-gray-400">
                  {expense.category}
                </small>

              </div>

              <div className="flex items-center gap-2 text-red-400">

                <FaArrowDown />

                ₹ {Number(expense.amount).toLocaleString()}

              </div>

            </div>
          ))
        )}

      </div>

      {/* Recent Income */}

      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

        <h2 className="text-xl font-semibold mb-5 text-green-400">
          Recent Income
        </h2>

        {income.length === 0 ? (
          <p className="text-gray-400">
            No income found.
          </p>
        ) : (
          income.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-3 border-b border-slate-700"
            >
              <div>

                <p className="font-semibold">
                  {item.title}
                </p>

                <small className="text-gray-400">
                  {item.source}
                </small>

              </div>

              <div className="flex items-center gap-2 text-green-400">

                <FaArrowUp />

                ₹ {Number(item.amount).toLocaleString()}

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}