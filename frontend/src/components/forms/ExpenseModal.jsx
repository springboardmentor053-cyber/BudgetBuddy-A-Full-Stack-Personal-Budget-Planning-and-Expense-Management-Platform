import { useState, useEffect } from "react";

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  expense,
}) 
{
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    description: "",
    expense_date: "",
  });
useEffect(() => {
  if (expense) {
    setFormData({
      title: expense.title || "",
      amount: expense.amount || "",
      category: expense.category || "Food",
      description: expense.description || "",
      expense_date: expense.expense_date || "",
    });
  } else {
    setFormData({
      title: "",
      amount: "",
      category: "Food",
      description: "",
      expense_date: "",
    });
  }
}, [expense]);
  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSave(formData);

    setFormData({
      title: "",
      amount: "",
      category: "Food",
      description: "",
      expense_date: "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-lg">

     <h2 className="text-2xl font-bold mb-6">
  {expense ? "Edit Expense" : "Add Expense"}
</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-700 mb-4"
            required
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-700 mb-4"
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-700 mb-4"
          >
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Entertainment</option>
            <option>Education</option>
            <option>Healthcare</option>
            <option>Bills</option>
            <option>Miscellaneous</option>
          </select>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-700 mb-4"
          />

          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-700 mb-6"
            required
          />

          <div className="flex justify-end gap-4">

            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 px-5 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
  type="submit"
  className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2 rounded-lg font-semibold"
>
  {expense ? "Update" : "Save"}
</button>
          </div>

        </form>

      </div>

    </div>
  );
}