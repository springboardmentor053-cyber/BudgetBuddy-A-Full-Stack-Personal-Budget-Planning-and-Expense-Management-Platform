import { useEffect, useState } from "react";
import SavingsCard from "./SavingsCard";
import {
  getSavingsGoals,
  deleteSavingsGoal,
} from "../../services/savingsServices";
import {
  createSavingsGoal,
  updateSavingsGoal,
} from "../../services/savingsServices";

interface Props {

    onEdit:(goal:any)=>void;

    refresh:boolean;

}

function SavingsTable({ onEdit,refresh }: Props) {
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    fetchGoals();
  }, [refresh]);

  const fetchGoals = async () => {
    try {
      const response = await getSavingsGoals();
      setGoals(response.data);
    } catch (error) {
      console.error("Error fetching savings goals:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this savings goal?"
    );

    if (!confirmDelete) return;

    try {
      await deleteSavingsGoal(id);

      // Refresh list
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {goals.length > 0 ? (
        goals.map((goal) => (
          <SavingsCard
            key={goal.id}
            goal={goal}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <div className="col-span-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl shadow-lg p-10 text-center">
          <h2 className="text-2xl font-bold">
            No Savings Goals Found
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Add your first savings goal.
          </p>
        </div>
      )}
    </div>
  );
}

export default SavingsTable;