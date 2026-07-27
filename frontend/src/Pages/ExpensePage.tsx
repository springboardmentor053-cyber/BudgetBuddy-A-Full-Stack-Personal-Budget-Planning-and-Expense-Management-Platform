import { useState } from "react";

import AddExpense from "../components/expense/AddExpense";
import ExpenseTable from "../components/expense/ExpenseTable";

function ExpensePage() {

  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  return (

    <div className="p-8">

      <h1 className="text-4xl font-bold">
        Expense
      </h1>

      <p className="text-gray-500 mt-2">
        Track all your expenses.
      </p>

      <div className="mt-8">

        <AddExpense
          selectedExpense={selectedExpense}
          clearSelection={() => setSelectedExpense(null)}
        />

      </div>

      <div className="mt-8">

        <ExpenseTable
          onEdit={setSelectedExpense}
        />

      </div>

    </div>

  );

}

export default ExpensePage;