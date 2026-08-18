import { useState } from "react";

import AddIncome from "../components/income/AddIncome";
import IncomeTable from "../components/income/IncomeTable";

function IncomePage() {

  const [selectedIncome, setSelectedIncome] = useState<any>(null);

  return (

    <div className="p-8 text-gray-800 dark:text-white">

      <h1 className="text-4xl font-bold">

        Income

      </h1>

      <p className="text-gray-500 dark:text-gray-400 mt-2">

        Track and manage all your income.

      </p>

      <div className="mt-8">

        <AddIncome

          selectedIncome={selectedIncome}

          clearSelection={() => setSelectedIncome(null)}

        />

      </div>

      <div className="mt-8">

        <IncomeTable

          onEdit={setSelectedIncome}

        />

      </div>

    </div>

  );

}

export default IncomePage;