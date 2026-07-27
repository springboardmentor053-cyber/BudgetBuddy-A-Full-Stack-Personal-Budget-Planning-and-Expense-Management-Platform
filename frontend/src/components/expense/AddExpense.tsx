import { useEffect, useState } from "react";
import {
  addExpense,
  updateExpense,
} from "../../services/expenseService";

interface Props {
  selectedExpense: any;
  clearSelection: () => void;
}

function AddExpense({
  selectedExpense,
  clearSelection,
}: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (selectedExpense) {
      setTitle(selectedExpense.title);
      setAmount(selectedExpense.amount);
      setCategory(selectedExpense.category);
      setDate(selectedExpense.expense_date);
    }
  }, [selectedExpense]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      if (selectedExpense) {
        await updateExpense(selectedExpense.id, {
          
          title,
          amount,
          category,
          expense_date: date,
          description: "",

        });

        alert("Expense Updated Successfully!");
      } else {
        await addExpense({
          
         title,
         amount,
         category,
         expense_date: date,
         description: "",

        });

        alert("Expense Added Successfully!");
      }

      setTitle("");
      setAmount("");
      setCategory("FOOD");
      setDate("");

      clearSelection();

      window.location.reload();
    } catch (error) {
      console.log(error);
      alert("Operation Failed.");
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mt-8">

      <h2 className="text-2xl font-bold mb-6">
        {selectedExpense ? "Edit Expense" : "Add Expense"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        <input
          type="text"
          placeholder="Expense Title"
          className="w-full border rounded-lg p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Amount"
          className="w-full border rounded-lg p-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select
          className="w-full border rounded-lg p-3"
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
          type="date"
          className="w-full border rounded-lg p-3"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-red-600 text-white px-5 py-3 rounded-lg w-full hover:bg-red-700"
        >
          {selectedExpense ? "Update Expense" : "Add Expense"}
        </button>

      </form>

    </div>
  );
}

export default AddExpense;