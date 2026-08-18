import { useState, useEffect } from "react";
import {
  addBudget,
  updateBudget,
} from "../../services/budgetServices";

interface Props {
  selectedBudget: any;
  clearSelection: () => void;
}

function AddBudget({
  selectedBudget,
  clearSelection,
}: Props) {

  const [category, setCategory] = useState("FOOD");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (selectedBudget) {
      setCategory(selectedBudget.category);
      setBudgetAmount(String(selectedBudget.budget_amount));
      setMonth(selectedBudget.month);
      setYear(selectedBudget.year);
    }
  }, [selectedBudget]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {

      if (selectedBudget) {

        await updateBudget(selectedBudget.id, {
          category,
          budget_amount: budgetAmount,
          month,
          year,
        });

        alert("Budget Updated Successfully!");

      } else {

        await addBudget({
          category,
          budget_amount: budgetAmount,
          month,
          year,
        });

        alert("Budget Added Successfully!");

      }

      // Clear Form
      setCategory("FOOD");
      setBudgetAmount("");
      setMonth("");
      setYear(new Date().getFullYear());

      clearSelection();

      window.location.reload();

    } catch (error) {
      console.log(error);
      alert("Operation Failed.");
    }
  }

  return (

    <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg rounded-xl p-6 mt-8">

      <h2 className="text-2xl font-bold mb-6">
        {selectedBudget ? "Edit Budget" : "Add Budget"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <select
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="FOOD">Food</option>
          <option value="TRAVEL">Travel</option>
          <option value="SHOPPING">Shopping</option>
          <option value="EDUCATION">Education</option>
          <option value="ENTERTAINMENT">Entertainment</option>
          <option value="HEALTHCARE">Healthcare</option>
          <option value="BILLS">Bills</option>
          <option value="MISCELLANEOUS">Miscellaneous</option>
        </select>

        <input
          type="number"
          placeholder="Budget Amount"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Month (Example: July)"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Year"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          required
        />

        <button
          type="submit"
          className="bg-purple-600 text-white w-full py-3 rounded-lg hover:bg-purple-700"
        >
          {selectedBudget ? "Update Budget" : "Save Budget"}
        </button>

      </form>

    </div>

  );
}

export default AddBudget;