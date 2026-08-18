import { useState, useEffect } from "react";
import {
  createSavingsGoal,
  updateSavingsGoal,
} from "../../services/savingsServices";
interface Props{

selectedGoal:any;

clearSelection:()=>void;

onSuccess:()=>void;

}
function AddSavingsGoal({
  selectedGoal,
  clearSelection,
  onSuccess,
}: Props) {
  const [goalName, setGoalName] = useState(
    selectedGoal?.goal_name || ""
  );

  const [targetAmount, setTargetAmount] = useState(
    selectedGoal?.target_amount || ""
  );

  const [savedAmount, setSavedAmount] = useState(
    selectedGoal?.saved_amount || ""
  );

  const [targetDate, setTargetDate] = useState(
    selectedGoal?.target_date || ""
  );
useEffect(() => {

    if (selectedGoal) {

      setGoalName(selectedGoal.goal_name);

      setTargetAmount(selectedGoal.target_amount);

      setSavedAmount(selectedGoal.saved_amount);

      setTargetDate(selectedGoal.target_date);

    }

  }, [selectedGoal]);
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const data = {
        goal_name: goalName,
        target_amount: Number(targetAmount),
        saved_amount: Number(savedAmount),
        target_date: targetDate,
        status:
          Number(savedAmount) >= Number(targetAmount)
            ? "Completed"
            : "Active",
      };

      if (selectedGoal) {
        await updateSavingsGoal(
          selectedGoal.id,
          data
        );
      } else {
        await createSavingsGoal(data);
      }

      alert("Savings Goal Saved Successfully!");

      setGoalName("");
      setTargetAmount("");
      setSavedAmount("");
      setTargetDate("");

      clearSelection();
      setGoalName("");
      setTargetAmount("");
      setSavedAmount("");
      setTargetDate("");

      // Refresh page
      onSuccess();

    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        {selectedGoal
          ? "Edit Savings Goal"
          : "Add Savings Goal"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >

        <div>
          <label className="block mb-2 font-medium">
            Goal Name
          </label>

          <input
            type="text"
            value={goalName}
            onChange={(e) =>
              setGoalName(e.target.value)
            }
            placeholder="Laptop, Bike..."
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Target Amount
          </label>

          <input
            type="number"
            value={targetAmount}
            onChange={(e) =>
              setTargetAmount(e.target.value)
            }
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Saved Amount
          </label>

          <input
            type="number"
            value={savedAmount}
            onChange={(e) =>
              setSavedAmount(e.target.value)
            }
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Target Date
          </label>

          <input
            type="date"
            value={targetDate}
            onChange={(e) =>
              setTargetDate(e.target.value)
            }
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-4 py-3"
            required
          />
        </div>

        <div className="md:col-span-2 flex gap-4">

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl"
          >
            {selectedGoal
              ? "Update Goal"
              : "Save Goal"}
          </button>

          {selectedGoal && (
            <button
              type="button"
              onClick={() => {

                    clearSelection();

                    setGoalName("");

                    setTargetAmount("");

                    setSavedAmount("");

                    setTargetDate("");

                    }}
              className="bg-gray-300 hover:bg-gray-400 px-8 py-3 rounded-xl"
            >
              Cancel
            </button>
          )}

        </div>

      </form>

    </div>
  );
}

export default AddSavingsGoal;