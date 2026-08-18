import { useEffect, useState } from "react";
import { addIncome,updateIncome } from "../../services/incomeService";

interface Props {
  selectedIncome: any;
  clearSelection: () => void;
}

function AddIncome({
  selectedIncome,
  clearSelection,
}: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("POCKET_MONEY");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (selectedIncome) {
      setTitle(selectedIncome.title);
      setAmount(selectedIncome.amount);
      setCategory(selectedIncome.source);
      setDate(selectedIncome.income_date);
    }
  }, [selectedIncome]);
  async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();

  try {

    if (selectedIncome) {

      await updateIncome(selectedIncome.id, {
           title,
           amount,
           source: category,
           income_date: date,
           description: "",
});

      alert("Income Updated Successfully!");

    } else {

      await addIncome({
         title,
         amount,
         source: category,
         income_date: date,
         description: "",
});

      alert("Income Added Successfully!");

    }
    setTitle("");
    setAmount("");
    setCategory("POCKET_MONEY");
    setDate("");

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
        {selectedIncome ? "Edit Income" : "Add Income"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <input
          type="text"
          placeholder="Income Title"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Amount"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
         <option value="POCKET_MONEY">Pocket Money</option>
         <option value="SCHOLARSHIP">Scholarship</option>
         <option value="SALARY">Salary</option>
         <option value="FREELANCING">Freelancing</option>
         <option value="BUSINESS">Business</option>
         <option value="OTHER">Other</option>
        </select>

        <input
          type="date"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-3 rounded-lg w-full hover:bg-green-700"
        >
          {selectedIncome ? "Update Income" : "Add Income"}
        </button>

      </form>

    </div>
  );
}

export default AddIncome;