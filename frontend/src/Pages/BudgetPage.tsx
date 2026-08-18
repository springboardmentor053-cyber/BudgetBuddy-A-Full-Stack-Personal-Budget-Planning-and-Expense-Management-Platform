import { useState } from "react";

import AddBudget from "../components/budget/AddBudget";
import BudgetTable from "../components/budget/BudgetTable";

function BudgetPage() {

  const [selectedBudget, setSelectedBudget] = useState<any>(null);

  return (

    <div className="p-8 text-gray-800 dark:text-white">

      <h1 className="text-4xl font-bold">
        Budget
      </h1>

      <p className="text-gray-500 dark:text-gray-400 mt-2">
        Manage monthly budgets.
      </p>

      <div className="mt-8">

        <AddBudget
          selectedBudget={selectedBudget}
          clearSelection={() => setSelectedBudget(null)}
        />

      </div>

      <div className="mt-8">

        <BudgetTable
          onEdit={setSelectedBudget}
        />

      </div>

    </div>

  );

}

export default BudgetPage;