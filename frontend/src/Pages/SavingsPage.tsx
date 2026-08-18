import { useState } from "react";
import SavingsSummary from "../components/savings/SavingsSummary";
import AddSavingsGoal from "../components/savings/AddSavingsGoal";
import SavingsTable from "../components/savings/SavingsTable";

function SavingsPage() {
  const [refresh, setRefresh] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  return (

    <div className="p-8 text-gray-800 dark:text-white">

      <h1 className="text-4xl font-bold">

        Savings Goals

      </h1>

      <p className="text-gray-500 dark:text-gray-400 mt-2">

        Track your savings progress and achieve your financial goals.

      </p>

      <div className="mt-8">
        <SavingsSummary />

        <AddSavingsGoal
            selectedGoal={selectedGoal}
            clearSelection={() => setSelectedGoal(null)}
            onSuccess={() => setRefresh(!refresh)}
        />
      </div>
      <div className="mt-8">

        <SavingsTable
          onEdit={setSelectedGoal}
          refresh={refresh}
/>

      </div>

    </div>

  );

}

export default SavingsPage;